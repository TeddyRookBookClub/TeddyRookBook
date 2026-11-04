/* gbgreeks.plato-laws: visuals (gbe2, our own designs). SVG helpers first. */
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
/* gb-constitutions: the six kinds of rule. mode 'statesman': Plato's Statesman (302b-303b), lawful and lawless rule.
   mode 'aristotle': Aristotle's Politics III.7, rule for the common good and rule for the rulers' own good. */
ML.viz.register('gb-constitutions', function (el, opts, V) {
  var F = frame(el, 400, 240, 'Six kinds of government: rule by one, by a few, or by many, in a good form and a bad form'), sv = F.svg, ro = V.readout(el);
  var M = {
    statesman: { cols: ['Keeps the laws', 'Ignores the laws'], cells: [
      ['Monarchy', 'A king who rules by good laws: the best of the six, says the Stranger.', 'Tyranny', 'One ruler above the law: the worst of all to live under.'],
      ['Aristocracy', 'A few good rulers under law: in the middle.', 'Oligarchy', 'A few who rule for themselves, without law: in the middle of the bad forms.'],
      ['Democracy (lawful)', 'Rule by the many under law: the weakest of the good forms, because power is spread so thin that it can do little good or harm.', 'Democracy (lawless)', 'Rule by the many without law: the least bad of the bad forms, for the same reason.']],
      note: 'Above all six the Stranger puts a seventh: rule by a true statesman with real knowledge, which he compares to a god among mortals.' },
    aristotle: { cols: ['For the common good', 'For the rulers\' own good'], cells: [
      ['Kingship', 'One person rules for everyone\'s good.', 'Tyranny', 'One person rules for his own good.'],
      ['Aristocracy', 'The best few rule for everyone\'s good.', 'Oligarchy', 'The rich few rule in their own interest. Aristotle says wealth, not number, is what really marks it.'],
      ['Polity', 'The many rule for everyone\'s good, a mix of rich and poor with a large middle class. Aristotle thinks it the most stable form in practice.', 'Democracy', 'In Aristotle\'s word, rule by the poor many in their own interest. (He uses "democracy" for the bad form; today the word is used in a much broader sense.)']],
      note: 'Aristotle names the good forms and their "deviations". He also asks which form suits a given people, not only which is best in theory.' }
  };
  var mode = M[opts.mode] ? opts.mode : 'statesman', sel = [0, 0], showRank = false;
  var RANK = [[1, 6], [2, 5], [3, 4]];
  function draw() {
    clear(sv);
    var m = M[mode];
    Tx(sv, 162, 24, m.cols[0], 'b sm gbe-tf'); Tx(sv, 310, 24, m.cols[1], 'b sm gbe-tg');
    ['One', 'A few', 'Many'].forEach(function (r, i) { Tx(sv, 44, 66 + i * 64, r, 'b mut'); });
    m.cells.forEach(function (row, i) {
      [0, 1].forEach(function (j) {
        var x = 92 + j * 148, y = 36 + i * 64, on = sel[0] === i && sel[1] === j, g = S('g', { 'class': 'gbe-hit', tabindex: 0, role: 'button', 'aria-label': row[j * 2] }, sv);
        S('rect', { x: x, y: y, width: 140, height: 54, rx: 9, 'class': on ? 'gbe-box-on' : (j ? 'gbe-box-red' : 'gbe-box') }, g);
        Tx(g, x + 70, y + 32, row[j * 2], 'b');
        if (showRank && mode === 'statesman') Tx(g, x + 128, y + 16, '#' + RANK[i][j], 'sm acc');
        function pick() { sel = [i, j]; draw(); }
        g.addEventListener('click', pick); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
    });
    var c = m.cells[sel[0]];
    ro.set('<b>' + c[sel[1] * 2] + '.</b> ' + c[sel[1] * 2 + 1] + ' <br>' + m.note);
  }
  if (mode === 'statesman') V.button(F.ctl, 'Show the Stranger\'s ranking', function (e) { showRank = !showRank; e.target.textContent = showRank ? 'Hide the ranking' : 'Show the Stranger\'s ranking'; draw(); });
  draw();
});
