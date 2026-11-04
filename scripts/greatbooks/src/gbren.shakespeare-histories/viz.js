/* gb-kings: the English kings from Richard II to Henry VII (1377-1509), by royal house, with the Shakespeare play that tells each reign. */
/* gbw1 SVG helpers (each viz.js carries its own copy, since each is wrapped on its own). Styles: .gbr-* in this course's viz.css. */
var NS = 'http://www.w3.org/2000/svg';
function S(tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function Tx(par, x, y, s, cls, anc) { var t = S('text', { x: x, y: y, 'class': cls || 'gbr-t', 'text-anchor': anc || 'middle' }, par); t.textContent = s; return t; }
function frame(el, w, h, label) {
  var st = document.createElement('div'); st.className = 'gbr'; el.appendChild(st);
  var sv = S('svg', { viewBox: '0 0 ' + w + ' ' + h, 'class': 'gbr-svg', role: 'img', 'aria-label': label }, st);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { svg: sv, ctl: ctl, stage: st };
}
function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
/* a clickable group: Enter/Space activate it too */
function hit(g, label, fn) {
  g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', label); g.setAttribute('class', (g.getAttribute('class') || '') + ' gbr-hit');
  g.addEventListener('click', fn);
  g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
}
/* a generic cartoon person, in the site's skin color */
function person(g, x, y, s, cloth) {
  S('rect', { x: x - 7 * s, y: y - 2 * s, width: 14 * s, height: 18 * s, rx: 6 * s, 'class': cloth || 'gbr-cloth' }, g);
  S('circle', { cx: x, cy: y - 9 * s, r: 7 * s, 'class': 'gbr-skin' }, g);
}
/* wrap text into lines of at most n characters */
function wrap(s, n) { var w = s.split(' '), out = [], cur = ''; w.forEach(function (x) { if ((cur + ' ' + x).trim().length > n) { if (cur) out.push(cur); cur = x; } else cur = (cur + ' ' + x).trim(); }); if (cur) out.push(cur); return out; }
ML.viz.register('gb-kings', function (el, opts, V) {
  var K = [
    ['Richard II', [[1377, 1399]], 'p', 'Richard II', 'Crowned as a boy of ten. In 1399 his cousin Henry Bolingbroke returned from exile, took the throne and became Henry IV. Shakespeare shows Richard as a poet-king who loses his crown and finds his voice.'],
    ['Henry IV', [[1399, 1413]], 'l', 'Henry IV, Parts 1 and 2', 'The first Lancastrian king, troubled by rebellions and by guilt over how he got the crown. His son, Prince Hal, spends his days in the tavern with Sir John Falstaff, then proves himself in battle.'],
    ['Henry V', [[1413, 1422]], 'l', 'Henry V', 'Prince Hal as king. He invades France and wins the Battle of Agincourt (1415) against long odds, then dies young.'],
    ['Henry VI', [[1422, 1461], [1470, 1471]], 'l', 'Henry VI, Parts 1, 2 and 3', 'King at nine months old. France is lost, and the quarrel of Lancaster and York becomes the Wars of the Roses (from 1455). He lost the throne in 1461, regained it briefly in 1470, and lost it again.'],
    ['Edward IV', [[1461, 1470], [1471, 1483]], 'y', 'Henry VI, Part 3; Richard III', 'The first Yorkist king, who won the crown in battle.'],
    ['Edward V', [[1483, 1483.3]], 'y', 'Richard III', 'A boy king, who with his brother was placed in the Tower of London and never seen again.'],
    ['Richard III', [[1483, 1485]], 'y', 'Richard III', 'Edward IV\'s brother. Shakespeare makes him a charming, scheming villain who tells the audience his plans. He was killed at the Battle of Bosworth in 1485. Historians still debate how fair the Tudor picture of him is.'],
    ['Henry VII', [[1485, 1509]], 't', 'Richard III (as Richmond)', 'Henry Tudor, of Lancastrian descent, won at Bosworth and married Elizabeth of York, uniting the two houses. He was Queen Elizabeth I\'s grandfather, and Shakespeare wrote under Elizabeth.']
  ];
  var HS = { p: ['Plantagenet', 'gbr-f5'], l: ['Lancaster', 'gbr-f3'], y: ['York', 'gbr-f0'], t: ['Tudor', 'gbr-f1'] };
  var F = frame(el, 400, 300, 'The English kings from 1377 to 1509 and the history plays'), sv = F.svg, ro = V.readout(el), cur = opts.king || 0;
  var x0 = 100, x1 = 388, X = function (y) { return x0 + (y - 1375) / (1510 - 1375) * (x1 - x0); };
  function draw() {
    clear(sv);
    S('rect', { x: 0, y: 0, width: 400, height: 300, 'class': 'gbr-bg' }, sv);
    [1400, 1425, 1450, 1475, 1500].forEach(function (y) { S('line', { x1: X(y), y1: 22, x2: X(y), y2: 262, 'class': 'gbr-ln-dash' }, sv); Tx(sv, X(y), 276, String(y), 'gbr-m'); });
    S('rect', { x: X(1455), y: 22, width: X(1487) - X(1455), height: 240, 'class': 'gbr-f3', opacity: 0.25 }, sv);
    Tx(sv, X(1471), 16, 'Wars of the Roses', 'gbr-i');
    K.forEach(function (k, i) {
      var y = 34 + i * 28, g = S('g', { 'class': i === cur ? 'gbr-on' : '' }, sv);
      S('rect', { x: 2, y: y - 4, width: 396, height: 26, rx: 5, 'class': i === cur ? 'gbr-node' : '', fill: 'transparent' }, g);
      Tx(g, 92, y + 13, k[0], 'gbr-b', 'end');
      k[1].forEach(function (r) { S('rect', { x: X(r[0]), y: y, width: Math.max(4, X(r[1]) - X(r[0])), height: 18, rx: 3, 'class': HS[k[2]][1] + ' gbr-sec' }, g); });
      hit(g, k[0], function () { cur = i; draw(); });
    });
    var lx = 100; ['p', 'l', 'y', 't'].forEach(function (h) { S('rect', { x: lx, y: 284, width: 12, height: 12, 'class': HS[h][1] }, sv); Tx(sv, lx + 16, 294, HS[h][0], 'gbr-m', 'start'); lx += 74; });
    var k = K[cur], yrs = k[1].map(function (r) { return Math.floor(r[0]) + (Math.floor(r[1]) !== Math.floor(r[0]) ? '–' + Math.floor(r[1]) : ''); }).join(' and ');
    ro.set('<b>' + k[0] + '</b> (reigned ' + yrs + '; House of ' + HS[k[2]][0] + '). <i>Play:</i> ' + k[3] + '. ' + k[4]);
  }
  V.seg(F.ctl, { label: 'King', items: K.map(function (k, i) { return [i, k[0]]; }), value: cur, change: function (v) { cur = +v; draw(); } });
  draw();
});
