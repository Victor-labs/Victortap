/* ANTI-INSPECT */
document.addEventListener('contextmenu',function(e){e.preventDefault();});
document.addEventListener('keydown',function(e){
  if(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&['I','J','C'].includes(e.key))||(e.ctrlKey&&e.key==='u')){e.preventDefault();return false;}
});

/* BG — cycling spotlight + colored particles */
try {
(function(){
  function _startBg(){
    var cv=document.getElementById('bgC');
    if(!cv||!cv.getContext){
      // bgC not ready yet — retry after DOM is loaded
      if(document.readyState==='loading'){
        document.addEventListener('DOMContentLoaded',_startBg);
      } else {
        setTimeout(_startBg,200);
      }
      return;
    }
    var cx=cv.getContext('2d');
  var W,H,ok=true,S=[],P=[],L=[],NB=[];
  // Spotlight cycling colours: gold, blue, green, red, orange, purple
  var SPOT_COLS=[[45,90,55],[210,85,65],[140,75,55],[0,80,60],[28,90,60],[270,75,60]];
  var spotIdx=0,spotTarget=1,spotBlend=0,spotSpeed=0.004;
  // Particle colour palettes matching spotlight
  var P_COLS=[
    [[240,192,64],[255,220,100],[200,160,40]],   // gold
    [[64,160,255],[100,200,255],[40,120,200]],   // blue
    [[64,200,100],[100,240,140],[40,160,80]],    // green
    [[255,80,80],[255,120,100],[200,50,50]],     // red
    [[255,160,40],[255,200,80],[200,120,20]],    // orange
    [[180,80,255],[220,120,255],[140,60,200]]    // purple
  ];
  var pColCur=P_COLS[0];

  function randPCol(){return pColCur[Math.floor(Math.random()*pColCur.length)];}

  function rsz(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;S=[];P=[];L=[];NB=[];
    for(var i=0;i<160;i++)S.push({x:Math.random()*W,y:Math.random()*H,r:.15+Math.random()*1.2,ph:Math.random()*6.28,sp:.004+Math.random()*.009});
    for(var i=0;i<28;i++){var col=randPCol();P.push({x:Math.random()*W,y:Math.random()*H,vy:-.1-Math.random()*.22,vx:(Math.random()-.5)*.1,r:.4+Math.random()*1.8,ph:Math.random()*6.28,da:.003+Math.random()*.005,col:col});}
    for(var i=0;i<20;i++){var a=Math.floor(Math.random()*S.length),b=Math.floor(Math.random()*S.length);L.push({a:a,b:b,ph:Math.random()*6.28,sp:.0015});}
    for(var i=0;i<3;i++)NB.push({x:Math.random()*W,y:Math.random()*H,r:180+Math.random()*200,ph:Math.random()*6.28,sp:.0009});
  }
  window.addEventListener('resize',rsz);rsz();
  document.addEventListener('visibilitychange',function(){ok=!document.hidden;});

  function lerpH(a,b,t){return a+(b-a)*t;}

  (function draw(){requestAnimationFrame(draw);if(!ok)return;
    // Advance spotlight blend
    spotBlend+=spotSpeed;
    if(spotBlend>=1){spotBlend=0;spotIdx=spotTarget;spotTarget=(spotTarget+1)%SPOT_COLS.length;pColCur=P_COLS[spotIdx];}
    var cA=SPOT_COLS[spotIdx],cB=SPOT_COLS[spotTarget];
    var curH=lerpH(cA[0],cB[0],spotBlend),curS=lerpH(cA[1],cB[1],spotBlend),curL=lerpH(cA[2],cB[2],spotBlend);
    var lineCol='hsla('+curH+','+curS+'%,'+curL+'%,';

    cx.clearRect(0,0,W,H);cx.fillStyle='#020409';cx.fillRect(0,0,W,H);

    // Spotlight
    NB.forEach(function(n){n.ph+=n.sp;var op=.018+.010*Math.sin(n.ph);
      var g=cx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);
      g.addColorStop(0,'hsla('+curH+','+curS+'%,'+curL+'%,'+op+')');g.addColorStop(1,'transparent');
      cx.fillStyle=g;cx.beginPath();cx.arc(n.x,n.y,n.r,0,6.28);cx.fill();});

    // Constellation lines
    L.forEach(function(l){l.ph+=l.sp;if(S[l.a]&&S[l.b]){
      cx.beginPath();cx.moveTo(S[l.a].x,S[l.a].y);cx.lineTo(S[l.b].x,S[l.b].y);
      cx.strokeStyle=lineCol+(0.022+0.016*Math.sin(l.ph))+')';cx.lineWidth=.5;cx.stroke();}});

    // Stars
    S.forEach(function(s){s.ph+=s.sp;var op=.12+.45*Math.abs(Math.sin(s.ph));
      cx.beginPath();cx.arc(s.x,s.y,s.r,0,6.28);cx.fillStyle='rgba(210,225,255,'+op+')';cx.fill();});

    // Coloured floating particles
    P.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.ph+=p.da;
      if(p.y<-8){p.y=H+8;p.x=Math.random()*W;p.col=randPCol();}if(p.x<-8)p.x=W+8;if(p.x>W+8)p.x=-8;
      var rc=p.col,al=0.07+0.12*Math.abs(Math.sin(p.ph));
      cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.28);
      cx.fillStyle='rgba('+rc[0]+','+rc[1]+','+rc[2]+','+al+')';cx.fill();});
  })();
  } // end _startBg
  _startBg();
})();
} catch(_bgErr) { console.warn("BG canvas init failed:", _bgErr.message); }


/* DATA */
var TP=[{r:1,c:5000,d:0},{r:3,c:25000,d:0},{r:6,c:80000,d:0},{r:9,c:200000,d:0},
  {r:11,c:500000,d:0},{r:14,c:1200000,d:0},{r:20,c:3000000,d:0},{r:25,c:7000000,d:0},
  {r:20,c:0,d:2000},{r:25,c:0,d:5000}];
var FC=[{n:'Winter Industry',r:15,c:500},{n:'Hell Industry',r:35,c:10000},{n:'Stardust Industry',r:22,c:3500}];
var RK=[{n:'🌱 Newbie',q:0},{n:'⚔️ Veteran',q:50000},{n:'🔥 Pro',q:500000},{n:'👑 Master',q:5000000},{n:'🌟 Legend',q:50000000}];
var DPOOL=[15,25,35,30,60,25,18,35,400,120,40,22,10,12,500];
var CO=[{l:'₦1,000',q:1000000},{l:'₦2,000',q:100000000},{l:'₦5,000',q:100000000000},{l:'₦7,000',q:900000000000}];
var BOOSTS=[
  {id:'sr',name:'Speed Rush',ico:'🚀',desc:'+5 VK per tap',price:50000,dur:30*60},
  {id:'dr',name:'Diamond Rain',ico:'🌧️',desc:'+2 💎 every 60s',price:150000,dur:60*60},
  {id:'vs',name:'VK Surge',ico:'⚡',desc:'+50 VK/s auto',price:300000,dur:20*60},
  {id:'gr',name:'Gold Rush',ico:'💛',desc:'2x auto earnings',price:500000,dur:15*60}
];
var ACHS=[
  {n:'Click Bait',e:'🖱️',c:'Reach 10,000 VK',f:function(g){return g.vk>=10000;}},
  {n:'Cold Tapper',e:'🧊',c:'Tap 50 times',f:function(g){return g.taps>=50;}},
  {n:'Farmer',e:'⛏️',c:'Mine 40 diamonds total',f:function(g){return g.mined>=40;}},
  {n:'Steady Rhythm',e:'🎵',c:'Earn 20K VK within 6 min of login',f:function(){return false;}},
  {n:'Fury Tap',e:'💢',c:'Reach 200,000 VK',f:function(g){return g.vk>=200000;}},
  {n:'Organizer',e:'🏭',c:'Purchase 1 factory',f:function(g){return g.fac.filter(function(f){return f.b;}).length>=1;}},
  {n:'Mr. VK',e:'🎩',c:'Reach 500,000 VK',f:function(g){return g.vk>=500000;}},
  {n:'Hunter',e:'🏹',c:'Mine 200 diamonds total',f:function(g){return g.mined>=200;}},
  {n:'Evil Grin',e:'😈',c:'Own an Evil Tap tapper',f:function(g){return g.tap[8]||g.tap[9];}},
  {n:'Entrepreneur',e:'💼',c:'Own all 3 factories',f:function(g){return g.fac.filter(function(f){return f.b;}).length>=3;}},
  {n:'Cash Master',e:'💰',c:'Use any conversion plan',f:function(g){return g.planUsed;}},
  {n:'Tornado',e:'🌪️',c:'Activate 3 boosts',f:function(g){return g.boosted>=3;}},
  {n:'Hero',e:'🦸',c:'Reach 50,000 VK',f:function(g){return g.vk>=50000;}},
  {n:'Night Owl',e:'🦉',c:'Tap at 1AM',f:function(){return false;}},
  {n:'Dedicated Collector',e:'📅',c:'Claim daily reward 5 times',f:function(g){return g.dc>=5;}},
  {n:'Cashier',e:'🏧',c:'Reach 1,000,000 VK',f:function(g){return g.vk>=1000000;}},
  {n:'Daily Regulars',e:'📆',c:'Login 20 times',f:function(g){return g.logins>=20;}},
  {n:'Brother Vic',e:'👊',c:'Reach 50,000 VK',f:function(g){return g.vk>=50000;}},
  {n:'Winter Time',e:'❄️',c:'Activate Winter Industry',f:function(g){return g.fac[0].a;}},
  {n:'Santa',e:'🎅',c:'Purchase Winter Industry',f:function(g){return g.fac[0].b;}},
  {n:'Hell Bent',e:'😈',c:'Activate Hell Industry',f:function(g){return g.fac[1].a;}},
  {n:'Son of Darkness',e:'🖤',c:'Purchase Hell Industry',f:function(g){return g.fac[1].b;}},
  {n:'VK Master',e:'🔱',c:'Reach 2,000,000 VK',f:function(g){return g.vk>=2000000;}},
  {n:'Business Minds',e:'🏙️',c:'Purchase 3+ factories',f:function(g){return g.fac.filter(function(f){return f.b;}).length>=3;}},
  {n:'Tycoon',e:'💎',c:'Use any conversion plan',f:function(g){return g.planUsed;}},
  {n:'Banked',e:'🏦',c:'Own the Auto Miner Bot',f:function(g){return g.bot;}},
  {n:'Lights On',e:'💡',c:'Activate any factory',f:function(g){return g.fac.some(function(f){return f.a;});}},
  {n:'Ruaushi',e:'✨',c:'Purchase Stardust Industry',f:function(g){return g.fac[2].b;}},
  {n:'Star & Moon',e:'🌙',c:'Activate Stardust Industry',f:function(g){return g.fac[2].a;}},
  {n:'Master of Currency',e:'👑',c:'Mine 900 diamonds total',f:function(g){return g.mined>=900;}},
  {n:'Scavenger Hunt',e:'🎒',c:'Own 2 artifacts',f:function(g){return g.ex&&g.ex.vault&&g.ex.vault.length>=2;}},
  {n:'Tomber',e:'⚰️',c:'Explore 1 map location',f:function(g){return g.ex&&g.ex.totalExplores>=1;}},
  {n:'Detective Vic',e:'🕵️',c:'Explore Vic Abyss',f:function(g){return g.ex&&(g.ex.locVisits[4]||0)>=1;}},
  {n:'Ranger',e:'🏹',c:'Mine 500 diamonds',f:function(g){return g.mined>=500;}},
  {n:'Homeowner',e:'🏠',c:'Buy 1 home',f:function(g){return g.build&&g.build.homes.length>=1;}},
  {n:'Vic.Builder',e:'🏗️',c:'Own 3 homes',f:function(g){return g.build&&g.build.homes.length>=3;}},
  {n:'Safe House',e:'🛡️',c:'Have 1 NPC in your home',f:function(g){return g.build&&g.build.homes.some(function(h){return h.npcs>=1;});}},
  {n:'Rainy Days',e:'🌧️',c:'Get robbed once',f:function(g){return g.build&&g.build.wasRobbed;}},
  {n:'Mod.Vic',e:'🔐',c:'Buy security for a home',f:function(g){return g.build&&g.build.homes.some(function(h){return h.hasecurity;});}},
  {n:'Wormhole',              e:'🌀', c:'Explore Vic Haven 2 times',          f:function(g){return g.ex&&(g.ex.locVisits[2]||0)>=2;}},
  {n:'The hunt begins',       e:'🔍', c:'Start your first exploration',         f:function(g){return g.ex&&g.ex.totalExplores>=1;}},
  {n:'My mood',               e:'😎', c:'Add something to your bio',             f:function(g){return !!(g.bio&&g.bio.length>0);}},
  {n:'master staker',         e:'📈', c:'Stake up a million VK coins total',    f:function(g){return g.stake&&g.stake.totalStaked>=1000000;}},
  {n:'Vic.player',            e:'🗺️', c:'Explore all 5 map locations',           f:function(g){return g.ex&&g.ex.locVisits&&g.ex.locVisits.every(function(v){return v>=1;});}},
  {n:'No stopping me',        e:'🏆', c:'Enter leaderboard 4 times',            f:function(g){return g.lbViews&&g.lbViews>=4;}},
  {n:'Light bringer',         e:'✨', c:'Earn 4 artifacts',                      f:function(g){return g.ex&&g.ex.vault&&g.ex.vault.length>=4;}},
  {n:'Enigmared',             e:'🎭', c:'Own 1 Enigma skill',                   f:function(g){return g.en&&(g.en.bc.unlocked||g.en.ce.unlocked||g.en.xm.unlocked);}},
  {n:'Nightmares',            e:'💀', c:'Lose 4 times in staking',              f:function(g){return g.stake&&g.stake.losses>=4;}},
  {n:'Welcome to tapping society',e:'🪙',c:'Own 20,000 VK coins',             f:function(g){return g.vk>=20000;}},
  {n:'Connect to the world I',e:'👥', c:'Have 5 friends',                       f:function(g){return g.friendCount&&g.friendCount>=5;}},
  {n:'Connect to the world II',e:'🤝',c:'Have 15 friends',                     f:function(g){return g.friendCount&&g.friendCount>=15;}},
  {n:'Connect to the world III',e:'🌍',c:'Have 40 friends',                    f:function(g){return g.friendCount&&g.friendCount>=40;},reward:{vk:50000}},
  {n:'Lone star',             e:'⭐', c:'Get 5 likes on your profile',          f:function(g){return g.likes&&g.likes>=5;}},
  {n:'Superstar',             e:'🌟', c:'Get 100 likes on your profile',        f:function(g){return g.likes&&g.likes>=100;}},
  {n:'Vic loves malls',       e:'🛍️', c:'Buy all Mall items before it closes',  f:function(g){return g.mall&&g.mall.boughtAll;}},
  {n:'Staking like a pro',    e:'💹', c:'Win 10 stakes',                        f:function(g){return g.stake&&g.stake.wins>=10;}},
  {n:'Enigmatic',             e:'🔮', c:'Own 2 Enigma skills',                  f:function(g){var ct=0;if(g.en){if(g.en.bc.unlocked)ct++;if(g.en.ce.unlocked)ct++;if(g.en.xm.unlocked)ct++;}return ct>=2;}},
  {n:'Bot orders',            e:'🤖', c:'Buy the Auto Miner Bot',               f:function(g){return g.bot;}},
  {n:'All roads are Vic roads',e:'🛣️',c:'Explore 5 times',                     f:function(g){return g.ex&&g.ex.totalExplores>=5;},reward:{vk:10000}},
  {n:'OK the vault is open',  e:'🏛️', c:'Have 1 item in vault',                 f:function(g){return g.ex&&g.ex.vault&&g.ex.vault.length>=1;}},
  {n:'Vic.collector',         e:'🎒', c:'Have 20 items in vault',               f:function(g){return g.ex&&g.ex.vault&&g.ex.vault.length>=20;}},
  {n:'Life of a sim',    e:'🛍️', c:'Buy your first item in the Mall',    f:function(g){return g.vault&&g.vault.items&&g.vault.items.length>=1;}, reward:{dia:5}},
  {n:'Premium feel',     e:'🌟', c:'Buy your first profile particle',     f:function(g){return g.vault&&g.vault.items&&g.vault.items.some(function(id){return id.indexOf('ptc_')===0;});}},
  {n:'SCP synced',       e:'🌐', c:'Join a Victor Server',                f:function(g){return g.server&&!!g.server.id;}},
  /* -- GAME ACHIEVEMENTS -- */
  {n:'Streak Expert',     e:'😌', c:'Get a 20-streak in any game',             f:function(g){return !!g.gameStreak20;}},
  {n:'Red Light, Green Light',e:'🎠',c:'Play Squid Game',                     f:function(g){return !!g.playedSquid;}},
  {n:'Vic Time',          e:'⏰', c:'Spend 20 minutes on any game',            f:function(g){return !!(g.gameMins&&g.gameMins>=20);}},
  {n:'Flagged a Liker',   e:'🏁', c:'Like 10 profiles',                        f:function(g){return !!(g.likesGiven&&g.likesGiven>=10);}},
];
/* -- ACH CATEGORIES — flat, always visible -- */
var ACH_CATS = [
  {
    key:'tapping', label:'⚡ Tapping', emoji:'⚡',
    ids:[
      'Click Bait','Cold Tapper','Fury Tap','Hero','Mr. VK','Cashier',
      'VK Master','Welcome to tapping society','Brother Vic',
      'Tornado','Banked','Bot orders','Business Minds'
    ]
  },
  {
    key:'mining', label:'💎 Mining & Currency', emoji:'💎',
    ids:[
      'Farmer','Hunter','Ranger','Master of Currency',
      'Tycoon','Cash Master','Dedicated Collector','Daily Regulars',
      'Night Owl','Steady Rhythm'
    ]
  },
  {
    key:'industries', label:'🏭 Industries', emoji:'🏭',
    ids:[
      'Organizer','Entrepreneur','Lights On',
      'Winter Time','Santa','Hell Bent','Son of Darkness',
      'Ruaushi','Star & Moon'
    ]
  },
  {
    key:'exploration', label:'🗺️ Exploration', emoji:'🗺️',
    ids:[
      'The hunt begins','Tomber','Wormhole','Detective Vic',
      'Vic.player','All roads are Vic roads',
      'Scavenger Hunt','Light bringer','OK the vault is open','Vic.collector'
    ]
  },
  {
    key:'build', label:'🏠 Build', emoji:'🏠',
    ids:['Homeowner','Vic.Builder','Safe House','Rainy Days','Mod.Vic']
  },
  {
    key:'mall', label:'🏗️ Mall', emoji:'🏗️',
    ids:['Life of a sim','Premium feel','Vic loves malls']
  },
  {
    key:'enigma', label:'🎭 Enigma', emoji:'🎭',
    ids:['Enigmared','Enigmatic','Evil Grin']
  },
  {
    key:'staking', label:'📈 Staking', emoji:'📈',
    ids:['master staker','Staking like a pro','Nightmares','SCP synced']
  },
  {
    key:'social', label:'🌐 Social', emoji:'🌐',
    ids:[
      'My mood','No stopping me',
      'Connect to the world I','Connect to the world II','Connect to the world III',
      'Lone star','Superstar','Flagged a Liker'
    ]
  },
  {
    key:'games', label:'🎮 Games', emoji:'🎮',
    ids:['Streak Expert','Red Light, Green Light','Vic Time']
  }
];
