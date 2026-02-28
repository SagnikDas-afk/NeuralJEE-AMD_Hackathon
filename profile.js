(function(){
  var c=document.getElementById('main-content');
  if(!c)return;
  var t=document.createElement('div');
  t.innerHTML=`<!-- PROFILE PAGE -->
<div id="page-profile" class="page">
  <div class="ph">
    <h1>👤 My Profile</h1>
    <p>// manage your account details · update personal info</p>
  </div>

  <div class="profile-layout">
    <!-- Avatar & Quick Info Card -->
    <div class="profile-card profile-left">
      <div class="profile-avatar-wrap">
        <div class="profile-avatar-big" id="profile-avatar-display">S</div>
        <div class="profile-avatar-ring"></div>
      </div>
      <div class="profile-name-big" id="profile-name-display">Student</div>
      <div class="profile-email-display" id="profile-email-display">student@email.com</div>
      <div class="profile-level-badge" id="profile-level-badge">BEGINNER</div>

      <div class="profile-quick-stats">
        <div class="pqs-item">
          <div class="pqs-val" id="pqs-streak">0</div>
          <div class="pqs-label">Day Streak 🔥</div>
        </div>
        <div class="pqs-item">
          <div class="pqs-val" id="pqs-tests">0</div>
          <div class="pqs-label">Mock Tests</div>
        </div>
        <div class="pqs-item">
          <div class="pqs-val" id="pqs-notes">0</div>
          <div class="pqs-label">Notes</div>
        </div>
      </div>

      <!-- Change Level -->
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);width:100%;">
        <div style="font-size:10px;font-family:'Space Mono',monospace;color:var(--muted);letter-spacing:1.5px;margin-bottom:10px;">CHANGE LEVEL</div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
          <button class="level-change-btn beginner" onclick="changeLevel('beginner')">🌱 Beginner</button>
          <button class="level-change-btn pro" onclick="changeLevel('pro')">🦾 Pro</button>
          <button class="level-change-btn expert" onclick="changeLevel('expert')">🔥 Expert</button>
        </div>
      </div>
    </div>

    <!-- Edit Form -->
    <div class="profile-card profile-right">
      <div class="profile-section-title">✏️ EDIT PROFILE</div>

      <div class="profile-form">
        <div class="form-group">
          <label>FULL NAME</label>
          <input type="text" id="pf-name" placeholder="Your full name" autocomplete="off"/>
          <div class="field-hint">This is how you'll be greeted in the app</div>
        </div>

        <div class="form-group">
          <label>EMAIL ADDRESS</label>
          <div style="position:relative;">
            <input type="email" id="pf-email" placeholder="you@email.com" autocomplete="off" oninput="validateEmailField(this)"/>
            <span id="email-valid-icon" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:16px;"></span>
          </div>
          <div id="email-error" class="field-error" style="display:none;">Please enter a valid email address</div>
          <div class="field-hint">Used for login — must be a valid format</div>
        </div>

        <div class="form-group">
          <label>TARGET JEE YEAR</label>
          <select id="pf-year">
            <option value="2026">JEE 2026</option>
            <option value="2027">JEE 2027</option>
            <option value="2028">JEE 2028</option>
          </select>
        </div>

        <div class="form-group">
          <label>TARGET COLLEGE</label>
          <input type="text" id="pf-college" placeholder="e.g. IIT Bombay, IIT Delhi..." autocomplete="off"/>
        </div>

        <div class="form-group">
          <label>CITY / LOCATION</label>
          <input type="text" id="pf-city" placeholder="e.g. Mumbai, Delhi, Pune..." autocomplete="off"/>
        </div>

        <div class="form-group">
          <label>COACHING INSTITUTE (optional)</label>
          <input type="text" id="pf-coaching" placeholder="e.g. Allen, Aakash, FIITJEE, Self Study..." autocomplete="off"/>
        </div>

        <div class="form-group">
          <label>DAILY STUDY GOAL (hours)</label>
          <div style="display:flex;gap:10px;align-items:center;">
            <input type="range" id="pf-hours" min="1" max="16" value="6" oninput="document.getElementById('pf-hours-val').textContent=this.value+' hrs'" style="flex:1;accent-color:var(--accent);"/>
            <span id="pf-hours-val" style="font-family:'Space Mono',monospace;font-size:13px;color:var(--accent);min-width:50px;">6 hrs</span>
          </div>
        </div>

        <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap;">
          <button class="btn-primary" onclick="saveProfile()" style="flex:1;min-width:140px;">💾 Save Changes</button>
          <button class="btn-sec" onclick="cancelProfileEdit()" style="padding:14px 20px;">Cancel</button>
        </div>
      </div>

      <!-- Change Password Section -->
      <div style="margin-top:28px;padding-top:22px;border-top:1px solid var(--border);">
        <div class="profile-section-title">🔐 CHANGE PASSWORD</div>
        <div class="profile-form">
          <div class="form-group">
            <label>CURRENT PASSWORD</label>
            <input type="password" id="pf-cur-pass" placeholder=""""""""""/>
          </div>
          <div class="form-group">
            <label>NEW PASSWORD (min 8 chars)</label>
            <input type="password" id="pf-new-pass" placeholder=""""""""""/>
          </div>
          <div class="form-group">
            <label>CONFIRM NEW PASSWORD</label>
            <input type="password" id="pf-confirm-pass" placeholder=""""""""""/>
          </div>
          <button class="btn-sec" onclick="changePassword()" style="padding:12px 24px;">🔐 Update Password</button>
        </div>
      </div>

      <!-- Danger Zone -->
      <div style="margin-top:28px;padding-top:22px;border-top:1px solid rgba(255,82,82,0.2);">
        <div class="profile-section-title" style="color:#ff5252;">⚠️ DANGER ZONE</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:14px;line-height:1.6;">
          Resetting your data will permanently delete all your notes, mock test history, and saved videos. This cannot be undone.
        </div>
        <button onclick="confirmResetData()" style="padding:10px 20px;background:rgba(255,82,82,.08);border:1px solid rgba(255,82,82,.3);border-radius:8px;color:#ff5252;font-size:12px;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;">⚠️ Reset All My Data</button>
      </div>
    </div>
  </div>
</div>
`;
  while(t.firstChild)c.appendChild(t.firstChild);
})();
