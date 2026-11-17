import { useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { adminCall } from '@/lib/supabase';
import type { Book } from '@/types';

interface Props {
  book: Book;
  passkey: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function BookEditModal({ book, passkey, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author ?? '');
  const [description, setDescription] = useState(book.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await adminCall(passkey, 'update_book', { id: book.id, title, author, description });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} label="Edit book" size="md">
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-navy-900">Edit Book</h2>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="label-text" htmlFor="edit-book-title">Book title *</label>
            <input
              id="edit-book-title"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text" htmlFor="edit-book-author">Author</label>
            <input
              id="edit-book-author"
              maxLength={120}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text" htmlFor="edit-book-description">Description</label>
            <textarea
              id="edit-book-description"
              rows={4}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
