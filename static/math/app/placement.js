/* A ladder's placement (/<ladder>/placement/): pick a starting point (a course, or "not sure"), the adaptive check
   (ML.engine.placement with the problem card in 'place' mode; per ladder, and it may ask about a skill from another ladder
   that blocks this one's courses), then the result and a start button. Topics still being written are never asked. */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder, E = ML.engine, ui = ML.ui, cfg = ML.cfg, base = cfg.base, el = ui.el, esc = ui.esc;
  var pick = D.getElementById('mlp-pl-pick'), runS = D.getElementById('mlp-pl-run'), resS = D.getElementById('mlp-pl-res'), grid = D.getElementById('mlp-pl-courses');
  var loaded = {};
  var origLoad = ML.loadCourse; // remember which courses' generators have loaded (for canAsk)
  ML.loadCourse = function (k) { return origLoad(k).then(function (x) { loaded[k] = true; return x; }); };
  var LAD = ui.ladder();
  function readyN(c) { return c.r !== undefined ? c.r : c.n; }
  function hasFile(k) { var c = ui.course(k); return !!(cfg.gen && cfg.gen[k]) && (!c || readyN(c) > 0); }
  function canAsk(id) {
    var c = String(id).split('.')[0], T0 = E.graph().T[id]; if (!hasFile(c) || (T0 && T0.soon)) return false;
    return loaded[c] ? !!(ML.hasGen && ML.hasGen(id)) : true;
  }
  function same(k) { var c = ui.course(k); return !!c && (c.ladder || 'math') === LAD.key; }
  function show(s) { [pick, runS, resS].forEach(function (x) { x.hidden = x !== s; }); try { W.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { } }

  function choices() {
    grid.innerHTML = '';
    var unsure = el('button', 'mlp-pl-opt mlp-pl-unsure', '<span aria-hidden="true">🧭</span><span>Not sure<small>Start in the middle and let the questions find your level</small></span>');
    unsure.type = 'button'; unsure.addEventListener('click', function () { start('auto'); });
    grid.appendChild(unsure);
    ['Elementary', 'Middle school', 'High school', 'College'].forEach(function (band) {
      var cs = ui.courses().filter(function (c) { return c.band === band && readyN(c); }); if (!cs.length) return;
      var sec = el('div', 'mlp-pl-band'); sec.appendChild(el('h3', '', band));
      var g = el('div', 'mlp-pl-grid');
      cs.forEach(function (c) {
        var b = el('button', 'mlp-pl-opt', '<span aria-hidden="true">' + c.icon + '</span><span>' + esc(c.title) + '<small>' + (/Grade|Kindergarten/.test(c.title) ? '' : c.grade === 'College' ? 'College · ' : 'Grade ' + esc(c.grade) + ' · ') + c.n + ' topics</small></span>');
        b.type = 'button'; b.style.setProperty('--c', c.color); b.addEventListener('click', function () { start(c.key); });
        g.appendChild(b);
      });
      sec.appendChild(g); grid.appendChild(sec);
    });
    if (E.placed() && ui.course(E.course())) grid.insertAdjacentHTML('afterbegin', '<p class="mlp-pnote">Your last check placed you in <b>' + esc(ui.course(E.course()).title) + '</b>. Taking it again only adds what you know; it never erases progress.</p>');
    if (!ui.courses().some(function (c) { return readyN(c) > 0; })) {
      grid.innerHTML = '<div class="mlp-result"><p class="mlp-eyebrow">Find your rung</p><h2>The check for the ' + esc(LAD.title) + ' is coming soon</h2><p>It asks questions from the ladder’s own practice problems, and those are being written now. Meanwhile, the skill maps show every topic and what it builds on.</p><div class="mlp-acts"><a class="mlp-btn pri" href="' + base + 'map/">Explore the skill maps</a><a class="mlp-btn" href="' + base + '">See the ladder</a></div></div>';
      var h = D.getElementById('mlp-pl-h1'); if (h) h.hidden = true; var sub = pick.querySelector('.mlp-sub'); if (sub) sub.hidden = true;
    }
  }

  function start(key) {
    var keys = key === 'auto' ? [] : [key].concat((ui.course(key).after || []).filter(same));
    if (key === 'auto' ? !ui.courses().some(function (c) { return hasFile(c.key); }) : !keys.some(hasFile)) return noCheck(key);
    show(runS);
    runS.innerHTML = '<div class="mlp-pl-runhead"><h2>' + (key === 'auto' ? 'Finding your level' : 'Checking ' + esc(ui.course(key).title) + (keys.length > 1 ? ' and ' + keys.slice(1).map(function (k) { return esc(ui.course(k).title); }).join(' and ') : '')) + '</h2><button type="button" class="mlp-btn ghost small" id="mlp-pl-stop">Stop and see my result</button></div><div class="mlp-bigbar" aria-hidden="true"><b style="width:0"></b></div><div id="mlp-pl-card"><p class="mlp-loading">Getting the first question ready…</p></div><p class="mlp-small">Answer what you can. Choosing “I haven’t learned this” is fine and keeps the check short.</p>';
    var bar = runS.querySelector('.mlp-bigbar b'), host = D.getElementById('mlp-pl-card');
    Promise.all(keys.filter(hasFile).map(function (k) { return ML.loadCourse(k).then(function () { loaded[k] = true; }); })).then(function () {
      var S = E.placement({ start: key, canAsk: canAsk, max: 30, ladder: LAD.key });
      var r = ML.runner(host, { mode: 'place', session: S, onAnswer: function () { bar.style.width = Math.round(100 * S.progress().frac) + '%'; }, onDone: function () { finish(S, key); } });
      D.getElementById('mlp-pl-stop').addEventListener('click', function () { r.destroy(); finish(S, key); });
    });
  }
  function noCheck(key) {
    var c = ui.course(key);
    show(resS);
    if (!c) resS.innerHTML = '<div class="mlp-result"><p class="mlp-eyebrow">Find your rung</p><h2>The placement check is coming soon</h2><p>Its questions are still being written. Meanwhile, pick the course that sounds right on the <a href="' + base + '">ladder</a>: earlier courses count as known, and each topic links to the skills underneath it.</p><div class="mlp-acts"><a class="mlp-btn pri" href="' + base + '">See the ladder</a><button type="button" class="mlp-btn" id="mlp-pl-back">Choose again</button></div></div>';
    else resS.innerHTML = '<div class="mlp-result" style="--mc:' + c.color + '"><p class="mlp-eyebrow">Find your rung</p><h2>The check for ' + esc(c.title) + ' is coming soon</h2><p>Its practice problems are still being written. You can start the course now: earlier courses count as known, and each topic links to the skills underneath it.</p><div class="mlp-acts"><a class="mlp-btn pri" href="' + base + 'practice/?course=' + key + '">Start ' + esc(c.title) + '</a><button type="button" class="mlp-btn" id="mlp-pl-back">Choose again</button></div></div>';
    D.getElementById('mlp-pl-back').addEventListener('click', function () { show(pick); });
  }
  function finish(S, key) {
    if (!S.progress().asked) return noCheck(key);
    var res = S.apply(), c = ui.course(res.course) || {}, G = E.graph(), kn = {};
    res.known.forEach(function (id) { kn[id] = 1; });
    show(resS);
    var total = res.known.length + res.unknown.length, units = '';
    res.window.forEach(function (k) {
      var cc = ui.course(k), us = (G.C[k] && G.C[k].units) || [];
      us.forEach(function (u) {
        var ids = (G.byCourse[k] || []).filter(function (id) { return G.T[id].unit === u.key; }); if (!ids.length) return;
        var n = ids.filter(function (id) { return kn[id]; }).length, pct = Math.round(100 * n / ids.length);
        units += '<li style="--c:' + (cc ? cc.color : '#888') + '"><span><b>' + esc(u.title) + '</b> <span class="mlp-small">' + esc(cc ? cc.short : k) + '</span></span><span class="mlp-rung-bar"><b style="width:' + pct + '%"></b></span><span class="mlp-small">' + (n === ids.length ? 'All ' + n + ' known' : n ? n + ' of ' + ids.length + ' known' : 'To learn') + '</span></li>';
      });
    });
    var nx = E.next(), first = nx.type === 'learn' && G.T[nx.id] ? G.T[nx.id] : null;
    var other = (res.other || []).filter(function (id) { return kn[id]; }), byL = {};
    other.forEach(function (id) { var l = ui.ladderOf(String(id).split('.')[0]); (byL[l.key] = byL[l.key] || { l: l, n: 0 }).n++; });
    var otherTxt = Object.keys(byL).map(function (k) { return byL[k].n + ' skill' + (byL[k].n === 1 ? '' : 's') + ' from the ' + esc(byL[k].l.title); }).join(' and ');
    resS.innerHTML = '<div class="mlp-result" style="--mc:' + (c.color || '#b8963e') + '"><p class="mlp-eyebrow">Your result · ' + res.asked + ' question' + (res.asked === 1 ? '' : 's') + '</p>' +
      '<h2>You start at ' + esc(c.title || res.course) + '</h2>' +
      '<p>' + (res.known.length ? 'You already know <b>' + res.known.length + '</b> of the ' + total + ' topics we looked at. They’re marked passed, and each comes back for a quick confirming review in a few days.' : 'We’ll start from the beginning of this course. Every topic has a short lesson with worked examples.') + (otherTxt ? ' That includes ' + otherTxt + ' that this ladder builds on.' : '') + (first ? ' Your first topic: <a href="' + first.url + '"><b>' + esc(first.title) + '</b></a>.' : '') + '</p>' +
      (units ? '<ul class="mlp-result-units">' + units + '</ul>' : '') +
      '<div class="mlp-acts"><a class="mlp-btn pri big" href="' + base + 'practice/">Start learning →</a>' + (c.url ? '<a class="mlp-btn" href="' + c.url + '">See ' + esc(c.title) + '</a>' : '') + '<button type="button" class="mlp-btn ghost" id="mlp-pl-redo">Redo the check</button></div></div>';
    D.getElementById('mlp-pl-redo').addEventListener('click', function () { choices(); show(pick); });
    var go = resS.querySelector('.mlp-btn.pri'); if (go) go.focus({ preventScroll: true });
  }

  ui.graph().then(function () { choices(); }, function () { grid.innerHTML = '<p class="mlp-soon">The list of topics didn’t load. Check your connection and reload the page.</p>'; });
})(window, document);
