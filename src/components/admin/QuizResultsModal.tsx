import { useEffect, useState } from 'react';
import AdminModalShell from '@/components/admin/AdminModalShell';
import { adminCall } from '@/lib/supabase';
import { formatDateTime } from '@/lib/quizFormat';
import type { AdminAttempt, AdminQuiz } from '@/types/quiz';

interface Props {
  passkey: string;
  quiz: AdminQuiz;
  onClose: () => void;
}

export default function QuizResultsModal({ passkey, quiz, onClose }: Props) {
  const [attempts, setAttempts] = useState<AdminAttempt[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminCall<{ data: AdminAttempt[] }>(passkey, 'list_quiz_attempts', { quiz_id: quiz.id })
      .then((res) => {
        if (!Array.isArray(res.data)) throw new Error('Unexpected response from the server');
        setAttempts(res.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load results'));
  }, [passkey, quiz.id]);

  return (
    <AdminModalShell title={`Results: ${quiz.title}`} onClose={onClose} wide>
      {error && <p className="text-sm font-medium text-red-700">{error}</p>}
      {!error && !attempts && <p className="text-navy-500">Loading results…</p>}
      {attempts?.length === 0 && <p className="text-navy-500">Nobody has taken this quiz yet.</p>}
      {attempts && attempts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs uppercase tracking-wider text-navy-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Rank</th>
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Gmail</th>
                <th className="px-3 py-2 font-semibold">Phone</th>
                <th className="px-3 py-2 font-semibold">Dept / Batch</th>
                <th className="px-3 py-2 font-semibold">Score</th>
                <th className="px-3 py-2 font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {attempts.map((a, i) => (
                <tr key={a.id} className="transition hover:bg-cream-50">
                  <td className="px-3 py-2 font-bold text-navy-900">{i + 1}</td>
                  <td className="px-3 py-2 text-navy-800">{a.name}</td>
                  <td className="px-3 py-2 text-navy-600">{a.email}</td>
                  <td className="px-3 py-2 text-navy-600">{a.phone ?? '—'}</td>
                  <td className="px-3 py-2 text-navy-600">{a.department} · {a.batch}</td>
                  <td className="px-3 py-2 font-semibold text-navy-900">{a.percent}% ({a.score}/{a.total})</td>
                  <td className="px-3 py-2 text-xs text-navy-500">{formatDateTime(a.submitted_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminModalShell>
  );
}
