(function(){
  var c=document.getElementById('main-content');
  if(!c)return;
  var t=document.createElement('div');
  t.innerHTML=`<!-- MOCK TEST PAGE -->
<div id="page-mocktest" class="page">
  <div class="ph"><h1>📊 Mock Test</h1><p>// AI-powered questions generated from your notes &amp; watched videos</p></div>

  <div class="test-setup" id="test-setup">
    <h2>Choose Your Test Mode</h2>
    <p>AI generates questions tailored to your notes, lectures, and JEE trend data.</p>

    <!-- User Analysis Summary -->
    <div class="analysis-panel" id="user-analysis-panel">
      <h3>👤 Your Study Profile</h3>
      <div id="analysis-summary" style="font-size:13px;color:var(--muted);margin-bottom:12px;">Based on your notes and watched videos</div>
      <div class="analysis-topics" id="analysis-topics"></div>
    </div>

    <div class="test-opts">
      <div class="test-opt sel" onclick="selMode(this,'ai-smart')"><h4>✨ AI Smart Test</h4><p>10 questions · Strictly from your notes &amp; videos · Personalised</p></div>
      <div class="test-opt" onclick="selMode(this,'mini')"><h4>⏱️ Mini Test</h4><p>10 questions · 20 min · AI from your study material</p></div>
      <div class="test-opt" onclick="selMode(this,'full')"><h4>🎯 Full Mock</h4><p>25 questions · 45 min · AI full simulation from your notes</p></div>
      <div class="test-opt" onclick="selMode(this,'physics')"><h4>⚛️ Physics Only</h4><p>10 questions · 20 min · AI Physics from your notes</p></div>
      <div class="test-opt" onclick="selMode(this,'math')"><h4>∫ Math Only</h4><p>10 questions · 20 min · AI Maths from your notes</p></div>
      <div class="test-opt" onclick="selMode(this,'chemistry')"><h4>🧪 Chemistry Only</h4><p>10 questions · 20 min · AI Chemistry from your notes</p></div>
    </div>
    <button class="start-btn" onclick="startTest()">Start Test ▶</button>
  </div>

  <!-- AI generating loader -->
  <div id="ai-generating" style="display:none;text-align:center;padding:60px 20px;">
    <div style="font-size:40px;margin-bottom:16px;">✨</div>
    <h3 style="margin-bottom:8px;">AI is generating your personalized test...</h3>
    <p style="color:var(--muted);font-size:13px;margin-bottom:24px;">Analyzing your notes and watched videos</p>
    <div class="ai-spinner" style="width:28px;height:28px;border-width:3px;"></div>
  </div>

  <div class="test-ui" id="test-ui">
    <div class="test-hdr">
      <div>
        <div style="font-size:10px;color:var(--muted);font-family:'Space Mono',monospace;" id="t-mode-lbl">MINI TEST</div>
        <div style="font-size:15px;font-weight:700;">JEE Trend-Weighted Quiz</div>
      </div>
      <div class="timer" id="ttimer">20:00</div>
      <button class="btn-sec" onclick="endTest()">End &amp; Submit</button>
    </div>
    <div id="ai-gen-indicator" class="ai-gen-badge" style="display:none;">✨ AI-Generated from your study material</div>
    <div id="q-container"></div>
    <div class="test-nav">
      <button class="btn-sec" onclick="prevQ()">9 Prev</button>
      <div class="q-prog" id="q-prog">Q 1/10</div>
      <button class="btn-sec" onclick="nextQ()">Next :</button>
    </div>
  </div>

  <!-- Results Panel -->
  <div id="results-panel" style="display:none;">

    <!-- JEE PREDICTION CARD -->
    <div class="jee-prediction-card" id="jee-pred-card">
      <div class="jee-pred-header">
        <div>
          <div class="jee-pred-title">🔮 PREDICTED JEE MAINS SCORE</div>
          <div class="jee-pred-score-big" id="pred-jee-score">—</div>
          <div class="jee-pred-outof">out of 300 marks</div>
          <div style="margin-top:10px;font-size:12px;color:var(--muted);font-family:'Space Mono',monospace;" id="pred-jee-band">Calculating...</div>
        </div>
        <div class="jee-pred-right">
          <div style="font-size:9px;font-family:'Space Mono',monospace;color:var(--muted);margin-bottom:8px;">JEE CREDIT SCORE</div>
          <div class="credit-badge-large" id="credit-badge-large">
            <div class="cbl-score" id="cbl-score">—</div>
            <div class="cbl-label">/ 1000</div>
            <div class="cbl-grade" id="cbl-grade">—</div>
          </div>
        </div>
      </div>

      <!-- Subject breakdown prediction -->
      <div class="pred-breakdown-grid">
        <div class="pred-subj-card">
          <div class="pred-subj-name" style="color:var(--physics)">PHYSICS</div>
          <div class="pred-subj-score" style="color:var(--physics)" id="pred-phy">—</div>
          <div class="pred-subj-max">/ 100 marks</div>
          <div class="pred-subj-bar"><div class="pred-subj-bar-fill" id="pred-phy-bar" style="background:var(--physics);width:0%"></div></div>
        </div>
        <div class="pred-subj-card">
          <div class="pred-subj-name" style="color:var(--chemistry)">CHEMISTRY</div>
          <div class="pred-subj-score" style="color:var(--chemistry)" id="pred-chem">—</div>
          <div class="pred-subj-max">/ 100 marks</div>
          <div class="pred-subj-bar"><div class="pred-subj-bar-fill" id="pred-chem-bar" style="background:var(--chemistry);width:0%"></div></div>
        </div>
        <div class="pred-subj-card">
          <div class="pred-subj-name" style="color:var(--math)">MATHEMATICS</div>
          <div class="pred-subj-score" style="color:var(--math)" id="pred-math">—</div>
          <div class="pred-subj-max">/ 100 marks</div>
          <div class="pred-subj-bar"><div class="pred-subj-bar-fill" id="pred-math-bar" style="background:var(--math);width:0%"></div></div>
        </div>
      </div>

      <!-- Effort required -->
      <div class="effort-section">
        <div class="effort-title">🎯 WHAT YOU NEED TO IMPROVE</div>
        <div class="effort-rows" id="res-effort-rows"></div>
      </div>
    </div>

    <!-- Standard score summary -->
    <div class="results-panel">
      <div class="score-label" style="margin-bottom:8px;">MOCK TEST SCORE</div>
      <div class="score-big" id="res-score" style="color:var(--accent3)">8/10</div>
      <div class="score-label" id="res-pct">80% · Great job!</div>
      <div class="results-breakdown">
        <div class="rb-item"><div class="rv" id="res-correct" style="color:var(--accent3)">8</div><div class="rl">CORRECT</div></div>
        <div class="rb-item"><div class="rv" id="res-wrong" style="color:#ff5252">2</div><div class="rl">WRONG</div></div>
        <div class="rb-item"><div class="rv" id="res-skip">0</div><div class="rl">SKIPPED</div></div>
      </div>
    </div>

    <div id="res-review" style="margin-bottom:20px;"></div>
    <button class="start-btn" onclick="resetTest()">Take Another Test 🔄</button>
    &nbsp;&nbsp;
    <button class="btn-sec" onclick="nav('creditscore', document.querySelector('[onclick*=\\'creditscore\\']'))" style="padding:14px 28px;font-size:14px;">View Full Credit Report ⭐</button>
  </div>
</div>
`;
  while(t.firstChild)c.appendChild(t.firstChild);
})();
