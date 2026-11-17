/*
# SVS Community Portal — Core Schema

## Overview
Creates the complete database backend for the SVS — Begum Rokeya University, Rangpur (BRUR) Branch community portal. This is a single-tenant public-website app (no user sign-in required to view content), with a separate admin portal that authenticates via a stored passkey (edge function with service_role). Public visitors get read-only access to approved content; only the admin edge function (service_role) can write/update/delete.

## Tables
1. `settings` — single-row table for admin passkey, committee registration window toggle
2. `members` — approved public members shown in the directory (approved join-us submissions)
3. `pending_members` — unapproved 'Join Us' registrations awaiting admin review
4. `committee` — approved committee members shown on the committee page
5. `pending_committee` — unapproved committee onboarding submissions
6. `advisors` — faculty advisory council members
7. `events` — events & pujas (upcoming + past)
8. `festivals` — bilingual annual festivals & spiritual observances catalog (8 entries)
9. `gallery_images` — media gallery photos with categories
10. `notices` — notice board documents/downloads
11. `past_committees` — archived past executive committees by year

## Security Model
- RLS enabled on ALL tables.
- Public (anon, authenticated): SELECT-only on approved/public content.
- Public INSERT only on `pending_members` and `pending_committee` (submission forms).
- Admin mutations go through an edge function using SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
- No public UPDATE/DELETE on any table.
- Storage: public bucket `svs-media` for photos/documents; public read, service_role write.
*/

-- ============================================================
-- 1. SETTINGS (single-row)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  admin_passkey text NOT NULL DEFAULT 'svsadmin2026',
  committee_passcode text NOT NULL DEFAULT 'svsbrur2026',
  committee_window_open boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Settings: no public access to passkeys; admin reads via service_role
-- Allow public to read only committee_window_open (we expose via edge function instead)
REVOKE ALL ON settings FROM PUBLIC, anon, authenticated;

-- ============================================================
-- 2. MEMBERS (approved, public directory)
-- ============================================================
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department text NOT NULL,
  batch text NOT NULL,
  blood_group text,
  phone text,
  whatsapp text,
  email text,
  permanent_address text,
  photo_url text,
  role text NOT NULL DEFAULT 'Current Member' CHECK (role IN ('Current Member', 'Alumni')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON members TO anon, authenticated;

CREATE POLICY "public_read_members" ON members
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- 3. PENDING_MEMBERS (join-us submissions, private)
-- ============================================================
CREATE TABLE IF NOT EXISTS pending_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department text NOT NULL,
  batch text NOT NULL,
  blood_group text,
  phone text,
  whatsapp text,
  email text,
  permanent_address text,
  photo_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pending_members ENABLE ROW LEVEL SECURITY;

-- Public can INSERT (submit form), but cannot SELECT/UPDATE/DELETE
GRANT INSERT ON pending_members TO anon, authenticated;

CREATE POLICY "public_insert_pending_members" ON pending_members
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- 4. COMMITTEE (approved, public)
-- ============================================================
CREATE TABLE IF NOT EXISTS committee (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  designation text NOT NULL,
  university text,
  department text NOT NULL,
  batch text NOT NULL,
  phone text,
  blood_group text,
  photo_url text,
  highlight boolean NOT NULL DEFAULT false,
  facebook_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE committee ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON committee TO anon, authenticated;

CREATE POLICY "public_read_committee" ON committee
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- 5. PENDING_COMMITTEE (private submissions)
-- ============================================================
CREATE TABLE IF NOT EXISTS pending_committee (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  designation text NOT NULL,
  department text NOT NULL,
  batch text NOT NULL,
  phone text,
  blood_group text,
  photo_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pending_committee ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON pending_committee TO anon, authenticated;

CREATE POLICY "public_insert_pending_committee" ON pending_committee
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- 6. ADVISORS (faculty advisory council, public)
-- ============================================================
CREATE TABLE IF NOT EXISTS advisors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  academic_designation text NOT NULL,
  department text NOT NULL,
  photo_url text,
  blessing text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON advisors TO anon, authenticated;

CREATE POLICY "public_read_advisors" ON advisors
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- 7. EVENTS (public)
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date timestamptz NOT NULL,
  venue text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'past')),
  category text NOT NULL DEFAULT 'Puja',
  image_url text,
  video_url text,
  report_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON events TO anon, authenticated;

CREATE POLICY "public_read_events" ON events
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- 8. FESTIVALS (bilingual catalog, public)
-- ============================================================
CREATE TABLE IF NOT EXISTS festivals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bangla_title text NOT NULL,
  english_title text NOT NULL,
  category text NOT NULL DEFAULT 'Pujas' CHECK (category IN ('Pujas', 'Vratas/Broto', 'Cultural & Harmony')),
  description text NOT NULL,
  significance text NOT NULL,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE festivals ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON festivals TO anon, authenticated;

CREATE POLICY "public_read_festivals" ON festivals
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- 9. GALLERY_IMAGES (public)
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'Pujas' CHECK (category IN ('Pujas', 'Cultural Programs', 'Social Work')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON gallery_images TO anon, authenticated;

CREATE POLICY "public_read_gallery" ON gallery_images
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- 10. NOTICES (public)
-- ============================================================
CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL DEFAULT 'Notice' CHECK (type IN ('Notice', 'Constitution', 'Study Resource')),
  description text,
  file_url text,
  file_size text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON notices TO anon, authenticated;

CREATE POLICY "public_read_notices" ON notices
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- 11. PAST_COMMITTEES (public)
-- ============================================================
CREATE TABLE IF NOT EXISTS past_committees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL,
  name text NOT NULL,
  designation text NOT NULL,
  department text NOT NULL,
  batch text,
  photo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE past_committees ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON past_committees TO anon, authenticated;

CREATE POLICY "public_read_past_committees" ON past_committees
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_members_department ON members(department);
CREATE INDEX IF NOT EXISTS idx_members_batch ON members(batch);
CREATE INDEX IF NOT EXISTS idx_members_blood ON members(blood_group);
CREATE INDEX IF NOT EXISTS idx_pending_members_status ON pending_members(status);
CREATE INDEX IF NOT EXISTS idx_pending_committee_status ON pending_committee(status);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category);
