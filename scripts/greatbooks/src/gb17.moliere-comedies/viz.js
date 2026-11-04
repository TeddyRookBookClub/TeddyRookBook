/* gb17.moliere-comedies: visuals (gbw2, our own design). */
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
/* gb-moliere: the pattern of Moliere's character comedies: the hero ruled by one idea, the clear-sighted one, the people at risk. */
ML.viz.register('gb-moliere', function (el, opts, V) {
  var F = frame(el, 400, 220, 'Moliere\'s comedies: who is foolish, who sees clearly, who is at risk'), sv = F.svg, ro = V.readout(el);
  var PL = {
    school: ['The School for Wives', 1662, 'Arnolphe', 'fear of being deceived', 'Agnès, his ward (her innocence)', 'Agnès and the young Horace', 'Arnolphe\'s plan collapses; the young people are free to marry.'],
    tartuffe: ['Tartuffe', 1669, 'Orgon', 'blind trust in a false saint', 'Dorine the maid; Elmire, his wife', 'Orgon\'s daughter, wife and fortune', 'Elmire exposes Tartuffe; an officer of the king arrests him.'],
    juan: ['Don Juan', 1665, 'Don Juan', 'pleasure, and contempt for every promise', 'Sganarelle, his servant', 'everyone he deceives', 'The statue of a man he wronged comes to dinner, and in the end the earth swallows Don Juan up.'],
    miser: ['The Miser', 1668, 'Harpagon', 'his money-box', 'La Flèche, his son\'s quick-witted valet', 'his son, his daughter and the girl he wants to marry', 'Harpagon gets his money-box back in exchange for letting his children marry the people they love.'],
    gent: ['The Would-Be Gentleman', 1670, 'Monsieur Jourdain', 'wanting to be a nobleman', 'Madame Jourdain and Nicole the maid', 'his daughter Lucile and her suitor', 'He is fooled by a mock Turkish ceremony, and his daughter marries the man she loves.'],
    invalid: ['The Would-Be Invalid', 1673, 'Argan', 'being sure he is sick', 'Toinette the maid', 'his daughter Angélique', 'Toinette plays a doctor; Argan is made a "doctor" himself in a mock ceremony.']
  };
  var key = opts.play || 'miser';
  function mask(x, y, sad, cls) {
    S('path', { d: 'M' + (x - 22) + ',' + (y - 16) + ' Q' + x + ',' + (y - 26) + ' ' + (x + 22) + ',' + (y - 16) + ' Q' + (x + 24) + ',' + (y + 14) + ' ' + x + ',' + (y + 24) + ' Q' + (x - 24) + ',' + (y + 14) + ' ' + (x - 22) + ',' + (y - 16) + ' Z', 'class': cls }, sv);
    S('ellipse', { cx: x - 9, cy: y - 4, rx: 5, ry: 3, 'class': 'gbw-eye' }, sv); S('ellipse', { cx: x + 9, cy: y - 4, rx: 5, ry: 3, 'class': 'gbw-eye' }, sv);
    S('path', { d: sad ? 'M' + (x - 9) + ',' + (y + 13) + ' Q' + x + ',' + (y + 5) + ' ' + (x + 9) + ',' + (y + 13) : 'M' + (x - 10) + ',' + (y + 7) + ' Q' + x + ',' + (y + 17) + ' ' + (x + 10) + ',' + (y + 7), 'class': 'gbw-mouth' }, sv);
  }
  function draw() {
    clear(sv);
    var p = PL[key];
    Tx(sv, 200, 20, p[0] + ' (' + p[1] + ')', 'b serif');
    mask(200, 78, false, 'gbw-mask-on');
    Tx(sv, 200, 124, p[2], 'b'); Tx(sv, 200, 140, 'ruled by: ' + p[3], 'sm mut');
    mask(70, 92, false, 'gbw-mask'); Tx(sv, 70, 134, 'sees clearly', 'sm b'); 
    mask(330, 92, true, 'gbw-mask'); Tx(sv, 330, 134, 'at risk', 'sm b');
    S('path', { d: 'M96,88 L172,80', 'class': 'gbw-line', 'stroke-dasharray': '3 3' }, sv); S('path', { d: 'M228,80 L304,88', 'class': 'gbw-hot' }, sv);
    var wrap = function (s, x, y) { var w = s.split(' '), line = '', n = 0; w.forEach(function (t) { if ((line + ' ' + t).length > 22) { Tx(sv, x, y + n * 13, line.trim(), 'sm'); n++; line = ''; } line += ' ' + t; }); Tx(sv, x, y + n * 13, line.trim(), 'sm'); };
    wrap(p[4], 70, 152); wrap(p[5], 330, 152);
    ro.set('<b>' + p[0] + '.</b> ' + p[2] + ' is ruled by ' + p[3] + '. Seeing clearly: ' + p[4] + '. At risk: ' + p[5] + '. <b>Ending:</b> ' + p[6]);
  }
  V.seg(F.ctl, { label: 'Play', items: [['school', 'School for Wives'], ['tartuffe', 'Tartuffe'], ['juan', 'Don Juan'], ['miser', 'The Miser'], ['gent', 'Would-Be Gentleman'], ['invalid', 'Would-Be Invalid']], value: key, change: function (v) { key = v; draw(); } });
  draw();
});
