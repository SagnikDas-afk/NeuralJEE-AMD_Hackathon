// =================== NeuralJEE — app.js ===================
// All core app logic: auth, navigation, notes, flashcards,
// mock tests, videos, calendar, credit score, doubts, dashboard.

// =================== STORAGE HELPERS ===================
const LS = {
  get: (k, def = null) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} }
};

// =================== AUTH ===================
// Auth UI helpers (used by login/signup HTML buttons)
function showMsg(id, text, type) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'auth-msg ' + type;
}
function clearMsg(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  el.className = 'auth-msg';
}

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  var tabEl = document.querySelector('.auth-tab[onclick*="' + tab + '"]');
  if (tabEl) tabEl.classList.add('active');
  var panel = document.getElementById((tab === 'login' ? 'login' : 'signup') + '-p');
  if (panel) panel.classList.add('active');
  clearMsg('login-msg');
  clearMsg('signup-msg');
}

function doLogin() {
  const email = document.getElementById('l-email').value.trim().toLowerCase();
  const pass = document.getElementById('l-pass').value;
  clearMsg('login-msg');
  if (!email || !pass) { showMsg('login-msg', 'Please fill in all fields.', 'error'); return; }
  if (!email.includes('@')) { showMsg('login-msg', 'Enter a valid email.', 'error'); return; }
  const users = LS.get('njee_users', {});
  if (!users[email] || users[email].pass !== btoa(pass)) {
    showMsg('login-msg', 'Invalid email or password.', 'error'); return;
  }
  LS.set('njee_current', email);
  showMsg('login-msg', 'Welcome back, ' + users[email].name + '!', 'success');
  const level = LS.get('njee_level_' + email, null);
  setTimeout(function() {
    if (!level) { showLevelScreen(); } else { launchApp(email); }
  }, 500);
}

function doSignup() {
  const name = document.getElementById('s-name').value.trim();
  const email = document.getElementById('s-email').value.trim().toLowerCase();
  const pass = document.getElementById('s-pass').value;
  clearMsg('signup-msg');
  if (!name) { showMsg('signup-msg', 'Please enter your name.', 'error'); return; }
  if (!email || !email.includes('@')) { showMsg('signup-msg', 'Enter a valid email.', 'error'); return; }
  if (pass.length < 8) { showMsg('signup-msg', 'Password must be at least 8 characters.', 'error'); return; }
  const users = LS.get('njee_users', {});
  if (users[email]) { showMsg('signup-msg', 'Account already exists. Please log in.', 'error'); return; }
  users[email] = { name, pass: btoa(pass) };
  LS.set('njee_users', users);
  LS.set('njee_current', email);
  showMsg('signup-msg', 'Account created! Setting up your profile...', 'success');
  setTimeout(showLevelScreen, 600);
}

function showLevelScreen() {
  document.getElementById('auth-screen').style.display = 'none';
  const ls = document.getElementById('level-screen');
  ls.style.display = 'flex';
}

function selectLevel(lvl) {
  const email = LS.get('njee_current');
  LS.set(`njee_level_${email}`, lvl);
  document.getElementById('level-screen').style.display = 'none';
  launchApp(email);
}

function launchApp(email) {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('level-screen').style.display = 'none';
  const app = document.getElementById('app');
  app.style.display = 'flex';
  const users = LS.get('njee_users', {});
  const name = users[email]?.name || 'Student';
  const level = LS.get(`njee_level_${email}`, 'beginner');
  document.getElementById('uname').textContent = name;
  document.getElementById('uavatar').textContent = name[0].toUpperCase();
  document.getElementById('dwelcome').textContent = `Welcome back, ${name}! 👋`;
  const pill = document.getElementById('level-pill');
  pill.textContent = level.toUpperCase();
  pill.className = `level-pill ${level}`;
  initDashboard();
  initCalendar();
  initFlashcards();
  initVideos();
  renderNotesList();
  updateAnalysisPanel();
  updateCreditScore();
  recordStudyActivity();
}

function confirmLogout() {
  // Don't allow logout during active test
  if (proctorActive) {
    showToast('Cannot logout during a test!', 'error');
    return;
  }
  const modal = document.createElement('div');
  modal.id = 'logout-modal';
  modal.innerHTML = `
    <div class="lm-box">
      <div class="lm-icon">⚠️</div>
      <div class="lm-title">Log Out?</div>
      <div class="lm-sub">Your study data is saved locally.<br>You can log back in anytime.</div>
      <div class="lm-btns">
        <button class="lm-btn-cancel" onclick="document.getElementById('logout-modal').remove()">Stay</button>
        <button class="lm-btn-logout" onclick="doLogout()">Log Out</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function doLogout() {
  const modal = document.getElementById('logout-modal');
  if (modal) modal.remove();
  LS.del('njee_current');
  document.getElementById('app').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
}

function logout() { confirmLogout(); }

// =================== AUTO-LOGIN ===================
// Pages are injected by page.X.js scripts before app.js runs — DOM is ready.
function onAppReady() {
  const email = LS.get('njee_current');
  if (email) {
    const users = LS.get('njee_users', {});
    if (users[email]) {
      const level = LS.get(`njee_level_${email}`, null);
      if (level) { launchApp(email); } else { showLevelScreen(); }
      return;
    }
  }
  document.getElementById('auth-screen').style.display = 'flex';
}

// =================== NAVIGATION ===================
function nav(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById(`page-${page}`);
  if (el) el.classList.add('active');
  if (btn) btn.classList.add('active');
  if (page === 'dashboard') initDashboard();
  if (page === 'calendar') renderCalendar();
  if (page === 'creditscore') updateCreditScore();
  if (page === 'videos') renderVideos();
  if (page === 'notes') renderNotesList();
  if (page === 'profile') initProfilePage();
}

// =================== TOAST ===================
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => t.classList.remove('show'), 3000);
}

// =================== API KEY ===================
function saveApiKey() {
  const key = document.getElementById('api-key-inp').value.trim();
  const provider = document.getElementById('api-provider-sel').value;
  if (!key) { showToast('Please enter an API key', 'error'); return; }
  LS.set('njee_api_key', key);
  LS.set('njee_api_provider', provider);
  document.getElementById('api-banner').style.display = 'none';
  showToast('API key saved! AI features unlocked ✓');
}

function getApiKey() { return LS.get('njee_api_key', ''); }
function getApiProvider() { return LS.get('njee_api_provider', 'gemini'); }

// =================== AI CALL ===================
async function callAI(prompt, systemPrompt = '') {
  const key = getApiKey();
  if (!key) { showToast('Add an API key to use AI features', 'error'); return null; }
  const provider = getApiProvider();
  try {
    if (provider === 'gemini') {
      // Try models newest-first, fall back automatically
      const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];
      for (const model of models) {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: (systemPrompt ? systemPrompt + '\n\n' : '') + prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 4096 }
          })
        });
        const data = await res.json();
        if (data.error?.code === 404 || data.error?.status === 'NOT_FOUND' || res.status === 404) continue;
        if (data.error) { showToast('Gemini error: ' + data.error.message, 'error'); return null; }
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
      showToast('No Gemini model responded. Check API key permissions.', 'error');
      return null;
    } else {
      // Groq — llama-3.3-70b gives best JSON, fallback chain
      const models = ['llama-3.3-70b-versatile', 'llama3-70b-8192', 'llama3-8b-8192'];
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });
      for (const model of models) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
          body: JSON.stringify({ model, messages, max_tokens: 4096, temperature: 0.4 })
        });
        const data = await res.json();
        if (res.status === 404 || data.error?.type === 'invalid_request_error') continue;
        if (data.error) { showToast('Groq error: ' + (data.error.message || JSON.stringify(data.error)), 'error'); return null; }
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
      showToast('No Groq model responded. Check API key.', 'error');
      return null;
    }
  } catch (e) {
    showToast('AI request failed: ' + e.message, 'error');
    return null;
  }
}

// Helper: extract clean JSON from AI response (handles markdown fences, trailing text)
function extractJSON(text) {
  if (!text) return null;
  // Remove markdown code fences
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  // Try to find JSON array
  const arrStart = cleaned.indexOf('[');
  const arrEnd = cleaned.lastIndexOf(']');
  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
    cleaned = cleaned.substring(arrStart, arrEnd + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch(e1) {
    // Try relaxed parse — sometimes AI adds trailing commas
    try {
      const relaxed = cleaned.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(relaxed);
    } catch(e2) {
      return null;
    }
  }
}

// =================== STUDY ACTIVITY ===================
function recordStudyActivity() {
  const email = LS.get('njee_current', 'guest');
  const key = `njee_activity_${email}`;
  const activity = LS.get(key, {});
  const today = new Date().toISOString().split('T')[0];
  activity[today] = (activity[today] || 0) + 1;
  LS.set(key, activity);
}

function getActivity() {
  const email = LS.get('njee_current', 'guest');
  return LS.get(`njee_activity_${email}`, {});
}

// =================== DASHBOARD ===================
function initDashboard() {
  // Days to JEE
  const jee1 = new Date('2026-01-28');
  const now = new Date();
  const diff = Math.ceil((jee1 - now) / 86400000);
  const el = document.getElementById('djee');
  if (el) el.textContent = diff > 0 ? diff : 'Today!';

  // Countdown labels
  setCountdown('cd1', new Date('2026-01-28'));
  setCountdown('cd2', new Date('2026-04-05'));
  setCountdown('cd3', new Date('2026-05-25'));

  // Stats
  const email = LS.get('njee_current', 'guest');
  const notes = LS.get(`njee_notes_${email}`, []);
  const videos = getVideos();
  const mockHistory = LS.get(`njee_mock_history_${email}`, []);
  const fcStats = LS.get(`njee_fc_stats_${email}`, { today: 0 });
  const creditData = LS.get(`njee_credit_${email}`, null);

  setEl('stat-notes', notes.length);
  // Staggered card entrance animation
  requestAnimationFrame(() => {
    document.querySelectorAll('.stat-card-anim').forEach(card => {
      const delay = parseInt(card.dataset.delay || 0);
      setTimeout(() => card.classList.add('card-visible'), delay);
    });
  });
  setEl('stat-cards', fcStats.today || 0);
  setEl('stat-score', mockHistory.length ? `${mockHistory[mockHistory.length - 1].pct}%` : '--');
  setEl('stat-credit', creditData ? creditData.score : '—');
  setEl('stat-watched', videos.filter(v => v.watched).length);

  // Streak
  const activity = getActivity();
  const streaks = calcStreaks(activity);
  setEl('stat-streak', streaks.current);
  setEl('streak-cur', streaks.current);
  setEl('streak-max', streaks.max);
  setEl('streak-total', Object.keys(activity).length);

  // Heatmap
  renderHeatmap(activity);

  // Score history chart
  renderScoreHistory(mockHistory);

  // Subject accuracy
  renderSubjectAccuracy(mockHistory);

  // API banner
  if (getApiKey()) {
    const banner = document.getElementById('api-banner');
    if (banner) banner.style.display = 'none';
  }
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setCountdown(id, date) {
  const el = document.getElementById(id);
  if (!el) return;
  const diff = Math.ceil((date - new Date()) / 86400000);
  el.textContent = diff > 0 ? `${diff} days away` : diff === 0 ? 'Today!' : 'Passed';
}

function calcStreaks(activity) {
  const dates = Object.keys(activity).sort();
  let current = 0, max = 0, streak = 0;
  const today = new Date().toISOString().split('T')[0];
  for (let i = dates.length - 1; i >= 0; i--) {
    const d = new Date(dates[i]);
    const expected = new Date(today);
    expected.setDate(expected.getDate() - (dates.length - 1 - i));
    if (dates[i] === new Date(Date.now() - (dates.length - 1 - i) * 86400000).toISOString().split('T')[0]) streak++;
    else break;
  }
  // Simple approach
  let cur = 0;
  const d = new Date(today);
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().split('T')[0];
    if (activity[key]) { cur++; d.setDate(d.getDate() - 1); } else break;
  }
  let mx = 0, tmp = 0;
  dates.forEach((dt, i) => {
    if (i === 0) { tmp = 1; return; }
    const prev = new Date(dates[i - 1]);
    prev.setDate(prev.getDate() + 1);
    if (dt === prev.toISOString().split('T')[0]) tmp++;
    else tmp = 1;
    mx = Math.max(mx, tmp);
  });
  return { current: cur, max: Math.max(mx, cur) };
}

function renderHeatmap(activity) {
  const container = document.getElementById('heatmap-container');
  if (!container) return;
  const totalEl = document.getElementById('heatmap-total');
  const total = Object.values(activity).reduce((a, b) => a + b, 0);
  if (totalEl) totalEl.textContent = `${total} study sessions in the last year`;

  const end = new Date();
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);

  let html = '<div class="heatmap-grid">';
  let d = new Date(start);
  // Align to Sunday
  while (d.getDay() !== 0) d.setDate(d.getDate() - 1);

  while (d <= end) {
    html += '<div class="hm-week">';
    for (let i = 0; i < 7; i++) {
      const key = d.toISOString().split('T')[0];
      const count = activity[key] || 0;
      const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;
      const inRange = d >= start && d <= end;
      html += `<div class="hm-day" data-level="${inRange ? level : 0}" title="${key}: ${count} sessions"></div>`;
      d.setDate(d.getDate() + 1);
    }
    html += '</div>';
  }
  html += '</div>';
  container.innerHTML = html;
}

function renderScoreHistory(history) {
  const el = document.getElementById('score-history');
  if (!el) return;
  if (!history.length) { el.innerHTML = '<div style="font-size:11px;color:var(--muted);font-family:\'Space Mono\',monospace;">No tests taken yet</div>'; return; }
  const recent = history.slice(-10);
  el.innerHTML = recent.map(h => {
    const pct = h.pct || 0;
    const height = Math.max(4, Math.round(pct * 0.6));
    return `<div class="score-bar" style="height:${height}px;" title="${h.date}: ${pct}%">
      <div class="score-bar-tooltip">${pct}%</div>
    </div>`;
  }).join('');
}

function renderSubjectAccuracy(history) {
  const el = document.getElementById('subj-accuracy');
  if (!el) return;
  if (!history.length) return;
  const subj = { Physics: { c: 0, t: 0 }, Chemistry: { c: 0, t: 0 }, Mathematics: { c: 0, t: 0 } };
  history.forEach(h => {
    if (h.subjects) {
      Object.entries(h.subjects).forEach(([s, d]) => {
        if (subj[s]) { subj[s].c += d.correct || 0; subj[s].t += d.total || 0; }
      });
    }
  });
  el.innerHTML = Object.entries(subj).map(([name, d]) => {
    const pct = d.t > 0 ? Math.round((d.c / d.t) * 100) : 0;
    const color = name === 'Physics' ? 'var(--physics)' : name === 'Chemistry' ? 'var(--chemistry)' : 'var(--math)';
    return `<div class="chart-bar-row">
      <div class="chart-bar-label">${name.substring(0, 4).toUpperCase()}</div>
      <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <div class="chart-bar-val">${pct}%</div>
    </div>`;
  }).join('');
}

// =================== CALENDAR ===================
// API key baked in — works with Google public calendars (Indian Holidays etc.)
const GCAL_API_KEY = 'AIzaSyCnxRUPOH0W1E8i7YQKkBfS77aE67nLnyE';
// Google's public Indian holidays calendar — readable with any API key, no OAuth needed
const INDIAN_HOLIDAY_CAL = 'en.indian%23holiday%40group.v.calendar.google.com';

let calYear, calMonth;
let gcalEvents = [];   // events fetched from Google Calendar
let gcalLoaded = false;

// ---- All JEE exam dates + Indian festivals 2025–2026 ----
const JEE_EVENTS = [
  // JEE 2025
  { date: '2025-01-22', title: 'JEE Mains S1 Starts', type: 'jee' },
  { date: '2025-01-29', title: 'JEE Mains S1 Ends',   type: 'jee' },
  { date: '2025-04-02', title: 'JEE Mains S2 Starts', type: 'jee' },
  { date: '2025-04-09', title: 'JEE Mains S2 Ends',   type: 'jee' },
  { date: '2025-05-18', title: 'JEE Advanced 2025',   type: 'jee' },
  // JEE 2026
  { date: '2026-01-28', title: 'JEE Mains 2026 S1',   type: 'jee' },
  { date: '2026-04-05', title: 'JEE Mains 2026 S2',   type: 'jee' },
  { date: '2026-05-25', title: 'JEE Advanced 2026',   type: 'jee' },
  // Festivals 2025
  { date: '2025-01-26', title: 'Republic Day',      type: 'festival' },
  { date: '2025-02-26', title: 'Maha Shivratri',    type: 'festival' },
  { date: '2025-03-14', title: 'Holi',              type: 'festival' },
  { date: '2025-03-31', title: 'Eid ul-Fitr',       type: 'festival' },
  { date: '2025-04-10', title: 'Ram Navami',        type: 'festival' },
  { date: '2025-04-14', title: 'Ambedkar Jayanti',  type: 'festival' },
  { date: '2025-04-18', title: 'Good Friday',       type: 'festival' },
  { date: '2025-05-12', title: 'Buddha Purnima',    type: 'festival' },
  { date: '2025-08-15', title: 'Independence Day',  type: 'festival' },
  { date: '2025-08-16', title: 'Janmashtami',       type: 'festival' },
  { date: '2025-09-05', title: 'Ganesh Chaturthi',  type: 'festival' },
  { date: '2025-10-02', title: 'Gandhi Jayanti',    type: 'festival' },
  { date: '2025-10-02', title: 'Dussehra',          type: 'festival' },
  { date: '2025-10-20', title: 'Diwali',            type: 'festival' },
  { date: '2025-11-05', title: 'Guru Nanak Jayanti',type: 'festival' },
  { date: '2025-12-25', title: 'Christmas',         type: 'festival' },
  // Festivals 2026
  { date: '2026-01-14', title: 'Makar Sankranti',   type: 'festival' },
  { date: '2026-01-26', title: 'Republic Day',      type: 'festival' },
  { date: '2026-02-15', title: 'Maha Shivratri',    type: 'festival' },
  { date: '2026-03-01', title: 'Holi',              type: 'festival' },
  { date: '2026-03-20', title: 'Eid ul-Fitr',       type: 'festival' },
  { date: '2026-04-14', title: 'Ambedkar Jayanti',  type: 'festival' },
  { date: '2026-08-15', title: 'Independence Day',  type: 'festival' },
  { date: '2026-10-02', title: 'Gandhi Jayanti',    type: 'festival' },
  { date: '2026-10-08', title: 'Diwali',            type: 'festival' },
  { date: '2026-12-25', title: 'Christmas',         type: 'festival' },
];

function initCalendar() {
  calYear  = new Date().getFullYear();
  calMonth = new Date().getMonth();
  renderCalendar();
  // Auto-fetch Indian holidays on first load — works with API key, no OAuth
  syncGoogleCalendar();
}

function calNav(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  renderCalendar();
  // Re-fetch for the new month if we have a key
  syncGoogleCalendar();
}

function renderCalendar() {
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  setEl('cal-title', `${MONTHS[calMonth]} ${calYear}`);

  const hdrEl = document.getElementById('cal-hdr');
  if (hdrEl) hdrEl.innerHTML = ['SUN','MON','TUE','WED','THU','FRI','SAT']
    .map(d => `<div class="cal-day-hdr">${d}</div>`).join('');

  const gridEl = document.getElementById('cal-grid');
  if (!gridEl) return;

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today       = new Date();
  const todayStr    = today.toISOString().split('T')[0];
  const activity    = getActivity();

  let html = '';
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-cell empty"></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const mm  = String(calMonth + 1).padStart(2, '0');
    const dd  = String(d).padStart(2, '0');
    const dateStr  = `${calYear}-${mm}-${dd}`;
    const isToday  = dateStr === todayStr;
    const isPast   = dateStr < todayStr;
    const hasStudy = !!activity[dateStr];

    const dayEvents = [...JEE_EVENTS, ...gcalEvents].filter(e => e.date === dateStr);

    let evHTML = dayEvents.map(e => {
      const short = e.title.length > 16 ? e.title.substring(0, 15) + '…' : e.title;
      return `<div class="cal-ev ${e.type}" title="${e.title}">${short}</div>`;
    }).join('');

    if (hasStudy) evHTML += `<div class="cal-ev study" title="Study session recorded">📚 Studied</div>`;

    const classes = ['cal-cell', isToday ? 'today' : '', isPast ? 'past' : '', hasStudy ? 'has-study' : '']
      .filter(Boolean).join(' ');

    html += `<div class="${classes}">
      <div class="cal-num">${d}</div>
      ${evHTML}
    </div>`;
  }

  gridEl.innerHTML = html;

  // Update upcoming events strip
  renderUpcoming();
}

function renderUpcoming() {
  const el = document.getElementById('upcoming-events');
  if (!el) return;
  const today = new Date().toISOString().split('T')[0];
  const next = [...JEE_EVENTS, ...gcalEvents]
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  el.innerHTML = next.map(e => {
    const d = new Date(e.date + 'T00:00:00');
    const diff = Math.ceil((d - new Date()) / 86400000);
    const label = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : `${diff}d`;
    const color = e.type === 'jee' ? 'var(--accent)' : e.type === 'festival' ? 'var(--accent2)' : '#4285f4';
    const bg = e.type === 'jee' ? 'rgba(0,229,255,.08)' : e.type === 'festival' ? 'rgba(199,125,255,.08)' : 'rgba(66,133,244,.08)';
    return `<div style="background:${bg};border:1px solid ${color}30;border-radius:10px;padding:10px 14px;min-width:140px;">
      <div style="font-size:10px;font-family:'Space Mono',monospace;color:${color};margin-bottom:4px;">${label}</div>
      <div style="font-size:12px;font-weight:700;color:var(--text);line-height:1.3;">${e.title}</div>
      <div style="font-size:10px;color:var(--muted);margin-top:2px;">${e.date}</div>
    </div>`;
  }).join('');
}

// ---- GOOGLE CALENDAR SYNC ----
// Fetches from Indian public holidays calendar (always works with API key)
// AND optionally from the user's own calendar if they provide their email
async function syncGoogleCalendar() {
  // Indian holidays are already in JEE_EVENTS — no API needed for those.
  // Only sync if user has entered their own Google Calendar ID.
  const userCalId = LS.get('njee_gcal_user_id', '');

  let userEvents = [];
  if (userCalId && userCalId !== 'primary') {
    setGCalStatus('loading', '🔄 Syncing your Google Calendar…');
    const encoded = encodeURIComponent(userCalId);
    userEvents = await fetchCalendar(encoded);
    const total = userEvents.filter(e => {
      const m = `${calYear}-${String(calMonth+1).padStart(2,'0')}`;
      return e.date.startsWith(m);
    }).length;
    setGCalStatus('ok', `✓ Google Calendar synced — ${total} event${total !== 1 ? 's' : ''} this month`);
    const refreshBtn = document.getElementById('gcal-refresh-btn');
    if (refreshBtn) refreshBtn.style.display = 'inline-flex';
  } else {
    setGCalStatus('ok', '✓ Indian holidays loaded from built-in calendar');
  }

  gcalEvents = dedupeEvents(userEvents);
  gcalLoaded = true;
  renderCalendar();
}

async function fetchCalendar(encodedCalId) {
  // Indian holidays are already baked into JEE_EVENTS — skip that API call.
  // Only call Google Calendar API if user has entered their own calendar ID.
  if (!encodedCalId || encodedCalId === INDIAN_HOLIDAY_CAL) return [];
  try {
    const tMin = new Date(calYear, calMonth - 1, 1).toISOString();
    const tMax = new Date(calYear, calMonth + 2, 0, 23, 59, 59).toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodedCalId}/events`
      + `?key=${GCAL_API_KEY}`
      + `&timeMin=${encodeURIComponent(tMin)}`
      + `&timeMax=${encodeURIComponent(tMax)}`
      + `&singleEvents=true&orderBy=startTime&maxResults=200`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.error) return [];
    return (data.items || []).map(item => ({
      date:  (item.start?.date || item.start?.dateTime || '').substring(0, 10),
      title: item.summary || 'Event',
      type:  'gcal',
    })).filter(e => e.date);
  } catch (e) {
    return [];
  }
}

function dedupeEvents(events) {
  const seen = new Set();
  return events.filter(e => {
    const key = e.date + '|' + e.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function setGCalStatus(state, msg) {
  const el = document.getElementById('gcal-status');
  if (!el) return;
  el.style.display = 'block';
  if (state === 'loading') {
    el.style.background = 'rgba(66,133,244,.08)';
    el.style.color = '#4285f4';
    el.style.borderColor = 'rgba(66,133,244,.25)';
  } else if (state === 'ok') {
    el.style.background = 'rgba(127,255,106,.06)';
    el.style.color = 'var(--accent3)';
    el.style.borderColor = 'rgba(127,255,106,.25)';
  } else {
    el.style.background = 'rgba(255,82,82,.06)';
    el.style.color = '#ff5252';
    el.style.borderColor = 'rgba(255,82,82,.25)';
  }
  el.textContent = msg;
}

// Called when user clicks "Save" in the calendar connect panel
function connectGCal() {
  const calId = document.getElementById('gcal-user-calid')?.value.trim();
  if (calId) {
    LS.set('njee_gcal_user_id', calId);
    showToast('Calendar ID saved!');
  }
  syncGoogleCalendar();
}

// Legacy alias kept for any HTML that references it
function fetchGCal() { syncGoogleCalendar(); }

// =================== NOTES ===================
let currentNoteId = null;
let _autoSaveTimer = null;

function getNotes() {
  const email = LS.get('njee_current', 'guest');
  return LS.get(`njee_notes_${email}`, []);
}

function saveNotes(notes) {
  const email = LS.get('njee_current', 'guest');
  LS.set(`njee_notes_${email}`, notes);
}

// ── Render the notes list in the sidebar ────────────────────────────────
function renderNotesList(filter = '') {
  const el = document.getElementById('notes-items');
  if (!el) return;
  let notes = getNotes();
  if (filter) notes = notes.filter(n =>
    (n.title || '').toLowerCase().includes(filter) ||
    (n.content || '').toLowerCase().includes(filter)
  );
  if (!notes.length) {
    el.innerHTML = `<div style="padding:20px;text-align:center;color:var(--muted);font-size:12px;font-family:'Space Mono',monospace;">No notes yet.<br>Click + New Note to start!</div>`;
    return;
  }
  el.innerHTML = notes.map(n => `
    <div class="note-item${n.id === currentNoteId ? ' active' : ''}" onclick="openNote('${n.id}')">
      <div style="display:flex;align-items:flex-start;gap:4px;">
        <div style="flex:1;min-width:0;overflow:hidden;">
          <h4 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(n.title) || 'Untitled Note'}</h4>
          <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc((n.content||'').replace(/[✨📌\n]/g,' ')).substring(0,55) || '—'}</p>
        </div>
        <button class="note-del-btn" title="Delete" onclick="deleteNote(event,'${n.id}')">✕</button>
      </div>
      <div class="note-tags" style="margin-top:4px;display:flex;align-items:center;flex-wrap:wrap;gap:4px;">
        ${(n.tags||[]).map(t=>`<span class="tag ${t}">${t}</span>`).join('')}
        <span style="font-size:9px;color:var(--muted);margin-left:auto;">${n.date||''}</span>
      </div>
    </div>
  `).join('');
}

function _esc(str) {
  return (str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Create a brand-new blank note ───────────────────────────────────────
function newNote() {
  // Save current note first before switching
  _flushCurrentNote();
  _renderNoteImages([]); // clear any image strip
  const note = { id: Date.now().toString(), title: '', content: '', tags: [], date: new Date().toLocaleDateString('en-IN') };
  const notes = getNotes();
  notes.unshift(note);
  saveNotes(notes);
  currentNoteId = note.id;
  renderNotesList();
  const titleEl = document.getElementById('n-title');
  const contentEl = document.getElementById('n-content');
  if (titleEl)   { titleEl.value = ''; titleEl.focus(); }
  if (contentEl) { contentEl.value = ''; }
  const panel = document.getElementById('note-ai-panel');
  if (panel) panel.style.display = 'none';
  _wireAutoSave();
}

// ── Open an existing note ───────────────────────────────────────────────
function openNote(id) {
  if (id === currentNoteId) return; // already open — don't overwrite editor
  // Save whatever is in the editor right now before switching
  _flushCurrentNote();
  currentNoteId = id;
  const note = getNotes().find(n => n.id === id);
  if (!note) return;
  const titleEl   = document.getElementById('n-title');
  const contentEl = document.getElementById('n-content');
  // Set values THEN re-render list so IDs are current
  if (titleEl)   titleEl.value   = note.title   || '';
  if (contentEl) contentEl.value = note.content  || '';
  const panel = document.getElementById('note-ai-panel');
  if (panel) panel.style.display = 'none';
  // Render any saved images for this note
  _renderNoteImages(note.images || []);
  renderNotesList(); // highlight active note in list
  _wireAutoSave();
}

// ── Write editor contents → localStorage without changing UI ───────────
function _flushCurrentNote() {
  if (!currentNoteId) return;
  const notes = getNotes();
  const idx = notes.findIndex(n => n.id === currentNoteId);
  if (idx === -1) return;
  const titleEl   = document.getElementById('n-title');
  const contentEl = document.getElementById('n-content');
  notes[idx].title   = (titleEl   ? titleEl.value.trim()   : notes[idx].title)   || 'Untitled Note';
  notes[idx].content = (contentEl ? contentEl.value        : notes[idx].content) || '';
  notes[idx].date    = new Date().toLocaleDateString('en-IN');
  saveNotes(notes);
}

// ── Auto-save: wire input events on the EXISTING DOM elements ──────────
// (no cloneNode — just use a flag to avoid double-wiring)
function _wireAutoSave() {
  const titleEl   = document.getElementById('n-title');
  const contentEl = document.getElementById('n-content');
  if (!titleEl || !contentEl) return;
  if (titleEl._autoSaveWired) return; // already wired
  titleEl._autoSaveWired   = true;
  contentEl._autoSaveWired = true;
  titleEl.addEventListener('input',   _onNoteInput);
  contentEl.addEventListener('input', _onNoteInput);
}

function _onNoteInput() {
  clearTimeout(_autoSaveTimer);
  // Instantly update the sidebar title preview
  if (currentNoteId) {
    const notes = getNotes();
    const idx = notes.findIndex(n => n.id === currentNoteId);
    if (idx !== -1) {
      const t = document.getElementById('n-title');
      const c = document.getElementById('n-content');
      notes[idx].title   = (t ? t.value.trim() : '') || 'Untitled Note';
      notes[idx].content = c ? c.value : '';
      saveNotes(notes);
      renderNotesList(); // live sidebar preview
    }
  }
  // Debounced full save + badge after 1.5 s of no typing
  _autoSaveTimer = setTimeout(() => {
    _flushCurrentNote();
    _showSavedBadge();
  }, 1500);
}

function _showSavedBadge() {
  const badge = document.getElementById('note-saved-badge');
  if (!badge) return;
  badge.classList.add('show');
  clearTimeout(badge._t);
  badge._t = setTimeout(() => badge.classList.remove('show'), 2000);
}

// ── Manual save button ──────────────────────────────────────────────────
function saveNote(silent = false) {
  if (!currentNoteId) { newNote(); return; }
  _flushCurrentNote();
  renderNotesList();
  if (!silent) { showToast('Note saved ✓'); recordStudyActivity(); }
}

// ── Delete a note ───────────────────────────────────────────────────────
function deleteNote(e, id) {
  e.stopPropagation();
  const note  = getNotes().find(n => n.id === id);
  const title = note ? (note.title || 'Untitled Note') : 'this note';
  const modal = document.createElement('div');
  modal.id    = 'del-note-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9999;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:var(--card,#13131f);border:1px solid rgba(255,60,60,.35);border-radius:14px;padding:30px 32px;max-width:340px;width:90%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.6);">
      <div style="font-size:34px;margin-bottom:10px;">🗑️</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;margin-bottom:8px;">DELETE NOTE?</div>
      <div style="font-size:12px;color:var(--muted,#888);margin-bottom:24px;font-family:'Space Grotesk',sans-serif;line-height:1.6;">"${_esc(title.substring(0,45))}"<br>This cannot be undone.</div>
      <div style="display:flex;gap:10px;justify-content:center;">
        <button onclick="document.getElementById('del-note-modal').remove()"
          style="padding:10px 24px;border:1px solid var(--border,#333);background:transparent;color:var(--text,#fff);border-radius:8px;cursor:pointer;font-family:'Space Mono',monospace;font-size:12px;">Cancel</button>
        <button onclick="_confirmDeleteNote('${id}')"
          style="padding:10px 24px;border:none;background:rgba(255,60,60,.85);color:#fff;border-radius:8px;cursor:pointer;font-family:'Space Mono',monospace;font-size:12px;font-weight:700;">Delete</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', ev => { if (ev.target === modal) modal.remove(); });
}

function _confirmDeleteNote(id) {
  const modal = document.getElementById('del-note-modal');
  if (modal) modal.remove();
  let notes = getNotes().filter(n => n.id !== id);
  saveNotes(notes);
  if (currentNoteId === id) {
    currentNoteId = null;
    const titleEl   = document.getElementById('n-title');
    const contentEl = document.getElementById('n-content');
    if (titleEl)   titleEl.value   = '';
    if (contentEl) contentEl.value = '';
    const panel = document.getElementById('note-ai-panel');
    if (panel) panel.style.display = 'none';
    // Open the next available note if any
    if (notes.length) openNote(notes[0].id);
  }
  renderNotesList();
  showToast('Note deleted');
}

function searchNotes(val) { renderNotesList(val.toLowerCase()); }

function setTag(tag) {
  if (!currentNoteId) return;
  const notes = getNotes();
  const idx = notes.findIndex(n => n.id === currentNoteId);
  if (idx === -1) return;
  if (!notes[idx].tags) notes[idx].tags = [];
  if (!notes[idx].tags.includes(tag)) notes[idx].tags.push(tag);
  saveNotes(notes);
  renderNotesList();
  showToast(`Tagged as ${tag}`);
}

function hlSelected() {
  const ta = document.getElementById('n-content');
  const start = ta.selectionStart, end = ta.selectionEnd;
  if (start === end) { showToast('Select some text first', 'error'); return; }
  const text = ta.value;
  ta.value = text.substring(0, start) + '✨ ' + text.substring(start, end) + ' ✨' + text.substring(end);
  showToast('Text highlighted!');
}

function markKP() {
  const ta = document.getElementById('n-content');
  const start = ta.selectionStart, end = ta.selectionEnd;
  const text = ta.value;
  if (start === end) {
    ta.value = text + '\n📌 KEY POINT: ';
    ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
  } else {
    ta.value = text.substring(0, start) + '📌 ' + text.substring(start, end) + ta.value.substring(end);
  }
}

async function aiExtract() {
  const content = document.getElementById('n-content').value;
  if (!content.trim()) { showToast('Write some notes first', 'error'); return; }
  if (!getApiKey()) { showToast('Add an API key to use AI features', 'error'); return; }
  showToast('🤖 AI extracting key points...');
  const result = await callAI(`Extract the 5-8 most important JEE-relevant key points from these notes. Format as a numbered list with concise, exam-focused points:\n\n${content.substring(0, 3000)}`);
  if (!result) return;
  const panel = document.getElementById('note-ai-panel');
  const highlights = document.getElementById('ai-highlights');
  if (panel) panel.style.display = 'block';
  if (highlights) {
    const points = result.split('\n').filter(l => l.trim()).map(l => `<div class="ai-hl-item">${l.replace(/^\d+\.\s*/, '')}</div>`).join('');
    highlights.innerHTML = points;
  }
}

async function aiMockFromNote() {
  const content = document.getElementById('n-content').value;
  const title = document.getElementById('n-title').value;
  if (!content.trim()) { showToast('Write some notes first', 'error'); return; }
  if (!getApiKey()) { showToast('Add an API key to use AI features', 'error'); return; }
  LS.set('njee_mock_note_content', content.substring(0, 3000));
  LS.set('njee_mock_note_title', title);
  nav('mocktest', document.querySelector('[onclick*="mocktest"]'));
  showToast('Switched to Mock Test — select AI Smart Test mode!');
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();

  // ── Plain text ───────────────────────────────────────────────────────
  if (file.type === 'text/plain' || ext === 'txt') {
    const reader = new FileReader();
    reader.onload = e => {
      const titleEl   = document.getElementById('n-title');
      const contentEl = document.getElementById('n-content');
      if (contentEl) contentEl.value = e.target.result;
      if (titleEl && !titleEl.value) titleEl.value = file.name.replace(/\.txt$/i, '');
      _flushCurrentNote();
      showToast('📄 Text file loaded! Click ✨ AI Key Points to extract concepts.');
    };
    reader.readAsText(file);
    return;
  }

  // ── Images (jpg / png) ───────────────────────────────────────────────
  if (file.type.startsWith('image/') || ['jpg','jpeg','png','gif','webp'].includes(ext)) {
    const reader = new FileReader();
    reader.onload = e => {
      const base64 = e.target.result; // data:image/...;base64,...
      // Store image on current note
      if (!currentNoteId) newNote();
      const notes = getNotes();
      const idx = notes.findIndex(n => n.id === currentNoteId);
      if (idx !== -1) {
        if (!notes[idx].images) notes[idx].images = [];
        notes[idx].images.push({ name: file.name, data: base64, date: new Date().toLocaleDateString('en-IN') });
        // If no title set yet, use filename
        const titleEl = document.getElementById('n-title');
        if (titleEl && !titleEl.value.trim()) {
          titleEl.value = file.name.replace(/\.[^.]+$/, '');
          notes[idx].title = titleEl.value;
        }
        saveNotes(notes);
        _renderNoteImages(notes[idx].images);
        renderNotesList();
        showToast('🖼️ Image saved to note!');
      }
    };
    reader.readAsDataURL(file);
    return;
  }

  // ── PDF ──────────────────────────────────────────────────────────────
  if (file.type === 'application/pdf' || ext === 'pdf') {
    showToast('📄 Loading PDF...');
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        // Dynamically load PDF.js from CDN if not already loaded
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        const pdfData = new Uint8Array(e.target.result);
        const pdf = await window.pdfjsLib.getDocument({ data: pdfData }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const tc = await page.getTextContent();
          fullText += tc.items.map(item => item.str).join(' ') + '\n';
        }
        fullText = fullText.trim();
        if (!fullText) {
          showToast('⚠️ PDF has no extractable text (scanned image). Try uploading the page as a JPG.', 'error');
          return;
        }
        const contentEl = document.getElementById('n-content');
        const titleEl   = document.getElementById('n-title');
        if (contentEl) contentEl.value = fullText;
        if (titleEl && !titleEl.value.trim()) titleEl.value = file.name.replace(/\.pdf$/i, '');
        _flushCurrentNote();
        renderNotesList();
        showToast('📄 PDF text extracted! Click ✨ AI Key Points to process it.');
      } catch (err) {
        console.error('PDF error:', err);
        showToast('❌ Could not read PDF. Try copying the text manually.', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
    return;
  }

  showToast('Unsupported file type. Use .txt, .pdf, .jpg or .png', 'error');
}

// ── Render images attached to the current note ───────────────────────────
function _renderNoteImages(images) {
  // Remove any existing image strip
  const existing = document.getElementById('note-img-strip');
  if (existing) existing.remove();
  if (!images || !images.length) return;

  const strip = document.createElement('div');
  strip.id = 'note-img-strip';
  strip.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;padding:10px 0 6px;border-bottom:1px solid var(--border);margin-bottom:8px;';
  strip.innerHTML = images.map((img, i) => `
    <div style="position:relative;display:inline-block;">
      <img src="${img.data}" alt="${_esc(img.name)}"
           style="height:110px;max-width:180px;object-fit:cover;border-radius:8px;border:1px solid var(--border);cursor:pointer;transition:transform .2s;"
           onclick="this.style.transform=this.style.transform?'':'scale(2.5) translateY(20px)'"
           title="${_esc(img.name)}">
      <button onclick="removeNoteImage(${i})"
              style="position:absolute;top:3px;right:3px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;border:none;cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button>
      <div style="font-size:9px;color:var(--muted);font-family:'JetBrains Mono',monospace;margin-top:3px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(img.name)}</div>
    </div>
  `).join('');

  // Insert above the textarea
  const textarea = document.getElementById('n-content');
  if (textarea) textarea.parentNode.insertBefore(strip, textarea);
}

function removeNoteImage(index) {
  if (!currentNoteId) return;
  const notes = getNotes();
  const idx = notes.findIndex(n => n.id === currentNoteId);
  if (idx === -1) return;
  if (!notes[idx].images) return;
  notes[idx].images.splice(index, 1);
  saveNotes(notes);
  _renderNoteImages(notes[idx].images);
  showToast('Image removed');
}

function handleDrop(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) handleFileUpload({ target: { files: event.dataTransfer.files } });
}

// =================== FLASHCARDS ===================
const FLASHCARDS_DB = {
  physics: [
    { q: 'What is Newton\'s Second Law of Motion?', a: 'F = ma — Force equals mass times acceleration', formula: 'F = ma', subj: 'physics' },
    { q: 'State the work-energy theorem', a: 'The work done by all forces acting on an object equals its change in kinetic energy', formula: 'W = ΔKE = ½mv² - ½mu²', subj: 'physics' },
    { q: 'What is Coulomb\'s Law?', a: 'Electrostatic force between two charges is directly proportional to product of charges and inversely proportional to square of distance', formula: 'F = kq₁q₂/r²', subj: 'physics' },
    { q: 'Define escape velocity', a: 'Minimum velocity needed to escape a planet\'s gravitational field', formula: 'v_e = √(2gR)', subj: 'physics' },
    { q: 'What is Snell\'s Law?', a: 'The ratio of sine of angle of incidence to sine of angle of refraction is constant (refractive index)', formula: 'n₁sinθ₁ = n₂sinθ₂', subj: 'physics' },
    { q: 'State Faraday\'s Law of Electromagnetic Induction', a: 'EMF induced in a coil is proportional to the rate of change of magnetic flux', formula: 'ε = -dΦ/dt', subj: 'physics' },
    { q: 'What is the de Broglie wavelength?', a: 'Matter has wave properties; the wavelength associated with a particle', formula: 'λ = h/mv = h/p', subj: 'physics' },
    { q: 'State Bohr\'s second postulate', a: 'Electrons can only orbit in shells where angular momentum is an integral multiple of h/2π', formula: 'mvr = nh/2π', subj: 'physics' },
  ],
  chemistry: [
    { q: 'What is the Ideal Gas Law?', a: 'Relates pressure, volume, amount, and temperature of an ideal gas', formula: 'PV = nRT', subj: 'chemistry' },
    { q: 'What is the Henderson-Hasselbalch equation?', a: 'Calculates pH of a buffer solution from pKa and concentrations of acid/base', formula: 'pH = pKa + log([A⁻]/[HA])', subj: 'chemistry' },
    { q: 'Define rate of reaction', a: 'Change in concentration of reactant/product per unit time', formula: 'r = -d[A]/dt = d[B]/dt', subj: 'chemistry' },
    { q: 'State Hess\'s Law', a: 'Total enthalpy change is independent of the pathway taken', formula: 'ΔH_total = ΣΔH_steps', subj: 'chemistry' },
    { q: 'What is the de Broglie relation for electrons?', a: 'Every particle with momentum has an associated wavelength', formula: 'λ = h/√(2mE)', subj: 'chemistry' },
    { q: 'Define Gibbs Free Energy condition for spontaneity', a: 'A reaction is spontaneous when Gibbs free energy is negative', formula: 'ΔG = ΔH - TΔS < 0 for spontaneous', subj: 'chemistry' },
    { q: 'What is Nernst equation?', a: 'Calculates cell potential under non-standard conditions', formula: 'E = E° - (RT/nF)ln Q', subj: 'chemistry' },
    { q: 'What is Kohlrausch\'s Law?', a: 'Limiting molar conductivity equals sum of individual ionic conductances', formula: 'Λ°m = λ°+ + λ°-', subj: 'chemistry' },
  ],
  mathematics: [
    { q: 'What is the formula for sum of AP?', a: 'Sum of arithmetic progression with n terms', formula: 'Sₙ = n/2 × (2a + (n-1)d) = n/2(a + l)', subj: 'mathematics' },
    { q: 'State the Binomial Theorem', a: 'Expansion of (a + b)ⁿ', formula: '(a+b)ⁿ = Σ C(n,r) aⁿ⁻ʳ bʳ', subj: 'mathematics' },
    { q: 'What is integration by parts?', a: 'Formula to integrate a product of functions', formula: '∫u dv = uv - ∫v du', subj: 'mathematics' },
    { q: 'State the chain rule of differentiation', a: 'Derivative of composite function', formula: 'd/dx[f(g(x))] = f\'(g(x)) · g\'(x)', subj: 'mathematics' },
    { q: 'What is Bayes\' Theorem?', a: 'Calculates conditional probability given prior knowledge', formula: 'P(A|B) = P(B|A)·P(A) / P(B)', subj: 'mathematics' },
    { q: 'What is the distance formula between two points?', a: 'Euclidean distance in 2D', formula: 'd = √[(x₂-x₁)² + (y₂-y₁)²]', subj: 'mathematics' },
    { q: 'What is the formula for area of a triangle using determinant?', a: 'Area using coordinate geometry', formula: 'Area = ½|x₁(y₂-y₃)+x₂(y₃-y₁)+x₃(y₁-y₂)|', subj: 'mathematics' },
    { q: 'What are the roots of quadratic ax²+bx+c=0?', a: 'Quadratic formula', formula: 'x = (-b ± √(b²-4ac)) / 2a', subj: 'mathematics' },
  ]
};

let currentDeck = [], currentCardIndex = 0, cardFlipped = false;

function initFlashcards() { loadDeck('all'); }

function loadDeck(subject) {
  document.getElementById('deck-sel').value = subject;
  if (subject === 'all') {
    currentDeck = [...FLASHCARDS_DB.physics, ...FLASHCARDS_DB.chemistry, ...FLASHCARDS_DB.mathematics];
  } else {
    currentDeck = FLASHCARDS_DB[subject] || [];
  }
  currentCardIndex = 0;
  cardFlipped = false;
  showCard();
  setEl('deck-inf', `${currentDeck.length} cards`);
}

function shuffleDeck() {
  for (let i = currentDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
  }
  currentCardIndex = 0;
  cardFlipped = false;
  showCard();
  showToast('Deck shuffled!');
}

function showCard() {
  if (!currentDeck.length) return;
  const card = currentDeck[currentCardIndex];
  const fc = document.getElementById('fc-el');
  if (fc) fc.classList.remove('flipped');
  cardFlipped = false;

  const total = currentDeck.length;
  const cur = currentCardIndex + 1;
  setEl('card-ctr', `Card ${cur} of ${total}`);
  const prog = document.getElementById('prog-fill');
  if (prog) prog.style.width = `${(cur / total) * 100}%`;

  setEl('fc-q', card.q);
  setEl('fc-ans', card.a);
  setEl('fc-hint', 'Tap card to reveal answer');

  const subj = card.subj || 'physics';
  ['fc-subj', 'fc-subj-b'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = subj.toUpperCase(); el.className = `subj-badge ${subj}`; }
  });

  const formula = document.getElementById('fc-formula');
  if (formula) {
    if (card.formula) { formula.style.display = 'block'; formula.textContent = card.formula; }
    else formula.style.display = 'none';
  }
}

function flipCard() {
  const fc = document.getElementById('fc-el');
  if (!fc) return;
  cardFlipped = !cardFlipped;
  fc.classList.toggle('flipped', cardFlipped);
  setEl('fc-hint', cardFlipped ? 'How well did you know this?' : 'Tap card to reveal answer');
}

function rateCard(rating) {
  const email = LS.get('njee_current', 'guest');
  const stats = LS.get(`njee_fc_stats_${email}`, { today: 0, easy: 0, med: 0, hard: 0 });
  stats.today = (stats.today || 0) + 1;
  stats[rating] = (stats[rating] || 0) + 1;
  LS.set(`njee_fc_stats_${email}`, stats);
  recordStudyActivity();

  currentCardIndex = (currentCardIndex + 1) % currentDeck.length;
  cardFlipped = false;
  showCard();

  if (rating === 'hard') {
    // Re-add hard cards later
    const card = currentDeck[currentCardIndex > 0 ? currentCardIndex - 1 : currentDeck.length - 1];
    setTimeout(() => {
      const insertAt = Math.min(currentCardIndex + 2, currentDeck.length);
      currentDeck.splice(insertAt, 0, { ...card });
    }, 100);
  }
}

// =================== VIDEOS ===================

// ---- CURATED JEE VIDEO LIBRARY (pre-seeded, read-only) ----
// These are verified embeddable JEE videos from major edu channels.
// Users cannot delete these but can mark them watched.
const JEE_LIBRARY = [
  // ===== PHYSICS =====
  // Khan Academy - stable, never deleted
  { id: 'ZM8ECpBuQYE', title: 'Kinematics — Position, Velocity & Acceleration', subject: 'physics', topic: 'Kinematics', channel: 'Khan Academy', isLibrary: true },
  { id: 'ZAqIoDhornk', title: 'Newtons Laws of Motion', subject: 'physics', topic: 'Laws of Motion', channel: 'Khan Academy', isLibrary: true },
  { id: 'TI6AdBW0BsY', title: 'Work and Energy', subject: 'physics', topic: 'Work Energy Power', channel: 'Khan Academy', isLibrary: true },
  { id: 'DMalrMJQwIk', title: 'Gravitational Force', subject: 'physics', topic: 'Gravitation', channel: 'Khan Academy', isLibrary: true },
  { id: 'mdulzEfQXDE', title: 'Introduction to Waves', subject: 'physics', topic: 'Waves & Sound', channel: 'Khan Academy', isLibrary: true },
  { id: 'Atfr-9wGMzU', title: 'Electric Charge and Electric Force', subject: 'physics', topic: 'Electrostatics', channel: 'Khan Academy', isLibrary: true },
  { id: '7vHh1sfZ5KE', title: 'Ohms Law and Circuits', subject: 'physics', topic: 'Current Electricity', channel: 'Khan Academy', isLibrary: true },
  { id: 'qiKW29EETVk', title: 'Magnetic Force on a Current', subject: 'physics', topic: 'Magnetism', channel: 'Khan Academy', isLibrary: true },
  { id: 'CiHN0ZWE5bk', title: 'Introduction to Light — Optics', subject: 'physics', topic: 'Ray Optics', channel: 'Khan Academy', isLibrary: true },
  { id: 'j-ixGKZlTKo', title: 'Thermodynamics — First Law', subject: 'physics', topic: 'Thermodynamics', channel: 'Khan Academy', isLibrary: true },
  { id: 'FCSOBekBigA', title: 'Torque and Rotational Motion', subject: 'physics', topic: 'Rotational Motion', channel: 'Khan Academy', isLibrary: true },
  { id: 'vSsK7Rfa3yA', title: 'Photoelectric Effect — Modern Physics', subject: 'physics', topic: 'Modern Physics', channel: 'Khan Academy', isLibrary: true },

  // ===== CHEMISTRY =====
  { id: 'TStjgUmL1RQ', title: "The Mole and Avogadro's Number", subject: 'chemistry', topic: 'Mole Concept', channel: 'Khan Academy', isLibrary: true },
  { id: 'QqjcCvzWwww', title: 'Atomic Structure and Electron Config', subject: 'chemistry', topic: 'Atomic Structure', channel: 'Khan Academy', isLibrary: true },
  { id: 'Rd4a1X3B61w', title: 'Periodic Table Trends', subject: 'chemistry', topic: 'Periodic Table', channel: 'Khan Academy', isLibrary: true },
  { id: '_rRjsl7PCRA', title: 'Ionic and Covalent Bonds', subject: 'chemistry', topic: 'Chemical Bonding', channel: 'Khan Academy', isLibrary: true },
  { id: 'KWv5PaoHwPA', title: 'Introduction to Organic Chemistry', subject: 'chemistry', topic: 'Organic Basics', channel: 'Khan Academy', isLibrary: true },
  { id: 'ZFsbHnPvsA0', title: 'Alkanes, Alkenes and Alkynes', subject: 'chemistry', topic: 'Hydrocarbons', channel: 'Khan Academy', isLibrary: true },
  { id: 'WGP8tDkFaqM', title: 'Chemical Equilibrium', subject: 'chemistry', topic: 'Equilibrium', channel: 'Khan Academy', isLibrary: true },
  { id: 'lQ6FBA1HM3s', title: 'Oxidation and Reduction', subject: 'chemistry', topic: 'Electrochemistry', channel: 'Khan Academy', isLibrary: true },
  { id: 'SjQG3rKSZUQ', title: 'Enthalpy — Thermochemistry', subject: 'chemistry', topic: 'Thermochemistry', channel: 'Khan Academy', isLibrary: true },
  { id: 'pCRrLMUNKAA', title: 'Solubility and Colligative Properties', subject: 'chemistry', topic: 'Solutions', channel: 'Khan Academy', isLibrary: true },
  { id: 'TeQo_bNXBis', title: 'p-Block Elements Overview', subject: 'chemistry', topic: 'p-Block Elements', channel: 'Khan Academy', isLibrary: true },
  { id: '8tZzMDMgb_k', title: 'Coordination Chemistry Basics', subject: 'chemistry', topic: 'Coordination Chemistry', channel: 'Khan Academy', isLibrary: true },

  // ===== MATHEMATICS =====
  { id: 'ANyVpMS3HL4', title: 'Introduction to Limits — Calculus', subject: 'mathematics', topic: 'Limits & Derivatives', channel: 'Khan Academy', isLibrary: true },
  { id: 'HfACrKJ_Y2w', title: 'Basic Trigonometry', subject: 'mathematics', topic: 'Trigonometry', channel: 'Khan Academy', isLibrary: true },
  { id: 'rfG8ce4nNh0', title: 'Introduction to Integration', subject: 'mathematics', topic: 'Integration', channel: 'Khan Academy', isLibrary: true },
  { id: 'rowWJ0MnkZU', title: 'Introduction to Matrices', subject: 'mathematics', topic: 'Matrices', channel: 'Khan Academy', isLibrary: true },
  { id: 'iLnSBCgcHJg', title: 'Basic Probability', subject: 'mathematics', topic: 'Probability', channel: 'Khan Academy', isLibrary: true },
  { id: 'snGeZlDQL2Q', title: 'Coordinate Geometry — Straight Lines', subject: 'mathematics', topic: 'Coordinate Geometry', channel: 'Khan Academy', isLibrary: true },
  { id: 'EU7HpZDr8Jg', title: 'Arithmetic and Geometric Sequences', subject: 'mathematics', topic: 'Sequences & Series', channel: 'Khan Academy', isLibrary: true },
  { id: 'bVFEBSqHQo0', title: 'Binomial Theorem', subject: 'mathematics', topic: 'Binomial Theorem', channel: 'Khan Academy', isLibrary: true },
  { id: 'SP-YJe7Vldo', title: 'Complex Numbers — Intro', subject: 'mathematics', topic: 'Complex Numbers', channel: 'Khan Academy', isLibrary: true },
  { id: '6o7b9yyhH7c', title: 'Differential Equations Introduction', subject: 'mathematics', topic: 'Differential Equations', channel: 'Khan Academy', isLibrary: true },
  { id: 'k7RM-ot2NWY', title: '3D Vectors and Geometry', subject: 'mathematics', topic: '3D Geometry', channel: 'Khan Academy', isLibrary: true },
  { id: 'vAE_GkFSFis', title: 'Sets, Relations and Functions', subject: 'mathematics', topic: 'Sets & Functions', channel: 'Khan Academy', isLibrary: true },
];

// ---- USER-SAVED VIDEO STORAGE ----
function getUserVideos() {
  const email = LS.get('njee_current', 'guest');
  return LS.get(`njee_user_videos_${email}`, []);
}

function saveUserVideos(vids) {
  const email = LS.get('njee_current', 'guest');
  LS.set(`njee_user_videos_${email}`, vids);
}

// ---- MERGE: library + user videos, with watched state from storage ----
function getVideos() {
  const email = LS.get('njee_current', 'guest');
  const watchedState = LS.get(`njee_watched_${email}`, {});
  const userVids = getUserVideos();

  // Library videos with watched state overlaid
  const libraryWithState = JEE_LIBRARY.map(v => ({
    ...v,
    watched: watchedState[v.id] || false,
    saved: true,
  }));

  // User videos (already have watched from their own storage)
  const userWithState = userVids.map(v => ({
    ...v,
    watched: watchedState[v.id] || v.watched || false,
  }));

  return [...libraryWithState, ...userWithState];
}

// ---- Persist watched state separately so library videos keep their state ----
function setWatched(id, val) {
  const email = LS.get('njee_current', 'guest');
  const state = LS.get(`njee_watched_${email}`, {});
  state[id] = val;
  LS.set(`njee_watched_${email}`, state);
}

function saveVideos(vids) {
  // Only save user-added videos; library is read-only
  const userVids = vids.filter(v => !v.isLibrary);
  saveUserVideos(userVids);
}

// ---- UI state ----
let currentVidFilter = 'all', currentVidSearch = '', currentVidSection = 'all';

function getThumbnailUrl(id) {
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

function onThumbError(img, id) {
  const fallbacks = [
    `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${id}/default.jpg`,
  ];
  const tried = parseInt(img.dataset.tried || '0');
  if (tried < fallbacks.length) {
    img.dataset.tried = tried + 1;
    img.src = fallbacks[tried];
  } else {
    img.style.display = 'none';
    const placeholder = img.closest('.vid-thumb')?.querySelector('.thumb-placeholder');
    if (placeholder) placeholder.style.display = 'flex';
  }
}

function renderVideos() {
  const el = document.getElementById('vids-grid');
  if (!el) return;

  let vids = getVideos();

  // Section filter (library / my-videos / all)
  if (currentVidSection === 'library') vids = vids.filter(v => v.isLibrary);
  else if (currentVidSection === 'mine') vids = vids.filter(v => !v.isLibrary);

  // Subject filter
  if (currentVidFilter === 'watched') vids = vids.filter(v => v.watched);
  else if (currentVidFilter === 'unwatched') vids = vids.filter(v => !v.watched);
  else if (currentVidFilter === 'physics') vids = vids.filter(v => v.subject === 'physics');
  else if (currentVidFilter === 'chemistry') vids = vids.filter(v => v.subject === 'chemistry');
  else if (currentVidFilter === 'mathematics') vids = vids.filter(v => v.subject === 'mathematics');

  // Search
  if (currentVidSearch) {
    const q = currentVidSearch.toLowerCase();
    vids = vids.filter(v =>
      v.title.toLowerCase().includes(q) ||
      (v.topic || '').toLowerCase().includes(q) ||
      (v.channel || '').toLowerCase().includes(q)
    );
  }

  // Update counts in section tabs
  const allVids = getVideos();
  const watchedCount = allVids.filter(v => v.watched).length;
  const libCount = JEE_LIBRARY.length;
  const myCount = getUserVideos().length;

  const tabAll = document.getElementById('vtab-all');
  const tabLib = document.getElementById('vtab-library');
  const tabMine = document.getElementById('vtab-mine');
  const tabWatched = document.getElementById('vtab-watched');
  if (tabAll) tabAll.querySelector('.vtab-count').textContent = allVids.length;
  if (tabLib) tabLib.querySelector('.vtab-count').textContent = libCount;
  if (tabMine) tabMine.querySelector('.vtab-count').textContent = myCount;
  if (tabWatched) tabWatched.querySelector('.vtab-count').textContent = watchedCount;

  if (!vids.length) {
    el.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px 20px;">
      <div style="font-size:40px;margin-bottom:12px;">🔍</div>
      <div style="font-size:15px;font-weight:700;margin-bottom:8px;">No videos found</div>
      <div style="font-size:13px;color:var(--muted);">${currentVidSection === 'mine' ? 'Add your own YouTube videos using the + Add Video button above.' : 'Try a different filter or search term.'}</div>
    </div>`;
    return;
  }

  el.innerHTML = vids.map(v => {
    const subjectColor = v.subject === 'physics' ? 'var(--physics)' : v.subject === 'chemistry' ? 'var(--chemistry)' : 'var(--math)';
    const subjectBg = v.subject === 'physics' ? 'rgba(96,165,250,.1)' : v.subject === 'chemistry' ? 'rgba(244,114,182,.1)' : 'rgba(167,139,250,.1)';
    const subjectIcon = v.subject === 'physics' ? '⚛️' : v.subject === 'chemistry' ? '🧪' : '∑';
    const isUserVid = !v.isLibrary;

    return `<div class="vid-card${v.watched ? ' vid-watched' : ''}" id="vc-${v.id}">
      <div class="vid-thumb" onclick="playVid('${v.id}')">
        <img
          src="${getThumbnailUrl(v.id)}"
          alt="${v.title.replace(/"/g, '&quot;')}"
          loading="lazy"
          data-tried="0"
          onerror="onThumbError(this,'${v.id}')"
        >
        <div class="thumb-placeholder" style="display:none;position:absolute;inset:0;flex-direction:column;align-items:center;justify-content:center;background:var(--surface2);gap:10px;">
          <div style="font-size:36px;">${subjectIcon}</div>
          <div style="font-size:11px;color:var(--muted);font-family:'Space Mono',monospace;text-align:center;padding:0 16px;line-height:1.4;">${v.title.substring(0,45)}</div>
        </div>
        <div class="vid-play-btn">▶</div>
        ${v.watched ? '<div class="vid-watched-badge">✅ Watched</div>' : ''}
        ${v.isLibrary ? `<div class="vid-lib-badge">📚 Library</div>` : '<div class="vid-lib-badge" style="background:rgba(199,125,255,.85);">⭐ Mine</div>'}
      </div>
      <div class="vid-info">
        <div class="vid-meta">
          <span class="vid-subj-tag" style="background:${subjectBg};color:${subjectColor};">${v.subject.charAt(0).toUpperCase() + v.subject.slice(1)}</span>
          ${v.channel ? `<span class="vid-channel">📺 ${v.channel}</span>` : ''}
        </div>
        <div class="vid-title">${v.title}</div>
        <div class="vid-topic-tag">${v.topic || 'General'}</div>
        <div class="vid-actions">
          <button class="vid-btn vid-btn-play" onclick="playVid('${v.id}')">▶ Play</button>
          <button class="vid-btn vid-btn-yt" onclick="openYouTube('${v.id}')">↗ YouTube</button>
          <button class="vid-btn ${v.watched ? 'vid-btn-unwatch' : 'vid-btn-watch'}" onclick="toggleWatched('${v.id}')">${v.watched ? '↩ Unwatch' : '✅ Done'}</button>
          ${isUserVid ? `<button class="vid-btn vid-btn-del" onclick="removeVid('${v.id}')">🗑</button>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

function openYouTube(id) {
  window.open(`https://www.youtube.com/watch?v=${id}`, '_blank');
}

function setVidSection(section, btn) {
  currentVidSection = section;
  document.querySelectorAll('.vtab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderVideos();
}

function filterVids(filter, btn) {
  currentVidFilter = filter;
  document.querySelectorAll('.f-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderVideos();
}

function searchVids() {
  currentVidSearch = (document.getElementById('vsearch')?.value || '').toLowerCase();
  renderVideos();
}

let currentPlayingVidId = '';

function playVid(id) {
  currentPlayingVidId = id;
  const vids = getVideos();
  const vid = vids.find(v => v.id === id);
  const title = vid?.title || 'Video';

  setEl('vp-title', title);
  const btn = document.getElementById('watch-btn');
  const status = document.getElementById('watch-status');
  if (btn) btn.textContent = vid?.watched ? '↩ Mark as Unwatched' : '✅ Mark as Watched';
  if (status) status.textContent = '';

  const modal = document.getElementById('vid-player-modal');
  const iframe = document.getElementById('vp-iframe');
  const fallback = document.getElementById('vp-fallback');
  const playerWrap = document.getElementById('vp-player-wrap');

  if (fallback) fallback.style.display = 'none';
  if (playerWrap) playerWrap.style.display = 'block';
  if (iframe) { iframe.style.display = 'block'; iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`; }
  if (modal) modal.classList.add('open');

  recordStudyActivity();
  checkEmbedAvailability(id);
}

function closeVidPlayer() {
  const modal = document.getElementById('vid-player-modal');
  const iframe = document.getElementById('vp-iframe');
  const fallback = document.getElementById('vp-fallback');
  const playerWrap = document.getElementById('vp-player-wrap');
  if (modal) modal.classList.remove('open');
  if (iframe) { iframe.src = ''; iframe.style.display = 'block'; }
  if (fallback) fallback.style.display = 'none';
  if (playerWrap) playerWrap.style.display = 'block';
  currentPlayingVidId = '';
  clearTimeout(window._embedCheckTimer);
}

function checkEmbedAvailability(id) {
  clearTimeout(window._embedCheckTimer);
  window._embedResolved = false;

  function onYTMessage(e) {
    if (e.origin && e.origin.includes('youtube') && !window._embedResolved) {
      window._embedResolved = true;
      clearTimeout(window._embedCheckTimer);
      window.removeEventListener('message', onYTMessage);
    }
  }
  window.addEventListener('message', onYTMessage);

  window._embedCheckTimer = setTimeout(() => {
    if (!window._embedResolved) {
      window.removeEventListener('message', onYTMessage);
      const iframe = document.getElementById('vp-iframe');
      const fallback = document.getElementById('vp-fallback');
      const playerWrap = document.getElementById('vp-player-wrap');
      if (currentPlayingVidId === id && document.getElementById('vid-player-modal')?.classList.contains('open')) {
        if (iframe) iframe.style.display = 'none';
        if (playerWrap) playerWrap.style.display = 'none';
        if (fallback) fallback.style.display = 'block';
      }
    }
  }, 6000);
}

function markWatched() {
  if (!currentPlayingVidId) return;
  toggleWatched(currentPlayingVidId);
  const vids = getVideos();
  const vid = vids.find(v => v.id === currentPlayingVidId);
  const btn = document.getElementById('watch-btn');
  const status = document.getElementById('watch-status');
  if (btn) btn.textContent = vid?.watched ? '↩ Mark as Unwatched' : '✅ Mark as Watched';
  if (status) status.textContent = vid?.watched ? '✅ Marked watched' : '';
}

function toggleWatched(id) {
  const vids = getVideos();
  const vid = vids.find(v => v.id === id);
  if (!vid) return;
  const newState = !vid.watched;
  setWatched(id, newState);
  // Also update in user videos if it's a user video
  if (!vid.isLibrary) {
    const userVids = getUserVideos();
    const idx = userVids.findIndex(v => v.id === id);
    if (idx !== -1) { userVids[idx].watched = newState; saveUserVideos(userVids); }
  }
  renderVideos();
  showToast(newState ? '✅ Marked as watched!' : 'Marked as unwatched');
  recordStudyActivity();
}

function removeVid(id) {
  const userVids = getUserVideos().filter(v => v.id !== id);
  saveUserVideos(userVids);
  renderVideos();
  showToast('Video removed');
}

function addVid() {
  const urlInput = document.getElementById('av-url');
  const titleInput = document.getElementById('av-title');
  const subjInput = document.getElementById('av-subj');
  const topicInput = document.getElementById('av-topic');
  const url = urlInput?.value.trim() || '';
  const title = titleInput?.value.trim() || '';
  const subj = subjInput?.value || 'physics';
  const topic = topicInput?.value.trim() || '';

  if (!url) { showToast('Please enter a YouTube URL', 'error'); return; }
  if (!title) { showToast('Please enter a video title', 'error'); return; }

  const id = extractYouTubeId(url);
  if (!id) { showToast('Invalid YouTube URL or video ID', 'error'); return; }

  // Check not already in library or user videos
  const allVids = getVideos();
  if (allVids.find(v => v.id === id)) { showToast('This video is already in your library!', 'error'); return; }

  const userVids = getUserVideos();
  userVids.unshift({ id, title, subject: subj, topic, channel: 'My Video', watched: false, saved: true, isLibrary: false, addedAt: Date.now() });
  saveUserVideos(userVids);
  renderVideos();

  // Close modal and reset form
  document.getElementById('add-vid-modal')?.classList.remove('open');
  if (urlInput) urlInput.value = '';
  if (titleInput) titleInput.value = '';
  if (topicInput) topicInput.value = '';

  showToast('Video added to your library!');

  // Switch to My Videos tab to show the new addition
  setVidSection('mine', document.getElementById('vtab-mine'));
}

function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

function initVideos() {
  renderVideos();
}

// =================== MOCK TEST ===================
let testMode = 'ai-smart', testQuestions = [], testAnswers = [], currentQ = 0, testTimer = null, testTimeLeft = 0;

function selMode(el, mode) {
  document.querySelectorAll('.test-opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
  testMode = mode;
}

// ============ BUILD STUDY CONTEXT FOR AI ============
// Collects ALL user notes + watched videos and builds a rich context string
// This is what the AI uses to generate personalised questions
function buildStudyContext() {
  const email = LS.get('njee_current', 'guest');
  const notes = LS.get(`njee_notes_${email}`, []);
  const videos = getVideos();

  const noteParts = [];
  notes.forEach(n => {
    if (n.content && n.content.trim().length > 20) {
      const tag = n.tags?.length ? ` [${n.tags.join(', ')}]` : '';
      noteParts.push(`NOTE: "${n.title || 'Untitled'}"${tag}\n${n.content.substring(0, 600)}`);
    }
  });

  const watchedVids = videos.filter(v => v.watched);
  const vidParts = watchedVids.map(v => `VIDEO WATCHED: "${v.title}" | Subject: ${v.subject} | Topic: ${v.topic || 'General'}`);

  const hasContent = noteParts.length > 0 || vidParts.length > 0;

  return {
    hasContent,
    notesText: noteParts.join('\n\n').substring(0, 3000),
    videosText: vidParts.join('\n'),
    noteCount: noteParts.length,
    videoCount: watchedVids.length,
    topicList: [
      ...notes.flatMap(n => n.tags || []),
      ...watchedVids.map(v => v.topic).filter(Boolean)
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 15)
  };
}

function updateAnalysisPanel() {
  const ctx = buildStudyContext();
  const el = document.getElementById('analysis-topics');
  const sum = document.getElementById('analysis-summary');
  if (!el) return;

  if (!ctx.hasContent) {
    if (sum) sum.textContent = 'Add notes and watch videos to get personalized AI questions';
    el.innerHTML = '<div style="color:var(--muted);font-size:12px;">No topics detected yet. Take notes and watch videos!</div>';
    return;
  }
  if (sum) sum.textContent = `${ctx.noteCount} notes · ${ctx.videoCount} watched videos detected`;

  const email = LS.get('njee_current', 'guest');
  const notes = LS.get(`njee_notes_${email}`, []);
  const topics = [];
  notes.forEach(n => { if (n.tags) n.tags.forEach(t => { if (!topics.find(x => x.t === t)) topics.push({ t, subj: t }); }); });
  getVideos().filter(v => v.watched).forEach(v => { if (v.topic && !topics.find(x => x.t === v.topic)) topics.push({ t: v.topic, subj: v.subject }); });
  el.innerHTML = topics.slice(0, 12).map(t => `<span class="topic-chip ${t.subj}">${t.t}</span>`).join('');
}

// Build a rich AI prompt using the user's actual notes + watched videos
function buildAITestPrompt(numQuestions, subjectFilter) {
  const ctx = buildStudyContext();
  const level = LS.get(`njee_level_${LS.get('njee_current','guest')}`, 'beginner');
  const levelDesc = level === 'expert' ? 'hard, challenging' : level === 'pro' ? 'medium to hard' : 'easy to medium';

  let contextSection = '';
  if (ctx.hasContent) {
    contextSection = `
=== STUDENT STUDY MATERIAL ===
The student has studied the following. Generate questions STRICTLY based on these topics and content:

${ctx.notesText ? `NOTES CONTENT:\n${ctx.notesText}` : ''}
${ctx.videosText ? `\nWATCHED VIDEOS:\n${ctx.videosText}` : ''}

IMPORTANT: Questions MUST be based on what the student has studied above. Do NOT ask about topics not present in their notes or videos.
=== END OF STUDY MATERIAL ===`;
  } else {
    contextSection = `The student has no notes yet. Generate standard JEE Mains questions covering Physics, Chemistry, and Mathematics equally.`;
  }

  const subjInstruction = subjectFilter
    ? `ALL questions must be from ${subjectFilter} only.`
    : `Distribute questions across Physics, Chemistry, and Mathematics (roughly equal).`;

  return `You are a JEE expert question setter. Generate exactly ${numQuestions} JEE-style MCQ questions.

${contextSection}

REQUIREMENTS:
- Difficulty: ${levelDesc} (JEE ${level} level)
- ${subjInstruction}
- Each question must have exactly 4 options with only one correct answer
- Questions should test conceptual understanding and calculation ability
- Explanations should show the solving approach

OUTPUT FORMAT: Return ONLY a valid JSON array — no text before or after, no markdown, no code fences.
Each object must have these exact keys:
- "q": question text (string)
- "opts": array of exactly 4 option strings
- "ans": index of correct answer (0, 1, 2, or 3) — integer
- "subj": one of "Physics", "Chemistry", or "Mathematics"
- "exp": step-by-step explanation of the correct answer (string)

Example of ONE item:
{"q":"What is the unit of force?","opts":["Watt","Newton","Joule","Pascal"],"ans":1,"subj":"Physics","exp":"Force = ma, unit is kg⋅m/s² = Newton"}

Now output the full JSON array of ${numQuestions} questions:`;
}

async function startTest() {
  const modes = { 'ai-smart': { q: 10, t: 20 }, 'mini': { q: 10, t: 20 }, 'full': { q: 25, t: 45 }, 'physics': { q: 10, t: 20 }, 'math': { q: 10, t: 20 }, 'chemistry': { q: 10, t: 20 } };
  const cfg = modes[testMode] || modes['mini'];

  const subjFilter = testMode === 'physics' ? 'Physics' : testMode === 'chemistry' ? 'Chemistry' : testMode === 'math' ? 'Mathematics' : null;

  document.getElementById('test-setup').style.display = 'none';
  document.getElementById('results-panel').style.display = 'none';

  const hasApiKey = !!getApiKey();

  if (hasApiKey) {
    // ALL modes use AI when an API key exists
    const genEl = document.getElementById('ai-generating');
    if (genEl) genEl.style.display = 'block';

    // Update loading message
    const ctx = buildStudyContext();
    const loadingP = genEl?.querySelector('p');
    if (loadingP) {
      if (ctx.hasContent) {
        loadingP.textContent = `Reading your ${ctx.noteCount} notes & ${ctx.videoCount} watched videos...`;
      } else {
        loadingP.textContent = 'Generating JEE questions...';
      }
    }

    const prompt = buildAITestPrompt(cfg.q, subjFilter);
    const result = await callAI(prompt);

    if (genEl) genEl.style.display = 'none';

    if (result) {
      const parsed = extractJSON(result);
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        // Validate question objects have required fields
        const valid = parsed.filter(q =>
          q.q && Array.isArray(q.opts) && q.opts.length === 4 &&
          typeof q.ans === 'number' && q.ans >= 0 && q.ans <= 3 && q.subj
        );
        if (valid.length >= Math.min(3, cfg.q)) {
          testQuestions = valid;
          const indicator = document.getElementById('ai-gen-indicator');
          if (indicator) indicator.style.display = 'flex';
          const ctx2 = buildStudyContext();
          if (ctx2.hasContent && indicator) {
            indicator.textContent = `✨ AI questions based on your ${ctx2.noteCount} notes & ${ctx2.videoCount} watched videos`;
          }
        } else {
          showToast(`AI returned ${valid.length} valid questions. Using preset backup.`, 'error');
          testQuestions = getPresetQuestions(testMode, cfg.q);
          const indicator = document.getElementById('ai-gen-indicator');
          if (indicator) indicator.style.display = 'none';
        }
      } else {
        showToast('AI response could not be parsed. Using preset questions.', 'error');
        testQuestions = getPresetQuestions(testMode, cfg.q);
        const indicator = document.getElementById('ai-gen-indicator');
        if (indicator) indicator.style.display = 'none';
      }
    } else {
      // callAI already showed the error toast
      testQuestions = getPresetQuestions(testMode, cfg.q);
      const indicator = document.getElementById('ai-gen-indicator');
      if (indicator) indicator.style.display = 'none';
    }
  } else {
    testQuestions = getPresetQuestions(testMode, cfg.q);
    const indicator = document.getElementById('ai-gen-indicator');
    if (indicator) indicator.style.display = 'none';
  }

  if (!testQuestions || testQuestions.length === 0) {
    showToast('Could not load questions. Please try again.', 'error');
    document.getElementById('test-setup').style.display = 'block';
    return;
  }

  testAnswers = new Array(testQuestions.length).fill(-1);
  currentQ = 0;
  testTimeLeft = cfg.t * 60;

  setEl('t-mode-lbl', testMode.toUpperCase().replace('-', ' ') + ' TEST');
  document.getElementById('test-ui').style.display = 'block';
  document.body.classList.add('test-active');

  renderQuestion();
  startTimer();
  recordStudyActivity();
  enterProctorMode();
}

function getPresetQuestions(mode, count) {
  const bank = [
    { q: 'A ball is thrown vertically upward with velocity 20 m/s. What is the maximum height reached? (g = 10 m/s²)', opts: ['10 m', '20 m', '40 m', '5 m'], ans: 1, subj: 'Physics', exp: 'Using v² = u² - 2gh → 0 = 400 - 20h → h = 20m' },
    { q: 'The de Broglie wavelength of an electron (mass m) moving with velocity v is:', opts: ['mv/h', 'h/mv', 'hmv', 'h/m²v'], ans: 1, subj: 'Physics', exp: 'λ = h/p = h/mv is the de Broglie relation' },
    { q: 'Which of the following is the most electronegative element?', opts: ['Oxygen', 'Chlorine', 'Fluorine', 'Nitrogen'], ans: 2, subj: 'Chemistry', exp: 'Fluorine has the highest electronegativity (3.98 on Pauling scale)' },
    { q: 'The number of moles in 22g of CO₂ is:', opts: ['0.25', '0.5', '1', '2'], ans: 1, subj: 'Chemistry', exp: 'Molar mass of CO₂ = 44g/mol. n = 22/44 = 0.5 mol' },
    { q: 'The derivative of sin²(x) is:', opts: ['2sin(x)', 'sin(2x)', '2cos(x)', 'cos²(x)'], ans: 1, subj: 'Mathematics', exp: 'd/dx[sin²x] = 2sinx·cosx = sin(2x) by chain rule' },
    { q: 'If z = 1 + i, then |z|² = ?', opts: ['1', '2', '√2', '4'], ans: 1, subj: 'Mathematics', exp: '|z|² = 1² + 1² = 2' },
    { q: 'Which law relates pressure and volume of a gas at constant temperature?', opts: ['Charles\' Law', 'Boyle\'s Law', 'Gay-Lussac\'s Law', 'Avogadro\'s Law'], ans: 1, subj: 'Chemistry', exp: 'Boyle\'s Law: PV = constant at constant T. P∝1/V' },
    { q: 'The electric field inside a conductor in electrostatic equilibrium is:', opts: ['Maximum', 'Uniform', 'Zero', 'Equal to surface field'], ans: 2, subj: 'Physics', exp: 'Free electrons redistribute until internal E = 0' },
    { q: 'Sum of first n natural numbers is:', opts: ['n(n+1)', 'n²', 'n(n+1)/2', 'n(n-1)/2'], ans: 2, subj: 'Mathematics', exp: 'Sₙ = 1+2+...+n = n(n+1)/2' },
    { q: 'SN2 reactions proceed with:', opts: ['Retention of configuration', 'Racemization', 'Inversion of configuration', 'No change'], ans: 2, subj: 'Chemistry', exp: 'SN2 involves backside attack causing Walden inversion (180° inversion)' },
    { q: 'The lens formula is:', opts: ['1/v + 1/u = 1/f', '1/v - 1/u = 1/f', 'v - u = f', 'v/u = f'], ans: 1, subj: 'Physics', exp: '1/v - 1/u = 1/f (using sign convention)' },
    { q: 'The number of solutions of 2sinx = cosx in [0, 2π] is:', opts: ['1', '2', '3', '4'], ans: 1, subj: 'Mathematics', exp: 'tanx = 1/2, which has 2 solutions in [0, 2π]' },
    { q: 'Which quantum number determines the shape of an orbital?', opts: ['n', 'l', 'ml', 'ms'], ans: 1, subj: 'Chemistry', exp: 'Azimuthal quantum number l determines orbital shape' },
    { q: 'Work done in an isothermal reversible expansion of ideal gas:', opts: ['Zero', 'nRT ln(V₂/V₁)', '-nRT ln(V₂/V₁)', 'nCvΔT'], ans: 1, subj: 'Chemistry', exp: 'W = nRT ln(V₂/V₁) for isothermal reversible expansion' },
    { q: 'The area of a circle with radius r is:', opts: ['πr', '2πr', 'πr²', '2πr²'], ans: 2, subj: 'Mathematics', exp: 'Area = πr²' },
    { q: 'Newton\'s law of gravitation: force between masses m₁ and m₂ separated by r is:', opts: ['Gm₁m₂r²', 'Gm₁m₂/r', 'Gm₁m₂/r²', 'Gm₁m₂r'], ans: 2, subj: 'Physics', exp: 'F = Gm₁m₂/r² — inverse square law' },
    { q: 'What is the SI unit of electric potential?', opts: ['Ampere', 'Coulomb', 'Volt', 'Ohm'], ans: 2, subj: 'Physics', exp: 'Electric potential is measured in Volts (V = J/C)' },
    { q: 'The integral of 1/x dx is:', opts: ['x + C', 'ln|x| + C', '1/x² + C', 'x² + C'], ans: 1, subj: 'Mathematics', exp: '∫(1/x)dx = ln|x| + C' },
    { q: 'What is the valency of carbon?', opts: ['2', '3', '4', '6'], ans: 2, subj: 'Chemistry', exp: 'Carbon has 4 valence electrons and forms 4 bonds' },
    { q: 'A simple pendulum oscillates with period T. If length is doubled, new period is:', opts: ['T/√2', 'T√2', '2T', 'T/2'], ans: 1, subj: 'Physics', exp: 'T = 2π√(L/g) ∝ √L. If L→2L, T→T√2' },
    { q: 'Which of the following is an acid anhydride?', opts: ['H₂O', 'CO₂', 'NaOH', 'HCl'], ans: 1, subj: 'Chemistry', exp: 'CO₂ + H₂O → H₂CO₃, making CO₂ an acid anhydride' },
    { q: 'The value of ∫₀^π sinx dx is:', opts: ['0', '1', '2', 'π'], ans: 2, subj: 'Mathematics', exp: '[-cosx]₀^π = -cosπ - (-cos0) = 1 + 1 = 2' },
    { q: 'What is the unit of magnetic field (B)?', opts: ['Tesla', 'Weber', 'Henry', 'Farad'], ans: 0, subj: 'Physics', exp: 'Magnetic field B is measured in Tesla (T = kg/(A·s²))' },
    { q: 'Resonance in benzene results in:', opts: ['sp3 hybridization', 'all C-C bonds equal', 'alternate single/double bonds', 'non-planar structure'], ans: 1, subj: 'Chemistry', exp: 'Resonance delocalizes π electrons making all C-C bonds equal (1.4 Å)' },
    { q: 'The sum of interior angles of a polygon with n sides is:', opts: ['(n-1)×180°', '(n-2)×180°', 'n×180°', '(n+2)×180°'], ans: 1, subj: 'Mathematics', exp: 'Sum = (n-2)×180°' },
  ];

  let filtered = bank;
  if (mode === 'physics') filtered = bank.filter(q => q.subj === 'Physics');
  else if (mode === 'chemistry') filtered = bank.filter(q => q.subj === 'Chemistry');
  else if (mode === 'math') filtered = bank.filter(q => q.subj === 'Mathematics');

  // Shuffle and return count
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function renderQuestion() {
  const q = testQuestions[currentQ];
  if (!q) return;
  const subj = q.subj || 'Physics';
  const color = subj === 'Physics' ? 'var(--physics)' : subj === 'Chemistry' ? 'var(--chemistry)' : 'var(--math)';
  const optLetters = ['A', 'B', 'C', 'D'];
  const selected = testAnswers[currentQ];
  document.getElementById('q-container').innerHTML = `
    <div class="q-card">
      <div class="q-meta">
        <span class="subj-badge ${subj.toLowerCase()}">${subj.toUpperCase()}</span>
        <span class="q-num">Q ${currentQ + 1} / ${testQuestions.length}</span>
      </div>
      <div class="q-text">${q.q}</div>
      <div class="q-opts">
        ${q.opts.map((opt, i) => `
          <div class="q-opt${selected === i ? ' sel' : ''}" onclick="selectAnswer(${i})">
            <div class="opt-ltr">${optLetters[i]}</div>${opt}
          </div>
        `).join('')}
      </div>
    </div>
  `;
  setEl('q-prog', `Q ${currentQ + 1}/${testQuestions.length}`);
}

function selectAnswer(idx) {
  testAnswers[currentQ] = idx;
  renderQuestion();
}

function prevQ() { if (currentQ > 0) { currentQ--; renderQuestion(); } }
function nextQ() { if (currentQ < testQuestions.length - 1) { currentQ++; renderQuestion(); } }

function startTimer() {
  clearInterval(testTimer);
  testTimer = setInterval(() => {
    testTimeLeft--;
    const m = Math.floor(testTimeLeft / 60).toString().padStart(2, '0');
    const s = (testTimeLeft % 60).toString().padStart(2, '0');
    const timerEl = document.getElementById('ttimer');
    if (timerEl) {
      timerEl.textContent = `${m}:${s}`;
      timerEl.style.color = testTimeLeft < 60 ? '#ff5252' : 'var(--accent2)';
    }
    if (testTimeLeft <= 0) endTest();
  }, 1000);
}

function endTest() {
  exitProctorMode();
  document.body.classList.remove('test-active');
  clearInterval(testTimer);
  document.getElementById('test-ui').style.display = 'none';

  let correct = 0, wrong = 0, skipped = 0;
  const subjData = {};
  testQuestions.forEach((q, i) => {
    const subj = q.subj || 'Physics';
    if (!subjData[subj]) subjData[subj] = { correct: 0, wrong: 0, total: 0 };
    subjData[subj].total++;
    if (testAnswers[i] === -1) skipped++;
    else if (testAnswers[i] === q.ans) { correct++; subjData[subj].correct++; }
    else { wrong++; subjData[subj].wrong++; }
  });

  const total = testQuestions.length;
  const pct = Math.round((correct / total) * 100);

  setEl('res-score', `${correct}/${total}`);
  setEl('res-pct', `${pct}% · ${pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good job!' : pct >= 40 ? 'Keep practicing!' : 'Needs improvement'}`);
  setEl('res-correct', correct);
  setEl('res-wrong', wrong);
  setEl('res-skip', skipped);

  // JEE prediction
  const predScore = Math.round((pct / 100) * 300);
  setEl('pred-jee-score', predScore);
  setEl('pred-jee-band', getPredBand(predScore));

  ['Physics', 'Chemistry', 'Mathematics'].forEach(s => {
    const d = subjData[s] || { correct: 0, total: 3 };
    const subPct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
    const subScore = Math.round((subPct / 100) * 100);
    const key = s === 'Physics' ? 'phy' : s === 'Chemistry' ? 'chem' : 'math';
    setEl(`pred-${key}`, subScore);
    const bar = document.getElementById(`pred-${key}-bar`);
    if (bar) bar.style.width = `${subPct}%`;
  });

  // Save to history
  const email = LS.get('njee_current', 'guest');
  const history = LS.get(`njee_mock_history_${email}`, []);
  history.push({ date: new Date().toLocaleDateString('en-IN'), pct, correct, wrong, skipped, total, subjects: subjData, mode: testMode });
  LS.set(`njee_mock_history_${email}`, history);

  // Update credit score
  updateCreditScore();
  const credit = LS.get(`njee_credit_${email}`, { score: 0 });
  setEl('cbl-score', credit.score);
  const grade = getCreditGrade(credit.score);
  setEl('cbl-grade', grade.label);
  const badgeEl = document.getElementById('credit-badge-large');
  if (badgeEl) { badgeEl.style.borderColor = grade.color; badgeEl.style.color = grade.color; }

  // Review
  renderReview();
  renderEffortRows(pct, subjData);

  document.getElementById('results-panel').style.display = 'block';
  document.getElementById('results-panel').scrollIntoView({ behavior: 'smooth' });
}

function getPredBand(score) {
  if (score >= 250) return '🏆 Top 1% — IIT Top Tier reachable';
  if (score >= 200) return '🥇 Top 5% — Good IIT chances';
  if (score >= 150) return '🥈 Top 15% — NIT possible';
  if (score >= 100) return '🥉 Top 40% — State colleges';
  return '📚 Keep practicing — below average';
}

function renderReview() {
  const el = document.getElementById('res-review');
  if (!el) return;
  el.innerHTML = testQuestions.map((q, i) => {
    const userAns = testAnswers[i];
    const isCorrect = userAns === q.ans;
    const isSkipped = userAns === -1;
    const optLetters = ['A', 'B', 'C', 'D'];
    const borderColor = isSkipped ? 'var(--border)' : isCorrect ? 'var(--accent3)' : '#ff5252';
    return `<div class="q-card" style="border-color:${borderColor};margin-bottom:14px;">
      <div class="q-meta">
        <span class="subj-badge ${(q.subj || 'Physics').toLowerCase()}">${(q.subj || 'Physics').toUpperCase()}</span>
        <span class="q-num" style="color:${borderColor}">${isSkipped ? '⏭ Skipped' : isCorrect ? '✅ Correct' : '❌ Wrong'}</span>
      </div>
      <div class="q-text" style="font-size:14px;">${q.q}</div>
      <div class="q-opts">
        ${q.opts.map((opt, j) => {
          let cls = 'q-opt';
          if (j === q.ans) cls += ' correct';
          else if (j === userAns && !isCorrect) cls += ' wrong';
          return `<div class="${cls}"><div class="opt-ltr">${optLetters[j]}</div>${opt}</div>`;
        }).join('')}
      </div>
      ${q.exp ? `<div style="margin-top:12px;padding:10px 14px;background:rgba(0,229,255,.06);border-left:2px solid var(--accent);border-radius:0 6px 6px 0;font-size:12px;color:var(--muted);">💡 ${q.exp}</div>` : ''}
    </div>`;
  }).join('');
}

function renderEffortRows(pct, subjData) {
  const rows = [];
  if (pct < 60) rows.push({ icon: '📚', text: 'Focus on concept clarity — revise weak topics before next test', color: '#ff5252' });
  if (pct >= 60 && pct < 80) rows.push({ icon: '⏱️', text: 'Good accuracy! Work on speed — time yourself per question', color: 'var(--accent2)' });
  if (pct >= 80) rows.push({ icon: '🎯', text: 'Excellent! Try Full Mock to challenge yourself further', color: 'var(--accent3)' });
  Object.entries(subjData).forEach(([s, d]) => {
    if (d.total > 0 && (d.correct / d.total) < 0.5) {
      rows.push({ icon: '🔍', text: `Revise ${s} — only ${Math.round((d.correct / d.total) * 100)}% accuracy`, color: 'var(--accent4)' });
    }
  });
  const el = document.getElementById('res-effort-rows');
  if (el) el.innerHTML = rows.map(r => `<div class="effort-row" style="border-color:${r.color}"><span class="eicon">${r.icon}</span><span class="etext">${r.text}</span></div>`).join('');
}

function resetTest() {
  exitProctorMode();
  document.body.classList.remove('test-active');
  document.getElementById('results-panel').style.display = 'none';
  document.getElementById('test-setup').style.display = 'block';
  testQuestions = []; testAnswers = []; currentQ = 0;
  clearInterval(testTimer);
  updateAnalysisPanel();
}

// =================== CREDIT SCORE ===================
function updateCreditScore() {
  const email = LS.get('njee_current', 'guest');
  const history = LS.get(`njee_mock_history_${email}`, []);

  if (!history.length) {
    document.getElementById('cs-empty').style.display = 'block';
    document.getElementById('cs-dashboard').style.display = 'none';
    return;
  }

  document.getElementById('cs-empty').style.display = 'none';
  document.getElementById('cs-dashboard').style.display = 'block';

  const avgPct = history.reduce((a, h) => a + h.pct, 0) / history.length;
  const bestPct = Math.max(...history.map(h => h.pct));
  const testsCount = history.length;
  const consistency = Math.min(testsCount * 20, 200);
  const recency = history.slice(-5).reduce((a, h) => a + h.pct, 0) / Math.min(5, history.length);
  const creditScore = Math.round(Math.min(1000, (avgPct * 5) + consistency + (recency * 2)));

  const predJEE = Math.round((avgPct / 100) * 300);

  LS.set(`njee_credit_${email}`, { score: creditScore, pred: predJEE });

  const grade = getCreditGrade(creditScore);
  setEl('cs-score-display', creditScore);
  setEl('cs-grade-pill', grade.label);
  setEl('cs-tests-count', testsCount);
  setEl('cs-total-tests', testsCount);
  setEl('cs-pred-score', predJEE);
  setEl('cs-best', bestPct + '%');
  setEl('cs-avg-acc', Math.round(avgPct) + '%');
  setEl('stat-credit', creditScore);

  const gradePill = document.getElementById('cs-grade-pill');
  if (gradePill) { gradePill.style.color = grade.color; gradePill.style.borderColor = grade.color; }

  const bar = document.getElementById('cs-bar-fill');
  if (bar) { bar.style.width = `${(creditScore / 1000) * 100}%`; bar.style.background = grade.color; }

  // Credit score history
  const histEl = document.getElementById('cs-hist-list');
  if (histEl) {
    histEl.innerHTML = history.slice(-8).reverse().map(h => {
      const cs = Math.round(Math.min(1000, (h.pct * 5) + 50));
      return `<div class="cs-hist-row">
        <div class="cs-hist-date">${h.date}</div>
        <div class="cs-hist-bar-wrap"><div class="cs-hist-bar-fill" style="width:${h.pct}%;background:var(--accent)"></div></div>
        <div class="cs-hist-score" style="color:var(--accent3)">${h.pct}%</div>
        <div class="cs-hist-credit" style="color:var(--accent)">${cs}/1000</div>
      </div>`;
    }).join('');
  }

  // Effort rows
  const effortEl = document.getElementById('cs-effort-rows');
  if (effortEl) {
    const rows = [];
    if (avgPct < 50) rows.push({ icon: '📚', text: 'Your accuracy needs work. Practice more fundamentals.', color: '#ff5252' });
    if (avgPct >= 50 && avgPct < 70) rows.push({ icon: '📈', text: 'On track! Push for 70%+ in your next test.', color: 'var(--accent2)' });
    if (avgPct >= 70) rows.push({ icon: '🔥', text: 'Strong performance! Maintain consistency.', color: 'var(--accent3)' });
    if (testsCount < 5) rows.push({ icon: '🎯', text: `Take ${5 - testsCount} more tests to stabilize your credit score.`, color: 'var(--accent)' });
    effortEl.innerHTML = rows.map(r => `<div class="effort-row" style="border-color:${r.color}"><span class="eicon">${r.icon}</span><span class="etext">${r.text}</span></div>`).join('');
  }
}

function getCreditGrade(score) {
  if (score >= 850) return { label: 'EXCEPTIONAL', color: 'var(--accent3)' };
  if (score >= 700) return { label: 'EXCELLENT', color: 'var(--accent)' };
  if (score >= 550) return { label: 'GOOD', color: 'var(--accent4)' };
  if (score >= 400) return { label: 'AVERAGE', color: 'var(--accent2)' };
  return { label: 'NEEDS WORK', color: '#ff5252' };
}

// =================== DOUBT SOLVER ===================
async function sendDoubt() {
  const inp = document.getElementById('doubt-inp');
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = '';
  appendMsg(msg, 'user');
  if (!getApiKey()) {
    appendMsg('Please add an API key in the Dashboard to use the AI Doubt Solver. Go to Dashboard → Add API Key.', 'ai');
    return;
  }
  const thinkingEl = appendMsg('<span class="ai-spinner"></span> Thinking...', 'ai');
  const system = 'You are NeuralJEE AI, an expert JEE tutor. Solve problems step-by-step with clear explanations, formulas, and JEE-specific insights. Format answers clearly with numbered steps. Use mathematical notation where needed.';
  const result = await callAI(msg, system);
  thinkingEl.querySelector('.msg-bubble').innerHTML = result ? marked.parse(result) : 'Sorry, I couldn\'t process that. Please try again.';
  const chatMsgs = document.getElementById('chat-msgs');
  if (chatMsgs) chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function appendMsg(text, role) {
  const el = document.getElementById('chat-msgs');
  if (!el) return document.createElement('div');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = `<div class="msg-lbl">${role === 'ai' ? 'NEURALJEE AI' : 'YOU'}</div><div class="msg-bubble">${text}</div>`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
  return div;
}

function qt(topic) {
  document.getElementById('doubt-inp').value = topic;
  sendDoubt();
}

// =================== VIDEO MODAL CSS FIX ===================
// Inject missing video grid CSS
const vidStyle = document.createElement('style');
vidStyle.textContent = `
.videos-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;}
.vid-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:border-color .2s;}
.vid-card:hover{border-color:var(--accent);}
.vid-card.vid-watched{opacity:.8;}
.vid-thumb{position:relative;aspect-ratio:16/9;overflow:hidden;cursor:pointer;background:var(--surface2);}
.vid-thumb img{width:100%;height:100%;object-fit:cover;}
.vid-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;background:rgba(0,0,0,.7);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;transition:background .2s;}
.vid-thumb:hover .vid-play{background:rgba(0,229,255,.8);color:#000;}
.vid-watched-badge{position:absolute;top:8px;right:8px;background:rgba(127,255,106,.9);color:#000;font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;}
.vid-info{padding:14px;}
.vid-subj{font-size:9px;font-family:'Space Mono',monospace;letter-spacing:2px;margin-bottom:5px;}
.vid-title{font-size:13px;font-weight:700;margin-bottom:4px;line-height:1.3;}
.vid-topic{font-size:11px;color:var(--muted);margin-bottom:10px;}
.vid-actions{display:flex;gap:8px;}
.modal-overlay{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.7);display:none;align-items:center;justify-content:center;}
.modal-overlay.open{display:flex;}
.modal-box{background:var(--surface);border:1px solid var(--border);border-radius:16px;width:90%;max-width:720px;overflow:hidden;}
.modal-hdr{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.modal-hdr h3{font-size:15px;font-weight:700;}
.modal-close{background:none;border:none;color:var(--muted);cursor:pointer;font-size:18px;padding:4px;}
.modal-close:hover{color:var(--text);}
.modal-form{padding:20px;}
#vp-iframe{width:100%;aspect-ratio:16/9;border:none;display:block;}
.btn-sec{padding:8px 16px;background:var(--surface2);border:1px solid var(--border);border-radius:7px;color:var(--text);cursor:pointer;font-family:'Syne',sans-serif;font-size:13px;transition:border-color .15s;}
.btn-sec:hover{border-color:var(--accent);}
.fc-wrap{cursor:pointer;perspective:1000px;width:100%;max-width:580px;}
.fc{width:100%;min-height:240px;position:relative;transform-style:preserve-3d;transition:transform .5s;}
.fc.flipped{transform:rotateY(180deg);}
.fc-face{position:absolute;inset:0;backface-visibility:hidden;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:32px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}
.fc-back{transform:rotateY(180deg);}
.fc-area{display:flex;flex-direction:column;align-items:center;gap:16px;}
`;
document.head.appendChild(vidStyle);

// =================== INIT ===================
// This is called by index.html after pages load
// =================== PROFILE PAGE ===================
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function validateEmailField(input) {
  const valid = isValidEmail(input.value);
  const icon = document.getElementById('email-valid-icon');
  const err  = document.getElementById('email-error');
  if (!input.value) { if (icon) icon.textContent = ''; if (err) err.style.display = 'none'; return; }
  if (icon) icon.textContent = valid ? '✅' : '❌';
  if (err)  err.style.display = valid ? 'none' : 'block';
}

function initProfilePage() {
  const email   = LS.get('njee_current', '');
  const users   = LS.get('njee_users', {});
  const user    = users[email] || {};
  const level   = LS.get(`njee_level_${email}`, 'beginner');
  const extra   = LS.get(`njee_profile_${email}`, {});
  const history = LS.get(`njee_mock_history_${email}`, []);
  const notes   = LS.get(`njee_notes_${email}`, []);
  const streaks = calcStreaks(getActivity());
  const name    = user.name || 'Student';

  setEl('profile-avatar-display', name[0].toUpperCase());
  setEl('profile-name-display', name);
  setEl('profile-email-display', email);
  setEl('pqs-streak', streaks.current);
  setEl('pqs-tests',  history.length);
  setEl('pqs-notes',  notes.length);

  const pill = document.getElementById('profile-level-badge');
  if (pill) { pill.textContent = level.toUpperCase(); pill.className = `profile-level-badge ${level}`; }

  document.querySelectorAll('.level-change-btn').forEach(b => b.classList.remove('active-level'));
  const activeBtn = document.querySelector(`.level-change-btn.${level}`);
  if (activeBtn) activeBtn.classList.add('active-level');

  const pName = document.getElementById('pf-name');     if (pName)  pName.value  = name;
  const pEmail= document.getElementById('pf-email');    if (pEmail) pEmail.value = email;
  const pYear = document.getElementById('pf-year');     if (pYear && extra.targetYear) pYear.value = extra.targetYear;
  const pColl = document.getElementById('pf-college');  if (pColl)  pColl.value  = extra.college  || '';
  const pCity = document.getElementById('pf-city');     if (pCity)  pCity.value  = extra.city     || '';
  const pCoach= document.getElementById('pf-coaching'); if (pCoach) pCoach.value = extra.coaching || '';
  const pHrs  = document.getElementById('pf-hours');    if (pHrs)   pHrs.value   = extra.dailyHours || 6;
  const pHrsV = document.getElementById('pf-hours-val');if (pHrsV)  pHrsV.textContent = `${extra.dailyHours || 6} hrs`;

  ['pf-cur-pass','pf-new-pass','pf-confirm-pass'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function saveProfile() {
  const email    = LS.get('njee_current', '');
  const users    = LS.get('njee_users', {});
  const newName  = (document.getElementById('pf-name')?.value  || '').trim();
  const newEmail = (document.getElementById('pf-email')?.value || '').trim();
  const targetYear  = document.getElementById('pf-year')?.value     || '2026';
  const college     = (document.getElementById('pf-college')?.value || '').trim();
  const city        = (document.getElementById('pf-city')?.value    || '').trim();
  const coaching    = (document.getElementById('pf-coaching')?.value|| '').trim();
  const dailyHours  = parseInt(document.getElementById('pf-hours')?.value || '6');

  if (!newName)  { showToast('Name cannot be empty', 'error'); return; }
  if (!newEmail) { showToast('Email cannot be empty', 'error'); return; }
  if (!isValidEmail(newEmail)) { showToast('Please enter a valid email address', 'error'); return; }

  if (newEmail !== email && users[newEmail]) { showToast('That email is already in use', 'error'); return; }

  if (newEmail !== email) {
    ['njee_level_','njee_notes_','njee_user_videos_','njee_watched_',
     'njee_fc_stats_','njee_mock_history_','njee_credit_','njee_activity_','njee_profile_'].forEach(prefix => {
      try {
        const v = localStorage.getItem(prefix + email);
        if (v !== null) { localStorage.setItem(prefix + newEmail, v); localStorage.removeItem(prefix + email); }
      } catch(e) {}
    });
    users[newEmail] = { ...users[email], name: newName };
    delete users[email];
    LS.set('njee_users', users);
    LS.set('njee_current', newEmail);
  } else {
    users[email].name = newName;
    LS.set('njee_users', users);
  }

  const activeEmail = LS.get('njee_current', email);
  LS.set(`njee_profile_${activeEmail}`, { targetYear, college, city, coaching, dailyHours });

  setEl('uname', newName);
  setEl('uavatar', newName[0].toUpperCase());
  setEl('dwelcome', `Welcome back, ${newName}! 👋`);
  showToast('✅ Profile saved!');
  initProfilePage();
}

function cancelProfileEdit() { initProfilePage(); showToast('No changes made'); }

function changeLevel(newLevel) {
  const email = LS.get('njee_current', '');
  LS.set(`njee_level_${email}`, newLevel);
  const pill = document.getElementById('level-pill');
  if (pill) { pill.textContent = newLevel.toUpperCase(); pill.className = `level-pill ${newLevel}`; }
  document.querySelectorAll('.level-change-btn').forEach(b => b.classList.remove('active-level'));
  const ab = document.querySelector(`.level-change-btn.${newLevel}`); if (ab) ab.classList.add('active-level');
  const pp = document.getElementById('profile-level-badge');
  if (pp) { pp.textContent = newLevel.toUpperCase(); pp.className = `profile-level-badge ${newLevel}`; }
  showToast(`Level updated to ${newLevel}!`);
}

function changePassword() {
  const email   = LS.get('njee_current', '');
  const users   = LS.get('njee_users', {});
  const curPass = document.getElementById('pf-cur-pass')?.value  || '';
  const newPass = document.getElementById('pf-new-pass')?.value  || '';
  const conPass = document.getElementById('pf-confirm-pass')?.value || '';
  if (!curPass || !newPass || !conPass)  { showToast('Fill in all password fields', 'error'); return; }
  if (users[email]?.pass !== btoa(curPass)) { showToast('Current password is incorrect', 'error'); return; }
  if (newPass.length < 8)  { showToast('New password must be at least 8 characters', 'error'); return; }
  if (newPass !== conPass) { showToast('Passwords do not match', 'error'); return; }
  users[email].pass = btoa(newPass);
  LS.set('njee_users', users);
  ['pf-cur-pass','pf-new-pass','pf-confirm-pass'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  showToast('✅ Password updated!');
}

function confirmResetData() {
  if (!confirm('⚠️ This will permanently delete all your notes, mock history, and activity. Cannot be undone. Continue?')) return;
  const email = LS.get('njee_current', '');
  ['njee_notes_','njee_user_videos_','njee_watched_','njee_fc_stats_',
   'njee_mock_history_','njee_credit_','njee_activity_','njee_profile_'].forEach(prefix => {
    try { localStorage.removeItem(prefix + email); } catch(e) {}
  });
  showToast('Data reset. Starting fresh!');
  initProfilePage();
  initDashboard();
}
// =================== END PROFILE ===================

onAppReady();

// =================== VIDEO THUMB PREVIEW IN ADD MODAL ===================
function previewThumb() {
  const url = document.getElementById('av-url')?.value.trim() || '';
  const id = extractYouTubeId(url);
  const preview = document.getElementById('av-thumb-preview');
  const img = document.getElementById('av-thumb-img');
  if (id && preview && img) {
    img.src = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
    preview.style.display = 'block';
  } else if (preview) {
    preview.style.display = 'none';
  }
}

// =================== PROCTOR SYSTEM ===================
// TensorFlow.js BlazeFace — Google's OpenCV-grade face detector
// Runs entirely in browser, model loads from CDN as one bundle

let proctorActive        = false;
let tabSwitchTimer       = null;
let tabSwitchCountdown   = 5;
let tabWarningCount      = 0;
let cameraStream         = null;
let faceCheckInterval    = null;
let noFaceFrames         = 0;
let noFaceCountdown      = 0;
let noFaceCountdownTimer = null;
let blazeModel           = null;      // TF.js BlazeFace model instance

const NO_FACE_ABSENT_FRAMES = 4;   // consecutive no-face frames (~2.8s) before countdown
const NO_FACE_SUBMIT_SECS   = 10;  // seconds to return before auto-submit
const TAB_GRACE_SECS        = 5;

// ─── LOAD BLAZEFACE MODEL ─────────────────────────────────────────────────
// BlazeFace is Google's real-time face detector — same tech as Google Meet.
// The model is ~1MB, loads once, runs at 30fps on CPU.

async function loadBlazeFace() {
  if (blazeModel) return true;
  try {
    // Both @tensorflow/tfjs and @tensorflow-models/blazeface load from CDN
    if (typeof blazeface === 'undefined') {
      console.warn('BlazeFace not loaded yet, retrying...');
      return false;
    }
    blazeModel = await blazeface.load();
    console.log('BlazeFace model loaded ✓');
    return true;
  } catch(e) {
    console.warn('BlazeFace load failed:', e.message);
    return false;
  }
}

// ─── ENTER / EXIT ─────────────────────────────────────────────────────────
async function enterProctorMode() {
  proctorActive      = true;
  tabWarningCount    = 0;
  noFaceFrames       = 0;
  noFaceCountdown    = 0;

  // Fullscreen
  try {
    const el = document.documentElement;
    if      (el.requestFullscreen)       await el.requestFullscreen();
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen)    await el.mozRequestFullScreen();
  } catch(e) {}

  injectProctorUI();

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('blur', onWindowBlur);
  document.addEventListener('contextmenu', blockContextMenu);
  document.addEventListener('keydown', blockCopyKeys);

  await startCamera();
}

function exitProctorMode() {
  if (!proctorActive) return;
  proctorActive = false;

  clearTabTimer();
  stopNoFaceCountdown();

  document.removeEventListener('visibilitychange', onVisibilityChange);
  window.removeEventListener('blur', onWindowBlur);
  document.removeEventListener('contextmenu', blockContextMenu);
  document.removeEventListener('keydown', blockCopyKeys);

  stopCamera();

  try {
    if (document.fullscreenElement) {
      if      (document.exitFullscreen)       document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen)  document.mozCancelFullScreen();
    }
  } catch(e) {}

  const ui = document.getElementById('proctor-overlay');
  if (ui) ui.remove();
}

// ─── UI ───────────────────────────────────────────────────────────────────
function injectProctorUI() {
  const ex = document.getElementById('proctor-overlay');
  if (ex) ex.remove();

  const div = document.createElement('div');
  div.id = 'proctor-overlay';
  div.innerHTML = `
    <style>
      #proctor-cam-box {
        position: fixed;
        top: 58px; left: 14px;
        width: 172px;
        z-index: 9999;
        border-radius: 4px;
        overflow: hidden;
        border: 2px solid rgba(155,93,229,0.5);
        background: #000;
        box-shadow: 0 6px 28px rgba(0,0,0,0.7);
        transition: border-color 0.3s, box-shadow 0.3s;
        font-family: 'Space Mono', monospace;
      }
      #proctor-cam-box.face-gone {
        border-color: rgba(241,91,181,0.9) !important;
        animation: cam-danger 0.7s infinite alternate;
      }
      @keyframes cam-danger {
        from { box-shadow: 0 0 12px rgba(241,91,181,0.3); }
        to   { box-shadow: 0 0 28px rgba(241,91,181,0.7); }
      }
      #proctor-cam-header {
        display: flex; align-items: center; gap: 6px;
        padding: 5px 9px;
        background: rgba(10,10,10,0.95);
        font-size: 9px; letter-spacing: 1px; color: #5a5a5a;
        border-bottom: 1px solid rgba(255,255,255,0.05);
      }
      .cam-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: #9b5de5; flex-shrink: 0;
        animation: cam-blink 1.4s infinite;
      }
      .cam-dot.red { background: #f15bb5; }
      .cam-dot.yellow { background: #fee440; animation: cam-blink 0.6s infinite; }
      @keyframes cam-blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
      #proctor-video-wrap { position: relative; background: #000; }
      #proctor-video {
        width: 100%; display: block;
        transform: scaleX(-1);
        aspect-ratio: 4/3; object-fit: cover;
      }
      #cam-face-canvas {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        transform: scaleX(-1);
      }
      #cam-noface-overlay {
        position: absolute; inset: 0;
        display: none;
        flex-direction: column;
        align-items: center; justify-content: center;
        background: rgba(10,10,10,0.8); gap: 3px; z-index: 2;
      }
      #cam-noface-overlay.active { display: flex; }
      #cam-noface-overlay .nf-icon { font-size: 24px; }
      #cam-noface-overlay .nf-num {
        font-size: 40px; font-family: 'Bebas Neue', sans-serif;
        letter-spacing: 2px; color: #f15bb5; line-height: 1;
      }
      #cam-noface-overlay .nf-lbl {
        font-size: 8px; color: #f15bb5; letter-spacing: 1px; text-align: center;
        font-family: 'Space Mono', monospace;
      }
      #proctor-cam-footer {
        padding: 5px 8px;
        background: rgba(10,10,10,0.95);
        font-size: 8px; color: #5a5a5a; text-align: center;
        border-top: 1px solid rgba(255,255,255,0.05);
        letter-spacing: 1.5px; text-transform: uppercase;
        font-family: 'Space Mono', monospace;
      }
      #cam-status-text { transition: color 0.3s; }
      #proctor-status-bar {
        position: fixed; top: 0; left: 0; right: 0;
        z-index: 9998;
        display: flex; align-items: center; gap: 10px;
        padding: 4px 18px;
        background: rgba(10,10,10,0.97);
        border-bottom: 1px solid rgba(155,93,229,0.2);
        font-size: 9px; color: #5a5a5a;
        font-family: 'Space Mono', monospace;
        pointer-events: none; letter-spacing: 1px;
      }
      #proctor-status-bar .ps-rec {
        width: 7px; height: 7px; border-radius: 50%;
        background: #f15bb5; animation: cam-blink 1s infinite; flex-shrink: 0;
      }
      .ps-right { margin-left: auto; color: #9b5de5; }
      /* Tab warning */
      #tab-warning-overlay {
        position: fixed; inset: 0; z-index: 10000;
        background: rgba(10,10,10,0.97);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 16px;
        pointer-events: all;
      }
      .tw-icon  { font-size: 60px; }
      .tw-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 42px; letter-spacing: 4px; color: #f15bb5;
      }
      .tw-sub   { font-size: 13px; color: #5a5a5a; text-align: center; max-width: 400px; line-height: 1.7; font-family: 'Space Mono', monospace; }
      .tw-count {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 100px; letter-spacing: 4px; color: #f15bb5; line-height: 1;
      }
      .tw-btn {
        padding: 14px 44px;
        background: #9b5de5;
        border: none; border-radius: 3px;
        color: #fff;
        font-family: 'Bebas Neue', sans-serif;
        font-size: 22px; letter-spacing: 3px;
        cursor: pointer; transition: background .2s;
      }
      .tw-btn:hover { background: #c77dff; }
    </style>

    <div id="proctor-status-bar">
      <div class="ps-rec"></div>
      <span>PROCTORED TEST — BlazeFace AI monitoring active</span>
      <span class="ps-right">🔒 FULLSCREEN</span>
    </div>

    <div id="proctor-cam-box">
      <div id="proctor-cam-header">
        <div class="cam-dot yellow" id="cam-dot"></div>
        <span>CAMERA</span>
        <span style="margin-left:auto;color:#fee440;" id="cam-status-text">LOADING</span>
      </div>
      <div id="proctor-video-wrap">
        <video id="proctor-video" autoplay muted playsinline></video>
        <canvas id="cam-face-canvas"></canvas>
        <div id="cam-noface-overlay">
          <div class="nf-icon">👤</div>
          <div class="nf-num" id="nf-count-num">10</div>
          <div class="nf-lbl">NO FACE<br>DETECTED</div>
        </div>
      </div>
      <div id="proctor-cam-footer">YOU ARE BEING MONITORED</div>
    </div>
  `;
  document.body.appendChild(div);
}

// ─── TAB SWITCH ────────────────────────────────────────────────────────────
function onVisibilityChange() { if (!proctorActive) return; if (document.hidden) startTabWarning(); else clearTabTimer(); }
function onWindowBlur() { if (!proctorActive) return; setTimeout(() => { if (proctorActive && !document.hasFocus()) startTabWarning(); }, 300); }
function startTabWarning() {
  if (tabSwitchTimer) return;
  tabSwitchCountdown = TAB_GRACE_SECS;
  tabWarningCount++;
  showTabWarningOverlay();
  tabSwitchTimer = setInterval(() => {
    tabSwitchCountdown--;
    const el = document.getElementById('tw-countdown');
    if (el) el.textContent = tabSwitchCountdown;
    if (tabSwitchCountdown <= 0) {
      clearTabTimer(); removeTabWarningOverlay();
      showToast('⚠️ Test auto-submitted — tab switch!', 'error');
      endTest();
    }
  }, 1000);
}
function clearTabTimer() { if (tabSwitchTimer) { clearInterval(tabSwitchTimer); tabSwitchTimer = null; } removeTabWarningOverlay(); }
function showTabWarningOverlay() {
  removeTabWarningOverlay();
  const div = document.createElement('div');
  div.id = 'tab-warning-overlay';
  div.innerHTML = `
    <div class="tw-icon">🚨</div>
    <div class="tw-title">TAB SWITCH DETECTED</div>
    <div class="tw-sub">Warning #${tabWarningCount} — Return immediately or test auto-submits in:</div>
    <div class="tw-count" id="tw-countdown">${tabSwitchCountdown}</div>
    <div class="tw-sub" style="color:#f15bb5;font-size:10px;">SWITCHING TABS IS STRICTLY PROHIBITED</div>
    <button class="tw-btn" onclick="returnToTest()">↩ RETURN TO TEST</button>`;
  document.body.appendChild(div);
}
function removeTabWarningOverlay() { const el = document.getElementById('tab-warning-overlay'); if (el) el.remove(); }
function returnToTest() { clearTabTimer(); try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); } catch(e) {} }

// ─── COPY / RIGHT-CLICK BLOCK ─────────────────────────────────────────────
function blockContextMenu(e) { if (proctorActive) { e.preventDefault(); showToast('Disabled during test', 'error'); } }
function blockCopyKeys(e) {
  if (!proctorActive) return;
  if (e.ctrlKey && ['c','v','a','u','s','p'].includes(e.key.toLowerCase())) { e.preventDefault(); showToast('Disabled during test', 'error'); }
  if (['F12','PrintScreen'].includes(e.key)) e.preventDefault();
}

// ─── CAMERA ───────────────────────────────────────────────────────────────
async function startCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
      audio: false
    });

    const video = document.getElementById('proctor-video');
    if (!video) return;
    video.srcObject = cameraStream;
    await video.play().catch(() => {});

    video.addEventListener('loadedmetadata', () => {
      const canvas = document.getElementById('cam-face-canvas');
      if (canvas) { canvas.width = video.videoWidth || 320; canvas.height = video.videoHeight || 240; }
    }, { once: true });

    // Load BlazeFace model while camera warms up
    updateCamUI('loading');
    const ok = await loadBlazeFace();

    if (ok) {
      updateCamUI('ready');
      noFaceFrames = 0;
      // 1.5s warmup before detection starts
      setTimeout(() => {
        if (proctorActive) faceCheckInterval = setInterval(runBlazeFaceDetection, 600);
      }, 1500);
    } else {
      // Fallback to pixel-based detection
      updateCamUI('fallback');
      setTimeout(() => {
        if (proctorActive) faceCheckInterval = setInterval(runPixelFallback, 700);
      }, 1500);
    }

  } catch(err) {
    const box = document.getElementById('proctor-cam-box');
    if (box) box.innerHTML = `
      <div style="padding:22px 10px;text-align:center;background:#0a0a0a;">
        <div style="font-size:30px;margin-bottom:8px;">📷</div>
        <div style="font-size:9px;color:#f15bb5;font-family:'Space Mono',monospace;line-height:1.8;letter-spacing:1px;">CAMERA<br>DENIED</div>
      </div>`;
  }
}

function stopCamera() {
  if (faceCheckInterval) { clearInterval(faceCheckInterval); faceCheckInterval = null; }
  if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
}

function updateCamUI(state, faceCount) {
  const dot    = document.getElementById('cam-dot');
  const text   = document.getElementById('cam-status-text');
  const box    = document.getElementById('proctor-cam-box');
  const states = {
    loading:  { dot: 'yellow', dotColor: '#fee440', label: 'LOADING AI', textColor: '#fee440' },
    ready:    { dot: '',       dotColor: '#9b5de5', label: 'AI READY',   textColor: '#9b5de5' },
    fallback: { dot: '',       dotColor: '#fee440', label: 'MOTION',     textColor: '#fee440' },
    face:     { dot: '',       dotColor: '#00f5d4', label: '✓ FACE',     textColor: '#00f5d4' },
    noface:   { dot: 'red',    dotColor: '#f15bb5', label: '✗ NO FACE',  textColor: '#f15bb5' },
  };
  const s = states[state] || states.noface;
  if (dot)  { dot.className = 'cam-dot ' + s.dot; dot.style.background = s.dotColor; }
  if (text) { text.textContent = s.label; text.style.color = s.textColor; }
  if (box) {
    if (state === 'noface') box.classList.add('face-gone');
    else box.classList.remove('face-gone');
  }
}

// ─── BLAZEFACE DETECTION (TF.js OpenCV-equivalent) ───────────────────────
async function runBlazeFaceDetection() {
  if (!proctorActive || !cameraStream || !blazeModel) return;

  const video = document.getElementById('proctor-video');
  if (!video || video.readyState < 3 || video.paused) return;

  try {
    // blazeface.estimateFaces() — returns array of face predictions
    // returnTensors: false = get plain JS arrays back (easier to work with)
    const predictions = await blazeModel.estimateFaces(video, false);

    const faceFound  = predictions && predictions.length > 0;
    const canvas     = document.getElementById('cam-face-canvas');
    const ctx        = canvas ? canvas.getContext('2d') : null;

    // Clear previous drawings
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (faceFound && ctx) {
      // Draw face bounding box + landmarks for each detected face
      predictions.forEach(pred => {
        const [x1, y1] = pred.topLeft;
        const [x2, y2] = pred.bottomRight;
        const w = x2 - x1, h = y2 - y1;

        // Mirror X because video is CSS-mirrored
        const mx = canvas.width - x2;

        // Main bounding box
        ctx.strokeStyle = '#9b5de5';
        ctx.lineWidth   = 2;
        ctx.shadowColor = '#9b5de5';
        ctx.shadowBlur  = 8;
        ctx.strokeRect(mx, y1, w, h);
        ctx.shadowBlur = 0;

        // Corner markers (Adelina-style geometric corners)
        const cl = Math.min(12, w * 0.2);
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(mx, y1 + cl); ctx.lineTo(mx, y1); ctx.lineTo(mx + cl, y1);
        // Top-right
        ctx.moveTo(mx + w - cl, y1); ctx.lineTo(mx + w, y1); ctx.lineTo(mx + w, y1 + cl);
        // Bottom-right
        ctx.moveTo(mx + w, y1 + h - cl); ctx.lineTo(mx + w, y1 + h); ctx.lineTo(mx + w - cl, y1 + h);
        // Bottom-left
        ctx.moveTo(mx + cl, y1 + h); ctx.lineTo(mx, y1 + h); ctx.lineTo(mx, y1 + h - cl);
        ctx.stroke();

        // Draw facial landmarks (BlazeFace gives 6 keypoints)
        if (pred.landmarks && pred.landmarks.length) {
          ctx.fillStyle = '#f15bb5';
          pred.landmarks.forEach(([lx, ly]) => {
            const mlx = canvas.width - lx;
            ctx.beginPath();
            ctx.arc(mlx, ly, 2.5, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      });
    }

    handlePresence(faceFound);

  } catch(e) {
    // Skip frame if tensor error (can happen on first few frames)
  }
}

// ─── PIXEL FALLBACK (when TF.js unavailable) ─────────────────────────────
let _fbCanvas = null, _fbCtx = null, _prevPx = null;
function runPixelFallback() {
  if (!proctorActive || !cameraStream) return;
  const video = document.getElementById('proctor-video');
  if (!video || video.readyState < 3) return;
  if (!_fbCanvas) {
    _fbCanvas = document.createElement('canvas');
    _fbCanvas.width = 64; _fbCanvas.height = 48;
    _fbCtx = _fbCanvas.getContext('2d', { willReadFrequently: true });
  }
  try {
    _fbCtx.drawImage(video, 0, 0, 64, 48);
    const px = _fbCtx.getImageData(0, 0, 64, 48).data;
    const total = 64 * 48;
    // Brightness variance — person in frame = higher variance
    let sum = 0;
    for (let i = 0; i < px.length; i += 4) sum += (px[i]+px[i+1]+px[i+2]) / 3;
    const avg = sum / total;
    let variance = 0;
    for (let i = 0; i < px.length; i += 4) variance += Math.pow((px[i]+px[i+1]+px[i+2])/3 - avg, 2);
    variance /= total;
    // Motion
    let motion = 0;
    if (_prevPx) for (let i = 0; i < px.length; i += 4)
      motion += Math.abs(px[i]-_prevPx[i]) + Math.abs(px[i+1]-_prevPx[i+1]) + Math.abs(px[i+2]-_prevPx[i+2]);
    _prevPx = new Uint8ClampedArray(px);
    motion /= (total * 3 * 255);
    handlePresence(variance > 300 || motion > 0.008);
  } catch(e) {}
}

// ─── SHARED PRESENCE HANDLER ──────────────────────────────────────────────
function handlePresence(present) {
  if (present) {
    noFaceFrames = 0;
    if (noFaceCountdownTimer) stopNoFaceCountdown();
    updateCamUI('face');
  } else {
    noFaceFrames++;
    updateCamUI('noface');
    if (noFaceFrames >= NO_FACE_ABSENT_FRAMES && !noFaceCountdownTimer) {
      startNoFaceCountdown();
    }
  }
}

// ─── NO-FACE COUNTDOWN ────────────────────────────────────────────────────
function startNoFaceCountdown() {
  if (noFaceCountdownTimer) return;
  noFaceCountdown = NO_FACE_SUBMIT_SECS;
  const overlay = document.getElementById('cam-noface-overlay');
  const numEl   = document.getElementById('nf-count-num');
  if (overlay) overlay.classList.add('active');
  if (numEl)   numEl.textContent = noFaceCountdown;
  noFaceCountdownTimer = setInterval(() => {
    noFaceCountdown--;
    const n = document.getElementById('nf-count-num');
    if (n) n.textContent = noFaceCountdown;
    if (noFaceCountdown <= 0) {
      stopNoFaceCountdown();
      showToast('⚠️ Test submitted — you left the camera frame!', 'error');
      endTest();
    }
  }, 1000);
}
function stopNoFaceCountdown() {
  if (noFaceCountdownTimer) { clearInterval(noFaceCountdownTimer); noFaceCountdownTimer = null; }
  noFaceCountdown = 0;
  const overlay = document.getElementById('cam-noface-overlay');
  if (overlay) overlay.classList.remove('active');
  const n = document.getElementById('nf-count-num');
  if (n) n.textContent = NO_FACE_SUBMIT_SECS;
}

// =================== END PROCTOR SYSTEM ===================
