/* Math Gallery: the birthday problem. Left: a year drawn as a ring of 365 days; each person in the room is a dot on
   their birthday, and shared birthdays are joined to the center and highlighted. Right: the exact chance of a shared
   birthday for rooms of 1 to 80 people, with the result of 1,000 simulated rooms of the chosen size. */
Gallery.piece('birthday-problem', function (g) {
  var split = g.el('div', 'gx-split'); g.stage.appendChild(split);
  var pa = g.el('div'), pb = g.el('div'); split.appendChild(pa); split.appendChild(pb);
  var a = g.canvas({ parent: pa, aspect: 1, max: 380, label: 'A year as a ring of days, with a dot for each person’s birthday' });
  var b = g.canvas({ parent: pb, aspect: 1, max: 380, label: 'Chart: chance of a shared birthday against the number of people' });
  var n = 23, rnd = g.rng(23), room = [], sim = null, MO = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], ML = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var P = [0]; (function () { var q = 1; for (var k = 1; k <= 100; k++) { q *= (366 - k) / 365; P.push(1 - q); } })();
  function newRoom(k) { room = []; for (var i = 0; i < (k == null ? n : k); i++) room.push(rnd() * 365 | 0); g.redraw(); }
  function dupes() { var seen = {}, d = {}; room.forEach(function (x) { if (seen[x]) d[x] = 1; seen[x] = 1; }); return d; }
  function dateName(d) { for (var m = 0; m < 12; m++) { if (d < ML[m]) return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m] + ' ' + (d + 1); d -= ML[m]; } return ''; }
  var acc = 0, L = g.loop(function (dt) {
    if (room.length >= n) return false;
    acc += dt; if (acc >= 1 / 6) { acc = 0; room.push(rnd() * 365 | 0); g.redraw(); if (Object.keys(dupes()).length) tellRoom(); }
  }, { auto: false, stepSize: 1 / 6, stepText: 'Add one person' });
  g.button('Fill a new room', function () { L.pause(); newRoom(); tellRoom(); }, { pri: true });
  g.button('Empty the room', function () { L.pause(); room = []; g.redraw(); g.say('The room is empty. Press Play to bring people in one at a time.'); });
  g.button('Run 1,000 rooms', function () {
    var hit = 0; for (var r = 0; r < 1000; r++) { var s = new Uint8Array(365), ok = false; for (var i = 0; i < n; i++) { var d = rnd() * 365 | 0; if (s[d]) { ok = true; break; } s[d] = 1; } if (ok) hit++; }
    sim = { n: n, f: hit / 1000 }; g.redraw(); g.say('In 1,000 rooms of ' + n + ', ' + hit + ' had a shared birthday.');
  });
  g.slider({ label: 'People in the room', min: 2, max: 80, value: n, input: function (v) { n = v; sim = null; L.pause(); newRoom(); } });
  var st = g.out();
  function tellRoom() { var d = Object.keys(dupes()); g.say(room.length + ' people. ' + (d.length ? 'Shared: ' + d.map(function (k) { return dateName(+k); }).join(', ') + '.' : 'No shared birthdays.')); }

  g.draw(function (col) {
    var x = a.ctx, W = a.w, H = a.h, cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 26, d = dupes();
    a.clear(col.bg);
    function ang(day) { return -Math.PI / 2 + (day + 0.5) / 365 * 2 * Math.PI; }
    x.strokeStyle = col.grid; x.lineWidth = 10; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
    x.font = '12px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = col.muted; x.strokeStyle = col.axis; x.lineWidth = 1;
    for (var m = 0, s = 0; m < 12; s += ML[m], m++) {
      var t0 = ang(s - 0.5); x.beginPath(); x.moveTo(cx + Math.cos(t0) * (R - 8), cy + Math.sin(t0) * (R - 8)); x.lineTo(cx + Math.cos(t0) * (R + 8), cy + Math.sin(t0) * (R + 8)); x.stroke();
      var tm = ang(s + ML[m] / 2); x.fillText(MO[m], cx + Math.cos(tm) * (R + 17), cy + Math.sin(tm) * (R + 17));
    }
    var cnt = {};
    room.forEach(function (day) {
      var k = cnt[day] = (cnt[day] || 0) + 1, t = ang(day), rr = R - 14 - (k - 1) * 11, hit = d[day];
      if (hit && k === 1) { x.strokeStyle = col.red; x.lineWidth = 2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(t) * (R - 8), cy + Math.sin(t) * (R - 8)); x.stroke(); }
      x.fillStyle = hit ? col.red : col.accent; x.beginPath(); x.arc(cx + Math.cos(t) * rr, cy + Math.sin(t) * rr, hit ? 5.5 : 4.5, 0, 7); x.fill();
    });
    var nd = Object.keys(d).length;
    x.fillStyle = nd ? col.red : col.ink; x.font = '600 15px system-ui,sans-serif';
    x.fillText(room.length + (room.length === 1 ? ' person' : ' people'), cx, cy - 10);
    x.font = '13px system-ui,sans-serif'; x.fillText(nd ? (nd === 1 ? 'a shared birthday!' : nd + ' shared birthdays!') : 'no match yet', cx, cy + 10);

    // chart
    var y = b.ctx, BW = b.w, BH = b.h, l = 40, bt = BH - 30, tp = 14, w = BW - l - 12;
    b.clear(col.bg);
    function X(k) { return l + k / 80 * w; } function Y(p) { return bt - p * (bt - tp); }
    y.font = '12px system-ui,sans-serif'; y.textBaseline = 'middle'; y.lineWidth = 1;
    [0, 0.5, 1].forEach(function (p) { y.strokeStyle = p === 0.5 ? col.gold : col.grid; y.setLineDash(p === 0.5 ? [4, 4] : []); y.beginPath(); y.moveTo(l, Y(p)); y.lineTo(BW - 12, Y(p)); y.stroke(); y.setLineDash([]); y.fillStyle = col.muted; y.textAlign = 'right'; y.fillText(p * 100 + '%', l - 5, Y(p)); });
    y.textAlign = 'center'; [0, 20, 40, 60, 80].forEach(function (k) { y.fillText(String(k), X(k), bt + 12); }); y.fillText('people in the room', l + w / 2, bt + 25);
    y.strokeStyle = col.accent; y.lineWidth = 2.5; y.beginPath(); for (var k = 1; k <= 80; k++) { if (k === 1) y.moveTo(X(k), Y(P[k])); else y.lineTo(X(k), Y(P[k])); } y.stroke();
    y.strokeStyle = col.red; y.lineWidth = 1.5; y.beginPath(); y.moveTo(X(n), bt); y.lineTo(X(n), Y(P[n])); y.lineTo(l, Y(P[n])); y.stroke();
    y.fillStyle = col.red; y.beginPath(); y.arc(X(n), Y(P[n]), 5, 0, 7); y.fill();
    if (sim && sim.n === n) { y.fillStyle = col.gold; y.strokeStyle = col.ink; y.beginPath(); y.rect(X(n) - 5, Y(sim.f) - 5, 10, 10); y.fill(); y.stroke(); }
    st.innerHTML = 'With <b>' + n + '</b> people the chance of a shared birthday is <b>' + (100 * P[n]).toFixed(1) + '%</b>' + (sim && sim.n === n ? ' · 1,000 rooms: <b>' + (100 * sim.f).toFixed(1) + '%</b> (gold square)' : '');
  });
  newRoom(); if (!g.reduced) { room = []; L.play(); }
});
