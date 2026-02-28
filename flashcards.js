(function(){
  var c=document.getElementById('main-content');
  if(!c)return;
  var t=document.createElement('div');
  t.innerHTML=`<!-- FLASHCARDS PAGE -->
<div id="page-flashcards" class="page">
  <div class="ph"><h1>🃏 Flashcards</h1><p>// spaced repetition for formulas &amp; concepts</p></div>
  <div class="fc-controls">
    <select class="deck-sel" onchange="loadDeck(this.value)" id="deck-sel">
      <option value="all">All Topics</option>
      <option value="physics">Physics — Mechanics · Waves</option>
      <option value="chemistry">Chemistry — Organic · Inorganic</option>
      <option value="mathematics">Mathematics — Calculus · Algebra</option>
    </select>
    <button class="btn-sec" onclick="shuffleDeck()">🔀 Shuffle</button>
    <span id="deck-inf" style="font-family:'Space Mono',monospace;font-size:11px;color:var(--muted);margin-left:auto;"></span>
  </div>
  <div class="fc-area">
    <div class="card-ctr" id="card-ctr">Card 1 of —</div>
    <div class="prog-wrap"><div class="prog-bg"><div class="prog-fill" id="prog-fill" style="width:0%"></div></div></div>
    <div class="fc-wrap" onclick="flipCard()">
      <div class="fc" id="fc-el">
        <div class="fc-face">
          <span class="subj-badge physics" id="fc-subj">PHYSICS</span>
          <div class="fc-q" id="fc-q">Select a deck and tap to start! 👆</div>
          <div class="fc-hint" id="fc-hint">Tap card to reveal answer</div>
        </div>
        <div class="fc-face fc-back">
          <span class="subj-badge physics" id="fc-subj-b">PHYSICS</span>
          <div class="fc-ans" id="fc-ans">Answer</div>
          <div class="fc-formula" id="fc-formula" style="display:none"></div>
        </div>
      </div>
    </div>
    <div class="fc-actions">
      <button class="fc-btn hard" onclick="rateCard('hard')">=0 Hard</button>
      <button class="fc-btn med" onclick="rateCard('med')">>— Medium</button>
      <button class="fc-btn easy" onclick="rateCard('easy')">✅ Easy</button>
    </div>
  </div>
</div>
`;
  while(t.firstChild)c.appendChild(t.firstChild);
})();
