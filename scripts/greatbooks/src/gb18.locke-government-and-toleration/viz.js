/* gb18.locke-government-and-toleration: visuals (gbw3, our own designs). */
/* gbw3 shared SVG helpers (copied into each gb18 rung by gbw3; styles in gb18.locke-government-and-toleration/viz.css) */
var NS = 'http://www.w3.org/2000/svg';
function S(tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function Tx(par, x, y, s, cls, anc) { var t = S('text', { x: x, y: y, 'class': cls || '', 'text-anchor': anc || 'middle' }, par); t.textContent = s; return t; }
function frame(el, w, h, label) {
  var st = document.createElement('div'); st.className = 'gb-stage'; el.appendChild(st);
  var sv = S('svg', { viewBox: '0 0 ' + w + ' ' + h, 'class': 'gbx-svg', role: 'img', 'aria-label': label }, st);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { svg: sv, ctl: ctl };
}
function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
function wrap(s, n) { var w = s.split(' '), out = [], line = ''; w.forEach(function (x) { if ((line + ' ' + x).trim().length > n) { if (line) out.push(line); line = x; } else line = (line + ' ' + x).trim(); }); if (line) out.push(line); return out; }
function Tw(par, x, y, s, n, lh, cls, anc) { wrap(s, n).forEach(function (l, i) { Tx(par, x, y + i * lh, l, cls, anc); }); }
function person(g, x, y, s, cls) { /* a generic standing figure, feet at y, in the site's cartoon skin color */
  s = s || 1;
  S('rect', { x: x - 6 * s, y: y - 30 * s, width: 12 * s, height: 18 * s, rx: 5 * s, 'class': cls || 'gbx-cloth' }, g);
  S('rect', { x: x - 5 * s, y: y - 13 * s, width: 4 * s, height: 13 * s, rx: 2 * s, 'class': cls || 'gbx-cloth' }, g);
  S('rect', { x: x + 1 * s, y: y - 13 * s, width: 4 * s, height: 13 * s, rx: 2 * s, 'class': cls || 'gbx-cloth' }, g);
  S('circle', { cx: x, cy: y - 36 * s, r: 6.5 * s, 'class': 'gbx-skin' }, g);
}
function btns(ctl, V, items, cur, fn) { /* a row of toggle-free choice buttons via V.seg */ return V.seg(ctl, { label: items.label, items: items.list, value: cur, change: fn }); }
/* a timeline with focusable markers: ev = [{ y, lab, txt, lane? }] */
function timeline(el, V, ev, o) {
  o = o || {};
  var lanes = o.lanes || null, W = 400, H = lanes ? 210 : 170, F = frame(el, W, H, o.label || 'A timeline'), sv = F.svg, ro = V.readout(el);
  var y0 = o.y0, y1 = o.y1, X = function (y) { return 24 + (y - y0) / (y1 - y0) * (W - 48); }, sel = Math.max(0, Math.min(ev.length - 1, o.sel || 0));
  function laneY(e) { return lanes ? 112 + (e.lane || 0) * 50 : 120; }
  function draw() {
    clear(sv);
    if (lanes) lanes.forEach(function (l, i) {
      var ly = 112 + i * 50; S('line', { x1: X(l.from), y1: ly, x2: X(l.to), y2: ly, 'class': 'gbx-lane gbx-lane' + i }, sv);
      Tx(sv, X(l.from), ly - 10, l.name, 'sm b', 'start');
    }); else S('line', { x1: 20, y1: 120, x2: W - 20, y2: 120, 'class': 'gbx-axis' }, sv);
    var ty = lanes ? H - 12 : 150;
    (o.ticks || []).forEach(function (t) { S('line', { x1: X(t), y1: ty - 26, x2: X(t), y2: ty - 20, 'class': 'gbx-tick' }, sv); Tx(sv, X(t), ty, (t < 0 ? (-t) + ' BC' : (o.ad ? 'AD ' : '') + t), 'sm mut'); });
    ev.forEach(function (e, i) {
      var g = S('g', { 'class': 'gbx-hit', tabindex: 0, role: 'button', 'aria-label': e.lab + ', ' + e.when }, sv), on = i === sel;
      S('circle', { cx: X(e.y), cy: laneY(e), r: on ? 8 : 5.5, 'class': on ? 'gbx-dot-on' : 'gbx-dot' }, g);
      S('rect', { x: X(e.y) - 9, y: laneY(e) - 12, width: 18, height: 24, 'class': 'gbx-hitbox' }, g);
      g.addEventListener('click', function () { sel = i; draw(); });
      g.addEventListener('keydown', function (k) { if (k.key === 'Enter' || k.key === ' ') { k.preventDefault(); sel = i; draw(); var n = sv.querySelectorAll('.gbx-hit')[i]; if (n) n.focus(); } });
    });
    var e = ev[sel], cx = Math.max(110, Math.min(W - 110, X(e.y)));
    S('line', { x1: X(e.y), y1: laneY(e) - 9, x2: cx, y2: 62, 'class': 'gbx-lead' }, sv);
    Tx(sv, cx, 36, e.when, 'b acc');
    Tw(sv, cx, 54, e.lab, 34, 14, 'b', 'middle');
    ro.set('<b>' + e.when + ': ' + e.lab + '.</b> ' + e.txt);
  }
  var row = document.createElement('div'); row.className = 'gbx-row'; F.ctl.appendChild(row);
  V.button(row, '◀ Earlier', function () { sel = Math.max(0, sel - 1); draw(); });
  V.button(row, 'Later ▶', function () { sel = Math.min(ev.length - 1, sel + 1); draw(); });
  draw();
}
/* gb-locke-path: Locke's argument in the Second Treatise, from the state of nature to the people's right when a government breaks its trust. */
ML.viz.register('gb-locke-path', function (el, opts, V) {
  var F = frame(el, 400, 270, 'Locke\'s path from the state of nature to government by consent'), sv = F.svg, ro = V.readout(el);
  var ST = [
    ['State of nature', 'free and equal; the law of nature: harm no one', 'People are free and equal, with no common ruler. Reason teaches the <b>law of nature</b>: no one ought to harm another in life, health, liberty or possessions (ch. II).'],
    ['Its troubles', 'no settled law, no fair judge, no power to enforce', 'Everyone judges his own case, and people are partial to themselves. There is no settled, known law, no impartial judge and no power to carry out a just sentence (ch. IX).'],
    ['Consent', 'people agree to join one society', 'So people <b>consent</b> to join together into one community, each giving up his power to punish to the whole, for the safer enjoyment of their lives, liberties and estates (ch. VIII).'],
    ['Government in trust', 'legislature makes known laws; executive and judges carry them out', 'The community sets up a <b>legislature</b>, the supreme power, which must rule by known laws, may not take property without consent, and holds its power <b>in trust</b> for the public good (ch. XI–XIII).'],
    ['Trust broken', 'a long train of abuses: the people may set up a new government', 'If the government acts against its trust, aiming at the people\'s lives, liberties or property by a long train of abuses, it dissolves itself, and the people may set up a new legislature (ch. XIX).']
  ];
  var st = opts.stage || 0;
  function draw() {
    clear(sv);
    for (var i = 0; i < 5; i++) {
      var y = 8 + i * 52, on = i === st, past = i < st;
      S('rect', { x: 40, y: y, width: 320, height: 40, rx: 9, 'class': on ? (i === 4 ? 'gbx-box-red' : 'gbx-box-on') : past ? 'gbx-box-gold' : 'gbx-box' }, sv);
      Tx(sv, 58, y + 17, (i + 1) + '.', 'b', 'start'); Tx(sv, 76, y + 17, ST[i][0], 'b', 'start'); Tx(sv, 76, y + 32, ST[i][1], 'xs mut', 'start');
      if (i < 4) S('path', { d: 'M200,' + (y + 41) + ' v9 m-4,-4 l4,4 l4,-4', 'class': 'gbx-arrow' }, sv);
    }
    if (st === 4) { S('path', { d: 'M362,236 C394,236 394,124 362,124', 'class': 'gbx-route' }, sv); Tx(sv, 392, 182, 'anew', 'xs acc', 'end'); }
    ro.set('<b>' + (st + 1) + '. ' + ST[st][0] + '.</b> ' + ST[st][2]);
  }
  V.seg(F.ctl, { label: 'Step', items: ST.map(function (s, i) { return [i, (i + 1) + '. ' + s[0]]; }), value: st, change: function (v) { st = +v; draw(); } });
  draw();
});
