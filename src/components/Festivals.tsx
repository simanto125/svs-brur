import { useMemo, useState } from 'react';
import { CalendarHeart, Sparkles } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import { FESTIVAL_CATEGORIES } from '@/data/constants';
import type { Festival } from '@/types';

const categoryColors: Record<string, string> = {
  Pujas: 'bg-saffron-500/90 text-navy-950',
  'Vratas/Broto': 'bg-navy-700/90 text-saffron-200',
  'Cultural & Harmony': 'bg-green-600/90 text-white',
};

export default function Festivals() {
  const { data: festivals, loading } = useSupabaseQuery<Festival>(
    'festivals',
    '*',
    [],
    { column: 'sort_order', ascending: true },
  );
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Festival | null>(null);

  const filtered = useMemo(
    () => (filter === 'All' ? festivals : festivals.filter((f) => f.category === filter)),
    [festivals, filter],
  );

  return (
    <section id="festivals" className="bg-saffron-50/40 py-24">
      <div className="container-x">
        <div className="text-center">
          <span className="eyebrow">Annual Observances</span>
          <h2 className="section-title mt-3">
            বাৎসরিক উৎসব ও ধর্মীয় ব্রতমালা
          </h2>
          <p className="mt-1 font-display text-xl text-navy-700">
            Annual Festivals &amp; Spiritual Observances
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-navy-600">
            Eight sacred occasions celebrated throughout the year with devotion,
            culture, and community harmony.
          </p>
        </div>

        {/* filter tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {FESTIVAL_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === c
                  ? 'bg-navy-gradient text-white shadow-soft'
                  : 'bg-white text-navy-600 ring-1 ring-navy-200 hover:ring-saffron-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* grid */}
        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-navy-50" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelected(f)}
                className="card group overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="relative h-40 overflow-hidden">
                  {f.image_url ? (
                    <img
                      src={f.image_url}
                      alt={f.english_title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-navy-gradient">
                      <CalendarHeart size={40} className="text-saffron-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      categoryColors[f.category] ?? 'bg-navy-900/80 text-saffron-200'
                    }`}
                  >
                    {f.category}
                  </span>
                  <h3 className="absolute bottom-3 left-3 right-3 font-display text-lg font-bold leading-tight text-white">
                    {f.bangla_title}
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-navy-900">
                    {f.english_title.split('—')[0].trim()}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-xs text-navy-500">
                    {f.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-saffron-600 transition group-hover:text-saffron-700">
                    <Sparkles size={12} /> View details
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* festival detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-soft animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {selected.image_url && (
              <div className="relative h-56 overflow-hidden rounded-t-3xl">
                <img
                  src={selected.image_url}
                  alt={selected.english_title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <span
                    className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      categoryColors[selected.category] ?? 'bg-navy-900/80 text-saffron-200'
                    }`}
                  >
                    {selected.category}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white">
                    {selected.bangla_title}
                  </h3>
                  <p className="text-sm text-saffron-200">{selected.english_title}</p>
                </div>
              </div>
            )}
            <div className="p-6">
              {!selected.image_url && (
                <>
                  <span
                    className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      categoryColors[selected.category] ?? 'bg-navy-900/80 text-saffron-200'
                    }`}
                  >
                    {selected.category}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-navy-900">
                    {selected.bangla_title}
                  </h3>
                  <p className="text-sm text-saffron-700">{selected.english_title}</p>
                </>
              )}
              <div className="mt-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-saffron-600">
                  Description
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-navy-700">
                  {selected.description}
                </p>
              </div>
              <div className="mt-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-saffron-600">
                  Significance
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-navy-700">
                  {selected.significance}
                </p>
              </div>
              <a
                href="#gallery"
                onClick={() => setSelected(null)}
                className="btn-ghost mt-6 w-full"
              >
                <CalendarHeart size={16} /> View Past Photos
              </a>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 rounded-full bg-navy-950/70 p-2 text-white transition hover:bg-navy-950"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
