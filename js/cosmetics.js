/* ===================================================
   VICTOR COIN — Profile Cosmetics
   Rings · Frames · Orbiting Badges
   Permanent purchases stored in Firebase
=================================================== */

var COSMETIC_RINGS = [
  {id:'ring_gold',    name:'Gold Ring',    price:1000000, css:'ring-gold',    desc:'Shimmering gold glow'},
  {id:'ring_fire',    name:'Fire Ring',    price:1000000, css:'ring-fire',    desc:'Blazing flame border'},
  {id:'ring_ice',     name:'Ice Ring',     price:1000000, css:'ring-ice',     desc:'Frozen crystal pulse'},
  {id:'ring_galaxy',  name:'Galaxy Ring',  price:1000000, css:'ring-galaxy',  desc:'Deep space swirl'},
  {id:'ring_royal',   name:'Royal Ring',   price:1000000, css:'ring-royal',   desc:'Purple royal gleam'},
  {id:'ring_neon',    name:'Neon Ring',    price:1000000, css:'ring-neon',    desc:'Electric neon buzz'}
];

var COSMETIC_FRAMES = [
  {id:'frame_hex',    name:'Hexagon',      price:3000000, css:'frame-hex',    desc:'Sharp hex warrior frame'},
  {id:'frame_star',   name:'Star',         price:3000000, css:'frame-star',   desc:'Five-point star frame'},
  {id:'frame_crown',  name:'Crown',        price:3000000, css:'frame-crown',  desc:'Royal crown frame'}
];

var COSMETIC_ORBITERS = [
  {id:'orb_coin',     name:'Coin Orbit',   price:5000000, emoji:'🪙', desc:'Coins orbit your avatar'},
  {id:'orb_diamond',  name:'Diamond Orbit',price:5000000, emoji:'💎', desc:'Diamonds circle you'},
  {id:'orb_star',     name:'Star Orbit',   price:5000000, emoji:'⭐', desc:'Stars swirl around you'},
  {id:'orb_crown',    name:'Crown Orbit',  price:5000000, emoji:'👑', desc:'Crowns float around you'}
];

/* -- INIT -- */
function initCosmetics(){
  if(!G.cosmetics) G.cosmetics={
    ring:null, frame:null, orbiter:null,
    owned:[]
  };
  if(!G.cosmetics.owned) G.cosmetics.owned=[];
}

function hasCosmetic(id){ initCosmetics(); return G.cosmetics.owned.indexOf(id)!==-1; }

/* -- BUY COSMETIC -- */
function buyCosmetic(id){
  initCosmetics();
  var all=[].concat(COSMETIC_RINGS,COSMETIC_FRAMES,COSMETIC_ORBITERS);
  var item=all.find(function(c){return c.id===id;});
  if(!item){toast('Item not found','#FF453A');return;}
  if(hasCosmetic(id)){toast('Already owned!','#FF9F0A');return;}
  if(G.vk<item.price){toast('Need '+fm(item.price)+' VK','#FF453A');return;}
  G.vk-=item.price;
  G.cosmetics.owned.push(id);
  sv();renderAll();
  // Auto-equip
  equipCosmetic(id,false);
  toast('✨ '+item.name+' unlocked!','#FFD60A');
  renderMallCosmetics();
  if(typeof fbSave==='function') fbSave();
}

/* -- EQUIP COSMETIC -- */
function equipCosmetic(id,rerender){
  initCosmetics();
  if(COSMETIC_RINGS.find(function(r){return r.id===id;}))   G.cosmetics.ring=id;
  if(COSMETIC_FRAMES.find(function(f){return f.id===id;}))  G.cosmetics.frame=id;
  if(COSMETIC_ORBITERS.find(function(o){return o.id===id;}))G.cosmetics.orbiter=id;
  sv();
  applyCosmetics();
  if(rerender!==false) renderMallCosmetics();
}
function unequipCosmetic(type){
  initCosmetics();
  G.cosmetics[type]=null;
  sv(); applyCosmetics(); renderMallCosmetics();
}

/* -- APPLY TO DOM -- */
function applyCosmetics(){
  initCosmetics();
  var avEl=document.getElementById('playerAvatarWrap');
  if(!avEl) return;
  // Remove old classes
  avEl.className='pav';
  // Frame shape
  if(G.cosmetics.frame){
    avEl.classList.add(G.cosmetics.frame);
  }
  // Ring glow
  if(G.cosmetics.ring){
    avEl.classList.add(G.cosmetics.ring);
  }
  // Orbiter
  var oldOrb=document.getElementById('avatarOrbiter');
  if(oldOrb) oldOrb.remove();
  if(G.cosmetics.orbiter){
    var orb=COSMETIC_ORBITERS.find(function(o){return o.id===G.cosmetics.orbiter;});
    if(orb){
      var orbEl=document.createElement('div');
      orbEl.id='avatarOrbiter';
      orbEl.className='av-orbiter';
      orbEl.innerHTML='<span class="orb-item">'+orb.emoji+'</span>'
        +'<span class="orb-item orb-item-2">'+orb.emoji+'</span>'
        +'<span class="orb-item orb-item-3">'+orb.emoji+'</span>';
      avEl.parentNode.style.position='relative';
      avEl.parentNode.insertBefore(orbEl,avEl.nextSibling);
    }
  }
}

/* -- BUILD COSMETIC AVATAR (for profile cards) -- */
function buildCosmeticAvatar(player, size){
  size=size||60;
  var pic=player.profilePic
    ? '<img src="'+player.profilePic+'" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"/>'
    : '<span style="font-size:'+(size*0.4)+'px;">👤</span>';
  var ring=player.cosmetics&&player.cosmetics.ring?player.cosmetics.ring:'';
  var frame=player.cosmetics&&player.cosmetics.frame?player.cosmetics.frame:'';
  var orb=player.cosmetics&&player.cosmetics.orbiter
    ? COSMETIC_ORBITERS.find(function(o){return o.id===player.cosmetics.orbiter;}) : null;
  return '<div class="cosm-av-wrap" style="width:'+size+'px;height:'+size+'px;position:relative;display:inline-block;">'
    +'<div class="pav '+ring+' '+frame+'" style="width:'+size+'px;height:'+size+'px;font-size:'+(size*0.35)+'px;">'+pic+'</div>'
    +(orb?'<div class="av-orbiter av-orbiter-sm"><span class="orb-item">'+orb.emoji+'</span><span class="orb-item orb-item-2">'+orb.emoji+'</span></div>':'')
    +'</div>';
}

/* -- MALL COSMETICS SECTION -- */
function renderMallCosmetics(){
  var el=document.getElementById('mallCosmeticsSection');
  if(!el) return;
  initCosmetics();

  function section(title,items){
    return '<div class="mall-section-title">'+title+'</div>'
      +'<div class="mall-grid">'
      +items.map(function(item){
        var owned=hasCosmetic(item.id);
        var equipped=(G.cosmetics.ring===item.id||G.cosmetics.frame===item.id||G.cosmetics.orbiter===item.id);
        return '<div class="mall-item cosm-item '+(owned?'mall-item-active':'')+' '+(equipped?'cosm-equipped':'')+'">'
          +'<div class="cosm-preview '+(item.css||'')+'">'
          +(item.emoji||'<span style="font-size:1.4rem;">👤</span>')
          +'</div>'
          +'<div class="mall-item-name">'+item.name+'</div>'
          +'<div class="mall-item-desc">'+item.desc+'</div>'
          +(owned
            ? (equipped
              ?'<div class="mall-active-badge">✓ Equipped</div>'
              +'<button class="mall-buy-btn" onclick="unequipCosmetic(\''+(COSMETIC_RINGS.find(function(r){return r.id===item.id;})?'ring':COSMETIC_FRAMES.find(function(f){return f.id===item.id;})?'frame':'orbiter')+'\')">Remove</button>'
              :'<button class="mall-buy-btn" onclick="equipCosmetic(\''+item.id+'\',true)">Equip</button>')
            :'<div class="mall-item-price">'+fm(item.price)+' VK</div>'
            +'<button class="mall-buy-btn '+(G.vk<item.price?'mall-buy-dis':'')+'" onclick="buyCosmetic(\''+item.id+'\')">Buy</button>')
          +'</div>';
      }).join('')
      +'</div>';
  }

  el.innerHTML=section('💍 Rings — Animated Glow',COSMETIC_RINGS)
    +section('🖼️ Frames — Special Shapes',COSMETIC_FRAMES)
    +section('✨ Orbiters — Floating Badges',COSMETIC_ORBITERS);
}

/* =================== PATCH — New Profile Cosmetics ===================
   Hat cosmetics + Special frame cosmetics.
   Appended safely — no existing code changed.
======================================================================= */

/* -- HAT COSMETICS (emoji sits on top of avatar circle) -- */
var COSMETIC_HATS = [
  {id:'hat_jokkie',  name:'Jokkie',         price:800000,  emoji:'🎭', hat:'🎭', hatClass:'hat-jokkie',  desc:'A jester hat sits on top of your avatar'},
  {id:'hat_witch',   name:'Every Witch Way', price:800000,  emoji:'🧙', hat:'🧢', hatClass:'hat-witch',   desc:'A pointed witch hat crowns your profile pic'}
];

/* -- SPECIAL cosmetics (overlay on avatar) -- */
var COSMETIC_SPECIAL = [
  {id:'spec_gelatin', name:'Gelationus Liquid', price:1500000, emoji:'🫧', specClass:'spec-gelatin', desc:'Your avatar shimmers inside a wobbling light-blue jelly'},
  {id:'spec_vicsanta',name:'Vic Santa',         price:1200000, emoji:'🎄', specClass:'spec-vicsanta',desc:'A Christmas tree beside you with gift boxes orbiting your circle'}
];

/* Extend G.cosmetics to hold hat + special */
(function(){
  var _origInit = initCosmetics;
  initCosmetics = function(){
    _origInit();
    if(G.cosmetics.hat     === undefined) G.cosmetics.hat     = null;
    if(G.cosmetics.special === undefined) G.cosmetics.special = null;
    if(!G.cosmetics.owned) G.cosmetics.owned = [];
  };
})();

/* Extend hasCosmetic (already works — checks owned array) */

/* Extend buyCosmetic to cover hats + special */
(function(){
  var _origBuy = buyCosmetic;
  buyCosmetic = function(id){
    var hatItem  = COSMETIC_HATS.find(function(h){return h.id===id;});
    var specItem = COSMETIC_SPECIAL.find(function(s){return s.id===id;});
    if(!hatItem && !specItem){ _origBuy(id); return; }
    initCosmetics();
    var item = hatItem || specItem;
    if(hasCosmetic(id)){toast('Already owned!','#FF9F0A');return;}
    if(G.vk < item.price){toast('Need '+fm(item.price)+' VK','#FF453A');return;}
    G.vk -= item.price;
    G.cosmetics.owned.push(id);
    sv(); renderAll();
    equipCosmetic(id, false);
    toast('✨ '+item.name+' unlocked!','#FFD60A');
    renderMallCosmetics();
    if(typeof fbSave==='function') fbSave();
  };
})();

/* Extend equipCosmetic */
(function(){
  var _origEquip = equipCosmetic;
  equipCosmetic = function(id, rerender){
    _origEquip(id, rerender);
    if(COSMETIC_HATS.find(function(h){return h.id===id;}))    G.cosmetics.hat     = id;
    if(COSMETIC_SPECIAL.find(function(s){return s.id===id;})) G.cosmetics.special = id;
    sv(); applyCosmetics();
    if(rerender !== false) renderMallCosmetics();
  };
})();

/* Extend unequipCosmetic to handle hat/special */
(function(){
  var _origUneq = unequipCosmetic;
  unequipCosmetic = function(type){
    _origUneq(type);
    applyCosmetics();
  };
})();

/* Extend applyCosmetics to paint hat + special onto DOM */
(function(){
  var _origApply = applyCosmetics;
  applyCosmetics = function(){
    _origApply();
    initCosmetics();
    var avEl = document.getElementById('playerAvatarWrap');
    if(!avEl) return;
    var outer = avEl.parentNode;

    /* -- Hat -- */
    var oldHat = document.getElementById('avatarHat');
    if(oldHat) oldHat.remove();
    if(G.cosmetics.hat){
      var hDef = COSMETIC_HATS.find(function(h){return h.id===G.cosmetics.hat;});
      if(hDef){
        var hatEl = document.createElement('div');
        hatEl.id = 'avatarHat';
        hatEl.className = 'av-hat ' + hDef.hatClass;
        hatEl.textContent = hDef.hat;
        outer.style.position = 'relative';
        outer.appendChild(hatEl);
      }
    }

    /* -- Special: Gelatin -- */
    avEl.classList.remove('spec-gelatin','spec-vicsanta');
    var oldTree  = document.getElementById('avatarTree');  if(oldTree)  oldTree.remove();
    var oldGifts = document.getElementById('avatarGifts'); if(oldGifts) oldGifts.remove();

    if(G.cosmetics.special === 'spec_gelatin'){
      avEl.classList.add('spec-gelatin');
    }
    if(G.cosmetics.special === 'spec_vicsanta'){
      avEl.classList.add('spec-vicsanta');
      /* Christmas tree beside avatar */
      var treeEl = document.createElement('div');
      treeEl.id = 'avatarTree';
      treeEl.className = 'av-tree';
      treeEl.textContent = '🎄';
      outer.style.position = 'relative';
      outer.appendChild(treeEl);
      /* Gift box orbiter */
      var giftsEl = document.createElement('div');
      giftsEl.id = 'avatarGifts';
      giftsEl.className = 'av-orbiter';
      giftsEl.innerHTML = '<span class="orb-item">🎁</span>'
        + '<span class="orb-item orb-item-2">🎁</span>'
        + '<span class="orb-item orb-item-3">🎁</span>';
      outer.appendChild(giftsEl);
    }
  };
})();

/* Extend buildCosmeticAvatar for hat + special */
(function(){
  var _origBCA = buildCosmeticAvatar;
  buildCosmeticAvatar = function(player, size){
    size = size || 60;
    var base = _origBCA(player, size);
    var hatDef  = player.cosmetics && player.cosmetics.hat
      ? COSMETIC_HATS.find(function(h){return h.id===player.cosmetics.hat;}) : null;
    var specId  = player.cosmetics && player.cosmetics.special || '';
    var hatHTML = hatDef
      ? '<div class="av-hat '+hatDef.hatClass+'" style="font-size:'+(size*0.55)+'px;top:-'+(size*0.3)+'px;left:50%;transform:translateX(-50%);">'+hatDef.hat+'</div>'
      : '';
    var gelHTML  = specId==='spec_gelatin'  ? '' : '';   // CSS handles it
    var santaHTML= specId==='spec_vicsanta' ? '<div class="av-tree" style="font-size:'+(size*0.45)+'px;">🎄</div>' : '';
    // Inject hat + santa into the wrap
    return base.replace('</div>', hatHTML + santaHTML + '</div>');
  };
})();

/* Extend renderMallCosmetics to show new sections */
(function(){
  var _origRMC = renderMallCosmetics;
  renderMallCosmetics = function(){
    _origRMC();
    var el = document.getElementById('mallCosmeticsSection');
    if(!el) return;
    initCosmetics();

    function cosSection(title, items, typeKey){
      return '<div class="mall-section-title">'+title+'</div>'
        +'<div class="mall-grid">'
        +items.map(function(item){
          var owned    = hasCosmetic(item.id);
          var equipped = G.cosmetics[typeKey] === item.id;
          return '<div class="mall-item cosm-item '+(owned?'mall-item-active':'')+' '+(equipped?'cosm-equipped':'')+'">'
            +'<div style="font-size:2rem;margin-bottom:4px;">'+item.emoji+'</div>'
            +'<div class="mall-item-name">'+item.name+'</div>'
            +'<div class="mall-item-desc">'+item.desc+'</div>'
            +(owned
              ? (equipped
                  ? '<div class="mall-active-badge">✓ Equipped</div>'
                    +'<button class="mall-buy-btn" onclick="unequipCosmetic(\''+typeKey+'\')">Remove</button>'
                  : '<button class="mall-buy-btn" onclick="equipCosmetic(\''+item.id+'\',true)">Equip</button>')
              : '<div class="mall-item-price">'+fm(item.price)+' VK</div>'
                +'<button class="mall-buy-btn '+(G.vk<item.price?'mall-buy-dis':'')+'" onclick="buyCosmetic(\''+item.id+'\')">Buy</button>')
            +'</div>';
        }).join('')
        +'</div>';
    }

    el.innerHTML += cosSection('🎩 Hat Cosmetics — Wearable Emoji', COSMETIC_HATS, 'hat')
      + cosSection('✨ Special Frames', COSMETIC_SPECIAL, 'special');
  };
})();

/* Extend confirmBuyMall + executeMallBuy to recognise hats + specials */
(function(){
  if(typeof confirmBuyMall==='function'){
    var _origCBM = confirmBuyMall;
    confirmBuyMall = function(type, id){
      // inject hats+specials into allItems search
      if(COSMETIC_HATS.find(function(x){return x.id===id;}) ||
         COSMETIC_SPECIAL.find(function(x){return x.id===id;})){
        var item = COSMETIC_HATS.find(function(x){return x.id===id;}) ||
                   COSMETIC_SPECIAL.find(function(x){return x.id===id;});
        // reuse existing popup logic by temporarily pushing into rings (will be routed by executeMallBuy)
        _origCBM(type, id);
        return;
      }
      _origCBM(type, id);
    };
  }

  if(typeof executeMallBuy==='function'){
    var _origEMB = executeMallBuy;
    executeMallBuy = function(id){
      if(COSMETIC_HATS.find(function(x){return x.id===id;}))    { buyCosmetic(id); return; }
      if(COSMETIC_SPECIAL.find(function(x){return x.id===id;})) { buyCosmetic(id); return; }
      _origEMB(id);
    };
  }
})();
