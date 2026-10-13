/* Sewing & Knitting: optional step ticks (this browser only) and the tool filter. */
(function (W, D) {
  'use strict';
  var KEY = 'trb-sewing-v1', st = { done: {} };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv && sv.done) st = { done: sv.done }; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function cnt(o) { var c = 0; for (var k in o) if (o[k]) c++; return c; }
  D.querySelectorAll('.os-card[data-skill]').forEach(function (a) {
    var c = cnt(st.done[a.dataset.skill] || {}); if (!c) return;
    var p = a.querySelector('.os-prog'); p.hidden = false; p.textContent = c + ' of ' + a.dataset.n + ' steps done';
  });
  var root = D.getElementById('os-skill');
  if (root) {
    var key = root.dataset.skill, mine = st.done[key] || (st.done[key] = {});
    root.querySelectorAll('.os-steps input').forEach(function (b) {
      b.checked = !!mine[b.dataset.i]; b.closest('li').classList.toggle('ticked', b.checked);
      b.addEventListener('change', function () { if (b.checked) mine[b.dataset.i] = 1; else delete mine[b.dataset.i]; save(); b.closest('li').classList.toggle('ticked', b.checked); });
    });
  }
  var bar = D.querySelector('.sw-filter'); if (!bar) return;
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var f = b.dataset.f;
    bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    D.querySelectorAll('.sw-tgroup').forEach(function (g) {
      var any = 0;
      g.querySelectorAll('.sw-tool').forEach(function (t) {
        var on = f === 'all' || f === g.dataset.craft || f === t.dataset.kind;
        t.hidden = !on; if (on) any++;
      });
      g.hidden = !any;
    });
  });
})(window, document);
