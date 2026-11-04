/* gb17.pascal-provincial-letters: visuals (gbw2, our own design). */
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
/* gb-provincial: the eighteen Provincial Letters on a timeline, January 1656 to March 1657, in three groups. */
ML.viz.register('gb-provincial', function (el, opts, V) {
  var F = frame(el, 400, 170, 'The eighteen Provincial Letters, 1656 to 1657'), sv = F.svg, ro = V.readout(el);
  var RN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII'];
  var G = [[0, 2, 'Letters to a friend: the Sorbonne quarrel over grace', 'gbw-g1'], [3, 9, 'Letters to a friend: dialogues with a Jesuit casuist', 'gbw-g2'], [10, 17, 'Letters to the Jesuit Fathers (XVII–XVIII to Father Annat)', 'gbw-g3']];
  var NOTE = { 0: 'The narrator learns that the censure of Arnauld turns on the word "proximate", which nobody can define.', 1: 'Sufficient grace, which (as the narrator finds) does not suffice.', 4: 'The good Father explains probable opinions: one learned author is enough to make an opinion safe to follow.', 6: 'Directing the intention: how an act might be excused by fixing the mind on a harmless purpose.', 10: 'Pascal drops the fictional friend, writes to the Jesuits directly, and defends the use of irony against error.', 15: 'It ends with the apology that it is long only because he lacked the leisure to make it shorter.', 16: 'To Father Annat: back to the grace dispute and the five propositions.', 17: 'The last letter, March 1657.' };
  var cur = opts.pick == null ? 0 : opts.pick;
  function grp(i) { for (var k = 0; k < G.length; k++) if (i >= G[k][0] && i <= G[k][1]) return G[k]; }
  function draw() {
    clear(sv);
    var DT = ['Jan–Feb 1656', 'Feb–Aug 1656', 'Aug 1656–Mar 1657'];
    G.forEach(function (gr, r) {
      var y = 14 + r * 46;
      Tx(sv, 8, y + 9, DT[r], 'sm mut', 'start');
      for (var i = gr[0]; i <= gr[1]; i++) (function (i) {
        var x = 8 + (i - gr[0]) * 48, on = i === cur, g = S('g', {}, sv);
        S('rect', { x: x, y: y + 14, width: 44, height: 24, rx: 5, 'class': (on ? 'gbw-on ' : '') + gr[3] }, g);
        Tx(g, x + 22, y + 30, RN[i], 'sm' + (on ? ' b' : ''));
        clickable(g, 'Letter ' + RN[i], function () { cur = i; draw(); });
      })(i);
    });
    Tx(sv, 392, 160, 'Tap a letter.', 'sm mut', 'end');
    var g = grp(cur);
    ro.set('<b>Letter ' + RN[cur] + '.</b> ' + g[2] + '. ' + (NOTE[cur] || ''));
  }
  draw();
});
