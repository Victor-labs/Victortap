/* ===================================================
   VICTOR COIN — Mall System
   Locks 11:00 PM → 7:00 AM daily
=================================================== */

var MALL_ITEMS = [
  {
    id:'minitap', name:'Mini Tap', emoji:'⚡',
    desc:'+10 VK per tap for 5 minutes',
    price:5000, currency:'vk',
    type:'tap', bonus:10, duration:5*60*1000
  },
  {
    id:'supertap', name:'Super Tap', emoji:'🚀',
    desc:'+100 VK per tap for 10 minutes',
    price:50000, currency:'vk',
    type:'tap', bonus:100, duration:10*60*1000
  }
];

/* Track purchased/active mall items */
function initMall() {
  if (!G.mall) G.mall = {
    boughtAll: false,
    activeTaps: {} // {itemId: {startTime, bonus, duration}}
  };
  if (!G.mall.activeTaps) G.mall.activeTaps = {};
  // Check for expired taps on load
  tickMall();
}

function isMallOpen() {
  var now = new Date();
  var h = now.getHours();
  return h >= 7 && h < 23; // Open 7am–11pm
}

function getMallTimeMsg() {
  var now  = new Date();
  var h    = now.getHours();
  var m    = now.getMinutes();
  if (!isMallOpen()) {
    if (h >= 23 || h < 7) {
      var reopenH = 7;
      var diffMins = h >= 23
        ? (24 - h + reopenH) * 60 - m
        : (reopenH - h) * 60 - m;
      var hrs = Math.floor(diffMins / 60);
      var mins = diffMins % 60;
      return 'Mall reopens in ' + hrs + 'h ' + mins + 'm';
    }
  }
  var closeH = 23;
  var diffMins = (closeH - h) * 60 - m;
  return 'Closes in ' + Math.floor(diffMins/60) + 'h ' + (diffMins%60) + 'm';
}

/* -- RENDER MALL -- */
function renderMall() {
  var el = document.getElementById('pg-mall');
  if (!el) return;
  initMall();
  var open = isMallOpen();
  var timeMsg = getMallTimeMsg();

  var h = '<div class="mall-hdr">'
    + '<div class="mall-title-row">'
    + '<div class="mall-title">🛍️ Victor Mall</div>'
    + '<div class="mall-status ' + (open ? 'mall-open' : 'mall-closed') + '">'
    + (open ? '🟢 OPEN' : '🔴 CLOSED') + '</div>'
    + '</div>'
    + '<div class="mall-time">' + timeMsg + '</div>'
    + '</div>';

  if (!open) {
    h += '<div class="mall-lock-screen">'
      + '<div style="font-size:4rem;margin-bottom:16px;">🔒</div>'
      + '<div style="font-size:0.9rem;font-weight:700;color:var(--text);margin-bottom:6px;">Mall is Closed</div>'
      + '<div style="font-size:0.7rem;color:var(--text3);line-height:1.7;">The Victor Mall is closed between<br/>11:00 PM and 7:00 AM.<br/><br/>' + timeMsg + '</div>'
      + '</div>';
    el.innerHTML = h;
    return;
  }

  h += '<div class="mall-section-title">⚡ Tap Boosters</div>'
    + '<div class="mall-grid">';

  MALL_ITEMS.forEach(function(item) {
    var active = G.mall.activeTaps[item.id];
    var canAfford = G.vk >= item.price;
    var timeLeft = '';
    if (active) {
      var rem = Math.max(0, item.duration - (Date.now() - active.startTime));
      timeLeft = rem > 0 ? fmT(Math.ceil(rem / 1000)) : '';
      if (rem <= 0) { delete G.mall.activeTaps[item.id]; active = null; }
    }

    h += '<div class="mall-item ' + (active ? 'mall-item-active' : '') + (!canAfford && !active ? 'mall-item-locked' : '') + '">'
      + '<div class="mall-item-emoji">' + item.emoji + '</div>'
      + '<div class="mall-item-name">' + item.name + '</div>'
      + '<div class="mall-item-desc">' + item.desc + '</div>'
      + (active
        ? '<div class="mall-active-badge">⚡ ACTIVE — ' + timeLeft + '</div>'
        : '<div class="mall-item-price">' + fm(item.price) + ' VK</div>')
      + (!active
        ? '<button class="mall-buy-btn ' + (!canAfford ? 'mall-buy-dis' : '') + '" onclick="buyMallItem(\'' + item.id + '\')">'
          + (canAfford ? '🛒 Buy' : '🔒 Need ' + fm(item.price - G.vk) + ' more') + '</button>'
        : '')
      + '</div>';
  });

  h += '</div>';
  h += '<hr class="mall-divider"/>';
  h += '<div id="mallFontsSection"></div>';
  h += '<hr class="mall-divider"/>';
  h += '<div id="mallParticlesSection"></div>';
  h += '<hr class="mall-divider"/>';
  h += '<div id="mallNameTemplatesSection"></div>';
  h += '<hr class="mall-divider"/>';
  h += '<div id="mallCosmeticsSection"></div>';
  el.innerHTML = h;
  if(typeof renderMallNameTemplates==='function') renderMallNameTemplates();
  if(typeof renderMallFonts==='function') renderMallFonts();
  if(typeof renderMallParticles==='function') renderMallParticles();
  if(typeof renderMallCosmetics==='function') renderMallCosmetics();
}

function buyMallItem(itemId) {
  if (!isMallOpen()) { toast('🔒 Mall is closed!', '#FF453A'); return; }
  initMall();
  var item = MALL_ITEMS.find(function(i) { return i.id === itemId; });
  if (!item) return;
  if (G.vk < item.price) { toast('Need ' + fm(item.price) + ' VK', '#FF453A'); return; }

  G.vk -= item.price;
  if(typeof vaultAdd==='function') vaultAdd(item.id);
  G.mall.activeTaps[item.id] = { startTime: Date.now(), bonus: item.bonus, duration: item.duration };
  sv(); renderAll();
  renderMall();
  toast(item.emoji + ' ' + item.name + ' activated!', '#30D158');
  if(typeof questProgress==='function') questProgress('mallBuys',1);

  // Check "Vic loves malls" achievement — bought all items
  var allBought = MALL_ITEMS.every(function(i) { return G.mall.activeTaps[i.id]; });
  if (allBought) { G.mall.boughtAll = true; sv(); checkAch(); }

  // Auto-expire timer
  setTimeout(function() {
    if (G.mall && G.mall.activeTaps[item.id]) {
      delete G.mall.activeTaps[item.id];
      sv();
      toast(item.emoji + ' ' + item.name + ' expired!', '#FF9F0A');
      renderMall();
    }
  }, item.duration);
}

/* Returns total tap bonus from active mall items */
function getMallTapBonus() {
  if (!G.mall || !G.mall.activeTaps) return 0;
  var bonus = 0;
  MALL_ITEMS.forEach(function(item) {
    var a = G.mall.activeTaps[item.id];
    if (a) {
      var rem = item.duration - (Date.now() - a.startTime);
      if (rem > 0 && item.type === 'tap') bonus += item.bonus;
      else if (rem <= 0 && G.mall.activeTaps[item.id]) delete G.mall.activeTaps[item.id];
    }
  });
  return bonus;
}

function tickMall() {
  if (!G.mall || !G.mall.activeTaps) return;
  MALL_ITEMS.forEach(function(item) {
    var a = G.mall.activeTaps[item.id];
    if (a) {
      var rem = item.duration - (Date.now() - a.startTime);
      if (rem <= 0) delete G.mall.activeTaps[item.id];
    }
  });
}

/* ===================================================
   MALL — Fonts, Particles, Sections
=================================================== */

var MALL_FONTS = [
  {id:'font_gothic',  name:'Gothic',  cssClass:'font-gothic',  price:1000,   emoji:'𝕲',  desc:'Dark medieval letters'},
  {id:'font_ggsans',  name:'GG Sans', cssClass:'font-ggsans',  price:5000,   emoji:'G',  desc:'Clean modern gaming font'},
  {id:'font_sakura',  name:'Sakura',  cssClass:'font-sakura',  price:20000,  emoji:'S',  desc:'Elegant Japanese style'},
  {id:'font_orbiton', name:'Orbiton', cssClass:'font-orbiton', price:20000,  emoji:'O',  desc:'Futuristic sci-fi style'}
];

var MALL_PARTICLES = [
  {id:'ptc_light',         name:'Light Dust',    price:200000,  count:40, shape:'circle', minSize:1, maxSize:3,  colors:['#FFFDE7','#FFF9C4','#ffffff'], desc:'Soft golden light particles', char:'✦'},
  {id:'ptc_neon',          name:'Neon Sparks',   price:400000,  count:50, shape:'circle', minSize:1, maxSize:4,  colors:['#00FF88','#00FFFF','#FF00FF'],  desc:'Electric neon energy',         char:'⚡'},
  {id:'ptc_constellation', name:'Constellation', price:600000,  count:35, shape:'star',   minSize:2, maxSize:5,  colors:['#E3F2FD','#90CAF9','#ffffff'], desc:'Starfield constellation',      char:'⭐'},
  {id:'ptc_bubbles',       name:'Bubbles',       price:200000,  count:30, shape:'emoji',  minSize:6, maxSize:12, colors:['rgba(135,206,235,0.6)'],       desc:'Floating soap bubbles',         char:'🫧'},
  {id:'ptc_snow',          name:'Snowflakes',    price:350000,  count:45, shape:'flake',  minSize:3, maxSize:7,  colors:['#E3F2FD','#ffffff','#BBDEFB'], desc:'Gentle falling snow',           char:'❄️'},
  {id:'ptc_hell',          name:'Hell Flames',   price:1000000, count:60, shape:'circle', minSize:2, maxSize:6,  colors:['#FF1100','#FF4500','#FFD700'], desc:'Infernal fire raining down',   char:'🔥'}
];

/* -- BUY FONT -- */
function buyMallFont(id) {
  if (typeof vaultHas==='function' && vaultHas(id)) { toast('Already owned!','#FF9F0A'); return; }
  var item = MALL_FONTS.find(function(x){ return x.id===id; });
  if (!item) return;
  if (G.vk < item.price) { toast('Need '+fm(item.price)+' VK','#FF453A'); return; }
  G.vk -= item.price;
  if (typeof vaultAdd==='function') vaultAdd(id);
  sv(); renderAll();
  if (typeof checkAch==='function') checkAch();
  renderMallFonts();
  toast('🔤 '+item.name+' added to Vault!','#30D158');
  if (typeof fbSave==='function') fbSave();
}

/* -- BUY PARTICLE -- */
function buyMallParticle(id) {
  if (typeof vaultHas==='function' && vaultHas(id)) { toast('Already owned!','#FF9F0A'); return; }
  var item = MALL_PARTICLES.find(function(x){ return x.id===id; });
  if (!item) return;
  if (G.vk < item.price) { toast('Need '+fm(item.price)+' VK','#FF453A'); return; }
  G.vk -= item.price;
  if (typeof vaultAdd==='function') vaultAdd(id);
  sv(); renderAll();
  if (typeof checkAch==='function') checkAch();
  renderMallParticles();
  toast('✨ '+item.name+' added to Vault!','#30D158');
  if (typeof fbSave==='function') fbSave();
}

/* -- RENDER FONTS SECTION -- */
function renderMallFonts() {
  var el = document.getElementById('mallFontsSection');
  if (!el) return;
  var h = '<div class="mall-section-title">🔤 Fonts &amp; Styles</div>'
    + '<div class="mall-grid">';
  MALL_FONTS.forEach(function(item) {
    var owned  = typeof vaultHas==='function' && vaultHas(item.id);
    var active = typeof vaultActive==='function' && vaultActive('font')===item.id;
    h += '<div class="mall-item '+(owned?'mall-item-active':'')+'">'
      + '<div class="font-preview font-prev-'+item.cssClass+'">'+item.emoji+'</div>'
      + '<div class="mall-item-name">'+item.name+'</div>'
      + '<div class="mall-item-desc">'+item.desc+'</div>'
      + (owned
        ? (active
          ? '<div class="mall-active-badge">✓ Active</div>'
          : '<div class="mall-active-badge" style="background:rgba(90,200,250,0.08);color:var(--teal);">✓ In Vault</div>')
        : '<div class="mall-item-price">'+fm(item.price)+' VK</div>'
          + '<button class="mall-buy-btn '+(G.vk<item.price?'mall-buy-dis':'')+'" '
          + 'onclick="buyMallFont(\''+item.id+'\')">Buy</button>')
      + '</div>';
  });
  h += '</div>';
  el.innerHTML = h;
}

/* -- RENDER PARTICLES SECTION -- */
function renderMallParticles() {
  var el = document.getElementById('mallParticlesSection');
  if (!el) return;
  var h = '<div class="mall-section-title">🌟 Profile Particles</div>'
    + '<div class="mall-section-sub">Visible when others view your profile</div>'
    + '<div class="mall-grid">';
  MALL_PARTICLES.forEach(function(item) {
    var owned  = typeof vaultHas==='function' && vaultHas(item.id);
    var active = typeof vaultActive==='function' && vaultActive('particle')===item.id;
    h += '<div class="mall-item '+(owned?'mall-item-active':'')+'">'
      + '<div style="font-size:1.8rem;margin-bottom:6px;">'+item.char+'</div>'
      + '<div class="mall-item-name">'+item.name+'</div>'
      + '<div class="mall-item-desc">'+item.desc+'</div>'
      + (owned
        ? (active
          ? '<div class="mall-active-badge">✓ Active</div>'
          : '<div class="mall-active-badge" style="background:rgba(90,200,250,0.08);color:var(--teal);">✓ In Vault</div>')
        : '<div class="mall-item-price">'+fm(item.price)+' VK</div>'
          + '<button class="mall-buy-btn '+(G.vk<item.price?'mall-buy-dis':'')+'" '
          + 'onclick="buyMallParticle(\''+item.id+'\')">Buy</button>')
      + '</div>';
  });
  h += '</div>';
  el.innerHTML = h;
}

/* =================== PATCH — Jester Particle =====================
   Appended safely — no existing code changed.
=================================================================== */
(function(){
  MALL_PARTICLES.push({
    id:'ptc_jester',
    name:'Jester Effect',
    price:900000,
    count:6,
    shape:'jester',
    minSize:10,
    maxSize:16,
    colors:['#FFD700','#BF5AF2','#FF6EC7'],
    desc:'Ha! Ha! Ha! floats on your profile — plays once per visit',
    char:'Ha!'
  });
})();
