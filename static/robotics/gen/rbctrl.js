/* Robotics Ladder: generators for Feedback and Control (course key rbctrl), 5 topics.
   Error e = setpoint - measurement. Discrete PID: u = Kp e + Ki I + Kd (e - e_prev)/dt, with I the running sum of e dt. */
(function (ML) {
  'use strict';
  if (!ML) return;
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;
  function fx(x) { return +(+x).toPrecision(12); }
  function sg(x, n) { if (!x || !isFinite(x)) return x; return +(+x).toPrecision(n || 3); }
  function s3(x) { var y = sg(x, 3); return Math.abs(y) < 5e-4 ? '0' : String(y); }
  function A(x, n, rtol) { return { t: 'num', v: String(sg(x, n || 3)), rtol: rtol || 0.02 }; }
  function AT(x, tol) { return { t: 'num', v: String(sg(x, 3)), tol: tol }; }
  function AX(x) { return { t: 'num', v: String(fx(x)) }; }
  function MC(c, w) { return U.mc(c, w.filter(function (x) { return x !== c; }), 4); }
  function P(x) { return T.p(fx(x)); }

  // ---------- rbctrl.open-closed-loop
  var SYS = [
    ['A toaster that runs its heater for a set number of minutes', false], ['A thermostat that turns the furnace on when the room is below the set temperature', true],
    ['A robot that drives forward for exactly 3 seconds, then stops', false], ['A robot that drives until its encoder count says it has gone 1 meter', true],
    ['A sprinkler on a timer', false], ['A line follower that steers by its light sensors', true],
    ['A servo that reads its own angle sensor and corrects until it matches the command', true], ['A fan set to medium speed', false],
    ['A drone that holds its height using a distance sensor', true], ['A washing machine that runs a fixed cycle', false],
    ['A cruise control that adds throttle when the measured speed drops', true], ['A motor given a fixed PWM duty cycle with no sensor', false]
  ];
  G('rbctrl.open-closed-loop', function (R, ctx) {
    var kind = by(ctx, R.pick(['err', 'which']), R.pick(['err', 'which', 'sign']), R.pick(['sign', 'which', 'err']));
    if (kind === 'which') { var s = R.pick(SYS); return {
      q: s[0] + '. Is this open loop or closed loop?', a: MC(s[1] ? 'Closed loop' : 'Open loop', ['Open loop', 'Closed loop']),
      steps: [s[1] ? 'It measures the result and corrects, so it is closed loop.' : 'It runs a fixed command without measuring the result, so it is open loop.']
    }; }
    var sp = R.pick([20, 25, 30, 45, 60, 90, 100, 120, 150]), meas = Math.max(0, sp + R.nz(-15, 15) * R.pick([1, 2]));
    var e = sp - meas, what = R.pick([['a shaft angle', '°'], ['a speed', 'rpm'], ['a distance', 'cm']]);
    if (kind === 'err') return {
      q: 'The setpoint for ' + what[0] + ' is $' + sp + '$ ' + what[1] + ' and the sensor reads $' + meas + '$ ' + what[1] + '. What is the error, setpoint minus measurement?',
      a: AX(e), steps: ['$e = ' + sp + ' - ' + meas + ' = ' + e + '$ ' + what[1] + '.', e > 0 ? 'Positive: the system is short of the setpoint and needs a push up.' : 'Negative: the system has gone past the setpoint and needs a push down.']
    };
    return {
      q: 'The setpoint is $' + sp + '$ and the sensor reads $' + meas + '$. Which way should a proportional controller push?',
      a: MC(e > 0 ? 'Up, toward larger values' : 'Down, toward smaller values', ['Up, toward larger values', 'Down, toward smaller values', 'Not at all']),
      steps: ['$e = ' + sp + ' - ' + meas + ' = ' + e + '$.', 'The command has the same sign as the error, so it pushes ' + (e > 0 ? 'up.' : 'down.')]
    };
  });

  // ---------- rbctrl.p-control
  G('rbctrl.p-control', function (R, ctx) {
    var kind = by(ctx, 'u', R.pick(['u', 'sat']), R.pick(['sat', 'kp']));
    var kp = R.pick([0.5, 0.8, 1, 1.5, 2, 2.5, 3, 4, 5]), sp = R.int(10, 90), meas = R.int(0, 100), e = sp - meas, umax = R.pick([50, 100, 255]);
    if (kind === 'u') return {
      q: 'A proportional controller has $K_p = ' + kp + '$. Setpoint $' + sp + '$, measurement $' + meas + '$. What command $u = K_p e$ does it send?',
      a: AT(kp * e, 0.01), steps: ['$e = ' + sp + ' - ' + meas + ' = ' + e + '$.', '$u = ' + kp + ' \\times ' + P(e) + ' = ' + fx(kp * e) + '$.']
    };
    if (kind === 'sat') { kp = R.pick([3, 4, 5, 6, 8, 10]); var raw = kp * e, u = Math.max(-umax, Math.min(umax, raw)); return {
      q: 'A motor accepts commands from $-' + umax + '$ to $' + umax + '$; anything beyond is clipped. With $K_p = ' + kp + '$, setpoint $' + sp + '$ and measurement $' + meas + '$, what command actually reaches the motor?',
      a: AT(u, 0.01), steps: ['$u = ' + kp + ' \\times ' + P(e) + ' = ' + fx(raw) + '$.', Math.abs(raw) > umax ? 'That is past the limit, so it is clipped to $' + u + '$. The motor is saturated: it is already giving all it can.' : 'That is within the limit, so it goes through unchanged.']
    }; }
    var want = R.pick([20, 40, 50, 60, 80, 100]); e = R.nz(-25, 25);
    return {
      q: 'At an error of $' + e + '$, you want a command of $' + (e > 0 ? want : -want) + '$. What $K_p$ does that take?',
      a: AT(want / Math.abs(e), 0.01), steps: ['$K_p = \\dfrac{u}{e} = \\dfrac{' + (e > 0 ? want : -want) + '}{' + e + '} \\approx ' + s3(want / Math.abs(e)) + '$.']
    };
  });

  // ---------- rbctrl.pid-step
  G('rbctrl.pid-step', function (R, ctx) {
    var kind = by(ctx, R.pick(['ponly', 'pd']), R.pick(['pd', 'pid']), 'pid');
    var kp = R.pick([1, 1.5, 2, 3, 4]), ki = R.pick([0.2, 0.5, 1, 2]), kd = R.pick([0.05, 0.1, 0.2, 0.5]), dt = R.pick([0.01, 0.02, 0.05, 0.1]);
    var e0 = R.int(4, 20), e1 = e0 - R.int(1, 3), I0 = R.int(0, 40) / 10;
    var I1 = I0 + e1 * dt, d = (e1 - e0) / dt;
    if (kind === 'ponly') { var ui = kp * e1 + ki * I1; return {
      q: 'A PI controller has $K_p = ' + kp + '$ and $K_i = ' + ki + '$, running every $\\Delta t = ' + dt + '\\ \\text{s}$. The integral so far is $' + I0 + '$. This step the error is $' + e1 + '$. Update the integral, then find $u = K_p e + K_i I$.',
      a: AT(ui, 0.02), steps: ['$I = ' + I0 + ' + ' + e1 + ' \\times ' + dt + ' = ' + fx(I1) + '$.', '$u = ' + kp + ' \\times ' + e1 + ' + ' + ki + ' \\times ' + fx(I1) + ' \\approx ' + s3(ui) + '$.']
    }; }
    if (kind === 'pd') { var upd = kp * e1 + kd * d; return {
      q: 'A PD controller has $K_p = ' + kp + '$ and $K_d = ' + kd + '$ and runs every $' + dt + '\\ \\text{s}$. The error was $' + e0 + '$ last step and is $' + e1 + '$ now. Find $u = K_p e + K_d \\dfrac{\\Delta e}{\\Delta t}$.',
      a: AT(upd, 0.02), steps: ['$\\dfrac{\\Delta e}{\\Delta t} = \\dfrac{' + e1 + ' - ' + e0 + '}{' + dt + '} = ' + fx(d) + '$.', '$u = ' + kp + ' \\times ' + e1 + ' + ' + kd + ' \\times ' + P(d) + ' \\approx ' + s3(upd) + '$. The error is shrinking, so the D term brakes.'],
      nolint: ['+ -']
    }; }
    var u = kp * e1 + ki * I1 + kd * d;
    return {
      q: 'A PID controller has $K_p = ' + kp + '$, $K_i = ' + ki + '$, $K_d = ' + kd + '$ and runs every $' + dt + '\\ \\text{s}$. Last step the error was $' + e0 + '$ and the integral was $' + I0 + '$. Now the error is $' + e1 + '$. What is the new command $u$?',
      a: AT(u, 0.02),
      steps: ['P: $' + kp + ' \\times ' + e1 + ' = ' + fx(kp * e1) + '$.', 'I: the integral becomes $' + I0 + ' + ' + e1 + ' \\times ' + dt + ' = ' + fx(I1) + '$, times ' + ki + ' gives $' + s3(ki * I1) + '$.', 'D: $\\dfrac{' + e1 + ' - ' + e0 + '}{' + dt + '} = ' + fx(d) + '$, times ' + kd + ' gives $' + s3(kd * d) + '$.', 'Add: $u \\approx ' + s3(u) + '$.']
    };
  });

  // ---------- rbctrl.first-order-response
  G('rbctrl.first-order-response', function (R, ctx) {
    var kind = by(ctx, R.pick(['63', 'settle']), R.pick(['value', 'settle', 'tau']), R.pick(['value', 'tau', 'time']));
    var tau = R.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5]), fin = R.pick([100, 120, 150, 180, 200, 240, 250, 300, 60, 80, 90]);
    if (kind === '63') return {
      q: 'A motor\'s speed rises toward $' + fin + '$ rpm like a first-order system with time constant $\\tau = ' + tau + '\\ \\text{s}$. About what speed has it reached after one time constant?',
      a: A(fin * (1 - Math.exp(-1)), 3, 0.02), unit: 'rpm', steps: ['After one time constant, $1 - e^{-1} \\approx 0.632$ of the way.', '$0.632 \\times ' + fin + ' \\approx ' + s3(fin * 0.632) + '$ rpm.']
    };
    if (kind === 'settle') { var n = R.pick([3, 5]); return {
      q: 'A first-order system has $\\tau = ' + tau + '\\ \\text{s}$. A common rule says it has "settled" after $' + n + '\\tau$ (about ' + (n === 3 ? '95' : '99') + '% of the way). How many seconds is that?',
      a: AX(n * tau), unit: 's', steps: ['$' + n + ' \\times ' + tau + ' = ' + fx(n * tau) + '\\ \\text{s}$.']
    }; }
    if (kind === 'value') { var t = R.pick([0.5, 1, 1.5, 2, 3]) * tau; var v = fin * (1 - Math.exp(-t / tau)); return {
      q: 'Starting from 0, a first-order system heads for $' + fin + '$ with $\\tau = ' + tau + '\\ \\text{s}$: $y(t) = ' + fin + '(1 - e^{-t/\\tau})$. What is $y$ at $t = ' + fx(t) + '\\ \\text{s}$?',
      a: A(v, 3), steps: ['$\\dfrac{t}{\\tau} = \\dfrac{' + fx(t) + '}{' + tau + '} = ' + fx(t / tau) + '$.', '$y = ' + fin + '(1 - e^{-' + fx(t / tau) + '}) \\approx ' + fin + ' \\times ' + s3(1 - Math.exp(-t / tau)) + ' \\approx ' + s3(v) + '$.']
    }; }
    if (kind === 'tau') { var t63 = R.pick([0.3, 0.4, 0.6, 0.9, 1.2, 1.8, 2.4]); return {
      q: 'A step test shows a robot joint reaching 63% of its final angle after $' + t63 + '\\ \\text{s}$. If it behaves like a first-order system, what is its time constant, and so about how long until it is 99% of the way (5τ)? Give the 5τ time in seconds.',
      a: AX(5 * t63), unit: 's', steps: ['The time to 63% is the time constant: $\\tau = ' + t63 + '\\ \\text{s}$.', '$5\\tau = ' + fx(5 * t63) + '\\ \\text{s}$.']
    }; }
    var frac = R.pick([0.5, 0.75, 0.9, 0.95]), tt = -tau * Math.log(1 - frac);
    return {
      q: 'A first-order system with $\\tau = ' + tau + '\\ \\text{s}$ starts at 0. How long until it is $' + Math.round(frac * 100) + '\\%$ of the way to its final value, in seconds?',
      a: A(tt, 3), unit: 's', steps: ['$1 - e^{-t/\\tau} = ' + frac + '$ gives $e^{-t/\\tau} = ' + fx(1 - frac) + '$.', '$t = -\\tau \\ln(' + fx(1 - frac) + ') \\approx ' + s3(tt) + '\\ \\text{s}$.']
    };
  });

  // ---------- rbctrl.stability
  G('rbctrl.stability', function (R, ctx) {
    var kind = by(ctx, R.pick(['kind', 'step']), R.pick(['kind', 'step', 'range']), R.pick(['step', 'range', 'kind']));
    var K = R.pick([0.2, 0.3, 0.5, 0.6, 0.8, 1, 1.2, 1.5, 1.8, 2.2, 2.5, 3]), e0 = R.pick([10, 16, 20, 32, 40, 50, 64, 100]);
    var desc = 'A simple controller updates a position every step by $x_{k+1} = x_k + K(r - x_k)$, so the error obeys $e_{k+1} = (1 - K)\\, e_k$.';
    if (kind === 'step') { var n = R.int(2, 4), e = e0 * Math.pow(1 - K, n); return {
      q: desc + ' With $K = ' + K + '$ and a starting error of $' + e0 + '$, what is the error after $' + n + '$ steps?',
      a: AT(e, fx(sg(Math.max(0.01, Math.abs(e) * 0.01), 2))), steps: ['Each step multiplies the error by $1 - K = ' + fx(1 - K) + '$.', '$e_' + n + ' = ' + e0 + ' \\times ' + P(1 - K) + '^' + n + ' \\approx ' + s3(e) + '$.' + (Math.abs(1 - K) > 1 ? ' It is growing: unstable.' : 1 - K < 0 ? ' It flips sign each step: the robot overshoots back and forth.' : '')]
    }; }
    if (kind === 'kind') {
      var r = 1 - K, right = K === 1 ? 'Reaches the target in one step' : r > 0 && r < 1 ? 'Creeps up smoothly, never passing the target' : r < 0 && r > -1 ? 'Overshoots back and forth, smaller each time' : 'Swings back and forth, bigger each time (unstable)';
      return {
        q: desc + ' With $K = ' + K + '$, what does the motion look like?',
        a: MC(right, ['Creeps up smoothly, never passing the target', 'Overshoots back and forth, smaller each time', 'Swings back and forth, bigger each time (unstable)', 'Reaches the target in one step']),
        steps: ['The factor is $1 - K = ' + fx(r) + '$.', r === 0 ? 'Zero: the error is gone after one step.' : r > 0 && r < 1 ? 'Between 0 and 1: the error shrinks and keeps its sign.' : r < 0 && r > -1 ? 'Between −1 and 0: the error shrinks but flips sign every step.' : 'Its size is more than 1: the error grows every step.']
      };
    }
    var stable = Math.abs(1 - K) < 1;
    return {
      q: desc + ' With $K = ' + K + '$, does the error shrink to zero over time?',
      a: { t: 'tf', v: stable }, steps: ['Stable means $|1 - K| < 1$, which is $0 < K < 2$.', '$|1 - ' + K + '| = ' + fx(Math.abs(1 - K)) + '$, so ' + (stable ? 'yes, it shrinks.' : 'no: the error does not shrink.') + ' Gains near 2 shrink it only slowly with a lot of back-and-forth; the fastest smooth choice is near $K = 1$.']
    };
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
