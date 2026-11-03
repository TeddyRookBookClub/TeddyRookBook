/* gbgreeks.aristotle-biology: visuals gb-animal-tree (gbsA, our own designs; theme colors from MathLadder.viz.colors()). */
var RM = typeof ML.viz.reduced === 'function' ? ML.viz.reduced() : !!ML.viz.reduced;
function gbBox(el, cls) {
  var stage = document.createElement('div'); stage.className = 'gb-stage ' + (cls || ''); el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { stage: stage, ctl: ctl };
}

/* Where Aristotle placed an animal, and what biologists say now. */
ML.viz.register('gb-animal-tree', function (el, opts, V) {
  var stage = document.createElement('div'); stage.className = 'gb-stage gb-tree'; el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl); var ro = V.readout(el);
  var NODES = { root: ['Animals', null], blood: ['Red blood', 'root'], bloodless: ['No red blood', 'root'],
    live: ['Live young', 'blood'], eggs: ['Eggs', 'blood'],
    soft: ['Softies', 'bloodless'], crust: ['Soft-shelled', 'bloodless'], shell: ['Shell-skinned', 'bloodless'], insect: ['Insects', 'bloodless'] };
  var FULL = { root: 'Animals', blood: 'With red blood', bloodless: 'Without red blood', live: 'Bearing live young', eggs: 'Laying eggs', soft: 'The softies (squid, octopus)', crust: 'The soft-shelled (crabs, lobsters)', shell: 'The shell-skinned (snails, oysters)', insect: 'The insects' };
  var ANIMALS = [
    ['Horse', 'live', 'Live-bearing, hair-coated, on land.', 'A mammal. Aristotle and modern biology agree.'],
    ['Dolphin', 'live', 'Breathes air through a blow-hole, has lungs, bears live young and suckles them (History of Animals VI.12).', 'A mammal, not a fish. Aristotle saw this; many later writers called whales fish.'],
    ['Shark', 'live', 'Most sharks keep the eggs inside and give birth to live young; Aristotle put them with live-bearing animals that have gills.', 'A fish. Many sharks do bear live young, as he reported.'],
    ['Eagle', 'eggs', 'Blooded, two-footed, lays eggs.', 'A bird.'],
    ['Tortoise', 'eggs', 'Blooded, four-footed, lays eggs.', 'A reptile.'],
    ['Tuna', 'eggs', 'Blooded, with gills, lays eggs.', 'A fish.'],
    ['Octopus', 'soft', 'No red blood; soft body with the hard parts inside. He described its arms and mating closely.', 'A mollusk (cephalopod). Some of his octopus reports were doubted for centuries and confirmed in the 1800s.'],
    ['Crab', 'crust', 'No red blood; soft inside a shell that cracks rather than shatters.', 'A crustacean (arthropod).'],
    ['Snail', 'shell', 'No red blood; soft body in a hard shell that shatters.', 'A mollusk. Modern biology joins snails with the octopus; Aristotle kept them apart.'],
    ['Bee', 'insect', 'No red blood; body "cut into" segments.', 'An insect (arthropod).']
  ];
  var svgNS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('viewBox', '0 0 480 250'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Aristotle\'s grouping of animals'); stage.appendChild(svg);
  var POS = { root: [240, 22], blood: [110, 86], bloodless: [350, 86], live: [55, 160], eggs: [165, 160], soft: [262, 160], crust: [318, 224], shell: [408, 160], insect: [432, 224] };
  var boxes = {};
  Object.keys(NODES).forEach(function (id) {
    var par = NODES[id][1]; if (!par) return; var l = document.createElementNS(svgNS, 'line');
    l.setAttribute('x1', POS[par][0]); l.setAttribute('y1', POS[par][1] + 15); l.setAttribute('x2', POS[id][0]); l.setAttribute('y2', POS[id][1] - 15); l.setAttribute('class', 'gb-tree-ln'); l.dataset.to = id; svg.appendChild(l);
  });
  Object.keys(NODES).forEach(function (id) {
    var g = document.createElementNS(svgNS, 'g'), t = document.createElementNS(svgNS, 'text'), r = document.createElementNS(svgNS, 'rect');
    var label = NODES[id][0], w = Math.max(56, label.length * 9.2 + 14);
    r.setAttribute('x', POS[id][0] - w / 2); r.setAttribute('y', POS[id][1] - 15); r.setAttribute('width', w); r.setAttribute('height', 30); r.setAttribute('rx', 7);
    t.setAttribute('x', POS[id][0]); t.setAttribute('y', POS[id][1] + 5.5); t.setAttribute('text-anchor', 'middle'); t.textContent = label;
    g.setAttribute('class', 'gb-tree-nd'); g.appendChild(r); g.appendChild(t); svg.appendChild(g); boxes[id] = g;
  });
  function path(id) { var o = []; while (id) { o.push(id); id = NODES[id][1]; } return o; }
  var btns = [];
  function pick(i) {
    var a = ANIMALS[i], on = path(a[1]);
    Object.keys(boxes).forEach(function (id) { boxes[id].classList.toggle('on', on.indexOf(id) >= 0); });
    svg.querySelectorAll('line').forEach(function (l) { l.classList.toggle('on', on.indexOf(l.dataset.to) >= 0); });
    btns.forEach(function (b, j) { b.setAttribute('aria-pressed', String(j === i)); });
    ro.set('<b>' + a[0] + '</b>: ' + FULL[a[1]] + '. ' + a[2] + ' <br><b>Today:</b> ' + a[3]);
  }
  var wrap = document.createElement('div'); wrap.className = 'ml-seg gb-animals'; wrap.setAttribute('role', 'group'); wrap.setAttribute('aria-label', 'Animal'); ctl.appendChild(wrap);
  ANIMALS.forEach(function (a, i) { var b = document.createElement('button'); b.type = 'button'; b.textContent = a[0]; b.addEventListener('click', function () { pick(i); }); wrap.appendChild(b); btns.push(b); });
  pick(opts.start || 1);
});
