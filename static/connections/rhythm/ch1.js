/* The Rhythm of Numbers, chapter I: hero, formula, levels, composer, ladder. Conventions: core.js. */
(function (RN) {
  'use strict';
  var $ = RN.$, c = RN.c, F = RN.font;
  var PI3 = Math.PI - 3;
  var hit = function (i, h, n) { return Math.floor((i + 1) * h / n) > Math.floor(i * h / n); };

  /* ---------- hero ---------- */
  var heroHead = -1;
  function ring(cv, h, n, hl) {
    var r = RN.setupSq(cv, 200), x = r[0], w = r[1], cx = w / 2, cy = w / 2, R = w * 0.42;
    x.clearRect(0, 0, w, w); x.strokeStyle = c('--rn-line'); x.lineWidth = 1; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
    var pts = [];
    for (var i = 0; i < n; i++) { var a = -Math.PI / 2 + 2 * Math.PI * i / n; if (hit(i, h, n)) pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
    x.strokeStyle = c('--rn-g'); x.globalAlpha = 0.35; x.beginPath(); pts.forEach(function (p, k) { if (k) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]); }); x.closePath(); x.stroke(); x.globalAlpha = 1;
    for (i = 0; i < n; i++) { var b = -Math.PI / 2 + 2 * Math.PI * i / n, H = hit(i, h, n); x.fillStyle = H ? c('--rn-g') : c('--rn-muted'); x.beginPath(); x.arc(cx + R * Math.cos(b), cy + R * Math.sin(b), H ? (n > 50 ? 3.6 : 6) : (n > 50 ? 1.3 : 2.5), 0, 7); x.fill(); }
    if (hl != null && hl >= 0) { var j = hl % n, a2 = -Math.PI / 2 + 2 * Math.PI * j / n; x.strokeStyle = c('--rn-prime'); x.lineWidth = 2.5; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + R * Math.cos(a2), cy + R * Math.sin(a2)); x.stroke(); }
    x.fillStyle = c('--rn-ink'); x.font = F(Math.round(w * 0.12)); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(h + '/' + n, cx, cy);
  }
  function strip() {
    var cv = $('strip'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var N = Math.min(240, Math.floor(w / 3.2)), cw = w / N, last = -1;
    for (var i = 0; i < N; i++) {
      var isH = Math.floor((i + 1) * PI3) > Math.floor(i * PI3), X = i * cw;
      x.fillStyle = isH ? c('--rn-g') : c('--rn-soft'); x.fillRect(X + 0.5, isH ? 14 : 30, Math.max(1, cw - 1), isH ? 36 : 20);
      if (isH) { if (last >= 0 && i - last === 8) { x.fillStyle = c('--rn-prime'); x.fillRect(last * cw, 54, (i - last) * cw, 4); x.font = F(11, 1); x.fillText('8', (last + i) / 2 * cw - 3, 68); } last = i; }
      if (heroHead >= 0 && i === heroHead % N) { x.fillStyle = c('--rn-prime'); x.fillRect(X, 2, Math.max(2, cw), 8); }
    }
    x.fillStyle = c('--rn-muted'); x.font = F(11, 1); x.textBaseline = 'alphabetic'; x.fillText('beats →', 2, 11);
  }
  function drawHero() { var s = heroHead >= 0 ? heroHead : null; ring($('r1'), 1, 7, s); ring($('r2'), 10, 71, s); ring($('r3'), 16, 113, s); strip(); }
  RN.def('hero', {
    init: function () {
      drawHero();
      RN.player({ sec: $('hero'), btn: $('playPi'), teach: $('heroTeach'), loop: false, len: function () { return 226; }, dur: function () { return 0.07; },
        step: function (i, t) { var H = Math.floor((i + 1) * PI3) > Math.floor(i * PI3); if (H) RN.note(t, 81, 0.12, 0.32); else if (i % 113 === 0) RN.note(t, 57, 0.15, 0.3); else RN.tick(t, 0.03); },
        draw: function (i) { heroHead = i; drawHero(); } });
    },
    redraw: drawHero
  });

  /* ---------- 1 formula ---------- */
  function drawK() {
    var k = +$('kS').value; $('kV').textContent = k; var n = 22 * k + 3, d = 7 * k + 1, v = n / d;
    $('fF').textContent = '3 + ' + k + '/' + d + ' = ' + n + '/' + d; $('fD').textContent = v.toFixed(10);
    var e = v - Math.PI; $('fE').textContent = (e > 0 ? '+' : '') + e.toExponential(2); $('fP').innerHTML = RN.fmtF(n) + ' / ' + RN.fmtF(d);
    var cv = $('kChart'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var L = 46, R = 10, T = 12, B = 28, pw = w - L - R, ph = H - T - B;
    var ys = function (lg) { return T + ph * (-1 - lg) / 6.5; }, xs = function (kk) { return L + pw * (kk - 1) / 39; };
    x.strokeStyle = c('--rn-line'); x.fillStyle = c('--rn-muted'); x.font = F(11, 1); x.textAlign = 'right'; x.textBaseline = 'middle';
    for (var g = -1; g >= -7; g--) { var Y = ys(g); x.beginPath(); x.moveTo(L, Y); x.lineTo(w - R, Y); x.stroke(); x.fillText('1e' + g, L - 6, Y); }
    x.textAlign = 'center'; x.textBaseline = 'top'; [1, 10, 16, 20, 30, 40].forEach(function (kk) { x.fillText(kk, xs(kk), H - B + 8); });
    x.strokeStyle = c('--rn-g'); x.lineWidth = 1.5; x.beginPath();
    for (var kk = 1; kk <= 40; kk += 0.05) { var lg = Math.log10(Math.abs((22 * kk + 3) / (7 * kk + 1) - Math.PI)); var Yy = ys(Math.max(-7.5, lg)); if (kk === 1) x.moveTo(xs(kk), Yy); else x.lineTo(xs(kk), Yy); }
    x.stroke();
    for (kk = 1; kk <= 40; kk++) { var lg2 = Math.log10(Math.abs((22 * kk + 3) / (7 * kk + 1) - Math.PI)), pr = RN.isP(7 * kk + 1); x.fillStyle = kk === k ? c('--rn-teal') : pr ? c('--rn-prime') : c('--rn-g'); x.beginPath(); x.arc(xs(kk), ys(lg2), kk === k ? 6 : pr ? 4 : 2.5, 0, 7); x.fill(); }
    x.fillStyle = c('--rn-muted'); x.textAlign = 'left'; x.fillText('k →', L + 2, T);
  }
  RN.def('formula', { init: function () { $('kS').addEventListener('input', drawK); drawK(); }, redraw: drawK });

  /* ---------- 2 levels ---------- */
  function fmtBig(v) { var s = v.toLocaleString(); return s; }
  function drawLevels() {
    var X = RN.W, rows = [];
    /* convergents of the full number (int + α): p/q with q the block length */
    var hp = [1, X.int], hq = [0, 1];
    for (var lv = 1; lv <= Math.min(X.allTerms.length, 6); lv++) {
      var a = X.allTerms[lv - 1], p = a * hp[1] + hp[0], q = a * hq[1] + hq[0]; hp = [hp[1], p]; hq = [hq[1], q];
      if (q > 1e12) break;
      var hits = p - X.int * q, pr = RN.isP(q), f = pr ? '<span class="rn-p">' + fmtBig(q) + ' prime</span>' : (q < 1e9 ? RN.factor(q).join(' × ') : '—');
      var hear = lv === 1 ? (a - 1) + ' rest' + (a - 1 === 1 ? '' : 's') + ', then a hit' : (a === 1 ? 'one level-' + (lv - 1) + ' block' : a + ' level-' + (lv - 1) + ' blocks') + ', then one level-' + (lv - 2 < 0 ? 0 : lv - 2) + ' block';
      if (lv === 2) hear = (a === 1 ? 'one bar' : a + ' bars') + ' of ' + hq[0] + ', then one extra rest';
      if (lv === 1 && a === 1) hear = 'a hit every beat until the next level';
      rows.push('<tr><td>' + lv + '</td><td' + (a >= 10 ? ' class="rn-p"' : '') + '>' + a + '</td><td>' + fmtBig(q) + '</td><td>' + fmtBig(hits) + '</td><td>' + fmtBig(p) + '/' + fmtBig(q) + '</td><td>' + f + '</td><td class="rn-wrap">' + hear + '</td></tr>');
    }
    $('lvBody').innerHTML = rows.join('');
    $('lvNote').hidden = X.key !== 'pi';
  }
  RN.def('levels', { init: drawLevels, number: drawLevels });

  /* ---------- 3 composer ---------- */
  var playPos = -1, spanMul = 1.15, comp = null, st = { pitch: 0, deg: 0, last: -1 };
  function composerNumber() {
    var W = RN.W, zl = $('zoom'); zl.innerHTML = '';
    for (var lv = 1; lv <= Math.min(W.levels, 6); lv++) { if (W.q(lv) > RN.MAXLEN) break; var o = document.createElement('option'); o.value = lv; o.textContent = lv + ' (' + W.q(lv).toLocaleString() + ' beats)'; zl.append(o); }
    zl.value = Math.min(3, zl.options.length); spanMul = 1.15; $('startBeat').value = 0;
    $('terms').value = W.allTerms.slice(0, 24).join(',');
    $('cVal').textContent = W.name + ' = ' + W.alpha.toPrecision(10); $('cQ').textContent = W.Q.slice(2, 8).map(function (v) { return v.toLocaleString(); }).join(', ');
    var gaps = {}, last = -1; for (var i = 0; i < 20000; i++) if (W.word[i]) { if (last >= 0) gaps[i - last] = 1; last = i; }
    $('cG').textContent = Object.keys(gaps).map(Number).sort(function (a, b) { return a - b; }).join(' and ');
    drawRibbon();
  }
  function firstRare() {
    var W = RN.W, best = -1, row = 1;
    for (var r = 1; r < W.R && r < W.terms.length; r++) { if (W.terms[r] > best) { best = W.terms[r]; row = r; } }
    var rt = W.rowType[row]; if (!rt) return null;
    for (var i = 1; i < RN.MAXLEN; i++) if (rt[i] === 2) return { i: i, row: row };
    return null;
  }
  function drawRibbon() {
    var W = RN.W, cv = $('ribbon'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var zl = +$('zoom').value || 1, S = Math.max(0, Math.min(RN.MAXLEN - 1, +$('startBeat').value || 0));
    var span = Math.max(2, Math.min(RN.MAXLEN - S, Math.ceil(W.q(zl) * spanMul) + 1));
    var rows = Math.min(W.R, zl + 1), Lm = 58, top = 8, rowH = Math.min(30, (H - 70) / Math.max(1, rows)), pw = w - Lm - 6;
    var Xb = function (b) { return Lm + pw * (b - S) / span; };
    x.font = F(11, 1); x.textBaseline = 'middle';
    for (var row = rows; row >= 1; row--) {
      var y = top + (rows - row) * rowH; x.fillStyle = c('--rn-muted'); x.textAlign = 'right'; x.fillText('level ' + row, Lm - 8, y + rowH / 2);
      var rt = W.rowType[row], cur = -1, curT = 0;
      for (var i = S; i >= 0 && i > S - W.q(row) - 2; i--) { if (rt[i]) { cur = i; curT = rt[i]; break; } }
      var seg = function (a, b, t, len) {
        var x0 = Xb(a), x1 = Xb(b); x.fillStyle = t === 2 ? c('--rn-prime') : c('--rn-g'); x.globalAlpha = t === 2 ? 0.9 : 0.28 + 0.1 * (row % 2);
        x.fillRect(x0 + 0.5, y + 3, Math.max(1, x1 - x0 - 1), rowH - 6); x.globalAlpha = 1;
        if (x1 - x0 > 34) { x.fillStyle = c('--rn-ink'); x.textAlign = 'center'; x.fillText(len, (x0 + x1) / 2, y + rowH / 2); }
      };
      for (i = S; i < S + span; i++) { if (rt[i]) { if (cur >= 0 && i > cur) seg(Math.max(cur, S), i, curT, i - cur); cur = i; curT = rt[i]; } }
      if (cur >= 0) { var e = cur + 1; while (e < RN.MAXLEN && !rt[e]) e++; seg(Math.max(cur, S), Math.min(S + span, e), curT, e - cur); }
    }
    var yh = top + rows * rowH + 8, hh = H - yh - 22; x.fillStyle = c('--rn-muted'); x.textAlign = 'right'; x.fillText('hits', Lm - 8, yh + hh / 2);
    var per = span / pw; x.fillStyle = c('--rn-ink');
    if (per < 1.5) { for (i = S; i < S + span; i++) if (W.word[i]) x.fillRect(Xb(i), yh, Math.max(1.2, pw / span * 0.7), hh); }
    else { for (var px = 0; px < pw; px++) { var a = Math.floor(S + px * per), b = Math.floor(S + (px + 1) * per), c2 = 0; for (i = a; i < b; i++) c2 += W.word[i]; if (c2) { x.globalAlpha = Math.min(1, 0.25 + c2 / (b - a) * 3); x.fillRect(Lm + px, yh, 1, hh); } } x.globalAlpha = 1; }
    x.fillStyle = c('--rn-muted'); x.textAlign = 'left'; x.fillText('beat ' + S.toLocaleString(), Lm, H - 8); x.textAlign = 'right'; x.fillText((S + span).toLocaleString(), w - 6, H - 8);
    if (playPos >= S && playPos < S + span) { x.fillStyle = c('--rn-prime'); x.fillRect(Xb(playPos), top, 2.5, H - top - 18); }
  }
  function useTerms() { var r = RN.parseNum($('terms').value, 'terms'); if (r.err) { $('cNow').textContent = r.err; return; } var s = $('gNum'); s.value = 'terms'; $('gIn').hidden = $('gApply').hidden = false; $('gIn').value = $('terms').value; RN.setNum(r); }
  RN.def('composer', {
    init: function () {
      $('applyTerms').addEventListener('click', useTerms);
      $('terms').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); useTerms(); } });
      $('zoom').addEventListener('change', function () { spanMul = 1.15; drawRibbon(); });
      $('startBeat').addEventListener('change', function () { if (comp) comp.resetStep(); drawRibbon(); });
      $('jumpGlitch').addEventListener('click', function () {
        var r = firstRare(); if (!r) { $('cNow').textContent = 'This number has no rare block in reach.'; return; }
        $('zoom').value = Math.min(r.row, $('zoom').options.length); spanMul = 3.3;
        $('startBeat').value = Math.max(0, r.i - RN.W.q(+$('zoom').value) * 2 - 3); if (comp) comp.resetStep(); drawRibbon();
        $('cNow').textContent = 'rare block at beat ' + r.i.toLocaleString();
      });
      $('tempo').addEventListener('input', function () { $('tempoV').textContent = $('tempo').value; });
      var PEN = function (d) { return RN.degree(d, 62) - RN.keyOff(); };
      comp = RN.player({ sec: $('composer'), btn: $('play'), teach: $('cTeach'), loop: false, swing: false,
        from: function () { return Math.max(0, +$('startBeat').value || 0); }, len: function () { return RN.MAXLEN; },
        dur: function () { return 1 / (+$('tempo').value); },
        reset: function () { st = { pitch: 0, deg: 0, last: -1 }; var W = RN.W, i0 = Math.max(0, +$('startBeat').value || 0); for (var j = i0 - 1; j >= 0 && j > i0 - 200; j--) if (W.word[j]) { st.last = j; break; } },
        step: function (i, t) {
          var W = RN.W, m = W.mark[i], ty = W.typ[i], rule = $('pitchRule').value;
          if (W.word[i]) {
            var gap = st.last >= 0 ? i - st.last : 0; st.last = i;
            if (rule === 'gap') { st.pitch = (st.pitch + gap) % 12; RN.note(t, 64 + st.pitch, 0.35, 0.16); }
            else if (rule === 'scale') { var n = (RN.SCALES[RN.snd.scale] || [0]).length; st.deg = (st.deg + 1) % (2 * n); RN.note(t, PEN(st.deg), 0.3, 0.16); }
            else RN.drum('hat', t, 0.9);
          } else RN.tick(t, 0.012);
          if (m >= 2) RN.voice('sine', t, RN.mtof((ty === 2 ? 43 : 38) + RN.keyOff()), 0.5, 0.3);
          if (m >= 3) { RN.voice('sine', t, RN.mtof((ty === 2 ? 84 : 79) + RN.keyOff()), 1.2, 0.08); RN.voice('sine', t, RN.mtof((ty === 2 ? 91 : 86) + RN.keyOff()), 1.2, 0.05); }
          if (m >= 4) { RN.voice('sine', t, RN.mtof(31 + RN.keyOff()), 3, 0.35); RN.noise(t, 0.8, 0.08, 800); }
        },
        draw: function (i) {
          playPos = i; $('cNow').textContent = i < 0 ? 'stopped' : 'beat ' + i.toLocaleString();
          var zl = +$('zoom').value || 1, S = +$('startBeat').value || 0, span = Math.ceil(RN.W.q(zl) * spanMul) + 1;
          if ($('cFollow').checked && i >= 0 && (i > S + span || i < S)) $('startBeat').value = i;
          drawRibbon();
        } });
      composerNumber();
    },
    number: function () { if (comp) comp.stop(); composerNumber(); },
    redraw: drawRibbon
  });

  /* ---------- 4 ladder ---------- */
  function drawLadder() {
    var W = RN.W, a = [W.int].concat(W.allTerms);
    $('cTerms').innerHTML = a.map(function (t, i) { return '<span class="' + (t >= 10 && i ? 'rn-big' : '') + '">' + (i === 0 ? t + ';' : t) + '</span>'; }).join('');
    var h0 = 1n, h1 = BigInt(W.int), k0 = 0n, k1 = 1n, rows = [];
    for (var j = 0; j < W.allTerms.length; j++) { var t = BigInt(W.allTerms[j]); var nh = t * h1 + h0; h0 = h1; h1 = nh; var nk = t * k1 + k0; k0 = k1; k1 = nk; rows.push([h1, k1]); }
    var cell = function (v) { var s = v.toString(), P = v > 1n && RN.isPrimeBig(v); return '<span class="' + (P ? 'rn-p' : '') + '">' + (s.length > 16 ? s.slice(0, 8) + '…' + s.slice(-5) + ' (' + s.length + ' digits)' : s) + (P ? ' ◆' : '') + '</span>'; };
    var full = W.int + W.alpha;
    $('cBody').innerHTML = rows.slice(0, 14).map(function (pq, i) { var err = Number(pq[0]) / Number(pq[1]) - full; return '<tr><td>' + (i + 1) + '</td><td>' + cell(pq[0]) + '</td><td>' + cell(pq[1]) + '</td><td>' + (Math.abs(err) < 1e-15 ? '< 1e-15' : err.toExponential(1)) + '</td></tr>'; }).join('');
    var pq = rows.filter(function (r) { return r[1] > 1n && RN.isPrimeBig(r[1]); }).length, pp = rows.filter(function (r) { return r[0] > 1n && RN.isPrimeBig(r[0]); }).length;
    $('cSum').innerHTML = 'Best fractions of ' + RN.esc(W.full) + (W.int ? '' : '') + ' (the bar’s number' + (W.int ? ' plus ' + W.int : '') + '). Over the first ' + rows.length + ': <span class="rn-p">' + pq + '</span> prime denominators and <span class="rn-p">' + pp + '</span> prime numerators. ◆ marks a prime.';
  }
  RN.def('ladder', { init: drawLadder, number: drawLadder });
})(window.RN);
