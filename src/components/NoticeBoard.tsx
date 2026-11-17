import { useState } from 'react';
import { Download, FileText, ScrollText, BookMarked, ExternalLink } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import { NOTICE_TYPES } from '@/data/constants';
import { trackDownload } from '@/lib/downloads';
import type { Notice } from '@/types';

const typeMeta: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  Notice: { icon: FileText, color: 'text-saffron-700', bg: 'bg-saffron-100' },
  Constitution: { icon: ScrollText, color: 'text-navy-700', bg: 'bg-navy-100' },
  'Study Resource': { icon: BookMarked, color: 'text-blue-700', bg: 'bg-blue-50' },
};

const filters = ['All', ...NOTICE_TYPES];

export default function NoticeBoard() {
  const { data: notices, loading } = useSupabaseQuery<Notice>(
    'notices',
    '*',
    [],
    { column: 'date', ascending: false },
  );

  const [filter, setFilter] = useState('All');
  const list = filter === 'All' ? notices : notices.filter((n) => n.type === filter);

  return (
    <section id="notice" className="py-24">
      <div className="container-x">
        <div className="text-center">
          <span className="eyebrow">Information Hub</span>
          <h2 className="section-title mt-3">Notice Board &amp; Documents</h2>
          <p className="mx-auto mt-4 max-w-2xl text-navy-600">
            Official notices, our constitution and guidelines, and study
            resources — all available to download.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === f
                  ? 'bg-navy-gradient text-white shadow-soft'
                  : 'bg-white text-navy-600 ring-1 ring-navy-200 hover:ring-saffron-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-8 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-24 animate-pulse bg-navy-50" />
            ))}
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {list.map((n) => {
              const meta = typeMeta[n.type];
              return (
                <div
                  key={n.id}
                  className="card flex flex-col gap-4 p-5 transition hover:shadow-glow sm:flex-row sm:items-center"
                >
                  <div className={`flex h-14 w-14 flex-none items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                    <meta.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.bg} ${meta.color}`}>
                        {n.type}
                      </span>
                      <span className="text-xs text-navy-400">
                        {new Date(n.date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-semibold text-navy-900">{n.title}</h3>
                    {n.description && (
                      <p className="mt-1 text-sm text-navy-600">{n.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    {n.file_size && (
                      <span className="text-xs text-navy-400">{n.file_size}</span>
                    )}
                    {n.file_url && (
                      <span className="text-xs text-navy-400">
                        {n.download_count} {n.download_count === 1 ? 'download' : 'downloads'}
                      </span>
                    )}
                    {n.file_url ? (
                      <a
                        href={n.file_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackDownload('notice', n.id)}
                        className="btn-ghost text-xs"
                      >
                        <Download size={14} /> Download
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-navy-400">
                        <ExternalLink size={14} /> No file
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {list.length === 0 && (
              <p className="text-center text-navy-500">No notices in this category.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
