(function(){
  try{
    // Migration from old keys handled in ld() now
    if(ld()){
      G.logins++;
      sv();
      var lp=document.getElementById('lp');
      var app=document.getElementById('app');
      if(lp)  lp.style.display='none';
      if(app) app.style.display='flex';
      try{ initGame(); }catch(err){ console.error('autoLogin initGame:',err); }

      // FIREBASE INIT
      // Called after G is restored from localStorage via ld(), so G.name
      // and G.email are already populated before initFirebase() runs.
      // initFirebase() sets up auth and will trigger _waitForGThenEnsure()
      // which polls until G is ready before writing the player document.
      if(typeof initFirebase==='function'){ initFirebase(); }
    }
  }catch(e){ console.error('main.js boot error:',e); }
})();

// FIREBASE LOAD
// Runs once per session when G.email is available.
// Guarded so it only fires after initFirebase() has been called
// (initFirebase sets _fbReady which gates all Firestore calls).
(function(){
  var _fbLoadDone=false;
  function _tryFbLoad(){
    if(_fbLoadDone) return;
    if(typeof G==='undefined'||!G.email) return;
    if(typeof fbLoad!=='function')       return;
    _fbLoadDone=true;
    fbLoad(G.email, function(){
      if(typeof renderAll==='function') try{ renderAll(); }catch(e){}
    });
  }
  // Attempt immediately (covers auto-login path above where G.email is set)
  _tryFbLoad();
  // Also attempt when login form sets G.email (manual login path)
  // Expose so login handlers in ui.js can call _tryFbLoad() after setting G.email
  window._tryFbLoad=_tryFbLoad;
})();

// FIREBASE PRESENCE
// Mirror tab visibility to Firestore online/offline status.
// Defined here once; fbSetOnline/fbSetOffline are no-ops until
// initFirebase() has completed, so no ordering risk.
document.addEventListener('visibilitychange', function(){
  if(document.hidden){
    if(typeof fbSetOffline==='function') fbSetOffline();
  } else {
    if(typeof fbSetOnline==='function')  fbSetOnline();
  }
});
