/* gbgreeks.plato-phaedo: visuals (gbe2, our own designs). SVG helpers first. */
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
/* gb-opposites: the Phaedo's argument from opposites. Each pair of opposites comes from the other by two processes. */
ML.viz.register('gb-opposites', function (el, opts, V) {
  var F = frame(el, 400, 220, 'Opposites come from opposites: a cycle of two processes'), sv = F.svg, ro = V.readout(el);
  var P = [
    ['Asleep', 'Awake', 'waking up', 'falling asleep', 'Sleeping and waking take turns. If people only ever fell asleep and never woke, Socrates says, the whole world would end up like Endymion in the old story, asleep for ever.'],
    ['Smaller', 'Larger', 'growing', 'shrinking', 'Anything that becomes larger was smaller before. Becoming larger and becoming smaller are the two roads between the pair.'],
    ['Cold', 'Hot', 'warming', 'cooling', 'Hot things come from cold ones by warming, and cold from hot by cooling. Neither road runs one way only.'],
    ['Dead', 'Living', 'coming back to life', 'dying', 'Socrates applies the pattern to life and death: if the living come from the dead, souls must exist somewhere between lives. Cebes and Simmias still have doubts, so he goes on to other arguments.']
  ];
  var cur = opts.pair == null ? 3 : opts.pair, one = false;
  function arc(d, cls, label, y) { S('path', { d: d, 'class': cls, 'marker-end': 'url(#' + mid + ')' }, sv); Tx(sv, 200, y, label, 'b'); }
  var mid = V.uid('gbe-arr');
  function draw() {
    clear(sv);
    var defs = S('defs', {}, sv), m = S('marker', { id: mid, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    S('path', { d: 'M0,0 L10,5 L0,10 Z', 'class': 'gbe-mutf' }, m);
    var p = P[cur];
    S('circle', { cx: 80, cy: 110, r: 46, 'class': 'gbe-box-blue' }, sv); Tx(sv, 80, 115, p[0], 'b lg');
    S('circle', { cx: 320, cy: 110, r: 46, 'class': 'gbe-box-gold' }, sv); Tx(sv, 320, 115, p[1], 'b lg');
    arc('M110,72 Q200,10 290,72', 'gbe-arrow', p[2], 34);
    if (!one) arc('M290,148 Q200,210 110,148', 'gbe-arrow', p[3], 200);
    else Tx(sv, 200, 200, 'No road back: everything piles up on one side', 'mut');
    ro.set(one ? 'If the change ran <b>only one way</b>, everything would end up on one side and change would stop. That, Socrates argues, is not how nature works.' : p[4]);
  }
  V.seg(F.ctl, { label: 'Pair of opposites', items: P.map(function (p, i) { return [i, p[0] + ' / ' + p[1]]; }), value: cur, change: function (v) { cur = +v; draw(); } });
  V.button(F.ctl, 'What if it ran one way?', function (e) { one = !one; e.target.textContent = one ? 'Show both roads' : 'What if it ran one way?'; draw(); });
  draw();
});
