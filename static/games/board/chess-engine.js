/* A small chess engine: legal move generation, alpha-beta search with a quiescence search, piece-square evaluation.
   Squares are 0..63, a8 = 0, h1 = 63. White pieces are upper case and move toward lower indexes. */
(function (root) {
  'use strict';
  var VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  var PST = {
    p: [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    n: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
    b: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
    r: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
    q: [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
    k: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20]
  };
  var ND = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]], KD = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  var BD = [[-1, -1], [-1, 1], [1, -1], [1, 1]], RD = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  function isW(p) { return p && p < 'a'; }
  function side(p) { return p ? (p < 'a' ? 'w' : 'b') : null; }
  function start() { return fromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); }
  function fromFEN(f) {
    var p = f.split(' '), b = [], i;
    p[0].split('').forEach(function (ch) { if (ch === '/') return; if (/\d/.test(ch)) for (i = 0; i < +ch; i++) b.push(null); else b.push(ch); });
    return { b: b, turn: p[1] || 'w', cr: p[2] && p[2] !== '-' ? p[2] : '', ep: p[3] && p[3] !== '-' ? (8 - +p[3][1]) * 8 + p[3].charCodeAt(0) - 97 : -1, half: +(p[4] || 0), full: +(p[5] || 1) };
  }
  function attacked(S, sq, by) { // is sq attacked by side `by`?
    var b = S.b, r = sq >> 3, c = sq & 7, i, d, rr, cc, p, w = by === 'w';
    var pr = r + (w ? 1 : -1); // pawns of `by` stand one rank behind (from their view) the square they attack
    if (pr >= 0 && pr < 8) { if (c > 0 && b[pr * 8 + c - 1] === (w ? 'P' : 'p')) return true; if (c < 7 && b[pr * 8 + c + 1] === (w ? 'P' : 'p')) return true; }
    for (i = 0; i < 8; i++) { rr = r + ND[i][0]; cc = c + ND[i][1]; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === (w ? 'N' : 'n')) return true; }
    for (i = 0; i < 8; i++) { rr = r + KD[i][0]; cc = c + KD[i][1]; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === (w ? 'K' : 'k')) return true; }
    for (i = 0; i < 4; i++) { d = BD[i]; rr = r + d[0]; cc = c + d[1]; while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) { p = b[rr * 8 + cc]; if (p) { if (p === (w ? 'B' : 'b') || p === (w ? 'Q' : 'q')) return true; break; } rr += d[0]; cc += d[1]; } }
    for (i = 0; i < 4; i++) { d = RD[i]; rr = r + d[0]; cc = c + d[1]; while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) { p = b[rr * 8 + cc]; if (p) { if (p === (w ? 'R' : 'r') || p === (w ? 'Q' : 'q')) return true; break; } rr += d[0]; cc += d[1]; } }
    return false;
  }
  function kingSq(S, s) { return S.b.indexOf(s === 'w' ? 'K' : 'k'); }
  function inCheck(S, s) { return attacked(S, kingSq(S, s || S.turn), (s || S.turn) === 'w' ? 'b' : 'w'); }
  function pseudo(S, capsOnly) {
    var b = S.b, out = [], w = S.turn === 'w', sq, p, r, c, i, d, rr, cc, t, q, dir, startR, promR;
    function add(f, to, fl, pr) { out.push({ f: f, t: to, p: b[f], c: fl === 'ep' ? (w ? 'p' : 'P') : b[to], fl: fl || '', pr: pr || '' }); }
    for (sq = 0; sq < 64; sq++) {
      p = b[sq]; if (!p || isW(p) !== w) continue; r = sq >> 3; c = sq & 7; t = p.toLowerCase();
      if (t === 'p') {
        dir = w ? -1 : 1; startR = w ? 6 : 1; promR = w ? 0 : 7; rr = r + dir;
        if (rr >= 0 && rr < 8) {
          if (!b[rr * 8 + c] && !capsOnly) { if (rr === promR) add(sq, rr * 8 + c, 'pr', w ? 'Q' : 'q'); else { add(sq, rr * 8 + c); if (r === startR && !b[(rr + dir) * 8 + c]) add(sq, (rr + dir) * 8 + c, 'dp'); } }
          else if (!b[rr * 8 + c] && rr === promR) add(sq, rr * 8 + c, 'pr', w ? 'Q' : 'q');
          for (i = -1; i <= 1; i += 2) { cc = c + i; if (cc < 0 || cc > 7) continue; q = b[rr * 8 + cc];
            if (q && isW(q) !== w) add(sq, rr * 8 + cc, rr === promR ? 'pr' : '', rr === promR ? (w ? 'Q' : 'q') : '');
            else if (rr * 8 + cc === S.ep) add(sq, rr * 8 + cc, 'ep'); }
        }
      } else if (t === 'n' || t === 'k') {
        d = t === 'n' ? ND : KD;
        for (i = 0; i < 8; i++) { rr = r + d[i][0]; cc = c + d[i][1]; if (rr < 0 || rr > 7 || cc < 0 || cc > 7) continue; q = b[rr * 8 + cc]; if (q ? isW(q) !== w : !capsOnly) add(sq, rr * 8 + cc); }
        if (t === 'k' && !capsOnly) {
          var home = w ? 60 : 4, opp = w ? 'b' : 'w';
          if (sq === home && !attacked(S, home, opp)) {
            if (S.cr.indexOf(w ? 'K' : 'k') >= 0 && !b[home + 1] && !b[home + 2] && b[home + 3] === (w ? 'R' : 'r') && !attacked(S, home + 1, opp)) add(sq, home + 2, 'ck');
            if (S.cr.indexOf(w ? 'Q' : 'q') >= 0 && !b[home - 1] && !b[home - 2] && !b[home - 3] && b[home - 4] === (w ? 'R' : 'r') && !attacked(S, home - 1, opp)) add(sq, home - 2, 'cq');
          }
        }
      } else {
        d = t === 'b' ? BD : t === 'r' ? RD : KD;
        for (i = 0; i < d.length; i++) { rr = r + d[i][0]; cc = c + d[i][1];
          while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) { q = b[rr * 8 + cc]; if (q) { if (isW(q) !== w) add(sq, rr * 8 + cc); break; } if (!capsOnly) add(sq, rr * 8 + cc); rr += d[i][0]; cc += d[i][1]; } }
      }
    }
    return out;
  }
  function make(S, m) {
    var b = S.b, u = { cr: S.cr, ep: S.ep, half: S.half }, w = S.turn === 'w';
    b[m.t] = m.pr || m.p; b[m.f] = null;
    if (m.fl === 'ep') b[m.t + (w ? 8 : -8)] = null;
    else if (m.fl === 'ck') { b[m.t - 1] = b[m.t + 1]; b[m.t + 1] = null; }
    else if (m.fl === 'cq') { b[m.t + 1] = b[m.t - 2]; b[m.t - 2] = null; }
    S.ep = m.fl === 'dp' ? (m.f + m.t) / 2 : -1;
    if (S.cr) {
      var cr = S.cr;
      if (m.p === 'K') cr = cr.replace(/[KQ]/g, ''); if (m.p === 'k') cr = cr.replace(/[kq]/g, '');
      if (m.f === 63 || m.t === 63) cr = cr.replace('K', ''); if (m.f === 56 || m.t === 56) cr = cr.replace('Q', '');
      if (m.f === 7 || m.t === 7) cr = cr.replace('k', ''); if (m.f === 0 || m.t === 0) cr = cr.replace('q', '');
      S.cr = cr;
    }
    S.half = (m.c || m.p === 'P' || m.p === 'p') ? 0 : S.half + 1;
    if (!w) S.full++;
    S.turn = w ? 'b' : 'w';
    return u;
  }
  function unmake(S, m, u) {
    var b = S.b; S.turn = S.turn === 'w' ? 'b' : 'w'; var w = S.turn === 'w';
    if (!w) S.full--;
    b[m.f] = m.p; b[m.t] = m.fl === 'ep' ? null : (m.c || null);
    if (m.fl === 'ep') b[m.t + (w ? 8 : -8)] = m.c;
    else if (m.fl === 'ck') { b[m.t + 1] = b[m.t - 1]; b[m.t - 1] = null; }
    else if (m.fl === 'cq') { b[m.t - 2] = b[m.t + 1]; b[m.t + 1] = null; }
    S.cr = u.cr; S.ep = u.ep; S.half = u.half;
  }
  function legal(S, capsOnly) {
    var me = S.turn, out = [];
    pseudo(S, capsOnly).forEach(function (m) { var u = make(S, m); if (!attacked(S, kingSq(S, me), S.turn)) out.push(m); unmake(S, m, u); });
    return out;
  }
  function evalW(S) { // centipawns from White's side
    var b = S.b, s = 0, i, p, t;
    for (i = 0; i < 64; i++) { p = b[i]; if (!p) continue; t = p.toLowerCase(); if (p < 'a') s += VAL[t] + PST[t][i]; else s -= VAL[t] + PST[t][(7 - (i >> 3)) * 8 + (i & 7)]; }
    return s;
  }
  var nodes = 0;
  function order(ms) { ms.forEach(function (m) { m.o = (m.c ? 10 * VAL[m.c.toLowerCase()] - VAL[m.p.toLowerCase()] + 10000 : 0) + (m.pr ? 9000 : 0); }); ms.sort(function (a, b) { return b.o - a.o; }); return ms; }
  function quiesce(S, a, b, d) {
    nodes++; var stand = (S.turn === 'w' ? 1 : -1) * evalW(S);
    if (stand >= b) return b; if (stand > a) a = stand; if (d <= 0) return a;
    var ms = order(legal(S, true)), i, u, v;
    for (i = 0; i < ms.length; i++) { u = make(S, ms[i]); v = -quiesce(S, -b, -a, d - 1); unmake(S, ms[i], u); if (v >= b) return b; if (v > a) a = v; }
    return a;
  }
  function search(S, depth, a, b, ply) { // score for the side to move
    if (depth <= 0) return quiesce(S, a, b, 4);
    nodes++; var ms = order(legal(S)), i, u, v;
    if (!ms.length) return inCheck(S) ? -100000 + ply : 0;
    if (S.half >= 100) return 0;
    for (i = 0; i < ms.length; i++) { u = make(S, ms[i]); v = -search(S, depth - 1, -b, -a, ply + 1); unmake(S, ms[i], u); if (v >= b) return b; if (v > a) a = v; }
    return a;
  }
  // Every legal move with its score (centipawns, for the side to move), best first.
  function analyse(S, depth) {
    var ms = legal(S), out = [];
    ms.forEach(function (m) { var u = make(S, m), v = -search(S, depth - 1, -200000, 200000, 1); unmake(S, m, u); out.push({ m: m, s: v }); });
    out.sort(function (x, y) { return y.s - x.s; });
    return out;
  }
  function winChance(cp) { if (cp > 90000) return 1; if (cp < -90000) return 0; return 1 / (1 + Math.pow(10, -cp / 400)); }
  function perft(S, d) { if (!d) return 1; var n = 0; legal(S).forEach(function (m) { var u = make(S, m); n += perft(S, d - 1); unmake(S, m, u); }); return n; }
  function status(S) { var ms = legal(S); if (ms.length) return S.half >= 100 ? 'draw50' : (insufficient(S) ? 'drawMat' : (inCheck(S) ? 'check' : 'play')); return inCheck(S) ? 'mate' : 'stalemate'; }
  function insufficient(S) { var s = S.b.filter(Boolean).join('').replace(/[Kk]/g, ''); return s === '' || /^[NnBb]$/.test(s); }
  var api = { start: start, fromFEN: fromFEN, legal: legal, make: make, unmake: unmake, analyse: analyse, evalW: evalW, winChance: winChance, perft: perft, status: status, inCheck: inCheck, kingSq: kingSq, side: side, VAL: VAL };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ChessEngine = api;
})(typeof window !== 'undefined' ? window : this);
