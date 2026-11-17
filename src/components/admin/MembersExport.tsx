import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { adminCall } from '@/lib/supabase';
import { downloadCsv, type CsvColumn } from '@/lib/csv';
import type { PersonRow } from '@/components/admin/personKinds';

const EXPORT_COLUMNS: CsvColumn[] = [
  { key: 'name', label: 'Full Name' },
  { key: 'department', label: 'Department' },
  { key: 'batch', label: 'Batch' },
  { key: 'role', label: 'Status' },
  { key: 'blood_group', label: 'Blood Group' },
  { key: 'phone', label: 'Phone' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'email', label: 'Email' },
  { key: 'permanent_address', label: 'Permanent Address' },
  { key: 'facebook_url', label: 'Facebook' },
];

export default function MembersExport({ passkey }: { passkey: string }) {
  const [members, setMembers] = useState<PersonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dept, setDept] = useState('All');
  const [batch, setBatch] = useState('All');

  useEffect(() => {
    adminCall<{ data?: PersonRow[] }>(passkey, 'list_people', { kind: 'members' })
      .then((res) => {
        if (!Array.isArray(res.data)) throw new Error('Unexpected response from the server');
        setMembers(res.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load members'))
      .finally(() => setLoading(false));
  }, [passkey]);

  const departments = useMemo(
    () => [...new Set(members.map((m) => String(m.department ?? '')).filter(Boolean))].sort(),
    [members],
  );
  const batches = useMemo(
    () => [...new Set(members.map((m) => String(m.batch ?? '')).filter(Boolean))].sort().reverse(),
    [members],
  );

  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          (dept === 'All' || m.department === dept) &&
          (batch === 'All' || m.batch === batch),
      ),
    [members, dept, batch],
  );

  const exportList = () => {
    const parts = [dept === 'All' ? 'all-departments' : dept, batch === 'All' ? 'all-batches' : `batch-${batch}`];
    const slug = parts.join('_').replace(/[^\w-]+/g, '-');
    downloadCsv(filtered, EXPORT_COLUMNS, `svs-members_${slug}.csv`);
  };

  return (
    <div className="card p-6">
      <h3 className="font-display text-lg font-semibold text-navy-900">Export Member List</h3>
      <p className="mt-1 text-sm text-navy-500">
        Download a spreadsheet (CSV) of members. Choose one department, one batch, or both.
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-text" htmlFor="export-dept">Department</label>
          <select
            id="export-dept"
            value={dept}
            disabled={loading}
            onChange={(e) => setDept(e.target.value)}
            className="input-field"
          >
            <option value="All">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-text" htmlFor="export-batch">Batch</label>
          <select
            id="export-batch"
            value={batch}
            disabled={loading}
            onChange={(e) => setBatch(e.target.value)}
            className="input-field"
          >
            <option value="All">All batches</option>
            {batches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-navy-500">
          {loading ? 'Loading members…' : <>{filtered.length} member{filtered.length === 1 ? '' : 's'} will be exported</>}
        </p>
        <button
          onClick={exportList}
          disabled={loading || filtered.length === 0}
          className="btn-primary disabled:opacity-60"
        >
          <Download size={16} /> Download CSV
        </button>
      </div>
    </div>
  );
}
