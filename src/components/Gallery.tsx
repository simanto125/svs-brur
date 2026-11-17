import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import { GALLERY_CATEGORIES } from '@/data/constants';
import type { GalleryImage } from '@/types';

type Tab = (typeof GALLERY_CATEGORIES)[number];

export default function Gallery() {
  const { data: images, loading } = useSupabaseQuery<GalleryImage>(
    'gallery_images',
    '*',
    [],
    { column: 'sort_order', ascending: true },
  );

  const [tab, setTab] = useState<Tab>('Pujas');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = images.filter((g) => g.category === tab);

  const close = () => setLightbox(null);
  const prev = () =>
    setLightbox((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
  const next = () =>
    setLightbox((i) => (i === null ? null : (i + 1) % filtered.length));

  return (
    <section id="gallery" className="bg-navy-gradient py-24">
      <div className="container-x">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron-300">
            Moments &amp; Memories
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Media Gallery
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-navy-100">
            A glimpse of our celebrations, cultural programs, and community
            service through the years.
          </p>
        </div>

        {/* tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {GALLERY_CATEGORIES.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                tab === t
                  ? 'bg-gold-gradient text-navy-950 shadow-glow'
                  : 'bg-white/10 text-navy-100 ring-1 ring-white/20 hover:bg-white/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* grid */}
        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-white/10" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setLightbox(i)}
                className="group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-white/10"
              >
                <img
                  src={img.image_url}
                  alt={img.title ?? 'Gallery photo'}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-navy-950/0 transition group-hover:bg-navy-950/40">
                  <ZoomIn
                    size={24}
                    className="text-white opacity-0 transition group-hover:opacity-100"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/95 p-4 backdrop-blur"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-3 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:left-6"
            aria-label="Previous"
          >
            <ChevronLeft size={28} />
          </button>
          <img
            src={filtered[lightbox].image_url}
            alt={filtered[lightbox].title ?? 'Gallery photo'}
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-3 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:right-6"
            aria-label="Next"
          >
            <ChevronRight size={28} />
          </button>
          {filtered[lightbox].title && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-navy-100">
              {filtered[lightbox].title}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
