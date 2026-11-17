import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminCall } from '@/lib/supabase';
import { toUploadPayload, validateFile } from '@/lib/files';
import type { Signatories } from '@/types/quiz';

const SIGNATURE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export default function SignatoriesForm({ passkey }: { passkey: string }) {
  const [current, setCurrent] = useState<Signatories | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [presidentName, setPresidentName] = useState('');
  const [secretaryName, setSecretaryName] = useState('');
  const [presidentFile, setPresidentFile] = useState<File | null>(null);
  const [secretaryFile, setSecretaryFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    adminCall<{ data: Signatories }>(passkey, 'get_signatories')
      .then((res) => {
        if (!res.data) throw new Error('Unexpected response from the server');
        setCurrent(res.data);
        setPresidentName(res.data.president_name ?? '');
        setSecretaryName(res.data.general_secretary_name ?? '');
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load signatories'));
  }, [passkey]);

  const pickFile = (setter: (f: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const err = validateFile(file, SIGNATURE_TYPES);
      if (err) {
        setMessage({ ok: false, text: err });
        e.target.value = '';
        setter(null);
        return;
      }
    }
    setMessage(null);
    setter(file);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload: Record<string, unknown> = {
        president_name: presidentName.trim() || null,
        general_secretary_name: secretaryName.trim() || null,
      };
      if (presidentFile) payload.president_signature = await toUploadPayload(presidentFile);
      if (secretaryFile) payload.general_secretary_signature = await toUploadPayload(secretaryFile);
      await adminCall(passkey, 'set_signatories', payload);
      const refreshed = await adminCall<{ data: Signatories }>(passkey, 'get_signatories');
      setCurrent(refreshed.data);
      setPresidentFile(null);
      setSecretaryFile(null);
      setMessage({ ok: true, text: 'Signatories saved. They now appear on every certificate.' });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Could not save signatories' });
    } finally {
      setSaving(false);
    }
  };

  if (loadError) return <p className="text-sm font-medium text-red-700">{loadError}</p>;
  if (!current) return <p className="text-navy-500">Loading signatories…</p>;

  return (
    <form onSubmit={save} className="card space-y-6 p-6">
      <div>
        <h3 className="font-display text-lg font-semibold text-navy-900">Certificate Signatories</h3>
        <p className="mt-1 text-sm text-navy-500">
          Set these once. The names and signatures below are printed automatically on every certificate.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SignatoryFields
          label="President"
          name={presidentName}
          onName={setPresidentName}
          currentUrl={current.president_signature_url}
          onFile={pickFile(setPresidentFile)}
          fileName={presidentFile?.name ?? null}
        />
        <SignatoryFields
          label="General Secretary"
          name={secretaryName}
          onName={setSecretaryName}
          currentUrl={current.general_secretary_signature_url}
          onFile={pickFile(setSecretaryFile)}
          fileName={secretaryFile?.name ?? null}
        />
      </div>

      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${message.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
        <Save size={16} /> {saving ? 'Saving…' : 'Save Signatories'}
      </button>
    </form>
  );
}

function SignatoryFields({
  label,
  name,
  onName,
  currentUrl,
  onFile,
  fileName,
}: {
  label: string;
  name: string;
  onName: (v: string) => void;
  currentUrl: string | null;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string | null;
}) {
  return (
    <div className="space-y-3 rounded-2xl bg-cream-50 p-5">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-navy-500">{label}</h4>
      <div>
        <label className="label-text">Name</label>
        <input value={name} onChange={(e) => onName(e.target.value)} className="input-field" placeholder={`${label} full name`} />
      </div>
      <div>
        <label className="label-text">Signature image (PNG with transparent background works best)</label>
        <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-navy-200 bg-white p-2">
          {currentUrl ? (
            <img src={currentUrl} alt={`${label} signature`} className="max-h-16 max-w-full object-contain" />
          ) : (
            <span className="text-xs text-navy-400">No signature uploaded</span>
          )}
        </div>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} className="input-field mt-2" />
        {fileName && <p className="mt-1 text-xs text-navy-500">New: {fileName} (saves on Save)</p>}
      </div>
    </div>
  );
}
