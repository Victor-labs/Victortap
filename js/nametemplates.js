/* ===================================================
   VICTOR COIN — Name Templates (Discord-style)
   CSS-animated nameplates shown in friends list
   & profile cards. Buy confirmation popup.
=================================================== */

var NAME_TEMPLATES = [
  {
    id:'nt_dragonball', name:'Dragon Ball',   price:500000, emoji:'🔥',
    desc:'Blazing fire surrounds your name',
    cssClass:'nt-dragonball',
    preview:'VICTOR'
  },
  {
    id:'nt_sakura',     name:'Sakura',        price:500000, emoji:'🌸',
    desc:'Pink petals drift across your name',
    cssClass:'nt-sakura',
    preview:'VICTOR'
  },
  {
    id:'nt_galaxy',     name:'Galaxy',        price:500000, emoji:'🌌',
    desc:'Stars and nebula drift behind your name',
    cssClass:'nt-galaxy',
    preview:'VICTOR'
  },
  {
    id:'nt_ice',        name:'Ice Crystal',   price:500000, emoji:'❄️',
    desc:'Frozen crystal shards frame your name',
    cssClass:'nt-ice',
    preview:'VICTOR'
  },
  {
    id:'nt_neon',       name:'Neon Glow',     price:500000, emoji:'⚡',
    desc:'Electric neon buzz around your name',
    cssClass:'nt-neon',
    preview:'VICTOR'
  },
  {
    id:'nt_bloodmoon',  name:'Blood Moon',    price:500000, emoji:'🌑',
    desc:'Dark red moon energy pulses your name',
    cssClass:'nt-bloodmoon',
    preview:'VICTOR'
  }
];

/* -- RENDER NAME TEMPLATES SECTION IN MALL -- */
function renderMallNameTemplates() {
  var el = document.getElementById('mallNameTemplatesSection');
  if (!el) return;

  var h = '<div class="mall-section-title">🎴 Name Templates</div>'
    + '<div class="mall-section-sub">Your name glows with animated effects visible to all players</div>'
    + '<div class="nt-grid">';

  NAME_TEMPLATES.forEach(function(item) {
    var owned  = typeof vaultHas==='function' && vaultHas(item.id);
    var active = typeof vaultActive==='function' && vaultActive('nametemplate')===item.id;

    h += '<div class="nt-card">'
      // Animated preview of the nameplate
      + '<div class="nt-preview-wrap">'
      + '<div class="nt-preview '+item.cssClass+'">'
      + '<span class="nt-preview-name">'+item.preview+'</span>'
      + ntParticles(item.cssClass)
      + '</div>'
      + '</div>'
      + '<div class="nt-card-info">'
      + '<div class="nt-card-name">'+item.emoji+' '+item.name+'</div>'
      + '<div class="nt-card-desc">'+item.desc+'</div>'
      + (owned
        ? (active
          ? '<div class="mall-active-badge">✓ Active</div>'
          : '<div class="mall-active-badge" style="background:rgba(90,200,250,0.08);color:var(--teal);">✓ In Vault</div>')
        : '<div class="nt-card-price">'+fm(item.price)+' VK</div>'
          + '<button class="nt-buy-btn '+(typeof G!=='undefined'&&G.vk<item.price?'mall-buy-dis':'')+'" '
          + 'onclick="confirmBuyMall(\'nt\',\''+item.id+'\')">Buy</button>')
      + '</div>'
      + '</div>';
  });

  h += '</div>';
  el.innerHTML = h;
}

/* -- PARTICLE DECORATIONS PER TEMPLATE -- */
function ntParticles(cls) {
  var configs = {
    'nt-dragonball': {chars:['🔥','✦','⚡'], count:4},
    'nt-sakura':     {chars:['🌸','·','✿'], count:5},
    'nt-galaxy':     {chars:['✦','★','·'], count:6},
    'nt-ice':        {chars:['❄','✦','·'], count:4},
    'nt-neon':       {chars:['⚡','·','✦'], count:4},
    'nt-bloodmoon':  {chars:['🌑','·','✦'], count:4}
  };
  var cfg = configs[cls] || {chars:['·'], count:3};
  var h = '';
  for (var i = 0; i < cfg.count; i++) {
    var ch = cfg.chars[i % cfg.chars.length];
    h += '<span class="nt-particle nt-p-'+i+'" aria-hidden="true">'+ch+'</span>';
  }
  return h;
}

/* -- BUY CONFIRMATION POPUP (Discord-style) -- */
function confirmBuyMall(type, id) {
  var allItems = [];
  if (typeof MALL_FONTS!=='undefined')         allItems=allItems.concat(MALL_FONTS);
  if (typeof MALL_PARTICLES!=='undefined')     allItems=allItems.concat(MALL_PARTICLES);
  if (typeof COSMETIC_RINGS!=='undefined')     allItems=allItems.concat(COSMETIC_RINGS);
  if (typeof COSMETIC_FRAMES!=='undefined')    allItems=allItems.concat(COSMETIC_FRAMES);
  if (typeof COSMETIC_ORBITERS!=='undefined')  allItems=allItems.concat(COSMETIC_ORBITERS);
  if (typeof NAME_TEMPLATES!=='undefined')     allItems=allItems.concat(NAME_TEMPLATES);

  var item = allItems.find(function(x){ return x.id===id; });
  if (!item) return;

  var ov = document.createElement('div');
  ov.id  = 'mallBuyConfirmOv';
  ov.style.cssText='position:fixed;inset:0;z-index:700;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(10px);';

  ov.innerHTML = '<div class="buy-confirm-sheet">'
    + '<div class="buy-confirm-handle"></div>'
    // Preview
    + '<div class="buy-confirm-preview">'
    + (item.cssClass ? '<div class="nt-preview '+item.cssClass+'" style="margin:0 auto;"><span class="nt-preview-name">'+(typeof G!=='undefined'?G.name||'PLAYER':'PLAYER')+'</span>'+ntParticles(item.cssClass)+'</div>'
      : '<div style="font-size:3rem;text-align:center;">'+(item.emoji||'✨')+'</div>')
    + '</div>'
    // Info
    + '<div class="buy-confirm-name">'+(item.emoji||'')+'&nbsp;'+item.name+'</div>'
    + '<div class="buy-confirm-desc">'+item.desc+'</div>'
    + '<div class="buy-confirm-price">'+fm(item.price)+' VK</div>'
    + '<div class="buy-confirm-bal">Your balance: <span style="color:var(--gold);">'+fm(typeof G!=='undefined'?G.vk:0)+' VK</span></div>'
    // Buttons
    + '<div class="buy-confirm-btns">'
    + '<button class="buy-confirm-ok '+(typeof G!=='undefined'&&G.vk<item.price?'buy-confirm-disabled':'')+'" '
    + 'onclick="executeMallBuy(\''+id+'\')">'
    + (typeof G!=='undefined'&&G.vk<item.price?'Not Enough VK':'Buy '+item.name)
    + '</button>'
    + '<button class="buy-confirm-cancel" onclick="document.getElementById(\'mallBuyConfirmOv\').remove()">Cancel</button>'
    + '</div>'
    + '</div>';

  ov.addEventListener('click',function(e){ if(e.target===ov) ov.remove(); });
  document.body.appendChild(ov);

  var sheet=ov.querySelector('.buy-confirm-sheet');
  sheet.style.transform='translateY(100%)';
  setTimeout(function(){sheet.style.transform='translateY(0)';},10);
}

/* -- EXECUTE BUY (called from confirm popup) -- */
function executeMallBuy(id) {
  document.getElementById('mallBuyConfirmOv') && document.getElementById('mallBuyConfirmOv').remove();

  // Detect which category and call the right buy function
  if (typeof COSMETIC_RINGS!=='undefined'    && COSMETIC_RINGS.find(function(x){return x.id===id;}))    { buyCosmetic(id); return; }
  if (typeof COSMETIC_FRAMES!=='undefined'   && COSMETIC_FRAMES.find(function(x){return x.id===id;}))   { buyCosmetic(id); return; }
  if (typeof COSMETIC_ORBITERS!=='undefined' && COSMETIC_ORBITERS.find(function(x){return x.id===id;})) { buyCosmetic(id); return; }
  if (typeof MALL_FONTS!=='undefined'        && MALL_FONTS.find(function(x){return x.id===id;}))        { buyMallFont(id); return; }
  if (typeof MALL_PARTICLES!=='undefined'    && MALL_PARTICLES.find(function(x){return x.id===id;}))    { buyMallParticle(id); return; }
  if (typeof NAME_TEMPLATES!=='undefined'    && NAME_TEMPLATES.find(function(x){return x.id===id;}))    { buyNameTemplate(id); return; }
}

/* -- BUY NAME TEMPLATE -- */
function buyNameTemplate(id) {
  if (typeof vaultHas==='function' && vaultHas(id)) { toast('Already owned!','#FF9F0A'); return; }
  var item = NAME_TEMPLATES.find(function(x){ return x.id===id; });
  if (!item) return;
  if (G.vk < item.price) { toast('Need '+fm(item.price)+' VK','#FF453A'); return; }
  G.vk -= item.price;
  if (typeof vaultAdd==='function') vaultAdd(id);
  sv(); renderAll();
  if (typeof checkAch==='function') checkAch();
  renderMallNameTemplates();
  toast(item.emoji+' '+item.name+' added to Vault!','#30D158');
  if (typeof fbSave==='function') fbSave();
}

/* -- APPLY ACTIVE NAMETEMPLATE TO ELEMENTS -- */
function getActiveNameTemplate() {
  if (typeof vaultActive!=='function') return null;
  var id = vaultActive('nametemplate');
  if (!id) return null;
  return NAME_TEMPLATES.find(function(x){ return x.id===id; }) || null;
}

/* -- RENDER NAME WITH TEMPLATE (for friends list, leaderboard) -- */
function renderNameWithTemplate(name, playerData) {
  var tId = playerData&&playerData.vault&&playerData.vault.active?playerData.vault.active.nametemplate:null;
  if (!tId) return '<span>'+escHTML(name)+'</span>';
  var tmpl = NAME_TEMPLATES.find(function(x){return x.id===tId;});
  if (!tmpl) return '<span>'+escHTML(name)+'</span>';
  return '<span class="nt-inline '+tmpl.cssClass+'">'+escHTML(name)+ntParticles(tmpl.cssClass)+'</span>';
}

function escHTML(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* =================== PATCH — New Name Templates ===================
   Appended safely — does not touch existing code above
=================================================================== */
(function(){
  NAME_TEMPLATES.push(
    {
      id:'nt_jester',
      name:'Jester',
      price:750000,
      emoji:'🪄',
      desc:'Magic wands and hats float with gold & purple sparkles',
      cssClass:'nt-jester',
      preview:'VICTOR'
    },
    {
      id:'nt_horseyear',
      name:'Year of the Horse',
      price:750000,
      emoji:'🏮',
      desc:'Chinese lanterns drift with white, red & gold particles',
      cssClass:'nt-horseyear',
      preview:'VICTOR'
    }
  );

  // Patch ntParticles to recognise the new classes
  var _origNtParticles = ntParticles;
  ntParticles = function(cls) {
    var extras = {
      'nt-jester':    {chars:['🪄','🎩','✦','·'], count:5},
      'nt-horseyear': {chars:['🏮','✦','·','★'],  count:5}
    };
    if (extras[cls]) {
      var cfg = extras[cls];
      var h = '';
      for (var i = 0; i < cfg.count; i++) {
        var ch = cfg.chars[i % cfg.chars.length];
        h += '<span class="nt-particle nt-p-'+i+'" aria-hidden="true">'+ch+'</span>';
      }
      return h;
    }
    return _origNtParticles(cls);
  };

  // Patch confirmBuyMall to see new NAME_TEMPLATES entries (already included since it reads the array)
  // Patch executeMallBuy to route new name templates (already handled by NAME_TEMPLATES.find)
})();
