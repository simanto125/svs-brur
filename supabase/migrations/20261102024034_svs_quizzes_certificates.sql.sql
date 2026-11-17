/*
# Quizzes, quiz attempts, certificates, and signatories

## Plain-English summary
Adds an online quiz system. Admins create quizzes with a time window, add multiple-choice questions, and can extend or delete quizzes. Visitors take an open quiz with their name, email and details. Each email can attempt a quiz once. Scores are ranked. Anyone who scores 100% receives a certificate. Admins can also grant certificates manually. Certificates show the president's and general secretary's names and signatures, which are stored in site settings.

## New tables
1. `quizzes`: title, description, starts_at, expires_at (the quiz closes after this time).
2. `quiz_questions`: belongs to a quiz; question text, exactly 4 options, correct option index (0-3), position.
3. `quiz_attempts`: one row per submission with name, email, phone, department, batch, score, total, percent. Unique per quiz and email.
4. `certificates`: unique code used in the verification link, recipient name, quiz title snapshot, percent, reason ('perfect_score' or 'granted').

## Modified tables
- `settings`: adds president_name, general_secretary_name, president_signature_url, general_secretary_signature_url.

## Security
- RLS is enabled on every new table with NO policies, so anon and authenticated roles cannot read or write them directly.
- Only service_role (edge functions) is granted access. Correct answers never reach the browser.

## Notes
- Idempotent: safe to re-run.
- No existing data is deleted or retyped.
*/

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_window_valid CHECK (expires_at > starts_at)
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  question text NOT NULL,
  options text[] NOT NULL,
  correct_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_question_options CHECK (cardinality(options) = 4),
  CONSTRAINT quiz_question_answer CHECK (correct_index BETWEEN 0 AND 3)
);
CREATE INDEX IF NOT EXISTS quiz_questions_quiz_idx ON quiz_questions (quiz_id, position);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  department text,
  batch text,
  score integer NOT NULL,
  total integer NOT NULL,
  percent integer NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_attempts_one_per_email UNIQUE (quiz_id, email)
);
CREATE INDEX IF NOT EXISTS quiz_attempts_rank_idx ON quiz_attempts (quiz_id, score DESC, submitted_at);

CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  recipient_name text NOT NULL,
  email text,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE SET NULL,
  quiz_title text NOT NULL,
  percent integer,
  reason text NOT NULL CHECK (reason IN ('perfect_score', 'granted')),
  issued_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE settings ADD COLUMN IF NOT EXISTS president_name text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS general_secretary_name text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS president_signature_url text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS general_secretary_signature_url text;

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON quizzes, quiz_questions, quiz_attempts, certificates TO service_role;
