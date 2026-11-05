/* Caspar–Klug shell builder (/connections/shells/): choose (h, k); the hexagonal sheet is cut into the 20-triangle net of an
   icosahedron whose edge is the walk h steps along a row, then k steps after a 60° turn. Pentamers sit at the net's corners.
   Shows T = h² + hk + k², 60T, 12 pentamers and 10(T − 1) hexamers, and which T values exist (the Eisenstein norms). */
(function () {
  var S3 = Math.sqrt(3), MAX = 5;
  var EX = [
    [1, 0, 'satellite tobacco necrosis virus'], [1, 1, 'tomato bushy stunt virus'], [2, 0, 'the core of hepatitis B virus'],
    [2, 1, 'the head of phage HK97'], [4, 0, 'the capsid of herpes simplex virus']
  ];
  function rep(T) { for (var h = 0; h <= MAX; h++) for (var k = 0; k <= h; k++) if (h * h + h * k + k * k === T) return [h, k]; return null; }
  function isNorm(T) { for (var h = 0; h * h <= T; h++) for (var k = 0; k <= h; k++) if (h * h + h * k + k * k === T) return true; return false; }
  Cx.viz('sh-caspar', function (v) {
    var h = 2, k = 1;
    var cv = v.canvas({ aspect: 0.56, min: 210, max: 460, label: 'Icosahedron net on a hexagonal sheet' });
    var out = document.createElement('p'); out.className = 'sh-out'; out.setAttribute('aria-live', 'polite'); v.stage.parentNode.insertBefore(out, v.bar);
    var sh = v.slider('h', 0, MAX, 1, h, function (x) { h = x; if (!h && !k) { k = 1; sk.value = 1; sk.show(); } sync(); });
    var sk = v.slider('k', 0, MAX, 1, k, function (x) { k = x; if (!h && !k) { h = 1; sh.value = 1; sh.show(); } sync(); });
    var sel = v.select('Example', [['', 'Pick a virus…']].concat(EX.map(function (e, i) { return [String(i), 'T = ' + (e[0] * e[0] + e[0] * e[1] + e[1] * e[1]) + ': ' + e[2]]; })), '', function (val) {
      if (val === '') return; var e = EX[+val]; h = e[0]; k = e[1]; sh.value = h; sk.value = k; sh.show(); sk.show(); sync();
    });
    var tsWrap = document.createElement('div'); tsWrap.style.flex = '1 0 100%';
    var tsLab = document.createElement('p'); tsLab.className = 'sh-out'; tsLab.style.margin = '.2rem .2rem 0'; tsLab.textContent = 'Every T from 1 to 49. Dashed numbers can never be a T. Tap a T to build it.';
    var ts = document.createElement('div'); ts.className = 'sh-ts'; ts.setAttribute('role', 'group'); ts.setAttribute('aria-label', 'Triangulation numbers');
    tsWrap.appendChild(tsLab); tsWrap.appendChild(ts); v.bar.appendChild(tsWrap);
    var tbtn = {};
    for (var T = 1; T <= 49; T++) {
      var r = rep(T);
      if (r) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = T; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'T = ' + T);
        (function (rr) { b.addEventListener('click', function () { h = rr[0]; k = rr[1]; sh.value = h; sk.value = k; sh.show(); sk.show(); sync(); }); })(r);
        ts.appendChild(b); tbtn[T] = b;
      } else {
        var s = document.createElement('span'); s.className = 'sh-no'; s.textContent = T; s.setAttribute('aria-hidden', 'true'); ts.appendChild(s);
      }
    }
    function sync() {
      var T = h * h + h * k + k * k;
      Object.keys(tbtn).forEach(function (t) { tbtn[t].setAttribute('aria-pressed', +t === T ? 'true' : 'false'); });
      var ex = null; EX.forEach(function (e, i) { if ((e[0] === h && e[1] === k) || (e[0] === k && e[1] === h)) ex = i; });
      sel.value = ex == null ? '' : String(ex);
      var hand = h && k && h !== k ? ' Because h and k differ and neither is 0, this shell comes in two mirror-image forms.' : '';
      out.innerHTML = '<b>T = ' + h + '² + ' + h + '×' + k + ' + ' + k + '² = ' + T + '</b>: ' + (60 * T) + ' proteins (60T), as 12 pentamers and ' + (10 * (T - 1)) + ' hexamers.' +
        (ex != null ? ' Example: ' + EX[ex][2] + '.' : '') + hand;
      v.say('T equals ' + T + ', ' + (60 * T) + ' proteins.');
      cv.el.setAttribute('aria-label', 'Icosahedron net for h = ' + h + ', k = ' + k + ': T = ' + T + ', 12 pentamers and ' + (10 * (T - 1)) + ' hexamers.');
      v.redraw();
    }
    function P(i, j) { return [i + j / 2, j * S3 / 2]; }
    v.draw(function (c) {
      cv.fit(); var ctx = cv.ctx, W = cv.w, H = cv.h; cv.clear(c.bg);
      var a = [h, k], b = [-k, h + k];
      function add(p, q, m) { return [p[0] + m * q[0], p[1] + m * q[1]]; }
      var tris = [];
      for (var i = 0; i < 5; i++) {
        var p0 = [i * a[0], i * a[1]], pa = add(p0, a, 1), pb = add(p0, b, 1), pab = add(pa, b, 1);
        tris.push([pb, add(pb, a, 1), add(pb, b, 1)]);          // top cap
        tris.push([p0, pa, pb]); tris.push([pa, pab, pb]);       // middle strip
        tris.push([p0, add(pa, b, -1), pa]);                     // bottom cap
      }
      // turn the picture so the walk a lies along x
      var A = P(a[0], a[1]), ang = Math.atan2(A[1], A[0]), ca = Math.cos(-ang), sa = Math.sin(-ang);
      function cart(q) { var p = P(q[0], q[1]); return [p[0] * ca - p[1] * sa, p[0] * sa + p[1] * ca]; }
      var ct = tris.map(function (t) { return t.map(cart); });
      var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      ct.forEach(function (t) { t.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }); });
      var pad = 14, sc = Math.min((W - 2 * pad) / (x1 - x0 + 1.2), (H - 2 * pad) / (y1 - y0 + 1.2));
      var ox = W / 2 - sc * (x0 + x1) / 2, oy = H / 2 + sc * (y0 + y1) / 2;
      function X(p) { return [ox + sc * p[0], oy - sc * p[1]]; }
      // the net as a clip path
      ctx.save(); ctx.beginPath();
      ct.forEach(function (t) { var q = t.map(X); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[1][0], q[1][1]); ctx.lineTo(q[2][0], q[2][1]); ctx.closePath(); });
      ctx.fillStyle = c.a(c.green, c.dark ? 0.08 : 0.05); ctx.fill('nonzero'); ctx.clip('nonzero');
      // lattice points inside the net (in lattice coordinates)
      var li0 = 1e9, li1 = -1e9, lj0 = 1e9, lj1 = -1e9;
      tris.forEach(function (t) { t.forEach(function (q) { li0 = Math.min(li0, q[0]); li1 = Math.max(li1, q[0]); lj0 = Math.min(lj0, q[1]); lj1 = Math.max(lj1, q[1]); }); });
      var corner = {};
      tris.forEach(function (t) { t.forEach(function (q) { corner[q[0] + ',' + q[1]] = q; }); });
      var edge = Math.sqrt(h * h + h * k + k * k), marg = -0.62 * edge; // keep cells within 0.62 of the net: the clip trims them
      function cr(p, q, r) { return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]); }
      function inside(pt) {
        for (var n = 0; n < ct.length; n++) {
          var t = ct[n], o = cr(t[0], t[1], t[2]) > 0 ? 1 : -1;
          if (o * cr(t[0], t[1], pt) >= marg && o * cr(t[1], t[2], pt) >= marg && o * cr(t[2], t[0], pt) >= marg) return true;
        }
        return false;
      }
      var rr = sc / S3 * 0.88; // hexagon circumradius (the honeycomb's cells touch at 1/√3)
      ctx.lineWidth = Math.max(0.6, Math.min(1.4, sc / 18));
      for (var ii = li0 - 1; ii <= li1 + 1; ii++) for (var jj = lj0 - 1; jj <= lj1 + 1; jj++) {
        if (corner[ii + ',' + jj]) continue;
        var cp = cart([ii, jj]); if (!inside(cp)) continue;
        var s = X(cp); ctx.beginPath();
        for (var m = 0; m < 6; m++) { var th = -ang + Math.PI / 6 + m * Math.PI / 3; ctx.lineTo(s[0] + rr * Math.cos(th), s[1] - rr * Math.sin(th)); }
        ctx.closePath(); ctx.fillStyle = c.a(c.green, c.dark ? 0.35 : 0.22); ctx.fill(); ctx.strokeStyle = c.green; ctx.stroke();
      }
      ctx.restore();
      // face edges
      ctx.strokeStyle = c.gold; ctx.lineWidth = 1.5; ctx.beginPath();
      ct.forEach(function (t) { var q = t.map(X); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[1][0], q[1][1]); ctx.lineTo(q[2][0], q[2][1]); ctx.closePath(); });
      ctx.stroke();
      // pentamers at the corners
      var pr = Math.max(4, Math.min(rr * 1.05, 16));
      Object.keys(corner).forEach(function (key) {
        var s = X(cart(corner[key])); ctx.beginPath();
        for (var m = 0; m < 5; m++) { var th = Math.PI / 2 + m * 2 * Math.PI / 5; ctx.lineTo(s[0] + pr * Math.cos(th), s[1] - pr * Math.sin(th)); }
        ctx.closePath(); ctx.fillStyle = c.red; ctx.fill(); ctx.strokeStyle = c.bg; ctx.lineWidth = 1; ctx.stroke();
      });
      // the walk: h steps along a row, then k steps after a 60° turn (from the bottom-left corner of the first middle face)
      var o = X(cart([0, 0])), m1 = X(cart([h, 0])), m2 = X(cart([h, k]));
      ctx.strokeStyle = c.blue; ctx.lineWidth = 3; ctx.lineCap = 'round';
      function arrow(p, q) {
        if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 2) return;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
        var an = Math.atan2(q[1] - p[1], q[0] - p[0]), L = 9;
        ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] - L * Math.cos(an - 0.45), q[1] - L * Math.sin(an - 0.45));
        ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] - L * Math.cos(an + 0.45), q[1] - L * Math.sin(an + 0.45)); ctx.stroke();
      }
      arrow(o, m1); arrow(m1, m2);
      ctx.font = '600 13px system-ui, sans-serif'; ctx.fillStyle = c.blue; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      if (h && W > 520) ctx.fillText('h = ' + h, (o[0] + m1[0]) / 2, Math.max(o[1], m1[1]) + 6);
    });
    sync();
  });
})();
