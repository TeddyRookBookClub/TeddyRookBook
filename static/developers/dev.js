/* For developers & co-ops (/developers/): copy buttons, and the snippet builder (ladder → course → topic, theme, height).
   The topic lists load from the page's data-topics (/developers/topics.json: { course key: [{ i: id, t: title }, …] }) the
   first time they're needed. Previews add ?preview=1 (the embed then saves nothing). Stores nothing. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('dev'); if (!root) return;
  var site = root.getAttribute('data-site') || '/', lads = [];
  try { lads = JSON.parse(D.getElementById('dev-lads').textContent) || []; } catch (e) { }
  function $(id) { return D.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* copy buttons */
  root.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-copy]'); if (!b) return;
    var ta = $(b.getAttribute('data-copy')); if (!ta) return;
    var label = b.textContent, done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = label; }, 1600); };
    var fallback = function () { ta.focus(); ta.select(); try { D.execCommand('copy'); done(); } catch (e) { b.textContent = 'Select and copy'; } };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, fallback); else fallback();
  });

  /* the builder */
  var sL = $('b-ladder'), sC = $('b-course'), sT = $('b-topic'), sTh = $('b-theme'), sH = $('b-height'), out = $('b-out'), msg = $('b-msg');
  if (!sL || !lads.length) return;
  var topics = null, loading = null;
  function getTopics() {
    if (topics) return Promise.resolve(topics);
    if (!loading) loading = fetch(root.getAttribute('data-topics')).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) { topics = j; return j; });
    return loading;
  }
  function ladder() { return lads.filter(function (l) { return l.key === sL.value; })[0] || lads[0]; }
  function fillCourses() {
    sC.innerHTML = ladder().courses.map(function (c) { return '<option value="' + esc(c.key) + '">' + esc(c.title) + '</option>'; }).join('');
    fillTopics();
  }
  function fillTopics() {
    var k = sC.value;
    sT.innerHTML = '<option value="">Whole course: the ladder’s mixed practice</option>';
    sT.disabled = true; msg.textContent = 'Loading the topics…';
    getTopics().then(function (T) {
      if (sC.value !== k) return;
      sT.innerHTML += (T[k] || []).map(function (t) { return '<option value="' + esc(t.i) + '">' + esc(t.t) + '</option>'; }).join('');
      sT.disabled = false; msg.textContent = ''; make();
    }, function () { sT.disabled = false; msg.textContent = 'The topic list didn’t load; the whole-course code still works.'; });
    make();
  }
  function src(preview) {
    var q = sT.value ? 'topic=' + encodeURIComponent(sT.value) : 'course=' + encodeURIComponent(sC.value);
    if (sTh.value !== 'auto') q += '&theme=' + sTh.value;
    if (preview) q += '&preview=1';
    return site.replace(/\/?$/, '/') + 'embed/practice/?' + q;
  }
  function title() {
    var o = sT.value ? sT.options[sT.selectedIndex] : sC.options[sC.selectedIndex];
    return 'Practice: ' + (o ? o.textContent : '') + ' (Teddy Rook Book)';
  }
  function make() {
    out.value = '<iframe src="' + esc(src(false)) + '" title="' + esc(title()) + '" width="100%" height="' + sH.value + '" style="border:0;max-width:900px" loading="lazy" allow="clipboard-write"></iframe>';
    var box = $('b-prevbox'); if (!box.hidden) preview();
  }
  function preview() {
    var box = $('b-prevbox'), f = $('b-frame');
    box.hidden = false; f.height = sH.value;
    var u = src(true); if (f.getAttribute('src') !== u) f.setAttribute('src', u);
  }
  sL.addEventListener('change', fillCourses);
  sC.addEventListener('change', fillTopics);
  [sT, sTh, sH].forEach(function (s) { s.addEventListener('change', make); });
  $('b-prev').addEventListener('click', preview);
  fillCourses();
})(window, document);
