import { useEffect, useState } from 'react';
import { ArrowLeft, Printer, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { publicCall } from '@/lib/supabase';
import { formatDateTime } from '@/lib/quizFormat';
import { isSoundEnabled, playChime, setSoundEnabled } from '@/lib/sound';
import type { CertificateData } from '@/types/quiz';

const FALLBACK_LOGO = 'https://i.ibb.co/ds2dPcQc/svs.jpg';

const PRINT_STYLES = `
@page { size: A4 landscape; margin: 0; }
@media print {
  html, body { background: #fdfaf2 !important; }
  .cert-print-hide { display: none !important; }
  .cert-print-page { padding: 0 !important; min-height: 0 !important; }
  .cert-sheet { box-shadow: none !important; border-radius: 0 !important; width: 297mm !important; height: 210mm !important; }
}
`;

const RAINBOW_TEXT = 'linear-gradient(90deg,#b45309,#dc2626,#0f766e,#1d4ed8,#b45309,#dc2626)';

export default function CertificatePage({ code }: { code: string }) {
  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  useEffect(() => {
    setLoading(true);
    setError(null);
    publicCall<{ data: CertificateData }>('get_certificate', { code })
      .then((res) => {
        if (!res.data?.certificate || !res.data?.settings) throw new Error('Unexpected response from the server');
        setData(res.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the certificate'))
      .finally(() => setLoading(false));
  }, [code]);

  useEffect(() => {
    if (data) playChime();
  }, [data]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playChime();
  };

  return (
    <div className="cert-print-page min-h-screen bg-gradient-to-br from-cream-50 via-white to-saffron-50 px-4 pb-16 pt-28">
      <style>{PRINT_STYLES}</style>
      <div className="mx-auto max-w-5xl">
        <div className="cert-print-hide mb-6 flex flex-wrap items-center justify-between gap-3">
          <a href="#/" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 transition hover:text-saffron-700">
            <ArrowLeft size={16} /> Back to home
          </a>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSound}
              aria-label={soundOn ? 'Mute sound effects' : 'Turn on sound effects'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-200 bg-white text-navy-600 shadow-sm transition hover:border-saffron-500 hover:text-saffron-700"
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            {data && (
              <button onClick={() => window.print()} className="btn-primary text-sm">
                <Printer size={16} /> Print / Save as PDF
              </button>
            )}
          </div>
        </div>

        {loading && <p className="text-center text-navy-500">Loading certificate…</p>}

        {error && (
          <div className="mx-auto max-w-xl rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {data && <CertificateView data={data} />}
      </div>
    </div>
  );
}

function CertificateView({ data }: { data: CertificateData }) {
  const { certificate: c, settings: s } = data;
  const issued = formatDateTime(c.issued_at).split(',')[0];

  return (
    <article className="cert-sheet relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl bg-[#fdfaf2] shadow-2xl ring-1 ring-saffron-200 aspect-[1.414/1]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,160,23,0.18),transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:repeating-linear-gradient(45deg,#0f172a_0_1px,transparent_1px_12px)]" />

      <div className="absolute inset-3 rounded-2xl p-[3px] [background:linear-gradient(135deg,#f5d77a,#b8860b,#fff3b0,#a16207,#f5d77a)] sm:inset-4">
        <div className="flex h-full w-full flex-col items-center justify-between rounded-[13px] border border-amber-300/70 bg-[#fffdf6] px-5 py-4 text-center sm:px-10 sm:py-6">
          <div className="flex w-full flex-col items-center">
            <div className="relative flex h-24 w-24 items-center justify-center sm:h-32 sm:w-32">
              <span className="absolute inset-0 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,#f5d77a,#b8860b,#fff3b0,#a16207,#f5d77a)]" />
              <img
                src={s.logo_url ?? FALLBACK_LOGO}
                alt={s.site_name}
                className="relative h-[92%] w-[92%] rounded-full bg-white object-cover"
              />
            </div>
            <p
              className="mt-2 bg-clip-text font-display text-lg font-extrabold uppercase tracking-[0.18em] text-transparent animate-hue-shift sm:text-2xl"
              style={{ backgroundImage: RAINBOW_TEXT, backgroundSize: '300% 100%' }}
            >
              {s.site_name}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <h1 className="font-display text-2xl font-bold tracking-wide text-navy-900 sm:text-4xl">
              Certificate of Achievement
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-amber-700 sm:text-sm">Presented to</p>
            <p
              className="mt-1 bg-clip-text font-display text-2xl font-bold text-transparent sm:text-4xl"
              style={{ backgroundImage: RAINBOW_TEXT, backgroundSize: '300% 100%' }}
            >
              <span className="inline-block animate-text-wave">{c.recipient_name}</span>
            </p>
            <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-navy-600 sm:text-base">
              {c.reason === 'perfect_score'
                ? `for achieving a perfect score of ${c.percent}% in the online quiz`
                : 'in recognition of their achievement and contribution'}
              {c.quiz_title && <> &ldquo;<span className="font-semibold text-navy-800">{c.quiz_title}</span>&rdquo;</>}.
            </p>
          </div>

          <div className="flex w-full items-end justify-between gap-4">
            <Signatory name={s.president_name} title="President" signatureUrl={s.president_signature_url} />
            <Seal />
            <Signatory name={s.general_secretary_name} title="General Secretary" signatureUrl={s.general_secretary_signature_url} />
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-2 border-t border-amber-200 pt-2 text-[10px] text-navy-500 sm:text-xs">
            <span>Issued on {issued}</span>
            <span className="inline-flex items-center gap-1.5 font-mono">
              <ShieldCheck size={14} className="text-emerald-600" /> Verification code: {c.code}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function Seal() {
  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center animate-seal-pulse sm:h-28 sm:w-28">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow" aria-hidden="true">
        <defs>
          <path id="seal-ring" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
          <linearGradient id="seal-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#fef3c7" />
          </linearGradient>
        </defs>
        <path
          fill="url(#seal-gold)"
          d="M100,6 L116,22 L138,14 L146,36 L170,38 L168,62 L190,74 L180,96 L194,116 L174,130 L180,152 L156,156 L150,180 L126,176 L110,194 L94,178 L72,190 L62,168 L38,168 L40,144 L14,132 L24,112 L8,94 L26,80 L20,56 L44,50 L46,26 L70,28 L84,10 Z"
        />
        <circle cx="100" cy="100" r="62" fill="#fffbeb" stroke="#92400e" strokeWidth="2" />
        <text fontSize="13" fontWeight="700" letterSpacing="3" fill="#92400e">
          <textPath href="#seal-ring" startOffset="0">OFFICIAL SEAL &#8226; SVS &#8226; VERIFIED &#8226;</textPath>
        </text>
      </svg>
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-600 to-amber-800 text-amber-50 shadow-inner">
        <ShieldCheck size={24} />
      </span>
    </div>
  );
}

function Signatory({ name, title, signatureUrl }: { name: string | null; title: string; signatureUrl: string | null }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div className="flex h-12 items-end justify-center sm:h-16">
        {signatureUrl && <img src={signatureUrl} alt={`${title} signature`} className="max-h-12 max-w-[160px] object-contain sm:max-h-16" />}
      </div>
      <div className="mt-1 w-full max-w-[220px] border-t border-navy-400 pt-1">
        <p className="truncate font-semibold text-navy-900 sm:text-base">{name ?? '—'}</p>
        <p className="text-[10px] uppercase tracking-wider text-navy-500 sm:text-xs">{title}</p>
      </div>
    </div>
  );
}
