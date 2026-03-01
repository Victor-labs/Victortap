/* ===================================================
   VICTOR COIN — Badges System v2
   Auto-awarded · Rarity tiers · Max 3 shown on profile
   Tappable by other players (name only shown)
=================================================== */

/* RARITY TIERS — auto-tagged on each badge
   common    → grey/white     — easy to get
   rare      → blue           — moderate effort
   epic      → purple         — significant grind
   legendary → gold/orange    — extreme or unique
   special   → pink/teal      — event / admin only  */

var BADGE_DEFS = [

  /* ------------ SPECIAL / ADMIN ------------ */
  {
    id:'og',        name:'OG',                  emoji:'🌟', rarity:'special',
    desc:'One of the first 100 players',
    color:'#FFD60A', manual:true
  },
  {
    id:'nothorses',  name:'Not Horses',          emoji:'🎖', rarity:'special',
    desc:'Win 5 rounds of Squid Game',
    color:'#FF2D55',
    condition:function(g){ return !!g.squidWin5; }
  },
  {
    id:'titlegifted', name:'Title Gifted',       emoji:'🎀', rarity:'special',
    desc:'Receive 100 gifts from different users',
    color:'#BF5AF2',
    condition:function(g){ return g.giftCount && g.giftCount >= 100; }
  },
  {
    id:'clockit',   name:'Clock It',             emoji:'👌', rarity:'special',
    desc:'Have 3 name template effects',
    color:'#5AC8FA',
    condition:function(g){
      if(!g.vault||!g.vault.items) return false;
      return g.vault.items.filter(function(id){return id.indexOf('nt_')===0;}).length>=3;
    }
  },

  /* ------------ COMMON ------------ */
  {
    id:'veteran',   name:'Veteran',             emoji:'⚔️', rarity:'common',
    desc:'Reached Veteran rank (50K VK)',
    color:'#5AC8FA',
    condition:function(g){return g.vk>=50000;}
  },
  {
    id:'builder',   name:'Builder',             emoji:'🏗️', rarity:'common',
    desc:'Owns a home',
    color:'#CD7F32',
    condition:function(g){return g.build&&g.build.homes&&g.build.homes.length>=1;}
  },
  {
    id:'staker',    name:'Staker',              emoji:'📈', rarity:'common',
    desc:'Placed 5 stakes',
    color:'#FF453A',
    condition:function(g){return g.stake&&(g.stake.wins+g.stake.losses)>=5;}
  },
  {
    id:'hyperstarter', name:'Hyper Squad Starter', emoji:'🪅', rarity:'common',
    desc:'Own 1 Enigma skill',
    color:'#FF9F0A',
    condition:function(g){return g.en&&(g.en.bc&&g.en.bc.active||g.en.ce&&g.en.ce.active||g.en.xm&&g.en.xm.active);}
  },

  /* ------------ RARE ------------ */
  {
    id:'explorer',  name:'Explorer',            emoji:'🗺️', rarity:'rare',
    desc:'Explored all 5 map locations',
    color:'#30D158',
    condition:function(g){return g.ex&&g.ex.locVisits&&g.ex.locVisits.every(function(v){return v>=1;});}
  },
  {
    id:'collector', name:'Collector',           emoji:'🏛️', rarity:'rare',
    desc:'Has 3+ artifacts in vault',
    color:'#64D2FF',
    condition:function(g){return g.ex&&g.ex.vault&&g.ex.vault.length>=3;}
  },
  {
    id:'social',    name:'Social',              emoji:'👥', rarity:'rare',
    desc:'Has 20 or more friends',
    color:'#BF5AF2',
    condition:function(g){return g.friendCount&&g.friendCount>=20;}
  },
  {
    id:'glitter',   name:'Glitter',             emoji:'🪩', rarity:'rare',
    desc:'Own 5 Mall items',
    color:'#64D2FF',
    condition:function(g){return g.vault&&g.vault.items&&g.vault.items.length>=5;}
  },
  {
    id:'prismatic', name:'Prismatic Player',    emoji:'🎴', rarity:'rare',
    desc:'Member for 2 years',
    color:'#FF6EC7',
    condition:function(g){return g.joinedAt&&(Date.now()-g.joinedAt)>=2*365*24*60*60*1000;}
  },
  {
    id:'hyperbravery', name:'Hyper Squad Bravery', emoji:'🗽', rarity:'rare',
    desc:'Explore 10 times total',
    color:'#30D158',
    condition:function(g){var t=0;if(g.ex&&g.ex.locVisits)g.ex.locVisits.forEach(function(v){t+=v||0;});return t>=10;}
  },
  {
    id:'housebooster', name:'House Booster',    emoji:'🪀', rarity:'rare',
    desc:'Upgrade your home 3 times',
    color:'#FF9F0A',
    condition:function(g){return g.build&&g.build.upgrades&&g.build.upgrades>=3;}
  },
  {
    id:'particlebadge', name:'Particle Badge',  emoji:'☄️', rarity:'rare',
    desc:'Own 4 particles from the Mall',
    color:'#64D2FF',
    condition:function(g){
      if(!g.vault||!g.vault.items) return false;
      return g.vault.items.filter(function(id){return id.indexOf('ptc_')===0;}).length>=4;
    }
  },

  /* ------------ EPIC ------------ */
  {
    id:'rich',      name:'Rich',                emoji:'💰', rarity:'epic',
    desc:'Earned 10 million VK',
    color:'#FF9F0A',
    condition:function(g){return g.vk>=10000000;}
  },
  {
    id:'victortycoon', name:'Victor Tycoon',    emoji:'💎', rarity:'epic',
    desc:'Reach 15,000 Diamonds',
    color:'#5AC8FA',
    condition:function(g){return g.dia>=15000;}
  },
  {
    id:'hyperbrilliance', name:'Hyper Squad Brilliance', emoji:'🧭', rarity:'epic',
    desc:'Own 5 artifacts',
    color:'#BF5AF2',
    condition:function(g){return g.ex&&g.ex.vault&&g.ex.vault.length>=5;}
  },
  {
    id:'hyperbalance', name:'Hyper Squad Balance',   emoji:'🛸', rarity:'epic',
    desc:'Own 3 Enigma skills',
    color:'#64D2FF',
    condition:function(g){
      if(!g.en) return false;
      var count=0;
      if(g.en.bc&&g.en.bc.active) count++;
      if(g.en.ce&&g.en.ce.active) count++;
      if(g.en.xm&&(g.en.xm.active||g.en.xm.cdEnd)) count++;
      return count>=3;
    }
  },
  {
    id:'whoami',    name:'Who Am I',             emoji:'🎭', rarity:'epic',
    desc:'Changed your bio 50 times',
    color:'#FF6EC7',
    condition:function(g){return g.bioChanges&&g.bioChanges>=50;}
  },
  {
    id:'duobadge',  name:'Duo Badge',            emoji:'🎎', rarity:'epic',
    desc:'Gifted 10 different friends',
    color:'#FF9F0A',
    condition:function(g){return g.giftCount&&g.giftCount>=10;}
  },
  {
    id:'enigmabadge', name:'Enigma Badge',       emoji:'🔮', rarity:'epic',
    desc:'Own all Enigma items',
    color:'#BF5AF2',
    condition:function(g){
      if(!g.en) return false;
      return g.en.bc&&g.en.bc.active&&g.en.ce&&g.en.ce.active&&g.en.xm&&(g.en.xm.active||g.en.xm.cdEnd);
    }
  },

  /* ------------ LEGENDARY ------------ */
  {
    id:'victapper', name:'Vic.Tapper',           emoji:'🛎', rarity:'legendary',
    desc:'Own 1 billion VK coins',
    color:'#FFD60A',
    condition:function(g){return g.vk>=1000000000;}
  },
  {
    id:'lostfromlight', name:'Lost From Light',  emoji:'👹', rarity:'legendary',
    desc:'Obtained the Sunny Mask artifact',
    color:'#FF453A',
    condition:function(g){return g.ex&&g.ex.vault&&g.ex.vault.some(function(a){return (a.name||a||'').toLowerCase().includes('sunny');});}
  },
  {
    id:'iqtoohigh',  name:'IQ Too High',         emoji:'🏅', rarity:'legendary',
    desc:'Stake AND win 20 times',
    color:'#FFD60A',
    condition:function(g){return g.stake&&g.stake.wins>=20&&g.stake.losses+g.stake.wins>=20;}
  },
  {
    id:'frozenorbiter', name:'Frozen Orbiter',   emoji:'❄️', rarity:'legendary',
    desc:'Bought the Frozen profile animation',
    color:'#64D2FF',
    condition:function(g){return g.vault&&g.vault.items&&g.vault.items.indexOf('ptc_snow')!==-1;}
  }
];

/* -- RARITY CONFIG -- */
var RARITY_CFG = {
  common:    { label:'Common',    color:'#8E8E93', glow:'rgba(142,142,147,0.3)' },
  rare:      { label:'Rare',      color:'#0A84FF', glow:'rgba(10,132,255,0.35)' },
  epic:      { label:'Epic',      color:'#BF5AF2', glow:'rgba(191,90,242,0.35)' },
  legendary: { label:'Legendary', color:'#FFD60A', glow:'rgba(255,214,10,0.4)'  },
  special:   { label:'Special',   color:'#FF6EC7', glow:'rgba(255,110,199,0.35)'}
};

/* -- INIT -- */
function initBadges(){
  if(!G.badges) G.badges=[];
}

/* -- CHECK & AUTO-AWARD -- */
function checkBadges(){
  initBadges();
  var changed=false;
  BADGE_DEFS.forEach(function(b){
    if(b.manual) return;
    if(G.badges.indexOf(b.id)===-1&&b.condition&&b.condition(G)){
      G.badges.push(b.id);
      changed=true;
      showBadgeUnlock(b);
    }
  });
  if(changed){ sv(); if(typeof fbSave==='function') fbSave(); }
}

function showBadgeUnlock(badge){
  var rc=RARITY_CFG[badge.rarity]||RARITY_CFG.common;
  var ov=document.createElement('div');
  ov.className='ach-notif';
  ov.innerHTML='<div class="ach-notif-inner">'
    +'<span style="font-size:1.5rem;">'+badge.emoji+'</span>'
    +'<div style="flex:1">'
    +'<div style="font-size:0.52rem;color:'+rc.color+';letter-spacing:1.5px;font-weight:700;">'+rc.label.toUpperCase()+' BADGE EARNED</div>'
    +'<div style="font-size:0.75rem;font-weight:700;margin-top:1px;color:'+badge.color+';">'+badge.name+'</div>'
    +'<div style="font-size:0.6rem;color:var(--text3);">'+badge.desc+'</div>'
    +'</div></div>';
  document.body.appendChild(ov);
  setTimeout(function(){ov.classList.add('ach-notif-out');setTimeout(function(){ov.remove();},500);},3800);
}

/* -- SELECT TOP 3 BADGES TO DISPLAY --
   Priority: legendary > epic > special > rare > common */
var RARITY_PRIORITY = {legendary:4, epic:3, special:2, rare:1, common:0};

function getTop3Badges(badgeIds){
  if(!badgeIds||!badgeIds.length) return [];
  var sorted = badgeIds.slice().sort(function(a,b){
    var ba=BADGE_DEFS.find(function(d){return d.id===a;})||{};
    var bb=BADGE_DEFS.find(function(d){return d.id===b;})||{};
    return (RARITY_PRIORITY[bb.rarity]||0)-(RARITY_PRIORITY[ba.rarity]||0);
  });
  return sorted.slice(0,3);
}

/* -- RENDER BADGE PILLS (max 3, emoji only on profile — name on tap) -- */
function renderBadgePills(playerData, maxShow){
  var bids = playerData.badges||[];
  if(!bids.length) return '';
  var top3  = getTop3Badges(bids);
  var extra = bids.length - top3.length;
  var isOwnProfile = (playerData.email === (typeof G!=='undefined'?G.email:''));

  var html = top3.map(function(bid){
    var b = BADGE_DEFS.find(function(d){return d.id===bid;})||{emoji:'🏷️',name:bid,color:'#888',rarity:'common'};
    var rc= RARITY_CFG[b.rarity]||RARITY_CFG.common;
    return '<span class="badge-pill badge-pill-'+b.rarity+'" '
      +'style="border-color:'+b.color+'33;color:'+b.color+';box-shadow:0 0 6px '+rc.glow+';" '
      +'onclick="showBadgeInfo(\''+bid+'\')" title="'+b.name+'">'
      +b.emoji+'</span>';
  }).join('');

  if(extra>0){
    html+='<span class="badge-pill" style="color:var(--text3);font-size:0.58rem;">+'+extra+'</span>';
  }
  return html;
}

/* -- SHOW BADGE INFO (name only for other players) -- */
function showBadgeInfo(bid){
  var b=BADGE_DEFS.find(function(d){return d.id===bid;});
  if(!b) return;
  var rc=RARITY_CFG[b.rarity]||RARITY_CFG.common;
  // Show name + rarity — no desc leaked to other players
  toast(b.emoji+' '+b.name+' · '+rc.label, b.color||'#FFD60A');
}

/* -- RENDER BADGES TAB (full view for own profile) -- */
function renderBadgesTab(body){
  initBadges();
  checkBadges();
  var myBadges=G.badges||[];

  // Group by rarity
  var groups={legendary:[],epic:[],special:[],rare:[],common:[]};
  BADGE_DEFS.forEach(function(b){
    var r=b.rarity||'common';
    if(groups[r]) groups[r].push(b);
  });
  var rarityOrder=['legendary','epic','special','rare','common'];

  var h='<div style="padding:0 16px 30px;">'
    +'<div class="soc-sec-title">🏷️ Badges</div>'
    +'<div class="soc-sec-sub">Only your top 3 (by rarity) show on your profile. Tap any badge on a player profile to see its name.</div>';

  rarityOrder.forEach(function(rarity){
    var list=groups[rarity];
    if(!list.length) return;
    var rc=RARITY_CFG[rarity];
    h+='<div class="badge-rarity-hdr" style="color:'+rc.color+';border-color:'+rc.color+'33;">'
      +'<span class="badge-rarity-dot" style="background:'+rc.color+';box-shadow:0 0 6px '+rc.glow+';"></span>'
      +rc.label
      +'</div>'
      +'<div class="badges-grid">';

    list.forEach(function(b){
      var owned=myBadges.indexOf(b.id)!==-1;
      var isTop3=owned&&getTop3Badges(myBadges).indexOf(b.id)!==-1;
      h+='<div class="badge-card '+(owned?'badge-card-own':'badge-card-locked-glass')+'" '
        +'style="border-color:'+(owned?b.color+'55':'rgba(255,255,255,0.06)')+';'
        +(owned?'box-shadow:0 0 12px '+RARITY_CFG[b.rarity].glow+';':'')+'">'
        +(owned?'':'<div class="badge-gold-particles" id="bgp_'+b.id+'"></div>')
        +(isTop3?'<div class="badge-top3-tag">Top 3</div>':'')
        +'<div class="badge-card-ico" style="opacity:'+(owned?'1':'0.3')+';">'+b.emoji+'</div>'
        +'<div class="badge-card-name" style="color:'+(owned?b.color:'rgba(255,255,255,0.2)')+'">'
        +b.name+'</div>'
        +'<div class="badge-rarity-tag" style="color:'+rc.color+';background:'+rc.color+'18;border-color:'+rc.color+'33;">'+rc.label+'</div>'
        +'<div class="badge-card-desc" style="opacity:'+(owned?'0.85':'0.15')+'">'+b.desc+'</div>'
        +(owned
          ?'<div class="badge-checkmark" style="background:'+b.color+';box-shadow:0 0 8px '+RARITY_CFG[b.rarity].glow+';">✓</div>'
          :'<div class="badge-card-locked">🔒</div>')
        +(b.manual&&!owned?'<div style="font-size:0.5rem;color:rgba(255,255,255,0.18);margin-top:2px;">Admin awarded</div>':'')
        +'</div>';
    });
    h+='</div>';
  });

  h+='<div style="font-size:0.62rem;color:var(--text3);text-align:center;margin-top:18px;line-height:1.9;">'
    +'Badges unlock automatically when criteria are met.<br/>'
    +'Your highest-rarity 3 badges display on your profile.</div>'
    +'</div>';

  body.innerHTML=h;
  setTimeout(function(){
    BADGE_DEFS.forEach(function(b){
      if(myBadges.indexOf(b.id)===-1) animateBadgeParticles('bgp_'+b.id);
    });
  },80);
}

function animateBadgeParticles(containerId){
  var el=document.getElementById(containerId);
  if(!el) return;
  for(var i=0;i<5;i++){
    var dot=document.createElement('div');
    dot.className='badge-gold-dot';
    dot.style.left=Math.random()*90+'%';
    dot.style.animationDelay=(Math.random()*3.5)+'s';
    dot.style.animationDuration=(1.8+Math.random()*2)+'s';
    el.appendChild(dot);
  }
}
