import { useState } from 'react';
import { adminCall } from '@/lib/supabase';
import { toLocalInput } from '@/lib/quizFormat';
import AdminModalShell from '@/components/admin/AdminModalShell';
import type { AdminQuiz } from '@/types/quiz';

interface Props {
  passkey: string;
  quiz: AdminQuiz | null;
  onClose: () => void;
  onSaved: () => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export default function QuizFormModal({ passkey, quiz, onClose, onSaved }: Props) {
  const isNew = quiz === null;
  const [title, setTitle] = useState(quiz?.title ?? '');
  const [description, setDescription] = useState(quiz?.description ?? '');
  const [startsAt, setStartsAt] = useState(quiz ? toLocalInput(quiz.starts_at) : toLocalInput(new Date().toISOString()));
  const [expiresAt, setExpiresAt] = useState(
    quiz ? toLocalInput(quiz.expires_at) : toLocalInput(new Date(Date.now() + 7 * DAY_MS).toISOString()),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extend = (days: number) => {
    const base = Math.max(Date.parse(expiresAt) || Date.now(), Date.now());
    setExpiresAt(toLocalInput(new Date(base + days * DAY_MS).toISOString()));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const start = new Date(startsAt);
    const expires = new Date(expiresAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(expires.getTime())) {
      setError('Please choose valid start and expiry times.');
      return;
    }
    if (expires <= start) {
      setError('Expiry must be after the start time.');
      return;
    }
    setSaving(true);
    try {
      await adminCall(passkey, isNew ? 'create_quiz' : 'update_quiz', {
        ...(isNew ? {} : { id: quiz.id }),
        title: title.trim(),
        description: description.trim() || null,
        starts_at: start.toISOString(),
        expires_at: expires.toISOString(),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the quiz');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModalShell title={isNew ? 'New Quiz' : 'Edit Quiz / Extend Time'} onClose={onClose}>
      <form onSubmit={save} className="space-y-5">
        <div>
          <label className="label-text" htmlFor="quiz-title">Quiz title *</label>
          <input id="quiz-title" required value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="e.g. Sanatan Dharma Basics 2025" />
        </div>
        <div>
          <label className="label-text" htmlFor="quiz-desc">Description</label>
          <textarea id="quiz-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="input-field resize-none" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text" htmlFor="quiz-start">Starts at *</label>
            <input id="quiz-start" type="datetime-local" required value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text" htmlFor="quiz-expires">Expires at *</label>
            <input id="quiz-expires" type="datetime-local" required value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="input-field" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-navy-500">Extend expiry by:</span>
          {[1, 7, 30].map((d) => (
            <button key={d} type="button" onClick={() => extend(d)} className="rounded-full bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-100">
              +{d} {d === 1 ? 'day' : 'days'}
            </button>
          ))}
        </div>

        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

        <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
          {saving ? 'Saving…' : isNew ? 'Create Quiz' : 'Save Changes'}
        </button>
      </form>
    </AdminModalShell>
  );
}
