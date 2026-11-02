/* The four color theorem: color a made-up map so that no two countries sharing a border match. The countries are cells
   around random seed points (each cell holds the spots closest to its seed). Our own drawing. */
Gallery.piece('four-color', function (g) {
  var NS = 'http://www.w3.org/2000/svg', W = 600, H = 400, n = 14, seed = 3, cells = [], adj = [], fill = [], M = Math;
  var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', 'A made-up map of countries to color. Tap a country, or focus it and press Enter, to change its color.');
  g.stage.appendChild(svg);
  function clip(P, a, b, c) { // keep the part of polygon P where a x + b y <= c
    var out = [], i; for (i = 0; i < P.length; i++) {
      var p = P[i], q = P[(i + 1) % P.length], fp = a * p[0] + b * p[1] - c, fq = a * q[0] + b * q[1] - c;
      if (fp <= 0) out.push(p);
      if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) { var t = fp / (fp - fq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    }
    return out;
  }
  function make() {
    var r = g.rng(seed), S = [], i, j, tries = 0;
    while (S.length < n && tries++ < 5000) { var p = [20 + r() * (W - 40), 20 + r() * (H - 40)], ok = true; for (i = 0; i < S.length; i++) if (M.hypot(S[i][0] - p[0], S[i][1] - p[1]) < 60) ok = false; if (ok) S.push(p); }
    n = S.length; cells = []; adj = []; fill = [];
    for (i = 0; i < n; i++) {
      var P = [[4, 4], [W - 4, 4], [W - 4, H - 4], [4, H - 4]];
      for (j = 0; j < n; j++) if (j !== i) { var a = S[j][0] - S[i][0], b = S[j][1] - S[i][1]; P = clip(P, a, b, (a * (S[i][0] + S[j][0]) + b * (S[i][1] + S[j][1])) / 2); }
      cells.push({ s: S[i], P: P }); adj.push([]); fill.push(0);
    }
    for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) { // neighbors: the two cells share a stretch of border (not just a corner)
      var e = shared(i, j); if (e) { adj[i].push(j); adj[j].push(i); cells[i]['e' + j] = e; }
    }
  }
  function shared(i, j) {
    var a = cells[j].s[0] - cells[i].s[0], b = cells[j].s[1] - cells[i].s[1], L = M.hypot(a, b), c = (a * (cells[i].s[0] + cells[j].s[0]) + b * (cells[i].s[1] + cells[j].s[1])) / 2, on = [];
    cells[i].P.forEach(function (p) { if (M.abs(a * p[0] + b * p[1] - c) / L < 0.5) on.push(p); });
    return on.length >= 2 && M.hypot(on[0][0] - on[1][0], on[0][1] - on[1][1]) > 6 ? on.slice(0, 2) : null;
  }
  function pal(col) { return [col.dark ? '#26342c' : '#f1f4f2', col.dark ? '#c25a6e' : '#e88a9a', col.dark ? '#4f86c6' : '#8fb8e8', col.dark ? '#c9a548' : '#f0d27a', col.dark ? '#3f9f72' : '#8fcfa9']; }
  var NAMES = ['no color', 'rose', 'blue', 'gold', 'green'];
  function clashes() { var k = []; for (var i = 0; i < n; i++) adj[i].forEach(function (j) { if (j > i && fill[i] && fill[i] === fill[j]) k.push([i, j]); }); return k; }
  function render() {
    var col = g.colors(), C = pal(col), focus = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('data-i');
    svg.innerHTML = '';
    cells.forEach(function (c, i) {
      var e = document.createElementNS(NS, 'polygon');
      e.setAttribute('points', c.P.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '));
      e.setAttribute('fill', C[fill[i]]); e.setAttribute('stroke', col.ink); e.setAttribute('stroke-width', 2); e.setAttribute('stroke-linejoin', 'round');
      e.setAttribute('tabindex', 0); e.setAttribute('role', 'button'); e.setAttribute('data-i', i); e.style.cursor = 'pointer';
      e.setAttribute('aria-label', 'Country ' + (i + 1) + ', ' + NAMES[fill[i]] + ', ' + adj[i].length + ' neighbors');
      e.addEventListener('click', function () { bump(i); });
      e.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); bump(i); } });
      svg.appendChild(e);
    });
    var bad = clashes();
    bad.forEach(function (p) {
      var s = cells[p[0]]['e' + p[1]]; if (!s) return;
      var l = document.createElementNS(NS, 'line'); l.setAttribute('x1', s[0][0]); l.setAttribute('y1', s[0][1]); l.setAttribute('x2', s[1][0]); l.setAttribute('y2', s[1][1]);
      l.setAttribute('stroke', col.red); l.setAttribute('stroke-width', 7); l.setAttribute('stroke-linecap', 'round'); l.setAttribute('stroke-dasharray', '10 7'); l.style.pointerEvents = 'none';
      svg.appendChild(l);
    });
    var done = fill.filter(function (v) { return v; }).length, used = {}; fill.forEach(function (v) { if (v) used[v] = 1; });
    o1.innerHTML = 'Colored <b>' + done + '</b> of ' + n + ' · colors used <b>' + Object.keys(used).length + '</b>';
    o2.innerHTML = 'Clashing borders: <b>' + bad.length + '</b>' + (done === n && !bad.length ? ' · <b>solved!</b>' : '');
    if (focus != null) { var f = svg.querySelector('[data-i="' + focus + '"]'); if (f) f.focus(); }
  }
  function bump(i) { fill[i] = (fill[i] + 1) % 5; render(); var b = clashes().length; g.say('Country ' + (i + 1) + ' is now ' + NAMES[fill[i]] + (b ? '. ' + b + ' clashing border' + (b > 1 ? 's' : '') : '')); }
  function solve(k) { // backtracking: try colors 1..k on each country in turn (biggest neighbor count first)
    var ord = cells.map(function (c, i) { return i; }).sort(function (a, b) { return adj[b].length - adj[a].length; }), f = fill.map(function () { return 0; }), steps = 0;
    function go(t) {
      if (t === n) return true; if (++steps > 200000) return false;
      var i = ord[t];
      for (var c = 1; c <= k; c++) { if (adj[i].every(function (j) { return f[j] !== c; })) { f[i] = c; if (go(t + 1)) return true; } }
      f[i] = 0; return false;
    }
    return go(0) ? f : null;
  }
  var row = g.group();
  g.button('Color it for me', function () { var f = solve(4); if (f) { fill = f; render(); g.say('Colored with four colors or fewer.'); } }, { parent: row, pri: true });
  g.button('Can 3 colors do it?', function () { var f = solve(3); if (f) { fill = f; render(); g.say('Yes: this map needs only three colors.'); verdict.textContent = 'Yes: this map can be done with three colors (shown).'; } else { verdict.textContent = 'No: this map cannot be done with three colors. It needs four.'; g.say(verdict.textContent); } }, { parent: row });
  g.button('Clear', function () { fill = fill.map(function () { return 0; }); verdict.textContent = ''; render(); }, { parent: row });
  var row2 = g.group();
  g.slider({ label: 'Countries', min: 6, max: 30, value: n, parent: row2, input: function (v) { n = v; make(); verdict.textContent = ''; render(); } });
  g.button('New map', function () { seed++; n = +row2.querySelector('input').value; make(); verdict.textContent = ''; render(); }, { parent: row2 });
  var o1 = g.out(), o2 = g.out(), verdict = g.el('p', 'gx-hint', ''); g.bar.appendChild(verdict);
  g.onTheme(render);
  make(); render();
});
