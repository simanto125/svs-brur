import { useState, type FormEvent } from 'react';
import { BookPlus, Send } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { publicCall } from '@/lib/supabase';
import { MAX_BOOK_BYTES, uploadBookPdf, validateBookPdf, type SignedUpload } from '@/lib/bookUpload';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function AddBookModal({ open, onClose, onSubmitted }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get('pdf') as File | null;
    if (!file?.size) {
      setError('Please choose a PDF file.');
      return;
    }
    const fileError = validateBookPdf(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    setSubmitting(true);
    try {
      const pdf_path = await uploadBookPdf(file, (size) =>
        publicCall<SignedUpload>('create_book_upload', { size }),
      );
      await publicCall<{ success?: boolean }>('submit_book', {
        title: fd.get('title'),
        author: fd.get('author') || null,
        description: fd.get('description') || null,
        submitted_by: fd.get('submitted_by') || null,
        pdf_path,
      });
      form.reset();
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} label="Add a book" size="md">
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl bg-saffron-100 p-2.5 text-saffron-700">
            <BookPlus size={20} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-navy-900">Add a Book</h2>
            <p className="text-sm text-navy-500">Your book appears in the library after review.</p>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label-text" htmlFor="book-title">Book title *</label>
            <input id="book-title" name="title" required maxLength={200} className="input-field" />
          </div>
          <div>
            <label className="label-text" htmlFor="book-author">Author</label>
            <input id="book-author" name="author" maxLength={120} className="input-field" />
          </div>
          <div>
            <label className="label-text" htmlFor="book-submitter">Your name</label>
            <input id="book-submitter" name="submitted_by" maxLength={120} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-text" htmlFor="book-description">Short description</label>
            <textarea
              id="book-description"
              name="description"
              rows={3}
              maxLength={1000}
              className="input-field resize-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-text" htmlFor="book-pdf">PDF file (max {MAX_BOOK_BYTES / (1024 * 1024)} MB) *</label>
            <input id="book-pdf" name="pdf" type="file" accept="application/pdf" required className="input-field" />
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
            <Send size={16} /> {submitting ? 'Uploading…' : 'Submit Book'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
