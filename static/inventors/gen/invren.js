/* Inventors Ladder: generators for Renaissance and the Printing Press (course key invren): history recall and the science and math of each topic.
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
  var SYM = ['A', 'H', 'I', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y'], ASYM = ['B', 'C', 'D', 'E', 'F', 'G', 'J', 'K', 'L', 'N', 'P', 'Q', 'R', 'S', 'Z'];

  // ---------- invren.gutenberg
  var GUT_TL = [[1400, 'Gutenberg is born in Mainz (about this year)'], [1439, 'a Strasbourg lawsuit mentions his secret press'], [1455, 'the 42-line Bible is finished (about this year)'], [1468, 'Gutenberg dies in Mainz'], [1500, 'presses are at work in over 200 European towns'], [1040, 'Bi Sheng prints with movable clay type in China (1040s)'], [1377, 'the Jikji, the oldest surviving book printed with metal type, in Korea']];
  var GUT_F = [
    ['What metals did Gutenberg\'s type metal mostly contain?', 'Lead, with tin and antimony', ['Gold and silver', 'Iron and copper', 'Bronze and brass', 'Pure tin'], 'Lead melts easily; tin helps it flow; antimony hardens it.'],
    ['Why did Gutenberg need an oil-based ink?', 'Water-based ink ran off the metal type', ['It dried faster on vellum', 'It was cheaper than water', 'It glowed in the dark', 'Scribes refused to sell their ink'], 'Scribes\' ink beaded up on metal; an oily, varnish-like ink stuck to the type.'],
    ['What older machine did the printing press borrow from?', 'Screw presses for grapes and olives', ['Water wheels', 'Weaving looms', 'Windmills', 'Blacksmiths\' bellows'], 'Wine and olive presses already used a big wooden screw.'],
    ['What was the hand mould for?', 'Casting many identical pieces of type quickly', ['Folding the printed pages', 'Mixing the ink', 'Cutting paper to size', 'Binding the books'], 'Change the matrix and the same mould casts the next letter.'],
    ['Why is a piece of type a mirror image of its letter?', 'Pressing it on paper swaps left and right', ['To keep the design secret', 'Because typesetters read right to left', 'To save metal', 'Because of the way ink dries'], 'Type works like a stamp.'],
    ['About how many copies of the Gutenberg Bible were printed?', 'About 180', ['About 18', 'About 1,800', 'About 18,000', 'Exactly 42'], 'About 180, most on paper and some on vellum; about 49 survive.'],
    ['Who sued Gutenberg in 1455 for repayment of loans?', 'Johann Fust', ['Peter Schöffer', 'The Pope', 'The city of Strasbourg', 'Martin Luther'], 'Fust had lent large sums; much of the workshop passed to him and Schöffer.'],
    ['Where was printing with movable type first done?', 'In East Asia, centuries before Gutenberg', ['In Mainz, by Gutenberg', 'In Rome, by monks', 'In London, by Caxton', 'In Venice, by Aldus'], 'Bi Sheng used clay type in China in the 1040s, and Korean printers used metal type.']
  ];
  G('invren.gutenberg', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'mirror', 'first']), R.pick(['pages', 'fact', 'gap', 'mirror']), R.pick(['pages', 'rate', 'gap', 'rate']));
    if (kind === 'fact') return fact(R, GUT_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, GUT_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, GUT_TL, 'Printing'); });
    if (kind === 'mirror') {
      var s = R.pick(SYM), ws = R.sample(ASYM, 3);
      return { q: 'A piece of type is the mirror image of its letter. For which capital letter does the type look exactly like the printed letter?', a: MC(s, ws), steps: [s + ' is the same as its mirror image (left–right symmetric).', 'Letters like ' + ws.join(', ') + ' face one way, so their type looks backward.'] };
    }
    if (kind === 'pages') {
      var pg = R.pick([96, 120, 160, 200, 240, 320]), cp = R.pick([50, 100, 150, 180, 200, 250]);
      return { q: 'A print shop prints ' + cp + ' copies of a book with ' + pg + ' pages. How many printed pages is that in all?', a: AX(pg * cp), unit: 'pages', steps: ['$' + pg + ' \\times ' + cp + ' = ' + cm(pg * cp) + '$.'] };
    }
    var sp = R.pick([2, 4, 5]), pages = R.pick([300, 400, 600, 800, 1200]), copies = R.int(2, 6);
    return { q: 'A scribe copies ' + sp + ' pages a day. How many days does it take to copy ' + copies + ' copies of a ' + pages + '-page book by hand?', a: AX(pages * copies / sp), unit: 'days',
      steps: ['Pages in all: $' + copies + ' \\times ' + pages + ' = ' + cm(copies * pages) + '$.', 'Days: $' + cm(copies * pages) + ' \\div ' + sp + ' = ' + cm(pages * copies / sp) + '$.', 'A press makes many copies at once, so the more copies, the bigger its advantage.'] };
  });

  // ---------- invren.leonardo-da-vinci
  var LEO_TL = [[1452, 'Leonardo is born near Vinci'], [1482, 'Leonardo moves to Milan'], [1498, 'The Last Supper is finished (about this year)'], [1505, 'the notebook on the flight of birds (about this year)'], [1516, 'Leonardo moves to France'], [1519, 'Leonardo dies at Amboise'], [1883, 'Richter publishes the notebooks in English']];
  var LEO_F = [
    ['Why did Leonardo write from right to left in mirror writing?', 'He was left-handed, and it kept the ink from smearing', ['To hide his ideas from the king', 'Because Italian was written that way', 'Because he used a mirror to draw', 'To save paper'], 'Many historians think the main reason was his left hand; it also made his notes hard for others to read.'],
    ['Which animal did Leonardo say a flying machine should copy?', 'The bat', ['The eagle', 'The bee', 'The dragonfly', 'The flying fish'], 'Notebooks No. 1123: the bat\'s web makes the wing strong and keeps air from passing through.'],
    ['How many of Leonardo\'s flying machines were built and flown in his lifetime?', 'There is no good evidence any were', ['All of them', 'About half', 'Only the helicopter', 'Only the parachute'], 'His machines stayed on paper; modern models were built from his drawings later.'],
    ['Why can\'t people fly by flapping wings with their arms?', 'Our muscles are too weak for our weight', ['Air is too thin', 'Feathers are needed', 'Wings must be made of metal', 'The Earth spins too fast'], 'Birds have huge chest muscles for their size; people do not.'],
    ['Leonardo wrote that experience never errs. What did he say does err?', 'Our judgments', ['Our eyes', 'Old books', 'Mathematics', 'Machines'], 'Notebooks No. 1153: it is our judgments that err by expecting what experiments do not show.'],
    ['Leonardo compared the eye to what?', 'A dark room with a small hole', ['A mirror', 'A lamp', 'A telescope', 'A drum'], 'Notebooks No. 70: images come through a small hole into a dark room upside down.'],
    ['About how many pages of Leonardo\'s notes survive?', 'About 7,000', ['About 70', 'About 700', 'About 70,000', 'None'], 'About 7,000 pages, scattered across collections; many more were lost.']
  ];
  G('invren.leonardo-da-vinci', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'first', 'mirror']), R.pick(['age', 'fact', 'gap', 'mirror2']), R.pick(['gap', 'age', 'mirror2', 'cam']));
    if (kind === 'fact') return fact(R, LEO_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, LEO_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, LEO_TL, 'Leonardo'); });
    if (kind === 'mirror') {
      var s = R.pick(SYM);
      return { q: 'In mirror writing, which capital letter looks the same as normal?', a: MC(s, R.sample(ASYM, 3)), steps: [s + ' has a left–right mirror line down its middle, so its mirror image is the same.'] };
    }
    if (kind === 'mirror2') {
      var words = ['MOM', 'WOW', 'TOOT', 'OTTO', 'YAY', 'HAH', 'MAXIM', 'TOT', 'AHA', 'WAX'], ok = R.pick(words.filter(function (w) { return w.split('').reverse().join('') === w; }));
      var bad = R.sample(['BOOK', 'NOON', 'DAD', 'SEES', 'LEVEL', 'RACECAR', 'KAYAK', 'POP'], 3);
      return { q: 'Which word reads exactly the same in a mirror, every letter and the order too?', a: MC(ok, bad), steps: [ok + ' reads the same backward and uses only letters that look the same in a mirror (like A, H, I, M, O, T, U, V, W, X, Y).', 'The others use letters such as B, D, E, K, L, N, P, R or S, which face one way.'] };
    }
    if (kind === 'age') {
      var ev = R.pick(LEO_TL.filter(function (e) { return e[0] > 1452 && e[0] <= 1519; }));
      return { q: 'Leonardo was born in 1452. About how old was he in ' + ev[0] + ', when ' + ev[1].replace(/ \(about this year\)/, '') + '?', a: AX(ev[0] - 1452), unit: 'years', steps: ['$' + ev[0] + ' - 1452 = ' + (ev[0] - 1452) + '$.'] };
    }
    var H = R.int(3, 15), D = R.pick([10, 20, 40, 50]), d = R.pick([1, 2, 3]);
    return { q: 'Leonardo describes a sunlit building opposite a dark room with a small hole. If the building is ' + H + ' m tall and ' + D + ' m from the hole, and the far wall is ' + d + ' m behind the hole, how tall is its upside-down image?', a: AR(H * d / D, 0.01), unit: 'm',
      steps: ['Similar triangles: $h = ' + H + ' \\times \\dfrac{' + d + '}{' + D + '}$.', '$h = ' + fx(H * d / D) + '$ m.'] };
  });
})(window.MathLadder);
