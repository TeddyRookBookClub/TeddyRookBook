/* gb19 visuals kit (gbw4, our own designs), shared by the 19th-century rungs written in wave 2.
   This rung is the first of them in rungs.yaml, so the build puts this file first in static/greatbooks/viz/gb19.js;
   the others read ML.gb19kit when they mount. Three engines:
     cards(el, V, o)  boxes in a row, column or stairs, tap one to read it   o = { label, layout, items: [{ t, s, html }], sets, start }
     net(el, V, o)    people or ideas joined by lines, with optional sets of lines to switch between
     route(el, V, o)  a journey on a sketch map, stop by stop
   Styles: this rung's viz.css (.gb19-*). Drawn people: fill #ffcc4d, outline #e8a93a. */
var NS = 'http://www.w3.org/2000/svg';
function S(tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function wrap(s, n) { var w = String(s).split(' '), out = [], cur = ''; w.forEach(function (x) { if (cur && (cur + ' ' + x).length > n) { out.push(cur); cur = x; } else cur = cur ? cur + ' ' + x : x; }); if (cur) out.push(cur); return out; }
function T(par, x, y, s, cls, anc, n) {
  var t = S('text', { x: x, y: y, 'class': cls || 'gb19-t', 'text-anchor': anc || 'middle' }, par), L = n ? wrap(s, n) : [String(s)];
  L.forEach(function (ln, i) { var sp = S('tspan', { x: x, dy: i ? '1.15em' : 0 }, t); sp.textContent = ln; });
  return t;
}
function frame(el, w, h, label) {
  el.classList.add('gb19');
  var st = document.createElement('div'); st.className = 'gb19-stage'; el.appendChild(st);
  var sv = S('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': label }, st);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl gb19-ctl'; el.appendChild(ctl);
  return { svg: sv, ctl: ctl, stage: st };
}
function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
function clickable(g, fn, label) {
  g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); if (label) g.setAttribute('aria-label', label);
  g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
}
function arrow(par, x1, y1, x2, y2, cls) {
  S('line', { x1: x1, y1: y1, x2: x2, y2: y2, 'class': cls || 'gb19-arrow' }, par);
  var a = Math.atan2(y2 - y1, x2 - x1), L = 7;
  S('path', { d: 'M' + x2 + ',' + y2 + ' L' + (x2 - L * Math.cos(a - 0.45)) + ',' + (y2 - L * Math.sin(a - 0.45)) + ' L' + (x2 - L * Math.cos(a + 0.45)) + ',' + (y2 - L * Math.sin(a + 0.45)) + ' Z', 'class': 'gb19-head' }, par);
}
function person(par, x, y, s, robe) { // a generic standing figure in the site's cartoon skin color
  S('path', { d: 'M' + (x - 8 * s) + ',' + (y + 22 * s) + ' Q' + x + ',' + (y - 2 * s) + ' ' + (x + 8 * s) + ',' + (y + 22 * s) + ' Z', 'class': robe || 'gb19-robe' }, par);
  S('circle', { cx: x, cy: y - 5 * s, r: 6.5 * s, 'class': 'gb19-skin' }, par);
}

/* ---- cards ---- */
function cards(el, V, o) {
  var sets = o.sets || null, key = sets ? (o.set || sets[0][0]) : null;
  function items() { if (!sets) return o.items; for (var i = 0; i < sets.length; i++) if (sets[i][0] === key) return sets[i][2]; return sets[0][2]; }
  var lay = o.layout || 'row', n0 = items().length;
  var W = o.w || 400, H = o.h || (lay === 'col' ? 24 + n0 * 62 : lay === 'stairs' ? 250 : 170);
  var F = frame(el, W, H, o.label || 'A diagram'), sv = F.svg, ro = V.readout(el), cur = o.start || 0;
  function draw() {
    clear(sv); var it = items(), n = it.length;
    if (o.title) T(sv, W / 2, 16, o.title, 'gb19-s');
    var top = o.title ? 26 : 8;
    it.forEach(function (c, i) {
      var x, y, w, h;
      if (lay === 'col') { w = W - 40; h = 50; x = 20; y = top + i * 62; }
      else if (lay === 'stairs') { w = (W - 20) / n - 8; var ch = Math.max(6, Math.floor(w / 6.6)), need = 34 + 15 * wrap(c.t, ch).length + 14 * (c.s ? wrap(c.s, ch + 1).length : 0); h = Math.max(need, 60 + i * ((H - top - 80) / Math.max(1, n - 1))); x = 10 + i * (w + 8); y = H - 8 - h; }
      else { w = (W - 20) / n - 14; h = H - top - 16; x = 10 + i * (w + 14); y = top + 4; }
      var g = S('g', { 'class': 'gb19-it' + (i === cur ? ' gb19-on' : '') + (c.cls ? ' ' + c.cls : '') }, sv);
      S('rect', { x: x, y: y, width: w, height: h, rx: 9, 'class': 'gb19-box' }, g);
      var chars = Math.max(6, Math.floor(w / 6.6));
      if (lay === 'col') { T(g, x + 12, y + 20, c.t, 'gb19-t', 'start'); if (c.s) T(g, x + 12, y + 37, c.s, 'gb19-s', 'start'); }
      else { T(g, x + w / 2, y + 20, c.t, 'gb19-t', 'middle', chars); if (c.s) T(g, x + w / 2, y + 22 + 15 * wrap(c.t, chars).length + 6, c.s, 'gb19-s', 'middle', chars + 1); }
      clickable(g, function () { cur = i; draw(); }, c.t);
      if (o.arrows !== false && i < n - 1) {
        if (lay === 'col') arrow(sv, W / 2, y + h + 1, W / 2, y + 61);
        else if (lay === 'row') arrow(sv, x + w + 1, y + h / 2, x + w + 13, y + h / 2);
      }
    });
    var c = it[Math.min(cur, n - 1)]; ro.set('<b>' + (cur + 1) + '. ' + c.t + '.</b> ' + c.html);
  }
  if (sets) V.seg(F.ctl, { label: o.setLabel || 'Show', items: sets.map(function (s) { return [s[0], s[1]]; }), value: key, change: function (v) { key = v; cur = 0; draw(); } });
  V.button(F.ctl, '← Back', function () { cur = Math.max(0, cur - 1); draw(); });
  V.button(F.ctl, 'Next →', function () { cur = Math.min(items().length - 1, cur + 1); draw(); });
  draw();
}

/* ---- net ---- */
function net(el, V, o) {
  var W = o.w || 400, H = o.h || 300, F = frame(el, W, H, o.label || 'A diagram'), sv = F.svg, ro = V.readout(el);
  var sets = o.sets || null, key = sets ? (o.set || sets[0][0]) : null, cur = o.start === undefined ? -1 : o.start;
  var byId = {}; o.nodes.forEach(function (nd) { byId[nd.id] = nd; });
  function nw(nd) { return Math.max(String(nd.t).length, String(nd.s || '').length * 0.85) * 6.7 + 16; }
  o.nodes.forEach(function (nd) { var w = nw(nd), h = nd.s ? 36 : 24; nd._x = Math.max(w / 2 + 3, Math.min(W - w / 2 - 3, nd.x)); nd._y = Math.max(h / 2 + 3, Math.min(H - h / 2 - 3, nd.y)); });
  function draw() {
    clear(sv);
    o.edges.forEach(function (e) {
      if (e.set && e.set !== key) return;
      var a0 = byId[e.a], b0 = byId[e.b], a = { x: a0._x, y: a0._y }, b = { x: b0._x, y: b0._y }, cls = 'gb19-edge' + (e.cls ? ' ' + e.cls : '');
      if (e.dir) { var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, r = 22; arrow(sv, a.x + dx / d * r, a.y + dy / d * r, b.x - dx / d * r, b.y - dy / d * r, cls); }
      else S('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, 'class': cls }, sv);
      if (e.t) { var mx = (a.x + b.x) / 2 + (e.dx || 0), my = (a.y + b.y) / 2 + (e.dy || 0); var tt = T(sv, mx, my - 3, e.t, 'gb19-el'); tt.setAttribute('paint-order', 'stroke'); }
    });
    o.nodes.forEach(function (nd, i) {
      var w = nw(nd), h = nd.s ? 36 : 24, g = S('g', { 'class': 'gb19-it' + (i === cur ? ' gb19-on' : '') + (nd.cls ? ' ' + nd.cls : '') }, sv);
      var X = nd._x, Y = nd._y;
      S('rect', { x: X - w / 2, y: Y - h / 2, width: w, height: h, rx: 8, 'class': 'gb19-box' }, g);
      T(g, X, Y + (nd.s ? -3 : 4), nd.t, 'gb19-t'); if (nd.s) T(g, X, Y + 11, nd.s, 'gb19-s');
      clickable(g, function () { cur = i; draw(); }, nd.t);
    });
    var setNote = ''; if (sets) sets.forEach(function (s) { if (s[0] === key) setNote = s[2]; });
    ro.set(cur >= 0 ? '<b>' + o.nodes[cur].t + '.</b> ' + o.nodes[cur].html : (setNote || o.hint || 'Tap a name to read about it.'));
  }
  if (sets) V.seg(F.ctl, { label: o.setLabel || 'Show', items: sets.map(function (s) { return [s[0], s[1]]; }), value: key, change: function (v) { key = v; cur = -1; draw(); } });
  draw();
}

/* ---- route ---- */
function route(el, V, o) {
  var W = o.w || 400, H = o.h || 300, F = frame(el, W, H, o.label || 'A map'), sv = F.svg, ro = V.readout(el), cur = o.start || 0;
  var P = o.proj; function xy(p) { return P ? [(p[0] - P[0]) / (P[1] - P[0]) * W, (P[2] - p[1]) / (P[2] - P[3]) * H] : p; }
  var stops = o.stops.map(function (s) { var q = xy(s.p); return { x: q[0], y: q[1], s: s }; });
  function pathOf(pts) { return pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '); }
  function draw() {
    clear(sv);
    S('rect', { x: 0, y: 0, width: W, height: H, 'class': o.sea === false ? 'gb19-paperbg' : 'gb19-sea' }, sv);
    (o.bg || []).forEach(function (b) { var pts = b.pts.map(xy); S('path', { d: pathOf(pts) + (b.open ? '' : ' Z'), 'class': b.cls || 'gb19-land' }, sv); });
    (o.labels || []).forEach(function (l) { var q = xy(l[0]); T(sv, q[0], q[1], l[1], l[2] || 'gb19-map'); });
    var all = stops.map(function (s) { return [s.x, s.y]; });
    S('path', { d: pathOf(all), 'class': 'gb19-route-todo' }, sv);
    S('path', { d: pathOf(all.slice(0, cur + 1)), 'class': 'gb19-route' }, sv);
    stops.forEach(function (s, i) {
      var g = S('g', { 'class': 'gb19-it' }, sv);
      S('circle', { cx: s.x, cy: s.y, r: 11, 'class': 'gb19-hit' }, g);
      S('circle', { cx: s.x, cy: s.y, r: i === cur ? 6 : 4, 'class': i <= cur ? 'gb19-dot gb19-dot-on' : 'gb19-dot' }, g);
      if (i === cur || s.s.always) { var dx = s.s.dx === undefined ? 8 : s.s.dx, dy = s.s.dy === undefined ? -8 : s.s.dy; T(g, s.x + dx, s.y + dy, (s.s.n || s.s.t), i === cur ? 'gb19-t gb19-halo' : 'gb19-s gb19-halo', dx < 0 ? 'end' : 'start'); }
      clickable(g, function () { cur = i; draw(); }, s.s.t);
    });
    ro.set('<b>' + (cur + 1) + ' of ' + stops.length + ': ' + stops[cur].s.t + '.</b> ' + stops[cur].s.html);
  }
  V.button(F.ctl, '← Back', function () { cur = Math.max(0, cur - 1); draw(); });
  V.button(F.ctl, 'Next →', function () { cur = Math.min(stops.length - 1, cur + 1); draw(); });
  draw();
}
ML.gb19kit = { S: S, T: T, wrap: wrap, frame: frame, clear: clear, clickable: clickable, arrow: arrow, person: person, cards: cards, net: net, route: route };

/* gb-hegel-right: the plan of the Philosophy of Right, from abstract right to the state (our own summaries). */
ML.viz.register('gb-hegel-right', function (el, opts, V) {
  var K = ML.gb19kit;
  K.cards(el, V, { label: 'The plan of Hegel\'s Philosophy of Right', layout: opts.layout || 'col', title: 'Freedom made real, step by step', items: [
    { t: 'Abstract right', s: 'persons, property, contracts', html: 'A person is free first as an owner. I put my will into a thing, and others must respect it. Hegel\'s command here is: be a person and respect others as persons. Wrong and crime break this, and punishment, he argues, restores the right.' },
    { t: 'Morality', s: 'the inner world of conscience', html: 'Now freedom turns inward: my purposes, my intentions and my conscience. Hegel praises this modern inwardness, but warns that conscience on its own can talk itself into anything.' },
    { t: 'The family', s: 'ethical life, first form', html: 'Ethical life (<i>Sittlichkeit</i>) means freedom lived out in shared customs and institutions. The family is its first form, held together by love and trust rather than contract.' },
    { t: 'Civil society', s: 'work, markets, courts', html: 'Grown children leave home for the world of work and trade, where each pursues his own interest and depends on everyone else. Hegel draws on Adam Smith here. He also sees its problems, such as poverty, and calls for courts, police and associations to temper them.' },
    { t: 'The state', s: 'ethical life, completed', html: 'For Hegel the state, with its constitution and laws, is where freedom becomes fully real, because citizens see the common good as their own. Readers have argued for two centuries over what he meant: some read a defense of constitutional liberty, others an over-praise of state power.' }
  ] });
});
