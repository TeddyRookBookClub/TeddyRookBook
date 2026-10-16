/* Math Ladder skill map (/math/map/?course=<key>): a course's topics as a layered graph, prerequisites below and the
   topics built on them above, colored by state. Drag to pan; wheel, pinch or the buttons to zoom; click or Enter opens a
   topic; hover or focus highlights what a topic builds on and leads to. Skills from earlier courses sit on the bottom row. */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder, E = ML.engine, ui = ML.ui, base = ML.cfg.base, esc = ui.esc;
  var NS = 'http://www.w3.org/2000/svg';
  var box = D.getElementById('mlp-map'), sel = D.getElementById('mlp-map-course'), title = D.getElementById('mlp-map-title'), crumb = D.getElementById('mlp-map-crumb');
  var NW = 172, NH = 54, GX = 22, GY = 46;
  var svg, gAll, info, view = { x: 0, y: 0, k: 1 }, size = { w: 100, h: 100 }, nodes = {}, edges = [], key = null;

  function s(tag, attrs, parent) { var e = D.createElementNS(NS, tag); for (var a in attrs) e.setAttribute(a, attrs[a]); if (parent) parent.appendChild(e); return e; }
  function wrap(text, max) {
    var words = String(text).split(/\s+/), lines = [''];
    words.forEach(function (w) { var cur = lines[lines.length - 1]; if ((cur + ' ' + w).trim().length > max && cur) lines.push(w); else lines[lines.length - 1] = (cur + ' ' + w).trim(); });
    if (lines.length > 2) { lines = [lines[0], lines.slice(1).join(' ')]; if (lines[1].length > max) lines[1] = lines[1].slice(0, max - 1) + '…'; }
    return lines;
  }

  function layout(k) {
    var G = E.graph(), ids = (G.byCourse[k] || []).slice(), inC = {}, ext = [], layer = {}, units = {};
    ids.forEach(function (id) { inC[id] = 1; });
    ((G.C[k] && G.C[k].units) || []).forEach(function (u) { units[u.key] = u.title; });
    ids.forEach(function (id) { G.T[id].prereqs.forEach(function (p) { if (!inC[p] && G.T[p] && ext.indexOf(p) < 0) ext.push(p); }); });
    ext.forEach(function (p) { layer[p] = 0; });
    ids.forEach(function (id) { // teaching order is a topological order
      var m = 0; G.T[id].prereqs.forEach(function (p) { if (layer[p] !== undefined) m = Math.max(m, layer[p] + 1); }); layer[id] = Math.max(1, m);
    });
    var all = ext.concat(ids), L = 0; all.forEach(function (id) { L = Math.max(L, layer[id]); });
    var rows = []; for (var i = 0; i <= L; i++) rows.push([]);
    all.forEach(function (id) { rows[layer[id]].push(id); });
    // order within rows: barycenters of neighbors, a few sweeps each way
    var pos = {}; function idx() { rows.forEach(function (r) { r.forEach(function (id, j) { pos[id] = j - r.length / 2; }); }); }
    idx();
    var parents = function (id) { return (G.T[id].prereqs || []).filter(function (p) { return pos[p] !== undefined; }); };
    var kids = function (id) { return (G.kids[id] || []).filter(function (c) { return inC[c]; }); };
    for (var it = 0; it < 6; it++) {
      var down = it % 2 === 0;
      (down ? rows : rows.slice().reverse()).forEach(function (r) {
        var bc = {}; r.forEach(function (id) { var ns = down ? parents(id) : kids(id); bc[id] = ns.length ? ns.reduce(function (a, n) { return a + pos[n]; }, 0) / ns.length : pos[id]; });
        r.sort(function (a, b) { return bc[a] - bc[b]; }); r.forEach(function (id, j) { pos[id] = j - r.length / 2; });
      });
    }
    // a wide layer wraps onto several rows (all still above the layer below), so the map stays readable on narrow screens
    var per = Math.max(2, Math.min(9, Math.floor((box.clientWidth - 40) / ((NW + GX) * 0.82)))), vrows = [];
    rows.forEach(function (r) { for (var i = 0; i < r.length; i += per) vrows.push(r.slice(i, i + per)); });
    var widest = Math.max.apply(null, vrows.map(function (r) { return r.length; })), W0 = widest * (NW + GX) - GX, V = vrows.length;
    var out = {};
    vrows.forEach(function (r, vi) {
      var rw = r.length * (NW + GX) - GX, x0 = (W0 - rw) / 2;
      r.forEach(function (id, j) { out[id] = { id: id, x: x0 + j * (NW + GX), y: (V - 1 - vi) * (NH + GY), ext: !inC[id], unit: inC[id] ? units[G.T[id].unit] || '' : (ui.course(G.T[id].course) || {}).short || '' }; });
    });
    return { nodes: out, w: W0, h: V * (NH + GY) - GY, ids: all };
  }

  function draw(k) {
    key = k; var G = E.graph(), c = ui.course(k);
    title.textContent = 'Skill map: ' + (c ? c.title : k); crumb.innerHTML = c ? '<a href="' + c.url + '">' + esc(c.title) + '</a> <span aria-hidden="true">›</span> Skill map' : 'Skill map';
    D.title = (c ? c.title + ' skill map' : 'Skill map') + ' | Teddy Rook Book';
    box.querySelectorAll('svg,.mlp-loading,.mlp-map-info').forEach(function (e) { e.remove(); });
    if (!G.byCourse[k] || !G.byCourse[k].length) { box.insertAdjacentHTML('beforeend', '<p class="mlp-loading">The skill map for this course is coming soon.</p>'); return; }
    var lay = layout(k); nodes = lay.nodes; edges = [];
    svg = s('svg', { 'aria-hidden': 'false', role: 'group', 'aria-label': 'Skill map of ' + (c ? c.title : k) });
    gAll = s('g', {}, svg);
    var gE = s('g', {}, gAll), gN = s('g', {}, gAll);
    lay.ids.forEach(function (id) {
      if (nodes[id].ext) return;
      G.T[id].prereqs.forEach(function (p) {
        var a = nodes[p], b = nodes[id]; if (!a) return;
        var x1 = a.x + NW / 2, y1 = a.y, x2 = b.x + NW / 2, y2 = b.y + NH, my = (y1 + y2) / 2;
        var path = s('path', { d: 'M' + x1 + ' ' + y1 + ' C' + x1 + ' ' + my + ' ' + x2 + ' ' + my + ' ' + x2 + ' ' + y2, class: 'mlp-edge' + (E.isPassed(p) && E.isPassed(id) ? ' done' : '') }, gE);
        edges.push({ a: p, b: id, el: path });
      });
    });
    lay.ids.forEach(function (id) {
      var n = nodes[id], t = G.T[id], st = n.ext ? 'ext' : E.status(id, k);
      var g = s('g', { class: 'mlp-node ' + (n.ext ? 'ext' : 'st-' + st), transform: 'translate(' + n.x + ' ' + n.y + ')', tabindex: '0', role: 'link', 'aria-label': t.title + (n.ext ? ', from ' + n.unit : ', ' + ui.LABEL[st]) }, gN);
      s('rect', { width: NW, height: NH, rx: 11 }, g);
      var u = s('text', { x: 10, y: 15, class: 'u' }, g); u.textContent = n.unit.length > 23 ? n.unit.slice(0, 22) + '…' : n.unit;
      wrap(t.title, 23).forEach(function (line, i) { var tx = s('text', { x: 10, y: 31 + i * 15 }, g); tx.textContent = line; });
      if (!n.ext && (st === 'passed' || st === 'due')) { var ck = s('text', { x: NW - 18, y: 16, class: 'u' }, g); ck.textContent = st === 'due' ? '↻' : '✓'; }
      g.addEventListener('mouseenter', function () { hi(id); }); g.addEventListener('focus', function () { hi(id); ensureVisible(n); });
      g.addEventListener('mouseleave', function () { hi(null); }); g.addEventListener('blur', function () { hi(null); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); W.location.href = t.url; } });
      g._id = id;
    });
    box.appendChild(svg);
    info = D.createElement('div'); info.className = 'mlp-map-info'; info.setAttribute('aria-live', 'polite'); box.appendChild(info);
    size = { w: lay.w, h: lay.h }; fit();
  }
  function hi(id) {
    var G = E.graph();
    svg.querySelectorAll('.mlp-node.hi').forEach(function (g) { g.classList.remove('hi'); });
    edges.forEach(function (e) { e.el.classList.toggle('hi', !!id && (e.a === id || e.b === id)); });
    if (!id) { info.innerHTML = ''; return; }
    var t = G.T[id], n = nodes[id], pre = t.prereqs.length, lead = (G.kids[id] || []).filter(function (c) { return nodes[c]; }).length;
    svg.querySelectorAll('.mlp-node').forEach(function (g) { if (g._id === id) g.classList.add('hi'); });
    info.innerHTML = '<p><b>' + esc(t.title) + '</b>' + (n.ext ? ' <span class="mlp-small">(' + esc(n.unit) + ')</span>' : '') + '</p><p class="mlp-small">' + (n.ext ? 'From an earlier course' : esc(ui.LABEL[E.status(id, key)])) + ' · builds on ' + pre + ' · leads to ' + lead + (t.short ? '<br>' + esc(t.short) : '') + '</p>';
  }

  /* ---- pan and zoom ---- */
  function apply() { gAll.setAttribute('transform', 'translate(' + view.x + ' ' + view.y + ') scale(' + view.k + ')'); }
  function fit(whole) {
    var bw = box.clientWidth, bh = box.clientHeight, pad = 24;
    var k = Math.min((bw - 2 * pad) / size.w, whole ? (bh - 2 * pad) / size.h : 9, 1.1); // fit the width; tall maps start at the bottom (the foundations)
    view.k = k; view.x = (bw - size.w * k) / 2; view.y = bh - pad - size.h * k;
    if (size.w * k > bw) view.x = pad;
    if (size.h * k < bh - 2 * pad) view.y = (bh - size.h * k) / 2;
    apply();
  }
  function zoomAt(px, py, f) { var k = Math.max(0.2, Math.min(2.5, view.k * f)); f = k / view.k; view.x = px - (px - view.x) * f; view.y = py - (py - view.y) * f; view.k = k; apply(); }
  function ensureVisible(n) {
    var bw = box.clientWidth, bh = box.clientHeight, x = view.x + n.x * view.k, y = view.y + n.y * view.k, w = NW * view.k, h = NH * view.k;
    if (x < 10) view.x += 10 - x; if (x + w > bw - 10) view.x -= x + w - bw + 10;
    if (y < 10) view.y += 10 - y; if (y + h > bh - 10) view.y -= y + h - bh + 10; apply();
  }
  var pts = {}, drag = null, moved = 0, pinch = null;
  box.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.mlp-map-tools,.mlp-map-info')) return;
    pts[e.pointerId] = { x: e.clientX, y: e.clientY }; try { box.setPointerCapture(e.pointerId); } catch (er) { }
    var ids = Object.keys(pts);
    if (ids.length === 1) { drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, node: e.target.closest('.mlp-node') }; moved = 0; box.classList.add('grabbing'); }
    else if (ids.length === 2) { var a = pts[ids[0]], b = pts[ids[1]]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: view.k }; drag = null; }
  });
  box.addEventListener('pointermove', function (e) {
    if (!pts[e.pointerId]) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pts);
    if (pinch && ids.length === 2) {
      var a = pts[ids[0]], b = pts[ids[1]], r = box.getBoundingClientRect(), d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, (pinch.k * d / pinch.d) / view.k); return;
    }
    if (drag) { var dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); view.x = drag.vx + dx; view.y = drag.vy + dy; apply(); }
  });
  function up(e) {
    delete pts[e.pointerId];
    if (drag && moved < 6 && drag.node && e.type === 'pointerup') { var t = E.graph().T[drag.node._id]; if (t) W.location.href = t.url; }
    if (Object.keys(pts).length < 2) pinch = null;
    if (!Object.keys(pts).length) { drag = null; box.classList.remove('grabbing'); }
  }
  box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
  box.addEventListener('wheel', function (e) { e.preventDefault(); var r = box.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0015))); }, { passive: false });
  box.addEventListener('keydown', function (e) {
    if (e.target !== box) return;
    var m = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }[e.key];
    if (m) { e.preventDefault(); view.x += m[0]; view.y += m[1]; apply(); }
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomAt(box.clientWidth / 2, box.clientHeight / 2, 1.25); }
    else if (e.key === '-') { e.preventDefault(); zoomAt(box.clientWidth / 2, box.clientHeight / 2, 0.8); }
  });
  box.querySelectorAll('[data-z]').forEach(function (b) {
    b.addEventListener('click', function () { var z = b.dataset.z; if (z === 'fit') fit(true); else zoomAt(box.clientWidth / 2, box.clientHeight / 2, z === 'in' ? 1.25 : 0.8); });
  });
  var lw = 0; W.addEventListener('resize', function () { if (svg && box.clientWidth !== lw) { lw = box.clientWidth; fit(); } });

  ui.graph().then(function () {
    var cs = ui.courses().filter(function (c) { return c.n; }), want = new URLSearchParams(W.location.search).get('course');
    var k = want && ui.course(want) ? want : E.course() && ui.course(E.course()) ? E.course() : cs[0] && cs[0].key;
    sel.innerHTML = cs.map(function (c) { return '<option value="' + c.key + '"' + (c.key === k ? ' selected' : '') + '>' + esc(c.title) + '</option>'; }).join('');
    sel.addEventListener('change', function () { draw(sel.value); try { W.history.replaceState(null, '', '?course=' + sel.value); } catch (e) { } });
    if (k) draw(k);
    E.on(function () { if (key) draw(key); });
  }, function () { box.querySelector('.mlp-loading').textContent = 'The map didn’t load. Check your connection and reload the page.'; });
})(window, document);
