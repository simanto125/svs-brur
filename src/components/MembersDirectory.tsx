import { useMemo, useState } from 'react';
import { Droplet, Phone, Users } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import { BLOOD_GROUPS } from '@/data/constants';
import ProfileModal from '@/components/ProfileModal';
import AnimatedSearch from '@/components/ui/AnimatedSearch';
import type { Member } from '@/types';

const bloodColor: Record<string, string> = {
  'O+': 'text-red-600 bg-red-50',
  'O-': 'text-red-700 bg-red-100',
  'A+': 'text-blue-600 bg-blue-50',
  'A-': 'text-blue-700 bg-blue-100',
  'B+': 'text-green-600 bg-green-50',
  'B-': 'text-green-700 bg-green-100',
  'AB+': 'text-purple-600 bg-purple-50',
  'AB-': 'text-purple-700 bg-purple-100',
};

export default function MembersDirectory() {
  const { data: members, loading } = useSupabaseQuery<Member>(
    'members',
    'id,name,department,batch,blood_group,phone,whatsapp,permanent_address,photo_url,role,created_at',
    [],
    { column: 'created_at', ascending: true },
  );

  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('All');
  const [batch, setBatch] = useState('All');
  const [role, setRole] = useState('All');
  const [bloodFilter, setBloodFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Member | null>(null);

  const departments = useMemo(
    () => ['All', ...new Set(members.map((m) => m.department))],
    [members],
  );
  const batches = useMemo(
    () => ['All', ...new Set(members.map((m) => m.batch))].sort(
      (a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : b.localeCompare(a)),
    ),
    [members],
  );

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.batch.toLowerCase().includes(q);
      const matchesDept = dept === 'All' || m.department === dept;
      const matchesBatch = batch === 'All' || m.batch === batch;
      const matchesRole = role === 'All' || m.role === role;
      const matchesBlood = !bloodFilter || m.blood_group === bloodFilter;
      return matchesQuery && matchesDept && matchesBatch && matchesRole && matchesBlood;
    });
  }, [members, query, dept, batch, role, bloodFilter]);

  return (
    <section id="directory" className="bg-saffron-50/40 py-24">
      <div className="container-x">
        <div className="text-center">
          <span className="eyebrow">Our Family</span>
          <h2 className="section-title mt-3">Members Directory</h2>
          <p className="mx-auto mt-4 max-w-2xl text-navy-600">
            Search and connect with current SVS members and alumni by name,
            department, or batch.
          </p>
        </div>

        {/* Blood Donor Finder */}
        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50/40 p-5">
          <div className="flex items-center gap-2">
            <Droplet size={20} className="text-red-600" />
            <h3 className="font-display text-lg font-semibold text-navy-900">
              Emergency Blood Finder
            </h3>
          </div>
          <p className="mt-1 text-sm text-navy-500">
            Tap a blood group to find matching donors instantly.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                onClick={() => setBloodFilter(bloodFilter === bg ? null : bg)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
                  bloodFilter === bg
                    ? bloodColor[bg] ?? 'bg-navy-100 text-navy-700'
                    : 'bg-white text-navy-600 ring-1 ring-navy-200 hover:ring-red-400'
                }`}
              >
                <Droplet size={13} /> {bg}
              </button>
            ))}
            {bloodFilter && (
              <button
                onClick={() => setBloodFilter(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-navy-500 transition hover:text-red-600"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* filters */}
        <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="label-text" htmlFor="member-search">Search</label>
              <AnimatedSearch
                id="member-search"
                value={query}
                onChange={setQuery}
                placeholder="Name, department, or batch…"
              />
            </div>
            <div className="lg:w-56">
              <label className="label-text">Department</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="input-field"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:w-36">
              <label className="label-text">Batch</label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="input-field"
              >
                {batches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:w-44">
              <label className="label-text">Status</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field"
              >
                <option value="All">All</option>
                <option value="Current Member">Current Member</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>
          </div>
          <p className="mt-4 text-sm text-navy-500">
            Showing <span className="font-semibold text-navy-800">{filtered.length}</span> of {members.length} members
          </p>
        </div>

        {/* grid */}
        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card h-40 animate-pulse bg-navy-50" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className="card group w-full p-5 text-left transition hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={m.photo_url ?? ''}
                    alt={m.name}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-saffron-200 transition group-hover:ring-saffron-400"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-navy-900">
                      {m.name}
                    </h3>
                    <p className="truncate text-sm text-navy-500">
                      {m.department}
                    </p>
                    <span
                      className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        m.role === 'Alumni'
                          ? 'bg-navy-100 text-navy-700'
                          : 'bg-saffron-100 text-saffron-800'
                      }`}
                    >
                      {m.role}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-navy-50 pt-3 text-sm">
                  <span className="flex items-center gap-1.5 text-navy-600">
                    <Users size={14} /> Batch {m.batch}
                  </span>
                  {m.blood_group && (
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                        bloodColor[m.blood_group] ?? 'text-navy-600 bg-navy-50'
                      }`}
                    >
                      <Droplet size={12} /> {m.blood_group}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-navy-400">
                    <Phone size={14} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="mt-12 text-center text-navy-500">
            <p>No members match your search. Try adjusting the filters.</p>
          </div>
        )}
      </div>

      <ProfileModal
        open={!!selected}
        onClose={() => setSelected(null)}
        member={selected}
      />
    </section>
  );
}
