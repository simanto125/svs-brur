import { useState } from 'react';
import { BookOpen, ExternalLink, Plus } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import AddBookModal from '@/components/AddBookModal';
import { trackDownload } from '@/lib/downloads';
import type { Book } from '@/types';

export default function Books() {
  const { data: books, loading, reload } = useSupabaseQuery<Book>(
    'books',
    '*',
    [],
    { column: 'created_at', ascending: false },
  );
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <section id="books" className="py-24">
      <div className="container-x">
        <div className="text-center">
          <span className="eyebrow">Study Library</span>
          <h2 className="section-title mt-3">Book Library</h2>
          <p className="mx-auto mt-4 max-w-2xl text-navy-600">
            Read books shared by our members, or add one of your own for everyone to enjoy.
          </p>
          <button onClick={() => { setNotice(null); setAdding(true); }} className="btn-primary mt-6">
            <Plus size={16} /> Add a Book
          </button>
        </div>

        {notice && (
          <div className="mx-auto mt-6 max-w-2xl rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
            {notice}
          </div>
        )}

        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-48 animate-pulse bg-navy-50" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <p className="mt-10 text-center text-navy-500">No books in the library yet.</p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((b) => (
              <div key={b.id} className="card flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-glow">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-navy-100 text-navy-700">
                    <BookOpen size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-navy-900">{b.title}</h3>
                    {b.author && <p className="text-sm text-navy-500">by {b.author}</p>}
                  </div>
                </div>
                {b.description && (
                  <p className="mt-4 line-clamp-3 text-sm text-navy-600">{b.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                  <div className="min-w-0">
                    {b.submitted_by && (
                      <p className="truncate text-xs text-navy-400">Shared by {b.submitted_by}</p>
                    )}
                    <p className="text-xs text-navy-400">
                      {b.download_count} {b.download_count === 1 ? 'download' : 'downloads'}
                    </p>
                  </div>
                  <a
                    href={b.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackDownload('book', b.id)}
                    className="btn-ghost text-xs"
                  >
                    <ExternalLink size={14} /> Read PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddBookModal
        open={adding}
        onClose={() => setAdding(false)}
        onSubmitted={() => {
          setAdding(false);
          setNotice('Thank you! Your book has been sent for review and will appear once approved.');
          reload();
        }}
      />
    </section>
  );
}
