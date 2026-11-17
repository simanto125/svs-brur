import { useMemo, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import PastCommitteeMemberModal from '@/components/admin/PastCommitteeMemberModal';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import type { PastCommitteeMember } from '@/types';

export default function PastCommitteeEditor({ passkey }: { passkey: string }) {
  const { data, reload } = useSupabaseQuery<PastCommitteeMember>(
    'past_committees',
    '*',
    [],
    { column: 'sort_order', ascending: true },
  );
  const years = useMemo(
    () => [...new Set(data.map((m) => m.year))].sort((a, b) => parseInt(b, 10) - parseInt(a, 10)),
    [data],
  );
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const activeYear = selectedYear && years.includes(selectedYear) ? selectedYear : years[0] ?? '';
  const members = data.filter((m) => m.year === activeYear);
  const [editing, setEditing] = useState<PastCommitteeMember | 'new' | null>(null);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-navy-900">Past Committees</h2>
          <p className="mt-1 text-sm text-navy-500">Pick a year, then add, edit, or remove its members.</p>
        </div>
        <button onClick={() => setEditing('new')} className="btn-primary">
          <Plus size={16} /> Add Member
        </button>
      </div>

      {years.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
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
      )}

      <div className="mt-6 space-y-3">
        {members.length === 0 && (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-navy-500 ring-1 ring-navy-100">
            No past committee members yet. Use Add Member to create the first year.
          </p>
        )}
        {members.map((m) => (
          <div key={m.id} className="card flex items-center gap-4 p-4">
            {m.photo_url ? (
              <img src={m.photo_url} alt={m.name} className="h-14 w-14 flex-none rounded-full object-cover ring-2 ring-navy-100" />
            ) : (
              <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-navy-50 text-xs text-navy-400">No photo</div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-navy-900">{m.name}</h3>
              <p className="truncate text-sm font-medium text-saffron-700">{m.designation}</p>
              <p className="truncate text-xs text-navy-500">
                {m.department}{m.batch ? ` · Batch ${m.batch}` : ''}
              </p>
            </div>
            <button
              onClick={() => setEditing(m)}
              aria-label={`Edit ${m.name}`}
              className="rounded-full bg-navy-50 p-2 text-navy-600 transition hover:bg-navy-100"
            >
              <Pencil size={16} />
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <PastCommitteeMemberModal
          passkey={passkey}
          member={editing === 'new' ? null : editing}
          defaultYear={activeYear}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
