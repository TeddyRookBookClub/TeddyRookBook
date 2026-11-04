/* Robotics Ladder: generators for Sensing and Estimation (course key rbsense), 6 topics.
   Encoders (counts -> turns -> distance), ultrasonic ranging (out and back), IMU tilt and gyro drift, the square-root-of-N
   rule for averaging, one step of a complementary filter, and one update of a one-dimensional Kalman filter. */
(function (ML) {
  'use strict';
  if (!ML) return;
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;
  function fx(x) { return +(+x).toPrecision(12); }
  function sg(x, n) { if (!x || !isFinite(x)) return x; return +(+x).toPrecision(n || 3); }
  function tv(x) { x = fx(x); return Math.abs(x) >= 1000 ? T.commas(x) : String(x); }
  function A(x, n, rtol) { return { t: 'num', v: String(sg(x, n || 3)), rtol: rtol || 0.02 }; }
  function AT(x, tol) { return { t: 'num', v: String(sg(x, 3)), tol: tol }; }
  function AX(x) { return { t: 'num', v: String(fx(x)) }; }
  function MC(c, w) { return U.mc(c, w.filter(function (x) { return x !== c; }), 4); }
  var DEG = 180 / Math.PI;

  // ---------- rbsense.encoders
  G('rbsense.encoders', function (R, ctx) {
    var kind = by(ctx, R.pick(['turns', 'dist']), R.pick(['dist', 'counts']), R.pick(['gear', 'counts', 'dist']));
    var cpr = R.pick([12, 20, 48, 64, 100, 360, 500, 1024]), d = R.pick([4, 5, 6, 6.5, 7, 8, 10]); // wheel diameter in cm
    var turns = R.pick([0.5, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]), counts = cpr * turns, circ = Math.PI * d;
    if (kind === 'turns') return {
      q: 'An encoder gives $' + cpr + '$ counts per turn of the wheel. After a short drive it has counted $' + tv(counts) + '$. How many turns did the wheel make?',
      a: AX(turns), steps: ['$\\text{turns} = \\dfrac{\\text{counts}}{\\text{counts per turn}} = \\dfrac{' + tv(counts) + '}{' + cpr + '} = ' + fx(turns) + '$.']
    };
    if (kind === 'dist') return {
      q: 'A wheel $' + d + '\\ \\text{cm}$ across has an encoder with $' + cpr + '$ counts per turn. The encoder counts $' + tv(counts) + '$. How far did the robot roll, in centimeters?',
      a: A(turns * circ, 3), unit: 'cm',
      steps: ['Turns: $' + tv(counts) + ' \\div ' + cpr + ' = ' + fx(turns) + '$.', 'One turn rolls one circumference: $\\pi d = \\pi \\times ' + d + ' \\approx ' + sg(circ, 4) + '\\ \\text{cm}$.', 'Distance $\\approx ' + fx(turns) + ' \\times ' + sg(circ, 4) + ' \\approx ' + sg(turns * circ, 3) + '\\ \\text{cm}$.'],
      hint: 'Counts give turns; each turn rolls one circumference, π times the diameter.'
    };
    if (kind === 'counts') { var dist = R.pick([50, 100, 120, 150, 200, 250, 300]); var c = dist / circ * cpr; return {
      q: 'You want the robot to roll $' + dist + '\\ \\text{cm}$. Its wheels are $' + d + '\\ \\text{cm}$ across and the encoder gives $' + cpr + '$ counts per wheel turn. About how many counts should the program wait for?',
      a: A(c, 3, 0.02),
      steps: ['Turns needed: $\\dfrac{' + dist + '}{\\pi \\times ' + d + '} \\approx ' + sg(dist / circ, 4) + '$.', 'Counts: $' + sg(dist / circ, 4) + ' \\times ' + cpr + ' \\approx ' + tv(sg(c, 3)) + '$. A program can only count whole ticks, so it would stop at the nearest one.']
    }; }
    var g = R.pick([10, 20, 30, 48, 50, 100]), mcpr = R.pick([7, 12, 14, 16]), mc = mcpr * g * turns;
    return {
      q: 'The encoder sits on the motor shaft, before a $' + g + ':1$ gearbox. It gives $' + mcpr + '$ counts per motor turn. After a drive it reads $' + tv(mc) + '$ counts. How many times did the wheel turn?',
      a: AX(turns),
      steps: ['Counts per wheel turn: $' + mcpr + ' \\times ' + g + ' = ' + tv(mcpr * g) + '$, because the motor turns ' + g + ' times for each wheel turn.', 'Wheel turns: $' + tv(mc) + ' \\div ' + tv(mcpr * g) + ' = ' + fx(turns) + '$.']
    };
  });

  // ---------- rbsense.ultrasonic-ranging
  G('rbsense.ultrasonic-ranging', function (R, ctx) {
    var kind = by(ctx, 'dist', R.pick(['dist', 'time']), R.pick(['temp', 'time', 'dist']));
    var cm = R.int(4, 80) * 5;
    if (kind === 'dist') { var t = R.int(30, 1200) * 10; var dd = 343 * t / 1e6 / 2 * 100; return {
      q: 'An ultrasonic sensor sends a ping and hears the echo $' + tv(t) + '\\ \\mu\\text{s}$ later. Sound travels about $343\\ \\text{m/s}$. How far away is the object, in centimeters?',
      a: A(dd, 3), unit: 'cm',
      steps: ['$' + tv(t) + '\\ \\mu\\text{s} = ' + fx(t / 1e6) + '\\ \\text{s}$.', 'Sound goes there and back: $343 \\times ' + fx(t / 1e6) + ' \\approx ' + sg(343 * t / 1e6, 3) + '\\ \\text{m}$ in all.', 'Halve it: $\\approx ' + sg(343 * t / 1e6 / 2, 3) + '\\ \\text{m} \\approx ' + sg(dd, 3) + '\\ \\text{cm}$.'],
      hint: 'Distance there and back is speed times time; the object is half of that away.'
    }; }
    if (kind === 'time') { var tt = 2 * cm / 100 / 343 * 1e6; return {
      q: 'An object is $' + cm + '\\ \\text{cm}$ from an ultrasonic sensor. With sound at $343\\ \\text{m/s}$, how long after the ping does the echo come back, in microseconds?',
      a: A(tt, 3), unit: 'µs',
      steps: ['The round trip is $2 \\times ' + fx(cm / 100) + ' = ' + fx(2 * cm / 100) + '\\ \\text{m}$.', '$t = \\dfrac{' + fx(2 * cm / 100) + '}{343} \\approx ' + sg(tt / 1e6, 3) + '\\ \\text{s} \\approx ' + tv(sg(tt, 3)) + '\\ \\mu\\text{s}$.']
    }; }
    var T0 = R.pick([0, 5, 10, 15, 25, 30, 35]), v = 331 + 0.6 * T0, t2 = R.pick([2000, 3000, 4000, 5000, 6000]);
    return {
      q: 'The speed of sound in air is about $331 + 0.6\\,T$ meters per second, with $T$ in degrees Celsius. On a $' + T0 + '^\\circ\\text{C}$ day, an echo returns after $' + tv(t2) + '\\ \\mu\\text{s}$. How far is the object, in centimeters?',
      a: A(v * t2 / 1e6 / 2 * 100, 3), unit: 'cm',
      steps: ['$v = 331 + 0.6 \\times ' + T0 + ' = ' + fx(v) + '\\ \\text{m/s}$.', '$d = \\dfrac{v t}{2} = \\dfrac{' + fx(v) + ' \\times ' + fx(t2 / 1e6) + '}{2} \\approx ' + sg(v * t2 / 1e6 / 2, 3) + '\\ \\text{m}$, about $' + sg(v * t2 / 1e4 / 2, 3) + '\\ \\text{cm}$.']
    };
  });

  // ---------- rbsense.imu
  G('rbsense.imu', function (R, ctx) {
    var kind = by(ctx, R.pick(['tilt', 'gyro']), R.pick(['tilt', 'gyro', 'drift']), R.pick(['drift', 'tilt', 'which']));
    if (kind === 'tilt') { var ang = R.int(3, 60), ax = sg(9.81 * Math.sin(ang / DEG), 3), az = sg(9.81 * Math.cos(ang / DEG), 3); return {
      q: 'A robot sits still on a ramp. Its accelerometer reads $a_x = ' + ax + '$ and $a_z = ' + az + '$ (in m/s²). Using $\\theta = \\arctan(a_x / a_z)$, what is the tilt, in degrees?',
      a: AT(Math.atan2(ax, az) * DEG, 0.6), unit: '°',
      steps: ['$\\dfrac{a_x}{a_z} = \\dfrac{' + ax + '}{' + az + '} \\approx ' + sg(ax / az, 3) + '$.', '$\\theta = \\arctan(' + sg(ax / az, 3) + ') \\approx ' + sg(Math.atan2(ax, az) * DEG, 3) + '^\\circ$. This works only while the robot is still: when it speeds up, the accelerometer feels that too.']
    }; }
    if (kind === 'gyro') { var w = R.int(2, 18) * 5, t = R.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6]); return {
      q: 'A gyro reads a steady turn rate of $' + w + '^\\circ$ per second for $' + t + '\\ \\text{s}$. How far has the robot turned, in degrees?',
      a: AX(w * t), unit: '°', steps: ['Angle = rate × time: $' + w + ' \\times ' + t + ' = ' + fx(w * t) + '^\\circ$.']
    }; }
    if (kind === 'drift') { var b = R.pick([0.01, 0.02, 0.05, 0.1, 0.2, 0.5]), mins = R.pick([1, 2, 5, 10, 30]); return {
      q: 'A gyro has a small bias: it reads $' + b + '^\\circ$ per second even when the robot is perfectly still. If the program adds up the gyro alone for $' + mins + '$ minutes, how many degrees of false turn pile up?',
      a: AX(b * 60 * mins), unit: '°',
      steps: ['$' + mins + '$ minutes is $' + 60 * mins + '\\ \\text{s}$.', '$' + b + ' \\times ' + 60 * mins + ' = ' + fx(b * 60 * mins) + '^\\circ$. That is why a gyro angle drifts, and why we blend it with another sensor.']
    }; }
    var it = R.pick([
      ['Which sensor gives a good tilt over a long time, while the robot is still?', 'The accelerometer'],
      ['Which sensor gives smooth, quick changes in angle over a fraction of a second?', 'The gyro'],
      ['Which sensor drifts when you add up its readings for a long time?', 'The gyro'],
      ['Which sensor is fooled when the robot speeds up or bumps?', 'The accelerometer']]);
    return { q: it[0], a: MC(it[1], ['The accelerometer', 'The gyro', 'The wheel encoder']), steps: [it[1] + '. Each sensor is good where the other is weak, which is why robots combine them.'] };
  });

  // ---------- rbsense.noise-averaging
  G('rbsense.noise-averaging', function (R, ctx) {
    var kind = by(ctx, 'shrink', R.pick(['shrink', 'need']), R.pick(['need', 'std', 'shrink']));
    var N = R.pick([4, 9, 16, 25, 36, 49, 64, 100]), s = fx(R.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1]) * Math.sqrt(N));
    if (kind === 'shrink') return {
      q: 'One distance reading has noise with standard deviation $' + s + '\\ \\text{cm}$. If you average $' + N + '$ independent readings, what is the standard deviation of the average?',
      a: AX(s / Math.sqrt(N)), unit: 'cm', steps: ['$\\sigma_{\\text{avg}} = \\dfrac{\\sigma}{\\sqrt{N}} = \\dfrac{' + s + '}{\\sqrt{' + N + '}} = \\dfrac{' + s + '}{' + Math.sqrt(N) + '} = ' + fx(s / Math.sqrt(N)) + '\\ \\text{cm}$.'],
      hint: 'The noise shrinks by the square root of the number of readings, not by the number itself.'
    };
    if (kind === 'need') { var f = R.pick([2, 3, 4, 5, 6, 8, 10]); return {
      q: 'You want to cut a sensor\'s noise to $\\tfrac{1}{' + f + '}$ of one reading\'s by averaging independent readings. How many readings does that take?',
      a: AX(f * f), steps: ['$\\sqrt{N} = ' + f + '$, so $N = ' + f + '^2 = ' + f * f + '$.', 'Halving the noise takes 4 readings, not 2; that is why heavy averaging gets slow.']
    }; }
    var base = R.int(12, 150), d = R.shuffle([-2, -1, 0, 1, 2, R.pick([-1, 1])]).slice(0, 5), xs = d.map(function (z) { return base + z; });
    var m = xs.reduce(function (a, b) { return a + b; }, 0) / 5, v = xs.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / 5;
    return {
      q: 'Five readings of the same distance: $' + xs.join(',\\ ') + '$ cm. What is their mean, in centimeters?',
      a: AX(m), unit: 'cm', steps: ['Add them: $' + xs.join(' + ') + ' = ' + fx(m * 5) + '$.', 'Divide by 5: $' + fx(m) + '\\ \\text{cm}$. Their spread (population standard deviation) is about $' + sg(Math.sqrt(v), 3) + '\\ \\text{cm}$.']
    };
  });

  // ---------- rbsense.complementary-filter
  G('rbsense.complementary-filter', function (R, ctx) {
    var kind = by(ctx, R.pick(['pred', 'step']), 'step', R.pick(['step', 'which']));
    var a = R.pick([0.9, 0.95, 0.96, 0.98]), th = R.int(-20, 20), w = R.pick([-30, -20, -10, 10, 20, 30, 40]), dt = R.pick([0.01, 0.02, 0.05]), acc = th + R.nz(-6, 6);
    var pred = th + w * dt, nw = a * pred + (1 - a) * acc;
    if (kind === 'pred') return {
      q: 'The last angle estimate was $' + th + '^\\circ$. The gyro reads $' + w + '^\\circ/\\text{s}$ and the loop runs every $' + dt + '\\ \\text{s}$. What angle does the gyro predict now?',
      a: AT(pred, 0.01), unit: '°', steps: ['$\\theta + \\omega\\,\\Delta t = ' + th + ' + (' + w + ')(' + dt + ') = ' + fx(pred) + '^\\circ$.']
    };
    if (kind === 'which') return {
      q: 'In $\\theta = \\alpha(\\theta + \\omega\\,\\Delta t) + (1 - \\alpha)\\,\\theta_{\\text{acc}}$ with $\\alpha = ' + a + '$, which sensor gets the larger weight on each step?',
      a: MC('The gyro', ['The gyro', 'The accelerometer', 'They get equal weight']),
      steps: ['The gyro\'s prediction is multiplied by $\\alpha = ' + a + '$; the accelerometer only by $' + fx(1 - a) + '$.', 'Over many steps the small accelerometer share still wins out, so the gyro\'s drift cannot pile up.']
    };
    return {
      q: 'A complementary filter uses $\\alpha = ' + a + '$. Last estimate $' + th + '^\\circ$, gyro $' + w + '^\\circ/\\text{s}$, $\\Delta t = ' + dt + '\\ \\text{s}$, accelerometer angle $' + acc + '^\\circ$. What is the new estimate, in degrees?',
      a: AT(nw, 0.02), unit: '°',
      steps: ['Gyro prediction: $' + th + ' + (' + w + ')(' + dt + ') = ' + fx(pred) + '^\\circ$.', 'Blend: $' + a + ' \\times ' + fx(pred) + ' + ' + fx(1 - a) + ' \\times ' + acc + ' \\approx ' + sg(nw, 4) + '^\\circ$.']
    };
  });

  // ---------- rbsense.kalman-1d
  G('rbsense.kalman-1d', function (R, ctx) {
    var kind = by(ctx, 'gain', R.pick(['gain', 'est']), R.pick(['est', 'var', 'trust']));
    var P = R.pick([1, 2, 4, 5, 8, 9, 10, 16]), Rn = R.pick([1, 2, 4, 5, 8, 10, 16]), K = P / (P + Rn);
    var x = R.pick([100, 120, 150, 200, 250]), z = x + R.nz(-12, 12);
    if (kind === 'gain') return {
      q: 'A one-dimensional Kalman filter has prediction variance $P = ' + P + '$ and measurement variance $R = ' + Rn + '$. What is the gain $K = P/(P + R)$?',
      a: AT(K, 0.005), steps: ['$K = \\dfrac{' + P + '}{' + P + ' + ' + Rn + '} = \\dfrac{' + P + '}{' + (P + Rn) + '} \\approx ' + sg(K, 3) + '$.', K > 0.5 ? 'More than one half: the measurement is trusted more than the prediction.' : K < 0.5 ? 'Less than one half: the prediction is trusted more than the measurement.' : 'Exactly one half: both are trusted equally.']
    };
    if (kind === 'est') { var nx = x + K * (z - x); return {
      q: 'The filter predicts the cart is at $' + x + '\\ \\text{cm}$ with variance $P = ' + P + '$. A sensor with variance $R = ' + Rn + '$ reads $' + z + '\\ \\text{cm}$. What is the new estimate, in centimeters?',
      a: AT(nx, 0.05), unit: 'cm',
      steps: ['$K = \\dfrac{' + P + '}{' + (P + Rn) + '} \\approx ' + sg(K, 3) + '$.', 'Innovation: $z - x = ' + z + ' - ' + x + ' = ' + (z - x) + '$.', 'New estimate: $' + x + ' + ' + sg(K, 3) + ' \\times (' + (z - x) + ') \\approx ' + sg(nx, 5) + '\\ \\text{cm}$. It lands between the two, closer to the one trusted more.']
    }; }
    if (kind === 'var') return {
      q: 'Prediction variance $P = ' + P + '$, measurement variance $R = ' + Rn + '$. After the update, what is the new variance $(1 - K)P$?',
      a: AT((1 - K) * P, 0.01), steps: ['$K = ' + P + '/' + (P + Rn) + '$.', '$(1 - K)P = \\dfrac{' + Rn + '}{' + (P + Rn) + '} \\times ' + P + ' = \\dfrac{' + P * Rn + '}{' + (P + Rn) + '} \\approx ' + sg((1 - K) * P, 3) + '$.', 'It is smaller than both $P$ and $R$: two pieces of evidence together beat either one alone.']
    };
    var bigR = R.coin();
    return {
      q: 'A Kalman filter\'s sensor gets ' + (bigR ? 'much noisier (its variance $R$ grows)' : 'much more precise (its variance $R$ shrinks)') + '. What happens to the gain $K$?',
      a: MC(bigR ? 'K gets smaller: trust the measurement less' : 'K gets larger: trust the measurement more', ['K gets smaller: trust the measurement less', 'K gets larger: trust the measurement more', 'K stays the same']),
      steps: ['$K = P/(P + R)$. ' + (bigR ? 'A bigger $R$ makes the bottom bigger, so $K$ shrinks.' : 'A smaller $R$ makes the bottom smaller, so $K$ grows toward 1.')]
    };
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
