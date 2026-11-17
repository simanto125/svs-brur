export type QuizStatus = 'upcoming' | 'open' | 'closed';

export interface QuizSummary {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  expires_at: string;
  status: QuizStatus;
  question_count: number;
}

export interface QuizQuestionPublic {
  id: string;
  position: number;
  question: string;
  options: string[];
}

export interface QuizDetail {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  expires_at: string;
  questions: QuizQuestionPublic[];
}

export interface QuizSubmitResult {
  score: number;
  total: number;
  percent: number;
  rank: number;
  certificate_code: string | null;
}

export interface LeaderboardRow {
  rank: number;
  name: string;
  department: string;
  batch: string;
  score: number;
  total: number;
  percent: number;
  submitted_at: string;
}

export interface CertificateRecord {
  code: string;
  recipient_name: string;
  quiz_title: string;
  percent: number;
  reason: 'perfect_score' | 'granted';
  issued_at: string;
}

export interface Signatories {
  president_name: string | null;
  general_secretary_name: string | null;
  president_signature_url: string | null;
  general_secretary_signature_url: string | null;
}

export interface CertificateData {
  certificate: CertificateRecord;
  settings: Signatories & { site_name: string; logo_url: string | null };
}

export interface AdminQuiz {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  expires_at: string;
  quiz_questions: { count: number }[];
  quiz_attempts: { count: number }[];
}

export interface AdminQuizQuestion {
  id: string;
  position: number;
  question: string;
  options: string[];
  correct_index: number;
}

export interface AdminAttempt {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  department: string;
  batch: string;
  score: number;
  total: number;
  percent: number;
  submitted_at: string;
}

export interface AdminCertificate extends CertificateRecord {
  email: string | null;
}
