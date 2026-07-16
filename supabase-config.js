// =====================================================
// SUPABASE CONFIGURATION — Leo Minutes 360
// =====================================================
// Replace the placeholders below with your actual
// Supabase project credentials from:
// https://supabase.com/dashboard → Project Settings → API
// =====================================================

const SUPABASE_URL = 'https://zmwicujupqdweizdmwig.supabase.co';       // Real Supabase Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptd2ljdWp1cHFkd2VpemRtd2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNDI4MTMsImV4cCI6MjA5OTcxODgxM30.xqF86GmG_p9z6EifULCdVnD46YA-5cQnYfz3wdxi6RY'; // Real Supabase Anon Key

// =====================================================
// Initialize Supabase Client
// =====================================================
// The Supabase JS SDK is loaded via CDN in HTML files.
// This client is exported for use across all modules.

let _supabaseClient = null;

function getSupabaseClient() {
  if (_supabaseClient) return _supabaseClient;

  // Guard: check if the SDK is loaded
  if (typeof window !== 'undefined' && window.supabase) {
    _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
    return _supabaseClient;
  }

  console.warn('[LeoMinutes360] Supabase SDK not loaded yet.');
  return null;
}

// =====================================================
// Mock Mode (active when placeholder credentials are set)
// =====================================================
const IS_MOCK_MODE = SUPABASE_URL === 'YOUR_SUPABASE_URL';

if (IS_MOCK_MODE) {
  console.info(
    '%c[LeoMinutes360] Running in MOCK MODE — Supabase not connected.\n' +
    'Edit supabase-config.js to add your project credentials.',
    'color: #f0a500; font-weight: bold;'
  );
}

// =====================================================
// Mock Data — 20 Leo Clubs (used in mock mode)
// =====================================================
const MOCK_CLUBS = [
  { id: 1,  name: 'Leo Club of Colombo Central',      club_id: 'LCC-001', region: 'Western',   status: 'active', score: 87 },
  { id: 2,  name: 'Leo Club of Colombo North',        club_id: 'LCC-002', region: 'Western',   status: 'active', score: 74 },
  { id: 3,  name: 'Leo Club of Colombo South',        club_id: 'LCC-003', region: 'Western',   status: 'active', score: 91 },
  { id: 4,  name: 'Leo Club of Kandy',                club_id: 'LCC-004', region: 'Central',   status: 'active', score: 68 },
  { id: 5,  name: 'Leo Club of Galle',                club_id: 'LCC-005', region: 'Southern',  status: 'active', score: 82 },
  { id: 6,  name: 'Leo Club of Matara',               club_id: 'LCC-006', region: 'Southern',  status: 'active', score: 55 },
  { id: 7,  name: 'Leo Club of Kurunegala',           club_id: 'LCC-007', region: 'North West',status: 'active', score: 79 },
  { id: 8,  name: 'Leo Club of Negombo',              club_id: 'LCC-008', region: 'Western',   status: 'active', score: 63 },
  { id: 9,  name: 'Leo Club of Anuradhapura',         club_id: 'LCC-009', region: 'North C.',  status: 'active', score: 70 },
  { id: 10, name: 'Leo Club of Polonnaruwa',          club_id: 'LCC-010', region: 'North C.',  status: 'active', score: 48 },
  { id: 11, name: 'Leo Club of Badulla',              club_id: 'LCC-011', region: 'Uva',       status: 'active', score: 61 },
  { id: 12, name: 'Leo Club of Ratnapura',            club_id: 'LCC-012', region: 'Sabaragam.', status: 'active', score: 77 },
  { id: 13, name: 'Leo Club of Kegalle',              club_id: 'LCC-013', region: 'Sabaragam.', status: 'active', score: 53 },
  { id: 14, name: 'Leo Club of Trincomalee',          club_id: 'LCC-014', region: 'Eastern',   status: 'active', score: 66 },
  { id: 15, name: 'Leo Club of Batticaloa',           club_id: 'LCC-015', region: 'Eastern',   status: 'active', score: 44 },
  { id: 16, name: 'Leo Club of Jaffna',               club_id: 'LCC-016', region: 'Northern',  status: 'active', score: 72 },
  { id: 17, name: 'Leo Club of Vavuniya',             club_id: 'LCC-017', region: 'Northern',  status: 'active', score: 39 },
  { id: 18, name: 'Leo Club of Nuwara Eliya',         club_id: 'LCC-018', region: 'Central',   status: 'active', score: 85 },
  { id: 19, name: 'Leo Club of Puttalam',             club_id: 'LCC-019', region: 'North West',status: 'active', score: 58 },
  { id: 20, name: 'Leo Club of Hambantota',           club_id: 'LCC-020', region: 'Southern',  status: 'active', score: 76 },
];

const MOCK_PANEL_STATS = {
  mylci:            { completed: 14, partial: 3, pending: 2, overdue: 1, maxScore: 10 },
  myleo:            { completed: 11, partial: 4, pending: 3, overdue: 2, maxScore: 10 },
  bank_account:     { completed: 16, partial: 2, pending: 1, overdue: 1, maxScore: 5  },
  general_meetings: { completed: 12, partial: 5, pending: 2, overdue: 1, maxScore: 10 },
  board_meetings:   { completed: 13, partial: 3, pending: 3, overdue: 1, maxScore: 10 },
  projects:         { completed: 10, partial: 6, pending: 3, overdue: 1, maxScore: 20 },
  membership:       { completed: 15, partial: 2, pending: 2, overdue: 1, maxScore: 15 },
  orientations:     { completed: 9,  partial: 5, pending: 4, overdue: 2, maxScore: 5  },
  district_events:  { completed: 13, partial: 4, pending: 2, overdue: 1, maxScore: 10 },
  md_participation: { completed: 11, partial: 3, pending: 4, overdue: 2, maxScore: 5  },
};

const MOCK_USER = {
  id: 'mock-user-001',
  email: 'admin@leo.org',
  name: 'District Administrator',
  role: 'super_admin',
  avatar: null,
};

const MOCK_RECENT_ACTIVITY = [
  { club: 'Leo Club of Colombo Central', action: 'MyLCI record verified',          time: '2 min ago',   type: 'verified'  },
  { club: 'Leo Club of Kandy',           action: 'Board meeting submitted',         time: '18 min ago',  type: 'submitted' },
  { club: 'Leo Club of Galle',           action: 'Project record returned for correction', time: '1 hr ago', type: 'correction'},
  { club: 'Leo Club of Nuwara Eliya',    action: 'Bank account documents verified', time: '3 hr ago',   type: 'verified'  },
  { club: 'Leo Club of Jaffna',          action: 'Membership data submitted',       time: '5 hr ago',   type: 'submitted' },
  { club: 'Leo Club of Colombo South',   action: 'General meeting #7 approved',     time: 'Yesterday',   type: 'verified'  },
];

const MOCK_DEADLINES = [
  { panel: 'MyLCI Updates',      daysLeft: 3,  urgency: 'critical' },
  { panel: 'Q2 Project Reports', daysLeft: 7,  urgency: 'warning'  },
  { panel: 'Board Meeting #6',   daysLeft: 12, urgency: 'upcoming' },
  { panel: 'Orientation Records',daysLeft: 18, urgency: 'normal'   },
];
