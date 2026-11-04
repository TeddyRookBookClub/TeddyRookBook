/* gbgreeks.aristotle-on-the-soul: visuals (gbe2, our own designs). SVG helpers first. */
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
/* gb-soul-powers: Aristotle's ladder of the soul's powers (On the Soul II.2-3): nutrition, sensation, thought. */
ML.viz.register('gb-soul-powers', function (el, opts, V) {
  var F = frame(el, 400, 250, 'Aristotle\'s powers of the soul: plants, animals and people'), sv = F.svg, ro = V.readout(el);
  var K = {
    plant: { n: 'A plant', lv: 1, t: 'A plant has the first power only: <b>nutrition</b>. It takes in food, grows and makes new plants. For Aristotle that is already a kind of soul, because it is what makes the plant alive.' },
    animal: { n: 'An animal', lv: 2, t: 'An animal has nutrition and also <b>sensation</b>: every animal has at least touch. With feeling comes <b>desire</b>, wanting what is pleasant, and most animals can also <b>move</b> from place to place.' },
    human: { n: 'A person', lv: 3, t: 'A human being has all of these and one more: <b>thought</b>, the power to reason and understand. The higher powers never come without the lower ones.' }
  };
  var cur = opts.who || 'animal';
  function leaf(g, x, y) { S('path', { d: 'M' + x + ',' + (y + 18) + ' q-18,-20 0,-38 q18,18 0,38 z', 'class': 'gbe-g', opacity: 0.8 }, g); S('line', { x1: x, y1: y + 18, x2: x, y2: y + 26, 'class': 'gbe-ink' }, g); }
  function beast(g, x, y) { S('rect', { x: x - 18, y: y - 6, width: 32, height: 14, rx: 7, 'class': 'gbe-mutf' }, g); S('circle', { cx: x + 18, cy: y - 6, r: 7, 'class': 'gbe-mutf' }, g); [-14, -6, 4, 10].forEach(function (d) { S('rect', { x: x + d, y: y + 6, width: 3, height: 12, 'class': 'gbe-mutf' }, g); }); }
  function human(g, x, y) { S('rect', { x: x - 8, y: y - 6, width: 16, height: 24, rx: 6, 'class': 'gbe-cloth' }, g); S('circle', { cx: x, cy: y - 14, r: 8, 'class': 'gbe-skin' }, g); }
  function draw() {
    clear(sv);
    var lv = K[cur].lv, cx = 108, cy = 124;
    [[3, 102, 'Thought', 'gbe-box-blue'], [2, 72, 'Sensation, desire, movement', 'gbe-box-gold'], [1, 40, 'Nutrition and growth', 'gbe-box-on']].forEach(function (r) {
      S('circle', { cx: cx, cy: cy, r: r[1], 'class': r[0] <= lv ? r[3] : 'gbe-box', opacity: r[0] <= lv ? 1 : 0.55 }, sv);
    });
    Tx(sv, cx, cy + 5, 'Nutrition', 'b sm'); Tx(sv, cx, cy - 54, 'Sensation', 'b sm' + (lv >= 2 ? '' : ' mut')); Tx(sv, cx, cy - 84, 'Thought', 'b sm' + (lv >= 3 ? '' : ' mut'));
    var g = S('g', {}, sv);
    Tx(sv, 316, 40, K[cur].n, 'b lg');
    if (cur === 'plant') leaf(g, 320, 90); else if (cur === 'animal') beast(g, 318, 92); else human(g, 320, 96);
    ['Nutrition', 'Sensation, desire', 'Thought'].forEach(function (p, i) { var has = i < lv; Tx(sv, 250, 150 + i * 22, (has ? '✓ ' : '✗ ') + p, has ? 'gbe-tf b' : 'mut', 'start'); });
    ro.set(K[cur].t);
  }
  V.seg(F.ctl, { label: 'Living thing', items: [['plant', 'Plant'], ['animal', 'Animal'], ['human', 'Person']], value: cur, change: function (v) { cur = v; draw(); } });
  draw();
});
