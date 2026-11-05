/* Drag the tree (/connections/rhythm-of-numbers/tree/). Written for this site; needs /js/rule-drag.js (RuleDrag).
   One number at a time, either a fraction {p, q} or one of the named numbers {pre: 'pi'} (terms as in core.js).
   The canvas, top to bottom: the Stern–Brocot tree (seven rows, starting at the deepest node whose branch covers the
   view, so zooming in walks down the tree), the number line from 0 to 5 (zoomable) with the point, and the
   convergents as nested brackets under it.
   Dragging follows RuleDrag's idea: the point only ever lands on an allowed state. On the line, the allowed state
   under the pointer is the simplest fraction within half a pixel (smallest denominator), or a named number when the
   pointer is near its flag; with a locked prefix, only numbers whose continued fraction starts with it. On the tree,
   the allowed states are the nodes drawn (that keep the prefix). */
(function () {
  'use strict';
  function boot() {
    var RD = window.RuleDrag, can = document.getElementById('trCan');
    if (!RD || !can) return;
    var art = can.closest('.rn'), ctx = can.getContext('2d'), rhy = document.getElementById('trRhy'), rctx = rhy.getContext('2d');
    var $ = function (id) { return document.getElementById(id); };

    // ---------- numbers ----------
    var PRE = {
      pi: { name: 'π', v: Math.PI, t: [3, 7, 15, 1, 292, 1, 1, 1, 2, 1, 3, 1, 14, 2, 1, 1, 2, 2, 2, 2, 1, 84, 2, 1, 1, 15, 3, 13] },
      e: { name: 'e', v: Math.E, t: [2, 1, 2, 1, 1, 4, 1, 1, 6, 1, 1, 8, 1, 1, 10, 1, 1, 12, 1, 1, 14, 1, 1, 16] },
      sqrt2: { name: '√2', v: Math.SQRT2, t: [1].concat(Array(24).fill(2)) },
      phi: { name: 'φ', v: (1 + Math.sqrt(5)) / 2, t: [1].concat(Array(30).fill(1)) },
      sqrt3: { name: '√3', v: Math.sqrt(3), t: [1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2] }
    };
    var MAXV = 5;
    function val(s) { return s.pre ? PRE[s.pre].v : s.p / s.q; }
    function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
    function frac(p, q) { var g = gcd(p, q) || 1; return { p: p / g, q: q / g }; }
    function terms(s) {
      if (s.pre) return PRE[s.pre].t.slice();
      var t = [], p = s.p, q = s.q;
      while (q && t.length < 80) { var a = Math.floor(p / q); t.push(a); var r = p - a * q; p = q; q = r; }
      return t;
    }
    function same(a, b) { return !!a && !!b && (a.pre ? a.pre === b.pre : (!b.pre && a.p === b.p && a.q === b.q)); }
    function convergents(t) {
      var out = [], p1 = 1, q1 = 0, p2 = 0, q2 = 1;
      for (var i = 0; i < t.length; i++) {
        var p = t[i] * p1 + p2, q = t[i] * q1 + q2;
        if (q > 9e14) break;
        out.push({ p: p, q: q }); p2 = p1; q2 = q1; p1 = p; q1 = q;
      }
      return out;
    }
    // simplest fraction in [lo, hi] (0 <= lo <= hi): the first Stern–Brocot node that lands between them
    function simplest(lo, hi, depth) {
      depth = depth || 0;
      var fl = Math.floor(lo);
      if (fl === lo) return { p: fl, q: 1 };
      if (fl + 1 <= hi) return { p: fl + 1, q: 1 };
      if (depth > 45) return { p: Math.round(lo * 1e9), q: 1e9 };
      var r = simplest(1 / (hi - fl), 1 / (lo - fl), depth + 1);
      return frac(fl * r.p + r.q, r.p);
    }
    function startsWith(t, pre) { if (t.length < pre.length) return false; for (var i = 0; i < pre.length; i++) if (t[i] !== pre[i]) return false; return true; }
    var SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    function sup(n) { return n === 1 ? '' : String(n).split('').map(function (d) { return SUP[+d]; }).join(''); }
    function runs(s) {
      var t = terms(s), out = [];
      if (!s.pre) t[t.length - 1] -= 1;
      for (var i = 0; i < t.length; i++) if (t[i] > 0) out.push({ d: i % 2 ? 'L' : 'R', n: t[i] });
      return out;
    }
    function pathText(s, maxRuns) {
      if (!s.pre && s.p === 0) return '0/1 is the tree’s left edge: it is never reached, only approached (L L L …)';
      var r = runs(s), more = s.pre || r.length > maxRuns;
      if (!r.length) return '1/1 is the top of the tree: no moves';
      return r.slice(0, maxRuns).map(function (x) { return x.d + sup(x.n); }).join(' ') + (more ? ' …' : '');
    }
    function fmt(s) {
      if (s.pre) return PRE[s.pre].name + ' = ' + PRE[s.pre].v.toPrecision(10) + '…';
      var v = s.p / s.q, d = s.q === 1 ? String(s.p) : s.p + '/' + s.q;
      if (s.q === 1) return d;
      var dec = v.toPrecision(10).replace(/0+$/, '');
      var exact = Math.abs(Number(dec) - v) < 1e-15 * Math.max(1, v);
      return d + ' = ' + dec + (exact ? '' : '…');
    }
    function fs(c) { return c.q === 1 ? String(c.p) : c.p + '/' + c.q; }

    // ---------- state ----------
    var S = { cur: { pre: 'pi' }, v0: 0, v1: MAXV, lock: null, drag: null, nodes: [], hidden: 0 };
    var W = 600, H = 440, dpr = 1, PAD = 18, ROWS = 7, ROWH = 36, TREE0 = 34, LINEY = 318;

    // ---------- geometry ----------
    function X(v) { return PAD + (v - S.v0) / (S.v1 - S.v0) * (W - 2 * PAD); }
    function V(x) { return S.v0 + (x - PAD) / (W - 2 * PAD) * (S.v1 - S.v0); }
    function size() {
      W = can.clientWidth || 600;
      H = W < 520 ? 420 : 440; LINEY = W < 520 ? 304 : 318; ROWH = W < 520 ? 34 : 36;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      can.style.height = H + 'px'; can.width = Math.round(W * dpr); can.height = Math.round(H * dpr);
      rhy.style.height = '46px'; rhy.width = Math.round((rhy.clientWidth || W) * dpr); rhy.height = Math.round(46 * dpr);
      draw();
    }
    var C = {};
    function colors() {
      var cs = getComputedStyle(art);
      ['--rn-g', '--rn-gold', '--rn-gold-t', '--rn-prime', '--rn-teal', '--rn-ink', '--rn-muted', '--rn-line', '--rn-soft', '--rn-panel', '--rn-violet'].forEach(function (k) { C[k.slice(5)] = cs.getPropertyValue(k).trim() || '#888'; });
    }

    // ---------- the Stern–Brocot picture ----------
    function topNode() {
      // descend from 1/1 while the whole view lies on one side
      var lp = 0, lq = 1, rp = 1, rq = 0, p = 1, q = 1, path = [], d = 0;
      while (d < 60) {
        var m = p / q;
        if (S.v1 < m) { rp = p; rq = q; path.push('L'); }
        else if (S.v0 > m) { lp = p; lq = q; path.push('R'); }
        else break;
        p = lp + rp; q = lq + rq; d++;
      }
      return { p: p, q: q, lp: lp, lq: lq, rp: rp, rq: rq, depth: d, path: path };
    }
    function buildTree() {
      var top = topNode(), rows = [[top]], i, r;
      top.parent = null;
      for (r = 1; r < ROWS; r++) {
        var row = [];
        rows[r - 1].forEach(function (n) {
          var kids = [{ p: n.lp + n.p, q: n.lq + n.q, lp: n.lp, lq: n.lq, rp: n.p, rq: n.q }, { p: n.p + n.rp, q: n.q + n.rq, lp: n.p, lq: n.q, rp: n.rp, rq: n.rq }];
          kids.forEach(function (k) {
            var lo = k.lp / k.lq, hi = k.rq ? k.rp / k.rq : Infinity;
            if (hi < S.v0 || lo > S.v1) return;
            k.parent = n; k.depth = n.depth + 1; row.push(k);
          });
        });
        rows.push(row);
      }
      var all = [];
      rows.forEach(function (row, ri) { row.forEach(function (n) { n.row = ri; n.x = X(n.p / n.q); n.y = TREE0 + ri * ROWH; all.push(n); }); });
      return { top: top, rows: rows, all: all };
    }
    // the path from the picture's top node toward the number
    function pathNodes(tree) {
      var t = tree.top, out = [t], v = val(S.cur);
      if (S.cur.pre ? false : (S.cur.p === t.p && S.cur.q === t.q)) return { nodes: out, done: true };
      var lo = t.lp / t.lq, hi = t.rq ? t.rp / t.rq : Infinity;
      if (!(v > lo && v < hi)) return { nodes: [], done: false, outside: true };
      var n = t;
      for (var r = 1; r < ROWS; r++) {
        var goLeft = S.cur.pre ? v < n.p / n.q : S.cur.p * n.q < n.p * S.cur.q;
        var k = goLeft ? { p: n.lp + n.p, q: n.lq + n.q, lp: n.lp, lq: n.lq, rp: n.p, rq: n.q } : { p: n.p + n.rp, q: n.q + n.rq, lp: n.p, lq: n.q, rp: n.rp, rq: n.rq };
        k.x = X(k.p / k.q); k.y = TREE0 + r * ROWH; k.dir = goLeft ? 'L' : 'R';
        out.push(k); n = k;
        if (!S.cur.pre && S.cur.p === k.p && S.cur.q === k.q) return { nodes: out, done: true };
      }
      return { nodes: out, done: false };
    }
    function depthOf(s) { if (s.pre) return Infinity; var t = terms(s), d = 0; t.forEach(function (a) { d += a; }); return d - 1; }

    // ---------- drawing ----------
    function draw() {
      if (!W) return;
      colors();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.font = '12px system-ui, sans-serif'; ctx.textBaseline = 'middle';
      var tree = buildTree(); S.nodes = tree.all; S.tree = tree;
      // locked interval
      if (S.lock) {
        var a = X(S.lock.lo), b = X(S.lock.hi);
        ctx.fillStyle = C.gold; ctx.globalAlpha = 0.16; ctx.fillRect(Math.max(0, a), 8, Math.min(W, b) - Math.max(0, a), LINEY + 10 - 8); ctx.globalAlpha = 1;
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a, 8); ctx.lineTo(a, LINEY + 10); ctx.moveTo(b, 8); ctx.lineTo(b, LINEY + 10); ctx.stroke();
      }
      // the tree: edges, then nodes
      ctx.lineWidth = 1.2; ctx.strokeStyle = C.line;
      ctx.beginPath();
      tree.all.forEach(function (n) { if (n.parent) { ctx.moveTo(n.parent.x, n.parent.y); ctx.lineTo(n.x, n.y); } });
      ctx.stroke();
      var pn = pathNodes(tree);
      if (pn.nodes.length > 1) {
        ctx.strokeStyle = C.teal; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath();
        ctx.moveTo(pn.nodes[0].x, pn.nodes[0].y);
        for (var i = 1; i < pn.nodes.length; i++) ctx.lineTo(pn.nodes[i].x, pn.nodes[i].y);
        ctx.stroke();
        ctx.fillStyle = C.teal; ctx.font = '600 11px system-ui, sans-serif';
        for (i = 1; i < pn.nodes.length; i++) { var A = pn.nodes[i - 1], B = pn.nodes[i]; ctx.fillText(B.dir, (A.x + B.x) / 2 + (B.dir === 'R' ? 4 : -11), (A.y + B.y) / 2 - 2); }
      }
      ctx.font = '12px system-ui, sans-serif';
      tree.rows.forEach(function (row) {
        var xs = row.map(function (n) { return n.x; });
        row.forEach(function (n, j) {
          var onPath = pn.nodes.some(function (m) { return m.p === n.p && m.q === n.q; }), isCur = !S.cur.pre && S.cur.p === n.p && S.cur.q === n.q;
          var ok = !S.lock || startsWith(terms(n), S.lock.pre);
          ctx.fillStyle = isCur ? C.teal : onPath ? C.teal : ok ? C.g : C.muted;
          ctx.globalAlpha = ok ? 1 : 0.35;
          ctx.beginPath(); ctx.arc(n.x, n.y, isCur ? 6 : 3.5, 0, 7); ctx.fill();
          var lab = fs(n), tw = ctx.measureText(lab).width + 8;
          var gapL = j > 0 ? n.x - xs[j - 1] : 1e9, gapR = j < xs.length - 1 ? xs[j + 1] - n.x : 1e9;
          if (Math.min(gapL, gapR) > tw && n.x - tw / 2 > 0 && n.x + tw / 2 < W) {
            ctx.fillStyle = onPath || isCur ? C.ink : C.muted; ctx.textAlign = 'center';
            ctx.fillText(lab, n.x, n.y - 12);
          }
          ctx.globalAlpha = 1;
        });
      });
      ctx.textAlign = 'left';
      // where the picture starts, and how much deeper the path goes
      ctx.fillStyle = C.muted; ctx.font = '12px system-ui, sans-serif';
      var head = tree.top.depth ? 'Picture starts at ' + fs(tree.top) + ', ' + tree.top.depth + ' step' + (tree.top.depth > 1 ? 's' : '') + ' down' : 'The top of the tree: 1/1';
      ctx.fillText(head, 8, 12);
      var note = '';
      if (pn.outside) note = 'The number is outside this view.';
      else if (!pn.done) { var dd = depthOf(S.cur); note = dd === Infinity ? 'The path goes on forever below the picture.' : 'The path goes ' + (dd - tree.top.depth - (ROWS - 1)) + ' more steps below the picture.'; }
      if (note) {
        note += ' Zoom in to follow it.';
        if (ctx.measureText(note).width > W - 16) note = pn.outside ? 'Outside this view.' : 'The path goes on below: zoom in.';
        ctx.textAlign = 'right'; ctx.fillText(note, W - 8, TREE0 + (ROWS - 1) * ROWH + 22); ctx.textAlign = 'left';
      }
      // the number line
      var y = LINEY;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(PAD - 6, y); ctx.lineTo(W - PAD + 6, y); ctx.stroke();
      var span = S.v1 - S.v0, raw = span / Math.max(2, (W - 2 * PAD) / 90), pw = Math.pow(10, Math.floor(Math.log10(raw))), st = pw;
      [1, 2, 5, 10].some(function (m) { if (pw * m >= raw) { st = pw * m; return true; } return false; });
      var dig = Math.max(0, -Math.floor(Math.log10(st) + 1e-9));
      ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.font = '11px system-ui, sans-serif';
      for (var tv = Math.ceil(S.v0 / st) * st; tv <= S.v1 + st * 1e-6; tv += st) {
        var tx = X(tv); ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx, y - 4); ctx.lineTo(tx, y + 4); ctx.stroke();
        ctx.fillText(dig > 8 ? tv.toExponential(3) : tv.toFixed(Math.min(dig, 12)), tx, y + 15);
      }
      // named numbers: little flags above the line
      ctx.font = '600 12px system-ui, sans-serif';
      Object.keys(PRE).forEach(function (k) {
        var px = X(PRE[k].v); if (px < -10 || px > W + 10) return;
        ctx.fillStyle = C['gold-t']; ctx.beginPath(); ctx.moveTo(px, y - 3); ctx.lineTo(px - 5, y - 12); ctx.lineTo(px + 5, y - 12); ctx.closePath(); ctx.fill();
        ctx.fillText(PRE[k].name, px, y - 22);
      });
      // convergents: ticks on the line and nested brackets under it
      var t = terms(S.cur), cv = convergents(t), hidden = 0, row = 0, v = val(S.cur);
      ctx.font = '11px system-ui, sans-serif';
      for (var k = 1; k < cv.length; k++) {
        var x1 = X(cv[k - 1].p / cv[k - 1].q), x2 = X(cv[k].p / cv[k].q);
        if (Math.abs(x2 - x1) < 2) { hidden++; continue; }
        var by = y + 28 + row * 12; if (by > H - 6) { hidden++; continue; }
        row++;
        var col = k % 2 ? C.g : C.prime;
        ctx.strokeStyle = col; ctx.lineWidth = 2;
        var L = Math.max(-5, Math.min(x1, x2)), R = Math.min(W + 5, Math.max(x1, x2));
        ctx.beginPath(); ctx.moveTo(L, by); ctx.lineTo(R, by);
        if (x1 >= -5 && x1 <= W + 5) { ctx.moveTo(x1, by); ctx.lineTo(x1, by - 5); }
        if (x2 >= -5 && x2 <= W + 5) { ctx.moveTo(x2, by); ctx.lineTo(x2, by - 5); }
        ctx.stroke();
        var lab = fs(cv[k]), lw = ctx.measureText(lab).width;
        if (x2 > -5 && x2 < W + 5) {
          ctx.fillStyle = col; ctx.textAlign = x2 > x1 ? 'left' : 'right';
          var lx = x2 + (x2 > x1 ? 4 : -4);
          if ((x2 > x1 && lx + lw < W) || (x2 < x1 && lx - lw > 0)) ctx.fillText(lab, lx, by);
        }
      }
      ctx.textAlign = 'left';
      cv.forEach(function (c, i) { var cx = X(c.p / c.q); if (cx < 0 || cx > W) return; ctx.fillStyle = i % 2 ? C.g : C.prime; ctx.fillRect(cx - 1, y - 6, 2, 12); });
      S.hidden = hidden;
      // the point
      var px2 = X(v);
      if (px2 > -20 && px2 < W + 20) {
        ctx.strokeStyle = C.teal; ctx.globalAlpha = 0.5; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(px2, TREE0 + (ROWS - 1) * ROWH + 8); ctx.lineTo(px2, y - 10); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
        ctx.fillStyle = C.teal; ctx.strokeStyle = C.panel; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(px2, y, 9, 0, 7); ctx.fill(); ctx.stroke();
      }
      readouts();
    }
    function drawRhythm() {
      var w = rhy.clientWidth || W, n = w < 420 ? 40 : 64, cw = w / n;
      rctx.setTransform(dpr, 0, 0, dpr, 0, 0); rctx.clearRect(0, 0, w, 46);
      var hits = rhythm(n);
      for (var i = 0; i < n; i++) {
        rctx.fillStyle = hits[i] ? C.g : C.soft;
        rctx.fillRect(i * cw + 1, 8, cw - 2, 26);
        if (!hits[i]) { rctx.strokeStyle = C.line; rctx.lineWidth = 1; rctx.strokeRect(i * cw + 1.5, 8.5, cw - 3, 25); }
      }
    }
    // hits of the rhythm: beat n is a hit when the running total of the fractional part passes a whole number
    function rhythm(n) {
      var out = [], i;
      if (S.cur.pre) { var a = PRE[S.cur.pre].v % 1; for (i = 0; i < n; i++) out.push(Math.floor((i + 1) * a + 1e-12) - Math.floor(i * a + 1e-12) > 0); }
      else { var r = S.cur.p % S.cur.q, q = S.cur.q; for (i = 0; i < n; i++) out.push(Math.floor((i + 1) * r / q) - Math.floor(i * r / q) > 0); }
      return out;
    }

    // ---------- readouts ----------
    function readouts() {
      var s = S.cur, t = terms(s), more = !!s.pre;
      $('trVal').textContent = fmt(s);
      var box = $('trCF'), html = '<span class="sep">[</span>', show = Math.min(t.length, W < 520 ? 9 : 14);
      for (var i = 0; i < show; i++) {
        var lk = S.lock && i < S.lock.pre.length;
        html += '<button type="button" data-k="' + i + '" class="' + (lk ? 'lk' : '') + '" aria-pressed="' + (lk ? 'true' : 'false') + '" aria-label="Term ' + (i + 1) + ', ' + t[i] + (lk ? ', locked' : '') + '. Lock the first ' + (i + 1) + ' term' + (i ? 's' : '') + '">' + t[i] + '</button>' + (i === 0 && show > 1 ? '<span class="sep">;</span>' : i < show - 1 ? '<span class="sep">,</span>' : '');
      }
      html += (more || t.length > show ? '<span class="sep">, …</span>' : '') + '<span class="sep">]</span>';
      box.innerHTML = html;
      $('trPath').textContent = pathText(s, 9);
      var cv = convergents(t), list = cv.slice(0, 8).map(fs).join(', ') + (cv.length > 8 || more ? ', …' : '');
      $('trConv').textContent = list;
      // rhythm text
      var gaps = [], h = rhythm(200), last = -1;
      h.forEach(function (x, i) { if (x) { if (last >= 0) gaps.push(i - last); last = i; } });
      var fr = val(s) % 1, rt;
      if (fr === 0) rt = 'A whole number: nothing after the decimal point, so every beat is a hit.';
      else {
        var uniq = gaps.filter(function (g, i) { return gaps.indexOf(g) === i; }).sort(function (a, b) { return a - b; });
        rt = 'Add ' + (s.pre ? fr.toFixed(5) + '…' : (s.p % s.q) + '/' + s.q) + ' each beat; a hit falls each time the total passes a whole number. The gaps are ' + uniq.join(' or ') + ' beats' + (s.pre ? '' : ', and the rhythm repeats every ' + s.q + ' beat' + (s.q > 1 ? 's' : '')) + '.';
      }
      $('trRhyText').textContent = rt;
      drawRhythm();
      // lock and notes
      if (S.lock) {
        var Lk = S.lock, wdt = Lk.hi - Lk.lo;
        $('trLock').innerHTML = '<b>Locked:</b> [' + Lk.pre[0] + (Lk.pre.length > 1 ? '; ' + Lk.pre.slice(1).join(', ') : '') + ', …]. Reachable: the numbers from ' + fs(Lk.a) + ' to ' + fs(Lk.b) + ', an interval 1/' + (Lk.a.q * Lk.b.q).toLocaleString('en-US') + ' wide (' + (wdt < 1e-4 ? wdt.toExponential(2) : wdt.toPrecision(3)) + ').';
      } else $('trLock').textContent = '';
      $('trLockFit').hidden = $('trUnlock').hidden = !S.lock;
      var nt = S.hidden ? S.hidden + ' more bracket' + (S.hidden > 1 ? 's are' : ' is') + ' too small to see here: zoom in.' : '';
      $('trNote').textContent = nt;
      Array.prototype.forEach.call(document.querySelectorAll('.tr-presets button'), function (b) {
        var on = b.dataset.pre ? s.pre === b.dataset.pre : (!s.pre && b.dataset.frac === s.p + '/' + s.q);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    // ---------- moving the number ----------
    function setCur(s, quiet) {
      if (same(s, S.cur)) return;
      S.cur = s;
      draw();
      if (!quiet) announce();
    }
    function announce() { var t = terms(S.cur); $('trLive').textContent = fmt(S.cur) + '. Continued fraction ' + t.slice(0, 8).join(', ') + (S.cur.pre || t.length > 8 ? ' and more' : '') + '.'; }
    function allowed(s) { return !S.lock || startsWith(terms(s), S.lock.pre); }
    // the allowed state for a point on the line
    function project(x) {
      var v = Math.max(0, Math.min(MAXV, V(x))), h = (S.v1 - S.v0) / (W - 2 * PAD) * 0.75;
      // named numbers pull when the pointer is near their flag
      var bestK = null, bd = 9;
      Object.keys(PRE).forEach(function (k) { var d = Math.abs(X(PRE[k].v) - x); if (d < bd && allowed({ pre: k })) { bd = d; bestK = k; } });
      if (bestK) return { pre: bestK };
      h = Math.max(h, 1e-12 * Math.max(1, v));   // below this, doubles can't tell fractions apart
      if (S.lock) v = Math.max(S.lock.lo, Math.min(S.lock.hi, v));
      var eps = 1e-14 * Math.max(1, v);   // so a fraction exactly at an end (like 22/7) is still within reach
      var lo = Math.max(0, Math.max(S.lock ? S.lock.lo : 0, v - h) - eps), hi = Math.min(S.lock ? S.lock.hi : MAXV, v + h) + eps;
      var r = simplest(lo, hi);
      for (var i = 0; i < 12 && !allowed(r); i++) {
        // only the far end of a locked interval can fail: step away from it
        var rv = r.p / r.q, gap = (hi - lo) / 2 || 1e-12;
        if (rv >= (S.lock.lo + S.lock.hi) / 2) hi = Math.max(lo, rv - gap * 1e-3); else lo = Math.min(hi, rv + gap * 1e-3);
        r = simplest(lo, hi);
      }
      return allowed(r) ? r : null;
    }
    function zoom(f, about) {
      var span = S.v1 - S.v0, ns = Math.max(1e-9, Math.min(MAXV, span / f));
      var c = about === undefined ? (S.v0 + S.v1) / 2 : about;
      var t = (c - S.v0) / span, n0 = c - t * ns;
      setView(n0, n0 + ns);
    }
    function setView(a, b) {
      var span = b - a;
      if (span >= MAXV) { a = 0; b = MAXV; }
      else { if (a < 0) { b -= a; a = 0; } if (b > MAXV) { a -= b - MAXV; b = MAXV; } }
      S.v0 = a; S.v1 = b; draw();
    }
    function zoomAbout() { var v = val(S.cur); return v >= S.v0 && v <= S.v1 ? v : undefined; }
    function lockTo(k) {
      var t = terms(S.cur);
      if (S.lock && S.lock.pre.length === k + 1) { S.lock = null; draw(); $('trLive').textContent = 'Unlocked.'; return; }
      var pre = t.slice(0, k + 1), cv = convergents(pre), c = cv[k], prev = k ? cv[k - 1] : { p: 1, q: 0 };
      var m = { p: c.p + prev.p, q: c.q + prev.q }, a = c, b = m;
      var lo = Math.min(c.p / c.q, m.p / m.q), hi = Math.max(c.p / c.q, m.p / m.q);
      S.lock = { pre: pre, lo: lo, hi: hi, a: a, b: b };
      draw();
      $('trLive').textContent = 'Locked the first ' + (k + 1) + ' terms. The point can now reach only the numbers from ' + fs(a) + ' to ' + fs(b) + '.';
    }

    // ---------- pointer ----------
    function pt(e) { var r = can.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    RD.attach(can, {
      point: pt,
      begin: function (p, e) {
        var slop = e.pointerType === 'touch' ? 22 : 14, treeBottom = TREE0 + (ROWS - 1) * ROWH + 14;
        // on the point
        if (Math.abs(p.x - X(val(S.cur))) < slop && Math.abs(p.y - LINEY) < slop + 6) {
          return { project: function (q) { return project(q.x); }, grab: { x: X(val(S.cur)), y: LINEY },
            move: function (s) { setCur(s, true); }, end: function () { announce(); }, cancel: function () { } };
        }
        // on the tree: snap from node to node (only nodes that keep the locked prefix)
        if (p.y < treeBottom) {
          var states = S.nodes.filter(function (n) { return allowed(n) && n.x > -10 && n.x < W + 10; });
          if (!states.length) return null;
          return { states: states, at: function (n) { return { x: n.x, y: n.y }; },
            move: function (n) { setCur(frac(n.p, n.q), true); }, end: function () { announce(); }, cancel: function () { } };
        }
        // on the line: drag to pan, tap to move the point there
        var x0 = p.x, a0 = S.v0, b0 = S.v1, moved = false;
        return { project: function (q) { return q; },
          move: function (q) { if (Math.abs(q.x - x0) > 4) moved = true; if (!moved || (b0 - a0) >= MAXV) return; var dv = (q.x - x0) / (W - 2 * PAD) * (b0 - a0); setView(a0 - dv, b0 - dv); },
          end: function (q) { if (!moved) { var s = project(q.x); if (s) setCur(s); } }, cancel: function () { } };
      }
    });
    can.addEventListener('wheel', function (e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoom(e.deltaY < 0 ? 1.25 : 0.8, V(pt(e).x));
    }, { passive: false });
    can.addEventListener('keydown', function (e) {
      var k = e.key, v = val(S.cur), span = S.v1 - S.v0;
      if (k === 'ArrowLeft' || k === 'ArrowRight') {
        e.preventDefault();
        var step = span / (e.shiftKey ? 10 : 60), target = X(v + (k === 'ArrowRight' ? step : -step)), s = project(target);
        if (s && !same(s, S.cur)) setCur(s); else $('trLive').textContent = 'It can’t go further that way.';
        var nv = val(S.cur); if (nv < S.v0 || nv > S.v1) setView(nv - span / 2, nv + span / 2);
      } else if (k === 'ArrowUp') {
        e.preventDefault();
        if (S.cur.pre || (S.cur.p === 1 && S.cur.q === 1)) { $('trLive').textContent = S.cur.pre ? 'Named numbers sit at the end of an endless path; pick a fraction to climb the tree.' : 'This is the top of the tree.'; return; }
        // parent: the path without its last step
        var r = runs(S.cur), letters = []; r.forEach(function (x) { for (var i = 0; i < x.n; i++) letters.push(x.d); });
        letters.pop();
        var lp = 0, lq = 1, rp = 1, rq = 0, p = 1, q = 1;
        letters.forEach(function (d) { if (d === 'L') { rp = p; rq = q; } else { lp = p; lq = q; } p = lp + rp; q = lq + rq; });
        var par = { p: p, q: q };
        if (allowed(par)) setCur(par); else $('trLive').textContent = 'Its parent is outside the locked interval.';
      } else if (k === '+' || k === '=') { e.preventDefault(); zoom(2, zoomAbout()); }
      else if (k === '-' || k === '_') { e.preventDefault(); zoom(0.5, zoomAbout()); }
      else if (k === '0' || k === 'Home') { e.preventDefault(); setView(0, MAXV); }
    });

    // ---------- buttons ----------
    $('trIn').addEventListener('click', function () { zoom(3, zoomAbout()); });
    $('trOut').addEventListener('click', function () { zoom(1 / 3, zoomAbout()); });
    $('trFit').addEventListener('click', function () { setView(0, MAXV); });
    $('trUnlock').addEventListener('click', function () { S.lock = null; draw(); $('trLive').textContent = 'Unlocked.'; });
    $('trLockFit').addEventListener('click', function () { if (S.lock) { var m = (S.lock.hi - S.lock.lo) * 0.15; setView(S.lock.lo - m, S.lock.hi + m); } });
    $('trCF').addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (b) { lockTo(+b.dataset.k); var nb = $('trCF').querySelector('button[data-k="' + b.dataset.k + '"]'); if (nb) nb.focus(); } });
    Array.prototype.forEach.call(document.querySelectorAll('.tr-presets button'), function (b) {
      b.addEventListener('click', function () {
        var s;
        if (b.dataset.pre) s = { pre: b.dataset.pre }; else { var f = b.dataset.frac.split('/'); s = frac(+f[0], +f[1]); }
        if (!allowed(s)) { S.lock = null; $('trLive').textContent = 'Unlocked, to jump there.'; }
        var v = val(s); if (v < S.v0 || v > S.v1) setView(0, MAXV);
        S.cur = null; setCur(s);
      });
    });
    new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (window.ResizeObserver) new ResizeObserver(size).observe(can.parentNode); else window.addEventListener('resize', size);
    size();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
