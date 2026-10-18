/* Cube Solver: runs the solvers off the page's main thread, so the page stays responsive while tables are
   built (about a second the first time) and while the 3×3 search looks for a short answer.
   Messages in:  {cmd: 'load', urls: [...]}, {cmd: 'warm', N}, {id, cmd: 'solve', N, stickers, method, colorAt, opp},
                 {id, cmd: 'scramble', N}
   Messages out: {id, ok: true, result} or {id, ok: false, error} */
(function (G) {
  'use strict';
  var loaded = false;
  function handle(d) {
    var NS = G.TRBCube;
    if (d.cmd === 'warm') { if (d.N === 2) NS.two.init(); else if (d.N === 3) NS.three.init(); else { NS.three.init(); NS.four.init(); NS.four.initEdges(); } return { warm: d.N }; }
    if (d.cmd === 'scramble') return NS.solverCore.scramble(d.N);
    if (d.cmd === 'solve') return NS.solverCore.solve(d);
    throw new Error('unknown command');
  }
  G.onmessage = function (ev) {
    var d = ev.data || {};
    if (d.cmd === 'load') {
      try { if (!loaded) { G.importScripts.apply(G, d.urls); loaded = true; } G.postMessage({ id: d.id, ok: true, result: 'loaded' }); }
      catch (e) { G.postMessage({ id: d.id, ok: false, error: String(e && e.message || e) }); }
      return;
    }
    try { G.postMessage({ id: d.id, ok: true, result: handle(d) }); }
    catch (e) { G.postMessage({ id: d.id, ok: false, error: String(e && e.message || e) }); }
  };
})(self);
