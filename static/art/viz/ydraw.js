/* Drawing for Young Artists (ydraw): course visuals on top of the Art & Drawing kit (static/art/viz/art.js + art.css).
   They reuse the kit's look (.arv frame, .arl-grid cards, lettered badges) and draw on light "paper", so they read the same
   in the light and dark themes. Drawn people use the site's one cartoon skin color (#ffcc4d, outline #e8a93a) and are always
   clothed. Every option that a problem's answer depends on (a count, a part, a side) is passed in opts, so the generator
   (static/art/gen/ydraw.js) and the picture always agree. Common options as in the kit: quiet (letters, no names),
   interactive, big, readme, task, caption, label.

   ydraw-person  people built from shapes. people: [{ hair: 'brown'|'black'|'red'|'blond'|'gray'|hex, style: 'short'|'long'|
                 'curly'|'ponytail'|'bald', hat: 'cap'|'sun'|'beanie'|false, glasses, top: hex, bottom: 'pants'|'shorts'|'skirt',
                 legs: hex (pants, shorts or skirt color), size: 1 (0.8 for a child), oops: 'arms-head' (the arms start at the
                 head: the mistake) }] side by side; letters: true (quiet does this when there are several); labels: true
                 (head, body, arm, leg); steps: true (one person built one shape at a time with Back, Next and All).
   ydraw-face    simple young artists' faces. faces: [{ eyes: 0.5 (fraction of the way down the head), mouth: 'up'|'down'|
                 'round'|'flat'|'wavy', brows: 'relaxed'|'raised'|'down'|'worried'|'none', missing: 'eyes'|'nose'|'mouth'|
                 'ears'|'brows' (a "?" in its place), swap: true (mouth above the nose), hair, glasses, guide: true (a dashed
                 halfway line) }]; letters.
   ydraw-row     a row of pattern pieces ('shape:color', shapes circle square triangle star heart diamond, colors of
                 A.PAT_COLORS). seq; missing: index or 'next' (a "?" slot); choices: [motifs] (a lettered row of pieces
                 under the pattern); numbers: true (1, 2, 3… under each piece); rows: [[motifs], …] (several lettered rows).
   ydraw-scene   simple pictures on paper. scenes: [{ sky: 'full'|'gap'|'none', ground: y of the ground line (0–150, or
                 false), items: [{ k: tree|house|bush|ball|box|rock|sun|cloud|mountain|flower|bird|person, x, y (the base;
                 the center for sun, cloud and bird), s (size, 1 = normal), tag: 'A' (a lettered badge), color }],
                 seeThrough: true (every outline drawn on top, so things behind look see-through: the mistake) }]; a
                 single scene may be given as opts.scene. Several scenes are lettered A, B, C.
   ydraw-things  small pictures: tools (crayon pencil marker brush paints clay scissors glue chalk), kinds of art
                 (painting drawing photo statue bowl vase tall sandcastle snowman), things with a plain shape (clock door
                 pizza egg book kite ball tent window watermelon cookie gift sign), things to count (spider ant octopus
                 ladybug flower hand starfish caterpillar: n = how many legs, arms, spots, petals, fingers or parts) and
                 trees (lollipop-tree real-tree). items: [key or { k, n, color }]; labels: 'names'|'letters'|'none';
                 columns. MathLadder.ydraw.THINGS has each key's name, group and shape.
   ydraw-oops    a drawing from shapes (A.DRAWINGS) done right and with a common mistake, as pictures A and B.
                 oops: 'cat-head' (head bigger than the body) | 'fish-tail' (the tail on the head end) | 'car-wheels'
                 (wheels floating inside the car) | 'train-wheels' | 'flower-petals' (petals on one side only); good: 'A'|'B'
                 (which picture is right); quiet hides the explanation.
   ydraw-paint   blobs of paint: colors: [hex, …] (lettered A, B, C when there are several).                                                   */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  // ---------------------------------------------------------------- data (also in node, for tests)
  var Y = ML.ydraw = ML.ydraw || {};
  Y.THINGS = {
    crayon: { name: 'a crayon', group: 'tool' }, pencil: { name: 'a pencil', group: 'tool' }, marker: { name: 'a marker', group: 'tool' },
    brush: { name: 'a paintbrush', group: 'tool' }, paints: { name: 'a paint set', group: 'tool' }, clay: { name: 'clay', group: 'tool' },
    scissors: { name: 'scissors', group: 'tool' }, glue: { name: 'glue', group: 'tool' }, chalk: { name: 'chalk', group: 'tool' },
    painting: { name: 'a painting', group: 'art', solid: false }, drawing: { name: 'a drawing', group: 'art', solid: false }, photo: { name: 'a photograph', group: 'art', solid: false },
    statue: { name: 'a stone cat statue', group: 'art', solid: true }, bowl: { name: 'a clay bowl', group: 'art', solid: true }, vase: { name: 'a vase', group: 'art', solid: true },
    tall: { name: 'a metal sculpture of shapes', group: 'art', solid: true }, sandcastle: { name: 'a sandcastle', group: 'art', solid: true }, snowman: { name: 'a snowman', group: 'art', solid: true },
    clock: { name: 'a clock', group: 'object', shape: 'circle' }, door: { name: 'a door', group: 'object', shape: 'rectangle' }, pizza: { name: 'a slice of pizza', group: 'object', shape: 'triangle' },
    egg: { name: 'an egg', group: 'object', shape: 'oval' }, book: { name: 'a book', group: 'object', shape: 'rectangle' }, kite: { name: 'a kite', group: 'object', shape: 'diamond' },
    ball: { name: 'a beach ball', group: 'object', shape: 'circle' }, tent: { name: 'a tent', group: 'object', shape: 'triangle' }, window: { name: 'a window', group: 'object', shape: 'square' },
    watermelon: { name: 'a slice of watermelon', group: 'object', shape: 'semicircle' }, cookie: { name: 'a heart cookie', group: 'object', shape: 'heart' },
    gift: { name: 'a gift box', group: 'object', shape: 'square' }, sign: { name: 'a road sign', group: 'object', shape: 'diamond' },
    spider: { name: 'a spider', group: 'count', n: 8, part: 'legs' }, ant: { name: 'an ant', group: 'count', n: 6, part: 'legs' }, octopus: { name: 'an octopus', group: 'count', n: 8, part: 'arms' },
    ladybug: { name: 'a ladybug', group: 'count', n: 6, part: 'spots' }, flower: { name: 'a flower', group: 'count', n: 6, part: 'petals' }, hand: { name: 'a hand', group: 'count', n: 5, part: 'fingers' },
    starfish: { name: 'a starfish', group: 'count', n: 5, part: 'arms', shape: 'star' }, caterpillar: { name: 'a caterpillar', group: 'count', n: 5, part: 'body parts' },
    'lollipop-tree': { name: 'a lollipop tree', group: 'tree' }, 'real-tree': { name: 'a real tree', group: 'tree' }
  };
  if (!ML.viz || !D) return;
  var V = ML.viz, NS = 'http://www.w3.org/2000/svg', M = Math;
  var SKIN = '#ffcc4d', SKIN_LINE = '#e8a93a', INK = '#3a332c', PAPER = '#fffdf7';
  var HAIR = { brown: '#7a4a24', black: '#1d1714', red: '#c4542b', blond: '#d9b25c', gray: '#b9b9c0', dark: '#4a2f18' };
  function A() { return ML.art; }
  function U() { return ML.art._ui; }
  if (!D.getElementById('ydraw-css')) {
    var st = D.createElement('style'); st.id = 'ydraw-css';
    st.textContent = '.arv .yd-paper{fill:' + PAPER + '}.arv .yd-card svg{background:' + PAPER + ';border-radius:8px}' +
      '.arv .yd-row{display:block;width:100%;height:auto;max-width:560px;margin:0 auto}.arv .yd-sub{margin:.55rem 0 .25rem;font:600 .9rem system-ui,sans-serif;text-align:center;color:var(--mv-muted)}' +
      '.arv .yd-rows{display:flex;flex-direction:column;gap:.45rem}.arv .yd-rrow{display:flex;align-items:center;gap:.5rem;padding:.35rem .5rem;border:1px solid var(--mv-line);border-radius:12px;background:var(--mv-card)}' +
      '.arv .yd-rrow svg{flex:1;min-width:0;height:auto}.arv .yd-num{font:600 11px system-ui,sans-serif;fill:#6a625a}.arv .yd-q{font:800 26px system-ui,sans-serif;fill:#b8197f}' +
      '.arv .yd-badge{fill:#b8197f;stroke:#fff;stroke-width:2}.arv .yd-badget{fill:#fff;font:800 13px system-ui,sans-serif}.arv .yd-lab{font:600 12px system-ui,sans-serif;fill:#3a332c}' +
      '.arv .yd-step{margin:.45rem 0 0;font-size:1rem;text-align:center}.arv .yd-one{max-width:300px;margin:0 auto}.arv .yd-scene1{max-width:440px;margin:0 auto}' +
      '.arv .arl-grid.yd-one{max-width:240px}.arv .yd-choices{max-width:330px;margin:0 auto}' +
      '@media (max-width:560px){.arv .arl-grid.yd-n3{grid-template-columns:repeat(3,minmax(0,1fr));gap:.35rem}.arv .arl-grid.yd-n3 .arl-card{padding:.25rem}}';
    D.head.appendChild(st);
  }
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, at, parent) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function txt(parent, x, y, s, at) { var t = sv('text', Object.assign({ x: x, y: y }, at || {}), parent); t.textContent = s; return t; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function letter(i) { return String.fromCharCode(65 + i); }
  function cap1(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function root(w, hh, label) { return sv('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'arv-svg', role: 'img', 'aria-label': label || '', focusable: 'false' }); }
  function btn(parent, text, fn, cls) { var b = h('button', 'ml-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; b.addEventListener('click', fn); parent.appendChild(b); return b; }
  function frame(el, o, name, label) {
    el.classList.add('arv', 'arv-' + name); if (o.big) el.classList.add('arv-big');
    el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), interactive: o.interactive !== false };
    if (o.readme) el.appendChild(h('p', 'arv-readme', '<span class="arv-readme-tag">Read to me</span> ' + o.readme));
    if (o.task) el.appendChild(h('p', 'arv-task', o.task));
    F.body = h('div', 'arv-body'); el.appendChild(F.body);
    F.ctl = h('div', 'ml-ctl arv-ctl'); el.appendChild(F.ctl);
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    return F;
  }
  // a grid of cards, each with an svg and a label (name or letter)
  function cards(F, list, o, w, hh, drawOne, nameOf) {
    var n = list.length, lettered = o.labels === 'letters' || (o.labels !== 'names' && o.labels !== 'none' && (F.quiet || o.letters) && n > 0) || (o.letters && o.labels !== 'none');
    if (n === 1 && o.labels !== 'letters' && !o.letters) lettered = false;
    var grid = h('div', 'arl-grid yd-card yd-n' + n + (n === 1 ? ' yd-one' : '')); grid.style.setProperty('--n', M.min(n, o.columns || (n > 4 ? 3 : n))); F.body.appendChild(grid);
    list.forEach(function (it, i) {
      var c = h('div', 'arl-card'), nm = nameOf(it, i), s = root(w, hh, lettered ? 'Picture ' + letter(i) + (F.quiet ? '' : ': ' + nm) : (F.quiet ? 'A picture' : nm));
      sv('rect', { x: 0, y: 0, width: w, height: hh, class: 'yd-paper' }, s); drawOne(s, it, i); c.appendChild(s);
      var lab = lettered ? letter(i) : (o.labels === 'none' || F.quiet ? '' : cap1(nm.replace(/^(a|an|the) /, '')));
      if (lab) c.appendChild(h('span', 'arl-lab' + (lettered ? ' arl-letter' : ''), esc(lab)));
      grid.appendChild(c);
    });
    return grid;
  }
  function P(g, d, fill, extra) { return sv('path', Object.assign({ d: d, fill: fill || 'none', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, extra || {}), g); }
  function C(g, cx, cy, r, fill, extra) { return sv('circle', Object.assign({ cx: cx, cy: cy, r: r, fill: fill, stroke: INK, 'stroke-width': 2 }, extra || {}), g); }
  function E(g, cx, cy, rx, ry, fill, extra) { return sv('ellipse', Object.assign({ cx: cx, cy: cy, rx: rx, ry: ry, fill: fill, stroke: INK, 'stroke-width': 2 }, extra || {}), g); }
  function R(g, x, y, w, hh, fill, extra) { return sv('rect', Object.assign({ x: x, y: y, width: w, height: hh, fill: fill, stroke: INK, 'stroke-width': 2, rx: 2 }, extra || {}), g); }
  function poly(pts) { return 'M' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' L') + ' Z'; }

  /* ---------------------------------------------------------------- ydraw-person */
  // one person in a 120 x 200 box (feet at y 184); parts: which groups to draw (for steps)
  function person(g, p, parts) {
    p = p || {}; parts = parts || { head: 1, body: 1, arms: 1, legs: 1, face: 1, extra: 1 };
    var hc = HAIR[p.hair] || p.hair || HAIR.brown, top = p.top || '#4a8fe0', legs = p.legs || '#2f5f9e', bottom = p.bottom || 'pants', style = p.style || 'short', oops = p.oops === 'arms-head';
    if (parts.extra && style === 'long' && !p.hat) R(g, 34, 24, 52, 46, hc, { rx: 16, stroke: 'none' });
    if (parts.legs) {
      if (bottom === 'pants') { R(g, 44, 120, 15, 58, legs, { rx: 4 }); R(g, 61, 120, 15, 58, legs, { rx: 4 }); }
      else { R(g, 46, 120, 12, 58, SKIN, { stroke: SKIN_LINE, rx: 4 }); R(g, 62, 120, 12, 58, SKIN, { stroke: SKIN_LINE, rx: 4 }); if (bottom === 'shorts') { R(g, 43, 118, 16, 22, legs, { rx: 3 }); R(g, 61, 118, 16, 22, legs, { rx: 3 }); } }
      if (parts.extra) { E(g, 50, 180, 11, 5, '#5a3e2b'); E(g, 70, 180, 11, 5, '#5a3e2b'); }
    }
    if (parts.arms) {
      if (oops) [[37, 40], [83, 40]].forEach(function (q, j) { var rot = j ? -50 : 50, gA = sv('g', { transform: 'rotate(' + rot + ' ' + q[0] + ' ' + q[1] + ')' }, g); R(gA, q[0] - 6, q[1], 12, 48, top, { rx: 6 }); if (parts.extra) C(gA, q[0], q[1] + 52, 6, SKIN, { stroke: SKIN_LINE }); });
      else [27, 81].forEach(function (x) { R(g, x, 64, 12, 50, top, { rx: 6 }); if (parts.extra) C(g, x + 6, 118, 6, SKIN, { stroke: SKIN_LINE }); });
    }
    if (parts.body) {
      if (parts.extra || parts.face) R(g, 54, 52, 12, 14, SKIN, { stroke: SKIN_LINE });
      R(g, 39, 62, 42, 62, top, { rx: 9 });
      if (parts.legs && bottom === 'skirt') P(g, 'M40,108 L80,108 L90,150 L30,150 Z', legs);
    }
    if (parts.head) C(g, 60, 38, 23, SKIN, { stroke: SKIN_LINE, 'stroke-width': 2.5 });
    if (parts.arms && oops) [[37, 40], [83, 40]].forEach(function (q) { C(g, q[0], q[1], 5, top); });
    if (parts.face) {
      sv('circle', { cx: 52, cy: 39, r: 2.8, fill: '#2b2b2b' }, g); sv('circle', { cx: 68, cy: 39, r: 2.8, fill: '#2b2b2b' }, g);
      sv('path', { d: 'M52,49 Q60,55 68,49', fill: 'none', stroke: '#8a3b2b', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
      if (p.glasses) { sv('circle', { cx: 52, cy: 39, r: 6.5, fill: 'none', stroke: '#333', 'stroke-width': 2 }, g); sv('circle', { cx: 68, cy: 39, r: 6.5, fill: 'none', stroke: '#333', 'stroke-width': 2 }, g); sv('path', { d: 'M58.5,39 L61.5,39', stroke: '#333', 'stroke-width': 2 }, g); }
    }
    if (parts.extra) {
      if (!p.hat) {
        if (style === 'short' || style === 'long' || style === 'ponytail') P(g, 'M37,38 Q36,13 60,13 Q84,13 83,38 Q76,24 62,26 Q48,24 37,38 Z', hc, { stroke: 'none' });
        if (style === 'ponytail') E(g, 87, 36, 7, 14, hc, { stroke: 'none' });
        if (style === 'curly') for (var i = 0; i < 9; i++) { var a = M.PI * (1.05 + i * 0.112); sv('circle', { cx: 60 + M.cos(a) * 23, cy: 36 + M.sin(a) * 22, r: 7, fill: hc }, g); }
        if (style === 'bald') { E(g, 38, 34, 4, 8, hc, { stroke: 'none' }); E(g, 82, 34, 4, 8, hc, { stroke: 'none' }); }
      } else {
        var hcol = p.hatColor || (p.hat === 'sun' ? '#e9c46a' : p.hat === 'beanie' ? '#d6448c' : '#e04a3f');
        if (p.hat === 'sun') { E(g, 60, 24, 38, 7, hcol); P(g, 'M40,24 Q40,6 60,6 Q80,6 80,24 Z', hcol); R(g, 40, 18, 40, 5, '#8a5a32', { rx: 1 }); }
        else if (p.hat === 'beanie') { P(g, 'M37,30 Q37,8 60,8 Q83,8 83,30 Z', hcol); R(g, 36, 26, 48, 8, hcol, { rx: 3 }); C(g, 60, 7, 5, '#fff'); }
        else { P(g, 'M37,30 Q37,10 60,10 Q83,10 83,30 Z', hcol); P(g, 'M80,28 Q96,27 100,32 L80,32 Z', hcol); }
      }
    }
  }
  function personLabels(g) {
    [['head', 84, 32, 1], ['arm', 93, 90, 1], ['body', 39, 80, 0], ['leg', 44, 160, 0]].forEach(function (q) {
      var right = q[3], x2 = right ? 106 : 14; sv('line', { x1: q[1], y1: q[2], x2: x2, y2: q[2], stroke: '#b8197f', 'stroke-width': 1.5 }, g);
      txt(g, right ? x2 + 3 : x2 - 3, q[2] + 4, q[0], { class: 'yd-lab', 'text-anchor': right ? 'start' : 'end' });
    });
  }
  var PERSON_STEPS = [['head', 'a circle for the head'], ['body', 'a rectangle for the body'], ['arms', 'two long shapes for the arms, starting at the shoulders'], ['legs', 'two long shapes for the legs'], ['face', 'eyes and a smile'], ['extra', 'hair, hands and shoes']];
  V.register('ydraw-person', function (el, o) {
    var F = frame(el, o, 'ydraw', 'People drawn from shapes'), people = o.people || [{}];
    if (o.steps) {
      var s = root(150, 200, 'A person drawn from shapes'); s.classList.add('yd-one'); sv('rect', { x: 0, y: 0, width: 150, height: 200, class: 'yd-paper', rx: 10 }, s);
      var g = sv('g', { transform: 'translate(15 4)' }, s), cap = h('p', 'yd-step'), step = 1, n = PERSON_STEPS.length;
      F.body.appendChild(s); F.body.appendChild(cap);
      var draw = function () { while (g.firstChild) g.removeChild(g.firstChild); var parts = {}; PERSON_STEPS.slice(0, step).forEach(function (q) { parts[q[0]] = 1; }); person(g, people[0], parts); cap.innerHTML = '<b>Step ' + step + ' of ' + n + ':</b> ' + PERSON_STEPS[step - 1][1] + '.'; back.disabled = step <= 1; next.disabled = step >= n; };
      var back = btn(F.ctl, '◀ Back', function () { step = M.max(1, step - 1); draw(); }), next = btn(F.ctl, 'Next ▶', function () { step = M.min(n, step + 1); draw(); }, 'pri'); btn(F.ctl, 'All', function () { step = n; draw(); });
      draw(); return {};
    }
    var lab = o.labels === true && !F.quiet, W0 = lab ? 210 : 150, dx = lab ? 45 : 15;
    cards(F, people, Object.assign({}, o, { labels: people.length > 1 && (F.quiet || o.letters !== false) ? 'letters' : 'none' }), W0, 200, function (s, p) {
      var sc = p.size || 1, gg = sv('g', { transform: 'translate(' + (dx + 60 * (1 - sc)) + ' ' + (4 + 184 * (1 - sc)) + ') scale(' + sc + ')' }, s);
      person(gg, p); if (lab) personLabels(sv('g', { transform: 'translate(' + dx + ' 4)' }, s));
    }, function () { return 'a person'; });
    return {};
  });

  /* ---------------------------------------------------------------- ydraw-face */
  function face(g, f) {
    f = f || {};
    var cx = 70, cy = 80, rx = 46, ry = 54, top = cy - ry, H = 2 * ry, hc = HAIR[f.hair] || f.hair || HAIR.brown, miss = f.missing;
    var eyeY = top + H * (f.eyes === undefined ? 0.5 : f.eyes), noseY = top + H * 0.69, mouthY = top + H * 0.83;
    if (f.swap) { var t = noseY; noseY = mouthY; mouthY = t - 2; }
    function ask(x, y) { sv('circle', { cx: x, cy: y, r: 11, fill: 'none', stroke: '#b8197f', 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, g); txt(g, x, y + 6, '?', { class: 'yd-q', 'text-anchor': 'middle', style: 'font-size:17px' }); }
    if (miss !== 'ears') { E(g, cx - rx, (eyeY + noseY) / 2, 7, 11, SKIN, { stroke: SKIN_LINE }); E(g, cx + rx, (eyeY + noseY) / 2, 7, 11, SKIN, { stroke: SKIN_LINE }); }
    E(g, cx, cy, rx, ry, SKIN, { stroke: SKIN_LINE, 'stroke-width': 2.5 });
    P(g, 'M' + (cx - rx) + ',' + (top + 30) + ' Q' + (cx - rx - 2) + ',' + (top - 6) + ' ' + cx + ',' + (top - 4) + ' Q' + (cx + rx + 2) + ',' + (top - 6) + ' ' + (cx + rx) + ',' + (top + 30) + ' Q' + (cx + 20) + ',' + (top + 10) + ' ' + cx + ',' + (top + 14) + ' Q' + (cx - 22) + ',' + (top + 10) + ' ' + (cx - rx) + ',' + (top + 30) + ' Z', hc, { stroke: 'none' });
    if (f.guide) sv('line', { x1: cx - rx - 10, y1: cy, x2: cx + rx + 10, y2: cy, stroke: '#b8197f', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, g);
    var round = f.mouth === 'round';
    if (miss === 'eyes') ask(cx, eyeY);
    else [-1, 1].forEach(function (sd) { var x = cx + sd * 17; sv('circle', { cx: x, cy: eyeY, r: round ? 5.5 : 4.5, fill: '#2b2b2b' }, g); sv('circle', { cx: x + 1.6, cy: eyeY - 1.6, r: 1.4, fill: '#fff' }, g); if (f.glasses) sv('circle', { cx: x, cy: eyeY, r: 10, fill: 'none', stroke: '#333', 'stroke-width': 2 }, g); });
    if (f.glasses && miss !== 'eyes') sv('path', { d: 'M' + (cx - 7) + ',' + eyeY + ' L' + (cx + 7) + ',' + eyeY, stroke: '#333', 'stroke-width': 2 }, g);
    var br = f.brows || 'relaxed';
    if (miss === 'brows') ask(cx, eyeY - 16);
    else if (br !== 'none') [-1, 1].forEach(function (sd) {
      var x = cx + sd * 17, by = eyeY - 13, inner = x - sd * 9, outer = x + sd * 9, d;
      if (br === 'raised') d = 'M' + outer + ',' + (by - 4) + ' Q' + x + ',' + (by - 13) + ' ' + inner + ',' + (by - 5);
      else if (br === 'down') d = 'M' + outer + ',' + (by - 6) + ' L' + inner + ',' + (by + 3);
      else if (br === 'worried') d = 'M' + outer + ',' + (by + 1) + ' L' + inner + ',' + (by - 7);
      else d = 'M' + outer + ',' + by + ' Q' + x + ',' + (by - 4) + ' ' + inner + ',' + by;
      sv('path', { d: d, fill: 'none', stroke: '#4a2f18', 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g);
    });
    if (miss === 'nose') ask(cx, noseY);
    else sv('path', { d: 'M' + (cx - 5) + ',' + (noseY - 2) + ' Q' + cx + ',' + (noseY + 4) + ' ' + (cx + 5) + ',' + (noseY - 2), fill: 'none', stroke: SKIN_LINE, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
    if (miss === 'mouth') { ask(cx, mouthY); return; }
    var m = f.mouth || 'up', mw = 15, md;
    if (m === 'round') { sv('ellipse', { cx: cx, cy: mouthY + 1, rx: 6, ry: 8, fill: '#7a2a1e' }, g); return; }
    if (m === 'up') md = 'M' + (cx - mw) + ',' + (mouthY - 3) + ' Q' + cx + ',' + (mouthY + 11) + ' ' + (cx + mw) + ',' + (mouthY - 3);
    else if (m === 'down') md = 'M' + (cx - mw) + ',' + (mouthY + 5) + ' Q' + cx + ',' + (mouthY - 8) + ' ' + (cx + mw) + ',' + (mouthY + 5);
    else if (m === 'wavy') md = 'M' + (cx - mw) + ',' + mouthY + ' q' + (mw / 2) + ',-4 ' + mw + ',0 q' + (mw / 2) + ',4 ' + mw + ',0';
    else md = 'M' + (cx - mw * 0.8) + ',' + mouthY + ' L' + (cx + mw * 0.8) + ',' + mouthY;
    sv('path', { d: md, fill: 'none', stroke: '#8a3b2b', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
  }
  V.register('ydraw-face', function (el, o) {
    var F = frame(el, o, 'ydraw', 'Faces'), faces = o.faces || [{}];
    cards(F, faces, Object.assign({}, o, { labels: o.labels || (faces.length > 1 ? 'letters' : 'none') }), 140, 150, function (s, f) { face(s, f); }, function () { return 'a face'; });
    return {};
  });

  /* ---------------------------------------------------------------- ydraw-row */
  var MOTIF_C = { red: '#e03127', blue: '#2160b8', yellow: '#f2c22e', green: '#3aa64a', orange: '#f5871f', purple: '#7b3294', pink: '#e86aa6', brown: '#8a5a32' };
  function motif(g, m, cx, cy, r) { var p = String(m).split(':'), col = (A().PAT_COLORS || MOTIF_C)[p[1]] || MOTIF_C[p[1]] || p[1] || '#888'; return U().shapeEl(g, p[0], cx, cy, r, { fill: col, stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }); }
  function rowSvg(seq, o, label) {
    var cell = 52, miss = o.missing === 'next' ? seq.length : o.missing, n = miss === seq.length ? seq.length + 1 : seq.length, hh = cell + (o.numbers ? 22 : 8);
    var s = root(cell * n, hh, label); s.classList.add('yd-row');
    for (var i = 0; i < n; i++) {
      var cx = i * cell + cell / 2, cy = cell / 2 + 4;
      if (i === miss) { sv('rect', { x: i * cell + 6, y: 10, width: cell - 12, height: cell - 12, rx: 8, fill: 'none', stroke: '#b8197f', 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }, s); txt(s, cx, cy + 9, '?', { class: 'yd-q', 'text-anchor': 'middle' }); }
      else motif(s, seq[i], cx, cy, cell * 0.33);
      if (o.numbers) txt(s, cx, cell + 16, String(i + 1), { class: 'yd-num', 'text-anchor': 'middle' });
    }
    return s;
  }
  V.register('ydraw-row', function (el, o) {
    var F = frame(el, o, 'ydraw', 'A pattern');
    if (o.rows) {
      var box = h('div', 'yd-rows'); F.body.appendChild(box);
      o.rows.forEach(function (r, i) { var c = h('div', 'yd-rrow'); c.appendChild(h('span', 'arl-lab arl-letter', letter(i))); var s = rowSvg(r, {}, 'Row ' + letter(i)); s.style.maxWidth = (r.length * 46) + 'px'; c.appendChild(s); box.appendChild(c); });
      return {};
    }
    var seq = o.seq || ['circle:red', 'square:blue', 'circle:red', 'square:blue'];
    var s0 = rowSvg(seq, o, F.quiet || o.missing !== undefined ? 'A pattern with a missing piece' : 'A pattern'); F.body.appendChild(s0);
    if (o.choices) {
      F.body.appendChild(h('p', 'yd-sub', 'Choices'));
      cards(F, o.choices, { labels: 'letters', columns: o.choices.length }, 60, 60, function (s, m) { motif(s, m, 30, 30, 20); }, function (m) { return A().motifName(m); }).classList.add('yd-choices');
    }
    return {};
  });

  /* ---------------------------------------------------------------- ydraw-scene */
  var ITEM_TOP = { tree: 74, house: 60, bush: 22, ball: 30, box: 36, rock: 20, mountain: 66, flower: 30, person: 66, sun: 22, cloud: 16, bird: 12 };
  function item(g, it, outline) {
    var x = it.x, y = it.y, s = it.s || 1, f = function (c) { return outline ? 'none' : c; }, U0 = U(), k = it.k, col = it.color;
    var o2 = outline ? { stroke: INK, 'stroke-width': 1.8 } : {};
    if (k === 'tree') { R(g, x - 5 * s, y - 34 * s, 10 * s, 34 * s, f('#a8743f'), o2); sv('path', Object.assign({ d: U0.cloudPath(x, y - 52 * s, 24 * s, 21 * s, 8), fill: f(col || '#4f9d4f'), stroke: INK, 'stroke-width': 2 }, o2), g); }
    else if (k === 'house') { R(g, x - 22 * s, y - 34 * s, 44 * s, 34 * s, f(col || '#f6c945'), o2); P(g, poly([[x - 27 * s, y - 34 * s], [x + 27 * s, y - 34 * s], [x, y - 60 * s]]), f('#e8574f'), o2); R(g, x - 6 * s, y - 18 * s, 12 * s, 18 * s, f('#a8743f'), o2); }
    else if (k === 'bush') sv('path', Object.assign({ d: U0.cloudPath(x, y - 10 * s, 18 * s, 11 * s, 7), fill: f('#3f8f4a'), stroke: INK, 'stroke-width': 2 }, o2), g);
    else if (k === 'ball') { C(g, x, y - 15 * s, 15 * s, f(col || '#e8574f'), o2); if (!outline) sv('path', { d: 'M' + (x - 14 * s) + ',' + (y - 18 * s) + ' Q' + x + ',' + (y - 26 * s) + ' ' + (x + 14 * s) + ',' + (y - 18 * s), fill: 'none', stroke: '#fff', 'stroke-width': 3 }, g); }
    else if (k === 'box') { R(g, x - 21 * s, y - 36 * s, 42 * s, 36 * s, f(col || '#c9a26b'), o2); if (!outline) sv('line', { x1: x, y1: y - 36 * s, x2: x, y2: y, stroke: '#8a6a3c', 'stroke-width': 3 }, g); }
    else if (k === 'rock') sv('path', Object.assign({ d: U0.blobPath(x, y - 9 * s, 16 * s, [0.9, 1, 0.8, 0.95, 0.85, 1, 0.75, 0.9], 0.6), fill: f('#9aa3ad'), stroke: INK, 'stroke-width': 2 }, o2), g);
    else if (k === 'mountain') { P(g, poly([[x - 50 * s, y], [x, y - 66 * s], [x + 50 * s, y]]), f(col || '#8d9db6'), o2); if (!outline) P(g, poly([[x - 12 * s, y - 50 * s], [x, y - 66 * s], [x + 12 * s, y - 50 * s], [x + 4 * s, y - 46 * s], [x - 4 * s, y - 50 * s]]), '#ffffff'); }
    else if (k === 'flower') { sv('line', { x1: x, y1: y, x2: x, y2: y - 20 * s, stroke: '#3f8f4a', 'stroke-width': 3 * s }, g); for (var i = 0; i < 6; i++) { var a = i * M.PI / 3; C(g, x + M.cos(a) * 6 * s, y - 24 * s + M.sin(a) * 6 * s, 4.5 * s, f(col || '#ef86b4'), o2); } C(g, x, y - 24 * s, 4 * s, f('#f6c945'), o2); }
    else if (k === 'sun') { C(g, x, y, 13 * s, f('#f6c445'), o2); if (!outline) for (var q = 0; q < 8; q++) { var b = q * M.PI / 4; sv('line', { x1: x + M.cos(b) * 17 * s, y1: y + M.sin(b) * 17 * s, x2: x + M.cos(b) * 23 * s, y2: y + M.sin(b) * 23 * s, stroke: '#f2b705', 'stroke-width': 3, 'stroke-linecap': 'round' }, g); } }
    else if (k === 'cloud') sv('path', Object.assign({ d: U0.cloudPath(x, y, 22 * s, 11 * s, 7), fill: f('#ffffff'), stroke: '#9aa9b8', 'stroke-width': 2 }, o2), g);
    else if (k === 'bird') P(g, 'M' + (x - 9 * s) + ',' + (y - 3 * s) + ' Q' + (x - 4 * s) + ',' + (y - 8 * s) + ' ' + x + ',' + y + ' Q' + (x + 4 * s) + ',' + (y - 8 * s) + ' ' + (x + 9 * s) + ',' + (y - 3 * s), 'none');
    else if (k === 'person') { var sc = 0.36 * s; person(sv('g', { transform: 'translate(' + (x - 60 * sc) + ' ' + (y - 184 * sc) + ') scale(' + sc + ')' }, g), it.p || { top: col || '#4a8fe0' }); }
  }
  var ITEM_HALF = { tree: 24, house: 27, bush: 18, ball: 15, box: 21, rock: 16, mountain: 50, flower: 11, person: 14, sun: 22, cloud: 22, bird: 9 };
  function badge(g, it) {
    var k = it.k, s = it.s || 1, sky = k === 'sun' || k === 'cloud' || k === 'bird', tx = it.x + ITEM_HALF[k] * s + 12, ty = sky ? it.y : it.y - ITEM_TOP[k] * s / 2;
    if (tx > 188) tx = it.x - ITEM_HALF[k] * s - 12; tx = M.max(12, M.min(188, tx)); ty = M.max(12, M.min(138, ty));
    sv('circle', { cx: tx, cy: ty, r: 10, class: 'yd-badge' }, g); txt(g, tx, ty + 4.5, it.tag, { class: 'yd-badget', 'text-anchor': 'middle' });
  }
  function scene(s, sc) {
    var gy = sc.ground === undefined ? 112 : sc.ground;
    if (sc.sky === 'full') sv('rect', { x: 0, y: 0, width: 200, height: gy === false ? 150 : gy, fill: '#bfe3fb' }, s);
    if (sc.sky === 'gap') sv('rect', { x: 0, y: 0, width: 200, height: 20, fill: '#8cc4f0' }, s);
    if (gy !== false) sv('rect', { x: 0, y: gy, width: 200, height: 150 - gy, fill: sc.groundColor || '#8fcf7f' }, s);
    var items = sc.items || [];
    items.forEach(function (it) { item(s, it, false); });
    if (sc.seeThrough) items.forEach(function (it) { item(s, it, true); });
    items.forEach(function (it) { if (it.tag) badge(s, it); });
  }
  V.register('ydraw-scene', function (el, o) {
    var F = frame(el, o, 'ydraw', 'A picture'), list = o.scenes || [o.scene || {}];
    var grid = cards(F, list, Object.assign({}, o, { labels: list.length > 1 ? 'letters' : 'none', columns: o.columns || M.min(list.length, 3) }), 200, 150, function (s, sc) { scene(s, sc); }, function (sc, i) { return o.names ? o.names[i] : 'a picture'; });
    if (list.length === 1) { grid.classList.remove('yd-one'); grid.classList.add('yd-scene1'); }
    return {};
  });

  /* ---------------------------------------------------------------- ydraw-things */
  function thing(g, it) {
    var k = it.k, n = it.n === undefined ? (Y.THINGS[k] || {}).n : it.n, col = it.color, i, a;
    switch (k) {
      // tools
      case 'crayon': R(g, 18, 40, 66, 20, col || '#e04a3f', { rx: 3 }); R(g, 30, 40, 40, 20, 'rgba(255,255,255,.35)', { stroke: 'none' }); sv('line', { x1: 34, y1: 44, x2: 66, y2: 44, stroke: '#fff', 'stroke-width': 1.5 }, g); P(g, 'M84,40 L102,50 L84,60 Z', col || '#e04a3f'); break;
      case 'pencil': R(g, 22, 42, 62, 16, '#f2c22e', { rx: 1 }); R(g, 8, 42, 10, 16, '#ef86b4', { rx: 3 }); R(g, 16, 41, 7, 18, '#b9b9c0', { rx: 1 }); P(g, 'M84,42 L104,50 L84,58 Z', '#e8c48a'); P(g, 'M98,47.6 L104,50 L98,52.4 Z', '#333'); break;
      case 'marker': R(g, 14, 39, 50, 22, col || '#3d86e8', { rx: 6 }); R(g, 64, 41, 16, 18, '#e9eef2', { rx: 3 }); P(g, 'M80,44 L98,50 L80,56 Z', col || '#3d86e8'); break;
      case 'brush': R(g, 6, 46, 66, 8, '#c4542b', { rx: 4 }); R(g, 72, 44, 14, 12, '#b9b9c0', { rx: 2 }); P(g, 'M86,44 Q108,48 110,50 Q108,52 86,56 Z', col || '#3d86e8'); break;
      case 'paints': R(g, 10, 30, 100, 44, '#f3f1ea', { rx: 8 }); ['#e03127', '#f2c22e', '#2160b8', '#3aa64a', '#f5871f', '#7b3294'].forEach(function (c, j) { E(g, 26 + (j % 3) * 34, 42 + M.floor(j / 3) * 20, 12, 7, c); }); break;
      case 'clay': sv('path', { d: U().blobPath(38, 62, 22, [1, 0.85, 1, 0.9, 0.95, 0.85, 1, 0.92], 0.7), fill: '#4a8fe0', stroke: INK, 'stroke-width': 2 }, g); sv('path', { d: U().blobPath(80, 64, 18, [0.9, 1, 0.85, 0.95, 1, 0.9, 0.85, 1], 0.7), fill: '#e8574f', stroke: INK, 'stroke-width': 2 }, g); P(g, 'M22,84 Q40,76 60,84 Q80,92 100,84', 'none', { stroke: '#f2c22e', 'stroke-width': 7 }); break;
      case 'scissors': C(g, 30, 34, 11, '#e04a3f'); C(g, 30, 66, 11, '#e04a3f'); C(g, 30, 34, 5, PAPER); C(g, 30, 66, 5, PAPER); P(g, 'M40,40 L104,58 L46,52 Z', '#c9d3dc'); P(g, 'M40,60 L104,42 L46,48 Z', '#c9d3dc'); C(g, 54, 50, 2.5, '#555'); break;
      case 'glue': P(g, 'M54,14 L60,6 L66,14 Z', '#f5871f'); R(g, 48, 14, 24, 12, '#f5871f', { rx: 2 }); R(g, 40, 26, 40, 62, '#ffffff', { rx: 8 }); R(g, 44, 46, 32, 20, '#f2c22e', { rx: 2 }); break;
      case 'chalk': R(g, 8, 10, 104, 62, '#2f5d46', { rx: 4, stroke: '#8a5a32', 'stroke-width': 5 }); P(g, 'M20,44 Q32,26 44,44 T68,44', 'none', { stroke: '#fff', 'stroke-width': 3 }); C(g, 88, 34, 9, 'none', { stroke: '#f6c945', 'stroke-width': 3 }); R(g, 36, 80, 30, 9, '#ffffff', { rx: 4 }); R(g, 72, 80, 22, 9, '#ef86b4', { rx: 4 }); break;
      // art
      case 'painting': R(g, 14, 10, 92, 76, '#a8743f', { rx: 2 }); sv('rect', { x: 22, y: 18, width: 76, height: 60, fill: '#bfe3fb' }, g); sv('path', { d: 'M22,58 Q50,40 98,56 L98,78 L22,78 Z', fill: '#7cc36e' }, g); sv('circle', { cx: 80, cy: 32, r: 7, fill: '#f6c445' }, g); sv('rect', { x: 22, y: 18, width: 76, height: 60, fill: 'none', stroke: INK, 'stroke-width': 1.5 }, g); break;
      case 'drawing': R(g, 24, 8, 72, 84, '#ffffff', { transform: 'rotate(-4 60 50)' }); P(g, 'M42,74 L42,50 L60,36 L78,50 L78,74 Z M54,74 L54,60 L64,60 L64,74', 'none', { 'stroke-width': 1.6, transform: 'rotate(-4 60 50)' }); break;
      case 'photo': R(g, 22, 12, 76, 80, '#ffffff', { rx: 2 }); sv('rect', { x: 28, y: 18, width: 64, height: 56, fill: '#8cc4f0' }, g); sv('path', { d: 'M28,62 L44,46 L58,60 L70,50 L92,68 L92,74 L28,74 Z', fill: '#5aa65a' }, g); break;
      case 'statue': R(g, 34, 74, 52, 18, '#b9b2a6', { rx: 2 }); E(g, 64, 60, 18, 16, '#cfc8bc'); C(g, 50, 38, 13, '#cfc8bc'); P(g, 'M40,30 L42,16 L50,26 Z M52,26 L60,16 L60,30 Z', '#cfc8bc'); P(g, 'M80,66 Q96,60 90,44', 'none', { 'stroke-width': 4, stroke: '#9a9286' }); sv('circle', { cx: 46, cy: 37, r: 1.6, fill: '#555' }, g); sv('circle', { cx: 55, cy: 37, r: 1.6, fill: '#555' }, g); break;
      case 'bowl': E(g, 60, 44, 42, 10, '#d9875a'); P(g, 'M18,44 Q22,86 60,86 Q98,86 102,44 Q60,58 18,44 Z', '#c4703e'); P(g, 'M30,64 Q60,74 90,64', 'none', { stroke: '#f6e2c6', 'stroke-width': 3 }); break;
      case 'vase': P(g, 'M46,10 L74,10 Q70,26 82,44 Q98,72 76,92 L44,92 Q22,72 38,44 Q50,26 46,10 Z', col || '#4a8fe0'); P(g, 'M34,60 Q60,70 86,60', 'none', { stroke: '#f6c945', 'stroke-width': 4 }); break;
      case 'tall': R(g, 34, 86, 52, 10, '#6c7a89'); R(g, 42, 60, 36, 26, '#8a99a8'); C(g, 60, 44, 16, '#b8c4cf'); P(g, 'M60,4 L74,30 L46,30 Z', '#9aa9b8'); break;
      case 'sandcastle': R(g, 20, 52, 80, 38, '#e8c88a'); R(g, 24, 34, 18, 18, '#e8c88a'); R(g, 78, 34, 18, 18, '#e8c88a'); R(g, 50, 26, 20, 26, '#e8c88a'); P(g, 'M60,26 L60,8', 'none'); P(g, 'M60,8 L74,12 L60,16 Z', '#e04a3f'); R(g, 54, 70, 12, 20, '#c9a66a', { rx: 6 }); break;
      case 'snowman': C(g, 60, 72, 20, '#ffffff', { stroke: '#9aa9b8' }); C(g, 60, 40, 14, '#ffffff', { stroke: '#9aa9b8' }); C(g, 60, 16, 10, '#ffffff', { stroke: '#9aa9b8' }); P(g, 'M60,17 L72,19 L60,21 Z', '#f5871f', { stroke: 'none' }); sv('circle', { cx: 56, cy: 13, r: 1.6, fill: '#333' }, g); sv('circle', { cx: 64, cy: 13, r: 1.6, fill: '#333' }, g); break;
      // objects with a plain shape
      case 'clock': C(g, 60, 50, 36, '#ffffff', { 'stroke-width': 4 }); for (i = 0; i < 12; i++) { a = i * M.PI / 6; sv('line', { x1: 60 + M.cos(a) * 29, y1: 50 + M.sin(a) * 29, x2: 60 + M.cos(a) * 33, y2: 50 + M.sin(a) * 33, stroke: INK, 'stroke-width': 2 }, g); } P(g, 'M60,50 L60,28 M60,50 L76,58', 'none', { 'stroke-width': 3 }); break;
      case 'door': R(g, 36, 6, 48, 88, '#a8743f'); R(g, 42, 14, 36, 30, 'none', { 'stroke-width': 1.5 }); R(g, 42, 52, 36, 34, 'none', { 'stroke-width': 1.5 }); C(g, 75, 54, 3.5, '#f2c22e'); break;
      case 'pizza': P(g, 'M60,90 L22,14 Q60,4 98,14 Z', '#f6c945'); P(g, 'M22,14 Q60,4 98,14 L94,22 Q60,12 26,22 Z', '#d9a35a'); [[50, 34], [70, 36], [60, 56]].forEach(function (q) { C(g, q[0], q[1], 6, '#d64545'); }); break;
      case 'egg': E(g, 60, 52, 26, 36, '#f7ecd6'); break;
      case 'book': R(g, 28, 10, 64, 82, col || '#c0392b', { rx: 3 }); R(g, 34, 26, 52, 16, '#f6c945', { rx: 2 }); sv('line', { x1: 34, y1: 10, x2: 34, y2: 92, stroke: INK, 'stroke-width': 1.5 }, g); break;
      case 'kite': P(g, 'M60,8 L88,40 L60,82 L32,40 Z', col || '#e86aa6'); P(g, 'M60,8 L60,82 M32,40 L88,40', 'none', { 'stroke-width': 1.5 }); P(g, 'M60,82 Q50,90 62,94 Q72,98 64,100', 'none', { 'stroke-width': 1.5 }); break;
      case 'ball': C(g, 60, 50, 34, '#ffffff'); P(g, 'M60,16 Q40,50 60,84', 'none', { stroke: '#e04a3f', 'stroke-width': 6 }); P(g, 'M60,16 Q80,50 60,84', 'none', { stroke: '#3d86e8', 'stroke-width': 6 }); C(g, 60, 50, 34, 'none'); break;
      case 'tent': P(g, 'M60,10 L102,88 L18,88 Z', col || '#3aa64a'); P(g, 'M60,10 L52,88 L68,88 Z', '#2f7a3e'); break;
      case 'window': R(g, 22, 12, 76, 76, '#bfe0f7', { 'stroke-width': 4 }); P(g, 'M60,12 L60,88 M22,50 L98,50', 'none', { 'stroke-width': 4 }); break;
      case 'watermelon': P(g, 'M14,34 L106,34 A46,46 0 0 1 14,34 Z', '#3aa64a'); P(g, 'M22,34 L98,34 A38,38 0 0 1 22,34 Z', '#f06464', { stroke: 'none' }); [[42, 46], [60, 56], [78, 46], [52, 64], [68, 64]].forEach(function (q) { sv('ellipse', { cx: q[0], cy: q[1], rx: 2, ry: 3.2, fill: '#2b2b2b' }, g); }); break;
      case 'cookie': U().shapeEl(g, 'heart', 60, 52, 38, { fill: '#d9a35a', stroke: INK, 'stroke-width': 2 }); U().shapeEl(g, 'heart', 60, 52, 30, { fill: '#ef86b4', stroke: 'none' }); break;
      case 'gift': R(g, 24, 18, 72, 72, col || '#9b6ad1'); R(g, 54, 18, 12, 72, '#f6c945', { stroke: 'none' }); R(g, 24, 48, 72, 12, '#f6c945', { stroke: 'none' }); R(g, 24, 18, 72, 72, 'none'); break;
      case 'sign': R(g, 57, 60, 6, 38, '#9aa3ad'); P(g, 'M60,6 L94,40 L60,74 L26,40 Z', '#f6c945', { 'stroke-width': 3 }); P(g, 'M50,40 L70,40 M64,34 L70,40 L64,46', 'none', { 'stroke-width': 3 }); break;
      // things to count
      case 'spider': for (i = 0; i < n; i++) { var side = i % 2 ? 1 : -1, row = M.floor(i / 2), per = M.ceil(n / 2), yy = 40 + (row - (per - 1) / 2) * 11; P(g, 'M' + (60 + side * 8) + ',' + (yy + 8) + ' Q' + (60 + side * 30) + ',' + (yy - 10) + ' ' + (60 + side * 48) + ',' + (yy + 16 + row * 2), 'none', { 'stroke-width': 2.6 }); } E(g, 60, 56, 16, 20, '#4a3a5a'); C(g, 60, 32, 10, '#4a3a5a'); sv('circle', { cx: 56, cy: 30, r: 2, fill: '#fff' }, g); sv('circle', { cx: 64, cy: 30, r: 2, fill: '#fff' }, g); break;
      case 'ant': var per2 = M.ceil(n / 2); for (i = 0; i < n; i++) { var up = i % 2 ? 1 : -1, k2 = M.floor(i / 2), lx = 60 + (k2 - (per2 - 1) / 2) * 12; P(g, 'M' + lx + ',58 L' + (lx + (k2 - (per2 - 1) / 2) * 10) + ',' + (58 + up * 18) + ' L' + (lx + (k2 - (per2 - 1) / 2) * 16) + ',' + (58 + up * 30), 'none', { 'stroke-width': 2.4 }); }
        E(g, 30, 58, 12, 10, '#7a3e2a'); E(g, 60, 58, 14, 8, '#7a3e2a'); E(g, 92, 58, 18, 13, '#7a3e2a'); P(g, 'M24,50 Q20,42 14,42 M28,49 Q28,40 24,36', 'none', { 'stroke-width': 1.2 }); break;
      case 'octopus': for (i = 0; i < n; i++) { var fr = n > 1 ? i / (n - 1) : 0.5, x0 = 32 + fr * 56, x1 = 8 + fr * 104, mx = (x0 + x1) / 2; P(g, 'M' + x0.toFixed(1) + ',56 Q' + (mx - 6).toFixed(1) + ',76 ' + mx.toFixed(1) + ',80 T' + x1.toFixed(1) + ',96', 'none', { stroke: '#c94a7a', 'stroke-width': 5 }); } P(g, 'M24,60 Q24,10 60,10 Q96,10 96,60 Z', '#e86aa6'); sv('circle', { cx: 50, cy: 40, r: 4, fill: '#2b2b2b' }, g); sv('circle', { cx: 70, cy: 40, r: 4, fill: '#2b2b2b' }, g); break;
      case 'ladybug': C(g, 60, 26, 10, '#2b2b2b'); P(g, 'M22,62 Q22,24 60,24 Q98,24 98,62 Q98,92 60,92 Q22,92 22,62 Z', '#e03127'); sv('line', { x1: 60, y1: 24, x2: 60, y2: 92, stroke: INK, 'stroke-width': 2 }, g);
        var spots = [[44, 44], [76, 44], [38, 64], [82, 64], [48, 80], [72, 80], [50, 58], [70, 58], [44, 30], [76, 30]]; for (i = 0; i < M.min(n, spots.length); i++) sv('circle', { cx: spots[i][0], cy: spots[i][1], r: 6, fill: '#2b2b2b' }, g); break;
      case 'flower': sv('line', { x1: 60, y1: 58, x2: 60, y2: 98, stroke: '#3f8f4a', 'stroke-width': 4 }, g); for (i = 0; i < n; i++) { a = -M.PI / 2 + i * 2 * M.PI / n; E(g, 60 + M.cos(a) * 20, 40 + M.sin(a) * 20, 10, 6.5, col || '#ef86b4', { transform: 'rotate(' + (a * 180 / M.PI) + ' ' + (60 + M.cos(a) * 20) + ' ' + (40 + M.sin(a) * 20) + ')' }); } C(g, 60, 40, 11, '#f6c945'); break;
      case 'hand': // palm and fingers, all in the cartoon skin color; the thumb is the first finger
        var m = M.max(0, n - 1), fw = m > 4 ? 10 : 12;
        for (i = 0; i < m; i++) { var fx = m === 1 ? 60 : 36 + i * (48 / (m - 1)), mid = M.abs(i - (m - 1) / 2) / M.max(1, (m - 1) / 2); R(g, fx - fw / 2, 10 + mid * 12, fw, 50, SKIN, { rx: fw / 2, stroke: SKIN_LINE }); }
        if (n >= 1) R(g, 8, 56, 32, 13, SKIN, { rx: 6.5, stroke: SKIN_LINE, transform: 'rotate(-38 26 62)' });
        R(g, 26, 46, 66, 44, SKIN, { rx: 16, stroke: SKIN_LINE }); R(g, 46, 86, 30, 12, '#4a8fe0', { rx: 3 }); break;
      case 'starfish': var pts = []; for (i = 0; i < 2 * n; i++) { a = -M.PI / 2 + i * M.PI / n; var rr = i % 2 ? 14 : 40; pts.push([60 + M.cos(a) * rr, 52 + M.sin(a) * rr]); } P(g, poly(pts), col || '#f5871f'); break;
      case 'caterpillar': var sp = 88 / M.max(1, n - 1), cr = M.min(12, sp * 0.56); for (i = n - 1; i >= 0; i--) C(g, 16 + i * sp, 62 + (i % 2 ? -5 : 0), cr, i === n - 1 ? '#7cc36e' : '#58b368'); var hx = 16 + (n - 1) * sp; P(g, 'M' + (hx - 3) + ',' + 50 + ' L' + (hx - 8) + ',36 M' + (hx + 3) + ',50 L' + (hx + 8) + ',36', 'none'); sv('circle', { cx: hx + 4, cy: 58, r: 2, fill: '#2b2b2b' }, g); break;
      // trees
      case 'lollipop-tree': R(g, 57, 50, 6, 44, '#a8743f'); C(g, 60, 34, 26, '#4f9d4f'); sv('rect', { x: 0, y: 92, width: 120, height: 8, fill: '#8fcf7f' }, g); break;
      case 'real-tree': sv('rect', { x: 0, y: 92, width: 120, height: 8, fill: '#8fcf7f' }, g);
        sv('path', { d: U().cloudPath(36, 34, 22, 16, 7), fill: '#4f9d4f', stroke: INK, 'stroke-width': 1.6 }, g); sv('path', { d: U().cloudPath(78, 26, 26, 18, 8), fill: '#5aa65a', stroke: INK, 'stroke-width': 1.6 }, g); sv('path', { d: U().cloudPath(92, 52, 16, 12, 6), fill: '#4f9d4f', stroke: INK, 'stroke-width': 1.6 }, g);
        P(g, 'M52,94 L56,62 L40,40 M56,62 L58,52 L76,30 M57,58 L88,52 M58,94 L62,66 L64,56', 'none', { stroke: '#7a5230', 'stroke-width': 4 }); P(g, 'M50,94 Q54,70 54,60 L64,58 Q62,76 66,94 Z', '#a8743f'); break;
    }
  }
  V.register('ydraw-things', function (el, o) {
    var F = frame(el, o, 'ydraw', 'Pictures of things'), list = (o.items || ['crayon']).map(function (it) { return typeof it === 'string' ? { k: it } : it; });
    cards(F, list, Object.assign({}, o, { labels: o.labels || (F.quiet ? (list.length > 1 ? 'letters' : 'none') : 'names') }), 120, 100, function (s, it) { thing(s, it); }, function (it) { return (Y.THINGS[it.k] || { name: it.k }).name; });
    return {};
  });

  /* ---------------------------------------------------------------- ydraw-paint */
  V.register('ydraw-paint', function (el, o) {
    var F = frame(el, o, 'ydraw', 'Paint colors'), list = o.colors || ['#e03127'];
    cards(F, list, { labels: list.length > 1 ? 'letters' : 'none', columns: list.length }, 120, 100, function (s, c, i) {
      sv('path', { d: U().blobPath(60, 52, 38, [1, 0.86, 1, 0.9, 0.96, 0.84, 1, 0.92], 0.82), fill: c, stroke: INK, 'stroke-width': 2 }, s);
      sv('ellipse', { cx: 46, cy: 40, rx: 9, ry: 5, fill: 'rgba(255,255,255,.35)' }, s);
    }, function () { return 'a paint color'; });
    return {};
  });

  /* ---------------------------------------------------------------- ydraw-oops */
  var OOPS = {
    'cat-head': { draw: 'cat', swap: { body: [{ x: 96, y: 98, w: 56, h: 44 }], head: [{ x: 22, y: 34, w: 76, h: 76 }], ear: [{ x: 28, y: 22, w: 22, h: 26 }, { x: 70, y: 22, w: 22, h: 26 }], eye: [{ x: 44, y: 62, w: 8, h: 8 }, { x: 66, y: 62, w: 8, h: 8 }], nose: [{ x: 56, y: 76, w: 8, h: 6 }], tail: [{ x: 150, y: 84, w: 28, h: 50 }] },
      right: 'the cat\'s body is bigger than its head', wrong: 'the head is bigger than the body' },
    'fish-tail': { draw: 'fish', swap: { tail: [{ x: 0, y: 52, w: 44, h: 60, point: 'right' }] },
      right: 'the tail is on the back end, away from the eye', wrong: 'the tail is stuck on the same end as the eye' },
    'car-wheels': { draw: 'car', ground: 140, swap: { wheel: [{ x: 38, y: 74, w: 36, h: 36 }, { x: 126, y: 74, w: 36, h: 36 }] },
      right: 'the wheels sit at the bottom and touch the road', wrong: 'the wheels float inside the car, above the road' },
    'train-wheels': { draw: 'train', ground: 142, swap: { wheel: [{ x: 36, y: 78, w: 34, h: 34 }, { x: 82, y: 78, w: 34, h: 34 }, { x: 128, y: 78, w: 34, h: 34 }] },
      right: 'the wheels touch the track', wrong: 'the wheels float up inside the train' },
    'flower-petals': { draw: 'flower', swap: { petal: [{ x: 110, y: 12, w: 24, h: 28 }, { x: 114, y: 38, w: 30, h: 22 }, { x: 108, y: 60, w: 24, h: 28 }, { x: 134, y: 28, w: 26, h: 22 }] },
      right: 'the petals go all the way around the center', wrong: 'all the petals are on one side' }
  };
  Y.OOPS = OOPS;
  function oopsDrawing(s, key, bad) {
    var spec = OOPS[key], D0 = A().DRAWINGS[spec.draw], save = D0.parts;
    if (spec.ground) { sv('rect', { x: 0, y: spec.ground, width: 200, height: 160 - spec.ground, fill: spec.draw === 'train' ? '#b9a58a' : '#9c958a' }, s); if (spec.draw === 'train') for (var i = 0; i < 10; i++) sv('rect', { x: 6 + i * 20, y: spec.ground + 2, width: 10, height: 6, fill: '#7a5a3a' }, s); }
    if (bad) { var used = {}; D0.parts = save.map(function (p) { var sw = spec.swap[p.role]; if (!sw) return p; var j = used[p.role] = (used[p.role] || 0); used[p.role]++; return Object.assign({}, p, sw[j] || sw[sw.length - 1]); }); }
    try { U().drawDrawing(sv('g', null, s), spec.draw, {}); } finally { D0.parts = save; }
  }
  V.register('ydraw-oops', function (el, o) {
    var F = frame(el, o, 'ydraw', 'Two drawings, A and B'), key = o.oops || 'fish-tail', good = o.good || 'A', spec = OOPS[key];
    cards(F, ['A', 'B'], { labels: 'letters', columns: 2 }, 200, 160, function (s, L) { oopsDrawing(s, key, L !== good); }, function () { return 'a drawing'; });
    if (!F.quiet && o.explain !== false) F.body.appendChild(h('p', 'arv-hint', 'In ' + good + ', ' + spec.right + '. In ' + (good === 'A' ? 'B' : 'A') + ', ' + spec.wrong + '.'));
    return {};
  });
})(window, typeof document !== 'undefined' ? document : null);
