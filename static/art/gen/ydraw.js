/* Drawing for Young Artists (Art & Drawing Ladder, course key ydraw): problem generators.
   Read-aloud problems for ages 5 to 9: one short sentence, words a five-year-old knows, two or three choices, a "Read to me"
   note for the grown-up at the top, and a quiet picture from the kit (static/art/viz/art.js; options in its header).
   No typing: answers are mc (with keep: true when the order matters for reading aloud). The kit's model MathLadder.art
   (A below) holds the line kinds, things, shapes and drawings, so the picture and the answer always agree.
   Shapes by level:
     level 1  one picture and two choices (the right word and a plainly different one)
     level 2  three choices, with the near miss from the topic's trouble note (zigzag vs wavy, square turned on its corner)
     level 3  "Which picture shows…?" among three lettered pictures, things in the world, or "choose all"
   The first six topics are the model for the course builders (see /tmp/work_art/overview.md). */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;
  function A() { return ML.art; }

  // ---------------------------------------------------------------- helpers
  var READ = '<p class="ar-readme"><b>Read to me</b> Read the question and the choices aloud.</p>';
  function big(s) { return '<span class="ar-big">' + s + '</span>'; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function letter(i) { return String.fromCharCode(65 + i); }
  function mc(choices, right, keep) { return { t: 'mc', choices: choices, v: right, keep: keep !== false }; }
  // a quiet ar-lines picture of one or more lines (letters under each when there are several)
  function lines(kinds, extra) { return { name: 'ar-lines', opts: Object.assign({ kinds: kinds, quiet: true, interactive: false, big: true, labels: kinds.length > 1 ? 'letters' : 'none', columns: kinds.length, label: kinds.length > 1 ? 'Pictures of lines, lettered' : 'A picture of a line' }, extra || {}) }; }
  function things(keys, extra) { return { name: 'ar-lines', opts: Object.assign({ mode: 'things', kinds: keys, quiet: true, interactive: false, big: true, labels: keys.length > 1 ? 'letters' : 'none', columns: keys.length, label: keys.length > 1 ? 'Pictures, lettered' : 'A picture' }, extra || {}) }; }
  function shapes(keys, extra) { return { name: 'ar-shapes', opts: Object.assign({ shapes: keys, quiet: true, interactive: false, big: true, labels: keys.length > 1 ? 'letters' : 'none', columns: keys.length, label: keys.length > 1 ? 'Shapes, lettered' : 'A shape' }, extra || {}) }; }
  function lineWord(k) { return A().LINES[k].name; }
  // crayon colors and a few young artists' names, so pictures and questions vary
  var CRAYON = ['#e04a3f', '#3d86e8', '#38a856', '#9a5ad6', '#ef8a1f', '#d6448c'];
  var KIDS = ['Mia', 'Leo', 'Sam', 'Ruby', 'Omar', 'Hana'];
  function who(R) { return R.pick(KIDS); }
  function crayon(R, n) { return n ? R.sample(CRAYON, n) : R.pick(CRAYON); }
  // three distinct kinds: the answer and two others from a pool, shuffled; returns { kinds, right }
  function lineup(R, want, pool) { var others = R.sample(pool.filter(function (k) { return k !== want; }), 2), ks = R.shuffle([want].concat(others)); return { kinds: ks, right: ks.indexOf(want) }; }
  // turn a straight or curved line so pictures vary; vertical, horizontal and diagonal are drawn by their own kinds
  function turn(R, k) { if (k === 'straight') return R.pick([0, -20, 20, -35, 35, 90]); if (k === 'curved') return R.pick([0, 180, 90, -90]); if (k === 'zigzag' || k === 'wavy') return R.pick([0, 0, 90, 180]); return 0; }

  // ---------------------------------------------------------------- ydraw.straight-curved
  G('ydraw.straight-curved', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1 || (L === 2 && R.coin())) {
      var k = R.pick(['straight', 'curved']), rot = turn(R, k), opts = ['A straight line', 'A curved line'], nm = who(R);
      return { q: READ + big(R.pick([nm + ' drew this line. Is it straight or curved?', 'Look at the line. Is it straight or curved?', 'Is ' + nm + '\'s line straight, or does it bend?'])), viz: lines([k], { rotate: { 0: rot }, color: crayon(R) }), a: mc(opts, k === 'straight' ? 0 : 1),
        steps: [k === 'straight' ? 'The line goes one way and never bends.' : 'The line bends, like a smile or a rainbow.', 'So it is ' + (k === 'straight' ? 'a straight line.' : 'a curved line.')],
        hint: 'Does the line bend anywhere?' };
    }
    if (L === 2) { // which one is curved (or straight)? three lines, one odd one out
      var want = R.pick(['straight', 'curved']), other = want === 'straight' ? 'curved' : 'straight', ks = R.shuffle([want, other, other]), rot2 = {};
      ks.forEach(function (q, i) { rot2[i] = turn(R, q); });
      return { q: READ + big('Which line is ' + want + '?'), viz: lines(ks, { rotate: rot2, colors: crayon(R, 3) }), a: mc(['A', 'B', 'C'], ks.indexOf(want)),
        steps: ['Look at each line. A ' + want + ' line ' + (want === 'straight' ? 'never bends.' : 'bends.'), 'Line ' + letter(ks.indexOf(want)) + ' is the ' + want + ' one.'],
        hint: want === 'straight' ? 'Find the line that goes one way without bending.' : 'Find the line that bends.' };
    }
    // level 3: things in the world: straight or curved?
    var pool = [['rainbow', 'curved'], ['flagpole', 'straight'], ['ladder', 'straight'], ['fence', 'straight'], ['horizon', 'straight'], ['slide', 'straight']];
    var t = R.pick(pool), name = Ak.LINE_THINGS[t[0]].name;
    return { q: READ + big('Look at ' + name + '. Is the line that stands out straight or curved?'), viz: things([t[0]]), a: mc(['Straight', 'Curved'], t[1] === 'straight' ? 0 : 1),
      steps: [cap(name) + ' ' + (t[1] === 'straight' ? 'makes a line that does not bend.' : 'makes a line that bends in a bow.'), 'So the line is ' + t[1] + '.'],
      hint: 'Trace the colored line with your finger. Does it bend?' };
  });

  // ---------------------------------------------------------------- ydraw.line-directions
  var DIR = ['vertical', 'horizontal', 'diagonal'], DIR_SAY = { vertical: 'stands up tall', horizontal: 'lies down flat', diagonal: 'leans' };
  G('ydraw.line-directions', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var pair = R.pick([['vertical', 'horizontal'], ['horizontal', 'vertical'], ['diagonal', 'vertical'], ['diagonal', 'horizontal']]), k = pair[0], opts = R.shuffle([pair[0], pair[1]]);
      return { q: READ + big(R.pick(['Does this line stand up tall, lie down flat, or lean?', who(R) + ' drew a line. Does it stand up, lie down, or lean?'])), viz: lines([k], { rotate: { 0: k === 'diagonal' ? R.pick([0, 90]) : 0 }, color: crayon(R) }),
        a: mc(opts.map(function (d) { return cap(d) + ': it ' + DIR_SAY[d]; }), opts.indexOf(k)),
        steps: ['This line ' + DIR_SAY[k] + '.', 'A line that ' + DIR_SAY[k] + ' is called ' + k + '.'], hint: 'Stand up tall: vertical. Lie down flat: horizontal. Lean: diagonal.' };
    }
    if (L === 2) {
      var want = R.pick(DIR), ks = R.shuffle(DIR.slice());
      return { q: READ + big(R.pick(['Which line is ' + want + '?', 'Which line ' + DIR_SAY[want] + '? (That is a ' + want + ' line.)'])), viz: lines(ks, { colors: crayon(R, 3) }), a: mc(['A', 'B', 'C'], ks.indexOf(want)),
        steps: ['A ' + want + ' line ' + DIR_SAY[want] + '.', 'Line ' + letter(ks.indexOf(want)) + ' ' + DIR_SAY[want] + '.'],
        hint: want === 'horizontal' ? 'Horizontal is like the horizon, where the sky meets the land: flat.' : want === 'vertical' ? 'Vertical lines stand up like a flagpole.' : 'Diagonal lines lean, like a slide.' };
    }
    var pool = ['ladder', 'fence', 'flagpole', 'horizon', 'slide', 'rain'], t = R.pick(pool), info = Ak.LINE_THINGS[t], opts3 = DIR.slice();
    return { q: READ + big('Look at ' + info.name + '. What kind of line is the colored one?'), viz: things([t]), a: mc(opts3.map(cap), opts3.indexOf(info.line)),
      steps: ['The colored line ' + DIR_SAY[info.line] + '.', 'So it is a ' + info.line + ' line.'], hint: 'Does it stand up, lie down, or lean?' };
  });

  // ---------------------------------------------------------------- ydraw.zigzag-wavy
  var ZW = ['zigzag', 'wavy', 'spiral'], ZW_SAY = { zigzag: 'has sharp points, like teeth', wavy: 'has smooth bumps, like water', spiral: 'winds around and around, like a snail shell' };
  G('ydraw.zigzag-wavy', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var k = R.pick(ZW), other = R.pick(ZW.filter(function (q) { return q !== k; }).concat(['straight'])), opts = R.shuffle([k, other]);
      return { q: READ + big(R.pick(['What kind of line is this?', who(R) + ' drew this line. What kind of line is it?'])), viz: lines([k], { rotate: { 0: turn(R, k) }, color: crayon(R) }), a: mc(opts.map(function (q) { return cap(lineWord(q)); }), opts.indexOf(k)),
        steps: ['This line ' + ZW_SAY[k] + '.', 'That is a ' + k + ' line.'], hint: 'Sharp points make a zigzag. Smooth bumps make a wavy line. Going around and around makes a spiral.' };
    }
    if (L === 2) { // the trouble spot: zigzag vs wavy
      var want = R.pick(['zigzag', 'wavy']), ks = R.shuffle(['zigzag', 'wavy', R.pick(['straight', 'curved', 'spiral'])]);
      return { q: READ + big('Which line is ' + want + '?'), viz: lines(ks, { colors: crayon(R, 3) }), a: mc(['A', 'B', 'C'], ks.indexOf(want)),
        steps: ['Zigzag and wavy lines both go up and down.', 'A zigzag has sharp corners. A wavy line is smooth all the way.', 'Line ' + letter(ks.indexOf(want)) + ' is ' + want + '.'],
        hint: 'Look at the tops: sharp points, or smooth bumps?' };
    }
    var pool = ['lightning', 'waves', 'snail', 'mountains', 'lollipop'], wantK = R.pick(ZW), match = pool.filter(function (t) { return Ak.LINE_THINGS[t].line === wantK; }), pick = R.pick(match);
    var rest = R.sample(pool.filter(function (t) { return Ak.LINE_THINGS[t].line !== wantK; }), 2), list = R.shuffle([pick].concat(rest));
    return { q: READ + big('Which picture shows a ' + wantK + ' line?'), viz: things(list), a: mc(['A', 'B', 'C'], list.indexOf(pick)),
      steps: list.map(function (t, i) { return letter(i) + ': ' + Ak.LINE_THINGS[t].name + ' (' + Ak.LINE_THINGS[t].line + ').'; }).concat(['So the answer is ' + letter(list.indexOf(pick)) + '.']),
      hint: 'A ' + wantK + ' line ' + ZW_SAY[wantK] + '.' };
  });

  // ---------------------------------------------------------------- ydraw.thick-thin
  G('ydraw.thick-thin', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var k = R.pick(['thick', 'thin']), opts = ['Thick', 'Thin'];
      return { q: READ + big(R.pick(['Is this line thick or thin?', who(R) + ' made this line. Is it thick or thin?', 'Is this a wide line or a narrow line?'])), viz: lines([k], { color: crayon(R), rotate: { 0: R.pick([0, 180, 20, -20]) } }), a: mc(opts, k === 'thick' ? 0 : 1),
        steps: [k === 'thick' ? 'The line is wide and bold.' : 'The line is narrow and fine.', 'It is a ' + k + ' line.'], hint: 'Is the line wide, or narrow like a thread?' };
    }
    if (L === 2) {
      var asks = R.pick([['light', ['light', 'dark']], ['dark', ['light', 'dark']], ['thick', ['thick', 'thin']], ['thin', ['thick', 'thin']]]), ks = R.shuffle(asks[1].slice());
      var col2 = asks[0] === 'thick' || asks[0] === 'thin' ? { color: crayon(R) } : {};
      return { q: READ + big(R.pick(['Which line is ' + asks[0] + 'er?', 'Look at lines A and B. Which one is ' + asks[0] + 'er?'])), viz: lines(ks, col2), a: mc(['A', 'B'], ks.indexOf(asks[0])),
        steps: ['Compare the two lines.', 'Line ' + letter(ks.indexOf(asks[0])) + ' is ' + asks[0] + 'er.'], hint: asks[0] === 'light' || asks[0] === 'dark' ? 'Which line is paler, and which is stronger?' : 'Which line is wider?' };
    }
    var Q = R.pick([
      { q: 'You want a dark, strong line. How should you press?', c: ['Press harder', 'Press very gently'], v: 0, s: ['Pressing harder puts down more color.', 'So press harder for a dark line.'], h: 'More pressure, more color.' },
      { q: 'NAME pressed very gently with a pencil. What kind of line did NAME make?', c: ['A light line', 'A dark line'], v: 0, s: ['A gentle press puts down only a little color.', 'So the line is light.'], h: 'Gentle means a little color.' },
      { q: 'NAME wants to draw a big, bold outline. Which tool works best?', c: ['A thick crayon or marker', 'A very sharp, hard pencil'], v: 0, s: ['A thick tool makes a wide, bold line.', 'So a thick crayon or marker works best.'], h: 'Bold lines are wide.' },
      { q: 'You want a light line you can erase. How should you press?', c: ['Press gently', 'Press as hard as you can'], v: 0, s: ['A gentle line is light, and light lines erase easily.', 'So press gently.'], h: 'Light lines are easy to change.' },
      { q: 'Why do artists start with light lines?', c: ['So they can erase and change them', 'Because dark lines are not allowed', 'So the paper stays clean forever'], v: 0, s: ['Light lines are easy to erase.', 'Artists start light so they can fix things, then make the best lines darker.'], h: 'What if you change your mind?' },
      { q: 'Which tool makes a thick line most easily?', c: ['A fat marker', 'A sharp pencil'], v: 0, s: ['A fat tool makes a wide mark.', 'So a fat marker makes thick lines easily.'], h: 'Think about how wide the tip is.' }
    ]);
    var order = R.shuffle(Q.c.map(function (c, i) { return i; })), nm3 = who(R);
    return { q: READ + big(Q.q.replace(/NAME/g, nm3)), a: mc(order.map(function (i) { return Q.c[i]; }), order.indexOf(Q.v), false), steps: Q.s, hint: Q.h };
  });

  // ---------------------------------------------------------------- ydraw.lines-all-around
  var LINE_POOL = ['ladder', 'fence', 'lightning', 'waves', 'snail', 'rain', 'road', 'rainbow', 'flagpole', 'horizon', 'slide', 'mountains', 'lollipop', 'footprints'];
  // wrong answers that cannot also describe the colored line (a wavy line is also curved, a vertical line is also straight…)
  var DISTRACT = { vertical: ['horizontal', 'diagonal'], horizontal: ['vertical', 'diagonal'], diagonal: ['vertical', 'horizontal'], zigzag: ['wavy', 'spiral'], wavy: ['zigzag', 'straight'],
    spiral: ['zigzag', 'straight'], curved: ['zigzag', 'straight'], straight: ['wavy', 'zigzag'], dotted: ['zigzag', 'wavy'], dashed: ['zigzag', 'spiral'] };
  // for "Which picture has a … line?": pictures that must not be the wrong choices because they show that line too
  var ALSO = { zigzag: ['lightning', 'mountains'], wavy: ['waves'], spiral: ['snail', 'lollipop'], dotted: ['footprints'], curved: ['rainbow', 'snail', 'waves', 'lollipop'] };
  G('ydraw.lines-all-around', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    var kindOf = function (t) { return Ak.LINE_THINGS[t].line; };
    if (L <= 2) {
      var t = R.pick(LINE_POOL), right = kindOf(t), wrong = L === 1 ? [R.pick(DISTRACT[right])] : DISTRACT[right].slice();
      var opts = R.shuffle([right].concat(wrong));
      return { q: READ + big('Look at ' + Ak.LINE_THINGS[t].name + '. What kind of line is the colored part?'), viz: things([t]), a: mc(opts.map(function (k) { return cap(lineWord(k)) + ' line'; }), opts.indexOf(right)),
        steps: [cap(Ak.LINE_THINGS[t].name) + ': the colored line ' + Ak.LINES[right].desc + '.', 'That is a ' + right + ' line.'], hint: 'Trace the colored part with your finger. What does it do?' };
    }
    var want = R.pick(Object.keys(ALSO));
    var pick = R.pick(ALSO[want]), rest = R.sample(LINE_POOL.filter(function (q) { return ALSO[want].indexOf(q) < 0; }), 2), list = R.shuffle([pick].concat(rest));
    return { q: READ + big('Which picture has a ' + want + ' line?'), viz: things(list), a: mc(['A', 'B', 'C'], list.indexOf(pick)),
      steps: list.map(function (q, i) { return letter(i) + ': ' + Ak.LINE_THINGS[q].name + ' (' + kindOf(q) + ').'; }).concat(['Only ' + letter(list.indexOf(pick)) + ' has a ' + want + ' line.']), hint: 'A ' + want + ' line ' + Ak.LINES[want].desc + '.' };
  });

  // ---------------------------------------------------------------- ydraw.basic-shapes
  var B3 = ['circle', 'square', 'triangle'];
  G('ydraw.basic-shapes', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var k = R.pick(B3), opts = R.shuffle(B3.slice()).slice(0, 2); if (opts.indexOf(k) < 0) opts[R.int(0, 1)] = k;
      return { q: READ + big(R.pick(['What shape is this?', who(R) + ' cut out this shape. What shape is it?', 'Name this shape.'])), viz: shapes([k], { fill: crayon(R), rotate: { 0: k === 'circle' ? 0 : R.pick([0, 0, 10, -10, 180]) } }), a: mc(opts.map(cap), opts.indexOf(k)),
        steps: [k === 'circle' ? 'It is round, with no corners.' : 'It has ' + Ak.SHAPES[k].sides + ' sides and ' + Ak.SHAPES[k].corners + ' corners' + (k === 'square' ? ', all the same length.' : '.'), 'It is a ' + k + '.'],
        hint: 'Count the corners.' };
    }
    if (L === 2) {
      var form = R.pick(['corners', 'sides', 'turned']);
      if (form === 'turned') { // the trouble spot: a square turned on its corner is still a square
        return { q: READ + big(R.pick(['This square is turned on its corner. What shape is it now?', who(R) + ' turned a square on its corner. What shape is it now?'])), viz: shapes(['square'], { rotate: { 0: 45 }, fill: crayon(R) }), a: mc(['Still a square', 'A new shape that is not a square', 'A circle'], 0),
          steps: ['Turning a shape does not change it.', 'It still has 4 sides that are all the same length and 4 corners.', 'So it is still a square.'], hint: 'Did any side change length when it turned?' };
      }
      var s = R.pick(['square', 'triangle', 'circle']), n = form === 'corners' ? Ak.SHAPES[s].corners : Ak.SHAPES[s].sides, opts2 = ['0', '3', '4'];
      return { q: READ + big('How many ' + form + ' does a ' + s + ' have?'), viz: shapes([s], { rotate: { 0: s === 'circle' ? 0 : R.pick([0, 0, 15, -15]) }, fill: crayon(R) }), a: mc(opts2, opts2.indexOf(String(n))),
        steps: s === 'circle' ? ['A circle is round all the way around.', 'It has no straight sides and no corners: 0.'] : ['Count them one at a time with your finger.', 'A ' + s + ' has ' + n + ' ' + form + '.'], hint: 'Touch each one as you count.' };
    }
    if (R.coin()) { // what shape is a part of a drawing?
      var D = R.pick([['house', 'roof'], ['house', 'walls'], ['house', 'window'], ['cat', 'head'], ['cat', 'ear'], ['snowman', 'head'], ['car', 'wheel'], ['owl', 'eye'], ['sun', 'sun']]), shp = Ak.partShape(D[0], D[1]);
      var opts3 = B3.slice();
      return { q: READ + big('What shape is the part with the "?"' + (D[0] === 'sun' ? '' : ' (the ' + D[1] + ')') + '?'), viz: { name: 'ar-shapes', opts: { draw: D[0], ask: D[1], quiet: true, interactive: false, big: true, label: 'A drawing made of shapes, with a question mark on one part' } },
        a: mc(opts3.map(cap), opts3.indexOf(shp)), steps: ['Look at the part with the question mark.', 'The ' + D[1] + ' is a ' + shp + '.'], hint: 'Count its corners.' };
    }
    var drawK = R.pick(['house', 'snowman', 'car', 'owl', 'cat']), want = R.pick(drawK === 'snowman' ? ['circle'] : drawK === 'house' ? ['square', 'triangle'] : drawK === 'car' ? ['circle', 'square'] : ['circle', 'triangle']);
    var count = Ak.drawingCount(drawK, want), opts4 = [String(count), String(count + 1), String(M2(count))];
    opts4 = opts4.filter(function (v, i, a) { return a.indexOf(v) === i; }); while (opts4.length < 3) opts4.push(String(count + opts4.length + 1));
    opts4.sort(function (a, b) { return a - b; });
    return { q: READ + big('How many ' + want + 's are in this drawing of ' + Ak.DRAWINGS[drawK].name + '?'), viz: { name: 'ar-shapes', opts: { draw: drawK, quiet: true, interactive: false, big: true, label: 'A drawing made of shapes' } },
      a: mc(opts4, opts4.indexOf(String(count))), steps: ['Touch each ' + want + ' as you count.', 'There ' + (count === 1 ? 'is 1 ' + want : 'are ' + count + ' ' + want + 's') + '.'], hint: 'Count big ones and small ones.' };
  });
  function M2(n) { return n > 1 ? n - 1 : n + 2; }

  /* =====================================================================================================================
     The other 34 topics (course builder). Same pattern as the model topics above: READ + big(question), mc answers with
     keep: true for lettered pictures, quiet pictures from the kit or from the course visuals in static/art/viz/ydraw.js
     (ydraw-person, ydraw-face, ydraw-row, ydraw-scene, ydraw-things, ydraw-oops). Every fact a question depends on is
     passed to the picture in its opts (a count, a part, a side, which picture is right), so the picture and the answer agree.
     ===================================================================================================================== */
  var LET3 = ['A', 'B', 'C'], LET2 = ['A', 'B'];
  // shape names for young artists, and the near misses a child really makes
  var SHN = { circle: 'circle', square: 'square', triangle: 'triangle', rectangle: 'rectangle', oval: 'oval', diamond: 'diamond', star: 'star', heart: 'heart', semicircle: 'half circle', hexagon: 'hexagon' };
  var NEAR = { circle: 'oval', oval: 'circle', rectangle: 'square', square: 'diamond', diamond: 'square', triangle: 'diamond', semicircle: 'circle', heart: 'circle', star: 'triangle' };
  var SH_POOL = ['circle', 'square', 'triangle', 'rectangle', 'oval'];
  // never offer "rectangle" when the answer is a square (a square is a special rectangle)
  function shapeOpts(R, right, n, near, pool) {
    pool = (pool || SH_POOL).filter(function (k) { return k !== right && !(right === 'square' && k === 'rectangle'); });
    var out = [right];
    if (near && NEAR[right] && pool.indexOf(NEAR[right]) >= 0) out.push(NEAR[right]);
    var rest = pool.filter(function (k) { return out.indexOf(k) < 0 && (near || (k !== NEAR[right] && NEAR[k] !== right)); });
    out = out.concat(R.sample(rest, n - out.length));
    return R.shuffle(out);
  }
  function shapeMc(opts, right) { return mc(opts.map(function (k) { return cap(SHN[k]); }), opts.indexOf(right)); }
  function an(word) { return (/^[aeiou]/i.test(word) ? 'an ' : 'a ') + word; }
  function swatch(hexes, extra) { return { name: 'ydraw-paint', opts: Object.assign({ colors: hexes, quiet: true, interactive: false, big: true, label: hexes.length > 1 ? 'Blobs of paint, lettered' : 'A blob of paint' }, extra || {}) }; }
  function drawingAsk(key, role) { return { name: 'ar-shapes', opts: { draw: key, ask: role, quiet: true, interactive: false, big: true, label: 'A drawing made of shapes, with a question mark on one part' } }; }
  function drawingPic(key) { return { name: 'ar-shapes', opts: { draw: key, quiet: true, interactive: false, big: true, label: 'A drawing made of shapes' } }; }
  function thingsPic(items, extra) { return { name: 'ydraw-things', opts: Object.assign({ items: items, quiet: true, interactive: false, big: true, columns: items.length, label: items.length > 1 ? 'Pictures, lettered' : 'A picture' }, extra || {}) }; }
  function oopsPic(key, good) { return { name: 'ydraw-oops', opts: { oops: key, good: good, quiet: true, interactive: false, big: true, label: 'Two drawings, A and B' } }; }
  // three numbers around n for "how many" questions, sorted, n included
  function countOpts(R, n, k) {
    k = k || 3; var c = [n], tries = [n - 1, n + 1, n - 2, n + 2];
    if (k === 2) c.push(R.pick(n > 2 ? [n - 2, n + 2] : [n + 2]));
    else { var lo = R.pick(n > 1 ? [n - 1, n - 2] : [n + 2]); if (lo < 1) lo = n + 2; c.push(lo); tries.forEach(function (t) { if (c.length < k && t > 0 && c.indexOf(t) < 0) c.push(t); }); }
    return c.sort(function (a, b) { return a - b; }).map(String);
  }
  function plural(n, a, b) { return n + ' ' + (n === 1 ? a : (b || a + 's')); }
  // a question from a little bank of read-aloud facts: { q, c: [right, wrong…], s: steps, h: hint }; the right answer is c[0]
  function bank(R, list) {
    var Q = R.pick(list), nm = who(R), order = R.shuffle(Q.c.map(function (c, i) { return i; }));
    var fill = function (s) { return String(s).replace(/NAME/g, nm); };
    return { q: READ + big(fill(Q.q)), a: mc(order.map(function (i) { return fill(Q.c[i]); }), order.indexOf(0), false), steps: Q.s.map(fill), hint: fill(Q.h), viz: Q.viz };
  }

  // ---------------------------------------------------------------- ydraw.more-shapes
  var MORE = ['rectangle', 'oval', 'diamond', 'star', 'heart', 'semicircle'];
  // things whose plain shape a child can see (ydraw-things draws them; MathLadder.ydraw.THINGS agrees)
  var OBJ_SHAPE = { clock: 'circle', ball: 'circle', door: 'rectangle', book: 'rectangle', pizza: 'triangle', tent: 'triangle', egg: 'oval', kite: 'diamond', sign: 'diamond',
    window: 'square', gift: 'square', watermelon: 'semicircle', cookie: 'heart', starfish: 'star' };
  var OBJ_NAME = { clock: 'clock', ball: 'beach ball', door: 'door', book: 'book', pizza: 'slice of pizza', tent: 'tent', egg: 'egg', kite: 'kite', sign: 'road sign', window: 'window', gift: 'gift box', watermelon: 'slice of watermelon', cookie: 'cookie', starfish: 'starfish' };
  G('ydraw.more-shapes', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var k = R.pick(['rectangle', 'oval', 'star', 'heart', 'diamond']), o = shapeOpts(R, k, 2, false, MORE.concat(['circle', 'square', 'triangle']));
      return { q: READ + big(R.pick(['What shape is this?', who(R) + ' cut out this shape. What shape is it?'])), viz: shapes([k], { fill: crayon(R) }), a: shapeMc(o, k),
        steps: [{ rectangle: 'It has 4 corners, with 2 long sides and 2 short sides.', oval: 'It is round like a stretched circle, with no corners.', star: 'It has 5 points.', heart: 'It has two round bumps on top and a point at the bottom.', diamond: 'It has 4 sides that are all the same length, and it stands on a point.' }[k], 'It is ' + an(SHN[k]) + '.'],
        hint: 'Look at the corners and the sides.' };
    }
    if (L === 2) {
      var form = R.pick(['rect', 'rect', 'oval', 'which']);
      if (form === 'rect') { // the trouble spot: every four-sided shape is not a square
        return { q: READ + big('Look at the sides. Is this a square or a rectangle?'), viz: shapes(['rectangle'], { fill: crayon(R), rotate: { 0: R.pick([0, 0, 90, 10, -10]) } }), a: mc(['A square', 'A rectangle', 'A triangle'], 1),
          steps: ['It has 4 sides and 4 corners.', 'Two sides are long and two sides are short.', 'A square has 4 sides the same length, so this is a rectangle.'], hint: 'Are all 4 sides the same length?' };
      }
      if (form === 'oval') {
        var ks = R.shuffle(['circle', 'oval', R.pick(['square', 'triangle', 'heart'])]);
        return { q: READ + big('Which shape is an oval, like a circle stretched long?'), viz: shapes(ks, { colors: crayon(R, 3) }), a: mc(LET3, ks.indexOf('oval')),
          steps: ['A circle is round and the same all the way across.', 'An oval is a stretched circle, longer one way, like an egg.', 'Shape ' + letter(ks.indexOf('oval')) + ' is the oval.'], hint: 'Find the round shape that is longer one way.' };
      }
      var want = R.pick(['rectangle', 'star', 'heart', 'diamond', 'semicircle']), others = R.sample(MORE.filter(function (q) { return q !== want; }), 2), ks2 = R.shuffle([want].concat(others));
      return { q: READ + big('Which shape is ' + an(SHN[want]) + '?'), viz: shapes(ks2), a: mc(LET3, ks2.indexOf(want)),
        steps: ks2.map(function (q, i) { return letter(i) + ' is ' + an(SHN[q]) + '.'; }), hint: { rectangle: 'Two long sides and two short sides.', star: 'Look for the points.', heart: 'Two bumps and a point.', diamond: 'Four equal sides, standing on a point.', semicircle: 'Half of a circle has one straight side.' }[want] };
    }
    var f3 = R.pick(['obj', 'obj', 'points', 'sides']);
    if (f3 === 'points') { var n = Ak.SHAPES.star.points; return { q: READ + big('How many points does this star have?'), viz: shapes(['star'], { fill: crayon(R) }), a: mc(['4', '5', '6'], ['4', '5', '6'].indexOf(String(n))), steps: ['Touch each point and count.', 'This star has ' + n + ' points.'], hint: 'Start at the top point and go around.' }; }
    if (f3 === 'sides') {
      return { q: READ + big('Which shape has 2 long sides and 2 short sides?'), a: mc(['A rectangle', 'A square', 'A triangle'], 0, false),
        steps: ['A square has 4 sides that are all the same length.', 'A triangle has 3 sides.', 'A rectangle has 2 long sides and 2 short sides.'], hint: 'Think of a door or a book.' };
    }
    var t = R.pick(['door', 'book', 'egg', 'kite', 'sign', 'cookie', 'watermelon']), sh = OBJ_SHAPE[t], o3 = shapeOpts(R, sh, 3, true, MORE.concat(['circle', 'square', 'triangle']));
    return { q: READ + big('What shape is this ' + OBJ_NAME[t] + '?'), viz: thingsPic([t]), a: shapeMc(o3, sh), steps: ['Trace the outside of the ' + OBJ_NAME[t] + ' with your finger.', 'Its shape is ' + an(SHN[sh]) + '.'], hint: 'Look only at the outside edge.' };
  });

  // ---------------------------------------------------------------- ydraw.shapes-in-things
  var ASK_PARTS = [['house', 'roof'], ['house', 'walls'], ['house', 'door'], ['house', 'window'], ['car', 'wheel'], ['car', 'body'], ['cat', 'head'], ['cat', 'ear'], ['cat', 'body'],
    ['snowman', 'head'], ['owl', 'eye'], ['owl', 'beak'], ['owl', 'body'], ['fish', 'body'], ['fish', 'tail'], ['bird', 'beak'], ['bird', 'head'], ['train', 'wheel'], ['train', 'cab'], ['tree', 'trunk'], ['flower', 'center']];
  G('ydraw.shapes-in-things', function (R, ctx) {
    var L = ctx.level || 1, Ak = A(), keys = Object.keys(OBJ_SHAPE);
    if (L <= 2) {
      var t = R.pick(keys), sh = OBJ_SHAPE[t], o = shapeOpts(R, sh, L === 1 ? 2 : 3, L === 2, ['circle', 'square', 'triangle', 'rectangle', 'oval', 'diamond', 'star', 'heart', 'semicircle']);
      return { q: READ + big(R.pick(['What shape do you see in this ' + OBJ_NAME[t] + '?', who(R) + ' wants to draw this ' + OBJ_NAME[t] + '. What shape should come first?'])), viz: thingsPic([t]), a: shapeMc(o, sh),
        steps: ['Look at the outside edge of the ' + OBJ_NAME[t] + '.', 'It is ' + an(SHN[sh]) + '.'], hint: L === 2 && NEAR[sh] ? 'Look closely: ' + an(SHN[sh]) + ' and ' + an(SHN[NEAR[sh]]) + ' can look alike.' : 'Trace the edge with your finger.' };
    }
    if (R.coin()) {
      var D = R.pick(ASK_PARTS), shp = Ak.partShape(D[0], D[1]), o2 = shapeOpts(R, shp, 3, false);
      return { q: READ + big('Look at this drawing of ' + Ak.DRAWINGS[D[0]].name + '. What shape is the part with the "?"' + (D[1] === 'center' ? '' : ' (the ' + D[1] + ')') + '?'), viz: drawingAsk(D[0], D[1]), a: shapeMc(o2, shp),
        steps: ['Find the question mark.', 'The ' + D[1] + ' is ' + an(SHN[shp]) + '.'], hint: 'Count its corners, or see if it is round.' };
    }
    var want = R.pick(['circle', 'rectangle', 'triangle', 'oval', 'diamond', 'square']), hit = R.pick(keys.filter(function (k) { return OBJ_SHAPE[k] === want; }));
    var bad = keys.filter(function (k) { var s = OBJ_SHAPE[k]; return s !== want && s !== NEAR[want] && NEAR[s] !== want && !(want === 'rectangle' && s === 'square') && !(want === 'square' && s === 'rectangle'); });
    var list = R.shuffle([hit].concat(R.sample(bad, 2)));
    return { q: READ + big('Which thing is shaped like ' + an(SHN[want]) + '?'), viz: thingsPic(list), a: mc(LET3, list.indexOf(hit)),
      steps: list.map(function (k, i) { return letter(i) + ': the ' + OBJ_NAME[k] + ' is ' + an(SHN[OBJ_SHAPE[k]]) + '.'; }).concat(['So the answer is ' + letter(list.indexOf(hit)) + '.']), hint: 'Trace the edge of each thing.' };
  });

  // ---------------------------------------------------------------- ydraw.free-shapes
  var GEO = ['circle', 'square', 'triangle', 'rectangle', 'star', 'diamond'], ORG = ['leaf', 'cloud', 'puddle', 'blob', 'flame'];   // smooth near-geometric curves (oval, heart, the kit's pebble) left out so the two kinds are easy to tell apart
  var NEAT = 'A neat shape (geometric)', FREE = 'A free shape (organic)';
  G('ydraw.free-shapes', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    var sname = function (k) { return Ak.SHAPES[k].name.replace(/ \(.*\)/, ''); };
    if (L === 1) {
      var free = R.coin(), k = R.pick(free ? ORG : GEO);
      return { q: READ + big(R.pick(['Is this a neat shape or a free shape?', who(R) + ' drew this shape. Is it neat or free?'])), viz: shapes([k]), a: mc([NEAT, FREE], free ? 1 : 0),
        steps: [free ? 'Its edge curves in an uneven way, like ' + an(sname(k)) + ' in nature.' : 'Its sides are straight, or its curve is even all the way around.', free ? 'So it is a free (organic) shape.' : 'So it is a neat (geometric) shape.'], hint: 'Are the edges straight and even, or uneven like a cloud?' };
    }
    if (L === 2) {
      var wantFree = R.coin(), one = R.pick(wantFree ? ORG : GEO), two = R.sample(wantFree ? GEO : ORG, 2), ks = R.shuffle([one].concat(two));
      return { q: READ + big('Which one is a ' + (wantFree ? 'free (organic)' : 'neat (geometric)') + ' shape?'), viz: shapes(ks), a: mc(LET3, ks.indexOf(one)),
        steps: ks.map(function (q, i) { return letter(i) + ': ' + (Ak.SHAPES[q].kind === 'organic' ? 'free' : 'neat') + '.'; }).concat(['Only ' + letter(ks.indexOf(one)) + ' is ' + (wantFree ? 'free.' : 'neat.')]), hint: 'Free shapes curve in uneven ways, like a cloud or a puddle.' };
    }
    return bank(R, [
      { q: 'Is the shape of a puddle neat or free?', c: ['Free (organic)', 'Neat (geometric)'], s: ['A puddle has a wobbly, uneven edge.', 'So it is a free shape.'], h: 'Is its edge even?' },
      { q: 'Is the shape of a cloud neat or free?', c: ['Free (organic)', 'Neat (geometric)'], s: ['A cloud is bumpy and every cloud is different.', 'So it is a free shape.'], h: 'Think of a fluffy cloud.' },
      { q: 'Is the shape of a leaf neat or free?', c: ['Free (organic)', 'Neat (geometric)'], s: ['A leaf grows in a natural, curvy shape.', 'So it is a free shape.'], h: 'Leaves grow on plants.' },
      { q: 'Is the shape of a slice of pizza neat or free?', c: ['Neat (geometric)', 'Free (organic)'], s: ['A slice of pizza is a triangle.', 'A triangle is a neat shape.'], h: 'What shape is a slice?' },
      { q: 'Is the shape of a door neat or free?', c: ['Neat (geometric)', 'Free (organic)'], s: ['A door is a rectangle with straight sides.', 'So it is a neat shape.'], h: 'Look at the sides of a door.' },
      { q: 'NAME drew a cloud. It has no name like "circle." Is it still a shape?', c: ['Yes, it is a free shape', 'No, it is not a shape'], s: ['A line that goes all the way around makes a shape.', 'A shape does not need a name. A cloud is a free shape.'], h: 'Does the line go all the way around?' },
      { q: 'Which one has a free shape?', c: ['A splash of paint', 'A square', 'A circle'], s: ['A square and a circle are neat shapes.', 'A splash of paint is bumpy and uneven: a free shape.'], h: 'Which one is bumpy?' }
    ]);
  });

  // ---------------------------------------------------------------- drawing from shapes: shared helpers
  // "What shape is the …?" on a kit drawing; L1 offers a plainly different shape, later levels three
  function partQ(R, key, role, n, near) {
    var Ak = A(), shp = Ak.partShape(key, role), o = shapeOpts(R, shp, n, near);
    return { q: READ + big(R.pick(['What shape is the ' + role + '?', who(R) + ' drew ' + Ak.DRAWINGS[key].name + '. What shape is the ' + role + ' (the "?")?'])), viz: drawingAsk(key, role), a: shapeMc(o, shp),
      steps: ['Find the question mark on the ' + role + '.', 'The ' + role + ' is ' + an(SHN[shp]) + '.'], hint: 'Count the corners, or see if it is round.' };
  }
  // "How many …s are in this drawing?"
  function countQ(R, key, shape, extra) {
    var Ak = A(), n = Ak.drawingCount(key, shape), o = countOpts(R, n);
    return { q: READ + big('How many ' + SHN[shape] + 's are in this drawing of ' + Ak.DRAWINGS[key].name + '?' + (extra || '')), viz: drawingPic(key), a: mc(o, o.indexOf(String(n))),
      steps: Ak.DRAWINGS[key].parts.filter(function (p) { return p.shape === shape; }).map(function (p, i) { return (i + 1) + ': the ' + p.role + '.'; }).concat(['There ' + (n === 1 ? 'is 1 ' + SHN[shape] : 'are ' + n + ' ' + SHN[shape] + 's') + '.']),
      hint: 'Touch each ' + SHN[shape] + ' as you count, big ones and small ones.' };
  }
  // A or B: which drawing is right (or which has the mistake)?
  var OOPS_NOUN = { 'cat-head': 'cats', 'fish-tail': 'fish', 'car-wheels': 'cars', 'train-wheels': 'trains', 'flower-petals': 'flowers' };
  function oopsQ(R, key, rightQ, wrongQ, rightStep, wrongStep, hint) {
    var good = R.pick(LET2), askRight = R.coin(), ans = askRight ? good : (good === 'A' ? 'B' : 'A'), lead = R.pick(['', who(R) + ' and ' + R.pick(['a friend', 'a cousin', 'a classmate']) + ' drew these ' + OOPS_NOUN[key] + '. ', 'Look at drawings A and B. ']);
    return { q: READ + big(lead + (askRight ? rightQ : wrongQ)), viz: oopsPic(key, good), a: mc(LET2, LET2.indexOf(ans)),
      steps: ['In ' + good + ', ' + rightStep + '.', 'In ' + (good === 'A' ? 'B' : 'A') + ', ' + wrongStep + '.', 'So the answer is ' + ans + '.'], hint: hint };
  }

  // ---------------------------------------------------------------- ydraw.draw-house
  G('ydraw.draw-house', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) return partQ(R, 'house', R.pick(['roof', 'walls', 'door']), 2, false);
    if (L === 2) {
      if (R.coin()) return partQ(R, 'house', R.pick(['door', 'window', 'roof']), 3, true);
      var o = R.shuffle(['The big walls', 'The little doorknob', 'The windows']);
      return { q: READ + big(R.pick(['You are going to draw a house. What should you draw first?', who(R) + ' is drawing a house. What should come first?'])), viz: drawingPic('house'), a: mc(o, o.indexOf('The big walls'), false),
        steps: ['Big shapes go first, so the drawing fits on the page.', 'The walls are the biggest shape.', 'Small things like windows and the doorknob come last.'], hint: 'Big shapes first, small things last.' };
    }
    return countQ(R, 'house', R.pick(['square', 'square', 'triangle', 'rectangle', 'circle']));
  });

  // ---------------------------------------------------------------- ydraw.draw-cat
  G('ydraw.draw-cat', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) return partQ(R, 'cat', R.pick(['head', 'ear', 'body']), 2, false);
    if (L === 2) return oopsQ(R, 'cat-head', 'Which cat has a body that is bigger than its head?', 'In which drawing is the cat\'s head too big?', 'the body is bigger than the head', 'the head is bigger than the body', 'Compare the round head with the oval body.');
    return R.coin() ? countQ(R, 'cat', R.pick(['triangle', 'circle'])) : bank(R, [
      { q: 'What do you draw first for a cat?', c: ['The big body and head', 'The whiskers', 'The eyes'], s: ['Start with the biggest shapes.', 'The body and head come first; small things like eyes and whiskers come last.'], h: 'Big shapes first.' },
      { q: 'Which is bigger on a cat: the head or the body?', c: ['The body', 'The head', 'They are the same size'], s: ['A cat\'s body is longer and bigger than its head.', 'So draw a big oval body and a smaller circle head.'], h: 'Think of a cat curled up asleep.' },
      { q: 'What kind of line makes a good cat tail?', c: ['A curved line', 'A zigzag line', 'A dotted line'], s: ['A tail bends smoothly.', 'A curved line bends smoothly.'], h: 'Does a tail have sharp points?' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.draw-fish-bird
  G('ydraw.draw-fish-bird', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) { var d = R.pick([['fish', 'body'], ['fish', 'tail'], ['bird', 'head'], ['bird', 'beak'], ['bird', 'body']]); return partQ(R, d[0], d[1], 2, false); }
    if (L === 2) return oopsQ(R, 'fish-tail', 'Which fish has its tail on the back end?', 'Which fish has its tail on the wrong end?', 'the tail is on the back end, away from the eye', 'the tail is on the same end as the eye', 'The eye is at the front. Where should the tail be?');
    if (R.coin()) return countQ(R, R.pick(['fish', 'bird']), 'triangle');
    var d3 = R.pick([['bird', 'beak'], ['fish', 'fin'], ['bird', 'tail'], ['fish', 'eye']]); return partQ(R, d3[0], d3[1], 3, true);
  });

  // ---------------------------------------------------------------- ydraw.draw-car
  G('ydraw.draw-car', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) { var d = R.pick([['car', 'wheel'], ['car', 'body'], ['train', 'wheel'], ['train', 'cab']]); return partQ(R, d[0], d[1], 2, false); }
    if (L === 2) {
      var train = R.coin();
      return oopsQ(R, train ? 'train-wheels' : 'car-wheels', train ? 'Which train has wheels that touch the track?' : 'Which car has wheels that touch the road?', train ? 'Which train has floating wheels?' : 'Which car has floating wheels?',
        'the wheels sit at the bottom and touch the ' + (train ? 'track' : 'road'), 'the wheels float up inside the ' + (train ? 'train' : 'car'), 'Wheels roll on the ground.');
    }
    return R.coin() ? countQ(R, 'train', R.pick(['circle', 'rectangle'])) : countQ(R, 'car', R.pick(['rectangle', 'square', 'circle']));
  });

  // ---------------------------------------------------------------- ydraw.draw-tree-flower
  G('ydraw.draw-tree-flower', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) { var d = R.pick([['tree', 'trunk'], ['flower', 'center'], ['flower', 'stem']]); return partQ(R, d[0], d[1], 2, false); }
    if (L === 2) return oopsQ(R, 'flower-petals', 'Which flower has petals all the way around the center?', 'Which flower has all its petals on one side?', 'the petals go all the way around', 'the petals are all on one side', 'Petals go around the center like a ring.');
    if (R.coin()) {
      var n = R.int(5, 8), o = countOpts(R, n);
      return { q: READ + big('How many petals does this flower have?'), viz: thingsPic([{ k: 'flower', n: n, color: R.pick(['#ef86b4', '#e04a3f', '#9a5ad6', '#ef8a1f']) }]), a: mc(o, o.indexOf(String(n))),
        steps: ['Start at the top petal and go around.', 'There are ' + n + ' petals.'], hint: 'Touch each petal as you count.' };
    }
    return bank(R, [
      { q: 'What kind of shape are the leaves of this tree?', c: ['A free, bumpy shape', 'A square', 'A triangle'], s: ['The leaves make one big bumpy shape, like a cloud.', 'That is a free (organic) shape.'], h: 'Is the edge bumpy?', viz: drawingPic('tree') },
      { q: 'Where do the petals go on a flower?', c: ['All the way around the center', 'Only on one side', 'Under the stem'], s: ['Petals grow around the middle of the flower.', 'Draw them all the way around, about the same size.'], h: 'Think of a daisy.' },
      { q: 'What shape is good for a tree trunk?', c: ['A tall rectangle', 'A circle', 'A star'], s: ['A trunk is tall and straight.', 'A tall rectangle works well.'], h: 'A trunk is long and stands up.' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.overlap
  var OV = [ // [back, front, front name, back name, dx, dy] (front drawn lower and overlapping)
    ['box', 'ball', 'the ball', 'the box'], ['house', 'tree', 'the tree', 'the house'], ['house', 'bush', 'the bush', 'the house'], ['mountain', 'house', 'the house', 'the mountain'], ['box', 'rock', 'the rock', 'the box']];
  var OV_S = { box: 1.5, ball: 1.4, house: 1.4, tree: 1.2, bush: 1.6, mountain: 1.1, rock: 1.5 };
  function ovScene(pair, flip, see) { // the back thing and the front thing, overlapping
    var bx = flip ? 116 : 84, fx = flip ? 84 : 116, it = [{ k: pair[0], x: bx, y: pair[0] === 'mountain' ? 122 : 128, s: OV_S[pair[0]] }, { k: pair[1], x: fx + (pair[1] === 'bush' || pair[1] === 'rock' ? (flip ? 8 : -8) : 0), y: 140, s: OV_S[pair[1]] }];
    if (pair[0] === 'mountain') it[0].x = flip ? 120 : 80;
    return { ground: 116, sky: 'full', items: it, seeThrough: !!see };
  }
  G('ydraw.overlap', function (R, ctx) {
    var L = ctx.level || 1, pair = R.pick(OV), flip = R.coin();
    if (L === 1) {
      var askFront = R.coin(), o = R.shuffle([pair[2], pair[3]]), ans = askFront ? pair[2] : pair[3];
      return { q: READ + big('Which is ' + (askFront ? 'in front' : 'behind') + ': ' + o[0] + ' or ' + o[1] + '?'), viz: { name: 'ydraw-scene', opts: { scene: ovScene(pair, flip), quiet: true, interactive: false, big: true, label: 'A picture of two things, one in front of the other' } },
        a: mc(o.map(cap), o.indexOf(ans)), steps: [cap(pair[2]) + ' is drawn whole.', 'Part of ' + pair[3] + ' is hidden behind it.', 'So ' + ans + ' is ' + (askFront ? 'in front.' : 'behind.')], hint: 'Which one is hidden a little?' };
    }
    if (L === 2) {
      var good = R.pick(LET2), askRight = R.coin(), ans2 = askRight ? good : (good === 'A' ? 'B' : 'A');
      var sc = [ovScene(pair, flip, good !== 'A'), ovScene(pair, flip, good !== 'B')];
      return { q: READ + big(askRight ? 'Which picture shows ' + pair[2] + ' in front, with nothing showing through it?' : 'In which picture does ' + pair[2] + ' look see-through?'), viz: { name: 'ydraw-scene', opts: { scenes: sc, quiet: true, interactive: false, big: true, label: 'Two pictures, A and B' } },
        a: mc(LET2, LET2.indexOf(ans2)), steps: ['In ' + good + ', the line of ' + pair[3] + ' stops where ' + pair[2] + ' begins.', 'In ' + (good === 'A' ? 'B' : 'A') + ', ' + pair[3] + ' is drawn whole, so its lines show through ' + pair[2] + '.', 'So the answer is ' + ans2 + '.'],
        hint: 'Look for lines that cross over the front thing.' };
    }
    // three things in a row, each partly hiding the one behind it
    var trio = R.pick([['house', 'tree', 'bush', 'the house', 'the tree', 'the bush'], ['mountain', 'house', 'bush', 'the mountain', 'the house', 'the bush'], ['house', 'box', 'ball', 'the house', 'the box', 'the ball']]);
    var tags = R.shuffle(LET3), dir = R.coin() ? 1 : -1, S = { house: 1.3, tree: 1.1, bush: 1.4, mountain: 1.2, box: 1.2, ball: 1.2 };
    var its = [0, 1, 2].map(function (i) { return { k: trio[i], x: 100 + dir * (i - 1) * 22 + (trio[i] === 'mountain' ? -dir * 10 : 0), y: [118, 130, 142][i], s: S[trio[i]], tag: tags[i] }; });
    var askBack = R.coin(), idx = askBack ? 0 : 2;
    return { q: READ + big('Which one is ' + (askBack ? 'behind both of the others' : 'in front of both of the others') + '?'), viz: { name: 'ydraw-scene', opts: { scene: { sky: 'full', ground: 108, items: its }, quiet: true, interactive: false, big: true, label: 'A picture of three things with letters' } },
      a: mc(LET3, LET3.indexOf(tags[idx])), steps: [cap(trio[5]) + ' (' + tags[2] + ') is whole: it is in front.', cap(trio[4]) + ' (' + tags[1] + ') hides part of ' + trio[3] + '.', cap(trio[3]) + ' (' + tags[0] + ') is partly hidden: it is at the back.', 'So the answer is ' + tags[idx] + '.'],
      hint: 'The thing in front is drawn whole.' };
  });

  // ---------------------------------------------------------------- colors: shared
  var KNAME = { red: 'red', orange: 'orange', yellow: 'yellow', green: 'green', blue: 'blue', violet: 'purple' };   // the painter's wheel's "violet" is "purple" for young artists
  function kname(k) { return KNAME[k] || k; }
  function hexOf(k) { return A().hue(k).hex; }

  // ---------------------------------------------------------------- ydraw.rainbow
  G('ydraw.rainbow', function (R, ctx) {
    var L = ctx.level || 1, RB = A().RAINBOW;
    var rname = function (k) { return k === 'violet' ? 'violet (purple)' : k; };
    if (L <= 2) {
      var i = R.int(0, 5), k = RB[i], others = RB.filter(function (q) { return q !== k; }), wrong;
      if (L === 1) wrong = [R.pick(others.filter(function (q) { return Math.abs(RB.indexOf(q) - i) > 1; }))];
      else wrong = [RB[i === 0 ? 2 : i - 1], RB[i === 5 ? 3 : i + 1]];
      var o = R.shuffle([k].concat(wrong));
      return { q: READ + big(R.pick(['One color is missing from this rainbow. Which color goes in the empty band?', 'Which color is missing from the rainbow?'])), viz: { name: 'ar-wheel', opts: { mode: 'rainbow', blank: i, quiet: true, interactive: false, big: true, label: 'A rainbow with one band missing' } },
        a: mc(o.map(function (q) { return cap(rname(q)); }), o.indexOf(k)),
        steps: ['A rainbow goes red, orange, yellow, green, blue, violet, from the outside in.', i === 0 ? 'The missing band is on the outside edge, before orange.' : 'The missing band comes right after ' + RB[i - 1] + '.', 'So it is ' + rname(k) + '.'], hint: 'Say the rainbow colors in order: red, orange, yellow…' };
    }
    if (R.coin()) {
      var outside = R.coin(), o2 = R.shuffle(['red', 'violet', 'green']), ans = outside ? 'red' : 'violet';
      return { q: READ + big('Which color is on the ' + (outside ? 'outside' : 'inside') + ' edge of a rainbow?'), a: mc(o2.map(function (q) { return cap(rname(q)); }), o2.indexOf(ans)),
        steps: ['Red is always on the outside edge of a rainbow.', 'Violet is always on the inside edge.', 'So the answer is ' + rname(ans) + '.'], hint: 'Red is on the outside, the biggest band.' };
    }
    var j = R.int(0, 4), nx = RB[j + 1], o3 = R.shuffle([nx].concat(R.sample(RB.filter(function (q, x) { return x !== j + 1 && x !== j; }), 2)));
    return { q: READ + big('In a rainbow, which color comes right after ' + RB[j] + '?'), a: mc(o3.map(function (q) { return cap(rname(q)); }), o3.indexOf(nx)),
      steps: ['The order is red, orange, yellow, green, blue, violet.', 'Right after ' + RB[j] + ' comes ' + rname(nx) + '.'], hint: 'Say the colors in order from red.' };
  });

  // ---------------------------------------------------------------- ydraw.primary-colors
  G('ydraw.primary-colors', function (R, ctx) {
    var L = ctx.level || 1, Ak = A(), six = ['red', 'yellow', 'blue', 'orange', 'green', 'violet'];
    var isP = function (k) { return Ak.PRIMARIES.indexOf(k) >= 0; };
    if (L === 1) {
      var k = R.pick(six);
      return { q: READ + big(R.pick(['Is ' + kname(k) + ' a primary color in paint?', who(R) + ' has a pot of ' + kname(k) + ' paint. Is ' + kname(k) + ' a primary color?', 'Look at this ' + kname(k) + ' paint. Is it a primary color?'])), viz: swatch([hexOf(k)]), a: mc(['Yes', 'No'], isP(k) ? 0 : 1),
        steps: ['The primary colors in paint are red, yellow and blue.', isP(k) ? cap(kname(k)) + ' is one of them.' : cap(kname(k)) + ' is not. It can be mixed from two primary colors.'], hint: 'The three primaries are red, yellow and blue.' };
    }
    if (L === 2) {
      if (R.coin()) {
        var sec = R.pick(Ak.SECONDARIES), ks0 = R.shuffle([sec].concat(R.sample(Ak.PRIMARIES, 2)));
        return { q: READ + big(R.pick(['Which color is NOT a primary color in paint?', who(R) + ' has three paints. Which one is not a primary color?'])), viz: swatch(ks0.map(hexOf)), a: mc(LET3, ks0.indexOf(sec)),
          steps: ks0.map(function (q, i) { return letter(i) + ' is ' + kname(q) + (isP(q) ? ': a primary color.' : ': not a primary. It can be mixed.'); }), hint: 'The primaries are red, yellow and blue.' };
      }
      var p = R.pick(Ak.PRIMARIES), ks = R.shuffle([p, 'green', R.pick(['orange', 'violet'])]);
      return { q: READ + big(R.pick(['Which color is a primary color in paint?', who(R) + ' wants a primary color. Which paint fits?'])), viz: swatch(ks.map(hexOf)), a: mc(LET3, ks.indexOf(p)),
        steps: ks.map(function (q, i) { return letter(i) + ' is ' + kname(q) + (isP(q) ? ': a primary color.' : ': not a primary color.'); }), hint: 'Green is not a primary in paint. You can mix it.' };
    }
    return bank(R, [
      { q: 'Which group is all primary colors in paint?', c: ['Red, yellow and blue', 'Red, yellow and green', 'Orange, green and purple'], s: ['In paint, the primary colors are red, yellow and blue.', 'Green, orange and purple can be mixed from them.'], h: 'Is green in the group?' },
      { q: 'Green paint can be mixed from yellow and blue. Is green a primary color in paint?', c: ['No', 'Yes'], s: ['A primary color cannot be mixed from other paint colors.', 'Green can be mixed, so it is not a primary in paint.'], h: 'Can you make it by mixing?' },
      { q: 'How many primary colors are there in paint?', c: ['3', '2', '6'], s: ['Red, yellow and blue.', 'That is 3 primary colors.'], h: 'Count red, yellow and blue.' },
      { q: 'NAME has only red, yellow and blue paint. Can NAME paint a green frog?', c: ['Yes, by mixing yellow and blue', 'No, green paint is needed'], s: ['Yellow and blue mix to make green.', 'So the primary colors are enough.'], h: 'What do yellow and blue make?' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.mixing-colors
  var MIXES = [['red', 'yellow'], ['yellow', 'blue'], ['red', 'blue']];
  G('ydraw.mixing-colors', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L <= 2) {
      var pr = R.shuffle(R.pick(MIXES)), m = Ak.mixPaint(pr[0], pr[1]).key, all = ['orange', 'green', 'violet'];
      var o = L === 1 ? R.shuffle([m, R.pick(all.filter(function (q) { return q !== m; }))]) : R.shuffle(all);
      return { q: READ + big(R.pick(['What color do ' + kname(pr[0]) + ' and ' + kname(pr[1]) + ' paint make?', who(R) + ' mixes ' + kname(pr[0]) + ' and ' + kname(pr[1]) + ' paint. What color does it make?'])),
        viz: { name: 'ar-wheel', opts: { mode: 'mix', a: pr[0], b: pr[1], quiet: true, hideResult: true, interactive: false, big: true, label: kname(pr[0]) + ' paint plus ' + kname(pr[1]) + ' paint' } },
        a: mc(o.map(function (q) { return cap(kname(q)); }), o.indexOf(m)), steps: [cap(kname(pr[0])) + ' and ' + kname(pr[1]) + ' are primary colors.', 'Mixed together, they make ' + kname(m) + '.'],
        hint: 'Red and yellow make orange, yellow and blue make green, red and blue make purple.' };
    }
    if (R.coin()) {
      var want = R.pick(['orange', 'green', 'violet']), pair = MIXES.filter(function (q) { return Ak.mixPaint(q[0], q[1]).key === want; })[0];
      var o2 = R.shuffle(MIXES.map(function (q) { return cap(kname(q[0])) + ' and ' + kname(q[1]); })), ans = cap(kname(pair[0])) + ' and ' + kname(pair[1]);
      return { q: READ + big('Which two paint colors mix to make ' + kname(want) + '?'), viz: swatch([hexOf(want)]), a: mc(o2, o2.indexOf(ans)),
        steps: [cap(kname(want)) + ' is a secondary color.', 'It is made from ' + kname(pair[0]) + ' and ' + kname(pair[1]) + '.'], hint: 'Which two primaries sit on each side of it on the color wheel?' };
    }
    return bank(R, [
      { q: 'NAME stirs every paint color together. What happens?', c: ['It turns a muddy brown', 'It turns a bright rainbow', 'It turns white'], s: ['Each color you add makes the mix duller.', 'Stir them all together and you get a muddy brown.'], h: 'Think of a messy paint water jar.' },
      { q: 'You painted with blue. Now you want yellow. What should you do first?', c: ['Rinse the brush', 'Dip it straight into the yellow'], s: ['Blue left on the brush would turn the yellow green.', 'Rinse the brush between colors.'], h: 'What would blue do to yellow?' },
      { q: 'How many colors should you mix at a time to get a bright new color?', c: ['Two', 'All of them'], s: ['Two primary colors make a bright secondary color.', 'Mixing many colors makes mud.'], h: 'Red and yellow make orange.' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.warm-cool
  var WARM3 = ['red', 'orange', 'yellow'], COOL3 = ['blue', 'green', 'violet'];
  G('ydraw.warm-cool', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var k = R.pick(WARM3.concat(COOL3)), t = Ak.temperature(k);
      return { q: READ + big('Is this color warm or cool?'), viz: swatch([hexOf(k)]), a: mc(['Warm', 'Cool'], t === 'warm' ? 0 : 1),
        steps: ['This is ' + kname(k) + '.', t === 'warm' ? cap(kname(k)) + ' reminds us of fire and the sun: a warm color.' : cap(kname(k)) + ' reminds us of water, sky and leaves: a cool color.'], hint: 'Fire and sun are warm. Water and leaves are cool.' };
    }
    if (L === 2) {
      var wantWarm = R.coin(), one = R.pick(wantWarm ? WARM3 : COOL3), two = R.sample(wantWarm ? COOL3 : WARM3, 2), ks = R.shuffle([one].concat(two));
      return { q: READ + big('Which color is ' + (wantWarm ? 'warm' : 'cool') + '?'), viz: swatch(ks.map(hexOf)), a: mc(LET3, ks.indexOf(one)),
        steps: ks.map(function (q, i) { return letter(i) + ' is ' + kname(q) + ': ' + Ak.temperature(q) + '.'; }), hint: 'Warm: red, orange, yellow. Cool: blue, green, purple.' };
    }
    return bank(R, [
      { q: 'Which group is all warm colors?', c: ['Red, orange and yellow', 'Blue, green and purple', 'Red, blue and green'], s: ['Red, orange and yellow look like fire and the sun.', 'They are the warm colors.'], h: 'Think of a campfire.' },
      { q: 'Which group is all cool colors?', c: ['Blue, green and purple', 'Red, orange and yellow', 'Yellow, blue and red'], s: ['Blue, green and purple look like water, leaves and shade.', 'They are the cool colors.'], h: 'Think of the sea.' },
      { q: 'NAME is painting a cold, snowy night. Which colors fit best?', c: ['Cool colors: blues and purples', 'Warm colors: reds and oranges'], s: ['A cold night feels like water and ice.', 'Cool colors show cold.'], h: 'Is snow warm or cool?' },
      { q: 'NAME is painting a campfire. Which colors fit best?', c: ['Warm colors: reds, oranges and yellows', 'Cool colors: blues and greens'], s: ['Fire is hot and bright.', 'Warm colors show heat.'], h: 'What color are flames?' },
      { q: 'Are warm colors the colors you like best?', c: ['No, warm and cool are about fire and water, not favorites', 'Yes, warm colors are your favorites'], s: ['Warm colors look like fire and sun. Cool colors look like water and leaves.', 'Your favorite color can be warm or cool.'], h: 'Warm is about heat.' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.lighter-darker
  G('ydraw.lighter-darker', function (R, ctx) {
    var L = ctx.level || 1, Ak = A(), k = R.pick(['red', 'blue', 'green', 'violet', 'orange', 'blue-green', 'red-orange']), base = hexOf(k);
    if (L === 1) {
      var lighter = R.coin();
      return { q: READ + big(R.pick(['You want to make this ' + kname(k) + ' paint ' + (lighter ? 'lighter' : 'darker') + '. What do you add?', who(R) + ' wants a ' + (lighter ? 'lighter' : 'darker') + ' ' + kname(k) + '. What should go in?'])), viz: swatch([base]), a: mc(['White', 'Black'], lighter ? 0 : 1),
        steps: [lighter ? 'White makes a color lighter.' : 'Black makes a color darker.', lighter ? 'So add white.' : 'So add a tiny bit of black.'], hint: 'White is light. Black is dark.' };
    }
    if (L === 2) {
      var pair = R.shuffle([['tint', Ak.tint(base, 0.5)], ['shade', Ak.shade(base, 0.45)]]), askL = R.coin(), want = askL ? 'tint' : 'shade', idx = pair[0][0] === want ? 0 : 1;
      var q = askL ? R.pick(['Which one has white mixed in?', 'Which one is the lighter ' + kname(k) + '?']) : R.pick(['Which one has black mixed in?', 'Which one is the darker ' + kname(k) + '?']);
      return { q: READ + big(q), viz: swatch(pair.map(function (p) { return p[1]; })), a: mc(LET2, idx),
        steps: ['White makes a color lighter. Black makes it darker.', letter(idx) + ' is ' + (askL ? 'lighter, so it has white in it.' : 'darker, so it has black in it.')], hint: 'Which one looks paler?' };
    }
    if (R.coin()) {
      var amts = R.shuffle([0.2, 0.45, 0.7]), hexes = amts.map(function (t) { return Ak.tint(base, t); }), most = amts.indexOf(0.7);
      return { q: READ + big('These are all ' + kname(k) + ' with some white mixed in. Which one has the most white?'), viz: swatch(hexes), a: mc(LET3, most),
        steps: ['More white makes the color lighter.', letter(most) + ' is the lightest, so it has the most white.'], hint: 'Find the palest one.' };
    }
    return bank(R, [
      { q: 'NAME wants a slightly darker green. How much black should NAME add?', c: ['A tiny bit at a time', 'A big blob all at once'], s: ['Black is very strong.', 'A big blob can turn the color almost black. Add a tiny bit at a time.'], h: 'Black is strong.' },
      { q: 'What do you get when you add white to red?', c: ['Pink, a lighter red', 'Dark red', 'Green'], s: ['White makes a color lighter.', 'Red with white is pink.'], h: 'White makes it lighter.' },
      { q: 'What do you get when you add white to blue?', c: ['Light blue', 'Dark blue', 'Orange'], s: ['White makes a color lighter.', 'Blue with white is light blue, like the sky.'], h: 'White makes it lighter.' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.color-wheel-kids
  var SIX = ['red', 'orange', 'yellow', 'green', 'blue', 'violet'];
  G('ydraw.color-wheel-kids', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    var wheel = { name: 'ar-wheel', opts: { segments: 6, quiet: true, interactive: false, big: true, label: 'A color wheel with six colors' } };
    if (L <= 2) {
      var k = R.pick(SIX), opp = Ak.complement(k), i = SIX.indexOf(k), nb = [SIX[(i + 1) % 6], SIX[(i + 5) % 6]];
      var o = L === 1 ? R.shuffle([opp, R.pick(nb)]) : R.shuffle([opp].concat(nb));
      return { q: READ + big('On the color wheel, which color is across from ' + kname(k) + '?'), viz: wheel, a: mc(o.map(function (q) { return cap(kname(q)); }), o.indexOf(opp)),
        steps: ['Put your finger on ' + kname(k) + '.', 'Go straight across the middle of the wheel.', 'You land on ' + kname(opp) + '.'], hint: 'Across means on the other side, not next door.' };
    }
    if (R.coin()) {
      var pairs = [['red', 'green'], ['blue', 'orange'], ['yellow', 'violet']], good = R.pick(pairs), bads = [['red', 'orange'], ['blue', 'green'], ['yellow', 'orange'], ['red', 'violet'], ['green', 'yellow']];
      var o2 = R.shuffle([good].concat(R.sample(bads, 2))).map(function (p) { return cap(kname(p[0])) + ' and ' + kname(p[1]); }), ans = cap(kname(good[0])) + ' and ' + kname(good[1]);
      return { q: READ + big('Which two colors are opposites on the color wheel?'), viz: wheel, a: mc(o2, o2.indexOf(ans)),
        steps: ['Opposites sit straight across from each other.', ans + ' are across from each other.'], hint: 'Red is across from green.' };
    }
    var j = R.pick([0, 2, 4]), a1 = SIX[j], a2 = SIX[(j + 2) % 6], mid = SIX[(j + 1) % 6], o3 = R.shuffle([mid].concat(R.sample(SIX.filter(function (q) { return q !== mid && q !== a1 && q !== a2; }), 2)));
    return { q: READ + big('On the color wheel, which color sits between ' + kname(a1) + ' and ' + kname(a2) + '?'), viz: wheel, a: mc(o3.map(function (q) { return cap(kname(q)); }), o3.indexOf(mid)),
      steps: [cap(kname(a1)) + ' and ' + kname(a2) + ' mix to make ' + kname(mid) + '.', 'So ' + kname(mid) + ' sits between them.'], hint: 'What do those two colors make when you mix them?' };
  });

  // ---------------------------------------------------------------- patterns: shared
  var PSHAPES = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'], PCOLS = ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink'];
  // n distinct motifs ('shape:color'), all different shapes and colors so they are easy to tell apart and to name
  function motifs(R, n) { var s = R.sample(PSHAPES, n), c = R.sample(PCOLS, n); return s.map(function (q, i) { return q + ':' + c[i]; }); }
  function mname(m) { return A().motifName(m); }
  // the smallest part that repeats (the period) of a row
  function period(seq) { for (var p = 1; p <= seq.length; p++) { var ok = true; for (var i = p; i < seq.length; i++) if (seq[i] !== seq[i - p]) { ok = false; break; } if (ok) return p; } return seq.length; }
  function rowViz(o) { return { name: 'ydraw-row', opts: Object.assign({ quiet: true, interactive: false, big: true, label: 'A row of shapes' }, o) }; }

  // ---------------------------------------------------------------- ydraw.repeating-patterns
  G('ydraw.repeating-patterns', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) { // a pattern and a row that does not repeat
      var core = R.pick(['AB', 'AB', 'ABC']), m = motifs(R, 4), pat = Ak.pattern(core, m, 6), mess;
      do { mess = [0, 1, 2, 3, 4, 5].map(function () { return R.pick(m); }); } while (period(mess) <= 3);
      var rows = R.coin() ? [pat, mess] : [mess, pat], ans = rows[0] === pat ? 0 : 1;
      return { q: READ + big(R.pick(['Which row is a pattern?', 'Which row repeats the same part again and again?'])), viz: rowViz({ rows: rows, label: 'Two rows of shapes, A and B' }), a: mc(LET2, ans),
        steps: ['Say each row out loud.', 'Row ' + letter(ans) + ' repeats: ' + Ak.PAT_CORES[core].map(function (i) { return mname(m[i]); }).join(', ') + ', again and again.', 'The other row never repeats the same way.'], hint: 'Does the same part come back again and again?' };
    }
    if (L === 2) { // how long is the part that repeats?
      var core2 = R.pick(['AB', 'ABB', 'AAB', 'ABC', 'AABB']), m2 = motifs(R, 3), n2 = Ak.PAT_CORES[core2].length * (core2.length === 2 ? 4 : 3) - (core2.length === 4 ? 4 : 0), seq = Ak.pattern(core2, m2, n2), p = period(seq);
      var o = ['2', '3', '4'];
      return { q: READ + big('How many pieces are in the part that repeats?'), viz: rowViz({ seq: seq }), a: mc(o, o.indexOf(String(p))),
        steps: ['Say the row out loud and listen for where it starts again.', 'The part that repeats is ' + seq.slice(0, p).map(mname).join(', ') + '.', 'That is ' + p + ' pieces.'], hint: 'Find where the row starts over.' };
    }
    // the trouble spot: the rule changes partway
    var core3 = R.pick(['AB', 'ABC', 'ABB']), m3 = motifs(R, 4), p3 = Ak.PAT_CORES[core3].length, n3 = core3 === 'AB' ? 8 : 9, row = Ak.pattern(core3, m3, n3), j = R.int(2 * p3, n3 - 1);
    var used = Ak.PAT_CORES[core3].map(function (i) { return m3[i]; }), swap = R.pick(used.filter(function (q) { return q !== row[j]; }).concat([m3[3]]));
    row = row.slice(); row[j] = swap;
    var others = R.sample([0, 1, 2, 3, 4, 5, 6, 7, 8].filter(function (x) { return x < n3 && x !== j; }), 2), o3 = [j].concat(others).sort(function (a, b) { return a - b; }).map(function (x) { return String(x + 1); });
    return { q: READ + big('One piece breaks the pattern. Which number is it on?'), viz: rowViz({ seq: row, numbers: true }), a: mc(o3, o3.indexOf(String(j + 1))),
      steps: ['The part that repeats is ' + used.map(mname).join(', ') + '.', 'Piece ' + (j + 1) + ' should be ' + an(mname(Ak.pattern(core3, m3, n3)[j])) + ', but it is ' + an(mname(swap)) + '.', 'So piece ' + (j + 1) + ' breaks the pattern.'],
      hint: 'Say the pattern out loud and point to each piece.' };
  });

  // ---------------------------------------------------------------- ydraw.what-comes-next
  G('ydraw.what-comes-next', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    var core = L === 1 ? 'AB' : L === 2 ? R.pick(['ABB', 'AAB', 'ABC']) : R.pick(['AABB', 'ABAC', 'ABCD', 'ABB', 'mid']);
    var mid = core === 'mid'; if (mid) core = R.pick(['ABC', 'ABB', 'AABB']);
    var m = motifs(R, 4), len = Ak.PAT_CORES[core].length, n = len * 2 + R.int(1, len), full = Ak.pattern(core, m, n + 1);
    var miss = mid ? R.int(len + 1, n - 1) : n, right = full[miss], seq = full.slice(0, mid ? n : n);
    var last = full[miss - 1], pool = Ak.PAT_CORES[core].map(function (i) { return m[i]; }).filter(function (q, i, a) { return a.indexOf(q) === i; }).concat([m[3]]);
    var choices = [right];
    if (L >= 2 && last !== right) choices.push(last); // the trouble spot: guessing from the last piece only
    pool.forEach(function (q) { if (choices.length < (L === 1 ? 2 : 3) && choices.indexOf(q) < 0) choices.push(q); });
    choices = R.shuffle(choices);
    var lets = choices.map(function (c, i) { return letter(i); });
    return { q: READ + big(mid ? 'Which piece goes in the empty box?' : R.pick(['What comes next?', who(R) + ' made this pattern. What comes next?'])), viz: rowViz({ seq: seq, missing: mid ? miss : 'next', choices: choices, label: 'A row of shapes with a missing piece, and lettered choices' }),
      a: mc(lets, choices.indexOf(right)),
      steps: ['The part that repeats is ' + full.slice(0, len).map(mname).join(', ') + '.', 'Keep saying it: the missing piece is ' + an(mname(right)) + '.', 'That is choice ' + letter(choices.indexOf(right)) + '.'],
      hint: 'Find the whole part that repeats, not just the last piece.' };
  });

  // ---------------------------------------------------------------- ydraw.nature-patterns
  var NAT = ['stripes', 'spots', 'scales', 'spiral', 'hexagons', 'rings'];
  var NAT_ON = { stripes: ['a zebra', 'a tiger'], spots: ['a leopard', 'a ladybug'], scales: ['a fish', 'a snake'], spiral: ['a snail shell'], hexagons: ['a honeycomb'], rings: ['a tree stump'] };
  // living things for "which one has…?" whose main pattern is clearly not the asked one
  var NAT_NOT = { stripes: ['a ladybug', 'a honeycomb', 'a leopard'], spots: ['a zebra', 'a honeycomb', 'a tree stump'], scales: ['a zebra', 'a ladybug', 'a honeycomb'],
    spiral: ['a zebra', 'a ladybug', 'a leopard'], hexagons: ['a zebra', 'a ladybug', 'a snail shell'], rings: ['a zebra', 'a ladybug', 'a honeycomb'] };
  G('ydraw.nature-patterns', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    var nm = function (k) { return Ak.NATURE_PATTERNS[k].name; };
    if (L === 1) {
      var k = R.pick(NAT), o = R.shuffle([k, R.pick(NAT.filter(function (q) { return q !== k; }))]);
      return { q: READ + big('What pattern is this?'), viz: { name: 'ar-pattern', opts: { mode: 'nature', nature: [k], quiet: true, interactive: false, big: true, label: 'A pattern from nature' } }, a: mc(o.map(function (q) { return cap(nm(q)); }), o.indexOf(k)),
        steps: ['Look at the shapes that repeat.', 'This is ' + nm(k) + ', like on ' + Ak.NATURE_PATTERNS[k].on + '.'], hint: 'Lines, dots, round scales, a spiral, six-sided cells or rings?' };
    }
    if (L === 2) {
      var want = R.pick(NAT), thing = R.pick(NAT_ON[want]), ks = R.shuffle([want].concat(R.sample(NAT.filter(function (q) { return q !== want; }), 2)));
      return { q: READ + big('Which pattern would you see on ' + thing + '?'), viz: { name: 'ar-pattern', opts: { mode: 'nature', nature: ks, quiet: true, interactive: false, big: true, label: 'Three patterns from nature, lettered' } }, a: mc(LET3, ks.indexOf(want)),
        steps: [cap(thing) + ' has ' + nm(want) + '.', 'That is picture ' + letter(ks.indexOf(want)) + '.'], hint: 'Picture ' + thing + ' in your mind.' };
    }
    if (R.chance(0.8)) {
      var w3 = R.pick(NAT), yes = R.pick(NAT_ON[w3]), o3 = R.shuffle([yes].concat(R.sample(NAT_NOT[w3], 2)));
      return { q: READ + big('Which one has ' + nm(w3) + '?'), a: mc(o3.map(cap), o3.indexOf(yes), false), steps: [cap(yes) + ' has ' + nm(w3) + '.', 'The others have different patterns.'], hint: 'Picture each one.' };
    }
    return bank(R, [{ q: 'Do only people make patterns?', c: ['No, animals and plants have patterns too', 'Yes, only people make patterns'], s: ['Zebras have stripes, snails have spirals, and fish have scales.', 'Nature is full of patterns.'], h: 'Think of a zebra.' }]);
  });

  // ---------------------------------------------------------------- ydraw.symmetry
  var SYM_L = ['A', 'H', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y'], ASYM_L = ['F', 'G', 'J', 'L', 'N', 'P', 'R', 'S', 'Z'];   // a mirror line straight down the middle, or none at all
  var SYM_T = ['butterfly', 'leaf', 'heart', 'house', 'vase', 'face', 'bug'];
  function bigLetter(c) { return '<span style="font:800 2.6rem system-ui,sans-serif;letter-spacing:.1em">' + c + '</span>'; }
  G('ydraw.symmetry', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var yes = R.coin(), c = R.pick(yes ? SYM_L : ASYM_L);
      return { q: READ + big('Fold this letter down the middle in your mind. Do the two halves match like a mirror?') + '<p style="text-align:center;margin:.4rem 0">' + bigLetter(c) + '</p>', a: mc(['Yes', 'No'], yes ? 0 : 1),
        steps: ['Imagine a line straight down the middle of ' + c + '.', yes ? 'The left half and the right half are mirror pictures.' : 'The two halves are different, so they do not match.'], hint: 'Picture a mirror standing on the middle line.' };
    }
    if (L === 2) {
      var good = R.pick(LET2), askRight = R.coin(), t = R.pick(SYM_T), ans = askRight ? good : (good === 'A' ? 'B' : 'A');
      return { q: READ + big(askRight ? 'In which picture is the right half a mirror picture of the left half?' : 'In which picture was the half copied without flipping it?'),
        viz: { name: 'ar-pattern', opts: { mode: 'symmetry', thing: t, compare: true, good: good, quiet: true, interactive: false, big: true, label: 'Two pictures of ' + Ak.SYMMETRIC[t] + ', A and B' } }, a: mc(LET2, LET2.indexOf(ans)),
        steps: ['A mirror half faces the other way.', 'In ' + good + ', the right half faces the other way, like a mirror.', 'In ' + (good === 'A' ? 'B' : 'A') + ', the half was copied and points the same way.', 'So the answer is ' + ans + '.'], hint: 'Look at the parts next to the middle line.' };
    }
    var y = R.pick(SYM_L), ns = R.sample(ASYM_L, 2), o = R.shuffle([y].concat(ns));
    return { q: READ + big('Which letter has two halves that match like a mirror?') + '<p style="text-align:center;margin:.4rem 0">' + o.map(bigLetter).join(' &nbsp; ') + '</p>', a: mc(o, o.indexOf(y), false),
      steps: ['Picture a line straight down the middle of each letter.', 'Only ' + y + ' has a left half and a right half that are mirror pictures.'], hint: 'Fold each letter in your mind.' };
  });

  // ---------------------------------------------------------------- faces and people: shared
  var HAIRS = ['brown', 'black', 'red', 'blond', 'dark'], SHIRTS = ['#4a8fe0', '#e8574f', '#58b368', '#9b6ad1', '#f39a3d', '#ef86b4', '#14968a'];
  function faceViz(faces) { return { name: 'ydraw-face', opts: { faces: faces, quiet: true, interactive: false, big: true, label: faces.length > 1 ? 'Faces, lettered' : 'A face' } }; }
  function look(R, f) { return Object.assign({ hair: R.pick(HAIRS), glasses: R.chance(0.25) }, f); }
  // feelings for young artists: the mouth and the eyebrows together
  var FEEL = { happy: { mouth: 'up', brows: 'relaxed', word: 'happy', say: 'the mouth curves up in a smile' }, sad: { mouth: 'down', brows: 'worried', word: 'sad', say: 'the mouth curves down' },
    surprised: { mouth: 'round', brows: 'raised', word: 'surprised', say: 'the mouth is a round O and the eyebrows go up high' } };

  // ---------------------------------------------------------------- ydraw.face-parts
  var PART_WORD = { eyes: 'The eyes', nose: 'The nose', mouth: 'The mouth', brows: 'The eyebrows' };
  G('ydraw.face-parts', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1 || (L === 3 && R.chance(0.3))) {
      var miss = R.pick(L === 1 ? ['nose', 'mouth', 'eyes'] : ['nose', 'mouth', 'eyes', 'brows']), others = ['nose', 'mouth', 'eyes', 'brows'].filter(function (q) { return q !== miss; });
      var o = R.shuffle([miss].concat(R.sample(others, L === 1 ? 1 : 2)));
      return { q: READ + big(R.pick(['What is missing from this face?', who(R) + ' forgot one part of this face. What is missing?'])), viz: faceViz([look(R, { missing: miss })]), a: mc(o.map(function (q) { return PART_WORD[q]; }), o.indexOf(miss)),
        steps: ['Look for the question mark.', { eyes: 'The eyes go about halfway down the head.', nose: 'The nose goes below the eyes.', mouth: 'The mouth goes below the nose.', brows: 'The eyebrows go just above the eyes.' }[miss], 'So the missing part is ' + PART_WORD[miss].toLowerCase() + '.'], hint: 'Where is the question mark?' };
    }
    if (L === 2) { // the trouble spot: eyes too high
      var good = R.pick(LET2), askRight = R.coin(), ans = askRight ? good : (good === 'A' ? 'B' : 'A'), base = look(R, {});
      var fs = LET2.map(function (q) { return Object.assign({}, base, { eyes: q === good ? 0.5 : R.pick([0.3, 0.32, 0.34]) }); });
      return { q: READ + big(askRight ? 'Which face has the eyes about halfway down the head?' : 'In which face are the eyes too high?'), viz: faceViz(fs), a: mc(LET2, LET2.indexOf(ans)),
        steps: ['The eyes sit about halfway between the top of the head and the chin.', 'In ' + good + ', they are about halfway. In ' + (good === 'A' ? 'B' : 'A') + ', they are too high, with almost no forehead.', 'So the answer is ' + ans + '.'], hint: 'Put a finger halfway down each face.' };
    }
    if (R.coin()) {
      var good3 = R.pick(LET2), b3 = look(R, {}), fs3 = LET2.map(function (q) { return Object.assign({}, b3, { swap: q !== good3 }); });
      return { q: READ + big('Which face has the mouth below the nose?'), viz: faceViz(fs3), a: mc(LET2, LET2.indexOf(good3)),
        steps: ['From top to bottom: eyes, then nose, then mouth.', 'In ' + good3 + ', the mouth is below the nose.', 'In the other face, the mouth is above the nose.'], hint: 'Find the nose first.' };
    }
    return bank(R, [
      { q: 'From the top of the face down, which order is right?', c: ['Eyes, nose, mouth', 'Mouth, eyes, nose', 'Nose, mouth, eyes'], s: ['The eyes are about halfway down.', 'The nose is below the eyes, and the mouth is below the nose.'], h: 'Touch your own face from the top down.' },
      { q: 'Where do the eyes go on a face?', c: ['About halfway down the head', 'Right at the top of the head', 'Next to the chin'], s: ['There is a forehead above the eyes.', 'The eyes are about halfway down.'], h: 'Feel your forehead above your eyes.' },
      { q: 'Where do the ears go?', c: ['On the sides of the head, near the eyes and nose', 'On top of the head', 'Under the chin'], s: ['Ears are on the sides of the head.', 'They line up with the eyes and the nose.'], h: 'Touch your ears.' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.happy-sad
  G('ydraw.happy-sad', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var k = R.pick(['happy', 'sad']), F0 = FEEL[k];
      return { q: READ + big(R.pick(['How does this face feel?', 'Does this face look happy or sad?'])), viz: faceViz([look(R, { mouth: F0.mouth, brows: F0.brows })]), a: mc(['Happy', 'Sad'], k === 'happy' ? 0 : 1),
        steps: ['Look at the mouth.', cap(F0.say) + ', so the face looks ' + k + '.'], hint: 'Does the mouth curve up or down?' };
    }
    var ks = R.shuffle(['happy', 'sad', 'surprised']), fs = ks.map(function (q) { return look(R, { mouth: FEEL[q].mouth, brows: FEEL[q].brows }); });
    if (L === 2) {
      var want = R.pick(ks);
      return { q: READ + big('Which face looks ' + want + '?'), viz: faceViz(fs), a: mc(LET3, ks.indexOf(want)),
        steps: ks.map(function (q, i) { return letter(i) + ': ' + FEEL[q].say + ' (' + q + ').'; }), hint: 'Look at the mouth first, then the eyebrows.' };
    }
    var S = R.pick([['surprised', 'NAME opens the door and all of NAME\'s friends shout "Surprise!"'], ['sad', 'NAME\'s balloon floats away into the sky'], ['happy', 'NAME is playing a favorite game with a friend'],
      ['sad', 'NAME\'s sandcastle got washed away by a wave'], ['happy', 'NAME just finished a drawing NAME is proud of'], ['surprised', 'A frog jumps out of NAME\'s boot']]);
    var nm = who(R);
    return { q: READ + big(S[1].replace(/NAME/g, nm) + '. Which face fits best?'), viz: faceViz(fs), a: mc(LET3, ks.indexOf(S[0])),
      steps: ['Think about how ' + nm + ' might feel.', 'Most people would feel ' + S[0] + '.', 'The ' + S[0] + ' face is ' + letter(ks.indexOf(S[0])) + ': ' + FEEL[S[0]].say + '.'], hint: 'How would you feel?' };
  });

  // ---------------------------------------------------------------- ydraw.eyebrows
  var BROW = { raised: { word: 'surprised', say: 'raised up high' }, down: { word: 'cross', say: 'sloping down toward the nose' }, worried: { word: 'worried', say: 'tilted up in the middle' } };
  G('ydraw.eyebrows', function (R, ctx) {
    var L = ctx.level || 1, mouth = R.pick(['flat', 'flat', 'wavy']);
    if (L === 1) {
      var b = R.pick(['raised', 'down']);
      return { q: READ + big('Look at the eyebrows. Does this face look surprised or cross?'), viz: faceViz([look(R, { mouth: 'flat', brows: b })]), a: mc(['Surprised', 'Cross'], b === 'raised' ? 0 : 1),
        steps: ['The eyebrows are ' + BROW[b].say + '.', 'That looks ' + BROW[b].word + '.'], hint: 'High eyebrows look surprised. Eyebrows sloping down look cross.' };
    }
    if (L === 2) {
      var ks = R.shuffle(['raised', 'down', 'worried']), want = R.pick(ks), fs = ks.map(function (q) { return look(R, { mouth: mouth, brows: q }); });
      return { q: READ + big('All three mouths are the same. Which face looks ' + BROW[want].word + '?'), viz: faceViz(fs), a: mc(LET3, ks.indexOf(want)),
        steps: ['The mouths match, so look at the eyebrows.', ks.map(function (q, i) { return letter(i) + ': ' + BROW[q].say; }).join('; ') + '.', BROW[want].say.charAt(0).toUpperCase() + BROW[want].say.slice(1) + ' looks ' + BROW[want].word + ': ' + letter(ks.indexOf(want)) + '.'], hint: 'Only the eyebrows change.' };
    }
    if (R.coin()) {
      var p = R.sample(['raised', 'down', 'worried'], 2), base = look(R, { mouth: mouth });
      var o = R.shuffle(['The eyebrows', 'The mouth', 'The nose']);
      return { q: READ + big('These two faces have the same mouth. What makes them look different?'), viz: faceViz([Object.assign({}, base, { brows: p[0] }), Object.assign({}, base, { brows: p[1] })]), a: mc(o, o.indexOf('The eyebrows'), false),
        steps: ['The mouths and noses are the same.', 'In A the eyebrows are ' + BROW[p[0]].say + '; in B they are ' + BROW[p[1]].say + '.', 'The eyebrows change the feeling.'], hint: 'Compare each part, one at a time.' };
    }
    return bank(R, [
      { q: 'How do the eyebrows look on a surprised face?', c: ['Raised up high', 'Sloping down toward the nose', 'Hidden'], s: ['When we are surprised, our eyebrows jump up.', 'So draw them raised up high.'], h: 'Try it in a mirror.' },
      { q: 'How do the eyebrows look on a cross (angry) face?', c: ['Sloping down toward the nose', 'Raised up high', 'Tilted up in the middle'], s: ['A cross face pulls the eyebrows down in the middle.', 'So they slope down toward the nose.'], h: 'Make a cross face in a mirror.' },
      { q: 'NAME drew a face but only changed the mouth. What else can show a feeling?', c: ['The eyebrows', 'The ears', 'The hair'], s: ['Eyebrows move a lot when we feel things.', 'They show feelings as much as the mouth does.'], h: 'What moves above the eyes?' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.people-shapes
  function personViz(people, extra) { return { name: 'ydraw-person', opts: Object.assign({ people: people, quiet: true, interactive: false, big: true, label: people.length > 1 ? 'People drawn from shapes, lettered' : 'A person drawn from shapes' }, extra || {}) }; }
  function anyone(R) { return { hair: R.pick(HAIRS), style: R.pick(['short', 'long', 'curly', 'ponytail']), top: R.pick(SHIRTS), bottom: R.pick(['pants', 'pants', 'shorts', 'skirt']), legs: R.pick(['#2f5f9e', '#555b66', '#7b3294', '#8a5a32']), glasses: R.chance(0.25) }; }
  G('ydraw.people-shapes', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var Q = R.pick([['head', 'A circle', ['A circle', 'A triangle'], 'The head is round.'], ['body', 'A rectangle', ['A rectangle', 'A star'], 'The body is a big rectangle (or an oval).'], ['legs', 'Long, thin shapes', ['Long, thin shapes', 'Little circles'], 'Legs are long and thin.']]);
      var o = R.shuffle(Q[2]);
      return { q: READ + big('What shape is good for the ' + Q[0] + '?'), viz: personViz([anyone(R)]), a: mc(o, o.indexOf(Q[1]), false), steps: [Q[3], 'So use ' + Q[1].toLowerCase() + '.'], hint: 'Look at the person in the picture.' };
    }
    if (L === 2) { // the trouble spot: arms from the head
      var good = R.pick(LET2), askRight = R.coin(), ans = askRight ? good : (good === 'A' ? 'B' : 'A'), p = anyone(R);
      return { q: READ + big(askRight ? 'Which person has arms that start at the shoulders?' : 'In which drawing do the arms come out of the head?'), viz: personViz(LET2.map(function (q) { return Object.assign({}, p, { oops: q === good ? null : 'arms-head' }); })), a: mc(LET2, LET2.indexOf(ans)),
        steps: ['Arms start at the shoulders, at the top corners of the body.', 'In ' + good + ', the arms start at the shoulders. In ' + (good === 'A' ? 'B' : 'A') + ', they come out of the head.', 'So the answer is ' + ans + '.'], hint: 'Touch your own shoulders.' };
    }
    return bank(R, [
      { q: 'You drew the head. What do you draw next?', c: ['The body', 'The shoes', 'The eyelashes'], s: ['Big shapes come first.', 'After the head comes the body; small things come last.'], h: 'Big shapes first.' },
      { q: 'How many long shapes do you need for the arms and legs?', c: ['4', '2', '3'], s: ['Two arms and two legs.', '2 + 2 = 4 long shapes.'], h: 'Count your own arms and legs.' },
      { q: 'Where do the arms start?', c: ['At the shoulders', 'At the head', 'At the feet'], s: ['Arms join the body at the shoulders.', 'Start them at the top corners of the body.'], h: 'Touch your shoulders.' },
      { q: 'Where do the legs start?', c: ['At the bottom of the body', 'In the middle of the head', 'At the shoulders'], s: ['Legs join the body at the hips, at the bottom.', 'Start them at the bottom of the body.'], h: 'Where do your legs join you?' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.hair-clothes
  // features a person can have (exactly one person has the one asked about); set(p) gives it, unset(p) makes sure it is not there
  var FEAT = {
    glasses: { say: 'wears glasses', set: function (p) { p.glasses = true; }, unset: function (p) { p.glasses = false; } },
    hat: { say: 'wears a hat', set: function (p, R) { p.hat = R.pick(['cap', 'sun', 'beanie']); }, unset: function (p) { p.hat = false; } },
    long: { say: 'has long hair', set: function (p) { p.style = 'long'; p.hat = false; }, unset: function (p, R) { if (p.style === 'long') p.style = R.pick(['short', 'curly']); } },
    curly: { say: 'has curly hair', set: function (p) { p.style = 'curly'; p.hat = false; }, unset: function (p, R) { if (p.style === 'curly') p.style = R.pick(['short', 'long', 'ponytail']); } },
    ponytail: { say: 'has a ponytail', set: function (p) { p.style = 'ponytail'; p.hat = false; }, unset: function (p, R) { if (p.style === 'ponytail') p.style = R.pick(['short', 'curly']); } },
    skirt: { say: 'wears a skirt', set: function (p) { p.bottom = 'skirt'; }, unset: function (p, R) { if (p.bottom === 'skirt') p.bottom = R.pick(['pants', 'shorts']); } },
    shorts: { say: 'wears shorts', set: function (p) { p.bottom = 'shorts'; }, unset: function (p, R) { if (p.bottom === 'shorts') p.bottom = R.pick(['pants', 'skirt']); } },
    small: { say: 'is the smallest', set: function (p) { p.size = 0.78; }, unset: function (p) { p.size = 1; } }
  };
  function has(p, f) { return f === 'glasses' ? !!p.glasses : f === 'hat' ? !!p.hat : f === 'long' ? p.style === 'long' && !p.hat : f === 'curly' ? p.style === 'curly' && !p.hat : f === 'ponytail' ? p.style === 'ponytail' && !p.hat : f === 'skirt' ? p.bottom === 'skirt' : f === 'shorts' ? p.bottom === 'shorts' : f === 'small' ? (p.size || 1) < 1 : false; }
  G('ydraw.hair-clothes', function (R, ctx) {
    var L = ctx.level || 1, n = L === 1 ? 2 : 3, people = [], i;
    for (i = 0; i < n; i++) { var p = anyone(R); p.hat = false; p.size = 1; people.push(p); }
    if (L <= 2) {
      var f = R.pick(Object.keys(FEAT)), who0 = R.int(0, n - 1);
      people.forEach(function (p, j) { if (j === who0) FEAT[f].set(p, R); else FEAT[f].unset(p, R); });
      var hairF = ['long', 'curly', 'ponytail'].indexOf(f) >= 0;
      if (f !== 'hat') people.forEach(function (p, j) { if (R.chance(0.3) && !(hairF && j === who0)) p.hat = R.pick(['cap', 'sun', 'beanie']); });
      var lets = n === 2 ? LET2 : LET3;
      return { q: READ + big('Which person ' + FEAT[f].say + '?'), viz: personViz(people), a: mc(lets, who0),
        steps: ['Look at each person: hair, hats, glasses and clothes.', 'Only ' + letter(who0) + ' ' + FEAT[f].say + '.'], hint: 'Check each person, one at a time.' };
    }
    // two features at once: one person has both, the others have only one each
    var pair = R.pick([['hat', 'glasses'], ['glasses', 'skirt'], ['hat', 'shorts'], ['glasses', 'curly'], ['shorts', 'glasses'], ['glasses', 'long']]), order = R.shuffle([0, 1, 2]);
    people.forEach(function (p, j) { var role = order[j]; FEAT[pair[0]][role === 0 || role === 1 ? 'set' : 'unset'](p, R); FEAT[pair[1]][role === 0 || role === 2 ? 'set' : 'unset'](p, R); });
    var both = order.indexOf(0);
    return { q: READ + big('Find the person who ' + FEAT[pair[0]].say + ' and ' + FEAT[pair[1]].say + '.'), viz: personViz(people), a: mc(LET3, both),
      steps: people.map(function (p, j) { return letter(j) + ': ' + (has(p, pair[0]) ? FEAT[pair[0]].say : 'does not ' + FEAT[pair[0]].say.replace(/^(wears|has) /, '$1 ').replace(/^wears/, 'wear').replace(/^has/, 'have')) + ', and ' + (has(p, pair[1]) ? FEAT[pair[1]].say : 'does not ' + FEAT[pair[1]].say.replace(/^wears/, 'wear').replace(/^has/, 'have')) + '.'; }).concat(['Only ' + letter(both) + ' has both.']),
      hint: 'Check the first thing, then the second.' };
  });

  // ---------------------------------------------------------------- using the page: shared
  function sceneViz(scenes, label) { return { name: 'ydraw-scene', opts: { scenes: scenes, quiet: true, interactive: false, big: true, label: label || (scenes.length > 1 ? 'Pictures, lettered' : 'A picture') } }; }
  var MAIN = { house: { word: 'house', s: [0.45, 1, 2.0] }, tree: { word: 'tree', s: [0.45, 1, 1.75] }, person: { word: 'person', s: [0.5, 1.1, 2.3] } };
  // the main thing drawn tiny in a corner (0), middling (1) or big enough to fill the page (2)
  function sizeScene(k, size, R, sky) {
    var s = MAIN[k].s[size], corner = R.coin();
    var x = size === 0 ? (corner ? 28 : 172) : 100, y = size === 0 ? 138 : size === 1 ? 128 : 146;
    return { sky: sky ? 'full' : 'none', ground: sky ? 130 : false, items: [{ k: k, x: x, y: y, s: s, p: k === 'person' ? { top: '#e8574f', style: 'long', hair: 'brown' } : undefined }] };
  }

  // ---------------------------------------------------------------- ydraw.draw-big
  G('ydraw.draw-big', function (R, ctx) {
    var L = ctx.level || 1, k = R.pick(['house', 'tree', 'person']), sky = R.coin();
    if (L === 1) {
      var sizes = R.shuffle([0, 2]), ans = sizes.indexOf(2);
      return { q: READ + big(R.pick(['Which drawing fills the page?', 'Which ' + MAIN[k].word + ' is big enough to fill the page?'])), viz: sceneViz(sizes.map(function (z) { return sizeScene(k, z, R, sky); })), a: mc(LET2, ans),
        steps: ['In one picture the ' + MAIN[k].word + ' is tiny, with lots of empty paper.', 'In ' + letter(ans) + ', the ' + MAIN[k].word + ' is big and fills the page.'], hint: 'Which one has the most empty paper?' };
    }
    if (L === 2) {
      var sz = R.shuffle([0, 1, 2]), askTiny = R.coin(), want = askTiny ? 0 : 2;
      return { q: READ + big(askTiny ? 'In which picture is the ' + MAIN[k].word + ' tiny, with the page left empty?' : 'In which picture does the ' + MAIN[k].word + ' use the whole page best?'), viz: sceneViz(sz.map(function (z) { return sizeScene(k, z, R, sky); })), a: mc(LET3, sz.indexOf(want)),
        steps: sz.map(function (z, i) { return letter(i) + ': ' + ['tiny, in a corner', 'middle-sized', 'big, filling the page'][z] + '.'; }).concat(['So the answer is ' + letter(sz.indexOf(want)) + '.']), hint: 'Compare how much of the paper each one covers.' };
    }
    return bank(R, [
      { q: 'NAME\'s big house touches the edges of the paper. Is that OK?', c: ['Yes, big drawings can touch the edges', 'No, never touch the edges'], s: ['A big drawing can fill the page.', 'Touching the edges is fine.'], h: 'Is big good?' },
      { q: 'NAME drew a tiny cat in one corner. What could NAME try next time?', c: ['Draw the cat big, to fill the page', 'Draw it even smaller', 'Use a smaller piece of paper'], s: ['The main thing should be big.', 'Start with a big shape that fills the page.'], h: 'Make the main thing big.' },
      { q: 'What should you draw first so your picture fills the page?', c: ['The biggest shape, drawn big', 'A tiny detail in the corner'], s: ['Big shapes first, drawn big.', 'Then add the small details.'], h: 'Big shapes first.' },
      { q: 'Before you start, what can you do to make your drawing big?', c: ['Point to where the top and bottom will go', 'Start drawing in a corner'], s: ['Plan the size first.', 'Show yourself where the top and the bottom of the drawing will be.'], h: 'Plan the size.' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.sky-ground
  function skyScene(R, full, set) {
    var items = set === 0 ? [{ k: 'house', x: 70, y: 124 }, { k: 'tree', x: 150, y: 124 }] : set === 1 ? [{ k: 'tree', x: 50, y: 124 }, { k: 'tree', x: 100, y: 124, s: 0.85 }, { k: 'bush', x: 160, y: 124 }] : [{ k: 'house', x: 130, y: 124, s: 1.1 }, { k: 'flower', x: 50, y: 126 }, { k: 'flower', x: 70, y: 128 }];
    if (set >= 3) items = [{ k: 'mountain', x: 70, y: 120 }, { k: 'tree', x: 150, y: 126 }];
    var flipX = R.coin(); items = items.map(function (it) { return Object.assign({}, it, { x: flipX ? 200 - it.x : it.x }); });
    return { sky: full ? 'full' : 'gap', ground: 120, items: items.concat(full ? [{ k: 'sun', x: flipX ? 170 : 30, y: 26 }] : []) };
  }
  G('ydraw.sky-ground', function (R, ctx) {
    var L = ctx.level || 1, set = R.int(0, 3);
    if (L === 1) {
      var Q = R.pick([['Where does the ground go in this picture?', ['Along the bottom', 'Along the top'], 'The grass is along the bottom of the page.'], ['Where is the sky in this picture?', ['Above the ground, up to the top', 'Under the ground'], 'The blue sky fills the page above the ground.']]);
      var o = R.shuffle(Q[1]);
      return { q: READ + big(Q[0]), viz: sceneViz([skyScene(R, true, set)]), a: mc(o, o.indexOf(Q[1][0]), false), steps: [Q[2]], hint: 'Look at the green and the blue.' };
    }
    if (L === 2) { // the trouble spot: the sky as a strip at the top
      var good = R.pick(LET2), askRight = R.coin(), ans = askRight ? good : (good === 'A' ? 'B' : 'A');
      return { q: READ + big(R.pick(['', who(R) + ' and a friend painted these. ']) + (askRight ? 'In which picture does the sky come all the way down to the ground?' : 'Which picture has a white gap between the sky and the ground?')), viz: sceneViz(LET2.map(function (q) { return skyScene(R, q === good, set); }), 'Two pictures, A and B'), a: mc(LET2, LET2.indexOf(ans)),
        steps: ['Outside, the sky reaches all the way down to where the land ends.', 'In ' + good + ', the sky comes down to the ground. In ' + (good === 'A' ? 'B' : 'A') + ', the sky is a thin strip at the top.', 'So the answer is ' + ans + '.'], hint: 'Look between the sky and the grass.' };
    }
    return bank(R, [
      { q: 'NAME painted a thin strip of blue sky at the top and left white paper under it. What should fill the white part?', c: ['More sky color', 'Nothing, white is right', 'Grass'], s: ['Outside, there is no white strip of air.', 'The sky comes all the way down to the land, so paint sky there too.'], h: 'Look out a window: where does the sky stop?' },
      { q: 'Far away, where does the sky meet the land?', c: ['At a line far away, the horizon', 'At the very top of the page'], s: ['The sky comes down until it meets the land.', 'That line far away is the horizon.'], h: 'Think of a wide field.' },
      { q: 'In a picture outside, what goes along the bottom of the page?', c: ['The ground', 'The sky', 'The sun'], s: ['We stand on the ground.', 'So the ground goes along the bottom.'], h: 'Where are your feet?' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.near-far
  // near things are bigger and lower on the page; far things are smaller and higher
  var DEPTH = [{ s: 1.35, y: 146 }, { s: 0.85, y: 120 }, { s: 0.48, y: 104 }];   // near, middle, far
  G('ydraw.near-far', function (R, ctx) {
    var L = ctx.level || 1, k = R.pick(['tree', 'tree', 'house']), word = k === 'tree' ? 'tree' : 'house';
    if (L <= 2) {
      var depths = L === 1 ? R.pick([[0, 2], [0, 1], [1, 2]]) : [0, 1, 2], tags = (L === 1 ? LET2 : LET3), xs = R.shuffle(L === 1 ? [55, 145] : [40, 100, 160]);
      var order = R.shuffle(depths.slice()), items = order.map(function (d, i) { return { k: k, x: xs[i], y: DEPTH[d].y, s: DEPTH[d].s, tag: tags[i] }; });
      var askFar = R.coin(), target = askFar ? Math.max.apply(null, depths) : Math.min.apply(null, depths), idx = order.indexOf(target);
      return { q: READ + big('Which ' + word + ' is ' + (askFar ? 'farthest away' : 'nearest to you') + '?'), viz: sceneViz([{ sky: 'full', ground: 96, items: items.concat([{ k: 'sun', x: R.pick([24, 176]), y: 22, s: 0.8 }]) }], 'A picture with lettered ' + word + 's near and far'),
        a: mc(tags, idx), steps: ['Far things look smaller and sit higher up the page.', 'Near things look bigger and sit lower down.', cap(word) + ' ' + tags[idx] + ' is the ' + (askFar ? 'smallest and highest, so it is farthest away.' : 'biggest and lowest, so it is nearest.')], hint: askFar ? 'Find the smallest one.' : 'Find the biggest one.' };
    }
    if (R.coin()) {
      var good = R.pick(LET2), sc = LET2.map(function (q) { return q === good ? { sky: 'full', ground: 96, items: [{ k: k, x: 140, y: 104, s: 0.48 }, { k: k, x: 55, y: 146, s: 1.35 }] } : { sky: 'full', ground: 96, items: [{ k: k, x: 140, y: 146, s: 1.1 }, { k: k, x: 55, y: 146, s: 1.1 }] }; });
      return { q: READ + big('Which picture shows one ' + word + ' near and one ' + word + ' far away?'), viz: sceneViz(sc, 'Two pictures, A and B'), a: mc(LET2, LET2.indexOf(good)),
        steps: ['A far ' + word + ' looks smaller and sits higher.', 'In ' + good + ', one ' + word + ' is small and high: it is far away.', 'In the other picture, both are the same size, side by side.'], hint: 'Look for a small one, higher up.' };
    }
    return bank(R, [
      { q: 'Things that are far away look…', c: ['Smaller', 'Bigger', 'The same size'], s: ['A faraway tree looks tiny.', 'Far things look smaller.'], h: 'Think of a faraway airplane.' },
      { q: 'On the page, where do you draw something far away?', c: ['Higher up, near the horizon', 'At the very bottom'], s: ['Near things sit low on the page.', 'Far things sit higher up, close to where the land meets the sky.'], h: 'Far things are up near the horizon.' },
      { q: 'NAME wants a faraway mountain and a tree right in front. Which should be bigger on the page?', c: ['The tree in front', 'The faraway mountain'], s: ['Near things look bigger, even if they are small in real life.', 'So the near tree is drawn bigger.'], h: 'Which one is near?' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.draw-what-you-see
  G('ydraw.draw-what-you-see', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) return bank(R, [
      { q: 'NAME is drawing a flower in a pot. Where should NAME look most of the time?', c: ['At the real flower', 'At the paper'], s: ['To draw what you see, look at the real thing.', 'Look at the flower, then draw a little, then look again.'], h: 'You can\'t see the flower if you look only at the paper.' },
      { q: 'When you draw your shoe, what helps most?', c: ['Looking at the real shoe often', 'Drawing a shoe from memory'], s: ['The real shoe shows you its shapes.', 'Look often, and draw what you see.'], h: 'Look, then draw.' },
      { q: 'What should you notice first when you look at something to draw?', c: ['Its big shapes', 'Its tiniest spots'], s: ['Big shapes come first.', 'Small details come after.'], h: 'Big shapes first.' },
      { q: 'NAME is drawing a pet dog. What is the best way to draw it?', c: ['Look at the dog, draw a little, then look again', 'Draw it without looking at the dog'], s: ['Looking often shows you the real shapes.', 'Look, draw a little, and look again.'], h: 'Look often.' },
      { q: 'NAME looks at a real cup before drawing it. What should NAME look for first?', c: ['The big shapes, like the round top and the handle', 'The tiny scratches'], s: ['Start with the big shapes you see.', 'Small details come last.'], h: 'Big shapes first.' },
      { q: 'Is it OK for a drawing from real life to look different from a drawing from memory?', c: ['Yes, real things have their own shapes', 'No, they must look the same'], s: ['Real things are often bumpier, bigger or more crooked than we remember.', 'Drawing what you see shows those surprises.'], h: 'Real things surprise us.' }
    ]);
    if (L === 2) {
      var good = R.pick(LET2), list = good === 'A' ? ['real-tree', 'lollipop-tree'] : ['lollipop-tree', 'real-tree'];
      return { q: READ + big(who(R) + ' looked closely at a real tree with a crooked trunk and branches. Which drawing shows what was really there?'), viz: thingsPic(list), a: mc(LET2, LET2.indexOf(good)),
        steps: ['A real tree has a trunk that splits into branches, and bumpy clumps of leaves.', 'The other drawing is a "lollipop tree": a ball on a stick, drawn from memory.', 'So the answer is ' + good + '.'], hint: 'Which one has branches?' };
    }
    var D = R.pick([['train', 'circle', 'wheels'], ['car', 'circle', 'wheels'], ['house', 'square', 'squares'], ['owl', 'circle', 'round eyes'], ['flower', 'oval', 'petals and leaves'], ['snowman', 'circle', 'circles'], ['cat', 'triangle', 'triangles'], ['owl', 'triangle', 'triangles'], ['train', 'rectangle', 'rectangles']]), Ak = A(), n = Ak.drawingCount(D[0], D[1]), o = countOpts(R, n);
    return { q: READ + big(R.pick(['Look closely at this drawing of ' + Ak.DRAWINGS[D[0]].name + '.', who(R) + ' drew ' + Ak.DRAWINGS[D[0]].name + '. Look closely.']) + ' How many ' + D[2] + ' do you see?'), viz: drawingPic(D[0]), a: mc(o, o.indexOf(String(n))),
      steps: ['Point to each one as you count.', 'There are ' + n + '.'], hint: 'Count slowly, one at a time.' };
  });

  // ---------------------------------------------------------------- ydraw.count-details
  var CNT = { spider: { word: 'legs', thing: 'spider' }, ant: { word: 'legs', thing: 'ant' }, octopus: { word: 'arms', thing: 'octopus' }, starfish: { word: 'arms', thing: 'starfish' }, hand: { word: 'fingers, counting the thumb', thing: 'hand' },
    ladybug: { word: 'spots', thing: 'ladybug' }, flower: { word: 'petals', thing: 'flower' }, caterpillar: { word: 'round body parts, counting the head', thing: 'caterpillar' } };
  var REAL_N = { spider: 8, ant: 6, octopus: 8, starfish: 5, hand: 5 };   // the real numbers; ladybug spots, petals and caterpillar parts vary
  G('ydraw.count-details', function (R, ctx) {
    var L = ctx.level || 1;
    if (L <= 2) {
      var k = R.pick(Object.keys(CNT)), n = REAL_N[k] || (k === 'ladybug' ? R.int(2, 7) : k === 'flower' ? R.int(5, 9) : R.int(4, 7)), o = countOpts(R, n, L === 1 ? 2 : 3);
      return { q: READ + big(R.pick(['How many ' + CNT[k].word + ' does this ' + CNT[k].thing + ' have?', who(R) + ' drew this ' + CNT[k].thing + '. How many ' + CNT[k].word + ' are there?', 'Count carefully. How many ' + CNT[k].word + ' does this ' + CNT[k].thing + ' have?'])), viz: thingsPic([{ k: k, n: n, color: k === 'flower' || k === 'starfish' ? R.pick(['#ef86b4', '#f5871f', '#9b6ad1', '#e04a3f']) : undefined }]), a: mc(o, o.indexOf(String(n))),
        steps: ['Point to each one and count out loud.', 'There are ' + n + '.'], hint: 'Touch each one as you count, so you count each only once.' };
    }
    var Q = R.pick([['spider', 8, [6, 10], 'Real spiders have 8 legs. Which spider has the right number?'], ['hand', 5, [6, 4], 'A hand has 5 fingers, counting the thumb. Which hand is right?'], ['ant', 6, [4, 8], 'Ants have 6 legs. Which ant has the right number?'], ['octopus', 8, [6, 10], 'An octopus has 8 arms. Which octopus is right?']]);
    var good = R.pick(LET2), bad = R.pick(Q[2]), items = LET2.map(function (q) { return { k: Q[0], n: q === good ? Q[1] : bad }; });
    return { q: READ + big(Q[3]), viz: thingsPic(items), a: mc(LET2, LET2.indexOf(good)),
      steps: ['Count each picture.', good + ' has ' + Q[1] + '. ' + (good === 'A' ? 'B' : 'A') + ' has ' + bad + '.', 'So ' + good + ' is right.'], hint: 'Count, don\'t guess.' };
  });

  // ---------------------------------------------------------------- ydraw.texture-marks
  var TX = ['fur', 'wood', 'sand', 'brick', 'scales', 'grass', 'water'];
  var TX_SAY = { fur: 'short strokes, like fur', wood: 'long wavy lines with a knot, like wood', sand: 'tiny dots, like sand', brick: 'rows of rectangles, like bricks', scales: 'rows of little curves, like fish scales', grass: 'short upward flicks, like grass', water: 'long smooth lines, like calm water' };
  var TX_WORD = { fur: 'fur', wood: 'wood', sand: 'sand', brick: 'bricks', scales: 'fish scales', grass: 'grass', water: 'water' };
  G('ydraw.texture-marks', function (R, ctx) {
    var L = ctx.level || 1;
    var mk = function (ks) { return { name: 'ar-marks', opts: { kinds: ks, quiet: true, interactive: false, big: true, seed: String(R.int(1, 9)), label: ks.length > 1 ? 'Swatches of marks, lettered' : 'A swatch of marks' } }; };
    if (L === 1) {
      var k = R.pick(TX), o = R.shuffle([k, R.pick(TX.filter(function (q) { return q !== k; }))]);
      return { q: READ + big('What do these marks look like?'), viz: mk([k]), a: mc(o.map(function (q) { return cap(TX_WORD[q]); }), o.indexOf(k)), steps: ['The marks are ' + TX_SAY[k] + '.'], hint: 'Dots, short strokes or long lines?' };
    }
    if (L === 2) {
      var want = R.pick(TX), ks = R.shuffle([want].concat(R.sample(TX.filter(function (q) { return q !== want; }), 2)));
      return { q: READ + big('Which marks would show ' + TX_WORD[want] + '?'), viz: mk(ks), a: mc(LET3, ks.indexOf(want)),
        steps: ks.map(function (q, i) { return letter(i) + ': ' + TX_SAY[q] + '.'; }), hint: 'Think about how ' + TX_WORD[want] + ' feels.' };
    }
    return bank(R, [
      { q: 'Which marks would you use for a fuzzy cat?', c: ['Lots of short little lines', 'Big dots', 'One long smooth line'], s: ['Fur is made of many short hairs.', 'Short little lines look fuzzy.'], h: 'Think of fur.' },
      { q: 'Which marks would you use for a sandy beach?', c: ['Lots of tiny dots', 'Long wavy lines', 'Rows of rectangles'], s: ['Sand is many tiny grains.', 'Tiny dots look like sand.'], h: 'Sand is grainy.' },
      { q: 'Which marks would you use for calm water?', c: ['Long smooth lines', 'Tiny dots', 'Short zigzags'], s: ['Calm water is smooth and flat.', 'Long smooth lines look calm.'], h: 'Calm means smooth.' },
      { q: 'Which marks would you use for a brick wall?', c: ['Rows of rectangles', 'Lots of tiny dots', 'Curly loops'], s: ['Bricks are rectangles in rows.', 'Draw rows of rectangles.'], h: 'What shape is a brick?' },
      { q: 'NAME colored a cat, a tree and a rock all the same flat way. What could make them look different?', c: ['Different kinds of marks for fur, bark and rock', 'Pressing the same way everywhere'], s: ['The kind of mark can show how things feel.', 'Short strokes for fur, long wavy lines for bark, specks for rock.'], h: 'How does each one feel?' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.shadows-kids
  G('ydraw.shadows-kids', function (R, ctx) {
    var L = ctx.level || 1;
    if (L <= 2) {
      var sun = R.pick(['left', 'right']), good = R.pick(LET2), thing = L === 1 ? 'tree' : R.pick(['tree', 'ball']), askBad = L === 2 && R.coin(), ans = askBad ? (good === 'A' ? 'B' : 'A') : good;
      var away = sun === 'left' ? 'right' : 'left';
      return { q: READ + big(R.pick(['', who(R) + ' drew ' + (thing === 'tree' ? 'a tree' : 'a ball') + ' on a sunny day. ']) + 'The sun is on the ' + sun + '. ' + (askBad ? 'Which shadow is in the wrong place?' : R.pick(['Which shadow is right, A or B?', 'Where does the shadow really fall: A or B?']))),
        viz: { name: 'ar-shade', opts: { kid: true, thing: thing, sun: sun, good: good, quiet: true, interactive: false, big: true, label: 'The sun on the ' + sun + ' and a ' + thing + ' with two shadows, A and B' } }, a: mc(LET2, LET2.indexOf(ans)),
        steps: ['A shadow falls on the side away from the light.', 'The sun is on the ' + sun + ', so the shadow falls to the ' + away + '.', 'That is shadow ' + good + '.' + (askBad ? ' So the wrong one is ' + ans + '.' : '')], hint: 'The shadow hides from the sun.' };
    }
    var side = R.pick(['left', 'right']), other = side === 'left' ? 'right' : 'left', thing3 = R.pick(['cup', 'apple', 'toy car', 'teddy bear']);
    return bank(R, [
      { q: 'A lamp shines from the ' + side + ' side of a ' + thing3 + '. Where does its shadow fall?', c: ['On the ' + other + ' side', 'On the ' + side + ' side', 'On top of the ' + thing3], s: ['A shadow falls away from the light.', 'The light is on the ' + side + ', so the shadow falls to the ' + other + '.'], h: 'Away from the light.' },
      { q: 'You stand in the sun. Which way does your shadow point?', c: ['Away from the sun', 'Toward the sun'], s: ['Your body blocks the sunlight.', 'The shadow points away from the sun.'], h: 'Your body blocks the light.' },
      { q: 'NAME drew the sun and a tree. NAME put the shadow on the same side as the sun. Is that right?', c: ['No, the shadow goes on the side away from the sun', 'Yes, shadows go next to the sun'], s: ['The tree blocks the light.', 'Its shadow falls on the side away from the sun.'], h: 'Where does the light not reach?' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.art-tools
  var TOOLS = ['crayon', 'pencil', 'marker', 'brush', 'paints', 'clay', 'scissors', 'glue', 'chalk'];
  var TOOL_NAME = { crayon: 'A crayon', pencil: 'A pencil', marker: 'A marker', brush: 'A paintbrush', paints: 'A paint set', clay: 'Clay', scissors: 'Scissors', glue: 'Glue', chalk: 'Chalk' };
  // "Which tool do you use to …?" (one tool fits; the other choices must not)
  var TOOL_USE = [['clay', 'squeeze and shape a little bowl with your hands'], ['scissors', 'cut paper'], ['glue', 'stick paper pieces down'], ['brush', 'spread paint on paper'], ['chalk', 'draw on a chalkboard'], ['pencil', 'draw a light line you can erase']];
  var TOOL_NOT = { clay: ['clay'], scissors: ['scissors'], glue: ['glue'], brush: ['brush', 'paints'], chalk: ['chalk', 'crayon'], pencil: ['pencil', 'chalk', 'crayon'] };
  G('ydraw.art-tools', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var k = R.pick(TOOLS), o = R.shuffle([k, R.pick(TOOLS.filter(function (q) { return q !== k; }))]);
      return { q: READ + big(R.pick(['What is this art tool?', 'What did ' + who(R) + ' bring to art class?'])), viz: thingsPic([k]), a: mc(o.map(function (q) { return TOOL_NAME[q]; }), o.indexOf(k)),
        steps: ['Look at the picture.', 'It shows ' + TOOL_NAME[k].toLowerCase() + '.'], hint: 'What is it used for?' };
    }
    if (L === 2) {
      var U0 = R.pick(TOOL_USE), others = R.sample(TOOLS.filter(function (q) { return TOOL_NOT[U0[0]].indexOf(q) < 0; }), 2), ks = R.shuffle([U0[0]].concat(others));
      return { q: READ + big('Which tool do you use to ' + U0[1] + '?'), viz: thingsPic(ks), a: mc(LET3, ks.indexOf(U0[0])),
        steps: ks.map(function (q, i) { return letter(i) + ': ' + TOOL_NAME[q].toLowerCase() + '.'; }).concat([TOOL_NAME[U0[0]] + ' is the one to ' + U0[1] + '.']), hint: 'Picture yourself doing it.' };
    }
    return bank(R, [
      { q: 'Which line is easiest to erase?', c: ['A light pencil line', 'A marker line', 'A paint line'], s: ['Pencil sits on top of the paper and erases.', 'Markers and paint soak in.'], h: 'Which one has an eraser on the end?' },
      { q: 'NAME made a little clay bird. Is that art?', c: ['Yes, clay is an art material', 'No, art is only drawings'], s: ['Artists use clay, paint, paper, crayons and more.', 'A clay bird is art.'], h: 'Art is not only drawing.' },
      { q: 'What do you need to make a paper collage?', c: ['Scissors, paper and glue', 'Only a pencil', 'Only clay'], s: ['A collage is made by cutting and gluing pieces.', 'So you need scissors, paper and glue.'], h: 'Cut and stick.' },
      { q: 'What should you do with a paintbrush when you change colors?', c: ['Rinse it in water', 'Leave the old color on'], s: ['Old paint on the brush mixes into the new color.', 'Rinse it first.'], h: 'Keep your colors clean.' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.kinds-of-pictures
  var PIC = ['portrait', 'landscape', 'still-life'], PIC_WORD = { portrait: 'a portrait', landscape: 'a landscape', 'still-life': 'a still life' };
  var PIC_SAY = { portrait: 'It shows a person: a portrait.', landscape: 'It shows land and sky: a landscape.', 'still-life': 'It shows things on a table: a still life.' };
  // famous pictures for the topic (catalog ids), described in words until their pictures are on the site
  var PIC_WORKS = [['mona-lisa', 'portrait', 'shows one woman, from the waist up, looking at us'], ['starry-night', 'landscape', 'shows a swirling night sky over hills and a little village'], ['sunflowers', 'still-life', 'shows sunflowers in a vase on a table']];
  G('ydraw.kinds-of-pictures', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    var pv = function (ks) { return { name: 'ar-shapes', opts: { mode: 'picture', picture: ks, quiet: true, interactive: false, big: true, label: ks.length > 1 ? 'Pictures, lettered' : 'A picture' } }; };
    if (L === 1) {
      var k = R.pick(PIC), o = R.shuffle([k, R.pick(PIC.filter(function (q) { return q !== k; }))]);
      return { q: READ + big(R.pick(['What kind of picture is this?', who(R) + ' painted this. What kind of picture is it?', 'Is this ' + PIC_WORD[o[0]] + ' or ' + PIC_WORD[o[1]] + '?'])), viz: pv([k]), a: mc(o.map(function (q) { return cap(PIC_WORD[q]); }), o.indexOf(k)), steps: [PIC_SAY[k]], hint: 'A person, land and sky, or things on a table?' };
    }
    if (L === 2) {
      var ks = R.shuffle(PIC.slice()), want = R.pick(PIC);
      return { q: READ + big(R.pick(['Which picture is ' + PIC_WORD[want] + '?', who(R) + ' wants to hang up ' + PIC_WORD[want] + '. Which one is it?'])), viz: pv(ks), a: mc(LET3, ks.indexOf(want)),
        steps: ks.map(function (q, i) { return letter(i) + ': ' + PIC_WORD[q] + '.'; }), hint: { portrait: 'Look for a person.', landscape: 'Look for land and sky.', 'still-life': 'Look for things on a table.' }[want] };
    }
    if (R.coin()) {
      var W = R.pick(PIC_WORKS), w = Ak.work(W[0]), o3 = R.shuffle(PIC.slice()), pic = w && Ak.hasImg(w);
      return { q: READ + big(pic ? 'What kind of picture is this famous painting?' : '<i>' + w.title + '</i>, by ' + w.artist + ', ' + W[2] + '. What kind of picture is it?'), viz: pic ? { name: 'ar-artwork', opts: { work: w.id, quiet: true, label: false, interactive: false } } : undefined,
        a: mc(o3.map(function (q) { return cap(PIC_WORD[q]); }), o3.indexOf(W[1])), steps: [cap(W[2].replace(/^shows/, 'It shows')) + '.', 'So it is ' + PIC_WORD[W[1]] + '.'], hint: 'A person, land and sky, or things on a table?' };
    }
    return bank(R, [
      { q: 'A painting shows wide hills and a river, with one tiny person far away. What kind of picture is it?', c: ['A landscape', 'A portrait', 'A still life'], s: ['The picture is mostly about the land and sky.', 'The tiny person is only a small part, so it is a landscape.'], h: 'What is the picture mostly about?' },
      { q: 'NAME drew a picture of Grandma\'s face and shoulders. What kind of picture is it?', c: ['A portrait', 'A landscape', 'A still life'], s: ['A picture about a person is a portrait.'], h: 'Is it about a person?' },
      { q: 'NAME painted three apples and a jug on a table. What kind of picture is it?', c: ['A still life', 'A portrait', 'A landscape'], s: ['Things set on a table make a still life.'], h: 'Are the things alive and moving?' }
    ]);
  });

  // ---------------------------------------------------------------- ydraw.flat-solid
  var FLAT = ['painting', 'drawing', 'photo'], SOLID = ['statue', 'bowl', 'vase', 'tall', 'sandcastle', 'snowman'];
  var FS_NAME = { painting: 'a painting', drawing: 'a drawing', photo: 'a photograph', statue: 'a stone cat statue', bowl: 'a clay bowl', vase: 'a vase', tall: 'a metal sculpture of shapes', sandcastle: 'a sandcastle', snowman: 'a snowman' };
  // famous sculptures (catalog ids) with a plain fact about what they are made of; their pictures appear once approved
  var SCULPTS = [['sphinx', 'is carved out of rock in Egypt'], ['olmec-head', 'is a giant head carved from a stone boulder'], ['terracotta-army', 'is an army of life-size soldiers made of clay']];
  G('ydraw.flat-solid', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var solid = R.coin(), k = R.pick(solid ? SOLID : FLAT);
      return { q: READ + big(R.pick(['Is this art flat or solid?', 'Is this a flat picture or a solid sculpture?'])), viz: thingsPic([k]), a: mc(['Flat, like a picture', 'Solid, like a sculpture'], solid ? 1 : 0),
        steps: [solid ? cap(FS_NAME[k]) + ' takes up space: you could walk around it.' : cap(FS_NAME[k]) + ' is flat, on paper or canvas.', solid ? 'So it is a sculpture.' : 'So it is a flat picture.'], hint: 'Could you walk around it and see its back?' };
    }
    if (L === 2) {
      var wantSolid = R.coin(), one = R.pick(wantSolid ? SOLID : FLAT), two = R.sample(wantSolid ? FLAT : SOLID, 2), ks = R.shuffle([one].concat(two));
      return { q: READ + big(wantSolid ? 'Which one is a sculpture?' : 'Which one is flat?'), viz: thingsPic(ks), a: mc(LET3, ks.indexOf(one)),
        steps: ks.map(function (q, i) { return letter(i) + ': ' + FS_NAME[q] + (SOLID.indexOf(q) >= 0 ? ' (solid).' : ' (flat).'); }), hint: 'A sculpture is solid; you can walk around it.' };
    }
    if (R.chance(0.4)) {
      var S = R.pick(SCULPTS), w = Ak.work(S[0]), pic = w && Ak.hasImg(w);
      return { q: READ + big((pic ? 'This is ' : '') + '<i>' + w.title + '</i> ' + S[1] + '. Is it a flat picture or a sculpture?'), viz: pic ? { name: 'ar-artwork', opts: { work: w.id, quiet: true, label: false, interactive: false } } : undefined,
        a: mc(['A sculpture', 'A flat picture'], 0, false), steps: ['It ' + S[1] + '.', 'It is solid and takes up space, so it is a sculpture.'], hint: 'Is it carved or shaped?' };
    }
    return bank(R, [
      { q: 'Can you walk around a sculpture and see its back?', c: ['Yes', 'No'], s: ['A sculpture is solid.', 'You can see it from the front, the sides and the back.'], h: 'Think of a snowman.' },
      { q: 'NAME built a snowman. Is it a picture or a sculpture?', c: ['A sculpture', 'A picture'], s: ['A snowman is solid and takes up space.', 'So it is a sculpture.'], h: 'Can you walk around it?' },
      { q: 'Which one is a sculpture?', c: ['A horse carved from wood', 'A drawing of a horse', 'A painting of a horse'], s: ['A drawing and a painting are flat.', 'A carved horse is solid: a sculpture.'], h: 'Which one is solid?' },
      { q: 'Does a sculpture have to look like a person?', c: ['No, it can be an animal, a bowl or a shape', 'Yes, always a person'], s: ['Sculptures can show anything.', 'Animals, bowls and tall shapes can all be sculptures.'], h: 'Think of a clay bowl.' }
    ]);
  });
})(window.MathLadder);
