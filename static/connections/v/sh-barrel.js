/* Barrels (/connections/shells/): a simple geometric model of a vault. Each half is a ring of n identical copies of one
   protein; every copy is the same width, so the ring's radius is n × width / 2π. Each protein is a stack of segments, which
   sets the length of a half. The cap is a dome whose height is a fixed fraction of the radius. Sizes are scaled so 39 copies
   of 9 segments give the human vault's measured 40 × 67 nm; everything else follows from the model, not from structures. */
(function () {
  var NM = 20 / (39 / (2 * Math.PI)), SEG = 67 / 2 / 9 / NM, CAP = 0.35; // nm per width unit; units of length per segment; cap height / radius
  function model(n, s) {
    var R = n / (2 * Math.PI), L = s * SEG, ch = Math.min(L, CAP * R);
    var V = 2 * Math.PI * R * R * (L - ch + 2 * ch / 3);
    return { R: R, L: L, ch: ch, V: V, d: 2 * R * NM, len: 2 * L * NM };
  }
  var BASE = model(39, 9).V;
  var PRE = [[39, 9, 'Human vault'], [48, 7, 'Phage vault (L05)'], [48, 9, 'L05 with two extra segments']];
  Cx.viz('sh-barrel', function (v) {
    var n = 39, s = 9;
    var cv = v.canvas({ aspect: 0.55, min: 200, max: 330, label: 'A ring of copies and the barrel two rings make' });
    var out = document.createElement('p'); out.className = 'sh-out'; out.setAttribute('aria-live', 'polite'); v.stage.parentNode.insertBefore(out, v.bar);
    var pb = PRE.map(function (p) { var b = v.button(p[2], function () { n = p[0]; s = p[1]; sn.value = n; ss.value = s; sn.show(); ss.show(); sync(); }); return b; });
    var sn = v.slider('Copies in each ring', 12, 64, 1, n, function (x) { n = x; sync(); });
    var ss = v.slider('Segments per protein', 4, 12, 1, s, function (x) { s = x; sync(); });
    function sync() {
      var m = model(n, s), pct = Math.round((m.V / BASE - 1) * 100);
      pb.forEach(function (b, i) { b.setAttribute('aria-pressed', PRE[i][0] === n && PRE[i][1] === s ? 'true' : 'false'); });
      out.innerHTML = '<b>' + n + ' copies per ring, ' + (2 * n) + ' in the shell.</b> Symmetry of the model: D<sub>' + n + '</sub>: ' + (2 * n) + ' moves, one per copy. ' +
        'Model size about ' + Math.round(m.d) + ' nm wide and ' + Math.round(m.len) + ' nm long; room inside ' +
        (pct === 0 ? 'the same as' : Math.abs(pct) + '% ' + (pct > 0 ? 'more than' : 'less than')) + ' the human vault in this model.' +
        (n === 48 && s === 7 ? ' (The real L05 vault measures about 54 × 47 nm with about 25% more room: its true shape is rounder than this model.)' : '');
      v.say(n + ' copies per ring, model width ' + Math.round(m.d) + ' nanometers, length ' + Math.round(m.len) + ' nanometers.');
      cv.el.setAttribute('aria-label', 'Top view of a ring of ' + n + ' copies and a side view of the barrel, ' + Math.round(m.d) + ' by ' + Math.round(m.len) + ' nanometers in this model.');
      v.redraw();
    }
    v.draw(function (c) {
      cv.fit(); var ctx = cv.ctx, W = cv.w, H = cv.h; cv.clear(c.bg);
      var mx = model(64, 12), pad = 10, gap = 14;
      var lw = (W - 2 * pad - gap) * 0.4, rw = (W - 2 * pad - gap) * 0.6, top = 22;
      var u = Math.min(lw / (2 * mx.R + 2), rw / (2 * mx.L + 1), (H - top - pad) / (2 * mx.R + 2));
      var m = model(n, s), h0 = model(39, 9);
      ctx.font = '600 12px system-ui, sans-serif'; ctx.fillStyle = c.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('One ring, from above', pad + lw / 2, 4); ctx.fillText('The barrel, from the side', pad + lw + gap + rw / 2, 4);
      // ring: n copies around a circle
      var cx = pad + lw / 2, cy = top + (H - top - pad) / 2, R = m.R * u, wd = 2 * Math.PI * R / n;
      ctx.setLineDash([4, 4]); ctx.strokeStyle = c.muted; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, h0.R * u, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + i * 2 * Math.PI / n;
        ctx.save(); ctx.translate(cx + R * Math.cos(a), cy + R * Math.sin(a)); ctx.rotate(a);
        var bw = Math.max(3, u * 1.6), bh = Math.max(1.5, wd * 0.82);
        ctx.fillStyle = i === 0 ? c.gold : (i % 2 ? c.green : c.a(c.green, 0.7));
        ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.restore();
      }
      ctx.fillStyle = c.ink; ctx.textBaseline = 'middle'; ctx.font = '700 15px system-ui, sans-serif'; ctx.fillText(String(n), cx, cy);
      // barrel lying on its side: waist at the middle, a half on each side
      var bx = pad + lw + gap + rw / 2, by = cy;
      function prof(mm, z) { var L = mm.L, ch = mm.ch; if (z <= L - ch) return mm.R; var t = (z - (L - ch)) / ch; return mm.R * Math.sqrt(Math.max(0, 1 - t * t)); }
      function outline(mm) {
        var N = 60, pts = [], j;
        for (j = 0; j <= N; j++) { var z = mm.L * j / N; pts.push([bx + z * u, by - prof(mm, z) * u]); }
        for (j = N; j >= 0; j--) { var z2 = mm.L * j / N; pts.push([bx + z2 * u, by + prof(mm, z2) * u]); }
        for (j = 0; j <= N; j++) { var z3 = mm.L * j / N; pts.push([bx - z3 * u, by + prof(mm, z3) * u]); }
        for (j = N; j >= 0; j--) { var z4 = mm.L * j / N; pts.push([bx - z4 * u, by - prof(mm, z4) * u]); }
        ctx.beginPath(); pts.forEach(function (p, k) { k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath();
      }
      outline(m); ctx.fillStyle = c.a(c.green, c.dark ? 0.22 : 0.14); ctx.fill();
      ctx.save(); outline(m); ctx.clip();
      // ribs: copies on the near side, foreshortened
      ctx.strokeStyle = c.a(c.green, 0.55); ctx.lineWidth = 1;
      for (i = 0; i < n; i++) {
        var th = (i + 0.5) * 2 * Math.PI / n; if (Math.cos(th) < 0) continue; var yy = by - m.R * u * Math.sin(th);
        ctx.beginPath(); ctx.moveTo(bx - m.L * u, yy); ctx.lineTo(bx + m.L * u, yy); ctx.stroke();
      }
      // segment boundaries
      ctx.strokeStyle = c.a(c.ink, 0.25);
      for (i = 1; i < s; i++) { [1, -1].forEach(function (sg) { var x = bx + sg * i * SEG * u; ctx.beginPath(); ctx.moveTo(x, by - m.R * u); ctx.lineTo(x, by + m.R * u); ctx.stroke(); }); }
      ctx.restore();
      outline(m); ctx.strokeStyle = c.green; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = c.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, by - m.R * u - 4); ctx.lineTo(bx, by + m.R * u + 4); ctx.stroke();
      if (!(n === 39 && s === 9)) { ctx.setLineDash([4, 4]); outline(h0); ctx.strokeStyle = c.muted; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]); }
      if (!(n === 39 && s === 9)) { ctx.font = '12px system-ui, sans-serif'; ctx.fillStyle = c.muted; ctx.textBaseline = 'bottom'; ctx.fillText('dashed: the human vault', W / 2, H - 2); }
    });
    sync();
  });
})();
