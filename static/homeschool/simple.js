/* "Simple step-by-step" setting for homeschool lessons.
   When it is on, a lesson page shows the guide as a checklist: one small action per line, with exactly what to say
   in its own box, the book's words in another, and the day laid out from getting ready to marking it done.
   The setting is shared by every lesson (localStorage "trb-hs-simple"); ticks are kept per lesson so you can pause. */
(function (W, D) {
  'use strict';
  var KEY = 'trb-hs-simple', TICKS = 'trb-hs-simple-ticks';
  function get(k, d) { try { var v = W.localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { W.localStorage.setItem(k, v); } catch (e) { } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var m = /[?&]simple=([01])/.exec(W.location.search); if (m) set(KEY, m[1]);
  var on = get(KEY, '0') === '1';

  // ---- the switch: any element with [data-simple-switch] becomes a toggle ----
  function paintSwitches() {
    D.querySelectorAll('[data-simple-switch]').forEach(function (b) {
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.querySelector('.hs-sw-state').textContent = on ? 'On' : 'Off';
    });
    D.documentElement.classList.toggle('hs-simple-on', on);
  }
  D.querySelectorAll('[data-simple-switch]').forEach(function (b) {
    b.addEventListener('click', function () { on = !on; set(KEY, on ? '1' : '0'); paintSwitches(); build(); });
  });
  paintSwitches();

  // ---- splitting a step into single actions ----
  var KEEP = /\b(Mr|Mrs|Ms|Dr|St|No|Nos|vol|p|pp|ch|Ch|Art|Arts|Prop|Props|Fig|e\.g|i\.e|etc|vs|B\.C|A\.D|a\.m|p\.m|U\.S|[A-Z])\.$/;
  function sentences(text) {
    var parts = text.split(/(?<=[.!?…])\s+(?=[“"'(A-Z0-9])/), out = [];
    parts.forEach(function (s) { if (out.length && KEEP.test(out[out.length - 1])) out[out.length - 1] += ' ' + s; else out.push(s); });
    // keep very short bits with the sentence before them
    return out.reduce(function (a, s) { if (a.length && s.length < 18 && !/^(Say|Ask)\b/.test(s)) a[a.length - 1] += ' ' + s; else a.push(s); return a; }, []);
  }
  function items(body) { // -> [{t:'do'|'say'|'book'|'if', s}]
    var out = [];
    String(body).split('\n').forEach(function (line) {
      line = line.trim(); if (!line) return;
      if (line.indexOf('Say: ') === 0) { out.push({ t: 'say', s: line.slice(5) }); return; }
      if (line.indexOf('~ ') === 0) {
        if (out.length && out[out.length - 1].t === 'book') out[out.length - 1].s += '\n' + line.slice(2); else out.push({ t: 'book', s: line.slice(2) });
        return;
      }
      sentences(line).forEach(function (s) { out.push({ t: /^(If|When|Don['’]t worry|It['’]s fine|It['’]s OK|Some children|Many children|Young children|Most children)\b/.test(s) ? 'if' : 'do', s: s }); });
    });
    return out;
  }

  // ---- lesson page ----
  var root = D.querySelector('.hs-lesson'), dataEl = D.getElementById('hs-data');
  var box = null, data = null, course = '', n = 0, ticks = {};
  if (root && dataEl) {
    data = JSON.parse(dataEl.textContent); course = root.dataset.course; n = +root.dataset.n;
    box = D.createElement('section'); box.className = 'hs-simple'; box.id = 'hs-simple'; box.hidden = true;
    var anchor = root.querySelector('.hs-grid'); anchor.parentNode.insertBefore(box, anchor);
    try { ticks = JSON.parse(get(TICKS, '{}')) || {}; } catch (e) { ticks = {}; }
    box.addEventListener('change', function (e) {
      var cb = e.target; if (!cb.dataset.k) return;
      var mine = ticks[course + ':' + n] || (ticks[course + ':' + n] = {});
      if (cb.checked) mine[cb.dataset.k] = 1; else delete mine[cb.dataset.k];
      set(TICKS, JSON.stringify(ticks)); cb.closest('li').classList.toggle('ticked', cb.checked); progress();
      if (cb.id === 'hs-s-done') { var real = D.getElementById('hs-done'); if (real && real.checked !== cb.checked) { real.checked = cb.checked; real.dispatchEvent(new Event('change')); } }
    });
    box.addEventListener('click', function (e) {
      var t = e.target.closest('[data-act]'); if (!t) return;
      if (t.dataset.act === 'book') { var b = root.querySelector('[data-scan]'); if (b) { b.click(); b.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }
      if (t.dataset.act === 'clear') { delete ticks[course + ':' + n]; set(TICKS, JSON.stringify(ticks)); build(); }
      if (t.dataset.act === 'timer') timer(t);
    });
  }
  var tmr = 0;
  function timer(btn) {
    clearInterval(tmr); var end = Date.now() + data.mins * 60000;
    function tick() { var s = Math.max(0, Math.round((end - Date.now()) / 1000)); btn.textContent = s ? '⏱ ' + Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2) + ' left (tap to restart)' : '⏱ Time’s up. Finish the step you’re on, then stop.'; if (!s) clearInterval(tmr); }
    tick(); tmr = setInterval(tick, 1000);
  }
  function progress() {
    var all = box.querySelectorAll('input[data-k]'), c = 0; all.forEach(function (x) { if (x.checked) c++; });
    var p = box.querySelector('.hs-s-prog'); if (p) p.textContent = c + ' of ' + all.length + ' ticked';
  }
  function build() {
    if (!box) return;
    root.classList.toggle('simple', on); box.hidden = !on;
    if (!on) { box.innerHTML = ''; return; }
    var mine = ticks[course + ':' + n] || {}, k = 0;
    function cb(html, cls) { var id = 'k' + (k++); return '<li class="' + (cls || '') + (mine[id] ? ' ticked' : '') + '"><label><input type="checkbox" data-k="' + id + '"' + (mine[id] ? ' checked' : '') + '><span>' + html + '</span></label></li>'; }
    function render(it) {
      if (it.t === 'say') return cb('<b class="hs-s-lbl">Read this out loud:</b><span class="hs-s-say">“' + esc(it.s.replace(/^[“"]|[”"]$/g, '')) + '”</span>', 'say');
      if (it.t === 'book') return '<li class="book"><b class="hs-s-lbl">From the book:</b>' + it.s.split('\n').map(function (l) { return '<span class="hs-s-quote">' + esc(l) + '</span>'; }).join('') + '</li>';
      if (it.t === 'if') return '<li class="if"><b class="hs-s-lbl">💡 Good to know:</b> ' + esc(it.s) + '</li>';
      return cb(esc(it.s));
    }
    var h = '<div class="hs-s-top"><h2>Today’s lesson, one step at a time</h2><p>Go down the list in order. Tick each box when it’s done. If you stop partway, your ticks are saved on this device.</p>' +
      '<div class="hs-s-tools"><span class="hs-s-prog"></span><button type="button" class="hs-btn" data-act="timer">⏱ Start a ' + data.mins + '-minute timer</button><button type="button" class="hs-btn ghost" data-act="clear">Clear ticks</button></div></div>';
    // 1. get ready
    h += '<div class="hs-s-part"><h3><span>1</span> Get ready <small>(about 5 minutes, before your child sits down)</small></h3><ol class="hs-s-list">' +
      cb('Read this whole list once yourself, so nothing surprises you.') +
      data.materials.map(function (x) { return cb('Get out: ' + esc(x)); }).join('') +
      cb('<a href="#" data-act="book">Open the book to today’s page</a>. ' + (data.book ? 'You’re looking for this: ' + esc(data.book) : '')) +
      cb('Sit side by side at a table, with the book where you can both see it. Put phones and screens away.') +
      '</ol></div>';
    // 2. the steps
    data.steps.forEach(function (st, i) {
      h += '<div class="hs-s-part"><h3><span>' + (i + 2) + '</span> ' + esc(st[0]) + ' <small>(step ' + (i + 1) + ' of ' + data.steps.length + ')</small></h3><ol class="hs-s-list">' + items(st[1]).map(render).join('') + '</ol></div>';
    });
    // 3. finish
    var last = data.steps.length + 2;
    h += '<div class="hs-s-part"><h3><span>' + last + '</span> Finish</h3><ol class="hs-s-list">' +
      cb('Tell your child one thing they did well today, for example: “You worked hard on that.”') +
      (data.goal ? cb('Check the goal: <i>' + esc(data.goal) + '</i> If not yet, that’s normal: do this lesson again tomorrow.') : '') +
      '<li class="' + (D.getElementById('hs-done') && D.getElementById('hs-done').checked ? 'ticked' : '') + '"><label><input type="checkbox" id="hs-s-done" data-k="done"' + (D.getElementById('hs-done') && D.getElementById('hs-done').checked ? ' checked' : '') + '><span><b>Mark this lesson done.</b> (This also ticks it on the course page and in the planner.)</span></label></li>' +
      cb('Put the book and things away in the same place, ready for next time.') +
      '</ol></div>';
    if (data.practice) h += '<div class="hs-s-part next"><h3><span>➜</span> On the next days</h3><ol class="hs-s-list">' + items(data.practice).map(render).join('') + '</ol></div>';
    h += '<div class="hs-s-part next"><h3><span>?</span> If it isn’t going well</h3><ul class="hs-s-help">' +
      '<li>Stop for today if your child is tired, upset or stuck for more than a few minutes. A short good lesson beats a long hard one.</li>' +
      '<li>It is fine to do the same lesson two, three or more days in a row. Move on when it feels easy, not before.</li>' +
      '<li>Don’t skip ahead to make up time. Going in order is what makes it work.</li>' +
      (data.tip ? '<li>' + esc(data.tip) + '</li>' : '') + '</ul></div>';
    if (data.next) h += '<p class="hs-s-tomorrow"><b>Next time:</b> <a href="' + esc(data.next) + '">Lesson ' + (n + 1) + ': ' + esc(data.nextTitle) + ' →</a></p>';
    box.innerHTML = h; progress();
  }
  // keep the simple "done" box in step with the page's own box
  var real = D.getElementById('hs-done');
  if (real) real.addEventListener('change', function () { var s = D.getElementById('hs-s-done'); if (s && s.checked !== real.checked) { s.checked = real.checked; s.closest('li').classList.toggle('ticked', real.checked); } });
  build();
  W.trbSimple = { on: function () { return on; }, items: items };
})(window, document);
