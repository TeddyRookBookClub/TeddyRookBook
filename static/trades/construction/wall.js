/* Construction course, Lesson 4: frame a wall, one step at a time. Studs are laid out on center (16 or 24 inches, measured
   from the end of the wall); a window opening gets king studs, jack studs, a header, a rough sill and cripple studs
   (DOE Building Science Education Solution Center). Drawn as an elevation: the wall seen from the side, lying in its final position.
   Header and opening sizes here are only for the drawing: real header sizes come from the code's tables or an engineer. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-wall');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var st = { L: 12, oc: 16, win: true, ro: 48, step: 0 };
  var PARTS = {
    bottom: ['Bottom plate', 'The board the studs stand on. It’s nailed down to the subfloor and carries the wall’s load to the floor framing.'],
    top: ['Top plate', 'Ties the tops of the studs together and spreads the load from the roof or floor above onto them.'],
    top2: ['Second top plate', 'Doubles the top plate. Its joints are offset from the first plate’s, and it laps over at corners to tie walls together.'],
    end: ['End stud', 'The full-height stud at each end of the wall, where it meets the next wall.'],
    common: ['Common stud', 'A full-height stud on the layout marks. Studs carry the load down and give the wall sheathing and drywall something to fasten to.'],
    king: ['King stud', 'A full-height stud beside the opening. It stands next to the jack stud and keeps the header and jack in line.'],
    jack: ['Jack stud', 'A shorter stud under each end of the header. It carries the header’s load down to the bottom plate.'],
    header: ['Header', 'A beam over the opening. It carries the load from above sideways to the jack studs. Its size comes from the code’s tables or an engineer.'],
    sill: ['Rough sill', 'The flat piece at the bottom of a window opening. The window rests on it.'],
    cripple: ['Cripple stud', 'A short stud above a header or below a sill. Cripples keep the on-center layout going so sheathing and drywall still land on wood.'],
    mark: ['Layout mark', 'A pencil line on both plates at each stud location, measured from the end of the wall: 16, 32, 48 inches and so on.']
  };
  root.innerHTML = '';
  root.classList.add('cn-wl');
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var left = T.h('div'); grid.appendChild(left);
  var stage = T.h('div', { class: 'tr-w-stage' }); left.appendChild(stage);
  var svg = S('svg', { viewBox: '0 0 560 300', role: 'img', 'aria-label': 'A wall frame being built piece by piece' }, stage);
  var g = S('g', null, svg);
  var info = T.h('div', { class: 'tr-partname', 'aria-live': 'polite' }, '<b>Tap any piece</b> to see its name and job.');
  left.appendChild(info);
  var side = T.h('div'); grid.appendChild(side);
  side.innerHTML =
    '<div class="tr-stroke"><b class="wl-stepn"></b><span class="wl-steph"></span></div>' +
    '<p class="wl-stept"></p>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn ghost wl-back">◂ Back</button><button type="button" class="hs-btn wl-next">Next step ▸</button><button type="button" class="hs-btn ghost wl-all">Build it all</button><button type="button" class="hs-btn ghost wl-reset">↺ Start over</button></div>' +
    '<label class="tr-field">Wall length: <span class="v wl-v1"></span><input type="range" class="wl-len" min="6" max="20" step="1" value="12" aria-label="Wall length in feet"></label>' +
    '<div class="tr-field">Stud spacing<div class="tr-seg wl-oc" role="group" aria-label="Stud spacing"><button type="button" data-v="16" aria-pressed="true">16 in on center</button><button type="button" data-v="24" aria-pressed="false">24 in on center</button></div></div>' +
    '<div class="tr-field">Opening<div class="tr-seg wl-win" role="group" aria-label="Window opening"><button type="button" data-v="1" aria-pressed="true">Window</button><button type="button" data-v="0" aria-pressed="false">No opening</button></div></div>' +
    '<label class="tr-field wl-rof">Rough opening width: <span class="v wl-v2"></span><input type="range" class="wl-ro" min="24" max="72" step="2" value="48" aria-label="Rough opening width in inches"></label>' +
    '<div class="tr-out wl-out" aria-live="polite"></div>';
  var q = function (s) { return side.querySelector(s); };

  // wall geometry in inches: plates 1.5 thick; wall about 97 inches tall
  var BP = 1.5, TOP = 94.125, H = 97.125, HB = 80, HD = 7.25, SILL = 32;
  function geom() {
    var Lin = st.L * 12, s = st.oc, studs = [], marks = [];
    var m = Lin / 2, x0 = m - st.ro / 2, x1 = m + st.ro / 2;
    studs.push({ k: 'end', x: 0.75 });
    for (var c = s; c < Lin - 0.75 - 1.6; c += s) marks.push(c);
    var kept = [], crip = [];
    marks.forEach(function (c) {
      if (st.win && c + 0.75 > x0 - 3 && c - 0.75 < x1 + 3) { if (c - 0.75 >= x0 && c + 0.75 <= x1) crip.push(c); }
      else kept.push(c);
    });
    studs.push({ k: 'end', x: Lin - 0.75 });
    return { Lin: Lin, marks: marks, commons: kept, crip: crip, x0: x0, x1: x1 };
  }
  var STEPS = [
    ['Start', 'A wall is framed flat on the floor deck, then stood up. Press “Next step” to build this one, or tap “Build it all”.'],
    ['Bottom plate', 'Cut the bottom plate to the wall’s length.'],
    ['Top plate', 'Cut a top plate to match and lay it beside the bottom plate.'],
    ['Layout', 'Mark both plates together at each stud location, measured from the end of the wall, so the studs line up top and bottom.'],
    ['End studs', 'Nail a full-length stud at each end.'],
    ['Common studs', 'Nail a full-length stud on every layout mark, except where the opening goes.'],
    ['King studs', 'Add a full-height king stud on each side of the opening.'],
    ['Header and jacks', 'Jack studs go against the kings; the header rests on the jacks and carries the load around the opening.'],
    ['Sill and cripples', 'Add the rough sill, then cripple studs on the layout marks above the header and below the sill.'],
    ['Second top plate', 'A second top plate goes on after the wall is up, overlapping the joints and tying walls together at the corners.'],
  ];
  function steps() { return st.win ? STEPS : STEPS.filter(function (s, i) { return i < 6 || i === 9; }); }

  var sc, ox, oy;
  function R(x, y, w, h, cls, part, delay) { // inches → px; y measured up from the floor
    var r = S('rect', { class: 'cn-wl-p ' + cls, x: (ox + x * sc).toFixed(1), y: (oy - (y + h) * sc).toFixed(1), width: Math.max(1, w * sc).toFixed(1), height: Math.max(1, h * sc).toFixed(1), rx: 0.6, 'data-part': part, tabindex: '-1' }, g);
    if (delay != null && !T.reduced) { r.style.animationDelay = delay + 'ms'; r.classList.add('cn-wl-in'); }
    return r;
  }
  function draw(animStep) {
    g.innerHTML = '';
    var G = geom();
    sc = Math.min(520 / G.Lin, 244 / H); ox = (560 - G.Lin * sc) / 2; oy = 272;
    S('path', { class: 'cn-wl-floor', d: 'M10,' + (oy + 1) + ' H550' }, g);
    var n = st.step, list = steps(), name = list[n][0];
    function done(nm) { for (var i = 0; i <= n; i++) if (list[i][0] === nm) return list.indexOf(list[i]) <= n; return false; }
    var anim = function (nm, i) { return list[n][0] === nm && animStep ? i * 70 : null; };
    var c = { full: 0, king: 0, jack: 0, crip: 0, plates: 0, header: 0 };
    // a faint outline of the finished wall, so you can see where each piece will go
    if (n < list.length - 1) {
      var GR = function (x, y, w, h) { S('rect', { class: 'cn-wl-gh', x: (ox + x * sc).toFixed(1), y: (oy - (y + h) * sc).toFixed(1), width: Math.max(1, w * sc).toFixed(1), height: Math.max(1, h * sc).toFixed(1) }, g); };
      GR(0, 0, G.Lin, BP); GR(0, TOP, G.Lin, 1.5); GR(0, TOP + 1.5, G.Lin, 1.5);
      [0, G.Lin - 1.5].concat(G.commons.map(function (m) { return m - 0.75; })).forEach(function (x) { GR(x, BP, 1.5, TOP - BP); });
      if (st.win) {
        GR(G.x0 - 3, BP, 1.5, TOP - BP); GR(G.x1 + 1.5, BP, 1.5, TOP - BP); GR(G.x0 - 1.5, BP, 1.5, HB - BP); GR(G.x1, BP, 1.5, HB - BP);
        GR(G.x0 - 1.5, HB, G.x1 - G.x0 + 3, HD); GR(G.x0, SILL, G.x1 - G.x0, 1.5);
        G.crip.forEach(function (m) { GR(m - 0.75, BP, 1.5, SILL - BP); GR(m - 0.75, HB + HD, 1.5, TOP - HB - HD); });
      }
    }
    if (done('Bottom plate')) { R(0, 0, G.Lin, BP, 'pl', 'bottom', anim('Bottom plate', 0)); c.plates++; }
    if (done('Top plate')) { R(0, TOP, G.Lin, 1.5, 'pl', 'top', anim('Top plate', 0)); c.plates++; }
    if (done('Layout')) {
      G.marks.forEach(function (m, i) {
        var a = anim('Layout', i);
        [[BP - 0.2, 'b'], [TOP + 1.7, 't']].forEach(function (p) {
          var y = oy - p[0] * sc, xx = ox + m * sc;
          var mk = S('path', { class: 'cn-wl-mark', d: 'M' + xx.toFixed(1) + ',' + (y - (p[1] === 'b' ? 6 : -6)).toFixed(1) + ' V' + (y + (p[1] === 'b' ? 6 : -6)).toFixed(1), 'data-part': 'mark' }, g);
          if (a != null && !T.reduced) { mk.style.animationDelay = a + 'ms'; mk.classList.add('cn-wl-in'); }
        });
        if (G.marks.length <= 15 || i % 2 === 0) {
          var t = S('text', { class: 'tx-sm cn-wl-mt', x: (ox + m * sc).toFixed(1), y: (oy + 17).toFixed(1), 'text-anchor': 'middle' }, g); t.textContent = m + '″';
        }
      });
    }
    if (done('End studs')) { [0, G.Lin - 1.5].forEach(function (x, i) { R(x, BP, 1.5, TOP - BP, 'st', 'end', anim('End studs', i)); c.full++; }); }
    if (done('Common studs')) { G.commons.forEach(function (m, i) { R(m - 0.75, BP, 1.5, TOP - BP, 'st', 'common', anim('Common studs', i)); c.full++; }); }
    if (st.win) {
      if (done('King studs')) { [G.x0 - 3, G.x1 + 1.5].forEach(function (x, i) { R(x, BP, 1.5, TOP - BP, 'st k', 'king', anim('King studs', i)); c.king++; }); }
      if (done('Header and jacks')) {
        [G.x0 - 1.5, G.x1].forEach(function (x, i) { R(x, BP, 1.5, HB - BP, 'st j', 'jack', anim('Header and jacks', i)); c.jack++; });
        R(G.x0 - 1.5, HB, G.x1 - G.x0 + 3, HD, 'hd', 'header', anim('Header and jacks', 2)); c.header = 1;
      }
      if (done('Sill and cripples')) {
        R(G.x0, SILL, G.x1 - G.x0, 1.5, 'pl', 'sill', anim('Sill and cripples', 0));
        G.crip.forEach(function (m, i) {
          R(m - 0.75, BP, 1.5, SILL - BP, 'st cr', 'cripple', anim('Sill and cripples', i + 1));
          R(m - 0.75, HB + HD, 1.5, TOP - HB - HD, 'st cr', 'cripple', anim('Sill and cripples', i + 1)); c.crip += 2;
        });
        var ro = S('path', { class: 'cn-wl-ro', d: 'M' + (ox + G.x0 * sc).toFixed(1) + ',' + (oy - (HB) * sc).toFixed(1) + ' H' + (ox + G.x1 * sc).toFixed(1) + ' V' + (oy - (SILL + 1.5) * sc).toFixed(1) + ' H' + (ox + G.x0 * sc).toFixed(1) + ' Z' }, g);
        var rt = S('text', { class: 'tx-sm', x: (ox + (G.x0 + G.x1) / 2 * sc).toFixed(1), y: (oy - (SILL + HB) / 2 * sc + 4).toFixed(1), 'text-anchor': 'middle' }, g); rt.textContent = 'rough opening ' + st.ro + '″';
      }
    }
    if (done('Second top plate')) { R(0, TOP + 1.5, G.Lin, 1.5, 'pl p2', 'top2', anim('Second top plate', 0)); c.plates++; }
    var lt = S('text', { class: 'tx-sm tx-b tx-ink', x: 280, y: 16, 'text-anchor': 'middle' }, g);
    lt.textContent = st.L + ' ft wall, studs ' + st.oc + ' in on center';
    // panel text
    q('.wl-stepn').textContent = n === 0 ? 'Ready' : 'Step ' + n + ' of ' + (list.length - 1);
    q('.wl-steph').textContent = n === 0 ? '' : name;
    q('.wl-stept').textContent = list[n][1];
    q('.wl-back').disabled = n === 0; q('.wl-next').disabled = n === list.length - 1;
    q('.wl-v1').textContent = st.L + ' ft (' + st.L * 12 + ' in)';
    q('.wl-v2').textContent = st.ro + ' in';
    q('.wl-rof').hidden = !st.win;
    var lf = st.L * c.plates;
    q('.wl-out').innerHTML = '<p class="cn-wl-ct"><b>Pieces so far</b></p><ul class="cn-wl-list">' +
      '<li><span>Full-length studs</span><b>' + (c.full + c.king) + '</b></li>' +
      (st.win ? '<li><span>of them king studs</span><b>' + c.king + '</b></li><li><span>Jack studs</span><b>' + c.jack + '</b></li><li><span>Cripple studs</span><b>' + c.crip + '</b></li><li><span>Header</span><b>' + c.header + '</b></li>' : '') +
      '<li><span>Plates</span><b>' + c.plates + ' × ' + st.L + ' ft = ' + lf + ' ft</b></li></ul>' +
      (n === list.length - 1 ? '<p class="hs-small">Try 24 inches on center: fewer studs, and more room for insulation (DOE advanced framing). The local code decides what spacing a wall may use.</p>' : '');
    selected = null;
  }
  var selected = null;
  svg.addEventListener('click', function (e) {
    var p = e.target.closest('[data-part]'); if (!p) return;
    g.querySelectorAll('.sel').forEach(function (x) { x.classList.remove('sel'); });
    var k = p.dataset.part; g.querySelectorAll('[data-part="' + k + '"]').forEach(function (x) { x.classList.add('sel'); });
    info.innerHTML = '<b>' + PARTS[k][0] + ':</b> ' + PARTS[k][1];
  });
  function go(n, anim) { st.step = Math.max(0, Math.min(steps().length - 1, n)); draw(anim); }
  q('.wl-next').addEventListener('click', function () { go(st.step + 1, true); });
  q('.wl-back').addEventListener('click', function () { go(st.step - 1, false); });
  q('.wl-all').addEventListener('click', function () { go(steps().length - 1, false); });
  q('.wl-reset').addEventListener('click', function () { go(0, false); info.innerHTML = '<b>Tap any piece</b> to see its name and job.'; });
  q('.wl-len').addEventListener('input', function (e) { st.L = +e.target.value; st.ro = Math.min(st.ro, st.L * 12 - 40); q('.wl-ro').max = Math.min(72, st.L * 12 - 40); draw(false); });
  q('.wl-ro').addEventListener('input', function (e) { st.ro = +e.target.value; draw(false); });
  function seg(sel, fn) {
    q(sel).addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      q(sel).querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var nm = steps()[st.step][0]; fn(b);
      var l = steps(), idx = -1; l.forEach(function (s, i) { if (s[0] === nm) idx = i; });
      st.step = idx >= 0 ? idx : Math.min(st.step, l.length - 1); draw(false);
    });
  }
  seg('.wl-oc', function (b) { st.oc = +b.dataset.v; });
  seg('.wl-win', function (b) { st.win = b.dataset.v === '1'; });
  go(0, false);
})(window, document);
