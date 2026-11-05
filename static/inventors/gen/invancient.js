/* Inventors Ladder: generators for Ancient and Medieval Inventors (course key invancient): history recall and the science and math of each topic.
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
  var KIDS = ['Ava', 'Ben', 'Cora', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana', 'Ira', 'Jo', 'Kai', 'Lena', 'Milo', 'Nia', 'Owen', 'Pia'];

  // ---------- invancient.archimedes
  var ARCH_TL = [[-287, 'Archimedes is born in Syracuse'], [-212, 'Syracuse falls and Archimedes is killed'], [-214, 'the Roman siege of Syracuse begins'], [-75, 'Cicero finds Archimedes\' tomb'], [-20, 'Vitruvius writes the crown story (about this year)'], [1544, 'Archimedes\' works are first printed in Greek and Latin'], [1897, 'Heath\'s English translation of the Works']];
  var ARCH_F = [
    ['Which city did Archimedes live in?', 'Syracuse, in Sicily', ['Athens', 'Alexandria', 'Rome', 'Sparta'], 'Archimedes lived in Syracuse, a Greek city on the island of Sicily.'],
    ['Who first told the story of Archimedes, the crown and the bath?', 'The Roman writer Vitruvius, two centuries later', ['Archimedes, in On Floating Bodies', 'King Hiero, in a letter', 'Euclid, in the Elements', 'Galileo, in Two New Sciences'], 'The story is in Vitruvius, writing about two hundred years after Archimedes; Archimedes\' own books never mention it.'],
    ['What does "reciprocally proportional" mean in Archimedes\' law of the lever?', 'The heavier weight sits closer to the pivot, in the same ratio', ['Both weights must be equal', 'The lighter weight sits closer to the pivot', 'The distances must add up to the weights', 'The beam must be made of bronze'], 'Twice the weight goes at half the distance: $W_1 d_1 = W_2 d_2$.'],
    ['A solid weighed in water seems lighter. By how much, according to Archimedes?', 'By the weight of the water it pushes aside', ['By half its weight', 'By the weight of the container', 'By nothing; it weighs the same', 'By its volume in liters'], 'On Floating Bodies, Book I, Proposition 7: lighter by the weight of the fluid displaced.'],
    ['Which shapes did Archimedes want carved on his tomb?', 'A sphere and a cylinder', ['A lever and a pivot', 'A crown and a bath', 'A circle and a square', 'A ship and a pulley'], 'He was proudest of finding that a sphere has two thirds the volume of the cylinder around it. Cicero found the tomb by that carving.'],
    ['Why do many historians doubt the crown story as Vitruvius tells it?', 'It comes from much later, and the spilled-water difference would be tiny', ['Archimedes never lived in Syracuse', 'Gold and silver have the same density', 'Water was not used in baths', 'Kings did not wear crowns then'], 'Vitruvius wrote two centuries later, and for a crown the extra spilled water would be very hard to see.'],
    ['How did the Romans finally take Syracuse?', 'After a long siege, in 212 BC', ['In one day, in 287 BC', 'They never took it', 'By a treaty with Archimedes', 'With Archimedes\' help'], 'The siege lasted from about 214 to 212 BC.']
  ];
  G('invancient.archimedes', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'first', 'lever']), R.pick(['lever', 'lever2', 'float', 'gap', 'fact']), R.pick(['lever2', 'float', 'crown', 'gap']));
    if (kind === 'fact') return fact(R, ARCH_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, ARCH_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, ARCH_TL, 'Archimedes'); });
    if (kind === 'lever') {
      var w2 = R.int(1, 6), d2 = R.int(2, 8), k = R.pick([2, 3, 4]), w1 = w2 * k, d1 = d2 / k;
      if (d1 !== M.round(d1 * 10) / 10) { d2 = k * R.int(1, 3); d1 = d2 / k; }
      return { q: 'A ' + w1 + ' kg stone sits ' + d1 + ' m from the pivot of a lever. How far from the pivot, on the other side, must a ' + w2 + ' kg stone sit to balance it?', a: AX(d1 * w1 / w2), unit: 'm',
        steps: ['Weight times distance must match: $' + w1 + ' \\times ' + d1 + ' = ' + w2 + ' \\times d$.', '$' + fx(w1 * d1) + ' = ' + T.mono(w2, 'd') + '$, so $d = ' + fx(w1 * d1 / w2) + '$ m.'], hint: 'Use $W_1 d_1 = W_2 d_2$.' };
    }
    if (kind === 'lever2') {
      var d1b = R.int(1, 4), d2b = R.intNot(2, 9, d1b), w2b = R.int(2, 12), lever = w2b * d2b;
      if (lever % d1b) { w2b = d1b * R.int(1, 4); lever = w2b * d2b; }
      var who = R.pick(KIDS);
      return { q: who + ' hangs a ' + w2b + ' kg load ' + d2b + ' m from the pivot of a long beam. What load, hung ' + d1b + ' m from the pivot on the other side, balances it?', a: AX(lever / d1b), unit: 'kg',
        steps: ['$W \\times ' + d1b + ' = ' + w2b + ' \\times ' + d2b + ' = ' + lever + '$.', '$W = ' + lever + ' \\div ' + d1b + ' = ' + fx(lever / d1b) + '$ kg.'] };
    }
    if (kind === 'float') {
      var air = R.int(20, 90), lost = R.int(5, M.min(40, air - 5)), ask = R.coin();
      if (ask) return { q: 'A metal block weighs ' + air + ' N in air and ' + (air - lost) + ' N when hung in water. What is the weight of the water it pushes aside?', a: AX(lost), unit: 'N', steps: ['It seems lighter by $' + air + ' - ' + (air - lost) + ' = ' + lost + '$ N.', 'Archimedes: the loss equals the weight of the water displaced.'] };
      return { q: 'A stone weighs ' + air + ' N in air. It pushes aside ' + lost + ' N of water when fully under water. What does a scale read while it hangs in the water?', a: AX(air - lost), unit: 'N', steps: ['It loses the weight of the water displaced.', '$' + air + ' - ' + lost + ' = ' + (air - lost) + '$ N.'] };
    }
    // crown: volume = mass / density
    var g = R.pick([[19.3, 'gold'], [10.5, 'silver']]), mass = R.pick([193, 386, 579, 772, 965]) * (g[0] === 19.3 ? 1 : 1);
    if (g[0] === 10.5) mass = R.pick([210, 420, 630, 840, 1050]);
    return { q: 'Pure ' + g[1] + ' has a density of ' + g[0] + ' grams per cubic centimeter. What volume does ' + mass + ' g of pure ' + g[1] + ' take up?', a: AX(mass / g[0]), unit: 'cm³',
      steps: ['Volume = mass ÷ density.', '$' + mass + ' \\div ' + g[0] + ' = ' + fx(mass / g[0]) + '$ cm³.', 'A crown of the same weight that took up more room than this must contain a less dense metal, such as silver.'] };
  });

  // ---------- invancient.hero-of-alexandria
  var HERO_TL = [[62, 'the eclipse of the Moon that Hero describes'], [-250, 'Ctesibius builds pumps and water clocks in Alexandria (about this time)'], [1575, 'Hero\'s Pneumatics is printed in Latin'], [1851, 'Woodcroft\'s English translation of the Pneumatics'], [1712, 'Newcomen\'s steam engine pumps water from a mine']];
  var HERO_F = [
    ['In which city did Hero work?', 'Alexandria, in Roman Egypt', ['Syracuse', 'Athens', 'Rome', 'Baghdad'], 'Hero worked in Alexandria, probably in the first century AD.'],
    ['What made Hero\'s aeolipile spin?', 'Steam rushing out of bent nozzles pushed it the other way', ['A falling weight', 'Wind blowing on sails', 'A person turning a handle', 'Magnets inside the ball'], 'Steam pushed out of each nozzle pushes back on the nozzle: action and reaction.'],
    ['What useful work did the aeolipile do?', 'None: it was a demonstration', ['It pumped water from mines', 'It drove ships', 'It ground grain', 'It lifted stones for temples'], 'Hero describes it as a marvel. The steam engines that did work came in the 1700s.'],
    ['How did Hero\'s coin-operated vessel work?', 'A coin tipped a small pan and lever, opening a valve', ['A spring counted the coins', 'A person inside poured the water', 'Steam pushed the water out', 'Magnets held the valve shut'], 'The coin\'s weight tipped the lever until it slid off, then the valve closed.'],
    ['What drove Hero\'s self-opening temple doors?', 'Air heated by an altar fire pushed water into a bucket that pulled ropes', ['A hidden servant', 'A water wheel in a river', 'A steam engine with pistons', 'Clockwork springs'], 'Heated air expands, pushes water, and the heavier bucket turns the door posts.'],
    ['Which earlier Alexandrian engineer did Hero build on?', 'Ctesibius', ['Archimedes\' student Euclid', 'Leonardo da Vinci', 'Ptolemy the king', 'Galen'], 'Ctesibius made pumps, water organs and water clocks before Hero.'],
    ['What did Hero\'s odometer do?', 'Counted a wheel\'s turns with gears and dropped a pebble every mile', ['Measured the weight of a cart', 'Told time by the Sun', 'Pumped water uphill', 'Measured the height of mountains'], 'Surveyors could count the pebbles instead of pacing.']
  ];
  G('invancient.hero-of-alexandria', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'first', 'odo']), R.pick(['odo', 'fact', 'gap', 'react']), R.pick(['odo2', 'gap', 'react', 'odo']));
    if (kind === 'fact') return fact(R, HERO_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, HERO_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, HERO_TL, 'Hero'); });
    if (kind === 'react') {
      var dir = R.pick(['to the left', 'to the right', 'downward', 'backward']), opp = { 'to the left': 'to the right', 'to the right': 'to the left', downward: 'upward', backward: 'forward' }[dir];
      return { q: 'Steam rushes out of a nozzle ' + dir + '. Which way is the nozzle pushed?', a: MC(opp, [dir, 'not at all', 'in a circle around the steam']), steps: ['Action and reaction: the steam is pushed one way, so it pushes the nozzle the opposite way, equally hard.', 'So the nozzle is pushed ' + opp + '.'] };
    }
    var c = R.int(2, 6), per = R.pick([100, 200, 250, 400, 500]), p = R.int(2, 12);
    if (kind === 'odo') return { q: 'A cart wheel rolls ' + c + ' m each time it turns. Hero\'s odometer drops a pebble every ' + per + ' turns. How far has the cart gone when ' + p + ' pebbles have dropped?', a: AX(c * per * p), unit: 'm',
      steps: ['One pebble: $' + per + ' \\times ' + c + ' = ' + cm(per * c) + '$ m.', '$' + p + '$ pebbles: $' + p + ' \\times ' + cm(per * c) + ' = ' + cm(c * per * p) + '$ m.'] };
    var dist = c * per * p;
    return { q: 'A cart wheel rolls ' + c + ' m per turn, and the odometer drops a pebble every ' + per + ' turns. After a trip of ' + cm(dist) + ' m, how many pebbles are in the box?', a: AX(p), unit: 'pebbles',
      steps: ['One pebble stands for $' + per + ' \\times ' + c + ' = ' + cm(per * c) + '$ m.', '$' + cm(dist) + ' \\div ' + cm(per * c) + ' = ' + p + '$ pebbles.'] };
  });

  // ---------- invancient.ibn-al-haytham
  var IBN_TL = [[965, 'Ibn al-Haytham is born in Basra (about this year)'], [1021, 'the Book of Optics is finished (about this year)'], [1040, 'Ibn al-Haytham dies in Cairo (about this year)'], [1572, 'the Book of Optics is printed in Latin in Basel'], [1604, 'Kepler explains the image inside the eye'], [1200, 'the Book of Optics is translated into Latin (about this year)']];
  var IBN_F = [
    ['What did Ibn al-Haytham show about how we see?', 'Light travels from objects into the eye', ['The eye sends out rays that touch things', 'We see only in sunlight', 'The brain makes light', 'Light travels in curves'], 'Bright light hurts the eye and leaves afterimages: something comes in.'],
    ['In a camera obscura, why is the image upside down?', 'Light travels in straight lines that cross at the hole', ['The hole flips the light', 'Mirrors inside the room', 'Light bends downward', 'The wall is curved'], 'A ray from the top must go down through the hole and land low.'],
    ['What happens to a camera obscura image when the hole is made larger?', 'It gets brighter but blurrier', ['It gets sharper and dimmer', 'It turns the right way up', 'It disappears', 'It gets smaller'], 'Each point of the object spreads into a bigger spot.'],
    ['In his lamp experiment, what happened when one lamp outside the hole was covered?', 'Only that lamp\'s spot inside went dark', ['All the spots went dark', 'The other spots got brighter', 'The spots moved', 'Nothing changed'], 'Each lamp sends its own straight rays through the hole.'],
    ['What was Ibn al-Haytham\'s book called in Arabic?', 'Kitab al-Manazir (the Book of Optics)', ['The Almagest', 'The Elements', 'The Canon of Medicine', 'The Sidereal Messenger'], 'Kitab al-Manazir, written in the early 1000s.'],
    ['Which European scientist used his ideas to explain the image inside the eye, around 1604?', 'Johannes Kepler', ['Isaac Newton', 'Galileo Galilei', 'Benjamin Franklin', 'Michael Faraday'], 'Kepler showed the lens of the eye forms an upside-down picture on the retina.'],
    ['Where did Ibn al-Haytham do most of his known work?', 'Cairo', ['Rome', 'Paris', 'Athens', 'Delhi'], 'Born in Basra, he worked in Cairo under the Fatimid caliphs.']
  ];
  G('invancient.ibn-al-haytham', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'first', 'pin']), R.pick(['pin', 'fact', 'gap', 'pin2']), R.pick(['pin2', 'pin3', 'gap', 'pin']));
    if (kind === 'fact') return fact(R, IBN_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, IBN_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, IBN_TL, 'Ibn al-Haytham'); });
    var H = R.int(2, 12), D = R.pick([10, 20, 25, 40, 50]), d = R.pick([0.5, 1, 2, 2.5]), h = H * d / D;
    var obj = R.pick(['tree', 'tower', 'flagpole', 'house', 'wall']);
    if (kind === 'pin') return { q: 'A ' + obj + ' ' + H + ' m tall stands ' + D + ' m from a small hole in a dark room. The back wall is ' + d + ' m behind the hole. How tall is the upside-down image on the wall?', a: AR(h, 0.01), unit: 'm',
      steps: ['The triangles are the same shape: $\\dfrac{h}{' + H + '} = \\dfrac{' + d + '}{' + D + '}$.', '$h = ' + H + ' \\times ' + d + ' \\div ' + D + ' = ' + fx(h) + '$ m.'] };
    if (kind === 'pin2') return { q: 'In a camera obscura, the back wall is ' + d + ' m behind the hole. The image of a ' + obj + ' ' + H + ' m tall is ' + fx(h) + ' m tall. How far is the ' + obj + ' from the hole?', a: AR(D, 0.01), unit: 'm',
      steps: ['$\\dfrac{' + fx(h) + '}{' + H + '} = \\dfrac{' + d + '}{D}$.', '$D = ' + H + ' \\times ' + d + ' \\div ' + fx(h) + ' = ' + D + '$ m.'] };
    return { q: 'A ' + obj + ' ' + D + ' m away makes an image ' + fx(h) + ' m tall on a wall ' + d + ' m behind the hole. How tall is the ' + obj + '?', a: AR(H, 0.01), unit: 'm',
      steps: ['$\\dfrac{' + fx(h) + '}{H} = \\dfrac{' + d + '}{' + D + '}$.', '$H = ' + fx(h) + ' \\times ' + D + ' \\div ' + d + ' = ' + H + '$ m.'] };
  });
})(window.MathLadder);
