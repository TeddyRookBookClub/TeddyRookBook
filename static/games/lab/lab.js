/* Science Lab helpers shared by the science simulations. window.TRBLab:
   store(slug)            per-sim settings and progress in this browser: .get(key, default), .set(key, value);
                          every call with the same slug returns the same store (missions() uses key 'done')
   dark()                 true when the site is in dark mode; onTheme(fn) calls fn(dark) when it changes
   canvas(el)             keeps a canvas sized to its box at the device's pixel ratio: returns {c, w, h, dpr, fit()}
   loop(fn, el)           calls fn(dt) every frame (dt in seconds, at most 0.05), paused while the tab is hidden or el is off screen
   missions(listEl, slug, items, onPick)  draws a mission list and remembers which are done: returns {done(id), isDone(id), count()}
   toast(viewEl, text)    a short message over the simulation
   fmt(v, d)              a number with d decimals, with a real minus sign
   reduced                true if the visitor prefers less motion */
(function (W, D) {
  'use strict';
  var stores = {};
  function store(slug) {
    if (stores[slug]) return stores[slug]; // one shared copy per name, so two callers never overwrite each other's saves
    var key = 'trb-lab-' + slug, data = {};
    try { data = JSON.parse(W.localStorage.getItem(key) || '{}') || {}; } catch (e) { data = {}; }
    stores[slug] = {
      get: function (k, d) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : d; },
      set: function (k, v) { data[k] = v; try { W.localStorage.setItem(key, JSON.stringify(data)); } catch (e) { } }
    };
    return stores[slug];
  }
  function dark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function onTheme(fn) {
    try { new MutationObserver(function () { fn(dark()); }).observe(D.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); } catch (e) { }
  }
  function canvas(el) {
    var o = { c: el.getContext('2d'), w: 300, h: 150, dpr: 1 };
    o.fit = function () {
      var r = el.getBoundingClientRect(), dpr = Math.min(2, W.devicePixelRatio || 1), w = Math.max(50, r.width), h = Math.max(50, r.height);
      if (Math.round(w * dpr) !== el.width || Math.round(h * dpr) !== el.height) { el.width = Math.round(w * dpr); el.height = Math.round(h * dpr); }
      o.w = w; o.h = h; o.dpr = dpr; o.c.setTransform(dpr, 0, 0, dpr, 0, 0); return o;
    };
    o.fit(); W.addEventListener('resize', o.fit);
    return o;
  }
  function loop(fn, el) {
    var last = performance.now(), visible = true;
    if (el && 'IntersectionObserver' in W) { try { new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(el); } catch (e) { } }
    function frame(now) {
      W.requestAnimationFrame(frame);
      var dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
      if (D.hidden || !visible) return;
      try { fn(dt); } catch (err) { if (W.console) W.console.error(err); }
    }
    W.requestAnimationFrame(frame);
  }
  function toast(view, text) {
    var t = view.querySelector('.lab-toast'); if (!t) { t = D.createElement('div'); t.className = 'lab-toast'; t.setAttribute('role', 'status'); view.appendChild(t); }
    t.textContent = text; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }
  function missions(listEl, slug, items, onPick) {
    var st = store(slug), done = st.get('done', {}), cur = null;
    function draw() {
      listEl.innerHTML = items.map(function (m) {
        return '<li data-id="' + m.id + '" class="' + (done[m.id] ? 'done' : '') + (cur === m.id ? ' cur' : '') + '"><span class="ck" aria-hidden="true">' + (done[m.id] ? '✓' : '') + '</span><b>' + m.title + '</b><span>' + m.goal + '</span>' + (onPick ? '<button type="button">' + (cur === m.id ? 'Trying it' : 'Try it') + '</button>' : '') + '</li>';
      }).join('');
      var p = listEl.parentNode && listEl.parentNode.querySelector('.lab-progress'); if (p) p.textContent = count() + ' of ' + items.length + ' done';
    }
    function count() { return items.filter(function (m) { return done[m.id]; }).length; }
    if (onPick) listEl.addEventListener('click', function (e) { var b = e.target.closest('button'), li = e.target.closest('li'); if (!b || !li) return; cur = li.dataset.id; draw(); onPick(cur); });
    draw();
    return {
      done: function (id) { if (done[id]) return false; done[id] = 1; st.set('done', done); draw(); return true; },
      isDone: function (id) { return !!done[id]; }, count: count,
      current: function () { return cur; }, setCurrent: function (id) { cur = id; draw(); }
    };
  }
  function fmt(v, d) { if (!isFinite(v)) return '—'; var s = Math.abs(v).toFixed(d === undefined ? 2 : d); return (v < 0 && +s !== 0 ? '−' : '') + s; }
  var reduced = false; try { reduced = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }
  W.TRBLab = { store: store, dark: dark, onTheme: onTheme, canvas: canvas, loop: loop, missions: missions, toast: toast, fmt: fmt, reduced: reduced };
})(window, document);
