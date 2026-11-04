/* Robotics Ladder: generators for Mobile Robots and Navigation (course key rbmobile), 6 topics.
   Differential drive: v = (vR + vL)/2, ω = (vR − vL)/W (W = the whole distance between the wheels), radius = v/ω.
   Odometry: drive d along the heading, then turn (the simple order used in the lesson). Grids count cells from 0.
   Paths on a 4-connected grid; A* with the Manhattan distance as h. */
(function (ML) {
  'use strict';
  if (!ML) return;
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;
  function fx(x) { return +(+x).toPrecision(12); }
  function sg(x, n) { if (!x || !isFinite(x)) return x; return +(+x).toPrecision(n || 3); }
  function A(x, n, rtol) { return { t: 'num', v: String(sg(x, n || 3)), rtol: rtol || 0.02 }; }
  function AT(x, tol) { return { t: 'num', v: String(sg(x, 3)), tol: tol }; }
  function AX(x) { return { t: 'num', v: String(fx(x)) }; }
  function MC(c, w) { return U.mc(c, w.filter(function (x) { return x !== c; }), 4); }
  var DEG = 180 / Math.PI;

  // ---------- rbmobile.differential-drive
  G('rbmobile.differential-drive', function (R, ctx) {
    var kind = by(ctx, R.pick(['v', 'dir']), R.pick(['v', 'w']), R.pick(['w', 'rad']));
    var W = R.pick([0.1, 0.12, 0.15, 0.2, 0.25, 0.3]), vl = R.int(1, 8) / 10, vr = R.int(1, 8) / 10;
    if (vl === vr) vr = fx(vr + 0.1);
    var v = (vr + vl) / 2, w = (vr - vl) / W;
    if (kind === 'v') return {
      q: 'A two-wheeled robot\'s left wheel rolls at $' + vl + '\\ \\text{m/s}$ and its right wheel at $' + vr + '\\ \\text{m/s}$. How fast does its center move forward, in meters per second?',
      a: AX(v), unit: 'm/s', steps: ['$v = \\dfrac{v_R + v_L}{2} = \\dfrac{' + vr + ' + ' + vl + '}{2} = ' + fx(v) + '\\ \\text{m/s}$.']
    };
    if (kind === 'dir') return {
      q: 'Left wheel $' + vl + '\\ \\text{m/s}$, right wheel $' + vr + '\\ \\text{m/s}$. Which way does the robot curve?',
      a: MC(vr > vl ? 'Left' : 'Right', ['Left', 'Right', 'Straight ahead']),
      steps: ['The faster wheel swings around the slower one.', 'The ' + (vr > vl ? 'right wheel is faster, so the robot curves left.' : 'left wheel is faster, so the robot curves right.')]
    };
    if (kind === 'w') return {
      q: 'The wheels are $W = ' + W + '\\ \\text{m}$ apart. Left $' + vl + '\\ \\text{m/s}$, right $' + vr + '\\ \\text{m/s}$. What is the turn rate $\\omega$, in radians per second? (Positive means turning left.)',
      a: AT(w, 0.02), unit: 'rad/s', steps: ['$\\omega = \\dfrac{v_R - v_L}{W} = \\dfrac{' + vr + ' - ' + vl + '}{' + W + '} \\approx ' + sg(w, 3) + '\\ \\text{rad/s}$.', 'That is about $' + sg(w * DEG, 3) + '^\\circ$ per second.'],
      hint: 'Divide by the whole distance between the wheels, not half of it.'
    };
    return {
      q: 'The wheels are $' + W + '\\ \\text{m}$ apart. Left $' + vl + '\\ \\text{m/s}$, right $' + vr + '\\ \\text{m/s}$. What is the radius of the circle the center drives, in meters?',
      a: A(Math.abs(v / w), 3), unit: 'm',
      steps: ['$v = ' + fx(v) + '\\ \\text{m/s}$ and $\\omega = ' + sg(w, 4) + '\\ \\text{rad/s}$.', '$r = \\left|\\dfrac{v}{\\omega}\\right| \\approx ' + sg(Math.abs(v / w), 3) + '\\ \\text{m}$.']
    };
  });

  // ---------- rbmobile.odometry
  G('rbmobile.odometry', function (R, ctx) {
    var kind = by(ctx, R.pick(['x', 'y']), R.pick(['x', 'y', 'th']), R.pick(['two', 'x', 'y']));
    var x0 = R.int(-10, 10) / 10, y0 = R.int(-10, 10) / 10, th = R.pick([0, 30, 45, 60, 90, 120, 135, 150, 180, -30, -45, -60, -90]), d = R.pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1]);
    var c = Math.cos(th / DEG), s = Math.sin(th / DEG);
    if (kind === 'x' || kind === 'y') { var isx = kind === 'x', nv = isx ? x0 + d * c : y0 + d * s; return {
      q: 'A robot is at $(' + x0 + ',\\ ' + y0 + ')$ meters, heading $' + th + '^\\circ$ (measured from the $x$-axis, counterclockwise). Its encoders say it rolled $' + d + '\\ \\text{m}$ straight ahead. What is its new $' + kind + '$, in meters?',
      a: AT(nv, 0.005), unit: 'm',
      steps: [(isx ? '$x_{\\text{new}} = x + d\\cos\\theta = ' + x0 + ' + ' + d + ' \\cdot \\cos(' + th + '^\\circ)$' : '$y_{\\text{new}} = y + d\\sin\\theta = ' + y0 + ' + ' + d + ' \\cdot \\sin(' + th + '^\\circ)$') + '.', '$' + (isx ? '\\cos' : '\\sin') + ' ' + th + '^\\circ \\approx ' + sg(isx ? c : s, 3).toString().replace(/^-?0$/, '0') + '$, so the new value is about $' + sg(nv, 3) + '\\ \\text{m}$.']
    }; }
    if (kind === 'th') { var dth = R.pick([-45, -30, -15, 10, 15, 20, 30, 45, 90]); var n = th + dth; if (n > 180) n -= 360; if (n <= -180) n += 360; return {
      q: 'A robot heads $' + th + '^\\circ$. Its wheels say it then turned $' + dth + '^\\circ$ (positive is counterclockwise). What is its new heading, in degrees, between $-180^\\circ$ and $180^\\circ$?',
      a: AX(n), unit: '°', steps: ['$' + th + ' + (' + dth + ') = ' + (th + dth) + '^\\circ$.', (th + dth !== n ? 'Wrap it into range by adding or subtracting $360^\\circ$: $' + n + '^\\circ$.' : 'That is already in range.')]
    }; }
    var d2 = R.pick([0.2, 0.3, 0.5]), th2 = 90;
    var x1 = x0 + d, x2 = x1 + d2 * Math.cos(th2 / DEG), y2 = y0 + d2;
    return {
      q: 'A robot starts at $(' + x0 + ',\\ ' + y0 + ')$ heading $0^\\circ$. It rolls $' + d + '\\ \\text{m}$, turns left $90^\\circ$ in place, then rolls $' + d2 + '\\ \\text{m}$. What is its final $y$, in meters?',
      a: AT(y2, 0.005), unit: 'm', steps: ['First leg along $x$: $(' + fx(x1) + ',\\ ' + y0 + ')$.', 'After the turn it faces $+y$, so the second leg adds $' + d2 + '$ to $y$: $y = ' + fx(y2) + '\\ \\text{m}$. (Its $x$ stays $' + fx(x2) + '$.)']
    };
  });

  // ---------- rbmobile.occupancy-grids
  G('rbmobile.occupancy-grids', function (R, ctx) {
    var kind = by(ctx, 'cell', R.pick(['cell', 'count']), R.pick(['count', 'mem', 'cell']));
    var cs = R.pick([0.05, 0.1, 0.2, 0.25, 0.5]), x = fx(R.int(1, 80) * 0.037 + 0.01);
    if (kind === 'cell') return {
      q: 'An occupancy grid has square cells $' + cs + '\\ \\text{m}$ wide, counted from 0 at $x = 0$. Which column holds the point $x = ' + x + '\\ \\text{m}$?',
      a: AX(Math.floor(x / cs + 1e-9)), steps: ['$x \\div \\text{cell size} = ' + x + ' \\div ' + cs + ' \\approx ' + sg(x / cs, 4) + '$.', 'Take the whole part (round down): column $' + Math.floor(x / cs + 1e-9) + '$. Rounding to the nearest would put points near a border in the wrong cell.']
    };
    var Wm = R.pick([2, 3, 4, 5, 6, 8, 10]), Hm = R.pick([2, 3, 4, 5, 6]), nw = Math.round(Wm / cs), nh = Math.round(Hm / cs);
    if (kind === 'count') return {
      q: 'A room $' + Wm + '\\ \\text{m}$ by $' + Hm + '\\ \\text{m}$ is mapped with cells $' + cs + '\\ \\text{m}$ on a side. How many cells is the grid?',
      a: AX(nw * nh), steps: ['$' + Wm + ' \\div ' + cs + ' = ' + nw + '$ columns and $' + Hm + ' \\div ' + cs + ' = ' + nh + '$ rows.', '$' + nw + ' \\times ' + nh + ' = ' + (nw * nh) + '$ cells. Halving the cell size makes four times as many.']
    };
    return {
      q: 'A map stores one byte per cell. A room $' + Wm + '\\ \\text{m}$ by $' + Hm + '\\ \\text{m}$ uses cells $' + cs + '\\ \\text{m}$ on a side. If the cell size is cut in half, how many bytes does the new map take?',
      a: AX(4 * nw * nh), unit: 'bytes', steps: ['At first: $' + nw + ' \\times ' + nh + ' = ' + nw * nh + '$ bytes.', 'Half the cell size doubles both the rows and the columns: $' + 2 * nw + ' \\times ' + 2 * nh + ' = ' + 4 * nw * nh + '$ bytes.']
    };
  });

  /* a small grid with a wall, solved by breadth-first search (4 neighbors) */
  function bfs(grid, W, H, s, g) {
    var dist = {}, q = [s], key = function (p) { return p[0] + ',' + p[1]; };
    dist[key(s)] = 0;
    while (q.length) {
      var p = q.shift();
      if (p[0] === g[0] && p[1] === g[1]) return dist[key(p)];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var n = [p[0] + d[0], p[1] + d[1]];
        if (n[0] < 0 || n[1] < 0 || n[0] >= W || n[1] >= H || grid[n[1]][n[0]] || dist[key(n)] !== undefined) return;
        dist[key(n)] = dist[key(p)] + 1; q.push(n);
      });
    }
    return -1;
  }
  function gridHtml(grid, s, g) {
    var rows = grid.map(function (r, y) { return r.map(function (c, x) { return (x === s[0] && y === s[1]) ? 'S' : (x === g[0] && y === g[1]) ? 'G' : c ? '#' : '.'; }).join(' '); });
    return '<pre class="rb-gridtxt">' + rows.join('\n') + '</pre>';
  }

  // ---------- rbmobile.grid-search
  G('rbmobile.grid-search', function (R, ctx) {
    var kind = by(ctx, 'open', R.pick(['open', 'wall']), R.pick(['wall', 'dijk']));
    if (kind === 'open') { var dx = R.int(1, 9), dy = R.int(1, 9); return {
      q: 'On an open grid with no walls, a robot moves one cell at a time up, down, left or right. How many moves does the shortest path take from cell $(0,\\ 0)$ to $(' + dx + ',\\ ' + dy + ')$?',
      a: AX(dx + dy), steps: ['It must cover $' + dx + '$ columns and $' + dy + '$ rows, one per move.', '$' + dx + ' + ' + dy + ' = ' + (dx + dy) + '$ moves (the Manhattan distance). Count moves, not cells: the start cell is not a move.']
    }; }
    if (kind === 'wall') {
      for (var tries = 0; tries < 20; tries++) {
        var W = 7, H = 5, grid = [], wx = R.int(2, 4), gap = R.int(0, H - 1), y, x;
        for (y = 0; y < H; y++) { grid.push([]); for (x = 0; x < W; x++) grid[y].push(x === wx && y !== gap ? 1 : 0); }
        var s = [0, R.int(0, H - 1)], g = [W - 1, R.int(0, H - 1)], n = bfs(grid, W, H, s, g);
        if (n > 0) return {
          q: 'A robot on this grid moves up, down, left or right; <b>#</b> is a wall. What is the fewest number of moves from S to G?' + gridHtml(grid, s, g),
          a: AX(n), steps: ['The wall in column ' + wx + ' has one gap, in row ' + gap + ' (rows counted from 0 at the top).', 'Breadth-first search spreads out one ring of cells at a time; the first time it reaches G, the ring number is the answer.', 'Through the gap: $' + n + '$ moves.']
        };
      }
    }
    // Dijkstra on a tiny weighted graph: A to D through B or C
    var ab = R.int(1, 9), bd = R.int(1, 9), ac = R.int(1, 9), cd = R.int(1, 9), bc = R.int(1, 4);
    var best = Math.min(ab + bd, ac + cd, ab + bc + cd, ac + bc + bd);
    return {
      q: 'Roads between four rooms, with travel times in seconds: A–B $' + ab + '$, A–C $' + ac + '$, B–C $' + bc + '$, B–D $' + bd + '$, C–D $' + cd + '$. What is the fastest time from A to D?',
      a: AX(best), steps: ['List the routes: A–B–D $= ' + (ab + bd) + '$, A–C–D $= ' + (ac + cd) + '$, A–B–C–D $= ' + (ab + bc + cd) + '$, A–C–B–D $= ' + (ac + bc + bd) + '$.', 'The smallest is $' + best + '$ seconds. Dijkstra\'s algorithm finds it without listing every route, by always growing from the closest unfinished room.']
    };
  });

  // ---------- rbmobile.a-star
  G('rbmobile.a-star', function (R, ctx) {
    var kind = by(ctx, 'f', R.pick(['f', 'next']), R.pick(['next', 'admit', 'f', 'next']));
    var gx = R.int(5, 12), gy = R.int(3, 9);
    function cell() { return [R.int(0, gx), R.int(0, gy)]; }
    if (kind === 'f') { var c = cell(), g = R.int(1, 12), h = Math.abs(gx - c[0]) + Math.abs(gy - c[1]); return {
      q: 'A* is searching a grid toward the goal at $(' + gx + ',\\ ' + gy + ')$ with $h$ = the Manhattan distance. A cell at $(' + c[0] + ',\\ ' + c[1] + ')$ was reached in $g = ' + g + '$ moves. What is its score $f = g + h$?',
      a: AX(g + h), steps: ['$h = |' + gx + ' - ' + c[0] + '| + |' + gy + ' - ' + c[1] + '| = ' + h + '$.', '$f = ' + g + ' + ' + h + ' = ' + (g + h) + '$.']
    }; }
    if (kind === 'next') {
      var cs = [], seen = {}, i;
      while (cs.length < 3) { var p = cell(); if (seen[p]) continue; seen[p] = 1; p.g = R.int(1, 10); p.f = p.g + Math.abs(gx - p[0]) + Math.abs(gy - p[1]); cs.push(p); }
      var fs = cs.map(function (p) { return p.f; }), mn = Math.min.apply(null, fs);
      if (fs.filter(function (f) { return f === mn; }).length > 1) { cs[0].g += 0; cs[1].g += 2; cs[1].f += 2; cs[2].g += 3; cs[2].f += 3; fs = cs.map(function (p) { return p.f; }); mn = Math.min.apply(null, fs); }
      if (fs.filter(function (f) { return f === mn; }).length > 1) { cs[0].g -= 0; cs[1].f += 7; cs[1].g += 7; cs[2].f += 13; cs[2].g += 13; fs = cs.map(function (p) { return p.f; }); mn = Math.min.apply(null, fs); }
      var names = cs.map(function (p) { return '(' + p[0] + ', ' + p[1] + ') with g = ' + p.g; }), best = names[fs.indexOf(mn)];
      return {
        q: 'Goal at $(' + gx + ',\\ ' + gy + ')$, $h$ = Manhattan distance. A* has three cells waiting: ' + names.join('; ') + '. Which does it open next?',
        a: MC(best, names), steps: cs.map(function (p) { return '$(' + p[0] + ',\\ ' + p[1] + ')$: $f = ' + p.g + ' + ' + (p.f - p.g) + ' = ' + p.f + '$.'; }).concat(['A* opens the smallest $f$ first.'])
      };
    }
    var it = R.pick([
      ['Straight-line distance to the goal, on a grid where moves cost their length', true],
      ['Manhattan distance, when the robot may only move up, down, left or right', true],
      ['Twice the Manhattan distance', false],
      ['Zero for every cell (which makes A* the same as Dijkstra)', true],
      ['The Manhattan distance plus 10', false],
      ['The number of cells in the whole map', false]]);
    return {
      q: 'A* finds the shortest path if its guess $h$ never overestimates the true distance left. On a 4-connected grid with every move costing 1, is this a safe choice of $h$? <i>' + it[0] + '</i>',
      a: { t: 'tf', v: it[1] }, steps: [it[1] ? 'True: it never guesses more than the real remaining cost.' : 'False: it can guess more than the real remaining cost, so A* may settle on a longer path.']
    };
  });

  // ---------- rbmobile.slam-ideas
  G('rbmobile.slam-ideas', function (R, ctx) {
    var kind = by(ctx, 'side', R.pick(['side', 'pct']), R.pick(['pct', 'which']));
    var e = R.int(1, 8), d = R.pick([2, 3, 4, 5, 8, 10, 15, 20, 25, 50]);
    if (kind === 'side') return {
      q: 'A robot\'s heading is off by $' + e + '^\\circ$ and it drives $' + d + '\\ \\text{m}$ in a straight line. About how far to the side of the true path does it end up, in meters? (Use $d\\sin\\theta$.)',
      a: A(d * Math.sin(e / DEG), 3), unit: 'm', steps: ['$' + d + ' \\times \\sin ' + e + '^\\circ \\approx ' + d + ' \\times ' + sg(Math.sin(e / DEG), 3) + ' \\approx ' + sg(d * Math.sin(e / DEG), 3) + '\\ \\text{m}$.', 'The error grows with every meter, which is why dead reckoning alone drifts.']
    };
    if (kind === 'pct') { var p = R.pick([1, 2, 3, 5]), dd = R.pick([10, 20, 50, 100, 200]); return {
      q: 'Wheel odometry is off by about $' + p + '\\%$ of the distance traveled. After $' + dd + '\\ \\text{m}$, about how large is the position error, in meters?',
      a: AX(p * dd / 100), unit: 'm', steps: ['$' + p + '\\% \\times ' + dd + ' = ' + fx(p * dd / 100) + '\\ \\text{m}$.', 'Seeing a landmark whose place is known lets the robot correct this; SLAM builds the landmark map at the same time.']
    }; }
    var it = R.pick([
      ['What does SLAM stand for?', 'Simultaneous localization and mapping', ['Sensor logging and motion', 'Straight-line automatic movement', 'Small light-activated motor']],
      ['A robot sees a landmark it mapped earlier. What can it do with that?', 'Pull its position estimate back toward the truth', ['Nothing, landmarks only matter for maps', 'Throw away its whole map', 'Speed up its wheels']],
      ['Why does odometry alone drift?', 'Small errors in every step add up and never get corrected', ['Encoders slowly lose their memory', 'The robot gets heavier', 'Wheels always slip backward']],
      ['Returning to a place seen before and fixing the map to match is called what?', 'Loop closure', ['Dead reckoning', 'Thresholding', 'Pulse-width modulation']]]);
    return { q: it[0], a: MC(it[1], it[2]), steps: [it[1] + '.'] };
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
