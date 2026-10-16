/* Progress (/<ladder>/progress/): totals and streak, XP by day for the last 30 days (canvas bars with a hover tooltip and a
   table for screen readers), course progress on EVERY ladder (this page's ladder first), reviews coming due this week on
   every ladder, the save code, and reset. All ladders share one progress (one localStorage key). */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder, E = ML.engine, ui = ML.ui, base = ML.cfg.base, el = ui.el, esc = ui.esc;
  var statsEl = D.getElementById('mlp-pstats'), chartEl = D.getElementById('mlp-chart'), goalEl = D.getElementById('mlp-goal');
  var coursesEl = D.getElementById('mlp-pcourses'), revEl = D.getElementById('mlp-previews'), graphOK = false, ME = ui.ladder().key;
  function lOf(id) { return ui.ladderOf(String(id).split('.')[0]); }
  function otherLadders() { var t = E.state().t, k; for (k in t) if (Object.prototype.hasOwnProperty.call(t, k) && lOf(k).key !== 'math') return true; return false; }

  function stats() {
    var t = E.state().t, passed = 0, learning = 0, k;
    for (k in t) if (Object.prototype.hasOwnProperty.call(t, k)) { if (t[k].s === 2) passed++; else if (t[k].s === 1) learning++; }
    var days = Object.keys(E.state().xp).length;
    statsEl.innerHTML = [[E.xpToday() + ' / ' + E.goal(), 'XP today'], [E.streak(), 'day streak'], [E.totalXP(), 'XP in all'], [passed, 'topics passed'], [graphOK ? E.dueCountAll() : '…', graphOK && E.dueCountAll() === 1 ? 'review due today' : 'reviews due today'], [days, 'days practiced']]
      .map(function (s) { return '<div class="mlp-stat"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>'; }).join('');
  }
  function goal() {
    goalEl.innerHTML = '';
    var row = el('div', 'mlp-goalbox'); row.appendChild(el('span', '', 'Daily goal:'));
    [20, 30, 40, 60, 80].forEach(function (g) { var b = ui.btn(String(g), 'small', function () { E.setGoal(g); }); b.setAttribute('aria-pressed', String(E.goal() === g)); b.setAttribute('aria-label', g + ' XP a day'); row.appendChild(b); });
    goalEl.appendChild(row);
  }

  /* ---- the XP chart ---- */
  var cv = el('canvas'), tip = el('div', 'mlp-chart-tip'), table = el('table', 'mlp-sr'), bars = [];
  tip.hidden = true; cv.setAttribute('role', 'img');
  chartEl.appendChild(cv); chartEl.appendChild(tip); chartEl.appendChild(table);
  function dark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function chart() {
    var data = E.xpByDay(30), goalV = E.goal(), w = Math.max(280, chartEl.clientWidth), h = w < 500 ? 200 : 240, dpr = Math.min(2, W.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    var x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
    var cs = getComputedStyle(chartEl), ink = cs.getPropertyValue('--ink').trim() || '#1d2320', muted = cs.getPropertyValue('--muted').trim() || '#5d6862', grid = cs.getPropertyValue('--line').trim() || '#dde5df';
    var barC = dark() ? '#4aa878' : '#2e8b57', goalC = dark() ? '#d8b860' : '#9a7516';
    var max = Math.max(goalV, 10, Math.max.apply(null, data.map(function (d) { return d.xp; })));
    var step = max <= 50 ? 10 : max <= 100 ? 20 : max <= 250 ? 50 : 100; max = Math.ceil(max * 1.08 / step) * step;
    var L = 34, R = 8, T = 12, B = 26, pw = w - L - R, ph = h - T - B, slot = pw / data.length, bw = Math.min(24, slot - 2);
    function Y(v) { return T + ph - ph * v / max; }
    x.font = '11px system-ui,sans-serif'; x.textBaseline = 'middle'; x.textAlign = 'right'; x.lineWidth = 1;
    for (var v = 0; v <= max; v += step) { var yy = Math.round(Y(v)) + 0.5; x.strokeStyle = grid; x.beginPath(); x.moveTo(L, yy); x.lineTo(w - R, yy); x.stroke(); x.fillStyle = muted; x.fillText(String(v), L - 6, yy); }
    bars = [];
    data.forEach(function (d, i) {
      var cx = L + slot * i + slot / 2, bx = cx - bw / 2, top = Y(d.xp), base0 = Y(0);
      bars.push({ x0: L + slot * i, x1: L + slot * (i + 1), cx: cx, top: top, d: d });
      if (!d.xp) return;
      var r = Math.min(4, bw / 2, base0 - top);
      x.fillStyle = barC; x.beginPath(); x.moveTo(bx, base0); x.lineTo(bx, top + r); x.quadraticCurveTo(bx, top, bx + r, top); x.lineTo(bx + bw - r, top); x.quadraticCurveTo(bx + bw, top, bx + bw, top + r); x.lineTo(bx + bw, base0); x.closePath(); x.fill();
    });
    // the daily goal: a reference line with a label
    var gy = Math.round(Y(goalV)) + 0.5; x.strokeStyle = goalC; x.lineWidth = 1.5; x.beginPath(); x.moveTo(L, gy); x.lineTo(w - R, gy); x.stroke();
    x.fillStyle = ink; x.textAlign = 'left'; x.textBaseline = 'bottom'; x.font = '600 11px system-ui,sans-serif'; x.fillText('Goal ' + goalV, L + 4, gy - 3);
    // x labels: every 5 days and today
    x.fillStyle = muted; x.textAlign = 'center'; x.textBaseline = 'top'; x.font = '11px system-ui,sans-serif';
    data.forEach(function (d, i) { if ((data.length - 1 - i) % 7 === 0) { var dt = E.dateOf(d.day); var last = i === data.length - 1; x.textAlign = last ? 'right' : 'center'; x.fillText(last ? 'Today' : (dt.getMonth() + 1) + '/' + dt.getDate(), last ? w - R : bars[i].cx, h - B + 7); } });
    var tot = data.reduce(function (s, d) { return s + d.xp; }, 0), best = data.reduce(function (m, d) { return d.xp > m.xp ? d : m; }, data[0]);
    cv.setAttribute('aria-label', 'XP by day for the last 30 days: ' + tot + ' XP in all' + (best.xp ? ', most on ' + ui.dayName(best.day) + ' with ' + best.xp : '') + '. The goal line is ' + goalV + ' XP. A table follows.');
    table.innerHTML = '<caption>XP by day, last 30 days</caption><thead><tr><th scope="col">Day</th><th scope="col">XP</th></tr></thead><tbody>' + data.map(function (d) { return '<tr><td>' + ui.dayName(d.day) + '</td><td>' + d.xp + '</td></tr>'; }).join('') + '</tbody>';
  }
  function hover(e) {
    var r = cv.getBoundingClientRect(), px = e.clientX - r.left, b = bars.filter(function (b) { return px >= b.x0 && px < b.x1; })[0];
    if (!b) { tip.hidden = true; return; }
    tip.hidden = false; tip.textContent = ui.dayName(b.d.day) + ': ' + b.d.xp + ' XP';
    tip.style.left = Math.max(60, Math.min(r.width - 60, b.cx)) + 'px'; tip.style.top = Math.max(18, b.top) + 'px';
  }
  cv.addEventListener('pointermove', hover); cv.addEventListener('pointerdown', hover);
  cv.addEventListener('pointerleave', function () { tip.hidden = true; });

  function courses() {
    if (!graphOK) { coursesEl.innerHTML = '<p class="mlp-loading">Loading…</p>'; return; }
    // every ladder with progress, this page's ladder first
    var lads = ui.ladders().filter(function (l) { return l.key === ME; }).concat(ui.ladders().filter(function (l) { return l.key !== ME; }));
    var groups = lads.map(function (l) {
      var cur = E.course(l.key), rows = ui.allCourses().filter(function (c) { return (c.ladder || 'math') === l.key && c.n; }).map(function (c) { return { c: c, p: E.courseProgress(c.key) }; });
      return { l: l, cur: cur, list: rows.filter(function (r) { return r.p.passed || r.p.learning || r.c.key === cur; }) };
    }).filter(function (g) { return g.list.length; });
    var heads = groups.length > 1 || ME !== 'math';
    coursesEl.innerHTML = groups.length ? groups.map(function (g) {
      return (heads ? '<p class="mlp-due-day mlp-lhead"><a href="' + g.l.url + '"><span aria-hidden="true">' + g.l.icon + '</span> ' + esc(g.l.title) + '</a></p>' : '') + g.list.map(function (r) {
        return '<a class="mlp-crow" href="' + r.c.url + '" style="--c:' + r.c.color + '"><span aria-hidden="true">' + r.c.icon + '</span><span>' + esc(r.c.title) + (r.c.key === g.cur ? ' <span class="mlp-tag">Current</span>' : '') + '</span><small>' + r.p.passed + ' / ' + r.p.total + '</small><span class="mlp-rung-bar" role="progressbar" aria-label="' + esc(r.c.title) + ' topics passed" aria-valuemin="0" aria-valuemax="' + r.p.total + '" aria-valuenow="' + r.p.passed + '"><b style="width:' + r.p.pct + '%"></b></span></a>';
      }).join('');
    }).join('') : '<p class="mlp-small">No courses started yet. <a href="' + base + 'placement/">Find your rung</a> or pick a course on the <a href="' + base + '">ladder</a>.</p>';
  }
  function reviews() {
    if (!graphOK) { revEl.innerHTML = '<p class="mlp-loading">Loading…</p>'; return; }
    var list = E.dueBy(6), today = E.today(), G = E.graph(), by = {};
    list.forEach(function (x) { var d = Math.max(today, x.due); (by[d] = by[d] || []).push(x.id); });
    var days = Object.keys(by).map(Number).sort(function (a, b) { return a - b; });
    if (!days.length) { revEl.innerHTML = '<p class="mlp-small">Nothing due in the next 7 days. Reviews appear here after you pass topics.</p>'; return; }
    revEl.innerHTML = days.map(function (d) {
      var ids = by[d], show = ids.slice(0, 4);
      return '<p class="mlp-due-day">' + (d === today ? 'Today' : d === today + 1 ? 'Tomorrow' : ui.dayName(d)) + ' · ' + ids.length + '</p><ul class="mlp-due-list">' + show.map(function (id) { var t = G.T[id], l = lOf(id); return '<li>' + (t ? '<a href="' + t.url + '">' + esc(t.title) + '</a>' : esc(id)) + (l.key !== ME ? ' <small class="mlp-lad">' + esc(l.short) + '</small>' : '') + '</li>'; }).join('') + (ids.length > show.length ? '<li class="mlp-small">and ' + (ids.length - show.length) + ' more</li>' : '') + '</ul>';
    }).join('') + (by[today] ? '<div class="mlp-acts">' + dueButtons() + '</div>' : '');
  }
  function dueButtons() { // one button per ladder with reviews due today, this page's ladder first
    var seen = {}, out = '';
    if (E.dueCount()) { seen[ME] = 1; out += '<a class="mlp-btn pri small" href="' + base + 'practice/">Do today’s reviews</a>'; }
    E.dueAll().forEach(function (id) { var l = lOf(id); if (seen[l.key]) return; seen[l.key] = 1; out += '<a class="mlp-btn small' + (out ? '' : ' pri') + '" href="' + l.url + 'practice/">Reviews on the ' + esc(l.title) + '</a>'; });
    return out;
  }
  function paint() { stats(); goal(); chart(); courses(); reviews(); }

  ui.savePanel(D.getElementById('mlp-save'), { full: true, onLoad: paint });
  var reset = D.getElementById('mlp-reset'), msg = D.getElementById('mlp-reset-msg');
  reset.addEventListener('click', function () {
    if (reset.dataset.armed) return;
    reset.dataset.armed = '1'; reset.hidden = true;
    var box = el('div', 'mlp-confirm'); box.innerHTML = otherLadders() || ME !== 'math' ? '<p><b>Erase all your progress on every ladder in this browser?</b> That is every topic, review, XP point and placement on ' + ui.ladders().map(function (l) { return esc(l.title); }).join(', ') + '. This can’t be undone unless you have a save code.</p>' : '<p><b>Erase all Math Ladder progress in this browser?</b> This can’t be undone unless you have a save code.</p>';
    var row = el('div', 'mlp-save-row');
    row.appendChild(ui.btn('Yes, erase it', 'warn small', function () { E.reset(); box.remove(); reset.hidden = false; delete reset.dataset.armed; msg.textContent = ME === 'math' ? 'Erased. Math Ladder starts fresh in this browser.' : 'Erased. Every ladder starts fresh in this browser.'; }));
    row.appendChild(ui.btn('No, keep it', 'ghost small', function () { box.remove(); reset.hidden = false; delete reset.dataset.armed; msg.textContent = 'Nothing changed.'; reset.focus(); }));
    box.appendChild(row); reset.parentNode.insertBefore(box, msg); row.querySelector('button').focus();
  });

  paint(); E.on(paint);
  var lw = 0; W.addEventListener('resize', function () { if (chartEl.clientWidth !== lw) { lw = chartEl.clientWidth; chart(); } });
  try { new MutationObserver(chart).observe(D.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); } catch (e) { }
  ui.graph().then(function () { graphOK = true; paint(); }, function () { });
})(window, document);
