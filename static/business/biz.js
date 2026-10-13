/* Business cases: filter the gallery, and save a case card as a picture (title, summary and the key takeaway). */
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
    sz('italic 400 40px ' + serif); var ml = wrap(g, d.moral, Wd - 2 * pad - 30);
    var H = 150 + tl.length * 68 + 60 + sl.length * 46 + 70 + 50 + ml.length * 54 + 150;
    H = Math.max(H, 1080);
    cv.width = Wd * S; cv.height = H * S; g.scale(S, S);
    g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, Wd, H);
    g.fillStyle = '#004225'; g.fillRect(0, 0, Wd, 110);
    g.fillStyle = '#d8b860'; g.font = '700 22px ' + sans; g.textBaseline = 'middle';
    g.fillText('BUSINESS CASES', pad, 55); g.textAlign = 'right'; g.fillStyle = '#f3ead2'; g.font = '600 22px ' + serif; g.fillText('Teddy Rook Book', Wd - pad, 55); g.textAlign = 'left';
    var y = 160; g.textBaseline = 'top';
    g.fillStyle = '#004225'; g.font = '700 58px ' + serif; tl.forEach(function (l) { g.fillText(l, pad, y); y += 68; });
    g.fillStyle = '#7a6a3a'; g.font = '600 26px ' + sans; g.fillText(d.co.toUpperCase(), pad, y + 6); y += 60;
    g.fillStyle = '#2b332e'; g.font = '400 32px ' + sans; sl.forEach(function (l) { g.fillText(l, pad, y); y += 46; });
    y += 40; g.fillStyle = '#b8963e'; g.fillRect(pad, y, 120, 5); y += 30;
    g.fillStyle = '#b8963e'; g.font = '700 24px ' + sans; g.fillText('KEY TAKEAWAY', pad, y); y += 46;
    g.fillStyle = '#1d2320'; g.font = 'italic 400 40px ' + serif; ml.forEach(function (l) { g.fillText(l, pad, y); y += 54; });
    g.fillStyle = '#8a948e'; g.font = '400 22px ' + sans; g.fillText('teddyrookbook.com/business/cases/' + d.slug, pad, H - 70);
    return cv;
  }
  // the whole case on one page: summary, takeaway, numbers, timeline and lessons
  function page(d) {
    var Wd = 1400, S = 2, pad = 90, gap = 60, colW = (Wd - 2 * pad - gap) / 2, cv = D.createElement('canvas'), g = cv.getContext('2d');
    var serif = 'Georgia, "Times New Roman", serif', sans = 'system-ui, -apple-system, "Segoe UI", sans-serif';
    function sz(f) { g.font = f; }
    sz('700 64px ' + serif); var tl = wrap(g, d.title, Wd - 2 * pad);
    sz('400 30px ' + sans); var sl = wrap(g, d.sum, Wd - 2 * pad);
    sz('italic 400 38px ' + serif); var ml = wrap(g, d.moral, Wd - 2 * pad - 60);
    // numbers (left) and timeline (right)
    var nums = (d.nums || []).slice(0, 6).map(function (n) { sz('400 22px ' + sans); var l = wrap(g, n[0], colW); sz('700 30px ' + sans); var v = wrap(g, n[1], colW); return { l: l, v: v }; });
    var nH = nums.reduce(function (s, n) { return s + n.l.length * 30 + n.v.length * 38 + 26; }, 0);
    var tls = (d.tl || []).slice(0, 7).map(function (t) { sz('400 24px ' + sans); return { w: t[0], x: wrap(g, t[1], colW - 30) }; });
    var tH = tls.reduce(function (s, t) { return s + 32 + t.x.length * 32 + 18; }, 0);
    var les = (d.lessons || []).map(function (x) { var i = x.indexOf(': '), nm = i > 0 ? x.slice(0, i) : '', tx = i > 0 ? x.slice(i + 2) : x; sz('400 26px ' + sans); return { nm: nm, tx: wrap(g, (nm ? nm + '. ' : '') + tx, Wd - 2 * pad - 30), nmw: (function () { sz('700 26px ' + sans); return g.measureText(nm + '. ').width; })() }; });
    var lH = les.reduce(function (s, l) { return s + l.tx.length * 37 + 22; }, 0);
    var H = 110 + 60 + tl.length * 74 + 56 + sl.length * 44 + 50 + (90 + ml.length * 52 + 40) + 50 + (70 + Math.max(nH, tH)) + 40 + (70 + lH) + 120;
    cv.width = Wd * S; cv.height = H * S; g.scale(S, S); g.textBaseline = 'top';
    g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, Wd, H);
    g.fillStyle = '#004225'; g.fillRect(0, 0, Wd, 110);
    g.fillStyle = '#d8b860'; g.font = '700 24px ' + sans; g.textBaseline = 'middle'; g.fillText('BUSINESS CASES', pad, 55);
    g.textAlign = 'right'; g.fillStyle = '#f3ead2'; g.font = '600 24px ' + serif; g.fillText('Teddy Rook Book', Wd - pad, 55); g.textAlign = 'left'; g.textBaseline = 'top';
    var y = 160;
    g.fillStyle = '#004225'; g.font = '700 64px ' + serif; tl.forEach(function (l) { g.fillText(l, pad, y); y += 74; });
    g.fillStyle = '#7a6a3a'; g.font = '600 26px ' + sans; g.fillText(d.co.toUpperCase(), pad, y + 6); y += 56;
    g.fillStyle = '#2b332e'; g.font = '400 30px ' + sans; sl.forEach(function (l) { g.fillText(l, pad, y); y += 44; });
    y += 50;
    var bh = 90 + ml.length * 52; g.fillStyle = '#f1e7cc'; g.fillRect(pad, y, Wd - 2 * pad, bh); g.fillStyle = '#b8963e'; g.fillRect(pad, y, 8, bh);
    g.font = '700 22px ' + sans; g.fillText('KEY TAKEAWAY', pad + 36, y + 28);
    g.fillStyle = '#1d2320'; g.font = 'italic 400 38px ' + serif; var yy = y + 66; ml.forEach(function (l) { g.fillText(l, pad + 36, yy); yy += 52; });
    y += bh + 50;
    function head(t, x, yh) { g.fillStyle = '#004225'; g.font = '700 34px ' + serif; g.fillText(t, x, yh); g.fillStyle = '#b8963e'; g.fillRect(x, yh + 46, 80, 4); }
    if (nums.length) {
      head('By the numbers', pad, y); var y1 = y + 70;
      nums.forEach(function (n) { g.fillStyle = '#5d6862'; g.font = '400 22px ' + sans; n.l.forEach(function (l) { g.fillText(l, pad, y1); y1 += 30; }); g.fillStyle = '#004225'; g.font = '700 30px ' + sans; n.v.forEach(function (l) { g.fillText(l, pad, y1); y1 += 38; }); y1 += 26; });
    }
    if (tls.length) {
      var x2 = pad + colW + gap; head('Timeline', x2, y); var y2 = y + 70;
      tls.forEach(function (t) { g.fillStyle = '#b8963e'; g.beginPath(); g.arc(x2 + 8, y2 + 14, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = '#004225'; g.font = '700 24px ' + sans; g.fillText(t.w, x2 + 30, y2); y2 += 32; g.fillStyle = '#2b332e'; g.font = '400 24px ' + sans; t.x.forEach(function (l) { g.fillText(l, x2 + 30, y2); y2 += 32; }); y2 += 18; });
    }
    y += 70 + Math.max(nH, tH) + 40;
    if (les.length) {
      head('Lessons learned', pad, y); y += 74;
      les.forEach(function (l) {
        g.fillStyle = '#b8963e'; g.fillRect(pad, y + 12, 10, 10);
        l.tx.forEach(function (line, i) {
          var x = pad + 30;
          if (i === 0 && l.nm && line.indexOf(l.nm) === 0) { g.fillStyle = '#004225'; g.font = '700 26px ' + sans; g.fillText(l.nm + '.', x, y); x += l.nmw; line = line.slice(l.nm.length + 2); }
          g.fillStyle = '#2b332e'; g.font = '400 26px ' + sans; g.fillText(line, x, y); y += 37;
        });
        y += 22;
      });
    }
    g.fillStyle = '#8a948e'; g.font = '400 22px ' + sans; g.fillText('teddyrookbook.com/business/cases/' + d.slug + '  ·  sources and the full story at this link', pad, H - 70);
    return cv;
  }
  D.addEventListener('click', function (e) {
    var b = e.target.closest('.bz-save'); if (!b) return;
    var d = JSON.parse(b.dataset.card), full = b.dataset.kind === 'page', cv = full ? page(d) : card(d);
    cv.toBlob(function (blob) {
      var name = 'business-case-' + d.slug + (full ? '-one-page' : '') + '.png';
      try { var f = new File([blob], name, { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] }) && /Mobi|Android|iPhone|iPad/.test(navigator.userAgent)) { navigator.share({ files: [f], title: d.title }).catch(function () { }); return; } } catch (er) { }
      var a = D.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }, 'image/png');
  });
})(window, document);
