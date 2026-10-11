/* Old exams: save "got it right" ticks in this browser, and a simple countdown for each section. */
(function (W, D) {
  'use strict';
  var root = D.querySelector('.hs-exam'); if (!root) return;
  var KEY = 'trb-exams-v1', ex = root.dataset.exam, st = {};
  try { st = JSON.parse(W.localStorage.getItem(KEY) || '{}') || {}; } catch (e) { }
  var mine = st[ex] || (st[ex] = {});
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  var boxes = root.querySelectorAll('.hx-qs li[data-q] input[type=checkbox]');
  function score() { var n = 0; boxes.forEach(function (b) { if (b.checked) n++; }); D.getElementById('hx-score').textContent = boxes.length ? n + ' of ' + boxes.length + ' marked right' : ''; }
  boxes.forEach(function (b) {
    var id = b.closest('li').dataset.q; b.checked = !!mine[id];
    b.addEventListener('change', function () { if (b.checked) mine[id] = 1; else delete mine[id]; save(); score(); });
  });
  score();
  root.querySelectorAll('.hx-timer').forEach(function (btn) {
    var t = btn.dataset.t.toLowerCase(), mins = 0, m;
    if ((m = /([\d.]+)\s*hours?/.exec(t))) mins = parseFloat(m[1]) * 60; else if ((m = /(\d+)\s*min/.exec(t))) mins = +m[1]; else if (/one hour/.test(t)) mins = 60; else if (/half/.test(t)) mins = 30;
    if (!mins) { btn.hidden = true; return; }
    var left = btn.nextElementSibling, timer = 0, end = 0;
    function tick() { var s = Math.max(0, Math.round((end - Date.now()) / 1000)); left.textContent = Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2) + ' left'; if (!s) { clearInterval(timer); timer = 0; left.textContent = 'Time!'; btn.textContent = '⏱ Start the clock'; } }
    btn.addEventListener('click', function () {
      if (timer) { clearInterval(timer); timer = 0; btn.textContent = '⏱ Start the clock'; left.textContent = ''; return; }
      end = Date.now() + mins * 60000; btn.textContent = '■ Stop'; tick(); timer = setInterval(tick, 1000);
    });
  });
})(window, document);
