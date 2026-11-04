/* gb17.racine-phaedra: visuals (gbw2, our own design). */
var NS = 'http://www.w3.org/2000/svg';
function S(tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function Tx(par, x, y, s, cls, anc) { var t = S('text', { x: x, y: y, 'class': cls || '', 'text-anchor': anc || 'middle' }, par); t.textContent = s; return t; }
function frame(el, w, h, label) {
  var st = document.createElement('div'); st.className = 'gbw-stage'; el.appendChild(st);
  var sv = S('svg', { viewBox: '0 0 ' + w + ' ' + h, 'class': 'gbw-svg', role: 'img', 'aria-label': label }, st);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl gbw-ctl'; el.appendChild(ctl);
  return { svg: sv, ctl: ctl };
}
function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
function person(g, x, y, s, robe) { // a generic standing figure in the site's cartoon skin color
  s = s || 1;
  S('path', { d: 'M' + (x - 8 * s) + ',' + (y + 22 * s) + ' L' + (x - 6 * s) + ',' + (y + 2 * s) + ' Q' + x + ',' + (y - 2 * s) + ' ' + (x + 6 * s) + ',' + (y + 2 * s) + ' L' + (x + 8 * s) + ',' + (y + 22 * s) + ' Z', 'class': 'gbw-robe' + (robe ? ' ' + robe : '') }, g);
  S('circle', { cx: x, cy: y - 6 * s, r: 6 * s, 'class': 'gbw-skin' }, g);
}
function clickable(g, label, fn) { g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', label); g.setAttribute('class', (g.getAttribute('class') || '') + ' gbw-click'); g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); return g; }
/* gb-phaedra: who is who in Racine's Phaedra and Berenice. Solid lines: family; gold lines: love; dashed: a secret love. */
ML.viz.register('gb-phaedra', function (el, opts, V) {
  var F = frame(el, 400, 240, 'The characters of Racine\'s Phaedra and Berenice and how they are linked'), sv = F.svg, ro = V.readout(el);
  var D = {
    phaedra: { t: 'Phaedra (1677) · Troezen · one day', n: { th: [200, 40, 'Theseus', 'King of Athens, long absent; reported dead, then returns.'], ph: [80, 120, 'Phaedra', 'Theseus\'s wife, daughter of King Minos of Crete. She hides a love she knows is wrong.'], hi: [320, 120, 'Hippolytus', 'Theseus\'s son by an earlier marriage. He loves Aricia.'], ar: [200, 205, 'Aricia', 'A princess of a rival royal family, whom Theseus has forbidden to marry.'], oe: [70, 205, 'Oenone', 'Phaedra\'s old nurse and confidant. Her plan leads to the false accusation.'], tr: [330, 205, 'Theramenes', 'Hippolytus\'s tutor and friend. He tells how Hippolytus died.'] },
      e: [['th', 'ph', 'fam', 'married'], ['th', 'hi', 'fam', 'father and son'], ['ph', 'hi', 'secret', 'her hidden love'], ['hi', 'ar', 'love', 'in love', -26], ['ph', 'oe', 'conf', 'confidant'], ['hi', 'tr', 'conf', 'confidant']] },
    berenice: { t: 'Berenice (1670) · Rome · one day', n: { ti: [200, 40, 'Titus', 'The new emperor of Rome. He loves Berenice but believes Rome will not accept a foreign queen.'], be: [90, 150, 'Berenice', 'Queen from the East, in Rome expecting to marry Titus.'], an: [310, 150, 'Antiochus', 'A king, Titus\'s friend, who has silently loved Berenice for years.'], pa: [60, 40, 'Paulinus', 'Titus\'s confidant, who speaks for what Rome will and will not accept.'] },
      e: [['ti', 'be', 'love', 'they love each other'], ['an', 'be', 'secret', 'his hidden love'], ['ti', 'an', 'fam', 'friends'], ['ti', 'pa', 'conf', 'confidant']] }
  };
  var play = opts.play || 'phaedra', cur = null;
  function draw() {
    clear(sv);
    var d = D[play];
    d.e.forEach(function (e) { var a = d.n[e[0]], b = d.n[e[1]]; S('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], 'class': 'gbw-e-' + e[2] + (cur && (cur === e[0] || cur === e[1]) ? ' gbw-e-hot' : '') }, sv); if (e[2] !== 'conf') Tx(sv, (a[0] + b[0]) / 2 + (e[4] || 0), (a[1] + b[1]) / 2 - 5, e[3], 'sm mut'); });
    Object.keys(d.n).forEach(function (k) {
      var n = d.n[k], g = S('g', {}, sv);
      S('rect', { x: n[0] - 48, y: n[1] - 14, width: 96, height: 28, rx: 14, 'class': cur === k ? 'gbw-on' : 'gbw-box' }, g);
      Tx(g, n[0], n[1] + 4, n[2], 'sm b');
      clickable(g, n[2], function () { cur = k; draw(); });
    });
    Tx(sv, 200, 234, d.t, 'sm mut');
    ro.set(cur ? '<b>' + d.n[cur][2] + ':</b> ' + d.n[cur][3] : 'Tap a character. Gray lines are family or friendship, gold lines are love, gold dashes a hidden love, and dotted lines join a confidant.');
  }
  V.seg(F.ctl, { label: 'Play', items: [['phaedra', 'Phaedra'], ['berenice', 'Berenice']], value: play, change: function (v) { play = v; cur = null; draw(); } });
  draw();
});
