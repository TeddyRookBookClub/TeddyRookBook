/* Judge's ballots page (layouts/debate/ballots.html): shows one ballot at a time and runs the simple scoring sheet
   (saved in TRBDebate part "ballots"). The ballots themselves are plain HTML, so they print without this script too. */
(function () {
  'use strict';
  var D = window.TRBDebate, $ = D.$, $$ = D.$$, esc = D.esc;
  var root = $('#dbb');
  if (!root) return;
  var sel = $('#dbb-fmt');
  var st = D.part('ballots', {});
  var CRIT = ['arg', 'ev', 'ref', 'org', 'del', 'cx'];
  var NAMES = { arg: 'Arguments', ev: 'Evidence', ref: 'Refutation', org: 'Organization', del: 'Delivery', cx: 'Questions' };

  function show(k) {
    $$('.dbb-ballot', root).forEach(function (b) { b.hidden = b.dataset.key !== k; });
    st.fmt = k; D.save();
    try { history.replaceState(null, '', '#' + k); } catch (e) { }
  }
  root.classList.add('dbb-js');
  var want = (location.hash || '').slice(1);
  var keys = $$('option', sel).map(function (o) { return o.value; });
  sel.value = keys.indexOf(want) >= 0 ? want : (keys.indexOf(st.fmt) >= 0 ? st.fmt : keys[0]);
  show(sel.value);
  sel.addEventListener('change', function () { show(sel.value); });
  $('#dbb-print').addEventListener('click', function () { delete document.documentElement.dataset.dbblank; window.print(); });

  /* ---------- scoring sheet ---------- */
  var sheet = st.sheet || (st.sheet = { topic: '', rows: [{ n: '', s: 'Aff' }, { n: '', s: 'Aff' }, { n: '', s: 'Neg' }, { n: '', s: 'Neg' }] });
  var body = $('#dbs-body'), topic = $('#dbs-topic');
  topic.value = sheet.topic || '';
  topic.addEventListener('input', function () { sheet.topic = topic.value; D.save(); });
  function total(r) { return CRIT.reduce(function (t, c) { return t + (+r[c] || 0); }, 0); }
  function render() {
    body.innerHTML = sheet.rows.map(function (r, i) {
      var h = '<tr data-r="' + i + '"><td><input type="text" class="dbb-in" data-k="n" value="' + esc(r.n) + '" aria-label="Speaker ' + (i + 1) + ' name"></td>' +
        '<td><input type="text" class="dbb-in dbs-side" data-k="s" value="' + esc(r.s) + '" aria-label="Speaker ' + (i + 1) + ' side"></td>';
      CRIT.forEach(function (c) {
        h += '<td><select class="dbs-sel" data-c="' + c + '" aria-label="' + NAMES[c] + ', speaker ' + (i + 1) + '"><option value="">–</option>';
        for (var v = 1; v <= 5; v++) h += '<option' + (+r[c] === v ? ' selected' : '') + '>' + v + '</option>';
        h += '</select><span class="dbs-print">' + (r[c] || '') + '</span></td>';
      });
      return h + '<td class="dbs-tot">' + (total(r) || '') + '</td></tr>';
    }).join('');
  }
  body.addEventListener('input', function (e) {
    var t = e.target, tr = t.closest('[data-r]'); if (!tr || !t.dataset.k) return;
    sheet.rows[+tr.dataset.r][t.dataset.k] = t.value; D.save();
  });
  body.addEventListener('change', function (e) {
    var t = e.target; if (!t.dataset.c) return;
    var tr = t.closest('[data-r]'), r = sheet.rows[+tr.dataset.r];
    r[t.dataset.c] = +t.value || 0;
    t.nextElementSibling.textContent = r[t.dataset.c] || '';
    tr.querySelector('.dbs-tot').textContent = total(r) || '';
    D.save();
  });
  $('#dbs-add').addEventListener('click', function () { if (sheet.rows.length >= 16) return; sheet.rows.push({ n: '', s: '' }); D.save(); render(); var ins = $$('[data-k="n"]', body); ins[ins.length - 1].focus(); });
  $('#dbs-clear').addEventListener('click', function () {
    if (!confirm('Clear all names and scores?')) return;
    sheet.topic = ''; topic.value = '';
    sheet.rows = sheet.rows.map(function (r) { return { n: '', s: r.s }; }); D.save(); render();
  });
  $('#dbs-blank').addEventListener('click', function () { document.documentElement.dataset.dbblank = '1'; window.print(); });
  window.addEventListener('afterprint', function () { delete document.documentElement.dataset.dbblank; });
  render();
})();
