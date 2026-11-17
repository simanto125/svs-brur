import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, ListChecks, Trophy } from 'lucide-react';
import QuizTakeModal from '@/components/QuizTakeModal';
import QuizLeaderboard from '@/components/QuizLeaderboard';
import { publicCall } from '@/lib/supabase';
import { STATUS_CLASS, STATUS_LABEL, formatDateTime } from '@/lib/quizFormat';
import type { QuizSummary } from '@/types/quiz';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taking, setTaking] = useState<QuizSummary | null>(null);
  const [boardId, setBoardId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await publicCall<{ data: QuizSummary[] }>('list_quizzes');
      if (!Array.isArray(res.data)) throw new Error('Unexpected response from the server');
      setQuizzes(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load quizzes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const boardQuiz = quizzes.find((q) => q.id === boardId) ?? null;

  return (
    <section id="quizzes" className="py-24">
      <div className="container-x">
        <div className="text-center">
          <span className="eyebrow">Test Your Knowledge</span>
          <h2 className="section-title mt-3">Online Quiz</h2>
          <p className="mx-auto mt-4 max-w-2xl text-navy-600">
            Take a quiz with your Gmail address, see your score and rank, and earn a certificate for a perfect score.
          </p>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-52 animate-pulse bg-navy-50" />
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto mt-10 max-w-xl rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
            {error}
          </div>
        ) : quizzes.length === 0 ? (
          <p className="mt-10 text-center text-navy-500">No quizzes have been published yet.</p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((q) => (
              <div key={q.id} className="card flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-glow">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-navy-900">{q.title}</h3>
                  <span className={`flex-none rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[q.status]}`}>
                    {STATUS_LABEL[q.status]}
                  </span>
                </div>
                {q.description && <p className="mt-3 line-clamp-3 text-sm text-navy-600">{q.description}</p>}
                <div className="mt-4 space-y-1.5 text-xs text-navy-500">
                  <p className="inline-flex items-center gap-1.5">
                    <CalendarClock size={14} />
                    {q.status === 'upcoming'
                      ? `Opens ${formatDateTime(q.starts_at)}`
                      : `${q.status === 'open' ? 'Closes' : 'Closed'} ${formatDateTime(q.expires_at)}`}
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <ListChecks size={14} /> {q.question_count} {q.question_count === 1 ? 'question' : 'questions'}
                  </p>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  {q.status === 'open' && (
                    <button onClick={() => setTaking(q)} className="btn-primary text-xs">
                      Take Quiz
                    </button>
                  )}
                  <button
                    onClick={() => setBoardId(boardId === q.id ? null : q.id)}
                    className="btn-ghost text-xs"
                  >
                    <Trophy size={14} /> {boardId === q.id ? 'Hide Ranking' : 'Ranking'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {boardQuiz && (
          <div className="mt-10">
            <QuizLeaderboard quizId={boardQuiz.id} title={boardQuiz.title} />
          </div>
        )}
      </div>

      {taking && (
        <QuizTakeModal
          quiz={taking}
          onClose={() => setTaking(null)}
          onFinished={() => {
            setBoardId(taking.id);
            load();
          }}
        />
      )}
    </section>
  );
}
