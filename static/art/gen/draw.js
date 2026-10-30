/* Generators for draw, merged from part files by /tmp/merge_parts.js (edit the parts, not this file). */
/* ---- part A ---- */
/* Drawing Basics (Art & Drawing Ladder, course key draw), part A: units 1-6 (tools, line, forms, value, light,
   measuring). Problem generators for ages 10 to adult. Pictures come from the kit (static/art/viz/art.js; the model
   MathLadder.art) and from the course visual draw-pics (static/art/viz/draw.js), always quiet, lettered A, B, C… in the
   order given, so the answer index matches the letters.
   Levels: 1 = two choices, the right idea against a plainly different one; 2 = three choices with the near miss from
   the topic's trouble note; 3 = which picture…, situations, or numbers to compute.
   Built from /tmp/work_draw_A/src/gen_*.js by /tmp/work_draw_A/build.py (edit the sources, not this file). */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, M = Math;
  function A() { return ML.art; }
  var NAMES = ['Mia', 'Leo', 'Sam', 'Ruby', 'Omar', 'Hana', 'Ana', 'Kai', 'Grace', 'Jon', 'Priya', 'Eli'];
  function who(R) { return R.pick(NAMES); }
  function letter(i) { return String.fromCharCode(65 + i); }
  function letters(n) { var a = []; for (var i = 0; i < n; i++) a.push(letter(i)); return a; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function mc(choices, right, keep) { return { t: 'mc', choices: choices, v: right, keep: keep !== false }; }
  // shuffle the right answer in among wrong ones; returns an mc spec (kept in this order so steps can refer to it)
  function among(R, right, wrongs) { var all = R.shuffle([right].concat(wrongs)); return mc(all, all.indexOf(right)); }
  // a quiet draw-pics picture
  function pics(kind, extra, label) { return { name: 'draw-pics', opts: Object.assign({ kind: kind, quiet: true, interactive: false, label: label || 'Drawings, lettered' }, extra || {}) }; }
  // a bank question: { q, c: [right, wrong, wrong…], s: steps, h: hint }; level 1 keeps two choices, level 2 three,
  // level 3 all of them. NAME in any text becomes a learner's name.
  function bank(R, list, L) {
    var Q = R.pick(list), nm = who(R), n = L === 1 ? 2 : L === 2 ? 3 : Q.c.length;
    var wrong = R.sample(Q.c.slice(1), M.min(n - 1, Q.c.length - 1));
    var fill = function (s) { return s.replace(/NAME/g, nm); };
    return { q: fill(Q.q), a: among(R, fill(Q.c[0]), wrong.map(fill)), steps: Q.s.map(fill), hint: fill(Q.h) };
  }


  // ================================================================ unit 1: tools and materials
  // ---------------------------------------------------------------- draw.pencil-grades
  var H_GR = ['6H', '4H', '2H', 'H'], B_GR = ['B', '2B', '4B', '6B', '8B'];
  function an(g) { return (/^(H|F|8)/.test(g) ? 'an ' : 'a ') + g; }
  function gradeWhy(g) { return g === 'HB' ? 'HB is the middle grade' : g === 'F' ? 'F sits between H and HB' : g.indexOf('H') >= 0 ? g + ' is an H (hard) pencil' : g + ' is a B (soft, black) pencil'; }
  G('draw.pencil-grades', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var h = R.pick(H_GR), b = R.pick(B_GR), want = R.pick(['darker', 'lighter']), pair = R.shuffle([h, b]);
      var dark = Ak.darkerPencil(h, b), ans = want === 'darker' ? dark : (dark === h ? b : h);
      return { q: 'Which pencil makes the ' + want + ' line: <b>' + an(pair[0]) + '</b> or <b>' + an(pair[1]) + '</b>?', a: mc(pair, pair.indexOf(ans)),
        steps: [gradeWhy(h) + '; H pencils make lighter lines.', gradeWhy(b) + '; B pencils make darker lines.', 'So the ' + ans + ' makes the ' + want + ' line.'], hint: 'H means hard (light); B means black (soft, dark).' };
    }
    if (L === 2) { // the trouble spot: two grades of the same letter, or F against HB
      var fam = R.pick(['H', 'B', 'F']), g2;
      if (fam === 'F') g2 = ['F', 'HB']; else g2 = R.sample(fam === 'H' ? H_GR : B_GR, 2);
      var w2 = R.pick(['darker', 'lighter']), d2 = Ak.darkerPencil(g2[0], g2[1]), ans2 = w2 === 'darker' ? d2 : (d2 === g2[0] ? g2[1] : g2[0]);
      var ch = R.shuffle(g2.slice()); ch.push('They make the same line');
      var st = fam === 'H' ? ['Both are H pencils. For H pencils, a bigger number means harder and lighter.'] : fam === 'B' ? ['Both are B pencils. For B pencils, a bigger number means softer and darker.'] : ['F (fine) sits between H and HB on the scale, so it is a little harder and lighter than HB.'];
      return { q: 'Which pencil makes the ' + w2 + ' line: <b>' + an(ch[0]) + '</b> or <b>' + an(ch[1]) + '</b>?', a: mc(ch, ch.indexOf(ans2)),
        steps: st.concat(['So the ' + ans2 + ' makes the ' + w2 + ' line.']), hint: fam === 'H' ? 'Careful: with H pencils, the bigger number is lighter.' : fam === 'B' ? 'With B pencils, the bigger number is darker.' : 'The scale runs … H, F, HB, B …' };
    }
    if (R.coin()) { // which lettered pencil is which grade? lines drawn at the same pressure
      var gs = R.pick([['2H', 'HB', '6B'], ['4H', '2B', '8B'], ['6H', 'H', '4B'], ['2H', '2B', '6B'], ['4H', 'HB', '4B']]), order = R.shuffle(gs.slice());
      var ask = R.pick(gs), ranks = gs.slice().sort(function (a, b) { return Ak.pencilRank(a) - Ak.pencilRank(b); }), place = ranks.indexOf(ask);
      return { q: 'Three pencils, ' + an(gs[0]) + ', ' + an(gs[1]) + ' and ' + an(gs[2]) + ', drew these lines with the same pressure. Which pencil is the <b>' + ask + '</b>?',
        viz: { name: 'ar-value', opts: { mode: 'pencils', grades: order, quiet: true, hideNames: true, interactive: false, label: 'Three lettered pencils and the lines they made' } },
        a: mc(['A', 'B', 'C'], order.indexOf(ask)),
        steps: ['From lightest to darkest the grades go ' + ranks.join(', ') + '.', 'The ' + ask + ' makes the ' + (place === 0 ? 'lightest' : place === 2 ? 'darkest' : 'middle') + ' line.', 'That is pencil ' + letter(order.indexOf(ask)) + '.'],
        hint: 'Put the three grades in order from hard (light) to soft (dark), then match the lines.' };
    }
    return bank(R, [
      { q: 'NAME wants light layout lines that are easy to erase and will not smudge. Which grade fits best?', c: ['2H', '6B', '8B'], s: ['Layout lines should be light and crisp.', 'A hard H pencil makes light, crisp lines that smudge little.', 'So 2H.'], h: 'Light and crisp: H or B?' },
      { q: 'NAME needs the darkest darks in a shadow. Which grade fits best?', c: ['6B', '2H', '4H'], s: ['Dark values need a soft pencil.', 'A high B number is soft and dark.', 'So 6B.'], h: 'Dark means a soft B pencil.' },
      { q: 'Which grade is the middle grade found in most writing pencils?', c: ['HB', '6H', '8B'], s: ['HB sits between the H and B pencils.', 'It is the usual writing pencil.'], h: 'It has both letters.' },
      { q: 'What does the B in a pencil grade stand for?', c: ['Black: a softer, darker pencil', 'Bold: a harder, lighter pencil', 'Blue'], s: ['B stands for black.', 'B pencils are softer and make darker lines.'], h: 'H stands for hard. B is the opposite end.' },
      { q: 'Why does a 6B smudge more than a 2H?', c: ['It has more graphite and less clay, so it leaves more soft graphite on the paper', 'It has more clay', 'It is sharper'], s: ['The core is graphite mixed with clay.', 'Soft B pencils have more graphite, which leaves more on the paper and smudges.'], h: 'What is the core made of?' }], L);
  });

  // ---------------------------------------------------------------- draw.paper-erasers
  var PAPER_1 = [
    { q: 'NAME wants to lighten a shadow a little without removing it. What works best?', c: ['Pressing and lifting with a kneaded eraser', 'Scrubbing hard with a vinyl eraser', 'Going over it with a harder pencil'], s: ['NAME wants to lighten, not remove.', 'A kneaded eraser lifts a little graphite each time it is pressed and lifted.'], h: 'Lighten a little: dab or scrub?' },
    { q: 'Which eraser can you shape into a point for a tiny highlight?', c: ['A kneaded eraser', 'A vinyl eraser', 'The eraser on the end of a pencil'], s: ['A kneaded eraser is a soft putty.', 'You can mold it into a point.'], h: 'Which one is soft like putty?' },
    { q: 'Which eraser removes a stray line most completely, with a crisp edge?', c: ['A vinyl eraser', 'A kneaded eraser', 'A tissue'], s: ['A vinyl eraser is firmer.', 'It cleans more completely and leaves crisp edges.'], h: 'Firm or soft?' },
    { q: 'What is the "tooth" of a paper?', c: ['Tiny bumps on its surface that grab graphite', 'How thick the paper is', 'The paper\'s color'], s: ['Paper has tiny bumps on its surface.', 'They scrape graphite off the pencil and hold it. That is the tooth.'], h: 'It has to do with the surface.' },
    { q: 'Which paper suits fine pen-and-ink lines best?', c: ['Smooth (plate) Bristol board', 'Newsprint', 'Rough charcoal paper'], s: ['Ink lines need a smooth, sturdy surface.', 'Smooth (plate) Bristol board is made for that.'], h: 'Fine lines want a smooth surface.' },
    { q: 'Which paper is cheap and good for quick gesture practice?', c: ['Newsprint', 'Smooth Bristol board', 'Heavy watercolor paper'], s: ['Gesture practice uses lots of paper.', 'Newsprint is thin and cheap. It yellows with time, so it is for practice, not keepers.'], h: 'Think cheap and thin.' }];
  var PAPER_2 = [
    { q: 'NAME scrubbed hard at a dark spot. Now new shading there looks blotchy. Why?', c: ['Scrubbing roughed up the paper and flattened its tooth', 'The pencil was too sharp', 'The eraser added color'], s: ['Hard scrubbing damages the paper fibers and flattens the tooth.', 'Graphite then catches unevenly there, so it looks blotchy.'], h: 'What did scrubbing do to the paper?' },
    { q: 'How do you lighten a tone with a kneaded eraser?', c: ['Press it on the paper and lift (dab)', 'Rub it back and forth as hard as you can', 'Wet it first'], s: ['A kneaded eraser picks graphite up when pressed.', 'Dab and lift, a little at a time.'], h: 'Lift, don\'t rub.' },
    { q: 'NAME\'s kneaded eraser is gray and dirty. What should NAME do?', c: ['Stretch and fold it until a clean part shows', 'Throw it away right away', 'Rub it on the drawing to clean it'], s: ['A kneaded eraser cleans itself.', 'Stretching and folding it hides the graphite inside.'], h: 'It is like putty.' },
    { q: 'Why does charcoal work better on paper with some tooth?', c: ['The bumps catch and hold the charcoal powder', 'Smooth paper makes charcoal lighter by magic', 'Tooth makes the paper waterproof'], s: ['Charcoal is a loose powder.', 'The tooth catches and holds it.'], h: 'What does tooth do?' }];
  var JOBS = [['Lighten a shadow a little', 0], ['Lift a soft highlight out of charcoal', 0], ['Make a tiny point for a small highlight', 0], ['Erase without leaving crumbs', 0],
    ['Remove a stray line completely', 1], ['Clean along a sharp, crisp edge', 1], ['Erase all the guide lines at the end', 1]];
  G('draw.paper-erasers', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 3 && R.coin()) { // choose all the jobs for one eraser
      var tool = R.int(0, 1), yes = R.sample(JOBS.filter(function (j) { return j[1] === tool; }), 2), no = R.sample(JOBS.filter(function (j) { return j[1] !== tool; }), 2), all = R.shuffle(yes.concat(no));
      var v = []; all.forEach(function (j, i) { if (j[1] === tool) v.push(i); });
      return { q: 'Which jobs suit a <b>' + (tool ? 'vinyl' : 'kneaded') + ' eraser</b> best? Choose all that apply.', a: { t: 'mc', choices: all.map(function (j) { return j[0]; }), v: v, keep: true },
        steps: [tool ? 'A vinyl eraser is firm: it removes marks completely and leaves crisp edges.' : 'A kneaded eraser is soft putty: it lifts graphite by dabbing, can be shaped, and leaves no crumbs.'].concat(all.map(function (j) { return j[0] + ': ' + (j[1] ? 'vinyl' : 'kneaded') + '.'; })),
        hint: 'Kneaded: lift, lighten, shape. Vinyl: remove and clean edges.' };
    }
    return bank(R, L === 1 ? PAPER_1 : L === 2 ? PAPER_2.concat(PAPER_1.slice(0, 2)) : PAPER_2.concat(PAPER_1), L);
  });

  // ---------------------------------------------------------------- draw.pencil-grip
  var GRIP = [
    { q: 'NAME is drawing the tiny details of an eye. Which grip gives the most control?', c: ['The writing grip, near the point', 'The overhand grip, far from the point', 'Holding the very end of the pencil'], s: ['Small details need control.', 'Holding near the point, as for writing, gives the most control.'], h: 'Details: close to the point or far from it?' },
    { q: 'To shade a large area evenly, it works best to use…', c: ['the side of the lead, with an overhand grip', 'the sharp tip, with a writing grip', 'short dabs with a still wrist'], s: ['A big, even area needs broad strokes.', 'The side of the lead covers more paper with each stroke.'], h: 'Which part of the lead covers the most paper?' },
    { q: 'Long, smooth lines across the page come from moving…', c: ['the elbow or shoulder', 'only the fingers', 'only the wrist'], s: ['Every stroke swings around a pivot.', 'The elbow and shoulder are far from the point, so they sweep the longest, smoothest lines.'], h: 'The farther the pivot, the longer the arc.' },
    { q: 'Why can your shoulder make a longer, smoother line than your fingers?', c: ['Its pivot is far from the point, so it swings a long arc', 'The shoulder presses harder', 'The pencil gets softer'], s: ['A stroke swings around a pivot.', 'A pivot far from the point swings a long, gentle arc.'], h: 'Think about the size of the swing.' },
    { q: 'NAME\'s long lines come out short, stiff and hairy. What is the most likely cause?', c: ['Drawing everything with a writing grip and a still wrist', 'Using a soft pencil', 'Using paper with tooth'], s: ['Short, hairy lines come from many small finger strokes.', 'Holding farther back and moving the arm gives long, sure lines.'], h: 'What moves when you draw?' },
    { q: 'Paper lying flat on a table often makes drawings come out stretched. What helps?', c: ['Tilt the paper toward you on a board or easel', 'Press harder', 'Use a harder pencil'], s: ['Flat paper is seen at a slant.', 'Tilting it toward you lets you see it straight on.'], h: 'How do you see flat paper from your seat?' }];
  G('draw.pencil-grip', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 3 && R.coin()) { // match a job to a grip and a motion
      var jobs = [['the long curve of a hillside', 'overhand', 'shoulder or elbow'], ['the letters on a sign', 'writing', 'fingers'], ['the stitching on a baseball', 'writing', 'fingers'], ['a big, even gray background', 'overhand', 'elbow'], ['the edge of a long table', 'overhand', 'elbow or shoulder'], ['the tiny veins in a leaf', 'writing', 'fingers']];
      var j = R.pick(jobs), right = j[1] === 'writing' ? 'Writing grip near the point; move the fingers' : 'Overhand grip farther back; move the ' + j[2], wrong = j[1] === 'writing' ? ['Overhand grip farther back; move the shoulder', 'Writing grip; keep the whole hand still'] : ['Writing grip near the point; move only the fingers', 'Overhand grip; keep the arm still and move only the fingers'];
      return { q: 'Which grip and motion fit best for drawing ' + j[0] + '?', a: among(R, right, wrong),
        steps: [j[1] === 'writing' ? 'This is a small, careful job.' : 'This is a long line or a big area.', j[1] === 'writing' ? 'Hold near the point and let the fingers move.' : 'Hold farther back and let the ' + j[2] + ' move.'], hint: 'Small and careful, or long and broad?' };
    }
    return bank(R, GRIP, L);
  });

  // ---------------------------------------------------------------- draw.other-media
  var MEDIA = [
    { q: 'Which medium cannot be erased once it is dry?', c: ['Ink', 'Vine charcoal', 'A graphite pencil'], s: ['Ink soaks into the paper and dries there.', 'It is permanent.'], h: 'Which one soaks in?' },
    { q: 'Which charcoal is light and dusts off easily, good for laying in a drawing?', c: ['Vine (or willow) charcoal', 'Compressed charcoal', 'A charcoal pencil'], s: ['Vine charcoal has no binder.', 'It is light and dusts off easily.'], h: 'Which one has no binder?' },
    { q: 'Which charcoal is darker and harder to erase?', c: ['Compressed charcoal', 'Vine charcoal', 'Willow charcoal'], s: ['Compressed charcoal is bound together with a binder.', 'It is denser, darker and harder to erase.'], h: 'Which one is pressed together with a binder?' },
    { q: 'Which medium builds color by layering lightly?', c: ['Colored pencil', 'Ink', 'Compressed charcoal'], s: ['Colored pencil goes on in light layers.', 'Layered colors mix on the paper.'], h: 'Layers of color…' },
    { q: 'In colored pencil, what is burnishing?', c: ['Pressing hard at the end for a smooth, shiny finish', 'Erasing with a vinyl eraser', 'Drawing on wet paper'], s: ['Burnishing presses the last layers hard.', 'It fills the tooth and leaves a smooth, shiny finish.'], h: 'It happens at the end, with pressure.' },
    { q: 'NAME wants to make an ink drawing of a tree. How should NAME start?', c: ['Sketch it lightly in pencil first', 'Start with the darkest ink at once', 'Wet the paper first'], s: ['Ink cannot be erased.', 'A light pencil sketch can be erased after the ink is fully dry.'], h: 'Can you fix ink?' },
    { q: 'NAME tried to erase a charcoal line, and a gray smear stayed. Why?', c: ['Charcoal is loose powder that smears instead of erasing cleanly', 'The eraser was too clean', 'Charcoal soaks into paper like ink'], s: ['Charcoal sits on the paper as loose powder.', 'Rubbing moves it around and leaves a gray ghost.'], h: 'How does charcoal sit on the paper?' },
    { q: 'Why rest your drawing hand on a scrap of paper when using charcoal?', c: ['So your hand does not smudge the drawing', 'To make the lines darker', 'To make the paper smoother'], s: ['Charcoal smudges easily.', 'The scrap keeps your hand off the drawing.'], h: 'What happens when a hand slides over charcoal?' },
    { q: 'After you burnish colored pencil, the paper…', c: ['takes few more layers', 'takes many more layers easily', 'turns back to fresh paper'], s: ['Burnishing fills the paper\'s tooth.', 'With the tooth full, new layers do not stick well.'], h: 'What fills up the tooth?' }];
  G('draw.other-media', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 3 && R.coin()) { // pick the medium from a description of a plan
      var plans = [['a quick, light first sketch you will change a lot, then darken', 'Vine charcoal'], ['crisp, permanent lines for a comic, with tone made from hatching', 'Ink'], ['a realistic apple, red and yellow mixed in many light layers', 'Colored pencil'], ['big, rich black shadows in a large drawing', 'Compressed charcoal']];
      var pl = R.pick(plans), others = plans.filter(function (q) { return q !== pl; }).map(function (q) { return q[1]; });
      return { q: 'Which medium fits this plan best: ' + pl[0] + '?', a: among(R, pl[1], R.sample(others, 2)),
        steps: ['Vine charcoal is light and dusts off; compressed charcoal is dark and rich; ink is permanent; colored pencil layers color.', 'So ' + pl[1].toLowerCase() + ' fits best.'], hint: 'Match the plan to how each medium behaves.' };
    }
    return bank(R, MEDIA, L);
  });


  // ================================================================ unit 2: line
  // ---------------------------------------------------------------- draw.line-weight
  var WEIGHT_WHERE = [
    ['the far edge of a table', 'Lighter', 'Far edges are drawn lighter, so they sit back.'],
    ['the edge of a ball on its shadow side', 'Heavier', 'Shadow-side edges look darker, so their lines are heavier.'],
    ['small wrinkles on a shirt', 'Lighter', 'Small details get lighter lines, so they do not take over.'],
    ['the bottom of a vase, where it sits on the table', 'Heavier', 'Where an object sits, a heavier line anchors it.'],
    ['the outline of hills far away', 'Lighter', 'Far things look paler and softer, so their lines are lighter.'],
    ['the edge of an apple on the side facing the light', 'Lighter', 'Lit edges look light, so their lines are lighter.'],
    ['the front edge where one book overlaps another', 'Heavier', 'Where forms overlap, the front edge gets the heavier line.']];
  var WEIGHT_PAIRS = [
    { q: 'One apple overlaps another. Which edge gets the heavier line?', c: ['The front apple\'s edge where it crosses the back apple', 'The back apple\'s edge', 'Both the same weight'], s: ['Where forms overlap, the front edge should read first.', 'A heavier line comes forward.'], h: 'Which apple is in front?' },
    { q: 'Light comes from the left onto a box. Which side\'s outline gets the heavier line?', c: ['The right side, away from the light', 'The left side, facing the light', 'Both the same weight'], s: ['Edges on the shadow side look darker.', 'The right side is away from the light.'], h: 'Which side is in shadow?' },
    { q: 'NAME draws a fence in front and mountains far behind. Which gets the heavier lines?', c: ['The fence in front', 'The mountains far behind', 'Both the same weight'], s: ['Near things look sharper and stronger.', 'So the near fence gets heavier lines and the far mountains lighter ones.'], h: 'Near or far?' },
    { q: 'A cup sits on a table. Which edge gets the heavier line?', c: ['The bottom edge, where the cup sits', 'The far edge of the rim', 'Both the same weight'], s: ['A heavier line where an object sits anchors it to the table.', 'The far rim is a far edge, so it stays lighter.'], h: 'Where does the cup touch the table?' },
    { q: 'NAME\'s drawing uses one line weight everywhere. How does it look?', c: ['Flat, like a page in a coloring book', 'Deep and solid', 'Shaded'], s: ['One weight everywhere gives the eye no clues about light or depth.', 'The drawing looks flat.'], h: 'What does varied weight add?' }];
  G('draw.line-weight', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1 && R.chance(0.45)) {
      var w1 = R.pick(WEIGHT_WHERE);
      return { q: 'Should the line for <b>' + w1[0] + '</b> be heavier or lighter than the lines around it?', a: mc(['Heavier', 'Lighter'], w1[1] === 'Heavier' ? 0 : 1),
        steps: [w1[2], 'So: ' + w1[1].toLowerCase() + '.'], hint: 'Heavier: near, shadow side, overlaps, contact. Lighter: far, lit side, small details.' };
    }
    if (L === 1) {
      var good = R.pick(['A', 'B']), askFlat = R.coin();
      return { q: askFlat ? 'Which mug drawing uses <b>one line weight everywhere</b>?' : 'Which mug drawing uses <b>varied line weight</b>?',
        viz: { name: 'ar-lines', opts: { mode: 'weight', good: good, quiet: true, interactive: false, label: 'Two drawings of a mug, A and B' } },
        a: mc(['A', 'B'], askFlat ? (good === 'A' ? 1 : 0) : (good === 'A' ? 0 : 1)),
        steps: ['Drawing ' + good + ' has heavier lines on one side and at the bottom, and lighter lines on top.', 'The other drawing uses the same weight everywhere.', 'So the answer is ' + (askFlat ? (good === 'A' ? 'B' : 'A') : good) + '.'], hint: 'Compare the bottom of each mug with its top rim.' };
    }
    if (L === 2) return bank(R, WEIGHT_PAIRS, 2);
    var hv = R.pick(WEIGHT_WHERE.filter(function (x) { return x[1] === 'Heavier'; })), lt = R.pick(WEIGHT_WHERE.filter(function (x) { return x[1] === 'Lighter'; })), pr = R.shuffle([hv, lt]), askH = R.coin(), tgt = askH ? hv : lt;
    return { q: 'In one drawing, which gets the <b>' + (askH ? 'heavier' : 'lighter') + '</b> line: ' + pr[0][0] + ', or ' + pr[1][0] + '?', a: mc([cap(pr[0][0]), cap(pr[1][0])], pr.indexOf(tgt)),
      steps: [cap(hv[0]) + ': ' + hv[2], cap(lt[0]) + ': ' + lt[2], 'So the ' + (askH ? 'heavier' : 'lighter') + ' line goes on ' + tgt[0] + '.'], hint: 'Heavier: near, shadow side, overlaps, contact. Lighter: far, lit side, small details.' };
  });

  // ---------------------------------------------------------------- draw.contour
  var CONT = [
    { q: 'What does a contour line follow?', c: ['The edges of a form, inside and outside', 'Only the outside outline', 'Only the shadows'], s: ['A contour follows edges.', 'That includes inner edges such as folds and overlaps, not only the outline.'], h: 'Is it only the outline?' },
    { q: 'How fast should you draw a contour drawing?', c: ['Slowly, as your eye moves along the edge', 'As fast as you can', 'In quick dots'], s: ['The pencil moves at the speed of your eye.', 'Contour drawing is slow on purpose.'], h: 'Think of an ant walking along the edge.' },
    { q: 'During a contour drawing, where do you look most of the time?', c: ['At the object', 'At the paper', 'At your pencil'], s: ['Contour drawing trains looking.', 'You look at the object much more than at the paper.'], h: 'What are you drawing from?' },
    { q: 'NAME drew only the outside outline of a jacket. What is missing to make it a contour drawing?', c: ['The inside edges: folds, the collar and the cuffs', 'Shading on the shadow side', 'A colored background'], s: ['A contour drawing follows inside edges too.', 'The folds, collar and cuffs are edges inside the outline.'], h: 'Look inside the outline.' },
    { q: 'Why does a contour drawing look more like the real object than a drawing from memory?', c: ['You follow the true edges instead of drawing a symbol', 'You use a softer pencil', 'You shade it more'], s: ['From memory, the hand draws a symbol of the thing.', 'Following real edges slowly shows the true shapes.'], h: 'What does memory give you?' }];
  var MUG_EDGES = [['the outside outline', 1], ['the far edge of the rim', 1], ['the inside edge of the handle', 1], ['the line where the handle meets the cup', 1], ['the gray tone of the shadow side', 0], ['the shine of the highlight, shaded around', 0], ['a value scale beside it', 0]];
  G('draw.contour', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 3 && R.coin()) {
      var yes = R.sample(MUG_EDGES.filter(function (e) { return e[1]; }), R.int(2, 3)), no = R.sample(MUG_EDGES.filter(function (e) { return !e[1]; }), 2), all = R.shuffle(yes.concat(no)), v = [];
      all.forEach(function (e, i) { if (e[1]) v.push(i); });
      return { q: 'A contour drawing of a coffee mug follows edges. Which of these would it include? Choose all that apply.', a: { t: 'mc', choices: all.map(function (e) { return cap(e[0]); }), v: v, keep: true },
        steps: ['A contour line follows edges, outside and inside.', 'Edges: ' + yes.map(function (e) { return e[0]; }).join('; ') + '.', 'Tone and shading are not edges: ' + no.map(function (e) { return e[0]; }).join('; ') + '.'], hint: 'Is it an edge, or a tone?' };
    }
    return bank(R, CONT, L);
  });

  // ---------------------------------------------------------------- draw.blind-contour
  var BLIND = [
    { q: 'In a blind contour drawing, where do you look?', c: ['Only at the object, never at the paper', 'Only at the paper', 'Back and forth every second'], s: ['That is what "blind" means here.', 'You look only at the object.'], h: 'What does "blind" mean here?' },
    { q: 'What is a blind contour drawing for?', c: ['Training slow, careful looking', 'Making a finished picture to frame', 'Practicing shading'], s: ['The result usually looks odd.', 'The point is the looking: eye and hand moving together.'], h: 'Is the picture the goal?' },
    { q: 'NAME\'s blind contour of a plant looks lumpy, and the lines do not meet. What does that mean?', c: ['Nothing is wrong: odd results are normal', 'The exercise failed', 'NAME should peek more next time'], s: ['A blind contour is judged by the looking, not by how it looks.', 'Lumpy, odd results are normal.'], h: 'What is the goal of the exercise?' },
    { q: 'How is a modified contour different from a blind contour?', c: ['You may glance at the paper to place the pencil when you lift it', 'You trace a photo', 'You draw with your eyes closed'], s: ['In a modified contour you look mostly at the object.', 'You glance down only to place the pencil.'], h: 'It is a step between blind contour and ordinary drawing.' },
    { q: 'How can you keep from seeing your paper during a blind contour?', c: ['Turn your chair, or cover your drawing hand with a paper plate', 'Close both eyes', 'Turn off the lights'], s: ['You still need to see the object.', 'So hide only the paper: turn away from it or cover your hand.'], h: 'You must still see the object.' },
    { q: 'About how long does a blind contour drawing usually take?', c: ['A few minutes, drawn slowly', 'A few seconds, drawn fast', 'Several hours, with shading'], s: ['It is slow, careful looking.', 'Two to five minutes is typical.'], h: 'Slow or fast?' }];
  BLIND.push(
    { q: 'NAME wants to try a blind contour. Which subject works well?', c: ['A hand, a plant or a shoe, with many edges to follow', 'A blank white wall', 'A perfectly round plate'], s: ['A blind contour follows edges slowly.', 'A subject with many edges and turns gives the eye plenty to follow.'], h: 'You need edges to follow.' },
    { q: 'How should the pencil move in a blind contour?', c: ['Slowly, at the same speed as your eye along the edge', 'In quick, short dashes', 'Only when you look at the paper'], s: ['The hand follows the eye.', 'Both move slowly together.'], h: 'Hand and eye move together.' },
    { q: 'Who made contour and blind contour exercises famous in a 1941 book for art students?', c: ['Kimon Nicolaides, in The Natural Way to Draw', 'Leonardo da Vinci', 'Vincent van Gogh'], s: ['Kimon Nicolaides taught at the Art Students League in New York.', 'His book The Natural Way to Draw (1941) built a course around these exercises.'], h: 'The book is The Natural Way to Draw.' },
    { q: 'During a blind contour, NAME feels the urge to peek at the paper. What should NAME do?', c: ['Keep looking at the object until the time is up', 'Peek and fix the lines', 'Stop and start a new drawing'], s: ['Peeking turns the drawing back toward what you expect.', 'Keep your eyes on the object.'], h: 'What is the rule of a blind contour?' });
  var BL_YES = ['Look only at the object', 'Move the pencil slowly', 'Keep one continuous line if you can', 'Set a timer for a few minutes'], BL_NO = ['Check the paper often', 'Shade the shadows', 'Erase lines that look odd', 'Draw as fast as you can'];
  G('draw.blind-contour', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 3 && R.coin()) {
      var yes = R.sample(BL_YES, R.int(2, 3)), no = R.sample(BL_NO, 2), all = R.shuffle(yes.concat(no)), v = [];
      all.forEach(function (c, i) { if (yes.indexOf(c) >= 0) v.push(i); });
      return { q: 'Which of these belong in a blind contour drawing? Choose all that apply.', a: { t: 'mc', choices: all, v: v, keep: true },
        steps: ['A blind contour is slow, careful looking at the object, never at the paper.', 'It belongs: ' + yes.join('; ') + '.', 'It does not: ' + no.join('; ') + '.'], hint: 'Eyes on the object, slow, no fixing.' };
    }
    return bank(R, BLIND, L);
  });

  // ---------------------------------------------------------------- draw.cross-contour
  var XC_FORMS = ['sphere', 'cylinder', 'cone'], XC_NAME = { sphere: 'ball', cylinder: 'can', cone: 'cone' };
  var XCQ = [
    { q: 'You draw stripes around a soup can seen from a little above. Which way does each stripe bend?', c: ['It bows downward, like the curve of the can\'s bottom', 'It bows upward', 'It stays straight'], s: ['Seen from above, the near side of each ring sits lower on the page than the far side.', 'So each stripe bows downward, like the bottom edge.'], h: 'Look at how the bottom of the can curves.' },
    { q: 'You look up at stripes on a tall round chimney, high above your eyes. Which way do they bend?', c: ['They bow upward', 'They bow downward', 'They stay straight'], s: ['Above eye level you see the rings from below.', 'The near side of each ring looks higher than the far side, so the stripes bow upward.'], h: 'Above eye level, everything flips.' },
    { q: 'On a flat tabletop, cross-contour lines…', c: ['run straight', 'curve like stripes on a ball', 'zigzag'], s: ['Cross-contour lines follow the surface.', 'A flat surface does not bend, so the lines are straight.'], h: 'Does a tabletop curve?' },
    { q: 'What is contour hatching?', c: ['Hatching that curves to follow the form', 'Hatching in every direction', 'Dots instead of lines'], s: ['It is hatching that follows the surface,', 'like cross-contour lines.'], h: 'Contour means following the form.' },
    { q: 'NAME drew straight lines across a drawing of a ball. How does it look?', c: ['Flat, like a disc', 'Rounder than before', 'Shiny'], s: ['Straight lines say "flat."', 'Across a ball they flatten it.'], h: 'What does a straight line say?' }];
  XCQ.push(
    { q: 'Which of these is a good everyday example of cross-contour lines?', c: ['The stripes around a beach ball', 'The edge of a sheet of paper', 'A straight road on a map'], s: ['Cross-contour lines wrap across a surface.', 'Stripes on a beach ball curve around it.'], h: 'Which one wraps around a form?' },
    { q: 'Cross-contour lines can show a form is round even…', c: ['without any shading', 'without any lines', 'only in color'], s: ['The bend of the lines alone tells the eye how the surface curves.', 'No shading is needed.'], h: 'What do the lines alone tell you?' },
    { q: 'How is a cross-contour line different from a contour line?', c: ['It runs across the surface instead of along an edge', 'It is always darker', 'It is drawn with ink only'], s: ['A contour line follows an edge.', 'A cross-contour line runs across the surface, following its curve.'], h: 'Along the edge, or across the surface?' });
  G('draw.cross-contour', function (R, ctx) {
    var L = ctx.level || 1;
    if (L <= 2 && R.chance(0.3)) return bank(R, XCQ, L);
    if (L === 1) {
      var f = R.pick(XC_FORMS), first = R.coin(), items = first ? [{ form: f, lines: 'wrap' }, { form: f, lines: 'flat' }] : [{ form: f, lines: 'flat' }, { form: f, lines: 'wrap' }], askRound = R.coin(), ans = askRound ? (first ? 0 : 1) : (first ? 1 : 0);
      return { q: 'Both drawings show a ' + XC_NAME[f] + ' with lines across it. Which one ' + (askRound ? 'looks <b>round</b>' : 'looks <b>flat</b>') + '?', viz: pics('xcontour', { items: items, columns: 2 }, 'Two drawings with lines across a form, A and B'),
        a: mc(['A', 'B'], ans), steps: ['In drawing ' + letter(first ? 0 : 1) + ' the lines curve around the surface.', 'In drawing ' + letter(first ? 1 : 0) + ' they run straight across, which reads as flat.', 'So the answer is ' + letter(ans) + '.'], hint: 'Do the lines bend with the surface?' };
    }
    if (L === 2) {
      var f2 = R.sample(XC_FORMS, 2), its = R.shuffle([{ form: f2[0], lines: 'wrap' }, { form: f2[0], lines: 'flat' }, { form: f2[1], lines: 'flat' }]), k;
      its.forEach(function (it, i) { if (it.lines === 'wrap') k = i; });
      return { q: 'Which drawing uses cross-contour lines correctly, so the form looks solid?', viz: pics('xcontour', { items: its }, 'Three drawings of forms with lines across them, A, B and C'),
        a: mc(['A', 'B', 'C'], k), steps: its.map(function (it, i) { return letter(i) + ': ' + (it.lines === 'wrap' ? 'the lines curve with the ' + XC_NAME[it.form] + '\'s surface.' : 'the lines run straight across, so the ' + XC_NAME[it.form] + ' looks flat.'); }).concat(['So the answer is ' + letter(k) + '.']),
        hint: 'Cross-contour lines curve with a round surface.' };
    }
    return bank(R, XCQ, 3);
  });

  // ---------------------------------------------------------------- draw.gesture
  var GEST = [
    { q: 'What do you draw first in a gesture drawing?', c: ['The line of action through the whole pose', 'The face', 'The fingers'], s: ['A gesture catches movement.', 'One curve through the whole pose, the line of action, comes first.'], h: 'What carries the movement?' },
    { q: 'About how long does a gesture drawing take?', c: ['From about thirty seconds to a few minutes', 'About an hour', 'A whole afternoon'], s: ['Gesture drawings are quick.', 'Thirty seconds to a few minutes is typical.'], h: 'Quick or slow?' },
    { q: 'What does a gesture drawing try to catch?', c: ['The movement and weight of the pose', 'Every fold and button', 'The exact colors'], s: ['Details can come later.', 'A gesture catches movement, weight and direction.'], h: 'Big idea or small details?' },
    { q: 'NAME starts a thirty-second gesture by drawing the eyes carefully. What usually happens?', c: ['Time runs out with a careful head and no body', 'The pose comes out full of movement', 'The drawing is finished early'], s: ['Thirty seconds is very short.', 'Starting with a detail uses up the time; start with the line of action.'], h: 'How much time is there?' },
    { q: 'Why is a short time limit useful in gesture drawing?', c: ['It makes you look at the whole pose at once', 'It makes the lines darker', 'It saves paper'], s: ['There is no time for details.', 'So you see and draw the whole pose.'], h: 'What can you not do in thirty seconds?' }];
  GEST.push(
    { q: 'Which lines suit a gesture drawing?', c: ['Loose, light lines from the elbow', 'Tiny, careful strokes from the fingers', 'Dark, heavy outlines'], s: ['Gesture is fast and loose.', 'Light lines from the elbow move quickly and freely.'], h: 'Fast and loose.' },
    { q: 'NAME has a one-minute pose of a friend leaning on a wall. After the line of action, what comes next?', c: ['The big masses: head, chest and hips', 'The eyelashes', 'The pattern on the shirt'], s: ['The line of action carries the pose.', 'Then hang the head, chest and hips on it.'], h: 'Big masses before details.' },
    { q: 'What is a line of action?', c: ['One curve that runs through the whole pose', 'The outline of the hands', 'A shadow on the floor'], s: ['It is a single curve from the head down through the body.', 'It shows the movement of the whole pose.'], h: 'One line for the whole pose.' });
  G('draw.gesture', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1 && R.chance(0.4)) {
      var right = 'The line of action', wrongs = ['A cast shadow', 'A contour line of the shirt'];
      return { q: 'In this gesture drawing of a clothed mannequin, what is the dashed curve called?', viz: { name: 'ar-proportion', opts: { mode: 'gesture', bend: R.pick([0.6, 0.8, -0.6, -0.8]), quiet: true, interactive: false, label: 'A mannequin with a dashed curve through the pose' } },
        a: among(R, right, R.sample(wrongs, 1)), steps: ['The dashed curve runs through the whole pose, from the head to the foot.', 'That is the line of action.'], hint: 'It runs through the whole pose.' };
    }
    return bank(R, GEST, L);
  });


  // ================================================================ unit 3: shapes and forms
  // ---------------------------------------------------------------- draw.negative-space
  // dots for draw-pics kind 'neg' (200 × 160 picture): [x, y, positive?, what]
  var NEG_SPOTS = {
    chair: [[100, 33, 0, 'the gap between the top rail and the middle rail'], [100, 66, 0, 'the gap between the middle rail and the seat'], [100, 110, 0, 'the gap under the seat, above the rung'], [100, 139, 0, 'the gap under the rung, between the legs'], [22, 60, 0, 'the space around the chair'], [178, 40, 0, 'the space around the chair'],
      [100, 86, 1, 'the seat'], [45, 116, 1, 'a front leg'], [100, 16, 1, 'the top rail'], [139, 40, 1, 'a back post'], [100, 48, 1, 'the middle rail']],
    mug: [[143, 87, 0, 'the hole inside the handle'], [24, 140, 0, 'the space around the mug'], [178, 26, 0, 'the space around the mug'],
      [87, 86, 1, 'the body of the mug'], [164, 87, 1, 'the handle'], [87, 50, 1, 'the body of the mug']],
    stool: [[100, 70, 0, 'the gap between the legs, above the rung'], [100, 128, 0, 'the gap below the rung'], [20, 90, 0, 'the space around the stool'],
      [100, 34, 1, 'the seat'], [49, 94, 1, 'a leg'], [151, 94, 1, 'a leg']]
  };
  var NEGQ = [
    { q: 'The hole in a donut is…', c: ['negative space', 'positive space', 'a form'], s: ['The donut itself is positive space.', 'The empty space in the middle is negative space.'], h: 'Is the hole the object, or the space?' },
    { q: 'Why do artists draw negative shapes?', c: ['They are easier to judge, because we have no symbol for them', 'They are darker', 'They take less time to shade'], s: ['We know chairs, so we draw a symbol of a chair.', 'We have no idea of the gap\'s shape, so we look at it, and the object comes out right.'], h: 'What does your memory not know?' },
    { q: 'NAME\'s drawing of a chair looks wrong. What is a good thing to check?', c: ['The shapes of the gaps between the legs and rails', 'The color of the chair', 'How dark the pencil is'], s: ['Negative shapes share their edges with the chair.', 'If a gap has the wrong shape, an edge is in the wrong place.'], h: 'Look at the spaces, not the thing.' },
    { q: 'Negative space and positive space share…', c: ['their edges', 'their colors', 'nothing at all'], s: ['Every edge of the object is also an edge of the space around it.', 'So getting one right gets the other right.'], h: 'Where does a gap end?' }];
  G('draw.negative-space', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 3 && R.chance(0.4)) return bank(R, NEGQ, 3);
    var obj = R.pick(['chair', 'mug', 'stool']), all = NEG_SPOTS[obj], wantPos = L === 2 ? R.coin() : false;
    var pos = all.filter(function (s) { return s[2]; }), neg = all.filter(function (s) { return !s[2]; });
    var n = L === 1 ? 2 : 3, right = R.pick(wantPos ? pos : neg), others = R.sample((wantPos ? neg : pos), n - 1), spots = R.shuffle([right].concat(others));
    return { q: 'Which lettered dot sits in <b>' + (wantPos ? 'positive' : 'negative') + ' space</b>?', viz: pics('neg', { object: obj, spots: spots.map(function (s) { return [s[0], s[1]]; }) }, 'A ' + obj + ' in gray with lettered dots'),
      a: mc(letters(n), spots.indexOf(right)), steps: spots.map(function (s, i) { return letter(i) + ' is on ' + s[3] + ': ' + (s[2] ? 'positive' : 'negative') + ' space.'; }).concat(['So the answer is ' + letter(spots.indexOf(right)) + '.']),
      hint: 'Positive space is the object. Negative space is around it and between its parts.' };
  });

  // ---------------------------------------------------------------- draw.shapes-to-forms
  var SHAPE_KEYS = ['circle', 'square', 'triangle', 'rectangle'];
  var OBJ_FORM = [['a can of soup', 'cylinder'], ['an orange', 'sphere'], ['a party hat', 'cone'], ['a sugar cube', 'cube'], ['a die from a board game', 'cube'], ['a traffic cone', 'cone'], ['a basketball', 'sphere'], ['a roll of paper towels', 'cylinder'], ['a marble', 'sphere'], ['a new pencil, without the point', 'cylinder']];
  G('draw.shapes-to-forms', function (R, ctx) {
    var L = ctx.level || 1, F = A().FORMS;
    if (L === 1) {
      if (R.coin()) {
        var sh = R.pick(SHAPE_KEYS), right = F[sh], wrong = F[R.pick(SHAPE_KEYS.filter(function (k) { return k !== sh; }))];
        return { q: 'A flat <b>' + sh + '</b> grows into which solid form?', a: among(R, right, [wrong]), steps: ['A ' + sh + ' is a flat shape.', 'With depth it becomes a ' + right + '.'], hint: 'Circle to sphere, square to cube, triangle to cone, rectangle to cylinder.' };
      }
      var fm = R.pick(SHAPE_KEYS), fname = F[fm], wsh = R.pick(SHAPE_KEYS.filter(function (k) { return k !== fm; }));
      return { q: 'A <b>' + fname + '</b> starts from which flat shape?', a: among(R, fm, [wsh]), steps: ['The ' + fname + ' is the solid form of the ' + fm + '.', fm === 'rectangle' ? 'Seen from the side, a cylinder\'s outline is a rectangle.' : 'Its outline from the front is a ' + fm + '.'], hint: 'Think of its outline seen from the side or the front.' };
    }
    if (L === 2) {
      if (R.coin()) { // the trouble spot: shape or form?
        var items = [['a circle drawn on a page', 0], ['a basketball', 1], ['a square on a chessboard', 0], ['a sugar cube', 1], ['a triangle cut from paper', 0], ['an ice cream cone', 1], ['a rectangle painted on a wall', 0], ['a can of beans', 1]], it = R.pick(items);
        return { q: 'Is <b>' + it[0] + '</b> a shape or a form?', a: mc(['A shape (flat: height and width)', 'A form (solid: height, width and depth)', 'Neither'], it[1] ? 1 : 0),
          steps: [it[1] ? 'You could hold it; it has depth.' : 'It is flat; it has no depth.', 'So it is a ' + (it[1] ? 'form.' : 'shape.')], hint: 'Does it have depth?' };
      }
      var f3 = R.pick(['sphere', 'cube', 'cylinder', 'cone']), opts = R.shuffle([f3].concat(R.sample(['sphere', 'cube', 'cylinder', 'cone'].filter(function (q) { return q !== f3; }), 2)));
      return { q: 'Which form is shown, with light from one side?', viz: { name: 'ar-shade', opts: { form: f3, light: R.pick([30, 45, 135, 150]), parts: [], quiet: true, interactive: false, label: 'A shaded form on a table' } },
        a: mc(opts.map(cap), opts.indexOf(f3)), steps: ['Look at the outline and how the light turns across it.', 'It is a ' + f3 + '.'], hint: 'Is it round all over, boxy, round with flat ends, or pointed?' };
    }
    var o = R.pick(OBJ_FORM), wr = R.sample(['sphere', 'cube', 'cylinder', 'cone'].filter(function (q) { return q !== o[1]; }), 3);
    return { q: 'Which form is <b>' + o[0] + '</b> built on?', a: among(R, cap(o[1]), wr.map(cap)), steps: [cap(o[0]) + ' is ' + (o[1] === 'sphere' ? 'round in every direction' : o[1] === 'cube' ? 'a box with equal square sides' : o[1] === 'cylinder' ? 'long and round, with circles at its ends' : 'round at the base and pointed at the top') + '.', 'So it is a ' + o[1] + '.'], hint: 'Look at it from the side and from the end.' };
  });

  // ---------------------------------------------------------------- draw.drawing-boxes
  var BOXQ = [
    { q: 'When drawing a box at an angle, which edge do you draw first?', c: ['The nearest vertical edge', 'The farthest top edge', 'The back bottom corner'], s: ['Start with what is closest to you.', 'The nearest vertical edge sets the size of everything else.'], h: 'What is closest to you?' },
    { q: 'On paper, edges that are parallel on a real box should…', c: ['stay parallel or come together as they go back', 'spread apart as they go back', 'curve'], s: ['Farther things look smaller.', 'So receding edges stay parallel or come together, never spread apart.'], h: 'Do far things look bigger or smaller?' },
    { q: 'Why do the far edges of a box look a little shorter than the near ones?', c: ['Things farther away look smaller', 'Boxes are smaller at the back', 'The pencil was lighter there'], s: ['The box is the same size all over.', 'The far end only looks smaller because it is farther away.'], h: 'Is the real box smaller at the back?' },
    { q: 'At most, how many faces of a box can you see at one time?', c: ['3', '4', '6'], s: ['From any one point you can see at most three faces: for example the top, the front and one side.', 'The others face away.'], h: 'Try it with a real box.' },
    { q: 'NAME\'s box has a back edge longer than its front edge. What should NAME do?', c: ['Shorten the back edge so it is the same length or a little shorter', 'Make the front edge shorter too', 'Shade it darker'], s: ['The back edge is farther away.', 'It should look the same length or shorter, never longer.'], h: 'Which edge is farther away?' }];
  var BOX_SAY = { parallel: 'its back edges stay parallel', converge: 'its back edges come together a little', diverge: 'its back edges spread apart, so it looks warped' };
  G('draw.drawing-boxes', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 3 && R.chance(0.5)) return bank(R, BOXQ, 3);
    var good = L === 1 ? [R.pick(['parallel', 'converge'])] : ['parallel', 'converge'], its = R.shuffle(good.concat(['diverge']).map(function (v) { return { v: v, p: R.int(0, 2) }; })), bad;
    its.forEach(function (it, i) { if (it.v === 'diverge') bad = i; });
    var askBad = L === 2 || R.coin();
    if (L === 2 && R.chance(0.3)) return bank(R, BOXQ.slice(0, 2), 2);
    var ans = askBad ? bad : (bad === 0 ? 1 : 0);
    return { q: askBad ? 'Which box looks <b>warped</b>?' : 'Which box is drawn <b>correctly</b>?', viz: pics('box', { items: its, columns: its.length }, 'Lettered drawings of boxes'),
      a: mc(letters(its.length), ans), steps: its.map(function (it, i) { return letter(i) + ': ' + BOX_SAY[it.v] + '.'; }).concat(['Back edges should stay parallel or come together, never spread apart. So the answer is ' + letter(ans) + '.']),
      hint: 'Follow the edges that go back into space. Do they spread apart?' };
  });

  // ---------------------------------------------------------------- draw.ellipses
  var CUP_SAY = { good: 'smooth ellipses, with the bottom rounder than the top', flat: 'the bottom is a flat line', pointed: 'the top ellipse has pointed ends' };
  var ELLQ = [
    { q: 'You look at a glass on a table. Which ellipse looks rounder?', c: ['The base', 'The rim', 'They look exactly the same'], s: ['Both are below your eyes.', 'The base is farther below eye level, so its ellipse is rounder.'], h: 'Which one is farther from eye level?' },
    { q: 'Exactly at eye level, a circle seen edge-on looks like…', c: ['a straight line', 'a perfect circle', 'a square'], s: ['At eye level you see the circle exactly edge-on.', 'So it looks like a line.'], h: 'Hold a coin level with your eyes.' },
    { q: 'An ellipse has…', c: ['no corners or points: it is smooth all the way around', 'two sharp points', 'four corners'], s: ['It is a circle seen at an angle.', 'A circle has no corners, so its ellipse has none.'], h: 'What is it a picture of?' },
    { q: 'Looking straight down at a plate from above, it looks like…', c: ['a circle', 'a thin line', 'a triangle'], s: ['From straight above you see the plate face-on.', 'So it looks like a circle.'], h: 'Face-on or edge-on?' },
    { q: 'As a plate moves farther below your eye level, its ellipse gets…', c: ['rounder', 'thinner', 'pointed'], s: ['You look down on it more steeply.', 'You see more of its face, so it looks rounder.'], h: 'Do you see more or less of its face?' }];
  G('draw.ellipses', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var bad = R.pick(['flat', 'pointed']), its = R.shuffle([{ v: 'good' }, { v: bad }]), g = its[0].v === 'good' ? 0 : 1;
      return { q: 'Both cups sit below eye level. Which one has its ellipses drawn right?', viz: pics('cup', { items: its, columns: 2 }, 'Two drawings of a cup, A and B'), a: mc(['A', 'B'], g),
        steps: its.map(function (it, i) { return letter(i) + ': ' + CUP_SAY[it.v] + '.'; }).concat(['So the answer is ' + letter(g) + '.']), hint: 'Ellipses are smooth all the way around, and the bottom of a cup below eye level is rounder than the top.' };
    }
    if (L === 2 || R.coin()) { // which plate is nearest to (or farthest from) eye level? the horizon is hidden
      var hz = R.pick([0.35, 0.45, 0.55, 0.65]), maxD = M.max(hz - 0.03, 0.97 - hz), ds = R.sample([0.05, 0.22, 0.42, 0.6].filter(function (d) { return d <= maxD; }), 3), plates = [];
      ds.forEach(function (d) { var up = hz - d >= 0.03, dn = hz + d <= 0.97, y = up && dn ? (R.coin() ? hz + d : hz - d) : dn ? hz + d : hz - d; plates.push({ y: +y.toFixed(2), d: d }); });
      plates = R.shuffle(plates);
      var near = R.coin(), best = 0;
      plates.forEach(function (p, i) { if (near ? p.d < plates[best].d : p.d > plates[best].d) best = i; });
      return { q: 'Three plates are drawn at different heights. Which one is ' + (near ? '<b>closest to</b>' : '<b>farthest from</b>') + ' eye level?', viz: pics('plates', { horizon: hz, items: plates.map(function (p) { return { y: p.y }; }) }, 'Three plates drawn as ellipses, lettered'),
        a: mc(['A', 'B', 'C'], best), steps: ['An ellipse is thinnest near eye level and rounder the farther it is from eye level.', 'Plate ' + letter(best) + ' is the ' + (near ? 'thinnest' : 'roundest') + '.', 'So it is ' + (near ? 'closest to' : 'farthest from') + ' eye level.'],
        hint: 'Compare how thin or round the plates look, not where they sit.' };
    }
    return bank(R, ELLQ, 3);
  });

  // ---------------------------------------------------------------- draw.construction
  var BUILD = [['a pencil', 'a long cylinder and a cone'], ['a snowman', 'three spheres'], ['a table lamp with a cone-shaped shade', 'a cone, a tall thin cylinder and a short wide cylinder'], ['a book', 'one box'], ['an ice cream cone with one scoop', 'a cone and a sphere'], ['a rolling pin', 'a long cylinder with two thin cylinders for handles'], ['a birthday hat', 'one cone'], ['a can of paint', 'one cylinder']];
  var BUILDQ = [
    { q: 'When you build an object from forms, what do you draw first?', c: ['The biggest forms, lightly', 'The smallest details', 'The darkest shadows'], s: ['Big forms set the size and place of everything else.', 'Draw them lightly so they are easy to change.'], h: 'Big or small first?' },
    { q: 'NAME started a cat with detailed eyes, and the head came out too small for the body. What went wrong?', c: ['Details came before the big forms', 'The pencil was too soft', 'The eyes were too light'], s: ['Starting with a detail makes everything else fit around it.', 'Big forms first, details last.'], h: 'What order did NAME use?' },
    { q: 'Why draw construction lines lightly?', c: ['So they are easy to erase or change', 'So they show up more', 'So the paper stays white forever'], s: ['Construction lines are a plan.', 'Light lines can be moved and erased.'], h: 'Will you keep them?' },
    { q: 'Which order is right for construction?', c: ['Big forms, check sizes, refine the outline, add details', 'Details, big forms, check sizes, refine', 'Refine the outline, details, then big forms', 'Shade first, then draw the forms'], s: ['Start with simple big forms.', 'Check them, refine the real outline, and add details last.'], h: 'Details come last.' }];
  G('draw.construction', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) return bank(R, BUILDQ.slice(0, 3), 1);
    if (L === 2 || R.coin()) {
      var b = R.pick(BUILD), wr = R.sample(BUILD.filter(function (x) { return x[1] !== b[1]; }), L === 2 ? 2 : 3).map(function (x) { return x[1]; });
      return { q: 'Which simple forms make up <b>' + b[0] + '</b>?', a: among(R, cap(b[1]), wr.map(cap)), steps: ['Look for the biggest part first, then the smaller ones.', cap(b[0]) + ' is ' + b[1] + '.'], hint: 'Sphere, cube or box, cylinder, cone: which ones fit?' };
    }
    return bank(R, BUILDQ, 3);
  });


  // ================================================================ unit 4: value and shading
  function grayHex(f) { var g = M.round(255 * (1 - f)), s = g.toString(16); if (s.length < 2) s = '0' + s; return '#' + s + s + s; }
  // an uneven scale of n steps: 'light' crowds the light steps then jumps to black; 'dark' jumps from white then crowds the darks
  function unevenScale(n, kind) { var out = []; for (var i = 0; i < n; i++) { var t = i / (n - 1), f = kind === 'light' ? (i < n - 2 ? t * 0.38 : i === n - 2 ? 0.8 : 1) : (i === 0 ? 0 : i === 1 ? 0.62 : 0.62 + (t - 1 / (n - 1)) / (1 - 1 / (n - 1)) * 0.38); out.push(grayHex(f)); } return out; }
  // ---------------------------------------------------------------- draw.value-scale
  var VALQ = [
    { q: 'What is value in drawing?', c: ['How light or dark something is', 'How bright its color is', 'How much it costs'], s: ['Value is lightness or darkness.', 'It is separate from color.'], h: 'Think of a black-and-white photo.' },
    { q: 'In a value scale, what is the lightest step?', c: ['The white of the paper', 'A light gray made with an H pencil', 'Black'], s: ['A value scale runs from white to black.', 'The paper itself is the white.'], h: 'What is lighter than any pencil mark?' },
    { q: 'What makes a value scale good?', c: ['Each step looks as different from its neighbors as every other step', 'The light steps are very close together', 'It has as many black boxes as possible'], s: ['A value scale should step evenly.', 'Every jump should look the same size.'], h: 'Even steps.' },
    { q: 'A yellow lemon and a pale blue sky can have…', c: ['nearly the same value', 'no value at all', 'only dark values'], s: ['Value is separate from color.', 'Two different colors can be equally light.'], h: 'Is value the same as color?' }];
  G('draw.value-scale', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      if (R.coin()) return bank(R, VALQ, 1);
      var n = R.pick([5, 7, 9]), opts = R.shuffle([n, n === 5 ? 7 : n - 2]);
      return { q: 'How many steps does this value scale have, counting the white and the black?', viz: { name: 'ar-value', opts: { steps: n, quiet: true, interactive: false, numbers: false, ends: false, label: 'A value scale' } },
        a: mc(opts.map(String), opts.indexOf(n)), steps: ['Count the boxes from white to black.', 'There are ' + n + '.'], hint: 'Count every box, including the white one and the black one.' };
    }
    if (L === 2) {
      var n2 = R.pick([5, 7]), kind = R.pick(['light', 'dark']), rows = R.shuffle([{ g: Ak.valueScale(n2), even: 1 }, { g: unevenScale(n2, kind), even: 0 }]), e = rows[0].even ? 0 : 1, askEven = R.coin();
      return { q: 'Which value scale ' + (askEven ? 'steps <b>evenly</b>' : 'has <b>uneven</b> steps') + '?', viz: pics('scale', { rows: rows.map(function (r) { return r.g; }) }, 'Two value scales, A and B'),
        a: mc(['A', 'B'], askEven ? e : 1 - e), steps: ['Scale ' + letter(e) + ' changes by the same amount at every step.', 'Scale ' + letter(1 - e) + (kind === 'light' ? ' crowds its light steps together, then jumps to black.' : ' jumps from white straight to dark, then crowds its dark steps together.'), 'So the answer is ' + letter(askEven ? e : 1 - e) + '.'],
        hint: 'Squint. Do two neighbors blur together while another pair jumps?' };
    }
    if (R.chance(0.3)) return bank(R, VALQ, 3);
    var n3 = R.pick([5, 7, 9]), sc = Ak.valueScale(n3), k = R.int(1, n3 - 2), row = sc.slice(), cands = R.shuffle([k - 1, k, k + 1]);
    row[k] = '?';
    return { q: 'One step of this ' + n3 + '-step value scale is missing. Which swatch fills the gap?', viz: pics('scale', { rows: [row], choices: cands.map(function (i) { return sc[i]; }) }, 'A value scale with a missing step, and three lettered swatches'),
      a: mc(['A', 'B', 'C'], cands.indexOf(k)), steps: ['The missing value must be darker than its left neighbor and lighter than its right neighbor.', 'Two of the swatches match the neighbors exactly, so they would repeat a step.', 'Swatch ' + letter(cands.indexOf(k)) + ' sits halfway between them.'],
      hint: 'Compare each swatch with the boxes on both sides of the gap.' };
  });

  // ---------------------------------------------------------------- draw.hatching
  var HATCHQ = [
    { q: 'Why does a patch of hatching read as a gray tone?', c: ['The eye blends the lines and the white paper between them', 'The lines are gray ink', 'Hatching uses a gray pencil'], s: ['From a little distance, the eye mixes lines and paper.', 'More lines leave less paper showing, so the patch reads darker.'], h: 'What is between the lines?' },
    { q: 'NAME\'s hatching looks scribbled. What is the most likely cause?', c: ['The strokes go in every direction', 'The strokes are parallel', 'The lines are too evenly spaced'], s: ['Hatching keeps the strokes in one patch parallel.', 'Strokes in every direction look scribbled.'], h: 'Hatching lines run…' },
    { q: 'How do you make each hatching stroke?', c: ['A quick flick, lifting at the end', 'A slow press, pushing down hard', 'A circle'], s: ['Quick, light flicks keep hatching even.', 'Lifting at the end tapers the stroke.'], h: 'Fast and light, or slow and hard?' }];
  var DARKER = ['Put the lines closer together', 'Make the lines heavier'], NOT_DARKER = ['Turn the lines in every direction', 'Leave more white paper between the lines', 'Make the lines shorter and farther apart'];
  G('draw.hatching', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var ds = R.shuffle([R.pick([0.1, 0.2, 0.3]), R.pick([0.75, 0.85, 0.95])]), dk = ds[0] > ds[1] ? 0 : 1, askDark = R.coin(), ans = askDark ? dk : 1 - dk;
      return { q: 'Which patch of hatching reads ' + (askDark ? '<b>darker</b>' : '<b>lighter</b>') + '?', viz: pics('marks', { items: ds.map(function (d) { return { k: 'hatch', d: d }; }), columns: 2 }, 'Two patches of hatching, A and B'),
        a: mc(['A', 'B'], ans), steps: ['Patch ' + letter(dk) + ' has its lines closer together.', 'Closer lines leave less white paper, so it reads darker.', 'So the answer is ' + letter(ans) + '.'], hint: 'Which patch shows less white paper?' };
    }
    if (L === 2) {
      if (R.chance(0.3)) return bank(R, HATCHQ, 2);
      var its = R.shuffle([{ k: 'hatch', d: 0.6 }, { k: 'messy', d: 0.6 }, { k: R.pick(['stipple', 'cross']), d: 0.6, layers: 2 }]), hk = 0;
      its.forEach(function (it, i) { if (it.k === 'hatch') hk = i; });
      var SAY = { hatch: 'parallel lines in one direction: hatching', messy: 'strokes in every direction: scribbling', stipple: 'dots: stippling', cross: 'two layers crossing: cross-hatching' };
      return { q: 'Which patch is <b>hatching</b>?', viz: pics('marks', { items: its }, 'Three patches of marks, A, B and C'), a: mc(['A', 'B', 'C'], hk),
        steps: its.map(function (it, i) { return letter(i) + ': ' + SAY[it.k] + '.'; }), hint: 'Hatching is one set of parallel lines.' };
    }
    if (R.coin()) {
      var yes = DARKER.slice(), no = R.sample(NOT_DARKER, 2), all = R.shuffle(yes.concat(no)), v = [];
      all.forEach(function (c, i) { if (yes.indexOf(c) >= 0) v.push(i); });
      return { q: 'Which changes make a patch of hatching <b>darker</b>? Choose all that apply.', a: { t: 'mc', choices: all, v: v, keep: true },
        steps: ['A patch reads darker when less white paper shows.', 'Closer lines and heavier lines both cover more paper.', 'Lines in every direction look scribbled, and more space between lines makes it lighter.'], hint: 'What covers more of the paper?' };
    }
    return bank(R, HATCHQ, 3);
  });

  // ---------------------------------------------------------------- draw.cross-hatching
  var CROSSQ = [
    { q: 'In cross-hatching, where do you add a third layer?', c: ['Only where the value should be darkest', 'Everywhere at once', 'Only on the highlights'], s: ['Each layer makes an area darker.', 'Add new layers only where it should be darker.'], h: 'What does each layer do?' },
    { q: 'NAME cross-hatched every area of a drawing at once. What went wrong?', c: ['No light areas are left, so it looks like a dark net', 'It became too light', 'Nothing; that is the right way'], s: ['Cross-hatching everywhere darkens everything.', 'Light areas should get few or no layers.'], h: 'What happened to the light parts?' },
    { q: 'Why do pen artists use cross-hatching?', c: ['A pen cannot press lighter or darker, so layers make the values', 'Pens cannot draw straight lines', 'It is faster than a single line'], s: ['A pen line is about the same darkness every time.', 'So artists change value by adding layers of lines.'], h: 'Can a pen make a light gray line?' },
    { q: 'How does each new layer of cross-hatching run?', c: ['Across the earlier layers, at an angle', 'Exactly on top of the first layer', 'In circles'], s: ['A new layer crosses the old ones at an angle.', 'That covers more paper without blurring the lines together.'], h: 'It is called cross-hatching.' }];
  G('draw.cross-hatching', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var dd = R.pick([0.2, 0.5, 0.8]), ls = R.shuffle([1, R.pick([2, 3])]), dk = ls[0] > 1 ? 0 : 1, askDark = R.coin(), ans = askDark ? dk : 1 - dk;
      return { q: 'Which patch reads ' + (askDark ? '<b>darker</b>' : '<b>lighter</b>') + '?', viz: pics('marks', { items: ls.map(function (n) { return { k: 'cross', layers: n, d: dd }; }), columns: 2 }, 'Two patches of cross-hatching, A and B'),
        a: mc(['A', 'B'], ans), steps: ['Patch ' + letter(dk) + ' has ' + ls[dk] + ' layers of lines; the other has one.', 'Each layer covers more paper, so more layers read darker.', 'So the answer is ' + letter(ans) + '.'], hint: 'Count the directions the lines run.' };
    }
    if (L === 2) {
      if (R.coin()) return bank(R, CROSSQ, 2);
      var d2 = R.pick([0.2, 0.5, 0.8]), ls2 = R.shuffle([1, 2, 3]), want = R.pick([1, 2, 3]);
      return { q: 'Which patch has <b>' + (want === 1 ? 'one layer' : want === 2 ? 'two layers' : 'three layers') + '</b> of hatching?', viz: pics('marks', { items: ls2.map(function (n) { return { k: 'cross', layers: n, d: d2 }; }) }, 'Three patches of cross-hatching, A, B and C'),
        a: mc(['A', 'B', 'C'], ls2.indexOf(want)), steps: ls2.map(function (n, i) { return letter(i) + ': ' + n + ' layer' + (n > 1 ? 's' : '') + '.'; }), hint: 'Count the directions the lines run in each patch.' };
    }
    if (R.chance(0.3)) {
      var cy = ['Plan the light areas and leave them alone', 'Add a layer only where the value should be darker', 'Cross each new layer at an angle'], cn = ['Cover every area with all three layers first', 'Start with the highlights', 'Lay every new layer exactly on top of the last one'], cyy = R.sample(cy, R.int(2, 3)), cnn = R.sample(cn, 2), all = R.shuffle(cyy.concat(cnn)), v = [];
      all.forEach(function (c, i) { if (cyy.indexOf(c) >= 0) v.push(i); });
      return { q: 'Which are good habits for cross-hatching? Choose all that apply.', a: { t: 'mc', choices: all, v: v, keep: true },
        steps: ['Cross-hatching builds value layer by layer.', 'Good habits: ' + cyy.join('; ') + '.', 'Not good: ' + cnn.join('; ') + '.'], hint: 'Keep the lights light.' };
    }
    if (R.coin()) {
      var side = R.pick(['left', 'right']), away = side === 'left' ? 'right' : 'left';
      return { q: 'A box is lit from the upper ' + side + '. You can see its top, its left side and its right side. Which side gets the <b>most</b> layers of cross-hatching?', a: mc(['The top', 'The left side', 'The right side'], away === 'left' ? 1 : 2),
        steps: ['The darkest side is the one turned away from the light.', 'The light comes from the upper ' + side + ', so the ' + away + ' side is turned away.', 'The darkest side gets the most layers: the ' + away + ' side.'], hint: 'Which side faces away from the light?' };
    }
    return bank(R, CROSSQ, 3);
  });

  // ---------------------------------------------------------------- draw.stippling
  var STIPQ = [
    { q: 'How do you hold the pen for stippling?', c: ['Upright, tapping straight down', 'Flat on its side', 'Dragging it across the paper'], s: ['Each mark should be a dot.', 'Tap straight down and lift all the way.'], h: 'Dots, not dashes.' },
    { q: 'NAME\'s stippling looks like tiny dashes, almost like grass. What happened?', c: ['NAME dragged the pen instead of tapping', 'NAME used too few dots', 'NAME used a fine pen'], s: ['Dragging the pen makes dashes.', 'Dashes change the texture; tap straight down.'], h: 'How was the pen moving?' },
    { q: 'Why does stippling suit soft, rounded forms?', c: ['Dots have no direction, so the tone looks soft and smooth', 'Dots are always darker than lines', 'Dots are faster to draw'], s: ['Lines have a direction; dots do not.', 'So stippled tones look soft.'], h: 'What do lines have that dots do not?' },
    { q: 'Where do you leave clean paper in a stippled drawing?', c: ['The highlights', 'The darkest shadows', 'Nowhere'], s: ['The lightest value is the white paper.', 'Highlights get no dots.'], h: 'What is the lightest value?' }];
  G('draw.stippling', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var ds = R.shuffle([R.pick([0.08, 0.15, 0.25]), R.pick([0.8, 0.9, 1])]), dk = ds[0] > ds[1] ? 0 : 1, askDark = R.coin(), ans = askDark ? dk : 1 - dk;
      return { q: 'Which stippled patch reads ' + (askDark ? '<b>darker</b>' : '<b>lighter</b>') + '?', viz: pics('marks', { items: ds.map(function (d) { return { k: 'stipple', d: d }; }), columns: 2 }, 'Two patches of dots, A and B'),
        a: mc(['A', 'B'], ans), steps: ['Patch ' + letter(dk) + ' has more dots, closer together.', 'More dots cover more paper, so it reads darker.', 'So the answer is ' + letter(ans) + '.'], hint: 'Which patch shows less white paper?' };
    }
    if (L === 2) {
      if (R.chance(0.35)) return bank(R, STIPQ, 2);
      var its = R.shuffle([{ k: 'stipple', d: 0.55 }, { k: 'dash', d: 0.55 }, { k: 'hatch', d: 0.5 }]), sk = 0;
      its.forEach(function (it, i) { if (it.k === 'stipple') sk = i; });
      var SAY = { stipple: 'round dots: stippling', dash: 'little dashes from a dragged pen', hatch: 'parallel lines: hatching' };
      return { q: 'Which patch is true <b>stippling</b>?', viz: pics('marks', { items: its }, 'Three patches of marks, A, B and C'), a: mc(['A', 'B', 'C'], sk),
        steps: its.map(function (it, i) { return letter(i) + ': ' + SAY[it.k] + '.'; }), hint: 'Stippling uses dots, not dashes or lines.' };
    }
    if (R.coin()) {
      var yes = ['Add more dots there', 'Put the dots closer together'], no = R.sample(['Drag the pen to make dashes', 'Spread the dots farther apart', 'Leave that area as clean paper'], 2), all = R.shuffle(yes.concat(no)), v = [];
      all.forEach(function (c, i) { if (yes.indexOf(c) >= 0) v.push(i); });
      return { q: 'How do you make one area of a stippled drawing <b>darker</b>? Choose all that apply.', a: { t: 'mc', choices: all, v: v, keep: true },
        steps: ['Value comes from how much of the paper the dots cover.', 'More dots, closer together, cover more paper.', 'Dashes change the texture, and spreading dots out or leaving paper makes it lighter.'], hint: 'What covers more paper?' };
    }
    return bank(R, STIPQ, 3);
  });

  // ---------------------------------------------------------------- draw.smooth-tone
  var SMOOTHQ = [
    { q: 'How do you build smooth tone with a pencil?', c: ['With many light, even layers', 'With one hard, heavy layer', 'With scribbles in every direction'], s: ['Light layers sit on the paper\'s tooth and fill in evenly.', 'Build the tone a little at a time.'], h: 'Fast and hard, or light and slow?' },
    { q: 'NAME pressed hard with an HB. The shadow is shiny and will not get darker. Why?', c: ['Heavy pressure flattened the tooth and polished the graphite', 'The pencil was too soft', 'The paper was too rough'], s: ['Hard pressure crushes the paper\'s tooth.', 'The graphite turns shiny, and new layers slide off.'], h: 'What does hard pressure do to the paper?' },
    { q: 'To reach a darker value, it is better to…', c: ['switch to a softer pencil, such as a 4B', 'press as hard as you can with a 2H', 'erase and start over'], s: ['A softer pencil leaves more graphite with light pressure.', 'That keeps the tooth ready for more layers.'], h: 'Which grades are darker?' },
    { q: 'What is a blending stump (or tortillon)?', c: ['A rolled-paper stick for softening tone', 'A kind of eraser', 'A very hard pencil'], s: ['It is made of tightly rolled paper.', 'Rubbing it gently over tone softens it.'], h: 'It is made of rolled paper.' },
    { q: 'Which strokes help build smooth tone?', c: ['Small overlapping circles or tight hatching', 'Long zigzags', 'Big dots far apart'], s: ['Small, overlapping strokes leave no gaps or lines.', 'Layer after layer, they blend into an even tone.'], h: 'Small and overlapping.' }];
  SMOOTHQ.push(
    { q: 'NAME wants a soft, even sky. What is the first step?', c: ['Lay down a light, even layer over the whole sky', 'Press hard in one corner', 'Blend with a finger before drawing anything'], s: ['Smooth tone is built from light layers.', 'Start with one light, even layer, then add more.'], h: 'Light first.' },
    { q: 'NAME\'s tone shows streaks from the strokes. What helps?', c: ['Add more light layers, changing direction a little each time', 'Press harder along the streaks', 'Erase the whole area hard'], s: ['Changing direction fills the gaps between earlier strokes.', 'More light layers even the tone out.'], h: 'Layers in slightly different directions.' },
    { q: 'What does rubbing gently with a tissue do to pencil tone?', c: ['It softens and evens it out', 'It makes it shiny and hard', 'It removes it completely'], s: ['A tissue spreads the graphite a little.', 'That softens the tone.'], h: 'Think of smoothing.' },
    { q: 'Which pencil reaches a deep dark most easily with light pressure?', c: ['A 6B', 'A 2H', 'An H'], s: ['Soft B pencils leave more graphite.', 'A 6B gets dark without pressing hard.'], h: 'Soft and dark is B.' });
  G('draw.smooth-tone', function (R, ctx) {
    var L = ctx.level || 1;
    if (L <= 2 && R.chance(0.4)) {
      var kinds = R.shuffle(['blending', 'hatching', L === 1 ? null : 'stippling'].filter(Boolean)), bk = kinds.indexOf('blending');
      return { q: 'Which swatch shows <b>smooth tone</b>?', viz: { name: 'ar-marks', opts: { kinds: kinds, quiet: true, interactive: false, desc: false, label: 'Lettered swatches of pencil marks' } }, a: mc(letters(kinds.length), bk),
        steps: ['Smooth tone shows no separate strokes or dots.', 'Swatch ' + letter(bk) + ' is an even gray.'], hint: 'Look for the swatch with no visible marks.' };
    }
    return bank(R, SMOOTHQ, L);
  });

  // ---------------------------------------------------------------- draw.contrast-key
  var KEY_SAY = { high: 'mostly light values: high key', low: 'mostly dark values: low key', contrast: 'very light right beside very dark: high contrast', flat: 'values all close together: low contrast' };
  var KEYQ = [
    { q: 'NAME wants a drawing of a foggy morning. Which fits best?', c: ['A high key with low contrast', 'A low key with high contrast', 'A low key with low contrast'], s: ['Fog makes everything pale: a high key.', 'It also softens the differences between values: low contrast.'], h: 'How does fog look?' },
    { q: 'A scene in a cave lit by one candle would most likely be…', c: ['low key', 'high key', 'all middle gray'], s: ['Most of the cave is dark.', 'Mostly dark values make a low-key picture.'], h: 'Mostly light or mostly dark?' },
    { q: 'A snowy field on a bright, cloudy day would most likely be…', c: ['high key', 'low key', 'all black'], s: ['Snow and a cloudy sky are light.', 'Mostly light values make a high-key picture.'], h: 'Mostly light or mostly dark?' },
    { q: 'Where does the eye usually go first in a picture?', c: ['To the place of highest contrast', 'To the grayest area', 'To the bottom corner'], s: ['Very light against very dark grabs attention.', 'Artists put their strongest contrast where they want you to look.'], h: 'What stands out most?' },
    { q: 'The Italian word chiaroscuro means…', c: ['light-dark', 'quick sketch', 'deep blue'], s: ['Chiaro means light and scuro means dark.', 'It names strong light-and-dark modeling.'], h: 'It is about light and shadow.' },
    { q: 'NAME\'s drawing uses only middle grays and looks washed out. What helps most?', c: ['Use the full range: white paper and the darkest dark', 'Add more middle grays', 'Erase the darkest parts'], s: ['Middle grays alone look weak.', 'Using the white of the paper and a deep dark adds contrast.'], h: 'What is missing at each end?' }];
  KEYQ.push(
    { q: 'What is contrast in a drawing?', c: ['The difference between values side by side', 'How many colors it uses', 'How big the paper is'], s: ['Contrast compares neighboring values.', 'Very light beside very dark is high contrast.'], h: 'It compares neighbors.' },
    { q: 'A high-key picture is mostly…', c: ['light values', 'dark values', 'black lines'], s: ['Key describes the overall value of a picture.', 'High key means mostly light.'], h: 'High key: think of a foggy morning.' },
    { q: 'NAME wants viewers to look first at a lighthouse in a dark night scene. What helps most?', c: ['Put the strongest light-against-dark at the lighthouse', 'Make the lighthouse middle gray like everything else', 'Add the most detail to the sky'], s: ['The eye goes first to the highest contrast.', 'So put the brightest light next to the darkest dark at the lighthouse.'], h: 'Where does the eye go first?' });
  G('draw.contrast-key', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1 && R.chance(0.35)) return bank(R, KEYQ, 1);
    if (L === 1) {
      var ks = R.shuffle(R.pick([['high', 'low'], ['contrast', 'flat']])), want = R.pick(ks), NM = { high: 'high key', low: 'low key', contrast: 'high contrast', flat: 'low contrast' };
      return { q: 'Which picture ' + (want === 'high' || want === 'low' ? 'is' : 'has') + ' <b>' + NM[want] + '</b>?', viz: { name: 'ar-value', opts: { mode: 'key', keys: ks, quiet: true, interactive: false, label: 'Two small landscapes, A and B' } },
        a: mc(['A', 'B'], ks.indexOf(want)), steps: ks.map(function (k, i) { return letter(i) + ' has ' + KEY_SAY[k] + '.'; }), hint: { high: 'High key: mostly light.', low: 'Low key: mostly dark.', contrast: 'High contrast: very light right beside very dark.', flat: 'Low contrast: all the values are close together.' }[want] };
    }
    if (L === 2 && R.chance(0.3)) return bank(R, KEYQ, 2);
    if (L === 2 || R.coin()) {
      var ask = R.pick(['high', 'low', 'contrast', 'flat']), set = ask === 'contrast' ? ['contrast', 'flat', 'low'] : ask === 'flat' ? ['flat', 'contrast'] : ['high', 'low', 'flat'], ks2 = R.shuffle(set);
      var NAME_OF = { high: 'high key', low: 'low key', contrast: 'high contrast', flat: 'low contrast' };
      return { q: 'Which picture has <b>' + NAME_OF[ask] + '</b>?', viz: { name: 'ar-value', opts: { mode: 'key', keys: ks2, quiet: true, interactive: false, label: 'Small lettered landscapes' } },
        a: mc(letters(ks2.length), ks2.indexOf(ask)), steps: ks2.map(function (k, i) { return letter(i) + ' has ' + KEY_SAY[k] + '.'; }).concat(['So the answer is ' + letter(ks2.indexOf(ask)) + '.']), hint: 'Key is the overall lightness; contrast is the difference between values.' };
    }
    return bank(R, KEYQ, 3);
  });


  // ================================================================ unit 5: light and shadow
  function sideOf(deg) { return deg > 90 ? 'left' : 'right'; }
  function other(side) { return side === 'left' ? 'right' : 'left'; }
  var FORM_SAY = { sphere: 'ball', cube: 'box', cylinder: 'can' };
  // ---------------------------------------------------------------- draw.light-direction
  G('draw.light-direction', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var deg = R.coin() ? R.int(128, 152) : R.int(28, 52), f = R.pick(['sphere', 'sphere', 'cube', 'cylinder']), side = sideOf(deg), opts = ['From the upper left', 'From the upper right'];
      return { q: 'Look at the light and shadow on this ' + FORM_SAY[f] + '. Where is the light coming from?', viz: pics('lit', { items: [{ form: f, light: deg }], columns: 1 }, 'A shaded ' + FORM_SAY[f] + ' on a table'),
        a: mc(opts, side === 'left' ? 0 : 1), steps: ['The lit side and the bright spots face the light; the shadow side and the cast shadow point away.', 'Here the shadow side and the cast shadow are on the ' + other(side) + '.', 'So the light comes from the upper ' + side + '.'], hint: 'Find the cast shadow. The light is on the other side.' };
    }
    if (L === 2) {
      var base = R.coin() ? R.int(130, 150) : R.int(30, 50), forms = R.shuffle(['sphere', 'cube', 'cylinder']), odd = R.int(0, 2);
      var its = forms.map(function (f2, i) { return { form: f2, light: i === odd ? 180 - base : base }; });
      return { q: 'These three objects sit on one table under one light. Which one is shaded as if the light came from <b>the other side</b>?', viz: pics('lit', { items: its }, 'Three shaded objects, A, B and C'),
        a: mc(['A', 'B', 'C'], odd), steps: its.map(function (it, i) { return letter(i) + ': the ' + FORM_SAY[it.form] + ' is lit from the ' + sideOf(it.light) + '.'; }).concat(['With one light, every object is lit from the same side, so ' + letter(odd) + ' is wrong.']),
        hint: 'Check which side of each object is light, and which way each cast shadow points.' };
    }
    var s = R.pick(['left', 'right']), Q = R.pick([
      { q: 'The light comes from a window on the ' + s + '. Which way does an apple\'s cast shadow fall?', c: ['To the ' + other(s), 'To the ' + s, 'Straight toward the window'], st: ['A cast shadow points away from the light.', 'The light is on the ' + s + ', so the shadow falls to the ' + other(s) + '.'] },
      { q: 'The light comes from the upper ' + s + '. Where is the shadow side of a ball?', c: ['The lower ' + other(s), 'The upper ' + s, 'All around the edge'], st: ['The shadow side is turned away from the light.', 'Away from the upper ' + s + ' is the lower ' + other(s) + '.'] },
      { q: 'A lamp stands to the ' + s + ' of a still life. Which side of every object is lit?', c: ['The ' + s + ' side of every object', 'The ' + other(s) + ' side of every object', 'A different side for each object'], st: ['With one light, every lit side faces it.', 'The lamp is on the ' + s + ', so every object is lit on its ' + s + ' side.'] }]);
    return { q: Q.q, a: among(R, Q.c[0], Q.c.slice(1)), steps: Q.st, hint: 'Lit sides face the light; shadows point away.' };
  });

  // ---------------------------------------------------------------- draw.light-on-form
  function partName(k) { return A().LIGHT_PARTS[k].replace(/ \(.*\)$/, ''); }
  G('draw.light-on-form', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L <= 2 && (L === 1 || R.chance(0.7))) {
      var pool = L === 1 ? R.sample(['highlight', 'core', 'cast'], 2) : R.shuffle(['highlight', 'core', 'reflected', 'cast']), want = R.pick(pool), light = R.pick([30, 45, 135, 150]);
      return { q: 'Which letter marks the <b>' + partName(want) + '</b>?', viz: { name: 'ar-shade', opts: { form: 'sphere', light: light, parts: pool, order: pool, quiet: true, interactive: false, label: 'A shaded ball with lettered parts' } },
        a: mc(letters(pool.length), pool.indexOf(want)), steps: pool.map(function (k, i) { return letter(i) + ' is the ' + partName(k) + '.'; }).concat(['So the ' + partName(want) + ' is ' + letter(pool.indexOf(want)) + '.']),
        hint: { highlight: 'The brightest spot, facing the light.', core: 'The darkest band on the ball, on the side away from the light.', reflected: 'A dim glow inside the shadow, near the table.', cast: 'The shadow on the table.' }[want] };
    }
    if (R.coin()) { // what comes next, going from the light into the shadow?
      var ord = Ak.LIGHT_ORDER.slice(0, 5), i = R.int(0, 3), right = partName(ord[i + 1]), wr = ord.filter(function (k, j) { return j !== i + 1 && j !== i; }).map(partName);
      return { q: 'Going across a ball from the light into the shadow, which value comes right after the <b>' + partName(ord[i]) + '</b>?', a: among(R, cap(right), R.sample(wr, 2).map(cap)),
        steps: ['The order is highlight, light, halftone, core shadow, reflected light.', 'Right after the ' + partName(ord[i]) + ' comes the ' + right + '.'], hint: 'Highlight, light, halftone, core shadow, reflected light.' };
    }
    var Q = R.pick([
      { q: 'Which is darker: the reflected light, or the halftone?', c: ['The reflected light', 'The halftone', 'They are the same'], st: ['The halftone belongs to the light side; reflected light belongs to the shadow side.', 'Every shadow value is darker than every value in the light.'] },
      { q: 'Which is darker: the reflected light, or the lit side?', c: ['The reflected light', 'The lit side', 'They are the same'], st: ['Reflected light is light bounced into the shadow.', 'It stays darker than any value in the light.'] },
      { q: 'Which is darker: the core shadow, or the reflected light?', c: ['The core shadow', 'The reflected light', 'They are the same'], st: ['Reflected light brightens the shadow a little.', 'So the core shadow, before the reflected light, is darker.'] },
      { q: 'What makes reflected light?', c: ['Light bouncing up from the table or nearby things', 'A second lamp behind the ball', 'The highlight shining through'], st: ['Light hits the table and bounces.', 'Some of it lands in the ball\'s shadow side.'] },
      { q: 'Where is the occlusion shadow?', c: ['Right where the form touches the table', 'At the far end of the cast shadow', 'In the middle of the lit side'], st: ['Almost no light reaches the spot where the form meets the table.', 'That thin, darkest line is the occlusion shadow.'] },
      { q: 'What is the highlight?', c: ['The brightest spot, where light reflects toward your eye', 'The darkest band on the form', 'The shadow on the table'], st: ['The highlight is where the light bounces straight toward your eye.', 'It is the brightest spot on the form.'] }]);
    return { q: Q.q, a: among(R, Q.c[0], Q.c.slice(1)), steps: Q.st, hint: 'Every value in the shadow is darker than every value in the light.' };
  });

  // ---------------------------------------------------------------- draw.cast-shadows
  var CAST_SAY = { ok: 'the shadow falls away from the light and touches the ball', gap: 'there is a gap under the ball, so it floats', wrong: 'the shadow falls toward the light' };
  G('draw.cast-shadows', function (R, ctx) {
    var L = ctx.level || 1;
    if (L <= 2) {
      var deg = R.coin() ? R.int(130, 155) : R.int(25, 50), kinds = L === 1 ? R.shuffle(['ok', 'wrong']) : R.shuffle(['ok', 'gap', 'wrong']), ask = L === 1 ? 'ok' : R.pick(['ok', 'gap', 'wrong']);
      var qs = { ok: 'Which ball has a believable cast shadow?', gap: 'Which ball seems to <b>float</b> above the table?', wrong: 'Which ball\'s shadow falls on the <b>wrong side</b>?' };
      return { q: 'The light is the small sun in each picture. ' + qs[ask], viz: pics('lit', { sun: true, items: kinds.map(function (k) { return { form: 'sphere', light: deg, cast: k }; }), columns: kinds.length }, 'Lettered drawings of a ball and its shadow'),
        a: mc(letters(kinds.length), kinds.indexOf(ask)), steps: kinds.map(function (k, i) { return letter(i) + ': ' + CAST_SAY[k] + '.'; }).concat(['So the answer is ' + letter(kinds.indexOf(ask)) + '.']),
        hint: 'A cast shadow falls away from the light and touches the object where it touches the table.' };
    }
    var dirs = [['morning', 'east', 'west'], ['evening', 'west', 'east']], d = R.pick(dirs), Q = R.pick([
      { q: 'In the early ' + d[0] + ', the sun is low in the ' + d[1] + '. Which way do shadows point, and are they long or short?', c: ['Toward the ' + d[2] + ', and long', 'Toward the ' + d[1] + ', and long', 'Toward the ' + d[2] + ', and short'], st: ['Shadows point away from the light: toward the ' + d[2] + '.', 'A low sun hits things from the side, so shadows stretch out long.'] },
      { q: 'Near midday, when the sun is high in the sky, shadows are…', c: ['short', 'long', 'as long as at sunset'], st: ['A high light shines down from above.', 'Objects block only a little of the ground beside them, so shadows are short.'] },
      { q: 'Where is a cast shadow darkest?', c: ['Right where the object touches the surface', 'At its far end', 'It is the same everywhere'], st: ['Almost no light reaches the contact.', 'Farther out, light sneaks in and lightens it.'] },
      { q: 'Where is the edge of a cast shadow sharpest?', c: ['Near the object', 'Far from the object', 'It is soft everywhere'], st: ['Near the object, the edge is crisp.', 'Farther away, light from around the edges of the source softens it.'] },
      { q: 'NAME drew a ball with a small gap between it and its shadow. How does it look?', c: ['Like it is floating above the table', 'Like it is resting firmly on the table', 'Like it is very heavy'], st: ['A shadow touches where the object touches.', 'A gap makes the object seem to float.'] }]);
    return { q: Q.q.replace(/NAME/g, who(R)), a: among(R, Q.c[0], Q.c.slice(1)), steps: Q.st, hint: 'Shadows point away from the light.' };
  });

  // ---------------------------------------------------------------- draw.shading-sphere
  G('draw.shading-sphere', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var its = R.shuffle([{ form: 'sphere', light: R.pick([135, 145, 40]) }, { form: 'sphere', light: 135, ring: true }]), good = its[0].ring ? 1 : 0, askRound = R.coin();
      return { q: 'Which drawing looks like ' + (askRound ? 'a <b>round ball</b>' : 'a <b>flat disc</b>') + '?', viz: pics('lit', { items: its, columns: 2 }, 'Two shaded circles, A and B'),
        a: mc(['A', 'B'], askRound ? good : 1 - good), steps: ['Drawing ' + letter(good) + ' has a curved core shadow on the side away from the light.', 'Drawing ' + letter(1 - good) + ' has a dark ring all around its edge, which reads as a flat disc.', 'So the answer is ' + letter(askRound ? good : 1 - good) + '.'], hint: 'Is the darkest part a band on one side, or a ring all around?' };
    }
    if (L === 2) {
      var s = R.pick(['left', 'right']), away = 'lower ' + other(s), Q = R.pick([
        { q: 'The light comes from the upper ' + s + '. Where does the core shadow of a ball go?', c: ['A curved band on the ' + away + ' side', 'A dark ring all around the edge', 'A band on the upper ' + s + ' side'], st: ['The core shadow sits where the surface turns away from the light.', 'That is a curved band on the side away from the light: the ' + away + '.'] },
        { q: 'Which value do you leave as clean white paper when you shade a ball?', c: ['The highlight', 'The core shadow', 'The reflected light'], st: ['The highlight is the brightest spot.', 'Nothing is brighter than the paper, so leave it white (or lift it with a kneaded eraser).'] },
        { q: 'When you shade a ball, what do you decide first?', c: ['Where the light comes from', 'How dark the reflected light is', 'The size of the highlight'], st: ['Every value depends on the light direction.', 'So choose it first.'] },
        { q: 'NAME shaded a dark ring all around a ball. Why does it look flat?', c: ['An outline-shaped ring says "flat edge"; the core shadow should be a band on one side', 'The ring is too light', 'The highlight is too big'], st: ['A sphere turns away from the light on one side only.', 'The core shadow is a band there, not a ring all around.'] }]);
      return { q: Q.q.replace(/NAME/g, who(R)), a: among(R, Q.c[0], Q.c.slice(1)), steps: Q.st, hint: 'The core shadow is on the side away from the light.' };
    }
    var ord = Ak.LIGHT_ORDER.slice(0, 5), i = R.int(1, 4), right = partName(ord[i - 1]), wr = ord.filter(function (k, j) { return j !== i - 1 && j !== i; }).map(partName);
    return { q: 'Going around a shaded ball from the light into the shadow, which value comes just <b>before</b> the ' + partName(ord[i]) + '?', a: among(R, cap(right), R.sample(wr, 3).map(cap)),
      steps: ['The order is highlight, light, halftone, core shadow, reflected light.', 'Just before the ' + partName(ord[i]) + ' comes the ' + right + '.'], hint: 'Say the order from the highlight.' };
  });

  // ---------------------------------------------------------------- draw.shading-planes
  // one even value per plane of a box (the front faces the viewer, the side faces right); same table as draw-pics
  function cubeValues(d) {
    if (d >= 165) return { front: 0.12, top: 0.42, side: 0.75 };
    if (d <= 15) return { side: 0.12, top: 0.42, front: 0.75 };
    if (d > 90) return { top: 0.12, front: 0.38, side: 0.72 };
    return { top: 0.12, side: 0.38, front: 0.72 };
  }
  var PLANE_NAME = { top: 'the top', front: 'the left face', side: 'the right face' };
  function lightName(d) { return d >= 165 ? 'low from the left' : d <= 15 ? 'low from the right' : d > 90 ? 'from the upper left' : 'from the upper right'; }
  function extreme(v, dark) { var best = null; ['top', 'front', 'side'].forEach(function (k) { if (best === null || (dark ? v[k] > v[best] : v[k] < v[best])) best = k; }); return best; }
  G('draw.shading-planes', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var its = R.shuffle([{ v: 'flat' }, { v: 'blend' }]), f = its[0].v === 'flat' ? 0 : 1, askFlat = R.coin();
      return { q: 'Which box ' + (askFlat ? 'keeps <b>one even value</b> on each flat plane' : 'is shaded <b>as if it were round</b>') + '?', viz: pics('planes', { items: its, columns: 2 }, 'Two shaded boxes, A and B'),
        a: mc(['A', 'B'], askFlat ? f : 1 - f), steps: ['Box ' + letter(f) + ' has one value on each plane, with sharp changes at the edges.', 'Box ' + letter(1 - f) + ' blends tone across the edges, like a round form.', 'So the answer is ' + letter(askFlat ? f : 1 - f) + '.'], hint: 'Look at the edges: does the value jump, or blend?' };
    }
    var d = R.pick([R.int(125, 150), R.int(30, 55), R.int(168, 178), R.int(2, 12)]), V3 = cubeValues(d);
    if (L === 2) {
      var right = cap(lightName(d)), all = ['From the upper left', 'From the upper right', 'Low from the left', 'Low from the right'].filter(function (x) { return x !== right; });
      return { q: 'Judging by the values on its planes, where does the light on this box come from?', viz: pics('lit', { items: [{ form: 'cube', light: d }], columns: 1 }, 'A shaded box on a table'),
        a: among(R, right, R.sample(all, 2)), steps: ['The lightest plane faces the light most directly: here ' + PLANE_NAME[extreme(V3, false)] + '.', 'The darkest plane is turned away: ' + PLANE_NAME[extreme(V3, true)] + '.', 'So the light comes ' + lightName(d) + '.'],
        hint: 'Find the lightest plane. The light is on that side.' };
    }
    var low = d >= 165 || d <= 15, dark = low ? R.coin() : true, ans = extreme(V3, dark);
    return { q: 'A box on a table is lit ' + lightName(d) + '. You see its top, its left face and its right face. Which plane is <b>' + (dark ? 'darkest' : 'lightest') + '</b>?', a: mc(['The top', 'The left face', 'The right face'], ['top', 'front', 'side'].indexOf(ans)),
      steps: ['The plane that faces the light most directly is lightest; the plane turned away is darkest.', d >= 165 ? 'A low light from the left shines straight at the left face; the top only gets glancing light; the right face is turned away.' : d <= 15 ? 'A low light from the right shines straight at the right face; the top only gets glancing light; the left face is turned away.' : d > 90 ? 'Light from the upper left reaches the top and the left face; the right face is turned away.' : 'Light from the upper right reaches the top and the right face; the left face is turned away.', 'So the ' + (dark ? 'darkest' : 'lightest') + ' is ' + PLANE_NAME[ans] + '.'],
      hint: 'Which plane faces the light, and which faces away?' };
  });


  // ================================================================ unit 6: proportion and measuring
  function num(v) { return { t: 'num', v: String(v) }; }
  // ---------------------------------------------------------------- draw.proportion
  var PROP_OBJ = [['bottle', 'caps'], ['lamp', 'shade-heights'], ['vase', 'widths'], ['bookcase', 'shelf-heights'], ['door', 'door-widths'], ['tree', 'trunk-widths']];
  G('draw.proportion', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var u = R.int(3, 8), below = R.chance(0.4);
      if (below) return { q: 'This bottle is measured in units of its red cap. <b>Below the cap</b>, how many caps tall is the bottle?', viz: { name: 'ar-proportion', opts: { mode: 'sighting', units: u, quiet: true, interactive: false, label: 'A bottle with tick marks, one unit apart' } },
        a: num(u - 1), steps: ['The tick marks are one cap-height apart.', 'From the table to the top of the cap there are ' + u + ' spaces.', 'The cap itself is one of them, so below the cap the bottle is ' + u + ' − 1 = ' + (u - 1) + ' caps tall.'], hint: 'Count the spaces between the tick marks, then leave out the cap.' };
      return { q: 'This bottle is measured in units of its red cap. Counting the cap itself, how many caps tall is the whole bottle?', viz: { name: 'ar-proportion', opts: { mode: 'sighting', units: u, quiet: true, interactive: false, label: 'A bottle with tick marks, one unit apart' } },
        a: num(u), steps: ['The tick marks are one cap-height apart.', 'Count the spaces from the table to the top of the cap: ' + u + '.', 'The bottle is ' + u + ' caps tall.'], hint: 'Count the spaces between the tick marks.' };
    }
    var o = R.pick(PROP_OBJ), n = R.int(2, 6), size = R.int(2, 6), nm = who(R);
    if (L === 2 || R.coin()) {
      return { q: 'A ' + o[0] + ' is ' + n + ' ' + o[1] + ' tall. In ' + nm + '\'s drawing, one unit (one of the ' + o[1] + ') is ' + size + ' cm. How tall should the whole ' + o[0] + ' be in the drawing?', a: num(n * size), unit: 'cm',
        steps: ['The ' + o[0] + ' is ' + n + ' units tall.', 'Each unit is ' + size + ' cm in the drawing.', '$' + n + ' \\times ' + size + ' = ' + (n * size) + '$, so ' + (n * size) + ' cm.'], hint: 'How many units, and how big is each one?' };
    }
    var total = n * size;
    return { q: 'A ' + o[0] + ' is ' + n + ' ' + o[1] + ' tall. ' + nm + ' drew the whole ' + o[0] + ' ' + total + ' cm tall. How long should one unit be in the drawing?', a: num(size), unit: 'cm',
      steps: ['The whole height is ' + n + ' units.', 'So one unit is the whole height divided by ' + n + '.', '$' + total + ' \\div ' + n + ' = ' + size + '$, so ' + size + ' cm.'], hint: 'Share the whole height among the units.' };
  });

  // ---------------------------------------------------------------- draw.sighting
  var SIGHTQ = [
    { q: 'When you sight with a pencil, what should your elbow do?', c: ['Stay straight every time', 'Bend a little more each time', 'Rest on the table'], s: ['The pencil must be the same distance from your eye for every measurement.', 'A straight elbow keeps it there.'], h: 'What keeps the distance the same?' },
    { q: 'Why close one eye when sighting?', c: ['So you see one pencil, not two', 'To make the object look bigger', 'To rest your eyes'], s: ['With both eyes open, a close pencil looks doubled.', 'One eye gives one clear pencil.'], h: 'Try it: hold a pencil close with both eyes open.' },
    { q: 'NAME bent the elbow between two measurements. What happens?', c: ['The scale changes, so the comparison is wrong', 'Nothing changes', 'The pencil reads lighter'], s: ['Moving the pencil closer makes things measure smaller on it, and farther makes them larger.', 'So comparing the two measurements gives a wrong ratio.'], h: 'Did the pencil move closer or farther?' },
    { q: 'How should the pencil face you when you sight?', c: ['Flat to your face, not tipped toward or away from you', 'Pointing at the object', 'Tipped toward you'], s: ['Tipping the pencil changes the lengths you read.', 'Keep it flat, like a ruler held against a window.'], h: 'Think of a ruler on a window pane.' }];
  G('draw.sighting', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) return bank(R, SIGHTQ, 1);
    var w = R.pick([2, 3, 4]), h = R.pick([1, 2, 3, 4, 5, 6].filter(function (x) { return x !== w; })), k = R.int(2, 5), W = w * k, thing = R.pick(['window', 'picture frame', 'cereal box', 'door', 'book']);
    if (L === 2) {
      if (R.chance(0.3)) return bank(R, SIGHTQ, 2);
      return { q: 'Sighting a ' + thing + ' with your arm straight, you find it is ' + w + ' thumb-lengths wide and ' + h + ' thumb-lengths tall. You draw it ' + W + ' cm wide. How tall should you draw it?', a: num(h * k), unit: 'cm',
        steps: ['Height : width = ' + h + ' : ' + w + '.', 'The drawing is ' + W + ' cm wide, so one unit is $' + W + ' \\div ' + w + ' = ' + k + '$ cm.', 'Height = $' + h + ' \\times ' + k + ' = ' + (h * k) + '$ cm.'], hint: 'Find how many centimeters one thumb-length is in your drawing.' };
    }
    if (R.coin()) {
      var g = gcd(h, w);
      return { q: 'A ' + thing + ' sights as ' + w + ' units wide and ' + h + ' units tall. How many times as tall as it is wide is it? (A fraction or decimal is fine.)', a: { t: 'num', v: (h / g) + '/' + (w / g) },
        steps: ['Height divided by width is $' + h + ' \\div ' + w + '$.', (w / g === 1 ? 'That is ' + (h / g) + '.' : 'That is $\\frac{' + (h / g) + '}{' + (w / g) + '}$' + (w / g === 3 ? '' : ', or ' + (h / w)) + '.'), 'Any drawing with this ratio has the right proportions.'], hint: 'Divide the height by the width.' };
    }
    return { q: 'On your pencil, a mug measures ' + h + ' units tall and ' + w + ' units wide. You draw it ' + (h * k) + ' cm tall. How wide should it be?', a: num(W), unit: 'cm',
      steps: ['One unit is $' + (h * k) + ' \\div ' + h + ' = ' + k + '$ cm in your drawing.', 'Width = $' + w + ' \\times ' + k + ' = ' + W + '$ cm.'], hint: 'Find the size of one unit first.' };
  });
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }

  // ---------------------------------------------------------------- draw.angles-plumb
  // points on the still life in draw-pics kind 'plumb' (240 × 170): [x, y, name]
  var PL = { bottleTop: [60, 22, 'the top of the bottle'], bottleBase: [60, 140, 'the middle of the bottle\'s base'], shoulderR: [80, 70, 'the bottle\'s right shoulder'], baseR: [80, 140, 'the bottle\'s right base corner'], baseL: [40, 140, 'the bottle\'s left base corner'],
    rimL: [130, 95, 'the left end of the cup\'s rim'], cupBL: [130, 140, 'the cup\'s left base corner'], rimR: [170, 95, 'the right end of the cup\'s rim'], cupBR: [170, 140, 'the cup\'s right base corner'], appleTop: [110, 110, 'the top of the apple'], appleBot: [110, 140, 'the bottom of the apple'], handle: [184, 115, 'the cup handle'] };
  var PLUMB_PAIRS = [['bottleTop', 'bottleBase'], ['shoulderR', 'baseR'], ['rimL', 'cupBL'], ['rimR', 'cupBR'], ['appleTop', 'appleBot']];
  var ANGLEQ = [
    { q: 'NAME tilts the pencil to match a roof edge when judging its angle. What is wrong?', c: ['A tilted pencil gives nothing steady to compare the edge with', 'The pencil should be closer to the eye', 'Nothing is wrong'], s: ['The pencil only helps if it is truly level or upright.', 'Then you can see how far the edge tilts away from it.'], h: 'What do you compare the edge with?' },
    { q: 'What is a plumb line?', c: ['A line that hangs straight down, like a weight on a string', 'A line that leans at 45 degrees', 'The outline of a fruit'], s: ['A plumb bob is a weight on a string.', 'Its string hangs straight down, and a pencil held upright copies it.'], h: 'Think of a weight on a string.' },
    { q: 'An edge rises like a clock hand pointing from the center to two o\'clock. About what angle does it make with level?', c: ['About 30 degrees', 'About 60 degrees', 'About 90 degrees'], s: ['Three o\'clock is level; twelve o\'clock is straight up, 90 degrees away.', 'Each hour is 30 degrees, and two o\'clock is one hour above level.'], h: 'Each hour on a clock is 30 degrees.' },
    { q: 'An edge rises like a clock hand pointing from the center to one o\'clock. About what angle does it make with level?', c: ['About 60 degrees', 'About 30 degrees', 'About 15 degrees'], s: ['Three o\'clock is level and each hour is 30 degrees.', 'One o\'clock is two hours above level: 60 degrees.'], h: 'Each hour on a clock is 30 degrees.' }];
  G('draw.angles-plumb', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var deg = R.pick([10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]), wrong = deg <= 45 ? deg + 30 : deg - 30;
      return { q: 'About how many degrees does this edge rise from the level line?', viz: pics('angle', { deg: deg }, 'A slanted edge and a dashed level line'), a: among(R, deg + '°', [wrong + '°']),
        steps: ['Level is 0 degrees and straight up is 90 degrees.', 'This edge rises about ' + (deg === 45 ? 'halfway to straight up' : deg < 45 ? 'less than halfway to straight up' : 'more than halfway to straight up') + ': about ' + deg + ' degrees.'], hint: 'Halfway between level and straight up is 45 degrees.' };
    }
    if (L === 2 || R.chance(0.5)) {
      var pair = R.pick(PLUMB_PAIRS), up = R.coin(), ref = PL[pair[up ? 1 : 0]], ans = PL[pair[up ? 0 : 1]];
      var cands = Object.keys(PL).map(function (k) { return PL[k]; }).filter(function (p) { return M.abs(p[0] - ref[0]) >= 20 && (up ? p[1] < ref[1] - 10 : p[1] > ref[1] + 10); });
      if (cands.length < 2) { up = !up; ref = PL[pair[up ? 1 : 0]]; ans = PL[pair[up ? 0 : 1]]; cands = Object.keys(PL).map(function (k) { return PL[k]; }).filter(function (p) { return M.abs(p[0] - ref[0]) >= 20 && (up ? p[1] < ref[1] - 10 : p[1] > ref[1] + 10); }); }
      var dots = R.shuffle([ans].concat(R.sample(cands, M.min(2, cands.length))));
      return { q: 'Hold your pencil straight up and down through point P, like a plumb line. Which lettered point is straight ' + (up ? 'above' : 'below') + ' P?', viz: pics('plumb', { ref: [ref[0], ref[1]], line: false, dots: dots.map(function (p) { return [p[0], p[1]]; }) }, 'A still life with point P and lettered points'),
        a: mc(letters(dots.length), dots.indexOf(ans)), steps: ['P is ' + ref[2] + '.', 'A vertical line through P passes through ' + ans[2] + '.', 'The other points are off to the side, so the answer is ' + letter(dots.indexOf(ans)) + '.'], hint: 'Imagine a string with a weight hanging from P.' };
    }
    if (R.coin()) { // which point is level with P? (the two ends of the cup's rim)
      var refL = R.coin(), r2 = refL ? PL.rimL : PL.rimR, a2 = refL ? PL.rimR : PL.rimL, c2 = R.sample([PL.handle, PL.appleTop, PL.shoulderR, PL.cupBL], 2), dots2 = R.shuffle([a2].concat(c2));
      return { q: 'Now hold the pencil level through point P. Which lettered point is level with P?', viz: pics('plumb', { ref: [r2[0], r2[1]], dots: dots2.map(function (p) { return [p[0], p[1]]; }) }, 'A still life with point P and lettered points'),
        a: mc(letters(3), dots2.indexOf(a2)), steps: ['P is ' + r2[2] + '.', 'A level line through P meets ' + a2[2] + '.', 'So the answer is ' + letter(dots2.indexOf(a2)) + '.'], hint: 'Slide your eye straight across from P.' };
    }
    return bank(R, ANGLEQ, 3);
  });

  // ---------------------------------------------------------------- draw.grid-method
  G('draw.grid-method', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var s = R.int(1, 3), c = R.int(3, 6), r = R.int(3, 6);
      return { q: 'A photo ' + (c * s) + ' cm wide and ' + (r * s) + ' cm tall gets a grid of ' + s + ' cm squares. How many squares are there?', a: num(c * r),
        steps: ['Across: $' + (c * s) + ' \\div ' + s + ' = ' + c + '$ columns.', 'Down: $' + (r * s) + ' \\div ' + s + ' = ' + r + '$ rows.', '$' + c + ' \\times ' + r + ' = ' + (c * r) + '$ squares.'], hint: 'Count the columns and the rows, then multiply.' };
    }
    if (L === 2 || R.coin()) {
      var s2 = R.pick([1, 2, 3]), k = R.int(2, 4), W = s2 * R.int(3, 6), rev = L === 3;
      if (rev) {
        return { q: 'You want to copy a ' + W + ' cm wide photo so the drawing is ' + (W * k) + ' cm wide. The photo\'s grid has ' + s2 + ' cm squares. How big should the squares on your paper be?', a: num(s2 * k), unit: 'cm',
          steps: ['The drawing is $' + (W * k) + ' \\div ' + W + ' = ' + k + '$ times as wide.', 'So each square must be ' + k + ' times as big: $' + k + ' \\times ' + s2 + ' = ' + (s2 * k) + '$ cm.'], hint: 'Find the scale factor first.' };
      }
      return { q: 'A photo has a grid of ' + s2 + ' cm squares. You draw a matching grid of ' + (s2 * k) + ' cm squares on your paper. The photo is ' + W + ' cm wide. How wide will your drawing be?', a: num(W * k), unit: 'cm',
        steps: ['The scale factor is $' + (s2 * k) + ' \\div ' + s2 + ' = ' + k + '$.', 'The drawing is ' + k + ' times as wide as the photo.', '$' + k + ' \\times ' + W + ' = ' + (W * k) + '$ cm.'], hint: 'How many times bigger is each paper square?' };
    }
    var cols = R.int(3, 5), rows = R.int(cols + 1, 6), big = R.pick([4, 5, 6]);
    var right = cols + ' columns and ' + rows + ' rows of ' + big + ' cm squares', wr = [cols + ' columns and ' + rows + ' rows of ' + big + ' cm by ' + (big - 2) + ' cm rectangles', rows + ' columns and ' + cols + ' rows of ' + big + ' cm squares', (cols + 1) + ' columns and ' + rows + ' rows of ' + big + ' cm squares'];
    return { q: 'A photo has a grid of ' + cols + ' columns and ' + rows + ' rows of 2 cm squares. Which paper grid copies it larger <b>without stretching</b> it?', a: among(R, cap(right), R.sample(wr, 2).map(cap)),
      steps: ['The paper grid needs the same number of columns and rows: ' + cols + ' and ' + rows + '.', 'Its cells must be the same shape as the photo\'s: squares.', 'So: ' + right + '.'], hint: 'Same count of rows and columns, same shape of cell.' };
  });

  // ---------------------------------------------------------------- draw.checking
  var CHECKQ = [
    { q: 'To see only the big light and dark shapes of your drawing, what should you do?', c: ['Squint', 'Look closer', 'Add more details'], s: ['Squinting blurs the details away.', 'Only the big lights and darks remain.'], h: 'How do you blur your view?' },
    { q: 'Which check best shows a lopsided or crooked shape?', c: ['Look at the drawing flipped, in a mirror', 'Squint at it', 'Use a harder pencil'], s: ['Your eye gets used to a drawing.', 'A flipped image looks new, so crooked shapes jump out.'], h: 'Make it look new.' },
    { q: 'Why do some errors show when you step back from a drawing?', c: ['From a distance you see proportions and big shapes', 'Pencil lines look lighter from far away', 'Distance hides every mistake'], s: ['Up close you see small parts one at a time.', 'From a distance you see the whole, so proportion errors show.'], h: 'What do you see from across the room?' },
    { q: 'Why does turning a drawing upside down help you check it?', c: ['It stops looking familiar, so you see shapes and angles', 'It makes the values darker', 'It hides the mistakes'], s: ['Your brain fills in what it expects.', 'Upside down, the subject is unfamiliar, so you see what is really there.'], h: 'What does your brain stop doing?' },
    { q: 'NAME has worked on a drawing for an hour and cannot see what is wrong. What helps?', c: ['Take a short break, then look again with fresh eyes', 'Keep going without stopping', 'Press harder on every line'], s: ['Eyes get used to a drawing.', 'A break lets you see it fresh.'], h: 'Fresh eyes.' },
    { q: 'To test whether a vase stands straight, which tool helps most?', c: ['A plumb line through its center', 'Squinting at it', 'A softer pencil'], s: ['A plumb line is truly vertical.', 'If the vase\'s center leans away from it, the vase leans.'], h: 'What is truly vertical?' }];
  CHECKQ.push(
    { q: 'NAME wants to check whether the shadows in a drawing are as dark as the real ones. What helps most?', c: ['Squint at the object and the drawing in turn', 'Look at the drawing in a mirror', 'Turn the drawing upside down'], s: ['Squinting shows the big values.', 'Compare the squinted object with the squinted drawing.'], h: 'Which trick shows values?' },
    { q: 'How often is it good to step back and look at a drawing?', c: ['Every so often, for example every ten minutes', 'Only when it is finished', 'Never; stay close to the paper'], s: ['Errors are easier to fix early.', 'Step back regularly while you work.'], h: 'Early fixes are easy fixes.' },
    { q: 'Holding a drawing up to a light and looking from the back shows…', c: ['the drawing reversed, like in a mirror', 'only the darkest values', 'the drawing upside down'], s: ['From the back, through the paper, the image is reversed.', 'That works like a mirror.'], h: 'You see it through the paper.' },
    { q: 'NAME measured a face with sighting and found the eyes drawn too high. Which check did NAME use?', c: ['Measuring one part against another', 'Squinting', 'Taking a break'], s: ['Sighting compares lengths.', 'That is measuring one part against another.'], h: 'Sighting is a kind of…' });
  G('draw.checking', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 2 && R.chance(0.35)) {
      var ks = R.shuffle(['contrast', 'flat']), ask = R.coin() ? 'contrast' : 'flat';
      return { q: 'Squint at the two pictures. Which one has ' + (ask === 'contrast' ? '<b>strong lights and darks</b>' : '<b>only middle grays</b>') + '?', viz: { name: 'ar-value', opts: { mode: 'key', keys: ks, quiet: true, interactive: false, label: 'Two small landscapes, A and B' } },
        a: mc(['A', 'B'], ks.indexOf(ask)), steps: ['Squinting hides the details and leaves the big values.', 'Picture ' + letter(ks.indexOf('contrast')) + ' has very light and very dark areas; picture ' + letter(ks.indexOf('flat')) + ' is all middle gray.'], hint: 'Half-close your eyes.' };
    }
    return bank(R, CHECKQ, L);
  });

})(window.MathLadder);

/* ---- part B ---- */
/* Drawing Basics (draw), part B: units 7 to 12 (perspective, composition, still life and texture, faces, hands and figures,
   practice plans). Problems check what a learner should see and know: which depth cue, where eye level is, how many vanishing
   points, where the third lines fall, which setup or drawing avoids the topic's trouble spot, the head and figure averages
   (always "about"), and the reasons behind them. Pictures are quiet visuals from the kit (static/art/viz/art.js) and this
   course's own visuals (static/art/viz/draw.js, part B: draw-pose, draw-cloth, draw-still, draw-surface, draw-lead,
   draw-focal, draw-hands, draw-nose). Letters in pictures follow the order given in opts, so answers are computed from it.
   Levels: 1 one idea, picture-first, few choices; 2 the trouble-note near miss or a measurement; 3 applying it to a new case,
   spotting an error, or a measurement with an extra step. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;
  function A() { return ML.art; }
  // ---------------------------------------------------------------- helpers
  var NAMES = ['Ava', 'Leo', 'Sam', 'Ruby', 'Omar', 'Hana', 'Mia', 'Noah', 'Lena', 'Theo', 'Iris', 'Max'];
  function who(R) { return R.pick(NAMES); }
  function letter(i) { return String.fromCharCode(65 + i); }
  function letters(n) { var o = []; for (var i = 0; i < n; i++) o.push(letter(i)); return o; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  // a text multiple-choice item: c[0] is right; the engine shuffles the choices
  function pickMc(R, bank, nm) {
    var it = R.pick(bank), n = nm || who(R), f = function (s) { return String(s).replace(/NAME/g, n); };
    var p = { q: f(it.q), a: { t: 'mc', choices: it.c.map(f), v: 0 }, steps: it.s.map(f), hint: f(it.h) };
    if (it.viz) p.viz = it.viz;
    return p;
  }
  function lettered(n, right) { return { t: 'mc', choices: letters(n), v: right, keep: true }; }
  function num(v) { return { t: 'num', v: String(v) }; }
  function fix(x) { return Math.round(x * 1000) / 1000; }
  function q(v, viz, a, steps, hint, extra) { var p = { q: v, a: a, steps: steps, hint: hint }; if (viz) p.viz = viz; if (extra) for (var k in extra) p[k] = extra[k]; return p; }

  // ================================================================ UNIT 7: PERSPECTIVE
  var CUE_NAME = { overlap: 'Overlap', size: 'Smaller size', placement: 'Higher placement on the page', none: 'No depth cue' };
  G('draw.depth-cues', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var cue = R.pick(['overlap', 'size', 'placement']), ch = ['overlap', 'size', 'placement'];
      return q(R.pick(['Which depth cue does this picture use?', 'What makes some things in this picture look farther away?']), { name: 'ar-persp', opts: { mode: 'depth', cue: [cue], quiet: true, interactive: false } },
        { t: 'mc', choices: ch.map(function (k) { return CUE_NAME[k]; }), v: ch.indexOf(cue) },
        [cue === 'overlap' ? 'One shape hides part of the other, so the hidden one is behind.' : cue === 'size' ? 'The trees are the same kind, but some are drawn smaller. Smaller looks farther away.' : 'The trees are the same size, but some sit higher on the page. Below eye level, higher looks farther away.', 'The cue is ' + CUE_NAME[cue].toLowerCase() + '.'],
        'Look for hiding, shrinking or climbing up the page.');
    }
    if (L === 2) {
      var want = R.pick(['none', 'overlap', 'size', 'placement']), pool = ['none', 'overlap', 'size', 'placement'].filter(function (k) { return k !== want; }), list = R.shuffle([want].concat(R.sample(pool, 2)));
      var ask = want === 'none' ? 'Which picture has no depth cue at all?' : 'Which picture uses ' + CUE_NAME[want].toLowerCase() + ' to show depth?';
      return q(ask, { name: 'ar-persp', opts: { mode: 'depth', cue: list, quiet: true, interactive: false } }, lettered(3, list.indexOf(want)),
        list.map(function (k, i) { return letter(i) + ': ' + CUE_NAME[k].toLowerCase() + '.'; }).concat(['So the answer is ' + letter(list.indexOf(want)) + '.']),
        want === 'none' ? 'Find the picture where every tree is the same size on one line.' : 'Name the cue in each picture first.');
    }
    var nm = who(R);
    return pickMc(R, [
      { q: 'A red ball partly hides a blue box in NAME\'s drawing. Which one looks closer?', c: ['The red ball', 'The blue box', 'Neither; overlap does not show depth'], s: ['The ball hides part of the box.', 'Something can only hide what is behind it, so the ball is in front.'], h: 'What can hide what?' },
      { q: 'Two birds of the same size fly high above eye level. In the drawing, where does the farther bird go?', c: ['Smaller and lower on the page', 'Smaller and higher on the page', 'The same size, higher on the page'], s: ['Farther things look smaller.', 'Above eye level, farther things sit lower, closer to the horizon line.'], h: 'Above eye level, far things come down toward the horizon.' },
      { q: 'NAME draws a far house the same size as a near house, both on one line at the bottom of the page. What is the best fix?', c: ['Draw the far house smaller and higher on the page, partly behind something', 'Draw the far house darker', 'Draw the far house bigger so it is easy to see'], s: ['Nothing in the drawing tells which house is farther.', 'Smaller size, higher placement and overlap all say "farther away."'], h: 'Use the three depth cues.' },
      { q: 'Below eye level, on flat ground, which sits higher on the page?', c: ['The thing that is farther away', 'The thing that is closer', 'Both sit at the same height'], s: ['Flat ground rises toward the horizon line as it goes back.', 'So farther things below eye level sit higher on the page.'], h: 'Think of the ground climbing toward the horizon.' },
      { q: 'Three identical trees stand at different distances. Which list puts the cues for the farthest tree together?', c: ['Smallest, highest on the page, partly hidden', 'Largest, lowest on the page, in front', 'Same size, same height, darkest'], s: ['The farthest tree looks smallest.', 'On the ground it sits highest on the page.', 'Nearer trees may overlap it.'], h: 'Far things shrink, climb and hide.' }
    ], nm);
  });

  G('draw.horizon-line', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 2 || (L === 1 && R.coin())) { // read a picture: which face of the box shows?
      var where = R.pick(['above', 'below', 'across']), x = R.pick([0.2, 0.3, 0.4, 0.55]), vp = R.pick([0.3, 0.5, 0.7]);
      var set = where === 'above' ? { horizon: R.pick([0.7, 0.75]), y: R.pick([0.12, 0.18]), h: 0.17 } : where === 'below' ? { horizon: R.pick([0.25, 0.3]), y: R.pick([0.48, 0.55]), h: 0.17 } : { horizon: R.pick([0.42, 0.48]), y: R.pick([0.28, 0.32]), h: 0.17 };
      var ch = ['The top', 'The bottom', 'Neither the top nor the bottom'], right = where === 'below' ? 0 : where === 'above' ? 1 : 2;
      return q('The pink line is the horizon line (eye level). Besides the front, which surface of the box can you see?', { name: 'ar-persp', opts: { points: 1, horizon: set.horizon, vp: vp, boxes: [{ x: x, y: set.y, w: 0.2, h: set.h }], quiet: true, interactive: false } },
        { t: 'mc', choices: ch, v: right, keep: true },
        ['The box is ' + (where === 'across' ? 'crossing the horizon line, partly above and partly below eye level.' : where + ' the horizon line, so it is ' + where + ' eye level.'),
          where === 'below' ? 'We look down on things below eye level, so we see the top.' : where === 'above' ? 'We look up at things above eye level, so we see the bottom.' : 'We look straight at it, so we see neither the top nor the bottom.'],
        'Is the box above, below or crossing eye level?');
    }
    if (L === 1) {
      var pos = R.pick(['above', 'below', 'across']);
      return q('A box in a perspective drawing is drawn ' + (pos === 'across' ? 'so that the horizon line runs across its middle' : pos + ' the horizon line') + '. Which of its surfaces can you see besides its sides?', null,
        { t: 'mc', choices: ['The top', 'The bottom', 'Neither the top nor the bottom'], v: pos === 'below' ? 0 : pos === 'above' ? 1 : 2, keep: true },
        ['The horizon line is eye level.', pos === 'below' ? 'Below eye level we look down and see tops.' : pos === 'above' ? 'Above eye level we look up and see bottoms.' : 'At eye level we see neither the top nor the bottom.'], 'Below: tops. Above: bottoms.');
    }
    return pickMc(R, [
      { q: 'In a drawing, the horizon line sits very low, near the bottom of the page. What does that tell you about the viewer?', c: ['The viewer\'s eyes are low, as if sitting or lying down', 'The viewer is high up, on a hill', 'Nothing; the horizon line can go anywhere'], s: ['The horizon line is the viewer\'s eye level.', 'A low horizon line means low eyes.'], h: 'The horizon line is eye level.' },
      { q: 'NAME climbs a ladder and keeps drawing the same room. What happens to the horizon line in the drawing?', c: ['It moves up with NAME\'s eyes', 'It moves down', 'It stays where it was'], s: ['The horizon line is at eye level.', 'Climbing raises NAME\'s eyes, so the horizon line moves up.'], h: 'Where are the eyes now?' },
      { q: 'NAME is drawing a kitchen and cannot see the outdoor horizon. Where does the horizon line go?', c: ['At NAME\'s eye level on the far wall', 'Where the floor meets the wall', 'Along the top of the window'], s: ['Indoors you still have an eye level.', 'Look straight ahead: that height on the far wall is the horizon line.'], h: 'Look straight ahead without tilting your head.' },
      { q: 'Which statement about the horizon line is true?', c: ['It is always at the viewer\'s eye level', 'It is always where the land meets the sky', 'It is always in the middle of the page'], s: ['In hills or indoors, the land does not show eye level.', 'The horizon line in perspective is eye level, wherever that is.'], h: 'It belongs to the viewer, not to the land.' },
      { q: 'You look at a shelf that is higher than your eyes. Which part of the shelf do you see?', c: ['Its underside', 'Its top surface', 'Both its top and its underside'], s: ['The shelf is above eye level.', 'Above eye level we see the bottoms of things.'], h: 'Is it above or below your eyes?' },
      { q: 'A table top is below NAME\'s eye level. What does NAME see?', c: ['The top surface of the table', 'The underside of the table', 'Only the front edge'], s: ['Below eye level we look down on things.', 'So NAME sees the top of the table.'], h: 'Look down at it.' }
    ]);
  });

  G('draw.one-point', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) return pickMc(R, [
      { q: 'In one-point perspective, where do the edges that go straight back from you meet?', c: ['At one vanishing point on the horizon line', 'At a point above the horizon line', 'They never meet; they stay parallel on the paper'], s: ['Lines going straight back seem to come together far away.', 'They meet at one vanishing point, which sits on the horizon line.'], h: 'Think of railroad tracks.' },
      { q: 'You face a box straight on. Which of its edges slant toward the vanishing point?', c: ['Only the edges that go back, away from you', 'The horizontal edges of the front', 'The vertical edges of the front'], s: ['The front of the box is flat to you, so its edges stay horizontal and vertical.', 'Only the edges going back slant to the vanishing point.'], h: 'What does the front face look like?' },
      { q: 'In one-point perspective, the front face of a box looks like…', c: ['A plain rectangle', 'A slanted diamond', 'A trapezoid that narrows upward'], s: ['Facing it straight on, the front is flat to you.', 'Its edges stay horizontal and vertical: a plain rectangle.'], h: 'It faces you directly.' },
      { q: 'NAME draws a long hallway seen straight on. How many vanishing points does it need?', c: ['One', 'Two', 'Three'], s: ['Facing straight down the hallway, the lines along the walls, floor and ceiling all go straight back.', 'They meet at one point.'], h: 'Do all the long lines go the same way?' }
    ]);
    // measuring along an edge that goes back: points on it move toward the vanishing point in proportion
    var fr = L === 2 ? R.pick([[1, 2], [1, 4], [3, 4]]) : R.pick([[1, 3], [2, 3], [1, 4], [3, 4], [1, 2]]), k = fr[1];
    var left = k * R.int(2, 5), below = k * R.int(1, 4), t = fr[0] / fr[1], askBelow = R.coin();
    var newLeft = fix(left * (1 - t)), newBelow = fix(below * (1 - t)), frac = fr[0] === 1 && fr[1] === 2 ? 'halfway' : fr[0] + '/' + fr[1] + ' of the way';
    var ans = askBelow ? newBelow : newLeft;
    return q('In a one-point drawing, a front corner of a box is ' + left + ' cm to the left of the vanishing point and ' + below + ' cm below the horizon line. The back corner on the same edge is ' + frac + ' from the front corner to the vanishing point. How far ' + (askBelow ? 'below the horizon line' : 'to the left of the vanishing point') + ' is the back corner?', null, num(ans),
      ['The edge runs straight from the front corner to the vanishing point.', 'Going ' + frac + ' along it leaves ' + (fr[1] - fr[0]) + '/' + fr[1] + ' of each distance.',
        (askBelow ? below + ' × ' + (fr[1] - fr[0]) + '/' + fr[1] + ' = ' + ans : left + ' × ' + (fr[1] - fr[0]) + '/' + fr[1] + ' = ' + ans) + ' cm.'], 'Both distances shrink by the same fraction along the edge.', { unit: 'cm' });
  });

  G('draw.one-point-scenes', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var it = pickMc(R, [
        { q: 'Railroad ties are equally spaced on the ground. In a drawing looking down the track, the far ties look…', c: ['Closer together', 'Farther apart', 'Exactly as far apart as the near ones'], s: ['Equal spaces look smaller the farther away they are.', 'So the far ties crowd closer together.'], h: 'Far things look smaller, and so do far gaps.' },
        { q: 'In this picture of a road, what happens to the fence posts as they go back?', c: ['They get shorter and closer together', 'They stay the same height and spacing', 'They get taller'], s: ['The posts are the same in real life.', 'Farther posts look smaller, and the gaps between them look smaller too.'], h: 'Compare the first post with the last.', viz: { name: 'ar-persp', opts: { mode: 'road', quiet: true, interactive: false } } },
        { q: 'You stand in a doorway looking straight into a room. Where do the lines where the walls meet the floor go?', c: ['To one vanishing point at your eye level', 'Straight across the page', 'To two points at the sides of the page'], s: ['Those lines go straight away from you.', 'They meet at one vanishing point on the horizon line, at your eye level.'], h: 'This is one-point perspective.' }
      ]);
      return it;
    }
    // drawn size goes down in step with distance: h2 = h1 × d1 / d2
    var d1, d2, h1, ok = false, tries = 0;
    while (!ok && tries++ < 50) {
      d1 = R.pick([5, 10, 15, 20, 30]); var m = L === 2 ? R.pick([2, 3, 4, 0.5]) : R.pick([1.5, 2.5, 3, 4, 0.5, 0.25, 2 / 3]); d2 = fix(d1 * m); h1 = R.pick([3, 4, 6, 8, 9, 12]);
      ok = d2 !== d1 && Math.abs(d2 - Math.round(d2)) < 1e-9 && d2 > 0 && Math.abs(h1 * d1 / d2 * 2 - Math.round(h1 * d1 / d2 * 2)) < 1e-9;
    }
    if (!ok) { d1 = 10; d2 = 20; h1 = 6; }
    var h2 = fix(h1 * d1 / d2), thing = R.pick(['fence post', 'tree', 'lamppost', 'telephone pole']);
    return q('A ' + thing + ' ' + d1 + ' meters away is drawn ' + h1 + ' cm tall. An identical ' + thing + ' stands ' + d2 + ' meters away. About how tall should you draw it?', null, num(h2),
      ['Drawn size goes down in step with distance.', 'The distance changes by a factor of ' + d2 + ' ÷ ' + d1 + ', so the drawn height changes by ' + d1 + ' ÷ ' + d2 + '.', h1 + ' × ' + d1 + ' ÷ ' + d2 + ' = ' + h2 + ' cm.'],
      d2 > d1 ? 'Farther away means smaller: twice as far looks half as tall.' : 'Closer means bigger: half as far looks twice as tall.', { unit: 'cm' });
  });

  // pictures that show 1, 2 or 3 vanishing points (quiet: no points or construction lines)
  function perspPic(R, n) {
    if (n === 1) return { name: 'ar-persp', opts: { points: 1, horizon: R.pick([0.35, 0.45]), vp: R.pick([0.4, 0.5, 0.6]), boxes: [{ x: R.pick([0.15, 0.25]), y: 0.58, w: 0.22, h: 0.15 }, { x: R.pick([0.6, 0.65]), y: 0.08, w: 0.16, h: 0.11 }], quiet: true, interactive: false } };
    if (n === 2) return { name: 'ar-persp', opts: { points: 2, horizon: R.pick([0.3, 0.4]), left: R.pick([-0.1, 0.0]), right: R.pick([1.0, 1.1]), boxes: [{ x: R.pick([0.45, 0.5, 0.55]), y: 0.85, h: 0.35 }], quiet: true, interactive: false } };
    return { name: 'ar-persp', opts: { points: 3, down: R.coin(), quiet: true, interactive: false } };
  }
  var SCENES = [
    ['a long hallway, looking straight down it', 1], ['railroad tracks running straight away from you', 1], ['a room seen through a doorway, facing the far wall', 1],
    ['a building on a street corner, with its corner nearest you, seen at eye level', 2], ['a box turned on a table so a corner points at you, at eye level', 2], ['a house seen from the side of the road, corner first', 2],
    ['a skyscraper seen from its base, looking almost straight up', 3], ['tall buildings seen from a helicopter, looking far down', 3], ['a tall tower drawn from the bottom of its steps, looking up', 3]];
  G('draw.two-point', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      if (R.coin()) { var n = R.pick([1, 2, 2]); return q('How many vanishing points does this drawing use? Follow the edges that go back.', perspPic(R, n), { t: 'mc', choices: ['1', '2', '3'], v: n - 1, keep: true },
        [n === 1 ? 'The front faces are plain rectangles; only the edges going back slant, all toward one point.' : 'A corner faces you; the left edges slant to one point and the right edges to another. The vertical edges stay vertical.', 'So it uses ' + n + ' vanishing point' + (n > 1 ? 's' : '') + '.'], 'Do the top and bottom edges of the sides slant both left and right?'); }
      return pickMc(R, [
        { q: 'You look at a box with one corner pointing straight at you, at eye level. How many vanishing points do you need?', c: ['Two', 'One', 'Three'], s: ['The left side goes back to the left and the right side goes back to the right.', 'Each direction needs its own vanishing point: two.'], h: 'Which ways do the sides go back?' },
        { q: 'In two-point perspective, where do the two vanishing points sit?', c: ['Both on the horizon line', 'One on the horizon line and one far above it', 'At the top corners of the page'], s: ['Edges that go back level with the ground meet at eye level.', 'So both vanishing points sit on the horizon line.'], h: 'Where is eye level?' }
      ]);
    }
    if (L === 2) return pickMc(R, [
      { q: 'In two-point perspective at eye level, what happens to the vertical edges of a box?', c: ['They stay vertical', 'They lean toward a third point', 'They slant toward the left vanishing point'], s: ['Looking straight ahead, the vertical edges are flat to you.', 'So they stay vertical; only the edges going back left and right meet at points.'], h: 'Is your view tilted up or down?' },
      { q: 'NAME\'s box looks stretched, with very sharp corners. The two vanishing points are close together in the middle of the page. What is the fix?', c: ['Move the vanishing points much farther apart, even off the page', 'Move both vanishing points closer together', 'Add a third vanishing point'], s: ['Vanishing points close together make boxes look stretched, like a fisheye lens.', 'Spread them far apart; tape scrap paper beside the drawing if needed.'], h: 'The trouble is how close the points are.' },
      { q: 'Why does a box seen corner-first need a second vanishing point?', c: ['Its across edges now go away from you, to the left and right', 'Because its vertical edges go away from you', 'Because every drawing needs two points'], s: ['Turning the box makes its horizontal edges go back in two directions.', 'Each direction of parallel edges going away needs its own vanishing point.'], h: 'Which sets of edges go away from you?' },
      { q: 'NAME tapes extra paper beside a drawing before starting a two-point building. Why?', c: ['To have room to put the vanishing points far apart', 'To make a third vanishing point', 'To keep the horizon line straight'], s: ['Good two-point drawings often have their vanishing points off the edges of the drawing.', 'Extra paper gives room for them.'], h: 'Where do the vanishing points often go?' }
    ]);
    var sc = R.pick(SCENES);
    return q('How many vanishing points would you use to draw ' + sc[0] + '?', null, { t: 'mc', choices: ['1', '2', '3'], v: sc[1] - 1, keep: true },
      [sc[1] === 1 ? 'You face it straight on: the long lines go straight back to one point.' : sc[1] === 2 ? 'A corner faces you at eye level: two points on the horizon, verticals stay vertical.' : 'You look far up or down, so the vertical edges meet too: a third point.', 'So: ' + sc[1] + '.'],
      'Are you facing it straight on, seeing a corner, or looking far up or down?');
  });

  G('draw.three-point', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) return pickMc(R, [
      { q: 'When do you need a third vanishing point?', c: ['When you look far up or far down at something tall', 'Whenever a box has a corner facing you', 'Whenever the horizon line is in the middle'], s: ['Vertical edges stay vertical when you look straight ahead.', 'Looking far up or down makes them go away from you, so they meet at a third point.'], h: 'What makes vertical edges meet?' },
      { q: 'You look up at a skyscraper from the sidewalk. Where is the third vanishing point?', c: ['High above the building', 'Below the ground', 'On the horizon line'], s: ['The sides of the building seem to lean in toward each other above you.', 'They meet at a point high above: a worm\'s-eye view.'], h: 'Which way do the sides lean?' },
      { q: 'You look down from a tall tower at the buildings below. Where is the third vanishing point?', c: ['Below, under the buildings', 'High in the sky', 'There is no third point'], s: ['Looking down, the vertical edges go away from you downward.', 'They meet at a point below: a bird\'s-eye view.'], h: 'Which way are you looking?' },
      { q: 'Which edges meet at the third vanishing point?', c: ['The vertical edges', 'The edges going back to the left', 'The edges going back to the right'], s: ['The left and right edges use the two points on the horizon.', 'The third point is for the vertical edges.'], h: 'Which edges stay vertical in two-point?' },
      { q: 'NAME wants a drawing that makes a tower look huge and powerful from below. Which perspective fits best?', c: ['Three-point, looking up', 'One-point, facing a wall', 'Two-point at eye level'], s: ['Looking far up makes the vertical edges meet high above.', 'That worm\'s-eye view makes tall things look huge.'], h: 'How do you look at something huge?' }
    ]);
    if (L === 2) {
      var down = R.coin();
      if (R.chance(0.35)) return pickMc(R, [
        { q: 'NAME draws a city street from the top of a tall building, looking down. Which way do the vertical edges of the buildings below converge?', c: ['Down, toward a third point below', 'Up, toward a point in the sky', 'They stay vertical'], s: ['Looking down, the vertical edges go away from you downward.', 'So they meet at a third point below.'], h: 'Which way are you looking?' },
        { q: 'NAME lies on the grass under a tall tree and draws it looking up. Which way do the edges of the trunk lean?', c: ['Toward each other, up high', 'Apart, up high', 'They stay parallel and vertical'], s: ['Looking far up, vertical edges go away from you upward.', 'They come together toward a third point above.'], h: 'Think of looking up at a skyscraper.' },
        { q: 'In three-point perspective looking up, where is the horizon line usually?', c: ['Low, near or below the bottom of the picture', 'High, near the top of the picture', 'Exactly in the middle'], s: ['Looking up means most of the scene is above eye level.', 'So the horizon line sits low.'], h: 'Where is eye level when you look up?' }
      ]);
      return q('In this drawing the vertical edges are not vertical. Is the viewer looking up at the building or down on it?', { name: 'ar-persp', opts: { points: 3, down: down, horizon: down ? R.pick([0.04, 0.06, 0.09]) : R.pick([0.9, 0.94, 0.97]), left: R.pick([0.02, 0.06, 0.1]), right: R.pick([0.9, 0.94, 0.98]), quiet: true, interactive: false } },
        { t: 'mc', choices: ['Looking up at it', 'Looking down on it'], v: down ? 1 : 0, keep: true },
        [down ? 'The vertical edges come together toward the bottom, and we see the top of the box.' : 'The vertical edges come together toward the top, and the box looks tall above us.', down ? 'So the third vanishing point is below: we look down on it.' : 'So the third vanishing point is above: we look up at it.'],
        'Do the vertical edges come together at the top or at the bottom?');
    }
    if (R.coin()) { var sc = R.pick(SCENES); return q('How many vanishing points would you use to draw ' + sc[0] + '?', null, { t: 'mc', choices: ['1', '2', '3'], v: sc[1] - 1, keep: true },
      [sc[1] === 3 ? 'You look far up or down, so the vertical edges meet at a third point.' : 'You look straight ahead, so the vertical edges stay vertical.', 'So: ' + sc[1] + '.'], 'Is the view tilted far up or down?'); }
    return pickMc(R, [
      { q: 'NAME draws an ordinary house at eye level with a third vanishing point high above, so its walls lean in. What is wrong?', c: ['At eye level, vertical edges should stay vertical; two points are enough', 'The third point should be below the house', 'Nothing; every drawing needs three points'], s: ['A third point is for views that look far up or far down.', 'At eye level, the walls stay vertical.'], h: 'Is NAME looking far up?' },
      { q: 'What do artists call a view looking far up from below?', c: ['A worm\'s-eye view', 'A bird\'s-eye view', 'A profile view'], s: ['A worm on the ground looks up at everything.', 'So a view from far below is a worm\'s-eye view.'], h: 'Who looks up from the ground?' },
      { q: 'What do artists call a view looking far down from above?', c: ['A bird\'s-eye view', 'A worm\'s-eye view', 'A one-point view'], s: ['A bird in the sky looks down on everything.', 'So a view from high above is a bird\'s-eye view.'], h: 'Who looks down from the sky?' }
    ]);
  });

  G('draw.atmospheric', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      if (R.coin()) return q('Compared with the nearest hills, how do the farthest hills in this picture look?', { name: 'ar-persp', opts: { mode: 'atmos', quiet: true, interactive: false } },
        { t: 'mc', choices: ['Lighter, bluer and softer', 'Darker and sharper', 'Exactly the same'], v: 0 }, ['The nearest hill is dark green and crisp.', 'Each hill farther back is paler and bluer: atmospheric perspective.'], 'Compare the front hill with the back one.');
      return pickMc(R, [
        { q: 'On a hazy day, how do faraway mountains look compared with near ones?', c: ['Lighter and bluer, with less detail', 'Darker, with more detail', 'Exactly the same'], s: ['There is more air between you and far mountains.', 'The air veils them in pale blue and washes out darks and detail.'], h: 'Think of a row of hills fading away.' },
        { q: 'What causes atmospheric perspective?', c: ['Air, water droplets and dust between you and far things scatter light', 'Far things are made of paler materials', 'Your eyes get tired looking far away'], s: ['Light from far things passes through a lot of air.', 'The air scatters light, veiling far things and lowering their contrast.'], h: 'What is between you and the far hills?' },
        { q: 'What is another name for atmospheric perspective?', c: ['Aerial perspective', 'Two-point perspective', 'Linear perspective'], s: ['Atmospheric perspective is also called aerial perspective, from the air that causes it.'], h: 'It is about the air.' },
        { q: 'NAME looks at a city skyline far away on a hazy morning. How do the far buildings look?', c: ['Pale and bluish-gray, with few details', 'Darker and more detailed than near buildings', 'Bright red'], s: ['A lot of air lies between NAME and the far buildings.', 'They look pale, bluish and simple.'], h: 'More air, more haze.' }
      ]);
    }
    if (L === 2 && R.chance(0.4)) return pickMc(R, [
      { q: 'NAME draws three rows of hills. Which row should have the lightest values?', c: ['The farthest row', 'The nearest row', 'The middle row'], s: ['The farthest row has the most air in front of it.', 'So it is the palest.'], h: 'More air, paler hills.' },
      { q: 'What happens to contrast in the distance on a hazy day?', c: ['It drops: darks get lighter and the range of values shrinks', 'It rises: darks get darker', 'It stays the same'], s: ['The air veils far things.', 'Their darks lighten, so contrast drops.'], h: 'What does haze do to dark shapes?' },
      { q: 'Which edges should NAME use for far-off mountains?', c: ['Soft edges', 'Sharp, crisp edges', 'Thick dark outlines'], s: ['Air softens what is far away.', 'Soft edges push things back.'], h: 'Think of fog.' }
    ]);
    if (L === 2) {
      var flat = R.coin();
      return q('Does this picture use atmospheric perspective?', { name: 'ar-persp', opts: { mode: 'atmos', flat: flat, quiet: true, interactive: false } }, { t: 'mc', choices: ['Yes', 'No'], v: flat ? 1 : 0, keep: true },
        flat ? ['Every hill is the same dark green, near or far.', 'Nothing gets paler with distance, so no: the picture looks flat.'] : ['The hills get paler and bluer as they go back.', 'So yes, it uses atmospheric perspective.'], 'Do the farther hills get paler?');
    }
    return pickMc(R, [
      { q: 'Which of these is NOT a sign of atmospheric perspective?', c: ['Sharper edges and darker darks in the distance', 'Paler values in the distance', 'Less detail in the distance'], s: ['Atmospheric perspective makes far things lighter, softer and simpler.', 'Sharper edges and darker darks far away are the opposite.'], h: 'What does haze do to edges and darks?' },
      { q: 'NAME draws far-off hills with the same dark lines and detail as the trees in front. What happens?', c: ['The hills jump forward and the picture looks flat', 'The hills look farther away', 'The picture looks hazier'], s: ['Dark lines and crisp detail say "near."', 'Used in the distance, they pull the hills forward.'], h: 'Where should the darkest darks be?' },
      { q: 'In a pencil drawing, how do you push a mountain back into the distance?', c: ['Lighter values, less contrast and fewer details', 'Darker outlines and more details', 'A thicker outline all around'], s: ['With pencil, atmospheric perspective is about value.', 'Keep far things light, low in contrast and simple.'], h: 'Think of haze.' },
      { q: 'Where should NAME put the darkest darks and sharpest details in a landscape?', c: ['In the foreground, nearest the viewer', 'On the farthest mountains', 'Evenly everywhere'], s: ['Near things show the most contrast and detail.', 'Saving them for the front makes the background recede.'], h: 'What is closest?' }
    ]);
  });

  // ================================================================ UNIT 8: COMPOSITION
  var THIRD_NAME = function (x) { return Math.abs(x - 1 / 3) < 0.06 ? 'Near the left third line' : Math.abs(x - 2 / 3) < 0.06 ? 'Near the right third line' : 'In the center'; };
  G('draw.rule-of-thirds', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1 || (L === 3 && R.chance(0.3))) {
      var sx = R.pick([1 / 3, 0.5, 2 / 3]), subj = R.pick(['tree', 'house', 'boat', 'rock']), hy = R.pick([0.55, 0.62, 0.5]), sy = subj === 'boat' ? hy + 0.12 : hy + 0.08;
      var ch = ['Near the left third line', 'In the center', 'Near the right third line'], ans = THIRD_NAME(sx);
      return q('Where is the ' + subj + ' placed across the picture?', { name: 'ar-compose', opts: { scene: { sx: fix(sx), sy: sy, hy: hy, subject: subj }, overlays: L === 1 ? ['thirds'] : [], quiet: true, interactive: false } },
        { t: 'mc', choices: ch, v: ch.indexOf(ans), keep: true },
        [L === 1 ? 'The dashed lines divide the picture into thirds.' : 'Imagine the picture divided into thirds across.', 'The ' + subj + ' sits ' + ans.toLowerCase() + '.'], 'Find the third lines first.');
    }
    if (L === 2 || R.coin()) {
      var dirW = R.coin(), size = dirW ? R.pick([18, 21, 24, 27, 30, 36, 42]) : R.pick([12, 15, 18, 21, 24, 27]), which = R.pick([1, 2]), ans2 = size * which / 3;
      return q('A drawing is ' + size + ' cm ' + (dirW ? 'wide' : 'tall') + '. How far from the ' + (dirW ? 'left' : 'top') + ' edge is the ' + (which === 1 ? 'first' : 'second') + ' ' + (dirW ? 'vertical' : 'horizontal') + ' third line?', null, num(ans2),
        ['One third of ' + size + ' is ' + (size / 3) + ' cm.', which === 1 ? 'The first line is one third of the way: ' + ans2 + ' cm.' : 'The second line is two thirds of the way: 2 × ' + (size / 3) + ' = ' + ans2 + ' cm.'], 'Divide the length by 3.', { unit: 'cm' });
    }
    return pickMc(R, [
      { q: 'In NAME\'s landscape, the horizon sits on the upper third line. What does the picture show more of?', c: ['Land', 'Sky', 'Equal amounts of land and sky'], s: ['Above the upper third line is one third: the sky.', 'Below it are two thirds: the land.'], h: 'Which part gets two thirds?' },
      { q: 'NAME wants a big, dramatic sky. Where should the horizon go?', c: ['On the lower third line', 'On the upper third line', 'Exactly in the middle'], s: ['A low horizon leaves two thirds of the picture for the sky.', 'So put it on the lower third line.'], h: 'Give the sky two thirds.' },
      { q: 'Which statement about the rule of thirds is true?', c: ['It is a guideline; centering can be the right choice', 'A centered subject is always a mistake', 'It is a law of how the eye works'], s: ['The rule of thirds often makes a picture livelier.', 'But portraits and calm or symmetrical scenes are often centered on purpose.'], h: 'Is it a rule or a guideline?' },
      { q: 'NAME\'s horizon cuts the picture exactly in half. What is a common effect?', c: ['Sky and land compete as two equal halves', 'The picture looks deeper', 'The focal point becomes clearer'], s: ['Two equal halves fight for attention.', 'Moving the horizon to a third line lets one part lead.'], h: 'What happens with two equal halves?' }
    ]);
  });

  var FOCAL_HOW = { contrast: 'The strongest contrast', isolation: 'Isolation: it stands apart', detail: 'The most detail', lines: 'Lines that lead to it' };
  G('draw.focal-point', function (R, ctx) {
    var L = ctx.level || 1;
    if (L <= 2) {
      var kind = L === 1 ? R.pick(['contrast', 'isolation']) : R.pick(['detail', 'lines', 'contrast', 'isolation']), tgt = R.int(0, 2), seed = R.int(1, 400);
      var viz = { name: 'draw-focal', opts: { kind: kind, target: tgt, seed: seed, quiet: true, interactive: false } };
      if (L === 1 || R.coin()) return q('Which lettered circle is the focal point, the one your eye goes to first?', viz, lettered(3, tgt),
        ['Look for the circle that is different from the rest.', 'Circle ' + letter(tgt) + ' stands out by ' + FOCAL_HOW[kind].toLowerCase().replace(':', ',') + '.'], 'Which one does not match its neighbors?');
      var keys = ['contrast', 'isolation', 'detail', 'lines'];
      return q('Circle ' + letter(tgt) + ' is the focal point. What makes it stand out?', viz, { t: 'mc', choices: keys.map(function (k) { return FOCAL_HOW[k]; }), v: keys.indexOf(kind) },
        ['Compare circle ' + letter(tgt) + ' with the others.', 'It stands out by ' + FOCAL_HOW[kind].toLowerCase().replace(':', ',') + '.'], 'Is it darker, alone, more detailed, or at the end of lines?');
    }
    return pickMc(R, [
      { q: 'NAME is drawing a portrait. Where should the darkest darks and the most careful detail go?', c: ['Around the eyes', 'Evenly over the clothes and background', 'At the edges of the paper'], s: ['In a portrait the face, and usually the eyes, is the focal point.', 'Put the most contrast and detail there and keep the rest simpler.'], h: 'Where should the viewer look first?' },
      { q: 'NAME drew every brick of a building with the same care and the same dark lines. What is the problem?', c: ['The eye has nowhere to rest: there is no focal point', 'There is too little detail', 'The bricks are in the wrong perspective'], s: ['Equal detail and contrast everywhere means nothing stands out.', 'Choose one place to finish fully and simplify the rest.'], h: 'What stands out?' },
      { q: 'Which of these makes a focal point?', c: ['A dark tree alone in a pale field', 'Ten trees of the same size and value spread evenly', 'A light gray sky with no clouds'], s: ['A focal point needs something different: contrast, isolation, detail or lines that lead to it.', 'A dark tree alone in a pale field has both contrast and isolation.'], h: 'Look for difference.' },
      { q: 'A road in NAME\'s drawing curves up to a small cabin. How does it help the focal point?', c: ['It leads the eye to the cabin', 'It hides the cabin', 'It has no effect'], s: ['Lines carry the eye along them.', 'A road that ends at the cabin leads the eye there.'], h: 'Where does the road go?' }
    ]);
  });

  var BAL = { 'balance-sym': 'Symmetrical', 'balance-asym': 'Asymmetrical', 'balance-radial': 'Radial' };
  G('draw.balance', function (R, ctx) {
    var L = ctx.level || 1, keys = ['balance-sym', 'balance-asym', 'balance-radial'];
    if (L === 1 && R.chance(0.4)) return pickMc(R, [
      { q: 'A butterfly\'s two wings mirror each other. What kind of balance is that?', c: ['Symmetrical', 'Asymmetrical', 'Radial'], s: ['The left half mirrors the right half.', 'That is symmetrical balance.'], h: 'Mirror halves.' },
      { q: 'A sliced orange has segments spreading out from the center. What kind of balance is that?', c: ['Radial', 'Symmetrical', 'Asymmetrical'], s: ['Parts spread from a center.', 'That is radial balance.'], h: 'Think of a wheel.' },
      { q: 'What does symmetrical balance feel like?', c: ['Calm and formal', 'Wild and unsteady', 'Like it is tipping over'], s: ['Mirrored halves feel settled and orderly.'], h: 'Think of a formal building front.' }
    ]);
    if (L === 1) {
      var k = R.pick(keys);
      return q('What kind of balance does this design use?', { name: 'ar-design', opts: { kinds: [k], quiet: true, interactive: false } }, { t: 'mc', choices: keys.map(function (x) { return BAL[x]; }), v: keys.indexOf(k), keep: true },
        [k === 'balance-sym' ? 'The two halves mirror each other.' : k === 'balance-asym' ? 'The two sides are different but still feel even.' : 'The shapes spread out from a center.', 'That is ' + BAL[k].toLowerCase() + ' balance.'], 'Do the halves mirror, differ, or spread from a center?');
    }
    if (L === 2) {
      var order = R.shuffle(keys.slice()), want = R.pick(keys);
      if (R.chance(0.25)) { var k2 = R.pick(keys), opts2 = keys.map(function (x) { return BAL[x]; });
        return q('NAME made this design. Which kind of balance did NAME use?'.replace(/NAME/g, who(R)), { name: 'ar-design', opts: { kinds: [k2], quiet: true, interactive: false } }, { t: 'mc', choices: opts2, v: keys.indexOf(k2), keep: true },
          [k2 === 'balance-sym' ? 'The halves mirror each other: symmetrical.' : k2 === 'balance-asym' ? 'Different things on each side still feel even: asymmetrical.' : 'Shapes spread from a center: radial.'], 'Mirror, uneven, or from a center?'); }
      return q('Which design shows ' + BAL[want].toLowerCase() + ' balance?', { name: 'ar-design', opts: { kinds: order, quiet: true, interactive: false, columns: 3 } }, lettered(3, order.indexOf(want)),
        order.map(function (x, i) { return letter(i) + ': ' + BAL[x].toLowerCase() + '.'; }), want === 'balance-asym' ? 'Look for different things on each side that still feel even.' : want === 'balance-sym' ? 'Look for mirrored halves.' : 'Look for shapes spreading from a center.');
    }
    return pickMc(R, [
      { q: 'A big, pale shape on the left is balanced by a small, dark shape near the right edge. What kind of balance is this?', c: ['Asymmetrical', 'Symmetrical', 'Radial'], s: ['The two sides hold different things.', 'They still feel even, so this is asymmetrical balance.'], h: 'Are the sides the same?' },
      { q: 'A round stained-glass window has shapes spreading out from its center like spokes. What kind of balance is this?', c: ['Radial', 'Symmetrical', 'Asymmetrical'], s: ['Shapes spread out evenly from a center.', 'That is radial balance.'], h: 'Think of a wheel.' },
      { q: 'A building\'s front has the door in the middle and matching windows on both sides. What kind of balance is this?', c: ['Symmetrical', 'Asymmetrical', 'Radial'], s: ['The left half mirrors the right half.', 'That is symmetrical balance.'], h: 'Do the halves mirror each other?' },
      { q: 'NAME says, "A picture is balanced only when both halves match." Is NAME right?', c: ['No: unequal things can balance, like a small dark shape against a large light one', 'Yes: balance means matching halves', 'Yes, unless the picture is round'], s: ['Matching halves are one kind of balance: symmetry.', 'Asymmetrical balance evens out unlike things.'], h: 'Think of a seesaw with a big and a small child.' },
      { q: 'Which shape usually has the most visual weight?', c: ['A large, dark, busy shape', 'A small, pale, plain shape', 'A thin light-gray line'], s: ['Big, dark, busy or bright shapes look heavy.', 'Small, light, plain ones look light.'], h: 'What catches the eye most?' },
      { q: 'NAME\'s landscape has a big dark mountain on the left and empty sky on the right. What could balance it?', c: ['A small but strong shape on the right, like a dark bird or a bright sun', 'Another big dark mountain right next to the first', 'Erasing the mountain'], s: ['A small, strong shape farther from the center can balance a big one.', 'That is asymmetrical balance.'], h: 'Think of the seesaw.' },
      { q: 'Which kind of balance usually feels the most lively?', c: ['Asymmetrical', 'Symmetrical', 'There is no difference'], s: ['Unequal parts that still feel even make the eye move.', 'Symmetry feels calm and formal.'], h: 'Which one has uneven parts?' },
      { q: 'A seesaw balances a small child sitting far out against a bigger child near the middle. Which kind of picture balance is this like?', c: ['Asymmetrical', 'Symmetrical', 'Radial'], s: ['Different weights at different distances still balance.', 'In pictures, that is asymmetrical balance.'], h: 'Are the two sides the same?' }
    ]);
  });

  var LINES = ['road', 'river', 'fence'];
  G('draw.leading-lines', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1 || (L === 3 && R.coin())) {
      var n = L === 1 ? 2 : 3, outIdx = R.int(0, n - 1), askOut = L === 3, items = [];
      for (var i = 0; i < n; i++) items.push({ line: R.pick(LINES), to: (askOut ? i === outIdx : i !== outIdx) ? 'edge' : 'subject', sx: R.pick([0.62, 0.66, 0.7]) });
      if (!askOut) { items.forEach(function (it, i) { it.to = i === outIdx ? 'subject' : 'edge'; }); }
      var right = outIdx;
      return q(askOut ? 'In which picture does the line lead the eye out of the picture instead of to the house?' : 'In which picture does the line lead the eye to the house?', { name: 'draw-lead', opts: { items: items, quiet: true, interactive: false } }, lettered(n, right),
        items.map(function (it, i) { return letter(i) + ': the ' + it.line + (it.to === 'edge' ? ' runs off the edge.' : ' leads to the house.'); }), 'Follow each line with your finger. Where does it end?');
    }
    return pickMc(R, [
      { q: 'Which of these is an implied line (one the eye follows even though it is not drawn as a line)?', c: ['The direction a person is looking', 'A painted stripe down a road', 'The edge of a table'], s: ['A road stripe and a table edge are real lines.', 'A gaze is not drawn, but the eye follows it: an implied line.'], h: 'Which one is not drawn?' },
      { q: 'NAME\'s road runs straight off the right edge of the picture. What does it do to the viewer\'s eye?', c: ['Carries it out of the picture', 'Leads it to the focal point', 'Has no effect'], s: ['The eye follows a strong line.', 'If the line leaves the picture, the eye goes with it.'], h: 'Follow the road.' },
      { q: 'How can NAME fix a river that runs out of the side of the picture?', c: ['Curve it back toward the subject, or stop it with a tree or bend', 'Make it straighter', 'Make it darker'], s: ['A leading line should carry the eye into the picture.', 'Bend it toward the focal point or block its exit.'], h: 'Where should the line take the eye?' },
      { q: 'Where is the best place for a leading line to end?', c: ['At or near the focal point', 'At the edge of the paper', 'In an empty corner'], s: ['Leading lines guide the eye.', 'Ending at the focal point takes the viewer where you want.'], h: 'Where do you want the viewer to look?' }
    ]);
  });

  var RATIOS = [[12, 9], [16, 12], [20, 15], [24, 18], [30, 20], [18, 12], [15, 10], [14, 10], [20, 16]];
  G('draw.thumbnails', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) return pickMc(R, [
      { q: 'What is a thumbnail sketch?', c: ['A tiny, quick sketch to try out an arrangement', 'A detailed final drawing', 'A drawing of a thumb'], s: ['Thumbnails are small and fast.', 'They test composition before the real drawing.'], h: 'Think small and quick.' },
      { q: 'Why make three thumbnails before a big drawing?', c: ['To find composition problems early, when they are easy to fix', 'To practice small details', 'To use up scrap paper'], s: ['Fixing a thumbnail takes a minute; fixing a finished drawing can mean starting over.'], h: 'When is a problem cheapest to fix?' },
      { q: 'What is a viewfinder?', c: ['A card with a rectangle cut out, the same shape as your paper', 'A magnifying glass', 'A ruler for perspective lines'], s: ['You look through the opening to frame a scene.', 'It helps you choose the view and the crop.'], h: 'You look through it.' },
      { q: 'What should a thumbnail show?', c: ['Big shapes and the light and dark pattern', 'Every small detail', 'Only outlines of the main object'], s: ['A thumbnail is about composition.', 'Big shapes and values show balance and the focal point.'], h: 'Skip the details.' },
      { q: 'NAME holds a viewfinder farther from the eye. What happens to the view?', c: ['It crops in tighter, showing less of the scene', 'It shows more of the scene', 'Nothing changes'], s: ['Farther from the eye, the opening covers a smaller part of the view.', 'So the crop gets tighter.'], h: 'Try it with a paper tube.' }
    ]);
    if (L === 2 || R.coin()) {
      var r = R.pick(RATIOS), W = r[0], H = r[1], ws = [], i;
      for (i = 2; i <= 8; i++) if (Math.abs(i * H / W * 2 - Math.round(i * H / W * 2)) < 1e-9 && i !== W) ws.push(i);
      var w = R.pick(ws.length ? ws : [W / 2]), hh = fix(w * H / W), askH = R.coin();
      return q('Your paper is ' + W + ' inches wide and ' + H + ' inches tall. You cut a viewfinder opening ' + (askH ? w + ' inches wide. How tall should it be?' : hh + ' inches tall. How wide should it be?'), null, num(askH ? hh : w),
        ['The opening must have the same shape as the paper: the same ratio of width to height.', 'Height ÷ width for the paper: ' + H + ' ÷ ' + W + '.', askH ? w + ' × ' + H + ' ÷ ' + W + ' = ' + hh + ' inches.' : hh + ' × ' + W + ' ÷ ' + H + ' = ' + w + ' inches.'],
        'Keep the same ratio as the paper.', { unit: 'inches' });
    }
    var hs = R.shuffle([0.5, 1 / 3, 2 / 3]), ask = R.pick(['middle', 'lowthird', 'highthird']), target = ask === 'middle' ? 0.5 : ask === 'lowthird' ? 2 / 3 : 1 / 3;
    var thumbs = hs.map(function (hy) { return { sx: R.pick([0.33, 0.66]), sy: fix(hy + 0.08), hy: fix(hy), subject: R.pick(['tree', 'house', 'rock']) }; });
    var label = { middle: 'puts the horizon exactly in the middle', lowthird: 'puts the horizon on the lower third line, giving two thirds to the sky', highthird: 'puts the horizon on the upper third line, giving two thirds to the land' };
    return q('Which thumbnail ' + label[ask] + '?', { name: 'ar-compose', opts: { mode: 'thumbs', thumbs: thumbs, quiet: true, interactive: false } }, lettered(3, hs.indexOf(target)),
      hs.map(function (hy, i) { return letter(i) + ': horizon ' + (hy === 0.5 ? 'in the middle' : hy > 0.5 ? 'low (lower third line)' : 'high (upper third line)') + '.'; }), 'Find where the sky meets the land in each.');
  });

  // ================================================================ UNIT 9: STILL LIFE, TEXTURE AND CLOTH
  var STILL_FLAW = { row: 'The objects stand in a row, evenly spaced, with no overlap', same: 'All the objects are the same height', top: 'The light comes from straight above, so the forms look flat' };
  G('draw.still-life', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var bad = R.pick(['row', 'same', 'top']), list = R.shuffle(['good', bad]);
      return q('Which setup is better for a still-life drawing?', { name: 'draw-still', opts: { setups: list, quiet: true, interactive: false, light: R.pick(['left', 'right']) } }, lettered(2, list.indexOf('good')),
        ['A good setup groups the objects, overlaps some, varies their heights and lights them from one side.', 'Setup ' + letter(list.indexOf('good')) + ' does that. In the other one: ' + STILL_FLAW[bad].toLowerCase() + '.'], 'Look at grouping, heights and where the light comes from.');
    }
    if (L === 2) {
      var flaw = R.pick(['row', 'same', 'top']), keys = ['row', 'same', 'top'];
      return q('This setup has one main problem. What is it?', { name: 'draw-still', opts: { setup: flaw, quiet: true, interactive: false, light: R.pick(['left', 'right']) } }, { t: 'mc', choices: keys.map(function (k) { return STILL_FLAW[k]; }), v: keys.indexOf(flaw) },
        ['Check the grouping, the heights and the light.', STILL_FLAW[flaw] + '.'], 'Where is the lamp? Are the heights different? Do any objects overlap?');
    }
    return pickMc(R, [
      { q: 'Why light a still life from one side rather than from straight above?', c: ['Each form gets a clear light side, shadow side and cast shadow', 'It makes the objects look smaller', 'It hides the shadows'], s: ['Side light shows how each form turns.', 'Light from straight above flattens forms and hides their shadows.'], h: 'What makes a form look round?' },
      { q: 'NAME sets an apple, a mug and a bottle in a straight row, evenly spaced. Which change helps most?', c: ['Group them so some overlap and stand at different depths', 'Space them even more evenly', 'Line them up by height'], s: ['A row looks like a store shelf and comes out flat.', 'Grouping and overlap add depth and a more interesting shape.'], h: 'Think of depth cues.' },
      { q: 'Which group of objects makes the most interesting still life?', c: ['A tall bottle, a medium mug and a small lemon', 'Three identical cans', 'Four plates of the same size'], s: ['Different heights and sizes make a more interesting shape for the group.', 'Identical objects look like a pattern, not a composition.'], h: 'Look for variety in size.' },
      { q: 'What can NAME do before drawing to test a still-life arrangement?', c: ['Make one or two quick thumbnails', 'Start shading the first object', 'Trace the objects'], s: ['Thumbnails show composition problems in a minute.', 'Fix the setup, then draw.'], h: 'Remember the last unit.' }
    ]);
  });

  G('draw.texture', function (R, ctx) {
    var L = ctx.level || 1, Ak = A(), keys = Object.keys(Ak.TEXTURES);
    if (L === 1) {
      var k = R.pick(keys), others = R.sample(keys.filter(function (x) { return x !== k; }), 2), ch = R.shuffle([k].concat(others));
      return q('Which texture do these marks show?', { name: 'ar-marks', opts: { kinds: [k], quiet: true, interactive: false, seed: R.int(1, 99) } }, { t: 'mc', choices: ch.map(function (x) { return cap(Ak.TEXTURES[x].name); }), v: ch.indexOf(k), keep: true },
        ['The marks are ' + Ak.TEXTURES[k].mark + '.', 'Those marks draw ' + Ak.TEXTURES[k].name + '.'], 'Look at the shape and direction of the marks.');
    }
    if (L === 2) {
      var k2 = R.pick(keys), wr = R.sample(keys.filter(function (x) { return x !== k2; }), 2);
      return q('Which marks would you use to draw ' + Ak.TEXTURES[k2].name + '?', null, { t: 'mc', choices: [cap(Ak.TEXTURES[k2].mark)].concat(wr.map(function (x) { return cap(Ak.TEXTURES[x].mark); })), v: 0 },
        ['Match the mark to the surface.', cap(Ak.TEXTURES[k2].name) + ': ' + Ak.TEXTURES[k2].mark + '.'], 'Picture the surface up close.');
    }
    return pickMc(R, [
      { q: 'Light comes from the left across a rough stone wall. Where should NAME show the texture most strongly?', c: ['Where the light grazes the surface, near the edge of the shadow', 'Evenly over the whole wall', 'Only in the deepest shadow'], s: ['Grazing light gives each bump a lit side and a tiny shadow.', 'Texture shows most there and fades in full light and deep shadow.'], h: 'Where do the bumps cast tiny shadows?' },
      { q: 'NAME drew fur evenly over every part of a cat, like wallpaper. What is the problem?', c: ['The cat looks flat and busy; texture should fade in the light, the shadow and the distance', 'There is not enough texture', 'The fur strokes are too short'], s: ['Even texture everywhere flattens the form.', 'Show it most where light grazes the form and in front.'], h: 'Where should texture fade?' },
      { q: 'A brick wall runs far into the distance. How should the bricks change as they go back?', c: ['Less texture and detail, until they become a simple tone', 'More detail on the far bricks', 'Exactly the same detail all the way'], s: ['Far away, small details are too small to see.', 'Let the texture fade as the wall recedes.'], h: 'Can you see far-off bricks clearly?' },
      { q: 'In a drawing, texture comes from which two things?', c: ['The kind of mark and the pattern of light and dark', 'The paper size and the frame', 'Only the outline'], s: ['Different marks suggest different surfaces.', 'The light and dark pattern shows the bumps and dips.'], h: 'Marks and values.' }
    ]);
  });

  G('draw.shiny-glass', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1 && R.chance(0.4)) return pickMc(R, [
      { q: 'Which of these is usually shiny?', c: ['A metal spoon', 'A cotton towel', 'A clay flowerpot'], s: ['Polished metal reflects light like a mirror.', 'Cotton and unglazed clay are matte.'], h: 'Which one can you see your face in?' },
      { q: 'Which of these is usually matte (dull)?', c: ['A wool sweater', 'A glass marble', 'A chrome faucet'], s: ['Wool scatters light in every direction.', 'Glass and chrome are shiny.'], h: 'Which one has no sharp reflections?' },
      { q: 'What do you mostly see when you look at a clear glass?', c: ['Whatever is behind it', 'A gray shape', 'A thick black outline'], s: ['Clear glass lets light through.', 'So you mostly see what is behind it.'], h: 'It is see-through.' }
    ]);
    if (L === 1) {
      var list = R.shuffle(['matte', 'shiny']), want = R.pick(['shiny', 'matte']);
      return q(want === 'shiny' ? 'Which ball is shiny?' : 'Which ball is matte (dull)?', { name: 'draw-surface', opts: { kinds: list, quiet: true, interactive: false, color: R.pick(['#b83a3a', '#3a6fb8', '#3a9a5a', '#c08a2a', '#8a4ab8']) } }, lettered(2, list.indexOf(want)),
        ['A shiny ball has a small, sharp, very bright highlight, strong contrast and crisp reflections.', 'A matte ball turns softly from light to shadow.', 'So the ' + want + ' ball is ' + letter(list.indexOf(want)) + '.'], 'Look at the highlight: sharp or soft?');
    }
    if (L === 2) {
      if (R.coin()) { var g = R.shuffle(['glass', 'glassgray']); return q('Which glass is drawn the way glass really looks?', { name: 'draw-surface', opts: { kinds: g, quiet: true, interactive: false } }, lettered(2, g.indexOf('glass')),
        ['Glass is mostly what is behind it.', 'The good drawing shows the stripes through the glass, shifted, with a few bright and dark edges.', 'The other is outlined and filled with flat gray: the common mistake.'], 'Can you see the stripes through it?'); }
      return pickMc(R, [
        { q: 'What do highlights on a shiny object look like?', c: ['Small, sharp and very bright', 'Wide, soft and pale', 'There are no highlights on shiny things'], s: ['A shiny surface reflects light in one direction, like a mirror.', 'So its highlight is a crisp, bright image of the light.'], h: 'Think of a mirror.' },
        { q: 'NAME outlines a drinking glass in black and fills it with gray. What is wrong?', c: ['Glass is mostly what is behind it; draw that, the edge darks and the highlights', 'The outline should be thicker', 'The gray should be darker'], s: ['A clear glass is not gray.', 'Draw what you see through it and on it.'], h: 'What do you see when you look at a glass?' },
        { q: 'What appears on a shiny apple besides its color and shadow?', c: ['A small, sharp reflection of the window or lamp', 'A thick outline', 'Hatching lines'], s: ['A shiny surface acts a little like a mirror.', 'It shows a crisp image of the light source.'], h: 'Think of a mirror.' },
        { q: 'Where do the darkest edges of a clear glass usually appear?', c: ['Along its sides, where the glass curves away from you', 'In the middle of the glass', 'Nowhere; glass has no darks'], s: ['At the sides you look through more glass at a slant.', 'Those edges often look darker.'], h: 'Look at the sides of a glass.' }
      ]);
    }
    return pickMc(R, [
      { q: 'A pencil stands in a glass of water. How does the part behind the glass look?', c: ['Shifted or bent where it is seen through the glass and water', 'Exactly the same as the part above', 'Invisible'], s: ['Curved glass and water bend light.', 'So things seen through them look shifted, bent or enlarged.'], h: 'Look at a spoon in a glass.' },
      { q: 'How do you keep the brightest highlights on shiny metal in a pencil drawing?', c: ['Leave that paper white from the start, or lift it with a kneaded eraser', 'Draw them with a white pencil over dark graphite', 'Draw a dark circle around them'], s: ['Paper white is your brightest value.', 'Plan the highlights and keep them clean, or lift them out at the end.'], h: 'What is the whitest thing you have?' },
      { q: 'Why does a shiny teapot show reflections of the window while a clay pot does not?', c: ['A shiny surface reflects light mostly in one direction, like a mirror', 'Clay is darker', 'The window is closer to the teapot'], s: ['A matte surface scatters light in every direction.', 'A shiny one reflects it mostly in one direction, so it shows crisp images.'], h: 'Mirror or chalk?' },
      { q: 'Compared with a matte object, a shiny object usually shows…', c: ['Stronger contrast and crisper edges between light and dark', 'Softer, lower contrast', 'No shadows at all'], s: ['Shiny surfaces show bright highlights next to dark reflections.', 'That gives strong contrast and crisp edges.'], h: 'Think of a chrome bumper.' },
      { q: 'NAME moves a lamp around a shiny ball. What happens to its highlight?', c: ['It moves, because it is a reflection of the lamp', 'It stays in the same spot', 'It disappears'], s: ['The highlight on a shiny surface reflects the light source.', 'Move the light and the highlight moves with it.'], h: 'What is the highlight a reflection of?' },
      { q: 'Why does a straw in a glass of water look broken at the water line?', c: ['Water and curved glass bend light', 'The straw is really broken', 'The water is darker'], s: ['Light bends as it passes from water and glass into air.', 'So the straw seems shifted at the water line.'], h: 'Light changes direction.' }
    ]);
  });

  G('draw.folds', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var list = R.shuffle(['one', 'random']);
      return q('Which cloth\'s folds are drawn the way hanging cloth really behaves?', { name: 'draw-cloth', opts: { kinds: list, pin: R.pick([0.4, 0.5, 0.6]), quiet: true, interactive: false, colorShift: R.int(0, 3), seed: R.int(1, 50) } }, lettered(2, list.indexOf('one')),
        ['Folds start at a point of support and spread away from it.', 'In ' + letter(list.indexOf('one')) + ' every fold comes from the pin. In ' + letter(list.indexOf('random')) + ' the lines go nowhere.'], 'Where do the folds start?');
    }
    if (L === 2) {
      if (R.coin()) { var ks = R.shuffle(['one', 'two', 'random']), want = R.pick(['one', 'two']);
        return q('Which picture shows cloth hanging from ' + (want === 'two' ? 'two pins' : 'one pin') + '?', { name: 'draw-cloth', opts: { kinds: ks, quiet: true, interactive: false, colorShift: R.int(0, 3), seed: R.int(1, 50) } }, lettered(3, ks.indexOf(want)),
          ks.map(function (k, i) { return letter(i) + ': ' + (k === 'one' ? 'folds fan out from one pin.' : k === 'two' ? 'U-shaped folds sag between two pins.' : 'random lines, no supports.'); }), 'Count the points the folds come from.'); }
      return pickMc(R, [
        { q: 'Where do the folds in hanging cloth start?', c: ['At the points of support, like pins, hooks or shoulders', 'Anywhere on the cloth', 'At the bottom edge'], s: ['Gravity pulls the cloth down; only the supports hold it up.', 'So folds start at the supports and run away from them.'], h: 'What holds the cloth up?' },
        { q: 'A curtain hangs from two hooks. What do the folds do between the hooks?', c: ['Sag in U-shaped curves', 'Run straight up and down', 'Cross in an X'], s: ['Between two supports the cloth hangs down in the middle.', 'That makes U-shaped folds.'], h: 'Think of a hammock.' }
      ]);
    }
    return pickMc(R, [
      { q: 'How should NAME shade each fold?', c: ['Like a small cylinder: light side, core shadow, shadow side', 'With one flat gray', 'With a dark outline only'], s: ['Each fold is a rounded ridge.', 'Shade it like a cylinder turning from light to shadow.'], h: 'What form is a fold like?' },
      { q: 'A sleeve bends at the elbow. Where do the folds gather?', c: ['On the inside of the bend', 'On the outside of the elbow', 'Evenly all along the sleeve'], s: ['The inside of the bend gets squeezed, so the cloth bunches up.', 'The outside pulls smooth over the elbow.'], h: 'Bend your own arm in a sweater.' },
      { q: 'NAME drew folds as random lines all over a towel. What question would fix it?', c: ['"Where is the towel held up, and where does each fold come from?"', '"Are there enough lines?"', '"Are the lines dark enough?"'], s: ['Random lines make cloth look crumpled.', 'Each main fold should start at a support or a bend.'], h: 'Find the supports.' },
      { q: 'A napkin is pinned up by one corner. What pattern do its folds make?', c: ['A fan spreading down from the pin', 'Straight horizontal stripes', 'Circles around the middle'], s: ['All the weight hangs from one point.', 'The folds radiate down from it like a fan.'], h: 'Where is the support?' }
    ]);
  });

  // ================================================================ UNIT 10: FACES
  G('draw.head-proportions', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var good = R.pick(['A', 'B']);
      return q(R.pick(['Which face has the eyes in about the right place?', 'In which face do the eyes sit about halfway down the head?']), { name: 'ar-face', opts: { mode: 'compare', good: good, quiet: true, interactive: false, age: R.pick(['adult', 'older', 'kid']), hair: R.pick(['#5b3a1e', '#1d1714', '#c4542b', '#d9b25c', '#9a9a9a']), glasses: R.chance(0.3) } }, lettered(2, good === 'A' ? 0 : 1),
        ['On an adult head, the eyes sit about halfway between the top of the head and the chin.', 'In ' + good + ' they are near the middle; in the other face they are too high, leaving almost no forehead.'], 'Find the halfway point of the whole head.');
    }
    if (L === 2) {
      var form = R.pick(['eyes', 'nose', 'eyew', 'mouth']);
      if (form === 'eyew') { var Wd = R.pick([10, 12.5, 15, 17.5, 20]), ew = fix(Wd / 5);
        return q('A head is drawn ' + Wd + ' cm wide at the eye line. Using "five eye-widths across," about how wide is each eye?', null, num(ew), ['The head is about five eye-widths wide.', Wd + ' ÷ 5 = ' + ew + ' cm.'], 'Divide the width into five equal parts.', { unit: 'cm' }); }
      var Hd = form === 'mouth' ? R.pick([12, 24, 36]) : R.pick([16, 18, 20, 22, 24, 26, 28, 30]);
      var eyes = Hd / 2, nose = fix(Hd * 3 / 4), mouth = fix(nose + (Hd - nose) / 3), ans = form === 'eyes' ? eyes : form === 'nose' ? nose : mouth;
      return q('A head is drawn ' + Hd + ' cm tall, from the top of the skull to the chin. About how far down from the top should ' + (form === 'eyes' ? 'the eyes go' : form === 'nose' ? 'the bottom of the nose go' : 'the mouth line go') + '?', null, num(ans),
        ['Eyes: halfway down: ' + Hd + ' ÷ 2 = ' + eyes + ' cm.'].concat(form === 'eyes' ? [] : ['Nose: halfway from the eyes to the chin: (' + eyes + ' + ' + Hd + ') ÷ 2 = ' + nose + ' cm.']).concat(form === 'mouth' ? ['Mouth: one third of the way from the nose to the chin: ' + nose + ' + (' + Hd + ' − ' + nose + ') ÷ 3 = ' + mouth + ' cm.'] : []),
        form === 'eyes' ? 'The eyes are about halfway.' : 'Find the eyes first: halfway down.', { unit: 'cm' });
    }
    if (R.coin()) { var e = R.pick([7, 8, 9, 10, 11, 12, 13, 14]); return q('On a front-view head, the eyes are drawn ' + e + ' cm below the top of the skull. About how tall should the whole head be, from the top of the skull to the chin?', null, num(2 * e),
      ['The eyes sit about halfway down the head.', 'So the whole head is about twice that: 2 × ' + e + ' = ' + (2 * e) + ' cm.'], 'The eyes are at the halfway point.', { unit: 'cm' }); }
    return pickMc(R, [
      { q: 'NAME\'s portrait has a tiny forehead and looks like a mask on the front of the head. What is the likely mistake?', c: ['The eyes are placed too high', 'The eyes are too far apart', 'The mouth is too wide'], s: ['People usually put the eyes too high.', 'Measure from the top of the skull: the eyes belong near the middle.'], h: 'Where are the eyes?' },
      { q: 'Where do the ears sit on a front-view head?', c: ['From about the brow line to the bottom of the nose', 'From the top of the head to the eyes', 'From the mouth to the chin'], s: ['The ears line up with the middle part of the face.', 'Top near the brows, bottom near the bottom of the nose.'], h: 'Feel your own ears.' },
      { q: 'How much space is between the two eyes on an average face?', c: ['About one eye-width', 'About two eye-widths', 'Almost none'], s: ['The head is about five eye-widths across.', 'One of those five is the space between the eyes.'], h: 'Five eye-widths across the head.' },
      { q: 'Why measure from the top of the skull and not the hairline?', c: ['Hair hides how tall the skull is; the halfway point is for the whole head', 'The hairline is always at the halfway point', 'Because the hairline is easier to find'], s: ['The skull goes up well above the hairline.', 'The eyes are halfway between the top of the skull and the chin.'], h: 'What does hair hide?' }
    ]);
  });

  G('draw.eyes', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1 && R.chance(0.4)) return pickMc(R, [
      { q: 'What form is an eyeball?', c: ['A ball (a sphere)', 'A flat almond', 'A cube'], s: ['The eye is a ball in a socket.', 'The lids wrap around it.'], h: 'Think of a marble.' },
      { q: 'What does the upper lid cast on the eyeball?', c: ['A small shadow', 'A bright highlight', 'Nothing'], s: ['The upper lid sticks out over the ball.', 'So it casts a small shadow just under it.'], h: 'What does a roof edge cast?' },
      { q: 'What is the colored part of the eye called?', c: ['The iris', 'The pupil', 'The lid'], s: ['The iris is the colored ring.', 'The pupil is the dark center.'], h: 'It is the ring around the pupil.' }
    ]);
    if (L === 1) { var good = R.pick(['A', 'B']);
      return q('Which eye looks calm and natural?', { name: 'ar-face', opts: { mode: 'eye', good: good, quiet: true, interactive: false } }, lettered(2, good === 'A' ? 0 : 1),
        ['In a calm eye, the upper lid covers the top of the iris.', 'In ' + good + ' the lid covers part of the iris; in the other, the whole iris floats in the white, which looks startled.'], 'Is the whole iris showing?'); }
    if (L === 2) return pickMc(R, [
      { q: 'In a calm, relaxed eye, what does the upper lid do?', c: ['Covers the top part of the iris', 'Stays well above the iris, showing white all around', 'Covers the whole pupil'], s: ['The lid rests on the eyeball.', 'In a calm eye it covers the top of the iris.'], h: 'Look at a friend\'s eyes.' },
      { q: 'Why is the white of the eye usually shaded a little?', c: ['The eyeball is a ball, so it turns away from the light and the lid shades it', 'Eyes are gray', 'To make the iris smaller'], s: ['An eyeball is a sphere.', 'Like any sphere it has light and shadow, and the upper lid casts a shadow on it.'], h: 'What form is an eyeball?' },
      { q: 'Which eyelid usually gets the darker, thicker line?', c: ['The upper lid', 'The lower lid', 'Both exactly the same'], s: ['The upper lid is thicker, has the lashes and casts a shadow.', 'So its line is darker.'], h: 'Which lid casts a shadow?' }
    ]);
    return pickMc(R, [
      { q: 'NAME draws eyes with white showing all around the irises. How does the face look?', c: ['Startled or scared', 'Calm and relaxed', 'Sleepy'], s: ['White all around the iris shows only when the eyes open very wide.', 'So the face reads as startled.'], h: 'When do eyes open that wide?' },
      { q: 'How should NAME suggest eyelashes?', c: ['With a dark upper lid line and a few flicks at the outer corner', 'By drawing every lash as a separate line', 'With lashes sticking straight up all around'], s: ['Lashes grow in clumps and point outward along the lid.', 'Suggest them rather than drawing each one.'], h: 'Less is more.' },
      { q: 'What is the best way to think of an eye before drawing it?', c: ['A ball in a socket with the lids wrapped around it', 'A flat almond with a circle inside', 'Two curved lines meeting at points'], s: ['The lids follow the curve of the eyeball.', 'Thinking of a ball makes the eye look round and real.'], h: 'What shape is under the lids?' },
      { q: 'Which order works well for drawing an eye?', c: ['Lids, then the iris under the lid, then the pupil and highlight, then shading', 'Lashes first, then the lids, then the iris', 'The pupil first, then everything around it'], s: ['Start with the big shape: the lids around the ball.', 'Then the iris, partly hidden, the pupil and highlight, and finally shading.'], h: 'Big shapes first.' }
    ]);
  });

  G('draw.nose-mouth', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) { var good = R.pick(['A', 'B']);
      return q('Which nose stands out from the face instead of looking flat and pasted on?', { name: 'draw-nose', opts: { good: good, quiet: true, interactive: false, hair: R.pick(['#5b3a1e', '#1d1714', '#c4542b', '#d9b25c', '#9a9a9a']), glasses: R.chance(0.35) } }, lettered(2, good === 'A' ? 0 : 1),
        ['A nose is shown by its planes and shadows: the shadow side, the shadow under the tip and the nostrils.', 'An outline all around makes it look flat.', 'So ' + good + '.'], 'Which one has an outline all around?'); }
    if (L === 2) {
      if (R.coin()) { var n = R.int(10, 30), gap = R.pick([3, 6, 9, 12]), c = n + gap, m = n + gap / 3;
        return q('On a head drawing, the bottom of the nose is ' + n + ' cm from the top of the head and the chin is at ' + c + ' cm. About where does the mouth line go?', null, num(m),
          ['The mouth is about one third of the way from the nose to the chin.', 'The gap is ' + c + ' − ' + n + ' = ' + gap + ' cm; one third is ' + (gap / 3) + ' cm.', n + ' + ' + (gap / 3) + ' = ' + m + ' cm from the top.'], 'Divide the nose-to-chin gap into three.', { unit: 'cm' }); }
      var e = R.int(6, 16), ch = 2 * e, ns = fix((e + ch) / 2);
      return q('A head is ' + ch + ' cm tall, with the eyes at ' + e + ' cm from the top. About how far from the top is the bottom of the nose?', null, num(ns),
        ['The bottom of the nose is about halfway from the eyes to the chin.', '(' + e + ' + ' + ch + ') ÷ 2 = ' + ns + ' cm.'], 'Halfway between the eyes and the chin.', { unit: 'cm' });
    }
    return pickMc(R, [
      { q: 'The corners of the mouth line up roughly below…', c: ['The pupils', 'The outer corners of the eyes', 'The nostrils'], s: ['On an average face, the mouth is about as wide as the space between the pupils.', 'So its corners line up roughly below the pupils.'], h: 'Look straight down from the eyes.' },
      { q: 'With light from above, which lip is usually darker?', c: ['The upper lip, because it faces down, away from the light', 'The lower lip', 'Both are always the same'], s: ['The upper lip slopes down and in.', 'Facing away from the light, it falls in shadow; the lower lip faces up and catches light.'], h: 'Which way does each lip face?' },
      { q: 'On an average face, the nostril wings are about as far apart as…', c: ['The inner corners of the eyes', 'The outer corners of the eyes', 'The ears'], s: ['A common guide: the width of the nose at the nostrils matches the space between the eyes.', 'That space is about one eye-width.'], h: 'Look at the space between the eyes.' },
      { q: 'NAME outlined the whole nose: both sides and the bottom. How can NAME fix it?', c: ['Keep the nostrils, the shadow under the tip and the shadow side; erase the rest of the outline', 'Make the outline darker', 'Add a second outline'], s: ['A real nose has no line around it.', 'Shadows and planes describe it; an outline flattens it.'], h: 'What do you really see on a nose?' }
    ]);
  });

  var VIEW_NAME = { front: 'front view', 'three-quarter': 'three-quarter view', profile: 'profile (side) view' };
  G('draw.head-turns', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) { var views = R.shuffle(['front', 'three-quarter', 'profile']), want = R.pick(views);
      return q('Which head is shown in ' + VIEW_NAME[want] + '?', { name: 'ar-face', opts: { mode: 'turn', views: views, quiet: true, interactive: false } }, lettered(3, views.indexOf(want)),
        views.map(function (v, i) { return letter(i) + ': ' + VIEW_NAME[v] + (v === 'front' ? ', both eyes the same width.' : v === 'profile' ? ', one eye, the nose sticking out.' : ', the far eye narrower.'); }), 'Count the eyes and compare their widths.'); }
    if (L === 2) return pickMc(R, [
      { q: 'A head turns partly to one side (three-quarter view). Which eye looks narrower?', c: ['The far eye', 'The near eye', 'Neither; both stay the same width'], s: ['The far eye turns away from you around the curve of the head.', 'Things turning away look narrower: the far eye.'], h: 'Which one is turning away?' },
      { q: 'In profile, where does the ear sit?', c: ['Just behind the middle of the head, from front to back', 'Right next to the cheek, near the front', 'At the very back of the head'], s: ['The skull behind the ear is large.', 'So the ear starts just behind the middle of the head.'], h: 'The head is deeper than people think.' },
      { q: 'When the head turns, what happens to the center line of the face?', c: ['It curves around the head', 'It stays a straight vertical line in the middle', 'It disappears'], s: ['The head is roughly a ball.', 'A line down the middle of a turning ball curves.'], h: 'Draw a line on a ball and turn it.' }
    ]);
    return pickMc(R, [
      { q: 'NAME drew a three-quarter view with both eyes the same width. What is wrong?', c: ['The far eye should look narrower', 'The near eye should be smaller', 'Both eyes should be on the center line'], s: ['In three-quarter view the far eye turns away.', 'It should look narrower and sit close to the center line.'], h: 'Which eye turns away?' },
      { q: 'NAME\'s profile drawing has the ear right behind the cheek and almost no back of the head. What is the fix?', c: ['Move the ear back to just behind the middle and give the skull more room', 'Make the ear bigger', 'Move the ear higher'], s: ['In profile the head is about as deep as it is tall.', 'The ear starts just behind the middle, with plenty of skull behind it.'], h: 'How deep is the head?' },
      { q: 'In profile view, how many eyes can you see?', c: ['One', 'Two, both full width', 'Two, one narrower'], s: ['From the side, the far eye is hidden behind the nose and face.', 'So you see one.'], h: 'Look at a face from the side.' },
      { q: 'Why does the far eye look narrower when the head turns?', c: ['It turns away around the curve of the head, so we see it at a slant', 'It is smaller than the other eye', 'Light makes it look smaller'], s: ['Things on a ball that turn away are seen at a slant.', 'Seen at a slant, they look narrower: foreshortening.'], h: 'Think of a sticker on a turning ball.' }
    ]);
  });

  var MOODS = ['happy', 'sad', 'surprised', 'angry', 'worried', 'sleepy'], MOOD_NAME = { happy: 'Happy', sad: 'Sad', surprised: 'Surprised', angry: 'Angry (cross)', worried: 'Worried', sleepy: 'Sleepy' };
  var MOOD_SAYS = { happy: 'the mouth curves up and the brows are relaxed', sad: 'the mouth curves down and the brows tilt up in the middle', surprised: 'the brows go up high and the mouth is a round O', angry: 'the brows slope down toward the nose and the mouth is a tight, flat line', worried: 'the brows tilt up in the middle and the mouth wobbles', sleepy: 'the eyes are closed and the brows relaxed' };
  G('draw.expressions', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) { var m = R.pick(MOODS), ch = R.shuffle([m].concat(R.sample(MOODS.filter(function (x) { return x !== m && !(m === 'sad' && x === 'worried') && !(m === 'worried' && x === 'sad'); }), 2)));
      return q('What feeling does this face show?', { name: 'ar-face', opts: { mood: m, quiet: true, interactive: false, age: R.pick(['kid', 'adult', 'older']), hair: R.pick(['#5b3a1e', '#1d1714', '#c4542b', '#9a9a9a']), glasses: R.chance(0.3) } }, { t: 'mc', choices: ch.map(function (x) { return MOOD_NAME[x]; }), v: ch.indexOf(m), keep: true },
        ['Look at the brows first, then the eyes and the mouth.', 'Here ' + MOOD_SAYS[m] + ': ' + MOOD_NAME[m].toLowerCase() + '.'], 'Start with the eyebrows.'); }
    if (L === 2) { var list = R.sample(MOODS, 3); if (list.indexOf('sad') >= 0 && list.indexOf('worried') >= 0) list[list.indexOf('worried')] = R.pick(['happy', 'surprised', 'angry', 'sleepy'].filter(function (x) { return list.indexOf(x) < 0; })); var want = R.pick(list);
      return q('Which face looks ' + MOOD_NAME[want].toLowerCase().replace(' (cross)', '') + '?', { name: 'ar-face', opts: { mode: 'moods', moods: list, quiet: true, interactive: false, age: R.pick(['kid', 'adult']) } }, lettered(3, list.indexOf(want)),
        list.map(function (x, i) { return letter(i) + ': ' + MOOD_SAYS[x] + '.'; }), 'Compare the eyebrows of the three faces.'); }
    return pickMc(R, [
      { q: 'A face has its brows pulled down and together, and the mouth pressed into a flat line. What does it show?', c: ['Anger', 'Surprise', 'Sleepiness'], s: ['Brows pulled down toward the nose make a frown.', 'With a tight, flat mouth, the face looks angry.'], h: 'What do the brows do?' },
      { q: 'A face has its brows raised high, the eyes wide open and the mouth open. What does it show?', c: ['Surprise', 'Sadness', 'Calm'], s: ['Raised brows open the eyes wide.', 'With an open mouth, that is surprise.'], h: 'Raised brows and wide eyes.' },
      { q: 'NAME draws a smiling mouth but leaves the brows tilted up in the middle, like worried brows. How does the face read?', c: ['Nervous or uneasy, not simply happy', 'Very happy', 'Angry'], s: ['The brows carry much of an expression.', 'A smile with worried brows looks nervous.'], h: 'Which part did NAME forget?' },
      { q: 'In a real smile, what happens to the eyes?', c: ['The cheeks lift and the eyes narrow a little', 'The eyes open wide', 'Nothing; only the mouth moves'], s: ['Smiling lifts the cheeks.', 'That pushes up the lower lids and narrows the eyes.'], h: 'Smile in a mirror.' },
      { q: 'Which features change together in an expression?', c: ['The eyebrows, the eyelids and the mouth', 'Only the mouth', 'Only the ears and nose'], s: ['Facial muscles are connected.', 'Brows, lids and mouth move together.'], h: 'Look beyond the mouth.' }
    ]);
  });

  // ================================================================ UNIT 11: HANDS AND FIGURES
  G('draw.hands', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) { var good = R.pick(['A', 'B']);
      return q('Which hand is built the right way?', { name: 'draw-hands', opts: { good: good, quiet: true, interactive: false, flip: R.coin(), cuff: R.pick(['#4a8fe0', '#e8574f', '#58b368', '#9a6ad6', '#f39a3d']) } }, lettered(2, good === 'A' ? 0 : 1),
        ['Fingers differ in length: the middle finger is longest and the little finger shortest.', 'The knuckles make a curve, and the thumb starts low on the side.', 'Hand ' + good + ' does this; the other has five equal sausages in a row.'], 'Are the fingers all the same length?'); }
    if (L === 2) {
      var T = R.int(10, 24), half = fix(T / 2), askP = R.coin();
      return q('A drawn hand measures ' + T + ' cm from the wrist crease to the tip of the middle finger. About how long is ' + (askP ? 'the palm' : 'the middle finger') + '?', null, num(half),
        ['The middle finger is about as long as the palm.', 'So the hand splits into two about equal parts: ' + T + ' ÷ 2 = ' + half + ' cm.'], 'Palm and middle finger are about equal.', { unit: 'cm' });
    }
    return pickMc(R, [
      { q: 'What shape should NAME draw first when starting a hand?', c: ['The mitten: palm and fingers together as one shape', 'Each finger separately, starting with the thumb', 'The fingernails'], s: ['Big shapes first.', 'The mitten gets the size and gesture right before you divide the fingers.'], h: 'Big shapes before details.' },
      { q: 'How do the knuckles at the base of the fingers line up?', c: ['On a curve', 'On a straight line', 'In a zigzag'], s: ['The finger bones fan out from the wrist.', 'So their knuckles form an arc.'], h: 'Make a fist and look.' },
      { q: 'Which finger is usually the longest?', c: ['The middle finger', 'The index finger', 'The little finger'], s: ['The fingers differ in length.', 'The middle finger reaches farthest.'], h: 'Hold your hand flat.' },
      { q: 'NAME\'s drawn hand looks like a bunch of bananas: five fingers the same length in a row. What should change?', c: ['Different finger lengths on a curved knuckle line, with the thumb set lower', 'Thicker fingers', 'Longer fingernails'], s: ['Equal fingers on a straight line look stiff.', 'Vary the lengths, curve the knuckle line and start the thumb lower.'], h: 'Compare with your own hand.' },
      { q: 'Where does the thumb join the hand?', c: ['Low on the side of the palm, near the wrist', 'In a row with the other fingers', 'In the middle of the palm'], s: ['The thumb is set apart from the fingers.', 'It joins low on the side, near the wrist.'], h: 'Look at the side of your hand.' }
    ]);
  });

  var FIG = { adult: 7.5, teen: 7, child: 6, young: 5, toddler: 4 }, FIG_NAME = { adult: 'an adult', teen: 'a teenager', child: 'a child of about six', young: 'a young child of about three', toddler: 'a toddler' };
  G('draw.figure-proportions', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var rest = R.shuffle(R.sample(['child', 'young', 'toddler'], 2)), list = ['adult'].concat(rest), want = R.pick(list);
      return q('These figures are measured in head heights (the tick marks). Which one is ' + FIG_NAME[want] + ', about ' + FIG[want] + ' heads tall?', { name: 'ar-proportion', opts: { mode: 'figures', figures: list, quiet: true, interactive: false } }, lettered(3, list.indexOf(want)),
        list.map(function (k, i) { return letter(i) + ': about ' + FIG[k] + ' heads tall.'; }), 'Count how many heads tall each figure is.');
    }
    if (L === 2) {
      var k = R.pick(['adult', 'child', 'young', 'toddler', 'teen']), head = k === 'adult' ? R.pick([2, 3, 4, 5, 6]) : R.pick([2, 3, 4, 5]), tot = fix(head * FIG[k]);
      if (R.coin()) return q('You draw ' + FIG_NAME[k] + ' whose head is ' + head + ' cm tall. Using the artists\' average, about how tall is the whole figure?', null, num(tot),
        [cap(FIG_NAME[k]) + ' is about ' + FIG[k] + ' heads tall.', head + ' × ' + FIG[k] + ' = ' + tot + ' cm.'], 'Multiply by the number of heads.', { unit: 'cm' });
      return q('You want to draw ' + FIG_NAME[k] + ' ' + tot + ' cm tall. Using the artists\' average, about how tall is the head?', null, num(head),
        [cap(FIG_NAME[k]) + ' is about ' + FIG[k] + ' heads tall.', tot + ' ÷ ' + FIG[k] + ' = ' + head + ' cm.'], 'Divide by the number of heads.', { unit: 'cm' });
    }
    return pickMc(R, [
      { q: 'NAME\'s drawing of a five-year-old looks like a tiny adult. What should change?', c: ['A bigger head for the body and shorter legs', 'A smaller head and longer legs', 'Only the clothes'], s: ['Young children are only about 5 or 6 heads tall.', 'Their heads are big for their size and their legs are short.'], h: 'How many heads tall is a child?' },
      { q: 'Where is the halfway point of an adult figure, measured from head to foot?', c: ['Near the hips', 'At the waist', 'At the knees'], s: ['An adult is about 7½ heads tall.', 'Half of that falls near the hips.'], h: 'It is lower than the waist.' },
      { q: 'With the arms hanging down, where do an adult\'s elbows come to?', c: ['About the waist', 'About the shoulders', 'About the knees'], s: ['The upper arm reaches from the shoulder down to about the waist.'], h: 'Stand and let your arms hang.' },
      { q: 'Why does a child measure fewer heads tall than an adult?', c: ['The head grows less than the body, especially the legs, as people grow', 'Children have smaller heads than adults in proportion', 'Adults have smaller heads than children'], s: ['A child\'s head is already large.', 'The legs and body grow much more later, so adults are more heads tall.'], h: 'What grows most as we grow up?' }
    ]);
  });

  var DYN = ['stand', 'lean', 'reach', 'wave', 'dance', 'throw'];
  G('draw.line-of-action', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) { var list = R.shuffle(['stiff', R.pick(DYN.slice(1))]);
      return q('Which figure has the stronger line of action, showing more movement?', { name: 'draw-pose', opts: { poses: list, quiet: true, interactive: false, outfit: R.int(0, 4) } }, lettered(2, 1 - list.indexOf('stiff')),
        ['A line of action is one curve through the whole pose.', 'One figure stands straight and stiff: its line is a vertical line with no movement.', 'The other bends and leans: ' + letter(1 - list.indexOf('stiff')) + '.'], 'Which figure is standing stiff and straight?'); }
    if (L === 2) return pickMc(R, [
      { q: 'Where does the line of action run?', c: ['From the head, through the body, to the foot that carries the weight', 'Along the outline of one arm', 'Across the shoulders'], s: ['The line of action is one curve through the whole pose.', 'It runs from the head down to the weight-bearing foot.'], h: 'It goes through the whole body.' },
      { q: 'When should NAME draw the line of action?', c: ['First, before the head, chest and hips', 'Last, after the details', 'Only if the pose looks wrong'], s: ['The line of action sets the movement.', 'Hang the head, chest and hips on it.'], h: 'It is the foundation.' },
      { q: 'What is a C-curve line of action?', c: ['One gentle curve bending one way through the pose', 'A line that bends one way, then the other', 'A straight vertical line'], s: ['A C bends one way.', 'An S bends one way, then the other.'], h: 'Look at the letter C.' },
      { q: 'What is an S-curve line of action?', c: ['A line that bends one way, then the other', 'One gentle curve bending one way', 'A circle around the figure'], s: ['An S curves one way, then back the other.', 'Twisting or throwing poses often follow it.'], h: 'Look at the letter S.' }
    ]);
    return pickMc(R, [
      { q: 'NAME\'s figure of someone reaching for a shelf looks stiff, like a stick figure at attention. What helps most?', c: ['Draw a long curve from the hand to the standing foot first, and exaggerate it a little', 'Add more details to the clothes', 'Make the figure taller'], s: ['A straight line has no movement.', 'One clear, slightly exaggerated curve brings the pose to life.'], h: 'Start with one curve.' },
      { q: 'For which pose is a straight vertical line of action right?', c: ['Standing at attention', 'Throwing a ball', 'Leaning on a wall'], s: ['A straight line shows no movement.', 'That fits only a stiff, upright pose.'], h: 'Which pose has no movement?' },
      { q: 'Why does a single curve capture a pose so well?', c: ['A moving body bends as a whole: the spine curves and the weight shifts', 'Because bodies have no straight bones', 'Because curves are easier to erase'], s: ['Leaning, reaching or twisting bends the whole body.', 'One curve shows that bend and where the weight goes.'], h: 'What does the spine do in a pose?' }
    ]);
  });

  var FORMS = { head: 'An egg', chest: 'A box', hips: 'A box', 'upper arm': 'A cylinder', forearm: 'A cylinder', thigh: 'A cylinder', 'lower leg': 'A cylinder', elbow: 'A ball', knee: 'A ball', shoulder: 'A ball', ankle: 'A ball', wrist: 'A ball' };
  G('draw.mannequin', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) { var part = R.pick(Object.keys(FORMS)), opts = ['An egg', 'A box', 'A cylinder', 'A ball'];
      return q('In a mannequin figure built from simple forms, what form do you use for the ' + part + '?', null, { t: 'mc', choices: opts, v: opts.indexOf(FORMS[part]), keep: true },
        ['Mannequin forms: an egg for the head, boxes for the chest and hips, cylinders for the limbs, balls at the joints.', 'The ' + part + ': ' + FORMS[part].toLowerCase() + '.'], part === 'elbow' || part === 'knee' ? 'Joints get round forms.' : 'Think of a jointed wooden mannequin.'); }
    if (L === 2) { var pose = R.pick(['wave', 'reach', 'lean', 'dance', 'throw']), wrong = R.int(0, 1);
      return q('Which figure bends only at its joints, the way a real body does?', { name: 'draw-pose', opts: { poses: [pose, pose], wrong: wrong, quiet: true, interactive: false, outfit: R.int(0, 4) } }, lettered(2, 1 - wrong),
        ['Bones do not bend; limbs bend only at the joints.', 'Figure ' + letter(wrong) + ' bends like a rubber hose, with no elbows or knees.', 'Figure ' + letter(1 - wrong) + ' bends at its joints.'], 'Look for elbows and knees.'); }
    return pickMc(R, [
      { q: 'Where can an arm bend?', c: ['At the shoulder, elbow and wrist', 'Anywhere along the forearm', 'Only at the shoulder'], s: ['The arm bones do not bend.', 'Bends happen at the joints: shoulder, elbow and wrist.'], h: 'Find your arm\'s joints.' },
      { q: 'Which of these is NOT a place where a leg can bend?', c: ['The middle of the shin', 'The knee', 'The hip'], s: ['Legs bend at the hip, knee and ankle.', 'The shin is a bone: it does not bend.'], h: 'Is there a joint there?' },
      { q: 'Why use boxes instead of flat outlines for the chest and hips?', c: ['Boxes show which way each part faces and turns in space', 'Boxes are faster to erase', 'Real chests are square'], s: ['A flat outline cannot show turning.', 'A box shows its front, side and top, so you see how it faces.'], h: 'What can a box show that a flat shape cannot?' },
      { q: 'NAME\'s figure has arms that curve like noodles. What is the fix?', c: ['Bend the arms only at the elbows and wrists, with straight parts between', 'Make the arms thicker', 'Make the arms longer'], s: ['Curving between joints looks boneless.', 'Keep the upper arm and forearm straight; bend at the joints.'], h: 'Where are the joints?' }
    ]);
  });

  var ORDER_OK = 'Line of action, mannequin forms, outer shape of the clothes, folds, then details';
  G('draw.clothed-figure', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) return pickMc(R, [
      { q: 'What should NAME draw first for a person in a coat?', c: ['The gesture and a light mannequin', 'The buttons and pockets', 'The folds of the coat'], s: ['Clothes take their shape from the body.', 'Start with the gesture and forms, then hang the clothes on them.'], h: 'What holds the clothes up?' },
      { q: 'Which order works best for drawing a clothed figure?', c: [ORDER_OK, 'Details, folds, outer shape of the clothes, then the body', 'Outer shape of the clothes, details, then the line of action'], s: ['Start with the movement and the body.', 'Then the clothes, their folds and finally details.'], h: 'Big and structural first.' },
      { q: 'Clothes hang on a body the way cloth hangs from…', c: ['Pins or hooks: the body is the support', 'Nothing: clothes keep their own shape', 'The ground'], s: ['Cloth needs supports.', 'On a person, the shoulders, elbows, waist and knees are the supports.'], h: 'Remember Folds in Cloth.' }
    ]);
    if (L === 2) {
      if (R.coin()) { var list = R.shuffle(['sleeve', 'random']);
        return q('Which picture shows how cloth behaves at a bent joint?', { name: 'draw-cloth', opts: { kinds: list, quiet: true, interactive: false, colorShift: R.int(0, 3), seed: R.int(1, 40) } }, lettered(2, list.indexOf('sleeve')),
          ['At a bent joint, the cloth bunches up in folds on the inside of the bend.', letter(list.indexOf('sleeve')) + ' shows a bent sleeve with folds gathered inside the elbow; the other has random lines.'], 'Look for a bend.'); }
      return pickMc(R, [
        { q: 'On a person, which places act as points of support for clothes?', c: ['Shoulders, elbows, waist and knees', 'The fingertips and toes', 'The middle of the forearm and shin'], s: ['Clothes rest on and pull from the body\'s main points and bends.', 'Folds start at the shoulders, elbows, waist and knees.'], h: 'Where do clothes hang from or bend?' },
        { q: 'How do loose clothes differ from tight ones in a drawing?', c: ['Loose clothes hang away in long folds; tight clothes follow the forms underneath', 'Loose clothes have no folds', 'Tight clothes have more folds than loose ones'], s: ['Loose cloth has room to hang.', 'Tight cloth wraps the body and shows its forms.'], h: 'Think of a raincoat and leggings.' },
        { q: 'A person sits with knees bent in long pants. Where do the folds gather?', c: ['Behind the knees and at the top of the legs, inside the bends', 'Only at the ankles', 'Straight down the front of the shins'], s: ['Cloth bunches on the inside of a bend.', 'For bent knees that is behind the knees and at the hips.'], h: 'Find the inside of each bend.' }
      ]);
    }
    return pickMc(R, [
      { q: 'NAME drew a jacket first, then the arms inside. Now the arms look too short. What went wrong?', c: ['The clothes came before the body; draw a light mannequin first', 'The jacket is too long', 'The folds are too dark'], s: ['Without the body underneath, the sizes are guesses.', 'Draw the mannequin lightly first, even if only the clothes will show.'], h: 'What should come first?' },
      { q: 'Where does a sleeve pull smooth, with few folds, when the arm bends?', c: ['Over the outside of the elbow', 'On the inside of the elbow', 'At the cuff'], s: ['The outside of the bend stretches the cloth.', 'So it pulls smooth there, while folds gather inside.'], h: 'Which side stretches?' },
      { q: 'How should NAME shade the folds of a shirt?', c: ['Like small cylinders, with the light side toward the light', 'With flat gray everywhere', 'With dark outlines only'], s: ['Each fold is a rounded ridge.', 'Shade it like a cylinder.'], h: 'What form is a fold?' },
      { q: 'Why do clothes have no shape of their own in a drawing?', c: ['They take their shape from the body underneath and from gravity', 'Because cloth is see-through', 'Because clothes are always loose'], s: ['Cloth hangs from supports and falls with gravity.', 'Knowing the body tells you where the cloth goes.'], h: 'What holds the cloth up?' }
    ]);
  });

  // ================================================================ UNIT 12: PRACTICE PLANS
  G('draw.warm-ups', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) return pickMc(R, [
      { q: 'Which of these is a good drawing warm-up?', c: ['Rows of circles and ellipses', 'A detailed portrait', 'Coloring in a finished drawing'], s: ['Warm-ups are quick, simple marks.', 'Circles and ellipses loosen the hand and arm.'], h: 'Short and simple.' },
      { q: 'Why warm up before drawing?', c: ['To loosen the hand and arm so the first real drawing is not stiff', 'To sharpen the pencil', 'To use up paper'], s: ['At first your marks are short and stiff.', 'A few minutes of warm-ups makes lines smooth and confident.'], h: 'Think of an athlete stretching.' },
      { q: 'How long does a warm-up usually take?', c: ['A few minutes', 'Several hours', 'A whole day'], s: ['A warm-up is short.', 'A few minutes, often five to ten, is enough.'], h: 'It comes before the real work.' }
    ]);
    if (L === 2) return pickMc(R, [
      { q: 'What is "ghosting" a line?', c: ['Moving the pencil above the paper along the path a few times, then drawing it', 'Drawing a line so light it cannot be seen', 'Erasing a line until it fades'], s: ['Ghosting rehearses the motion.', 'Then you draw the line in one confident stroke.'], h: 'Practice the motion first.' },
      { q: 'For a long, smooth straight line, which part of your arm should move?', c: ['The whole arm, from the shoulder', 'Only the fingers', 'Only the wrist'], s: ['Fingers and wrist make short marks.', 'Long lines come from moving the whole arm.'], h: 'Big lines need big movements.' },
      { q: 'NAME draws two dots and connects them as a warm-up. What is NAME practicing?', c: ['Smooth, accurate straight lines', 'Shading', 'Perspective'], s: ['Connecting dots in one stroke trains straight lines that land where you aim.'], h: 'What kind of line joins two dots?' }
    ]);
    return pickMc(R, [
      { q: 'NAME has 10 minutes before drawing a still life. Which plan is best?', c: ['Lines and ellipses, a quick value scale, then a few fast sketches of the objects', 'Ten minutes of shading one apple in full detail', 'Skip the warm-up and start the final drawing'], s: ['A warm-up mixes simple marks with quick looks at the subject.', 'Detail and final drawings come after.'], h: 'Simple, quick and varied.' },
      { q: 'NAME skipped the warm-up and the first drawing came out stiff. What is the best way to think about it?', c: ['Treat the first few minutes as practice that does not need to look good', 'Stop drawing for the day', 'Use a harder pencil'], s: ['Everyone starts stiff.', 'Warm-ups, or a first drawing treated as warm-up, are normal practice.'], h: 'Be kind to the first drawing.' },
      { q: 'Which warm-up practices the value skills from the Value unit?', c: ['A five-step value scale', 'Rows of circles', 'Connecting dots with lines'], s: ['A value scale steps evenly from white to black.', 'It trains control of light and dark.'], h: 'Value means light and dark.' }
    ]);
  });

  G('draw.sketchbook', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 2 || (L === 3 && R.coin())) {
      var mins = R.pick([10, 15, 20]), days = R.pick([4, 5, 6, 7]), weeks = L === 2 ? R.pick([1, 2, 4]) : R.pick([3, 4, 6, 8]), tot = mins * days * weeks, nm = who(R);
      return q(nm + ' draws for ' + mins + ' minutes on ' + days + ' days each week. How many minutes is that in ' + weeks + ' week' + (weeks > 1 ? 's' : '') + '?', null, num(tot),
        ['One week: ' + days + ' × ' + mins + ' = ' + (days * mins) + ' minutes.', weeks + ' × ' + (days * mins) + ' = ' + tot + ' minutes' + (tot % 60 === 0 ? ', which is ' + (tot / 60) + ' hours.' : '.')], 'Find one week first.', { unit: 'minutes' });
    }
    return pickMc(R, [
      { q: 'Which habit builds drawing skill fastest?', c: ['Drawing a little most days', 'Drawing for hours once a month', 'Waiting until you feel inspired'], s: ['Skills grow from many short practices spread over time.', 'Ten minutes most days does more than a rare long session.'], h: 'Often beats long.' },
      { q: 'Why date every sketchbook page?', c: ['So you can see your progress over time', 'Because teachers require it', 'To fill space on the page'], s: ['Day to day you cannot feel yourself improving.', 'Dated pages show it clearly.'], h: 'Look back in a month.' },
      { q: 'NAME dislikes yesterday\'s sketch. What should NAME do with the page?', c: ['Keep it; every page is part of the record', 'Tear it out', 'Scribble over it'], s: ['A sketchbook records practice, not just good drawings.', 'Keeping everything shows your progress.'], h: 'A sketchbook is not a showcase.' },
      { q: 'What is the best subject for most sketchbook practice?', c: ['Real things in front of you, drawn from life', 'Only copies of cartoons', 'Only drawings from memory'], s: ['Drawing from life trains you to see shape, light and depth.', 'Use whatever is around: shoes, cups, plants, pets.'], h: 'Look around you.' }
    ]);
  });

  G('draw.life-photos', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) return pickMc(R, [
      { q: 'Which is an advantage of drawing from life?', c: ['You see real depth and can walk around the object', 'It holds still forever', 'The light never changes'], s: ['With two eyes and a moving head, you understand the form.', 'A photo is flat.'], h: 'What does a real object give you that a photo cannot?' },
      { q: 'Which is an advantage of drawing from a photo?', c: ['It captures moving things, like a running dog, and holds still', 'It shows depth better than real life', 'It never distorts anything'], s: ['A photo freezes a moment.', 'That helps with subjects that move.'], h: 'Think of a bird in flight.' },
      { q: 'In many photos, what happens to deep shadows?', c: ['They turn solid black and lose their details', 'They become lighter than in real life', 'They disappear completely'], s: ['A camera picks one exposure for the whole scene.', 'Dark shadows often go solid black, though your eye would see detail.'], h: 'Compare a photo with what you see.' }
    ]);
    if (L === 2) return pickMc(R, [
      { q: 'NAME takes a selfie with one hand held toward the phone. In the photo the hand looks huge. Why?', c: ['The hand was much closer to the lens than the face, so the camera exaggerated it', 'NAME\'s hand is unusually large', 'Phones make everything bigger'], s: ['A camera close to its subject exaggerates whatever is nearest.', 'The hand was much closer than the face.'], h: 'How close was the hand to the lens?' },
      { q: 'What should NAME do with a photo distortion, like a stretched nose in a close-up?', c: ['Draw what the real thing looks like, not the camera\'s distortion', 'Copy it exactly; the photo is always right', 'Make it even bigger'], s: ['Close-up cameras bend near features.', 'Ask whether something odd is the camera, then draw the real shape.'], h: 'Is it the face or the camera?' },
      { q: 'Why does drawing from life show a fuller range of light and dark than many photos?', c: ['Your eyes adjust as you look from bright to dark parts', 'Real objects are brighter', 'Photos have no shadows'], s: ['Your eyes adapt as you look around a scene.', 'A camera uses one setting for everything.'], h: 'What do your eyes do in a dim corner?' }
    ]);
    return pickMc(R, [
      { q: 'NAME finds a great photo of a horse online. What should NAME check before drawing from it?', c: ['Whether it may be used (NAME\'s own, permitted, or free to use), and then credit the photographer', 'Nothing; anything online is free to use', 'Only that the photo is large'], s: ['Photos by other people are usually protected by copyright.', 'Use your own photos, ones you have permission to use, or ones marked free to use, and give credit.'], h: 'Who made the photo?' },
      { q: 'Which photos are safest for NAME to draw from?', c: ['Photos NAME took, or ones marked free to use', 'Any photo from a search result', 'Photos from a magazine'], s: ['NAME owns the rights to photos NAME took.', 'Photos marked public domain or with an open license are free to use, with credit.'], h: 'Who owns each photo?' },
      { q: 'A good habit for most practice is to…', c: ['Draw from life most of the time and use photos for moving subjects', 'Draw only from photos', 'Never use photos'], s: ['Life trains your eye for depth and light.', 'Photos help when the subject moves or life is not available.'], h: 'Use each for what it does best.' }
    ]);
  });
})(window.MathLadder);

/* ---- More forms of the same questions (round 7, "widen"): every topic of this course keeps its own generator above and
   sometimes asks the same skill in another form, built only from problems that generator made, so every answer is the
   generator's own:
   - check an answer: the question, one of its choices as a classmate's answer, and "Is that right?" (Yes / No; not in
     placement, where a guess is too easy; only for single-answer questions with three or more choices);
   - two at once: two different questions of the topic, answered together (short questions only, at most one of them with
     a picture, which then comes first; not in the courses for young children, whose answer box for two parts would
     also show a keypad button they don't need).
   Placed after the generators and registered with the same ids, so lessons, ids and the engine are unchanged. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var COURSE = 'draw', YOUNG = false, VAR = {};
  // how often another form is used: a quarter of the time when the topic's own generator already varies a lot at this
  // level, up to half the time when it has few different questions
  // (counted once per topic and level from 40 fixed seeds, ignoring the order of the choices)
  function share(id, base, ctx) {
    var L = (ctx && ctx.level) || 1, key = id + '|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 40; s++) {
        try {
          var p = base(ML.rand(id + '#variety#' + s + '#' + L), { level: L, mode: 'learn' }), a = p.a || {};
          var k = p.q + '|' + JSON.stringify(a.choices ? a.choices.slice().sort() : a.v) + '|' + JSON.stringify(p.viz || null);
          if (!seen[k]) { seen[k] = 1; n++; }
        } catch (e) { }
      }
      VAR[key] = n;
    }
    return VAR[key] >= 36 ? 0.25 : VAR[key] >= 25 ? 0.4 : 0.5;
  }
  function txt(s) { return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  var YN = /^(yes|no|true|false|right|wrong|correct|incorrect|not sure)\b/i;
  function checkable(p) {
    var a = p.a;
    if (!a || a.t !== 'mc' || Array.isArray(a.v) || !Array.isArray(a.choices) || a.choices.length < 3) return false;
    if (a.choices.some(function (c) { var t = txt(c); return !t || YN.test(t) || t.length > 180; })) return false;
    if (!p.viz && a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })) return false; // letters name parts of a picture
    if (/\b(is|was) (that|this|it) (right|correct)\b|\btrue or false\b/i.test(txt(p.q))) return false;
    return !p.unit;
  }
  function pairable(p, vizOk) {
    if ((p.viz && !vizOk) || p.unit || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf')) return false;
    if (p.a.t === 'mc' && (!Array.isArray(p.a.choices) || (!p.viz && p.a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })))) return false;
    return txt(p.q).length <= (YOUNG ? 240 : 480) && !/<(table|svg|img|canvas|ol|ul)\b/i.test(p.q) && !(YOUNG && /<blockquote\b/i.test(p.q));
  }
  function sameQ(p, p2) { // the same question, even with its choices in another order
    function k(x) { var a = x.a; return txt(x.q) + '|' + (a.t === 'mc' ? a.choices.slice().sort().join('|') + '|' + (Array.isArray(a.v) ? a.v.map(function (i) { return a.choices[i]; }).sort().join('|') : a.choices[a.v]) : JSON.stringify(a.v)); }
    return k(p) === k(p2);
  }
  function end(s) { s = String(s).replace(/\s+$/, ''); return /[.!?…”’)]$/.test(txt(s)) ? s : s + '.'; }
  function listed(q) { return /\b(these|those|the following|below|the choices|the options|one of them)\b/i.test(txt(q)); }
  function checkForm(R, p) {
    var a = p.a, right = R.coin(), k = right ? a.v : R.pick(a.choices.map(function (_, i) { return i; }).filter(function (i) { return i !== a.v; }));
    var who = YOUNG ? 'A friend picked' : 'A classmate answered', shown = a.choices[k], good = a.choices[a.v];
    var letters = a.choices.every(function (c) { return /^[A-H]$/.test(txt(c)); });
    var q = p.q + (!letters && listed(p.q.replace(/<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, '')) ? '<p>The choices: ' + a.choices.join(' &middot; ') + '</p>' : '') + '<p>' + who + ': <b>' + shown + '</b></p><p>Is that right?</p>';
    var out = { q: q, a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: p.hint || 'Work it out yourself first, then compare.',
      steps: [(right ? 'Yes, that is right: ' : 'No. The right answer is: ') + end(good)].concat(p.steps) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function pairForm(R, id, ctx, p, base) {
    for (var t = 0; t < 6; t++) {
      var R2 = ML.rand(id + '#pair#' + R.int(0, 999999999)), p2;
      try { p2 = base(R2, ctx); } catch (e) { return null; }
      if (p2 && p2.a && p2.a.t === 'mc' && !p2.a.choices && Array.isArray(p2.choices)) p2.a.choices = p2.choices;
      if (!p2 || !pairable(p2, !p.viz) || sameQ(p, p2)) continue;
      if (p2.viz) { var t2 = p; p = p2; p2 = t2; } // the question with the picture comes first
      var RM = /<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, rm = (p.q.match(RM) || p2.q.match(RM) || [''])[0];
      var out = { q: rm + '<p>Answer both questions.</p><ol class="ml-two"><li>' + p.q.replace(RM, '') + '</li><li>' + p2.q.replace(RM, '') + '</li></ol>',
        a: { t: 'multi', parts: [{ label: '1.', a: p.a }, { label: '2.', a: p2.a }] },
        hint: 'Take them one at a time.',
        steps: ['Question 1: ' + p.steps[0]].concat(p.steps.slice(1), ['Question 2: ' + p2.steps[0]], p2.steps.slice(1)) };
      var nl = [].concat(p.nolint || [], p2.nolint || []); if (nl.length) out.nolint = nl;
      if (p.viz) out.viz = p.viz;
      return out;
    }
    return null;
  }
  ML.genIds().filter(function (id) { return id.indexOf(COURSE + '.') === 0; }).forEach(function (id) {
    var base = ML.getGen(id);
    if (!base || base._forms) return;
    var fn = function (R, ctx) {
      var p = base(R, ctx), L = (ctx && ctx.level) || 1, mode = ctx && ctx.mode;
      if (!p || !p.a || !R.chance(share(id, base, ctx))) return p;
      if (p.a.t === 'mc' && !p.a.choices && Array.isArray(p.choices)) p.a.choices = p.choices;
      var forms = [];
      if (mode !== 'place' && checkable(p)) forms.push('check');
      if (pairable(p, true) && !YOUNG) forms.push('pair');
      if (!forms.length) return p;
      var f = R.pick(forms), out = f === 'check' ? checkForm(R, p) : pairForm(R, id, ctx, p, base);
      return out || p;
    };
    fn._forms = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : null);
