/* gb18.rousseau-social-contract: visuals (gbw3, our own designs). */
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
/* gb-sovereign-share: Rousseau's ratio in Social Contract III.1: each citizen holds 1/N of the sovereign authority, yet is wholly under it. */
ML.viz.register('gb-sovereign-share', function (el, opts, V) {
  var F = frame(el, 400, 220, 'Each citizen\'s share of the sovereign'), sv = F.svg, ro = V.readout(el);
  var n = opts.n || 10000;
  function fmtN(x) { return Math.round(x).toLocaleString('en-US'); }
  function draw() {
    clear(sv);
    var dots = 400, per = n / dots;
    for (var i = 0; i < dots; i++) { var a = i * 2.39996, r = 4.5 * Math.sqrt(i + .5); S('circle', { cx: 110 + r * Math.cos(a), cy: 112 + r * Math.sin(a) * .95, r: 2, 'class': i === 0 ? 'gbx-redf' : 'gbx-g', opacity: i === 0 ? 1 : .55 }, sv); }
    Tx(sv, 110, 214, 'the sovereign: all ' + fmtN(n) + ' citizens', 'xs mut');
    var share = 1 / n, bw = 150;
    Tx(sv, 230, 40, 'your share in making the law', 'sm b', 'start');
    S('rect', { x: 230, y: 50, width: bw, height: 16, 'class': 'gbx-box' }, sv); S('rect', { x: 230, y: 50, width: Math.max(1, bw * share), height: 16, 'class': 'gbx-redf' }, sv);
    Tx(sv, 230, 84, '1 / ' + fmtN(n) + ' = ' + V.fmt(share, 8), 'xs', 'start');
    Tx(sv, 230, 124, 'how much the law binds you', 'sm b', 'start');
    S('rect', { x: 230, y: 134, width: bw, height: 16, 'class': 'gbx-box-on' }, sv); Tx(sv, 230, 168, 'all of you, whatever N is', 'xs', 'start');
    Tx(sv, 110, 12, per >= 2 ? 'each dot ≈ ' + fmtN(per) + ' citizens' : 'one dot per citizen', 'xs mut');
    ro.set('With <b>' + fmtN(n) + '</b> citizens, each has 1/' + fmtN(n) + ' of the sovereign authority, but is wholly under the law. ' + (n >= 100000 ? 'Ten times more citizens means a vote with ten times less influence. ' : '') + 'Rousseau concludes: \"the larger the State, the less the liberty,\" so government must grow stronger as the people grows, which is why he thought small republics best fit liberty.');
  }
  V.slider(F.ctl, { label: 'Citizens N', min: 2, max: 6, step: 0.05, value: Math.log10(n), fmt: function (v) { return fmtN(Math.pow(10, v)); }, input: function (v) { var x = Math.pow(10, v), p = Math.pow(10, Math.floor(Math.log10(x)) - 1); n = Math.max(100, Math.round(x / p) * p); draw(); } });
  draw();
});
