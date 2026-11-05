/* Inventors Ladder: generators for From Scratch (course key from-scratch), 8 project topics. Real science and arithmetic
   from each build (series cells, ampere-turns, F = BIL, Faraday's law, Morse timing, P = VI, LC tuning, press and scribe
   rates) plus short history questions that match the lessons. Registered with MathLadder.gen(id, fn(R, ctx)). */
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
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function recall(R, list) { var it = R.pick(list); return { q: it[0], a: MC(it[1], it[2]), steps: [it[3]] }; }
  var KIDS = ['Ava', 'Ben', 'Cora', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana', 'Ira', 'Jo', 'Kai', 'Lena', 'Milo', 'Nia', 'Owen', 'Pia', 'Ravi', 'Sam', 'Tess', 'Uma'];

  // ---------- from-scratch.lemon-battery
  var FRUIT = ['lemons', 'limes', 'potatoes', 'oranges', 'apples'];
  var HIST1 = [
    ['In what year did Alessandro Volta announce his pile, the first battery?', '1800', ['1750', '1831', '1879'], 'Volta described the pile in a letter to the Royal Society of London in 1800.'],
    ['Luigi Galvani saw frog legs twitch when touched with two metals. What did Galvani think made the electricity?', 'The frog itself ("animal electricity")', ['The metals alone', 'Lightning stored in the air', 'Magnets in the table'], 'Galvani believed the animal made the electricity. Volta thought the two different metals did, and built the pile to show it.'],
    ['What did Volta stack to make his pile?', 'Discs of two different metals with salt-water-soaked card or cloth between them', ['Magnets and iron nails', 'Glass plates rubbed with silk', 'Lemons joined by string'], 'Pairs of different metals, such as zinc and copper or silver, separated by card or cloth soaked in salt water.'],
    ['In a zinc and copper lemon cell, which metal is the negative terminal?', 'Zinc', ['Copper', 'Both are negative', 'Neither: the lemon juice is'], 'Zinc gives up electrons as it dissolves, so electrons leave from the zinc: it is the negative terminal.'],
    ['Why is a U.S. penny made after 1982 a poor copper electrode?', 'It is mostly zinc inside, with only a thin copper coat', ['It is pure copper and too soft', 'It is made of iron', 'It is coated in plastic'], 'Since 1982 U.S. cents have been copper-plated zinc. Use copper wire or an older penny.'],
    ['Where does a lemon battery\'s energy come from?', 'The zinc changing chemically as it dissolves', ['The lemon\'s sugar', 'The copper wearing away', 'Your hands'], 'The zinc dissolves into the juice and gives up electrons. The lemon juice is the liquid that lets the chemistry happen.']
  ];
  G('from-scratch.lemon-battery', function (R, ctx) {
    var kind = by(ctx, R.pick(['series', 'series', 'hist', 'parallel']), R.pick(['howmany', 'current', 'series', 'hist']), R.pick(['current', 'internal', 'howmany', 'hist']));
    var who = R.pick(KIDS), fr = R.pick(FRUIT), e = R.pick([0.8, 0.9, 1.0]);
    if (kind === 'hist') return recall(R, HIST1);
    if (kind === 'series') {
      var n = R.int(2, 8);
      return { q: who + ' measures one ' + fr.slice(0, -(fr === 'potatoes' ? 2 : 1)) + ' cell at $' + e + '$ V. ' + who + ' joins $' + n + '$ of them in series, copper of one to zinc of the next. About what voltage does the whole chain give, with nothing connected?',
        a: A(n * e, 3, 0.01), unit: 'V', steps: ['In series the voltages add.', '$' + n + ' \\times ' + e + ' = ' + tv(n * e) + '$ V.'], hint: 'Series cells add their voltages.' };
    }
    if (kind === 'parallel') {
      var n2 = R.int(2, 6);
      return { q: who + ' joins $' + n2 + '$ ' + fr + ', each making $' + e + '$ V, in <b>parallel</b>: all the zinc nails wired together and all the copper strips wired together. What voltage does the group give?',
        a: AX(e), unit: 'V', steps: ['In parallel every cell pushes across the same two wires, so the voltage stays the same as one cell: $' + e + '$ V.', 'Parallel cells can share the work of giving more current, but they do not raise the voltage.'], hint: 'Parallel does not add voltages.' };
    }
    if (kind === 'howmany') {
      var need = R.pick([1.8, 2.5, 3, 3.5, 4.5]), dev = { 1.8: 'a red LED (about 1.8 V)', 2.5: 'a small digital clock that needs about 2.5 V', 3: 'a buzzer that needs about 3 V', 3.5: 'a white LED that needs about 3.5 V', 4.5: 'a toy that needs about 4.5 V' }[need];
      var k = Math.ceil(fx(need / e) - 1e-9);
      return { q: 'Each ' + fr.slice(0, -(fr === 'potatoes' ? 2 : 1)) + ' cell makes about $' + e + '$ V. What is the smallest number of cells in series that reaches at least the voltage for ' + dev + '?',
        a: AX(k), steps: ['Divide: $' + need + ' \\div ' + e + ' \\approx ' + tv(sg(need / e, 3)) + '$.', 'You cannot use part of a lemon, so round up to $' + k + '$ cells, which give $' + tv(k * e) + '$ V.'], hint: 'Divide the voltage needed by one cell\'s voltage, then round up.' };
    }
    if (kind === 'current') {
      var n3 = R.int(2, 5), Rk = R.pick([2, 3, 4, 5, 6, 8, 10]), V = fx(n3 * e), I = V / Rk;
      return { q: who + '\'s chain of $' + n3 + '$ cells (each $' + e + '$ V) is connected to a $' + Rk + '\\ \\text{k}\\Omega$ resistor. Ignoring the lemons\' own resistance, what current flows, in milliamps?',
        a: A(I, 3), unit: 'mA', steps: ['The chain gives $' + n3 + ' \\times ' + e + ' = ' + tv(V) + '$ V.', 'Ohm\'s law: $I = V/R = ' + tv(V) + ' \\div ' + Rk + '\\,000\\ \\Omega \\approx ' + tv(sg(I / 1000, 3)) + '$ A $= ' + tv(sg(I, 3)) + '$ mA.', 'A lemon battery gives only tiny currents like this, which is why an LED glows only dimly.'], hint: 'Volts divided by kilohms gives milliamps.' };
    }
    // internal resistance: an open-circuit voltage, then the voltage with a load
    var E = R.pick([0.9, 1.0]), Rl = R.pick([1, 2, 3, 4]), frac = R.pick([0.5, 0.6, 0.75, 0.8]), Vl = fx(E * frac), r = fx(Rl * (E / Vl - 1));
    return { q: 'A lemon cell reads $' + E + '$ V on a meter with nothing else connected. With a $' + Rl + '\\ \\text{k}\\Omega$ resistor across it, the meter reads $' + Vl + '$ V. What is the lemon\'s own internal resistance, in kilohms?',
      a: A(r, 3), unit: 'kΩ', steps: ['The current through the resistor is $I = ' + Vl + '\\text{ V} \\div ' + Rl + '\\ \\text{k}\\Omega = ' + tv(sg(Vl / Rl, 3)) + '$ mA.', 'The missing $' + E + ' - ' + Vl + ' = ' + tv(fx(E - Vl)) + '$ V is lost inside the lemon.', 'So $r = ' + tv(fx(E - Vl)) + ' \\div ' + tv(sg(Vl / Rl, 3)) + ' \\approx ' + tv(sg(r, 3)) + '\\ \\text{k}\\Omega$.'], hint: 'The voltage lost inside the cell, divided by the current.' };
  });

  // ---------- from-scratch.electromagnet
  var HIST2 = [
    ['In 1820 Hans Christian Ørsted noticed something that started the study of electromagnets. What was it?', 'A wire carrying current made a compass needle swing', ['A magnet made a wire glow', 'Lightning magnetized a nail', 'A battery attracted iron filings'], 'Ørsted saw a compass needle move near a current-carrying wire: electricity makes magnetism.'],
    ['William Sturgeon showed an early electromagnet in 1825. How did he keep the bare wire from shorting on the iron?', 'He varnished the iron and wound the bare wire loosely', ['He used plastic-coated wire', 'He used a glass core', 'He wound it under water'], 'Sturgeon\'s horseshoe of varnished iron had bare copper wire wound around it, about 16 turns.'],
    ['What did Joseph Henry do to make far stronger electromagnets around 1830?', 'He insulated the wire (with silk) so he could wind many turns tightly', ['He used thicker iron only', 'He removed the iron core', 'He used a lemon battery'], 'Insulated wire can touch itself without shorting, so Henry could wind hundreds of turns. His big magnet for Yale College held up more than 2,000 pounds.'],
    ['Why does a nail electromagnet get hot quickly on a single AA cell?', 'Its wire has very little resistance, so a large current flows: almost a short circuit', ['The iron burns', 'Magnets are always hot', 'The battery is broken'], 'A meter or two of wire has only a fraction of an ohm, so several amps can flow and the wire heats up.'],
    ['Which change makes a nail electromagnet stronger?', 'More turns of wire', ['A plastic straw instead of the nail', 'Fewer turns of wire', 'Longer wires to the battery with no extra turns'], 'Strength grows with the ampere-turns: the current times the number of turns. An iron core makes it much stronger still.']
  ];
  G('from-scratch.electromagnet', function (R, ctx) {
    var kind = by(ctx, R.pick(['at', 'at', 'hist', 'compare']), R.pick(['length', 'compare', 'current', 'hist']), R.pick(['current', 'heat', 'solenoid', 'hist']));
    var who = R.pick(KIDS);
    if (kind === 'hist') return recall(R, HIST2);
    if (kind === 'at') {
      var N = R.int(2, 15) * 10, I = R.pick([0.5, 1, 1.5, 2, 2.5, 3]);
      return { q: who + ' winds $' + N + '$ turns on a nail and the current is $' + I + '$ A. How many ampere-turns is that?', a: AX(N * I), steps: ['Ampere-turns = turns × current.', '$' + N + ' \\times ' + I + ' = ' + tv(N * I) + '$.'], hint: 'Multiply the turns by the current.' };
    }
    if (kind === 'compare') {
      var N1 = R.int(2, 6) * 10, k = R.pick([2, 3, 4]), I1 = R.pick([1, 2]), I2 = R.pick([1, 2]), N2 = N1 * k;
      var ratio = fx(N2 * I2 / (N1 * I1));
      return { q: 'Magnet A has $' + N1 + '$ turns carrying $' + I1 + '$ A. Magnet B, on the same kind of nail, has $' + N2 + '$ turns carrying $' + I2 + '$ A. Before the iron fills up (saturates), strength grows with ampere-turns. About how many times as strong is B?',
        a: A(ratio, 3, 0.01), steps: ['A: $' + N1 + ' \\times ' + I1 + ' = ' + N1 * I1 + '$ ampere-turns. B: $' + N2 + ' \\times ' + I2 + ' = ' + N2 * I2 + '$.', 'Ratio: $' + N2 * I2 + ' \\div ' + N1 * I1 + ' = ' + tv(ratio) + '$.'] };
    }
    if (kind === 'length') {
      var N3 = R.int(3, 12) * 10, d = R.pick([0.6, 0.8, 1, 1.2]), Lm = N3 * Math.PI * d / 100;
      return { q: 'Each turn around a nail coil is a circle about $' + d + '$ cm across. About how many meters of wire do $' + N3 + '$ turns use? (Use $\\pi \\approx 3.14$.)',
        a: A(Lm, 3), unit: 'm', steps: ['One turn is the circumference: $\\pi d \\approx 3.14 \\times ' + d + ' \\approx ' + tv(sg(Math.PI * d, 3)) + '$ cm.', '$' + N3 + '$ turns: $' + N3 + ' \\times ' + tv(sg(Math.PI * d, 3)) + ' \\approx ' + tv(sg(N3 * Math.PI * d, 3)) + '$ cm $\\approx ' + tv(sg(Lm, 3)) + '$ m.'], hint: 'Circumference = π × diameter, then times the number of turns.' };
    }
    if (kind === 'current') {
      var Rw = R.pick([0.2, 0.3, 0.4, 0.5, 0.6]), r = R.pick([0.1, 0.15, 0.2]), Vb = R.pick([1.5, 3]), Ix = Vb / (Rw + (Vb === 3 ? 2 * r : r));
      var rt = Vb === 3 ? 2 * r : r;
      return { q: 'A coil\'s wire has a resistance of $' + Rw + '\\ \\Omega$. It is connected to ' + (Vb === 3 ? 'two AA cells in series ($3$ V), each with an internal resistance of $' + r + '\\ \\Omega$' : 'one AA cell ($1.5$ V) with an internal resistance of $' + r + '\\ \\Omega$') + '. About what current flows?',
        a: A(Ix, 3), unit: 'A', steps: ['The current meets the wire and the cell\'s own resistance in series: $' + Rw + ' + ' + tv(rt) + ' = ' + tv(fx(Rw + rt)) + '\\ \\Omega$.', '$I = ' + Vb + ' \\div ' + tv(fx(Rw + rt)) + ' \\approx ' + tv(sg(Ix, 3)) + '$ A. That is a big current for an AA cell, which is why the coil heats up fast.'], hint: 'Add the resistances, then use I = V/R.' };
    }
    if (kind === 'heat') {
      var I3 = R.pick([2, 2.5, 3, 4]), R3 = R.pick([0.2, 0.25, 0.3, 0.4, 0.5]), P = I3 * I3 * R3;
      return { q: '$' + I3 + '$ A flows through a coil of wire with a resistance of $' + R3 + '\\ \\Omega$. How many watts become heat in the wire?', a: A(P, 3, 0.01), unit: 'W', steps: ['Heating power: $P = I^2 R$.', '$' + I3 + '^2 \\times ' + R3 + ' = ' + I3 * I3 + ' \\times ' + R3 + ' = ' + tv(fx(P)) + '$ W.', 'A few watts in a thin wire makes it hot in seconds: connect it only briefly.'], hint: 'P = I² R.' };
    }
    var N4 = R.int(1, 6) * 100, I4 = R.pick([0.5, 1, 2, 3]), L4 = R.pick([0.05, 0.1, 0.2]), B = 4 * Math.PI * 1e-7 * N4 * I4 / L4 * 1000;
    return { q: 'A long coil with no iron inside has $' + N4 + '$ turns spread over $' + L4 + '$ m and carries $' + I4 + '$ A. Use $B = \\mu_0 N I / L$ with $\\mu_0 = 4\\pi \\times 10^{-7}$ T·m/A. What is the field inside, in millitesla?',
      a: A(B, 3), unit: 'mT', steps: ['$B = 4\\pi \\times 10^{-7} \\times ' + N4 + ' \\times ' + I4 + ' \\div ' + L4 + '$.', '$B \\approx ' + tv(sg(B / 1000, 3)) + '$ T $= ' + tv(sg(B, 3)) + '$ mT.', 'An iron core can make the field hundreds of times stronger, until the iron saturates.'] };
  });

  // ---------- from-scratch.simple-motor
  var HIST3 = [
    ['In 1821 Michael Faraday made a wire move round and round a magnet. What liquid carried the current in his experiment?', 'Mercury', ['Lemon juice', 'Salt water', 'Oil'], 'Faraday\'s wire dipped into a dish of mercury around a standing magnet. Mercury is poisonous, so we use a battery, a magnet and copper wire instead.'],
    ['Why do we not copy Faraday\'s 1821 motor exactly at home?', 'It used mercury, which is poisonous', ['It needed mains electricity', 'It used radioactive metals', 'It needed a steam engine'], 'Mercury is toxic. The homopolar motor shows the same push with safe parts.'],
    ['Faraday\'s 1821 rotation is often called the first electric motor. What did it turn?', 'Electric current into continuous motion', ['Motion into electric current', 'Light into electricity', 'Heat into magnetism'], 'Current in a magnetic field feels a force. Faraday arranged it so the force kept pushing the wire round and round.']
  ];
  G('from-scratch.simple-motor', function (R, ctx) {
    var kind = by(ctx, R.pick(['flip', 'hist', 'force', 'spin']), R.pick(['force', 'flip', 'solveI', 'hist']), R.pick(['solveI', 'short', 'force', 'hist']));
    var who = R.pick(KIDS);
    if (kind === 'hist') return recall(R, HIST3);
    if (kind === 'flip') {
      var c = R.pick([['the magnet upside down', 'It spins the other way'], ['the battery upside down', 'It spins the other way'], ['both the magnet and the battery upside down', 'It spins the same way as before'], ['to a fresher battery with the same poles', 'It spins the same way, a little faster']]);
      return { q: 'A homopolar motor spins clockwise. ' + who + ' changes ' + c[0] + '. What happens?', a: MC(c[1], ['It spins the other way', 'It spins the same way as before', 'It stops for good', 'It spins the same way, a little faster']),
        steps: ['The force depends on the direction of the current and the direction of the magnetic field.', 'Reversing one of them reverses the force; reversing both leaves it the same.'] };
    }
    if (kind === 'spin') {
      var tps = R.int(3, 12), s = R.pick([10, 20, 30, 60]);
      return { q: who + '\'s motor turns $' + tps + '$ times every second. How many turns does it make in $' + s + '$ seconds?', a: AX(tps * s), steps: ['$' + tps + ' \\times ' + s + ' = ' + tps * s + '$ turns.'] };
    }
    if (kind === 'force') {
      var B = R.pick([0.2, 0.3, 0.4, 0.5]), I = R.pick([1, 2, 3, 4, 5]), Lc = R.pick([0.5, 1, 1.5, 2]), F = B * I * Lc / 100 * 1000;
      return { q: 'A copper wire carries $' + I + '$ A across a magnetic field of $' + B + '$ T. The part of the wire in the field is $' + Lc + '$ cm long and crosses the field at right angles. Using $F = BIL$, what is the force on it in millinewtons?',
        a: A(F, 3), unit: 'mN', steps: ['Change cm to m: $' + Lc + '$ cm $= ' + tv(Lc / 100) + '$ m.', '$F = ' + B + ' \\times ' + I + ' \\times ' + tv(Lc / 100) + ' = ' + tv(sg(F / 1000, 3)) + '$ N $= ' + tv(sg(F, 3)) + '$ mN.', 'Small, about the weight of a paper clip, but the wire is light, so it spins.'], hint: 'F = B × I × L with L in meters.' };
    }
    if (kind === 'solveI') {
      var B2 = R.pick([0.2, 0.25, 0.4, 0.5]), L2 = R.pick([0.01, 0.02]), I2 = R.int(1, 5), F2 = fx(B2 * I2 * L2 * 1000);
      return { q: 'A wire $' + tv(L2 * 100) + '$ cm long sits at right angles to a $' + B2 + '$ T field and feels a force of $' + tv(F2) + '$ mN. What current flows in it?', a: A(I2, 3, 0.01), unit: 'A',
        steps: ['$I = F / (BL)$.', '$' + tv(F2) + '$ mN $= ' + tv(F2 / 1000) + '$ N, and $L = ' + L2 + '$ m.', '$I = ' + tv(F2 / 1000) + ' \\div (' + B2 + ' \\times ' + L2 + ') = ' + I2 + '$ A.'] };
    }
    var r = R.pick([0.15, 0.2, 0.25, 0.3]), Isc = 1.5 / r;
    return { q: 'The motor\'s copper wire is almost a short circuit across a $1.5$ V AA cell. If the only real resistance is the cell\'s own $' + r + '\\ \\Omega$, about what current flows?', a: A(Isc, 3), unit: 'A',
      steps: ['$I = V / R = 1.5 \\div ' + r + ' = ' + tv(sg(Isc, 3)) + '$ A.', 'That is why the wire and battery get hot within seconds. Run the motor in short bursts.'], hint: 'I = V/R.' };
  });

  // ---------- from-scratch.hand-generator
  var HIST4 = [
    ['On 29 August 1831 Faraday wound two coils on an iron ring. When did the needle on the second coil\'s meter move?', 'Only at the moment he connected or disconnected the battery', ['All the time the battery was connected', 'Never', 'Only when the ring was heated'], 'A steady current made no reading. Only a change in the magnetism made a current: that is induction.'],
    ['What instrument did Faraday use to see the tiny induced currents?', 'A galvanometer, a sensitive needle meter', ['A light bulb', 'A thermometer', 'A telescope'], 'A galvanometer\'s needle swings when a small current flows.'],
    ['A magnet rests, not moving, inside a coil connected to a meter. What does the meter read?', 'Zero', ['A steady large current', 'A current that grows', 'It depends on the magnet\'s color'], 'Only a changing magnetic flux makes a voltage. A still magnet makes none.'],
    ['You shake a magnet back and forth through a coil. What kind of current comes out?', 'Alternating current: it flips direction each stroke', ['Direct current in one direction only', 'No current', 'Current only when the magnet stops'], 'Moving in makes current one way; moving out makes it the other way.'],
    ['Faraday turned a copper disc between the poles of a magnet. What did it make?', 'A steady current: an early generator', ['Light', 'A louder sound', 'Nothing at all'], 'The spinning disc cut through the magnetic field all the time and made a steady current, an early dynamo.']
  ];
  G('from-scratch.hand-generator', function (R, ctx) {
    var kind = by(ctx, R.pick(['ratio', 'hist', 'emf']), R.pick(['emf', 'ratio', 'turns', 'hist']), R.pick(['emf', 'turns', 'flux', 'hist']));
    var who = R.pick(KIDS);
    if (kind === 'hist') return recall(R, HIST4);
    if (kind === 'ratio') {
      var c = R.pick([['twice as many turns', 2], ['three times as many turns', 3], ['the magnet moving twice as fast', 2], ['the magnet moving three times as fast', 3], ['half as many turns', 0.5]]), v = R.pick([0.2, 0.3, 0.4, 0.6, 0.8]);
      return { q: 'Pushing a magnet into ' + who + '\'s coil makes $' + v + '$ V. About what voltage comes from ' + c[0] + ', everything else the same?', a: A(v * c[1], 3, 0.01), unit: 'V',
        steps: ['Faraday\'s law: the voltage is proportional to the number of turns and to how fast the flux changes.', '$' + v + ' \\times ' + c[1] + ' = ' + tv(fx(v * c[1])) + '$ V.'] };
    }
    if (kind === 'emf') {
      var N = R.int(2, 10) * 100, dphi = R.pick([0.05, 0.1, 0.2, 0.3]), dt = R.pick([0.05, 0.1, 0.2, 0.25]), E = N * dphi / 1000 / dt;
      return { q: 'A coil has $' + N + '$ turns. Pushing a magnet in changes the flux through each turn by $' + dphi + '$ mWb in $' + dt + '$ s. What average voltage is induced? Use $\\mathcal{E} = N\\,\\Delta\\Phi/\\Delta t$.',
        a: A(E, 3), unit: 'V', steps: ['$\\Delta\\Phi = ' + dphi + '$ mWb $= ' + tv(dphi / 1000) + '$ Wb.', '$\\mathcal{E} = ' + N + ' \\times ' + tv(dphi / 1000) + ' \\div ' + dt + ' = ' + tv(sg(E, 3)) + '$ V.'], hint: 'Change mWb to Wb first.' };
    }
    if (kind === 'turns') {
      var dphi2 = R.pick([0.05, 0.1, 0.2]), dt2 = R.pick([0.05, 0.1]), need = R.pick([1.8, 2, 3]), per = dphi2 / 1000 / dt2, Nn = Math.ceil(fx(need / per) - 1e-9);
      return { q: 'Each turn of a coil makes $' + tv(fx(per * 1000)) + '$ mV when ' + who + ' shakes the magnet. At least how many turns are needed to reach $' + need + '$ V, enough to light an LED?', a: AX(Nn),
        steps: ['$' + need + '$ V $= ' + need * 1000 + '$ mV.', '$' + need * 1000 + ' \\div ' + tv(fx(per * 1000)) + ' = ' + tv(sg(need / per, 4)) + '$, so round up to $' + Nn + '$ turns.'] };
    }
    var B = R.pick([0.1, 0.2, 0.3, 0.4]), dcm = R.pick([1, 2, 3]), A2 = Math.PI * Math.pow(dcm / 200, 2), phi = B * A2 * 1e6;
    return { q: 'A magnet makes a field of about $' + B + '$ T across one turn of a coil $' + dcm + '$ cm in diameter. What is the flux through that turn, in microwebers? Use $\\Phi = BA$ and $A = \\pi r^2$.',
      a: A(phi, 3), unit: 'µWb', steps: ['Radius $r = ' + tv(dcm / 2) + '$ cm $= ' + tv(dcm / 200) + '$ m.', '$A = \\pi r^2 \\approx ' + tv(sg(A2, 3)) + '\\ \\text{m}^2$.', '$\\Phi = ' + B + ' \\times ' + tv(sg(A2, 3)) + ' \\approx ' + tv(sg(phi, 3)) + '\\ \\mu$Wb.'] };
  });

  // ---------- from-scratch.telegraph
  var MO = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..' };
  var WORDS = ['SOS', 'HI', 'CAT', 'DOG', 'SUN', 'MOM', 'DAD', 'TEA', 'MAP', 'OWL', 'ANT', 'BEE', 'FOX', 'HAT', 'NET', 'RUN', 'TEN', 'WET', 'ZOO', 'KEY'];
  function show(code) { return code.replace(/\./g, '·').replace(/-/g, '–'); }
  function units(code) { var u = 0; code.split('').forEach(function (s, i) { u += (s === '.' ? 1 : 3) + (i ? 1 : 0); }); return u; }
  var HIST5 = [
    ['What was the first message Samuel Morse sent on the line from Washington to Baltimore on 24 May 1844?', '"What hath God wrought"', ['"Mr. Watson, come here"', '"Hello, world"', '"One small step"'], 'The words, from the Bible (Numbers 23:23), were chosen by Annie Ellsworth, a friend\'s daughter.'],
    ['Who worked with Morse to build the telegraph and its code?', 'Alfred Vail', ['Thomas Edison', 'Alessandro Volta', 'Johannes Gutenberg'], 'Alfred Vail helped build the instruments and shape the dot-and-dash code.'],
    ['What part of a telegraph sounder makes the click?', 'An electromagnet pulling down an iron bar', ['A tiny speaker', 'A whistle', 'A bell rung by hand'], 'Closing the key sends current to the electromagnet at the far end, which snaps an iron bar down: click.'],
    ['In International Morse code, how long is a dash compared with a dot?', 'Three times as long', ['Twice as long', 'The same length', 'Ten times as long'], 'Dot = 1 unit, dash = 3 units, the gap inside a letter = 1, between letters = 3, between words = 7.']
  ];
  G('from-scratch.telegraph', function (R, ctx) {
    var kind = by(ctx, R.pick(['enc', 'dec', 'hist']), R.pick(['word', 'units', 'enc', 'wpm']), R.pick(['wordtime', 'units', 'word', 'hist']));
    var letters = Object.keys(MO);
    if (kind === 'hist') return recall(R, HIST5);
    if (kind === 'enc') {
      var L = R.pick(letters), wr = R.sample(letters.filter(function (x) { return x !== L; }), 3).map(function (x) { return show(MO[x]); });
      return { q: 'Which is the Morse code for the letter <b>' + L + '</b>?', a: MC(show(MO[L]), wr), steps: [L + ' is ' + show(MO[L]) + '.'] };
    }
    if (kind === 'dec') {
      var L2 = R.pick(letters);
      return { q: 'Decode this Morse letter: <b>' + show(MO[L2]) + '</b>. Type the letter.', a: { t: 'text', v: [L2] }, steps: [show(MO[L2]) + ' is ' + L2 + '.'], hint: 'Look it up in the code table in the lesson.' };
    }
    if (kind === 'word') {
      var w = R.pick(WORDS);
      return { q: 'Decode this word (letters are separated by spaces): <b>' + w.split('').map(function (c) { return show(MO[c]); }).join('&nbsp;&nbsp; ') + '</b>', a: { t: 'text', v: [w] }, steps: w.split('').map(function (c) { return show(MO[c]) + ' = ' + c; }) };
    }
    if (kind === 'units') {
      var L3 = R.pick(letters.filter(function (x) { return MO[x].length >= 2; })), u = units(MO[L3]);
      return { q: 'In International Morse code a dot lasts 1 unit, a dash 3 units, and the gap between parts of one letter 1 unit. How many units long is the letter <b>' + L3 + '</b> (' + show(MO[L3]) + '), from the start of its first mark to the end of its last?',
        a: AX(u), steps: ['Marks: ' + MO[L3].split('').map(function (s) { return s === '.' ? '1' : '3'; }).join(' + ') + ' = ' + MO[L3].split('').reduce(function (a, s) { return a + (s === '.' ? 1 : 3); }, 0) + '.', 'Gaps inside the letter: ' + (MO[L3].length - 1) + ' × 1.', 'Total: $' + u + '$ units.'] };
    }
    if (kind === 'wpm') {
      var wpm = R.pick([5, 6, 8, 10, 12, 15, 20, 24, 25]), dot = 1200 / wpm;
      return { q: 'A common rule: at $W$ words per minute, one dot lasts $1200/W$ milliseconds (the standard word "PARIS" is 50 units long). How long is one dot at $' + wpm + '$ words per minute, in milliseconds?', a: A(dot, 3, 0.01), unit: 'ms',
        steps: ['$1200 \\div ' + wpm + ' = ' + tv(sg(dot, 4)) + '$ ms.', 'A dash is three times that: about $' + tv(sg(3 * dot, 4)) + '$ ms.'] };
    }
    var w2 = R.pick(WORDS), tot = 0; w2.split('').forEach(function (c, i) { tot += units(MO[c]) + (i ? 3 : 0); });
    var wpm2 = R.pick([6, 10, 12, 20]), sec = tot * 1200 / wpm2 / 1000;
    return { q: 'The word <b>' + w2 + '</b> is ' + w2.split('').map(function (c) { return show(MO[c]); }).join('&nbsp;&nbsp; ') + '. Counting a dot as 1 unit, a dash as 3, gaps inside letters as 1 and gaps between letters as 3, it is $' + tot + '$ units long. At $' + wpm2 + '$ words per minute a unit lasts $1200/' + wpm2 + '$ ms. How many seconds does the word take to send?',
      a: A(sec, 3), unit: 's', steps: ['One unit: $1200 \\div ' + wpm2 + ' = ' + tv(sg(1200 / wpm2, 4)) + '$ ms.', '$' + tot + ' \\times ' + tv(sg(1200 / wpm2, 4)) + ' = ' + tv(sg(tot * 1200 / wpm2, 4)) + '$ ms $\\approx ' + tv(sg(sec, 3)) + '$ s.'] };
  });

  // ---------- from-scratch.filament-bulb
  var HIST6 = [
    ['Why did early lamp makers pump the air out of the bulb?', 'Oxygen in air makes a white-hot filament burn away', ['Air makes the glass too heavy', 'Air blocks light', 'A vacuum makes the electricity stronger'], 'Hot carbon or metal combines with oxygen and burns through. With little or no oxygen, the filament lasts.'],
    ['After cotton thread and cardboard, which carbonized material did Edison\'s company find worked best through the 1880s?', 'Bamboo', ['Copper wire', 'Glass fiber', 'Rubber'], 'Carbonized bamboo, the best from a grove near Kyoto, Japan, became the standard filament for about ten years.'],
    ['Which inventor in Britain also made carbon-filament lamps around 1878 to 1880?', 'Joseph Swan', ['Samuel Morse', 'William Sturgeon', 'Alfred Vail'], 'Joseph Swan worked on carbon lamps in England. He and Edison later joined in the Edison and Swan company (1883).'],
    ['What metal replaced carbon in most filaments in the early 1900s?', 'Tungsten', ['Lead', 'Aluminum', 'Gold'], 'Tungsten melts at a very high temperature, so it can glow whiter and last longer.'],
    ['Most of the energy going into an ordinary incandescent bulb comes out as what?', 'Heat', ['Visible light', 'Sound', 'Radio waves'], 'An incandescent bulb gives off most of its energy, around nine-tenths, as heat. That is why LEDs save so much energy.']
  ];
  G('from-scratch.filament-bulb', function (R, ctx) {
    var kind = by(ctx, R.pick(['power', 'hist', 'energy']), R.pick(['resist', 'current', 'energy', 'hist']), R.pick(['led', 'resist', 'eff', 'hist']));
    var who = R.pick(KIDS);
    if (kind === 'hist') return recall(R, HIST6);
    if (kind === 'power') {
      var V = R.pick([2.4, 3, 3.6, 4.8, 6]), I = R.pick([0.2, 0.25, 0.3, 0.5, 0.75]), P = V * I;
      return { q: 'A small flashlight bulb runs on $' + V + '$ V and draws $' + I + '$ A. What power does it use?', a: A(P, 3, 0.01), unit: 'W', steps: ['$P = VI$.', '$' + V + ' \\times ' + I + ' = ' + tv(fx(P)) + '$ W.'], hint: 'Power = voltage × current.' };
    }
    if (kind === 'resist') {
      var V2 = R.pick([2.4, 3, 6, 12]), I2 = R.pick([0.2, 0.25, 0.3, 0.5]), Rr = V2 / I2;
      return { q: 'A bulb glows at $' + V2 + '$ V with a current of $' + I2 + '$ A. What is the hot filament\'s resistance?', a: A(Rr, 3, 0.01), unit: 'Ω', steps: ['$R = V/I$.', '$' + V2 + ' \\div ' + I2 + ' = ' + tv(sg(Rr, 4)) + '\\ \\Omega$.', 'Cold, the same filament has a much lower resistance: a tungsten filament\'s resistance rises roughly tenfold as it heats up.'] };
    }
    if (kind === 'current') {
      var P2 = R.pick([0.5, 0.75, 1, 1.2, 1.5]), V3 = R.pick([2.5, 3, 6]), I3 = P2 / V3;
      return { q: 'A $' + P2 + '$ W bulb runs on $' + V3 + '$ V. What current does it draw, in amps?', a: A(I3, 3), unit: 'A', steps: ['$I = P / V$.', '$' + P2 + ' \\div ' + V3 + ' \\approx ' + tv(sg(I3, 3)) + '$ A.'] };
    }
    if (kind === 'energy') {
      var W2 = R.pick([40, 60, 75, 100]), h = R.pick([3, 4, 5, 6, 8]), d = R.pick([10, 20, 30]), kwh = W2 * h * d / 1000;
      return { q: 'A $' + W2 + '$ W incandescent bulb is on $' + h + '$ hours a day for $' + d + '$ days. How many kilowatt-hours is that?', a: A(kwh, 3, 0.01), unit: 'kWh', steps: ['Energy = power × time: $' + W2 + ' \\times ' + h + ' \\times ' + d + ' = ' + W2 * h * d + '$ watt-hours.', 'Divide by 1000: $' + tv(kwh) + '$ kWh.'] };
    }
    if (kind === 'led') {
      var pair = R.pick([[60, 9], [60, 8], [40, 6], [75, 11], [100, 15]]), h2 = R.pick([2, 4, 5, 6]), d2 = R.pick([30, 100, 365]), save = (pair[0] - pair[1]) * h2 * d2 / 1000;
      return { q: who + ' swaps a $' + pair[0] + '$ W incandescent bulb for a $' + pair[1] + '$ W LED bulb that gives about the same light. Used $' + h2 + '$ hours a day for $' + d2 + '$ days, how many kilowatt-hours does that save?', a: A(save, 3, 0.01), unit: 'kWh',
        steps: ['Power saved: $' + pair[0] + ' - ' + pair[1] + ' = ' + (pair[0] - pair[1]) + '$ W.', '$' + (pair[0] - pair[1]) + ' \\times ' + h2 + ' \\times ' + d2 + ' = ' + (pair[0] - pair[1]) * h2 * d2 + '$ Wh $= ' + tv(fx(save)) + '$ kWh.'] };
    }
    var Pin = R.pick([40, 60, 100]), pct = R.pick([5, 8, 10]), light = Pin * pct / 100;
    return { q: 'Suppose a $' + Pin + '$ W incandescent bulb turns about $' + pct + '\\%$ of its power into visible light. How many watts become heat and other invisible radiation?', a: A(Pin - light, 3, 0.01), unit: 'W',
      steps: ['Light: $' + pct + '\\% \\times ' + Pin + ' = ' + tv(light) + '$ W.', 'The rest: $' + Pin + ' - ' + tv(light) + ' = ' + tv(fx(Pin - light)) + '$ W.'] };
  });

  // ---------- from-scratch.crystal-radio
  var HIST7 = [
    ['Where does a crystal radio get the energy to make sound?', 'From the radio waves sent out by the station', ['From a hidden battery', 'From the wall outlet', 'From the warmth of the room'], 'The antenna catches a tiny bit of the station\'s radio energy. That is all the earphone gets, so it must be very sensitive.'],
    ['What does the diode (the "crystal") do in a crystal radio?', 'It lets current through one way only, so the earphone can follow the sound', ['It picks the station', 'It makes the signal louder with a battery', 'It stores the music'], 'The radio wave flips back and forth too fast to hear. The diode keeps one half, and the earphone follows the slow changes in strength, which are the sound.'],
    ['What part of a crystal radio picks one station out of many?', 'The coil and the tuning capacitor (the tuned circuit)', ['The diode', 'The earphone', 'The ground wire'], 'A coil and a capacitor together resonate at one frequency, f = 1/(2π√(LC)).'],
    ['Which earphone works with a crystal radio?', 'A high-impedance crystal (piezo) earphone', ['Ordinary low-impedance earbuds', 'A loudspeaker', 'Any earphone with a battery pack'], 'The signal is so weak that it needs a high-impedance earphone. Ordinary earbuds use too much current.'],
    ['In 1906 Greenleaf Whittier Pickard patented a detector made of which material?', 'Silicon', ['Copper', 'Glass', 'Rubber'], 'Pickard\'s silicon detector used a fine wire touching the crystal, the "cat\'s whisker".'],
    ['Where must you never put a radio antenna wire?', 'Anywhere near power lines', ['Along a wooden fence', 'Between two small trees', 'Across a backyard you can reach from the ground'], 'Never near power lines, and take it down or disconnect it before thunderstorms.']
  ];
  G('from-scratch.crystal-radio', function (R, ctx) {
    var kind = by(ctx, R.pick(['hist', 'which', 'wave']), R.pick(['freq', 'which', 'wave', 'hist']), R.pick(['freq', 'cap', 'ratio', 'hist']));
    if (kind === 'hist') return recall(R, HIST7);
    if (kind === 'which') {
      var up = R.coin();
      return { q: 'You turn the tuning capacitor to ' + (up ? 'more' : 'less') + ' capacitance. What happens to the frequency the radio picks up?', a: MC(up ? 'It goes down' : 'It goes up', ['It goes down', 'It goes up', 'It stays the same', 'The radio turns off']),
        steps: ['$f = \\dfrac{1}{2\\pi\\sqrt{LC}}$: C is under the square root in the bottom.', (up ? 'Bigger C makes the bottom bigger, so f goes down.' : 'Smaller C makes the bottom smaller, so f goes up.')] };
    }
    if (kind === 'wave') {
      var f = R.pick([540, 600, 660, 700, 750, 880, 950, 1000, 1200, 1500]), lam = 3e8 / (f * 1000);
      return { q: 'An AM station broadcasts at $' + f + '$ kHz. Radio waves travel at about $3 \\times 10^8$ m/s. What is the wavelength, in meters? Use $\\lambda = c/f$.', a: A(lam, 3), unit: 'm',
        steps: ['$f = ' + f + '$ kHz $= ' + T.commas(f * 1000) + '$ Hz.', '$\\lambda = 3 \\times 10^8 \\div ' + T.commas(f * 1000) + ' \\approx ' + tv(sg(lam, 3)) + '$ m.', 'AM waves are hundreds of meters long, which is why a long antenna wire helps.'] };
    }
    if (kind === 'freq') {
      var L = R.pick([200, 230, 240, 250, 300]), C = R.pick([40, 60, 80, 100, 150, 200, 250, 300, 365]), fk = 1 / (2 * Math.PI * Math.sqrt(L * 1e-6 * C * 1e-12)) / 1000;
      return { q: 'A crystal radio has a $' + L + '\\ \\mu$H coil and its tuning capacitor is set to $' + C + '$ pF. What frequency does it tune to, in kHz? Use $f = \\dfrac{1}{2\\pi\\sqrt{LC}}$.', a: A(fk, 3), unit: 'kHz',
        steps: ['$L = ' + L + ' \\times 10^{-6}$ H, $C = ' + C + ' \\times 10^{-12}$ F.', '$LC = ' + tv(sg(L * C, 4)) + ' \\times 10^{-18}$, and $\\sqrt{LC} \\approx ' + tv(sg(Math.sqrt(L * C) / 10, 3)) + ' \\times 10^{-8}$ s.', '$f = 1 \\div (2\\pi \\times ' + tv(sg(Math.sqrt(L * C) / 10, 3)) + ' \\times 10^{-8}) \\approx ' + T.commas(sg(fk * 1000, 3)) + '$ Hz $\\approx ' + tv(sg(fk, 3)) + '$ kHz.'] };
    }
    if (kind === 'cap') {
      var L2 = R.pick([200, 240, 250, 300]), f2 = R.pick([600, 700, 800, 900, 1000, 1100, 1200, 1400]), C2 = 1 / (Math.pow(2 * Math.PI * f2 * 1000, 2) * L2 * 1e-6) * 1e12;
      return { q: 'With a $' + L2 + '\\ \\mu$H coil, what capacitance (in pF) tunes a crystal radio to $' + f2 + '$ kHz? Rearranged, $C = \\dfrac{1}{(2\\pi f)^2 L}$.', a: A(C2, 3), unit: 'pF',
        steps: ['$2\\pi f = 2\\pi \\times ' + T.commas(f2 * 1000) + ' \\approx ' + tv(sg(2 * Math.PI * f2 * 1000, 4)) + '$ per second.', 'Square it and multiply by $L = ' + L2 + ' \\times 10^{-6}$ H, then take 1 over the result.', '$C \\approx ' + tv(sg(C2, 3)) + '$ pF.'] };
    }
    var k = R.pick([4, 9, 0.25]), fr = R.pick([600, 800, 1000, 1200]), nf = fr / Math.sqrt(k);
    return { q: 'A radio is tuned to $' + fr + '$ kHz. If the capacitance is made $' + (k < 1 ? '\\tfrac{1}{4}' : k) + '$ times as big, with the same coil, what frequency does it tune to, in kHz?', a: A(nf, 4, 0.01), unit: 'kHz',
      steps: ['$f$ is proportional to $1/\\sqrt{C}$.', 'Multiplying C by ' + (k < 1 ? '1/4' : k) + ' divides f by $\\sqrt{' + (k < 1 ? '1/4' : k) + '} = ' + tv(Math.sqrt(k)) + '$.', '$' + fr + ' \\div ' + tv(Math.sqrt(k)) + ' \\approx ' + tv(sg(nf, 4)) + '$ kHz.'] };
  });

  // ---------- from-scratch.printing-press
  var SYM = ['A', 'H', 'I', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y'], ASYM = ['B', 'C', 'D', 'E', 'F', 'G', 'J', 'K', 'L', 'N', 'P', 'Q', 'R', 'S', 'Z'];
  var PW = ['MAINZ', 'PRESS', 'BIBLE', 'PAPER', 'INK', 'TYPE', 'BOOK', 'PAGE', 'LEAD', 'TIN', 'CASE', 'SORT', 'FORME', 'PRINT', 'WORDS', 'LIGHT'];
  var HIST8 = [
    ['Why are capital letters called "upper case"?', 'Printers kept capitals in the upper of two type trays', ['Capitals are taller than other letters', 'Kings ordered capitals for important words', 'They were printed on the top line only'], 'Small letters, used more often, sat in the lower case, nearer the hand. The names stuck to the letters.'],
    ['What was most of Gutenberg\'s type metal made of?', 'Lead, with tin and antimony added', ['Pure iron', 'Copper and zinc', 'Wood soaked in oil'], 'The alloy melts easily, fills the mould sharply and hardens fast.'],
    ['In typecasting, what is a matrix?', 'A piece of softer metal with a letter struck into it, used as the mould\'s bottom', ['A sheet of printed paper', 'The screw of the press', 'A frame that holds the lines'], 'A steel punch is struck into copper to make the matrix. The hand mould around it casts the sort.'],
    ['Why did printers use oil-based ink instead of scribes\' watery ink?', 'Watery ink runs off metal type; sticky oil-based ink clings to it', ['Oil-based ink was cheaper than water', 'It dried slower', 'Scribes did not use ink'], 'Printing ink was more like a varnish with soot in it.'],
    ['About when was the Gutenberg Bible finished?', 'About 1454 to 1455', ['About 1066', 'About 1600', 'About 1776'], 'Work began soon after 1450, and finished copies existed by 1454 or 1455.'],
    ['About how many copies of the Gutenberg Bible were printed?', 'About 180', ['About 5', 'About 18,000', 'About 1 million'], 'Estimates run from about 160 to 185; a letter of 1455 mentions 158 or 180.'],
    ['Gutenberg\'s press was adapted from what older kind of machine?', 'A screw press, like those used for wine grapes and olives', ['A water wheel', 'A loom for weaving', 'A spinning wheel'], 'A big wooden screw squeezed the paper evenly down onto the inked type.'],
    ['Why is each letter on a piece of type made backward?', 'So it prints the right way round when pressed onto paper', ['To hide secrets from other printers', 'Because German was written backward', 'To save metal'], 'Printing flips left and right, like a stamp. A backward letter prints forward.']
  ];
  G('from-scratch.printing-press', function (R, ctx) {
    var kind = by(ctx, R.pick(['mirror', 'hist', 'rev']), R.pick(['scribe', 'rev', 'press', 'hist']), R.pick(['press', 'just', 'scribe', 'hist']));
    var who = R.pick(KIDS);
    if (kind === 'hist') return recall(R, HIST8);
    if (kind === 'mirror') {
      var s = R.pick(SYM), w = R.sample(ASYM, 3);
      return { q: 'A sort carries its letter backward (mirrored left to right). Which capital looks exactly the same on the sort as it does on the printed page?', a: MC(s, w), steps: [s + ' is the same on both sides of an up-and-down line through its middle, so its mirror image looks the same.', 'Letters like ' + w.join(', ') + ' face one way, so on the sort they look backward.'] };
    }
    if (kind === 'rev') {
      var wd = R.pick(PW), rv = wd.split('').reverse().join('');
      return { q: 'You look straight down at the face of the type for the word <b>' + wd + '</b>, locked in the forme. Reading left to right, in what order do you see the letters? (Each letter is also backward; just type the order.)', a: { t: 'text', v: [rv] },
        steps: ['The type is a mirror image of the page, so the whole word is reversed.', 'Left to right on the metal: ' + rv.split('').join(' ') + '.'] };
    }
    if (kind === 'scribe') {
      var pages = R.pick([200, 300, 400, 600, 800, 1288]), ppd = R.pick([4, 5, 6, 8]), days = Math.ceil(fx(pages / ppd) - 1e-9);
      return { q: 'A scribe copies about $' + ppd + '$ pages a day. How many working days does it take to copy a book of $' + T.commas(pages) + '$ pages? (Round up to whole days.)', a: AX(days),
        steps: ['$' + T.commas(pages) + ' \\div ' + ppd + ' = ' + tv(sg(pages / ppd, 5)) + '$.', 'Round up: $' + days + '$ working days, for one copy.'] };
    }
    if (kind === 'press') {
      var copies = R.pick([100, 150, 180, 200, 300]), rate = R.pick([200, 240, 250]), sheets = R.pick([4, 5, 10, 20]), imp = copies * sheets * 2, hrs = imp / rate;
      return { q: 'A printer makes $' + copies + '$ copies of a small book. Each copy uses $' + sheets + '$ sheets, printed on both sides. A press crew pulls about $' + rate + '$ impressions (one side of one sheet) an hour. How many hours of pulling is that?', a: A(hrs, 3, 0.01), unit: 'h',
        steps: ['Impressions: $' + copies + ' \\times ' + sheets + ' \\times 2 = ' + T.commas(imp) + '$.', '$' + T.commas(imp) + ' \\div ' + rate + ' = ' + tv(sg(hrs, 4)) + '$ hours, after the type is set.'] };
    }
    var meas = R.pick([40, 48, 60]), gaps = R.pick([2, 3, 4, 5]), each = R.int(2, 4), letters = meas - gaps * each;
    return { q: 'A line of type must fill a measure of $' + meas + '$ units. Its letters take up $' + letters + '$ units and it has $' + gaps + '$ gaps between words. To justify the line with equal spaces, how wide is each space?', a: AX(each), unit: 'units',
      steps: ['Space left to fill: $' + meas + ' - ' + letters + ' = ' + (meas - letters) + '$ units.', 'Shared among ' + gaps + ' gaps: $' + (meas - letters) + ' \\div ' + gaps + ' = ' + each + '$ units each.'] };
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
