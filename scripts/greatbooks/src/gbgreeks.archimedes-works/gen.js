/* Archimedes. Bank plus computed families: the lever (Equilibrium of Planes I.6–7), floating (Floating Bodies I.5),
   weight in water (I.7), the crown test by density, polygon bounds for pi (Measurement of a Circle 3), the sphere and
   cylinder (2 : 3), the parabola (4/3) and the Sand-Reckoner's large numbers. chk carries the inputs. */
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = o.form || 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function mcc(q, right, wrongs, steps, o) { var p = H.mc(q, right, wrongs, steps, o); if (o && o.chk) p.chk = o.chk; return p; }
function cm(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function r2(x, d) { var k = Math.pow(10, d == null ? 2 : d); return Math.round(x * k) / k; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbgreeks.archimedes-works';
function famLever(R, lv) {
  var w1 = R.int(2, 12) * (lv === 3 ? 5 : 1), d1 = R.int(1, 6), d2 = R.int(1, 8); if (d1 === d2) d2++;
  var t = w1 * d1, w2 = t / d2; while (!Number.isInteger(w2)) { d2 = R.int(1, 8); w2 = t / d2; }
  if (lv >= 2 && R.coin()) return num('A weight of ' + w1 + ' units hangs ' + d1 + ' units from the balance point. How far from the balance point, on the other side, must a weight of ' + w2 + ' units hang to balance it?', d2, '', ['By the law of the lever, weight × distance must match: $' + w1 + ' \\times ' + d1 + ' = ' + w2 + ' \\times d$.', '$d = ' + t + ' \\div ' + w2 + ' = ' + d2 + '$.'], { chk: { f: 'levd', w1: w1, d1: d1, w2: w2 } });
  return num('A weight of ' + w1 + ' units hangs ' + d1 + ' units from the balance point of a lever. What weight, hung ' + d2 + ' units from the balance point on the other side, balances it?', w2, '', ['Archimedes: weights balance at distances reciprocally proportional to them, so $W_1 d_1 = W_2 d_2$.', '$' + w1 + ' \\times ' + d1 + ' = ' + t + '$, and $' + t + ' \\div ' + d2 + ' = ' + w2 + '$.'], { chk: { f: 'levw', w1: w1, d1: d1, d2: d2 } });
}
function famLever3(R, lv) {
  var a = R.int(1, 5), da = R.int(1, 4), b = R.int(1, 5), db = R.int(5, 8), t = a * da + b * db, d = R.pick([2, 3, 4, 5, 6]);
  while (t % d) { d = R.pick([1, 2, 3, 4, 5, 6]); }
  return num('On one side of a lever hang ' + a + ' units at distance ' + da + ' and ' + b + ' units at distance ' + db + '. What single weight at distance ' + d + ' on the other side balances both?', t / d, '', ['Add the turning effects on the loaded side: $' + a + ' \\times ' + da + ' + ' + b + ' \\times ' + db + ' = ' + t + '$.', 'The weight is $' + t + ' \\div ' + d + ' = ' + t / d + '$ units.'], { chk: { f: 'lev3', a: a, da: da, b: b, db: db, d: d } });
}
function famFloat(R, lv) {
  var m = R.int(2, 60) * 10, what = R.pick(['a wooden block', 'a toy boat', 'an apple', 'a log']);
  if (lv >= 2 && R.coin()) {
    var rho = R.pick([0.5, 0.6, 0.8]), vol = m / rho;
    return num(what.charAt(0).toUpperCase() + what.slice(1) + ' of mass ' + m + ' g and volume ' + vol + ' cm³ floats in water (1 g per cm³). What volume of it is under the water?', m, 'cm³', ['By Floating Bodies I.5 it sinks until it has pushed aside its own weight of water: ' + m + ' g.', m + ' g of water is ' + m + ' cm³.', 'So ' + m + ' of its ' + vol + ' cm³ are under water.'], { chk: { f: 'float', m: m } });
  }
  return num(what.charAt(0).toUpperCase() + what.slice(1) + ' weighing ' + m + ' g floats in a full basin of water. How many grams of water spill over?', m, 'g', ['Archimedes (Floating Bodies I.5): a floating body pushes aside its own weight of the fluid.', 'So ' + m + ' g of water spills.'], { chk: { f: 'float', m: m } });
}
var MET = [['iron', 7.9], ['copper', 8.96], ['silver', 10.5], ['lead', 11.3], ['gold', 19.3], ['aluminum', 2.7], ['stone (granite)', 2.7]];
function famApparent(R, lv) {
  var vol = R.int(2, 25) * 10, m = R.pick(MET), mass = r2(vol * m[1], 1), w = r2(mass - vol, 1);
  if (lv === 1) return num('A piece of ' + m[0] + ' has a volume of ' + vol + ' cm³. When hung in water, how many grams of its weight does it seem to lose? (Water: 1 g per cm³.)', vol, 'g', ['By Floating Bodies I.7 it loses the weight of the water it pushes aside.', vol + ' cm³ of water weighs ' + vol + ' g.'], { chk: { f: 'lose', vol: vol } });
  return num('A piece of ' + m[0] + ' weighs ' + mass + ' g in air and has a volume of ' + vol + ' cm³. What does it weigh when hung in water?', w, 'g', ['It loses the weight of the water it displaces: ' + vol + ' g (I.7).', '$' + mass + ' - ' + vol + ' = ' + w + '$ g.'], { form: 'dec', rtol: 0.002, chk: { f: 'appw', mass: mass, vol: vol } });
}
function famCrown(R, lv) {
  var M = R.pick([500, 800, 1000, 1200, 1500]), f = R.pick([0, 0, 0.1, 0.2, 0.3]), V = M * (1 - f) / 19.3 + M * f / 10.5, loss = Math.round(V), dens = M / loss;
  var pure = Math.abs(dens - 19.3) < 0.5;
  if (lv === 3) return num('A crown weighs ' + M + ' g in air and ' + (M - loss) + ' g in water. What is its density, to one decimal place, in grams per cm³?', r2(dens, 1), 'g/cm³', ['It lost ' + loss + ' g, so it displaced ' + loss + ' cm³ of water: that is its volume.', 'Density $= ' + M + ' \\div ' + loss + ' \\approx ' + r2(dens, 1) + '$ g/cm³ (gold is 19.3).'], { form: 'dec', rtol: 0.01, chk: { f: 'dens', M: M, loss: loss } });
  return mcc('A crown weighs ' + M + ' g in air and ' + (M - loss) + ' g in water. Pure gold is 19.3 times as dense as water. Is the crown pure gold?', pure ? 'Yes: its density is about 19.3' : 'No: its density is only about ' + r2(dens, 1), [pure ? 'No: its density is only about ' + r2(dens * 0.85, 1) : 'Yes: its density is about 19.3', 'You can\'t tell without melting it'],
    ['Lost in water: ' + loss + ' g, so its volume is ' + loss + ' cm³.', 'Density $= ' + M + ' \\div ' + loss + ' \\approx ' + r2(dens, 1) + '$.'], { chk: { f: 'crown', M: M, loss: loss } });
}
function famPi(R, lv) {
  var n = R.pick([6, 12, 24, 48, 96]), out = lv >= 2 && R.coin(), v = out ? n * Math.tan(Math.PI / n) : n * Math.sin(Math.PI / n);
  return num('A regular polygon with ' + n + ' sides is drawn ' + (out ? 'around' : 'inside') + ' a circle of diameter 1. Its perimeter is $' + n + (out ? ' \\tan' : ' \\sin') + '(180° / ' + n + ')$. Find it to four decimal places.', r2(v, 4), '', ['$180 \\div ' + n + ' = ' + r2(180 / n, 4) + '$ degrees.', '$' + n + ' \\times ' + (out ? '\\tan' : '\\sin') + '(' + r2(180 / n, 4) + '°) \\approx ' + r2(v, 4) + '$.', 'π lies ' + (out ? 'below' : 'above') + ' this number.'], { form: 'dec', rtol: 0.0002, chk: { f: 'pi', n: n, out: out } });
}
function famSphere(R, lv) {
  var cyl = R.int(2, 40) * 3;
  if (lv === 3 && R.coin()) { var r = R.int(1, 9), vs = 4 / 3 * Math.PI * r * r * r; return num('Find the volume of a sphere of radius ' + r + ' cm, to one decimal place, using the fact that it is two-thirds of the cylinder that holds it.', r2(vs, 1), 'cm³', ['The cylinder has radius ' + r + ' and height ' + 2 * r + ': volume $\\pi r^2 \\cdot 2r = ' + 2 * r * r * r + '\\pi$.', 'Two-thirds of that: $\\tfrac43 \\pi \\cdot ' + r * r * r + ' \\approx ' + r2(vs, 1) + '$ cm³.'], { rtol: 0.003, chk: { f: 'sphr', r: r } }); }
  return num('A cylinder that just holds a ball has a volume of ' + cyl + ' cm³. By Archimedes\' On the Sphere and Cylinder, what is the ball\'s volume?', cyl * 2 / 3, 'cm³', ['The sphere is two-thirds of the cylinder.', '$' + cyl + ' \\times \\tfrac23 = ' + cyl * 2 / 3 + '$ cm³.'], { chk: { f: 'sph', cyl: cyl } });
}
function famParab(R, lv) {
  var t = R.int(2, 30) * 3;
  return num('A triangle drawn inside a slice of a parabola, as Archimedes does, has area ' + t + ' cm². What is the area of the parabolic slice?', t * 4 / 3, 'cm²', ['Archimedes, Quadrature of the Parabola: the slice is $\\tfrac43$ of the triangle.', '$' + t + ' \\times \\tfrac43 = ' + t * 4 / 3 + '$ cm².'], { chk: { f: 'parab', t: t } });
}
function famSand(R, lv) {
  var k = R.int(1, lv === 1 ? 2 : 4), z = 4 * k;
  return num('The Greeks\' largest named number was the myriad, 10,000. Archimedes built bigger numbers from it: a myriad multiplied by itself ' + (k === 1 ? 'once' : k + ' times over') + ' (that is, $10{,}000^{' + k + '}$). How many zeros does it have when written out?', z, '', ['$10{,}000 = 10^4$, so $10{,}000^{' + k + '} = 10^{' + z + '}$.', 'That is 1 followed by ' + z + ' zeros.'], { chk: { f: 'sand', k: k } });
}
var B = {
  facts: [
    ['Archimedes lived in Syracuse, on the island of Sicily.', true, 'About 287 to 212 BC.'],
    ['The story of Archimedes shouting "Eureka!" in his bath was written by Archimedes himself.', false, 'It comes from the Roman architect Vitruvius, about 200 years later.'],
    ['Archimedes showed that pi is between 3 10/71 and 3 1/7.', true, 'Measurement of a Circle, Proposition 3, using 96-sided polygons.'],
    ['A floating body pushes aside its own weight of water.', true, 'Floating Bodies I.5.'],
    ['Archimedes\' Method was rediscovered in 1906 in a reused prayer book.', true, 'J. L. Heiberg found it in the Archimedes Palimpsest.'],
    ['Galileo thought Archimedes probably tested the crown by measuring spilled water.', false, 'In La Bilancetta (1586) Galileo argued for a balance used in water instead.'],
    ['A sphere has two-thirds the volume of the cylinder that just holds it.', true, 'On the Sphere and Cylinder; Cicero says the figure was carved on his tomb.'],
    ['Archimedes died of old age in Alexandria.', false, 'He was killed in Syracuse when the Romans captured the city in 212 BC.'],
    ['The Sand-Reckoner reports Aristarchus\'s idea that the Earth goes around the Sun.', true, 'It is the only surviving source for that idea.'],
    ['A heavier weight must sit farther from the balance point to balance a lighter one.', false, 'Closer: distances are reciprocally proportional to the weights.']
  ],
  items: [
    { q: 'What does the law of the lever say?', r: 'Weights balance at distances inversely proportional to the weights', w: ['Heavier weights always win', 'Weights balance only when they are equal', 'Distance makes no difference'], why: 'On the Equilibrium of Planes I.6–7: $W_1 d_1 = W_2 d_2$.' },
    { q: 'Why does a crown with silver mixed in displace more water than pure gold of the same weight?', r: 'Silver is less dense, so the crown is bulkier', w: ['Silver absorbs water', 'Gold floats', 'Silver is heavier than gold'], why: 'Same weight, more volume.' },
    { q: 'How did Archimedes estimate pi?', r: 'By trapping the circle between polygons inside and outside it', w: ['By measuring a wheel with string', 'By copying a value from Egypt', 'By weighing a circular plate'], why: 'He doubled hexagons to 96 sides.' },
    { q: 'What is the Archimedes Palimpsest?', r: 'A medieval prayer book written over a 10th-century copy of Archimedes', w: ['A scroll from Archimedes\' own hand', 'A Roman statue of Archimedes', 'A list of his inventions'], why: 'The prayers were written in the 1200s over the older text.' },
    { q: 'Who reported Archimedes saying, in effect, "give me a place to stand and I will move the Earth"?', r: 'Pappus of Alexandria, centuries later', w: ['Archimedes, in On Floating Bodies', 'Euclid', 'Galileo'], why: 'A later report of the lever\'s power.' },
    { q: 'What did Archimedes\' Method do?', r: 'It found results by imagining slices balanced on a lever, before proving them', w: ['It proved the parallel postulate', 'It described how to build catapults', 'It listed the stars'], why: 'He separated discovery from proof.' }
  ]
};
H.T(ID, B, [famLever, famLever, famLever3, famFloat, famApparent, famCrown, famPi, famSphere, famParab, famSand].concat(dateFams(ID).slice(0, 2)), 0.65);
