/* Robotics Ladder: generators for Mechanics and Motion (course key rbmech), 6 topics. g = 9.8 m/s^2. Angles in degrees
   unless a problem says radians; inverse kinematics uses the elbow-down solution (θ2 > 0) unless it says otherwise. */
(function (ML) {
  'use strict';
  if (!ML) return;
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;
  var PI = Math.PI, DEG = PI / 180;
  function fx(x) { return +(+x).toPrecision(12); }
  function sg(x, n) { if (!x || !isFinite(x)) return x; return +(+x).toPrecision(n || 3); }
  function tv(x) { x = fx(x); return Math.abs(x) >= 1000 ? T.commas(x) : String(x); }
  function A(x, n, rtol) { return { t: 'num', v: String(sg(x, n || 3)), rtol: rtol || 0.02 }; }
  function AT(x, tol) { return { t: 'num', v: String(sg(x, 3)), tol: tol }; }
  function AX(x) { return { t: 'num', v: String(fx(x)) }; }
  function MC(c, w) { return U.mc(c, w.filter(function (x) { return x !== c; }), 4); }
  function cd(a) { return Math.cos(a * DEG); }
  function sd(a) { return Math.sin(a * DEG); }
  function term(c, f, first) { // " + 2\cos(30^\circ)", " - \sin(30^\circ)", "" for 0
    if (!c) return ''; var a = Math.abs(c), body = (a === 1 ? '' : a) + f;
    return first ? (c < 0 ? '-' : '') + body : (c < 0 ? ' - ' : ' + ') + body;
  }
  function plus(v) { var y = sg(v, 3); return Math.abs(y) < 5e-4 ? '' : (y < 0 ? ' - ' + (-y) : ' + ' + y); }
  function s3(x) { var y = sg(x, 3); return Math.abs(y) < 5e-4 ? '0' : String(y); }

  // ---------- rbmech.gears
  G('rbmech.gears', function (R, ctx) {
    var kind = by(ctx, R.pick(['speed', 'ratio']), R.pick(['speed', 'torque', 'ratio']), R.pick(['torque', 'two', 'speed']));
    var t1 = R.pick([8, 10, 12, 15, 16, 20]), t2 = t1 * R.pick([2, 3, 4, 5]) + R.pick([0, 0, 4, 8]), rpm = R.pick([60, 90, 120, 150, 200, 240, 300, 600]);
    if (kind === 'ratio') return {
      q: 'A $' + t1 + '$-tooth gear on the motor drives a $' + t2 + '$-tooth gear on the wheel. What is the gear ratio (driven teeth ÷ driver teeth)?',
      a: A(t2 / t1, 3), steps: ['$\\dfrac{' + t2 + '}{' + t1 + '} = ' + fx(sg(t2 / t1, 4)) + '$.', 'The wheel turns that many times slower, and with that many times the torque.']
    };
    if (kind === 'speed') return {
      q: 'A motor spins a $' + t1 + '$-tooth gear at $' + rpm + '$ rpm. It meshes with a $' + t2 + '$-tooth gear. How fast does the big gear turn, in rpm?',
      a: A(rpm * t1 / t2, 3), unit: 'rpm', steps: ['Each tooth that passes moves both gears by one tooth, so speed × teeth is the same for both.', '$' + rpm + ' \\times \\dfrac{' + t1 + '}{' + t2 + '} \\approx ' + s3(rpm * t1 / t2) + '$ rpm.']
    };
    var tq = R.pick([0.05, 0.1, 0.15, 0.2, 0.3, 0.5]);
    if (kind === 'torque') return {
      q: 'A motor gives $' + tq + '\\ \\text{N}\\cdot\\text{m}$ of torque to a $' + t1 + '$-tooth gear that drives a $' + t2 + '$-tooth gear. Ignoring friction, what torque does the big gear give?',
      a: A(tq * t2 / t1, 3), unit: 'N·m', steps: ['Torque goes up by the ratio $\\dfrac{' + t2 + '}{' + t1 + '}$.', '$' + tq + ' \\times \\dfrac{' + t2 + '}{' + t1 + '} \\approx ' + s3(tq * t2 / t1) + '\\ \\text{N}\\cdot\\text{m}$. Real gears lose some to friction, so expect a little less.']
    };
    var a2 = R.pick([10, 12, 15]), b2 = a2 * R.pick([2, 3, 4]), total = (t2 / t1) * (b2 / a2);
    return {
      q: 'A gearbox has two stages: $' + t1 + '$ teeth driving $' + t2 + '$, then on the same shaft $' + a2 + '$ teeth driving $' + b2 + '$. The motor turns at $' + rpm * 10 + '$ rpm. How fast does the output turn, in rpm?',
      a: A(rpm * 10 / total, 3), unit: 'rpm', steps: ['Stage ratios multiply: $\\dfrac{' + t2 + '}{' + t1 + '} \\times \\dfrac{' + b2 + '}{' + a2 + '} \\approx ' + s3(total) + '$.', '$\\dfrac{' + tv(rpm * 10) + '}{' + s3(total) + '} \\approx ' + s3(rpm * 10 / total) + '$ rpm.']
    };
  });

  // ---------- rbmech.torque-motors
  G('rbmech.torque-motors', function (R, ctx) {
    var kind = by(ctx, 'need', R.pick(['need', 'servo', 'kgcm']), R.pick(['servo', 'margin', 'kgcm']));
    var m = R.pick([50, 80, 100, 120, 150, 200, 250, 300, 350, 400, 500, 600]), L = R.pick([4, 5, 6, 8, 10, 12, 15, 18, 20, 25, 30]);
    var need = m / 1000 * 9.8 * L / 100;
    if (kind === 'need') return {
      q: 'A robot arm holds a $' + m + '\\ \\text{g}$ load straight out, $' + L + '\\ \\text{cm}$ from the shoulder. Ignoring the arm\'s own weight, what torque must the shoulder give, in newton-meters?',
      a: A(need, 3), unit: 'N·m', steps: ['Weight: $F = mg = ' + fx(m / 1000) + ' \\times 9.8 = ' + fx(m / 1000 * 9.8) + '\\ \\text{N}$.', 'Torque: $\\tau = F L = ' + fx(m / 1000 * 9.8) + ' \\times ' + fx(L / 100) + ' \\approx ' + s3(need) + '\\ \\text{N}\\cdot\\text{m}$.']
    };
    if (kind === 'kgcm') { var kc = R.pick([1.5, 2, 2.5, 3, 4, 5, 10, 15, 20]); return {
      q: 'Hobby servos are often rated in kilogram-centimeters: the mass in kg they can hold 1 cm from the shaft. What is $' + kc + '\\ \\text{kg}\\cdot\\text{cm}$ in newton-meters?',
      a: A(kc * 9.8 / 100, 3), unit: 'N·m', steps: ['$1\\ \\text{kg}\\cdot\\text{cm}$ is the torque of $9.8\\ \\text{N}$ at $0.01\\ \\text{m}$: $0.098\\ \\text{N}\\cdot\\text{m}$.', '$' + kc + ' \\times 0.098 \\approx ' + s3(kc * 0.098) + '\\ \\text{N}\\cdot\\text{m}$.']
    }; }
    if (kind === 'servo') { var rate = R.pick([1.5, 2, 3, 4, 6, 10]), loadkc = m / 1000 * L, ok = loadkc <= rate; return {
      q: 'A servo is rated $' + rate + '\\ \\text{kg}\\cdot\\text{cm}$. Can it hold a $' + m + '\\ \\text{g}$ load $' + L + '\\ \\text{cm}$ from its shaft (ignoring the arm\'s weight)?',
      a: { t: 'tf', v: ok }, steps: ['Load torque: $' + fx(m / 1000) + '\\ \\text{kg} \\times ' + L + '\\ \\text{cm} = ' + fx(loadkc) + '\\ \\text{kg}\\cdot\\text{cm}$.', ok ? fx(loadkc) + ' is within ' + rate + ', so yes, though with little margin a stronger servo is wiser.' : fx(loadkc) + ' is more than ' + rate + ', so no.']
    }; }
    var sf = R.pick([1.5, 2, 3]);
    return {
      q: 'An arm must hold $' + m + '\\ \\text{g}$ at $' + L + '\\ \\text{cm}$. You want a safety factor of $' + sf + '$ (the motor should be ' + sf + ' times as strong as needed). What rating do you look for, in kg·cm?',
      a: A(m / 1000 * L * sf, 3), unit: 'kg·cm', steps: ['Needed: $' + fx(m / 1000) + ' \\times ' + L + ' = ' + fx(m / 1000 * L) + '\\ \\text{kg}\\cdot\\text{cm}$.', 'Times ' + sf + ': $' + fx(m / 1000 * L * sf) + '\\ \\text{kg}\\cdot\\text{cm}$. Motors are weaker when they speed up or when the battery runs low, so the margin matters.']
    };
  });

  // ---------- rbmech.wheel-speed
  G('rbmech.wheel-speed', function (R, ctx) {
    var kind = by(ctx, R.pick(['omega', 'speed']), R.pick(['speed', 'omega', 'rpm']), R.pick(['rpm', 'dist', 'speed']));
    var rpm = R.pick([30, 40, 45, 50, 60, 75, 80, 90, 100, 120, 150, 180, 200, 240, 300]), rcm = R.pick([2, 2.5, 3, 3.25, 3.5, 4, 4.5, 5, 6, 6.5, 7.5]);
    var w = rpm * 2 * PI / 60, v = w * rcm / 100;
    if (kind === 'omega') return {
      q: 'A wheel turns at $' + rpm + '$ rpm. What is its angular speed in radians per second?',
      a: A(w, 3), unit: 'rad/s', steps: ['One turn is $2\\pi$ radians and a minute is 60 seconds.', '$\\omega = ' + rpm + ' \\times \\dfrac{2\\pi}{60} \\approx ' + s3(w) + '\\ \\text{rad/s}$.']
    };
    if (kind === 'speed') return {
      q: 'A robot\'s wheels have radius $' + rcm + '\\ \\text{cm}$ and turn at $' + rpm + '$ rpm. How fast does the robot roll, in meters per second?',
      a: A(v, 3), unit: 'm/s', steps: ['$\\omega = ' + rpm + ' \\times \\dfrac{2\\pi}{60} \\approx ' + s3(w) + '\\ \\text{rad/s}$.', '$v = \\omega r = ' + s3(w) + ' \\times ' + fx(rcm / 100) + ' \\approx ' + s3(v) + '\\ \\text{m/s}$.']
    };
    if (kind === 'rpm') { var vv = R.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1]); var need = vv / (rcm / 100) * 60 / (2 * PI); return {
      q: 'You want a robot with $' + rcm + '\\ \\text{cm}$-radius wheels to drive at $' + vv + '\\ \\text{m/s}$. How many rpm must the wheels turn?',
      a: A(need, 3), unit: 'rpm', steps: ['$\\omega = \\dfrac{v}{r} = \\dfrac{' + vv + '}{' + fx(rcm / 100) + '} \\approx ' + s3(vv / (rcm / 100)) + '\\ \\text{rad/s}$.', '$\\text{rpm} = \\omega \\times \\dfrac{60}{2\\pi} \\approx ' + s3(need) + '$.']
    }; }
    var t = R.int(3, 20);
    return {
      q: 'Wheels of radius $' + rcm + '\\ \\text{cm}$ turn at $' + rpm + '$ rpm for $' + t + '$ seconds without slipping. How far does the robot go, in meters?',
      a: A(v * t, 3), unit: 'm', steps: ['$v = ' + rpm + ' \\cdot \\dfrac{2\\pi}{60} \\cdot ' + fx(rcm / 100) + ' \\approx ' + s3(v) + '\\ \\text{m/s}$.', '$d = vt \\approx ' + s3(v) + ' \\times ' + t + ' \\approx ' + s3(v * t) + '\\ \\text{m}$.']
    };
  });

  // ---------- rbmech.coordinate-frames
  var ANG = [0, 30, 45, 60, 90, 120, 135, 150, 180, -30, -45, -60, -90, -120, -150];
  G('rbmech.coordinate-frames', function (R, ctx) {
    var kind = by(ctx, 'ahead', R.pick(['ahead', 'full']), R.pick(['full', 'back']));
    var x = R.int(0, 8), y = R.int(0, 6), th = R.pick(ANG), px = R.int(1, 4), py = kind === 'ahead' ? 0 : R.int(-3, 3) || 1;
    var wx = x + px * cd(th) - py * sd(th), wy = y + px * sd(th) + py * cd(th), ask = R.pick(['x', 'y']);
    if (kind === 'back') {
      // world point to robot frame: rotate the difference by -θ
      var gx = R.int(0, 9), gy = R.int(0, 7), dx = gx - x, dy = gy - y, rx = dx * cd(th) + dy * sd(th), ry = -dx * sd(th) + dy * cd(th);
      return {
        q: 'A robot is at $(' + x + ', ' + y + ')$ m with heading $\\theta = ' + th + '^\\circ$. A ball is at $(' + gx + ', ' + gy + ')$ m on the map. What is the ball\'s ' + ask + '-coordinate in the robot\'s own frame (x forward, y left)?',
        a: AT(ask === 'x' ? rx : ry, 0.02), unit: 'm',
        steps: ['Shift first: $(\\Delta x, \\Delta y) = (' + dx + ', ' + dy + ')$.', 'Then rotate by $-\\theta$: $x_r = \\Delta x \\cos\\theta + \\Delta y \\sin\\theta$, $y_r = -\\Delta x \\sin\\theta + \\Delta y \\cos\\theta$.', '$x_r \\approx ' + s3(rx) + '$, $y_r \\approx ' + s3(ry) + '$ m.']
      };
    }
    return {
      q: 'A robot is at $(' + x + ', ' + y + ')$ m on the map, heading $\\theta = ' + th + '^\\circ$ (measured counterclockwise from the map\'s x-axis). Its sensor sees an object at $(' + px + ', ' + py + ')$ m in the robot\'s frame (x forward, y left). What is the object\'s ' + ask + '-coordinate on the map?',
      a: AT(ask === 'x' ? wx : wy, 0.02), unit: 'm',
      steps: ['Rotate by $\\theta$, then shift by the robot\'s position:', '$x = x_0 + x_r\\cos\\theta - y_r\\sin\\theta = ' + x + term(px, '\\cos(' + th + '^\\circ)') + term(-py, '\\sin(' + th + '^\\circ)') + ' \\approx ' + s3(wx) + '$', '$y = y_0 + x_r\\sin\\theta + y_r\\cos\\theta = ' + y + term(px, '\\sin(' + th + '^\\circ)') + term(py, '\\cos(' + th + '^\\circ)') + ' \\approx ' + s3(wy) + '$']
    };
  });

  // ---------- rbmech.forward-kinematics
  G('rbmech.forward-kinematics', function (R, ctx) {
    var l1 = R.pick([8, 10, 12, 15, 20]), l2 = R.pick([5, 6, 8, 10, 12]), t1 = R.pick([0, 15, 30, 45, 60, 75, 90, 120]), t2 = R.pick([-90, -60, -45, -30, 30, 45, 60, 90, 120]);
    var kind = by(ctx, 'elbow', R.pick(['hand', 'elbow']), R.pick(['hand', 'reach']));
    var ex = l1 * cd(t1), ey = l1 * sd(t1), hx = ex + l2 * cd(t1 + t2), hy = ey + l2 * sd(t1 + t2), ask = R.pick(['x', 'y']);
    if (kind === 'elbow') return {
      q: 'A two-link arm has an upper link of $' + l1 + '\\ \\text{cm}$ at shoulder angle $\\theta_1 = ' + t1 + '^\\circ$. What is the ' + ask + '-coordinate of the elbow, in cm?',
      a: AT(ask === 'x' ? ex : ey, 0.05), unit: 'cm', steps: ['$x_e = L_1 \\cos\\theta_1$, $y_e = L_1 \\sin\\theta_1$.', ask === 'x' ? '$' + l1 + '\\cos ' + t1 + '^\\circ \\approx ' + s3(ex) + '$ cm.' : '$' + l1 + '\\sin ' + t1 + '^\\circ \\approx ' + s3(ey) + '$ cm.']
    };
    if (kind === 'reach') { var d = Math.hypot(hx, hy), lc = Math.sqrt(l1 * l1 + l2 * l2 + 2 * l1 * l2 * cd(t2)); return {
      q: 'A two-link arm has $L_1 = ' + l1 + '$ cm and $L_2 = ' + l2 + '$ cm with elbow angle $\\theta_2 = ' + t2 + '^\\circ$. How far is the hand from the shoulder, in cm? (The shoulder angle does not matter.)',
      a: AT(lc, 0.05), unit: 'cm', steps: ['Law of cosines on the triangle shoulder-elbow-hand. The angle inside the triangle at the elbow is $180^\\circ - \\theta_2$, so $d^2 = L_1^2 + L_2^2 + 2L_1L_2\\cos\\theta_2$.', '$d^2 = ' + l1 * l1 + ' + ' + l2 * l2 + ' + ' + 2 * l1 * l2 + '\\cos(' + t2 + '^\\circ) \\approx ' + s3(lc * lc) + '$, so $d \\approx ' + s3(lc) + '$ cm.']
    }; }
    return {
      q: 'A two-link arm has $L_1 = ' + l1 + '$ cm and $L_2 = ' + l2 + '$ cm. The shoulder is at $\\theta_1 = ' + t1 + '^\\circ$ and the elbow at $\\theta_2 = ' + t2 + '^\\circ$ (measured from the first link). What is the ' + ask + '-coordinate of the hand, in cm?',
      a: AT(ask === 'x' ? hx : hy, 0.05), unit: 'cm',
      steps: ['The second link points at $\\theta_1 + \\theta_2 = ' + (t1 + t2) + '^\\circ$ from the x-axis.', ask === 'x' ? '$x = ' + l1 + '\\cos ' + t1 + '^\\circ + ' + l2 + '\\cos(' + (t1 + t2) + '^\\circ) \\approx ' + s3(ex) + plus(l2 * cd(t1 + t2)) + ' \\approx ' + s3(hx) + '$ cm.' : '$y = ' + l1 + '\\sin ' + t1 + '^\\circ + ' + l2 + '\\sin(' + (t1 + t2) + '^\\circ) \\approx ' + s3(ey) + plus(l2 * sd(t1 + t2)) + ' \\approx ' + s3(hy) + '$ cm.'],
    };
  });

  // ---------- rbmech.inverse-kinematics
  G('rbmech.inverse-kinematics', function (R, ctx) {
    var kind = by(ctx, R.pick(['reach', 't2']), R.pick(['t2', 'reach', 't1']), R.pick(['t1', 't2']));
    var l1 = R.pick([8, 10, 12]), l2 = R.pick([6, 8, 10]), x, y, d;
    if (kind === 'reach') {
      x = R.int(-22, 22); y = R.int(0, 22); d = Math.hypot(x, y); var ok = d <= l1 + l2 && d >= Math.abs(l1 - l2);
      return {
        q: 'A two-link arm has $L_1 = ' + l1 + '$ cm and $L_2 = ' + l2 + '$ cm. Can its hand reach the point $(' + x + ', ' + y + ')$ cm?',
        a: { t: 'tf', v: ok }, steps: ['Distance from the shoulder: $\\sqrt{' + T.p(x) + '^2 + ' + y + '^2} \\approx ' + s3(d) + '$ cm.', 'It can reach from $|L_1 - L_2| = ' + Math.abs(l1 - l2) + '$ to $L_1 + L_2 = ' + (l1 + l2) + '$ cm, so ' + (ok ? 'yes.' : 'no.')]
      };
    }
    // pick a reachable target from real angles
    var a1 = R.pick([10, 20, 30, 40, 50, 60, 70]), a2 = R.pick([30, 45, 60, 75, 90, 105, 120]);
    x = Math.round((l1 * cd(a1) + l2 * cd(a1 + a2)) * 10) / 10; y = Math.round((l1 * sd(a1) + l2 * sd(a1 + a2)) * 10) / 10;
    var c2 = (x * x + y * y - l1 * l1 - l2 * l2) / (2 * l1 * l2); c2 = Math.max(-1, Math.min(1, c2));
    var t2 = Math.acos(c2) / DEG, t1 = (Math.atan2(y, x) - Math.atan2(l2 * sd(t2), l1 + l2 * cd(t2))) / DEG;
    if (kind === 't2') return {
      q: 'A two-link arm has $L_1 = ' + l1 + '$ cm and $L_2 = ' + l2 + '$ cm. The hand must reach $(' + x + ', ' + y + ')$ cm. Find the elbow angle $\\theta_2$ for the elbow-down solution (positive $\\theta_2$), in degrees.',
      a: AT(t2, 0.6), unit: '°', steps: ['$\\cos\\theta_2 = \\dfrac{x^2 + y^2 - L_1^2 - L_2^2}{2L_1L_2} = \\dfrac{' + s3(x * x + y * y) + ' - ' + l1 * l1 + ' - ' + l2 * l2 + '}{' + 2 * l1 * l2 + '} \\approx ' + s3(c2) + '$.', '$\\theta_2 = \\arccos(' + s3(c2) + ') \\approx ' + s3(t2) + '^\\circ$. The elbow-up answer is $-' + s3(t2) + '^\\circ$.'],
      nolint: ['--']
    };
    return {
      q: 'A two-link arm has $L_1 = ' + l1 + '$ cm and $L_2 = ' + l2 + '$ cm. To reach $(' + x + ', ' + y + ')$ cm with the elbow down, $\\theta_2 \\approx ' + s3(t2) + '^\\circ$. Find the shoulder angle $\\theta_1$, in degrees.',
      a: AT(t1, 0.6), unit: '°', steps: ['$\\theta_1 = \\operatorname{atan2}(y, x) - \\operatorname{atan2}(L_2 \\sin\\theta_2, L_1 + L_2\\cos\\theta_2)$.', '$\\operatorname{atan2}(' + y + ', ' + x + ') \\approx ' + s3(Math.atan2(y, x) / DEG) + '^\\circ$ and $\\operatorname{atan2}(' + s3(l2 * sd(t2)) + ', ' + s3(l1 + l2 * cd(t2)) + ') \\approx ' + s3(Math.atan2(l2 * sd(t2), l1 + l2 * cd(t2)) / DEG) + '^\\circ$.', '$\\theta_1 \\approx ' + s3(t1) + '^\\circ$.']
    };
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
