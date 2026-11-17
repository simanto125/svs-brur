import { useMemo, useState } from 'react';
import { Award, Facebook } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import ProfileModal from '@/components/ProfileModal';
import type { CommitteeMember, PastCommitteeMember } from '@/types';

type View = 'recent' | 'past';

const views: { id: View; label: string }[] = [
  { id: 'recent', label: 'Recent Committee' },
  { id: 'past', label: 'Past Committee' },
];

export default function Committee() {
  const { data: committee } = useSupabaseQuery<CommitteeMember>(
    'committee',
    '*',
    [],
    { column: 'sort_order', ascending: true },
  );
  const { data: past } = useSupabaseQuery<PastCommitteeMember>(
    'past_committees',
    '*',
    [],
    { column: 'sort_order', ascending: true },
  );

  const [view, setView] = useState<View>('recent');
  const [selected, setSelected] = useState<CommitteeMember | null>(null);
  const [pastSelected, setPastSelected] = useState<PastCommitteeMember | null>(null);

  const years = useMemo(
    () => [...new Set(past.map((p) => p.year))].sort((a, b) => b.localeCompare(a)),
    [past],
  );
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const activeYear = selectedYear ?? years[0] ?? '';
  const pastMembers = past.filter((p) => p.year === activeYear);

  const activeModalMember = selected
    ? {
        name: selected.name,
        designation: selected.designation,
        university: selected.university,
        department: selected.department,
        batch: selected.batch,
        blood_group: selected.blood_group,
        phone: selected.phone,
        photo_url: selected.photo_url,
        facebook_url: selected.facebook_url,
      }
    : pastSelected
    ? {
        name: pastSelected.name,
        designation: pastSelected.designation,
        department: pastSelected.department,
        batch: pastSelected.batch,
        photo_url: pastSelected.photo_url,
      }
    : null;

  return (
    <section id="committee" className="py-24">
      <div className="container-x">
        <div className="text-center">
          <span className="eyebrow">Leadership</span>
          <h2 className="section-title mt-3">Executive Committee</h2>
          <p className="mx-auto mt-4 max-w-2xl text-navy-600">
            The dedicated students who guide SVS through devotion, planning,
            and service to our community.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <div role="tablist" className="inline-flex rounded-full bg-white p-1 ring-1 ring-navy-200 shadow-soft">
            {views.map((v) => (
              <button
                key={v.id}
                role="tab"
                aria-selected={view === v.id}
                onClick={() => setView(v.id)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  view === v.id
                    ? 'bg-navy-gradient text-white shadow-soft'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {view === 'recent' ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {committee.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={`card relative w-full overflow-hidden p-6 text-center transition hover:-translate-y-1 hover:shadow-glow ${
                  m.highlight ? 'ring-2 ring-saffron-400' : ''
                }`}
              >
                {m.highlight && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-navy-950 shadow-glow">
                    <Award size={11} /> Highlighted
                  </span>
                )}
                <img
                  src={m.photo_url ?? ''}
                  alt={m.name}
                  className={`mx-auto h-24 w-24 rounded-full object-cover ring-4 ${
                    m.highlight ? 'ring-saffron-400' : 'ring-saffron-200'
                  }`}
                />
                <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">
                  {m.name}
                </h3>
                <p className="text-sm font-semibold text-saffron-700">
                  {m.designation}
                </p>
                {m.university && (
                  <p className="mt-1 text-xs text-navy-500">{m.university}</p>
                )}
                <p className="mt-1 text-xs text-navy-500">{m.department}</p>
                <p className="mt-1 text-xs text-navy-400">Batch {m.batch}</p>
                {m.facebook_url && (
                  <span
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 inline-flex rounded-full bg-navy-50 p-2 text-navy-600"
                  >
                    <a
                      href={m.facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${m.name} on Facebook`}
                      className="transition hover:text-saffron-700"
                    >
                      <Facebook size={16} />
                    </a>
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : years.length === 0 ? (
          <p className="mt-12 text-center text-navy-500">No past committees added yet.</p>
        ) : (
          <div className="mt-12">
            <div className="flex flex-wrap justify-center gap-2">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeYear === y
                      ? 'bg-navy-gradient text-white shadow-soft'
                      : 'bg-white text-navy-600 ring-1 ring-navy-200 hover:ring-saffron-400'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pastMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPastSelected(m)}
                  className="card flex w-full items-center gap-4 p-5 text-left transition hover:-translate-y-1"
                >
                  <img
                    src={m.photo_url ?? ''}
                    alt={m.name}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-navy-100"
                  />
                  <div>
                    <h4 className="font-semibold text-navy-900">{m.name}</h4>
                    <p className="text-sm font-medium text-saffron-700">
                      {m.designation}
                    </p>
                    <p className="text-xs text-navy-500">
                      {m.department} · Batch {m.batch ?? '—'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ProfileModal
        open={!!activeModalMember}
        onClose={() => {
          setSelected(null);
          setPastSelected(null);
        }}
        member={activeModalMember}
      />
    </section>
  );
}
