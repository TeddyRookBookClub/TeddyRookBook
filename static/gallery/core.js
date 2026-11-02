/* Math Gallery helper (/math/gallery/). A piece (static/gallery/pieces/<slug>.js) calls Gallery.piece('<slug>', fn(g))
   and draws in g.stage, controls in g.bar. Gives: canvas sizing, theme colors, a play/pause/step loop that runs only on
   screen (reduced motion: starts paused), control builders, dragging, seeded random, live region; the hub's tag filter. */
(function (W, D) {
  'use strict';
  var G = W.Gallery = W.Gallery || {}, M = Math, reg = {};
  function dark() { var t = D.documentElement.getAttribute('data-theme'); if (t === 'dark') return true; if (t === 'light') return false; try { return W.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; } }
  function reduced() { try { return W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  var LIGHT = { bg: '#ffffff', panel: '#f6f8f5', ink: '#1d2320', muted: '#5d6862', grid: '#e1e8e3', axis: '#56625b', green: '#00562f', accent: '#00562f', gold: '#9a7a2c', blue: '#1c63c0', red: '#c92a52', purple: '#6a45d8', orange: '#d1520a', teal: '#0b7a8a' };
  var DARK = { bg: '#121c16', panel: '#1a2820', ink: '#e6ece8', muted: '#a9b8af', grid: '#2a3d32', axis: '#a9b8af', green: '#6cc79a', accent: '#6cc79a', gold: '#e2c072', blue: '#74b4fc', red: '#ff8b9a', purple: '#b6a0ff', orange: '#ffa94d', teal: '#66d9e8' };
  function rgba(hex, a) { var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function colors() { var s = dark() ? DARK : LIGHT, c = {}, k; for (k in s) c[k] = s[k]; c.dark = dark(); c.a = rgba; return c; }
  G.colors = colors; G.dark = dark; G.reduced = reduced; G.rgba = rgba;
  G.rng = function (seed) { var a = (seed >>> 0) || 1; return function () { a = (a + 0x6D2B79F5) | 0; var t = M.imul(a ^ (a >>> 15), 1 | a); t = (t + M.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  G.fmt = function (x, d) { return Number(x).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
  function el(tag, cls, txt) { var e = D.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  G.el = el;
  var themeFns = [];
  try { new MutationObserver(function () { themeFns.forEach(function (f) { try { f(); } catch (e) { warn(e); } }); }).observe(D.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); } catch (e) { }
  function warn(e) { try { console.warn('[gallery]', e && e.message ? e.message : e); } catch (x) { } }
  var uid = 0;

  function make(host) {
    var g = { el: host, stage: host.querySelector('.gx-stage'), bar: host.querySelector('.gx-bar'), live: host.querySelector('.gx-live'),
      reduced: reduced(), visible: true, colors: colors, dark: dark, rng: G.rng, fmt: G.fmt, el: el };
    var drawFn = null, raf = 0, cans = [], loops = [];
    g.draw = function (fn) { drawFn = fn; g.redraw(); };
    g.redraw = function () { if (raf || !drawFn) return; raf = W.requestAnimationFrame(function () { raf = 0; try { drawFn(colors()); } catch (e) { warn(e); } }); };
    g.onTheme = function (fn) { themeFns.push(fn); };
    themeFns.push(function () { g.redraw(); });
    g.say = function (t) { if (g.live) g.live.textContent = t; };

    // canvas: o.aspect (h/w), o.max, o.min (CSS px), o.label, o.hd (false: 1x pixels), o.parent
    g.canvas = function (o) {
      o = o || {};
      var c = { el: el('canvas', 'gx-cv'), w: 0, h: 0, dpr: 1, onresize: null };
      c.ctx = c.el.getContext('2d');
      c.el.setAttribute('role', 'img'); if (o.label) c.el.setAttribute('aria-label', o.label);
      (o.parent || g.stage).appendChild(c.el);
      c.fit = function () {
        var w = c.el.parentNode.clientWidth || 300, h = M.round(w * (o.aspect || 0.62));
        if (o.max) h = M.min(h, o.max); if (o.min) h = M.max(h, o.min);
        var d = M.min(W.devicePixelRatio || 1, o.hd === false ? 1 : 2);
        if (w === c.w && h === c.h && d === c.dpr) return false;
        c.w = w; c.h = h; c.dpr = d;
        c.el.style.height = h + 'px'; c.el.width = M.round(w * d); c.el.height = M.round(h * d);
        c.ctx.setTransform(d, 0, 0, d, 0, 0);
        if (c.onresize) c.onresize(c);
        return true;
      };
      c.clear = function (col) { var x = c.ctx; x.save(); x.setTransform(1, 0, 0, 1, 0, 0); if (col) { x.fillStyle = col; x.fillRect(0, 0, c.el.width, c.el.height); } else x.clearRect(0, 0, c.el.width, c.el.height); x.restore(); };
      c.fit(); cans.push(c);
      return c;
    };
    var rt = 0;
    function onResize() { clearTimeout(rt); rt = setTimeout(function () { var ch = false; cans.forEach(function (c) { if (c.fit()) ch = true; }); if (ch) g.redraw(); }, 120); }
    W.addEventListener('resize', onResize);

    // controls
    function lab(text, ctl) { var l = el('label', 'gx-field'); l.appendChild(el('span', 'gx-lbl', text)); l.appendChild(ctl); return l; }
    g.group = function (cls) { var d = el('div', 'gx-row' + (cls ? ' ' + cls : '')); g.bar.appendChild(d); return d; };
    function into(o) { return (o && o.parent) || g.bar; }
    g.button = function (text, fn, o) { var b = el('button', 'gx-btn' + (o && o.pri ? ' pri' : ''), text); b.type = 'button'; b.addEventListener('click', function (e) { fn(e, b); }); into(o).appendChild(b); return b; };
    g.slider = function (o) {
      var i = el('input'), out = el('output', 'gx-val'); i.type = 'range'; i.min = o.min; i.max = o.max; i.step = o.step || 1; i.value = o.value;
      i.id = 'gx-i' + (++uid);
      var f = lab(o.label, i); f.className += ' gx-range'; f.appendChild(out);
      var show = function () { out.textContent = o.fmt ? o.fmt(+i.value) : i.value; };
      i.addEventListener('input', function () { show(); if (o.input) o.input(+i.value); });
      show(); into(o).appendChild(f);
      return { el: f, input: i, value: function () { return +i.value; }, set: function (v) { i.value = v; show(); } };
    };
    g.select = function (o) {
      var s = el('select'); (o.options || []).forEach(function (p) { var op = el('option', null, p[1]); op.value = p[0]; s.appendChild(op); });
      if (o.value != null) s.value = o.value; s.addEventListener('change', function () { if (o.change) o.change(s.value); });
      into(o).appendChild(lab(o.label, s)); return s;
    };
    g.toggle = function (text, on, fn, o) { var i = el('input'); i.type = 'checkbox'; i.checked = !!on; i.addEventListener('change', function () { fn(i.checked); }); var l = el('label', 'gx-chk'); l.appendChild(i); l.appendChild(el('span', null, text)); into(o).appendChild(l); return i; };
    g.out = function (cls, o) { var s = el('p', 'gx-out' + (cls ? ' ' + cls : '')); ((o && o.parent) || host.querySelector('.gx-stats') || g.bar).appendChild(s); return s; };

    // loop: step(dt, t) per frame while playing and visible (return false stops). o.auto, o.stepSize, o.stepText, o.parent
    g.loop = function (step, o) {
      o = o || {};
      var L = { on: false, id: 0, last: 0, t: 0 }, row = into(o);
      var pb = el('button', 'gx-btn pri gx-play'); pb.type = 'button';
      var sb = el('button', 'gx-btn gx-step', o.stepText || 'Step'); sb.type = 'button';
      row.appendChild(pb); row.appendChild(sb);
      function label() { pb.textContent = L.on ? '❚❚ Pause' : '▶ Play'; pb.setAttribute('aria-pressed', L.on ? 'true' : 'false'); }
      function frame(ts) {
        L.id = 0; if (!L.on || !g.visible || D.hidden) return;
        var dt = L.last ? M.min(0.05, (ts - L.last) / 1000) : 1 / 60; L.last = ts; L.t += dt;
        var r; try { r = step(dt, L.t); } catch (e) { warn(e); r = false; }
        if (r === false) { L.on = false; label(); return; }
        L.id = W.requestAnimationFrame(frame);
      }
      function kick() { if (L.on && !L.id && g.visible && !D.hidden) { L.last = 0; L.id = W.requestAnimationFrame(frame); } }
      var api = {
        play: function () { L.on = true; label(); kick(); }, pause: function () { L.on = false; label(); if (L.id) { W.cancelAnimationFrame(L.id); L.id = 0; } },
        toggle: function () { if (L.on) api.pause(); else api.play(); }, playing: function () { return L.on; },
        stepOnce: function () { api.pause(); var d = o.stepSize || 1 / 30; L.t += d; try { step(d, L.t); } catch (e) { warn(e); } },
        kick: kick
      };
      pb.addEventListener('click', api.toggle); sb.addEventListener('click', api.stepOnce);
      loops.push(api); label();
      if (o.auto !== false && !g.reduced) api.play();
      return api;
    };
    D.addEventListener('visibilitychange', function () { if (!D.hidden) loops.forEach(function (l) { l.kick(); }); });
    try {
      new IntersectionObserver(function (es) { es.forEach(function (e) { g.visible = e.isIntersecting; if (g.visible) loops.forEach(function (l) { l.kick(); }); }); }, { rootMargin: '60px' }).observe(host);
    } catch (e) { }

    // pointer dragging on an element: fns.down/move/up(x, y, e) in CSS px relative to the element
    g.drag = function (t, fns) {
      var on = false; t.style.touchAction = fns.touch || 'none';
      function pos(e) { var r = t.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
      t.addEventListener('pointerdown', function (e) { on = true; try { t.setPointerCapture(e.pointerId); } catch (x) { } var p = pos(e); if (fns.down) fns.down(p[0], p[1], e); });
      t.addEventListener('pointermove', function (e) { var p = pos(e); if (on && fns.move) fns.move(p[0], p[1], e); else if (fns.hover) fns.hover(p[0], p[1], e); });
      function end(e) { if (!on) return; on = false; var p = pos(e); if (fns.up) fns.up(p[0], p[1], e); }
      t.addEventListener('pointerup', end); t.addEventListener('pointercancel', end);
    };
    // keyboard on a focusable element: map of key -> fn(e); the element gets tabindex 0
    g.keys = function (t, map) {
      if (!t.hasAttribute('tabindex')) t.tabIndex = 0;
      t.addEventListener('keydown', function (e) { var f = map[e.key]; if (f) { e.preventDefault(); f(e); } });
    };
    return g;
  }

  function run(slug) {
    var fn = reg[slug]; if (!fn) return;
    var hosts = D.querySelectorAll('.gx-hero[data-piece="' + slug + '"]');
    for (var i = 0; i < hosts.length; i++) {
      var h = hosts[i]; if (h.getAttribute('data-ready')) continue; h.setAttribute('data-ready', '1');
      try { fn(make(h)); h.classList.add('gx-on'); } catch (e) { warn(e); var p = h.querySelector('.gx-stage'); if (p) p.appendChild(el('p', 'gx-err', 'The picture could not load. The explanation below does not depend on it.')); }
    }
  }
  G.piece = function (slug, fn) { reg[slug] = fn; if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', function () { run(slug); }); else run(slug); };

  // TeX: typeset the page body with the Math Ladder renderer (static/math/core/tex.js)
  function tex() { var m = W.MathLadder, r = D.querySelectorAll('[data-tex]'); if (!m || !m.typeset) return; for (var i = 0; i < r.length; i++) { try { m.typeset(r[i]); } catch (e) { warn(e); } } }

  // list page: tag filter buttons (.gx-filters [data-tag]) show/hide cards (.gx-card[data-tags]); remembers #tag=
  function filters() {
    var f = D.querySelector('.gx-filters'); if (!f) return;
    var bs = f.querySelectorAll('[data-tag]'), cards = D.querySelectorAll('.gx-card'), cnt = D.querySelector('.gx-count');
    function set(tag) {
      var n = 0;
      for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-tag') === tag ? 'true' : 'false');
      for (var j = 0; j < cards.length; j++) { var ok = !tag || (' ' + cards[j].getAttribute('data-tags') + ' ').indexOf(' ' + tag + ' ') >= 0; cards[j].hidden = !ok; if (ok) n++; }
      if (cnt) cnt.textContent = n + (n === 1 ? ' piece' : ' pieces') + (tag ? ' tagged ' + (f.querySelector('[data-tag="' + tag + '"]') || {}).textContent : '');
      try { history.replaceState(null, '', tag ? '#tag=' + tag : location.pathname); } catch (e) { }
    }
    for (var i = 0; i < bs.length; i++) bs[i].addEventListener('click', function () { set(this.getAttribute('data-tag')); });
    var m = /tag=([a-z-]+)/.exec(location.hash); set(m && f.querySelector('[data-tag="' + m[1] + '"]') ? m[1] : '');
  }
  function boot() { tex(); filters(); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})(window, document);
