/* The seven bridges of Königsberg (Euler, 1736): try to cross every bridge exactly once. Left: a simple map of the river,
   the island, the east land and the two banks. Right: the same thing as a graph (lands = dots, bridges = lines).
   Our own drawing; the map is simplified, not to scale. */
Gallery.piece('konigsberg-bridges', function (g) {
  var NS = 'http://www.w3.org/2000/svg', LN = { N: 'North bank', S: 'South bank', A: 'the Island', E: 'the East land' };
  var BR = [ // [from, to, map shape [x, y, w, h]]
    ['A', 'N', [158, 114, 32, 42]], ['A', 'N', [250, 114, 32, 42]], ['A', 'S', [158, 204, 32, 42]], ['A', 'S', [250, 204, 32, 42]],
    ['A', 'E', [304, 166, 64, 28]], ['N', 'E', [466, 114, 32, 44]], ['S', 'E', [466, 202, 32, 44]], ['N', 'S', [40, 114, 32, 132]]];
  var GP = { N: [150, 40], S: [150, 280], A: [80, 160], E: [235, 160] };
  var extra = false, at = null, used = [], route = [];
  function mk(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  var split = g.el('div', 'gx-split'); g.stage.appendChild(split);
  var d1 = g.el('div'), d2 = g.el('div'); split.appendChild(d1); split.appendChild(d2);
  var map = mk('svg', { viewBox: '0 0 600 360', role: 'group', 'aria-label': 'Map: a river with an island and an east land, crossed by bridges' }, d1);
  var gr = mk('svg', { viewBox: '0 -24 300 344', role: 'img', 'aria-label': 'The same map as a graph' }, d2); gr.style.maxWidth = '300px'; gr.style.margin = '0 auto';
  d1.appendChild(g.el('span', 'gx-cap', 'The map')); d2.appendChild(g.el('span', 'gx-cap', 'The same thing as a graph'));
  var col;
  function build() {
    col = g.colors(); map.innerHTML = ''; gr.innerHTML = '';
    var land = col.dark ? '#24392c' : '#e3ecd9', water = col.dark ? '#16314a' : '#b9d8ef', edge = col.dark ? '#3c5a47' : '#a9bfa0';
    mk('rect', { x: 0, y: 0, width: 600, height: 360, fill: land }, map);
    mk('rect', { x: 0, y: 122, width: 600, height: 116, fill: water }, map);
    var tags = { N: [300, 66], S: [300, 310], A: [220, 188], E: [508, 188] };
    Object.keys(tags).forEach(function (k) {
      var deg = degree(k), t = mk('g', { tabindex: 0, role: 'button', 'aria-label': 'Start on ' + LN[k] + ' (' + deg + ' bridges)', style: 'cursor:pointer' }, map);
      if (k === 'A') mk('ellipse', { cx: 220, cy: 180, rx: 92, ry: 30, fill: land, stroke: edge }, t);
      else if (k === 'E') mk('path', { d: 'M362 180 L420 154 L600 152 L600 208 L420 206 Z', fill: land, stroke: edge }, t);
      else mk('rect', { x: tags[k][0] - 150, y: tags[k][1] - 40, width: 300, height: 70, fill: 'transparent' }, t);
      mk('text', { x: tags[k][0], y: tags[k][1], 'text-anchor': 'middle', 'font-size': 22, 'font-family': 'system-ui', 'font-weight': 600, fill: col.ink }, t).textContent = LN[k].replace('the ', '').replace(/^./, function (s) { return s.toUpperCase(); }) + ' · ' + deg;
      act(t, function () { start(k); });
    });
    BR.forEach(function (b, i) {
      if (i === 7 && !extra) return;
      var u = used.indexOf(i) >= 0, ok = at && !u && (b[0] === at || b[1] === at), s = b[2];
      var t = mk('g', { tabindex: 0, role: 'button', 'aria-label': 'Bridge ' + (i + 1) + ' between ' + LN[b[0]] + ' and ' + LN[b[1]] + (u ? ', crossed' : ''), style: 'cursor:pointer' }, map);
      mk('rect', { x: s[0], y: s[1], width: s[2], height: s[3], rx: 4, fill: u ? col.gold : (col.dark ? '#c9b48a' : '#8a6a3c'), stroke: ok ? col.green : 'none', 'stroke-width': 4 }, t);
      mk('text', { x: s[0] + s[2] / 2, y: s[1] + s[3] / 2 + 7, 'text-anchor': 'middle', 'font-size': 20, 'font-family': 'system-ui', 'font-weight': 700, fill: u ? '#1d2320' : '#fff' }, t).textContent = i + 1;
      act(t, function () { cross(i); });
    });
    if (at) { var p = { N: [300, 90], S: [300, 270], A: [150, 180], E: [398, 180] }[at]; mk('circle', { cx: p[0], cy: p[1], r: 11, fill: '#ffcc4d', stroke: '#e8a93a', 'stroke-width': 3 }, map); }
    // the graph: bridges between the same two lands bow apart so you can see each one
    var pairs = {};
    BR.forEach(function (b, i) {
      if (i === 7 && !extra) return;
      var key = [b[0], b[1]].sort().join(''), n = pairs[key] = (pairs[key] || 0) + 1, P = GP[b[0]], Q = GP[b[1]];
      var mx = (P[0] + Q[0]) / 2, my = (P[1] + Q[1]) / 2, dx = Q[1] - P[1], dy = P[0] - Q[0], L = Math.hypot(dx, dy), bow = (key === 'AN' || key === 'AS') ? (n === 1 ? 30 : -30) : (i === 7 ? 125 : 0);
      mk('path', { d: 'M' + P + ' Q' + (mx + dx / L * bow * 2) + ',' + (my + dy / L * bow * 2) + ' ' + Q, fill: 'none', stroke: used.indexOf(i) >= 0 ? col.gold : col.muted, 'stroke-width': used.indexOf(i) >= 0 ? 5 : 3 }, gr);
    });
    Object.keys(GP).forEach(function (k) {
      var d = degree(k), odd = d % 2;
      mk('circle', { cx: GP[k][0], cy: GP[k][1], r: 20, fill: k === at ? '#ffcc4d' : (odd ? col.red : col.green), stroke: k === at ? '#e8a93a' : 'none', 'stroke-width': 3 }, gr);
      mk('text', { x: GP[k][0], y: GP[k][1] + 6, 'text-anchor': 'middle', 'font-size': 17, 'font-family': 'system-ui', 'font-weight': 700, fill: k === at ? '#1d2320' : (col.dark ? '#10241a' : '#fff') }, gr).textContent = d;
    });
    var odd = Object.keys(GP).filter(function (k) { return degree(k) % 2; }).length;
    o1.innerHTML = 'Bridges crossed: <b>' + used.length + '</b> of ' + (extra ? 8 : 7);
    o2.innerHTML = 'Lands with an odd number of bridges: <b>' + odd + '</b> ' + (odd === 0 ? '(a round trip is possible)' : odd === 2 ? '(a path is possible: start on an odd one)' : '(no path can work)');
  }
  function act(el, fn) { el.addEventListener('click', fn); el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); }
  function degree(k) { return BR.filter(function (b, i) { return (i < 7 || extra) && (b[0] === k || b[1] === k); }).length; }
  function start(k) { at = k; used = []; route = [k]; build(); g.say('You are on ' + LN[k] + '. Pick a bridge that touches it.'); msg.textContent = g.live.textContent; refocus('Start on ' + LN[k]); }
  function cross(i) {
    var b = BR[i];
    if (!at) { g.say('First pick a land to start on.'); return; }
    if (used.indexOf(i) >= 0) { g.say('Bridge ' + (i + 1) + ' is already crossed.'); return; }
    if (b[0] !== at && b[1] !== at) { g.say('Bridge ' + (i + 1) + ' does not touch ' + LN[at] + '.'); return; }
    at = b[0] === at ? b[1] : b[0]; used.push(i); route.push(at); build();
    var tot = extra ? 8 : 7, left = BR.filter(function (q, j) { return (j < 7 || extra) && used.indexOf(j) < 0 && (q[0] === at || q[1] === at); }).length;
    if (used.length === tot) g.say('You crossed every bridge once. Well done!');
    else if (!left) g.say('Stuck on ' + LN[at] + ' with ' + (tot - used.length) + ' bridge' + (tot - used.length > 1 ? 's' : '') + ' left. Every bridge out of here is used.');
    else g.say('Crossed bridge ' + (i + 1) + ' to ' + LN[at] + '.');
    msg.textContent = g.live.textContent;
    refocus('Bridge ' + (i + 1) + ' ');
  }
  function refocus(pre) { if (!map.contains(document.activeElement) && document.activeElement !== document.body) return; var b = map.querySelectorAll('g[role=button]'); for (var j = 0; j < b.length; j++) if (b[j].getAttribute('aria-label').indexOf(pre) === 0) { b[j].focus(); return; } }
  var row = g.group();
  g.button('Start over', function () { at = null; used = []; build(); msg.textContent = 'Tap a land to start, then tap bridges to cross them.'; }, { parent: row });
  g.toggle('Add an eighth bridge', extra, function (v) { extra = v; at = null; used = []; build(); }, { parent: row });
  var o1 = g.out(), o2 = g.out(), msg = g.el('p', 'gx-hint', 'Tap a land to start, then tap bridges to cross them.'); g.bar.appendChild(msg);
  g.onTheme(build);
  build();
});
