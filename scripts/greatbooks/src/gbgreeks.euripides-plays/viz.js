/* gbgreeks.euripides-plays: visual gb-tragedians (gbe1, our own design). The lives of the Athenian playwrights and
   historians on one time axis, with the wars and some famous first performances. Drag the year to see who was alive
   and about how old. Birth years are approximate (ancient dates). opts: year (negative = BC). */
var NS = 'http://www.w3.org/2000/svg', D = document;
function S(tag, at, par) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function T(par, x, y, s, cls, anchor) { var t = S('text', { x: x, y: y, 'class': cls || '', 'text-anchor': anchor || 'middle' }, par); t.textContent = s; return t; }
var LIVES = [['Aeschylus', -525, -456, 'gbx-fill4'], ['Sophocles', -496, -406, 'gbx-fill3'], ['Euripides', -480, -406, 'gbx-fill2'], ['Aristophanes', -446, -386, 'gbx-fill1'],
  ['Herodotus', -484, -425, 'gbx-fill5'], ['Thucydides', -460, -400, 'gbx-fill6'], ['Socrates', -470, -399, 'gbx-fill6']];
var EV = [[-490, 'Marathon'], [-480, 'Salamis'], [-458, 'Oresteia (Aeschylus)'], [-441, 'Antigone (Sophocles), about this year'], [-438, 'Alcestis (Euripides)'], [-431, 'Medea (Euripides); the Peloponnesian War begins'],
  [-429, 'Oedipus the King (Sophocles), about this year'], [-423, 'The Clouds (Aristophanes)'], [-415, 'The Trojan Women (Euripides)'], [-414, 'The Birds (Aristophanes)'],
  [-405, 'The Frogs (Aristophanes)'], [-404, 'Athens surrenders'], [-399, 'Trial and death of Socrates']];
function yr(y) { return (-y) + ' BC'; }
ML.viz.register('gb-tragedians', function (el, opts, V) {
  var box = D.createElement('div'); box.className = 'gbx gbx-scroll'; box.style.setProperty('--gbx-minw', '600px'); el.appendChild(box);
  var W = 640, H = 300, X0 = 96, X1 = 624, Y0 = -530, Y1 = -380, rowH = 28, top = 34;
  function X(y) { return X0 + (y - Y0) / (Y1 - Y0) * (X1 - X0); }
  var svg = S('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'gbx-svg', role: 'img', 'aria-label': 'Timeline of the Greek playwrights and historians, 530 to 380 BC' }, box);
  S('rect', { x: 0, y: 0, width: W, height: H, rx: 10, 'class': 'gbx-bg' }, svg);
  S('rect', { x: X(-431), y: top - 10, width: X(-404) - X(-431), height: LIVES.length * rowH + 14, 'class': 'gbx-band' }, svg);
  T(svg, (X(-431) + X(-404)) / 2, top - 14, 'Peloponnesian War', 'gbx-small');
  T(svg, X(-485), top - 14, 'Persian Wars', 'gbx-small');
  S('rect', { x: X(-490), y: top - 10, width: X(-479) - X(-490), height: LIVES.length * rowH + 14, 'class': 'gbx-band', style: 'fill:var(--gbx-p)' }, svg);
  LIVES.forEach(function (l, i) {
    var y = top + i * rowH;
    T(svg, X0 - 8, y + 14, l[0], 'gbx-lab', 'end');
    S('rect', { x: X(l[1]), y: y + 2, width: X(l[2]) - X(l[1]), height: rowH - 8, rx: 6, 'class': 'gbx-part ' + l[3] }, svg);
  });
  var ay = top + LIVES.length * rowH + 14;
  S('line', { x1: X0, x2: X1, y1: ay, y2: ay, 'class': 'gbx-axis' }, svg);
  for (var t = -525; t <= -385; t += 25) { S('line', { x1: X(t), x2: X(t), y1: ay, y2: ay + 5, 'class': 'gbx-axis' }, svg); T(svg, X(t), ay + 18, yr(t), 'gbx-small'); }
  EV.forEach(function (e) { S('circle', { cx: X(e[0]), cy: ay + 30, r: 3.5, 'class': 'gbx-pt' }, svg); });
  var now = S('line', { y1: top - 10, y2: ay + 34, 'class': 'gbx-now' }, svg);
  var ctl = D.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  var cur = Math.max(Y0 + 5, Math.min(Y1 - 5, +opts.year || -431));
  var sl = V.slider(ctl, { label: 'Year', min: -525, max: -386, step: 1, value: cur, fmt: function (v) { return yr(v); }, input: function (v) { set(v); } });
  var ro = V.readout(el);
  function set(y) {
    cur = y; now.setAttribute('x1', X(y)); now.setAttribute('x2', X(y));
    var alive = LIVES.filter(function (l) { return y >= l[1] && y <= l[2]; }).map(function (l) { return l[0] + ' (about ' + (y - l[1]) + ')'; });
    var near = EV.filter(function (e) { return Math.abs(e[0] - y) <= 1; }).map(function (e) { return yr(e[0]) + ': ' + e[1]; });
    ro.set('<b>' + yr(y) + '.</b> ' + (alive.length ? 'Alive: ' + alive.join(', ') + '.' : 'None of these writers is alive.') + (near.length ? ' <b>' + near.join('; ') + '.</b>' : ''));
  }
  set(cur);
});
