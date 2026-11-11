/* The Tide Machine (Chapter 19 of the paper): the tide as a sum of five steady waves (tidal constituents).
   Periods in hours are the standard ones: M2 12.4206012, S2 12, N2 12.65834751, K1 23.93447213, O1 25.81933871.
   The heights are examples only.  Our own code. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var root = document.querySelector(".rni");
  function css(n) { return getComputedStyle(root).getPropertyValue(n).trim(); }
  var W = [
    { k: "M2", why: "the Moon, twice a day", T: 12.4206012, a: 1.0 },
    { k: "S2", why: "the Sun, twice a day", T: 12.0, a: 0.46 },
    { k: "N2", why: "the Moon's changing distance", T: 12.65834751, a: 0.19 },
    { k: "K1", why: "the tilt of the Moon's and Sun's paths, once a day", T: 23.93447213, a: 0.1 },
    { k: "O1", why: "the tilt of the Moon's path, once a day", T: 25.81933871, a: 0.07 }
  ];
  var PRE = [
    { name: "Twice a day", a: [1, 0.46, 0.19, 0.1, 0.07] }, { name: "Moon only", a: [1, 0, 0, 0, 0] }, { name: "Moon and Sun", a: [1, 0.46, 0, 0, 0] },
    { name: "Moon near and far", a: [1, 0, 0.19, 0, 0] }, { name: "Mixed", a: [0.5, 0.2, 0.1, 0.4, 0.3] }, { name: "Once a day", a: [0.1, 0.05, 0, 0.5, 0.4] }
  ];
  var DAYS = 30, parts = false, playing = false, t0 = 0, actx = null, nodes = [], SEC = 12;
  var cv = $("tdCan"), ctx = cv.getContext("2d");
  function h(tHours) { var s = 0; W.forEach(function (w) { s += w.a * Math.cos(2 * Math.PI * tHours / w.T); }); return s; }
  function fmtT(T) { var hh = Math.floor(T), mm = Math.round((T - hh) * 60); return hh + " h " + (mm < 10 ? "0" : "") + mm + " min"; }
  function table() {
    var tb = $("tdTbl").querySelector("tbody"); tb.innerHTML = "";
    W.forEach(function (w, i) {
      var tr = document.createElement("tr");
      [w.k, w.why, fmtT(w.T)].forEach(function (t, j) { var td = document.createElement("td"); td.textContent = t; if (j === 0) td.className = "mono"; tr.appendChild(td); });
      var td = document.createElement("td"), s = document.createElement("input"); s.type = "range"; s.min = 0; s.max = 1; s.step = 0.01; s.value = w.a; s.setAttribute("aria-label", "Height of " + w.k);
      s.addEventListener("input", function () { w.a = +s.value; mark(-1); draw(); live(); }); td.appendChild(s); tr.appendChild(td); tb.appendChild(tr);
    });
    var tb2 = $("tdBeats").querySelector("tbody"); tb2.innerHTML = "";
    [[0, 1, "half a month of the Moon's phases: spring and neap tides"], [0, 2, "the month from closest Moon to closest Moon"], [3, 4, "half a month of the Moon's swing north and south"]].forEach(function (b) {
      var d = 1 / Math.abs(1 / W[b[0]].T - 1 / W[b[1]].T) / 24, tr = document.createElement("tr");
      [W[b[0]].k + " and " + W[b[1]].k, d.toFixed(2) + " days", b[2]].forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); }); tb2.appendChild(tr);
    });
  }
  function mark(i) { [].forEach.call($("tdPresets").children, function (b, j) { b.setAttribute("aria-pressed", String(i === j)); }); }
  function draw() {
    var w = cv.width, H = cv.height, x0 = 60, x1 = w - 20, mid = H * 0.52, tot = 0.001, i, d;
    W.forEach(function (c) { tot += c.a; });
    var sc = (H * 0.42) / tot;
    ctx.clearRect(0, 0, w, H); ctx.fillStyle = css("--surface"); ctx.fillRect(0, 0, w, H);
    ctx.strokeStyle = css("--line"); ctx.lineWidth = 2; ctx.fillStyle = css("--muted"); ctx.font = "24px system-ui,sans-serif"; ctx.textAlign = "center";
    for (d = 0; d <= DAYS; d += 5) { var X = x0 + d / DAYS * (x1 - x0); ctx.beginPath(); ctx.moveTo(X, 30); ctx.lineTo(X, H - 44); ctx.stroke(); ctx.fillText("day " + d, X, H - 14); }
    /* the Moon's phase along the top: new at 0, full at 14.77 */
    for (d = 0; d <= DAYS; d += 29.530588853 / 4) { var Xm = x0 + d / DAYS * (x1 - x0), ph = Math.round(d / (29.530588853 / 4)) % 4; ctx.fillText(["●", "◐", "○", "◑"][ph], Xm, 26); }
    ctx.textAlign = "left";
    ctx.beginPath(); ctx.moveTo(x0, mid); ctx.lineTo(x1, mid); ctx.stroke();
    if (parts) W.forEach(function (c, j) {
      if (c.a <= 0) return; ctx.strokeStyle = [css("--band-soft"), css("--gold"), css("--muted"), css("--focus"), css("--line")][j]; ctx.lineWidth = 1.5; ctx.beginPath();
      for (i = 0; i <= 1500; i++) { var t = i / 1500 * DAYS * 24; ctx.lineTo(x0 + i / 1500 * (x1 - x0), mid - sc * c.a * Math.cos(2 * Math.PI * t / c.T)); } ctx.stroke();
    });
    ctx.strokeStyle = css("--band"); ctx.lineWidth = 3; ctx.beginPath();
    for (i = 0; i <= 3000; i++) { var tt = i / 3000 * DAYS * 24; ctx.lineTo(x0 + i / 3000 * (x1 - x0), mid - sc * h(tt)); }
    ctx.stroke();
    if (playing) { var f = (performance.now() - t0) / 1000 / SEC; if (f <= 1) { ctx.strokeStyle = css("--gold"); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0 + f * (x1 - x0), 30); ctx.lineTo(x0 + f * (x1 - x0), H - 44); ctx.stroke(); } }
  }
  function live() {
    var hi = -9, lo = 9, i; for (i = 0; i <= 6000; i++) { var v = h(i / 6000 * DAYS * 24); if (v > hi) hi = v; if (v < lo) lo = v; }
    var semi = W[0].a + W[1].a + W[2].a, di = W[3].a + W[4].a;
    $("tdLine").innerHTML = "Highest <b>" + hi.toFixed(2) + "</b>, lowest <b>" + lo.toFixed(2) + "</b> · " + (di > 3 * semi ? "mostly one high tide a day" : di > 0.25 * semi ? "mixed: two unequal high tides a day" : "two high tides a day") + (W[0].a > 0 && W[1].a > 0 ? " · spring tides reach " + (W[0].a + W[1].a).toFixed(2) + ", neap tides only " + Math.abs(W[0].a - W[1].a).toFixed(2) + ", from the Moon and Sun alone" : "");
  }
  function stop() { nodes.forEach(function (n) { try { n.stop(); } catch (e) { } }); nodes = []; playing = false; $("tdPlay").textContent = "▶ Hear the month"; draw(); }
  function play() {
    if (playing) { stop(); return; }
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    var c = DAYS * 86400 / SEC, f0 = 1 / (W[0].T * 3600), now = actx.currentTime, tot = 0.001; W.forEach(function (w) { tot += w.a; });
    var master = actx.createGain(); master.gain.setValueAtTime(0.0001, now); master.gain.exponentialRampToValueAtTime(0.5, now + 0.05); master.gain.setValueAtTime(0.5, now + SEC - 0.1); master.gain.exponentialRampToValueAtTime(0.0001, now + SEC); master.connect(actx.destination);
    W.forEach(function (w, j) {
      if (w.a <= 0) return; var o = actx.createOscillator(), g = actx.createGain(), fr = 1 / (w.T * 3600), base = j < 3 ? 220 : 110, ref = j < 3 ? f0 : f0 / 2;
      o.frequency.value = base + (fr - ref) * c; g.gain.value = 0.6 * w.a / tot; o.connect(g); g.connect(master); o.start(now); o.stop(now + SEC + 0.05); nodes.push(o);
    });
    playing = true; t0 = performance.now(); $("tdPlay").textContent = "■ Stop";
    (function loop() { if (!playing) return; if ((performance.now() - t0) / 1000 > SEC) { stop(); return; } draw(); requestAnimationFrame(loop); })();
  }
  PRE.forEach(function (P, i) { var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = P.name; b.setAttribute("aria-pressed", String(i === 0)); b.addEventListener("click", function () { P.a.forEach(function (a, j) { W[j].a = a; }); mark(i); table(); draw(); live(); }); $("tdPresets").appendChild(b); });
  $("tdPlay").addEventListener("click", play);
  $("tdParts").addEventListener("click", function () { parts = !parts; this.setAttribute("aria-pressed", String(parts)); draw(); });
  if (window.MutationObserver) new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  table(); draw(); live();
})();
