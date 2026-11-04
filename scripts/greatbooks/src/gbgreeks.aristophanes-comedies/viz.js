/* gbgreeks.aristophanes-comedies: visual gb-old-comedy (gbe1, our own design). The usual parts of an Old Comedy as a
   strip, in the order they come in The Birds or The Frogs; tap a part for what it is and what happens there.
   opts: play ('birds' | 'frogs'), part (a key, selected at the start). Widths are rough proportions, not line counts. */
var NS = 'http://www.w3.org/2000/svg', D = document;
function S(tag, at, par) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function T(par, x, y, s, cls, anchor) { var t = S('text', { x: x, y: y, 'class': cls || '', 'text-anchor': anchor || 'middle' }, par); t.textContent = s; return t; }
function hit(g, label, fn) {
  g.setAttribute('class', (g.getAttribute('class') || '') + ' gbx-hit'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', label);
  g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
}
var KIND = {
  prologue: ['Prologue', 'The opening scene, before the chorus arrives: the hero explains the bright idea that drives the plot.', 'gbx-fill1'],
  parodos: ['Parodos', 'The entrance song of the chorus, often in spectacular costume.', 'gbx-fill2'],
  agon: ['Agon', 'The "contest": a formal debate in which two sides argue it out, and one wins.', 'gbx-fill4'],
  parabasis: ['Parabasis', 'The chorus steps forward and speaks straight to the audience, often for the poet himself, with jokes, praise of his own plays and advice to the city.', 'gbx-fill5'],
  episodes: ['Episodes', 'A run of short, quick scenes, often a parade of visitors who come to profit from the hero\'s success and are sent packing.', 'gbx-fill3'],
  exodos: ['Exodos', 'The finale and exit, often a celebration, procession or wedding.', 'gbx-fill6']
};
var PLAYS = {
  birds: ['The Birds (414 BC)', [
    ['prologue', 2, 'Two Athenians, Peisetaerus and Euelpides, tired of their city\'s lawsuits, follow a crow and a jackdaw to find Tereus, a king who was turned into a hoopoe bird.'],
    ['parodos', 1.2, 'The birds flock in from every side, furious at the humans, and nearly attack them.'],
    ['agon', 1.4, 'Peisetaerus argues that the birds were the first rulers of the world, older than the gods, and that a city in the air could cut the gods off from the smoke of human sacrifices.'],
    ['parabasis', 1.4, 'The bird chorus tells the audience its own comic story of how the world began, with the birds first, and lists all the good things birds do for people.'],
    ['episodes', 3, 'Cloudcuckooland is founded and walled. Pests arrive to cash in: a poet, an oracle-seller, a surveyor, an inspector. The messenger goddess Iris is caught trespassing, and Prometheus sneaks in with advice.'],
    ['exodos', 1, 'The gods give in. Peisetaerus marries Basileia, "Sovereignty", and is hailed as ruler of the universe.']
  ]],
  frogs: ['The Frogs (405 BC)', [
    ['prologue', 2, 'Dionysus, dressed in a lion skin like Heracles, sets off with his slave Xanthias to bring Euripides back from the dead. Crossing the lake, he must row while the frogs croak at him.'],
    ['parodos', 1.2, 'A chorus of happy initiates of the Mysteries comes singing through the underworld.'],
    ['episodes', 2, 'Comic mix-ups at the door of the underworld, as Dionysus and Xanthias keep swapping the lion skin depending on who is being welcomed and who is being threatened.'],
    ['parabasis', 1.2, 'The chorus gives serious advice: forgive citizens who made mistakes and restore their rights, and trust good, honest leaders. Ancient sources say this is why the play was performed a second time.'],
    ['agon', 3, 'In this play the contest comes late: Aeschylus and Euripides argue over who is the better poet, quote and mock each other, and weigh their verses on a scale.'],
    ['exodos', 1, 'Dionysus chooses Aeschylus, who is led back to Athens by torchlight. Sophocles is left to keep the chair of tragedy below.']
  ]]
};
ML.viz.register('gb-old-comedy', function (el, opts, V) {
  var box = D.createElement('div'); box.className = 'gbx gbx-scroll'; box.style.setProperty('--gbx-minw', '560px'); el.appendChild(box);
  var W = 640, H = 120, x0 = 10, x1 = 630, play = PLAYS[opts.play] ? opts.play : 'birds', cur = 0;
  var svg = S('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'gbx-svg', role: 'group', 'aria-label': 'The parts of an Old Comedy' }, box);
  var g = S('g', {}, svg), rects = [];
  var ctl = D.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  V.seg(ctl, { label: 'Play', items: [['birds', 'The Birds'], ['frogs', 'The Frogs']], value: play, change: function (v) { play = v; cur = 0; draw(); } });
  V.button(ctl, 'Next part ▶', function () { cur = (cur + 1) % PLAYS[play][1].length; mark(); });
  var ro = V.readout(el);
  function draw() {
    while (g.firstChild) g.removeChild(g.firstChild);
    S('rect', { x: 0, y: 0, width: W, height: H, rx: 10, 'class': 'gbx-bg' }, g);
    T(g, x0, 22, PLAYS[play][0] + ': the parts in order', 'gbx-cap', 'start');
    var parts = PLAYS[play][1], tot = parts.reduce(function (a, p) { return a + p[1]; }, 0), x = x0; rects = [];
    parts.forEach(function (p, i) {
      var w = (x1 - x0) * p[1] / tot, k = KIND[p[0]], c = S('g', {}, g);
      rects.push(S('rect', { x: x + 1, y: 34, width: w - 2, height: 56, rx: 6, 'class': 'gbx-part ' + k[2] }, c));
      T(c, x + w / 2, 67, k[0], 'gbx-num');
      hit(c, k[0], function () { cur = i; mark(); });
      x += w;
    });
    T(g, x0, 108, 'Start of the play', 'gbx-small', 'start'); T(g, x1, 108, 'End', 'gbx-small', 'end');
    mark();
  }
  function mark() {
    rects.forEach(function (r, i) { r.classList.toggle('gbx-on', i === cur); });
    var p = PLAYS[play][1][cur], k = KIND[p[0]];
    ro.set('<b>' + k[0] + '.</b> ' + k[1] + ' <b>In ' + PLAYS[play][0].replace(/ \(.*/, '') + ':</b> ' + p[2]);
  }
  draw();
});
