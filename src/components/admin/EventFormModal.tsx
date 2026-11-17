import { useState, type FormEvent } from 'react';
import { Save, Upload } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { EVENT_CATEGORIES } from '@/data/constants';
import { adminCall } from '@/lib/supabase';
import { validateFile, toUploadPayload, IMAGE_TYPES, DOCUMENT_TYPES } from '@/lib/files';
import type { EventItem } from '@/types';

interface Props {
  passkey: string;
  event: EventItem | null;
  onClose: () => void;
  onSaved: () => void;
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventFormModal({ passkey, event, onClose, onSaved }: Props) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    types: string[],
    set: (f: File | null) => void,
  ) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return set(null);
    const err = validateFile(file, types);
    if (err) {
      setError(err);
      e.target.value = '';
      return set(null);
    }
    setError(null);
    set(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const image = imageFile ? await toUploadPayload(imageFile) : null;
      const report = reportFile ? await toUploadPayload(reportFile) : null;
      const res = await adminCall<{ success?: boolean; error?: string }>(
        passkey,
        event ? 'update_event' : 'add_event',
        {
          id: event?.id,
          title: fd.get('title'),
          date: new Date(String(fd.get('date'))).toISOString(),
          venue: fd.get('venue'),
          description: fd.get('description') || null,
          category: fd.get('category'),
          video_url: fd.get('video_url') || null,
          image,
          report,
        },
      );
      if (res.error) throw new Error(res.error);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the event');
    } finally {
      setSaving(false);
    }
  };

  const fileLabel = (file: File | null, fallback: string) => file?.name ?? fallback;

  return (
    <Modal open onClose={onClose} label={event ? 'Edit event' : 'New event'} size="lg">
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-navy-900">
          {event ? 'Edit Event' : 'New Event'}
        </h2>
        <p className="mt-1 text-sm text-navy-500">Changes appear on the public site after saving.</p>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
        )}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label-text" htmlFor="event-title">Event title *</label>
            <input id="event-title" name="title" required maxLength={150} defaultValue={event?.title ?? ''} className="input-field" />
          </div>
          <div>
            <label className="label-text" htmlFor="event-date">Date and time *</label>
            <input
              id="event-date"
              name="date"
              type="datetime-local"
              required
              defaultValue={event ? toLocalInput(event.date) : ''}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text" htmlFor="event-venue">Venue *</label>
            <input id="event-venue" name="venue" required maxLength={150} defaultValue={event?.venue ?? ''} className="input-field" />
          </div>
          <div>
            <label className="label-text" htmlFor="event-category">Category *</label>
            <select id="event-category" name="category" required defaultValue={event?.category ?? EVENT_CATEGORIES[0]} className="input-field">
              {EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text" htmlFor="event-video">YouTube link</label>
            <input id="event-video" name="video_url" defaultValue={event?.video_url ?? ''} placeholder="Optional" className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-text" htmlFor="event-description">Description</label>
            <textarea
              id="event-description"
              name="description"
              rows={4}
              maxLength={2000}
              defaultValue={event?.description ?? ''}
              className="input-field resize-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label-text">Event image (JPG, PNG, or WEBP)</label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm font-medium text-navy-700 transition hover:border-saffron-400 hover:text-saffron-700">
              <Upload size={18} />
              <span className="truncate">{fileLabel(imageFile, event?.image_url ? 'Replace current image' : 'Choose an image')}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pickFile(e, IMAGE_TYPES, setImageFile)} />
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="label-text">Report file (optional)</label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm font-medium text-navy-700 transition hover:border-saffron-400 hover:text-saffron-700">
              <Upload size={18} />
              <span className="truncate">{fileLabel(reportFile, event?.report_url ? 'Replace current report' : 'Choose a PDF or image')}</span>
              <input type="file" accept={DOCUMENT_TYPES.join(',')} className="hidden" onChange={(e) => pickFile(e, DOCUMENT_TYPES, setReportFile)} />
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            <Save size={16} /> {saving ? 'Saving…' : event ? 'Save Changes' : 'Publish Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
