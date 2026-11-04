/* Robotics Ladder: generators for Capstone Projects and Careers (course key rbcap), 3 topics.
   Power budgets (battery life ≈ usable capacity ÷ average current; we leave 20% unused, as many makers advise for
   lithium packs' life), honest test logs (success rates, one change at a time), and career facts from the BLS
   Occupational Outlook Handbook (pages updated 2026; typical entry education only, which changes slowly). */
(function (ML) {
  'use strict';
  if (!ML) return;
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;
  function fx(x) { return +(+x).toPrecision(12); }
  function sg(x, n) { if (!x || !isFinite(x)) return x; return +(+x).toPrecision(n || 3); }
  function tv(x) { x = fx(x); return Math.abs(x) >= 1000 ? T.commas(x) : String(x); }
  function A(x, n, rtol) { return { t: 'num', v: String(sg(x, n || 3)), rtol: rtol || 0.02 }; }
  function AX(x) { return { t: 'num', v: String(fx(x)) }; }
  function MC(c, w) { return U.mc(c, w.filter(function (x) { return x !== c; }), 4); }

  // ---------- rbcap.power-budget
  var PARTS = [['a microcontroller board', 20, 80], ['a Raspberry Pi', 300, 700], ['two drive motors', 300, 1200], ['a servo', 100, 500], ['a distance sensor', 10, 30], ['a camera', 150, 250], ['an LED strip', 50, 300]];
  G('rbcap.power-budget', function (R, ctx) {
    var kind = by(ctx, 'sum', R.pick(['sum', 'life']), R.pick(['life', 'need']));
    var ps = R.sample(PARTS, R.int(2, 4)).map(function (p) { return [p[0], R.int(p[1] / 10, p[2] / 10) * 10]; }), tot = ps.reduce(function (a, p) { return a + p[1]; }, 0);
    var list = ps.map(function (p) { return p[0] + ' (' + p[1] + ' mA)'; }).join(', ');
    if (kind === 'sum') return {
      q: 'A robot runs ' + list + '. What is the total current, in milliamps?',
      a: AX(tot), unit: 'mA', steps: ['Parts on the same battery add their currents: $' + ps.map(function (p) { return p[1]; }).join(' + ') + ' = ' + tot + '\\ \\text{mA}$.']
    };
    var cap = R.pick([1000, 1500, 2000, 2200, 3000, 5000]);
    if (kind === 'life') return {
      q: 'A robot draws ' + list + ' from a $' + tv(cap) + '\\ \\text{mAh}$ battery. Using only 80% of the capacity, about how many hours will it run?',
      a: A(0.8 * cap / tot, 2, 0.03), unit: 'h', steps: ['Total current: $' + tot + '\\ \\text{mA}$.', 'Usable capacity: $0.8 \\times ' + tv(cap) + ' = ' + tv(0.8 * cap) + '\\ \\text{mAh}$.', 'Time: $' + tv(0.8 * cap) + ' \\div ' + tot + ' \\approx ' + sg(0.8 * cap / tot, 2) + '$ hours. Motors that stall or climb draw more, so real runs are often shorter.']
    };
    var hrs = R.pick([0.5, 1, 1.5, 2, 3]);
    return {
      q: 'A robot draws $' + tot + '\\ \\text{mA}$ in all. You want it to run $' + hrs + '$ hours using only 80% of the battery. What is the smallest capacity, in mAh?',
      a: A(tot * hrs / 0.8, 3), unit: 'mAh', steps: ['Needed: $' + tot + ' \\times ' + hrs + ' = ' + tv(tot * hrs) + '\\ \\text{mAh}$.', 'That must be 80% of the battery: $' + tv(tot * hrs) + ' \\div 0.8 = ' + tv(sg(tot * hrs / 0.8, 4)) + '\\ \\text{mAh}$.']
    };
  });

  // ---------- rbcap.design-test
  G('rbcap.design-test', function (R, ctx) {
    var kind = by(ctx, R.pick(['rate', 'one']), R.pick(['rate', 'diff']), R.pick(['diff', 'one', 'trials']));
    var n = R.pick([10, 20, 25, 40, 50]), k = R.int(Math.ceil(n * 0.3), n);
    if (kind === 'rate') return {
      q: 'Your line follower finished the course $' + k + '$ times out of $' + n + '$ runs. What is its success rate, in percent?',
      a: AX(100 * k / n), steps: ['$\\dfrac{' + k + '}{' + n + '} = ' + fx(k / n) + ' = ' + fx(100 * k / n) + '\\%$.']
    };
    if (kind === 'diff') { var k2 = Math.min(n, k + R.int(1, 8)); return {
      q: 'Before a change your robot succeeded $' + k + '$ of $' + n + '$ runs; after it, $' + k2 + '$ of $' + n + '$. By how many percentage points did the success rate change?',
      a: AX(100 * (k2 - k) / n), steps: ['Before: $' + fx(100 * k / n) + '\\%$. After: $' + fx(100 * k2 / n) + '\\%$.', 'Change: $' + fx(100 * (k2 - k) / n) + '$ points. With only $' + n + '$ runs each, a small change could be luck; run more trials before you trust it.']
    }; }
    if (kind === 'trials') { var m = R.pick([3, 5, 10]); return {
      q: 'You want to find the best of $' + m + '$ settings for a steering gain, with $' + R.pick([5, 10, 20]) + '$ runs for each. Which way of testing gives results you can trust?',
      a: MC('Change one setting at a time and keep everything else the same', ['Change one setting at a time and keep everything else the same', 'Change every setting each run to save time', 'Only record the runs that worked', 'Test each setting once']),
      steps: ['If two things change at once, you cannot tell which one helped. Record every run, the failures too.']
    }; }
    var it = R.pick([
      ['You changed the wheels, the battery and the code at once, and the robot got better. What can you conclude?', 'Not which change helped; change one thing at a time', ['The wheels helped', 'The code helped', 'All three helped equally']],
      ['Your robot worked once in front of friends. Is it done?', 'Not yet; test many runs and record the success rate', ['Yes, once proves it works', 'Yes, if the friends clapped', 'No, robots never work twice']],
      ['A test log should record which runs?', 'Every run, the failures as well as the successes', ['Only the best run', 'Only the runs that worked', 'Only the first run']]]);
    return { q: it[0], a: MC(it[1], it[2]), steps: [it[1] + '.'] };
  });

  // ---------- rbcap.careers (facts from the BLS Occupational Outlook Handbook, 2026 pages)
  var FACTS = [
    ['According to the Bureau of Labor Statistics, what is the typical entry-level education for mechanical engineers, the group that includes robotic engineers?', 'A bachelor\'s degree', ['A high school diploma', 'A six-month online course', 'A doctoral degree']],
    ['According to the Bureau of Labor Statistics, what is the typical entry-level education for electrical and electronics engineers?', 'A bachelor\'s degree', ['A high school diploma', 'A six-month online course', 'No formal education']],
    ['According to the Bureau of Labor Statistics, electro-mechanical and mechatronics technicians, who test and maintain robotic equipment, typically start with what education?', 'An associate\'s degree or a postsecondary certificate', ['A doctoral degree', 'A master\'s degree', 'A law degree']],
    ['What best shows an employer what you can build?', 'A portfolio of finished projects with write-ups, code and test results', ['A list of courses you started', 'A large number of followers', 'A promise to learn quickly']],
    ['What is a realistic outcome of six months of part-time robotics study for an adult starting from scratch?', 'Solid basics and a few finished projects, a step toward further study or a technician role', ['A guaranteed engineering job title', 'Mastery of every part of robotics', 'Nothing useful at all']],
    ['Which of these is a robotics competition for students?', 'FIRST Robotics Competition', ['The Stanley Cup', 'The Pulitzer Prize', 'The Tour de France']]
  ];
  G('rbcap.careers', function (R, ctx) {
    var kind = by(ctx, 'fact', 'fact', R.pick(['fact', 'hours']));
    if (kind === 'hours') { var h = R.pick([5, 8, 10, 12, 15, 20]), wk = R.pick([12, 26, 39, 52]); return {
      q: 'You study robotics $' + h + '$ hours a week for $' + wk + '$ weeks. How many hours is that in all?',
      a: AX(h * wk), unit: 'h', steps: ['$' + h + ' \\times ' + wk + ' = ' + tv(h * wk) + '$ hours. For comparison, one college semester course is often around 135 hours of class and homework.']
    }; }
    var f = R.pick(FACTS);
    return { q: f[0], a: MC(f[1], f[2]), steps: [f[1] + '.'] };
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
