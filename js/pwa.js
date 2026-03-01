/* ===================================================
   VICTOR COIN — PWA / Add to Home Screen
   Shows install banner on mobile after 30s
   Respects "dismissed" preference
=================================================== */

var _deferredPrompt = null;
var _pwaShown = false;

// Catch the install prompt event
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  _deferredPrompt = e;
  // Show our custom banner after a short delay
  setTimeout(showPWABanner, 3000);
});

// Auto-show after 30s on mobile if not installed and not dismissed
window.addEventListener('load', function() {
  // Check if already installed as PWA
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone;
  if (isStandalone) return;

  // Check dismissed flag
  try {
    if (localStorage.getItem('vcPwaDismissed') === '1') return;
  } catch(e) {}

  // Show after 30 seconds
  setTimeout(function() {
    if (!_pwaShown) showPWABanner();
  }, 30000);
});

function showPWABanner() {
  if (_pwaShown) return;
  if (document.getElementById('pwaBanner')) return;

  // Don't show on login page
  var lp = document.getElementById('lp');
  if (lp && lp.style.display !== 'none') {
    // Wait until app is shown
    setTimeout(showPWABanner, 5000);
    return;
  }

  _pwaShown = true;

  var banner = document.createElement('div');
  banner.id = 'pwaBanner';

  // Detect iOS vs Android for instructions
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var isAndroid = /android/i.test(navigator.userAgent);

  var installStep = isIOS
    ? 'Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>'
    : 'Tap <strong>Add to Home Screen</strong> below';

  banner.innerHTML = '<div class="pwa-card">'
    + '<button class="pwa-close" onclick="dismissPWA()">✕</button>'
    + '<div class="pwa-top">'
    + '<div class="pwa-icon">⚡</div>'
    + '<div class="pwa-info">'
    + '<div class="pwa-title">Add Victor Coin to Home Screen</div>'
    + '<div class="pwa-sub">Play like a native app — offline, fast, fullscreen</div>'
    + '</div>'
    + '</div>'
    + '<div class="pwa-step">' + installStep + '</div>'
    + (_deferredPrompt
      ? '<button class="pwa-install-btn" onclick="triggerPWAInstall()">⚡ Install App</button>'
      : '<button class="pwa-install-btn pwa-manual" onclick="dismissPWA()">Got it!</button>')
    + '</div>';

  document.body.appendChild(banner);

  // Slide in
  banner.style.transform = 'translateY(120%)';
  banner.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
  setTimeout(function() { banner.style.transform = 'translateY(0)'; }, 50);
}

function triggerPWAInstall() {
  if (!_deferredPrompt) return;
  _deferredPrompt.prompt();
  _deferredPrompt.userChoice.then(function(result) {
    if (result.outcome === 'accepted') {
      dismissPWA();
    }
    _deferredPrompt = null;
  });
}

function dismissPWA() {
  try { localStorage.setItem('vcPwaDismissed','1'); } catch(e) {}
  var b = document.getElementById('pwaBanner');
  if (b) {
    b.style.transform = 'translateY(120%)';
    setTimeout(function(){ b.remove(); }, 400);
  }
}

// Register service worker for offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js').catch(function(){});
  });
}
