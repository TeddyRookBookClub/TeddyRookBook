/* "Find what's for you" (/start/): chips in, a ranked list of starting points out. Answers are remembered on this device. */
(function (W, D) {
  var root = D.getElementById('st'), dataEl = D.getElementById('st-data');
  if (!root || !dataEl || !W.TRBStart) return;
  var DATA = JSON.parse(dataEl.textContent), KEY = 'trb-start-v1';
  var MULTI = { ages: 1, goals: 1, subjects: 1 };
  var st = blank();
  function blank() { return { who: '', ages: [], goals: [], subjects: [], time: 0 }; }
  try {
    var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null');
    if (sv && typeof sv === 'object') Object.keys(st).forEach(function (k) {
      if (MULTI[k]) { if (Array.isArray(sv[k])) st[k] = sv[k].map(String); }
      else if (sv[k] != null) st[k] = k === 'time' ? (+sv[k] || 0) : String(sv[k]);
    });
  } catch (e) { }
  function save() {
    try { if (answered()) W.localStorage.setItem(KEY, JSON.stringify(st)); else W.localStorage.removeItem(KEY); } catch (e) { }
  }
  function answered() { return !!(st.who || st.time || st.ages.length || st.goals.length || st.subjects.length); }
  function forAges(list) { // ["6 to 8", "12 to 14", "Adult"] -> "ages 6 to 8 and 12 to 14, and adults"
    var n = list.filter(function (a) { return /^\d/.test(a); }), ad = list.length > n.length;
    var t = n.length ? 'ages ' + (n.length < 2 ? n[0] : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1]) : '';
    return ad ? (t ? t + ', and adults' : 'adults') : t;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var qs = [].slice.call(root.querySelectorAll('.st-q'));
  function syncChips() {
    qs.forEach(function (q) {
      var k = q.dataset.q;
      [].forEach.call(q.querySelectorAll('.st-chip'), function (b) {
        var v = b.dataset.v, on = MULTI[k] ? st[k].indexOf(v) >= 0 : String(st[k]) === v;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    });
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest('.st-chip'); if (!b) return;
    var k = b.closest('.st-q').dataset.q, v = b.dataset.v;
    if (MULTI[k]) { var i = st[k].indexOf(v); if (i >= 0) st[k].splice(i, 1); else st[k].push(v); }
    else if (k === 'time') st.time = st.time === +v ? 0 : +v;
    else st[k] = st[k] === v ? '' : v;
    syncChips(); save(); render();
  });

  var cardsEl = D.getElementById('st-cards'), statusEl = D.getElementById('st-status'), resEl = D.getElementById('st-res');
  function render() {
    var cards = W.TRBStart.rank(DATA, st);
    statusEl.textContent = answered()
      ? (cards.length + ' places to start, best match first. Change any answer and the list updates.')
      : 'Some of the most popular first stops. Answer any question above and the list will fit you better.';
    cardsEl.innerHTML = cards.map(function (c) {
      var multi = c.starts.length > 1;
      var starts = c.starts.map(function (s) {
        return '<a class="st-start" href="' + esc(s.url) + '"><b>Start here' + (multi ? ' for ' + esc(forAges(s.ages)) : '') + ':</b> ' + esc(s.label) + ' <span aria-hidden="true">→</span></a>';
      }).join('');
      return '<li class="st-card">' +
        '<h3><span class="st-ic" aria-hidden="true">' + esc(c.icon) + '</span><a href="' + esc(c.url) + '">' + esc(c.name) + '</a></h3>' +
        '<p class="st-why">' + esc(c.why) + '</p>' +
        (c.fits ? '<p class="st-fits">' + esc(c.fits) + '</p>' : '') +
        '<div class="st-acts">' + starts +
        (c.plan ? '<a class="st-plan" href="' + esc(c.plan) + '">Make a plan with this</a>' : '') + '</div></li>';
    }).join('');
  }
  D.getElementById('st-show').addEventListener('click', function () {
    render(); resEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); resEl.focus({ preventScroll: true });
  });
  D.getElementById('st-reset').addEventListener('click', function () {
    st = blank(); syncChips(); save(); render();
    var first = root.querySelector('.st-chip'); if (first) first.focus();
  });
  var sb = D.getElementById('st-search');
  if (typeof W.trbSearch === 'function') sb.addEventListener('click', function () { W.trbSearch(); });
  else sb.outerHTML = 'Search the site';
  syncChips(); render();
})(window, document);
