/* Newton: The Principia. Bank (history, ideas, the laws in Newton's words) plus computed families: gravity with distance,
   the Moon test, orbital speed (the cannonball), Kepler's third law, the second and third laws, universal gravitation.
   Computed problems carry chk (their inputs) for an independent recomputation. */
var ID = 'gb17.newton-principia';
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function sf(v, n) { return +(+v).toPrecision(n || 3); }
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function sci(v) { var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e); return m.toFixed(2) + ' \\times 10^{' + e + '}'; }
function famGrav(R, lv) {
  var r = lv === 1 ? R.pick([2, 3, 4, 5]) : R.pick([2, 3, 4, 5, 6, 8, 10, 20, 30, 60]), g = 9.8 / (r * r);
  var dp = g >= 1 ? 2 : g >= 0.1 ? 3 : 5;
  return num('At the Earth’s surface (1 Earth radius from the center) gravity gives $g = 9.8$ m/s². By Newton’s inverse-square law, what is it at ' + r + ' Earth radii from the center?', +g.toFixed(dp), 'm/s²',
    ['Gravity falls as $1/r^2$: at ' + r + ' times the distance it is $1/' + (r * r) + '$ as strong.', '$9.8 / ' + texn(r * r) + ' \\approx ' + (g >= 0.01 ? g.toFixed(dp) : sci(g)) + '$ m/s².'],
    { rtol: 0.02, hint: 'Divide 9.8 by the distance (in Earth radii) squared.', chk: { f: 'grav', r: r } });
}
function famScale(R, lv) {
  var d = R.pick([2, 3, 4, 5, 10]), closer = lv > 1 && R.coin();
  var right = closer ? d * d + ' times as strong' : '1/' + (d * d) + ' as strong';
  var wrong = closer ? [d + ' times as strong', '1/' + (d * d) + ' as strong', 2 * d + ' times as strong'] : ['1/' + d + ' as strong', d * d + ' times as strong', '1/' + (2 * d) + ' as strong'];
  return H.mc('Two bodies attract each other by gravity. If the distance between them becomes ' + (closer ? '1/' + d + ' of what it was' : d + ' times as great') + ', the force becomes:', right, wrong,
    ['The force goes as $1/r^2$. ' + (closer ? 'Dividing the distance by ' + d + ' multiplies the force by $' + d + '^2 = ' + d * d + '$.' : 'Multiplying the distance by ' + d + ' divides the force by $' + d + '^2 = ' + d * d + '$.')]);
}
var SATS = [
  { n: 'the Moon', r: 3.84e8, T: 27.32 * 86400, Tt: '27.3 days', rt: '3.84 \\times 10^{8}' },
  { n: 'a satellite in a GPS orbit', r: 2.656e7, T: 11.97 * 3600, Tt: '11.97 hours', rt: '2.656 \\times 10^{7}' },
  { n: 'the International Space Station', r: 6.78e6, T: 92.7 * 60, Tt: '92.7 minutes', rt: '6.78 \\times 10^{6}' },
  { n: 'a weather satellite in geostationary orbit', r: 4.216e7, T: 86164, Tt: '23.93 hours', rt: '4.216 \\times 10^{7}' }
];
function famMoonTest(R, lv) {
  var s = lv === 1 ? SATS[0] : R.pick(SATS), a = 4 * Math.PI * Math.PI * s.r / (s.T * s.T);
  return num('Newton’s Moon test. ' + s.n.charAt(0).toUpperCase() + s.n.slice(1) + ' circles the Earth at $r = ' + s.rt + '$ m from its center, once every ' + s.Tt + '. What is its acceleration toward the Earth, $a = 4\\pi^2 r / T^2$, in m/s²?', sf(a, 3), 'm/s²',
    ['Period in seconds: $T \\approx ' + texn(Math.round(s.T)) + '$ s.', '$a = \\dfrac{4\\pi^2 \\times ' + s.rt + '}{' + texn(Math.round(s.T)) + '^2} \\approx ' + (a < 0.01 ? sci(a) : sf(a, 3)) + '$ m/s².',
      'Compare $g$ weakened by the square of the distance: $9.8 \\times (6.37\\times10^6 / r)^2 \\approx ' + (a < 0.01 ? sci(9.8 * Math.pow(6.37e6 / s.r, 2)) : sf(9.8 * Math.pow(6.37e6 / s.r, 2), 3)) + '$ m/s². They agree: the same gravity.'],
    { rtol: 0.03, hint: 'Turn the period into seconds first.', chk: { f: 'cent', r: s.r, T: s.T } });
}
var BODIES = [['the Earth', 9.8, 6371], ['the Moon', 1.62, 1737], ['Mars', 3.71, 3390], ['Mercury', 3.70, 2440], ['Jupiter', 24.8, 69911], ['Venus', 8.87, 6052]];
function famCannon(R, lv) {
  var b = lv === 1 ? BODIES[0] : R.pick(BODIES), v = Math.sqrt(b[1] * b[2] * 1000) / 1000;
  return num('Newton’s cannonball: how fast (in km/s) must a ball be fired sideways, just above the ground and with no air, to circle ' + b[0] + '? Surface gravity is ' + b[1] + ' m/s² and the radius is ' + texn(b[2]) + ' km.', sf(v, 3), 'km/s',
    ['For a circle at the surface, gravity supplies the pull that bends the path: $g = v^2/R$.', '$v = \\sqrt{gR} = \\sqrt{' + b[1] + ' \\times ' + texn(b[2] * 1000) + '} \\approx ' + texn(Math.round(v * 1000)) + '$ m/s $\\approx ' + sf(v, 3) + '$ km/s.'],
    { rtol: 0.03, hint: 'Use v = √(gR) with R in meters, then divide by 1,000.', chk: { f: 'vcirc', g: b[1], R: b[2] * 1000 } });
}
var PL = [['Mercury', 0.387], ['Venus', 0.723], ['Mars', 1.524], ['Jupiter', 5.203], ['Saturn', 9.537], ['Ceres', 2.77], ['a comet', 4], ['an asteroid', 2.5], ['a far asteroid', 9]];
function famKepler(R, lv) {
  var p = R.pick(PL), T = Math.pow(p[1], 1.5);
  if (lv === 3 && R.coin()) {
    var Ty = R.pick([8, 27, 64, 125, 1.5, 3, 5, 12]), a = Math.pow(Ty, 2 / 3);
    return num('An asteroid goes around the sun once every ' + Ty + ' years. By Kepler’s third law, which Newton derived from gravity, how far from the sun is it on average, in AU (Earth = 1)?', sf(a, 3), 'AU',
      ['$T^2 = a^3$ in years and AU, so $a = T^{2/3}$.', '$a = ' + Ty + '^{2/3} \\approx ' + sf(a, 3) + '$ AU.'], { rtol: 0.02, chk: { f: 'k3a', T: Ty } });
  }
  return num(p[0].charAt(0).toUpperCase() + p[0].slice(1) + ' orbits the sun at an average of ' + p[1] + ' AU (Earth = 1 AU). By Kepler’s third law, how long is its year, in Earth years?', sf(T, 3), 'years',
    ['For bodies going around the sun, $T^2 = a^3$ with $T$ in years and $a$ in AU.', '$T = ' + p[1] + '^{3/2} \\approx ' + sf(T, 3) + '$ years.'], { rtol: 0.02, chk: { f: 'k3T', a: p[1] } });
}
function famLaw2(R, lv) {
  var m = R.pick([2, 4, 5, 10, 20, 50]), F = R.pick([10, 20, 40, 50, 100]), t = R.pick([1, 2, 3, 4, 5]);
  var v = F * t / m;
  if (v !== Math.round(v * 10) / 10) { m = 10; v = F * t / m; }
  return num('Newton’s second law says the change of motion (momentum, mass times velocity) is proportional to the force and the time it acts. A steady force of ' + F + ' N pushes a ' + m + ' kg cart, at rest on smooth ice, for ' + t + ' s. How fast is it moving then, in m/s?', v, 'm/s',
    ['Change of momentum = force × time: $' + F + ' \\times ' + t + ' = ' + F * t + '$ kg·m/s.', 'Speed = momentum ÷ mass: $' + F * t + ' / ' + m + ' = ' + v + '$ m/s.'],
    { rtol: 0.01, chk: { f: 'imp', F: F, t: t, m: m } });
}
function famLaw3(R, lv) {
  var m1 = R.pick([40, 50, 60, 80]), m2 = R.pick([20, 25, 30, 40, 100, 120]), v1 = R.pick([1, 1.5, 2, 3]);
  if (m1 === m2) m2 += 20;
  var v2 = m1 * v1 / m2;
  return num('Two skaters stand still on ice and push off each other. The ' + m1 + ' kg skater glides away at ' + v1 + ' m/s. How fast does the ' + m2 + ' kg skater glide away the other way?', sf(v2, 3), 'm/s',
    ['By the third law the pushes are equal and opposite for the same time, so the changes in momentum are equal and opposite.', '$' + m1 + ' \\times ' + v1 + ' = ' + m2 + ' \\times v$, so $v = ' + sf(v2, 3) + '$ m/s.'],
    { rtol: 0.02, chk: { f: 'mom', m1: m1, v1: v1, m2: m2 } });
}
function famUniversal(R, lv) {
  var cases = [['the Earth (6.0 × 10²⁴ kg) and the Moon (7.3 × 10²² kg)', 6.0e24, 7.3e22, 3.84e8, '3.84 \\times 10^{8}'],
    ['the Sun (2.0 × 10³⁰ kg) and the Earth (6.0 × 10²⁴ kg)', 2.0e30, 6.0e24, 1.5e11, '1.5 \\times 10^{11}'],
    ['two 1,000 kg cars', 1000, 1000, R.pick([2, 5, 10]), null],
    ['two 70 kg people', 70, 70, R.pick([1, 2]), null]];
  var c = R.pick(lv === 1 ? cases.slice(2) : cases), Gc = 6.67e-11, F = Gc * c[1] * c[2] / (c[3] * c[3]);
  var rt = c[4] || String(c[3]);
  return num('Newton’s law of universal gravitation: $F = Gm_1m_2/r^2$ with $G = 6.67 \\times 10^{-11}$ N·m²/kg². What is the pull between ' + c[0] + ' at a distance of $' + rt + '$ m? Give newtons (you can type a power of ten like 2e20).', sf(F, 3), 'N',
    ['$F = \\dfrac{6.67\\times10^{-11} \\times m_1 \\times m_2}{(' + rt + ')^2}$.', '$F \\approx ' + sci(F) + '$ N.' + (F < 1e-3 ? ' Tiny: that is why we never notice the pull between everyday objects.' : '')],
    { rtol: 0.03, hint: 'Multiply the masses, divide by the distance squared, multiply by G.', chk: { f: 'ug', m1: c[1], m2: c[2], r: c[3] } });
}
function famApple(R, lv) {
  var r = R.pick([60, 30, 10, 20, 5, 4]), t = R.pick([r, 2 * r, 10, 30, 60, 120].filter(function (x, i, a) { return a.indexOf(x) === i; }));
  var d = 0.5 * 9.8 / (r * r) * t * t;
  return num('An apple falls about 4.9 m in its first second. At ' + r + ' Earth radii, where gravity is $1/' + texn(r * r) + '$ as strong, how far would a body starting from rest fall in ' + t + ' seconds?', sf(d, 3), 'm',
    ['Distance fallen from rest: $d = \\tfrac12 a t^2$ with $a = 9.8/' + texn(r * r) + '$ m/s².', '$d = \\tfrac12 \\times \\dfrac{9.8}{' + texn(r * r) + '} \\times ' + texn(t * t) + ' \\approx ' + sf(d, 3) + '$ m.', 'For the Moon, at 60 radii, a body falls in a minute what an apple falls in a second, 4.9 m. That is how Newton put the test.'],
    { rtol: 0.02, chk: { f: 'fall', r: r, t: t } });
}
var B = {
  facts: [
    ['The Principia was first published in Latin in 1687.', true, 'Andrew Motte’s English translation came in 1729.'],
    ['Edmond Halley urged Newton to write the Principia and paid for its printing.', true, 'After his visit to Cambridge in 1684.'],
    ['The equation F = ma appears in Newton’s Principia.', false, 'Newton states the second law in words, about change of motion; Euler wrote it as an equation around 1750.'],
    ['Newton showed that the force holding the Moon in orbit is the same gravity that makes things fall on Earth.', true, 'This is the Moon test of Book III.'],
    ['An apple fell on Newton’s head and gave him the idea of gravity.', false, 'Newton said seeing an apple fall made him wonder if gravity reached the Moon; nothing hit his head.'],
    ['Newton wrote that he could not discover the cause of gravity and would “frame no hypotheses.”', true, 'In the General Scholium, added in 1713.'],
    ['Robert Hooke suggested an inverse-square attraction to Newton in letters of 1679–1680.', true, 'Newton gave the mathematical proof; Hooke got little credit.'],
    ['Book II of the Principia argues that Descartes’s whirlpools of matter cannot explain Kepler’s laws.', true, 'It deals with motion in fluids.'],
    ['Newton’s gravity explains the tides and the flattened shape of the Earth.', true, 'Both are in Book III.'],
    ['Einstein’s relativity showed that Newton’s laws are useless.', false, 'They are still used for spacecraft; relativity corrects them for very strong gravity and very high speeds.'],
    ['Neptune was found in 1846 where calculations from Newton’s laws said an unseen planet must be.', true, 'Le Verrier predicted it; Galle saw it.'],
    ['The Principia is written mostly in the notation of calculus that students use today.', false, 'It is written in the language of geometry and ratios.'],
    ['Newton’s first law says a body keeps moving in a straight line at a steady speed unless a force acts on it.', true, 'Motte’s words: it “perseveres in its state of rest, or of uniform motion in a right line.”'],
    ['By “motion” in the second law, Newton meant what we call momentum.', true, 'Mass times velocity.'],
    ['Gravity at twice the distance is half as strong.', false, 'A quarter as strong: the inverse square.']
  ],
  items: [
    { q: 'What question did Halley bring Newton in 1684?', r: ['What path a planet takes if the sun pulls it with an inverse-square force'], w: ['How to make a better telescope', 'Why the sky is blue', 'How old the Earth is'], why: 'Newton said an ellipse, and the work became the Principia.' },
    { q: 'Which law says that when you press a stone with your finger, the finger is pressed by the stone?', r: ['The third law'], w: ['The first law', 'The second law', 'The law of gravity'], why: 'Action and reaction are equal and opposite. Newton uses that very example.' },
    { q: 'In Newton’s cannonball picture, what happens if the ball is fired fast enough?', r: ['It falls all the way around the Earth without landing'], w: ['It stops in midair', 'It falls straight down', 'It flies off in a straight line at once'], why: 'The ground curves away as fast as the ball falls: an orbit.' },
    { q: 'What does Newton’s law of gravitation say the force depends on?', r: ['The two masses and the square of the distance between them'], w: ['Only the size of the bodies', 'Only the distance', 'The color and temperature of the bodies'], why: '$F = Gm_1m_2/r^2$, in modern notation.' },
    { q: 'What part of the Principia contains the “Rules of Reasoning in Philosophy”?', r: ['The start of Book III'], w: ['The preface to Book I', 'The end of Book II', 'An appendix by Halley'], why: 'They open “The System of the World.”' },
    { q: 'Who translated the Principia into English in 1729?', r: ['Andrew Motte'], w: ['Edmond Halley', 'Roger Cotes', 'John Locke'], why: 'From the third Latin edition of 1726.' },
    { q: 'What could Newton’s gravity NOT fully explain, which Einstein’s general relativity later did?', r: ['The slow turning of Mercury’s orbit'], w: ['The tides', 'Kepler’s third law', 'Why apples fall'], why: 'Mercury’s orbit turns 43 arcseconds a century more than Newton’s law predicts.' },
    { q: 'Who wrote the laws of motion as equations like F = ma, about 1750?', r: ['Leonhard Euler'], w: ['Isaac Newton', 'Galileo Galilei', 'Albert Einstein'], why: 'Newton stated them in words and geometry.' },
    { q: 'Newton’s Moon test compared the Moon’s fall with an apple’s. At 60 Earth radii, how much weaker should gravity be?', r: ['3,600 times weaker'], w: ['60 times weaker', '120 times weaker', '360 times weaker'], why: '$60^2 = 3{,}600$.' },
    { q: 'Which famous thinker objected that Newton’s attraction at a distance was an “occult quality”?', r: ['Gottfried Leibniz', 'Christiaan Huygens'], w: ['Edmond Halley', 'Andrew Motte', 'Roger Cotes'], why: 'Both Leibniz and Huygens wanted a mechanical cause.' }
  ]
};
H.T(ID, B, [famGrav, famScale, famMoonTest, famCannon, famKepler, famLaw2, famLaw3, famUniversal, famApple,
  function (R, lv) { return H.famBefore(R, lv, ID); }, function (R, lv) { return H.famWhen(R, lv, ID); }], 0.6);
