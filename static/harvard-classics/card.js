/* Today's Harvard Classics reading card (layouts/partials/hc-today.html): the HTML holds the build date's reading;
   this swaps in the reading for the visitor's own local date from /harvard-classics/<month>-<day>/index.json. */
(function () {
  'use strict';
  var box = document.getElementById('hc-card'); if (!box || !window.fetch) return;
  var M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var d = new Date(), id = ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  if (id === '02-29') id = box.getAttribute('data-leap') || '02-28';
  var dateEl = box.querySelector('.hc-card-date');
  function today() { if (dateEl) dateEl.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); }
  if (id === box.getAttribute('data-id')) { today(); return; }
  var slug = M[+id.slice(0, 2) - 1].toLowerCase() + '-' + (+id.slice(3));
  fetch(box.getAttribute('data-base') + slug + '/index.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (o) {
    function el(tag, text) { var e = document.createElement(tag); e.textContent = text; return e; }
    box.setAttribute('data-id', o.id);
    box.querySelectorAll('.hc-card-spine, .hc-card-title a, .hc-card-go').forEach(function (a) { a.href = o.url; });
    box.querySelector('.hc-card-title a').textContent = o.title;
    var r = o.readings || [], by = box.querySelector('.hc-card-by'); by.textContent = '';
    r.forEach(function (x, i) { if (i) by.appendChild(document.createTextNode(' and ')); if (x.author) by.appendChild(document.createTextNode(x.author + ', ')); by.appendChild(el('i', x.work || '')); });
    var sp = box.querySelector('.hc-card-spine b'); if (sp && r[0]) sp.textContent = r[0].volume;
    var intro = box.querySelector('.hc-card-intro'); intro.textContent = '';
    (o.intro || []).forEach(function (p) { var q = document.createElement('p'); var parts = String(p).split(/(<\/?i>)/); var cur = q; parts.forEach(function (s) { if (s === '<i>') { var it = document.createElement('i'); q.appendChild(it); cur = it; } else if (s === '</i>') { cur = q; } else if (s) { cur.appendChild(document.createTextNode(s)); } }); intro.appendChild(q); }); // the guide's italics only; everything else stays text
    today();
  }).catch(function () { /* keep the build date's reading; its own date is shown on the card */ });
})();
