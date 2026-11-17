import { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, Eye, EyeOff, Pencil, Trash2, Users } from 'lucide-react';
import PendingCommitteeEditModal from '@/components/admin/PendingCommitteeEditModal';
import { useAdminList } from '@/hooks/useAdmin';
import { getCommitteeConfig, saveCommitteeConfig, isCommitteePortalOpen, type CommitteePortalConfig } from '@/lib/committeePortal';
import type { PendingCommittee } from '@/types';

interface Props {
  passkey: string;
  onAction: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
}

export default function CommitteePortalEditor({ passkey, onAction }: Props) {
  const [config, setConfig] = useState<CommitteePortalConfig>(getCommitteeConfig);
  const [editing, setEditing] = useState<PendingCommittee | null>(null);
  const { items: submissions, loading, reload } = useAdminList<PendingCommittee>(passkey, 'list_pending_committee');

  useEffect(() => setConfig(getCommitteeConfig()), []);

  const updateConfig = async (patch: Partial<CommitteePortalConfig>) => {
    const next = { ...config, ...patch };
    if (patch.enabled !== undefined) await onAction('set_committee_window', { open: patch.enabled });
    setConfig(next);
    saveCommitteeConfig(next);
  };

  const accept = async (submission: PendingCommittee) => {
    await onAction('approve_committee', { id: submission.id, designation: submission.designation });
    reload();
  };

  const remove = async (submission: PendingCommittee) => {
    if (!window.confirm(`Delete ${submission.name}'s submission?`)) return;
    await onAction('reject_committee', { id: submission.id });
    reload();
  };

  const open = isCommitteePortalOpen(config);
  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div><span className="eyebrow inline-flex items-center gap-1.5"><Users size={13} /> Committee Portal</span><h2 className="mt-2 font-display text-2xl font-bold text-navy-900">Submission access</h2><p className="mt-1 text-sm text-navy-500">Control the public form and review profiles before they appear on the Executive Committee.</p></div>
        <button type="button" onClick={() => { void updateConfig({ enabled: !config.enabled }); }} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${config.enabled ? 'bg-green-600 text-white shadow-soft' : 'bg-red-100 text-red-700'}`}>{config.enabled ? <Eye size={17} /> : <EyeOff size={17} />}{config.enabled ? 'Portal ON' : 'Portal OFF'}</button>
      </div>

      <div className="card p-6"><label className="label-text" htmlFor="committee-deadline">Optional deadline</label><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><CalendarClock size={17} className="pointer-events-none absolute left-4 top-3.5 text-navy-400" /><input id="committee-deadline" type="datetime-local" value={config.deadline ? config.deadline.slice(0, 16) : ''} onChange={(event) => { const next = event.target.value ? new Date(event.target.value).toISOString() : null; const updated = { ...config, deadline: next }; setConfig(updated); saveCommitteeConfig(updated); }} className="input-field pl-11" /></div><button type="button" onClick={() => { const updated = { ...config, deadline: null }; setConfig(updated); saveCommitteeConfig(updated); }} className="btn-ghost">Clear deadline</button></div><p className="mt-2 text-xs text-navy-400">The form also checks the server access switch before accepting a submission.</p><p className={`mt-3 text-sm font-semibold ${open ? 'text-green-700' : 'text-red-600'}`}>{open ? 'Visitors can currently unlock the form.' : 'Visitors cannot currently submit.'}</p></div>

      <div className="card overflow-hidden"><div className="border-b border-navy-100 px-6 py-5"><h3 className="font-display text-xl font-bold text-navy-900">Member submissions</h3><p className="mt-1 text-sm text-navy-500">{submissions.length} pending {submissions.length === 1 ? 'profile' : 'profiles'} saved on the server.</p></div>{loading ? <p className="px-6 py-10 text-center text-sm text-navy-500">Loading submissions…</p> : submissions.length === 0 ? <p className="px-6 py-10 text-center text-sm text-navy-500">No committee submissions yet.</p> : <div className="divide-y divide-navy-100">{submissions.map((submission) => <SubmissionRow key={submission.id} submission={submission} onEdit={() => setEditing(submission)} onAccept={() => { void accept(submission); }} onDelete={() => { void remove(submission); }} />)}</div>}</div>

      {editing && <PendingCommitteeEditModal member={editing} passkey={passkey} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
    </div>
  );
}

function SubmissionRow({ submission, onEdit, onAccept, onDelete }: { submission: PendingCommittee; onEdit: () => void; onAccept: () => void; onDelete: () => void }) {
  return <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start"><div className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-2xl bg-navy-100 text-navy-400">{submission.photo_url ? <img src={submission.photo_url} alt={submission.name} className="h-full w-full object-cover" /> : <Users size={24} />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold text-navy-900">{submission.name}</h4><span className="rounded-full bg-saffron-100 px-2.5 py-1 text-xs font-semibold text-saffron-700">{submission.designation}</span></div><p className="mt-1 text-sm text-navy-600">{submission.department} · Batch {submission.batch} · {submission.phone ?? 'No phone'}</p>{submission.blood_group && <p className="mt-1 text-xs text-navy-400">Blood {submission.blood_group}</p>}<p className="mt-2 text-xs text-navy-400">Submitted {new Date(submission.created_at).toLocaleString()}</p></div><div className="flex flex-wrap gap-2 lg:pt-1"><button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-4 py-2 text-xs font-semibold text-navy-700 transition hover:bg-navy-100"><Pencil size={15} /> Edit</button><button type="button" onClick={onAccept} className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100"><CheckCircle2 size={15} /> Accept</button><button type="button" onClick={onDelete} aria-label={`Delete ${submission.name}`} className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"><Trash2 size={15} /> Delete</button></div></div>;
}
