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
const DOCUMENT_EXT: Record<string, string> = { ...IMAGE_EXT, "application/pdf": "pdf" };
const GALLERY_CATEGORIES = ["Pujas", "Cultural Programs", "Social Work"];
const NOTICE_TYPES = ["Notice", "Constitution", "Study Resource"];
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

function text(value: unknown, field: string, max = 500, required = true): string | null {
  if (value === undefined || value === null || value === "") {
    if (required) throw new HttpError(400, `${field} is required`);
    return null;
  }
  if (typeof value !== "string" || value.trim().length === 0 || value.length > max) {
    throw new HttpError(400, `${field} is invalid`);
  }
  return value.trim();
}

function choice(value: unknown, field: string, options: string[]): string {
  const v = text(value, field, 100)!;
  if (!options.includes(v)) throw new HttpError(400, `${field} is not allowed`);
  return v;
}

function checkPhone(value: string | null, field: string) {
  if (value !== null && !/^\+?[\d\s-]{7,20}$/.test(value)) throw new HttpError(400, `${field} is invalid`);
}

function youtubeEmbed(input: string | null): string | null {
  if (!input) return null;
  const match = input.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})/);
  if (!match) throw new HttpError(400, "Video must be a YouTube link");
  return `https://www.youtube.com/embed/${match[1]}`;
}

async function uploadFile(
  file: unknown,
  folder: string,
  extensions: Record<string, string>,
): Promise<{ url: string; bytes: number } | null> {
  if (!file) return null;
  const f = file as { type?: unknown; data?: unknown };
  if (typeof f.type !== "string" || !extensions[f.type] || typeof f.data !== "string") {
    throw new HttpError(400, "Unsupported file type");
  }
  const bytes = Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0));
  if (bytes.byteLength > MAX_FILE_BYTES) throw new HttpError(400, "File is larger than 4 MB");
  const path = `${folder}/${crypto.randomUUID()}.${extensions[f.type]}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: f.type });
  if (error) throw error;
  return { url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl, bytes: bytes.byteLength };
}

async function createBookUpload(size: unknown) {
  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) {
    throw new HttpError(400, "Book file size is invalid");
  }
  if (size > MAX_BOOK_BYTES) throw new HttpError(400, "PDF is larger than 50 MB");
  const path = `books/${crypto.randomUUID()}.pdf`;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) throw error;
  return { path, token: data.token };
}

async function verifyBookPdf(path: unknown): Promise<string> {
  const match = typeof path === "string" ? /^books\/([0-9a-f-]{36}\.pdf)$/.exec(path) : null;
  if (!match) throw new HttpError(400, "Book PDF upload is invalid");
  const name = match[1];
  const { data, error } = await supabase.storage.from(BUCKET).list("books", { search: name, limit: 1 });
  if (error) throw error;
  const file = data?.find((f) => f.name === name);
  const mimetype = (file?.metadata as { mimetype?: string } | undefined)?.mimetype;
  if (!file || mimetype !== "application/pdf") {
    await supabase.storage.from(BUCKET).remove([`books/${name}`]);
    throw new HttpError(400, "Book PDF was not uploaded correctly");
  }
  return supabase.storage.from(BUCKET).getPublicUrl(`books/${name}`).data.publicUrl;
}

function dateValue(value: unknown, field: string): string {
  const ms = Date.parse(text(value, field, 40)!);
  if (Number.isNaN(ms)) throw new HttpError(400, `${field} is invalid`);
  return new Date(ms).toISOString();
}

function uuidValue(value: unknown, field: string): string {
  const v = text(value, field, 36)!;
  if (!/^[0-9a-f-]{36}$/i.test(v)) throw new HttpError(400, `${field} is invalid`);
  return v;
}

async function listPending(table: "pending_members" | "pending_committee") {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

async function removePending(table: "pending_members" | "pending_committee", id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id).eq("status", "pending");
  if (error) throw error;
}

type PersonTable = "members" | "committee" | "advisors";

type FieldRule = { label: string; required: boolean; max?: number };

const FACEBOOK_URL = /^https?:\/\/(www\.|m\.|web\.)?(facebook|fb)\.com\/.+/i;

const PERSON_FIELDS: Record<PersonTable, Record<string, FieldRule>> = {
  members: {
    name: { label: "Full name", required: true, max: 120 },
    department: { label: "Department", required: true, max: 150 },
    batch: { label: "Batch / session", required: true, max: 20 },
    blood_group: { label: "Blood group", required: false, max: 10 },
    phone: { label: "Phone number", required: false, max: 20 },
    whatsapp: { label: "WhatsApp number", required: false, max: 20 },
    email: { label: "Email", required: false, max: 120 },
    permanent_address: { label: "Permanent address", required: false, max: 300 },
  },
  committee: {
    name: { label: "Full name", required: true, max: 120 },
    designation: { label: "Designation", required: true, max: 100 },
    department: { label: "Department", required: true, max: 150 },
    batch: { label: "Batch / session", required: true, max: 20 },
    blood_group: { label: "Blood group", required: false, max: 10 },
    phone: { label: "Phone number", required: false, max: 20 },
  },
  advisors: {
    name: { label: "Full name", required: true, max: 120 },
    academic_designation: { label: "Academic designation", required: true, max: 120 },
    department: { label: "Department", required: true, max: 150 },
    blessing: { label: "Blessing", required: false, max: 1000 },
  },
};

const PERSON_FOLDER: Record<PersonTable, string> = {
  members: "member-photos",
  committee: "committee-photos",
  advisors: "advisor-photos",
};

async function updatePendingCommittee(p: Payload) {
  const id = text(p.id, "id")!;
  const values = (p.values ?? {}) as Payload;
  const update = {
    name: text(values.name, "Full name", 120)!,
    designation: choice(values.designation, "Designation", COMMITTEE_DESIGNATIONS),
    department: text(values.department, "Department", 150)!,
    batch: text(values.batch, "Batch / session", 20)!,
    phone: text(values.phone, "Phone number", 20, false),
    blood_group: choice(values.blood_group, "Blood group", BLOOD_GROUPS),
  };
  checkPhone(update.phone, "Phone number");
  const photo = await uploadFile(p.photo, "pending-photos", IMAGE_EXT);
  const next: Record<string, unknown> = { ...update };
  if (photo) next.photo_url = photo.url;
  const { data, error } = await supabase
    .from("pending_committee")
    .update(next)
    .eq("id", id)
    .eq("status", "pending")
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new HttpError(404, "Submission not found or already reviewed");
  return { success: true };
}

async function updatePerson(table: PersonTable, p: Payload) {
  const id = text(p.id, "id")!;
  const values = (p.values ?? {}) as Payload;
  const update: Record<string, string | null> = {};

  for (const [name, rule] of Object.entries(PERSON_FIELDS[table])) {
    update[name] = text(values[name], rule.label, rule.max ?? 300, rule.required);
  }
  if (update.blood_group && !BLOOD_GROUPS.includes(update.blood_group)) {
    throw new HttpError(400, "Blood group is not allowed");
  }
  if (update.designation && !COMMITTEE_DESIGNATIONS.includes(update.designation)) {
    throw new HttpError(400, "Designation is not allowed");
  }
  checkPhone(update.phone ?? null, "Phone number");
  checkPhone(update.whatsapp ?? null, "WhatsApp number");
  if (update.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(update.email)) {
    throw new HttpError(400, "Email is invalid");
  }

  const facebook = text(values.facebook_url, "Facebook link", 300, false);
  if (facebook && !FACEBOOK_URL.test(facebook)) {
    throw new HttpError(400, "Facebook link must be a facebook.com URL");
  }
  update.facebook_url = facebook;

  const photo = await uploadFile(p.photo, PERSON_FOLDER[table], IMAGE_EXT);
  if (photo) update.photo_url = photo.url;

  const { data, error } = await supabase.from(table).update(update).eq("id", id).select("id");
  if (error) throw error;
  if (!data?.length) throw new HttpError(404, "Person not found");
  return { success: true };
}

const EVENT_CATEGORIES = ["Puja", "Cultural Program", "Social Work"];

async function eventValues(p: Payload) {
  const date = text(p.date, "Date", 40)!;
  if (Number.isNaN(new Date(date).getTime())) throw new HttpError(400, "Date is invalid");
  return {
    title: text(p.title, "Title", 150)!,
    date,
    venue: text(p.venue, "Venue", 150)!,
    description: text(p.description, "Description", 2000, false),
    category: choice(p.category, "Category", EVENT_CATEGORIES),
    status: new Date(date) > new Date() ? "upcoming" : "past",
    video_url: youtubeEmbed(text(p.video_url, "Video link", 300, false)),
  };
}

function pastCommitteeYear(value: unknown): string {
  const match = text(value, "Year", 20)!.match(/^(\d{4})\s*[-/]\s*(\d{2}|\d{4})$/);
  if (!match) throw new HttpError(400, "Year must look like 2019-2020 or 2019-20");
  const start = Number(match[1]);
  const end = match[2].length === 2 ? Math.floor(start / 100) * 100 + Number(match[2]) : Number(match[2]);
  if (end !== start + 1) throw new HttpError(400, "Year must cover two consecutive years");
  return `${start}-${end}`;
}

function pastMemberValues(p: Payload) {
  const order = p.sort_order === undefined || p.sort_order === "" ? 0 : Number(p.sort_order);
  if (!Number.isInteger(order) || order < 0 || order > 999) throw new HttpError(400, "Display order is invalid");
  return {
    year: pastCommitteeYear(p.year),
    name: text(p.name, "Full name", 120)!,
    designation: text(p.designation, "Designation", 100)!,
    department: text(p.department, "Department", 150)!,
    batch: text(p.batch, "Batch / session", 20, false),
    sort_order: order,
  };
}

async function run(action: string, p: Payload): Promise<unknown> {
  switch (action) {
    case "verify":
      return { ok: true };

    case "list_pending_members":
      return { data: await listPending("pending_members") };

    case "approve_member": {
      const id = text(p.id, "id")!;
      const { data: row, error: readErr } = await supabase
        .from("pending_members")
        .select("name,department,batch,blood_group,phone,whatsapp,email,permanent_address,photo_url")
        .eq("id", id)
        .eq("status", "pending")
        .maybeSingle();
      if (readErr) throw readErr;
      if (!row) throw new HttpError(404, "Submission not found or already reviewed");
      const { error } = await supabase.from("members").insert({ ...row, role: "Current Member" });
      if (error) throw error;
      await removePending("pending_members", id);
      return { success: true };
    }

    case "reject_member":
      await removePending("pending_members", text(p.id, "id")!);
      return { success: true };

    case "list_pending_committee":
      return { data: await listPending("pending_committee") };

    case "update_pending_committee":
      return updatePendingCommittee(p);

    case "approve_committee": {
      const id = text(p.id, "id")!;
      const { data: row, error: readErr } = await supabase
        .from("pending_committee")
        .select("name,designation,department,batch,phone,blood_group,photo_url")
        .eq("id", id)
        .eq("status", "pending")
        .maybeSingle();
      if (readErr) throw readErr;
      if (!row) throw new HttpError(404, "Submission not found or already reviewed");
      const designation = text(p.designation, "designation", 80, false) ?? row.designation;
      const { error } = await supabase.from("committee").insert({ ...row, designation, highlight: false });
      if (error) throw error;
      await removePending("pending_committee", id);
      return { success: true };
    }

    case "reject_committee":
      await removePending("pending_committee", text(p.id, "id")!);
      return { success: true };

    case "list_people": {
      const kind = choice(p.kind, "Type", ["members", "committee", "advisors"]);
      const orderColumn = kind === "members" ? "name" : "sort_order";
      const { data, error } = await supabase
        .from(kind)
        .select("*")
        .order(orderColumn, { ascending: true });
      if (error) throw error;
      return { data };
    }

    case "update_member":
      return updatePerson("members", p);

    case "update_committee":
      return updatePerson("committee", p);

    case "update_advisor":
      return updatePerson("advisors", p);

    case "delete_person": {
      const kind = choice(p.kind, "Type", ["members", "committee", "advisors"]);
      const { data, error } = await supabase.from(kind).delete().eq("id", text(p.id, "id")!).select("id");
      if (error) throw error;
      if (!data?.length) throw new HttpError(404, "Person not found");
      return { success: true };
    }

    case "get_settings": {
      const { data, error } = await supabase
        .from("settings")
        .select("committee_window_open, committee_passcode")
        .eq("id", 1)
        .single();
      if (error) throw error;
      return { data };
    }

    case "set_committee_window": {
      if (typeof p.open !== "boolean") throw new HttpError(400, "open must be true or false");
      const { error } = await supabase.from("settings").update({ committee_window_open: p.open }).eq("id", 1);
      if (error) throw error;
      return { success: true };
    }

    case "set_site_info": {
      const update: Record<string, string> = {
        site_name: text(p.name, "Website name", 80)!,
        site_description: text(p.description, "Description", 300)!,
      };
      const logo = await uploadFile(p.logo, "site", IMAGE_EXT);
      if (logo) update.logo_url = logo.url;
      const { error } = await supabase.from("settings").update(update).eq("id", 1);
      if (error) throw error;
      return { success: true };
    }

    case "set_committee_passcode": {
      const passcode = text(p.passcode, "Passcode", 64)!;
      if (passcode.length < 6) throw new HttpError(400, "Passcode must be at least 6 characters");
      const { error } = await supabase.from("settings").update({ committee_passcode: passcode }).eq("id", 1);
      if (error) throw error;
      return { success: true };
    }

    case "set_admin_passkey": {
      const passkey = text(p.passkey, "Passkey", 64)!;
      if (passkey.length < 8) throw new HttpError(400, "Passkey must be at least 8 characters");
      const { error } = await supabase.from("settings").update({ admin_passkey: passkey }).eq("id", 1);
      if (error) throw error;
      return { success: true };
    }

    case "list_quizzes": {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title, description, starts_at, expires_at, quiz_questions(count), quiz_attempts(count)")
        .order("starts_at", { ascending: false });
      if (error) throw error;
      return { data };
    }

    case "create_quiz": {
      const starts_at = dateValue(p.starts_at, "Start time");
      const expires_at = dateValue(p.expires_at, "Expiry time");
      if (Date.parse(expires_at) <= Date.parse(starts_at)) throw new HttpError(400, "Expiry must be after the start time");
      const { data, error } = await supabase
        .from("quizzes")
        .insert({
          title: text(p.title, "Title", 200)!,
          description: text(p.description, "Description", 1000, false),
          starts_at,
          expires_at,
        })
        .select("id")
        .single();
      if (error) throw error;
      return { data };
    }

    case "update_quiz": {
      const starts_at = dateValue(p.starts_at, "Start time");
      const expires_at = dateValue(p.expires_at, "Expiry time");
      if (Date.parse(expires_at) <= Date.parse(starts_at)) throw new HttpError(400, "Expiry must be after the start time");
      const { data, error } = await supabase
        .from("quizzes")
        .update({
          title: text(p.title, "Title", 200)!,
          description: text(p.description, "Description", 1000, false),
          starts_at,
          expires_at,
        })
        .eq("id", uuidValue(p.id, "Quiz"))
        .select("id");
      if (error) throw error;
      if (!data?.length) throw new HttpError(404, "Quiz not found");
      return { success: true };
    }

    case "delete_quiz": {
      const { data, error } = await supabase.from("quizzes").delete().eq("id", uuidValue(p.id, "Quiz")).select("id");
      if (error) throw error;
      if (!data?.length) throw new HttpError(404, "Quiz not found");
      return { success: true };
    }

    case "list_quiz_questions": {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("id, position, question, options, correct_index")
        .eq("quiz_id", uuidValue(p.quiz_id, "Quiz"))
        .order("position", { ascending: true });
      if (error) throw error;
      return { data };
    }

    case "add_quiz_questions": {
      const quizId = uuidValue(p.quiz_id, "Quiz");
      if (!Array.isArray(p.questions) || p.questions.length === 0 || p.questions.length > 100) {
        throw new HttpError(400, "Add between 1 and 100 questions");
      }
      const { count, error: countError } = await supabase
        .from("quiz_questions")
        .select("id", { count: "exact", head: true })
        .eq("quiz_id", quizId);
      if (countError) throw countError;
      const rows = (p.questions as Record<string, unknown>[]).map((q, i) => {
        const options = Array.isArray(q.options) ? q.options : [];
        if (options.length !== 4) throw new HttpError(400, "Each question needs exactly 4 options");
        const correct = q.correct_index;
        if (!Number.isInteger(correct) || (correct as number) < 0 || (correct as number) > 3) {
          throw new HttpError(400, "Correct answer must be A, B, C or D");
        }
        return {
          quiz_id: quizId,
          position: (count ?? 0) + i + 1,
          question: text(q.question, "Question", 500)!,
          options: options.map((o, j) => text(o, `Option ${j + 1}`, 200)!),
          correct_index: correct,
        };
      });
      const { error } = await supabase.from("quiz_questions").insert(rows);
      if (error) throw error;
      return { success: true, added: rows.length };
    }

    case "delete_quiz_question": {
      const { data, error } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("id", uuidValue(p.id, "Question"))
        .select("id");
      if (error) throw error;
      if (!data?.length) throw new HttpError(404, "Question not found");
      return { success: true };
    }

    case "list_quiz_attempts": {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("id, name, email, phone, department, batch, score, total, percent, submitted_at")
        .eq("quiz_id", uuidValue(p.quiz_id, "Quiz"))
        .order("score", { ascending: false })
        .order("submitted_at", { ascending: true });
      if (error) throw error;
      return { data };
    }

    case "grant_certificate": {
      const quizId = p.quiz_id ? uuidValue(p.quiz_id, "Quiz") : null;
      const { data, error } = await supabase
        .from("certificates")
        .insert({
          recipient_name: text(p.recipient_name, "Recipient name", 120)!,
          email: text(p.email, "Email", 120, false)?.toLowerCase() ?? null,
          quiz_id: quizId,
          quiz_title: text(p.certificate_title, "Certificate title", 200)!,
          reason: "granted",
        })
        .select("code")
        .single();
      if (error) throw error;
      return { data };
    }

    case "list_certificates": {
      const { data, error } = await supabase
        .from("certificates")
        .select("code, recipient_name, email, quiz_title, percent, reason, issued_at")
        .order("issued_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return { data };
    }

    case "get_signatories": {
      const { data, error } = await supabase
        .from("settings")
        .select("president_name, general_secretary_name, president_signature_url, general_secretary_signature_url")
        .eq("id", 1)
        .single();
      if (error) throw error;
      return { data };
    }

    case "set_signatories": {
      const update: Record<string, unknown> = {
        president_name: text(p.president_name, "President name", 120, false),
        general_secretary_name: text(p.general_secretary_name, "General secretary name", 120, false),
      };
      const presidentSignature = await uploadFile(p.president_signature, "site", IMAGE_EXT);
      if (presidentSignature) update.president_signature_url = presidentSignature.url;
      const secretarySignature = await uploadFile(p.general_secretary_signature, "site", IMAGE_EXT);
      if (secretarySignature) update.general_secretary_signature_url = secretarySignature.url;
      const { error } = await supabase.from("settings").update(update).eq("id", 1);
      if (error) throw error;
      return { success: true };
    }

    case "add_event": {
      const values = await eventValues(p);
      const image = await uploadFile(p.image, "events", IMAGE_EXT);
      const report = await uploadFile(p.report, "reports", DOCUMENT_EXT);
      const { error } = await supabase.from("events").insert({
        ...values,
        image_url: image?.url ?? null,
        report_url: report?.url ?? null,
      });
      if (error) throw error;
      return { success: true };
    }

    case "update_event": {
      const id = text(p.id, "id")!;
      const values = await eventValues(p);
      const image = await uploadFile(p.image, "events", IMAGE_EXT);
      const report = await uploadFile(p.report, "reports", DOCUMENT_EXT);
      const update: Record<string, unknown> = { ...values };
      if (image) update.image_url = image.url;
      if (report) update.report_url = report.url;
      const { data, error } = await supabase.from("events").update(update).eq("id", id).select("id");
      if (error) throw error;
      if (!data?.length) throw new HttpError(404, "Event not found");
      return { success: true };
    }

    case "delete_event": {
      const { error } = await supabase.from("events").delete().eq("id", text(p.id, "id")!);
      if (error) throw error;
      return { success: true };
    }

    case "add_past_committee_member": {
      const values = pastMemberValues(p);
      const photo = await uploadFile(p.photo, "past-committee-photos", IMAGE_EXT);
      const { error } = await supabase.from("past_committees").insert({ ...values, photo_url: photo?.url ?? null });
      if (error) throw error;
      return { success: true };
    }

    case "update_past_committee_member": {
      const values = pastMemberValues(p);
      const photo = await uploadFile(p.photo, "past-committee-photos", IMAGE_EXT);
      const update: Record<string, unknown> = { ...values };
      if (photo) update.photo_url = photo.url;
      const { data, error } = await supabase
        .from("past_committees")
        .update(update)
        .eq("id", text(p.id, "id")!)
        .select("id");
      if (error) throw error;
      if (!data?.length) throw new HttpError(404, "Member not found");
      return { success: true };
    }

    case "delete_past_committee_member": {
      const { data, error } = await supabase
        .from("past_committees")
        .delete()
        .eq("id", text(p.id, "id")!)
        .select("id");
      if (error) throw error;
      if (!data?.length) throw new HttpError(404, "Member not found");
      return { success: true };
    }

    case "add_gallery_image": {
      const image = await uploadFile(p.image, "gallery", IMAGE_EXT);
      if (!image) throw new HttpError(400, "A photo is required");
      const { error } = await supabase.from("gallery_images").insert({
        title: text(p.title, "Caption", 150, false),
        image_url: image.url,
        category: choice(p.category, "Category", GALLERY_CATEGORIES),
      });
      if (error) throw error;
      return { success: true };
    }

    case "delete_gallery_image": {
      const { error } = await supabase.from("gallery_images").delete().eq("id", text(p.id, "id")!);
      if (error) throw error;
      return { success: true };
    }

    case "add_notice": {
      const file = await uploadFile(p.file, "documents", DOCUMENT_EXT);
      const { error } = await supabase.from("notices").insert({
        title: text(p.title, "Title", 200)!,
        date: text(p.date, "Date", 20, false) ?? new Date().toISOString().slice(0, 10),
        type: choice(p.type, "Type", NOTICE_TYPES),
        description: text(p.description, "Description", 1000, false),
        file_url: file?.url ?? null,
        file_size: file ? `${Math.max(1, Math.round(file.bytes / 1024))} KB` : null,
      });
      if (error) throw error;
      return { success: true };
    }

    case "list_books": {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return { data };
    }

    case "create_book_upload":
      return createBookUpload(p.size);

    case "add_book": {
      const pdf_url = await verifyBookPdf(p.pdf_path);
      const { error } = await supabase.from("books").insert({
        title: text(p.title, "Title", 200)!,
        author: text(p.author, "Author", 120, false),
        description: text(p.description, "Description", 1000, false),
        pdf_url,
        status: "approved",
      });
      if (error) throw error;
      return { success: true };
    }

    case "update_book": {
      const { data, error } = await supabase
        .from("books")
        .update({
          title: text(p.title, "Title", 200)!,
          author: text(p.author, "Author", 120, false),
          description: text(p.description, "Description", 1000, false),
        })
        .eq("id", text(p.id, "id")!)
        .select("id");
      if (error) throw error;
      if (!data?.length) throw new HttpError(404, "Book not found");
      return { success: true };
    }

    case "approve_book": {
      const { data, error } = await supabase
        .from("books")
        .update({ status: "approved" })
        .eq("id", text(p.id, "id")!)
        .select("id");
      if (error) throw error;
      if (!data?.length) throw new HttpError(404, "Book not found");
      return { success: true };
    }

    case "delete_book": {
      const { data, error } = await supabase
        .from("books")
        .delete()
        .eq("id", text(p.id, "id")!)
        .select("id");
      if (error) throw error;
      if (!data?.length) throw new HttpError(404, "Book not found");
      return { success: true };
    }

    case "delete_notice": {
      const { error } = await supabase.from("notices").delete().eq("id", text(p.id, "id")!);
      if (error) throw error;
      return { success: true };
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
    const body = (await req.json()) as { passkey?: unknown; action?: unknown; payload?: Payload };
    const { data: settings, error } = await supabase
      .from("settings")
      .select("admin_passkey")
      .eq("id", 1)
      .single();
    if (error) throw error;
    if (typeof body.passkey !== "string" || body.passkey !== settings.admin_passkey) {
      throw new HttpError(401, "Invalid admin passkey");
    }
    if (typeof body.action !== "string") throw new HttpError(400, "Missing action");
    return json(await run(body.action, body.payload ?? {}));
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Something went wrong";
    return json({ error: message }, status);
  }
});
