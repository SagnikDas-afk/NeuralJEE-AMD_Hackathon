(function(){
  var c=document.getElementById('main-content');
  if(!c)return;
  var t=document.createElement('div');
  t.innerHTML=`<!-- CALENDAR PAGE -->
<div id="page-calendar" class="page">
  <div class="ph">
    <h1>📅 Calendar</h1>
    <p>// JEE exam dates · Indian holidays · Google Calendar sync</p>
  </div>


  <!-- Calendar card -->
  <div class="calendar-wrap">
    <div class="cal-header">
      <button class="cal-nav" onclick="calNav(-1)">&#8249; Prev</button>
      <h3 id="cal-title" style="font-weight:700;font-size:17px;"></h3>
      <div style="display:flex;gap:8px;align-items:center;">
        <button id="gcal-refresh-btn" onclick="syncGoogleCalendar()" style="display:none;padding:6px 14px;background:rgba(66,133,244,.12);border:1px solid rgba(66,133,244,.35);border-radius:20px;color:#4285f4;font-size:11px;cursor:pointer;font-family:'Syne',sans-serif;font-weight:600;">&#8635; Sync</button>
        <button class="cal-nav" onclick="calNav(1)">Next &#8250;</button>
      </div>
    </div>
    <div class="cal-grid" id="cal-hdr"></div>
    <div class="cal-grid" id="cal-grid"></div>
  </div>

  <!-- Legend -->
  <div style="display:flex;gap:18px;margin-top:16px;flex-wrap:wrap;align-items:center;">
    <span style="font-size:10px;color:var(--muted);font-family:'Space Mono',monospace;letter-spacing:1px;">LEGEND</span>
    <span style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);">
      <span style="width:10px;height:10px;border-radius:3px;background:rgba(0,229,255,.35);display:inline-block;"></span>JEE Exams
    </span>
    <span style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);">
      <span style="width:10px;height:10px;border-radius:3px;background:rgba(199,125,255,.35);display:inline-block;"></span>Festivals
    </span>
    <span style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);">
      <span style="width:10px;height:10px;border-radius:3px;background:rgba(66,133,244,.35);display:inline-block;"></span>Google Calendar
    </span>
    <span style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);">
      <span style="width:10px;height:10px;border-radius:3px;background:rgba(127,255,106,.35);display:inline-block;"></span>Study Session
    </span>
  </div>

  <!-- GCal Status -->
  <div id="gcal-status" style="display:none;margin-top:12px;padding:8px 14px;border-radius:8px;font-size:12px;font-family:'Space Mono',monospace;border:1px solid;transition:all .3s;"></div>

  <!-- Upcoming events -->
  <div style="margin-top:22px;">
    <div style="font-size:10px;font-family:'Space Mono',monospace;color:var(--muted);letter-spacing:1.5px;margin-bottom:12px;">UPCOMING EVENTS</div>
    <div id="upcoming-events" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
  </div>

  <!-- Add your own Google Calendar (optional) -->
  <details style="margin-top:24px;">
    <summary style="cursor:pointer;font-size:12px;color:var(--muted);font-family:'Space Mono',monospace;list-style:none;display:flex;align-items:center;gap:8px;outline:none;">
      <span style="font-size:14px;">🔗</span> Sync your personal Google Calendar (optional)
    </summary>
    <div style="margin-top:14px;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px 20px;">
      <div style="font-size:13px;font-weight:700;margin-bottom:6px;">Add Your Google Calendar</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:14px;line-height:1.6;">
        Indian national holidays are already synced automatically. To add <strong style="color:var(--text);">your personal events</strong>:<br>
        1. Open <a href="https://calendar.google.com" target="_blank" style="color:var(--accent);">Google Calendar</a> → Settings → select your calendar → <strong>Share with specific people</strong> → make it public<br>
        2. Paste your Gmail address below and click Save
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        <input
          id="gcal-user-calid"
          type="text"
          placeholder="yourname@gmail.com"
          style="flex:1;min-width:220px;padding:10px 14px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;font-family:'Syne',sans-serif;outline:none;"
          onfocus="this.style.borderColor='#4285f4'" onblur="this.style.borderColor='var(--border)'"
        />
        <button onclick="connectGCal()" style="padding:10px 20px;background:#4285f4;border:none;border-radius:8px;color:#fff;font-weight:700;font-size:13px;cursor:pointer;font-family:'Syne',sans-serif;white-space:nowrap;">
          💾 Save &amp; Sync
        </button>
      </div>
    </div>
  </details>
</div>
`;
  while(t.firstChild)c.appendChild(t.firstChild);
})();
