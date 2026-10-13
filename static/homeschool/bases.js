/* Teach Number Bases: the bundling machine and print buttons */
(function (W, D) {
  'use strict';
  var HX = '0123456789ABCDEF';
  var COLS = { 10: 3, 2: 6, 8: 3, 16: 3 };
  var NAME = { 10: 'base 10', 2: 'binary', 8: 'octal', 16: 'hex' };
  var WORD = { 1: 'one', 2: 'two', 4: 'four', 8: 'eight', 10: 'ten', 16: 'sixteen', 32: 'thirty-two', 64: 'sixty-four', 100: 'a hundred', 256: 'two hundred fifty-six' };

  D.querySelectorAll('.nb-try').forEach(function (box) {
    var b = +box.dataset.base, n = COLS[b], inp = box.querySelector('input'), cols = box.querySelector('.nb-cols'), out = box.querySelector('.nb-out');
    var max = Math.pow(b, n) - 1, prev = null;
    function digits(v) { var d = []; for (var i = n - 1; i >= 0; i--) { var p = Math.pow(b, i); d.push(Math.floor(v / p) % b); } return d; }
    function draw(v, flash) {
      var d = digits(v), pd = prev === null ? null : digits(prev);
      cols.innerHTML = d.map(function (x, k) {
        var p = Math.pow(b, n - 1 - k), toks = '';
        for (var j = 0; j < x; j++) toks += p === 1 ? '<i class="nb-bean"></i>' : '<i class="nb-cup">' + p + '</i>';
        var carry = flash && pd && pd[k] !== x && x === 0 ? ' carry' : '', got = flash && pd && x > pd[k] ? ' got' : '';
        return '<div class="nb-col' + carry + got + '"><span class="nb-ph">' + (p === 1 ? '1s' : p + 's') + '</span><div class="nb-toks">' + toks + '</div><b>' + HX[x] + '</b></div>';
      }).join('');
      var parts = [], s = v.toString(b).toUpperCase();
      d.forEach(function (x, k) { var p = Math.pow(b, n - 1 - k); if (x) parts.push(x + ' × ' + p); });
      out.innerHTML = '<b>' + v + '</b> bean' + (v === 1 ? '' : 's') + ' = ' + (parts.length ? parts.join(' + ') : '0') + ' → written <b class="nb-num">' + s + '</b> in ' + NAME[b] +
        (b !== 10 ? ' <span class="hs-small">(say “' + s.split('').join('-') + '”)</span>' : '') +
        (flash && pd && d.some(function (x, k) { return x === 0 && pd[k] !== 0; }) ? '<br><span class="nb-carrymsg">A place filled up to ' + (WORD[b] || b) + ', so it was bundled and carried one place to the left.</span>' : '');
      prev = v;
    }
    function set(v, flash) { v = Math.max(0, Math.min(max, Math.round(+v || 0))); inp.value = v; draw(v, flash); }
    box.querySelectorAll('[data-a]').forEach(function (btn) { btn.addEventListener('click', function () { set(+inp.value + (+btn.dataset.a), +btn.dataset.a > 0); }); });
    inp.addEventListener('input', function () { prev = null; set(inp.value, false); });
    set(inp.value, false);
  });

  function printWith(cls) {
    var open = [].filter.call(D.querySelectorAll('.nb-ans'), function (d) { return !d.open; });
    if (cls === 'nb-printing-guide') open.forEach(function (d) { d.open = true; });
    D.body.classList.add(cls); W.print();
    setTimeout(function () { D.body.classList.remove(cls); open.forEach(function (d) { d.open = false; }); }, 500);
  }
  var pg = D.getElementById('nb-print'), pk = D.getElementById('nb-printkit');
  if (pg) pg.addEventListener('click', function () { printWith('nb-printing-guide'); });
  if (pk) pk.addEventListener('click', function () { printWith('nb-printing-kit'); });
})(window, document);
