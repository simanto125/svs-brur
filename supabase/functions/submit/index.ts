import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BUCKET = "svs-media";
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_BOOK_BYTES = 50 * 1024 * 1024;
const IMAGE_EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const COMMITTEE_DESIGNATIONS = [
  "President",
  "Vice President",
  "General Secretary",
  "Assistant General Secretary",
  "Treasurer",
  "Cultural Secretary",
  "Religious Affairs Secretary",
  "Executive Member",
];

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type Payload = Record<string, unknown>;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function text(value: unknown, field: string, max = 300, required = true): string | null {
  if (value === undefined || value === null || value === "") {
    if (required) throw new HttpError(400, `${field} is required`);
    return null;
  }
  if (typeof value !== "string" || value.trim().length === 0 || value.length > max) {
    throw new HttpError(400, `${field} is invalid`);
  }
  return value.trim();
}

function oneOf(value: unknown, field: string, options: string[]): string {
  const v = text(value, field, 100)!;
  if (!options.includes(v)) throw new HttpError(400, `${field} is not allowed`);
  return v;
}

function checkPhone(value: string | null, field: string) {
  if (value !== null && !/^\+?[\d\s-]{7,20}$/.test(value)) throw new HttpError(400, `${field} is invalid`);
}

async function uploadPhoto(file: unknown): Promise<string | null> {
  if (!file) return null;
  const f = file as { type?: unknown; data?: unknown };
  if (typeof f.type !== "string" || !IMAGE_EXT[f.type] || typeof f.data !== "string") {
    throw new HttpError(400, "Photo must be a JPG, PNG, or WEBP image");
  }
  const bytes = Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0));
  if (bytes.byteLength > MAX_FILE_BYTES) throw new HttpError(400, "Photo is larger than 4 MB");
  const path = `pending-photos/${crypto.randomUUID()}.${IMAGE_EXT[f.type]}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: f.type });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function createBookUpload(size: unknown) {
  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) {
    throw new HttpError(400, "Book file size is invalid");
  }
  if (size > MAX_BOOK_BYTES) throw new HttpError(400, "PDF is larger than 50 MB");
  const path = `book-pending/${crypto.randomUUID()}.pdf`;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) throw error;
  return { path, token: data.token };
}

async function verifyBookPdf(path: unknown): Promise<string> {
  const match = typeof path === "string" ? /^book-pending\/([0-9a-f-]{36}\.pdf)$/.exec(path) : null;
  if (!match) throw new HttpError(400, "Book PDF upload is invalid");
  const name = match[1];
  const { data, error } = await supabase.storage.from(BUCKET).list("book-pending", { search: name, limit: 1 });
  if (error) throw error;
  const file = data?.find((f) => f.name === name);
  const mimetype = (file?.metadata as { mimetype?: string } | undefined)?.mimetype;
  if (!file || mimetype !== "application/pdf") {
    await supabase.storage.from(BUCKET).remove([`book-pending/${name}`]);
    throw new HttpError(400, "Book PDF was not uploaded correctly");
  }
  return supabase.storage.from(BUCKET).getPublicUrl(`book-pending/${name}`).data.publicUrl;
}

async function getSettings() {
  const { data, error } = await supabase
    .from("settings")
    .select("committee_window_open, committee_passcode")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data as { committee_window_open: boolean; committee_passcode: string };
}

async function assertPasscode(passcode: unknown) {
  const settings = await getSettings();
  if (typeof passcode !== "string" || passcode !== settings.committee_passcode) {
    throw new HttpError(403, "Incorrect committee passcode");
  }
  return settings;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function uuid(value: unknown, field: string): string {
  const v = text(value, field, 36)!;
  if (!/^[0-9a-f-]{36}$/i.test(v)) throw new HttpError(400, `${field} is invalid`);
  return v;
}

function quizStatus(q: { starts_at: string; expires_at: string }): "upcoming" | "open" | "closed" {
  const now = Date.now();
  if (now < Date.parse(q.starts_at)) return "upcoming";
  if (now >= Date.parse(q.expires_at)) return "closed";
  return "open";
}

async function loadQuiz(quizId: string) {
  const { data, error } = await supabase
    .from("quizzes")
    .select("id, title, description, starts_at, expires_at")
    .eq("id", quizId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, "Quiz not found");
  return data;
}

async function run(action: string, p: Payload): Promise<unknown> {
  switch (action) {
    case "window_status": {
      const settings = await getSettings();
      return { open: settings.committee_window_open };
    }

    case "get_site_info": {
      const { data, error } = await supabase
        .from("settings")
        .select("site_name, site_description, logo_url")
        .eq("id", 1)
        .single();
      if (error) throw error;
      return { data };
    }

    case "verify_passcode":
      await assertPasscode(p.passcode);
      return { ok: true };

    case "submit_member": {
      const blood = oneOf(p.blood_group, "Blood group", BLOOD_GROUPS);
      const phone = text(p.phone, "Phone number", 20)!;
      const whatsapp = text(p.whatsapp, "WhatsApp number", 20, false);
      const email = text(p.email, "Email", 120, false);
      checkPhone(phone, "Phone number");
      checkPhone(whatsapp, "WhatsApp number");
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Email is invalid");
      const photo_url = await uploadPhoto(p.photo);
      const { error } = await supabase.from("pending_members").insert({
        name: text(p.name, "Full name", 120)!,
        department: text(p.department, "Department", 150)!,
        batch: text(p.batch, "Batch / session", 20)!,
        blood_group: blood,
        phone,
        whatsapp,
        email,
        permanent_address: text(p.permanent_address, "Permanent address", 300)!,
        photo_url,
      });
      if (error) throw error;
      return { success: true };
    }

    case "submit_committee": {
      const settings = await getSettings();
      if (!settings.committee_window_open) {
        throw new HttpError(403, "Committee registration is currently closed. Contact the Executive Board.");
      }
      await assertPasscode(p.passcode);
      const phone = text(p.phone, "Phone number", 20, false);
      checkPhone(phone, "Phone number");
      const photo_url = await uploadPhoto(p.photo);
      const { error } = await supabase.from("pending_committee").insert({
        name: text(p.name, "Full name", 120)!,
        designation: oneOf(p.designation, "Designation", COMMITTEE_DESIGNATIONS),
        department: text(p.department, "Department", 150)!,
        batch: text(p.batch, "Batch / session", 20)!,
        phone,
        blood_group: oneOf(p.blood_group, "Blood group", BLOOD_GROUPS),
        photo_url,
      });
      if (error) throw error;
      return { success: true };
    }

    case "create_book_upload":
      return createBookUpload(p.size);

    case "record_download": {
      const kind = oneOf(p.kind, "Kind", ["book", "notice"]);
      const id = text(p.id, "Id", 36)!;
      if (!/^[0-9a-f-]{36}$/.test(id)) throw new HttpError(400, "Id is invalid");
      const { data, error } = await supabase.rpc("bump_download", { p_kind: kind, p_id: id });
      if (error) throw error;
      if (data === null) throw new HttpError(404, "Item not found");
      return { download_count: data };
    }

    case "submit_book": {
      const pdf_url = await verifyBookPdf(p.pdf_path);
      const { error } = await supabase.from("books").insert({
        title: text(p.title, "Title", 200)!,
        author: text(p.author, "Author", 120, false),
        description: text(p.description, "Description", 1000, false),
        pdf_url,
        submitted_by: text(p.submitted_by, "Your name", 120, false),
        status: "pending",
      });
      if (error) throw error;
      return { success: true };
    }

    case "list_quizzes": {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title, description, starts_at, expires_at, quiz_questions(count)")
        .order("starts_at", { ascending: false });
      if (error) throw error;
      return {
        data: (data ?? []).map((q) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          starts_at: q.starts_at,
          expires_at: q.expires_at,
          status: quizStatus(q),
          question_count: (q.quiz_questions as unknown as { count: number }[])?.[0]?.count ?? 0,
        })),
      };
    }

    case "get_quiz": {
      const quiz = await loadQuiz(uuid(p.quiz_id, "Quiz"));
      if (quizStatus(quiz) !== "open") throw new HttpError(403, "This quiz is not open right now");
      const { data: questions, error } = await supabase
        .from("quiz_questions")
        .select("id, position, question, options")
        .eq("quiz_id", quiz.id)
        .order("position", { ascending: true });
      if (error) throw error;
      return { data: { ...quiz, questions: questions ?? [] } };
    }

    case "submit_quiz": {
      const quizId = uuid(p.quiz_id, "Quiz");
      const quiz = await loadQuiz(quizId);
      if (quizStatus(quiz) !== "open") throw new HttpError(403, "This quiz is closed");
      const name = text(p.name, "Full name", 120)!;
      const email = text(p.email, "Email", 120)!.toLowerCase();
      if (!EMAIL_RE.test(email)) throw new HttpError(400, "Email is invalid");
      const phone = text(p.phone, "Phone number", 20, false);
      checkPhone(phone, "Phone number");
      const department = text(p.department, "Department", 150)!;
      const batch = text(p.batch, "Batch / session", 20)!;
      if (!p.answers || typeof p.answers !== "object" || Array.isArray(p.answers)) {
        throw new HttpError(400, "Answers are invalid");
      }
      const answers = p.answers as Record<string, unknown>;

      const { data: questions, error: qError } = await supabase
        .from("quiz_questions")
        .select("id, correct_index")
        .eq("quiz_id", quizId);
      if (qError) throw qError;
      if (!questions?.length) throw new HttpError(400, "This quiz has no questions yet");

      let score = 0;
      for (const q of questions) {
        const given = answers[q.id];
        if (given === undefined || given === null) continue;
        if (!Number.isInteger(given) || (given as number) < 0 || (given as number) > 3) {
          throw new HttpError(400, "Answers are invalid");
        }
        if (given === q.correct_index) score++;
      }
      const total = questions.length;
      const percent = Math.round((score / total) * 100);

      const { error: insertError } = await supabase.from("quiz_attempts").insert({
        quiz_id: quizId,
        name,
        email,
        phone,
        department,
        batch,
        score,
        total,
        percent,
      });
      if (insertError) {
        if (insertError.code === "23505") throw new HttpError(409, "This email has already taken this quiz");
        throw insertError;
      }

      const { count, error: rankError } = await supabase
        .from("quiz_attempts")
        .select("id", { count: "exact", head: true })
        .eq("quiz_id", quizId)
        .gt("score", score);
      if (rankError) throw rankError;

      let certificate_code: string | null = null;
      if (percent === 100) {
        const { data: cert, error: certError } = await supabase
          .from("certificates")
          .insert({
            recipient_name: name,
            email,
            quiz_id: quizId,
            quiz_title: quiz.title,
            percent,
            reason: "perfect_score",
          })
          .select("code")
          .single();
        if (certError) throw certError;
        certificate_code = cert.code;
      }

      return { score, total, percent, rank: (count ?? 0) + 1, certificate_code };
    }

    case "get_leaderboard": {
      const quizId = uuid(p.quiz_id, "Quiz");
      await loadQuiz(quizId);
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("name, department, batch, score, total, percent, submitted_at")
        .eq("quiz_id", quizId)
        .order("score", { ascending: false })
        .order("submitted_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      let rank = 0;
      let previousScore: number | null = null;
      const ranked = (data ?? []).map((row, index) => {
        if (row.score !== previousScore) rank = index + 1;
        previousScore = row.score;
        return { ...row, rank };
      });
      return { data: ranked };
    }

    case "get_certificate": {
      const code = text(p.code, "Certificate code", 40)!;
      if (!/^[0-9a-f]{32}$/.test(code)) throw new HttpError(400, "Certificate code is invalid");
      const { data: certificate, error: certError } = await supabase
        .from("certificates")
        .select("code, recipient_name, quiz_title, percent, reason, issued_at")
        .eq("code", code)
        .maybeSingle();
      if (certError) throw certError;
      if (!certificate) throw new HttpError(404, "Certificate not found");
      const { data: settings, error: settingsError } = await supabase
        .from("settings")
        .select("site_name, logo_url, president_name, president_signature_url, general_secretary_name, general_secretary_signature_url")
        .eq("id", 1)
        .single();
      if (settingsError) throw settingsError;
      return { data: { certificate, settings } };
    }

    default:
      throw new HttpError(400, "Unknown action");
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as { action?: unknown; payload?: Payload };
    if (typeof body.action !== "string") throw new HttpError(400, "Missing action");
    return json(await run(body.action, body.payload ?? {}));
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Something went wrong";
    return json({ error: message }, status);
  }
});
