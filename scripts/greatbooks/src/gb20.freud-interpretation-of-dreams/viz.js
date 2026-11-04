/* gb20 visuals kit (gbx1, our own designs), shared by the 20th-century rungs. Adapted from the gb19 kit (gbw4).
   This rung is the first gb20 rung in rungs.yaml, so the build puts this file first in static/greatbooks/viz/gb20.js;
   other gb20 rungs read ML.gb20kit when they mount (inside their register callbacks). Engines:
     cards(el, V, o)  boxes in a row, column or stairs, tap one to read it   o = { label, layout, items: [{ t, s, html }], sets, start }
     net(el, V, o)    people or ideas joined by lines, with optional sets of lines to switch between
     route(el, V, o)  a journey on a sketch map, stop by stop
     line(el, V, o)   a timeline of dated events
     sorter(el, V, o) a sorting game: examples into boxes
   Helpers: S, T, wrap, frame, clear, clickable, arrow, person. Styles: this rung's viz.css (.gb20-*). */
var NS = 'http://www.w3.org/2000/svg';
function S(tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function wrap(s, n) { var w = String(s).split(' '), out = [], cur = ''; w.forEach(function (x) { if (cur && (cur + ' ' + x).length > n) { out.push(cur); cur = x; } else cur = cur ? cur + ' ' + x : x; }); if (cur) out.push(cur); return out; }
function T(par, x, y, s, cls, anc, n) {
  var t = S('text', { x: x, y: y, 'class': cls || 'gb20-t', 'text-anchor': anc || 'middle' }, par), L = n ? wrap(s, n) : [String(s)];
  L.forEach(function (ln, i) { var sp = S('tspan', { x: x, dy: i ? '1.15em' : 0 }, t); sp.textContent = ln; });
  return t;
}
function frame(el, w, h, label) {
  el.classList.add('gb20');
  var st = document.createElement('div'); st.className = 'gb20-stage'; el.appendChild(st);
  var sv = S('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': label }, st);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl gb20-ctl'; el.appendChild(ctl);
  return { svg: sv, ctl: ctl, stage: st };
}
function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
function clickable(g, fn, label) {
  g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); if (label) g.setAttribute('aria-label', label);
  g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
}
function arrow(par, x1, y1, x2, y2, cls) {
  S('line', { x1: x1, y1: y1, x2: x2, y2: y2, 'class': cls || 'gb20-arrow' }, par);
  var a = Math.atan2(y2 - y1, x2 - x1), L = 7;
  S('path', { d: 'M' + x2 + ',' + y2 + ' L' + (x2 - L * Math.cos(a - 0.45)) + ',' + (y2 - L * Math.sin(a - 0.45)) + ' L' + (x2 - L * Math.cos(a + 0.45)) + ',' + (y2 - L * Math.sin(a + 0.45)) + ' Z', 'class': 'gb20-head' }, par);
}
function person(par, x, y, s, robe) { // a generic standing figure in the site's cartoon skin color
  S('path', { d: 'M' + (x - 8 * s) + ',' + (y + 22 * s) + ' Q' + x + ',' + (y - 2 * s) + ' ' + (x + 8 * s) + ',' + (y + 22 * s) + ' Z', 'class': robe || 'gb20-robe' }, par);
  S('circle', { cx: x, cy: y - 5 * s, r: 6.5 * s, 'class': 'gb20-skin' }, par);
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
    if (o.title) T(sv, W / 2, 16, o.title, 'gb20-s');
    var top = o.title ? 26 : 8;
    it.forEach(function (c, i) {
      var x, y, w, h;
      if (lay === 'col') { w = W - 40; h = 50; x = 20; y = top + i * 62; }
      else if (lay === 'stairs') { w = (W - 20) / n - 8; var ch = Math.max(6, Math.floor(w / 6.6)), need = 34 + 15 * wrap(c.t, ch).length + 14 * (c.s ? wrap(c.s, ch + 1).length : 0); h = Math.max(need, 60 + i * ((H - top - 80) / Math.max(1, n - 1))); x = 10 + i * (w + 8); y = H - 8 - h; }
      else { w = (W - 20) / n - 14; h = H - top - 16; x = 10 + i * (w + 14); y = top + 4; }
      var g = S('g', { 'class': 'gb20-it' + (i === cur ? ' gb20-on' : '') + (c.cls ? ' ' + c.cls : '') }, sv);
      S('rect', { x: x, y: y, width: w, height: h, rx: 9, 'class': 'gb20-box' }, g);
      var chars = Math.max(6, Math.floor(w / 6.6));
      if (lay === 'col') { T(g, x + 12, y + 20, c.t, 'gb20-t', 'start'); if (c.s) T(g, x + 12, y + 37, c.s, 'gb20-s', 'start'); }
      else { T(g, x + w / 2, y + 20, c.t, 'gb20-t', 'middle', chars); if (c.s) T(g, x + w / 2, y + 22 + 15 * wrap(c.t, chars).length + 6, c.s, 'gb20-s', 'middle', chars + 1); }
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
      var a0 = byId[e.a], b0 = byId[e.b], a = { x: a0._x, y: a0._y }, b = { x: b0._x, y: b0._y }, cls = 'gb20-edge' + (e.cls ? ' ' + e.cls : '');
      if (e.dir) { var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, r = 22; arrow(sv, a.x + dx / d * r, a.y + dy / d * r, b.x - dx / d * r, b.y - dy / d * r, cls); }
      else S('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, 'class': cls }, sv);
      if (e.t) { var mx = (a.x + b.x) / 2 + (e.dx || 0), my = (a.y + b.y) / 2 + (e.dy || 0); var tt = T(sv, mx, my - 3, e.t, 'gb20-el'); tt.setAttribute('paint-order', 'stroke'); }
    });
    o.nodes.forEach(function (nd, i) {
      var w = nw(nd), h = nd.s ? 36 : 24, g = S('g', { 'class': 'gb20-it' + (i === cur ? ' gb20-on' : '') + (nd.cls ? ' ' + nd.cls : '') }, sv);
      var X = nd._x, Y = nd._y;
      S('rect', { x: X - w / 2, y: Y - h / 2, width: w, height: h, rx: 8, 'class': 'gb20-box' }, g);
      T(g, X, Y + (nd.s ? -3 : 4), nd.t, 'gb20-t'); if (nd.s) T(g, X, Y + 11, nd.s, 'gb20-s');
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
    S('rect', { x: 0, y: 0, width: W, height: H, 'class': o.sea === false ? 'gb20-paperbg' : 'gb20-sea' }, sv);
    (o.bg || []).forEach(function (b) { var pts = b.pts.map(xy); S('path', { d: pathOf(pts) + (b.open ? '' : ' Z'), 'class': b.cls || 'gb20-land' }, sv); });
    (o.labels || []).forEach(function (l) { var q = xy(l[0]); T(sv, q[0], q[1], l[1], l[2] || 'gb20-map'); });
    var all = stops.map(function (s) { return [s.x, s.y]; });
    S('path', { d: pathOf(all), 'class': 'gb20-route-todo' }, sv);
    S('path', { d: pathOf(all.slice(0, cur + 1)), 'class': 'gb20-route' }, sv);
    stops.forEach(function (s, i) {
      var g = S('g', { 'class': 'gb20-it' }, sv);
      S('circle', { cx: s.x, cy: s.y, r: 11, 'class': 'gb20-hit' }, g);
      S('circle', { cx: s.x, cy: s.y, r: i === cur ? 6 : 4, 'class': i <= cur ? 'gb20-dot gb20-dot-on' : 'gb20-dot' }, g);
      if (i === cur || s.s.always) { var dx = s.s.dx === undefined ? 8 : s.s.dx, dy = s.s.dy === undefined ? -8 : s.s.dy; T(g, s.x + dx, s.y + dy, (s.s.n || s.s.t), i === cur ? 'gb20-t gb20-halo' : 'gb20-s gb20-halo', dx < 0 ? 'end' : 'start'); }
      clickable(g, function () { cur = i; draw(); }, s.s.t);
    });
    ro.set('<b>' + (cur + 1) + ' of ' + stops.length + ': ' + stops[cur].s.t + '.</b> ' + stops[cur].s.html);
  }
  V.button(F.ctl, '← Back', function () { cur = Math.max(0, cur - 1); draw(); });
  V.button(F.ctl, 'Next →', function () { cur = Math.min(stops.length - 1, cur + 1); draw(); });
  draw();
}

/* ---- line: a timeline of dated events, tap a dot or step through ----
   o = { label, from, to, ticks: [years], events: [{ y, t, html, lane? (0-2) }], start } */
function line(el, V, o) {
  var W = o.w || 400, H = o.h || 150, F = frame(el, W, H, o.label || 'A timeline'), sv = F.svg, ro = V.readout(el), cur = o.start || 0;
  var x0 = 24, x1 = W - 24, ax = H - 34;
  function X(y) { return x0 + (y - o.from) / (o.to - o.from) * (x1 - x0); }
  function draw() {
    clear(sv);
    S('line', { x1: x0, y1: ax, x2: x1, y2: ax, 'class': 'gb20-ink' }, sv);
    (o.ticks || []).forEach(function (y) { S('line', { x1: X(y), y1: ax - 4, x2: X(y), y2: ax + 4, 'class': 'gb20-ink' }, sv); T(sv, X(y), ax + 18, String(y), 'gb20-s'); });
    o.events.forEach(function (e, i) {
      var lane = e.lane || 0, yy = ax - 22 - lane * 26, g = S('g', { 'class': 'gb20-it' + (i === cur ? ' gb20-on' : '') }, sv);
      S('line', { x1: X(e.y), y1: ax, x2: X(e.y), y2: yy, 'class': 'gb20-edge' }, g);
      S('circle', { cx: X(e.y), cy: yy, r: 12, 'class': 'gb20-hit' }, g);
      S('circle', { cx: X(e.y), cy: yy, r: i === cur ? 7 : 5, 'class': i === cur ? 'gb20-dot gb20-dot-on' : 'gb20-dot' }, g);
      clickable(g, function () { cur = i; draw(); }, e.y + ': ' + e.t);
    });
    var e = o.events[cur], tx = Math.max(60, Math.min(W - 60, X(e.y)));
    T(sv, tx, 16, e.t, 'gb20-t gb20-halo');
    ro.set('<b>' + (e.yl || e.y) + ': ' + e.t + '.</b> ' + e.html);
  }
  V.button(F.ctl, '← Earlier', function () { cur = Math.max(0, cur - 1); draw(); });
  V.button(F.ctl, 'Later →', function () { cur = Math.min(o.events.length - 1, cur + 1); draw(); });
  draw();
}

/* ---- sorter: tap an example, then the box you think it belongs in; the readout says why ----
   o = { label, bins: [[key, name]], items: [{ t, bin, why }], prompt } */
function sorter(el, V, o) {
  el.classList.add('gb20');
  var box = document.createElement('div'); box.className = 'gb20-panel'; el.appendChild(box);
  var card = document.createElement('div'); card.className = 'gb20-card'; box.appendChild(card);
  var btns = document.createElement('div'); btns.className = 'gb20-btns'; box.appendChild(btns);
  var ro = V.readout(el), i = 0, score = 0, done = 0;
  function show() {
    var it = o.items[i];
    card.innerHTML = '<p class="gb20-s">' + (o.prompt || 'Where does this one go?') + ' (' + (i + 1) + ' of ' + o.items.length + ')</p><p class="gb20-big">' + it.t + '</p>';
  }
  o.bins.forEach(function (b) {
    V.button(btns, b[1], function () {
      var it = o.items[i], ok = it.bin === b[0], right = o.bins.filter(function (x) { return x[0] === it.bin; })[0][1];
      done++; if (ok) score++;
      ro.set('<span class="' + (ok ? 'gb20-ok' : 'gb20-no') + '">' + (ok ? 'Yes.' : 'Not quite: ' + right + '.') + '</span> ' + it.why + ' <span class="gb20-s">(' + score + ' of ' + done + ' so far)</span>');
      i = (i + 1) % o.items.length; if (i === 0) { score = 0; done = 0; }
      show();
    });
  });
  show(); ro.set(o.hint || 'Choose a box for each example.');
}
ML.gb20kit = { S: S, T: T, wrap: wrap, frame: frame, clear: clear, clickable: clickable, arrow: arrow, person: person, cards: cards, net: net, route: route, line: line, sorter: sorter };

/* gb-freud-sleep: a typical night's sleep cycles (a hypnogram, drawn from the textbook pattern: about four or five
   cycles of roughly 90 minutes, deep sleep early in the night, longer REM periods toward morning). Our own drawing. */
ML.viz.register('gb-freud-sleep', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 190, 'A typical night of sleep, stage by stage'), sv = F.svg, ro = V.readout(el), h = opts.h === undefined ? 3 : opts.h;
  var SEG = [[0, .25, 2], [.25, 1, 3], [1, 1.4, 2], [1.4, 1.55, 1], [1.55, 2, 2], [2, 2.6, 3], [2.6, 3, 2], [3, 3.3, 1], [3.3, 3.9, 2], [3.9, 4.2, 3], [4.2, 4.6, 2], [4.6, 5.1, 1], [5.1, 5.9, 2], [5.9, 6.6, 1], [6.6, 7.2, 2], [7.2, 7.25, 0], [7.25, 7.6, 2], [7.6, 8, 1]];
  var NAME = ['Awake', 'REM sleep', 'Light sleep', 'Deep sleep'], LV = [30, 62, 100, 138];
  var NOTE = ['A brief waking. Most people forget these by morning.',
    'REM (rapid eye movement) sleep: the eyes dart, the body is still, and the brain is very active. People woken now usually report vivid, story-like dreams. REM periods grow longer toward morning, which is one reason we often wake from a dream.',
    'Light sleep. People woken now sometimes report dreams too, but they tend to be shorter and more like thoughts.',
    'Deep (slow-wave) sleep: hardest to wake from. It comes mostly in the first half of the night. Dream reports from deep sleep are rarer.'];
  function X(t) { return 80 + t / 8 * 305; }
  function stageAt(t) { for (var i = 0; i < SEG.length; i++) if (t >= SEG[i][0] && t < SEG[i][1]) return SEG[i][2]; return 1; }
  function draw() {
    K.clear(sv);
    LV.forEach(function (y, i) { K.T(sv, 4, y + 4, NAME[i], 'gb20-s', 'start'); K.S('line', { x1: 80, y1: y, x2: 380, y2: y, 'class': 'gb20-route-todo' }, sv); });
    var d = '';
    SEG.forEach(function (s, i) { d += (i ? 'L' : 'M') + X(s[0]).toFixed(1) + ',' + LV[s[2]] + ' L' + X(s[1]).toFixed(1) + ',' + LV[s[2]] + ' '; });
    K.S('path', { d: d, 'class': 'gb20-ink' }, sv);
    SEG.forEach(function (s) { if (s[2] === 1) K.S('rect', { x: X(s[0]), y: LV[1] - 5, width: X(s[1]) - X(s[0]), height: 10, rx: 3, 'class': 'gb20-accf' }, sv); });
    for (var t = 0; t <= 8; t += 2) K.T(sv, X(t), 166, t + ' h', 'gb20-s');
    K.T(sv, 220, 184, 'hours after falling asleep', 'gb20-s');
    K.S('line', { x1: X(h), y1: 20, x2: X(h), y2: 152, 'class': 'gb20-arrow' }, sv);
    var st = stageAt(Math.min(h, 7.99));
    K.S('circle', { cx: X(h), cy: LV[st], r: 6, 'class': 'gb20-dot gb20-dot-on' }, sv);
    ro.set('<b>' + h.toFixed(1) + ' hours in: ' + NAME[st] + '.</b> ' + NOTE[st]);
  }
  V.slider(F.ctl, { label: 'Hours asleep', min: 0, max: 8, step: 0.1, value: h, fmt: function (v) { return v.toFixed(1) + ' h'; }, input: function (v) { h = v; draw(); } });
  draw();
});

/* gb-freud-dreamwork: one invented, everyday dream read two ways: Freud's method, and many dream researchers today. */
ML.viz.register('gb-freud-dreamwork', function (el, opts, V) {
  ML.gb20kit.cards(el, V, { label: 'An invented dream, read two ways', layout: 'col', set: opts.set || 'freud', setLabel: 'Reading', sets: [
    ['freud', 'Freud\'s method', [
      { t: 'The dream as remembered', s: 'the manifest content', html: 'The dreamer is in the school play, but the stage is Grandma\'s kitchen, the teacher has Uncle Jim\'s beard, and the script has gone missing.' },
      { t: 'Free association', s: 'what comes to mind about each piece', html: 'Kitchen: "Grandma always says I\'m ready for anything." Beard: "Uncle Jim teases me about forgetting things." Script: "The real play is next Friday."' },
      { t: 'The dream-work undone', s: 'condensation, displacement', html: 'Teacher and uncle are <b>condensed</b> into one figure: both are people the dreamer wants to impress. The worry is <b>displaced</b> onto a small object, the lost script.' },
      { t: 'Freud\'s kind of reading', s: 'the latent thought', html: 'Freud would look for a wish beneath it, for instance the wish to be as ready as Grandma says, or to have the play over with. (Our example; Freud\'s own were from his patients and himself.)' }
    ]],
    ['today', 'Research today', [
      { t: 'The dream as remembered', s: 'the same dream', html: 'The same dream: the play, the kitchen, the bearded teacher, the missing script.' },
      { t: 'Continuity with waking life', s: 'well supported', html: 'Dream studies find that dreams often carry the dreamer\'s current concerns: here, a play next Friday.' },
      { t: 'A story built from pieces', s: 'one modern idea', html: 'Many researchers think the sleeping brain mixes memories and feelings into a story without hiding anything on purpose; there may be no disguise to undo.' },
      { t: 'Still disputed', s: 'what dreams are for', html: 'Whether dreams help us sort memories, rehearse threats, or are a side effect of sleep is still argued. Few researchers think every dream fulfils a wish.' }
    ]]
  ] });
});
