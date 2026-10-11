/* Business cases: filter the gallery, and save a case card as a picture (title, summary and the lesson). */
(function (W, D) {
  'use strict';
  // ---- filter and search ----
  var grid = D.getElementById('bz-grid');
  if (grid) {
    var q = D.getElementById('bz-q'), tag = '', cards = grid.querySelectorAll('.bz-card');
    function apply() {
      var t = (q.value || '').toLowerCase().trim(), n = 0;
      cards.forEach(function (c) { var ok = (!tag || c.dataset.tags.split('|').indexOf(tag) >= 0) && (!t || c.dataset.q.indexOf(t) >= 0); c.hidden = !ok; if (ok) n++; });
      D.getElementById('bz-none').hidden = n > 0;
    }
    q.addEventListener('input', apply);
    D.querySelectorAll('.bz-chips button').forEach(function (b) { b.addEventListener('click', function () { tag = b.dataset.t; D.querySelectorAll('.bz-chips button').forEach(function (x) { x.classList.toggle('on', x === b); }); apply(); }); });
  }
  // ---- card picture ----
  function wrap(g, text, max) { var words = String(text).split(/\s+/), lines = [], cur = ''; words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur); return lines; }
  function card(d) {
    var Wd = 1080, S = 2, pad = 80, cv = D.createElement('canvas'), g = cv.getContext('2d');
    var serif = 'Georgia, "Times New Roman", serif', sans = 'system-ui, -apple-system, "Segoe UI", sans-serif';
    function sz(f) { g.font = f; }
    // measure
    sz('700 58px ' + serif); var tl = wrap(g, d.title, Wd - 2 * pad);
    sz('400 32px ' + sans); var sl = wrap(g, d.sum, Wd - 2 * pad);
    sz('italic 400 46px ' + serif); var ml = wrap(g, '“' + d.moral + '”', Wd - 2 * pad - 30);
    var H = 150 + tl.length * 68 + 60 + sl.length * 46 + 70 + 50 + ml.length * 60 + 150;
    H = Math.max(H, 1080);
    cv.width = Wd * S; cv.height = H * S; g.scale(S, S);
    g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, Wd, H);
    g.fillStyle = '#004225'; g.fillRect(0, 0, Wd, 110);
    g.fillStyle = '#d8b860'; g.font = '700 22px ' + sans; g.textBaseline = 'middle';
    g.fillText('BUSINESS FABLES', pad, 55); g.textAlign = 'right'; g.fillStyle = '#f3ead2'; g.font = '600 22px ' + serif; g.fillText('Teddy Rook Book', Wd - pad, 55); g.textAlign = 'left';
    var y = 160; g.textBaseline = 'top';
    g.fillStyle = '#004225'; g.font = '700 58px ' + serif; tl.forEach(function (l) { g.fillText(l, pad, y); y += 68; });
    g.fillStyle = '#7a6a3a'; g.font = '600 26px ' + sans; g.fillText(d.co.toUpperCase(), pad, y + 6); y += 60;
    g.fillStyle = '#2b332e'; g.font = '400 32px ' + sans; sl.forEach(function (l) { g.fillText(l, pad, y); y += 46; });
    y += 40; g.fillStyle = '#b8963e'; g.fillRect(pad, y, 120, 5); y += 30;
    g.fillStyle = '#b8963e'; g.font = '700 24px ' + sans; g.fillText('THE LESSON', pad, y); y += 46;
    g.fillStyle = '#1d2320'; g.font = 'italic 400 46px ' + serif; ml.forEach(function (l) { g.fillText(l, pad, y); y += 60; });
    g.fillStyle = '#8a948e'; g.font = '400 22px ' + sans; g.fillText('teddyrookbook.com/business/cases/' + d.slug, pad, H - 70);
    return cv;
  }
  D.addEventListener('click', function (e) {
    var b = e.target.closest('.bz-save'); if (!b) return;
    var d = JSON.parse(b.dataset.card), cv = card(d);
    cv.toBlob(function (blob) {
      var name = 'business-fable-' + d.slug + '.png';
      try { var f = new File([blob], name, { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] }) && /Mobi|Android|iPhone|iPad/.test(navigator.userAgent)) { navigator.share({ files: [f], title: d.title }).catch(function () { }); return; } } catch (er) { }
      var a = D.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }, 'image/png');
  });
})(window, document);
