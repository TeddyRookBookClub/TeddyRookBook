/* Tripos pages (layouts/comp/tripos.html, tpaper.html): "take the paper" clock, print buttons, the topic filter, and
   window.TP, the small toolkit every Tripos animation (static/comp/viz/tp-*.js) is built on.
   Clock state: localStorage 'trb-tripos-v1' = { v: 1, t: { <paper slug>: { s: start ms, e: end ms or 0 } } }
   (keys starting trb- are per learner, static/js/profiles.js). The page works without storage.

   TP.run(el, api, V) draws an animation into el. V = {
     W: 640, H: height, aria: 'description', split: optional narrow width (labels at x >= split move below the picture),
     draw(c, L) -> SVG string; c = api.colors(); L(key, x, y, tex, color, anchor 'l'|'r'|'c') places a TeX label,
     reset(), advance(dt) (return false to stop), step(), final(), done(), cap() -> caption text,
     buttons: [[label, fn], …], sliders: [{ label, min, max, step, value, set(v) }, …] }
   TP.s: SVG string helpers ln, ci, pa, tx, poly, arr (arrow), rc. */
(function (W, D) {
  'use strict';
  var M = Math;
  function f1(n) { return (+n).toFixed(1); }
  var S = {
    f1: f1,
    ln: function (a, b, c, d, k, w, da) { return '<line x1="' + f1(a) + '" y1="' + f1(b) + '" x2="' + f1(c) + '" y2="' + f1(d) + '" stroke="' + k + '" stroke-width="' + (w || 2) + '"' + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linecap="round"/>'; },
    ci: function (x, y, r, f, k, w) { return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + '/>'; },
    rc: function (x, y, w, h, f, k, sw) { return '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(M.max(0, w)) + '" height="' + f1(M.max(0, h)) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (sw || 1.5) + '"' : '') + '/>'; },
    pa: function (d, k, w, f, da) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linejoin="round" stroke-linecap="round"/>'; },
    tx: function (x, y, s, k, sz, an) { return '<text x="' + f1(x) + '" y="' + f1(y) + '" fill="' + k + '" font-size="' + (sz || 14) + '" text-anchor="' + (an || 'middle') + '" font-family="system-ui,sans-serif">' + s + '</text>'; },
    poly: function (p, z) { var s = ''; for (var i = 0; i < p.length; i++) s += (i ? 'L' : 'M') + f1(p[i][0]) + ' ' + f1(p[i][1]); return s + (z ? 'Z' : ''); },
    arr: function (x, y, x2, y2, k, w) {
      var a = M.atan2(y2 - y, x2 - x), h = 9;
      return S.ln(x, y, x2, y2, k, w || 2) + S.pa('M' + f1(x2) + ' ' + f1(y2) + 'L' + f1(x2 - h * M.cos(a - 0.4)) + ' ' + f1(y2 - h * M.sin(a - 0.4)) + 'L' + f1(x2 - h * M.cos(a + 0.4)) + ' ' + f1(y2 - h * M.sin(a + 0.4)) + 'Z', k, 1, k);
    }
  };
  function run(el, api, V) {
    var NS = 'http://www.w3.org/2000/svg', WW = V.W || 640;
    el.innerHTML = '';
    var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:' + WW + 'px;margin:0 auto';
    var nar = V.split && el.clientWidth && el.clientWidth < 560, VW = nar ? V.split : WW;
    var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + V.H); svg.setAttribute('width', '100%');
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', V.aria || 'Animation'); svg.style.cssText = 'display:block;border-radius:8px';
    var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;overflow:hidden';
    box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
    var side = D.createElement('div'); side.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-top:6px;font-size:15px'; if (nar) el.appendChild(side);
    var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px'; el.appendChild(bar);
    var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
    var labs = {}, lbg = 'transparent', seen = {};
    function L(key, x, y, s, col, an) {
      seen[key] = 1;
      var o = labs[key], sd = nar && x >= V.split;
      if (!o) { o = labs[key] = { d: D.createElement('div'), s: null, sd: sd }; (sd ? side : lay).appendChild(o.d); }
      if (o.sd) o.d.style.cssText = 'color:' + (col || 'inherit') + (s ? '' : ';display:none');
      else o.d.style.cssText = 'position:absolute;left:' + (x / VW * 100) + '%;top:' + (y / V.H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : an === 'r' ? '-100%' : '-50%') + ',-50%);font-size:clamp(10px,2.4vw,15px);white-space:nowrap;line-height:1.2;padding:0 3px;border-radius:4px;background:' + lbg + ';color:' + (col || 'inherit') + (s ? '' : ';display:none');
      if (o.s !== s) { o.s = s; if (s) api.tex(s, o.d); else o.d.innerHTML = ''; }
    }
    function btn(t, f) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', f); bar.appendChild(b); return b; }
    var playing = false, last = 0, pb = null;
    function render() {
      var c = api.colors(); lbg = c.panel + 'd9'; seen = {};
      svg.innerHTML = S.rc(0, 0, WW, V.H, c.panel) + V.draw(c, L, VW);
      for (var k in labs) if (!seen[k]) L(k, 0, 0, '');
      cap.textContent = V.cap ? V.cap() : '';
    }
    function frame(ts) {
      if (!playing) return;
      if (!el.isConnected) { playing = false; return; }
      var dt = last ? M.min(0.1, (ts - last) / 1000) : 0; last = ts;
      if (V.advance(dt) === false) stop();
      if (el.offsetParent !== null) render();
      if (playing) W.requestAnimationFrame(frame);
    }
    function play() { if (playing) return; if (V.done && V.done()) V.reset(); playing = true; last = 0; if (pb) pb.textContent = 'Pause'; W.requestAnimationFrame(frame); }
    function stop() { playing = false; if (pb) pb.textContent = 'Play'; }
    if (V.advance) pb = btn('Play', function () { if (playing) stop(); else play(); });
    if (V.step) btn('Step', function () { stop(); V.step(); render(); });
    if (V.reset && V.advance) btn('Reset', function () { stop(); V.reset(); render(); });
    (V.buttons || []).forEach(function (b) { btn(b[0], function () { stop(); b[1](); render(); }); });
    (V.sliders || []).forEach(function (s) {
      var lab = D.createElement('label'); lab.style.cssText = 'display:inline-flex;gap:6px;align-items:center;font-size:.9em';
      var i = D.createElement('input'); i.type = 'range'; i.min = s.min; i.max = s.max; i.step = s.step; i.value = s.value;
      lab.appendChild(D.createTextNode(s.label)); lab.appendChild(i); bar.appendChild(lab);
      i.addEventListener('input', function () { s.set(+i.value); if (!playing) render(); });
    });
    api.onTheme(render);
    if (V.reset) V.reset();
    if (!V.advance || api.reduced()) { if (V.final) V.final(); render(); } else { render(); play(); }
  }
  W.TP = { run: run, s: S };

  // ------------------------------------------------------------------ take the paper
  var KEY = 'trb-tripos-v1';
  function load() { try { var o = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (o && o.t) return o; } catch (e) { } return { v: 1, t: {} }; }
  function save(o) { try { W.localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
  function hms(ms) { var s = M.max(0, M.round(ms / 1000)), h = M.floor(s / 3600), m = M.floor(s % 3600 / 60); s %= 60; return h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  function initTake(art) {
    var slug = art.getAttribute('data-tp'), total = (+art.getAttribute('data-minutes') || 180) * 60000;
    var out = art.querySelector('.tp-time'), go = art.querySelector('[data-tp-start]'), end = art.querySelector('[data-tp-stop]'), st = art.querySelector('.tp-status');
    if (!out || !go) return;
    var timer = 0, mem = { s: 0, e: 0 };
    function paint() {
      var now = Date.now(), taking = mem.s && !mem.e, used = mem.s ? (mem.e || now) - mem.s : 0, left = total - used;
      art.classList.toggle('tp-taking', !!taking);
      art.classList.toggle('tp-over', !!taking && left < 0);
      out.textContent = left >= 0 ? hms(left) : '−' + hms(-left);
      go.hidden = !!taking; end.hidden = !taking;
      go.textContent = mem.e ? 'Start again' : 'Start the clock';
      st.textContent = taking ? (left >= 0 ? 'The clock is running. Hints and solutions are hidden until you stop.' : 'Time is up. Put your pen down and stop the clock to see the solutions.')
        : mem.e ? 'You worked for ' + hms(used) + '. The hints and solutions are open again.' : '';
    }
    function tick() { paint(); }
    function persist() { var o = load(); if (mem.s) o.t[slug] = mem; else delete o.t[slug]; save(o); }
    go.addEventListener('click', function () { mem = { s: Date.now(), e: 0 }; persist(); paint(); if (!timer) timer = W.setInterval(tick, 1000); });
    end.addEventListener('click', function () { mem.e = Date.now(); persist(); paint(); });
    var r = load().t[slug]; if (r && r.s) mem = { s: +r.s, e: +r.e || 0 };
    paint(); timer = W.setInterval(tick, 1000);
  }
  function initPrint() {
    Array.prototype.forEach.call(D.querySelectorAll('[data-tp-print]'), function (b) {
      b.addEventListener('click', function () {
        var mode = b.getAttribute('data-tp-print');
        D.documentElement.setAttribute('data-tp-print', mode);
        if (mode === 'full') Array.prototype.forEach.call(D.querySelectorAll('.cp-sol, .cp-hints'), function (r) { if (!r.getAttribute('data-typeset')) { r.setAttribute('data-typeset', '1'); try { W.MathLadder.typeset(r); } catch (e) { } } });
        W.print();
      });
    });
    W.addEventListener('afterprint', function () { D.documentElement.removeAttribute('data-tp-print'); });
  }
  function initFilter(f) {
    var cards = D.querySelectorAll('.tp-card'), out = f.querySelector('output');
    function go() {
      var a = f.elements.area.value, d = f.elements.diff.value, n = 0;
      Array.prototype.forEach.call(cards, function (c) {
        var ok = (!a || (' ' + c.getAttribute('data-areas') + ' ').indexOf(' ' + a + ' ') >= 0) && (!d || c.getAttribute('data-diff') === d);
        c.hidden = !ok; if (ok) n++;
      });
      if (out) out.textContent = n + (n === 1 ? ' problem' : ' problems');
    }
    f.addEventListener('change', go); f.addEventListener('submit', function (e) { e.preventDefault(); }); go();
  }
  function init() {
    Array.prototype.forEach.call(D.querySelectorAll('article.tp-paper'), initTake);
    Array.prototype.forEach.call(D.querySelectorAll('form[data-tp-filter]'), initFilter);
    initPrint();
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})(window, document);
