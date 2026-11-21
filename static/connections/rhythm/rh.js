/* "After the Riemann Hypothesis": sorting and filtering for the table of results (layouts/connections/rhythm-rh.html).
   Without this script the whole table is shown in its written order and the tools stay hidden. */
(function () {
  var tools = document.getElementById('rh-tools'), table = document.getElementById('rh-t'); if (!tools || !table) return;
  var body = table.tBodies[0], rows = [].slice.call(body.rows);
  var q = document.getElementById('rh-q'), fs = document.getElementById('rh-fs'), fd = document.getElementById('rh-fd'), fa = document.getElementById('rh-fa');
  var count = document.getElementById('rh-count'), none = document.getElementById('rh-none'), heads = [].slice.call(table.querySelectorAll('thead th[data-k]'));
  var text = rows.map(function (r) { return r.textContent.toLowerCase(); });
  var title = rows.map(function (r) { return r.querySelector('b').textContent.toLowerCase(); });
  function filter() {
    var words = q.value.toLowerCase().split(/\s+/).filter(Boolean), shown = 0;
    rows.forEach(function (r) {
      var i = +r.getAttribute('data-i');
      var ok = (!fs.value || r.getAttribute('data-g') === fs.value) && (!fd.value || r.getAttribute('data-d') === fd.value) &&
        (!fa.value || r.getAttribute('data-a') === fa.value) && words.every(function (w) { return text[i].indexOf(w) >= 0; });
      r.hidden = !ok; if (ok) shown++;
    });
    none.hidden = shown > 0;
    count.textContent = shown === rows.length ? 'Showing all ' + rows.length + ' results.' : 'Showing ' + shown + ' of ' + rows.length + ' results.';
  }
  function sort(k, dir) {
    var key = function (r) { var i = +r.getAttribute('data-i'); return k === 't' ? title[i] : k === 'd' ? +r.getAttribute('data-d') : k === 's' ? +r.getAttribute('data-s') : i; };
    rows.slice().sort(function (a, b) {
      var x = key(a), y = key(b), c = x < y ? -1 : x > y ? 1 : 0;
      return (c * dir) || (+a.getAttribute('data-i') - +b.getAttribute('data-i'));
    }).forEach(function (r) { body.appendChild(r); });
  }
  heads.forEach(function (th) {
    th.querySelector('button').addEventListener('click', function () {
      var dir = th.getAttribute('aria-sort') === 'ascending' ? -1 : 1;
      heads.forEach(function (h) { h.setAttribute('aria-sort', 'none'); });
      th.setAttribute('aria-sort', dir === 1 ? 'ascending' : 'descending');
      sort(th.getAttribute('data-k'), dir);
    });
  });
  [q, fs, fd, fa].forEach(function (el) { el.addEventListener(el === q ? 'input' : 'change', filter); });
  document.getElementById('rh-reset').addEventListener('click', function () {
    q.value = ''; fs.value = ''; fd.value = ''; fa.value = '';
    heads.forEach(function (h) { h.setAttribute('aria-sort', 'none'); }); sort('i', 1); filter();
  });
  tools.hidden = false; filter();
})();
