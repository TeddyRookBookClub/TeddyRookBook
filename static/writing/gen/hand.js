/* Handwriting: Print and Cursive (Writing & Grammar Ladder, course key hand): problem generators.
   All 45 topics: the six model topics by the ladder's designer (posture … start-at-top), the other 39 by the course builder
   (sources: /tmp/work_hand/gen_more.js, assembled by /tmp/work_hand/assemble_gen.py; conventions /tmp/work_writing/overview.md).
   Course visuals hand-strokes and hand-slant, and punctuation for HAND.word, are in static/writing/viz/hand.js (browser only).
   Children of 5 to 10 answer by choosing: pictures lettered A, B, C (mc with keep: true), letters, or the sticker a
   finished tracing gives. Facts about letters (where a stroke starts, how many strokes, which letters are tall or have
   tails) come from MathLadder.writing.HAND, the same data the pictures are drawn from, so picture and answer agree. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;
  function H() { return ML.writing.HAND; }
  function big(s) { return '<span class="wr-big">' + s + '</span>'; }
  function para(s) { return '<p>' + s + '</p>'; }
  function readme(level, text) { return level === 1 ? '<p class="wr-readme"><b>For the grown-up</b> ' + (text || 'Read the question and the choices aloud.') + '</p>' : ''; }
  function q(lines) { return lines.filter(Boolean).join(''); }
  function cap1(x) { return x.charAt(0).toUpperCase() + x.slice(1); }
  function L(i) { return String.fromCharCode(65 + i); }
  function mc(right, wrong) { return { t: 'mc', choices: [right].concat(wrong), v: 0 }; }
  function mcKeep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  var NOTE = function (k) { return ML.writing.HAND_NOTES ? ML.writing.HAND_NOTES[k] : NOTES_NODE[k]; };
  var NOTES_NODE = { // the same notes the pictures carry (wr-hand), for node, where the browser part of the kit is absent
    tripod: 'The pencil rests on the middle finger, held by the thumb and pointer finger, a little way up from the point.', fist: 'The whole hand is wrapped around the pencil, so the fingers can’t move it.',
    tip: 'The fingers are right on the sharp point; there is no room to see the writing.', top: 'The hand holds the pencil near the eraser, too far from the point.',
    right: 'Right hand: the paper tilts so its top leans left. The other hand holds it still.', left: 'Left hand: the paper tilts so its top leans right. The other hand holds it still.',
    nohelper: 'Nothing holds the paper, so it slides around.', 'left-wrong': 'A left-handed writer with the paper tilted for a right hand.',
    good: 'Sitting tall and back in the chair, feet flat on the floor, both arms resting on the table.', slump: 'Bent over, with the face close to the paper.',
    lean: 'Leaning far back, with the writing arm off the table.', feet: 'The feet are tucked under the chair instead of flat on the floor.' };
  // a "which picture is right?" problem from wr-hand: good is one variant, bad are others; the order is random
  function pickPicture(R, kind, good, bad, n, question, extra) {
    var wrongs = R.sample(bad, n - 1), order = R.shuffle([good].concat(wrongs)), v = order.indexOf(good);
    var opts = { kind: kind, compare: order, quiet: true, interactive: false };
    if (extra) for (var k in extra) opts[k] = extra[k];
    return { order: order, v: v, viz: { name: 'wr-hand', opts: opts }, a: mcKeep(order.map(function (x, i) { return L(i); }), v),
      steps: [L(v) + ' is right: ' + NOTE(good)].concat(order.filter(function (x) { return x !== good; }).map(function (x) { return L(order.indexOf(x)) + ': ' + NOTE(x); })) };
  }
  var NAMES = ['Mia', 'Leo', 'Sam', 'Ruby', 'Omar', 'Hana', 'Ava', 'Ben'];
  var HE = { Mia: 'she', Leo: 'he', Sam: 'he', Ruby: 'she', Omar: 'he', Hana: 'she', Ava: 'she', Ben: 'he' };
  var TASKS = ['a birthday card', 'a story', 'a grocery list', 'a thank-you note', 'spelling words', 'a letter to Grandma', 'a poem', 'a list of animals', 'a sign for a lemonade stand', 'a page in a journal'];
  function who(R) { var n = R.pick(NAMES); return { n: n, he: HE[n], his: HE[n] === 'she' ? 'her' : 'his', task: R.pick(TASKS) }; }
  var STICKERS = [['🌟', 'star'], ['🍎', 'apple'], ['🐞', 'ladybug'], ['🎈', 'balloon'], ['🐢', 'turtle'], ['🌈', 'rainbow'], ['🚀', 'rocket'], ['🐳', 'whale']];

  /* ---------------------------------------------------------------- hand.posture */
  G('hand.posture', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, 'pic2', R.pick(['pic3', 'feet', 'fix']), R.pick(['pic4', 'other-hand', 'fix']));
    if (shape === 'fix') {
      var w0 = who(R), bad = R.pick([['slump', 'is bent over with ' + w0.his + ' face close to the paper', 'Sit up tall and move back a little.'], ['lean', 'is leaning far back with ' + w0.his + ' arm off the table', 'Sit up and rest both arms on the table.'], ['feet', 'has ' + w0.his + ' feet tucked under the chair', 'Put both feet flat on the floor.']]);
      var others = [['slump', 'Sit up tall and move back a little.'], ['lean', 'Sit up and rest both arms on the table.'], ['feet', 'Put both feet flat on the floor.']].filter(function (x) { return x[0] !== bad[0]; }).map(function (x) { return x[1]; });
      return { q: q([para(w0.n + ' is writing ' + w0.task + ' and ' + bad[1] + '.'), para(big('What should ' + w0.n + ' do?'))]), a: mc(bad[2], others.concat(['Keep going just like that.']).slice(0, 2)),
        viz: { name: 'wr-hand', opts: { kind: 'posture', show: bad[0], quiet: true, interactive: false } },
        hint: 'What part of sitting is not quite right in the picture?', steps: [w0.n + ' ' + bad[1] + '.', bad[2]] };
    }
    if (shape.indexOf('pic') === 0) {
      var n = +shape.slice(3), P = pickPicture(R, 'posture', 'good', ['slump', 'lean', 'feet'], n);
      var w = who(R);
      return { q: q([readme(lv, 'Read the question aloud. Talk about what each child is doing.'), para(w.n + ' is going to write ' + w.task + '.'), para(big('Which picture shows ' + w.n + ' sitting ready to write?'))]), a: P.a, viz: P.viz, steps: P.steps,
        hint: 'Look for a tall back, feet on the floor and both arms on the table.' };
    }
    if (shape === 'feet') return { q: q([para(big('When you write, where do your feet go?'))]), a: mc('Flat on the floor', ['Tucked under the chair', 'Up on the chair seat']),
      hint: 'Your feet help you sit steady.', steps: ['Feet flat on the floor keep you sitting steady and tall.', 'Tucked feet or feet on the seat make you wobble or lean.'] };
    return { q: q([para(big('While one hand writes, what does the other hand do?'))]), a: mc('It holds the paper still.', ['It rests in your lap.', 'It holds up your chin.']),
      hint: 'What would happen to the paper if nothing held it?', steps: ['The paper slides if nothing holds it.', 'So the other hand rests on the paper and holds it still.'] };
  });

  /* ---------------------------------------------------------------- hand.pencil-grip */
  G('hand.pencil-grip', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, 'pic2', R.pick(['pic3', 'fingers', 'what']), R.pick(['pic4', 'where', 'press', 'what']));
    if (shape === 'what') {
      var w1 = who(R), k = R.pick(['fist', 'tip', 'top']), fix = { fist: 'Hold it with the thumb and pointer finger, resting on the middle finger.', tip: 'Slide the fingers up a little from the point.', top: 'Slide the fingers down, a little way up from the point.' };
      return { q: q([para(w1.n + ' is writing ' + w1.task + '. Look at how ' + w1.he + ' holds the pencil.'), para(big('What would help?'))]), a: mc(fix[k], Object.keys(fix).filter(function (x) { return x !== k; }).map(function (x) { return fix[x]; })),
        viz: { name: 'wr-hand', opts: { kind: 'grip', show: k, quiet: true, interactive: false } },
        hint: 'Compare the picture with the usual grip: thumb and pointer finger, a little way up from the point.', steps: [NOTE(k), fix[k]] };
    }
    if (shape.indexOf('pic') === 0) {
      var n = +shape.slice(3), left = R.chance(0.3), P = pickPicture(R, 'grip', 'tripod', ['fist', 'tip', 'top'], n, null, left ? { hand: 'left' } : null);
      var w = who(R);
      return { q: q([readme(lv), para(w.n + ' is going to write ' + w.task + (left ? ' with ' + w.his + ' left hand' : '') + '.'), para(big('Which hand holds the pencil the usual way?'))]), a: P.a, viz: P.viz, steps: P.steps.concat(left ? ['The pictures show a left hand; the grip is the same with either hand.'] : []),
        hint: 'Look for the thumb and pointer finger holding the pencil a little way up from the point.' };
    }
    if (shape === 'fingers') return { q: q([para(big('Which fingers hold the pencil?'))]), a: mc('The thumb and pointer finger, with the pencil resting on the middle finger', ['All four fingers wrapped around it', 'The pointer finger and the little finger']),
      hint: 'Three fingers do the work.', steps: ['The thumb and pointer finger hold the pencil.', 'The pencil rests on the middle finger.', 'The other fingers curl gently out of the way.'] };
    if (shape === 'where') return { q: q([para(big('Where on the pencil do your fingers go?'))]), a: mc('A little way up from the point', ['Right on the sharp point', 'Up by the eraser']),
      hint: 'You need to see the point as you write.', steps: ['Fingers right on the point hide your writing.', 'Fingers up by the eraser make the pencil hard to steer.', 'A little way up from the point is just right.'] };
    return { q: q([para(big('How hard do you squeeze the pencil?'))]), a: mc('Lightly, just enough to hold it', ['As hard as you can', 'So loosely that it drops']),
      hint: 'A light hold lets the pencil move.', steps: ['Squeezing hard makes the pencil hard to move smoothly.', 'Hold it lightly, just enough to keep it steady.'] };
  });

  /* ---------------------------------------------------------------- hand.paper-position */
  G('hand.paper-position', function (R, ctx) {
    var lv = ctx.level, nm = R.pick(NAMES), he = HE[nm];
    var shape = ML.byLevel(ctx, 'helper', R.pick(['desk', 'helper']), R.pick(['lefty', 'lefty', 'righty']));
    if (shape === 'helper') { var side = R.pick(['right', 'left']), other = side === 'right' ? 'left' : 'right';
      return { q: q([readme(lv), para(nm + ' writes with ' + (he === 'she' ? 'her' : 'his') + ' ' + side + ' hand. Today ' + he + ' is writing ' + R.pick(TASKS) + '.'), para(big('Which hand holds the paper still?'))]), a: mcKeep(['the ' + other + ' hand', 'the ' + side + ' hand', 'neither hand'], 0),
        hint: 'One hand writes. The other one helps.', steps: ['The ' + side + ' hand is busy writing.', 'The other hand, the ' + other + ' hand, rests on the paper and holds it still.'] }; }
    if (shape === 'desk') { var P = pickPicture(R, 'paper', R.pick(['right', 'left']), ['nohelper'], 2), wd = who(R);
      return { q: q([para(wd.n + ' wants to write ' + wd.task + '.'), para(big('Which desk is ready for writing?'))]), a: P.a, viz: P.viz, steps: P.steps, hint: 'Is something holding the paper?' }; }
    var lefty = shape === 'lefty', good = lefty ? 'left' : 'right', bad = lefty ? 'left-wrong' : 'wrong';
    var P2 = pickPicture(R, 'paper', good, [bad], 2);
    return { q: q([para(nm + ' writes cursive with ' + (he === 'she' ? 'her' : 'his') + ' ' + good + ' hand. ' + cap1(he) + ' is about to write ' + R.pick(TASKS) + '.'), para(big('Which paper is tilted the right way for ' + nm + '?'))]), a: P2.a, viz: P2.viz,
      hint: lefty ? 'For a left hand, the top of the paper leans right.' : 'For a right hand, the top of the paper leans left.',
      steps: [lefty ? 'A left-handed writer tilts the top of the paper to the right.' : 'A right-handed writer tilts the top of the paper to the left.', 'That lets the writing arm move along the lines and lets the writer see the words.', 'The right picture is ' + L(P2.v) + '.'] };
  });

  /* ---------------------------------------------------------------- hand.writing-lines */
  var ZONE_WORD = { tall: 'a tall letter', short: 'a short letter', tail: 'a letter with a tail' };
  var LOWER = 'abcdefghijklmnopqrstuvwxyz'.split('');
  G('hand.writing-lines', function (R, ctx) {
    var lv = ctx.level, Hd = H(), shape = ML.byLevel(ctx, R.pick(['sit', 'zone']), 'zone', R.pick(['below', 'top', 'zone']));
    if (shape === 'sit') return { q: q([readme(lv), para(big('Which line do letters sit on?'))]), a: mcKeep(['the baseline (the bottom line)', 'the middle line (the dotted line)', 'the top line'], 0),
      viz: { name: 'wr-letter', opts: { chars: R.pick(['a', 'o', 'm', 'c', 'n']), numbers: false, arrows: false, quiet: true, interactive: false, lineNames: true } },
      hint: 'Look at the bottom of the letter.', steps: ['Every letter sits on the baseline, the bottom line.', 'Short letters reach up to the middle line; tall ones reach the top line.'] };
    if (shape === 'zone') {
      var ch = R.pick(LOWER), z = Hd.zone(ch);
      return { q: q([readme(lv), para(big('What kind of letter is this?'))]), a: mcKeep(['a tall letter', 'a short letter', 'a letter with a tail'], ['tall', 'short', 'tail'].indexOf(z)),
        viz: { name: 'wr-letter', opts: { chars: ch, numbers: false, arrows: false, quiet: true, interactive: false } },
        hint: 'Does it reach the top line? Does it go below the baseline?',
        steps: [z === 'tall' ? '“' + ch + '” reaches up to the top line, so it is a tall letter.' : z === 'tail' ? '“' + ch + '” goes down below the baseline, so it is a letter with a tail.' : '“' + ch + '” stays between the baseline and the middle line, so it is a short letter.'] };
    }
    var want = shape === 'below' ? 'tail' : 'tall', right = R.pick(LOWER.filter(function (c) { return Hd.zone(c) === want; }));
    var wrong = R.sample(LOWER.filter(function (c) { return Hd.zone(c) !== want && c !== 'f' && c !== 't'; }), 2);
    return { q: q([para(big(shape === 'below' ? 'Which letter goes below the baseline?' : 'Which letter reaches the top line?'))]), a: mc(right, wrong),
      hint: shape === 'below' ? 'Think of the letters with tails: g j p q y.' : 'Think of the tall letters: b d f h k l t.',
      steps: ['“' + right + '” is ' + ZONE_WORD[want] + '.', wrong.map(function (c) { return '“' + c + '” is ' + ZONE_WORD[Hd.zone(c)]; }).join('; ') + '.'] };
  });

  /* ---------------------------------------------------------------- hand.print-strokes */
  var MULTI = ['t', 'i', 'k', 'x', 'y', 'b', 'd', 'p', 'q', 'a', 'A', 'E', 'F', 'H', 'T', 'K', 'Y', 'n', 'h', 'r'];
  var ONE = ['l', 'c', 'o', 's', 'v', 'w', 'z', 'L', 'O', 'C', 'S', 'V', 'Z'];
  var CLEAR_COUNT = ['l', 'i', 't', 'x', 'o', 'c', 'v', 'z', 'E', 'F', 'H', 'I', 'L', 'T', 'X', 'Y', 'A', 'O', 'V', 'Z'];
  G('hand.print-strokes', function (R, ctx) {
    var lv = ctx.level, Hd = H(), shape = ML.byLevel(ctx, R.pick(['trace', 'count']), R.pick(['order', 'count']), R.pick(['order3', 'dir']));
    if (shape === 'trace') {
      var ch = R.pick(['l', 'i', 't', 'o', 'c', 'v', 'x', 'L', 'T', 'O']), st = R.sample(STICKERS, 4), win = st[0];
      return { q: q([readme(lv, 'Your child traces with a finger, a mouse or a pen. A finished tracing shows a sticker.'), para(big('Trace the letter ' + ch + '. Which sticker did you get?'))]),
        a: mc(win[0] + ' ' + win[1], st.slice(1).map(function (s) { return s[0] + ' ' + s[1]; })),
        viz: { name: 'wr-trace', opts: { ch: ch, reward: { e: win[0], name: win[1] }, quiet: false } },
        hint: 'Start at the green dot and follow the gray line. Tap Show me to watch.',
        steps: ['Start each stroke at its green dot and follow the gray line.', 'When every stroke turns green, the sticker appears: the ' + win[1] + '.'] };
    }
    if (shape === 'count') {
      var c2 = R.pick(CLEAR_COUNT), n = Hd.glyph(c2, 'print').n;
      return { q: q([readme(lv), para(big('How many strokes make this letter?'))]), a: mcKeep(['1', '2', '3', '4'], n - 1),
        viz: { name: 'wr-letter', opts: { chars: c2, numbers: false, arrows: false, quiet: true, interactive: false } },
        hint: 'Count each time the pencil goes down on the paper.',
        steps: ['“' + c2 + '” takes ' + n + ' stroke' + (n > 1 ? 's' : '') + ': the pencil goes down on the paper ' + (n === 1 ? 'once' : n + ' times') + '.'] };
    }
    if (shape === 'order' || shape === 'order3') {
      var c3 = R.pick(MULTI), g3 = Hd.glyph(c3, 'print'), wrongOrd = Hd.wrongOrder(g3.n, c3 + R.int(0, 99));
      var vars = [{}, { order: wrongOrd }]; if (shape === 'order3') vars.push({ reverse: [0] });
      var order = R.shuffle([0, 1, 2].slice(0, vars.length)), shown = order.map(function (i) { return vars[i]; }), v = order.indexOf(0);
      return { q: q([para(big('Which picture shows the right way to write ' + c3 + '?')), para('The numbers show which stroke comes first, and the arrows show which way to go.')]),
        a: mcKeep(shown.map(function (x, i) { return L(i); }), v),
        viz: { name: 'wr-letter', opts: { chars: c3, variants: shown, quiet: true, interactive: false } },
        hint: 'Most letters start at the top. Which stroke would you make first?',
        steps: ['In ' + L(v) + ', the strokes come in the usual order' + (shape === 'order3' ? ' and each one goes the usual way' : '') + '.', 'The first stroke of “' + c3 + '” starts at the green 1.', shape === 'order3' ? 'One wrong picture changes the order; the other draws the first stroke backward, from the wrong end.' : 'The other picture changes the order of the strokes.'] };
    }
    // dir: a one-stroke letter drawn the usual way or backward
    var c4 = R.pick(ONE), back = R.coin(), vs = back ? [{ reverse: [0] }, {}] : [{}, { reverse: [0] }];
    return { q: q([para(big('Which picture shows ' + c4 + ' written the usual way?')), para('Look at where the green 1 starts and which way the arrow goes.')]), a: mcKeep(['A', 'B'], back ? 1 : 0),
      viz: { name: 'wr-letter', opts: { chars: c4, variants: vs, quiet: true, interactive: false } },
      hint: 'Where would you put your pencil down first?',
      steps: ['“' + c4 + '” starts ' + (Hd.glyph(c4, 'print').strokes[0].start[1] <= 6 ? 'at the top line' : 'near the top of the letter') + ' and goes the way the arrow shows in ' + (back ? 'B' : 'A') + '.', 'The other picture starts at the end and goes backward.'] };
  });

  /* ---------------------------------------------------------------- hand.start-at-top */
  var TOP = ['b', 'h', 'k', 'l', 't'], MID = ['i', 'j', 'm', 'n', 'p', 'r', 'u', 'v', 'w', 'x', 'y', 'z'], CIRC = ['a', 'c', 'd', 'g', 'o', 'q'];
  G('hand.start-at-top', function (R, ctx) {
    var lv = ctx.level, Hd = H(), shape = ML.byLevel(ctx, 'pick2', R.pick(['pick3', 'where']), R.pick(['where', 'pickmid', 'cap']));
    // the lists above agree with the letterform data; checked here so the answer always matches the picture
    TOP.forEach(function (c) { if (Hd.startLine(c) !== 'top') throw new Error('start data: ' + c); });
    MID.forEach(function (c) { if (Hd.startLine(c) !== 'middle') throw new Error('start data: ' + c); });
    if (shape === 'pick2' || shape === 'pick3') {
      var right = R.pick(TOP), wrong = R.sample(MID.concat(CIRC), shape === 'pick2' ? 1 : 2), ch = R.shuffle([right].concat(wrong));
      return { q: q([readme(lv), para(big('Which letter starts at the top line?'))]), a: { t: 'mc', choices: ch, v: ch.indexOf(right), keep: true },
        viz: lv === 1 ? { name: 'wr-letter', opts: { chars: ch.join(''), arrows: false, quiet: true, interactive: false } } : undefined,
        hint: 'Tall letters start at the top line.', steps: ['“' + right + '” is a tall letter. Its first stroke starts at the top line and goes down.', wrong.map(function (c) { return '“' + c + '” starts ' + (CIRC.indexOf(c) >= 0 ? 'just below the middle line, curving like c' : 'at the middle line'); }).join('; ') + '.'] };
    }
    if (shape === 'pickmid') {
      var r2 = R.pick(MID), w2 = R.sample(TOP, 2), ch2 = R.shuffle([r2].concat(w2));
      return { q: q([para(big('Which letter starts at the middle line?'))]), a: { t: 'mc', choices: ch2, v: ch2.indexOf(r2), keep: true },
        hint: 'Short letters start lower than tall ones.', steps: ['“' + r2 + '” is a short letter (or a tail letter) that starts at the middle line.', '“' + w2.join('” and “') + '” are tall letters that start at the top line.'] };
    }
    if (shape === 'cap') {
      var cap = R.pick('ABDEFHIKLMNPRTUVWXYZ'.split(''));
      return { q: q([para(big('Where does the capital ' + cap + ' start?'))]), a: mcKeep(['at the top line', 'at the middle line', 'at the baseline'], 0),
        hint: 'Capitals are tall.', steps: ['Every capital letter is as tall as the space from the baseline to the top line.', 'Its first stroke starts at the top line.'] };
    }
    var pool = TOP.concat(MID, CIRC), c = R.pick(pool), kind = TOP.indexOf(c) >= 0 ? 0 : MID.indexOf(c) >= 0 ? 1 : 2;
    return { q: q([para(big('Where does the first stroke of ' + c + ' start?'))]), a: mcKeep(['at the top line', 'at the middle line', 'just below the middle line, curving back like c'], kind),
      viz: lv < 3 ? { name: 'wr-letter', opts: { chars: c, numbers: false, arrows: false, quiet: true, interactive: false } } : undefined,
      hint: 'Is it tall? Is it one of the c letters (a c d g o q)?',
      steps: [kind === 0 ? '“' + c + '” is tall, so it starts at the top line.' : kind === 1 ? '“' + c + '” starts at the middle line and goes down.' : '“' + c + '” is a c letter: it starts just below the middle line and curves back around, like c.'] };
  });
  /* =====================================================================================================================
     The other 39 topics (course builder c_hand). Shared shapes first; every fact comes from HAND (H()), so the picture
     and the answer agree. Pictures in problems are quiet (nothing that gives the answer away).
     ===================================================================================================================== */
  function Lt(i) { return String.fromCharCode(65 + i); }
  function q1(s) { return '“' + s + '”'; }
  var KIND_SAY = { short: 'is too short: it doesn’t reach the top line', float: 'floats above the baseline', big: 'is too big for its kind', mirror: 'is backward' };
  // which letters of a text are eligible for a distortion kind (index counts letters only, as HAND.word does)
  var MIRRORS = 'bdpqsrzjfkyceagNZJSCDBEFGKLPRQ2345679'.split('');
  function letterList(text) { return text.replace(/ /g, '').split(''); }
  function eligible(ch, kind, style) {
    var z = /[a-z]/.test(ch) ? H().zone(ch) : 'cap';
    if (kind === 'short') return z === 'tall' && ch !== 't';
    if (kind === 'big') return z === 'short';
    if (kind === 'mirror') return MIRRORS.indexOf(ch) >= 0 && style === 'print';
    return true; // float
  }
  // spot the badly formed letter: wr-join with one distorted letter and numbers under the letters
  function spotP(R, lv, words, kinds, style, extraQ) {
    for (var tries = 0; tries < 40; tries++) {
      var w = R.pick(words), kind = R.pick(kinds), ls = letterList(w);
      var idx = ls.map(function (c, i) { return eligible(c, kind, style) ? i : -1; }).filter(function (i) { return i >= 0; });
      if (!idx.length) continue;
      var k = R.pick(idx), n = ls.length, nn = /^[0-9]+$/.test(ls.join('')) ? 'number' : 'letter', Nn = cap1(nn);
      var others = R.sample(ls.map(function (c, i) { return i; }).filter(function (i) { return i !== k; }), Math.min(lv === 1 ? 2 : 3, n - 1));
      var ch = [k].concat(others).sort(function (a, b) { return a - b; });
      return { q: q([readme(lv, 'Look at the letters together. Numbers under the letters name them.'), para('This should say <b>' + w + '</b>.' + (extraQ ? ' ' + extraQ : '')), para(big('Which ' + nn + ' is not written well?'))]),
        a: mcKeep(ch.map(function (i) { return nn + ' ' + (i + 1); }), ch.indexOf(k)),
        viz: { name: 'wr-join', opts: { text: w, style: style, distort: { index: k, kind: kind }, numbers: true, quiet: true, interactive: false } },
        hint: kind === 'mirror' ? 'Is one ' + nn + ' facing the wrong way?' : 'Run your finger along the lines. Which ' + nn + ' doesn’t fit?',
        steps: [Nn + ' ' + (k + 1) + ', ' + q1(ls[k]) + ', ' + KIND_SAY[kind] + '.', 'The other ' + nn + 's sit on the baseline at the right size' + (kind === 'mirror' ? ' and face the right way' : '') + '.'] };
    }
    throw new Error('spotP: no eligible letter');
  }
  // trace and check: the sticker appears when the tracing is done
  function traceP(R, lv, pool, style) {
    var ch = R.pick(pool), st = R.sample(STICKERS, 4), win = st[0], word = ch.length > 1;
    var name = (style === 'cursive' ? 'cursive ' : '') + (word ? 'word ' : /[0-9]/.test(ch) ? 'number ' : 'letter ') + ch;
    return { q: q([readme(lv, 'Your child traces with a finger, a mouse or a pen. A finished tracing shows a sticker.'), para(big('Trace the ' + name + '. Which sticker did you get?'))]),
      a: mc(win[0] + ' ' + win[1], st.slice(1).map(function (s) { return s[0] + ' ' + s[1]; })),
      viz: { name: 'wr-trace', opts: { ch: word ? undefined : ch, text: word ? ch : undefined, style: style, reward: { e: win[0], name: win[1] }, quiet: false } },
      hint: 'Start at the green dot and follow the gray line. Tap Show me to watch.',
      steps: ['Start each stroke at its green dot and follow the gray line.', 'When every stroke turns green, the sticker appears: the ' + win[1] + '.'] };
  }
  // how many strokes (only letters whose strokes are clearly separate)
  function countP(R, lv, pool, style) {
    var c = R.pick(pool), n = H().glyph(c, style).n;
    return { q: q([readme(lv), para(big('How many strokes make this ' + (/[0-9]/.test(c) ? 'number' : 'letter') + '?'))]), a: mcKeep(['1', '2', '3', '4'], n - 1),
      viz: { name: 'wr-letter', opts: { chars: c, style: style, numbers: false, arrows: false, quiet: true, interactive: false } },
      hint: 'Count each time the pencil goes down on the paper.',
      steps: [q1(c) + ' takes ' + n + ' stroke' + (n > 1 ? 's' : '') + ': the pencil goes down on the paper ' + (n === 1 ? 'once' : n + ' times') + '.'] };
  }
  // which picture shows the right stroke order (multi-stroke) or direction (one stroke)
  function orderP(R, lv, pool, style, three) {
    var c = R.pick(pool), g = H().glyph(c, style), vars, what;
    if (g.n >= 2) { vars = [{}, { order: H().wrongOrder(g.n, c + R.int(0, 99)) }]; if (three) vars.push({ reverse: [0] }); what = 'order'; }
    else { vars = [{}, { reverse: [0] }]; what = 'dir'; }
    var order = R.shuffle(vars.map(function (x, i) { return i; })), shown = order.map(function (i) { return vars[i]; }), v = order.indexOf(0);
    var nm = (style === 'cursive' ? 'cursive ' : '') + c;
    return { q: q([readme(lv), para(big('Which picture shows the right way to write ' + nm + '?')), para('The numbers show which stroke comes first, and the arrows show which way to go.')]),
      a: mcKeep(shown.map(function (x, i) { return Lt(i); }), v),
      viz: { name: 'wr-letter', opts: { chars: c, style: style, variants: shown, quiet: true, interactive: false } },
      hint: what === 'order' ? 'Which stroke would you make first?' : 'Where would you put your pencil down first?',
      steps: ['In ' + Lt(v) + ', ' + nm + ' is written the usual way: the first stroke starts at the green 1' + (what === 'order' ? ' and the strokes come in the usual order.' : ' and goes the way the arrow shows.'),
        what === 'order' ? (vars.length === 3 ? 'One wrong picture changes the order; the other starts the first stroke from the wrong end.' : 'The other picture changes the order of the strokes.') : 'The other picture starts at the end and goes backward.'].concat(g.strokes.some(function (s) { return s.after; }) ? ['Dots and crosses come last, after the rest of the letter (in a word, after the whole word).'] : []) };
  }
  // which letter is this? (a quiet picture; choices are print letters that look alike)
  function whichP(R, lv, ch, wrongs, style) {
    return { q: q([readme(lv), para(big('Which letter is this?'))]), a: mc(ch, wrongs),
      viz: { name: 'wr-join', opts: { text: ch, style: style, quiet: true, interactive: false } },
      hint: 'Look at where it starts, how tall it is, and any loops or tails.',
      steps: ['This is ' + (style === 'cursive' ? 'cursive ' : '') + q1(ch) + '.', CUR_HINT[ch] || 'Compare its shape with the other choices.'] };
  }
  var CUR_HINT = { r: 'Cursive r rises to a point with a tiny step on top.', s: 'Cursive s rises to a point and curves down to close at the baseline.', z: 'Cursive z starts over a hill and has a loop below the baseline.',
    n: 'Cursive n has round hills on top.', u: 'Cursive u is round at the bottom and pointed on top.', m: 'Cursive m has three round hills.', w: 'Cursive w is round at the bottom and ends with a bridge at the middle line.',
    e: 'Cursive e has a small loop that reaches the middle line.', l: 'Cursive l has a tall loop up to the top line.', i: 'Cursive i is a small point with a dot.', t: 'Cursive t goes up almost to the top line and has a cross.',
    a: 'Cursive a is closed at the top with a line down.', o: 'Cursive o is closed and ends with a bridge at the middle line.', c: 'Cursive c has a little hook at the top and stays open.', d: 'Cursive d is like a with a tall line.',
    g: 'Cursive g is like a with a loop below the baseline.', q: 'Cursive q is like a with a tail below that comes back up to the baseline.', h: 'Cursive h is a tall loop and a hill.', k: 'Cursive k is a tall loop with a little loop and a kick.',
    b: 'Cursive b is a tall loop that ends with a bridge at the middle line.', f: 'Cursive f has a loop on top and a loop below the baseline.', j: 'Cursive j has a dot and a loop below the baseline.', p: 'Cursive p goes below the baseline and has a bump.',
    y: 'Cursive y starts over a hill and has a loop below the baseline.', v: 'Cursive v starts over a hill, comes to a point and ends with a bridge.', x: 'Cursive x starts over a hill and is crossed after the word.',
    A: 'Cursive A is a big oval closed at the top, with a slant down.', C: 'Cursive C has a curl at the top and a big curve.', E: 'Cursive E has a small curve on top and a bigger one below.', O: 'Cursive O is a big closed oval with a little loop at the top.',
    G: 'Cursive G is a big curve like C that comes back up to the middle line on the right, then down and out, with a little bar across at the middle line.', I: 'Cursive I starts at the middle line, swings up and comes down without a loop below.', J: 'Cursive J starts like I but loops below the baseline.',
    L: 'Cursive L has a little loop at the top and another on the baseline.', Q: 'Cursive Q looks like the number 2.', S: 'Cursive S swings up to a loop at the top and curls back at the bottom.', D: 'Cursive D slants down, loops at the bottom and curves around.',
    U: 'Cursive U is round at the bottom and comes back down to the baseline.', V: 'Cursive V comes to a point at the bottom and ends at the top line.', M: 'Cursive M has a hook and three slants down.', N: 'Cursive N has a hook and two slants down.',
    H: 'Cursive H is two slants with a bar across.', K: 'Cursive K is a slant with a second stroke that comes in and kicks out.', W: 'Cursive W is like a double V.', X: 'Cursive X has a hook, a curve down, and a cross.', Y: 'Cursive Y is like U with a loop below.', Z: 'Cursive Z has a curve on top and a loop below.',
    B: 'Cursive B is a slant with two bumps.', P: 'Cursive P is a slant with one bump on top.', R: 'Cursive R is like P with a leg that kicks out.', F: 'Cursive F has a wavy top and a cross in the middle.', T: 'Cursive T has a wavy top and no cross.' };
  // read the cursive word: mc of look-alikes, or typed (strict) at level 3
  function readP(R, lv, pairs, typed, what) {
    var pr = R.pick(pairs), w = pr[0], wrongs = pr.slice(1);
    var spec = typed ? { t: 'text', v: [w], strict: true } : mc(w, wrongs);
    return { q: q([readme(lv), para(big(what === 'name' ? (typed ? 'Read the cursive name. Type it.' : 'Which name is this?') : typed ? 'Read the cursive word. Type it.' : 'What does this cursive word say?'))]), a: spec,
      viz: { name: 'wr-join', opts: { text: w, quiet: true, interactive: false } },
      hint: 'Read it letter by letter. Watch the joins after b, o, v and w.',
      steps: ['Letter by letter: ' + w.split('').join(', ') + '.', 'The word is ' + q1(w) + '.'].concat(wrongs.length && !typed ? [q1(wrongs[0]) + ' would look different: ' + diffSay(w, wrongs[0])] : []) };
  }
  function diffSay(a, b) { for (var i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return 'letter ' + (i + 1) + ' would be ' + q1(b[i]) + ', not ' + q1(a[i]) + '.'; return 'the letters are different.'; }
  // joined or written apart
  function joinedP(R, lv, words) {
    var w = R.pick(words), vars = R.shuffle([{ text: w }, { text: w, nojoin: true }]), v = vars[0].nojoin ? 1 : 0;
    return { q: q([readme(lv), para(big('Which picture shows the word ' + w + ' joined, the cursive way?'))]), a: mcKeep(['A', 'B'], v),
      viz: { name: 'wr-join', opts: { variants: vars, quiet: true, interactive: false } },
      hint: 'In cursive, does the pencil lift between letters?',
      steps: ['In ' + Lt(v) + ', each letter’s exit stroke runs into the next letter.', 'In ' + Lt(1 - v) + ', the letters are written apart.'] };
  }

  /* ---------------------------------------------------------------- print lowercase */
  G('hand.line-letters', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'tall', 'cross', 'count']), R.pick(['order', 'count', 'cross', 'which', 'spot']), R.pick(['spot', 'order3', 'which']));
    if (shape === 'trace') return traceP(R, lv, ['l', 'i', 't', 'it', 'lit'], 'print');
    if (shape === 'tall') { var tall = R.pick(['l', 't']), tc = R.shuffle([tall, 'i']);
      return { q: q([readme(lv), para(big('Which letter is tall?'))]), a: mcKeep(tc, tc.indexOf(tall)), viz: { name: 'wr-letter', opts: { chars: tall + 'i', numbers: false, arrows: false, quiet: true, interactive: false } },
        hint: 'Which letter reaches the top line?', steps: [q1(tall) + ' starts at the top line, so it is tall.', q1('i') + ' starts at the middle line, so it is short.'] }; }
    if (shape === 'cross') return { q: q([readme(lv), para(big('Where does the cross of t go?'))]), a: mcKeep(['on the middle line', 'on the top line', 'on the baseline'], 0),
      viz: lv === 1 ? { name: 'wr-letter', opts: { chars: 't', numbers: false, arrows: false, quiet: true, interactive: false, lineNames: true } } : undefined,
      hint: 'Look at the dotted line.', steps: ['t is a tall line down from the top line.', 'Its cross goes across the middle line, left to right.', 'A cross at the top would make it look like a capital T.'] };
    if (shape === 'count') return countP(R, lv, ['l', 'i', 't'], 'print');
    if (shape === 'order' || shape === 'order3') return orderP(R, lv, ['i', 't'], 'print', shape === 'order3');
    if (shape === 'which') return { q: q([readme(lv), para(big('Which letter starts at the middle line and has a dot?'))]), a: mc('i', ['l', 't']), hint: 'Which one is short?', steps: ['i starts at the middle line, pulls down, then gets its dot.', 'l and t are tall: they start at the top line.'] };
    return spotP(R, lv, ['little', 'tilt', 'title', 'kitten', 'lift', 'till', 'list', 'hill', 'tile', 'milk', 'fit'], ['short', 'big', 'float'], 'print');
  });

  var CIRC = ['c', 'o', 'a', 'd', 'g', 'q'];
  G('hand.circle-letters', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'dir']), R.pick(['order', 'dir', 'line', 'start']), R.pick(['order3', 'spot', 'line']));
    if (shape === 'trace') return traceP(R, lv, ['c', 'o', 'a'], 'print');
    if (shape === 'dir') return orderP(R, lv, ['c', 'o'], 'print');
    if (shape === 'order' || shape === 'order3') return orderP(R, lv, ['a', 'd', 'g', 'q'], 'print', shape === 'order3');
    if (shape === 'start') { var c = R.pick(CIRC);
      return { q: q([para(big('Which way does the first stroke of ' + c + ' go?'))]), a: mc('back to the left, like c', ['to the right, like the hands of a clock', 'straight down']),
        hint: 'All six circle letters start the same way.', steps: ['The circle letters (c, o, a, d, g, q) start just below the middle line.', 'They curve back to the left, down and around, the way c does.'] }; }
    if (shape === 'line') { var pick = R.pick([['d', 'a tall line, from the top line'], ['g', 'a tail below the baseline'], ['q', 'a tail below the baseline'], ['a', 'a short line, from the middle line']]);
      var others = ['a tall line, from the top line', 'a tail below the baseline', 'a short line, from the middle line', 'no line at all'].filter(function (x) { return x !== pick[1]; });
      return { q: q([para(big('After the circle, what does ' + pick[0] + ' add?'))]), a: mc(pick[1], R.sample(others, 2)),
        viz: { name: 'wr-letter', opts: { chars: pick[0], numbers: false, arrows: false, quiet: true, interactive: false } },
        hint: 'Is it tall, short or a tail letter?', steps: [q1(pick[0]) + ' is ' + ZONE_WORD[H().zone(pick[0])] + '.', 'So after the circle it adds ' + pick[1] + '.'] }; }
    return spotP(R, lv, ['dog', 'good', 'cod', 'add', 'dad', 'coat', 'egg'], ['mirror', 'float'], 'print');
  });

  G('hand.hump-letters', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'humps']), R.pick(['order', 'tall', 'humps']), R.pick(['order3', 'spot', 'tall']));
    if (shape === 'trace') return traceP(R, lv, ['n', 'h', 'r', 'm'], 'print');
    if (shape === 'humps') { var two = R.coin();
      return { q: q([readme(lv), para(big(two ? 'Which letter has two humps?' : 'Which letter stops just after the top of its hump?'))]), a: mc(two ? 'm' : 'r', two ? ['n', 'r'] : ['n', 'h']),
        viz: lv === 1 ? { name: 'wr-letter', opts: { chars: R.shuffle(['m', 'n', 'r']).join(''), numbers: false, arrows: false, quiet: true, interactive: false } } : undefined,
        hint: two ? 'Count the humps.' : 'Which one is like n with the end cut off?', steps: two ? ['m has two humps, the same size.', 'n has one hump; r has only the start of one.'] : ['r starts like n but stops just after the top of the hump.', 'n and h go all the way over and down.'] }; }
    if (shape === 'tall') { if (R.coin()) { var t = R.pick(['h', 'b']);
        return { q: q([para(big('Which letter starts with a tall line from the top line?'))]), a: mc(t, t === 'h' ? ['n', 'r'] : ['p', 'm']),
          hint: 'Tall letters start at the top line.', steps: [q1(t) + ' starts with a tall line from the top line.', 'The others start at the middle line.'] }; }
      return { q: q([para(big('Which letter’s line goes down below the baseline?'))]), a: mc('p', ['b', 'n']),
        hint: 'Which one is a tail letter?', steps: ['p starts at the middle line and its line goes down below the baseline.', 'b’s line is tall, and n stays between the middle line and the baseline.'] }; }
    if (shape === 'order' || shape === 'order3') return orderP(R, lv, ['n', 'h', 'm', 'b', 'p', 'r'], 'print', shape === 'order3');
    return spotP(R, lv, ['barn', 'hen', 'map', 'bump', 'hum', 'harp', 'numb'], ['short', 'float', 'mirror'], 'print');
  });

  G('hand.slant-letters', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'dir']), R.pick(['count', 'order', 'ylong']), R.pick(['order3', 'spot', 'ylong']));
    if (shape === 'trace') return traceP(R, lv, ['v', 'x', 'z', 'w'], 'print');
    if (shape === 'dir') return orderP(R, lv, ['v', 'w', 'z'], 'print');
    if (shape === 'count') return countP(R, lv, ['v', 'w', 'x', 'z', 'y'], 'print');
    if (shape === 'order' || shape === 'order3') return orderP(R, lv, ['x', 'y', 'k'], 'print', shape === 'order3');
    if (shape === 'ylong') return { q: q([para(big('Where does the long slant of y start?'))]), a: mc('at the middle line, on the right side', ['at the middle line, on the left side', 'at the top line']),
      viz: { name: 'wr-letter', opts: { chars: 'y', numbers: false, arrows: false, quiet: true, interactive: false } },
      hint: 'The short slant comes first, from the left.', steps: ['y’s first, short slant starts on the left and stops at the baseline.', 'The long slant starts at the middle line on the right and goes down below the baseline.', 'Starting the long slant on the left makes a backward y.'] };
    return spotP(R, lv, ['zoo', 'wax', 'yak', 'kid', 'zip', 'sky'], ['mirror', 'float', 'big'], 'print');
  });

  G('hand.other-lower', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'estart']), R.pick(['dir', 'order', 'estart', 'dot']), R.pick(['order3', 'spot', 'dir']));
    if (shape === 'trace') return traceP(R, lv, ['e', 's', 'u', 'j'], 'print');
    if (shape === 'estart') return { q: q([readme(lv), para(big('How does e start?'))]), a: mc('with a line across the middle of the short space', ['at the top, curving like c', 'at the baseline, going up']),
      viz: lv === 1 ? { name: 'wr-letter', opts: { chars: 'e', quiet: true, interactive: false } } : undefined,
      hint: 'Look for the green 1.', steps: ['e starts with a line across, halfway between the middle line and the baseline.', 'Then it curves up, back and around like c.'] };
    if (shape === 'dot') return { q: q([para(big('Which of these letters has a dot?'))]), a: mc('j', ['f', 'u']), hint: 'Two letters in the alphabet have dots: i and one more.', steps: ['j has a dot, made after its line and tail.', 'f has a cross; u has no dot.'] };
    if (shape === 'dir') return orderP(R, lv, ['e', 's'], 'print');
    if (shape === 'order' || shape === 'order3') return orderP(R, lv, ['f', 'j', 'u'], 'print', shape === 'order3');
    return spotP(R, lv, ['sun', 'yes', 'fuse', 'jest', 'use', 'seen'], ['mirror', 'float'], 'print');
  });

  var TALLS = 'bdfhklt'.split(''), SHORTS = 'acemnorsuvwxz'.split(''), TAILS = 'gjpqy'.split('');
  G('hand.letter-sizes', function (R, ctx) {
    var lv = ctx.level, Hd = H(), shape = ML.byLevel(ctx, R.pick(['zone', 'pick']), R.pick(['inword', 'pick']), R.pick(['spot', 'inword']));
    if (shape === 'zone') { var ch = R.pick(LOWER), z = Hd.zone(ch);
      return { q: q([readme(lv), para(big('What kind of letter is ' + ch + '?'))]), a: mcKeep(['a tall letter', 'a short letter', 'a letter with a tail'], ['tall', 'short', 'tail'].indexOf(z)),
        viz: { name: 'wr-letter', opts: { chars: ch, numbers: false, arrows: false, quiet: true, interactive: false } }, hint: 'Does it reach the top line? Does it go below the baseline?',
        steps: [q1(ch) + ' is ' + ZONE_WORD[z] + '.'] }; }
    if (shape === 'pick') { var want = R.pick(['tall', 'short', 'tail']), pool = { tall: TALLS, short: SHORTS, tail: TAILS };
      var right = R.pick(pool[want]), wrong = ['tall', 'short', 'tail'].filter(function (x) { return x !== want; }).map(function (x) { return R.pick(pool[x]); });
      return { q: q([readme(lv), para(big('Which one is ' + ZONE_WORD[want] + '?'))]), a: mc(right, wrong), hint: 'Tall: b d f h k l t. Tails: g j p q y.',
        steps: [q1(right) + ' is ' + ZONE_WORD[want] + '.', wrong.map(function (c) { return q1(c) + ' is ' + ZONE_WORD[Hd.zone(c)]; }).join('; ') + '.'] }; }
    if (shape === 'inword') { var words = ['happy', 'jump', 'garden', 'puppy', 'kite', 'yellow', 'build', 'fudge', 'quilt'], w2 = R.pick(words), kind = R.pick(['tall', 'tail']);
      var idx = w2.split('').map(function (c, i) { return Hd.zone(c) === kind ? i : -1; }).filter(function (i) { return i >= 0; });
      if (!idx.length) { kind = kind === 'tall' ? 'tail' : 'tall'; idx = w2.split('').map(function (c, i) { return Hd.zone(c) === kind ? i : -1; }).filter(function (i) { return i >= 0; }); }
      var k = R.pick(idx), nonk = w2.split('').map(function (c, i) { return Hd.zone(c) !== kind ? i : -1; }).filter(function (i) { return i >= 0; });
      var ch2 = [k].concat(R.sample(nonk, Math.min(2, nonk.length))).sort(function (a, b) { return a - b; });
      return { q: q([para(big('Which numbered letter is ' + ZONE_WORD[kind] + '?'))]), a: mcKeep(ch2.map(function (i) { return 'letter ' + (i + 1) + ' (' + w2[i] + ')'; }), ch2.indexOf(k)),
        viz: { name: 'wr-join', opts: { text: w2, style: 'print', numbers: true, quiet: true, interactive: false } }, hint: kind === 'tall' ? 'Which letter reaches the top line?' : 'Which letter hangs below the baseline?',
        steps: ['Letter ' + (k + 1) + ', ' + q1(w2[k]) + ', is ' + ZONE_WORD[kind] + '.', ch2.filter(function (i) { return i !== k; }).map(function (i) { return q1(w2[i]) + ' is ' + ZONE_WORD[Hd.zone(w2[i])]; }).join('; ') + '.'] }; }
    return spotP(R, lv, ['happy', 'jump', 'garden', 'kite', 'yellow', 'build', 'quilt'], ['short', 'float', 'big'], 'print');
  });

  /* ---------------------------------------------------------------- print capitals */
  G('hand.caps-straight', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'count']), R.pick(['order', 'count', 'bar', 'which']), R.pick(['order3', 'which', 'bar']));
    if (shape === 'trace') return traceP(R, lv, ['L', 'T', 'E', 'H'], 'print');
    if (shape === 'count') return countP(R, lv, ['E', 'F', 'H', 'I', 'L', 'T'], 'print');
    if (shape === 'order' || shape === 'order3') return orderP(R, lv, ['E', 'F', 'H', 'T', 'I'], 'print', shape === 'order3');
    if (shape === 'bar') return { q: q([para(big('Where does the middle bar of ' + R.pick(['E', 'F']) + ' go?'))]), a: mcKeep(['on the middle line', 'close to the top line', 'close to the baseline'], 0),
      hint: 'Look at the dotted line.', steps: ['The middle bar sits on the dotted middle line.', 'Too high or too low, and the letter looks lopsided.'] };
    var pick = R.pick([['E', 'a line down and three lines across'], ['F', 'a line down and two lines across, at the top and the middle'], ['L', 'a line down and one line across the bottom'], ['T', 'a line down and one line across the top'], ['H', 'two lines down and one line across the middle']]);
    var wrong = ['E', 'F', 'L', 'T', 'H', 'I'].filter(function (x) { return x !== pick[0]; });
    return { q: q([para(big('Which capital is ' + pick[1] + '?'))]), a: mc(pick[0], R.sample(wrong, 2)), hint: 'Picture each capital in your head.',
      steps: [q1(pick[0]) + ' is ' + pick[1] + '.'] };
  });

  G('hand.caps-slant', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'dir']), R.pick(['order', 'count', 'nway', 'spot']), R.pick(['order3', 'spot', 'nway']));
    if (shape === 'trace') return traceP(R, lv, ['V', 'X', 'Z', 'A'], 'print');
    if (shape === 'dir') return orderP(R, lv, ['V', 'W', 'Z'], 'print');
    if (shape === 'count') return countP(R, lv, ['A', 'V', 'W', 'X', 'Z'], 'print');
    if (shape === 'order' || shape === 'order3') return orderP(R, lv, ['A', 'K', 'M', 'N', 'X', 'Y'], 'print', shape === 'order3');
    if (shape === 'nway') { var c = R.pick(['N', 'Z']), vs = R.shuffle([{ text: c }, { text: c, distort: { index: 0, kind: 'mirror' } }]), vv = vs[0].distort ? 1 : 0;
      return { q: q([para(big('Which picture shows ' + c + ' facing the right way?'))]), a: mcKeep(['A', 'B'], vv),
        viz: { name: 'wr-join', opts: { variants: vs, style: 'print', quiet: true, interactive: false } },
        hint: c === 'N' ? 'The slant of N goes down to the right.' : 'The slant of Z goes down to the left.', steps: [c === 'N' ? 'N: a line down, then a slant from the top left down to the bottom right, then a line down.' : 'Z: across the top, a slant down to the left, across the bottom.', 'The other picture is backward.'] };
    }
    return spotP(R, lv, ['NAP', 'ZAP', 'NET', 'ZIP', 'NEXT', 'MAZE', 'ZONE'], ['mirror', 'float'], 'print');
  });

  G('hand.caps-curve', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'linefirst']), R.pick(['order', 'dir', 'linefirst', 'bumps']), R.pick(['order3', 'spot', 'bumps']));
    if (shape === 'trace') return traceP(R, lv, ['C', 'O', 'U', 'D'], 'print');
    if (shape === 'linefirst') { var r = R.pick(['B', 'D', 'P', 'R']), w = R.sample(['C', 'G', 'O', 'S', 'Q'], 2);
      return { q: q([readme(lv), para(big('Which capital starts with a line down?'))]), a: mc(r, w), hint: 'B, D, P and R start with a line.',
        steps: [q1(r) + ' starts with a line down from the top line, then its bump.', w.join(' and ') + ' start with a curve near the top.'] }; }
    if (shape === 'dir') return orderP(R, lv, ['C', 'O', 'S', 'U'], 'print');
    if (shape === 'order' || shape === 'order3') return orderP(R, lv, ['B', 'D', 'P', 'R'], 'print', shape === 'order3');
    if (shape === 'bumps') { var bb = R.pick([['B', 'two bumps that meet at the middle line'], ['D', 'one big bump from the top line to the baseline'], ['P', 'one bump at the top, ending at the middle line'], ['R', 'one bump at the top and a leg slanting down']]);
      var wr = ['B', 'D', 'P', 'R'].filter(function (x) { return x !== bb[0]; });
      return { q: q([para(big('Which capital has a line down and ' + bb[1] + '?'))]), a: mc(bb[0], R.sample(wr, 2)), hint: 'Picture B, D, P and R.', steps: [q1(bb[0]) + ' has ' + bb[1] + '.'] }; }
    return spotP(R, lv, ['BUS', 'CUP', 'DOG', 'SOUP', 'JOG', 'CORD'], ['mirror', 'float'], 'print');
  });

  G('hand.b-and-d', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['which', 'first']), R.pick(['which', 'first', 'order', 'spot']), R.pick(['spot', 'order3', 'word']));
    if (shape === 'which') { var c = R.pick(['b', 'd', 'p', 'q']);
      return whichP(R, lv, c, ['b', 'd', 'p', 'q'].filter(function (x) { return x !== c; }).slice(0, lv === 1 ? 1 : 3).concat([]), 'print'); }
    if (shape === 'first') { var c2 = R.pick(['b', 'd', 'p', 'q']), line = c2 === 'b' || c2 === 'p';
      return { q: q([readme(lv), para(big('How does ' + c2 + ' start?'))]), a: mcKeep(['with a line down', 'with a c curve'], line ? 0 : 1),
        hint: 'Remember: d begins with c.', steps: [line ? q1(c2) + ' starts with a line down, then the bump.' : q1(c2) + ' starts with a c curve, closed into a circle, then the line.'] }; }
    if (shape === 'order' || shape === 'order3') return orderP(R, lv, ['b', 'd', 'p', 'q'], 'print', shape === 'order3');
    if (shape === 'word') { var wd = R.pick(['bed', 'dog', 'bad', 'dip', 'big', 'bud', 'pod', 'bid', 'dab', 'quip']);
      var flip = function (w, from) { return w.split('').map(function (c, i) { return from.indexOf(i) >= 0 ? ({ b: 'd', d: 'b', p: 'q', q: 'p' }[c] || c) : c; }).join(''); };
      var pos = wd.split('').map(function (c, i) { return 'bdpq'.indexOf(c) >= 0 ? i : -1; }).filter(function (i) { return i >= 0; });
      var wrongs = [flip(wd, [pos[0]]), flip(wd, pos)].filter(function (x, i, a) { return x !== wd && a.indexOf(x) === i; });
      if (wrongs.length < 2) wrongs.push(flip(wd, [pos[pos.length - 1]]) === wd ? wd.split('').reverse().join('') : flip(wd, [pos[pos.length - 1]]));
      return { q: q([para(big('What does this word say?'))]), a: mc(wd, wrongs.filter(function (x, i, a) { return x !== wd && a.indexOf(x) === i; })),
        viz: { name: 'wr-join', opts: { text: wd, style: 'print', quiet: true, interactive: false } },
        hint: 'For each b, d, p or q: does the line come first (b, p) or the circle (d, q)?', steps: ['Look at each letter: b and p have the line on the left; d and q have the circle on the left.', 'The word is ' + q1(wd) + '.'] }; }
    return spotP(R, lv, ['bed', 'dad', 'bud', 'pod', 'drop', 'bend', 'pad'], ['mirror'], 'print', 'One letter is facing the wrong way.');
  });

  /* ---------------------------------------------------------------- spacing and neat printing */
  var SPACE_WORDS = ['jump', 'kite', 'happy', 'garden', 'rabbit', 'puppy', 'lemon', 'window', 'tiger', 'basket'];
  function gapAt(w, i) { return w.slice(0, i) + ' ' + w.slice(i); }
  G('hand.letter-spacing', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, 'pair', R.pick(['which', 'how']), R.pick(['three', 'which']));
    var w = R.pick(SPACE_WORDS);
    if (shape === 'pair' || shape === 'three') {
      var gaps = R.sample(w.split('').map(function (c, i) { return i; }).slice(1), shape === 'three' ? 2 : 1).sort();
      var vars = [{ text: w }].concat(gaps.map(function (g) { return { text: gapAt(w, g) }; })), order = R.shuffle(vars.map(function (x, i) { return i; })), shown = order.map(function (i) { return vars[i]; }), v = order.indexOf(0);
      return { q: q([readme(lv), para(big('Which picture shows the word ' + w + ' with good spacing?'))]), a: mcKeep(shown.map(function (x, i) { return Lt(i); }), v),
        viz: { name: 'wr-join', opts: { variants: shown, style: 'print', quiet: true, interactive: false } },
        hint: 'Does it look like one word?', steps: ['In ' + Lt(v) + ', the letters sit close together, so it reads as one word.', 'The other' + (shown.length > 2 ? 's have' : ' has') + ' a big gap inside the word, so it looks like two words.'] };
    }
    if (shape === 'which') { var w2 = R.pick(SPACE_WORDS.filter(function (x) { return x !== w; })), g = R.int(1, w.length - 1), first = R.coin();
      var text = first ? gapAt(w, g) + ' ' + w2 : w2 + ' ' + gapAt(w, g);
      return { q: q([para(R.pick(NAMES) + ' meant to write two words: <b>' + (first ? w + ' ' + w2 : w2 + ' ' + w) + '</b>.'), para(big('Which word has a gap inside it?'))]), a: mc(w, [w2]),
        viz: { name: 'wr-join', opts: { text: text, style: 'print', quiet: true, interactive: false } },
        hint: 'Count the pieces: two words should make two pieces.', steps: ['The word ' + q1(w) + ' has a big gap after ' + q1(w.slice(0, g)) + '.', 'That makes it look like two words: ' + q1(w.slice(0, g)) + ' and ' + q1(w.slice(g)) + '.'] };
    }
    return { q: q([para(big('How close should the letters in one word be?'))]), a: mc('Close together, but not touching', ['A finger space apart', 'Touching and on top of each other']),
      hint: 'A finger space is for between words.', steps: ['Letters in a word sit close, with just a little space.', 'A finger space goes between words, not inside them.'] };
  });

  var SENTS = ['I see a frog', 'We can run', 'My dog is big', 'The sun is hot', 'I like red', 'Pam has a cat', 'We go to bed'];
  G('hand.word-spacing', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, 'pair', R.pick(['three', 'find']), R.pick(['find', 'three', 'how']));
    var s = R.pick(SENTS), ws = s.split(' ');
    if (shape === 'pair' || shape === 'three') {
      var vars = [{ text: s + '.' }, { text: ws.join('') + '.' }];
      if (shape === 'three') { var s2 = R.pick(['We ran', 'It is fun', 'I sat', 'Pam hid', 'He hops']); vars = [{ text: s + '. ' + s2 + '.' }, { text: s + '.' + s2 + '.' }, { text: ws.join('') + '. ' + s2.replace(/ /g, '') + '.' }]; }
      var order = R.shuffle(vars.map(function (x, i) { return i; })), shown = order.map(function (i) { return vars[i]; }), v = order.indexOf(0);
      return { q: q([readme(lv), para(big('Which picture has a finger space between all the words?'))]), a: mcKeep(shown.map(function (x, i) { return Lt(i); }), v),
        viz: { name: 'wr-join', opts: { variants: shown, style: 'print', quiet: true, interactive: false } },
        hint: 'Look for a space after every word, and after a period.', steps: ['In ' + Lt(v) + ', every word has a space after it' + (shape === 'three' ? ', including after the period' : '') + '.', shape === 'three' ? 'One wrong picture forgets the space after the period; the other runs words together.' : 'The other picture runs the words together.'] };
    }
    if (shape === 'find') { var k = R.int(0, ws.length - 2), text = ws.slice(0, k).concat([ws[k] + ws[k + 1]], ws.slice(k + 2)).join(' ') + '.';
      var pairs = []; for (var i = 0; i < ws.length - 1; i++) pairs.push(ws[i] + ' and ' + ws[i + 1]);
      var right = pairs[k], wrong = R.sample(pairs.filter(function (x, i) { return i !== k; }), Math.min(2, pairs.length - 1));
      return { q: q([para(big('Which two words need a space between them?'))]), a: mc(right, wrong),
        viz: { name: 'wr-join', opts: { text: text, style: 'print', quiet: true, interactive: false } },
        hint: 'Read the line word by word.', steps: ['The words ' + q1(ws[k]) + ' and ' + q1(ws[k + 1]) + ' are run together.', 'Fixed: ' + s + '.'] };
    }
    return { q: q([para(big('How much space goes between two words?'))]), a: mc('About one finger’s width', ['No space at all', 'Half the line']),
      hint: 'Use your finger as a spacer.', steps: ['Between words, leave about one finger’s width.', 'After a period, leave a finger space before the next sentence too.'] };
  });

  G('hand.on-the-lines', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, 'pair', R.pick(['spot', 'pair']), 'spotline');
    var words = ['red kite', 'big hen', 'fun day', 'my hat', 'tall tree', 'blue sky', 'happy dog'];
    if (shape === 'pair') { var w = R.pick(words), n = w.replace(/ /g, '').length, k = R.int(0, n - 1), kind = R.pick(['float', 'big']);
      while (kind === 'big' && !eligible(w.replace(/ /g, '')[k], 'big', 'print')) { kind = 'float'; }
      var vars = R.shuffle([{ text: w }, { text: w, distort: { index: k, kind: kind } }]), v = vars[0].distort ? 1 : 0;
      return { q: q([readme(lv), para(big('Which picture has every letter sitting on the lines the right way?'))]), a: mcKeep(['A', 'B'], v),
        viz: { name: 'wr-join', opts: { variants: vars, style: 'print', quiet: true, interactive: false } },
        hint: 'Run your finger along the baseline.', steps: ['In ' + Lt(v) + ', every letter touches the baseline and is the right size.', 'In ' + Lt(1 - v) + ', the letter ' + q1(w.replace(/ /g, '')[k]) + ' ' + KIND_SAY[kind] + '.'] }; }
    if (shape === 'spot') return spotP(R, lv, words, ['float', 'big', 'short'], 'print');
    return spotP(R, lv, ['the red kite', 'a big brown hen', 'my happy dog', 'look at the sky'], ['float', 'big', 'short'], 'print');
  });

  var COPY = ['My cat can jump.', 'We like red apples.', 'The dog ran home.', 'I see a big bird.', 'Dad made good soup.', 'Sam has a blue bed.'];
  var FIX = { skip: 'A word is missing.', lower: 'It needs a capital letter at the start.', noend: 'It needs a period at the end.', flip: 'A letter is backward.' };
  G('hand.neat-copy', function (R, ctx) {
    var lv = ctx.level, s = R.pick(COPY), err = R.pick(['skip', 'lower', 'noend', 'flip']), copy = s, ws = s.slice(0, -1).split(' '), distort, note;
    if (err === 'skip') { var k = R.int(1, ws.length - 1); note = ws[k]; copy = ws.filter(function (x, i) { return i !== k; }).join(' ') + '.'; }
    else if (err === 'lower') { copy = s.charAt(0).toLowerCase() + s.slice(1); }
    else if (err === 'noend') { copy = s.slice(0, -1); }
    else { var ls = s.replace(/[ .]/g, ''), idx = ls.split('').map(function (c, i) { return 'bdpqs'.indexOf(c) >= 0 ? i : -1; }).filter(function (i) { return i >= 0; }); var at = R.pick(idx); distort = { index: at, kind: 'mirror' }; note = ls[at]; }
    var shape = ML.byLevel(ctx, 'fix', 'fix', 'fix3');
    var wrong = Object.keys(FIX).filter(function (x) { return x !== err; }).map(function (x) { return FIX[x]; });
    return { q: q([readme(lv, 'Read the model sentence aloud, then look at the copy together.'), para('Model: ' + big(s)), para(R.pick(NAMES) + ' copied it like this.'), para(big('What needs fixing?'))]),
      a: mc(FIX[err], lv === 1 ? R.sample(wrong, 1) : shape === 'fix3' ? wrong : R.sample(wrong, 2)),
      viz: { name: 'wr-join', opts: { text: copy, style: 'print', distort: distort, quiet: true, interactive: false } },
      hint: 'Check the capital, every word, the letters and the end mark, one at a time.',
      steps: [err === 'skip' ? 'Reading word by word, the word ' + q1(note) + ' is missing.' : err === 'lower' ? 'The copy starts with a small letter; a sentence starts with a capital.' : err === 'noend' ? 'The copy has no period at the end.' : 'The letter ' + q1(note) + ' is facing the wrong way.', 'Everything else matches the model.'] };
  });

  /* ---------------------------------------------------------------- numbers */
  function digitRow(R, pool, n) { return R.sample(pool, n).join(''); }
  G('hand.numbers-0-4', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'count']), R.pick(['order', 'dir', 'start', 'count']), R.pick(['order3', 'spot', 'dir']));
    if (shape === 'trace') return traceP(R, lv, ['0', '1', '2', '3', '4'], 'print');
    if (shape === 'count') return countP(R, lv, ['0', '1', '2', '3', '4'], 'print');
    if (shape === 'order' || shape === 'order3') return orderP(R, lv, ['4'], 'print', shape === 'order3');
    if (shape === 'dir') return orderP(R, lv, ['0', '2', '3'], 'print');
    if (shape === 'start') { var d = R.pick(['0', '1', '4']);
      return { q: q([para(big('Where does ' + d + ' start?'))]), a: mcKeep(['at the top line', 'at the middle line', 'at the baseline'], 0), hint: 'Numbers are written from the top.',
        steps: ['Every number is as tall as a capital.', q1(d) + ' starts at the top line.'] }; }
    return spotP(R, lv, ['1234', '2034', '4321', '3140', '2413'], ['mirror', 'float'], 'print');
  });

  G('hand.numbers-5-9', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'hat']), R.pick(['order', 'dir', 'count', 'hat']), R.pick(['order3', 'spot', 'dir']));
    if (shape === 'trace') return traceP(R, lv, ['5', '6', '7', '8', '9'], 'print');
    if (shape === 'count') return countP(R, lv, ['5', '6', '7', '8', '9'], 'print');
    if (shape === 'order' || shape === 'order3') return orderP(R, lv, ['5', '9'], 'print', shape === 'order3');
    if (shape === 'dir') return orderP(R, lv, ['6', '7', '8'], 'print');
    if (shape === 'hat') return { q: q([readme(lv), para(big('What do you write last on 5?'))]), a: mc('its hat, the line across the top', ['its round belly', 'the line down']),
      viz: { name: 'wr-letter', opts: { chars: '5', quiet: true, interactive: false } }, hint: 'Look at the numbers on the picture.', steps: ['Stroke 1 of 5 goes down and around the belly.', 'Stroke 2 is the hat across the top, written last.'] };
    return spotP(R, lv, ['5678', '9876', '1958', '2789', '5069'], ['mirror', 'float'], 'print');
  });

  var FACING = { '2': 'its top curves to the right, then it slants down to the left', '3': 'both of its curves bulge to the right', '5': 'its belly bulges to the right', '7': 'its top goes across to the right, then it slants down to the left', '9': 'its circle is on the left and its line on the right' };
  G('hand.number-flips', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, 'pair', R.pick(['pair', 'spot', 'face']), R.pick(['spot', 'face']));
    if (shape === 'pair') { var d = R.pick(['2', '3', '5', '7', '9']), vs = R.shuffle([{ text: d }, { text: d, distort: { index: 0, kind: 'mirror' } }]), v = vs[0].distort ? 1 : 0;
      return { q: q([readme(lv), para(big('Which ' + d + ' faces the right way?'))]), a: mcKeep(['A', 'B'], v),
        viz: { name: 'wr-join', opts: { variants: vs, style: 'print', quiet: true, interactive: false } }, hint: 'Picture the number on a clock or a number line.',
        steps: ['In ' + Lt(v) + ', ' + FACING[d] + '.', 'The other one is backward.'] }; }
    if (shape === 'face') { var d2 = R.pick(['3', '5', '9']), right = FACING[d2], wr = d2 === '9' ? ['its circle is on the right and its line on the left', 'its circle is at the bottom'] : [d2 === '3' ? 'both of its curves bulge to the left' : 'its belly bulges to the left', 'it faces either way'];
      return { q: q([para(big('Which sentence about ' + d2 + ' is true?'))]), a: mc(cap1(right) + '.', wr.map(function (x) { return cap1(x) + '.'; })), hint: 'Picture the number.', steps: [cap1(right) + '.'] }; }
    var row = R.sample(['2', '3', '5', '7', '9'], 4).join(''), k = R.int(0, 3), ch = R.sample([0, 1, 2, 3].filter(function (i) { return i !== k; }), lv === 1 ? 1 : 2).concat([k]).sort();
    return { q: q([para('This should say <b>' + row + '</b>.'), para(big('Which number is backward?'))]), a: mcKeep(ch.map(function (i) { return 'number ' + (i + 1) + ' (' + row[i] + ')'; }), ch.indexOf(k)),
      viz: { name: 'wr-join', opts: { text: row, style: 'print', distort: { index: k, kind: 'mirror' }, numbers: true, quiet: true, interactive: false } },
      hint: 'Check each one: which way does it face?', steps: ['Number ' + (k + 1) + ', ' + q1(row[k]) + ', is backward: ' + FACING[row[k]] + ' when it faces the right way.'] };
  });

  /* ---------------------------------------------------------------- getting ready for cursive */
  var EASY = ['cat', 'sun', 'dog', 'hat', 'fish', 'milk', 'tree', 'jump', 'kite', 'red', 'moon', 'bird'];
  G('hand.what-is-cursive', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, 'which', R.pick(['read', 'same', 'which']), R.pick(['joined', 'lift', 'read']));
    if (shape === 'which') { var w = R.pick(EASY), vs = R.shuffle([{ text: w, style: 'print' }, { text: w }]), v = vs[0].style ? 1 : 0;
      return { q: q([readme(lv), para(big('Which picture shows the word in cursive?'))]), a: mcKeep(['A', 'B'], v), viz: { name: 'wr-join', opts: { variants: vs, quiet: true, interactive: false } },
        hint: 'In cursive, the letters are joined.', steps: ['In ' + Lt(v) + ', the letters are joined and lean: that is cursive.', 'The other picture is print: the letters stand apart.'] }; }
    if (shape === 'read') { var w2 = R.pick(EASY); return readP(R, lv, [[w2].concat(R.sample(EASY.filter(function (x) { return x !== w2; }), 2))], false); }
    if (shape === 'same') return { q: q([para(big('How many letters does the cursive alphabet have?'))]), a: mc('26, the same letters as print', ['52', 'Only the small letters']),
      hint: 'Is cursive a new alphabet?', steps: ['Cursive has the same 26 letters as print, small and capital.', 'They are joined and some have new shapes.'] };
    if (shape === 'lift') return { q: q([para(big('When writing a word in cursive, when do you lift the pencil?'))]), a: mc('When the word is done (then add dots and crosses)', ['After every letter', 'Never, not even between words']),
      hint: 'Joined letters keep the pencil down.', steps: ['The letters of a word are joined, so the pencil stays down.', 'Lift at the end of the word, then dot and cross.'] };
    return joinedP(R, lv, EASY);
  });

  var STROKE_NAME = { under: 'undercurve', over: 'overcurve', down: 'downcurve', slant: 'slant line' };
  G('hand.cursive-strokes', function (R, ctx) {
    var lv = ctx.level, Hd = H(), shape = ML.byLevel(ctx, 'pick2', R.pick(['pick3', 'starts']), R.pick(['pick4', 'starts']));
    if (shape.indexOf('pick') === 0) { var n = +shape.slice(4), show = R.sample(['under', 'over', 'down', 'slant'], n), want = R.pick(show), v = show.indexOf(want);
      return { q: q([readme(lv), para(big('Which picture shows the ' + STROKE_NAME[want] + '?'))]), a: mcKeep(show.map(function (x, i) { return Lt(i); }), v),
        viz: { name: 'hand-strokes', opts: { show: show, quiet: true, interactive: false } }, hint: { under: 'It swings up like a smile.', over: 'It goes up and over like a hill.', down: 'It curves back like the start of c.', slant: 'It is straight.' }[want],
        steps: [Lt(v) + ' is the ' + STROKE_NAME[want] + ': ' + { under: 'a swing up, like a smile', over: 'a hill', down: 'a curve back and down, like the start of c', slant: 'a straight line, leaning' }[want] + '.'] }; }
    var grp = R.pick([['over', Hd.GROUPS.cursiveHills], ['down', Hd.GROUPS.cursiveC], ['under', Hd.GROUPS.cursiveUnder.concat(['e', 'l'])]]), c = R.pick(grp[1]);
    return { q: q([para(big('Cursive ' + c + ' begins with which stroke?'))]), a: mc(STROKE_NAME[grp[0]], ['under', 'over', 'down'].filter(function (x) { return x !== grp[0]; }).map(function (x) { return STROKE_NAME[x]; })),
      viz: { name: 'wr-letter', opts: { chars: c, style: 'cursive', quiet: true, interactive: false } },
      hint: 'Is it a hill letter, a c-family letter, or neither?', steps: [grp[0] === 'over' ? q1(c) + ' is a hill letter (n m v x y z): it begins over a hill, an overcurve.' : grp[0] === 'down' ? q1(c) + ' is in the c family (a c d g o q): its body begins with a downcurve, like c.' : q1(c) + ' begins with an undercurve, a swing up like a smile.'] };
  });

  var SLANT_WORDS = [['little', [0, 2, 3, 4]], ['hello', [0, 2, 3]], ['kettle', [0, 2, 3, 4]], ['kitten', [0, 2, 3]], ['held', [0, 2, 3]], ['tell', [0, 2, 3]], ['field', [0, 3, 4]], ['hill', [0, 2, 3]], ['kind', [0, 3]], ['lid', [0, 2]]];
  G('hand.cursive-slant', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, 'pair', R.pick(['spot', 'paper', 'pair']), R.pick(['spot', 'paper']));
    var sw = R.pick(SLANT_WORDS), w = sw[0], k = R.pick(sw[1]), kind = lv === 3 && R.coin() ? 'back' : 'upright';
    if (shape === 'pair') { var vs = R.shuffle([{ text: w, odd: -1 }, { text: w, odd: k, kind: kind }]), v = vs[0].odd === -1 ? 0 : 1;
      return { q: q([readme(lv), para(big('In which picture do all the letters lean the same way?'))]), a: mcKeep(['A', 'B'], v),
        viz: { name: 'hand-slant', opts: { variants: vs, quiet: true, interactive: false } }, hint: 'Look at the tall letters. Do they all lean like rain in the wind?',
        steps: ['In ' + Lt(v) + ', every letter leans the same way.', 'In ' + Lt(1 - v) + ', the ' + q1(w[k]) + ' stands up straight.'] }; }
    if (shape === 'spot') { var n = w.length, others = R.sample(sw[1].filter(function (i) { return i !== k; }), Math.min(lv === 1 ? 1 : 2, sw[1].length - 1)), ch = [k].concat(others).sort();
      return { q: q([para('This should say <b>' + w + '</b>.'), para(big('Which letter doesn’t lean like the others?'))]), a: mcKeep(ch.map(function (i) { return 'letter ' + (i + 1); }), ch.indexOf(k)),
        viz: { name: 'hand-slant', opts: { text: w, odd: k, kind: kind, numbers: true, quiet: true, interactive: false } }, hint: 'Compare the tall letters.',
        steps: ['Letter ' + (k + 1) + ', ' + q1(w[k]) + ', ' + (kind === 'back' ? 'leans backward' : 'stands up straight') + '.', 'Every other letter leans forward the same amount.'] }; }
    var left = R.coin();
    return { q: q([para(R.pick(NAMES) + ' writes with the ' + (left ? 'left' : 'right') + ' hand.'), para(big('Which way should the top of the paper lean for cursive?'))]), a: mcKeep(['to the left', 'to the right', 'straight up'], left ? 1 : 0),
      hint: 'The tilt follows the writing hand.', steps: [left ? 'For a left hand, the top of the paper leans to the right.' : 'For a right hand, the top of the paper leans to the left.', 'Tilting the paper helps every letter lean the same way.'] };
  });

  /* ---------------------------------------------------------------- cursive lowercase */
  var LOW_ALIKE = { i: ['e', 'u'], t: ['l', 'i'], u: ['n', 'w'], w: ['u', 'm'], e: ['l', 'i'], l: ['e', 'b'], h: ['k', 'b'], k: ['h', 'b'], b: ['l', 'f'], f: ['b', 'j'], a: ['o', 'u'], c: ['e', 'o'], d: ['a', 'l'],
    g: ['q', 'y'], o: ['a', 'c'], q: ['g', 'y'], n: ['u', 'm'], m: ['n', 'w'], v: ['r', 'w'], x: ['n', 'v'], y: ['g', 'j'], z: ['y', 'g'], r: ['s', 'n'], s: ['r', 'e'], p: ['j', 'q'], j: ['p', 'g'] };
  var CAP_ALIKE = { A: ['O', 'C'], C: ['E', 'G'], E: ['C', 'G'], O: ['A', 'Q'], H: ['K', 'N'], K: ['H', 'R'], M: ['N', 'W'], N: ['M', 'U'], U: ['V', 'Y'], V: ['U', 'W'], W: ['M', 'V'], X: ['K', 'Y'], Y: ['U', 'J'],
    Z: ['Q', 'J'], B: ['R', 'P'], F: ['T', 'J'], P: ['B', 'R'], R: ['B', 'P'], T: ['F', 'J'], D: ['O', 'L'], G: ['C', 'S'], I: ['J', 'S'], J: ['I', 'Y'], L: ['S', 'Q'], Q: ['Z', 'L'], S: ['L', 'G'] };
  function whichCur(R, lv, pool) { var c = R.pick(pool), al = (/[A-Z]/.test(c) ? CAP_ALIKE : LOW_ALIKE)[c]; return whichP(R, lv, c, lv === 1 ? al.slice(0, 1) : al, 'cursive'); }
  function readTyped(R, lv, words) { return readP(R, lv, [[R.pick(words)]], true); }
  var W_ITUW = ['it', 'wit', 'tutu'];
  G('hand.cursive-i-t-u-w', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'which']), R.pick(['order', 'when', 'which']), R.pick(['order3', 'when', 'which', 'joined']));
    if (shape === 'trace') return traceP(R, lv, ['i', 't', 'u', 'it'], 'cursive');
    if (shape === 'which') return whichCur(R, lv, ['i', 't', 'u', 'w']);
    if (shape === 'order' || shape === 'order3') return orderP(R, lv, ['i', 't'], 'cursive', shape === 'order3');
    if (shape === 'joined') return joinedP(R, lv, W_ITUW);
    var c = R.pick(['i', 't']), w = c === 'i' ? R.pick(['it', 'wit']) : R.pick(['it', 'tutu', 'wit']);
    return { q: q([para(big('When you write ' + w + ' in cursive, when do you ' + (c === 'i' ? 'dot the i' : 'cross the t') + '?'))]), a: mc('After the whole word is written', ['Before writing the letter', 'Right after the letter, before the next one']),
      hint: 'Keep the pencil moving through the word.', steps: ['Write the whole word with the pencil down.', 'Then lift and ' + (c === 'i' ? 'dot every i' : 'cross every t') + '.'] };
  });

  var W_LOOPS = [['hill', 'hike', 'will'], ['bite', 'kite', 'white'], ['tell', 'bell', 'tile'], ['left', 'lift', 'felt'], ['little', 'kettle', 'title'], ['wheel', 'while', 'whale'], ['belt', 'bell', 'bet'], ['tube', 'tub', 'tune']];
  G('hand.cursive-loops', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'which']), R.pick(['read', 'which', 'below']), R.pick(['spot', 'read', 'below']));
    if (shape === 'trace') return traceP(R, lv, ['e', 'l', 'h', 'b'], 'cursive');
    if (shape === 'which') return whichCur(R, lv, ['e', 'l', 'h', 'k', 'b', 'f']);
    if (shape === 'read') return readP(R, lv, W_LOOPS, false);
    if (shape === 'below') return { q: q([para(big('Which loop letter has a loop below the baseline too?'))]), a: mc('f', ['l', 'h', 'k']), hint: 'Which one has two loops?',
      steps: ['Cursive f has a tall loop on top and a second loop below the baseline.', 'l, h and k have only the tall loop.'] };
    return spotP(R, lv, ['little', 'bell', 'hill', 'kettle', 'flute', 'held'], ['short', 'float'], 'cursive');
  });

  var C_PAIRS = [['cat', 'cut', 'cot'], ['hat', 'hut', 'hot'], ['bag', 'bug', 'big'], ['tag', 'tug', 'tog'], ['dog', 'clog', 'dug'], ['lock', 'luck', 'lack'], ['duck', 'dock', 'deck'], ['gold', 'good', 'cold'], ['add', 'odd', 'aid']];
  G('hand.cursive-c-family', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'which']), R.pick(['read', 'which', 'close']), R.pick(['typed', 'read']));
    if (shape === 'trace') return traceP(R, lv, ['a', 'o', 'c', 'd'], 'cursive');
    if (shape === 'which') return whichCur(R, lv, ['a', 'c', 'd', 'g', 'o', 'q']);
    if (shape === 'read') return readP(R, lv, C_PAIRS, false);
    if (shape === 'close') { var c = R.pick(['a', 'd', 'g']), looks = { a: 'u', d: 'cl', g: 'y' }[c];
      return { q: q([para(big('If the top of cursive ' + c + ' is left open, what can it look like?'))]), a: mc(looks, ['o', 'e'].concat(c === 'a' ? [] : ['u']).slice(0, 2)), hint: 'Picture the letter with a gap at the top.',
        steps: ['An open ' + c + ' loses its closed oval.', 'Then it looks like ' + q1(looks) + '.', 'Close the top every time.'] }; }
    return readTyped(R, lv, ['cat', 'dog', 'cold', 'good', 'gold', 'cake', 'cook', 'book', 'cloud', 'clock', 'glad']);
  });

  var HILL_PAIRS = [['moon', 'noon', 'moan'], ['mine', 'wine', 'nine'], ['net', 'wet', 'nut'], ['man', 'men', 'mat'], ['fun', 'fan', 'fin'], ['tune', 'tone', 'tome'], ['six', 'sit', 'mix'], ['zoo', 'too', 'boo'], ['many', 'money', 'mane']];
  G('hand.cursive-hills', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'which']), R.pick(['read', 'which', 'round']), R.pick(['typed', 'read']));
    if (shape === 'trace') return traceP(R, lv, ['n', 'm', 'v', 'y'], 'cursive');
    if (shape === 'which') return whichCur(R, lv, ['n', 'm', 'v', 'x', 'y', 'z']);
    if (shape === 'read') return readP(R, lv, HILL_PAIRS, false);
    if (shape === 'round') return { q: q([para(big('What makes cursive n different from cursive u?'))]), a: mc('n is round on top; u is round at the bottom', ['n is taller than u', 'n has a loop and u doesn’t']),
      hint: 'Look at the tops and the bottoms.', steps: ['n starts over a hill, so its tops are round.', 'u swings up from below, so its bottoms are round.'] };
    return readTyped(R, lv, ['man', 'zoo', 'box', 'six', 'vine', 'money', 'lazy', 'next', 'mix', 'navy', 'time']);
  });

  var RSPJ_PAIRS = [['rest', 'nest', 'vest'], ['rail', 'nail', 'sail'], ['rap', 'nap', 'sap'], ['rice', 'nice', 'mice'], ['rose', 'nose', 'hose'], ['sip', 'rip', 'zip'], ['jar', 'gar', 'far'], ['jug', 'gig', 'mug'], ['pin', 'jin', 'sin']];
  G('hand.cursive-r-s-p-j', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'which']), R.pick(['read', 'which', 'peak']), R.pick(['typed', 'read', 'peak']));
    if (shape === 'trace') return traceP(R, lv, ['r', 's', 'p', 'j'], 'cursive');
    if (shape === 'which') return whichCur(R, lv, ['r', 's', 'p', 'j']);
    if (shape === 'read') return readP(R, lv, RSPJ_PAIRS.filter(function (p) { return p[1] !== 'gar' && p[1] !== 'jin'; }), false);
    if (shape === 'peak') { var two = R.coin();
      return { q: q([para(big(two ? 'Which two cursive letters go up to a point a little above the middle line?' : 'Which two cursive letters go below the baseline?'))]), a: mc(two ? 'r and s' : 'p and j', two ? ['p and j', 'n and m'] : ['r and s', 'e and l']),
        hint: two ? 'Think of the letters that look least like print.' : 'Think of the tails.', steps: [two ? 'Cursive r and s rise to a point a little above the middle line.' : 'Cursive p and j go down below the baseline.'] }; }
    return readTyped(R, lv, ['rose', 'jar', 'sip', 'jump', 'ripe', 'star', 'paper', 'juice', 'spoon', 'frog', 'pig']);
  });

  var HIGH_PAIRS = [['on', 'an', 'in'], ['hot', 'hat', 'hit'], ['pot', 'pat', 'pit'], ['cot', 'cat', 'cut'], ['mop', 'map', 'mob'], ['top', 'tap', 'tip'], ['wet', 'vet', 'net'], ['bowl', 'bawl', 'boil'], ['oven', 'even', 'open']];
  G('hand.cursive-high-exits', function (R, ctx) {
    var lv = ctx.level, Hd = H(), shape = ML.byLevel(ctx, R.pick(['stay', 'which']), R.pick(['read', 'which', 'stay']), R.pick(['typed', 'read']));
    if (shape === 'stay') { var c = R.pick(['b', 'o', 'v', 'w', 'a', 'u', 'n']), high = Hd.highExit(c), nx = R.pick(['n', 'e', 'i']);
      return { q: q([readme(lv), para(big('After cursive ' + c + ', does the join to the next letter stay up at the middle line?'))]), a: mcKeep(['Yes', 'No'], high ? 0 : 1),
        viz: { name: 'wr-join', opts: { text: c + nx, quiet: true, interactive: false } }, hint: 'Where does ' + c + ' end: on the baseline or at the middle line?',
        steps: [high ? q1(c) + ' is one of b, o, v and w: it ends at the middle line, so the join stays up with a little bridge.' : q1(c) + ' ends on the baseline, so the next letter swings up from the baseline.'] }; }
    if (shape === 'which') { var r = R.pick(Hd.letters('cursive').filter(function (x) { return /[a-z]/.test(x) && Hd.highExit(x); })), wr = R.sample(['a', 'u', 'n', 'e', 'i', 'l', 'm', 't'].filter(function (x) { return !Hd.highExit(x); }), 2);
      return { q: q([para(big('Which letter ends at the middle line, so the next letter joins with a bridge?'))]), a: mc(r, wr), hint: 'There are four: b, o, v and w.',
        steps: [q1(r) + ' ends at the middle line.', wr.join(' and ') + ' end on the baseline.'] }; }
    if (shape === 'read') return readP(R, lv, HIGH_PAIRS, false);
    return readTyped(R, lv, ['on', 'we', 'bow', 'wow', 'oven', 'vow', 'box', 'boat', 'brown', 'over', 'web']);
  });

  /* ---------------------------------------------------------------- cursive capitals */
  function joinQ(R, lv, pool) {
    var c = R.pick(pool), j = H().joins(c), rest = { A: 'nn', C: 'al', E: 've', O: 'mar', H: 'ana', K: 'im', M: 'ia', N: 'ora', U: 'ma', V: 'ic', W: 'ill', X: 'avi', Y: 'uki', Z: 'oe', B: 'en', F: 'inn', P: 'at', R: 'osa', T: 'om', D: 'an', G: 'us', I: 'vy', J: 'o', L: 'ee', Q: 'uinn', S: 'am' }[c];
    return { q: q([readme(lv), para('This is the name <b>' + c + rest + '</b> in cursive.'), para(big('In this picture, does the capital ' + c + ' join the next letter?'))]), a: mcKeep(['Yes', 'No'], j ? 0 : 1),
      viz: { name: 'wr-join', opts: { text: c + rest, highlight: false, quiet: true, interactive: false } }, hint: 'Look between the capital and the next letter: is there a joining stroke?',
      steps: [j ? 'Cursive ' + c + ' ends on the baseline with an exit stroke, so it joins the next letter.' : 'Cursive ' + c + ' ends ' + (/[BDOPSVW]/.test(c) ? 'high or with a curl' : 'away from the next letter') + ', so the next letter starts on its own, close by.'] };
  }
  var NAMES_OVAL = ['Ann', 'Ada', 'Cal', 'Cole', 'Eve', 'Ella', 'Otto', 'Omar'], NAMES_HILL = ['Hana', 'Kim', 'Mia', 'Nora', 'Uma', 'Vic', 'Will', 'Yuki', 'Zoe', 'Max'],
    NAMES_LOOP = ['Ben', 'Finn', 'Pat', 'Rosa', 'Tom', 'Fay', 'Tia', 'Ray'], NAMES_OTHER = ['Dan', 'Gus', 'Ivy', 'Jo', 'Lee', 'Quinn', 'Sam', 'Jake', 'Ida', 'Lola'];
  function nameRead(R, lv, names, typed) {
    var n = R.pick(names), all = NAMES_OVAL.concat(NAMES_HILL, NAMES_LOOP, NAMES_OTHER).filter(function (x) { return x !== n && x[0] !== n[0]; });
    var near = all.filter(function (x) { return Math.abs(x.length - n.length) <= (all.filter(function (y) { return y.length === n.length; }).length >= 2 ? 0 : 1); });
    return readP(R, lv, [[n].concat(R.sample(near.length >= 2 ? near : all, 2))], typed, 'name'); }
  G('hand.cursive-caps-oval', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'which']), R.pick(['which', 'join', 'name']), R.pick(['name', 'typed', 'join']));
    if (shape === 'trace') return traceP(R, lv, ['A', 'C', 'O', 'E'], 'cursive');
    if (shape === 'which') return whichCur(R, lv, ['A', 'C', 'E', 'O']);
    if (shape === 'join') return joinQ(R, lv, ['A', 'C', 'E', 'O']);
    return nameRead(R, lv, NAMES_OVAL, shape === 'typed');
  });
  G('hand.cursive-caps-hills', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'which']), R.pick(['which', 'uv', 'name']), R.pick(['name', 'join', 'uv']));
    if (shape === 'trace') return traceP(R, lv, ['N', 'M', 'U', 'V'], 'cursive');
    if (shape === 'which') return whichCur(R, lv, ['H', 'K', 'M', 'N', 'U', 'V', 'W', 'X', 'Y', 'Z']);
    if (shape === 'uv') { var u = R.coin(); return { q: q([para(big('Which cursive capital ' + (u ? 'is round at the bottom and comes back down to the baseline?' : 'comes to a point at the bottom and ends up at the top line?')))]), a: mc(u ? 'U' : 'V', u ? ['V', 'W'] : ['U', 'Y']),
      hint: 'U and V start the same way. Look at the bottom and the end.', steps: [u ? 'U is round at the bottom and comes back down to the baseline, so it joins the next letter.' : 'V comes to a point and ends high at the top line.'] }; }
    if (shape === 'join') return joinQ(R, lv, ['H', 'K', 'M', 'N', 'U', 'V', 'W']);
    return nameRead(R, lv, NAMES_HILL, lv === 3 && R.coin());
  });
  G('hand.cursive-caps-loops', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['trace', 'which']), R.pick(['which', 'ft', 'name']), R.pick(['name', 'ft', 'join']));
    if (shape === 'trace') return traceP(R, lv, ['P', 'B', 'R'], 'cursive');
    if (shape === 'which') return whichCur(R, lv, ['B', 'F', 'P', 'R', 'T']);
    if (shape === 'ft') { var f = R.coin(); return { q: q([para(big(f ? 'Cursive F and T both have a wavy top. What does F have that T doesn’t?' : 'Which cursive capital is like P with a leg that kicks out?'))]), a: f ? mc('A cross in the middle', ['A loop below the baseline', 'A second bump']) : mc('R', ['B', 'F']),
      viz: f ? { name: 'wr-letter', opts: { chars: 'FT', style: 'cursive', numbers: false, arrows: false, quiet: true, interactive: false } } : undefined,
      hint: f ? 'Compare the two letters in the picture.' : 'Think of the bumps and legs.', steps: [f ? 'F has a short cross in the middle; T doesn’t.' : 'R is P with a leg kicking out to the baseline.'] }; }
    if (shape === 'join') return joinQ(R, lv, ['B', 'P', 'R']);
    return nameRead(R, lv, NAMES_LOOP, lv === 3 && R.coin());
  });
  G('hand.cursive-caps-others', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['which', 'two']), R.pick(['which', 'ij', 'name']), R.pick(['which', 'name', 'ij']));
    if (shape === 'which') return whichCur(R, lv, ['D', 'G', 'I', 'J', 'L', 'Q', 'S']);
    if (shape === 'two') return { q: q([readme(lv), para(big('Which cursive capital looks like the number 2?'))]), a: mc('Q', lv === 1 ? ['O'] : ['Z', 'S']), hint: 'It is a letter you don’t see often.', steps: ['Cursive Q looks like a 2.'] };
    if (shape === 'ij') return { q: q([para(big('Cursive I and J start the same way. What does J have that I doesn’t?'))]), a: mc('A loop below the baseline', ['A dot on top', 'A cross in the middle']),
      viz: { name: 'wr-letter', opts: { chars: 'IJ', style: 'cursive', numbers: false, arrows: false, quiet: true, interactive: false } }, hint: 'Look below the baseline.', steps: ['Both start at the middle line and swing up to the top.', 'J keeps going down below the baseline into a loop.'] };
    return nameRead(R, lv, NAMES_OTHER, lv === 3 && R.coin());
  });

  /* ---------------------------------------------------------------- joining */
  var JOIN_WORDS = ['cat', 'sun', 'milk', 'tree', 'fish', 'jump', 'kite', 'nest', 'apple', 'happy', 'lamp', 'frog', 'grape', 'snack', 'plum', 'swim', 'lunch', 'hand', 'king', 'yarn'];
  G('hand.joining-letters', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, 'joined', R.pick(['joined', 'ends', 'lift']), R.pick(['typed', 'ends', 'lift']));
    if (shape === 'joined') return joinedP(R, lv, JOIN_WORDS);
    if (shape === 'ends') { var c = R.pick(['a', 'e', 'i', 'l', 'm', 'n', 't', 'u', 'b', 'o', 'v', 'w']), high = H().highExit(c);
      return { q: q([para(big('Where does the exit stroke of cursive ' + c + ' end?'))]), a: mcKeep(['on the baseline', 'at the middle line', 'at the top line'], high ? 1 : 0),
        viz: { name: 'wr-letter', opts: { chars: c, style: 'cursive', numbers: false, quiet: true, interactive: false } }, hint: 'Is it one of b, o, v and w?',
        steps: [high ? q1(c) + ' is one of the four letters that end at the middle line (b, o, v, w).' : q1(c) + ' ends on the baseline, ready to swing up into the next letter.'] }; }
    if (shape === 'lift') { var w = R.pick(['sun', 'nose', 'ham', 'bell', 'cold', 'make', 'lamp', 'grape', 'frog', 'snake', 'plum', 'hand', 'yarn', 'cake', 'zoo', 'happy']);
      return { q: q([para(big('While writing ' + w + ' in cursive, when do you lift the pencil?'))]), a: mc('Only when the word is done', ['After every letter', 'After the first letter']),
        hint: 'This word has no i or t, so there is nothing to add.', steps: ['The letters of ' + q1(w) + ' are joined, so the pencil stays down.', 'Lift once, at the end of the word.'] }; }
    return readTyped(R, lv, ['milk', 'tree', 'fish', 'jump', 'kite', 'nest', 'apple', 'happy', 'lunch']);
  });

  var JOIN_CAPS = ['A', 'C', 'E', 'H', 'K', 'M', 'N', 'U'], ALONE_CAPS = ['B', 'D', 'O', 'P', 'S', 'V', 'W'];
  G('hand.joining-capitals', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, 'pic', R.pick(['pic', 'usual']), R.pick(['usual', 'alone', 'pic']));
    if (shape === 'pic') return joinQ(R, lv, JOIN_CAPS.concat(ALONE_CAPS));
    var want = shape === 'usual' ? JOIN_CAPS : ALONE_CAPS, other = shape === 'usual' ? ALONE_CAPS : JOIN_CAPS, r = R.pick(want), wr = R.sample(other, 2);
    return { q: q([para(big(shape === 'usual' ? 'Which cursive capital usually joins the next letter?' : 'Which cursive capital usually stands alone, with the next letter starting close by?'))]), a: mc(r, wr),
      hint: shape === 'usual' ? 'Capitals that end on the baseline join.' : 'Capitals that end high or curl back stand alone.',
      steps: [q1(r) + (shape === 'usual' ? ' ends on the baseline with an exit stroke, so it usually joins.' : ' ends high or curls back, so it usually stands alone.'), 'Books differ about a few capitals; these are the usual ones.'] };
  });

  var PHRASES = ['my dog', 'big hat', 'red kite', 'we can go', 'fish swim', 'I like jam', 'run and jump', 'cold milk', 'a happy cat', 'hot soup', 'blue sky', 'see me jump', 'ducks can swim', 'pick a plum', 'cats nap', 'look up', 'my red cap', 'fly a kite', 'grapes are sweet', 'sing a song'];
  G('hand.word-spaces-cursive', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, 'pair', R.pick(['count', 'pair']), R.pick(['count', 'which']));
    var p = R.pick(PHRASES), ws = p.split(' ');
    if (shape === 'pair') { var vs = R.shuffle([{ text: p }, { text: ws.join('') }]), v = vs[0].text === p ? 0 : 1;
      return { q: q([readme(lv), para(big('Which picture shows ' + p + ' with the words spaced apart?'))]), a: mcKeep(['A', 'B'], v), viz: { name: 'wr-join', opts: { variants: vs, quiet: true, interactive: false } },
        hint: 'Words don’t join to each other.', steps: ['In ' + Lt(v) + ', each word ends, the pencil lifts, and the next word starts a little way over.', 'In ' + Lt(1 - v) + ', the words are joined into one long word.'] }; }
    if (shape === 'count') { var n = ws.length;
      return { q: q([readme(lv), para(big('How many words are in this cursive line?'))]), a: mcKeep(['1', '2', '3', '4'], n - 1), viz: { name: 'wr-join', opts: { text: p, quiet: true, interactive: false } },
        hint: 'Count the spaces, then add one.', steps: ['The spaces split the line into ' + n + ' words: ' + ws.join(', ') + '.'] }; }
    var k = R.int(0, ws.length - 2), text = ws.slice(0, k).concat([ws[k] + ws[k + 1]], ws.slice(k + 2)).join(' ');
    if (ws.length < 3) { ws = ['we', 'can', 'go']; k = R.int(0, 1); text = ws.slice(0, k).concat([ws[k] + ws[k + 1]], ws.slice(k + 2)).join(' '); }
    var pairs = []; for (var i = 0; i < ws.length - 1; i++) pairs.push(ws[i] + ' and ' + ws[i + 1]);
    return { q: q([para('This should say <b>' + ws.join(' ') + '</b>.'), para(big('Which two words are joined together by mistake?'))]), a: mc(pairs[k], pairs.filter(function (x, i) { return i !== k; }).concat(['none of them']).slice(0, 2)),
      viz: { name: 'wr-join', opts: { text: text, quiet: true, interactive: false } }, hint: 'Look for a word that seems too long.', steps: [q1(ws[k]) + ' and ' + q1(ws[k + 1]) + ' are joined; lift the pencil after ' + q1(ws[k]) + ' and leave a space.'] };
  });

  /* ---------------------------------------------------------------- cursive sentences, checking, signature */
  var CSENT = [['Cats like milk', ['Cats like silk', 'Cats lick milk']], ['We can swim', ['We can skim', 'We ran swim']], ['Ann has a hat', ['Ann has a hut', 'Ann had a hat']], ['Kim fed the hen', ['Kim fed the men', 'Kim led the hen']], ['Max ran home', ['Max ran some', 'Max won home']], ['Eva likes rain', ['Eva likes ruin', 'Eva bikes rain']]];
  G('hand.cursive-sentences', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['start', 'read']), R.pick(['read', 'parts']), R.pick(['parts', 'read']));
    var s = R.pick(CSENT);
    if (shape === 'start') return { q: q([readme(lv), para(big('A cursive sentence starts with …'))]), a: mc('a cursive capital letter', lv === 1 ? ['a dot'] : ['a dot', 'a print capital letter']), hint: 'Every sentence starts the same way.',
      steps: ['A sentence starts with a capital letter.', 'In cursive, use a cursive capital.'] };
    if (shape === 'read') return { q: q([readme(lv), para(big('What does this cursive sentence say?'))]), a: mc(s[0] + '.', s[1].map(function (x) { return x + '.'; })),
      viz: { name: 'wr-join', opts: { text: s[0] + '.', quiet: true, interactive: false } }, hint: 'Read it word by word, letter by letter.', steps: ['Word by word: ' + s[0].split(' ').join(', ') + '.', 'The sentence is ' + q1(s[0] + '.')] };
    var vars = [{ text: s[0] + '.' }, { text: s[0].charAt(0).toLowerCase() + s[0].slice(1) + '.' }, { text: s[0] }], order = R.shuffle([0, 1, 2]), shown = order.map(function (i) { return vars[i]; }), v = order.indexOf(0);
    return { q: q([para(big('Which picture shows the sentence written correctly, with a capital and an end mark?'))]), a: mcKeep(shown.map(function (x, i) { return Lt(i); }), v), viz: { name: 'wr-join', opts: { variants: shown, quiet: true, interactive: false } },
      hint: 'Check the start and the end.', steps: [Lt(v) + ' starts with a cursive capital and ends with a period.', Lt(order.indexOf(1)) + ' starts with a small letter; ' + Lt(order.indexOf(2)) + ' has no end mark.'] };
  });

  G('hand.check-letters', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['spot', 'looks']), R.pick(['spot', 'slant', 'looks']), R.pick(['spot', 'slant']));
    if (shape === 'spot') return spotP(R, lv, ['garden', 'little', 'kettle', 'happy', 'helmet', 'button', 'muffin'], ['float', 'short', 'big'], 'cursive');
    if (shape === 'slant') { var sw = R.pick(SLANT_WORDS), k = R.pick(sw[1]), others = R.sample(sw[1].filter(function (i) { return i !== k; }), Math.min(2, sw[1].length - 1)), ch = [k].concat(others).sort();
      return { q: q([para('This should say <b>' + sw[0] + '</b>.'), para(big('Which letter doesn’t lean like the others?'))]), a: mcKeep(ch.map(function (i) { return 'letter ' + (i + 1); }), ch.indexOf(k)),
        viz: { name: 'hand-slant', opts: { text: sw[0], odd: k, kind: lv === 3 ? R.pick(['upright', 'back']) : 'upright', numbers: true, quiet: true, interactive: false } }, hint: 'Compare the tall letters.',
        steps: ['Letter ' + (k + 1) + ', ' + q1(sw[0][k]) + ', doesn’t lean like the others.', 'Even slant: every letter leans the same amount.'] }; }
    var L5 = R.pick([['a', 'with an open top', 'u'], ['o', 'with an open top', 'u'], ['d', 'with an open top', 'cl'], ['n', 'with pointed hills', 'u'], ['m', 'with pointed hills', 'w'], ['l', 'too short', 'e'], ['e', 'with its loop closed', 'i']]);
    var wr = ['a', 'u', 'w', 'e', 'i', 'cl', 'o'].filter(function (x) { return x !== L5[2] && x !== L5[0]; });
    return { q: q([para(big('A cursive ' + L5[0] + ' ' + L5[1] + ' can look like which letter?'))]), a: mc(L5[2], R.sample(wr, 2)), hint: 'Picture the letter with that mistake.',
      steps: ['A cursive ' + L5[0] + ' ' + L5[1] + ' looks like ' + q1(L5[2]) + '.', 'That is why checking shapes matters.'] };
  });

  var SIG_NAMES = [['Ruby Lane', 'Ruby Lake', 'Rudy Lane'], ['Omar Hill', 'Omar Hall', 'Oscar Hill'], ['Mia Cole', 'Mia Cale', 'Mike Cole'], ['Ben Fox', 'Ben Fix', 'Ken Fox'], ['Hana Lee', 'Hana Leo', 'Hans Lee'], ['Leo Park', 'Leo Pork', 'Lea Park'], ['Ava Stone', 'Ava Store', 'Ana Stone'], ['Sam Wood', 'Sam Word', 'Tom Wood'], ['Kim Rivers', 'Kim Rover', 'Kit Rivers'], ['Zoe Marsh', 'Zoe March', 'Joe Marsh'], ['Eli Brook', 'Eli Book', 'Ella Brook'], ['Nora Bell', 'Nora Ball', 'Norm Bell'], ['Jake Green', 'Jake Grain', 'Jane Green']];
  G('hand.signature', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['read', 'what']), R.pick(['read', 'good']), R.pick(['typed', 'good', 'read']));
    if (shape === 'read' || shape === 'typed') { var s = R.pick(SIG_NAMES);
      return { q: q([readme(lv), para(big(shape === 'typed' ? 'Whose signature is this? Type the name.' : 'Whose signature is this?'))]), a: shape === 'typed' ? { t: 'text', v: [s[0]], strict: true } : mc(s[0], s.slice(1)),
        viz: { name: 'wr-join', opts: { text: s[0], quiet: true, interactive: false } }, hint: 'Read each name letter by letter.', steps: ['First name: ' + s[0].split(' ')[0].split('').join(', ') + '.', 'Last name: ' + s[0].split(' ')[1].split('').join(', ') + '.', 'The signature says ' + q1(s[0]) + '.'] }; }
    if (shape === 'what') return { q: q([readme(lv), para(big('What is a signature?'))]), a: mc('Your name, written in your own handwriting', lv === 1 ? ['A picture of you'] : ['A picture of you', 'Your name typed on a computer']),
      hint: 'You make it with a pencil or pen.', steps: ['A signature is your own name in your own handwriting, often in cursive.'] };
    return { q: q([para(big('What makes a good signature?'))]), a: mc('It is readable and written the same way each time', ['It is as fancy as possible', 'It changes every time you sign']),
      hint: 'A signature should show who signed.', steps: ['A good signature is clear enough to read.', 'Writing it the same way every time makes it yours.'] };
  });

  /* ---------------------------------------------------------------- reading cursive */
  G('hand.read-cursive-letters', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, 'easy', 'hard', R.pick(['hard', 'caps']));
    if (shape === 'easy') return whichCur(R, lv, ['a', 'o', 'd', 'l', 'h', 'm', 'n', 't', 'u']);
    if (shape === 'hard') return whichCur(R, lv, ['r', 's', 'z', 'f', 'q', 'x', 'k', 'b']);
    return whichCur(R, lv, ['G', 'I', 'J', 'Q', 'S', 'L', 'D', 'F', 'T', 'Z']);
  });

  var READ_PAIRS = [['brown', 'brain', 'drown'], ['clear', 'dear', 'clean'], ['rain', 'ruin', 'nain'], ['sleep', 'sheep', 'steep'], ['bowl', 'bawl', 'howl'], ['wave', 'were', 'move'], ['gift', 'gilt', 'lift'], ['mouse', 'moose', 'house'], ['honey', 'money', 'hone'], ['river', 'liver', 'rover']];
  G('hand.read-cursive-words', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, 'read', R.pick(['read', 'typed']), 'typed');
    if (shape === 'read') return readP(R, lv, READ_PAIRS, false);
    return readTyped(R, lv, ['brown', 'clear', 'rain', 'sleep', 'bowl', 'wave', 'gift', 'mouse', 'honey', 'river', 'pencil', 'garden', 'window', 'quick', 'zebra']);
  });

  // the long s: at the start or in the middle of a word, short s at the end (National Archives, "The Long S")
  function longS(w) { return w.split('').map(function (c, i) { return c === 's' && i < w.length - 1 && w[i - 1] !== 'f' ? 'ſ' : c; }).join(''); }
  var OLD_WORDS = ['sun', 'sister', 'first', 'Congress', 'possess', 'seven', 'house', 'sense', 'mistake', 'lost', 'question', 'master', 'blessing', 'season', 'present'];
  G('hand.read-old-handwriting', function (R, ctx) {
    var lv = ctx.level, shape = ML.byLevel(ctx, R.pick(['read', 'what']), R.pick(['read', 'where', 'caps']), R.pick(['typed', 'where', 'which']));
    var w = R.pick(OLD_WORDS), old = longS(w);
    if (shape === 'read' || shape === 'typed') { var asF = old.replace(/ſ/g, 'f');
      return { q: q([readme(lv), para('In old writing, this word was spelled: ' + big(old)), para(big(shape === 'typed' ? 'Type the word in today’s spelling.' : 'How do we read it today?'))]),
        a: shape === 'typed' ? { t: 'text', v: [w], strict: true } : mc(w, [asF, old.replace(/ſ/g, 'l')]),
        hint: 'A tall s without a full crossbar is a long s.', steps: ['Each ſ is a long s: read it as s.', 'So ' + old + ' is ' + q1(w) + '.'] }; }
    if (shape === 'what') return { q: q([para('Old writing used a tall letter: ' + big('ſ')), para(big('What letter is it?'))]), a: mc('a long s', ['an f', 'a t']),
      hint: 'Look for a crossbar.', steps: ['ſ is the long s. It looks much like f, but it has no crossbar (or only a nub on the left).', 'Read it as s.'] };
    if (shape === 'where') { var pos = R.pick(['end', 'start', 'middle']);
      return { q: q([para(big('In old writing, which s was used at the ' + pos + ' of a word?'))]), a: mcKeep(['the long s (ſ)', 'the short s (s)'], pos === 'end' ? 1 : 0),
        hint: 'Think of Congreſs.', steps: ['The long s was used at the start and in the middle of a word.', 'The short s was used at the end: Congreſs.'] }; }
    if (shape === 'caps') return { q: q([para('The title line of the Declaration of Independence reads: <b>The unanimous Declaration of the thirteen united States of America</b>.'), para(big('Which word would we capitalize today that has no capital there?'))]),
      a: mc('united', ['Declaration', 'America']), hint: 'Look for a small letter where we would write a capital.', steps: ['In the name United States, we capitalize both words today.', 'The title line has a small u in united.'] };
    var k = old.indexOf('ſ'), ch = []; for (var i = 0; i < old.length; i++) if (/[a-zſ]/i.test(old[i])) ch.push(i);
    var picks = [k].concat(R.sample(ch.filter(function (i) { return i !== k && old[i] !== 'ſ'; }), 2)).sort(function (a, b) { return a - b; });
    return { q: q([para('Old spelling: ' + big(old)), para(big('Which letter is a long s?'))]), a: mcKeep(picks.map(function (i) { return 'letter ' + (i + 1) + ' (' + old[i] + ')'; }), picks.indexOf(k)),
      hint: 'It looks like f without a full crossbar.', steps: ['Letter ' + (k + 1) + ' is ſ, a long s.', 'The word is ' + q1(w) + '.'] };
  });
})(window.MathLadder);
