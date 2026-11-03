/* Galileo: Two New Sciences. Bank (the dialogue, the arguments, the experiments, the history set straight) plus
   computed families: the odd-number rule on the ramp, free fall d = 4.9 t^2 and back, the ratio of distances, the
   square-cube law of size, pendulum lengths (length goes as the square of the period), and equal ranges at angles
   that add to 90 degrees. Computed problems carry chk (verify-science-b.js recomputes them). */
var ID = 'gb17.galileo-two-new-sciences';
function nm(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = 'int'; if (unit === '%') p.a.pct = true; else if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.chk) p.chk = o.chk; return p; }
function fx(x, d) { return +x.toFixed(d); }
var B = {
  facts: [
    ['In Two New Sciences, Salviati speaks for Galileo.', true, 'Sagredo is the curious friend, Simplicio the follower of Aristotle.'],
    ['The two "new sciences" are the strength of materials and motion.', true, 'Days one and two on strength, three and four on motion.'],
    ['Galileo argued that, apart from the air’s resistance, heavy and light bodies fall at the same rate.', true, 'He reasoned it out and tested it.'],
    ['Aristotle taught that a body ten times heavier falls ten times faster.', true, 'Salviati doubts Aristotle ever tested it.'],
    ['Galileo’s own writings describe him dropping balls from the Leaning Tower of Pisa.', false, 'The story comes from Viviani’s biography, written decades later.'],
    ['Simon Stevin and Jan de Groot dropped two lead balls, one ten times heavier, from a church tower in Delft in 1586.', true, 'They landed together.'],
    ['Galileo slowed falling motion down by rolling a bronze ball along a grooved, sloping board.', true, 'The Third Day describes it.'],
    ['Galileo timed his rolling balls with a pendulum clock.', false, 'He weighed water that flowed out of a vessel during each roll; pendulum clocks came later (Huygens, 1656).'],
    ['From rest, distance grows as the square of the time.', true, 'Double the time, four times the distance.'],
    ['In equal times one after another, a falling body covers distances in the ratio 1 : 3 : 5 : 7.', true, 'The odd-number rule.'],
    ['Galileo showed that a thrown body (ignoring air) follows a parabola.', true, 'The Fourth Day.'],
    ['If a beam is made twice as big in every direction, its weight doubles.', false, 'Weight grows 8 times; the cross section only 4 times.'],
    ['Galileo wrote Two New Sciences while confined to his house after his trial of 1633.', true, 'It was printed in Leiden in 1638.'],
    ['The math of steadily speeding-up motion was first worked out by Galileo.', false, 'Oxford and Paris scholars of the 1300s, such as Nicole Oresme, had done it; Galileo applied it to real falling bodies.'],
    ['Galileo noticed that a pendulum four times as long takes twice as long to swing.', true, 'Lengths go as the squares of the times.']
  ],
  items: [
    { q: 'Who in the dialogue defends Aristotle’s views?', r: 'Simplicio', w: ['Salviati', 'Sagredo', 'Viviani'], why: 'Simplicio speaks for the followers of Aristotle.' },
    { q: 'What is the point of Galileo’s "two stones tied together" argument?', r: 'If heavier fell faster, the tied pair would have to fall both faster and slower', w: ['Tied stones fall faster than loose ones', 'String slows things down', 'Stones fall faster in water', 'Heavy stones break when tied'], why: 'The assumption contradicts itself, so it must be false.' },
    { q: 'Why did Galileo use a gentle ramp instead of a straight drop?', r: 'To slow the motion enough to time it', w: ['To make the ball heavier', 'Because a tower was not allowed', 'To stop the ball spinning', 'To remove the air'], why: 'Falls are over too fast for the clocks of his day.' },
    { q: 'What did Galileo use for a clock in the ramp experiments?', r: 'Water flowing from a vessel, collected and weighed', w: ['A pendulum clock', 'A sundial', 'An hourglass of sand', 'A spring watch'], why: 'The weight of water stood for the time.' },
    { q: 'Who first told the Leaning Tower story?', r: 'Vincenzo Viviani, Galileo’s last student', w: ['Galileo himself', 'Aristotle', 'Simon Stevin', 'Isaac Newton'], why: 'In a biography written in the 1650s.' },
    { q: 'Where and when was Two New Sciences published?', r: 'Leiden, 1638', w: ['Rome, 1610', 'Florence, 1632', 'London, 1687', 'Paris, 1543'], why: 'By the Elzevir firm, in the Dutch Republic.' },
    { q: 'What shape is the path of a ball rolled off a table, ignoring air?', r: 'A parabola', w: ['A circle', 'A straight line', 'An ellipse', 'A spiral'], why: 'Steady sideways motion plus speeding-up downward motion.' },
    { q: 'At what angle does a cannon shoot farthest, ignoring air?', r: '45°', w: ['30°', '60°', '90°', '10°'], why: 'Galileo’s gunners’ tables show it; angles equally above and below 45° give equal ranges.' },
    { q: 'Why would a giant twice our height need much thicker bones?', r: 'Its weight grows 8 times but the bones’ cross section only 4 times', w: ['Because giants eat more', 'Because bones get softer with size', 'Because gravity is stronger for big things', 'It would not need thicker bones'], why: 'The square–cube law.' },
    { q: 'Galileo noticed something strange about the squares 1, 4, 9, 16, … What?', r: 'They can be paired one to one with all the counting numbers, though most numbers are not squares', w: ['They are all even', 'There are only finitely many', 'They are all prime', 'Each is twice the one before'], why: 'He concluded that "greater" and "less" don’t apply to infinite collections.' },
    { q: 'Who explained why every falling body speeds up at the same rate?', r: 'Isaac Newton, with gravity proportional to mass', w: ['Aristotle', 'Simplicio', 'Copernicus', 'Ptolemy'], why: 'A bigger mass gets a bigger pull, in just the right proportion.' }
  ]
};
function famOdd(R, lv) {
  var d1 = lv === 1 ? R.pick([1, 2, 3, 5, 10]) : R.pick([4, 6, 8, 12, 15, 20, 25]), n = R.int(2, lv === 1 ? 4 : 7), total = lv > 1 && R.coin();
  if (total) return nm('A ball rolls from rest down a long ramp and goes ' + d1 + ' cm in the first beat of the water clock. How far has it gone <b>in all</b> after ' + n + ' beats?', n * n * d1, 'cm',
    ['After $n$ beats the distance is $n^2$ times the first beat’s.', n + '² × ' + d1 + ' = ' + (n * n) + ' × ' + d1 + ' = ' + n * n * d1 + ' cm.'], { chk: { f: 'odd', d: d1, n: n, total: 1 } });
  return nm('A ball rolls from rest down a ramp and goes ' + d1 + ' cm during the first beat of time. How far does it go <b>during beat number ' + n + '</b> alone?', (2 * n - 1) * d1, 'cm',
    ['In beat after beat the distances go as 1, 3, 5, 7, …: beat ' + n + ' is the odd number ' + (2 * n - 1) + '.', (2 * n - 1) + ' × ' + d1 + ' = ' + (2 * n - 1) * d1 + ' cm.'], { hint: 'Think of the odd numbers 1, 3, 5, 7, …', chk: { f: 'odd', d: d1, n: n, total: 0 } });
}
function famFall(R, lv) {
  if (lv === 3 && R.coin()) {
    var d = R.pick([5, 10, 20, 45, 80, 100, 125, 180]), t = Math.sqrt(2 * d / 9.8);
    return nm('A stone is dropped from rest from a height of ' + d + ' m. Ignoring air, how many seconds does it take to land? ($g = 9.8$ m/s². Two decimal places.)', fx(t, 2), 's',
      ['$d = \\tfrac12 g t^2$, so $t = \\sqrt{2d/g}$.', '$t = \\sqrt{2 \\times ' + d + ' / 9.8} \\approx ' + t.toFixed(2) + '$ s.'], { rtol: 0.01, chk: { f: 'tfall', d: d } });
  }
  var tt = lv === 1 ? R.pick([1, 2, 3, 4]) : R.pick([1.5, 2.5, 3, 3.5, 4.5, 5, 6]), dd = 4.9 * tt * tt;
  return nm('A stone is dropped from rest. Ignoring air, how far (in meters) does it fall in ' + tt + ' s? ($g = 9.8$ m/s²)', fx(dd, 3), 'm',
    ['$d = \\tfrac12 g t^2 = 4.9 \\times ' + tt + '^2$.', '$= 4.9 \\times ' + fx(tt * tt, 2) + ' = ' + fx(dd, 3) + '$ m.'], { rtol: 0.01, hint: 'Square the time first.', chk: { f: 'dfall', t: tt } });
}
function famRatio(R, lv) {
  var k = lv === 1 ? R.pick([2, 3]) : R.pick([2, 3, 4, 5, 1.5, 2.5]);
  return nm('Two balls roll from rest down the same ramp. One rolls for ' + k + ' times as long as the other. How many times as far does it go?', fx(k * k, 2), '',
    ['Distance goes as the square of the time.', k + '² = ' + fx(k * k, 2) + '.'], Number.isInteger(k) ? { chk: { f: 'sq', x: k } } : { rtol: 0.001, chk: { f: 'sq', x: k } });
}
function famScale(R, lv) {
  var k = lv === 1 ? R.pick([2, 3]) : R.pick([2, 3, 4, 5, 10]), what = R.pick(lv === 1 ? ['weight', 'area'] : ['weight', 'area', 'stress']);
  var v = what === 'weight' ? k * k * k : what === 'area' ? k * k : k;
  var lab = { weight: 'its weight', area: 'the cross-section area of its beams', stress: 'the load on each square centimeter of its beams (weight ÷ area)' }[what];
  return nm('A model is scaled up ' + k + ' times in length, width and height, using the same material. By what factor does ' + lab + ' grow?', v, '',
    what === 'weight' ? ['Weight goes with volume: ' + k + '³ = ' + v + '.'] : what === 'area' ? ['Area goes with length squared: ' + k + '² = ' + v + '.'] : ['Weight grows ' + k + '³ = ' + k * k * k + ' times; area ' + k + '² = ' + k * k + ' times.', k * k * k + ' ÷ ' + k * k + ' = ' + k + '.'],
    { hint: 'Lengths multiply once, areas twice, volumes three times.', chk: { f: 'scale', k: k, p: what === 'weight' ? 3 : what === 'area' ? 2 : 1 } });
}
function famPend(R, lv) {
  var L = R.pick([25, 36, 50, 64, 100]), k = lv === 1 ? 2 : R.pick([2, 3, 0.5]);
  return nm('A pendulum ' + L + ' cm long swings with a certain period. How long (in cm) must a pendulum be to take ' + (k === 0.5 ? 'half as long' : k + ' times as long') + ' for each swing? (Galileo: the lengths go as the squares of the times.)', fx(L * k * k, 2), 'cm',
    ['Length goes as the period squared: multiply by ' + (k === 0.5 ? '(1/2)² = 1/4' : k + '² = ' + k * k) + '.', L + ' × ' + fx(k * k, 2) + ' = ' + fx(L * k * k, 2) + ' cm.'], { rtol: 0.001, chk: { f: 'pendL', L: L, k: k } });
}
function famRange(R, lv) {
  var a = R.pick([15, 20, 25, 30, 35, 40]), right = (90 - a) + '°';
  return H.mc('Ignoring air, a cannon aimed at ' + a + '° above the ground sends its ball a certain distance. At what other angle does it reach the same distance?', right, [(a * 2) + '°', (a + 45) + '°', '45°', (180 - a) + '°'].filter(function (x) { return x !== right; }).slice(0, lv === 1 ? 2 : 3),
    ['Galileo showed that angles equally above and below 45° give the same range: ' + a + '° and ' + (90 - a) + '° add up to 90°.']);
}
H.T(ID, B, [famOdd, famFall, famRatio, famScale, famPend, famRange, function (R, lv) { return H.famBefore(R, lv, ID); }], 0.55);
