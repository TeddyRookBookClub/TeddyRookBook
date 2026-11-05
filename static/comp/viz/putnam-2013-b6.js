/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2013-b6.
   Play Bob against Alice's sum-mod-(n+1) strategy on a row of 7 spaces. */
(window.CompViz = window.CompViz || {})['putnam-2013-b6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 250, n = 7, m = 8, c = 4;
  var board, seen, turn, msg, timer = null;
  function bit(i) { return 1 << (i - 1); }
  function has(b, i) { return (b & bit(i)) !== 0; }
  function sig(b) { var s = 0; for (var i = 1; i <= n; i++) if (has(b, i)) s += i; return s % m; }
  function empties(b) { var k = 0; for (var i = 1; i <= n; i++) if (!has(b, i)) k++; return k; }
  function move(b, i) { // placement at an empty space, split at a stone
    if (!has(b, i)) return b | bit(i);
    var r = b & ~bit(i), a = i - 1, z = i + 1;
    while (a >= 1 && has(b, a)) a--;
    while (z <= n && has(b, z)) z++;
    if (a >= 1) r |= bit(a);
    if (z <= n) r |= bit(z);
    return r;
  }
  function legal(b) { var out = []; for (var i = 1; i <= n; i++) { var q = move(b, i); if (!seen[q]) out.push([i, q]); } return out; }
  function verb(b, i) { return has(b, i) ? 'split at ' + i : 'placed at ' + i; }
  function reset() {
    if (timer) { clearTimeout(timer); timer = null; }
    board = bit(c); seen = {}; seen[0] = 1; seen[board] = 1; turn = 'bob';
    msg = 'Alice opened in the middle, space 4, so the sum is 4. Your move as Bob: tap a space (empty: place a stone; stone: split it).';
  }
  function play(i) {
    if (turn !== 'bob') return;
    var q = move(board, i);
    if (seen[q]) { msg = 'That board has already occurred, so the move is not allowed. Try another space.'; render(); return; }
    var s0 = sig(board); msg = 'Bob ' + verb(board, i) + ': sum ' + s0 + ' → ' + sig(q) + '. ';
    board = q; seen[q] = 1; turn = 'alice';
    if (empties(q) <= 1) msg += 'Bob has entered the end zone (at most one empty space): 7 moves remain there, and Alice will make the last one. ';
    render();
    if (api.reduced()) alice(); else timer = setTimeout(alice, 650);
  }
  function alice() {
    timer = null;
    var opts = legal(board), pick = null, k;
    if (!opts.length) { msg += 'Alice cannot move. Bob wins.'; turn = 'over'; render(); return; }
    for (k = 0; k < opts.length; k++) if (empties(opts[k][1]) >= 2 && sig(opts[k][1]) === c) { pick = opts[k]; break; }
    if (!pick) pick = opts[0];
    var s0 = sig(board);
    msg += 'Alice ' + verb(board, pick[0]) + ': sum ' + s0 + ' → ' + sig(pick[1]) + (empties(pick[1]) >= 2 ? ' (back to 4).' : '.');
    board = pick[1]; seen[board] = 1; turn = 'bob';
    if (!legal(board).length) { msg += ' Bob has no legal move. Alice wins.'; turn = 'over'; }
    render();
  }
  function bobRandom() { if (turn !== 'bob') return; var o = legal(board); play(o[Math.floor(Math.random() * o.length)][0]); }

  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block'; svg.style.borderRadius = '8px'; svg.style.cursor = 'pointer';
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  function btn(t, f, lab) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; if (lab) b.setAttribute('aria-label', lab); b.addEventListener('click', f); bar.appendChild(b); return b; }
  var lab = D.createElement('span'); lab.textContent = 'Bob plays space:'; lab.style.fontSize = '.9em'; bar.appendChild(lab);
  for (var i = 1; i <= n; i++) (function (i) { btn(String(i), function () { play(i); }, 'Bob plays space ' + i); })(i);
  btn('Random Bob move', bobRandom); btn('New game', function () { reset(); render(); });
  var L1 = D.createElement('div'), L2 = D.createElement('div');
  [L1, L2].forEach(function (d) { d.style.cssText = 'position:absolute;transform:translate(-50%,-50%);white-space:nowrap;font-size:clamp(11px,2.6vw,16px)'; lay.appendChild(d); });
  L1.style.left = '50%'; L1.style.top = (30 / H * 100) + '%'; L2.style.left = '50%'; L2.style.top = (210 / H * 100) + '%';
  var x0 = 75, cw = 70, y0 = 75, ch = 70, lastL = '';
  svg.addEventListener('click', function (e) {
    var r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
    var i = Math.floor((x - x0) / cw) + 1; if (i >= 1 && i <= n && y > y0 - 10 && y < y0 + ch + 30) play(i);
  });
  function render() {
    var C = api.colors(), s = '<rect width="' + W + '" height="' + H + '" fill="' + C.panel + '"/>', i, sg = sig(board), open = empties(board) >= 2;
    for (i = 1; i <= n; i++) {
      var x = x0 + (i - 1) * cw;
      s += '<rect x="' + (x + 3) + '" y="' + y0 + '" width="' + (cw - 6) + '" height="' + ch + '" rx="8" fill="' + (i === c ? C.goldSoft : C.bg) + '" stroke="' + C.axis + '" stroke-width="1.5"/>';
      if (has(board, i)) s += '<circle cx="' + (x + cw / 2) + '" cy="' + (y0 + ch / 2) + '" r="22" fill="' + C.green + '"/>';
      s += '<text x="' + (x + cw / 2) + '" y="' + (y0 + ch + 22) + '" fill="' + C.muted + '" font-size="16" text-anchor="middle" font-family="system-ui,sans-serif">' + i + '</text>';
    }
    svg.innerHTML = s;
    svg.setAttribute('aria-label', 'A row of 7 spaces with stones on ' + (function () { var a = []; for (var j = 1; j <= n; j++) if (has(board, j)) a.push(j); return a.length ? 'spaces ' + a.join(', ') : 'no spaces'; })() + '. The sum of occupied spaces mod 8 is ' + sg + '.');
    var l1 = '\\sigma=\\textstyle\\sum(\\text{stones})\\bmod 8=' + sg + (open ? (sg === c ? '\\ \\checkmark' : '\\ne4') : '');
    var l2 = open ? '\\text{open board: } ' + empties(board) + '\\text{ empty spaces}' : '\\text{end zone: at most one empty space}';
    if (l1 + l2 !== lastL) { lastL = l1 + l2; api.tex(l1, L1); api.tex(l2, L2); }
    L1.style.color = open && sg === c ? C.green : C.ink; L2.style.color = open ? C.muted : C.red;
    cap.textContent = msg + (turn === 'bob' ? ' Your move.' : '');
  }
  api.onTheme(render);
  reset(); render();
};
