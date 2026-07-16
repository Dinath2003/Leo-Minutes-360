// =====================================================
// LEO MINUTES 360 — DASHBOARD APPLICATION
// Auth Guard · Panel Rendering · Supabase Integration
// Dynamic Modal Form Rendering · Record Editing Logic
// =====================================================

(function () {
  'use strict';

  // ===================================================
  // PANEL DEFINITIONS & SCORES
  // ===================================================
  const PANELS = [
    { key: 'mylci',            name: 'MyLCI',                       icon: 'shield-check',    colorClass: 'panel-icon-mylci',           maxScore: 10 },
    { key: 'myleo',            name: 'MyLeo',                       icon: 'globe',           colorClass: 'panel-icon-myleo',           maxScore: 10 },
    { key: 'bank_account',     name: 'Bank Account',                icon: 'landmark',        colorClass: 'panel-icon-bank_account',    maxScore: 5  },
    { key: 'general_meetings', name: 'General Meetings',            icon: 'users',           colorClass: 'panel-icon-general_meetings',maxScore: 10 },
    { key: 'board_meetings',   name: 'Board Meetings',              icon: 'clipboard-list',  colorClass: 'panel-icon-board_meetings',  maxScore: 10 },
    { key: 'projects',         name: 'Projects',                    icon: 'rocket',          colorClass: 'panel-icon-projects',        maxScore: 20 },
    { key: 'membership',       name: 'Membership',                  icon: 'user-plus',       colorClass: 'panel-icon-membership',      maxScore: 15 },
    { key: 'orientations',     name: 'Orientations',                icon: 'graduation-cap',  colorClass: 'panel-icon-orientations',    maxScore: 5  },
    { key: 'district_events',  name: 'District Events',             icon: 'calendar-days',   colorClass: 'panel-icon-district_events', maxScore: 10 },
    { key: 'md_participation', name: 'Multiple District Participation', icon: 'globe-2',     colorClass: 'panel-icon-md_participation',maxScore: 5  },
  ];

  // Dynamic field definitions per panel
  const PANEL_FIELDS = {
    mylci: [
      { name: 'club_in_mylci', label: 'Club available in MyLCI', type: 'checkbox' },
      { name: 'president_appointed', label: 'President Appointed', type: 'checkbox' },
      { name: 'secretary_appointed', label: 'Secretary Appointed', type: 'checkbox' },
      { name: 'treasurer_appointed', label: 'Treasurer Appointed', type: 'checkbox' },
      { name: 'advisor_appointed', label: 'Leo Advisor Appointed', type: 'checkbox' },
      { name: 'membership_synced', label: 'Membership Synced', type: 'checkbox' },
      { name: 'officers_completed', label: 'Officers Info Completed', type: 'checkbox' }
    ],
    myleo: [
      { name: 'profile_available', label: 'Profile Available', type: 'checkbox' },
      { name: 'officers_entered', label: 'Officers Entered', type: 'checkbox' },
      { name: 'members_registered', label: 'Members Registered Count', type: 'number' },
      { name: 'projects_reported', label: 'Projects Reported Count', type: 'number' },
      { name: 'service_activities', label: 'Service Activities Count', type: 'number' },
      { name: 'volunteer_hours', label: 'Volunteer Hours Entered', type: 'number' },
      { name: 'beneficiaries', label: 'Beneficiaries Served', type: 'number' },
      { name: 'funds_raised', label: 'Funds Raised ($)', type: 'number' },
      { name: 'funds_donated', label: 'Funds Donated ($)', type: 'number' }
    ],
    bank_account: [
      { name: 'account_available', label: 'Bank Account Available', type: 'checkbox' },
      { name: 'bank_name', label: 'Bank Name', type: 'text' },
      { name: 'branch', label: 'Branch Name', type: 'text' },
      { name: 'account_type', label: 'Account Type (e.g. Current/Savings)', type: 'text' },
      { name: 'account_number_last4', label: 'Account Number (Last 4 digits)', type: 'text', maxLength: 4 },
      { name: 'signatories_confirmed', label: 'Authorized Signatories Confirmed', type: 'checkbox' },
      { name: 'documents_submitted', label: 'Required Documents Submitted', type: 'checkbox' },
      { name: 'signature_change_done', label: 'Signature Change Status Done', type: 'checkbox' },
      { name: 'bank_letter_available', label: 'Bank Letter Available', type: 'checkbox' }
    ],
    general_meetings: [
      { name: 'meeting_number', label: 'Meeting Number', type: 'number' },
      { name: 'meeting_title', label: 'Meeting Title', type: 'text' },
      { name: 'meeting_date', label: 'Meeting Date', type: 'date' },
      { name: 'venue', label: 'Venue / Online Platform', type: 'text' },
      { name: 'members_present', label: 'Number of Members Present', type: 'number' },
      { name: 'guests_present', label: 'Number of Guests Present', type: 'number' },
      { name: 'agenda', label: 'Agenda & Decisions Made', type: 'textarea' }
    ],
    board_meetings: [
      { name: 'meeting_number', label: 'Board Meeting Number', type: 'number' },
      { name: 'meeting_date', label: 'Meeting Date', type: 'date' },
      { name: 'venue', label: 'Venue / Online Platform', type: 'text' },
      { name: 'board_members_present', label: 'Board Members Present Count', type: 'number' },
      { name: 'financial_matters', label: 'Financial Matters Discussed', type: 'textarea' },
      { name: 'project_approvals', label: 'Project Approvals Details', type: 'textarea' }
    ],
    projects: [
      { name: 'project_name', label: 'Project Name', type: 'text' },
      { name: 'project_category', label: 'Project Category', type: 'text' },
      { name: 'chairperson_name', label: 'Project Chairperson Name', type: 'text' },
      { name: 'start_date', label: 'Project Start Date', type: 'date' },
      { name: 'location', label: 'Project Location', type: 'text' },
      { name: 'leo_volunteers', label: 'Number of Leo Volunteers', type: 'number' },
      { name: 'service_hours', label: 'Total Service Hours', type: 'number' },
      { name: 'beneficiaries', label: 'Total Beneficiaries Served', type: 'number' },
      { name: 'expenditure', label: 'Total Expenditure ($)', type: 'number' },
      { name: 'funds_raised', label: 'Funds Raised ($)', type: 'number' }
    ],
    membership: [
      { name: 'opening_count', label: 'Opening Membership Count', type: 'number' },
      { name: 'current_count', label: 'Current Membership Count', type: 'number' },
      { name: 'new_members', label: 'New Members Added', type: 'number' },
      { name: 'resigned', label: 'Members Resigned / Resignations', type: 'number' },
      { name: 'active_members', label: 'Active Members Count', type: 'number' },
      { name: 'mylci_count', label: 'MyLCI Membership Count', type: 'number' },
      { name: 'myleo_count', label: 'MyLeo Membership Count', type: 'number' }
    ],
    orientations: [
      { name: 'orientation_type', label: 'Orientation Programme Type', type: 'text' },
      { name: 'total_requiring', label: 'Total Members Requiring Orientation', type: 'number' },
      { name: 'attended', label: 'Members Registered / Attended', type: 'number' },
      { name: 'completed', label: 'Members Completed', type: 'number' },
      { name: 'certificates_issued', label: 'Certificates Issued', type: 'number' }
    ],
    district_events: [
      { name: 'event_name', label: 'District Event Name', type: 'text' },
      { name: 'registration_count', label: 'Registration Count', type: 'number' },
      { name: 'confirmed_count', label: 'Confirmed Participants Count', type: 'number' },
      { name: 'actual_attendance', label: 'Actual Attendance Count', type: 'number' },
      { name: 'payment_status', label: 'Payment Status (Paid/Pending)', type: 'text' }
    ],
    md_participation: [
      { name: 'event_name', label: 'Multiple District Event Name', type: 'text' },
      { name: 'registration_count', label: 'MD Registration Count', type: 'number' },
      { name: 'actual_participants', label: 'MD Actual Participants Count', type: 'number' },
      { name: 'competitions_entered', label: 'Competitions Entered Count', type: 'number' },
      { name: 'awards_received', label: 'Awards / Recognition Received', type: 'number' }
    ]
  };

  const STATUS_META = {
    completed:           { label: 'Completed',              css: 'status-completed',        icon: 'check-circle' },
    verified:            { label: 'Verified',               css: 'status-verified',         icon: 'check-circle' },
    in_progress:         { label: 'In Progress',            css: 'status-in_progress',      icon: 'loader' },
    submitted:           { label: 'Submitted',              css: 'status-submitted',        icon: 'upload' },
    pending_district:    { label: 'Pending Verification',   css: 'status-pending_district', icon: 'clock' },
    correction_required: { label: 'Correction Required',    css: 'status-correction_required', icon: 'alert-triangle' },
    overdue:             { label: 'Overdue',                css: 'status-overdue',          icon: 'alert-circle' },
    not_started:         { label: 'Not Started',            css: 'status-not_started',      icon: 'circle' },
    not_applicable:      { label: 'Not Applicable',         css: 'status-not_applicable',   icon: 'minus' },
    rejected:            { label: 'Rejected',               css: 'status-rejected',         icon: 'x-circle' },
  };

  const ROLE_LABELS = {
    super_admin:            'Super Administrator',
    district_president:     'District President',
    district_vp:            'District Vice President',
    district_secretary:     'District Secretary',
    district_treasurer:     'District Treasurer',
    membership_chairperson: 'Membership Chairperson',
    project_chairperson:    'Project Chairperson',
    district_officer:       'District Officer',
    club_president:         'Club President',
    club_secretary:         'Club Secretary',
    club_treasurer:         'Club Treasurer',
    view_only:              'View Only',
  };

  // ===================================================
  // APPLICATION STATE
  // ===================================================
  let state = {
    user: null,
    panelStats: {},
    clubs: [],
    panelRecords: {}, // In-memory database of all club details per panel
    currentPanel: 'overview',
    notifOpen: false,
    sidebarOpen: false,
    dropdownOpen: false,
    currentYear: '2025–2026',
  };

  // ===================================================
  // SUPABASE HELPERS
  // ===================================================
  function getClient() {
    if (typeof IS_MOCK_MODE !== 'undefined' && IS_MOCK_MODE) return null;
    return typeof getSupabaseClient !== 'undefined' ? getSupabaseClient() : null;
  }

  async function fetchCurrentUser() {
    const client = getClient();
    if (!client) return { ...MOCK_USER };
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) return null;
      const { data: profile } = await client
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      return profile || { ...MOCK_USER, email: session.user.email };
    } catch (e) {
      console.warn('[LeoMinutes360] Supabase read user failed, falling back to mock user.');
      return { ...MOCK_USER };
    }
  }

  async function fetchPanelStats() {
    const client = getClient();
    if (!client) return { ...MOCK_PANEL_STATS };
    try {
      const { data } = await client.from('v_panel_summary').select('*');
      if (!data || data.length === 0) return { ...MOCK_PANEL_STATS };
      const stats = {};
      data.forEach(row => {
        stats[row.panel_key] = {
          completed: row.completed,
          partial: row.pending,
          pending: row.pending,
          overdue: row.overdue,
          maxScore: row.max_score,
        };
      });
      return stats;
    } catch (e) {
      return { ...MOCK_PANEL_STATS };
    }
  }

  async function fetchClubs() {
    const client = getClient();
    if (!client) return [...MOCK_CLUBS];
    try {
      const { data } = await client
        .from('leo_clubs')
        .select('*')
        .eq('status', 'active')
        .order('club_name');
      if (!data || data.length === 0) return [...MOCK_CLUBS];
      
      // Map to consistent UI structure
      return data.map((c, i) => ({
        id: c.id,
        name: c.club_name,
        club_id: c.club_number,
        region: c.region,
        status: c.status,
        score: Math.round(80 - (i * 2.2)) // derive score or query from scores table
      }));
    } catch (e) {
      return [...MOCK_CLUBS];
    }
  }

  async function signOut() {
    localStorage.removeItem('leo_mock_session');
    const client = getClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {}
    }
    window.location.href = 'index.html';
  }

  async function checkAuth() {
    if (localStorage.getItem('leo_mock_session') === 'true') {
      return true;
    }
    const client = getClient();
    if (!client) return true; // mock mode: allow
    try {
      const { data: { session } } = await client.auth.getSession();
      return !!session;
    } catch (e) {
      return true;
    }
  }

  // ===================================================
  // DATA SEEDING (Auto-runs if DB has 0 clubs)
  // ===================================================
  async function seedDatabaseIfNeeded(clubsList) {
    const client = getClient();
    if (!client) return;
    try {
      const { count } = await client.from('leo_clubs').select('*', { count: 'exact', head: true });
      if (count === 0) {
        console.log('[LeoMinutes360] Database is empty. Seeding clubs Master...');
        
        // 1. Insert current year
        const { data: yearData } = await client.from('leoistic_years').insert([
          { year_label: '2025–2026', start_date: '2025-07-01', end_date: '2026-06-30', is_current: true }
        ]).select().single();

        const yearId = yearData.id;

        // 2. Insert all 20 default clubs
        const clubsToInsert = MOCK_CLUBS.map(c => ({
          club_name: c.name,
          club_number: c.club_id,
          region: c.region,
          status: 'active',
          current_membership: 15 + Math.floor(Math.random() * 20)
        }));

        const { data: insertedClubs } = await client.from('leo_clubs').insert(clubsToInsert).select();

        // 3. Insert default panel stats / records
        const panelRecords = [];
        insertedClubs.forEach(club => {
          PANELS.forEach(p => {
            panelRecords.push({
              club_id: club.id,
              panel_key: p.key,
              year_id: yearId,
              status: 'not_started',
              completion_pct: 0,
              score: 0
            });
          });
        });

        await client.from('club_panel_records').insert(panelRecords);
        console.log('[LeoMinutes360] Database seed completed successfully!');
        window.location.reload();
      }
    } catch (e) {
      console.error('[LeoMinutes360] Seeding database failed:', e);
    }
  }

  // ===================================================
  // LOCAL STATE SEEDING (Initialize dynamic form values)
  // ===================================================
  function initLocalPanelRecords() {
    state.panelRecords = {};
    PANELS.forEach(p => {
      state.panelRecords[p.key] = {};
      state.clubs.forEach((club, i) => {
        const seed = i * 17 + p.key.length;
        const rngVal = Math.sin(seed) * 10000;
        const rand = rngVal - Math.floor(rngVal);
        
        const clubKey = club.id || club.club_id;
        
        // Base records common across all panels
        const record = {
          status: rand > 0.75 ? 'verified' : (rand > 0.4 ? 'in_progress' : 'not_started'),
          progress: rand > 0.75 ? 100 : Math.round(rand * 90),
          remarks: rand > 0.65 ? 'Verified matching official Leo District compliance logs.' : '',
          evidence: rand > 0.5 ? 'https://example.com/district_compliance_proof.pdf' : ''
        };
        
        // Generate sensible mock fields depending on field type
        PANEL_FIELDS[p.key].forEach(field => {
          if (field.type === 'checkbox') {
            record[field.name] = rand > 0.45;
          } else if (field.type === 'number') {
            record[field.name] = Math.round(rand * 45);
          } else if (field.type === 'date') {
            record[field.name] = '2026-07-12';
          } else {
            record[field.name] = field.name.includes('name') ? `Mock ${field.label}` : `Sample ${field.label} detail`;
          }
        });
        
        state.panelRecords[p.key][clubKey] = record;
      });
    });
  }

  // ===================================================
  // RENDERING & SVG GRAPHICS HELPERS
  // ===================================================

  function buildProgressRing(pct, colorClass, size = 66) {
    const r = (size - 8) / 2;
    const circ = 2 * Math.PI * r;
    const dashOffset = circ * (1 - pct / 100);
    const strokeColors = {
      'panel-icon-mylci':            '#6496ff',
      'panel-icon-myleo':            '#4ade80',
      'panel-icon-bank_account':     '#fbbf24',
      'panel-icon-general_meetings': '#f97316',
      'panel-icon-board_meetings':   '#a855f7',
      'panel-icon-projects':         '#f43f5e',
      'panel-icon-membership':       '#0ea5e9',
      'panel-icon-orientations':     '#14b8a6',
      'panel-icon-district_events':  '#6366f1',
      'panel-icon-md_participation': '#ec4899',
    };
    const stroke = strokeColors[colorClass] || '#6496ff';
    return `
      <svg class="panel-ring-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
        <circle class="ring-track" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="5"/>
        <circle class="ring-progress" cx="${size/2}" cy="${size/2}" r="${r}"
          stroke="${stroke}" stroke-width="5"
          stroke-dasharray="${circ}"
          stroke-dashoffset="${dashOffset}"
        />
        <text class="ring-center-text" x="${size/2}" y="${size/2 - 4}">${Math.round(pct)}%</text>
        <text class="ring-center-sub"  x="${size/2}" y="${size/2 + 10}">done</text>
      </svg>`;
  }

  function buildStatusChip(status) {
    const meta = STATUS_META[status] || STATUS_META.not_started;
    return `<span class="status-chip ${meta.css}">
      <i data-lucide="${meta.icon}"></i>${meta.label}
    </span>`;
  }

  function buildMiniBar(pct) {
    let colorClass = 'mini-bar-fill-grey';
    if (pct >= 80) colorClass = 'mini-bar-fill-green';
    else if (pct >= 50) colorClass = 'mini-bar-fill-blue';
    else if (pct >= 25) colorClass = 'mini-bar-fill-orange';
    else if (pct > 0)   colorClass = 'mini-bar-fill-red';

    return `<div class="mini-progress-wrap">
      <div class="mini-bar"><div class="mini-bar-fill ${colorClass}" style="width:${pct}%"></div></div>
      <span class="mini-pct">${pct}%</span>
    </div>`;
  }

  function getCompletionPct(stats) {
    const total = 20;
    const completed = stats.completed || 0;
    return Math.round((completed / total) * 100);
  }

  // ===================================================
  // RENDER DYNAMIC CARDS (Overview Panel Grid)
  // ===================================================
  function renderPanelCards() {
    const grid = document.getElementById('panel-grid');
    if (!grid) return;

    grid.innerHTML = PANELS.map(panel => {
      const stats  = state.panelStats[panel.key] || { completed: 0, partial: 0, pending: 0, overdue: 0, maxScore: panel.maxScore };
      const pct    = getCompletionPct(stats);
      const notStarted = 20 - (stats.completed + stats.partial + stats.overdue);

      return `
        <div class="panel-card hover-lift" data-panel="${panel.key}" role="button" tabindex="0"
             aria-label="Open ${panel.name} panel">
          <div class="panel-card-header">
            <div class="panel-icon ${panel.colorClass}">
              <i data-lucide="${panel.icon}"></i>
            </div>
            <span class="panel-score-badge">Max: ${panel.maxScore} pts</span>
          </div>

          <div class="panel-card-title">${panel.name}</div>

          <div class="panel-progress-ring-wrap">
            ${buildProgressRing(pct, panel.colorClass)}
            <div class="panel-ring-stats">
              <div class="ring-stat-row">
                <div class="ring-dot dot-green"></div>
                <span class="ring-stat-label">Completed</span>
                <span class="ring-stat-value">${stats.completed}</span>
              </div>
              <div class="ring-stat-row">
                <div class="ring-dot dot-orange"></div>
                <span class="ring-stat-label">Pending</span>
                <span class="ring-stat-value">${stats.pending || stats.partial}</span>
              </div>
              <div class="ring-stat-row">
                <div class="ring-dot dot-red"></div>
                <span class="ring-stat-label">Overdue</span>
                <span class="ring-stat-value">${stats.overdue}</span>
              </div>
              <div class="ring-stat-row">
                <div class="ring-dot dot-grey"></div>
                <span class="ring-stat-label">Not Started</span>
                <span class="ring-stat-value">${Math.max(0, notStarted)}</span>
              </div>
            </div>
          </div>

          <div class="panel-card-footer">
            <span class="panel-card-meta">20 clubs monitored</span>
            <button class="panel-view-btn" aria-label="View ${panel.name} details">
              View Details <i data-lucide="chevron-right"></i>
            </button>
          </div>
        </div>`;
    }).join('');

    // Rebind icons and click events
    if (window.lucide) lucide.createIcons();
    document.querySelectorAll('.panel-card').forEach(card => {
      card.addEventListener('click', () => openPanelDetail(card.dataset.panel));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openPanelDetail(card.dataset.panel); });
    });
  }

  // ===================================================
  // RENDER MAIN KPI METRICS
  // ===================================================
  function renderKPIBar() {
    let totalCompleted = 0, totalPending = 0, totalOverdue = 0;
    Object.values(state.panelStats).forEach(s => {
      totalCompleted += s.completed || 0;
      totalPending   += s.pending   || s.partial || 0;
      totalOverdue   += s.overdue   || 0;
    });
    const totalSlots    = PANELS.length * 20;
    const overallPct    = totalSlots ? Math.round((totalCompleted / totalSlots) * 100) : 0;
    const avgScore      = state.clubs.length
      ? Math.round(state.clubs.reduce((sum, c) => sum + (c.score || 0), 0) / state.clubs.length)
      : 0;

    setText('kpi-total-clubs',    `${state.clubs.length}`);
    setText('kpi-avg-score',      `${avgScore}%`);
    setText('kpi-pending-verif',  `${totalPending}`);
    setText('kpi-overdue-count',  `${totalOverdue}`);
    setText('kpi-completion-pct', `${overallPct}%`);
  }

  // ===================================================
  // RENDER DYNAMIC WIDGETS
  // ===================================================
  function renderActivity() {
    const list = document.getElementById('activity-list');
    if (!list) return;
    const TYPE_DOT = { verified: 'act-verified', submitted: 'act-submitted', correction: 'act-correction', rejected: 'act-rejected' };
    list.innerHTML = MOCK_RECENT_ACTIVITY.map(item => `
      <li class="activity-item">
        <div class="activity-type-dot ${TYPE_DOT[item.type] || 'act-submitted'}"></div>
        <div class="activity-text">
          <div class="activity-club">${item.club}</div>
          <div class="activity-action">${item.action}</div>
        </div>
        <span class="activity-time">${item.time}</span>
      </li>`).join('');
  }

  function renderRankings() {
    const list = document.getElementById('rankings-list');
    if (!list) return;
    const sorted = [...state.clubs].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 7);
    const posCls = ['pos-1', 'pos-2', 'pos-3'];
    list.innerHTML = sorted.map((club, i) => `
      <li class="ranking-item">
        <div class="ranking-pos ${posCls[i] || 'pos-other'}">${i + 1}</div>
        <span class="ranking-club" title="${club.name}">${club.name}</span>
        <div class="ranking-bar-wrap">
          <div class="ranking-bar" style="width:${club.score || 0}%"></div>
        </div>
        <span class="ranking-score">${club.score || 0}</span>
      </li>`).join('');
  }

  // ===================================================
  // RENDER DEADLINES
  // ===================================================
  function renderDeadlines() {
    const list = document.getElementById('deadlines-list');
    if (!list) return;
    list.innerHTML = MOCK_DEADLINES.map(d => {
      const chipCls  = `chip-${d.urgency}`;
      const barCls   = `urgency-${d.urgency}`;
      const chipText = d.urgency === 'critical' ? 'URGENT' : d.urgency === 'warning' ? 'Soon' : d.urgency === 'upcoming' ? 'Upcoming' : 'Normal';
      return `
        <li class="deadline-item">
          <div class="deadline-urgency-bar ${barCls}"></div>
          <div class="deadline-info">
            <div class="deadline-panel">${d.panel}</div>
            <div class="deadline-days">${d.daysLeft} day${d.daysLeft !== 1 ? 's' : ''} remaining</div>
          </div>
          <span class="deadline-chip ${chipCls}">${chipText}</span>
        </li>`;
    }).join('');
  }

  function renderNotifications() {
    const list = document.getElementById('notifList');
    if (!list) return;
    const notifs = MOCK_RECENT_ACTIVITY.slice(0, 5);
    const TYPE_DOT = { verified: 'notif-dot-green', submitted: 'notif-dot-blue', correction: 'notif-dot-orange', rejected: 'notif-dot-red' };
    list.innerHTML = notifs.map(n => `
      <div class="notif-item unread">
        <div class="notif-dot-indicator ${TYPE_DOT[n.type] || 'notif-dot-blue'}"></div>
        <div class="notif-content-text">
          <div class="notif-club-name">${n.club}</div>
          <div class="notif-action-text">${n.action}</div>
        </div>
        <span class="notif-time">${n.time}</span>
      </div>`).join('');
    const dot = document.getElementById('notif-dot');
    if (dot) dot.classList.remove('hidden');
  }

  function renderClubsGrid() {
    const grid = document.getElementById('clubs-grid');
    if (!grid) return;
    grid.innerHTML = state.clubs.map(club => `
      <div class="club-card hover-lift">
        <div class="club-card-header">
          <span class="club-number-tag">${club.club_id || club.club_number || '—'}</span>
          <div class="club-status-dot"></div>
        </div>
        <div class="club-card-name">${club.name || club.club_name}</div>
        <div class="club-card-region">${club.region || '—'}</div>
        <div class="club-card-score-bar">
          <div class="club-bar-track">
            <div class="club-bar-fill" style="width:${club.score || 0}%"></div>
          </div>
          <span class="club-bar-score">${club.score || 0} pts</span>
        </div>
      </div>`).join('');
  }

  // ===================================================
  // PANEL DETAILS TRANSITIONS
  // ===================================================
  function openPanelDetail(panelKey) {
    const panel = PANELS.find(p => p.key === panelKey);
    if (!panel) return;

    state.currentPanel = panelKey;
    navigateTo('panel-detail');

    // Update panel header
    setText('panel-detail-title', panel.name);
    setText('panel-detail-sub', `All 20 Leo Clubs · ${state.currentYear}`);
    setText('topbar-section-label', panel.name);

    const iconEl = document.getElementById('panel-detail-icon');
    if (iconEl) {
      iconEl.className = `panel-detail-icon ${panel.colorClass}`;
      iconEl.innerHTML = `<i data-lucide="${panel.icon}"></i>`;
    }

    // Refresh calculations
    recalculatePanelStats(panelKey);

    const stats = state.panelStats[panelKey] || {};
    setText('ps-completed',    stats.completed || 0);
    setText('ps-pending',      stats.pending || stats.partial || 0);
    setText('ps-overdue',      stats.overdue || 0);
    setText('ps-not-started',  Math.max(0, 20 - ((stats.completed || 0) + (stats.pending || stats.partial || 0) + (stats.overdue || 0))));
    setText('ps-completion-pct', `${getCompletionPct(stats)}%`);

    // Render table
    renderClubsTable(panelKey);

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navEl = document.getElementById(`nav-${panelKey}`);
    if (navEl) navEl.classList.add('active');

    if (window.lucide) lucide.createIcons();
  }

  // Recalculates stats from state memory
  function recalculatePanelStats(panelKey) {
    const records = state.panelRecords[panelKey] || {};
    let completed = 0, pending = 0, overdue = 0;
    
    Object.values(records).forEach(rec => {
      if (rec.status === 'completed' || rec.status === 'verified') completed++;
      else if (rec.status === 'pending_district' || rec.status === 'submitted' || rec.status === 'in_progress') pending++;
      else if (rec.status === 'overdue') overdue++;
    });

    state.panelStats[panelKey] = {
      completed,
      pending,
      partial: pending,
      overdue,
      maxScore: PANELS.find(p=>p.key===panelKey)?.maxScore || 10
    };
  }

  // ===================================================
  // 20-CLUB DETAIL LISTING
  // ===================================================
  function renderClubsTable(panelKey) {
    const tbody = document.getElementById('clubs-table-body');
    if (!tbody) return;

    tbody.innerHTML = state.clubs.map((club, i) => {
      const clubKey = club.id || club.club_id;
      const record = state.panelRecords[panelKey]?.[clubKey] || {
        status: 'not_started', progress: 0, evidence: '', remarks: ''
      };

      const hasEvidence = !!record.evidence;
      const status      = record.status;
      const pct         = record.progress;
      const maxScore    = PANELS.find(p => p.key === panelKey)?.maxScore || 10;
      const score       = ((pct / 100) * maxScore).toFixed(1);

      return `
        <tr>
          <td class="col-rank"><span class="club-rank-num">${i + 1}</span></td>
          <td class="col-club">
            <div class="club-name-cell">
              <span class="club-name-primary">${club.name}</span>
              <span class="club-name-id">${club.club_id || ''}</span>
            </div>
          </td>
          <td class="col-region">${club.region || '—'}</td>
          <td class="col-status">${buildStatusChip(status)}</td>
          <td class="col-progress">${buildMiniBar(pct)}</td>
          <td class="col-updated" style="color:rgba(236,239,250,0.4);font-size:0.72rem">Just now</td>
          <td class="col-evidence">
            ${hasEvidence
              ? `<a href="${record.evidence}" target="_blank" class="evidence-link"><i data-lucide="file-text"></i> View</a>`
              : `<span class="no-evidence">—</span>`}
          </td>
          <td class="col-verify">${buildStatusChip(status === 'verified' ? 'verified' : 'pending_district')}</td>
          <td class="col-score"><span class="score-display">${score}</span></td>
          <td class="col-action">
            <button class="table-action-btn edit-record-btn" data-idx="${i}">
              <i data-lucide="edit-3"></i> Edit
            </button>
          </td>
        </tr>`;
    }).join('');

    if (window.lucide) lucide.createIcons();

    // Bind action events
    tbody.querySelectorAll('.edit-record-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const clubIdx = parseInt(btn.dataset.idx, 10);
        openEditModal(clubIdx, panelKey);
      });
    });

    const searchEl  = document.getElementById('club-search');
    const statusEl  = document.getElementById('status-filter');
    const regionEl  = document.getElementById('region-filter');
    if (searchEl) searchEl.addEventListener('input', filterTable);
    if (statusEl) statusEl.addEventListener('change', filterTable);
    if (regionEl) regionEl.addEventListener('change', filterTable);
  }

  function filterTable() {
    const query  = (document.getElementById('club-search')?.value || '').toLowerCase();
    const status = document.getElementById('status-filter')?.value || '';
    const region = document.getElementById('region-filter')?.value || '';
    const rows   = document.querySelectorAll('#clubs-table-body tr');

    rows.forEach((row, i) => {
      const club = state.clubs[i];
      if (!club) return;
      const record = state.panelRecords[state.currentPanel]?.[club.id || club.club_id] || {};
      
      const nameMatch   = !query || club.name.toLowerCase().includes(query) || (club.club_id || '').toLowerCase().includes(query);
      const statusMatch = !status || record.status === status;
      const regionMatch = !region || club.region === region;

      row.style.display = (nameMatch && statusMatch && regionMatch) ? '' : 'none';
    });
  }

  // ===================================================
  // DYNAMIC FORM MODAL GENERATION & LOGIC
  // ===================================================
  const modal = document.getElementById('recordModal');

  function openEditModal(clubIdx, panelKey) {
    const club = state.clubs[clubIdx];
    if (!club || !modal) return;

    const clubKey = club.id || club.club_id;
    const record  = state.panelRecords[panelKey]?.[clubKey] || {};

    // Pop static info
    document.getElementById('form-club-idx').value = clubIdx;
    document.getElementById('form-panel-key').value = panelKey;
    setText('form-club-name', club.name);
    setText('form-club-region', club.region || '—');
    setText('modalTitle', `Update ${PANELS.find(p=>p.key===panelKey)?.name} Details`);

    // Reset base inputs
    document.getElementById('form-status').value = record.status || 'not_started';
    document.getElementById('form-progress').value = record.progress || 0;
    document.getElementById('form-evidence').value = record.evidence || '';
    document.getElementById('form-remarks').value = record.remarks || '';

    // Generate dynamic fields HTML
    const container = document.getElementById('dynamic-fields-container');
    if (container) {
      const fields = PANEL_FIELDS[panelKey] || [];
      
      if (fields.length === 0) {
        container.innerHTML = `<p style="font-size:0.75rem;color:rgba(236,239,250,0.4)">No dynamic inputs defined for this panel.</p>`;
      } else {
        container.innerHTML = `<div class="dynamic-fields-grid">` + fields.map(field => {
          const val = record[field.name] !== undefined ? record[field.name] : '';
          
          if (field.type === 'checkbox') {
            const checked = val === true ? 'checked' : '';
            return `
              <div class="form-group">
                <label class="form-group-checkbox">
                  <input type="checkbox" class="form-input-checkbox dynamic-field-input" 
                         data-field-name="${field.name}" ${checked}>
                  <span class="checkbox-label-text">${field.label}</span>
                </label>
              </div>`;
          } else if (field.type === 'textarea') {
            return `
              <div class="form-group" style="grid-column: span 2">
                <label class="form-label">${field.label}</label>
                <textarea class="form-input-textarea dynamic-field-input" rows="2"
                          data-field-name="${field.name}" placeholder="Enter details...">${val}</textarea>
              </div>`;
          } else {
            const step = field.type === 'number' ? 'step="1"' : '';
            const maxLenAttr = field.maxLength ? `maxlength="${field.maxLength}"` : '';
            return `
              <div class="form-group">
                <label class="form-label">${field.label}</label>
                <input type="${field.type}" class="form-input-text dynamic-field-input" ${step} ${maxLenAttr}
                       data-field-name="${field.name}" value="${val}" placeholder="Enter value...">
              </div>`;
          }
        }).join('') + `</div>`;
      }
    }

    // Accessible Modal Opening
    modal.showModal();
    if (window.lucide) lucide.createIcons();
  }

  // Handlers for closing modal
  function closeModal() {
    modal?.close();
  }

  // Safe dismiss event bounds checking (backdrop click)
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target !== modal) return;
      const rect = modal.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isDialogContent) closeModal();
    });
  }

  // Handle modal submit
  document.getElementById('recordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const clubIdx  = parseInt(document.getElementById('form-club-idx').value, 10);
    const panelKey = document.getElementById('form-panel-key').value;
    const club     = state.clubs[clubIdx];
    if (!club) return;

    const clubKey = club.id || club.club_id;
    
    // Construct updated record object
    const updatedRecord = {
      status: document.getElementById('form-status').value,
      progress: parseInt(document.getElementById('form-progress').value, 10) || 0,
      evidence: document.getElementById('form-evidence').value.trim(),
      remarks: document.getElementById('form-remarks').value.trim()
    };

    // Grab dynamic values
    const dynamicInputs = document.querySelectorAll('.dynamic-field-input');
    dynamicInputs.forEach(input => {
      const fieldName = input.dataset.fieldName;
      if (input.type === 'checkbox') {
        updatedRecord[fieldName] = input.checked;
      } else if (input.type === 'number') {
        updatedRecord[fieldName] = parseFloat(input.value) || 0;
      } else {
        updatedRecord[fieldName] = input.value;
      }
    });

    // Write to State
    state.panelRecords[panelKey][clubKey] = updatedRecord;

    // Recalculate and refresh detail listing
    openPanelDetail(panelKey);
    renderKPIBar();
    renderPanelCards();
    
    // Save to Supabase (if configured)
    const client = getClient();
    if (client) {
      try {
        console.log('[LeoMinutes360] Saving update back to Supabase...', updatedRecord);
        // Find match inside club_panel_records to keep summary sync
        await client
          .from('club_panel_records')
          .update({
            status: updatedRecord.status,
            completion_pct: updatedRecord.progress,
            remarks: updatedRecord.remarks
          })
          .eq('club_id', club.id)
          .eq('panel_key', panelKey);
      } catch (err) {
        console.error('[LeoMinutes360] Supabase database sync failed:', err);
      }
    }

    closeModal();
  });

  document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);

  // ===================================================
  // BREADCRUMB ROUTER
  // ===================================================
  function navigateTo(sectionKey) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`section-${sectionKey}`);
    if (target) target.classList.add('active');

    const labels = {
      overview:      'District Dashboard',
      panel_detail:  state.currentPanel ? (PANELS.find(p=>p.key===state.currentPanel)?.name || 'Panel') : 'Panel',
      clubs:         'Leo Clubs',
      reports:       'Reports',
      settings:      'Settings',
    };
    setText('topbar-section-label', labels[sectionKey] || 'Dashboard');

    if (sectionKey !== 'panel-detail') {
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      const navEl = document.getElementById(`nav-${sectionKey}`);
      if (navEl) navEl.classList.add('active');
    }

    document.getElementById('main-content')?.scrollTo(0, 0);
  }

  // ===================================================
  // SYSTEM SETUP
  // ===================================================
  function applyUserInfo(user) {
    state.user = user;
    const name  = user?.full_name || user?.name || user?.email || 'Unknown User';
    const role  = ROLE_LABELS[user?.role_name || user?.role] || (user?.role_name || user?.role || 'User');

    setText('topbar-user-name',  name);
    setText('topbar-role-badge', role);
    setText('sidebar-user-name', name);
    setText('sidebar-user-role', role);
  }

  function openSidebar() {
    state.sidebarOpen = true;
    document.getElementById('sidebar')?.classList.add('open');
    document.getElementById('sidebarOverlay')?.classList.add('open');
  }
  function closeSidebar() {
    state.sidebarOpen = false;
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('open');
  }

  function openNotifDrawer() {
    state.notifOpen = true;
    document.getElementById('notifDrawer')?.classList.add('open');
    document.getElementById('notifBackdrop')?.classList.add('open');
  }
  function closeNotifDrawer() {
    state.notifOpen = false;
    document.getElementById('notifDrawer')?.classList.remove('open');
    document.getElementById('notifBackdrop')?.classList.remove('open');
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('hidden');
  }

  // ===================================================
  // BOOTSTRAP INITIALIZATION
  // ===================================================
  async function init() {
    if (window.lucide) lucide.createIcons();

    const isAuthed = await checkAuth();
    if (!isAuthed) {
      window.location.href = 'index.html';
      return;
    }

    const [user, panelStats, clubs] = await Promise.all([
      fetchCurrentUser(),
      fetchPanelStats(),
      fetchClubs(),
    ]);

    state.panelStats = panelStats;
    state.clubs      = clubs;

    // Seed master database dynamically if empty
    await seedDatabaseIfNeeded(clubs);

    // Seed/Init dynamic values in state memory
    initLocalPanelRecords();

    applyUserInfo(user);
    renderKPIBar();
    renderPanelCards();
    renderActivity();
    renderRankings();
    renderDeadlines();
    renderNotifications();
    renderClubsGrid();

    setText('current-year-label', state.currentYear);
    setText('topbar-year', state.currentYear);

    // Overdue notifications badges
    PANELS.forEach(panel => {
      const stats = state.panelStats[panel.key] || {};
      const badge = document.getElementById(`badge-${panel.key}`);
      if (badge && stats.overdue > 0) {
        badge.textContent = stats.overdue;
        badge.classList.add('visible');
      }
    });

    if (window.lucide) lucide.createIcons();
    hideLoading();
  }

  // ===================================================
  // GLOBAL LISTENERS BINDING
  // ===================================================
  function bindEvents() {
    document.getElementById('sidebarToggleBtn')?.addEventListener('click', () => {
      state.sidebarOpen ? closeSidebar() : openSidebar();
    });
    document.getElementById('sidebarCloseBtn')?.addEventListener('click', closeSidebar);
    document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const panel = item.dataset.panel;
        if (!panel) return;
        if (panel === 'overview') {
          state.currentPanel = 'overview';
          navigateTo('overview');
          setText('topbar-section-label', 'District Dashboard');
        } else if (PANELS.find(p => p.key === panel)) {
          openPanelDetail(panel);
        } else {
          navigateTo(panel);
        }
        if (window.innerWidth <= 1024) closeSidebar();
      });
    });

    document.getElementById('backToDashBtn')?.addEventListener('click', () => {
      navigateTo('overview');
      state.currentPanel = 'overview';
    });

    document.getElementById('notifBtn')?.addEventListener('click', () => {
      state.notifOpen ? closeNotifDrawer() : openNotifDrawer();
    });
    document.getElementById('notifBackdrop')?.addEventListener('click', closeNotifDrawer);
    document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
      document.querySelectorAll('.notif-item').forEach(n => n.classList.remove('unread'));
      document.getElementById('notif-dot')?.classList.add('hidden');
    });

    document.getElementById('topbarAvatarBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const dd = document.getElementById('topbarDropdown');
      state.dropdownOpen = !state.dropdownOpen;
      dd?.classList.toggle('open', state.dropdownOpen);
    });
    document.addEventListener('click', () => {
      if (state.dropdownOpen) {
        document.getElementById('topbarDropdown')?.classList.remove('open');
        state.dropdownOpen = false;
      }
    });

    document.getElementById('dd-settings')?.addEventListener('click', e => {
      e.preventDefault();
      navigateTo('settings');
    });

    document.getElementById('logoutBtn')?.addEventListener('click', signOut);

    document.getElementById('exportBtn')?.addEventListener('click', () => {
      alert('Generating dynamic PDF export of current monitoring statistics...');
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeNotifDrawer();
        closeSidebar();
        closeModal();
      }
    });
  }

  function bootstrap() {
    bindEvents();
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
