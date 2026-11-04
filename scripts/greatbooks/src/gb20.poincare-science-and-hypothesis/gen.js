/* Poincaré: Science and Hypothesis. Bank (the four parts, conventions, hypotheses, the sphere-world, reception) plus
   computed families: spherical excess and area, which world a triangle lives in from its angles, and sums proved by
   induction (odd numbers, 1 + 2 + … + n). */
var ID = 'gb20.poincare-science-and-hypothesis';
var B = {
  facts: [
    ['Poincaré argued that the axioms of geometry are conventions, chosen because they are convenient.', true, 'Neither truths of reason nor facts of experiment.'],
    ['Poincaré held that all of science is convention, so experiments are useless.', false, 'Only a few basic principles are conventions; the rest of physics must answer to experiment.'],
    ['Poincaré saw proof by mathematical induction as the real engine of mathematical reasoning.', true, 'He called it reasoning by recurrence.'],
    ['On a sphere the angles of a triangle add to more than 180°.', true, 'The extra amount grows with the area.'],
    ['On a saddle-shaped (hyperbolic) surface the angles of a triangle add to more than 180°.', false, 'Less than 180°.'],
    ['Science and Hypothesis first appeared in French in 1902.', true, 'The English translation followed in 1905.'],
    ['Poincaré imagined beings in a sphere where rulers shrink toward the edge, who would find a non-Euclidean geometry.', true, 'His point: measurement mixes geometry and physics.'],
    ['Poincaré compared asking whether Euclid’s geometry is true to asking whether the metric system is true.', true, 'One is not truer, only more convenient.'],
    ['The young Einstein and his friends read Science and Hypothesis in Bern.', true, 'In their reading circle, the "Olympia Academy."'],
    ['Poincaré thought doubting everything was the careful, scientific attitude.', false, 'He called doubting everything and believing everything equally convenient ways to avoid thinking.'],
    ['Poincaré also did important work on the three-body problem in celestial mechanics.', true, 'His 1889 prize study opened the way to chaos theory.'],
    ['Lobachevsky, Bolyai and Riemann built geometries in which Euclid’s parallel postulate fails.', true, 'In the 1800s.']
  ],
  items: [
    { q: 'What did Poincaré call the axioms of geometry?', r: 'Conventions', w: ['Experimental facts', 'Truths known before all experience', 'Guesses to be tested one by one', 'Religious beliefs'], why: 'Free choices guided by experience.' },
    { q: 'Which question did Poincaré say "has no meaning"?', r: 'Is Euclidean geometry true?', w: ['Is the Earth round?', 'Is 2 + 2 = 4?', 'Does light have a speed?', 'Is the Moon smaller than the Earth?'], why: 'Like asking whether the metric system is true.' },
    { q: 'What are the four parts of Science and Hypothesis?', r: 'Number and magnitude; space; force; nature', w: ['Earth; water; air; fire', 'Logic; ethics; politics; poetry', 'Matter; motion; light; life', 'Arithmetic; algebra; geometry; calculus'], why: 'Each part sorts the statements of a science into kinds.' },
    { q: 'Which kind of reasoning did Poincaré think was the heart of mathematics?', r: 'Induction: if true for 1, and true for n makes it true for n + 1, then true for all', w: ['Arguing from authority', 'Guessing from a few examples', 'Measuring with a ruler', 'Reasoning by analogy'], why: 'Reasoning by recurrence.' },
    { q: 'Who translated Science and Hypothesis into English in 1905?', r: 'W. J. Greenstreet', w: ['Robert W. Lawson', 'Constance Garnett', 'Benjamin Jowett', 'Joseph Larmor'], why: 'Larmor wrote the introduction.' },
    { q: 'Whose later theory treated the geometry of space as something measured, not chosen?', r: 'Einstein’s general relativity', w: ['Newton’s Principia', 'Euclid’s Elements', 'Kant’s Critique of Pure Reason', 'Darwin’s Origin of Species'], why: 'Gravity as curved spacetime (1915).' },
    { q: 'What do Poincaré’s sphere-dwellers show?', r: 'Measuring can’t separate geometry from physics', w: ['The Earth is flat', 'Heat does not affect rulers', 'Only Euclid’s geometry is consistent', 'Space has no shape'], why: 'Their world could be described either way.' },
    { q: 'Which did Poincaré write first?', r: 'Science and Hypothesis (1902)', w: ['The Value of Science (1905)', 'Science and Method (1908)'], why: 'The three books came in that order.' }
  ]
};
function famExcess(R, lv) {
  var a = R.int(6, 12) * 10, b = R.int(6, 12) * 10, c = R.int(6, 12) * 10;
  if (a + b + c <= 190) c += 30;
  var E = a + b + c - 180;
  if (lv === 1) return H.num('A triangle drawn on a globe has angles ' + a + '°, ' + b + '° and ' + c + '°. By how many degrees does the sum exceed 180°? (This is the <b>spherical excess</b>.)', E,
    [a + ' + ' + b + ' + ' + c + ' = ' + (a + b + c) + '°.', (a + b + c) + ' − 180 = ' + E + '°.'], { unit: '°' });
  var Rr = R.pick([1, 2, 5, 10]), area = E / 180 * Math.PI * Rr * Rr;
  return H.num('On a sphere of radius ' + Rr + ' m, a triangle has angles ' + a + '°, ' + b + '° and ' + c + '°. Its area is (E ÷ 180°) × πR², where E is the spherical excess. Find the area to 2 decimal places.', +area.toFixed(2),
    ['E = ' + a + ' + ' + b + ' + ' + c + ' − 180 = ' + E + '°.', 'Area = (' + E + ' ÷ 180) × π × ' + Rr + '² ≈ ' + area.toFixed(2) + ' m².'], { form: 'dec', rtol: 0.01, unit: 'm²' });
}
function famWorld(R, lv) {
  var kind = R.pick(['flat', 'sphere', 'saddle']), a = R.int(40, 80), b = R.int(40, 80), s;
  s = kind === 'flat' ? 180 : kind === 'sphere' ? 180 + R.int(4, 60) : 180 - R.int(4, 40);
  var c = s - a - b; if (c < 5) { a = 50; b = 50; c = s - 100; }
  var right = kind === 'flat' ? 'A flat plane (Euclid’s geometry)' : kind === 'sphere' ? 'A sphere (angles add to more than 180°)' : 'A saddle-shaped, hyperbolic surface (angles add to less than 180°)';
  return H.mc('A large triangle is measured with angles ' + a + '°, ' + b + '° and ' + c + '°. What kind of surface could it be drawn on?', right,
    ['A flat plane (Euclid’s geometry)', 'A sphere (angles add to more than 180°)', 'A saddle-shaped, hyperbolic surface (angles add to less than 180°)'].filter(function (x) { return x !== right; }),
    ['The sum is ' + (a + b + c) + '°.', kind === 'flat' ? 'Exactly 180°: flat.' : kind === 'sphere' ? 'More than 180°: curved like a sphere.' : 'Less than 180°: curved like a saddle.']);
}
function famInduction(R, lv) {
  var n = R.int(5, lv === 1 ? 12 : 60);
  if (R.next() < 0.5) return H.num('Using the rule proved by induction, 1 + 3 + 5 + … + (2n − 1) = n², what is the sum of the first ' + n + ' odd numbers?', n * n,
    ['The first ' + n + ' odd numbers end at ' + (2 * n - 1) + '.', 'Sum = ' + n + '² = ' + (n * n) + '.']);
  return H.num('Induction proves 1 + 2 + … + n = n(n + 1)/2. What is 1 + 2 + … + ' + n + '?', n * (n + 1) / 2,
    [n + ' × ' + (n + 1) + ' ÷ 2 = ' + (n * (n + 1) / 2) + '.']);
}
function famInductionStep(R, lv) {
  return H.mc('In a proof by induction that a rule holds for every whole number, what must you show besides "it holds for 1"?', 'If it holds for some number n, it also holds for n + 1',
    ['It holds for 2 and 3', 'It holds for a very large number', 'It has never been shown false', 'It holds for n − 1 when it holds for n'], ['The base case and the step from n to n + 1 together reach every whole number.']);
}
H.T(ID, B, [famExcess, famWorld, famInduction, famInductionStep, function (R, lv) { return H.famBefore(R, lv, ID); }, function (R, lv) { return H.famWhoWrote(R, lv, ID); }], 0.5);
