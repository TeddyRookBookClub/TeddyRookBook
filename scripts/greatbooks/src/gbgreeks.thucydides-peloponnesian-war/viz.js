/* gbgreeks.thucydides-peloponnesian-war: visual gb-athens-sparta (gbe1, our own design), drawn with ML.gbMap from the
   Odyssey rung's viz.js (Natural Earth outlines). The two alliances in 431 BC and the main turns of the war.
   opts: step (index at the start). Alliance colors are simplified: some cities changed sides during the war. */
var D = document;
/* [name, lon, lat, side a|s|n, note] */
var C = {
  athens: ['Athens', 23.73, 37.98, 'a', 'A democracy with the strongest navy in Greece, at the head of the Delian League, which had become its empire.'],
  sparta: ['Sparta', 22.43, 37.07, 's', 'A city of trained soldiers, leader of the Peloponnesian League.'],
  corinth: ['Corinth', 22.88, 37.94, 's', 'A rich trading city, Sparta\'s ally, and a rival of Athens at sea; its quarrels with Athens over Corcyra and Potidaea helped start the war.'],
  thebes: ['Thebes', 23.32, 38.32, 's', 'The leading city of Boeotia, an ally of Sparta and an old enemy of Athens.'],
  megara: ['Megara', 23.35, 38.0, 's', 'A neighbor of Athens, cut off from Athenian markets by a decree before the war.'],
  argos: ['Argos', 22.73, 37.63, 'n', 'Sparta\'s old rival in the Peloponnese; neutral at first, it allied with Athens after the Peace of Nicias.'],
  plataea: ['Plataea', 23.27, 38.22, 'a', 'Athens\' small ally on the border of Boeotia; the war began with a Theban night attack on it in 431 BC.'],
  naupactus: ['Naupactus', 21.83, 38.39, 'a', 'An Athenian naval base at the mouth of the Gulf of Corinth.'],
  corcyra: ['Corcyra', 19.92, 39.62, 'a', 'A great naval island (modern Corfu) allied with Athens; its quarrel with Corinth helped start the war, and in 427 BC it fell into civil strife.'],
  potidaea: ['Potidaea', 23.33, 40.19, 'a', 'A member of Athens\' league that revolted in 432 BC, with help from Corinth.'],
  amphipolis: ['Amphipolis', 23.84, 40.82, 'a', 'An Athenian colony in Thrace, taken by the Spartan general Brasidas in 424 BC. Thucydides arrived too late to save it and was exiled.'],
  mytilene: ['Mytilene', 26.55, 39.1, 'a', 'The chief city of Lesbos, which revolted from Athens in 427 BC.'],
  samos: ['Samos', 26.85, 37.72, 'a', 'An island ally, later the base of the Athenian fleet.'],
  melos: ['Melos', 24.43, 36.73, 'n', 'A small island, settled long before from Sparta, which tried to stay neutral.'],
  pylos: ['Pylos', 21.69, 36.92, 'a', 'Where in 425 BC the Athenians built a fort and captured Spartan soldiers on the island of Sphacteria.'],
  syracuse: ['Syracuse', 15.29, 37.08, 's', 'The greatest Greek city of Sicily, a Dorian city friendly to Sparta.'],
  decelea: ['Decelea', 23.82, 38.17, 's', 'A place in Attica that the Spartans fortified in 413 BC, on the advice of the Athenian exile Alcibiades.'],
  aegospotami: ['Aegospotami', 26.6, 40.3, 's', 'Where in 405 BC the Spartan admiral Lysander destroyed the Athenian fleet.']
};
var STEPS = [
  ['431 BC: two alliances', [], [], 'Athens and its league of islands and coastal cities (blue) against Sparta and its allies on land (red). Thucydides says the truest cause was the growth of Athenian power and the fear it caused in Sparta.', 'I'],
  ['431 BC: Attica invaded', [['sparta', 'corinth', 'megara', 'athens']], ['sparta', 'athens', 'plataea'], 'The Spartan king Archidamus invades Attica and burns the farms. On Pericles\' advice, the Athenians move inside the city walls and use their fleet to raid the coasts.', 'II'],
  ['430 BC: the plague', [], ['athens'], 'A plague breaks out in crowded Athens and kills a large part of the population. Thucydides catches it and recovers. Pericles dies the next year.', 'II'],
  ['427 BC: Mytilene and Corcyra', [], ['mytilene', 'corcyra', 'athens'], 'Mytilene\'s revolt is crushed. The Athenian assembly votes for a harsh punishment, then reverses it the next day after a debate between Cleon and Diodotus. Corcyra falls into civil strife.', 'III'],
  ['425 BC: Pylos', [['athens', 'pylos']], ['pylos', 'sparta'], 'An Athenian force fortifies Pylos and captures Spartan soldiers on Sphacteria, to the amazement of Greece.', 'IV'],
  ['424 BC: Amphipolis', [], ['amphipolis'], 'The Spartan Brasidas marches north and takes Amphipolis. Thucydides, the Athenian general nearby, comes too late and is exiled for twenty years.', 'IV'],
  ['421 BC: the Peace of Nicias', [], ['athens', 'sparta', 'argos'], 'Athens and Sparta make a peace meant to last fifty years. It is never fully kept.', 'V'],
  ['416 BC: Melos', [['athens', 'melos']], ['melos', 'athens'], 'Athens demands that neutral Melos join its empire: the Melian Dialogue. Melos refuses and is destroyed.', 'V'],
  ['415–413 BC: the Sicilian Expedition', [['athens', 'corcyra', 'syracuse']], ['athens', 'corcyra', 'syracuse'], 'A huge Athenian fleet sails to conquer Sicily. Alcibiades, one of its generals, is recalled and flees to Sparta. In 413 BC the whole force is destroyed at Syracuse.', 'VI–VII'],
  ['413 BC: Decelea', [], ['decelea', 'athens'], 'Sparta builds a fort in Attica itself, and thousands of Athenian slaves escape to it. Persia begins to fund Sparta\'s fleet.', 'VII–VIII'],
  ['405–404 BC: the end', [['sparta', 'aegospotami']], ['aegospotami', 'athens'], 'Thucydides\' history breaks off in 411 BC. Xenophon tells the end: Lysander destroys the last Athenian fleet at Aegospotami, and Athens, starved by blockade, surrenders in 404 BC.', '(Xenophon)']
];
ML.viz.register('gb-athens-sparta', function (el, opts, V) {
  if (!ML.gbMap || !ML.gbLand) { el.insertAdjacentHTML('beforeend', '<p class="ml-viz-err">This map could not be drawn.</p>'); return; }
  var box = D.createElement('div'); box.className = 'gbx'; el.appendChild(box);
  var M = ML.gbMap(box, { lon: [13.6, 28.4], lat: [35.6, 41.6], W: 560, label: 'Map of the Peloponnesian War',
    seas: [['Aegean', 25.2, 38.7], ['Ionian Sea', 18.6, 37.4], ['SICILY', 14.2, 37.75]] });
  var S = M.S, T = M.T, hit = M.hit;
  var cur = Math.max(0, Math.min(STEPS.length - 1, +opts.step || 0)), dots = {}, labs = {};
  var rg = M.layer('routes');
  Object.keys(C).forEach(function (k) {
    var c = C[k], q = M.P(c[1], c[2]), g = S('g', {}, M.layer('marks'));
    dots[k] = S('circle', { cx: q[0], cy: q[1], r: k === 'athens' || k === 'sparta' ? 8 : 5.5, 'class': 'gbx-pt-' + c[3] }, g);
    hit(g, c[0], function () { info(k); });
    labs[k] = T(M.layer('labels'), q[0] + 9, q[1] - 7, c[0], 'gbx-lab', 'start');
  });
  [['megara', 'end', -8], ['corinth', 'end', -8], ['plataea', 'end', -8], ['thebes', 'start', 8], ['naupactus', 'end', -8], ['pylos', 'end', -8], ['argos', 'end', -8], ['sparta', 'end', -10]].forEach(function (a) { labs[a[0]].setAttribute('text-anchor', a[1]); labs[a[0]].setAttribute('x', +M.P(C[a[0]][1], C[a[0]][2])[0] + a[2]); });
  var ring = S('g', {}, M.layer('marks'));
  var key = D.createElement('ul'); key.className = 'gbx-key';
  key.innerHTML = '<li><i style="background:var(--gbx-a)"></i>Athens and its allies</li><li><i style="background:var(--gbx-s)"></i>Sparta and its allies</li><li><i style="background:var(--gbx-n)"></i>Neutral at first</li>';
  el.appendChild(key);
  var ctl = D.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  V.button(ctl, '◀ Back', function () { set(Math.max(0, cur - 1)); });
  V.button(ctl, 'Next ▶', function () { set(Math.min(STEPS.length - 1, cur + 1)); });
  var ro = V.readout(el);
  var MAIN = ['athens', 'sparta', 'corinth', 'thebes', 'corcyra', 'syracuse', 'melos', 'argos', 'amphipolis', 'mytilene'];
  function show(ks, hl) {
    while (ring.firstChild) ring.removeChild(ring.firstChild);
    Object.keys(C).forEach(function (k) { labs[k].style.display = ks.indexOf(k) >= 0 ? '' : 'none'; });
    hl.forEach(function (k) { var q = M.P(C[k][1], C[k][2]); S('circle', { cx: q[0], cy: q[1], r: 12, 'class': 'gbx-ring' }, ring); });
  }
  function set(i) {
    cur = i; var s = STEPS[i];
    while (rg.firstChild) rg.removeChild(rg.firstChild);
    s[1].forEach(function (r) { var side = C[r[0]][3]; S('polyline', { points: r.map(function (k) { var q = M.P(C[k][1], C[k][2]); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '), 'class': side === 's' ? 'gbx-route-s' : 'gbx-route-a' }, rg); });
    show(s[2].length ? s[2] : MAIN, s[2]);
    ro.set('<b>' + s[0] + '</b> <span class="gbx-mut">(' + (/^\(/.test(s[4]) ? s[4].slice(1, -1) : 'Book ' + s[4]) + ')</span>. ' + s[3]);
  }
  function info(k) { var c = C[k]; show([k], [k]); ro.set('<b>' + c[0] + '.</b> ' + c[4]); }
  set(cur);
});
