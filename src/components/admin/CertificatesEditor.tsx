import { useCallback, useEffect, useState } from 'react';
import { Award, ExternalLink, Gift } from 'lucide-react';
import SignatoriesForm from '@/components/admin/SignatoriesForm';
import { adminCall } from '@/lib/supabase';
import { formatDateTime } from '@/lib/quizFormat';
import type { AdminCertificate } from '@/types/quiz';

export default function CertificatesEditor({ passkey }: { passkey: string }) {
  const [certificates, setCertificates] = useState<AdminCertificate[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recipient, setRecipient] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [granting, setGranting] = useState(false);
  const [grantMessage, setGrantMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(() => {
    return adminCall<{ data: AdminCertificate[] }>(passkey, 'list_certificates')
      .then((res) => {
        if (!Array.isArray(res.data)) throw new Error('Unexpected response from the server');
        setCertificates(res.data);
        setLoadError(null);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load certificates'));
  }, [passkey]);

  useEffect(() => {
    load();
  }, [load]);

  const grant = async (e: React.FormEvent) => {
    e.preventDefault();
    setGranting(true);
    setGrantMessage(null);
    try {
      const res = await adminCall<{ data: { code: string } }>(passkey, 'grant_certificate', {
        recipient_name: recipient.trim(),
        email: email.trim() || null,
        certificate_title: title.trim(),
      });
      if (!res.data?.code) throw new Error('Unexpected response from the server');
      setGrantMessage({ ok: true, text: `Certificate granted to ${recipient.trim()}.` });
      setRecipient('');
      setEmail('');
      setTitle('');
      load();
    } catch (err) {
      setGrantMessage({ ok: false, text: err instanceof Error ? err.message : 'Could not grant the certificate' });
    } finally {
      setGranting(false);
    }
  };

  return (
    <div className="space-y-8">
      <SignatoriesForm passkey={passkey} />

      <form onSubmit={grant} className="card space-y-4 p-6">
        <div>
          <h3 className="font-display text-lg font-semibold text-navy-900">Grant a Certificate</h3>
          <p className="mt-1 text-sm text-navy-500">Give a certificate to anyone, even if they did not take a quiz.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text" htmlFor="cert-name">Recipient name *</label>
            <input id="cert-name" required value={recipient} onChange={(e) => setRecipient(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text" htmlFor="cert-email">Email (optional)</label>
            <input id="cert-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-text" htmlFor="cert-title">Certificate for (title) *</label>
            <input
              id="cert-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="e.g. Outstanding contribution to SVS"
            />
          </div>
        </div>
        {grantMessage && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${grantMessage.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {grantMessage.text}
          </div>
        )}
        <button type="submit" disabled={granting} className="btn-primary disabled:opacity-60">
          <Gift size={16} /> {granting ? 'Granting…' : 'Grant Certificate'}
        </button>
      </form>

      <div>
        <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Issued Certificates</h3>
        {loadError && <p className="text-sm font-medium text-red-700">{loadError}</p>}
        {!loadError && !certificates && <p className="text-navy-500">Loading certificates…</p>}
        {certificates?.length === 0 && <p className="py-6 text-center text-navy-500">No certificates issued yet.</p>}
        {certificates && certificates.length > 0 && (
          <div className="space-y-3">
            {certificates.map((c) => (
              <div key={c.code} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-saffron-100 text-saffron-700">
                  <Award size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy-900">{c.recipient_name}</p>
                  <p className="truncate text-xs text-navy-500">
                    {c.quiz_title} · {c.reason === 'perfect_score' ? `${c.percent}% score` : 'Granted by admin'} · {formatDateTime(c.issued_at)}
                  </p>
                  {c.email && <p className="text-xs text-navy-400">{c.email}</p>}
                </div>
                <a href={`#/certificate/${c.code}`} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
                  <ExternalLink size={14} /> View
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
