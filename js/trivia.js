/* ===================================================
   VICTOR COIN — 🤔 Trivia — 60 Qs + 10s timer
=================================================== */
var TRIVIA_Q=[
  /* EASY */
  {q:'What is 2+2?',a:'4',o:['3','4','5','6'],d:'easy'},
  {q:'What color is the sky?',a:'Blue',o:['Green','Blue','Red','Purple'],d:'easy'},
  {q:'Days in a week?',a:'7',o:['5','6','7','8'],d:'easy'},
  {q:'What animal says Meow?',a:'Cat',o:['Dog','Cat','Cow','Duck'],d:'easy'},
  {q:'Which planet do we live on?',a:'Earth',o:['Mars','Venus','Earth','Jupiter'],d:'easy'},
  {q:'Sides on a triangle?',a:'3',o:['2','3','4','5'],d:'easy'},
  {q:'What color is grass?',a:'Green',o:['Blue','Yellow','Green','Red'],d:'easy'},
  {q:'What comes after Monday?',a:'Tuesday',o:['Sunday','Wednesday','Tuesday','Friday'],d:'easy'},
  {q:'Months in a year?',a:'12',o:['10','11','12','13'],d:'easy'},
  {q:'Opposite of hot?',a:'Cold',o:['Warm','Cold','Wet','Dry'],d:'easy'},
  {q:'What do bees make?',a:'Honey',o:['Milk','Honey','Wax','Sugar'],d:'easy'},
  {q:'Spider legs?',a:'8',o:['6','8','10','4'],d:'easy'},
  {q:'Yellow curved fruit?',a:'Banana',o:['Apple','Mango','Banana','Pear'],d:'easy'},
  {q:'H₂O is commonly known as?',a:'Water',o:['Milk','Juice','Water','Air'],d:'easy'},
  {q:'Zeros in one hundred?',a:'2',o:['1','2','3','4'],d:'easy'},
  {q:'Instrument with black and white keys?',a:'Piano',o:['Guitar','Drum','Piano','Flute'],d:'easy'},
  {q:'Season after summer?',a:'Autumn',o:['Spring','Winter','Autumn','Summer'],d:'easy'},
  {q:'You write on a blackboard with?',a:'Chalk',o:['Pen','Pencil','Chalk','Marker'],d:'easy'},
  {q:'How many continents?',a:'7',o:['5','6','7','8'],d:'easy'},
  {q:'Dog legs?',a:'4',o:['2','4','6','8'],d:'easy'},
  /* MEDIUM */
  {q:'Capital of France?',a:'Paris',o:['London','Berlin','Paris','Rome'],d:'medium'},
  {q:'Gas plants absorb?',a:'CO₂',o:['O₂','N₂','CO₂','H₂'],d:'medium'},
  {q:'Who wrote Romeo and Juliet?',a:'Shakespeare',o:['Dickens','Shakespeare','Austen','Tolstoy'],d:'medium'},
  {q:'Bones in adult human body?',a:'206',o:['150','180','206','230'],d:'medium'},
  {q:'Chemical symbol for iron?',a:'Fe',o:['Ir','Fe','Fo','Fn'],d:'medium'},
  {q:'Largest ocean?',a:'Pacific',o:['Atlantic','Indian','Pacific','Arctic'],d:'medium'},
  {q:'WW2 ended in?',a:'1945',o:['1940','1943','1945','1950'],d:'medium'},
  {q:'Powerhouse of the cell?',a:'Mitochondria',o:['Nucleus','Mitochondria','Ribosome','Vacuole'],d:'medium'},
  {q:'Players on a basketball team?',a:'5',o:['4','5','6','7'],d:'medium'},
  {q:'Country with Eiffel Tower?',a:'France',o:['Italy','Spain','France','Germany'],d:'medium'},
  {q:'Chemical symbol for gold?',a:'Au',o:['Go','Gl','Ag','Au'],d:'medium'},
  {q:'Strings on a standard guitar?',a:'6',o:['4','5','6','7'],d:'medium'},
  {q:'Red Planet?',a:'Mars',o:['Jupiter','Venus','Mars','Saturn'],d:'medium'},
  {q:'Who painted Mona Lisa?',a:'da Vinci',o:['Picasso','da Vinci','Monet','Rembrandt'],d:'medium'},
  {q:'Largest continent?',a:'Asia',o:['Africa','Asia','Europe','Australia'],d:'medium'},
  {q:'Most of Earth\'s atmosphere?',a:'Nitrogen',o:['Oxygen','Nitrogen','CO₂','Argon'],d:'medium'},
  {q:'√144 = ?',a:'12',o:['11','12','13','14'],d:'medium'},
  {q:'Slam dunk sport?',a:'Basketball',o:['Football','Tennis','Basketball','Volleyball'],d:'medium'},
  {q:'Currency of Japan?',a:'Yen',o:['Won','Yen','Baht','Ringgit'],d:'medium'},
  {q:'Sides on a hexagon?',a:'6',o:['5','6','7','8'],d:'medium'},
  /* HARD */
  {q:'Who developed general relativity?',a:'Einstein',o:['Newton','Einstein','Bohr','Hawking'],d:'hard'},
  {q:'First FIFA World Cup winner?',a:'Uruguay',o:['Brazil','Argentina','Uruguay','Italy'],d:'hard'},
  {q:'Rarest blood type?',a:'AB-',o:['O-','B-','AB-','A+'],d:'hard'},
  {q:'Longest river?',a:'Nile',o:['Amazon','Nile','Yangtze','Mississippi'],d:'hard'},
  {q:'Atomic number of carbon?',a:'6',o:['4','6','8','12'],d:'hard'},
  {q:'First iPhone released?',a:'2007',o:['2004','2005','2007','2009'],d:'hard'},
  {q:'Hardest natural substance?',a:'Diamond',o:['Quartz','Sapphire','Diamond','Topaz'],d:'hard'},
  {q:'Most native speakers?',a:'Mandarin',o:['Spanish','English','Hindi','Mandarin'],d:'hard'},
  {q:'A Brief History of Time author?',a:'Hawking',o:['Sagan','deGrasse Tyson','Hawking','Feynman'],d:'hard'},
  {q:'Capital of Kazakhstan?',a:'Astana',o:['Almaty','Astana','Tashkent','Bishkek'],d:'hard'},
  {q:'Bits in a byte?',a:'8',o:['4','8','16','32'],d:'hard'},
  {q:'Liquid element besides mercury?',a:'Bromine',o:['Gallium','Bromine','Cesium','Francium'],d:'hard'},
  {q:'Beethoven symphonies?',a:'9',o:['7','8','9','10'],d:'hard'},
  {q:'17 × 18 = ?',a:'306',o:['296','300','306','312'],d:'hard'},
  {q:'Berlin Wall fell in?',a:'1989',o:['1987','1989','1991','1993'],d:'hard'},
  {q:'Creator of Android?',a:'Google',o:['Apple','Samsung','Google','Microsoft'],d:'hard'},
  {q:'Speed of light (approx)?',a:'300,000 km/s',o:['3,000 km/s','30,000 km/s','300,000 km/s','3M km/s'],d:'hard'},
  {q:'Planets in solar system?',a:'8',o:['7','8','9','10'],d:'hard'},
  {q:'Most abundant gas in Sun?',a:'Hydrogen',o:['Helium','Hydrogen','Oxygen','Carbon'],d:'hard'},
  {q:'DNA stands for?',a:'Deoxyribonucleic Acid',o:['Deoxyribonucleic Acid','Diribonucleic Acid','Dynamic Nucleic Acid','Dense Nucleic Acid'],d:'hard'}
];

var _tv={diff:'easy',pool:[],idx:0,score:0,streak:0,hs:0,answered:false};
var _trivTimer=null, _trivTimeLeft=10;

function renderTrivia(el){
  _tv.hs=parseInt(localStorage.getItem('vc_trivia_hs')||'0');
  el.innerHTML='<div class="game-wrap">'+gameBackBtn()
    +'<div class="game-title">🤔 Trivia</div>'
    +'<div class="triv-diff-row">'
    +'<button class="triv-diff triv-diff-on" id="td-easy"   onclick="trivSetDiff(\'easy\')">😊 Easy</button>'
    +'<button class="triv-diff"              id="td-medium" onclick="trivSetDiff(\'medium\')">😐 Medium</button>'
    +'<button class="triv-diff"              id="td-hard"   onclick="trivSetDiff(\'hard\')">💀 Hard</button>'
    +'</div><div id="trivBody"></div></div>';
  trivSetDiff('easy');
}

function trivSetDiff(diff){
  if(_trivTimer){clearInterval(_trivTimer);_trivTimer=null;}
  _tv.diff=diff;
  _tv.pool=gameShuffle(TRIVIA_Q.filter(function(q){return q.d===diff;}));
  _tv.idx=0;_tv.score=0;_tv.streak=0;_tv.answered=false;
  ['easy','medium','hard'].forEach(function(d){
    var b=document.getElementById('td-'+d);
    if(b)b.classList.toggle('triv-diff-on',d===diff);
  });
  trivShowQ();
}

function trivShowQ(){
  var el=document.getElementById('trivBody');
  if(!el)return;
  if(_tv.idx>=_tv.pool.length){trivEnd();return;}
  if(_trivTimer){clearInterval(_trivTimer);_trivTimer=null;}
  _trivTimeLeft=10;
  _tv.answered=false;

  var q=_tv.pool[_tv.idx];
  var opts=gameShuffle(q.o.slice());

  el.innerHTML='<div class="triv-meta">'
    +'<span>Q '+(_tv.idx+1)+'/'+_tv.pool.length+'</span>'
    +'<span>Score <b>'+_tv.score+'</b></span>'
    +'<span>🔥 '+_tv.streak+'</span>'
    +'<span>Best <b>'+_tv.hs+'</b></span>'
    +'</div>'
    +'<div class="triv-timer-row">'
    +'<div class="triv-timer-bar"><div class="triv-timer-fill" id="trivFill" style="width:100%"></div></div>'
    +'<span class="triv-timer-num" id="trivTime">10</span>'
    +'</div>'
    +'<div class="triv-q">'+q.q+'</div>'
    +'<div class="triv-opts">'
    +opts.map(function(o){
      return '<button class="triv-opt" onclick="trivAnswer(this,\''+_tvEsc(o)+'\',\''+_tvEsc(q.a)+'\')">'+o+'</button>';
    }).join('')
    +'</div>'
    +'<div class="triv-fb" id="trivFB"></div>';

  _trivTimer=setInterval(function(){
    _trivTimeLeft--;
    var fill=document.getElementById('trivFill');
    var lbl=document.getElementById('trivTime');
    if(fill)fill.style.width=(_trivTimeLeft*10)+'%';
    if(lbl)lbl.textContent=_trivTimeLeft;
    if(_trivTimeLeft<=3&&fill)fill.style.background='#FF453A';
    if(_trivTimeLeft<=0){
      clearInterval(_trivTimer);_trivTimer=null;
      if(!_tv.answered)trivTimeUp(q.a);
    }
  },1000);
}

function trivTimeUp(correct){
  _tv.answered=true; _tv.streak=0;
  document.querySelectorAll('.triv-opt').forEach(function(b){
    b.disabled=true;
    if(b.textContent.trim()===correct)b.classList.add('triv-opt-right');
  });
  var fb=document.getElementById('trivFB');
  if(fb)fb.innerHTML='<span class="triv-wrong">⏰ Time\'s up! Answer: <strong>'+correct+'</strong></span>'
    +'<br/><button class="game-retry-btn" onclick="trivSetDiff(\''+_tv.diff+'\')">🔄 Try Again</button>';
}

function trivAnswer(btn,chosen,correct){
  if(_tv.answered)return;
  _tv.answered=true;
  if(_trivTimer){clearInterval(_trivTimer);_trivTimer=null;}
  var right=chosen===correct;
  document.querySelectorAll('.triv-opt').forEach(function(b){
    b.disabled=true;
    if(b.textContent.trim()===correct)b.classList.add('triv-opt-right');
    if(b===btn&&!right)b.classList.add('triv-opt-wrong');
  });
  var fb=document.getElementById('trivFB');
  if(right){
    _tv.score++;_tv.streak++;
    if(_tv.score>_tv.hs){_tv.hs=_tv.score;localStorage.setItem('vc_trivia_hs',_tv.hs);}
    if(fb)fb.innerHTML='<span class="triv-correct">✅ Correct!</span>';
    if(_tv.streak>=20&&typeof checkAch==='function'){if(!G.gameStreak20){G.gameStreak20=true;sv();checkAch();}}
    _tv.idx++;
    setTimeout(trivShowQ,1000);
  } else {
    _tv.streak=0;
    if(fb)fb.innerHTML='<span class="triv-wrong">❌ Answer: <strong>'+correct+'</strong></span>'
      +'<br/><button class="game-retry-btn" onclick="trivSetDiff(\''+_tv.diff+'\')">🔄 Try Again</button>';
  }
}

function trivEnd(){
  var el=document.getElementById('trivBody');
  if(!el)return;
  el.innerHTML='<div class="game-end"><div class="game-end-ico">🏆</div>'
    +'<div class="game-end-title">Round Complete!</div>'
    +'<div class="game-end-row">Score: <b>'+_tv.score+'/'+_tv.pool.length+'</b></div>'
    +'<div class="game-end-row">Best: <b>'+_tv.hs+'</b></div>'
    +'<div class="game-end-row">Streak: <b>🔥 '+_tv.streak+'</b></div>'
    +'<button class="game-retry-btn" onclick="trivSetDiff(\''+_tv.diff+'\')">🔄 Play Again</button>'
    +'</div>';
}

function _tvEsc(s){return(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
