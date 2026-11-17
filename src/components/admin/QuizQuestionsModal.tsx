import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import AdminModalShell from '@/components/admin/AdminModalShell';
import { adminCall } from '@/lib/supabase';
import { OPTION_LETTERS, QUESTION_FORMAT_EXAMPLE, parseQuestionBlocks } from '@/lib/quizFormat';
import type { AdminQuiz, AdminQuizQuestion } from '@/types/quiz';

interface Props {
  passkey: string;
  quiz: AdminQuiz;
  onClose: () => void;
  onChanged: () => void;
}

export default function QuizQuestionsModal({ passkey, quiz, onClose, onChanged }: Props) {
  const [questions, setQuestions] = useState<AdminQuizQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pasted, setPasted] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = () =>
    adminCall<{ data: AdminQuizQuestion[] }>(passkey, 'list_quiz_questions', { quiz_id: quiz.id })
      .then((res) => {
        if (!Array.isArray(res.data)) throw new Error('Unexpected response from the server');
        setQuestions(res.data);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load questions'));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.id]);

  const addQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    let parsed;
    try {
      parsed = parseQuestionBlocks(pasted);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not read the questions');
      return;
    }
    setSaving(true);
    try {
      await adminCall(passkey, 'add_quiz_questions', { quiz_id: quiz.id, questions: parsed });
      setPasted('');
      await load();
      onChanged();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not add the questions');
    } finally {
      setSaving(false);
    }
  };

  const removeQuestion = async (id: string) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await adminCall(passkey, 'delete_quiz_question', { id });
      await load();
      onChanged();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not delete the question');
    }
  };

  return (
    <AdminModalShell title={`Questions: ${quiz.title}`} onClose={onClose} wide>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h4 className="font-semibold text-navy-900">
            Current questions {questions && `(${questions.length})`}
          </h4>
          {loadError && <p className="mt-3 text-sm font-medium text-red-700">{loadError}</p>}
          {!loadError && !questions && <p className="mt-3 text-sm text-navy-500">Loading…</p>}
          {questions?.length === 0 && <p className="mt-3 text-sm text-navy-500">No questions yet. Paste some on the right.</p>}
          <ol className="mt-3 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {questions?.map((q, i) => (
              <li key={q.id} className="rounded-xl bg-cream-50 p-4">
                <div className="flex items-start gap-3">
                  <p className="flex-1 text-sm font-medium text-navy-900">{i + 1}. {q.question}</p>
                  <button onClick={() => removeQuestion(q.id)} aria-label="Delete question" className="rounded-full bg-red-50 p-1.5 text-red-600 transition hover:bg-red-100">
                    <Trash2 size={14} />
                  </button>
                </div>
                <ul className="mt-2 grid gap-1 text-xs text-navy-600 sm:grid-cols-2">
                  {q.options.map((o, idx) => (
                    <li key={idx} className={idx === q.correct_index ? 'font-semibold text-green-700' : ''}>
                      {OPTION_LETTERS[idx]}) {o}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>

        <form onSubmit={addQuestions} className="space-y-4">
          <h4 className="font-semibold text-navy-900">Paste new questions</h4>
          <pre className="whitespace-pre-wrap rounded-xl bg-navy-50 p-4 text-xs leading-relaxed text-navy-700">{QUESTION_FORMAT_EXAMPLE}</pre>
          <p className="text-xs text-navy-500">Leave one empty line between questions. Each needs exactly 4 options and an Answer line.</p>
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={12}
            placeholder="Paste questions here"
            className="input-field font-mono text-sm"
          />
          {formError && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{formError}</div>}
          <button type="submit" disabled={saving || !pasted.trim()} className="btn-primary w-full disabled:opacity-60">
            {saving ? 'Adding…' : 'Add Questions'}
          </button>
        </form>
      </div>
    </AdminModalShell>
  );
}
