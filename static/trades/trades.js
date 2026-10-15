/* The Trades: shared helpers (TRTrades), lesson quizzes, "lesson done" ticks and course progress.
   Progress is kept in this browser only (localStorage key trb-trades-v1). */
(function (W, D) {
  'use strict';
  var KEY = 'trb-trades-v1';
  var reduced = false;
  try { reduced = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }
  function load() { try { return JSON.parse(W.localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function save(o) { try { W.localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
  function svgEl(tag, attrs, parent) {
    var el = D.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }
  function h(tag, attrs, html) {
    var el = D.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === 'text') el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]); }
    if (html != null) el.innerHTML = html;
    return el;
  }
  function fmt(x, d) { return (+x).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  // run fn(dt) every frame while the element is on screen and the tab is visible
  function loop(el, fn) {
    var on = true, vis = true, last = 0, raf = 0;
    function frame(t) {
      raf = 0;
      if (!on || !vis || D.hidden) { last = 0; return; }
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
      fn(dt);
      raf = W.requestAnimationFrame(frame);
    }
    function kick() { if (!raf && on && vis && !D.hidden) { last = 0; raf = W.requestAnimationFrame(frame); } }
    if ('IntersectionObserver' in W) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(el);
    D.addEventListener('visibilitychange', kick);
    kick();
    return { start: function () { on = true; kick(); }, stop: function () { on = false; }, kick: kick };
  }
  W.TRTrades = { reduced: reduced, load: load, save: save, svg: svgEl, h: h, fmt: fmt, loop: loop };

  // ---------- quizzes ----------
  var quiz = D.querySelector('.tr-quiz');
  if (quiz) {
    var qs = quiz.querySelectorAll('.tr-q'), score = D.querySelector('.tr-score'), right = 0, answered = 0;
    qs.forEach(function (q) {
      var a = +q.dataset.a, btns = q.querySelectorAll('.tr-opts button'), det = q.querySelector('details');
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          if (q.dataset.done) return;
          q.dataset.done = '1'; answered++;
          var i = +b.dataset.i;
          if (i === a) right++;
          btns.forEach(function (x) {
            var xi = +x.dataset.i;
            if (xi === a) { x.classList.add('right'); x.insertAdjacentText('afterbegin', '✓ '); }
            else if (x === b) { x.classList.add('wrong'); x.insertAdjacentText('afterbegin', '✗ '); }
            x.setAttribute('aria-disabled', 'true');
          });
          if (det) det.open = true;
          if (score) score.textContent = answered === qs.length ? 'You got ' + right + ' of ' + qs.length + ' right.' + (right === qs.length ? ' Nicely done!' : ' Read the explanations, then look back at the lesson.') : '';
        });
      });
    });
  }

  // ---------- lesson done ----------
  var lesson = D.getElementById('tr-lesson');
  if (lesson) {
    var box = D.getElementById('tr-done-box'), k = (lesson.dataset.course || 'cars') + '/' + lesson.dataset.lesson, st = load();
    if (box) {
      box.checked = !!(st.done && st.done[k]);
      box.addEventListener('change', function () { var s = load(); s.done = s.done || {}; if (box.checked) s.done[k] = 1; else delete s.done[k]; save(s); });
    }
  }

  // ---------- course progress ----------
  var list = D.querySelector('.tr-lessons');
  if (list) {
    var done = load().done || {}, items = list.querySelectorAll('li[data-lesson]'), c = 0, pre = (list.dataset.course || 'cars') + '/';
    items.forEach(function (li) { if (done[pre + li.dataset.lesson]) { li.classList.add('done'); c++; } });
    var pr = D.querySelector('.tr-progress');
    if (pr && c) {
      pr.hidden = false;
      pr.querySelector('#tr-prog-t').textContent = c + ' of ' + items.length + ' lessons done';
      pr.querySelector('.hs-bar b').style.width = Math.round(100 * c / items.length) + '%';
    }
  }
})(window, document);
