/* Cube Solver: one entry point for every solver (TRBCube.solverCore), used by the Web Worker, by the page
   when a worker can't start, and by the node tests.
   solve({N, stickers, method, colorAt, opp}) -> {method, steps: [{stage, title, text, moves}], moves, ms}
   scramble(N) -> {moves}: a random position for the 2×2 and 3×3 (every position equally likely), random turns for the 4×4. */
(function (G) {
  'use strict';
  var NS = G.TRBCube;
  function now() { return (G.performance && G.performance.now) ? G.performance.now() : Date.now(); }
  function solve(d) {
    var t0 = now(), s = Int8Array.from(d.stickers), out;
    if (d.N === 2) {
      var r2 = NS.two.solveFacelets(s, d.opp);
      if (r2.error) throw new Error(r2.error);
      out = { method: 'optimal', steps: [{ stage: 0, title: 'Shortest solution', text: r2.moves.length ? 'These ' + r2.moves.length + ' turns solve it, and no shorter answer exists. Hold the cube the way you entered it the whole time: only the top, right and front faces turn, so the back-bottom-left corner never moves.' : 'This cube is already solved.', moves: r2.moves }] };
    } else if (d.N === 3 && d.method === 'beginner') {
      var b = NS.beginner.solve(s);
      out = { method: 'beginner', steps: b.steps };
    } else if (d.N === 3) {
      var r3 = NS.three.solveFacelets(s, { maxTime: d.maxTime || 1500, target: d.target || 20 });
      if (r3.error) throw new Error(r3.error);
      out = { method: 'fast', steps: [{ stage: 0, title: 'Fewest moves', text: r3.moves.length ? 'A ' + r3.moves.length + '-turn solution from the two-phase method. Hold the cube the way you entered it: the same center facing you and the same center on top, the whole time.' : 'This cube is already solved.', moves: r3.moves }] };
    } else {
      var r4 = NS.four.solve(s, d.colorAt);
      out = { method: 'reduction', steps: r4.steps };
    }
    out.moves = [].concat.apply([], out.steps.map(function (x) { return x.moves; }));
    out.ms = Math.round(now() - t0);
    return out;
  }
  function scramble(N) {
    if (N === 2) { var c = NS.two.randomState(); return { moves: NS.moves.invert(NS.two.solveCorners(c)) }; }
    if (N === 3) {
      var mv; do { mv = NS.three.solveCubie(NS.three.randomCube(), { maxTime: 300, target: 21 }); } while (!mv || mv.length < 8);
      return { moves: NS.moves.invert(mv) };
    }
    return { moves: NS.moves.randomMoves(4, 40) };
  }
  NS.solverCore = { solve: solve, scramble: scramble };
})(globalThis);
