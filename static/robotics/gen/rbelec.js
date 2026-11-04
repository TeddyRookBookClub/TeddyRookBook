/* Robotics Ladder: generators for Electronics and Microcontrollers (course key rbelec), 6 topics.
   Low voltage only (batteries and USB, 3.3 V to 12 V). Safety questions use only widely agreed practice: the right charger
   for the battery, an iron kept in its stand, ventilation, eye protection, washing hands, and power off before rewiring. */
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
  var OHM = '\\ \\Omega', KOHM = '\\ \\text{k}\\Omega';

  // ---------- rbelec.safe-workbench
  var SAFE = [
    ['You set a hot soldering iron down for a moment. Where does it go?', 'Back in its stand', ['On the table, tip pointing away', 'On a folded paper towel', 'Across the top of the parts box']],
    ['Which charger should you use for a lithium-polymer (LiPo) pack?', 'A charger made for lithium batteries, set to the pack\'s cell count', ['Any phone charger with the right plug', 'A charger for nickel (NiMH) batteries', 'A bench power supply set to a high voltage']],
    ['A LiPo pack looks puffy and swollen. What should you do?', 'Stop using it and follow the maker\'s instructions for disposal', ['Press it flat and keep using it', 'Charge it to see if it recovers', 'Put it in the freezer overnight']],
    ['What should you do before you move a wire on a breadboard?', 'Unplug or switch off the power first', ['Nothing, low voltage cannot hurt anything', 'Touch both power rails to check them', 'Turn the voltage up so the parts are easier to see']],
    ['Soldering makes a little smoke from the flux. What helps most?', 'Good ventilation or a fume extractor, so the smoke is not breathed in', ['Leaning close to watch the joint', 'Closing the windows to keep dust out', 'Holding your breath for each joint']],
    ['What should you wear on your eyes while soldering or clipping leads?', 'Safety glasses', ['Nothing, the parts are small', 'Sunglasses', 'Reading glasses only']],
    ['What should you do after a soldering session, before eating?', 'Wash your hands with soap and water', ['Wipe your hands on your shirt', 'Nothing, solder washes off by itself', 'Use the same cloth you clean the tip with']],
    ['A robot arm or wheel is about to run for a test. Where do your fingers go?', 'Clear of the gears, wheels and joints until the power is off', ['Holding the gears to slow them down', 'Inside the arm to feel it move', 'On the wheels to stop the robot if it drives off']],
    ['A battery\'s two wires touch by accident. Why is that dangerous?', 'A short circuit can make a very large current, heat and even fire', ['It is not dangerous at low voltage', 'It only wastes a little charge', 'It makes the battery last longer']],
    ['What is the safest place to charge a LiPo pack?', 'On a fire-resistant surface, where you can watch it, away from things that burn', ['Under a pillow so it stays warm', 'In a closed drawer', 'In a car on a hot day']],
    ['Which power source should a beginner\'s robot kit use?', 'Batteries or USB at low voltage', ['A cut-open wall plug', 'A cord wired straight to a wall outlet', 'A car battery charger set to high']],
    ['Which solder is the better choice for a family workbench?', 'Lead-free solder', ['Solder with the most lead you can find', 'Any metal wire melted on the stove', 'Plumbing solder with acid flux']]
  ];
  G('rbelec.safe-workbench', function (R, ctx) {
    var kind = by(ctx, R.pick(['rule', 'rule', 'pack']), R.pick(['rule', 'pack', 'nominal']), R.pick(['rule', 'pack', 'nominal']));
    if (kind === 'pack' || kind === 'nominal') {
      var n = R.int(1, 6), full = kind === 'pack';
      return {
        q: 'A lithium-polymer cell is about $' + (full ? '4.2' : '3.7') + '\\ \\text{V}$ when ' + (full ? 'fully charged' : 'at its nominal (middle) voltage') + '. A pack marked <b>' + n + 'S</b> has ' + U.plural(n, 'cell') + ' in series. What is the pack\'s ' + (full ? 'fully charged' : 'nominal') + ' voltage?',
        a: AX((full ? 4.2 : 3.7) * n), unit: 'V',
        steps: ['Cells in series add their voltages.', '$' + n + ' \\times ' + (full ? '4.2' : '3.7') + ' = ' + fx((full ? 4.2 : 3.7) * n) + '\\ \\text{V}$. A lithium charger must be set to this cell count, ' + n + 'S, or it will charge the pack wrong.']
      };
    }
    var it = R.pick(SAFE);
    return { q: it[0], a: MC(it[1], it[2]), steps: [it[1] + '.', 'This is the rule kit makers, battery makers and university safety offices all give.'] };
  });

  // ---------- rbelec.ohms-law
  G('rbelec.ohms-law', function (R, ctx) {
    var kind = by(ctx, R.pick(['I', 'V']), R.pick(['I', 'V', 'R']), R.pick(['R', 'Ik', 'P']));
    var v = R.pick([3.3, 5, 6, 9, 12]), r = R.pick([100, 150, 220, 330, 470, 680, 1000, 1500, 2200]);
    if (kind === 'I') return {
      q: 'A $' + r + OHM + '$ resistor is connected across a $' + v + '\\ \\text{V}$ supply. What current flows, in milliamps?',
      a: A(1000 * v / r, 3), unit: 'mA', steps: ['$I = \\dfrac{V}{R} = \\dfrac{' + v + '}{' + r + '} \\approx ' + sg(v / r, 3) + '\\ \\text{A}$.', 'Multiply by 1,000 for milliamps: $\\approx ' + tv(sg(1000 * v / r, 3)) + '\\ \\text{mA}$.'],
      hint: 'Divide volts by ohms to get amps, then change to milliamps.'
    };
    if (kind === 'Ik') {
      var rk = R.pick([1, 2.2, 4.7, 10, 22, 47]), i = 1000 * v / (rk * 1000);
      return {
        q: 'A $' + rk + KOHM + '$ resistor sits across $' + v + '\\ \\text{V}$. What current flows, in milliamps?',
        a: A(i, 3), unit: 'mA', steps: ['$' + rk + KOHM + ' = ' + tv(rk * 1000) + OHM + '$.', '$I = \\dfrac{' + v + '}{' + tv(rk * 1000) + '}\\ \\text{A} \\approx ' + tv(sg(i, 3)) + '\\ \\text{mA}$. A handy shortcut: volts divided by kilohms gives milliamps.']
      };
    }
    var ma = R.pick([2, 4, 5, 8, 10, 12, 15, 20, 25, 30]);
    if (kind === 'V') { var rv = R.pick([100, 150, 220, 330, 470]); return {
      q: 'A current of $' + ma + '\\ \\text{mA}$ flows through a $' + rv + OHM + '$ resistor. What is the voltage across it?',
      a: A(ma / 1000 * rv, 3), unit: 'V', steps: ['$' + ma + '\\ \\text{mA} = ' + fx(ma / 1000) + '\\ \\text{A}$.', '$V = IR = ' + fx(ma / 1000) + ' \\times ' + rv + ' = ' + fx(ma / 1000 * rv) + '\\ \\text{V}$.']
    }; }
    if (kind === 'R') return {
      q: 'You measure $' + v + '\\ \\text{V}$ across a resistor and $' + ma + '\\ \\text{mA}$ through it. What is its resistance, in ohms?',
      a: A(v / (ma / 1000), 3), unit: 'Ω', steps: ['$' + ma + '\\ \\text{mA} = ' + fx(ma / 1000) + '\\ \\text{A}$.', '$R = \\dfrac{V}{I} = \\dfrac{' + v + '}{' + fx(ma / 1000) + '} \\approx ' + tv(sg(v / (ma / 1000), 3)) + OHM + '$.']
    };
    return {
      q: 'A $' + r + OHM + '$ resistor is across $' + v + '\\ \\text{V}$. How much power does it turn into heat, in milliwatts? ($P = V^2 / R$)',
      a: A(1000 * v * v / r, 3), unit: 'mW', steps: ['$P = \\dfrac{V^2}{R} = \\dfrac{' + v + '^2}{' + r + '} \\approx ' + sg(v * v / r, 3) + '\\ \\text{W}$.', 'That is about $' + tv(sg(1000 * v * v / r, 3)) + '\\ \\text{mW}$. A common small resistor is rated for 250 mW, so check it stays below that.']
    };
  });

  // ---------- rbelec.led-resistor
  var STD = [47, 56, 68, 82, 100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820, 1000, 1200, 1500];
  G('rbelec.led-resistor', function (R, ctx) {
    var kind = by(ctx, 'R', R.pick(['R', 'I', 'std']), R.pick(['std', 'I', 'R']));
    var vs = R.pick([3.3, 5, 9, 12]), led = R.pick([['red', 2.0], ['yellow', 2.1], ['green', 2.2], ['blue', 3.0], ['white', 3.0]]);
    if (vs === 3.3 && led[1] >= 3) vs = 5;
    var vf = led[1], ma = R.pick([5, 8, 10, 12, 15, 20]);
    var Rr = (vs - vf) / (ma / 1000);
    if (kind === 'R') return {
      q: 'A ' + led[0] + ' LED drops about $' + vf + '\\ \\text{V}$. You want $' + ma + '\\ \\text{mA}$ through it from a $' + vs + '\\ \\text{V}$ supply. What series resistor do you need, in ohms?',
      a: A(Rr, 3), unit: 'Ω', steps: ['The resistor gets what the LED leaves: $' + vs + ' - ' + vf + ' = ' + fx(vs - vf) + '\\ \\text{V}$.', '$R = \\dfrac{' + fx(vs - vf) + '}{' + fx(ma / 1000) + '} \\approx ' + tv(sg(Rr, 3)) + OHM + '$.'],
      hint: 'Subtract the LED voltage first, then divide by the current in amps.'
    };
    if (kind === 'I') { var rr = R.pick([100, 150, 220, 330, 470, 680]), i = (vs - vf) / rr * 1000; return {
      q: 'A ' + led[0] + ' LED (about $' + vf + '\\ \\text{V}$) and a $' + rr + OHM + '$ resistor are in series across $' + vs + '\\ \\text{V}$. About how much current flows, in milliamps?',
      a: A(i, 3, 0.03), unit: 'mA', steps: ['Voltage across the resistor: $' + vs + ' - ' + vf + ' = ' + fx(vs - vf) + '\\ \\text{V}$.', '$I = \\dfrac{' + fx(vs - vf) + '}{' + rr + '} \\approx ' + sg(i / 1000, 3) + '\\ \\text{A} \\approx ' + sg(i, 3) + '\\ \\text{mA}$.' + (i > 20 ? ' That is above the 20 mA a typical small LED is rated for.' : '')]
    }; }
    var up = STD.filter(function (s) { return s >= Rr - 1e-9; })[0] || 1500;
    var dn = STD.filter(function (s) { return s < Rr - 1e-9; }).slice(-1)[0] || 47;
    var other = R.sample(STD.filter(function (s) { return s !== up && s !== dn; }), 2);
    return {
      q: 'You need at least $' + tv(sg(Rr, 3)) + OHM + '$ to keep a ' + led[0] + ' LED at or below $' + ma + '\\ \\text{mA}$. Resistors come in standard values. Which is the best one to use?',
      a: MC(up + ' Ω', [dn + ' Ω', other[0] + ' Ω', other[1] + ' Ω']),
      steps: ['A bigger resistor means a smaller current, so round <b>up</b> to the next standard value: ' + up + ' Ω.', 'Rounding down to ' + dn + ' Ω would let a little more than ' + ma + ' mA through.']
    };
  });

  // ---------- rbelec.voltage-divider
  G('rbelec.voltage-divider', function (R, ctx) {
    var kind = by(ctx, 'out', R.pick(['out', 'ldr', 'r2']), R.pick(['ldr', 'r2', 'out']));
    var vin = R.pick([3.3, 5, 9, 12]), r1 = R.pick([1, 2.2, 4.7, 10, 22, 47]), r2 = R.pick([1, 2.2, 3.3, 4.7, 10, 22]);
    if (kind === 'out') return {
      q: 'A divider has $R_1 = ' + r1 + KOHM + '$ on top (from $' + vin + '\\ \\text{V}$) and $R_2 = ' + r2 + KOHM + '$ on the bottom (to ground). What is the voltage at the middle?',
      a: A(vin * r2 / (r1 + r2), 3), unit: 'V', steps: ['$V_{out} = V_{in} \\cdot \\dfrac{R_2}{R_1 + R_2}$, with $R_2$ the resistor between the output and ground.', '$= ' + vin + ' \\cdot \\dfrac{' + r2 + '}{' + fx(r1 + r2) + '} \\approx ' + sg(vin * r2 / (r1 + r2), 3) + '\\ \\text{V}$.']
    };
    if (kind === 'ldr') { var rl = R.pick([0.5, 1, 2, 3, 5, 8, 10, 15, 20, 30, 50, 80, 100, 200]), bright = rl <= 5; return {
      q: 'A light sensor (photoresistor) is on top of a divider from $3.3\\ \\text{V}$, with a fixed $10' + KOHM + '$ resistor to ground. In this light the sensor measures $' + rl + KOHM + '$. What voltage reaches the analog pin?',
      a: A(3.3 * 10 / (rl + 10), 3), unit: 'V', steps: ['$V_{out} = 3.3 \\cdot \\dfrac{10}{' + rl + ' + 10} \\approx ' + sg(3.3 * 10 / (rl + 10), 3) + '\\ \\text{V}$.', 'A photoresistor\'s resistance falls in bright light, so with it on top, brighter light means a higher voltage. ' + (bright ? 'Here it is fairly bright.' : 'Here it is fairly dark.')]
    }; }
    var vt = R.pick([1.2, 1.5, 1.8, 2, 2.5, 3, 3.3, 4]); vin = 5; r1 = R.pick([1, 2, 2.2, 3, 4.7, 6, 10, 22]);
    var need = vt * r1 / (vin - vt);
    return {
      q: 'From $5\\ \\text{V}$, with $R_1 = ' + r1 + KOHM + '$ on top, what bottom resistor $R_2$ gives $' + vt + '\\ \\text{V}$ at the middle? Answer in kilohms.',
      a: A(need, 3), unit: 'kΩ', steps: ['$\\dfrac{R_2}{R_1 + R_2} = \\dfrac{' + vt + '}{5}$, so $5 R_2 = ' + vt + '(R_1 + R_2)$.', '$R_2 = \\dfrac{' + vt + ' \\cdot ' + r1 + '}{5 - ' + vt + '} = \\dfrac{' + fx(vt * r1) + '}{' + fx(5 - vt) + '} \\approx ' + sg(need, 3) + KOHM + '$.']
    };
  });

  // ---------- rbelec.analog-input
  G('rbelec.analog-input', function (R, ctx) {
    var kind = by(ctx, R.pick(['read', 'volt']), R.pick(['read', 'volt', 'step']), R.pick(['read12', 'volt', 'step']));
    var bits = kind === 'read12' ? 12 : R.pick([10, 10, 12]), top = Math.pow(2, bits) - 1, vref = R.pick([3.3, 5]);
    if (bits === 12) vref = 3.3;
    if (kind === 'read' || kind === 'read12') { var v = R.int(1, Math.round(vref * 10) - 1) / 10; return {
      q: 'A ' + bits + '-bit analog input reads $0$ at $0\\ \\text{V}$ and $' + tv(top) + '$ at $' + vref + '\\ \\text{V}$. About what number does it report for $' + v + '\\ \\text{V}$?',
      a: { t: 'num', v: String(Math.round(v / vref * top)), tol: 2 }, steps: ['The reading is the same fraction of ' + tv(top) + ' as the voltage is of ' + vref + ' V.', '$\\dfrac{' + v + '}{' + vref + '} \\times ' + tv(top) + ' \\approx ' + tv(Math.round(v / vref * top)) + '$ (whole numbers only, so round).']
    }; }
    if (kind === 'volt') { var n = R.int(20, top - 20); return {
      q: 'A ' + bits + '-bit analog input with a $' + vref + '\\ \\text{V}$ reference reports $' + tv(n) + '$. What is the voltage at the pin?',
      a: A(n / top * vref, 3), unit: 'V', steps: ['$V = \\dfrac{' + tv(n) + '}{' + tv(top) + '} \\times ' + vref + ' \\approx ' + sg(n / top * vref, 3) + '\\ \\text{V}$.']
    }; }
    bits = R.pick([8, 10, 12, 16]); top = Math.pow(2, bits) - 1; vref = R.pick([1.1, 2.5, 3.3, 5]);
    return {
      q: 'How many millivolts is one step of a ' + bits + '-bit converter with a $' + vref + '\\ \\text{V}$ reference?',
      a: A(1000 * vref / top, 3), unit: 'mV', steps: ['There are ' + tv(top) + ' steps between 0 and the top reading.', '$\\dfrac{' + tv(vref * 1000) + '\\ \\text{mV}}{' + tv(top) + '} \\approx ' + sg(1000 * vref / top, 3) + '\\ \\text{mV}$ per step.']
    };
  });

  // ---------- rbelec.pwm
  G('rbelec.pwm', function (R, ctx) {
    var kind = by(ctx, R.pick(['avg', 'duty']), R.pick(['avg', 'duty', 'ontime']), R.pick(['ontime', 'byte', 'duty']));
    var vs = R.pick([3.3, 5, 6, 9, 12]), d = R.int(1, 19) * 5;
    if (kind === 'avg') return {
      q: 'A PWM signal switches between $0$ and $' + vs + '\\ \\text{V}$ with a duty cycle of $' + d + '\\%$. What is the average voltage?',
      a: A(vs * d / 100, 3), unit: 'V', steps: ['The average is the duty cycle times the high voltage.', '$' + fx(d / 100) + ' \\times ' + vs + ' = ' + fx(vs * d / 100) + '\\ \\text{V}$.']
    };
    if (kind === 'duty') { var want = sg(vs * R.int(1, 19) * 5 / 100, 3); return {
      q: 'You want a motor to feel an average of $' + want + '\\ \\text{V}$ from a $' + vs + '\\ \\text{V}$ PWM supply. What duty cycle, in percent?',
      a: A(100 * want / vs, 3), steps: ['Duty cycle $= \\dfrac{\\text{average}}{\\text{high}} = \\dfrac{' + want + '}{' + vs + '}$.', '$\\approx ' + sg(100 * want / vs, 3) + '\\%$.']
    }; }
    if (kind === 'ontime') { var f = R.pick([50, 100, 200, 500, 1000, 2000]), per = 1000 / f; return {
      q: 'A PWM signal runs at $' + tv(f) + '\\ \\text{Hz}$ with a $' + d + '\\%$ duty cycle. How long is it high in each cycle, in milliseconds?',
      a: A(per * d / 100, 3), unit: 'ms', steps: ['One period is $\\dfrac{1}{' + tv(f) + '}\\ \\text{s} = ' + fx(per) + '\\ \\text{ms}$.', 'High for $' + fx(d / 100) + ' \\times ' + fx(per) + ' = ' + fx(per * d / 100) + '\\ \\text{ms}$.']
    }; }
    var b = R.int(10, 245);
    return {
      q: 'On an Arduino, analogWrite(pin, value) takes a value from $0$ to $255$ for the duty cycle. What duty cycle, in percent, does a value of $' + b + '$ give?',
      a: A(100 * b / 255, 3), steps: ['$\\dfrac{' + b + '}{255} \\times 100 \\approx ' + sg(100 * b / 255, 3) + '\\%$.']
    };
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
