/* The Rhythm of Numbers, epilogue: the map of sections and the threads they share. Conventions: core.js.
   Keyboard: focus the map, then the arrow keys move between sections and Enter jumps to one. */
(function (RN) {
  'use strict';
  var $ = RN.$, c = RN.c, F = RN.font, D = document;
  var SHORT = { formula: 'The starting guess', levels: 'The levels', composer: 'Composer', ladder: 'The ladder', fifths: 'Circle of fifths', euclid: 'Euclid & Bjorklund', locking: 'Mode locking', primemusic: 'Prime music', orchard: 'The orchard (6/π²)', corr: 'Correlation matrix', hydrogen: 'Hydrogen 1/n²', sunflower: 'Prime sunflower', wrapv: 'Sieves & periods', quasi: 'Quasicrystals', zeros: 'Zeta zeros & nuclei', cfrac: 'Factoring', mersenne: 'Mersenne circles', reverse: 'Rhythm → number', hunt: 'Prime hunt', poly: 'Polyrhythm layerer', drums: 'Drum machine', compose: 'Compose a piece', suite: 'The Suite' };
  var nodes = [], hover = -1, sel = -1;
  function draw() {
    var cv = $('mapCan'), w0 = cv.clientWidth, H0 = Math.max(380, Math.min(620, w0 * 0.78)), r = RN.setup(cv, H0), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var secs = [].filter.call(D.querySelectorAll('.rn-s[data-tags]'), function (s) { return SHORT[s.id]; }), n = secs.length, narrow = w < 560, cx = w / 2, cy = H / 2, R = Math.min(w * (narrow ? 0.29 : 0.33), H * 0.4);
    nodes = secs.map(function (s, i) { var a = -Math.PI / 2 + 2 * Math.PI * i / n; return { id: s.id, tags: (s.dataset.tags || '').split(' ').filter(Boolean), x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), a: a }; });
    var on = RN.thread ? [RN.thread] : Object.keys(RN.THREADS), focus = hover >= 0 ? hover : sel;
    for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
      var A = nodes[i], B = nodes[j], sh = A.tags.filter(function (t) { return B.tags.indexOf(t) >= 0 && on.indexOf(t) >= 0; }); if (!sh.length) continue;
      var hot = focus === i || focus === j; if (focus >= 0 && !hot) continue;
      sh.forEach(function (t, si) { x.strokeStyle = c(RN.THREADS[t][1]); x.globalAlpha = hot ? 0.85 : (RN.thread ? 0.6 : 0.16); x.lineWidth = hot ? 1.8 : 1; var off = (si - (sh.length - 1) / 2) * 3; x.beginPath(); x.moveTo(A.x + off, A.y + off); x.quadraticCurveTo(cx + (A.x + B.x - 2 * cx) * 0.15, cy + (A.y + B.y - 2 * cy) * 0.15, B.x + off, B.y + off); x.stroke(); });
    }
    x.globalAlpha = 1; x.lineWidth = 1; x.font = F(narrow ? 10 : 12);
    nodes.forEach(function (N, i) {
      var inT = !RN.thread || N.tags.indexOf(RN.thread) >= 0; x.globalAlpha = inT ? 1 : 0.3; x.fillStyle = i === focus ? c('--rn-prime') : c('--rn-ink'); x.beginPath(); x.arc(N.x, N.y, i === focus ? 7 : 5, 0, 7); x.fill();
      if (i === sel) { x.strokeStyle = c('--rn-gold'); x.lineWidth = 3; x.beginPath(); x.arc(N.x, N.y, 10, 0, 7); x.stroke(); x.lineWidth = 1; }
      var lx = N.x + Math.cos(N.a) * 12, ly = N.y + Math.sin(N.a) * 12; x.textAlign = Math.cos(N.a) > 0.2 ? 'left' : Math.cos(N.a) < -0.2 ? 'right' : 'center'; x.textBaseline = Math.sin(N.a) > 0.5 ? 'top' : Math.sin(N.a) < -0.5 ? 'bottom' : 'middle';
      x.fillStyle = c('--rn-ink'); var lab = SHORT[N.id]; if (narrow && lab.length > 14) lab = lab.slice(0, 13) + '…'; x.fillText(lab, lx, ly);
    });
    x.globalAlpha = 1;
    var key = $('mapKey'); if (!key.childElementCount) key.innerHTML = Object.keys(RN.THREADS).map(function (k) { return '<li style="--c:var(' + RN.THREADS[k][1] + ')">' + RN.THREADS[k][0] + '</li>'; }).join('');
  }
  function note(i) {
    if (i < 0) return; var A = nodes[i], links = nodes.filter(function (B, j) { return j !== i && B.tags.some(function (t) { return A.tags.indexOf(t) >= 0; }); }).map(function (B) { return SHORT[B.id]; });
    $('mapNote').innerHTML = '<b>' + SHORT[A.id] + '</b> shares ' + A.tags.map(function (t) { return RN.THREADS[t][0].toLowerCase(); }).join(', ') + ' with ' + links.length + ' sections: ' + links.join(', ') + '.';
  }
  function pick(e) { var r = $('mapCan').getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, best = -1, bd = 26 * 26; nodes.forEach(function (N, i) { var d = (N.x - px) * (N.x - px) + (N.y - py) * (N.y - py); if (d < bd) { bd = d; best = i; } }); return best; }
  function go(i) { var el = $(nodes[i].id); if (el) { el.scrollIntoView({ behavior: RN.reduced ? 'auto' : 'smooth' }); var h = el.querySelector('h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } } }
  RN.def('mapSec', {
    init: function () {
      var cv = $('mapCan');
      cv.addEventListener('pointermove', function (e) { var i = pick(e); if (i !== hover) { hover = i; draw(); cv.style.cursor = i >= 0 ? 'pointer' : 'default'; note(i); } });
      cv.addEventListener('pointerleave', function () { hover = -1; draw(); });
      cv.addEventListener('click', function (e) { var i = pick(e); if (i >= 0) go(i); });
      cv.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { sel = (sel + 1) % nodes.length; } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { sel = (sel - 1 + nodes.length) % nodes.length; } else if ((e.key === 'Enter' || e.key === ' ') && sel >= 0) { e.preventDefault(); go(sel); return; } else return;
        e.preventDefault(); draw(); note(sel);
      });
      cv.addEventListener('blur', function () { sel = -1; draw(); });
      draw();
    }, redraw: draw
  });
})(window.RN);
