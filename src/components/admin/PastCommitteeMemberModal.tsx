import { useState, type FormEvent } from 'react';
import { Save, Trash2, Upload } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { COMMITTEE_DESIGNATIONS, DEPARTMENTS } from '@/data/constants';
import { adminCall } from '@/lib/supabase';
import { validateFile, toUploadPayload, IMAGE_TYPES } from '@/lib/files';
import type { PastCommitteeMember } from '@/types';

interface Props {
  passkey: string;
  member: PastCommitteeMember | null;
  defaultYear: string;
  onClose: () => void;
  onSaved: () => void;
}

type Response = { success?: boolean; error?: string };

export default function PastCommitteeMemberModal({ passkey, member, defaultYear, onClose, onSaved }: Props) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPhoto = photoPreview ?? member?.photo_url ?? null;

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const photo = photoFile ? await toUploadPayload(photoFile) : null;
      const res = await adminCall<Response>(
        passkey,
        member ? 'update_past_committee_member' : 'add_past_committee_member',
        {
          id: member?.id,
          year: fd.get('year'),
          name: fd.get('name'),
          designation: fd.get('designation'),
          department: fd.get('department'),
          batch: fd.get('batch') || null,
          sort_order: fd.get('sort_order') || 0,
          photo,
        },
      );
      if (res.error) throw new Error(res.error);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!member) return;
    if (!window.confirm(`Remove ${member.name} from ${member.year}? This cannot be undone.`)) return;
    setError(null);
    setSaving(true);
    try {
      const res = await adminCall<Response>(passkey, 'delete_past_committee_member', { id: member.id });
      if (res.error) throw new Error(res.error);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} label={member ? 'Edit past member' : 'Add past member'} size="lg">
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-navy-900">
          {member ? 'Edit Past Committee Member' : 'Add Past Committee Member'}
        </h2>
        <p className="mt-1 text-sm text-navy-500">Use the year format 2019-20 or 2019-2020.</p>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
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
            <span>{photoFile ? photoFile.name : 'Choose photo (JPG, PNG, or WEBP, max 25MB, auto-compressed)'}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-text" htmlFor="past-year">Year *</label>
            <input id="past-year" name="year" required placeholder="2019-20" defaultValue={member?.year ?? defaultYear} className="input-field" />
          </div>
          <div>
            <label className="label-text" htmlFor="past-order">Display order</label>
            <input id="past-order" name="sort_order" type="number" min={0} max={999} defaultValue={member?.sort_order ?? 0} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-text" htmlFor="past-name">Full name *</label>
            <input id="past-name" name="name" required maxLength={120} defaultValue={member?.name ?? ''} className="input-field" />
          </div>
          <div>
            <label className="label-text" htmlFor="past-designation">Designation *</label>
            <input
              id="past-designation"
              name="designation"
              required
              maxLength={100}
              list="past-designation-options"
              defaultValue={member?.designation ?? ''}
              className="input-field"
            />
            <datalist id="past-designation-options">
              {COMMITTEE_DESIGNATIONS.map((d) => <option key={d} value={d} />)}
            </datalist>
          </div>
          <div>
            <label className="label-text" htmlFor="past-department">Department *</label>
            <input
              id="past-department"
              name="department"
              required
              maxLength={150}
              list="past-department-options"
              defaultValue={member?.department ?? ''}
              className="input-field"
            />
            <datalist id="past-department-options">
              {DEPARTMENTS.map((d) => <option key={d} value={d} />)}
            </datalist>
          </div>
          <div>
            <label className="label-text" htmlFor="past-batch">Batch / session</label>
            <input id="past-batch" name="batch" maxLength={20} defaultValue={member?.batch ?? ''} className="input-field" />
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {member ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
            >
              <Trash2 size={16} /> Remove member
            </button>
          ) : (
            <span />
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              <Save size={16} /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
