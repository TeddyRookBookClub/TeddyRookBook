/* Kepler: The Harmonies of the World, Book V. Bank (the third law, the planets' music, the history) plus computed
   families: period from distance and distance from period (T^2 = a^3), comparing two planets, the angular-speed ratio
   ((1 + e)/(1 - e))^2 and its nearest musical interval, and string lengths for intervals.
   Computed problems carry chk (verify-science-b.js recomputes them). */
var ID = 'gb17.kepler-harmonies';
function nm(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = 'int'; if (unit === '%') p.a.pct = true; else if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.chk) p.chk = o.chk; return p; }
function sf(v, n) { return +(+v).toPrecision(n || 3); }
var B = {
  facts: [
    ['Kepler’s third law says the square of a planet’s period is proportional to the cube of its distance from the sun.', true, 'With years and AU, $T^2 = a^3$.'],
    ['Kepler’s third law appears in The Harmonies of the World (1619).', true, 'Book V, chapter 3.'],
    ['Kepler said he first hit on the third law on 8 March 1618 and confirmed it on 15 May.', true, 'He at first rejected it after an arithmetic slip.'],
    ['Kepler thought the planets make sounds you can hear with your ears.', false, 'He said the harmony is grasped by the mind, not heard.'],
    ['Kepler compared the planets’ fastest and slowest angular speeds, seen from the sun, with musical ratios.', true, 'Distances and periods did not fit; these speeds did, roughly.'],
    ['Saturn’s slowest and fastest speeds are close to the ratio 4 : 5, a major third.', true, 'Kepler’s own comparison.'],
    ['The idea of a music of the spheres began with Kepler.', false, 'It goes back to the Pythagoreans and Plato.'],
    ['A planet farther from the sun takes longer to go around, and also moves more slowly.', true, 'It has farther to go and goes slower.'],
    ['Newton’s version of the third law includes the masses, which lets astronomers weigh the sun and planets.', true, '$T^2 = 4\\pi^2 a^3 / (G(M+m))$.'],
    ['The third law works only for the six planets Kepler knew.', false, 'It holds for asteroids, comets, moons and exoplanets too.'],
    ['Kepler’s first book, The Cosmic Mystery, fitted the planets’ spheres around the five regular solids.', true, '1596; the idea was wrong, but it started his search.'],
    ['Earth’s angular speed changes only a little over the year, about a half step in music.', true, 'Kepler wrote it as the notes mi and fa.'],
    ['Halving a string’s length raises its note by an octave.', true, 'The ratio 1 : 2.'],
    ['Kepler valued the third law most of all the ideas in his book.', false, 'He valued the harmonies most; later readers kept the law.']
  ],
  items: [
    { q: 'In years and AU, Kepler’s third law is:', r: '$T^2 = a^3$', w: ['$T = a$', '$T^3 = a^2$', '$T = a^2$', '$T^2 = a$'], why: 'The square of the period equals the cube of the distance.' },
    { q: 'What did Kepler compare with musical intervals in Book V?', r: 'Each planet’s fastest and slowest angular speeds, seen from the sun', w: ['The planets’ sizes', 'The planets’ colors', 'The number of moons', 'The planets’ distances from Earth'], why: 'Distances and periods did not fit; the extreme speeds did.' },
    { q: 'Which musical interval did Kepler find in Saturn’s motion?', r: 'A major third (4 : 5)', w: ['An octave (1 : 2)', 'A fifth (2 : 3)', 'A half step (15 : 16)', 'Unison (1 : 1)'], why: 'Saturn’s extreme speeds are close to 4 : 5.' },
    { q: 'Which interval did Kepler find in Mars’s motion?', r: 'A fifth (2 : 3)', w: ['A major third', 'An octave', 'A half step', 'A minor third'], why: 'Mars is quite oval, so its speeds differ a lot.' },
    { q: 'Who later derived the third law from gravity?', r: 'Isaac Newton', w: ['Galileo', 'Tycho Brahe', 'Copernicus', 'Descartes'], why: 'In the Principia, 1687.' },
    { q: 'Where did the idea of a "music of the spheres" come from?', r: 'The Pythagoreans and Plato', w: ['Kepler himself', 'Newton', 'Copernicus', 'Galileo'], why: 'Kepler gave the old idea a new basis in measured speeds.' },
    { q: 'Why does the third law matter so much today?', r: 'With Newton’s masses, it lets us weigh stars, planets and galaxies', w: ['It proves the planets make music', 'It shows orbits are circles', 'It measures the speed of light', 'It explains the seasons'], why: 'The period and size of an orbit tell you the mass at the center.' },
    { q: 'What did Kepler do at the end of Book V?', r: 'He gave thanks in a prayer', w: ['He took back the third law', 'He attacked Copernicus', 'He dedicated it to Galileo', 'He listed his errors'], why: 'He saw his work as reading the Creator’s plan.' }
  ]
};
var PL = [['Mercury', 0.387], ['Venus', 0.723], ['Mars', 1.524], ['Jupiter', 5.203], ['Saturn', 9.537], ['Ceres', 2.77], ['Uranus', 19.19], ['Neptune', 30.07]];
function famT(R, lv) {
  var p = lv === 1 ? R.pick([['an asteroid', 4], ['an asteroid', 9], ['a comet', 16], ['an asteroid', 1]]) : R.pick(PL), T = Math.pow(p[1], 1.5);
  return nm((lv === 1 ? 'An object' : p[0]) + ' orbits the sun at ' + p[1] + ' AU. How many years does one orbit take? Use $T^2 = a^3$.' + (lv === 1 ? '' : ' (Three significant figures.)'), lv === 1 ? Math.round(T) : sf(T, 3), 'years',
    ['$a^3 = ' + p[1] + '^3 = ' + sf(Math.pow(p[1], 3), 4) + '$.', '$T = \\sqrt{' + sf(Math.pow(p[1], 3), 4) + '} \\approx ' + sf(T, 3) + '$ years.'], lv === 1 ? { chk: { f: 'k3T', a: p[1] } } : { rtol: 0.02, chk: { f: 'k3T', a: p[1] } });
}
function famA(R, lv) {
  var T = lv === 1 ? R.pick([1, 8, 27, 64]) : R.pick([2, 5, 8, 12, 20, 30, 0.5, 125]), a = Math.cbrt(T * T);
  return nm('An asteroid takes ' + T + ' years to go around the sun. How far is it from the sun on average, in AU?' + (lv === 1 ? '' : ' (Three significant figures.)'), lv === 1 ? Math.round(a) : sf(a, 3), 'AU',
    ['$a^3 = T^2 = ' + sf(T * T, 4) + '$.', '$a = \\sqrt[3]{' + sf(T * T, 4) + '} \\approx ' + sf(a, 3) + '$ AU.'], lv === 1 ? { chk: { f: 'k3a', T: T } } : { rtol: 0.02, chk: { f: 'k3a', T: T } });
}
function famCompare(R, lv) {
  var k = R.pick([4, 9, 16, 25, 2, 3]), r = Math.pow(k, 1.5);
  return nm('Planet B is ' + k + ' times as far from its star as planet A. How many times longer is B’s year than A’s?' + (Number.isInteger(r) ? '' : ' (Two decimal places.)'), Number.isInteger(r) ? r : +r.toFixed(2), '',
    ['$T \\propto a^{3/2}$, so the ratio is $' + k + '^{3/2} = \\sqrt{' + k + '^3} = \\sqrt{' + k * k * k + '}$.', '$\\approx ' + (Number.isInteger(r) ? r : r.toFixed(2)) + '$.'], Number.isInteger(r) ? { chk: { f: 'pw15', x: k } } : { rtol: 0.01, chk: { f: 'pw15', x: k } });
}
var EC = [['Saturn', 0.0565], ['Jupiter', 0.0489], ['Mars', 0.0934], ['Earth', 0.0167], ['Mercury', 0.2056]];
var IV = [[16, 15, 'a half step (16 : 15)'], [6, 5, 'a minor third (6 : 5)'], [5, 4, 'a major third (5 : 4)'], [3, 2, 'a fifth (3 : 2)'], [12, 5, 'an octave and a minor third (12 : 5)']];
function famInterval(R, lv) {
  var p = R.pick(lv === 1 ? EC.slice(0, 3) : EC), x = Math.pow((1 + p[1]) / (1 - p[1]), 2);
  if (lv === 3 && R.coin()) return nm('Seen from the sun, how many times faster is ' + p[0] + ' at perihelion than at aphelion? Its eccentricity is ' + p[1] + '. Use $\\left(\\frac{1+e}{1-e}\\right)^2$. (Three decimal places.)', +x.toFixed(3), '',
    ['$\\frac{1+e}{1-e} = \\frac{' + (1 + p[1]).toFixed(4) + '}{' + (1 - p[1]).toFixed(4) + '} \\approx ' + ((1 + p[1]) / (1 - p[1])).toFixed(4) + '$.', 'Squared: $\\approx ' + x.toFixed(3) + '$.'], { rtol: 0.005, chk: { f: 'ang', e: p[1] } });
  var best = IV[0]; IV.forEach(function (iv) { if (Math.abs(Math.log(x / (iv[0] / iv[1]))) < Math.abs(Math.log(x / (best[0] / best[1])))) best = iv; });
  return H.mc(p[0] + '’s eccentricity is ' + p[1] + '. Its fastest-to-slowest angular speed ratio is $\\left(\\frac{1+e}{1-e}\\right)^2 \\approx ' + x.toFixed(3) + '$. Which musical interval is it closest to?', best[2], IV.filter(function (iv) { return iv !== best; }).map(function (iv) { return iv[2]; }).slice(0, lv === 1 ? 2 : 3),
    ['Compare ' + x.toFixed(3) + ' with ' + IV.map(function (iv) { return iv[0] + '/' + iv[1] + ' = ' + (iv[0] / iv[1]).toFixed(3); }).join(', ') + '.', 'Closest: ' + best[2] + '.']);
}
function famString(R, lv) {
  var L = R.pick([60, 90, 120, 72, 48]), iv = R.pick([[1, 2, 'an octave'], [2, 3, 'a fifth'], [3, 4, 'a fourth'], [4, 5, 'a major third']]);
  var v = +(L * iv[0] / iv[1]).toFixed(2);
  return nm('A string ' + L + ' cm long sounds a note. How long (in cm) must it be to sound ' + iv[2] + ' higher? (Length ratio ' + iv[1] + ' : ' + iv[0] + '.)', v, 'cm',
    ['A higher note needs a shorter string: multiply by ' + iv[0] + '/' + iv[1] + '.', L + ' × ' + iv[0] + '/' + iv[1] + ' = ' + v + ' cm.'], { rtol: 0.001, chk: { f: 'frac', x: L, n: iv[0], d: iv[1] } });
}
H.T(ID, B, [famT, famA, famCompare, famInterval, famString, function (R, lv) { return H.famBefore(R, lv, ID); }], 0.55);
