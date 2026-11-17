import { useState, type FormEvent } from 'react';
import { Save, Trash2, Upload } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { BLOOD_GROUPS, COMMITTEE_DESIGNATIONS, DEPARTMENTS } from '@/data/constants';
import { adminCall } from '@/lib/supabase';
import { validateFile, toUploadPayload, IMAGE_TYPES } from '@/lib/files';
import type { PersonKind, PersonRow } from '@/components/admin/personKinds';

type FieldDef = {
  key: string;
  label: string;
  required?: boolean;
  options?: readonly string[];
  multiline?: boolean;
  type?: string;
};

const FIELDS: Record<PersonKind, FieldDef[]> = {
  members: [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'department', label: 'Department', required: true, options: DEPARTMENTS },
    { key: 'batch', label: 'Batch / Session', required: true },
    { key: 'blood_group', label: 'Blood Group', options: BLOOD_GROUPS },
    { key: 'phone', label: 'Phone Number', type: 'tel' },
    { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'permanent_address', label: 'Permanent Address', multiline: true },
    { key: 'facebook_url', label: 'Facebook Profile Link', type: 'url' },
  ],
  committee: [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'designation', label: 'Designation', required: true, options: COMMITTEE_DESIGNATIONS },
    { key: 'department', label: 'Department', required: true, options: DEPARTMENTS },
    { key: 'batch', label: 'Batch / Session', required: true },
    { key: 'blood_group', label: 'Blood Group', options: BLOOD_GROUPS },
    { key: 'phone', label: 'Phone Number', type: 'tel' },
    { key: 'facebook_url', label: 'Facebook Profile Link', type: 'url' },
  ],
  advisors: [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'academic_designation', label: 'Academic Designation', required: true },
    { key: 'department', label: 'Department', required: true, options: DEPARTMENTS },
    { key: 'blessing', label: 'Blessing / Message', multiline: true },
    { key: 'facebook_url', label: 'Facebook Profile Link', type: 'url' },
  ],
};

const ACTIONS: Record<PersonKind, string> = {
  members: 'update_member',
  committee: 'update_committee',
  advisors: 'update_advisor',
};

const SINGULAR: Record<PersonKind, string> = {
  members: 'member',
  committee: 'committee member',
  advisors: 'advisor',
};

function withCurrent(options: readonly string[], value: string) {
  return value && !options.includes(value) ? [value, ...options] : options;
}

interface Props {
  kind: PersonKind;
  person: PersonRow;
  passkey: string;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

export default function PersonEditModal({ kind, person, passkey, onClose, onSaved, onDeleted }: Props) {
  const fields = FIELDS[kind];
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, String(person[f.key] ?? '')])),
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPhoto = photoPreview ?? person.photo_url;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file, IMAGE_TYPES);
    if (err) {
      setError(err);
      e.target.value = '';
      return;
    }
    setError(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${person.name}? This cannot be undone.`)) return;
    setError(null);
    setSaving(true);
    try {
      const res = await adminCall<{ success?: boolean; error?: string }>(passkey, 'delete_person', {
        kind,
        id: person.id,
      });
      if (res.error) throw new Error(res.error);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const photo = photoFile ? await toUploadPayload(photoFile) : null;
      const res = await adminCall<{ success?: boolean; error?: string }>(passkey, ACTIONS[kind], {
        id: person.id,
        values,
        photo,
      });
      if (res.error) throw new Error(res.error);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} label={`Edit ${SINGULAR[kind]}`} size="lg">
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-navy-900">
          Edit {SINGULAR[kind]}
        </h2>
        <p className="mt-1 text-sm text-navy-500">Changes appear on the public site after saving.</p>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center gap-4 rounded-xl border border-navy-200 bg-white p-4">
          {currentPhoto ? (
            <img src={currentPhoto} alt="" className="h-20 w-20 flex-none rounded-full object-cover ring-2 ring-saffron-300" />
          ) : (
            <div className="flex h-20 w-20 flex-none items-center justify-center rounded-full bg-navy-50 text-sm text-navy-400">
              No photo
            </div>
          )}
          <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-navy-700 transition hover:bg-saffron-50 hover:text-saffron-700">
            <Upload size={18} />
            <span>{photoFile ? photoFile.name : 'Replace photo (JPG, PNG, or WEBP, max 4MB)'}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={f.multiline || f.key === 'facebook_url' ? 'sm:col-span-2' : ''}>
              <label className="label-text" htmlFor={`person-${f.key}`}>
                {f.label}{f.required ? ' *' : ''}
              </label>
              {f.options ? (
                <select
                  id={`person-${f.key}`}
                  required={f.required}
                  value={values[f.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="input-field"
                >
                  <option value="">{f.required ? 'Select' : 'None'}</option>
                  {withCurrent(f.options, values[f.key]).map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : f.multiline ? (
                <textarea
                  id={`person-${f.key}`}
                  required={f.required}
                  rows={3}
                  value={values[f.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="input-field resize-none"
                />
              ) : (
                <input
                  id={`person-${f.key}`}
                  type={f.type ?? 'text'}
                  required={f.required}
                  value={values[f.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="input-field"
                  placeholder={f.key === 'facebook_url' ? 'https://facebook.com/username' : undefined}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
          >
            <Trash2 size={16} /> Delete {SINGULAR[kind]}
          </button>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
