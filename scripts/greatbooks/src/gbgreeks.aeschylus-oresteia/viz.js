/* gbgreeks.aeschylus-oresteia: visual gb-atreus (gbe1, our own design). The family of Atreus as a tree; tap a name for
   who they are; choose a play to light up the family members in it. opts: play ('all' | 'ag' | 'lb' | 'eu'). */
var NS = 'http://www.w3.org/2000/svg', D = document;
function S(tag, at, par) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function T(par, x, y, s, cls, anchor) { var t = S('text', { x: x, y: y, 'class': cls || '', 'text-anchor': anchor || 'middle' }, par); t.textContent = s; return t; }
function hit(g, label, fn) {
  g.setAttribute('class', (g.getAttribute('class') || '') + ' gbx-hit'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', label);
  g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
}
/* [key, name, x, y, plays, text] */
var P = [
  ['tantalus', 'Tantalus', 360, 34, '', 'A king who offended the gods. In the myth he is punished in the underworld with water and fruit always just out of reach, which is where the word <em>tantalize</em> comes from.'],
  ['pelops', 'Pelops', 360, 92, '', 'Son of Tantalus. He won his bride in a chariot race, by trickery in some versions. The Peloponnese, "the island of Pelops", is named after him.'],
  ['tyndareus', 'Tyndareus & Leda', 92, 150, '', 'King and queen of Sparta, parents of Clytemnestra. Helen is also their daughter, though in the myth her father is Zeus.'],
  ['atreus', 'Atreus', 270, 150, '', 'He and his brother Thyestes quarreled over the throne. Atreus did a terrible wrong to Thyestes\' children, and Thyestes cursed his house. That old crime hangs over the whole trilogy.'],
  ['thyestes', 'Thyestes', 520, 150, '', 'Brother and rival of Atreus. His surviving son, Aegisthus, grows up wanting revenge on Atreus\' line.'],
  ['clytemnestra', 'Clytemnestra', 92, 214, 'ag lb eu', 'Agamemnon\'s queen, who rules Argos while he is at Troy. She kills him on his return to avenge their daughter Iphigenia, is killed by her son Orestes, and as a ghost rouses the Furies in The Eumenides.'],
  ['agamemnon', 'Agamemnon', 230, 214, 'ag', 'King of Argos and leader of the Greeks at Troy. To get winds for his fleet he sacrificed his daughter Iphigenia. He comes home in the first play and is killed.'],
  ['menelaus', 'Menelaus', 360, 214, '', 'King of Sparta, Agamemnon\'s brother. He is lost at sea on the way home from Troy and does not appear in the trilogy.'],
  ['helen', 'Helen', 470, 214, '', 'Wife of Menelaus, Clytemnestra\'s sister. Her going to Troy with Paris began the war. The chorus of Agamemnon blames her bitterly.'],
  ['aegisthus', 'Aegisthus', 600, 214, 'ag lb', 'Son of Thyestes and cousin of Agamemnon. He is Clytemnestra\'s ally in Agamemnon and is killed by Orestes in The Libation Bearers.'],
  ['iphigenia', 'Iphigenia', 54, 280, '', 'The daughter sacrificed at Aulis. She never appears, but her death is the reason Clytemnestra gives. (In Euripides\' versions, the goddess Artemis saves her.)'],
  ['electra', 'Electra', 150, 280, 'lb', 'She mourns her father and waits for her brother. In The Libation Bearers she knows Orestes by a lock of his hair left on the tomb.'],
  ['orestes', 'Orestes', 250, 280, 'lb eu', 'Commanded by Apollo, he avenges his father by killing his mother and Aegisthus. Hunted by the Furies, he is tried in Athens and acquitted.'],
  ['hermione', 'Hermione', 415, 280, '', 'Daughter of Menelaus and Helen. She appears in later plays by Euripides.']
];
var E = [['tantalus', 'pelops'], ['pelops', 'atreus'], ['pelops', 'thyestes'], ['atreus', 'agamemnon'], ['atreus', 'menelaus'], ['thyestes', 'aegisthus'],
  ['tyndareus', 'clytemnestra'], ['tyndareus', 'helen'], ['m:agamemnon', 'iphigenia'], ['m:agamemnon', 'electra'], ['m:agamemnon', 'orestes'], ['m:menelaus', 'hermione']];
var PLAYS = { all: ['All', 'The family of Atreus. Tap a name.'], ag: ['Agamemnon', 'Play 1, <em>Agamemnon</em>: also on stage are a watchman, a herald, the Trojan princess Cassandra and a chorus of old men of Argos.'],
  lb: ['Libation Bearers', 'Play 2, <em>The Libation Bearers</em>: also on stage are Orestes\' friend Pylades, his old nurse, and a chorus of women bringing offerings to Agamemnon\'s tomb.'],
  eu: ['Eumenides', 'Play 3, <em>The Eumenides</em>: also on stage are Apollo, Athena, the jurors of Athens and the chorus of Furies.'] };
ML.viz.register('gb-atreus', function (el, opts, V) {
  var box = D.createElement('div'); box.className = 'gbx gbx-scroll'; box.style.setProperty('--gbx-minw', '600px'); el.appendChild(box);
  var svg = S('svg', { viewBox: '0 0 680 312', 'class': 'gbx-svg', role: 'group', 'aria-label': 'Family tree of the house of Atreus' }, box);
  S('rect', { x: 0, y: 0, width: 680, height: 312, rx: 10, 'class': 'gbx-bg' }, svg);
  var by = {}; P.forEach(function (p) { by[p[0]] = p; });
  var eg = S('g', {}, svg), ng = S('g', {}, svg);
  function mid(a, b) { return [(by[a][2] + by[b][2]) / 2, by[a][3]]; }
  // marriages
  [['clytemnestra', 'agamemnon'], ['menelaus', 'helen']].forEach(function (m) { S('line', { x1: by[m[0]][2], y1: by[m[0]][3], x2: by[m[1]][2], y2: by[m[1]][3], 'class': 'gbx-edge', 'stroke-dasharray': '4 3' }, eg); });
  E.forEach(function (e) {
    var a = e[0], b = by[e[1]], p;
    if (a.indexOf('m:') === 0) { a = a.slice(2); p = a === 'agamemnon' ? mid('clytemnestra', 'agamemnon') : mid('menelaus', 'helen'); }
    else p = [by[a][2], by[a][3] + 14];
    var ym = (p[1] + b[3] - 14) / 2 + (a === 'tyndareus' ? -8 : a === 'atreus' ? 6 : 0);
    S('path', { d: 'M' + p[0] + ' ' + p[1] + ' V' + ym + ' H' + b[2] + ' V' + (b[3] - 14), 'class': 'gbx-edge' }, eg);
  });
  var rects = {};
  P.forEach(function (p) {
    var g = S('g', {}, ng), w = Math.max(76, p[1].length * 7.6 + 18);
    rects[p[0]] = S('rect', { x: p[2] - w / 2, y: p[3] - 14, width: w, height: 28, rx: 8, 'class': 'gbx-node' }, g);
    T(g, p[2], p[3] + 5, p[1], 'gbx-num');
    hit(g, p[1], function () { pick(p[0]); });
  });
  var ctl = D.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  var play = PLAYS[opts.play] ? opts.play : 'all', sel = null;
  V.seg(ctl, { label: 'Play', items: Object.keys(PLAYS).map(function (k) { return [k, PLAYS[k][0]]; }), value: play, change: function (v) { play = v; sel = null; draw(); } });
  var ro = V.readout(el);
  function pick(k) { sel = k; draw(); }
  function draw() {
    P.forEach(function (p) {
      var r = rects[p[0]];
      r.classList.toggle('gbx-in', play !== 'all' && p[4].indexOf(play) >= 0);
      r.classList.toggle('gbx-on', sel === p[0]);
    });
    if (sel) { var p = by[sel], inn = p[4] ? p[4].split(' ').map(function (k) { return PLAYS[k][0]; }) : []; ro.set('<b>' + p[1] + '.</b> ' + p[5] + (inn.length ? ' <span class="gbx-mut">In: ' + inn.join(', ') + '.</span>' : ' <span class="gbx-mut">Not a speaking part in the trilogy.</span>')); }
    else ro.set(PLAYS[play][1] + (play !== 'all' ? ' Family members in the play are highlighted.' : ''));
  }
  draw();
});
