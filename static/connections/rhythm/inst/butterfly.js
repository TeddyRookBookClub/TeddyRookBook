/* butterfly: ported from docs/papers/rhythm-of-numbers/instruments/butterfly-instrument.html by scripts/rhythm/port-instrument.py. Edit the source, then rerun. */
(function () {
  "use strict";
  var PRESETS = [
    { name: "π − 3", terms: [7, 15, 1, 292, 1, 1, 1, 2] },
    { name: "φ − 1 (golden)", terms: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { name: "√2 − 1", terms: [2, 2, 2, 2, 2, 2] },
    { name: "e − 2", terms: [1, 2, 1, 1, 4, 1, 1, 6] },
    { name: "the fifth, log₂(3/2)", terms: [1, 1, 2, 2, 3, 1, 5, 2] }
  ];
  var QMAX_FLY = 40, QMAX_LEVEL = 144;
  var state = { terms: PRESETS[0].terms, name: PRESETS[0].name, levels: [], level: 0, fly: null };
  var $ = function (id) { return document.getElementById(id); };
  function css(name) { return getComputedStyle(document.querySelector(".rni")).getPropertyValue(name).trim(); }

  // ---- linear algebra: eigenvalues of a real symmetric matrix (cyclic Jacobi) ----
  function eigSym(A, n) {
    for (var sweep = 0; sweep < 60; sweep++) {
      var off = 0;
      for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) off += A[i * n + j] * A[i * n + j];
      if (off < 1e-22) break;
      for (var p = 0; p < n - 1; p++) for (var q = p + 1; q < n; q++) {
        var apq = A[p * n + q];
        if (Math.abs(apq) < 1e-300) continue;
        var theta = (A[q * n + q] - A[p * n + p]) / (2 * apq);
        var t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        var c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (var k = 0; k < n; k++) { var akp = A[k * n + p], akq = A[k * n + q]; A[k * n + p] = c * akp - s * akq; A[k * n + q] = s * akp + c * akq; }
        for (k = 0; k < n; k++) { var apk = A[p * n + k], aqk = A[q * n + k]; A[p * n + k] = c * apk - s * aqk; A[q * n + k] = s * apk + c * aqk; }
      }
    }
    var ev = new Array(n);
    for (i = 0; i < n; i++) ev[i] = A[i * n + i];
    return ev.sort(function (a, b) { return a - b; });
  }
  // Band edges of the Harper equation at flux p/q: two real symmetric matrices (periodic and antiperiodic).
  function bands(p, q) {
    if (q === 1) return [[-4, 4]];
    if (q === 2) return [[-2 * Math.SQRT2, 0], [0, 2 * Math.SQRT2]];
    function build(shift, corner) {
      var A = new Float64Array(q * q);
      for (var m = 0; m < q; m++) {
        A[m * q + m] = 2 * Math.cos(2 * Math.PI * p * m / q + shift);
        var m2 = (m + 1) % q, v = (m === q - 1) ? corner : 1;
        A[m * q + m2] += v; A[m2 * q + m] += v;
      }
      return eigSym(A, q);
    }
    var a = build(0, 1), b = build(Math.PI / q, -1), out = [];
    for (var i = 0; i < q; i++) out.push([Math.min(a[i], b[i]), Math.max(a[i], b[i])]);
    return out;
  }
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function convergents(terms) {
    var p0 = 1, q0 = 0, p1 = 0, q1 = 1, out = [];
    for (var i = 0; i < terms.length; i++) { var a = terms[i], p2 = a * p1 + p0, q2 = a * q1 + q0; p0 = p1; q0 = q1; p1 = p2; q1 = q2; out.push({ p: p1, q: q1, term: a }); }
    return out;
  }
  function value(terms) { var x = 0; for (var i = terms.length - 1; i >= 0; i--) x = 1 / (terms[i] + x); return x; }
  function hallInteger(p, q, r) { for (var k = 0; k <= q; k++) { var t = (k % 2 ? -1 : 1) * Math.ceil(k / 2); if ((((r - p * t) % q) + q) % q === 0) return t; } return 0; }
  function groupSizes(b, cuts) {
    var q = b.length, gaps = [];
    for (var i = 0; i < q - 1; i++) gaps.push({ i: i, g: b[i + 1][0] - b[i][1] });
    gaps.sort(function (x, y) { return y.g - x.g; });
    var cutAt = gaps.slice(0, cuts).map(function (x) { return x.i; }).sort(function (x, y) { return x - y; });
    var sizes = [], prev = -1;
    cutAt.forEach(function (c) { sizes.push(c - prev); prev = c; });
    sizes.push(q - 1 - prev);
    return { sizes: sizes, cutAt: cutAt };
  }

  // ---- the butterfly (computed once) ----
  function computeFly() {
    var rows = [];
    for (var q = 1; q <= QMAX_FLY; q++) for (var p = 0; p <= q / 2; p++) {
      if (gcd(p, q) !== 1 && !(p === 0 && q === 1)) continue;
      var b = bands(p, q);
      rows.push({ a: p / q, b: b });
      if (p / q !== 0.5 && !(p === 0)) rows.push({ a: 1 - p / q, b: b });
      if (p === 0) rows.push({ a: 1, b: b });
    }
    return rows;
  }
  function drawFly() {
    var c = $("fly"), g = c.getContext("2d"), W = c.width, H = c.height, padL = 84, padB = 46, padT = 14, padR = 16;
    g.clearRect(0, 0, W, H);
    var X = function (E) { return padL + (E + 4) / 8 * (W - padL - padR); };
    var Y = function (a) { return H - padB - a * (H - padB - padT); };
    g.fillStyle = css("--band");
    state.fly.forEach(function (r) { var y = Y(r.a); r.b.forEach(function (bd) { g.fillRect(X(bd[0]), y - 1.5, Math.max(1.2, X(bd[1]) - X(bd[0])), 3); }); });
    // this number's levels
    state.levels.forEach(function (L, i) {
      var y = Y(L.p / L.q);
      g.fillStyle = css("--gold-soft"); g.fillRect(padL, y - 4, W - padL - padR, 8);
      g.fillStyle = css("--gold");
      L.b.forEach(function (bd) { g.fillRect(X(bd[0]), y - 3, Math.max(1.5, X(bd[1]) - X(bd[0])), 6); });
    });
    var a = value(state.terms);
    g.strokeStyle = css("--ink"); g.setLineDash([10, 8]); g.lineWidth = 2; g.beginPath(); g.moveTo(padL, Y(a)); g.lineTo(W - padR, Y(a)); g.stroke(); g.setLineDash([]);
    // axes
    g.strokeStyle = css("--line"); g.lineWidth = 2; g.beginPath(); g.moveTo(padL, padT); g.lineTo(padL, H - padB); g.lineTo(W - padR, H - padB); g.stroke();
    g.fillStyle = css("--muted"); g.font = "24px " + css("--mono").split(",")[0].replace(/"/g, "") + ", monospace"; g.textAlign = "center";
    [-4, -2, 0, 2, 4].forEach(function (E) { g.fillText(String(E), X(E), H - 12); });
    g.textAlign = "right";
    [0, 0.25, 0.5, 0.75, 1].forEach(function (t) { g.fillText(String(t), padL - 10, Y(t) + 8); });
  }

  // ---- one level ----
  function drawStrip() {
    var L = state.levels[state.level], c = $("strip"), g = c.getContext("2d"), W = c.width, H = c.height;
    g.clearRect(0, 0, W, H);
    if (!L) return;
    var pad = 20, X = function (E) { return pad + (E + 4) / 8 * (W - 2 * pad); };
    var gi = 0, cutSet = {}; L.groups.cutAt.forEach(function (i) { cutSet[i] = 1; });
    for (var i = 0; i < L.b.length; i++) {
      g.fillStyle = gi % 2 ? css("--gold") : css("--band");
      var x0 = X(L.b[i][0]), w = Math.max(2.2, X(L.b[i][1]) - x0);
      g.fillRect(x0, 30, w, H - 80);
      if (cutSet[i]) gi++;
    }
    g.fillStyle = css("--muted"); g.font = "22px monospace"; g.textAlign = "center";
    [-4, -2, 0, 2, 4].forEach(function (E) { g.fillText(String(E), X(E), H - 14); });
    // Hall integers on the widest gaps
    g.fillStyle = css("--ink"); g.font = "600 24px monospace";
    L.groups.cutAt.slice(0, 12).forEach(function (i) { var x = (X(L.b[i][1]) + X(L.b[i + 1][0])) / 2; g.fillText(String(hallInteger(L.p, L.q, i + 1)), x, 24); });
  }
  function describeLevel() {
    var L = state.levels[state.level]; if (!L) { $("levelLine").textContent = ""; return; }
    var s = L.groups.sizes, txt = "<b>" + L.p + "/" + L.q + "</b>: " + L.q + " bands";
    if (s.length > 1) txt += " in " + s.length + " groups of <span class='g'>" + s.join(" · ") + "</span>";
    txt += ". Total width " + L.width.toFixed(4) + " (9.33/q = " + (9.33 / L.q).toFixed(4) + ").";
    if (s.length > 1) txt += " Numbers above the widest gaps are their Hall integers.";
    $("levelLine").innerHTML = txt;
  }

  function setNumber(terms, name) {
    state.terms = terms; state.name = name;
    var cs = convergents(terms), levels = [];
    cs.forEach(function (c) {
      if (c.q < 2 || c.q > QMAX_LEVEL) return;
      if (levels.length && levels[levels.length - 1].q === c.q) return;
      var b = bands(c.p, c.q), w = 0; b.forEach(function (bd) { w += bd[1] - bd[0]; });
      levels.push({ p: c.p, q: c.q, b: b, width: w });
    });
    // group each level by the first earlier level with at least three bands
    levels.forEach(function (L, i) {
      var base = null; for (var j = 0; j < i; j++) if (levels[j].q >= 3) { base = levels[j]; break; }
      L.base = base; L.groups = base ? groupSizes(L.b, base.q - 1) : { sizes: [L.q], cutAt: [] };
    });
    state.levels = levels; state.level = levels.length - 1;
    var tooBig = cs.filter(function (c) { return c.q > QMAX_LEVEL; });
    $("numLine").innerHTML = "<b>" + name + "</b> = " + value(terms).toFixed(9) + " = [0; " + terms.join(", ") + ", …]" +
      (tooBig.length ? " · next level " + tooBig[0].p + "/" + tooBig[0].q + " has too many bands to draw" : "");
    renderLevels(); renderTable(); drawFly(); drawStrip(); describeLevel();
  }
  function renderLevels() {
    var box = $("levels"); box.textContent = "";
    state.levels.forEach(function (L, i) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = L.p + "/" + L.q;
      b.setAttribute("aria-pressed", i === state.level ? "true" : "false");
      b.addEventListener("click", function () { state.level = i; renderLevels(); drawStrip(); describeLevel(); });
      box.appendChild(b);
    });
  }
  function renderTable() {
    var tb = $("tbl").querySelector("tbody"); tb.textContent = "";
    state.levels.forEach(function (L) {
      var tr = document.createElement("tr");
      [L.p + "/" + L.q, String(L.q), L.groups.sizes.length > 1 ? L.groups.sizes.join(" · ") : "one group", L.width.toFixed(4)].forEach(function (t, k) {
        var td = document.createElement("td"); td.textContent = t; if (k !== 1) td.className = "mono"; tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
  }

  // ---- sound ----
  var actx = null;
  function play() {
    var L = state.levels[state.level]; if (!L) return;
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    if (actx.state === "suspended") actx.resume();
    var t0 = actx.currentTime + 0.08, dur = Math.min(9, 2.5 + L.q * 0.05);
    var master = actx.createGain(); master.gain.value = 0.5; master.connect(actx.destination);
    L.b.forEach(function (bd) {
      var mid = (bd[0] + bd[1]) / 2, t = t0 + (mid + 4) / 8 * dur, f = 196 * Math.pow(2, (mid + 4) / 8 * 2.5);
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2);
    });
  }

  // ---- wiring ----
  function parseTerms(s) {
    var t = s.split(/[\s,;]+/).map(function (x) { return parseInt(x, 10); }).filter(function (x) { return x >= 1 && x < 100000; });
    return t.slice(0, 14);
  }
  function renderPresets(active) {
    var box = $("presets"); box.textContent = "";
    PRESETS.forEach(function (P, i) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = P.name; b.id = "preset" + i;
      b.setAttribute("aria-pressed", i === active ? "true" : "false");
      b.addEventListener("click", function () { $("termsInput").value = P.terms.join(", "); renderPresets(i); setNumber(P.terms, P.name); });
      box.appendChild(b);
    });
  }
  $("useTerms").addEventListener("click", function () { var t = parseTerms($("termsInput").value); if (t.length) { renderPresets(-1); setNumber(t, "your number"); } });
  $("termsInput").addEventListener("keydown", function (e) { if (e.key === "Enter") $("useTerms").click(); });
  $("play").addEventListener("click", play);
  function redraw() { drawFly(); drawStrip(); }
  if (window.matchMedia) { var mq = window.matchMedia("(prefers-color-scheme: dark)"); if (mq.addEventListener) mq.addEventListener("change", redraw); }
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);

  state.fly = computeFly();
  renderPresets(0);
  setNumber(PRESETS[0].terms, PRESETS[0].name);
})();
