import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Lock, ShieldCheck, Upload, UserPlus, X } from 'lucide-react';
import { BLOOD_GROUPS, COMMITTEE_DESIGNATIONS, DEPARTMENTS } from '@/data/constants';
import { getCommitteeConfig, isCommitteePortalOpen, type CommitteePortalConfig } from '@/lib/committeePortal';
import { publicCall } from '@/lib/supabase';
import { toUploadPayload, validateFile } from '@/lib/files';

type Stage = 'loading' | 'passcode' | 'form' | 'closed' | 'success';

export default function JoinCommittee() {
  const [config] = useState<CommitteePortalConfig>(getCommitteeConfig);
  const [stage, setStage] = useState<Stage>('loading');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    publicCall<{ open: boolean }>('window_status')
      .then((result) => {
        if (!active) return;
        setStage(result.open && isCommitteePortalOpen({ ...config, enabled: true }) ? 'passcode' : 'closed');
      })
      .catch(() => { if (active) setStage('closed'); });
    return () => { active = false; };
  }, [config]);

  const checkPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    try {
      await publicCall('verify_passcode', { passcode: password });
      setStage('form');
    } catch {
      setPasswordError('That committee access password is not correct.');
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validationError = validateFile(file, ['image/jpeg', 'image/png', 'image/webp']);
    if (validationError) { setError(validationError); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const data = new FormData(event.currentTarget);
      const photo = photoFile ? await toUploadPayload(photoFile) : null;
      await publicCall('submit_committee', {
        passcode: password,
        name: String(data.get('name') ?? '').trim(),
        designation: String(data.get('designation') ?? ''),
        department: String(data.get('department') ?? ''),
        batch: String(data.get('batch') ?? '').trim(),
        phone: String(data.get('phone') ?? '').trim() || null,
        blood_group: String(data.get('bloodGroup') ?? ''),
        photo,
      });
      setStage('success');
      setPhotoFile(null);
      setPhotoPreview(null);
      event.currentTarget.reset();
    } catch {
      setError('Could not submit your profile. Please check the details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-16 pt-24">
      <div className="container-x max-w-3xl">
        <a href="#" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-navy-600 transition hover:text-saffron-700"><ArrowLeft size={16} /> Back to Home</a>
        <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
          <div className="bg-navy-gradient p-8 text-center"><div className="mx-auto inline-flex rounded-full bg-saffron-500/20 p-3 text-saffron-300"><ShieldCheck size={28} /></div><h1 className="mt-4 font-display text-3xl font-bold text-white">Committee Portal</h1><p className="mt-2 text-sm text-navy-100">Submit your profile for admin review and publication.</p></div>
          <div className="p-8 sm:p-10">
            {stage === 'loading' && <div className="py-10 text-center text-sm text-navy-500">Checking portal availability…</div>}
            {stage === 'passcode' && <form onSubmit={checkPassword} className="mx-auto max-w-md space-y-5"><div className="rounded-2xl bg-navy-50 p-5 text-center"><Lock size={24} className="mx-auto text-navy-500" /><p className="mt-2 text-sm font-medium text-navy-700">Enter the Committee Access Password to continue.</p></div>{passwordError && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{passwordError}</div>}<div><label className="label-text" htmlFor="committee-password">Committee Access Password</label><input id="committee-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="input-field" placeholder="Enter access password" /></div><button type="submit" className="btn-primary w-full"><Lock size={16} /> Unlock Committee Form</button></form>}
            {stage === 'closed' && <div className="mx-auto max-w-md py-8 text-center"><div className="mx-auto inline-flex rounded-full bg-red-100 p-4 text-red-600"><X size={32} /></div><h2 className="mt-5 font-display text-2xl font-bold text-navy-900">Committee Portal Closed</h2><p className="mt-2 text-navy-600">The committee submission window is currently unavailable.</p>{config.deadline && <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-700"><Clock3 size={15} /> Deadline: {new Date(config.deadline).toLocaleString()}</p>}</div>}
            {stage === 'form' && <form onSubmit={submit} className="space-y-5">{error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}<div className="grid gap-5 sm:grid-cols-2"><div><label className="label-text" htmlFor="member-name">Name *</label><input id="member-name" name="name" required className="input-field" placeholder="Full name" /></div><div><label className="label-text" htmlFor="member-role">Role *</label><select id="member-role" name="designation" required className="input-field"><option value="">Select role</option>{COMMITTEE_DESIGNATIONS.map((role) => <option key={role}>{role}</option>)}</select></div><div><label className="label-text" htmlFor="member-department">Department *</label><select id="member-department" name="department" required className="input-field"><option value="">Select department</option>{DEPARTMENTS.map((department) => <option key={department}>{department}</option>)}</select></div><div><label className="label-text" htmlFor="member-session">Session *</label><input id="member-session" name="batch" required className="input-field" placeholder="2024–25" /></div><div><label className="label-text" htmlFor="member-phone">Phone</label><input id="member-phone" name="phone" type="tel" className="input-field" placeholder="01XXXXXXXXX" /></div><div><label className="label-text" htmlFor="member-blood">Blood Group *</label><select id="member-blood" name="bloodGroup" required className="input-field"><option value="">Select blood group</option>{BLOOD_GROUPS.map((group) => <option key={group}>{group}</option>)}</select></div><div className="sm:col-span-2"><label className="label-text">Photo</label>{photoPreview ? <div className="flex items-center gap-4 rounded-xl border border-navy-200 p-4"><img src={photoPreview} alt="Preview" className="h-20 w-20 rounded-full object-cover ring-2 ring-saffron-300" /><button type="button" onClick={clearPhoto} className="text-sm font-semibold text-red-600">Remove photo</button></div> : <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-navy-200 px-4 py-5 transition hover:border-saffron-400"><Upload size={20} className="text-saffron-600" /><span className="text-sm text-navy-600">Upload JPG, PNG, or WEBP photo</span><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} /></label>}</div></div><button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60"><UserPlus size={18} /> {submitting ? 'Submitting…' : 'Submit for Review'}</button><p className="text-center text-xs text-navy-400">Your profile will appear in the admin review list.</p></form>}
            {stage === 'success' && <div className="py-10 text-center"><div className="mx-auto inline-flex rounded-full bg-green-100 p-4 text-green-600"><CheckCircle2 size={48} /></div><h2 className="mt-6 font-display text-2xl font-bold text-navy-900">Submission Received</h2><p className="mx-auto mt-2 max-w-md text-navy-600">Your committee profile is now available for admin review.</p><a href="#" className="btn-ghost mt-6">Back to Home</a></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
