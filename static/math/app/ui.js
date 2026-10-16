/* Math Ladder pages: shared helpers (window.MathLadder.ui). Loaded after core/engine.js on every Math Ladder page.
   ML.cfg                       the build-time config from <script id="ml-cfg"> (base, graph url, available gen/viz files, courses)
   ui.course(key)               a course from the config            ui.courses()  all, in ladder order (bottom first)
   ui.data(id)                  JSON from <script type="application/json" id=…>
   ui.el(tag, cls, html)  ui.esc(s)  ui.btn(text, cls, fn)
   ui.LABEL[status]             words for each status from ML.engine.status()
   ui.paintChips(root, ctx)     colors every a.mlp-chip[data-id] by its status (class st-<status>, screen-reader text); ctx: the page's course
   ui.ring(xp, goal, size)      an SVG goal ring (HTML string)
   ui.dayName(day)              "Thu, Oct 15"     ui.inDays(n)  "today", "tomorrow", "in 3 days"
   ui.taskLine(task)            a short sentence for ML.engine.next()
   ui.savePanel(el, o)          save code: show, copy, download a .txt; paste one in (asks before replacing)
   ui.graph()                   Promise: the full graph (ML.engine.loadGraph), cached                                       */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, E = ML.engine;
  if (!ML.cfg) { try { ML.cfg = JSON.parse(D.getElementById('ml-cfg').textContent); } catch (e) { ML.cfg = { base: '/math/', courses: [], gen: {}, viz: {}, vb: {} }; } }
  var C = {}; (ML.cfg.courses || []).forEach(function (c) { C[c.key] = c; });
  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function btn(text, cls, fn) { var b = el('button', 'mlp-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; }
  function data(id) { try { return JSON.parse(D.getElementById(id).textContent); } catch (e) { return null; } }
  var LABEL = { passed: 'Passed', due: 'Review due', learning: 'Learning', paused: 'Paused for today', ready: 'Ready to learn', locked: 'Needs an earlier topic', 'new': 'Not started' };
  function paintChips(root, ctx) {
    (root || D).querySelectorAll('a.mlp-chip[data-id]').forEach(function (a) {
      var st = E.status(a.dataset.id, ctx);
      a.className = a.className.replace(/\bst-\S+/g, '').trim() + ' st-' + st;
      var s = a.querySelector('[data-st]'); if (s) s.textContent = ' (' + LABEL[st] + ')';
    });
  }
  function ring(xp, goal, size) {
    size = size || 64; var r = size / 2 - 5, c = 2 * Math.PI * r, f = Math.min(1, goal ? xp / goal : 0);
    return '<svg class="mlp-ring" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + xp + ' of ' + goal + ' XP today"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" class="mlp-ring-bg"/>' + (f > 0 ? '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" class="mlp-ring-fg' + (f >= 1 ? ' full' : '') + '" stroke-dasharray="' + (c * f).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/>' : '') + '<text x="50%" y="50%" dy=".35em" text-anchor="middle" style="font-size:' + Math.max(12, Math.round(size * 0.27)) + 'px">' + (f >= 1 ? '✓' : xp) + '</text></svg>';
  }
  var DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function dayName(day) { var d = E.dateOf(day); return DN[d.getDay()] + ', ' + MN[d.getMonth()] + ' ' + d.getDate(); }
  function inDays(n) { return n <= 0 ? 'today' : n === 1 ? 'tomorrow' : 'in ' + n + ' days'; }
  function topicTitle(id) { var t = E.graph().T[id]; return t ? t.title : id; }
  function taskLine(t) {
    if (!t) return '';
    switch (t.type) {
      case 'review': var n = {}; t.items.forEach(function (x) { n[x.id] = 1; }); return 'A quick mixed review: ' + t.items.length + ' problems from ' + Object.keys(n).length + ' topic' + (Object.keys(n).length > 1 ? 's' : '') + '.';
      case 'checkpoint': return 'A checkpoint quiz: ' + t.items.length + ' problems from topics you passed recently.';
      case 'learn': return (t.reason === 'continue' ? 'Keep going with ' : t.reason === 'retry' ? 'Try again: ' : t.reason === 'prereq' ? 'First, a skill from an earlier course: ' : 'Learn something new: ') + '<b>' + esc(topicTitle(t.id)) + '</b>.';
      case 'done': return 'All caught up' + (C[t.course] ? ' in ' + esc(C[t.course].title) : '') + '.';
      default: return 'Find your rung, or pick a course to start.';
    }
  }
  var gp = null;
  function graph() { if (!gp) gp = E.loadGraph(ML.cfg.graph).catch(function (e) { gp = null; throw e; }); return gp; }

  function savePanel(host, o) {
    o = o || {};
    host.innerHTML = '';
    var row = el('div', 'mlp-save-row'), out = el('div', 'mlp-save-out'), msg = el('p', 'mlp-save-msg'); msg.setAttribute('aria-live', 'polite');
    var bShow = btn('Show my save code', 'pri', show), bLoad = btn('Load a save code', '', load);
    row.appendChild(bShow); row.appendChild(bLoad); host.appendChild(row); host.appendChild(out); host.appendChild(msg);
    function show() {
      msg.textContent = '';
      E.exportCode().then(function (code) {
        out.innerHTML = '';
        var ta = el('textarea', 'mlp-code'); ta.readOnly = true; ta.value = code; ta.rows = o.full ? 4 : 3; ta.setAttribute('aria-label', 'Your save code'); ta.spellcheck = false;
        var r2 = el('div', 'mlp-save-row');
        r2.appendChild(btn('Copy', 'pri small', function () {
          var done = function () { msg.textContent = 'Copied. Paste it somewhere safe, or into Math Ladder on another device.'; };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, function () { ta.select(); try { D.execCommand('copy'); done(); } catch (e) { msg.textContent = 'Select the code and copy it.'; } });
          else { ta.select(); try { D.execCommand('copy'); done(); } catch (e) { msg.textContent = 'Select the code and copy it.'; } }
        }));
        r2.appendChild(btn('Download as a file', 'small', function () {
          var d = new Date(), name = 'math-ladder-save-' + d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + '.txt';
          var blob = new Blob(['Math Ladder save code (teddyrookbook.com/math/)\nSaved ' + d.toDateString() + '\n\n' + code + '\n'], { type: 'text/plain' }), a = el('a');
          a.href = URL.createObjectURL(blob); a.download = name; D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
          msg.textContent = 'Saved as ' + name + '.';
        }));
        r2.appendChild(btn('Hide', 'ghost small', function () { out.innerHTML = ''; msg.textContent = ''; bShow.focus(); }));
        out.appendChild(ta); out.appendChild(r2); ta.focus(); ta.select();
      });
    }
    function load() {
      msg.textContent = ''; out.innerHTML = '';
      var ta = el('textarea', 'mlp-code'); ta.rows = 3; ta.placeholder = 'Paste a code that starts with ML1.'; ta.setAttribute('aria-label', 'Paste a save code'); ta.spellcheck = false;
      var r2 = el('div', 'mlp-save-row'), file = el('input'); file.type = 'file'; file.accept = '.txt,text/plain'; file.hidden = true;
      file.addEventListener('change', function () { var f = file.files[0]; if (!f) return; f.text().then(function (t) { var m = t.match(/ML1\.[A-Za-z0-9_\-\s]+/); ta.value = m ? m[0].trim() : t.trim(); go(); }); });
      r2.appendChild(btn('Load this code', 'pri small', go));
      r2.appendChild(btn('Open a .txt file', 'small', function () { file.click(); }));
      r2.appendChild(btn('Cancel', 'ghost small', function () { out.innerHTML = ''; msg.textContent = ''; bLoad.focus(); }));
      out.appendChild(ta); out.appendChild(r2); out.appendChild(file); ta.focus();
      function go() {
        E.readCode(ta.value).then(function (r) {
          if (!r.ok) { msg.textContent = r.msg; return; }
          var i = r.info, here = E.state(), np = 0; for (var k in here.t) if (here.t[k].s === 2) np++;
          out.innerHTML = '';
          var q = el('div', 'mlp-confirm');
          q.innerHTML = '<p><b>Replace the progress in this browser?</b></p><p>The code has <b>' + i.passed + '</b> passed topic' + (i.passed === 1 ? '' : 's') + ' and <b>' + i.xp + '</b> XP' + (C[i.cur] ? ', working on ' + esc(C[i.cur].title) : '') + '. This browser has ' + np + ' passed topic' + (np === 1 ? '' : 's') + ' and ' + E.totalXP() + ' XP, which will be replaced.</p>';
          var r3 = el('div', 'mlp-save-row');
          r3.appendChild(btn('Yes, replace it', 'pri small', function () { E.replace(r.state); out.innerHTML = ''; msg.textContent = 'Loaded. Welcome back!'; if (o.onLoad) o.onLoad(); }));
          r3.appendChild(btn('No, keep this browser’s progress', 'ghost small', function () { out.innerHTML = ''; msg.textContent = 'Nothing changed.'; }));
          q.appendChild(r3); out.appendChild(q); r3.querySelector('button').focus();
        });
      }
    }
  }

  ML.ui = { course: function (k) { return C[k]; }, courses: function () { return ML.cfg.courses || []; }, data: data, el: el, esc: esc, btn: btn, LABEL: LABEL, paintChips: paintChips, ring: ring, dayName: dayName, inDays: inDays, taskLine: taskLine, savePanel: savePanel, graph: graph, topicTitle: topicTitle };
})(window, document);
