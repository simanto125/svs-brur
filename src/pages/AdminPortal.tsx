import { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  LogOut,
  History,
  Pencil,
  Plus,
  ScrollText,
  Settings as SettingsIcon,
  Sparkles,
  Trash2,
  Trophy,
  UserPen,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import PeopleEditor from '@/components/admin/PeopleEditor';
import EventFormModal from '@/components/admin/EventFormModal';
import PastCommitteeEditor from '@/components/admin/PastCommitteeEditor';
import BooksEditor from '@/components/admin/BooksEditor';
import QuizzesEditor from '@/components/admin/QuizzesEditor';
import CertificatesEditor from '@/components/admin/CertificatesEditor';
import EmblemContentEditor from '@/components/admin/EmblemContentEditor';
import CommitteePortalEditor from '@/components/admin/CommitteePortalEditor';
import SiteInfoForm from '@/components/admin/SiteInfoForm';
import Logo from '@/components/Logo';
import { useAdmin, useAdminList } from '@/hooks/useAdmin';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import { adminCall } from '@/lib/supabase';
import { getCommitteeConfig, saveCommitteeConfig, type CommitteePortalConfig } from '@/lib/committeePortal';
import { validateFile, toUploadPayload } from '@/lib/files';
import {
  DEPARTMENTS,
  BLOOD_GROUPS,
  COMMITTEE_DESIGNATIONS,
  GALLERY_CATEGORIES,
  NOTICE_TYPES,
} from '@/data/constants';
import type {
  PendingMember,
  PendingCommittee,
  EventItem,
  GalleryImage,
  Notice,
  Settings,
} from '@/types';

type Tab = 'dashboard' | 'pending_members' | 'pending_committee' | 'people' | 'past_committee' | 'books' | 'quizzes' | 'certificates' | 'events' | 'gallery' | 'notices' | 'committee_portal' | 'content' | 'settings';

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pending_members', label: 'Pending Members', icon: Users },
  { id: 'pending_committee', label: 'Pending Committee', icon: Users },
  { id: 'people', label: 'People', icon: UserPen },
  { id: 'past_committee', label: 'Past Committees', icon: History },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'quizzes', label: 'Quizzes', icon: Trophy },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'events', label: 'Events', icon: Clock },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'notices', label: 'Notices', icon: FileText },
  { id: 'committee_portal', label: 'Committee Portal', icon: Users },
  { id: 'content', label: 'Content Editor', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function AdminPortal() {
  const [passkey, setPasskey] = useState('');
  const { verified, verifying, verifyError, verify, logout } = useAdmin('');
  const [activeKey, setActiveKey] = useState('');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);
  const [welcome, setWelcome] = useState(false);

  const key = verified ? activeKey : '';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const accepted = await verify(passkey);
    if (accepted) {
      setActiveKey(passkey);
      setWelcome(true);
      window.setTimeout(() => setWelcome(false), 2000);
    }
  };

  const doAction = async (action: string, payload: Record<string, unknown> = {}) => {
    setActionMsg(null);
    setActionErr(null);
    try {
      const res = await adminCall<{ success?: boolean; error?: string }>(key, action, payload);
      if (res.error) throw new Error(res.error);
      setActionMsg(`Success: ${action}`);
      return res;
    } catch (err) {
      setActionErr(err instanceof Error ? err.message : 'Action failed');
      throw err;
    }
  };

  if (!verified) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-gradient px-4 py-10">
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-saffron-500/20 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-navy-400/25 blur-3xl animate-blob-slow" />
        <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-1 shadow-2xl backdrop-blur-xl">
          <div className="rounded-[1.75rem] border border-white/10 bg-navy-950/45 p-8 sm:p-10">
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-saffron-300/50 bg-saffron-400/10 p-2 shadow-[0_0_55px_rgba(239,189,90,0.3)]">
                <Logo className="h-full w-full rounded-full object-cover" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-saffron-300">Saraswata Vandana Samity</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-white">Admin Portal</h1>
              <p className="mt-2 text-sm leading-relaxed text-navy-100/80">Sign in to manage the SVS experience, members, events, and emblem story.</p>
            </div>
            {verifyError && <div className="mt-5 rounded-xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-100">{verifyError}</div>}
            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-saffron-100" htmlFor="passkey">Admin passkey</label>
                <input id="passkey" type="password" required value={passkey} onChange={(e) => setPasskey(e.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-navy-100/50 outline-none transition focus:border-saffron-300 focus:bg-white/15 focus:ring-2 focus:ring-saffron-300/30" placeholder="Enter your secure passkey" />
              </div>
              <button type="submit" disabled={verifying} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-gradient px-6 py-3.5 text-sm font-bold text-navy-950 shadow-glow transition hover:scale-[1.02] disabled:opacity-60">
                <Lock size={16} /> {verifying ? 'Checking access…' : 'Enter Admin Portal'}
              </button>
            </form>
            <a href="#" className="mt-6 block text-center text-sm font-medium text-navy-100/70 transition hover:text-saffron-200">Back to Home</a>
          </div>
        </div>
      </div>
    );
  }

  if (welcome) {
    return <WelcomeScreen />;
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="container-x">
        <div className="flex items-center justify-between py-4">
          <h1 className="font-display text-2xl font-bold text-navy-900">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <a href="#" className="text-sm font-medium text-navy-500 transition hover:text-saffron-700">
              View Site
            </a>
            <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-4 py-2 text-sm font-medium text-navy-600 transition hover:bg-navy-100">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="flex flex-wrap gap-2 border-b border-navy-100 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setActionMsg(null); setActionErr(null); }}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? 'bg-navy-gradient text-white shadow-soft'
                  : 'bg-white text-navy-600 ring-1 ring-navy-200 hover:ring-saffron-400'
              }`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {(actionMsg || actionErr) && (
          <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
            actionMsg ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {actionMsg || actionErr}
          </div>
        )}

        <div className="py-6">
          {tab === 'dashboard' && <Dashboard key={key} passkey={key} />}
          {tab === 'pending_members' && <PendingMembers key={key} passkey={key} onAction={doAction} />}
          {tab === 'pending_committee' && <PendingCommitteePanel key={key} passkey={key} onAction={doAction} />}
          {tab === 'people' && <PeopleEditor key={key} passkey={key} />}
          {tab === 'past_committee' && <PastCommitteeEditor key={key} passkey={key} />}
          {tab === 'books' && <BooksEditor key={key} passkey={key} />}
          {tab === 'quizzes' && <QuizzesEditor key={key} passkey={key} />}
          {tab === 'certificates' && <CertificatesEditor key={key} passkey={key} />}
          {tab === 'events' && <EventsPanel key={key} passkey={key} onAction={doAction} />}
          {tab === 'gallery' && <GalleryPanel key={key} passkey={key} onAction={doAction} />}
          {tab === 'notices' && <NoticesPanel key={key} passkey={key} onAction={doAction} />}
          {tab === 'committee_portal' && <CommitteePortalEditor passkey={key} onAction={doAction} />}
          {tab === 'content' && <EmblemContentEditor />}
          {tab === 'settings' && <SettingsPanel key={key} passkey={key} onAction={doAction} />}
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen() {
  const particles = Array.from({ length: 14 }, (_, index) => index);
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-gradient">
      <div className="absolute h-64 w-64 rounded-full bg-saffron-400/20 blur-3xl animate-welcome-glow" />
      {particles.map((particle) => (
        <span key={particle} className="absolute h-2 w-2 rounded-full bg-saffron-200 shadow-[0_0_18px_rgba(245,216,150,0.9)] animate-particle-orbit" style={{ animationDelay: `${particle * 90}ms` }} />
      ))}
      <div className="relative z-10 flex flex-col items-center text-center animate-fade-up">
        <div className="rounded-full border-2 border-saffron-300/70 bg-white/10 p-3 shadow-[0_0_80px_rgba(239,189,90,0.5)] animate-seal-pulse">
          <Logo className="h-36 w-36 rounded-full object-cover" />
        </div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.35em] text-saffron-200">Welcome back</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white">SVS Admin Portal</h1>
        <p className="mt-3 text-sm text-navy-100/75">Preparing your workspace…</p>
      </div>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────
function Dashboard({ passkey }: { passkey: string }) {
  const { items: pendingMembers, loading: lm } = useAdminList<PendingMember>(passkey, 'list_pending_members');
  const { items: pendingCommittee, loading: lc } = useAdminList<PendingCommittee>(passkey, 'list_pending_committee');

  const stats = [
    { label: 'Pending Members', value: pendingMembers.length, loading: lm, icon: Users, color: 'text-saffron-700 bg-saffron-100' },
    { label: 'Pending Committee', value: pendingCommittee.length, loading: lc, icon: Users, color: 'text-navy-700 bg-navy-100' },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="card p-6">
          <div className={`inline-flex rounded-xl p-2.5 ${s.color}`}>
            <s.icon size={20} />
          </div>
          <p className="mt-4 text-3xl font-bold text-navy-900">
            {s.loading ? '…' : s.value}
          </p>
          <p className="text-sm text-navy-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Pending Members ────────────────────────────────────────
function PendingMembers({ passkey, onAction }: { passkey: string; onAction: (a: string, p?: Record<string, unknown>) => Promise<unknown> }) {
  const { items, loading, reload } = useAdminList<PendingMember>(passkey, 'list_pending_members');

  const approve = async (id: string) => {
    try { await onAction('approve_member', { id }); reload(); } catch { /* error shown */ }
  };
  const reject = async (id: string) => {
    try { await onAction('reject_member', { id }); reload(); } catch { /* error shown */ }
  };

  if (loading) return <p className="text-navy-500">Loading…</p>;
  if (items.length === 0) return <p className="text-center text-navy-500 py-8">No pending member applications.</p>;

  return (
    <div className="space-y-4">
      {items.map((m) => (
        <div key={m.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <img src={m.photo_url ?? ''} alt={m.name} className="h-16 w-16 flex-none rounded-full object-cover ring-2 ring-saffron-200" />
          <div className="flex-1">
            <h3 className="font-semibold text-navy-900">{m.name}</h3>
            <p className="text-sm text-navy-500">{m.department} · Batch {m.batch}</p>
            {m.blood_group && <p className="text-xs text-navy-400">Blood: {m.blood_group}</p>}
            {m.phone && <p className="text-xs text-navy-400">Phone: {m.phone}</p>}
            {m.email && <p className="text-xs text-navy-400">Email: {m.email}</p>}
            {m.permanent_address && <p className="text-xs text-navy-400">Address: {m.permanent_address}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => approve(m.id)} className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100">
              <CheckCircle2 size={15} /> Approve
            </button>
            <button onClick={() => reject(m.id)} className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100">
              <XCircle size={15} /> Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pending Committee ──────────────────────────────────────
function PendingCommitteePanel({ passkey, onAction }: { passkey: string; onAction: (a: string, p?: Record<string, unknown>) => Promise<unknown> }) {
  const { items, loading, reload } = useAdminList<PendingCommittee>(passkey, 'list_pending_committee');

  const approve = async (id: string, designation: string) => {
    try { await onAction('approve_committee', { id, designation }); reload(); } catch { /* error shown */ }
  };
  const reject = async (id: string) => {
    try { await onAction('reject_committee', { id }); reload(); } catch { /* error shown */ }
  };

  if (loading) return <p className="text-navy-500">Loading…</p>;
  if (items.length === 0) return <p className="text-center text-navy-500 py-8">No pending committee submissions.</p>;

  return (
    <div className="space-y-4">
      {items.map((m) => (
        <div key={m.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <img src={m.photo_url ?? ''} alt={m.name} className="h-16 w-16 flex-none rounded-full object-cover ring-2 ring-saffron-200" />
          <div className="flex-1">
            <h3 className="font-semibold text-navy-900">{m.name}</h3>
            <p className="text-sm font-semibold text-saffron-700">{m.designation}</p>
            <p className="text-sm text-navy-500">{m.department} · Batch {m.batch}</p>
            {m.blood_group && <p className="text-xs text-navy-400">Blood: {m.blood_group}</p>}
            {m.phone && <p className="text-xs text-navy-400">Phone: {m.phone}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => approve(m.id, m.designation)} className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100">
              <CheckCircle2 size={15} /> Approve
            </button>
            <button onClick={() => reject(m.id)} className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100">
              <XCircle size={15} /> Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Events Panel ───────────────────────────────────────────
function EventsPanel({ passkey, onAction }: { passkey: string; onAction: (a: string, p?: Record<string, unknown>) => Promise<unknown> }) {
  const [editing, setEditing] = useState<EventItem | 'new' | null>(null);
  const { data: events, reload } = useSupabaseQuery<EventItem>('events', '*', [], { column: 'date', ascending: false });

  const delEvent = async (id: string) => {
    try { await onAction('delete_event', { id }); reload(); } catch { /* error shown */ }
  };

  return (
    <div>
      <button onClick={() => setEditing('new')} className="btn-primary mb-5">
        <Plus size={16} /> Add Event
      </button>

      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="card flex items-center gap-4 p-4">
            {e.image_url && <img src={e.image_url} alt={e.title} className="h-14 w-14 flex-none rounded-lg object-cover" />}
            <div className="flex-1">
              <h3 className="font-semibold text-navy-900">{e.title}</h3>
              <p className="text-xs text-navy-500">{e.venue} · {new Date(e.date).toLocaleDateString()}</p>
              <span className={`text-[10px] font-bold uppercase ${e.status === 'upcoming' ? 'text-green-600' : 'text-navy-400'}`}>{e.status}</span>
            </div>
            <button onClick={() => setEditing(e)} aria-label="Edit event" className="rounded-full bg-navy-50 p-2 text-navy-600 transition hover:bg-navy-100">
              <Pencil size={16} />
            </button>
            <button onClick={() => delEvent(e.id)} aria-label="Delete event" className="rounded-full bg-red-50 p-2 text-red-600 transition hover:bg-red-100">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <EventFormModal
          passkey={passkey}
          event={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}
    </div>
  );
}


// ─── Gallery Panel ──────────────────────────────────────────
function GalleryPanel({ passkey, onAction }: { passkey: string; onAction: (a: string, p?: Record<string, unknown>) => Promise<unknown> }) {
  const [submitting, setSubmitting] = useState(false);
  const { data: images, reload } = useSupabaseQuery<GalleryImage>('gallery_images', '*', [], { column: 'created_at', ascending: false });

  const addImage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    try {
      const file = fd.get('image') as File | null;
      if (!file?.size) throw new Error('Photo is required');
      const err = validateFile(file, ['image/jpeg', 'image/png', 'image/webp']);
      if (err) throw new Error(err);
      const payload = await toUploadPayload(file);

      await onAction('add_gallery_image', {
        title: fd.get('title') || null,
        image: payload,
        category: fd.get('category'),
      });
      form.reset();
      reload();
    } catch { /* error shown */ } finally {
      setSubmitting(false);
    }
  };

  const delImage = async (id: string) => {
    try { await onAction('delete_gallery_image', { id }); reload(); } catch { /* error shown */ }
  };

  return (
    <div>
      <form onSubmit={addImage} className="card mb-6 space-y-4 p-6">
        <h3 className="font-display text-lg font-semibold text-navy-900">Add Gallery Photo</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="title" placeholder="Caption (optional)" className="input-field" />
          <select name="category" required className="input-field">
            {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="sm:col-span-2">
            <label className="label-text">Photo *</label>
            <input name="image" type="file" accept="image/jpeg,image/png,image/webp" required className="input-field" />
          </div>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
          <Plus size={16} /> {submitting ? 'Uploading…' : 'Add Photo'}
        </button>
      </form>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="card group relative overflow-hidden">
            <img src={img.image_url} alt={img.title ?? ''} className="aspect-square w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-navy-950/0 transition group-hover:bg-navy-950/50">
              <button onClick={() => delImage(img.id)} className="rounded-full bg-red-500 p-2 text-white opacity-0 transition group-hover:opacity-100">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Notices Panel ──────────────────────────────────────────
function NoticesPanel({ passkey, onAction }: { passkey: string; onAction: (a: string, p?: Record<string, unknown>) => Promise<unknown> }) {
  const [submitting, setSubmitting] = useState(false);
  const { data: notices, reload } = useSupabaseQuery<Notice>('notices', '*', [], { column: 'date', ascending: false });

  const addNotice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    try {
      let filePayload = null;
      const file = fd.get('file') as File | null;
      if (file?.size) {
        const err = validateFile(file, ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
        if (err) throw new Error(err);
        filePayload = await toUploadPayload(file);
      }

      await onAction('add_notice', {
        title: fd.get('title'),
        date: fd.get('date') || new Date().toISOString().slice(0, 10),
        type: fd.get('type'),
        description: fd.get('description') || null,
        file: filePayload,
      });
      form.reset();
      reload();
    } catch { /* error shown */ } finally {
      setSubmitting(false);
    }
  };

  const delNotice = async (id: string) => {
    try { await onAction('delete_notice', { id }); reload(); } catch { /* error shown */ }
  };

  return (
    <div>
      <form onSubmit={addNotice} className="card mb-6 space-y-4 p-6">
        <h3 className="font-display text-lg font-semibold text-navy-900">Add Notice / Document</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="title" required placeholder="Notice title" className="input-field" />
          <input name="date" type="date" className="input-field" />
          <select name="type" required className="input-field">
            {NOTICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <textarea name="description" rows={2} placeholder="Description" className="input-field sm:col-span-2 resize-none" />
          <div className="sm:col-span-2">
            <label className="label-text">File (PDF or image, optional)</label>
            <input name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="input-field" />
          </div>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
          <Plus size={16} /> {submitting ? 'Uploading…' : 'Publish Notice'}
        </button>
      </form>

      <div className="space-y-3">
        {notices.map((n) => (
          <div key={n.id} className="card flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-navy-100 text-navy-600">
              <ScrollText size={18} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-navy-900">{n.title}</h3>
              <p className="text-xs text-navy-500">{n.type} · {new Date(n.date).toLocaleDateString()} · {n.download_count} {n.download_count === 1 ? 'download' : 'downloads'}</p>
            </div>
            {n.file_url && (
              <a href={n.file_url} target="_blank" rel="noreferrer" className="rounded-full bg-navy-50 p-2 text-navy-600 transition hover:bg-navy-100">
                <Download size={16} />
              </a>
            )}
            <button onClick={() => delNotice(n.id)} className="rounded-full bg-red-50 p-2 text-red-600 transition hover:bg-red-100">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Panel ─────────────────────────────────────────
function SettingsPanel({ passkey, onAction }: { passkey: string; onAction: (a: string, p?: Record<string, unknown>) => Promise<unknown> }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPasskey, setNewPasskey] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [portalConfig, setPortalConfig] = useState<CommitteePortalConfig>(getCommitteeConfig);

  useEffect(() => {
    adminCall<{ data: Settings }>(passkey, 'get_settings').then((res) => {
      setSettings(res.data ?? null);
      setLoading(false);
    });
  }, [passkey]);

  const toggleWindow = async (open: boolean) => {
    try {
      await onAction('set_committee_window', { open });
      setSettings((s) => s ? { ...s, committee_window_open: open } : s);
    } catch { /* error shown */ }
  };

  const updatePasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasskey.length < 8) return;
    try {
      await onAction('set_admin_passkey', { passkey: newPasskey });
      setNewPasskey('');
    } catch { /* error shown */ }
  };

  const updatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscode.length < 6) return;
    try {
      await onAction('set_committee_passcode', { passcode: newPasscode });
      setNewPasscode('');
    } catch { /* error shown */ }
  };

  const savePortalConfig = (patch: Partial<CommitteePortalConfig>) => {
    const next = { ...portalConfig, ...patch };
    setPortalConfig(next);
    saveCommitteeConfig(next);
  };

  if (loading) return <p className="text-navy-500">Loading settings…</p>;

  return (
    <div className="space-y-6">
      <SiteInfoForm passkey={passkey} />

      <div className="card p-6">
        <h3 className="font-display text-lg font-semibold text-navy-900">Portal passwords</h3>
        <p className="mt-1 text-sm text-navy-500">These localStorage credentials control the Committee Portal on this browser.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block"><span className="label-text">Admin email</span><input type="email" value={portalConfig.adminEmail} onChange={(e) => savePortalConfig({ adminEmail: e.target.value })} className="input-field" /></label>
          <label className="block"><span className="label-text">Admin password</span><input type="text" value={portalConfig.adminPassword} onChange={(e) => savePortalConfig({ adminPassword: e.target.value })} className="input-field" /></label>
          <label className="block"><span className="label-text">Committee password</span><input type="text" value={portalConfig.committeePassword} onChange={(e) => savePortalConfig({ committeePassword: e.target.value })} className="input-field" /></label>
        </div>
        <p className="mt-3 text-xs text-navy-400">Defaults: admin@svs.org / admin123 · Committee: committee2024</p>
      </div>

      {/* Committee window toggle */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-semibold text-navy-900">Committee Registration Window</h3>
        <p className="mt-1 text-sm text-navy-500">
          Control whether the committee onboarding form accepts new submissions.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => toggleWindow(true)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              settings?.committee_window_open
                ? 'bg-green-600 text-white shadow-soft'
                : 'bg-white text-navy-600 ring-1 ring-navy-200'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => toggleWindow(false)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              !settings?.committee_window_open
                ? 'bg-red-600 text-white shadow-soft'
                : 'bg-white text-navy-600 ring-1 ring-navy-200'
            }`}
          >
            Closed
          </button>
          <span className={`text-sm font-medium ${settings?.committee_window_open ? 'text-green-600' : 'text-red-600'}`}>
            {settings?.committee_window_open ? 'Currently open' : 'Currently closed'}
          </span>
        </div>
      </div>

      {/* Admin passkey */}
      <form onSubmit={updatePasskey} className="card p-6">
        <h3 className="font-display text-lg font-semibold text-navy-900">Change Admin Passkey</h3>
        <p className="mt-1 text-sm text-navy-500">Must be at least 8 characters.</p>
        <div className="mt-4 flex gap-3">
          <input
            type="password"
            value={newPasskey}
            onChange={(e) => setNewPasskey(e.target.value)}
            placeholder="New admin passkey"
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary">Update</button>
        </div>
      </form>

      {/* Committee passcode */}
      <form onSubmit={updatePasscode} className="card p-6">
        <h3 className="font-display text-lg font-semibold text-navy-900">Change Committee Passcode</h3>
        <p className="mt-1 text-sm text-navy-500">Must be at least 6 characters.</p>
        <div className="mt-4 flex gap-3">
          <input
            type="password"
            value={newPasscode}
            onChange={(e) => setNewPasscode(e.target.value)}
            placeholder="New committee passcode"
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary">Update</button>
        </div>
      </form>
    </div>
  );
}
