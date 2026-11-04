/* gbgreeks.homer-iliad: visual gb-iliad-books (gbe1, our own design). The 24 books as a strip, colored by phase,
   with a line for Achilles' anger (our own reading of the poem, not a measurement). Tap a book or use the arrows.
   opts: book (1-24, the book selected at the start). Shared .gbx-* styles live in this rung's viz.css. */
var NS = 'http://www.w3.org/2000/svg', D = document;
function S(tag, at, par) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function T(par, x, y, s, cls, anchor) { var t = S('text', { x: x, y: y, 'class': cls || '', 'text-anchor': anchor || 'middle' }, par); t.textContent = s; return t; }
function hit(g, label, fn) {
  g.setAttribute('class', (g.getAttribute('class') || '') + ' gbx-hit'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', label);
  g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
}
var PH = [['q', 'The quarrel', 1, 1], ['b', 'First battles', 2, 7], ['t', 'The Trojans advance', 8, 15], ['p', 'Patroclus', 16, 17], ['a', 'Achilles returns', 18, 22], ['e', 'Endings', 23, 24]];
var BK = [
  ['The quarrel', 'Apollo sends a plague on the Greek camp. Agamemnon gives back his captive to end it, then takes Briseis from Achilles. Achilles withdraws, and his mother Thetis asks Zeus to let the Trojans win for a while.', 9],
  ['The armies gather', 'Zeus sends Agamemnon a misleading dream. The Greeks muster, and the poet lists their ships and leaders: the Catalogue of Ships.', 7],
  ['A duel for Helen', 'Paris and Menelaus fight a duel to settle the war. Aphrodite carries Paris away to safety. On the wall, Helen names the Greek heroes for King Priam.', 6],
  ['The truce is broken', 'A Trojan archer, urged by Athena, shoots at Menelaus, and the battle begins.', 6],
  ["Diomedes' great day", 'The Greek hero Diomedes fights so fiercely that he even wounds two gods.', 6],
  ['Hector and Andromache', 'Hector goes into Troy. He meets his wife Andromache and baby son Astyanax on the wall, and prays that his son will be greater than he is.', 6],
  ['Hector and Ajax', 'Hector and the Greek giant Ajax fight a duel until night. Both sides bury their dead, and the Greeks build a wall around their ships.', 6],
  ['The Trojans push forward', 'Zeus forbids the gods to help either side. The Trojans drive the Greeks back and camp on the plain, their fires burning all night.', 7],
  ['The embassy', 'Odysseus, Ajax and old Phoenix beg Achilles to return, offering rich gifts. He refuses them all.', 9],
  ['A night raid', 'Odysseus and Diomedes slip out to spy on the Trojan camp.', 7],
  ['Agamemnon wounded', 'Agamemnon fights well and is wounded. Achilles sends his friend Patroclus to find out who else has been hurt.', 7],
  ['The wall is stormed', 'Hector breaks through the Greek wall.', 6],
  ['Poseidon helps', 'The sea god Poseidon helps the Greeks hold their ships.', 6],
  ['Hera and Zeus', 'Hera lulls Zeus to sleep so that the Greeks can rally.', 6],
  ['Fire at the ships', 'Zeus wakes, Hector reaches the ships, and the Greeks are close to defeat.', 6],
  ['Patroclus', 'Patroclus goes out in Achilles\' armor, drives the Trojans back, and is killed by Hector.', 7],
  ['The fight for the body', 'Greeks and Trojans struggle over Patroclus\' body; the Greeks carry it back.', 8],
  ['The shield', 'Achilles grieves for his friend. The god Hephaestus makes him new armor and a great shield showing a whole world, at war and at peace.', 10],
  ['Reconciled', 'Achilles and Agamemnon make peace. Achilles arms for battle.', 10],
  ['Achilles returns', 'Achilles goes back into battle, and the gods join the fighting.', 10],
  ['The river', 'Achilles fights so wildly that the river god Scamander rises against him.', 10],
  ['Hector', 'Hector stands alone outside the walls of Troy. Achilles kills him, while Priam and Hecuba watch from the city.', 10],
  ['The funeral games', 'The Greeks hold a funeral for Patroclus and games in his honor: chariot races, boxing, running.', 8],
  ['Priam and Achilles', 'Old Priam, guided by Hermes, goes to Achilles at night to ransom Hector\'s body. Achilles thinks of his own father and gives it back. The poem ends with Hector\'s funeral.', 2]
];
function phase(b) { for (var i = 0; i < PH.length; i++) if (b >= PH[i][2] && b <= PH[i][3]) return PH[i]; return PH[0]; }
ML.viz.register('gb-iliad-books', function (el, opts, V) {
  var cur = Math.max(1, Math.min(24, +opts.book || 1));
  var box = D.createElement('div'); box.className = 'gbx gbx-scroll'; box.style.setProperty('--gbx-minw', '620px'); el.appendChild(box);
  var W = 720, H = 210, x0 = 18, cw = 28.5, top = 110, ch = 52;
  var svg = S('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'gbx-svg', role: 'group', 'aria-label': 'The 24 books of the Iliad' }, box);
  S('rect', { x: 0, y: 0, width: W, height: H, 'class': 'gbx-bg', rx: 10 }, svg);
  T(svg, x0, 22, "Achilles' anger (our reading)", 'gbx-cap', 'start');
  var yA = function (v) { return 98 - v * 6.6; };
  var pts = BK.map(function (b, i) { return (x0 + i * cw + cw / 2).toFixed(1) + ',' + yA(b[2]).toFixed(1); }).join(' ');
  S('polyline', { points: pts, 'class': 'gbx-line' }, svg);
  var dot = S('circle', { r: 5, 'class': 'gbx-dot' }, svg);
  var cells = [];
  BK.forEach(function (b, i) {
    var n = i + 1, g = S('g', {}, svg), ph = phase(n);
    var r = S('rect', { x: x0 + i * cw + 1, y: top, width: cw - 2, height: ch, rx: 4, 'class': 'gbx-cell gbx-ph-' + ph[0] }, g);
    T(g, x0 + i * cw + cw / 2, top + ch / 2 + 5, String(n), 'gbx-num');
    hit(g, 'Book ' + n + ': ' + b[0], function () { set(n); });
    cells.push(r);
  });
  PH.forEach(function (p) {
    var xa = x0 + (p[2] - 1) * cw, xb = x0 + p[3] * cw;
    S('line', { x1: xa + 2, x2: xb - 2, y1: top + ch + 10, y2: top + ch + 10, 'class': 'gbx-ph-line gbx-phs-' + p[0] }, svg);
    if (p[3] - p[2] >= 1) T(svg, (xa + xb) / 2, top + ch + 26, p[1], 'gbx-small');
  });
  var ctl = D.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  V.button(ctl, '◀ Book before', function () { set(Math.max(1, cur - 1)); });
  V.button(ctl, 'Next book ▶', function () { set(Math.min(24, cur + 1)); });
  var ro = V.readout(el);
  function set(n) {
    cur = n; var b = BK[n - 1];
    cells.forEach(function (r, i) { r.classList.toggle('gbx-on', i === n - 1); });
    dot.setAttribute('cx', (x0 + (n - 1) * cw + cw / 2).toFixed(1)); dot.setAttribute('cy', yA(b[2]).toFixed(1));
    ro.set('<b>Book ' + n + ': ' + b[0] + '.</b> ' + b[1] + ' <span class="gbx-mut">(' + phase(n)[1] + ')</span>');
  }
  set(cur);
});
