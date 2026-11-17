import { useCallback, useEffect, useState } from 'react';
import { ListChecks, Pencil, Plus, Trash2, Users } from 'lucide-react';
import QuizFormModal from '@/components/admin/QuizFormModal';
import QuizQuestionsModal from '@/components/admin/QuizQuestionsModal';
import QuizResultsModal from '@/components/admin/QuizResultsModal';
import { adminCall } from '@/lib/supabase';
import { STATUS_CLASS, STATUS_LABEL, formatDateTime, getQuizStatus } from '@/lib/quizFormat';
import type { AdminQuiz } from '@/types/quiz';

type Modal =
  | { kind: 'form'; quiz: AdminQuiz | null }
  | { kind: 'questions'; quiz: AdminQuiz }
  | { kind: 'results'; quiz: AdminQuiz }
  | null;

export default function QuizzesEditor({ passkey }: { passkey: string }) {
  const [quizzes, setQuizzes] = useState<AdminQuiz[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);

  const load = useCallback(() => {
    return adminCall<{ data: AdminQuiz[] }>(passkey, 'list_quizzes')
      .then((res) => {
        if (!Array.isArray(res.data)) throw new Error('Unexpected response from the server');
        setQuizzes(res.data);
        setLoadError(null);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load quizzes'));
  }, [passkey]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (quiz: AdminQuiz) => {
    if (!window.confirm(`Delete "${quiz.title}"? Its questions and all results will be removed.`)) return;
    setActionError(null);
    try {
      await adminCall(passkey, 'delete_quiz', { id: quiz.id });
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete the quiz');
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-navy-500">
          Create a quiz, add questions, and set when it closes. Open the edit button to extend the time.
        </p>
        <button onClick={() => setModal({ kind: 'form', quiz: null })} className="btn-primary">
          <Plus size={16} /> New Quiz
        </button>
      </div>

      {actionError && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{actionError}</div>}

      {loadError ? (
        <p className="text-sm font-medium text-red-700">{loadError}</p>
      ) : !quizzes ? (
        <p className="text-navy-500">Loading quizzes…</p>
      ) : quizzes.length === 0 ? (
        <p className="py-8 text-center text-navy-500">No quizzes yet. Create the first one.</p>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => {
            const status = getQuizStatus(q.starts_at, q.expires_at);
            return (
              <div key={q.id} className="card flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-navy-900">{q.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[status]}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-navy-500">
                    {formatDateTime(q.starts_at)} to {formatDateTime(q.expires_at)}
                  </p>
                  <p className="mt-1 text-xs text-navy-400">
                    {q.quiz_questions?.[0]?.count ?? 0} questions · {q.quiz_attempts?.[0]?.count ?? 0} attempts
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setModal({ kind: 'questions', quiz: q })} className="btn-ghost text-xs">
                    <ListChecks size={14} /> Questions
                  </button>
                  <button onClick={() => setModal({ kind: 'results', quiz: q })} className="btn-ghost text-xs">
                    <Users size={14} /> Results
                  </button>
                  <button onClick={() => setModal({ kind: 'form', quiz: q })} className="btn-ghost text-xs">
                    <Pencil size={14} /> Edit / Extend
                  </button>
                  <button
                    onClick={() => remove(q)}
                    aria-label="Delete quiz"
                    className="rounded-full bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal?.kind === 'form' && (
        <QuizFormModal
          passkey={passkey}
          quiz={modal.quiz}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
      {modal?.kind === 'questions' && (
        <QuizQuestionsModal
          passkey={passkey}
          quiz={modal.quiz}
          onClose={() => setModal(null)}
          onChanged={load}
        />
      )}
      {modal?.kind === 'results' && (
        <QuizResultsModal passkey={passkey} quiz={modal.quiz} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
