/* ===================================================
   VICTOR COIN — 🧩 Tic-Tac-Toe AI
   Difficulty: Easy · Hard · Impossible
   Impossible: AI goes first, uses double-trap strategy
=================================================== */

var _ttt = {
  board:      ['','','','','','','','',''],
  human:      'X',
  ai:         'O',
  diff:       'easy',
  gameOver:   false,
  wins:       0,
  losses:     0,
  draws:      0,
  streak:     0,
  hs:         0
};

var _TTT_WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function renderTictactoe(el) {
  _ttt.wins   = 0;
  _ttt.losses = 0;
  _ttt.draws  = 0;
  _ttt.streak = 0;
  _ttt.hs     = parseInt(localStorage.getItem('vc_ttt_hs') || '0');
  _ttt.diff   = 'easy';

  el.innerHTML = '<div class="game-wrap">'
    + gameBackBtn()
    + '<div class="game-title">🧩 Tic-Tac-Toe AI</div>'
    + '<div class="ttt-diff-row">'
    + '<button class="ttt-diff ttt-diff-on" id="ttd-easy"       onclick="tttSetDiff(\'easy\')">😊 Easy</button>'
    + '<button class="ttt-diff"             id="ttd-hard"       onclick="tttSetDiff(\'hard\')">😤 Hard</button>'
    + '<button class="ttt-diff"             id="ttd-impossible" onclick="tttSetDiff(\'impossible\')">💀 Impossible</button>'
    + '</div>'
    + '<div class="ttt-stats-row">'
    + '<span class="ttt-stat" id="tttW">W: 0</span>'
    + '<span class="ttt-stat" id="tttL">L: 0</span>'
    + '<span class="ttt-stat" id="tttD">D: 0</span>'
    + '<span class="ttt-stat" id="tttS">🔥 0</span>'
    + '<span class="ttt-stat" id="tttHS">Best: ' + _ttt.hs + '</span>'
    + '</div>'
    + '<div id="tttBoard" class="ttt-board"></div>'
    + '<div class="ttt-msg" id="tttMsg"></div>'
    + '<div id="tttRetry"></div>'
    + '</div>';

  tttSetDiff('easy');
}

function tttSetDiff(diff) {
  _ttt.diff = diff;
  ['easy','hard','impossible'].forEach(function(d) {
    var b = document.getElementById('ttd-' + d);
    if (b) b.classList.toggle('ttt-diff-on', d === diff);
  });
  tttNewGame();
}

function tttNewGame() {
  _ttt.board    = ['','','','','','','','',''];
  _ttt.gameOver = false;
  _ttt.human    = 'X';
  _ttt.ai       = 'O';

  var msg = document.getElementById('tttMsg');
  var ret = document.getElementById('tttRetry');
  if (msg) msg.textContent = '';
  if (ret) ret.innerHTML   = '';

  tttRenderBoard();

  /* Impossible: AI always goes first */
  if (_ttt.diff === 'impossible') {
    setTimeout(tttAiMove, 300);
  }
}

function tttRenderBoard() {
  var el = document.getElementById('tttBoard');
  if (!el) return;
  el.innerHTML = _ttt.board.map(function(cell, i) {
    var cls = 'ttt-cell';
    if (cell === 'X') cls += ' ttt-x';
    if (cell === 'O') cls += ' ttt-o';
    return '<div class="' + cls + '" onclick="tttHumanMove(' + i + ')">' + (cell || '') + '</div>';
  }).join('');
}

function tttHumanMove(i) {
  if (_ttt.gameOver || _ttt.board[i]) return;
  _ttt.board[i] = _ttt.human;
  tttRenderBoard();
  if (tttCheckEnd()) return;
  setTimeout(tttAiMove, 350);
}

function tttAiMove() {
  if (_ttt.gameOver) return;
  var move = tttPickMove();
  if (move === -1) return;
  _ttt.board[move] = _ttt.ai;
  tttRenderBoard();
  tttCheckEnd();
}

function tttPickMove() {
  var board = _ttt.board;
  var empty = board.map(function(v, i) { return v === '' ? i : -1; }).filter(function(i) { return i >= 0; });
  if (!empty.length) return -1;

  if (_ttt.diff === 'easy') {
    /* Easy: random */
    return empty[Math.floor(Math.random() * empty.length)];
  }

  if (_ttt.diff === 'hard') {
    /* Hard: win/block, else random */
    var w = tttFindWinOrBlock(_ttt.ai);   if (w >= 0) return w;
    var b = tttFindWinOrBlock(_ttt.human); if (b >= 0) return b;
    if (board[4] === '') return 4;
    return empty[Math.floor(Math.random() * empty.length)];
  }

  /* Impossible: minimax */
  return tttMinimax(board, _ttt.ai).index;
}

function tttFindWinOrBlock(player) {
  for (var i = 0; i < _TTT_WINS.length; i++) {
    var line  = _TTT_WINS[i];
    var cells = line.map(function(j) { return _ttt.board[j]; });
    var owned = cells.filter(function(c) { return c === player; }).length;
    var empty = cells.filter(function(c) { return c === ''; }).length;
    if (owned === 2 && empty === 1) {
      return line[cells.indexOf('')];
    }
  }
  return -1;
}

function tttMinimax(board, player) {
  var empty = board.map(function(v, i) { return v === '' ? i : -1; }).filter(function(i) { return i >= 0; });
  var winner = tttWinner(board);
  if (winner === _ttt.ai)    return { score: 10 };
  if (winner === _ttt.human) return { score: -10 };
  if (!empty.length)         return { score: 0 };

  var best = player === _ttt.ai ? { score: -Infinity, index: -1 } : { score: Infinity, index: -1 };

  for (var i = 0; i < empty.length; i++) {
    var idx    = empty[i];
    board[idx] = player;
    var result = tttMinimax(board, player === _ttt.ai ? _ttt.human : _ttt.ai);
    board[idx] = '';
    result.index = idx;
    if (player === _ttt.ai) {
      if (result.score > best.score) best = result;
    } else {
      if (result.score < best.score) best = result;
    }
  }
  return best;
}

function tttWinner(board) {
  for (var i = 0; i < _TTT_WINS.length; i++) {
    var l = _TTT_WINS[i];
    if (board[l[0]] && board[l[0]] === board[l[1]] && board[l[1]] === board[l[2]]) {
      return board[l[0]];
    }
  }
  return null;
}

function tttCheckEnd() {
  var winner = tttWinner(_ttt.board);
  var full   = _ttt.board.every(function(c) { return c !== ''; });
  var msg    = document.getElementById('tttMsg');
  var ret    = document.getElementById('tttRetry');

  if (winner === _ttt.human) {
    _ttt.wins++;
    _ttt.streak++;
    if (_ttt.streak > _ttt.hs) {
      _ttt.hs = _ttt.streak;
      localStorage.setItem('vc_ttt_hs', _ttt.hs);
    }
    _ttt.gameOver = true;
    if (msg) msg.innerHTML = '<span class="ttt-win">🎉 You win!</span>';
  } else if (winner === _ttt.ai) {
    _ttt.losses++;
    _ttt.streak = 0;
    _ttt.gameOver = true;
    if (msg) msg.innerHTML = '<span class="ttt-lose">😞 AI wins!</span>';
  } else if (full) {
    _ttt.draws++;
    _ttt.gameOver = true;
    if (msg) msg.innerHTML = '<span class="ttt-draw">🤝 Draw!</span>';
  }

  tttUpdateStats();

  if (_ttt.gameOver) {
    if (ret) ret.innerHTML = '<button class="game-retry-btn" onclick="tttNewGame()">🔄 Play Again</button>';
    return true;
  }
  return false;
}

function tttUpdateStats() {
  var el;
  el = document.getElementById('tttW');  if (el) el.textContent = 'W: ' + _ttt.wins;
  el = document.getElementById('tttL');  if (el) el.textContent = 'L: ' + _ttt.losses;
  el = document.getElementById('tttD');  if (el) el.textContent = 'D: ' + _ttt.draws;
  el = document.getElementById('tttS');  if (el) el.textContent = '🔥 ' + _ttt.streak;
  el = document.getElementById('tttHS'); if (el) el.textContent = 'Best: ' + _ttt.hs;
}
