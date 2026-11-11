/* Newton's Rosette (Chapter 19 of the paper): an orbit under a central pull that weakens as r^(-p).
   Units: the body starts at its closest point, r = 1, with speed sqrt(1 + s) times the speed of a circular orbit there.
   The path is integrated with a fourth-order Runge-Kutta step; the angle from one closest approach to the next is
   measured on a separate, finer integration.  Our own code. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var root = document.querySelector(".rni");
  function css(n) { return getComputedStyle(root).getPropertyValue(n).trim(); }
  var PRE = [
    { name: "Newton: inverse square", p: 2 }, { name: "A spring (Hooke)", p: -1 }, { name: "Constant pull", p: 0 },
    { name: "Inverse distance", p: 1 }, { name: "A little steeper: 2.1", p: 2.1 }, { name: "Power 2.75", p: 2.75 },
    { name: "Mercury's shift, a million times bigger", p: 2.16 }
  ];
  var S = { p: 2, s: 0.45 }, st, run = { playing: false, sound: false, last: 0, peri: [], laps: 0 }, actx = null;
  var cv = $("rsCan"), ctx = cv.getContext("2d"), trail = document.createElement("canvas"), tctx = trail.getContext("2d");
  trail.width = cv.width; trail.height = cv.height;

  function smax() { return S.p > 1 ? Math.min(0.8, 0.9 * (2 / (S.p - 1) - 1)) : 0.8; }
  function acc(x, y) { var r2 = x * x + y * y, r = Math.sqrt(r2), f = Math.pow(r, -S.p - 1); return [-x * f, -y * f]; }
  function rk4(q, h) {
    function d(a) { var A = acc(a[0], a[1]); return [a[2], a[3], A[0], A[1]]; }
    function ad(a, k, c) { return [a[0] + c * k[0], a[1] + c * k[1], a[2] + c * k[2], a[3] + c * k[3]]; }
    var k1 = d(q), k2 = d(ad(q, k1, h / 2)), k3 = d(ad(q, k2, h / 2)), k4 = d(ad(q, k3, h));
    return [q[0] + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), q[1] + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
      q[2] + h / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]), q[3] + h / 6 * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3])];
  }
  /* one full in-and-out: the angle turned between two closest approaches, the farthest distance and the time taken */
  function measure() {
    var s = Math.min(S.s, smax()), q = [1, 0, 0, Math.sqrt(1 + s)], h = 0.0005, ang = 0, rmax = 1, t = 0, prev = 0, ph = 0, n = 0, th0 = 0;
    while (n < 4e6) {
      var q2 = rk4(q, h), rv = q2[0] * q2[2] + q2[1] * q2[3], th = Math.atan2(q2[1], q2[0]), dth = th - th0;
      if (dth < -Math.PI) dth += 2 * Math.PI; if (dth > Math.PI) dth -= 2 * Math.PI;
      if (ph === 0 && rv < 0) ph = 1;                          /* past the farthest point */
      else if (ph === 1 && rv >= 0) { var f = prev / (prev - rv); ang += dth * f; t += h * f; return { step: ang / (2 * Math.PI), rmax: rmax, T: t }; }
      ang += dth; t += h; th0 = th; prev = rv; q = q2; rmax = Math.max(rmax, Math.hypot(q[0], q[1])); n++;
    }
    return { step: 1, rmax: rmax, T: t };
  }
  function ladder(x, max) {
    var out = [], terms = [], h0 = 0, h1 = 1, k0 = 1, k1 = 0, y = x, i;
    for (i = 0; i < max; i++) {
      var a = Math.floor(y + 1e-9); terms.push(a); var h = a * h1 + h0, k = a * k1 + k0; h0 = h1; h1 = h; k0 = k1; k1 = k;
      out.push({ p: h, q: k }); y -= a; if (y < 1e-6 || k > 400) break; y = 1 / y;
    }
    for (i = 0; i < out.length; i++) out[i].next = terms[i + 1];
    return { rungs: out, terms: terms };
  }
  function restart() {
    var s = Math.min(S.s, smax());
    st = { q: [1, 0, 0, Math.sqrt(1 + s)], prevRv: 0, m: measure() };
    st.lad = ladder(st.m.step, 7); run.peri = [[1, 0]]; run.laps = 0;
    tctx.clearRect(0, 0, trail.width, trail.height); describe(); table(); draw(); live();
  }
  function describe() {
    var newton = 180 / Math.sqrt(3 - S.p), meas = st.m.step * 180;
    $("rsPv").textContent = S.p.toFixed(2);
    $("rsLine").innerHTML = "Pull ∝ 1/r<sup>" + S.p.toFixed(2) + "</sup> · Newton's rule for a nearly round orbit: closest to farthest in <b>" + newton.toFixed(2) + "°</b> · this orbit: <b>" + meas.toFixed(2) + "°</b> · so each closest approach falls <span class=\"g\">" + (st.m.step % 1).toFixed(4) + "</span> of a turn beyond the last" + (Math.abs(st.m.step - Math.round(st.m.step)) < 2e-4 ? " (none: the orbit closes)" : "");
  }
  function table() {
    var tb = $("rsTbl").querySelector("tbody"); tb.innerHTML = "";
    var x = st.m.step;
    st.lad.rungs.forEach(function (r) {
      if (r.q < 1) return; var tr = document.createElement("tr"), miss = Math.abs(r.q * x - r.p) * 360;
      var fig = r.q === 1 ? (miss < 0.05 ? "one closed loop" : "one loop that does not close") : r.q + " petals in " + r.p + (r.p === 1 ? " turn" : " turns");
      [r.p + "/" + r.q, fig, miss < 0.01 ? "closes" : "misses by " + miss.toFixed(2) + "° each time", r.next == null ? "" : String(r.next)].forEach(function (t, i) { var td = document.createElement("td"); td.textContent = t; if (i === 0) td.className = "mono"; tr.appendChild(td); });
      tb.appendChild(tr);
    });
  }
  function scale() { return (cv.width / 2 - 40) / Math.max(1.05, st.m.rmax); }
  function draw() {
    var w = cv.width, h = cv.height, k = scale(), cx = w / 2, cy = h / 2;
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = css("--surface"); ctx.fillRect(0, 0, w, h);
    ctx.drawImage(trail, 0, 0);
    ctx.fillStyle = css("--sun"); ctx.beginPath(); ctx.arc(cx, cy, 16, 0, 7); ctx.fill();
    ctx.fillStyle = css("--gold"); run.peri.forEach(function (p) { ctx.beginPath(); ctx.arc(cx + k * p[0], cy - k * p[1], 9, 0, 7); ctx.fill(); });
    ctx.fillStyle = css("--ink"); ctx.beginPath(); ctx.arc(cx + k * st.q[0], cy - k * st.q[1], 13, 0, 7); ctx.fill();
  }
  function live() {
    var n = run.peri.length - 1; $("rsLive").textContent = n + (n === 1 ? " lap" : " laps") + " drawn · the closest point has moved " + ((n * st.m.step * 360) % 360).toFixed(1) + "° round the center";
  }
  function tick() { if (!run.sound) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime; o.frequency.value = 330 * Math.pow(2, ((run.peri.length * st.m.step) % 1)); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.15, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.32); } catch (e) { } }
  function advance(T) {
    var k = scale(), cx = cv.width / 2, cy = cv.height / 2, h = 0.004, n = Math.max(1, Math.round(T / h));
    tctx.strokeStyle = css("--band"); tctx.lineWidth = 2; tctx.globalAlpha = 0.75; tctx.beginPath(); tctx.moveTo(cx + k * st.q[0], cy - k * st.q[1]);
    for (var i = 0; i < n; i++) {
      st.q = rk4(st.q, h); tctx.lineTo(cx + k * st.q[0], cy - k * st.q[1]);
      var rv = st.q[0] * st.q[2] + st.q[1] * st.q[3];
      if (st.prevRv < 0 && rv >= 0) { run.peri.push([st.q[0], st.q[1]]); if (run.peri.length > 400) run.peri.shift(); tick(); }
      st.prevRv = rv;
    }
    tctx.stroke(); tctx.globalAlpha = 1;
  }
  function frame(now) { if (!run.playing) return; var dt = Math.min(0.05, (now - run.last) / 1000); run.last = now; advance(dt * st.m.T * 0.45); draw(); live(); requestAnimationFrame(frame); }
  function setPlaying(on) { run.playing = on; $("rsPlay").textContent = on ? "❚❚ Pause" : "▶ Play"; if (on) { run.last = performance.now(); requestAnimationFrame(frame); } }
  PRE.forEach(function (P, i) { var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = P.name; b.setAttribute("aria-pressed", String(i === 0)); b.addEventListener("click", function () { S.p = P.p; $("rsP").value = P.p; mark(i); restart(); }); $("rsPresets").appendChild(b); });
  function mark(i) { [].forEach.call($("rsPresets").children, function (b, j) { b.setAttribute("aria-pressed", String(i === j)); }); }
  $("rsP").addEventListener("input", function () { S.p = +this.value; mark(-1); restart(); });
  $("rsE").addEventListener("input", function () { S.s = +this.value; restart(); });
  $("rsPlay").addEventListener("click", function () { setPlaying(!run.playing); });
  $("rsFast").addEventListener("click", function () { advance(20 * st.m.T); draw(); live(); });
  $("rsClear").addEventListener("click", function () { setPlaying(false); restart(); });
  $("rsSound").addEventListener("click", function () { run.sound = !run.sound; this.setAttribute("aria-pressed", String(run.sound)); this.textContent = "Sound: " + (run.sound ? "on" : "off"); });
  if (window.MutationObserver) new MutationObserver(function () { var keep = run.peri.slice(); restart(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  restart();
  if (!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) { advance(6 * st.m.T); draw(); live(); }
})();
