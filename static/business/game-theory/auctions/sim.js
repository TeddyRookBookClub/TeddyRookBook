/* Game Theory, Chapter 9: Auctions. Three interactive pieces:
   1. bid against computer bidders in four formats (main simulation, with missions),
   2. revenue equivalence by simulation, 3. the winner's curse with a jar of coins.
   The models are in model.js (window.GT9M), tested in node. */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, M = W.GT9M, root = D.getElementById('gt9-lab');
  if (!root || !L || !M) return;
  /* ---------- drawing and UI helpers (the same in every Game Theory chapter from 8 on) ---------- */
  var fmt = L.fmt, reduced = L.reduced;
  var C = { green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', violet: '#b197fc', orange: '#ffa94d',
    ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', grid: 'rgba(120,170,200,.10)', panel: 'rgba(11,27,39,.92)', bg: '#06111a' };
  var FONT = 'system-ui,-apple-system,"Segoe UI",sans-serif', MONO = 'ui-monospace,Menlo,Consolas,monospace';
  function $(id) { return D.getElementById(id); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function grp(v, d) { var s = fmt(v, d || 0), neg = s.charAt(0) === '−'; if (neg) s = s.slice(1); var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (neg ? '−' : '') + p.join('.'); }
  function money(v, d) { var s = grp(Math.abs(v), d || 0); return (v < 0 && +Math.abs(v).toFixed(d || 0) !== 0 ? '−$' : '$') + s; }
  function pct(v, d) { return fmt(100 * v, d === undefined ? 0 : d) + '%'; }
  function label(c, text, x, y, col, o) {
    o = o || {};
    c.save(); c.font = (o.bold ? '600 ' : '') + (o.size || 12) + 'px ' + (o.mono ? MONO : FONT);
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'middle';
    if (o.max) { var tw = c.measureText(text).width; if (tw > o.max) { var sc = o.max / tw; c.font = (o.bold ? '600 ' : '') + Math.max(8, (o.size || 12) * sc) + 'px ' + (o.mono ? MONO : FONT); } }
    if (!o.plain) { c.lineWidth = 3.5; c.strokeStyle = 'rgba(6,17,26,.92)'; c.lineJoin = 'round'; c.strokeText(text, x, y); }
    c.fillStyle = col; c.fillText(text, x, y); c.restore();
  }
  function textW(c, text, size, bold) { c.save(); c.font = (bold ? '600 ' : '') + (size || 12) + 'px ' + FONT; var w = c.measureText(text).width; c.restore(); return w; }
  function rrect(c, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function bg(c, w, h) { var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1c2a'); g.addColorStop(1, '#06111a'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  function panelBox(c, x, y, w, h, title, col) {
    c.fillStyle = 'rgba(255,255,255,.035)'; c.strokeStyle = 'rgba(120,170,200,.16)'; c.lineWidth = 1; rrect(c, x, y, w, h, 10); c.fill(); c.stroke();
    if (title) label(c, title, x + 10, y + 13, col || C.muted, { size: 10.5, bold: true, max: w - 20 });
  }
  function dot(c, x, y, r, col, o) {
    o = o || {}; c.save(); if (o.glow) { c.shadowColor = col; c.shadowBlur = o.glow; }
    c.beginPath(); c.arc(x, y, r, 0, 2 * Math.PI); c.fillStyle = col; c.fill();
    if (o.ring) { c.shadowBlur = 0; c.lineWidth = o.lw || 2; c.strokeStyle = o.ring; c.stroke(); }
    c.restore();
  }
  function line(c, pts, col, lw, dash) {
    if (pts.length < 2) return; c.save(); c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.lineCap = 'round'; if (dash) c.setLineDash(dash);
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.stroke(); c.restore();
  }
  function arrow(c, x, y, x2, y2, col, o) {
    o = o || {}; var dx = x2 - x, dy = y2 - y, len = Math.hypot(dx, dy); if (len < 2) return;
    var ux = dx / len, uy = dy / len, hw = o.head || 6, lw = o.width || 2;
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    if (o.dash) c.setLineDash(o.dash);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x2 - ux * hw * 1.2, y2 - uy * hw * 1.2); c.stroke(); c.setLineDash([]);
    c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - ux * hw * 1.9 - uy * hw * 0.8, y2 - uy * hw * 1.9 + ux * hw * 0.8); c.lineTo(x2 - ux * hw * 1.9 + uy * hw * 0.8, y2 - uy * hw * 1.9 - ux * hw * 0.8); c.closePath(); c.fill(); c.restore();
  }
  /* a plot area: box {x,y,w,h}, ranges [lo,hi]; draws grid, axes, ticks and titles; returns {X, Y, ix, iy} */
  function plot(c, b, xr, yr, o) {
    o = o || {};
    var X = function (v) { return b.x + (v - xr[0]) / (xr[1] - xr[0]) * b.w; }, Y = function (v) { return b.y + b.h - (v - yr[0]) / (yr[1] - yr[0]) * b.h; };
    var ix = function (px) { return xr[0] + (px - b.x) / b.w * (xr[1] - xr[0]); }, iy = function (py) { return yr[0] + (b.y + b.h - py) / b.h * (yr[1] - yr[0]); };
    c.save(); c.lineWidth = 1;
    var xt = o.xt || nice(xr, o.nx || 5), yt = o.yt || nice(yr, o.ny || 4);
    c.strokeStyle = C.grid; c.beginPath();
    xt.forEach(function (t) { c.moveTo(X(t), b.y); c.lineTo(X(t), b.y + b.h); }); yt.forEach(function (t) { c.moveTo(b.x, Y(t)); c.lineTo(b.x + b.w, Y(t)); }); c.stroke();
    c.strokeStyle = 'rgba(143,179,198,.55)'; c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x, b.y + b.h); c.lineTo(b.x + b.w, b.y + b.h); c.stroke(); c.restore();
    var df = function (t) { return fmt(t, Math.abs(t - Math.round(t)) > 1e-9 ? (Math.abs(t * 10 - Math.round(t * 10)) > 1e-9 ? 2 : 1) : 0); }, xf = o.xf || df, yf = o.yf || df;
    if (!o.noXLabels) xt.forEach(function (t) { label(c, xf(t), X(t), b.y + b.h + 9, C.muted, { size: 10, align: 'center', plain: true }); });
    if (!o.noYLabels) yt.forEach(function (t) { label(c, yf(t), b.x - 5, Y(t), C.muted, { size: 10, align: 'right', plain: true }); });
    if (o.xl) label(c, o.xl, b.x + b.w - 2, b.y + b.h - 9, C.muted, { size: 10.5, align: 'right' });
    if (o.yl) label(c, o.yl, b.x + 2, b.y - 9, C.muted, { size: 10.5, plain: true });
    return { X: X, Y: Y, ix: ix, iy: iy, b: b };
  }
  function nice(r, n) {
    var span = r[1] - r[0], raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag, st = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag, out = [];
    for (var t = Math.ceil(r[0] / st - 1e-9) * st; t <= r[1] + st * 1e-6; t += st) out.push(+t.toFixed(10));
    return out;
  }
  function seg(groupEl, attr, val) { groupEl.querySelectorAll('button[' + attr + ']').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(val))); }); }
  function readout(dl, rows) { dl.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd' + (r[2] ? ' style="color:' + r[2] + '"' : '') + '>' + r[1] + '</dd>'; }).join(''); }
  /* pointer dragging on a canvas: pick(x,y) returns a target or null; move(target,x,y); up(target) */
  function drag(cv, pick, move, up, hover) {
    var cur = null, id = null;
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener('pointerdown', function (e) { var p = pos(e); cur = pick(p[0], p[1], e); if (cur === null || cur === undefined) return; id = e.pointerId; try { cv.setPointerCapture(id); } catch (er) { } e.preventDefault(); move(cur, p[0], p[1], e); });
    cv.addEventListener('pointermove', function (e) { var p = pos(e); if (cur !== null && cur !== undefined && e.pointerId === id) { move(cur, p[0], p[1], e); e.preventDefault(); } else if (hover) hover(p[0], p[1]); });
    function end(e) { if (cur !== null && cur !== undefined && e.pointerId === id) { var t = cur; cur = null; if (up) up(t); } }
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  }
  function celebrate(view, text) { L.toast(view, text); if (!reduced) { view.classList.remove('gt9-win'); void view.offsetWidth; view.classList.add('gt9-win'); } }
  /* seeded random numbers, so a "new round" button can be replayed in tests */
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }


  var FMT = {
    fpa: { name: 'First-price sealed bid', short: 'First-price', rule: 'Highest sealed bid wins and pays its own bid.', sealed: true },
    spa: { name: 'Second-price sealed bid', short: 'Second-price', rule: 'Highest sealed bid wins but pays the second-highest bid.', sealed: true },
    eng: { name: 'English (ascending clock)', short: 'English', rule: 'Price rises; the last one left wins at the price where the others quit.', sealed: false },
    dut: { name: 'Dutch (descending clock)', short: 'Dutch', rule: 'Price falls; the first to shout “Mine!” wins and pays that price.', sealed: false }
  };
  var BOTS = [{ n: 'Ada', col: '#74c0fc', q: 'shades by the book' }, { n: 'Bo', col: '#f9a8d4', q: 'calm and exact' }, { n: 'Cy', col: '#ffa94d', q: 'never overpays' },
    { n: 'Dot', col: '#b197fc', q: 'patient as a tortoise' }, { n: 'Eli', col: '#63e6be', q: 'does the math every time' }];

  /* =====================================================================================
     1. THE AUCTION HOUSE
     ===================================================================================== */
  (function () {
    var view = $('gt9-view'), cv = $('gt9-cv'), hud = $('gt9-hud'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, V = 100, store = L.store('gt9');
    var el = { fmt: $('gt9-fmt'), n: $('gt9-n'), bid: $('gt9-bid'), bidO: $('gt9-bid-o'), bidRow: $('gt9-bid-row'), act: $('gt9-act'), theory: $('gt9-theory'), read: $('gt9-read'), reset: $('gt9-reset'), skip: $('gt9-skip') };
    var R = rng((Date.now() & 0xffff) + 17);
    var S = { fmt: 'fpa', n: 4, phase: 'bid', vals: [], bids: [], price: 0, out: [], stopAt: -1, win: -1, pay: 0, myBid: 50, reveal: 0, t: 0, showTheory: store.get('theory', true) !== false,
      stats: { rounds: 0, total: 0, bench: 0, won: 0 }, log: [], msg: '', hudTxt: '', flash: 0 };
    function theoryBid(v) { return S.fmt === 'fpa' || S.fmt === 'dut' ? (S.n - 1) / S.n * v : v; }
    function botBid(v) { return S.fmt === 'fpa' || S.fmt === 'dut' ? Math.round((S.n - 1) / S.n * v * 10) / 10 : v; }
    function newRound() {
      S.vals = []; for (var i = 0; i < S.n; i++) S.vals.push(Math.round(R() * V * 10) / 10);
      S.bids = S.vals.map(function (v, i) { return i === 0 ? NaN : botBid(v); });
      S.out = S.vals.map(function () { return false; }); S.stopAt = -1; S.win = -1; S.pay = 0; S.reveal = 0; S.t = 0; S.msg = '';
      S.phase = FMT[S.fmt].sealed ? 'bid' : 'ready'; S.price = S.fmt === 'dut' ? V : 0;
      if (FMT[S.fmt].sealed) { S.myBid = clamp(Math.round(S.vals[0] * 0.6), 0, V); el.bid.value = S.myBid; }
      sync();
    }
    function finish(myEff) {
      // myEff: your effective bid (sealed bid, drop-out price, or stop price); S.win and S.pay already set
      var my = S.win === 0 ? S.vals[0] - S.pay : 0;
      // the textbook bidder in your seat, against the same rivals
      var tb = theoryBid(S.vals[0]), others = S.bids.slice(1), hi = Math.max.apply(null, others), tPay = 0;
      if (S.fmt === 'fpa' || S.fmt === 'dut') tPay = tb > hi ? S.vals[0] - tb : 0;
      else tPay = tb > hi ? S.vals[0] - hi : 0;
      S.stats.rounds++; S.stats.total += my; S.stats.bench += tPay; if (S.win === 0) S.stats.won++;
      S.log.unshift({ f: FMT[S.fmt].short, v: S.vals[0], b: myEff, won: S.win === 0, p: my, t: tPay }); if (S.log.length > 6) S.log.pop();
      S.phase = 'reveal'; S.reveal = 0; S.flash = 1;
      S.msg = S.win === 0 ? (my >= 0 ? 'You win! You pay ' + money(S.pay, 1) + ' for something worth ' + money(S.vals[0], 1) + ' to you: +' + money(my, 1) + '.' : 'You win… but you pay ' + money(S.pay, 1) + ' for something worth ' + money(S.vals[0], 1) + ': ' + money(my, 1) + '.')
        : BOTS[S.win - 1].n + ' wins and pays ' + money(S.pay, 1) + '.';
      check(myEff, my); sync();
    }
    function submit() { // sealed bid
      S.bids[0] = S.myBid; var hi = -1, wi = -1, sec = 0;
      S.bids.forEach(function (b, i) { if (b > hi || (b === hi && i === 0)) { sec = hi; hi = b; wi = i; } else if (b > sec) sec = b; });
      S.win = wi; S.pay = S.fmt === 'fpa' ? hi : Math.max(0, sec); finish(S.myBid);
    }
    function act() {
      if (S.phase === 'bid') submit();
      else if (S.phase === 'ready') { S.phase = 'clock'; sync(); }
      else if (S.phase === 'clock') {
        if (S.fmt === 'eng' && !S.out[0]) { S.out[0] = true; S.bids[0] = S.price; S.drop0 = S.price; sync(); }
        else if (S.fmt === 'dut') { S.win = 0; S.pay = S.price; S.bids[0] = S.price; finish(S.price); }
      } else if (S.phase === 'reveal') newRound();
    }
    function tickClock(dt) {
      var sp = (S.fmt === 'eng' && S.out[0] ? 30 : 10) * dt;
      if (S.fmt === 'eng') {
        S.price = Math.min(V, S.price + sp);
        for (var i = 1; i < S.n; i++) if (!S.out[i] && S.price >= S.vals[i]) { S.out[i] = true; S.bids[i] = S.vals[i]; }
        var left = []; S.out.forEach(function (o, i) { if (!o) left.push(i); });
        if (left.length <= 1) {
          var dropPrices = S.bids.filter(function (b, i) { return left.indexOf(i) < 0; }), p = dropPrices.length ? Math.max.apply(null, dropPrices) : 0;
          if (left.length === 1) { S.win = left[0]; S.pay = p; }
          else { var hi = -1; S.bids.forEach(function (b, i) { if (b >= hi) { hi = b; S.win = i; } }); S.pay = hi; } // everyone out at once: the last to quit wins
          finish(S.out[0] ? S.drop0 : V);
        }
      } else {
        S.price = Math.max(0, S.price - sp);
        for (var j = 1; j < S.n; j++) if (S.price <= S.bids[j]) { S.win = j; S.pay = S.bids[j]; S.price = S.bids[j]; finish(0); return; }
      }
    }
    function setFmt(f) { S.fmt = f; newRound(); }
    el.fmt.addEventListener('click', function (e) { var b = e.target.closest('button[data-f]'); if (b) setFmt(b.dataset.f); });
    el.n.addEventListener('click', function (e) { var b = e.target.closest('button[data-n]'); if (b) { S.n = +b.dataset.n; newRound(); } });
    el.bid.addEventListener('input', function () { if (S.phase === 'bid') { S.myBid = +el.bid.value; sync(); } });
    el.act.addEventListener('click', act);
    el.skip.addEventListener('click', newRound);
    el.theory.addEventListener('change', function () { S.showTheory = el.theory.checked; store.set('theory', S.showTheory); });
    el.reset.addEventListener('click', function () { S.stats = { rounds: 0, total: 0, bench: 0, won: 0 }; S.log = []; newRound(); });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true;
      if (k === ' ' || k === 'Enter') act();
      else if ((k === 'ArrowUp' || k === 'ArrowRight') && S.phase === 'bid') { S.myBid = clamp(S.myBid + (e.shiftKey ? 5 : 0.5), 0, V); el.bid.value = S.myBid; sync(); }
      else if ((k === 'ArrowDown' || k === 'ArrowLeft') && S.phase === 'bid') { S.myBid = clamp(S.myBid - (e.shiftKey ? 5 : 0.5), 0, V); el.bid.value = S.myBid; sync(); }
      else used = false;
      if (used) e.preventDefault();
    });
    // drag on the payoff chart sets your sealed bid
    var chartBox = null;
    drag(cv, function (x, y) { if (S.phase !== 'bid' || !chartBox) return null; var b = chartBox.b; return x >= b.x - 8 && x <= b.x + b.w + 8 && y >= b.y - 8 && y <= b.y + b.h + 8 ? 1 : null; },
      function (t, x) { S.myBid = clamp(Math.round(chartBox.ix(x) * 2) / 2, 0, V); el.bid.value = S.myBid; sync(); });

    /* missions */
    var MIS = [
      { id: 'first', title: 'First win', goal: 'Win any auction and come out ahead.' },
      { id: 'truth', title: 'Tell the truth', goal: 'In a second-price auction, bid within $1 of your value, and win.' },
      { id: 'shade', title: 'Shade like a pro', goal: 'First-price, at least 3 bidders: bid within $2 of the textbook bid, (n − 1)/n of your value.' },
      { id: 'english', title: 'Last one standing', goal: 'Win an English auction. Notice what you pay.' },
      { id: 'dutch', title: 'Nerves of steel', goal: 'Win a Dutch auction with a profit of at least $15.' },
      { id: 'ten', title: 'Match the textbook', goal: 'Play 10 rounds and finish no more than $2 behind the textbook bidder in your seat, or ahead of it.' }
    ];
    var mis = L.missions($('gt9-missions'), 'gt9', MIS, function (id) {
      var f = { truth: 'spa', shade: 'fpa', english: 'eng', dutch: 'dut' }[id]; if (f) { S.fmt = f; if (id === 'shade' && S.n < 3) S.n = 4; newRound(); }
      L.toast(view, MIS.filter(function (m) { return m.id === id; })[0].goal);
    });
    function win(id, text) { if (mis.done(id)) celebrate(view, '✓ ' + text); }
    function check(myEff, my) {
      if (S.win === 0 && my > 0) win('first', 'You won and came out ahead.');
      if (S.fmt === 'spa' && S.win === 0 && Math.abs(myEff - S.vals[0]) <= 1) win('truth', 'Truthful bidding: you won and paid only the second-highest bid.');
      if (S.fmt === 'fpa' && S.n >= 3 && Math.abs(myEff - (S.n - 1) / S.n * S.vals[0]) <= 2) win('shade', 'Textbook shading: high enough to win often, low enough to profit.');
      if (S.fmt === 'eng' && S.win === 0) win('english', 'You paid the price where the last rival quit: the second-highest value.');
      if (S.fmt === 'dut' && S.win === 0 && my >= 15) win('dutch', 'Nerves of steel! A Dutch auction is a first-price auction in disguise.');
      if (S.stats.rounds >= 10 && S.stats.total >= S.stats.bench - 2) win('ten', 'Ten rounds, and you kept up with the textbook bidder.');
    }

    function sync() {
      seg(el.fmt, 'data-f', S.fmt); seg(el.n, 'data-n', S.n);
      el.bidRow.hidden = !FMT[S.fmt].sealed; el.bid.disabled = S.phase !== 'bid';
      el.bidO.textContent = money(S.myBid, 1); el.theory.checked = S.showTheory;
      el.act.textContent = S.phase === 'bid' ? 'Submit my bid of ' + money(S.myBid, 1) : S.phase === 'ready' ? 'Start the clock' : S.phase === 'clock' ? (S.fmt === 'eng' ? (S.out[0] ? 'You’re out…' : 'Drop out at ' + money(S.price, 0)) : 'Mine! Buy at ' + money(S.price, 0)) : 'Next round';
      el.act.disabled = S.phase === 'clock' && S.fmt === 'eng' && S.out[0];
      var v = S.vals[0], wp, eu;
      if (FMT[S.fmt].sealed || S.fmt === 'dut') { var b = FMT[S.fmt].sealed ? S.myBid : S.price; wp = S.fmt === 'spa' ? M.spaWinProb(b, S.n, V) : M.fpaWinProb(b, S.n, V); eu = S.fmt === 'spa' ? M.spaPayoff(b, v, S.n, V) : M.fpaPayoff(b, v, S.n, V); }
      readout(el.read, [['Your value this round', money(v, 1)], ['Textbook bid', money(theoryBid(v), 1)], ['Chance to win at your bid', wp === undefined ? '—' : pct(wp)], ['Expected profit at your bid', eu === undefined ? '—' : money(eu, 2)],
        ['Rounds played (won)', S.stats.rounds + ' (' + S.stats.won + ')'], ['Your total profit', money(S.stats.total, 1)], ['Textbook bidder in your seat', money(S.stats.bench, 1)]]);
      var t = '<b>' + FMT[S.fmt].name + '</b> · ' + S.n + ' bidders<br>' + FMT[S.fmt].rule;
      if (t !== S.hudTxt) { hud.innerHTML = t; S.hudTxt = t; }
    }

    /* drawing */
    function avatar(x, y, r, col, letter, dim, ring) {
      c.save(); c.globalAlpha = dim ? 0.35 : 1;
      var g = c.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.2, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(0.18, col); g.addColorStop(1, col);
      c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = g; c.fill();
      if (ring) { c.lineWidth = 3; c.strokeStyle = ring; c.stroke(); }
      c.restore(); label(c, letter, x, y + 1, '#06111a', { size: r * 0.9, bold: true, align: 'center', plain: true });
    }
    function frame(dt) {
      G.fit(); var w = G.w, h = G.h, narrow = w < 600; bg(c, w, h);
      if (S.phase === 'clock') { tickClock(dt); if (S.phase === 'clock') { sync(); } }
      S.reveal = Math.min(1, S.reveal + dt * (reduced ? 10 : 1.6)); S.flash = Math.max(0, S.flash - dt);
      var topY = narrow ? 96 : 66, hall = { x: 10, y: topY, w: w - 20, h: narrow ? 300 : 290 };
      panelBox(c, hall.x, hall.y, hall.w, hall.h, 'THE BIDDERS · BARS SHOW VALUES ON A $0–$100 SCALE');
      var n = S.n, colW = (hall.w - 70) / n, sx = hall.x + 56, barTop = hall.y + (narrow ? 92 : 84), barBot = hall.y + hall.h - 30, Y = function (v) { return barBot - v / V * (barBot - barTop); };
      // scale
      [0, 25, 50, 75, 100].forEach(function (t) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(sx - 6, Y(t)); c.lineTo(hall.x + hall.w - 10, Y(t)); c.stroke(); label(c, '$' + t, sx - 10, Y(t), C.muted, { size: 10, align: 'right', plain: true }); });
      var revealed = S.phase === 'reveal';
      for (var i = 0; i < n; i++) {
        var cx = sx + colW * (i + 0.5), me = i === 0, bot = BOTS[i - 1], col = me ? C.gold : bot.col, name = me ? 'You' : bot.n, dim = S.out[i] && S.fmt === 'eng';
        var isWin = revealed && S.win === i;
        avatar(cx, hall.y + 38, narrow ? 15 : 19, col, me ? '★' : name.charAt(0), dim, isWin ? '#fff' : null);
        label(c, name, cx, hall.y + (narrow ? 64 : 68), me ? C.gold : C.ink, { size: narrow ? 10.5 : 12, bold: true, align: 'center' });
        var bw = Math.min(26, colW * 0.42), showVal = me || revealed || (S.fmt === 'eng' && S.out[i]);
        c.fillStyle = 'rgba(255,255,255,.05)'; rrect(c, cx - bw / 2, barTop, bw, barBot - barTop, 5); c.fill();
        if (showVal) {
          var vv = S.vals[i], k = me || !revealed || (S.fmt === 'eng' && S.out[i] && i !== S.win) ? 1 : ease(clamp(S.reveal * n - (i - 1) * 0.6, 0, 1));
          var top = Y(vv * k), gr = c.createLinearGradient(0, barBot, 0, top); gr.addColorStop(0, 'rgba(255,255,255,.08)'); gr.addColorStop(1, col);
          c.fillStyle = gr; rrect(c, cx - bw / 2, top, bw, barBot - top, 5); c.fill();
          label(c, money(vv, 0), cx, Math.max(barTop - 10, top - 10), col, { size: 10.5, bold: true, align: 'center' });
        } else { label(c, '?', cx, (barTop + barBot) / 2, C.muted, { size: 20, bold: true, align: 'center' }); }
        // bids: sealed after reveal; English drop-out points; Dutch: the stopper
        var bidShown = revealed && isFinite(S.bids[i]) && (FMT[S.fmt].sealed || (S.fmt === 'eng' && S.out[i]) || (S.fmt === 'dut' && i === S.win));
        if (S.fmt === 'eng' && S.out[i] && isFinite(S.bids[i])) bidShown = true;
        if (me && S.phase === 'bid') { line(c, [[cx - bw / 2 - 6, Y(S.myBid)], [cx + bw / 2 + 6, Y(S.myBid)]], '#fff', 3); label(c, 'bid ' + money(S.myBid, 1), cx + bw / 2 + 8, Y(S.myBid), '#fff', { size: 10.5, max: colW / 2 - 4 }); }
        if (bidShown) {
          var by = Y(S.bids[i]); line(c, [[cx - bw / 2 - 6, by], [cx + bw / 2 + 6, by]], '#fff', 3);
          label(c, (S.fmt === 'eng' ? 'out ' : 'bid ') + money(S.bids[i], 1), cx + bw / 2 + 8, by, '#fff', { size: 10.5, max: colW / 2 - 4 });
        }
        if (isWin) label(c, 'WINS', cx, barBot + 14, '#fff', { size: 11, bold: true, align: 'center' });
        else if (dim) label(c, 'out', cx, barBot + 14, C.muted, { size: 11, align: 'center' });
        else if (FMT[S.fmt].sealed && S.phase === 'bid' && !me) label(c, '✉ sealed', cx, barBot + 14, C.muted, { size: 10.5, align: 'center' });
      }
      // the price line
      if (!FMT[S.fmt].sealed && (S.phase === 'clock' || S.phase === 'ready' || revealed)) {
        var py = Y(revealed ? S.pay : S.price), pc = S.fmt === 'eng' ? C.green : C.pink;
        c.save(); c.shadowColor = pc; c.shadowBlur = 10; line(c, [[sx - 6, py], [hall.x + hall.w - 10, py]], pc, 2.5); c.restore();
        label(c, (S.fmt === 'eng' ? '▲ ' : '▼ ') + money(revealed ? S.pay : S.price, 1), hall.x + hall.w - 12, py - 10, pc, { size: 12, bold: true, align: 'right' });
      } else if (revealed && FMT[S.fmt].sealed) {
        var py2 = Y(S.pay); line(c, [[sx - 6, py2], [hall.x + hall.w - 10, py2]], C.green, 2, [6, 5]);
        label(c, 'price ' + money(S.pay, 1), hall.x + hall.w - 12, py2 - 10, C.green, { size: 12, bold: true, align: 'right' });
      }
      // the message strip
      var my0 = hall.y + hall.h + 6, msg = S.msg || (S.phase === 'bid' ? 'Your value is ' + money(S.vals[0], 1) + '. Set your bid with the slider, the arrow keys or the chart, then submit.' : S.phase === 'ready' ? 'Your value is ' + money(S.vals[0], 1) + '. Start the clock when you’re ready.' : S.fmt === 'eng' ? (S.out[0] ? 'You dropped out. Watching the others…' : 'The price is rising. Drop out when staying in no longer pays.') : 'The price is falling. Shout “Mine!” before someone else does.');
      var good = S.phase === 'reveal' && S.win === 0 && S.vals[0] - S.pay >= 0, bad = S.phase === 'reveal' && S.win === 0 && S.vals[0] - S.pay < 0;
      c.fillStyle = good ? 'rgba(99,230,190,' + (0.12 + 0.25 * S.flash) + ')' : bad ? 'rgba(255,135,135,.16)' : 'rgba(255,255,255,.04)';
      c.strokeStyle = good ? C.green : bad ? C.red : 'rgba(120,170,200,.16)'; rrect(c, 10, my0, w - 20, 30, 10); c.fill(); c.stroke();
      var mcol = good ? C.green : bad ? C.red : S.phase === 'reveal' ? '#fff' : C.ink, msz = narrow ? 11.5 : 13;
      if (textW(c, msg, msz, S.phase === 'reveal') > w - 40) { // two lines, split at the space nearest the middle
        var mid = msg.length / 2, cut = -1; for (var q = 0; q < msg.length; q++) if (msg.charAt(q) === ' ' && (cut < 0 || Math.abs(q - mid) < Math.abs(cut - mid))) cut = q;
        label(c, msg.slice(0, cut), w / 2, my0 + 9, mcol, { size: msz - 1, bold: S.phase === 'reveal', align: 'center', max: w - 40 });
        label(c, msg.slice(cut + 1), w / 2, my0 + 22, mcol, { size: msz - 1, bold: S.phase === 'reveal', align: 'center', max: w - 40 });
      } else label(c, msg, w / 2, my0 + 15, mcol, { size: msz, bold: S.phase === 'reveal', align: 'center', max: w - 40 });
      // lower area: payoff chart and score
      var ly = my0 + 38, lh = h - ly - 10;
      var cb = narrow ? { x: 10, y: ly, w: w - 20, h: lh * 0.56 } : { x: 10, y: ly, w: (w - 30) * 0.6, h: lh };
      var sb = narrow ? { x: 10, y: ly + lh * 0.56 + 8, w: w - 20, h: lh * 0.44 - 8 } : { x: cb.x + cb.w + 10, y: ly, w: (w - 30) * 0.4, h: lh };
      var spa = S.fmt === 'spa' || S.fmt === 'eng', v = S.vals[0];
      panelBox(c, cb.x, cb.y, cb.w, cb.h, 'YOUR EXPECTED PROFIT FOR EACH ' + (S.fmt === 'eng' ? 'DROP-OUT PRICE' : S.fmt === 'dut' ? 'STOPPING PRICE' : 'BID'));
      var top = 0; for (var b = 0; b <= V; b += 1) top = Math.max(top, spa ? M.spaPayoff(b, v, n, V) : M.fpaPayoff(b, v, n, V));
      top = Math.max(1, top * 1.25); var bot0 = -top * 0.3;
      var pb = { x: cb.x + 42, y: cb.y + 30, w: cb.w - 56, h: cb.h - 54 };
      var pl = plot(c, pb, [0, V], [bot0, top], { nx: narrow ? 4 : 5, ny: 3, xf: function (t) { return '$' + t; }, yf: function (t) { return (t < 0 ? '−$' : '$') + fmt(Math.abs(t), top < 5 ? 1 : 0); } });
      chartBox = pl;
      c.save(); c.beginPath(); c.rect(pb.x, pb.y - 4, pb.w, pb.h + 4); c.clip();
      line(c, [[pb.x, pl.Y(0)], [pb.x + pb.w, pl.Y(0)]], 'rgba(143,179,198,.45)', 1);
      var seg0 = [], neg = null;
      for (b = 0; b <= V + 1e-9; b += 0.5) {
        var u = spa ? M.spaPayoff(b, v, n, V) : M.fpaPayoff(b, v, n, V), isNeg = u < -1e-9, pt = [pl.X(b), pl.Y(u)];
        if (neg !== null && isNeg !== neg) { line(c, seg0, neg ? C.red : C.blue, neg ? 2 : 2.5, neg ? [4, 4] : null); seg0 = [seg0[seg0.length - 1]]; }
        seg0.push(pt); neg = isNeg;
      }
      line(c, seg0, neg ? C.red : C.blue, neg ? 2 : 2.5, neg ? [4, 4] : null); c.restore();
      line(c, [[pl.X(v), pb.y], [pl.X(v), pb.y + pb.h]], 'rgba(255,212,121,.35)', 1, [3, 3]); label(c, 'your value', pl.X(v) + 4, pb.y + 8, C.gold, { size: 10 });
      if (S.showTheory) { var tb = theoryBid(v), tu = spa ? M.spaPayoff(tb, v, n, V) : M.fpaPayoff(tb, v, n, V); dot(c, pl.X(tb), pl.Y(tu), 5.5, C.green, { glow: 10 }); label(c, 'best ' + money(tb, 1), pl.X(tb), pl.Y(tu) - 13, C.green, { size: 10.5, bold: true, align: 'center' }); }
      var mb = FMT[S.fmt].sealed ? (S.phase === 'bid' ? S.myBid : S.bids[0]) : S.fmt === 'dut' ? (revealed && S.win === 0 ? S.pay : S.price) : (S.out[0] ? S.drop0 : S.price);
      if (isFinite(mb)) { var mu = spa ? M.spaPayoff(mb, v, n, V) : M.fpaPayoff(mb, v, n, V); dot(c, pl.X(mb), pl.Y(Math.max(bot0, mu)), 6, C.gold, { ring: '#fff', lw: 1.5 }); }
      if (FMT[S.fmt].sealed && S.phase === 'bid') label(c, 'drag here to set your bid', pb.x + pb.w, pb.y + pb.h - 10, C.muted, { size: 10, align: 'right' });
      // score
      panelBox(c, sb.x, sb.y, sb.w, sb.h, 'LAST ROUNDS');
      var rowH = narrow ? 17 : 19, cols = narrow ? [0, 0.3, 0.52, 0.74] : [0, 0.32, 0.53, 0.75], tx = sb.x + 10, tw = sb.w - 20;
      ['format', 'value', 'you got', 'textbook'].forEach(function (s, k) { label(c, s, tx + cols[k] * tw, sb.y + 32, C.muted, { size: 10 }); });
      S.log.forEach(function (r, k) {
        var yy = sb.y + 32 + rowH * (k + 1); if (yy > sb.y + sb.h - 30) return;
        label(c, r.f, tx, yy, C.ink, { size: 10.5, max: cols[1] * tw - 4 }); label(c, money(r.v, 0), tx + cols[1] * tw, yy, C.ink, { size: 10.5 });
        label(c, (r.won ? '' : '— ') + money(r.p, 1), tx + cols[2] * tw, yy, r.p > 0 ? C.green : r.p < 0 ? C.red : C.muted, { size: 10.5 });
        label(c, money(r.t, 1), tx + cols[3] * tw, yy, C.muted, { size: 10.5 });
      });
      if (!S.log.length) label(c, 'Your results will appear here.', tx, sb.y + 52, C.muted, { size: 11 });
      label(c, 'Total: you ' + money(S.stats.total, 1) + ' · textbook ' + money(S.stats.bench, 1), tx, sb.y + sb.h - 13, S.stats.total >= S.stats.bench ? C.green : C.gold, { size: 11, bold: true, max: tw });
    }
    newRound(); L.loop(frame, cv);
  })();

  /* =====================================================================================
     2. REVENUE EQUIVALENCE BY SIMULATION
     ===================================================================================== */
  (function () {
    var cv = $('gt9-rc'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, V = 100, R = rng(4242), NB = 40;
    var el = { n: $('gt9-rn'), a: $('gt9-ra'), aO: $('gt9-ra-o'), r: $('gt9-rr'), rO: $('gt9-rr-o'), go: $('gt9-rgo'), clr: $('gt9-rclr'), read: $('gt9-rread') };
    var P = { n: 4, a: 1, r: 0 }, S;
    var KEYS = [{ k: 'fpa', name: 'First-price (and Dutch)', col: C.gold }, { k: 'spa', name: 'Second-price (and English)', col: C.blue }, { k: 'ap', name: 'All-pay', col: C.pink }];
    function clear() { S = { T: 0, sum: { fpa: 0, spa: 0, ap: 0 }, sq: { fpa: 0, spa: 0, ap: 0 }, hist: { fpa: [], spa: [], ap: [] }, path: { fpa: [], spa: [], ap: [] }, unsold: 0, run: S ? S.run : false }; KEYS.forEach(function (k) { for (var i = 0; i < NB; i++) S.hist[k.k][i] = 0; }); }
    function theory() { return { fpa: V * M.revTheoryFPA(P.n, P.a, P.r / V), spa: V * M.revTheorySPA(P.n, P.r / V), ap: P.a === 1 && P.r === 0 ? V * (P.n - 1) / (P.n + 1) : NaN }; }
    var TH = null;
    function sync() {
      seg(el.n, 'data-n', P.n); el.a.value = P.a; el.aO.textContent = P.a >= 1 ? '1 (risk neutral)' : fmt(P.a, 2); el.r.value = P.r; el.rO.textContent = money(P.r);
      el.go.textContent = S.run ? '❚❚ Pause' : (S.T ? '▶ Keep going' : '▶ Run 20,000 auctions');
      TH = theory(); var rows = [['Auctions run', grp(S.T)]];
      KEYS.forEach(function (k) { var m = S.sum[k.k] / S.T, se = Math.sqrt(Math.max(0, S.sq[k.k] / S.T - m * m) / S.T); rows.push([k.name, isNaN(TH[k.k]) ? 'n/a here' : S.T ? money(m, 2) + ' ± ' + fmt(2 * se, 2) : '—']); });
      rows.push(['Theory, first-price', money(TH.fpa, 2)]); rows.push(['Theory, second-price', money(TH.spa, 2)]); rows.push(['Unsold (below the reserve)', S.T ? pct(S.unsold / S.T, 1) : '—']);
      readout(el.read, rows);
    }
    el.n.addEventListener('click', function (e) { var b = e.target.closest('button[data-n]'); if (!b) return; P.n = +b.dataset.n; clear(); sync(); });
    el.a.addEventListener('input', function () { P.a = +el.a.value; clear(); sync(); });
    el.r.addEventListener('input', function () { P.r = +el.r.value; clear(); sync(); });
    el.go.addEventListener('click', function () { if (S.T >= 20000 && !S.run) clear(); S.run = !S.run; sync(); });
    el.clr.addEventListener('click', function () { clear(); S.run = false; sync(); });
    function batch(k) {
      for (var i = 0; i < k; i++) {
        var o = M.simulate(P.n, V, P.a, P.r, R); S.T++; if (!o.sold) S.unsold++;
        KEYS.forEach(function (q) { var x = o[q.k]; if (isNaN(x)) return; S.sum[q.k] += x; S.sq[q.k] += x * x; S.hist[q.k][Math.min(NB - 1, Math.floor(x / V * NB))]++; });
        if (S.T % 50 === 0 || S.T < 50) KEYS.forEach(function (q) { if (!isNaN(o[q.k])) S.path[q.k].push([S.T, S.sum[q.k] / S.T]); });
      }
    }
    function frame(dt) {
      G.fit(); var w = G.w, h = G.h, narrow = w < 640; bg(c, w, h);
      if (S.run) { batch(S.T < 500 ? 10 : 200); if (S.T >= 20000) S.run = false; sync(); }
      var A = narrow ? { x: 10, y: 10, w: w - 20, h: h * 0.42 } : { x: 10, y: 10, w: w * 0.5 - 15, h: h - 20 };
      var B = narrow ? { x: 10, y: A.y + A.h + 10, w: w - 20, h: h - A.h - 30 } : { x: w * 0.5 + 5, y: 10, w: w * 0.5 - 15, h: h - 20 };
      panelBox(c, A.x, A.y, A.w, A.h, 'AVERAGE REVENUE SO FAR');
      var pl = plot(c, { x: A.x + 46, y: A.y + 34, w: A.w - 62, h: A.h - 76 }, [0, Math.max(1000, Math.ceil(S.T / 5000) * 5000)], [0, V], { nx: 4, ny: 4, xf: function (t) { return t >= 1000 ? fmt(t / 1000, 0) + 'k' : fmt(t, 0); }, yf: function (t) { return '$' + t; }, xl: 'auctions' });
      KEYS.forEach(function (k) { if (!isNaN(TH[k.k])) { var ty = pl.Y(TH[k.k]); line(c, [[pl.b.x, ty], [pl.b.x + pl.b.w, ty]], k.col, 1, [4, 5]); } });
      KEYS.forEach(function (k) { line(c, S.path[k.k].map(function (p) { return [pl.X(p[0]), pl.Y(p[1])]; }), k.col, 2); });
      var lx = A.x + 10, lw = (A.w - 20) / 3; KEYS.forEach(function (k, i) { label(c, '— ' + k.name, lx + i * lw, A.y + A.h - 13, k.col, { size: 10.5, max: lw - 6 }); });
      panelBox(c, B.x, B.y, B.w, B.h, 'WHAT EACH AUCTION RAISED (HISTOGRAMS)');
      var hh = (B.h - 44) / 3;
      KEYS.forEach(function (k, i) {
        var y0 = B.y + 28 + i * hh, bx = B.x + 12, bw = B.w - 24, mx = 1; S.hist[k.k].forEach(function (v) { mx = Math.max(mx, v); });
        label(c, k.name, bx, y0 + 6, k.col, { size: 10.5, bold: true });
        if (isNaN(TH[k.k])) { label(c, 'No simple formula with risk aversion or a reserve, so it’s left out.', bx, y0 + hh / 2, C.muted, { size: 10.5, max: bw }); return; }
        var base = y0 + hh - 16, hgt = hh - 30;
        S.hist[k.k].forEach(function (v, j) { var bh = v / mx * hgt; c.fillStyle = k.col; c.globalAlpha = 0.75; c.fillRect(bx + j * bw / NB + 0.5, base - bh, bw / NB - 1, bh); c.globalAlpha = 1; });
        c.strokeStyle = 'rgba(143,179,198,.5)'; c.beginPath(); c.moveTo(bx, base); c.lineTo(bx + bw, base); c.stroke();
        [0, 25, 50, 75, 100].forEach(function (t) { label(c, '$' + t, bx + t / V * bw, base + 8, C.muted, { size: 9.5, align: t === 0 ? 'left' : t === 100 ? 'right' : 'center', plain: true }); });
        if (S.T) { var m = S.sum[k.k] / S.T, mx2 = bx + m / V * bw; line(c, [[mx2, base - hgt - 2], [mx2, base]], '#fff', 2); label(c, 'avg ' + money(m, 1), mx2 + 4, base - hgt + 6, '#fff', { size: 10.5, bold: true }); }
      });
    }
    clear(); sync(); L.loop(frame, cv);
  })();

  /* =====================================================================================
     3. THE WINNER'S CURSE
     ===================================================================================== */
  (function () {
    var cv = $('gt9-wc'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, R = rng(31337), NB = 40;
    var el = { n: $('gt9-wn'), nO: $('gt9-wn-o'), e: $('gt9-we'), eO: $('gt9-we-o'), m: $('gt9-wm'), mO: $('gt9-wm-o'), one: $('gt9-w1'), many: $('gt9-w1k'), be: $('gt9-wbe'), clr: $('gt9-wclr'), read: $('gt9-wread') };
    var P = { n: 8, E: 25, m: 0 }, S;
    var coins = []; (function () { var r2 = rng(5); for (var i = 0; i < 140; i++) coins.push([r2(), r2(), r2()]); })();
    function clear() { S = { T: 0, sum: 0, loss: 0, hist: [], last: null, t: 1 }; for (var i = 0; i < NB; i++) S.hist[i] = 0; }
    function one(record) {
      var X = Math.round(60 + R() * 80), o = M.curseRound(P.n, X, P.E, P.m, R); o.X = X;
      S.T++; S.sum += o.profit; if (o.profit < 0) S.loss++; var j = Math.floor((o.profit + 60) / 120 * NB); S.hist[clamp(j, 0, NB - 1)]++;
      if (record) { S.last = o; S.t = 0; }
    }
    function sync() {
      el.n.value = P.n; el.nO.textContent = P.n; el.e.value = P.E; el.eO.textContent = '± ' + money(P.E); el.m.value = P.m; el.mO.textContent = money(P.m);
      var be = M.breakEvenShade(P.n, P.E);
      readout(el.read, [['Auctions held', grp(S.T)], ['Average profit of the winner', S.T ? money(S.sum / S.T, 2) : '—'], ['Winners who lost money', S.T ? pct(S.loss / S.T) : '—'], ['Theory: average profit', money(P.m - be, 2)], ['Shade needed to break even', money(be, 2)]]);
    }
    el.n.addEventListener('input', function () { P.n = +el.n.value; clear(); sync(); });
    el.e.addEventListener('input', function () { P.E = +el.e.value; clear(); sync(); });
    el.m.addEventListener('input', function () { P.m = +el.m.value; clear(); sync(); });
    el.one.addEventListener('click', function () { one(true); sync(); });
    el.many.addEventListener('click', function () { for (var i = 0; i < 999; i++) one(false); one(true); sync(); });
    el.be.addEventListener('click', function () { P.m = Math.round(M.breakEvenShade(P.n, P.E)); clear(); sync(); });
    el.clr.addEventListener('click', function () { clear(); sync(); });
    function jar(x, y, w, h, val, show) {
      c.save();
      c.strokeStyle = 'rgba(219,231,239,.7)'; c.lineWidth = 2; c.fillStyle = 'rgba(116,192,252,.06)';
      rrect(c, x, y + h * 0.12, w, h * 0.88, w * 0.18); c.fill(); c.stroke();
      c.fillStyle = 'rgba(219,231,239,.25)'; rrect(c, x + w * 0.15, y, w * 0.7, h * 0.12, 4); c.fill();
      c.beginPath(); rrect(c, x + 3, y + h * 0.12 + 3, w - 6, h * 0.88 - 6, w * 0.16); c.clip();
      var fill = 0.25 + 0.6 * clamp((val - 60) / 80, 0, 1);
      coins.forEach(function (k) { var cy = y + h - 6 - k[1] * h * 0.88 * fill, cx = x + 6 + k[0] * (w - 12), r = 3 + k[2] * 3.5; c.beginPath(); c.ellipse(cx, cy, r, r * 0.55, 0, 0, 7); c.fillStyle = k[2] > 0.55 ? '#ffd479' : k[2] > 0.25 ? '#d9a54a' : '#c8d3dc'; c.fill(); c.strokeStyle = 'rgba(6,17,26,.5)'; c.lineWidth = 0.8; c.stroke(); });
      c.restore();
      label(c, show ? 'worth ' + money(val) : 'worth ?', x + w / 2, y + h + 14, show ? '#fff' : C.muted, { size: 12, bold: true, align: 'center' });
    }
    function frame(dt) {
      G.fit(); var w = G.w, h = G.h, narrow = w < 640; bg(c, w, h); S.t = Math.min(1, S.t + dt * (reduced ? 10 : 0.8));
      var A = narrow ? { x: 10, y: 10, w: w - 20, h: h * 0.5 - 15 } : { x: 10, y: 10, w: w * 0.56 - 15, h: h - 20 };
      var B = narrow ? { x: 10, y: A.y + A.h + 10, w: w - 20, h: h - A.h - 30 } : { x: w * 0.56 + 5, y: 10, w: w * 0.44 - 15, h: h - 20 };
      panelBox(c, A.x, A.y, A.w, A.h, 'ONE AUCTION: EVERYONE ESTIMATES THE JAR, THE MOST OPTIMISTIC WINS');
      var o = S.last, jw = Math.min(110, A.w * 0.22), jh = Math.min(150, A.h - 80);
      jar(A.x + 18, A.y + 40, jw, jh, o ? o.X : 100, !!o && S.t > 0.6);
      var nx = A.x + jw + 50, nw = A.x + A.w - 20 - nx, X = o ? o.X : 100, lo = X - P.E - 10, hi = X + P.E + 10, XP = function (v) { return nx + (v - lo) / (hi - lo) * nw; };
      var ly = A.y + 70 + (A.h - 120) * 0.5;
      line(c, [[nx, ly], [nx + nw, ly]], 'rgba(143,179,198,.6)', 1.5);
      label(c, money(lo), nx, ly + 16, C.muted, { size: 10, align: 'center', plain: true }); label(c, money(hi), nx + nw, ly + 16, C.muted, { size: 10, align: 'center', plain: true });
      if (o) {
        var k = ease(S.t);
        o.est.forEach(function (s, i) { var yy = ly - 16 - (i % 4) * 9; dot(c, XP(X + (s - X) * k), yy, i === o.win ? 6 : 4.5, i === o.win ? C.red : C.blue, { glow: i === o.win ? 10 : 0 }); });
        if (S.t > 0.6) {
          var xb = XP(o.bid), xs = XP(o.est[o.win]), xt = XP(X);
          line(c, [[xt, ly - 70], [xt, ly + 30]], '#fff', 2); label(c, 'true value', xt, ly + 40, '#fff', { size: 10.5, align: 'center', bold: true });
          arrow(c, xs, ly - 58, xb, ly - 58, C.gold, { width: 2 }); label(c, 'bid ' + money(o.bid, 1), xb, ly - 70, C.gold, { size: 10.5, align: 'center', bold: true });
          label(c, 'top estimate ' + money(o.est[o.win], 1), xs, ly + 56, C.red, { size: 10.5, align: 'center', bold: true });
          var pr = o.profit; label(c, 'Winner’s profit: ' + money(pr, 1) + (pr < 0 ? '  (cursed!)' : ''), A.x + A.w / 2, A.y + A.h - 16, pr < 0 ? C.red : C.green, { size: 13, bold: true, align: 'center', max: A.w - 20 });
        }
        label(c, '● each bidder’s estimate', nx, A.y + 34, C.blue, { size: 10.5 });
      } else label(c, 'Press “Hold one auction”.', nx, ly - 30, C.muted, { size: 12 });
      panelBox(c, B.x, B.y, B.w, B.h, 'THE WINNER’S PROFIT, AUCTION AFTER AUCTION');
      var bx = B.x + 14, bw = B.w - 28, base = B.y + B.h - 34, hgt = B.h - 90, mx = 1; S.hist.forEach(function (v) { mx = Math.max(mx, v); });
      S.hist.forEach(function (v, j) { var x0 = bx + j * bw / NB, mid = -60 + (j + 0.5) * 120 / NB, bh = v / mx * hgt; c.fillStyle = mid < 0 ? C.red : C.green; c.globalAlpha = 0.8; c.fillRect(x0 + 0.5, base - bh, bw / NB - 1, bh); c.globalAlpha = 1; });
      c.strokeStyle = 'rgba(143,179,198,.5)'; c.beginPath(); c.moveTo(bx, base); c.lineTo(bx + bw, base); c.stroke();
      [-60, -30, 0, 30, 60].forEach(function (t) { label(c, money(t), bx + (t + 60) / 120 * bw, base + 10, C.muted, { size: 10, align: t === -60 ? 'left' : t === 60 ? 'right' : 'center', plain: true }); });
      var zx = bx + bw / 2; line(c, [[zx, base - hgt - 6], [zx, base]], 'rgba(255,255,255,.5)', 1, [3, 3]);
      if (S.T) { var mm = S.sum / S.T, mx2 = bx + clamp((mm + 60) / 120, 0, 1) * bw; line(c, [[mx2, base - hgt - 6], [mx2, base]], C.gold, 2.5); label(c, 'average ' + money(mm, 2), mx2, base - hgt - 14, C.gold, { size: 11, bold: true, align: 'center' }); }
      label(c, 'loss ◂  ▸ profit', zx, base + 24, C.muted, { size: 10, align: 'center' });
    }
    clear(); one(true); S.t = 1; S.T = 0; S.sum = 0; S.loss = 0; for (var q = 0; q < NB; q++) S.hist[q] = 0; sync(); L.loop(frame, cv);
  })();
})(window, document);
