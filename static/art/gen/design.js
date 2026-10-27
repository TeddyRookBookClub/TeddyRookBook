/* Color and Design (Art & Drawing Ladder, course key design): problem generators for all 37 topics.
   Ages 12 to adult. Answers are mostly multiple choice (mc) because the skills are naming, classifying and reading pictures;
   a few topics ask for a number (how many elements, a scale, a WCAG contrast ratio). Every color fact comes from the kit's
   model, MathLadder.art (A below): the painter's 12-hue wheel (A.WHEEL, complement, scheme, schemeOf, temperature),
   paint, ink and light mixing (mixPaint, mixInk, mixLight), and the color math (lightness, grayOf, contrast). So the picture
   and the answer always agree. Pictures are quiet (no names or verdicts) and lettered in the order given.
   Levels: 1 recognize and name; 2 the topic's trouble spot (the near miss in the trouble note); 3 apply: pictures,
   catalog works, reasoning. Art-history questions use catalog works by id and show the picture only when A.hasImg(w);
   otherwise they ask in words. Wheel questions always say "on the painter's wheel" unless they are about light.
   Course visuals (design-swatches, design-text, design-implied, design-screen, design-structure) are in
   static/art/viz/design.js. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;
  function A() { return ML.art; }

  // ---------------------------------------------------------------- helpers
  var LET = ['A', 'B', 'C', 'D', 'E', 'F'];
  function letter(i) { return LET[i]; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function mc(choices, right, keep) { return { t: 'mc', choices: choices, v: right, keep: !!keep }; }
  function letters(n) { return LET.slice(0, n); }
  // right answer plus wrong ones, shuffled: { choices, v }
  function opts(R, right, wrong) { var all = R.shuffle([right].concat(wrong)); return { choices: all, v: all.indexOf(right) }; }
  function ask(R, right, wrong, extra) { var o = opts(R, cap(right), wrong.map(cap)); return mc(o.choices, o.v, extra); }
  var NAMES = ['Maya', 'Leo', 'Priya', 'Sam', 'Omar', 'Hana', 'Jonah', 'Rosa', 'Kai', 'Elena'];
  function nm(R) { return R.pick(NAMES); }
  function uniq(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); }
  function hueName(k) { return A().hue(k).name; }
  function hex(k) { return A().hue(k).hex; }
  function wheelKeys() { return A().WHEEL.map(function (c) { return c.key; }); }
  function idx(k) { return A().hueIdx(k); }
  function at(i) { var W = A().WHEEL; return W[((i % 12) + 12) % 12].key; }
  function names(keys) { return keys.map(hueName); }
  function listText(keys) { var n = names(keys); return n.length === 2 ? n[0] + ' and ' + n[1] : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1]; }
  function swatches(colors, extra) { return { name: 'design-swatches', opts: Object.assign({ colors: colors, quiet: true, letters: colors.length > 1, interactive: false, label: 'Color swatches' }, extra || {}) }; }
  function palettes(rows, extra) { return { name: 'design-swatches', opts: Object.assign({ palettes: rows, quiet: true, interactive: false, label: 'Rows of color swatches, lettered' }, extra || {}) }; }
  function work(id) { return A().work(id); }
  function workViz(w) { return A().hasImg(w) ? { name: 'ar-artwork', opts: { work: w.id, quiet: true, interactive: false } } : null; }
  // a problem with an optional picture (only set when there is one)
  function P(q, a, steps, hint, viz) { var p = { q: q, a: a, steps: steps, hint: hint }; if (viz) p.viz = viz; return p; }

  // ================================================================ UNIT 1: THE ELEMENTS OF ART
  var EL = ['line', 'shape', 'form', 'space', 'value', 'texture', 'color'];
  var PR = ['balance', 'contrast', 'emphasis', 'movement', 'pattern', 'rhythm', 'unity', 'variety', 'proportion'];
  G('design.elements-overview', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var e = R.pick(EL), w = R.sample(PR, 2);
      return P(R.pick(['Which of these is one of the seven elements of art?', 'Which word names an element of art (a part a picture is made of)?']), ask(R, cap(e), w.map(cap)),
        [cap(e) + ' is one of the seven elements: line, shape, form, space, value, texture and color.', w.map(cap).join(' and ') + ' are principles of design: ways of arranging the elements.'], 'The elements are parts you can point to in a picture.');
    }
    if (L === 2) {
      if (R.coin()) {
        var x = R.chance(0.35) ? 'balance' : R.pick(EL.concat(PR)), isEl = EL.indexOf(x) >= 0;
        return P('Is <b>' + x + '</b> an element of art or a principle of design?', mc(['An element of art', 'A principle of design'], isEl ? 0 : 1, true),
          [isEl ? cap(x) + ' is a part you can point to in a picture, so it is an element.' : cap(x) + ' describes how parts are arranged, so it is a principle.', 'The elements: line, shape, form, space, value, texture, color.'],
          'Can you point to it as a thing in the picture? Then it is an element.');
      }
      var p1 = R.chance(0.4) ? 'balance' : R.pick(PR), els = R.sample(EL, 3);
      return P('Three of these are elements of art. Which one is <b>not</b>?', ask(R, cap(p1), els.map(cap)),
        [cap(p1) + ' is a principle of design: a way of arranging the parts.', els.map(cap).join(', ') + ' are elements.'], 'Look for the word that describes an arrangement, not a part.');
    }
    if (R.chance(0.25)) return P('How many elements of art are on the standard list taught in most American art classes?', { t: 'num', v: '7' },
      ['Line, shape, form, space, value, texture and color.', 'That is 7 elements.'], 'Count them: line, shape, form…');
    // a picture of one element; distractors that the picture could not be mistaken for
    var NOT = { line: ['value', 'color', 'form'], shape: ['value', 'space', 'texture'], form: ['line', 'texture', 'space'], space: ['texture', 'value', 'color'],
      value: ['texture', 'line', 'space'], texture: ['color', 'form', 'value'], color: ['value', 'texture', 'space'] };
    var k = R.pick(EL), wr = R.sample(NOT[k], 2);
    var say = { line: 'Wavy, zigzag, curved and straight marks: line.', shape: 'Flat areas, a triangle and a leaf, with no shading: shape.', form: 'A circle shaded from light to dark with a cast shadow reads as a ball: form.',
      space: 'A road narrowing toward the horizon and trees getting smaller: the illusion of depth, space.', value: 'Steps of gray from white to black: value.', texture: 'Many short strokes that look rough, like bark or fur: texture.', color: 'A row of different hues: color.' };
    return P('This small design is mainly about one element of art. Which one?', ask(R, cap(k), wr.map(cap)), [say[k]], 'What is the design made of, more than anything else?',
      { name: 'ar-design', opts: { kinds: [k], quiet: true, interactive: false, label: 'A small design showing one element' } });
  });

  var LINE_FEEL = { horizontal: 'rest and calm', vertical: 'height and stability', diagonal: 'movement and energy', zigzag: 'excitement and sharpness', curved: 'gentle flow' };
  G('design.line-element', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var FEEL_NOT = { horizontal: ['diagonal', 'zigzag'], vertical: ['diagonal', 'zigzag', 'curved'], diagonal: ['horizontal', 'vertical', 'curved'], zigzag: ['horizontal', 'vertical', 'curved'], curved: ['vertical', 'zigzag'] };
      var k = R.pick(Object.keys(LINE_FEEL)), w = R.sample(FEEL_NOT[k], 2);
      if (R.coin() && ['horizontal', 'vertical', 'diagonal'].indexOf(k) >= 0) {
        return P('What is the direction of this line?', ask(R, cap(k), ['horizontal', 'vertical', 'diagonal'].filter(function (q) { return q !== k; }).map(cap)),
          ['The line ' + A().LINES[k].desc + '.', 'That is a ' + k + ' line.'], 'Does it stand up, lie flat, or lean?', { name: 'ar-lines', opts: { kinds: [k], quiet: true, interactive: false, labels: 'none', label: 'A line' } });
      }
      return P('Artists most often use this kind of line to suggest which feeling?', ask(R, cap(LINE_FEEL[k]), w.map(function (q) { return cap(LINE_FEEL[q]); })),
        ['This is a ' + k + ' line.', cap(k) + ' lines most often suggest ' + LINE_FEEL[k] + '. (These are common associations, not rules.)'], 'Think of where you see this line in the world: the horizon, a tree, a falling object, lightning, a river.',
        { name: 'ar-lines', opts: { kinds: [k], quiet: true, interactive: false, labels: 'none', label: 'A line' } });
    }
    if (L === 2) {
      var kinds = ['actual', 'dots', 'edges', 'gaze', 'pointing'], kk = R.chance(0.3) ? 'actual' : R.pick(kinds.slice(1));
      var how = { actual: 'It is one continuous drawn mark: an actual line.', dots: 'Nothing joins the dots, but the eye connects them: an implied line.', edges: 'The corners of the shapes line up, and the eye continues the direction: an implied line.',
        gaze: 'Nothing is drawn between the face and the star; the eye follows where the person looks: an implied line.', pointing: 'The shape points at the circle, and the eye follows it: an implied line.' };
      return P('Look at the path your eye follows in this picture. Is that line actual or implied?', mc(['Actual: it is drawn', 'Implied: the eye fills it in'], kk === 'actual' ? 0 : 1, true),
        [how[kk]], 'Is there a continuous mark, or does your eye connect separate things?', { name: 'design-implied', opts: { kinds: [kk], quiet: true, interactive: false } });
    }
    var pool = [
      { q: 'In a painting, a row of fence posts runs back toward a barn. Nothing is drawn joining their tops. What leads the eye to the barn?', right: 'An implied line made by the row of posts', wrong: ['An actual outline around the barn', 'Texture'] },
      { q: 'Two people in a painting both look toward a candle. What joins them to the candle?', right: 'Implied lines made by their gazes', wrong: ['Actual lines drawn to the candle', 'A pattern'] },
      { q: 'An artist draws a dark, continuous outline around a pear. What kind of line is the outline?', right: 'An actual line (a contour)', wrong: ['An implied line', 'A value scale'] },
      { q: 'A row of birds flies across the sky in a curve. What does the row create?', right: 'An implied curved line', wrong: ['An actual zigzag line', 'Negative texture'] },
      { q: 'A tall, thin tree stands alone in a painting. Its trunk is mostly a strong upright line. What does such a line most often suggest?', right: 'Height and stability', wrong: ['Rest and calm', 'Falling and tension'] },
      { q: 'A painter shows a ship tipped at a steep angle in a storm. Its mast makes a strong diagonal. What does that line most often suggest?', right: 'Movement and tension', wrong: ['Rest and calm', 'Height and stability'] },
      { q: 'A calm lake meets the sky in a long, flat line. What does that horizontal line most often suggest?', right: 'Rest and calm', wrong: ['Excitement and speed', 'Height and stability'] }];
    var Q = R.pick(pool);
    return P(Q.q, ask(R, Q.right, Q.wrong), ['Ask: is there a continuous mark, or does the eye connect things? And which way does it run?', 'Answer: ' + Q.right.toLowerCase() + '.'], 'Lines can be drawn, or made by things that line up, gazes and pointing shapes.');
  });

  var GEO = ['circle', 'square', 'triangle', 'rectangle', 'hexagon', 'diamond', 'star'], ORG = ['leaf', 'cloud', 'puddle', 'rock', 'flame', 'blob'];
  G('design.shape-form', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var geo = R.coin(), s = R.pick(geo ? GEO : ORG);
      return P('Is this shape geometric or organic?', mc(['Geometric', 'Organic'], geo ? 0 : 1, true),
        [geo ? 'It is regular, the kind you could make with a ruler and compass: geometric.' : 'It is irregular and free, like something in nature: organic.'], 'Regular and measurable, or free and irregular?',
        { name: 'ar-shapes', opts: { shapes: [s], quiet: true, interactive: false, labels: 'none', fill: R.pick(['#2a6db0', '#d9a441', '#3aa64a', '#b8197f']), label: 'A shape' } });
    }
    if (L === 2) {
      if (R.coin()) {
        var f = R.pick(['sphere', 'cube', 'cylinder', 'cone']);
        return P('This drawing is shaded with a lit side, a shadow side and a shadow on the table. Is it a shape or a form?', mc(['A shape', 'A form'], 1, true),
          ['Shading that copies light on a solid object makes it look three-dimensional.', 'So it reads as a form (a ' + f + '), even on flat paper: an implied form.'], 'Does it look solid?',
          { name: 'ar-shade', opts: { form: f, light: R.pick([30, 60, 120, 150]), parts: [], quiet: true, interactive: false, label: 'A shaded object' } });
      }
      var s2 = R.pick(['circle', 'square', 'triangle']);
      return P('This ' + s2 + ' is filled with one flat color, with no light or shadow. Is it a shape or a form?', mc(['A shape', 'A form'], 0, true),
        ['It has height and width but nothing that suggests depth.', 'So it is a flat shape.'], 'Is there any shading that makes it look solid?',
        { name: 'ar-shapes', opts: { shapes: [s2], quiet: true, interactive: false, labels: 'none', fill: R.pick(['#2a6db0', '#d9a441', '#3aa64a', '#b8197f', '#e03127']), rotate: { 0: R.pick([0, 0, 15, -15]) }, label: 'A flat shape' } });
    }
    if (R.coin()) {
      var sh = R.pick(['circle', 'square', 'triangle']), ans = Ak.FORMS[sh], all = ['sphere', 'cube', 'cone', 'cylinder'];
      return P('Shade a flat ' + sh + ' so it looks solid. Which form does it become?', ask(R, cap(ans), all.filter(function (q) { return q !== ans; }).slice(0, 2).map(cap)),
        ['A ' + sh + ' is the flat outline of a ' + ans + '.', 'Shaded, it reads as a ' + ans + '.'], 'Think of the solid object whose outline is that shape.');
    }
    var pool = [['a marble statue', 0], ['a clay bowl', 0], ['a brick building', 0], ['a carved wooden horse', 0], ['a bronze sculpture', 0], ['a glass vase on a shelf', 0], ['a stone column', 0],
      ['a pencil drawing of an egg, shaded', 1], ['a painted apple that looks round', 1], ['a photograph of a vase', 1], ['a shaded drawing of a cube', 1], ['a charcoal drawing of a pear', 1], ['a painted column on a flat wall', 1]];
    var it = R.pick(pool);
    return P('Is the form in <b>' + it[0] + '</b> actual or implied?', mc(['Actual: you could walk around it or hold it', 'Implied: shading makes a flat surface look solid'], it[1], true),
      [it[1] ? 'The surface is flat; only shading suggests depth.' : 'It really has height, width and depth.', it[1] ? 'Implied form.' : 'Actual form.'], 'Could you hold it, or is it on a flat surface?');
  });

  G('design.space', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var pool = [
        { q: 'In a drawing of a chair, what are the gaps between its legs called?', right: 'Negative space', wrong: ['Positive space', 'Implied form'] },
        { q: 'In a portrait, the person is the main subject. What kind of space does the person take up?', right: 'Positive space', wrong: ['Negative space', 'Atmospheric space'] },
        { q: 'In this design, the light vase in the middle is the positive space. What are the dark areas on either side?', right: 'Negative space', wrong: ['Positive space', 'Texture'], viz: { name: 'ar-design', opts: { kinds: ['positive-negative'], quiet: true, interactive: false, label: 'A light vase shape on a dark ground' } } },
        { q: 'The sky around a tree in a painting is what kind of space?', right: 'Negative space', wrong: ['Positive space', 'Form'] },
        { q: 'In a drawing of a bicycle, what are the areas inside the wheels, between the spokes?', right: 'Negative space', wrong: ['Positive space', 'Implied texture'] },
        { q: 'In a drawing of a teacup, what is the gap inside the curve of the handle?', right: 'Negative space', wrong: ['Positive space', 'A tertiary color'] },
        { q: 'In a still life, the apples and the jug are the subjects. What kind of space do they fill?', right: 'Positive space', wrong: ['Negative space', 'Atmospheric space'] },
        { q: 'In a photo of a bare winter tree, what are the patches of sky between the branches?', right: 'Negative space', wrong: ['Positive space', 'Form'] }];
      var Q = R.pick(pool);
      return P(Q.q, ask(R, Q.right, Q.wrong), ['Positive space is the subject; negative space is the area around and between subjects.', 'So: ' + Q.right.toLowerCase() + '.'], 'Is it the subject, or the area around it?', Q.viz);
    }
    if (L === 2) {
      var sc = R.pick(['a wide, empty sky above a small boat', 'a large plain wall around one small window', 'bare paper around a single branch in an ink painting', 'a wide empty beach beside one walker', 'a plain dark background around a single pear', 'open snow around a lone fox']);
      return P(nm(R) + ' leaves <b>' + sc + '</b> in a ' + R.pick(['painting', 'drawing', 'photograph', 'print']) + '. What is the best description of that empty area?', ask(R, 'Negative space that helps shape the picture', ['Wasted space the artist forgot to fill', 'Positive space']),
        ['The empty area is negative space.', 'It gives the eye room to rest and makes the subject stand out, so it is part of the design.'], 'Is empty space ever useful?');
    }
    if (R.chance(0.25)) return P('In this picture, the hills get paler, bluer and softer the farther away they are. Which depth cue is that?', ask(R, 'Atmospheric perspective', ['Overlap', 'Hierarchical scale']),
      ['Air between us and distant things makes them paler, bluer and less detailed.', 'Painters call this atmospheric perspective.'], 'What does the air do to far-off hills?', { name: 'ar-persp', opts: { mode: 'atmos', quiet: true, interactive: false } });
    var cue = R.pick(['overlap', 'size', 'placement']), cueN = { overlap: 'Overlap', size: 'Smaller size', placement: 'Higher placement on the page' };
    var why = { overlap: 'One object hides part of another, so the hidden one looks farther back.', size: 'The same kind of tree is drawn smaller and smaller, so the small ones look far away.', placement: 'The trees sit higher on the page, closer to the horizon, so they look farther away.' };
    return P('Which depth cue makes some things in this picture look farther away?', ask(R, cueN[cue], ['overlap', 'size', 'placement'].filter(function (c) { return c !== cue; }).map(function (c) { return cueN[c]; })),
      [why[cue]], 'Compare the objects: does one hide another, are they different sizes, or at different heights?', { name: 'ar-persp', opts: { mode: 'depth', cue: [cue], quiet: true, interactive: false } });
  });

  G('design.value-element', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var sc = Ak.valueScale(9), i = R.int(0, 6), j = R.int(i + 2, 8), pair = R.coin() ? [i, j] : [j, i], darker = R.coin();
      var right = darker ? (pair[0] > pair[1] ? 0 : 1) : (pair[0] < pair[1] ? 0 : 1);
      return P('Which swatch is ' + (darker ? 'darker' : 'lighter') + ' in value?', mc(['A', 'B'], right, true),
        ['Value is lightness and darkness.', 'Swatch ' + letter(right) + ' is ' + (darker ? 'darker' : 'lighter') + '.'], 'Squint and compare.', swatches([sc[pair[0]], sc[pair[1]]]));
    }
    if (L === 2) { // the trouble spot: bright colors are not always light
      var ks = wheelKeys(), a, b, tries = 0;
      do { a = R.pick(ks); b = R.pick(ks); tries++; } while ((a === b || Math.abs(Ak.lightness(hex(a)) - Ak.lightness(hex(b))) < 15) && tries < 50);
      var dk = R.coin(), la = Ak.lightness(hex(a)), lb = Ak.lightness(hex(b)), r2 = dk ? (la < lb ? 0 : 1) : (la > lb ? 0 : 1);
      return P('Forget the hue. Which swatch is <b>' + (dk ? 'darker' : 'lighter') + '</b> in value?', mc(['A', 'B'], r2, true),
        ['Imagine both in a black-and-white photo.', 'On a lightness scale from 0 (black) to 100 (white), A is about ' + Math.round(la) + ' and B about ' + Math.round(lb) + '.', 'So ' + letter(r2) + ' is ' + (dk ? 'darker' : 'lighter') + '.'],
        'Squint until the colors fade. Which looks more like a dark gray?', swatches([hex(a), hex(b)]));
    }
    if (R.chance(0.35)) {
      var kw = R.pick([['mostly light values', 'High key'], ['mostly dark values', 'Low key']]);
      return P('A picture is painted in ' + kw[0] + '. What is it called?', ask(R, kw[1], [kw[1] === 'High key' ? 'Low key' : 'High key', 'Monochromatic']),
        [kw[1] + ' means a picture made mostly of ' + kw[0] + '.'], 'Think of a piano: high notes and low notes.');
    }
    var want = R.pick(['high', 'low', 'contrast']), keys = R.shuffle({ high: ['high', 'low', 'flat'], low: ['low', 'high', 'flat'], contrast: ['contrast', 'high', 'low'] }[want]), wn = { high: 'high key (mostly light values)', low: 'low key (mostly dark values)', contrast: 'high contrast (very light and very dark together)', flat: 'low contrast, middle values' };
    return P('Which picture is <b>' + wn[want] + '</b>?', mc(letters(3), keys.indexOf(want), true),
      keys.map(function (k, i) { return letter(i) + ': ' + wn[k] + '.'; }), 'Squint and look at the overall lightness.', { name: 'ar-value', opts: { mode: 'key', keys: keys, quiet: true, interactive: false } });
  });

  var TEX_ITEMS = [['thick ridges of oil paint on a canvas', 0], ['a carved wooden mask', 0], ['a woven basket', 0], ['sandpaper glued into a collage', 0], ['a knitted wool scarf', 0], ['a clay pot with fingerprints in it', 0],
    ['a pencil drawing of a furry cat', 1], ['a printed photo of rough tree bark', 1], ['stippled dots that look like sand', 1], ['a painting of a brick wall on smooth board', 1], ['a screen showing a close-up of a rock', 1], ['hatching that makes a drawn rope look twisted', 1]];
  G('design.texture-element', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1 || (L === 3 && R.coin())) {
      var it = L === 3 ? R.pick(TEX_ITEMS.filter(function (t) { return /photo|screen|painting of/.test(t[0]); })) : R.pick(TEX_ITEMS);
      return P('Is the texture of <b>' + it[0] + '</b> actual or implied?', mc(['Actual: you could feel it', 'Implied: it only looks that way'], it[1], true),
        [it[1] ? 'Run a finger across it: the surface is flat or smooth.' : 'Run a finger across it: you would feel the bumps or ridges.', it[1] ? 'So the texture is implied.' : 'So the texture is actual.'], 'Would you feel it with your finger?');
    }
    if (L === 2) {
      var pool = ['fur', 'wood', 'sand', 'brick', 'scales'], ks = R.sample(pool, 3), want = R.pick(ks), Ak = A();
      return P('These swatches are drawn with marks on smooth paper. Which one shows implied <b>' + Ak.TEXTURES[want].name + '</b>?', mc(letters(3), ks.indexOf(want), true),
        ks.map(function (k, i) { return letter(i) + ': ' + Ak.TEXTURES[k].name + ' (' + Ak.TEXTURES[k].mark + ').'; }), Ak.TEXTURES[want].name + ' is drawn with ' + Ak.TEXTURES[want].mark + '.',
        { name: 'ar-marks', opts: { kinds: ks, quiet: true, interactive: false, columns: 3 } });
    }
    var act = R.pick(TEX_ITEMS.filter(function (t) { return !t[1]; })), imp = R.sample(TEX_ITEMS.filter(function (t) { return t[1]; }), 2);
    return P('Which of these has <b>actual</b> texture?', ask(R, cap(act[0]), imp.map(function (t) { return cap(t[0]); })),
      [cap(act[0]) + ' can be felt.', 'The others are flat surfaces that only look textured.'], 'Which one would feel bumpy?');
  });

  // objects and the light they reflect (a simple RGB teaching model)
  var OBJ = [['a white sheet of paper', 'rgb', 'white'], ['a red tomato', 'r', 'red'], ['a green leaf', 'g', 'green'], ['a blue cup', 'b', 'blue'], ['a yellow banana', 'rg', 'yellow']];
  var LIGHTS = [['red', 'r'], ['green', 'g'], ['blue', 'b']];
  G('design.color-element', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var o = R.pick(OBJ.slice(1)), c = o[2];
      return P(cap(o[0]) + ' looks ' + c + ' in daylight. Why?', ask(R, 'Its surface reflects mostly ' + c + ' light and absorbs most of the other colors', ['Its surface absorbs ' + c + ' light and reflects the rest', 'It gives off its own ' + c + ' light']),
        ['Daylight holds all the colors.', 'The surface absorbs some and reflects the rest; we see what is reflected.', 'So it reflects mostly ' + c + '.'], 'We see the light that bounces back to our eyes.');
    }
    if (L === 2) {
      var ob = R.pick(OBJ), li = R.pick(LIGHTS), both = ob[1].split('').filter(function (ch) { return li[1].indexOf(ch) >= 0; }).join('');
      var res = both ? li[0] : 'very dark, almost black', wrong = uniq([ob[2], 'very dark, almost black', li[0], 'white'].filter(function (x) { return x !== res; })).slice(0, 2);
      return P('In a dark room, ' + ob[0] + ' is lit only by a pure <b>' + li[0] + '</b> light. What color does it look? (Use the simple model: it can reflect only the light that reaches it.)', ask(R, cap(res), wrong.map(cap)),
        [cap(ob[0]) + ' reflects ' + (ob[2] === 'white' ? 'every color of light' : ob[2] === 'yellow' ? 'red and green light' : 'mostly ' + ob[2] + ' light') + '.', 'Only ' + li[0] + ' light reaches it.',
          both ? 'It reflects that ' + li[0] + ' light, so it looks ' + li[0] + '.' : 'It has almost nothing to reflect, so it looks very dark.'], 'What light reaches it, and can it reflect that light?');
    }
    var pr = R.pick([['the color family (red, blue-green…)', 'Hue'], ['how light or dark the color is', 'Value'], ['how pure or how grayed the color is', 'Saturation']]);
    return P('Which property of color describes <b>' + pr[0] + '</b>?', ask(R, pr[1], ['Hue', 'Value', 'Saturation'].filter(function (x) { return x !== pr[1]; })),
      ['Hue is the color family; value is light or dark; saturation is pure or grayed.', 'So: ' + pr[1] + '.'], 'Family, lightness, purity.');
  });

  // ================================================================ UNIT 2: COLOR THEORY
  G('design.hue-value-saturation', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var Q = R.pick([
        { q: 'Pale pink and fire-engine red are both reds. Which property is the same for both?', right: 'Hue', wrong: ['Value', 'Saturation'], s: 'Both belong to the red family, so the hue is the same; pink is lighter and less pure.' },
        { q: 'Navy and sky blue are both blues. Which property differs most?', right: 'Value', wrong: ['Hue', 'Neither: they are the same color'], s: 'Both are blue (same hue); navy is much darker than sky blue, so value differs most.' },
        { q: 'Changing red to orange changes which property?', right: 'Hue', wrong: ['Value only', 'Saturation only'], s: 'Red and orange are different color families: a change of hue.' },
        { q: 'Mixing a little gray of the same lightness into a bright green mostly lowers its…', right: 'Saturation', wrong: ['Hue', 'Value'], s: 'The green stays green and stays as light; it becomes less pure. That is lower saturation.' }]);
      return P(Q.q, ask(R, Q.right, Q.wrong), [Q.s], 'Hue is the family, value is light or dark, saturation is pure or grayed.');
    }
    var k = R.pick(['red', 'orange', 'green', 'blue', 'violet', 'blue-green', 'red-violet']), c = hex(k);
    if (L === 2) {
      var kind = R.pick(['tint', 'shade', 'gray']), other, askV;
      if (kind === 'tint') other = Ak.tint(c, 0.6); else if (kind === 'shade') other = Ak.shade(c, 0.55); else other = Ak.mixHex(c, Ak.grayOf(c), 0.65);
      var order = R.coin() ? [c, other] : [other, c], pureIdx = order.indexOf(c), otherIdx = 1 - pureIdx;
      if (kind === 'gray') return P('Both swatches are ' + hueName(k) + ' and about equally light. Which one is <b>more saturated</b>?', mc(['A', 'B'], pureIdx, true),
        ['The hue and the value are about the same.', 'Swatch ' + letter(otherIdx) + ' has gray mixed in, so it is duller.', 'Swatch ' + letter(pureIdx) + ' is purer: more saturated.'], 'Which one looks purer, less grayed?', swatches(order));
      askV = R.coin();
      if (kind === 'tint') return askV
        ? P('Both swatches are ' + hueName(k) + '. Which one has the <b>higher value</b> (is lighter)?', mc(['A', 'B'], otherIdx, true), ['Swatch ' + letter(otherIdx) + ' has white mixed in: a tint.', 'A tint is lighter, so it has the higher value.'], 'Higher value means lighter.', swatches(order))
        : P('Swatch ' + letter(otherIdx) + ' is ' + hueName(k) + ' with white mixed in. Compared with the pure color, it is…', ask(R, 'Lighter and less saturated', ['Lighter and more saturated', 'Darker and less saturated']), ['White raises the value: lighter.', 'White also dilutes the color: less saturated.', 'This is the trouble spot: a pale color is light AND low in saturation.'], 'What does white do to value? To purity?', swatches(order));
      return P('Both swatches are ' + hueName(k) + '. Which one has the <b>lower value</b> (is darker)?', mc(['A', 'B'], otherIdx, true), ['Swatch ' + letter(otherIdx) + ' has black mixed in: a shade.', 'It is darker, so it has the lower value.'], 'Lower value means darker.', swatches(order));
    }
    var D = R.pick([
      { n: 'pale pink', c: Ak.tint(hex('red'), 0.65), right: 'Red hue, light value, low saturation', wrong: ['Red hue, dark value, high saturation', 'Red hue, light value, high saturation'] },
      { n: 'navy', c: Ak.shade(hex('blue'), 0.5), right: 'Blue hue, dark value, fairly strong saturation', wrong: ['Blue hue, light value, low saturation', 'Violet hue, light value, high saturation'] },
      { n: 'olive', c: Ak.shade(Ak.mixHex(hex('yellow-green'), '#808080', 0.45), 0.35), right: 'Yellow-green hue, middle-dark value, low saturation', wrong: ['Yellow-green hue, light value, high saturation', 'Red hue, dark value, high saturation'] },
      { n: 'fire-engine red', c: hex('red'), right: 'Red hue, middle value, high saturation', wrong: ['Red hue, light value, low saturation', 'Red hue, very dark value, low saturation'] },
      { n: 'dusty blue', c: Ak.mixHex(hex('blue'), Ak.grayOf(hex('blue')), 0.6), right: 'Blue hue, middle value, low saturation', wrong: ['Blue hue, light value, high saturation', 'Green hue, dark value, high saturation'] }]);
    return P('Which description fits this color (' + D.n + ')?', ask(R, D.right, D.wrong), ['Hue: which family? Value: how light or dark? Saturation: how pure?', D.n + ': ' + D.right.toLowerCase() + '.'], 'Answer the three questions one at a time.', swatches([D.c]));
  });

  G('design.color-wheel', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var k = R.pick(wheelKeys()), kind = Ak.hue(k).kind;
      return P('On the painter\'s wheel, is <b>' + hueName(k) + '</b> a primary, secondary or tertiary color?', ask(R, cap(kind), ['primary', 'secondary', 'tertiary'].filter(function (x) { return x !== kind; }).map(cap)),
        [kind === 'primary' ? 'Red, yellow and blue are the painter\'s primaries.' : kind === 'secondary' ? 'Orange, green and violet each mix from two primaries: secondaries.' : 'It mixes a primary with the secondary beside it, and its name has two parts: a tertiary.'], 'Primaries: red, yellow, blue. Secondaries: orange, green, violet.');
    }
    if (L === 2) {
      var six = ['red', 'orange', 'yellow', 'green', 'blue', 'violet'], b = R.pick(six), w = R.sample(six.filter(function (x) { return x !== b; }), 2);
      return P('One wedge of this six-hue painter\'s wheel is missing. Which hue belongs in the wedge with the "?"', ask(R, cap(b), w.map(cap)),
        ['Look at the two neighbors of the empty wedge.', 'The missing hue sits between them: ' + b + '.'], 'Each secondary sits between the two primaries that mix it.',
        { name: 'ar-wheel', opts: { segments: 6, blank: [b], quiet: true, interactive: false, label: 'A six-hue color wheel with one wedge missing' } });
    }
    if (R.chance(0.3)) return P('Which statement about color wheels is true?', ask(R, 'Different wheels (painter\'s, printer\'s, light) put different primaries at the points', ['There is one true color wheel, set by nature', 'Every color wheel has red, yellow and blue as primaries']),
      ['The wheel is a tool. Painters use red, yellow and blue; printers use cyan, magenta and yellow; light uses red, green and blue.'], 'Think about screens and printers.');
    var i = R.int(0, 11), ks = [at(i - 1), at(i + 1)], m = at(i), wr = R.sample(wheelKeys().filter(function (x) { return x !== m && ks.indexOf(x) < 0; }), 2);
    if (R.coin()) return P('On the 12-hue painter\'s wheel, which hue sits between <b>' + listText(ks) + '</b>?', ask(R, hueName(m), names(wr)), ['Going around the wheel: ' + names([ks[0], m, ks[1]]).join(', ') + '.'], 'Picture the wheel: red, red-orange, orange, yellow-orange, yellow…');
    return P('One wedge of this 12-hue painter\'s wheel is missing. Which hue belongs there?', ask(R, hueName(m), names(wr)), ['Its neighbors are ' + listText(ks) + '.', 'The hue between them is ' + hueName(m) + '.'], 'Read the neighbors on each side.',
      { name: 'ar-wheel', opts: { segments: 12, blank: [m], quiet: true, interactive: false, label: 'A 12-hue color wheel with one wedge missing' } });
  });

  var TERT = [['red', 'orange'], ['yellow', 'orange'], ['yellow', 'green'], ['blue', 'green'], ['blue', 'violet'], ['red', 'violet']];
  G('design.tertiary-colors', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    var pair = R.pick(TERT), m = Ak.mixPaint(pair[0], pair[1]).key, others = R.sample(Ak.TERTIARIES.filter(function (t) { return t !== m; }), 2);
    if (L === 1) return P('On the painter\'s wheel, what do <b>' + pair[0] + '</b> and <b>' + pair[1] + '</b> paint make?', ask(R, hueName(m), names(others)),
      [cap(pair[0]) + ' is a primary; ' + pair[1] + ' is the secondary beside it.', 'Their mixture is the tertiary between them, primary first: ' + hueName(m) + '.'], 'Name the primary first.',
      { name: 'ar-wheel', opts: { mode: 'mix', a: pair[0], b: pair[1], quiet: true, interactive: false, hideResult: true, label: 'Two paints on a palette, with the mixture hidden' } });
    if (L === 2) {
      if (R.coin()) {
        var swapped = pair[1] + '-' + pair[0];
        return P('By the usual color-wheel convention, what is the name of the tertiary between ' + pair[0] + ' and ' + pair[1] + '?', ask(R, hueName(m), [swapped, pair[1]]),
          ['A tertiary\'s name puts the primary first.', cap(pair[0]) + ' is the primary, so: ' + hueName(m) + '.'], 'Which of the two is a primary?');
      }
      var wrongPairs = [pair[0] + ' and ' + Ak.complement(pair[0]), pair[1] + ' and ' + Ak.complement(pair[1])];
      return P('Which two paints mix to make <b>' + hueName(m) + '</b>?', ask(R, pair[0] + ' and ' + pair[1], wrongPairs), ['A tertiary is a primary plus the secondary beside it.', hueName(m) + ' = ' + pair[0] + ' + ' + pair[1] + '.'], 'Read the name: it tells you both parents.');
    }
    var c = R.pick(['red', 'yellow', 'blue']), comp = Ak.complement(c), sec = R.pick(Ak.SECONDARIES.filter(function (s) { return s !== comp; })), tm = Ak.mixPaint(c, sec).key;
    var good = c + ' + ' + sec, bad1 = c + ' + ' + comp, prim2 = R.pick(Ak.PRIMARIES.filter(function (p) { return p !== c; })), bad2 = c + ' + ' + prim2;
    return P('Which mixture makes a <b>tertiary</b> color on the painter\'s wheel?', ask(R, good, [bad1, bad2]),
      [good + ' = ' + hueName(tm) + ', a tertiary (a primary with a neighboring secondary).', bad1 + ': complements, which make a brown or gray.', bad2 + ': two primaries, which make a secondary (' + Ak.mixPaint(c, prim2).name + ').'], 'A tertiary needs a primary and the secondary next to it.');
  });

  G('design.tints-tones-shades', function (R, ctx) {
    var L = ctx.level || 1, Ak = A(), k = R.pick(['red', 'orange', 'green', 'blue', 'violet', 'blue-green']);
    var ADD = { tint: 'white', tone: 'gray', shade: 'black' };
    if (L === 1) {
      var t = R.pick(['tint', 'tone', 'shade']);
      return P(cap(hueName(k)) + ' paint plus <b>' + ADD[t] + '</b> makes a…', ask(R, t, ['tint', 'tone', 'shade'].filter(function (x) { return x !== t; })),
        ['Tint = color + white; tone = color + gray; shade = color + black.', 'So ' + ADD[t] + ' makes a ' + t + '.'], 'Tint and white both… shade and black both…');
    }
    if (L === 2) {
      var only = R.pick(['tints', 'tones', 'shades']), was = { tints: 'white', tones: 'gray', shades: 'black' }[only];
      return P('In Row A, more and more of something was mixed into ' + hueName(k) + '. What was added?', ask(R, cap(was), ['white', 'gray', 'black'].filter(function (x) { return x !== was; }).map(cap)),
        [only === 'tints' ? 'The row gets lighter and paler: white was added (tints).' : only === 'shades' ? 'The row gets darker: black was added (shades).' : 'The row gets grayer and duller, toward middle gray: gray was added (tones).'], 'Does it get lighter, darker, or grayer?',
        { name: 'ar-wheel', opts: { mode: 'tints', hue: k, only: only, quiet: true, interactive: false, label: 'A row of mixtures of one hue' } });
    }
    if (R.coin()) {
      var c = hex(k), sw = { tint: Ak.tint(c, 0.55), tone: Ak.tone(c, 0.6), shade: Ak.shade(c, 0.55) }, ord = R.shuffle(['tint', 'tone', 'shade']), want = R.pick(['tint', 'shade']);
      return P('Which swatch is a <b>' + want + '</b> of ' + hueName(k) + '?', mc(letters(3), ord.indexOf(want), true),
        ord.map(function (x, i) { return letter(i) + ': ' + hueName(k) + ' + ' + ADD[x] + ' (a ' + x + ').'; }), want === 'tint' ? 'A tint is lighter than the pure color.' : 'A shade is darker than the pure color.', swatches(ord.map(function (x) { return sw[x]; })));
    }
    var W2 = R.pick([['Maroon is red with black mixed in.', 'shade'], ['Pink is red with white mixed in.', 'tint'], ['Dusty rose is red with gray mixed in.', 'tone'], ['Sky blue is blue with white mixed in.', 'tint'], ['Forest green is green with black mixed in.', 'shade']]);
    return P(W2[0] + ' In art, is it a tint, a tone or a shade?', ask(R, cap(W2[1]), ['tint', 'tone', 'shade'].filter(function (x) { return x !== W2[1]; }).map(cap)),
      ['In everyday talk "shade" can mean any version of a color, but in art the words are exact.', 'White makes a tint, gray a tone, black a shade: this is a ' + W2[1] + '.'], 'What was added: white, gray or black?');
  });

  // a palette (hex list) for a scheme kind on a base hue; monochromatic uses values of one hue
  function schemeHexes(kind, base) { var Ak = A(); if (kind === 'monochromatic') { var c = hex(base); return [Ak.tint(c, 0.6), Ak.tint(c, 0.3), c, Ak.shade(c, 0.35), Ak.shade(c, 0.6)]; } return Ak.scheme(kind, base).map(hex); }
  G('design.monochromatic', function (R, ctx) {
    var L = ctx.level || 1, Ak = A(), base = R.pick(wheelKeys());
    if (L === 1) {
      var kinds = R.shuffle(['monochromatic', 'analogous', 'complementary']);
      return P('Which row is <b>monochromatic</b>?', mc(letters(3), kinds.indexOf('monochromatic'), true),
        kinds.map(function (x, i) { return 'Row ' + letter(i) + ': ' + (x === 'monochromatic' ? 'one hue in several values' : x === 'analogous' ? 'three neighboring hues' : 'two opposite hues') + '.'; }), 'Find the row that uses only one hue.', palettes(kinds.map(function (x) { return schemeHexes(x, base); })));
    }
    if (L === 2) {
      var other = Ak.complement(base), Q = R.pick([
        { q: 'A painting uses only light ' + hueName(base) + ', middle ' + hueName(base) + ' and very dark ' + hueName(base) + '. Is its color scheme monochromatic?', v: 0, s: 'One hue in several values is monochromatic.' },
        { q: 'Does a monochromatic scheme have to be black, white and gray?', v: 1, s: 'No. Any single hue in many values (all blues, all greens) is monochromatic.' },
        { q: 'A poster uses pale ' + hueName(base) + ', ' + hueName(base) + ' and dark ' + hueName(base) + ', plus one patch of ' + hueName(other) + '. Is the scheme monochromatic?', v: 1, s: cap(hueName(other)) + ' is a second hue, so the scheme is no longer one hue.' }]);
      return P(Q.q, mc(['Yes', 'No'], Q.v, true), [Q.s], 'Count the hues, not the values.');
    }
    var kind = R.pick(['monochromatic', 'analogous', 'complementary', 'triadic']), cols = schemeHexes(kind, base);
    if (kind !== 'monochromatic') cols = R.shuffle(cols);
    return P('What color scheme do these swatches form (on the painter\'s wheel)?', ask(R, cap(kind), ['monochromatic', 'analogous', 'complementary', 'triadic'].filter(function (x) { return x !== kind; }).map(cap)),
      [kind === 'monochromatic' ? 'Every swatch is the same hue, ' + hueName(base) + ', in different values.' : 'The hues are ' + listText(Ak.scheme(kind, base)) + '.', kind === 'analogous' ? 'They are neighbors on the wheel: analogous.' : kind === 'complementary' ? 'They sit opposite each other: complementary.' : kind === 'triadic' ? 'They are evenly spaced, four steps apart: triadic.' : 'One hue: monochromatic.'],
      'Count the hues, then see where they sit on the wheel.', swatches(cols));
  });

  var RGB_COMP = { red: 'cyan', green: 'magenta', blue: 'yellow' };
  G('design.complementary', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      if (R.coin()) {
        var i = R.int(0, 11), right = (i + 6) % 12, near = [(i + 5) % 12, (i + 7) % 12];
        return P('On this 12-hue painter\'s wheel, which wedge is the complement of wedge <b>' + letter12(i) + '</b>?', ask(R, letter12(right), near.map(letter12)),
          ['A complement sits straight across the wheel: 6 steps away.', 'Wedge ' + letter12(i) + ' is ' + hueName(at(i)) + '; straight across is wedge ' + letter12(right) + ', ' + hueName(at(right)) + '.'], 'Go straight across, through the center.',
          { name: 'ar-wheel', opts: { segments: 12, labels: 'letters', quiet: true, interactive: false, label: 'A 12-hue wheel with lettered wedges' } });
      }
      var k = R.pick(Ak.PRIMARIES.concat(Ak.SECONDARIES)), c = Ak.complement(k), w = R.sample(Ak.PRIMARIES.concat(Ak.SECONDARIES).filter(function (x) { return x !== k && x !== c; }), 2);
      return P('On the painter\'s wheel, what is the complement of <b>' + k + '</b>?', ask(R, cap(c), w.map(cap)), ['Complements sit straight across the wheel.', 'Across from ' + k + ' is ' + c + '.'], 'Red–green, yellow–violet, blue–orange.');
    }
    if (L === 2) {
      var t = R.pick(Ak.TERTIARIES), ct = Ak.complement(t), wt = R.sample(Ak.TERTIARIES.filter(function (x) { return x !== t && x !== ct; }), 2);
      return P('On the 12-hue painter\'s wheel, what is the complement of <b>' + hueName(t) + '</b>?', ask(R, hueName(ct), names(wt)),
        ['Count 6 steps around the wheel from ' + hueName(t) + '.', 'Straight across is ' + hueName(ct) + '. (Its two parts are the complements of ' + hueName(t) + '\'s two parts.)'], 'Find the complement of each half of the name.');
    }
    var lk = R.pick(['red', 'green', 'blue']), light = R.coin();
    if (light) return P('In <b>light</b> (red, green and blue light, as on a screen), what is the complement of ' + lk + '?', ask(R, cap(RGB_COMP[lk]), [cap(Ak.complement(lk)), lk === 'blue' ? 'Violet' : 'Yellow']),
      ['In light, complements mix to white.', cap(lk) + ' + ' + RGB_COMP[lk] + ' light = white, so ' + RGB_COMP[lk] + ' is the complement in light.', 'On the painter\'s wheel the answer would be ' + Ak.complement(lk) + ': always say which wheel.'], 'Which light added to ' + lk + ' makes white?');
    var pb = R.pick(['blue', 'yellow', 'red']), pc = Ak.complement(pb), lightAns = { blue: 'yellow', yellow: 'blue', red: 'cyan' }[pb];
    return P('On the <b>painter\'s wheel</b>, what is the complement of ' + pb + '?', ask(R, cap(pc), [cap(lightAns), cap(R.pick(Ak.PRIMARIES.filter(function (x) { return x !== pb && x !== lightAns; })))]),
      ['On the painter\'s wheel, straight across from ' + pb + ' is ' + pc + '.', cap(lightAns) + ' is its complement in light, a different wheel.'], 'Painter\'s wheel: red–green, yellow–violet, blue–orange.');
  });
  function letter12(i) { return 'ABCDEFGHIJKL'.charAt(i); }

  G('design.analogous', function (R, ctx) {
    var L = ctx.level || 1, Ak = A(), i = R.int(0, 11);
    var ana = [at(i - 1), at(i), at(i + 1)], tri = Ak.scheme('triadic', at(i)), mixed = [at(i), at(i + 6), at(i + 1)];
    if (L === 1) {
      return P('Which set of hues is <b>analogous</b> on the painter\'s wheel?', ask(R, names(ana).join(', '), [names(tri).join(', '), names(mixed).join(', ')]),
        ['Analogous hues are neighbors on the wheel, each one step apart.', names(ana).join(', ') + ' sit side by side.'], 'Look for three neighbors.');
    }
    if (L === 2) {
      if (R.coin()) {
        var trio = R.pick([['red', 'yellow', 'blue'], ['orange', 'green', 'violet']]);
        return P('A student says ' + listText(trio) + ' are analogous because they sit together in a crayon box. On the painter\'s wheel, what are they?', ask(R, 'A triad: evenly spaced, not neighbors', ['Analogous: neighbors on the wheel', 'Complementary: opposites']),
          ['On the wheel these three are four steps apart from each other.', 'Evenly spaced hues form a triad; analogous hues are next to each other.'], 'Count the steps between them on the wheel.');
      }
      return P('Complete the analogous scheme on the 12-hue painter\'s wheel: <b>' + hueName(at(i - 1)) + ', ?, ' + hueName(at(i + 1)) + '</b>', ask(R, hueName(at(i)), names([at(i + 6), at(i + 3)])),
        ['The missing hue sits between ' + hueName(at(i - 1)) + ' and ' + hueName(at(i + 1)) + '.', 'That is ' + hueName(at(i)) + '.'], 'Which hue is the neighbor of both?');
    }
    var kinds = R.shuffle(['analogous', 'triadic', 'split']);
    return P('Which row is <b>analogous</b>?', mc(letters(3), kinds.indexOf('analogous'), true),
      kinds.map(function (x, j) { return 'Row ' + letter(j) + ': ' + names(Ak.scheme(x, at(i))).join(', ') + ' (' + Ak.SCHEMES[x].toLowerCase() + ').'; }), 'Find the row of close relatives.',
      palettes(kinds.map(function (x) { return Ak.scheme(x, at(i)).map(hex); })));
  });

  G('design.triadic', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var b = R.pick(Ak.PRIMARIES.concat(Ak.SECONDARIES)), tri = Ak.scheme('triadic', b), wrong1 = Ak.scheme('analogous', b), wrong2 = [b, Ak.complement(b), at(Ak.hueIdx(b) + 2)];
      return P('Which three hues form a <b>triad</b> that includes ' + b + '?', ask(R, names(tri).join(', '), [names(wrong1).join(', '), names(wrong2).join(', ')]),
        ['A triad is three hues evenly spaced: four steps apart on the 12-hue wheel.', cap(b) + '\'s triad: ' + names(tri).join(', ') + '.'], Ak.hue(b).kind === 'primary' ? 'The three primaries form a triad.' : 'The three secondaries form a triad.');
    }
    if (L === 2) {
      var t = R.pick(Ak.TERTIARIES), tt = Ak.scheme('triadic', t), bad = [t, at(Ak.hueIdx(t) + 3), at(Ak.hueIdx(t) + 6)], an = Ak.scheme('analogous', t);
      return P('On the 12-hue painter\'s wheel, which set is a <b>triad</b> that includes ' + hueName(t) + '?', ask(R, names(tt).join(', '), [names(bad).join(', '), names(an).join(', ')]),
        ['Count four steps each time: ' + names(tt).join(' → ') + ' → back to ' + hueName(t) + '.', 'Three steps apart is not even spacing on a 12-hue wheel (3 + 3 + 6).'], 'Four steps, four steps, four steps.');
    }
    var base = R.pick(wheelKeys());
    if (R.coin()) {
      var sp = Ak.scheme('split', base), w1 = [base, Ak.complement(base)], w2 = Ak.scheme('analogous', Ak.complement(base));
      return P('What is the <b>split-complementary</b> scheme for ' + hueName(base) + ' on the painter\'s wheel?', ask(R, names(sp).join(', '), [names(w1).join(', '), names(w2).join(', ')]),
        [cap(hueName(base)) + '\'s complement is ' + hueName(Ak.complement(base)) + '.', 'Its two neighbors are ' + listText(sp.slice(1)) + '.', 'Split-complementary: ' + names(sp).join(', ') + '.'], 'Find the complement, then step to each side of it.');
    }
    var kind = R.pick(['triadic', 'split', 'analogous', 'complementary']), set = R.shuffle(Ak.scheme(kind, base));
    return P('What scheme do <b>' + listText(set) + '</b> form on the painter\'s wheel?', ask(R, Ak.SCHEMES[kind], ['triadic', 'split', 'analogous', 'complementary'].filter(function (x) { return x !== kind; }).slice(0, 2).map(function (x) { return Ak.SCHEMES[x]; })),
      ['Place them on the wheel and count the steps between them.', 'They form a ' + Ak.SCHEMES[kind].toLowerCase() + ' scheme.'], 'Even spacing: triad. Neighbors: analogous. A hue plus the two beside its opposite: split.');
  });

  G('design.temperature', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      if (R.coin()) {
        var wantW = R.coin(), rt = R.pick(wantW ? Ak.WARM : Ak.COOL), wr0 = R.sample(wantW ? Ak.COOL : Ak.WARM, 2);
        return P('Which of these hues is <b>' + (wantW ? 'warm' : 'cool') + '</b>?', ask(R, cap(hueName(rt)), names(wr0).map(cap)),
          [cap(hueName(rt)) + ' is ' + (wantW ? 'warm, like fire and sun.' : 'cool, like water and shade.'), listText(wr0) + (wantW ? ' are cool.' : ' are warm.')], 'Warm: reds, oranges, yellows. Cool: greens, blues, violets.');
      }
      var k = R.pick(Ak.WARM.concat(Ak.COOL)), t = Ak.temperature(k);
      return P('Is <b>' + hueName(k) + '</b> a warm or a cool color?', mc(['Warm', 'Cool'], t === 'warm' ? 0 : 1, true),
        [t === 'warm' ? 'Reds, oranges and yellows, the colors of fire and sun, read warm.' : 'Greens, blues and violets, the colors of water and shade, read cool.'], 'Fire and sun, or water and shade?', swatches([hex(k)]));
    }
    if (L === 2) {
      var C = R.pick([{ m: 'violet', cool: 'blue', warm: 'red' }, { m: 'green', cool: 'blue', warm: 'yellow' }, { m: 'red-violet', cool: 'violet', warm: 'red' }, { m: 'yellow-green', cool: 'green', warm: 'yellow' }]);
      var swap = R.coin(), pairs = swap ? [[hex(C.warm), hex(C.m)], [hex(C.cool), hex(C.m)]] : [[hex(C.cool), hex(C.m)], [hex(C.warm), hex(C.m)]], right = swap ? 1 : 0;
      return P('The same ' + hueName(C.m) + ' square sits on ' + (swap ? hueName(C.warm) + ' (A) and on ' + hueName(C.cool) + ' (B)' : hueName(C.cool) + ' (A) and on ' + hueName(C.warm) + ' (B)') + '. In which panel does it look <b>warmer</b>?', mc(['A', 'B'], right, true),
        ['Temperature is relative: a color looks warmer next to a cooler neighbor.', cap(hueName(C.cool)) + ' is cooler than ' + hueName(C.m) + ', so beside it the ' + hueName(C.m) + ' shows its warm side.', 'So panel ' + letter(right) + '.'], 'Next to which neighbor does the square seem warmer by comparison?',
        { name: 'design-swatches', opts: { mode: 'inset', pairs: pairs, quiet: true, interactive: false } });
    }
    var Q = R.pick([
      { q: 'Two reds: one leans toward orange, the other toward violet. Which is the cooler red?', right: 'The red that leans toward violet', wrong: ['The red that leans toward orange', 'Neither: all reds are equally warm'] },
      { q: 'On the painter\'s wheel, which hue sits on the border between warm and cool, so it can look either way?', right: R.pick(['Yellow-green', 'Red-violet']), wrong: ['Orange', 'Blue'] },
      { q: 'In Henry Ossawa Tanner\'s <i>The Banjo Lesson</i> (1893), cool bluish light comes from a window at the left. The light from the fireplace at the right is…', right: 'Warm and yellowish', wrong: ['Cool and bluish too', 'Pure white'] },
      { q: 'Is a color warm or cool in itself, no matter what surrounds it?', right: 'No: temperature also depends on the neighbors', wrong: ['Yes: every color is always warm or always cool', 'Only black and white change temperature'] },
      { q: 'Two blues: one leans toward green, the other toward violet. Which is the warmer blue?', right: 'The blue that leans toward violet (toward red)', wrong: ['The blue that leans toward green', 'Neither: all blues are equally cool'] },
      { q: 'Two yellows: one leans toward orange, the other toward green. Which is the cooler yellow?', right: 'The yellow that leans toward green', wrong: ['The yellow that leans toward orange', 'Neither: all yellows are equally warm'] },
      { q: 'A violet patch is surrounded by bright red. Compared with how it looks on blue, it will look…', right: 'Cooler', wrong: ['Warmer', 'Exactly the same'] },
      { q: 'A green patch is surrounded by blue. Compared with how it looks on yellow, it will look…', right: 'Warmer', wrong: ['Cooler', 'Exactly the same'] }]);
    return P(Q.q, ask(R, Q.right, Q.wrong), ['Warm: reds, oranges, yellows. Cool: greens, blues, violets. Temperature is also relative to neighbors.', 'Answer: ' + Q.right + '.'], 'Compare with the neighbors.');
  });

  G('design.simultaneous-contrast', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var dk = R.pick(['#151515', '#232323', '#0d1b2a', '#2b1d12']), lt = R.pick(['#f4f4f4', '#fffbe8', '#eef4fa']), darkLeft = R.coin(), grounds = darkLeft ? [dk, lt] : [lt, dk], wantLighter = R.coin(), mid = R.pick(['#808080', '#8a8a8a', '#777777', '#939393']);
      var right = wantLighter ? (darkLeft ? 0 : 1) : (darkLeft ? 1 : 0);
      return P('Both small squares are exactly the same gray. Which one looks <b>' + (wantLighter ? 'lighter' : 'darker') + '</b>?', mc(['The one on the left', 'The one on the right'], right, true),
        ['A dark ground makes a gray look lighter; a light ground makes it look darker.', 'So the ' + (right === 0 ? 'left' : 'right') + ' one looks ' + (wantLighter ? 'lighter' : 'darker') + '.'], 'The surroundings push the gray the other way.',
        { name: 'ar-wheel', opts: { mode: 'contrast', grounds: grounds, color: mid, quiet: true, interactive: false, label: 'The same gray square on two different grounds' } });
    }
    if (L === 2) {
      var g = R.pick([['red', 'greenish'], ['green', 'reddish'], ['yellow', 'violet-tinged'], ['blue', 'yellowish']]), w = ['greenish', 'reddish', 'violet-tinged', 'yellowish'].filter(function (x) { return x !== g[1]; });
      var own = { red: 'reddish', green: 'greenish', yellow: 'yellowish', blue: 'bluish' }[g[0]];
      return P('A neutral gray square sits on a bright <b>' + g[0] + '</b> ground. Its color tends to look slightly…', ask(R, cap(g[1]), [cap(own === g[1] ? w[0] : own), cap(R.pick(w.filter(function (x) { return x !== own; })))]),
        ['On a colored ground, a neutral takes on a hint of the ground\'s complement.', 'Next to ' + g[0] + ', the gray looks ' + g[1] + '.'], 'The eye pushes the gray away from its surroundings.');
    }
    var Q = R.pick([
      { q: 'Why should a painter test a mixed color next to the colors that will surround it?', right: 'Neighboring colors change how a color looks', wrong: ['Paint dries a different color on its own', 'A color always looks the same anywhere'] },
      { q: 'Who studied simultaneous contrast while running the dye works of the Gobelins tapestry factory, publishing his law in 1839?', right: 'Michel Eugène Chevreul', wrong: ['Isaac Newton', 'Albert Munsell'] },
      { q: 'Complementary colors placed side by side tend to…', right: 'Make each other look stronger', wrong: ['Cancel into gray', 'Look exactly as they do alone'] },
      { q: 'A middle gray on a white page looks…', right: 'Darker than the same gray on black', wrong: ['Lighter than the same gray on black', 'Exactly the same as on black'] },
      { q: nm(R) + ' mixes a gray on a white palette. On the painting it sits on a black background. How will it look there?', right: 'Lighter than it looked on the palette', wrong: ['Darker than it looked on the palette', 'Exactly the same'] },
      { q: 'Which book by Josef Albers (1963) is built on exercises that make one color look like two?', right: 'Interaction of Color', wrong: ['Opticks', 'A Color Notation'] },
      { q: 'Why does the eye exaggerate the difference between neighboring colors?', right: 'Cells that respond to one area are damped by their neighbors (lateral inhibition)', wrong: ['Paint changes color when it touches another paint', 'The eye sees only one color at a time'] }]);
    return P(Q.q, ask(R, Q.right, Q.wrong), ['Simultaneous contrast: the eye exaggerates differences between neighbors.', 'Answer: ' + Q.right + '.'], 'Colors are never seen alone.');
  });

  // ================================================================ UNIT 3: MIXING PAINT AND MIXING LIGHT
  var INKS = { c: 'cyan', m: 'magenta', y: 'yellow' }, LIGHTN = { r: 'red', g: 'green', b: 'blue' };
  G('design.subtractive', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var pr = R.sample(Ak.PRIMARIES, 2), m = Ak.mixPaint(pr[0], pr[1]).key, w = Ak.SECONDARIES.filter(function (s) { return s !== m; });
      return P(R.pick(['On the painter\'s wheel, what', nm(R) + ' mixes two paints. On the painter\'s wheel, what']) + ' do <b>' + pr[0] + '</b> and <b>' + pr[1] + '</b> paint make?', ask(R, cap(m), w.map(cap)),
        ['Two primaries make the secondary between them on the wheel.', cap(pr[0]) + ' + ' + pr[1] + ' = ' + m + '.'], 'Find the color between them on the wheel.');
    }
    if (L === 2) {
      var Q = R.pick([
        { q: 'You keep mixing more and more different paints together. The mixture moves toward…', right: 'Darker and duller', wrong: ['Brighter and lighter', 'Pure white'] },
        { q: 'Why does mixing paints usually make the color darker?', right: 'Each pigment absorbs more of the light', wrong: ['Each pigment adds more light', 'Paint gets darker as it dries'] },
        { q: 'You want to keep a mixed color bright. What helps most?', right: 'Mix as few paints as possible, and mix neighbors on the wheel', wrong: ['Mix in a little of every color', 'Add black'] },
        { q: 'Mixing two complements, such as ' + R.pick(['red and green', 'blue and orange', 'yellow and violet']) + ', in paint makes…', right: 'A brown or gray (a neutral)', wrong: ['A brighter secondary', 'White'] }]);
      return P(Q.q, ask(R, Q.right, Q.wrong), ['Pigments subtract: each absorbs some light and reflects the rest.', 'More pigments absorb more, so: ' + Q.right.toLowerCase() + '.'], 'Paint subtracts light.');
    }
    if (R.coin()) {
      var pair = R.pick(['cm', 'my', 'cy']), res = Ak.mixInk(pair).name, ws = ['blue', 'red', 'green'].filter(function (x) { return x !== res; });
      return P('Printing inks: <b>' + INKS[pair[0]] + '</b> and <b>' + INKS[pair[1]] + '</b> overlap on white paper. What color is the overlap?', ask(R, cap(res), ws.map(cap)),
        [cap(INKS[pair[0]]) + ' and ' + INKS[pair[1]] + ' each absorb one part of the light.', 'What is left to reflect is ' + res + '.'], 'Cyan + magenta = blue; magenta + yellow = red; cyan + yellow = green.');
    }
    var Q2 = R.pick([['Yellow paint looks yellow partly because it absorbs which light?', 'Blue', ['Yellow', 'Red']], ['Blue and yellow paint make green. Which light do both of them reflect?', 'Green', ['Red', 'Violet']]]);
    return P(Q2[0], ask(R, Q2[1], Q2[2]), ['A paint reflects the light we see and absorbs the rest.', 'Answer: ' + Q2[1].toLowerCase() + '.'], 'Think about what each paint absorbs and reflects.');
  });

  G('design.additive', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var pair = R.pick(['rg', 'gb', 'rb', 'rgb']), res = Ak.mixLight(pair).name, all = ['yellow', 'cyan', 'magenta', 'white'];
      var said = pair.split('').map(function (ch) { return LIGHTN[ch]; });
      return P('<b>' + cap(listText2(said)) + '</b> spotlights overlap on a white wall. What color is the overlap?', ask(R, cap(res), R.sample(all.filter(function (x) { return x !== res; }), 2).map(cap)),
        ['Lights add.', said.join(' + ') + ' light = ' + res + '.'], 'Red + green = yellow; green + blue = cyan; red + blue = magenta; all three = white.');
    }
    if (L === 2) {
      if (R.coin()) return P('A red spotlight and a green spotlight overlap. What color is the overlap?', ask(R, 'Yellow', ['Brown', 'Dark gray']),
        ['These are lights, so they add, not subtract.', 'Red + green light stirs the eye the way yellow light does: yellow.', 'Brown is what red and green PAINT make.'], 'Light adds; paint subtracts.');
      var med = R.pick([['red and green paint mixed on a palette', 'A brown or dull neutral', ['Yellow', 'White']], ['red and green light overlapping on a stage', 'Yellow', ['Brown', 'Black']]]);
      return P('What do you get with <b>' + med[0] + '</b>?', ask(R, med[1], med[2]), [med[0].indexOf('light') >= 0 ? 'Light adds: red + green light = yellow.' : 'Paint subtracts: red and green are complements, so they make a neutral.'], 'Is it light or pigment?');
    }
    var Q = R.pick([
      { q: 'Which two lights mix to make <b>cyan</b>?', right: 'Green and blue', wrong: ['Red and green', 'Red and blue'] },
      { q: 'Which two lights mix to make <b>magenta</b>?', right: 'Red and blue', wrong: ['Red and green', 'Green and blue'] },
      { q: 'What do you see where no light falls at all?', right: 'Black', wrong: ['White', 'Gray-blue'] },
      { q: 'Which of these mixes color by adding light?', right: R.pick(['A phone screen', 'Stage spotlights', 'A computer monitor']), wrong: ['Watercolor paint', 'A printed magazine'] },
      { q: 'Red, green and blue light all overlap. What do you see?', right: 'White', wrong: ['Black', 'Brown'] }]);
    return P(Q.q, ask(R, Q.right, Q.wrong), ['Additive mixing: red, green and blue light add up; all three make white, none makes black.', 'Answer: ' + Q.right + '.'], 'Lights add up.');
  });
  function listText2(a) { return a.length === 2 ? a[0] + ' and ' + a[1] : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }

  var MEDIA = [['a phone screen', 'RGB'], ['stage spotlights', 'RGB'], ['a TV', 'RGB'], ['a computer monitor', 'RGB'], ['magazine printing', 'CMY plus black (CMYK)'], ['an inkjet printer', 'CMY plus black (CMYK)'], ['a printed poster', 'CMY plus black (CMYK)'],
    ['classroom tempera paints on the traditional color wheel', 'RYB'], ['the traditional painter\'s color wheel', 'RYB']];
  G('design.three-primaries', function (R, ctx) {
    var L = ctx.level || 1, SETS = ['RYB', 'CMY plus black (CMYK)', 'RGB'];
    if (L === 1) {
      var Q = R.pick([['light (screens and lamps)', 'Red, green and blue'], ['printing inks', 'Cyan, magenta and yellow (plus black)'], ['the traditional painter\'s wheel', 'Red, yellow and blue']]);
      return P('What are the primaries of <b>' + Q[0] + '</b>?', ask(R, Q[1], ['Red, green and blue', 'Cyan, magenta and yellow (plus black)', 'Red, yellow and blue'].filter(function (x) { return x !== Q[1]; })),
        ['Light: RGB. Printing: CMY plus black. Traditional painting: RYB.'], 'Is it light, ink or traditional paint?');
    }
    if (L === 2) {
      var m = R.pick(MEDIA);
      return P(R.pick(['Which set of primaries does <b>' + m[0] + '</b> use?', nm(R) + ' is working with <b>' + m[0] + '</b>. Which set of primaries makes its colors?']), ask(R, m[1], SETS.filter(function (s) { return s !== m[1]; })),
        [m[1] === 'RGB' ? 'It gives off light, so it mixes red, green and blue light.' : m[1] === 'RYB' ? 'Traditional painting and art classes use red, yellow and blue.' : 'Printing inks use cyan, magenta and yellow, plus black.'], 'Does it give off light, print ink, or follow the traditional painter\'s wheel?');
    }
    var Q2 = R.pick([
      { q: 'Why do printers add black ink (K) to cyan, magenta and yellow?', right: 'CMY together make a muddy dark brown, and black gives crisp text and deep darks with less ink', wrong: ['Black is a primary color of light', 'Without black, nothing could be printed in color'] },
      { q: 'Which statement about primary colors is true?', right: 'Each set of primaries fits a different medium', wrong: ['Red, yellow and blue are the only true primaries', 'Screens and printers use the same primaries'] },
      { q: 'Piet Mondrian\'s grid paintings of about 1930 use red, yellow and blue with black and white. Which set of primaries is that?', right: 'The painter\'s primaries (RYB)', wrong: ['The light primaries (RGB)', 'The printer\'s primaries (CMY)'] },
      { q: 'A poster is designed on a laptop and printed at a shop. Which primaries make its colors on paper?', right: 'Cyan, magenta, yellow and black', wrong: ['Red, green and blue', 'Red, yellow and blue'] }]);
    return P(Q2.q, ask(R, Q2.right, Q2.wrong), ['RYB: traditional painting. CMY + K: printing. RGB: light and screens.', 'Answer: ' + Q2.right + '.'], 'Match the primaries to the medium.');
  });

  G('design.neutrals', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var k = R.pick(Ak.PRIMARIES.concat(Ak.SECONDARIES)), c = Ak.complement(k), w = R.sample(Ak.PRIMARIES.concat(Ak.SECONDARIES).filter(function (x) { return x !== k && x !== c; }), 2);
      return P('A painter wants to gray down a bright <b>' + k + '</b> while keeping it lively. Which paint should she add a touch of?', ask(R, cap(c), w.map(cap)),
        ['A touch of a color\'s complement lowers its saturation.', 'The complement of ' + k + ' on the painter\'s wheel is ' + c + '.'], 'Use the color straight across the wheel.');
    }
    if (L === 2) {
      var k2 = R.pick(wheelKeys()), c2 = Ak.complement(k2), res = Ak.mixPaint(k2, c2).name;
      return P('On the painter\'s wheel, mixing <b>' + hueName(k2) + '</b> and <b>' + hueName(c2) + '</b> in about equal amounts makes…', ask(R, cap(res), ['A brighter ' + hueName(k2), 'White']),
        [cap(hueName(k2)) + ' and ' + hueName(c2) + ' are complements.', 'Together they hold all three primaries and cancel each other\'s color: a neutral brown or gray.'], 'What do opposites do when mixed?');
    }
    var Q = R.pick([
      { q: 'Why might a painter dull a color with a touch of its complement instead of black?', right: 'Black darkens and can shift the hue; the complement grays it while keeping it lively', wrong: ['Black makes colors brighter', 'Complements make colors more saturated'] },
      { q: 'Yellow paint mixed with black often turns…', right: 'Olive green', wrong: ['A darker, brighter yellow', 'Orange'] },
      { q: 'Ochre, sienna and umber are…', right: 'Earth pigments: natural neutral colors made from clays and minerals', wrong: ['The three primaries of light', 'Tertiary colors on the wheel'] },
      { q: 'Which pair of paints would mix to a neutral brown or gray?', right: R.pick(['Blue and orange', 'Red and green', 'Yellow and violet']), wrong: ['Red and orange', 'Blue and green'] }]);
    return P(Q.q, ask(R, Q.right, Q.wrong), ['Complements mixed make neutrals; a little of the complement lowers saturation.', 'Answer: ' + Q.right + '.'], 'Think of opposites on the wheel.');
  });

  G('design.print-screen', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var d = R.pick([['a phone screen', 0], ['a computer monitor', 0], ['a TV', 0], ['a tablet', 0], ['a digital billboard made of lights', 0], ['a printed magazine photo', 1], ['a printed poster', 1], ['a cereal box', 1], ['a color photo in a book', 1], ['a printed flyer', 1]]);
      return P(nm(R) + ' looks at ' + d[0] + ' through a strong magnifying glass. How does it make its colors?', mc(['With tiny red, green and blue lights', 'With tiny dots of cyan, magenta, yellow and black ink'], d[1], true),
        [d[1] ? 'Printing puts dots of ink on paper: subtractive CMYK.' : 'A screen gives off light from red, green and blue subpixels: additive RGB.'], 'Does it glow, or is it ink on paper?');
    }
    if (L === 2) {
      if (R.coin()) {
        var s = R.pick(['rg', 'gb', 'rb']), lnm = Ak.mixLight(s).name, on = s.split('').map(function (ch) { return LIGHTN[ch]; });
        var wr = ['rg', 'gb', 'rb'].filter(function (x) { return x !== s; }).map(function (x) { return x.split('').map(function (ch) { return LIGHTN[ch]; }).join(' and '); });
        return P('A screen shows <b>' + lnm + '</b>. Which of its subpixels are lit?', ask(R, cap(on.join(' and ')), wr.map(cap)), ['Screens add light.', on.join(' + ') + ' light = ' + lnm + '.'], 'Which two lights add up to ' + lnm + '?');
      }
      var p = R.pick(['cm', 'my', 'cy']), nm2 = Ak.mixInk(p).name, inks = p.split('').map(function (ch) { return INKS[ch]; });
      var wr2 = ['cm', 'my', 'cy'].filter(function (x) { return x !== p; }).map(function (x) { return x.split('').map(function (ch) { return INKS[ch]; }).join(' and '); });
      return P('A printer prints a patch of <b>' + nm2 + '</b>. Which inks overlap there?', ask(R, cap(inks.join(' and ')), wr2.map(cap)), ['Printing subtracts.', inks.join(' + ') + ' ink = ' + nm2 + '.'], 'Which two inks leave only ' + nm2 + ' light to reflect?');
    }
    if (R.coin()) {
      var col = R.pick(['#f5871f', '#3aa64a', '#2160b8', '#b42a74', '#7b3294', '#e03127', '#14968a', '#a6cc3a', '#fbb21f', '#4a3fa0']), ks = R.shuffle(['screen', 'print']), want = R.pick(ks);
      return P('Both close-ups show the same color. Which one shows how a <b>' + (want === 'print' ? 'printer' : 'screen') + '</b> makes it?', mc(['A', 'B'], ks.indexOf(want), true),
        [want === 'print' ? 'A printer lays down dots of cyan, magenta, yellow and black ink on white paper.' : 'A screen glows with tiny red, green and blue lights.', 'That is close-up ' + letter(ks.indexOf(want)) + '.'], 'Dots of ink on white, or stripes of light on black?',
        { name: 'design-screen', opts: { color: col, kinds: ks, swatch: false, quiet: true, interactive: false } });
    }
    return P('A designer picks a glowing, very bright green on screen. The printed poster comes out duller. What is the best explanation?', ask(R, 'That green lies outside the range of colors the inks can print (the printer\'s gamut)', ['The printer was broken', 'Printed colors are always brighter than screen colors']),
      ['A screen gives off light; paper only reflects it.', 'Some bright screen colors lie outside what cyan, magenta, yellow and black inks can reach, so they print duller.'], 'Glowing light versus reflecting ink.');
  });

  // ================================================================ UNIT 4: THE PRINCIPLES OF DESIGN
  var BAL_WORKS = [['taj-mahal', 'symmetrical', 'the Taj Mahal (1632 to 1653), seen from the front, with matching minarets at its four corners'], ['chartres-rose', 'radial', 'the north rose window of Chartres Cathedral (about 1230 to 1235), whose glass panels spread out from a center'],
    ['whistler-mother', 'asymmetrical', 'Whistler\'s <i>Arrangement in Grey and Black No. 1</i> (1871): the seated figure on the right, a dark curtain on the left'], ['sun-stone', 'radial', 'the Aztec Sun Stone (about 1502 to 1520), its carvings arranged in rings around a central face'],
    ['rotonda', 'symmetrical', 'Palladio\'s Villa La Rotonda (begun about 1567), with the same columned porch on all four sides'], ['mondrian-rby', 'asymmetrical', 'Mondrian\'s <i>Composition with Red, Blue and Yellow</i> (1930): unequal blocks of color in a grid of black lines'],
    ['fallingwater', 'asymmetrical', 'Frank Lloyd Wright\'s Fallingwater (1935 to 1939), its concrete terraces jutting out at different lengths over a waterfall']];
  G('design.balance-principle', function (R, ctx) {
    var L = ctx.level || 1, BN = { 'balance-sym': 'symmetrical', 'balance-asym': 'asymmetrical', 'balance-radial': 'radial' };
    if (L === 1) {
      var want = R.pick(Object.keys(BN)), ks = R.shuffle(want === 'balance-sym' ? ['balance-sym', 'balance-asym'] : Object.keys(BN));
      var desc = { 'balance-sym': 'mirror halves', 'balance-asym': 'unequal sides that still feel even', 'balance-radial': 'parts spreading out from a center' };
      return P(R.pick(['Which design shows <b>' + BN[want] + '</b> balance?', 'Which design is balanced by <b>' + desc[want] + '</b>?', 'Find the design with <b>' + BN[want] + '</b> balance (' + desc[want] + ').']), mc(letters(ks.length), ks.indexOf(want), true),
        ks.map(function (k, i) { return letter(i) + ': ' + BN[k] + (k === 'balance-sym' ? ' (mirror halves)' : k === 'balance-radial' ? ' (spreading from a center)' : ' (unequal sides that still feel even)') + '.'; }), 'Mirror halves, around a center, or uneven but steady?',
        { name: 'ar-design', opts: { kinds: ks, quiet: true, interactive: false } });
    }
    if (L === 2) {
      var Q = R.pick([
        { q: 'A large, pale, plain shape near the center is balanced by a small, dark, detailed shape near the edge. What kind of balance is this?', right: 'Asymmetrical', wrong: ['Symmetrical', 'Radial'] },
        { q: 'Which of these adds the most visual weight to a small shape?', right: 'Making it dark and detailed', wrong: ['Making it pale and plain', 'Placing it among many similar shapes'] },
        { q: 'Can two sides of a picture balance if they are not mirror images?', right: 'Yes: unequal things can balance when their visual weights even out', wrong: ['No: only mirror symmetry balances', 'Only if both sides are the same color'] },
        { q: 'On a seesaw, a small child can balance a big one by sitting farther out. In a picture, a small shape balances a big one best when it is…', right: 'Farther from the center', wrong: ['Right at the center', 'Hidden behind the big shape'] },
        { q: 'A vase of flowers stands in the center with two matching candlesticks, one on each side. What kind of balance?', right: 'Symmetrical', wrong: ['Asymmetrical', 'Radial'] },
        { q: 'A design spreads out from its middle like the spokes of a bicycle wheel. What kind of balance?', right: 'Radial', wrong: ['Asymmetrical', 'No balance at all'] },
        { q: 'A big, dark tree fills the left side of a landscape; a small red barn sits near the right edge. The picture still feels even. What kind of balance?', right: 'Asymmetrical', wrong: ['Symmetrical', 'Radial'] },
        { q: 'The front of a temple has a central door with matching columns and windows on each side. What kind of balance?', right: 'Symmetrical', wrong: ['Asymmetrical', 'Radial'] },
        { q: 'A daisy seen from above, with petals all around its center, shows which kind of balance?', right: 'Radial', wrong: ['Asymmetrical', 'No balance at all'] },
        { q: 'Which usually feels more formal and still?', right: 'Symmetrical balance', wrong: ['Asymmetrical balance', 'A picture with no balance'] }]);
      return P(Q.q, ask(R, Q.right, Q.wrong), ['Visual weight comes from size, darkness, saturation, detail, isolation and distance from the center.', 'Answer: ' + Q.right + '.'], 'Think of a seesaw.');
    }
    var W = R.pick(BAL_WORKS), w = work(W[0]), v = workViz(w), opts3 = W[1] === 'radial' ? ['Radial', 'Asymmetrical'] : W[1] === 'symmetrical' ? ['Symmetrical', 'Asymmetrical'] : ['Symmetrical', 'Asymmetrical', 'Radial'];
    return P(v ? 'What kind of balance does this work show? (' + w.title + ')' : 'What kind of balance does ' + W[2] + ' show?', mc(opts3, opts3.indexOf(cap(W[1])), true),
      [W[1] === 'symmetrical' ? 'The two halves mirror each other.' : W[1] === 'radial' ? 'Its parts spread out from a center.' : 'The sides differ, but their visual weights even out.', 'So the balance is ' + W[1] + '.'], 'Mirror halves, around a center, or uneven but steady?', v);
  });

  var CON = [['a white sailboat on a dark sea', 'Value (light and dark)'], ['an orange buoy on blue water', 'Color (complements)'], ['warm firelight in a cool blue room', 'Temperature (warm and cool)'], ['one bright red umbrella in a gray street', 'Saturation (bright and dull)'],
    ['a tiny hiker beside a huge mountain', 'Size (big and small)'], ['a round moon above jagged rooftops', 'Shape (curved and angular)'], ['rough tree bark beside smooth glass', 'Texture (rough and smooth)']];
  G('design.contrast-principle', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var c = R.pick(CON), clash = /^Color|^Temperature/, w = R.sample(CON.filter(function (x) { return x !== c && !(clash.test(c[1]) && clash.test(x[1])); }), 2).map(function (x) { return x[1]; });
      return P('A picture shows <b>' + c[0] + '</b>. Which kind of contrast is that?', ask(R, c[1], w), ['Name the two things that differ and how.', c[0] + ': ' + c[1].toLowerCase() + '.'], 'What is the strongest difference between the two?');
    }
    if (L === 2) {
      var Q = R.pick([
        { q: 'Which of these is <b>not</b> an example of contrast?', right: 'A row of identical gray squares', wrong: ['A tiny red dot among large gray shapes', 'A smooth ball on rough sand'] },
        { q: 'Does contrast only mean black against white?', right: 'No: any strong difference, in size, texture, color or shape, is contrast', wrong: ['Yes: only light against dark counts', 'Yes, but only in drawings'] },
        { q: 'A picture feels flat and dull. Which change adds contrast?', right: 'Put a light shape against a dark area', wrong: ['Make every part the same middle gray', 'Use the same size for every shape'] }]);
      return P(Q.q, ask(R, Q.right, Q.wrong), ['Contrast is any strong difference between neighbors.', 'Answer: ' + Q.right + '.'], 'Look for the difference.');
    }
    if (R.coin()) {
      var w2 = work('fan-kuan'), v = workViz(w2);
      return P((v ? 'In this painting, ' : 'In Fan Kuan\'s <i>Travelers among Mountains and Streams</i> (about 1000), ') + 'a towering mountain fills most of the scroll and a small train of travelers moves along the road near the bottom. Which contrast is strongest?', ask(R, 'Size: the tiny travelers and the huge mountain', ['Temperature: warm and cool', 'Texture: smooth glass and rough bark']),
        ['The travelers are tiny; the mountain is immense.', 'That contrast of size makes nature feel vast.'], 'Compare the travelers with the mountain.', v);
    }
    var k = R.pick([['contrast', 'Value (light and dark)'], ['emphasis', 'Color and size']]);
    return P('Which kind of contrast is strongest in this design?', ask(R, k[1], k[0] === 'contrast' ? ['Texture (rough and smooth)', 'Temperature (warm and cool)'] : ['Texture (rough and smooth)', 'Value only (black and white)']),
      [k[0] === 'contrast' ? 'Half the design is nearly black and half nearly white: value contrast.' : 'One circle is red and bigger than all the small gray ones: contrast of color and size.'], 'What is most different?', { name: 'ar-design', opts: { kinds: [k[0]], quiet: true, interactive: false } });
  });

  var EMPH = [['A single lit candle in a dark room', 'Contrast', ['Placement', 'Detail', 'Converging lines']], ['One tree standing alone in an empty field, away from a forest', 'Isolation', ['Detail', 'Converging lines']],
    ['A figure placed at the exact center, with everything arranged around it', 'Placement', ['Detail', 'Converging lines']], ['Roads, fences and a river that all lead toward a distant castle', 'Converging lines', ['Detail', 'Isolation', 'Placement']],
    ['A face painted in sharp, fine detail while everything else is loose and blurry', 'Detail', ['Placement', 'Converging lines', 'Isolation']],
    ['One red poppy in a field of white daisies', 'Contrast', ['Placement', 'Detail', 'Converging lines']], ['A lone boat far out on an empty sea, apart from the harbor crowd', 'Isolation', ['Detail', 'Converging lines']],
    ['The rails of a train track that meet at a far-off station', 'Converging lines', ['Detail', 'Isolation', 'Placement']], ['A bright white shirt on one figure in a dim crowd', 'Contrast', ['Placement', 'Detail', 'Converging lines']],
    ['A queen seated in the middle of a symmetrical hall, with courtiers on both sides', 'Placement', ['Detail', 'Converging lines']], ['One flower painted petal by petal in a garden of quick, rough strokes', 'Detail', ['Placement', 'Converging lines', 'Isolation']]];
  G('design.emphasis', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var e = R.pick(EMPH), w = R.sample(e[2], 2);
      return P('<b>' + e[0] + '.</b> Which tool for emphasis is the artist using most?', ask(R, e[1], w), ['Tools for emphasis: contrast, isolation, placement, converging lines and detail.', 'Here: ' + e[1].toLowerCase() + '.'], 'What makes that one part stand out?');
    }
    if (L === 2) {
      if (R.chance(0.3)) { var stuff = R.pick(['every figure is brightly lit', 'every corner is painted in fine detail', 'every shape is bright red', 'every word is in capital letters']);
        return P(nm(R) + '\'s picture feels busy: ' + stuff + '. Why does nothing stand out?', ask(R, 'When everything is emphasized, nothing is', ['There is too much negative space', 'The colors are analogous']), ['Emphasis works by difference.', 'If ' + stuff + ', nothing is different, so nothing leads.'], 'What is different from everything else?'); }
      if (R.coin()) return P('A poster makes every word big, bold and red. What is the problem?', ask(R, 'Nothing stands out, because everything is emphasized', ['There is too much negative space', 'The colors are analogous']),
        ['When everything is emphasized, nothing is.', 'Choose one focal point and let the rest support it.'], 'If everything shouts, what do you hear?');
      return P('In this design, how does the focal point stand out?', ask(R, 'It differs from all the others in color and size', ['It is the same as everything around it', 'It sits in the darkest corner']),
        ['Many small gray circles, one larger red circle.', 'Its difference in color and size makes it the focal point.'], 'What is different about it?', { name: 'ar-design', opts: { kinds: ['emphasis'], quiet: true, interactive: false } });
    }
    var W = R.pick([
      { id: 'last-supper', q: 'In Leonardo\'s <i>The Last Supper</i> (about 1495 to 1498), what leads the eye to Christ?', right: 'The lines of the ceiling, walls and table meet at his head', wrong: ['He is the smallest figure', 'He is painted in the darkest corner'] },
      { id: 'night-watch', q: 'In Rembrandt\'s <i>The Night Watch</i> (1642), how are the captain and his lieutenant emphasized?', right: 'Light falls on them in the middle of the crowd', wrong: ['They are hidden in shadow at the edge', 'They are painted in gray only'] },
      { id: 'calling-matthew', q: 'In Caravaggio\'s <i>The Calling of Saint Matthew</i> (1599 to 1600), what leads the eye to the men at the table?', right: 'A beam of light across the dark room, in the direction Christ points', wrong: ['A bright, evenly lit background', 'Strong pattern on the walls'] },
      { id: 'wanderer', q: 'In Friedrich\'s <i>Wanderer above the Sea of Fog</i> (about 1818), why does the figure stand out?', right: 'He is dark against pale fog, near the center', wrong: ['He is pale against a pale sky at the edge', 'He is very small in a corner'] }]);
    var v = workViz(work(W.id));
    return P(W.q, ask(R, W.right, W.wrong), ['Look for contrast, placement and lines that lead.', W.right + '.'], 'Where do the light and the lines lead?', v);
  });

  G('design.movement', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      if (R.chance(0.3)) { var fm = R.pick(['curving line', 'zigzag', 'row of shapes that point', 'trail of dots']);
        return P(nm(R) + ' wants to lead the viewer\'s eye from one corner to the far corner. Which would help most?', ask(R, 'A ' + fm + ' running from corner to corner', ['A single shape in the exact center', 'Evenly scattered dots with no direction']), ['Movement follows lines, edges and shapes that point a direction.', 'A ' + fm + ' running across the picture carries the eye.'], 'What gives the eye a direction?'); }
      if (R.coin()) return P('In design, what does <b>movement</b> mean?', ask(R, 'The path the viewer\'s eye follows through the work', ['A picture of something that moves', 'How fast the artist painted']),
        ['Movement in design is about the viewer\'s eye: the path led by lines, edges, shapes and colors.'], 'Whose movement is it?');
      return P('What leads the eye across this design?', ask(R, 'A curving line and a row of pointed shapes', ['A grid of identical squares', 'A single dot in the center']),
        ['The curving line and the pointed shapes run from lower left to upper right.', 'The eye follows them.'], 'Follow the strongest direction.', { name: 'ar-design', opts: { kinds: ['movement'], quiet: true, interactive: false } });
    }
    if (L === 2) {
      var Q = R.pick([
        { q: 'A still life of apples on a table cannot move. Can it have movement in the design sense?', right: 'Yes: its edges and repeated colors can lead the eye around', wrong: ['No: only pictures of moving things have movement', 'Only if it is blurry'] },
        { q: 'A painting of a galloping horse is arranged so the eye stops at the center and goes nowhere. In design terms, it has…', right: 'Little movement, even though the subject moves', wrong: ['Strong movement, because the horse gallops', 'Radial balance'] },
        { q: 'Which would lead the eye from the bottom left to the top right of a picture?', right: 'A road running diagonally up toward the right', wrong: ['A flat horizon line', 'A circle in the center'] },
        { q: 'A painter repeats the same red in a scarf, a door and a flower placed around the picture. What does that repetition do?', right: 'Carries the eye from one red to the next', wrong: ['Stops the eye at the edge', 'Makes the picture monochromatic'] },
        { q: 'Several people in a painting all look toward a letter on a table. Where will the viewer\'s eye go?', right: 'Along their gazes to the letter', wrong: ['Off the edge of the canvas', 'Nowhere: gazes do not guide the eye'] },
        { q: 'A river winds back from the bottom of a landscape toward a far-off town. What does it do for the design?', right: 'Leads the eye back into the distance', wrong: ['Blocks all movement', 'Adds radial balance'] },
        { q: 'A road runs straight out of the bottom corner of a picture and nothing leads back in. What is the risk?', right: 'The eye may slide out of the picture', wrong: ['The picture becomes symmetrical', 'The colors turn analogous'] }]);
      return P(Q.q, ask(R, Q.right, Q.wrong), ['Movement in design is the path of the viewer\'s eye, not the motion of the subject.', 'Answer: ' + Q.right + '.'], 'Whose movement is it?');
    }
    var W = R.pick([
      { id: 'great-wave', q: 'In Hokusai\'s <i>Great Wave</i> (about 1830 to 1832), what mainly carries the eye?', right: 'The huge curve of the wave', wrong: ['A straight row of fence posts', 'A grid of windows'] },
      { id: 'hunters-snow', q: 'In Bruegel\'s <i>Hunters in the Snow</i> (1565), the hunters, trees and slope carry the eye from the left down into the valley. What structure does that path follow?', right: 'A diagonal', wrong: ['A circle', 'A single vertical'] },
      { id: 'starry-night', q: 'In van Gogh\'s <i>The Starry Night</i> (1889), how does the eye move through the sky?', right: 'It swirls along curving brushstrokes', wrong: ['It stays still on flat, even color', 'It follows a straight grid'] },
      { id: 'napoleon-alps', q: 'In David\'s <i>Napoleon Crossing the Alps</i> (1801), the rearing horse and the pointing arm form strong lines. Which kind?', right: 'Diagonals', wrong: ['Horizontals', 'A circle'] }]);
    return P(W.q, ask(R, W.right, W.wrong), ['Trace the strongest direction with your eye.', W.right + '.'], 'Which way do the main lines run?', workViz(work(W.id)));
  });

  var MOT = ['circle:blue', 'star:yellow', 'heart:red', 'square:green', 'triangle:orange', 'diamond:purple'];
  G('design.pattern', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1 || L === 2) {
      var core = R.pick(L === 1 ? ['AB', 'ABC', 'AAB'] : ['ABB', 'AABB', 'ABAC']), need = Math.max.apply(null, Ak.PAT_CORES[core]) + 1, motifs = R.sample(MOT, need), n = R.int(7, 9), seq = Ak.pattern(core, motifs, n + 1), next = seq[n];
      if (L === 1) {
        var wrong = motifs.filter(function (m) { return m !== next; }).concat(MOT.filter(function (m) { return motifs.indexOf(m) < 0; })).slice(0, 2);
        return P('What comes next in this pattern?', ask(R, cap(Ak.motifName(next)), wrong.map(function (m) { return cap(Ak.motifName(m)); })),
          ['The motif that repeats is ' + Ak.pattern(core, motifs, core.length).map(Ak.motifName).join(', ') + '.', 'Continue it: next is ' + Ak.motifName(next) + '.'], 'Find the group that repeats.',
          { name: 'ar-pattern', opts: { seq: seq.slice(0, n), missing: 'next', quiet: true, interactive: false } });
      }
      var cores = ['ABB', 'AABB', 'ABAC', 'AB', 'ABC'].filter(function (c) { return c !== core; });
      return P('Which rule describes this pattern?', ask(R, core, R.sample(cores, 2)), ['The smallest group that repeats: ' + Ak.pattern(core, motifs, core.length).map(Ak.motifName).join(', ') + '.', 'Give each different motif a letter: ' + core + '.'], 'Find the shortest group that repeats, then letter it.',
        { name: 'ar-pattern', opts: { seq: Ak.pattern(core, motifs, core.length * 3), quiet: true, interactive: false } });
    }
    var Q = R.pick([
      { q: 'What is the difference between pattern and rhythm?', right: 'A pattern is the repeated motif and its rule; rhythm is the beat its spacing creates', wrong: ['They mean exactly the same thing', 'Pattern is about color; rhythm is about texture'] },
      { q: 'Asante weavers in Ghana make kente cloth from narrow woven strips sewn together. What repeats along the strips?', right: 'Blocks of geometric pattern', wrong: ['Portraits of rulers', 'Landscapes'] },
      { q: 'A tiled floor repeats a blue star and an orange cross across the whole surface. What is the motif?', right: 'The star and the cross together', wrong: ['The whole floor', 'Only the color blue'] },
      { q: 'Which of these is a pattern?', right: 'Wallpaper with the same flower repeated in rows', wrong: ['A single flower in a vase', 'Scattered leaves with no repeat'] }]);
    return P(Q.q, ask(R, Q.right, Q.wrong), ['A pattern repeats a motif in a regular way.', 'Answer: ' + Q.right + '.'], 'Look for what repeats.');
  });

  var RH = ['regular', 'alternating', 'progressive', 'flowing'];
  G('design.rhythm', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var t = R.pick(RH), w = R.sample(RH.filter(function (x) { return x !== t; }), 2);
      var how = { regular: 'the same circle with the same spacing', alternating: 'two shapes taking turns', progressive: 'circles that grow step by step', flowing: 'repeats rising and falling along a wave' };
      return P('What kind of rhythm does this row show?', ask(R, cap(t), w.map(cap)), ['The row shows ' + how[t] + '.', 'That is a ' + t + ' rhythm.'], 'Same each time, taking turns, changing step by step, or wavy?',
        { name: 'ar-pattern', opts: { rhythm: [t], quiet: true, interactive: false } });
    }
    var pool = L === 2 ? [['circles that grow a little bigger each time', 'progressive'], ['a staircase whose steps rise one by one', 'progressive'], ['a row of trees that shrink step by step into the distance', 'progressive'], ['stripes of red and white taking turns', 'alternating'], ['identical fence posts, evenly spaced', 'regular']]
      : [['the red brick and white stone wedges that take turns around each arch of the Great Mosque of Córdoba', 'alternating'], ['waves rising and falling along a shoreline', 'flowing'], ['a row of identical columns with equal spaces', 'regular'], ['rolling hills rising and falling to the horizon', 'flowing'], ['a row of lamps, each a little smaller than the one before', 'progressive']];
    var it = R.pick(pool), w2 = R.sample(RH.filter(function (x) { return x !== it[1]; }), 2);
    if (L === 2 && R.chance(0.3)) return P('Does a rhythm need exact repeats?', ask(R, 'No: a progressive rhythm changes step by step', ['Yes: every repeat must be identical', 'Only alternating rhythms change']),
      ['A progressive rhythm repeats with a gradual change, such as circles that grow.'], 'Think of a staircase.');
    return P('What kind of rhythm do <b>' + it[0] + '</b> make?', ask(R, cap(it[1]), w2.map(cap)), [it[1] === 'progressive' ? 'Each repeat changes a little, step by step: progressive.' : it[1] === 'alternating' ? 'Two elements take turns: alternating.' : it[1] === 'flowing' ? 'The repeats follow a curving, wavelike path: flowing.' : 'The same element with the same spacing: regular.'], 'How does each repeat compare with the one before?');
  });

  G('design.unity-variety', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var pair = R.pick([['unity', 'variety'], ['dull', 'chaos']]), ks = R.shuffle(pair.slice()), want = R.pick(ks);
      var say = { unity: 'leans toward unity (similar shapes and colors)', variety: 'leans toward variety (many different shapes and colors)', dull: 'has too much sameness', chaos: 'has too much variety' };
      return P('Which design ' + say[want] + '?', mc(['A', 'B'], ks.indexOf(want), true), ks.map(function (k, i) { return letter(i) + ' ' + say[k] + '.'; }), 'Look at how alike or different the parts are.',
        { name: 'ar-design', opts: { kinds: ks, quiet: true, interactive: false, columns: 2 } });
    }
    if (L === 2) {
      var s = R.pick([['repeat one color in several places', 'Unity'], ['limit the palette to one color scheme', 'Unity'], ['line shapes up and group them', 'Unity'], ['use only one kind of brushstroke', 'Unity'], ['repeat the same round shape throughout', 'Unity'], ['use one font for every heading', 'Unity'],
        ['add one accent color', 'Variety'], ['change the sizes of repeated shapes', 'Variety'], ['contrast curved shapes with straight ones', 'Variety'], ['tilt one shape in a row of upright ones', 'Variety'], ['add a rough texture beside smooth areas', 'Variety'], ['vary the spacing between repeated trees', 'Variety']]);
      return P(nm(R) + ' decides to <b>' + s[0] + '</b>. Does that mainly add unity or variety?', mc(['Unity', 'Variety'], s[1] === 'Unity' ? 0 : 1, true),
        [s[1] === 'Unity' ? 'Repeating and limiting make the parts belong together: unity.' : 'Adding differences keeps the eye interested: variety.'], 'Does it make parts more alike, or more different?');
    }
    var Q = R.pick([
      { q: 'A design is rows of identical gray squares. What does it need?', right: 'More variety: a change of size, color or direction', wrong: ['More unity', 'Nothing: sameness is the goal'] },
      { q: 'A poster uses eight colors, five fonts and shapes of every kind. What does it need?', right: 'More unity: fewer colors and fonts, repeated shapes', wrong: ['More variety', 'More colors'] },
      { q: 'Which statement is true?', right: 'Good design balances unity and variety', wrong: ['Unity means everything must be the same', 'The more variety, the better'] },
      { q: 'A quilt uses only blues, in squares of one size, with no change anywhere. What could make it more interesting without losing unity?', right: 'Add a few squares of a different size or one accent color', wrong: ['Use twenty unrelated colors', 'Make every square identical'] },
      { q: 'Musicians repeat a theme and vary it. In design, the same idea balances…', right: 'Unity and variety', wrong: ['Hue and value', 'Pattern and texture'] },
      { q: 'A garden painting has flowers of every color, size and shape scattered everywhere, and the eye finds no place to rest. What does it lack?', right: 'Unity', wrong: ['Variety', 'Contrast'] }]);
    return P(Q.q, ask(R, Q.right, Q.wrong), ['Too much sameness is dull; too much variety is chaos.', 'Answer: ' + Q.right + '.'], 'Is it too alike or too different?');
  });

  G('design.proportion-scale', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var Q = R.pick([
        { q: 'Comparing the size of a statue\'s head with the size of its body is a question of…', right: 'Proportion', wrong: ['Scale', 'Rhythm'] },
        { q: 'A statue three times the height of a real person is described as…', right: 'Monumental in scale', wrong: ['Miniature in scale', 'Life-size'] },
        { q: 'Drawing the most important figure largest, whatever its place in space, is called…', right: 'Hierarchical scale', wrong: ['Atmospheric perspective', 'Radial balance'] },
        { q: 'A tiny painted portrait that fits in your palm is…', right: 'Miniature in scale', wrong: ['Monumental in scale', 'Life-size'] },
        { q: 'A portrait bust exactly as big as the sitter\'s real head is…', right: 'Life-size', wrong: ['Monumental', 'Miniature'] },
        { q: 'A cartoon character drawn with a head as big as its body is an example of exaggerated…', right: 'Proportion', wrong: ['Rhythm', 'Texture'] },
        { q: 'In Hokusai\'s <i>Great Wave</i>, the near wave towers over distant Mount Fuji. The artist is playing with…', right: 'Scale', wrong: ['Monochromatic color', 'Radial balance'] }]);
      return P(Q.q, ask(R, Q.right, Q.wrong), ['Proportion compares parts with each other; scale compares with a known size such as the human body.', 'Answer: ' + Q.right + '.'], 'Parts compared with each other, or with something we know?');
    }
    if (L === 2) {
      var duccio = work('duccio-maesta');
      if (R.coin() && A().hasImg(duccio)) return P('In Duccio\'s <i>Maestà</i> (1308 to 1311), the Virgin Mary on her throne is painted far larger than the saints and angels around her. Why is she so big?', ask(R, 'To show who is most important (hierarchical scale)', ['Because she is closer to the viewer', 'Because the artist made a mistake in proportion']),
        ['The saints kneeling in the front row are in front of her throne, so they are nearer to us, and yet they are much smaller.', 'So her size shows her importance, not her distance: hierarchical scale.'], 'Who is nearer to us: the Virgin, or the saints kneeling in front?', workViz(duccio));
      var who = R.pick(['a king', 'a chief', 'a ruler', 'a queen mother', 'a pharaoh', 'a governor']);
      return P('In an older relief, ' + who + ' stands ' + R.pick(['twice', 'nearly twice', 'three times']) + ' as tall as the attendants beside ' + (/queen/.test(who) ? 'her' : 'him') + '. They all stand side by side on the same ground line, with no overlap. Why is ' + (/queen/.test(who) ? 'she' : 'he') + ' so big?', ask(R, 'To show who is most important (hierarchical scale)', ['Because ' + (/queen/.test(who) ? 'she is' : 'he is') + ' closer to the viewer', 'Because the artist made a mistake in proportion']),
        ['There are no depth cues: same ground line, no overlap, no shrinking background.', 'So size shows rank, not distance: hierarchical scale.'], 'Is there any sign that he is nearer?',
        { name: 'ar-design', opts: { kinds: ['proportion'], quiet: true, interactive: false } });
    }
    if (R.coin()) {
      var h = R.pick([1.5, 1.6, 1.7, 1.8, 1.9]), k = R.pick([2, 3, 4, 5]), ans = Math.round(h * k * 10) / 10;
      return { q: 'A sculptor makes a statue of ' + R.pick(['a dancer', 'a poet', 'a farmer', 'a scientist', 'a runner']) + ' who was ' + h + ' m tall, at ' + k + ' times life size. How tall is the statue?', a: { t: 'num', v: String(ans), rtol: 0.001 }, unit: 'm',
        steps: [k + ' times life size means every length is multiplied by ' + k + '.', h + ' × ' + k + ' = ' + ans + ' m.'], hint: 'Multiply the real height by the scale.' };
    }
    var big = R.pick([6, 8, 9, 12]), small = R.pick([2, 3]), ratio = big / small;
    if (big % small) { big = small * 4; ratio = 4; }
    return { q: 'On a plaque, the central figure is ' + big + ' inches tall and each attendant is ' + small + ' inches tall. How many times taller is the central figure?', a: { t: 'num', v: String(ratio) },
      steps: ['Divide: ' + big + ' ÷ ' + small + ' = ' + ratio + '.', 'In hierarchical scale this size difference shows importance.'], hint: 'Divide the larger height by the smaller.' };
  });

  // ================================================================ UNIT 5: COMPOSITION AND ANALYSIS
  var STEPS4 = ['Describe', 'Analyze', 'Interpret', 'Judge'];
  var STMT = [['The sky is painted in short blue strokes.', 0], ['There are three trees on the left.', 0], ['A woman in a red coat stands by a window.', 0], ['The painting is about 2 meters wide.', 0], ['The background is dark brown.', 0],
    ['The diagonal road leads the eye to the house.', 1], ['The warm house contrasts with the cool fields.', 1], ['Light falls on the girl, making her the focal point.', 1], ['The figures form a stable triangle.', 1], ['Repeated reds carry the eye across the picture.', 1],
    ['The empty road may stand for loneliness.', 2], ['The open window might suggest hope or escape.', 2], ['The painting may be about the passing of time.', 2], ['The stormy sky could reflect the farmer\'s worry.', 2],
    ['It succeeds because every line leads to the house.', 3], ['The colors work well because the complements make the scene glow.', 3], ['It is less effective than it could be, because the focal point is unclear.', 3]];
  G('design.formal-analysis', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var i = R.int(0, 3), q = R.pick(['first', 'after']);
      if (q === 'first' || i === 3) return P('In the four-step method for looking at art, which step comes <b>first</b>?', ask(R, 'Describe', ['Judge', 'Interpret']), ['Describe, analyze, interpret, judge.', 'Describe comes first: look before you explain.'], 'What must you do before you can explain anything?');
      return P('In the four-step method, which step comes right after <b>' + STEPS4[i].toLowerCase() + '</b>?', ask(R, STEPS4[i + 1], STEPS4.filter(function (s, j) { return j !== i + 1 && j !== i; })), ['The order: describe, analyze, interpret, judge.', 'After ' + STEPS4[i].toLowerCase() + ' comes ' + STEPS4[i + 1].toLowerCase() + '.'], 'Describe, analyze, interpret, judge.');
    }
    if (L === 2) {
      var s = R.pick(STMT);
      return P('"' + s[0] + '" Which step of formal analysis is this statement?', mc(STEPS4, s[1], true),
        [['It states a plain fact anyone can see: describe.', 'It explains how elements or principles are used: analyze.', 'It suggests a meaning: interpret.', 'It says whether the work succeeds, with a reason: judge.'][s[1]]], 'A plain fact? How it is arranged? What it means? Whether it works?');
    }
    var want = R.int(0, 3), right = R.pick(STMT.filter(function (x) { return x[1] === want; })), wrong = [0, 1, 2, 3].filter(function (j) { return j !== want; }).map(function (j) { return R.pick(STMT.filter(function (x) { return x[1] === j; }))[0]; });
    return P('Which statement is ' + ['a description', 'an analysis', 'an interpretation', 'a judgment'][want] + '?', ask(R, right[0], R.sample(wrong, 2)),
      ['Describe: plain facts. Analyze: how it is arranged. Interpret: what it may mean. Judge: whether it works, and why.', '"' + right[0] + '" is ' + ['a description', 'an analysis', 'an interpretation', 'a judgment'][want] + '.'], 'Sort each statement into one of the four steps.');
  });

  var STR = ['triangle', 'diagonal', 's-curve', 'circle', 'horizontal', 'vertical'], STRN = { triangle: 'A triangle', diagonal: 'A diagonal', 's-curve': 'An S-curve', circle: 'A circle', horizontal: 'Horizontals', vertical: 'Verticals' };
  G('design.composition-structures', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var k = R.pick(STR), w = R.sample(STR.filter(function (x) { return x !== k; }), 2);
      return P('What simple structure is this layout built on?', ask(R, STRN[k], w.map(function (x) { return STRN[x]; })), ['Squint and trace the main masses with your eye.', 'They form ' + STRN[k].toLowerCase() + '.'], 'Trace the arrangement with your finger in the air.',
        { name: 'design-structure', opts: { kinds: [k], quiet: true, interactive: false } });
    }
    if (L === 2) {
      var Q = R.pick([['most stable and solid', 'A triangle with a wide base'], ['most energetic, like something falling or rising', 'A diagonal'], ['calm and spread out', 'Horizontals'], ['graceful, winding back into the distance', 'An S-curve']]);
      return P('Which structure often makes a picture feel <b>' + Q[0] + '</b>?', ask(R, Q[1], ['A triangle with a wide base', 'A diagonal', 'Horizontals', 'An S-curve'].filter(function (x) { return x !== Q[1]; }).slice(0, 2)),
        ['Triangle: stable. Diagonal: energetic. Horizontals: calm. S-curve: winding and graceful.', 'Answer: ' + Q[1] + '.'], 'Think of how the shape would behave if it were real.');
    }
    var W = R.pick([
      { id: 'last-supper', q: 'At the center of Leonardo\'s <i>The Last Supper</i>, the figure of Christ forms which stable shape?', right: 'A triangle', wrong: ['An S-curve', 'A zigzag'] },
      { id: 'napoleon-alps', q: 'In David\'s <i>Napoleon Crossing the Alps</i> (1801), the rearing horse and pointing arm build which structure?', right: 'Strong diagonals', wrong: ['Calm horizontals', 'A circle'] },
      { id: 'horatii', q: 'In David\'s <i>The Oath of the Horatii</i> (1784), what divides the scene into three parts?', right: 'Three arches in the background', wrong: ['A winding river', 'A large circle of figures'] },
      { id: 'gleaners', q: 'Millet\'s <i>The Gleaners</i> (1857) shows three women bent low across a wide, flat field. Which structure dominates?', right: 'Horizontals', wrong: ['Verticals', 'A circle'] },
      { id: 'hunters-snow', q: 'In Bruegel\'s <i>Hunters in the Snow</i> (1565), the hunters, trees and slope form which structure?', right: 'A diagonal', wrong: ['A circle', 'Verticals only'] }]);
    return P(W.q, ask(R, W.right, W.wrong), ['Look past the subject to the shape of the arrangement.', W.right + '.'], 'Trace the main masses.', workViz(work(W.id)));
  });

  G('design.thirds-focus-paintings', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var spot = R.pick([['thirds', R.pick([1 / 3, 2 / 3])], ['center', 0.5], ['edge', R.pick([0.08, 0.92])]]), subj = R.pick(['tree', 'house', 'boat', 'rock']);
      var x = spot[1], answer = { thirds: 'On a thirds line', center: 'At the center', edge: 'Near the edge' }[spot[0]];
      return P('The lines divide the picture into thirds. Where is the main subject (the ' + subj + ') placed across the picture?', ask(R, answer, ['On a thirds line', 'At the center', 'Near the edge'].filter(function (q) { return q !== answer; })),
        ['Find the subject, then compare its position with the guide lines.', 'It is ' + answer.toLowerCase() + '.'], 'Look at the two vertical guide lines.',
        { name: 'ar-compose', opts: { scene: { sx: x, sy: subj === 'boat' ? 0.62 : 0.66, hy: 0.6, subject: subj }, overlays: ['thirds'], quiet: true, interactive: false } });
    }
    if (L === 2) {
      var Q = R.pick([['calm, formal and important', 'At the center'], ['tense or unexpected, as if about to leave', 'Near an edge'], ['balanced but lively', 'On or near a thirds line']]);
      return P('Where would a painter most likely place the focal point to make it feel <b>' + Q[0] + '</b>?', ask(R, Q[1], ['At the center', 'Near an edge', 'On or near a thirds line'].filter(function (x) { return x !== Q[1]; })),
        ['Center: calm and important. Thirds: balanced with energy. Edge: tension.', 'Answer: ' + Q[1] + '.'], 'Equal space all around feels still; uneven space feels active.');
    }
    var Q2 = R.pick([
      { q: 'Must a painting\'s focal point sit on a thirds line?', right: 'No: the rule of thirds is a guideline; painters also center a subject or push it to an edge', wrong: ['Yes, or the painting is wrong', 'Yes, but only in landscapes'] },
      { q: 'In Leonardo\'s <i>The Last Supper</i>, where is Christ, the focal point, placed?', right: 'At the center', wrong: ['On the left thirds line', 'At the far right edge'] },
      { q: 'In Friedrich\'s <i>Wanderer above the Sea of Fog</i>, where does the figure stand?', right: 'Near the center, seen from behind', wrong: ['Tiny, in the bottom corner', 'Cut off at the edge'] },
      { q: 'Which clue helps most in finding a painting\'s focal point?', right: 'Where the strongest contrast, detail and leading lines meet', wrong: ['Wherever the thirds lines cross', 'The top left corner, where we start reading'] }]);
    return P(Q2.q, ask(R, Q2.right, Q2.wrong), ['Find the focal point by contrast, detail, lines and gazes; then ask what its placement does.', 'Answer: ' + Q2.right + '.'], 'Placement serves the mood; it is not a rule.');
  });

  G('design.value-pattern', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var want = R.pick(['high', 'low', 'contrast']), keys = R.shuffle({ high: ['high', 'low', 'flat'], low: ['low', 'high', 'flat'], contrast: ['contrast', 'high', 'low'] }[want]), wn = { high: 'high key (mostly light values)', low: 'low key (mostly dark values)', contrast: 'high contrast', flat: 'low contrast (values close together)' };
      return P('Which picture is <b>' + wn[want] + '</b>?', mc(letters(3), keys.indexOf(want), true), keys.map(function (k, i) { return letter(i) + ': ' + wn[k] + '.'; }), 'Squint at each and compare the big values.',
        { name: 'ar-value', opts: { mode: 'key', keys: keys, quiet: true, interactive: false } });
    }
    if (L === 2) {
      var Q = R.pick([
        { q: 'Why do painters squint at a painting?', right: 'To blur the details and see the big shapes of light and dark', wrong: ['To see the colors more brightly', 'To count the brushstrokes'] },
        { q: 'A painting has lovely details, but from across the room it looks muddled. What is the most likely problem?', right: 'A weak value pattern: the big lights and darks are not clear', wrong: ['Too little detail', 'The wrong signature'] },
        { q: 'Before adding details and colors, many painters first plan…', right: 'Three or four big values in a small sketch', wrong: ['The frame', 'The final varnish'] },
        { q: nm(R) + ' takes a photo of a painting and switches it to black and white. What does that show most clearly?', right: 'The value pattern', wrong: ['The hues', 'The texture of the canvas'] },
        { q: 'A landscape has a light sky, a middle-value field and a dark forest. How many big values does its pattern have?', right: 'Three', wrong: ['One', 'Twelve'] },
        { q: 'Which value pattern gives the strongest focal point?', right: 'The lightest light set against the darkest dark in one place', wrong: ['Middle values everywhere', 'Many small lights scattered evenly'] }]);
      return P(Q.q, ask(R, Q.right, Q.wrong), ['At a glance the eye sees big lights and darks before details.', 'Answer: ' + Q.right + '.'], 'Think about what you see from far away.');
    }
    var Q3 = R.pick([
      { id: 'impression-sunrise', q: 'In Monet\'s <i>Impression, Sunrise</i> (1872), the orange sun is almost the same value as the sky. What happens in a black-and-white copy?', right: 'The sun nearly disappears', wrong: ['The sun becomes the darkest spot', 'The sun becomes pure white'] },
      { id: 'calling-matthew', q: 'Caravaggio built many paintings on a value pattern of mostly deep darks with a few brilliant lights. What is that called?', right: 'Tenebrism', wrong: ['High key', 'Monochrome'] },
      { id: null, q: 'A picture made mostly of pale, close values (like a misty morning) is…', right: 'High key, low contrast', wrong: ['Low key, high contrast', 'Low key, low contrast'] },
      { id: null, q: 'A night scene of a dark street with one bright lit window is…', right: 'Low key, with strong contrast at the window', wrong: ['High key, low contrast', 'High key, no contrast'] },
      { id: 'night-watch', q: 'In Rembrandt\'s <i>The Night Watch</i> (1642), most of the scene is dark and light falls on a few central figures. What does the value pattern do?', right: 'Makes the lit figures the focal point', wrong: ['Spreads attention evenly', 'Hides the main figures'] }]);
    return P(Q3.q, ask(R, Q3.right, Q3.wrong), ['Value pattern: the big arrangement of light and dark.', 'Answer: ' + Q3.right + '.'], 'Think only about light and dark.', Q3.id ? workViz(work(Q3.id)) : null);
  });

  G('design.color-in-paintings', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var kind = R.pick(['complementary', 'analogous', 'triadic', 'split', 'monochromatic']), base = R.pick(wheelKeys()), cols = schemeHexes(kind, base);
      if (kind !== 'monochromatic') cols = R.shuffle(cols);
      var all = ['complementary', 'analogous', 'triadic', 'split', 'monochromatic'];
      return P('This palette was taken from a painting. Which color scheme is it (on the painter\'s wheel)?', ask(R, Ak.SCHEMES[kind], R.sample(all.filter(function (x) { return x !== kind; }), 2).map(function (x) { return Ak.SCHEMES[x]; })),
        [kind === 'monochromatic' ? 'One hue (' + hueName(base) + ') in several values.' : 'The hues: ' + listText(Ak.scheme(kind, base)) + '.', 'That is a ' + Ak.SCHEMES[kind].toLowerCase() + ' scheme.'], 'Count the hues and find them on the wheel.', swatches(cols));
    }
    if (L === 2) {
      if (R.coin()) {
        var warm = R.coin(), pool = warm ? Ak.WARM : Ak.COOL, set = R.sample(pool, 3);
        return P('Is this palette mostly warm or mostly cool?', mc(['Mostly warm', 'Mostly cool'], warm ? 0 : 1, true), ['The hues: ' + listText(set) + '.', warm ? 'Reds, oranges and yellows: warm.' : 'Greens, blues and violets: cool.'], 'Fire and sun, or water and shade?', swatches(set.map(hex)));
      }
      var strong = R.coin(), ks = R.sample(wheelKeys(), 3), c3 = ks.map(function (k) { return strong ? hex(k) : Ak.mixHex(hex(k), Ak.grayOf(hex(k)), 0.75); });
      return P('Is this palette strong and saturated, or grayed and quiet?', mc(['Strong and saturated', 'Grayed and quiet'], strong ? 0 : 1, true), [strong ? 'The colors are pure, as on the wheel.' : 'Each color has gray mixed in: low saturation.'], 'Pure, or mixed with gray?', swatches(c3));
    }
    var W = R.pick([
      { id: 'bedroom', q: 'Van Gogh\'s <i>The Bedroom</i> pairs a red floor with a green window, violet walls with a yellow bed, and an orange table with a blue basin. What scheme is at work?', right: 'Complementary pairs', wrong: ['Monochromatic', 'Analogous'] },
      { id: 'water-lilies', q: 'Many of Monet\'s water lily paintings lean on blues, greens and violets. Which scheme is that closest to?', right: 'Analogous (cool neighbors)', wrong: ['Complementary', 'Triadic'] },
      { id: 'sunflowers', q: 'Van Gogh\'s <i>Sunflowers</i> (1888, National Gallery, London) is built from yellows, yellow-oranges and oranges on a yellow ground. Which scheme is that closest to?', right: 'Analogous (warm neighbors)', wrong: ['Complementary', 'Split-complementary'] },
      { id: 'impression-sunrise', q: 'In Monet\'s <i>Impression, Sunrise</i>, an orange sun hangs in a blue-gray harbor. Which relationship is that?', right: 'Complements: orange and blue', wrong: ['Analogous: orange and yellow', 'Monochromatic: one hue'] },
      { id: 'pearl-earring', q: 'In Vermeer\'s <i>Girl with a Pearl Earring</i>, a cool blue turban sits against a warm yellow-brown jacket. What contrast is that?', right: 'Warm and cool, close to the blue-orange complements', wrong: ['Monochromatic blues', 'Analogous greens'] }]);
    return P(W.q, ask(R, W.right, W.wrong), ['Group the colors and find them on the wheel.', W.right + '.'], 'Neighbors or opposites?', workViz(work(W.id)));
  });

  G('design.color-meaning', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var Q = R.pick([
        { q: 'Where do color meanings come from?', right: 'Culture and history, so they vary from place to place', wrong: ['Nature: every color means the same everywhere', 'The color wheel'] },
        { q: 'Does white mean the same thing in every culture?', right: 'No: it is worn for weddings in some places and for mourning in others', wrong: ['Yes: white always means joy', 'Yes: white always means grief'] },
        { q: 'Before reading meaning into a painting\'s colors, what should you ask?', right: 'Where and when it was made, and how the colors are used in it', wrong: ['What the colors mean on a modern chart', 'Nothing: color meanings are universal'] },
        { q: 'Does black mean mourning in every culture?', right: 'No: it does in much of Europe and the Americas, but customs differ elsewhere', wrong: ['Yes: black always means mourning', 'Yes, and white always means joy'] },
        { q: 'Does red mean the same thing on a stop sign and at a Chinese wedding?', right: 'No: on the sign it warns; at the wedding it means good fortune', wrong: ['Yes: red always means danger', 'Yes: red always means luck'] },
        { q: 'Which is the best evidence for what a color means in a painting?', right: 'The culture and time it was made in, and how the color is used in it', wrong: ['How the color makes you feel today', 'A list of color meanings online'] }]);
      return P(Q.q, ask(R, Q.right, Q.wrong), ['Color meanings are learned and change across cultures, times and contexts.', 'Answer: ' + Q.right + '.'], 'Do all cultures agree?');
    }
    if (L === 2) {
      var F = R.pick([
        { q: 'In China and Japan, which color has long been worn at funerals?', right: 'White', wrong: ['Red', 'Yellow'] },
        { q: 'In China, which color is linked with good fortune, weddings and the Lunar New Year?', right: 'Red', wrong: ['White', 'Black'] },
        { q: 'The white wedding dress became popular in many Western countries after which bride wore white in 1840?', right: 'Queen Victoria', wrong: ['Marie Antoinette', 'Queen Elizabeth I'] },
        { q: 'Why was purple tied to power in ancient Rome?', right: 'Tyrian purple dye, made from sea snails, was costly and restricted to emperors and officials', wrong: ['Purple was the cheapest dye', 'Purple was the color of farmers'] },
        { q: 'Why did Renaissance painters often save ultramarine blue for the most important figure?', right: 'It was ground from lapis lazuli brought from Afghanistan and cost a great deal', wrong: ['It was the cheapest blue', 'It was made from sea snails'] },
        { q: 'Tyrian purple, the costly dye of ancient Rome, was made from…', right: 'Sea snails', wrong: ['Lapis lazuli', 'Sunflowers'] },
        { q: 'Ultramarine blue pigment was ground from which stone?', right: 'Lapis lazuli', wrong: ['Marble', 'Granite'] },
        { q: 'In much of Europe and the Americas, which color is traditionally worn for mourning?', right: 'Black', wrong: ['Red', 'Yellow'] }]);
      return P(F.q, ask(R, F.right, F.wrong), ['Many color meanings grew from customs and from the cost of dyes and pigments.', 'Answer: ' + F.right + '.'], 'Think of cost and custom.');
    }
    var Q3 = R.pick([
      { q: 'A painting shows a bride in a bright red dress. A viewer says it must be a mistake because brides wear white. What is wrong with that reasoning?', right: 'It assumes one culture\'s custom is universal', wrong: ['Nothing: brides always wear white', 'Red cannot be painted bright'] },
      { q: 'A website says "blue always means sadness." How should an art student treat that claim?', right: 'With caution: meanings vary by culture, time and context', wrong: ['As a law of color', 'As true only for paintings'] },
      { q: 'In a Renaissance painting, one figure\'s robe is a deep, costly ultramarine. What might that suggest?', right: 'The figure is important', wrong: ['The painter ran out of other colors', 'The figure is a servant'] }]);
    return P(Q3.q, ask(R, Q3.right, Q3.wrong), ['Tie a color\'s meaning to evidence: the culture, period, subject and use.', 'Answer: ' + Q3.right + '.'], 'Where and when was it made?');
  });

  var TXT = ['#111111', '#ffffff', '#767676', '#595959', '#e03127', '#3aa64a', '#2160b8', '#fde13a', '#7b3294', '#f5871f', '#00562f', '#b8197f', '#cfcfcf', '#14968a', '#fbf8f0', '#1d2320'];
  function pairsWith(R, cond) { var a, b, t = 0; do { a = R.pick(TXT); b = R.pick(TXT); t++; } while ((a === b || !cond(A().contrast(a, b))) && t < 200); return [a, b]; }
  G('design.readable-contrast', function (R, ctx) {
    var L = ctx.level || 1, Ak = A();
    if (L === 1) {
      var p1 = pairsWith(R, function (r) { return r >= 7; }), p2 = pairsWith(R, function (r) { return r < 2.6; }), ord = R.coin() ? [p1, p2] : [p2, p1], right = ord.indexOf(p1);
      return P('Which text sample has more contrast, so it is easier to read?', mc(['A', 'B'], right, true),
        ['Compare the value difference between letters and background.', 'Sample A is about ' + Ak.contrast(ord[0][0], ord[0][1]).toFixed(1) + ' to 1; sample B about ' + Ak.contrast(ord[1][0], ord[1][1]).toFixed(1) + ' to 1.', 'Sample ' + letter(right) + ' has more contrast.'], 'Squint: which letters still stand out?',
        { name: 'design-text', opts: { pairs: ord, quiet: true, interactive: false, text: R.pick(['Can you read this?', 'Open daily 9 to 5', 'Art class at noon']) } });
    }
    if (L === 2) {
      var L1 = R.pick([1, 0.8, 0.6, 0.45]), L2 = R.pick([0, 0.05, 0.1, 0.15, 0.2]), ratio = (L1 + 0.05) / (L2 + 0.05), r1 = Math.round(ratio * 10) / 10;
      return { q: 'Text and background have relative luminances $L_1 = ' + L1 + '$ (the lighter) and $L_2 = ' + L2 + '$ (the darker). Find the contrast ratio $\\frac{L_1 + 0.05}{L_2 + 0.05}$, to one decimal place.', a: { t: 'num', v: String(r1), tol: 0.051 },
        steps: ['$L_1 + 0.05 = ' + (Math.round((L1 + 0.05) * 100) / 100) + '$ and $L_2 + 0.05 = ' + (Math.round((L2 + 0.05) * 100) / 100) + '$.', 'Divide: $' + (Math.round((L1 + 0.05) * 100) / 100) + ' \\div ' + (Math.round((L2 + 0.05) * 100) / 100) + ' \\approx ' + r1 + '$.', 'The contrast ratio is about ' + r1 + ' to 1' + (ratio >= 4.5 ? ', which meets the 4.5 to 1 guideline for normal text.' : ratio >= 3 ? ', enough only for large text (3 to 1).' : ', too low for text.')],
        hint: 'Add 0.05 to each, then divide the larger by the smaller.' };
    }
    if (R.chance(0.3)) return P('Red text on a green background is hard to read even though the hues are very different. Why?', ask(R, 'The two colors are close in value, so the contrast ratio is low', ['Red and green are analogous', 'The hues are too far apart on the wheel']),
      ['Readability depends mostly on value contrast.', 'The painter\'s red and green are close in value: about ' + Ak.contrast('#e03127', '#3aa64a').toFixed(1) + ' to 1.', 'They are also confusing for the roughly 1 in 12 men with red-green color blindness.'], 'View the pair in gray.');
    var large = R.coin(), need = large ? 3 : 4.5, pass = R.coin(), pr = pairsWith(R, function (r) { return pass ? r >= need + 0.4 : r <= need - 0.4 && r >= 1.3; }), r = Ak.contrast(pr[0], pr[1]), ok = r >= need;
    return P('Does this ' + (large ? '<b>large</b> (headline-size)' : '<b>normal</b>-size') + ' text meet the WCAG contrast guideline?', mc(['Yes', 'No'], ok ? 0 : 1, true),
      ['The ratio for this pair is about ' + (Math.floor(r * 10) / 10).toFixed(1) + ' to 1.', (large ? 'Large text needs at least 3 to 1.' : 'Normal text needs at least 4.5 to 1.'), ok ? 'It meets the guideline.' : 'It falls short.'], large ? 'Large text needs 3 to 1.' : 'Normal text needs 4.5 to 1.',
      { name: 'design-text', opts: { pairs: [pr], large: large, quiet: true, interactive: false, text: large ? 'Big Sale Today' : 'Doors open at seven tonight' } });
  });
})(window.MathLadder);
