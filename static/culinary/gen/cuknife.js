/* Culinary Ladder: generators for cuknife (course key cuknife). Built by scripts/culinary/build.py from
   scripts/culinary/gen/_prelude.js and scripts/culinary/gen/cuknife.js: edit those, not this file. */
(function (ML) {
  'use strict';
  if (!ML) return;
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;
  /* shared helpers (every Culinary course file starts with these) */
  function fx(x) { return +(+x).toPrecision(12); }
  function sg(x, n) { if (!x || !isFinite(x)) return x; return +(+x).toPrecision(n || 3); }
  function r2(x) { return Math.round(x * 100) / 100; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function tv(x) { x = fx(x); return Math.abs(x) >= 1000 ? T.commas(x) : String(x); }
  function AX(x) { return { t: 'num', v: String(fx(x)) }; }
  function A(x, n, rtol) { return { t: 'num', v: String(sg(x, n || 3)), rtol: rtol || 0.02 }; }
  function AT(x, tol) { return { t: 'num', v: String(fx(x)), tol: tol }; }
  function PC(x, rtol) { var o = { t: 'num', v: String(fx(x)), pct: true }; if (rtol) o.rtol = rtol; return o; }
  function MC(c, w) { return U.mc(c, w.filter(function (x) { return x !== c; }), 4); }
  function money(x) { return T.money(r2(x).toFixed(2).replace(/\.00$/, '')); }
  function m2(x) { return '\\$' + r2(x).toFixed(2); }
  /* a recall item: [question, correct answer, [wrong answers], why (shown after answering)] */
  function bank(R, items) { var it = R.pick(items); return { q: it[0], a: MC(it[1], it[2]), steps: [it[3] || (it[1] + '.')] }; }
  /* a true-or-false style pick between two lists: "Which of these is X?" */
  function which(R, q, yes, no, why) { var c = R.pick(yes); return { q: q, a: MC(c, R.sample(no, 3)), steps: [why ? why(c) : c + '.'] }; }
  // ===== Knife Skills (cuknife)
  var CUTS = [['julienne', '⅛ × ⅛ × 1 to 2 inches', 0.125], ['batonnet', '¼ × ¼ × 2 to 2½ inches', 0.25], ['brunoise', '⅛-inch cubes', 0.125], ['fine brunoise', '¹⁄₁₆-inch cubes', 0.0625],
    ['small dice', '¼-inch cubes', 0.25], ['medium dice', '½-inch cubes', 0.5], ['large dice', '¾-inch cubes', 0.75], ['fine julienne', '¹⁄₁₆ × ¹⁄₁₆ × 1 to 2 inches', 0.0625]];
  var FR = { 0.0625: '1/16', 0.125: '1/8', 0.25: '1/4', 0.5: '1/2', 0.75: '3/4' };

  G('cuknife.grip-guide', function (R, ctx) {
    return bank(R, [
      ['In the pinch grip, where do the thumb and first finger hold the knife?', 'On the blade, just in front of the handle', ['On the end of the handle', 'On the spine, near the tip', 'Anywhere on the handle'], 'Pinching the blade gives control.'],
      ['In the claw, what touches the flat of the blade?', 'The knuckles of the guide hand', ['The fingertips', 'The thumb', 'The palm'], 'Fingertips stay tucked behind the knuckles.'],
      ['What sets the thickness of each slice?', 'How far the guide hand moves back', ['How hard you press', 'The speed of the knife', 'The size of the board'], 'Move the claw back the same distance each time.'],
      ['Which is safer?', 'A sharp knife', ['A dull knife', 'A serrated knife for everything', 'A knife with no bolster'], 'A sharp knife needs less force and slips less.'],
      ['A knife is falling off the counter. What do you do?', 'Step back and let it fall', ['Catch it', 'Kick it away', 'Grab the handle quickly'], 'Never try to catch a falling knife.'],
      ['How do you carry a knife through a kitchen?', 'Point down, close to your side, edge back, saying "knife" or "sharp"', ['Point forward, so people see it', 'In your apron pocket', 'Over your shoulder'], 'Warn people as you pass.'],
      ['Why cut a thin slice off a round vegetable first?', 'To make a flat side so it can\'t roll', ['To remove all the vitamins', 'To sharpen the knife', 'It is only decoration'], 'A stable vegetable is a safe one.'],
      ['Where should your thumb be on the guide hand?', 'Tucked behind the fingers', ['Sticking out to the side', 'On top of the food', 'Under the knife'], 'A loose thumb is easy to cut.']
    ]);
  });

  G('cuknife.onion-mince', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'count', 'pieces']), R.pick(['count', 'bank', 'pieces']), R.pick(['count', 'pieces']));
    if (kind === 'count') { var d = R.pick([0.125, 0.25, 0.5]), wd = R.int(4, 10) / 2; return {
      q: 'An onion half is ' + wd + ' inches wide. You want a ' + FR[d] + '-inch dice. How many strips will your lengthwise cuts make across it?',
      a: AX(wd / d), steps: ['$' + wd + ' \\div ' + T.num(d) + ' = ' + fx(wd / d) + '$ strips (about one fewer cut than strips).']
    }; }
    if (kind === 'pieces') { var a = R.int(4, 12), b = R.int(3, 8), c = R.int(6, 16); return {
      q: 'You make ' + (a - 1) + ' lengthwise cuts, ' + (b - 1) + ' horizontal cuts and then ' + (c - 1) + ' cross cuts in a block-shaped onion half. If every piece were a full cube, how many pieces would you get?',
      a: AX(a * b * c), steps: [(a - 1) + ' cuts make ' + a + ' strips; ' + (b - 1) + ' make ' + b + ' layers; ' + (c - 1) + ' make ' + c + ' slices.', '$' + a + ' \\times ' + b + ' \\times ' + c + ' = ' + a * b * c + '$. (A real onion is rounded, so you get fewer.)']
    }; }
    return bank(R, [
      ['Why leave the root end on when dicing an onion?', 'It holds the layers together until the last cut', ['It adds flavor', 'It is poisonous to cut', 'It keeps the onion cold'], 'Cut it off last and save it for stock.'],
      ['Which cut keeps the knife tip on the board and rocks the heel up and down?', 'The rocking cut', ['The push cut', 'The chiffonade', 'The tourné'], 'Good for herbs and mincing.'],
      ['How do you loosen garlic peel quickly?', 'Crush the clove with the flat of the knife', ['Soak it in oil', 'Freeze it', 'Microwave it for a minute'], 'Then the peel slips off.'],
      ['What helps grind minced garlic to a paste?', 'A pinch of salt', ['A splash of water', 'Sugar', 'A dull knife'], 'Salt acts like grit.'],
      ['Which direction do you halve an onion for dicing?', 'Through the root, from top to root', ['Across its middle', 'Diagonally', 'It doesn\'t matter'], 'Each half keeps part of the root.'],
      ['What does a push cut do?', 'Slides the blade forward and down through the food', ['Rocks the tip on the board', 'Chops straight down with force', 'Saws back and forth'], 'Used for slicing and dicing.']
    ]);
  });

  G('cuknife.classic-cuts', function (R, ctx) {
    var kind = by(ctx, R.pick(['name', 'size']), R.pick(['name', 'size', 'count']), R.pick(['count', 'vol', 'from', 'size']));
    if (kind === 'name') { var c = R.pick(CUTS); return { q: 'Which cut is ' + c[1] + '?', a: MC(c[0], CUTS.map(function (x) { return x[0]; })), steps: [c[0].charAt(0).toUpperCase() + c[0].slice(1) + ' is ' + c[1] + '.'] }; }
    if (kind === 'size') { var c2 = R.pick(CUTS); return { q: 'What is the standard size of a ' + c2[0] + '?', a: MC(c2[1], CUTS.map(function (x) { return x[1]; })), steps: ['A ' + c2[0] + ' is ' + c2[1] + '.'] }; }
    if (kind === 'from') { var pairs = [['brunoise', 'julienne'], ['small dice', 'batonnet'], ['fine brunoise', 'fine julienne']], p = R.pick(pairs);
      return { q: 'A ' + p[0] + ' is cut from which stick?', a: MC(p[1], ['julienne', 'batonnet', 'fine julienne', 'large dice', 'paysanne']), steps: ['Each cube comes from the stick of the same width: ' + p[1] + ' becomes ' + p[0] + '.'] }; }
    if (kind === 'count') { var st = R.pick([['batonnet', 0.25, 'small dice'], ['julienne', 0.125, 'brunoise']]), L = R.pick([1, 1.5, 2, 2.5]);
      return { q: 'A ' + st[0] + ' is ' + FR[st[1]] + ' inch square and ' + L + ' inches long. How many ' + st[2] + ' cubes can you cut from it?', a: AX(L / st[1]), steps: ['$' + L + ' \\div ' + T.num(st[1]) + ' = ' + fx(L / st[1]) + '$ cubes.'] }; }
    var bl = R.pick([[1, 1, 2], [1, 2, 2], [2, 2, 3], [1, 1, 3], [1.5, 1.5, 2]]), dsz = R.pick([0.5, 0.25]);
    var n = Math.round(bl[0] / dsz) * Math.round(bl[1] / dsz) * Math.round(bl[2] / dsz);
    return { q: 'A squared-off block of potato measures ' + bl.join(' × ') + ' inches. How many ' + (dsz === 0.5 ? 'medium (½-inch)' : 'small (¼-inch)') + ' dice can you cut from it?', a: AX(n),
      steps: ['Pieces along each side: $' + bl.map(function (x) { return T.num(x) + ' \\div ' + T.num(dsz) + ' = ' + Math.round(x / dsz); }).join('$, $') + '$.', 'Multiply: $' + bl.map(function (x) { return Math.round(x / dsz); }).join(' \\times ') + ' = ' + n + '$.'] };
  });

  G('cuknife.specialty-cuts', function (R, ctx) {
    return bank(R, [
      ['Which cut makes thin ribbons from rolled leaves?', 'Chiffonade', ['Tourné', 'Paysanne', 'Brunoise'], 'Stack, roll tight, slice thin.'],
      ['How many sides does a classic tourné have?', 'Seven', ['Five', 'Six', 'Eight'], 'Seven equal, curved sides with blunt ends.'],
      ['Which cut gives thin, flat pieces about ½ × ½ × ⅛ inch?', 'Paysanne', ['Batonnet', 'Chiffonade', 'Large dice'], 'Squares, rounds or triangles.'],
      ['What is a rondelle?', 'A round cut across a cylinder such as a carrot', ['A diamond', 'A ribbon of leaves', 'A seven-sided oval'], 'Cut on a slant for a bias.'],
      ['How do you make an oblique (roll) cut?', 'Cut on a slant, roll a quarter turn, cut again', ['Cut straight across', 'Shave thin ribbons', 'Cut into cubes'], 'It exposes more surface for roasting and glazing.'],
      ['Why does basil chiffonade turn black?', 'A dull knife or cutting too early bruises the leaves', ['Basil is always black inside', 'Salt on the board', 'Using a wooden board'], 'Use a sharp knife, just before serving.'],
      ['Which knife is used for a tourné?', 'A paring or bird\'s beak knife', ['A bread knife', 'A cleaver', 'A slicer'], 'A curved blade helps shape the sides.'],
      ['What is a lozenge cut?', 'A diamond shape about ½ inch across and ⅛ inch thick', ['A seven-sided oval', 'A long thin stick', 'A grated shred'], 'Cut thin planks into strips, then cut across at an angle.'],
      ['Which cut gives long diagonal slices for a stir-fry?', 'Bias (diagonal rondelles)', ['Brunoise', 'Tourné', 'Chiffonade'], 'Slanted cuts make longer slices.']
    ]);
  });

  G('cuknife.sharpening-honing', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'incl', 'height']), R.pick(['height', 'incl', 'bank', 'angle']), R.pick(['height', 'angle']));
    if (kind === 'incl') { var a = R.int(10, 25); return { q: 'A knife is sharpened at ' + a + ' degrees per side. What is the total (inclusive) angle of the edge?', a: AX(2 * a), unit: '°', steps: ['Two sides: $' + a + ' + ' + a + ' = ' + 2 * a + '^\\circ$.'] }; }
    if (kind === 'height') { var w = R.int(5, 11) / 4, an = R.int(12, 22), h = w * Math.sin(an * Math.PI / 180); return {
      q: 'A blade is ' + w + ' inches tall. To sharpen at ' + an + ' degrees, about how high should the spine sit above the stone? (height = blade height × sin angle)',
      a: A(h, 2, 0.04), unit: 'in', steps: ['$' + w + ' \\times \\sin ' + an + '^\\circ \\approx ' + w + ' \\times ' + String(+Math.sin(an * Math.PI / 180).toFixed(3)) + ' \\approx ' + sg(h, 2) + '$ inch.']
    }; }
    if (kind === 'angle') { var w2 = R.pick([1.5, 1.75, 2, 2.25]), hh = R.int(30, 70) / 100, ang = Math.asin(hh / w2) * 180 / Math.PI; return {
      q: 'Your blade is ' + w2 + ' inches tall and you hold its spine ' + hh + ' inch above the stone. About what angle per side is that, in degrees?',
      a: A(ang, 2, 0.05), unit: '°', steps: ['$\\sin \\theta = ' + hh + ' \\div ' + w2 + ' = ' + sg(hh / w2, 3) + '$.', '$\\theta \\approx ' + sg(ang, 2) + '^\\circ$.']
    }; }
    return bank(R, [
      ['What does a honing steel do?', 'Pushes a bent edge back into line', ['Grinds a new edge', 'Polishes the handle', 'Removes rust'], 'It straightens; it doesn\'t sharpen.'],
      ['When does a knife need sharpening, not just honing?', 'When it stays dull after honing', ['After every use', 'Only when it is chipped', 'Never, if you hone it'], 'Honing can\'t replace worn metal.'],
      ['About what angle per side are many Western knives sharpened at?', 'About 20 degrees', ['About 5 degrees', 'About 45 degrees', 'About 90 degrees'], 'Many Japanese knives use about 15 or less.'],
      ['A smaller sharpening angle gives an edge that…', 'cuts more easily but is more delicate', ['lasts longer but cuts worse', 'is serrated', 'never needs honing'], 'It\'s a trade-off.'],
      ['What simple test shows if a knife is sharp?', 'It slices cleanly through a sheet of paper held by one corner', ['It feels heavy', 'It shines', 'It makes a ringing sound'], 'A dull knife tears or catches.']
    ]);
  });

  G('cuknife.knife-care', function (R, ctx) {
    return bank(R, [
      ['Which whetstone grit is the everyday sharpening stone?', 'Medium, about 1,000', ['Coarse, about 200', 'Fine, about 6,000', 'Any grit, it doesn\'t matter'], 'Coarse repairs; fine polishes.'],
      ['What is the burr?', 'A tiny rough lip of metal that forms on the far side of the edge', ['The handle rivet', 'A chip in the blade', 'Rust on the spine'], 'It shows you have ground all the way to the edge.'],
      ['What is a coarse stone (about 200 to 600 grit) for?', 'Repairing chips and reshaping the edge', ['Final polishing', 'Honing every day', 'Cleaning the knife'], 'Start on medium for a plain dull edge.'],
      ['Why not put good knives in the dishwasher?', 'Knocks and heat dull edges and can harm handles', ['They will melt', 'It makes them sharper', 'Dishwashers can\'t reach them'], 'Wash by hand, dry at once.'],
      ['Where should knives be stored?', 'In a block, on a magnetic strip, or in edge guards', ['Loose in a drawer', 'In the sink', 'On the windowsill'], 'Cover the edge or keep it off the counter.'],
      ['How should you scrape chopped food off the board?', 'With the spine of the knife', ['With the edge', 'With your fingers under the blade', 'Tip the board into the pan'], 'The edge rolls over when you scrape.'],
      ['Why never leave a knife in a sink of soapy water?', 'Someone may reach in and grab the blade', ['It rusts in seconds', 'Soap dulls it instantly', 'It clogs the drain'], 'Wash it on its own and put it away.'],
      ['After the medium stone, what is the fine stone (about 3,000 to 8,000 grit) for?', 'Polishing and refining the edge', ['Removing big chips', 'Flattening the handle', 'Cleaning the steel'], 'Finish with light strokes to remove the burr.']
    ]);
  });

})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
