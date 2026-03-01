/* ===================================================
   EXPLORE SYSTEM v2 — Victor Coin
   Map · Vault · Artifacts · Build · Build Ranks
=================================================== */

/* -- ARTIFACTS (1k VK flat bonus) -- */
var ARTIFACTS = [
  {id:'vring',  name:'Victor Ring',  ico:'💍', rarity:'Legendary', desc:'Forged in the fires of Victor\'s vault. Worn only by true champions.',    vkBonus:1000, diaBonus:0},
  {id:'eagle',  name:'Eagle',        ico:'🦅', rarity:'Epic',      desc:'The spirit of the eagle — fierce, free, untamed.',                        vkBonus:1000, diaBonus:0},
  {id:'carpet', name:'Magic Carpet', ico:'🪄', rarity:'Rare',      desc:'Woven from starlight and ancient silk.',                                   vkBonus:1000, diaBonus:0},
  {id:'golem',  name:'Golem',        ico:'🗿', rarity:'Epic',      desc:'A stone colossus awakened by ancient magic. Unstoppable.',                 vkBonus:1000, diaBonus:0},
  {id:'gmask',  name:'Goblin Mask',  ico:'👺', rarity:'Uncommon',  desc:'Crafted by mischievous goblins. Grants cunning beyond measure.',           vkBonus:1000, diaBonus:0},
  {id:'smask',  name:'Sunny Mask',   ico:'☀️', rarity:'Rare',      desc:'A golden mask radiating warmth. Only the pure of heart can bear it.',     vkBonus:1000, diaBonus:0},
  {id:'dboots', name:'Demon Boots',  ico:'👢', rarity:'Epic',      desc:'Forged in the underworld. Each step scorches the earth.',                  vkBonus:1000, diaBonus:0},
  {id:'gspoon', name:'Golden Spoon', ico:'🥄', rarity:'Legendary', desc:'Solid gold, impossibly rare. Stirred the first pot of VK coins.',         vkBonus:1000, diaBonus:0}
];

var RARITY_CHANCE = {'Legendary':0.005,'Epic':0.008,'Rare':0.012,'Uncommon':0.018};

/* -- MAP LOCATIONS -- */
/* visitsRequired = times you must explore THIS location before next unlocks */
var MAP_LOCS = [
  {id:0, name:"Vic Tomb",    emoji:'🏛️', x:22, y:20,
   desc:'Trap-filled dungeon. Rare loot awaits the brave.',
   flavor:'Dark corridors echo with ancient warnings…',
   visitsRequired:5,  unlockMsg:''},
  {id:1, name:"Vic Docks",   emoji:'⚓', x:65, y:15,
   desc:'Trade hub and mission launcher. Busy, loud, dangerous.',
   flavor:'The smell of salt and deals in the air…',
   visitsRequired:5,  unlockMsg:'Complete Vic Tomb 5× to access'},
  {id:2, name:"Vic Haven",   emoji:'🏡', x:18, y:62,
   desc:'Safe zone for healing and upgrades. Not forever safe.',
   flavor:'A moment of peace before the storm…',
   visitsRequired:5,  unlockMsg:'Complete Vic Docks 5× to access'},
  {id:3, name:"Vic Citadel", emoji:'🏰', x:72, y:55,
   desc:'Endgame fortress with elite bosses. Enter at your own risk.',
   flavor:'Its walls have never been breached… until now.',
   visitsRequired:20, unlockMsg:'Complete Vic Haven 5× to access'},
  {id:4, name:"Vic Abyss",   emoji:'🕳️', x:48, y:82,
   desc:'Dark void. High coins, but drains everything.',
   flavor:'No light. No map. No mercy.',
   visitsRequired:20, unlockMsg:'Complete Vic Citadel 20× to access'}
];

/* Explore cost tiers per location visit count */
var EXPLORE_COSTS = [5000,20000,70000,100000,200000,500000,1000000,5000000,10000000,50000000];
function getExploreCost(totalCount){
  var idx=Math.min(totalCount, EXPLORE_COSTS.length-1);
  return EXPLORE_COSTS[idx];
}

var EX_DURATION = 3*60*60*1000; // 3 hours

/* -- BUILD SYSTEM -- */
var HOMES = [
  {
    id:'apt', name:'Simple Apartment', emoji:'🏠',
    price:50000, upgradeCost:50000, securityCost:900000000,
    npcCost:100000, maxNpc:2, maxUpgrades:3,
    desc:'A humble beginning. Small but yours.',
    robLoss:500000
  },
  {
    id:'villa', name:'Modern Villa', emoji:'🏘️',
    price:30000000, upgradeCost:300000000, securityCost:1000000000,
    npcCost:200000, maxNpc:10, maxUpgrades:3,
    desc:'Sleek, modern, enviable.',
    robLoss:500000
  },
  {
    id:'cyber', name:'Cyber Elk Villa', emoji:'🏙️',
    price:4000000000, upgradeCost:49000000000, securityCost:12000000000,
    npcCost:900000, maxNpc:50, maxUpgrades:3,
    desc:'The pinnacle of VK architecture.',
    robLoss:500000
  }
];

var BUILD_RANKS = [
  {name:'Vic Builder',     emoji:'🔨', req:1},
  {name:'Vic Engineer',    emoji:'⚙️', req:3},
  {name:'Vic Constructor', emoji:'🏗️', req:6},
  {name:'Vic Planner',     emoji:'📐', req:10},
  {name:'Vic Master',      emoji:'👑', req:15}
];

/* -- INIT STATE -- */
function initExplore(){
  if(!G.ex){
    G.ex={
      totalExplores:0,
      locVisits:[0,0,0,0,0],
      activeLocId:null, exploreStart:0, exploring:false,
      vault:[], lastResult:null
    };
  } else {
    if(!G.ex.locVisits)  G.ex.locVisits=[0,0,0,0,0];
    if(!G.ex.vault)      G.ex.vault=[];
    if(typeof G.ex.totalExplores==='undefined') G.ex.totalExplores=0;
    if(typeof G.ex.exploring==='undefined')     G.ex.exploring=false;
  }
  if(!G.build){
    G.build={
      homes:[],       // [{id, upgrades, hassecurity, npcs, boughtAt, lastRobCheck}]
      totalUpgrades:0,
      pendingNpc:null // {homeId, startTime, fee}
    };
  } else {
    if(!G.build.homes)  G.build.homes=[];
    if(!G.build.pendingNpc) G.build.pendingNpc=null;
    if(typeof G.build.totalUpgrades==='undefined') G.build.totalUpgrades=0;
  }
  checkRobTimer();
  checkNpcTimer();
}

/* -- LOCATION UNLOCK LOGIC -- */
function isLocUnlocked(locId){
  if(locId===0) return true;
  var prev=MAP_LOCS[locId-1];
  return (G.ex.locVisits[locId-1]||0)>=prev.visitsRequired;
}

/* -- OVERLAY NAV -- */
function openExplore(){
  try{
    initExplore();
    var ov=document.getElementById('exploreOverlay');
    if(!ov){console.error('exploreOverlay not found');return;}
    ov.style.display='flex';
    exNav('explore');
  }catch(e){console.error('openExplore error:',e);}
}
function closeExplore(){
  document.getElementById('exploreOverlay').style.display='none';
  cancelAnimationFrame(_artPAnim);
  clearInterval(_exTimer);
}
var _exTab='explore';
function exNav(tab){
  _exTab=tab;
  ['explore','vault','artifacts','build','buildranks'].forEach(function(t){
    var btn=document.getElementById('exnav-'+t);
    var sec=document.getElementById('expg-'+t);
    if(btn) btn.classList.toggle('exnav-on',t===tab);
    if(sec) sec.style.display=(t===tab)?'block':'none';
  });
  if(tab==='explore')    renderExploreMap();
  if(tab==='vault')      renderVault();
  if(tab==='artifacts')  renderArtifacts();
  if(tab==='build')      renderBuild();
  if(tab==='buildranks') renderBuildRanks();
}

/* -- MAP RENDER -- */
var _selLoc=null;
function renderExploreMap(){
  var cost=getExploreCost(G.ex.totalExplores);
  st('exCost',fm(cost)+' VK');
  st('exCount',G.ex.totalExplores+' total explorations');
  var mapEl=document.getElementById('exMap');
  if(!mapEl) return;
  if(G.ex.exploring){renderExploreProgress();return;}
  var pins='';
  MAP_LOCS.forEach(function(loc){
    var unlocked=isLocUnlocked(loc.id);
    var visits=G.ex.locVisits[loc.id]||0;
    var cls='exppin '+(unlocked?'exppin-un':'exppin-lk');
    if(_selLoc===loc.id) cls+=' exppin-sel';
    pins+='<div class="'+cls+'" style="left:'+loc.x+'%;top:'+loc.y+'%;" onclick="selectLoc('+loc.id+')">'
      +'<span class="exppin-ico">'+loc.emoji+'</span>'
      +'<span class="exppin-nm">'+loc.name+'</span>'
      +(unlocked?'<span class="exppin-vst">'+visits+'×</span>':'')
      +(!unlocked?'<span class="exppin-locked-txt">'+loc.unlockMsg+'</span>':'')
      +'</div>';
  });
  mapEl.innerHTML=pins;
  renderSelectedLoc();
}

function selectLoc(id){
  _selLoc=id;
  renderExploreMap();
}

function renderSelectedLoc(){
  var el=document.getElementById('exLocInfo');
  if(!el) return;
  if(_selLoc===null){el.innerHTML='<div class="exhint">👆 Tap a location on the map</div>';return;}
  var loc=MAP_LOCS[_selLoc];
  var unlocked=isLocUnlocked(loc.id);
  var visits=G.ex.locVisits[_selLoc]||0;
  var cost=getExploreCost(G.ex.totalExplores);
  var can=G.vk>=cost;
  var h='<div class="exloccard">'
    +'<div class="exlocico">'+loc.emoji+'</div>'
    +'<div class="exloci">'
    +'<div class="exlocn">'+loc.name+'</div>'
    +'<div class="exlocs" style="font-family:\'Courier New\',monospace;font-style:italic;color:var(--text3);">'+loc.flavor+'</div>'
    +'<div class="exlocd">'+loc.desc+'</div>'
    +(unlocked?'<div style="font-size:0.6rem;color:var(--teal);margin-top:3px;">Explored '+visits+'× / '+loc.visitsRequired+'× required</div>':'')
    +'</div></div>';
  if(!unlocked){
    h+='<div class="exlock-notice">🔒 '+loc.unlockMsg+'</div>';
  } else {
    h+='<button class="exbtn-go'+(can?'':' exbtn-dis')+'" '+(G.ex.exploring?'disabled':'')+' onclick="startExplore('+_selLoc+')">'
      +'🗺️ EXPLORE — '+fm(cost)+' VK</button>'
      +(!can?'<div class="exneed">Need '+fm(cost-G.vk)+' more VK</div>':'')
      +'<div class="exwarn">⚠️ 3hr wait · Artifact drop 0.5–1.8% · Not guaranteed</div>';
  }
  el.innerHTML=h;
}

/* -- START EXPLORE -- */
function startExplore(locId){
  if(G.ex.exploring){toast('Already exploring!','#FF9F0A');return;}
  if(!isLocUnlocked(locId)){toast('Location locked!','#FF453A');return;}
  var cost=getExploreCost(G.ex.totalExplores);
  if(G.vk<cost){toast('Need '+fm(cost)+' VK','#FF453A');return;}
  G.vk-=cost;
  G.ex.exploring=true;
  G.ex.activeLocId=locId;
  G.ex.exploreStart=Date.now();
  G.ex.totalExplores++;
  sv(); renderAll();
  renderExploreProgress();
  startExploreTimer();
  toast('🗺️ Exploring '+MAP_LOCS[locId].name+'! Back in 3 hours.','#5AC8FA');
}

/* -- TIMER -- */
var _exTimer=null;
function startExploreTimer(){
  clearInterval(_exTimer);
  _exTimer=setInterval(function(){
    if(!G.ex||!G.ex.exploring){clearInterval(_exTimer);return;}
    var elapsed=Date.now()-G.ex.exploreStart;
    var pct=Math.min(100,(elapsed/EX_DURATION)*100);
    var bar=document.getElementById('exProgressBar');
    if(bar) bar.style.width=pct+'%';
    var tel=document.getElementById('exTimeLeft');
    if(tel){var rem=Math.max(0,EX_DURATION-elapsed);tel.textContent=rem>0?fmT(Math.ceil(rem/1000))+' remaining':'Revealing...';}
    if(elapsed>=EX_DURATION){clearInterval(_exTimer);finishExplore();}
  },1000);
}

/* -- FINISH EXPLORE -- */
function finishExplore(){
  if(!G.ex||!G.ex.exploring) return;
  var locId=G.ex.activeLocId;
  G.ex.locVisits[locId]=(G.ex.locVisits[locId]||0)+1;
  var unowned=ARTIFACTS.filter(function(a){return G.ex.vault.indexOf(a.id)===-1;});
  var earned=null;
  for(var i=0;i<unowned.length;i++){
    var ch=RARITY_CHANCE[unowned[i].rarity]||0.01;
    if(Math.random()<ch){earned=unowned[i];break;}
  }
  if(earned){
    G.ex.vault.push(earned.id);
    G.vk+=earned.vkBonus;
    if(earned.diaBonus>0) G.dia+=earned.diaBonus;
  }
  G.ex.exploring=false;
  G.ex.activeLocId=null;
  sv(); renderAll();
  showExploreResult(!!earned,earned,locId);
  renderExploreMap();
}

function showExploreResult(got,art,locId){
  var loc=MAP_LOCS[locId]||MAP_LOCS[0];
  var ov=document.createElement('div');
  ov.className='mov';
  var nextLoc=MAP_LOCS[locId+1];
  var nowUnlocked=nextLoc&&isLocUnlocked(locId+1)&&(G.ex.locVisits[locId]===MAP_LOCS[locId].visitsRequired);
  var unlockNote=nowUnlocked?'<div style="color:var(--green);font-size:0.72rem;font-weight:700;margin-top:8px;">🔓 '+nextLoc.name+' is now unlocked!</div>':'';
  if(got&&art){
    ov.innerHTML='<div class="mb" style="border-color:rgba(255,214,10,0.5);box-shadow:0 0 60px rgba(255,214,10,0.2);">'
      +'<div style="font-size:3.8rem;margin-bottom:10px;animation:artifactReveal 0.7s cubic-bezier(0.34,1.56,0.64,1);">'+art.ico+'</div>'
      +'<div style="font-size:0.65rem;letter-spacing:3px;color:var(--gold);font-weight:700;margin-bottom:4px;">ARTIFACT DISCOVERED</div>'
      +'<div style="font-size:1.2rem;font-weight:800;color:var(--text);margin-bottom:4px;">'+art.name+'</div>'
      +'<div class="rarity-'+art.rarity.toLowerCase()+'" style="font-size:0.65rem;font-weight:700;letter-spacing:1.5px;margin-bottom:10px;">✨ '+art.rarity.toUpperCase()+'</div>'
      +'<div style="font-size:0.72rem;color:var(--text2);margin-bottom:10px;font-style:italic;">'+art.desc+'</div>'
      +'<div style="color:var(--gold);font-size:0.75rem;font-weight:700;margin-bottom:8px;">+'+fm(art.vkBonus)+' VK added to wallet!</div>'
      +unlockNote
      +'<div class="mbts"><button class="mok" onclick="this.closest(\'.mov\').remove();exNav(\'vault\')">VIEW VAULT 🏛️</button>'
      +'<button class="mcan" onclick="this.closest(\'.mov\').remove()">Continue</button></div></div>';
  } else {
    ov.innerHTML='<div class="mb">'
      +'<span class="mico">🗺️</span>'
      +'<div class="mttl">Exploration Complete</div>'
      +'<div class="mbdy">You searched <strong>'+loc.name+'</strong> thoroughly…<br/><br/>'
      +'Nothing found this time. The artifacts remain hidden.<br/><br/>'
      +'<span style="color:var(--text3);font-size:0.68rem;">Visits: '+G.ex.locVisits[locId]+'× · Next cost: '+fm(getExploreCost(G.ex.totalExplores))+' VK</span></div>'
      +unlockNote
      +'<div class="mbts"><button class="mok" onclick="this.closest(\'.mov\').remove()">Keep Hunting</button></div></div>';
  }
  document.body.appendChild(ov);
}

/* -- EXPLORE PROGRESS -- */
function renderExploreProgress(){
  var mapEl=document.getElementById('exMap');
  if(!mapEl) return;
  var elapsed=Date.now()-G.ex.exploreStart;
  var pct=Math.min(100,(elapsed/EX_DURATION)*100);
  var rem=Math.max(0,EX_DURATION-elapsed);
  var loc=MAP_LOCS[G.ex.activeLocId];
  mapEl.innerHTML='<div class="exprogwrap">'
    +'<div style="font-size:3rem;margin-bottom:12px;animation:maskFloat 3s ease-in-out infinite;">'+(loc?loc.emoji:'🗺️')+'</div>'
    +'<div style="font-size:0.86rem;font-weight:700;color:var(--text);margin-bottom:4px;">Exploring '+(loc?loc.name:'...')+'</div>'
    +'<div style="font-size:0.68rem;color:var(--text2);margin-bottom:18px;font-family:\'Courier New\',monospace;font-style:italic;">'+(loc?loc.flavor:'...')+'</div>'
    +'<div class="exprogtrack"><div class="exprogbar" id="exProgressBar" style="width:'+pct+'%;"></div></div>'
    +'<div id="exTimeLeft" style="font-size:0.72rem;color:var(--teal);margin-top:10px;font-weight:600;">'+(rem>0?fmT(Math.ceil(rem/1000))+' remaining':'Revealing...')+'</div>'
    +'<div style="font-size:0.6rem;color:var(--text3);margin-top:8px;">🔒 One exploration at a time</div>'
    +'</div>';
  var li=document.getElementById('exLocInfo');
  if(li) li.innerHTML='';
  if(rem>0) startExploreTimer();
  else setTimeout(finishExplore,500);
}

/* -- VAULT -- */
function renderVault(){
  var el=document.getElementById('expg-vault');
  if(!el) return;
  var vault=G.ex.vault||[];
  if(vault.length===0){
    el.innerHTML='<div class="vaultempty"><div style="font-size:3.5rem;margin-bottom:14px;opacity:0.2;">🏛️</div>'
      +'<div style="font-size:0.86rem;font-weight:600;color:var(--text2);">Your vault is empty</div>'
      +'<div style="font-size:0.72rem;color:var(--text3);margin-top:8px;line-height:1.7;">Explore the map to discover artifacts.<br/>They are extremely rare — stay persistent.</div></div>';
    return;
  }
  var h='<div class="vaultgrid">';
  vault.forEach(function(id){
    var art=ARTIFACTS.find(function(a){return a.id===id;});
    if(!art) return;
    h+='<div class="vaultitem">'
      +'<div class="vaultglass"><div class="vaultshine"></div><div class="vaultart-ico">'+art.ico+'</div></div>'
      +'<div class="vaultart-n">'+art.name+'</div>'
      +'<div class="vaultart-r rarity-'+art.rarity.toLowerCase()+'">'+art.rarity+'</div>'
      +'<div class="vaultbonus tg">+'+fm(art.vkBonus)+' VK</div>'
      +'</div>';
  });
  h+='</div><div style="text-align:center;margin-top:18px;font-size:0.65rem;color:var(--text3);">'+vault.length+' / '+ARTIFACTS.length+' artifacts collected</div>';
  el.innerHTML=h;
}

/* -- ARTIFACTS PAGE -- */
function renderArtifacts(){
  var el=document.getElementById('expg-artifacts');
  if(!el) return;
  var vault=G.ex.vault||[];
  var h='<canvas id="artParticleCanvas" class="artparticlecv"></canvas><div class="artgrid">';
  ARTIFACTS.forEach(function(art){
    var owned=vault.indexOf(art.id)!==-1;
    h+='<div class="artcase '+(owned?'artcase-owned':'artcase-locked')+'">'
      +'<div class="artglass-case"><div class="artglass-shine"></div><div class="artglass-ref"></div>'
      +'<div class="artcase-ico '+(owned?'':'artcase-hidden')+'">'+art.ico+'</div>'
      +(!owned?'<div class="artcase-lock">🔒</div>':'')
      +'</div>'
      +'<div class="artcase-name">'+art.name+'</div>'
      +'<div class="artcase-rarity rarity-'+art.rarity.toLowerCase()+'">'+art.rarity+'</div>'
      +(owned
        ?'<div class="artcase-owned-badge">✅ OWNED</div><div class="artcase-bonus tg">+'+fm(art.vkBonus)+' VK</div>'
        :'<div class="artcase-mystery">??? · Find it to reveal</div>')
      +'</div>';
  });
  h+='</div>';
  el.innerHTML=h;
  setTimeout(startArtParticles,80);
}

/* -- BLUE GLITTER PARTICLES -- */
var _artPAnim=null;
function startArtParticles(){
  var cv=document.getElementById('artParticleCanvas');
  if(!cv) return;
  var cx=cv.getContext('2d');
  var W,H,pts=[];
  function resize(){var wrap=document.getElementById('expg-artifacts');if(!wrap)return;W=cv.width=wrap.offsetWidth||window.innerWidth;H=cv.height=Math.max(wrap.offsetHeight,400);}
  resize();
  for(var i=0;i<120;i++){pts.push({x:Math.random()*W,y:Math.random()*H,r:0.4+Math.random()*2.2,vx:(Math.random()-0.5)*0.4,vy:-0.2-Math.random()*0.7,ph:Math.random()*6.28,spd:0.015+Math.random()*0.035,hue:190+Math.floor(Math.random()*50),sparkle:Math.random()>0.6});}
  cancelAnimationFrame(_artPAnim);
  function draw(){
    if(!document.getElementById('artParticleCanvas')){cancelAnimationFrame(_artPAnim);return;}
    _artPAnim=requestAnimationFrame(draw);
    cx.clearRect(0,0,W,H);
    pts.forEach(function(p){
      p.ph+=p.spd;p.x+=p.vx;p.y+=p.vy;
      if(p.y<-10){p.y=H+5;p.x=Math.random()*W;}
      if(p.x<-10)p.x=W+5;if(p.x>W+10)p.x=-5;
      var op=0.25+0.75*Math.abs(Math.sin(p.ph));
      cx.fillStyle=Math.sin(p.ph*4)>0.6?'rgba(220,240,255,'+(op*0.95)+')':'hsla('+p.hue+',100%,72%,'+op+')';
      cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.28);cx.fill();
      if(p.sparkle&&p.r>1.4){var sl=p.r*2.5;cx.strokeStyle='rgba(100,210,255,'+(op*0.45)+')';cx.lineWidth=0.6;cx.beginPath();cx.moveTo(p.x-sl,p.y);cx.lineTo(p.x+sl,p.y);cx.moveTo(p.x,p.y-sl);cx.lineTo(p.x,p.y+sl);cx.stroke();}
    });
  }
  draw();
}

/* ========================================
   BUILD SYSTEM
======================================== */

function getHomeState(homeId){
  return G.build.homes.find(function(h){return h.id===homeId;})||null;
}

function renderBuild(){
  var el=document.getElementById('expg-build');
  if(!el) return;
  checkRobTimer();
  var h='<div class="buildrank-bar">'
    +'<div style="font-size:0.65rem;color:var(--text3);margin-bottom:2px;">BUILD RANK</div>'
    +'<div style="font-size:0.86rem;font-weight:700;color:var(--gold);">'+getBuildRank().emoji+' '+getBuildRank().name+'</div>'
    +'<div style="font-size:0.6rem;color:var(--text3);margin-top:2px;">'+G.build.totalUpgrades+' total upgrades</div>'
    +'</div>';
  HOMES.forEach(function(home){
    var hs=getHomeState(home.id);
    var owned=!!hs;
    h+='<div class="homec '+(owned?'homec-owned':'')+'">';
    h+='<div class="homehdr"><div class="homeico">'+home.emoji+'</div>'
      +'<div class="homei"><div class="homen">'+home.name+'</div>'
      +'<div class="homed">'+home.desc+'</div>'
      +(owned?'<div style="font-size:0.62rem;color:var(--green);margin-top:2px;">✅ Owned · '+hs.npcs+'/'+home.maxNpc+' NPCs · '+hs.upgrades+'/'+home.maxUpgrades+' upgrades</div>':'<div class="homep">'+fm(home.price)+' VK</div>')
      +'</div></div>';
    if(!owned){
      h+='<button class="homebtn homebtn-buy" onclick="buyHome(\''+home.id+'\')">🏠 BUY — '+fm(home.price)+' VK</button>';
    } else {
      var fullyUpgraded=hs.upgrades>=home.maxUpgrades;
      h+='<div class="homebts">';
      if(fullyUpgraded){
        h+='<button class="homebtn homebtn-full" onclick="showFullUpgrade()">👌 Fully Upgraded</button>';
      } else {
        h+='<button class="homebtn homebtn-up" onclick="upgradeHome(\''+home.id+'\')">⬆️ Upgrade — '+fm(home.upgradeCost)+' VK</button>';
      }
      h+='<button class="homebtn homebtn-sec '+(hs.hasSecurity?'homebtn-sec-owned':'')+'" onclick="buySecurity(\''+home.id+'\')">'
        +(hs.hassecurity?'🔐 Secured':'🔒 Security — '+fm(home.securityCost)+' VK')+'</button>';
      h+='<button class="homebtn homebtn-npc" onclick="inviteNpc(\''+home.id+'\')">'
        +'👤 Invite NPC — '+fm(home.npcCost)+' VK</button>';
      h+='</div>';
      if(G.build.pendingNpc&&G.build.pendingNpc.homeId===home.id){
        var elapsed=Date.now()-G.build.pendingNpc.startTime;
        var rem=Math.max(0,50*60*1000-elapsed);
        h+='<div class="npc-pending">⏳ NPC invite pending: '+fmT(Math.ceil(rem/1000))+'</div>';
      }
    }
    h+='</div>';
  });
  el.innerHTML=h;
}

function getBuildRank(){
  var upg=G.build.totalUpgrades||0;
  var rank=BUILD_RANKS[0];
  for(var i=BUILD_RANKS.length-1;i>=0;i--){if(upg>=BUILD_RANKS[i].req){rank=BUILD_RANKS[i];break;}}
  return rank;
}

/* -- BUY HOME -- */
function buyHome(homeId){
  var home=HOMES.find(function(h){return h.id===homeId;});
  if(!home) return;
  if(G.vk<home.price){toast('Need '+fm(home.price)+' VK','#FF453A');return;}
  if(getHomeState(homeId)){toast('Already owned!','#FF9F0A');return;}
  G.vk-=home.price;
  G.build.homes.push({id:homeId,upgrades:0,hasecurity:false,npcs:0,boughtAt:Date.now(),lastRobCheck:Date.now()});
  sv(); renderAll();
  renderBuild();
  // Theft warning notification
  showTheftWarning(home);
  toast('🏠 '+home.name+' purchased!','#30D158');
}

function showTheftWarning(home){
  var ov=document.createElement('div');
  ov.className='mov';
  ov.innerHTML='<div class="mb" style="border-color:rgba(255,159,10,0.4);">'
    +'<div style="font-size:2.5rem;margin-bottom:6px;">😊</div>'
    +'<div class="mttl" style="color:var(--orange);">Congratulations!</div>'
    +'<div class="mbdy">'
    +'<div style="background:rgba(255,69,58,0.08);border:1px solid rgba(255,69,58,0.25);border-radius:12px;padding:12px;margin-bottom:10px;">'
    +'<div style="font-size:0.75rem;color:var(--red);font-weight:700;margin-bottom:4px;">⚠️ BEWARE OF THIEVES</div>'
    +'<div style="font-size:0.7rem;color:var(--text2);line-height:1.6;">Dear user, please buy security for your <strong>'+home.name+'</strong>. Without it, your home may be robbed after 60 hours!</div>'
    +'</div>'
    +'<div style="font-size:0.68rem;color:var(--text3);">Security cost: '+fm(home.securityCost)+' VK</div>'
    +'</div>'
    +'<div class="mbts">'
    +'<button class="mok" onclick="this.closest(\'.mov\').remove();buySecurity(\''+home.id+'\')">🔒 Buy Security Now</button>'
    +'<button class="mcan" onclick="this.closest(\'.mov\').remove()">Later</button>'
    +'</div></div>';
  document.body.appendChild(ov);
}

/* -- UPGRADE HOME -- */
function upgradeHome(homeId){
  var home=HOMES.find(function(h){return h.id===homeId;});
  var hs=getHomeState(homeId);
  if(!home||!hs) return;
  if(hs.upgrades>=home.maxUpgrades){toast('Already fully upgraded!','#FF9F0A');return;}
  if(G.vk<home.upgradeCost){toast('Need '+fm(home.upgradeCost)+' VK','#FF453A');return;}
  G.vk-=home.upgradeCost;
  hs.upgrades++;
  G.build.totalUpgrades++;
  sv(); renderAll(); renderBuild();
  toast('⬆️ '+home.name+' upgraded! ('+hs.upgrades+'/'+home.maxUpgrades+')','#30D158');
}

function showFullUpgrade(){
  toast('🏠 This home is fully upgraded! 👌','#FFD60A');
}

/* -- BUY SECURITY -- */
function buySecurity(homeId){
  var home=HOMES.find(function(h){return h.id===homeId;});
  var hs=getHomeState(homeId);
  if(!home||!hs) return;
  if(hs.hasecurity){toast('Security already active!','#FF9F0A');return;}
  if(G.vk<home.securityCost){toast('Need '+fm(home.securityCost)+' VK','#FF453A');return;}
  G.vk-=home.securityCost;
  hs.hasecurity=true;
  sv(); renderAll(); renderBuild();
  toast('🔐 Security purchased for '+home.name+'!','#30D158');
}

/* -- INVITE NPC -- */
var _npcTimer=null;
function inviteNpc(homeId){
  var home=HOMES.find(function(h){return h.id===homeId;});
  var hs=getHomeState(homeId);
  if(!home||!hs){toast('Buy the home first!','#FF453A');return;}
  if(hs.npcs>=home.maxNpc){toast('NPC capacity full!','#FF9F0A');return;}
  if(G.build.pendingNpc){toast('Already have a pending invite!','#FF9F0A');return;}
  if(G.vk<home.npcCost){toast('Need '+fm(home.npcCost)+' VK','#FF453A');return;}
  G.vk-=home.npcCost;
  G.build.pendingNpc={homeId:homeId,startTime:Date.now(),fee:home.npcCost};
  sv(); renderAll(); renderBuild();
  toast('👤 NPC invite sent! Reply in 50 minutes.','#5AC8FA');
  startNpcTimer();
}

function startNpcTimer(){
  clearInterval(_npcTimer);
  _npcTimer=setInterval(function(){
    checkNpcTimer();
  },10000);
}

function checkNpcTimer(){
  if(!G.build||!G.build.pendingNpc) return;
  var elapsed=Date.now()-G.build.pendingNpc.startTime;
  if(elapsed>=50*60*1000){
    resolveNpc();
  }
}

function resolveNpc(){
  if(!G.build.pendingNpc) return;
  var inv=G.build.pendingNpc;
  var home=HOMES.find(function(h){return h.id===inv.homeId;});
  var hs=getHomeState(inv.homeId);
  G.build.pendingNpc=null;
  var accepted=Math.random()<0.5; // 50/50
  if(accepted&&hs&&hs.npcs<home.maxNpc){
    hs.npcs++;
    sv();
    showNpcResult(true,home);
  } else {
    sv();
    showNpcResult(false,home);
  }
  clearInterval(_npcTimer);
  renderBuild();
}

function showNpcResult(accepted,home){
  var ov=document.createElement('div');
  ov.className='mov';
  if(accepted){
    ov.innerHTML='<div class="mb" style="border-color:rgba(48,209,88,0.4);">'
      +'<div style="font-size:3rem;margin-bottom:8px;">🎉</div>'
      +'<div class="mttl" style="color:var(--green);">NPC Accepted!</div>'
      +'<div class="mbdy">A new resident has moved into your <strong>'+home.name+'</strong>!<br/><br/>They bring life and energy to your property.</div>'
      +'<div class="mbts"><button class="mok" onclick="this.closest(\'.mov\').remove()">Welcome them!</button></div></div>';
  } else {
    ov.innerHTML='<div class="mb" style="border-color:rgba(255,69,58,0.3);">'
      +'<div style="font-size:3rem;margin-bottom:8px;">😔</div>'
      +'<div class="mttl" style="color:var(--red);">NPC Declined</div>'
      +'<div class="mbdy">The NPC rejected your invitation to <strong>'+home.name+'</strong>.<br/><br/><span style="font-size:0.68rem;color:var(--text3);">Your invite fee was spent. Try again!</span></div>'
      +'<div class="mbts"><button class="mok" onclick="this.closest(\'.mov\').remove()">Try Again</button></div></div>';
  }
  document.body.appendChild(ov);
}

/* -- ROB TIMER -- */
function checkRobTimer(){
  if(!G.build||!G.build.homes) return;
  G.build.homes.forEach(function(hs){
    if(hs.hasecurity) return;
    var elapsed=Date.now()-(hs.lastRobCheck||hs.boughtAt||Date.now());
    if(elapsed>=60*60*60*1000){
      hs.lastRobCheck=Date.now();
      var loss=G.vk>=500000?500000:Math.floor(G.vk/2);
      G.vk=Math.max(0,G.vk-loss);
      sv(); renderAll();
      var home=HOMES.find(function(h){return h.id===hs.id;})||{name:'your home'};
      showRobNotice(home.name,loss);
    }
  });
}

function showRobNotice(homeName,loss){
  var ov=document.createElement('div');
  ov.className='mov';
  ov.innerHTML='<div class="mb" style="border-color:rgba(255,69,58,0.5);box-shadow:0 0 40px rgba(255,69,58,0.15);">'
    +'<div style="font-size:3rem;margin-bottom:8px;">🥷</div>'
    +'<div class="mttl" style="color:var(--red);">Your Home Was Robbed!</div>'
    +'<div class="mbdy"><strong>'+homeName+'</strong> had no security and was broken into.<br/><br/>'
    +'<span style="color:var(--red);font-weight:700;">−'+fm(loss)+' VK</span> stolen from your wallet.<br/><br/>'
    +'<span style="font-size:0.7rem;color:var(--text3);">Buy security immediately to prevent future robberies!</span></div>'
    +'<div class="mbts">'
    +'<button class="mok" onclick="this.closest(\'.mov\').remove();exNav(\'build\')">🔒 Buy Security</button>'
    +'<button class="mcan" onclick="this.closest(\'.mov\').remove()">Dismiss</button>'
    +'</div></div>';
  document.body.appendChild(ov);
}

/* -- BUILD RANKS -- */
function renderBuildRanks(){
  var el=document.getElementById('expg-buildranks');
  if(!el) return;
  var cur=getBuildRank();
  var upg=G.build.totalUpgrades||0;
  var h='<div class="g gg tc" style="margin-bottom:14px;">'
    +'<div style="font-size:0.6rem;color:var(--text3);letter-spacing:1.5px;margin-bottom:4px;">YOUR BUILD RANK</div>'
    +'<div style="font-size:2rem;margin-bottom:4px;">'+cur.emoji+'</div>'
    +'<div style="font-size:1rem;font-weight:800;color:var(--gold);">'+cur.name+'</div>'
    +'<div style="font-size:0.65rem;color:var(--text3);margin-top:4px;">'+upg+' total upgrades across all homes</div>'
    +'</div>';
  BUILD_RANKS.forEach(function(rank,i){
    var achieved=upg>=rank.req;
    var isCur=cur.name===rank.name;
    h+='<div class="rrow '+(isCur?'rc':'')+'">'
      +'<div class="remi">'+rank.emoji+'</div>'
      +'<div><div class="rn" style="'+(achieved?'color:var(--gold)':'')+'">'+(i+1)+'. '+rank.name+'</div>'
      +'<div class="rq">Requires '+rank.req+' total upgrades</div></div>'
      +(achieved?'<div class="ry">EARNED</div>':'<div style="margin-left:auto;font-size:0.65rem;color:var(--text3);">'+Math.max(0,rank.req-upg)+' more</div>')
      +'</div>';
  });
  el.innerHTML=h;
}

/* -- TICK -- */
function tickExplore(){
  if(G.ex&&G.ex.exploring){
    var elapsed=Date.now()-G.ex.exploreStart;
    if(elapsed>=EX_DURATION) finishExplore();
  }
  checkNpcTimer();
}
