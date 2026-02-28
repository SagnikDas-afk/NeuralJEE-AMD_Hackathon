(function(){
  var c=document.getElementById('main-content');
  if(!c)return;
  var t=document.createElement('div');
  t.innerHTML=`<!-- NOTES PAGE -->
<div id="page-notes" class="page">
  <div class="ph"><h1>📝 My Notes</h1><p>// write notes, upload PDFs/text · AI extracts JEE key points &amp; generates mock questions</p></div>
  <div class="notes-layout">
    <div class="notes-list">
      <div class="notes-toolbar">
        <input type="text" placeholder="🔍 Search notes..." oninput="searchNotes(this.value)"/>
        <button class="btn-primary" onclick="newNote()" style="padding:9px 14px;font-size:12px;">+ New Note</button>
      </div>
      <div id="notes-items" style="flex:1;overflow-y:auto;"></div>
    </div>
    <div class="note-editor" id="note-ed">
      <div class="note-toolbar">
        <button class="tbtn hl" onclick="hlSelected()">🖊️ Highlight</button>
        <button class="tbtn ai" onclick="aiExtract()">✨ AI Key Points</button>
        <button class="tbtn ai" onclick="aiMockFromNote()" style="background:rgba(199,125,255,.08);color:var(--accent4);border-color:rgba(199,125,255,.3);">🎲 Gen Mock</button>
        <button class="tbtn" onclick="markKP()">📌 Key Point</button>
        <span id="note-saved-badge" style="font-size:10px;font-family:'Space Mono',monospace;color:#00f5d4;opacity:0;transition:opacity .4s;padding:0 6px;align-self:center;white-space:nowrap;">✓ saved</span>
        <div style="display:flex;gap:4px;margin-left:auto;">
          <button class="tbtn" onclick="setTag('physics')" style="color:var(--physics)">Phy</button>
          <button class="tbtn" onclick="setTag('chemistry')" style="color:var(--chemistry)">Chem</button>
          <button class="tbtn" onclick="setTag('math')" style="color:var(--math)">Math</button>
          <button class="tbtn ai" onclick="saveNote()">💾 Save</button>
        </div>
      </div>
      <input class="note-title-inp" id="n-title" type="text" placeholder="Note Title..."/>
      <!-- Upload zone -->
      <div class="upload-zone" id="upload-zone" onclick="document.getElementById('file-upload').click()" ondragover="event.preventDefault()" ondrop="handleDrop(event)">
        <div class="uico">📎</div>
        <p>Drop a .txt, .pdf, .jpg or .png file here, or click to upload<br><span style="font-size:10px;opacity:.6;">AI will extract key JEE points automatically</span></p>
        <input type="file" id="file-upload" accept=".txt,.pdf,.jpg,.jpeg,.png" style="display:none" onchange="handleFileUpload(event)"/>
      </div>
      <textarea class="note-content" id="n-content" placeholder="Paste your notes here from any website or textbook...&#10;&#10;Select text and click 🖊️ Highlight to mark important parts.&#10;Click >✨ AI Key Points to auto-extract JEE-relevant concepts!&#10;Click 🎲 Gen Mock to generate mock questions from this note!"></textarea>
      <div class="note-ai-panel" id="note-ai-panel" style="display:none">
        <h4>>✨ AI KEY POINTS</h4>
        <div class="ai-highlights" id="ai-highlights"></div>
      </div>
    </div>
  </div>
</div>
`;
  while(t.firstChild)c.appendChild(t.firstChild);
})();
