/* ====================================================================
   VICTOR COIN — Firebase Integration v3
   Firebase JS SDK (compat/CDN build — no bundler needed)
   Compatible with GitHub Pages and any static host.

   CORE GUARANTEES
   -----------------------------------------------------------------
   1. Every authenticated user automatically gets a Firestore player
      document on first login. Returning users are refreshed each
      session without overwriting any existing data.

   2. Doc ID resolution priority:
        a) sanitised email  → playerDocId(G.email)
        b) Firebase UID     → "uid_" + _fbUid
      The same logic is used everywhere so IDs never drift.

   3. ALL writes use { merge: true } — partial fields never wipe
      existing sub-fields or sub-collections.

   4. fbSave() is debounced 2 s so rapid game actions (taps, etc.)
      don't flood Firestore with writes.

   5. Every Firestore call is wrapped in fbReady() so calls made
      before the SDK loads are queued and replayed automatically.

   6. Every G.* read is null-safe — missing fields default to a
      sensible value rather than throwing.
==================================================================== */


/* -----------------------------------------------------------------
   FIREBASE APP CONFIG
----------------------------------------------------------------- */
var FB_CFG = {
  apiKey:            'AIzaSyAuXUjRzILIZTazgg8pFbr_9qn4Tnuiz84',
  authDomain:        'victor-b0773.firebaseapp.com',
  projectId:         'victor-b0773',
  storageBucket:     'victor-b0773.firebasestorage.app',
  messagingSenderId: '813564661719',
  appId:             '1:813564661719:web:11c07067ad3e483204c592'
};


/* -----------------------------------------------------------------
   MODULE-LEVEL STATE
----------------------------------------------------------------- */
var _fbApp    = null;   // Firebase app instance
var _db       = null;   // Firestore instance
var _auth     = null;   // Firebase Auth instance
var _fbReady  = false;  // true once auth + Firestore are live
var _fbUid    = null;   // Firebase UID of the current session
var _fbQueue  = [];     // Queued callbacks waiting for Firebase


/* -----------------------------------------------------------------
   READY GATE
   Any code that touches Firestore must be wrapped in fbReady().
   If Firebase isn't initialised yet the callback is queued and
   replayed as soon as it becomes ready.
----------------------------------------------------------------- */
function fbReady(fn) {
  if (_fbReady) { fn(); }
  else          { _fbQueue.push(fn); }
}

function _fbFlushQueue() {
  _fbQueue.forEach(function(fn) {
    try { fn(); } catch(e) { console.warn('[FB] queued fn threw:', e); }
  });
  _fbQueue = [];
}


/* =================================================================
   INIT FIREBASE
   Call once from main.js / initGame().
   Safe to call again — idempotent via firebase.apps check.
================================================================ */
function initFirebase() {
  try {
    /* If the SDK scripts haven't loaded yet, retry in 1 s */
    if (typeof firebase === 'undefined') {
      console.warn('[FB] SDK not loaded — retrying in 1 s');
      setTimeout(initFirebase, 1000);
      return;
    }

    /* Initialise app (idempotent) */
    _fbApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(FB_CFG);
    _db    = firebase.firestore();
    _auth  = firebase.auth();

    /* -- Auth state listener --------------------------------------
       onAuthStateChanged fires:
         • immediately if a session already exists (returning user)
         • again after signInAnonymously() resolves (new user)
       This is the single place that sets _fbReady and flushes the
       callback queue.
    -------------------------------------------------------------- */
    _auth.onAuthStateChanged(function(user) {
      if (!user) return; /* signed-out event — nothing to do */

      _fbUid   = user.uid;
      _fbReady = true;
      _fbFlushQueue();
      console.log('[FB] Ready. uid =', _fbUid);

      /*
       * Guarantee the player document exists in Firestore.
       * We must NOT call _ensurePlayerDoc until G exists and has
       * real data — a fixed timeout is unreliable because ld()
       * (which restores G from localStorage) may finish faster or
       * slower depending on device speed.
       *
       * _waitForGThenEnsure() polls every 500 ms until G is ready,
       * then calls _ensurePlayerDoc() exactly once.
       */
      _waitForGThenEnsure();
    });

    /* Sign in anonymously if no session exists yet */
    if (!_auth.currentUser) {
      _auth.signInAnonymously().catch(function(e) {
        /*
         * Anonymous auth may be disabled in the Firebase console.
         * Degrade gracefully — the game still works locally,
         * social/cloud features won't sync.
         */
        console.warn('[FB] signInAnonymously failed:', e.message,
                     '— running without Firebase persistence.');
        _fbReady = true;
        _fbFlushQueue();
      });
    }

    /* Presence hooks */
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) { fbSetOffline(); } else { fbSetOnline(); }
    });
    window.addEventListener('beforeunload', fbSetOffline);

    console.log('[FB] Initialised.');
  } catch(e) {
    console.error('[FB] initFirebase error:', e);
  }
}


/* =================================================================
   DOC ID HELPERS
================================================================ */

/**
 * Convert an email address to a valid Firestore document ID.
 * Firestore prohibits: . # $ [ ] in doc IDs.
 * Returns '' if email is empty/null.
 */
function playerDocId(email) {
  // Sanitise email into a valid Firestore doc ID.
  // Firestore forbids: . # $ [ ] / in document IDs.
  // Returns '' if email is falsy — caller must handle this case.
  var e = (email || '').trim().toLowerCase();
  if (!e) return '';
  return e.replace(/[.#$[\]\/@]/g, '_');
}

/**
 * Resolve the current user's doc ID.
 * Priority: email → Firebase UID fallback.
 * Never returns '' as long as the user is authenticated.
 */
function _myDocId() {
  // For anonymous users: always use 'uid_<firebaseUID>' as the doc ID.
  // This matches the isOwner() rule which checks 'uid_' + request.auth.uid.
  // For email users: prefer the sanitised email doc ID (kept for backwards
  // compatibility with documents already created under email-based IDs).
  if (_fbUid && (!G || !G.email || G.email.indexOf('@') === -1)) {
    return 'uid_' + _fbUid;
  }
  var byEmail = playerDocId(G && G.email ? G.email : '');
  if (byEmail) return byEmail;
  if (_fbUid)  return 'uid_' + _fbUid;
  return '';
}


/* =================================================================
   UTILITY HELPERS
================================================================ */

/** Most-visited exploration location, or 'Unexplored'. */
function getMostVisitedLoc() {
  if (!G || !G.ex || !G.ex.locVisits) return 'Unexplored';
  var locs   = ['Vic Tomb','Vic Docks','Vic Haven','Vic Citadel','Vic Abyss'];
  var visits = G.ex.locVisits;
  var maxIdx = 0;
  for (var i = 1; i < visits.length; i++) {
    if ((visits[i] || 0) > (visits[maxIdx] || 0)) maxIdx = i;
  }
  return (visits[maxIdx] || 0) > 0 ? locs[maxIdx] : 'Unexplored';
}

/** Count unlocked achievements. */
function countAch() {
  if (!G || !G.ach) return 0;
  return G.ach.filter(function(a) { return !!a; }).length;
}

/** Resolve the player's current rank label. */
function _rankName() {
  if (typeof RK === 'undefined' || !G) return '🌱 Newbie';
  for (var i = RK.length - 1; i >= 0; i--) {
    if ((G.vk || 0) >= RK[i].q) return RK[i].n;
  }
  return '🌱 Newbie';
}


/* =================================================================
   BUILD PLAYER DATA
   -------------------------------------------------------------
   Returns a plain object containing every field Firestore should
   store. All G.* accesses are null-safe with sensible defaults.
   This is the single source of truth for the document shape.
================================================================ */
function buildPlayerData() {
  if (!G) return {};                         /* G not loaded yet */

  /* Resolve the canonical email stored in the document itself.
     If the user has no email we store the UID string so the doc
     is still queryable by something unique.                     */
  var canonicalEmail = (G.email || '').trim()
                    || (_fbUid ? 'uid_' + _fbUid : '');

  return {
    /* -- Identity ---------------------------------------------- */
    name:       ((G.name || '').trim()) || 'Player',
    email:      canonicalEmail,
    nameLower:  ((G.name || '').trim() || 'player').toLowerCase(),
    uid:        _fbUid || null,
    anonymous:  !!(G.settings && G.settings.anonymous),

    /* -- Economy ----------------------------------------------- */
    vk:         G.vk  || 0,
    diamonds:   G.dia || 0,

    /* -- Progress ---------------------------------------------- */
    rank:       _rankName(),
    achCount:   countAch(),
    homesBuilt: (G.build && Array.isArray(G.build.homes))
                  ? G.build.homes.length : 0,
    location:   getMostVisitedLoc(),

    /* -- Profile ----------------------------------------------- */
    profilePic: G.profilePic || '',
    bio:        G.bio        || '',
    bioChanges: G.bioChanges || 0,
    joinedAt:   G.joinedAt   || Date.now(),
    status:     G.status     || 'online',
    online:     true,

    /* -- Social ------------------------------------------------ */
    giftCount:  G.giftCount || 0,
    badges:     Array.isArray(G.badges) ? G.badges : [],
    likes:      G.likes     || 0,

    /* -- Game systems ------------------------------------------ */
    server:    (G.server && G.server.id) ? G.server.id : null,
    vault:      G.vault     || { items: [], active: {} },
    cosmetics:  G.cosmetics || {},

    /* -- Game presence -------------------------------------------- */
    currentGame:      (typeof _activeGame !== 'undefined' ? _activeGame : null),
    currentGameStart: null,

    /* -- Timestamps (written server-side) ---------------------- */
    lastSeen:   firebase.firestore.FieldValue.serverTimestamp()
  };
}


/* =================================================================
   _ensurePlayerDoc
   -------------------------------------------------------------
   Called automatically 2.5 s after every successful auth event.

   FLOW:
     1. Resolve doc ID (email or UID).
     2. GET the document.
        a. EXISTS  → cloud economy/social wins, push fresh stats.
        b. MISSING → write full document immediately (first login).
        c. GET ERR → blind SET as last resort so user is visible.
================================================================ */
/*
 * _waitForGThenEnsure
 * -----------------------------------------------------------------
 * Polls every 500 ms until BOTH conditions are satisfied:
 *   1. _fbReady is true  (auth resolved)
 *   2. G exists AND has at least one populated required field
 *      (G.name or G.vk is set — proof that ld() has finished)
 * Then calls _ensurePlayerDoc() exactly once per session.
 *
 * We track calls with _docEnsured so re-auth events don't trigger
 * a second write in the same session.
 */
var _docEnsured = false;   /* true once _ensurePlayerDoc has run */

function _waitForGThenEnsure() {
  /* Already ran this session — nothing to do */
  if (_docEnsured) return;

  /* Check whether G is ready: must exist and carry real game data */
  function gIsReady() {
    return (
      typeof G !== 'undefined' &&
      G !== null &&
      (
        (typeof G.name === 'string' && G.name.trim().length > 0) ||
        (typeof G.vk   === 'number' && G.vk   >= 0)
      )
    );
  }

  if (_fbReady && gIsReady()) {
    /* Both conditions met immediately — run now */
    _docEnsured = true;
    _ensurePlayerDoc();
    return;
  }

  /* At least one condition not yet met — poll every 500 ms */
  var _gPollTimer = setInterval(function() {
    if (!_fbReady || !gIsReady()) return;   /* still waiting */

    clearInterval(_gPollTimer);

    if (_docEnsured) return;   /* guard against rapid double-fire */
    _docEnsured = true;

    console.log('[FB] G is ready (name="' + (G.name || '') + '", vk=' + (G.vk || 0) + ') — running _ensurePlayerDoc');
    _ensurePlayerDoc();
  }, 500);
}

function _ensurePlayerDoc() {
  var docId = _myDocId();
  if (!docId) {
    console.warn('[FB] _ensurePlayerDoc: cannot resolve doc ID (no email, no uid)');
    return;
  }

  var ref = _db.collection('players').doc(docId);

  ref.get()

    /* -- GET succeeded ------------------------------------------ */
    .then(function(snap) {

      if (snap.exists) {
        /* -- Document found — merge cloud wins ------------------ */
        var cloud = snap.data();

        /* Economy: cloud wins if higher (anti-cheat lite) */
        if ((cloud.vk       || 0) > (G.vk  || 0)) G.vk  = cloud.vk;
        if ((cloud.diamonds || 0) > (G.dia  || 0)) G.dia = cloud.diamonds;

        /* Social fields always from cloud */
        if (cloud.bio)       G.bio       = cloud.bio;
        if (cloud.joinedAt)  G.joinedAt  = cloud.joinedAt;
        if (cloud.likes)     G.likes     = cloud.likes;
        if (cloud.giftCount) G.giftCount = cloud.giftCount;
        if (Array.isArray(cloud.badges) && cloud.badges.length)
          G.badges = cloud.badges;
        if (cloud.anonymous !== undefined && G.settings)
          G.settings.anonymous = cloud.anonymous;

        /* Push fresh local stats back without touching cloud-only
           fields we just merged in (name, rank, profile, etc.)  */
        ref.set({
          name:       ((G.name || '').trim()) || 'Player',
          nameLower:  ((G.name || '').trim() || 'player').toLowerCase(),
          email:      (G.email || '').trim() || ('uid_' + _fbUid),
          uid:        _fbUid || null,
          vk:         G.vk  || 0,
          diamonds:   G.dia || 0,
          rank:       _rankName(),
          achCount:   countAch(),
          homesBuilt: (G.build && Array.isArray(G.build.homes))
                        ? G.build.homes.length : 0,
          profilePic: G.profilePic || '',
          status:     G.status     || 'online',
          online:     true,
          vault:      G.vault     || { items: [], active: {} },
          cosmetics:  G.cosmetics || {},
          lastSeen:   firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
        .then(function() {
          console.log('[FB] Player doc refreshed:', docId);
        })
        .catch(function(e) {
          console.warn('[FB] Doc refresh error:', e.code, e.message);
        });

      } else {
        /* -- Document missing — first login --------------------- */
        G.joinedAt = G.joinedAt || Date.now();

        var firstDoc = buildPlayerData();

        /* Guard: never write an empty object to Firestore */
        if (!firstDoc || Object.keys(firstDoc).length === 0) {
          console.error('[FB] Abort: buildPlayerData returned empty — skipping write for', docId);
          return;
        }
        console.log('[FB] Creating player doc with data:', firstDoc);

        ref.set(firstDoc, { merge: true })
          .then(function() {
            console.log('[FB] Player doc CREATED:', docId);
            /*
             * Schedule a second save 3 s later.
             * By that point the game may have computed the correct
             * VK total / rank from local storage, so stats will be
             * accurate in the leaderboard on first load.
             */
            setTimeout(fbSave, 3000);
          })
          .catch(function(e) {
            console.error('[FB] Player doc CREATE failed:', e.code, e.message);
          });
      }
    })

    /* -- GET failed (most likely a Firestore rules block) -------- */
    .catch(function(e) {
      console.error(
        '[FB] _ensurePlayerDoc GET error:', e.code, e.message,
        '\n → Check Firestore rules. The /players collection needs:',
        '\n   allow read, write: if request.auth != null;'
      );

      /* Last resort: attempt a blind write so the user is at least
         visible in leaderboard / search even if we couldn't read.  */
      G.joinedAt = G.joinedAt || Date.now();
      var blindDoc = buildPlayerData();
      if (!blindDoc || Object.keys(blindDoc).length === 0) {
        console.error('[FB] Abort: buildPlayerData returned empty — skipping blind-write for', docId);
        return;
      }
      console.log('[FB] Creating player doc with data:', blindDoc);
      ref.set(blindDoc, { merge: true })
        .then(function() {
          console.log('[FB] Blind-write succeeded for:', docId);
        })
        .catch(function(e2) {
          console.error('[FB] Blind-write also failed:', e2.code,
            '— user will NOT appear in leaderboard/search.');
        });
    });
}


/* =================================================================
   fbSave  (debounced 2 s)
   -------------------------------------------------------------
   Called by sv() after every game action (tap, purchase, etc.).
   Uses merge: true so sub-collections (friends, notifications)
   are never touched.
================================================================ */
var _fbSaveTimer = null;

function fbSave() {
  var docId = _myDocId();
  if (!docId) return;   /* Not authenticated yet — skip silently */

  clearTimeout(_fbSaveTimer);
  _fbSaveTimer = setTimeout(function() {
    fbReady(function() {
      _db.collection('players').doc(docId)
        .set(buildPlayerData(), { merge: true })
        .catch(function(e) {
          console.warn('[FB] fbSave error:', e.code, e.message);
        });
    });
  }, 2000);
}


/* =================================================================
   fbLoad  (called on login by main.js)
   -------------------------------------------------------------
   Merges Firestore cloud data into local G, then calls callback().
   Document creation / refresh is handled by _ensurePlayerDoc()
   which fires separately after auth — fbLoad just needs to
   populate G and unblock the UI as fast as possible.
================================================================ */
function fbLoad(email, callback) {
  fbReady(function() {
    var docId = playerDocId(email);

    /* No email yet — unblock UI immediately, _ensurePlayerDoc
       will create the doc once auth fires.                    */
    if (!docId) {
      if (callback) callback();
      return;
    }

    _db.collection('players').doc(docId).get()
      .then(function(snap) {

        if (snap.exists) {
          /* Merge cloud data into G */
          var d = snap.data();

          /* Economy: cloud wins if higher */
          if ((d.vk       || 0) > (G.vk  || 0)) G.vk  = d.vk;
          if ((d.diamonds || 0) > (G.dia  || 0)) G.dia = d.diamonds;

          /* Social / profile fields from cloud */
          if (d.bio)       G.bio       = d.bio;
          if (d.joinedAt)  G.joinedAt  = d.joinedAt;
          if (d.likes)     G.likes     = d.likes;
          if (d.giftCount) G.giftCount = d.giftCount;
          if (Array.isArray(d.badges) && d.badges.length) G.badges = d.badges;
          if (d.anonymous !== undefined && G.settings)
            G.settings.anonymous = d.anonymous;

        } else {
          /* Document doesn't exist yet — set joinedAt locally.
             _ensurePlayerDoc() will write the full document.   */
          G.joinedAt = G.joinedAt || Date.now();
        }

        if (callback) callback();

        /*
         * Refresh Firestore 3 s after load so the leaderboard
         * reflects current-session stats (VK, rank, achievements).
         */
        setTimeout(fbSave, 3000);
      })

      .catch(function(e) {
        /* On GET error still run the game unblocked */
        console.warn('[FB] fbLoad GET error:', e.code, e.message);
        if (callback) callback();
      });
  });
}


/* =================================================================
   LEADERBOARD
================================================================ */
function fbGetLeaderboard(type, callback) {
  var orderField = (type === 'diamonds') ? 'diamonds' : 'vk';

  fbReady(function() {
    _db.collection('players')
      .orderBy(orderField, 'desc')
      .limit(50)
      .get()
      .then(function(snap) {
        var list = [];
        snap.forEach(function(doc) { list.push(doc.data()); });
        callback(list);
      })
      .catch(function(e) {
        console.warn('[FB] Leaderboard error:', e.code, e.message);
        callback([]);
      });
  });
}


/* =================================================================
   PLAYER SEARCH
   -------------------------------------------------------------
   Strategy A: nameLower range query — fast, O(log n), requires
               a Firestore index (auto-created on first run).
   Strategy B: full collection scan — slower but catches docs
               created before nameLower existed, or if Strategy A
               fails due to a missing index.
================================================================ */
function fbSearchPlayer(name, callback) {
  fbReady(function() {
    var q = (name || '').trim().toLowerCase();
    if (!q) { callback([]); return; }

    /* Rank results: exact match → prefix match → contains */
    function rankAndReturn(arr) {
      arr.sort(function(a, b) {
        function score(n) {
          n = (n || '').toLowerCase();
          return n === q ? 0 : n.startsWith(q) ? 1 : 2;
        }
        return score(a.name) - score(b.name);
      });
      callback(arr.slice(0, 15));
    }

    /* Strategy B: full scan */
    function fullScan() {
      _db.collection('players').get()
        .then(function(snap) {
          var r = [];
          snap.forEach(function(doc) {
            var d  = doc.data();
            var nm = (d.name      || '').toLowerCase();
            var nl = (d.nameLower || nm);
            if (nl.includes(q) || nm.includes(q)) r.push(d);
          });
          rankAndReturn(r);
        })
        .catch(function(e) {
          console.error('[FB] Search full-scan error:', e.code,
            '\n → Firestore rules must allow list on /players for authenticated users.');
          callback([]);
        });
    }

    /* Strategy A: range query */
    _db.collection('players')
      .where('nameLower', '>=', q)
      .where('nameLower', '<=', q + '\uf8ff')
      .limit(15)
      .get()
      .then(function(snap) {
        var r = [];
        snap.forEach(function(doc) { r.push(doc.data()); });
        /* If range query returned results, use them; else fall back */
        if (r.length > 0) { rankAndReturn(r); }
        else              { fullScan(); }
      })
      .catch(function() {
        /* Index may not exist yet — fall back to full scan */
        fullScan();
      });
  });
}


/* =================================================================
   GIFT SYSTEM
================================================================ */
function fbSendGift(toName, type, amount, callback) {
  if (!G.email || !G.name)              { callback({ error: 'Not logged in'       }); return; }
  if (type === 'vk'       && G.vk  < amount) { callback({ error: 'Not enough VK'       }); return; }
  if (type === 'diamonds' && G.dia < amount) { callback({ error: 'Not enough diamonds'  }); return; }

  fbReady(function() {
    _db.collection('players').where('name', '==', toName).limit(1).get()
      .then(function(snap) {
        if (snap.empty) {
          callback({ error: 'Player "' + toName + '" not found' });
          return;
        }

        var recip   = snap.docs[0].data();
        // Resolve recipient doc ID: prefer email-based ID, fall back to
        // uid_ format for anonymous users who have no real email stored.
        var recipId = playerDocId(recip.email);
        if (!recipId && recip.uid) recipId = 'uid_' + recip.uid;
        if (!recipId) { callback({ error: 'Cannot resolve recipient ID' }); return; }
        var batch   = _db.batch();

        /* Deduct from sender locally */
        if (type === 'vk')       G.vk  -= amount;
        if (type === 'diamonds') G.dia -= amount;
        G.giftCount = (G.giftCount || 0) + 1;
        sv(); renderAll();
        if (typeof checkBadges === 'function') checkBadges();

        /* Sender update */
        batch.update(
          _db.collection('players').doc(playerDocId(G.email)),
          type === 'vk' ? { vk: G.vk } : { diamonds: G.dia }
        );

        /* Recipient credit */
        batch.update(
          _db.collection('players').doc(recipId),
          type === 'vk'
            ? { vk:       firebase.firestore.FieldValue.increment(amount) }
            : { diamonds: firebase.firestore.FieldValue.increment(amount) }
        );

        /* Gift log */
        batch.set(_db.collection('gifts').doc(), {
          from:      G.name,
          fromEmail: G.email,
          to:        recip.name,
          toEmail:   recip.email,
          type:      type,
          amount:    amount,
          ts:        firebase.firestore.FieldValue.serverTimestamp()
        });

        /* Notification to recipient */
        batch.set(
          _db.collection('players').doc(recipId).collection('notifications').doc(),
          {
            type:    'gift',
            from:    G.name,
            message: G.name + ' gifted you '
                   + (typeof fm === 'function' ? fm(amount) : amount)
                   + ' ' + (type === 'vk' ? 'VK' : '💎'),
            read:    false,
            ts:      firebase.firestore.FieldValue.serverTimestamp()
          }
        );

        batch.commit()
          .then(function() { callback({ success: true, recipient: recip.name }); })
          .catch(function(e) { callback({ error: e.message }); });
      })
      .catch(function(e) { callback({ error: e.message }); });
  });
}


/* =================================================================
   LIKES
================================================================ */
function fbLikePlayer(targetEmail, callback) {
  fbReady(function() {
    var myUid   = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;
    if (!myUid) { if (callback) callback({ error: 'Not logged in' }); return; }

    var myDocId = typeof _myDocId === 'function' ? _myDocId() : playerDocId(G.email);
    var tId     = playerDocId(targetEmail);
    if (!tId) { if (callback) callback({ error: 'Player not found' }); return; }

    var likeRef = _db.collection('players').doc(tId).collection('likes').doc(myDocId);

    // Check if already liked
    likeRef.get().then(function(snap) {
      if (snap.exists) {
        if (callback) callback({ error: 'Already liked' });
        return;
      }
      likeRef.set({
        from: G.name || 'Anonymous',
        fromUid: myUid,
        ts: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function() {
        _db.collection('players').doc(tId)
           .update({ likes: firebase.firestore.FieldValue.increment(1) });

        _db.collection('players').doc(tId).collection('notifications').doc().set({
          type:    'like',
          from:    G.name || 'Anonymous',
          message: (G.name || 'Someone') + ' liked your profile ❤️',
          read:    false,
          ts:      firebase.firestore.FieldValue.serverTimestamp()
        });

        // Track likes given on sender's side
        if (!G.likedProfiles) G.likedProfiles = [];
        if (G.likedProfiles.indexOf(targetEmail) < 0) {
          G.likedProfiles.push(targetEmail);
          if (!G.likesGiven) G.likesGiven = 0;
          G.likesGiven++;
          sv();
          if (typeof checkAch === 'function') checkAch();
        }

        if (callback) callback({ success: true });
      }).catch(function(e) { if (callback) callback({ error: e.message }); });
    }).catch(function(e) { if (callback) callback({ error: e.message }); });
  });
}


/* =================================================================
   FRIEND REQUESTS
================================================================ */
function fbSendFriendReq(toName, callback) {
  fbReady(function() {
    _db.collection('players').where('name', '==', toName).limit(1).get()
      .then(function(snap) {
        if (snap.empty) { callback({ error: 'Player not found' }); return; }

        var target   = snap.docs[0].data();
        var tId      = playerDocId(target.email);
        if (!tId && target.uid) tId = 'uid_' + target.uid;
        var myId     = typeof _myDocId === 'function' ? _myDocId() : playerDocId(G.email);
        var reqId    = myId + '_' + tId;

        // Check if already sent
        _db.collection('friendRequests').doc(reqId).get().then(function(existing) {
          if (existing.exists && existing.data().status === 'pending') {
            callback({ error: 'already_sent' });
            return;
          }

          _db.collection('friendRequests').doc(reqId).set({
            from:      G.name,
            fromEmail: G.email,
            fromUid:   firebase.auth().currentUser ? firebase.auth().currentUser.uid : null,
            to:        target.name,
            toEmail:   target.email,
            toUid:     target.uid || null,
            status:    'pending',
            ts:        firebase.firestore.FieldValue.serverTimestamp()
          }).then(function() {
            // Notify target
            _db.collection('players').doc(tId).collection('notifications').doc().set({
              type:      'friendRequest',
              from:      G.name,
              fromEmail: G.email,
              message:   G.name + ' wants to be your friend 👥',
              read:      false,
              ts:        firebase.firestore.FieldValue.serverTimestamp()
            });
            callback({ success: true });
          }).catch(function(e) { callback({ error: e.message }); });
        }).catch(function(e) { callback({ error: e.message }); });
      });
  });
}

function fbAcceptFriendReq(fromEmail, callback) {
  fbReady(function() {
    var myId   = playerDocId(G.email);
    var fromId = playerDocId(fromEmail);
    var reqId  = fromId + '_' + myId;
    var ts     = firebase.firestore.FieldValue.serverTimestamp();
    var batch  = _db.batch();

    batch.update(_db.collection('friendRequests').doc(reqId), { status: 'accepted' });
    batch.set(
      _db.collection('players').doc(myId).collection('friends').doc(fromId),
      { email: fromEmail, since: ts }
    );
    batch.set(
      _db.collection('players').doc(fromId).collection('friends').doc(myId),
      { email: G.email, since: ts }
    );

    batch.commit()
      .then(function() { callback({ success: true }); })
      .catch(function(e) { callback({ error: e.message }); });
  });
}

function fbGetFriends(callback) {
  fbReady(function() {
    _db.collection('players').doc(playerDocId(G.email))
       .collection('friends').get()
       .then(function(snap) {
         var emails = [];
         snap.forEach(function(d) { emails.push(d.data().email); });

         Promise.all(
           emails.map(function(e) {
             return _db.collection('players').doc(playerDocId(e)).get();
           })
         ).then(function(docs) {
           callback(
             docs.filter(function(d) { return d.exists; })
                 .map(function(d)    { return d.data(); })
           );
         });
       })
       .catch(function() { callback([]); });
  });
}

function fbUnfriend(friendEmail, callback) {
  fbReady(function() {
    var batch = _db.batch();
    batch.delete(
      _db.collection('players').doc(playerDocId(G.email))
         .collection('friends').doc(playerDocId(friendEmail))
    );
    batch.delete(
      _db.collection('players').doc(playerDocId(friendEmail))
         .collection('friends').doc(playerDocId(G.email))
    );
    batch.commit()
      .then(function() { callback({ success: true }); })
      .catch(function(e) { callback({ error: e.message }); });
  });
}


/* =================================================================
   NOTIFICATIONS
================================================================ */
var _notifUnsub = null;

function fbListenNotifications() {
  // Use _myDocId() so anonymous users without G.email are also covered.
  if (!_fbReady) return;
  var docId = _myDocId();
  if (!docId) return;
  if (_notifUnsub) _notifUnsub(); /* detach old listener */

  _notifUnsub = _db.collection('players').doc(docId)
    .collection('notifications')
    .orderBy('ts', 'desc').limit(20)
    .onSnapshot(function(snap) {
      var unread = 0;
      snap.forEach(function(d) { if (!d.data().read) unread++; });
      updateNotifBadge(unread);
    });
}

function updateNotifBadge(count) {
  var badge = document.getElementById('notifBadge');
  if (badge) {
    badge.textContent   = count > 0 ? count : '';
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  // Also light up the red dot on the social overlay bell icon
  if (typeof updateSocNotifDot === 'function') updateSocNotifDot(count);
}


/* =================================================================
   REAL-TIME CHAT
   Messages auto-expire after 24 h (checked on each send).
================================================================ */
var _chatUnsub = null;

function fbSendMessage(text) {
  // Allow anonymous users to chat — they have a uid even without an email.
  if (!text || !text.trim() || !_fbUid) return;
  fbReady(function() {
    _db.collection('chat').add({
      name:       (G.settings && G.settings.anonymous) ? 'Anonymous' : (G.name || 'Player'),
      email:      G.email,
      profilePic: G.profilePic || '',
      text:       text.trim().slice(0, 300),
      ts:         firebase.firestore.FieldValue.serverTimestamp(),
      expireAt:   Date.now() + 24 * 60 * 60 * 1000
    });
    fbCleanChat();
  });
}

function fbListenChat(callback) {
  if (_chatUnsub) { _chatUnsub(); _chatUnsub = null; }

  fbReady(function() {
    _chatUnsub = _db.collection('chat')
      .orderBy('ts', 'desc').limit(80)
      .onSnapshot(function(snap) {
        var msgs = [];
        snap.forEach(function(d) {
          /* Spread-compat for non-modern JS: manually merge id + data */
          var msg = { id: d.id };
          var data = d.data();
          for (var k in data) { if (data.hasOwnProperty(k)) msg[k] = data[k]; }
          msgs.push(msg);
        });
        callback(msgs.reverse());
      });
  });
}

function fbCleanChat() {
  var cutoff = Date.now() - 24 * 60 * 60 * 1000;
  _db.collection('chat').where('expireAt', '<', cutoff).limit(20).get()
    .then(function(snap) {
      var batch = _db.batch();
      snap.forEach(function(d) { batch.delete(d.ref); });
      batch.commit();
    })
    .catch(function() {});
}


/* =================================================================
   ONLINE PRESENCE
================================================================ */
function fbSetOnline() {
  // Use _myDocId() so anonymous users (no G.email) are also updated.
  if (!_fbReady || !_db) return;
  var docId = _myDocId();
  if (!docId) return;
  _db.collection('players').doc(docId)
     .update({
       online:   true,
       lastSeen: firebase.firestore.FieldValue.serverTimestamp()
     })
     .catch(function() {});
}

function fbSetOffline() {
  if (!_fbReady || !_db) return;
  var docId = _myDocId();
  if (!docId) return;
  _db.collection('players').doc(docId)
     .update({
       online:   false,
       lastSeen: firebase.firestore.FieldValue.serverTimestamp()
     })
     .catch(function() {});
}
