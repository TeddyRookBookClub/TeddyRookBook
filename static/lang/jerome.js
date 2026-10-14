/* Greek and Latin with Jerome: Study Companion pages. Show/hide toggles, practice checks, word list filter. */
(function () {
  var root = document.querySelector('.jc'); if (!root) return;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // Pronunciation / English toggles on passage pages (remembered on this device)
  root.querySelectorAll('.jc-tools button[data-t]').forEach(function (b) {
    var cls = b.dataset.t, key = 'trb-jc-' + cls;
    function apply(off) { root.classList.toggle(cls, off); b.setAttribute('aria-pressed', off ? 'false' : 'true'); }
    apply(get(key) === '1');
    b.addEventListener('click', function () { var off = !root.classList.contains(cls); apply(off); set(key, off ? '1' : '0'); });
  });
  var en = root.querySelector('.jc-en');
  if (en) en.addEventListener('click', function () {
    if (!root.classList.contains('noen')) return;
    root.classList.remove('noen');
    var b = root.querySelector('.jc-tools button[data-t="noen"]'); if (b) b.setAttribute('aria-pressed', 'true');
  });

  // Practice: multiple choice
  root.querySelectorAll('.jc-q[data-kind="mc"]').forEach(function (q) {
    var ok = q.dataset.ok;
    q.querySelectorAll('.jc-opts button').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!ok) return;
        q.querySelectorAll('.jc-opts button').forEach(function (x) { x.classList.remove('ok', 'no'); });
        b.classList.add(b.dataset.l === ok ? 'ok' : 'no');
        if (b.dataset.l === ok) { var d = q.querySelector('.jc-ans'); if (d) d.open = true; }
      });
    });
  });

  // Practice: matching
  root.querySelectorAll('.jc-q[data-kind="match"]').forEach(function (q) {
    var key = {}, s = (q.dataset.ans || '').split(' (')[0], m, re = /(\d+)\s*[–-]\s*([a-z])/g;
    while ((m = re.exec(s))) key[m[1]] = m[2];
    var btn = q.querySelector('.jc-check'), out = q.querySelector('.jc-score');
    if (!Object.keys(key).length) { if (btn) btn.hidden = true; return; }
    q.querySelectorAll('.jc-match select').forEach(function (sel) {
      sel.addEventListener('change', function () { sel.parentNode.classList.remove('ok', 'no'); if (out) out.textContent = ''; });
    });
    btn.addEventListener('click', function () {
      var right = 0, total = 0, blank = 0;
      q.querySelectorAll('.jc-match li[data-i]').forEach(function (li) {
        var sel = li.querySelector('select'), want = key[li.dataset.i]; if (!want) return;
        total++; li.classList.remove('ok', 'no');
        if (!sel.value) { blank++; return; }
        if (sel.value === want) { right++; li.classList.add('ok'); } else li.classList.add('no');
      });
      out.textContent = right + ' of ' + total + ' right' + (blank ? ' (' + blank + ' not answered)' : '') + (right === total ? '. Well done!' : '');
    });
  });

  // Word lists: filter and sort
  var f = document.getElementById('jc-filter'), so = document.getElementById('jc-sort'), tb = root.querySelector('.jc-vocab tbody');
  if (f && tb) {
    var rows = [].slice.call(tb.rows), cnt = document.getElementById('jc-count');
    function fold(t) { return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
    rows.forEach(function (r) { r._t = fold(r.textContent); });
    var coll = new Intl.Collator(undefined, { sensitivity: 'base' });
    function run() {
      var t = fold(f.value.trim()), n = 0;
      rows.forEach(function (r) { var show = !t || r._t.indexOf(t) >= 0; r.hidden = !show; if (show) n++; });
      cnt.textContent = n + (n === 1 ? ' word' : ' words');
    }
    function sort() {
      var k = so.value;
      rows.sort(function (a, b) {
        if (k === 'alpha') return coll.compare(fold(a.dataset.w), fold(b.dataset.w));
        if (k === 'first') return (+a.dataset.first - +b.dataset.first) || (+a.dataset.rank - +b.dataset.rank);
        return +a.dataset.rank - +b.dataset.rank;
      });
      rows.forEach(function (r) { tb.appendChild(r); });
    }
    f.addEventListener('input', run); so.addEventListener('change', sort);
    if (f.value) run();
  }
})();
