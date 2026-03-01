/* ===================================================
   VICTOR COIN — Online Status System
   Online · Idle · Do Not Disturb · Invisible
   Status icon appears on profile avatar
=================================================== */

var STATUS_DEFS = {
  online:  { label:'Online',         icon:'🟢', color:'#30D158', dot:'#30D158' },
  idle:    { label:'Idle',           icon:'🌙', color:'#FF9F0A', dot:'#FF9F0A' },
  dnd:     { label:'Do Not Disturb', icon:'🔴', color:'#FF453A', dot:'#FF453A' },
  invisible:{ label:'Invisible',     icon:'⚪', color:'#636366', dot:'#636366' }
};

function initStatus() {
  if (!G.status) G.status = 'online';
}

function getStatusDef(key) {
  return STATUS_DEFS[key || 'online'] || STATUS_DEFS.online;
}

/* -- OPEN STATUS PICKER (bottom sheet) -- */
function openStatusPicker() {
  var ex = document.getElementById('statusPickerOv');
  if (ex) { ex.remove(); return; }
  initStatus();

  var ov = document.createElement('div');
  ov.id = 'statusPickerOv';
  ov.style.cssText = 'position:fixed;inset:0;z-index:600;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);';
  ov.innerHTML = '<div class="status-sheet">'
    + '<div class="status-sheet-handle"></div>'
    + '<div class="status-sheet-title">Change Online Status</div>'
    + '<div class="status-section-lbl">Online Status</div>'
    + Object.keys(STATUS_DEFS).map(function(k) {
        var s = STATUS_DEFS[k];
        var active = G.status === k;
        return '<div class="status-row ' + (active?'status-row-on':'') + '" onclick="setStatus(\'' + k + '\')">'
          + '<div class="status-dot-big" style="background:' + s.dot + ';box-shadow:0 0 8px ' + s.dot + '66;"></div>'
          + '<div class="status-row-label">' + s.label + '</div>'
          + '<div class="status-radio ' + (active?'status-radio-on':'') + '"></div>'
          + '</div>';
      }).join('')
    + '<div class="status-note">Invisible shows you as offline to others.</div>'
    + '</div>';

  ov.addEventListener('click', function(e){ if(e.target===ov) ov.remove(); });
  document.body.appendChild(ov);

  // Animate in
  var sheet = ov.querySelector('.status-sheet');
  sheet.style.transform = 'translateY(100%)';
  setTimeout(function(){ sheet.style.transform = 'translateY(0)'; }, 10);
}

function setStatus(key) {
  initStatus();
  G.status = key;
  sv();
  var ov = document.getElementById('statusPickerOv');
  if (ov) ov.remove();
  applyStatusDot();
  // Sync to Firebase
  fbReady && fbReady(function() {
    _db && _db.collection('players').doc(playerDocId(G.email))
      .update({ status: key }).catch(function(){});
  });
  toast(STATUS_DEFS[key].icon + ' ' + STATUS_DEFS[key].label, STATUS_DEFS[key].color);
}

/* -- APPLY STATUS DOT TO AVATAR -- */
function applyStatusDot() {
  initStatus();
  var dots = document.querySelectorAll('.status-dot-avatar');
  var s = getStatusDef(G.status);
  dots.forEach(function(d) {
    d.style.background = s.dot;
    d.style.boxShadow = '0 0 6px ' + s.dot + '88';
    d.title = s.label;
    // Invisible = show grey dot but no glow
    if (G.status === 'invisible') d.style.boxShadow = 'none';
  });
}

/* -- STATUS DOT HTML (for profile) -- */
function statusDotHTML(statusKey) {
  var s = getStatusDef(statusKey);
  // Invisible appears as offline to others
  var display = statusKey === 'invisible' ? STATUS_DEFS.online : s;
  return '<div class="status-dot-avatar" style="background:' + display.dot + ';box-shadow:0 0 5px ' + display.dot + '66;" title="' + s.label + '"></div>';
}

/* -- GET DISPLAY STATUS (for other players to see) -- */
function getDisplayStatus(playerData) {
  var k = playerData.status || 'online';
  if (k === 'invisible') return 'offline';
  return k;
}
