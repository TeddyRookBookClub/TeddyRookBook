/* Robotics Ladder: generators for ROS 2 and Simulation (course key rbros), 5 topics.
   Concepts from the ROS 2 documentation (nodes, topics, services, actions) and REP 103 (SI units; x forward, y left,
   z up; angles in radians, counterclockwise positive). Frames are 2-D here: a pose (x, y, θ) maps a point p to R(θ)p + t. */
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

  // ---------- rbros.nodes-topics
  function an(w) { return (/^[aeiouAEIOU]/.test(w) ? 'An ' : 'A ') + w; }
  var NODES = ['camera', 'lidar', 'IMU', 'wheel encoder', 'GPS', 'battery monitor', 'joystick', 'ultrasonic'];
  G('rbros.nodes-topics', function (R, ctx) {
    var kind = by(ctx, R.pick(['count', 'concept']), R.pick(['count', 'period']), R.pick(['band', 'count', 'subs']));
    var hz = R.pick([1, 2, 5, 10, 15, 20, 30, 50, 100, 200]), sec = R.pick([2, 5, 10, 30, 60]), nd = R.pick(NODES);
    if (kind === 'count') return {
      q: an(nd) + ' node publishes on its topic at $' + hz + '\\ \\text{Hz}$. How many messages does it send in $' + sec + '\\ \\text{s}$?',
      a: AX(hz * sec), steps: ['Hertz means times per second: $' + hz + ' \\times ' + sec + ' = ' + tv(hz * sec) + '$ messages.']
    };
    if (kind === 'period') { hz = R.pick([1, 2, 4, 5, 8, 10, 20, 25, 40, 50, 100, 200, 250, 500]); return {
      q: an(nd) + ' node publishes at $' + hz + '\\ \\text{Hz}$. How many milliseconds apart are its messages?',
      a: AX(1000 / hz), unit: 'ms', steps: ['Period $= 1/f = 1/' + hz + '\\ \\text{s} = ' + fx(1000 / hz) + '\\ \\text{ms}$.']
    }; }
    if (kind === 'band') { var kb = R.pick([1, 2, 4, 10, 50, 100, 300, 900]); return {
      q: 'Each message on a topic is $' + kb + '\\ \\text{kB}$ and it is published at $' + hz + '\\ \\text{Hz}$. How many kilobytes per second does the topic carry?',
      a: AX(kb * hz), unit: 'kB/s', steps: ['$' + kb + ' \\times ' + hz + ' = ' + tv(kb * hz) + '\\ \\text{kB/s}$. Big messages at high rates, like camera images, are what fill a network.']
    }; }
    if (kind === 'subs') { var n = R.int(2, 6); return {
      q: 'One ' + nd + ' node publishes at $' + hz + '\\ \\text{Hz}$, and $' + n + '$ other nodes subscribe to its topic. How many messages per second does each subscriber receive?',
      a: AX(hz), steps: ['Every subscriber gets every message; subscribing does not split them up.', 'Each gets $' + hz + '$ per second. The publisher does not need to know who is listening.']
    }; }
    var it = R.pick([
      ['In ROS 2, a single program that does one job, such as reading a sensor, is called a…', 'Node'],
      ['A named channel that nodes publish messages to and subscribe from is called a…', 'Topic'],
      ['A node that sends messages on a topic is a…', 'Publisher'],
      ['A node that receives messages from a topic is a…', 'Subscriber']]);
    return { q: it[0], a: MC(it[1], ['Node', 'Topic', 'Publisher', 'Subscriber', 'Service']), steps: [it[1] + '.'] };
  });

  // ---------- rbros.services-actions
  var JOBS = [
    ['Stream a camera\'s images to anyone who wants them', 'Topic'], ['Send the IMU\'s readings 100 times a second', 'Topic'], ['Share the battery voltage once a second', 'Topic'],
    ['Ask the map server for the current map, once', 'Service'], ['Ask a node to reset its odometry to zero', 'Service'], ['Ask whether the gripper is open or closed right now', 'Service'], ['Ask a node to switch its LED on', 'Service'],
    ['Drive the robot to the kitchen, reporting progress, with a chance to cancel', 'Action'], ['Move the arm along a long path and report how far it has got', 'Action'], ['Dock to the charger, which takes a minute, and let the user stop it', 'Action'], ['Explore and map a whole room', 'Action'],
    ['Publish the wheel encoders\' counts 50 times a second', 'Topic'], ['Send the lidar\'s scans to the mapper and the obstacle checker', 'Topic'], ['Broadcast the robot\'s estimated position for every node to use', 'Topic'], ['Stream joystick commands to the motor node', 'Topic'],
    ['Ask the arm node for its current joint limits', 'Service'], ['Ask the camera node to save one photo', 'Service'], ['Ask the planner whether a single point is inside a wall', 'Service'], ['Ask the parameter server to change one setting', 'Service'],
    ['Pick up a cup with the arm, reporting each stage, with a chance to stop', 'Action'], ['Follow a list of waypoints across a field and report progress', 'Action'], ['Rotate in place to scan the room, which takes thirty seconds', 'Action'], ['Run a ten-minute calibration routine the user can cancel', 'Action']
  ];
  G('rbros.services-actions', function (R, ctx) {
    var it = R.pick(JOBS), kind = by(ctx, 'pick', 'pick', R.pick(['pick', 'why']));
    if (kind === 'why') return {
      q: 'A node calls a <b>service</b> to "drive to the kitchen", a job that takes two minutes. What goes wrong?',
      a: MC('The caller waits with no progress and cannot cancel; an action fits better', ['Nothing, services are meant for long jobs', 'The robot drives twice as fast', 'The message is lost because services are one-way']),
      steps: ['A service is one request and one reply. The caller gets nothing until the end.', 'An action is built for long jobs: it gives a goal, steady feedback, a result, and a way to cancel.']
    };
    return {
      q: 'Which ROS 2 tool fits this job best? <i>' + it[0] + '.</i>', a: MC(it[1], ['Topic', 'Service', 'Action']),
      steps: [{ Topic: 'A steady stream of data that many nodes may want: a topic.', Service: 'One quick question with one answer: a service.', Action: 'A long job with feedback along the way and a way to cancel: an action.' }[it[1]]]
    };
  });

  // ---------- rbros.units-conventions
  G('rbros.units-conventions', function (R, ctx) {
    var kind = by(ctx, R.pick(['rad', 'axis']), R.pick(['rad', 'm', 'axis']), R.pick(['rads', 'm', 'rad']));
    if (kind === 'rad') { var d = R.int(1, 36) * 5; return {
      q: 'ROS 2 messages use radians for angles (REP 103). A heading of $' + d + '^\\circ$ is how many radians?',
      a: A(d / DEG, 3), unit: 'rad', steps: ['$\\text{rad} = \\text{degrees} \\times \\dfrac{\\pi}{180} = ' + d + ' \\times \\dfrac{\\pi}{180} \\approx ' + sg(d / DEG, 3) + '$.']
    }; }
    if (kind === 'rads') { var rpm = R.pick([30, 60, 90, 100, 120, 150, 200, 300]); return {
      q: 'A wheel spins at $' + rpm + '$ revolutions per minute. ROS 2 wants radians per second. What is that?',
      a: A(rpm * 2 * Math.PI / 60, 3), unit: 'rad/s', steps: ['One revolution is $2\\pi$ radians, one minute is 60 seconds.', '$' + rpm + ' \\times \\dfrac{2\\pi}{60} \\approx ' + sg(rpm * 2 * Math.PI / 60, 3) + '\\ \\text{rad/s}$.']
    }; }
    if (kind === 'm') { var cm = R.int(1, 400) * R.pick([1, 5]); return {
      q: 'A distance sensor reports $' + cm + '\\ \\text{cm}$. ROS 2 messages use meters. What number should the message carry?',
      a: AX(cm / 100), unit: 'm', steps: ['$' + cm + ' \\div 100 = ' + fx(cm / 100) + '\\ \\text{m}$.']
    }; }
    var it = R.pick([
      ['In a robot\'s body frame under REP 103, which way does the $x$-axis point?', 'Forward'], ['…which way does the $y$-axis point?', 'Left'], ['…which way does the $z$-axis point?', 'Up'],
      ['A positive turn about the $z$-axis (up) turns the robot which way, seen from above?', 'Counterclockwise (to the left)']]);
    return { q: it[0].replace('…', 'In a robot\'s body frame under REP 103, '), a: MC(it[1], /clockwise/i.test(it[1]) ? ['Counterclockwise (to the left)', 'Clockwise (to the right)'] : ['Forward', 'Left', 'Up', 'Right', 'Down', 'Backward']), steps: [it[1] + '. REP 103 uses right-handed frames: x forward, y left, z up.'] };
  });

  // ---------- rbros.transforms
  G('rbros.transforms', function (R, ctx) {
    var kind = by(ctx, R.pick(['shift', 'shift', 'order']), R.pick(['rot', 'shift']), R.pick(['full', 'rot']));
    var px = R.int(1, 30) / 10, py = R.int(-15, 15) / 10, tx = R.int(-30, 30) / 10, ty = R.int(-30, 30) / 10, th = R.pick([30, 45, 60, 90, 120, 180, -90, -45]);
    var c = Math.cos(th / DEG), s = Math.sin(th / DEG);
    if (kind === 'order') return {
      q: 'A point is seen in the <b>camera</b> frame. You know camera → base (where the camera sits on the robot) and base → map (where the robot is). To get the point on the map, which do you apply first?',
      a: MC('Camera → base, then base → map', ['Camera → base, then base → map', 'Base → map, then camera → base', 'Either order gives the same answer']),
      steps: ['Work outward from the frame the point is in: first express it on the robot body, then place the body on the map.', 'Rotations and shifts do not commute in general, so the order matters.']
    };
    if (kind === 'shift') return {
      q: 'The robot\'s base is at $(' + tx + ',\\ ' + ty + ')$ on the map, heading $0^\\circ$. A point is at $(' + px + ',\\ ' + py + ')$ in the base frame. Where is it on the map? Give the $x$ coordinate.',
      a: AX(px + tx), unit: 'm', steps: ['With no rotation, just add the shift: $x = ' + px + ' + (' + tx + ') = ' + fx(px + tx) + '$.', 'And $y = ' + py + ' + (' + ty + ') = ' + fx(py + ty) + '$.']
    };
    var mx = c * px - s * py + (kind === 'full' ? tx : 0), my = s * px + c * py + (kind === 'full' ? ty : 0), askx = R.coin();
    return {
      q: 'The robot\'s base is at $(' + (kind === 'full' ? tx : 0) + ',\\ ' + (kind === 'full' ? ty : 0) + ')$ on the map, heading $' + th + '^\\circ$. A point is $(' + px + ',\\ ' + py + ')$ in the base frame. What is its map $' + (askx ? 'x' : 'y') + '$?',
      a: AT(askx ? mx : my, 0.01), unit: 'm',
      steps: [askx ? '$x = x_b\\cos\\theta - y_b\\sin\\theta + t_x$.' : '$y = x_b\\sin\\theta + y_b\\cos\\theta + t_y$.', '$\\cos ' + th + '^\\circ \\approx ' + String(sg(c, 3) || 0) + '$, $\\sin ' + th + '^\\circ \\approx ' + String(sg(s, 3) || 0) + '$.', 'So $' + (askx ? 'x' : 'y') + ' \\approx ' + String(sg(askx ? mx : my, 3) || 0) + '\\ \\text{m}$. Rotate first, then shift.']
    };
  });

  // ---------- rbros.simulation
  G('rbros.simulation', function (R, ctx) {
    var kind = by(ctx, 'steps', R.pick(['steps', 'rtf']), R.pick(['euler', 'rtf', 'wall']));
    var dt = R.pick([0.001, 0.002, 0.004, 0.005, 0.01, 0.02, 0.025, 0.05]), T0 = R.pick([1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30, 45, 60, 90]);
    if (kind === 'steps') return {
      q: 'A simulator steps physics every $\\Delta t = ' + dt + '\\ \\text{s}$. How many steps does it take to simulate $' + T0 + '\\ \\text{s}$?',
      a: AX(Math.round(T0 / dt)), steps: ['$' + T0 + ' \\div ' + dt + ' = ' + tv(Math.round(T0 / dt)) + '$ steps.']
    };
    if (kind === 'rtf') { var sim = R.pick([5, 10, 20, 30, 60]), wall = R.pick([5, 10, 20, 40, 60, 120]); return {
      q: 'A simulation covers $' + sim + '\\ \\text{s}$ of robot time in $' + wall + '\\ \\text{s}$ of clock time. What is its real-time factor (simulated time ÷ clock time)?',
      a: AT(sim / wall, 0.01), steps: ['$' + sim + ' \\div ' + wall + ' \\approx ' + sg(sim / wall, 3) + '$.', sim / wall < 1 ? 'Below 1: it runs slower than real life. The physics is still right; it just takes longer to watch.' : sim / wall > 1 ? 'Above 1: faster than real life, handy for running many tests.' : 'Exactly real time.']
    }; }
    if (kind === 'wall') { var rtf = R.pick([0.25, 0.5, 2, 4, 10]), sm = R.pick([10, 20, 30, 60, 120]); return {
      q: 'A simulator runs at a real-time factor of $' + rtf + '$. How many seconds of clock time does $' + sm + '\\ \\text{s}$ of simulated driving take?',
      a: AX(sm / rtf), unit: 's', steps: ['Clock time $=$ simulated time $\\div$ real-time factor $= ' + sm + ' \\div ' + rtf + ' = ' + fx(sm / rtf) + '\\ \\text{s}$.']
    }; }
    var x0 = R.int(0, 20) / 10, v = R.int(1, 20) / 10, a = R.int(-10, 10) / 10, h = R.pick([0.1, 0.2, 0.5]);
    return {
      q: 'A simulator updates a cart with Euler\'s method: $x_{\\text{new}} = x + v\\,\\Delta t$, then $v_{\\text{new}} = v + a\\,\\Delta t$. Start $x = ' + x0 + '\\ \\text{m}$, $v = ' + v + '\\ \\text{m/s}$, $a = ' + a + '\\ \\text{m/s}^2$, $\\Delta t = ' + h + '\\ \\text{s}$. What is $x$ after two steps?',
      a: AT(x0 + v * h + (v + a * h) * h, 0.005), unit: 'm',
      steps: ['Step 1: $x = ' + x0 + ' + ' + v + ' \\times ' + h + ' = ' + fx(x0 + v * h) + '$; $v = ' + v + ' + (' + a + ')(' + h + ') = ' + fx(v + a * h) + '$.', 'Step 2: $x = ' + fx(x0 + v * h) + ' + ' + (v + a * h < 0 ? '(' + fx(v + a * h) + ')' : fx(v + a * h)) + ' \\times ' + h + ' = ' + fx(x0 + v * h + (v + a * h) * h) + '\\ \\text{m}$.', 'Smaller steps track the true motion more closely, at the cost of more work.']
    };
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
