/* gb-harmony: Kepler's planetary "music" (Harmonies of the World, Book V).
   For the chosen planet: its slowest and fastest angular speeds as seen from the sun (aphelion and perihelion), the
   ratio (1+e)^2/(1-e)^2, the nearest simple musical ratio, and two strings whose lengths are in the inverse ratio
   (a faster speed = a shorter string = a higher note). "Hear it" plays the two notes with the Web Audio API, only when
   pressed. Eccentricities are modern values. opts: planet: "saturn"; quiet: true hides the readout. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math;
  var P = [['mercury', 'Mercury', 0.2056], ['venus', 'Venus', 0.0068], ['earth', 'Earth', 0.0167], ['mars', 'Mars', 0.0934], ['jupiter', 'Jupiter', 0.0489], ['saturn', 'Saturn', 0.0565]];
  var IV = [[1, 1, 'unison'], [25, 24, 'a small step (diesis)'], [16, 15, 'a half step (mi to fa)'], [9, 8, 'a whole step'], [6, 5, 'a minor third'], [5, 4, 'a major third'], [4, 3, 'a fourth'], [3, 2, 'a fifth'], [8, 5, 'a minor sixth'], [5, 3, 'a major sixth'], [2, 1, 'an octave'], [12, 5, 'an octave and a minor third'], [5, 2, 'an octave and a major third'], [3, 1, 'an octave and a fifth']];
  var actx = null;
  V.register('gb-harmony', function (el, o) {
    o = o || {};
    var pk = 5; P.forEach(function (p, i) { if (p[0] === o.planet) pk = i; });
    var box = V.el('div'); el.appendChild(box);
    var c = V.canvas(box, { aspect: 2.1, min: 190, max: 300 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.seg(ctl, { label: 'Planet', items: P.map(function (p, i) { return [String(i), p[1]]; }), value: String(pk), change: function (v) { pk = +v; draw(); } });
    V.button(ctl, 'Hear it', play);
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    function ratio(e) { var r = (1 + e) / (1 - e); return r * r; }
    function nearest(r) { var best = IV[0], bd = 1e9; IV.forEach(function (iv) { var d = M.abs(M.log(r / (iv[0] / iv[1]))); if (d < bd) { bd = d; best = iv; } }); return best; }
    function clear(k) { var x = c.ctx; x.save(); x.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); x.fillStyle = k.bg; x.fillRect(0, 0, c.w, c.h); x.restore(); }
    function draw() {
      var k = V.colors(), g = c.ctx, w = c.w, h = c.h, p = P[pk], r = ratio(p[2]), iv = nearest(r);
      clear(k);
      var L = 16, Rr = 16, full = w - L - Rr, y1 = h * 0.33, y2 = h * 0.66, short = full / r;
      function string(y, len, col, lab) {
        g.fillStyle = k.muted; g.fillRect(L - 4, y - 10, 4, 20); g.fillRect(L + len, y - 10, 4, 20);
        g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(L, y); g.lineTo(L + len, y); g.stroke();
        g.fillStyle = k.ink; g.font = '600 12px system-ui,sans-serif'; g.textAlign = 'left'; g.textBaseline = 'bottom'; g.fillText(lab, L, y - 12);
      }
      string(y1, full, k.blue, 'Farthest from the sun: slowest, lower note');
      string(y2, short, k.red, 'Nearest the sun: fastest, higher note');
      g.fillStyle = k.muted; g.font = '12px system-ui,sans-serif'; g.textBaseline = 'top'; g.fillText('length ratio 1 : ' + V.fmt(1 / r, 3), L, y2 + 12);
      c.cv.setAttribute('aria-label', p[1] + ': speeds in the ratio ' + V.fmt(r, 3) + ', near ' + iv[0] + ' to ' + iv[1] + ', ' + iv[2]);
      out.set(p[1] + ' (eccentricity ' + p[2] + '): fastest ÷ slowest = ((1 + e)/(1 − e))² ≈ <b>' + V.fmt(r, 3) + '</b>. The nearest simple ratio is ' + iv[0] + ' : ' + iv[1] + ' = ' + V.fmt(iv[0] / iv[1], 3) + ', ' + iv[2] + '.');
    }
    function play() {
      try {
        var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        actx = actx || new AC(); if (actx.state === 'suspended') actx.resume();
        var r = ratio(P[pk][2]), f0 = 220, t0 = actx.currentTime + 0.05;
        [[f0, 0, 0.9], [f0 * r, 1.0, 0.9], [f0, 2.1, 1.4], [f0 * r, 2.1, 1.4]].forEach(function (n) {
          var os = actx.createOscillator(), gn = actx.createGain(); os.type = 'triangle'; os.frequency.value = n[0];
          gn.gain.setValueAtTime(0, t0 + n[1]); gn.gain.linearRampToValueAtTime(0.12, t0 + n[1] + 0.04); gn.gain.linearRampToValueAtTime(0, t0 + n[1] + n[2]);
          os.connect(gn); gn.connect(actx.destination); os.start(t0 + n[1]); os.stop(t0 + n[1] + n[2] + 0.05);
        });
      } catch (e) { }
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return {};
  });
})();
