import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock,
  Download,
  MapPin,
  PlayCircle,
  Tag,
} from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import { EVENT_CATEGORIES } from '@/data/constants';
import VideoModal from '@/components/VideoModal';
import type { EventItem } from '@/types';

function useCountdown(target: string) {
  const targetDate = useMemo(() => new Date(target).getTime(), [target]);
  const [time, setTime] = useState(targetDate - Date.now());

  useEffect(() => {
    const id = setInterval(() => setTime(targetDate - Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (time <= 0) return null;

  const days = Math.floor(time / 86400000);
  const hours = Math.floor((time / 3600000) % 24);
  const minutes = Math.floor((time / 60000) % 60);
  const seconds = Math.floor((time / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function Countdown({ date }: { date: string }) {
  const t = useCountdown(date);
  if (!t) return <span className="text-sm font-medium text-green-600">Event is live!</span>;
  const units = [
    { label: 'Days', value: t.days },
    { label: 'Hrs', value: t.hours },
    { label: 'Min', value: t.minutes },
    { label: 'Sec', value: t.seconds },
  ];
  return (
    <div className="flex gap-2">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex w-16 flex-col items-center rounded-xl bg-navy-950/80 py-2 backdrop-blur"
        >
          <span className="font-display text-2xl font-bold text-saffron-300 tabular-nums">
            {String(u.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-navy-200">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function Events() {
  const { data: events, loading } = useSupabaseQuery<EventItem>(
    'events',
    '*',
    [],
    { column: 'date', ascending: true },
  );

  const [cat, setCat] = useState('All');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');

  const upcoming = events.filter((e) => e.status === 'upcoming');
  const past = events.filter((e) => e.status === 'past');
  const categories = ['All', ...EVENT_CATEGORIES];
  const pastFiltered = cat === 'All' ? past : past.filter((e) => e.category === cat);

  const openVideo = (url: string, title: string) => {
    setVideoUrl(url);
    setVideoTitle(title);
  };

  return (
    <section id="events" className="py-24">
      <div className="container-x">
        <div className="text-center">
          <span className="eyebrow">Calendar of Devotion</span>
          <h2 className="section-title mt-3">Events &amp; Pujas</h2>
          <p className="mx-auto mt-4 max-w-2xl text-navy-600">
            From sacred pujas to cultural celebrations and welfare drives —
            join us throughout the year.
          </p>
        </div>

        {/* upcoming events */}
        {loading ? (
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-navy-50" />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {upcoming.map((e) => (
              <div key={e.id} className="card group overflow-hidden hover:shadow-glow">
                <div className="relative h-48 overflow-hidden">
                  {e.image_url && (
                    <img
                      src={e.image_url}
                      alt={e.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-saffron-500/90 px-3 py-1 text-xs font-semibold text-navy-950">
                    <Tag size={12} /> {e.category}
                  </span>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="font-display text-xl font-bold text-white">
                      {e.title}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-navy-600">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={15} /> {fmtDate(e.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={15} /> {e.venue}
                    </span>
                  </div>
                  {e.description && (
                    <p className="mt-3 text-sm text-navy-600">{e.description}</p>
                  )}
                  <div className="mt-5 border-t border-navy-50 pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron-600">
                      Starts In
                    </p>
                    <Countdown date={e.date} />
                  </div>
                </div>
              </div>
            ))}
            {upcoming.length === 0 && (
              <p className="col-span-full text-center text-navy-500">No upcoming events at this time.</p>
            )}
          </div>
        )}

        {/* past events archive */}
        <div className="mt-16">
          <div className="flex flex-col items-center justify-between gap-4 border-t border-navy-100 pt-10 sm:flex-row">
            <div>
              <span className="eyebrow">Memories</span>
              <h3 className="mt-2 font-display text-2xl font-semibold text-navy-900">
                Past Events &amp; Archive
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    cat === c
                      ? 'bg-navy-gradient text-white shadow-soft'
                      : 'bg-white text-navy-600 ring-1 ring-navy-200 hover:ring-saffron-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {pastFiltered.map((e) => (
              <div key={e.id} className="card group overflow-hidden hover:shadow-glow">
                <div className="relative h-44 overflow-hidden">
                  {e.image_url && (
                    <img
                      src={e.image_url}
                      alt={e.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-navy-900/80 px-3 py-1 text-xs font-semibold text-saffron-200">
                    <Clock size={12} /> {fmtDate(e.date)}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-semibold text-navy-900">
                    {e.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-500">
                    <MapPin size={14} /> {e.venue}
                  </p>
                  {e.description && (
                    <p className="mt-3 text-sm text-navy-600">{e.description}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {e.video_url && (
                      <button
                        onClick={() => openVideo(e.video_url!, e.title)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        <PlayCircle size={15} /> Watch Video
                      </button>
                    )}
                    {e.report_url && (
                      <a
                        href={e.report_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-4 py-2 text-xs font-semibold text-navy-700 transition hover:bg-navy-100"
                      >
                        <Download size={15} /> Download Report
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <VideoModal
        open={!!videoUrl}
        onClose={() => setVideoUrl(null)}
        url={videoUrl}
        title={videoTitle}
      />
    </section>
  );
}
