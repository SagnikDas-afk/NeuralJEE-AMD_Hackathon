(function(){
  var c=document.getElementById('main-content');
  if(!c)return;
  var t=document.createElement('div');
  t.innerHTML=`<!-- TRENDS PAGE -->
<div id="page-trends" class="page">
  <div class="ph"><h1>📈 JEE Trend Analysis</h1><p>// topic-wise weightage · year-by-year trends · prediction dashboard</p></div>
  <div class="trend-embed">
    <iframe id="trend-ifr" style="width:100%;min-height:800px;border:none;display:block;" src="trends2.html"></iframe>
  </div>
</div>
`;
  while(t.firstChild)c.appendChild(t.firstChild);
})();
