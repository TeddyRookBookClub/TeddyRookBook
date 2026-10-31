/* Meal Prep "Use it up" pages (/meal-prep/ingredients/): the ingredient search and the "What can I make with…?" picker
   on the index, and the quick filters on each ingredient page. Data comes from the page (#mi-data), built by Hugo. */
(function (W, D) {
  'use strict';
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function passes(tags, min, f) {
    return Object.keys(f).every(function (k) { return !f[k] || (k === 'quick' ? tags.indexOf('quick') >= 0 || +min <= 30 : tags.indexOf(k) >= 0); });
  }

  // ---------- picker: recipes that use the most of up to three ingredients ----------
  // returns [{r: recipe index, hits: [ingredient ids], score}] best first: most ingredients matched, then the larger share
  function pick(data, ids) {
    var by = {};
    ids.forEach(function (id) {
      (data.uses[id] || []).forEach(function (u) {
        var o = by[u.r] || (by[u.r] = { r: u.r, hits: [], score: 0 });
        if (o.hits.indexOf(id) < 0) { o.hits.push(id); o.score += u.s; }
      });
    });
    return Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return b.hits.length - a.hits.length || b.score - a.score || data.recipes[a.r].n.localeCompare(data.recipes[b.r].n); });
  }
  W.trbIngPick = pick; // for the tests

  var root = D.getElementById('mp-ings');
  if (root) {
    var data = null;
    try { data = JSON.parse($('#mi-data').textContent); } catch (e) { data = null; }
    var name = {};
    if (data) data.ings.forEach(function (x) { name[x.id] = x.n; });
    var sels = $$('[data-pick]', root), pf = {}, out = $('#mi-pout'), cnt = $('#mi-pcount'), clr = $('#mi-clear');
    function chosen() { var a = []; sels.forEach(function (s) { if (s.value && a.indexOf(s.value) < 0) a.push(s.value); }); return a; }
    function draw() {
      if (!data) return;
      var ids = chosen(), h = '', shown = 0;
      clr.hidden = !ids.length;
      if (!ids.length) { out.innerHTML = ''; cnt.textContent = 'Choose an ingredient to start.'; return; }
      var res = pick(data, ids);
      res.forEach(function (o) {
        var r = data.recipes[o.r], tags = r.t ? r.t.split(' ') : [];
        if (!passes(tags, tags.indexOf('quick') >= 0 ? 0 : 99, pf)) return;
        if (shown >= 24) return;
        shown++;
        var miss = ids.filter(function (i) { return o.hits.indexOf(i) < 0; });
        h += '<li class="mi-rec"><a class="mp-rcard" href="' + esc(r.u) + '"><span class="mp-emo" aria-hidden="true">' + esc(r.e) + '</span><span><b>' + esc(r.n) + '</b>' +
          '<small>Uses ' + (ids.length > 1 ? (o.hits.length === ids.length ? 'all ' + ids.length + ': ' : o.hits.length + ' of ' + ids.length + ': ') : '') + esc(o.hits.map(function (i) { return name[i].toLowerCase(); }).join(', ')) + (miss.length && ids.length > 1 ? '; no ' + esc(miss.map(function (i) { return name[i].toLowerCase(); }).join(', ')) : '') + '</small>' +
          '<small class="mi-tags">' + (tags.indexOf('quick') >= 0 ? '<span>⚡ quick</span>' : '') + (tags.indexOf('kid-friendly') >= 0 ? '<span>🧒 kid-friendly</span>' : '') + (tags.indexOf('vegetarian') >= 0 ? '<span>🥕 vegetarian</span>' : '') + '</small></span></a></li>';
      });
      out.innerHTML = h;
      var all = res.filter(function (o) { return o.hits.length === ids.length; }).length;
      cnt.textContent = !res.length ? 'No recipes use ' + (ids.length > 1 ? 'these' : 'this') + ' yet.' : !shown ? 'None match those filters. Clear a filter to see them.' :
        (ids.length > 1 ? all + (all === 1 ? ' recipe uses' : ' recipes use') + ' all of them. ' : '') + 'Showing ' + shown + ' of ' + res.length + (res.length === 1 ? ' recipe.' : ' recipes, the best matches first.');
    }
    sels.forEach(function (s) { s.addEventListener('change', draw); });
    clr.addEventListener('click', function () { sels.forEach(function (s) { s.value = ''; }); draw(); sels[0].focus(); });
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-pf]'); if (!b) return; pf[b.dataset.pf] = !pf[b.dataset.pf]; b.setAttribute('aria-pressed', !!pf[b.dataset.pf]); draw(); });
    // ?have=chicken,rice fills the picker
    var m = /[?&]have=([^&#]+)/.exec(W.location.search);
    if (m) decodeURIComponent(m[1]).split(',').slice(0, 3).forEach(function (id, i) { if (name[id]) sels[i].value = id; });
    draw();

    // ---------- ingredient search ----------
    var q = $('#mi-q'), qn = $('#mi-qcount');
    q.addEventListener('input', function () {
      var t = q.value.trim().toLowerCase(), n = 0;
      $$('.mi-card', root).forEach(function (c) {
        var ok = !t || t.split(/\s+/).every(function (w) { return c.dataset.q.indexOf(w) >= 0; });
        c.hidden = !ok; if (ok) n++;
      });
      $$('.mi-grp', root).forEach(function (g) { g.hidden = !$$('.mi-card:not([hidden])', g).length; });
      $('#mi-qnone').hidden = n > 0;
      qn.textContent = t ? n + (n === 1 ? ' ingredient' : ' ingredients') : '';
    });
  }

  // ---------- an ingredient page: quick filters ----------
  var pg = D.getElementById('mp-ing');
  if (pg) {
    var f = {}, total = $$('.mi-list:not(.mi-more) .mi-rec', pg).length, cn = $('#mi-count'), orig = cn.textContent;
    pg.addEventListener('click', function (e) {
      var b = e.target.closest('[data-f]'); if (!b) return;
      f[b.dataset.f] = !f[b.dataset.f]; b.setAttribute('aria-pressed', !!f[b.dataset.f]);
      var shown = 0, on = Object.keys(f).some(function (k) { return f[k]; });
      $$('.mi-rec', pg).forEach(function (li) { var ok = passes(li.dataset.tags.split(' '), li.dataset.min, f); li.hidden = !ok; if (ok && !li.parentNode.classList.contains('mi-more')) shown++; });
      $$('.mi-more', pg).forEach(function (l) { var h = !$$('.mi-rec:not([hidden])', l).length; l.hidden = h; var p = l.previousElementSibling; if (p) p.hidden = h; });
      var any = $$('.mi-rec:not([hidden])', pg).length;
      $('#mi-none').hidden = any > 0;
      cn.textContent = on ? shown + ' of ' + total + ' match.' : orig;
    });
  }
})(window, document);
