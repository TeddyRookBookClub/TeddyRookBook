/* Collatz paths: pick a starting number; halve it if even, else triple it and add 1; repeat. The top panel follows one
   path (height = the number), the bottom panel shows how many steps every start up to 10,000 takes. Our own drawing. */
Gallery.piece('collatz', function (g) {
  var M = Math, n0 = 27n, path = [], shown = 1, logY = true, ST = null, NS = 10000;
  var c = g.canvas({ aspect: 0.5, max: 360, min: 220, label: 'The path of one starting number, step by step' });
  var d = g.canvas({ aspect: 0.32, max: 230, min: 150, label: 'Steps to reach 1 for every start from 1 to 10,000' });
  d.el.style.marginTop = '6px';
  function orbit(n) { var p = [n]; while (n !== 1n && p.length < 5000) { n = n % 2n ? 3n * n + 1n : n / 2n; p.push(n); } return p; }
  function steps() { // steps to 1 for 1..NS (small numbers: plain floats are exact here)
    ST = new Uint16Array(NS + 1);
    for (var i = 2; i <= NS; i++) { var n = i, s = 0; while (n >= i) { n = n % 2 ? 3 * n + 1 : n / 2; s++; } ST[i] = s + ST[n]; }
  }
  function num(b) { return Number(b); }
  function setN(b) {
    if (b < 1n) b = 1n; if (b > 10n ** 30n) b = 10n ** 30n;
    n0 = b; path = orbit(b); shown = g.reduced || !L.playing() ? path.length : 1; inp.value = b.toString();
    var mx = path.reduce(function (a, v) { return v > a ? v : a; }, 0n);
    o1.innerHTML = 'Start <b>' + b.toLocaleString('en-US') + '</b> · steps to 1: <b>' + (path.length - 1) + '</b>';
    o2.innerHTML = 'Highest point: <b>' + mx.toLocaleString('en-US') + '</b>';
    g.say('Starting at ' + b + ': ' + (path.length - 1) + ' steps to reach 1, highest value ' + mx);
    g.redraw();
  }
  function plot(col) {
    var x = c.ctx, W = c.w, H = c.h, l = 46, r = 12, t = 12, bt = 26, n = M.min(shown, path.length);
    c.clear(col.bg);
    var vs = path.map(num), mx = M.max.apply(null, vs), lo = logY ? 0 : 0, hi = logY ? M.log10(M.max(10, mx)) : mx;
    function Y(v) { var q = logY ? M.log10(M.max(1, v)) : v; return H - bt - (H - bt - t) * (q - lo) / (hi - lo || 1); }
    function X(i) { return l + (W - l - r) * i / M.max(1, path.length - 1); }
    x.strokeStyle = col.grid; x.fillStyle = col.muted; x.font = '12px system-ui'; x.textAlign = 'right'; x.textBaseline = 'middle'; x.lineWidth = 1;
    var ticks = [];
    if (logY) for (var e = 0; e <= M.ceil(hi); e += M.max(1, M.ceil(hi / 5))) ticks.push(M.pow(10, e));
    else for (var q = 0; q <= 4; q++) ticks.push(mx * q / 4);
    ticks.forEach(function (v) { var y = Y(v); if (y < t - 1) return; x.beginPath(); x.moveTo(l, y); x.lineTo(W - r, y); x.stroke(); x.fillText(v >= 1e6 ? '1e' + M.round(M.log10(v)) : g.fmt(v), l - 6, y); });
    x.textAlign = 'center'; x.textBaseline = 'top'; x.fillText('step', W / 2, H - 16);
    x.strokeStyle = col.green; x.lineWidth = 2; x.lineJoin = 'round'; x.beginPath();
    for (var i = 0; i < n; i++) { if (i) x.lineTo(X(i), Y(vs[i])); else x.moveTo(X(i), Y(vs[i])); }
    x.stroke();
    if (path.length < 200) for (i = 0; i < n; i++) { x.fillStyle = path[i] % 2n ? col.gold : col.green; x.beginPath(); x.arc(X(i), Y(vs[i]), 2.6, 0, 7); x.fill(); }
    if (n === path.length) { x.fillStyle = col.red; x.beginPath(); x.arc(X(n - 1), Y(1), 4, 0, 7); x.fill(); }
  }
  function scatter(col) {
    var x = d.ctx, W = d.w, H = d.h, l = 46, r = 12, t = 10, bt = 22, mx = 0, i;
    d.clear(col.bg); for (i = 1; i <= NS; i++) if (ST[i] > mx) mx = ST[i];
    x.fillStyle = col.a(col.blue, 0.55);
    for (i = 1; i <= NS; i++) x.fillRect(l + (W - l - r) * i / NS, H - bt - (H - bt - t) * ST[i] / mx, 1.4, 1.4);
    x.fillStyle = col.muted; x.font = '12px system-ui'; x.textAlign = 'right'; x.textBaseline = 'middle';
    [0, 100, 200].forEach(function (v) { if (v <= mx) x.fillText(v, l - 6, H - bt - (H - bt - t) * v / mx); });
    x.textAlign = 'center'; x.textBaseline = 'top'; x.fillText('start number, 1 to 10,000 (height: steps to 1)', (W + l) / 2, H - 16);
    if (n0 <= BigInt(NS)) { var k = num(n0); x.strokeStyle = col.red; x.lineWidth = 2; x.beginPath(); x.arc(l + (W - l - r) * k / NS, H - bt - (H - bt - t) * ST[k] / mx, 5, 0, 7); x.stroke(); }
  }
  steps();
  g.draw(function (col) { plot(col); scatter(col); });
  var row = g.group(), inp = g.el('input'); inp.type = 'text'; inp.inputMode = 'numeric'; inp.size = 12; inp.style.cssText = 'font:inherit;min-height:36px;padding:.2rem .4rem;border-radius:8px;border:1.5px solid var(--gx-bd);background:var(--gx-card);color:var(--gx-tx);max-width:11rem';
  var lab = g.el('label', 'gx-field'); lab.appendChild(g.el('span', 'gx-lbl', 'Start')); lab.appendChild(inp); row.appendChild(lab);
  function go() { var v = inp.value.replace(/[^0-9]/g, ''); if (v) setN(BigInt(v)); }
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  g.button('Go', go, { parent: row, pri: true });
  g.button('− 1', function () { setN(n0 - 1n); }, { parent: row });
  g.button('+ 1', function () { setN(n0 + 1n); }, { parent: row });
  var row2 = g.group();
  [['27', 27n], ['97', 97n], ['871', 871n], ['2⁶⁴ − 1', 2n ** 64n - 1n]].forEach(function (p) { g.button('Try ' + p[0], function () { setN(p[1]); }, { parent: row2 }); });
  g.toggle('Log scale', logY, function (v) { logY = v; g.redraw(); }, { parent: row2 });
  var L = g.loop(function (dt) {
    if (shown >= path.length) shown = 1;
    shown = M.min(path.length, shown + M.max(1, M.round(dt * M.max(20, path.length / 3)))); g.redraw();
    if (shown >= path.length) return false;
  }, { auto: false, stepSize: 0.1, parent: g.group() });
  var o1 = g.out(), o2 = g.out();
  g.drag(d.el, { touch: 'pan-y', down: function (X) { var k = M.round((X - 46) / (d.w - 58) * NS); if (k >= 1 && k <= NS) setN(BigInt(k)); } });
  g.keys(d.el, { ArrowLeft: function () { setN(n0 - 1n); }, ArrowRight: function () { setN(n0 + 1n); } });
  d.el.setAttribute('aria-label', 'Steps to reach 1 for every start from 1 to 10,000. Tap a spot, or use the arrow keys, to pick a start.');
  c.onresize = d.onresize = function () { g.redraw(); };
  setN(27n);
});
