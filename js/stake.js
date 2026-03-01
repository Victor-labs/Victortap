/* ===================================================
   VICTOR COIN — Stake System
   Forex-style trading · Very hard to win
   Results in up to 4 hours
=================================================== */

/* -- FOREX CHART DATA (fake but realistic) -- */
var _stakeChart = null;
var _chartData  = [];
var _chartTimer = null;
var _stakeWarned = false; // show warning once per session

function initStake() {
  if (!G.stake) G.stake = {
    history: [],    // [{type,currency,amount,direction,result,pct,ts,resolved,won}]
    wins: 0,
    losses: 0,
    totalStaked: 0
  };
  if (!G.stake.history)  G.stake.history  = [];
  if (!G.stake.wins)     G.stake.wins     = 0;
  if (!G.stake.losses)   G.stake.losses   = 0;
  if (!G.stake.totalStaked) G.stake.totalStaked = 0;
  checkPendingStakes();
}

/* -- RENDER STAKE PAGE -- */
function renderStake() {
  var el = document.getElementById('pg-stake');
  if (!el) return;
  initStake();

  if (!_stakeWarned) {
    showStakeWarning();
    return;
  }
  buildStakePage(el);
}

/* -- WARNING MODAL -- */
function showStakeWarning() {
  var ov = document.createElement('div');
  ov.id  = 'stakeWarnOv';
  ov.style.cssText = 'position:fixed;inset:0;z-index:700;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.9);backdrop-filter:blur(16px);';
  ov.innerHTML = '<div class="stake-warn-card">'
    + '<img src="https://i.imgur.com/zmO1849.jpeg" class="stake-warn-img"/>'
    + '<div class="stake-warn-quote">Many will deposit,<br/>but few will withdraw.</div>'
    + '<div class="stake-warn-sub">Staking involves real risk of losing your VK coins and Diamonds.<br/>Past results do not guarantee future gains.</div>'
    + '<button class="stake-warn-ok" onclick="dismissStakeWarning()">Okay, I understand</button>'
    + '</div>';
  document.body.appendChild(ov);

  // Slow fade-in with delay
  ov.style.opacity = '0';
  ov.style.transition = 'opacity 1.2s ease';
  setTimeout(function() { ov.style.opacity = '1'; }, 200);
}

function dismissStakeWarning() {
  _stakeWarned = true;
  var ov = document.getElementById('stakeWarnOv');
  if (ov) { ov.style.opacity = '0'; setTimeout(function(){ ov.remove(); }, 500); }
  var el = document.getElementById('pg-stake');
  if (el) buildStakePage(el);
}

/* -- BUILD STAKE PAGE -- */
function buildStakePage(el) {
  generateChartData();
  el.innerHTML = ''
    + '<div class="stake-wrap">'
    // Header
    + '<div class="stake-hdr">'
    + '<div class="stake-hdr-title">📈 Victor Stake</div>'
    + '<div class="stake-hdr-stats">'
    + '<span style="color:var(--green);">W: '+G.stake.wins+'</span>'
    + ' &nbsp; <span style="color:var(--red);">L: '+G.stake.losses+'</span>'
    + '</div></div>'

    // Forex chart
    + '<div class="stake-chart-wrap">'
    + '<div class="stake-pair">VK/USD &nbsp;<span id="stakePrice" class="stake-price">1.0842</span></div>'
    + '<canvas id="stakeCanvas" class="stake-canvas"></canvas>'
    + '<div class="stake-chart-labels" id="stakeLabels"></div>'
    + '</div>'

    // Stake form
    + '<div class="stake-form">'
    + '<div class="stake-form-title">Place Your Stake</div>'
    // Currency selector
    + '<div class="stake-cur-row">'
    + '<button class="stake-cur '+ (_stakeCur==='vk'?'stake-cur-on':'') +'" id="scur-vk"      onclick="setStakeCur(\'vk\')">🪙 VK Coins</button>'
    + '<button class="stake-cur '+ (_stakeCur==='diamonds'?'stake-cur-on':'') +'" id="scur-diamonds" onclick="setStakeCur(\'diamonds\')">💎 Diamonds</button>'
    + '</div>'
    // Amount
    + '<div class="stake-amt-wrap">'
    + '<label class="stake-lbl">Amount <span style="color:var(--text3);font-size:0.6rem;">(min 2,000 VK)</span></label>'
    + '<input class="stake-inp" id="stakeAmt" type="number" placeholder="e.g. 5000" min="2000"/>'
    + '<div class="stake-bal">Balance: <span class="tg">'+fm(G.vk)+'</span> VK · <span class="td">'+G.dia+'</span> 💎</div>'
    + '</div>'
    // Direction buttons
    + '<div class="stake-dir-row">'
    + '<button class="stake-dir-btn stake-buy" onclick="placeStake(\'buy\')">'
    + '<div style="font-size:1.1rem;">📈</div><div class="stake-dir-lbl">BUY</div><div class="stake-dir-sub">Price goes UP</div>'
    + '</button>'
    + '<button class="stake-dir-btn stake-sell" onclick="placeStake(\'sell\')">'
    + '<div style="font-size:1.1rem;">📉</div><div class="stake-dir-lbl">SELL</div><div class="stake-dir-sub">Price goes DOWN</div>'
    + '</button>'
    + '</div>'
    + '<div class="stake-risk-note">⚠️ Results arrive in 1–4 hours. Win multiplier: 1.6× · Loss: forfeit amount</div>'
    + '</div>'

    // Active stakes
    + buildActiveStakes()

    // History
    + buildStakeHistory()
    + '</div>';

  setTimeout(drawForexChart, 100);
  startChartTick();
}

var _stakeCur = 'vk';
function setStakeCur(cur) {
  _stakeCur = cur;
  ['vk','diamonds'].forEach(function(c) {
    var b = document.getElementById('scur-'+c);
    if (b) b.classList.toggle('stake-cur-on', c===cur);
  });
}

/* -- PLACE STAKE -- */
function placeStake(direction) {
  initStake();
  var amt = parseInt((document.getElementById('stakeAmt')||{}).value||0);
  if (!amt || amt < 2000) { toast('Minimum stake is 2,000 VK', '#FF453A'); return; }

  if (_stakeCur === 'vk' && G.vk < amt)       { toast('Not enough VK', '#FF453A'); return; }
  if (_stakeCur === 'diamonds' && G.dia < amt) { toast('Not enough 💎', '#FF453A'); return; }

  // Deduct immediately
  if (_stakeCur === 'vk')       G.vk  -= amt;
  if (_stakeCur === 'diamonds') G.dia -= amt;
  G.stake.totalStaked += amt;
  sv(); renderAll();

  // Result time: 1–4 hours, HEAVILY weighted toward loss
  var waitMs  = (60 + Math.floor(Math.random() * 180)) * 60 * 1000; // 1–4hr
  var resolveAt = Date.now() + waitMs;

  // Win chance: only 18% — very hard
  var won = Math.random() < 0.18;
  var pct = won
    ? (0.6 + Math.random() * 1.0)   // win: +60% to +160%
    : (0.3 + Math.random() * 0.5);  // lose: show "result% swing"

  var stake = {
    id: 'sk_' + Date.now(),
    currency: _stakeCur,
    amount: amt,
    direction: direction,
    won: won,
    pct: Math.round(pct * 100),
    result: won ? Math.floor(amt * (1 + pct)) : 0,
    resolveAt: resolveAt,
    resolved: false,
    ts: Date.now()
  };

  G.stake.history.unshift(stake);
  sv();

  toast('📊 Stake placed! Result in ' + Math.ceil(waitMs/3600000) + 'h', '#5AC8FA');

  // Schedule resolve
  setTimeout(function() { resolveStake(stake.id); }, waitMs);

  renderStake();
}

/* -- RESOLVE STAKE -- */
function resolveStake(stakeId) {
  initStake();
  var stake = G.stake.history.find(function(s){ return s.id === stakeId; });
  if (!stake || stake.resolved) return;
  stake.resolved = true;

  if (stake.won) {
    G.stake.wins++;
    if (stake.currency === 'vk')       G.vk  += stake.result;
    if (stake.currency === 'diamonds') G.dia += stake.result;
    sv(); renderAll();
    showStakeNotif(true, stake);
    toast('📈 Stake WON! +' + fm(stake.result) + ' ' + (stake.currency==='vk'?'VK':'💎'), '#30D158');
  } else {
    G.stake.losses++;
    sv();
    showStakeNotif(false, stake);
    toast('📉 Stake LOST. Better luck next time.', '#FF453A');
  }
  checkAch();
  if (_stakeWarned) { var el=document.getElementById('pg-stake'); if(el&&el.classList.contains('on')) buildStakePage(el); }
}

function showStakeNotif(won, stake) {
  var ov = document.createElement('div');
  ov.className = 'mov';
  ov.innerHTML = '<div class="mb" style="border-color:' + (won?'rgba(48,209,88,0.5)':'rgba(255,69,58,0.4)') + ';">'
    + '<div style="font-size:3rem;margin-bottom:8px;">' + (won?'📈':'📉') + '</div>'
    + '<div class="mttl" style="color:' + (won?'var(--green)':'var(--red)') + ';">'
    + (won ? 'Stake Won! 🎉' : 'Stake Lost') + '</div>'
    + '<div class="mbdy">'
    + (won
      ? 'Your <strong>' + fm(stake.amount) + ' ' + (stake.currency==='vk'?'VK':'💎') + '</strong> stake returned <strong style="color:var(--gold);">' + fm(stake.result) + ' ' + (stake.currency==='vk'?'VK':'💎') + '</strong>!'
      : 'Your <strong>' + fm(stake.amount) + ' ' + (stake.currency==='vk'?'VK':'💎') + '</strong> stake did not come back. The market moved against you.')
    + '</div>'
    + '<div class="mbts"><button class="mok" onclick="this.closest(\'.mov\').remove()">' + (won?'Collect!':'Okay') + '</button></div>'
    + '</div>';
  document.body.appendChild(ov);
}

/* -- CHECK PENDING ON LOAD -- */
function checkPendingStakes() {
  if (!G.stake || !G.stake.history) return;
  G.stake.history.forEach(function(stake) {
    if (!stake.resolved && Date.now() >= stake.resolveAt) {
      resolveStake(stake.id);
    } else if (!stake.resolved) {
      var rem = stake.resolveAt - Date.now();
      setTimeout(function() { resolveStake(stake.id); }, rem);
    }
  });
}

/* -- ACTIVE STAKES -- */
function buildActiveStakes() {
  initStake();
  var active = G.stake.history.filter(function(s){ return !s.resolved; });
  if (!active.length) return '';
  return '<div class="stake-section-title">⏳ Active Stakes</div>'
    + '<div class="stake-active-list">'
    + active.map(function(s) {
      var rem = Math.max(0, s.resolveAt - Date.now());
      return '<div class="stake-active-row">'
        + '<div class="stake-active-dir ' + (s.direction==='buy'?'sad-buy':'sad-sell') + '">'
        + (s.direction==='buy'?'📈 BUY':'📉 SELL')+'</div>'
        + '<div class="stake-active-info">'
        + '<div>' + fm(s.amount) + ' ' + (s.currency==='vk'?'VK':'💎') + '</div>'
        + '<div style="font-size:0.62rem;color:var(--text3);">Result in ' + fmT(Math.ceil(rem/1000)) + '</div>'
        + '</div>'
        + '</div>';
    }).join('')
    + '</div>';
}

/* -- HISTORY -- */
function buildStakeHistory() {
  initStake();
  var resolved = G.stake.history.filter(function(s){ return s.resolved; }).slice(0,20);
  if (!resolved.length) return '<div style="text-align:center;padding:20px;font-size:0.68rem;color:var(--text3);">No completed stakes yet</div>';
  return '<div class="stake-section-title">📋 History</div>'
    + '<div class="stake-history">'
    + resolved.map(function(s) {
      return '<div class="sh-row '+(s.won?'sh-won':'sh-lost')+'">'
        + '<div class="sh-icon">'+(s.won?'✅':'❌')+'</div>'
        + '<div class="sh-info">'
        + '<div style="font-size:0.72rem;font-weight:600;">'+(s.direction==='buy'?'📈 BUY':'📉 SELL')+' · '+fm(s.amount)+' '+(s.currency==='vk'?'VK':'💎')+'</div>'
        + '<div style="font-size:0.6rem;color:var(--text3);">'+new Date(s.ts).toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+'</div>'
        + '</div>'
        + '<div class="sh-result" style="color:'+(s.won?'var(--green)':'var(--red)')+'">'
        + (s.won?'+'+fm(s.result):'-'+fm(s.amount))
        + '<div style="font-size:0.55rem;">'+(s.currency==='vk'?'VK':'💎')+'</div>'
        + '</div>'
        + '</div>';
    }).join('')
    + '</div>';
}

/* -- FAKE FOREX CHART -- */
function generateChartData() {
  _chartData = [];
  var price = 1.0800 + Math.random() * 0.02;
  for (var i = 0; i < 80; i++) {
    var change = (Math.random() - 0.5) * 0.003;
    price = Math.max(1.05, Math.min(1.15, price + change));
    _chartData.push(parseFloat(price.toFixed(4)));
  }
}

function drawForexChart() {
  var cv = document.getElementById('stakeCanvas');
  if (!cv) return;
  var cx = cv.getContext('2d');
  var W  = cv.width  = cv.offsetWidth  || 340;
  var H  = cv.height = cv.offsetHeight || 120;
  var data = _chartData;
  if (!data.length) return;
  var mn = Math.min.apply(null,data) - 0.001;
  var mx = Math.max.apply(null,data) + 0.001;
  var rng = mx - mn || 0.01;
  cx.clearRect(0,0,W,H);

  // Grid lines
  cx.strokeStyle='rgba(255,255,255,0.05)';cx.lineWidth=1;
  for(var g=0;g<4;g++){var gy=H*(g/3);cx.beginPath();cx.moveTo(0,gy);cx.lineTo(W,gy);cx.stroke();}

  // Candlestick-style bars
  var barW = (W / data.length) * 0.6;
  for(var i=1;i<data.length;i++){
    var x   = (i/data.length)*W;
    var y1  = H - ((data[i-1]-mn)/rng)*H;
    var y2  = H - ((data[i]-mn)/rng)*H;
    var up  = data[i] >= data[i-1];
    cx.fillStyle = up ? 'rgba(48,209,88,0.7)' : 'rgba(255,69,58,0.7)';
    var bH = Math.max(2, Math.abs(y2-y1));
    cx.fillRect(x - barW/2, Math.min(y1,y2), barW, bH);
  }

  // Price line overlay
  cx.beginPath();cx.strokeStyle='rgba(90,200,250,0.6)';cx.lineWidth=1.5;
  data.forEach(function(v,i){
    var x=((i+1)/data.length)*W;
    var y=H-((v-mn)/rng)*H;
    i===0?cx.moveTo(x,y):cx.lineTo(x,y);
  });
  cx.stroke();

  // Update price display
  var last = data[data.length-1];
  var prev = data[data.length-2];
  var priceEl = document.getElementById('stakePrice');
  if(priceEl){
    priceEl.textContent=last.toFixed(4);
    priceEl.style.color=last>=prev?'var(--green)':'var(--red)';
  }
}

var _chartTickInt = null;
function startChartTick() {
  clearInterval(_chartTickInt);
  _chartTickInt = setInterval(function(){
    if(!document.getElementById('stakeCanvas')){clearInterval(_chartTickInt);return;}
    var last=_chartData[_chartData.length-1]||1.08;
    var change=(Math.random()-0.5)*0.0025;
    var next=parseFloat(Math.max(1.05,Math.min(1.15,last+change)).toFixed(4));
    _chartData.push(next);
    if(_chartData.length>80) _chartData.shift();
    drawForexChart();
  },1800);
}
