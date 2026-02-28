(function(){
  var c=document.getElementById('main-content');
  if(!c)return;
  var t=document.createElement('div');
  t.innerHTML=`<!-- DOUBT SOLVER PAGE -->
<div id="page-doubts" class="page">
  <div class="ph"><h1>✨ Doubt Solver</h1><p>// powered by AI · step-by-step solutions</p></div>
  <div class="doubt-wrap">
    <div class="chat-area">
      <div class="chat-msgs" id="chat-msgs">
        <div class="msg ai">
          <div class="msg-lbl">NEURALJEE AI</div>
          <div class="msg-bubble">Namaste! I'm your JEE AI Doubt Solver. Ask me anything — Physics, Chemistry, or Mathematics. I'll solve problems step-by-step with full explanations. What's giving you trouble?</div>
        </div>
      </div>
      <div class="chat-inp-area">
        <textarea class="chat-inp" id="doubt-inp" rows="2" placeholder="Type your doubt... (Press Enter to send, Shift+Enter for new line)" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendDoubt();}"></textarea>
        <button class="chat-send" onclick="sendDoubt()">Send </button>
      </div>
    </div>
    <div class="quick-panel">
      <h3>⚡ Quick Topics</h3>
      <button class="qtopic" onclick="qt('Explain Newton\\'s Laws with JEE examples')">🍎 Newton's Laws</button>
      <button class="qtopic" onclick="qt('What is integration by parts with formula and example?')">∫ Integration by Parts</button>
      <button class="qtopic" onclick="qt('Explain ionic equilibrium and buffer solutions for JEE')">Ionic Equilibrium</button>
      <button class="qtopic" onclick="qt('Derive electric field of a dipole step by step')">⚡ Electric Dipole</button>
      <button class="qtopic" onclick="qt('List the most important organic reactions for JEE Mains')"> JEE Organic Rxns</button>
      <button class="qtopic" onclick="qt('Explain binomial theorem with JEE-style problems')">📐 Binomial Theorem</button>
      <button class="qtopic" onclick="qt('Solve a JEE thermodynamics problem step by step')">Thermodynamics</button>
      <button class="qtopic" onclick="qt('Which topics have highest weightage in JEE Mains 2025?')">🎯 High Weightage Topics</button>
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);">
        <div style="font-size:9px;color:var(--muted);font-family:'Space Mono',monospace;letter-spacing:1px;margin-bottom:8px;">RANDOM PROBLEM</div>
        <div style="display:flex;gap:5px;">
          <button class="qtopic" style="flex:1;text-align:center;padding:8px;" onclick="qt('Give me a hard JEE Physics numerics problem to solve')">PHY</button>
          <button class="qtopic" style="flex:1;text-align:center;padding:8px;" onclick="qt('Give me a JEE Chemistry problem to solve')">CHE</button>
          <button class="qtopic" style="flex:1;text-align:center;padding:8px;" onclick="qt('Give me a JEE Math problem to solve')">MAT</button>
        </div>
      </div>
    </div>
  </div>
</div>
`;
  while(t.firstChild)c.appendChild(t.firstChild);
})();
