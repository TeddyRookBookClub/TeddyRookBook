/* gbgreeks.herodotus-histories: visual gb-persian-wars (gbe1, our own design), drawn with ML.gbMap from the Odyssey
   rung's viz.js (Natural Earth outlines). Step through the wars from the Ionian Revolt to Plataea, or tap a place.
   opts: step (index at the start). Routes are simplified. */
var D = document;
var PL = {
  sardis: ['Sardis', 28.04, 38.49, 'p', 'Capital of Lydia, then the western headquarters of the Persian kings.'],
  miletus: ['Miletus', 27.28, 37.53, 'p', 'The great Ionian Greek city that led the revolt against Persia in 499 BC.'],
  halicarnassus: ['Halicarnassus', 27.42, 37.04, 'p', 'Herodotus\' home city (modern Bodrum).'],
  samos: ['Samos', 26.85, 37.72, 'p', 'An island city; Herodotus lived there for a time.'],
  abydos: ['Abydos', 26.4, 40.2, 'p', 'Where Xerxes\' army crossed the Hellespont into Europe on two bridges of boats.'],
  athos: ['Mount Athos', 24.33, 40.16, 'p', 'Xerxes had a canal dug across the neck of this peninsula so his fleet could avoid the dangerous cape.'],
  thermopylae: ['Thermopylae', 22.54, 38.8, 'g', 'The narrow pass where Leonidas and the Greeks held the Persian army for three days in 480 BC.'],
  artemisium: ['Artemisium', 23.25, 39.0, 'g', 'Where the Greek fleet fought the Persian fleet at the same time as Thermopylae.'],
  athens: ['Athens', 23.73, 37.98, 'g', 'Sent ships to help the Ionian revolt; won at Marathon; was abandoned and burned by Xerxes in 480 BC.'],
  salamis: ['Salamis', 23.47, 37.94, 'g', 'The island off Athens where the Greek fleet, led in strategy by Themistocles, won the great sea battle of 480 BC.'],
  marathon: ['Marathon', 23.97, 38.15, 'g', 'The plain where the Athenians and Plataeans defeated Darius\' army in 490 BC.'],
  eretria: ['Eretria', 23.79, 38.39, 'g', 'A city on Euboea that had helped the Ionians; the Persians captured it in 490 BC.'],
  naxos: ['Naxos', 25.38, 37.1, 'g', 'An island the Persian fleet attacked on its way across the Aegean in 490 BC.'],
  sparta: ['Sparta', 22.43, 37.07, 'g', 'The leading land power of Greece. Its army arrived just after Marathon, and led the Greeks at Thermopylae and Plataea.'],
  plataea: ['Plataea', 23.27, 38.22, 'g', 'A small city allied to Athens; near it, in 479 BC, the Greeks defeated the Persian land army.'],
  mycale: ['Mycale', 27.2, 37.65, 'p', 'A cape in Ionia where, by tradition on the same day as Plataea, the Greeks destroyed the Persian camp and beached fleet.'],
  delphi: ['Delphi', 22.5, 38.48, 'g', 'The oracle of Apollo, which both sides consulted. It told the Athenians to trust their "wooden wall", which Themistocles read as their ships.']
};
var STEPS = [
  ['The two worlds', '', [], [], 'The Persian Empire stretched from here east to India; its kings ruled from Susa and Persepolis, far off this map. The Greeks lived in hundreds of independent cities around the Aegean. Herodotus was born in Halicarnassus, a Greek city under Persian rule.', 'I'],
  ['499 BC: the Ionian Revolt', 'p', [['miletus', 'sardis']], ['miletus', 'sardis', 'athens', 'eretria'], 'The Ionian Greek cities rebel. Athens and Eretria send ships to help, and the rebels burn the lower city of Sardis. Herodotus calls those ships the beginning of the troubles between Greeks and barbarians.', 'V'],
  ['494 BC: Miletus falls', 'p', [], ['miletus'], 'The Persians win a sea battle off Miletus and destroy the city. King Darius resolves to punish Athens and Eretria.', 'VI'],
  ['490 BC: across the Aegean', 'p', [['samos', 'naxos', 'eretria', 'marathon']], ['samos', 'naxos', 'eretria', 'marathon'], 'Darius sends a fleet straight across the Aegean. It attacks Naxos, captures Eretria, and lands at Marathon, about 25 miles from Athens.', 'VI'],
  ['490 BC: Marathon', 'g', [['athens', 'marathon']], ['marathon', 'athens', 'sparta'], 'The Athenians and Plataeans charge and win. The Spartans, held up by a religious festival, arrive after the battle. (The famous run to Athens is a later legend; Herodotus tells of a runner sent to Sparta to ask for help.)', 'VI'],
  ['480 BC: Xerxes crosses into Europe', 'p', [['sardis', 'abydos', 'athos', 'thermopylae']], ['sardis', 'abydos', 'athos'], 'Darius\' son Xerxes leads a vast army from Sardis, crosses the Hellespont on bridges of boats, and marches around the coast, while his fleet uses the canal cut through the Athos peninsula.', 'VII'],
  ['480 BC: Thermopylae and Artemisium', 'g', [], ['thermopylae', 'artemisium', 'delphi'], 'Leonidas holds the pass for three days while the fleets fight off Artemisium. Betrayed by a mountain path, Leonidas sends most of the allies away and dies fighting with his Spartans and the Thespians.', 'VII–VIII'],
  ['480 BC: Salamis', 'g', [['thermopylae', 'athens', 'salamis']], ['athens', 'salamis'], 'The Persians burn the abandoned city of Athens. In the narrow strait of Salamis, the Greek fleet defeats the Persian navy. Xerxes returns to Asia, leaving an army behind under Mardonius.', 'VIII'],
  ['479 BC: Plataea and Mycale', 'g', [], ['plataea', 'mycale', 'sparta'], 'The Greeks, led by the Spartan Pausanias, defeat Mardonius\' army at Plataea. At Mycale in Ionia, the Greeks destroy the rest of the Persian fleet. Herodotus\' main story ends soon after.', 'IX']
];
ML.viz.register('gb-persian-wars', function (el, opts, V) {
  if (!ML.gbMap || !ML.gbLand) { el.insertAdjacentHTML('beforeend', '<p class="ml-viz-err">This map could not be drawn.</p>'); return; }
  var box = D.createElement('div'); box.className = 'gbx'; el.appendChild(box);
  var M = ML.gbMap(box, { lon: [20.6, 29.6], lat: [35.9, 41.4], W: 560, label: 'Map of the Persian Wars',
    seas: [['Aegean Sea', 25.0, 38.9], ['ASIA MINOR', 28.6, 39.6], ['GREECE', 21.9, 39.7]] });
  var S = M.S, T = M.T, hit = M.hit;
  var cur = Math.max(0, Math.min(STEPS.length - 1, +opts.step || 0)), dots = {}, labs = {};
  var rg = M.layer('routes');
  Object.keys(PL).forEach(function (k) {
    var p = PL[k], q = M.P(p[1], p[2]), g = S('g', {}, M.layer('marks'));
    dots[k] = S('circle', { cx: q[0], cy: q[1], r: 6, 'class': p[3] === 'p' ? 'gbx-pt-p' : 'gbx-pt-a' }, g);
    hit(g, p[0], function () { info(k); });
    labs[k] = T(M.layer('labels'), q[0] + 9, q[1] - 7, p[0], 'gbx-lab', 'start');
  });
  [['abydos', 'end', -9], ['salamis', 'end', -9], ['plataea', 'end', -9], ['delphi', 'end', -9], ['eretria', 'start', 9], ['thermopylae', 'end', -9]].forEach(function (a) { labs[a[0]].setAttribute('text-anchor', a[1]); labs[a[0]].setAttribute('x', +M.P(PL[a[0]][1], PL[a[0]][2])[0] + a[2]); });
  var key = D.createElement('ul'); key.className = 'gbx-key';
  key.innerHTML = '<li><i style="background:var(--gbx-p)"></i>Persian Empire and its subjects</li><li><i style="background:var(--gbx-a)"></i>Free Greek cities</li>';
  el.appendChild(key);
  var ctl = D.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  V.button(ctl, '◀ Back', function () { set(Math.max(0, cur - 1)); });
  V.button(ctl, 'Next ▶', function () { set(Math.min(STEPS.length - 1, cur + 1)); });
  var ro = V.readout(el);
  function show(ks) { Object.keys(PL).forEach(function (k) { var on = !ks || ks.indexOf(k) >= 0; labs[k].style.display = on ? '' : 'none'; dots[k].classList.toggle('gbx-on', !!ks && ks.indexOf(k) >= 0); }); }
  function set(i) {
    cur = i; var s = STEPS[i];
    while (rg.firstChild) rg.removeChild(rg.firstChild);
    s[2].forEach(function (r) { S('polyline', { points: r.map(function (k) { var q = M.P(PL[k][1], PL[k][2]); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '), 'class': s[1] === 'p' ? 'gbx-route-p' : 'gbx-route-a' }, rg); });
    show(s[3].length ? s[3] : ['sardis', 'halicarnassus', 'athens', 'sparta', 'miletus']);
    ro.set('<b>' + s[0] + '</b> <span class="gbx-mut">(Book ' + s[5] + ')</span>. ' + s[4]);
  }
  function info(k) { var p = PL[k]; show(null); Object.keys(labs).forEach(function (j) { labs[j].style.display = j === k ? '' : 'none'; dots[j].classList.toggle('gbx-on', j === k); }); ro.set('<b>' + p[0] + '.</b> ' + p[4]); }
  set(cur);
});
