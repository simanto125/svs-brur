import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Save, Upload } from 'lucide-react';
import { adminCall, publicCall } from '@/lib/supabase';
import { validateFile, toUploadPayload, IMAGE_TYPES } from '@/lib/files';
import type { SiteInfo } from '@/hooks/useSiteInfo';

export default function SiteInfoForm({ passkey }: { passkey: string }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const loadSiteInfo = () =>
    publicCall<{ data?: SiteInfo }>('get_site_info')
      .then((res) => {
        if (!res.data) throw new Error('Unexpected response from the server');
        setName(res.data.site_name);
        setDescription(res.data.site_description);
        setCurrentLogo(res.data.logo_url);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load site info'))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadSiteInfo();
  }, []);

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file, IMAGE_TYPES);
    if (err) {
      setError(err);
      e.target.value = '';
      return;
    }
    setError(null);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const logo = logoFile ? await toUploadPayload(logoFile) : null;
      await adminCall(passkey, 'set_site_info', { name, description, logo });
      setLogoFile(null);
      setLogoPreview(null);
      await loadSiteInfo();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  const shownLogo = logoPreview ?? currentLogo;

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <h3 className="font-display text-lg font-semibold text-navy-900">Website Identity</h3>
      <p className="mt-1 text-sm text-navy-500">Logo, name, and description shown on the public website.</p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}
      {saved && (
        <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">Saved.</div>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <label className="label-text">Website logo</label>
          <div className="flex items-center gap-4 rounded-xl border border-navy-200 bg-white p-4">
            {shownLogo ? (
              <img src={shownLogo} alt="" className="h-16 w-16 flex-none rounded-full object-cover ring-2 ring-saffron-300" />
            ) : (
              <div className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-navy-50 text-xs text-navy-400">
                No logo
              </div>
            )}
            <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-navy-700 transition hover:bg-saffron-50 hover:text-saffron-700">
              <Upload size={18} />
              <span>{logoFile ? logoFile.name : 'Replace logo (JPG, PNG, or WEBP, max 25MB, auto-compressed)'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>
        </div>
        <div>
          <label className="label-text" htmlFor="site-name">Website name *</label>
          <input
            id="site-name"
            required
            maxLength={80}
            value={name}
            disabled={loading}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-text" htmlFor="site-description">Description *</label>
          <textarea
            id="site-description"
            required
            rows={4}
            maxLength={300}
            value={description}
            disabled={loading}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field resize-none"
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button type="submit" disabled={saving || loading} className="btn-primary disabled:opacity-60">
          <Save size={16} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
