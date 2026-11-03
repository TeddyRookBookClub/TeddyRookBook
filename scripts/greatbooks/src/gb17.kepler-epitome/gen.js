/* Kepler: Epitome of Copernican Astronomy (Books IV and V). Bank (the two laws, the force from the sun, the history)
   plus computed families: nearest and farthest distances a(1 - e), a(1 + e); the eccentricity and size from those two
   distances; the speed ratio (1 + e)/(1 - e) from equal areas; equal areas and time; the string-and-tacks ellipse.
   Computed problems carry chk (verify-science-b.js recomputes them). */
var ID = 'gb17.kepler-epitome';
function nm(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = 'int'; if (unit === '%') p.a.pct = true; else if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.chk) p.chk = o.chk; return p; }
function r3(x) { return +x.toFixed(3); }
var B = {
  facts: [
    ['Kepler found that each planet moves on an ellipse with the sun at one focus.', true, 'The first law, found for Mars in A New Astronomy (1609).'],
    ['The sun sits at the center of a planet’s ellipse.', false, 'It sits at one focus, off to one side; the other focus is empty.'],
    ['A line from the sun to a planet sweeps out equal areas in equal times.', true, 'The second law.'],
    ['A planet moves fastest when it is farthest from the sun.', false, 'Equal areas means it moves fastest when nearest.'],
    ['Kepler found the equal-area rule before he found the ellipse.', true, 'He found it while still using circles.'],
    ['Kepler numbered his laws "first, second and third" himself.', false, 'Later writers numbered them.'],
    ['Kepler’s best circle model of Mars missed Tycho’s observations by about 8 minutes of arc.', true, 'He trusted Tycho’s data and kept looking.'],
    ['The Epitome is written as questions and answers, like a textbook.', true, 'It was written to be taught.'],
    ['In the Epitome, Kepler applies ellipses to every planet and to the Moon.', true, 'A New Astronomy had treated Mars.'],
    ['Kepler imagined a force from the turning sun that pushes the planets around.', true, 'He took the idea of magnetic-like forces from Gilbert.'],
    ['An eccentricity of 0 means a very long, thin ellipse.', false, 'Eccentricity 0 is a circle.'],
    ['Kepler’s Rudolphine Tables (1627) predicted a transit of Mercury that Gassendi saw in 1631.', true, 'A striking test of the laws.'],
    ['Newton later showed that both laws follow from an inverse-square force of gravity.', true, 'In the Principia (1687).'],
    ['Kepler worked as Imperial Mathematician in Prague after Tycho Brahe died.', true, 'From 1601.'],
    ['Earth’s orbit is far more oval than Mars’s.', false, 'Earth’s eccentricity is about 0.017; Mars’s about 0.093.']
  ],
  items: [
    { q: 'Where is the sun in a planet’s elliptical orbit?', r: 'At one focus', w: ['At the center', 'At both foci', 'On the ellipse itself', 'Outside the ellipse'], why: 'The first law.' },
    { q: 'What does the equal-area rule say?', r: 'The sun–planet line sweeps equal areas in equal times', w: ['Every planet’s orbit has the same area', 'A planet moves at a steady speed', 'The orbit is divided into equal arcs', 'Planets farther out sweep larger areas each day'], why: 'The second law.' },
    { q: 'Whose observations did Kepler use to find the shape of Mars’s orbit?', r: 'Tycho Brahe’s', w: ['Galileo’s', 'Ptolemy’s', 'Copernicus’s', 'Newton’s'], why: 'Tycho measured the planets for twenty years without a telescope.' },
    { q: 'Which book of Kepler’s first announced the ellipse and the equal-area rule?', r: 'A New Astronomy (1609)', w: ['The Epitome (1617–1621)', 'The Harmonies of the World (1619)', 'The Cosmic Mystery (1596)', 'The Rudolphine Tables (1627)'], why: 'Astronomia Nova, on the motion of Mars.' },
    { q: 'What did Kepler think moved the planets?', r: 'A force from the turning sun, something like magnetism', w: ['Angels pushing crystal spheres', 'Nothing: they need no cause', 'The pull of the fixed stars', 'Gravity exactly as Newton described'], why: 'He was inspired by Gilbert’s On the Magnet.' },
    { q: 'What made Kepler give up his circle model of Mars?', r: 'It missed Tycho’s positions by about 8 minutes of arc', w: ['It missed by many degrees', 'The Church forbade it', 'Galileo’s telescope showed ellipses', 'It needed too much arithmetic'], why: 'A small but real error, in data he trusted.' },
    { q: 'Where on its orbit does a planet move slowest?', r: 'At its farthest point from the sun (aphelion)', w: ['At its nearest point (perihelion)', 'Halfway between', 'Everywhere the same', 'At the empty focus'], why: 'The line is longest there, so the planet must move slowest to sweep the same area.' },
    { q: 'Who later explained Kepler’s laws with a single force of gravity?', r: 'Isaac Newton', w: ['Galileo', 'Descartes', 'Tycho Brahe', 'Copernicus'], why: 'In the Principia, 1687.' },
    { q: 'How do you draw an ellipse with two tacks and a loop of string?', r: 'Keep the string tight around both tacks and the pencil as you go round', w: ['Use one tack and a short string', 'Trace around a coin', 'Push the tacks as far apart as possible and draw a circle', 'Draw two circles that cross'], why: 'The two distances to the tacks always add to the same total.' }
  ]
};
var ORB = [['Mars', 1.524, 0.093], ['Mercury', 0.387, 0.206], ['an asteroid', 2.8, 0.15], ['a comet', 3.5, 0.6], ['an asteroid', 2.2, 0.25], ['a small moon of a planet', 1.0, 0.2], ['Halley’s Comet', 17.8, 0.967]];
function famNearFar(R, lv) {
  var o = lv === 1 ? R.pick([['an orbit', 2, 0.25], ['an orbit', 4, 0.5], ['an orbit', 10, 0.1], ['an orbit', 5, 0.2]]) : R.pick(ORB), far = R.coin();
  var v = o[1] * (far ? 1 + o[2] : 1 - o[2]);
  return nm('For ' + o[0] + ' with half-long axis $a = ' + o[1] + '$ AU and eccentricity $e = ' + o[2] + '$, how ' + (far ? 'far' : 'near') + ' does it get to the sun (in AU)?', r3(v), 'AU',
    [(far ? 'Farthest' : 'Nearest') + ' distance $= a(1 ' + (far ? '+' : '-') + ' e)$.', '$' + o[1] + ' \\times ' + (far ? 1 + o[2] : r3(1 - o[2])) + ' = ' + r3(v) + '$ AU.'], { rtol: 0.01, chk: { f: far ? 'aph' : 'peri', a: o[1], e: o[2] } });
}
function famEcc(R, lv) {
  var q = R.pick([1, 2, 3, 4, 6]), Q = q + R.pick([1, 2, 4, 6]), askE = lv > 1 && R.coin(), a = (q + Q) / 2, e = (Q - q) / (Q + q);
  if (askE) return nm('An orbit comes as near as ' + q + ' AU to the sun and as far as ' + Q + ' AU. What is its eccentricity? (Three decimal places.)', r3(e), '',
    ['$e = \\dfrac{Q - q}{Q + q} = \\dfrac{' + (Q - q) + '}{' + (Q + q) + '} \\approx ' + r3(e) + '$.'], { rtol: 0.01, hint: 'Farthest minus nearest, over farthest plus nearest.', chk: { f: 'ecc', q: q, Q: Q } });
  return nm('An orbit comes as near as ' + q + ' AU to the sun and as far as ' + Q + ' AU. What is its half-long axis $a$ (in AU)?', a, 'AU',
    ['The long axis runs from nearest to farthest: $q + Q = ' + (q + Q) + '$.', 'Half of it: $a = ' + a + '$ AU.'], { rtol: 0.001, chk: { f: 'semi', q: q, Q: Q } });
}
function famSpeed(R, lv) {
  var e = lv === 1 ? R.pick([0.2, 0.5, 1 / 3]) : R.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.6, 0.093, 0.206]), r = (1 + e) / (1 - e);
  var es = e === 1 / 3 ? '\\tfrac13' : String(e);
  return nm('By the equal-area law, how many times faster does a planet move at its nearest point than at its farthest, if its eccentricity is $' + es + '$? (Two decimal places.)', +r.toFixed(2), '',
    ['At those two points speed × distance is the same, so the ratio is $\\dfrac{1 + e}{1 - e}$.', '$\\dfrac{' + r3(1 + e) + '}{' + r3(1 - e) + '} \\approx ' + r.toFixed(2) + '$.'], { rtol: 0.01, chk: { f: 'spd', e: e } });
}
function famAreas(R, lv) {
  var d = R.pick([5, 10, 12, 15, 20]), k = R.pick([2, 3, 4, 6]);
  return nm('A planet’s sun line sweeps an area $A$ in ' + d + ' days. How many days does it take to sweep an area of $' + k + 'A$, anywhere on the orbit?', d * k, 'days',
    ['Equal areas take equal times, wherever the planet is.', k + ' × ' + d + ' = ' + d * k + ' days.'], { chk: { f: 'mul', a: d, b: k } });
}
function famString(R, lv) {
  var c = R.pick([2, 3, 4, 5]), L = 2 * c + R.pick([2, 4, 6]), a = L / 2, e = c / a;
  if (lv === 1) return nm('You draw an ellipse with two tacks ' + (2 * c) + ' cm apart. The string from one tack to the pencil to the other tack is always ' + L + ' cm. How long is the ellipse from end to end (in cm)?', L, 'cm',
    ['At an end of the ellipse, the string runs out and back along the long axis.', 'So the long axis equals the string length: ' + L + ' cm.'], { chk: { f: 'same', a: L } });
  return nm('Two tacks are ' + (2 * c) + ' cm apart, and the string from tack to pencil to tack is ' + L + ' cm. What is the ellipse’s eccentricity (distance between the foci ÷ long axis)? (Three decimal places.)', r3(e), '',
    ['Long axis $= ' + L + '$ cm; distance between foci $= ' + (2 * c) + '$ cm.', '$e = ' + (2 * c) + ' / ' + L + ' \\approx ' + r3(e) + '$.'], { rtol: 0.01, chk: { f: 'div', a: 2 * c, b: L } });
}
H.T(ID, B, [famNearFar, famEcc, famSpeed, famAreas, famString, function (R, lv) { return H.famBefore(R, lv, ID); }], 0.55);
