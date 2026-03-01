/* BOOSTS */
function renderBoosts(){try{
  var now=Date.now();
  BOOSTS.forEach(function(b,i){
    var bs=G.bs[b.id];
    var isAct=bs.active&&now<bs.endAt;
    var pct=isAct?Math.max(0,((bs.endAt-now)/(b.dur*1000))*100):0;
    var card=document.getElementById('booc'+i);if(card)card.classList.toggle('act',isAct);
    var mf=document.getElementById('bm'+i);if(mf)mf.style.width=pct+'%';
    var bts=document.getElementById('bb'+i);
    if(bts){
      var h='';
      if(!bs.owned)h='<button class="bb2 bbbuy" '+(G.vk<b.price?'disabled':'')+' onclick="buyBoost(\''+b.id+'\')">BUY '+fm(b.price)+' VK</button>';
      else h='<span class="bbown">✅ OWNED</span>';
      if(bs.owned&&!isAct)h+='<button class="bb2 bbact" onclick="actBoost(\''+b.id+'\')">ACTIVATE</button>';
      if(isAct)h+='<span style="font-size:.58rem;color:var(--gr);font-family:Share Tech Mono,monospace;padding:7px 4px;">ACTIVE ✓</span>';
      bts.innerHTML=h;
    }
    var stat=document.getElementById('bs'+i);
    if(stat){
      if(isAct)stat.innerHTML='<span class="bson">🟢 '+fmT(Math.ceil((bs.endAt-now)/1000))+' remaining</span>';
      else if(bs.owned)stat.innerHTML='<span style="color:var(--dim2);">💤 Ready — click Activate</span>';
      else stat.textContent='';
    }
  });
}catch(e){console.warn('renderBoosts:',e);}
}
function buyBoost(id){
  var b=BOOSTS.find(function(x){return x.id===id;});if(!b)return;
  if(G.vk<b.price){toast('Need '+fm(b.price)+' VK','#ff3d5a');return;}
  G.vk-=b.price;G.bs[id].owned=true;
  toast('⚡ '+b.name+' purchased! Activate when ready.','#ff7b35');
  G.boosted=(G.boosted||0)+1;checkAch();sv();renderAll();renderBoosts();
}
function actBoost(id){
  var b=BOOSTS.find(function(x){return x.id===id;});if(!b||!G.bs[id].owned)return;
  G.bs[id].active=true;G.bs[id].endAt=Date.now()+(b.dur*1000);if(id==='dr')G.bs[id].tick=Date.now();
  toast('🚀 '+b.name+' ACTIVATED!','#ff7b35');sv();renderAll();renderBoosts();startAuto();
}