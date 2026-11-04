/* Robotics Ladder: generators for Robotics for Kids (course key rbkids), 5 topics. Ages 8 to 12, so numbers stay small
   and every problem can be done in the head or on paper. Registered with MathLadder.gen(id, fn(R, ctx)). */
(function (ML) {
  'use strict';
  if (!ML) return;
  var G = ML.gen, U = ML.util, by = ML.byLevel;
  function fx(x) { return +(+x).toPrecision(12); }
  function AX(x) { return { t: 'num', v: String(fx(x)) }; }
  function MC(c, w) { return U.mc(c, w.filter(function (x) { return x !== c; }), 4); }
  var KIDS = ['Ava', 'Ben', 'Cora', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana', 'Ira', 'Jo', 'Kai', 'Lena', 'Milo', 'Nia', 'Owen', 'Pia'];

  // ---------- rbkids.what-is-a-robot
  var BOTS = [
    { n: 'a robot vacuum', s: 'a bump sensor on its front', t: 'its program', a: 'its wheels and brushes' },
    { n: 'a self-driving lawn mower', s: 'a sensor that finds the boundary wire', t: 'its computer chip', a: 'its wheels and blade motor' },
    { n: 'a line-following robot car', s: 'two light sensors underneath', t: 'its microcontroller', a: 'its two drive motors' },
    { n: 'a robot arm that sorts blocks by color', s: 'a color sensor', t: 'its program', a: 'the motors in its joints' },
    { n: 'a toy robot dog', s: 'a touch sensor on its head', t: 'its chip', a: 'the motors in its legs' },
    { n: 'a warehouse robot that carries shelves', s: 'a camera that reads floor markers', t: 'its computer', a: 'its wheels and lift' },
    { n: 'a robot that waters plants', s: 'a soil-moisture sensor', t: 'its microcontroller', a: 'its water pump' },
    { n: 'a night-light robot', s: 'a light sensor', t: 'its program', a: 'its LED and its wheels' }
  ];
  var NOT = ['a hand-cranked pencil sharpener', 'a wind-up toy car', 'a bicycle', 'a flashlight with an on-off switch', 'a hammer', 'a kitchen whisk', 'a paper airplane', 'a remote-control car with no sensors'];
  G('rbkids.what-is-a-robot', function (R, ctx) {
    var kind = by(ctx, R.pick(['job', 'loop', 'isbot']), R.pick(['job', 'loop', 'isbot', 'loop2']), R.pick(['job', 'loop2', 'isbot']));
    if (kind === 'loop' || kind === 'loop2') {
      var n = R.int(2, 10), t = kind === 'loop' ? R.int(2, 10) : R.pick([15, 20, 30, 60]), who = R.pick(KIDS);
      return {
        q: who + '\'s robot runs its sense-think-act loop $' + n + '$ times every second. How many times does it check its sensor in $' + t + '$ seconds?',
        a: AX(n * t), steps: ['Each loop starts by sensing, so count the loops.', '$' + n + ' \\times ' + t + ' = ' + n * t + '$ checks.'],
        hint: 'Times per second multiplied by the number of seconds.'
      };
    }
    if (kind === 'isbot') {
      var b = R.pick(BOTS), nots = R.sample(NOT, 3);
      return {
        q: 'Which of these is a robot? (A robot senses, decides with a program, and acts on its own.)',
        a: MC(b.n, nots), steps: [b.n.charAt(0).toUpperCase() + b.n.slice(1) + ' senses with ' + b.s + ', decides with ' + b.t + ' and acts with ' + b.a + '.', 'The others do not sense and decide by themselves: a person does the deciding, or nothing decides at all.']
      };
    }
    var bb = R.pick(BOTS), job = R.pick(['sense', 'think', 'act']), right = job === 'sense' ? bb.s : job === 'think' ? bb.t : bb.a;
    var wr = [bb.s, bb.t, bb.a, 'its battery', 'its plastic shell'].filter(function (x) { return x !== right; });
    return {
      q: 'Think about ' + bb.n + '. Which part does the <b>' + job + '</b> job?',
      a: MC(right, R.sample(wr, 3)),
      steps: ['Sense: ' + bb.s + '. Think: ' + bb.t + '. Act: ' + bb.a + '.', 'So the ' + job + ' job belongs to ' + right + '. The battery gives power but does not sense, decide or move anything by itself.']
    };
  });

  // ---------- rbkids.sensors-and-motors
  var SENS = ['a light sensor', 'a touch switch', 'an ultrasonic distance sensor', 'a microphone', 'a temperature sensor', 'a camera', 'a color sensor', 'a tilt sensor'];
  var ACTS = ['a motor', 'a servo', 'a buzzer', 'an LED', 'a speaker', 'a water pump', 'a fan', 'a gripper'];
  G('rbkids.sensors-and-motors', function (R, ctx) {
    var kind = by(ctx, R.pick(['pick', 'servo', 'wheel']), R.pick(['pick', 'servo', 'wheel', 'wheel2']), R.pick(['servo', 'wheel2', 'pick']));
    if (kind === 'servo') {
      var a = R.int(1, 17) * 10, b = R.intNot(0, 18, a / 10) * 10;
      return {
        q: 'A servo arm points at $' + a + '^\\circ$. The program tells it to turn to $' + b + '^\\circ$. How many degrees does it turn?',
        a: AX(Math.abs(b - a)), unit: '°', steps: ['It moves from $' + a + '^\\circ$ to $' + b + '^\\circ$.', 'The bigger angle minus the smaller one: $' + Math.max(a, b) + ' - ' + Math.min(a, b) + ' = ' + Math.abs(b - a) + '^\\circ$.'],
        hint: 'Find the difference between the two angles.'
      };
    }
    if (kind === 'wheel' || kind === 'wheel2') {
      var c = kind === 'wheel' ? R.int(10, 25) : R.pick([12.5, 15.5, 18.5, 20.5, 22]), n = R.int(2, 9);
      return {
        q: 'Each time a robot\'s wheel turns all the way around, the robot rolls $' + c + '$ cm. The motor turns the wheel $' + n + '$ times. How far does the robot roll?',
        a: AX(c * n), unit: 'cm', steps: ['One turn is ' + c + ' cm, so ' + n + ' turns is ' + n + ' times as far.', '$' + n + ' \\times ' + c + ' = ' + fx(c * n) + '$ cm.']
      };
    }
    var isS = R.coin(), right = isS ? R.pick(SENS) : R.pick(ACTS), wrongs = R.sample(isS ? ACTS : SENS, 3);
    return {
      q: isS ? 'Which part is a <b>sensor</b>, something that tells the robot about the world?' : 'Which part is an <b>actuator</b>, something that lets the robot do something to the world?',
      a: MC(right, wrongs),
      steps: [isS ? right.charAt(0).toUpperCase() + right.slice(1) + ' measures something and sends it to the program.' : right.charAt(0).toUpperCase() + right.slice(1) + ' makes motion, light or sound when the program tells it to.', 'Sensors are the robot\'s senses; actuators are its muscles.']
    };
  });

  // ---------- rbkids.simple-circuits
  G('rbkids.simple-circuits', function (R, ctx) {
    var kind = by(ctx, R.pick(['light', 'aa', 'count']), R.pick(['light', 'aa', 'count']), R.pick(['count', 'aa', 'light']));
    if (kind === 'aa') {
      var n = R.int(2, 8), who = R.pick(KIDS), cell = R.pick(['AA', 'AAA', 'C', 'D']);
      return {
        q: who + ' puts $' + n + '$ ' + cell + ' batteries end to end in a battery holder (in series). Each gives $1.5$ volts. What is the total voltage?',
        a: AX(1.5 * n), unit: 'V', steps: ['Batteries in series add their voltages.', '$' + n + ' \\times 1.5 = ' + fx(1.5 * n) + '$ volts.']
      };
    }
    var parts = [['the switch is closed', true], ['the switch is open', false], ['every wire is pushed in tight', true], ['one wire has come loose', false], ['the battery is fresh', true], ['the battery is flat', false], ['the LED\'s long leg goes toward the + side', true], ['the LED is in backward', false]];
    function circuit() { var a = R.coin() ? parts[0] : parts[1], b = R.coin() ? parts[2] : parts[3], c = R.coin() ? parts[4] : parts[5], d = R.coin() ? parts[6] : parts[7]; return [a, b, c, d]; }
    if (kind === 'light') {
      var cs = circuit(), ok = cs.every(function (p) { return p[1]; });
      return {
        q: 'A circuit has a battery, a switch, a resistor and an LED. ' + cs.map(function (p) { return p[0]; }).join(', ').replace(/^./, function (s) { return s.toUpperCase(); }) + '. Does the LED light?',
        a: { t: 'tf', v: ok }, steps: ok ? ['Every part is right, so the loop is complete and current can flow all the way around.', 'Yes, it lights.'] : ['A circuit needs a complete loop with power, and an LED only lets current through one way.', 'Here: ' + cs.filter(function (p) { return !p[1]; }).map(function (p) { return p[0]; }).join(' and ') + '. So no, it stays dark.']
      };
    }
    var k = R.int(3, 5), list = [], lit = 0;
    for (var i = 0; i < k; i++) { var c2 = circuit(); if (R.chance(0.35)) c2 = [parts[0], parts[2], parts[4], parts[6]]; var ok2 = c2.every(function (p) { return p[1]; }); if (ok2) lit++; list.push('<br>Circuit ' + (i + 1) + ': ' + c2.map(function (p) { return p[0]; }).join(', ') + '.'); }
    return {
      q: 'How many of these circuits light their LED?' + list.join(''), a: AX(lit),
      steps: ['A circuit lights only if the switch is closed, every wire is tight, the battery is fresh and the LED faces the right way.', 'Count the circuits with all four: ' + lit + '.']
    };
  });

  // ---------- rbkids.block-coding
  G('rbkids.block-coding', function (R, ctx) {
    var kind = by(ctx, R.pick(['total', 'repeat']), R.pick(['repeat', 'where', 'total']), R.pick(['where', 'repeat2']));
    if (kind === 'total') {
      var a = R.int(1, 6), b = R.int(1, 6), c = R.int(1, 6);
      return {
        q: 'A robot runs this program: forward ' + a + ', turn right, forward ' + b + ', turn left, forward ' + c + '. How many squares does it move in all?',
        a: AX(a + b + c), steps: ['Turning does not move the robot to a new square.', 'Add the forward moves: $' + a + ' + ' + b + ' + ' + c + ' = ' + (a + b + c) + '$.']
      };
    }
    if (kind === 'repeat' || kind === 'repeat2') {
      var n = R.int(2, 6), m = R.int(1, 5), extra = kind === 'repeat2' ? R.int(1, 4) : 0;
      return {
        q: 'A robot runs: <b>repeat ' + n + ' times:</b> forward ' + m + ', turn right' + (extra ? '. Then forward ' + extra + '.' : '.') + ' How many squares does it move in all?',
        a: AX(n * m + extra), steps: ['The loop runs ' + n + ' times and moves ' + m + ' each time: $' + n + ' \\times ' + m + ' = ' + n * m + '$.', extra ? 'Then ' + extra + ' more: $' + n * m + ' + ' + extra + ' = ' + (n * m + extra) + '$.' : 'The turns do not add squares, so the answer is ' + n * m + '.']
      };
    }
    var x0 = R.int(1, 3), y0 = R.int(1, 3), f1 = R.int(1, 5), f2 = R.int(1, 5), turn = R.pick(['left', 'right']);
    var x = x0 + f1, y = turn === 'left' ? y0 + f2 : y0 - f2;
    if (y < 0) { y = y0 + f2; turn = 'left'; }
    return {
      q: 'A robot starts at the point $(' + x0 + ', ' + y0 + ')$ facing the $+x$ direction (east). It runs: forward ' + f1 + ', turn ' + turn + ', forward ' + f2 + '. Where does it end? Answer as $(x, y)$.',
      a: { t: 'tuple', v: [String(x), String(y)] },
      steps: ['Forward ' + f1 + ' to the east adds to $x$: $(' + (x0 + f1) + ', ' + y0 + ')$.', 'Turning ' + turn + ' from east faces ' + (turn === 'left' ? 'north, so $y$ goes up' : 'south, so $y$ goes down') + ' by ' + f2 + ': $(' + x + ', ' + y + ')$.']
    };
  });

  // ---------- rbkids.cardboard-arm
  G('rbkids.cardboard-arm', function (R, ctx) {
    var kind = by(ctx, R.pick(['move', 'force']), R.pick(['move', 'force', 'ratio']), R.pick(['ratio', 'force', 'move']));
    var a = R.pick([2, 3, 4, 5]), k = R.int(2, 5), b = a * k;
    if (kind === 'move') {
      var p = R.int(1, 4);
      return {
        q: 'On a cardboard arm, you push $' + a + '$ cm from the pivot and the gripper is $' + b + '$ cm from the pivot. You push the end down $' + p + '$ cm. How far does the gripper move?',
        a: AX(p * k), unit: 'cm', steps: ['The gripper is $' + b + ' \\div ' + a + ' = ' + k + '$ times as far from the pivot.', 'So it moves ' + k + ' times as far: $' + p + ' \\times ' + k + ' = ' + p * k + '$ cm.']
      };
    }
    if (kind === 'force') {
      var F = k * R.int(2, 6);
      return {
        q: 'You push with a force of $' + F + '$ newtons, $' + a + '$ cm from the pivot. The gripper is $' + b + '$ cm from the pivot. About how hard can the gripper squeeze or lift (in newtons)?',
        a: AX(F / k), unit: 'N', steps: ['A lever trades force for distance. The gripper is ' + k + ' times as far out.', 'So it pushes with $\\frac{1}{' + k + '}$ of your force: $' + F + ' \\div ' + k + ' = ' + F / k + '$ N.']
      };
    }
    return {
      q: 'The gripper of a cardboard arm is $' + b + '$ cm from the pivot and your hand is $' + a + '$ cm from it. How many times as far does the gripper move as your hand?',
      a: AX(k), steps: ['Divide the distances from the pivot: $' + b + ' \\div ' + a + ' = ' + k + '$.']
    };
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
