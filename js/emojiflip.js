/* ===================================================
   VICTOR COIN — 🃏 Emoji Flip
   Cards shuffle positions secretly after flip
   Streak + Highscore saved in localStorage
=================================================== */
var _ef = {
  emojis:['🌟','🔥','💎','🎯','🎲','🌈','⚡','🦋','🍀','🎭','🎪','🌊','🦊','🌸','🎵'],
  cards:[], positions:[], target:'', targetIdx:-1,
  revealed:false, locked:false, streak:0, hs:0, round:0
};

function renderEmojiFlip(el) {
  _ef.hs = parseInt(localStorage.getItem('vc_ef_hs')||'0');
  _ef.streak = 0; _ef.round = 0;
  el.innerHTML = '<div class="game-wrap">'
    +gameBackBtn()
    +'<div class="game-title">🃏 Emoji Flip</div>'
    +'<div class="ef-stats-row">'
    +'<span class="ef-stat">Streak: <b id="efStreak">0</b></span>'
    +'<span class="ef-stat">Best: <b id="efHS">'+_ef.hs+'</b></span>'
    +'<span class="ef-stat">Round: <b id="efRound">0</b></span>'
    +'</div>'
    +'<div class="ef-prompt" id="efPrompt">Get ready…</div>'
    +'<div class="ef-cards" id="efCards"></div>'
    +'<div class="ef-feedback" id="efFeedback"></div>'
    +'</div>';
  setTimeout(efNewRound, 400);
}

function efNewRound() {
  _ef.locked = false; _ef.revealed = true; _ef.round++;
  var pool = gameShuffle(_ef.emojis.slice()).slice(0,3);
  _ef.cards = pool;
  _ef.targetIdx = Math.floor(Math.random()*3);
  _ef.target = _ef.cards[_ef.targetIdx];
  _ef.positions = [0,1,2]; // will be shuffled after flip

  var prompt = document.getElementById('efPrompt');
  var round  = document.getElementById('efRound');
  if (prompt) prompt.textContent = 'Remember the cards!';
  if (round)  round.textContent  = _ef.round;

  efRender(true); // show face-up

  // After 1.8s: flip, shuffle positions secretly, then prompt
  setTimeout(function(){
    _ef.revealed = false;
    // SECRETLY shuffle positions — cards move slots without player knowing
    _ef.positions = gameShuffle([0,1,2]);
    efRenderFaceDown();
    setTimeout(function(){
      var p = document.getElementById('efPrompt');
      if (p) p.innerHTML = 'Where is <span class="ef-target">'+_ef.target+'</span>?';
    }, 400);
  }, 1800);
}

function efRender(faceUp) {
  var el = document.getElementById('efCards');
  if (!el) return;
  el.innerHTML = _ef.cards.map(function(emoji,i){
    var cls = 'ef-card'+(faceUp?' ef-face-up':'');
    return '<div class="'+cls+'">'+( faceUp ? emoji : '❓')+'</div>';
  }).join('');
}

function efRenderFaceDown() {
  var el = document.getElementById('efCards');
  if (!el) return;
  // positions[slot] = original card index in that slot
  el.innerHTML = _ef.positions.map(function(origIdx, slot){
    return '<div class="ef-card ef-shuffle-anim" onclick="efPickSlot('+slot+')">❓</div>';
  }).join('');
}

function efPickSlot(slot) {
  if (_ef.locked || _ef.revealed) return;
  _ef.locked = true;
  var origIdx = _ef.positions[slot];
  var right   = (origIdx === _ef.targetIdx);
  var fb      = document.getElementById('efFeedback');
  var cards   = document.getElementById('efCards');

  // Reveal all cards in their shuffled positions
  if (cards) {
    cards.innerHTML = _ef.positions.map(function(oIdx, s){
      var emoji = _ef.cards[oIdx];
      var cls   = 'ef-card ef-face-up';
      if (oIdx === _ef.targetIdx) cls += ' ef-card-correct';
      if (s === slot && !right)   cls += ' ef-card-wrong';
      return '<div class="'+cls+'">'+emoji+'</div>';
    }).join('');
  }

  if (right) {
    _ef.streak++;
    if (_ef.streak > _ef.hs){ _ef.hs = _ef.streak; localStorage.setItem('vc_ef_hs',_ef.hs); }
    var s = document.getElementById('efStreak');
    var h = document.getElementById('efHS');
    if (s) s.textContent = _ef.streak;
    if (h) h.textContent = _ef.hs;
    if (fb) fb.innerHTML = '<span class="ef-correct">✅ Correct!</span>';
    // Achievement hook
    if (_ef.streak >= 20 && typeof checkAch==='function'){ if(!G.gameStreak20){G.gameStreak20=true;sv();checkAch();} }
    setTimeout(function(){ if(fb)fb.innerHTML=''; efNewRound(); }, 900);
  } else {
    _ef.streak = 0;
    var s2 = document.getElementById('efStreak');
    if (s2) s2.textContent = 0;
    if (fb) fb.innerHTML = '<span class="ef-wrong">❌ It was '+_ef.target+'</span>'
      +'<br/><button class="game-retry-btn" onclick="efRestart()">🔄 Try Again</button>';
  }
}

function efRestart(){
  _ef.streak=0; _ef.round=0;
  var fb=document.getElementById('efFeedback');
  if(fb)fb.innerHTML='';
  efNewRound();
}
