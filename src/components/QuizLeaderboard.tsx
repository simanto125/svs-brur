import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { publicCall } from '@/lib/supabase';
import { formatDateTime } from '@/lib/quizFormat';
import type { LeaderboardRow } from '@/types/quiz';

interface Props {
  quizId: string;
  title: string;
}

export default function QuizLeaderboard({ quizId, title }: Props) {
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRows(null);
    setError(null);
    publicCall<{ data: LeaderboardRow[] }>('get_leaderboard', { quiz_id: quizId })
      .then((res) => {
        if (!Array.isArray(res.data)) throw new Error('Unexpected response from the server');
        setRows(res.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the ranking'));
  }, [quizId]);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-navy-100 p-6">
        <div className="rounded-xl bg-saffron-100 p-2.5 text-saffron-700">
          <Trophy size={20} />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-navy-900">Ranking</h3>
          <p className="text-sm text-navy-500">{title}</p>
        </div>
      </div>

      {error && <p className="px-6 py-5 text-sm font-medium text-red-700">{error}</p>}
      {!error && !rows && <p className="px-6 py-5 text-navy-500">Loading ranking…</p>}
      {rows && rows.length === 0 && <p className="px-6 py-5 text-navy-500">No one has taken this quiz yet.</p>}

      {rows && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs uppercase tracking-wider text-navy-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Rank</th>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="hidden px-6 py-3 font-semibold sm:table-cell">Department</th>
                <th className="hidden px-6 py-3 font-semibold md:table-cell">Batch</th>
                <th className="px-6 py-3 text-right font-semibold">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {rows.map((r, i) => (
                <tr key={`${r.rank}-${i}`} className="transition hover:bg-cream-50">
                  <td className="px-6 py-3 font-bold text-navy-900">#{r.rank}</td>
                  <td className="px-6 py-3 font-medium text-navy-800">{r.name}</td>
                  <td className="hidden px-6 py-3 text-navy-600 sm:table-cell">{r.department}</td>
                  <td className="hidden px-6 py-3 text-navy-600 md:table-cell">{r.batch}</td>
                  <td className="px-6 py-3 text-right">
                    <span className="font-semibold text-navy-900">{r.percent}%</span>
                    <span className="ml-1 text-xs text-navy-400">({r.score}/{r.total})</span>
                    <span className="block text-[11px] text-navy-400">{formatDateTime(r.submitted_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
