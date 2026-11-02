/* Scales on a keyboard: pick a home note and a scale, see its pattern of whole and half steps, and play it. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var SC = [
    { n: 'Major', s: [2, 2, 1, 2, 2, 2, 1], deg: [1, 2, 3, 4, 5, 6, 7] },
    { n: 'Natural minor', s: [2, 1, 2, 2, 1, 2, 2], deg: [1, 2, 3, 4, 5, 6, 7] },
    { n: 'Harmonic minor', s: [2, 1, 2, 2, 1, 3, 1], deg: [1, 2, 3, 4, 5, 6, 7] },
    { n: 'Major pentatonic', s: [2, 2, 3, 2, 3], deg: [1, 2, 3, 5, 6] },
    { n: 'Minor pentatonic', s: [3, 2, 2, 3, 2], deg: [1, 3, 4, 5, 7] },
    { n: 'Whole tone', s: [2, 2, 2, 2, 2, 2], deg: null }
  ];
  var TON = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'], ALT = { 'C♯': 'D♭', 'E♭': 'D♯', 'F♯': 'G♭', 'A♭': 'G♯', 'B♭': 'A♯' };
  var SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'], LET = 'CDEFGAB', LPC = [0, 2, 4, 5, 7, 9, 11];
  function spell(ton, pcs, deg) { // name each note with its own letter (degree d uses the letter d - 1 steps up)
    var L = LET.indexOf(ton[0]), out = [], bad = false;
    pcs.forEach(function (pc, i) {
      var li = (L + deg[i] - 1) % 7, d = ((pc - LPC[li]) % 12 + 18) % 12 - 6;
      if (Math.abs(d) > 1) bad = true;
      out.push(LET[li] + (d === 1 ? '♯' : d === -1 ? '♭' : ''));
    });
    return bad ? null : out;
  }
  function names(ti, si) {
    var sc = SC[si], pcs = [ti], i;
    for (i = 0; i < sc.s.length - 1; i++) pcs.push((pcs[i] + sc.s[i]) % 12);
    if (!sc.deg) return pcs.map(function (p) { return SHARP[p]; });
    var full = SC[si < 3 ? si : si === 3 ? 0 : 1], fp = [ti]; for (i = 0; i < 6; i++) fp.push((fp[i] + full.s[i]) % 12);
    var t = TON[ti], sp = spell(t, fp, [1, 2, 3, 4, 5, 6, 7]) || (ALT[t] && spell(ALT[t], fp, [1, 2, 3, 4, 5, 6, 7]));
    if (!sp) return pcs.map(function (p) { return SHARP[p]; });
    return sc.deg.map(function (d) { return sp[d - 1]; });
  }
  Cx.viz('mu-scale', function (v) {
    var root = v.stage, U = VU(v, '.vb-st{padding:.6rem}.vb-row{display:flex;flex-wrap:wrap;gap:.45rem .7rem;align-items:center;margin:0 0 .6rem}.vb-cv{display:block;width:100%;border-radius:9px;touch-action:none}.vb-svg{display:block;width:100%;height:auto;margin:auto}.vb-cap{font-size:.92rem;line-height:1.5;margin:.6rem 0 0}.vb-note{font-size:.82rem;opacity:.75;margin:.3rem 0 0}.vb-dim{opacity:.75}.vb-st .vb-svg{max-width:640px}.vb-pat{display:flex;flex-wrap:wrap;gap:4px;margin:.4rem 0}.vb-pat span{border-radius:99px;padding:2px 10px;font-size:.82rem;font-weight:600;border:1.5px solid currentColor}.vb-pat .vb-p1{flex:0 0 auto;opacity:.75}.vb-pat .vb-p2{min-width:4.5em;text-align:center}.vb-pat .vb-p3{min-width:6em;text-align:center}');
    var ti = 0, si = 0, lit = -1, timers = [];
    root.innerHTML = '<div class="vb-row"><label class="cx-field"><span class="cx-lbl">Home note</span><select class="vb-t">' + TON.map(function (t, i) { return '<option value="' + i + '">' + t + '</option>'; }).join('') + '</select></label>' +
      '<label class="cx-field"><span class="cx-lbl">Scale</span><select class="vb-s">' + SC.map(function (s, i) { return '<option value="' + i + '">' + s.n + '</option>'; }).join('') + '</select></label>' +
      '<button type="button" class="cx-btn pri" data-a="play">▶ Play the scale</button></div>' +
      '<svg class="vb-svg" viewBox="0 0 422 150" role="img"></svg><div class="vb-steps" aria-live="polite"></div><p class="vb-note">Tap any key to hear it. Sound starts only when you tap.</p>';
    var svg = root.querySelector('svg'), stepsEl = root.querySelector('.vb-steps');
    root.querySelector('.vb-t').onchange = function (e) { ti = +e.target.value; draw(); };
    root.querySelector('.vb-s').onchange = function (e) { si = +e.target.value; draw(); };
    function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
    function notes() { var m = [60 + ti], s = SC[si].s; s.forEach(function (x, i) { m.push(m[i] + x); }); return m; }
    function play1(m) { if (window.Cx && Cx.tone) Cx.tone(hz(m), 0.6, { type: 'triangle', gain: 0.3 }); lit = m; draw(); setTimeout(function () { if (lit === m) { lit = -1; draw(); } }, 350); }
    root.querySelector('[data-a=play]').onclick = function () {
      timers.forEach(clearTimeout); timers = [];
      var ns = notes(), seq = ns.concat(ns.slice(0, -1).reverse());
      seq.forEach(function (m, i) { timers.push(setTimeout(function () { play1(m); }, i * 320)); });
    };
    if (window.Cx && Cx.onStop) Cx.onStop(function () { timers.forEach(clearTimeout); timers = []; lit = -1; draw(); });
    function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; }
    function draw() {
      var col = U.colors(), ns = notes(), wk = 30, x0 = 1, ww = 0, keys = [];
      svg.innerHTML = '';
      for (var m = 60; m < 84; m++) { var pc = m % 12, black = [1, 3, 6, 8, 10].indexOf(pc) >= 0; keys.push({ m: m, b: black, x: black ? x0 + ww * wk - 9 : x0 + ww * wk }); if (!black) ww++; }
      [false, true].forEach(function (blk) {
        keys.filter(function (k) { return k.b === blk; }).forEach(function (k) {
          var on = ns.indexOf(k.m) >= 0, home = k.m === ns[0] || k.m === ns[ns.length - 1];
          var r = el('rect', { x: k.x, y: 1, width: blk ? 18 : wk - 1, height: blk ? 82 : 132, rx: 3,
            fill: k.m === lit ? col.gold : on ? (home ? col.glass[3] : col.glass[0]) : (blk ? (U.dark() ? '#0d1110' : '#22282a') : (U.dark() ? '#dfe6e2' : '#ffffff')),
            stroke: col.lead, 'stroke-width': 1.2 });
          r.style.cursor = 'pointer'; r.addEventListener('click', function () { play1(k.m); });
          if (on && !blk) { var c = el('circle', { cx: k.x + wk / 2 - 0.5, cy: 116, r: 4, fill: '#fff', 'pointer-events': 'none' }); }
          if (on && blk) el('circle', { cx: k.x + 9, cy: 70, r: 3.5, fill: '#fff', 'pointer-events': 'none' });
        });
      });
      var nm = names(ti, si), s = SC[si].s;
      svg.setAttribute('aria-label', TON[ti] + ' ' + SC[si].n.toLowerCase() + ' scale on a keyboard: ' + nm.join(', '));
      stepsEl.innerHTML = '<p class="vb-cap"><b>' + nm[0] + ' ' + SC[si].n.toLowerCase() + ':</b> ' + nm.join(' · ') + ' · ' + nm[0] + '</p><p class="vb-pat">' +
        s.map(function (x) { return '<span class="vb-p' + x + '">' + (x === 1 ? 'half' : x === 2 ? 'whole' : x === 3 ? '1½' : x) + '</span>'; }).join('') + '</p>';
    }
    draw(); U.onTheme(draw);
  });
  function VU(v, css) {
    if (css && !document.getElementById('vb-css-' + v.id)) { var st = document.createElement('style'); st.id = 'vb-css-' + v.id; st.textContent = css; document.head.appendChild(st); }
    v.stage.classList.add('vb-st');
    return {
      dark: v.dark, still: function () { return v.reduced; }, onTheme: v.onTheme,
      colors: function () { var c = v.colors(), d = c.dark; return { bg2: c.bg, fg: c.ink, dim: c.muted, accent: c.green, gold: c.gold, lead: d ? '#0b0d0e' : '#2a2622',
        glass: d ? ['#4a86e8', '#e0584a', '#e6b93e', '#3faa72', '#9a6ad6', '#4fb8c8'] : ['#2d63b8', '#c0392b', '#d9a521', '#2e8b57', '#7a4bb0', '#2a9bb0'] }; },
      size: function (cv, ratio) {
        var w = cv.parentNode.clientWidth || 600, h = Math.round(w * ratio), r = Math.min(2, window.devicePixelRatio || 1);
        if (cv.width !== Math.round(w * r) || cv.height !== Math.round(h * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); cv.style.height = h + 'px'; }
        var ctx = cv.getContext('2d'); ctx.setTransform(r, 0, 0, r, 0, 0); return { ctx: ctx, w: w, h: h };
      },
      onResize: function (el, f) { var t, lw = el.clientWidth; try { new ResizeObserver(function () { if (!el.clientWidth || el.clientWidth === lw) return; lw = el.clientWidth; clearTimeout(t); t = setTimeout(f, 80); }).observe(el); } catch (e) { } }
    };
  }
})();
