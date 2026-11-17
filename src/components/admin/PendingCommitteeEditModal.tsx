import { useState, type FormEvent } from 'react';
import { Save, Upload } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { BLOOD_GROUPS, COMMITTEE_DESIGNATIONS, DEPARTMENTS } from '@/data/constants';
import { adminCall } from '@/lib/supabase';
import { toUploadPayload, validateFile } from '@/lib/files';
import type { PendingCommittee } from '@/types';

interface Props {
  member: PendingCommittee;
  passkey: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function PendingCommitteeEditModal({ member, passkey, onClose, onSaved }: Props) {
  const [values, setValues] = useState({
    name: member.name,
    designation: member.designation,
    department: member.department,
    batch: member.batch,
    blood_group: member.blood_group ?? '',
    phone: member.phone ?? '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState(member.photo_url);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }));

  const choosePhoto = (file: File | undefined) => {
    if (!file) return;
    const validationError = validateFile(file, ['image/jpeg', 'image/png', 'image/webp']);
    if (validationError) { setError(validationError); return; }
    setError(null);
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const uploadedPhoto = photo ? await toUploadPayload(photo) : null;
      const response = await adminCall<{ success?: boolean; error?: string }>(passkey, 'update_pending_committee', {
        id: member.id,
        values,
        photo: uploadedPhoto,
      });
      if (response.error) throw new Error(response.error);
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} label={`Edit ${member.name}`} size="lg">
      <form onSubmit={submit} className="p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-navy-900">Edit committee submission</h2>
        <p className="mt-1 text-sm text-navy-500">Review and correct the profile before accepting it.</p>
        {error && <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-navy-100 bg-navy-50/50 p-4">
          {preview ? <img src={preview} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-saffron-300" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-xs text-navy-400">No photo</div>}
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-navy-700 transition hover:text-saffron-700"><Upload size={17} /> {photo ? photo.name : 'Replace photo'}<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => choosePhoto(event.target.files?.[0])} /></label>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={values.name} onChange={(value) => update('name', value)} />
          <SelectField label="Designation" value={values.designation} options={COMMITTEE_DESIGNATIONS} onChange={(value) => update('designation', value)} />
          <SelectField label="Department" value={values.department} options={DEPARTMENTS} onChange={(value) => update('department', value)} />
          <Field label="Batch / session" value={values.batch} onChange={(value) => update('batch', value)} />
          <SelectField label="Blood group" value={values.blood_group} options={BLOOD_GROUPS} onChange={(value) => update('blood_group', value)} />
          <Field label="Phone number" value={values.phone} onChange={(value) => update('phone', value)} type="tel" />
        </div>
        <div className="mt-8 flex justify-end gap-3"><button type="button" onClick={onClose} className="btn-ghost">Cancel</button><button type="submit" disabled={saving} className="btn-primary disabled:opacity-60"><Save size={16} /> {saving ? 'Saving…' : 'Save changes'}</button></div>
      </form>
    </Modal>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block"><span className="label-text">{label}</span><input required value={value} type={type} onChange={(event) => onChange(event.target.value)} className="input-field" /></label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="label-text">{label}</span><select required value={value} onChange={(event) => onChange(event.target.value)} className="input-field">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
