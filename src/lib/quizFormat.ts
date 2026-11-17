import type { QuizStatus } from '@/types/quiz';

export const GMAIL_RE = /^[^\s@]+@gmail\.com$/i;

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export interface ParsedQuestion {
  question: string;
  options: string[];
  correct_index: number;
}

export const QUESTION_FORMAT_EXAMPLE = `Q: ভারতের জাতীয় নদী কোনটি?
A) গঙ্গা
B) যমুনা
C) পদ্মা
D) ব্রহ্মপুত্র
Answer: A

Q: ...next question...`;

export function parseQuestionBlocks(input: string): ParsedQuestion[] {
  const blocks = input
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length === 0) throw new Error('No questions found. Paste at least one question.');

  return blocks.map((block, index) => {
    const label = `Question ${index + 1}`;
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const question = lines[0].replace(/^Q\s*[.:)]\s*/i, '').trim();
    if (!question) throw new Error(`${label}: question text is missing.`);

    const options: string[] = [];
    let answer: number | null = null;
    for (const line of lines.slice(1)) {
      const option = line.match(/^([A-D])\s*[.):]\s*(.+)$/i);
      if (option) {
        options.push(option[2].trim());
        continue;
      }
      const ans = line.match(/^(?:Answer|Ans|উত্তর)\s*[:.-]\s*([A-D])\b/i);
      if (ans) answer = OPTION_LETTERS.indexOf(ans[1].toUpperCase() as (typeof OPTION_LETTERS)[number]);
    }

    if (options.length !== 4) throw new Error(`${label}: exactly 4 options (A, B, C, D) are needed.`);
    if (answer === null || answer < 0) throw new Error(`${label}: add a line like "Answer: B".`);

    return { question, options, correct_index: answer };
  });
}

export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

export function getQuizStatus(startsAt: string, expiresAt: string): QuizStatus {
  const now = Date.now();
  if (now < Date.parse(startsAt)) return 'upcoming';
  if (now >= Date.parse(expiresAt)) return 'closed';
  return 'open';
}

export const STATUS_LABEL: Record<QuizStatus, string> = {
  upcoming: 'Upcoming',
  open: 'Open',
  closed: 'Closed',
};

export const STATUS_CLASS: Record<QuizStatus, string> = {
  upcoming: 'bg-saffron-100 text-saffron-700',
  open: 'bg-green-100 text-green-700',
  closed: 'bg-navy-100 text-navy-500',
};
