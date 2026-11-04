/* gbrome.virgil-aeneid: visual gb-voyage (gbe3, our own design). A schematic map of the central Mediterranean
   (coastlines simplified by hand from latitude and longitude) with a numbered route you step through.
   opts.route: 'aeneas' (default; the Aeneid, Books 1-8) or 'augustine' (Augustine's travels, Confessions). */
var NS = 'http://www.w3.org/2000/svg';
var L0 = 3, L1 = 30, T0 = 46.6, T1 = 33.2, KX = 0.78 * 24, KY = 24;
function px(p) { return [Math.round((p[0] - L0) * KX * 10) / 10, Math.round((T0 - p[1]) * KY * 10) / 10]; }
function path(pts, close) { return pts.map(function (p, i) { var q = px(p); return (i ? 'L' : 'M') + q[0] + ' ' + q[1]; }).join('') + (close ? 'Z' : ''); }
var EUROPE = [[-6, 46.6], [-6, 36], [-4.4, 36.7], [-2.2, 36.7], [-1, 37.6], [0.2, 38.7], [-0.3, 39.5], [0.9, 40.7], [2.2, 41.4], [3.3, 42.3], [3.0, 42.8], [3.9, 43.5], [5.4, 43.3], [6.0, 43.1], [7.3, 43.7], [8.9, 44.4], [9.8, 44.1], [10.5, 42.9], [11.8, 42.1], [12.3, 41.7], [13.5, 41.2], [14.2, 40.8], [14.8, 40.6], [15.3, 40.0], [15.8, 39.6], [16.0, 39.0], [15.6, 38.0], [16.0, 37.9], [16.6, 38.4], [17.1, 39.1], [16.5, 39.7], [17.2, 40.4], [18.0, 40.0], [18.4, 39.8], [18.5, 40.15], [17.9, 40.6], [16.9, 41.1], [16.2, 41.9], [14.2, 42.5], [13.5, 43.6], [12.6, 44.1], [12.3, 45.4], [13.8, 45.6], [13.9, 44.8], [14.4, 45.3], [15.2, 44.1], [16.4, 43.5], [18.1, 42.6], [19.4, 41.3], [19.4, 40.5], [20.0, 39.7], [20.75, 38.95], [21.3, 38.3], [21.1, 37.7], [21.7, 36.9], [22.5, 36.4], [22.8, 37.0], [23.2, 36.45], [22.8, 37.6], [23.4, 37.4], [23.6, 38.0], [24.0, 37.65], [24.0, 38.15], [22.9, 39.4], [22.9, 40.6], [23.8, 40.0], [24.4, 40.9], [25.9, 40.85], [26.2, 40.05], [26.6, 40.4], [27.5, 40.97], [29.0, 41.1], [28.0, 41.6], [27.9, 43.0], [28.7, 44.3], [29.7, 45.2], [30.7, 46.4], [31.5, 46.6]];
var ASIA_AFRICA = [[29.1, 41.2], [29.0, 40.4], [27.5, 40.4], [26.4, 40.15], [26.2, 39.95], [26.1, 39.5], [26.8, 38.9], [27.0, 38.4], [26.3, 38.3], [27.2, 37.9], [27.3, 37.0], [28.1, 36.7], [29.1, 36.6], [30.5, 36.3], [30.6, 36.85], [32.0, 36.5], [33.0, 36.1], [34.6, 36.8], [35.9, 36.8], [35.8, 36.2], [35.9, 35.4], [35.8, 34.5], [35.5, 33.9], [35.1, 33.0], [34.8, 32.1], [34.3, 31.3], [32.3, 31.2], [31.0, 31.5], [29.9, 31.2], [25.1, 31.6], [23.0, 32.6], [22.2, 32.9], [20.0, 32.1], [19.0, 30.3], [15.6, 31.3], [13.2, 32.9], [11.2, 33.2], [10.1, 33.9], [11.1, 35.2], [10.6, 35.8], [11.1, 36.9], [10.3, 36.8], [9.8, 37.3], [8.6, 36.9], [7.7, 36.9], [6.3, 37.1], [5.0, 36.7], [3.0, 36.8], [1.3, 36.5], [-0.6, 35.7], [-6, 35.8], [-6, 30], [40, 30], [40, 41.0], [36.0, 41.7], [34.0, 42.0], [31.5, 41.3]];
var ISLANDS = [
  [[12.4, 37.8], [12.5, 38.1], [13.4, 38.2], [14.5, 38.05], [15.6, 38.3], [15.1, 37.5], [15.3, 37.0], [15.1, 36.65], [14.3, 37.0], [13.2, 37.5]],
  [[8.4, 39.0], [9.6, 39.1], [9.8, 40.5], [9.5, 41.2], [8.4, 40.9], [8.1, 40.0]],
  [[8.6, 41.4], [9.3, 41.4], [9.5, 42.2], [9.4, 43.0], [8.6, 42.4]],
  [[23.5, 35.3], [24.3, 35.6], [25.4, 35.35], [26.3, 35.3], [26.1, 35.0], [24.8, 34.95]],
  [[23.0, 38.9], [24.2, 38.2], [24.6, 38.1], [23.3, 38.95]],
  [[19.7, 39.8], [20.1, 39.4], [19.9, 39.8]]
];
var ROUTES = {
  aeneas: { title: 'The voyage of Aeneas', stops: [
    ['Troy', 26.24, 39.96, 'Book 2', 'The Greeks take Troy by the trick of the wooden horse. Aeneas carries his father Anchises on his shoulders and leads his son Ascanius out of the burning city.'],
    ['Thrace', 26.1, 40.75, 'Book 3', 'The Trojans start to build a town, but a sign from the grave of a murdered Trojan prince warns them that this land is unlucky.'],
    ['Delos', 25.27, 37.40, 'Book 3', 'Apollo’s oracle tells them to seek their “ancient mother.” Anchises guesses that it means Crete.'],
    ['Crete', 24.9, 35.3, 'Book 3', 'A sickness strikes. In a dream, the household gods explain that the “ancient mother” is Italy, where the Trojans’ ancestor Dardanus came from.'],
    ['Strophades', 21.0, 37.25, 'Book 3', 'The Harpies, bird-women, spoil the Trojans’ food. One of them prophesies hunger before they found their city.'],
    ['Actium and Buthrotum', 20.3, 39.3, 'Book 3', 'They hold games at Actium, then find Andromache, Hector’s widow, and the prophet Helenus, who tells Aeneas the way to Italy and to the Sibyl at Cumae.'],
    ['First sight of Italy', 18.4, 40.1, 'Book 3', 'They land briefly in the heel of Italy, then sail around the south, keeping clear of Scylla and Charybdis.'],
    ['Drepanum, Sicily', 12.5, 38.02, 'Book 3', 'Anchises dies here. The story of the wanderings, told by Aeneas at Dido’s table, ends at this point.'],
    ['Carthage', 10.33, 36.85, 'Books 1 and 4', 'Juno’s storm drives the fleet to Africa. Queen Dido welcomes them. The god Mercury reminds Aeneas of his duty, and he sails on, leaving Dido heartbroken.'],
    ['Sicily again', 12.6, 38.05, 'Book 5', 'Games for the first anniversary of Anchises’ death: a boat race, a foot race, boxing, archery.'],
    ['Cumae', 14.05, 40.85, 'Book 6', 'The Sibyl leads Aeneas into the underworld, where Anchises shows him the souls of the Romans still to be born.'],
    ['Caieta', 13.57, 41.21, 'Book 7', 'Aeneas buries his old nurse Caieta; the town of Gaeta still bears her name.'],
    ['Mouth of the Tiber', 12.25, 41.73, 'Book 7', 'The Trojans reach Latium. King Latinus offers peace and his daughter Lavinia, but Juno stirs up war with Turnus.'],
    ['Pallanteum (the future Rome)', 12.6, 41.95, 'Book 8', 'King Evander shows Aeneas the hills where Rome will stand. Vulcan makes Aeneas a shield showing Rome’s future.']
  ] },
  augustine: { title: 'Augustine’s journeys', stops: [
    ['Thagaste', 7.95, 36.29, 'AD 354', 'Augustine is born in a small town in the Roman province of Africa (today Souk Ahras, Algeria). His mother Monica is a Christian; his father Patricius is not, until near his death.'],
    ['Madauros', 7.82, 35.95, 'c. AD 366', 'He goes to school in a nearby town. As a schoolboy he loved Virgil, and he later wrote that he wept for Dido but not for his own faults.'],
    ['Carthage', 10.33, 36.85, 'AD 371', 'University years in the great city. At 19 he reads Cicero’s Hortensius and falls in love with wisdom. He joins the Manichees, a sect he later leaves.'],
    ['Rome', 12.48, 41.89, 'AD 383', 'He sails to Rome to teach rhetoric, hoping for better-behaved students. They turn out to skip paying their fees.'],
    ['Milan', 9.19, 45.46, 'AD 384–387', 'He becomes the city’s professor of rhetoric, hears Bishop Ambrose preach, reads the Platonists, and in AD 386, in a garden, hears a child’s voice: “Take up and read.” Ambrose baptizes him at Easter 387.'],
    ['Ostia', 12.29, 41.75, 'AD 387', 'Waiting for a ship home, Augustine and Monica talk at a window overlooking a garden. A few days later she falls ill and dies.'],
    ['Thagaste again', 7.95, 36.29, 'AD 388', 'Home in Africa, he lives a quiet life of study and prayer with friends.'],
    ['Hippo Regius', 7.75, 36.88, 'AD 391–430', 'The people of the port city make him a priest, and soon he becomes their bishop. He writes the Confessions here about AD 397–400, and dies here in AD 430.']
  ] }
};
ML.viz.register('gb-voyage', function (el, opts, V) {
  var R = ROUTES[opts.route] || ROUTES.aeneas, S = R.stops, i = opts.start != null ? opts.start : 0;
  var W = Math.round((L1 - L0) * KX), Ht = Math.round((T0 - T1) * KY);
  var stage = document.createElement('div'); stage.className = 'gb-stage gb-map'; el.appendChild(stage);
  var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Ht); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', R.title + ': a schematic map of the central Mediterranean with the route marked');
  var h = '<rect class="gb-map-sea" x="0" y="0" width="' + W + '" height="' + Ht + '"/>';
  h += '<path class="gb-map-land" d="' + path(EUROPE, true) + '"/><path class="gb-map-land" d="' + path(ASIA_AFRICA, true) + '"/>';
  ISLANDS.forEach(function (isl) { h += '<path class="gb-map-land" d="' + path(isl, true) + '"/>'; });
  [['ITALY', 14.6, 42.3], ['GREECE', 21.6, 39.4], ['AFRICA', 8.5, 34.6], ['ASIA', 28.8, 38.6], ['SICILY', 14.0, 37.55]].forEach(function (t) { var q = px([t[1], t[2]]); h += '<text class="gb-map-region" x="' + q[0] + '" y="' + q[1] + '">' + t[0] + '</text>'; });
  h += '<path class="gb-map-route-all" d="' + path(S.map(function (s) { return [s[1], s[2]]; })) + '"/><path class="gb-map-route" d=""/>';
  S.forEach(function (s, k) { var q = px([s[1], s[2]]); h += '<g class="gb-map-stop" data-k="' + k + '" tabindex="0" role="button" aria-label="' + (k + 1) + ': ' + s[0] + '"><circle cx="' + q[0] + '" cy="' + q[1] + '" r="9"/><text x="' + q[0] + '" y="' + (q[1] + 3.6) + '">' + (k + 1) + '</text></g>'; });
  svg.innerHTML = h; stage.appendChild(svg);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  var ro = V.readout(el);
  var prev = V.button(ctl, '◀ Back', function () { go(i - 1); });
  var next = V.button(ctl, 'Next stop ▶', function () { go(i + 1); }, 'pri');
  V.button(ctl, 'Start again', function () { go(0); });
  var route = svg.querySelector('.gb-map-route'), stops = svg.querySelectorAll('.gb-map-stop');
  function go(k) {
    i = Math.max(0, Math.min(S.length - 1, k));
    route.setAttribute('d', path(S.slice(0, i + 1).map(function (s) { return [s[1], s[2]]; })));
    for (var j = 0; j < stops.length; j++) { stops[j].setAttribute('class', 'gb-map-stop' + (j === i ? ' on' : j < i ? ' past' : '')); }
    prev.disabled = i === 0; next.disabled = i === S.length - 1;
    var s = S[i];
    ro.set('<b>' + (i + 1) + '. ' + s[0] + '</b> <small>(' + s[3] + ')</small><br>' + s[4]);
  }
  Array.prototype.forEach.call(stops, function (g) {
    g.addEventListener('click', function () { go(+g.getAttribute('data-k')); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(+g.getAttribute('data-k')); } });
  });
  go(i);
});
