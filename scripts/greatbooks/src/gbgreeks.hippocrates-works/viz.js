/* gbgreeks.hippocrates-works: visuals gb-qualities (gbsA, our own designs; theme colors from MathLadder.viz.colors()). */
var RM = typeof ML.viz.reduced === 'function' ? ML.viz.reduced() : !!ML.viz.reduced;
function gbBox(el, cls) {
  var stage = document.createElement('div'); stage.className = 'gb-stage ' + (cls || ''); el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { stage: stage, ctl: ctl };
}

ML.viz.register('gb-qualities', function (el, opts, V) {
  var stage = document.createElement('div'); stage.className = 'gb-stage gb-qual'; el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl); var ro = V.readout(el);
  var H = [
    ['blood', 'Blood', 'hot and wet', 'air', 'spring', 'In the Hippocratic <em>On the Nature of Man</em>, blood increases in spring, which is warm and moist.'],
    ['yellow', 'Yellow bile', 'hot and dry', 'fire', 'summer', 'Yellow bile was said to rule in summer, hot and dry.'],
    ['black', 'Black bile', 'cold and dry', 'earth', 'autumn', 'Black bile was said to rule in autumn, dry and turning cold.'],
    ['phlegm', 'Phlegm', 'cold and wet', 'water', 'winter', 'Phlegm was said to increase in winter: people have more colds then, which the writer took as evidence.']
  ];
  var svgNS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('viewBox', '0 0 400 300'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'The four qualities and the four humors'); stage.appendChild(svg);
  var C = [[200, 42], [354, 150], [200, 258], [46, 150]]; // top: hot+wet ... arranged as a diamond
  var Q = [['Hot', 290, 86], ['Dry', 290, 222], ['Cold', 110, 222], ['Wet', 110, 86]];
  function mk(tag, at, txt) { var e = document.createElementNS(svgNS, tag); Object.keys(at).forEach(function (a) { e.setAttribute(a, at[a]); }); if (txt) e.textContent = txt; svg.appendChild(e); return e; }
  mk('polygon', { points: C.map(function (p) { return p.join(','); }).join(' '), class: 'gb-q-sq' });
  Q.forEach(function (q) { mk('text', { x: q[1], y: q[2], class: 'gb-q-ql', 'text-anchor': 'middle' }, q[0]); });
  var nodes = H.map(function (h, i) {
    var g = document.createElementNS(svgNS, 'g'); g.setAttribute('class', 'gb-q-nd gb-q-' + h[0]); svg.appendChild(g);
    var r = document.createElementNS(svgNS, 'circle'); r.setAttribute('cx', C[i][0]); r.setAttribute('cy', C[i][1]); r.setAttribute('r', 38); g.appendChild(r);
    var t = document.createElementNS(svgNS, 'text'); t.setAttribute('x', C[i][0]); t.setAttribute('y', C[i][1] - 3); t.setAttribute('text-anchor', 'middle'); t.textContent = h[1]; g.appendChild(t);
    var t2 = document.createElementNS(svgNS, 'text'); t2.setAttribute('x', C[i][0]); t2.setAttribute('y', C[i][1] + 12); t2.setAttribute('text-anchor', 'middle'); t2.setAttribute('class', 'gb-q-sub'); t2.textContent = h[4]; g.appendChild(t2);
    return g;
  });
  var wrap = document.createElement('div'); wrap.className = 'ml-seg'; wrap.setAttribute('role', 'group'); wrap.setAttribute('aria-label', 'Humor'); ctl.appendChild(wrap);
  var btns = H.map(function (h, i) { var b = document.createElement('button'); b.type = 'button'; b.textContent = h[1]; b.addEventListener('click', function () { pick(i); }); wrap.appendChild(b); return b; });
  function pick(i) {
    nodes.forEach(function (n, j) { n.classList.toggle('on', j === i); }); btns.forEach(function (b, j) { b.setAttribute('aria-pressed', String(j === i)); });
    var h = H[i]; ro.set('<b>' + h[1] + '</b>: ' + h[2] + ', like the element ' + h[3] + '; strongest in ' + h[4] + '. ' + h[5] + ' <br><em>This is the history of an idea, not medical advice. Modern medicine does not use the four humors.</em>');
  }
  pick(0);
});
