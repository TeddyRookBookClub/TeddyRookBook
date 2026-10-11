/* Homeschool pages: show the book scans, keep track of finished lessons, and the step-by-step "Teach this lesson" mode. */
(function (W, D) {
  'use strict';
  var KEY = 'trb-homeschool-v1';
  var st = { done: {} };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv && sv.done) st = sv; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function doneSet(course) { return st.done[course] || (st.done[course] = {}); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function body(text) { // the same markup as the hs-body partial
    return String(text).split('\n').map(function (l) {
      if (l.indexOf('Say: ') === 0) return '<p class="hs-say"><span>Say</span>' + esc(l.slice(5)) + '</p>';
      if (l.indexOf('~ ') === 0) return '<p class="hs-prob">' + esc(l.slice(2)) + '</p>';
      return '<p>' + esc(l) + '</p>';
    }).join('');
  }
  function frame(src) { return '<iframe src="' + esc(src) + '" title="The book, at the Internet Archive" loading="lazy" allowfullscreen></iframe>'; }

  // ---- "Read it here" / "Show the page in the book" buttons ----
  D.querySelectorAll('[data-scan]').forEach(function (b) {
    b.addEventListener('click', function () {
      var box = b.closest('.hs-book, .hs-lhead').querySelector('.hs-scan');
      var open = box.hidden;
      if (open && !box.firstChild) box.innerHTML = frame(b.dataset.scan) + (b.dataset.page ? '<p class="hs-small">If the book opens at the cover, <a href="' + esc(b.dataset.page) + '" target="_blank" rel="noopener">open this page at the Internet Archive ↗</a>.</p>' : '');
      box.hidden = !open; b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.textContent = b.textContent.replace(open ? /^📖 (Read it here|Show the page in the book)/ : /^📖 Hide the (book|page)/, open ? (b.dataset.page ? '📖 Hide the page' : '📖 Hide the book') : (b.dataset.page ? '📖 Show the page in the book' : '📖 Read it here'));
    });
  });

  var root = D.querySelector('.hs[data-course]'); if (!root) return;
  var course = root.dataset.course, total = +root.dataset.total, done = doneSet(course);
  function count() { var c = 0; for (var k in done) if (done[k]) c++; return c; }

  // ---- course page: ticks, progress bar, next lesson ----
  var list = D.querySelectorAll('.hs-lessons li');
  if (list.length) {
    list.forEach(function (li) { if (done[li.dataset.n]) li.classList.add('done'); });
    var c = count(); D.getElementById('hs-done-n').textContent = c;
    root.querySelector('.hs-bar b').style.width = Math.round(100 * c / total) + '%';
    var hi = 0; for (var k in done) if (done[k] && +k > hi) hi = +k; // carry on after the furthest lesson done
    var next = 0; for (var i = hi + 1; i <= total; i++) if (!done[i]) { next = i; break; }
    if (!next) for (i = 1; i <= total; i++) if (!done[i]) { next = i; break; }
    var a = D.getElementById('hs-next-link');
    if (next && c) { a.href = a.href.replace(/lesson-\d+\/$/, 'lesson-' + next + '/'); a.textContent = 'Next: Lesson ' + next + ' →'; }
    else if (!next) { a.textContent = 'All done! Start again →'; }
  }

  // ---- lesson page ----
  var n = +root.dataset.n; if (!n) return;
  var box = D.getElementById('hs-done');
  box.checked = !!done[n];
  box.addEventListener('change', function () { done[n] = box.checked ? 1 : 0; if (!box.checked) delete done[n]; save(); });

  var data = JSON.parse(D.getElementById('hs-data').textContent);
  var steps = [['Before you start', 'Get these ready:\n' + data.materials.map(function (m) { return '• ' + m; }).join('\n') + '\nPress “📖 Book page” at the top to see the page from the book, or open your printed copy.']].concat(data.steps);
  var ov = null, at = 0, showBook = false;
  function render() {
    var lastStep = at === steps.length; // the closing screen
    var dots = ''; for (var i = 0; i <= steps.length; i++) dots += '<i class="' + (i < at ? 'past' : i === at ? 'now' : '') + '"></i>';
    ov.querySelector('.hs-t-dots').innerHTML = dots;
    ov.querySelector('.hs-t-count').textContent = lastStep ? 'Finished' : at === 0 ? 'Get ready' : 'Step ' + at + ' of ' + (steps.length - 1);
    var main = ov.querySelector('.hs-t-main');
    if (lastStep) {
      main.innerHTML = '<h2>Well done!</h2><p>That\'s Lesson ' + data.n + '.</p>' + (data.practice ? '<p class="hs-t-after"><b>Afterwards:</b> ' + esc(data.practice) + '</p>' : '') +
        '<p><label class="hs-check big"><input type="checkbox" id="hs-t-done"' + (done[n] ? ' checked' : '') + '> Mark this lesson done</label></p>' +
        (data.next ? '<p><a class="hs-btn pri big" href="' + esc(data.next) + '">Next: Lesson ' + (n + 1) + ', ' + esc(data.nextTitle) + ' →</a></p>' : '<p>That was the last lesson in the book.</p>');
      var cb = D.getElementById('hs-t-done'); cb.addEventListener('change', function () { if (cb.checked) done[n] = 1; else delete done[n]; save(); box.checked = cb.checked; });
    } else {
      main.innerHTML = '<h2>' + esc(steps[at][0]) + '</h2>' + body(steps[at][1]);
    }
    ov.querySelector('.hs-t-back').disabled = at === 0;
    var nx = ov.querySelector('.hs-t-next'); nx.textContent = lastStep ? 'Close' : at === steps.length - 1 ? 'Finish ✓' : 'Next →';
    main.focus({ preventScroll: true }); main.scrollTop = 0;
  }
  function setBook(on) {
    showBook = on; ov.classList.toggle('book', on);
    var side = ov.querySelector('.hs-t-book');
    if (on && !side.firstChild) side.innerHTML = frame(data.scan) + '<p class="hs-small"><a href="' + esc(data.page) + '" target="_blank" rel="noopener">Open this page at the Internet Archive ↗</a></p>';
    ov.querySelector('.hs-t-bookbtn').textContent = on ? '📖 Hide the book' : '📖 Book page';
  }
  function close() { ov.hidden = true; D.body.classList.remove('hs-noscroll'); D.getElementById('hs-teach').focus(); }
  function open() {
    if (!ov) {
      ov = D.createElement('div'); ov.className = 'hs-teach'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Teach Lesson ' + n);
      ov.innerHTML = '<div class="hs-t-bar"><b>Lesson ' + n + ': ' + esc(data.title) + '</b><span class="hs-t-count"></span><button type="button" class="hs-btn hs-t-bookbtn">📖 Book page</button><button type="button" class="hs-btn ghost hs-t-x" aria-label="Close">✕</button></div>' +
        '<div class="hs-t-dots" aria-hidden="true"></div><div class="hs-t-body"><div class="hs-t-main" tabindex="-1" aria-live="polite"></div><div class="hs-t-book"></div></div>' +
        '<div class="hs-t-nav"><button type="button" class="hs-btn hs-t-back">← Back</button><button type="button" class="hs-btn pri big hs-t-next">Next →</button></div>';
      D.body.appendChild(ov);
      ov.querySelector('.hs-t-x').addEventListener('click', close);
      ov.querySelector('.hs-t-back').addEventListener('click', function () { if (at > 0) { at--; render(); } });
      ov.querySelector('.hs-t-next').addEventListener('click', function () { if (at === steps.length) return close(); at++; render(); });
      ov.querySelector('.hs-t-bookbtn').addEventListener('click', function () { setBook(!showBook); });
      D.addEventListener('keydown', function (e) {
        if (ov.hidden || /INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || '')) return;
        if (e.key === 'ArrowRight') { if (at < steps.length) { at++; render(); } }
        else if (e.key === 'ArrowLeft') { if (at > 0) { at--; render(); } }
        else if (e.key === 'Escape') close(); else return;
        e.preventDefault();
      });
    }
    at = 0; ov.hidden = false; D.body.classList.add('hs-noscroll'); render();
  }
  D.getElementById('hs-teach').addEventListener('click', open);
  if (/[?&]teach=1/.test(W.location.search)) open();
})(window, document);
