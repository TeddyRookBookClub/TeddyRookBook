/* Math Ladder: problem generators for Pre-K (static/math/gen/pk.js).
   One generator per topic in data/math/topics/pk.json. Every problem is a picture with a short question that a grown-up
   reads aloud, and every answer is a tap: a number, a picture or a word choice (no typing). Pictures use the course visual
   "pk-pic" (static/math/viz/pk.js): many kinds of things, layouts and drawings, so practice rarely repeats itself.
   Each problem also carries p.ask, a short description of what the question asks; the independent check
   (scripts/math/verify-pk.js) works every answer out again from p.ask and the picture alone.                        */
(function (ML) {
  'use strict';
  var G = ML.gen, PIC = 'pk-pic', M = Math;
  function pic(o) { return { name: PIC, opts: o }; }
  var LET = ['A', 'B', 'C', 'D', 'E'];
  // a number choice: the right number and two or three near it, smallest first (easy to scan for young children)
  function mcN(n, lo, hi, k) {
    var c = [n], d = 1;
    k = k || 3;
    while (c.length < k && d < 12) { [n + d, n - d].forEach(function (x) { if (c.length < k && x >= lo && x <= hi && c.indexOf(x) < 0) c.push(x); }); d++; }
    c.sort(function (a, b) { return a - b; });
    return { t: 'mc', choices: c.map(String), v: c.indexOf(n), keep: true };
  }
  function mcPick(k, i) { return { t: 'mc', choices: LET.slice(0, k), v: i, keep: true }; }
  function mcText(right, wrongs) { var out = [right]; wrongs.forEach(function (x) { if (out.indexOf(x) < 0) out.push(x); }); return { t: 'mc', choices: out, v: 0 }; }
  function mcKeep(list, i) { return { t: 'mc', choices: list.slice(), v: i, keep: true }; }

  // things to count: key (a picture in pk-pic), one, many
  var THINGS = [
    ['apple', 'apple', 'apples'], ['pear', 'pear', 'pears'], ['orange', 'orange', 'oranges'], ['banana', 'banana', 'bananas'],
    ['strawberry', 'strawberry', 'strawberries'], ['carrot', 'carrot', 'carrots'], ['lemon', 'lemon', 'lemons'], ['cookie', 'cookie', 'cookies'],
    ['cupcake', 'cupcake', 'cupcakes'], ['egg', 'egg', 'eggs'], ['mushroom', 'mushroom', 'mushrooms'], ['acorn', 'acorn', 'acorns'],
    ['leaf', 'leaf', 'leaves'], ['flower', 'flower', 'flowers'], ['tulip', 'tulip', 'tulips'], ['star', 'star', 'stars'], ['heart', 'heart', 'hearts'],
    ['ball', 'ball', 'balls'], ['balloon', 'balloon', 'balloons'], ['kite', 'kite', 'kites'], ['car', 'car', 'cars'], ['bus', 'bus', 'buses'],
    ['boat', 'boat', 'boats'], ['rocket', 'rocket', 'rockets'], ['truck', 'truck', 'trucks'], ['fish', 'fish', 'fish'], ['duck', 'duck', 'ducks'],
    ['chick', 'chick', 'chicks'], ['frog', 'frog', 'frogs'], ['turtle', 'turtle', 'turtles'], ['snail', 'snail', 'snails'], ['bee', 'bee', 'bees'],
    ['ladybug', 'ladybug', 'ladybugs'], ['butterfly', 'butterfly', 'butterflies'], ['cat', 'cat', 'cats'], ['dog', 'dog', 'dogs'],
    ['bunny', 'bunny', 'bunnies'], ['bear', 'teddy bear', 'teddy bears'], ['owl', 'owl', 'owls'], ['penguin', 'penguin', 'penguins'],
    ['shoe', 'shoe', 'shoes'], ['cap', 'cap', 'caps'], ['shell', 'shell', 'shells'], ['crayon', 'crayon', 'crayons'],
    ['book', 'book', 'books'], ['bell', 'bell', 'bells'], ['drum', 'drum', 'drums'], ['present', 'present', 'presents'], ['umbrella', 'umbrella', 'umbrellas'],
    ['key', 'key', 'keys'], ['spoon', 'spoon', 'spoons'], ['pig', 'pig', 'pigs'], ['fox', 'fox', 'foxes'], ['monkey', 'monkey', 'monkeys'],
    ['panda', 'panda', 'pandas'], ['koala', 'koala', 'koalas'], ['snowflake', 'snowflake', 'snowflakes'], ['tree', 'tree', 'trees']
  ];
  var ANIMALS = ['fish', 'duck', 'chick', 'frog', 'turtle', 'snail', 'bee', 'ladybug', 'butterfly', 'cat', 'dog', 'bunny', 'owl', 'penguin', 'pig', 'fox', 'monkey', 'panda', 'koala', 'lion'];
  var NAMEOF = {}; THINGS.forEach(function (t) { NAMEOF[t[0]] = { obj: t[0], one: t[1], many: t[2] }; });
  NAMEOF.lion = { obj: 'lion', one: 'lion', many: 'lions' };
  var EMO = { apple: '🍎', pear: '🍐', orange: '🍊', banana: '🍌', strawberry: '🍓', carrot: '🥕', lemon: '🍋', watermelon: '🍉', cookie: '🍪', cupcake: '🧁',
    egg: '🥚', mushroom: '🍄', acorn: '🌰', leaf: '🍁', flower: '🌼', tulip: '🌷', star: '⭐', heart: '❤️', ball: '⚽', balloon: '🎈', kite: '🪁', car: '🚗',
    bus: '🚌', boat: '⛵', rocket: '🚀', truck: '🚚', bike: '🚲', tractor: '🚜', fish: '🐟', duck: '🦆', chick: '🐤', frog: '🐸', turtle: '🐢', snail: '🐌',
    bee: '🐝', ladybug: '🐞', butterfly: '🦋', cat: '🐱', dog: '🐶', bunny: '🐰', bear: '🧸', owl: '🦉', penguin: '🐧', sock: '🧦', shoe: '👟', cap: '🧢',
    shell: '🐚', crayon: '🖍️', book: '📘', bell: '🔔', drum: '🥁', present: '🎁', umbrella: '☂️', key: '🔑', spoon: '🥄', elephant: '🐘', mouse: '🐁',
    cow: '🐄', hen: '🐔', horse: '🐎', rabbit: '🐇', whale: '🐋', pumpkin: '🎃', pig: '🐷', fox: '🦊', lion: '🦁', monkey: '🐵', panda: '🐼', koala: '🐨',
    snowflake: '❄️', tree: '🌳', sprout: '🌱', seed: '🌰', chickhatch: '🐣', snowman: '⛄', ice: '🧊', drop: '💧', house: '🏠', brick: '🧱', bread: '🍞',
    sandwich: '🥪', bowl: '🥣', tshirt: '👕', bath: '🛁', bed: '🛏️', moon: '🌙', sun: '☀️', sunrise: '🌅', alarm: '⏰', tooth: '🦷', caterpillar: '🐛',
    cake: '🎂', letter: '✉️', mailbox: '📬', backpack: '🎒', dinner: '🍝', bird: '🐦', clock: '🕒', pizza: '🍕', tent: '⛺', door: '🚪', phone: '📱', donut: '🍩',
    target: '🎯', ruler: '📐', envelope: '✉️', sunflower: '🌻' };
  function th(k) { return NAMEOF[k] || { obj: k, one: k, many: k + 's' }; }
  function pickThing(R, not) { var l = THINGS.filter(function (t) { return (not || []).indexOf(t[0]) < 0; }); return th(R.pick(l)[0]); }
  function pickAnimal(R, not) { return th(R.pick(ANIMALS.filter(function (a) { return (not || []).indexOf(a) < 0; }))); }
  function w(n, t) { return n + ' ' + (n === 1 ? t.one : t.many); }
  var NAMES = ['Ana', 'Ben', 'Mia', 'Leo', 'Sam', 'Zoe', 'Max', 'Lily', 'Omar', 'Ruby', 'Kai', 'Nora', 'Eli', 'Ava', 'Jack', 'Maya', 'Theo', 'Iris', 'Noah', 'Ella', 'Luis', 'Priya', 'Tom', 'June', 'Ravi', 'Rosa', 'Finn', 'Hana', 'Teddy'];
  function nm(R) { return R.pick(NAMES); }
  function an(x) { return (/^[aeiou]/.test(x) ? 'an ' : 'a ') + x; }
  function asks(R) { return R.pick(['', '', nm(R) + ' asks: ', 'Help ' + nm(R) + '. ', 'Let’s look with ' + nm(R) + '. ']); }
  function seq(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function list(a) { return a.join(', '); }
  function lay(R, n, lv) { return lv === 1 ? (n <= 5 ? R.pick(['row', 'line']) : 'grid') : lv === 2 ? R.pick(n <= 5 ? ['row', 'line', 'circle', 'dice'] : ['grid', 'circle', 'grid']) : R.pick(['scatter', 'circle', 'scatter']); }
  function okDice(l, n) { return l === 'dice' && n > 6 ? 'row' : l; }
  var COLS = ['red', 'blue', 'yellow', 'green', 'orange', 'purple'];
  var SHAPES = ['circle', 'square', 'triangle', 'rectangle'];
  var CIRC = { red: '🔴', blue: '🔵', yellow: '🟡', green: '🟢', orange: '🟠', purple: '🟣' }, SQ = { red: '🟥', blue: '🟦', yellow: '🟨', green: '🟩', orange: '🟧', purple: '🟪' };

  /* ================================================================ Counting */
  function pathQ(R, from, to, h, kind) {
    var who = nm(R), shown = seq(from, to).filter(function (x) { return x !== h; });
    var lead = R.pick([who + ' is counting ' + R.pick(['steps', 'stairs', 'jumps', 'claps', 'blocks', 'spoons', 'buttons', 'snacks']) + '.', who + ' covered a number with a leaf.', 'A number is hiding on ' + who + '’s path.', 'Let’s count with ' + who + '.']);
    return { q: lead + ' Which number is hiding under the <b>?</b>', viz: pic({ kind: 'path', from: from, to: to, hide: [h] }), a: mcN(h, M.max(0, from - 1), to + 2),
      steps: ['Count along the path: ' + list(seq(from, h - 1).length ? seq(from, h - 1) : [from]) + ' …', h === from ? 'The path starts with ' + h + '.' : 'After ' + (h - 1) + ' comes ' + h + '.', 'The hiding number is ' + h + '.'],
      hint: 'Point to each square and say the numbers out loud.', ask: { t: 'path' } };
  }
  G('pk.count-to-5', function (R, ctx) {
    var lv = ctx.level, kind = ML.byLevel(ctx, 'end', R.pick(['end', 'mid']), R.pick(['mid', 'start', 'next']));
    if (kind === 'next') {
      var a = R.int(1, 3), who = nm(R);
      return { q: who + ' says: “' + list(seq(a, a + 1)) + ' …” What number comes next?', viz: pic({ kind: 'path', from: a, to: a + 2, hide: [a + 2] }), a: mcN(a + 2, 1, 6),
        steps: ['Say it with ' + who + ': ' + list(seq(a, a + 1)) + '.', 'Next comes ' + (a + 2) + '.'], hint: 'Count from ' + a + ' out loud.', ask: { t: 'path' } };
    }
    var h = kind === 'end' ? R.int(3, 5) : kind === 'start' ? 1 : R.int(2, 4), to = kind === 'end' ? h : 5;
    if (lv >= 2 && kind !== 'end') to = R.pick([4, 5]);
    if (h > to) h = to;
    return pathQ(R, 1, to, h);
  });

  G('pk.touch-and-count', function (R, ctx) {
    var t = pickThing(R), lv = ctx.level, n = ML.byLevel(ctx, R.int(1, 3), R.int(2, 5), R.int(3, 5)), l = okDice(lay(R, n, lv), n), who = nm(R);
    var q = R.pick(['Touch each ' + t.one + ' and say one number. How many ' + t.many + '?', 'Help ' + who + ' count the ' + t.many + '. Touch each one once. How many?', who + ' found some ' + t.many + '. Count them with one touch each. How many are there?']);
    return { q: q, viz: pic({ n: n, obj: t.obj, layout: l, seed: R.int(1, 999) }), a: mcN(n, 1, 6),
      steps: ['Touch one ' + t.one + ' and say 1.', n > 1 ? 'Touch the next one and say the next number: ' + list(seq(1, n)) + '.' : 'There is only one.', 'There ' + (n === 1 ? 'is ' : 'are ') + w(n, t) + '.'],
      hint: 'Tap each one in the picture. A tapped one shows its number.', ask: { t: 'count' } };
  });

  G('pk.how-many', function (R, ctx) {
    var t = pickThing(R), who = nm(R), lv = ctx.level, n = ML.byLevel(ctx, R.int(2, 4), R.int(3, 5), R.int(3, 6)), l = okDice(lay(R, n, lv), n);
    if (lv === 3 && R.coin()) {
      return { q: who + ' counted the ' + t.many + ' and got ' + n + '. Then ' + who + ' counted again, starting with a different one. How many ' + t.many + ' now?', viz: pic({ n: n, obj: t.obj, layout: 'circle', tap: false }), a: mcN(n, 1, 8),
        steps: ['No ' + t.one + ' came and none went away.', 'Counting in a new order gives the same number.', 'There are still ' + n + '.'], hint: 'Did any ' + t.many + ' come or go?', ask: { t: 'count' } };
    }
    return { q: R.pick([who + ' counts: ' + list(seq(1, n)) + '. How many ' + t.many + ' are there?', 'Count the ' + t.many + '. The last number you say tells how many. How many ' + t.many + '?', 'How many ' + t.many + ' did ' + who + ' find? Count, then say the last number again.']),
      viz: pic({ n: n, obj: t.obj, layout: l, seed: R.int(1, 999) }), a: mcN(n, 1, 8),
      steps: ['Count: ' + list(seq(1, n)) + '.', 'The last number is ' + n + '.', 'So there are ' + w(n, t) + '.'], hint: 'Say the last number you counted.', ask: { t: 'count' } };
  });

  G('pk.count-to-10', function (R, ctx) {
    var lv = ctx.level;
    if (lv === 1) { var h = R.int(5, 10); return pathQ(R, 1, h === 10 ? 10 : R.int(h, 10), h); }
    if (lv === 2) { var a = R.int(1, 7), h2 = a + R.int(1, 2); return pathQ(R, a, a + 3, h2); }
    var s = R.int(2, 6), h3 = s + R.int(1, 4);
    return pathQ(R, s, s + 4, h3);
  });

  G('pk.count-things-10', function (R, ctx) {
    var lv = ctx.level, t = pickThing(R), n = ML.byLevel(ctx, R.int(5, 7), R.int(6, 9), R.int(6, 10)), who = nm(R);
    if (lv === 3 && R.coin()) {
      var u = pickThing(R, [t.obj]), m = R.int(2, 4);
      n = R.int(4, 7);
      return { q: who + '’s picture has ' + t.many + ' and ' + u.many + '. How many <b>' + t.many + '</b>? Count only the ' + t.many + '.', viz: pic({ mix: [{ obj: t.obj, n: n }, { obj: u.obj, n: m }], layout: 'scatter', seed: R.int(1, 999) }), a: mcN(n, 1, 12),
        steps: ['Look for the ' + t.many + ' only.', 'Count them: ' + list(seq(1, n)) + '.', 'There are ' + w(n, t) + '.'], hint: 'Tap only the ' + t.many + '.', ask: { t: 'count', obj: t.obj } };
    }
    return { q: R.pick(['How many ' + t.many + '? Tap each one as you count.', who + ' lined up some ' + t.many + '. How many are there?', 'Count the ' + t.many + ' with ' + who + '. How many?']),
      viz: pic({ n: n, obj: t.obj, layout: lay(R, n, lv), cols: 5, seed: R.int(1, 999) }), a: mcN(n, 1, 12),
      steps: ['Count each ' + t.one + ' once: ' + list(seq(1, n)) + '.', 'The last number is ' + n + '.', 'There are ' + w(n, t) + '.'], hint: 'Tap each one. Count the top row, then keep going.', ask: { t: 'count' } };
  });

  function whichGroup(R, t, target, others, plate) {
    var cnts = R.shuffle([target].concat(others)), idx = cnts.indexOf(target);
    return { viz: pic({ kind: 'groups', pick: true, groups: cnts.map(function (c) { return { n: c, obj: t.obj, layout: c > 5 ? 'grid' : c > 3 ? R.pick(['row', 'dice']) : 'row', cols: 5, plate: plate }; }) }),
      a: mcPick(cnts.length, idx), steps: cnts.map(function (c, i) { return 'Picture ' + LET[i] + ' has ' + w(c, t) + '.'; }).concat(['Picture ' + LET[idx] + ' has ' + target + '.']) };
  }
  function nearOthers(R, target, lo, hi, k, gap) {
    var pool = seq(lo, hi).filter(function (x) { return x !== target && M.abs(x - target) <= (gap || 3); });
    if (pool.length < k) pool = seq(lo, hi).filter(function (x) { return x !== target; });
    return R.sample(pool, k);
  }
  G('pk.make-a-group', function (R, ctx) {
    var lv = ctx.level, t = pickThing(R), target = ML.byLevel(ctx, R.int(1, 5), R.int(3, 8), R.int(4, 10)), who = nm(R);
    var g = whichGroup(R, t, target, nearOthers(R, target, 1, ML.byLevel(ctx, 6, 9, 10), lv === 1 ? 1 : 2, ML.byLevel(ctx, 4, 3, 1)));
    g.q = R.pick([who + ' needs <b>' + target + '</b> ' + t.many + '. Which picture has ' + target + '? Tap it.', 'Which picture shows <b>' + target + '</b> ' + t.many + ' for ' + who + '?', 'Find the group of <b>' + target + '</b> ' + t.many + '.']);
    g.hint = 'Count each picture. Stop when you find ' + target + '.'; g.ask = { t: 'which-n', n: target };
    return g;
  });

  G('pk.count-to-20', function (R, ctx) {
    var lv = ctx.level;
    if (lv === 3 || (lv === 2 && R.coin())) {
      var t = pickThing(R), n = R.int(11, lv === 3 ? 20 : 15);
      return { q: 'How many ' + t.many + '? The top frame is full: that is 10. Count on from 10.', viz: pic({ kind: 'groups', stack: true, groups: [{ n: 10, obj: t.obj, layout: 'frame10' }, { n: n - 10, obj: t.obj, layout: 'frame10' }] }), a: mcN(n, 10, 21),
        steps: ['A full ten frame is 10.', 'Count on: ' + list(seq(11, n)) + '.', 'There are ' + w(n, t) + '.'], hint: 'Start at 10 and count the second frame: 11, 12 …', ask: { t: 'count' } };
    }
    var a = ML.byLevel(ctx, R.int(10, 15), R.int(11, 16)), h = a + R.int(1, 3);
    return pathQ(R, a, a + 4, h);
  });

  /* ================================================================ Seeing at a glance */
  G('pk.glance-1-3', function (R, ctx) {
    var lv = ctx.level, n = ML.byLevel(ctx, R.int(1, 3), R.int(1, 3), R.int(2, 4)), t = R.coin() ? th('dot') : pickThing(R), c = R.pick(COLS.slice(0, 4));
    var l = ML.byLevel(ctx, 'dice', R.pick(['row', 'line', 'dice']), R.pick(['scatter', 'row', 'dice']));
    var what = t.obj === 'dot' ? c + ' dots' : t.many, who = nm(R);
    return { q: R.pick(['Quick look! How many ' + what + '? Try to see it without counting.', who + ' shows a card. How many ' + what + ' do you see?', 'How many ' + what + '? Just look.']),
      viz: pic({ n: n, obj: t.obj, color: c, layout: l, tap: false, seed: R.int(1, 999) }), a: mcN(n, 1, 5),
      steps: [n === 1 ? 'One alone.' : n === 2 ? 'A pair is two.' : n === 3 ? 'Three, like a little line or a triangle.' : 'Two and two make four.', 'There ' + (n === 1 ? 'is 1.' : 'are ' + n + '.')], hint: 'Small groups are easy to see at once. Look for pairs.', ask: { t: 'count' } };
  });

  G('pk.dot-patterns', function (R, ctx) {
    var lv = ctx.level, frame = lv >= 2 && R.chance(lv === 3 ? 0.5 : 0.35), n = frame ? R.int(lv === 3 ? 0 : 1, 5) : ML.byLevel(ctx, R.int(1, 4), R.int(1, 5), R.int(3, 6));
    var c = R.pick(COLS), who = nm(R), obj = R.chance(0.7) ? 'dot' : pickThing(R).obj;
    var o = frame ? { n: n, obj: obj, color: c, layout: 'frame5', tap: false } : { n: n, obj: obj, color: c, layout: 'dice', tap: false };
    var how = { 0: 'The frame is empty: 0.', 1: 'One in the middle.', 2: 'One in each corner: 2.', 3: 'Three in a line, corner to corner.', 4: 'One in each corner: 4.', 5: 'Four corners and one in the middle: 5.', 6: 'Two lines of three: 6.' };
    return { q: frame ? R.pick(['How many spots are filled in ' + who + '’s five frame?', 'Look at the five frame. How many are in it?']) : R.pick(['How many dots on ' + who + '’s dot card? Look for the pattern.', 'This looks like a side of a die. How many?', who + ' rolled a big die. How many?']),
      viz: pic(o), a: mcN(n, 0, 7), steps: frame ? [n === 5 ? 'Every box is full: 5.' : 5 - n + ' ' + (5 - n === 1 ? 'box is' : 'boxes are') + ' empty, so ' + n + ' are full.', 'The answer is ' + n + '.'] : [how[n], 'The answer is ' + n + '.'],
      hint: frame ? 'A full five frame is 5. How many boxes are empty?' : 'Do you know this pattern from a die or a domino?', ask: { t: 'count' } };
  });

  G('pk.finger-numbers', function (R, ctx) {
    var lv = ctx.level, who = nm(R);
    if (lv === 2 && R.coin()) {
      var b = R.int(1, 4);
      return { q: who + ' holds up these fingers. Then one more finger goes up. How many fingers now?', viz: pic({ kind: 'hand', n: b }), a: mcN(b + 1, 1, 6),
        steps: ['Now: ' + b + ' fingers.', 'One more: ' + (b + 1) + '.'], hint: 'Hold up the same fingers, then put up one more.', ask: { t: 'hand', plus: 1 } };
    }
    var n = ML.byLevel(ctx, R.int(1, 5), R.int(1, 5), R.int(5, 10));
    return { q: R.pick(['How many fingers is ' + who + ' holding up?', who + ' shows a number with fingers. What number?', 'Count the fingers that are up. How many?', who + ' is playing a finger game. How many fingers are up?']), viz: pic({ kind: 'hand', n: n }), a: mcN(n, 1, 10),
      steps: n > 5 ? ['One whole hand is 5.', 'Count on: ' + list(seq(6, n)) + '.', 'That is ' + n + ' fingers.'] : ['Count the fingers that stand up: ' + list(seq(1, n)) + '.', 'That is ' + n + '.'], hint: n > 5 ? 'A whole hand is 5. Count on from 5.' : 'Hold up your own fingers to match.', ask: { t: 'hand' } };
  });

  /* ================================================================ Numbers 0 to 10 */
  function numeralQ(R, ctx, lo, hi) {
    var lv = ctx.level, t = pickThing(R), who = nm(R);
    if (lv >= 2 && R.coin()) {
      var target = R.int(lo, hi), g = whichGroup(R, t, target, nearOthers(R, target, M.max(1, lo - 1), hi + 1, 2, lv === 3 ? 1 : 3));
      g.q = 'Which picture goes with this number? <span class="kp-big" style="font-size:2em;font-weight:800">' + target + '</span>';
      g.hint = 'Count each picture. Which one has ' + target + '?'; g.ask = { t: 'which-n', n: target }; return g;
    }
    var n = R.int(lo, hi);
    return { q: R.pick(['Which number tells how many ' + t.many + '?', 'Count ' + who + '’s ' + t.many + '. Tap the number.', 'How many ' + t.many + '? Find the number.']), viz: pic({ n: n, obj: t.obj, layout: lay(R, n, lv), cols: 5, seed: R.int(1, 999) }),
      a: mcN(n, M.max(0, lo - 1), hi + 2), steps: ['Count: ' + list(seq(1, n)) + '.', 'We write ' + n + '.'], hint: 'Count, then find the number you said last.', ask: { t: 'count' } };
  }
  G('pk.numerals-1-5', function (R, ctx) { return numeralQ(R, ctx, 1, 5); });

  G('pk.zero', function (R, ctx) {
    var lv = ctx.level, t = pickThing(R), who = nm(R);
    if (lv === 2 || (lv === 3 && R.coin())) {
      var others = R.sample([1, 2, 3, 4], lv === 2 ? 1 : 2), g = whichGroup(R, t, 0, others, true);
      g.q = R.pick(['Which plate has <b>zero</b> ' + t.many + '?', who + ' took all the ' + t.many + ' off one plate. Which plate has 0?', 'Find the plate with <b>0</b> ' + t.many + '.']);
      g.hint = 'Zero means none at all.'; g.ask = { t: 'which-n', n: 0 }; return g;
    }
    if (lv === 3) {
      var n = R.int(1, 4), left = R.coin() ? 0 : R.int(0, n - 1), go = n - left, a = th(R.pick(['bird', 'duck', 'bee', 'butterfly', 'ladybug', 'owl']));
      return { q: 'There were ' + w(n, a) + '. ' + go + ' flew away. How many are left?', viz: pic({ kind: 'groups', groups: [{ n: n, obj: a.obj, cross: go, layout: 'row' }], tap: false }), a: mcN(left, 0, 5),
        steps: ['Crossed out ones flew away.', left ? left + ' ' + (left === 1 ? 'is' : 'are') + ' left.' : 'None are left. None is 0.'], hint: 'Count the ones that are not crossed out.', ask: { t: 'count', left: true } };
    }
    var m = R.chance(0.5) ? 0 : R.int(1, 3);
    return { q: R.pick(['How many ' + t.many + ' are on the mat?', 'How many ' + t.many + ' does ' + who + ' have on the mat?', 'Look at the mat. How many ' + t.many + '?']), viz: pic({ n: m, obj: t.obj, layout: 'row', plate: true, tap: m > 0 }), a: mcN(m, 0, 4),
      steps: m ? ['Count: ' + list(seq(1, m)) + '.', 'There ' + (m === 1 ? 'is 1.' : 'are ' + m + '.')] : ['The mat is empty.', 'None at all is zero: 0.'], hint: 'Is anything on the mat?', ask: { t: 'count' } };
  });

  G('pk.numerals-6-10', function (R, ctx) {
    if (ctx.level === 2 && R.coin()) {
      var t = pickThing(R), n = R.int(6, 10);
      return { q: 'How many ' + t.many + ' are in the ten frame? Tap the number.', viz: pic({ n: n, obj: t.obj, layout: 'frame10', tap: false }), a: mcN(n, 5, 10),
        steps: ['The top row is full: 5.', 'Count on: ' + list(seq(6, n)) + '.', 'We write ' + n + '.'], hint: 'The top row is 5. Count on from 5.', ask: { t: 'count' } };
    }
    return numeralQ(R, ctx, 6, 10);
  });

  G('pk.match-number-group', function (R, ctx) {
    var t = pickThing(R), lv = ctx.level, target = ML.byLevel(ctx, R.int(1, 5), R.int(2, 8), R.int(3, 10));
    var g = whichGroup(R, t, target, nearOthers(R, target, 1, ML.byLevel(ctx, 6, 9, 10), 2, ML.byLevel(ctx, 4, 2, 1)));
    g.q = R.pick(['Match the number to a picture: <span class="kp-big" style="font-size:2em;font-weight:800">' + target + '</span>', nm(R) + ' wrote <b>' + target + '</b>. Which picture has that many ' + t.many + '?', 'Which picture has <b>' + target + '</b> ' + t.many + '?']);
    g.hint = 'Count each picture. Look for ' + target + '.'; g.ask = { t: 'which-n', n: target };
    return g;
  });

  G('pk.numbers-in-order', function (R, ctx) {
    var lv = ctx.level;
    if (lv === 3 && R.coin()) {
      var a = R.int(0, 8), b = R.intNot(0, 10, a), who = nm(R), hi = M.max(a, b);
      return { q: who + ' counts from 0 to 10. Which number does ' + who + ' say <b>later</b>: ' + a + ' or ' + b + '?', a: mcKeep([String(M.min(a, b)), String(hi)], 1),
        viz: pic({ kind: 'path', from: 0, to: 10, hide: [] }), steps: ['Count: 0, 1, 2, 3 …', M.min(a, b) + ' comes first, and ' + hi + ' comes later.', 'Later numbers are bigger.'], hint: 'Find both numbers on the path.', ask: { t: 'later', a: a, b: b } };
    }
    var from = ML.byLevel(ctx, R.pick([0, 1]), R.int(0, 5), R.int(2, 6)), to = M.min(10, from + ML.byLevel(ctx, 5, 5, 4)), h = R.int(from, to);
    return pathQ(R, from, to, h);
  });

  /* ================================================================ More, fewer, same */
  function twoGroups(R, ctx, rel) {
    var lv = ctx.level, t = pickThing(R), u = pickThing(R, [t.obj]);
    var a = ML.byLevel(ctx, R.int(1, 5), R.int(2, 8), R.int(3, 10)), gap = ML.byLevel(ctx, R.int(2, 4), R.int(1, 3), 1), b = R.coin() ? a + gap : a - gap;
    if (b < 1) b = a + gap;
    if (b > 10) b = a - gap;
    var ln = R.pick(['line', 'row']), mx = M.max(a, b), ly = mx > 5 ? 'grid' : ln;
    var g = [{ n: a, obj: t.obj, layout: ly, cols: 5 }, { n: b, obj: u.obj, layout: ly, cols: 5 }];
    var win = rel === 'more' ? (a > b ? 0 : 1) : (a < b ? 0 : 1), names = [t, u], who = nm(R);
    var q = rel === 'more' ? R.pick(['Are there more ' + t.many + ' or more ' + u.many + '?', who + ' wants the group with <b>more</b>. Which has more?', 'Which has more: the ' + t.many + ' or the ' + u.many + '?'])
      : R.pick(['Are there fewer ' + t.many + ' or fewer ' + u.many + '?', 'Which group has <b>fewer</b>: the ' + t.many + ' or the ' + u.many + '?', who + ' picks the group with fewer. Which one?']);
    return { q: q, viz: pic({ kind: 'groups', stack: true, groups: g }), a: mcKeep([EMO[t.obj] + ' ' + t.many, EMO[u.obj] + ' ' + u.many], win),
      steps: ['There are ' + w(a, t) + ' and ' + w(b, u) + '.', (a > b ? a + ' is more than ' + b : b + ' is more than ' + a) + '.', 'The ' + names[win].many + ' have ' + rel + '.'],
      hint: 'Match them up, one from each group. Which group has some left over?', ask: { t: rel } };
  }
  G('pk.which-more', function (R, ctx) { return twoGroups(R, ctx, 'more'); });
  G('pk.which-fewer', function (R, ctx) { return twoGroups(R, ctx, 'fewer'); });

  G('pk.same-number', function (R, ctx) {
    var lv = ctx.level, t = pickThing(R), u = pickThing(R, [t.obj]), a = ML.byLevel(ctx, R.int(1, 4), R.int(2, 6), R.int(3, 8)), same = R.coin();
    var b = same ? a : a + (R.coin() || a === 1 ? 1 : -1) * ML.byLevel(ctx, R.int(1, 2), 1, 1), ly = M.max(a, b) > 5 ? 'grid' : 'row';
    var g2 = { n: b, obj: u.obj, layout: lv === 3 ? R.pick([ly, 'circle']) : ly, cols: 5 };
    return { q: R.pick(['Do the ' + t.many + ' and the ' + u.many + ' have the <b>same</b> number?', 'Is there one ' + u.one + ' for every ' + t.one + ', with none left over?', nm(R) + ' asks: are there just as many ' + u.many + ' as ' + t.many + '?']),
      viz: pic({ kind: 'groups', stack: true, groups: [{ n: a, obj: t.obj, layout: ly, cols: 5 }, g2] }), a: mcKeep(['Yes, the same', 'No, not the same'], same ? 0 : 1),
      steps: ['There are ' + w(a, t) + ' and ' + w(b, u) + '.', same ? 'Both are ' + a + ': the same.' : a + ' and ' + b + ' are not the same.'], hint: 'Count each group, or match them one to one.', ask: { t: 'same' } };
  });

  G('pk.one-more', function (R, ctx) {
    var lv = ctx.level, t = pickThing(R), who = nm(R);
    if (lv === 3 && R.coin()) {
      var c = R.int(2, 9);
      return { q: who + ' has ' + c + ' ' + R.pick(['stickers', 'shells', 'blocks', 'buttons', 'crayons', 'spoons']) + ' and finds 1 more. How many now?', viz: pic({ kind: 'path', from: M.max(0, c - 2), to: M.min(10, c + 2), hide: [] }),
        a: mcN(c + 1, 0, 11), steps: ['One more is the next counting number.', 'After ' + c + ' comes ' + (c + 1) + '.'], hint: 'Find ' + c + ' on the path. What comes next?', ask: { t: 'plus1', n: c } };
    }
    var a = ML.byLevel(ctx, R.int(1, 4), R.int(2, 7), R.int(4, 9));
    return { q: R.pick(['There ' + (a === 1 ? 'is ' : 'are ') + w(a, t) + '. One more comes. How many now?', who + ' has ' + w(a, t) + ' and gets one more. How many now?']),
      viz: pic({ kind: 'groups', op: '+', groups: [{ n: a, obj: t.obj, layout: a > 5 ? 'grid' : 'row', cols: 5 }, { n: 1, obj: t.obj }] }), a: mcN(a + 1, 1, 11),
      steps: ['Start with ' + a + '.', 'One more is the next number: ' + a + ', ' + (a + 1) + '.', 'Now there are ' + w(a + 1, t) + '.'], hint: 'Count them all, or say the number after ' + a + '.', ask: { t: 'count' } };
  });

  /* ================================================================ Big, tall, long, heavy */
  function distinctSizes(R, k, lo, hi, gap) { for (var tries = 0; tries < 50; tries++) { var s = []; for (var i = 0; i < k; i++) s.push(M.round((lo + R.next() * (hi - lo)) * 10) / 10); var ok = s.every(function (x, i) { return s.every(function (y, j) { return i === j || M.abs(x - y) >= gap; }); }); if (ok) return s; } return k === 2 ? [lo, hi] : [lo, (lo + hi) / 2, hi]; }
  function pickWant(R, lv, words) { return lv === 3 && R.chance(0.35) ? 'mid' : R.pick(['max', 'min']); }
  G('pk.big-small', function (R, ctx) {
    var lv = ctx.level, t = pickThing(R), k = lv === 1 ? 2 : 3, s = distinctSizes(R, k, 0.6, 1.6, lv === 1 ? 0.5 : lv === 2 ? 0.3 : 0.22), want = pickWant(R, lv);
    var sorted = s.slice().sort(function (a, b) { return a - b; }), target = want === 'max' ? sorted[k - 1] : want === 'min' ? sorted[0] : sorted[1], idx = s.indexOf(target);
    var word = want === 'max' ? (k === 2 ? 'bigger' : 'biggest') : want === 'min' ? (k === 2 ? 'smaller' : 'smallest') : 'middle-sized';
    return { q: R.pick(['Which ' + t.one + ' is the <b>' + word + '</b>?', 'Tap the <b>' + word + '</b> ' + t.one + '.', nm(R) + ' wants the ' + word + ' ' + t.one + '. Which one?']),
      viz: pic({ kind: 'sizes', pick: true, items: s.map(function (x) { return { obj: t.obj, s: x }; }) }), a: mcPick(k, idx),
      steps: ['Look at all the ' + t.many + '.', want === 'mid' ? 'One is big, one is small, and one is in between.' : 'Compare them. One is ' + word + ' than the rest.', 'The ' + word + ' one is ' + LET[idx] + '.'], hint: 'Put your fingers on two of them and compare.', ask: { t: 'size', want: want } };
  });

  G('pk.tall-short', function (R, ctx) {
    var lv = ctx.level, obj = R.pick(['blocks', 'blocks', 'flower', 'tree']), c = R.pick(COLS);
    if (lv === 3 && R.chance(0.4)) {
      var h0 = R.int(2, 8);
      return { q: R.pick(['How many blocks tall is the tower?', nm(R) + ' built a tower. How many blocks tall is it?']), viz: pic({ kind: 'towers', items: [{ h: h0, color: c }] }), a: mcN(h0, 1, 9),
        steps: ['Count the blocks from the bottom up: ' + list(seq(1, h0)) + '.', 'The tower is ' + h0 + ' blocks tall.'], hint: 'Start at the bottom and count up.', ask: { t: 'blocks' } };
    }
    var k = lv === 1 ? 2 : 3, hs = R.sample(seq(lv === 1 ? 1 : 2, 8), k), want = pickWant(R, lv);
    if (lv === 1) while (M.abs(hs[0] - hs[1]) < 3) hs = R.sample(seq(1, 8), 2);
    var srt = hs.slice().sort(function (a, b) { return a - b; }), tg = want === 'max' ? srt[k - 1] : want === 'min' ? srt[0] : srt[1], idx = hs.indexOf(tg);
    var word = want === 'max' ? (k === 2 ? 'taller' : 'tallest') : want === 'min' ? (k === 2 ? 'shorter' : 'shortest') : 'middle one, not the tallest and not the shortest';
    var thing = obj === 'blocks' ? 'tower' : obj;
    return { q: R.pick(['Which ' + thing + ' is the <b>' + word + '</b>?', 'Tap the <b>' + word + '</b> ' + thing + '.', nm(R) + ' looks for the ' + word + ' ' + thing + '. Which one?']),
      viz: pic({ kind: 'towers', pick: true, items: hs.map(function (h) { return { h: h, color: obj === 'blocks' ? R.pick(COLS) : c, obj: obj }; }) }), a: mcPick(k, idx),
      steps: ['They all stand on the same floor.', 'Look at the tops. ' + (want === 'max' ? 'The tallest top is highest.' : want === 'min' ? 'The shortest top is lowest.' : 'One top is in between.'), 'The answer is ' + LET[idx] + '.'],
      hint: 'They start at the same floor. Compare the tops.', ask: { t: 'height', want: want } };
  });

  G('pk.long-short', function (R, ctx) {
    var lv = ctx.level, obj = R.pick(['ribbon', 'train', 'pencil', 'snake']), k = lv === 1 ? 2 : 3, ls = R.sample(seq(2, 9), k), want = pickWant(R, lv);
    if (lv === 1) while (M.abs(ls[0] - ls[1]) < 3) ls = R.sample(seq(2, 9), 2);
    var srt = ls.slice().sort(function (a, b) { return a - b; }), tg = want === 'max' ? srt[k - 1] : want === 'min' ? srt[0] : srt[1], idx = ls.indexOf(tg);
    var word = want === 'max' ? (k === 2 ? 'longer' : 'longest') : want === 'min' ? (k === 2 ? 'shorter' : 'shortest') : 'middle one, not the longest and not the shortest';
    var name = { ribbon: 'ribbon', train: 'block train', pencil: 'pencil', snake: 'snake' }[obj];
    return { q: R.pick(['Which ' + name + ' is the <b>' + word + '</b>?', 'Tap the <b>' + word + '</b> ' + name + '.', nm(R) + ' lined up some ' + name + 's at the start line. Which is the ' + word + '?']),
      viz: pic({ kind: 'lengths', pick: true, items: ls.map(function (L) { return { len: L, obj: obj, color: R.pick(COLS) }; }) }), a: mcPick(k, idx),
      steps: ['They all start at the same line.', 'Look at where each one ends.', 'The ' + (want === 'mid' ? 'middle one' : word + ' one') + ' is ' + LET[idx] + '.'], hint: 'They start together. Which one ends farthest away?', ask: { t: 'len', want: want } };
  });

  // [heavy, light] pairs nobody argues about
  var HEAVY = [['elephant', 'mouse'], ['cow', 'hen'], ['horse', 'rabbit'], ['truck', 'bike'], ['watermelon', 'strawberry'], ['pumpkin', 'leaf'], ['whale', 'fish'],
    ['tractor', 'balloon'], ['bus', 'ball'], ['elephant', 'cat'], ['horse', 'duck'], ['pumpkin', 'acorn'], ['watermelon', 'egg'], ['cow', 'bee'], ['truck', 'shoe'], ['lion', 'butterfly'],
    ['elephant', 'balloon'], ['whale', 'duck'], ['cow', 'strawberry'], ['horse', 'leaf'], ['tractor', 'cat'], ['bus', 'bee'], ['truck', 'egg'], ['watermelon', 'leaf'], ['pumpkin', 'bee'], ['lion', 'mouse']];
  var HN = { elephant: 'elephant', mouse: 'mouse', cow: 'cow', hen: 'hen', horse: 'horse', rabbit: 'rabbit', truck: 'truck', bike: 'bike', watermelon: 'watermelon', strawberry: 'strawberry',
    pumpkin: 'pumpkin', leaf: 'leaf', whale: 'whale', fish: 'fish', tractor: 'tractor', balloon: 'balloon', bus: 'bus', ball: 'ball', cat: 'cat', duck: 'duck', acorn: 'acorn', egg: 'egg', bee: 'bee', shoe: 'shoe', lion: 'lion', butterfly: 'butterfly' };
  G('pk.heavy-light', function (R, ctx) {
    var lv = ctx.level, p = R.pick(HEAVY), want = lv === 1 ? R.pick(['heavy', 'heavy', 'light']) : lv === 2 ? 'heavy' : R.pick(['heavy', 'light']);
    var heavy = p[0], light = p[1], word = want === 'heavy' ? 'heavier' : 'lighter', right = want === 'heavy' ? heavy : light, other = want === 'heavy' ? light : heavy;
    var ch = R.shuffle([heavy, light]), idx = ch.indexOf(right), lab = ch.map(function (k) { return EMO[k] + ' ' + HN[k]; });
    if (lv === 1) {
      return { q: asks(R) + 'Which is <b>' + word + '</b>: a ' + HN[ch[0]] + ' or a ' + HN[ch[1]] + '?', viz: pic({ kind: 'sizes', items: ch.map(function (k) { return { obj: k, s: 1 }; }) }), a: mcKeep(lab, idx),
        steps: ['A ' + HN[heavy] + ' is big and heavy. A ' + HN[light] + ' is light.', 'The ' + word + ' one is the ' + HN[right] + '.'], hint: 'Which one would be hard to lift?', ask: { t: 'known', want: want, items: ch } };
    }
    var left = ch[0], rightSide = ch[1], tilt = left === heavy ? 'left' : 'right';
    return { q: R.pick(['Look at the balance. Which is <b>' + word + '</b>?', nm(R) + ' put two things on a balance. Which is ' + word + '?']), viz: pic({ kind: 'balance', left: left, right: rightSide, tilt: tilt }), a: mcKeep(lab, idx),
      steps: ['The heavier side goes down. The lighter side goes up.', 'The ' + HN[heavy] + ' side is down.', 'So the ' + word + ' one is the ' + HN[right] + '.'], hint: 'The heavy side sinks down.', ask: { t: 'balance', want: want, items: ch } };
  });

  G('pk.measure-compare', function (R, ctx) {
    var lv = ctx.level, obj = R.pick(['ribbon', 'pencil', 'snake']), name = { ribbon: 'ribbon', pencil: 'pencil', snake: 'snake' }[obj];
    if (lv === 3 && R.coin()) {
      var ls = R.sample(seq(2, 8), 2), idx = ls[0] > ls[1] ? 0 : 1;
      return { q: 'Count the blocks under each ' + name + '. Which ' + name + ' is <b>longer</b>?', viz: pic({ kind: 'lengths', pick: true, units: true, items: ls.map(function (L) { return { len: L, obj: obj, color: R.pick(COLS) }; }) }), a: mcPick(2, idx),
        steps: ['A is ' + ls[0] + ' blocks long. B is ' + ls[1] + ' blocks long.', M.max(ls[0], ls[1]) + ' is more, so ' + LET[idx] + ' is longer.'], hint: 'Count the blocks under each one.', ask: { t: 'len', want: 'max' } };
    }
    var L = ML.byLevel(ctx, R.int(2, 4), R.int(3, 6), R.int(4, 8));
    return { q: R.pick(['How many blocks long is the ' + name + '?', nm(R) + ' measured a ' + name + ' with blocks. How many blocks long is it?']), viz: pic({ kind: 'lengths', units: true, line: true, items: [{ len: L, obj: obj, color: R.pick(COLS) }] }), a: mcN(L, 1, 10),
      steps: ['The blocks go from one end to the other, with no gaps.', 'Count them: ' + list(seq(1, L)) + '.', 'The ' + name + ' is ' + L + ' blocks long.'], hint: 'Count the yellow blocks.', ask: { t: 'units' } };
  });

  /* ================================================================ Sorting */
  function shapeItems(R, k) { var out = []; for (var i = 0; i < k; i++) out.push({ s: R.pick(['circle', 'square', 'triangle', 'heart', 'star']), color: R.pick(COLS) }); return out; }
  G('pk.sort-color', function (R, ctx) {
    var lv = ctx.level, who = nm(R);
    if (lv === 1 || (lv === 2 && R.coin())) {
      var k = lv === 1 ? 3 : 4, cs = R.sample(COLS, k), want = cs[R.int(0, k - 1)], its = cs.map(function (c) { return { s: R.pick(['circle', 'square', 'triangle', 'heart', 'star']), color: c }; });
      return { q: R.pick(['Which one is <b>' + want + '</b>?', 'Tap the ' + want + ' one.', who + ' is sorting colors. Which one goes in the ' + want + ' box?']), viz: pic({ kind: 'shapes', pick: true, items: its }), a: mcPick(k, cs.indexOf(want)),
        steps: ['Look at each color.', 'The ' + want + ' one is ' + LET[cs.indexOf(want)] + '.'], hint: 'Find something ' + want + ' in the room, then match it.', ask: { t: 'color', color: want } };
    }
    if (lv === 2) {
      var base = R.pick(COLS), odd = R.pick(COLS.filter(function (c) { return c !== base; })), pos = R.int(0, 3), it2 = [];
      for (var i = 0; i < 4; i++) it2.push({ s: R.pick(['circle', 'square', 'triangle', 'heart', 'star']), color: i === pos ? odd : base });
      return { q: 'Three are the same color. Which one does <b>not</b> belong?', viz: pic({ kind: 'shapes', pick: true, items: it2 }), a: mcPick(4, pos),
        steps: ['Three are ' + base + '.', LET[pos] + ' is ' + odd + ', so it does not belong.'], hint: 'Look at the colors, not the shapes.', ask: { t: 'odd-color' } };
    }
    var n = R.int(5, 7), wantC = R.pick(COLS), its3 = shapeItems(R, n), cnt = its3.filter(function (x) { return x.color === wantC; }).length;
    if (!cnt) { its3[R.int(0, n - 1)].color = wantC; cnt = its3.filter(function (x) { return x.color === wantC; }).length; }
    return { q: 'How many <b>' + wantC + '</b> shapes are there?', viz: pic({ kind: 'shapes', items: its3 }), a: mcN(cnt, 0, 7), steps: ['Look for ' + wantC + ' only.', 'There ' + (cnt === 1 ? 'is 1.' : 'are ' + cnt + '.')], hint: 'Touch each ' + wantC + ' one as you count.', ask: { t: 'count-color', color: wantC } };
  });

  G('pk.sort-shape', function (R, ctx) {
    var lv = ctx.level, who = nm(R);
    if (lv === 1) {
      var ss = R.sample(SHAPES, 3), want = R.pick(ss);
      return { q: R.pick(['Which one is a <b>' + want + '</b>?', who + ' is sorting shapes. Which one is the ' + want + '?']), viz: pic({ kind: 'shapes', pick: true, items: ss.map(function (s) { return { s: s, color: R.pick(COLS) }; }) }), a: mcPick(3, ss.indexOf(want)),
        steps: ['Look at the edges and corners.', 'The ' + want + ' is ' + LET[ss.indexOf(want)] + '.'], hint: { circle: 'A circle is round all the way.', square: 'A square has 4 sides, all the same.', triangle: 'A triangle has 3 sides.', rectangle: 'A rectangle has 4 sides, two long and two short.' }[want], ask: { t: 'shape', s: want } };
    }
    if (lv === 2) {
      var base = R.pick(SHAPES), odd = R.pick(SHAPES.filter(function (s) { return s !== base; })), pos = R.int(0, 3), it = [];
      for (var i = 0; i < 4; i++) it.push({ s: i === pos ? odd : base, color: R.pick(COLS), size: R.pick([0.8, 1, 1.1]) });
      return { q: 'Three are the same <b>shape</b>. Which one does not belong?', viz: pic({ kind: 'shapes', pick: true, items: it }), a: mcPick(4, pos), steps: ['Three are ' + base + 's.', LET[pos] + ' is a ' + odd + '.'], hint: 'Look at the shapes, not the colors.', ask: { t: 'odd-shape' } };
    }
    var n = R.int(5, 7), wS = R.pick(SHAPES), its = []; for (var j = 0; j < n; j++) its.push({ s: R.pick(SHAPES), color: R.pick(COLS) });
    if (!its.some(function (x) { return x.s === wS; })) its[R.int(0, n - 1)].s = wS;
    var cnt = its.filter(function (x) { return x.s === wS; }).length;
    return { q: 'How many <b>' + wS + 's</b> are there?', viz: pic({ kind: 'shapes', items: its }), a: mcN(cnt, 0, 7), steps: ['Look for ' + wS + 's only.', 'There ' + (cnt === 1 ? 'is 1.' : 'are ' + cnt + '.')], hint: 'Touch each ' + wS + ' as you count.', ask: { t: 'count-shape', s: wS } };
  });

  G('pk.sort-size', function (R, ctx) {
    var lv = ctx.level, t = pickThing(R);
    if (lv === 2) {
      var big = R.coin(), pos = R.int(0, 3), its = []; for (var i = 0; i < 4; i++) its.push({ obj: t.obj, s: (i === pos) === big ? 1.5 : 0.7 });
      return { q: 'Which ' + t.one + ' is a <b>different size</b> from the others?', viz: pic({ kind: 'sizes', pick: true, items: its }), a: mcPick(4, pos),
        steps: ['Three are ' + (big ? 'small' : 'big') + '.', LET[pos] + ' is ' + (big ? 'big' : 'small') + '.'], hint: 'Look for the one that is not like the rest.', ask: { t: 'odd-size' } };
    }
    var n = R.int(4, 6), wantBig = R.coin(), its2 = [];
    for (var j = 0; j < n; j++) its2.push({ obj: t.obj, s: R.coin() ? 1.5 : 0.7 });
    if (!its2.some(function (x) { return (x.s > 1) === wantBig; })) its2[0].s = wantBig ? 1.5 : 0.7;
    var cnt = its2.filter(function (x) { return (x.s > 1) === wantBig; }).length, word = wantBig ? 'big' : 'small';
    return { q: R.pick(['How many <b>' + word + '</b> ' + t.many + ' are there?', nm(R) + ' puts the ' + word + ' ' + t.many + ' in a box. How many go in the box?']), viz: pic({ kind: 'sizes', items: its2 }), a: mcN(cnt, 0, 6),
      steps: ['Sort them: big ones and small ones.', 'There ' + (cnt === 1 ? 'is 1 ' : 'are ' + cnt + ' ') + word + ' one' + (cnt === 1 ? '' : 's') + '.'], hint: 'Point to each ' + word + ' one and count.', ask: { t: 'count-size', big: wantBig } };
  });

  var GROUPS = { fruit: ['apple', 'pear', 'orange', 'banana', 'strawberry', 'lemon', 'watermelon'], ride: ['car', 'bus', 'boat', 'truck', 'bike', 'tractor', 'rocket'],
    animal: ['cat', 'dog', 'bunny', 'pig', 'cow', 'horse', 'duck', 'frog', 'fish', 'owl', 'penguin', 'fox', 'lion', 'monkey'], wear: ['sock', 'shoe', 'cap', 'tshirt'] };
  var GWORD = { fruit: 'fruit', ride: 'things that take you places', animal: 'animals', wear: 'things you wear' };
  G('pk.not-belong', function (R, ctx) {
    var lv = ctx.level, keys = Object.keys(GROUPS), g = R.pick(keys), h = R.pick(keys.filter(function (k) { return k !== g; }));
    if (lv === 2 && R.coin()) {
      var base = R.pick(SHAPES), col = R.pick(COLS), oddBy = R.pick(['shape', 'color']), pos = R.int(0, 3), it = [];
      for (var i = 0; i < 4; i++) it.push({ s: base, color: col });
      if (oddBy === 'shape') it[pos].s = R.pick(SHAPES.filter(function (s) { return s !== base; })); else it[pos].color = R.pick(COLS.filter(function (c) { return c !== col; }));
      return { q: 'Which one does <b>not</b> belong?', viz: pic({ kind: 'shapes', pick: true, items: it }), a: mcPick(4, pos), steps: ['Three are ' + col + ' ' + base + 's.', LET[pos] + ' is a different ' + oddBy + '.'], hint: 'Look at shape and color.', ask: { t: 'odd' } };
    }
    var three = R.sample(GROUPS[g], 3), odd = R.pick(GROUPS[h]), row = R.shuffle(three.concat([odd]));
    return { q: R.pick(['Three of these go together. Which one does <b>not</b> belong?', nm(R) + ' made a group. Which one does not belong?']), viz: pic({ kind: 'row', items: row }),
      a: mcText(EMO[odd] + ' ' + th(odd).one, three.map(function (k) { return EMO[k] + ' ' + th(k).one; })),
      steps: ['Three are ' + GWORD[g] + '.', 'The ' + th(odd).one + ' is not, so it does not belong.'], hint: 'What are three of them? Fruit, animals, things to ride, things to wear?', ask: { t: 'odd-group' } };
  });

  /* ================================================================ Patterns */
  function patternQ(R, ctx, cores) {
    var lv = ctx.level, core = R.pick(cores), kinds = R.sample(['emo', 'emo', 'circ', 'sq'], 1)[0], k = 0;
    core.split('').forEach(function (ch) { k = M.max(k, ch.charCodeAt(0) - 64); });
    var vals;
    if (kinds === 'emo') vals = R.sample(['apple', 'banana', 'star', 'heart', 'ball', 'duck', 'frog', 'flower', 'car', 'fish', 'moon', 'sun', 'bee', 'leaf', 'cat', 'dog', 'bell', 'drum'], k).map(function (x) { return EMO[x]; });
    else { var cs = R.sample(COLS, k); vals = cs.map(function (c) { return (kinds === 'circ' ? CIRC : SQ)[c]; }); }
    var reps = M.max(2, M.ceil(ML.byLevel(ctx, 6, 7, 8) / core.length)), full = [];
    for (var r = 0; r < reps; r++) core.split('').forEach(function (ch) { full.push(vals[ch.charCodeAt(0) - 65]); });
    var L = M.max(ML.byLevel(ctx, 6, 7, 8), core.length * 2 + 1); while (full.length < L) full = full.concat(full.slice(0, core.length));
    full = full.slice(0, L);
    var hide = lv === 1 ? full.length - 1 : lv === 2 ? R.pick([full.length - 1, R.int(core.length, full.length - 2)]) : R.int(core.length, full.length - 1);
    var ans = full[hide], items = full.map(function (x, i) { return i === hide ? null : x; });
    var opts = vals.slice(); if (opts.length < 3) opts.push(kinds === 'emo' ? R.pick(['🍓', '🐢', '🎈', '🌙', '🍪'].filter(function (x) { return vals.indexOf(x) < 0; })) : (kinds === 'circ' ? CIRC : SQ)[R.pick(COLS.filter(function (c) { return vals.indexOf((kinds === 'circ' ? CIRC : SQ)[c]) < 0; }))]);
    var say = core.split('').join(' ');
    return { q: hide === full.length - 1 ? R.pick(['What comes next in the pattern?', nm(R) + ' made a pattern. What comes next?']) : R.pick(['What is missing in the pattern?', 'Something is hiding under the <b>?</b>. What is it?']),
      viz: pic({ kind: 'row', items: items, hide: [hide] }), a: mcText(ans, opts.filter(function (x) { return x !== ans; })),
      steps: ['Say the pattern out loud. The part that repeats is ' + core.length + ' long: ' + say + '.', 'Keep it going to the <b>?</b>.', 'The missing one is ' + ans + '.'], hint: 'Read it aloud and listen for the part that repeats.', ask: { t: 'pattern' } };
  }
  G('pk.pattern-ab', function (R, ctx) { return patternQ(R, ctx, ['AB']); });
  G('pk.pattern-aab', function (R, ctx) { return patternQ(R, ctx, ctx.level === 1 ? ['AAB', 'ABB'] : ['AAB', 'ABB', 'AABB']); });
  G('pk.pattern-abc', function (R, ctx) { return patternQ(R, ctx, ctx.level === 3 ? ['ABC', 'ABCC', 'AABC'] : ['ABC']); });

  /* ================================================================ Shapes */
  function whichShape(R, ctx, pool) {
    var lv = ctx.level, k = lv === 1 ? 2 : 3, want = R.pick(pool), others = R.sample(['circle', 'square', 'triangle', 'rectangle', 'oval', 'diamond', 'star', 'heart'].filter(function (s) { return s !== want && (want !== 'square' || s !== 'diamond') && (want !== 'circle' || s !== 'oval' || lv === 3); }), k - 1);
    var ss = R.shuffle([want].concat(others)), idx = ss.indexOf(want);
    var its = ss.map(function (s) { return { s: s, color: R.pick(COLS), rot: lv >= 2 && (s === 'triangle' || s === 'rectangle' || s === 'square') ? R.pick([0, 0, 15, -20, 30, 90]) : 0, size: R.pick([0.8, 1, 1.15]) }; });
    if (lv === 3 && R.coin()) {
      var one = { s: want, color: R.pick(COLS), rot: want === 'circle' ? 0 : R.pick([0, 20, -15, 45]), size: R.pick([0.8, 1, 1.2]) };
      var names = ['circle', 'square', 'triangle', 'rectangle'];
      return { q: 'What shape is this?', viz: pic({ kind: 'shapes', items: [one] }), a: mcKeep(names, names.indexOf(want)),
        steps: [{ circle: 'It is round, with no corners.', square: 'It has 4 sides that are all the same, even turned.', triangle: 'It has 3 sides and 3 corners.', rectangle: 'It has 4 sides: two long and two short.' }[want], 'It is a ' + want + '.'], hint: 'Count the sides and corners.', ask: { t: 'name-shape' } };
    }
    return { q: R.pick(['Which one is the <b>' + want + '</b>?', 'Tap the <b>' + want + '</b>.', nm(R) + ' is looking for a ' + want + '. Which one?']), viz: pic({ kind: 'shapes', pick: true, items: its }), a: mcPick(k, idx),
      steps: [{ circle: 'A circle is round all the way, with no corners.', square: 'A square has 4 sides, all the same length. Turning it does not change it.', triangle: 'A triangle has 3 sides and 3 corners.', rectangle: 'A rectangle has 4 sides: two long and two short.' }[want], 'The ' + want + ' is ' + LET[idx] + '.'], hint: 'Count the sides.', ask: { t: 'shape', s: want } };
  }
  G('pk.circles-squares', function (R, ctx) { return whichShape(R, ctx, ['circle', 'square']); });
  G('pk.triangles-rectangles', function (R, ctx) { return whichShape(R, ctx, ctx.level === 1 ? ['triangle', 'rectangle'] : ['triangle', 'rectangle', 'circle', 'square']); });

  var CORN = { triangle: 3, square: 4, rectangle: 4, diamond: 4, circle: 0, oval: 0 };
  G('pk.sides-corners', function (R, ctx) {
    var lv = ctx.level;
    if (lv === 3 && R.coin()) {
      var want = R.pick([3, 4, 0]), pool = { 3: ['triangle'], 4: ['square', 'rectangle', 'diamond'], 0: ['circle', 'oval'] };
      var ans = R.pick(pool[want]), others = [3, 4, 0].filter(function (x) { return x !== want; }).map(function (x) { return R.pick(pool[x]); }), ss = R.shuffle([ans].concat(others));
      return { q: want ? 'Which shape has <b>' + want + ' corners</b>?' : 'Which shape has <b>no corners</b>?', viz: pic({ kind: 'shapes', pick: true, items: ss.map(function (s) { return { s: s, color: R.pick(COLS), rot: R.pick([0, 0, 20]) }; }) }), a: mcPick(3, ss.indexOf(ans)),
        steps: ss.map(function (s, i) { return LET[i] + ' has ' + (CORN[s] || 'no') + ' corners.'; }), hint: 'Touch each corner with your finger.', ask: { t: 'which-corners', n: want } };
    }
    var s = R.pick(['triangle', 'square', 'rectangle', 'diamond', 'triangle']), what = lv === 1 ? 'corners' : R.pick(['corners', 'sides']);
    return { q: R.pick(['How many <b>' + what + '</b> does this shape have?', nm(R) + ' traced this shape. How many ' + what + ' does it have?']), viz: pic({ kind: 'shapes', corners: what === 'corners', items: [{ s: s, color: R.pick(COLS), rot: lv === 1 ? 0 : R.pick([0, 15, -25, 40]) }] }), a: mcN(CORN[s], 2, 6),
      steps: [what === 'corners' ? 'A corner is where two sides meet. Touch each dot.' : 'A side is a straight edge. Trace each one.', 'Count: ' + list(seq(1, CORN[s])) + '.', 'It has ' + CORN[s] + ' ' + what + '.'], hint: what === 'corners' ? 'Count the gold dots.' : 'Trace the edges with your finger and count.', ask: { t: what } };
  });

  var REAL = [['clock', 'clock', 'circle'], ['cookie', 'cookie', 'circle'], ['donut', 'donut', 'circle'], ['target', 'target', 'circle'], ['ball', 'ball', 'circle'],
    ['pizza', 'slice of pizza', 'triangle'], ['tent', 'tent', 'triangle'], ['ruler', 'triangle ruler', 'triangle'],
    ['door', 'door', 'rectangle'], ['phone', 'phone', 'rectangle'], ['brick', 'brick', 'rectangle'], ['envelope', 'envelope', 'rectangle'], ['book', 'book', 'rectangle']];
  var SHW = { circle: '⚪ circle', triangle: '🔺 triangle', rectangle: '▭ rectangle' };
  G('pk.shapes-around', function (R, ctx) {
    var lv = ctx.level, r = R.pick(REAL), names = ['circle', 'triangle', 'rectangle'];
    if (lv >= 2 && R.coin()) {
      var want = R.pick(names), right = R.pick(REAL.filter(function (x) { return x[2] === want; })), wr = names.filter(function (s) { return s !== want; }).map(function (s) { return R.pick(REAL.filter(function (x) { return x[2] === s; })); });
      var three = R.shuffle([right].concat(lv === 2 ? wr.slice(0, 1) : wr));
      return { q: asks(R) + 'Which thing is shaped like a <b>' + want + '</b>?', viz: pic({ kind: 'row', items: three.map(function (x) { return x[0]; }) }), a: mcText(EMO[right[0]] + ' ' + right[1], three.filter(function (x) { return x !== right; }).map(function (x) { return EMO[x[0]] + ' ' + x[1]; })),
        steps: three.map(function (x) { var t = an(x[1]); return t.charAt(0).toUpperCase() + t.slice(1) + ' looks like a ' + x[2] + '.'; }), hint: 'Trace the outside of each one in the air.', ask: { t: 'real-which', s: want } };
    }
    return { q: R.pick(['What shape does ' + an('<b>' + r[1] + '</b>').replace('an <b>', 'an <b>') + ' look like?', nm(R) + ' found ' + an(r[1]) + '. What shape is it like?', nm(R) + ' traces around ' + an(r[1]) + '. What shape is it?', 'Look at the ' + r[1] + '. Is it like a circle, a triangle or a rectangle?']), viz: pic({ kind: 'shapes', items: [{ s: 'thing', obj: r[0] }] }), a: mcKeep(names.map(function (s) { return SHW[s]; }), names.indexOf(r[2])),
      steps: ['Trace around the ' + r[1] + ' with your finger.', 'It looks like a ' + r[2] + '.'], hint: 'Is it round? Does it have 3 corners or 4?', ask: { t: 'real', obj: r[0] } };
  });

  /* ================================================================ Where is it? */
  var PTHINGS = ['ball', 'cat', 'dog', 'bunny', 'bear', 'duck', 'balloon', 'apple', 'book', 'frog', 'present', 'turtle'];
  var PW = { above: 'above the table', on: 'on the table', under: 'under the table', beside: 'beside the', front: 'in front of the box', behind: 'behind the box' };
  function posWord(pos, ref) { return pos === 'beside' ? 'beside the ' + ref : PW[pos]; }
  function posQ(R, ctx, ref, poss) {
    var lv = ctx.level, t = th(R.pick(PTHINGS)), pos = R.pick(poss);
    if (lv >= 2 && R.coin()) {
      var k = lv === 2 ? 2 : M.min(3, poss.length), ps = R.shuffle([pos].concat(R.sample(poss.filter(function (p) { return p !== pos; }), k - 1)));
      return { q: 'Which picture shows the ' + t.one + ' <b>' + posWord(pos, ref) + '</b>?', viz: pic({ kind: 'scene', pick: true, items: ps.map(function (p) { return { ref: ref, thing: t.obj, pos: p }; }) }), a: mcPick(k, ps.indexOf(pos)),
        steps: ps.map(function (p, i) { return 'In ' + LET[i] + ', the ' + t.one + ' is ' + posWord(p, ref) + '.'; }), hint: 'Look at where the ' + t.one + ' is in each picture.', ask: { t: 'pick-pos', pos: pos } };
    }
    var ws = poss.map(function (p) { return posWord(p, ref); });
    return { q: R.pick(['Where is the ' + t.one + '?', nm(R) + ' is looking for the ' + t.one + '. Where is it?']), viz: pic({ kind: 'scene', items: [{ ref: ref, thing: t.obj, pos: pos }] }), a: mcKeep(ws, poss.indexOf(pos)),
      steps: ['Look at the ' + t.one + ' and the ' + ref + '.', 'The ' + t.one + ' is ' + posWord(pos, ref) + '.'], hint: 'Put a toy in the same spot near a real ' + ref + '.', ask: { t: 'pos' } };
  }
  G('pk.above-below', function (R, ctx) { return posQ(R, ctx, 'table', ctx.level === 1 ? ['above', 'under'] : ['above', 'on', 'under']); });
  G('pk.front-behind', function (R, ctx) { return posQ(R, ctx, 'box', ctx.level === 3 ? ['front', 'behind', 'beside'] : ['front', 'behind']); });
  G('pk.beside-between', function (R, ctx) {
    var lv = ctx.level;
    if (lv === 1 || R.coin()) {
      var three = R.sample(PTHINGS.concat(['chick', 'pig', 'owl', 'fox']), 3).map(th), mid = three[1];
      return { q: R.pick(['Who is <b>between</b> the ' + three[0].one + ' and the ' + three[2].one + '?', 'What is in the middle, between the ' + three[0].one + ' and the ' + three[2].one + '?']), viz: pic({ kind: 'scene', between: three.map(function (x) { return x.obj; }) }),
        a: mcText(EMO[mid.obj] + ' ' + mid.one, [three[0], three[2]].map(function (x) { return EMO[x.obj] + ' ' + x.one; })), steps: ['Between means in the middle, with one on each side.', 'The ' + mid.one + ' is between them.'], hint: 'Point to the one in the middle.', ask: { t: 'between' } };
    }
    return posQ2(R, ctx);
  });
  function posQ2(R, ctx) { var ref = R.pick(['table', 'box']); return posQ(R, ctx, ref, ref === 'table' ? ['beside', 'on', 'under'] : ['beside', 'front', 'behind']); }

  /* ================================================================ First, next, last */
  G('pk.first-last', function (R, ctx) {
    var lv = ctx.level, k = ML.byLevel(ctx, 3, 4, 5), line = R.sample(ANIMALS, k), want = lv === 1 ? R.pick(['first', 'last']) : R.pick(['first', 'last', 'next']);
    var idx = want === 'first' ? 0 : want === 'last' ? k - 1 : 1;
    var q = want === 'first' ? 'The animals wait at the door. Who is <b>first</b> in line?' : want === 'last' ? 'Who is <b>last</b> in line, at the very end?' : 'The first one goes in. Who goes in <b>next</b>?';
    return { q: q, viz: pic({ kind: 'line', items: line }), a: mcText(EMO[line[idx]] + ' ' + th(line[idx]).one, line.filter(function (x, i) { return i !== idx; }).slice(0, 2).map(function (x) { return EMO[x] + ' ' + th(x).one; })),
      steps: ['The door is at the front of the line.', want === 'first' ? 'First is the one next to the door.' : want === 'last' ? 'Last is the one at the end, far from the door.' : 'Next is the one right after the first.', 'It is the ' + th(line[idx]).one + '.'], hint: 'Start at the door.', ask: { t: 'line', want: want } };
  });

  var STEPS = [['egg', 'chickhatch', 'chick'], ['seed', 'sprout', 'tulip'], ['caterpillar', 'butterfly'], ['ice', 'drop'], ['snowflake', 'snowman'], ['brick', 'house'],
    ['bread', 'sandwich'], ['letter', 'mailbox'], ['sprout', 'tree'], ['sunrise', 'sun', 'moon'], ['sock', 'shoe']];
  var STEPW = { egg: 'egg', chickhatch: 'chick hatching', chick: 'chick', seed: 'seed', sprout: 'sprout', tulip: 'flower', caterpillar: 'caterpillar', butterfly: 'butterfly', ice: 'ice', drop: 'water',
    snowflake: 'snow', snowman: 'snowman', brick: 'bricks', house: 'house', bread: 'bread', sandwich: 'sandwich', letter: 'letter', mailbox: 'mailbox', tree: 'tree', sunrise: 'morning', sun: 'afternoon', moon: 'night', sock: 'socks', shoe: 'shoes', bath: 'bath', bed: 'bed' };
  G('pk.what-next', function (R, ctx) {
    var lv = ctx.level, pool = lv === 1 ? STEPS.filter(function (s) { return s.length === 2; }) : STEPS, s = R.pick(pool);
    var hide = lv === 1 ? s.length - 1 : lv === 2 ? R.pick([0, s.length - 1]) : R.int(0, s.length - 1);
    var ans = s[hide], others = R.sample(['apple', 'ball', 'car', 'cat', 'star', 'drum', 'kite', 'boat'], 2);
    if (lv >= 2) others = [s.filter(function (x, i) { return i !== hide; })[0]].concat(others.slice(0, 1));
    return { q: hide === s.length - 1 ? 'What comes <b>next</b>?' : hide === 0 ? 'What came <b>first</b>?' : 'What happens in the <b>middle</b>?', viz: pic({ kind: 'row', arrows: true, items: s.map(function (x, i) { return i === hide ? null : x; }), hide: [hide] }),
      a: mcText(EMO[ans] + ' ' + STEPW[ans], others.map(function (x) { return EMO[x] + ' ' + (STEPW[x] || th(x).one); })),
      steps: ['Tell the story: ' + s.map(function (x) { return STEPW[x]; }).join(', then ') + '.', 'The missing step is the ' + STEPW[ans] + '.'], hint: 'Tell the story from the start.', ask: { t: 'story' } };
  });

  /* ================================================================ Adding and taking away */
  G('pk.put-together', function (R, ctx) {
    var lv = ctx.level, mixed = lv >= 2 && R.coin(), t = mixed ? pickAnimal(R) : pickThing(R), u = mixed ? pickAnimal(R, [t.obj]) : t, tot = R.int(2, 5), a = R.int(1, tot - 1), b = tot - a, who = nm(R);
    var all = mixed ? 'animals' : t.many;
    return { q: R.pick([who + ' has ' + w(a, t) + ' and ' + w(b, u) + '. How many ' + all + ' in all?', w(a, t) + ' and ' + w(b, u) + ' come together. How many ' + all + ' now?']),
      viz: pic({ kind: 'groups', op: '+', groups: [{ n: a, obj: t.obj, layout: lv === 3 ? 'dice' : 'row' }, { n: b, obj: u.obj, layout: lv === 3 ? 'dice' : 'row' }] }), a: mcN(tot, 1, 6),
      steps: ['Put them together.', 'Count them all: ' + list(seq(1, tot)) + '.', a + ' and ' + b + ' make ' + tot + '.'], hint: 'Tap every one in both groups.', ask: { t: 'count' } };
  });
  G('pk.take-away', function (R, ctx) {
    var lv = ctx.level, n = ML.byLevel(ctx, R.int(2, 4), R.int(3, 5), R.int(3, 5)), k = R.int(1, lv === 3 ? n : n - 1), left = n - k;
    var verbs = [['bird', 'flew away'], ['duck', 'swam away'], ['bee', 'buzzed away'], ['cookie', 'got eaten'], ['frog', 'hopped away'], ['balloon', 'floated away'], ['apple', 'got eaten'], ['bunny', 'hopped away'], ['fish', 'swam away'], ['butterfly', 'flew away'], ['ladybug', 'crawled away'], ['snail', 'went home'], ['cupcake', 'got eaten'], ['strawberry', 'got eaten'], ['chick', 'ran to the hen'], ['owl', 'flew away'], ['kite', 'blew away'], ['car', 'drove away'], ['boat', 'sailed away'], ['penguin', 'slid away']];
    var v = R.pick(verbs), t = th(v[0]);
    return { q: R.pick(['', '', nm(R) + ' sees this. ', 'At the park: ']) + 'There ' + (n === 1 ? 'is ' : 'are ') + w(n, t) + '. ' + k + ' ' + v[1] + '. How many are left?', viz: pic({ kind: 'groups', groups: [{ n: n, obj: t.obj, cross: k, layout: R.pick(['row', 'line', 'dice']) }], tap: false }), a: mcN(left, 0, 5),
      steps: ['Start with ' + n + '.', 'The ' + k + ' crossed out ' + (k === 1 ? 'is' : 'are') + ' gone.', left ? left + ' ' + (left === 1 ? 'is' : 'are') + ' left.' : 'None are left: 0.'], hint: 'Cover the crossed-out ones with your hand. Count the rest.', ask: { t: 'count', left: true } };
  });

  /* ================================================================ Days and routines */
  function sky(R, t) { return { time: t, land: R.pick(['house', 'tree', 'tent', 'hill']) }; }
  var TW = { morning: '🌅 morning', afternoon: '☀️ afternoon', night: '🌙 night' };
  var DO = [['eat breakfast', 'morning'], ['wake up', 'morning'], ['see the stars', 'night'], ['go to sleep', 'night'], ['put on pajamas', 'night'], ['see the sun come up', 'morning'], ['have a bedtime story', 'night']];
  G('pk.times-of-day', function (R, ctx) {
    var lv = ctx.level, times = ['morning', 'afternoon', 'night'];
    if (lv === 3 && R.coin()) {
      var d = R.pick(DO);
      return { q: asks(R) + 'When do most children <b>' + d[0] + '</b>?', a: mcKeep(times.map(function (x) { return TW[x]; }), times.indexOf(d[1])), viz: pic({ kind: 'sky', items: times.map(function (x) { return sky(R, x); }) }),
        steps: ['Think about your own day.', 'We ' + d[0] + ' in the ' + d[1] + '.'], hint: 'Is it light or dark then?', ask: { t: 'do', what: d[0] } };
    }
    if (lv >= 2 && R.coin()) {
      var want = R.pick(times), ps = R.shuffle(times), k = lv === 2 ? 2 : 3; ps = ps.filter(function (x) { return x === want; }).concat(ps.filter(function (x) { return x !== want; }).slice(0, k - 1)); ps = R.shuffle(ps);
      return { q: asks(R) + 'Which picture shows <b>' + want + '</b>?', viz: pic({ kind: 'sky', pick: true, items: ps.map(function (x) { return sky(R, x); }) }), a: mcPick(k, ps.indexOf(want)),
        steps: ['Morning: the sun is low and just coming up. Afternoon: the sun is high. Night: it is dark, with the moon and stars.', 'The answer is ' + LET[ps.indexOf(want)] + '.'], hint: 'Look at the sun and the sky.', ask: { t: 'pick-time', time: want } };
    }
    var tm = R.pick(times);
    return { q: R.pick(['Is it morning, afternoon or night?', nm(R) + ' looks out the window. What time of day is it?', nm(R) + ' is outside. Is it morning, afternoon or night?', 'Look at the sky. What time of day is it?']), viz: pic({ kind: 'sky', items: [sky(R, tm)] }), a: mcKeep(times.map(function (x) { return TW[x]; }), times.indexOf(tm)),
      steps: [{ morning: 'The sun is low and just coming up.', afternoon: 'The sun is high in a bright sky.', night: 'It is dark. The moon and stars are out.' }[tm], 'It is ' + tm + '.'], hint: 'Where is the sun? Is it dark?', ask: { t: 'time' } };
  });

  var DAY = [['alarm', 'wake up'], ['bowl', 'eat breakfast'], ['sandwich', 'eat lunch'], ['dinner', 'eat dinner'], ['bed', 'go to sleep']];
  var PAIRS = [[['sock', 'put on socks'], ['shoe', 'put on shoes']], [['dinner', 'eat dinner'], ['bed', 'go to sleep']], [['alarm', 'wake up'], ['bowl', 'eat breakfast']],
    [['book', 'read a bedtime story'], ['bed', 'go to sleep']], [['tshirt', 'get dressed'], ['backpack', 'go out']],
    [['alarm', 'wake up'], ['tshirt', 'get dressed']], [['sandwich', 'eat lunch'], ['bed', 'go to sleep']], [['alarm', 'wake up'], ['bed', 'go to sleep']], [['bowl', 'eat breakfast'], ['sandwich', 'eat lunch']]];
  G('pk.daily-routine', function (R, ctx) {
    var lv = ctx.level;
    if (lv === 1 || R.coin()) {
      var p = R.pick(PAIRS), first = R.coin(), ord = R.shuffle([p[0], p[1]]);
      var right = first ? p[0] : p[1];
      return { q: asks(R) + 'What do we usually do <b>' + (first ? 'first' : 'second') + '</b>: ' + ord[0][1] + ' or ' + ord[1][1] + '?', viz: pic({ kind: 'row', items: ord.map(function (x) { return x[0]; }) }), a: mcKeep(ord.map(function (x) { return EMO[x[0]] + ' ' + x[1]; }), ord.indexOf(right)),
        steps: ['First we ' + p[0][1] + '.', 'Then we ' + p[1][1] + '.'], hint: 'Act it out: which do you do before the other?', ask: { t: 'pair', want: first ? 'first' : 'second', a: ord[0][1], b: ord[1][1] } };
    }
    // wrong choices never fit the gap: before the first step when the last is hidden, after the last when the first is hidden
    var hide = lv === 2 ? 2 : R.int(0, 2), st = hide === 2 ? R.int(2, DAY.length - 3) : hide === 0 ? R.int(0, DAY.length - 5) : R.int(0, DAY.length - 3), three = DAY.slice(st, st + 3), ans = three[hide];
    var wr = R.sample(DAY.filter(function (d, i) { return three.indexOf(d) < 0 && (hide === 2 ? i < st : hide === 0 ? i > st + 2 : true); }), 2);
    var who = nm(R);
    return { q: R.pick(['Here is part of a day, in order.', 'This is part of ' + who + '’s day, in order.', who + ' drew a day, one thing after another.', 'Look at ' + who + '’s day from left to right.']) + ' What goes under the <b>?</b>', viz: pic({ kind: 'row', arrows: true, items: three.map(function (x, i) { return i === hide ? null : x[0]; }), hide: [hide] }),
      a: mcText(EMO[ans[0]] + ' ' + ans[1], wr.map(function (d) { return EMO[d[0]] + ' ' + d[1]; })), steps: ['Say the day in order: ' + three.map(function (x) { return x[1]; }).join(', then ') + '.', 'The missing one is: ' + ans[1] + '.'], hint: 'Tell the story of the day from the start.', ask: { t: 'day' } };
  });

  /* ================================================================ Coins */
  var COINW = ['penny', 'nickel', 'dime', 'quarter'];
  G('pk.coins', function (R, ctx) {
    var lv = ctx.level;
    if (lv === 3 && R.coin()) {
      var n = R.int(2, 8);
      var its = []; for (var i = 0; i < n; i++) its.push({ c: 'penny' });
      return { q: R.pick(['How many pennies?', nm(R) + ' has some pennies in a jar. How many?']), viz: pic({ kind: 'coins', items: its }), a: mcN(n, 1, 9), steps: ['Count each penny once: ' + list(seq(1, n)) + '.', 'There are ' + n + ' pennies.'], hint: 'Touch each one as you count.', ask: { t: 'coin-count' } };
    }
    var want = ML.byLevel(ctx, R.pick(['penny', 'biggest']), R.pick(['penny', 'biggest', 'smallest']), R.pick(['biggest', 'smallest', 'penny']));
    var k = lv === 1 ? 2 : 3, cs;
    if (want === 'penny') cs = ['penny'].concat(R.sample(['nickel', 'dime', 'quarter'], k - 1));
    else if (want === 'biggest') cs = ['quarter'].concat(R.sample(['penny', 'nickel', 'dime'], k - 1));
    else cs = ['dime'].concat(R.sample(['penny', 'nickel', 'quarter'], k - 1));
    cs = R.shuffle(cs);
    var right = want === 'penny' ? 'penny' : want === 'biggest' ? 'quarter' : 'dime', idx = cs.indexOf(right);
    return { q: R.pick(['', nm(R) + ' found some coins. ', nm(R) + ' empties a piggy bank. ', 'Here are some coins. ']) + (want === 'penny' ? 'Which coin is the <b>penny</b>? It is the copper-colored one.' : 'Which coin is the <b>' + want + '</b>?'), viz: pic({ kind: 'coins', pick: true, items: cs.map(function (c) { return { c: c }; }) }), a: mcPick(k, idx),
      steps: [want === 'penny' ? 'A penny is a brown, copper color. The others are silver.' : want === 'biggest' ? 'The quarter is the biggest of these coins.' : 'The dime is the smallest coin.', 'The ' + right + ' is ' + LET[idx] + '.'], hint: want === 'penny' ? 'Look at the colors.' : 'Compare the sizes.', ask: { t: 'coin', want: want } };
  });
})(typeof window !== 'undefined' ? window.MathLadder : global.MathLadder);
