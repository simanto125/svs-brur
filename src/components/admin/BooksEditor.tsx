import { useState } from 'react';
import { BookOpen, CheckCircle2, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import BookEditModal from '@/components/admin/BookEditModal';
import { useAdminList } from '@/hooks/useAdmin';
import { adminCall } from '@/lib/supabase';
import type { Book } from '@/types';

export default function BooksEditor({ passkey }: { passkey: string }) {
  const { items, loading, reload } = useAdminList<Book>(passkey, 'list_books');
  const [editing, setEditing] = useState<Book | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const pending = items.filter((b) => b.status === 'pending');
  const approved = items.filter((b) => b.status === 'approved');

  const run = async (action: string, id: string, success: string) => {
    setMessage(null);
    try {
      await adminCall(passkey, action, { id });
      setMessage({ kind: 'ok', text: success });
      reload();
    } catch (err) {
      setMessage({ kind: 'err', text: err instanceof Error ? err.message : 'Action failed' });
    }
  };

  const remove = (book: Book) => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    run('delete_book', book.id, `"${book.title}" was deleted.`);
  };

  if (loading) return <p className="text-navy-500">Loading books…</p>;

  return (
    <div className="space-y-8">
      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          message.kind === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <section className="space-y-3">
        <h3 className="font-display text-lg font-semibold text-navy-900">
          Pending approval ({pending.length})
        </h3>
        {pending.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-navy-500 shadow-soft">
            No books waiting for approval.
          </p>
        )}
        {pending.map((b) => (
          <div key={b.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy-900">{b.title}</p>
              <p className="text-sm text-navy-500">
                {b.author ? `by ${b.author}` : 'No author given'}
                {b.submitted_by ? ` · submitted by ${b.submitted_by}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={b.pdf_url} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
                <ExternalLink size={14} /> View PDF
              </a>
              <button
                onClick={() => run('approve_book', b.id, `"${b.title}" was approved.`)}
                className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100"
              >
                <CheckCircle2 size={15} /> Approve
              </button>
              <button
                onClick={() => remove(b)}
                className="rounded-full bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                aria-label="Delete book"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-semibold text-navy-900">
          Library ({approved.length})
        </h3>
        {approved.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-navy-500 shadow-soft">
            No approved books yet.
          </p>
        )}
        {approved.map((b) => (
          <div key={b.id} className="card flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-navy-100 text-navy-600">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-navy-900">{b.title}</p>
              <p className="truncate text-xs text-navy-500">
                {b.author ?? 'No author given'} · {b.download_count} {b.download_count === 1 ? 'download' : 'downloads'}
              </p>
            </div>
            <a href={b.pdf_url} target="_blank" rel="noreferrer" className="rounded-full bg-navy-50 p-2 text-navy-600 transition hover:bg-navy-100" aria-label="View PDF">
              <ExternalLink size={16} />
            </a>
            <button
              onClick={() => setEditing(b)}
              className="rounded-full bg-navy-50 p-2 text-navy-600 transition hover:bg-navy-100"
              aria-label="Edit book"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => remove(b)}
              className="rounded-full bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
              aria-label="Delete book"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </section>

      {editing && (
        <BookEditModal
          key={editing.id}
          book={editing}
          passkey={passkey}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setMessage({ kind: 'ok', text: 'Book updated.' });
            reload();
          }}
        />
      )}
    </div>
  );
}
