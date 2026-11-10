/* kepler: ported from docs/papers/rhythm-of-numbers/instruments/kepler-figures-instrument.html by scripts/rhythm/port-instrument.py. Edit the source, then rerun. */
(function () {
  "use strict";
  var DEG = Math.PI / 180, YEAR = 365.25;
  // Periods in days. Planets: long-term mean motions (JPL, Standish and Williams, 3000 BC to 3000 AD); Pluto and moons: NASA
  // fact sheets; TRAPPIST-1: Agol et al. 2021. For the planets also: eccentricity, longitude of
  // perihelion and mean longitude at J2000 in degrees (JPL, Standish and Williams, mean elements for 1800 to 2050).
  var BODY = {
    Mercury: { T: 87.9693, e: 0.20563593, peri: 77.45779628, L0: 252.25032350 },
    Venus: { T: 224.7008, e: 0.00677672, peri: 131.60246718, L0: 181.97909950 },
    Earth: { T: 365.2564, e: 0.01671123, peri: 102.93768193, L0: 100.46457166 },
    Mars: { T: 686.9799, e: 0.09339410, peri: -23.94362959, L0: -4.55343205 },
    Jupiter: { T: 4332.5921, e: 0.04838624, peri: 14.72847983, L0: 34.39644051 },
    Saturn: { T: 10759.2171, e: 0.05386179, peri: 92.59887831, L0: 49.95424423 },
    Neptune: { T: 60188.0886 }, Pluto: { T: 90560 },
    Io: { T: 1.769138 }, Europa: { T: 3.551181 }, Ganymede: { T: 7.154553 },
    "TRAPPIST-1 b": { T: 1.510826 }, "TRAPPIST-1 c": { T: 2.421937 }
  };
  var PRESETS = [
    { a: "Jupiter", b: "Saturn", tag: "Kepler's trigon" }, { a: "Venus", b: "Earth", tag: "the five-pointed star" },
    { a: "Earth", b: "Mars" }, { a: "Earth", b: "Jupiter" }, { a: "Earth", b: "Saturn" }, { a: "Mercury", b: "Earth" },
    { a: "Io", b: "Europa", tag: "a locked pair" }, { a: "Neptune", b: "Pluto", tag: "locked at 3 to 2" }, { a: "TRAPPIST-1 b", b: "TRAPPIST-1 c" }
  ];
  var START_YEAR = 1583;   // the first meeting on Kepler's own diagram
  var ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  var $ = function (id) { return document.getElementById(id); };
  function css(name) { return getComputedStyle(document.querySelector(".rni")).getPropertyValue(name).trim(); }
  function frac(x) { return x - Math.floor(x); }
  function fmt(x, d) { return x.toFixed(d); }

  var S = null;            // the current system
  var run = { playing: false, t: 0, marks: [], k: 0, nextT: 0, last: 0, mode: "circ", rung: 0 };

  // ---- continued fraction of the step ----
  function ladder(alpha) {
    var terms = [], x = alpha, i;
    for (i = 0; i < 9; i++) { var a = Math.floor(x + 1e-12); terms.push(a); x -= a; if (x < 1e-9) break; x = 1 / x; if (x > 1e7) break; }
    var rungs = [], p0 = 1, q0 = 0, p1 = terms[0], q1 = 1;
    for (i = 1; i < terms.length; i++) {
      var p2 = terms[i] * p1 + p0, q2 = terms[i] * q1 + q0; p0 = p1; q0 = q1; p1 = p2; q1 = q2;
      if (q1 > 2000) break;
      rungs.push({ p: p1, q: q1, next: i + 1 < terms.length ? terms[i + 1] : null });
    }
    return { terms: terms, rungs: rungs };
  }

  // ---- Kepler's equation: position on an ellipse at mean anomaly M ----
  function kepler(M, e) {
    var E = M + e * Math.sin(M), i;
    for (i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    var nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
    return { nu: nu, r: 1 - e * Math.cos(E), speed: Math.sqrt(1 - e * e) / Math.pow(1 - e * Math.cos(E), 2) };
  }
  // longitude (radians), distance (in units of the mean distance) and angular speed (in units of the mean) at time t
  function place(body, t, ell) {
    var L = (body.L0 + 360 * t / body.T) * DEG;
    if (!ell) return { lon: L, r: 1, speed: 1 };
    var k = kepler(L - body.peri * DEG, body.e);
    return { lon: k.nu + body.peri * DEG, r: k.r, speed: k.speed };
  }
  function wrap(x) { x = x % (2 * Math.PI); if (x > Math.PI) x -= 2 * Math.PI; if (x < -Math.PI) x += 2 * Math.PI; return x; }
  // time of meeting number k (k = 0 is the first after the start)
  function meeting(k) {
    var tm = S.t0 + k * S.syn;
    if (run.mode !== "ell") return { t: tm, lon: (S.out.L0 + 360 * tm / S.out.T) * DEG };
    var lo = tm - S.syn * 0.3, hi = tm + S.syn * 0.3, i, g = function (t) { return wrap(place(S.inn, t, true).lon - place(S.out, t, true).lon); };
    for (i = 0; i < 50; i++) { var mid = (lo + hi) / 2; if (g(mid) < 0) lo = mid; else hi = mid; }
    var t = (lo + hi) / 2; return { t: t, lon: place(S.out, t, true).lon };
  }

  function setSystem(inn, out, names, opts) {
    var r = out.T / inn.T, syn = inn.T * out.T / (out.T - inn.T), step = frac(1 / (r - 1));
    var dated = inn.L0 !== undefined && out.L0 !== undefined;
    var I = { T: inn.T, e: inn.e || 0, peri: inn.peri || 0, L0: dated ? inn.L0 : 0 }, O = { T: out.T, e: out.e || 0, peri: out.peri || 0, L0: dated ? out.L0 : 0 };
    var years = opts.years, unit = years ? "years" : (opts.unit || "days"), div = years ? YEAR : 1;
    var start = dated ? (START_YEAR - 2000) * YEAR : 0;
    // first mean meeting at or after the start
    var rel = 360 / I.T - 360 / O.T, gap = (((O.L0 - I.L0) % 360) + 360) % 360, t0 = gap / rel;
    t0 += Math.ceil((start - t0) / syn - 1e-9) * syn;
    S = { inn: I, out: O, names: names, r: r, syn: syn, step: step, lad: ladder(step), dated: dated, unit: unit, div: div, start: start, t0: t0,
          ellOK: dated && inn.e !== undefined && out.e !== undefined, tag: opts.tag || "" };
    if (!S.ellOK) run.mode = "circ";
    // default rung: among figures with at most 12 points, the one followed by the largest term (the slowest to turn)
    run.rung = 0;
    for (var i = 0, best = -1; i < S.lad.rungs.length; i++) { var g = S.lad.rungs[i]; if (g.q <= 12 && g.next !== null && g.next >= best) { best = g.next; run.rung = i; } }
    restart(); describe(); buildTable();
  }
  function restart() {
    run.marks = []; run.k = 0; run.t = S.dated ? S.start : S.t0 - S.syn * 0.35;
    if (run.t > S.t0 - S.syn * 0.05) run.t = S.t0 - S.syn * 0.35;
    run.next = meeting(0); live(); draw();
  }
  function addMark() {
    run.marks.push(run.next); if (run.marks.length > 1500) run.marks.shift();
    run.k++; run.next = meeting(run.k); bell();
  }

  function yearOf(t) { return 2000 + t / YEAR; }
  function span(t) { var v = t / S.div; return (v >= 1000 ? fmt(v, 0) : v >= 100 ? fmt(v, 1) : fmt(v, 2)) + " " + S.unit; }
  function figureName(p, q) {
    if (q === 1) return "one place";
    if (q === 2) return "two opposite places";
    var j = Math.min(p % q, q - (p % q));
    if (q === 3) return "3 points, a triangle";
    if (q === 5 && j === 2) return "5 points, a five-pointed star";
    return q + " points, " + (j === 1 ? "a polygon" : "a star, joined " + j + " apart");
  }
  function describe() {
    var t = S.lad.terms;
    $("numLine").innerHTML = "<b>" + S.names[0] + "</b> and <b>" + S.names[1] + "</b>" + (S.tag ? " · " + S.tag : "") +
      " · periods in the ratio " + fmt(S.r, 5) + " · they meet every " + span(S.syn) +
      " · each meeting is <span class='g'>" + fmt(S.step, 6) + "</span> of a turn (" + fmt(S.step * 360, 2) + "°) beyond the last" +
      (t.length > 1 ? " · step = [0; " + t.slice(1).join(", ") + ", …]" : " · the periods are in an exact whole-number ratio, so every meeting falls in the same place");
    $("mEll").disabled = !S.ellOK;
    $("mCirc").setAttribute("aria-pressed", String(run.mode === "circ")); $("mEll").setAttribute("aria-pressed", String(run.mode === "ell"));
    $("skyCap").textContent = (S.dated ? "The view is from above the Sun; the ring is the zodiac, 0° at the right. The count starts in 1583, twelve years before Kepler drew the triangle for his class. " : "The view is from above the central body. ") +
      (S.ellOK ? "With ellipses the bodies speed up and slow down as Kepler's second law requires, and the meeting places wander about the tidy figure." : "This pair is shown with steady circular motion only.");
  }
  function buildTable() {
    var tb = $("tbl").tBodies[0]; tb.innerHTML = "";
    if (!S.lad.rungs.length) { var r0 = tb.insertRow(), c0 = r0.insertCell(); c0.colSpan = 6; c0.textContent = "No ladder: the step is a whole number of turns. The figure is a single place that never moves."; }
    S.lad.rungs.forEach(function (g, i) {
      var d = g.q * S.step - g.p, rounds = 1 / (g.q * g.q * Math.abs(S.step - g.p / g.q)), tr = document.createElement("tr");
      if (i === run.rung) tr.className = "on";
      var cells = ["", figureName(g.p, g.q), span(g.q * S.syn), (d >= 0 ? "+" : "−") + fmt(Math.abs(d) * 360, 2) + "°",
        isFinite(rounds) && rounds < 1e6 ? fmt(rounds, 2) + " (" + span(rounds * g.q * S.syn) + ")" : "never", g.next === null ? "…" : String(g.next)];
      cells.forEach(function (c, j) {
        var td = document.createElement("td");
        if (j === 0) { var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = g.p + "/" + g.q; b.setAttribute("aria-pressed", String(i === run.rung));
          b.addEventListener("click", function () { run.rung = i; buildTable(); draw(); live(); }); td.appendChild(b); }
        else { td.textContent = c; if (j >= 2) td.className = "mono"; }
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
  }
  function live() {
    var n = run.k, g = S.lad.rungs[run.rung], s = "meetings drawn: <b>" + n + "</b>";
    if (g) s += " · rounds of " + g.q + ": <b>" + Math.floor(n / g.q) + "</b>";
    if (n) {
      var el = run.marks[run.marks.length - 1].t - S.t0; s += " · time since the first: " + span(el);
      if (S.dated) { var ys = run.marks.slice(-4).map(function (m) { return Math.floor(yearOf(m.t)); }); s += " · latest: <span class='g'>" + ys.join(", ") + "</span>"; }
      if (g && n > g.q) { var turn = (n - 1) * (g.q * S.step - g.p) / g.q * 360; s += " · the figure has turned " + fmt(Math.abs(turn), 1) + "°"; }
    }
    $("liveLine").innerHTML = s;
  }

  // ---- drawing ----
  function draw() {
    var cv = $("sky"), c = cv.getContext("2d"), W = cv.width, cx = W / 2, cy = W / 2, R = W * 0.43;
    var ink = css("--ink"), muted = css("--muted"), line = css("--line"), band = css("--band"), soft = css("--band-soft"), gold = css("--gold"), sun = css("--sun");
    var ell = run.mode === "ell";
    c.clearRect(0, 0, W, W);
    function pt(lon, rad) { return [cx + rad * Math.cos(lon), cy - rad * Math.sin(lon)]; }
    // zodiac ring
    c.lineWidth = 2; c.strokeStyle = line; c.beginPath(); c.arc(cx, cy, R, 0, 2 * Math.PI); c.stroke();
    c.fillStyle = muted; c.font = "500 " + Math.round(W * 0.026) + "px 'Segoe UI Symbol','Apple Symbols','Noto Sans Symbols 2',sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    for (var z = 0; z < 12; z++) {
      var a0 = z * 30 * DEG, t1 = pt(a0, R), t2 = pt(a0, R * 1.03); c.beginPath(); c.moveTo(t1[0], t1[1]); c.lineTo(t2[0], t2[1]); c.stroke();
      var zp = pt(a0 + (S.dated ? 15 : 0) * DEG, R * 1.09); c.fillText(S.dated ? ZODIAC[z] + "︎" : String(z * 30) + "°", zp[0], zp[1]);
    }
    // orbits
    var ratio = Math.max(Math.pow(S.inn.T / S.out.T, 2 / 3), 0.12), Ro = R * 0.80 / (1 + (ell ? S.out.e : 0)), Ri = Ro * ratio;
    function orbit(body, rad) {
      c.beginPath();
      for (var i = 0; i <= 180; i++) {
        var nu = i * 2 * DEG, rr = ell ? rad * (1 - body.e * body.e) / (1 + body.e * Math.cos(nu)) : rad, q = pt(nu + (ell ? body.peri * DEG : 0), rr);
        if (i) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]);
      }
      c.strokeStyle = line; c.lineWidth = 2; c.stroke();
    }
    orbit(S.out, Ro); orbit(S.inn, Ri);
    // meetings: spokes, chords, dots. Colour by round of the chosen rung.
    var g = S.lad.rungs[run.rung], q = g ? g.q : 1, n = run.marks.length, first = run.k - n, curRound = Math.floor((run.k - 1) / q), i;
    for (i = 0; i < n; i++) {
      var m = run.marks[i], idx = first + i, age = curRound - Math.floor(idx / q), isNow = age === 0;
      var alpha = isNow ? 1 : Math.max(0.10, 0.75 * Math.pow(0.90, age - 1));
      var P = pt(m.lon, R);
      if (i > 0) { var Q = pt(run.marks[i - 1].lon, R); c.globalAlpha = alpha; c.strokeStyle = isNow ? gold : band; c.lineWidth = isNow ? 4 : 2.5; c.beginPath(); c.moveTo(Q[0], Q[1]); c.lineTo(P[0], P[1]); c.stroke(); }
      c.globalAlpha = alpha; c.fillStyle = isNow ? gold : band; c.beginPath(); c.arc(P[0], P[1], isNow ? 9 : 6, 0, 2 * Math.PI); c.fill();
    }
    c.globalAlpha = 1;
    if (n && S.dated) {
      c.fillStyle = ink; c.font = "500 " + Math.round(W * 0.022) + "px 'JetBrains Mono', ui-monospace, monospace";
      for (i = Math.max(0, n - Math.min(q, 5)); i < n; i++) { var lp = pt(run.marks[i].lon, R * 0.90); c.fillText(String(Math.floor(yearOf(run.marks[i].t))), lp[0], lp[1]); }
    }
    // the two bodies and the line through them
    var a = place(S.inn, run.t, ell), b = place(S.out, run.t, ell), A = pt(a.lon, Ri * a.r), B = pt(b.lon, Ro * b.r);
    var near = Math.abs(wrap(a.lon - b.lon)) < 0.06;
    if (near) { var E2 = pt(b.lon, R); c.strokeStyle = gold; c.lineWidth = 2; c.setLineDash([8, 8]); c.beginPath(); c.moveTo(cx, cy); c.lineTo(E2[0], E2[1]); c.stroke(); c.setLineDash([]); }
    c.fillStyle = sun; c.beginPath(); c.arc(cx, cy, 13, 0, 2 * Math.PI); c.fill();
    c.fillStyle = ink; c.beginPath(); c.arc(A[0], A[1], 9, 0, 2 * Math.PI); c.fill(); c.beginPath(); c.arc(B[0], B[1], 12, 0, 2 * Math.PI); c.fill();
    c.fillStyle = muted; c.font = "500 " + Math.round(W * 0.021) + "px Inter, 'Segoe UI', sans-serif"; c.textAlign = "left";
    if (!near) { c.fillText(S.names[0], A[0] + 14, A[1] - 14); c.fillText(S.names[1], B[0] + 17, B[1] - 17); }
    if (S.dated) { c.textAlign = "left"; c.fillStyle = muted; c.font = "500 " + Math.round(W * 0.024) + "px 'JetBrains Mono', ui-monospace, monospace"; c.fillText("year " + Math.floor(yearOf(run.t)), W * 0.02, W * 0.035); }
    tones(a.speed, b.speed);
  }

  // ---- animation ----
  function rate() { var v = +$("speed").value / 100; return 0.15 * Math.pow(200, v); }   // meetings per second
  function tick(now) {
    if (!run.playing) return;
    var dt = Math.min(0.1, (now - run.last) / 1000); run.last = now;
    run.t += dt * rate() * S.syn;
    var added = 0; while (run.t >= run.next.t && added < 400) { addMark(); added++; }
    if (added) live();
    draw(); requestAnimationFrame(tick);
  }
  function setPlaying(on) {
    run.playing = on; $("play").textContent = on ? "❚❚ Pause" : "▶ Play";
    if (on) { run.last = performance.now(); requestAnimationFrame(tick); } else tones(0, 0);
  }

  // ---- sound: each body sings at its angular speed, as in Harmonices Mundi; a bell marks each meeting ----
  var au = null;
  function audioOn() { return au && au.on; }
  function startAudio() {
    if (!au) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      var ctx = new AC(), g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination);
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(); o1.type = "sine"; o2.type = "sine"; o1.connect(g); o2.connect(g); o1.start(); o2.start();
      au = { ctx: ctx, g: g, o1: o1, o2: o2, on: false };
    }
    au.ctx.resume(); au.on = true;
  }
  function tones(sIn, sOut) {
    if (!audioOn()) { if (au) au.g.gain.setTargetAtTime(0, au.ctx.currentTime, 0.05); return; }
    var live_ = run.playing && sIn > 0, base = 165, up = S.r; while (up >= 4) up /= 2;
    au.g.gain.setTargetAtTime(live_ ? 0.05 : 0, au.ctx.currentTime, 0.08);
    if (live_) { au.o2.frequency.setTargetAtTime(base * sOut, au.ctx.currentTime, 0.03); au.o1.frequency.setTargetAtTime(base * up * sIn, au.ctx.currentTime, 0.03); }
  }
  function bell() {
    if (!audioOn() || !run.playing || rate() > 12) return;
    var t = au.ctx.currentTime, o = au.ctx.createOscillator(), g = au.ctx.createGain();
    o.type = "sine"; o.frequency.value = 1320; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g); g.connect(au.ctx.destination); o.start(t); o.stop(t + 0.55);
  }

  // ---- controls ----
  function choose(i) {
    var p = PRESETS[i], planets = BODY[p.a].L0 !== undefined || p.a === "Neptune";
    Array.prototype.forEach.call($("presets").children, function (b, j) { b.setAttribute("aria-pressed", String(j === i)); });
    setSystem(BODY[p.a], BODY[p.b], [p.a, p.b], { years: planets, tag: p.tag });
  }
  PRESETS.forEach(function (p, i) {
    var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = p.a.replace("TRAPPIST-1 ", "TRAPPIST-1 ") + " & " + p.b.replace("TRAPPIST-1 ", "");
    b.addEventListener("click", function () { choose(i); }); $("presets").appendChild(b);
  });
  $("usePeriods").addEventListener("click", function () {
    var a = parseFloat($("p1").value), b = parseFloat($("p2").value);
    if (!(a > 0) || !(b > 0) || a === b) { $("numLine").textContent = "Enter two different positive periods, in the same unit."; return; }
    if (a > b) { var s = a; a = b; b = s; }
    Array.prototype.forEach.call($("presets").children, function (c) { c.setAttribute("aria-pressed", "false"); });
    setSystem({ T: a }, { T: b }, ["inner", "outer"], { years: false, unit: "units" });
  });
  $("play").addEventListener("click", function () { setPlaying(!run.playing); });
  $("step").addEventListener("click", function () { setPlaying(false); run.t = run.next.t; addMark(); live(); draw(); });
  $("skip").addEventListener("click", function () { for (var i = 0; i < 50; i++) { run.t = run.next.t; addMark(); } live(); draw(); });
  $("reset").addEventListener("click", function () { restart(); });
  function setMode(m) { if (m === "ell" && !S.ellOK) return; run.mode = m; describe(); restart(); }
  $("mCirc").addEventListener("click", function () { setMode("circ"); });
  $("mEll").addEventListener("click", function () { setMode("ell"); });
  $("sound").addEventListener("click", function () {
    if (audioOn()) { au.on = false; tones(0, 0); } else startAudio();
    var on = audioOn(); this.setAttribute("aria-pressed", String(on)); this.textContent = "Sound: " + (on ? "on" : "off");
  });
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  if (mq && mq.addEventListener) mq.addEventListener("change", function () { draw(); });
  if (window.MutationObserver) new MutationObserver(function () { draw(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  window.__kepler = { state: function () { return { step: S.step, terms: S.lad.terms, rungs: S.lad.rungs, syn: S.syn, k: run.k, marks: run.marks.slice(-8), mode: run.mode }; } };

  choose(0);
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!calm) setPlaying(true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
})();
