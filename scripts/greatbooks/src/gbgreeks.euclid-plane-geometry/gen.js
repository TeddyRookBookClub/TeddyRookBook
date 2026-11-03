/* Euclid, Elements I–IV. Bank (history and ideas) plus computed families: I.47 and I.48, I.32 (angle sums and exterior
   angles), polygon angle sums, I.5 (isosceles base angles), III.31 (the angle in a semicircle), and which postulate or
   common notion justifies each step of I.1. Computed problems carry chk for an independent recomputation. */
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = o.form || 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function mcc(q, right, wrongs, steps, o) { var p = H.mc(q, right, wrongs, steps, o); if (o && o.chk) p.chk = o.chk; return p; }
function cm(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function r2(x, d) { var k = Math.pow(10, d == null ? 2 : d); return Math.round(x * k) / k; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbgreeks.euclid-plane-geometry';
var TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37]];
function famHyp(R, lv) {
  var t = R.pick(lv === 1 ? TRIPLES.slice(0, 3) : TRIPLES), k = lv === 1 ? R.int(1, 3) : R.int(1, 5), a = t[0] * k, b = t[1] * k, c = t[2] * k;
  var ctx = R.pick(['A right triangle has legs', 'A rectangular field has sides', 'A ramp rises', 'A kite string runs from a point on the ground; the kite is']);
  if (lv >= 2 && R.coin()) {
    return num('In a right triangle the side opposite the right angle (the hypotenuse) is ' + c + ' and one leg is ' + a + '. How long is the other leg?', b, '',
      ['By I.47, $' + a + '^2 + x^2 = ' + c + '^2$.', '$x^2 = ' + texn(c * c) + ' - ' + texn(a * a) + ' = ' + texn(b * b) + '$.', '$x = ' + b + '$.'], { hint: 'Subtract the square of the leg from the square of the hypotenuse.', chk: { f: 'leg', a: a, c: c } });
  }
  var q = ctx === 'A ramp rises' ? 'A ramp rises ' + a + ' feet over a level run of ' + b + ' feet. How long is the sloping surface?' :
    ctx === 'A rectangular field has sides' ? 'A rectangular field is ' + a + ' m by ' + b + ' m. How long is the diagonal path across it?' :
    ctx.indexOf('kite') >= 0 ? 'A kite flies ' + a + ' m straight above a point that is ' + b + ' m from where its string is held at ground level. How long is the string, pulled straight?' :
    'A right triangle has legs ' + a + ' and ' + b + '. How long is the hypotenuse?';
  return num(q, c, '', ['The two sides meet at a right angle, so by I.47 the square on the long side equals the sum of the squares on the other two.', '$' + a + '^2 + ' + b + '^2 = ' + texn(a * a) + ' + ' + texn(b * b) + ' = ' + texn(c * c) + '$.', '$\\sqrt{' + texn(c * c) + '} = ' + c + '$.'], { hint: 'Square both legs, add, then take the square root.', chk: { f: 'hyp', a: a, b: b } });
}
function famHypDec(R, lv) {
  var a = R.int(2, 12), b = R.int(2, 12); if (Number.isInteger(Math.sqrt(a * a + b * b))) b++;
  var c = Math.sqrt(a * a + b * b);
  return num('A right triangle has legs ' + a + ' cm and ' + b + ' cm. Find the hypotenuse to two decimal places.', r2(c, 2), 'cm',
    ['$c^2 = ' + a + '^2 + ' + b + '^2 = ' + (a * a + b * b) + '$ (I.47).', '$c = \\sqrt{' + (a * a + b * b) + '} \\approx ' + r2(c, 2) + '$ cm.'], { rtol: 0.003, chk: { f: 'hyp', a: a, b: b } });
}
function famConverse(R, lv) {
  var t = R.pick(TRIPLES), k = R.int(1, 3), s = [t[0] * k, t[1] * k, t[2] * k], right = R.coin();
  if (!right) { s[R.int(0, 1)] += R.pick([-1, 1, 2]); }
  var ok = s[0] * s[0] + s[1] * s[1] === s[2] * s[2];
  return mcc('A triangle has sides ' + s[0] + ', ' + s[1] + ' and ' + s[2] + '. Is the angle opposite the side ' + s[2] + ' a right angle?', ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes', 'There is no way to tell without measuring the angle'],
    ['$' + s[0] + '^2 + ' + s[1] + '^2 = ' + (s[0] * s[0] + s[1] * s[1]) + '$ and $' + s[2] + '^2 = ' + s[2] * s[2] + '$.', ok ? 'They are equal, so by I.48 (the converse of I.47) the angle is right.' : 'They are not equal, so the angle is not right (I.47 would require equality).'], { chk: { f: 'conv', s: s } });
}
function famAngles(R, lv) {
  var a = R.int(20, 90), b = R.int(15, 160 - a), c = 180 - a - b;
  if (lv >= 2 && R.coin()) {
    return num('In triangle ABC, angle A is ' + a + '° and angle B is ' + b + '°. Side BC is extended beyond C. What is the exterior angle at C?', a + b, '°',
      ['By I.32 the exterior angle equals the two interior opposite angles together.', '$' + a + ' + ' + b + ' = ' + (a + b) + '$ degrees.'], { chk: { f: 'ext', a: a, b: b } });
  }
  return num('Two angles of a triangle are ' + a + '° and ' + b + '°. What is the third angle?', c, '°', ['By I.32 the three angles together make two right angles, 180°.', '$180 - ' + a + ' - ' + b + ' = ' + c + '$ degrees.'], { chk: { f: 'third', a: a, b: b } });
}
function famPolygon(R, lv) {
  if (lv === 3 && R.coin()) {
    var n = R.pick([5, 6, 8, 9, 10, 12, 15, 18]), each = 180 - 360 / n;
    return num('What is each interior angle of a regular polygon with ' + n + ' sides?', each, '°', ['Split it into $' + n + ' - 2 = ' + (n - 2) + '$ triangles from one corner: the angles add to $' + (n - 2) + ' \\times 180 = ' + (n - 2) * 180 + '$ degrees.', 'Each of the ' + n + ' equal angles is $' + (n - 2) * 180 + ' \\div ' + n + ' = ' + each + '$ degrees.'], { chk: { f: 'each', n: n } });
  }
  var m = lv === 1 ? R.int(4, 8) : R.int(5, 20);
  return num('Using I.32, what is the sum of the interior angles of a polygon with ' + m + ' sides?', (m - 2) * 180, '°', ['Join one corner to every other corner: that makes $' + m + ' - 2 = ' + (m - 2) + '$ triangles.', 'Each triangle has 180°, so the sum is $' + (m - 2) + ' \\times 180 = ' + texn((m - 2) * 180) + '$ degrees.'], { chk: { f: 'sum', n: m } });
}
function famIsos(R, lv) {
  var apex = 2 * R.int(10, 80), base = (180 - apex) / 2;
  if (lv >= 2 && R.coin()) return num('In an isosceles triangle each base angle is ' + base + '°. What is the angle between the two equal sides?', apex, '°', ['By I.5 the base angles are equal; by I.32 all three make 180°.', '$180 - 2 \\times ' + base + ' = ' + apex + '$ degrees.'], { chk: { f: 'apex', base: base } });
  return num('An isosceles triangle has the angle between its two equal sides equal to ' + apex + '°. What is each base angle?', base, '°', ['By I.5 the two base angles are equal.', 'Together they make $180 - ' + apex + ' = ' + (180 - apex) + '$ degrees, so each is $' + base + '$.'], { chk: { f: 'base', apex: apex } });
}
function famSemi(R, lv) {
  var a = R.int(15, 75);
  return num('Triangle ABC is drawn with BC a diameter of a circle and A on the circle. Angle B is ' + a + '°. What is angle C?', 90 - a, '°', ['By III.31 the angle at A, in a semicircle, is a right angle.', 'So $B + C = 90$ degrees: $C = 90 - ' + a + ' = ' + (90 - a) + '$.'], { chk: { f: 'semi', a: a } });
}
var STEPS = [
  ['With centre A and distance AB, the circle BCD is drawn.', 'Postulate 3 (a circle with any centre and distance)'],
  ['From C, the straight lines CA and CB are joined.', 'Postulate 1 (a straight line from any point to any point)'],
  ['Since A is the centre of circle CDB, AC equals AB.', 'Definition 15 (all radii of a circle are equal)'],
  ['CA and CB are each equal to AB, so CA equals CB.', 'Common Notion 1 (things equal to the same thing are equal to one another)']
];
function famI1(R, lv) {
  var s = R.pick(STEPS), others = STEPS.filter(function (x) { return x !== s; }).map(function (x) { return x[1]; });
  if (lv >= 2) others.push('Postulate 5 (the parallel postulate)', 'Common Notion 5 (the whole is greater than the part)');
  return mcc('In Euclid\'s proof of I.1 (an equilateral triangle on a given line): "' + s[0] + '" Which starting point justifies this step?', s[1], H.samp(R, others, lv === 1 ? 2 : 3), ['Euclid names it in the margin of his proof: ' + s[1] + '.'], { chk: { f: 'i1', s: s[0] } });
}
var B = {
  facts: [
    ['Euclid taught in Alexandria in Egypt around 300 BC.', true, 'Under the first Greek kings of Egypt, the Ptolemies.'],
    ['Euclid discovered the Pythagorean theorem.', false, 'It was known long before him; a Babylonian tablet of about 1800 BC lists triples like 3, 4, 5. Euclid gave a proof and placed it at the end of Book I.'],
    ['The Elements begins with definitions, postulates and common notions.', true, 'Everything else is proved from them.'],
    ['Euclid wrote the letters Q.E.D. at the end of his proofs.', false, 'He wrote a Greek phrase; Q.E.D. is the Latin version used by later editors.'],
    ['The fifth postulate is about parallel lines.', true, 'It says when two lines, extended, must meet.'],
    ['Euclid first uses the parallel postulate in Proposition 29 of Book I.', true, 'He proves the first 28 propositions without it.'],
    ['Mathematicians eventually proved the parallel postulate from the other four.', false, 'In the 1800s Lobachevsky and Bolyai showed it cannot be proved: geometries without it are consistent.'],
    ['Euclid\'s postulates allow two tools: a straightedge and a compass.', true, 'Postulates 1 and 2 are for the straightedge, Postulate 3 for the compass.'],
    ['Proposition I.1 constructs an equilateral triangle on a given straight line.', true, ''],
    ['Book IV shows how to draw a regular pentagon in a circle.', true, 'IV.11.'],
    ['David Hilbert gave geometry a fuller set of axioms in 1899.', true, 'He filled gaps such as the unproved meeting of the two circles in I.1.'],
    ['An original copy of the Elements in Euclid\'s handwriting survives in Alexandria.', false, 'No copy from his time survives; our text comes from much later manuscripts and translations.'],
    ['The first printed edition of the Elements appeared in Venice in 1482.', true, '']
  ],
  items: [
    { q: 'What does Euclid\'s I.47 state?', r: 'In a right triangle, the square on the side opposite the right angle equals the squares on the other two sides.', w: ['The angles of a triangle add to two right angles.', 'An angle in a semicircle is a right angle.', 'The base angles of an isosceles triangle are equal.'], why: 'That is the Pythagorean theorem, proved with areas of squares.' },
    { q: 'What is a postulate, in Euclid?', r: 'A starting assumption that is accepted without proof', w: ['A proposition proved from earlier ones', 'A drawing used instead of a proof', 'A rule for measuring angles'], why: 'Euclid asks his reader to grant five postulates; everything else is proved.' },
    { q: 'Which of these is Euclid\'s first definition?', r: 'A point is that which has no part.', w: ['A line is the shortest path between two points.', 'A point is a very small dot.', 'A circle is a round figure.'], why: 'Definition 1 in Heath\'s translation.' },
    { q: 'What is the "axiomatic method"?', r: 'State the assumptions first, then prove everything else from them', w: ['Measure many examples and look for a pattern', 'Accept what famous teachers have said', 'Use a computer to check every case'], why: 'Euclid\'s Elements is the classic example.' },
    { q: 'What changed about geometry in the 1800s?', r: 'Geometries without the parallel postulate were shown to be consistent', w: ['The Pythagorean theorem was disproved', 'Euclid\'s proofs were found to be copied from Egypt', 'Compasses were banned from geometry'], why: 'Lobachevsky and Bolyai (and privately Gauss) built non-Euclidean geometry.' },
    { q: 'Which subject is Book III of the Elements about?', r: 'Circles', w: ['Prime numbers', 'Solids', 'Ratios of any magnitudes'], why: 'Book III treats circles, chords and tangents.' },
    { q: 'Why does Euclid\'s I.1 need both circles?', r: 'The point where they cross is the same distance from A and from B', w: ['Two circles are needed to measure an angle', 'One circle would make the triangle too small', 'The second circle checks the first for mistakes'], why: 'C lies on both circles, so CA = AB and CB = BA.' },
    { q: 'What gap did later mathematicians find in Euclid\'s proof of I.1?', r: 'He never proves that the two circles actually meet', w: ['He forgot to join C to A', 'He used the parallel postulate too early', 'He assumed the triangle was right-angled'], why: 'It is obvious in the figure, but not from his postulates.' }
  ]
};
H.T(ID, B, [famHyp, famHyp, famHypDec, famConverse, famAngles, famAngles, famPolygon, famIsos, famSemi, famI1].concat(dateFams(ID).slice(0, 2)), 0.65);
