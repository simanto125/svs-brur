import { useCallback, useEffect, useState } from 'react';
import { ChevronRight, Facebook } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import PersonEditModal from '@/components/admin/PersonEditModal';
import MembersExport from '@/components/admin/MembersExport';
import PeopleCsvExport from '@/components/admin/PeopleCsvExport';
import {
  PERSON_KIND_LABELS,
  personSubtitle,
  type PersonKind,
  type PersonRow,
} from '@/components/admin/personKinds';
import { adminCall } from '@/lib/supabase';

const KINDS: PersonKind[] = ['members', 'committee', 'advisors'];

export default function PeopleEditor({ passkey }: { passkey: string }) {
  const [kind, setKind] = useState<PersonKind>('members');
  const [rows, setRows] = useState<PersonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<PersonRow | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminCall<{ data?: PersonRow[]; error?: string }>(passkey, 'list_people', { kind });
      if (res.error) throw new Error(res.error);
      if (!Array.isArray(res.data)) throw new Error('Unexpected response from the server');
      setRows(res.data);
    } catch (err) {
      setRows([]);
      setError(err instanceof Error ? err.message : 'Could not load the list');
    } finally {
      setLoading(false);
    }
  }, [passkey, kind]);

  useEffect(() => {
    load();
  }, [load]);

  const switchKind = (next: PersonKind) => {
    setKind(next);
    setSavedMsg(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => switchKind(k)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              kind === k ? 'bg-navy-900 text-white' : 'bg-white text-navy-600 hover:bg-navy-50'
            }`}
          >
            {PERSON_KIND_LABELS[k]}
          </button>
        ))}
      </div>

      {kind === 'members' && <MembersExport passkey={passkey} />}
      {kind !== 'members' && !loading && !error && rows.length > 0 && (
        <PeopleCsvExport kind={kind} rows={rows} />
      )}

      {savedMsg && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {savedMsg}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Could not load the list: {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-navy-50" />
          ))}
        </div>
      ) : rows.length === 0 && !error ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-navy-500 shadow-soft">
          No {PERSON_KIND_LABELS[kind].toLowerCase()} found.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <button
              key={row.id}
              onClick={() => setEditing(row)}
              className="group flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              <Avatar src={row.photo_url} name={row.name} className="h-16 w-16 flex-none" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-navy-900">{row.name}</p>
                <p className="truncate text-sm text-navy-500">{personSubtitle(kind, row)}</p>
                {row.facebook_url && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-navy-500">
                    <Facebook size={12} /> Facebook linked
                  </span>
                )}
              </div>
              <ChevronRight size={18} className="flex-none text-navy-300 transition group-hover:translate-x-0.5 group-hover:text-saffron-600" />
            </button>
          ))}
        </div>
      )}

      {editing && (
        <PersonEditModal
          key={editing.id}
          kind={kind}
          person={editing}
          passkey={passkey}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setSavedMsg(`${editing.name} was updated.`);
            setEditing(null);
            load();
          }}
          onDeleted={() => {
            setSavedMsg(`${editing.name} was deleted.`);
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
