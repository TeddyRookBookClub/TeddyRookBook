/* gb18.gibbon-decline-and-fall-1: visuals (gbw3, our own designs). */
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
/* gb-rome-timeline: the Decline and Fall in two parts (part 1: AD 96–493; part 2: AD 527–1453). Used by both Gibbon rungs. */
ML.viz.register('gb-rome-timeline', function (el, opts, V) {
  var P1 = [
    { y: 96, when: 'AD 96–180', lab: 'The five good emperors', txt: 'Nerva, Trajan, Hadrian, Antoninus Pius and Marcus Aurelius: Gibbon\'s \"most happy and prosperous\" age (ch. I–III).' },
    { y: 180, when: 'AD 180', lab: 'Commodus becomes emperor', txt: 'Marcus Aurelius\' son rules badly; decline begins in earnest (ch. IV).' },
    { y: 235, when: 'AD 235–284', lab: 'The crisis of the third century', txt: 'Armies make and unmake emperors; invasions, plague and civil wars (ch. VI–XII).' },
    { y: 284, when: 'AD 284', lab: 'Diocletian\'s reforms', txt: 'Rule is shared among several emperors and the empire is reorganized (ch. XIII).' },
    { y: 330, when: 'AD 330', lab: 'Constantinople founded', txt: 'Constantine, the first Christian emperor, dedicates his new capital on the Bosporus (ch. XVII).' },
    { y: 378, when: 'AD 378', lab: 'Battle of Adrianople', txt: 'The Goths defeat and kill the emperor Valens (ch. XXVI).' },
    { y: 410, when: 'AD 410', lab: 'Alaric sacks Rome', txt: 'The first sack of Rome by a foreign enemy in about 800 years (ch. XXXI).' },
    { y: 451, when: 'AD 451', lab: 'Attila turned back in Gaul', txt: 'The Huns are checked at the Catalaunian Plains (ch. XXXV).' },
    { y: 476, when: 'AD 476', lab: 'The last emperor in the west', txt: 'Odoacer deposes the boy Romulus Augustulus and names no successor (ch. XXXVI).' },
    { y: 493, when: 'AD 493', lab: 'Theodoric rules Italy', txt: 'The Ostrogothic king governs Italy from Ravenna (ch. XXXIX).' }
  ];
  var P2 = [
    { y: 527, when: 'AD 527–565', lab: 'Justinian', txt: 'Reconquests in Africa and Italy, Hagia Sophia, and the great code of Roman law (ch. XL–XLIV).' },
    { y: 622, when: 'AD 622', lab: 'Muhammad goes to Medina', txt: 'The Hijra; the rise of Islam and the Arab conquests follow (ch. L–LI).' },
    { y: 717, when: 'AD 717–718', lab: 'Constantinople holds', txt: 'An Arab siege of the city fails (ch. LII).' },
    { y: 800, when: 'AD 800', lab: 'Charlemagne crowned', txt: 'The pope crowns the Frankish king emperor in Rome (ch. XLIX).' },
    { y: 1054, when: 'AD 1054', lab: 'East and West divided', txt: 'The churches of Rome and Constantinople split (ch. LX).' },
    { y: 1096, when: 'AD 1096', lab: 'The First Crusade', txt: 'Western armies march to the East (ch. LVIII).' },
    { y: 1204, when: 'AD 1204', lab: 'Crusaders take Constantinople', txt: 'The Fourth Crusade sacks the city (ch. LX).' },
    { y: 1258, when: 'AD 1258', lab: 'The Mongols take Baghdad', txt: 'The end of the Abbasid caliphate (ch. LXIV).' },
    { y: 1347, when: 'AD 1347', lab: 'Cola di Rienzo in Rome', txt: 'A brief dream of reviving the Roman republic (ch. LXX).' },
    { y: 1453, when: 'AD 1453', lab: 'Fall of Constantinople', txt: 'Mehmed II takes the city on May 29; Constantine XI dies in the final assault (ch. LXVIII).' }
  ];
  var two = opts.part === 2;
  timeline(el, V, two ? P2 : P1, two ? { y0: 480, y1: 1500, ticks: [500, 800, 1100, 1400], ad: true, sel: opts.sel || 0, label: 'Timeline of the Roman Empire from AD 527 to 1453' } : { y0: 80, y1: 510, ticks: [100, 200, 300, 400, 500], ad: true, sel: opts.sel || 0, label: 'Timeline of the Roman Empire from AD 96 to 493' });
});
