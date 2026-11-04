/* Science Explorers (Physics Ladder, course key sciexp): the course's own pictures, for ages 9 and 10. Original SVG drawn
   here; vanilla JS on top of math/viz/core.js (window.MathLadder.viz). Light and dark themes (html[data-theme="dark"]).
   Drawn people use the site's one cartoon skin color (fill #ffcc4d, outline #e8a93a).

   Common options: quiet: true hides anything that could give a problem's answer away (names of asked items, readouts,
   verdicts); interactive: false makes a still picture (no sliders, buttons or motion); letters: true labels items A, B, C…;
   ask: an item whose label shows "?".

   sciexp-pic        cards with an emoji picture and a caption. items: [[emoji, caption, bin?], …]. mode 'sort' with bins:
                     [names] (tap a card, then a bin; Check). letters: captions become A, B, C.
   sciexp-bars       a bar chart. title, unit, bars: [[label, value], …], ask: index (its value shows "?"), max.
   sciexp-measure    tool: 'thermo' (value in °C; f: true adds a °F scale) | 'ruler' (value in cm, 0–15) | 'cylinder'
                     (value in mL, 0–100). slider: true lets the learner change the value. quiet: no number written.
   sciexp-particles  state: 'solid' | 'liquid' | 'gas' | 'all' (three boxes). The particles jiggle unless still.
   sciexp-lever      a lever balanced on a fulcrum. load (blocks), loadAt, effortAt (steps from the fulcrum, 1–6);
                     slider: true moves the push point; quiet: the push is "?".
   sciexp-machines   the six simple machines. items: ['lever', 'wheel', 'pulley', 'ramp', 'wedge', 'screw'] (default all).
   sciexp-circuit    a battery and bulb circuit. closed (true), switch: true (a switch to tap), gap: a material key bridging a
                     gap in the wire (foil, clip, coin, key, spoon, nail | eraser, wood, plastic, paper, glass, band, cloth),
                     coil: true (an electromagnet with paper clips), broken: true (one wire not connected). quiet: the bulb is
                     drawn with a "?" instead of lit or dark.
   sciexp-magnets    two bar magnets. a, b: 'NS' or 'SN' (poles left to right); flip: true adds buttons; quiet: no verdict.
   sciexp-shadow     mode 'lamp' (dist 1–5: the block's distance from the lamp) | 'sun' (time: 'morning' | 'noon' |
                     'evening' or hour 7–17); slider: true.
   sciexp-light      mode 'mirror' (angle from the normal, slider) | 'bend' (a straw in water) | 'prism'.
   sciexp-sound      a sound wave. pitch 1–5, loud 1–5, slider; or compare: [[pitch, loud], [pitch, loud]] (waves A and B).
   sciexp-cycle      kind 'water' | 'rock'. ask: a step key (evaporation, condensation, precipitation, collection | igneous,
                     sedimentary, metamorphic); letters.
   sciexp-chain      a food chain: items: [keys], ask: index; or web: 'meadow' | 'pond' | 'forest'.
   sciexp-body       a body with some organs seen through an x-ray window. show: [brain, lungs, heart, stomach, intestines,
                     bones], highlight, ask, letters.
   sciexp-sky        mode 'daynight' (slider turns the Earth) | 'phases' (ask: phase index 0–7; one: index shows only that
                     phase as seen from Earth) | 'planets' (ask: index 0–7; letters).
   sciexp-plant      a plant making food: parts and what goes in and out. ask: 'roots' | 'stem' | 'leaves' | 'flower';
                     arrows: false hides the in/out arrows.                                                              */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder, V = ML && ML.viz; if (!D || !V || !V.register) return;
  var NS = 'http://www.w3.org/2000/svg', M = Math;
  if (!D.getElementById('sciexp-css')) {
    var st = D.createElement('style'); st.id = 'sciexp-css';
    st.textContent = [
      '.sx{--sx-ink:#1d2320;--sx-mut:#5d6862;--sx-line:#56625b;--sx-pan:#fbf8f0;--sx-card:#ffffff;--sx-bd:#d8dfd9;--sx-acc:#0f7f8a;--sx-accs:#e1f1f2;',
      '--sx-sky:#e6f2fb;--sx-gnd:#d9c9a3;--sx-wat:#9ccbf0;--sx-watd:#3d84c6;--sx-red:#d6336c;--sx-blue:#1c6fd6;--sx-gold:#b8963e;--sx-leaf:#3f9a52;--sx-wood:#a8743a;--sx-metal:#9aa5ad;--sx-glow:#ffe066;',
      'color:var(--sx-ink);margin:0 auto;max-width:720px}',
      'html[data-theme="dark"] .sx{--sx-ink:#e6ece8;--sx-mut:#a9b8af;--sx-line:#b6c4bb;--sx-pan:#1b2b22;--sx-card:#20322a;--sx-bd:#355044;--sx-acc:#6cc7d0;--sx-accs:#1d3d40;',
      '--sx-sky:#1a2c3b;--sx-gnd:#5b4d33;--sx-wat:#2f5f87;--sx-watd:#8fc3ef;--sx-red:#ff8787;--sx-blue:#74c0fc;--sx-gold:#e0c070;--sx-leaf:#7fcf8c;--sx-wood:#c99a60;--sx-metal:#8d99a2;--sx-glow:#ffd43b}',
      '.sx svg{display:block;width:100%;height:auto;overflow:visible}.sx text{font-family:inherit}.sx text:not([fill]){fill:var(--sx-ink)}.sx .sx-mut{fill:var(--sx-mut)}',
      '.sx .sx-ln{stroke:var(--sx-line);fill:none;stroke-width:2}.sx .sx-pan{fill:var(--sx-pan);stroke:var(--sx-bd)}',
      '.sx-ctl{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center;justify-content:center;margin:.5rem 0 0}.sx-ctl .ml-sl{min-width:min(260px,100%)}',
      '.sx-out{text-align:center;margin:.35rem 0 0;font-weight:600;min-height:1.4em}',
      '.sx-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:.6rem}',
      '.sx-card{background:var(--sx-card);border:2px solid var(--sx-bd);border-radius:12px;padding:.5rem .4rem;text-align:center;font:inherit;color:inherit;line-height:1.25}',
      '.sx-card .sx-e{display:block;font-size:2.4rem;line-height:1.2}.sx-card .sx-c{display:block;font-size:.9rem;margin-top:.2rem}',
      'button.sx-card{cursor:pointer}button.sx-card[aria-pressed="true"]{border-color:var(--sx-acc);box-shadow:0 0 0 3px var(--sx-accs)}',
      '.sx-card.ok{border-color:#2f9e44}.sx-card.no{border-color:#e03131}',
      '.sx-bins{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem;margin-top:.7rem}',
      '.sx-bin{border:2px dashed var(--sx-bd);border-radius:12px;padding:.4rem;min-height:5rem;background:var(--sx-pan)}',
      '.sx-bin>button.sx-binh{display:block;width:100%;font:inherit;font-weight:700;background:var(--sx-accs);color:inherit;border:0;border-radius:8px;padding:.35rem;cursor:pointer;margin-bottom:.4rem}',
      '.sx-bin .sx-cards{grid-template-columns:repeat(auto-fill,minmax(84px,1fr))}.sx-bin .sx-card .sx-e{font-size:1.7rem}',
      '.sx-glowc{fill:var(--sx-glow);opacity:.55}.sx-wire{stroke:var(--sx-line);stroke-width:4;fill:none;stroke-linecap:round}',
      '.sx-n{fill:#e03131}.sx-s{fill:#1c6fd6}html[data-theme="dark"] .sx-n{fill:#c92a2a}html[data-theme="dark"] .sx-s{fill:#1864ab}.sx-pole{fill:#fff!important;font-weight:700}',
      '.sx-skin{fill:#ffcc4d;stroke:#e8a93a;stroke-width:2}'
    ].join('');
    D.head.appendChild(st);
  }
  function S(tag, at, parent, text) {
    var e = D.createElementNS(NS, tag);
    for (var k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function H(tag, cls, parent, text) { var e = D.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; if (parent) parent.appendChild(e); return e; }
  function svg(el, w, h, label) { var s = S('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': label || '' }, el); return s; }
  function wrap(el, o) { el.innerHTML = ''; var w = H('div', 'sx', el); if (o.task) H('p', 'sx-out', w, o.task); return w; }
  function live(o) { return o.interactive !== false && !o.quiet; }
  function letter(i) { return String.fromCharCode(65 + i); }
  function arrow(g, x1, y1, x2, y2, cls, col) {
    var a = M.atan2(y2 - y1, x2 - x1), L = 10;
    S('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col || 'var(--sx-line)', 'stroke-width': 3, 'class': cls }, g);
    S('path', { d: 'M' + x2 + ' ' + y2 + 'L' + (x2 - L * M.cos(a - .45)) + ' ' + (y2 - L * M.sin(a - .45)) + 'L' + (x2 - L * M.cos(a + .45)) + ' ' + (y2 - L * M.sin(a + .45)) + 'Z', fill: col || 'var(--sx-line)' }, g);
  }
  function txt(g, x, y, s, at) { var o = { x: x, y: y, 'text-anchor': 'middle', 'font-size': 15 }; for (var k in at) o[k] = at[k]; return S('text', o, g, s); }

  /* ---------------- sciexp-pic ---------------- */
  V.register('sciexp-pic', function (el, o) {
    var w = wrap(el, o), items = (o.items || []).map(function (it, i) { return Array.isArray(it) ? { e: it[0], c: it[1], bin: it[2], i: i } : { e: it.e, c: it.c, bin: it.bin, i: i }; });
    function cap(it) { return o.letters || o.quiet ? letter(it.i) : it.c; }
    function card(it, parent, asBtn) {
      var c = H(asBtn ? 'button' : 'div', 'sx-card', parent); if (asBtn) c.type = 'button';
      H('span', 'sx-e', c, it.e).setAttribute('aria-hidden', 'true');
      H('span', 'sx-c', c, cap(it)); if (!asBtn) c.setAttribute('role', 'img');
      c.setAttribute('aria-label', (o.letters || o.quiet ? letter(it.i) + ': ' : '') + (o.quiet ? 'picture ' + letter(it.i) : it.c));
      return c;
    }
    if (o.mode !== 'sort' || o.interactive === false) { var g = H('div', 'sx-cards', w); items.forEach(function (it) { card(it, g); }); return; }
    var pool = H('div', 'sx-cards', w), sel = null, place = {}, bins = [], out = H('p', 'sx-out', w);
    out.setAttribute('aria-live', 'polite');
    var binWrap = H('div', 'sx-bins', w);
    (o.bins || []).forEach(function (b, bi) {
      var box = H('div', 'sx-bin', binWrap), hb = H('button', 'sx-binh', box, b); hb.type = 'button';
      var inner = H('div', 'sx-cards', box); bins.push(inner);
      hb.addEventListener('click', function () { if (sel === null) { out.textContent = 'Tap a card first, then a box.'; return; } place[sel] = bi; sel = null; draw(); });
    });
    var ctl = H('div', 'sx-ctl', w);
    V.button(ctl, 'Check', function () {
      var n = 0, right = 0; items.forEach(function (it) { if (place[it.i] !== undefined) { n++; if (place[it.i] === it.bin) right++; } });
      draw(true); out.textContent = n < items.length ? 'Sort every card first (' + n + ' of ' + items.length + ' sorted).' : right === n ? 'All ' + n + ' right!' : right + ' of ' + n + ' right. Look at the cards with a red edge again.';
    });
    V.button(ctl, 'Start over', function () { place = {}; sel = null; out.textContent = ''; draw(); });
    function draw(check) {
      pool.innerHTML = ''; bins.forEach(function (b) { b.innerHTML = ''; });
      items.forEach(function (it) {
        var inBin = place[it.i] !== undefined, c = card(it, inBin ? bins[place[it.i]] : pool, true);
        c.setAttribute('aria-pressed', String(sel === it.i));
        if (check && inBin) c.classList.add(place[it.i] === it.bin ? 'ok' : 'no');
        c.addEventListener('click', function () { sel = sel === it.i ? null : it.i; if (inBin) { delete place[it.i]; } draw(); });
      });
    }
    draw();
  });

  /* ---------------- sciexp-bars ---------------- */
  V.register('sciexp-bars', function (el, o) {
    var w = wrap(el, o), bars = o.bars || [], n = bars.length, rowH = 52, top = o.title ? 34 : 8, Wd = 600, Hh = top + n * rowH + 30;
    var max = o.max || M.ceil(M.max.apply(null, bars.map(function (b) { return b[1]; }).concat([1])) / 5) * 5;
    var s = svg(w, Wd, Hh, o.title || 'Bar chart'), x0 = 20, x1 = Wd - 70;
    if (o.title) txt(s, Wd / 2, 22, o.title, { 'font-weight': 700, 'font-size': 17 });
    var step = max <= 10 ? 1 : max <= 30 ? 5 : max <= 60 ? 10 : 20;
    for (var v = 0; v <= max; v += step) { var x = x0 + (x1 - x0) * v / max; S('line', { x1: x, y1: top, x2: x, y2: top + n * rowH, stroke: 'var(--sx-bd)' }, s); txt(s, x, top + n * rowH + 18, String(v), { 'font-size': 13, 'class': 'sx-mut' }); }
    bars.forEach(function (b, i) {
      var y = top + i * rowH, ask = o.ask === i;
      S('text', { x: x0, y: y + 16, 'font-size': 15 }, s, (o.letters ? letter(i) + '. ' : '') + b[0]);
      S('rect', { x: x0, y: y + 22, width: (x1 - x0) * b[1] / max, height: 20, rx: 4, fill: ['var(--sx-acc)', 'var(--sx-gold)', 'var(--sx-leaf)', 'var(--sx-red)', 'var(--sx-blue)'][i % 5] }, s);
      S('text', { x: x0 + (x1 - x0) * b[1] / max + 6, y: y + 38, 'font-size': 15, 'font-weight': 700 }, s, ask || o.quiet ? '?' : b[1] + (o.unit ? ' ' + o.unit : ''));
    });
    if (o.unit) S('text', { x: x1 + 4, y: top + n * rowH + 18, 'font-size': 13, 'class': 'sx-mut' }, s, o.unit);
  });

  /* ---------------- sciexp-measure ---------------- */
  V.register('sciexp-measure', function (el, o) {
    var w = wrap(el, o), tool = o.tool || 'thermo', val = +o.value || 0, s, g, out = H('p', 'sx-out', w);
    function draw() {
      if (s) s.remove(); out.textContent = '';
      if (tool === 'thermo') {
        s = svg(w, 260, 360, 'A thermometer'); w.insertBefore(s, out); var lo = -20, hi = 50, yT = 30, yB = 300, X = 130;
        function Y(c) { return yB - (c - lo) / (hi - lo) * (yB - yT); }
        S('rect', { x: X - 11, y: yT - 14, width: 22, height: yB - yT + 30, rx: 11, fill: 'var(--sx-card)', stroke: 'var(--sx-line)', 'stroke-width': 2 }, s);
        S('circle', { cx: X, cy: yB + 26, r: 20, fill: 'var(--sx-red)', stroke: 'var(--sx-line)', 'stroke-width': 2 }, s);
        S('rect', { x: X - 5, y: Y(val), width: 10, height: yB + 14 - Y(val), fill: 'var(--sx-red)' }, s);
        for (var c = lo; c <= hi; c += 2) { var big = c % 10 === 0; S('line', { x1: X - 12, x2: X - 12 - (big ? 16 : 8), y1: Y(c), y2: Y(c), stroke: 'var(--sx-line)', 'stroke-width': big ? 2 : 1 }, s); if (big) S('text', { x: X - 32, y: Y(c) + 5, 'text-anchor': 'end', 'font-size': 14 }, s, String(c).replace('-', '−')); }
        S('text', { x: X - 32, y: 16, 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700 }, s, '°C');
        if (o.f) {
          for (var f = 0; f <= 120; f += 10) { var yc = Y((f - 32) * 5 / 9); if (yc < yT - 2 || yc > yB + 2) continue; S('line', { x1: X + 12, x2: X + 26, y1: yc, y2: yc, stroke: 'var(--sx-line)' }, s); S('text', { x: X + 31, y: yc + 5, 'font-size': 14 }, s, String(f)); }
          S('text', { x: X + 31, y: 16, 'font-size': 14, 'font-weight': 700 }, s, '°F');
        }
        if (!o.quiet) out.textContent = String(val).replace('-', '−') + ' °C' + (o.f ? ' (about ' + M.round(val * 9 / 5 + 32) + ' °F)' : '');
      } else if (tool === 'ruler') {
        s = svg(w, 660, 150, 'A ruler'); w.insertBefore(s, out); var x0 = 30, u = 40;
        S('rect', { x: 10, y: 70, width: 640, height: 60, rx: 6, fill: '#f3d98b', stroke: '#b8963e', 'stroke-width': 2 }, s);
        for (var mm = 0; mm <= 150; mm++) { var x = x0 + mm * u / 10, t = mm % 10 === 0 ? 24 : mm % 5 === 0 ? 16 : 9; S('line', { x1: x, x2: x, y1: 70, y2: 70 + t, stroke: '#4a3a10', 'stroke-width': mm % 10 ? 1 : 1.6 }, s); if (mm % 10 === 0) S('text', { x: x, y: 118, 'text-anchor': 'middle', 'font-size': 14, fill: '#2b2208' }, s, String(mm / 10)); }
        S('text', { x: 640, y: 125, 'text-anchor': 'end', 'font-size': 12, fill: '#2b2208' }, s, 'cm');
        var len = val * u; S('rect', { x: x0, y: 34, width: len - 26, height: 24, fill: '#f2b233', stroke: '#9a6a12', 'stroke-width': 2 }, s);
        S('path', { d: 'M' + (x0 + len - 26) + ' 34L' + (x0 + len) + ' 46L' + (x0 + len - 26) + ' 58Z', fill: '#e9cfa0', stroke: '#9a6a12', 'stroke-width': 2 }, s);
        S('rect', { x: x0 - 2, y: 34, width: 14, height: 24, fill: '#e88a9a', stroke: '#9a6a12', 'stroke-width': 2 }, s);
        S('line', { x1: x0 + len, x2: x0 + len, y1: 30, y2: 70, stroke: 'var(--sx-acc)', 'stroke-dasharray': '4 3', 'stroke-width': 2 }, s);
        if (!o.quiet) out.textContent = String(val) + ' cm';
      } else {
        s = svg(w, 240, 360, 'A graduated cylinder'); w.insertBefore(s, out); var yT2 = 40, yB2 = 320, X0 = 80, X1 = 160;
        function Yc(v) { return yB2 - v / 100 * (yB2 - yT2); }
        S('path', { d: 'M' + X0 + ' ' + Yc(val) + 'Q' + ((X0 + X1) / 2) + ' ' + (Yc(val) + 8) + ' ' + X1 + ' ' + Yc(val) + 'L' + X1 + ' ' + yB2 + 'L' + X0 + ' ' + yB2 + 'Z', fill: 'var(--sx-wat)' }, s);
        S('path', { d: 'M' + X0 + ' ' + (yT2 - 14) + 'L' + X0 + ' ' + yB2 + 'L' + X1 + ' ' + yB2 + 'L' + X1 + ' ' + (yT2 - 14), fill: 'none', stroke: 'var(--sx-line)', 'stroke-width': 3 }, s);
        S('rect', { x: X0 - 26, y: yB2, width: X1 - X0 + 52, height: 12, rx: 3, fill: 'var(--sx-line)' }, s);
        for (var v = 0; v <= 100; v += 5) { var yy = Yc(v), b = v % 10 === 0; S('line', { x1: X0, x2: X0 + (b ? 24 : 14), y1: yy, y2: yy, stroke: 'var(--sx-line)', 'stroke-width': b ? 2 : 1 }, s); if (b && v) S('text', { x: X0 - 8, y: yy + 5, 'text-anchor': 'end', 'font-size': 14 }, s, String(v)); }
        S('text', { x: X1 + 10, y: yT2, 'font-size': 14, 'font-weight': 700 }, s, 'mL');
        if (!o.quiet) out.textContent = val + ' mL';
      }
    }
    draw();
    if (o.slider && live(o)) {
      var ctl = H('div', 'sx-ctl', w), rng = tool === 'thermo' ? [-20, 50, 1] : tool === 'ruler' ? [1, 14.5, .5] : [5, 95, 5];
      V.slider(ctl, { label: tool === 'thermo' ? 'Temperature' : tool === 'ruler' ? 'Length' : 'Water', min: rng[0], max: rng[1], step: rng[2], value: val, input: function (v) { val = v; draw(); } });
    }
  });

  /* ---------------- sciexp-particles ---------------- */
  V.register('sciexp-particles', function (el, o) {
    var w = wrap(el, o), states = o.state && o.state !== 'all' ? [o.state] : ['solid', 'liquid', 'gas'];
    var names = { solid: 'Solid', liquid: 'Liquid', gas: 'Gas' }, bw = 170, Wd = states.length * (bw + 20) + 10, s = svg(w, Wd, 230, 'Particles in ' + states.join(', '));
    var sets = [];
    states.forEach(function (k, si) {
      var gx = 15 + si * (bw + 20), g = S('g', {}, s);
      S('rect', { x: gx, y: 20, width: bw, height: 170, rx: 8, 'class': 'sx-pan', 'stroke-width': 2 }, g);
      var ps = [], R = M.random;
      if (k === 'solid') { for (var r = 0; r < 5; r++) for (var c = 0; c < 6; c++) ps.push({ hx: gx + 28 + c * 23, hy: 70 + r * 23 }); }
      else if (k === 'liquid') { var seed = 3; for (var i = 0; i < 26; i++) { seed = (seed * 9301 + 49297) % 233280; var t = seed / 233280; ps.push({ hx: gx + 18 + (i % 7) * 22 + t * 6, hy: 112 + M.floor(i / 7) * 21 + t * 5, liq: true }); } }
      else { for (var j = 0; j < 9; j++) ps.push({ hx: gx + 20 + ((j * 47) % 130), hy: 35 + ((j * 71) % 140), gas: true, vx: (j % 2 ? 1 : -1) * (30 + j * 5), vy: (j % 3 - 1) * 35 + 20 }); }
      ps.forEach(function (p) { p.x = p.hx; p.y = p.hy; p.c = S('circle', { cx: p.x, cy: p.y, r: 9.5, fill: k === 'solid' ? 'var(--sx-acc)' : k === 'liquid' ? 'var(--sx-blue)' : 'var(--sx-red)', stroke: 'var(--sx-line)', 'stroke-width': 1 }, g); });
      if (k === 'liquid') S('line', { x1: gx + 4, x2: gx + bw - 4, y1: 100, y2: 100, stroke: 'var(--sx-watd)', 'stroke-dasharray': '5 4' }, g);
      txt(g, gx + bw / 2, 214, o.letters || o.quiet ? letter(si) : names[k], { 'font-weight': 700, 'font-size': 17 });
      sets.push({ k: k, ps: ps, gx: gx });
    });
    if (o.interactive === false || V.reduced) return;
    var tt = 0;
    V.loop(w, function (dt) {
      tt += dt;
      sets.forEach(function (S1) {
        S1.ps.forEach(function (p, i) {
          if (S1.k === 'solid') { p.x = p.hx + 2.2 * M.sin(tt * 9 + i * 1.7); p.y = p.hy + 2.2 * M.cos(tt * 8 + i * 2.3); }
          else if (S1.k === 'liquid') { p.x = p.hx + 5 * M.sin(tt * 2.2 + i); p.y = p.hy + 3 * M.cos(tt * 2.7 + i * 1.3); }
          else { p.x += p.vx * dt; p.y += p.vy * dt; var a = S1.gx + 12, b = S1.gx + bw - 12; if (p.x < a) { p.x = a; p.vx = -p.vx; } if (p.x > b) { p.x = b; p.vx = -p.vx; } if (p.y < 32) { p.y = 32; p.vy = -p.vy; } if (p.y > 178) { p.y = 178; p.vy = -p.vy; } }
          p.c.setAttribute('cx', p.x.toFixed(1)); p.c.setAttribute('cy', p.y.toFixed(1));
        });
      });
    });
  });

  /* ---------------- sciexp-lever ---------------- */
  V.register('sciexp-lever', function (el, o) {
    var w = wrap(el, o), load = +o.load || 6, la = +o.loadAt || 2, ea = +o.effortAt || 4, s, out = H('p', 'sx-out', w);
    function draw() {
      if (s) s.remove(); s = svg(w, 640, 250, 'A lever'); w.insertBefore(s, out);
      var cx = 320, u = 44, by = 170;
      S('path', { d: 'M' + cx + ' ' + (by + 8) + 'L' + (cx - 26) + ' ' + (by + 52) + 'L' + (cx + 26) + ' ' + (by + 52) + 'Z', fill: 'var(--sx-gold)', stroke: 'var(--sx-line)', 'stroke-width': 2 }, s);
      S('line', { x1: 0, x2: 640, y1: by + 53, y2: by + 53, stroke: 'var(--sx-line)', 'stroke-width': 2 }, s);
      S('rect', { x: cx - 6.5 * u, y: by, width: 13 * u, height: 10, rx: 3, fill: 'var(--sx-wood)', stroke: 'var(--sx-line)', 'stroke-width': 1.5 }, s);
      for (var k = -6; k <= 6; k++) { if (!k) continue; S('line', { x1: cx + k * u, x2: cx + k * u, y1: by + 10, y2: by + 18, stroke: 'var(--sx-line)' }, s); txt(s, cx + k * u, by + 32, String(M.abs(k)), { 'font-size': 12, 'class': 'sx-mut' }); }
      txt(s, cx, by + 70, 'fulcrum', { 'font-size': 13, 'class': 'sx-mut' });
      var lx = cx - la * u;
      for (var b = 0; b < load; b++) { var col = b % 2, row = M.floor(b / 2); S('rect', { x: lx - 20 + col * 20 - (load === 1 ? -10 : 0), y: by - 20 - row * 20, width: 19, height: 19, rx: 2, fill: 'var(--sx-acc)', stroke: 'var(--sx-line)' }, s); }
      txt(s, lx, by - 26 - M.ceil(load / 2) * 20, 'load ' + load, { 'font-size': 14, 'font-weight': 700 });
      var ex = cx + ea * u, need = load * la / ea, ns = o.quiet ? '?' : (M.round(need * 100) / 100) + ' block' + (need === 1 ? '' : 's');
      arrow(s, ex, by - 90, ex, by - 4, '', 'var(--sx-red)');
      txt(s, ex, by - 98, 'push ' + ns, { 'font-size': 14, 'font-weight': 700 });
      if (!o.quiet) out.textContent = load + ' × ' + la + ' = ' + (M.round(need * 100) / 100) + ' × ' + ea + '  (load × its distance = push × its distance)';
    }
    draw();
    if (o.slider && live(o)) { var ctl = H('div', 'sx-ctl', w); V.slider(ctl, { label: 'Push point (steps from the fulcrum)', min: 1, max: 6, step: 1, value: ea, input: function (v) { ea = v; draw(); } }); }
  });

  /* ---------------- sciexp-machines ---------------- */
  var MACH = {
    lever: ['Lever', function (g) { S('path', { d: 'M60 78L48 96L72 96Z', fill: 'var(--sx-gold)', stroke: 'var(--sx-line)' }, g); S('line', { x1: 10, y1: 66, x2: 110, y2: 86, stroke: 'var(--sx-wood)', 'stroke-width': 7, 'stroke-linecap': 'round' }, g); S('rect', { x: 14, y: 44, width: 18, height: 18, fill: 'var(--sx-acc)' }, g); arrow(g, 104, 50, 104, 78, '', 'var(--sx-red)'); }],
    wheel: ['Wheel and axle', function (g) { S('circle', { cx: 60, cy: 55, r: 38, fill: 'none', stroke: 'var(--sx-line)', 'stroke-width': 5 }, g); for (var a = 0; a < 6; a++) S('line', { x1: 60, y1: 55, x2: 60 + 38 * M.cos(a * M.PI / 3), y2: 55 + 38 * M.sin(a * M.PI / 3), stroke: 'var(--sx-line)', 'stroke-width': 2 }, g); S('circle', { cx: 60, cy: 55, r: 9, fill: 'var(--sx-metal)', stroke: 'var(--sx-line)', 'stroke-width': 2 }, g); }],
    pulley: ['Pulley', function (g) { S('line', { x1: 20, y1: 8, x2: 100, y2: 8, stroke: 'var(--sx-line)', 'stroke-width': 4 }, g); S('line', { x1: 60, y1: 8, x2: 60, y2: 22, stroke: 'var(--sx-line)', 'stroke-width': 3 }, g); S('circle', { cx: 60, cy: 36, r: 15, fill: 'var(--sx-metal)', stroke: 'var(--sx-line)', 'stroke-width': 2 }, g); S('line', { x1: 45, y1: 36, x2: 45, y2: 82, stroke: 'var(--sx-wood)', 'stroke-width': 3 }, g); S('line', { x1: 75, y1: 36, x2: 75, y2: 96, stroke: 'var(--sx-wood)', 'stroke-width': 3 }, g); S('rect', { x: 32, y: 82, width: 26, height: 18, fill: 'var(--sx-acc)' }, g); arrow(g, 86, 70, 86, 98, '', 'var(--sx-red)'); }],
    ramp: ['Inclined plane (ramp)', function (g) { S('path', { d: 'M8 96L112 96L112 40Z', fill: 'var(--sx-gnd)', stroke: 'var(--sx-line)', 'stroke-width': 2 }, g); S('rect', { x: 52, y: 52, width: 20, height: 20, fill: 'var(--sx-acc)', transform: 'rotate(-28 62 62)' }, g); }],
    wedge: ['Wedge', function (g) { S('path', { d: 'M38 12L82 12L60 96Z', fill: 'var(--sx-metal)', stroke: 'var(--sx-line)', 'stroke-width': 2 }, g); S('rect', { x: 10, y: 76, width: 42, height: 20, fill: 'var(--sx-wood)' }, g); S('rect', { x: 68, y: 76, width: 42, height: 20, fill: 'var(--sx-wood)' }, g); }],
    screw: ['Screw', function (g) { S('rect', { x: 40, y: 6, width: 40, height: 12, rx: 3, fill: 'var(--sx-metal)', stroke: 'var(--sx-line)' }, g); S('path', { d: 'M50 18L50 82L60 98L70 82L70 18Z', fill: 'var(--sx-metal)', stroke: 'var(--sx-line)' }, g); for (var y = 24; y < 84; y += 10) S('line', { x1: 44, y1: y + 6, x2: 76, y2: y, stroke: 'var(--sx-line)', 'stroke-width': 2.5 }, g); }]
  };
  V.register('sciexp-machines', function (el, o) {
    var w = wrap(el, o), items = o.items || ['lever', 'wheel', 'pulley', 'ramp', 'wedge', 'screw'], cols = M.min(items.length, 3), rows = M.ceil(items.length / cols);
    var s = svg(w, cols * 150, rows * 140, 'Simple machines: ' + (o.quiet ? items.length + ' pictures' : items.map(function (k) { return MACH[k][0]; }).join(', ')));
    items.forEach(function (k, i) {
      var g = S('g', { transform: 'translate(' + (15 + (i % cols) * 150) + ',' + (8 + M.floor(i / cols) * 140) + ')' }, s);
      S('rect', { x: -6, y: -4, width: 132, height: 128, rx: 10, 'class': 'sx-pan' }, g);
      MACH[k][1](g);
      txt(g, 60, 116, o.letters || o.quiet || o.ask === k ? (o.ask === k ? '?' : letter(i)) : MACH[k][0], { 'font-size': 13, 'font-weight': 700 });
    });
  });

  /* ---------------- sciexp-circuit ---------------- */
  var MAT = { foil: ['aluminum foil', 1, '#c9d1d6'], clip: ['steel paper clip', 1, '#aab4bb'], coin: ['steel coin', 1, '#b7a46a'], key: ['iron key', 1, '#b39a5c'], spoon: ['metal spoon', 1, '#b9c3c9'], nail: ['iron nail', 1, '#8d99a2'],
    eraser: ['rubber eraser', 0, '#f08aa0'], wood: ['wooden stick', 0, '#c99a60'], plastic: ['plastic ruler', 0, '#7fb8e6'], paper: ['paper', 0, '#f1f1f1'], glass: ['glass rod', 0, '#bfe3ea'], band: ['rubber band', 0, '#e7b14a'], cloth: ['cloth', 0, '#b6a2d6'] };
  V.register('sciexp-circuit', function (el, o) {
    var w = wrap(el, o), closed = o.closed !== false, s, out = H('p', 'sx-out', w);
    function draw() {
      if (s) s.remove(); s = svg(w, 520, 300, 'A circuit with a battery and a bulb'); w.insertBefore(s, out);
      var gapOk = !o.gap || (MAT[o.gap] && MAT[o.gap][1]), lit = closed && gapOk && !o.broken;
      // wires: battery at left (x 70, y 120-200), bulb top middle (260, 60), right side down, bottom back
      S('path', { d: 'M70 120L70 60L230 60', 'class': 'sx-wire' }, s);
      S('path', { d: 'M290 60L450 60L450 150', 'class': 'sx-wire' }, s);
      if (o.switch) {
        S('path', { d: 'M450 150L450 165', 'class': 'sx-wire' }, s); S('circle', { cx: 450, cy: 168, r: 5, fill: 'var(--sx-line)' }, s); S('circle', { cx: 450, cy: 222, r: 5, fill: 'var(--sx-line)' }, s);
        S('line', { x1: 450, y1: 168, x2: closed ? 450 : 482, y2: closed ? 222 : 208, stroke: 'var(--sx-line)', 'stroke-width': 5, 'stroke-linecap': 'round' }, s);
        S('path', { d: 'M450 222L450 250L300 250', 'class': 'sx-wire' }, s);
        txt(s, 492, 196, 'switch', { 'font-size': 13, 'text-anchor': 'start', 'class': 'sx-mut' });
      } else S('path', { d: 'M450 150L450 250L300 250', 'class': 'sx-wire' }, s);
      if (o.gap) {
        S('path', { d: 'M300 250L270 250', 'class': 'sx-wire' }, s); S('path', { d: 'M190 250L70 250L70 210', 'class': 'sx-wire' }, s);
        var m = MAT[o.gap] || ['?', 0, '#ccc'];
        S('rect', { x: 182, y: 240, width: 96, height: 20, rx: 4, fill: m[2], stroke: 'var(--sx-line)', 'stroke-width': 1.5 }, s);
        txt(s, 230, 285, o.quiet && o.hideGap ? '?' : m[0], { 'font-size': 14, 'font-weight': 700 });
      } else if (o.broken) { S('path', { d: 'M300 250L215 250', 'class': 'sx-wire' }, s); S('path', { d: 'M180 262L70 250L70 210', 'class': 'sx-wire' }, s); txt(s, 198, 238, 'gap', { 'font-size': 13, 'class': 'sx-mut' }); }
      else S('path', { d: 'M300 250L70 250L70 210', 'class': 'sx-wire' }, s);
      if (o.coil) { for (var i = 0; i < 6; i++) S('ellipse', { cx: 330 + i * 12, cy: 250, rx: 5, ry: 13, fill: 'none', stroke: '#c0632b', 'stroke-width': 3 }, s); S('rect', { x: 315, y: 245, width: 90, height: 10, fill: 'var(--sx-metal)' }, s); if (lit || (closed && !o.gap && !o.quiet)) { for (var j = 0; j < 3; j++) S('path', { d: 'M' + (335 + j * 18) + ' 262l0 12a5 5 0 0 0 10 0l0-8', fill: 'none', stroke: 'var(--sx-line)', 'stroke-width': 2 }, s); } }
      // battery
      S('rect', { x: 50, y: 120, width: 40, height: 90, rx: 6, fill: 'var(--sx-gold)', stroke: 'var(--sx-line)', 'stroke-width': 2 }, s); S('rect', { x: 62, y: 112, width: 16, height: 9, fill: 'var(--sx-metal)', stroke: 'var(--sx-line)' }, s);
      txt(s, 70, 150, '+', { 'font-size': 20, 'font-weight': 700 }); txt(s, 70, 200, '−', { 'font-size': 20, 'font-weight': 700 }); txt(s, 70, 232, 'battery', { 'font-size': 13, 'class': 'sx-mut' });
      // bulb
      if (lit && !o.quiet) S('circle', { cx: 260, cy: 44, r: 44, 'class': 'sx-glowc' }, s);
      S('circle', { cx: 260, cy: 42, r: 24, fill: lit && !o.quiet ? 'var(--sx-glow)' : 'var(--sx-card)', stroke: 'var(--sx-line)', 'stroke-width': 2 }, s);
      S('rect', { x: 248, y: 62, width: 24, height: 14, fill: 'var(--sx-metal)', stroke: 'var(--sx-line)' }, s);
      S('path', { d: 'M252 62L256 40L264 40L268 62', fill: 'none', stroke: 'var(--sx-line)', 'stroke-width': 1.5 }, s);
      if (o.quiet) txt(s, 260, 50, '?', { 'font-size': 22, 'font-weight': 700 });
      txt(s, 300, 30, 'bulb', { 'font-size': 13, 'text-anchor': 'start', 'class': 'sx-mut' });
      if (!o.quiet) out.textContent = lit ? 'Closed circuit: the bulb lights.' : o.gap && !gapOk ? 'The ' + MAT[o.gap][0] + ' is an insulator: no current, the bulb is dark.' : 'Open circuit: the bulb is dark.';
    }
    draw();
    if (o.switch && live(o)) { var ctl = H('div', 'sx-ctl', w); V.button(ctl, 'Flip the switch', function () { closed = !closed; draw(); }); }
  });

  /* ---------------- sciexp-magnets ---------------- */
  V.register('sciexp-magnets', function (el, o) {
    var w = wrap(el, o), a = o.a || 'NS', b = o.b || 'NS', s, out = H('p', 'sx-out', w);
    function bar(x, ori) { var g = S('g', {}, s); S('rect', { x: x, y: 70, width: 90, height: 46, 'class': ori[0] === 'N' ? 'sx-n' : 'sx-s' }, g); S('rect', { x: x + 90, y: 70, width: 90, height: 46, 'class': ori[1] === 'N' ? 'sx-n' : 'sx-s' }, g); S('rect', { x: x, y: 70, width: 180, height: 46, fill: 'none', stroke: 'var(--sx-line)', 'stroke-width': 2 }, g); txt(g, x + 45, 101, ori[0], { 'class': 'sx-pole', 'font-size': 22 }); txt(g, x + 135, 101, ori[1], { 'class': 'sx-pole', 'font-size': 22 }); }
    function draw() {
      if (s) s.remove(); s = svg(w, 520, 180, 'Two bar magnets'); w.insertBefore(s, out);
      var att = a[1] !== b[0], gap = att ? 40 : 90, x1 = 260 - gap / 2 - 180, x2 = 260 + gap / 2;
      bar(x1, a); bar(x2, b);
      if (!o.quiet) { if (att) { arrow(s, x1 + 120, 145, x1 + 170, 145, '', 'var(--sx-acc)'); arrow(s, x2 + 60, 145, x2 + 10, 145, '', 'var(--sx-acc)'); } else { arrow(s, x1 + 170, 145, x1 + 120, 145, '', 'var(--sx-red)'); arrow(s, x2 + 10, 145, x2 + 60, 145, '', 'var(--sx-red)'); } }
      if (!o.quiet) out.textContent = att ? 'Facing poles ' + a[1] + ' and ' + b[0] + ' are opposite: they attract.' : 'Facing poles ' + a[1] + ' and ' + b[0] + ' are alike: they repel.';
      else txt(s, 260, 40, 'What happens?', { 'font-size': 15, 'class': 'sx-mut' });
    }
    draw();
    if (o.flip && live(o)) { var ctl = H('div', 'sx-ctl', w); V.button(ctl, 'Flip the left magnet', function () { a = a[1] + a[0]; draw(); }); V.button(ctl, 'Flip the right magnet', function () { b = b[1] + b[0]; draw(); }); }
  });

  /* ---------------- sciexp-shadow ---------------- */
  var HOURS = { morning: 8, noon: 12, evening: 17 };
  V.register('sciexp-shadow', function (el, o) {
    var w = wrap(el, o), mode = o.mode || 'lamp', dist = +o.dist || 2, hr = typeof o.time === 'number' ? o.time : HOURS[o.time] || 8, s, out = H('p', 'sx-out', w);
    function draw() {
      if (s) s.remove();
      if (mode === 'lamp') {
        s = svg(w, 620, 260, 'A lamp, a block and its shadow on a wall'); w.insertBefore(s, out);
        var lx = 40, ly = 130, wx = 580, ox = lx + 40 + dist * 80, oh = 50, top = ly - oh / 2, bot = ly + oh / 2;
        var sTop = ly + (top - ly) * (wx - lx) / (ox - lx), sBot = ly + (bot - ly) * (wx - lx) / (ox - lx);
        S('rect', { x: wx, y: 10, width: 24, height: 240, fill: 'var(--sx-pan)', stroke: 'var(--sx-bd)' }, s);
        S('path', { d: 'M' + lx + ' ' + ly + 'L' + wx + ' ' + M.max(10, sTop) + 'L' + wx + ' ' + M.min(250, sBot) + 'Z', fill: 'var(--sx-glow)', opacity: .25 }, s);
        S('line', { x1: lx, y1: ly, x2: wx, y2: sTop, stroke: 'var(--sx-gold)', 'stroke-dasharray': '6 4', 'stroke-width': 2 }, s);
        S('line', { x1: lx, y1: ly, x2: wx, y2: sBot, stroke: 'var(--sx-gold)', 'stroke-dasharray': '6 4', 'stroke-width': 2 }, s);
        S('rect', { x: wx, y: M.max(10, sTop), width: 24, height: M.min(250, sBot) - M.max(10, sTop), fill: '#333c44', opacity: .85 }, s);
        S('rect', { x: ox - 8, y: top, width: 16, height: oh, fill: 'var(--sx-acc)', stroke: 'var(--sx-line)' }, s);
        S('circle', { cx: lx, cy: ly, r: 16, fill: 'var(--sx-glow)', stroke: 'var(--sx-line)', 'stroke-width': 2 }, s);
        txt(s, lx, ly + 38, 'lamp', { 'font-size': 13, 'class': 'sx-mut' }); txt(s, ox, bot + 22, 'block', { 'font-size': 13, 'class': 'sx-mut' }); txt(s, wx + 12, 0, '', {});
        if (!o.quiet) out.textContent = 'Shadow height: ' + M.round((sBot - sTop) / oh * 10) / 10 + ' times the block';
      } else {
        s = svg(w, 620, 280, 'The Sun and a stick\'s shadow'); w.insertBefore(s, out);
        var t = (hr - 6) / 12, ang = M.PI * (1 - t), cx = 310, gy = 230, R = 200, sx = cx + R * M.cos(ang), sy = gy - R * 0.95 * M.sin(ang);
        S('rect', { x: 0, y: 0, width: 620, height: gy, fill: 'var(--sx-sky)' }, s); S('rect', { x: 0, y: gy, width: 620, height: 50, fill: 'var(--sx-gnd)' }, s);
        S('path', { d: 'M' + (cx - R) + ' ' + gy + 'A' + R + ' ' + (R * .95) + ' 0 0 1 ' + (cx + R) + ' ' + gy, fill: 'none', stroke: 'var(--sx-gold)', 'stroke-dasharray': '5 6' }, s);
        S('circle', { cx: sx, cy: sy, r: 18, fill: 'var(--sx-glow)', stroke: 'var(--sx-gold)', 'stroke-width': 2 }, s);
        var hgt = 70, elev = M.atan2(gy - sy, M.abs(sx - cx)), len = M.min(290, hgt / M.tan(M.max(.12, elev))), dir = sx < cx ? 1 : -1;
        S('path', { d: 'M' + cx + ' ' + gy + 'L' + (cx + dir * len) + ' ' + gy + 'L' + (cx + dir * len) + ' ' + (gy + 6) + 'L' + cx + ' ' + (gy + 6) + 'Z', fill: '#333c44', opacity: .8 }, s);
        S('line', { x1: cx, y1: gy, x2: cx, y2: gy - hgt, stroke: 'var(--sx-wood)', 'stroke-width': 6, 'stroke-linecap': 'round' }, s);
        txt(s, 30, gy + 32, 'East', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'start' }); txt(s, 590, gy + 32, 'West', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end' });
        if (!o.quiet) out.textContent = (hr < 11 ? 'Morning' : hr > 13 ? 'Evening' : 'Noon') + ': the Sun is ' + (hr < 11 ? 'low in the east, so the shadow is long and points west.' : hr > 13 ? 'low in the west, so the shadow is long and points east.' : 'high, so the shadow is short.');
      }
    }
    draw();
    if (o.slider && live(o)) { var ctl = H('div', 'sx-ctl', w); if (mode === 'lamp') V.slider(ctl, { label: 'Block distance from the lamp', min: 1, max: 6, step: .5, value: dist, input: function (v) { dist = v; draw(); } }); else V.slider(ctl, { label: 'Time of day', min: 7, max: 17, step: 1, value: hr, fmt: function (v) { return v < 12 ? v + ' a.m.' : v === 12 ? 'noon' : (v - 12) + ' p.m.'; }, input: function (v) { hr = v; draw(); } }); }
  });

  /* ---------------- sciexp-light ---------------- */
  var RAIN = ['#e03131', '#f76707', '#f2c200', '#2f9e44', '#1c7ed6', '#4c3bb5', '#9c36b5'];
  V.register('sciexp-light', function (el, o) {
    var w = wrap(el, o), mode = o.mode || 'mirror', ang = +o.angle || 40, s, out = H('p', 'sx-out', w);
    function draw() {
      if (s) s.remove();
      if (mode === 'mirror') {
        s = svg(w, 560, 280, 'A light ray reflecting off a mirror'); w.insertBefore(s, out);
        var cx = 280, my = 240, L = 200, a = ang * M.PI / 180;
        S('rect', { x: 60, y: my, width: 440, height: 14, fill: 'var(--sx-metal)', stroke: 'var(--sx-line)' }, s);
        for (var i = 70; i < 500; i += 16) S('line', { x1: i, y1: my + 14, x2: i - 10, y2: my + 26, stroke: 'var(--sx-line)' }, s);
        S('line', { x1: cx, y1: my, x2: cx, y2: 40, stroke: 'var(--sx-mut)', 'stroke-dasharray': '5 5' }, s);
        arrow(s, cx - L * M.sin(a), my - L * M.cos(a), cx - 3, my - 3, '', 'var(--sx-gold)');
        arrow(s, cx, my, cx + L * M.sin(a), my - L * M.cos(a), '', 'var(--sx-gold)');
        if (!o.quiet) { txt(s, cx - 60 * M.sin(a / 2) - 4, my - 70 * M.cos(a / 2), M.round(ang) + '°', { 'font-size': 15, 'font-weight': 700 }); txt(s, cx + 60 * M.sin(a / 2) + 4, my - 70 * M.cos(a / 2), M.round(ang) + '°', { 'font-size': 15, 'font-weight': 700 }); }
        txt(s, 280, 274, 'mirror', { 'font-size': 13, 'class': 'sx-mut' });
        if (!o.quiet) out.textContent = 'In at ' + M.round(ang) + '°, out at ' + M.round(ang) + '°.';
      } else if (mode === 'bend') {
        s = svg(w, 360, 320, 'A straw in a glass of water looks broken'); w.insertBefore(s, out);
        S('path', { d: 'M90 140L270 140L258 300L102 300Z', fill: 'var(--sx-wat)', opacity: .8 }, s);
        S('path', { d: 'M80 60L100 300L260 300L280 60', fill: 'none', stroke: 'var(--sx-line)', 'stroke-width': 3 }, s);
        S('line', { x1: 140, y1: 20, x2: 196, y2: 140, stroke: 'var(--sx-red)', 'stroke-width': 9, 'stroke-linecap': 'round' }, s);
        S('line', { x1: 214, y1: 140, x2: 238, y2: 286, stroke: 'var(--sx-red)', 'stroke-width': 9, 'stroke-linecap': 'round', opacity: .9 }, s);
        S('line', { x1: 196, y1: 140, x2: 252, y2: 260, stroke: 'var(--sx-red)', 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: .6 }, s);
        txt(s, 300, 145, 'water', { 'font-size': 13, 'class': 'sx-mut', 'text-anchor': 'start' });
      } else {
        s = svg(w, 600, 260, 'White light through a prism'); w.insertBefore(s, out);
        S('path', { d: 'M230 220L330 220L280 60Z', fill: 'var(--sx-accs)', stroke: 'var(--sx-line)', 'stroke-width': 2 }, s);
        S('line', { x1: 20, y1: 170, x2: 255, y2: 140, stroke: 'var(--sx-ink)', 'stroke-width': 6 }, s);
        txt(s, 80, 196, 'white light', { 'font-size': 14 });
        RAIN.forEach(function (c, i) { S('path', { d: 'M302 ' + (140 + i * 2) + 'L580 ' + (100 + i * 22) + 'L580 ' + (120 + i * 22) + 'L302 ' + (142 + i * 2) + 'Z', fill: c, opacity: .9 }, s); });
        if (!o.quiet) ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'].forEach(function (n, i) { S('text', { x: 590, y: 115 + i * 22, 'font-size': 12, 'text-anchor': 'end', fill: '#fff' }, s, n); });
      }
    }
    draw();
    if (mode === 'mirror' && o.slider && live(o)) { var ctl = H('div', 'sx-ctl', w); V.slider(ctl, { label: 'Angle of the ray', min: 10, max: 75, step: 5, value: ang, fmt: function (v) { return v + '°'; }, input: function (v) { ang = v; draw(); } }); }
  });

  /* ---------------- sciexp-sound ---------------- */
  V.register('sciexp-sound', function (el, o) {
    var w = wrap(el, o), waves = o.compare ? o.compare.map(function (x) { return x.slice(); }) : [[+o.pitch || 3, +o.loud || 3]], s, out = H('p', 'sx-out', w);
    function draw() {
      if (s) s.remove(); var hh = 120; s = svg(w, 600, waves.length * hh + 10, 'Sound waves'); w.insertBefore(s, out);
      waves.forEach(function (wv, k) {
        var y0 = 10 + k * hh + hh / 2, amp = 8 + wv[1] * 9, cyc = 1 + wv[0] * 1.5, d = '';
        S('line', { x1: 50, x2: 590, y1: y0, y2: y0, stroke: 'var(--sx-bd)' }, s);
        for (var x = 0; x <= 540; x += 3) d += (x ? 'L' : 'M') + (50 + x) + ' ' + (y0 - amp * M.sin(x / 540 * cyc * 2 * M.PI)).toFixed(1);
        S('path', { d: d, fill: 'none', stroke: k ? 'var(--sx-red)' : 'var(--sx-acc)', 'stroke-width': 3 }, s);
        if (waves.length > 1) txt(s, 22, y0 + 6, letter(k), { 'font-size': 20, 'font-weight': 700 });
      });
      if (!o.quiet && waves.length === 1) out.textContent = ['very low', 'low', 'middle', 'high', 'very high'][waves[0][0] - 1] + ' pitch, ' + ['very soft', 'soft', 'medium', 'loud', 'very loud'][waves[0][1] - 1];
    }
    draw();
    if (o.slider && live(o) && waves.length === 1) { var ctl = H('div', 'sx-ctl', w); V.slider(ctl, { label: 'Pitch (how fast it vibrates)', min: 1, max: 5, step: 1, value: waves[0][0], input: function (v) { waves[0][0] = v; draw(); } }); V.slider(ctl, { label: 'Loudness (how big)', min: 1, max: 5, step: 1, value: waves[0][1], input: function (v) { waves[0][1] = v; draw(); } }); }
  });

  /* ---------------- sciexp-cycle ---------------- */
  V.register('sciexp-cycle', function (el, o) {
    var w = wrap(el, o), keys, s;
    function lab(k, i, name) { return o.ask === k ? '?' : o.letters ? letter(i) : o.quiet && o.ask ? name : name; }
    if (o.kind === 'rock') {
      keys = ['igneous', 'sedimentary', 'metamorphic'];
      s = svg(w, 600, 340, 'The rock cycle');
      var pos = { igneous: [300, 50], sedimentary: [110, 270], metamorphic: [490, 270] }, names = { igneous: 'Igneous', sedimentary: 'Sedimentary', metamorphic: 'Metamorphic' }, cols = { igneous: '#c8553d', sedimentary: '#d9b26f', metamorphic: '#7f8fa6' };
      arrow(s, 250, 80, 140, 238, '', 'var(--sx-line)'); arrow(s, 170, 286, 420, 286, '', 'var(--sx-line)'); arrow(s, 470, 238, 350, 80, '', 'var(--sx-line)');
      if (!o.quiet) { txt(s, 140, 150, 'weathering, then', { 'font-size': 13, 'class': 'sx-mut' }); txt(s, 140, 166, 'pressing in layers', { 'font-size': 13, 'class': 'sx-mut' }); txt(s, 300, 312, 'heat and pressure', { 'font-size': 13, 'class': 'sx-mut' }); txt(s, 470, 150, 'melting, then', { 'font-size': 13, 'class': 'sx-mut' }); txt(s, 470, 166, 'cooling', { 'font-size': 13, 'class': 'sx-mut' }); }
      keys.forEach(function (k, i) { var p = pos[k]; S('rect', { x: p[0] - 85, y: p[1] - 26, width: 170, height: 52, rx: 12, fill: cols[k], stroke: 'var(--sx-line)', 'stroke-width': 2 }, s); S('text', { x: p[0], y: p[1] + 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: '#1d1d1d' }, s, lab(k, i, names[k])); });
      return;
    }
    keys = ['evaporation', 'condensation', 'precipitation', 'collection'];
    s = svg(w, 620, 360, 'The water cycle');
    S('rect', { x: 0, y: 0, width: 620, height: 360, fill: 'var(--sx-sky)', rx: 12 }, s);
    S('path', { d: 'M0 280Q160 250 300 290L620 290L620 360L0 360Z', fill: 'var(--sx-wat)' }, s);
    S('path', { d: 'M300 290L420 150L520 290Z', fill: 'var(--sx-gnd)', stroke: 'var(--sx-line)' }, s);
    S('circle', { cx: 60, cy: 60, r: 30, fill: 'var(--sx-glow)', stroke: 'var(--sx-gold)', 'stroke-width': 2 }, s);
    function cloud(x, y) { [[0, 0, 30], [30, -12, 34], [62, 0, 28], [30, 10, 30]].forEach(function (c) { S('circle', { cx: x + c[0], cy: y + c[1], r: c[2], fill: '#f4f7fa', stroke: '#b9c4cf' }, s); }); }
    cloud(250, 70); cloud(430, 60);
    for (var r = 0; r < 6; r++) S('line', { x1: 430 + r * 12, y1: 105 + (r % 2) * 10, x2: 424 + r * 12, y2: 125 + (r % 2) * 10, stroke: 'var(--sx-watd)', 'stroke-width': 3, 'stroke-linecap': 'round' }, s);
    arrow(s, 150, 260, 210, 120, '', 'var(--sx-red)'); arrow(s, 110, 262, 170, 130, '', 'var(--sx-red)');
    arrow(s, 520, 230, 460, 286, '', 'var(--sx-watd)');
    var L = { evaporation: [120, 200, 'Evaporation'], condensation: [280, 30, 'Condensation'], precipitation: [560, 130, 'Precipitation'], collection: [150, 328, 'Collection'] };
    keys.forEach(function (k, i) { var p = L[k]; S('rect', { x: p[0] - 66, y: p[1] - 17, width: 132, height: 26, rx: 13, fill: 'var(--sx-card)', stroke: 'var(--sx-bd)' }, s); txt(s, p[0], p[1] + 2, lab(k, i, p[2]), { 'font-size': 14, 'font-weight': 700 }); });
  });

  /* ---------------- sciexp-chain ---------------- */
  var ORG = { sun: ['☀️', 'Sun'], grass: ['🌿', 'Grass'], seeds: ['🌾', 'Seeds'], berries: ['🫐', 'Berries'], leaves: ['🍃', 'Leaves'], algae: ['🟢', 'Algae'], acorn: ['🌰', 'Acorns'], rabbit: ['🐇', 'Rabbit'], mouse: ['🐁', 'Mouse'], grasshopper: ['🦗', 'Grasshopper'], caterpillar: ['🐛', 'Caterpillar'], deer: ['🦌', 'Deer'], squirrel: ['🐿️', 'Squirrel'], frog: ['🐸', 'Frog'], snake: ['🐍', 'Snake'], fox: ['🦊', 'Fox'], hawk: ['🦅', 'Hawk'], owl: ['🦉', 'Owl'], wolf: ['🐺', 'Wolf'], bird: ['🐦', 'Bird'], fish: ['🐟', 'Small fish'], bigfish: ['🐠', 'Big fish'], heron: ['🦩', 'Heron'], mushroom: ['🍄', 'Mushroom'], worm: ['🪱', 'Worm'], bear: ['🐻', 'Bear'], tadpole: ['🐸', 'Tadpole'], snail: ['🐌', 'Snail'], ladybug: ['🐞', 'Ladybug'], aphid: ['🦟', 'Aphids'], shrimp: ['🦐', 'Shrimp'], seal: ['🦭', 'Seal'], whale: ['🐋', 'Whale'], plankton: ['🔬', 'Plankton'] };
  var WEBS = {
    meadow: { n: { sun: [60, 200], grass: [190, 200], grasshopper: [330, 110], rabbit: [330, 290], frog: [460, 110], fox: [470, 290], snake: [590, 110], hawk: [600, 290] }, e: [['sun', 'grass'], ['grass', 'grasshopper'], ['grass', 'rabbit'], ['grasshopper', 'frog'], ['frog', 'snake'], ['rabbit', 'fox'], ['rabbit', 'hawk'], ['snake', 'hawk']] },
    pond: { n: { sun: [60, 200], algae: [190, 200], tadpole: [330, 110], snail: [330, 290], fish: [460, 200], bigfish: [590, 110], heron: [600, 290] }, e: [['sun', 'algae'], ['algae', 'tadpole'], ['algae', 'snail'], ['tadpole', 'fish'], ['snail', 'fish'], ['fish', 'bigfish'], ['fish', 'heron'], ['tadpole', 'heron']] },
    forest: { n: { sun: [60, 200], acorn: [190, 120], berries: [190, 290], squirrel: [340, 110], mouse: [340, 290], owl: [500, 200], bear: [600, 300] }, e: [['sun', 'acorn'], ['sun', 'berries'], ['acorn', 'squirrel'], ['acorn', 'mouse'], ['berries', 'mouse'], ['berries', 'bear'], ['squirrel', 'owl'], ['mouse', 'owl']] }
  };
  V.register('sciexp-chain', function (el, o) {
    var w = wrap(el, o), s;
    function node(x, y, k, i) { var g = S('g', {}, s), O = ORG[k] || ['❓', k]; S('circle', { cx: x, cy: y, r: 34, fill: 'var(--sx-card)', stroke: 'var(--sx-bd)', 'stroke-width': 2 }, g); txt(g, x, y + 12, O[0], { 'font-size': 32 }); txt(g, x, y + 54, o.ask === i || o.ask === k ? '?' : o.letters ? letter(i) : O[1], { 'font-size': 14, 'font-weight': 700 }); }
    function link(p, q) { var dx = q[0] - p[0], dy = q[1] - p[1], d = M.sqrt(dx * dx + dy * dy); arrow(s, p[0] + dx / d * 38, p[1] + dy / d * 38, q[0] - dx / d * 40, q[1] - dy / d * 40, '', 'var(--sx-line)'); }
    if (o.web) { var Wb = WEBS[o.web] || WEBS.meadow; s = svg(w, 660, 360, 'A food web'); Wb.e.forEach(function (e) { link(Wb.n[e[0]], Wb.n[e[1]]); }); Object.keys(Wb.n).forEach(function (k, i) { node(Wb.n[k][0], Wb.n[k][1], k, i); }); return; }
    var items = o.items || ['sun', 'grass', 'rabbit', 'fox'], n = items.length, gapX = 130, Wd = n * gapX;
    s = svg(w, Wd, 130, 'A food chain');
    items.forEach(function (k, i) { if (i) link([gapX / 2 + (i - 1) * gapX, 50], [gapX / 2 + i * gapX, 50]); });
    items.forEach(function (k, i) { node(gapX / 2 + i * gapX, 50, k, i); });
  });

  /* ---------------- sciexp-body ---------------- */
  var ORGANS = { brain: 'Brain', lungs: 'Lungs', heart: 'Heart', stomach: 'Stomach', intestines: 'Intestines', bones: 'Bones' };
  V.register('sciexp-body', function (el, o) {
    var w = wrap(el, o), show = o.show || Object.keys(ORGANS), s = svg(w, 520, 470, 'A body with its organs');
    // a cartoon person: skin #ffcc4d / #e8a93a, a shirt with an x-ray window, shorts
    S('rect', { x: 205, y: 330, width: 40, height: 120, rx: 18, 'class': 'sx-skin' }, s); S('rect', { x: 275, y: 330, width: 40, height: 120, rx: 18, 'class': 'sx-skin' }, s);
    S('rect', { x: 140, y: 150, width: 36, height: 150, rx: 18, 'class': 'sx-skin', transform: 'rotate(12 158 150)' }, s); S('rect', { x: 344, y: 150, width: 36, height: 150, rx: 18, 'class': 'sx-skin', transform: 'rotate(-12 362 150)' }, s);
    S('rect', { x: 196, y: 318, width: 128, height: 50, rx: 10, fill: '#5b7db8' }, s);
    S('rect', { x: 170, y: 140, width: 180, height: 195, rx: 40, fill: '#8fd0c2', stroke: '#4f9b8b', 'stroke-width': 2 }, s);
    S('rect', { x: 186, y: 152, width: 148, height: 170, rx: 30, fill: 'var(--sx-card)', stroke: 'var(--sx-mut)', 'stroke-dasharray': '6 4', 'stroke-width': 2 }, s);
    S('rect', { x: 245, y: 112, width: 30, height: 34, 'class': 'sx-skin' }, s);
    S('circle', { cx: 260, cy: 70, r: 52, 'class': 'sx-skin' }, s);
    S('circle', { cx: 242, cy: 74, r: 5, fill: '#3b2a12' }, s); S('circle', { cx: 278, cy: 74, r: 5, fill: '#3b2a12' }, s); S('path', { d: 'M244 94Q260 106 276 94', fill: 'none', stroke: '#3b2a12', 'stroke-width': 3, 'stroke-linecap': 'round' }, s);
    var at = {}, list = [];
    function mark(k, x, y, lx, ly) { at[k] = [x, y, lx, ly]; }
    if (show.indexOf('brain') >= 0) { S('path', { d: 'M226 52Q228 26 260 26Q292 26 294 52Q296 64 282 62Q270 68 260 60Q248 68 238 62Q224 64 226 52Z', fill: '#f3a6b8', stroke: '#c05a7a', 'stroke-width': 1.5, opacity: .92 }, s); mark('brain', 260, 40, 430, 40); }
    if (show.indexOf('bones') >= 0) { for (var r = 0; r < 4; r++) S('path', { d: 'M206 ' + (172 + r * 16) + 'Q260 ' + (162 + r * 16) + ' 314 ' + (172 + r * 16), fill: 'none', stroke: '#c9c2b0', 'stroke-width': 4 }, s); S('line', { x1: 260, y1: 162, x2: 260, y2: 312, stroke: '#c9c2b0', 'stroke-width': 6 }, s); mark('bones', 300, 220, 430, 400); }
    if (show.indexOf('lungs') >= 0) { S('ellipse', { cx: 232, cy: 200, rx: 24, ry: 40, fill: '#f6b8c4', stroke: '#c05a7a', 'stroke-width': 1.5, opacity: .9 }, s); S('ellipse', { cx: 288, cy: 200, rx: 24, ry: 40, fill: '#f6b8c4', stroke: '#c05a7a', 'stroke-width': 1.5, opacity: .9 }, s); mark('lungs', 232, 200, 90, 180); }
    if (show.indexOf('heart') >= 0) { S('path', { d: 'M270 206q-4-14 8-16q10-1 10 10q0 12-16 22q-12-8-14-18q0-9 8-9q4 0 4 11z', fill: '#d6336c', stroke: '#8a1c42', 'stroke-width': 1.5, transform: 'translate(-6 4)' }, s); mark('heart', 270, 214, 430, 190); }
    if (show.indexOf('stomach') >= 0) { S('path', { d: 'M282 246q22 -2 24 16q2 22 -24 26q-18 2 -24 -8q8 -2 16 -8q8 -8 8 -26z', fill: '#f0a25a', stroke: '#a85f1c', 'stroke-width': 1.5 }, s); mark('stomach', 290, 268, 430, 280); }
    if (show.indexOf('intestines') >= 0) { S('path', { d: 'M222 284q0-10 12-10q12 0 12 10q0 10 12 10q12 0 12-10q0-10 12-10q10 0 10 12q0 12-14 14q-30 4-58 0q-10-4-10-16z', fill: '#e9b48a', stroke: '#a8703a', 'stroke-width': 1.5 }, s); mark('intestines', 236, 294, 90, 300); }
    show.forEach(function (k, i) {
      var p = at[k]; if (!p) return;
      S('line', { x1: p[0], y1: p[1], x2: p[2] + (p[2] < 260 ? 44 : -44), y2: p[3], stroke: o.highlight === k ? 'var(--sx-red)' : 'var(--sx-mut)', 'stroke-width': o.highlight === k ? 3 : 1.5 }, s);
      S('circle', { cx: p[0], cy: p[1], r: 4, fill: 'var(--sx-ink)' }, s);
      txt(s, p[2], p[3] + 5, o.ask === k ? '?' : o.letters || o.quiet ? letter(i) : ORGANS[k], { 'font-size': 16, 'font-weight': 700 });
    });
  });

  /* ---------------- sciexp-sky ---------------- */
  var PH = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
  var PL = [['Mercury', 5, '#a7a39a'], ['Venus', 9, '#e3c27a'], ['Earth', 9.5, '#3d84c6'], ['Mars', 7, '#c8553d'], ['Jupiter', 26, '#d4a373'], ['Saturn', 22, '#e9cf8f'], ['Uranus', 14, '#8fd3e0'], ['Neptune', 14, '#4c6fd1']];
  // the Moon as seen from Earth: lit fraction for phase i (0 new … 4 full), lit on the right while waxing (Northern Hemisphere)
  function moonFace(g, cx, cy, r, i) {
    S('circle', { cx: cx, cy: cy, r: r, fill: '#3a3f4a', stroke: 'var(--sx-line)' }, g);
    if (i === 0) return; if (i === 4) { S('circle', { cx: cx, cy: cy, r: r, fill: '#f4f1e1' }, g); return; }
    var wax = i < 4, k = M.cos(i / 8 * 2 * M.PI), side = wax ? 1 : 0, rx = M.abs(k) * r, sweepOuter = wax ? 1 : 0;
    var d = 'M' + cx + ' ' + (cy - r) + 'A' + r + ' ' + r + ' 0 0 ' + sweepOuter + ' ' + cx + ' ' + (cy + r);
    d += 'A' + rx + ' ' + r + ' 0 0 ' + ((k > 0) === wax ? 0 : 1) + ' ' + cx + ' ' + (cy - r) + 'Z';
    S('path', { d: d, fill: '#f4f1e1' }, g);
  }
  V.register('sciexp-sky', function (el, o) {
    var w = wrap(el, o), mode = o.mode || 'daynight', s, out = H('p', 'sx-out', w), turn = +o.turn || 0;
    function draw() {
      if (s) s.remove();
      if (mode === 'daynight') {
        s = svg(w, 600, 300, 'The Sun shining on the spinning Earth'); w.insertBefore(s, out);
        S('rect', { x: 0, y: 0, width: 600, height: 300, rx: 12, fill: '#0f1830' }, s);
        S('circle', { cx: 40, cy: 150, r: 70, fill: '#ffd43b' }, s);
        for (var r = 0; r < 5; r++) arrow(s, 130, 70 + r * 40, 250, 70 + r * 40, '', '#ffe066');
        var ex = 400, ey = 150, R = 90;
        S('circle', { cx: ex, cy: ey, r: R, fill: '#1c3d73' }, s);
        S('path', { d: 'M' + ex + ' ' + (ey - R) + 'A' + R + ' ' + R + ' 0 0 0 ' + ex + ' ' + (ey + R) + 'Z', fill: '#5fa8e8' }, s);
        S('circle', { cx: ex, cy: ey, r: R, fill: 'none', stroke: '#cfe3ff', 'stroke-width': 2 }, s);
        S('text', { x: ex - 50, y: ey + 5, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: '#0f1830' }, s, 'Day');
        S('text', { x: ex + 50, y: ey + 5, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: '#dbe7ff' }, s, 'Night');
        var a = M.PI + turn / 24 * 2 * M.PI, px = ex + R * M.cos(a), py = ey + R * M.sin(a) * -1;
        S('circle', { cx: px, cy: py, r: 9, fill: '#e03131', stroke: '#fff', 'stroke-width': 2 }, s);
        S('path', { d: 'M' + (ex - 40) + ' ' + (ey + R + 18) + 'Q' + ex + ' ' + (ey + R + 34) + ' ' + (ex + 40) + ' ' + (ey + R + 18), fill: 'none', stroke: '#cfe3ff', 'stroke-width': 2 }, s);
        S('text', { x: ex + 60, y: ey + R + 28, fill: '#cfe3ff', 'font-size': 13 }, s, 'spins');
        var c = M.cos(a); if (!o.quiet) out.textContent = 'The red dot is you: ' + (M.abs(c) < .2 ? (M.sin(a) > 0 ? 'sunset' : 'sunrise') : c < 0 ? 'day' : 'night') + '.';
      } else if (mode === 'phases') {
        if (o.one !== undefined) { s = svg(w, 200, 200, 'The Moon as seen from Earth'); w.insertBefore(s, out); S('rect', { x: 0, y: 0, width: 200, height: 200, rx: 12, fill: '#0f1830' }, s); moonFace(s, 100, 100, 70, o.one); return; }
        s = svg(w, 640, 600, 'The Moon going around the Earth, and how it looks from Earth'); w.insertBefore(s, out);
        S('rect', { x: 0, y: 0, width: 640, height: 600, rx: 12, fill: '#0f1830' }, s);
        for (var r2 = 0; r2 < 4; r2++) arrow(s, 10, 220 + r2 * 50, 60, 220 + r2 * 50, '', '#ffe066');
        S('text', { x: 14, y: 200, fill: '#ffe066', 'font-size': 13 }, s, 'sunlight');
        var cx = 330, cy = 300, RR = 170;
        S('circle', { cx: cx, cy: cy, r: 34, fill: '#3d84c6' }, s); S('path', { d: 'M' + cx + ' ' + (cy - 34) + 'A34 34 0 0 0 ' + cx + ' ' + (cy + 34) + 'Z', fill: '#7fbff0' }, s);
        S('circle', { cx: cx, cy: cy, r: RR, fill: 'none', stroke: '#55607a', 'stroke-dasharray': '4 6' }, s);
        for (var i = 0; i < 8; i++) {
          var an = M.PI + i * M.PI / 4, mx = cx + RR * M.cos(an), my = cy - RR * M.sin(an); // new moon on the Sun's side; counterclockwise seen from the north
          S('circle', { cx: mx, cy: my, r: 16, fill: '#3a3f4a' }, s);
          S('path', { d: 'M' + mx + ' ' + (my - 16) + 'A16 16 0 0 0 ' + mx + ' ' + (my + 16) + 'Z', fill: '#f4f1e1' }, s);
          var fx = cx + (RR + 62) * M.cos(an), fy = cy - (RR + 62) * M.sin(an);
          moonFace(s, fx, fy, 18, i);
          var lab = o.ask === i ? '?' : o.letters ? letter(i) : o.quiet ? '' : PH[i];
          if (lab) S('text', { x: fx, y: fy + 34, 'text-anchor': 'middle', 'font-size': 12, fill: '#dbe7ff' }, s, lab);
        }
      } else {
        s = svg(w, 700, 200, 'The Sun and the eight planets'); w.insertBefore(s, out); s.style.overflow = 'hidden';
        S('rect', { x: 0, y: 0, width: 700, height: 200, rx: 12, fill: '#0f1830' }, s);
        S('circle', { cx: -40, cy: 100, r: 110, fill: '#ffd43b' }, s);
        var x = 90;
        PL.forEach(function (p, i) {
          x += (i ? PL[i - 1][1] : 0) + p[1] + 18;
          S('circle', { cx: x, cy: 96, r: p[1], fill: p[2] }, s);
          if (p[0] === 'Saturn') S('ellipse', { cx: x, cy: 96, rx: p[1] * 1.7, ry: p[1] * .45, fill: 'none', stroke: '#e9cf8f', 'stroke-width': 3 }, s);
          var lab = o.ask === i ? '?' : o.letters ? letter(i) : o.quiet ? String(i + 1) : p[0];
          S('text', { x: x, y: 160 + (i % 2) * 18, 'text-anchor': 'middle', 'font-size': 13, fill: '#dbe7ff', 'font-weight': o.ask === i ? 700 : 400 }, s, lab);
        });
        S('text', { x: 10, y: 190, 'font-size': 11, fill: '#9fb0cf' }, s, 'Sizes and distances not to scale');
      }
    }
    draw();
    if (mode === 'daynight' && o.slider && live(o)) { var ctl = H('div', 'sx-ctl', w); V.slider(ctl, { label: 'Turn the Earth (hours)', min: 0, max: 23, step: 1, value: turn, fmt: function (v) { return v + ' h'; }, input: function (v) { turn = v; draw(); } }); }
  });

  /* ---------------- sciexp-plant ---------------- */
  V.register('sciexp-plant', function (el, o) {
    var w = wrap(el, o), s = svg(w, 560, 420, 'A plant making its food');
    S('rect', { x: 0, y: 300, width: 560, height: 120, fill: 'var(--sx-gnd)' }, s);
    S('circle', { cx: 60, cy: 60, r: 34, fill: 'var(--sx-glow)', stroke: 'var(--sx-gold)', 'stroke-width': 2 }, s);
    ['M280 300Q270 340 250 380', 'M280 300Q290 345 320 390', 'M280 300Q260 320 220 340', 'M280 300Q300 320 340 336'].forEach(function (d) { S('path', { d: d, fill: 'none', stroke: '#8a6a3a', 'stroke-width': 4 }, s); });
    S('path', { d: 'M280 300L280 110', stroke: 'var(--sx-leaf)', 'stroke-width': 8 }, s);
    S('path', { d: 'M280 220Q220 190 190 220Q230 250 280 220Z', fill: 'var(--sx-leaf)' }, s); S('path', { d: 'M280 180Q340 150 370 180Q330 210 280 180Z', fill: 'var(--sx-leaf)' }, s);
    for (var p = 0; p < 6; p++) S('ellipse', { cx: 280 + 22 * M.cos(p * M.PI / 3), cy: 100 + 22 * M.sin(p * M.PI / 3), rx: 16, ry: 10, transform: 'rotate(' + (p * 60) + ' ' + (280 + 22 * M.cos(p * M.PI / 3)) + ' ' + (100 + 22 * M.sin(p * M.PI / 3)) + ')', fill: '#f783ac' }, s);
    S('circle', { cx: 280, cy: 100, r: 12, fill: '#ffd43b' }, s);
    var parts = { flower: [280, 100, 400, 70, 'Flower'], leaves: [205, 218, 90, 250, 'Leaf'], stem: [280, 260, 400, 260, 'Stem'], roots: [255, 370, 120, 390, 'Roots'] };
    Object.keys(parts).forEach(function (k, i) { var q = parts[k]; S('line', { x1: q[0], y1: q[1], x2: q[2] + (q[2] < 280 ? 40 : -40), y2: q[3] - 5, stroke: 'var(--sx-mut)', 'stroke-width': 1.5 }, s); txt(s, q[2], q[3], o.ask === k ? '?' : o.letters ? letter(i) : q[4], { 'font-size': 15, 'font-weight': 700 }); });
    if (o.arrows !== false) {
      arrow(s, 95, 90, 185, 190, '', 'var(--sx-gold)'); txt(s, 120, 160, 'sunlight', { 'font-size': 13 });
      arrow(s, 470, 150, 372, 178, '', 'var(--sx-blue)'); txt(s, 480, 140, 'carbon dioxide in', { 'font-size': 13 });
      arrow(s, 372, 196, 470, 220, '', 'var(--sx-leaf)'); txt(s, 486, 238, 'oxygen out', { 'font-size': 13 });
      arrow(s, 300, 330, 300, 240, '', 'var(--sx-watd)'); txt(s, 360, 330, 'water up', { 'font-size': 13 });
      txt(s, 160, 290, 'sugar is made in the leaves', { 'font-size': 13, 'font-style': 'italic' });
    }
  });
})(window, document);
