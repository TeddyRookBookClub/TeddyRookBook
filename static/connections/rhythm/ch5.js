/* The Rhythm of Numbers, chapter V: cfrac, mersenne, reverse, hunt. Conventions: core.js. */
(function (RN) {
  'use strict';
  var $ = RN.$, c = RN.c, gcd = RN.gcd;

  /* ---------- 16 continued-fraction factoring (the Lehmer–Powers single-square version) ---------- */
  function isqrt(n) { if (n < 2n) return n; var x = BigInt(Math.floor(Math.sqrt(Number(n)))); if (x < 1n) x = 1n; for (var i = 0; i < 200; i++) { var y = (x + n / x) >> 1n; if (y === x) break; if (y === x + 1n || y === x - 1n) { x = y; break; } x = y; } while (x * x > n) x--; while ((x + 1n) * (x + 1n) <= n) x++; return x; }
  var bgcd = function (a, b) { a = a < 0n ? -a : a; while (b) { var t = a % b; a = b; b = t; } return a; };
  RN.cfracFactor = function (N, onDone, onProgress, job) {
    job = job || { stop: false };
    if (N < 4n) { onDone({ msg: 'Enter a number of 4 or more.' }); return job; }
    if (RN.isPrimeBig(N)) { onDone({ prime: true }); return job; }
    for (var k = 0; k < 15; k++) { var p = RN.SMALLB[k]; if (N % p === 0n && N !== p) { onDone({ a: p, b: N / p, trial: true }); return job; } }
    var s0 = isqrt(N); if (s0 * s0 === N) { onDone({ square: s0 }); return job; }
    var mu = 1n, total = 0, LIM = 160000;
    function runMult() {
      if (job.stop) return;
      var M = N * mu, m = isqrt(M); if (m * m === M) { mu++; setTimeout(runMult, 0); return; }
      var P = 0n, Q = 1n, a = m, A2 = 1n, A1 = m % N, kk = 1, rows = [];
      (function chunk() {
        if (job.stop) return; var t0 = performance.now();
        while (kk < LIM && performance.now() - t0 < 25) {
          P = a * Q - P; Q = (M - P * P) / Q; a = (m + P) / Q; total++;
          if (rows.length < 8) rows.push([kk, a, Q, '']);
          if (kk % 2 === 0) { var s = isqrt(Q); if (s * s === Q) { var gs = [bgcd(A1 - s, N), bgcd(A1 + s, N)]; for (var g = 0; g < 2; g++) { if (gs[g] > 1n && gs[g] < N) { rows.push(['…', '', '', '']); rows.push([kk, a, Q, 'yes, ' + s + '²']); onDone({ a: gs[g], b: N / gs[g], rows: rows, steps: kk, total: total, mu: mu }); return; } } } }
          var nA = (a * A1 + A2) % N; A2 = A1; A1 = nA; kk++;
        }
        if (onProgress) onProgress(total, mu, rows);
        if (kk < LIM) { setTimeout(chunk, 0); return; }
        if (mu < 40n) { mu++; setTimeout(runMult, 0); return; }
        onDone({ msg: 'No single square found. The full method combines several Q values, which this teaching version skips.', rows: rows });
      })();
    }
    runMult(); return job;
  };
  var cfJob = null;
  function runCf() {
    var N; try { N = BigInt(($('cfN').value || '').replace(/[^0-9]/g, '') || '0'); } catch (e) { $('cfRes').textContent = 'Enter a whole number.'; return; }
    if (cfJob) cfJob.stop = true; $('cfBody').innerHTML = ''; $('cfSteps').textContent = '—'; $('cfMul').textContent = '—'; $('cfRes').textContent = 'running…';
    var rowsHTML = function (rows) { return rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + (r[3] ? '<span class="rn-p">' + r[3] + '</span>' : '') + '</td></tr>'; }).join(''); };
    cfJob = RN.cfracFactor(N, function (r) {
      if (r.prime) $('cfRes').innerHTML = '<span class="rn-p">prime</span>, nothing to split';
      else if (r.square) $('cfRes').textContent = r.square + '², a perfect square';
      else if (r.msg) $('cfRes').textContent = r.msg;
      else { var pa = RN.isPrimeBig(BigInt(String(r.a))), pb = RN.isPrimeBig(BigInt(String(r.b))), part = function (v, p) { return p ? '<span class="rn-p">' + v + '</span>' : String(v); }; $('cfRes').innerHTML = part(r.a, pa) + ' × ' + part(r.b, pb) + (r.trial ? ' (found by trial division)' : '') + (pa && pb ? '' : '. ' + [pa ? '' : r.a, pb ? '' : r.b].filter(Boolean).join(' and ') + ' is not prime yet: factor it again.'); if (r.steps) { $('cfSteps').textContent = r.steps.toLocaleString(); $('cfMul').textContent = r.mu + ' × N'; } }
      if (r.rows) $('cfBody').innerHTML = rowsHTML(r.rows);
    }, function (total, mu) { $('cfSteps').textContent = total.toLocaleString() + ' (trying ' + mu + ' × N)'; });
  }
  RN.def('cfrac', {
    init: function () {
      $('cfRun').addEventListener('click', runCf);
      $('cfN').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); runCf(); } });
      document.querySelectorAll('[data-cf]').forEach(function (b) { b.addEventListener('click', function () { $('cfN').value = b.dataset.cf; runCf(); }); });
    }
  });

  /* ---------- 17 Mersenne circles ---------- */
  var selOrbit = 0, orbits = [];
  function computeOrbits(p) { var M = Math.pow(2, p) - 1, seen = new Uint8Array(M), out = []; for (var s = 1; s < M; s++) { if (seen[s]) continue; var o = [], v = s; while (!seen[v]) { seen[v] = 1; o.push(v); v = 2 * v % M; } out.push(o); } return out; }
  function drawMers() {
    var p = +$('mS').value; $('mV').textContent = p; var M = Math.pow(2, p) - 1; orbits = computeOrbits(p); if (selOrbit >= orbits.length) selOrbit = 0;
    $('mM').textContent = M; $('mPr').innerHTML = RN.isP(M) ? '<span class="rn-p">prime (a Mersenne prime)</span>' : M === 1 ? '—' : RN.factor(M).join(' × ');
    $('mO').textContent = orbits.length; var lens = {}; orbits.forEach(function (o) { lens[o.length] = (lens[o.length] || 0) + 1; });
    $('mL').textContent = Object.keys(lens).map(function (l) { return lens[l] + ' of length ' + l; }).join(', ');
    var cv = $('mCirc'), w0 = cv.clientWidth, r = RN.setup(cv, Math.min(w0, 460)), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var cx = w / 2, cy = H / 2, R = H * 0.45, P = function (i) { return [cx + R * Math.cos(-Math.PI / 2 + 2 * Math.PI * i / M), cy + R * Math.sin(-Math.PI / 2 + 2 * Math.PI * i / M)]; }, dark = RN.dark();
    orbits.forEach(function (o, j) { var hue = (j * 137.508) % 360; x.strokeStyle = j === selOrbit ? c('--rn-prime') : 'hsla(' + hue + ',55%,' + (dark ? 65 : 40) + '%,' + (M > 500 ? 0.35 : 0.6) + ')'; x.lineWidth = j === selOrbit ? 2.5 : (M > 500 ? 0.5 : 1); x.beginPath(); o.forEach(function (v, i) { var a = P(v), b = P(o[(i + 1) % o.length]); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); }); x.stroke(); });
    if (M <= 127) { x.fillStyle = c('--rn-muted'); for (var i = 0; i < M; i++) { var q = P(i); x.beginPath(); x.arc(q[0], q[1], 1.8, 0, 7); x.fill(); } }
    var box = $('neck'); box.innerHTML = '';
    orbits.slice(0, 24).forEach(function (o, j) {
      var rep = Math.min.apply(null, o), b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', String(j === selOrbit));
      var bits = rep.toString(2).padStart(p, '0'), cvs = document.createElement('canvas'); cvs.width = 56; cvs.height = 56; cvs.style.width = '48px'; cvs.style.height = '48px'; cvs.setAttribute('aria-hidden', 'true');
      var g = cvs.getContext('2d'); g.scale(56 / 48, 56 / 48); g.strokeStyle = c('--rn-line'); g.beginPath(); g.arc(24, 24, 18, 0, 7); g.stroke();
      for (var k = 0; k < p; k++) { var a = -Math.PI / 2 + 2 * Math.PI * k / p; g.fillStyle = bits[k] === '1' ? c('--rn-g') : c('--rn-line'); g.beginPath(); g.arc(24 + 18 * Math.cos(a), 24 + 18 * Math.sin(a), bits[k] === '1' ? 4 : 2.5, 0, 7); g.fill(); }
      b.append(cvs, document.createTextNode(bits)); b.title = 'orbit of ' + rep + ', length ' + o.length; b.setAttribute('aria-label', 'Orbit ' + bits + ', length ' + o.length + '. Play it.');
      b.addEventListener('click', function () {
        selOrbit = j; drawMers(); var a = RN.ac(); if (!a) return; RN.stopAll(); var t = a.currentTime + 0.05, d = 0.16 / RN.snd.tempo;
        for (var rr = 0; rr < 3; rr++) for (var k2 = 0; k2 < p; k2++) { if (bits[k2] === '1') RN.note(t + (rr * p + k2) * d, k2 === 0 ? 83 : 76, 0.12, 0.32); else RN.tick(t + (rr * p + k2) * d, 0.04); }
        var nb = box.children[j]; if (nb) nb.focus();
      });
      box.append(b);
    });
    if (orbits.length > 24) { var s = document.createElement('span'); s.className = 'rn-small'; s.textContent = '+' + (orbits.length - 24) + ' more'; box.append(s); }
  }
  RN.def('mersenne', { init: function () { $('mS').addEventListener('input', function () { selOrbit = 0; drawMers(); }); drawMers(); }, redraw: drawMers });

  /* ---------- 18 music in, numbers out ---------- */
  var steps = [0, 0, 0, 0, 0, 0, 1], rHead = -1;
  function eucl(k, n) { var o = []; for (var i = 0; i < n; i++) o.push(Math.floor((i + 1) * k / n) > Math.floor(i * k / n) ? 1 : 0); return o; }
  function balanced(s) { var n = s.length; for (var L = 1; L < n; L++) { var mn = 1e9, mx = -1; for (var st = 0; st < n; st++) { var cnt = 0; for (var j = 0; j < L; j++) cnt += s[(st + j) % n]; if (cnt < mn) mn = cnt; if (cnt > mx) mx = cnt; } if (mx - mn > 1) return false; } return true; }
  var toBig = function (s) { return s.reduce(function (v, b) { return v * 2n + BigInt(b); }, 0n); };
  function renderSteps() {
    var box = $('rSteps'), focusIdx = -1; if (box.contains(document.activeElement)) focusIdx = [].indexOf.call(box.children, document.activeElement);
    box.innerHTML = '';
    steps.forEach(function (b, i) { var e = document.createElement('button'); e.type = 'button'; e.className = (b ? 'rn-on' : '') + (i === rHead ? ' rn-now' : ''); e.textContent = i + 1; e.setAttribute('aria-pressed', String(!!b)); e.setAttribute('aria-label', 'beat ' + (i + 1) + (b ? ', hit' : ', rest')); e.addEventListener('click', function () { steps[i] ^= 1; renderSteps(); }); box.append(e); });
    if (focusIdx >= 0 && box.children[focusIdx]) box.children[focusIdx].focus();
    analyze();
  }
  function analyze() {
    var n = steps.length, k = steps.reduce(function (a, b) { return a + b; }, 0), v = toBig(steps); $('rBin').textContent = steps.join('');
    var pr = RN.isPrimeBig(v); $('rDec').innerHTML = v + (pr ? ' <span class="rn-p">prime</span>' : v > 1n ? ' (not prime)' : '') + (k === n ? ' = 2<sup>' + n + '</sup> − 1, a Mersenne number' : '');
    var bal = k > 0 && k < n && balanced(steps); $('rBal').innerHTML = k === 0 || k === n ? '—' : bal ? '<span class="rn-t">yes, a rotation of E(' + k + ',' + n + ')</span>' : 'no';
    var g = gcd(k, n) || 1; $('rDen').textContent = k + '/' + n + (g > 1 ? ' = ' + (k / g) + '/' + (n / g) : '');
    var rots = [], seen = {};
    for (var r = 0; r < n; r++) { var s = steps.slice(r).concat(steps.slice(0, r)), key = s.join(''); if (seen[key]) continue; seen[key] = 1; var bv = toBig(s); rots.push([key, bv, RN.isPrimeBig(bv)]); }
    $('rRot').innerHTML = rots.map(function (x) { return '<span class="' + (x[2] ? 'rn-p' : '') + '" title="' + x[1] + '">' + x[0] + '</span>'; }).join('');
    if (k > 0 && k < n) {
      var t = [], a = n, b = k; while (b) { t.push(Math.floor(a / b)); var tmp = a % b; a = b; b = tmp; }
      var best = null; Object.keys(RN.CONST).forEach(function (name) { var pt = RN.CONST[name].t, m = 0; while (m < t.length && m < pt.length && (t[m] === pt[m] || (m === t.length - 1 && t[m] === pt[m] + 1))) m++; if (!best || m > best[1]) best = [name, m]; });
      $('rMatch').innerHTML = 'Density ' + k + '/' + n + ' has continued-fraction terms [' + t.join(', ') + ']. ' + (best && best[1] > 0 ? 'It matches the first ' + best[1] + ' term' + (best[1] > 1 ? 's' : '') + ' of <b>' + RN.CONST[best[0]].name + '</b>, so ' + (bal ? 'this rhythm is' : 'an evenly spread rhythm of this density would be') + ' an early stage of that number’s rhythm.' : 'It doesn’t start like any of the numbers in the bar.');
    } else $('rMatch').textContent = 'Add some hits, but not all, to see the density analysis.';
  }
  RN.def('reverse', {
    init: function () {
      $('rN').addEventListener('input', function () { var n = +$('rN').value; $('rNV').textContent = n; var k = Math.max(1, Math.round(steps.reduce(function (a, b) { return a + b; }, 0) * n / steps.length)); steps = eucl(Math.min(k, n), n); renderSteps(); });
      $('rEuc').addEventListener('click', function () { var n = steps.length, k = steps.reduce(function (a, b) { return a + b; }, 0) || 1; steps = eucl(k, n); renderSteps(); });
      $('rPrime').addEventListener('click', function () { var n = steps.length; for (var r = 1; r <= n; r++) { var s = steps.slice(r).concat(steps.slice(0, r)); if (RN.isPrimeBig(toBig(s))) { steps = s; renderSteps(); return; } } $('rMatch').textContent = 'No rotation of this rhythm is prime. Try adding or removing a hit.'; });
      RN.player({ sec: $('reverse'), btn: $('rPlay'), teach: $('rTeach'), len: function () { return steps.length; }, dur: function () { return 0.16; },
        step: function (j, t) { if (steps[j]) RN.note(t, j === 0 ? 76 : 69, 0.15, 0.3); else RN.tick(t, 0.03); },
        draw: function (i) { rHead = i; [].forEach.call($('rSteps').children, function (b, q) { b.classList.toggle('rn-now', q === i); }); } });
      renderSteps();
    }
  });

  /* ---------- 19 the prime hunt ---------- */
  var hunt = { found: [], n: 0, max: 0, exp: 0, run: false };
  function drawHuntEmpty() { hunt.run = false; hunt = { found: [], n: 0, max: +$('hMax').value, exp: 0, run: false }; $('hFound').textContent = '—'; $('hCmp').textContent = '—'; $('hProg').textContent = 'ready'; $('hRun').textContent = 'Run the hunt'; drawHunt(); }
  function drawHunt() {
    var cv = $('hcan'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H); var L = 40, R = 8, T = 10, B = 24, pw = w - L - R, ph = H - T - B, mx = hunt.max || +$('hMax').value, X = function (n) { return L + pw * n / mx; };
    var ymax = Math.max(4, hunt.found.length + 1, Math.ceil(hunt.exp) + 1), Y = function (v) { return T + ph * (1 - v / ymax); };
    x.strokeStyle = c('--rn-line'); x.fillStyle = c('--rn-muted'); x.font = RN.font(10, 1); x.textAlign = 'right'; x.textBaseline = 'middle';
    for (var v = 0; v <= ymax; v += Math.max(1, Math.ceil(ymax / 4))) { x.beginPath(); x.moveTo(L, Y(v)); x.lineTo(w - R, Y(v)); x.stroke(); x.fillText(v, L - 5, Y(v)); }
    x.textAlign = 'center'; x.textBaseline = 'top'; x.fillText('beats read →', L + pw / 2, H - B + 8);
    if (hunt.curve) { x.strokeStyle = c('--rn-muted'); x.setLineDash([4, 3]); x.beginPath(); hunt.curve.forEach(function (ne, i) { if (i) x.lineTo(X(ne[0]), Y(ne[1])); else x.moveTo(X(ne[0]), Y(ne[1])); }); x.stroke(); x.setLineDash([]); }
    x.strokeStyle = c('--rn-prime'); x.lineWidth = 2; x.beginPath(); x.moveTo(X(0), Y(0)); var c2 = 0; hunt.found.forEach(function (n) { x.lineTo(X(n), Y(c2)); c2++; x.lineTo(X(n), Y(c2)); }); x.lineTo(X(hunt.n), Y(c2)); x.stroke(); x.lineWidth = 1;
    x.fillStyle = c('--rn-prime'); hunt.found.forEach(function (n, i) { x.beginPath(); x.arc(X(n), Y(i + 1), 3, 0, 7); x.fill(); });
    x.fillStyle = c('--rn-muted'); x.textAlign = 'left'; x.textBaseline = 'top'; x.fillText('— found   - - chance', L + 6, T);
  }
  RN.def('hunt', {
    init: function () {
      $('hMax').addEventListener('input', function () { $('hMaxV').textContent = $('hMax').value; if (!hunt.run) drawHuntEmpty(); });
      $('hRun').addEventListener('click', function () {
        if (hunt.run) { hunt.run = false; return; }
        var max = +$('hMax').value, job = { found: [], n: 0, max: max, exp: 0, run: true, curve: [[0, 0]] }; hunt = job; $('hRun').textContent = 'Stop'; var v = 0n, n = 0, word = RN.W.word;
        (function chunk() {
          if (hunt !== job) return; var t0 = performance.now();
          while (n < max && performance.now() - t0 < 30) { var b = word[n]; v = v * 2n + BigInt(b); n++; if (b && n > 1) { job.exp += 2 / (n * Math.LN2); if (RN.isPrimeBig(v)) job.found.push(n); } }
          job.n = n; job.curve.push([n, job.exp]); $('hProg').textContent = n + ' / ' + max + ' beats'; $('hFound').textContent = job.found.length ? job.found.join(', ') : 'none yet';
          $('hCmp').innerHTML = '<span class="rn-p">' + job.found.length + '</span> found, ' + job.exp.toFixed(1) + ' expected'; drawHunt();
          if (n < max && job.run) setTimeout(chunk, 0); else { job.run = false; $('hRun').textContent = 'Run the hunt'; $('hProg').textContent = n >= max ? 'done' : 'stopped'; }
        })();
      });
      drawHuntEmpty();
    }, number: drawHuntEmpty, redraw: drawHunt
  });
})(window.RN);
