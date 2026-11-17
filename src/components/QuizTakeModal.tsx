import { useEffect, useState } from 'react';
import { Award, CheckCircle2, X } from 'lucide-react';
import { publicCall } from '@/lib/supabase';
import { GMAIL_RE, OPTION_LETTERS } from '@/lib/quizFormat';
import { DEPARTMENTS } from '@/data/constants';
import { playChime, playTick } from '@/lib/sound';
import type { QuizDetail, QuizSubmitResult, QuizSummary } from '@/types/quiz';

interface Props {
  quiz: QuizSummary;
  onClose: () => void;
  onFinished: (result: QuizSubmitResult) => void;
}

const emptyInfo = { name: '', email: '', phone: '', department: '', batch: '' };

export default function QuizTakeModal({ quiz, onClose, onFinished }: Props) {
  const [detail, setDetail] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [info, setInfo] = useState(emptyInfo);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);

  useEffect(() => {
    publicCall<{ data: QuizDetail }>('get_quiz', { quiz_id: quiz.id })
      .then((res) => {
        if (!Array.isArray(res.data?.questions)) throw new Error('Unexpected response from the server');
        setDetail(res.data);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load the quiz'))
      .finally(() => setLoading(false));
  }, [quiz.id]);

  const setField = (key: keyof typeof emptyInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setInfo((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    setSubmitError(null);

    const email = info.email.trim();
    if (!GMAIL_RE.test(email)) {
      setSubmitError('Please use a Gmail address (name@gmail.com).');
      return;
    }
    const unanswered = detail.questions.filter((q) => answers[q.id] === undefined).length;
    if (unanswered > 0) {
      setSubmitError(`Please answer every question. ${unanswered} left.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await publicCall<QuizSubmitResult>('submit_quiz', {
        quiz_id: quiz.id,
        name: info.name.trim(),
        email,
        phone: info.phone.trim(),
        department: info.department,
        batch: info.batch.trim(),
        answers,
      });
      if (typeof res.score !== 'number') throw new Error('Unexpected response from the server');
      setResult(res);
      onFinished(res);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not submit your answers');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-950/60 p-4 backdrop-blur-sm sm:py-10">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-soft">
        <div className="flex items-start justify-between gap-4 border-b border-navy-100 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-saffron-700">Online Quiz</p>
            <h3 className="mt-1 font-display text-xl font-bold text-navy-900">{quiz.title}</h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-navy-500 transition hover:bg-navy-50">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading && <p className="text-navy-500">Loading quiz…</p>}

          {loadError && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{loadError}</div>
          )}

          {result && <ResultView result={result} onClose={onClose} />}

          {detail && !result && (
            <form onSubmit={submit} className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-text" htmlFor="q-name">Full name *</label>
                  <input id="q-name" required value={info.name} onChange={setField('name')} className="input-field" />
                </div>
                <div>
                  <label className="label-text" htmlFor="q-email">Gmail address *</label>
                  <input id="q-email" type="email" required placeholder="name@gmail.com" value={info.email} onChange={setField('email')} className="input-field" />
                </div>
                <div>
                  <label className="label-text" htmlFor="q-phone">Phone number *</label>
                  <input id="q-phone" type="tel" required value={info.phone} onChange={setField('phone')} className="input-field" />
                </div>
                <div>
                  <label className="label-text" htmlFor="q-batch">Batch / session *</label>
                  <input id="q-batch" required placeholder="e.g. 2019-20" value={info.batch} onChange={setField('batch')} className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-text" htmlFor="q-dept">Department *</label>
                  <select id="q-dept" required value={info.department} onChange={setField('department')} className="input-field">
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {detail.questions.map((q, i) => (
                  <fieldset key={q.id} className="rounded-2xl bg-cream-50 p-5">
                    <legend className="px-1 font-semibold text-navy-900">
                      {i + 1}. {q.question}
                    </legend>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, idx) => {
                        const selected = answers[q.id] === idx;
                        return (
                          <label
                            key={idx}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                              selected
                                ? 'border-saffron-500 bg-saffron-50 text-navy-900'
                                : 'border-navy-100 bg-white text-navy-700 hover:border-saffron-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={selected}
                              onChange={() => { setAnswers((prev) => ({ ...prev, [q.id]: idx })); playTick(); }}
                              className="sr-only"
                            />
                            <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold ${
                              selected ? 'bg-saffron-500 text-white' : 'bg-navy-50 text-navy-600'
                            }`}>
                              {OPTION_LETTERS[idx]}
                            </span>
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>

              {submitError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{submitError}</div>
              )}

              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
                {submitting ? 'Submitting…' : 'Submit Answers'}
              </button>
              <p className="text-center text-xs text-navy-400">Each Gmail address can take this quiz only once.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultView({ result, onClose }: { result: QuizSubmitResult; onClose: () => void }) {
  useEffect(() => {
    playChime();
  }, []);
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto inline-flex rounded-full bg-green-50 p-4 text-green-600">
        <CheckCircle2 size={32} />
      </div>
      <div>
        <p className="text-sm text-navy-500">Your score</p>
        <p className="font-display text-5xl font-bold text-navy-900">{result.percent}%</p>
        <p className="mt-1 text-navy-600">{result.score} of {result.total} correct</p>
      </div>
      <p className="inline-flex rounded-full bg-navy-50 px-4 py-2 text-sm font-semibold text-navy-700">
        Current rank: #{result.rank}
      </p>
      {result.certificate_code && (
        <div className="rounded-2xl bg-saffron-50 p-5">
          <p className="inline-flex items-center gap-2 font-semibold text-saffron-700">
            <Award size={18} /> Congratulations! You earned a certificate.
          </p>
          <a
            href={`#/certificate/${result.certificate_code}`}
            onClick={onClose}
            className="btn-primary mt-4 inline-flex text-sm"
          >
            View Certificate
          </a>
        </div>
      )}
      <button onClick={onClose} className="btn-ghost text-sm">Close</button>
    </div>
  );
}
