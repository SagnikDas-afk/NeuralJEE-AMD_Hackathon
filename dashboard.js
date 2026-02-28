(function(){
  var c = document.getElementById('main-content');
  if (!c) return;
  var t = document.createElement('div');
  t.innerHTML = `<!-- DASHBOARD PAGE -->
<div id="page-dashboard" class="page active">

  <!-- Hero Welcome Banner -->
  <div class="dash-hero">
    <div class="dash-hero-text">
      <h2 id="dwelcome">Welcome back! 👋</h2>
      <p>// your preparation overview for today</p>
    </div>
    <div class="dash-jee-counter">
      <div class="big-num" id="djee">--</div>
      <div class="big-label">days to JEE</div>
    </div>
  </div>

  <!-- API Key Banner -->
  <div class="api-key-banner" id="api-banner" style="display:none;">
    <span style="font-size:22px">✨</span>
    <div style="flex:1;">
      <p style="font-weight:700;color:var(--white);margin-bottom:4px;">Add a FREE AI Key to unlock AI Mock Tests, Note Analysis &amp; Doubt Solver</p>
      <p>Get a free Gemini key at <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com</a> (no credit card) · or Groq at <a href="https://console.groq.com" target="_blank" style="color:var(--accent3);">console.groq.com</a></p>
    </div>
    <select id="api-provider-sel" style="padding:8px 10px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;font-family:'JetBrains Mono',monospace;outline:none;">
      <option value="gemini">Gemini (Google)</option>
      <option value="groq" selected>Groq (Llama)</option>
    </select>
    <input class="api-key-inp" id="api-key-inp" type="password" placeholder="AIzaSy... or gsk_..." value=process.env.GROQ_API_KEY/>
    <button class="api-save-btn" onclick="saveApiKey()">Save Key</button>
  </div>

  <!-- Stats Grid -->
  <div class="stats-grid">
    <div class="stat-card stat-card-anim" data-delay="0">
      <div class="lbl">Notes Saved</div>
      <div class="val" id="stat-notes" style="color:var(--accent)">0</div>
      <div class="sub">across all subjects</div>
    </div>
    <div class="stat-card stat-card-anim" data-delay="80">
      <div class="lbl">Cards Today</div>
      <div class="val" id="stat-cards" style="color:var(--accent3)">0</div>
      <div class="sub">flashcards reviewed</div>
    </div>
    <div class="stat-card stat-card-anim" data-delay="160">
      <div class="lbl">Last Score</div>
      <div class="val" id="stat-score" style="color:var(--accent4)">--</div>
      <div class="sub">mock test result</div>
    </div>
    <div class="stat-card stat-card-anim" data-delay="240" style="cursor:pointer;" onclick="nav('creditscore', document.querySelector('[onclick*=creditscore]'))">
      <div class="lbl">Credit Score</div>
      <div class="val" id="stat-credit" style="color:var(--accent)">—</div>
      <div class="sub">JEE readiness / 1000</div>
    </div>
    <div class="stat-card stat-card-anim" data-delay="320">
      <div class="lbl">Study Streak</div>
      <div class="val" id="stat-streak" style="color:var(--accent2)">0</div>
      <div class="sub">days in a row 🔥</div>
    </div>
    <div class="stat-card stat-card-anim" data-delay="400">
      <div class="lbl">Videos Watched</div>
      <div class="val" id="stat-watched" style="color:var(--physics)">0</div>
      <div class="sub">total watched</div>
    </div>
  </div>

  <!-- Activity Heatmap -->
  <div class="heatmap-section">
    <h3>📊 Study Activity</h3>
    <div class="heatmap-sub" id="heatmap-total">0 study sessions in the last year</div>
    <div id="heatmap-container"></div>
    <div class="heatmap-legend">
      Less
      <div class="hm-day" data-level="0"></div>
      <div class="hm-day" data-level="1"></div>
      <div class="hm-day" data-level="2"></div>
      <div class="hm-day" data-level="3"></div>
      <div class="hm-day" data-level="4"></div>
      More
    </div>
    <div class="streak-badges">
      <div class="streak-badge">
        <div class="sv" id="streak-cur" style="color:var(--accent2)">0</div>
        <div class="sl">Current Streak 🔥</div>
      </div>
      <div class="streak-badge">
        <div class="sv" id="streak-max" style="color:var(--accent4)">0</div>
        <div class="sl">Longest Streak</div>
      </div>
      <div class="streak-badge">
        <div class="sv" id="streak-total" style="color:var(--accent3)">0</div>
        <div class="sl">Total Sessions</div>
      </div>
    </div>
  </div>

  <!-- Bottom 2-col grid -->
  <div class="dash-grid">
    <div class="card-box">
      <h3>📅 JEE Important Dates</h3>
      <div class="date-item">
        <div class="date-badge">
          <div class="mo">JAN</div>
          <div class="dy">28</div>
        </div>
        <div class="date-info">
          <h4>JEE Mains 2026 — Session 1</h4>
          <p>Computer Based Test · All India</p>
          <span class="cd" id="cd1"></span>
        </div>
      </div>
      <div class="date-item">
        <div class="date-badge">
          <div class="mo">APR</div>
          <div class="dy">05</div>
        </div>
        <div class="date-info">
          <h4>JEE Mains 2026 — Session 2</h4>
          <p>Computer Based Test · All India</p>
          <span class="cd" id="cd2"></span>
        </div>
      </div>
      <div class="date-item">
        <div class="date-badge" style="background:rgba(245,166,35,0.08);border-color:rgba(245,166,35,0.25)">
          <div class="mo" style="color:var(--accent4)">MAY</div>
          <div class="dy" style="color:var(--accent4)">25</div>
        </div>
        <div class="date-info">
          <h4>JEE Advanced 2026</h4>
          <p>IIT Delhi · Paper 1 &amp; 2</p>
          <span class="cd" id="cd3" style="background:rgba(245,166,35,0.08);border-color:rgba(245,166,35,0.3);color:var(--accent4)"></span>
        </div>
      </div>
    </div>

    <div class="card-box">
      <h3>📈 Test Score History</h3>
      <div class="score-history" id="score-history"></div>
      <div style="font-size:10px;color:var(--muted);margin-top:8px;font-family:'JetBrains Mono',monospace;">Last 10 mock test scores</div>
      <div class="chart-bar-wrap" id="subj-accuracy" style="margin-top:16px;display:flex;flex-direction:column;gap:10px;"></div>
    </div>
  </div>

</div>`;
  while (t.firstChild) c.appendChild(t.firstChild);
})();
