/* ===================================================
   VICTOR COIN — Victor Servers
   Join servers, earn SCP every 4hrs
   1 SCP = 200 VK
   Badge appears beside player name
=================================================== */

var SERVER_DEFS = [
  {
    id:'fate',   name:'FATE',   emoji:'💓',
    desc:'A community for all Victor Coin players.',
    price:5000,  rankReq:null,
    color:'#FF2D55',
    members:0
  },
  {
    id:'csm',    name:'CSM',    emoji:'🗡️',
    desc:'Chain Saw Man — for the battle-hardened.',
    price:100000, rankReq:'⚔️ Veteran',
    color:'#FF9F0A',
    members:0
  },
  {
    id:'lotm',   name:'LOTM',   emoji:'♠️',
    desc:'Lord of the Mysteries — for the elite.',
    price:100000, rankReq:'👑 Master',
    color:'#BF5AF2',
    members:0
  }
];

var SCP_PER_CLAIM = 1;
var SCP_INTERVAL  = 4 * 60 * 60 * 1000; // 4 hours
var SCP_TO_VK     = 200; // 1 SCP = 200 VK

/* -- INIT -- */
function initServers(){
  if(!G.server) G.server={id:null, joinedAt:null, scp:0, lastClaim:null};
}

function getPlayerServer(){
  initServers();
  return G.server.id ? SERVER_DEFS.find(function(s){return s.id===G.server.id;}) : null;
}

/* -- RANK CHECK -- */
function meetsRankReq(rankReq){
  if(!rankReq) return true;
  var order=['🌱 Newbie','⚔️ Veteran','🔥 Pro','👑 Master','🌟 Legend'];
  var myRank=typeof getRk==='function'?getRk().n:'🌱 Newbie';
  var myIdx=order.indexOf(myRank);
  var reqIdx=order.indexOf(rankReq);
  return myIdx>=reqIdx;
}

/* -- JOIN SERVER -- */
function joinServer(id){
  initServers();
  var sv2=SERVER_DEFS.find(function(s){return s.id===id;});
  if(!sv2){toast('Server not found','#FF453A');return;}
  if(G.server.id===id){toast('Already a member!','#FF9F0A');return;}
  if(G.server.id){toast('Leave your current server first','#FF9F0A');return;}
  if(!meetsRankReq(sv2.rankReq)){toast('Rank requirement: '+sv2.rankReq,'#FF453A');return;}
  if(G.vk<sv2.price){toast('Need '+fm(sv2.price)+' VK to join','#FF453A');return;}

  G.vk-=sv2.price;
  G.server={id:id, joinedAt:Date.now(), scp:G.server.scp||0, lastClaim:Date.now()};
  sv(); renderAll();
  if(typeof fbSave==='function') fbSave();

  // Update Firebase server member count
  fbReady&&fbReady(function(){
    _db&&_db.collection('servers').doc(id).set(
      {members:firebase.firestore.FieldValue.increment(1)},{merge:true}
    ).catch(function(){});
    // Save server to player doc
    _db&&_db.collection('players').doc(playerDocId(G.email))
      .update({server:id,scp:G.server.scp}).catch(function(){});
  });

  toast('💓 Joined '+sv2.name+'!', sv2.color);
  renderServersPage();
}

/* -- LEAVE SERVER -- */
function leaveServer(){
  initServers();
  if(!G.server.id){toast('Not in a server','#FF9F0A');return;}
  var sv2=getPlayerServer();
  var ov=document.createElement('div');ov.className='mov';
  ov.innerHTML='<div class="mb"><span class="mico">'+(sv2?sv2.emoji:'🚪')+'</span>'
    +'<div class="mttl">Leave '+( sv2?sv2.name:'Server')+'?</div>'
    +'<div class="mbdy">You will lose your server membership. Your SCP balance stays.<br/><strong style="color:var(--red);">Entry fee is not refunded.</strong></div>'
    +'<div class="mbts"><button class="mok" style="background:var(--red)" onclick="confirmLeaveServer();this.closest(\'.mov\').remove()">Leave</button>'
    +'<button class="mcan" onclick="this.closest(\'.mov\').remove()">Cancel</button></div></div>';
  document.body.appendChild(ov);
}

function confirmLeaveServer(){
  initServers();
  var id=G.server.id;
  G.server.id=null; G.server.joinedAt=null;
  sv();
  fbReady&&fbReady(function(){
    _db&&_db.collection('servers').doc(id).set(
      {members:firebase.firestore.FieldValue.increment(-1)},{merge:true}
    ).catch(function(){});
    _db&&_db.collection('players').doc(playerDocId(G.email))
      .update({server:null}).catch(function(){});
  });
  toast('Left server','#FF9F0A');
  renderServersPage();
}

/* -- CLAIM SCP -- */
function claimScp(){
  initServers();
  if(!G.server.id){toast('Join a server first','#FF453A');return;}
  var now=Date.now();
  var elapsed=now-(G.server.lastClaim||0);
  if(elapsed<SCP_INTERVAL){
    var rem=SCP_INTERVAL-elapsed;
    var h=Math.floor(rem/3600000);
    var m=Math.floor((rem%3600000)/60000);
    toast('⏳ Next SCP in '+h+'h '+m+'m','#FF9F0A');
    return;
  }
  var earned=Math.floor(elapsed/SCP_INTERVAL)*SCP_PER_CLAIM;
  G.server.scp=(G.server.scp||0)+earned;
  G.server.lastClaim=now;
  sv();
  if(typeof fbSave==='function') fbSave();
  toast('💫 +'+earned+' SCP collected!','#BF5AF2');
  renderServersPage();
}

/* -- EXCHANGE SCP → VK -- */
function exchangeScp(){
  initServers();
  var scp=G.server.scp||0;
  if(scp<1){toast('No SCP to exchange','#FF9F0A');return;}
  var vkGained=scp*SCP_TO_VK;
  G.vk+=vkGained;
  G.server.scp=0;
  sv(); renderAll();
  if(typeof fbSave==='function') fbSave();
  toast('💰 Exchanged '+scp+' SCP → '+fm(vkGained)+' VK!','#30D158');
  renderServersPage();
}

/* -- SCP TIMER STATUS -- */
function getScpStatus(){
  initServers();
  if(!G.server.id) return null;
  var elapsed=Date.now()-(G.server.lastClaim||0);
  var ready=elapsed>=SCP_INTERVAL;
  var rem=SCP_INTERVAL-elapsed;
  var h=Math.floor(Math.max(0,rem)/3600000);
  var m=Math.floor((Math.max(0,rem)%3600000)/60000);
  var pending=Math.floor(elapsed/SCP_INTERVAL);
  return {ready:ready, pendingScp:pending, h:h, m:m};
}

/* -- SERVER BADGE PILL -- */
function serverBadgePill(serverId){
  if(!serverId) return '';
  var sv2=SERVER_DEFS.find(function(s){return s.id===serverId;});
  if(!sv2) return '';
  return '<span class="server-badge" style="border-color:'+sv2.color+'33;color:'+sv2.color+';">'+sv2.emoji+' '+sv2.name+'</span>';
}

/* -- GET VICTOR (cosmetics upsell) section -- */
function buildGetVictor(){
  return '<div class="get-victor-banner">'
    +'<div class="gvb-top"><span style="font-size:1.3rem;">✨</span>'
    +'<div><div class="gvb-title">Get Victor+</div>'
    +'<div class="gvb-sub">Unlock exclusive profile cosmetics</div>'
    +'</div></div>'
    +'<div class="gvb-btns">'
    +'<button class="gvb-btn gvb-main" onclick="openMallCosmetics()">✨ Get Victor+</button>'
    +'<button class="gvb-btn gvb-mall" onclick="go(\'mall\',null)">🛍️ Mall</button>'
    +'</div></div>';
}

function openMallCosmetics(){
  go('mall',null);
  setTimeout(function(){
    var el=document.getElementById('mallCosmeticsSection');
    if(el) el.scrollIntoView({behavior:'smooth'});
  },300);
}

/* -- RENDER SERVERS PAGE -- */
function renderServersPage(){
  var el=document.getElementById('pg-servers');
  if(!el) return;
  initServers();
  var myServer=getPlayerServer();
  var scpStatus=getScpStatus();

  var h='<div class="servers-wrap">'
    +'<div class="servers-hdr">'
    +'<div class="srv-title">🌐 Victor Servers</div>'
    +'<div class="srv-sub">Join a server to earn SCP currency every 4 hours</div>'
    +'</div>';

  // SCP wallet if in server
  if(myServer){
    h+='<div class="scp-wallet">'
      +'<div class="scp-wallet-top">'
      +'<div>'
      +'<div class="scp-label">SCP Balance</div>'
      +'<div class="scp-val">💫 '+(G.server.scp||0)+' SCP</div>'
      +'<div class="scp-rate">1 SCP = '+SCP_TO_VK+' VK</div>'
      +'</div>'
      +'<div style="display:flex;flex-direction:column;gap:6px;">'
      +(scpStatus&&scpStatus.ready
        ?'<button class="scp-btn scp-claim" onclick="claimScp()">Collect SCP</button>'
        :'<button class="scp-btn scp-wait" disabled>⏳ '+( scpStatus?scpStatus.h+'h '+scpStatus.m+'m':'—')+'</button>')
      +(G.server.scp>0?'<button class="scp-btn scp-exchange" onclick="exchangeScp()">Exchange → VK</button>':'')
      +'</div>'
      +'</div>'
      +'<div style="font-size:0.62rem;color:var(--text3);margin-top:6px;">Server: <span style="color:'+myServer.color+';">'+myServer.emoji+' '+myServer.name+'</span>'
      +' · <span style="color:var(--red);cursor:pointer;" onclick="leaveServer()">Leave</span></div>'
      +'</div>';
  }

  h+='<div class="srv-list">';
  SERVER_DEFS.forEach(function(s){
    var joined=G.server.id===s.id;
    var canAfford=G.vk>=s.price;
    var meetsRank=meetsRankReq(s.rankReq);
    var canJoin=!G.server.id&&canAfford&&meetsRank;
    h+='<div class="srv-card '+(joined?'srv-card-joined':'')+'" style="border-color:'+(joined?s.color+'44':'rgba(255,255,255,0.08)')+'">'
      +'<div class="srv-card-top">'
      +'<div class="srv-ico" style="background:'+s.color+'22;border-color:'+s.color+'33;">'+s.emoji+'</div>'
      +'<div style="flex:1">'
      +'<div class="srv-name" style="color:'+(joined?s.color:'var(--text)')+'">'+s.name+(joined?' ✓':'')+' </div>'
      +'<div class="srv-desc">'+s.desc+'</div>'
      +'</div>'
      +'</div>'
      +'<div class="srv-meta">'
      +(s.rankReq?'<span class="srv-req">Req: '+s.rankReq+'</span>':'<span class="srv-req srv-req-free">No requirement</span>')
      +'<span class="srv-price">'+fm(s.price)+' VK</span>'
      +'</div>'
      +(joined?'<div class="srv-joined-badge">✅ You are a member</div>'
        :G.server.id?'<div class="srv-cantjoin">Leave current server first</div>'
        :!meetsRank?'<div class="srv-cantjoin">Rank too low: need '+s.rankReq+'</div>'
        :!canAfford?'<div class="srv-cantjoin">Need '+fm(s.price-G.vk)+' more VK</div>'
        :'<button class="srv-join-btn" style="border-color:'+s.color+'44;color:'+s.color+';" onclick="joinServer(\''+s.id+'\')">Join '+s.name+'</button>')
      +'</div>';
  });

  h+='</div></div>';
  el.innerHTML=h;
}
