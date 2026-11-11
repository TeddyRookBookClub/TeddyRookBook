/* Math ∩ Chemistry ∩ Physics: the states of an atom's levels. With the inverse-square (hydrogen) symmetry every
   subshell of level n has the same energy: 2n² states. In a many-electron atom the subshells fill in the order
   1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s 5f 6d 7p, which gives rows of 2 8 8 18 18 32 32. Our own drawing. */
Cx.viz('ph-shells', function (v) {
  var broken = false, L = 'spdf', COL = ['blue', 'orange', 'green', 'purple'];
  var ORDER = [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [3, 2], [4, 1], [5, 0], [4, 2], [5, 1], [6, 0], [4, 3], [5, 2], [6, 1], [7, 0], [5, 3], [6, 2], [7, 1]];
  var cv = v.canvas({ aspect: 0.66, max: 460, min: 320, label: 'Boxes for the electron states of an atom, grouped into levels or into the rows of the periodic table.' });
  var ro = v.readout();
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, rows = [], i;
    if (!broken) for (i = 1; i <= 4; i++) { var r = []; for (var l = 0; l < i; l++) r.push([i, l]); rows.push(r); }
    else { var cur = []; ORDER.forEach(function (o) { if (o[1] === 0 && cur.length) { rows.push(cur); cur = []; } cur.push(o); }); rows.push(cur); }
    cv.clear(c.bg);
    var rh = (h - 10) / rows.length, bw = Math.min(15, (w - 96) / 32 - 1.5), bh = Math.min(rh - 16, 20);
    rows.forEach(function (r, k) {
      var y = 6 + (rows.length - 1 - k) * rh, X = 52, tot = 0;
      r.forEach(function (s) {
        var cnt = 2 * (2 * s[1] + 1); tot += cnt; x.fillStyle = c[COL[s[1]]];
        for (var j = 0; j < cnt; j++) { x.globalAlpha = j % 2 ? 0.55 : 0.95; x.fillRect(X, y + 12, bw, bh); X += bw + 1.5; }
        x.globalAlpha = 1; x.fillStyle = c.muted; x.font = '10px system-ui,sans-serif'; x.fillText(s[0] + L[s[1]], X - cnt * (bw + 1.5), y + 9); X += 5;
      });
      x.fillStyle = c.ink; x.font = '700 13px system-ui,sans-serif'; x.fillText(String(tot), 8, y + 12 + bh * 0.75);
      x.fillStyle = c.muted; x.font = '10px system-ui,sans-serif'; x.fillText(broken ? 'row ' + (k + 1) : 'n = ' + (k + 1), 8, y + 9);
    });
    ro.textContent = broken ? 'A many-electron atom: the symmetry is broken, levels split by shape (s, p, d, f), and the rows hold 2, 8, 8, 18, 18, 32, 32' : 'Hydrogen: every state of a level has the same energy. Levels hold 2, 8, 18, 32, which is 2n²';
  });
  v.toggle('Many electrons (symmetry broken)', false, function (on) { broken = on; v.redraw(); v.say(ro.textContent); });
});
