/* Inventors Ladder: generators for Flight (course key invflight): history recall and the science and math of each topic.
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
  var WR_TL = [[1867, 'Wilbur Wright is born'], [1871, 'Orville Wright is born'], [1878, 'their father brings home a toy helicopter'], [1892, 'the brothers open a bicycle shop'], [1896, 'Otto Lilienthal dies in a glider crash'], [1899, 'Wilbur writes to the Smithsonian'], [1900, 'the first Wright glider at Kitty Hawk'], [1901, 'the wind tunnel in Dayton'], [1902, 'the glider with a movable rudder'], [1903, 'the first powered flights'], [1905, 'a 39-minute flight at Huffman Prairie'], [1908, 'public flights in France and Virginia'], [1912, 'Wilbur dies'], [1948, 'Orville dies']];
  function lift(k, S, V, c) { return k * S * V * V * c; }

  // ---------- invflight.wright-gliders
  var WG_F = [
    ['What did the Wrights solve first?', 'Control: balancing and steering the machine', ['A powerful engine', 'A metal frame', 'Jet propulsion', 'A retractable wheel'], 'Wing-warping, then a movable rudder.'],
    ['What gave Wilbur the idea of wing-warping?', 'Twisting a long cardboard inner-tube box', ['A falling leaf', 'A kite string breaking', 'A bat\'s wing', 'A boat\'s rudder'], 'The top and bottom twisted opposite ways at each end.'],
    ['Why did the Wrights build a wind tunnel in 1901?', 'Their glider gave far less lift than the published tables promised', ['To test engines', 'To cool their shop', 'To dry paint', 'To test bicycle tires'], 'About a third of the predicted lift.'],
    ['What was wrong with Smeaton\'s coefficient in the old tables?', 'It was too large: about 0.0033, not 0.005', ['It was too small', 'It was negative', 'It changed with the weather', 'Nothing was wrong'], 'Their tunnel measurements fixed it.'],
    ['Why did the Wrights choose Kitty Hawk?', 'Strong, steady winds and soft sand', ['It was near their home', 'It had a factory', 'It was in the mountains', 'It had a railroad'], 'They asked the Weather Bureau.'],
    ['What are the three directions a pilot must control?', 'Pitch, roll and yaw', ['Up, down and fast', 'Lift, drag and thrust', 'North, south and east', 'Speed, height and fuel'], 'Elevator for pitch, warping for roll, rudder for yaw.'],
    ['Whose death in 1896 led the Wrights to study flight?', 'Otto Lilienthal\'s', ['Leonardo da Vinci\'s', 'Samuel Langley\'s', 'Octave Chanute\'s', 'George Cayley\'s'], 'He died after a glider crash.'],
    ['What did the Wrights\' wind tunnel balances use?', 'Bicycle spokes and hacksaw blades', ['Gold springs', 'Electric scales', 'Glass tubes', 'Pulleys and ropes'], 'Made in their bicycle shop.']
  ];
  G('invflight.wright-gliders', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'first', 'sq']), R.pick(['lift', 'sq', 'gap', 'fact']), R.pick(['lift', 'old', 'need', 'gap']));
    if (kind === 'fact') return fact(R, WG_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, WR_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, WR_TL, 'The Wrights'); });
    if (kind === 'sq') { var f = R.pick([2, 3, 4, 0.5]), L0 = R.pick([50, 80, 100, 120, 200]);
      return { q: 'A wing gives ' + L0 + ' pounds of lift. If the air speed is multiplied by ' + f + ' and nothing else changes, what is the new lift?', a: AX(L0 * f * f), unit: 'pounds', steps: ['Lift goes with the square of the speed: $' + f + '^2 = ' + fx(f * f) + '$.', '$' + L0 + ' \\times ' + fx(f * f) + ' = ' + fx(L0 * f * f) + '$ pounds.'] }; }
    var S = R.pick([100, 150, 200, 250, 300, 500]), V = R.pick([10, 15, 20, 25, 30]), c = R.pick([0.3, 0.4, 0.5, 0.6, 0.8]), L = lift(0.0033, S, V, c);
    if (kind === 'lift') return { q: 'Use the Wrights\' lift equation $L = kSV^2C_L$ with $k = 0.0033$. A wing has area ' + S + ' sq ft and $C_L = ' + c + '$, in air moving at ' + V + ' mph. What is the lift, in pounds?', a: AR(L, 0.02), unit: 'pounds',
      steps: ['$L = 0.0033 \\times ' + S + ' \\times ' + V + '^2 \\times ' + c + '$.', '$' + V + '^2 = ' + V * V + '$, so $L = ' + fx(L) + '$ pounds.'] };
    if (kind === 'old') { var Ls = lift(0.005, S, V, c); return { q: 'A wing of ' + S + ' sq ft with $C_L = ' + c + '$ flies at ' + V + ' mph. The old tables used $k = 0.005$; the Wrights measured $k = 0.0033$. How many more pounds of lift did the old number promise than the wing really gave?', a: AR(Ls - L, 0.02), unit: 'pounds',
      steps: ['Old: $0.005 \\times ' + S + ' \\times ' + V * V + ' \\times ' + c + ' = ' + fx(Ls) + '$.', 'New: $0.0033 \\times ' + S + ' \\times ' + V * V + ' \\times ' + c + ' = ' + fx(L) + '$.', 'Difference: $' + fx(Ls - L) + '$ pounds.'] }; }
    var W0 = R.pick([300, 400, 500, 600, 700]), Sx = R.pick([300, 400, 500]), cc = R.pick([0.5, 0.6, 0.7]), v = M.sqrt(W0 / (0.0033 * Sx * cc));
    return { q: 'A glider and pilot weigh ' + W0 + ' pounds. The wing has ' + Sx + ' sq ft and $C_L = ' + cc + '$. With $k = 0.0033$, about what air speed in mph gives enough lift to carry them? (One decimal place.)', a: AR(v, 0.02), unit: 'mph',
      steps: ['Set lift equal to weight: $' + W0 + ' = 0.0033 \\times ' + Sx + ' \\times V^2 \\times ' + cc + '$.', '$V^2 = ' + W0 + ' \\div ' + fx(0.0033 * Sx * cc) + ' \\approx ' + (v * v).toFixed(1) + '$, so $V \\approx ' + v.toFixed(1) + '$ mph.'] };
  });

  // ---------- invflight.wright-flyer
  var FLIGHTS = [[1, 'Orville', 12, 120], [3, 'Orville', 15, 200], [4, 'Wilbur', 59, 852]];
  var WF_F = [
    ['Who built the Wrights\' 1903 engine?', 'Their mechanic, Charlie Taylor', ['Henry Ford', 'Thomas Edison', 'Octave Chanute', 'Samuel Langley'], 'About 12 horsepower, built in about six weeks.'],
    ['How did the Wrights design their propellers?', 'As rotating wings, using their wind-tunnel data', ['By copying ship propellers', 'By trial and error only', 'From Leonardo\'s drawings', 'They bought them'], 'Each part of a blade meets the air at its own speed and angle.'],
    ['How long was the first flight on December 17, 1903?', '12 seconds', ['12 minutes', '59 seconds', '1 hour', '3 seconds'], 'Orville flew 120 feet.'],
    ['How long was the longest flight that day?', '59 seconds, 852 feet, by Wilbur', ['12 seconds, by Orville', '39 minutes, by Wilbur', '2 hours, by Orville', '57 minutes, by Wilbur'], 'The telegram said 57 by mistake.'],
    ['What happened to the 1903 Flyer after the fourth flight?', 'A gust flipped it, and it never flew again', ['It flew to Ohio', 'It was sold to France', 'It burned in a fire that day', 'It flew for ten more years'], 'It is now in the Smithsonian.'],
    ['Why did the propellers turn in opposite directions?', 'So their twisting forces canceled out', ['To go backward', 'To make more noise', 'Because one chain was broken', 'To save fuel'], 'Otherwise the airplane would tend to twist.'],
    ['Where did the Wrights learn to fly in circles in 1904–1905?', 'Huffman Prairie, near Dayton', ['Kitty Hawk', 'Paris', 'Washington', 'Chicago'], 'A cow pasture outside town.'],
    ['Whose government-funded Aerodrome crashed twice in late 1903?', 'Samuel Langley\'s', ['Otto Lilienthal\'s', 'Glenn Curtiss\'s', 'Alberto Santos-Dumont\'s', 'Thomas Edison\'s'], 'Days before the Wrights flew.']
  ];
  G('invflight.wright-flyer', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'first', 'speed']), R.pick(['speed', 'air', 'gap', 'fact']), R.pick(['air', 'ratio', 'gap', 'speed2']));
    if (kind === 'fact') return fact(R, WF_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, WR_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, WR_TL, 'The Wrights'); });
    if (kind === 'speed') { var fl = R.pick(FLIGHTS); return { q: 'Flight ' + fl[0] + ' on December 17, 1903 (' + fl[1] + ') covered ' + fl[3] + ' feet over the ground in ' + fl[2] + ' seconds. What was its average ground speed in feet per second? (One decimal place.)', a: AR(fl[3] / fl[2], 0.02), unit: 'ft/s', steps: ['Speed = distance ÷ time.', '$' + fl[3] + ' \\div ' + fl[2] + ' \\approx ' + (fl[3] / fl[2]).toFixed(1) + '$ ft/s.'] }; }
    if (kind === 'speed2') { var d = R.int(2, 30) * 100, t = R.pick([10, 20, 25, 40, 50]); return { q: 'An early airplane flies ' + cm(d) + ' feet in ' + t + ' seconds. What is its average speed in feet per second?', a: AX(d / t), unit: 'ft/s', steps: ['$' + cm(d) + ' \\div ' + t + ' = ' + fx(d / t) + '$ ft/s.'] }; }
    if (kind === 'air') { var w = R.int(10, 27), g = R.int(5, 15); return { q: 'An airplane flies straight into a ' + w + ' mph headwind and moves over the ground at ' + g + ' mph. What is its speed through the air?', a: AX(w + g), unit: 'mph', steps: ['Into a headwind, air speed = ground speed + wind speed.', '$' + g + ' + ' + w + ' = ' + (w + g) + '$ mph.', 'The wing feels the air speed, which is why a headwind helps a takeoff.'] }; }
    var m = R.int(2, 60), s = R.pick([12, 15, 59]);
    return { q: 'How many times longer is a ' + m + '-minute flight than a ' + s + '-second flight? (One decimal place if needed.)', a: AR(m * 60 / s, 0.01), unit: 'times', steps: [m + ' minutes = $' + m + ' \\times 60 = ' + m * 60 + '$ seconds.', '$' + m * 60 + ' \\div ' + s + ' \\approx ' + fx(+(m * 60 / s).toFixed(1)) + '$.'] };
  });
})(window.MathLadder);
