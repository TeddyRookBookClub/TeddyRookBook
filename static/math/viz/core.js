/* Math Ladder: the toolkit every interactive visual is built on (window.MathLadder.viz).

   Embed a visual anywhere with   <div class="ml-viz" data-viz="NAME" data-opts='{"a":1}' aria-label="…"></div>
   and it mounts on page load (or call MathLadder.viz.mountAll(root) after adding one later).

   register(name, factory)   factory(el, opts, V) builds the visual inside el and may return {update(opts), destroy()}.
   mount(el) / mountAll(root)
   canvas(el, o)             a crisp canvas that keeps its size: o.height (px) or o.aspect (w/h, default 16/10), o.max (max height)
                             returns {cv, ctx, w, h, dpr, fit(), onResize(fn)}; the context is scaled so 1 unit = 1 CSS px
   plane(c, o)               math coordinates on a canvas c: o = {xmin, xmax, ymin, ymax, equal (same scale on both axes)}
                             returns {X(x), Y(y), x(px), y(py), unit, grid(o), axes(o), plot(f, o), param(fx, fy, t0, t1, o),
                             point(x, y, o), seg(x1, y1, x2, y2, o), arrow(x1, y1, x2, y2, o), poly(pts, o), text(s, x, y, o),
                             circle(x, y, r, o), shade(f, g, a, b, o), clear(), set(o)}
   colors()                  the palette for the current light or dark theme: bg, panel, ink, muted, grid, axis, and
                             green, blue, red, gold, purple, orange, pink, teal (plus *Soft fills)
   onTheme(fn)               fn() when the site theme changes
   drag(cv, o)               pointer dragging with mouse, touch and pen: o = {hit(px, py) -> handle or null, move(handle, px, py, e),
                             start(handle), end(handle)}; also sets the cursor
   slider(parent, o)         a labeled range input: o = {label, min, max, step, value, fmt(v), input(v)}; returns {el, input, get(), set(v)}
   seg(parent, o)            a segmented button group: o = {label, items: [[value, text], ...], value, change(v)}; returns {el, get(), set(v)}
   button(parent, text, fn, cls)
   readout(parent)           a live text line (aria-live) with .set(html)
   loop(el, fn)              fn(dt) every frame while el is on screen and the tab is visible; returns {start(), stop(), running()}
   reduced                   true if the visitor prefers less motion
   fmt(v, d)                 a number with up to d decimals (default 2), trailing zeros dropped, real minus sign
   uid(prefix)               a unique id for aria wiring
   Every visual in basic.js and adv.js also takes quiet: true (or readout: false): no live readout that could state a
   problem's answer (use it when a visual is part of a problem). See each file's header.                                 */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var reg = {}, M = Math, n = 0;
  var reduced = false; try { reduced = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }

  function dark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  var LIGHT = { bg: '#ffffff', panel: '#fbf8f0', ink: '#1d2320', muted: '#5d6862', grid: '#e4ebe6', grid2: '#f1f5f2', axis: '#56625b', green: '#00703c', blue: '#1c6fd6', red: '#d6336c', gold: '#b8860b', purple: '#7048e8', orange: '#e8590c', pink: '#c2255c', teal: '#0c8599' };
  var DARK = { bg: '#14211a', panel: '#1b2b22', ink: '#e6ece8', muted: '#a9b8af', grid: '#2a3d32', grid2: '#1f3027', axis: '#a9b8af', green: '#6cc79a', blue: '#74c0fc', red: '#ff8787', gold: '#ffd479', purple: '#b197fc', orange: '#ffa94d', pink: '#f783ac', teal: '#66d9e8' };
  function soft(hex, a) { var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function colors() {
    var c = Object.assign({}, dark() ? DARK : LIGHT);
    ['green', 'blue', 'red', 'gold', 'purple', 'orange', 'pink', 'teal'].forEach(function (k) { c[k + 'Soft'] = soft(c[k], dark() ? 0.28 : 0.18); });
    return c;
  }
  var themeFns = [];
  function onTheme(fn) { themeFns.push(fn); }
  try { new MutationObserver(function () { themeFns.forEach(function (f) { try { f(); } catch (e) { } }); }).observe(D.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); } catch (e) { }

  function fmt(v, d) {
    if (!isFinite(v)) return v > 0 ? '∞' : v < 0 ? '−∞' : '—';
    var s = (+v).toFixed(d === undefined ? 2 : d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '-0') s = '0'; return s.replace('-', '−');
  }
  function uid(p) { return (p || 'mlv') + '-' + (++n); }

  function canvas(el, o) {
    o = o || {};
    var cv = D.createElement('canvas'); cv.className = 'ml-cv'; el.appendChild(cv);
    var ctx = cv.getContext('2d'), fns = [], obj = { cv: cv, ctx: ctx, w: 300, h: 200, dpr: 1 };
    obj.fit = function () {
      var w = M.max(120, el.clientWidth || 300), h = o.height || M.round(w / (o.aspect || 1.6));
      if (o.max) h = M.min(h, o.max); if (o.min) h = M.max(h, o.min);
      var dpr = M.min(2, W.devicePixelRatio || 1);
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      if (cv.width !== M.round(w * dpr) || cv.height !== M.round(h * dpr)) { cv.width = M.round(w * dpr); cv.height = M.round(h * dpr); }
      obj.w = w; obj.h = h; obj.dpr = dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); return obj;
    };
    obj.onResize = function (fn) { fns.push(fn); };
    var last = 0;
    function rs() { var w = el.clientWidth; if (w && w !== last) { last = w; obj.fit(); fns.forEach(function (f) { f(); }); } }
    if ('ResizeObserver' in W) new ResizeObserver(rs).observe(el); else W.addEventListener('resize', rs);
    obj.fit(); last = el.clientWidth;
    return obj;
  }

  function plane(c, o) {
    var P = { o: Object.assign({ xmin: -10, xmax: 10, ymin: -10, ymax: 10, equal: false, pad: 0 }, o || {}) };
    var sx, sy, ox, oy;
    function calc() {
      var q = P.o, w = c.w - 2 * q.pad, h = c.h - 2 * q.pad;
      sx = w / (q.xmax - q.xmin); sy = h / (q.ymax - q.ymin);
      if (q.equal) { var s = M.min(sx, sy); sx = sy = s; }
      var cx = (q.xmin + q.xmax) / 2, cy = (q.ymin + q.ymax) / 2;
      ox = c.w / 2 - cx * sx; oy = c.h / 2 + cy * sy; P.unit = sx;
    }
    P.X = function (x) { return ox + x * sx; }; P.Y = function (y) { return oy - y * sy; };
    P.x = function (px) { return (px - ox) / sx; }; P.y = function (py) { return (oy - py) / sy; };
    P.view = function () { return { xmin: P.x(0), xmax: P.x(c.w), ymin: P.y(c.h), ymax: P.y(0) }; };
    P.set = function (q) { Object.assign(P.o, q); calc(); return P; };
    P.clear = function (bg) { var k = colors(); c.ctx.save(); c.ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); c.ctx.fillStyle = bg || k.bg; c.ctx.fillRect(0, 0, c.w, c.h); c.ctx.restore(); return P; };
    function step(span, px) { var raw = span / M.max(2, px / 60), m = M.pow(10, M.floor(M.log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m; }
    P.grid = function (q) {
      q = q || {}; var k = colors(), ctx = c.ctx, v = P.view(), dx = q.step || step(v.xmax - v.xmin, c.w), dy = q.stepY || q.step || step(v.ymax - v.ymin, c.h);
      ctx.save(); ctx.lineWidth = 1;
      if (q.minor !== false) { ctx.strokeStyle = k.grid2; ctx.beginPath(); var mdx = dx / 5, mdy = dy / 5; if (c.w / ((v.xmax - v.xmin) / mdx) > 6) { for (var x = M.ceil(v.xmin / mdx) * mdx; x <= v.xmax; x += mdx) { ctx.moveTo(M.round(P.X(x)) + 0.5, 0); ctx.lineTo(M.round(P.X(x)) + 0.5, c.h); } for (var y = M.ceil(v.ymin / mdy) * mdy; y <= v.ymax; y += mdy) { ctx.moveTo(0, M.round(P.Y(y)) + 0.5); ctx.lineTo(c.w, M.round(P.Y(y)) + 0.5); } } ctx.stroke(); }
      ctx.strokeStyle = k.grid; ctx.beginPath();
      for (x = M.ceil(v.xmin / dx) * dx; x <= v.xmax + 1e-9; x += dx) { ctx.moveTo(M.round(P.X(x)) + 0.5, 0); ctx.lineTo(M.round(P.X(x)) + 0.5, c.h); }
      for (y = M.ceil(v.ymin / dy) * dy; y <= v.ymax + 1e-9; y += dy) { ctx.moveTo(0, M.round(P.Y(y)) + 0.5); ctx.lineTo(c.w, M.round(P.Y(y)) + 0.5); }
      ctx.stroke(); ctx.restore(); P._dx = dx; P._dy = dy; return P;
    };
    P.axes = function (q) {
      q = q || {}; var k = colors(), ctx = c.ctx, v = P.view(), dx = q.step || P._dx || step(v.xmax - v.xmin, c.w), dy = q.stepY || q.step || P._dy || step(v.ymax - v.ymin, c.h);
      var ax = M.min(M.max(P.Y(0), 0), c.h), ay = M.min(M.max(P.X(0), 0), c.w);
      ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, ax); ctx.lineTo(c.w, ax); ctx.moveTo(ay, 0); ctx.lineTo(ay, c.h); ctx.stroke();
      if (q.labels !== false) {
        ctx.fillStyle = k.muted; ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        for (var x = M.ceil(v.xmin / dx) * dx; x <= v.xmax + 1e-9; x += dx) { if (M.abs(x) < dx / 2) continue; var px = P.X(x); if (px < 10 || px > c.w - 10) continue; ctx.fillText(fmt(x, 6), px, M.min(ax + 4, c.h - 16)); }
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (var y = M.ceil(v.ymin / dy) * dy; y <= v.ymax + 1e-9; y += dy) { if (M.abs(y) < dy / 2) continue; var py = P.Y(y); if (py < 8 || py > c.h - 8) continue; ctx.fillText(fmt(y, 6), M.max(ay - 5, 28), py); }
        if (q.x) { ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.font = 'italic 14px Georgia,serif'; ctx.fillText(q.x, c.w - 6, ax - 4); }
        if (q.y) { ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = 'italic 14px Georgia,serif'; ctx.fillText(q.y, ay + 6, 4); }
      }
      ctx.restore(); return P;
    };
    function style(ctx, q, def) { var k = colors(); ctx.strokeStyle = q.color ? (k[q.color] || q.color) : def || k.blue; ctx.lineWidth = q.width || 2.5; ctx.setLineDash(q.dash || []); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; }
    P.plot = function (f, q) { // breaks the curve at jumps and outside the view
      q = q || {}; var ctx = c.ctx, v = P.view(), a = q.from !== undefined ? M.max(q.from, v.xmin) : v.xmin, b = q.to !== undefined ? M.min(q.to, v.xmax) : v.xmax;
      var N = M.max(200, M.round(c.w * 1.5)), h = (b - a) / N, pen = false, lastY = null, span = v.ymax - v.ymin;
      ctx.save(); style(ctx, q); ctx.beginPath();
      for (var i = 0; i <= N; i++) {
        var x = a + i * h, y; try { y = f(x); } catch (e) { y = NaN; }
        if (!isFinite(y) || (lastY !== null && M.abs(y - lastY) > span * 2)) { pen = false; lastY = isFinite(y) ? y : null; continue; }
        var py = M.max(-1e4, M.min(1e4, P.Y(y)));
        if (pen) ctx.lineTo(P.X(x), py); else { ctx.moveTo(P.X(x), py); pen = true; }
        lastY = y;
      }
      ctx.stroke(); ctx.restore(); return P;
    };
    P.param = function (fx, fy, t0, t1, q) { q = q || {}; var ctx = c.ctx, N = q.n || 400; ctx.save(); style(ctx, q); ctx.beginPath(); for (var i = 0; i <= N; i++) { var t = t0 + (t1 - t0) * i / N, px = P.X(fx(t)), py = P.Y(fy(t)); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke(); ctx.restore(); return P; };
    P.seg = function (x1, y1, x2, y2, q) { q = q || {}; var ctx = c.ctx; ctx.save(); style(ctx, q, colors().ink); ctx.beginPath(); ctx.moveTo(P.X(x1), P.Y(y1)); ctx.lineTo(P.X(x2), P.Y(y2)); ctx.stroke(); ctx.restore(); return P; };
    P.arrow = function (x1, y1, x2, y2, q) {
      q = q || {}; var ctx = c.ctx, a = P.X(x1), b = P.Y(y1), e = P.X(x2), f = P.Y(y2), ang = M.atan2(f - b, e - a), L = M.hypot(e - a, f - b), hs = M.min(q.head || 10, L * 0.5);
      ctx.save(); style(ctx, q, colors().ink); ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(e - hs * 0.6 * M.cos(ang), f - hs * 0.6 * M.sin(ang)); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.moveTo(e, f); ctx.lineTo(e - hs * M.cos(ang - 0.4), f - hs * M.sin(ang - 0.4)); ctx.lineTo(e - hs * M.cos(ang + 0.4), f - hs * M.sin(ang + 0.4)); ctx.closePath(); ctx.fill(); ctx.restore(); return P;
    };
    P.point = function (x, y, q) { q = q || {}; var k = colors(), ctx = c.ctx; ctx.save(); ctx.fillStyle = q.color ? (k[q.color] || q.color) : k.red; ctx.beginPath(); ctx.arc(P.X(x), P.Y(y), q.r || 5, 0, 2 * M.PI); if (q.hollow) { ctx.lineWidth = 2.5; ctx.strokeStyle = ctx.fillStyle; ctx.fillStyle = k.bg; ctx.fill(); ctx.stroke(); } else ctx.fill(); ctx.restore(); return P; };
    P.circle = function (x, y, r, q) { q = q || {}; var ctx = c.ctx, k = colors(); ctx.save(); style(ctx, q, k.ink); ctx.beginPath(); ctx.ellipse(P.X(x), P.Y(y), M.abs(r * sx), M.abs(r * sy), 0, 0, 2 * M.PI); if (q.fill) { ctx.fillStyle = k[q.fill] || q.fill; ctx.fill(); } if (q.stroke !== false) ctx.stroke(); ctx.restore(); return P; };
    P.poly = function (pts, q) { q = q || {}; var ctx = c.ctx, k = colors(); ctx.save(); style(ctx, q, k.ink); ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(P.X(p[0]), P.Y(p[1])); else ctx.moveTo(P.X(p[0]), P.Y(p[1])); }); if (q.close !== false) ctx.closePath(); if (q.fill) { ctx.fillStyle = k[q.fill] || q.fill; ctx.fill(); } if (q.stroke !== false) ctx.stroke(); ctx.restore(); return P; };
    P.shade = function (f, g, a, b, q) { q = q || {}; var ctx = c.ctx, k = colors(), N = 200; ctx.save(); ctx.fillStyle = q.fill ? (k[q.fill] || q.fill) : k.blueSoft; ctx.beginPath(); for (var i = 0; i <= N; i++) { var x = a + (b - a) * i / N; ctx[i ? 'lineTo' : 'moveTo'](P.X(x), P.Y(f(x))); } for (i = N; i >= 0; i--) { x = a + (b - a) * i / N; ctx.lineTo(P.X(x), P.Y(g ? g(x) : 0)); } ctx.closePath(); ctx.fill(); ctx.restore(); return P; };
    P.text = function (s, x, y, q) { q = q || {}; var ctx = c.ctx, k = colors(); ctx.save(); ctx.fillStyle = q.color ? (k[q.color] || q.color) : k.ink; ctx.font = q.font || (q.italic ? 'italic ' : '') + (q.bold ? '700 ' : '') + (q.size || 14) + 'px ' + (q.serif || q.italic ? 'Georgia,serif' : 'system-ui,sans-serif'); ctx.textAlign = q.align || 'left'; ctx.textBaseline = q.base || 'middle'; ctx.fillText(s, P.X(x) + (q.dx || 0), P.Y(y) + (q.dy || 0)); ctx.restore(); return P; };
    calc(); c.onResize(calc);
    return P;
  }

  function drag(cv, o) {
    var active = null, id = null;
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.style.touchAction = o.touchAction || 'none';
    cv.addEventListener('pointerdown', function (e) {
      var p = pos(e), h = o.hit(p[0], p[1]); if (h == null) return;
      active = h; id = e.pointerId; try { cv.setPointerCapture(id); } catch (er) { }
      if (o.start) o.start(h, p[0], p[1], e); e.preventDefault();
    });
    cv.addEventListener('pointermove', function (e) {
      var p = pos(e);
      if (active == null) { cv.style.cursor = o.hit(p[0], p[1]) != null ? 'grab' : ''; return; }
      if (e.pointerId !== id) return; cv.style.cursor = 'grabbing'; o.move(active, p[0], p[1], e);
    });
    function up(e) { if (active == null || e.pointerId !== id) return; var h = active; active = null; cv.style.cursor = ''; if (o.end) o.end(h, e); }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  }

  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function slider(parent, o) {
    var w = el('label', 'ml-sl'), top = el('span', 'ml-sl-top'), lab = el('span', 'ml-sl-lab', o.label || ''), out = el('output', 'ml-sl-val');
    var inp = D.createElement('input'); inp.type = 'range'; inp.min = o.min; inp.max = o.max; inp.step = o.step || 'any'; inp.value = o.value;
    top.appendChild(lab); top.appendChild(out); w.appendChild(top); w.appendChild(inp); parent.appendChild(w);
    function show() { out.textContent = o.fmt ? o.fmt(+inp.value) : fmt(+inp.value); }
    inp.addEventListener('input', function () { show(); if (o.input) o.input(+inp.value); }); show();
    return { el: w, input: inp, get: function () { return +inp.value; }, set: function (v) { inp.value = v; show(); } };
  }
  function seg(parent, o) {
    var w = el('div', 'ml-seg'); w.setAttribute('role', 'group'); if (o.label) w.setAttribute('aria-label', o.label);
    var cur = o.value, btns = [];
    o.items.forEach(function (it) { var b = el('button', '', it[1]); b.type = 'button'; b.dataset.v = it[0]; b.addEventListener('click', function () { set(it[0]); if (o.change) o.change(it[0]); }); btns.push(b); w.appendChild(b); });
    function set(v) { cur = v; btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === String(v))); }); }
    set(cur); parent.appendChild(w); return { el: w, get: function () { return cur; }, set: set };
  }
  function button(parent, text, fn, cls) { var b = el('button', 'ml-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; b.addEventListener('click', fn); parent.appendChild(b); return b; }
  function readout(parent) { var p = el('p', 'ml-readout'); p.setAttribute('aria-live', 'polite'); parent.appendChild(p); return { el: p, set: function (h) { p.innerHTML = h; if (ML.typeset) ML.typeset(p); } }; }
  function loop(elm, fn) {
    var on = true, vis = true, raf = 0, last = 0;
    function frame(t) { raf = 0; if (!on || !vis || D.hidden) { last = 0; return; } var dt = last ? M.min(0.05, (t - last) / 1000) : 0; last = t; try { fn(dt); } catch (e) { if (W.console) W.console.error(e); } raf = W.requestAnimationFrame(frame); }
    function kick() { if (!raf && on && vis && !D.hidden) { last = 0; raf = W.requestAnimationFrame(frame); } }
    if ('IntersectionObserver' in W) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(elm);
    D.addEventListener('visibilitychange', kick); kick();
    return { start: function () { on = true; kick(); }, stop: function () { on = false; }, running: function () { return on; } };
  }

  function register(name, factory) { reg[name] = factory; D.querySelectorAll('.ml-viz[data-viz="' + name + '"]:not([data-mounted])').forEach(mount); }
  function mount(e) {
    if (e.dataset.mounted) return; var f = reg[e.dataset.viz]; if (!f) return;
    var opts = {}; try { opts = JSON.parse(e.dataset.opts || '{}'); } catch (er) { if (W.console) W.console.warn('ml-viz: bad data-opts', e); }
    e.dataset.mounted = '1'; e.classList.add('ml-viz-on');
    try { e._ml = f(e, opts, V) || {}; } catch (er) { if (W.console) W.console.error('ml-viz ' + e.dataset.viz, er); e.insertAdjacentHTML('beforeend', '<p class="ml-viz-err">This picture could not be drawn.</p>'); }
  }
  function mountAll(root) { (root || D).querySelectorAll('.ml-viz:not([data-mounted])').forEach(mount); }

  var V = { register: register, mount: mount, mountAll: mountAll, canvas: canvas, plane: plane, colors: colors, onTheme: onTheme, drag: drag, slider: slider, seg: seg, button: button, readout: readout, loop: loop, reduced: reduced, fmt: fmt, uid: uid, el: el, names: function () { return Object.keys(reg); } };
  ML.viz = V;
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', function () { mountAll(); }); else mountAll();
})(window, document);
