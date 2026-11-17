import { useMemo, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, ChevronDown, Search, Upload, UserPlus, X } from 'lucide-react';
import { DEPARTMENTS, BLOOD_GROUPS } from '@/data/constants';
import { publicCall } from '@/lib/supabase';
import { validateFile, toUploadPayload } from '@/lib/files';

export default function JoinForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoName, setPhotoName] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // searchable department dropdown state
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptSearch, setDeptSearch] = useState('');
  const [deptValue, setDeptValue] = useState('');
  const [customDept, setCustomDept] = useState(false);

  const filteredDepts = useMemo(
    () =>
      DEPARTMENTS.filter((d) =>
        d.toLowerCase().includes(deptSearch.toLowerCase()),
      ),
    [deptSearch],
  );

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file, ['image/jpeg', 'image/png', 'image/webp']);
    if (err) {
      setError(err);
      return;
    }
    setPhotoName(file.name);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const clearPhoto = () => {
    setPhotoName('');
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      let photoPayload: { name: string; type: string; data: string } | null = null;
      if (photoFile) {
        photoPayload = await toUploadPayload(photoFile);
      }

      const department = customDept
        ? (formData.get('customDept') as string)
        : deptValue;

      if (!department) {
        setError('Please select or type your department');
        setSubmitting(false);
        return;
      }

      const res = await publicCall<{ success?: boolean; error?: string }>(
        'submit_member',
        {
          name: formData.get('name'),
          department,
          batch: formData.get('batch'),
          blood_group: formData.get('blood_group'),
          phone: formData.get('phone'),
          whatsapp: formData.get('whatsapp') || null,
          email: formData.get('email') || null,
          permanent_address: formData.get('permanent_address'),
          photo: photoPayload,
        },
      );

      if (res.error) throw new Error(res.error);

      setSubmitted(true);
      setPhotoName('');
      setPhotoFile(null);
      setPhotoPreview(null);
      setDeptValue('');
      setCustomDept(false);
      form.reset();
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="join" className="py-24">
      <div className="container-x">
        <div className="overflow-hidden rounded-3xl bg-navy-gradient shadow-soft lg:grid lg:grid-cols-5">
          {/* left panel */}
          <div className="relative flex flex-col justify-center p-10 lg:col-span-2">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(229,132,25,0.2),transparent_60%)]" />
            <div className="relative">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron-300">
                Become a Member
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                Join the SVS family
              </h2>
              <p className="mt-4 text-navy-100 leading-relaxed">
                Every BRUR student is welcome. Fill in the form and our
                membership team will reach out to welcome you into our
                community of devotion, culture, and service.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-navy-100">
                {[
                  'Open to all current BRUR students',
                  'No membership fee for the first semester',
                  'Access to all SVS events and resources',
                  'Be part of a lifelong network of alumni',
                ].map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-saffron-300" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* form */}
          <div className="bg-cream-50 p-8 sm:p-10 lg:col-span-3">
            {submitted ? (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
                <div className="rounded-full bg-green-100 p-4 text-green-600">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold text-navy-900">
                  Application received!
                </h3>
                <p className="mt-2 max-w-sm text-navy-600">
                  Thank you for joining SVS. Your application is now pending
                  admin review. Our membership coordinator will contact you
                  within 48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-display text-2xl font-semibold text-navy-900">
                  Member Registration
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label-text" htmlFor="name">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      className="input-field"
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Searchable department dropdown */}
                  <div className="relative">
                    <label className="label-text">Department *</label>
                    {!customDept ? (
                      <div>
                        <input
                          type="hidden"
                          name="department"
                          value={deptValue}
                        />
                        <button
                          type="button"
                          onClick={() => setDeptOpen((v) => !v)}
                          className="input-field flex items-center justify-between text-left"
                        >
                          <span className={deptValue ? 'text-navy-900' : 'text-navy-400'}>
                            {deptValue || 'Select department'}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`flex-none text-navy-400 transition ${deptOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {deptOpen && (
                          <div className="absolute z-20 mt-1 w-full rounded-xl border border-navy-200 bg-white shadow-soft">
                            <div className="border-b border-navy-100 p-2">
                              <div className="relative">
                                <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-400" />
                                <input
                                  autoFocus
                                  value={deptSearch}
                                  onChange={(e) => setDeptSearch(e.target.value)}
                                  placeholder="Search departments…"
                                  className="w-full rounded-lg border border-navy-200 py-2 pl-8 pr-3 text-sm focus:border-saffron-400 focus:outline-none"
                                />
                              </div>
                            </div>
                            <ul className="max-h-44 overflow-y-auto py-1 text-sm">
                              {filteredDepts.map((d) => (
                                <li key={d}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeptValue(d);
                                      setDeptOpen(false);
                                      setDeptSearch('');
                                    }}
                                    className="w-full px-4 py-2 text-left text-navy-700 transition hover:bg-saffron-50 hover:text-saffron-700"
                                  >
                                    {d}
                                  </button>
                                </li>
                              ))}
                              <li>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustomDept(true);
                                    setDeptOpen(false);
                                  }}
                                  className="w-full px-4 py-2 text-left font-medium text-saffron-700 transition hover:bg-saffron-50"
                                >
                                  Other (Type your department)
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          name="customDept"
                          required
                          autoFocus
                          className="input-field flex-1"
                          placeholder="Type your department"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCustomDept(false);
                            setDeptValue('');
                          }}
                          className="rounded-xl bg-navy-50 px-3 text-navy-500 transition hover:bg-navy-100"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label-text" htmlFor="batch">
                      Batch / Session *
                    </label>
                    <input
                      id="batch"
                      name="batch"
                      required
                      className="input-field"
                      placeholder="e.g. 2024-25"
                    />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="blood_group">
                      Blood Group *
                    </label>
                    <select id="blood_group" name="blood_group" required className="input-field">
                      <option value="">Select blood group</option>
                      {BLOOD_GROUPS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-text" htmlFor="phone">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      pattern="\+?[0-9 -]{7,20}"
                      title="Enter a valid phone number (digits, optional + at the start, 7-20 characters)"
                      className="input-field"
                      placeholder="+8801XXX-XXXXXX"
                    />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="whatsapp">
                      WhatsApp Number
                    </label>
                    <input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      pattern="\+?[0-9 -]{7,20}"
                      title="Enter a valid WhatsApp number (digits, optional + at the start, 7-20 characters)"
                      className="input-field"
                      placeholder="+8801XXX-XXXXXX"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-text" htmlFor="email">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="input-field"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-text" htmlFor="permanent_address">
                      Permanent Address *
                    </label>
                    <textarea
                      id="permanent_address"
                      name="permanent_address"
                      required
                      rows={2}
                      className="input-field resize-none"
                      placeholder="Village, Post Office, Upazila, District"
                    />
                  </div>

                  {/* photo upload with preview */}
                  <div className="sm:col-span-2">
                    <label className="label-text">Photo (optional)</label>
                    {photoPreview ? (
                      <div className="flex items-center gap-4 rounded-xl border border-navy-200 bg-white p-4">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="h-20 w-20 rounded-full object-cover ring-2 ring-saffron-300"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-navy-700">{photoName}</p>
                          <button
                            type="button"
                            onClick={clearPhoto}
                            className="mt-1 text-xs font-medium text-red-600 transition hover:text-red-700"
                          >
                            Remove photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-navy-200 bg-white px-4 py-5 transition-colors hover:border-saffron-400">
                        <div className="rounded-lg bg-saffron-50 p-2 text-saffron-600">
                          <Upload size={20} />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-navy-700">
                            {photoName || 'Click to upload your photo'}
                          </span>
                          <span className="block text-xs text-navy-400">
                            JPG, PNG, or WEBP, max 4MB
                          </span>
                        </div>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UserPlus size={18} /> {submitting ? 'Submitting…' : 'Submit Registration'}
                </button>
                <p className="text-center text-xs text-navy-400">
                  Your application will be reviewed by the SVS admin team before appearing in the directory.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
