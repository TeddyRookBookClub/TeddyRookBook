/* /connections/ helper (Where Music, Patterns, Math and Chemistry Meet). Only venA edits this file.
   1. The hub: the Venn diagram (hover, click or tap anywhere in a region; Tab to its pin, Enter), the side panel, the region
      list, open/close of each region section (#r-<id> in the address opens one), TeX typesetting of an opened region.
   2. Visuals: a figure <figure class="cx-viz" data-viz="<id>" data-src="…/v/<id>.js"> (written by [[viz:<id>]] in a region's
      markdown) loads its script only when its region is open and the figure is near the screen. The script calls
        Cx.viz('<id>', function (v) { … })
      once; the function runs for every figure with that id. v gives:
        v.el, v.stage, v.bar, v.id, v.colors() (theme palette: bg panel ink muted grid green gold blue red purple orange teal,
        music math patterns chemistry; .dark; .a(hex, alpha)), v.reduced (prefers reduced motion), v.rng(seed)
        v.canvas({aspect, max, min, label, hd}) -> {el, ctx, w, h, fit(), clear(col), onresize}; v.svg(viewBox, label)
        v.draw(fn(colors)) + v.redraw() (one frame on demand, redrawn on theme change and resize)
        v.loop(fn(dt, t), {label, auto}) -> {on, play(), pause(), btn}: runs only while visible; reduced motion starts paused
        v.button(text, fn, {pri, parent}), v.slider(text, min, max, step, value, fn, {fmt, parent}), v.select(text, [[value,
        label]], value, fn), v.toggle(text, on, fn), v.readout() -> element, v.say(text) (screen reader)
        v.onTheme(fn), v.onShow(fn(visible))
      Sound (Web Audio, created only inside a tap/click handler; respects the page volume and "Stop all sound"):
        Cx.audio() -> {ctx, out} or null; Cx.tone(freq, seconds, {type, gain, when, attack, release}) -> stop();
        Cx.stopAll(); Cx.onStop(fn) (called when the user stops all sound). */
(function (W, D) {
  'use strict';
  var Cx = W.Cx = W.Cx || {}, M = Math, reg = {}, loaded = {};
  function dark() { var t = D.documentElement.getAttribute('data-theme'); if (t === 'dark') return true; if (t === 'light') return false; try { return W.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; } }
  function reduced() { try { return W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  var LIGHT = { bg: '#ffffff', panel: '#f4f7f5', ink: '#1d2320', muted: '#5d6862', grid: '#e1e8e3', axis: '#56625b', green: '#00562f', accent: '#00562f', gold: '#9a7a2c', blue: '#1c63c0', red: '#c92a52', purple: '#6a45d8', orange: '#d1520a', teal: '#0b7a8a',
    music: '#2c63c7', math: '#00804a', patterns: '#b8862b', chemistry: '#9a3f92' };
  var DARK = { bg: '#151d18', panel: '#1b2520', ink: '#e6ece8', muted: '#a9b8af', grid: '#2a3d32', axis: '#a9b8af', green: '#6cc79a', accent: '#6cc79a', gold: '#e2c072', blue: '#74b4fc', red: '#ff8b9a', purple: '#b6a0ff', orange: '#ffa94d', teal: '#66d9e8',
    music: '#86b4ff', math: '#6cc79a', patterns: '#e2c072', chemistry: '#e6a0dc' };
  function rgba(hex, a) { var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function colors() { var s = dark() ? DARK : LIGHT, c = {}, k; for (k in s) c[k] = s[k]; c.dark = dark(); c.a = rgba; return c; }
  function warn(e) { try { console.warn('[connections]', e && e.message ? e.message : e); } catch (x) { } }
  function el(tag, cls, txt) { var e = D.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  var rng = function (seed) { var a = (seed >>> 0) || 1; return function () { a = (a + 0x6D2B79F5) | 0; var t = M.imul(a ^ (a >>> 15), 1 | a); t = (t + M.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  Cx.colors = colors; Cx.dark = dark; Cx.reduced = reduced; Cx.rgba = rgba; Cx.el = el; Cx.rng = rng;
  var themeFns = [];
  try { new MutationObserver(function () { themeFns.forEach(function (f) { try { f(); } catch (e) { warn(e); } }); }).observe(D.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); } catch (e) { }

  // ---- sound
  var A = { ctx: null, out: null, vol: 0.5, live: [], stops: [] };
  try { var sv = localStorage.getItem('cx-vol'); if (sv != null && !isNaN(+sv)) A.vol = M.max(0, M.min(1, +sv)); } catch (e) { }
  function gainFor(v) { return v * v * 0.8; }
  Cx.audio = function () {
    if (!A.ctx) {
      var AC = W.AudioContext || W.webkitAudioContext; if (!AC) return null;
      try { A.ctx = new AC(); } catch (e) { warn(e); return null; }
      var comp = A.ctx.createDynamicsCompressor(); comp.connect(A.ctx.destination);
      A.out = A.ctx.createGain(); A.out.gain.value = gainFor(A.vol); A.out.connect(comp);
    }
    if (A.ctx.state === 'suspended') { try { A.ctx.resume(); } catch (e) { } }
    return { ctx: A.ctx, out: A.out };
  };
  Cx.tone = function (f, dur, o) {
    o = o || {}; var a = Cx.audio(); if (!a) return function () { };
    var c = a.ctx, t0 = c.currentTime + (o.when || 0), at = o.attack == null ? 0.01 : o.attack, rl = o.release == null ? 0.25 : o.release, g0 = o.gain == null ? 0.25 : o.gain;
    var os = c.createOscillator(), g = c.createGain();
    os.type = o.type || 'sine'; os.frequency.value = f;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(g0, t0 + at);
    g.gain.setValueAtTime(g0, t0 + M.max(at, dur - rl)); g.gain.linearRampToValueAtTime(0, t0 + dur);
    os.connect(g); g.connect(a.out); os.start(t0); os.stop(t0 + dur + 0.05);
    var rec = { os: os, g: g }; A.live.push(rec);
    os.onended = function () { var i = A.live.indexOf(rec); if (i >= 0) A.live.splice(i, 1); try { g.disconnect(); } catch (e) { } };
    return function () { try { var n = c.currentTime; g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(g.gain.value, n); g.gain.linearRampToValueAtTime(0, n + 0.04); os.stop(n + 0.06); } catch (e) { } };
  };
  Cx.onStop = function (fn) { A.stops.push(fn); };
  Cx.stopAll = function () {
    A.stops.forEach(function (f) { try { f(); } catch (e) { warn(e); } });
    if (!A.ctx) return; var n = A.ctx.currentTime;
    A.live.slice().forEach(function (r) { try { r.g.gain.cancelScheduledValues(n); r.g.gain.setValueAtTime(0, n); r.os.stop(n + 0.02); } catch (e) { } });
  };

  // ---- visuals
  var uid = 0;
  function make(fig) {
    var v = { el: fig, id: fig.getAttribute('data-viz'), stage: fig.querySelector('.cx-stage'), bar: fig.querySelector('.cx-bar'), live: fig.querySelector('.cx-live'),
      reduced: reduced(), visible: false, colors: colors, dark: dark, rng: rng, el_: el };
    var drawFn = null, raf = 0, cans = [], loops = [], showFns = [];
    v.draw = function (fn) { drawFn = fn; v.redraw(); };
    v.redraw = function () { if (raf || !drawFn) return; raf = W.requestAnimationFrame(function () { raf = 0; try { drawFn(colors()); } catch (e) { warn(e); } }); };
    v.onTheme = function (fn) { themeFns.push(fn); };
    themeFns.push(function () { v.redraw(); });
    v.say = function (t) { if (v.live) v.live.textContent = t; };
    v.onShow = function (fn) { showFns.push(fn); };
    v.canvas = function (o) {
      o = o || {};
      var c = { el: el('canvas', 'cx-cv'), w: 0, h: 0, dpr: 1, onresize: null };
      c.ctx = c.el.getContext('2d');
      c.el.setAttribute('role', 'img'); if (o.label) c.el.setAttribute('aria-label', o.label);
      (o.parent || v.stage).appendChild(c.el);
      c.fit = function () {
        var w = c.el.parentNode.clientWidth || 300, h = M.round(w * (o.aspect || 0.6));
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
    v.svg = function (vb, label, parent) {
      var s = D.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', vb);
      if (label) { s.setAttribute('role', 'img'); s.setAttribute('aria-label', label); } else s.setAttribute('aria-hidden', 'true');
      (parent || v.stage).appendChild(s); return s;
    };
    var rt = 0;
    W.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { var ch = false; cans.forEach(function (c) { if (c.el.isConnected && c.el.offsetParent && c.fit()) ch = true; }); if (ch) v.redraw(); }, 120); });
    function into(o) { return (o && o.parent) || v.bar; }
    function lab(text, ctl) { var l = el('label', 'cx-field'); l.appendChild(el('span', 'cx-lbl', text)); l.appendChild(ctl); return l; }
    v.button = function (text, fn, o) { var b = el('button', 'cx-btn' + (o && o.pri ? ' pri' : ''), text); b.type = 'button'; b.addEventListener('click', function (e) { fn(e, b); }); into(o).appendChild(b); return b; };
    v.slider = function (text, min, max, step, val, fn, o) {
      o = o || {}; var i = el('input'); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = val;
      var out = el('output'); var show = function () { out.textContent = o.fmt ? o.fmt(+i.value) : i.value; };
      i.addEventListener('input', function () { show(); fn(+i.value); }); show();
      var l = lab(text, i); l.appendChild(out); into(o).appendChild(l); i.show = show; return i;
    };
    v.select = function (text, opts, val, fn, o) {
      var s = el('select'); opts.forEach(function (p) { var op = el('option', null, p[1]); op.value = p[0]; s.appendChild(op); });
      s.value = val; s.addEventListener('change', function () { fn(s.value); }); into(o).appendChild(lab(text, s)); return s;
    };
    v.toggle = function (text, on, fn, o) { var i = el('input'); i.type = 'checkbox'; i.checked = !!on; i.addEventListener('change', function () { fn(i.checked); }); var l = el('label', 'cx-chk'); l.appendChild(i); l.appendChild(el('span', null, text)); into(o).appendChild(l); return i; };
    v.readout = function (o) { var r = el('span', 'cx-readout'); r.setAttribute('aria-live', 'off'); into(o).appendChild(r); return r; };
    v.loop = function (fn, o) {
      o = o || {}; var L = { on: !v.reduced && o.auto !== false, id: 0, last: 0, t: 0 };
      var pb = v.button('', function () { L.on ? L.pause() : L.play(); }, o);
      function label() { pb.textContent = L.on ? '❚❚ Pause' : '▶ ' + (o.label || 'Play'); pb.setAttribute('aria-pressed', L.on ? 'true' : 'false'); }
      function tick(ts) { L.id = 0; if (!L.on || !v.visible) return; var dt = L.last ? M.min(0.05, (ts - L.last) / 1000) : 0; L.last = ts; L.t += dt; try { fn(dt, L.t); } catch (e) { warn(e); L.on = false; label(); return; } L.id = W.requestAnimationFrame(tick); }
      L.kick = function () { if (L.on && v.visible && !L.id) { L.last = 0; L.id = W.requestAnimationFrame(tick); } };
      L.play = function () { L.on = true; label(); L.kick(); };
      L.pause = function () { L.on = false; label(); if (L.id) { W.cancelAnimationFrame(L.id); L.id = 0; } };
      L.btn = pb; label(); loops.push(L); setTimeout(L.kick, 0);
      return L;
    };
    v._show = function (on) { if (on === v.visible) return; v.visible = on; if (on) { cans.forEach(function (c) { c.fit(); }); v.redraw(); } loops.forEach(function (L) { L.kick(); }); showFns.forEach(function (f) { try { f(on); } catch (e) { warn(e); } }); };
    v.uid = function (p) { return (p || 'cx') + (++uid); };
    return v;
  }
  var io = null;
  function start(fig) {
    if (fig._cx) return; var fn = reg[fig.getAttribute('data-viz')]; if (!fn) return;
    var v = make(fig); fig._cx = v; v.visible = true;
    try { fn(v); } catch (e) { warn(e); }
    if (io) io.observe(fig);
  }
  Cx.viz = function (id, fn) { reg[id] = fn; var f = D.querySelectorAll('.cx-viz[data-viz="' + id + '"]'); for (var i = 0; i < f.length; i++) if (f[i]._want) start(f[i]); };
  function want(fig) {
    if (fig._want) return; fig._want = true; var id = fig.getAttribute('data-viz');
    if (reg[id]) return start(fig);
    if (loaded[id]) return; loaded[id] = true;
    var s = D.createElement('script'); s.src = fig.getAttribute('data-src'); s.async = true;
    s.onerror = function () { warn('could not load ' + id); }; D.head.appendChild(s);
  }
  function setupIO() {
    if (!('IntersectionObserver' in W)) return;
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { var f = e.target; if (e.isIntersecting) want(f); if (f._cx) f._cx._show(e.isIntersecting); }); }, { rootMargin: '250px 0px' });
  }

  // ---- the hub
  function typeset(root) { if (root._tex) return; var m = W.MathLadder; if (m && m.typeset) { root._tex = true; try { m.typeset(root); } catch (e) { warn(e); } } }
  function hub() {
    var art = D.querySelector('.cx'); if (!art) return;
    setupIO();
    var regions = {}, order = [];
    [].forEach.call(D.querySelectorAll('.cx-region'), function (s) {
      var id = s.getAttribute('data-r'), b = s.querySelector('.cx-rbtn'), p = s.querySelector('.cx-rpanel');
      regions[id] = { s: s, b: b, p: p, title: s.querySelector('.cx-rtt').textContent, sets: s.querySelector('.cx-rsets').innerHTML, teaser: (s.querySelector('.cx-teaser') || {}).innerHTML || '' };
      order.push(id);
      b.addEventListener('click', function () { setOpen(id, b.getAttribute('aria-expanded') !== 'true'); });
    });
    function setOpen(id, on) {
      var r = regions[id]; if (!r) return;
      r.b.setAttribute('aria-expanded', on ? 'true' : 'false'); r.p.hidden = !on;
      if (on) {
        typeset(r.p);
        [].forEach.call(r.p.querySelectorAll('.cx-viz'), function (f) { if (io) io.observe(f); else want(f); });
      } else [].forEach.call(r.p.querySelectorAll('.cx-viz'), function (f) { if (f._cx) f._cx._show(false); });
    }
    order.forEach(function (id) { setOpen(id, false); });
    // the diagram
    var svg = D.querySelector('.cx-venn'), pins = {}, rgs = {};
    [].forEach.call(D.querySelectorAll('.cx-pin'), function (a) { pins[a.getAttribute('data-r')] = a; });
    [].forEach.call(D.querySelectorAll('.cx-rg'), function (g) { rgs[g.getAttribute('data-r')] = g; });
    var E = [[350, 530, 45], [500, 430, 45], [500, 430, -45], [650, 530, -45]], K = ['music', 'math', 'patterns', 'chemistry'];
    var byMask = {};
    order.forEach(function (id) { var st = regions[id].s.getAttribute('data-sets').split(' '), m = 0; K.forEach(function (k, i) { if (st.indexOf(k) >= 0) m |= 1 << i; }); byMask[m] = id; });
    function at(x, y) {
      var m = 0; E.forEach(function (e, i) { var t = e[2] * M.PI / 180, dx = x - e[0], dy = y - e[1], u = dx * M.cos(t) + dy * M.sin(t), w = -dx * M.sin(t) + dy * M.cos(t); if (u * u / 122500 + w * w / 40000 <= 1) m |= 1 << i; });
      return byMask[m] || null;
    }
    function svgPt(ev) { var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return [vb.x + (ev.clientX - r.left) / r.width * vb.width, vb.y + (ev.clientY - r.top) / r.height * vb.height]; }
    var hov = null, sel = null;
    var panel = D.querySelector('.cx-panel'), hint = panel.querySelector('.cx-panel-hint'), body = panel.querySelector('.cx-panel-body');
    function show(id) {
      var r = regions[id]; if (!r) { body.hidden = true; hint.hidden = false; return; }
      hint.hidden = true; body.hidden = false; body.innerHTML = '';
      var c = el('div', 'cx-rsets'); c.innerHTML = r.sets; body.appendChild(c);
      body.appendChild(el('h2', null, r.title));
      if (r.teaser) { var p = el('p'); p.innerHTML = r.teaser; body.appendChild(p); }
      var b = el('button', 'cx-btn pri', 'Explore this region'); b.type = 'button'; b.addEventListener('click', function () { go(id, true); }); body.appendChild(b);
    }
    function hover(id) {
      if (id === hov) return; if (hov) { rgs[hov] && rgs[hov].classList.remove('hov'); pins[hov] && pins[hov].classList.remove('hov'); }
      hov = id; if (id) { rgs[id] && rgs[id].classList.add('hov'); pins[id] && pins[id].classList.add('hov'); }
      show(id || sel);
    }
    function select(id) {
      if (sel) { rgs[sel] && rgs[sel].classList.remove('sel'); pins[sel] && pins[sel].classList.remove('sel'); regions[sel] && regions[sel].s.classList.remove('sel'); }
      sel = id; if (id) { rgs[id] && rgs[id].classList.add('sel'); pins[id] && pins[id].classList.add('sel'); regions[id] && regions[id].s.classList.add('sel'); }
      show(id);
    }
    function go(id, scroll) {
      if (!regions[id]) return; select(id); setOpen(id, true);
      try { if (location.hash !== '#r-' + id) history.replaceState(null, '', '#r-' + id); } catch (e) { }
      if (scroll) { regions[id].s.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); try { regions[id].b.focus({ preventScroll: true }); } catch (e) { } }
    }
    Cx.open = go;
    if (svg) {
      svg.addEventListener('pointermove', function (ev) { if (ev.pointerType === 'mouse') { var p = svgPt(ev); hover(at(p[0], p[1])); } });
      svg.addEventListener('pointerleave', function () { hover(null); });
      svg.addEventListener('click', function (ev) {
        ev.preventDefault();
        var a = ev.target.closest && ev.target.closest('.cx-pin'), id = a ? a.getAttribute('data-r') : null;
        if (!id) { var p = svgPt(ev); id = at(p[0], p[1]); }
        if (!id) return;
        // first tap previews in the panel on wide screens; a second tap on the same region (or any tap on a phone) opens it
        var wide = W.matchMedia && W.matchMedia('(min-width: 901px)').matches;
        if (wide && sel !== id && ev.detail !== 0) { select(id); setOpen(id, true); return; }
        go(id, true);
      });
      Object.keys(pins).forEach(function (id) {
        var a = pins[id];
        a.addEventListener('focus', function () { hover(id); });
        a.addEventListener('blur', function () { hover(null); });
        a.addEventListener('keydown', function (ev) { if (ev.key === ' ') { ev.preventDefault(); go(id, true); } });
      });
    }
    [].forEach.call(D.querySelectorAll('.cx-index a[data-r]'), function (a) { a.addEventListener('click', function (ev) { ev.preventDefault(); go(a.getAttribute('data-r'), true); }); });
    [].forEach.call(D.querySelectorAll('[data-cx-all]'), function (b) { b.addEventListener('click', function () { var on = b.getAttribute('data-cx-all') === '1'; order.forEach(function (id) { setOpen(id, on); }); }); });
    function fromHash() { var m = /^#r-([a-z-]+)$/.exec(location.hash || ''); if (m && regions[m[1]]) { go(m[1], false); setTimeout(function () { regions[m[1]].s.scrollIntoView(); }, 30); } }
    W.addEventListener('hashchange', fromHash); fromHash();
    // sound bar
    var vol = D.getElementById('cx-vol');
    if (vol) { vol.value = M.round(A.vol * 100); vol.addEventListener('input', function () { A.vol = vol.value / 100; if (A.out) A.out.gain.setTargetAtTime(gainFor(A.vol), A.ctx.currentTime, 0.02); try { localStorage.setItem('cx-vol', String(A.vol)); } catch (e) { } }); }
    var stop = D.querySelector('.cx-stop'); if (stop) stop.addEventListener('click', Cx.stopAll);
    // TeX loads deferred too: typeset what is already open once it arrives
    W.addEventListener('load', function () { order.forEach(function (id) { if (!regions[id].p.hidden) { regions[id].p._tex = false; typeset(regions[id].p); } }); });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', hub); else hub();
})(window, document);
