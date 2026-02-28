(function(){
  var c=document.getElementById('main-content');
  if(!c)return;
  var t=document.createElement('div');
  t.innerHTML=`<!-- CREDIT SCORE PAGE -->
<div id="page-creditscore" class="page">
  <div class="ph"><h1>⭐ Credit Score</h1><p>// your JEE readiness score · based on mock test performance</p></div>

  <!-- No tests yet state -->
  <div id="cs-empty" style="display:none;text-align:center;padding:60px 20px;">
    <div style="font-size:52px;margin-bottom:16px;">=</div>
    <h3 style="font-size:18px;margin-bottom:8px;">No Credit Score Yet</h3>
    <p style="color:var(--muted);font-size:13px;margin-bottom:24px;">Take a mock test to generate your JEE Credit Score and get a predicted exam score.</p>
    <button class="start-btn" onclick="nav('mocktest', document.querySelector('[onclick*=\\'mocktest\\']'))">Take a Mock Test ▶</button>
  </div>

  <!-- Score dashboard -->
  <div id="cs-dashboard">
    <div class="cs-hero">
      <div class="cs-gauge-wrap">
        <div class="cs-gauge-title">YOUR JEE CREDIT SCORE</div>
        <div class="cs-score-display" id="cs-score-display" style="color:var(--accent)">—</div>
        <div class="cs-score-label">out of 1000</div>
        <div class="cs-grade-pill" id="cs-grade-pill">—</div>
        <canvas id="cs-gauge-canvas" width="200" height="120" style="display:block;margin:0 auto 12px;"></canvas>
        <div class="cs-bar-track"><div class="cs-bar-fill" id="cs-bar-fill" style="width:0%;background:var(--accent)"></div></div>
        <div class="cs-bar-labels"><span>0</span><span>500</span><span>1000</span></div>
        <div style="margin-top:16px;font-size:11px;font-family:'Space Mono',monospace;color:var(--muted);line-height:1.8;">
          Based on your last <span id="cs-tests-count">0</span> mock tests.<br>
          Score improves with consistent practice.
        </div>
      </div>

      <div>
        <div class="cs-stats-grid" style="margin-bottom:14px;">
          <div class="cs-stat">
            <div class="cs-stat-label">PREDICTED JEE SCORE</div>
            <div class="cs-stat-val" id="cs-pred-score" style="color:var(--accent4)">—</div>
            <div class="cs-stat-sub">out of 300 marks</div>
          </div>
          <div class="cs-stat">
            <div class="cs-stat-label">BEST MOCK SCORE</div>
            <div class="cs-stat-val" id="cs-best" style="color:var(--accent3)">—</div>
            <div class="cs-stat-sub">highest percentage</div>
          </div>
          <div class="cs-stat">
            <div class="cs-stat-label">AVG ACCURACY</div>
            <div class="cs-stat-val" id="cs-avg-acc" style="color:var(--accent)">—</div>
            <div class="cs-stat-sub">across all attempts</div>
          </div>
          <div class="cs-stat">
            <div class="cs-stat-label">MOCK TESTS TAKEN</div>
            <div class="cs-stat-val" id="cs-total-tests" style="color:var(--accent2)">0</div>
            <div class="cs-stat-sub">total attempts</div>
          </div>
        </div>

        <!-- Effort required section -->
        <div class="effort-section" id="cs-effort-section">
          <div class="effort-title">🎯 WHAT YOU NEED TO DO</div>
          <div class="effort-rows" id="cs-effort-rows">
            <div class="effort-row" style="border-color:var(--muted)">
              <span class="eicon">📋</span>
              <span class="etext" style="color:var(--muted)">Complete a mock test to get personalised recommendations.</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Score History -->
    <div class="cs-history">
      <h3>📊 Credit Score History</h3>
      <div id="cs-hist-list">
        <div style="color:var(--muted);font-size:12px;font-family:'Space Mono',monospace;">No history yet. Take mock tests to build your score trajectory.</div>
      </div>
    </div>

    <!-- Tips -->
    <div class="cs-tips">
      <h3>💡 How to Improve Your Credit Score</h3>
      <div class="cs-tip-item" style="background:rgba(0,229,255,0.05);">
        <span class="cs-tip-icon">⏰</span>
        <div><strong>Consistency matters</strong> — Taking mocks regularly builds your score over time. Aim for at least 3 mocks per week.</div>
      </div>
      <div class="cs-tip-item" style="background:rgba(127,255,106,0.05);">
        <span class="cs-tip-icon">📖</span>
        <div><strong>Review wrong answers</strong> — Study the explanation for every wrong answer before your next attempt.</div>
      </div>
      <div class="cs-tip-item" style="background:rgba(255,107,53,0.05);">
        <span class="cs-tip-icon">🦾</span>
        <div><strong>Improve attempt rate</strong> — Unattempted questions cost you marks. Practice educated guessing on MCQs.</div>
      </div>
      <div class="cs-tip-item" style="background:rgba(199,125,255,0.05);">
        <span class="cs-tip-icon">📖</span>
        <div><strong>Balance subjects</strong> — Equal preparation in Physics, Chemistry, and Mathematics gives you the most stable score.</div>
      </div>
    </div>
  </div>
</div>
`;
  while(t.firstChild)c.appendChild(t.firstChild);
})();
