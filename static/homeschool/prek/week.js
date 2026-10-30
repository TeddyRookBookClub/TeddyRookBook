/* Pre-K at home: deal out a new "week of ideas" from data/prek.yaml (carried on #pk-sheet), and print it. */
(function (W, D) {
  'use strict';
  var sheet = D.getElementById('pk-sheet'), body = D.getElementById('pk-wk-b'), nb = D.getElementById('pk-new'), pb = D.getElementById('pk-print');
  if (!sheet || !body) return;
  var pools = [];
  try { pools = JSON.parse(sheet.dataset.pools || '[]'); } catch (e) { }
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var last = pools.map(function (p) { return p.ideas.slice(0, 5); });
  function deal() {
    // each column: five ideas, never the same five in the same order as the last week
    var cols = pools.map(function (p, k) {
      var pick;
      for (var t = 0; t < 20; t++) { pick = shuffle(p.ideas).slice(0, 5); if (pick.join('|') !== last[k].join('|')) break; }
      return pick;
    });
    last = cols;
    body.innerHTML = DAYS.map(function (d, i) {
      return '<tr><th scope="row">' + d + '</th>' + cols.map(function (c, k) { return '<td data-c="' + esc(pools[k].name) + '">' + esc(c[i]) + '</td>'; }).join('') + '</tr>';
    }).join('');
  }
  if (nb && pools.length) nb.addEventListener('click', deal);
  if (pb) pb.addEventListener('click', function () { W.print(); });
})(window, document);
