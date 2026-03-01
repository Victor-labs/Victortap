/* ===================================================
   VICTOR COIN — Weekly Quests
   Resets every Monday 00:00
   Reward: Diamonds
   Add more quests to QUEST_DEFS easily
=================================================== */

/* -- ADD MORE QUESTS HERE -- */
var QUEST_DEFS = [
  {id:'tap1k',    title:'Tap Machine',      desc:'Tap 1,000 times this week',       emoji:'👆', target:1000, reward:5,  type:'taps'},
  {id:'explore3', title:'Wanderer',          desc:'Explore 3 map locations',          emoji:'🗺️', target:3,    reward:8,  type:'explores'},
  {id:'stake1',   title:'Risk Taker',        desc:'Place 1 stake this week',          emoji:'📈', target:1,    reward:6,  type:'stakes'},
  {id:'mall1',    title:'Mall Visitor',      desc:'Buy any item from the Mall',       emoji:'🛍️', target:1,    reward:5,  type:'mallBuys'},
  {id:'gift1',    title:'Generous Soul',     desc:'Send a gift to another player',    emoji:'🎁', target:1,    reward:10, type:'gifts'},
  {id:'chat5',    title:'Chatterbox',        desc:'Send 5 messages in Victor Chat',   emoji:'💬', target:5,    reward:7,  type:'chats'},
  /* -- ADD YOUR QUESTS BELOW -- */
];

/* -- WEEK KEY: YYYY-Www -- */
function getWeekKey(){
  var d=new Date();
  var jan1=new Date(d.getFullYear(),0,1);
  var week=Math.ceil(((d-jan1)/86400000+jan1.getDay()+1)/7);
  return d.getFullYear()+'-W'+String(week).padStart(2,'0');
}

/* -- INIT / RESET -- */
function initQuests(){
  var wk=getWeekKey();
  if(!G.quests||G.quests.week!==wk){
    G.quests={
      week:wk,
      progress:{},   // {questId: currentCount}
      claimed:{}     // {questId: true}
    };
    sv();
  }
}

function getQuestProgress(id){
  initQuests();
  return G.quests.progress[id]||0;
}
function isQuestDone(id){
  var q=QUEST_DEFS.find(function(d){return d.id===id;});
  if(!q) return false;
  return getQuestProgress(id)>=q.target;
}
function isQuestClaimed(id){ initQuests(); return !!G.quests.claimed[id]; }

/* -- INCREMENT QUEST PROGRESS -- */
function questProgress(type, amount){
  initQuests();
  amount=amount||1;
  QUEST_DEFS.forEach(function(q){
    if(q.type===type&&!isQuestClaimed(q.id)){
      G.quests.progress[q.id]=(G.quests.progress[q.id]||0)+amount;
      if(G.quests.progress[q.id]>q.target) G.quests.progress[q.id]=q.target;
    }
  });
  sv();
}

/* -- CLAIM REWARD -- */
function claimQuest(id){
  initQuests();
  var q=QUEST_DEFS.find(function(d){return d.id===id;});
  if(!q){toast('Quest not found','#FF453A');return;}
  if(!isQuestDone(id)){toast('Quest not complete yet!','#FF9F0A');return;}
  if(isQuestClaimed(id)){toast('Already claimed!','#FF9F0A');return;}
  G.quests.claimed[id]=true;
  G.dia+=q.reward;
  sv(); renderAll();
  if(typeof fbSave==='function') fbSave();
  toast('💎 +'+q.reward+' Diamonds claimed!','#5AC8FA');
  renderQuestsSection();
}

/* -- RENDER QUESTS (inside Player Info) -- */
function renderQuestsSection(){
  var el=document.getElementById('questsBody');
  if(!el) return;
  initQuests();

  var weekDone=QUEST_DEFS.filter(function(q){return isQuestClaimed(q.id);}).length;
  var totalDia=QUEST_DEFS.filter(function(q){return isQuestClaimed(q.id);})
    .reduce(function(s,q){return s+q.reward;},0);
  var maxDia=QUEST_DEFS.reduce(function(s,q){return s+q.reward;},0);

  // Week reset countdown
  var now=new Date();
  var nextMon=new Date(now);
  nextMon.setDate(now.getDate()+(8-now.getDay())%7||7);
  nextMon.setHours(0,0,0,0);
  var rem=nextMon-now;
  var remH=Math.floor(rem/3600000);
  var remM=Math.floor((rem%3600000)/60000);

  var h='<div class="quest-hdr">'
    +'<div class="quest-week">Week '+getWeekKey().split('-W')[1]+'</div>'
    +'<div class="quest-reset">Resets in '+remH+'h '+remM+'m</div>'
    +'<div class="quest-summary">'+weekDone+'/'+QUEST_DEFS.length+' done · 💎 '+totalDia+'/'+maxDia+' earned</div>'
    +'</div>'
    +'<div class="quest-list">';

  QUEST_DEFS.forEach(function(q){
    var prog=getQuestProgress(q.id);
    var done=isQuestDone(q.id);
    var claimed=isQuestClaimed(q.id);
    var pct=Math.min(100,Math.floor((prog/q.target)*100));

    h+='<div class="quest-row '+(claimed?'quest-claimed':done?'quest-done':'')+'">'
      +'<div class="quest-emoji">'+q.emoji+'</div>'
      +'<div class="quest-info">'
      +'<div class="quest-title">'+q.title+'</div>'
      +'<div class="quest-desc">'+q.desc+'</div>'
      +'<div class="quest-bar-wrap"><div class="quest-bar" style="width:'+pct+'%"></div></div>'
      +'<div class="quest-prog">'+prog+' / '+q.target+'</div>'
      +'</div>'
      +'<div class="quest-right">'
      +'<div class="quest-reward">+'+q.reward+' 💎</div>'
      +(claimed
        ?'<div class="quest-claimed-tag">✓ Done</div>'
        :done
          ?'<button class="quest-claim-btn" onclick="claimQuest(\''+q.id+'\')">Claim</button>'
          :'<div class="quest-pct">'+pct+'%</div>')
      +'</div>'
      +'</div>';
  });

  h+='</div>';
  el.innerHTML=h;
}
