/* gbgreeks.plato-trial-of-socrates: visuals (gbe2, our own designs). SVG helpers first. */
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
/* gb-last-days: Socrates' last days in four dialogues, with the jury vote of the Apology (about 280 to 220). */
ML.viz.register('gb-last-days', function (el, opts, V) {
  var F = frame(el, 400, 250, 'Socrates\' last days, from the Euthyphro to the Phaedo'), sv = F.svg, ro = V.readout(el);
  var SC = [
    { k: 'euth', t: 'Euthyphro', s: 'Outside the court', txt: '<b>Euthyphro.</b> On his way to answer the charges, Socrates meets Euthyphro, who is sure he knows what holiness is. Five answers later, neither of them can say.' },
    { k: 'apol', t: 'Apology', s: 'The trial', txt: '' },
    { k: 'crit', t: 'Crito', s: 'In prison', txt: '<b>Crito.</b> The execution waited about a month, until a sacred ship came back from Delos. Near the end, his old friend Crito comes at dawn with a plan to escape. Socrates imagines the Laws of Athens speaking to him, and stays.' },
    { k: 'phae', t: 'Phaedo', s: 'The last day', txt: '<b>Phaedo.</b> On his last day Socrates talks with friends about whether the soul outlives the body. At sunset he drinks the cup of poison, as the sentence required, calmly.' }
  ];
  var cur = opts.scene || 0, sw = 0, top = S('g', {}, sv), body = S('g', {}, sv);
  function drawTop() {
    clear(top);
    S('line', { x1: 50, y1: 26, x2: 350, y2: 26, 'class': 'gbe-line' }, top);
    SC.forEach(function (c, i) {
      var x = 50 + i * 100, on = i === cur;
      S('circle', { cx: x, cy: 26, r: on ? 10 : 7, 'class': on ? 'gbe-dot-on' : 'gbe-dot' }, top);
      Tx(top, x, 52, c.t, on ? 'b' : 'mut');
      Tx(top, x, 66, c.s, 'sm mut');
    });
  }
  function drawBody() {
    clear(body);
    if (SC[cur].k !== 'apol') {
      var icon = SC[cur].k;
      var g = S('g', { transform: 'translate(200,165)' }, body);
      if (icon === 'euth') { // columns of a porch
        S('rect', { x: -90, y: -62, width: 180, height: 12, 'class': 'gbe-stone' }, g); S('path', { d: 'M-100,-62 L0,-88 L100,-62 Z', 'class': 'gbe-stone' }, g);
        for (var i = 0; i < 5; i++) S('rect', { x: -80 + i * 38, y: -50, width: 12, height: 90, 'class': 'gbe-stone' }, g);
        S('rect', { x: -95, y: 40, width: 190, height: 10, 'class': 'gbe-stone' }, g);
      } else if (icon === 'crit') { // a barred window
        S('rect', { x: -60, y: -70, width: 120, height: 110, rx: 4, 'class': 'gbe-stone' }, g);
        S('rect', { x: -40, y: -50, width: 80, height: 70, 'class': 'gbe-sky' }, g);
        for (var j = 0; j < 4; j++) S('line', { x1: -30 + j * 20, y1: -50, x2: -30 + j * 20, y2: 20, 'class': 'gbe-bar' }, g);
        S('circle', { cx: 18, cy: -32, r: 9, 'class': 'gbe-moon' }, g);
      } else { // a setting sun over hills
        S('circle', { cx: 0, cy: 10, r: 34, 'class': 'gbe-sun' }, g);
        S('path', { d: 'M-130,40 Q-60,-5 0,30 T130,25 L130,50 L-130,50 Z', 'class': 'gbe-hill' }, g);
      }
      ro.set(SC[cur].txt); return;
    }
    var G = 280 - sw, I = 220 + sw, n = 0;
    for (var r = 0; r < 10; r++) for (var c = 0; c < 50; c++) {
      S('rect', { x: 26 + c * 7, y: 88 + r * 9, width: 5.2, height: 7, rx: 1, 'class': n < G ? 'gbe-guilty' : 'gbe-free' }, body); n++;
    }
    Tx(body, 26, 196, 'Guilty: ' + G, 'b gbe-tg', 'start'); Tx(body, 374, 196, 'Not guilty: ' + I, 'b gbe-tf', 'end');
    var verdict = G > I ? 'Guilty, by ' + (G - I) + ' votes' : (G === I ? 'A tie: in Athens a tie set the defendant free' : 'Acquitted');
    Tx(body, 200, 222, verdict, 'b');
    ro.set('<b>Apology.</b> About 500 citizens sat on the jury. The usual reckoning is 280 votes for guilty and 220 against. Socrates said that if only <b>30</b> votes had gone the other way, he would have been set free. Move the slider to switch votes. ' + (sw ? 'You have switched <b>' + sw + '</b>.' : ''));
  }
  function draw() { drawTop(); drawBody(); }
  V.seg(F.ctl, { label: 'Scene', items: SC.map(function (c, i) { return [i, c.t]; }), value: cur, change: function (v) { cur = +v; sl.el.style.display = cur === 1 ? '' : 'none'; draw(); } });
  var sl = V.slider(F.ctl, { label: 'Votes switched (Apology)', min: 0, max: 40, step: 1, value: 0, input: function (v) { sw = v; draw(); } });
  sl.el.style.display = cur === 1 ? '' : 'none';
  draw();
});
