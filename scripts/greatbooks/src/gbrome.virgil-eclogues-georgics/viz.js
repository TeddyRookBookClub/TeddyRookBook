/* gbrome.virgil-eclogues-georgics: visual gb-georgics (gbe3, our own design). Pick a book of the Georgics, or one of
   the ten Eclogues, to see what it is about. Icons are simple shapes drawn in SVG. */
var BOOKS = [
  { n: 'I', t: 'Fields and weather', icon: 'plow', s: 'Plowing, sowing grain, the farmer’s tools and calendar, and the signs in sky and animals that warn of rain and fair weather. It ends with the omens around the death of Julius Caesar and a prayer for Rome after the civil wars.', y: 'Watch the sky and the animals, and do each job in its season.' },
  { n: 'II', t: 'Trees and vines', icon: 'vine', s: 'How trees grow from seed, cuttings and grafts; which soils suit which plants; the care of vines and olives. In the middle comes a famous praise of Italy, and near the end the praise of country life: “too fortunate the farmers, did they know their own happiness.”', y: 'Different plants need different soil, and patience.' },
  { n: 'III', t: 'Horses and cattle', icon: 'ox', s: 'Choosing and raising horses and cattle, then sheep and goats, with advice for summer and winter. The book ends darkly with a cattle plague in the Alps.', y: 'Care for animals as they grow, in every season.' },
  { n: 'IV', t: 'Bees', icon: 'hive', s: 'The hive as a little state: its order, its work, its loyalty. The book ends with the story of the beekeeper Aristaeus, who loses his bees, and inside it the story of Orpheus, who goes to the underworld to bring back his wife Eurydice.', y: 'Bees work together, and their work feeds everyone.' }
];
var ECL = ['Two herdsmen: Tityrus keeps his farm, while Meliboeus must leave his, in the years when land was taken for soldiers.', 'The shepherd Corydon sings of a love that is not returned.', 'A singing contest between two shepherds. The judge calls it a tie.', 'A child is born, and a golden age returns. Later Christian readers took it as a prophecy.', 'Two shepherds mourn the herdsman-poet Daphnis, then celebrate him as a god.', 'The old woodland god Silenus sings of how the world began, and of ancient myths.', 'Meliboeus remembers a singing match: Corydon against Thyrsis. Corydon wins.', 'Two singers each perform a love song; the second is a country spell.', 'Two herdsmen on the road; their friend Menalcas has lost his land, and they half-remember his songs.', 'Virgil’s friend, the poet Gallus, pines for a lost love: “Love conquers all.”'];
var NS = 'http://www.w3.org/2000/svg';
function icon(k) {
  var s = { plow: '<path d="M18 70 L70 58 L96 74" class="gbg-w"/><path d="M70 58 L58 30" class="gbg-w"/><path d="M50 26 L66 22" class="gbg-w"/><path d="M90 70 L110 86 L84 84 Z" class="gbg-m"/><path d="M8 92 Q60 82 112 92" class="gbg-g"/>',
    vine: '<path d="M60 96 Q56 60 64 30 Q70 14 86 12" class="gbg-w"/><path d="M62 50 Q40 40 30 52 Q42 62 62 50Z" class="gbg-l"/><path d="M64 34 Q84 26 92 38 Q78 46 64 34Z" class="gbg-l"/>' + [[46, 66], [56, 66], [51, 75], [61, 75], [41, 75], [46, 84], [56, 84], [51, 92]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5.5" class="gbg-gr"/>'; }).join(''),
    ox: '<ellipse cx="60" cy="58" rx="34" ry="18" class="gbg-b"/><path d="M28 58 L22 86 M38 66 L36 88 M80 66 L82 88 M90 58 L94 86" class="gbg-w"/><circle cx="96" cy="44" r="11" class="gbg-b"/><path d="M90 34 Q86 24 92 22 M102 34 Q106 24 100 22" class="gbg-w"/><path d="M26 54 Q14 60 16 72" class="gbg-w"/>',
    hive: '<path d="M30 92 L30 64 Q30 26 60 24 Q90 26 90 64 L90 92 Z" class="gbg-h"/><path d="M32 46 H88 M30 60 H90 M30 74 H90" class="gbg-w"/><rect x="52" y="80" width="16" height="12" rx="6" class="gbg-d"/><path d="M14 98 H106" class="gbg-g"/>' + [[100, 30], [18, 40], [104, 56]].map(function (p) { return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="5" ry="3.5" class="gbg-bee"/><path d="M' + (p[0] - 2) + ' ' + (p[1] - 3) + ' l-3 -6 M' + (p[0] + 2) + ' ' + (p[1] - 3) + ' l3 -6" class="gbg-wing"/>'; }).join('') };
  return s[k];
}
ML.viz.register('gb-georgics', function (el, opts, V) {
  var mode = opts.mode === 'eclogues' ? 'e' : 'g', cur = 0;
  var wrap = document.createElement('div'); wrap.className = 'gb-stage gbg'; el.appendChild(wrap);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  var tabs = V.seg(ctl, { label: 'Which poems', items: [['g', 'Georgics (4 books)'], ['e', 'Eclogues (10 poems)']], value: mode, change: function (v) { mode = v; cur = 0; draw(); } });
  var ro = V.readout(el);
  function draw() {
    var h = '<div class="gbg-picks" role="group" aria-label="' + (mode === 'g' ? 'Books of the Georgics' : 'The Eclogues') + '">';
    (mode === 'g' ? BOOKS : ECL).forEach(function (b, i) { h += '<button type="button" data-i="' + i + '" aria-pressed="' + (i === cur) + '">' + (mode === 'g' ? 'Book ' + b.n + '<small>' + b.t + '</small>' : 'Eclogue ' + (i + 1)) + '</button>'; });
    h += '</div>';
    if (mode === 'g') h += '<svg class="gbg-icon" viewBox="0 0 120 104" role="img" aria-label="' + BOOKS[cur].t + '">' + icon(BOOKS[cur].icon) + '</svg>';
    wrap.innerHTML = h;
    Array.prototype.forEach.call(wrap.querySelectorAll('.gbg-picks button'), function (b) { b.addEventListener('click', function () { cur = +b.getAttribute('data-i'); draw(); }); });
    if (mode === 'g') { var b = BOOKS[cur]; ro.set('<b>Georgics, Book ' + b.n + ': ' + b.t + '.</b> ' + b.s + '<br><i>In one line:</i> ' + b.y); }
    else ro.set('<b>Eclogue ' + (cur + 1) + '.</b> ' + ECL[cur]);
  }
  draw();
});
