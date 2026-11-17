export type PersonKind = 'members' | 'committee' | 'advisors';

export type PersonRow = {
  id: string;
  name: string;
  photo_url: string | null;
  facebook_url: string | null;
  [column: string]: unknown;
};

export const PERSON_KIND_LABELS: Record<PersonKind, string> = {
  members: 'Members',
  committee: 'Committee',
  advisors: 'Advisors',
};

export function personSubtitle(kind: PersonKind, row: PersonRow): string {
  if (kind === 'members') return [row.department, row.batch].filter(Boolean).join(' · ');
  if (kind === 'committee') return String(row.designation ?? '');
  return String(row.academic_designation ?? '');
}
