/* Art & Drawing Ladder: the shared visual kit (names prefixed ar-) and a model (MathLadder.art), on window.MathLadder.
   Load order: math/viz/core.js (+ viz.css), then this file (+ art/viz/art.css). Art topic pages always load this file, and practice
   pages load it with the course (MathLadder.loadCourse), so generators may call MathLadder.art. The model also runs in node:
   global.window = global; require('…/art.js').
   Vanilla JS, no libraries, no network. Every drawing is original and made here. Drawn people use the site's one cartoon skin color
   (#ffcc4d, outline #e8a93a) and are always clothed. Built from /tmp/work_art/kit/*.js by /tmp/work_art/build_kit.py, which also
   writes the catalog (A.WORKS, from /tmp/work_art/works.py and data/art/images.json) and the coastlines into this file.
   Do not edit by hand. Conventions for course builders: /tmp/work_art/overview.md.

   Embed:  <div class="ml-viz" data-viz="ar-lines" data-opts='{"kinds":["zigzag","wavy"]}'></div>

   COMMON OPTIONS (every visual)
     quiet: true (alias readout: false)  hide whatever would give a problem's answer away: names become letters A, B, C…, no
                  verdicts, no Check buttons, no captions that name the work. What the question asks about stays visible.
     interactive: false   a still picture.   task: a line above.   caption: HTML below.   label: aria-label.
     big: true    larger type (Drawing for Young Artists).   readme: 'a note for the grown-up' (shown above with a "Read to me" tag).

   THE VISUALS
   ar-lines      kinds of line. kinds: keys of MathLadder.art.LINES (straight curved zigzag wavy spiral loopy dotted dashed vertical
                 horizontal diagonal thick thin light dark), default the first five; labels: 'names' | 'letters' | 'none' (quiet:
                 letters); columns; rotate: {index or kind: degrees} (turn a card's line, e.g. a straight line at 30°); color: a CSS color for every line, or colors: [one per card]; animate: true (each line draws itself); mode: 'show' | 'pick' (target: a kind; tap, Check) |
                 'things' (kinds: keys of A.LINE_THINGS: ladder fence lightning waves snail rain road rainbow flagpole horizon slide
                 mountains lollipop footprints, pictures whose main line is known) | 'weight' (the same mug drawn with one line
                 weight and with varied weight; good: 'A' | 'B', default 'B').
   ar-shapes     shapes and drawings made of shapes. mode 'shapes' (default): shapes: keys of A.SHAPES; labels; rotate: {square: 45}
                 or {index: degrees}; count: true (sides and corners under the name); corners: true (dots on the corners);
                 color: false (outlines); target: a key or keys (tap, Check). mode 'drawing': draw: a key of A.DRAWINGS (house cat
                 fish bird car train tree flower snowman sun owl), drawn exactly from its parts; steps: true (Back/Next, one shape at
                 a time, named); highlight: a role or a shape; ask: a role (a "?" on that part); labels: true (role names); tally:
                 true (how many of each shape); outline: true (no fill, for tracing). mode 'scene': scene: a key of A.SCENES
                 (sky-gap sky-full tiny big near-far far-same overlap see-through) or compare: [key, key] (pictures A and B).
                 mode 'picture': picture: 'portrait' | 'landscape' | 'still-life' or a list (simple framed pictures); letters: true.
   ar-canvas     a drawing pad (mouse, touch and pen; pressure where the pen gives it). guide: 'none' | 'grid' (grid: cells across)
                 | 'thirds' | 'symmetry' (strokes are mirrored) | 'dots' | 'value' (steps: boxes for a value scale, and a
                 "Check my value scale" button that measures each box) | 'lines' (kinds: dotted lines to trace) | 'ellipses' |
                 'face' (head proportion lines) | 'box' (a horizon line and a vanishing point; horizon: 0–1) | 'trace' (trace:
                 { draw: 'cat' } or { shape: 'star' }); height; aspect; colors: false or a list; gray: true (two grays only);
                 size; pressure: false; mirror: true (a Mirror button); save: false hides "Save picture" (PNG to the device);
                 print: true adds "Print a practice sheet" (the guide alone, full page); printTitle; filename.
   ar-pattern    mode 'row' (default): seq: ['circle:red', …] or core: 'AB' | 'ABB' | 'AAB' | 'ABC' | 'AABB' | 'ABAC' with motifs and n;
                 missing: index or 'next' (a "?" slot); choices: [motifs] (tap one, it is checked); answer. mode 'nature':
                 nature: keys of A.NATURE_PATTERNS (stripes spots scales spiral hexagons rings). mode 'symmetry': thing: a key of
                 A.SYMMETRIC (butterfly leaf heart house vase face bug); show: 'half' (with a Show button) | 'whole'; compare: true
                 (A mirrored and B copied without flipping; good: 'A' | 'B'); line: false hides the mirror line. mode 'rhythm':
                 rhythm: 'regular' | 'alternating' | 'progressive' | 'flowing' or a list. mode 'star': an Islamic eight-pointed
                 star pattern.
   ar-face       mode 'show': mood (A.MOODS: happy sad surprised angry worried sleepy neutral), age: 'kid' | 'adult' | 'older',
                 hair (color), hairStyle: 'long' | 'bald', glasses, hat, shirt, labels. mode 'mood': the same with buttons to change
                 the mood. mode 'moods': moods: [keys] side by side (quiet: lettered). mode 'compare': faces A and B, one with the
                 eyes too high; good. mode 'guide': an adult head with proportion lines (A.HEAD); drag: true lets learners drag the
                 eyes, nose and mouth onto their lines, with Check and Show me. mode 'turn': views: front, three-quarter, profile.
                 mode 'eye': eyes A and B, one with the upper lid over the iris (right) and one with the iris floating; good.
   ar-value      mode 'show': steps (default 7) from white to black; hue: a hex (tints to shades of one color); letters; numbers:
                 false. mode 'order': the steps shuffled (seed or order: [indexes]); tap two to swap, Check, Show me. mode
                 'missing': missing: index (a "?"); choices: [step indexes]. mode 'pencils': grades: ['2H', 'HB', '4B'…] and the
                 lines they make; shuffle: 'seed'; letters. mode 'gray' or colors: [hex…]: swatches with "Show in gray (value
                 only)"; gray: true starts in gray. mode 'key': keys: ['high', 'low', 'contrast', 'flat'] (small landscapes).
   ar-marks      kinds: keys of A.MARKS (hatching crosshatching stippling blending scribbling contour) or of A.TEXTURES (fur wood
                 sand brick scales grass water stone); texture: true (default texture set); density 0–1; ramp: true (each swatch
                 steps light to dark); slider: true (a density slider); desc: false; seed.
   ar-shade      form: 'sphere' | 'cube' | 'cylinder' | 'cone'; light: degrees (0 from the right, 90 from above, 180 from the left;
                 default 135); learners drag to move the light; parts: which to label (A.LIGHT_PARTS keys: highlight light halftone
                 core reflected cast occlusion; a cube uses top front side cast); labels: 'letters' (quiet does this) in the order
                 of parts or order: [keys]; target: a part (tap a label, Check). kid: true: young artists' version, a tree or a
                 ball (thing) with the sun (sun: 'left' | 'right') and shadows A and B (good); choices: false shows only the true shadow.
   ar-persp      points: 1 | 2 | 3; horizon 0–1 (fraction of the height); boxes: [{x, y, w, h}] (1-point: front faces; 2- and
                 3-point: {x, y (base), h}); vp, left, right, third (positions of vanishing points); down: true (three-point looking
                 down); lines: false hides construction lines; dots: false; names: false. Learners drag the horizon and the
                 vanishing points. mode 'road' (a road with posts and dashes going to one point); mode 'depth' (cue: overlap | size |
                 placement | none, or a list, as small pictures); mode 'atmos' (hills fading with distance; flat: true draws them
                 all the same, the mistake).
   ar-proportion mode 'figures': figures: keys of A.FIGURES (adult teen child young toddler) on a head-height ruler. mode
                 'sighting': object, units (a bottle measured in caps, with a pencil and thumb). mode 'hand' (palm and middle
                 finger, the knuckle arc). mode 'mannequin' | 'gesture' (a clothed mannequin; bend −1 to 1 and a slider; gesture
                 shows the line of action; loa: true). mode 'grid': draw (a key of A.DRAWINGS), cells, copied: true.
   ar-wheel      the painter's 12-hue wheel (A.WHEEL). segments 12 | 6 | 3; scheme: 'complementary' | 'analogous' | 'triadic' |
                 'split' | 'monochromatic' | 'tetradic' with base (a hue key; learners tap to move it and switch schemes;
                 choose: false); labels: false | 'letters' | 'kind'; only: [keys] (others grayed) or 'primary'; blank: [keys]
                 ("?" wedges); temperature: true (warm and cool halves); target: key or keys (tap, Check; why). mode 'rainbow'
                 (blank: band index). mode 'mix': paints (keys) to mix on a palette; a, b (preset); hideResult. mode 'light':
                 red, green and blue spotlights (additive) or ink: true for cyan, magenta and yellow (subtractive); on: 'rg' etc.;
                 drag the circles; toggles. mode 'tints': hue; only: 'tints' | 'tones' | 'shades'. mode 'contrast': color (or a gray)
                 on grounds [hex, hex], with a Join button. mode 'hsv': hue, value, saturation sliders.
   ar-design     kinds: keys of A.DESIGNS (balance-sym balance-asym balance-radial contrast emphasis movement pattern
                 rhythm-progressive unity variety chaos dull proportion positive-negative line shape form space value texture color);
                 letters; columns; target (tap, Check); seed.
   ar-compose    a picture with overlays: work: a catalog id (its image, when there is one) or scene: { sx, sy (subject, 0–1),
                 hy (horizon), subject: 'tree' | 'house' | 'boat' | 'rock', road: true, sea: true, sun: [x, y] }; overlays:
                 ['thirds', 'center', 'diagonals', 'focal']; focal: [x, y]; shape: [[x, y]…] (a compositional triangle etc.);
                 lines: [[x1, y1, x2, y2]…] (leading lines); tap: true (learners tap the focal point; why); toggles: false.
                 mode 'thumbs': thumbs: [scene, …] lettered thumbnails; showGrid. A.thirdsOf(fraction) names a line.
   ar-artwork    work: a catalog id. The image (when A.hasImg) with zoom (buttons, wheel, pinch) and pan; hotspots: [{x, y (0–1),
                 label, text}] (numbered); label: false hides the museum label; full: false shortens it. Without an image, a
                 framed placeholder with the title (quiet: "Picture not available"), so generators must check A.hasImg first.
   ar-compare    works: [id, id] side by side (A and B); table: false; rows: ['period', 'date', 'medium', 'genre', 'made', 'at',
                 'style']; points: ['HTML', …]. quiet: letters only.
   ar-timeline   periods: [keys of A.PERIODS] or tracks: ['europe', 'islamic', 'eastasia', 'southasia', 'africa', 'americas']; from,
                 to (years, negative = BC); works: [ids] as numbered dots; hideNames (with quiet: bars lettered); target: a period key
                 (tap a bar, Check). mode 'order': items: [period keys or work ids] shuffled (start: [indexes]); swap, Check.
   ar-map        region: 'world' | 'europe' | 'mediterranean' | 'asia' | 'east-asia' | 'middle-east' | 'africa' | 'americas' |
                 'mesoamerica' | 'usa'; works: [ids] at where: 'made' (default) | 'now'; places: [city keys of A.CITIES];
                 travel: true (arcs from where made to where now); labels: 'works'; letters; target: a city key or a work id
                 (tap, Check). Coastlines: Natural Earth, public domain.
   ar-sort       bins: ['…', '…']; cards: [{ text, bin, why, swatch: hex, shape: key, line: key, work: id }] or strings; shuffle:
                 false; columns; reveal: false; solved: true.
   ar-arch       show: 'orders' (order: [doric, ionic, corinthian] in any order) | 'arches' | 'vaults' | 'buttress' | 'dome' |
                 'basilica' (transept: true) | 'mosque' | 'facades' (kinds) | 'frame'. Labels name the parts; with quiet or
                 letters: true, lettered badges in the order of A.ARCH_PARTS[show] (or of order/kinds when given).

   THE MODEL: MathLadder.art (pure data and functions; works in node)
     Color: WHEEL (12 hues, red first, each {key, name, kind: primary|secondary|tertiary, hex}); hue(k), hueIdx(k); PRIMARIES,
     SECONDARIES, TERTIARIES; WARM, COOL, temperature(k) ('warm' | 'cool' | 'border' for yellow-green and red-violet);
     RAINBOW, RAINBOW_HEX; scheme(kind, base) -> hue keys; complement(k); schemeOf(keys) -> kind or ''; SCHEMES (names);
     mixPaint(a, b) -> {key, name, hex} (primary + primary = secondary; primary + neighboring secondary = tertiary; complements =
     a neutral); mixLight('rg') and mixInk('cm') -> {key, name, hex}; MODELS (RYB, CMY, RGB); tint/shade/tone(hex, t);
     luminance(hex); contrast(hexA, hexB) (WCAG ratio); grayOf(hex); lightness(hex) (CIE L*); valueScale(n).
     Drawing: LINES, LINE_THINGS, SHAPES (sides, corners, kind geometric|organic), FORMS (shape -> form), DRAWINGS (parts),
     drawingCount(key, shape?), partShape(key, role), PAT_COLORS, PAT_CORES, pattern(core, motifs, n), motifName(m),
     NATURE_PATTERNS, SYMMETRIC, MOODS, HEAD (proportions 0 = top of skull, 1 = chin; rules), FIGURES (heads), JOINTS,
     PENCILS ([grade, darkness]), pencilRank(g), darkerPencil(a, b), MARKS, TEXTURES, LIGHT_PARTS, LIGHT_ORDER, lightDir(deg),
     PERSPECTIVE, DEPTH_CUES, BALANCE, SCENES, PICTURES, DESIGNS, thirdsOf(f), RHYTHMS.
     Design: ELEMENTS and PRINCIPLES ([key, name, definition]).
     Art history: PAINT_MEDIA, SCULPT, PRINTS (family relief|intaglio|planographic|stencil), GENRES, ORDERS, ARCH_TERMS,
     ARCH_PARTS, ARCH_SHOWS, STYLE_CLUES (period key -> visual clues); PERIODS ([{key, name, start, end, track}]), TRACKS,
     CITIES ({key: [name, lat, lon]}), WORKS ([{id, title, artist, date, year, period, kind, medium, at, now, made, genre,
     people, topics, note, style, pd, img, w, h, credit}]); period(k), work(id), city(k), imgUrl(w), hasImg(w), worksFor(topic),
     worksIn(period), works(filter), yearText(y), century(y), ord(n), label(w), land().
     A work has img: true only when its picture has been fetched, reduced and checked (no nudity) and is on the site.         */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  /* =====================================================================================================================
     THE MODEL: MathLadder.art (pure data and functions; no DOM; works in node)
     ===================================================================================================================== */
  var A = ML.art = ML.art || {};
  var M = Math;
  function mod(a, n) { return ((a % n) + n) % n; }

  // ---------------------------------------------------------------- the painter's color wheel (traditional RYB, 12 hues)
  // index 0 = red, going red, red-orange, orange, … around to red-violet. kind: primary | secondary | tertiary.
  var WHEEL = [
    { key: 'red', name: 'red', kind: 'primary', hex: '#e03127' },
    { key: 'red-orange', name: 'red-orange', kind: 'tertiary', hex: '#ec5a24' },
    { key: 'orange', name: 'orange', kind: 'secondary', hex: '#f5871f' },
    { key: 'yellow-orange', name: 'yellow-orange', kind: 'tertiary', hex: '#fbb21f' },
    { key: 'yellow', name: 'yellow', kind: 'primary', hex: '#fde13a' },
    { key: 'yellow-green', name: 'yellow-green', kind: 'tertiary', hex: '#a6cc3a' },
    { key: 'green', name: 'green', kind: 'secondary', hex: '#3aa64a' },
    { key: 'blue-green', name: 'blue-green', kind: 'tertiary', hex: '#14968a' },
    { key: 'blue', name: 'blue', kind: 'primary', hex: '#2160b8' },
    { key: 'blue-violet', name: 'blue-violet', kind: 'tertiary', hex: '#4a3fa0' },
    { key: 'violet', name: 'violet', kind: 'secondary', hex: '#7b3294' },
    { key: 'red-violet', name: 'red-violet', kind: 'tertiary', hex: '#b42a74' }
  ];
  var WI = {}; WHEEL.forEach(function (c, i) { WI[c.key] = i; });
  WI.purple = WI.violet;
  function hueIdx(k) { if (typeof k === 'number') return mod(k, 12); var i = WI[String(k).toLowerCase()]; if (i === undefined) throw new Error('art: unknown hue ' + k); return i; }
  function hue(k) { return WHEEL[hueIdx(k)]; }
  A.WHEEL = WHEEL; A.hue = hue; A.hueIdx = hueIdx;
  A.PRIMARIES = ['red', 'yellow', 'blue']; A.SECONDARIES = ['orange', 'green', 'violet'];
  A.TERTIARIES = ['red-orange', 'yellow-orange', 'yellow-green', 'blue-green', 'blue-violet', 'red-violet'];
  A.WARM = ['red', 'red-orange', 'orange', 'yellow-orange', 'yellow'];       // yellow-green and red-violet sit on the border
  A.COOL = ['green', 'blue-green', 'blue', 'blue-violet', 'violet'];
  A.temperature = function (k) { var key = hue(k).key; return A.WARM.indexOf(key) >= 0 ? 'warm' : A.COOL.indexOf(key) >= 0 ? 'cool' : 'border'; };
  A.RAINBOW = ['red', 'orange', 'yellow', 'green', 'blue', 'violet'];   // the order in a rainbow (red on the outside edge)
  A.RAINBOW_HEX = { red: '#e03127', orange: '#f5871f', yellow: '#fde13a', green: '#3aa64a', blue: '#2160b8', violet: '#7b3294' };
  // schemes on the painter's wheel; each returns hue keys, the base first
  A.scheme = function (kind, base) {
    var i = hueIdx(base), K = function (d) { return WHEEL[mod(i + d, 12)].key; };
    switch (kind) {
      case 'complementary': return [K(0), K(6)];
      case 'analogous': return [K(-1), K(0), K(1)].sort(function (a, b) { return a === K(0) ? -1 : b === K(0) ? 1 : 0; });
      case 'triadic': return [K(0), K(4), K(8)];
      case 'split': return [K(0), K(5), K(7)];
      case 'tetradic': return [K(0), K(3), K(6), K(9)];
      case 'monochromatic': return [K(0)];
      default: throw new Error('art: unknown scheme ' + kind);
    }
  };
  A.complement = function (k) { return WHEEL[mod(hueIdx(k) + 6, 12)].key; };
  A.SCHEMES = { complementary: 'Complementary', analogous: 'Analogous', triadic: 'Triadic', split: 'Split-complementary', monochromatic: 'Monochromatic', tetradic: 'Tetradic' };
  // what kind of scheme a set of hue keys forms on the 12-hue wheel ('' if none)
  A.schemeOf = function (keys) {
    var ix = keys.map(hueIdx).filter(function (v, j, a) { return a.indexOf(v) === j; }).sort(function (a, b) { return a - b; });
    var n = ix.length; if (n === 1) return 'monochromatic';
    function gaps() { var g = []; for (var j = 0; j < n; j++) g.push(mod(ix[(j + 1) % n] - ix[j], 12)); return g.sort(function (a, b) { return a - b; }).join(','); }
    var G = gaps();
    if (n === 2 && G === '6,6') return 'complementary';
    if (n === 3 && G === '4,4,4') return 'triadic';
    if (n === 3 && G === '1,1,10') return 'analogous';
    if (n === 3 && G === '2,5,5') return 'split';
    if (n === 4 && G === '3,3,3,3') return 'tetradic';
    return '';
  };
  // paint mixing on the painter's wheel (a teaching model): two primaries make the secondary between them; a primary and a
  // neighboring secondary make the tertiary between them; complements make a neutral (brown or gray); a hue with itself stays.
  A.mixPaint = function (a, b) {
    var i = hueIdx(a), j = hueIdx(b), d = mod(j - i, 12);
    if (d === 0) return { key: WHEEL[i].key, name: WHEEL[i].name, hex: WHEEL[i].hex };
    if (d === 6) return { key: 'neutral', name: 'brown or gray (a neutral)', hex: '#7a6a58' };
    if (d === 4 || d === 8) { // two primaries or two secondaries
      var mid = d === 4 ? mod(i + 2, 12) : mod(j + 2, 12);
      if (WHEEL[i].kind === 'primary' && WHEEL[j].kind === 'primary') return { key: WHEEL[mid].key, name: WHEEL[mid].name, hex: WHEEL[mid].hex };
    }
    if (d === 2 || d === 10) { var m2 = d === 2 ? mod(i + 1, 12) : mod(j + 1, 12); return { key: WHEEL[m2].key, name: WHEEL[m2].name, hex: WHEEL[m2].hex, dull: false }; }
    return { key: 'mix', name: 'a duller in-between color', hex: mixHex(WHEEL[i].hex, WHEEL[j].hex, 0.5, true) };
  };
  // light (additive) and printing inks (subtractive): sets of letters r g b / c m y
  var LIGHT = { '': ['black', '#000000'], r: ['red', '#ff0000'], g: ['green', '#00ff00'], b: ['blue', '#0000ff'], rg: ['yellow', '#ffff00'], gb: ['cyan', '#00ffff'], rb: ['magenta', '#ff00ff'], rgb: ['white', '#ffffff'] };
  var INK = { '': ['white (the paper)', '#ffffff'], c: ['cyan', '#00aeef'], m: ['magenta', '#ec008c'], y: ['yellow', '#fff200'], cm: ['blue', '#2e3192'], my: ['red', '#ed1c24'], cy: ['green', '#00a651'], cmy: ['black (in practice a dark muddy brown, so printers add black ink, K)', '#231f20'] };
  function setKey(s, order) { s = String(s).toLowerCase(); return order.split('').filter(function (ch) { return s.indexOf(ch) >= 0; }).join(''); }
  A.mixLight = function (s) { var k = setKey(s, 'rgb'), r = LIGHT[k]; return { key: k, name: r[0], hex: r[1] }; };
  A.mixInk = function (s) { var k = setKey(s, 'cmy'), r = INK[k]; return { key: k, name: r[0], hex: r[1] }; };
  A.MODELS = { ryb: { name: 'Painter\'s primaries (RYB)', primaries: ['red', 'yellow', 'blue'], use: 'traditional painting and art classes' },
    cmy: { name: 'Printer\'s primaries (CMY, plus black K)', primaries: ['cyan', 'magenta', 'yellow'], use: 'printing inks and modern pigment mixing' },
    rgb: { name: 'Light primaries (RGB)', primaries: ['red', 'green', 'blue'], use: 'screens, stage lights and anything that gives off light' } };

  // ---------------------------------------------------------------- color math (hex, value, tints, contrast)
  function hx(hex) { hex = String(hex).replace('#', ''); if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join(''); var v = parseInt(hex, 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
  function toHex(rgb) { return '#' + rgb.map(function (v) { v = M.max(0, M.min(255, M.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mixHex(a, b, t, dull) { var p = hx(a), q = hx(b), r = [0, 1, 2].map(function (k) { return p[k] * (1 - t) + q[k] * t; }); if (dull) { var g = (r[0] + r[1] + r[2]) / 3; r = r.map(function (v) { return v * 0.75 + g * 0.25; }); } return toHex(r); }
  A.mixHex = mixHex; A.hex2rgb = hx; A.rgb2hex = toHex;
  A.tint = function (hex, t) { return mixHex(hex, '#ffffff', t); };
  A.shade = function (hex, t) { return mixHex(hex, '#000000', t); };
  A.tone = function (hex, t) { return mixHex(hex, '#808080', t); };
  function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : M.pow((c + 0.055) / 1.055, 2.4); }
  A.luminance = function (hex) { var c = hx(hex); return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]); };
  // WCAG 2 contrast ratio (1 to 21)
  A.contrast = function (a, b) { var x = A.luminance(a), y = A.luminance(b); if (x < y) { var t = x; x = y; y = t; } return (x + 0.05) / (y + 0.05); };
  // a gray of the same lightness (CIE L*), for "show in gray"
  A.grayOf = function (hex) { var y = A.luminance(hex), s = y <= 0.0031308 ? 12.92 * y : 1.055 * M.pow(y, 1 / 2.4) - 0.055; return toHex([s * 255, s * 255, s * 255]); };
  A.lightness = function (hex) { var Y = A.luminance(hex); return Y > 0.008856 ? 116 * M.cbrt(Y) - 16 : 903.3 * Y; };
  // an even value scale of n steps from white to black (by lightness L*), as hex grays
  A.valueScale = function (n) { var out = []; for (var i = 0; i < n; i++) { var L = 100 - 100 * i / (n - 1), y = L > 8 ? M.pow((L + 16) / 116, 3) : L / 903.3, s = y <= 0.0031308 ? 12.92 * y : 1.055 * M.pow(y, 1 / 2.4) - 0.055; out.push(toHex([s * 255, s * 255, s * 255])); } return out; };

  // ---------------------------------------------------------------- lines, shapes, drawings from shapes
  A.LINES = {
    straight: { name: 'straight', group: 'kind', desc: 'goes one way without bending' },
    curved: { name: 'curved', group: 'kind', desc: 'bends smoothly' },
    zigzag: { name: 'zigzag', group: 'kind', desc: 'sharp points, up and down' },
    wavy: { name: 'wavy', group: 'kind', desc: 'smooth bumps, up and down' },
    spiral: { name: 'spiral', group: 'kind', desc: 'winds around and around' },
    loopy: { name: 'loopy', group: 'kind', desc: 'curls over itself in loops' },
    dotted: { name: 'dotted', group: 'kind', desc: 'made of dots' },
    dashed: { name: 'dashed', group: 'kind', desc: 'made of short dashes' },
    vertical: { name: 'vertical', group: 'direction', desc: 'stands up tall' },
    horizontal: { name: 'horizontal', group: 'direction', desc: 'lies down flat' },
    diagonal: { name: 'diagonal', group: 'direction', desc: 'leans' },
    thick: { name: 'thick', group: 'weight', desc: 'wide and bold' },
    thin: { name: 'thin', group: 'weight', desc: 'narrow and fine' },
    light: { name: 'light', group: 'weight', desc: 'pale, pressed gently' },
    dark: { name: 'dark', group: 'weight', desc: 'strong, pressed harder' }
  };
  // things in the world and the line that stands out in them (for ydraw.lines-all-around)
  A.LINE_THINGS = {
    ladder: { name: 'the rungs of a ladder', line: 'horizontal' }, fence: { name: 'the posts of a fence', line: 'vertical' },
    lightning: { name: 'a lightning bolt', line: 'zigzag' }, waves: { name: 'waves on the water', line: 'wavy' },
    snail: { name: 'a snail\'s shell', line: 'spiral' }, rain: { name: 'rain blowing in the wind', line: 'diagonal' },
    road: { name: 'the middle of a road', line: 'dashed' }, rainbow: { name: 'a rainbow', line: 'curved' },
    flagpole: { name: 'a flagpole', line: 'vertical' }, horizon: { name: 'where the sea meets the sky', line: 'horizontal' },
    slide: { name: 'a playground slide', line: 'diagonal' }, mountains: { name: 'a row of pointy mountains', line: 'zigzag' },
    lollipop: { name: 'a swirl lollipop', line: 'spiral' }, footprints: { name: 'a trail of footprints', line: 'dotted' }
  };
  A.SHAPES = {
    circle: { name: 'circle', sides: 0, corners: 0, kind: 'geometric' }, square: { name: 'square', sides: 4, corners: 4, kind: 'geometric' },
    triangle: { name: 'triangle', sides: 3, corners: 3, kind: 'geometric' }, rectangle: { name: 'rectangle', sides: 4, corners: 4, kind: 'geometric' },
    oval: { name: 'oval', sides: 0, corners: 0, kind: 'geometric' }, diamond: { name: 'diamond (rhombus)', sides: 4, corners: 4, kind: 'geometric' },
    star: { name: 'star', sides: 10, corners: 10, points: 5, kind: 'geometric' }, heart: { name: 'heart', sides: 0, corners: 1, count: 'two bumps and a point', kind: 'geometric' },
    hexagon: { name: 'hexagon', sides: 6, corners: 6, kind: 'geometric' }, semicircle: { name: 'half circle', sides: 1, corners: 2, kind: 'geometric' },
    leaf: { name: 'leaf', kind: 'organic' }, cloud: { name: 'cloud', kind: 'organic' }, puddle: { name: 'puddle', kind: 'organic' },
    rock: { name: 'pebble', kind: 'organic' }, blob: { name: 'splash', kind: 'organic' }, flame: { name: 'flame', kind: 'organic' }
  };
  A.FORMS = { circle: 'sphere', square: 'cube', triangle: 'cone', rectangle: 'cylinder' };
  // drawings built from shapes: parts in drawing order (big shapes first). x, y, w, h in a 200 x 160 box. The visual draws exactly
  // these parts, so a generator can count them ("How many circles?") or ask what a part is ("What shape is the roof?").
  A.DRAWINGS = {
    house: { name: 'a house', parts: [
      { shape: 'square', role: 'walls', x: 56, y: 62, w: 88, h: 88 }, { shape: 'triangle', role: 'roof', x: 44, y: 16, w: 112, h: 46 },
      { shape: 'rectangle', role: 'door', x: 88, y: 108, w: 24, h: 42 }, { shape: 'square', role: 'window', x: 64, y: 76, w: 20, h: 20 },
      { shape: 'square', role: 'window', x: 116, y: 76, w: 20, h: 20 }, { shape: 'circle', role: 'doorknob', x: 105, y: 128, w: 4, h: 4 }] },
    cat: { name: 'a cat', parts: [
      { shape: 'oval', role: 'body', x: 70, y: 82, w: 92, h: 62 }, { shape: 'circle', role: 'head', x: 38, y: 40, w: 56, h: 56 },
      { shape: 'triangle', role: 'ear', x: 40, y: 22, w: 20, h: 26 }, { shape: 'triangle', role: 'ear', x: 72, y: 22, w: 20, h: 26 },
      { shape: 'circle', role: 'eye', x: 52, y: 58, w: 7, h: 7 }, { shape: 'circle', role: 'eye', x: 73, y: 58, w: 7, h: 7 },
      { shape: 'triangle', role: 'nose', x: 62, y: 70, w: 8, h: 6, flip: true }, { shape: 'curve', role: 'tail', x: 158, y: 70, w: 32, h: 56 }] },
    fish: { name: 'a fish', parts: [
      { shape: 'oval', role: 'body', x: 40, y: 50, w: 110, h: 64 }, { shape: 'triangle', role: 'tail', x: 146, y: 52, w: 44, h: 60, point: 'left' },
      { shape: 'circle', role: 'eye', x: 62, y: 70, w: 10, h: 10 }, { shape: 'triangle', role: 'fin', x: 82, y: 36, w: 34, h: 20 }] },
    bird: { name: 'a bird', parts: [
      { shape: 'oval', role: 'body', x: 60, y: 70, w: 100, h: 58, ly: 118 }, { shape: 'circle', role: 'head', x: 36, y: 42, w: 46, h: 46, ly: 76 },
      { shape: 'triangle', role: 'beak', x: 16, y: 58, w: 22, h: 14, point: 'left', ly: 78 }, { shape: 'circle', role: 'eye', x: 50, y: 56, w: 7, h: 7, ly: 42 },
      { shape: 'curve', role: 'wing', x: 88, y: 80, w: 50, h: 30 }, { shape: 'triangle', role: 'tail', x: 154, y: 72, w: 36, h: 30, point: 'left' }] },
    car: { name: 'a car', parts: [
      { shape: 'rectangle', role: 'body', x: 20, y: 76, w: 160, h: 46 }, { shape: 'rectangle', role: 'roof', x: 55, y: 40, w: 90, h: 38 },
      { shape: 'square', role: 'window', x: 66, y: 48, w: 26, h: 26 }, { shape: 'square', role: 'window', x: 106, y: 48, w: 26, h: 26 },
      { shape: 'circle', role: 'wheel', x: 38, y: 104, w: 36, h: 36 }, { shape: 'circle', role: 'wheel', x: 126, y: 104, w: 36, h: 36 }] },
    train: { name: 'a train engine', parts: [
      { shape: 'rectangle', role: 'cab', x: 110, y: 40, w: 60, h: 76 }, { shape: 'rectangle', role: 'boiler', x: 30, y: 66, w: 82, h: 50 },
      { shape: 'rectangle', role: 'chimney', x: 44, y: 34, w: 18, h: 32 }, { shape: 'square', role: 'window', x: 126, y: 50, w: 28, h: 28 },
      { shape: 'circle', role: 'wheel', x: 36, y: 108, w: 34, h: 34 }, { shape: 'circle', role: 'wheel', x: 82, y: 108, w: 34, h: 34 }, { shape: 'circle', role: 'wheel', x: 128, y: 108, w: 34, h: 34 }] },
    tree: { name: 'a tree', parts: [
      { shape: 'rectangle', role: 'trunk', x: 88, y: 88, w: 24, h: 62 }, { shape: 'cloud', role: 'leaves', x: 40, y: 14, w: 120, h: 86 }] },
    flower: { name: 'a flower', parts: [
      { shape: 'rectangle', role: 'stem', x: 97, y: 82, w: 6, h: 70 }, { shape: 'oval', role: 'leaf', x: 104, y: 112, w: 30, h: 14 },
      { shape: 'oval', role: 'petal', x: 88, y: 18, w: 24, h: 30 }, { shape: 'oval', role: 'petal', x: 112, y: 36, w: 30, h: 24 },
      { shape: 'oval', role: 'petal', x: 88, y: 60, w: 24, h: 30 }, { shape: 'oval', role: 'petal', x: 58, y: 36, w: 30, h: 24 },

      { shape: 'circle', role: 'center', x: 84, y: 38, w: 32, h: 32 }] },
    snowman: { name: 'a snowman', parts: [
      { shape: 'circle', role: 'bottom', x: 64, y: 86, w: 72, h: 72 }, { shape: 'circle', role: 'middle', x: 74, y: 40, w: 52, h: 52 },
      { shape: 'circle', role: 'head', x: 82, y: 8, w: 36, h: 36 }, { shape: 'triangle', role: 'nose', x: 100, y: 23, w: 16, h: 7, point: 'right' },
      { shape: 'circle', role: 'button', x: 97, y: 56, w: 6, h: 6 }, { shape: 'circle', role: 'button', x: 97, y: 72, w: 6, h: 6 }] },
    sun: { name: 'the sun', parts: [{ shape: 'circle', role: 'sun', x: 64, y: 44, w: 72, h: 72 }].concat([0, 1, 2, 3, 4, 5, 6, 7].map(function (k) { return { shape: 'line', role: 'ray', a: k * 45, x: 100, y: 80, w: 0, h: 0 }; })) },
    owl: { name: 'an owl', parts: [
      { shape: 'oval', role: 'body', x: 54, y: 30, w: 92, h: 118, ly: 130 }, { shape: 'triangle', role: 'ear', x: 58, y: 20, w: 22, h: 24 }, { shape: 'triangle', role: 'ear', x: 120, y: 20, w: 22, h: 24 },
      { shape: 'circle', role: 'eye', x: 66, y: 50, w: 30, h: 30 }, { shape: 'circle', role: 'eye', x: 104, y: 50, w: 30, h: 30 },
      { shape: 'triangle', role: 'beak', x: 93, y: 82, w: 14, h: 14, flip: true }, { shape: 'oval', role: 'wing', x: 46, y: 80, w: 22, h: 52 }, { shape: 'oval', role: 'wing', x: 132, y: 80, w: 22, h: 52 }] }
  };
  A.drawingCount = function (key, shape) { return A.DRAWINGS[key].parts.filter(function (p) { return !shape || p.shape === shape; }).length; };
  A.partShape = function (key, role) { var p = A.DRAWINGS[key].parts.filter(function (q) { return q.role === role; })[0]; return p ? p.shape : null; };

  // ---------------------------------------------------------------- patterns
  // a motif is 'shape:color' (shape from circle square triangle star heart diamond; color a key of PAT_COLORS)
  A.PAT_COLORS = { red: '#e03127', blue: '#2160b8', yellow: '#f2c22e', green: '#3aa64a', orange: '#f5871f', purple: '#7b3294', pink: '#e86aa6', brown: '#8a5a32' };
  A.PAT_CORES = { AB: [0, 1], ABB: [0, 1, 1], AAB: [0, 0, 1], ABC: [0, 1, 2], AABB: [0, 0, 1, 1], ABCD: [0, 1, 2, 3], ABAC: [0, 1, 0, 2] };
  A.pattern = function (core, motifs, n) { var c = A.PAT_CORES[core] || core, out = []; for (var i = 0; i < n; i++) out.push(motifs[c[i % c.length]]); return out; };
  A.motifName = function (m) { var p = String(m).split(':'); return (p[1] ? p[1] + ' ' : '') + (A.SHAPES[p[0]] ? A.SHAPES[p[0]].name.replace(/ \(.*\)/, '') : p[0]); };
  A.NATURE_PATTERNS = { stripes: { name: 'stripes', on: 'a zebra or a tiger' }, spots: { name: 'spots', on: 'a leopard or a ladybug' }, scales: { name: 'scales', on: 'a fish or a snake' },
    spiral: { name: 'a spiral', on: 'a snail shell or a sunflower\'s seeds' }, hexagons: { name: 'hexagons', on: 'a honeycomb' }, rings: { name: 'rings', on: 'a tree stump' } };
  A.SYMMETRIC = { butterfly: 'a butterfly', leaf: 'a leaf', heart: 'a heart', house: 'a house', vase: 'a vase', face: 'a face', bug: 'a ladybug' };

  // ---------------------------------------------------------------- faces and figures
  A.MOODS = { happy: { name: 'happy', mouth: 'up', brows: 'relaxed' }, sad: { name: 'sad', mouth: 'down', brows: 'worried' }, surprised: { name: 'surprised', mouth: 'round', brows: 'raised' },
    angry: { name: 'cross (angry)', mouth: 'flat', brows: 'down' }, worried: { name: 'worried', mouth: 'wavy', brows: 'worried' }, sleepy: { name: 'sleepy', mouth: 'small', brows: 'relaxed', eyes: 'closed' },
    neutral: { name: 'calm', mouth: 'flat', brows: 'relaxed' } };
  // average proportions of an adult head seen from the front (0 = top of the skull, 1 = chin). Real faces vary.
  A.HEAD = { eyes: 0.5, brows: 0.44, noseBottom: 0.75, mouth: 0.83, earTop: 0.44, earBottom: 0.75, hairline: 0.2, eyeWidths: 5,
    rules: ['The eyes sit about halfway between the top of the head and the chin.', 'The head is about five eye-widths wide, with one eye-width between the eyes.',
      'The bottom of the nose is about halfway between the eyes and the chin.', 'The mouth is about one third of the way from the nose to the chin.',
      'The ears run from about the brow line to the bottom of the nose.', 'The corners of the mouth line up roughly below the pupils.'] };
  // figures in head heights (averages taught to artists; people vary)
  A.FIGURES = { adult: { name: 'an adult', heads: 7.5, half: 'at the hips' }, teen: { name: 'a teenager', heads: 7 }, child: { name: 'a child of about six', heads: 6 },
    young: { name: 'a young child of about three', heads: 5 }, toddler: { name: 'a toddler', heads: 4 } };
  A.JOINTS = ['neck', 'shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle'];

  // ---------------------------------------------------------------- drawing materials, value, marks, light
  // pencil grades from hardest (lightest) to softest (darkest), with a rough value (0 = white, 1 = black) of a firm stroke
  A.PENCILS = [['6H', 0.18], ['4H', 0.24], ['2H', 0.32], ['H', 0.38], ['F', 0.42], ['HB', 0.47], ['B', 0.53], ['2B', 0.6], ['4B', 0.7], ['6B', 0.79], ['8B', 0.87]];
  A.pencilRank = function (g) { for (var i = 0; i < A.PENCILS.length; i++) if (A.PENCILS[i][0] === g) return i; return -1; };
  A.darkerPencil = function (a, b) { return A.pencilRank(a) > A.pencilRank(b) ? a : b; };
  A.MARKS = { hatching: { name: 'hatching', desc: 'parallel lines' }, crosshatching: { name: 'cross-hatching', desc: 'layers of lines crossing each other' },
    stippling: { name: 'stippling', desc: 'dots' }, blending: { name: 'blending (smooth tone)', desc: 'smooth, even tone' }, scribbling: { name: 'scribbling', desc: 'loose tangled loops' },
    contour: { name: 'contour hatching', desc: 'curved lines that follow the form' } };
  A.TEXTURES = { fur: { name: 'fur', mark: 'short strokes in the direction the fur grows' }, wood: { name: 'wood grain', mark: 'long wavy lines with knots' },
    sand: { name: 'sand', mark: 'scattered dots' }, brick: { name: 'brick', mark: 'staggered rectangles' }, scales: { name: 'scales', mark: 'rows of overlapping curves' },
    grass: { name: 'grass', mark: 'short upward flicks' }, water: { name: 'water', mark: 'long smooth horizontal lines' }, stone: { name: 'rough stone', mark: 'broken lines and dark specks' } };
  // light on a round form, from the lit side around to the shadow side, then the shadow on the ground
  A.LIGHT_PARTS = { highlight: 'highlight', light: 'light (the lit side)', halftone: 'halftone', core: 'core shadow', reflected: 'reflected light', cast: 'cast shadow', occlusion: 'occlusion shadow (the dark contact line)' };
  A.LIGHT_ORDER = ['highlight', 'light', 'halftone', 'core', 'reflected', 'cast'];

  // ---------------------------------------------------------------- perspective, composition
  A.PERSPECTIVE = { 1: 'one-point', 2: 'two-point', 3: 'three-point' };
  A.DEPTH_CUES = { overlap: 'overlap', size: 'smaller size', placement: 'higher placement on the page', atmosphere: 'paler, bluer color and less detail', detail: 'less detail' };
  A.BALANCE = { symmetrical: 'symmetrical', asymmetrical: 'asymmetrical', radial: 'radial' };

  // ---------------------------------------------------------------- elements and principles
  A.ELEMENTS = [['line', 'Line', 'A mark longer than it is wide; actual or implied.'], ['shape', 'Shape', 'A flat, enclosed area: geometric or organic.'],
    ['form', 'Form', 'Something with three dimensions, or the illusion of them.'], ['space', 'Space', 'The area around, between and within things; also the illusion of depth.'],
    ['value', 'Value', 'Lightness and darkness.'], ['texture', 'Texture', 'How a surface feels, or looks as if it would feel.'], ['color', 'Color', 'Hue, value and saturation of light reflected or given off.']];
  A.PRINCIPLES = [['balance', 'Balance', 'How visual weight is spread: symmetrical, asymmetrical or radial.'], ['contrast', 'Contrast', 'Unlike things placed together: light and dark, big and small.'],
    ['emphasis', 'Emphasis', 'One part made to stand out as the focal point.'], ['movement', 'Movement', 'The path the eye travels through a work.'],
    ['pattern', 'Pattern', 'A motif repeated in a regular way.'], ['rhythm', 'Rhythm', 'A visual beat made by repetition and spacing.'],
    ['unity', 'Unity', 'The sense that all the parts belong together.'], ['variety', 'Variety', 'Differences that add interest.'],
    ['proportion', 'Proportion', 'The size of parts compared with each other and the whole.']];
  A.RHYTHMS = { regular: 'regular', alternating: 'alternating', progressive: 'progressive', flowing: 'flowing' };

  // ---------------------------------------------------------------- art history terms
  A.PAINT_MEDIA = { fresco: { name: 'fresco', def: 'Pigment painted into wet lime plaster, so it becomes part of the wall.' },
    tempera: { name: 'egg tempera', def: 'Pigment mixed with egg yolk; dries fast, painted in fine strokes, usually on wood panels.' },
    oil: { name: 'oil paint', def: 'Pigment mixed with drying oil (often linseed); dries slowly, allowing blending and transparent glazes.' },
    watercolor: { name: 'watercolor', def: 'Pigment in gum arabic, thinned with water and painted in transparent washes on paper.' },
    mosaic: { name: 'mosaic', def: 'A picture made of small pieces (tesserae) of colored stone or glass set in mortar.' },
    encaustic: { name: 'encaustic', def: 'Pigment mixed with hot wax.' }, ink: { name: 'ink painting', def: 'Ink on silk or paper, with a brush; central to Chinese and Japanese painting.' } };
  A.SCULPT = { carving: { name: 'carving', def: 'Taking material away from stone, wood or ivory (subtractive).' }, modeling: { name: 'modeling', def: 'Building up a soft material such as clay or wax (additive).' },
    casting: { name: 'casting', def: 'Pouring molten metal (or plaster) into a mold, as in lost-wax bronze casting.' }, assemblage: { name: 'assemblage', def: 'Putting found or made parts together.' } };
  A.PRINTS = { woodcut: { name: 'woodcut', family: 'relief', def: 'The design is left raised on a wood block; ink sits on the raised parts.' },
    engraving: { name: 'engraving', family: 'intaglio', def: 'Lines are cut into a metal plate with a burin; ink held in the lines is pressed onto paper.' },
    etching: { name: 'etching', family: 'intaglio', def: 'Lines are drawn through a wax ground and bitten into the metal plate by acid.' },
    lithograph: { name: 'lithograph', family: 'planographic', def: 'The design is drawn in grease on flat stone or metal; water and grease repel, so ink sticks only to the drawing.' },
    screenprint: { name: 'screen print', family: 'stencil', def: 'Ink is pushed through a fine screen blocked in some areas.' } };
  A.GENRES = { portrait: 'portrait', landscape: 'landscape', 'still life': 'still life', genre: 'genre scene (everyday life)', history: 'history painting (stories from history, religion or myth)',
    religious: 'religious subject', animal: 'animal subject', architecture: 'architecture', interior: 'interior', abstract: 'abstract work', object: 'object' };
  A.ORDERS = { doric: { name: 'Doric', capital: 'a plain cushion with a square slab', base: 'no base', shaft: 'thick, with 20 flutes' },
    ionic: { name: 'Ionic', capital: 'scrolls (volutes)', base: 'a molded base', shaft: 'slender, with 24 flutes' },
    corinthian: { name: 'Corinthian', capital: 'acanthus leaves with small scrolls', base: 'a molded base', shaft: 'slender, with 24 flutes' } };
  A.ARCH_TERMS = { 'round-arch': 'round arch', 'pointed-arch': 'pointed arch', 'barrel-vault': 'barrel vault', 'groin-vault': 'groin vault', 'rib-vault': 'ribbed vault',
    'flying-buttress': 'flying buttress', pendentive: 'pendentive', dome: 'dome', nave: 'nave', aisle: 'aisle', apse: 'apse', narthex: 'narthex', transept: 'transept',
    mihrab: 'mihrab', minbar: 'minbar', minaret: 'minaret', qibla: 'qibla wall', courtyard: 'courtyard', 'steel-frame': 'steel frame', 'curtain-wall': 'curtain wall' };
  A.STYLE_CLUES = {
    romanesque: ['round arches', 'thick walls', 'small windows', 'barrel vaults'], gothic: ['pointed arches', 'ribbed vaults', 'flying buttresses', 'huge stained-glass windows'],
    earlyren: ['linear perspective', 'solid, weighty figures', 'classical columns and arches'], highren: ['balanced, triangular groups', 'soft modeling (sfumato)', 'idealized calm figures'],
    mannerism: ['stretched figures', 'crowded space', 'cool, odd colors'], baroque: ['strong light and dark', 'diagonal compositions', 'drama and motion'],
    rococo: ['pastel colors', 'curving ornament', 'elegant leisure'], neoclassical: ['crisp outlines', 'calm, balanced compositions', 'Greek and Roman subjects and settings'],
    romantic: ['awe at nature', 'strong feeling', 'storms, ruins and wide views'], realism: ['ordinary working people', 'everyday subjects', 'no idealizing'],
    impressionism: ['visible broken brushstrokes', 'outdoor light', 'modern leisure'], postimp: ['bold color', 'simplified forms', 'thick or dotted paint'],
    earlymodern: ['unnatural color', 'broken, faceted forms', 'distortion for feeling'], interwar: ['pure geometric abstraction', 'dream imagery', 'machine-age design'],
    midcentury: ['very large canvases', 'drips, pours and color fields', 'no recognizable subject'] };

  // ---------------------------------------------------------------- periods, places and works (the catalog: data/art/images.json)
  A.PERIODS = [{"key": "prehistoric", "name": "Prehistoric", "start": -40000, "end": -2500, "track": "europe"}, {"key": "neareast", "name": "Ancient Near East", "start": -3500, "end": -330, "track": "europe"}, {"key": "egypt", "name": "Ancient Egypt", "start": -3100, "end": -30, "track": "europe"}, {"key": "aegean", "name": "Aegean Bronze Age", "start": -3000, "end": -1100, "track": "europe"}, {"key": "greek", "name": "Ancient Greece", "start": -900, "end": -31, "track": "europe"}, {"key": "roman", "name": "Ancient Rome", "start": -509, "end": 476, "track": "europe"}, {"key": "byzantine", "name": "Early Christian and Byzantine", "start": 313, "end": 1453, "track": "europe"}, {"key": "earlymedieval", "name": "Early Medieval", "start": 500, "end": 1000, "track": "europe"}, {"key": "romanesque", "name": "Romanesque", "start": 1000, "end": 1150, "track": "europe"}, {"key": "gothic", "name": "Gothic", "start": 1140, "end": 1500, "track": "europe"}, {"key": "protoren", "name": "Proto-Renaissance", "start": 1280, "end": 1400, "track": "europe"}, {"key": "earlyren", "name": "Early Renaissance", "start": 1400, "end": 1490, "track": "europe"}, {"key": "northren", "name": "Northern Renaissance", "start": 1420, "end": 1600, "track": "europe"}, {"key": "highren", "name": "High Renaissance", "start": 1490, "end": 1527, "track": "europe"}, {"key": "mannerism", "name": "Mannerism", "start": 1520, "end": 1600, "track": "europe"}, {"key": "baroque", "name": "Baroque", "start": 1600, "end": 1750, "track": "europe"}, {"key": "dutch", "name": "Dutch Golden Age", "start": 1600, "end": 1700, "track": "europe"}, {"key": "rococo", "name": "Rococo", "start": 1720, "end": 1780, "track": "europe"}, {"key": "neoclassical", "name": "Neoclassicism", "start": 1760, "end": 1830, "track": "europe"}, {"key": "romantic", "name": "Romanticism", "start": 1790, "end": 1850, "track": "europe"}, {"key": "realism", "name": "Realism", "start": 1840, "end": 1880, "track": "europe"}, {"key": "impressionism", "name": "Impressionism", "start": 1867, "end": 1886, "track": "europe"}, {"key": "postimp", "name": "Post-Impressionism", "start": 1886, "end": 1905, "track": "europe"}, {"key": "chicago", "name": "The Chicago School and the First Skyscrapers", "start": 1880, "end": 1910, "track": "europe"}, {"key": "earlymodern", "name": "Early Modern: Fauvism, Expressionism, Cubism", "start": 1905, "end": 1920, "track": "europe"}, {"key": "interwar", "name": "Between the Wars: Dada, De Stijl, Bauhaus, Surrealism", "start": 1916, "end": 1940, "track": "europe"}, {"key": "midcentury", "name": "Mid-Century: Abstract Expressionism", "start": 1943, "end": 1960, "track": "europe"}, {"key": "islamic-early", "name": "Early Islamic", "start": 650, "end": 1250, "track": "islamic"}, {"key": "islamic-later", "name": "Later Islamic Empires", "start": 1250, "end": 1900, "track": "islamic"}, {"key": "shang", "name": "Shang China", "start": -1600, "end": -1046, "track": "eastasia"}, {"key": "qinhan", "name": "Qin and Han China", "start": -221, "end": 220, "track": "eastasia"}, {"key": "song", "name": "Song China", "start": 960, "end": 1279, "track": "eastasia"}, {"key": "heian", "name": "Heian Japan", "start": 794, "end": 1185, "track": "eastasia"}, {"key": "ming", "name": "Ming China", "start": 1368, "end": 1644, "track": "eastasia"}, {"key": "joseon", "name": "Joseon Korea", "start": 1392, "end": 1897, "track": "eastasia"}, {"key": "momoyama", "name": "Momoyama Japan", "start": 1573, "end": 1615, "track": "eastasia"}, {"key": "edo", "name": "Edo Japan", "start": 1603, "end": 1868, "track": "eastasia"}, {"key": "qing", "name": "Qing China", "start": 1644, "end": 1912, "track": "eastasia"}, {"key": "gandhara", "name": "Kushan and Gandhara", "start": 30, "end": 375, "track": "southasia"}, {"key": "chola", "name": "Chola India", "start": 850, "end": 1279, "track": "southasia"}, {"key": "khmer", "name": "Khmer Empire", "start": 802, "end": 1431, "track": "southasia"}, {"key": "mughal", "name": "Mughal India", "start": 1526, "end": 1857, "track": "southasia"}, {"key": "nok", "name": "Nok", "start": -500, "end": 200, "track": "africa"}, {"key": "ife", "name": "Ife", "start": 1100, "end": 1450, "track": "africa"}, {"key": "zagwe", "name": "Zagwe Ethiopia", "start": 1137, "end": 1270, "track": "africa"}, {"key": "zimbabwe", "name": "Great Zimbabwe", "start": 1100, "end": 1450, "track": "africa"}, {"key": "benin", "name": "Kingdom of Benin", "start": 1300, "end": 1897, "track": "africa"}, {"key": "africa-later", "name": "African Arts, 1800 to 1950", "start": 1800, "end": 1950, "track": "africa"}, {"key": "olmec", "name": "Olmec", "start": -1200, "end": -400, "track": "americas"}, {"key": "teotihuacan", "name": "Teotihuacan", "start": -100, "end": 550, "track": "americas"}, {"key": "moche", "name": "Moche", "start": 100, "end": 800, "track": "americas"}, {"key": "maya", "name": "Maya (Classic and Postclassic)", "start": 250, "end": 1200, "track": "americas"}, {"key": "puebloan", "name": "Ancestral Puebloan", "start": 900, "end": 1300, "track": "americas"}, {"key": "aztec", "name": "Aztec", "start": 1325, "end": 1521, "track": "americas"}, {"key": "inca", "name": "Inca", "start": 1438, "end": 1533, "track": "americas"}, {"key": "native", "name": "Native North American Arts, 1800 to 1950", "start": 1800, "end": 1950, "track": "americas"}];
  A.TRACKS = [{"key": "europe", "name": "Europe, the Mediterranean and the Near East"}, {"key": "islamic", "name": "The Islamic World"}, {"key": "eastasia", "name": "East Asia"}, {"key": "southasia", "name": "South and Southeast Asia"}, {"key": "africa", "name": "Africa"}, {"key": "americas", "name": "The Americas"}];
  A.CITIES = {"amsterdam": ["Amsterdam", 52.37, 4.9], "thehague": ["The Hague", 52.08, 4.3], "delft": ["Delft", 52.01, 4.36], "haarlem": ["Haarlem", 52.38, 4.64], "antwerp": ["Antwerp", 51.22, 4.4], "bruges": ["Bruges", 51.21, 3.22], "brussels": ["Brussels", 50.85, 4.35], "london": ["London", 51.51, -0.13], "paris": ["Paris", 48.86, 2.35], "versailles": ["Versailles", 48.8, 2.12], "chantilly": ["Chantilly", 49.19, 2.47], "chartres": ["Chartres", 48.45, 1.49], "toulouse": ["Toulouse", 43.6, 1.44], "montignac": ["Montignac (Lascaux)", 45.05, 1.17], "nimes": ["Nîmes", 43.84, 4.36], "arles": ["Arles", 43.68, 4.63], "saint-remy": ["Saint-Rémy-de-Provence", 43.79, 4.83], "aix": ["Aix-en-Provence", 43.53, 5.45], "giverny": ["Giverny", 49.08, 1.53], "pontaven": ["Pont-Aven", 47.86, -3.75], "madrid": ["Madrid", 40.42, -3.7], "toledo": ["Toledo, Spain", 39.86, -4.03], "cordoba": ["Córdoba", 37.88, -4.78], "granada": ["Granada", 37.18, -3.6], "rome": ["Rome", 41.9, 12.5], "vatican": ["Vatican City", 41.9, 12.45], "florence": ["Florence", 43.77, 11.26], "venice": ["Venice", 45.44, 12.33], "milan": ["Milan", 45.46, 9.19], "padua": ["Padua", 45.41, 11.88], "siena": ["Siena", 43.32, 11.33], "ravenna": ["Ravenna", 44.42, 12.2], "vicenza": ["Vicenza", 45.55, 11.55], "urbino": ["Urbino", 43.73, 12.64], "naples": ["Naples", 40.85, 14.27], "pompeii": ["Pompeii", 40.75, 14.49], "vienna": ["Vienna", 48.21, 16.37], "munich": ["Munich", 48.14, 11.58], "nuremberg": ["Nuremberg", 49.45, 11.08], "berlin": ["Berlin", 52.52, 13.4], "dresden": ["Dresden", 51.05, 13.74], "hamburg": ["Hamburg", 53.55, 9.99], "ulm": ["Ulm", 48.4, 9.99], "dessau": ["Dessau", 51.84, 12.25], "krakow": ["Kraków", 50.06, 19.94], "lancut": ["Łańcut", 50.07, 22.23], "moscow": ["Moscow", 55.76, 37.62], "oslo": ["Oslo", 59.91, 10.75], "zurich": ["Zürich", 47.38, 8.54], "dublin": ["Dublin", 53.35, -6.26], "lindisfarne": ["Lindisfarne", 55.67, -1.8], "durham": ["Durham", 54.78, -1.58], "edinburgh": ["Edinburgh", 55.95, -3.19], "wiltshire": ["Salisbury Plain", 51.18, -1.83], "suffolk": ["Flatford, Suffolk", 51.96, 1.02], "athens": ["Athens", 37.98, 23.73], "delphi": ["Delphi", 38.48, 22.5], "epidaurus": ["Epidaurus", 37.6, 23.08], "mycenae": ["Mycenae", 37.73, 22.76], "samothrace": ["Samothrace", 40.47, 25.53], "heraklion": ["Heraklion", 35.34, 25.13], "knossos": ["Knossos", 35.3, 25.16], "palaikastro": ["Palaikastro", 35.2, 26.25], "istanbul": ["Istanbul", 41.01, 28.98], "jerusalem": ["Jerusalem", 31.78, 35.24], "ur": ["Ur", 30.96, 46.1], "babylon": ["Babylon", 32.54, 44.42], "susa": ["Susa", 32.19, 48.26], "nimrud": ["Nimrud", 36.1, 43.33], "persepolis": ["Persepolis", 29.94, 52.89], "isfahan": ["Isfahan", 32.65, 51.67], "tabriz": ["Tabriz", 38.08, 46.29], "ardabil": ["Ardabil", 38.25, 48.3], "cairo": ["Cairo", 30.04, 31.24], "giza": ["Giza", 29.98, 31.13], "thebes": ["Thebes (Luxor)", 25.7, 32.64], "amarna": ["Amarna", 27.65, 30.9], "agra": ["Agra", 27.18, 78.04], "lahore": ["Lahore", 31.55, 74.34], "thanjavur": ["Thanjavur", 10.78, 79.13], "angkor": ["Angkor", 13.41, 103.87], "gandhara": ["Gandhara (Peshawar valley)", 34.01, 71.58], "beijing": ["Beijing", 39.9, 116.4], "taipei": ["Taipei", 25.1, 121.55], "xian": ["Xi'an", 34.34, 108.94], "kaifeng": ["Kaifeng", 34.8, 114.31], "anyang": ["Anyang", 36.1, 114.39], "jingdezhen": ["Jingdezhen", 29.27, 117.18], "suzhou": ["Suzhou", 31.3, 120.59], "seoul": ["Seoul", 37.57, 126.98], "tokyo": ["Tokyo (Edo)", 35.68, 139.69], "kyoto": ["Kyoto", 35.01, 135.77], "uji": ["Uji", 34.89, 135.81], "nagoya": ["Nagoya", 35.18, 136.91], "himeji": ["Himeji", 34.84, 134.69], "toronto": ["Toronto", 43.65, -79.38], "newyork": ["New York", 40.71, -74.01], "washington": ["Washington, D.C.", 38.89, -77.03], "boston": ["Boston", 42.36, -71.06], "philadelphia": ["Philadelphia", 39.95, -75.17], "chicago": ["Chicago", 41.88, -87.63], "minneapolis": ["Minneapolis", 44.98, -93.27], "sanmarino": ["San Marino, California", 34.12, -118.11], "hampton": ["Hampton, Virginia", 37.02, -76.34], "charlottesville": ["Charlottesville", 38.03, -78.48], "stlouis": ["St. Louis", 38.63, -90.2], "millrun": ["Mill Run, Pennsylvania", 39.91, -79.47], "catskill": ["Catskill, New York", 42.22, -73.86], "mesaverde": ["Mesa Verde, Colorado", 37.18, -108.49], "sitka": ["Sitka, Alaska", 57.05, -135.33], "southwest": ["Navajo Nation", 36.07, -109.19], "plains": ["Great Plains", 40.0, -101.0], "nipomo": ["Nipomo, California", 35.04, -120.48], "mexicocity": ["Mexico City", 19.43, -99.13], "teotihuacan": ["Teotihuacan", 19.69, -98.84], "palenque": ["Palenque", 17.48, -92.05], "chichen": ["Chichén Itzá", 20.68, -88.57], "xalapa": ["Xalapa", 19.54, -96.91], "sanlorenzo": ["San Lorenzo", 17.75, -94.76], "cusco": ["Cusco", -13.53, -71.97], "machupicchu": ["Machu Picchu", -13.16, -72.55], "moche": ["Moche valley, Peru", -8.11, -79.0], "djenne": ["Djenné", 13.91, -4.55], "lalibela": ["Lalibela", 12.03, 39.04], "zimbabwe": ["Great Zimbabwe", -20.27, 30.93], "ife": ["Ife", 7.48, 4.56], "benincity": ["Benin City", 6.34, 5.63], "nok": ["Nok, central Nigeria", 9.5, 8.0], "kumasi": ["Kumasi", 6.69, -1.62], "bamako": ["Bamana region, Mali", 12.65, -8.0], "poznan": ["Poznań", 52.41, 16.93], "sanfrancisco": ["San Francisco", 37.78, -122.4], "detroit": ["Detroit", 42.36, -83.07], "losangeles": ["Los Angeles", 34.06, -118.24], "liberia": ["Dan region (Liberia and Côte d'Ivoire)", 7.4, -8.3], "lagos": ["Lagos", 6.52, 3.38], "kansascity": ["Kansas City", 39.1, -94.58]};
  A.WORKS = [{"id":"lascaux","title":"Hall of the Bulls, Lascaux Cave","artist":"Paleolithic painters","date":"about 17,000 years ago","year":-15000,"period":"prehistoric","kind":"painting","medium":"Mineral pigments and charcoal on limestone","at":"In the cave (closed to visitors; replicas nearby), Montignac, France","now":"montignac","made":"montignac","genre":"animal","people":"none","topics":["ah1.cave-painting","ydraw.draw-what-you-see"],"pd":true,"img":true,"note":"Dates come from radiocarbon tests of charcoal and finds in the cave; most fall around 17,000 years ago.","w":500,"h":328,"credit":"Wikimedia Commons (public domain)"},{"id":"lion-man","title":"Lion-Man of Hohlenstein-Stadel","artist":"Paleolithic carver","date":"about 40,000 years ago","year":-38000,"period":"prehistoric","kind":"sculpture","medium":"Mammoth ivory","at":"Museum Ulm, Germany","now":"ulm","made":"ulm","genre":"animal","people":"none","topics":["ah1.portable-art"],"pd":true,"img":false,"note":"Found in pieces in 1939 and reassembled; dated to roughly 35,000 to 41,000 years ago."},{"id":"stonehenge","title":"Stonehenge","artist":"Neolithic and Bronze Age builders","date":"about 3000 to 1500 BC","year":-2500,"period":"prehistoric","kind":"architecture","medium":"Sarsen sandstone and bluestone","at":"Salisbury Plain, Wiltshire, England","now":"wiltshire","made":"wiltshire","genre":"architecture","people":"none","topics":["ah1.megaliths"],"pd":true,"img":true,"note":"Built in stages; why it was built is debated (a ceremonial site, a burial place, and a marker of the solstices are the main ideas).","w":500,"h":375,"credit":"Wikimedia Commons (CC0)"},{"id":"ziggurat-ur","title":"Ziggurat of Ur","artist":"Sumerian builders, for King Ur-Nammu","date":"about 2100 BC","year":-2100,"period":"neareast","kind":"architecture","medium":"Mud brick with a baked-brick facing","at":"Near Nasiriyah, Iraq (lower stages partly restored)","now":"ur","made":"ur","genre":"architecture","people":"none","topics":["ah1.mesopotamia"],"pd":true,"img":true,"w":960,"h":527,"credit":"Wikimedia Commons (public domain)"},{"id":"hammurabi","title":"Law Code Stele of Hammurabi","artist":"Babylonian","date":"about 1750 BC","year":-1750,"period":"neareast","kind":"sculpture","medium":"Basalt","at":"Louvre, Paris","now":"paris","made":"babylon","genre":"history","people":"clothed","topics":["ah1.mesopotamia","design.proportion-scale"],"pd":true,"img":true,"note":"Carried off to Susa in the 1100s BC as war booty, where French archaeologists found it in 1901.","w":667,"h":1000,"credit":"Wikimedia Commons (CC0)"},{"id":"lamassu","title":"Human-Headed Winged Lion (Lamassu)","artist":"Assyrian, palace of Ashurnasirpal II","date":"883 to 859 BC","year":-870,"period":"neareast","kind":"sculpture","medium":"Alabaster (gypsum)","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"nimrud","genre":"animal","people":"none","topics":["ah1.assyria-persia"],"pd":true,"img":true,"w":960,"h":659,"credit":"The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"ishtar-gate","title":"Ishtar Gate","artist":"Babylonian, for King Nebuchadnezzar II","date":"about 575 BC","year":-575,"period":"neareast","kind":"architecture","medium":"Glazed brick","at":"Pergamon Museum, Berlin (reconstructed from the excavated bricks)","now":"berlin","made":"babylon","genre":"architecture","people":"none","topics":["ah1.assyria-persia"],"pd":true,"img":true,"w":750,"h":1000,"credit":"Wikimedia Commons (CC0)"},{"id":"persepolis","title":"Apadana Stairway Reliefs, Persepolis","artist":"Achaemenid Persian","date":"about 515 to 465 BC","year":-500,"period":"neareast","kind":"sculpture","medium":"Limestone relief","at":"Persepolis, Iran","now":"persepolis","made":"persepolis","genre":"history","people":"clothed","topics":["ah1.assyria-persia"],"pd":true,"img":true,"w":960,"h":777,"credit":"The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"giza","title":"The Pyramids of Giza","artist":"Egyptian, Fourth Dynasty","date":"about 2600 to 2500 BC","year":-2550,"period":"egypt","kind":"architecture","medium":"Limestone and granite","at":"Giza, Egypt","now":"giza","made":"giza","genre":"architecture","people":"none","topics":["ah1.egypt-old-kingdom","ydraw.basic-shapes"],"pd":true,"img":true,"w":960,"h":459,"credit":"Wikimedia Commons (CC0)"},{"id":"sphinx","title":"The Great Sphinx","artist":"Egyptian, probably for King Khafre","date":"about 2500 BC","year":-2500,"period":"egypt","kind":"sculpture","medium":"Limestone bedrock","at":"Giza, Egypt","now":"giza","made":"giza","genre":"animal","people":"none","topics":["ah1.egypt-old-kingdom"],"pd":true,"img":true,"note":"Most Egyptologists date it to Khafre's reign; a few argue for his father Khufu.","w":960,"h":596,"credit":"Wikimedia Commons (CC0)"},{"id":"hatshepsut","title":"Temple of Hatshepsut","artist":"Egyptian, traditionally credited to Senenmut","date":"about 1479 to 1458 BC","year":-1470,"period":"egypt","kind":"architecture","medium":"Limestone","at":"Deir el-Bahari, near Luxor, Egypt","now":"thebes","made":"thebes","genre":"architecture","people":"none","topics":["ah1.egypt-new-kingdom"],"pd":true,"img":true,"w":749,"h":570,"credit":"Museo Egizio, Turin (photo archive), via Wikimedia Commons (CC0)"},{"id":"karnak","title":"Great Hypostyle Hall, Karnak","artist":"Egyptian, for Seti I and Ramesses II","date":"about 1290 to 1224 BC","year":-1260,"period":"egypt","kind":"architecture","medium":"Sandstone, once painted","at":"Karnak, Luxor, Egypt","now":"thebes","made":"thebes","genre":"architecture","people":"none","topics":["ah1.egypt-new-kingdom"],"pd":true,"img":true,"w":960,"h":789,"credit":"Wikimedia Commons (CC0)"},{"id":"nefertiti","title":"Bust of Nefertiti","artist":"Thutmose (workshop)","date":"about 1345 BC","year":-1345,"period":"egypt","kind":"sculpture","medium":"Painted limestone and stucco","at":"Neues Museum, Berlin","now":"berlin","made":"amarna","genre":"portrait","people":"clothed","topics":["ah1.egypt-new-kingdom"],"pd":true,"img":true,"note":"Found in the workshop of the sculptor Thutmose at Amarna in 1912; it has been in Berlin since soon after.","w":270,"h":380,"credit":"Wikimedia Commons (CC0)"},{"id":"tut-mask","title":"Mask of Tutankhamun","artist":"Egyptian, Eighteenth Dynasty","date":"about 1323 BC","year":-1323,"period":"egypt","kind":"object","medium":"Gold, lapis lazuli, carnelian, quartz, obsidian and glass","at":"Grand Egyptian Museum, Giza","now":"giza","made":"thebes","genre":"portrait","people":"clothed","topics":["ah1.egypt-new-kingdom"],"pd":true,"img":true,"note":"Found by Howard Carter's team in 1925, in the tomb they opened in 1922; long shown at the Egyptian Museum in Cairo.","w":470,"h":638,"credit":"Photograph by Harry Burton of the mask in its coffin, 29 October 1925; via Wikimedia Commons (public domain)"},{"id":"hunefer","title":"Book of the Dead of Hunefer: the Weighing of the Heart","artist":"Egyptian","date":"about 1275 BC","year":-1275,"period":"egypt","kind":"manuscript","medium":"Paint on papyrus","at":"British Museum, London","now":"london","made":"thebes","genre":"religious","people":"clothed","topics":["ah1.egypt-conventions"],"pd":true,"img":true,"w":960,"h":436,"credit":"Wikimedia Commons (public domain)"},{"id":"octopus-jar","title":"Octopus Flask (Marine Style)","artist":"Minoan","date":"about 1500 BC","year":-1500,"period":"aegean","kind":"ceramic","medium":"Painted clay","at":"Heraklion Archaeological Museum, Crete","now":"heraklion","made":"palaikastro","genre":"animal","people":"none","topics":["ah1.aegean"],"pd":true,"img":false},{"id":"knossos","title":"Palace of Knossos","artist":"Minoan","date":"about 1700 to 1450 BC","year":-1600,"period":"aegean","kind":"architecture","medium":"Stone, timber and plaster (partly reconstructed)","at":"Knossos, Crete","now":"knossos","made":"knossos","genre":"architecture","people":"none","topics":["ah1.aegean"],"pd":true,"img":true,"note":"Arthur Evans rebuilt parts in concrete in the early 1900s; some of what visitors see is his reconstruction.","w":960,"h":639,"credit":"Wikimedia Commons (CC0)"},{"id":"agamemnon","title":"Mask of Agamemnon","artist":"Mycenaean","date":"about 1550 to 1500 BC","year":-1525,"period":"aegean","kind":"object","medium":"Gold","at":"National Archaeological Museum, Athens","now":"athens","made":"mycenae","genre":"portrait","people":"none","topics":["ah1.aegean"],"pd":true,"img":true,"note":"Named by Heinrich Schliemann in 1876; it is centuries older than the age of the Trojan War, and a few scholars have questioned whether it was altered.","w":960,"h":960,"credit":"Wikimedia Commons (CC0)"},{"id":"exekias","title":"Achilles and Ajax Playing a Game","artist":"Exekias","date":"about 540 to 530 BC","year":-535,"period":"greek","kind":"ceramic","medium":"Black-figure amphora","at":"Vatican Museums, Vatican City","now":"vatican","made":"athens","genre":"history","people":"clothed","topics":["ah1.greek-vases"],"pd":true,"img":true,"style":"Black-figure","w":667,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"berlin-painter","title":"Amphora with a Singer Playing the Kithara","artist":"Berlin Painter","date":"about 490 BC","year":-490,"period":"greek","kind":"ceramic","medium":"Red-figure amphora","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"athens","genre":"genre","people":"clothed","topics":["ah1.greek-vases"],"pd":true,"img":true,"style":"Red-figure","w":756,"h":1000,"credit":"The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"parthenon","title":"Parthenon","artist":"Iktinos and Kallikrates; sculpture under Phidias","date":"447 to 432 BC","year":-440,"period":"greek","kind":"architecture","medium":"Marble","at":"Acropolis, Athens","now":"athens","made":"athens","genre":"architecture","people":"none","topics":["ah1.parthenon","ah1.greek-orders"],"pd":true,"img":true,"style":"Doric order","w":960,"h":412,"credit":"Wikimedia Commons (CC0)"},{"id":"caryatids","title":"Porch of the Maidens, Erechtheion","artist":"Greek","date":"about 421 to 406 BC","year":-415,"period":"greek","kind":"architecture","medium":"Marble","at":"Acropolis, Athens (five originals in the Acropolis Museum, one in the British Museum)","now":"athens","made":"athens","genre":"architecture","people":"clothed","topics":["ah1.contrapposto-hellenistic","ah1.greek-orders"],"pd":true,"img":true,"style":"Ionic order","w":960,"h":611,"credit":"Wikimedia Commons (CC0)"},{"id":"charioteer","title":"Charioteer of Delphi","artist":"Greek","date":"about 475 BC","year":-475,"period":"greek","kind":"sculpture","medium":"Bronze, with glass and copper inlay","at":"Delphi Archaeological Museum, Greece","now":"delphi","made":"delphi","genre":"portrait","people":"clothed","topics":["ah1.greek-sculpture"],"pd":true,"img":true,"style":"Early Classical","w":692,"h":1000,"credit":"Wikimedia Commons (CC0)"},{"id":"peplos-kore","title":"Peplos Kore","artist":"Greek","date":"about 530 BC","year":-530,"period":"greek","kind":"sculpture","medium":"Marble with traces of paint","at":"Acropolis Museum, Athens","now":"athens","made":"athens","genre":"portrait","people":"clothed","topics":["ah1.greek-sculpture"],"pd":true,"img":true,"style":"Archaic","w":298,"h":700,"credit":"Wikimedia Commons (public domain)"},{"id":"nike","title":"Winged Victory of Samothrace","artist":"Greek","date":"about 200 to 190 BC","year":-195,"period":"greek","kind":"sculpture","medium":"Marble","at":"Louvre, Paris","now":"paris","made":"samothrace","genre":"religious","people":"clothed","topics":["ah1.contrapposto-hellenistic"],"pd":true,"img":false,"note":"The date is estimated from the style and the ship-shaped base; scholars disagree over which victory it honored.","style":"Hellenistic"},{"id":"epidaurus","title":"Theater of Epidaurus","artist":"Greek, traditionally Polykleitos the Younger","date":"about 340 BC","year":-340,"period":"greek","kind":"architecture","medium":"Limestone","at":"Epidaurus, Greece","now":"epidaurus","made":"epidaurus","genre":"architecture","people":"none","topics":["ah1.parthenon"],"pd":true,"img":true,"w":816,"h":544,"credit":"Wikimedia Commons (CC0)"},{"id":"pantheon","title":"Pantheon","artist":"Roman, under Emperor Hadrian","date":"about AD 113 to 125","year":120,"period":"roman","kind":"architecture","medium":"Concrete, brick and marble","at":"Rome","now":"rome","made":"rome","genre":"architecture","people":"none","topics":["ah1.roman-architecture","ah1.renaissance-architecture"],"pd":true,"img":true,"note":"The inscription names Marcus Agrippa, who built an earlier temple on the site; the present building is Hadrian's.","w":960,"h":821,"credit":"Wikimedia Commons (CC0)"},{"id":"colosseum","title":"Colosseum (Flavian Amphitheater)","artist":"Roman, under Vespasian and Titus","date":"AD 70 to 80","year":75,"period":"roman","kind":"architecture","medium":"Concrete, travertine and brick","at":"Rome","now":"rome","made":"rome","genre":"architecture","people":"none","topics":["ah1.roman-architecture"],"pd":true,"img":true,"w":960,"h":568,"credit":"Wikimedia Commons (CC0)"},{"id":"pont-du-gard","title":"Pont du Gard","artist":"Roman","date":"about AD 40 to 60","year":50,"period":"roman","kind":"architecture","medium":"Limestone","at":"Near Nîmes, France","now":"nimes","made":"nimes","genre":"architecture","people":"none","topics":["ah1.roman-architecture","ydraw.basic-shapes"],"pd":true,"img":true,"w":960,"h":392,"credit":"Wikimedia Commons (CC0)"},{"id":"livia-garden","title":"Garden Room, Villa of Livia","artist":"Roman","date":"about 30 to 20 BC","year":-25,"period":"roman","kind":"painting","medium":"Fresco","at":"Palazzo Massimo, National Roman Museum, Rome","now":"rome","made":"rome","genre":"landscape","people":"none","topics":["ah1.roman-portraits-painting"],"pd":true,"img":true,"w":500,"h":288,"credit":"Wikimedia Commons (CC0)"},{"id":"terentius-neo","title":"Portrait of a Couple (Terentius Neo and His Wife)","artist":"Roman","date":"1st century AD (before 79)","year":60,"period":"roman","kind":"painting","medium":"Fresco","at":"National Archaeological Museum, Naples","now":"naples","made":"pompeii","genre":"portrait","people":"clothed","topics":["ah1.roman-portraits-painting"],"pd":true,"img":true,"note":"The names come from an election notice painted outside the house; who the couple were is not certain.","w":891,"h":1000,"credit":"Wikimedia Commons (CC0)"},{"id":"roman-portrait","title":"Portrait of an Older Man","artist":"Roman, Late Republic","date":"1st century BC","year":-60,"period":"roman","kind":"sculpture","medium":"Marble","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"rome","genre":"portrait","people":"clothed","topics":["ah1.roman-portraits-painting"],"pd":true,"img":false,"style":"Verism"},{"id":"justinian","title":"Emperor Justinian and His Attendants","artist":"Byzantine","date":"about AD 547","year":547,"period":"byzantine","kind":"mosaic","medium":"Glass and stone mosaic","at":"San Vitale, Ravenna, Italy","now":"ravenna","made":"ravenna","genre":"religious","people":"clothed","topics":["ah1.ravenna-mosaics","design.proportion-scale"],"pd":true,"img":true,"w":500,"h":677,"credit":"Wikimedia Commons (public domain)"},{"id":"theodora","title":"Empress Theodora and Her Attendants","artist":"Byzantine","date":"about AD 547","year":547,"period":"byzantine","kind":"mosaic","medium":"Glass and stone mosaic","at":"San Vitale, Ravenna, Italy","now":"ravenna","made":"ravenna","genre":"religious","people":"clothed","topics":["ah1.ravenna-mosaics"],"pd":true,"img":true,"w":425,"h":720,"credit":"Wikimedia Commons (public domain)"},{"id":"hagia-sophia","title":"Hagia Sophia","artist":"Anthemius of Tralles and Isidore of Miletus","date":"AD 532 to 537","year":535,"period":"byzantine","kind":"architecture","medium":"Brick and mortar, marble, mosaic","at":"Istanbul","now":"istanbul","made":"istanbul","genre":"architecture","people":"none","topics":["ah1.hagia-sophia"],"pd":true,"img":true,"w":960,"h":615,"credit":"Wikimedia Commons (public domain)"},{"id":"vladimir","title":"Theotokos of Vladimir","artist":"Byzantine","date":"about 1130","year":1130,"period":"byzantine","kind":"painting","medium":"Tempera on wood","at":"State Tretyakov Gallery, Moscow (kept in a church on the museum's grounds)","now":"moscow","made":"istanbul","genre":"religious","people":"clothed","topics":["ah1.icons"],"pd":true,"img":true,"note":"Painted in Constantinople; the face is original, while other parts were repainted over the centuries.","w":583,"h":850,"credit":"Wikimedia Commons (public domain)"},{"id":"galla-placidia","title":"Good Shepherd Mosaic, Mausoleum of Galla Placidia","artist":"Early Christian","date":"about AD 425 to 450","year":440,"period":"byzantine","kind":"mosaic","medium":"Glass mosaic","at":"Ravenna, Italy","now":"ravenna","made":"ravenna","genre":"religious","people":"clothed","topics":["ah1.early-christian"],"pd":true,"img":true,"w":960,"h":618,"credit":"Wikimedia Commons (public domain)"},{"id":"dome-rock","title":"Dome of the Rock","artist":"Umayyad, for Caliph Abd al-Malik","date":"completed AD 691 to 692","year":691,"period":"islamic-early","kind":"architecture","medium":"Stone, with later tile and gilding","at":"Jerusalem","now":"jerusalem","made":"jerusalem","genre":"architecture","people":"none","topics":["ah1.islamic-architecture"],"pd":true,"img":true,"note":"The outer tiles date from the 1500s, under the Ottoman sultan Suleiman, and later restorations.","w":750,"h":1000,"credit":"Wikimedia Commons (CC0)"},{"id":"cordoba","title":"Prayer Hall, Great Mosque of Córdoba","artist":"Umayyad","date":"begun 785, enlarged to about 987","year":785,"period":"islamic-early","kind":"architecture","medium":"Stone and brick, double-tiered horseshoe arches","at":"Córdoba, Spain","now":"cordoba","made":"cordoba","genre":"architecture","people":"none","topics":["ah1.cordoba-alhambra","design.rhythm"],"pd":true,"img":true,"w":960,"h":719,"credit":"Photochrom print, about 1890; Library of Congress, via Wikimedia Commons (public domain)"},{"id":"alhambra","title":"Court of the Lions, Alhambra","artist":"Nasrid, for Sultan Muhammad V","date":"1370s","year":1375,"period":"islamic-later","kind":"architecture","medium":"Stucco, marble and tile","at":"Granada, Spain","now":"granada","made":"granada","genre":"architecture","people":"none","topics":["ah1.cordoba-alhambra"],"pd":true,"img":true,"w":715,"h":1000,"credit":"Wikimedia Commons (CC0)"},{"id":"ardabil","title":"The Ardabil Carpet","artist":"Safavid Persian, signed by Maqsud of Kashan","date":"1539 to 1540","year":1539,"period":"islamic-later","kind":"textile","medium":"Wool pile on silk","at":"Victoria and Albert Museum, London (its twin is in the Los Angeles County Museum of Art)","now":"london","made":"ardabil","genre":"object","people":"none","topics":["ah1.islamic-arts-of-the-book","design.balance-principle"],"pd":true,"img":true,"w":693,"h":361,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"mosque-lamp","title":"Mosque Lamp Bearing the Name of Sultan al-Malik al-Nasir","artist":"Mamluk (Egypt or Syria)","date":"about 1340","year":1340,"period":"islamic-later","kind":"object","medium":"Glass with enamel and gilding","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"cairo","genre":"object","people":"none","topics":["ah1.islamic-arts-of-the-book","ah1.islamic-ornament"],"pd":true,"img":true,"note":"Lamps like this hung in mosques and religious schools; its inscription names the sultan.","w":500,"h":612,"credit":"The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"taj-mahal","title":"Taj Mahal","artist":"Mughal, for Shah Jahan","date":"1632 to 1653","year":1643,"period":"mughal","kind":"architecture","medium":"White marble with inlaid stone","at":"Agra, India","now":"agra","made":"agra","genre":"architecture","people":"none","topics":["ah2.mughal","design.balance-principle"],"pd":true,"img":true,"note":"The chief architect is usually named as Ustad Ahmad Lahauri; the records are not complete.","w":960,"h":708,"credit":"Wikimedia Commons (CC0)"},{"id":"shah-jahan-horse","title":"Shah Jahan on Horseback","artist":"Payag","date":"about 1630","year":1630,"period":"mughal","kind":"painting","medium":"Ink, watercolor and gold on paper","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"agra","genre":"portrait","people":"clothed","topics":["ah2.mughal"],"pd":true,"img":true,"w":500,"h":740,"credit":"The Metropolitan Museum of Art, via Wikimedia Commons (public domain)"},{"id":"suleymaniye","title":"Süleymaniye Mosque","artist":"Mimar Sinan","date":"1550 to 1557","year":1555,"period":"islamic-later","kind":"architecture","medium":"Stone, Iznik tile","at":"Istanbul","now":"istanbul","made":"istanbul","genre":"architecture","people":"none","topics":["ah2.ottoman-safavid"],"pd":true,"img":true,"w":960,"h":657,"credit":"Wikimedia Commons (CC0)"},{"id":"shah-mosque","title":"Shah Mosque (Imam Mosque), Isfahan","artist":"Safavid, for Shah Abbas I","date":"1611 to about 1630","year":1620,"period":"islamic-later","kind":"architecture","medium":"Brick with glazed tile","at":"Isfahan, Iran","now":"isfahan","made":"isfahan","genre":"architecture","people":"none","topics":["ah2.ottoman-safavid"],"pd":true,"img":true,"w":480,"h":722,"credit":"Wikimedia Commons (CC0)"},{"id":"kells","title":"Book of Kells: the Chi Rho Page","artist":"Insular monks","date":"about 800","year":800,"period":"earlymedieval","kind":"manuscript","medium":"Ink and pigments on vellum","at":"Trinity College Library, Dublin","now":"dublin","made":"dublin","genre":"religious","people":"none","topics":["ah1.insular-manuscripts","design.pattern"],"pd":true,"img":true,"note":"Where it was made, Iona in Scotland, Kells in Ireland, or both, is debated.","w":500,"h":694,"credit":"Wikimedia Commons (public domain)"},{"id":"lindisfarne","title":"Lindisfarne Gospels: Carpet Page","artist":"Attributed to Eadfrith, bishop of Lindisfarne","date":"about 715 to 720","year":715,"period":"earlymedieval","kind":"manuscript","medium":"Ink and pigments on vellum","at":"British Library, London","now":"london","made":"lindisfarne","genre":"religious","people":"none","topics":["ah1.insular-manuscripts"],"pd":true,"img":true,"w":606,"h":722,"credit":"Wikimedia Commons (public domain)"},{"id":"saint-sernin","title":"Basilica of Saint-Sernin","artist":"Romanesque","date":"about 1080 to 1120","year":1100,"period":"romanesque","kind":"architecture","medium":"Brick and stone","at":"Toulouse, France","now":"toulouse","made":"toulouse","genre":"architecture","people":"none","topics":["ah1.romanesque"],"pd":true,"img":true,"w":500,"h":333,"credit":"Wikimedia Commons (CC0)"},{"id":"durham","title":"Nave of Durham Cathedral","artist":"Romanesque (Norman)","date":"1093 to 1133","year":1110,"period":"romanesque","kind":"architecture","medium":"Stone, with early ribbed vaults","at":"Durham, England","now":"durham","made":"durham","genre":"architecture","people":"none","topics":["ah1.romanesque"],"pd":true,"img":true,"w":1000,"h":666,"credit":"Wikimedia Commons (CC0)"},{"id":"chartres","title":"Chartres Cathedral","artist":"Gothic","date":"mostly 1194 to 1220 (west front about 1145)","year":1200,"period":"gothic","kind":"architecture","medium":"Limestone and stained glass","at":"Chartres, France","now":"chartres","made":"chartres","genre":"architecture","people":"none","topics":["ah1.gothic-architecture","ah1.stained-glass"],"pd":true,"img":true,"w":960,"h":778,"credit":"Detail: column figures of the Royal Portal on the west front; photograph by Pierre-Émile Pécarrère, 1850 to 1852, The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"chartres-rose","title":"North Rose Window, Chartres Cathedral","artist":"Gothic","date":"about 1230 to 1235","year":1232,"period":"gothic","kind":"glass","medium":"Stained glass","at":"Chartres, France","now":"chartres","made":"chartres","genre":"religious","people":"clothed","topics":["ah1.stained-glass","design.balance-principle"],"pd":true,"img":true,"w":500,"h":692,"credit":"Wikimedia Commons (public domain)"},{"id":"sainte-chapelle","title":"Sainte-Chapelle, Upper Chapel","artist":"Gothic (Rayonnant)","date":"1242 to 1248","year":1245,"period":"gothic","kind":"architecture","medium":"Stone and stained glass","at":"Paris","now":"paris","made":"paris","genre":"architecture","people":"none","topics":["ah1.stained-glass"],"pd":true,"img":true,"w":693,"h":520,"credit":"Wikimedia Commons (CC0)"},{"id":"notre-dame","title":"Notre-Dame de Paris, West Front","artist":"Gothic","date":"begun 1163; front about 1200 to 1250","year":1200,"period":"gothic","kind":"architecture","medium":"Limestone","at":"Paris","now":"paris","made":"paris","genre":"architecture","people":"none","topics":["ah1.gothic-architecture"],"pd":true,"img":true,"note":"Badly damaged by fire in 2019 and reopened in December 2024.","w":1000,"h":730,"credit":"Wikimedia Commons (public domain)"},{"id":"tres-riches-january","title":"Très Riches Heures: January","artist":"Limbourg brothers","date":"about 1412 to 1416","year":1414,"period":"gothic","kind":"manuscript","medium":"Tempera and gold on vellum","at":"Musée Condé, Chantilly, France","now":"chantilly","made":"paris","genre":"genre","people":"clothed","topics":["ah1.books-of-hours"],"pd":true,"img":true,"note":"Left unfinished when the Limbourg brothers and the duke died in 1416; other painters completed it later in the 1400s.","w":646,"h":710,"credit":"Wikimedia Commons (public domain)"},{"id":"duccio-maesta","title":"Maestà (Madonna and Child Enthroned)","artist":"Duccio di Buoninsegna","date":"1308 to 1311","year":1310,"period":"protoren","kind":"painting","medium":"Tempera and gold on wood","at":"Museo dell'Opera del Duomo, Siena","now":"siena","made":"siena","genre":"religious","people":"clothed","topics":["ah1.giotto","ah1.icons","design.proportion-scale"],"pd":true,"img":true,"w":816,"h":772,"credit":"Wikimedia Commons (public domain)"},{"id":"giotto-joachim","title":"Joachim among the Shepherds","artist":"Giotto di Bondone","date":"about 1305","year":1305,"period":"protoren","kind":"painting","medium":"Fresco","at":"Arena (Scrovegni) Chapel, Padua","now":"padua","made":"padua","genre":"religious","people":"clothed","topics":["ah1.giotto"],"pd":true,"img":true,"w":960,"h":907,"credit":"Wikimedia Commons (public domain)"},{"id":"fan-kuan","title":"Travelers among Mountains and Streams","artist":"Fan Kuan","date":"about 1000","year":1000,"period":"song","kind":"painting","medium":"Ink and light color on silk, hanging scroll","at":"National Palace Museum, Taipei","now":"taipei","made":"kaifeng","genre":"landscape","people":"clothed","topics":["ah1.chinese-landscape","design.proportion-scale"],"pd":true,"img":true,"w":499,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"guo-xi","title":"Early Spring","artist":"Guo Xi","date":"1072","year":1072,"period":"song","kind":"painting","medium":"Ink and light color on silk, hanging scroll","at":"National Palace Museum, Taipei","now":"taipei","made":"kaifeng","genre":"landscape","people":"none","topics":["ah1.chinese-landscape"],"pd":true,"img":true,"w":688,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"qingming","title":"Along the River during the Qingming Festival (detail)","artist":"Zhang Zeduan","date":"early 1100s","year":1110,"period":"song","kind":"painting","medium":"Ink and color on silk, handscroll","at":"Palace Museum, Beijing","now":"beijing","made":"kaifeng","genre":"genre","people":"clothed","topics":["ah1.chinese-landscape"],"pd":true,"img":true,"note":"The date and even the city shown are debated; most scholars place it in the Northern Song capital, Kaifeng.","w":960,"h":480,"credit":"Wikimedia Commons (public domain)"},{"id":"shang-ding","title":"Ritual Food Vessel (Ding)","artist":"Shang dynasty","date":"about 1300 to 1046 BC","year":-1200,"period":"shang","kind":"object","medium":"Bronze","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"anyang","genre":"object","people":"none","topics":["ah1.chinese-objects","ah1.sculpture-media"],"pd":true,"img":true,"w":960,"h":720,"credit":"The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"terracotta-army","title":"Terracotta Army","artist":"Qin dynasty, for the First Emperor","date":"about 210 BC","year":-210,"period":"qinhan","kind":"sculpture","medium":"Painted terracotta","at":"Mausoleum of the First Qin Emperor, near Xi'an, China","now":"xian","made":"xian","genre":"portrait","people":"clothed","topics":["ah1.chinese-objects"],"pd":true,"img":true,"w":667,"h":1000,"credit":"Wikimedia Commons (CC0)"},{"id":"ming-jar","title":"Blue-and-White Jar with a Dragon","artist":"Ming dynasty, Jingdezhen kilns","date":"early 1400s","year":1420,"period":"ming","kind":"ceramic","medium":"Porcelain with cobalt blue under clear glaze","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"jingdezhen","genre":"object","people":"none","topics":["ah1.chinese-objects","ah2.ming-qing"],"pd":true,"img":true,"w":800,"h":1000,"credit":"The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"gandhara-buddha","title":"Standing Buddha","artist":"Gandhara","date":"about 2nd to 3rd century AD","year":200,"period":"gandhara","kind":"sculpture","medium":"Schist","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"gandhara","genre":"religious","people":"clothed","topics":["ah1.buddhist-art"],"pd":true,"img":false},{"id":"byodo-in","title":"Phoenix Hall, Byōdō-in","artist":"Heian Japan","date":"1053","year":1053,"period":"heian","kind":"architecture","medium":"Wood, tile roofs","at":"Uji, near Kyoto, Japan","now":"uji","made":"uji","genre":"architecture","people":"none","topics":["ah1.buddhist-art","ah1.japan-early"],"pd":true,"img":true,"w":1000,"h":666,"credit":"Wikimedia Commons (CC0)"},{"id":"genji","title":"The Tale of Genji Scrolls (a scene)","artist":"Heian court painters","date":"about 1130","year":1130,"period":"heian","kind":"painting","medium":"Ink and color on paper, handscroll","at":"Tokugawa Art Museum, Nagoya, and Gotoh Museum, Tokyo","now":"nagoya","made":"kyoto","genre":"genre","people":"clothed","topics":["ah1.japan-early"],"pd":true,"img":true,"w":960,"h":519,"credit":"Wikimedia Commons (public domain)"},{"id":"brihadishvara","title":"Brihadishvara Temple","artist":"Chola, for King Rajaraja I","date":"completed 1010","year":1010,"period":"chola","kind":"architecture","medium":"Granite","at":"Thanjavur, India","now":"thanjavur","made":"thanjavur","genre":"architecture","people":"none","topics":["ah1.south-southeast-asia"],"pd":true,"img":false},{"id":"angkor-wat","title":"Angkor Wat","artist":"Khmer, for King Suryavarman II","date":"first half of the 1100s","year":1130,"period":"khmer","kind":"architecture","medium":"Sandstone","at":"Angkor, Cambodia","now":"angkor","made":"angkor","genre":"architecture","people":"none","topics":["ah1.south-southeast-asia","design.balance-principle"],"pd":true,"img":true,"w":960,"h":285,"credit":"Wikimedia Commons (CC0)"},{"id":"nok-head","title":"Head from a Figure","artist":"Nok","date":"more than 2,000 years old","year":-300,"period":"nok","kind":"sculpture","medium":"Terracotta","at":"Museum collections in Nigeria and abroad","now":"lagos","made":"nok","genre":"portrait","people":"none","topics":["ah1.africa-early"],"pd":true,"img":true,"note":"Dating Nok terracottas is hard; many were dug up without records, which also makes some pieces on the market doubtful. The head pictured is in the Honolulu Museum of Art.","w":506,"h":1000,"credit":"Wikimedia Commons (CC0)"},{"id":"ife-head","title":"Ife Head","artist":"Yoruba, Ife","date":"12th to 15th century","year":1300,"period":"ife","kind":"sculpture","medium":"Copper alloy","at":"British Museum, London (others are in Nigerian museums)","now":"london","made":"ife","genre":"portrait","people":"none","topics":["ah1.africa-early"],"pd":true,"img":true,"note":"The British Museum head left Nigeria in 1939; others found with it are in the National Museum, Lagos and in Ife.","w":567,"h":1000,"credit":"Wikimedia Commons (CC0)"},{"id":"iyoba","title":"Queen Mother Pendant Mask (Iyoba)","artist":"Edo peoples, Kingdom of Benin","date":"16th century","year":1520,"period":"benin","kind":"sculpture","medium":"Ivory, iron and copper","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"benincity","genre":"portrait","people":"none","topics":["ah2.benin-bronzes","ah1.africa-early"],"pd":true,"img":true,"note":"Taken from the royal palace in 1897; its twin is in the British Museum.","w":500,"h":666,"credit":"The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"great-zimbabwe","title":"Great Enclosure, Great Zimbabwe","artist":"Shona ancestors","date":"about 1300 to 1450","year":1350,"period":"zimbabwe","kind":"architecture","medium":"Granite blocks without mortar","at":"Near Masvingo, Zimbabwe","now":"zimbabwe","made":"zimbabwe","genre":"architecture","people":"none","topics":["ah1.africa-early"],"pd":true,"img":true,"note":"Colonial writers wrongly credited it to outsiders; archaeology shows it was built by ancestors of the Shona.","w":561,"h":390,"credit":"Wikimedia Commons (public domain)"},{"id":"lalibela","title":"Church of Saint George (Bete Giyorgis), Lalibela","artist":"Zagwe Ethiopia","date":"about 1200","year":1200,"period":"zagwe","kind":"architecture","medium":"Carved from the living rock","at":"Lalibela, Ethiopia","now":"lalibela","made":"lalibela","genre":"architecture","people":"none","topics":["ah1.africa-early"],"pd":true,"img":false,"note":"Tradition credits King Lalibela; archaeologists think the churches were cut over a longer period."},{"id":"djenne","title":"Great Mosque of Djenné","artist":"Mali builders, master mason Ismaila Traoré","date":"rebuilt 1907 (first mosque 13th century)","year":1907,"period":"africa-later","kind":"architecture","medium":"Mud brick and plaster, replastered each year","at":"Djenné, Mali","now":"djenne","made":"djenne","genre":"architecture","people":"none","topics":["ah1.africa-early","ah2.african-arts"],"pd":true,"img":true,"w":640,"h":480,"credit":"Wikimedia Commons (public domain)"},{"id":"olmec-head","title":"Colossal Head from San Lorenzo","artist":"Olmec","date":"about 1200 to 900 BC","year":-1050,"period":"olmec","kind":"sculpture","medium":"Basalt","at":"National Museum of Anthropology, Mexico City","now":"mexicocity","made":"sanlorenzo","genre":"portrait","people":"none","topics":["ah1.mesoamerica"],"pd":true,"img":true,"note":"One of seventeen known Olmec colossal heads, ten of them from San Lorenzo; most are now in the anthropology museums of Xalapa and Mexico City. Scholars think the heads portray rulers.","w":667,"h":1000,"credit":"Wikimedia Commons (CC0)"},{"id":"teotihuacan","title":"Pyramid of the Sun, Teotihuacan","artist":"Teotihuacan","date":"about AD 200","year":200,"period":"teotihuacan","kind":"architecture","medium":"Rubble core faced with stone","at":"Teotihuacan, Mexico","now":"teotihuacan","made":"teotihuacan","genre":"architecture","people":"none","topics":["ah1.mesoamerica"],"pd":true,"img":true,"w":500,"h":313,"credit":"Wikimedia Commons (public domain)"},{"id":"palenque","title":"Temple of the Inscriptions, Palenque","artist":"Maya, for King Pakal","date":"about 683","year":683,"period":"maya","kind":"architecture","medium":"Limestone, once painted","at":"Palenque, Mexico","now":"palenque","made":"palenque","genre":"architecture","people":"none","topics":["ah1.mesoamerica"],"pd":true,"img":false},{"id":"chichen-itza","title":"El Castillo, Chichén Itzá","artist":"Maya","date":"about 900 to 1100","year":1000,"period":"maya","kind":"architecture","medium":"Limestone","at":"Yucatán, Mexico","now":"chichen","made":"chichen","genre":"architecture","people":"none","topics":["ah1.mesoamerica"],"pd":true,"img":true,"w":960,"h":669,"credit":"Wikimedia Commons (public domain)"},{"id":"sun-stone","title":"The Aztec Sun Stone","artist":"Aztec (Mexica)","date":"about 1502 to 1520","year":1510,"period":"aztec","kind":"sculpture","medium":"Basalt, once painted","at":"National Museum of Anthropology, Mexico City","now":"mexicocity","made":"mexicocity","genre":"religious","people":"none","topics":["ah1.mesoamerica","design.balance-principle"],"pd":true,"img":true,"note":"Long called the Calendar Stone; it carries calendar signs, but scholars debate whether it was a calendar, an altar or a monument to the sun.","w":500,"h":667,"credit":"Wikimedia Commons (CC0)"},{"id":"machu-picchu","title":"Machu Picchu","artist":"Inca, probably for Emperor Pachacuti","date":"about 1450","year":1450,"period":"inca","kind":"architecture","medium":"Granite, fitted without mortar","at":"Cusco Region, Peru","now":"machupicchu","made":"machupicchu","genre":"architecture","people":"none","topics":["ah1.andes-north-america"],"pd":true,"img":true,"w":1000,"h":622,"credit":"Wikimedia Commons (public domain)"},{"id":"moche-portrait","title":"Portrait Vessel of a Ruler","artist":"Moche","date":"about 100 BC to AD 500","year":200,"period":"moche","kind":"ceramic","medium":"Painted ceramic","at":"The Art Institute of Chicago","now":"chicago","made":"moche","genre":"portrait","people":"clothed","topics":["ah1.andes-north-america"],"pd":true,"img":true,"w":674,"h":1000,"credit":"The Art Institute of Chicago, via Wikimedia Commons (CC0)"},{"id":"cliff-palace","title":"Cliff Palace, Mesa Verde","artist":"Ancestral Puebloan","date":"about 1190 to 1260","year":1225,"period":"puebloan","kind":"architecture","medium":"Sandstone, mortar and wood","at":"Mesa Verde National Park, Colorado","now":"mesaverde","made":"mesaverde","genre":"architecture","people":"none","topics":["ah1.andes-north-america"],"pd":true,"img":true,"w":500,"h":399,"credit":"Wikimedia Commons (public domain)"},{"id":"florence-dome","title":"Dome of Florence Cathedral","artist":"Filippo Brunelleschi","date":"1420 to 1436","year":1430,"period":"earlyren","kind":"architecture","medium":"Brick and stone","at":"Florence","now":"florence","made":"florence","genre":"architecture","people":"none","topics":["ah1.florence-dome","ah1.renaissance-architecture"],"pd":true,"img":true,"w":960,"h":640,"credit":"Wikimedia Commons (CC0)"},{"id":"tribute-money","title":"The Tribute Money","artist":"Masaccio","date":"about 1425 to 1427","year":1426,"period":"earlyren","kind":"painting","medium":"Fresco","at":"Brancacci Chapel, Santa Maria del Carmine, Florence","now":"florence","made":"florence","genre":"religious","people":"clothed","topics":["ah1.linear-perspective","design.composition-structures"],"pd":true,"img":true,"w":960,"h":443,"credit":"Wikimedia Commons (public domain)"},{"id":"jacob-esau","title":"Gates of Paradise: Jacob and Esau Panel","artist":"Lorenzo Ghiberti","date":"1425 to 1452","year":1440,"period":"earlyren","kind":"sculpture","medium":"Gilded bronze relief","at":"Museo dell'Opera del Duomo, Florence (copies on the Baptistery)","now":"florence","made":"florence","genre":"religious","people":"clothed","topics":["ah1.early-renaissance-art","ah1.linear-perspective"],"pd":true,"img":false},{"id":"gattamelata","title":"Equestrian Statue of Gattamelata","artist":"Donatello","date":"1445 to 1453","year":1450,"period":"earlyren","kind":"sculpture","medium":"Bronze","at":"Piazza del Santo, Padua","now":"padua","made":"padua","genre":"portrait","people":"clothed","topics":["ah1.early-renaissance-art","ah1.sculpture-media"],"pd":true,"img":true,"w":662,"h":617,"credit":"Lantern slide of the statue, without its pedestal; Université de Louvain, via Wikimedia Commons (public domain)"},{"id":"angelico-annunciation","title":"The Annunciation","artist":"Fra Angelico","date":"about 1440 to 1445","year":1442,"period":"earlyren","kind":"painting","medium":"Fresco","at":"Convent of San Marco, Florence","now":"florence","made":"florence","genre":"religious","people":"clothed","topics":["ah1.early-renaissance-art","ah1.painting-media"],"pd":true,"img":true,"w":960,"h":665,"credit":"Wikimedia Commons (public domain)"},{"id":"montefeltro","title":"Portraits of the Duke and Duchess of Urbino","artist":"Piero della Francesca","date":"about 1473 to 1475","year":1474,"period":"earlyren","kind":"painting","medium":"Oil and tempera on wood","at":"Uffizi Galleries, Florence","now":"florence","made":"urbino","genre":"portrait","people":"clothed","topics":["ah1.early-renaissance-art","ah1.patrons-context"],"pd":true,"img":true,"w":500,"h":352,"credit":"Wikimedia Commons (public domain)"},{"id":"botticelli-medal","title":"Portrait of a Man with a Medal of Cosimo the Elder","artist":"Sandro Botticelli","date":"about 1474 to 1475","year":1475,"period":"earlyren","kind":"painting","medium":"Tempera on wood","at":"Uffizi Galleries, Florence","now":"florence","made":"florence","genre":"portrait","people":"clothed","topics":["ah1.early-renaissance-art"],"pd":true,"img":true,"note":"Who the young man is remains unknown.","w":723,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"mona-lisa","title":"Mona Lisa","artist":"Leonardo da Vinci","date":"begun about 1503","year":1503,"period":"highren","kind":"painting","medium":"Oil on poplar panel","at":"Louvre, Paris","now":"paris","made":"florence","genre":"portrait","people":"clothed","topics":["ah1.leonardo","ydraw.kinds-of-pictures","draw.atmospheric"],"pd":true,"img":true,"note":"Usually identified as Lisa Gherardini; Leonardo kept working on it for years, and the Louvre dates it 1503 to 1519.","w":671,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"last-supper","title":"The Last Supper","artist":"Leonardo da Vinci","date":"about 1495 to 1498","year":1496,"period":"highren","kind":"painting","medium":"Tempera and oil on dry plaster","at":"Santa Maria delle Grazie, Milan","now":"milan","made":"milan","genre":"religious","people":"clothed","topics":["ah1.leonardo","ah1.painting-media","draw.one-point","design.emphasis"],"pd":true,"img":true,"note":"Because it was not true fresco, the paint began flaking within decades; a restoration finished in 1999.","w":960,"h":480,"credit":"Wikimedia Commons (public domain)"},{"id":"ermine","title":"Lady with an Ermine","artist":"Leonardo da Vinci","date":"about 1489 to 1490","year":1490,"period":"highren","kind":"painting","medium":"Oil on walnut panel","at":"Czartoryski Museum, Kraków","now":"krakow","made":"milan","genre":"portrait","people":"clothed","topics":["ah1.leonardo"],"pd":true,"img":true,"w":744,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"castiglione","title":"Portrait of Baldassare Castiglione","artist":"Raphael","date":"about 1514 to 1515","year":1515,"period":"highren","kind":"painting","medium":"Oil on canvas","at":"Louvre, Paris","now":"paris","made":"rome","genre":"portrait","people":"clothed","topics":["ah1.raphael-michelangelo"],"pd":true,"img":true,"w":804,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"st-peters-dome","title":"Dome of St. Peter's Basilica","artist":"Michelangelo (design), completed by Giacomo della Porta","date":"designed from 1547; completed 1590","year":1547,"period":"highren","kind":"architecture","medium":"Brick and stone","at":"Vatican City","now":"vatican","made":"vatican","genre":"architecture","people":"none","topics":["ah1.raphael-michelangelo"],"pd":true,"img":true,"w":960,"h":631,"credit":"Wikimedia Commons (CC0)"},{"id":"loredan","title":"Doge Leonardo Loredan","artist":"Giovanni Bellini","date":"about 1501 to 1502","year":1501,"period":"highren","kind":"painting","medium":"Oil on poplar","at":"National Gallery, London","now":"london","made":"venice","genre":"portrait","people":"clothed","topics":["ah1.venice"],"pd":true,"img":true,"w":713,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"titian-man","title":"Portrait of a Man","artist":"Titian","date":"about 1510","year":1510,"period":"highren","kind":"painting","medium":"Oil on canvas","at":"National Gallery, London","now":"london","made":"venice","genre":"portrait","people":"clothed","topics":["ah1.venice","ah1.dating-attribution"],"pd":true,"img":true,"note":"The National Gallery titles it \"Portrait of Gerolamo (?) Barbarigo\"; it was once called the poet Ariosto, and some think it is Titian himself. The sitter is not known for sure.","w":823,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"arnolfini","title":"The Arnolfini Portrait","artist":"Jan van Eyck","date":"1434","year":1434,"period":"northren","kind":"painting","medium":"Oil on oak","at":"National Gallery, London","now":"london","made":"bruges","genre":"portrait","people":"clothed","topics":["ah1.northern-renaissance","ah1.painting-media","ah1.formal-analysis","ah2.style-recognition"],"pd":true,"img":true,"note":"Usually identified as Giovanni di Nicolao Arnolfini and his wife; what the scene records (a marriage, a betrothal or a memorial) is debated.","w":731,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"red-turban","title":"Portrait of a Man (Self Portrait?)","artist":"Jan van Eyck","date":"1433","year":1433,"period":"northren","kind":"painting","medium":"Oil on oak","at":"National Gallery, London","now":"london","made":"bruges","genre":"portrait","people":"clothed","topics":["ah1.northern-renaissance","ah1.dating-attribution"],"pd":true,"img":true,"note":"The frame reads \"As I can\"; many scholars think it is a self-portrait, but it is not proven.","w":729,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"rogier-lady","title":"Portrait of a Lady","artist":"Rogier van der Weyden","date":"about 1460","year":1460,"period":"northren","kind":"painting","medium":"Oil on panel","at":"National Gallery of Art, Washington","now":"washington","made":"brussels","genre":"portrait","people":"clothed","topics":["ah1.northern-renaissance"],"pd":true,"img":true,"w":730,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"durer-self","title":"Self-Portrait at Twenty-Eight","artist":"Albrecht Dürer","date":"1500","year":1500,"period":"northren","kind":"painting","medium":"Oil on panel","at":"Alte Pinakothek, Munich","now":"munich","made":"nuremberg","genre":"portrait","people":"clothed","topics":["ah1.durer-prints"],"pd":true,"img":true,"w":723,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"young-hare","title":"Young Hare","artist":"Albrecht Dürer","date":"1502","year":1502,"period":"northren","kind":"drawing","medium":"Watercolor and gouache on paper","at":"Albertina, Vienna","now":"vienna","made":"nuremberg","genre":"animal","people":"none","topics":["ah1.durer-prints","draw.texture","ydraw.texture-marks"],"pd":true,"img":true,"w":905,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"rhinoceros","title":"The Rhinoceros","artist":"Albrecht Dürer","date":"1515","year":1515,"period":"northren","kind":"print","medium":"Woodcut","at":"Many impressions, e.g. National Gallery of Art, Washington","now":"washington","made":"nuremberg","genre":"animal","people":"none","topics":["ah1.durer-prints","ydraw.texture-marks"],"pd":true,"img":true,"note":"Dürer never saw the animal; he worked from a written description and a sketch sent from Lisbon.","w":693,"h":549,"credit":"Wikimedia Commons (public domain)"},{"id":"ambassadors","title":"The Ambassadors","artist":"Hans Holbein the Younger","date":"1533","year":1533,"period":"northren","kind":"painting","medium":"Oil on oak","at":"National Gallery, London","now":"london","made":"london","genre":"portrait","people":"clothed","topics":["ah1.northern-renaissance","draw.ellipses"],"pd":true,"img":true,"w":960,"h":946,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"hunters-snow","title":"Hunters in the Snow","artist":"Pieter Bruegel the Elder","date":"1565","year":1565,"period":"northren","kind":"painting","medium":"Oil on oak","at":"Kunsthistorisches Museum, Vienna","now":"vienna","made":"brussels","genre":"landscape","people":"clothed","topics":["ah1.bruegel","draw.atmospheric","design.composition-structures"],"pd":true,"img":true,"w":960,"h":683,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"harvesters","title":"The Harvesters","artist":"Pieter Bruegel the Elder","date":"1565","year":1565,"period":"northren","kind":"painting","medium":"Oil on wood","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"brussels","genre":"landscape","people":"clothed","topics":["ah1.bruegel","draw.atmospheric"],"pd":true,"img":true,"w":960,"h":699,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"rotonda","title":"Villa La Rotonda","artist":"Andrea Palladio","date":"begun about 1567","year":1567,"period":"mannerism","kind":"architecture","medium":"Brick and stucco","at":"Vicenza, Italy","now":"vicenza","made":"vicenza","genre":"architecture","people":"none","topics":["ah1.renaissance-architecture","design.balance-principle"],"pd":true,"img":true,"note":"Finished after Palladio's death by Vincenzo Scamozzi.","w":674,"h":1000,"credit":"Palladio's own plan and section, from his Four Books of Architecture (1570); The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"eleonora","title":"Eleonora of Toledo with Her Son Giovanni","artist":"Agnolo Bronzino","date":"about 1545","year":1545,"period":"mannerism","kind":"painting","medium":"Oil on panel","at":"Uffizi Galleries, Florence","now":"florence","made":"florence","genre":"portrait","people":"clothed","topics":["ah1.mannerism"],"pd":true,"img":true,"w":824,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"view-toledo","title":"View of Toledo","artist":"El Greco","date":"about 1599 to 1600","year":1600,"period":"mannerism","kind":"painting","medium":"Oil on canvas","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"toledo","genre":"landscape","people":"none","topics":["ah1.mannerism","ah2.romanticism"],"pd":true,"img":true,"w":886,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"chess-game","title":"The Chess Game","artist":"Sofonisba Anguissola","date":"1555","year":1555,"period":"mannerism","kind":"painting","medium":"Oil on canvas","at":"National Museum, Poznań, Poland","now":"poznan","made":"milan","genre":"portrait","people":"clothed","topics":["ah1.mannerism","ah2.gentileschi"],"pd":true,"img":true,"w":816,"h":644,"credit":"Wikimedia Commons (public domain)"},{"id":"calling-matthew","title":"The Calling of Saint Matthew","artist":"Caravaggio","date":"1599 to 1600","year":1600,"period":"baroque","kind":"painting","medium":"Oil on canvas","at":"Contarelli Chapel, San Luigi dei Francesi, Rome","now":"rome","made":"rome","genre":"religious","people":"clothed","topics":["ah2.caravaggio","ah2.baroque-traits","design.emphasis"],"pd":true,"img":true,"w":960,"h":986,"credit":"Wikimedia Commons (public domain)"},{"id":"emmaus","title":"The Supper at Emmaus","artist":"Caravaggio","date":"1601","year":1601,"period":"baroque","kind":"painting","medium":"Oil and tempera on canvas","at":"National Gallery, London","now":"london","made":"rome","genre":"religious","people":"clothed","topics":["ah2.caravaggio"],"pd":true,"img":true,"w":960,"h":682,"credit":"Wikimedia Commons (public domain)"},{"id":"allegory-painting","title":"Self-Portrait as the Allegory of Painting","artist":"Artemisia Gentileschi","date":"about 1638 to 1639","year":1638,"period":"baroque","kind":"painting","medium":"Oil on canvas","at":"Royal Collection, United Kingdom","now":"london","made":"london","genre":"portrait","people":"clothed","topics":["ah2.gentileschi"],"pd":true,"img":true,"note":"Most scholars accept it as a self-portrait; a few have questioned the identification.","w":740,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"colonnade","title":"Colonnade of St. Peter's Square","artist":"Gian Lorenzo Bernini","date":"1656 to 1667","year":1660,"period":"baroque","kind":"architecture","medium":"Travertine","at":"Vatican City","now":"vatican","made":"vatican","genre":"architecture","people":"none","topics":["ah2.bernini-rome"],"pd":true,"img":true,"w":750,"h":1000,"credit":"Wikimedia Commons (CC0)"},{"id":"san-carlo","title":"San Carlo alle Quattro Fontane","artist":"Francesco Borromini","date":"1638 to 1641; façade finished 1677","year":1640,"period":"baroque","kind":"architecture","medium":"Stucco and stone","at":"Rome","now":"rome","made":"rome","genre":"architecture","people":"none","topics":["ah2.bernini-rome","ah2.baroque-architecture"],"pd":true,"img":true,"w":300,"h":380,"credit":"Wikimedia Commons (public domain)"},{"id":"chapeau-paille","title":"Le Chapeau de Paille","artist":"Peter Paul Rubens","date":"about 1622 to 1625","year":1623,"period":"baroque","kind":"painting","medium":"Oil on oak","at":"National Gallery, London","now":"london","made":"antwerp","genre":"portrait","people":"clothed","topics":["ah2.flemish-baroque"],"pd":true,"img":true,"note":"Probably Susanna Lunden, the sister of Rubens's second wife.","w":500,"h":733,"credit":"Wikimedia Commons (public domain)"},{"id":"charles-hunt","title":"Charles I at the Hunt","artist":"Anthony van Dyck","date":"about 1635","year":1635,"period":"baroque","kind":"painting","medium":"Oil on canvas","at":"Louvre, Paris","now":"paris","made":"london","genre":"portrait","people":"clothed","topics":["ah2.flemish-baroque"],"pd":true,"img":true,"w":500,"h":642,"credit":"Wikimedia Commons (public domain)"},{"id":"meninas","title":"Las Meninas","artist":"Diego Velázquez","date":"1656","year":1656,"period":"baroque","kind":"painting","medium":"Oil on canvas","at":"Museo del Prado, Madrid","now":"madrid","made":"madrid","genre":"portrait","people":"clothed","topics":["ah2.velazquez","design.formal-analysis"],"pd":true,"img":true,"w":869,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"pareja","title":"Juan de Pareja","artist":"Diego Velázquez","date":"1650","year":1650,"period":"baroque","kind":"painting","medium":"Oil on canvas","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"rome","genre":"portrait","people":"clothed","topics":["ah2.velazquez"],"pd":true,"img":true,"note":"Juan de Pareja, enslaved in Velázquez's household and later freed, became a painter himself.","w":860,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"versailles","title":"Palace of Versailles, Garden Front","artist":"Louis Le Vau and Jules Hardouin-Mansart","date":"enlarged from 1661 to about 1710","year":1680,"period":"baroque","kind":"architecture","medium":"Stone","at":"Versailles, France","now":"versailles","made":"versailles","genre":"architecture","people":"none","topics":["ah2.baroque-architecture"],"pd":true,"img":false},{"id":"st-pauls","title":"St. Paul's Cathedral","artist":"Christopher Wren","date":"1675 to 1710","year":1700,"period":"baroque","kind":"architecture","medium":"Portland stone","at":"London","now":"london","made":"london","genre":"architecture","people":"none","topics":["ah2.baroque-architecture"],"pd":true,"img":true,"w":782,"h":1000,"credit":"Yale Center for British Art, via Wikimedia Commons (CC0)"},{"id":"night-watch","title":"The Night Watch","artist":"Rembrandt van Rijn","date":"1642","year":1642,"period":"dutch","kind":"painting","medium":"Oil on canvas","at":"Rijksmuseum, Amsterdam","now":"amsterdam","made":"amsterdam","genre":"portrait","people":"clothed","topics":["ah2.rembrandt","design.emphasis"],"pd":true,"img":true,"w":960,"h":804,"credit":"Wikimedia Commons (public domain)"},{"id":"rembrandt-1659","title":"Self-Portrait","artist":"Rembrandt van Rijn","date":"1659","year":1659,"period":"dutch","kind":"painting","medium":"Oil on canvas","at":"National Gallery of Art, Washington","now":"washington","made":"amsterdam","genre":"portrait","people":"clothed","topics":["ah2.rembrandt","draw.light-on-form"],"pd":true,"img":true,"w":772,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"milkmaid","title":"The Milkmaid","artist":"Johannes Vermeer","date":"about 1660","year":1660,"period":"dutch","kind":"painting","medium":"Oil on canvas","at":"Rijksmuseum, Amsterdam","now":"amsterdam","made":"delft","genre":"genre","people":"clothed","topics":["ah2.vermeer","design.complementary","ah1.subject-style","ah2.dutch-market","ah2.compare-contrast"],"pd":true,"img":true,"note":"The Rijksmuseum dates it about 1660; some scholars place it a little earlier, about 1657 to 1658.","w":892,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"pearl-earring","title":"Girl with a Pearl Earring","artist":"Johannes Vermeer","date":"about 1665","year":1665,"period":"dutch","kind":"painting","medium":"Oil on canvas","at":"Mauritshuis, The Hague","now":"thehague","made":"delft","genre":"portrait","people":"clothed","topics":["ah2.vermeer","design.complementary"],"pd":true,"img":true,"note":"Not a portrait of a known person but a tronie, a study of a face in costume.","w":844,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"view-delft","title":"View of Delft","artist":"Johannes Vermeer","date":"about 1660 to 1661","year":1660,"period":"dutch","kind":"painting","medium":"Oil on canvas","at":"Mauritshuis, The Hague","now":"thehague","made":"delft","genre":"landscape","people":"clothed","topics":["ah2.vermeer","draw.rule-of-thirds"],"pd":true,"img":true,"w":960,"h":797,"credit":"Wikimedia Commons (public domain)"},{"id":"leyster-self","title":"Self-Portrait","artist":"Judith Leyster","date":"about 1630","year":1630,"period":"dutch","kind":"painting","medium":"Oil on canvas","at":"National Gallery of Art, Washington","now":"washington","made":"haarlem","genre":"portrait","people":"clothed","topics":["ah2.leyster-genre"],"pd":true,"img":true,"w":500,"h":571,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"wijk-mill","title":"The Windmill at Wijk bij Duurstede","artist":"Jacob van Ruisdael","date":"about 1668 to 1670","year":1669,"period":"dutch","kind":"painting","medium":"Oil on canvas","at":"Rijksmuseum, Amsterdam","now":"amsterdam","made":"amsterdam","genre":"landscape","people":"none","topics":["ah2.dutch-landscape-still-life","draw.rule-of-thirds","ah2.dutch-market"],"pd":true,"img":true,"w":1000,"h":825,"credit":"Rijksmuseum, via Wikimedia Commons (public domain)"},{"id":"ruysch-flowers","title":"Still Life with Flowers in a Glass Vase","artist":"Rachel Ruysch","date":"about 1690 to 1720","year":1705,"period":"dutch","kind":"painting","medium":"Oil on canvas","at":"Rijksmuseum, Amsterdam","now":"amsterdam","made":"amsterdam","genre":"still life","people":"none","topics":["ah2.dutch-landscape-still-life"],"pd":true,"img":true,"note":"The Rijksmuseum dates it broadly; Ruysch painted flowers for more than sixty years.","w":804,"h":1000,"credit":"Rijksmuseum, via Wikimedia Commons (public domain)"},{"id":"claesz-vanitas","title":"Vanitas Still Life","artist":"Pieter Claesz","date":"1630","year":1630,"period":"dutch","kind":"painting","medium":"Oil on panel","at":"Mauritshuis, The Hague","now":"thehague","made":"haarlem","genre":"still life","people":"none","topics":["ah2.dutch-landscape-still-life","draw.still-life"],"pd":true,"img":true,"w":960,"h":675,"credit":"Wikimedia Commons (public domain)"},{"id":"marie-antoinette-rose","title":"Marie Antoinette with a Rose","artist":"Élisabeth Vigée Le Brun","date":"1783","year":1783,"period":"rococo","kind":"painting","medium":"Oil on canvas","at":"Palace of Versailles","now":"versailles","made":"paris","genre":"portrait","people":"clothed","topics":["ah2.rococo","ah2.dating-by-style"],"pd":true,"img":true,"w":823,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"vigee-straw-hat","title":"Self-Portrait in a Straw Hat","artist":"Élisabeth Vigée Le Brun","date":"after 1782","year":1782,"period":"rococo","kind":"painting","medium":"Oil on canvas","at":"National Gallery, London","now":"london","made":"paris","genre":"portrait","people":"clothed","topics":["ah2.rococo"],"pd":true,"img":true,"w":720,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"soap-bubbles","title":"Soap Bubbles","artist":"Jean-Siméon Chardin","date":"about 1733 to 1734","year":1734,"period":"rococo","kind":"painting","medium":"Oil on canvas","at":"National Gallery of Art, Washington (other versions in New York and Los Angeles)","now":"washington","made":"paris","genre":"genre","people":"clothed","topics":["ah2.genre-and-views"],"pd":true,"img":true,"w":809,"h":1000,"credit":"National Gallery of Art, Washington, via Wikimedia Commons (CC0)"},{"id":"canaletto-san-marco","title":"The Square of Saint Mark's, Venice","artist":"Canaletto","date":"1742 to 1744","year":1743,"period":"rococo","kind":"painting","medium":"Oil on canvas","at":"National Gallery of Art, Washington","now":"washington","made":"venice","genre":"landscape","people":"clothed","topics":["ah2.genre-and-views","draw.one-point-scenes"],"pd":true,"img":true,"w":960,"h":711,"credit":"National Gallery of Art, Washington, via Wikimedia Commons (public domain)"},{"id":"blue-boy","title":"The Blue Boy","artist":"Thomas Gainsborough","date":"about 1770","year":1770,"period":"rococo","kind":"painting","medium":"Oil on canvas","at":"The Huntington Library, Art Museum, and Botanical Gardens, San Marino, California","now":"sanmarino","made":"london","genre":"portrait","people":"clothed","topics":["ah2.grand-manner","design.complementary"],"pd":true,"img":true,"w":677,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"revere","title":"Paul Revere","artist":"John Singleton Copley","date":"1768","year":1768,"period":"rococo","kind":"painting","medium":"Oil on canvas","at":"Museum of Fine Arts, Boston","now":"boston","made":"boston","genre":"portrait","people":"clothed","topics":["ah2.early-america"],"pd":true,"img":true,"w":828,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"washington-athenaeum","title":"George Washington (the Athenaeum Portrait)","artist":"Gilbert Stuart","date":"1796","year":1796,"period":"neoclassical","kind":"painting","medium":"Oil on canvas (left unfinished)","at":"Owned jointly by the National Portrait Gallery, Washington, and the Museum of Fine Arts, Boston","now":"washington","made":"philadelphia","genre":"portrait","people":"clothed","topics":["ah2.early-america"],"pd":true,"img":true,"note":"The image on the U.S. one-dollar bill is based on this portrait.","w":770,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"horatii","title":"The Oath of the Horatii","artist":"Jacques-Louis David","date":"1784","year":1784,"period":"neoclassical","kind":"painting","medium":"Oil on canvas","at":"Louvre, Paris","now":"paris","made":"rome","genre":"history","people":"clothed","topics":["ah2.neoclassicism","design.composition-structures"],"pd":true,"img":true,"w":960,"h":744,"credit":"Wikimedia Commons (public domain)"},{"id":"napoleon-alps","title":"Napoleon Crossing the Alps","artist":"Jacques-Louis David","date":"1801","year":1801,"period":"neoclassical","kind":"painting","medium":"Oil on canvas","at":"Château de Malmaison, Rueil-Malmaison (one of five versions)","now":"paris","made":"paris","genre":"portrait","people":"clothed","topics":["ah2.neoclassicism","design.movement"],"pd":true,"img":true,"note":"Napoleon actually crossed on a mule in fair weather; David painted the heroic image he wanted.","w":821,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"monticello","title":"Monticello","artist":"Thomas Jefferson","date":"1769 to 1809","year":1800,"period":"neoclassical","kind":"architecture","medium":"Brick and wood","at":"Charlottesville, Virginia","now":"charlottesville","made":"charlottesville","genre":"architecture","people":"none","topics":["ah2.early-america","ah1.renaissance-architecture"],"pd":true,"img":true,"w":883,"h":617,"credit":"Historic American Buildings Survey photograph of the west front; Library of Congress, via Wikimedia Commons (public domain)"},{"id":"wanderer","title":"Wanderer above the Sea of Fog","artist":"Caspar David Friedrich","date":"about 1817","year":1817,"period":"romantic","kind":"painting","medium":"Oil on canvas","at":"Hamburger Kunsthalle, Hamburg","now":"hamburg","made":"dresden","genre":"landscape","people":"clothed","topics":["ah2.romanticism","design.emphasis"],"pd":true,"img":true,"w":780,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"temeraire","title":"The Fighting Temeraire","artist":"J. M. W. Turner","date":"1839","year":1839,"period":"romantic","kind":"painting","medium":"Oil on canvas","at":"National Gallery, London","now":"london","made":"london","genre":"landscape","people":"none","topics":["ah2.romanticism","design.temperature"],"pd":true,"img":true,"w":960,"h":713,"credit":"Wikimedia Commons (public domain)"},{"id":"hay-wain","title":"The Hay Wain","artist":"John Constable","date":"1821","year":1821,"period":"romantic","kind":"painting","medium":"Oil on canvas","at":"National Gallery, London","now":"london","made":"suffolk","genre":"landscape","people":"clothed","topics":["ah2.constable-goya","draw.atmospheric"],"pd":true,"img":true,"w":960,"h":662,"credit":"Wikimedia Commons (public domain)"},{"id":"manuel-osorio","title":"Manuel Osorio Manrique de Zuñiga","artist":"Francisco de Goya","date":"about 1787 to 1788","year":1788,"period":"romantic","kind":"painting","medium":"Oil on canvas","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"madrid","genre":"portrait","people":"clothed","topics":["ah2.constable-goya"],"pd":true,"img":true,"w":737,"h":1000,"credit":"The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"oxbow","title":"The Oxbow","artist":"Thomas Cole","date":"1836","year":1836,"period":"romantic","kind":"painting","medium":"Oil on canvas","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"catskill","genre":"landscape","people":"none","topics":["ah2.hudson-river","design.composition-structures"],"pd":true,"img":true,"style":"Hudson River School","w":960,"h":652,"credit":"Wikimedia Commons (public domain)"},{"id":"gleaners","title":"The Gleaners","artist":"Jean-François Millet","date":"1857","year":1857,"period":"realism","kind":"painting","medium":"Oil on canvas","at":"Musée d'Orsay, Paris","now":"paris","made":"paris","genre":"genre","people":"clothed","topics":["ah2.realism","design.composition-structures","ah2.compare-contrast"],"pd":true,"img":true,"w":960,"h":718,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"horse-fair","title":"The Horse Fair","artist":"Rosa Bonheur","date":"1852 to 1855","year":1853,"period":"realism","kind":"painting","medium":"Oil on canvas","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"paris","genre":"animal","people":"clothed","topics":["ah2.realism","design.movement"],"pd":true,"img":true,"w":960,"h":455,"credit":"Wikimedia Commons (public domain)"},{"id":"stone-breakers","title":"The Stone Breakers","artist":"Gustave Courbet","date":"1849","year":1849,"period":"realism","kind":"painting","medium":"Oil on canvas","at":"Destroyed in 1945 (known from photographs)","now":"dresden","made":"paris","genre":"genre","people":"clothed","topics":["ah2.realism"],"pd":true,"img":true,"note":"Destroyed in Dresden near the end of World War II; only photographs remain.","w":960,"h":584,"credit":"Wikimedia Commons (public domain)"},{"id":"boulevard-temple","title":"Boulevard du Temple","artist":"Louis Daguerre","date":"1838","year":1838,"period":"realism","kind":"photograph","medium":"Daguerreotype","at":"Destroyed; known from a copy","now":"paris","made":"paris","genre":"landscape","people":"clothed","topics":["ah2.photography"],"pd":true,"img":true,"note":"Often called the first photograph to show people: a man having his boots shined stood still long enough to appear.","w":960,"h":690,"credit":"Wikimedia Commons (public domain)"},{"id":"cameron-duckworth","title":"Mrs. Herbert Duckworth","artist":"Julia Margaret Cameron","date":"1867","year":1867,"period":"realism","kind":"photograph","medium":"Albumen silver print","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"london","genre":"portrait","people":"clothed","topics":["ah2.photography"],"pd":true,"img":true,"w":731,"h":1000,"credit":"The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"breezing-up","title":"Breezing Up (A Fair Wind)","artist":"Winslow Homer","date":"1873 to 1876","year":1876,"period":"realism","kind":"painting","medium":"Oil on canvas","at":"National Gallery of Art, Washington","now":"washington","made":"newyork","genre":"genre","people":"clothed","topics":["ah2.american-19th","design.movement"],"pd":true,"img":true,"w":960,"h":603,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"banjo-lesson","title":"The Banjo Lesson","artist":"Henry Ossawa Tanner","date":"1893","year":1893,"period":"realism","kind":"painting","medium":"Oil on canvas","at":"Hampton University Museum, Hampton, Virginia","now":"hampton","made":"philadelphia","genre":"genre","people":"clothed","topics":["ah2.american-19th","design.temperature"],"pd":true,"img":true,"w":712,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"boit-daughters","title":"The Daughters of Edward Darley Boit","artist":"John Singer Sargent","date":"1882","year":1882,"period":"realism","kind":"painting","medium":"Oil on canvas","at":"Museum of Fine Arts, Boston","now":"boston","made":"paris","genre":"portrait","people":"clothed","topics":["ah2.american-19th","design.space"],"pd":true,"img":true,"w":960,"h":963,"credit":"Wikimedia Commons (public domain)"},{"id":"whistler-mother","title":"Arrangement in Grey and Black No. 1","artist":"James McNeill Whistler","date":"1871","year":1871,"period":"realism","kind":"painting","medium":"Oil on canvas","at":"Musée d'Orsay, Paris","now":"paris","made":"london","genre":"portrait","people":"clothed","topics":["ah2.american-19th","design.balance-principle"],"pd":true,"img":true,"note":"Best known as \"Whistler's Mother\"; Whistler insisted it was mainly an arrangement of color and shape.","w":960,"h":854,"credit":"Wikimedia Commons (public domain)"},{"id":"impression-sunrise","title":"Impression, Sunrise","artist":"Claude Monet","date":"1872","year":1872,"period":"impressionism","kind":"painting","medium":"Oil on canvas","at":"Musée Marmottan Monet, Paris","now":"paris","made":"paris","genre":"landscape","people":"clothed","topics":["ah2.impressionism","design.complementary","design.value-pattern","ah2.style-recognition","ah2.dating-by-style"],"pd":true,"img":true,"w":960,"h":745,"credit":"Wikimedia Commons (public domain)"},{"id":"grainstacks","title":"Stacks of Wheat (End of Summer)","artist":"Claude Monet","date":"1890 to 1891","year":1890,"period":"impressionism","kind":"painting","medium":"Oil on canvas","at":"The Art Institute of Chicago","now":"chicago","made":"giverny","genre":"landscape","people":"none","topics":["ah2.monet-series"],"pd":true,"img":true,"w":960,"h":569,"credit":"The Art Institute of Chicago, via Wikimedia Commons (public domain)"},{"id":"water-lilies","title":"Water Lilies","artist":"Claude Monet","date":"1906","year":1906,"period":"impressionism","kind":"painting","medium":"Oil on canvas","at":"The Art Institute of Chicago","now":"chicago","made":"giverny","genre":"landscape","people":"none","topics":["ah2.monet-series","design.analogous"],"pd":true,"img":true,"w":850,"h":818,"credit":"The Art Institute of Chicago, via Wikimedia Commons (public domain)"},{"id":"parasol","title":"Woman with a Parasol: Madame Monet and Her Son","artist":"Claude Monet","date":"1875","year":1875,"period":"impressionism","kind":"painting","medium":"Oil on canvas","at":"National Gallery of Art, Washington","now":"washington","made":"paris","genre":"portrait","people":"clothed","topics":["ah2.impressionism","design.temperature"],"pd":true,"img":true,"w":805,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"boating-party","title":"Luncheon of the Boating Party","artist":"Pierre-Auguste Renoir","date":"1880 to 1881","year":1881,"period":"impressionism","kind":"painting","medium":"Oil on canvas","at":"The Phillips Collection, Washington","now":"washington","made":"paris","genre":"genre","people":"clothed","topics":["ah2.modern-life"],"pd":true,"img":true,"w":960,"h":711,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"dance-class","title":"The Dance Class","artist":"Edgar Degas","date":"1874","year":1874,"period":"impressionism","kind":"painting","medium":"Oil on canvas","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"paris","genre":"genre","people":"clothed","topics":["ah2.modern-life","design.space"],"pd":true,"img":true,"w":925,"h":1000,"credit":"The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"cradle","title":"The Cradle","artist":"Berthe Morisot","date":"1872","year":1872,"period":"impressionism","kind":"painting","medium":"Oil on canvas","at":"Musée d'Orsay, Paris","now":"paris","made":"paris","genre":"genre","people":"clothed","topics":["ah2.modern-life"],"pd":true,"img":true,"w":821,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"blue-armchair","title":"Little Girl in a Blue Armchair","artist":"Mary Cassatt","date":"1878","year":1878,"period":"impressionism","kind":"painting","medium":"Oil on canvas","at":"National Gallery of Art, Washington","now":"washington","made":"paris","genre":"portrait","people":"clothed","topics":["ah2.modern-life","ah2.japonisme"],"pd":true,"img":true,"w":960,"h":643,"credit":"National Gallery of Art, Washington, via Wikimedia Commons (public domain)"},{"id":"rainy-day","title":"Paris Street; Rainy Day","artist":"Gustave Caillebotte","date":"1877","year":1877,"period":"impressionism","kind":"painting","medium":"Oil on canvas","at":"The Art Institute of Chicago","now":"chicago","made":"paris","genre":"genre","people":"clothed","topics":["ah2.modern-life","draw.two-point","draw.rule-of-thirds"],"pd":true,"img":true,"w":960,"h":727,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"grande-jatte","title":"A Sunday on La Grande Jatte","artist":"Georges Seurat","date":"1884 to 1886","year":1885,"period":"postimp","kind":"painting","medium":"Oil on canvas","at":"The Art Institute of Chicago","now":"chicago","made":"paris","genre":"genre","people":"clothed","topics":["ah2.seurat","design.rhythm"],"pd":true,"img":true,"w":816,"h":543,"credit":"Wikimedia Commons (public domain)"},{"id":"starry-night","title":"The Starry Night","artist":"Vincent van Gogh","date":"1889","year":1889,"period":"postimp","kind":"painting","medium":"Oil on canvas","at":"Museum of Modern Art, New York","now":"newyork","made":"saint-remy","genre":"landscape","people":"none","topics":["ah2.van-gogh","ydraw.zigzag-wavy","ydraw.kinds-of-pictures","design.movement"],"pd":true,"img":true,"w":816,"h":646,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"sunflowers","title":"Sunflowers","artist":"Vincent van Gogh","date":"1888","year":1888,"period":"postimp","kind":"painting","medium":"Oil on canvas","at":"National Gallery, London","now":"london","made":"arles","genre":"still life","people":"none","topics":["ah2.van-gogh","design.analogous","ydraw.kinds-of-pictures"],"pd":true,"img":true,"w":793,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"bedroom","title":"The Bedroom","artist":"Vincent van Gogh","date":"1889","year":1889,"period":"postimp","kind":"painting","medium":"Oil on canvas","at":"The Art Institute of Chicago (other versions in Amsterdam and Paris)","now":"chicago","made":"saint-remy","genre":"interior","people":"none","topics":["ah2.van-gogh","design.complementary"],"pd":true,"img":true,"w":960,"h":749,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"sainte-victoire","title":"Mont Sainte-Victoire","artist":"Paul Cézanne","date":"about 1902 to 1906","year":1904,"period":"postimp","kind":"painting","medium":"Oil on canvas","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"aix","genre":"landscape","people":"none","topics":["ah2.cezanne-gauguin"],"pd":true,"img":true,"w":1000,"h":593,"credit":"Wikimedia Commons (public domain)"},{"id":"basket-apples","title":"The Basket of Apples","artist":"Paul Cézanne","date":"about 1893","year":1893,"period":"postimp","kind":"painting","medium":"Oil on canvas","at":"The Art Institute of Chicago","now":"chicago","made":"aix","genre":"still life","people":"none","topics":["ah2.cezanne-gauguin","draw.still-life"],"pd":true,"img":true,"w":960,"h":768,"credit":"The Art Institute of Chicago, via Wikimedia Commons (public domain)"},{"id":"vision-sermon","title":"Vision after the Sermon","artist":"Paul Gauguin","date":"1888","year":1888,"period":"postimp","kind":"painting","medium":"Oil on canvas","at":"National Galleries of Scotland, Edinburgh","now":"edinburgh","made":"pontaven","genre":"religious","people":"clothed","topics":["ah2.cezanne-gauguin","ah2.japonisme"],"pd":true,"img":true,"w":960,"h":752,"credit":"Wikimedia Commons (public domain)"},{"id":"divan-japonais","title":"Divan Japonais","artist":"Henri de Toulouse-Lautrec","date":"1893","year":1893,"period":"postimp","kind":"print","medium":"Color lithograph poster","at":"Many impressions, e.g. The Metropolitan Museum of Art, New York","now":"newyork","made":"paris","genre":"genre","people":"clothed","topics":["ah2.japonisme"],"pd":true,"img":true,"w":766,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"munch-scream","title":"The Scream","artist":"Edvard Munch","date":"1893","year":1893,"period":"postimp","kind":"painting","medium":"Tempera and crayon on cardboard","at":"National Museum, Oslo","now":"oslo","made":"oslo","genre":"landscape","people":"clothed","topics":["ah2.fauvism-expressionism","design.movement"],"pd":true,"img":true,"note":"Munch made several versions in paint, pastel and print.","w":806,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"great-wave","title":"Under the Wave off Kanagawa (The Great Wave)","artist":"Katsushika Hokusai","date":"about 1830 to 1832","year":1831,"period":"edo","kind":"print","medium":"Woodblock print, ink and color on paper","at":"Many impressions, e.g. The Metropolitan Museum of Art, New York","now":"newyork","made":"tokyo","genre":"landscape","people":"clothed","topics":["ah2.ukiyo-e","design.movement","ydraw.zigzag-wavy"],"pd":true,"img":true,"w":960,"h":645,"credit":"Wikimedia Commons (public domain)"},{"id":"red-fuji","title":"Fine Wind, Clear Morning (Red Fuji)","artist":"Katsushika Hokusai","date":"about 1830 to 1832","year":1831,"period":"edo","kind":"print","medium":"Woodblock print, ink and color on paper","at":"Many impressions, e.g. The Metropolitan Museum of Art, New York","now":"newyork","made":"tokyo","genre":"landscape","people":"none","topics":["ah2.ukiyo-e","design.complementary","ydraw.basic-shapes"],"pd":true,"img":true,"w":960,"h":641,"credit":"Wikimedia Commons (public domain)"},{"id":"atake-shower","title":"Sudden Shower over Shin-Ōhashi Bridge and Atake","artist":"Utagawa Hiroshige","date":"1857","year":1857,"period":"edo","kind":"print","medium":"Woodblock print, ink and color on paper","at":"Many impressions, e.g. The Metropolitan Museum of Art, New York (the one pictured)","now":"newyork","made":"tokyo","genre":"landscape","people":"clothed","topics":["ah2.ukiyo-e","ah2.japonisme"],"pd":true,"img":true,"w":687,"h":1000,"credit":"The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"bridge-rain","title":"Bridge in the Rain (after Hiroshige)","artist":"Vincent van Gogh","date":"1887","year":1887,"period":"postimp","kind":"painting","medium":"Oil on canvas","at":"Van Gogh Museum, Amsterdam","now":"amsterdam","made":"paris","genre":"landscape","people":"clothed","topics":["ah2.japonisme"],"pd":true,"img":true,"w":741,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"irises-screens","title":"Irises","artist":"Ogata Kōrin","date":"about 1701 to 1705","year":1703,"period":"edo","kind":"painting","medium":"Ink and color on gold leaf, pair of six-panel folding screens","at":"Nezu Museum, Tokyo","now":"tokyo","made":"kyoto","genre":"still life","people":"none","topics":["ah2.japanese-screens","design.rhythm"],"pd":true,"img":true,"w":960,"h":401,"credit":"Wikimedia Commons (public domain)"},{"id":"pine-trees","title":"Pine Trees","artist":"Hasegawa Tōhaku","date":"late 1500s","year":1595,"period":"momoyama","kind":"painting","medium":"Ink on paper, pair of six-panel folding screens","at":"Tokyo National Museum","now":"tokyo","made":"kyoto","genre":"landscape","people":"none","topics":["ah2.japanese-screens","design.space","draw.atmospheric"],"pd":true,"img":true,"note":"Painted in the Momoyama period, just before Edo began; whether it was a finished work or a study is debated.","w":960,"h":449,"credit":"Wikimedia Commons (public domain)"},{"id":"himeji","title":"Himeji Castle","artist":"Ikeda Terumasa","date":"completed 1609","year":1609,"period":"edo","kind":"architecture","medium":"Wood, plaster and stone","at":"Himeji, Japan","now":"himeji","made":"himeji","genre":"architecture","people":"none","topics":["ah2.japanese-screens"],"pd":true,"img":true,"w":500,"h":375,"credit":"Wikimedia Commons (CC0)"},{"id":"forbidden-city","title":"Hall of Supreme Harmony, Forbidden City","artist":"Ming dynasty (rebuilt under the Qing)","date":"1406 to 1420; hall rebuilt 1695","year":1420,"period":"ming","kind":"architecture","medium":"Wood, tile and marble terraces","at":"Palace Museum, Beijing","now":"beijing","made":"beijing","genre":"architecture","people":"none","topics":["ah2.ming-qing","design.balance-principle"],"pd":true,"img":true,"w":500,"h":375,"credit":"Wikimedia Commons (CC0)"},{"id":"shen-zhou","title":"Poet on a Mountaintop","artist":"Shen Zhou","date":"about 1500","year":1500,"period":"ming","kind":"painting","medium":"Ink and light color on paper, album leaf mounted as a handscroll","at":"Nelson-Atkins Museum of Art, Kansas City","now":"kansascity","made":"suzhou","genre":"landscape","people":"clothed","topics":["ah2.ming-qing"],"pd":true,"img":true,"w":500,"h":324,"credit":"Wikimedia Commons (public domain)"},{"id":"inwang","title":"Clearing after Rain on Mount Inwang","artist":"Jeong Seon","date":"1751","year":1751,"period":"joseon","kind":"painting","medium":"Ink on paper, hanging scroll","at":"Leeum Museum of Art, Seoul","now":"seoul","made":"seoul","genre":"landscape","people":"none","topics":["ah2.joseon-korea"],"pd":true,"img":true,"w":960,"h":557,"credit":"Wikimedia Commons (public domain)"},{"id":"moon-jar","title":"Moon Jar","artist":"Joseon dynasty","date":"second half of the 1700s","year":1750,"period":"joseon","kind":"ceramic","medium":"Porcelain","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"seoul","genre":"object","people":"none","topics":["ah2.joseon-korea"],"pd":true,"img":true,"w":750,"h":1000,"credit":"The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"kente","title":"Kente Cloth","artist":"Asante weavers","date":"20th century","year":1930,"period":"africa-later","kind":"textile","medium":"Silk and cotton strip-woven cloth","at":"Museum collections (e.g. The Metropolitan Museum of Art)","now":"newyork","made":"kumasi","genre":"object","people":"none","topics":["ah2.african-arts","design.pattern","ydraw.repeating-patterns"],"pd":true,"img":false},{"id":"chiwara","title":"Male Antelope Headdress (Ci Wara)","artist":"Bamana artists","date":"19th century","year":1850,"period":"africa-later","kind":"sculpture","medium":"Wood","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"bamako","genre":"animal","people":"none","topics":["ah2.african-arts"],"pd":true,"img":true,"note":"Worn on top of the head in farming dances; male and female headdresses were danced as a pair.","w":500,"h":800,"credit":"The Metropolitan Museum of Art, via Wikimedia Commons (CC0)"},{"id":"dan-mask","title":"Face Mask (Gle)","artist":"Dan artists","date":"19th to 20th century","year":1900,"period":"africa-later","kind":"sculpture","medium":"Wood","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"liberia","genre":"portrait","people":"none","topics":["ah2.african-arts"],"pd":true,"img":false},{"id":"benin-plaque","title":"Plaque: Warrior Chief with Attendants","artist":"Edo peoples, Kingdom of Benin","date":"16th to 17th century","year":1600,"period":"benin","kind":"sculpture","medium":"Brass","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"benincity","genre":"history","people":"clothed","topics":["ah2.benin-bronzes"],"pd":true,"img":false,"note":"One of the plaques taken from the royal palace in 1897. Hundreds of such plaques once covered the palace pillars."},{"id":"chief-blanket","title":"Chief's Blanket, Third Phase","artist":"Navajo (Diné) weaver","date":"about 1855 to 1865","year":1860,"period":"native","kind":"textile","medium":"Wool","at":"The Art Institute of Chicago","now":"chicago","made":"southwest","genre":"object","people":"none","topics":["ah2.native-north-america","design.balance-principle"],"pd":true,"img":true,"w":960,"h":815,"credit":"The Art Institute of Chicago, via Wikimedia Commons (CC0)"},{"id":"sitka-poles","title":"Totem Poles at Sitka National Historical Park","artist":"Tlingit and Haida carvers","date":"carved about 1900; many recarved since","year":1900,"period":"native","kind":"sculpture","medium":"Carved and painted red cedar","at":"Sitka National Historical Park, Alaska","now":"sitka","made":"sitka","genre":"object","people":"none","topics":["ah2.native-north-america"],"pd":true,"img":false,"note":"Many poles were brought to Sitka for the 1904 and 1905 world's fairs; the park replaces decaying poles with new carvings."},{"id":"woman-hat","title":"Woman with a Hat","artist":"Henri Matisse","date":"1905","year":1905,"period":"earlymodern","kind":"painting","medium":"Oil on canvas","at":"San Francisco Museum of Modern Art","now":"sanfrancisco","made":"paris","genre":"portrait","people":"clothed","topics":["ah2.fauvism-expressionism"],"pd":true,"img":true,"note":"Matisse painted his wife, Amélie; critics mocked its colors at the 1905 Salon d'Automne, the show that gave the Fauves their name.","style":"Fauvism","w":735,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"charing-cross","title":"Charing Cross Bridge","artist":"André Derain","date":"1906","year":1906,"period":"earlymodern","kind":"painting","medium":"Oil on canvas","at":"Musée d'Orsay, Paris","now":"paris","made":"london","genre":"landscape","people":"clothed","topics":["ah2.fauvism-expressionism","design.complementary"],"pd":true,"img":true,"note":"Also called Westminster Bridge. Derain painted about thirty views of London for the dealer Ambroise Vollard; another Charing Cross Bridge is in the National Gallery of Art, Washington.","style":"Fauvism","w":581,"h":453,"credit":"Wikimedia Commons (public domain)"},{"id":"blue-horses","title":"The Large Blue Horses","artist":"Franz Marc","date":"1911","year":1911,"period":"earlymodern","kind":"painting","medium":"Oil on canvas","at":"Walker Art Center, Minneapolis","now":"minneapolis","made":"munich","genre":"animal","people":"none","topics":["ah2.fauvism-expressionism","design.rhythm"],"pd":true,"img":true,"style":"Expressionism","w":960,"h":549,"credit":"Wikimedia Commons (public domain)"},{"id":"kirchner-street","title":"Street, Dresden","artist":"Ernst Ludwig Kirchner","date":"1908","year":1908,"period":"earlymodern","kind":"painting","medium":"Oil on canvas","at":"Museum of Modern Art, New York","now":"newyork","made":"dresden","genre":"genre","people":"clothed","topics":["ah2.fauvism-expressionism"],"pd":true,"img":true,"style":"Expressionism","w":960,"h":724,"credit":"Wikimedia Commons (public domain)"},{"id":"gris-picasso","title":"Portrait of Pablo Picasso","artist":"Juan Gris","date":"1912","year":1912,"period":"earlymodern","kind":"painting","medium":"Oil on canvas","at":"The Art Institute of Chicago","now":"chicago","made":"paris","genre":"portrait","people":"clothed","topics":["ah2.cubism"],"pd":true,"img":true,"style":"Cubism","w":786,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"kandinsky-vii","title":"Composition VII","artist":"Wassily Kandinsky","date":"1913","year":1913,"period":"earlymodern","kind":"painting","medium":"Oil on canvas","at":"State Tretyakov Gallery, Moscow","now":"moscow","made":"munich","genre":"abstract","people":"none","topics":["ah2.abstraction","design.movement"],"pd":true,"img":true,"style":"Abstraction","w":960,"h":631,"credit":"Wikimedia Commons (public domain)"},{"id":"black-square","title":"Black Square","artist":"Kazimir Malevich","date":"1915","year":1915,"period":"earlymodern","kind":"painting","medium":"Oil on linen","at":"State Tretyakov Gallery, Moscow","now":"moscow","made":"moscow","genre":"abstract","people":"none","topics":["ah2.abstraction"],"pd":true,"img":true,"note":"The 1915 original is cracked; Malevich painted later versions.","style":"Suprematism","w":960,"h":960,"credit":"Wikimedia Commons (public domain)"},{"id":"city-rises","title":"The City Rises","artist":"Umberto Boccioni","date":"1910","year":1910,"period":"earlymodern","kind":"painting","medium":"Oil on canvas","at":"Museum of Modern Art, New York","now":"newyork","made":"milan","genre":"genre","people":"clothed","topics":["ah2.futurism-dada","design.movement"],"pd":true,"img":true,"style":"Futurism","w":960,"h":637,"credit":"Wikimedia Commons (public domain)"},{"id":"mondrian-rby","title":"Composition with Red, Blue and Yellow","artist":"Piet Mondrian","date":"1930","year":1930,"period":"interwar","kind":"painting","medium":"Oil on canvas","at":"Kunsthaus Zürich","now":"zurich","made":"paris","genre":"abstract","people":"none","topics":["ah2.de-stijl-bauhaus","design.balance-principle","design.three-primaries"],"pd":true,"img":true,"note":"Mondrian used black lines, white and the three primary colors, and balanced one large red square against small blocks of blue and yellow.","style":"De Stijl","w":960,"h":973,"credit":"Wikimedia Commons (public domain)"},{"id":"wainwright","title":"Wainwright Building","artist":"Louis Sullivan and Dankmar Adler","date":"1890 to 1891","year":1891,"period":"chicago","kind":"architecture","medium":"Steel frame with brick and terracotta","at":"St. Louis, Missouri","now":"stlouis","made":"stlouis","genre":"architecture","people":"none","topics":["ah2.modern-architecture"],"pd":true,"img":true,"w":893,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"robie-house","title":"Robie House","artist":"Frank Lloyd Wright","date":"1909 to 1910","year":1910,"period":"earlymodern","kind":"architecture","medium":"Brick, concrete and steel","at":"Chicago","now":"chicago","made":"chicago","genre":"architecture","people":"none","topics":["ah2.modern-architecture"],"pd":true,"img":false,"style":"Prairie School"},{"id":"fallingwater","title":"Fallingwater","artist":"Frank Lloyd Wright","date":"1935 to 1939","year":1937,"period":"interwar","kind":"architecture","medium":"Reinforced concrete, stone and glass","at":"Mill Run, Pennsylvania","now":"millrun","made":"millrun","genre":"architecture","people":"none","topics":["ah2.modern-architecture","design.balance-principle"],"pd":true,"img":true,"w":500,"h":685,"credit":"Wikimedia Commons (public domain)"},{"id":"chrysler","title":"Chrysler Building","artist":"William Van Alen","date":"1928 to 1930","year":1930,"period":"interwar","kind":"architecture","medium":"Steel frame, brick and stainless steel","at":"New York","now":"newyork","made":"newyork","genre":"architecture","people":"none","topics":["ah2.modern-architecture","draw.three-point"],"pd":true,"img":true,"style":"Art Deco","w":816,"h":575,"credit":"Photograph of 19 January 1932 from the Empire State Building, with the Chrysler Building at right of center; via Wikimedia Commons (public domain)"},{"id":"steerage","title":"The Steerage","artist":"Alfred Stieglitz","date":"1907","year":1907,"period":"earlymodern","kind":"photograph","medium":"Photogravure","at":"Many prints, e.g. The Metropolitan Museum of Art, New York","now":"newyork","made":"newyork","genre":"genre","people":"clothed","topics":["ah2.modern-photography","design.composition-structures"],"pd":true,"img":true,"w":797,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"migrant-mother","title":"Migrant Mother","artist":"Dorothea Lange","date":"1936","year":1936,"period":"interwar","kind":"photograph","medium":"Gelatin silver print","at":"Library of Congress, Washington (Farm Security Administration collection)","now":"washington","made":"nipomo","genre":"portrait","people":"clothed","topics":["ah2.modern-photography"],"pd":true,"img":true,"note":"Made for a U.S. government agency, so the photograph is in the public domain. The mother, Florence Owens Thompson, later said she was never paid and wished the picture had not made her a symbol.","w":769,"h":1000,"credit":"Wikimedia Commons (public domain)"},{"id":"fountain","title":"Fountain","artist":"Marcel Duchamp","date":"1917","year":1917,"period":"interwar","kind":"sculpture","medium":"Porcelain urinal, signed \"R. Mutt\" (original lost)","at":"Original lost; replicas in several museums","now":"paris","made":"newyork","genre":"object","people":"none","topics":["ah2.futurism-dada"],"pd":false,"img":false,"style":"Dada"},{"id":"persistence","title":"The Persistence of Memory","artist":"Salvador Dalí","date":"1931","year":1931,"period":"interwar","kind":"painting","medium":"Oil on canvas","at":"Museum of Modern Art, New York","now":"newyork","made":"paris","genre":"landscape","people":"none","topics":["ah2.surrealism"],"pd":false,"img":false,"style":"Surrealism"},{"id":"nighthawks","title":"Nighthawks","artist":"Edward Hopper","date":"1942","year":1942,"period":"midcentury","kind":"painting","medium":"Oil on canvas","at":"The Art Institute of Chicago","now":"chicago","made":"newyork","genre":"genre","people":"clothed","topics":["ah2.american-modern"],"pd":false,"img":false},{"id":"american-gothic","title":"American Gothic","artist":"Grant Wood","date":"1930","year":1930,"period":"interwar","kind":"painting","medium":"Oil on beaverboard","at":"The Art Institute of Chicago","now":"chicago","made":"chicago","genre":"portrait","people":"clothed","topics":["ah2.american-modern"],"pd":true,"img":true,"note":"Shown and reproduced in 1930, so it entered the U.S. public domain on January 1, 2026; the Art Institute bought it that same year.","style":"Regionalism","w":829,"h":1000,"credit":"Google Arts & Culture, via Wikimedia Commons (public domain)"},{"id":"migration-series","title":"The Migration Series","artist":"Jacob Lawrence","date":"1940 to 1941","year":1941,"period":"midcentury","kind":"painting","medium":"Casein tempera on hardboard, 60 panels","at":"Shared by the Museum of Modern Art, New York, and The Phillips Collection, Washington","now":"newyork","made":"newyork","genre":"history","people":"clothed","topics":["ah2.american-modern"],"pd":false,"img":false},{"id":"detroit-industry","title":"Detroit Industry Murals","artist":"Diego Rivera","date":"1932 to 1933","year":1932,"period":"interwar","kind":"painting","medium":"Fresco","at":"Detroit Institute of Arts","now":"detroit","made":"detroit","genre":"genre","people":"clothed","topics":["ah2.mexican-muralism","ah1.painting-media"],"pd":false,"img":false,"style":"Mexican Muralism"},{"id":"two-fridas","title":"The Two Fridas","artist":"Frida Kahlo","date":"1939","year":1939,"period":"interwar","kind":"painting","medium":"Oil on canvas","at":"Museo de Arte Moderno, Mexico City","now":"mexicocity","made":"mexicocity","genre":"portrait","people":"clothed","topics":["ah2.mexican-muralism"],"pd":false,"img":false},{"id":"autumn-rhythm","title":"Autumn Rhythm (Number 30)","artist":"Jackson Pollock","date":"1950","year":1950,"period":"midcentury","kind":"painting","medium":"Enamel on canvas","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"newyork","genre":"abstract","people":"none","topics":["ah2.abstract-expressionism"],"pd":false,"img":false,"style":"Abstract Expressionism"},{"id":"rothko-no61","title":"No. 61 (Rust and Blue)","artist":"Mark Rothko","date":"1953","year":1953,"period":"midcentury","kind":"painting","medium":"Oil on canvas","at":"Museum of Contemporary Art, Los Angeles","now":"losangeles","made":"newyork","genre":"abstract","people":"none","topics":["ah2.abstract-expressionism"],"pd":false,"img":false,"style":"Color Field"},{"id":"black-iris","title":"Black Iris","artist":"Georgia O'Keeffe","date":"1926","year":1926,"period":"interwar","kind":"painting","medium":"Oil on canvas","at":"The Metropolitan Museum of Art, New York","now":"newyork","made":"newyork","genre":"still life","people":"none","topics":["ah2.american-modern"],"pd":false,"img":false},{"id":"aspects-negro-life","title":"Aspects of Negro Life","artist":"Aaron Douglas","date":"1934","year":1934,"period":"interwar","kind":"painting","medium":"Oil on canvas, four murals","at":"New York Public Library, Schomburg Center","now":"newyork","made":"newyork","genre":"history","people":"clothed","topics":["ah2.american-modern"],"pd":false,"img":false,"style":"Harlem Renaissance"},{"id":"bauhaus-dessau","title":"Bauhaus Building, Dessau","artist":"Walter Gropius","date":"1925 to 1926","year":1926,"period":"interwar","kind":"architecture","medium":"Reinforced concrete, steel and glass curtain wall","at":"Dessau, Germany","now":"dessau","made":"dessau","genre":"architecture","people":"none","topics":["ah2.de-stijl-bauhaus"],"pd":false,"img":false,"note":"Gropius designed the school's own building; its glass curtain wall shows the workshops inside."}];
  var PI = {}; A.PERIODS.forEach(function (p) { PI[p.key] = p; });
  var WK = {}; A.WORKS.forEach(function (w) { WK[w.id] = w; });
  A.period = function (k) { return PI[k] || null; };
  A.work = function (id) { return WK[id] || null; };
  A.city = function (k) { return A.CITIES[k] || null; };
  A.IMG_BASE = '/art/img/';
  A.imgUrl = function (w) { w = typeof w === 'string' ? WK[w] : w; return w && w.img ? A.IMG_BASE + w.id + '.webp' : ''; };
  A.hasImg = function (w) { w = typeof w === 'string' ? WK[w] : w; return !!(w && w.img); };
  A.worksFor = function (topic) { return A.WORKS.filter(function (w) { return w.topics.indexOf(topic) >= 0; }); };
  A.worksIn = function (period) { return A.WORKS.filter(function (w) { return w.period === period; }); };
  A.works = function (f) { return A.WORKS.filter(function (w) { for (var k in f) { var v = f[k]; if (Array.isArray(v) ? v.indexOf(w[k]) < 0 : typeof v === 'function' ? !v(w[k], w) : w[k] !== v) return false; } return true; }); };
  A.yearText = function (y) { return y < 0 ? (-y >= 10000 ? M.round(-y / 1000) * 1000 + ' BC' : -y + ' BC') : (y < 1000 ? 'AD ' + y : String(y)); };
  A.century = function (y) { if (y < 0) { var c = M.ceil(-y / 100); return c + ord(c) + ' century BC'; } c = M.ceil(y / 100); return c + ord(c) + ' century'; };
  function ord(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; }
  A.ord = ord;
  A.label = function (w) { w = typeof w === 'string' ? WK[w] : w; return w.title + ', ' + w.artist + ', ' + w.date; };
  // the land outlines for ar-map: rings of [lon, lat] from Natural Earth (public domain), simplified
  var LAND = '-596,-800 -6,-10 -43,1 -18,6 44,-1 13,8 10,-4|-1592,-795 -19,-1 -26,10 25,2 20,-11|-452,-780 13,-5 6,-15 -72,-10 -37,4 32,10 23,16 35,0|-1212,-735 25,0 -15,-6 -24,4 14,2|-990,-719 22,-1 6,-5 -46,0 -15,6 33,0|-685,-710 -3,-12 -23,-3 -13,0 5,4 -23,-3 -8,7 29,5 4,17 14,6 18,-21|-586,-642 -34,-6 -6,-7 5,-7 -16,-3 -20,-15 25,-12 14,-15 10,-30 -36,-16 -62,-13 -66,-1 35,-12 -42,-5 -1,-8 26,-11 157,-21 15,-8 84,15 70,-4 20,7 123,11 -12,10 -59,-2 -2,12 5,2 64,14 114,16 18,6 3,4 -11,2 11,8 31,7 20,11 29,-4 5,8 26,-6 36,3 5,-4 79,17 18,-1 13,-8 26,8 17,-4 42,5 33,-8 45,2 49,8 19,12 47,-13 159,40 19,-2 23,-13 27,-7 27,6 48,-5 8,-13 -19,-11 13,-4 -12,-12 20,-4 11,2 29,22 37,4 15,12 37,11 40,0 12,10 17,-10 61,-2 39,2 31,16 34,-13 74,10 20,-8 42,-6 34,8 56,-3 60,6 3,9 24,-17 80,1 11,-10 22,-5 37,-5 18,3 73,-20 57,-2 39,-9 -19,-20 -32,-7 -25,-18 -1,-9 12,-11 23,-6 -52,-4 -20,-17 96,-29 106,-9 0,-53 -3600,0 0,53 9,6 47,-4 44,6 119,-15 96,-2 54,6 2,4 -107,9 7,17 -39,9 62,-2 42,10 -31,9 -58,3 -28,11 -3,11 71,-5 52,9 -1,11 13,2 6,-3 91,12 155,-2 58,8 16,-10 117,-6 5,4 -24,8 -12,15 74,-10 62,3 9,7 77,-13 12,8 54,-8 75,14 1,9 -12,19 11,16 -3,8 47,27 52,13 6,-2 -14,-7|-678,-539 28,-8 -5,-5 -15,3 -11,-7 -11,1 -31,10 -24,17 36,-13 18,16 7,-1 8,-13|-585,-511 7,-4 -2,-4 -27,-4 -5,4 27,8|703,-497 -16,-1 2,12 16,-5 -2,-6|1454,-408 29,-1 -4,-23 -19,-3 -13,23 0,5 7,-1|1730,-409 12,-4 -15,-21 4,-5 -16,-3 -9,-17 -13,-7 -26,4 3,11 35,21 16,20 7,5 2,-4|1746,-362 7,-10 1,7 14,-14 17,2 -5,-15 -8,1 -12,-22 -8,-4 -5,4 5,8 -3,6 -11,4 8,7 1,14 -21,29 17,-8 3,-9|1671,-222 -16,5 -15,16 31,-21|1784,-173 2,-9 -12,0 3,8 7,1|501,-136 3,-21 -7,0 1,-12 -27,-80 -17,-7 -14,6 -7,29 11,20 -4,27 4,12 19,4 14,12 15,26 9,-16|1436,-138 3,-7 7,3 8,-8 10,-40 24,-14 9,-19 10,-1 2,-11 22,-26 5,-20 -7,-35 -26,-41 -3,-17 -37,-16 -14,6 1,5 -14,-9 -30,8 -10,19 -15,5 1,12 -14,-9 11,17 -1,7 -18,-20 -8,4 -9,19 -30,11 -52,-7 -19,-8 -5,-9 -38,-1 -19,-11 -14,1 -16,8 7,9 0,17 -24,55 5,-4 -4,9 8,-7 -8,19 7,26 1,-7 25,18 42,10 21,33 4,-9 5,2 -4,5 3,5 5,-2 14,21 14,4 13,-11 12,-1 -2,6 12,19 20,4 -8,8 6,2 29,-11 12,3 5,-5 -10,-9 -5,-17 47,-27 7,3 8,24 4,40 4,3 3,-5 8,-26|1207,-102 -17,6 9,2 8,-8|1244,-101 -9,-1 5,9 33,9 -29,-17|1179,-81 12,-6 -24,-3 12,9|1229,-81 -1,-5 -29,-2 8,6 22,1|1086,-68 19,-1 3,4 49,-19 -11,-4 -63,10 -29,9 7,10 25,-9|1559,-68 -7,3 -7,14 14,-17|1520,-55 -18,-8 -19,6 15,2 3,5 1,-5 6,0 8,7 -1,6 8,-1 -3,-12|1305,-31 3,-8 -29,5 2,6 24,-3|1531,-45 -3,-3 -4,10 -17,11 15,-5 9,-13|1341,-12 3,-16 11,-6 8,11 20,6 63,-22 14,-16 16,-6 3,-5 -9,-1 2,-7 35,-32 -28,5 -19,20 -13,5 -14,-6 1,-8 -8,-3 -35,12 -15,-3 11,11 -8,19 -42,19 -7,-6 -10,13 17,6 -15,0 -17,13 19,5 17,-8|1252,14 -15,-12 -35,0 -2,-7 9,-9 24,8 -18,-13 17,-34 -10,0 5,8 -12,-1 -5,20 -7,-3 1,-26 -10,1 1,19 -7,7 12,34 9,7 20,-4 23,5|1287,11 -6,-20 -5,27 3,4 8,-11|1058,-59 -11,0 -21,17 -40,60 -33,37 22,-3 31,-31 11,0 21,-20 -4,-8 27,-24 -3,-28|1179,18 11,-9 -12,-1 -3,-16 -9,-7 -5,-25 -1,3 -11,-4 -16,10 -12,-4 -4,5 -15,1 -1,13 -10,11 0,18 6,7 15,-1 2,8 16,4 37,38 25,-15 -19,-22 6,-14|1264,84 1,-12 -3,-9 -4,10 -4,-5 0,-12 -12,6 0,12 -6,4 -17,-6 16,15 3,-5 17,8 -1,8 8,-5 2,-9|812,62 -9,-2 -4,8 2,30 17,-23 -6,-13|1240,103 -10,-13 -6,7 5,12 6,0 -2,-6 8,9 -1,-9|1185,93 -13,-9 23,30 2,-8 -12,-13|1219,119 12,-3 -11,-12 -1,15|1255,122 3,-12 -8,3 3,-9 -5,-3 -5,14 6,3 -6,8 12,-4|1213,185 9,0 3,-14 -8,-12 0,-16 23,-5 1,-13 -12,11 -2,-4 -7,6 -14,1 4,6 -9,5 -2,14 4,-4 4,25 6,0|-769,179 -14,3 14,2 7,-5 -7,0|-726,199 26,-3 17,-10 -4,-4 -20,2 -7,-8 -10,6 -15,-2 -5,7 21,0 -11,9 8,3|1103,187 -8,-5 -8,3 -1,9 22,7 -5,-14|-1555,191 -4,0 0,12 11,-8 -7,-4|-797,228 55,-25 -36,-4 7,5 -10,3 -6,9 -31,6 -4,2 4,2 -32,-7 27,13 26,-4|1212,228 -5,-8 -6,16 14,17 5,-3 -8,-22|1346,341 -4,-9 -4,3 -8,-8 -6,3 5,11 17,0|346,357 -16,-11 -7,5 23,6|237,357 26,-4 -16,-4 -12,4 2,4|155,382 -4,-16 -27,10 2,5 29,1|92,412 6,-7 -1,-13 -9,-3 -6,21 10,2|1410,371 -7,-20 -31,-5 -14,-11 -7,3 0,8 -41,-7 10,-8 -7,-16 -6,-5 -5,4 2,9 -10,10 32,21 31,1 10,18 7,-5 20,14 9,30 11,2 5,-14 -9,-29|96,422 -4,-8 -7,9 9,7 2,-8|1439,442 14,2 2,-11 -14,-3 -9,-10 -16,7 -5,-11 -11,0 -2,10 5,7 11,1 6,22 19,-14|-637,466 17,-2 -9,-4 -12,4 1,6 3,-4|-1235,485 -22,3 -24,12 -3,8 26,-5 23,-18|-561,507 -7,-9 7,4 6,-3 -3,-3 23,-4 -3,-7 7,2 5,-12 -5,-8 -11,1 0,10 -12,-9 -6,0 7,5 -10,2 -30,0 5,7 -4,2 18,22 15,9 5,0 -7,-9|-1327,540 10,1 -3,-11 8,-8 -19,12 -1,8 5,-2|1436,507 11,-17 -15,3 -6,-14 9,-11 0,-7 -8,6 -6,-7 1,50 -6,9 1,14 9,5 -4,4 5,2 9,-37|-68,523 -32,-5 8,11 -5,10 30,13 10,-6 -11,-23|127,556 -6,-8 -12,10 15,3 3,-5|-1530,571 -10,-4 -7,8 21,4 5,-3 -9,-5|-30,586 -11,-10 21,1 -11,-17 10,-1 26,-30 12,-2 -6,-9 3,-5 -66,-13 -6,2 24,12 -19,6 11,3 -6,5 2,7 15,-1 2,6 -19,8 -2,10 -6,-5 -5,15 11,18 20,0|-819,627 -12,-5 -9,3 7,4 14,-2|-1717,638 30,-5 -8,-3 -21,3 -1,5|-852,657 51,-20 -9,-3 -21,7 -24,-10 -4,5 -13,-1 8,5 5,17 7,0|-145,665 -2,-7 11,-7 -51,-16 -41,5 10,4 -22,5 18,5 -21,2 6,7 16,1 15,-7 15,6 46,2|-759,671 -11,0 -2,5 13,7 8,-7 -8,-5|-1750,666 7,-3 -3,8 27,-2 20,-9 -26,-6 -5,-11 -32,11 -22,0 -5,3 2,4 -12,-2 5,-5 -6,-4 0,40 51,-18 -1,-6|-956,691 -7,-3 -35,6 16,7 26,-10|-1787,709 -13,-1 0,7 24,-2 -11,-4|-905,695 -1,-10 14,8 12,-7 -3,-7 9,-7 18,16 1,11 29,-2 13,-5 -7,-11 7,-5 -1,-5 -19,-7 -25,2 -15,-18 -26,-8 -8,-4 -1,-6 -24,-10 -10,-11 -5,-20 15,-1 9,-17 14,2 59,-20 27,-2 2,-18 22,-21 13,14 -12,21 16,4 17,14 -8,16 -12,7 12,11 -8,24 43,1 24,-13 18,0 3,-21 17,-8 14,6 16,15 32,-33 -4,-7 45,-17 4,-8 11,-5 1,-12 -43,-19 -64,0 -47,-34 24,15 36,9 9,-5 -9,-6 6,-19 30,-3 10,11 7,-11 -56,-24 -7,1 -1,9 18,8 -27,-2 1,-3 -37,-18 -1,-7 8,-7 -37,-7 18,0 -21,-1 -9,-19 -6,6 4,-11 -8,-12 2,7 -6,13 0,-11 -7,1 7,-3 6,-23 -56,-42 0,-14 12,-31 -3,-17 -8,0 -5,7 -12,20 0,12 -12,10 -10,-5 -13,8 -28,-1 -4,-1 4,-9 -10,-2 -36,6 -28,-14 -8,-9 3,-15 -8,-35 16,-31 19,-12 24,6 12,6 5,17 32,5 3,-7 -10,-25 -5,2 -1,-20 -5,-6 39,1 16,-7 -4,-42 16,-21 8,-2 18,8 28,-10 11,8 8,17 15,1 16,12 7,-3 -8,-7 2,-23 7,8 -4,11 12,4 3,8 17,-16 20,0 13,-5 6,5 24,1 -8,-3 3,-5 16,-5 1,-8 16,-6 20,-20 31,-2 27,-16 8,-23 5,-2 -7,-15 3,-3 18,-1 0,-10 8,6 29,-10 3,-11 12,3 34,-5 28,-19 16,-3 9,-22 -4,-17 -36,-41 -6,-48 -16,-40 -11,-11 -26,-4 -30,-15 -9,-10 -4,-28 -49,-57 -24,-5 -22,10 -1,-5 13,-9 4,-16 -9,-13 -15,-5 -31,-1 2,-19 -6,-3 -24,-1 1,-10 12,1 3,-6 -17,-9 -4,-15 -17,-6 -3,-7 20,-9 -4,-9 -31,-26 9,-16 -26,-6 -2,-9 -39,15 -7,36 15,18 -15,3 9,8 3,17 12,-4 5,21 -7,3 -3,-13 -6,2 11,39 -4,21 4,1 18,47 -1,35 6,13 7,78 -2,15 -11,9 -45,28 -38,74 -14,11 3,4 -5,10 16,20 -12,5 1,11 8,19 12,6 5,12 13,12 -11,45 -14,6 -9,-8 5,-6 -9,-3 -2,6 -24,6 -15,17 -1,-5 -6,3 0,12 -20,18 2,4 -37,6 -35,23 -19,-5 -69,26 -20,16 2,15 -7,14 -33,28 0,8 -29,26 -9,22 -8,4 -9,2 1,-16 31,-35 9,-24 13,-9 -6,-6 -22,19 -1,13 -28,17 9,9 -13,10 -18,34 -12,10 -21,6 -38,57 -1,25 6,27 -8,27 16,-2 5,-9 -2,19 -46,18 -5,15 -12,5 -2,8 -27,19 -21,26 -25,1 -33,13 -72,14 -11,-2 2,-7 -37,-8 3,15 11,3 -3,3 -34,-19 7,-5 -9,-8 -42,-21 -64,-16 71,32 7,13 -21,-5 -13,7 -16,-4 1,9 -19,2 -23,17 15,16 38,7 -7,6 7,4 -42,-4 -31,13 36,9 8,0 -1,-5 21,0 -51,23 6,5 30,5 13,9 53,11 23,-7 107,-5 71,-13 67,13 7,-4 10,7 23,-10 14,7 1,-8 28,4 63,-9 13,-5 -14,-5 54,1 10,-6 11,5 -10,4 6,4 20,1 47,-12 31,2 -2,6 9,2 16,-4 0,-9 6,8 8,0 5,10 -23,10 1,11 12,7 23,-6 14,-11 -9,-5 19,-2|-1142,731 -5,-4 23,3 13,-5 12,5 17,-13 5,4 -7,10 19,0 11,-4 9,-17 35,-10 -1,-4 -16,-1 6,-4 -3,-3 -36,4 -73,-7 -28,7 -12,8 49,4 -55,1 -5,4 23,4 -33,3 15,11 37,4|-1045,734 -9,-6 -15,7 24,-1|-763,731 -32,-4 -14,6 5,5 23,-1 18,-6|-866,732 8,-7 9,8 26,5 17,-11 -1,-6 29,6 36,-9 1,-5 19,3 43,-15 9,-9 -18,-5 69,-18 -20,-19 -28,14 -13,-1 -1,-6 28,-13 6,-10 -3,-7 -38,10 26,-18 -48,10 -38,18 -29,-5 -9,4 7,7 39,2 -3,3 16,15 -2,4 -40,12 7,2 -28,11 -23,-5 -74,7 -8,4 10,4 -14,0 -3,10 18,13 26,3 -8,-6|-1004,738 30,0 3,-3 -10,-5 16,-4 -2,-9 -26,-3 -32,11 21,2 -11,7 11,4|1436,732 -37,2 22,5 15,-7|-932,728 -11,-8 -11,1 -6,13 15,7 40,-2 -27,-11|-1205,714 -26,-5 -28,10 20,18 -10,6 73,-1 21,-7 -37,-10 -13,-11|1507,751 -11,-4 -35,5 46,-1|-936,750 -6,-4 -26,3 19,7 13,-6|1451,756 -8,-8 -53,-2 -20,7 5,6 13,2 63,-5|-985,767 8,-4 -5,-13 -43,6 -1,7 41,4|-1082,762 23,-2 2,-5 -6,-5 -74,-6 -2,3 21,5 -59,0 23,13 63,-10 -14,9 9,4 14,-6|575,707 -38,1 -21,7 -1,5 10,2 -1,6 20,8 -9,1 24,9 -3,5 56,12 70,6 7,-4 -104,-22 -31,-19 2,-9 19,-8|-947,771 31,-3 9,-4 -3,-3 18,-5 81,1 13,-8 -84,-5 -42,4 -5,11 -10,4 -32,5 4,4 20,-1|-1162,776 -1,-7 -8,-4 -58,-4 38,14 29,1|1070,770 2,-5 39,2 30,-9 -2,-5 -45,-11 36,-2 5,-7 21,5 76,-8 1,7 37,-1 16,-6 5,-6 -6,-4 28,-12 10,10 16,-4 60,1 -8,9 14,4 90,-6 35,-14 60,1 8,-4 -1,-8 12,-3 69,2 18,-9 12,3 -8,7 5,4 81,-7 14,-4 0,-40 -26,-4 21,-20 -58,-9 -34,-18 -14,7 -26,-8 -5,4 -23,-3 -15,-17 12,-6 -1,-14 -10,-1 -4,-8 4,-4 -17,-6 -4,-11 -15,-2 -3,-11 -14,-9 -14,44 5,14 9,10 16,3 53,30 8,15 -12,-1 -6,-9 -26,-11 -8,13 -26,-4 -25,-16 8,-7 -37,-3 0,7 -15,2 -13,-5 -63,-2 -71,-43 16,-1 15,-8 17,4 14,-11 1,-9 -8,-10 -5,-28 -19,-21 -33,-29 -14,-6 -12,5 -23,-14 -3,-10 -22,-11 -1,-6 21,-24 -4,-17 -26,-7 -4,23 8,2 -7,8 -15,4 6,15 -10,3 -32,-10 11,15 -6,5 -26,-16 -10,-1 -5,-5 14,-13 8,-2 11,7 16,-4 1,-6 -14,-2 -19,-18 10,-5 17,-27 0,-8 -6,-2 8,-9 -4,-16 -6,-1 -24,-36 -28,-17 -51,-14 -4,-11 -5,0 0,11 -14,3 -26,-19 -2,-7 32,-38 4,-19 -1,-17 -40,-31 -1,13 -16,7 -9,16 -18,4 2,8 -9,0 -9,-42 7,0 6,-18 25,-19 12,-42 -7,-1 -21,16 -13,37 -16,19 -2,-6 5,36 -16,55 -18,-12 -12,3 1,22 -29,46 -9,0 -2,-10 -33,-3 -5,-13 -14,-7 -29,-29 -19,-7 -4,-55 -24,-24 -9,9 -31,71 -9,54 -21,-5 -13,12 4,4 -3,3 -19,11 -10,15 -49,-3 -41,6 -9,14 -18,-6 -32,14 -14,22 -21,-1 8,-23 14,-10 6,-19 2,12 6,-2 2,-18 22,1 24,23 4,-22 19,-6 11,-13 -20,-21 -1,-13 -24,-17 -29,-8 -2,-8 -35,-16 -52,-14 -9,26 0,16 -35,45 -6,24 -10,6 -24,38 -5,0 3,14 -10,-19 -15,23 33,-60 -2,-8 14,-11 6,-34 9,-6 9,-21 40,-35 -6,-7 19,-13 65,16 -1,-14 -33,-64 -74,-68 -11,-21 -4,-18 6,-3 -2,-17 13,-23 3,-39 -13,-20 -21,-9 -26,-22 8,-39 -30,-20 3,-5 -7,-26 -40,-40 -24,-11 -32,0 -30,-9 -12,7 -5,15 3,9 -30,46 -9,50 -25,40 0,23 18,38 1,13 -18,57 -31,39 10,42 -4,6 -9,11 -26,-5 -16,20 -24,-2 -39,-14 -26,5 -29,-9 -15,5 -34,25 -24,36 -18,13 -1,14 -9,11 11,14 4,20 -9,38 26,44 48,36 -2,13 5,14 24,15 10,17 37,-6 37,14 80,8 7,-2 0,-5 9,2 -5,-5 3,-7 -6,-19 49,-15 5,-9 34,-11 10,7 0,12 14,6 74,-19 21,7 10,-7 18,1 8,5 14,31 2,21 -15,1 -22,-7 -8,5 -20,-5 -21,6 -13,15 5,8 -6,5 11,9 15,1 4,7 19,-1 24,9 17,0 31,-11 21,1 13,10 -2,6 -48,26 15,10 -5,4 14,7 -41,-10 0,-6 15,-2 -2,-4 -24,-7 -6,2 2,4 -10,3 11,6 -3,2 -26,5 -11,-16 -8,-1 -11,-23 11,-15 -12,-1 -12,-8 -3,6 -12,1 -12,-2 7,-6 -5,-1 -13,3 14,-26 -9,2 3,-5 -6,-1 4,-9 -7,0 -8,4 -6,15 -17,20 1,14 -35,18 -11,16 -9,-3 -1,8 -8,1 -8,-3 3,-13 25,-21 8,0 0,-5 26,-13 -2,-4 -14,6 -5,-6 8,-4 -1,-5 -10,-9 -4,-1 4,11 -7,10 -33,17 -16,12 -3,10 -13,5 -24,-13 -34,0 -1,-12 -22,-9 -11,-17 4,-6 -22,-20 -23,0 -10,-8 -11,10 -24,0 1,14 -7,4 7,21 -6,22 14,7 61,-3 5,6 2,20 -18,16 -15,4 -1,7 30,-1 -3,12 9,-5 23,8 3,8 22,7 9,15 34,4 7,5 -7,15 4,16 21,6 -3,-8 6,-4 -12,-10 2,-9 10,-6 16,5 16,-7 35,11 21,-5 16,8 -2,16 5,6 9,4 8,-8 8,0 3,14 -10,2 -1,6 47,3 11,5 -10,5 -52,-7 -16,9 2,10 -4,9 4,6 39,19 -15,9 -17,-3 -10,-7 2,-6 -36,-17 -7,-14 17,-12 -9,-11 -11,-3 -9,-26 -12,1 -6,-8 -12,0 -25,41 -20,-12 -14,-2 -13,5 -7,34 55,25 43,33 44,20 38,4 15,8 37,2 31,-7 -13,-3 11,-6 10,3 82,-20 8,-11 -11,-5 -16,-3 -52,6 16,-7 1,-15 21,-6 -5,10 7,3 24,-6 8,3 -6,7 23,10 18,-4 6,7 -8,6 5,6 -7,6 28,-3 5,-6 -12,-1 0,-6 7,-3 74,22 8,-1 -10,-6 53,7 11,-6 12,6 -11,6 6,4 79,-18 7,5 -23,9 4,4 -6,11 18,9 7,9 34,0 2,-6 -10,-8 10,-10 -2,-14 11,-6 -24,-21 11,-1 27,16 -6,5 4,7 -11,1 -2,5 8,10 -13,8 18,7 -2,7 10,-5 -4,-10 11,-1 -5,7 17,4 39,-5 -9,8 -1,10 63,3 -8,6 12,6 136,13 12,9 24,4 17,-3 -14,-3 23,-1|-1102,777 -33,0 22,5 14,-2 -3,-3|247,779 -40,-2 7,2 -6,4 21,2 18,-6|-958,781 -23,0 -5,8 30,-5 -2,-3|-1001,783 4,-4 -55,5 10,3 -13,6 54,-10|1051,783 -57,-4 27,14 33,-6 -3,-4|183,797 32,-7 -25,-4 -19,-18 -12,0 -21,6 9,3 -35,12 -8,8 66,4 13,-4|254,804 20,-3 -44,-7 -56,9 80,1|511,805 -35,-5 -11,2 6,4 -23,0 52,3 11,-4|999,789 -49,1 -38,13 47,10 43,-15 -3,-9|-870,797 12,-4 -50,-11 -21,1 -11,5 9,6 -19,0 -17,8 24,8 -4,2 23,1 46,-10 8,-6|-685,831 66,-7 -58,-9 22,0 -57,-17 -57,-5 14,-1 -7,-2 8,-5 -44,-13 19,-4 -27,-6 -89,3 -1,5 18,2 -5,7 33,-4 -30,9 29,9 -18,10 51,2 -58,0 -40,14 61,8 23,-4 8,6 31,2 108,0|-271,835 63,-8 -106,-7 85,1 8,-4 -11,-5 74,7 36,-6 -78,-11 23,-1 -20,-13 0,-12 12,-6 -32,-4 19,-5 2,-9 -11,0 13,-9 -22,-1 12,-4 -4,-3 -28,-2 13,-11 -25,1 27,-8 3,-8 -17,-2 -20,9 3,-6 -12,-6 41,-1 -54,-16 -41,-4 -24,-14 -56,-12 -14,-20 -16,-8 4,-8 -10,-18 -49,8 -33,27 -7,16 -14,9 4,7 -7,4 10,12 15,3 6,12 -26,-6 -12,3 3,12 30,-2 -44,11 11,9 -39,29 -27,6 -72,0 -29,9 46,4 -65,6 1,4 75,10 4,4 -27,3 58,12 -5,5 55,4 42,-3 26,5 59,-7 -24,5 1,4 34,6 163,3', LAND50 = '1062,333 -15,-7 -4,-7 1,-6 -12,-6 -45,-14 -14,-12 -13,0 -12,-8 -12,-4 -23,-2 -12,-11 -9,0 -12,-4 -7,3 -3,-1 -5,11 1,9 -4,6 -3,19 -2,4 -4,2 3,2 -2,6 3,8 -1,6 7,7 1,13 3,3 11,-4 25,3 8,-3 24,-1 5,-6 3,0 6,3 3,7 11,14 21,9 56,8 22,-47|1360,845 0,-54 -6,1 -3,-1 -4,-6 6,-2 1,-3 6,0 0,-26 -4,-4 -1,-7 -25,4 1,13 -12,5 -7,0 -26,15 -11,3 -25,17 -12,22 -8,4 -5,-2 -16,0 -7,4 0,7 2,1 -5,3 1,5 -13,2 -15,10 -2,-3 -7,0 6,-7 -8,4 -5,-6 -10,-2 -7,-5 3,-10 -2,-2 -20,1 0,74 51,11 49,-23 20,-18 24,3 25,-2 9,3 12,-8 6,-8 6,2 -2,-20 10,0 4,-16 25,0 1,-12 0,33|-88,1084 -8,-3 8,7 1,-3 -1,-1|-53,1032 -13,-4 -5,0 -7,4 -7,-1 3,2 -6,2 -10,-2 -7,5 22,9 3,4 -2,1 0,6 -12,-2 9,7 10,3 8,1 5,-2 -1,3 2,1 6,-3 -6,4 2,5 -2,2 3,2 1,5 -6,-1 -9,8 3,4 8,4 -10,0 -8,-3 -17,1 -2,-3 -5,3 0,3 2,0 7,10 -4,4 1,5 5,0 -5,2 1,2 -8,-5 0,3 4,4 -8,-5 -3,-12 -4,-1 5,9 -2,0 1,9 7,10 -9,-4 -10,3 8,3 -2,1 6,7 -5,3 0,1 4,2 -3,2 3,5 9,0 -5,3 1,4 7,0 -2,3 2,3 11,-1 28,3 -3,-7 -16,-7 -1,-2 4,-1 -6,-4 17,2 25,0 4,-2 1,-3 -14,-16 -16,-6 8,1 5,-3 -14,-4 -9,1 15,-3 9,2 9,-3 10,-7 8,-17 12,-4 11,-8 -2,-2 6,-8 -15,2 7,0 11,-7 2,-4 -6,-5 5,-2 5,3 10,0 13,-5 1,-5 -4,-7 -6,-3 0,-2 -1,-1 -9,-1 3,-1 0,-3 -10,-2 20,-2 0,-3 -9,-5 -15,-4 -20,0 -12,3 1,-2 -3,-1 -11,0 2,-2 -2,-1 -19,2 -8,-1 -6,-8 -10,3 -11,-2 -7,-5 -10,0 -1,2 15,8 6,5 2,4 4,1 2,3 21,0 10,8|-84,1066 2,-1 -5,-2 -4,5 5,0 2,-2|-26,1211 5,-2 -5,-11 0,5 -7,3 6,1 -4,3 4,2 1,-1|-61,1181 6,-2 -9,0 -3,1 1,3 5,-2|-102,1109 -5,1 0,3 3,1 2,-5|-116,1127 -10,-1 3,4 -3,1 4,2 7,-3 -1,-3|-123,1119 1,-6 -4,-1 0,4 -4,-2 2,3 5,2|-119,1116 -2,2 6,4 -4,-6|-124,1167 -7,-5 2,-2 -10,-5 -3,1 5,2 -4,2 0,4 6,0 -1,2 11,4 1,-3|-123,1150 0,-4 10,-1 -6,-4 -2,3 -5,0 -9,5 8,4 4,-3|-144,1154 2,-1 -2,-2 -6,1 6,2|-145,1142 -3,1 0,5 3,-1 0,-5|-124,1082 -9,-1 0,2 -7,5 -6,-5 -6,0 -11,6 8,3 -3,2 7,1 7,7 21,2 9,-8 -4,-3 6,0 3,-3 -4,1 1,-6 -5,0 -3,-4 -4,1|-21,1014 -4,-2 -6,1 5,2 5,-1|1126,513 2,-13 -7,-5 -1,4 -4,-2 -1,-12 4,-1 1,-3 -11,-2 1,-5 -8,-22 -51,7 -20,24 1,4 6,-7 15,3 25,-1 10,4 7,10 24,20 3,5 1,0 0,-7 3,-1|764,942 -13,-1 -15,-7 -19,-2 -16,-10 5,4 -1,3 -8,-5 2,-9 -5,5 -5,-1 -13,5 -7,-3 -5,3 -14,-2 -13,4 3,3 -9,2 16,-2 5,3 -11,1 -6,11 3,-5 -1,-6 -6,0 0,3 -3,-3 -12,-2 -3,-6 -9,-8 -11,-3 1,-9 -6,3 -13,-3 -11,4 6,1 0,3 9,8 0,8 5,1 0,-2 2,1 8,0 3,-2 6,1 -5,3 0,6 -7,2 0,6 -8,5 1,6 -1,3 -5,0 -3,3 -6,0 -18,8 -14,-2 -11,-4 -3,-4 -25,-6 -8,5 -6,-1 -21,4 -5,-3 -3,3 -12,6 0,3 8,10 6,0 -3,2 0,9 20,16 8,3 -2,5 2,1 -9,9 -1,6 8,0 7,5 32,1 24,-3 3,-3 8,-1 0,-1 10,2 11,-3 7,4 5,-5 16,2 8,-5 2,2 -1,7 8,7 22,0 7,5 26,1 13,-11 -6,-2 4,-7 -2,-2 17,-1 5,-3 2,-10 4,-4 10,1 10,-4 16,4 13,-10 4,3 13,-5 5,1 13,-6 6,1 0,-7 -8,-5 6,-4 -4,0 -3,-4 4,-1 0,-5 2,-1 -3,-7 -18,-1 -11,-5 -3,-6 2,0 -2,-4|1120,826 20,-1 2,2 -3,10 7,5 10,2 5,6 8,-4 -6,7 7,0 2,3 15,-10 13,-2 -1,-5 5,-3 -2,-1 0,-7 7,-4 16,0 5,2 8,-4 12,-22 25,-17 11,-3 26,-15 7,0 12,-5 -1,-13 -15,4 -4,-6 -15,-2 -6,-16 -10,-7 -17,-3 -2,-8 -15,-6 -6,6 -8,0 -7,3 -3,21 -15,0 -6,6 -12,6 -3,5 -10,4 -11,-1 -18,6 -3,5 -15,1 -4,-3 -17,-1 -10,-5 -4,-7 -16,-2 -2,12 1,20 -3,5 -7,3 -4,-2 2,7 7,-1 -3,2 1,5 -10,2 1,-5 -5,6 -1,7 4,13 4,-5 9,0 5,-3 11,1 -2,3 8,0 0,4 -12,9 -6,12 -13,0 -4,-2 -3,-6 1,-10 -7,12 11,7 21,4 15,-8 12,-13 11,0|830,830 19,-1 3,3 4,-1 17,-12 1,-5 -3,-4 2,-7 15,-3 8,-7 -4,2 -4,-7 -8,0 5,-11 1,-9 3,-1 -5,-9 7,-3 0,-6 5,-4 -1,-2 -3,1 -6,-4 -4,6 -8,-1 -19,2 -8,-5 -3,4 -14,-4 -16,0 -27,-8 -12,0 -11,4 -15,-5 -16,3 -2,-7 2,-4 -5,-2 -1,-3 -4,-3 -5,1 1,2 -3,6 8,7 -3,5 -13,-6 -14,4 -20,-12 -18,-3 -8,3 -8,7 -13,5 -14,1 -4,-12 -15,-2 -10,3 -5,8 -13,2 -6,-3 2,2 -13,-1 11,3 5,4 -20,-1 1,3 5,0 -7,5 -3,5 3,2 1,5 -19,6 2,1 1,6 4,-6 10,2 -5,1 -3,4 5,4 -4,1 1,3 -3,4 4,5 -16,-2 2,11 11,8 11,1 4,-3 5,1 2,1 -2,2 2,0 3,0 -1,-3 21,1 -4,3 3,2 18,2 -15,4 -1,1 2,4 42,-2 4,4 17,9 20,5 29,-1 5,2 3,0 -1,-3 4,-3 5,-2 10,1 3,-5 4,-4 8,2 5,-3 27,-6 21,4 16,-3 25,11|560,839 0,-2 4,-6 17,-6 -2,-5 -16,2 -13,-3 -5,-5 -10,-4 -11,-8 1,4 11,7 -14,-1 -1,3 6,4 0,6 5,3 0,4 -5,3 5,4 13,3 6,-4 9,1|230,664 0,-16 -25,-14 -3,-5 2,-13 -6,-8 -8,-3 -9,36 -14,10 -5,10 -7,4 -5,12 0,5 15,13 3,9 -3,12 2,11 -3,3 8,7 0,2 22,8 3,-1 0,-3 1,2 6,-1 2,-8 2,-1 13,6 2,-4 -13,-13 2,-6 8,-5 2,-8 -8,-11 -12,-8 -1,-5 5,-6 8,-1 0,-4 5,3 6,-7 -1,-1 6,-1|219,674 -5,1 1,3 5,-2 -1,-2|718,718 5,-1 5,6 5,2 -2,4 2,7 16,-3 15,5 11,-4 12,0 27,8 16,0 14,4 3,-4 -11,-10 -8,-2 -2,-2 -1,-7 2,-8 -3,-7 0,-11 -4,-6 -84,-43 -9,2 -11,7 2,4 -2,8 5,5 -2,3 8,2 -1,2 6,5 -2,5 -3,1 1,3 -8,0 -2,15 -3,3 3,7|190,950 3,-1 -3,-8 13,-4 4,3 2,-2 0,-7 -7,1 1,-7 -4,2 -8,-1 -5,4 -7,-13 -3,3 0,2 -7,3 -1,4 -6,-4 1,-2 -7,-5 -15,0 -6,5 0,5 -6,1 -4,-2 -1,-3 -5,-1 4,9 5,3 1,4 10,6 1,2 -2,1 3,2 4,-1 7,3 17,0 2,1 -3,1 3,2 19,-6|382,1157 -6,-3 0,-4 2,-2 -15,-10 3,4 -4,3 1,6 8,6 7,1 4,-1|331,1126 -3,0 0,5 12,15 2,0 -11,-20|228,1181 1,-3 4,1 3,7 -2,6 5,5 11,5 2,7 -6,11 8,1 4,6 -15,7 3,12 -4,6 0,6 2,2 -4,6 4,4 0,2 12,8 8,2 15,-2 4,3 -1,6 -9,3 17,14 3,10 -2,7 19,3 -2,4 20,11 1,2 -6,6 1,1 5,1 7,7 10,4 12,-3 6,5 -1,7 36,-4 6,3 -6,1 8,6 -5,3 16,0 22,-10 17,-3 16,-8 -3,-1 -1,-9 6,-1 -2,-5 7,-7 -6,-6 0,-5 4,-2 5,-7 -21,-1 -7,2 -4,-1 -3,1 -3,-5 -14,-4 1,-3 -4,1 3,-3 -8,-7 7,-7 -10,-5 -5,-7 -21,-8 -7,1 -6,-5 -9,-1 -6,-4 4,0 -1,-2 -6,-2 -5,1 1,-3 -1,-1 3,-1 -13,-3 5,-4 -6,-8 2,-3 -5,0 -1,-2 2,-18 8,-3 6,1 12,-7 0,-2 5,-1 4,-5 -21,-10 12,1 1,-1 -4,-1 -2,-4 -26,-9 -16,0 14,-3 -5,-1 2,-5 -1,-6 -3,-2 2,-6 -3,-5 1,-4 -11,-17 -3,-2 -23,1 1,-2 -4,0 -7,-4 3,-6 -4,-3 -25,0 1,7 -10,11 7,-1 -3,4 4,0 1,3 -10,6 -7,11 -2,0 -1,5 -3,0 -1,5 -5,3 0,5 -4,0 -2,13 1,2 4,-1|682,240 -21,0 3,4 -10,0 1,-4 -14,0 8,0 -198,0 -4,13 -9,1 0,6 7,7 -2,10 8,6 -3,8 5,3 6,9 0,8 3,3 17,0 1,86 20,0 0,40 124,0 4,4 2,-1 -1,-3 108,0 2,-8 6,-10 -2,0 0,-2 1,-18 5,-26 23,-16 -7,-8 -14,-6 -3,-5 -8,0 -2,-15 -9,-23 1,-18 -8,-30 -9,-3 -8,-12 -23,0|63,796 6,-2 -8,-8 -5,2 -2,3 -4,-1 -3,1 11,7 6,1 -1,-3|86,797 -9,2 0,2 8,0 1,-4|29,778 -5,0 3,4 5,0 -3,-4|-36,868 8,-3 -1,-4 3,1 25,-8 14,0 1,3 13,-3 2,-5 5,1 6,-3 13,0 5,2 6,0 2,-3 -3,-3 2,-4 -23,-13 -21,-5 -7,-5 4,-2 -6,-2 -19,-22 3,-9 8,-6 -14,-9 -6,-11 2,-2 -13,-2 -6,-3 -9,-12 -45,-2 -6,-4 -10,-2 -4,-5 -6,-2 -8,3 -7,9 0,2 4,3 -4,-1 -10,7 1,2 -11,-2 -1,11 10,9 -3,0 -5,5 1,5 6,7 -3,2 -8,10 9,1 2,2 2,4 -3,3 5,4 -3,13 15,11 -7,2 -1,6 -11,1 -5,-3 -15,-1 -1,2 1,2 -2,3 -12,-4 -1,3 4,3 -2,1 1,2 -1,5 -5,-1 2,4 -6,4 1,3 7,4 10,1 2,1 0,3 11,3 13,-4 24,2 27,-5 18,2 11,-3 3,2 11,-2 11,1|-274,578 -3,-1 1,3 7,5 -1,-5 -4,-2|-284,563 -3,-2 -3,1 5,2 5,10 3,1 -2,-10 -5,-2|451,981 -9,-13 -8,-1 -5,4 -19,0 -3,-5 -8,-3 -6,1 -17,-4 -2,-4 -21,0 -11,5 -5,7 6,9 12,1 17,12 11,-2 6,4 6,-5 1,-3 5,0 6,4 12,-2 8,3 11,-2 2,-3 11,-3|330,930 -4,1 -1,-4 -12,-3 0,-7 -7,-2 1,-6 -2,0 -9,1 -5,3 -4,-3 -15,0 5,2 -5,4 0,4 -2,0 3,4 -5,1 6,5 17,-2 7,4 21,2 3,3 4,0 4,-7|427,897 15,-6 8,3 4,-2 -4,-2 4,-5 -6,-5 -1,-4 4,-7 9,-5 -6,-6 -5,-1 2,-7 -3,-3 -17,-2 -1,2 5,6 -7,2 -12,10 -4,-1 0,-3 -5,-4 -23,12 1,3 5,1 -5,6 7,2 -10,6 5,11 -7,0 2,1 1,5 5,0 -8,4 1,2 -3,2 -1,5 14,6 13,0 12,-8 0,-6 14,-6 -3,-3 4,-2 -4,-1|1040,380 -59,-8 -18,-9 -11,-14 -3,-7 -6,-3 -3,0 -5,6 -24,1 -8,3 -25,-3 -10,4 -4,-3 -1,-13 -7,-7 -10,22 -11,9 -10,16 -10,21 -13,10 -7,3 -9,11 -4,7 1,4 -3,8 1,14 -12,22 -11,10 -7,2 -7,10 1,3 -2,7 -39,55 -10,2 -2,-2 7,26 22,-3 9,6 5,7 14,3 4,7 7,3 -21,20 40,10 4,2 24,-3 34,-17 53,-38 55,-4 4,-9 16,0 7,-13 0,-4 9,-4 -1,-1 4,-5 15,-11 -3,1 4,-8 -1,-4 -2,0 1,-3 15,-25 2,-3 9,0 -2,-4 5,-1 1,-4 19,-23 51,-7 2,2 9,-14 -13,-40 -60,-20|1360,846 0,262 0,-9 -6,-2 -44,-5 -8,-5 -13,1 -39,-8 -11,-1 -12,2 -4,-2 -3,-7 11,-2 -6,-1 -1,-3 9,-1 9,-5 -21,-1 -6,-5 5,-7 -19,-8 8,-6 22,-7 -3,-9 -9,-3 -11,0 -7,3 -5,-5 -6,-2 -1,2 -11,2 -11,7 -10,1 -8,-4 -9,3 -10,-1 -16,-8 -21,8 -2,-1 2,-6 -2,-2 -8,10 -16,9 -16,0 -7,4 -17,-4 -4,3 -7,2 -10,-9 -16,-4 -4,-5 -10,-5 -3,0 4,-12 -2,-1 -8,-2 -13,11 -5,-1 -4,-7 -7,-6 -2,-7 5,-4 -7,-7 -1,-8 8,-3 1,-6 4,-4 17,-1 16,-19 -8,0 0,-3 14,-6 -11,-4 1,-4 -5,1 -17,-7 -4,2 1,-4 -8,-14 -2,2 -6,-7 1,-3 11,-6 3,-11 4,7 -4,-17 22,-24 -14,-13 -11,2 -11,10 -4,0 -18,8 1,6 -7,1 -10,4 -2,-3 -5,3 -13,-4 -2,1 1,3 -21,8 -23,1 -19,7 -10,0 -3,-3 -26,18 -10,2 -7,6 -7,0 -6,5 -11,4 6,3 -5,1 2,1 8,-3 9,3 -1,3 7,9 1,1 2,-2 2,3 6,0 -12,6 -3,5 15,0 -1,3 16,5 -1,4 -11,-2 -2,0 4,2 -3,0 -8,-3 2,4 -2,0 2,5 10,6 20,1 3,7 -2,1 0,5 -4,1 3,4 4,0 -6,4 8,5 0,7 -6,-1 -13,6 -5,-1 -13,5 -4,-3 -13,10 -16,-4 -10,4 -10,-1 -4,4 -2,10 -5,3 -17,1 2,2 -4,7 6,2 -13,11 -26,-1 -7,-5 -7,1 -3,4 -1,9 -6,5 3,4 15,-2 11,5 0,2 -5,2 0,3 -14,2 2,5 -9,3 -7,6 2,3 -7,3 4,5 -4,5 2,6 -13,5 -15,-3 -3,2 1,3 -7,1 -5,-1 -5,3 -8,1 -1,8 -5,6 -4,0 4,9 -10,5 4,5 5,1 -6,7 -1,12 9,10 5,1 -3,3 1,6 6,-2 3,3 9,0 4,3 19,-3 1,2 -9,5 -13,0 -8,4 -3,3 2,-1 1,2 -3,2 -14,-3 29,15 39,24 7,8 -7,6 -24,11 11,7 -1,3 -8,2 -2,3 2,5 -6,1 -4,3 5,4 -5,2 4,6 -2,1 8,2 0,2 -4,6 -17,16 19,15 -13,8 -13,3 -5,6 6,7 -7,1 10,2 154,0 23,-6 14,-7 22,-6 5,0 0,2 12,-6 11,-3 4,-9 4,-1 -3,-7 -22,-11 -29,-5 -63,7 -14,4 -6,-1 -1,2 -26,4 -6,3 2,2 -21,1 12,-3 -1,-2 8,-4 7,0 0,-3 9,-2 -6,-2 15,-2 12,-6 2,-4 -8,-7 8,-8 1,-4 2,-1 -2,-4 4,-2 12,-1 14,-8 22,-4 10,3 2,3 -2,4 -15,2 -12,8 -1,3 5,1 2,3 5,1 17,-6 35,-6 6,3 8,1 -13,11 0,5 18,7 16,3 14,8 21,-2 8,-3 -2,-3 6,1 5,-3 0,5 8,8 -1,6 -3,3 -10,3 9,15 -1,5 -17,8 14,-2 37,-1 16,-11 0,-2 -23,-2 -13,-7 13,-4 7,-6 12,-2 23,4 5,9 -1,3 20,2 -2,4 8,-1 31,9 26,5 8,-4 6,3 -7,2 29,8 14,0 -14,-2 3,-1 -4,-4 4,-4 -14,-4 25,1 4,-2 14,7 13,2 22,-2 20,7 15,2 9,-5 -5,-3 0,-3 10,-2 6,1 0,6 12,1 9,5 -16,0 119,0 18,-3 20,-9 0,-2 0,14 -27,0 27,0 0,-534|419,1106 -7,-6 6,-2 6,1 1,6 16,-4 10,0 5,-4 -2,-6 1,-4 -63,2 5,4 2,5 11,2 9,6|672,922 1,2 3,0 13,-5 5,1 15,-14 14,3 9,-1 -4,-7 -11,-1 -8,2 -7,-6 -8,0 -13,-8 -6,0 -6,3 3,7 -1,4 -21,6 23,11 -1,3|564,909 11,-4 13,3 6,-3 -3,-8 -10,-2 1,5 -4,-2 -2,-7 2,0 -5,-5 -1,-11 -30,8 -18,-3 -14,-7 -52,4 -1,2 4,3 -11,7 4,3 -4,2 -8,-3 -15,6 4,1 -4,2 3,3 -14,6 0,6 -11,7 17,4 18,24 23,12 29,-3 6,-5 25,6 3,4 8,1 6,-2 12,-16 9,-7 4,-7 -3,-14 1,-6 -2,-1 3,-3|1025,492 -6,-1 -2,3 -2,14 5,12 5,3 6,-5 -1,-8 2,-9 -3,-8 -4,-1|-176,839 11,4 2,-3 -1,-2 1,-2 15,1 5,3 11,-1 1,-6 7,-2 -15,-11 3,-13 -5,-4 3,-3 -2,-4 -2,-2 -9,-1 8,-10 3,-2 -6,-7 -1,-5 5,-5 3,0 -10,-9 1,-11 -9,-4 -15,2 -8,-1 4,8 -2,20 5,-1 -3,2 -8,-1 -1,4 5,2 1,5 3,2 -7,-7 -6,0 2,12 4,4 6,11 3,13 -1,19 -3,1 2,4|472,1030 1,-4 9,-9 -2,-1 2,-5 -8,-3 -20,-16 0,-9 2,-3 -16,4 -7,4 -11,0 -5,-2 -10,2 -6,-4 -6,0 0,3 -6,5 -10,-4 -8,10 -10,3 -4,-1 -4,2 1,4 -6,-1 -10,4 2,-4 -7,-3 -9,6 4,3 -2,2 -6,-1 -20,8 0,-2 -4,-1 4,8 -2,4 -4,1 -2,7 3,5 -4,5 1,4 -9,7 5,6 -3,11 7,-2 -1,3 -7,2 40,8 7,5 31,6 13,-3 -6,1 4,-6 7,-2 12,2 66,-1 11,-5 9,-22 0,-7 -10,-4 -4,-4 9,-5 -2,-7 1,-4|1360,713 0,-238 -3,3 -4,-2 -6,6 -4,13 -9,2 0,8 -8,7 -3,-2 6,-1 -33,-3 -3,-2 -12,4 -10,-1 -1,-3 -39,0 6,21 8,2 4,4 14,2 3,10 -3,2 -8,0 0,20 -4,0 -4,3 -9,3 -21,26 33,-9 21,2 11,-2 6,3 14,0 23,6 3,21 10,8 8,-2 6,2 3,1 -3,3 8,4 0,2 0,-3 0,80|1174,404 -1,0 0,3 5,7 1,-4 -5,-6|1062,333 -22,47 60,20 13,40 -9,14 0,7 6,13 -1,5 11,2 -1,3 -4,1 1,12 4,2 1,-4 7,5 5,-11 9,-9 33,-10 14,-17 7,-3 0,-6 -9,-14 -9,-8 -9,-14 -5,0 1,4 -2,0 -6,-7 -3,-11 2,-14 -19,-5 -9,-15 -18,-3 -5,-5 1,-6 -5,-5 -20,-1 -9,-5 -10,-2|1126,513 -3,1 0,7 -1,0 6,6 -2,-14|412,1380 -10,0 5,-3 -8,-6 6,-1 -6,-3 -33,4 -3,0 1,-7 -6,-5 -12,3 -10,-4 -5,-6 -8,-3 6,-6 -1,-2 -20,-11 2,-4 -19,-3 2,-7 -3,-10 -17,-14 9,-3 1,-4 -2,-3 -2,-2 -15,2 -8,-2 -12,-8 0,-2 -4,-4 4,-6 -2,-2 0,-6 4,-6 -3,-12 15,-7 -4,-6 -8,-1 6,-11 -2,-7 -11,-5 -5,-5 2,-6 -3,-7 -4,-1 -2,4 -10,2 -4,4 -1,7 -1,-3 -3,-2 1,-4 -5,-6 -7,-1 -6,3 2,-3 -30,-16 -23,-3 -2,3 -6,-1 1,3 -12,3 -11,7 2,5 10,-3 5,3 -5,-1 -4,3 1,4 9,5 -21,-8 -4,2 3,8 9,0 9,3 -9,1 8,8 7,3 1,-5 3,5 6,2 -17,-3 -20,-14 1,9 10,0 -8,2 -3,5 10,5 -8,-3 -3,2 -2,8 36,2 5,-4 0,3 11,2 -5,2 2,3 -6,-6 -11,3 -4,-3 -19,-1 -7,2 -2,5 7,1 -8,4 0,4 21,-2 15,1 -30,2 -3,2 1,2 4,0 11,5 14,0 -9,0 4,4 24,-1 3,1 -3,1 11,2 -27,-1 4,5 12,3 11,0 10,-5 -9,6 2,3 8,1 -6,3 5,2 11,0 -1,-2 1,-1 11,3 6,-4 15,1 0,3 12,4 -3,2 5,2 -7,0 -4,-2 3,-1 -2,-2 -18,-5 -6,4 -3,0 0,2 19,12 19,7 1,1 -5,-1 4,5 13,4 3,-2 9,2 3,3 -10,-3 -6,3 12,11 7,1 -5,3 25,4 -19,-1 -1,4 3,4 15,3 -6,2 9,4 26,2 -19,1 10,6 13,-4 2,3 -9,2 1,3 -9,-2 -1,3 7,3 9,0 -6,2 14,4 6,-7 -1,2 3,2 -4,4 27,3 -21,2 18,5 3,4 268,0 -104,0 -16,-8 -22,4 -11,-3 -18,1 -6,6 -30,0|272,274 -15,-5 -8,-7 -7,0 -14,5 -18,0 -9,-3 -9,-8 -17,2 -18,9 -18,-7 -13,13 -16,4 -19,-3 -8,-5 -2,-10 -8,-8 0,-11 -8,0 -9,8 -9,-4 0,-4 -6,6 4,3 -3,5 -11,-1 -11,8 0,6 4,0 -12,7 -9,16 2,9 14,1 7,5 34,2 1,2 9,-2 0,3 8,5 6,17 1,51 32,7 33,27 89,53 31,-6 14,-12 16,8 4,-30 8,-11 0,-4 7,-8 -4,-9 -6,-60 -22,-23 -18,-27 3,-14|120,1015 -7,2 3,6 -12,3 -3,3 -11,0 -3,-2 -18,4 6,1 10,-3 -5,3 4,0 -5,4 11,10 5,13 6,0 16,9 19,1 8,-3 -3,-13 -6,0 -1,-2 6,-3 0,-3 -6,-3 1,-4 -16,-2 5,-7 -1,-6 -6,-2 4,-3 -1,-3|85,1028 -7,-4 -9,1 -2,3 18,0|-44,702 8,-7 2,-29 5,-10 8,-7 -4,-2 0,-5 -32,-1 -3,-4 -15,-3 -2,-10 5,-3 -1,-2 -26,-10 -10,-10 -21,-3 -3,-5 -10,1 -22,-12 -9,-6 0,-21 -2,0 0,-11 -12,0 -8,-5 -19,3 -13,-2 1,-5 -7,-11 -7,-2 -8,-23 -11,-8 -6,-9 -12,-6 -6,-28 -9,-9 -2,-7 -45,-2 1,10 12,14 3,10 8,14 -4,-3 2,4 20,17 2,14 8,17 16,10 8,18 5,5 28,8 27,22 11,14 0,7 -5,5 2,14 9,14 2,9 15,14 32,14 11,17 9,20 12,2 -1,-3 2,-3 12,-8 25,0 9,4 2,-5 13,-1|-176,553 2,0 0,-33 -66,0 0,-51 -12,-4 -11,-9 3,-29 -79,0 -3,-10 2,11 45,2 2,7 9,9 6,28 12,6 6,9 11,8 8,23 7,2 7,11 -1,5 13,2 19,-3 8,5 12,0 0,11|384,871 8,-8 15,-6 -6,-2 0,-4 -2,-1 -3,0 -3,3 -7,-10 1,-6 -18,13 2,3 -2,7 3,1 1,4 4,2 4,-1 -2,5 5,0|532,965 5,3 14,2 18,-8 6,0 3,-3 5,0 1,-3 -1,-6 8,-5 0,-6 7,-2 0,-6 5,-3 -6,-1 -3,2 -8,0 -2,-1 0,2 -5,-1 0,-8 -9,-8 0,-3 -6,-1 -3,3 2,1 -1,6 3,14 -4,7 -9,7 -12,16 -8,2|-246,296 -18,16 -4,9 -9,2 -5,5 -9,5 -9,1 -15,-4 -10,1 -6,-14 2,15 7,19 1,13 -3,16 -6,7 4,3 -3,-1 5,16 -5,8 -3,0 -6,9 -2,-1 -1,-5 2,11 79,0 -3,29 11,9 12,4 0,51 66,0 0,26 78,-46 -36,0 19,-169 6,-5 -3,-16 -74,0 -3,1 0,3 -2,-5 -10,-2 -15,1 -5,-5 -11,10 -5,-4 -4,-11 -3,-3 -4,1|-228,248 0,11 -5,8 -4,-1 -4,7 2,5 -1,6 -5,5 -1,7 4,-1 3,3 4,11 5,4 11,-10 5,5 15,-1 10,2 2,5 0,-3 3,-1 74,0 3,16 -6,5 -19,169 36,0 119,-78 0,-6 9,-5 3,-4 9,-2 4,-4 15,-4 2,-9 -3,-5 3,-3 20,3 -1,-51 -6,-17 -8,-5 0,-3 -9,2 -1,-2 -34,-2 -7,-5 -15,-2 -9,3 -10,0 -6,-5 -18,-7 -3,-6 -10,2 -5,-6 -2,-6 -6,0 -1,-7 -5,-2 -10,4 -6,-6 2,-6 -5,-3 1,-6 -7,-6 -80,-1 -5,8 -5,2 -2,-1 1,-4 -8,-4 -10,3 -10,-4 -5,4 -5,-4 -5,3 2,5|431,845 14,2 11,-6 4,-6 -1,-8 -7,-4 -12,0 -8,-6 -17,1 -5,7 1,12 3,0 2,4 5,2 5,-1 5,3|122,1002 2,-4 6,-2 -3,-7 -11,2 2,2 -3,5 5,5 2,-1|455,1087 -1,4 2,6 -5,4 -10,0 -16,4 -4,16 12,5 25,2 24,-3 15,3 4,-4 12,-2 19,-9 -3,-6 7,-2 -4,-2 -6,0 -9,-5 -6,-11 4,-2 -1,-2 -4,0 -1,3 -12,-3 -2,-4 -24,-1 -4,6 -12,3|190,605 8,3 6,8 -2,13 3,5 25,14 0,16 16,-7 9,-1 11,2 38,-10 3,-5 3,-10 4,-4 43,-10 16,-11 9,-3 12,5 8,9 1,5 -4,12 2,6 6,7 14,7 7,0 5,3 11,-1 18,-6 0,-5 4,-3 17,-4 16,-1 4,-6 -6,-6 2,-13 -5,-10 6,-20 0,-184 -20,0 0,-10 -160,79 -36,-17 -14,12 -31,6 -9,16 -16,5 -7,0 -5,5 -2,11 -12,16 2,4 7,4 1,6 -3,10 3,9 -2,26 -3,11 -7,9 4,3|720,693 8,0 -1,-3 3,-1 2,-5 -6,-5 1,-2 -7,-1 -1,-3 1,-2 -9,-6 -1,-3 -8,0 11,23 7,8|532,1113 -19,9 -12,2 -4,4 -15,-3 -40,3 -21,-7 0,12 0,3 6,4 2,6 6,5 16,3 12,-8 3,-4 7,-3 15,6 -2,12 21,4 13,-4 9,-6 10,1 10,-2 8,-4 -4,-9 4,0 5,-6 1,-8 -5,-1 -6,-6 -11,1 -9,-4|966,592 -2,0 -2,4 2,4 3,-4 -1,-4|969,571 -16,0 -4,9 -18,2 12,18 12,2 5,-2 3,-9 -4,1 -5,-4 7,-1 8,-16|407,857 5,4 0,3 4,1 12,-10 7,-2 -5,-6 1,-2 -5,-3 -5,1 -5,-2 -2,-4 -2,0 -2,7 -9,7 0,4 6,2|1360,845 0,-33 -1,12 -25,0 -4,16 -10,0 2,20 -6,-2 -6,8 -12,8 -9,-3 -25,2 -24,-3 -20,18 -49,23 -51,-11 0,-74 -11,0 -12,13 -15,8 -21,-4 -11,-7 2,19 -14,2 -6,6 -6,0 0,7 -9,14 -10,3 -2,2 3,3 23,-1 -11,7 8,9 36,0 -9,4 8,13 -2,6 2,3 -2,4 -11,3 -7,-3 -19,5 -26,-10 -11,-2 0,-2 -2,-1 -13,5 -1,3 8,0 -16,19 -17,1 -4,4 -1,6 -8,3 1,8 7,7 -5,4 2,7 7,6 2,5 3,3 4,0 13,-11 8,2 2,1 -4,12 3,0 10,5 4,5 16,4 10,9 7,-2 4,-3 17,4 7,-4 16,0 16,-9 8,-10 2,2 -2,6 2,1 21,-8 16,8 10,1 9,-3 8,4 10,-1 11,-7 11,-2 1,-2 6,2 5,5 7,-3 11,0 9,3 3,9 -22,7 -8,6 19,8 -5,7 6,5 21,1 -9,5 -9,1 1,3 6,1 -11,2 3,7 4,2 12,-2 11,1 39,8 13,-1 8,5 44,5 6,2 0,9 0,-263|716,655 11,-7 9,-2 39,21 6,-21 4,1 1,-2 -7,-5 -40,-10 21,-20 -7,-3 -4,-7 -14,-3 -5,-7 -10,-6 -21,3 4,21 6,15 2,30 5,2|140,919 16,-1 7,5 -1,2 6,4 1,-4 7,-3 0,-2 4,-3 0,3 6,10 5,-4 8,1 3,-2 0,7 7,-1 0,6 11,-1 5,4 18,2 0,-3 5,-5 26,-4 -6,-5 5,-1 -3,-4 2,0 0,-4 5,-4 -3,0 2,1 -3,2 -9,0 -19,-6 0,-4 5,-6 -5,-5 3,-10 23,-13 9,-17 11,-9 12,-6 20,-1 -5,-8 41,-17 10,-9 -1,-6 -1,-2 -5,3 -5,7 -9,1 -4,3 -5,-1 -9,-14 12,-7 1,-8 -11,-4 -1,-8 -10,-9 -7,0 -1,5 3,2 3,7 5,2 0,4 -10,21 -15,5 0,4 -4,4 -8,-1 2,3 -8,1 -6,9 -13,0 -9,4 -20,17 -11,2 1,3 -9,8 -4,0 0,5 -5,13 -4,3 -26,8 -15,-10 -10,-3 3,8 -7,0 -8,4 -1,3 4,4 -1,3 -7,4 9,4 1,3 -7,7 4,4|312,764 -10,-15 4,-8 -4,-7 -12,2 -5,5 -32,11 -4,4 6,8 3,-3 8,3 10,-4 34,6 3,-1 -1,-1|193,818 3,-8 -3,-5 1,-5 -3,-17 -10,2 -2,-6 -6,0 -5,5 0,6 3,7 -3,1 1,8 -5,7 0,5 7,-1 14,8 7,-5 -1,-1 2,-1|717,668 1,-9 -2,-4 -5,-2 0,-5 -7,3 -5,-8 0,-7 5,-1 -5,-3 -1,-5 11,3 0,-7 -11,-33 -13,34 6,7 11,31 6,0 9,6|690,632 1,-1 -6,-7 -1,2 6,6|711,648 0,-13 -2,-5 -11,-3 1,5 5,3 -5,2 2,12 3,2 7,-3|-144,1102 -7,-7 -7,-1 3,-2 -8,-3 11,-6 6,0 6,5 7,-5 0,-2 9,0 -3,-2 4,-7 2,-13 -3,-8 -5,-4 3,-2 -12,-2 -1,2 -22,-8 -7,1 1,-2 -1,-2 -18,-4 -11,0 5,4 -10,-2 10,5 -15,-1 -1,1 10,5 -10,1 1,1 12,1 -3,3 5,3 17,3 -4,1 -4,-2 -14,-2 9,5 3,6 7,2 -11,1 -12,3 0,3 8,1 -4,3 6,1 0,2 -6,-1 1,5 -5,1 1,2 30,0 -1,2 9,6 -12,1 7,4 3,5 12,2 2,-3 -2,-3 3,2 0,4 4,2 7,-2 -5,-3|847,742 8,5 19,-2 8,1 4,-6 9,3 12,-23 9,-4 9,-1 -5,-3 3,-9 -9,-7 -1,-5 -3,1 -1,-4 2,-4 -3,-5 12,-11 3,-3 -1,-6 6,0 14,-10 5,-1 10,-12 -3,-8 0,-8 6,0 0,-11 7,-3 4,-7 -18,3 -9,-1 -13,-19 -37,2 -53,38 -34,17 -24,3 3,3 -1,2 -4,-1 -6,21 45,22 4,6 0,11 3,7 -2,8 1,7 2,2 8,2 11,10|1124,538 -5,-4 -13,-1 9,3 0,3 9,1 2,-1 -2,-1|1078,747 16,2 4,7 10,5 17,1 4,3 15,-1 3,-5 18,-6 11,1 10,-4 3,-5 12,-6 6,-6 16,-2 0,-11 3,-10 -4,-5 0,-8 -7,-7 3,-4 -5,0 -3,-4 0,-8 1,-2 7,-2 -7,-7 6,-18 -1,-15 17,-2 3,-10 -19,-21 21,-26 9,-3 4,-3 4,0 0,-20 8,0 3,-3 -3,-9 -14,-2 -4,-4 -8,-2 -5,-21 -4,-2 -15,4 -3,3 -2,-3 -19,4 -8,-2 -5,3 -29,5 -6,20 -6,7 -13,0 -29,-13 -8,4 -11,1 -20,11 -4,6 -9,4 -9,1 -6,6 -5,12 -4,2 1,4 -4,2 -1,5 -10,10 -2,6 -10,-3 -10,6 3,2 -4,1 -3,-9 -6,-2 -2,2 -2,5 -7,3 0,11 -6,0 0,8 3,8 -10,12 -5,1 -14,10 -6,0 1,6 -3,3 -12,11 3,5 -2,4 1,4 3,-1 1,5 9,7 -3,9 5,3 -9,1 -9,4 -2,7 -3,2 -2,5 -2,2 -2,10 -5,3 1,5 -8,4 5,9 -3,1 -1,9 -5,11 8,0 4,7 18,-15 13,-3 8,1 16,10 13,6 6,-6 -4,-3 4,-5 -6,-3 12,-9 5,1 5,-16 5,-3 16,-2 8,-8 11,-5 22,-3 31,7 3,0 -4,-2 5,-1 -1,11|443,968 12,-6 3,-3 -18,-9 -10,-16 -9,-9 -16,-3 -13,1 -23,-8 -10,0 -13,5 -16,10 -4,7 -4,0 7,3 0,8 5,3 -6,2 13,1 2,6 12,-5 19,1 2,4 17,4 6,-1 8,3 3,5 19,0 5,-4 9,1|412,768 3,-7 -5,1 -1,3 -2,-1 4,5 1,-1|418,756 2,-2 -4,-1 -4,4 2,2 4,-3|402,789 -4,0 -5,6 6,0 -2,-2 5,-4|468,779 2,-3 13,-3 3,-9 5,-1 1,-3 -5,0 -6,8 -8,1 -8,7 -7,1 7,4 3,-2|495,812 -5,2 4,2 1,-4|544,709 -3,3 3,4 0,-7|511,739 -2,0 -2,2 4,3 0,-5|536,756 5,-2 -4,-1 -5,1 4,2|500,755 -1,-1 -5,5 5,-1 1,-3|522,764 -4,1 2,2 -3,4 6,0 -1,-7|528,787 4,-6 -2,0 1,-1 -2,-1 -7,3 3,2 -4,-2 -4,2 6,3 5,0|509,800 -2,-4 -6,1 0,3 8,0|557,719 -3,0 0,4 11,6 -3,-8 -5,-2|477,711 6,1 -1,-2 5,-3 28,0 1,-5 10,4 -3,-6 -27,-1 -2,3 -5,1 -17,2 -1,6 2,-1 2,3 2,-2|526,834 6,-2 0,-4 -5,-3 0,-5 -5,-5 -20,5 -6,-3 -6,2 -8,-5 -7,1 2,-7 7,-1 3,-4 -9,4 -3,0 4,-5 0,-3 -6,5 -4,1 0,-3 4,-3 -5,1 -2,4 -8,4 0,4 -5,-2 -1,-9 15,-18 -4,-1 0,3 -5,1 0,-3 3,-2 -10,-4 14,-4 14,-7 2,-12 -2,0 -9,7 -9,-3 3,-6 6,-3 -7,-2 -3,3 -5,1 8,-22 -9,7 -2,0 -3,-6 -1,4 -6,7 -3,-1 -1,-5 -3,2 -3,5 2,6 -12,10 6,6 5,0 6,2 19,-7 0,2 6,2 -16,6 -19,-3 -2,4 -3,-3 -9,10 7,1 0,3 -6,-1 -10,7 -6,7 5,0 3,2 -2,4 7,2 3,7 5,3 -2,5 13,0 8,6 10,-1 4,2 2,3 17,1 8,3 9,0 5,-4 10,-2 13,1 5,2 -1,6 4,0|190,950 -19,6 -3,-2 3,-1 -2,-1 -18,0 1,11 11,16 -14,4 -14,0 -8,6 3,7 -5,1 -3,5 5,4 0,3 -3,1 1,2 -5,3 1,3 -4,3 6,2 1,6 -5,7 16,2 -1,4 6,3 0,3 -6,3 1,2 5,0 4,6 0,7 -3,2 3,5 16,1 3,-3 -1,-2 3,0 2,3 3,-2 0,-2 2,10 12,-1 12,-6 -10,6 -6,2 -2,6 -5,1 0,2 6,3 -6,7 19,-1 8,-4 -3,-4 18,-3 5,2 0,-4 -4,-2 2,-2 10,-1 8,4 6,0 10,6 9,-1 8,-5 5,0 3,-6 8,-2 3,-11 -5,-6 9,-7 -1,-4 4,-5 -3,-5 2,-7 5,-1 0,-7 -4,-6 -9,5 -1,-1 2,-2 -16,-4 -12,-6 -8,0 -5,-4 -4,1 8,-7 -2,-3 5,-6 22,-13 1,-4 -6,0 -3,-5 -12,-5 4,-4 -1,-4 3,-1 -1,-3 -6,3 -10,1 0,-2 -23,-4 -4,2 -8,1 -2,-4 -3,-1 0,1 -5,3 -9,0|274,1088 0,-2 -4,1 -3,-2 -4,2 1,4 4,3 5,-3 -1,-2 2,-1|284,1079 0,-2 -5,1 -2,5 7,-4|869,822 -14,10 -6,-3 -19,1 4,4 1,5 -5,14 -30,15 3,3 10,0 19,-7 23,-1 21,-8 -1,-3 2,-1 13,4 5,-3 2,3 10,-4 7,-1 -1,-6 16,-6 -5,-5 9,-7 -2,-4 -13,2 -12,5 -9,-5 -28,-2|190,856 1,-13 -7,-15 -8,4 2,2 -4,1 1,4 -3,0 2,3 -2,1 2,3 -3,1 5,5 10,2 1,6 3,-4|152,952 -5,-3 -8,0 -1,-1 2,-2 -11,-7 -10,-15 5,0 1,3 4,2 7,-1 -1,-5 5,-4 -4,-4 7,-7 -1,-3 -9,-4 7,-4 1,-3 -4,-4 1,-3 8,-4 7,0 -3,-8 -16,-8 -3,-3 -9,-3 -14,4 -7,4 -7,-2 -16,4 -13,-7 -4,-6 3,-9 -23,-2 -7,3 0,2 -5,0 -14,5 -2,-3 -14,0 -25,8 -3,-1 1,4 -8,3 6,3 5,20 3,3 -1,1 -2,-2 3,18 5,-3 6,-8 -5,9 -8,5 3,1 -2,11 -13,4 -5,6 1,5 -4,2 3,2 6,-1 -15,2 1,3 -6,1 -1,3 -30,3 -8,5 7,2 -5,3 7,0 -9,1 -1,2 4,3 26,5 11,-6 5,2 9,-1 2,2 10,-1 -3,3 -1,8 -5,10 12,0 2,-6 20,-2 11,3 -5,1 1,4 21,6 7,5 0,10 1,3 17,4 5,-7 7,1 3,-5 7,-1 2,-4 9,-1 1,-6 7,0 5,4 1,-7 13,-6 15,0 6,-2 4,-5 14,0 14,-4 -11,-16 -1,-10 1,-1|400,1207 5,-1 -1,-2 -9,-2 -1,3 3,-1 -1,4 4,-1|483,1316 -5,7 -4,2 0,5 6,6 -7,7 2,5 -6,1 1,9 3,1 -16,8 -17,3 -22,10 -6,0 30,0 6,-6 18,-1 11,3 22,-4 16,8 72,0 -19,-2 7,-1 -6,-7 5,-6 13,-3 13,-8 -19,-15 17,-16 4,-6 0,-2 -8,-2 2,-1 -4,-6 5,-2 -5,-4 4,-3 6,-1 -2,-5 2,-3 8,-2 1,-3 -11,-7 24,-11 7,-6 -7,-8 -39,-24 -29,-15 -25,-3 0,4 -3,-4 -9,1 2,-2 -6,-2 -2,2 -24,-7 -20,0 -10,-3 5,3 -7,4 -1,-2 -7,-1 3,7 -23,4 -2,7 4,11 -1,1 2,1 -7,8 2,6 -5,6 7,9 4,0 -2,3 15,2 -1,3 6,4 21,8 19,15 15,1 1,13 -14,3 0,4 -10,-1|444,1207 4,-1 -2,-1 1,-2 -5,3 2,1|547,1151 -8,1 -10,-1 -9,6 -14,4 -20,-4 5,10 -9,-2 -7,2 -5,6 4,3 -4,0 -1,2 1,6 12,2 -1,1 7,2 21,1 1,3 29,-4 21,1 3,-3 -5,-1 -9,-10 1,-12 6,-7 -5,-1 -4,-5|452,1172 14,-3 -11,-4 -8,-1 -7,-5 4,4 -6,2 2,3 -3,2 15,2|458,1177 -7,-3 -3,3 -7,2 12,3 5,-2 2,-3 -2,0|730,285 -1,18 9,23 2,15 8,0 3,5 14,6 7,8 9,-18 5,-24 10,-16 1,7 7,-9 20,-8 9,-12 12,-8 3,-8 2,0 6,-7 3,-1 1,2 2,-4 -5,-2 -3,-4 -4,2 -2,-1 -32,33 -13,7 -19,1 -4,3 -4,-3 -7,-1 -11,8 -7,-14 -6,6 -5,-4 -10,0|737,440 -108,0 1,3 -2,1 -4,-4 -124,0 0,144 -6,20 5,10 -2,13 6,6 5,-3 10,2 27,-4 6,-4 19,-3 11,-4 18,8 5,0 4,4 10,2 -7,-3 9,1 2,3 8,-3 8,2 5,-4 -5,3 -3,-4 7,-4 4,2 -2,2 8,-5 21,2 11,3 14,-36 -3,-5 -7,-25 -4,-5 -9,6 -10,10 -2,9 -9,10 -3,9 -4,-6 5,-7 1,-6 5,-9 13,-13 0,-6 6,-8 2,-11 25,-43 12,-11 -5,-1 -1,-2 4,-17 11,-6 12,-13|-400,1380 171,0 -171,0 34,0 -34,0 15,0 -15,0 0,-184 0,184|-133,1245 0,-3 -4,0 2,-3 -8,7 10,-1|251,1116 0,-3 -7,-4 4,-3 -6,-2 -1,-8 -4,-1 -4,9 -7,0 -6,10 6,1 3,4 4,0 1,-4 2,-1 3,4 -2,1 7,3 8,-1 -1,-5|195,1097 -22,1 -2,5 2,0 -1,5 -9,4 0,20 10,-2 5,5 3,1 3,-2 1,6 -5,0 -5,-5 -6,-2 -4,2 4,5 3,2 17,1 10,9 13,3 -3,-4 1,-6 -4,-5 0,-8 13,-3 -4,-4 -9,-1 -2,-7 -6,0 2,-2 -8,-5 1,-5 -4,-4 6,-2 0,-2|213,1112 3,-6 0,-3 -4,-2 -12,2 -3,4 0,3 16,2|227,1098 8,-2 0,-2 -6,-1 -8,2 0,4 6,-1|215,1095 -3,2 7,6 -4,-8|251,1099 -9,-1 3,3 6,-2|201,1098 -5,0 -1,3 6,-3|302,1100 -8,2 0,3 9,-2 -1,-3|377,990 -14,-5 -1,-4 -7,-3 -12,-1 -4,-5 -8,4 -10,-1 -21,5 -2,-5 -4,-3 -10,0 -30,16 -6,7 2,3 -8,8 4,-2 5,4 8,0 12,6 16,4 -1,3 5,-1 3,-4 6,2 0,2 20,-8 7,0 1,-2 -4,-2 9,-6 7,3 -2,4 10,-4 6,1 -1,-4 4,-2 4,1 10,-3 6,-8|680,701 -10,-1 -2,3 -10,-1 -4,1 4,1 1,4 13,-1 19,6 -12,-7 1,-5|654,703 4,-1 10,1 2,-3 7,2 4,-2 -7,-1 -15,-7 -10,3 -3,4 0,3 8,1|272,910 6,-1 9,1 4,3 5,-3 11,-1 -1,6 7,2 -1,6 13,4 1,4 9,-3 11,-8 10,-4 11,-1 11,4 -1,-2 1,-5 3,-2 -1,-2 8,-4 -5,0 -1,-5 -3,-2 -6,5 -17,0 -18,4 -7,-2 -5,-4 -5,4 -5,0 -1,-9 7,-5 4,-8 19,-13 1,-3 7,-6 -1,-1 -14,9 -10,3 -8,-1 -1,3 -15,10 -2,2 7,0 -9,7 -3,10 -6,4 -5,1 -7,-10 -2,0 -4,5 -1,8|336,865 -8,1 4,2 5,-1 -1,-2|296,900 -7,2 2,2 5,-4|290,893 -4,5 1,5 2,-4 1,-6|369,851 1,-2 -14,7 -15,4 15,-2 13,-7|480,390 -1,-76 -17,0 -3,-3 0,-8 -6,-9 -5,-3 3,-8 -9,-7 3,-9 -8,-11 2,-2 8,-1 3,-12 9,-1 -179,0 33,0 -12,0 1,0 -3,3 -2,7 -7,10 -9,2 -9,12 -3,14 18,27 22,23 6,60 4,9 -7,8 0,4 -8,11 -4,30 20,9 160,-79|560,839 -9,-1 -6,4 -13,-3 -6,-5 -4,1 1,-7 -5,-2 -13,-1 -10,2 -5,4 -32,-4 2,8 -3,5 -10,6 3,3 -1,8 5,1 6,6 -10,6 -2,9 6,6 7,-3 -4,-3 1,-2 52,-4 14,7 18,3 30,-8 -3,-7 -6,0 -4,-4 -1,-9 -8,-6 10,-10|387,898 -5,-11 10,-6 -7,-2 5,-7 -11,-1 2,-5 -4,1 -4,-2 -1,-4 -3,-2 2,-6 -2,-2 -17,8 1,1 -7,6 -1,3 -19,13 -4,8 -7,5 1,9 10,-4 5,4 7,2 18,-4 17,0 4,-4 10,0|85,1028 16,1 3,-3 13,-3 -4,-6 12,-5 -1,-2 3,-1 0,-3 -5,-4 -2,1 -5,-5 3,-5 -2,-2 -6,-1 -13,6 -1,7 -5,-4 -7,0 -1,6 -9,1 -2,4 -7,1 -3,5 -5,-2 -5,4 -2,4 15,5 13,-3 7,4|635,1042 -13,0 -7,-4 -4,-6 2,-5 -2,-2 -8,5 -16,-2 -5,5 -7,-4 -11,3 -10,-2 0,1 -8,1 -3,3 -27,3 -29,-1 -7,-5 -6,1 -2,-3 -1,4 2,7 -9,5 14,9 -8,24 16,-1 9,1 2,4 12,3 1,-3 5,0 0,2 -4,2 6,11 9,5 6,0 4,2 -7,2 3,6 9,4 11,-1 10,7 9,-1 5,-3 5,1 7,-1 -1,-3 3,-2 15,3 13,-6 -2,-5 4,-5 -4,-5 7,-3 -2,-3 7,-6 9,-3 -2,-5 14,-2 0,-3 5,-3 0,-1 -11,-5 -15,2 -3,-4 6,-5 1,-9 3,-4|1012,518 -1,-2 -2,3 0,6 3,0 0,-7|896,793 5,2 2,-4 13,0 -1,-3 5,-3 2,-7 -12,2 -14,13|977,769 -5,-1 -12,9 6,3 -4,5 4,3 -6,6 -10,-4 -20,-12 -2,6 4,0 -5,4 3,3 -6,1 -12,8 6,0 1,5 -10,6 -1,2 4,4 -11,5 3,1 -4,3 6,3 12,-5 13,-2 2,4 -9,7 5,5 6,-2 11,-10 10,-2 12,8 3,5 2,-1 16,-20 7,-4 8,-2 3,-4 -9,0 -7,-2 -5,-12 1,-5 -4,-6 -3,2 -3,-6 0,-8|191,945 2,4 -3,1 5,2 9,-5 0,-1 3,1 2,4 8,-1 4,-2 23,4 0,2 10,-1 6,-3 1,3 -3,1 1,4 -4,4 1,1 11,4 3,5 4,-1 2,4 5,-3 13,0 4,3 2,5 21,-5 10,1 7,-2 1,-2 -2,-4 6,-8 -2,-6 -13,-1 6,-2 -5,-3 0,-8 -8,-3 -2,-3 -21,-2 -7,-4 -41,5 -7,6 0,3 -18,-2 -6,-5 -10,2 -2,3 -4,-3 -11,4 -1,4|895,794 -9,7 -13,2 -2,7 3,4 -5,8 31,4 4,-3 -3,-1 11,-5 -4,-4 11,-10 -1,-3 -6,0 12,-8 6,-1 -3,-3 5,-4 -4,0 2,-6 -8,0 -2,7 -5,3 0,3 -6,-1 -6,2 -2,3 -6,-1|34,850 -5,-1 -1,2 3,2 3,-1 0,-2|172,739 0,-2 -8,-7 3,-3 -2,-11 3,-12 -3,-9 -15,-13 0,-5 5,-12 7,-4 5,-10 14,-10 9,-36 -4,-3 10,-18 2,-28 -3,-9 3,-14 -8,-6 -2,-4 12,-16 5,-15 3,-2 6,1 16,-5 9,-16 -89,-53 -33,-27 -52,-10 -3,3 3,5 -2,9 -15,4 -4,4 -9,2 -3,4 -9,5 0,6 -113,74 -84,50 0,28 9,6 22,12 10,-1 3,5 21,3 10,10 26,10 1,2 -5,3 2,10 15,3 3,4 32,1 0,5 4,2 -8,7 -5,10 -2,29 -8,7 11,2 24,13 8,0 7,6 19,7 27,2 7,4 17,2 19,0 11,-5 24,9 9,-4 6,1 -1,3 14,-5 14,2|387,837 -1,6 8,10 2,-3 5,1 9,-8 0,-18 4,-6 5,-1 2,-6 -5,-3 -3,-7 -7,-2 2,-4 -4,-3 -4,1 -3,7 -7,3 -4,4 3,0 -2,5 2,6 0,9 3,5 0,3 -5,1|1330,747 24,-2 6,-6 0,30 0,-136 0,3 0,-2 -8,-4 3,-3 -3,-1 -6,-2 -8,2 -3,-2 -8,-8 -1,-18 -22,-6 -16,-1 -6,-3 -11,2 -21,-2 -33,9 19,21 -3,10 -17,2 1,15 -6,16 7,9 -8,3 0,9 3,4 5,0 -3,4 7,7 0,8 3,7 7,-3 8,0 6,-6 8,2 7,4 2,8 17,3 10,7 6,16 15,2 4,6 15,-4';
  function decodeLand(str, k) { return str.split('|').map(function (r) { var x = 0, y = 0; return r.split(' ').map(function (p) { var q = p.split(','); x += +q[0]; y += +q[1]; return [x / k, y / k]; }); }); }
  A.land = function () { return A._land || (A._land = decodeLand(LAND, 10)); };
  // finer outlines (Natural Earth 1:50m countries, drawn as one land) for Europe, the Mediterranean and the Middle East
  A.LAND50_BOX = [-14, 62, 18, 63];
  A.land50 = function () { return A._land50 || (A._land50 = decodeLand(LAND50, 20)); };

  /* =====================================================================================================================
     THE VISUALS (need math/viz/core.js and a document)
     ===================================================================================================================== */
  if (!ML.viz || !D) return;
  var V = ML.viz;
  var NS = 'http://www.w3.org/2000/svg';
  var SKIN = '#ffcc4d', SKIN_LINE = '#e8a93a';
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, at, parent) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function btn(parent, text, fn, cls) { var b = h('button', 'ml-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; if (fn) b.addEventListener('click', fn); if (parent) parent.appendChild(b); return b; }
  function okMark(good) { return '<span class="' + (good ? 'arv-ok' : 'arv-bad') + '">' + (good ? '✓' : '✗') + '</span>'; }
  function plural(n, a, b) { return n + ' ' + (n === 1 ? a : (b || a + 's')); }
  function seeded(str) { var x = 0; str = String(str); for (var i = 0; i < str.length; i++) x = (x * 31 + str.charCodeAt(i)) >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
  function shuffle(a, key) { var r = seeded(key), b = a.slice(); for (var i = b.length - 1; i > 0; i--) { var j = M.floor(r() * (i + 1)), t = b[i]; b[i] = b[j]; b[j] = t; } return b; }
  function derange(n, key) { var idx = []; for (var i = 0; i < n; i++) idx.push(i); for (var t = 0; t < 20; t++) { var s = shuffle(idx, key + '#' + t); if (n < 2 || s.some(function (v, j) { return v !== j; })) return s; } return idx.slice(1).concat([0]); }
  function svgRoot(w, hh, label, cls) { return sv('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'arv-svg' + (cls ? ' ' + cls : ''), role: 'img', 'aria-label': label || '', focusable: 'false' }); }
  function txt(parent, x, y, s, at) { var t = sv('text', Object.assign({ x: x, y: y }, at || {}), parent); t.textContent = s; return t; }
  function letter(i) { return String.fromCharCode(65 + i); }
  function svgPt(svg, e) { var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; var m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }
  function isDark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function cssv(el, name, fb) { try { var v = getComputedStyle(el).getPropertyValue(name).trim(); return v || fb; } catch (e) { return fb; } }
  // the frame every visual shares: class, aria-label, read-to-me note, task, body, controls, readout, caption
  function frame(el, o, name, label) {
    el.classList.add('arv', 'arv-' + name); if (o.big) el.classList.add('arv-big');
    if (!el.getAttribute('aria-label') || o.label) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), interactive: o.interactive !== false };
    if (o.readme) el.appendChild(h('p', 'arv-readme', '<span class="arv-readme-tag">Read to me</span> ' + o.readme));
    if (o.task) el.appendChild(h('p', 'arv-task', o.task));
    F.body = h('div', 'arv-body'); el.appendChild(F.body);
    F.ctl = h('div', 'ml-ctl arv-ctl'); el.appendChild(F.ctl);
    F.out = h('p', 'ml-readout arv-out'); F.out.setAttribute('aria-live', 'polite'); el.appendChild(F.out);
    F.say = function (html) { F.out.innerHTML = html || ''; F.out.hidden = !html; };
    F.say('');
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    F.redraw = []; // functions to call on theme change
    V.onTheme && V.onTheme(function () { F.redraw.forEach(function (f) { try { f(); } catch (e) { } }); });
    return F;
  }
  // choose-one buttons (for "tap the …" tasks). items: [{ key, html }]; returns { el, get(), set(k) }
  function chooser(parent, items, onPick, cls) {
    var wrap = h('div', 'arv-choose' + (cls ? ' ' + cls : '')), cur = null, els = {};
    items.forEach(function (it) {
      var b = h('button', 'arv-chip', it.html); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { set(it.key); if (onPick) onPick(it.key); });
      els[it.key] = b; wrap.appendChild(b);
    });
    function set(k) { cur = k; Object.keys(els).forEach(function (q) { els[q].setAttribute('aria-pressed', String(q === String(k))); }); }
    parent.appendChild(wrap);
    return { el: wrap, get: function () { return cur; }, set: set, mark: function (k, ok) { if (els[k]) els[k].classList.add(ok ? 'ok' : 'no'); }, clear: function () { Object.keys(els).forEach(function (q) { els[q].classList.remove('ok', 'no'); }); } };
  }
  // a small shape path (for shapes, patterns and sorters): cx, cy, r; returns an SVG element
  function shapeEl(g, kind, cx, cy, r, at) {
    at = at || {};
    var P = function (pts) { return sv('polygon', Object.assign({ points: pts.map(function (p) { return (cx + p[0] * r).toFixed(1) + ',' + (cy + p[1] * r).toFixed(1); }).join(' ') }, at), g); };
    switch (kind) {
      case 'circle': return sv('circle', Object.assign({ cx: cx, cy: cy, r: r }, at), g);
      case 'oval': return sv('ellipse', Object.assign({ cx: cx, cy: cy, rx: r, ry: r * 0.62 }, at), g);
      case 'square': return P([[-0.82, -0.82], [0.82, -0.82], [0.82, 0.82], [-0.82, 0.82]]);
      case 'rectangle': return P([[-1, -0.58], [1, -0.58], [1, 0.58], [-1, 0.58]]);
      case 'triangle': return P([[0, -0.95], [0.95, 0.75], [-0.95, 0.75]]);
      case 'diamond': return P([[0, -1], [0.7, 0], [0, 1], [-0.7, 0]]);
      case 'hexagon': return P([0, 1, 2, 3, 4, 5].map(function (k) { var a = M.PI / 3 * k; return [M.cos(a) * 0.95, M.sin(a) * 0.95]; }));
      case 'star': return P([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (k) { var a = -M.PI / 2 + M.PI / 5 * k, q = k % 2 ? 0.42 : 1; return [M.cos(a) * q, M.sin(a) * q + 0.08]; }));
      case 'semicircle': return sv('path', Object.assign({ d: 'M' + (cx - r) + ',' + (cy + r * 0.35) + ' A' + r + ',' + r + ' 0 0 1 ' + (cx + r) + ',' + (cy + r * 0.35) + ' Z' }, at), g);
      case 'heart': return sv('path', Object.assign({ d: 'M' + cx + ',' + (cy + r * 0.85) + ' C' + (cx - r * 1.3) + ',' + (cy - r * 0.05) + ' ' + (cx - r * 0.75) + ',' + (cy - r * 1.05) + ' ' + cx + ',' + (cy - r * 0.42) + ' C' + (cx + r * 0.75) + ',' + (cy - r * 1.05) + ' ' + (cx + r * 1.3) + ',' + (cy - r * 0.05) + ' ' + cx + ',' + (cy + r * 0.85) + ' Z' }, at), g);
      case 'cloud': return sv('path', Object.assign({ d: cloudPath(cx, cy, r, r * 0.62, 7) }, at), g);
      case 'leaf': return sv('path', Object.assign({ d: 'M' + (cx - r) + ',' + (cy + r * 0.2) + ' Q' + (cx - r * 0.1) + ',' + (cy - r * 1.1) + ' ' + (cx + r) + ',' + (cy - r * 0.3) + ' Q' + (cx + r * 0.1) + ',' + (cy + r * 1.0) + ' ' + (cx - r) + ',' + (cy + r * 0.2) + ' Z' }, at), g);
      case 'puddle': return sv('path', Object.assign({ d: blobPath(cx, cy, r, [1, 0.82, 0.95, 0.86, 1.04, 0.8, 0.9, 0.86], 0.5) }, at), g);
      case 'rock': return sv('path', Object.assign({ d: blobPath(cx, cy, r, [0.9, 1, 0.8, 0.95, 0.85, 1, 0.75, 0.9], 0.75) }, at), g);
      case 'blob': return sv('path', Object.assign({ d: blobPath(cx, cy, r, [1, 0.5, 1.05, 0.55, 0.95, 0.45, 1, 0.6, 0.9, 0.5], 1) }, at), g);
      case 'flame': return sv('path', Object.assign({ d: 'M' + cx + ',' + (cy - r) + ' C' + (cx + r * 0.2) + ',' + (cy - r * 0.4) + ' ' + (cx + r * 0.9) + ',' + (cy - r * 0.1) + ' ' + (cx + r * 0.6) + ',' + (cy + r * 0.6) + ' Q' + cx + ',' + (cy + r * 1.1) + ' ' + (cx - r * 0.6) + ',' + (cy + r * 0.6) + ' C' + (cx - r * 0.9) + ',' + (cy) + ' ' + (cx - r * 0.2) + ',' + (cy - r * 0.3) + ' ' + cx + ',' + (cy - r) + ' Z' }, at), g);
      default: return sv('circle', Object.assign({ cx: cx, cy: cy, r: r }, at), g);
    }
  }
  function cloudPath(cx, cy, rx, ry, n) { // a scalloped cloud: bumps around an ellipse
    var pts = []; for (var k = 0; k < n; k++) { var a = -M.PI / 2 + 2 * M.PI * k / n; pts.push([cx + M.cos(a) * rx * 0.8, cy + M.sin(a) * ry * 0.8]); }
    var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
    for (k = 0; k < n; k++) { var p = pts[(k + 1) % n], q = pts[k], ch = M.hypot(p[0] - q[0], p[1] - q[1]); d += ' A' + (ch * 0.62).toFixed(1) + ',' + (ch * 0.62).toFixed(1) + ' 0 0 1 ' + p[0].toFixed(1) + ',' + p[1].toFixed(1); }
    return d + ' Z';
  }
  function blobPath(cx, cy, r, radii, sy) { // a smooth closed blob through points at the given radii
    var n = radii.length, pts = radii.map(function (q, k) { var a = 2 * M.PI * k / n; return [cx + M.cos(a) * r * q, cy + M.sin(a) * r * q * sy]; });
    var d = '';
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      if (!i) d = 'M' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1);
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ' C' + c1[0].toFixed(1) + ',' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ',' + c2[1].toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    return d + ' Z';
  }
  // a printable sheet: puts an SVG (or HTML) alone on the page, prints, then restores
  function printSheet(title, inner) {
    var box = h('div', 'ar-print-sheet', '<h2>' + esc(title) + '</h2>');
    if (typeof inner === 'string') box.insertAdjacentHTML('beforeend', inner); else box.appendChild(inner);
    box.insertAdjacentHTML('beforeend', '<p class="ar-print-foot">Teddy Rook Book · Art &amp; Drawing Ladder · teddyrookbook.com/art/</p>');
    D.body.appendChild(box); D.documentElement.classList.add('ar-printing');
    var done = function () { D.documentElement.classList.remove('ar-printing'); if (box.parentNode) box.parentNode.removeChild(box); W.removeEventListener('afterprint', done); };
    W.addEventListener('afterprint', done);
    setTimeout(function () { W.print(); setTimeout(done, 1500); }, 50);
  }
  A._ui = { shapeEl: shapeEl, blobPath: blobPath, cloudPath: cloudPath };

  /* ---------- ar-lines: kinds, directions and weights of line; things in the world and their lines ---------- */
  function linePath(kind, g, x0, y0, w, hh, at) { // draws one kind of line inside the box (x0, y0, w, hh)
    var cx = x0 + w / 2, cy = y0 + hh / 2, L = x0 + w * 0.1, R = x0 + w * 0.9, T = y0 + hh * 0.15, B = y0 + hh * 0.85, d = '', i;
    at = Object.assign({ fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'arl-ink', 'stroke-width': 4 }, at || {});
    switch (kind) {
      case 'straight': d = 'M' + L + ',' + (B - hh * 0.05) + ' L' + R + ',' + (T + hh * 0.05); break;
      case 'curved': d = 'M' + L + ',' + B + ' Q' + cx + ',' + (y0 - hh * 0.25) + ' ' + R + ',' + B; break;
      case 'zigzag': d = 'M' + L + ',' + B; for (i = 1; i <= 6; i++) d += ' L' + (L + (R - L) * i / 6) + ',' + (i % 2 ? T : B); break;
      case 'wavy': d = 'M' + L + ',' + cy; for (i = 1; i <= 60; i++) { var t = i / 60; d += ' L' + (L + (R - L) * t).toFixed(1) + ',' + (cy - M.sin(t * M.PI * 4) * hh * 0.3).toFixed(1); } break;
      case 'spiral': for (i = 0; i <= 160; i++) { var a = i / 160 * M.PI * 6, rr = i / 160 * M.min(w, hh) * 0.42; d += (i ? ' L' : 'M') + (cx + M.cos(a) * rr).toFixed(1) + ',' + (cy + M.sin(a) * rr).toFixed(1); } break;
      case 'loopy': for (i = 0; i <= 200; i++) { var s = i / 200, ang = s * M.PI * 2 * 4; d += (i ? ' L' : 'M') + (L + (R - L) * s + M.cos(ang + M.PI) * hh * 0.18 + hh * 0.18).toFixed(1) + ',' + (cy + M.sin(ang) * hh * 0.28).toFixed(1); } break;
      case 'dotted': for (i = 0; i <= 9; i++) sv('circle', { cx: L + (R - L) * i / 9, cy: cy, r: M.max(2, hh * 0.045), class: 'arl-dot' }, g); return;
      case 'dashed': at['stroke-dasharray'] = (w * 0.08) + ' ' + (w * 0.05); d = 'M' + L + ',' + cy + ' L' + R + ',' + cy; break;
      case 'vertical': d = 'M' + cx + ',' + (y0 + hh * 0.08) + ' L' + cx + ',' + (y0 + hh * 0.92); break;
      case 'horizontal': d = 'M' + L + ',' + cy + ' L' + R + ',' + cy; break;
      case 'diagonal': d = 'M' + (L + w * 0.08) + ',' + B + ' L' + (R - w * 0.08) + ',' + T; break;
      case 'thick': at['stroke-width'] = M.max(8, hh * 0.13); d = 'M' + L + ',' + cy + ' Q' + cx + ',' + (cy - hh * 0.25) + ' ' + R + ',' + cy; break;
      case 'thin': at['stroke-width'] = 1.4; d = 'M' + L + ',' + cy + ' Q' + cx + ',' + (cy - hh * 0.25) + ' ' + R + ',' + cy; break;
      case 'light': at['class'] = 'arl-light'; d = 'M' + L + ',' + cy + ' Q' + cx + ',' + (cy - hh * 0.25) + ' ' + R + ',' + cy; break;
      case 'dark': at['class'] = 'arl-ink arl-dark'; d = 'M' + L + ',' + cy + ' Q' + cx + ',' + (cy - hh * 0.25) + ' ' + R + ',' + cy; break;
      default: d = 'M' + L + ',' + cy + ' L' + R + ',' + cy;
    }
    return sv('path', Object.assign({ d: d }, at), g);
  }
  A._ui.linePath = linePath;
  // small pictures of things whose main line is known (A.LINE_THINGS)
  function thingPic(key, g) {
    var I = { class: 'arl-ink', fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': 4 }, i, d;
    function P(dd, extra) { return sv('path', Object.assign({ d: dd }, I, extra || {}), g); }
    switch (key) {
      case 'ladder': P('M40,8 L40,82 M80,8 L80,82'); for (i = 0; i < 5; i++) P('M40,' + (18 + i * 15) + ' L80,' + (18 + i * 15), { class: 'arl-ink arl-key' }); break;
      case 'fence': sv('rect', { x: 0, y: 70, width: 120, height: 20, class: 'arl-grass' }, g); P('M8,40 L112,40 M8,60 L112,60', { class: 'arl-ink arl-thin' }); for (i = 0; i < 6; i++) P('M' + (14 + i * 19) + ',20 L' + (14 + i * 19) + ',78', { class: 'arl-ink arl-key' }); break;
      case 'lightning': sv('ellipse', { cx: 60, cy: 18, rx: 46, ry: 14, class: 'arl-cloud' }, g); P('M58,30 L46,52 L64,52 L50,84', { class: 'arl-ink arl-key arl-bolt' }); break;
      case 'waves': sv('rect', { x: 0, y: 40, width: 120, height: 50, class: 'arl-water' }, g); for (i = 0; i < 3; i++) { d = 'M6,' + (48 + i * 14); for (var k = 1; k <= 40; k++) d += ' L' + (6 + k * 2.7).toFixed(1) + ',' + (48 + i * 14 - M.sin(k / 40 * M.PI * 5) * 4).toFixed(1); P(d, { class: 'arl-ink arl-key' }); } break;
      case 'snail': d = ''; for (i = 0; i <= 120; i++) { var a = i / 120 * M.PI * 5, r = 4 + i / 120 * 26; d += (i ? ' L' : 'M') + (64 + M.cos(a) * r).toFixed(1) + ',' + (46 + M.sin(a) * r).toFixed(1); } sv('ellipse', { cx: 60, cy: 72, rx: 50, ry: 9, class: 'arl-snailb' }, g); P(d, { class: 'arl-ink arl-key' }); P('M20,70 Q14,50 22,44 M22,44 L16,34 M22,44 L28,35', { class: 'arl-ink arl-thin' }); break;
      case 'rain': sv('ellipse', { cx: 60, cy: 14, rx: 50, ry: 12, class: 'arl-cloud' }, g); for (i = 0; i < 9; i++) P('M' + (14 + i * 11) + ',' + (32 + (i % 3) * 8) + ' l-10,18', { class: 'arl-ink arl-key arl-rain' }); break;
      case 'road': sv('path', { d: 'M0,90 L44,10 L76,10 L120,90 Z', class: 'arl-road' }, g); P('M60,14 L60,86', { class: 'arl-ink arl-key arl-dash', 'stroke-dasharray': '9 7' }); break;
      case 'rainbow': ['#e03127', '#f5871f', '#fde13a', '#3aa64a', '#2160b8', '#7b3294'].forEach(function (c, j) { sv('path', { d: 'M' + (12 + j * 5) + ',82 A' + (48 - j * 5) + ',' + (60 - j * 5) + ' 0 0 1 ' + (108 - j * 5) + ',82', fill: 'none', stroke: c, 'stroke-width': 5 }, g); }); break;
      case 'flagpole': sv('rect', { x: 0, y: 80, width: 120, height: 10, class: 'arl-grass' }, g); P('M40,6 L40,82', { class: 'arl-ink arl-key' }); sv('rect', { x: 41, y: 8, width: 36, height: 22, class: 'arl-flag' }, g); break;
      case 'horizon': sv('rect', { x: 0, y: 0, width: 120, height: 48, class: 'arl-sky' }, g); sv('rect', { x: 0, y: 48, width: 120, height: 42, class: 'arl-water' }, g); P('M2,48 L118,48', { class: 'arl-ink arl-key' }); sv('circle', { cx: 86, cy: 26, r: 9, class: 'arl-sun' }, g); break;
      case 'slide': sv('rect', { x: 0, y: 82, width: 120, height: 8, class: 'arl-grass' }, g); P('M24,20 L24,82 M34,20 L34,82', { class: 'arl-ink arl-thin' }); for (i = 0; i < 4; i++) P('M24,' + (30 + i * 14) + ' L34,' + (30 + i * 14), { class: 'arl-ink arl-thin' }); P('M34,20 L104,80', { class: 'arl-ink arl-key arl-wide' }); break;
      case 'mountains': sv('rect', { x: 0, y: 0, width: 120, height: 90, class: 'arl-sky' }, g); sv('path', { d: 'M4,80 L24,30 L44,70 L64,22 L84,64 L102,34 L116,80 Z', class: 'arl-mtn' }, g); P('M4,80 L24,30 L44,70 L64,22 L84,64 L102,34 L116,80', { class: 'arl-ink arl-key' }); break;
      case 'lollipop': P('M60,58 L60,88', { class: 'arl-ink arl-wide' }); sv('circle', { cx: 60, cy: 36, r: 26, class: 'arl-candy' }, g); d = ''; for (i = 0; i <= 120; i++) { var b = i / 120 * M.PI * 5, q = 2 + i / 120 * 22; d += (i ? ' L' : 'M') + (60 + M.cos(b) * q).toFixed(1) + ',' + (36 + M.sin(b) * q).toFixed(1); } P(d, { class: 'arl-ink arl-key' }); break;
      case 'footprints': sv('rect', { x: 0, y: 0, width: 120, height: 90, class: 'arl-sand' }, g); for (i = 0; i < 8; i++) sv('ellipse', { cx: 10 + i * 14.5, cy: 46 + (i % 2 ? -7 : 7), rx: 4, ry: 5.5, class: 'arl-foot' }, g); break;
    }
  }
  V.register('ar-lines', function (el, o) {
    var mode = o.mode || 'show';
    var F = frame(el, o, 'lines', 'Kinds of lines');
    var labels = o.labels || (F.quiet ? 'letters' : 'names');
    var kinds = o.kinds || (mode === 'things' ? ['ladder', 'lightning', 'waves', 'snail'] : ['straight', 'curved', 'zigzag', 'wavy', 'spiral']);
    if (mode === 'weight') return weightDemo(el, o, F);
    var grid = h('div', 'arl-grid' + (o.big ? ' big' : '') + (kinds.length === 1 ? ' one' : '')); grid.style.setProperty('--n', M.min(kinds.length, o.columns || (kinds.length > 4 ? 3 : kinds.length))); F.body.appendChild(grid);
    var picks = mode === 'pick' && F.interactive && !F.quiet, sel = null, cards = [];
    kinds.forEach(function (k, i) {
      var info = mode === 'things' ? A.LINE_THINGS[k] : A.LINES[k];
      var name = info ? info.name : k, lab = labels === 'names' ? (mode === 'things' ? cap1(name) : cap1(name) + ' line') : labels === 'letters' ? letter(i) : '';
      var card = h(picks ? 'button' : 'div', 'arl-card'); if (picks) { card.type = 'button'; card.setAttribute('aria-pressed', 'false'); }
      var s = svgRoot(120, mode === 'things' ? 90 : 80, (labels === 'letters' ? letter(i) + ': ' : '') + (labels === 'names' || !F.quiet ? (mode === 'things' ? name : name + ' line') : 'a line'));
      var rot = o.rotate ? (o.rotate[i] !== undefined ? o.rotate[i] : o.rotate[k]) || 0 : 0, cy0 = mode === 'things' ? 45 : 40, gL = sv('g', rot ? { transform: 'translate(60 ' + cy0 + ') rotate(' + rot + ')' + (mode === 'things' || M.abs(M.abs(rot) % 180 - 90) > 45 ? '' : ' scale(0.75)') + ' translate(-60 -' + cy0 + ')' } : null, s);
      if (mode === 'things') thingPic(k, gL); else { var col = o.colors ? o.colors[i % o.colors.length] : o.color, p = linePath(k, gL, 0, 0, 120, 80, col && k !== 'light' ? { style: 'stroke:' + col } : null); if (col && k === 'dotted') [].forEach.call(gL.querySelectorAll('.arl-dot'), function (d) { d.style.fill = col; }); if (o.animate && p && !V.reduced) animateStroke(p); }
      card.appendChild(s);
      if (lab) card.appendChild(h('span', 'arl-lab' + (labels === 'letters' ? ' arl-letter' : ''), esc(lab)));
      if (picks) card.addEventListener('click', function () { sel = k; cards.forEach(function (c) { c.el.setAttribute('aria-pressed', String(c.k === k)); c.el.classList.remove('ok', 'no'); }); F.say(''); });
      grid.appendChild(card); cards.push({ k: k, el: card });
    });
    if (picks && o.target) {
      btn(F.ctl, 'Check', function () {
        if (!sel) { F.say('Tap a line first.'); return; }
        var good = sel === o.target, c = cards.filter(function (q) { return q.k === sel; })[0]; c.el.classList.add(good ? 'ok' : 'no');
        var ti = mode === 'things' ? A.LINE_THINGS[o.target] : A.LINES[o.target];
        F.say(good ? okMark(true) + ' Yes! ' + (ti ? cap1(ti.name) + (mode === 'things' ? '.' : ' line: it ' + ti.desc + '.') : '') : okMark(false) + ' Not that one. ' + (ti && mode !== 'things' ? 'Look for a line that ' + ti.desc + '.' : 'Try again.'));
      }, 'pri');
    }
    return {};
  });
  function cap1(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function animateStroke(p) { try { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.getBoundingClientRect(); p.style.transition = 'stroke-dashoffset 1.6s ease'; p.style.strokeDashoffset = '0'; setTimeout(function () { p.style.strokeDasharray = ''; }, 1700); } catch (e) { } }
  // line weight: the same cup drawn with even lines (A) and with varied weight (B)
  function weightDemo(el, o, F) {
    var row = h('div', 'arl-pair'); F.body.appendChild(row);
    var good = o.good || 'B';
    ['A', 'B'].forEach(function (L) {
      var varied = (L === good), card = h('div', 'arl-card'), s = svgRoot(160, 150, 'Drawing ' + L + ' of a mug');
      var w1 = varied ? 4.2 : 2.2, w2 = varied ? 1.3 : 2.2;
      var I = { fill: 'none', class: 'arl-ink', 'stroke-linecap': 'round' };
      sv('ellipse', Object.assign({ cx: 74, cy: 34, rx: 42, ry: 11, 'stroke-width': w2 }, I), s);
      sv('path', Object.assign({ d: 'M32,34 L36,120', 'stroke-width': varied ? 1.6 : 2.2 }, I), s);
      sv('path', Object.assign({ d: 'M116,34 L112,120', 'stroke-width': w1 }, I), s);
      sv('path', Object.assign({ d: 'M36,120 Q74,136 112,120', 'stroke-width': w1 }, I), s);
      sv('path', Object.assign({ d: 'M114,52 Q146,56 140,82 Q136,102 112,100', 'stroke-width': varied ? 3.4 : 2.2 }, I), s);
      sv('ellipse', { cx: 74, cy: 140, rx: 46, ry: 5, class: 'arl-shadow' }, s);
      card.appendChild(s); card.appendChild(h('span', 'arl-lab arl-letter', L)); row.appendChild(card);
    });
    if (!F.quiet) F.body.appendChild(h('p', 'arv-hint', 'Drawing ' + good + ' uses heavier lines on the shadow side and the bottom, and lighter lines on top and on the lit side. Drawing ' + (good === 'A' ? 'B' : 'A') + ' uses one weight everywhere, so it looks flat.'));
    return {};
  }

  /* ---------- ar-shapes: shapes, drawings built from shapes, page layouts and kinds of pictures ---------- */
  var KID = { red: '#e8574f', blue: '#4a8fe0', yellow: '#f6c945', green: '#58b368', orange: '#f39a3d', purple: '#9b6ad1', pink: '#ef86b4', brown: '#a8743f', gray: '#9aa3ad' };
  var SHAPE_FILL = { circle: KID.red, square: KID.blue, triangle: KID.yellow, rectangle: KID.green, oval: KID.orange, diamond: KID.purple, star: KID.yellow, heart: KID.pink, hexagon: KID.green, semicircle: KID.orange,
    leaf: KID.green, cloud: '#b9d6f2', puddle: '#7fb6e6', rock: KID.gray, blob: KID.purple, flame: KID.orange };
  function partEl(g, p, cls) { // one part of a drawing (A.DRAWINGS)
    var at = { class: cls }, x = p.x, y = p.y, w = p.w, hh = p.h, e;
    switch (p.shape) {
      case 'circle': e = sv('ellipse', Object.assign({ cx: x + w / 2, cy: y + hh / 2, rx: w / 2, ry: hh / 2 }, at), g); break;
      case 'oval': e = sv('ellipse', Object.assign({ cx: x + w / 2, cy: y + hh / 2, rx: w / 2, ry: hh / 2 }, at), g); break;
      case 'square': case 'rectangle': e = sv('rect', Object.assign({ x: x, y: y, width: w, height: hh, rx: 1 }, at), g); break;
      case 'triangle':
        var pts = p.point === 'left' ? [[x, y + hh / 2], [x + w, y], [x + w, y + hh]] : p.point === 'right' ? [[x + w, y + hh / 2], [x, y], [x, y + hh]] : p.flip ? [[x, y], [x + w, y], [x + w / 2, y + hh]] : [[x + w / 2, y], [x + w, y + hh], [x, y + hh]];
        e = sv('polygon', Object.assign({ points: pts.map(function (q) { return q.join(','); }).join(' ') }, at), g); break;
      case 'curve': e = sv('path', Object.assign({ d: p.role === 'wing' ? 'M' + x + ',' + y + ' Q' + (x + w * 0.5) + ',' + (y + hh * 1.5) + ' ' + (x + w) + ',' + y : 'M' + x + ',' + (y + hh) + ' Q' + (x + w * 1.2) + ',' + (y + hh * 0.8) + ' ' + (x + w * 0.5) + ',' + y, fill: 'none' }, at), g); break;
      case 'cloud': e = sv('path', Object.assign({ d: cloudPath(x + w / 2, y + hh / 2, w / 2, hh / 2, 8) }, at), g); break;
      case 'line': var a = p.a * M.PI / 180; e = sv('line', Object.assign({ x1: x + M.cos(a) * 44, y1: y + M.sin(a) * 44, x2: x + M.cos(a) * 62, y2: y + M.sin(a) * 62 }, at), g); break;
    }
    return e;
  }
  var ROLE_FILL = { walls: KID.yellow, roof: KID.red, door: KID.brown, window: '#bfe0f7', doorknob: '#d4a017', body: KID.orange, head: KID.orange, ear: KID.orange, eye: '#2b2b2b', nose: KID.pink, tail: 'none',
    fin: KID.blue, beak: KID.yellow, wing: 'none', wheel: '#3d3d3d', cab: KID.red, boiler: KID.blue, chimney: '#3d3d3d', trunk: KID.brown, leaves: KID.green, stem: KID.green, leaf: KID.green, petal: KID.pink, center: KID.yellow,
    bottom: '#ffffff', middle: '#ffffff', button: '#2b2b2b', sun: KID.yellow, ray: 'none' };
  var DRAW_FILLS = { fish: { body: KID.blue, tail: KID.blue }, bird: { body: KID.red, head: KID.red, tail: KID.red }, snowman: { nose: KID.orange }, car: { body: KID.red, roof: KID.red }, owl: { body: KID.brown, ear: KID.brown, eye: '#ffffff', wing: '#8a5c30', beak: KID.yellow } };
  function drawDrawing(g, key, o, upto) {
    var D0 = A.DRAWINGS[key]; if (!D0) return [];
    var els = [];
    D0.parts.forEach(function (p, i) {
      if (upto !== undefined && i >= upto) return;
      var fillC = o.outline ? 'none' : ((DRAW_FILLS[key] || {})[p.role] || ROLE_FILL[p.role] || KID.gray);
      var e = partEl(g, p, 'ars-part' + (o.outline ? ' ars-outline' : ''));
      if (!e) return;
      if (p.shape === 'curve' || p.shape === 'line') { e.setAttribute('fill', 'none'); e.setAttribute('stroke-width', p.shape === 'line' ? 5 : 6); e.classList.add('ars-stroke'); if (!o.outline) e.setAttribute('stroke', p.role === 'tail' ? (DRAW_FILLS[key] || {}).body || KID.orange : p.role === 'ray' ? '#f2b705' : '#555'); }
      else e.setAttribute('fill', fillC);
      if (o.highlight && (o.highlight === p.role || o.highlight === p.shape)) e.classList.add('ars-hi');
      if (key === 'snowman' && (p.role === 'bottom' || p.role === 'middle' || p.role === 'head')) e.classList.add('ars-snow');
      els.push({ p: p, el: e });
    });
    if (o.ask) { var q = D0.parts.filter(function (p) { return p.role === o.ask; })[0]; if (q) { var bx = q.x + q.w / 2, by = q.y + q.h / 2; sv('circle', { cx: bx, cy: by, r: 9, class: 'ars-ask' }, g); txt(g, bx, by + 4, '?', { class: 'ars-askt', 'text-anchor': 'middle' }); } }
    return els;
  }
  A._ui.drawDrawing = drawDrawing;
  // page layouts for young artists: good and not-yet-good versions
  function sceneEl(g, kind) {
    var W0 = 200, H0 = 150;
    sv('rect', { x: 0, y: 0, width: W0, height: H0, class: 'ars-paper' }, g);
    function tree(x, base, s) { sv('rect', { x: x - 4 * s, y: base - 30 * s, width: 8 * s, height: 30 * s, fill: KID.brown }, g); sv('path', { d: cloudPath(x, base - 42 * s, 20 * s, 18 * s, 7), fill: KID.green }, g); }
    function house(x, base, s) { sv('rect', { x: x - 22 * s, y: base - 34 * s, width: 44 * s, height: 34 * s, fill: KID.yellow, class: 'ars-o' }, g); sv('polygon', { points: [[x - 27 * s, base - 34 * s], [x + 27 * s, base - 34 * s], [x, base - 58 * s]].map(function (q) { return q.join(','); }).join(' '), fill: KID.red, class: 'ars-o' }, g); sv('rect', { x: x - 6 * s, y: base - 18 * s, width: 12 * s, height: 18 * s, fill: KID.brown }, g); }
    switch (kind) {
      case 'sky-gap': sv('rect', { x: 0, y: 0, width: W0, height: 22, fill: '#8cc4f0' }, g); sv('rect', { x: 0, y: 118, width: W0, height: 32, fill: '#7cc36e' }, g); house(70, 120, 1); tree(150, 120, 1); sv('circle', { cx: 170, cy: 14, r: 10, fill: '#f6c945' }, g); break;
      case 'sky-full': sv('rect', { x: 0, y: 0, width: W0, height: 120, fill: '#8cc4f0' }, g); sv('rect', { x: 0, y: 118, width: W0, height: 32, fill: '#7cc36e' }, g); house(70, 120, 1); tree(150, 120, 1); sv('circle', { cx: 170, cy: 24, r: 12, fill: '#f6c945' }, g); break;
      case 'tiny': sv('rect', { x: 0, y: 130, width: W0, height: 20, fill: '#7cc36e' }, g); house(26, 132, 0.45); break;
      case 'big': sv('rect', { x: 0, y: 0, width: W0, height: 132, fill: '#8cc4f0' }, g); sv('rect', { x: 0, y: 130, width: W0, height: 20, fill: '#7cc36e' }, g); house(100, 132, 2.1); break;
      case 'near-far': sv('rect', { x: 0, y: 0, width: W0, height: 92, fill: '#8cc4f0' }, g); sv('rect', { x: 0, y: 90, width: W0, height: 60, fill: '#7cc36e' }, g); tree(150, 98, 0.45); house(115, 100, 0.4); tree(48, 146, 1.5); break;
      case 'far-same': sv('rect', { x: 0, y: 0, width: W0, height: 92, fill: '#8cc4f0' }, g); sv('rect', { x: 0, y: 90, width: W0, height: 60, fill: '#7cc36e' }, g); tree(150, 140, 1.2); tree(48, 140, 1.2); break;
      case 'overlap': sv('rect', { x: 0, y: 112, width: W0, height: 38, fill: '#d9c3a3' }, g); sv('rect', { x: 64, y: 48, width: 84, height: 70, fill: '#c9a26b', class: 'ars-o' }, g); sv('circle', { cx: 82, cy: 92, r: 30, fill: KID.red, class: 'ars-o' }, g); break;
      case 'see-through': sv('rect', { x: 0, y: 112, width: W0, height: 38, fill: '#d9c3a3' }, g); sv('rect', { x: 64, y: 48, width: 84, height: 70, fill: 'none', class: 'ars-o' }, g); sv('circle', { cx: 82, cy: 92, r: 30, fill: 'none', class: 'ars-o' }, g); break;
    }
  }
  var SCENE_NAMES = { 'sky-gap': 'a thin strip of sky at the top, with white air below it', 'sky-full': 'the sky coming all the way down to the ground', tiny: 'a tiny house in the corner',
    big: 'a big house that fills the page', 'near-far': 'a big tree near and small things far away', 'far-same': 'two trees the same size side by side', overlap: 'a ball in front of a box', 'see-through': 'a ball and a box both drawn whole, so they look see-through' };
  A.SCENES = SCENE_NAMES;
  // kinds of pictures, drawn simply (portrait, landscape, still life)
  function pictureEl(g, kind) {
    sv('rect', { x: 0, y: 0, width: 160, height: 120, class: 'ars-paper' }, g);
    if (kind === 'portrait') {
      sv('rect', { x: 0, y: 0, width: 160, height: 120, fill: '#cfe0f0' }, g);
      sv('path', { d: 'M38,120 Q42,86 80,84 Q118,86 122,120 Z', fill: '#4a8fe0', stroke: '#2d5f9e', 'stroke-width': 1.5 }, g);
      sv('rect', { x: 72, y: 70, width: 16, height: 18, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 1.5 }, g);
      sv('ellipse', { cx: 80, cy: 54, rx: 24, ry: 28, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 1.5 }, g);
      sv('path', { d: 'M56,50 Q58,22 80,22 Q104,22 104,50 Q98,36 80,34 Q62,36 56,50 Z', fill: '#6b3f1f' }, g);
      sv('circle', { cx: 71, cy: 55, r: 2.6, fill: '#2b2b2b' }, g); sv('circle', { cx: 89, cy: 55, r: 2.6, fill: '#2b2b2b' }, g);
      sv('path', { d: 'M72,68 Q80,74 88,68', fill: 'none', stroke: '#8a3b2b', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
    } else if (kind === 'landscape') {
      sv('rect', { x: 0, y: 0, width: 160, height: 80, fill: '#9fd0f5' }, g); sv('circle', { cx: 128, cy: 24, r: 11, fill: '#f6c945' }, g);
      sv('path', { d: 'M0,70 Q40,40 80,66 Q120,44 160,64 L160,120 L0,120 Z', fill: '#7cc36e' }, g);
      sv('path', { d: 'M0,92 Q60,76 160,96 L160,120 L0,120 Z', fill: '#5aa65a' }, g);
      sv('rect', { x: 38, y: 56, width: 5, height: 14, fill: KID.brown }, g); sv('circle', { cx: 40, cy: 52, r: 9, fill: '#3f8f4a' }, g);
      sv('rect', { x: 96, y: 58, width: 14, height: 10, fill: KID.yellow }, g); sv('polygon', { points: '94,58 112,58 103,50', fill: KID.red }, g);
    } else if (kind === 'still-life') {
      sv('rect', { x: 0, y: 0, width: 160, height: 120, fill: '#efe3cf' }, g); sv('rect', { x: 0, y: 84, width: 160, height: 36, fill: '#b78a5a' }, g);
      sv('path', { d: 'M100,86 L100,40 Q100,30 108,28 L116,28 Q124,30 124,40 L124,86 Z', fill: '#4a8fe0' }, g);
      sv('path', { d: 'M30,72 Q70,104 110,72 Z', fill: '#f2f2f2', stroke: '#8a8a8a', 'stroke-width': 1.5 }, g);
      sv('circle', { cx: 56, cy: 68, r: 10, fill: KID.red }, g); sv('circle', { cx: 74, cy: 66, r: 10, fill: KID.orange }, g); sv('ellipse', { cx: 65, cy: 58, rx: 12, ry: 6, fill: KID.yellow }, g);
      sv('ellipse', { cx: 138, cy: 88, rx: 11, ry: 9, fill: KID.green }, g);
    }
  }
  A.PICTURES = { portrait: 'portrait', landscape: 'landscape', 'still-life': 'still life' };
  V.register('ar-shapes', function (el, o) {
    var mode = o.mode || (o.draw ? 'drawing' : o.scene ? 'scene' : o.picture ? 'picture' : 'shapes');
    var F = frame(el, o, 'shapes', 'Shapes');
    if (mode === 'drawing') {
      var key = o.draw || 'house', D0 = A.DRAWINGS[key], n = D0.parts.length, step = o.steps ? 1 : n;
      var s = svgRoot(200, 160, (o.label || 'A drawing of ' + D0.name + ' made from shapes')); s.classList.add('ars-draw'); F.body.appendChild(s);
      var g = sv('g', null, s), cap = h('p', 'ars-step'); if (o.steps) F.body.appendChild(cap);
      var tally = h('p', 'ars-tally'); if (o.tally && !F.quiet) F.body.appendChild(tally);
      var draw = function () {
        while (g.firstChild) g.removeChild(g.firstChild);
        drawDrawing(g, key, o, step);
        if (o.steps) { var p = D0.parts[step - 1]; cap.innerHTML = '<b>Step ' + step + ' of ' + n + ':</b> ' + (p ? (function (nm) { return (/^[aeiou]/i.test(nm) ? 'an ' : 'a ') + nm; })(p.shape === 'curve' ? 'curved line' : p.shape === 'line' ? 'short line' : A.SHAPES[p.shape] ? A.SHAPES[p.shape].name.replace(/ \(.*\)/, '') : p.shape) + ' for the ' + p.role + '.' : ''); prev.disabled = step <= 1; next.disabled = step >= n; }
        if (o.labels && !F.quiet) D0.parts.slice(0, step).forEach(function (p, i, arr) {
          if (arr.findIndex(function (q) { return q.role === p.role; }) !== i || p.shape === 'line') return;
          var px = p.x + p.w / 2, py = p.y + p.h / 2, ly = p.ly != null ? p.ly : py;   // ly: where the label sits, when the middle would crowd another label
          if (M.min(p.w, p.h) >= 30) { txt(g, px, ly + 4, p.role, { class: 'ars-plab', 'text-anchor': 'middle' }); return; }
          var left = px < 100, lx = left ? 4 : 196; sv('line', { x1: px, y1: py, x2: left ? lx + 26 : lx - 26, y2: ly, class: 'arf-lead' }, g); txt(g, lx, ly + 4, p.role, { class: 'ars-plab', 'text-anchor': left ? 'start' : 'end' });
        });
        if (o.tally && !F.quiet) { var c = {}; D0.parts.forEach(function (p) { if (p.shape !== 'line' && p.shape !== 'curve') c[p.shape] = (c[p.shape] || 0) + 1; }); tally.innerHTML = Object.keys(c).map(function (k) { return plural(c[k], A.SHAPES[k].name.replace(/ \(.*\)/, '')); }).join(', '); }
      };
      if (o.steps) { var prev = btn(F.ctl, '◀ Back', function () { step = M.max(1, step - 1); draw(); }), next = btn(F.ctl, 'Next ▶', function () { step = M.min(n, step + 1); draw(); }, 'pri'); btn(F.ctl, 'All', function () { step = n; draw(); }); }
      draw(); return {};
    }
    if (mode === 'scene') {
      var list = o.compare ? [o.compare[0], o.compare[1]] : [o.scene || 'sky-full'], row = h('div', 'ars-row'); F.body.appendChild(row);
      list.forEach(function (k, i) { var c = h('div', 'ars-card'), s2 = svgRoot(200, 150, (o.compare ? 'Picture ' + letter(i) + (F.quiet ? '' : ': ' + SCENE_NAMES[k]) : (F.quiet ? 'A picture' : SCENE_NAMES[k]))); sceneEl(s2, k); c.appendChild(s2); if (o.compare) c.appendChild(h('span', 'arl-lab arl-letter', letter(i))); row.appendChild(c); });
      return {};
    }
    if (mode === 'picture') {
      var kinds = [].concat(o.picture || ['portrait', 'landscape', 'still-life']), row2 = h('div', 'ars-row'); F.body.appendChild(row2);
      kinds.forEach(function (k, i) { var c = h('div', 'ars-card ars-framed'), s3 = svgRoot(160, 120, F.quiet ? 'Picture ' + letter(i) : 'A ' + A.PICTURES[k]); pictureEl(s3, k); c.appendChild(s3); c.appendChild(h('span', 'arl-lab' + (F.quiet || o.letters ? ' arl-letter' : ''), F.quiet || o.letters ? letter(i) : cap1(A.PICTURES[k]))); row2.appendChild(c); });
      return {};
    }
    // shapes
    var shapes = o.shapes || ['circle', 'square', 'triangle'], labels = o.labels || (F.quiet ? (shapes.length > 1 ? 'letters' : 'none') : 'names');
    var grid = h('div', 'arl-grid' + (o.big ? ' big' : '') + (shapes.length === 1 ? ' one' : '')); grid.style.setProperty('--n', M.min(shapes.length, o.columns || 4)); F.body.appendChild(grid);
    var picks = o.target && F.interactive && !F.quiet, chosen = null, cards = [];
    shapes.forEach(function (k, i) {
      var card = h(picks ? 'button' : 'div', 'arl-card'); if (picks) { card.type = 'button'; card.setAttribute('aria-pressed', 'false'); }
      var info = A.SHAPES[k] || { name: k }, rot = (o.rotate && o.rotate[k]) || (o.rotate && o.rotate[i]) || 0;
      var s4 = svgRoot(100, 100, labels === 'names' ? info.name : 'Shape ' + letter(i)), gg = sv('g', { transform: rot ? 'rotate(' + rot + ' 50 50)' : null }, s4);
      shapeEl(gg, k, 50, 50, 36, { fill: o.color === false ? 'none' : (o.fill || SHAPE_FILL[k] || KID.gray), class: 'ars-shape' });
      if (o.corners && !F.quiet && info.corners) cornerDots(gg, k);
      card.appendChild(s4);
      var lab = labels === 'names' ? cap1(info.name) + (o.count && info.sides !== undefined && info.kind === 'geometric' ? '<small>' + (info.count || (info.sides ? plural(info.sides, 'side') + ', ' + plural(info.corners, 'corner') : 'no corners')) + '</small>' : '') : labels === 'letters' ? letter(i) : '';
      if (lab) card.appendChild(h('span', 'arl-lab' + (labels === 'letters' ? ' arl-letter' : ''), lab));
      if (picks) card.addEventListener('click', function () { chosen = k; cards.forEach(function (c) { c.el.setAttribute('aria-pressed', String(c.k === k)); c.el.classList.remove('ok', 'no'); }); F.say(''); });
      grid.appendChild(card); cards.push({ k: k, el: card });
    });
    if (picks) btn(F.ctl, 'Check', function () { if (!chosen) { F.say('Tap a shape first.'); return; } var good = [].concat(o.target).indexOf(chosen) >= 0; cards.forEach(function (c) { if (c.k === chosen) c.el.classList.add(good ? 'ok' : 'no'); }); F.say(good ? okMark(true) + ' Yes, that is the ' + A.SHAPES[chosen].name + '.' : okMark(false) + ' That is a ' + A.SHAPES[chosen].name + '. Try another.'); }, 'pri');
    return {};
  });
  function cornerDots(g, k) {
    var pts = { square: [[-0.82, -0.82], [0.82, -0.82], [0.82, 0.82], [-0.82, 0.82]], rectangle: [[-1, -0.58], [1, -0.58], [1, 0.58], [-1, 0.58]], triangle: [[0, -0.95], [0.95, 0.75], [-0.95, 0.75]], diamond: [[0, -1], [0.7, 0], [0, 1], [-0.7, 0]],
      hexagon: [0, 1, 2, 3, 4, 5].map(function (q) { var a = M.PI / 3 * q; return [M.cos(a) * 0.95, M.sin(a) * 0.95]; }) }[k];
    (pts || []).forEach(function (p) { sv('circle', { cx: 50 + p[0] * 36, cy: 50 + p[1] * 36, r: 4.5, class: 'ars-corner' }, g); });
  }

  /* ---------- ar-canvas: a drawing pad with guides, tracing, symmetry, a value-scale checker, Save and Print ---------- */
  var PAD_COLORS = ['#26221e', '#7a7068', '#e03127', '#f5871f', '#f2c22e', '#3aa64a', '#2160b8', '#7b3294', '#8a5a32', '#e86aa6'];
  function drawGuide(ctx, w, hh, o, ink, faint) {
    var gd = o.guide || 'none', i, n;
    ctx.save(); ctx.strokeStyle = faint; ctx.fillStyle = faint; ctx.lineWidth = 1.2; ctx.setLineDash([]);
    function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    if (gd === 'grid') { n = o.grid || 4; var cs = w / n, rows = M.round(hh / cs); for (i = 1; i < n; i++) line(i * cs, 0, i * cs, hh); for (i = 1; i < rows; i++) line(0, i * hh / rows, w, i * hh / rows); }
    if (gd === 'thirds') { ctx.setLineDash([6, 6]); for (i = 1; i < 3; i++) { line(i * w / 3, 0, i * w / 3, hh); line(0, i * hh / 3, w, i * hh / 3); } ctx.setLineDash([]); for (i = 1; i < 3; i++) for (var j = 1; j < 3; j++) { ctx.beginPath(); ctx.arc(i * w / 3, j * hh / 3, 5, 0, 7); ctx.fill(); } }
    if (gd === 'symmetry' || o.symmetry) { ctx.setLineDash([8, 6]); line(w / 2, 0, w / 2, hh); ctx.setLineDash([]); }
    if (gd === 'dots') { n = o.grid || 8; for (i = 1; i < n; i++) for (var k = 1; k < M.round(n * hh / w); k++) { ctx.beginPath(); ctx.arc(i * w / n, k * w / n, 2, 0, 7); ctx.fill(); } }
    if (gd === 'value') { var st = o.steps || 5, bw = M.min(80, (w - 40) / st), x0 = (w - bw * st) / 2, y0 = hh / 2 - bw / 2; ctx.lineWidth = 1.5; for (i = 0; i < st; i++) { ctx.strokeRect(x0 + i * bw, y0, bw, bw); } ctx.font = '13px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('lightest', x0 + bw / 2, y0 - 10); ctx.fillText('darkest', x0 + bw * (st - 0.5), y0 - 10); }
    if (gd === 'lines') { var ks = o.kinds || ['straight', 'curved', 'zigzag', 'wavy', 'spiral'], rh = hh / ks.length; ctx.lineWidth = 3; ctx.setLineDash([2, 7]); ctx.lineCap = 'round'; ks.forEach(function (k, j) { traceLine(ctx, k, 20, j * rh + 4, w - 40, rh - 8); }); ctx.setLineDash([]); }
    if (gd === 'ellipses') { ctx.lineWidth = 2; ctx.setLineDash([3, 6]); [0.1, 0.25, 0.45, 0.7].forEach(function (f, j) { ctx.beginPath(); ctx.ellipse(w * (0.14 + j * 0.24), hh / 2, w * 0.09, w * 0.09 * f, 0, 0, 7); ctx.stroke(); }); ctx.setLineDash([]); }
    if (gd === 'face') { var cx = w / 2, top = hh * 0.08, ch = hh * 0.86, rw = ch * 0.36; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cx, top + ch / 2, rw, ch / 2, 0, 0, 7); ctx.stroke(); ctx.setLineDash([6, 5]); line(cx, top, cx, top + ch); [['eyes', A.HEAD.eyes], ['nose', A.HEAD.noseBottom], ['mouth', A.HEAD.mouth], ['brows', A.HEAD.brows]].forEach(function (q) { var y = top + ch * q[1]; line(cx - rw * 1.1, y, cx + rw * 1.1, y); ctx.font = '12px system-ui,sans-serif'; ctx.fillText(q[0], cx + rw * 1.15, y + 4); }); ctx.setLineDash([]); for (i = 0; i <= 5; i++) line(cx - rw + i * rw * 2 / 5, top + ch * 0.5 - 6, cx - rw + i * rw * 2 / 5, top + ch * 0.5 + 6); }
    if (gd === 'box') { var hy = hh * (o.horizon === undefined ? 0.4 : o.horizon), vx = w / 2; ctx.setLineDash([6, 5]); line(0, hy, w, hy); ctx.setLineDash([]); ctx.beginPath(); ctx.arc(vx, hy, 5, 0, 7); ctx.fill(); ctx.font = '12px system-ui,sans-serif'; ctx.fillText('horizon line', 8, hy - 6); ctx.fillText('vanishing point', vx + 8, hy - 6); }
    if (gd === 'trace' && o.trace) {
      ctx.lineWidth = 2.5; ctx.setLineDash([3, 6]); ctx.lineCap = 'round';
      var tr = o.trace, sc = M.min(w / 200, hh / 160) * 0.92, ox = (w - 200 * sc) / 2, oy = (hh - 160 * sc) / 2;
      if (tr.draw && A.DRAWINGS[tr.draw]) A.DRAWINGS[tr.draw].parts.forEach(function (p) { tracePart(ctx, p, ox, oy, sc); });
      else if (tr.shape) { ctx.beginPath(); var r = M.min(w, hh) * 0.36; tracePoly(ctx, tr.shape, w / 2, hh / 2, r); ctx.stroke(); }
      ctx.setLineDash([]);
    }
    ctx.restore();
  }
  function traceLine(ctx, kind, x0, y0, w, hh) {
    var L = x0, R = x0 + w, cy = y0 + hh / 2, T = y0 + hh * 0.15, B = y0 + hh * 0.85, i;
    ctx.beginPath();
    if (kind === 'zigzag') { ctx.moveTo(L, B); for (i = 1; i <= 10; i++) ctx.lineTo(L + w * i / 10, i % 2 ? T : B); }
    else if (kind === 'wavy') { ctx.moveTo(L, cy); for (i = 1; i <= 100; i++) ctx.lineTo(L + w * i / 100, cy - M.sin(i / 100 * M.PI * 6) * hh * 0.32); }
    else if (kind === 'curved') { ctx.moveTo(L, B); ctx.quadraticCurveTo(L + w / 2, y0 - hh * 0.4, R, B); }
    else if (kind === 'spiral') { for (i = 0; i <= 200; i++) { var a = i / 200 * M.PI * 6, r = i / 200 * hh * 0.45; ctx[i ? 'lineTo' : 'moveTo'](L + w / 2 + M.cos(a) * r, cy + M.sin(a) * r); } }
    else if (kind === 'diagonal') { ctx.moveTo(L + w * 0.3, B); ctx.lineTo(L + w * 0.7, T); }
    else if (kind === 'vertical') { ctx.moveTo(L + w / 2, T); ctx.lineTo(L + w / 2, B); }
    else { ctx.moveTo(L, cy); ctx.lineTo(R, cy); }
    ctx.stroke();
  }
  function tracePoly(ctx, kind, cx, cy, r) {
    var pts = { square: [[-0.8, -0.8], [0.8, -0.8], [0.8, 0.8], [-0.8, 0.8]], rectangle: [[-1, -0.58], [1, -0.58], [1, 0.58], [-1, 0.58]], triangle: [[0, -0.95], [0.95, 0.75], [-0.95, 0.75]], diamond: [[0, -1], [0.7, 0], [0, 1], [-0.7, 0]] }[kind];
    if (kind === 'circle') { ctx.arc(cx, cy, r, 0, 7); return; }
    if (kind === 'oval') { ctx.ellipse(cx, cy, r, r * 0.62, 0, 0, 7); return; }
    if (kind === 'heart') { ctx.moveTo(cx, cy + r * 0.85); ctx.bezierCurveTo(cx - r * 1.3, cy - r * 0.05, cx - r * 0.75, cy - r * 1.05, cx, cy - r * 0.42); ctx.bezierCurveTo(cx + r * 0.75, cy - r * 1.05, cx + r * 1.3, cy - r * 0.05, cx, cy + r * 0.85); return; }
    if (kind === 'star') { for (var k = 0; k <= 10; k++) { var a = -M.PI / 2 + M.PI / 5 * k, q = k % 2 ? 0.42 : 1; ctx[k ? 'lineTo' : 'moveTo'](cx + M.cos(a) * q * r, cy + M.sin(a) * q * r); } return; }
    (pts || []).forEach(function (p, i) { ctx[i ? 'lineTo' : 'moveTo'](cx + p[0] * r, cy + p[1] * r); }); ctx.closePath();
  }
  function tracePart(ctx, p, ox, oy, sc) {
    var x = ox + p.x * sc, y = oy + p.y * sc, w = p.w * sc, hh = p.h * sc;
    ctx.beginPath();
    if (p.shape === 'circle' || p.shape === 'oval') ctx.ellipse(x + w / 2, y + hh / 2, w / 2, hh / 2, 0, 0, 7);
    else if (p.shape === 'square' || p.shape === 'rectangle') ctx.rect(x, y, w, hh);
    else if (p.shape === 'triangle') { var pts = p.point === 'left' ? [[x, y + hh / 2], [x + w, y], [x + w, y + hh]] : p.point === 'right' ? [[x + w, y + hh / 2], [x, y], [x, y + hh]] : p.flip ? [[x, y], [x + w, y], [x + w / 2, y + hh]] : [[x + w / 2, y], [x + w, y + hh], [x, y + hh]]; pts.forEach(function (q, i) { ctx[i ? 'lineTo' : 'moveTo'](q[0], q[1]); }); ctx.closePath(); }
    else if (p.shape === 'curve') { ctx.moveTo(x, y + hh); ctx.quadraticCurveTo(x + w * 1.2, y + hh * 0.8, x + w * 0.5, y); }
    else if (p.shape === 'cloud') { ctx.ellipse(x + w / 2, y + hh / 2, w / 2, hh / 2, 0, 0, 7); }
    else if (p.shape === 'line') { var a = p.a * M.PI / 180, cx = ox + p.x * sc, cy = oy + p.y * sc; ctx.moveTo(cx + M.cos(a) * 44 * sc, cy + M.sin(a) * 44 * sc); ctx.lineTo(cx + M.cos(a) * 62 * sc, cy + M.sin(a) * 62 * sc); }
    ctx.stroke();
  }
  V.register('ar-canvas', function (el, o) {
    var F = frame(el, o, 'canvas', 'A drawing pad');
    var wrap = h('div', 'arc-pad'); F.body.appendChild(wrap);
    var gcv = h('canvas', 'arc-guide'), cv = h('canvas', 'arc-ink'); wrap.appendChild(gcv); wrap.appendChild(cv);
    cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Drawing area. Draw with a mouse, a finger or a pen.');
    cv.tabIndex = 0;
    var gctx = gcv.getContext('2d'), ctx = cv.getContext('2d'), Wd = 300, Ht = 200, dpr = 1;
    var strokes = [], cur = null, tool = 'pencil', color = o.color || PAD_COLORS[0], size = o.size || 3, sym = !!(o.symmetry || o.guide === 'symmetry');
    function fit() {
      Wd = M.max(200, wrap.clientWidth || 300); Ht = o.height || M.round(M.min(Wd * (o.aspect ? 1 / o.aspect : 0.66), 560)); dpr = M.min(2, W.devicePixelRatio || 1);
      [gcv, cv].forEach(function (c) { c.style.width = Wd + 'px'; c.style.height = Ht + 'px'; c.width = M.round(Wd * dpr); c.height = M.round(Ht * dpr); });
      wrap.style.height = Ht + 'px'; gctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); paintGuide(); repaint();
    }
    function paintGuide() { gctx.fillStyle = '#fffdf7'; gctx.fillRect(0, 0, Wd, Ht); drawGuide(gctx, Wd, Ht, o, '#2a2a2a', 'rgba(70,110,170,.45)'); }
    function strokeSeg(s, a, b) {
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (s.tool === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = '#000'; } else ctx.strokeStyle = s.color;
      var pr = (a.p + b.p) / 2 || 0.5;
      ctx.lineWidth = s.tool === 'eraser' ? s.size * 5 : M.max(0.6, s.size * (o.pressure === false ? 1 : 0.35 + pr * 1.3));
      ctx.beginPath(); ctx.moveTo(a.x * Wd, a.y * Ht); ctx.lineTo(b.x * Wd, b.y * Ht); ctx.stroke();
      if (s.sym) { ctx.beginPath(); ctx.moveTo((1 - a.x) * Wd, a.y * Ht); ctx.lineTo((1 - b.x) * Wd, b.y * Ht); ctx.stroke(); }
      ctx.restore();
    }
    function repaint() { ctx.clearRect(0, 0, Wd, Ht); strokes.forEach(function (s) { if (s.pts.length === 1) strokeSeg(s, s.pts[0], { x: s.pts[0].x + 0.0005, y: s.pts[0].y, p: s.pts[0].p }); for (var i = 1; i < s.pts.length; i++) strokeSeg(s, s.pts[i - 1], s.pts[i]); }); }
    function pt(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, p: e.pointerType === 'pen' || (e.pressure && e.pressure !== 0.5) ? e.pressure : 0.5 }; }
    if (F.interactive) {
      cv.addEventListener('pointerdown', function (e) { e.preventDefault(); cv.setPointerCapture(e.pointerId); cur = { tool: tool, color: color, size: size, sym: sym, pts: [pt(e)] }; strokes.push(cur); strokeSeg(cur, cur.pts[0], { x: cur.pts[0].x + 0.0005, y: cur.pts[0].y, p: cur.pts[0].p }); });
      cv.addEventListener('pointermove', function (e) { if (!cur) return; var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; evs.forEach(function (ev) { var p = pt(ev), last = cur.pts[cur.pts.length - 1]; cur.pts.push(p); strokeSeg(cur, last, p); }); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { cv.addEventListener(t, function () { if (cur) { cur = null; F.say(''); } }); });
      // tools
      var bar = h('div', 'arc-tools'); el.insertBefore(bar, F.ctl);
      var tsel = V.seg ? null : null;
      var tb = h('div', 'arc-toolset', ''); bar.appendChild(tb);
      var pen = btn(tb, '✏️ Pencil', function () { tool = 'pencil'; mark(); }), era = btn(tb, '🧽 Eraser', function () { tool = 'eraser'; mark(); });
      function mark() { pen.setAttribute('aria-pressed', String(tool === 'pencil')); era.setAttribute('aria-pressed', String(tool === 'eraser')); }
      mark();
      var sz = h('label', 'arc-size', 'Size <input type="range" min="1" max="14" step="1" value="' + size + '" aria-label="Line size">'); bar.appendChild(sz);
      sz.querySelector('input').addEventListener('input', function (e) { size = +e.target.value; });
      if (o.colors !== false) {
        var pal = h('div', 'arc-pal'); pal.setAttribute('role', 'group'); pal.setAttribute('aria-label', 'Colors'); bar.appendChild(pal);
        (o.colors || (o.gray ? PAD_COLORS.slice(0, 2) : PAD_COLORS)).forEach(function (c) { var b = h('button', 'arc-sw'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', 'Color ' + c); b.addEventListener('click', function () { color = c; tool = 'pencil'; mark(); [].forEach.call(pal.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }); if (c === color) b.setAttribute('aria-pressed', 'true'); pal.appendChild(b); });
      }
      if (o.guide !== 'symmetry' && o.mirror) { var mb = btn(bar, '🦋 Mirror', function () { sym = !sym; mb.setAttribute('aria-pressed', String(sym)); paintGuideSym(); }); mb.setAttribute('aria-pressed', String(sym)); }
      btn(F.ctl, '↶ Undo', function () { strokes.pop(); repaint(); });
      btn(F.ctl, 'Clear', function () { if (!strokes.length) return; strokes = []; repaint(); F.say(''); });
      if (o.guide === 'value' && !F.quiet) btn(F.ctl, 'Check my value scale', function () { F.say(checkValues()); }, 'pri');
      if (o.save !== false) btn(F.ctl, '💾 Save picture', function () { save(); });
      if (o.print) btn(F.ctl, '🖨️ Print a practice sheet', function () { printGuide(); });
    }
    function paintGuideSym() { var g0 = o.guide; if (sym && g0 !== 'symmetry') o.symmetry = true; else if (!sym) o.symmetry = false; paintGuide(); }
    function checkValues() {
      var st = o.steps || 5, bw = M.min(80, (Wd - 40) / st), x0 = (Wd - bw * st) / 2, y0 = Ht / 2 - bw / 2, vals = [];
      for (var i = 0; i < st; i++) {
        var d = ctx.getImageData(M.round((x0 + i * bw + 3) * dpr), M.round((y0 + 3) * dpr), M.max(1, M.round((bw - 6) * dpr)), M.max(1, M.round((bw - 6) * dpr))).data, s = 0, n = 0;
        for (var k = 0; k < d.length; k += 4) { var a = d[k + 3] / 255, lum = (0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2]) / 255; s += a * (1 - lum); n++; }
        vals.push(n ? s / n : 0);
      }
      var fails = []; for (i = 1; i < st; i++) if (vals[i] <= vals[i - 1] + 0.02) fails.push(i + 1);
      var gaps = []; for (i = 1; i < st; i++) gaps.push(vals[i] - vals[i - 1]);
      var maxg = M.max.apply(null, gaps), ming = M.min.apply(null, gaps);
      var pct = vals.map(function (v) { return M.round(v * 100) + '%'; }).join(' · ');
      if (vals[st - 1] < 0.35) return okMark(false) + ' Your darkest box is only ' + M.round(vals[st - 1] * 100) + '% dark. Press harder or layer more strokes in the last box. (' + pct + ')';
      if (fails.length) return okMark(false) + ' Box ' + fails[0] + ' is not darker than the box before it. Each box should be a step darker. (' + pct + ')';
      if (maxg > ming * 3 + 0.05) return 'Getting there: every box is darker than the last, but the steps are uneven. Look for the biggest jump and add a box\'s worth of tone in between. (' + pct + ')';
      return okMark(true) + ' Nice even steps from light to dark. (' + pct + ')';
    }
    function save() {
      var c = D.createElement('canvas'); c.width = cv.width; c.height = cv.height; var x = c.getContext('2d');
      x.fillStyle = '#fffdf7'; x.fillRect(0, 0, c.width, c.height); if (o.saveGuide) x.drawImage(gcv, 0, 0); x.drawImage(cv, 0, 0);
      try { var a = D.createElement('a'); a.download = (o.filename || 'my-drawing') + '.png'; a.href = c.toDataURL('image/png'); D.body.appendChild(a); a.click(); a.remove(); F.say('Saved to your device as a PNG picture.'); } catch (e) { F.say('This browser could not save the picture.'); }
    }
    function printGuide() {
      var c = D.createElement('canvas'), pw = 1000, ph = M.round(pw * Ht / Wd); c.width = pw; c.height = ph; var x = c.getContext('2d');
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, pw, ph); drawGuide(x, pw, ph, o, '#222', 'rgba(60,60,60,.55)');
      var img = h('img'); img.src = c.toDataURL('image/png'); img.alt = 'Practice sheet'; img.className = 'ar-print-img';
      printSheet(o.printTitle || 'Practice sheet', img);
    }
    fit();
    var lastW = 0; if ('ResizeObserver' in W) new ResizeObserver(function () { var w = wrap.clientWidth; if (w && M.abs(w - lastW) > 2) { lastW = w; fit(); } }).observe(wrap);
    return { strokes: function () { return strokes; }, check: function () { return checkValues(); } };
  });

  /* ---------- ar-pattern: repeating patterns, what comes next, patterns in nature, symmetry, rhythm, Islamic star ---------- */
  function motifEl(g, m, cx, cy, r) { var p = String(m).split(':'); return shapeEl(g, p[0], cx, cy, r, { fill: A.PAT_COLORS[p[1]] || p[1] || '#888', class: 'arp-motif' }); }
  function natureTile(g, key, x, y, s) {
    var clip = 'arpc' + (++natN); var cp = sv('clipPath', { id: clip }, sv('defs', null, g)); sv('rect', { x: x, y: y, width: s, height: s, rx: 10 }, cp);
    var G = sv('g', { 'clip-path': 'url(#' + clip + ')' }, g), i, j;
    if (key === 'stripes') { sv('rect', { x: x, y: y, width: s, height: s, fill: '#f4f1ea' }, G); for (i = -2; i < 8; i++) sv('path', { d: 'M' + (x + i * s / 6) + ',' + y + ' q' + (s * 0.12) + ',' + (s * 0.5) + ' 0,' + s + ' l' + (s * 0.07) + ',0 q' + (s * 0.12) + ',' + (-s * 0.5) + ' 0,' + (-s) + ' z', fill: '#1d1d1d' }, G); }
    else if (key === 'spots') { sv('rect', { x: x, y: y, width: s, height: s, fill: '#e9b44c' }, G); var r = seeded('spots'); for (i = 0; i < 16; i++) sv('ellipse', { cx: x + (i % 4 + 0.5 + (r() - 0.5) * 0.4) * s / 4, cy: y + (M.floor(i / 4) + 0.5 + (r() - 0.5) * 0.4) * s / 4, rx: s * 0.06, ry: s * 0.05, fill: '#4a2f18' }, G); }
    else if (key === 'scales') { sv('rect', { x: x, y: y, width: s, height: s, fill: '#2f8f86' }, G); for (j = 0; j < 7; j++) for (i = -1; i < 6; i++) sv('path', { d: 'M' + (x + i * s / 5 + (j % 2) * s / 10) + ',' + (y + j * s / 7) + ' a' + (s / 10) + ',' + (s / 9) + ' 0 0 0 ' + (s / 5) + ',0', fill: 'none', stroke: '#bfe9e2', 'stroke-width': 2 }, G); }
    else if (key === 'spiral') { sv('rect', { x: x, y: y, width: s, height: s, fill: '#f3e3c3' }, G); var d = ''; for (i = 0; i <= 200; i++) { var a = i / 200 * M.PI * 7, rr = i / 200 * s * 0.45; d += (i ? ' L' : 'M') + (x + s / 2 + M.cos(a) * rr).toFixed(1) + ',' + (y + s / 2 + M.sin(a) * rr).toFixed(1); } sv('path', { d: d, fill: 'none', stroke: '#8a5a32', 'stroke-width': 3 }, G); }
    else if (key === 'hexagons') { sv('rect', { x: x, y: y, width: s, height: s, fill: '#f2b705' }, G); var hr = s / 7; for (j = -1; j < 6; j++) for (i = -1; i < 6; i++) { var hx0 = x + i * hr * 1.73 + (j % 2) * hr * 0.866, hy0 = y + j * hr * 1.5; shapeEl(G, 'hexagon', hx0, hy0, hr, { fill: 'none', stroke: '#9c6a00', 'stroke-width': 2, transform: 'rotate(30 ' + hx0 + ' ' + hy0 + ')' }); } }
    else if (key === 'rings') { sv('rect', { x: x, y: y, width: s, height: s, fill: '#d9a86c' }, G); for (i = 1; i < 9; i++) sv('ellipse', { cx: x + s / 2, cy: y + s / 2, rx: i * s / 17, ry: i * s / 18.5, fill: 'none', stroke: '#8a5a32', 'stroke-width': 1.6 }, G); }
    sv('rect', { x: x, y: y, width: s, height: s, rx: 10, fill: 'none', class: 'arp-tile' }, g);
  }
  var natN = 0;
  // half and whole symmetric things for the mirror activities; the left half is drawn, then mirrored (or copied, for the mistake)
  function symThing(g, key, mode) {
    var half = sv('g', null, g), other, I = { class: 'arp-sym' };
    switch (key) {
      case 'butterfly': sv('path', Object.assign({ d: 'M100,40 C60,0 20,10 30,50 C34,70 60,72 100,64 Z', fill: '#f39a3d' }, I), half); sv('path', Object.assign({ d: 'M100,70 C64,74 40,90 52,116 C64,134 90,110 100,92 Z', fill: '#e8574f' }, I), half); sv('circle', { cx: 56, cy: 40, r: 8, fill: '#4a8fe0' }, half); sv('circle', { cx: 70, cy: 98, r: 6, fill: '#f6c945' }, half); break;
      case 'leaf': sv('path', Object.assign({ d: 'M100,10 C60,40 50,90 100,140 Z', fill: '#58b368' }, I), half); sv('path', { d: 'M100,50 L76,38 M100,80 L70,66 M100,108 L78,98', stroke: '#2f7a3e', 'stroke-width': 2, fill: 'none' }, half); break;
      case 'heart': sv('path', Object.assign({ d: 'M100,135 C40,95 30,45 65,30 C85,22 98,38 100,50 Z', fill: '#ef86b4' }, I), half); break;
      case 'house': sv('path', Object.assign({ d: 'M100,20 L40,70 L100,70 Z', fill: '#e8574f' }, I), half); sv('rect', Object.assign({ x: 50, y: 70, width: 50, height: 70, fill: '#f6c945' }, I), half); sv('rect', { x: 60, y: 86, width: 20, height: 20, fill: '#bfe0f7', stroke: '#555' }, half); sv('rect', { x: 88, y: 110, width: 12, height: 30, fill: '#a8743f' }, half); break;
      case 'vase': sv('path', Object.assign({ d: 'M100,20 L78,20 Q82,40 70,60 Q50,95 72,130 L100,130 Z', fill: '#4a8fe0' }, I), half); sv('path', { d: 'M74,80 Q86,72 100,80', stroke: '#f6c945', 'stroke-width': 4, fill: 'none' }, half); break;
      case 'face': sv('path', Object.assign({ d: 'M100,20 C60,20 46,50 46,80 C46,115 70,138 100,138 Z', fill: SKIN, stroke: SKIN_LINE }, {}), half); sv('circle', { cx: 78, cy: 72, r: 5, fill: '#2b2b2b' }, half); sv('path', { d: 'M66,60 Q78,52 90,60', stroke: '#6b3f1f', 'stroke-width': 3, fill: 'none' }, half); sv('path', { d: 'M80,108 Q90,118 100,118', stroke: '#8a3b2b', 'stroke-width': 3, fill: 'none' }, half); sv('path', { d: 'M100,20 C70,18 50,34 46,60 Q70,36 100,34 Z', fill: '#6b3f1f' }, half); break;
      case 'bug': sv('path', Object.assign({ d: 'M100,40 C60,40 50,80 56,104 C62,130 90,136 100,136 Z', fill: '#e8574f' }, I), half); sv('path', { d: 'M100,40 C86,24 80,26 76,34', fill: '#2b2b2b' }, half); sv('circle', { cx: 78, cy: 70, r: 8, fill: '#2b2b2b' }, half); sv('circle', { cx: 74, cy: 104, r: 7, fill: '#2b2b2b' }, half); sv('path', { d: 'M100,30 C90,28 82,30 78,40 C88,36 96,36 100,38 Z', fill: '#2b2b2b' }, half); break;
    }
    if (mode === 'half') return;
    other = half.cloneNode(true); g.appendChild(other);
    var SHIFT = { butterfly: 76, leaf: 50, heart: 66, house: 60, vase: 30, face: 54, bug: 46 };
    other.setAttribute('transform', mode === 'copy' ? 'translate(' + (SHIFT[key] || 50) + ',0)' : 'translate(200,0) scale(-1,1)');
    if (key === 'butterfly') { sv('ellipse', { cx: 100, cy: 70, rx: 6, ry: 40, fill: '#4a3020' }, g); sv('path', { d: 'M98,32 Q90,14 82,10 M102,32 Q110,14 118,10', fill: 'none', stroke: '#4a3020', 'stroke-width': 2 }, g); }
  }
  function rhythmRow(g, type, w, hh, color) {
    var n = 7, i, cx, r, y = hh / 2, cell = M.min(w / n, hh * 1.2);
    for (i = 0; i < n; i++) {
      cx = (i + 0.5) * w / n;
      if (type === 'regular') shapeEl(g, 'circle', cx, y, cell * 0.32, { fill: color });
      else if (type === 'alternating') shapeEl(g, i % 2 ? 'square' : 'circle', cx, y, cell * 0.32, { fill: i % 2 ? '#f39a3d' : color });
      else if (type === 'progressive') shapeEl(g, 'circle', cx, y, cell * (0.1 + i * 0.06), { fill: color });
      else if (type === 'flowing') shapeEl(g, 'circle', cx, y + M.sin(i / (n - 1) * M.PI * 2) * hh * 0.28, cell * 0.2, { fill: color });
      else if (type === 'random') { var rr = seeded('rnd' + i)(); shapeEl(g, ['circle', 'square', 'triangle'][i % 3], cx + (rr - 0.5) * 12, y + (rr - 0.5) * hh * 0.5, hh * (0.08 + rr * 0.18), { fill: ['#e8574f', '#58b368', color][(i * 7) % 3] }); }
    }
  }
  A.RHYTHM_DRAW = ['regular', 'alternating', 'progressive', 'flowing'];
  function starTiling(g, w, hh, s) { // an eight-pointed star and cross pattern (a common Islamic geometric design)
    sv('rect', { x: 0, y: 0, width: w, height: hh, fill: '#f3ead7' }, g);
    for (var j = 0; j * s < hh + s; j++) for (var i = 0; i * s < w + s; i++) {
      var cx = i * s, cy = j * s, pts = [];
      for (var k = 0; k < 16; k++) { var a = M.PI / 8 * k, q = k % 2 ? 0.27 : 0.42; pts.push((cx + M.cos(a) * q * s).toFixed(1) + ',' + (cy + M.sin(a) * q * s).toFixed(1)); }
      sv('polygon', { points: pts.join(' '), fill: (i + j) % 2 ? '#1f5f9e' : '#2f8f86', stroke: '#c79a2e', 'stroke-width': 2 }, g);
      sv('rect', { x: cx + s / 2 - s * 0.11, y: cy + s / 2 - s * 0.11, width: s * 0.22, height: s * 0.22, transform: 'rotate(45 ' + (cx + s / 2) + ' ' + (cy + s / 2) + ')', fill: '#b8473a', stroke: '#c79a2e', 'stroke-width': 2 }, g);
    }
  }
  V.register('ar-pattern', function (el, o) {
    var mode = o.mode || (o.nature ? 'nature' : o.thing ? 'symmetry' : o.rhythm ? 'rhythm' : 'row');
    var F = frame(el, o, 'pattern', 'A pattern');
    if (mode === 'row') {
      var seq = o.seq || A.pattern(o.core || 'AB', o.motifs || ['circle:red', 'square:blue'], o.n || 8), miss = o.missing, n = seq.length;
      if (miss === 'next') { miss = n; }
      var cell = 52, s = svgRoot(cell * (miss === n ? n + 1 : n), cell + 8, F.quiet ? 'A pattern with a missing piece' : 'A pattern: ' + seq.map(A.motifName).join(', ')); s.classList.add('arp-row'); F.body.appendChild(s);
      var slots = miss === n ? n + 1 : n, answerG = null;
      for (var i = 0; i < slots; i++) {
        var cx = i * cell + cell / 2, cy = cell / 2 + 4;
        if (i === miss) { sv('rect', { x: i * cell + 6, y: 10, width: cell - 12, height: cell - 12, rx: 8, class: 'arp-slot' }, s); answerG = sv('g', null, s); if (!o.filled) txt(s, cx, cy + 7, '?', { class: 'arp-q', 'text-anchor': 'middle' }); else motifEl(answerG, seq[i] || seq[i % seq.length], cx, cy, cell * 0.33); }
        else motifEl(s, seq[i], cx, cy, cell * 0.33);
      }
      if (o.choices && F.interactive && !F.quiet) {
        var want = o.answer || (miss < n ? seq[miss] : A.pattern(o.core || 'AB', o.motifs || ['circle:red', 'square:blue'], n + 1)[n]);
        var picked = null, ch = chooser(F.ctl, o.choices.map(function (m) { return { key: m, html: '<svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">' + (function () { var t = D.createElementNS(NS, 'g'); motifEl(t, m, 20, 20, 14); return t.innerHTML; })() + '</svg><span class="arv-sr">' + esc(A.motifName(m)) + '</span>' }; }), function (k) {
          picked = k; while (answerG.firstChild) answerG.removeChild(answerG.firstChild); motifEl(answerG, k, miss * cell + cell / 2, cell / 2 + 4, cell * 0.33); ch.clear();
          var good = k === want; ch.mark(k, good); F.say(good ? okMark(true) + ' Yes! The pattern keeps going.' : okMark(false) + ' Say the pattern out loud and listen for the part that repeats.');
        });
      }
      return {};
    }
    if (mode === 'nature') {
      var keys = [].concat(o.nature || ['stripes', 'spots', 'scales', 'spiral']), grid = h('div', 'arl-grid'); grid.style.setProperty('--n', M.min(keys.length, 4)); F.body.appendChild(grid);
      keys.forEach(function (k, i) { var c = h('div', 'arl-card'), s2 = svgRoot(100, 100, F.quiet ? 'Pattern ' + letter(i) : A.NATURE_PATTERNS[k].name); natureTile(s2, k, 4, 4, 92); c.appendChild(s2); c.appendChild(h('span', 'arl-lab' + (F.quiet ? ' arl-letter' : ''), F.quiet ? letter(i) : cap1(A.NATURE_PATTERNS[k].name) + '<small>' + esc(A.NATURE_PATTERNS[k].on) + '</small>')); grid.appendChild(c); });
      return {};
    }
    if (mode === 'symmetry') {
      var thing = o.thing || 'butterfly';
      if (o.compare) { // A and B: one mirrored, one copied
        var good = o.good || 'A', row = h('div', 'ars-row'); F.body.appendChild(row);
        ['A', 'B'].forEach(function (L) { var c3 = h('div', 'ars-card'), s3 = svgRoot(200, 150, 'Picture ' + L); symThing(s3, thing, L === good ? 'mirror' : 'copy'); if (o.line !== false) sv('line', { x1: 100, y1: 4, x2: 100, y2: 146, class: 'arp-axis' }, s3); c3.appendChild(s3); c3.appendChild(h('span', 'arl-lab arl-letter', L)); row.appendChild(c3); });
        if (!F.quiet) F.body.appendChild(h('p', 'arv-hint', 'In ' + good + ', the right half is a mirror picture of the left half: it faces the other way. In ' + (good === 'A' ? 'B' : 'A') + ', the left half was copied without flipping.'));
        return {};
      }
      var s4 = svgRoot(200, 150, (A.SYMMETRIC[thing] || thing) + (o.show === 'half' ? ', half drawn' : ', symmetrical')); s4.classList.add('arp-one'); F.body.appendChild(s4);
      var gH = sv('g', null, s4); symThing(gH, thing, o.show === 'half' ? 'half' : 'mirror');
      if (o.line !== false) sv('line', { x1: 100, y1: 4, x2: 100, y2: 146, class: 'arp-axis' }, s4);
      if (o.show === 'half' && F.interactive && !F.quiet) btn(F.ctl, 'Show the mirror half', function () { while (gH.firstChild) gH.removeChild(gH.firstChild); symThing(gH, thing, 'mirror'); }, 'pri');
      return {};
    }
    if (mode === 'rhythm') {
      var types = [].concat(o.rhythm || A.RHYTHM_DRAW), list = h('div', 'arp-rhythms'); F.body.appendChild(list);
      types.forEach(function (t, i) { var c4 = h('div', 'arp-rcard'), s5 = svgRoot(560, 70, F.quiet ? 'Row ' + letter(i) : t + ' rhythm'); rhythmRow(s5, t, 560, 70, '#2a6db0'); c4.appendChild(h('span', 'arl-lab' + (F.quiet ? ' arl-letter' : ''), F.quiet ? letter(i) : cap1(t))); c4.appendChild(s5); list.appendChild(c4); });
      return {};
    }
    if (mode === 'star') { var s6 = svgRoot(320, 200, 'An Islamic geometric pattern of eight-pointed stars and crosses'); starTiling(s6, 320, 200, 80); F.body.appendChild(s6); return {}; }
    return {};
  });

  /* ---------- ar-face: cartoon faces and feelings for young artists; head proportions, turns and eyes for older ones ---------- */
  var HAIR = { short: '#5b3a1e', black: '#1d1714', red: '#c4542b', blond: '#d9b25c', gray: '#c9c9cf', brown: '#7a4a24' };
  function faceEl(g, o, cx, cy, s) { // s = half the head height
    o = o || {};
    var mood = A.MOODS[o.mood || 'happy'] || A.MOODS.happy, rw = s * (o.age === 'kid' ? 0.86 : 0.74), top = cy - s, hc = HAIR[o.hair] || o.hair || HAIR.short;
    var eyeY = top + 2 * s * (o.eyes === undefined ? (o.age === 'kid' ? 0.55 : A.HEAD.eyes) : o.eyes), noseY = top + 2 * s * (o.age === 'kid' ? 0.7 : A.HEAD.noseBottom), mouthY = top + 2 * s * (o.age === 'kid' ? 0.8 : A.HEAD.mouth);
    if (o.neck !== false) { sv('rect', { x: cx - rw * 0.32, y: cy + s * 0.75, width: rw * 0.64, height: s * 0.5, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 2 }, g); sv('path', { d: 'M' + (cx - rw * 1.4) + ',' + (cy + s * 1.6) + ' Q' + (cx - rw * 1.3) + ',' + (cy + s * 1.05) + ' ' + cx + ',' + (cy + s * 1.05) + ' Q' + (cx + rw * 1.3) + ',' + (cy + s * 1.05) + ' ' + (cx + rw * 1.4) + ',' + (cy + s * 1.6) + ' Z', fill: o.shirt || '#4a8fe0' }, g); }
    if (o.hairStyle === 'long') sv('path', { d: 'M' + (cx - rw * 1.08) + ',' + (cy + s * 0.9) + ' Q' + (cx - rw * 1.2) + ',' + (top - s * 0.05) + ' ' + cx + ',' + (top - s * 0.06) + ' Q' + (cx + rw * 1.2) + ',' + (top - s * 0.05) + ' ' + (cx + rw * 1.08) + ',' + (cy + s * 0.9) + ' Z', fill: hc }, g);
    sv('ellipse', { cx: cx - rw * 0.98, cy: (eyeY + noseY) / 2, rx: rw * 0.12, ry: s * 0.16, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 2 }, g);
    sv('ellipse', { cx: cx + rw * 0.98, cy: (eyeY + noseY) / 2, rx: rw * 0.12, ry: s * 0.16, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 2 }, g);
    sv('ellipse', { cx: cx, cy: cy, rx: rw, ry: s, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 2.5 }, g);
    // hair on top
    if (o.hairStyle !== 'bald') sv('path', { d: 'M' + (cx - rw * 1.0) + ',' + (top + s * 0.55) + ' Q' + (cx - rw * 1.05) + ',' + (top - s * 0.1) + ' ' + cx + ',' + (top - s * 0.04) + ' Q' + (cx + rw * 1.05) + ',' + (top - s * 0.1) + ' ' + (cx + rw * 1.0) + ',' + (top + s * 0.55) + ' Q' + (cx + rw * 0.6) + ',' + (top + s * 0.22) + ' ' + (cx + rw * 0.1) + ',' + (top + s * 0.3) + ' Q' + (cx - rw * 0.6) + ',' + (top + s * 0.2) + ' ' + (cx - rw * 1.0) + ',' + (top + s * 0.55) + ' Z', fill: hc }, g);
    var ex = rw * 0.4, er = s * (o.age === 'kid' ? 0.085 : 0.065);
    // eyes
    [-1, 1].forEach(function (sd) {
      var x = cx + sd * ex;
      if (mood.eyes === 'closed') sv('path', { d: 'M' + (x - er * 1.4) + ',' + eyeY + ' Q' + x + ',' + (eyeY + er * 1.3) + ' ' + (x + er * 1.4) + ',' + eyeY, fill: 'none', stroke: '#2b2b2b', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
      else { if (o.whites) sv('ellipse', { cx: x, cy: eyeY, rx: er * 2, ry: er * 1.2, fill: '#fff', stroke: '#6b5a3a', 'stroke-width': 1 }, g); sv('circle', { cx: x, cy: eyeY, r: mood.mouth === 'round' ? er * 1.25 : er, fill: '#2b2b2b' }, g); sv('circle', { cx: x + er * 0.35, cy: eyeY - er * 0.35, r: er * 0.3, fill: '#fff' }, g); }
      // brows
      var by = eyeY - s * 0.2, bx1 = x - er * 2, bx2 = x + er * 2, inner = sd < 0 ? bx2 : bx1, outer = sd < 0 ? bx1 : bx2, d;
      if (mood.brows === 'raised') d = 'M' + outer + ',' + (by - s * 0.02) + ' Q' + x + ',' + (by - s * 0.14) + ' ' + inner + ',' + (by - s * 0.04);
      else if (mood.brows === 'down') d = 'M' + outer + ',' + (by - s * 0.06) + ' L' + inner + ',' + (by + s * 0.06);
      else if (mood.brows === 'worried') d = 'M' + outer + ',' + (by + s * 0.04) + ' L' + inner + ',' + (by - s * 0.07);
      else d = 'M' + outer + ',' + (by + s * 0.01) + ' Q' + x + ',' + (by - s * 0.05) + ' ' + inner + ',' + (by + s * 0.01);
      sv('path', { d: d, fill: 'none', stroke: o.age === 'older' ? '#8e8e94' : '#4a2f18', 'stroke-width': M.max(2.5, s * 0.04), 'stroke-linecap': 'round' }, g);
      if (o.glasses) sv('circle', { cx: x, cy: eyeY, r: er * 2.6, fill: 'none', stroke: '#333', 'stroke-width': 2.2 }, g);
    });
    if (o.glasses) sv('path', { d: 'M' + (cx - ex + er * 2.6) + ',' + eyeY + ' L' + (cx + ex - er * 2.6) + ',' + eyeY, stroke: '#333', 'stroke-width': 2.2 }, g);
    // nose
    sv('path', { d: 'M' + (cx - rw * 0.08) + ',' + (noseY - s * 0.02) + ' Q' + cx + ',' + (noseY + s * 0.05) + ' ' + (cx + rw * 0.08) + ',' + (noseY - s * 0.02), fill: 'none', stroke: SKIN_LINE, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
    // mouth
    var mw = rw * 0.36, m = mood.mouth, md;
    if (m === 'up') md = 'M' + (cx - mw) + ',' + mouthY + ' Q' + cx + ',' + (mouthY + s * 0.2) + ' ' + (cx + mw) + ',' + mouthY;
    else if (m === 'down') md = 'M' + (cx - mw) + ',' + (mouthY + s * 0.08) + ' Q' + cx + ',' + (mouthY - s * 0.1) + ' ' + (cx + mw) + ',' + (mouthY + s * 0.08);
    else if (m === 'wavy') md = 'M' + (cx - mw) + ',' + mouthY + ' q' + (mw / 2) + ',' + (-s * 0.05) + ' ' + mw + ',0 q' + (mw / 2) + ',' + (s * 0.05) + ' ' + mw + ',0';
    else if (m === 'small') md = 'M' + (cx - mw * 0.4) + ',' + mouthY + ' Q' + cx + ',' + (mouthY + s * 0.05) + ' ' + (cx + mw * 0.4) + ',' + mouthY;
    else md = 'M' + (cx - mw * 0.8) + ',' + mouthY + ' L' + (cx + mw * 0.8) + ',' + mouthY;
    if (m === 'round') sv('ellipse', { cx: cx, cy: mouthY + s * 0.03, rx: mw * 0.38, ry: s * 0.1, fill: '#7a2a1e' }, g);
    else sv('path', { d: md, fill: 'none', stroke: '#8a3b2b', 'stroke-width': M.max(2.5, s * 0.045), 'stroke-linecap': 'round' }, g);
    if (o.hat) sv('path', { d: 'M' + (cx - rw * 1.3) + ',' + (top + s * 0.3) + ' L' + (cx + rw * 1.3) + ',' + (top + s * 0.3) + ' L' + (cx + rw * 0.8) + ',' + (top + s * 0.18) + ' L' + (cx + rw * 0.7) + ',' + (top - s * 0.35) + ' L' + (cx - rw * 0.7) + ',' + (top - s * 0.35) + ' L' + (cx - rw * 0.8) + ',' + (top + s * 0.18) + ' Z', fill: o.hat === true ? '#9b2335' : o.hat }, g);
    return { eyeY: eyeY, noseY: noseY, mouthY: mouthY, top: top, rw: rw };
  }
  A._ui.faceEl = faceEl;
  V.register('ar-face', function (el, o) {
    var mode = o.mode || 'show';
    var F = frame(el, o, 'face', 'A face');
    if (mode === 'show' || mode === 'mood') {
      var s = svgRoot(200, 210, F.quiet ? 'A face' : 'A ' + A.MOODS[o.mood || 'happy'].name + ' face'); F.body.appendChild(s);
      var g = sv('g', null, s), mood = o.mood || 'happy';
      var paint = function () { while (g.firstChild) g.removeChild(g.firstChild); faceEl(g, Object.assign({}, o, { mood: mood }), 100, 92, 72); if (o.labels && !F.quiet) labelFace(g); };
      paint();
      if (mode === 'mood' && F.interactive) { var keys = o.moods || ['happy', 'sad', 'surprised', 'angry', 'sleepy']; chooser(F.ctl, keys.map(function (k) { return { key: k, html: esc(cap1(A.MOODS[k].name)) }; }), function (k) { mood = k; paint(); s.setAttribute('aria-label', 'A ' + A.MOODS[k].name + ' face'); F.say(F.quiet ? '' : feelNote(k)); }).set(mood); }
      return {};
    }
    if (mode === 'moods') {
      var ks = o.moods || ['happy', 'sad', 'surprised', 'angry'], grid = h('div', 'arl-grid'); grid.style.setProperty('--n', M.min(ks.length, 4)); F.body.appendChild(grid);
      ks.forEach(function (k, i) { var c = h('div', 'arl-card'), s2 = svgRoot(120, 130, F.quiet ? 'Face ' + letter(i) : 'A ' + A.MOODS[k].name + ' face'); faceEl(sv('g', null, s2), Object.assign({}, o, { mood: k, neck: false, age: o.age || 'kid' }), 60, 64, 52); c.appendChild(s2); c.appendChild(h('span', 'arl-lab' + (F.quiet ? ' arl-letter' : ''), F.quiet ? letter(i) : cap1(A.MOODS[k].name))); grid.appendChild(c); });
      return {};
    }
    if (mode === 'compare') { // eyes placed right and too high
      var good = o.good || 'B', row = h('div', 'ars-row'); F.body.appendChild(row);
      ['A', 'B'].forEach(function (L) { var c = h('div', 'ars-card'), s3 = svgRoot(200, 210, 'Face ' + L); faceEl(sv('g', null, s3), Object.assign({}, o, { eyes: L === good ? undefined : 0.33 }), 100, 92, 72); if (o.guides && !F.quiet) guideLines(sv('g', null, s3), 100, 92, 72); c.appendChild(s3); c.appendChild(h('span', 'arl-lab arl-letter', L)); row.appendChild(c); });
      if (!F.quiet) F.body.appendChild(h('p', 'arv-hint', 'In ' + good + ', the eyes sit about halfway down the head. In ' + (good === 'A' ? 'B' : 'A') + ', they are too high, so there is almost no forehead.'));
      return {};
    }
    if (mode === 'guide') return guideMode(el, o, F);
    if (mode === 'turn') {
      var views = o.views || ['front', 'three-quarter', 'profile'], row2 = h('div', 'ars-row'); F.body.appendChild(row2);
      views.forEach(function (v, i) { var c = h('div', 'ars-card'), s4 = svgRoot(180, 200, F.quiet ? 'Head ' + letter(i) : 'A head, ' + v + ' view'); headView(sv('g', null, s4), v, !F.quiet && o.lines !== false); c.appendChild(s4); c.appendChild(h('span', 'arl-lab' + (F.quiet ? ' arl-letter' : ''), F.quiet ? letter(i) : cap1(v) + ' view')); row2.appendChild(c); });
      return {};
    }
    if (mode === 'eye') {
      var good2 = o.good || 'B', row3 = h('div', 'ars-row'); F.body.appendChild(row3);
      ['A', 'B'].forEach(function (L) { var c = h('div', 'ars-card'), s5 = svgRoot(200, 110, 'Eye ' + L); eyeEl(s5, L === good2); c.appendChild(s5); c.appendChild(h('span', 'arl-lab arl-letter', L)); row3.appendChild(c); });
      if (!F.quiet) F.body.appendChild(h('p', 'arv-hint', 'In ' + good2 + ', the upper lid covers the top of the iris and casts a little shadow on the eyeball. In ' + (good2 === 'A' ? 'B' : 'A') + ', the whole iris floats in the white, which looks startled.'));
      return {};
    }
    return {};
  });
  function feelNote(k) { var m = A.MOODS[k]; return cap1(m.name) + ': the mouth ' + ({ up: 'curves up', down: 'curves down', round: 'is a round O', flat: 'is a flat line', wavy: 'wobbles', small: 'is small and soft' }[m.mouth]) + ', and the eyebrows ' + ({ relaxed: 'are relaxed', raised: 'go up high', down: 'slope down toward the nose', worried: 'tilt up in the middle' }[m.brows]) + (m.eyes === 'closed' ? ', with the eyes closed' : '') + '.'; }
  function labelFace(g) { [['eyes', 92 - 72 + 144 * 0.55], ['nose', 92 - 72 + 144 * 0.7], ['mouth', 92 - 72 + 144 * 0.8]].forEach(function (q) { sv('line', { x1: 130, y1: q[1], x2: 170, y2: q[1], class: 'arf-lead' }, g); txt(g, 172, q[1] + 4, q[0], { class: 'arf-lab' }); }); }
  function guideLines(g, cx, cy, s) { var top = cy - s, rw = s * 0.74; [['eyes', A.HEAD.eyes], ['nose', A.HEAD.noseBottom], ['mouth', A.HEAD.mouth]].forEach(function (q) { var y = top + 2 * s * q[1]; sv('line', { x1: cx - rw * 1.2, y1: y, x2: cx + rw * 1.2, y2: y, class: 'arf-guide' }, g); }); sv('line', { x1: cx - rw * 1.2, y1: cy, x2: cx + rw * 1.2, y2: cy, class: 'arf-half' }, g); }
  // the proportion guide: lines for the eyes, nose and mouth; learners drag the features onto them
  function guideMode(el, o, F) {
    var s = svgRoot(340, 260, 'An adult head with proportion guide lines'); F.body.appendChild(s);
    var cx = 120, cy = 128, sh = 110, top = cy - sh, rw = sh * 0.74, g = sv('g', null, s);
    sv('ellipse', { cx: cx, cy: cy, rx: rw, ry: sh, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 2.5 }, g);
    sv('line', { x1: cx, y1: top, x2: cx, y2: top + 2 * sh, class: 'arf-guide' }, g);
    var rows = [['top of head', 0], ['brows', A.HEAD.brows], ['eyes (halfway)', A.HEAD.eyes], ['nose', A.HEAD.noseBottom], ['mouth', A.HEAD.mouth], ['chin', 1]];
    rows.forEach(function (r) { var y = top + 2 * sh * r[1]; sv('line', { x1: cx - rw - 10, y1: y, x2: cx + rw + 10, y2: y, class: r[1] === A.HEAD.eyes ? 'arf-half' : 'arf-guide' }, g); if (!F.quiet && o.labels !== false) txt(g, cx + rw + 14, y + (r[1] === A.HEAD.brows ? -1 : r[1] === A.HEAD.eyes ? 9 : 4), r[0], { class: 'arf-lab' }); });
    // five eye widths across the eye line
    var ew = 2 * rw / 5; for (var i = 0; i <= 5; i++) sv('line', { x1: cx - rw + i * ew, y1: top + 2 * sh * A.HEAD.eyes - 6, x2: cx - rw + i * ew, y2: top + 2 * sh * A.HEAD.eyes + 6, class: 'arf-tick' }, g);
    var feats = [{ k: 'eyes', y: o.drag ? top + 30 : top + 2 * sh * A.HEAD.eyes, want: A.HEAD.eyes }, { k: 'nose', y: o.drag ? top + 2 * sh * 0.95 : top + 2 * sh * A.HEAD.noseBottom, want: A.HEAD.noseBottom }, { k: 'mouth', y: o.drag ? top + 2 * sh * 0.3 : top + 2 * sh * A.HEAD.mouth, want: A.HEAD.mouth }];
    var fg = feats.map(function (f) { var gg = sv('g', { class: o.drag ? 'arf-drag' : '', tabindex: o.drag ? 0 : null, role: o.drag ? 'slider' : null, 'aria-label': o.drag ? 'Move the ' + f.k + ' up or down' : null }, s); f.g = gg; drawFeat(f); return gg; });
    function drawFeat(f) {
      while (f.g.firstChild) f.g.removeChild(f.g.firstChild); var y = f.y;
      if (f.k === 'eyes') [-1, 1].forEach(function (sd) { sv('ellipse', { cx: cx + sd * ew, cy: y, rx: ew * 0.42, ry: ew * 0.22, fill: '#fff', stroke: '#5a4630', 'stroke-width': 1.5 }, f.g); sv('circle', { cx: cx + sd * ew, cy: y, r: ew * 0.17, fill: '#5b3a1e' }, f.g); sv('circle', { cx: cx + sd * ew, cy: y, r: ew * 0.08, fill: '#111' }, f.g); });
      if (f.k === 'nose') sv('path', { d: 'M' + (cx - ew * 0.45) + ',' + (y - 4) + ' Q' + (cx - ew * 0.2) + ',' + (y + 4) + ' ' + cx + ',' + (y + 1) + ' Q' + (cx + ew * 0.2) + ',' + (y + 4) + ' ' + (cx + ew * 0.45) + ',' + (y - 4), fill: 'none', stroke: '#c98a2a', 'stroke-width': 3, 'stroke-linecap': 'round' }, f.g);
      if (f.k === 'mouth') sv('path', { d: 'M' + (cx - ew * 0.8) + ',' + y + ' Q' + cx + ',' + (y + 9) + ' ' + (cx + ew * 0.8) + ',' + y, fill: 'none', stroke: '#8a3b2b', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, f.g);
      if (o.drag) sv('rect', { x: cx - rw * 0.8, y: y - 14, width: rw * 1.6, height: 28, fill: 'transparent' }, f.g);
    }
    if (o.drag && F.interactive) {
      var act = null;
      s.addEventListener('pointerdown', function (e) { var p = svgPt(s, e); act = null; feats.forEach(function (f) { if (M.abs(p.y - f.y) < 16 && M.abs(p.x - cx) < rw) act = f; }); if (act) { e.preventDefault(); s.setPointerCapture(e.pointerId); } });
      s.addEventListener('pointermove', function (e) { if (!act) return; act.y = M.max(top + 8, M.min(top + 2 * sh - 6, svgPt(s, e).y)); drawFeat(act); });
      s.addEventListener('pointerup', function () { act = null; });
      feats.forEach(function (f) { f.g.addEventListener('keydown', function (e) { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); f.y += e.key === 'ArrowUp' ? -3 : 3; drawFeat(f); } }); });
      btn(F.ctl, 'Check', function () { var off = feats.filter(function (f) { return M.abs((f.y - top) / (2 * sh) - f.want) > 0.035; }); F.say(off.length ? okMark(false) + ' Move the ' + off.map(function (f) { return f.k; }).join(' and the ') + '. ' + (off[0].k === 'eyes' ? 'The eyes go on the halfway line.' : off[0].k === 'nose' ? 'The nose ends halfway between the eyes and the chin.' : 'The mouth sits about a third of the way from the nose to the chin.') : okMark(true) + ' Each feature sits on its line.'); }, 'pri');
      btn(F.ctl, 'Show me', function () { feats.forEach(function (f) { f.y = top + 2 * sh * f.want; drawFeat(f); }); F.say('Eyes halfway down; the nose halfway from the eyes to the chin; the mouth a third of the way from the nose to the chin.'); });
    }
    if (!F.quiet && !o.drag && o.rules !== false) F.body.appendChild(h('ul', 'arf-rules', A.HEAD.rules.slice(0, 5).map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('')));
    return {};
  }
  function headView(g, v, lines) {
    var cx = 90, cy = 100, s = 74, rw = s * 0.74;
    if (v === 'front') { faceEl(g, { mood: 'neutral', neck: false }, cx, cy, s); if (lines) { sv('line', { x1: cx, y1: cy - s, x2: cx, y2: cy + s, class: 'arf-guide' }, g); sv('line', { x1: cx - rw, y1: cy, x2: cx + rw, y2: cy, class: 'arf-guide' }, g); } return; }
    if (v === 'three-quarter') {
      sv('ellipse', { cx: cx + rw * 0.85, cy: cy + s * 0.02, rx: rw * 0.12, ry: s * 0.16, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 2 }, g);
      sv('ellipse', { cx: cx, cy: cy, rx: rw * 0.95, ry: s, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 2.5 }, g);
      sv('path', { d: 'M' + (cx - rw * 0.95) + ',' + (cy - s * 0.45) + ' Q' + (cx - rw) + ',' + (cy - s * 1.1) + ' ' + cx + ',' + (cy - s * 1.04) + ' Q' + (cx + rw * 1.05) + ',' + (cy - s * 1.05) + ' ' + (cx + rw * 0.95) + ',' + (cy - s * 0.3) + ' Q' + (cx + rw * 0.3) + ',' + (cy - s * 0.75) + ' ' + (cx - rw * 0.95) + ',' + (cy - s * 0.45) + ' Z', fill: HAIR.short }, g);
      var c0 = cx - rw * 0.32; // center line, curved toward the far side
      if (lines) sv('path', { d: 'M' + (cx - rw * 0.1) + ',' + (cy - s) + ' Q' + (c0 - rw * 0.25) + ',' + cy + ' ' + (cx - rw * 0.1) + ',' + (cy + s), class: 'arf-guide', fill: 'none' }, g);
      sv('ellipse', { cx: c0 - rw * 0.42, cy: cy, rx: rw * 0.1, ry: s * 0.05, fill: '#2b2b2b' }, g); sv('ellipse', { cx: c0 + rw * 0.42, cy: cy, rx: rw * 0.17, ry: s * 0.065, fill: '#2b2b2b' }, g);
      sv('path', { d: 'M' + (c0 - rw * 0.05) + ',' + (cy + s * 0.05) + ' L' + (c0 - rw * 0.2) + ',' + (cy + s * 0.48) + ' L' + (c0 + rw * 0.05) + ',' + (cy + s * 0.5), fill: 'none', stroke: SKIN_LINE, 'stroke-width': 2.5 }, g);
      sv('path', { d: 'M' + (c0 - rw * 0.25) + ',' + (cy + s * 0.68) + ' Q' + (c0 + rw * 0.05) + ',' + (cy + s * 0.76) + ' ' + (c0 + rw * 0.35) + ',' + (cy + s * 0.66), fill: 'none', stroke: '#8a3b2b', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      return;
    }
    // profile, facing left
    sv('path', { d: 'M' + (cx + rw * 0.95) + ',' + (cy - s * 0.2) + ' Q' + (cx + rw * 1.05) + ',' + (cy - s * 1.05) + ' ' + cx + ',' + (cy - s) + ' Q' + (cx - rw * 0.75) + ',' + (cy - s * 0.95) + ' ' + (cx - rw * 0.8) + ',' + (cy - s * 0.2) + ' L' + (cx - rw * 0.98) + ',' + (cy + s * 0.48) + ' L' + (cx - rw * 0.78) + ',' + (cy + s * 0.52) + ' Q' + (cx - rw * 0.82) + ',' + (cy + s * 0.75) + ' ' + (cx - rw * 0.7) + ',' + (cy + s * 0.95) + ' Q' + (cx - rw * 0.2) + ',' + (cy + s * 1.08) + ' ' + (cx + rw * 0.25) + ',' + (cy + s * 0.75) + ' Q' + (cx + rw * 0.9) + ',' + (cy + s * 0.5) + ' ' + (cx + rw * 0.95) + ',' + (cy - s * 0.2) + ' Z', fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 2.5 }, g);
    sv('path', { d: 'M' + (cx + rw * 0.98) + ',' + (cy + s * 0.1) + ' Q' + (cx + rw * 1.05) + ',' + (cy - s * 1.08) + ' ' + cx + ',' + (cy - s * 1.03) + ' Q' + (cx - rw * 0.8) + ',' + (cy - s * 0.95) + ' ' + (cx - rw * 0.7) + ',' + (cy - s * 0.55) + ' Q' + (cx + rw * 0.2) + ',' + (cy - s * 0.65) + ' ' + (cx + rw * 0.5) + ',' + (cy - s * 0.2) + ' Z', fill: HAIR.short }, g);
    sv('ellipse', { cx: cx + rw * 0.12, cy: cy + s * 0.18, rx: rw * 0.16, ry: s * 0.24, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 2 }, g);
    sv('ellipse', { cx: cx - rw * 0.55, cy: cy, rx: rw * 0.06, ry: s * 0.06, fill: '#2b2b2b' }, g);
    sv('path', { d: 'M' + (cx - rw * 0.86) + ',' + (cy + s * 0.72) + ' L' + (cx - rw * 0.66) + ',' + (cy + s * 0.72), stroke: '#8a3b2b', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    if (lines) { sv('line', { x1: cx, y1: cy - s, x2: cx, y2: cy + s, class: 'arf-guide' }, g); txt(g, cx + 4, cy - s * 0.85, 'middle', { class: 'arf-lab arf-small' }); }
  }
  function eyeEl(s, good) {
    var id = 'areye' + (++natN), shape = 'M30,58 Q100,8 170,58 Q100,104 30,58 Z', cp = sv('clipPath', { id: id }, sv('defs', null, s)); sv('path', { d: shape }, cp);
    sv('path', { d: 'M24,52 Q100,-2 176,52', fill: 'none', stroke: SKIN_LINE, 'stroke-width': 3, 'stroke-linecap': 'round' }, s); // the lid crease
    sv('path', { d: shape, fill: '#fff' }, s);
    var gI = sv('g', { 'clip-path': 'url(#' + id + ')' }, s), cy = good ? 50 : 60, r = good ? 23 : 17;
    sv('circle', { cx: 100, cy: cy, r: r, fill: '#6a8f4e' }, gI); sv('circle', { cx: 100, cy: cy, r: r * 0.42, fill: '#111' }, gI); sv('circle', { cx: 107, cy: cy - 6, r: 3.5, fill: '#fff' }, gI);
    if (good) sv('path', { d: 'M30,58 Q100,8 170,58 Q100,26 30,58 Z', fill: 'rgba(90,60,30,.28)' }, gI); // the upper lid's shadow on the eyeball
    sv('path', { d: shape, fill: 'none', stroke: '#6b5a3a', 'stroke-width': 2.5 }, s);
    sv('path', { d: 'M30,58 Q100,8 170,58', fill: 'none', stroke: '#3a2a1a', 'stroke-width': 4, 'stroke-linecap': 'round' }, s);
    sv('path', { d: 'M22,28 Q100,-10 178,26', fill: 'none', stroke: '#5b3a1e', 'stroke-width': 6, 'stroke-linecap': 'round' }, s);
  }


  /* ---------- ar-value: value scales (show, order, missing step), pencil grades, color versus value, key and contrast ---------- */
  V.register('ar-value', function (el, o) {
    var mode = o.mode || 'show', F = frame(el, o, 'value', 'A value scale');
    if (mode === 'pencils') {
      var list = o.grades || A.PENCILS.map(function (p) { return p[0]; }), order = o.shuffle ? shuffle(list, o.shuffle) : list, s = svgRoot(340, 12 + order.length * 30, 'Pencil grades and the lines they make');
      F.body.appendChild(s);
      order.forEach(function (gname, i) {
        var y = 26 + i * 30, v = (A.PENCILS[A.pencilRank(gname)] || [0, 0.5])[1], gray = M.round(255 * (1 - v));
        sv('rect', { x: 6, y: y - 9, width: 70, height: 18, rx: 3, fill: '#2f7d4f' }, s); sv('polygon', { points: '76,' + (y - 9) + ' 96,' + y + ' 76,' + (y + 9), fill: '#e8c48a' }, s); sv('polygon', { points: '91,' + (y - 2.5) + ' 96,' + y + ' 91,' + (y + 2.5), fill: '#333' }, s);
        txt(s, 41, y + 5, F.quiet && o.hideNames ? letter(i) : gname, { class: 'arv-pencil', 'text-anchor': 'middle' });
        var d = 'M110,' + y; for (var k = 1; k <= 40; k++) d += ' L' + (110 + k * 5.5) + ',' + (y + M.sin(k * 0.9) * 5).toFixed(1);
        sv('path', { d: d, fill: 'none', stroke: 'rgb(' + gray + ',' + gray + ',' + gray + ')', 'stroke-width': 2 + v * 3, 'stroke-linecap': 'round' }, s);
        if (o.letters) txt(s, 336, y + 5, letter(i), { class: 'arv-letter', 'text-anchor': 'end' });
      });
      if (!F.quiet) F.body.appendChild(h('p', 'arv-hint', 'H means hard: lighter, finer lines. B means black (soft): darker, smudgier lines. HB and F sit in the middle. The bigger the number, the stronger the effect.'));
      return {};
    }
    var n = o.steps || 7, scale = A.valueScale(n);
    if (o.hue) scale = scale.map(function (g, i) { var L = 1 - i / (n - 1); return L > 0.5 ? A.tint(o.hue, (L - 0.5) * 2 * 0.95) : A.shade(o.hue, (0.5 - L) * 2 * 0.9); });
    var colors = o.colors; // swatches of color to compare with their values
    if (mode === 'gray' || colors) {
      colors = colors || ['#e03127', '#3aa64a', '#2160b8', '#fde13a', '#7b3294', '#f5871f'];
      var gray = !!o.gray, row = h('div', 'arv-swatches'); F.body.appendChild(row);
      var draw = function () { row.innerHTML = ''; colors.forEach(function (c, i) { var sw = h('div', 'arv-sw'); sw.style.background = gray ? A.grayOf(c) : c; sw.setAttribute('role', 'img'); sw.setAttribute('aria-label', (o.letters || F.quiet ? 'Swatch ' + letter(i) : 'A color swatch') + (gray ? ' shown in gray' : '')); if (o.letters || F.quiet) sw.appendChild(h('span', 'arv-swl', letter(i))); row.appendChild(sw); }); };
      draw();
      if (F.interactive && o.toggle !== false) { var tb = btn(F.ctl, gray ? 'Show in color' : 'Show in gray (value only)', function () { gray = !gray; tb.textContent = gray ? 'Show in color' : 'Show in gray (value only)'; draw(); }); }
      return {};
    }
    if (mode === 'key') {
      var keys = o.keys || ['high', 'low', 'contrast'], row2 = h('div', 'arv-keys'); F.body.appendChild(row2);
      keys.forEach(function (k, i) { var c = h('div', 'arl-card'), s2 = svgRoot(150, 110, F.quiet ? 'Picture ' + letter(i) : (k === 'high' ? 'A high-key picture' : k === 'low' ? 'A low-key picture' : k === 'contrast' ? 'A high-contrast picture' : 'A low-contrast picture')); keyPic(s2, k); c.appendChild(s2); c.appendChild(h('span', 'arl-lab' + (F.quiet ? ' arl-letter' : ''), F.quiet ? letter(i) : ({ high: 'High key', low: 'Low key', contrast: 'High contrast', flat: 'Low contrast' }[k]))); row2.appendChild(c); });
      return {};
    }
    var order = mode === 'order' ? derange(n, 'v' + n + (o.seed || '')) : scale.map(function (x, i) { return i; });
    if (o.order) order = o.order.slice();
    var miss = mode === 'missing' ? (o.missing !== undefined ? o.missing : M.floor(n / 2)) : -1;
    var strip = h('div', 'arv-strip'); strip.style.setProperty('--n', n); F.body.appendChild(strip);
    var sel = -1, cells = [];
    function paint(mark) {
      strip.innerHTML = ''; cells = [];
      order.forEach(function (vi, pos) {
        var c = h(mode === 'order' && F.interactive && !F.quiet ? 'button' : 'div', 'arv-cell');
        if (c.tagName === 'BUTTON') { c.type = 'button'; c.setAttribute('aria-pressed', String(sel === pos)); c.addEventListener('click', function () { if (sel < 0) { sel = pos; paint(); } else { var t = order[sel]; order[sel] = order[pos]; order[pos] = t; sel = -1; paint(); F.say(''); } }); }
        if (vi === miss) { c.classList.add('arv-miss'); c.innerHTML = '<span>?</span>'; }
        else c.style.background = scale[vi];
        var lab = o.numbers === false ? '' : mode === 'order' || o.letters ? letter(vi) : String(pos + 1);
        if (mode === 'order') lab = letter(pos);
        if (lab && vi !== miss) c.appendChild(h('span', 'arv-num' + (A.lightness(scale[vi]) < 55 ? ' on-dark' : ''), lab));
        c.setAttribute('aria-label', (vi === miss ? 'Missing step' : 'Step ' + (pos + 1)) + (mark ? (vi === pos ? ', in place' : ', out of place') : ''));
        if (mark) c.classList.add(vi === pos ? 'ok' : 'no');
        strip.appendChild(c); cells.push(c);
      });
    }
    paint();
    if (!F.quiet && mode === 'show' && o.ends !== false) F.body.appendChild(h('p', 'arv-ends', '<span>' + (o.hue ? 'tints (lighter)' : 'white') + '</span><span>' + (o.hue ? 'shades (darker)' : 'black') + '</span>'));
    if (mode === 'order' && F.interactive && !F.quiet) {
      F.body.insertBefore(h('p', 'arv-hint', 'Tap one box, then another, to swap them. Put them in order from lightest to darkest.'), strip);
      btn(F.ctl, 'Check', function () { var wrong = order.filter(function (v, p) { return v !== p; }).length; paint(true); F.say(wrong ? okMark(false) + ' ' + plural(wrong, 'box is', 'boxes are') + ' out of place. Squint: each box should be a little darker than the one on its left.' : okMark(true) + ' Lightest to darkest, in even steps.'); }, 'pri');
      btn(F.ctl, 'Show me', function () { order = scale.map(function (x, i) { return i; }); sel = -1; paint(true); F.say('Each step is the same jump in value.'); });
    }
    if (mode === 'missing' && o.choices && F.interactive && !F.quiet) {
      var opts = o.choices.map(function (v) { return { key: String(v), html: '<span class="arv-chipsw" style="background:' + scale[v] + '"></span>' }; });
      var ch = chooser(F.ctl, opts, function (k) { ch.clear(); var good = +k === miss; ch.mark(k, good); F.say(good ? okMark(true) + ' That fits between its neighbors.' : okMark(false) + ' Compare it with the boxes on each side: it should be halfway between them.'); });
    }
    return { order: function () { return order.slice(); } };
  });
  function keyPic(s, k) { // a small landscape in a high key, low key, high or low contrast
    var pal = { high: ['#f4f4f2', '#e2e2df', '#cfcfcb', '#b8b8b4', '#9a9a96'], low: ['#5a5a58', '#454543', '#333331', '#242423', '#151514'], contrast: ['#f7f7f5', '#d0d0cc', '#2a2a29', '#141413', '#f2f2ef'], flat: ['#9a9a97', '#8d8d8a', '#83837f', '#787875', '#a2a29f'] }[k];
    sv('rect', { x: 0, y: 0, width: 150, height: 110, fill: pal[0] }, s); sv('circle', { cx: 112, cy: 28, r: 12, fill: pal[4] }, s);
    sv('path', { d: 'M0,70 Q40,40 80,64 Q115,42 150,60 L150,110 L0,110 Z', fill: pal[1] }, s);
    sv('path', { d: 'M0,88 Q70,72 150,92 L150,110 L0,110 Z', fill: pal[2] }, s);
    sv('rect', { x: 34, y: 52, width: 6, height: 30, fill: pal[3] }, s); sv('circle', { cx: 37, cy: 48, r: 13, fill: pal[3] }, s);
  }

  /* ---------- ar-marks: shading techniques and texture marks (canvas) ---------- */
  function markSwatch(ctx, kind, x, y, w, hh, dens, R, ink) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, hh); ctx.clip(); ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineCap = 'round';
    var i, n, sp = M.max(2.2, 14 - dens * 11);
    function hatch(angle, spacing, lw) { ctx.lineWidth = lw; var c = M.cos(angle), s = M.sin(angle), L = w + hh; ctx.beginPath(); for (var t = -L; t < L; t += spacing) { var cx = x + w / 2 + -s * t, cy = y + hh / 2 + c * t, j = (R() - 0.5) * 1.2; ctx.moveTo(cx - c * L + j, cy - s * L); ctx.lineTo(cx + c * L + j, cy + s * L); } ctx.stroke(); }
    switch (kind) {
      case 'hatching': hatch(-M.PI / 4, sp, 1.3); break;
      case 'crosshatching': hatch(-M.PI / 4, sp * 1.3, 1.2); if (dens > 0.25) hatch(M.PI / 4, sp * 1.3, 1.2); if (dens > 0.6) hatch(0, sp * 1.5, 1); break;
      case 'stippling': n = M.round(w * hh / 40 * (0.2 + dens * 2.2)); for (i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(x + R() * w, y + R() * hh, 1.1, 0, 7); ctx.fill(); } break;
      case 'blending': var gr = ctx.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, 'rgba(40,40,40,' + (0.08 + dens * 0.2) + ')'); gr.addColorStop(1, 'rgba(40,40,40,' + (0.25 + dens * 0.6) + ')'); ctx.fillStyle = gr; ctx.fillRect(x, y, w, hh); break;
      case 'scribbling': ctx.lineWidth = 1; ctx.beginPath(); var px = x + 6, py = y + hh / 2; ctx.moveTo(px, py); n = M.round(60 + dens * 260); for (i = 0; i < n; i++) { px = M.max(x, M.min(x + w, px + (R() - 0.48) * 22)); py = M.max(y, M.min(y + hh, py + (R() - 0.5) * 22)); ctx.lineTo(px, py); } ctx.stroke(); break;
      case 'contour': ctx.lineWidth = 1.3; for (i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(x + w * 1.1, y + hh * 1.2, 18 + i * sp, M.PI, M.PI * 1.5); ctx.stroke(); } break;
      case 'fur': ctx.lineWidth = 1.2; for (i = 0; i < 420; i++) { var fx = x + R() * w, fy = y + R() * hh; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + 3 + R() * 3, fy + 7 + R() * 5); ctx.stroke(); } break;
      case 'wood': ctx.lineWidth = 1.2; for (i = 0; i < 14; i++) { ctx.beginPath(); for (var k = 0; k <= 40; k++) { var xx = x + k / 40 * w, yy = y + i * hh / 13 + M.sin(k / 6 + i) * 3 + (M.abs(k - 20) < 6 && i > 5 && i < 9 ? (6 - M.abs(k - 20)) * (i - 7) : 0); k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); } break;
      case 'sand': for (i = 0; i < 520; i++) { ctx.beginPath(); ctx.arc(x + R() * w, y + R() * hh, R() * 1.1 + 0.3, 0, 7); ctx.fill(); } break;
      case 'brick': ctx.lineWidth = 1.4; var bh = hh / 6; for (i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x, y + i * bh); ctx.lineTo(x + w, y + i * bh); ctx.stroke(); for (var b = (i % 2) * 20; b < w; b += 40) { ctx.beginPath(); ctx.moveTo(x + b, y + i * bh); ctx.lineTo(x + b, y + (i + 1) * bh); ctx.stroke(); } } break;
      case 'scales': ctx.lineWidth = 1.3; for (var r2 = 0; r2 < hh / 12 + 1; r2++) for (i = -1; i < w / 18 + 1; i++) { ctx.beginPath(); ctx.arc(x + i * 18 + (r2 % 2) * 9, y + r2 * 12, 9, 0, M.PI); ctx.stroke(); } break;
      case 'grass': ctx.lineWidth = 1.3; for (i = 0; i < 160; i++) { var gx = x + R() * w, gy = y + 10 + R() * hh; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.quadraticCurveTo(gx + 1, gy - 8, gx + (R() - 0.5) * 8, gy - 12 - R() * 6); ctx.stroke(); } break;
      case 'water': ctx.lineWidth = 1.2; for (i = 0; i < 18; i++) { var wy = y + 4 + i * hh / 18, wx = x + R() * w * 0.4; ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + w * (0.3 + R() * 0.6), wy); ctx.stroke(); } break;
      case 'stone': ctx.lineWidth = 1.2; for (i = 0; i < 40; i++) { var sx = x + R() * w, sy = y + R() * hh; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (R() - 0.5) * 16, sy + (R() - 0.5) * 10); ctx.stroke(); } for (i = 0; i < 120; i++) { ctx.beginPath(); ctx.arc(x + R() * w, y + R() * hh, R() * 1.6, 0, 7); ctx.fill(); } break;
    }
    ctx.restore();
  }
  V.register('ar-marks', function (el, o) {
    var F = frame(el, o, 'marks', 'Mark-making');
    var kinds = o.kinds || (o.texture ? ['fur', 'wood', 'sand', 'brick'] : ['hatching', 'crosshatching', 'stippling', 'blending']);
    var grid = h('div', 'arl-grid'); grid.style.setProperty('--n', M.min(kinds.length, o.columns || 4)); if (kinds.length === 1) grid.style.maxWidth = '380px', grid.style.margin = '0 auto'; F.body.appendChild(grid);
    var dens = o.density === undefined ? 0.55 : o.density, cvs = [];
    kinds.forEach(function (k, i) {
      var info = A.MARKS[k] || A.TEXTURES[k] || { name: k }, card = h('div', 'arl-card'), cv = h('canvas', 'arm-cv'); cv.width = 480; cv.height = 360; cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', F.quiet ? 'Swatch ' + letter(i) : info.name + ' swatch'); card.appendChild(cv);
      card.appendChild(h('span', 'arl-lab' + (F.quiet ? ' arl-letter' : ''), F.quiet ? letter(i) : cap1(info.name) + (o.desc === false ? '' : '<small>' + esc(info.desc || info.mark || '') + '</small>')));
      grid.appendChild(card); cvs.push({ k: k, cv: cv });
    });
    function draw() { cvs.forEach(function (c, i) { var ctx = c.cv.getContext('2d'); ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, 240, 180); ctx.fillStyle = '#fffdf7'; ctx.fillRect(0, 0, 240, 180); if (o.ramp) { for (var j = 0; j < 5; j++) markSwatch(ctx, c.k, j * 48, 0, 48, 180, 0.1 + j * 0.22, seeded(c.k + j), '#2a2724'); } else markSwatch(ctx, c.k, 0, 0, 240, 180, dens, seeded(c.k + (o.seed || '')), '#2a2724'); }); }
    draw();
    if (o.slider && F.interactive && V.slider) V.slider(F.ctl, { label: 'Darker: more and closer marks', min: 0, max: 1, step: 0.05, value: dens, fmt: function (v) { return M.round(v * 100) + '%'; }, input: function (v) { dens = v; draw(); } });
    return {};
  });

  /* ---------- ar-shade: a sphere, cube, cylinder or cone under a movable light ---------- */
  V.register('ar-shade', function (el, o) {
    var F = frame(el, o, 'shade', 'Light and shadow on a form');
    var form = o.form || 'sphere', ang = (o.light === undefined ? 135 : o.light) * M.PI / 180; // light direction, degrees: 0 = from the right, 90 = from above, 180 = from the left
    if (o.kid) return kidShadow(el, o, F);
    var c = V.canvas(F.body, { aspect: o.aspect || 1.45, max: 420 }), ctx = c.ctx;
    c.cv.setAttribute('role', 'img');
    var parts = o.parts || (form === 'sphere' ? ['highlight', 'light', 'core', 'reflected', 'cast'] : []);
    var letters = o.labels === 'letters' || F.quiet, order = o.order || parts, pickable = o.target && F.interactive && !F.quiet, chosen = null, hits = [];
    function draw() {
      var w = c.w, hh = c.h, k = V.colors(), r = M.min(w, hh) * 0.27, cx = w * 0.5, cy = hh * 0.45, gy = cy + r, lx = M.cos(ang), ly = -M.sin(ang);
      ctx.clearRect(0, 0, w, hh); ctx.fillStyle = isDark() ? '#2b302d' : '#f3efe6'; ctx.fillRect(0, 0, w, hh);
      ctx.fillStyle = isDark() ? '#3a403b' : '#e2dccd'; ctx.fillRect(0, gy, w, hh - gy); // table
      // the light: a small sun
      var sx = cx + lx * r * 2.3, sy = cy + ly * r * 2.0; ctx.fillStyle = '#f6c445'; ctx.beginPath(); ctx.arc(sx, M.max(14, sy), 11, 0, 7); ctx.fill(); ctx.strokeStyle = '#f6c445'; ctx.lineWidth = 2; for (var q = 0; q < 8; q++) { var a = q * M.PI / 4; ctx.beginPath(); ctx.moveTo(sx + M.cos(a) * 15, M.max(14, sy) + M.sin(a) * 15); ctx.lineTo(sx + M.cos(a) * 20, M.max(14, sy) + M.sin(a) * 20); ctx.stroke(); }
      hits = [];
      // cast shadow on the table, away from the light
      var shx = cx - lx * r * 1.15, slen = r * (1.1 + 0.9 * M.max(0, 1 - M.abs(ly)));
      var cg = ctx.createRadialGradient(cx - lx * r * 0.2, gy, r * 0.1, shx, gy, slen * 1.15);
      cg.addColorStop(0, 'rgba(25,20,15,.62)'); cg.addColorStop(1, 'rgba(25,20,15,0)'); ctx.fillStyle = cg;
      ctx.beginPath(); ctx.ellipse(shx, gy + r * 0.06, slen, r * 0.22, 0, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(15,12,10,.75)'; ctx.beginPath(); ctx.ellipse(cx, gy, r * 0.5, r * 0.07, 0, 0, 7); ctx.fill(); // contact (occlusion) shadow
      var castPt = [shx - lx * slen * 0.35, gy + r * 0.08];
      if (form === 'sphere') {
        var hlx = cx + lx * r * 0.45, hly = cy + ly * r * 0.45;
        var gr = ctx.createRadialGradient(hlx, hly, r * 0.05, cx - lx * r * 0.15, cy - ly * r * 0.15, r * 1.25);
        gr.addColorStop(0, '#fbfaf6'); gr.addColorStop(0.3, '#d9d3c6'); gr.addColorStop(0.62, '#8f877a'); gr.addColorStop(0.8, '#4d473f'); gr.addColorStop(1, '#6a6359');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
        // reflected light: a lighter rim on the shadow side, from the table
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip(); var rg = ctx.createRadialGradient(cx - lx * r * 1.05, cy + r * 0.9, 0, cx - lx * r * 1.05, cy + r * 0.9, r * 0.7); rg.addColorStop(0, 'rgba(160,150,135,.55)'); rg.addColorStop(1, 'rgba(160,150,135,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, w, hh); ctx.restore();
        ctx.strokeStyle = 'rgba(40,35,30,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
        var P = { highlight: [hlx, hly], light: [cx + lx * r * 0.62 - ly * r * 0.25, cy + ly * r * 0.62 + lx * r * 0.2], halftone: [cx + lx * r * 0.05 + ly * 0.3 * r, cy + ly * r * 0.05], core: [cx - lx * r * 0.55, cy - ly * r * 0.55], reflected: [cx - lx * r * 0.86, cy - ly * r * 0.6 + r * 0.25], cast: castPt, occlusion: [cx + r * 0.42, gy + 2] };
        if (P.core[1] > cy + r * 0.3) P.core[1] = cy + r * 0.3;
        labelParts(P, w, hh);
      } else if (form === 'cube') {
        var s = r * 1.15, x0 = cx - s * 0.75, y0 = gy - s, dx = s * 0.55, dy = s * 0.35;
        var top = lightFor(0.9 * M.max(0.2, -ly + 0.35)), left = lightFor(lx < 0 ? 0.85 : 0.35), right = lightFor(lx < 0 ? 0.3 : 0.85);
        poly([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]], left); poly([[x0 + s, y0], [x0 + s + dx, y0 - dy], [x0 + s + dx, y0 - dy + s], [x0 + s, y0 + s]], right); poly([[x0, y0], [x0 + dx, y0 - dy], [x0 + s + dx, y0 - dy], [x0 + s, y0]], top);
        labelParts({ top: [x0 + s * 0.6, y0 - dy * 0.5], front: [x0 + s * 0.5, y0 + s * 0.5], side: [x0 + s + dx * 0.5, y0 + s * 0.4], cast: castPt }, w, hh);
      } else if (form === 'cylinder' || form === 'cone') {
        var rw = r * 0.8, top2 = gy - r * 2.0, gx = ctx.createLinearGradient(cx - rw, 0, cx + rw, 0), lit = lx >= 0;
        var stops = lit ? [[0, '#6a6359'], [0.15, '#4d473f'], [0.45, '#9a9285'], [0.78, '#f2efe8'], [1, '#c9c2b4']] : [[0, '#c9c2b4'], [0.22, '#f2efe8'], [0.55, '#9a9285'], [0.85, '#4d473f'], [1, '#6a6359']];
        stops.forEach(function (st) { gx.addColorStop(st[0], st[1]); }); ctx.fillStyle = gx;
        ctx.beginPath(); if (form === 'cylinder') { ctx.moveTo(cx - rw, top2); ctx.lineTo(cx - rw, gy); ctx.ellipse(cx, gy, rw, rw * 0.28, 0, M.PI, 0, true); ctx.lineTo(cx + rw, top2); ctx.closePath(); } else { ctx.moveTo(cx, top2 - r * 0.2); ctx.lineTo(cx - rw, gy); ctx.ellipse(cx, gy, rw, rw * 0.28, 0, M.PI, 0, true); ctx.closePath(); } ctx.fill();
        if (form === 'cylinder') { ctx.fillStyle = '#e4dfd4'; ctx.beginPath(); ctx.ellipse(cx, top2, rw, rw * 0.28, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(40,35,30,.4)'; ctx.stroke(); }
        labelParts({ light: [cx + (lit ? 1 : -1) * rw * 0.45, gy - r], core: [cx + (lit ? -1 : 1) * rw * 0.62, gy - r * 0.8], cast: castPt }, w, hh);
      }
      c.cv.setAttribute('aria-label', 'A ' + form + ' lit from the ' + dirName(ang) + (letters ? ', with lettered parts' : ''));
    }
    function lightFor(t) { var v = M.round(70 + t * 170); return 'rgb(' + v + ',' + (v - 4) + ',' + (v - 12) + ')'; }
    function poly(pts, fill) { ctx.fillStyle = fill; ctx.beginPath(); pts.forEach(function (p, i) { ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(40,35,30,.45)'; ctx.lineWidth = 1; ctx.stroke(); }
    function labelParts(P, w, hh) {
      var list = order.filter(function (k) { return P[k]; }), placed = [];
      list.forEach(function (k, i) {
        var p = P[k], lab = letters ? letter(i) : (A.LIGHT_PARTS[k] || k), tx = p[0] + (p[0] < w / 2 ? -1 : 1) * M.min(110, w * 0.2), ty = p[1] - 10;
        ctx.font = '600 13px system-ui,sans-serif'; var tw = ctx.measureText(lab).width + 10;
        tx = M.max(tw / 2 + 3, M.min(w - tw / 2 - 3, tx)); ty = M.max(13, M.min(hh - 13, ty));   // the whole label stays inside the picture
        if (!letters) {   // move a label up or down until it does not cover one already placed
          var clash = function (y) { return y < 12 || y > hh - 12 || placed.some(function (q) { return M.abs(q[0] - tx) < (q[2] + tw) / 2 + 2 && M.abs(q[1] - y) < 23; }); };
          for (var tryN = 1, y0 = ty; clash(ty) && tryN < 12; tryN++) ty = y0 + (tryN % 2 ? 1 : -1) * M.ceil(tryN / 2) * 12;
          if (clash(ty)) ty = y0;
          placed.push([tx, ty, tw]);
        }
        if (letters) { tx = p[0]; ty = p[1]; }
        else { ctx.strokeStyle = isDark() ? '#e6ece8' : '#1d2320'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(tx, ty); ctx.stroke(); }
        ctx.fillStyle = chosen === k ? '#b8197f' : (isDark() ? '#14211a' : '#ffffff'); ctx.strokeStyle = '#b8197f'; ctx.lineWidth = 1.5;
        roundRect(ctx, tx - tw / 2, ty - 10, tw, 20, 9); ctx.fill(); ctx.stroke();
        ctx.fillStyle = chosen === k ? '#fff' : (isDark() ? '#e6ece8' : '#1d2320'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab, tx, ty + 0.5);
        hits.push({ k: k, x: tx, y: ty, w: tw });
      });
    }
    draw(); c.onResize(draw); F.redraw.push(draw);
    if (F.interactive && o.drag !== false && !o.target) {
      c.cv.style.cursor = 'grab';
      V.drag(c.cv, { hit: function () { return 1; }, move: function (hd, px, py) { ang = M.atan2(-(py - c.h * 0.45), px - c.w * 0.5); draw(); F.say(F.quiet ? '' : 'Light from the ' + dirName(ang) + '. The core shadow and the cast shadow swing to the other side.'); } });
      if (!F.quiet) F.body.appendChild(h('p', 'arv-hint', 'Drag anywhere in the picture to move the light.'));
    }
    if (pickable) {
      c.cv.addEventListener('click', function (e) { var r = c.cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, best = null; hits.forEach(function (hh) { if (M.abs(x - hh.x) < hh.w / 2 + 6 && M.abs(y - hh.y) < 14) best = hh.k; }); if (best) { chosen = best; draw(); F.say(''); } });
      btn(F.ctl, 'Check', function () { if (!chosen) { F.say('Tap a label first.'); return; } F.say(chosen === o.target ? okMark(true) + ' Right: ' + A.LIGHT_PARTS[o.target] + '.' : okMark(false) + ' That is the ' + (A.LIGHT_PARTS[chosen] || chosen) + '.'); }, 'pri');
    }
    return { angle: function () { return ang * 180 / M.PI; } };
  });
  function roundRect(ctx, x, y, w, hh, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + hh, r); ctx.arcTo(x + w, y + hh, x, y + hh, r); ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function dirName(a) { var d = ((a * 180 / M.PI) % 360 + 360) % 360; return d < 22.5 || d >= 337.5 ? 'right' : d < 67.5 ? 'upper right' : d < 112.5 ? 'top' : d < 157.5 ? 'upper left' : d < 202.5 ? 'left' : d < 247.5 ? 'lower left' : d < 292.5 ? 'bottom' : 'lower right'; }
  A.lightDir = function (deg) { return dirName(deg * M.PI / 180); };
  // young artists: where does the shadow go? A tree (or a ball) and the sun, with shadows A and B
  function kidShadow(el, o, F) {
    var thing = o.thing || 'tree', sunLeft = o.sun !== 'right', good = o.good || 'B', s = svgRoot(320, 190, 'The sun on the ' + (sunLeft ? 'left' : 'right') + ' and a ' + thing + (o.choices === false ? '' : ', with two shadows, A and B'));
    F.body.appendChild(s);
    sv('rect', { x: 0, y: 0, width: 320, height: 130, fill: '#bfe3fb' }, s); sv('rect', { x: 0, y: 128, width: 320, height: 62, fill: '#8fcf7f' }, s);
    var sx = sunLeft ? 40 : 280; sv('circle', { cx: sx, cy: 34, r: 20, fill: '#f6c445' }, s);
    for (var q = 0; q < 8; q++) { var a = q * M.PI / 4; sv('line', { x1: sx + M.cos(a) * 25, y1: 34 + M.sin(a) * 25, x2: sx + M.cos(a) * 33, y2: 34 + M.sin(a) * 33, stroke: '#f6c445', 'stroke-width': 4, 'stroke-linecap': 'round' }, s); }
    var shadowRight = sunLeft; // the true shadow side
    var Aright = good === 'A' ? shadowRight : !shadowRight;
    if (o.choices !== false) {
      [['A', Aright], ['B', !Aright]].forEach(function (pair) { var right = pair[1], cx = right ? 214 : 106; sv('ellipse', { cx: cx, cy: 146, rx: 52, ry: 9, fill: 'rgba(40,60,40,.45)' }, s); txt(s, cx + (right ? 40 : -40), 176, pair[0], { class: 'ark-letter', 'text-anchor': 'middle' }); });
    } else sv('ellipse', { cx: shadowRight ? 214 : 106, cy: 146, rx: 52, ry: 9, fill: 'rgba(40,60,40,.45)' }, s);
    if (thing === 'ball') { sv('circle', { cx: 160, cy: 116, r: 26, fill: '#e8574f' }, s); sv('path', { d: 'M136,108 Q160,96 184,108', stroke: '#fff', 'stroke-width': 4, fill: 'none' }, s); }
    else { sv('rect', { x: 152, y: 84, width: 16, height: 60, fill: '#a8743f' }, s); sv('path', { d: cloudPath(160, 66, 40, 34, 8), fill: '#4f9d4f' }, s); }
    if (!F.quiet && o.choices !== false) F.body.appendChild(h('p', 'arv-hint', 'The sun is on the ' + (sunLeft ? 'left' : 'right') + ', so the shadow falls to the ' + (sunLeft ? 'right' : 'left') + ', away from the light: shadow ' + good + '.'));
    return {};
  }

  /* ---------- ar-persp: one-, two- and three-point perspective with draggable horizon and vanishing points; depth cues ---------- */
  V.register('ar-persp', function (el, o) {
    var mode = o.mode || 'box', F = frame(el, o, 'persp', 'Perspective');
    if (mode === 'depth' || mode === 'atmos') return depthMode(el, o, F, mode);
    var c = V.canvas(F.body, { aspect: o.aspect || 1.6, max: 440 }), ctx = c.ctx; c.cv.setAttribute('role', 'img');
    var pts = o.points || 1, hz = o.horizon === undefined ? (pts === 3 ? (o.down ? 0.06 : 0.95) : 0.42) : o.horizon, lines = o.lines !== false && !F.quiet, vp = { x: o.vp === undefined ? 0.5 : o.vp, l: o.left === undefined ? 0.06 : o.left, r: o.right === undefined ? 0.94 : o.right, v: o.third === undefined ? (o.down ? 1.9 : -0.9) : o.third };
    var boxes = o.boxes || (mode === 'road' ? [] : pts === 1 ? [{ x: 0.22, y: 0.62, w: 0.2, h: 0.2 }, { x: 0.62, y: 0.12, w: 0.16, h: 0.14 }] : pts === 2 ? [{ x: 0.5, y: hz + 0.12, h: 0.3 }] : [{ x: 0.5, y: 0.95, h: 0.6 }]);
    function P(x, y) { return [x * c.w, y * c.h]; }
    function L(a, b, st) { ctx.save(); if (st === 'guide') { ctx.strokeStyle = 'rgba(184,25,127,.55)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 1; } else { ctx.strokeStyle = isDark() ? '#e6ece8' : '#26221e'; ctx.lineWidth = 2; } ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore(); }
    function fillPoly(pts2, f) { ctx.fillStyle = f; ctx.beginPath(); pts2.forEach(function (p, i) { ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }); ctx.closePath(); ctx.fill(); }
    function toward(p, v, t) { return [p[0] + (v[0] - p[0]) * t, p[1] + (v[1] - p[1]) * t]; }
    function draw() {
      var w = c.w, hh = c.h, H = hz * hh, k = V.colors();
      ctx.clearRect(0, 0, w, hh); ctx.fillStyle = isDark() ? '#1f2a33' : '#eaf3fb'; ctx.fillRect(0, 0, w, H); ctx.fillStyle = isDark() ? '#2a3326' : '#eef2e4'; ctx.fillRect(0, H, w, hh - H);
      ctx.strokeStyle = '#b8197f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(w, H); ctx.stroke();
      if (!F.quiet && o.names !== false) { ctx.fillStyle = isDark() ? '#ff86cf' : '#b8197f'; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('horizon line (eye level)', 8, H + (pts > 1 ? 16 : -6)); }
      var V1 = [vp.x * w, H], VL = [vp.l * w, H], VR = [vp.r * w, H], V3 = [w * 0.5, vp.v * hh];
      if (mode === 'road') return road(V1, w, hh, H);
      boxes.forEach(function (b) {
        var fill1 = isDark() ? '#5a6573' : '#c7d3e0', fill2 = isDark() ? '#47505c' : '#a9b8c8', fill3 = isDark() ? '#6c7888' : '#e3eaf2';
        if (pts === 1) {
          var a = P(b.x, b.y), bw = b.w * w, bh = b.h * w, f = [a, [a[0] + bw, a[1]], [a[0] + bw, a[1] + bh], [a[0], a[1] + bh]], d = o.depth || 0.35;
          var back = f.map(function (p) { return toward(p, V1, d); });
          // which side faces show: the faces turned toward the vanishing point
          var faces = [];
          if (V1[1] < f[0][1]) faces.push([f[0], f[1], back[1], back[0]]); else if (V1[1] > f[2][1]) faces.push([f[3], f[2], back[2], back[3]]);
          if (V1[0] > f[1][0]) faces.push([f[1], f[2], back[2], back[1]]); else if (V1[0] < f[0][0]) faces.push([f[0], f[3], back[3], back[0]]);
          faces.forEach(function (fc, i) { fillPoly(fc, i ? fill2 : fill3); });
          fillPoly(f, fill1);
          if (lines) f.forEach(function (p) { L(p, V1, 'guide'); });
          faces.forEach(function (fc) { for (var i = 0; i < 4; i++) L(fc[i], fc[(i + 1) % 4]); });
          for (var i = 0; i < 4; i++) L(f[i], f[(i + 1) % 4]);
        } else if (pts === 2) {
          var x = b.x * w, yb = b.y * hh, yt = yb - b.h * hh, tl = o.depth || 0.4;
          var bl = toward([x, yb], VL, tl), br = toward([x, yb], VR, tl * 0.85), tl2 = toward([x, yt], VL, tl), tr2 = toward([x, yt], VR, tl * 0.85);
          fillPoly([[x, yb], [x, yt], tl2, bl], fill1); fillPoly([[x, yb], [x, yt], tr2, br], fill2);
          if (yt > H) { // below eye level: the top shows
            var topBack = intersect(tl2, VR, tr2, VL); fillPoly([[x, yt], tl2, topBack, tr2], fill3); L(tl2, topBack); L(tr2, topBack);
          } else if (yb < H) { var botBack = intersect(bl, VR, br, VL); fillPoly([[x, yb], bl, botBack, br], fill3); L(bl, botBack); L(br, botBack); }
          if (lines) [[x, yb], [x, yt], bl, tl2].forEach(function (p) { L(p, VL, 'guide'); }); if (lines) [[x, yb], [x, yt], br, tr2].forEach(function (p) { L(p, VR, 'guide'); });
          L([x, yb], [x, yt]); L(bl, tl2); L(br, tr2); L([x, yb], bl); L([x, yb], br); L([x, yt], tl2); L([x, yt], tr2);
        } else { // three-point: looking up at a tall box (horizon low, third point high) or down on it (o.down: horizon high, third point low)
          var P0 = o.down ? [w * 0.5, hh * 0.2] : [w * 0.5, hh * 0.86], d3 = 0.3, k3 = 0.62;
          var PL = toward(P0, VL, d3), PR = toward(P0, VR, d3 * 0.85), Q0 = toward(P0, V3, k3), QL = intersect(Q0, VL, PL, V3), QR = intersect(Q0, VR, PR, V3);
          if (o.down) { var PF = intersect(PL, VR, PR, VL); fillPoly([P0, PL, PF, PR], fill3); L(PL, PF); L(PR, PF); }
          fillPoly([P0, Q0, QL, PL], fill1); fillPoly([P0, Q0, QR, PR], fill2);
          if (lines) { [P0, PL, PR].forEach(function (p) { L(p, V3, 'guide'); }); [P0, Q0].forEach(function (p) { L(p, VL, 'guide'); L(p, VR, 'guide'); }); }
          L(P0, Q0); L(PL, QL); L(PR, QR); L(P0, PL); L(P0, PR); L(Q0, QL); L(Q0, QR);
        }
      });
      if (!F.quiet && o.dots !== false) { var dots = pts === 1 ? [V1] : pts === 2 ? [VL, VR] : [VL, VR, V3]; dots.forEach(function (d, i) { ctx.fillStyle = '#b8197f'; ctx.beginPath(); ctx.arc(M.max(6, M.min(w - 6, d[0])), M.max(6, M.min(hh - 6, d[1])), 6, 0, 7); ctx.fill(); if (o.names !== false) { ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = d[0] > w / 2 ? 'right' : 'left'; ctx.fillText('VP' + (pts > 1 ? ' ' + (i + 1) : ''), d[0] + (d[0] > w / 2 ? -9 : 9), M.max(14, M.min(hh - 8, d[1] - 9))); } }); }
      c.cv.setAttribute('aria-label', F.quiet ? 'A drawing in perspective' : A.PERSPECTIVE[pts] + ' perspective drawing with the horizon line ' + (hz < 0.4 ? 'high' : hz > 0.6 ? 'low' : 'in the middle'));
    }
    function road(V1, w, hh, H) {
      var k1 = isDark() ? '#56524c' : '#9c958a'; ctx.fillStyle = k1; ctx.beginPath(); ctx.moveTo(w * 0.1, hh); ctx.lineTo(V1[0], H); ctx.lineTo(w * 0.9, hh); ctx.closePath(); ctx.fill();
      // posts along the right side: equal real spacing, so they get closer on paper (1/z spacing)
      for (var i = 0; i < 9; i++) { var z = 1 + i * 0.7, t = 1 - 1 / z, b = [w * 0.94 + (V1[0] - w * 0.94) * t, hh * 0.98 + (H - hh * 0.98) * t], ht = 70 / z; L(b, [b[0], b[1] - ht]); }
      for (i = 0; i < 12; i++) { var z2 = 1 + i * 0.6, t2 = 1 - 1 / z2, y = hh + (H - hh) * t2, half = (w * 0.4) * (1 - t2) * 0.1 + 2; ctx.fillStyle = '#f2f2ee'; ctx.fillRect(V1[0] - half / 3, y - 6 / z2, half * 2 / 3, 10 / z2); }
      if (lines) { L([w * 0.1, hh], V1, 'guide'); L([w * 0.9, hh], V1, 'guide'); L([w * 0.94, hh * 0.98], V1, 'guide'); }
      if (!F.quiet) { ctx.fillStyle = '#b8197f'; ctx.beginPath(); ctx.arc(V1[0], H, 6, 0, 7); ctx.fill(); }
    }
    function intersect(a1, a2, b1, b2) { var d = (a1[0] - a2[0]) * (b1[1] - b2[1]) - (a1[1] - a2[1]) * (b1[0] - b2[0]); if (M.abs(d) < 1e-6) return a2; var t = ((a1[0] - b1[0]) * (b1[1] - b2[1]) - (a1[1] - b1[1]) * (b1[0] - b2[0])) / d; return [a1[0] + t * (a2[0] - a1[0]), a1[1] + t * (a2[1] - a1[1])]; }
    draw(); c.onResize(draw); F.redraw.push(draw);
    if (F.interactive && o.drag !== false && !F.quiet) {
      V.drag(c.cv, {
        hit: function (px, py) { var H = hz * c.h; if (pts === 1 && M.hypot(px - vp.x * c.w, py - H) < 18) return 'v'; if (pts > 1 && M.hypot(px - vp.l * c.w, py - H) < 18) return 'l'; if (pts > 1 && M.hypot(px - vp.r * c.w, py - H) < 18) return 'r'; if (M.abs(py - H) < 10) return 'h'; return null; },
        move: function (hd, px, py) { if (hd === 'h') hz = M.max(0.08, M.min(0.92, py / c.h)); else if (hd === 'v') { vp.x = M.max(0.02, M.min(0.98, px / c.w)); hz = M.max(0.08, M.min(0.92, py / c.h)); } else if (hd === 'l') vp.l = M.max(-0.3, M.min(vp.r - 0.15, px / c.w)); else if (hd === 'r') vp.r = M.min(1.3, M.max(vp.l + 0.15, px / c.w)); draw(); F.say(hz * c.h < (boxes[0] ? boxes[0].y * c.h : 0) ? 'The box is below eye level, so you see its top.' : 'Move the horizon line and watch which faces show.'); }
      });
      F.body.appendChild(h('p', 'arv-hint', 'Drag the horizon line or a vanishing point (the pink dots).'));
      if (pts > 1) V.seg && V.seg(F.ctl, { label: 'Points', items: [[2, 'Two-point'], [3, 'Three-point']], value: pts, change: function (v) { pts = +v; hz = pts === 3 ? (o.down ? 0.06 : 0.95) : 0.42; boxes = [{ x: 0.5, y: hz + 0.12, h: 0.3 }]; draw(); } });
    }
    return {};
  });
  function depthMode(el, o, F, mode) {
    if (mode === 'atmos') {
      var s = svgRoot(320, 180, 'Hills fading into the distance (atmospheric perspective)'); F.body.appendChild(s);
      var layers = o.flat ? ['#3b5a3a', '#3b5a3a', '#3b5a3a', '#3b5a3a'] : ['#c9d8e6', '#a3bccf', '#6f8f86', '#3b5a3a'];
      sv('rect', { x: 0, y: 0, width: 320, height: 180, fill: '#e7eff6' }, s);
      [[60, 0.9], [85, 0.8], [110, 0.6], [140, 0.35]].forEach(function (L, i) { var d = 'M0,180 L0,' + L[0]; for (var x = 0; x <= 320; x += 20) d += ' L' + x + ',' + (L[0] - M.sin(x / (40 + i * 10) + i * 1.7) * (14 - i * 2) - (i === 3 ? 8 : 0)); d += ' L320,180 Z'; sv('path', { d: d, fill: layers[i] }, s); });
      if (!o.flat) { sv('rect', { x: 250, y: 104, width: 4, height: 10, fill: '#8aa3b5' }, s); sv('circle', { cx: 252, cy: 101, r: 5, fill: '#9db8c9' }, s); }
      sv('rect', { x: 60, y: 120, width: 9, height: 40, fill: '#3c2a1a' }, s); sv('circle', { cx: 64, cy: 112, r: 22, fill: '#2a4a26' }, s);
      if (!F.quiet && !o.flat) F.body.appendChild(h('p', 'arv-hint', 'Each hill farther away is lighter, bluer and softer, with less contrast and detail.'));
      return {};
    }
    var cues = [].concat(o.cue || ['overlap', 'size', 'placement']), row = h('div', 'ars-row'); F.body.appendChild(row);
    cues.forEach(function (cue, i) {
      var cd = h('div', 'ars-card'), s2 = svgRoot(200, 140, F.quiet ? 'Picture ' + letter(i) : 'Depth by ' + A.DEPTH_CUES[cue]); cd.appendChild(s2);
      sv('rect', { x: 0, y: 0, width: 200, height: 60, fill: '#dcebf7' }, s2); sv('rect', { x: 0, y: 60, width: 200, height: 80, fill: '#e4ead8' }, s2);
      if (cue === 'overlap') { sv('rect', { x: 90, y: 50, width: 70, height: 55, fill: '#9fb4c9', stroke: '#333' }, s2); sv('circle', { cx: 80, cy: 100, r: 28, fill: '#e8574f', stroke: '#333' }, s2); }
      if (cue === 'size') { [[50, 1], [120, 0.6], [165, 0.35]].forEach(function (q) { sv('rect', { x: q[0] - 4 * q[1], y: 120 - 50 * q[1], width: 8 * q[1], height: 50 * q[1], fill: '#7a5230' }, s2); sv('circle', { cx: q[0], cy: 120 - 55 * q[1], r: 20 * q[1], fill: '#4f9d4f' }, s2); }); }
      if (cue === 'placement') { [[45, 128], [110, 96], [160, 74]].forEach(function (q) { sv('rect', { x: q[0] - 4, y: q[1] - 30, width: 8, height: 30, fill: '#7a5230' }, s2); sv('circle', { cx: q[0], cy: q[1] - 34, r: 13, fill: '#4f9d4f' }, s2); }); }
      if (cue === 'none') { [[45, 110], [110, 110], [165, 110]].forEach(function (q) { sv('rect', { x: q[0] - 4, y: q[1] - 30, width: 8, height: 30, fill: '#7a5230' }, s2); sv('circle', { cx: q[0], cy: q[1] - 34, r: 13, fill: '#4f9d4f' }, s2); }); }
      cd.appendChild(h('span', 'arl-lab' + (F.quiet ? ' arl-letter' : ''), F.quiet ? letter(i) : cap1(cue === 'none' ? 'no depth cue' : A.DEPTH_CUES[cue])));
      row.appendChild(cd);
    });
    return {};
  }

  /* ---------- ar-proportion: figures in head heights, sighting, the hand, the mannequin and the grid method ---------- */
  function mannequin(g, x, base, H, o) { // a clothed mannequin figure H tall; o.heads, o.pose (line of action bend), o.shirt, o.pants
    o = o || {}; var heads = o.heads || 7.5, u = H / heads, bend = o.bend || 0, cx = x, sc = H / 300;
    function lim(x1, y1, x2, y2, wd, col) { sv('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, 'stroke-width': wd, 'stroke-linecap': 'round' }, g); }
    var top = base - H, chin = top + u, shoulderY = top + u * 1.4, hipY = top + H * 0.5, kneeY = top + H * 0.74;
    var lean = bend * u * 0.8, shirt = o.shirt || '#4a8fe0', pants = o.pants || '#3c4d6b';
    var sw = u * (heads > 6 ? 0.95 : 0.8), hw = u * (heads > 6 ? 0.7 : 0.6);
    // legs
    lim(cx - hw * 0.5 + lean * 0.3, hipY, cx - hw * 0.6, kneeY, u * 0.42, pants); lim(cx - hw * 0.6, kneeY, cx - hw * 0.65, base - u * 0.1, u * 0.36, pants);
    lim(cx + hw * 0.5 + lean * 0.3, hipY, cx + hw * 0.75 + bend * u * 0.3, kneeY, u * 0.42, pants); lim(cx + hw * 0.75 + bend * u * 0.3, kneeY, cx + hw * 0.7 + bend * u * 0.5, base - u * 0.1, u * 0.36, pants);
    sv('ellipse', { cx: cx - hw * 0.7, cy: base - u * 0.06, rx: u * 0.32, ry: u * 0.12, fill: '#4a3a2c' }, g); sv('ellipse', { cx: cx + hw * 0.75 + bend * u * 0.5, cy: base - u * 0.06, rx: u * 0.32, ry: u * 0.12, fill: '#4a3a2c' }, g);
    // torso (box) and hips
    sv('path', { d: 'M' + (cx - sw + lean) + ',' + shoulderY + ' L' + (cx + sw + lean) + ',' + shoulderY + ' L' + (cx + hw + lean * 0.3) + ',' + hipY + ' L' + (cx - hw + lean * 0.3) + ',' + hipY + ' Z', fill: shirt, stroke: 'rgba(0,0,0,.25)' }, g);
    sv('path', { d: 'M' + (cx - hw + lean * 0.3) + ',' + (hipY - u * 0.2) + ' L' + (cx + hw + lean * 0.3) + ',' + (hipY - u * 0.2) + ' L' + (cx + hw * 0.9 + lean * 0.3) + ',' + (hipY + u * 0.25) + ' L' + (cx - hw * 0.9 + lean * 0.3) + ',' + (hipY + u * 0.25) + ' Z', fill: pants }, g);
    // arms
    var elbowY = top + u * 2.9, wristY = top + u * 3.9 + (heads < 6 ? -u * 0.2 : 0);
    lim(cx - sw + lean, shoulderY + u * 0.1, cx - sw - u * 0.15 + lean * 0.6, elbowY, u * 0.32, shirt); lim(cx - sw - u * 0.15 + lean * 0.6, elbowY, cx - sw - u * 0.05 + lean * 0.4, wristY, u * 0.27, SKIN);
    lim(cx + sw + lean, shoulderY + u * 0.1, cx + sw + u * 0.15 + lean + bend * u * 0.5, elbowY - bend * u * 0.6, u * 0.32, shirt); lim(cx + sw + u * 0.15 + lean + bend * u * 0.5, elbowY - bend * u * 0.6, cx + sw + u * 0.2 + lean + bend * u * 1.2, wristY - bend * u * 1.6, u * 0.27, SKIN);
    // neck and head
    sv('rect', { x: cx - u * 0.17 + lean, y: chin - u * 0.05, width: u * 0.34, height: shoulderY - chin + u * 0.1, fill: SKIN, stroke: SKIN_LINE }, g);
    sv('ellipse', { cx: cx + lean * 1.1, cy: top + u * 0.5, rx: u * 0.38, ry: u * 0.5, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 1.5 }, g);
    sv('path', { d: 'M' + (cx + lean * 1.1 - u * 0.38) + ',' + (top + u * 0.42) + ' Q' + (cx + lean * 1.1) + ',' + (top - u * 0.12) + ' ' + (cx + lean * 1.1 + u * 0.38) + ',' + (top + u * 0.42) + ' Q' + (cx + lean * 1.1) + ',' + (top + u * 0.15) + ' ' + (cx + lean * 1.1 - u * 0.38) + ',' + (top + u * 0.42) + ' Z', fill: o.hair || '#5b3a1e' }, g);
    if (o.loa) sv('path', { d: 'M' + (cx + lean * 1.1) + ',' + (top + u * 0.2) + ' Q' + (cx + lean * 0.4 - bend * u) + ',' + hipY + ' ' + (cx + hw * 0.7 + bend * u * 0.5) + ',' + base, fill: 'none', stroke: '#b8197f', 'stroke-width': 3, 'stroke-dasharray': '7 5' }, g);
    return { u: u, top: top };
  }
  V.register('ar-proportion', function (el, o) {
    var mode = o.mode || 'figures', F = frame(el, o, 'proportion', 'Proportion');
    if (mode === 'figures') {
      var list = o.figures || ['adult', 'child', 'toddler'], H0 = 300, s = svgRoot(120 + list.length * 130, 352, F.quiet ? 'Figures measured in heads' : 'Figures: ' + list.map(function (k) { return A.FIGURES[k].name + ', about ' + A.FIGURES[k].heads + ' heads tall'; }).join('; ')); F.body.appendChild(s);
      var base = 320, maxU = H0 / A.FIGURES[list[0]].heads;
      var topA = base - maxU * A.FIGURES[list[0]].heads;
      for (var i = 0; i <= 8; i++) { var y = topA + i * maxU; if (y > base + 1) break; sv('line', { x1: 34, y1: y, x2: 120 + list.length * 130 - 8, y2: y, class: 'arpr-rule' }, s); if (!F.quiet && i < A.FIGURES[list[0]].heads) txt(s, 28, y + maxU / 2 + 4, String(i + 1), { class: 'arpr-num', 'text-anchor': 'end' }); }
      list.forEach(function (k, j) {
        var f = A.FIGURES[k], u = k === list[0] ? maxU : maxU * (k === 'adult' ? 1 : k === 'teen' ? 0.95 : k === 'child' ? 0.82 : k === 'young' ? 0.72 : 0.62), Hh = u * f.heads;
        mannequin(sv('g', null, s), 120 + j * 130, base, Hh, { heads: f.heads, shirt: ['#4a8fe0', '#e8574f', '#58b368', '#f39a3d'][j % 4], pants: ['#3c4d6b', '#4a3a6b', '#5a4a2c', '#3c5a4d'][j % 4], hair: ['#5b3a1e', '#c4542b', '#1d1714', '#d9b25c'][j % 4] });
        for (var q = 1; q <= M.floor(f.heads); q++) sv('line', { x1: 120 + j * 130 + 44, y1: base - Hh + q * u, x2: 120 + j * 130 + 56, y2: base - Hh + q * u, class: 'arpr-tick' }, s);
        if (F.quiet) txt(s, 120 + j * 130, 338, letter(j), { class: 'arpr-lab', 'text-anchor': 'middle' }); else { txt(s, 120 + j * 130, 333, f.name.replace(/^an? /, '').replace(' of about ', ', about '), { class: 'arpr-lab arpr-small', 'text-anchor': 'middle' }); txt(s, 120 + j * 130, 347, f.heads + ' heads tall', { class: 'arpr-lab arpr-small', 'text-anchor': 'middle' }); }
      });
      if (!F.quiet && list.indexOf('adult') >= 0) F.body.appendChild(h('p', 'arv-hint', 'Averages artists use; real people vary. An adult\'s halfway point is near the hips. Young children have big heads for their size and short legs.'));
      return {};
    }
    if (mode === 'sighting') { // a bottle measured in units of its cap, or a vase in units of its width
      var obj = o.object || 'bottle', units = o.units || 4, s2 = svgRoot(340, 240, 'Measuring with a pencil: the ' + obj + ' is ' + (F.quiet ? 'some' : units) + ' units tall'); F.body.appendChild(s2);
      var cu = 180 / (units + 0.5), bx = 90, bb = 220;
      sv('rect', { x: 0, y: 0, width: 340, height: 240, fill: isDark() ? '#232a26' : '#f6f2ea' }, s2); sv('rect', { x: 0, y: bb, width: 340, height: 20, fill: isDark() ? '#3a403b' : '#d8cfbd' }, s2);
      sv('rect', { x: bx - 12, y: bb - units * cu, width: 24, height: cu, rx: 3, fill: '#c0392b' }, s2);
      sv('path', { d: 'M' + (bx - 10) + ',' + (bb - (units - 1) * cu) + ' Q' + (bx - 34) + ',' + (bb - (units - 1.6) * cu) + ' ' + (bx - 34) + ',' + (bb - (units - 2.4) * cu) + ' L' + (bx - 34) + ',' + bb + ' L' + (bx + 34) + ',' + bb + ' L' + (bx + 34) + ',' + (bb - (units - 2.4) * cu) + ' Q' + (bx + 34) + ',' + (bb - (units - 1.6) * cu) + ' ' + (bx + 10) + ',' + (bb - (units - 1) * cu) + ' Z', fill: '#4f9d6f', opacity: 0.9 }, s2);
      for (var k2 = 0; k2 <= units; k2++) { sv('line', { x1: bx + 46, y1: bb - k2 * cu, x2: bx + 60, y2: bb - k2 * cu, class: 'arpr-tick' }, s2); }
      if (!F.quiet) { txt(s2, bx + 66, bb - units * cu + cu / 2 + 4, '1 unit = the cap', { class: 'arpr-lab' }); txt(s2, bx + 66, bb - cu * units / 2, units + ' units tall', { class: 'arpr-lab' }); }
      // the pencil held at arm's length
      sv('rect', { x: 296, y: 30, width: 9, height: 160, rx: 2, fill: '#f2c22e', stroke: '#8a6a1c' }, s2); sv('polygon', { points: '296,30 305,30 300.5,14', fill: '#e8c48a' }, s2);
      sv('ellipse', { cx: 300.5, cy: 30 + cu + 8, rx: 13, ry: 9, fill: SKIN, stroke: SKIN_LINE }, s2); sv('line', { x1: 292, y1: 30 + cu, x2: 309, y2: 30 + cu, stroke: '#b8197f', 'stroke-width': 2 }, s2);
      if (!F.quiet) { txt(s2, 300, 206, 'pencil at arm\'s length;', { class: 'arpr-lab arpr-small', 'text-anchor': 'middle' }); txt(s2, 300, 218, 'thumb marks one unit', { class: 'arpr-lab arpr-small', 'text-anchor': 'middle' }); }
      return {};
    }
    if (mode === 'hand') {
      var s3 = svgRoot(240, 280, 'A hand: the palm and the middle finger are about the same length' + (F.quiet ? '' : '; the knuckles make an arc')); F.body.appendChild(s3);
      var g3 = sv('g', null, s3), px = 70, py = 150, pw = 100, ph = 100;
      sv('path', { d: 'M' + px + ',' + py + ' L' + (px + pw) + ',' + py + ' L' + (px + pw - 6) + ',' + (py + ph) + ' Q' + (px + pw / 2) + ',' + (py + ph + 18) + ' ' + (px + 8) + ',' + (py + ph) + ' Z', fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 2 }, g3);
      var fingers = [[px + 12, 0.78, -8], [px + 37, 0.95, -3], [px + 62, 1.0, 0], [px + 87, 0.88, 4]];
      fingers.forEach(function (f, i) { var len = ph * f[1] * (i === 2 ? 1 : 1), x = f[0], top = py - len + M.abs(i - 1.6) * 6; sv('rect', { x: x, y: top, width: 22, height: py - top + 6, rx: 11, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 2 }, g3); });
      sv('path', { d: 'M' + (px + pw - 6) + ',' + (py + 50) + ' Q' + (px + pw + 46) + ',' + (py + 10) + ' ' + (px + pw + 40) + ',' + (py - 34), fill: 'none', stroke: SKIN_LINE, 'stroke-width': 26, 'stroke-linecap': 'round' }, g3);
      sv('path', { d: 'M' + (px + pw - 6) + ',' + (py + 50) + ' Q' + (px + pw + 46) + ',' + (py + 10) + ' ' + (px + pw + 40) + ',' + (py - 34), fill: 'none', stroke: SKIN, 'stroke-width': 22, 'stroke-linecap': 'round' }, g3);
      sv('path', { d: 'M' + (px + 23) + ',' + (py + 4) + ' Q' + (px + 50) + ',' + (py - 6) + ' ' + (px + 98) + ',' + (py + 6), fill: 'none', stroke: '#b8197f', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g3);
      if (!F.quiet) { sv('line', { x1: 30, y1: py, x2: 30, y2: py + ph + 6, class: 'arpr-meas' }, s3); sv('line', { x1: 30, y1: py - ph + 1, x2: 30, y2: py, class: 'arpr-meas2' }, s3); txt(s3, 24, py + ph / 2, 'palm', { class: 'arpr-lab arpr-small', 'text-anchor': 'end', transform: 'rotate(-90 24 ' + (py + ph / 2) + ')' }); txt(s3, 24, py - ph / 2, 'middle finger', { class: 'arpr-lab arpr-small', 'text-anchor': 'middle', transform: 'rotate(-90 24 ' + (py - ph / 2) + ')' }); txt(s3, px + 100, py + 22, 'knuckle arc', { class: 'arpr-lab arpr-small' }); }
      return {};
    }
    if (mode === 'mannequin' || mode === 'gesture') {
      var s4 = svgRoot(320, 300, 'A mannequin figure' + (mode === 'gesture' ? ' with its line of action' : '')); F.body.appendChild(s4);
      var g4 = sv('g', null, s4), bend = o.bend === undefined ? (mode === 'gesture' ? 0.8 : 0) : o.bend;
      var drawM = function () { while (g4.firstChild) g4.removeChild(g4.firstChild); mannequin(g4, 160, 290, 270, { heads: 7.5, bend: bend, loa: mode === 'gesture' || o.loa }); };
      drawM();
      if (F.interactive && V.slider && !F.quiet) V.slider(F.ctl, { label: 'Bend the pose', min: -1, max: 1, step: 0.05, value: bend, fmt: function (v) { return v === 0 ? 'straight' : v < 0 ? 'lean left' : 'lean right'; }, input: function (v) { bend = v; drawM(); } });
      if (!F.quiet && mode === 'gesture') F.body.appendChild(h('p', 'arv-hint', 'The dashed line is the line of action: one curve through the whole pose. Draw it first; hang the head, chest and hips on it.'));
      return {};
    }
    if (mode === 'grid') { // a small picture with a grid, and a bigger grid to copy it into
      var n = o.cells || 4, s5 = svgRoot(340, 180, 'The grid method: a small picture with a ' + n + ' by ' + n + ' grid and a larger empty grid'); F.body.appendChild(s5);
      function grid(x, y, size) { for (var i2 = 0; i2 <= n; i2++) { sv('line', { x1: x + i2 * size / n, y1: y, x2: x + i2 * size / n, y2: y + size, class: 'arpr-grid' }, s5); sv('line', { x1: x, y1: y + i2 * size / n, x2: x + size, y2: y + i2 * size / n, class: 'arpr-grid' }, s5); } }
      var g5 = sv('g', { transform: 'translate(14,40) scale(0.5)' }, s5); sv('rect', { x: 0, y: 0, width: 200, height: 200, fill: isDark() ? '#2b302d' : '#fffdf7' }, g5); drawDrawing(sv('g', { transform: 'translate(0,20)' }, g5), o.draw || 'cat', {}); grid(14, 40, 100);
      sv('rect', { x: 170, y: 10, width: 160, height: 160, fill: isDark() ? '#2b302d' : '#fffdf7' }, s5); grid(170, 10, 160);
      if (o.copied) { var g6 = sv('g', { transform: 'translate(170,10) scale(0.8)' }, s5); drawDrawing(sv('g', { transform: 'translate(0,20)' }, g6), o.draw || 'cat', { outline: true }); }
      sv('path', { d: 'M122,90 L160,90', stroke: '#b8197f', 'stroke-width': 2.5, 'marker-end': '' }, s5); sv('polygon', { points: '160,84 168,90 160,96', fill: '#b8197f' }, s5);
      if (!F.quiet) txt(s5, 14, 160, 'Copy one square at a time.', { class: 'arpr-lab arpr-small' });
      return {};
    }
    return {};
  });

  /* ---------- ar-wheel: the color wheel and its schemes; mixing paint and light; tints, tones and shades; temperature ---------- */
  function wedge(g, cx, cy, r0, r1, a0, a1, at) { var p = function (r, a) { return (cx + r * M.cos(a)).toFixed(2) + ',' + (cy + r * M.sin(a)).toFixed(2); }; return sv('path', Object.assign({ d: 'M' + p(r1, a0) + ' A' + r1 + ',' + r1 + ' 0 0 1 ' + p(r1, a1) + ' L' + p(r0, a1) + ' A' + r0 + ',' + r0 + ' 0 0 0 ' + p(r0, a0) + ' Z' }, at), g); }
  V.register('ar-wheel', function (el, o) {
    var mode = o.mode || 'wheel', F = frame(el, o, 'wheel', 'The color wheel');
    if (mode === 'rainbow') {
      var s0 = svgRoot(300, 170, F.quiet && o.blank ? 'A rainbow with one band missing' : 'A rainbow: red, orange, yellow, green, blue, violet'); F.body.appendChild(s0);
      sv('rect', { x: 0, y: 0, width: 300, height: 170, fill: '#cfe8fa', rx: 10 }, s0);
      A.RAINBOW.forEach(function (k, i) { var r = 130 - i * 14; sv('path', { d: 'M' + (150 - r) + ',160 A' + r + ',' + r + ' 0 0 1 ' + (150 + r) + ',160', fill: 'none', stroke: o.blank === i ? '#ffffff' : A.RAINBOW_HEX[k], 'stroke-width': 14, 'stroke-dasharray': o.blank === i ? '6 5' : null }, s0); if (o.blank === i) txt(s0, 150, 160 - r + 5, '?', { class: 'arw-q', 'text-anchor': 'middle' }); });
      sv('ellipse', { cx: 34, cy: 156, rx: 40, ry: 16, fill: '#fff' }, s0); sv('ellipse', { cx: 266, cy: 156, rx: 40, ry: 16, fill: '#fff' }, s0);
      if (!F.quiet && o.names !== false) F.body.appendChild(h('p', 'arv-hint', 'Red is always on the outside edge and violet on the inside.'));
      return {};
    }
    if (mode === 'mix') return mixMode(el, o, F);
    if (mode === 'light') return lightMode(el, o, F);
    if (mode === 'tints') {
      var base = A.hue(o.hue || 'blue').hex, rows = [['Tints (add white)', function (t) { return A.tint(base, t); }], ['Tones (add gray)', function (t) { return A.tone(base, t); }], ['Shades (add black)', function (t) { return A.shade(base, t); }]];
      if (o.only) rows = rows.filter(function (r) { return r[0].toLowerCase().indexOf(o.only) === 0; });
      rows.forEach(function (r, i) { var row = h('div', 'arw-trow'); row.appendChild(h('span', 'arw-tlab', F.quiet ? 'Row ' + letter(i) : r[0])); for (var k = 0; k < 6; k++) { var sw = h('span', 'arw-tsw'); sw.style.background = r[1](k / 6 * 0.85); row.appendChild(sw); } F.body.appendChild(row); });
      return {};
    }
    if (mode === 'contrast') { // the same gray (or color) on two grounds
      var mid = o.color || '#8a8a8a', grounds = o.grounds || ['#111111', '#f4f4f4'], s1 = svgRoot(320, 150, 'The same ' + (o.color ? 'color' : 'gray') + ' square on two different backgrounds'); F.body.appendChild(s1);
      grounds.forEach(function (gc, i) { sv('rect', { x: i * 165, y: 0, width: 155, height: 150, fill: gc, rx: 8 }, s1); sv('rect', { x: i * 165 + 52, y: 50, width: 50, height: 50, fill: mid }, s1); });
      if (F.interactive && o.bridge !== false) { var br = sv('rect', { x: 102, y: 66, width: 115, height: 18, fill: mid, opacity: 0 }, s1); btn(F.ctl, 'Join the two squares', function () { br.setAttribute('opacity', br.getAttribute('opacity') === '0' ? 1 : 0); F.say(br.getAttribute('opacity') === '1' ? 'Joined, you can see they are the same ' + (o.color ? 'color' : 'gray') + '.' : ''); }); }
      return {};
    }
    if (mode === 'hsv') return hsvMode(el, o, F);
    // the wheel
    var n = o.segments || 12, size = 300, cx = 150, cy = 150, r1 = 138, r0 = o.ring === false ? 0 : 62, schemeKind = o.scheme || null, base0 = o.base || 'red';
    var s = svgRoot(size, size, 'A ' + n + '-hue color wheel' + (schemeKind && !F.quiet ? ' showing a ' + A.SCHEMES[schemeKind].toLowerCase() + ' scheme on ' + A.hue(base0).name : '')); s.classList.add('arw-svg'); F.body.appendChild(s);
    var gW = sv('g', null, s), gS = sv('g', null, s), gL = sv('g', null, s), picks = [], sel = [];
    var keys = n === 12 ? WHEEL.map(function (c) { return c.key; }) : n === 6 ? ['red', 'orange', 'yellow', 'green', 'blue', 'violet'] : ['red', 'yellow', 'blue'];
    keys.forEach(function (k, i) {
      var a0 = -M.PI / 2 + (i - 0.5) * 2 * M.PI / n, a1 = a0 + 2 * M.PI / n, c = A.hue(k), shown = !o.only || o.only.indexOf(k) >= 0 || (o.only === 'primary' && c.kind === 'primary');
      var wd = wedge(gW, cx, cy, r0, r1, a0 + 0.004, a1 - 0.004, { fill: shown ? c.hex : (isDark() ? '#2a3a31' : '#eeeeea'), class: 'arw-wedge', 'data-k': k, stroke: isDark() ? '#1b2b22' : '#fff', 'stroke-width': 1.5 });
      if (o.blank && o.blank.indexOf(k) >= 0) { wd.setAttribute('fill', isDark() ? '#2a3a31' : '#f4f4f0'); wd.setAttribute('stroke-dasharray', '4 3'); wd.setAttribute('stroke', '#999'); }
      var am = (a0 + a1) / 2, lr = (r0 + r1) / 2;
      if (o.labels !== false && !(F.quiet && o.labels !== 'letters')) {
        var lab = o.labels === 'letters' ? letter(i) : o.labels === 'kind' ? c.kind.charAt(0).toUpperCase() : n === 12 ? c.name.replace('-', '-\n') : c.name;
        lab.split('\n').forEach(function (line, li, arr) { txt(gL, cx + lr * M.cos(am), cy + lr * M.sin(am) + (li - (arr.length - 1) / 2) * 11 + 4, line, { class: 'arw-lab' + (A.lightness(c.hex) < 58 ? ' on-dark' : ''), 'text-anchor': 'middle' }); });
      }
      if (o.blank && o.blank.indexOf(k) >= 0) txt(gL, cx + lr * M.cos(am), cy + lr * M.sin(am) + 6, '?', { class: 'arw-q', 'text-anchor': 'middle' });
      picks.push({ k: k, el: wd });
    });
    function drawScheme() {
      while (gS.firstChild) gS.removeChild(gS.firstChild);
      if (!schemeKind || F.quiet && !o.showScheme) return;
      var ks = A.scheme(schemeKind, base0), ptsS = ks.map(function (k) { var i = keys.indexOf(k), a = -M.PI / 2 + i * 2 * M.PI / n; return [cx + (r0 - 6) * M.cos(a), cy + (r0 - 6) * M.sin(a), cx + r1 * M.cos(a), cy + r1 * M.sin(a)]; });
      if (ptsS.length > 1) sv('polygon', { points: ptsS.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), class: 'arw-shape' }, gS);
      ptsS.forEach(function (p) { sv('circle', { cx: p[2], cy: p[3], r: 9, class: 'arw-dot' }, gS); });
      if (!F.quiet) F.say(A.SCHEMES[schemeKind] + ': ' + ks.map(function (k) { return A.hue(k).name; }).join(', ') + '.');
    }
    drawScheme();
    if (o.temperature && !F.quiet) { var tw = sv('path', { d: 'M' + (cx - 4) + ',' + (cy - r1 - 6) + ' L' + (cx - 4) + ',' + (cy + r1 + 6), class: 'arw-split' }, gS); txt(gS, cx + 27, cy - 12, 'warm', { class: 'arw-temp', 'text-anchor': 'middle' }); txt(gS, cx - 27, cy + 20, 'cool', { class: 'arw-temp', 'text-anchor': 'middle' }); tw.setAttribute('transform', 'rotate(-30 ' + cx + ' ' + cy + ')'); }
    if (F.interactive && schemeKind && !F.quiet && o.choose !== false) {
      F.body.appendChild(h('p', 'arv-hint', 'Tap a color to move the scheme around the wheel.'));
      picks.forEach(function (p) { p.el.style.cursor = 'pointer'; p.el.addEventListener('click', function () { base0 = p.k; drawScheme(); }); });
      if (V.seg) V.seg(F.ctl, { label: 'Scheme', items: [['complementary', 'Complementary'], ['analogous', 'Analogous'], ['triadic', 'Triadic'], ['split', 'Split'], ['monochromatic', 'One hue']], value: schemeKind, change: function (v) { schemeKind = v; drawScheme(); } });
    }
    if (F.interactive && o.target && !F.quiet) { // tap the hue(s) that answer a question, then Check
      var want = [].concat(o.target);
      picks.forEach(function (p) { p.el.style.cursor = 'pointer'; p.el.addEventListener('click', function () { var i = sel.indexOf(p.k); if (i >= 0) sel.splice(i, 1); else { sel.push(p.k); if (sel.length > want.length) sel.shift(); } picks.forEach(function (q) { q.el.classList.toggle('arw-sel', sel.indexOf(q.k) >= 0); }); F.say(''); }); });
      btn(F.ctl, 'Check', function () { var ok = sel.length === want.length && want.every(function (k) { return sel.indexOf(k) >= 0; }); F.say(ok ? okMark(true) + ' Yes: ' + want.map(function (k) { return A.hue(k).name; }).join(' and ') + '.' : okMark(false) + ' Not quite. ' + (o.why || 'Look at the wheel again.')); }, 'pri');
    }
    return { base: function () { return base0; } };
  });
  function mixMode(el, o, F) { // pick two paints, see the mixture on a palette
    var avail = o.paints || ['red', 'yellow', 'blue'], a = o.a || null, b = o.b || null;
    var s = svgRoot(320, 150, 'A palette for mixing paint'); F.body.appendChild(s);
    var g = sv('g', null, s);
    function draw() {
      while (g.firstChild) g.removeChild(g.firstChild);
      sv('path', { d: blobPath(160, 78, 150, [1, 0.9, 0.95, 1, 0.92, 0.98, 1, 0.94], 0.5), fill: isDark() ? '#c9b48e' : '#e9d8b4', stroke: '#a88a5a', 'stroke-width': 2 }, g);
      sv('ellipse', { cx: 52, cy: 92, rx: 13, ry: 9, fill: isDark() ? '#1b2b22' : '#fbf8f0' }, g); // thumb hole
      if (a) paint(98, 44, A.hue(a).hex, F.quiet ? '' : A.hue(a).name, 0, true); if (b) paint(98, 112, A.hue(b).hex, F.quiet ? '' : A.hue(b).name, 0, true);   // names beside the two paints, so the second does not cover the first's
      txt(g, 98, 86, '+', { class: 'arw-plus', 'text-anchor': 'middle' }); txt(g, 205, 86, '=', { class: 'arw-plus', 'text-anchor': 'middle' });
      if (a && b && !(F.quiet && o.hideResult !== false)) { var m = A.mixPaint(a, b); paint(252, 72, m.hex, m.name, 30); } else { sv('circle', { cx: 250, cy: 80, r: 26, fill: 'none', stroke: '#8a7350', 'stroke-dasharray': '4 4', 'stroke-width': 2 }, g); txt(g, 250, 87, '?', { class: 'arw-q', 'text-anchor': 'middle' }); }
    }
    function paint(x, y, col, name, r, side) { sv('path', { d: blobPath(x, y, r || 20, [1, 0.85, 1, 0.9, 0.95, 0.85, 1, 0.92], 0.8), fill: col, stroke: 'rgba(0,0,0,.25)' }, g); if (name) { if (side) txt(g, x + (r || 20) + 6, y + 5, name, { class: 'arw-pname', 'text-anchor': 'start' }); else nameLines(name).forEach(function (ln, i) { txt(g, x, y + (r || 20) + 14 + i * 13, ln, { class: 'arw-pname', 'text-anchor': 'middle' }); }); } }
    function nameLines(nm) { if (nm.length <= 14) return [nm]; var w = nm.split(' '), best = null; for (var i = 1; i < w.length; i++) { var l = [w.slice(0, i).join(' '), w.slice(i).join(' ')], m = M.max(l[0].length, l[1].length); if (!best || m < best.m) best = { l: l, m: m }; } return best ? best.l : [nm]; }   // a long mixture name on two lines, so it stays on the palette
    draw();
    if (F.interactive && !F.quiet && o.pick !== false) {
      var turn = 0, row = h('div', 'arw-paints'); F.ctl.appendChild(row);
      avail.forEach(function (k) { var bb = btn(row, '<span class="arw-dab" style="background:' + A.hue(k).hex + '"></span>' + esc(A.hue(k).name), function () { if (turn % 2 === 0) { a = k; b = null; } else b = k; turn++; draw(); F.say(a && b ? A.hue(a).name + ' + ' + A.hue(b).name + ' = ' + A.mixPaint(a, b).name + '.' : 'Now pick a second paint.'); }); });
      btn(F.ctl, 'Clean the palette', function () { a = b = null; turn = 0; draw(); F.say(''); });
    }
    return {};
  }
  function lightMode(el, o, F) { // three colored spotlights (additive) or three inks (subtractive), draggable
    var sub = o.ink, s = svgRoot(320, 240, sub ? 'Cyan, magenta and yellow inks overlapping on white paper' : 'Red, green and blue lights overlapping on a dark wall'); F.body.appendChild(s);
    var on = o.on || (sub ? 'cmy' : 'rgb'), P = { a: [125, 100], b: [195, 100], c: [160, 158] }, g = sv('g', null, s);
    var cols = sub ? { a: 'c', b: 'm', c: 'y' } : { a: 'r', b: 'g', c: 'b' };
    function draw() {
      while (g.firstChild) g.removeChild(g.firstChild);
      sv('rect', { x: 0, y: 0, width: 320, height: 240, rx: 10, fill: sub ? '#ffffff' : '#0d0d10' }, g);
      // sample each pixel region by drawing the 7 regions: easiest is to layer circles with blend modes
      var grp = sv('g', { style: 'isolation:isolate' }, g);
      ['a', 'b', 'c'].forEach(function (k) { if (on.indexOf(cols[k]) < 0) return; var hex = sub ? A.mixInk(cols[k]).hex : A.mixLight(cols[k]).hex; sv('circle', { cx: P[k][0], cy: P[k][1], r: 62, fill: hex, style: 'mix-blend-mode:' + (sub ? 'multiply' : 'screen') }, grp); });
      if (!F.quiet && o.names !== false) { [['a', -1], ['b', 1], ['c', 0]].forEach(function (q) { var k = q[0]; if (on.indexOf(cols[k]) < 0) return; var nm = sub ? A.mixInk(cols[k]).name : A.mixLight(cols[k]).name; txt(g, P[k][0] + q[1] * 40, P[k][1] + (k === 'c' ? 48 : -40), nm, { class: 'arw-lname' + (sub ? '' : ' on-dark'), 'text-anchor': 'middle' }); }); }
    }
    draw();
    if (F.interactive && !F.quiet) {
      var act = null;
      s.addEventListener('pointerdown', function (e) { var p = svgPt(s, e); act = null; ['a', 'b', 'c'].forEach(function (k) { if (M.hypot(p.x - P[k][0], p.y - P[k][1]) < 62) act = k; }); if (act) { e.preventDefault(); s.setPointerCapture(e.pointerId); } });
      s.addEventListener('pointermove', function (e) { if (!act) return; var p = svgPt(s, e); P[act] = [M.max(30, M.min(290, p.x)), M.max(30, M.min(210, p.y))]; draw(); });
      s.addEventListener('pointerup', function () { act = null; });
      var bar = h('div', 'arw-toggles'); F.ctl.appendChild(bar);
      ['a', 'b', 'c'].forEach(function (k) { var nm = sub ? A.mixInk(cols[k]).name : A.mixLight(cols[k]).name, bb = btn(bar, (sub ? 'Ink: ' : 'Light: ') + nm, function () { on = on.indexOf(cols[k]) >= 0 ? on.replace(cols[k], '') : on + cols[k]; bb.setAttribute('aria-pressed', String(on.indexOf(cols[k]) >= 0)); draw(); var r = sub ? A.mixInk(on) : A.mixLight(on); F.say('Where all the ' + (sub ? 'inks' : 'lights') + ' that are on overlap: ' + r.name + '.'); }); bb.setAttribute('aria-pressed', String(on.indexOf(cols[k]) >= 0)); });
      F.body.appendChild(h('p', 'arv-hint', 'Drag the circles to overlap them in different ways.'));
    }
    return {};
  }
  function hsvMode(el, o, F) {
    var hueI = A.hueIdx(o.hue || 'blue'), val = o.value === undefined ? 0.5 : o.value, sat = o.saturation === undefined ? 1 : o.saturation;
    var sw = h('div', 'arw-big'); F.body.appendChild(sw);
    function col() { var base = WHEEL[hueI].hex, c = A.mixHex('#808080', base, sat); return val >= 0.5 ? A.tint(c, (val - 0.5) * 2 * 0.9) : A.shade(c, (0.5 - val) * 2 * 0.9); }
    function draw() { sw.style.background = col(); sw.setAttribute('aria-label', 'A ' + WHEEL[hueI].name + ', ' + (val > 0.6 ? 'light' : val < 0.4 ? 'dark' : 'middle') + ' in value, ' + (sat > 0.7 ? 'strong' : sat < 0.3 ? 'grayed' : 'medium') + ' in saturation'); }
    sw.setAttribute('role', 'img'); draw();
    if (F.interactive && V.slider) {
      V.slider(F.ctl, { label: 'Hue', min: 0, max: 11, step: 1, value: hueI, fmt: function (v) { return WHEEL[v].name; }, input: function (v) { hueI = v; draw(); } });
      V.slider(F.ctl, { label: 'Value (light to dark)', min: 0, max: 1, step: 0.05, value: val, fmt: function (v) { return v > 0.6 ? 'light' : v < 0.4 ? 'dark' : 'middle'; }, input: function (v) { val = v; draw(); } });
      V.slider(F.ctl, { label: 'Saturation (gray to pure)', min: 0, max: 1, step: 0.05, value: sat, fmt: function (v) { return M.round(v * 100) + '%'; }, input: function (v) { sat = v; draw(); } });
    }
    return {};
  }

  /* ---------- ar-design: small abstract designs that show an element or a principle ---------- */
  A.DESIGNS = { 'balance-sym': 'symmetrical balance', 'balance-asym': 'asymmetrical balance', 'balance-radial': 'radial balance', contrast: 'contrast', emphasis: 'emphasis', movement: 'movement',
    pattern: 'pattern', 'rhythm-progressive': 'progressive rhythm', unity: 'unity', variety: 'variety', proportion: 'hierarchical scale (proportion)', 'positive-negative': 'positive and negative space',
    line: 'line', shape: 'shape', form: 'form', space: 'space (depth)', value: 'value', texture: 'texture', color: 'color', chaos: 'too much variety', dull: 'too much sameness' };
  function designPanel(g, kind, w, hh, R) {
    var acc = '#b8197f', blue = '#2a6db0', gold = '#d9a441', ink = isDark() ? '#e6ece8' : '#26221e', i, cx = w / 2, cy = hh / 2;
    sv('rect', { x: 0, y: 0, width: w, height: hh, fill: isDark() ? '#22312a' : '#fbf8f0' }, g);
    switch (kind) {
      case 'balance-sym': sv('rect', { x: cx - 20, y: 30, width: 40, height: 90, fill: blue }, g); shapeEl(g, 'circle', cx - 50, 70, 16, { fill: gold }); shapeEl(g, 'circle', cx + 50, 70, 16, { fill: gold }); shapeEl(g, 'triangle', cx - 50, 110, 12, { fill: acc }); shapeEl(g, 'triangle', cx + 50, 110, 12, { fill: acc }); break;
      case 'balance-asym': sv('rect', { x: 18, y: 40, width: 74, height: 84, fill: isDark() ? '#6f7d8c' : '#b9c6d3' }, g); shapeEl(g, 'circle', w - 36, 54, 14, { fill: '#c0392b' }); sv('line', { x1: 8, y1: 128, x2: w - 8, y2: 128, stroke: ink, 'stroke-width': 1.5 }, g); break;
      case 'balance-radial': for (i = 0; i < 12; i++) { var a = i * M.PI / 6; shapeEl(g, 'oval', cx + M.cos(a) * 40, cy + M.sin(a) * 40, 14, { fill: i % 2 ? gold : acc, transform: 'rotate(' + (i * 30) + ' ' + (cx + M.cos(a) * 40) + ' ' + (cy + M.sin(a) * 40) + ')' }); } shapeEl(g, 'circle', cx, cy, 16, { fill: blue }); break;
      case 'contrast': sv('rect', { x: 0, y: 0, width: cx, height: hh, fill: '#151515' }, g); shapeEl(g, 'circle', cx - 40, cy, 26, { fill: '#f5f5f0' }); shapeEl(g, 'square', cx + 40, cy, 16, { fill: '#151515' }); break;
      case 'emphasis': for (i = 0; i < 14; i++) shapeEl(g, 'circle', 20 + (i % 7) * 26, 40 + M.floor(i / 7) * 70, 9, { fill: isDark() ? '#6f7d8c' : '#b9c6d3' }); shapeEl(g, 'circle', 20 + 4 * 26, 75, 17, { fill: '#c0392b' }); break;
      case 'movement': sv('path', { d: 'M10,120 C60,20 100,140 150,50 S190,30 200,20', fill: 'none', stroke: blue, 'stroke-width': 6, 'stroke-linecap': 'round' }, g); for (i = 0; i < 5; i++) shapeEl(g, 'triangle', 34 + i * 38, 100 - i * 16 + (i % 2) * 18, 7 + i, { fill: acc, transform: 'rotate(' + (40 + i * 6) + ' ' + (34 + i * 38) + ' ' + (100 - i * 16 + (i % 2) * 18) + ')' }); break;
      case 'pattern': for (i = 0; i < 24; i++) shapeEl(g, i % 2 ? 'diamond' : 'circle', 18 + (i % 6) * 34, 26 + M.floor(i / 6) * 34, 11, { fill: i % 2 ? gold : blue }); break;
      case 'rhythm-progressive': rhythmRow(g, 'progressive', w, hh, blue); break;
      case 'unity': for (i = 0; i < 9; i++) shapeEl(g, 'circle', 40 + (i % 3) * 60 + (M.floor(i / 3) % 2) * 8, 34 + M.floor(i / 3) * 40, 12 + (i % 3) * 2, { fill: ['#2a6db0', '#3f80c2', '#5a95d0'][i % 3] }); break;
      case 'variety': ['circle', 'square', 'triangle', 'star', 'hexagon', 'heart'].forEach(function (k, j) { shapeEl(g, k, 34 + (j % 3) * 66, 46 + M.floor(j / 3) * 62, 14 + (j % 2) * 8, { fill: [blue, gold, acc, '#3aa64a', '#7b3294', '#e86aa6'][j] }); }); break;
      case 'chaos': for (i = 0; i < 26; i++) { var r = R(); shapeEl(g, ['circle', 'square', 'triangle', 'star', 'hexagon', 'heart', 'diamond'][i % 7], R() * w, R() * hh, 6 + r * 18, { fill: ['#e03127', '#3aa64a', '#fde13a', '#2160b8', '#f5871f', '#7b3294', '#e86aa6'][(i * 3) % 7] }); } break;
      case 'dull': for (i = 0; i < 24; i++) shapeEl(g, 'square', 18 + (i % 6) * 34, 26 + M.floor(i / 6) * 34, 10, { fill: '#9aa0a6' }); break;
      case 'proportion': sv('rect', { x: cx - 26, y: 20, width: 52, height: 110, rx: 22, fill: acc }, g); shapeEl(g, 'circle', cx, 14 + 2, 12, { fill: acc }); [[cx - 62, 1], [cx + 62, 1], [cx - 94, 0.7], [cx + 94, 0.7]].forEach(function (q) { sv('rect', { x: q[0] - 10 * q[1], y: 130 - 50 * q[1], width: 20 * q[1], height: 50 * q[1], rx: 8, fill: blue }, g); shapeEl(g, 'circle', q[0], 124 - 56 * q[1], 7 * q[1], { fill: blue }); }); break;
      case 'positive-negative': sv('rect', { x: 0, y: 0, width: w, height: hh, fill: '#151515' }, g); sv('path', { d: 'M' + (cx - 30) + ',10 L' + (cx + 30) + ',10 C' + (cx + 20) + ',40 ' + (cx + 46) + ',60 ' + (cx + 22) + ',80 C' + (cx + 10) + ',92 ' + (cx + 34) + ',120 ' + (cx + 40) + ',140 L' + (cx - 40) + ',140 C' + (cx - 34) + ',120 ' + (cx - 10) + ',92 ' + (cx - 22) + ',80 C' + (cx - 46) + ',60 ' + (cx - 20) + ',40 ' + (cx - 30) + ',10 Z', fill: '#f5f5f0' }, g); break;
      case 'line': [0, 1, 2, 3].forEach(function (j) { linePath(['wavy', 'zigzag', 'curved', 'straight'][j], g, 10, 6 + j * 34, w - 20, 32, { class: 'arl-ink' }); }); break;
      case 'shape': shapeEl(g, 'triangle', 50, 76, 32, { fill: gold }); shapeEl(g, 'leaf', 140, 76, 34, { fill: '#3aa64a' }); break;
      case 'form': var gr = 'url(#ard-sph' + kind + ')'; var df = sv('defs', null, g), rg = sv('radialGradient', { id: 'ard-sph' + kind, cx: '35%', cy: '35%', r: '70%' }, df); sv('stop', { offset: '0', 'stop-color': '#ffffff' }, rg); sv('stop', { offset: '0.6', 'stop-color': '#7a96b8' }, rg); sv('stop', { offset: '1', 'stop-color': '#2b3d55' }, rg); sv('circle', { cx: cx, cy: cy - 4, r: 46, fill: gr }, g); sv('ellipse', { cx: cx + 18, cy: cy + 46, rx: 46, ry: 8, fill: 'rgba(0,0,0,.25)' }, g); break;
      case 'space': sv('rect', { x: 0, y: 0, width: w, height: 70, fill: isDark() ? '#2c3e55' : '#dcebf7' }, g); sv('path', { d: 'M0,150 L' + (cx - 6) + ',70 L' + (cx + 6) + ',70 L' + w + ',150 Z', fill: '#9c958a' }, g); [[30, 1], [70, 0.6], [92, 0.35]].forEach(function (q) { shapeEl(g, 'circle', q[0], 140 - 70 * (1 - q[1]) - 20 * q[1], 14 * q[1], { fill: '#3aa64a' }); shapeEl(g, 'circle', w - q[0], 140 - 70 * (1 - q[1]) - 20 * q[1], 14 * q[1], { fill: '#3aa64a' }); }); break;
      case 'value': A.valueScale(7).forEach(function (c, j) { sv('rect', { x: 10 + j * ((w - 20) / 7), y: 40, width: (w - 20) / 7, height: 70, fill: c }, g); }); break;
      case 'texture': var ctxG = sv('g', null, g); for (i = 0; i < 160; i++) { var x = R() * w, y = R() * hh; sv('line', { x1: x, y1: y, x2: x + 3 + R() * 4, y2: y + 6 + R() * 5, stroke: '#7a5230', 'stroke-width': 1.3 }, ctxG); } break;
      case 'color': ['red', 'orange', 'yellow', 'green', 'blue', 'violet'].forEach(function (k, j) { shapeEl(g, 'circle', 22 + j * 32, cy, 14, { fill: A.hue(k).hex }); }); break;
    }
  }
  V.register('ar-design', function (el, o) {
    var F = frame(el, o, 'design', 'Designs'), kinds = [].concat(o.kinds || o.kind || ['balance-sym', 'balance-asym', 'balance-radial']);
    var grid = h('div', 'arl-grid'); grid.style.setProperty('--n', M.min(kinds.length, o.columns || 3)); F.body.appendChild(grid);
    var picks = o.target && F.interactive && !F.quiet, chosen = null, cards = [];
    kinds.forEach(function (k, i) {
      var card = h(picks ? 'button' : 'div', 'arl-card'); if (picks) { card.type = 'button'; card.setAttribute('aria-pressed', 'false'); }
      var s = svgRoot(200, 150, F.quiet ? 'Design ' + letter(i) : 'A design showing ' + (A.DESIGNS[k] || k)); designPanel(s, k, 200, 150, seeded(k + (o.seed || ''))); card.appendChild(s);
      card.appendChild(h('span', 'arl-lab' + (F.quiet || o.letters ? ' arl-letter' : ''), F.quiet || o.letters ? letter(i) : cap1(A.DESIGNS[k] || k)));
      if (picks) card.addEventListener('click', function () { chosen = k; cards.forEach(function (c) { c.el.setAttribute('aria-pressed', String(c.k === k)); c.el.classList.remove('ok', 'no'); }); F.say(''); });
      grid.appendChild(card); cards.push({ k: k, el: card });
    });
    if (picks) btn(F.ctl, 'Check', function () { if (!chosen) { F.say('Tap a design first.'); return; } var good = chosen === o.target; cards.forEach(function (c) { if (c.k === chosen) c.el.classList.add(good ? 'ok' : 'no'); }); F.say(good ? okMark(true) + ' Yes: ' + A.DESIGNS[o.target] + '.' : okMark(false) + ' That one shows ' + A.DESIGNS[chosen] + '.'); }, 'pri');
    return {};
  });

  /* ---------- ar-compose: thirds, center, diagonals, focal point and leading lines over a picture ---------- */
  function sceneComp(g, w, hh, sc) { // a generated landscape: horizon at sc.hy (fraction), a subject (tree, house, boat, rock) at sc.sx, sc.sy
    var hy = sc.hy * hh, sx = sc.sx * w, sy = sc.sy * hh, kind = sc.subject || 'tree', sea = kind === 'boat' || sc.sea;
    sv('rect', { x: 0, y: 0, width: w, height: hy, fill: '#bcd9ef' }, g);
    sv('rect', { x: 0, y: hy, width: w, height: hh - hy, fill: sea ? '#5f93b8' : '#9cc58a' }, g);
    if (!sea) sv('path', { d: 'M0,' + hy + ' Q' + (w * 0.3) + ',' + (hy - 18) + ' ' + (w * 0.55) + ',' + hy + ' T' + w + ',' + (hy - 6) + ' L' + w + ',' + hy + ' Z', fill: '#86b277' }, g);
    if (sc.road) sv('path', { d: 'M' + (w * 0.25) + ',' + hh + ' Q' + (w * 0.5) + ',' + (hy + (hh - hy) * 0.5) + ' ' + sx + ',' + (hy + 4) + ' L' + (sx + 6) + ',' + (hy + 4) + ' Q' + (w * 0.62) + ',' + (hy + (hh - hy) * 0.5) + ' ' + (w * 0.5) + ',' + hh + ' Z', fill: '#d9c9a3' }, g);
    if (kind === 'tree') { sv('rect', { x: sx - 5, y: sy - 4, width: 10, height: 40, fill: '#6b4a2a' }, g); sv('path', { d: cloudPath(sx, sy - 24, 30, 26, 8), fill: '#3f7f3a' }, g); }
    else if (kind === 'house') { sv('rect', { x: sx - 22, y: sy - 18, width: 44, height: 34, fill: '#e8c66a' }, g); sv('polygon', { points: (sx - 28) + ',' + (sy - 18) + ' ' + (sx + 28) + ',' + (sy - 18) + ' ' + sx + ',' + (sy - 42), fill: '#b5473a' }, g); sv('rect', { x: sx - 5, y: sy - 2, width: 10, height: 18, fill: '#6b4a2a' }, g); }
    else if (kind === 'boat') { sv('path', { d: 'M' + (sx - 30) + ',' + sy + ' L' + (sx + 30) + ',' + sy + ' L' + (sx + 20) + ',' + (sy + 12) + ' L' + (sx - 20) + ',' + (sy + 12) + ' Z', fill: '#7a4a2a' }, g); sv('polygon', { points: sx + ',' + (sy - 46) + ' ' + sx + ',' + (sy - 4) + ' ' + (sx + 26) + ',' + (sy - 6), fill: '#f4f1ea' }, g); sv('line', { x1: sx, y1: sy - 48, x2: sx, y2: sy, stroke: '#4a3020', 'stroke-width': 2 }, g); }
    else { sv('path', { d: blobPath(sx, sy, 24, [1, 0.8, 0.9, 1, 0.85, 0.95, 0.8, 0.9], 0.65), fill: '#7d7a72' }, g); }
    if (sc.sun) sv('circle', { cx: sc.sun[0] * w, cy: sc.sun[1] * hh, r: 12, fill: '#f6c445' }, g);
  }
  A.thirdsOf = function (f) { return M.abs(f - 1 / 3) < 0.06 ? 'first third line' : M.abs(f - 2 / 3) < 0.06 ? 'second third line' : M.abs(f - 0.5) < 0.06 ? 'center' : 'none'; };
  V.register('ar-compose', function (el, o) {
    var F = frame(el, o, 'compose', 'A composition with guide lines');
    var overlays = [].concat(o.overlays || o.overlay || ['thirds']);
    if (o.mode === 'thumbs') {
      var list = o.thumbs || [{ sx: 0.5, sy: 0.55, hy: 0.5 }, { sx: 0.33, sy: 0.6, hy: 0.67 }, { sx: 0.85, sy: 0.85, hy: 0.25 }], grid = h('div', 'arl-grid'); grid.style.setProperty('--n', M.min(list.length, 3)); F.body.appendChild(grid);
      list.forEach(function (sc, i) { var c = h('div', 'arl-card'), s0 = svgRoot(160, 110, 'Thumbnail ' + letter(i)); sceneComp(s0, 160, 110, sc); if (o.showGrid) thirds(s0, 160, 110); c.appendChild(s0); c.appendChild(h('span', 'arl-lab arl-letter', letter(i))); grid.appendChild(c); });
      return {};
    }
    var wk = o.work ? A.work(o.work) : null, useImg = wk && A.hasImg(wk), ar = useImg ? (wk.w && wk.h ? wk.w / wk.h : 1.33) : (o.aspect || 1.5);
    var wrap = h('div', 'arcm-wrap'); F.body.appendChild(wrap);
    var W0 = 300, H0 = M.round(W0 / ar), s = svgRoot(W0, H0, useImg ? (F.quiet ? 'A painting with guide lines' : wk.title + ' with guide lines') : 'A landscape with guide lines'); wrap.appendChild(s);
    if (useImg) sv('image', { href: A.imgUrl(wk), x: 0, y: 0, width: W0, height: H0, preserveAspectRatio: 'xMidYMid slice' }, s);
    else if (wk) { sv('rect', { x: 0, y: 0, width: W0, height: H0, class: 'arcm-none' }, s); txt(s, W0 / 2, H0 / 2, 'Picture not available yet', { 'text-anchor': 'middle', class: 'arcm-nonet' }); }
    else sceneComp(s, W0, H0, Object.assign({ sx: 0.33, sy: 0.6, hy: 0.62, subject: 'tree' }, o.scene || {}));
    var gO = sv('g', null, s), focal = o.focal || (o.scene ? [o.scene.sx, o.scene.sy - (o.scene.subject === 'boat' ? 0.08 : 0.1)] : null), placed = null;
    function drawO() {
      while (gO.firstChild) gO.removeChild(gO.firstChild);
      if (overlays.indexOf('thirds') >= 0) thirds(gO, W0, H0);
      if (overlays.indexOf('center') >= 0) { sv('line', { x1: W0 / 2, y1: 0, x2: W0 / 2, y2: H0, class: 'arcm-c' }, gO); sv('line', { x1: 0, y1: H0 / 2, x2: W0, y2: H0 / 2, class: 'arcm-c' }, gO); }
      if (overlays.indexOf('diagonals') >= 0) { sv('line', { x1: 0, y1: 0, x2: W0, y2: H0, class: 'arcm-d' }, gO); sv('line', { x1: W0, y1: 0, x2: 0, y2: H0, class: 'arcm-d' }, gO); }
      if (o.shape && !F.quiet) sv('polygon', { points: o.shape.map(function (p) { return (p[0] * W0) + ',' + (p[1] * H0); }).join(' '), class: 'arcm-shape' }, gO);
      if (o.lines && !F.quiet) o.lines.forEach(function (l) { sv('line', { x1: l[0] * W0, y1: l[1] * H0, x2: l[2] * W0, y2: l[3] * H0, class: 'arcm-lead', 'marker-end': '' }, gO); sv('circle', { cx: l[2] * W0, cy: l[3] * H0, r: 3.5, class: 'arcm-leaddot' }, gO); });
      if (focal && overlays.indexOf('focal') >= 0 && !F.quiet) { sv('circle', { cx: focal[0] * W0, cy: focal[1] * H0, r: 16, class: 'arcm-focal' }, gO); txt(gO, focal[0] * W0, focal[1] * H0 - 22, 'focal point', { class: 'arcm-flab', 'text-anchor': 'middle' }); }
      if (placed) sv('circle', { cx: placed[0] * W0, cy: placed[1] * H0, r: 10, class: 'arcm-tap' }, gO);
    }
    drawO();
    if (F.interactive && !F.quiet && o.toggles !== false && !o.tap) { var bar = h('div', 'arw-toggles'); F.ctl.appendChild(bar); [['thirds', 'Thirds'], ['center', 'Center lines'], ['diagonals', 'Diagonals']].concat(focal ? [['focal', 'Focal point']] : []).forEach(function (q) { var b = btn(bar, q[1], function () { var i = overlays.indexOf(q[0]); if (i >= 0) overlays.splice(i, 1); else overlays.push(q[0]); b.setAttribute('aria-pressed', String(overlays.indexOf(q[0]) >= 0)); drawO(); }); b.setAttribute('aria-pressed', String(overlays.indexOf(q[0]) >= 0)); }); }
    if (F.interactive && !F.quiet && o.tap && focal) {
      wrap.appendChild(h('p', 'arv-hint', 'Tap where your eye goes first.'));
      s.addEventListener('click', function (e) { var p = svgPt(s, e); placed = [p.x / W0, p.y / H0]; drawO(); var d = M.hypot((placed[0] - focal[0]) * W0, (placed[1] - focal[1]) * H0); F.say(d < W0 * 0.12 ? okMark(true) + ' Yes, that is the focal point.' + (o.why ? ' ' + o.why : '') : okMark(false) + ' Look for the strongest contrast, the most detail, or where the lines lead.'); });
    }
    if (!F.quiet && (useImg || wk)) wrap.appendChild(h('p', 'ml-cap', esc(wk.title) + ', ' + esc(wk.artist) + ', ' + esc(wk.date) + '.'));
    return {};
  });
  function thirds(g, w, hh) { for (var i = 1; i < 3; i++) { sv('line', { x1: i * w / 3, y1: 0, x2: i * w / 3, y2: hh, class: 'arcm-t' }, g); sv('line', { x1: 0, y1: i * hh / 3, x2: w, y2: i * hh / 3, class: 'arcm-t' }, g); } for (i = 1; i < 3; i++) for (var j = 1; j < 3; j++) sv('circle', { cx: i * w / 3, cy: j * hh / 3, r: 3.5, class: 'arcm-x' }, g); }
  A._ui.sceneComp = sceneComp;

  /* ---------- ar-artwork: a work from the catalog, zoomable, with hotspots and its label ---------- */
  function placeholder(wk, quiet) {
    var d = h('div', 'ara-ph'); d.setAttribute('role', 'img'); d.setAttribute('aria-label', quiet ? 'Picture not available' : 'No picture yet: ' + wk.title);
    d.innerHTML = '<span class="ara-ph-frame">' + (quiet ? '<b>Picture not available</b>' : '<b>' + esc(wk.title) + '</b><span>' + esc(wk.artist) + ', ' + esc(wk.date) + '</span>' + (wk.pd ? '<small>The picture is on its way.</small>' : '<small>Still under copyright, so it is described here instead of shown.</small>')) + '</span>';
    return d;
  }
  function labelHtml(wk, full) {
    var c = A.city(wk.now), p = A.period(wk.period);
    return '<b class="ara-t">' + esc(wk.title) + '</b><span class="ara-a">' + esc(wk.artist) + ', ' + esc(wk.date) + '</span>' + (full ? '<span class="ara-m">' + esc(wk.medium) + ' · ' + esc(wk.at) + '</span>' + (p ? '<span class="ara-p">' + esc(p.name) + (wk.style ? ' · ' + esc(wk.style) : '') + '</span>' : '') + (wk.note ? '<span class="ara-n">' + esc(wk.note) + '</span>' : '') + (wk.credit ? '<span class="ara-cr">Image: ' + esc(wk.credit) + '</span>' : '') : '');
  }
  V.register('ar-artwork', function (el, o) {
    var wk = A.work(o.work || o.id), F = frame(el, o, 'artwork', wk ? (o.quiet ? 'A work of art' : wk.title + ', ' + wk.artist) : 'A work of art');
    if (!wk) { F.body.appendChild(h('p', 'arv-hint', 'Unknown work: ' + esc(o.work))); return {}; }
    if (!A.hasImg(wk)) { F.body.appendChild(placeholder(wk, F.quiet)); if (!F.quiet && o.label !== false) F.body.appendChild(h('p', 'ara-label', labelHtml(wk, true))); return {}; }
    var view = h('div', 'ara-view'); F.body.appendChild(view);
    var img = h('img', 'ara-img'); img.src = A.imgUrl(wk); img.alt = F.quiet ? 'The work of art for this question' : wk.title + ', by ' + wk.artist + ', ' + wk.date; img.loading = 'lazy'; img.draggable = false; view.appendChild(img);
    if (wk.w && wk.h) view.style.aspectRatio = wk.w + ' / ' + wk.h;
    var z = 1, tx = 0, ty = 0, layer = h('div', 'ara-layer'); view.appendChild(layer);
    var spots = (o.hotspots || []).map(function (hs, i) { var b = h('button', 'ara-spot', String(i + 1)); b.type = 'button'; b.setAttribute('aria-label', 'Detail ' + (i + 1) + (F.quiet ? '' : ': ' + (hs.label || ''))); b.style.left = (hs.x * 100) + '%'; b.style.top = (hs.y * 100) + '%'; b.addEventListener('click', function () { F.say('<b>' + (i + 1) + '.</b> ' + (F.quiet ? '' : '<b>' + esc(hs.label || '') + '</b> ') + (hs.text || '')); }); layer.appendChild(b); return b; });
    function apply() { var t = 'translate(' + tx + 'px,' + ty + 'px) scale(' + z + ')'; img.style.transform = t; layer.style.transform = t; spots.forEach(function (b) { b.style.transform = 'translate(-50%,-50%) scale(' + (1 / z) + ')'; }); }
    function clamp() { var w = view.clientWidth, hh = view.clientHeight; tx = M.min(0, M.max(w - w * z, tx)); ty = M.min(0, M.max(hh - hh * z, ty)); }
    function zoomAt(f, cx, cy) { var nz = M.max(1, M.min(6, z * f)); tx = cx - (cx - tx) * nz / z; ty = cy - (cy - ty) * nz / z; z = nz; clamp(); apply(); }
    if (F.interactive && o.zoom !== false) {
      view.addEventListener('wheel', function (e) { if (!e.ctrlKey && z === 1 && e.deltaY > 0) return; e.preventDefault(); var r = view.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
      var pts = {}, last = null;
      view.addEventListener('pointerdown', function (e) { if (e.target.closest('.ara-spot')) return; pts[e.pointerId] = [e.clientX, e.clientY]; view.setPointerCapture(e.pointerId); last = null; });
      view.addEventListener('pointermove', function (e) {
        if (!pts[e.pointerId]) return; var ids = Object.keys(pts), prev = pts[e.pointerId]; pts[e.pointerId] = [e.clientX, e.clientY];
        if (ids.length === 2) { var a = pts[ids[0]], b = pts[ids[1]], d = M.hypot(a[0] - b[0], a[1] - b[1]), r = view.getBoundingClientRect(); if (last) zoomAt(d / last, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top); last = d; }
        else if (z > 1) { tx += e.clientX - prev[0]; ty += e.clientY - prev[1]; clamp(); apply(); }
      });
      ['pointerup', 'pointercancel'].forEach(function (t) { view.addEventListener(t, function (e) { delete pts[e.pointerId]; last = null; }); });
      btn(F.ctl, '＋ Zoom in', function () { zoomAt(1.5, view.clientWidth / 2, view.clientHeight / 2); }); btn(F.ctl, '－ Zoom out', function () { zoomAt(1 / 1.5, view.clientWidth / 2, view.clientHeight / 2); }); btn(F.ctl, 'Reset', function () { z = 1; tx = ty = 0; apply(); });
    }
    if (!F.quiet && o.label !== false) F.body.appendChild(h('p', 'ara-label', labelHtml(wk, o.full !== false)));
    return {};
  });

  /* ---------- ar-compare: two works side by side ---------- */
  V.register('ar-compare', function (el, o) {
    var ids = o.works || [o.a, o.b], ws = ids.map(A.work), F = frame(el, o, 'compare', 'Two works compared');
    var row = h('div', 'arcp-row'); F.body.appendChild(row);
    ws.forEach(function (wk, i) {
      var c = h('figure', 'arcp-card'); if (!wk) return;
      if (A.hasImg(wk)) { var im = h('img', 'arcp-img'); im.src = A.imgUrl(wk); im.alt = F.quiet ? 'Work ' + letter(i) : wk.title + ', ' + wk.artist; im.loading = 'lazy'; c.appendChild(im); } else c.appendChild(placeholder(wk, F.quiet));
      c.appendChild(h('figcaption', 'arcp-cap', '<span class="arl-letter">' + letter(i) + '</span>' + (F.quiet ? '' : labelHtml(wk, false))));
      row.appendChild(c);
    });
    if (!F.quiet && o.table !== false && ws[0] && ws[1]) {
      var rowsT = o.rows || ['period', 'date', 'medium', 'genre', 'made'], names = { period: 'Period', date: 'Date', medium: 'Medium', genre: 'Subject', made: 'Made in', at: 'Now in', style: 'Style' };
      var tb = '<table class="arcp-tab"><thead><tr><th></th><th>A</th><th>B</th></tr></thead><tbody>' + rowsT.map(function (r) { return '<tr><th>' + names[r] + '</th>' + ws.map(function (wk) { var v = r === 'period' ? (A.period(wk.period) || {}).name : r === 'made' ? (A.city(wk.made) || [])[0] : r === 'genre' ? A.GENRES[wk.genre] || wk.genre : wk[r]; return '<td>' + esc(v || '') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
      F.body.appendChild(h('div', 'arcp-tw', tb));
    }
    if (o.points && !F.quiet) F.body.appendChild(h('ul', 'arcp-pts', o.points.map(function (p) { return '<li>' + p + '</li>'; }).join('')));
    return {};
  });

  /* ---------- ar-timeline: periods on tracks, with works as dots; put in order; pick a period ---------- */
  V.register('ar-timeline', function (el, o) {
    var F = frame(el, o, 'timeline', 'A timeline of periods');
    if (o.mode === 'order') return orderMode(el, o, F);
    var keys = o.periods || A.PERIODS.filter(function (p) { return !o.tracks || o.tracks.indexOf(p.track) >= 0; }).map(function (p) { return p.key; });
    var ps = keys.map(A.period).filter(Boolean), from = o.from !== undefined ? o.from : M.max(-3500, M.min.apply(null, ps.map(function (p) { return p.start; }))), to = o.to !== undefined ? o.to : M.min(2000, M.max.apply(null, ps.map(function (p) { return p.end; })));
    ps = ps.filter(function (p) { return p.end > from && p.start < to; });
    var tracks = []; ps.forEach(function (p) { if (tracks.indexOf(p.track) < 0) tracks.push(p.track); });
    var W0 = 640, rh = 26, pad = 18, top = 28, y = top, trackY = {};
    var X = function (yr) { return pad + (M.max(from, M.min(to, yr)) - from) / (to - from) * (W0 - 2 * pad); };
    var labOf = function (p, i) { return F.quiet && o.hideNames ? letter(i) : p.name; };
    // pack bars into rows in pixel space: a bar's label sits inside it when it fits, otherwise just after it
    var rows = [], rowOf = {}, lw = function (t) { return t.length * 6.4 + 12; };
    tracks.forEach(function (t) { var tr = []; ps.map(function (p, i) { return { p: p, i: i }; }).filter(function (q) { return q.p.track === t; }).sort(function (a, b) { return a.p.start - b.p.start; }).forEach(function (q) {
      var p = q.p, x1 = X(p.start), x2 = X(p.end), L = lw(labOf(p, q.i)), fits = x2 - x1 >= L, right = fits ? x2 : x2 + L, left = x1;
      if (!fits && x2 + L > W0 - pad) { left = x1 - L; right = x2; }
      for (var r = 0; r < tr.length; r++) if (tr[r] <= left - 3) { tr[r] = right; rowOf[p.key] = { t: t, r: r }; return; }
      tr.push(right); rowOf[p.key] = { t: t, r: tr.length - 1 }; }); rows.push({ t: t, n: tr.length }); });
    rows.forEach(function (r) { trackY[r.t] = y + (tracks.length > 1 ? 16 : 0); y += (tracks.length > 1 ? 16 : 0) + r.n * rh + 8; });
    var H0 = y + 26, s = svgRoot(W0, H0, 'Timeline from ' + A.yearText(from) + ' to ' + A.yearText(to)); s.classList.add('art-svg'); F.body.appendChild(s);
    // axis
    var step = niceStep(to - from); sv('line', { x1: pad, y1: H0 - 22, x2: W0 - pad, y2: H0 - 22, class: 'art-axis' }, s);
    for (var t0 = M.ceil(from / step) * step; t0 <= to; t0 += step) { sv('line', { x1: X(t0), y1: top - 6, x2: X(t0), y2: H0 - 18, class: 'art-grid' }, s); txt(s, X(t0), H0 - 6, t0 === 0 ? 'AD 1' : A.yearText(t0), { class: 'art-tick', 'text-anchor': X(t0) < 30 ? 'start' : X(t0) > W0 - 30 ? 'end' : 'middle' }); }
    tracks.forEach(function (t) { if (tracks.length > 1) txt(s, pad, trackY[t] - 4, (A.TRACKS.filter(function (q) { return q.key === t; })[0] || { name: t }).name, { class: 'art-track' }); });
    var picks = o.target && F.interactive && !F.quiet, chosen = null, barEls = {};
    var palette = ['#b8197f', '#2a6db0', '#8a6512', '#3a8a5a', '#7b3294', '#c2491d', '#0c8599'];
    ps.forEach(function (p, i) {
      var ro = rowOf[p.key], x1 = X(p.start), x2 = X(p.end), yy = trackY[ro.t] + ro.r * rh, gg = sv('g', { class: 'art-bar' + (picks ? ' pick' : ''), tabindex: picks ? 0 : null, role: picks ? 'button' : null, 'aria-label': F.quiet && o.hideNames ? 'Period ' + letter(i) : p.name + ', ' + A.yearText(p.start) + ' to ' + A.yearText(p.end) }, s);
      sv('rect', { x: x1, y: yy, width: M.max(4, x2 - x1), height: rh - 6, rx: 5, fill: palette[i % palette.length], 'fill-opacity': 0.85 }, gg);
      if (p.start < from) txt(gg, x1 + 3, yy + 14, '◀', { class: 'art-blab' });
      var lab = labOf(p, i), fits = (x2 - x1) >= lw(lab);
      var t = txt(gg, x1 + (p.start < from ? 14 : 5), yy + 14, lab, { class: 'art-blab' + (fits ? '' : ' out') });
      if (!fits) { t.setAttribute('x', x2 + 4); if (x2 + lw(lab) > W0 - pad) { t.setAttribute('x', x1 - 4); t.setAttribute('text-anchor', 'end'); } }
      barEls[p.key] = gg;
      if (picks) { var go = function () { chosen = p.key; Object.keys(barEls).forEach(function (k) { barEls[k].classList.toggle('sel', k === chosen); }); F.say(''); }; gg.addEventListener('click', go); gg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); }
    });
    (o.works || []).forEach(function (id, i) { var wk = A.work(id); if (!wk || wk.year < from || wk.year > to) return; var ro = rowOf[wk.period], yy = ro ? trackY[ro.t] + ro.r * rh + (rh - 6) / 2 : top; sv('circle', { cx: X(wk.year), cy: yy, r: 6, class: 'art-work' }, s); txt(s, X(wk.year), yy - 9, F.quiet ? String(i + 1) : wk.title.length > 22 ? wk.title.slice(0, 20) + '…' : wk.title, { class: 'art-wlab', 'text-anchor': 'middle' }); });
    if (picks) btn(F.ctl, 'Check', function () { if (!chosen) { F.say('Tap a period first.'); return; } var good = [].concat(o.target).indexOf(chosen) >= 0; barEls[chosen].classList.add(good ? 'ok' : 'no'); F.say(good ? okMark(true) + ' Yes: ' + A.period(chosen).name + '.' : okMark(false) + ' That is ' + A.period(chosen).name + ' (' + A.yearText(A.period(chosen).start) + ' to ' + A.yearText(A.period(chosen).end) + ').'); }, 'pri');
    return {};
  });
  function niceStep(span) { var raw = span / 8, m = M.pow(10, M.floor(M.log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m; }
  function orderMode(el, o, F) { // put periods or works in time order
    var items = (o.items || []).map(function (k) { var p = A.period(k), wk = A.work(k); return p ? { k: k, text: p.name, y: p.start } : wk ? { k: k, text: wk.title + (o.artist !== false ? ' (' + wk.artist + ')' : ''), y: wk.year } : { k: k, text: k, y: 0 }; });
    var right = items.slice().sort(function (a, b) { return a.y - b.y; }), order = o.start ? o.start.map(function (i) { return items[i]; }) : derange(items.length, items.map(function (q) { return q.k; }).join()).map(function (i) { return right[i]; });
    var list = h('ol', 'art-order'); F.body.appendChild(list);
    var sel = -1;
    function paint(mark) {
      list.innerHTML = '';
      order.forEach(function (it, i) {
        var li = h('li', 'art-oi' + (mark ? (it === right[i] ? ' ok' : ' no') : '')), b = h(F.quiet || !F.interactive ? 'span' : 'button', 'art-ob', '<span class="arl-letter">' + letter(items.indexOf(it)) + '</span> ' + esc(it.text) + (mark && !F.quiet ? ' <small>' + esc(A.yearText(it.y)) + '</small>' : ''));
        if (b.tagName === 'BUTTON') { b.type = 'button'; b.setAttribute('aria-pressed', String(sel === i)); b.addEventListener('click', function () { if (sel < 0) { sel = i; paint(); } else { var t = order[sel]; order[sel] = order[i]; order[i] = t; sel = -1; paint(); F.say(''); } }); }
        li.appendChild(b); list.appendChild(li);
      });
    }
    paint();
    if (F.interactive && !F.quiet) {
      F.body.insertBefore(h('p', 'arv-hint', 'Tap two items to swap them. Earliest at the top.'), list);
      btn(F.ctl, 'Check', function () { var wrong = order.filter(function (it, i) { return it !== right[i]; }).length; paint(true); F.say(wrong ? okMark(false) + ' ' + plural(wrong, 'item is', 'items are') + ' out of place.' : okMark(true) + ' In order, earliest to latest.'); }, 'pri');
    }
    return {};
  }

  /* ---------- ar-map: where works were made and where they are now ---------- */
  var REGIONS = { world: [-170, 180, -56, 76], europe: [-12, 42, 34, 61], mediterranean: [-10, 56, 22, 50], asia: [60, 146, -8, 52], africa: [-20, 55, -36, 38], americas: [-130, -32, -42, 60], usa: [-126, -65, 23, 50], mesoamerica: [-110, -70, 5, 32], 'east-asia': [95, 146, 18, 46], 'middle-east': [25, 65, 20, 42] };
  V.register('ar-map', function (el, o) {
    var F = frame(el, o, 'map', 'A map');
    var bb = REGIONS[o.region || 'world'] || o.bbox || REGIONS.world, lon0 = bb[0], lon1 = bb[1], lat0 = bb[2], lat1 = bb[3];
    var kx = M.cos((lat0 + lat1) / 2 * M.PI / 180), W0 = 640, H0 = M.round(W0 * (lat1 - lat0) / ((lon1 - lon0) * kx));
    H0 = M.max(220, M.min(520, H0));
    var X = function (lon) { return (lon - lon0) / (lon1 - lon0) * W0; }, Y = function (lat) { return (lat1 - lat) / (lat1 - lat0) * H0; };
    var s = svgRoot(W0, H0, 'A map' + (o.region ? ' of ' + o.region : '')); s.classList.add('arm-svg'); F.body.appendChild(s);
    sv('rect', { x: 0, y: 0, width: W0, height: H0, class: 'arm-sea' }, s);
    var d = '', LB = A.LAND50_BOX, fine = lon0 >= LB[0] && lon1 <= LB[1] && lat0 >= LB[2] && lat1 <= LB[3];
    (fine ? A.land50() : A.land()).forEach(function (ring) { var seg = ''; ring.forEach(function (p, i) { seg += (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }); d += seg + 'Z'; });
    if (fine) { sv('path', { d: d, class: 'arm-coast' }, s); sv('path', { d: d, class: 'arm-land arm-fill' }, s); } else sv('path', { d: d, class: 'arm-land' }, s);
    var marks = (o.works || []).map(function (id) { var wk = A.work(id); return wk ? { wk: wk, c: A.city(o.where === 'now' ? wk.now : wk.made) } : null; }).filter(Boolean);
    (o.places || []).forEach(function (k) { var c = A.city(k); if (c) marks.push({ c: c, k: k }); });
    if (o.travel) marks.forEach(function (m) { if (!m.wk) return; var a = A.city(m.wk.made), b = A.city(m.wk.now); if (a && b && a !== b) sv('path', { d: 'M' + X(a[2]) + ',' + Y(a[1]) + ' Q' + ((X(a[2]) + X(b[2])) / 2) + ',' + (M.min(Y(a[1]), Y(b[1])) - 30) + ' ' + X(b[2]) + ',' + Y(b[1]), class: 'arm-travel' }, s); });
    var picks = o.target && F.interactive && !F.quiet, chosen = null, dots = [];
    marks.forEach(function (m, i) {
      var x = X(m.c[2]), y = Y(m.c[1]); if (x < -5 || x > W0 + 5 || y < -5 || y > H0 + 5) return;
      var gg = sv('g', { class: 'arm-mark' + (picks ? ' pick' : ''), tabindex: picks ? 0 : null, role: picks ? 'button' : null, 'aria-label': F.quiet ? 'Place ' + letter(i) : m.c[0] + (m.wk ? ': ' + m.wk.title : '') }, s);
      sv('circle', { cx: x, cy: y, r: 6.5, class: 'arm-dot' }, gg);
      var lab = F.quiet || o.letters ? letter(i) : (o.labels === 'works' && m.wk ? m.wk.title : m.c[0]);
      var tt = txt(gg, x + 9, y + 4, lab, { class: 'arm-lab' }); if (x > W0 * 0.75) { tt.setAttribute('x', x - 9); tt.setAttribute('text-anchor', 'end'); }
      dots.push({ g: gg, m: m, i: i });
      if (picks) { var go = function () { chosen = i; dots.forEach(function (q) { q.g.classList.toggle('sel', q.i === i); }); F.say(''); }; gg.addEventListener('click', go); gg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); }
    });
    if (picks) btn(F.ctl, 'Check', function () { if (chosen === null) { F.say('Tap a place first.'); return; } var m = marks[chosen], good = m.k === o.target || (m.wk && m.wk.id === o.target); F.say(good ? okMark(true) + ' Yes: ' + m.c[0] + '.' : okMark(false) + ' That is ' + m.c[0] + '.'); }, 'pri');
    if (!F.quiet) F.body.appendChild(h('p', 'ml-cap', 'Coastlines: Natural Earth (public domain).'));
    return {};
  });

  /* ---------- ar-sort: sort cards into groups (period, style, element, principle, warm or cool…) ---------- */
  V.register('ar-sort', function (el, o) {
    var F = frame(el, o, 'sort', 'Sort the cards into groups');
    var bins = o.bins || ['Group 1', 'Group 2'], cards = (o.cards || []).map(function (c, i) { return typeof c === 'string' ? { text: c, i: i } : Object.assign({ i: i }, c); });
    if (o.shuffle !== false) cards = shuffle(cards, JSON.stringify(o.cards || []));
    var place = {}, sel = null, checked = false; cards.forEach(function (c) { place[c.i] = -1; });
    if (F.interactive && !F.quiet) F.body.appendChild(h('p', 'arv-hint', 'Tap a card, then tap a group. With a keyboard, focus a card and press a group\'s number (0 puts it back).'));
    var pool = h('div', 'arsr-pool'); pool.setAttribute('aria-label', 'Cards not yet sorted'); F.body.appendChild(pool);
    var grid = h('div', 'arsr-bins'); grid.style.setProperty('--cols', o.columns || M.min(bins.length, 3)); F.body.appendChild(grid);
    var binEls = bins.map(function (b, bi) { var d = h('div', 'arsr-bin'); d.setAttribute('role', 'group'); d.setAttribute('aria-label', b); d.appendChild(h('p', 'arsr-binlab', (F.interactive && !F.quiet ? '<span class="arsr-n">' + (bi + 1) + '</span>' : '') + esc(b))); var list = h('div', 'arsr-list'); d.appendChild(list); d._list = list; d.addEventListener('click', function (e) { if (sel !== null && !e.target.closest('.arsr-card')) move(sel, bi); }); grid.appendChild(d); return d; });
    pool.addEventListener('click', function (e) { if (sel !== null && !e.target.closest('.arsr-card')) move(sel, -1); });
    var cardEls = {};
    cards.forEach(function (c) {
      var icon = '';
      if (c.swatch) icon = '<span class="arsr-sw" style="background:' + esc(c.swatch) + '"></span>';
      else if (c.work && A.hasImg(c.work)) icon = '<img class="arsr-img" alt="" src="' + A.imgUrl(c.work) + '" loading="lazy">';
      else if (c.shape || c.line) { var tmp = svgRoot(40, 40, ''); if (c.shape) shapeEl(tmp, c.shape, 20, 20, 15, { fill: SHAPE_FILL[c.shape] || '#888' }); else linePath(c.line, tmp, 0, 0, 40, 40, { 'stroke-width': 2.5 }); icon = '<span class="arsr-ic" aria-hidden="true">' + tmp.outerHTML + '</span>'; }
      var b = h('button', 'arsr-card', icon + '<span>' + esc(c.text || '') + '</span>'); b.type = 'button';
      if (!F.interactive || F.quiet) b.disabled = true;
      b.addEventListener('click', function () { sel = sel === c.i ? null : c.i; paint(); });
      b.addEventListener('keydown', function (e) { var k = parseInt(e.key, 10); if (!isNaN(k) && k <= bins.length) { e.preventDefault(); move(c.i, k - 1); b.focus(); } else if (e.key === 'Escape') { sel = null; paint(); } });
      cardEls[c.i] = b;
    });
    function move(i, bi) { place[i] = bi; sel = null; checked = false; paint(); F.say(''); }
    function paint() {
      cards.forEach(function (c) { var b = cardEls[c.i], p = place[c.i]; (p < 0 ? pool : binEls[p]._list).appendChild(b); b.setAttribute('aria-pressed', String(sel === c.i)); b.classList.remove('ok', 'no'); if (checked && p >= 0 && c.bin !== undefined) b.classList.add(p === c.bin ? 'ok' : 'no'); b.setAttribute('aria-label', (c.text || 'card') + (p >= 0 ? ', in ' + bins[p] : ', not sorted')); });
      pool.classList.toggle('empty', !cards.some(function (c) { return place[c.i] < 0; }));
      binEls.forEach(function (d) { d.classList.toggle('target', sel !== null); });
    }
    if (F.interactive && !F.quiet && cards.some(function (c) { return c.bin !== undefined; })) {
      btn(F.ctl, 'Check', function () { var left = cards.filter(function (c) { return place[c.i] < 0; }).length; if (left) { F.say('Sort every card first (' + plural(left, 'card') + ' left).'); return; } checked = true; paint(); var wrong = cards.filter(function (c) { return place[c.i] !== c.bin; }); F.say(wrong.length ? okMark(false) + ' ' + (cards.length - wrong.length) + ' of ' + cards.length + ' are right.' + wrong.filter(function (c) { return c.why; }).slice(0, 2).map(function (c) { return '<br><b>' + esc(c.text) + '</b> ' + c.why; }).join('') : okMark(true) + ' All ' + cards.length + ' are in the right groups.'); }, 'pri');
      btn(F.ctl, 'Start over', function () { cards.forEach(function (c) { place[c.i] = -1; }); checked = false; sel = null; paint(); F.say(''); });
      if (o.reveal !== false) btn(F.ctl, 'Show me', function () { cards.forEach(function (c) { place[c.i] = c.bin; }); checked = true; paint(); F.say('Each card is in its group.'); });
    }
    if (o.solved) cards.forEach(function (c) { place[c.i] = c.bin; });
    paint();
    return {};
  });

  /* ---------- ar-arch: architecture diagrams (orders, arches, vaults, buttresses, domes, plans, façades, the steel frame) ---------- */
  A.ARCH_SHOWS = { orders: 'the three Greek orders', arches: 'round and pointed arches', vaults: 'barrel, groin and ribbed vaults', buttress: 'a Gothic cross-section with flying buttresses', dome: 'a dome on pendentives',
    basilica: 'the plan of a basilica', mosque: 'the plan of a mosque', facades: 'Romanesque, Gothic and Renaissance façades', frame: 'a load-bearing wall and a steel frame' };
  V.register('ar-arch', function (el, o) {
    var show = o.show || 'orders', F = frame(el, o, 'arch', 'An architecture diagram: ' + (A.ARCH_SHOWS[show] || show));
    var ink = 'ara-ln', fill = 'ara-fl', fill2 = 'ara-fl2', lets = F.quiet || o.letters, n = 0;
    function lab(g, x, y, text, anchor, lx, ly) { // a label (or a letter in quiet mode) with an optional leader to (lx, ly)
      if (lx !== undefined) sv('line', { x1: x, y1: y - 4, x2: lx, y2: ly, class: 'ara-lead' }, g);
      if (lets) { var L = letter(n++); sv('circle', { cx: x, cy: y - 4, r: 9, class: 'ara-badge' }, g); txt(g, x, y, L, { class: 'ara-bt', 'text-anchor': 'middle' }); return L; }
      txt(g, x, y, text, { class: 'ara-tx', 'text-anchor': anchor || 'start' }); return text;
    }
    var map = {}; // part name -> letter (quiet mode), for generators that read it
    function L(g, x, y, key, text, anchor, lx, ly) { map[key] = lab(g, x, y, text, anchor, lx, ly); }
    var s;
    if (show === 'orders') {
      s = svgRoot(540, 300, F.quiet ? 'Three columns, A, B and C' : 'Doric, Ionic and Corinthian columns'); var cols = o.order || ['doric', 'ionic', 'corinthian'];
      cols.forEach(function (k, i) {
        var cx = 150 + i * 150, g = sv('g', null, s), top = 60, bot = 252, w = k === 'doric' ? 46 : 36;
        sv('rect', { x: cx - 62, y: top - 40, width: 124, height: 28, class: fill2 }, g); sv('rect', { x: cx - 62, y: top - 40, width: 124, height: 28, class: ink, fill: 'none' }, g); // entablature
        if (k === 'doric') { for (var t = 0; t < 4; t++) sv('rect', { x: cx - 52 + t * 30, y: top - 38, width: 9, height: 14, class: ink, fill: 'none' }, g); sv('rect', { x: cx - 32, y: top - 12, width: 64, height: 9, class: fill }, g); sv('path', { d: 'M' + (cx - 30) + ',' + (top - 3) + ' Q' + cx + ',' + (top + 14) + ' ' + (cx + 30) + ',' + (top - 3), class: fill }, g); }
        if (k === 'ionic') { sv('rect', { x: cx - 34, y: top - 12, width: 68, height: 8, class: fill }, g); [-1, 1].forEach(function (sd) { var d = ''; for (var q = 0; q <= 60; q++) { var a = q / 60 * M.PI * 3.2, r = 11 - q / 60 * 9; d += (q ? ' L' : 'M') + (cx + sd * 30 + M.cos(a) * r * sd).toFixed(1) + ',' + (top + 2 + M.sin(a) * r).toFixed(1); } sv('path', { d: d, class: ink, fill: 'none' }, g); }); }
        if (k === 'corinthian') { sv('rect', { x: cx - 34, y: top - 12, width: 68, height: 7, class: fill }, g); for (var lf = 0; lf < 5; lf++) sv('path', { d: 'M' + (cx - 24 + lf * 12) + ',' + (top + 26) + ' Q' + (cx - 32 + lf * 12) + ',' + (top + 6) + ' ' + (cx - 22 + lf * 12) + ',' + (top - 4) + ' Q' + (cx - 16 + lf * 12) + ',' + (top + 8) + ' ' + (cx - 24 + lf * 12) + ',' + (top + 26) + ' Z', class: fill2 }, g); [-1, 1].forEach(function (sd) { sv('path', { d: 'M' + (cx + sd * 20) + ',' + (top + 2) + ' q' + (sd * 12) + ',-4 ' + (sd * 12) + ',-12', class: ink, fill: 'none' }, g); }); }
        var sh0 = k === 'corinthian' ? top + 26 : top + 10;
        var shB = k === 'doric' ? bot + 16 : bot; // a Doric shaft stands right on the floor (the stylobate), with no base
        sv('path', { d: 'M' + (cx - w / 2) + ',' + sh0 + ' L' + (cx - w / 2 - 3) + ',' + shB + ' L' + (cx + w / 2 + 3) + ',' + shB + ' L' + (cx + w / 2) + ',' + sh0 + ' Z', class: fill }, g);
        for (var fl = 1; fl < 6; fl++) sv('line', { x1: cx - w / 2 + fl * w / 6, y1: sh0 + 4, x2: cx - w / 2 - 3 + fl * (w + 6) / 6, y2: shB - 4, class: 'ara-flute' }, g);
        if (k !== 'doric') { sv('rect', { x: cx - w / 2 - 10, y: bot, width: w + 20, height: 8, class: fill2 }, g); sv('rect', { x: cx - w / 2 - 14, y: bot + 8, width: w + 28, height: 8, class: fill2 }, g); }
        sv('rect', { x: cx - 70, y: bot + 16, width: 140, height: 10, class: 'ara-st' }, g);
        L(g, cx, 292, k, A.ORDERS[k].name, 'middle');
      });
      if (!F.quiet && o.parts !== false) { var g2 = sv('g', null, s); [['entablature', 38], ['capital', 70], ['shaft', 160], ['base', 260]].forEach(function (q) { txt(g2, 4, q[1], q[0], { class: 'ara-sm' }); sv('line', { x1: 62, y1: q[1] - 4, x2: 72, y2: q[1] - 4, class: 'ara-lead' }, g2); }); }
    } else if (show === 'arches') {
      s = svgRoot(420, 240, F.quiet ? 'Two arches, A and B' : 'A round arch and a pointed arch'); var kinds = o.kinds || ['round', 'pointed'];
      kinds.forEach(function (k, i) { var cx = 105 + i * 210, g = sv('g', null, s), sp = 120, base = 220, top = 90;
        var d = k === 'round' ? 'M' + (cx - sp / 2) + ',' + base + ' L' + (cx - sp / 2) + ',' + (top + sp / 2) + ' A' + (sp / 2) + ',' + (sp / 2) + ' 0 0 1 ' + (cx + sp / 2) + ',' + (top + sp / 2) + ' L' + (cx + sp / 2) + ',' + base : 'M' + (cx - sp / 2) + ',' + base + ' L' + (cx - sp / 2) + ',' + (top + 50) + ' Q' + (cx - sp / 2) + ',' + (top - 10) + ' ' + cx + ',' + (top - 34) + ' Q' + (cx + sp / 2) + ',' + (top - 10) + ' ' + (cx + sp / 2) + ',' + (top + 50) + ' L' + (cx + sp / 2) + ',' + base;
        sv('rect', { x: cx - sp / 2 - 30, y: top - 60, width: sp + 60, height: base - top + 60, class: 'ara-st' }, g); sv('path', { d: d + ' Z', class: 'ara-open' }, g); sv('path', { d: d, class: ink, fill: 'none' }, g);
        for (var v = 0; v < 9; v++) { var a = M.PI + v * M.PI / 8; if (k === 'round') sv('line', { x1: cx + M.cos(a) * sp / 2, y1: top + sp / 2 + M.sin(a) * sp / 2, x2: cx + M.cos(a) * (sp / 2 + 22), y2: top + sp / 2 + M.sin(a) * (sp / 2 + 22), class: 'ara-ln ara-thin' }, g); }
        if (k === 'round') sv('rect', { x: cx - 9, y: top - 22, width: 18, height: 24, class: fill2 }, g);
        L(g, cx, 236, k, k === 'round' ? 'Round arch' : 'Pointed arch', 'middle'); if (!lets) txt(g, cx, 22, k === 'round' ? 'Roman and Romanesque' : 'Gothic', { class: 'ara-sm', 'text-anchor': 'middle' });
        if (k === 'round' && !F.quiet) txt(g, cx + 14, top - 12, 'keystone', { class: 'ara-sm' });
      });
    } else if (show === 'vaults') {
      s = svgRoot(480, 220, F.quiet ? 'Three vaults, A, B and C' : 'A barrel vault, a groin vault and a ribbed vault'); var vk = o.kinds || ['barrel', 'groin', 'rib'];
      vk.forEach(function (k, i) { var ox = 20 + i * 155, g = sv('g', null, s), y0 = 170, w = 120, hh = 50, dx = 26, dy = -40;
        sv('path', { d: 'M' + ox + ',' + y0 + ' A' + (w / 2) + ',' + hh + ' 0 0 1 ' + (ox + w) + ',' + y0, class: ink, fill: 'none' }, g); sv('path', { d: 'M' + (ox + dx) + ',' + (y0 + dy) + ' A' + (w / 2) + ',' + hh + ' 0 0 1 ' + (ox + w + dx) + ',' + (y0 + dy), class: ink, fill: 'none' }, g);
        sv('path', { d: 'M' + ox + ',' + y0 + ' A' + (w / 2) + ',' + hh + ' 0 0 1 ' + (ox + w) + ',' + y0 + ' L' + (ox + w + dx) + ',' + (y0 + dy) + ' A' + (w / 2) + ',' + hh + ' 0 0 0 ' + (ox + dx) + ',' + (y0 + dy) + ' Z', class: fill, opacity: 0.6 }, g);
        [[ox, y0], [ox + w, y0], [ox + dx, y0 + dy], [ox + w + dx, y0 + dy]].forEach(function (p) { sv('line', { x1: p[0], y1: p[1], x2: p[0], y2: p[1] + 30, class: ink }, g); });
        if (k !== 'barrel') { sv('path', { d: 'M' + ox + ',' + y0 + ' Q' + (ox + w / 2 + dx / 2) + ',' + (y0 - hh * 1.1) + ' ' + (ox + w + dx) + ',' + (y0 + dy), class: k === 'rib' ? 'ara-rib' : 'ara-ln ara-thin', fill: 'none' }, g); sv('path', { d: 'M' + (ox + w) + ',' + y0 + ' Q' + (ox + w / 2 + dx / 2) + ',' + (y0 - hh * 1.1) + ' ' + (ox + dx) + ',' + (y0 + dy), class: k === 'rib' ? 'ara-rib' : 'ara-ln ara-thin', fill: 'none' }, g); }
        L(g, ox + w / 2 + 12, 216, k, k === 'barrel' ? 'Barrel vault' : k === 'groin' ? 'Groin vault' : 'Ribbed vault', 'middle');
      });
    } else if (show === 'buttress') {
      s = svgRoot(460, 300, 'A cross-section of a Gothic cathedral with flying buttresses'); var g3 = sv('g', null, s);
      sv('rect', { x: 0, y: 270, width: 460, height: 30, class: 'ara-st' }, g3);
      sv('path', { d: 'M180,270 L180,90 Q230,30 280,90 L280,270 Z', class: 'ara-open' }, g3); sv('path', { d: 'M170,270 L170,90 L180,90 M290,270 L290,90 L280,90', class: ink, fill: 'none' }, g3);
      sv('path', { d: 'M170,90 L230,30 L290,90', class: ink, fill: 'none' }, g3); sv('path', { d: 'M180,90 Q230,30 280,90', class: 'ara-rib', fill: 'none' }, g3);
      sv('path', { d: 'M100,270 L100,170 L170,170 M360,270 L360,170 L290,170', class: ink, fill: 'none' }, g3);
      sv('rect', { x: 40, y: 120, width: 26, height: 150, class: fill }, g3); sv('rect', { x: 394, y: 120, width: 26, height: 150, class: fill }, g3);
      sv('path', { d: 'M66,140 Q120,110 170,112 L170,124 Q120,122 66,156 Z', class: fill2 }, g3); sv('path', { d: 'M394,140 Q340,110 290,112 L290,124 Q340,122 394,156 Z', class: fill2 }, g3);
      sv('rect', { x: 178, y: 120, width: 104, height: 60, class: 'ara-glass' }, g3);
      L(g3, 120, 96, 'flying-buttress', 'flying buttress', 'middle', 120, 118); L(g3, 53, 290, 'pier', 'buttress pier', 'middle'); L(g3, 230, 22, 'rib-vault', 'ribbed vault', 'middle'); L(g3, 230, 158, 'clerestory', 'clerestory windows', 'middle'); L(g3, 230, 250, 'nave', 'nave', 'middle'); L(g3, 132, 250, 'aisle', 'aisle', 'middle');
    } else if (show === 'dome') {
      s = svgRoot(320, 280, 'A dome on pendentives over a square room'); var g4 = sv('g', null, s);
      sv('rect', { x: 50, y: 150, width: 220, height: 110, class: fill }, g4); sv('path', { d: 'M70,260 L70,190 A90,90 0 0 1 250,190 L250,260 Z', class: 'ara-open' }, g4);
      sv('path', { d: 'M50,150 Q70,110 160,104 Q250,110 270,150 Z', class: fill2 }, g4); sv('path', { d: 'M70,104 A90,80 0 0 1 250,104 Z', class: fill }, g4);
      sv('ellipse', { cx: 160, cy: 104, rx: 90, ry: 14, class: ink, fill: 'none' }, g4);
      for (var wi = 0; wi < 8; wi++) sv('rect', { x: 82 + wi * 20, y: 92, width: 8, height: 10, class: 'ara-glass' }, g4);
      L(g4, 160, 50, 'dome', 'dome', 'middle'); L(g4, 72, 140, 'pendentive', 'pendentive', 'middle'); L(g4, 160, 230, 'square-base', 'square base below', 'middle');
    } else if (show === 'basilica') {
      s = svgRoot(460, 220, 'The plan of a basilica'); var g5 = sv('g', null, s);
      sv('rect', { x: 40, y: 50, width: 320, height: 120, class: fill }, g5); sv('rect', { x: 10, y: 60, width: 30, height: 100, class: fill2 }, g5); sv('path', { d: 'M360,80 A30,30 0 0 1 360,140 Z', class: fill2 }, g5);
      for (var c2 = 0; c2 < 9; c2++) { sv('circle', { cx: 70 + c2 * 32, cy: 82, r: 4, class: 'ara-col' }, g5); sv('circle', { cx: 70 + c2 * 32, cy: 138, r: 4, class: 'ara-col' }, g5); }
      if (o.transept) sv('rect', { x: 300, y: 20, width: 60, height: 180, class: fill2, opacity: 0.7 }, g5);
      L(g5, 200, 114, 'nave', 'nave', 'middle'); L(g5, 200, 70, 'aisle', 'aisle', 'middle'); L(g5, 25, 114, 'narthex', 'narthex', 'middle'); L(g5, 405, 114, 'apse', 'apse', 'middle', 375, 110); if (o.transept) L(g5, 330, 14, 'transept', 'transept', 'middle');
    } else if (show === 'mosque') {
      s = svgRoot(460, 260, 'The plan of a courtyard mosque'); var g6 = sv('g', null, s);
      sv('rect', { x: 40, y: 30, width: 380, height: 210, class: fill }, g6); sv('rect', { x: 60, y: 110, width: 340, height: 115, class: 'ara-court' }, g6);
      for (var r2 = 0; r2 < 2; r2++) for (var c3 = 0; c3 < 10; c3++) sv('circle', { cx: 70 + c3 * 36, cy: 50 + r2 * 26, r: 3.5, class: 'ara-col' }, g6);
      sv('line', { x1: 40, y1: 30, x2: 420, y2: 30, class: 'ara-qibla' }, g6); sv('path', { d: 'M222,30 A10,10 0 0 0 238,30 Z', class: fill2 }, g6); sv('rect', { x: 250, y: 32, width: 8, height: 18, class: fill2 }, g6);
      sv('circle', { cx: 230, cy: 168, r: 10, class: 'ara-glass' }, g6); sv('rect', { x: 412, y: 226, width: 22, height: 22, class: fill2 }, g6);
      L(g6, 230, 18, 'qibla', 'qibla wall (faces Mecca)', 'middle'); L(g6, 196, 46, 'mihrab', 'mihrab', 'end', 226, 34); L(g6, 290, 48, 'minbar', 'minbar', 'start', 258, 40); L(g6, 140, 76, 'prayer-hall', 'prayer hall', 'middle'); L(g6, 230, 196, 'courtyard', 'courtyard with fountain', 'middle'); L(g6, 452, 254, 'minaret', 'minaret', 'end', 423, 238);
    } else if (show === 'facades') {
      s = svgRoot(480, 240, F.quiet ? 'Three church fronts, A, B and C' : 'Romanesque, Gothic and Renaissance church fronts'); var fk = o.kinds || ['romanesque', 'gothic', 'renaissance'];
      fk.forEach(function (k, i) { var cx = 80 + i * 160, g = sv('g', null, s), base = 220;
        if (k === 'romanesque') { sv('path', { d: 'M' + (cx - 60) + ',' + base + ' L' + (cx - 60) + ',100 L' + cx + ',70 L' + (cx + 60) + ',100 L' + (cx + 60) + ',' + base + ' Z', class: fill }, g); sv('path', { d: 'M' + (cx - 18) + ',' + base + ' L' + (cx - 18) + ',180 A18,18 0 0 1 ' + (cx + 18) + ',180 L' + (cx + 18) + ',' + base + ' Z', class: 'ara-open' }, g); [-34, 34].forEach(function (dx) { sv('path', { d: 'M' + (cx + dx - 6) + ',140 L' + (cx + dx - 6) + ',128 A6,6 0 0 1 ' + (cx + dx + 6) + ',128 L' + (cx + dx + 6) + ',140 Z', class: 'ara-glass' }, g); }); sv('circle', { cx: cx, cy: 110, r: 8, class: 'ara-glass' }, g); }
        if (k === 'gothic') { [-44, 44].forEach(function (dx) { sv('path', { d: 'M' + (cx + dx - 16) + ',' + base + ' L' + (cx + dx - 16) + ',70 L' + (cx + dx) + ',28 L' + (cx + dx + 16) + ',70 L' + (cx + dx + 16) + ',' + base + ' Z', class: fill }, g); }); sv('path', { d: 'M' + (cx - 28) + ',' + base + ' L' + (cx - 28) + ',100 L' + cx + ',64 L' + (cx + 28) + ',100 L' + (cx + 28) + ',' + base + ' Z', class: fill2 }, g); sv('circle', { cx: cx, cy: 118, r: 18, class: 'ara-glass' }, g); sv('path', { d: 'M' + (cx - 14) + ',' + base + ' L' + (cx - 14) + ',186 Q' + (cx - 14) + ',166 ' + cx + ',158 Q' + (cx + 14) + ',166 ' + (cx + 14) + ',186 L' + (cx + 14) + ',' + base + ' Z', class: 'ara-open' }, g); }
        if (k === 'renaissance') { sv('rect', { x: cx - 60, y: 110, width: 120, height: base - 110, class: fill }, g); sv('polygon', { points: (cx - 66) + ',110 ' + (cx + 66) + ',110 ' + cx + ',76', class: fill2 }, g); [-48, -24, 24, 48].forEach(function (dx) { sv('rect', { x: cx + dx - 4, y: 118, width: 8, height: base - 118, class: fill2 }, g); }); sv('path', { d: 'M' + (cx - 14) + ',' + base + ' L' + (cx - 14) + ',178 A14,14 0 0 1 ' + (cx + 14) + ',178 L' + (cx + 14) + ',' + base + ' Z', class: 'ara-open' }, g); sv('circle', { cx: cx, cy: 96, r: 6, class: 'ara-glass' }, g); }
        L(g, cx, 236, k, cap1(k), 'middle');
      });
    } else if (show === 'frame') {
      s = svgRoot(420, 260, 'A load-bearing wall building and a steel-frame skyscraper'); var g7 = sv('g', null, s);
      sv('rect', { x: 30, y: 120, width: 120, height: 120, class: fill }, g7); for (var r3 = 0; r3 < 3; r3++) for (var c4 = 0; c4 < 3; c4++) sv('rect', { x: 44 + c4 * 36, y: 132 + r3 * 36, width: 18, height: 22, class: 'ara-glass' }, g7);
      for (var f2 = 0; f2 <= 10; f2++) sv('line', { x1: 230, y1: 240 - f2 * 22, x2: 380, y2: 240 - f2 * 22, class: 'ara-steel' }, g7);
      for (var c5 = 0; c5 <= 5; c5++) sv('line', { x1: 230 + c5 * 30, y1: 240, x2: 230 + c5 * 30, y2: 20, class: 'ara-steel' }, g7);
      sv('rect', { x: 230, y: 20, width: 75, height: 220, class: 'ara-glass', opacity: 0.55 }, g7);
      L(g7, 90, 110, 'bearing', 'thick walls carry the weight', 'middle'); L(g7, 305, 14, 'steel-frame', 'a steel frame carries the weight', 'middle'); L(g7, 268, 254, 'curtain-wall', 'the outer wall hangs on the frame', 'middle');
    }
    if (s) { s.style.maxWidth = M.round(+s.getAttribute('viewBox').split(' ')[2] * 1.45) + 'px'; F.body.appendChild(s); }
    return { letters: function () { return map; } };
  });
  // the order letters appear in for a given show (quiet mode), so generators can ask "Which letter is the mihrab?"
  A.ARCH_PARTS = { orders: ['doric', 'ionic', 'corinthian'], arches: ['round', 'pointed'], vaults: ['barrel', 'groin', 'rib'], buttress: ['flying-buttress', 'pier', 'rib-vault', 'clerestory', 'nave', 'aisle'],
    dome: ['dome', 'pendentive', 'square-base'], basilica: ['nave', 'aisle', 'narthex', 'apse'], mosque: ['qibla', 'mihrab', 'minbar', 'prayer-hall', 'courtyard', 'minaret'], facades: ['romanesque', 'gothic', 'renaissance'], frame: ['bearing', 'steel-frame', 'curtain-wall'] };

})(typeof window !== 'undefined' ? window : globalThis, typeof document !== 'undefined' ? document : null);
