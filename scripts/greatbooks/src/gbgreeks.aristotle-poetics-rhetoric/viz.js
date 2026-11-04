/* gbgreeks.aristotle-poetics-rhetoric: visuals (gbe2, our own designs). SVG helpers first. */
var NS = 'http://www.w3.org/2000/svg';
function S(tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function Tx(par, x, y, s, cls, anc) { var t = S('text', { x: x, y: y, 'class': cls || '', 'text-anchor': anc || 'middle' }, par); t.textContent = s; return t; }
function frame(el, w, h, label) {
  var st = document.createElement('div'); st.className = 'gb-stage'; el.appendChild(st);
  var sv = S('svg', { viewBox: '0 0 ' + w + ' ' + h, 'class': 'gbe-svg', role: 'img', 'aria-label': label }, st);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { svg: sv, ctl: ctl };
}
function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
/* gb-plot-arc: the parts of a plot in Aristotle's Poetics (beginning, tying, reversal, recognition, unraveling).
   gb-appeals: the three modes of persuasion in the Rhetoric (I.2), as a sorting game with our own sentences. */
ML.viz.register('gb-plot-arc', function (el, opts, V) {
  var F = frame(el, 400, 220, 'The shape of a plot: fortune over the course of a story'), sv = F.svg, ro = V.readout(el);
  var X = {
    oed: { n: 'Oedipus the King', f: [0.75, 0.8, 0.85, 0.8, 0.2, 0.12, 0.1], ev: [
      'A plague strikes Thebes. King Oedipus, who once saved the city by solving the Sphinx\'s riddle, promises to find the cause.',
      'He learns the plague will end only when an old king\'s killer is found, and vows to find him. The knot tightens.',
      'A messenger arrives with what he thinks is good news, meant to ease the king\'s fears. Aristotle\'s own example: it does the opposite.',
      'Oedipus learns who he really is, and that he himself is the man he has been hunting. The truth is terrible.',
      'His happiness is gone. He asks to be sent away from the city, and Creon takes charge. Order returns at a great cost to him.'] },
    ody: { n: 'The Odyssey', f: [0.35, 0.3, 0.2, 0.55, 0.75, 0.9, 0.92], ev: [
      'Odysseus has been away from home for twenty years. Unwelcome guests crowd his house, and his family waits.',
      'He comes home in disguise, and the danger grows: he is one man against many.',
      'His old nurse, washing his feet, sees a scar and knows him. Aristotle names this as a recognition.',
      'With his son\'s help he wins back his house, and is known at last by his wife.',
      'The family is together again. Aristotle notes that the Odyssey ends well for the good and badly for the wicked.'] }
  };
  var LAB = ['Beginning', 'Tying the knot', 'Reversal', 'Recognition', 'Unraveling'], AT = [0, 1, 2.6, 3.3, 5], cur = 0, ex = opts.ex || 'oed';
  function pt(i, f) { return [40 + i * 54, 180 - f * 140]; }
  function draw() {
    clear(sv);
    var e = X[ex], d = '';
    e.f.forEach(function (f, i) { var p = pt(i, f); d += (i ? ' L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); });
    S('line', { x1: 40, y1: 180, x2: 368, y2: 180, 'class': 'gbe-line' }, sv); Tx(sv, 34, 44, 'good fortune', 'sm mut', 'start'); Tx(sv, 34, 196, 'bad fortune', 'sm mut', 'start');
    S('path', { d: d, 'class': 'gbe-ink', 'stroke-width': 3 }, sv);
    AT.forEach(function (a, i) {
      var j = Math.floor(a), t = a - j, f = e.f[j] + (e.f[Math.min(j + 1, 6)] - e.f[j]) * t, p = pt(a, f), on = i === cur;
      var g = S('g', { 'class': 'gbe-hit', tabindex: 0, role: 'button', 'aria-label': LAB[i] }, sv);
      S('circle', { cx: p[0], cy: p[1], r: on ? 10 : 7, 'class': on ? 'gbe-dot-on' : 'gbe-dot' }, g);
      Tx(g, p[0], p[1] + (f > 0.5 ? 26 : -16), (i + 1) + '', 'b sm');
      function pick() { cur = i; if (partSeg) partSeg.set(i); draw(); }
      g.addEventListener('click', pick); g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); } });
    });
    Tx(sv, 200, 214, (cur + 1) + '. ' + LAB[cur], 'b');
    ro.set('<b>' + e.n + ', ' + LAB[cur].toLowerCase() + '.</b> ' + e.ev[cur]);
  }
  V.seg(F.ctl, { label: 'Story', items: [['oed', 'Oedipus the King'], ['ody', 'The Odyssey']], value: ex, change: function (v) { ex = v; draw(); } });
  var partSeg = null;
  partSeg = V.seg(F.ctl, { label: 'Part', items: LAB.map(function (l, i) { return [i, (i + 1) + '']; }), value: 0, change: function (v) { cur = +v; draw(); } });
  draw();
});

ML.viz.register('gb-appeals', function (el, opts, V) {
  var F = frame(el, 400, 200, 'Aristotle\'s three ways to persuade: character, feeling and reasoning'), sv = F.svg, ro = V.readout(el);
  var Q = [
    ['I have coached swimming for twenty years, and I have never seen a stronger beginner.', 0],
    ['Picture the empty playground and the children with nowhere safe to play.', 1],
    ['The bridge carries 9,000 cars a day, and it was built for 4,000. It needs repair.', 2],
    ['As your doctor, I would give my own family this advice.', 0],
    ['If every family saves one gallon a day, the town saves a million gallons a year.', 2],
    ['Think how proud you will feel on the day you finish.', 1],
    ['All the tested samples came from the north well, and all of them were clean.', 2],
    ['I grew up on this street, and I want the best for it, just as you do.', 0],
    ['Imagine the dog waiting at the shelter door, hoping today is the day.', 1]
  ];
  var A = [['Ethos', 'the speaker\'s character', 'gbe-box-blue'], ['Pathos', 'the listeners\' feelings', 'gbe-box-red'], ['Logos', 'the reasoning itself', 'gbe-box-gold']];
  var k = 0, got = null, score = 0, tries = 0;
  function draw() {
    clear(sv);
    var P = [[200, 34], [84, 160], [316, 160]];
    S('polygon', { points: P.map(function (p) { return p.join(','); }).join(' '), 'class': 'gbe-line' }, sv);
    A.forEach(function (a, i) {
      var on = got !== null && Q[k][1] === i, g = S('g', { 'class': 'gbe-hit', tabindex: 0, role: 'button', 'aria-label': a[0] + ': ' + a[1] }, sv);
      S('rect', { x: P[i][0] - 78, y: P[i][1] - 24, width: 156, height: 48, rx: 10, 'class': on ? 'gbe-box-on' : a[2] }, g);
      Tx(g, P[i][0], P[i][1] - 3, a[0], 'b lg'); Tx(g, P[i][0], P[i][1] + 14, a[1], 'sm mut');
      function pick() { if (got !== null) return; got = i; tries++; if (i === Q[k][1]) score++; draw(); }
      g.addEventListener('click', pick); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    Tx(sv, 200, 110, 'Score: ' + score + ' of ' + tries, 'sm mut');
    var q = '“' + Q[k][0] + '”';
    ro.set(got === null ? q + ' <br>Which appeal does this lean on most? Tap one.' : q + ' <br>' + (got === Q[k][1] ? '<b>Yes:</b> ' : '<b>Not quite:</b> ') + 'this one leans on <b>' + A[Q[k][1]][0] + '</b>, ' + A[Q[k][1]][1] + '. Many real speeches use all three.');
  }
  V.button(F.ctl, 'Next sentence', function () { k = (k + 1) % Q.length; got = null; draw(); });
  draw();
});
