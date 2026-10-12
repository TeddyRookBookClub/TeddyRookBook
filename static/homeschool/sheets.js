/* Printable practice sheets: copywork/tracing and dictation from any guided lesson's book passages, handwriting
   paper, and arithmetic drills with an answer key. Everything is drawn in the browser; nothing is sent anywhere. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('ps'), $ = function (id) { return D.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var KEY = 'trb-sheets-v1', st = { tab: 'copy', course: '', lesson: 0, pick: null, own: '', font: 'print', size: 'm', reps: 2, trace: true, lines: 12, row: 'm', op: 'add', lvl: 'f10', count: 20, seed: 0 };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv) for (var k in sv) st[k] = sv[k]; } catch (e) { }
  var q = new URLSearchParams(W.location.search);
  if (q.get('c')) { st.course = q.get('c'); st.lesson = +q.get('l') || 0; st.pick = null; st.tab = q.get('t') || 'copy'; }
  if (!st.seed) st.seed = 1 + Math.floor(Math.random() * 9999);
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  var DATA = null, COURSES = {};
  fetch(root.dataset.src).then(function (r) { return r.json(); }).then(function (d) { DATA = d; d.courses.forEach(function (c) { COURSES[c.key] = c; }); if (!COURSES[st.course]) { st.course = 'mcg-first'; st.lesson = 0; } opts(); draw(); }).catch(function () { $('ps-note').textContent = 'The book passages could not load; check your connection. Handwriting paper and arithmetic still work.'; opts(); draw(); });

  // ---------- options ----------
  var SIZES = { l: ['Large (ages 4–6)', 14], m: ['Medium (ages 7–9)', 10], s: ['Small (ages 10 and up)', 7.5] };
  function sel(id, val, list) { return '<select id="' + id + '">' + list.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; }
  function course() { return COURSES[st.course]; }
  function lessonObj() { var c = course(); if (!c) return null; var l = c.lessons.filter(function (x) { return x.n === st.lesson; })[0]; if (!l) { l = c.lessons[0]; st.lesson = l.n; } return l; }
  function passageHTML() {
    if (!DATA) return '<p class="hs-small">Loading the books…</p>';
    var groups = {}; DATA.courses.forEach(function (c) { (groups[c.group] = groups[c.group] || []).push(c); });
    var cs = '<select id="o-course">' + Object.keys(groups).map(function (g) { return '<optgroup label="' + esc(g) + '">' + groups[g].map(function (c) { return '<option value="' + c.key + '"' + (c.key === st.course ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</optgroup>'; }).join('') + '</select>';
    var l = lessonObj(), ls = course().lessons.map(function (x) { return [x.n, x.n + '. ' + x.t]; });
    var picks = l.q.map(function (t, i) { var on = (st.pick || defaultPicks(l.q)).indexOf(i) >= 0; return '<label class="ps-pick"><input type="checkbox" data-pick="' + i + '"' + (on ? ' checked' : '') + '> ' + esc(t) + '</label>'; }).join('');
    return '<div class="ps-row"><label>Book ' + cs + '</label><label>Lesson ' + sel('o-lesson', st.lesson, ls) + '</label></div>' +
      '<fieldset class="ps-picks"><legend>Passages from this lesson</legend>' + picks + '</fieldset>' +
      '<label class="ps-own">Or type your own text (one line per row)<textarea id="o-own" rows="2" placeholder="A Bible verse, a poem, a line from your read-aloud…">' + esc(st.own) + '</textarea></label>';
  }
  function opts() {
    root.querySelectorAll('[data-t]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.t === st.tab ? 'true' : 'false'); });
    var h = '';
    if (st.tab === 'copy' || st.tab === 'dict') h += passageHTML();
    if (st.tab === 'copy') h += '<div class="ps-row"><label>Letters ' + sel('o-font', st.font, [['print', 'Print (manuscript)'], ['cursive', 'Cursive']]) + '</label><label>Size ' + sel('o-size', st.size, Object.keys(SIZES).map(function (k) { return [k, SIZES[k][0]]; })) + '</label><label>Copies of each line ' + sel('o-reps', st.reps, [[1, '1'], [2, '2'], [3, '3'], [4, '4']]) + '</label><label class="ps-cb"><input type="checkbox" id="o-trace"' + (st.trace ? ' checked' : '') + '> First copy is gray, to trace</label></div>';
    if (st.tab === 'dict') h += '<div class="ps-row"><label>Size ' + sel('o-size', st.size, Object.keys(SIZES).map(function (k) { return [k, SIZES[k][0]]; })) + '</label></div><p class="hs-small">Prints two pages: the passage for you to read aloud slowly, a phrase at a time, and a lined page for your child. Afterwards, compare with the book together and let your child correct their own mistakes.</p>';
    if (st.tab === 'lines') h += '<div class="ps-row"><label>Size ' + sel('o-size', st.size, Object.keys(SIZES).map(function (k) { return [k, SIZES[k][0]]; })) + '</label><label>Letters to trace on each row (optional) <input type="text" id="o-own2" maxlength="40" value="' + esc(st.own2 || '') + '" placeholder="e.g. a c d g o"></label><label>Letters ' + sel('o-font', st.font, [['print', 'Print'], ['cursive', 'Cursive']]) + '</label></div>';
    if (st.tab === 'math') h += '<div class="ps-row"><label>Kind ' + sel('o-op', st.op, [['add', 'Adding'], ['sub', 'Subtracting'], ['mul', 'Multiplying'], ['div', 'Dividing'], ['mix', 'Mixed + − × ÷']]) + '</label><label>Level ' + sel('o-lvl', st.lvl, LEVELS.map(function (l) { return [l[0], l[1]]; })) + '</label><label>Problems ' + sel('o-count', st.count, [[12, '12'], [20, '20'], [30, '30'], [40, '40']]) + '</label><button type="button" class="hs-btn" id="o-new">🔀 New problems</button></div><p class="hs-small">Prints the problems and, on a second page, the answer key. Sheet number ' + st.seed + ' (the same number always gives the same problems).</p>';
    $('ps-opts').innerHTML = h;
  }
  root.querySelector('.pl-tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (!b) return; st.tab = b.dataset.t; save(); opts(); draw(); });
  $('ps-opts').addEventListener('change', function (e) {
    var t = e.target, id = t.id;
    if (id === 'o-course') { st.course = t.value; st.lesson = 0; st.pick = null; opts(); }
    else if (id === 'o-lesson') { st.lesson = +t.value; st.pick = null; opts(); }
    else if (t.dataset.pick != null) st.pick = [].slice.call(root.querySelectorAll('[data-pick]')).filter(function (x) { return x.checked; }).map(function (x) { return +x.dataset.pick; });
    else if (id === 'o-font') st.font = t.value; else if (id === 'o-size') st.size = t.value; else if (id === 'o-reps') st.reps = +t.value;
    else if (id === 'o-trace') st.trace = t.checked; else if (id === 'o-op') st.op = t.value; else if (id === 'o-lvl') st.lvl = t.value; else if (id === 'o-count') st.count = +t.value;
    save(); draw();
  });
  $('ps-opts').addEventListener('input', function (e) { if (e.target.id === 'o-own') { st.own = e.target.value; save(); draw(); } if (e.target.id === 'o-own2') { st.own2 = e.target.value; save(); draw(); } });
  $('ps-opts').addEventListener('click', function (e) { if (e.target.id === 'o-new') { st.seed = 1 + Math.floor(Math.random() * 9999); save(); opts(); draw(); } });
  $('ps-print').addEventListener('click', function () { W.print(); });

  // ---------- drawing ----------
  function rows(n, text, trace) { // handwriting rows; text (optional) shown as the model or for tracing
    var h = ''; for (var i = 0; i < n; i++) h += '<div class="ps-hw' + (text && i === 0 && trace ? ' trace' : '') + '"><span>' + (text && i === 0 && trace ? esc(text) : '') + '</span></div>';
    return h;
  }
  function chunk(t, n) { var out = [], cur = ''; t.split(/\s+/).forEach(function (w) { if (cur && (cur + ' ' + w).length > n) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; }); if (cur) out.push(cur); return out; }
  function sentencey(t) { return /[.!?”"]$/.test(t) && / /.test(t); }
  function defaultPicks(q) { var s = []; q.forEach(function (t, i) { if (sentencey(t) && s.length < 2) s.push(i); }); if (!s.length) s = [0]; return s; }
  function head(title) { return '<div class="ps-head"><span>Name ______________________</span><span>Date ____________</span></div><h2 class="ps-title">' + esc(title) + '</h2>'; }
  function chosen() {
    var out = [];
    if (DATA && course()) { var l = lessonObj(); var pk = st.pick || defaultPicks(l.q); l.q.forEach(function (t, i) { if (pk.indexOf(i) >= 0) out.push(t); }); }
    (st.own || '').split('\n').forEach(function (t) { t = t.trim(); if (t) out.push(t); });
    return out;
  }
  function src() { if (!DATA || !course()) return ''; var l = lessonObj(); return course().name + ', Lesson ' + l.n; }
  function draw() {
    var sz = SIZES[st.size] || SIZES.m, cls = 'ps-paper f-' + st.font, style = '--row:' + sz[1] + 'mm', h = '';
    if (st.tab === 'copy') {
      var ps = chosen(); h = '<div class="' + cls + '" style="' + style + '">' + head('Copywork') + (src() ? '<p class="ps-src">' + esc(src()) + '</p>' : '');
      if (!ps.length) h += '<p class="ps-empty">Tick a passage above, or type your own.</p>';
      var per = Math.max(8, Math.floor(166 / (sz[1] * (st.font === 'cursive' ? 0.5 : 0.53))));
      ps.forEach(function (t) { h += '<div class="ps-block"><p class="ps-model">' + esc(t) + '</p>' + chunk(t, per).map(function (c) { return rows(st.reps, c, st.trace); }).join('') + '</div>'; });
      h += '</div>';
    } else if (st.tab === 'dict') {
      var dps = chosen(), need = dps.reduce(function (n, t) { return n + Math.max(1, Math.ceil(t.length / (sz[1] > 12 ? 28 : sz[1] > 9 ? 42 : 55))); }, 0) + 2;
      h = '<div class="ps-paper f-print">' + head('Dictation: for the parent') + (src() ? '<p class="ps-src">' + esc(src()) + '</p>' : '') + '<ol class="ps-dict">' + dps.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol><p class="ps-help">Read each sentence once all the way through. Then read it a few words at a time while your child writes. Read it once more at the end so they can check. Afterwards, compare with the book together.</p></div>' +
        '<div class="' + cls + ' ps-break" style="' + style + '">' + head('Dictation') + rows(Math.min(need, 22)) + '</div>';
    } else if (st.tab === 'lines') {
      var letters = (st.own2 || '').trim(), n = Math.floor(230 / (sz[1] * 1.9));
      h = '<div class="' + cls + '" style="' + style + '">' + head('Handwriting') + (function () { var r = ''; for (var i = 0; i < n; i++) r += '<div class="ps-hw' + (letters ? ' trace' : '') + '"><span>' + esc(letters ? chunk((letters + '   ').repeat(8), Math.floor(166 / (sz[1] * 0.53)))[0] : '') + '</span></div>'; return r; })() + '</div>';
    } else if (st.tab === 'math') {
      var probs = mathProblems();
      h = '<div class="ps-paper f-print">' + head('Arithmetic · ' + LEVELS.filter(function (l) { return l[0] === st.lvl; })[0][1]) + '<p class="ps-src">Sheet ' + st.seed + '</p><ol class="ps-math">' + probs.map(function (p) { return '<li>' + p.html + '</li>'; }).join('') + '</ol></div>' +
        '<div class="ps-paper f-print ps-break"><h2 class="ps-title">Answer key · sheet ' + st.seed + '</h2><ol class="ps-key">' + probs.map(function (p) { return '<li>' + esc(p.ans) + '</li>'; }).join('') + '</ol></div>';
    }
    $('ps-preview').innerHTML = h;
  }

  // ---------- arithmetic ----------
  var LEVELS = [['f10', 'Facts to 10 (Ray\'s Primary)'], ['f20', 'Facts to 20 (Ray\'s Primary)'], ['t12', 'Tables to 12 (Ray\'s Intellectual)'], ['d2', 'Two-digit numbers'], ['d3', 'Three-digit numbers (Ray\'s Practical)'], ['d4', 'Larger numbers (Ray\'s Practical)']];
  function rng(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function (a, b) { s = s * 16807 % 2147483647; return a + Math.floor((s - 1) / 2147483646 * (b - a + 1)); }; }
  function fmt(n) { return n.toLocaleString('en-US'); }
  function mathProblems() {
    var r = rng(st.seed * 7919 + st.lvl.length * 31 + st.op.length), out = [], seen = {};
    var lim = { f10: [0, 10], f20: [0, 20], t12: [1, 12], d2: [10, 99], d3: [100, 999], d4: [1000, 9999] }[st.lvl];
    for (var tries = 0; out.length < st.count && tries < 2000; tries++) {
      var op = st.op === 'mix' ? ['add', 'sub', 'mul', 'div'][r(0, 3)] : st.op, a, b, ans, sym;
      if (op === 'add') { if (st.lvl === 'f10' || st.lvl === 'f20') { a = r(1, lim[1] - 1); b = r(1, lim[1] - a); } else { a = r(lim[0], lim[1]); b = r(lim[0], lim[1]); } ans = a + b; sym = '+'; }
      else if (op === 'sub') { if (st.lvl === 'f10' || st.lvl === 'f20') { a = r(2, lim[1]); b = r(1, a - 1); } else { a = r(lim[0], lim[1]); b = r(lim[0], a); } ans = a - b; sym = '−'; }
      else if (op === 'mul') { if (st.lvl === 'f10') { a = r(1, 5); b = r(1, 2); } else if (st.lvl === 'f20') { a = r(1, 10); b = r(1, 5); } else if (st.lvl === 't12') { a = r(1, 12); b = r(1, 12); } else if (st.lvl === 'd2') { a = r(10, 99); b = r(2, 9); } else if (st.lvl === 'd3') { a = r(100, 999); b = r(11, 99); } else { a = r(1000, 9999); b = r(101, 999); } ans = a * b; sym = '×'; }
      else { if (st.lvl === 'f10') { b = r(1, 2); ans = r(1, 5); } else if (st.lvl === 'f20') { b = r(1, 5); ans = r(1, 10); } else if (st.lvl === 't12') { b = r(1, 12); ans = r(1, 12); } else if (st.lvl === 'd2') { b = r(2, 9); ans = r(5, 30); } else if (st.lvl === 'd3') { b = r(12, 99); ans = r(10, 99); } else { b = r(12, 99); ans = r(100, 999); } a = b * ans; sym = '÷'; }
      var keyp = a + sym + b; if (seen[keyp] && tries < 1500) continue; seen[keyp] = 1;
      var vertical = st.lvl === 'd2' || st.lvl === 'd3' || st.lvl === 'd4';
      var html = vertical && sym !== '÷' ? '<span class="v"><span>' + fmt(a) + '</span><span>' + sym + ' ' + fmt(b) + '</span></span>' : '<span class="h">' + fmt(a) + ' ' + sym + ' ' + fmt(b) + ' = ______</span>';
      out.push({ html: html, ans: fmt(ans) });
    }
    return out;
  }
})(window, document);
