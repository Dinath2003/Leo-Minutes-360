-- =====================================================
-- LEO DISTRICT CLUB PERFORMANCE MONITORING SYSTEM
-- Supabase PostgreSQL Schema
-- =====================================================
-- Run this entire file in your Supabase SQL Editor
-- (Project → SQL Editor → New query → paste → Run)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ROLES & PERMISSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS roles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,  -- 'super_admin', 'district_president', etc.
  label       TEXT NOT NULL,
  description TEXT,
  level       INTEGER NOT NULL DEFAULT 0, -- higher = more authority
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO roles (name, label, level) VALUES
  ('super_admin',             'Super Administrator',            100),
  ('district_president',      'District President',             90),
  ('district_vp',             'District Vice President',        80),
  ('district_secretary',      'District Secretary',             70),
  ('district_treasurer',      'District Treasurer',             70),
  ('membership_chairperson',  'District Membership Chairperson',65),
  ('project_chairperson',     'District Project Chairperson',   65),
  ('district_officer',        'District Officer',               60),
  ('club_president',          'Club President',                 40),
  ('club_secretary',          'Club Secretary',                 30),
  ('club_treasurer',          'Club Treasurer',                 30),
  ('view_only',               'View-Only User',                 10)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS permissions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_name  TEXT NOT NULL REFERENCES roles(name) ON DELETE CASCADE,
  panel      TEXT NOT NULL,  -- 'mylci', 'myleo', 'bank_account', etc. or '*' for all
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_edit   BOOLEAN NOT NULL DEFAULT false,
  can_submit BOOLEAN NOT NULL DEFAULT false,
  can_club_approve  BOOLEAN NOT NULL DEFAULT false,
  can_district_verify BOOLEAN NOT NULL DEFAULT false,
  can_reject BOOLEAN NOT NULL DEFAULT false,
  can_reopen BOOLEAN NOT NULL DEFAULT false,
  can_view   BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (role_name, panel)
);

-- =====================================================
-- 2. USER PROFILES (extends Supabase Auth users)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  full_name    TEXT NOT NULL,
  role_name    TEXT NOT NULL REFERENCES roles(name),
  club_id      UUID,  -- NULL for district-level users
  phone        TEXT,
  avatar_url   TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. LEOISTIC YEARS
-- =====================================================

CREATE TABLE IF NOT EXISTS leoistic_years (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_label TEXT NOT NULL UNIQUE,  -- e.g. '2025-2026'
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  is_locked  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 4. LEO CLUBS MASTER TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS leo_clubs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_name           TEXT NOT NULL,
  club_number         TEXT NOT NULL UNIQUE,  -- e.g. 'LCC-001'
  parent_lions_club   TEXT,
  club_type           TEXT,                  -- 'standard', 'campus', 'corporate'
  region              TEXT,
  area                TEXT,
  official_email      TEXT,
  contact_number      TEXT,
  charter_date        DATE,
  current_membership  INTEGER DEFAULT 0,
  status              TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  logo_url            TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 5. CLUB OFFICERS
-- =====================================================

CREATE TABLE IF NOT EXISTS club_officers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id          UUID NOT NULL REFERENCES leo_clubs(id) ON DELETE CASCADE,
  year_id          UUID NOT NULL REFERENCES leoistic_years(id),
  position         TEXT NOT NULL,  -- 'president', 'secretary', 'treasurer', 'advisor'
  user_id          UUID REFERENCES auth.users(id),
  officer_name     TEXT NOT NULL,
  email            TEXT,
  phone            TEXT,
  appointed_date   DATE,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 6. DASHBOARD PANELS
-- =====================================================

CREATE TABLE IF NOT EXISTS dashboard_panels (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_key   TEXT NOT NULL UNIQUE,  -- 'mylci', 'myleo', 'bank_account', etc.
  panel_name  TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  max_score   INTEGER NOT NULL DEFAULT 10,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO dashboard_panels (panel_key, panel_name, max_score, sort_order) VALUES
  ('mylci',            'MyLCI',                            10,  1),
  ('myleo',            'MyLeo',                            10,  2),
  ('bank_account',     'Bank Account',                      5,  3),
  ('general_meetings', 'General Meetings',                 10,  4),
  ('board_meetings',   'Board Meetings',                   10,  5),
  ('projects',         'Projects',                         20,  6),
  ('membership',       'Membership',                       15,  7),
  ('orientations',     'Orientations',                      5,  8),
  ('district_events',  'District Events Participation',    10,  9),
  ('md_participation', 'Multiple District Participation',   5, 10)
ON CONFLICT (panel_key) DO NOTHING;

-- =====================================================
-- 7. CLUB PANEL RECORDS (master status per club × panel × year)
-- =====================================================

CREATE TABLE IF NOT EXISTS club_panel_records (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id             UUID NOT NULL REFERENCES leo_clubs(id),
  panel_key           TEXT NOT NULL REFERENCES dashboard_panels(panel_key),
  year_id             UUID NOT NULL REFERENCES leoistic_years(id),
  status              TEXT NOT NULL DEFAULT 'not_started',
  completion_pct      NUMERIC(5,2) DEFAULT 0,
  score               NUMERIC(5,2) DEFAULT 0,
  last_updated_by     UUID REFERENCES auth.users(id),
  last_updated_at     TIMESTAMPTZ,
  district_verified_by UUID REFERENCES auth.users(id),
  district_verified_at TIMESTAMPTZ,
  remarks             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, panel_key, year_id)
);

-- =====================================================
-- 8. MYLCI RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS mylci_records (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id                 UUID NOT NULL REFERENCES leo_clubs(id),
  year_id                 UUID NOT NULL REFERENCES leoistic_years(id),
  club_in_mylci           BOOLEAN DEFAULT false,
  president_appointed     BOOLEAN DEFAULT false,
  secretary_appointed     BOOLEAN DEFAULT false,
  treasurer_appointed     BOOLEAN DEFAULT false,
  advisor_appointed       BOOLEAN DEFAULT false,
  membership_synced       BOOLEAN DEFAULT false,
  officers_completed      BOOLEAN DEFAULT false,
  pending_corrections     TEXT,
  completion_pct          NUMERIC(5,2) DEFAULT 0,
  evidence_url            TEXT,
  status                  TEXT NOT NULL DEFAULT 'not_started',
  submitted_by            UUID REFERENCES auth.users(id),
  submitted_at            TIMESTAMPTZ,
  district_verified_by    UUID REFERENCES auth.users(id),
  district_verified_at    TIMESTAMPTZ,
  verification_remarks    TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, year_id)
);

-- =====================================================
-- 9. MYLEO RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS myleo_records (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id               UUID NOT NULL REFERENCES leo_clubs(id),
  year_id               UUID NOT NULL REFERENCES leoistic_years(id),
  profile_available     BOOLEAN DEFAULT false,
  officers_entered      BOOLEAN DEFAULT false,
  members_registered    INTEGER DEFAULT 0,
  projects_reported     INTEGER DEFAULT 0,
  service_activities    INTEGER DEFAULT 0,
  volunteer_hours       NUMERIC(10,2) DEFAULT 0,
  beneficiaries         INTEGER DEFAULT 0,
  funds_donated         NUMERIC(12,2) DEFAULT 0,
  funds_raised          NUMERIC(12,2) DEFAULT 0,
  last_activity_date    DATE,
  pending_submissions   INTEGER DEFAULT 0,
  evidence_url          TEXT,
  status                TEXT NOT NULL DEFAULT 'not_started',
  submitted_by          UUID REFERENCES auth.users(id),
  submitted_at          TIMESTAMPTZ,
  district_verified_by  UUID REFERENCES auth.users(id),
  district_verified_at  TIMESTAMPTZ,
  verification_remarks  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, year_id)
);

-- =====================================================
-- 10. BANK ACCOUNT RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS bank_account_records (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id                 UUID NOT NULL REFERENCES leo_clubs(id),
  year_id                 UUID NOT NULL REFERENCES leoistic_years(id),
  account_available       BOOLEAN DEFAULT false,
  bank_name               TEXT,
  branch                  TEXT,
  account_type            TEXT,
  account_number_last4    TEXT,  -- ONLY last 4 digits stored
  account_opening_status  TEXT,
  signatories_confirmed   BOOLEAN DEFAULT false,
  documents_submitted     BOOLEAN DEFAULT false,
  signature_change_done   BOOLEAN DEFAULT false,
  bank_letter_available   BOOLEAN DEFAULT false,
  verification_date       DATE,
  status                  TEXT NOT NULL DEFAULT 'not_started',
  submitted_by            UUID REFERENCES auth.users(id),
  submitted_at            TIMESTAMPTZ,
  treasurer_approved_by   UUID REFERENCES auth.users(id),
  treasurer_approved_at   TIMESTAMPTZ,
  confidential_remarks    TEXT,  -- only visible to treasurer/president/super_admin
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, year_id)
);

-- =====================================================
-- 11. GENERAL MEETING RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS general_meeting_records (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id               UUID NOT NULL REFERENCES leo_clubs(id),
  year_id               UUID NOT NULL REFERENCES leoistic_years(id),
  meeting_number        INTEGER NOT NULL,
  meeting_title         TEXT,
  meeting_date          DATE NOT NULL,
  start_time            TIME,
  end_time              TIME,
  venue                 TEXT,
  members_present       INTEGER DEFAULT 0,
  guests_present        INTEGER DEFAULT 0,
  agenda                TEXT,
  decisions_made        TEXT,
  follow_up_actions     TEXT,
  minutes_url           TEXT,
  attendance_url        TEXT,
  photos_url            TEXT,
  status                TEXT NOT NULL DEFAULT 'draft',
  submitted_by          UUID REFERENCES auth.users(id),
  submitted_at          TIMESTAMPTZ,
  president_approved_by UUID REFERENCES auth.users(id),
  president_approved_at TIMESTAMPTZ,
  district_verified_by  UUID REFERENCES auth.users(id),
  district_verified_at  TIMESTAMPTZ,
  verification_remarks  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 12. BOARD MEETING RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS board_meeting_records (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id                 UUID NOT NULL REFERENCES leo_clubs(id),
  year_id                 UUID NOT NULL REFERENCES leoistic_years(id),
  meeting_number          INTEGER NOT NULL,
  meeting_date            DATE NOT NULL,
  start_time              TIME,
  end_time                TIME,
  venue                   TEXT,
  board_members_present   INTEGER DEFAULT 0,
  financial_matters       TEXT,
  project_approvals       TEXT,
  membership_matters      TEXT,
  pending_action_items    TEXT,
  minutes_url             TEXT,
  attendance_url          TEXT,
  status                  TEXT NOT NULL DEFAULT 'draft',
  submitted_by            UUID REFERENCES auth.users(id),
  submitted_at            TIMESTAMPTZ,
  president_approved_by   UUID REFERENCES auth.users(id),
  president_approved_at   TIMESTAMPTZ,
  district_verified_by    UUID REFERENCES auth.users(id),
  district_verified_at    TIMESTAMPTZ,
  verification_remarks    TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 13. PROJECT RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS project_records (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id               UUID NOT NULL REFERENCES leo_clubs(id),
  year_id               UUID NOT NULL REFERENCES leoistic_years(id),
  project_name          TEXT NOT NULL,
  project_category      TEXT,
  chairperson_name      TEXT,
  start_date            DATE,
  end_date              DATE,
  location              TEXT,
  objective             TEXT,
  sdg_category          TEXT,
  leo_volunteers        INTEGER DEFAULT 0,
  non_leo_volunteers    INTEGER DEFAULT 0,
  service_hours         NUMERIC(10,2) DEFAULT 0,
  beneficiaries         INTEGER DEFAULT 0,
  expenditure           NUMERIC(12,2) DEFAULT 0,
  funds_raised          NUMERIC(12,2) DEFAULT 0,
  partner_organizations TEXT,
  report_url            TEXT,
  photos_url            TEXT,
  myleo_submitted       BOOLEAN DEFAULT false,
  status                TEXT NOT NULL DEFAULT 'draft',
  submitted_by          UUID REFERENCES auth.users(id),
  submitted_at          TIMESTAMPTZ,
  president_approved_by UUID REFERENCES auth.users(id),
  president_approved_at TIMESTAMPTZ,
  district_verified_by  UUID REFERENCES auth.users(id),
  district_verified_at  TIMESTAMPTZ,
  verification_remarks  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 14. MEMBERSHIP RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS membership_records (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id               UUID NOT NULL REFERENCES leo_clubs(id),
  year_id               UUID NOT NULL REFERENCES leoistic_years(id),
  opening_count         INTEGER DEFAULT 0,
  current_count         INTEGER DEFAULT 0,
  new_members           INTEGER DEFAULT 0,
  transferred_in        INTEGER DEFAULT 0,
  resigned              INTEGER DEFAULT 0,
  removed               INTEGER DEFAULT 0,
  active_members        INTEGER DEFAULT 0,
  inactive_members      INTEGER DEFAULT 0,
  mylci_count           INTEGER DEFAULT 0,
  myleo_count           INTEGER DEFAULT 0,
  district_count        INTEGER DEFAULT 0,
  last_synced_date      DATE,
  status                TEXT NOT NULL DEFAULT 'not_started',
  submitted_by          UUID REFERENCES auth.users(id),
  submitted_at          TIMESTAMPTZ,
  district_verified_by  UUID REFERENCES auth.users(id),
  district_verified_at  TIMESTAMPTZ,
  verification_remarks  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, year_id)
);

-- =====================================================
-- 15. ORIENTATION RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS orientation_records (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id                 UUID NOT NULL REFERENCES leo_clubs(id),
  year_id                 UUID NOT NULL REFERENCES leoistic_years(id),
  orientation_type        TEXT NOT NULL,  -- 'new_member', 'officer', 'mylci', 'myleo', etc.
  total_requiring         INTEGER DEFAULT 0,
  registered              INTEGER DEFAULT 0,
  attended                INTEGER DEFAULT 0,
  completed               INTEGER DEFAULT 0,
  completion_pct          NUMERIC(5,2) DEFAULT 0,
  club_status             TEXT,
  district_participated   BOOLEAN DEFAULT false,
  officer_participated    BOOLEAN DEFAULT false,
  certificates_issued     INTEGER DEFAULT 0,
  pending_members         INTEGER DEFAULT 0,
  status                  TEXT NOT NULL DEFAULT 'not_started',
  submitted_by            UUID REFERENCES auth.users(id),
  submitted_at            TIMESTAMPTZ,
  district_verified_by    UUID REFERENCES auth.users(id),
  district_verified_at    TIMESTAMPTZ,
  verification_remarks    TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 16. DISTRICT EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS district_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_id      UUID NOT NULL REFERENCES leoistic_years(id),
  event_name   TEXT NOT NULL,
  event_date   DATE,
  event_type   TEXT,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS district_event_participation (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id            UUID NOT NULL REFERENCES district_events(id),
  club_id             UUID NOT NULL REFERENCES leo_clubs(id),
  registration_count  INTEGER DEFAULT 0,
  payment_count       INTEGER DEFAULT 0,
  confirmed_count     INTEGER DEFAULT 0,
  actual_attendance   INTEGER DEFAULT 0,
  attendance_pct      NUMERIC(5,2) DEFAULT 0,
  payment_status      TEXT,
  club_remarks        TEXT,
  district_remarks    TEXT,
  status              TEXT NOT NULL DEFAULT 'not_started',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, club_id)
);

-- =====================================================
-- 17. MULTIPLE DISTRICT EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS multiple_district_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_id      UUID NOT NULL REFERENCES leoistic_years(id),
  event_name   TEXT NOT NULL,
  event_date   DATE,
  event_type   TEXT,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS multiple_district_participation (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id              UUID NOT NULL REFERENCES multiple_district_events(id),
  club_id               UUID NOT NULL REFERENCES leo_clubs(id),
  registration_count    INTEGER DEFAULT 0,
  actual_participants   INTEGER DEFAULT 0,
  competitions_entered  INTEGER DEFAULT 0,
  awards_received       INTEGER DEFAULT 0,
  representation_level  TEXT,
  participation_pct     NUMERIC(5,2) DEFAULT 0,
  status                TEXT NOT NULL DEFAULT 'not_started',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, club_id)
);

-- =====================================================
-- 18. DOCUMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS documents (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_name     TEXT NOT NULL,
  stored_name       TEXT NOT NULL,
  file_type         TEXT NOT NULL,
  file_size_bytes   INTEGER,
  storage_path      TEXT NOT NULL,
  club_id           UUID REFERENCES leo_clubs(id),
  panel_key         TEXT REFERENCES dashboard_panels(panel_key),
  record_id         UUID,
  uploaded_by       UUID REFERENCES auth.users(id),
  access_level      TEXT NOT NULL DEFAULT 'club',  -- 'club', 'district', 'admin_only'
  verification_status TEXT DEFAULT 'pending',
  is_archived       BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 19. VERIFICATION RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS verification_records (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_key      TEXT NOT NULL,
  record_id      UUID NOT NULL,
  club_id        UUID NOT NULL REFERENCES leo_clubs(id),
  action         TEXT NOT NULL,  -- 'verify', 'approve', 'reject', 'return', 'escalate'
  verified_by    UUID NOT NULL REFERENCES auth.users(id),
  verified_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  prev_status    TEXT,
  new_status     TEXT,
  remarks        TEXT,
  year_id        UUID REFERENCES leoistic_years(id)
);

-- =====================================================
-- 20. STATUS HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS status_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_key   TEXT NOT NULL,
  record_id   UUID NOT NULL,
  club_id     UUID REFERENCES leo_clubs(id),
  changed_by  UUID REFERENCES auth.users(id),
  prev_status TEXT,
  new_status  TEXT NOT NULL,
  reason      TEXT,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 21. NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  type        TEXT NOT NULL,  -- 'submission', 'verification', 'correction', 'deadline', 'overdue'
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  panel_key   TEXT,
  record_id   UUID,
  club_id     UUID REFERENCES leo_clubs(id),
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 22. DEADLINES
-- =====================================================

CREATE TABLE IF NOT EXISTS deadlines (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_id     UUID NOT NULL REFERENCES leoistic_years(id),
  panel_key   TEXT REFERENCES dashboard_panels(panel_key),
  club_id     UUID REFERENCES leo_clubs(id),  -- NULL = applies to all clubs
  label       TEXT NOT NULL,
  deadline_date DATE NOT NULL,
  created_by  UUID REFERENCES auth.users(id),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 23. SCORES
-- =====================================================

CREATE TABLE IF NOT EXISTS scores (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id       UUID NOT NULL REFERENCES leo_clubs(id),
  year_id       UUID NOT NULL REFERENCES leoistic_years(id),
  panel_key     TEXT NOT NULL REFERENCES dashboard_panels(panel_key),
  raw_score     NUMERIC(5,2) DEFAULT 0,
  max_score     NUMERIC(5,2) DEFAULT 0,
  pct_score     NUMERIC(5,2) DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, year_id, panel_key)
);

-- =====================================================
-- 24. AUDIT LOGS (IMMUTABLE)
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES auth.users(id),
  user_role       TEXT,
  club_id         UUID REFERENCES leo_clubs(id),
  panel_key       TEXT,
  record_id       UUID,
  action          TEXT NOT NULL,
  prev_value      JSONB,
  new_value       JSONB,
  prev_status     TEXT,
  new_status      TEXT,
  ip_address      INET,
  user_agent      TEXT,
  remarks         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all sensitive tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leo_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_panel_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mylci_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE myleo_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_account_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_meeting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_meeting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE orientation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE district_event_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiple_district_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role_name FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to get the current user's club_id
CREATE OR REPLACE FUNCTION get_user_club_id()
RETURNS UUID AS $$
  SELECT club_id FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function: is user a district-level or higher role?
CREATE OR REPLACE FUNCTION is_district_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON r.name = up.role_name
    WHERE up.id = auth.uid() AND r.level >= 60
  )
$$ LANGUAGE SQL SECURITY DEFINER;

-- user_profiles: users see own profile; admins see all
CREATE POLICY "Users see own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid() OR is_district_user());

CREATE POLICY "Only admins can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (get_user_role() IN ('super_admin', 'district_president'));

CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid() OR get_user_role() = 'super_admin');

-- leo_clubs: district users see all; club users see own club
CREATE POLICY "District users see all clubs" ON leo_clubs
  FOR SELECT USING (is_district_user() OR id = get_user_club_id());

-- club_panel_records: club users see own club; district users see all
CREATE POLICY "Club panel read" ON club_panel_records
  FOR SELECT USING (is_district_user() OR club_id = get_user_club_id());

CREATE POLICY "Club panel write by club users" ON club_panel_records
  FOR INSERT WITH CHECK (club_id = get_user_club_id() OR is_district_user());

CREATE POLICY "Club panel update" ON club_panel_records
  FOR UPDATE USING (is_district_user() OR club_id = get_user_club_id());

-- notifications: users only see their own
CREATE POLICY "Own notifications only" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System inserts notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Mark own notifications read" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- audit_logs: only super_admin and district president can view
CREATE POLICY "Audit log read restricted" ON audit_logs
  FOR SELECT USING (get_user_role() IN ('super_admin', 'district_president'));

CREATE POLICY "Audit log insert by system" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- bank_account_records: restricted access
CREATE POLICY "Bank records restricted read" ON bank_account_records
  FOR SELECT USING (
    is_district_user() OR club_id = get_user_club_id()
  );

-- documents: access by access_level
CREATE POLICY "Document read by access level" ON documents
  FOR SELECT USING (
    access_level = 'club' AND (club_id = get_user_club_id() OR is_district_user())
    OR access_level = 'district' AND is_district_user()
    OR access_level = 'admin_only' AND get_user_role() = 'super_admin'
  );

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_club_panel_records_club ON club_panel_records(club_id);
CREATE INDEX IF NOT EXISTS idx_club_panel_records_panel ON club_panel_records(panel_key);
CREATE INDEX IF NOT EXISTS idx_club_panel_records_year ON club_panel_records(year_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_club ON audit_logs(club_id);
CREATE INDEX IF NOT EXISTS idx_project_records_club ON project_records(club_id, year_id);
CREATE INDEX IF NOT EXISTS idx_meeting_records_club ON general_meeting_records(club_id, year_id);

-- =====================================================
-- VIEWS
-- =====================================================

-- District-wide panel summary view
CREATE OR REPLACE VIEW v_panel_summary AS
SELECT
  dp.panel_key,
  dp.panel_name,
  dp.max_score,
  COUNT(cpr.id) AS total_clubs,
  COUNT(CASE WHEN cpr.status IN ('verified','completed') THEN 1 END) AS completed,
  COUNT(CASE WHEN cpr.status IN ('submitted','pending_district','in_progress') THEN 1 END) AS pending,
  COUNT(CASE WHEN cpr.status = 'overdue' THEN 1 END) AS overdue,
  COUNT(CASE WHEN cpr.status IN ('not_started','draft') THEN 1 END) AS not_started,
  ROUND(AVG(cpr.completion_pct), 2) AS avg_completion_pct
FROM dashboard_panels dp
LEFT JOIN club_panel_records cpr ON cpr.panel_key = dp.panel_key
WHERE dp.is_active = true
GROUP BY dp.panel_key, dp.panel_name, dp.max_score;

-- Club overall score view
CREATE OR REPLACE VIEW v_club_scores AS
SELECT
  lc.id AS club_id,
  lc.club_name,
  lc.region,
  ly.year_label,
  COALESCE(SUM(s.raw_score), 0) AS total_score,
  100 AS max_total_score,
  ROUND(COALESCE(SUM(s.raw_score), 0), 2) AS score_pct,
  RANK() OVER (PARTITION BY ly.id ORDER BY SUM(s.raw_score) DESC NULLS LAST) AS rank
FROM leo_clubs lc
CROSS JOIN leoistic_years ly
LEFT JOIN scores s ON s.club_id = lc.id AND s.year_id = ly.id
WHERE lc.status = 'active'
GROUP BY lc.id, lc.club_name, lc.region, ly.id, ly.year_label;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
