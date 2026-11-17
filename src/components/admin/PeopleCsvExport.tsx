import { Download } from 'lucide-react';
import { downloadCsv, type CsvColumn } from '@/lib/csv';
import type { PersonKind, PersonRow } from '@/components/admin/personKinds';

const COLUMNS: Record<Exclude<PersonKind, 'members'>, CsvColumn[]> = {
  committee: [
    { key: 'name', label: 'Full Name' },
    { key: 'designation', label: 'Designation' },
    { key: 'university', label: 'University' },
    { key: 'department', label: 'Department' },
    { key: 'batch', label: 'Batch' },
    { key: 'blood_group', label: 'Blood Group' },
    { key: 'phone', label: 'Phone' },
    { key: 'facebook_url', label: 'Facebook' },
  ],
  advisors: [
    { key: 'name', label: 'Full Name' },
    { key: 'academic_designation', label: 'Academic Designation' },
    { key: 'department', label: 'Department' },
    { key: 'facebook_url', label: 'Facebook' },
  ],
};

const FILE_PREFIX: Record<Exclude<PersonKind, 'members'>, string> = {
  committee: 'svs-committee',
  advisors: 'svs-advisors',
};

export default function PeopleCsvExport({
  kind,
  rows,
}: {
  kind: Exclude<PersonKind, 'members'>;
  rows: PersonRow[];
}) {
  const noun = kind === 'committee' ? 'committee member' : 'advisor';
  return (
    <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-navy-500">
        {rows.length} {noun}{rows.length === 1 ? '' : 's'} will be exported.
      </p>
      <button
        onClick={() => downloadCsv(rows, COLUMNS[kind], `${FILE_PREFIX[kind]}.csv`)}
        disabled={rows.length === 0}
        className="btn-primary disabled:opacity-60"
      >
        <Download size={16} /> Download CSV
      </button>
    </div>
  );
}
