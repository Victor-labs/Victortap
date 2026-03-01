/* VICTOR COIN — Achievements · Ranks · Player Info */
function checkAch(){
  if(!ACHS||!G.ach) return;
  var ch=false;
  for(var i=0;i<ACHS.length;i++){
    if(!G.ach[i]&&ACHS[i].f(G)){
      G.ach[i]=true; ch=true;
      var a=ACHS[i];
      // Reward achievements
      if(a.reward){
        if(a.reward.vk){G.vk+=a.reward.vk;}
        if(a.reward.dia){G.dia+=a.reward.dia;}
      }
      // Achievement notification banner
      (function(ach,hasReward,rewardVk){
        setTimeout(function(){
          var ov=document.createElement('div');
          ov.className='ach-notif';
          ov.innerHTML='<div class="ach-notif-inner">'
            +'<span style="font-size:1.5rem;">'+ach.e+'</span>'
            +'<div style="flex:1">'
            +'<div style="font-size:0.55rem;color:var(--gold);letter-spacing:1.5px;font-weight:700;">🏅 ACHIEVEMENT UNLOCKED</div>'
            +'<div style="font-size:0.75rem;font-weight:700;margin-top:1px;">'+ach.n+'</div>'
            +(hasReward?'<div style="font-size:0.6rem;color:var(--gold);">🎁 +'+fm(rewardVk)+' VK reward!</div>':'')
            +'</div></div>';
          document.body.appendChild(ov);
          setTimeout(function(){ov.classList.add('ach-notif-out');setTimeout(function(){ov.remove();},500);},3800);
        },300);
      })(a, !!(a.reward&&a.reward.vk), a.reward?a.reward.vk:0);
    }
  }
  if(ch){
    sv();
    renderAch();
    var cnt=G.ach.filter(Boolean).length;
    st('achBadge',cnt+'/'+ACHS.length);
    st('achProg',cnt+'/'+ACHS.length);
  }
}

function renderAch(){
  var el=document.getElementById('achGrid');
  if(!el) return;
  var done=G.ach.filter(Boolean).length;
  st('achBadge',done+'/'+ACHS.length);
  st('achProg', done+'/'+ACHS.length);

  if(typeof ACH_CATS==='undefined'){renderAchFlat(el);return;}
  if(!window._achOpen) window._achOpen={};

  var h='';
  ACH_CATS.forEach(function(cat){
    var catAchs=ACHS.filter(function(a){return cat.ids.indexOf(a.n)!==-1;});
    if(!catAchs.length) return;
    var catDone=catAchs.filter(function(a){
      var idx=ACHS.indexOf(a); return idx>=0&&G.ach[idx];
    }).length;
    var open=window._achOpen[cat.key]!==false;
    h+='<div class="ach-cat">'
      +'<div class="ach-cat-hdr" onclick="toggleAchCat(\''+cat.key+'\')">'
      +'<div class="ach-cat-left">'
      +'<span class="ach-cat-ico">'+cat.emoji+'</span>'
      +'<span class="ach-cat-name">'+cat.label+'</span>'
      +'</div>'
      +'<div class="ach-cat-right">'
      +'<span class="ach-cat-cnt">'+catDone+'/'+catAchs.length+'</span>'
      +'<span class="ach-cat-arr'+(open?' ach-arr-open':'')+'">›</span>'
      +'</div>'
      +'</div>';
    if(open){
      h+='<div class="ach-cat-body"><div class="achg">';
      catAchs.forEach(function(a){
        var idx=ACHS.indexOf(a);
        var earned=idx>=0&&G.ach[idx];
        h+='<div class="achc '+(earned?'ace':'acl')+'">'
          +'<div class="ach-ico-big">'+(earned?a.e:'🔒')+'</div>'
          +'<div class="acn">'+a.n+'</div>'
          +'<div class="acc">'+a.c+'</div>'
          +(earned?'<div class="acbadge">✓</div>':'')
          +(a.reward&&a.reward.vk?'<div class="ach-reward">🎁 +'+fm(a.reward.vk)+' VK</div>':'')
          +'</div>';
      });
      h+='</div></div>';
    }
    h+='</div>';
  });
  el.innerHTML=h;
}

function toggleAchCat(key){
  if(!window._achOpen) window._achOpen={};
  window._achOpen[key]=window._achOpen[key]===false;
  renderAch();
}

function renderAchFlat(el){
  var h='<div class="achg">';
  ACHS.forEach(function(a,i){
    var earned=G.ach[i];
    h+='<div class="achc '+(earned?'ace':'acl')+'">'
      +'<div class="ach-ico-big">'+(earned?a.e:'🔒')+'</div>'
      +'<div class="acn">'+a.n+'</div>'
      +'<div class="acc">'+a.c+'</div>'
      +(earned?'<div class="acbadge">✓</div>':'')
      +'</div>';
  });
  h+='</div>';
  el.innerHTML=h;
}

/* RANKS */
function renderRanks(){
  var list=document.getElementById('rankList');if(!list)return;
  var cur=getRk().n,h='';
  RK.forEach(function(r,i){
    var nq=RK[i+1]?RK[i+1].q:null,c=G.vk,p=0;
    if(nq)p=Math.min(100,Math.floor(Math.max(0,c-r.q)/(nq-r.q)*100));
    else if(c>=r.q)p=100;
    var fw=r.n===cur?p:(c>=r.q?100:0);
    h+='<div class="rrow '+(r.n===cur?'rc':'')+'">'
      +'<div class="remi">'+r.n.split(' ')[0]+'</div>'
      +'<div style="flex:1"><div class="rn">'+r.n+'</div>'
      +'<div class="rq">'+(r.q===0?'Starting rank':fm(r.q)+' VK required')+'</div>'
      +'<div class="rp2"><div class="rpf" style="width:'+fw+'%"></div></div></div>'
      +(r.n===cur?'<div class="ry">YOU</div>':'')+'</div>';
  });
  list.innerHTML=h;
}

/* PLAYER INFO */
function renderPI(){
  st('piC',fm(G.vk));st('piD',fm(G.dia));st('piR',getRk().n);
  st('piT',fm(G.taps));st('piMn',fm(G.mined));
  st('piName',(G.name||'PLAYER').toUpperCase());
  var m=document.getElementById('piM');
  if(m){m.textContent=G.bot?'✅ Owned':'Not Owned';m.style.color=G.bot?'var(--green)':'var(--text3)';}
  var ei=document.getElementById('editName');if(ei)ei.value=G.name||'';
}
function saveName(){
  var v=(document.getElementById('editName').value||'').trim();
  if(!v){toast('Name empty','#FF453A');return;}
  G.name=v;sv();toast('✅ Name updated!','#30D158');
  st('piName',v.toUpperCase());
}

/* TOAST */
var _tt;
function toast(msg,c){
  var t=document.getElementById('toast');
  t.textContent=msg;t.style.color=c||'var(--text)';
  t.classList.add('show');clearTimeout(_tt);
  _tt=setTimeout(function(){t.classList.remove('show');},2700);
}

/* PERIODIC TICK */
setInterval(function(){
  try{
    if(!G||!G.email) return; // don't run before login
    checkAch();
    if(G.bot) G.lastActive=Date.now();
    if(typeof tickMall==='function') tickMall();
    sv();
    if(typeof renderAll==='function') renderAll();
    if(typeof updDaily==='function') updDaily();
  }catch(e){ console.warn('tick error:',e); }
},5000);
