/* ===================================================
   VICTOR COIN — Mall Vault System
   All purchased mall items stored here
   Player activates/deactivates from vault
   One active per category at a time
=================================================== */

/* -- VAULT CATEGORIES -- */
var VAULT_CATS = {
  ring:     { label:'💍 Rings',      key:'ring'    },
  frame:    { label:'🖼️ Frames',     key:'frame'   },
  orbiter:  { label:'✨ Orbiters',   key:'orbiter' },
  font:     { label:'🔤 Fonts',      key:'font'    },
  particle:     { label:'🌟 Particles',     key:'particle'},
  nametemplate: { label:'🎴 Name Templates', key:'nametemplate'}
};

function initVault() {
  if (!G.vault) G.vault = { items:[], active:{} };
  if (!G.vault.items)  G.vault.items  = [];
  if (!G.vault.active) G.vault.active = {};
  // Migrate old cosmetics into vault if needed
  if (G.cosmetics && !G._vaultMigrated) {
    var old = G.cosmetics;
    if (old.owned) {
      old.owned.forEach(function(id) {
        if (G.vault.items.indexOf(id) === -1) G.vault.items.push(id);
      });
    }
    if (old.ring)    G.vault.active.ring    = old.ring;
    if (old.frame)   G.vault.active.frame   = old.frame;
    if (old.orbiter) G.vault.active.orbiter = old.orbiter;
    G._vaultMigrated = true;
    sv();
  }
}

/* -- ADD ITEM TO VAULT -- */
function vaultAdd(id) {
  initVault();
  if (G.vault.items.indexOf(id) === -1) G.vault.items.push(id);
  sv();
}

/* -- CHECK OWNERSHIP -- */
function vaultHas(id) {
  initVault();
  return G.vault.items.indexOf(id) !== -1;
}

/* -- GET ACTIVE ITEM FOR CATEGORY -- */
function vaultActive(cat) {
  initVault();
  return G.vault.active[cat] || null;
}

/* -- ACTIVATE ITEM (one per category) -- */
function vaultActivate(id) {
  initVault();
  var cat = getItemCat(id);
  if (!cat) return;
  G.vault.active[cat] = id;
  sv();
  applyAllCosmetics();
  renderVaultTab();
  toast('✅ Activated!', '#30D158');
  if (typeof fbSave === 'function') fbSave();
}

/* -- DEACTIVATE -- */
function vaultDeactivate(id) {
  initVault();
  var cat = getItemCat(id);
  if (!cat) return;
  if (G.vault.active[cat] === id) G.vault.active[cat] = null;
  sv();
  applyAllCosmetics();
  renderVaultTab();
  toast('Deactivated', '#FF9F0A');
  if (typeof fbSave === 'function') fbSave();
}

/* -- GET CATEGORY FOR ITEM ID -- */
function getItemCat(id) {
  if (typeof COSMETIC_RINGS    !== 'undefined' && COSMETIC_RINGS.find(function(x){return x.id===id;}))    return 'ring';
  if (typeof COSMETIC_FRAMES   !== 'undefined' && COSMETIC_FRAMES.find(function(x){return x.id===id;}))   return 'frame';
  if (typeof COSMETIC_ORBITERS !== 'undefined' && COSMETIC_ORBITERS.find(function(x){return x.id===id;})) return 'orbiter';
  if (typeof MALL_FONTS        !== 'undefined' && MALL_FONTS.find(function(x){return x.id===id;}))        return 'font';
  if (typeof MALL_PARTICLES    !== 'undefined' && MALL_PARTICLES.find(function(x){return x.id===id;}))    return 'particle';
  if (typeof NAME_TEMPLATES    !== 'undefined' && NAME_TEMPLATES.find(function(x){return x.id===id;}))    return 'nametemplate';
  return null;
}

/* -- GET ITEM META FROM ANY LIST -- */
function getItemMeta(id) {
  var lists = [];
  if (typeof COSMETIC_RINGS    !== 'undefined') lists = lists.concat(COSMETIC_RINGS);
  if (typeof COSMETIC_FRAMES   !== 'undefined') lists = lists.concat(COSMETIC_FRAMES);
  if (typeof COSMETIC_ORBITERS !== 'undefined') lists = lists.concat(COSMETIC_ORBITERS);
  if (typeof MALL_FONTS        !== 'undefined') lists = lists.concat(MALL_FONTS);
  if (typeof MALL_PARTICLES    !== 'undefined') lists = lists.concat(MALL_PARTICLES);
  if (typeof NAME_TEMPLATES    !== 'undefined') lists = lists.concat(NAME_TEMPLATES);
  return lists.find(function(x){ return x.id===id; }) || null;
}

/* -- RENDER VAULT TAB -- */
function renderVaultTab() {
  var el = document.getElementById('vaultBody');
  if (!el) return;
  initVault();

  if (!G.vault.items.length) {
    el.innerHTML = '<div class="vault-empty">'
      + '<div style="font-size:3rem;margin-bottom:12px;">🏛️</div>'
      + '<div style="font-size:0.8rem;font-weight:700;margin-bottom:6px;">Vault is Empty</div>'
      + '<div style="font-size:0.68rem;color:var(--text3);line-height:1.6;">Items you buy from the Mall appear here.<br/>Tap activate to use them on your profile.</div>'
      + '<button style="margin-top:14px;" class="pi-edit-btn" onclick="go(\'mall\',null)">🛍️ Visit Mall</button>'
      + '</div>';
    return;
  }

  // Group by category
  var groups = {};
  G.vault.items.forEach(function(id) {
    var cat = getItemCat(id);
    if (!cat) return;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(id);
  });

  var h = '';
  Object.keys(VAULT_CATS).forEach(function(cat) {
    if (!groups[cat] || !groups[cat].length) return;
    h += '<div class="vault-cat-title">' + VAULT_CATS[cat].label + '</div>'
      + '<div class="vault-grid">';
    groups[cat].forEach(function(id) {
      var item = getItemMeta(id);
      if (!item) return;
      var isActive = G.vault.active[cat] === id;
      h += '<div class="vault-item ' + (isActive ? 'vault-item-on' : '') + '">'
        + '<div class="vault-item-ico">' + (item.emoji || item.previewChar || '✦') + '</div>'
        + '<div class="vault-item-name">' + item.name + '</div>'
        + (isActive
          ? '<button class="vault-btn vault-btn-off" onclick="vaultDeactivate(\'' + id + '\')">Deactivate</button>'
          : '<button class="vault-btn vault-btn-on" onclick="vaultActivate(\'' + id + '\')">Activate</button>')
        + '</div>';
    });
    h += '</div>';
  });

  el.innerHTML = h;
}

/* -- APPLY ALL ACTIVE COSMETICS -- */
function applyAllCosmetics() {
  initVault();
  // Sync vault active into G.cosmetics for compatibility
  if (!G.cosmetics) G.cosmetics = {owned:[]};
  G.cosmetics.ring    = G.vault.active.ring    || null;
  G.cosmetics.frame   = G.vault.active.frame   || null;
  G.cosmetics.orbiter = G.vault.active.orbiter || null;
  // Apply ring/frame/orbiter via existing fn
  if (typeof applyCosmetics === 'function') applyCosmetics();
  // Apply font
  applyActiveFont();
  // Apply particles
  applyActiveParticle();
}

/* -- FONT APPLICATION -- */
function applyActiveFont() {
  var activeFont = G.vault.active.font;
  var root = document.getElementById('app');
  if (!root) return;
  // Remove old font classes
  root.classList.remove('font-gothic','font-ggsans','font-sakura','font-orbiton');
  if (activeFont && typeof MALL_FONTS !== 'undefined') {
    var f = MALL_FONTS.find(function(x){ return x.id === activeFont; });
    if (f) root.classList.add(f.cssClass);
  }
}

/* -- PARTICLE APPLICATION -- */
var _particleInterval = null;
function applyActiveParticle() {
  var old = document.getElementById('profileParticles');
  if (old) old.remove();
  clearInterval(_particleInterval);

  var activeP = G.vault.active.particle;
  if (!activeP || typeof MALL_PARTICLES === 'undefined') return;
  var p = MALL_PARTICLES.find(function(x){ return x.id === activeP; });
  if (!p) return;

  var canvas = document.createElement('canvas');
  canvas.id = 'profileParticles';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.35;';
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var particles = [];
  for (var i = 0; i < p.count; i++) {
    particles.push(newParticle(p, canvas));
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function(pt, idx) {
      pt.y -= pt.vy;
      pt.x += Math.sin(pt.phase + pt.y * 0.01) * 0.5;
      pt.phase += 0.02;
      pt.life -= 0.003;
      if (pt.life <= 0) particles[idx] = newParticle(p, canvas);
      ctx.globalAlpha = pt.life * 0.8;
      ctx.fillStyle = pt.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2);
        ctx.fill();
      } else if (p.shape === 'star') {
        drawStar(ctx, pt.x, pt.y, pt.size);
      } else if (p.shape === 'flake') {
        drawFlake(ctx, pt.x, pt.y, pt.size);
      } else {
        ctx.font = pt.size * 2 + 'px serif';
        ctx.fillText(p.char || '✦', pt.x, pt.y);
      }
    });
    ctx.globalAlpha = 1;
  }
  _particleInterval = setInterval(tick, 33);
}

function newParticle(p, canvas) {
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + 20,
    vy: 0.4 + Math.random() * 1.2,
    size: p.minSize + Math.random() * (p.maxSize - p.minSize),
    color: p.colors[Math.floor(Math.random() * p.colors.length)],
    phase: Math.random() * Math.PI * 2,
    life: 0.4 + Math.random() * 0.6
  };
}

function drawStar(ctx, x, y, r) {
  ctx.beginPath();
  for (var i = 0; i < 5; i++) {
    var a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    i === 0 ? ctx.moveTo(x + r*Math.cos(a), y + r*Math.sin(a))
            : ctx.lineTo(x + r*Math.cos(a), y + r*Math.sin(a));
  }
  ctx.closePath(); ctx.fill();
}

function drawFlake(ctx, x, y, r) {
  for (var i = 0; i < 6; i++) {
    var a = (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + r*Math.cos(a)*2, y + r*Math.sin(a)*2);
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = r * 0.4;
    ctx.stroke();
  }
}

/* =================== PATCH — Jester particle + visitor particle ======
   Appended safely. 
====================================================================== */

/* Override applyActiveParticle to handle jester shape */
(function(){
  var _origAAP = applyActiveParticle;
  applyActiveParticle = function(){
    var activeP = G.vault && G.vault.active && G.vault.active.particle;
    if(activeP === 'ptc_jester'){
      /* Jester is OWN profile — show looping Ha! Ha! Ha! canvas */
      playJesterCanvas(true);
      return;
    }
    _origAAP();
  };
})();

/* -- JESTER CANVAS -- plays text "Ha!" floating up/down */
var _jesterInterval = null;
function playJesterCanvas(loop){
  var old = document.getElementById('profileParticles');
  if(old) old.remove();
  clearInterval(_jesterInterval);

  var canvas = document.createElement('canvas');
  canvas.id = 'profileParticles';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var TEXTS  = ['Ha!', 'Ha!', 'Ha!'];
  var COLORS = ['#FFD700','#BF5AF2','#FF6EC7'];
  var parts  = [];

  function spawnJester(){
    for(var i=0;i<TEXTS.length;i++){
      parts.push({
        text:  TEXTS[i],
        x:     80 + Math.random() * (canvas.width - 160),
        y:     canvas.height * 0.55 + Math.random() * (canvas.height * 0.3),
        vy:    0.6 + Math.random() * 0.8,
        amp:   12 + Math.random() * 18,
        phase: Math.random() * Math.PI * 2,
        color: COLORS[i % COLORS.length],
        alpha: 1,
        size:  20 + Math.random() * 8,
        life:  1
      });
    }
  }

  spawnJester();
  var done = false;

  function tick(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var allDead = true;
    parts.forEach(function(p){
      if(p.life <= 0) return;
      allDead = false;
      p.y     -= p.vy;
      p.phase += 0.04;
      p.x     += Math.sin(p.phase) * 0.8;
      p.life  -= 0.004;
      ctx.globalAlpha = Math.max(0, p.life * 0.9);
      ctx.font        = 'bold ' + p.size + 'px sans-serif';
      ctx.fillStyle   = p.color;
      ctx.fillText(p.text, p.x, p.y);
    });
    ctx.globalAlpha = 1;
    if(allDead){
      if(loop){
        parts = [];
        spawnJester();
      } else {
        done = true;
        clearInterval(_jesterInterval);
        setTimeout(function(){
          var c2 = document.getElementById('profileParticles');
          if(c2) c2.remove();
        }, 300);
      }
    }
  }

  _jesterInterval = setInterval(tick, 33);
}

/* -- VISITOR PARTICLE — called when viewing another player's profile --
   Plays ONCE, no loop. Safe to call multiple times (cleans up previous).  */
function playVisitorParticle(playerData){
  var ptcId = playerData && playerData.vault && playerData.vault.active
              ? playerData.vault.active.particle : null;
  if(!ptcId) return;

  /* Jester: special text effect, plays once */
  if(ptcId === 'ptc_jester'){
    playJesterCanvas(false);   /* loop=false → plays once then removes itself */
    return;
  }

  /* All other particles: same canvas engine, but plays for 4 s then stops */
  if(typeof MALL_PARTICLES === 'undefined') return;
  var p = MALL_PARTICLES.find(function(x){ return x.id === ptcId; });
  if(!p) return;

  var old = document.getElementById('profileParticles');
  if(old) old.remove();
  clearInterval(_jesterInterval);

  var canvas = document.createElement('canvas');
  canvas.id = 'profileParticles';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.35;';
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var particles = [];
  for(var i=0;i<p.count;i++) particles.push(newParticle(p, canvas));

  var elapsed = 0;
  var iv = setInterval(function(){
    elapsed += 33;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function(pt, idx){
      pt.y -= pt.vy;
      pt.x += Math.sin(pt.phase + pt.y * 0.01) * 0.5;
      pt.phase += 0.02;
      pt.life   -= 0.003;
      if(pt.life <= 0) particles[idx] = newParticle(p, canvas);
      ctx.globalAlpha = pt.life * 0.8;
      ctx.fillStyle   = pt.color;
      if(p.shape==='circle'){
        ctx.beginPath(); ctx.arc(pt.x,pt.y,pt.size,0,Math.PI*2); ctx.fill();
      } else if(p.shape==='star'){
        drawStar(ctx,pt.x,pt.y,pt.size);
      } else if(p.shape==='flake'){
        drawFlake(ctx,pt.x,pt.y,pt.size);
      } else {
        ctx.font = pt.size*2+'px serif';
        ctx.fillText(p.char||'✦', pt.x, pt.y);
      }
    });
    ctx.globalAlpha = 1;
    if(elapsed > 4000){
      clearInterval(iv);
      var c2 = document.getElementById('profileParticles');
      if(c2) c2.remove();
    }
  }, 33);
}
