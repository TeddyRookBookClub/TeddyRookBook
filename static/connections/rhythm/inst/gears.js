/* Huygens's Gears (Chapter 19 of the paper): the convergents of the ratio of two periods as pairs of gear wheels.
   Periods: JPL mean periods for the planets (days); synodic month 29.530588853 d, draconic month 27.212220817 d,
   sidereal month 27.321661547 d, tropical year 365.2421897 d.  Our own code. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var root = document.querySelector(".rni");
  function css(n) { return getComputedStyle(root).getPropertyValue(n).trim(); }
  var PRE = [
    { name: "Saturn's year (Huygens's figures)", A: 77708431, B: 2640858, big: "Saturn goes round once", small: "years", pick: 206, note: "Huygens wrote the ratio as 77,708,431 to 2,640,858 and cut wheels of 206 and 7 teeth." },
    { name: "Saturn's year (today's figures)", A: 10759.2171, B: 365.2564, big: "Saturn goes round once", small: "years", note: "With today's value, 29.457 years, the fourth pair is 324 and 11, not 206 and 7." },
    { name: "Months in a year (Meton)", A: 365.2421897, B: 29.530588853, big: "one year", small: "months of the Moon's phases", pick: 235, note: "235 months in 19 years is the Metonic cycle." },
    { name: "Eclipses (the Saros)", A: 29.530588853, B: 27.212220817, big: "one month of phases", small: "trips of the Moon through its path's crossing point", pick: 242, note: "242 against 223 is the Saros: eclipses repeat after 223 months." },
    { name: "Leap years", A: 365.2421897, B: 1, frac: true, big: "one year", small: "days over 365", pick: 8, note: "1 extra day in 4 years is the Julian rule; 8 in 33 is the Persian rule." },
    { name: "Jupiter's year", A: 4332.5921, B: 365.2564, big: "Jupiter goes round once", small: "years", note: "" },
    { name: "Mars's year", A: 686.9799, B: 365.2564, big: "Mars goes round once", small: "years", note: "" },
    { name: "The Moon against the stars", A: 365.2421897, B: 27.321661547, big: "one year", small: "trips of the Moon round the sky", pick: 254, note: "254 trips in 19 years is a wheel pair in the Antikythera mechanism." }
  ];
  var S = { r: 1, P: PRE[0], rungs: [], sel: 0, ang: 0, playing: false, last: 0 };
  var cv = $("ggCan"), ctx = cv.getContext("2d");
  function ladder(x) {
    var out = [], terms = [], h0 = 0, h1 = 1, k0 = 1, k1 = 0, y = x, i;
    for (i = 0; i < 9; i++) { var a = Math.floor(y + 1e-11); terms.push(a); var h = a * h1 + h0, k = a * k1 + k0; h0 = h1; h1 = h; k0 = k1; k1 = k; out.push({ p: h, q: k }); y -= a; if (y < 1e-9 || k > 20000) break; y = 1 / y; }
    for (i = 0; i < out.length; i++) out[i].next = terms[i + 1];
    return out.filter(function (r) { return r.p > 0 && r.q > 0; });
  }
  function setRatio(P) {
    S.P = P; S.r = P.frac ? (P.A / P.B) % 1 : P.A / P.B; S.rungs = ladder(S.r);
    S.sel = Math.min(S.rungs.length - 1, Math.max(0, S.rungs.findIndex(function (r) { return r.q >= 5 || r.p >= 60; })));
    if (S.sel < 0) S.sel = S.rungs.length - 1;
    if (P.pick) { var k = S.rungs.findIndex(function (r) { return r.p === P.pick; }); if (k >= 0) S.sel = k; }
    $("ggLine").innerHTML = "The ratio is <b>" + S.r.toPrecision(9) + "</b> " + (P.frac ? "(the part of a day by which a year is longer than 365 days)" : "(" + (P.small || "turns of the fast wheel") + " for " + (P.big || "one turn of the slow wheel") + ")") + (P.note ? " · <span class=\"g\">" + P.note + "</span>" : "");
    table(); describe(); draw();
  }
  function table() {
    var tb = $("ggTbl").querySelector("tbody"); tb.innerHTML = "";
    S.rungs.forEach(function (r, i) {
      var tr = document.createElement("tr"), err = Math.abs(r.p / r.q - S.r), b = document.createElement("button"), td0 = document.createElement("td");
      b.type = "button"; b.className = "chip"; b.textContent = r.p + " and " + r.q; b.setAttribute("aria-pressed", String(i === S.sel)); b.addEventListener("click", function () { S.sel = i; table(); describe(); draw(); });
      td0.appendChild(b); tr.appendChild(td0);
      [(r.p / r.q).toPrecision(9), err < 1e-12 ? "nothing we can measure" : err.toExponential(2), err < 1e-12 ? "never" : fmt(1 / err) + " turns of the slow wheel", r.next == null ? "" : String(r.next)].forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); });
      tb.appendChild(tr);
    });
  }
  function fmt(x) { return x >= 1e6 ? (x / 1e6).toPrecision(3) + " million" : x >= 100 ? Math.round(x).toLocaleString("en-US") : x.toPrecision(3); }
  function describe() {
    var r = S.rungs[S.sel]; if (!r) return; var err = Math.abs(r.p / r.q - S.r);
    $("ggTitle").textContent = "Wheels of " + r.p + " and " + r.q + " teeth";
    $("ggLive").textContent = "The small wheel turns " + r.p + " times while the large one turns " + r.q + (r.q === 1 ? " time" : " times") + ": " + (r.p / r.q).toPrecision(8) + " against the true " + S.r.toPrecision(8) + (err < 1e-12 ? "" : " · a whole turn out after " + fmt(1 / err) + " turns of the slow wheel");
  }
  function gear(cx, cy, R, teeth, ang, col) {
    var n = Math.min(teeth, 360), d = Math.max(4, Math.min(22, Math.PI * R / n * 0.9)), i;
    ctx.strokeStyle = col; ctx.fillStyle = css("--surface"); ctx.lineWidth = 3; ctx.beginPath();
    if (teeth <= 360) for (i = 0; i < n; i++) { var a0 = ang + i / n * 2 * Math.PI, st = Math.PI / n; [[a0 - st * 0.5, R - d / 2], [a0 - st * 0.2, R + d / 2], [a0 + st * 0.2, R + d / 2], [a0 + st * 0.5, R - d / 2]].forEach(function (q) { ctx.lineTo(cx + q[1] * Math.cos(q[0]), cy + q[1] * Math.sin(q[0])); }); }
    else ctx.arc(cx, cy, R, 0, 7);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (R - d) * Math.cos(ang), cy + (R - d) * Math.sin(ang)); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 7); ctx.fill();
    ctx.font = "600 30px system-ui,sans-serif"; ctx.textAlign = "center"; ctx.fillText(String(teeth), cx, cy + R + d + 38 > cv.height ? cy - 20 : cy + 50);
  }
  function draw() {
    var r = S.rungs[S.sel], w = cv.width, h = cv.height; ctx.clearRect(0, 0, w, h); ctx.fillStyle = css("--surface"); ctx.fillRect(0, 0, w, h);
    if (!r) return;
    /* the large wheel has p teeth and turns slowly; the small has q teeth; radii in proportion to teeth */
    var big = Math.max(r.p, r.q), sm = Math.min(r.p, r.q), tot = big + sm, span = Math.min(w - 120, (h - 140) * tot / big), Rb = span * big / tot / 2, Rs = span * sm / tot / 2;
    Rs = Math.max(Rs, 14); var x0 = (w - 2 * (Rb + Rs)) / 2 + Rb, cy = h / 2;
    gear(x0, cy, Rb, big, S.ang, css("--band"));
    gear(x0 + Rb + Rs, cy, Rs, sm, -S.ang * big / sm + Math.PI + (sm % 2 ? 0 : Math.PI / sm), css("--gold"));
  }
  function frame(now) { if (!S.playing) return; var dt = Math.min(0.05, (now - S.last) / 1000); S.last = now; var r = S.rungs[S.sel], big = Math.max(r.p, r.q), sm = Math.min(r.p, r.q); S.ang += dt * 1.6 * sm / big; draw(); requestAnimationFrame(frame); }
  PRE.forEach(function (P, i) { var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = P.name; b.setAttribute("aria-pressed", String(i === 0)); b.addEventListener("click", function () { mark(i); setRatio(P); }); $("ggPresets").appendChild(b); });
  function mark(i) { [].forEach.call($("ggPresets").children, function (b, j) { b.setAttribute("aria-pressed", String(i === j)); }); }
  $("ggUse").addEventListener("click", function () { var A = parseFloat($("ggA").value), B = parseFloat($("ggB").value); if (!(A > 0 && B > 0)) return; if (A < B) { var t = A; A = B; B = t; } mark(-1); setRatio({ A: A, B: B, big: "one turn of the slow wheel", small: "turns of the fast wheel", note: "" }); });
  $("ggPlay").addEventListener("click", function () { S.playing = !S.playing; this.textContent = S.playing ? "❚❚ Pause" : "▶ Turn the wheels"; if (S.playing) { S.last = performance.now(); requestAnimationFrame(frame); } });
  if (window.MutationObserver) new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  setRatio(PRE[0]);
})();
