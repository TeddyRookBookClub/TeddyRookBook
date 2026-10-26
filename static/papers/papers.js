/* Federalist & Anti-Federalist Papers: reading tools, highlights, search, table filter. Storage key trb-papers-v1. */
(function () {
  var KEY = 'trb-papers-v1';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  var root = document.querySelector('.pp');
  if (!root) return;
  var st = load();

  /* ---- reading tools ---- */
  var text = document.querySelector('.pp-text');
  var page = root.getAttribute('data-key');
  if (text) {
    var fs = st.fs || 1.12;
    var setFs = function (v) { fs = Math.min(1.5, Math.max(0.95, Math.round(v * 100) / 100)); text.style.setProperty('--fs', fs + 'rem'); st.fs = fs; save(st); };
    if (st.fs) setFs(st.fs);
    var pars = Array.prototype.slice.call(text.querySelectorAll('.pp-par'));
    var marks = (st.hl && st.hl[page]) || [];
    pars.forEach(function (p) { if (marks.indexOf(p.id) > -1) p.classList.add('hl'); });
    var store = function () {
      st.hl = st.hl || {};
      var ids = pars.filter(function (p) { return p.classList.contains('hl'); }).map(function (p) { return p.id; });
      if (ids.length) st.hl[page] = ids; else delete st.hl[page];
      save(st);
      var c = document.getElementById('pp-hlcount');
      if (c) c.textContent = ids.length ? ids.length + ' highlighted' : '';
    };
    store();
    var hlBtn = document.getElementById('pp-hl');
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pp]');
      if (b) {
        var a = b.getAttribute('data-pp');
        if (a === 'smaller') setFs(fs - 0.06);
        else if (a === 'larger') setFs(fs + 0.06);
        else if (a === 'print') window.print();
        else if (a === 'hl') { var on = !root.classList.contains('hlmode'); root.classList.toggle('hlmode', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }
        else if (a === 'clear') { pars.forEach(function (p) { p.classList.remove('hl'); }); store(); }
        return;
      }
      if (!root.classList.contains('hlmode')) return;
      if (e.target.closest('a')) return;
      var p = e.target.closest('.pp-par');
      if (p && text.contains(p)) { p.classList.toggle('hl'); store(); }
    });
  }

  /* ---- search across all papers ---- */
  var idx = null, loading = null;
  function getIndex(url) {
    if (idx) return Promise.resolve(idx);
    if (!loading) loading = fetch(url).then(function (r) { return r.json(); }).then(function (j) { idx = j; return j; });
    return loading;
  }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(s) { return s.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"'); }
  Array.prototype.forEach.call(document.querySelectorAll('.pp-search form'), function (f) {
    var box = f.closest('.pp-search');
    var out = box.querySelector('.pp-res');
    var msg = box.querySelector('.pp-msg');
    var scope = box.querySelector('select');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = norm(f.querySelector('input').value.trim());
      out.innerHTML = '';
      if (q.length < 3) { msg.textContent = 'Type at least three letters.'; return; }
      msg.textContent = 'Searching…';
      getIndex(box.getAttribute('data-index')).then(function (docs) {
        var phrase = /^".*"$/.test(q);
        var terms = phrase ? [q.slice(1, -1)] : q.split(/\s+/).filter(Boolean);
        var want = scope ? scope.value : '';
        var hits = [], total = 0;
        docs.forEach(function (d) {
          if (want && d.k !== want) return;
          d.p.forEach(function (para, i) {
            var n = norm(para);
            for (var j = 0; j < terms.length; j++) if (n.indexOf(terms[j]) < 0) return;
            total++;
            if (hits.length < 80) hits.push({ d: d, i: i, para: para, n: n });
          });
        });
        msg.textContent = total ? (total + ' paragraph' + (total === 1 ? '' : 's') + ' found' + (total > hits.length ? '; showing the first ' + hits.length : '') + '.') : 'No paragraphs found. Try fewer words.';
        hits.forEach(function (h) {
          var at = h.n.indexOf(terms[0]);
          var from = Math.max(0, at - 90), to = Math.min(h.para.length, at + terms[0].length + 140);
          var snip = (from ? '…' : '') + esc(h.para.slice(from, to)) + (to < h.para.length ? '…' : '');
          terms.forEach(function (t) {
            if (t.length < 3) return;
            var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
            snip = snip.replace(re, '<mark>$1</mark>');
          });
          var li = document.createElement('li');
          li.innerHTML = '<a href="' + h.d.u + '#p' + (h.i + 1) + '">' + esc(h.d.l) + ', ¶' + (h.i + 1) + '</a> <span class="pp-small">' + esc(h.d.t) + '</span><br>' + snip;
          out.appendChild(li);
        });
      }).catch(function () { msg.textContent = 'Search could not load. Check your connection and try again.'; });
    });
  });

  /* ---- table filter (guide page) ---- */
  var tf = document.getElementById('pp-tfilter');
  if (tf) {
    var rows = Array.prototype.slice.call(document.querySelectorAll('#pp-all tbody tr[data-a]'));
    var grs = Array.prototype.slice.call(document.querySelectorAll('#pp-all tbody tr.grp'));
    var sel = document.getElementById('pp-tauthor');
    var cnt = document.getElementById('pp-tcount');
    var run = function () {
      var q = norm(tf.value.trim()), a = sel.value, shown = 0;
      rows.forEach(function (r) {
        var ok = (!q || norm(r.textContent).indexOf(q) > -1) && (!a || (' ' + r.getAttribute('data-a') + ' ').indexOf(' ' + a + ' ') > -1);
        r.hidden = !ok; if (ok) shown++;
      });
      grs.forEach(function (g) {
        var n = g.nextElementSibling, any = false;
        while (n && !n.classList.contains('grp')) { if (!n.hidden) any = true; n = n.nextElementSibling; }
        g.hidden = !any;
      });
      cnt.textContent = shown + ' of ' + rows.length + ' papers';
    };
    tf.addEventListener('input', run); sel.addEventListener('change', run); run();
  }
})();
