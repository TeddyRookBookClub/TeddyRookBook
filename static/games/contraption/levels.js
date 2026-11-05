/* Contraption Workshop levels (/games/contraption/). Each level: fixed parts (can't be moved), the parts you may
   add (palette: type -> how many; null = as many as you like), the goal (see goalMet in engine.js), par (the most
   parts you may add for the second star) and a bonus (the third star). Every challenge has a recorded solution in
   scripts/contraption/verify-levels.js, which plays it headless; run that after changing a level. */
(function (root) {
  'use strict';
  var L = [
    { id: 'sandbox', name: 'Sandbox', sandbox: true,
      intro: 'Build anything you like. Every part is here, as many as you want. Press Run to set it going, and the panel names the simple machines your contraption used.',
      fixed: [], palette: null },
    { id: 'first-ring', name: 'First ring',
      intro: 'The ball rolls off its shelf and drops. Put a ramp where it lands so it rolls to the bell.',
      goal: { type: 'ring' }, goalText: 'Ring the bell.', par: 1, bonus: { time: 2.6 }, bonusText: 'Ring it within 2.6 seconds.',
      fixed: [{ t: 'ball', x: 60, y: 90 }, { t: 'ramp', x: 100, y: 120, a: 15, n: 3 }, { t: 'bell', x: 560, y: 360 }],
      palette: { ramp: 3 } },
    { id: 'into-cup', name: 'Into the cup',
      intro: 'A wall stands between the ball and the cup. Lead the ball over it and drop it in. A funnel helps it fall straight.',
      goal: { type: 'cup' }, goalText: 'Land the ball in the cup.', par: 2, bonus: { time: 3.5 }, bonusText: 'Land it within 3.5 seconds.',
      fixed: [{ t: 'ball', x: 900, y: 70 }, { t: 'ramp', x: 860, y: 100, a: -15, n: 3 }, { t: 'block', x: 400, y: 380, a: 40, n: 160 }, { t: 'cup', x: 160, y: 540 }],
      palette: { ramp: 3, funnel: 1 } },
    { id: 'domino-run', name: 'Domino run',
      intro: 'The bell is too low and too far for the ball. Let a row of dominoes carry the push the rest of the way.',
      goal: { type: 'ring', by: 'domino' }, goalText: 'Ring the bell with a domino.', par: 2, bonus: { time: 3.1 }, bonusText: 'Ring it within 3.1 seconds.',
      fixed: [{ t: 'ball', x: 60, y: 90 }, { t: 'ramp', x: 100, y: 120, a: 15, n: 3 }, { t: 'block', x: 600, y: 470, a: 360, n: 70 }, { t: 'bell', x: 860, y: 450 }],
      palette: { ramp: 2, dominoes: 1 } },
    { id: 'seesaw', name: 'Seesaw',
      intro: 'A lever is a bar that turns on a point called the fulcrum. Drop the ball on the high end and the low end flips up and throws its own ball.',
      goal: { type: 'ring', from: 'f3' }, goalText: 'Ring the bell with the seesaw’s ball.', par: 2, bonus: { time: 3.2 }, bonusText: 'Ring it within 3.2 seconds.',
      fixed: [{ t: 'ball', x: 900, y: 70 }, { t: 'ramp', x: 860, y: 100, a: -15, n: 3 }, { t: 'lever', x: 300, y: 540, a: -1 }, { t: 'ball', x: 232, y: 517 }, { t: 'bell', x: 268, y: 392 }],
      palette: { ramp: 2, funnel: 1 } },
    { id: 'lift', name: 'Lift the bucket',
      intro: 'A pulley is a wheel with a rope over it. Fill the empty bucket and its weight lifts the bucket of sand on the other side.',
      goal: { type: 'lift' }, goalText: 'Lift the sand bucket all the way up.', par: 2, bonus: { time: 3.4 }, bonusText: 'Lift it within 3.4 seconds.',
      fixed: [{ t: 'ball', x: 60, y: 90 }, { t: 'ramp', x: 100, y: 120, a: 15, n: 3 }, { t: 'pulley', x: 640, y: 300, a: -1 }],
      palette: { ramp: 3, funnel: 1 } },
    { id: 'screw', name: 'Up the screw',
      intro: 'The bell is high and the ball is low. A screw is a ramp wrapped around a post: as it turns, it carries the ball up.',
      goal: { type: 'ring' }, goalText: 'Ring the high bell.', par: 1, bonus: { time: 7 }, bonusText: 'Ring it within 7 seconds.',
      fixed: [{ t: 'ball', x: 40, y: 430 }, { t: 'ramp', x: 80, y: 470, a: 30, n: 3 }, { t: 'block', x: 520, y: 362, a: 440, n: 178 }, { t: 'bell', x: 900, y: 342 }],
      palette: { screw: 1, ramp: 2 } },
    { id: 'spring-jump', name: 'Spring jump',
      intro: 'The wall is taller than the ball’s shelf, so no ramp can get it over. A spring stores the push of a falling ball and gives it back, upward.',
      goal: { type: 'ring' }, goalText: 'Get the ball over the wall to the bell.', par: 1, bonus: { time: 5 }, bonusText: 'Ring it within 5 seconds.',
      fixed: [{ t: 'block', x: 0, y: 440, a: 180, n: 100 }, { t: 'ball', x: 30, y: 384 }, { t: 'ramp', x: 60, y: 410, a: 15, n: 3 }, { t: 'block', x: 460, y: 320, a: 40, n: 220 }, { t: 'bell', x: 760, y: 512 }],
      palette: { spring: 1, ramp: 2 } },
    { id: 'three-steps', name: 'Exactly three steps',
      intro: 'Each part the motion passes through is one step, and the starting shelf counts. Ring the bell in exactly three steps: no more, no fewer.',
      goal: { type: 'steps', n: 3 }, goalText: 'Ring the bell in exactly 3 steps.', par: 2, bonus: { time: 4 }, bonusText: 'Ring it within 4 seconds.',
      fixed: [{ t: 'ball', x: 60, y: 90 }, { t: 'ramp', x: 100, y: 120, a: 15, n: 3 }, { t: 'bell', x: 900, y: 360 }],
      palette: { ramp: 3, funnel: 1, dominoes: 1, wedge: 1 } },
    { id: 'lever-pulley', name: 'Lever and pulley',
      intro: 'Send the ball across a lever and into the pulley’s bucket, so the other bucket rises and rings the bell. A lever can stand on a level ramp, like a seesaw on a shelf.',
      goal: { type: 'machines', need: ['lever', 'pulley'] }, goalText: 'Ring the bell, using a lever and the pulley.', par: 3, bonus: { time: 4.5 }, bonusText: 'Ring it within 4.5 seconds.',
      fixed: [{ t: 'ball', x: 60, y: 90 }, { t: 'ramp', x: 100, y: 120, a: 15, n: 3 }, { t: 'pulley', x: 792, y: 280, a: -1 }, { t: 'bell', x: 820, y: 308 }],
      palette: { lever: 1, ramp: 3, funnel: 1 } },
    { id: 'six', name: 'All six machines',
      intro: 'The grand machine: use all six simple machines (inclined plane, lever, wheel and axle, pulley, wedge and screw) and ring the bell.',
      goal: { type: 'machines', need: ['incline', 'lever', 'wheel', 'pulley', 'wedge', 'screw'] }, goalText: 'Ring the bell, using all six simple machines.', par: 6, bonus: { time: 7 }, bonusText: 'Ring it within 7 seconds.',
      fixed: [{ t: 'ball', x: 60, y: 90 }, { t: 'ramp', x: 100, y: 120, a: 15, n: 3 }, { t: 'bell', x: 772, y: 360 }],
      palette: { ramp: 4, funnel: 2, lever: 1, wheel: 1, pulley: 1, wedge: 1, screw: 1, ball: 2 } }
  ];
  L.forEach(function (lv) { lv.fixed.forEach(function (p, i) { p.id = 'f' + i; p.fixed = true; if (p.a === undefined) p.a = 0; if (p.n === undefined) p.n = 0; }); });
  if (typeof module === 'object' && module.exports) module.exports = L; else root.CW_LEVELS = L;
})(typeof window !== 'undefined' ? window : this);
