/* Color and Design (Art & Drawing Ladder, course key design): course visuals, prefixed design-.
   Needs math/viz/core.js and the ladder kit (static/art/viz/art.js + art.css: MathLadder.art and the .arv styles).
   Every visual: light and dark themes, no overflow at 360 px, an aria-label, quiet: true for problems (names become letters
   A, B, C…, nothing that gives the answer away). Drawn people use the site's cartoon skin color (#ffcc4d, outline #e8a93a).

   design-swatches  color chips. colors: [hex…] (one row) or palettes: [[hex…], …] (rows lettered A, B, C…); names: [text…]
                    (or one list per palette) shown under the chips unless quiet; letters: true letters single chips;
                    gray: true starts in gray; toggle: false hides "Show in gray (value only)" (quiet hides it too).
                    mode 'inset': pairs: [[ground, inner], …] a small square of the inner color on each ground, lettered.
   design-text      text samples. pairs: [[text color, background], …]; text: the sample words; large: true (big text);
                    ratio: false hides the WCAG contrast ratio under each sample (quiet hides it).
   design-implied   kinds of line: 'actual' (a drawn line), 'dots' (a row of dots), 'edges' (shapes whose edges line up),
                    'gaze' (a cartoon face looking at a star), 'pointing' (an arrow shape aimed at a target). kinds: [...];
                    lines: true draws the implied path (dashed) when not quiet.
   design-squint    a picture to squint at: work: a catalog id (used only when MathLadder.art.hasImg) or a generated landscape
                    (scene: as ar-compose); buttons "Squint (blur)" and "Gray (value only)"; blur, gray: start states.
   design-screen    a color seen up close on a screen (red, green and blue subpixels) and in print (cyan, magenta, yellow and
                    black dots). color: hex; kinds: ['screen', 'print'] (or one); quiet letters the panels.
   design-structure small abstract layouts built on a structure: kinds of 'triangle' 'diagonal' 's-curve' 'circle'
                    'horizontal' 'vertical'; show: true draws the structure line over each (never when quiet).          */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  if (!ML.viz || !D) return;
  var V = ML.viz, M = Math, NS = 'http://www.w3.org/2000/svg';
  var SKIN = '#ffcc4d', SKIN_LINE = '#e8a93a';
  function A() { return ML.art; }
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, at, parent) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function letter(i) { return String.fromCharCode(65 + i); }
  function dark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function btn(parent, text, fn) { var b = h('button', 'ml-btn', text); b.type = 'button'; b.addEventListener('click', fn); parent.appendChild(b); return b; }
  function svgRoot(w, hh, label) { return sv('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'arv-svg', role: 'img', 'aria-label': label || '', focusable: 'false' }); }
  function cap1(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function frame(el, o, name, label) {
    el.classList.add('arv', 'dz', 'dz-' + name);
    if (!el.getAttribute('aria-label') || o.label) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), interactive: o.interactive !== false };
    if (o.task) el.appendChild(h('p', 'arv-task', o.task));
    F.body = h('div', 'arv-body'); el.appendChild(F.body);
    F.ctl = h('div', 'ml-ctl arv-ctl'); el.appendChild(F.ctl);
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    return F;
  }
  var css = '.dz .dz-pal{display:flex;align-items:center;gap:.5rem;margin:.35rem 0}' +
    '.dz .dz-chips{display:flex;flex-wrap:wrap;gap:.4rem;flex:1;min-width:0}' +
    '.dz .dz-chip{display:flex;flex-direction:column;align-items:center;gap:.2rem;min-width:0;flex:1 1 52px;max-width:110px}' +
    '.dz .dz-sw{width:100%;height:54px;border-radius:9px;border:1px solid rgba(0,0,0,.18);display:grid;place-items:center}' +
    'html[data-theme="dark"] .dz .dz-sw{border-color:rgba(255,255,255,.22)}' +
    '.dz .dz-nm{font:600 .78rem system-ui,sans-serif;text-align:center;line-height:1.2;overflow-wrap:anywhere}' +
    '.dz .dz-grid{display:grid;grid-template-columns:repeat(var(--n,3),minmax(0,1fr));gap:.55rem}' +
    '@media (max-width:560px){.dz .dz-grid{grid-template-columns:repeat(min(var(--n,3),2),minmax(0,1fr))}}' +
    '.dz .dz-inset{width:100%;box-sizing:border-box;height:110px;border-radius:10px;display:grid;place-items:center;border:1px solid rgba(0,0,0,.15)}' +
    '.dz .dz-inset span{display:block;height:50%;aspect-ratio:1/1;border-radius:4px}' +
    '.dz .dz-txt{width:100%;box-sizing:border-box;border-radius:10px;padding:.8rem .7rem;border:1px solid rgba(0,0,0,.15);min-height:64px;display:flex;align-items:center;justify-content:center;text-align:center;font:500 1rem/1.35 system-ui,sans-serif;overflow-wrap:anywhere}' +
    '.dz .dz-txt.big{font-size:1.45rem;font-weight:700}' +
    '.dz .dz-ratio{font:600 .82rem system-ui,sans-serif;text-align:center;color:var(--mv-muted)}' +
    '.dz .dz-pic{position:relative;border-radius:10px;overflow:hidden;max-width:520px;margin:0 auto}' +
    '.dz .dz-pic img,.dz .dz-pic svg{display:block;width:100%;height:auto;transition:filter .25s}' +
    '.dz .dz-ink{stroke:#26221e}html[data-theme="dark"] .dz .dz-ink{stroke:#e6ece8}' +
    '.dz .dz-inkf{fill:#26221e}html[data-theme="dark"] .dz .dz-inkf{fill:#e6ece8}' +
    '.dz .dz-path{fill:none;stroke:#b8197f;stroke-width:2.5;stroke-dasharray:6 5}html[data-theme="dark"] .dz .dz-path{stroke:#ff86cf}' +
    '.dz .dz-bg{fill:#fbf8f0}html[data-theme="dark"] .dz .dz-bg{fill:#22312a}';
  if (!D.getElementById('dz-css')) { var st = D.createElement('style'); st.id = 'dz-css'; st.textContent = css; D.head.appendChild(st); }

  function grayOn(el, on, hex) { el.style.background = on ? A().grayOf(hex) : hex; }

  /* ---------- design-swatches ---------- */
  V.register('design-swatches', function (el, o) {
    var F = frame(el, o, 'swatches', 'Color swatches'), gray = !!o.gray, cells = [];
    if (o.mode === 'inset') {
      var grid = h('div', 'dz-grid'); grid.style.setProperty('--n', M.min((o.pairs || []).length, 3)); F.body.appendChild(grid);
      (o.pairs || []).forEach(function (p, i) {
        var card = h('div', 'arl-card'), box = h('div', 'dz-inset'), inner = h('span');
        box.setAttribute('role', 'img'); box.setAttribute('aria-label', 'Panel ' + letter(i) + ': a small square on a colored ground');
        box.appendChild(inner); card.appendChild(box); cells.push([box, p[0]], [inner, p[1]]);
        card.appendChild(h('span', 'arl-lab arl-letter', letter(i))); grid.appendChild(card);
      });
    } else {
      var pals = o.palettes || [o.colors || []], names = o.palettes ? (o.names || []) : (o.names ? [o.names] : []);
      pals.forEach(function (pal, pi) {
        var row = h('div', 'dz-pal'), chips = h('div', 'dz-chips');
        if (o.palettes) row.appendChild(h('span', 'arl-letter', letter(pi)));
        pal.forEach(function (hex, i) {
          var c = h('div', 'dz-chip'), sw = h('div', 'dz-sw'); sw.setAttribute('role', 'img');
          var nm = (names[pi] || [])[i];
          sw.setAttribute('aria-label', (F.quiet || !nm ? 'A color swatch' : nm) + (o.letters && !o.palettes ? ' ' + letter(i) : ''));
          c.appendChild(sw); cells.push([sw, hex]);
          if (o.letters && !o.palettes) c.appendChild(h('span', 'arl-letter', letter(i)));
          else if (nm && !F.quiet) c.appendChild(h('span', 'dz-nm', esc(nm)));
          chips.appendChild(c);
        });
        row.appendChild(chips); F.body.appendChild(row);
      });
    }
    function paint() { cells.forEach(function (c) { grayOn(c[0], gray, c[1]); }); }
    paint();
    if (F.interactive && o.toggle !== false && !F.quiet) { var b = btn(F.ctl, gray ? 'Show in color' : 'Show in gray (value only)', function () { gray = !gray; b.textContent = gray ? 'Show in color' : 'Show in gray (value only)'; paint(); }); }
    return {};
  });

  /* ---------- design-text ---------- */
  V.register('design-text', function (el, o) {
    var F = frame(el, o, 'text', 'Text samples in different colors'), pairs = o.pairs || [['#1d2320', '#ffffff']];
    var grid = h('div', 'dz-grid'); grid.style.setProperty('--n', M.min(pairs.length, 3)); F.body.appendChild(grid);
    pairs.forEach(function (p, i) {
      var card = h('div', 'arl-card'), t = h('div', 'dz-txt' + (o.large ? ' big' : ''), esc(o.text || 'Read me easily'));
      t.style.color = p[0]; t.style.background = p[1]; card.appendChild(t);
      var r = A().contrast(p[0], p[1]);
      if (F.quiet || pairs.length > 1) card.appendChild(h('span', 'arl-lab arl-letter', letter(i)));
      if (!F.quiet && o.ratio !== false) card.appendChild(h('span', 'dz-ratio', 'Contrast ' + (M.floor(r * 10) / 10).toFixed(1) + ' : 1'));
      grid.appendChild(card);
    });
    return {};
  });

  /* ---------- design-implied ---------- */
  var IMPLIED = { actual: 'an actual (drawn) line', dots: 'a row of dots', edges: 'edges that line up', gaze: 'a gaze', pointing: 'a shape that points' };
  function star(g, cx, cy, r, fill) { var pts = []; for (var k = 0; k < 10; k++) { var a = -M.PI / 2 + M.PI / 5 * k, q = k % 2 ? 0.42 : 1; pts.push((cx + M.cos(a) * r * q).toFixed(1) + ',' + (cy + M.sin(a) * r * q).toFixed(1)); } sv('polygon', { points: pts.join(' '), fill: fill }, g); }
  function implied(g, kind, show) {
    sv('rect', { x: 0, y: 0, width: 200, height: 140, rx: 8, class: 'dz-bg' }, g);
    if (kind === 'actual') { sv('path', { d: 'M18,104 C60,20 110,130 182,40', fill: 'none', class: 'dz-ink', 'stroke-width': 4, 'stroke-linecap': 'round' }, g); }
    if (kind === 'dots') { for (var i = 0; i < 9; i++) { var t = i / 8, x = 18 + t * 164, y = 104 - M.sin(t * M.PI) * 64 + t * -10; sv('circle', { cx: x, cy: y, r: 6, fill: '#2a6db0' }, g); } if (show) sv('path', { d: 'M18,104 Q100,-24 182,94', class: 'dz-path' }, g); }
    if (kind === 'edges') { [[20, 96, 44, 30], [78, 66, 44, 60], [136, 36, 44, 90]].forEach(function (r) { sv('rect', { x: r[0], y: r[1], width: r[2], height: r[3], fill: '#d9a441' }, g); }); if (show) sv('line', { x1: 14, y1: 96 + 10, x2: 186, y2: 30 - 6, class: 'dz-path' }, g); }
    if (kind === 'gaze') {
      sv('rect', { x: 26, y: 92, width: 40, height: 48, rx: 12, fill: '#2a6db0' }, g); // shirt
      sv('circle', { cx: 46, cy: 68, r: 26, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 2 }, g);
      sv('path', { d: 'M20,64 Q22,36 48,40 Q66,42 70,56 Q56,48 44,52 Q30,56 28,70 Z', fill: '#5a3a22' }, g); // hair
      sv('circle', { cx: 60, cy: 64, r: 3.2, class: 'dz-inkf' }, g); sv('path', { d: 'M58,80 Q64,82 68,78', fill: 'none', class: 'dz-ink', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
      sv('path', { d: 'M71,64 L76,70 L71,72', fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 1.5 }, g); // nose
      star(g, 168, 34, 16, '#d9a441');
      if (show) sv('line', { x1: 64, y1: 62, x2: 152, y2: 36, class: 'dz-path' }, g);
    }
    if (kind === 'pointing') { sv('polygon', { points: '20,110 110,72 96,64 132,58 112,88 104,80 26,122', fill: '#b8197f' }, g); sv('circle', { cx: 168, cy: 44, r: 16, fill: '#2a6db0' }, g); if (show) sv('line', { x1: 132, y1: 58, x2: 156, y2: 50, class: 'dz-path' }, g); }
  }
  V.register('design-implied', function (el, o) {
    var F = frame(el, o, 'implied', 'Kinds of line'), kinds = [].concat(o.kinds || ['actual', 'dots', 'edges', 'gaze']);
    var grid = h('div', 'dz-grid'); grid.style.setProperty('--n', M.min(kinds.length, o.columns || 3)); F.body.appendChild(grid);
    kinds.forEach(function (k, i) {
      var card = h('div', 'arl-card'), s = svgRoot(200, 140, F.quiet ? 'Picture ' + letter(i) : 'A line made by ' + IMPLIED[k]); implied(s, k, !!o.lines && !F.quiet); card.appendChild(s);
      card.appendChild(h('span', 'arl-lab' + (F.quiet || o.letters ? ' arl-letter' : ''), F.quiet || o.letters ? letter(i) : cap1(IMPLIED[k]) + (k === 'actual' ? '' : '<small>implied line</small>')));
      grid.appendChild(card);
    });
    return {};
  });

  /* ---------- design-squint ---------- */
  V.register('design-squint', function (el, o) {
    var F = frame(el, o, 'squint', 'A picture to squint at'), Ak = A(), wk = o.work ? Ak.work(o.work) : null, useImg = wk && Ak.hasImg(wk);
    var pic = h('div', 'dz-pic'), media; F.body.appendChild(pic);
    if (useImg) { media = h('img'); media.src = Ak.imgUrl(wk); media.alt = F.quiet ? 'A painting' : wk.title + ', ' + wk.artist; media.loading = 'lazy'; }
    else { media = svgRoot(300, 200, 'A simple landscape'); Ak._ui.sceneComp(media, 300, 200, Object.assign({ sx: 0.66, sy: 0.6, hy: 0.6, subject: 'house', sun: [0.2, 0.22] }, o.scene || {})); }
    pic.appendChild(media);
    var blur = !!o.blur, gray = !!o.gray;
    function apply() { media.style.filter = (blur ? 'blur(6px) ' : '') + (gray ? 'grayscale(1)' : '') || 'none'; }
    apply();
    if (F.interactive) {
      var b1 = btn(F.ctl, 'Squint (blur)', function () { blur = !blur; b1.setAttribute('aria-pressed', String(blur)); apply(); }); b1.setAttribute('aria-pressed', String(blur));
      var b2 = btn(F.ctl, 'Gray (value only)', function () { gray = !gray; b2.setAttribute('aria-pressed', String(gray)); apply(); }); b2.setAttribute('aria-pressed', String(gray));
    }
    if (useImg && !F.quiet) F.body.appendChild(h('p', 'ml-cap', esc(wk.title) + ', ' + esc(wk.artist) + ', ' + esc(wk.date) + '.'));
    return {};
  });

  /* ---------- design-screen ---------- */
  function rgbOf(hex) { return A().hex2rgb(hex).map(function (v) { return v / 255; }); }
  function cmyk(hex) { var c = rgbOf(hex), k = 1 - M.max(c[0], c[1], c[2]); if (k > 0.999) return [0, 0, 0, 1]; return [(1 - c[0] - k) / (1 - k), (1 - c[1] - k) / (1 - k), (1 - c[2] - k) / (1 - k), k]; }
  function screenPanel(g, hex) {
    var c = rgbOf(hex); sv('rect', { x: 0, y: 0, width: 200, height: 140, rx: 8, fill: '#0d0d10' }, g);
    for (var j = 0; j < 4; j++) for (var i = 0; i < 6; i++) ['#ff2a2a', '#2aff4a', '#2a6bff'].forEach(function (col, q) { sv('rect', { x: 10 + i * 31 + q * 9.5, y: 10 + j * 31, width: 8, height: 27, rx: 2, fill: col, 'fill-opacity': (0.08 + 0.92 * c[q]).toFixed(2) }, g); });
  }
  var clipN = 0;
  function printPanel(g, hex) {
    var v = cmyk(hex); sv('rect', { x: 0, y: 0, width: 200, height: 140, rx: 8, fill: '#ffffff', stroke: '#ccc' }, g); var cid = 'dzc' + (++clipN), cp = sv('clipPath', { id: cid }, sv('defs', null, g)); sv('rect', { x: 0, y: 0, width: 200, height: 140, rx: 8 }, cp);
    var inks = [['#00aeef', 15, 0], ['#ec008c', 75, 0.33], ['#fff200', 0, 0.66], ['#231f20', 45, 0.15]];
    var grp = sv('g', { style: 'isolation:isolate', 'clip-path': 'url(#' + cid + ')' }, g);
    inks.forEach(function (ink, q) { var amt = v[q]; if (amt < 0.03) return; var a = ink[1] * M.PI / 180, step = 16, r = M.sqrt(amt) * step * 0.62;
      for (var j = -22; j < 22; j++) for (var i = -22; i < 22; i++) { var x0 = i * step + ink[2] * step, y0 = j * step, x = 100 + x0 * M.cos(a) - y0 * M.sin(a), y = 70 + x0 * M.sin(a) + y0 * M.cos(a); if (x < -8 || x > 208 || y < -8 || y > 148) continue; sv('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: r.toFixed(2), fill: ink[0], style: 'mix-blend-mode:multiply' }, grp); } });
  }
  V.register('design-screen', function (el, o) {
    var F = frame(el, o, 'screen', 'A color up close on a screen and in print'), kinds = [].concat(o.kinds || ['screen', 'print']), hex = o.color || '#f5871f';
    var grid = h('div', 'dz-grid'); grid.style.setProperty('--n', M.min(kinds.length + (o.swatch === false ? 0 : 1), 3)); F.body.appendChild(grid);
    if (o.swatch !== false) { var c0 = h('div', 'arl-card'), sw = h('div', 'dz-inset'); sw.style.background = hex; sw.setAttribute('role', 'img'); sw.setAttribute('aria-label', 'The color from a normal distance'); c0.appendChild(sw); c0.appendChild(h('span', 'arl-lab', 'From a distance')); grid.appendChild(c0); }
    kinds.forEach(function (k, i) {
      var card = h('div', 'arl-card'), s = svgRoot(200, 140, F.quiet ? 'Close-up ' + letter(i) : k === 'screen' ? 'Screen pixels up close: red, green and blue lights' : 'Print up close: cyan, magenta, yellow and black dots');
      if (k === 'screen') screenPanel(s, hex); else printPanel(s, hex); card.appendChild(s);
      card.appendChild(h('span', 'arl-lab' + (F.quiet ? ' arl-letter' : ''), F.quiet ? letter(i) : k === 'screen' ? 'Screen up close<small>red, green, blue lights</small>' : 'Print up close<small>cyan, magenta, yellow, black dots</small>'));
      grid.appendChild(card);
    });
    return {};
  });

  /* ---------- design-structure ---------- */
  var STRUCT = { triangle: 'a triangle', diagonal: 'a diagonal', 's-curve': 'an S-curve', circle: 'a circle', horizontal: 'horizontals', vertical: 'verticals' };
  function blob(g, x, y, r, fill) { sv('circle', { cx: x, cy: y, r: r, fill: fill }, g); }
  function structure(g, k, show) {
    sv('rect', { x: 0, y: 0, width: 200, height: 140, rx: 8, class: 'dz-bg' }, g);
    var acc = '#b8197f', blue = '#2a6db0', gold = '#d9a441', green = '#3aa64a', path = null;
    if (k === 'triangle') { sv('rect', { x: 84, y: 30, width: 32, height: 90, rx: 10, fill: acc }, g); blob(g, 100, 24, 12, acc); sv('rect', { x: 34, y: 82, width: 30, height: 40, rx: 8, fill: blue }, g); sv('rect', { x: 136, y: 82, width: 30, height: 40, rx: 8, fill: blue }, g); blob(g, 49, 76, 9, blue); blob(g, 151, 76, 9, blue); path = 'M30,124 L100,12 L170,124 Z'; }
    if (k === 'diagonal') { for (var i = 0; i < 6; i++) { var x = 22 + i * 30, y = 118 - i * 19; sv('rect', { x: x - 8, y: y - 22, width: 16, height: 26, rx: 4, fill: i % 2 ? gold : blue }, g); } sv('path', { d: 'M0,140 L200,40 L200,140 Z', fill: green, 'fill-opacity': 0.35 }, g); path = 'M14,128 L190,18'; }
    if (k === 's-curve') { sv('path', { d: 'M40,140 C190,120 10,70 150,46 C190,38 170,26 120,20', fill: 'none', stroke: blue, 'stroke-width': 14, 'stroke-linecap': 'round' }, g); blob(g, 120, 20, 7, gold); path = 'M40,140 C190,120 10,70 150,46 C190,38 170,26 120,20'; }
    if (k === 'circle') { for (var j = 0; j < 8; j++) { var a = j * M.PI / 4; blob(g, 100 + M.cos(a) * 46, 70 + M.sin(a) * 44, 11, j % 2 ? gold : acc); } blob(g, 100, 70, 14, blue); path = 'M146,70 A46,44 0 1 1 54,70 A46,44 0 1 1 146,70'; }
    if (k === 'horizontal') { sv('rect', { x: 0, y: 92, width: 200, height: 48, fill: green, 'fill-opacity': 0.45 }, g); [30, 80, 130, 170].forEach(function (x, q) { sv('rect', { x: x - 16, y: 76 + (q % 2) * 4, width: 32, height: 16, rx: 6, fill: q % 2 ? gold : blue }, g); }); path = 'M8,86 L192,86'; }
    if (k === 'vertical') { [36, 76, 116, 156].forEach(function (x, q) { sv('rect', { x: x - 7, y: 18 + (q % 2) * 10, width: 14, height: 112 - (q % 2) * 10, rx: 4, fill: q % 2 ? gold : blue }, g); }); path = 'M36,10 L36,132 M76,10 L76,132 M116,10 L116,132 M156,10 L156,132'; }
    if (show && path) sv('path', { d: path, class: 'dz-path' }, g);
  }
  V.register('design-structure', function (el, o) {
    var F = frame(el, o, 'structure', 'Layouts built on simple structures'), kinds = [].concat(o.kinds || ['triangle', 'diagonal', 's-curve']);
    var grid = h('div', 'dz-grid'); grid.style.setProperty('--n', M.min(kinds.length, o.columns || 3)); F.body.appendChild(grid);
    kinds.forEach(function (k, i) {
      var card = h('div', 'arl-card'), s = svgRoot(200, 140, F.quiet ? 'Layout ' + letter(i) : 'A layout built on ' + STRUCT[k]); structure(s, k, !!o.show && !F.quiet); card.appendChild(s);
      card.appendChild(h('span', 'arl-lab' + (F.quiet ? ' arl-letter' : ''), F.quiet ? letter(i) : cap1(STRUCT[k])));
      grid.appendChild(card);
    });
    return {};
  });
})(window, typeof document !== 'undefined' ? document : null);
