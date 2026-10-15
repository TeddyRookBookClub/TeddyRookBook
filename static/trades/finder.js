/* The Trades: the troubleshooting finder. Data comes from data/trades/<course>.json (embedded in the page as JSON:
   course, urg labels, foot, symptoms, lessons, adult). Pick a symptom, answer one question, and get likely causes,
   safe checks, when to stop, and when to call a pro. */
(function (W, D) {
  'use strict';
  if (!W.TRTrades) return;
  var T = W.TRTrades;
  D.querySelectorAll('.tr-find').forEach(function (box) {
    var dataEl = box.querySelector('.tr-find-data'); if (!dataEl) return;
    var data; try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
    var base = box.dataset.base || '/', lessons = {}, adult = data.adult || {}, course = data.course || 'cars', ul = data.urg || {};
    var URG = { stop: ['u-stop', ul.stop || '⛔ Stop: get it checked first'], soon: ['u-soon', ul.soon || '⚠ Get it checked soon'], ok: ['u-ok', ul.ok || '✓ Usually not urgent'] };
    (data.lessons || []).forEach(function (l) { lessons[l.key] = l; });
    var head = T.h('p', { class: 'hs-small', text: 'Step 1: what’s happening?' });
    var syms = T.h('div', { class: 'tr-find-syms', role: 'group', 'aria-label': 'Symptoms' });
    var qbox = T.h('div', { class: 'tr-find-q' }); qbox.hidden = true;
    var res = T.h('div', { class: 'tr-find-res', 'aria-live': 'polite', tabindex: '-1' }); res.hidden = true;
    box.appendChild(head); box.appendChild(syms); box.appendChild(qbox); box.appendChild(res);
    var cur = null;
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    data.symptoms.forEach(function (s) {
      var b = T.h('button', { type: 'button', 'aria-pressed': 'false', 'data-k': s.key }, '<span aria-hidden="true">' + s.icon + '</span>' + esc(s.name));
      syms.appendChild(b);
      b.addEventListener('click', function () { pick(s, b); });
    });
    function pick(s, b) {
      cur = s;
      syms.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      qbox.hidden = false; res.hidden = true;
      qbox.innerHTML = '<p>Step 2: ' + esc(s.q) + '</p>';
      var g = T.h('div', { class: 'tr-seg', role: 'group', 'aria-label': s.q });
      s.opts.forEach(function (o) {
        var ob = T.h('button', { type: 'button', 'aria-pressed': 'false', text: o.label });
        ob.addEventListener('click', function () {
          g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === ob ? 'true' : 'false'); });
          answer(o);
        });
        g.appendChild(ob);
      });
      qbox.appendChild(g);
      if (s.opts.length === 1) g.querySelector('button').click();
    }
    function answer(o) {
      var u = URG[o.urg] || URG.soon;
      var links = o.links.map(function (k) { var l = lessons[k]; return l ? '<a href="' + base + 'trades/' + course + '/' + k + '/">Lesson ' + l.n + ': ' + esc(l.title) + '</a>' : ''; })
        .concat(o.adult.map(function (k) { return adult[k] ? '<a href="' + base + 'being-an-adult/' + k + '/">' + esc(adult[k]) + '</a>' : ''; }))
        .filter(Boolean).join(' · ');
      res.innerHTML =
        '<span class="tr-urg ' + u[0] + '">' + u[1] + '</span>' +
        '<h3>' + esc(cur.name) + ': ' + esc(o.label.charAt(0).toLowerCase() + o.label.slice(1)) + '</h3>' +
        '<div class="tr-find-cols"><div><h4 style="margin:.5rem 0 .2rem">' + esc(data.causes_h || 'Likely causes, most common first') + '</h4><ol>' + o.causes.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ol></div>' +
        '<div><h4 style="margin:.5rem 0 .2rem">What you can safely check</h4><ul>' + o.checks.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul></div></div>' +
        '<p><b>When to stop:</b> ' + esc(o.stop) + '</p>' +
        '<p><b>When to call a pro:</b> ' + esc(o.pro) + '</p>' +
        (links ? '<p class="tr-find-foot">Learn more: ' + links + '</p>' : '') +
        (data.foot ? '<p class="tr-find-foot">' + esc(data.foot) + '</p>' : '') +
        '<p><button type="button" class="hs-btn ghost tr-find-again">↺ Start over</button></p>';
      res.hidden = false;
      res.querySelector('.tr-find-again').addEventListener('click', function () {
        res.hidden = true; qbox.hidden = true;
        syms.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        var first = syms.querySelector('button'); if (first) first.focus();
      });
      if (res.getBoundingClientRect().top > W.innerHeight - 80) res.scrollIntoView({ behavior: T.reduced ? 'auto' : 'smooth', block: 'nearest' });
    }
  });
})(window, document);
