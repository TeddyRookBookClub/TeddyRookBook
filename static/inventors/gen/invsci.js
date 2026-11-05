/* Inventors Ladder: generators for The Scientific Revolution (course key invsci): history recall and the science and math of each topic.
   Registered with MathLadder.gen(id, fn(R, ctx)). The shared helpers at the top are the same in every Inventors Ladder
   people-course gen file. */
(function (ML) {
  'use strict';
  if (!ML) return;
  var G = ML.gen, U = ML.util, by = ML.byLevel, T = ML.T;
  function fx(x) { return +(+x).toPrecision(12); }
  function AX(x) { return { t: 'num', v: String(fx(x)) }; }
  function AR(x, r) { return { t: 'num', v: String(+(+x).toPrecision(4)), rtol: r || 0.02 }; }
  function MC(c, w) { return U.mc(c, w.filter(function (x) { return x !== c; }), 4); }
  function cm(x) { return T.commas(fx(x)); }
  function yr(y) { return y < 0 ? (-y) + ' BC' : (y < 1000 ? 'AD ' + y : String(y)); }
  /* a fact question from a bank of [question, answer, [wrong answers], explanation] */
  function fact(R, bank) {
    var f = R.pick(bank);
    return { q: f[0], a: MC(f[1], R.sample(f[2], M.min(3, f[2].length))), steps: [f[3] || f[1] + '.'] };
  }
  var M = Math;
  /* years between two timeline events (negative years are BC; there is no year 0) */
  function gapQ(R, tl, who) {
    var p = R.sample(tl, 2).sort(function (a, b) { return a[0] - b[0]; }), a = p[0], b = p[1], d, steps;
    if (a[0] < 0 && b[0] > 0) { d = -a[0] + b[0] - 1; steps = ['From ' + yr(a[0]) + ' to AD 1 is $' + (-a[0]) + '$ years minus the year we start in, and there is no year 0.', 'So the gap is $' + (-a[0]) + ' + ' + b[0] + ' - 1 = ' + d + '$ years.']; }
    else if (a[0] < 0) { d = b[0] - a[0]; steps = ['Both years are BC, and BC years count down, so subtract the smaller number from the larger.', '$' + (-a[0]) + ' - ' + (-b[0]) + ' = ' + d + '$ years.']; }
    else { d = b[0] - a[0]; steps = ['Subtract the earlier year from the later one.', '$' + b[0] + ' - ' + a[0] + ' = ' + d + '$ years.']; }
    if (d <= 0) return null;
    return { q: (who ? who + ': ' : '') + 'How many years passed between these two events?<br>• ' + yr(a[0]) + ': ' + a[1] + '<br>• ' + yr(b[0]) + ': ' + b[1], a: AX(d), unit: 'years', steps: steps };
  }
  function firstQ(R, tl) {
    var p = R.sample(tl, 3).sort(function (a, b) { return a[0] - b[0]; });
    if (p[0][0] === p[1][0]) return null;
    return { q: 'Which of these happened <b>first</b>?', a: MC(p[0][1], [p[1][1], p[2][1]]), steps: [p.map(function (e) { return yr(e[0]) + ': ' + e[1]; }).join('; ') + '.'] };
  }
  function tryN(fn) { for (var i = 0; i < 12; i++) { var p = fn(); if (p) return p; } return fn(); }
  // ---------- invsci.galileo
  var GAL_TL = [[1564, 'Galileo is born in Pisa'], [1592, 'Galileo moves to the University of Padua'], [1609, 'Galileo builds his first telescope'], [1610, 'Galileo sees four moons of Jupiter'], [1633, 'Galileo\'s trial in Rome'], [1638, 'Two New Sciences is printed in Leiden'], [1642, 'Galileo dies at Arcetri'], [1608, 'Dutch spectacle makers apply for telescope patents']];
  var GAL_F = [
    ['How did Galileo first hear about the telescope?', 'A report of a Dutch spyglass', ['He read about it in Aristotle', 'Newton wrote to him', 'He found one in Venice', 'He dreamed it'], 'He heard of the Dutchman\'s instrument in 1609 and worked out how to make one.'],
    ['What did Galileo see going around Jupiter in 1610?', 'Four moons', ['Rings', 'Clouds of dust', 'Two suns', 'Nothing at all'], 'Four small "stars" moved with Jupiter: moons orbiting it.'],
    ['Why did Galileo roll balls down a gentle ramp instead of dropping them?', 'To slow the motion down enough to time it', ['Because dropped balls break', 'Because the Church forbade dropping', 'To make the balls heavier', 'To keep them from rolling away'], 'A gentle slope keeps the pattern of falling but makes it slow enough to measure.'],
    ['How did Galileo time the rolling ball?', 'With a water clock: he weighed water that flowed out', ['With a wristwatch', 'With a pendulum clock he bought', 'By counting heartbeats only', 'With an hourglass of sand'], 'In Two New Sciences he describes weighing the water that ran out during each roll.'],
    ['What did Galileo find about the distance a ball rolls from rest?', 'It grows with the square of the time', ['It grows steadily with the time', 'It stays the same each second', 'It shrinks each second', 'It depends only on the ball\'s weight'], 'Distances are to each other as the squares of the times.'],
    ['Who first told the story of Galileo dropping balls from the Leaning Tower?', 'His student Vincenzo Viviani, years later', ['Galileo, in Two New Sciences', 'Isaac Newton', 'Aristotle', 'The Inquisition'], 'Galileo\'s own books do not describe doing it.'],
    ['What did Galileo\'s first telescope use?', 'A tube of lead with a convex and a concave lens', ['Two mirrors', 'A prism', 'Three convex lenses', 'A single lens'], 'He describes a lead tube with one convex and one concave lens.']
  ];
  G('invsci.galileo', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'first', 'sq']), R.pick(['sq', 'odd', 'mag', 'gap', 'fact']), R.pick(['sq2', 'odd', 'mag2', 'gap']));
    if (kind === 'fact') return fact(R, GAL_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, GAL_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, GAL_TL, 'Galileo'); });
    var d1 = R.pick([2, 3, 4, 5, 6, 8, 10, 12, 15]), t = R.int(2, 6);
    if (kind === 'sq') return { q: 'A ball starts from rest and rolls ' + d1 + ' cm down a ramp in the first second. How far has it rolled after ' + t + ' seconds?', a: AX(d1 * t * t), unit: 'cm',
      steps: ['Distance grows with the square of the time: $' + t + '^2 = ' + t * t + '$ times as far.', '$' + t * t + ' \\times ' + d1 + ' = ' + d1 * t * t + '$ cm.'] };
    if (kind === 'sq2') { var D = d1 * t * t; return { q: 'A ball starting from rest rolls ' + D + ' cm in ' + t + ' seconds. How far did it roll in the first second?', a: AX(d1), unit: 'cm',
      steps: ['In $' + t + '$ seconds it goes $' + t + '^2 = ' + t * t + '$ times as far as in one second.', '$' + D + ' \\div ' + t * t + ' = ' + d1 + '$ cm.'] }; }
    if (kind === 'odd') { var n = R.int(2, 7); return { q: 'A ball rolls ' + d1 + ' cm in the first second. How far does it roll during second number ' + n + ' alone (not the total)?', a: AX(d1 * (2 * n - 1)), unit: 'cm',
      steps: ['In each second the ball covers 1, 3, 5, 7, … times the first second\'s distance: the odd numbers.', 'Second ' + n + ' is the odd number $2 \\times ' + n + ' - 1 = ' + (2 * n - 1) + '$.', '$' + (2 * n - 1) + ' \\times ' + d1 + ' = ' + d1 * (2 * n - 1) + '$ cm.'] }; }
    var fe = R.pick([2, 2.5, 4, 5]), m = R.int(3, 30), fo = fe * m;
    if (kind === 'mag') return { q: 'A telescope\'s front lens has a focal length of ' + fo + ' cm and its eyepiece ' + fe + ' cm. About how many times does it magnify?', a: AX(m), unit: 'times', steps: ['Magnification $\\approx \\dfrac{\\text{front focal length}}{\\text{eyepiece focal length}}$.', '$' + fo + ' \\div ' + fe + ' = ' + m + '$.'] };
    return { q: 'Galileo wants a telescope that magnifies ' + m + ' times, with an eyepiece of focal length ' + fe + ' cm. What focal length must the front lens have?', a: AX(fo), unit: 'cm', steps: ['Front focal length $\\approx$ magnification $\\times$ eyepiece focal length.', '$' + m + ' \\times ' + fe + ' = ' + fo + '$ cm.'] };
  });

  // ---------- invsci.newton
  var NEW_TL = [[1642, 'Newton is born at Woolsthorpe'], [1661, 'Newton enters Trinity College, Cambridge'], [1666, 'Newton\'s first prism experiments (about this year)'], [1668, 'Newton builds a reflecting telescope'], [1672, 'Newton is elected to the Royal Society'], [1687, 'the Principia is published'], [1704, 'Opticks is published'], [1727, 'Newton dies in London']];
  var NEW_F = [
    ['What did Newton\'s experimentum crucis show?', 'One color from a prism stays the same color through a second prism', ['Prisms add colors to light', 'Light is made of sound', 'Red light bends the most', 'White light cannot be split'], 'The second prism bent the single color again but did not change it.'],
    ['Why did Newton build a telescope with a mirror?', 'Lenses made colored fringes, and a mirror reflects all colors alike', ['Mirrors were cheaper than glass', 'He had no lenses', 'Mirrors magnify more than any lens', 'The Royal Society asked for it'], 'He thought the colors could not be fixed in a lens, so he used a curved mirror.'],
    ['Which color bends the most in a prism?', 'Violet', ['Red', 'Yellow', 'Green', 'They all bend the same'], 'Violet bends most, red least; that spreads white light into a spectrum.'],
    ['Where does the apple story come from?', 'Newton himself, told to William Stukeley late in life', ['A cartoon from 1950', 'Galileo\'s notebooks', 'The Principia, Book I', 'Robert Hooke\'s letters'], 'Newton told Stukeley that a falling apple set him thinking. No source says it hit his head.'],
    ['What did Newton show about gravity in the Principia?', 'The same gravity pulls an apple down and holds the Moon in orbit', ['Gravity works only on Earth', 'Heavy things fall faster', 'The Moon has no gravity', 'Gravity gets stronger with distance'], 'One law of gravity for the heavens and the Earth.'],
    ['What happens to a cannonball fired fast enough from a mountain, with no air?', 'It falls around the Earth and goes into orbit', ['It flies straight forever', 'It stops in midair', 'It falls straight down', 'It lands on the Moon'], 'Newton\'s own example in the Principia, Definition V.'],
    ['Who did Newton write "If I have seen further…" to?', 'Robert Hooke', ['Galileo Galilei', 'King Charles II', 'Edmond Halley', 'Christiaan Huygens'], 'In a letter of February 1676 (1675 by the English calendar of the time).']
  ];
  G('invsci.newton', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'first', 'inv']), R.pick(['inv', 'inv2', 'gap', 'fact', 'moon', 'inv3']), R.pick(['inv2', 'inv3', 'gap', 'orbit', 'inv3', 'inv2']));
    if (kind === 'fact') return fact(R, NEW_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, NEW_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, NEW_TL, 'Newton'); });
    var k = R.int(2, 10);
    if (kind === 'inv') return { q: 'Gravity weakens with the square of the distance from Earth\'s center. At ' + k + ' times the distance, how many times weaker is the pull?', a: AX(k * k), unit: 'times', steps: ['Square the distance factor: $' + k + '^2 = ' + k * k + '$.', 'So the pull is $\\dfrac{1}{' + k * k + '}$ as strong.'] };
    if (kind === 'inv2') { var kk = R.pick([2, 3, 4, 5]), w = kk * kk * R.int(2, 40); var ww = w / (kk * kk);
      return { q: 'An object weighs ' + w + ' N on Earth\'s surface. What would it weigh at ' + kk + ' times as far from Earth\'s center?', a: AR(ww, 0.01), unit: 'N', steps: ['Gravity falls as $\\dfrac{1}{d^2}$: divide by $' + kk + '^2 = ' + kk * kk + '$.', '$' + w + ' \\div ' + kk * kk + ' = ' + fx(ww) + '$ N.'] }; }
    if (kind === 'inv3') { var k3 = R.int(2, 6), w3 = k3 * k3 * R.int(2, 30);
      return { q: 'A probe weighs ' + w3 + ' N on Earth\'s surface and ' + (w3 / (k3 * k3)) + ' N out in space. How many times farther from Earth\'s center is it than the surface?', a: AX(k3), unit: 'times', steps: ['The weight fell by a factor of $' + w3 + ' \\div ' + (w3 / (k3 * k3)) + ' = ' + k3 * k3 + '$.', 'Gravity goes as $\\dfrac{1}{d^2}$, so $d^2 = ' + k3 * k3 + '$ and $d = ' + k3 + '$.'] }; }
    if (kind === 'moon') { var g = 9.8, d = 60; return { q: 'The Moon is about ' + d + ' times farther from Earth\'s center than we are. Gravity on Earth\'s surface pulls with $9.8$ m/s². About how strong is Earth\'s pull at the Moon\'s distance, in m/s²? (Round to 4 decimal places.)', a: { t: 'num', v: '0.0027', tol: 0.0001 }, unit: 'm/s²', steps: ['$60^2 = 3600$.', '$9.8 \\div 3600 \\approx 0.0027$ m/s². Newton checked that this is just the pull needed to keep the Moon in its orbit.'] }; }
    var R0 = R.pick([[6371, 'Earth'], [1737, 'the Moon'], [3390, 'Mars']]), gg = { Earth: 9.8, 'the Moon': 1.62, Mars: 3.71 }[R0[1]], v = M.sqrt(gg * R0[0] * 1000) / 1000;
    return { q: 'For a ball to skim around ' + R0[1] + ' just above the ground (no air), gravity must supply $g = v^2/R$. With $g = ' + gg + '$ m/s² and $R = ' + cm(R0[0]) + '$ km, what speed $v$ is needed, in km/s? (Give 2 decimal places.)', a: AR(v, 0.01), unit: 'km/s',
      steps: ['$v = \\sqrt{gR}$, with $R$ in meters: $' + cm(R0[0] * 1000) + '$ m.', '$v = \\sqrt{' + gg + ' \\times ' + cm(R0[0] * 1000) + '} \\approx ' + cm(M.round(v * 1000)) + '$ m/s $\\approx ' + v.toFixed(2) + '$ km/s.'] };
  });
})(window.MathLadder);
