/* Construction course, Lesson 2: the load path. A one-story house over a basement, cut open from front to back.
   Snow on the roof and people and furniture on the floor flow down as moving dots: roof trusses → walls → floor framing
   → foundation wall and center beam → footings and post pad → soil. Open a window to see the header carry the load around it.
   Model (per foot of wall, live loads only): the house is 28 ft wide with 1-ft overhangs; trusses span wall to wall, so each
   wall takes the snow on 15 ft of roof; floor joists span 14 ft from each wall to a center beam, so each wall takes 7 ft of
   floor and the beam takes 14 ft; beam posts stand 8 ft apart on 2 ft × 2 ft pads. Pressure = force ÷ area (OpenStax). */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-loadpath');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  root.innerHTML = '';
  root.classList.add('cn-lp');
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 84 380 340', role: 'img', 'aria-label': 'Cross-section of a house: snow on the roof and furniture on the floor send their weight down through the trusses, walls, floor joists, center beam, post, foundation walls and footings into the soil' }, stage);
  var lg = T.h('p', { class: 'cn-lp-key' }, '<span><i class="k1"></i>snow load</span><span><i class="k2"></i>people and furniture</span>');
  stage.appendChild(lg);

  // ---------- static drawing ----------
  S('rect', { class: 'cn-lp-soil', x: 0, y: 300, width: 380, height: 124 }, svg);
  S('rect', { class: 'cn-lp-room', x: 68, y: 288, width: 244, height: 94 }, svg);
  S('path', { class: 'cn-lp-grade', d: 'M0,300 H52 M328,300 H380' }, svg);
  var bulbL = S('ellipse', { class: 'cn-lp-bulb', cx: 60, cy: 406, rx: 30, ry: 14 }, svg);
  var bulbR = S('ellipse', { class: 'cn-lp-bulb', cx: 320, cy: 406, rx: 30, ry: 14 }, svg);
  var bulbC = S('ellipse', { class: 'cn-lp-bulb', cx: 190, cy: 398, rx: 22, ry: 12 }, svg);
  var footL = S('rect', { class: 'cn-lp-conc', y: 392, height: 14 }, svg);
  var footR = S('rect', { class: 'cn-lp-conc', y: 392, height: 14 }, svg);
  S('rect', { class: 'cn-lp-conc', x: 52, y: 286, width: 16, height: 106 }, svg);
  S('rect', { class: 'cn-lp-conc', x: 312, y: 286, width: 16, height: 106 }, svg);
  S('rect', { class: 'cn-lp-conc', x: 68, y: 382, width: 244, height: 8 }, svg);
  S('rect', { class: 'cn-lp-conc', x: 172, y: 390, width: 36, height: 10 }, svg);
  S('rect', { class: 'cn-lp-steel', x: 188, y: 290, width: 4, height: 92 }, svg);
  S('rect', { class: 'cn-lp-wood', x: 178, y: 276, width: 24, height: 14 }, svg);
  S('rect', { class: 'cn-lp-wood2', x: 52, y: 262, width: 276, height: 14 }, svg);
  S('rect', { class: 'cn-lp-wood', x: 52, y: 258, width: 276, height: 4 }, svg);
  S('rect', { class: 'cn-lp-wood', x: 54, y: 172, width: 12, height: 86 }, svg);
  S('rect', { class: 'cn-lp-wood', x: 314, y: 172, width: 12, height: 86 }, svg);
  S('path', { class: 'cn-lp-truss', d: 'M38,179 L190,104 L342,179 M56,170 H324 M125,138 L150,170 L190,106 L230,170 L255,138' }, svg);
  var snow = S('path', { class: 'cn-lp-snow' }, svg);
  var crates = S('g', null, svg);
  // labels
  var L = function (x, y, t, a) { var e = S('text', { class: 'tx-sm', x: x, y: y, 'text-anchor': a || 'start' }, svg); e.textContent = t; return e; };
  L(190, 92, 'snow', 'middle');
  L(100, 165, 'trusses');
  L(72, 186, 'wall');
  L(206, 284, 'beam');
  L(198, 330, 'post');
  L(72, 300, 'foundation wall');
  L(4, 386, 'footing');
  L(190, 418, 'soil', 'middle');
  var tPL = S('text', { class: 'tx-sm tx-b tx-ink', x: 60, y: 420, 'text-anchor': 'middle' }, svg);
  var tPR = S('text', { class: 'tx-sm tx-b tx-ink', x: 320, y: 420, 'text-anchor': 'middle' }, svg);
  var tPC = S('text', { class: 'tx-sm tx-b tx-ink', x: 236, y: 404 }, svg);

  // ---------- flow paths ----------
  var flowG = S('g', null, svg);
  function mk(pts, cls) {
    var d = 'M' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' L');
    var line = S('path', { class: 'cn-lp-path ' + cls, d: d }, flowG);
    var segs = [], len = 0;
    for (var i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); len += l; }
    var n = Math.max(3, Math.round(len / 22)), dots = [];
    for (var j = 0; j < n; j++) dots.push(S('circle', { class: 'cn-lp-dot ' + cls, r: 2 }, flowG));
    return { pts: pts, segs: segs, len: len, line: line, dots: dots, load: 0, cls: cls };
  }
  function at(p, s) {
    var u = ((s % p.len) + p.len) % p.len;
    for (var i = 0; i < p.segs.length; i++) {
      if (u <= p.segs[i]) { var f = u / p.segs[i], a = p.pts[i], b = p.pts[i + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; }
      u -= p.segs[i];
    }
    return p.pts[p.pts.length - 1];
  }
  var paths = {
    sL: mk([[124, 128], [62, 160], [58, 176], [58, 402]], 'k1'),
    sR: mk([[256, 128], [318, 160], [322, 176], [322, 402]], 'k1'),
    fL: mk([[104, 256], [104, 268], [64, 268], [62, 280], [62, 402]], 'k2'),
    fC: mk([[190, 256], [190, 296], [190, 394]], 'k2'),
    fR: mk([[276, 256], [276, 268], [316, 268], [318, 280], [318, 402]], 'k2')
  };
  // ---------- inset: the bearing wall seen from outside ----------
  side.innerHTML =
    '<p class="cn-lp-ih">The right-hand wall, seen from outside</p>' +
    '<div class="tr-w-stage cn-lp-inset"></div>' +
    '<div class="tr-w-ctrl"><div class="tr-seg" role="group" aria-label="Window in the wall"><button type="button" aria-pressed="false" class="lp-win">Open a window</button></div></div>' +
    '<label class="tr-field">Snow on the roof: <span class="v lp-v1"></span><input type="range" class="lp-snow" min="0" max="70" step="5" value="30" aria-label="Snow load in pounds per square foot"></label>' +
    '<label class="tr-field">People and furniture on the floor: <span class="v lp-v2"></span><input type="range" class="lp-floor" min="0" max="70" step="5" value="30" aria-label="Floor load in pounds per square foot"></label>' +
    '<label class="tr-field">Footing width: <span class="v lp-v3"></span><input type="range" class="lp-foot" min="12" max="36" step="2" value="20" aria-label="Footing width in inches"></label>' +
    '<label class="tr-field lp-wf" hidden>Window width: <span class="v lp-v4"></span><input type="range" class="lp-ww" min="2" max="8" step="0.5" value="4" aria-label="Window width in feet"></label>' +
    '<div class="tr-out lp-out" aria-live="polite"></div>';
  var q = function (s) { return side.querySelector(s); };
  var iS = q('.lp-snow'), iF = q('.lp-floor'), iB = q('.lp-foot'), iW = q('.lp-ww'), bWin = q('.lp-win'), out = q('.lp-out');
  var isv = S('svg', { viewBox: '0 0 260 150', role: 'img', 'aria-label': 'The wall from outside: studs carry the load from the top plate to the floor; with a window, a header carries it to the jack studs' }, q('.cn-lp-inset'));
  var IW0 = 10, IW1 = 250, PXIN = 240 / 144; // 12-ft wall shown, 1.667 px per inch
  S('rect', { class: 'cn-lp-wood', x: IW0, y: 20, width: IW1 - IW0, height: 4 }, isv);
  S('rect', { class: 'cn-lp-wood', x: IW0, y: 24, width: IW1 - IW0, height: 4 }, isv);
  S('rect', { class: 'cn-lp-wood', x: IW0, y: 112, width: IW1 - IW0, height: 4 }, isv);
  S('rect', { class: 'cn-lp-wood2', x: IW0, y: 116, width: IW1 - IW0, height: 12 }, isv);
  S('rect', { class: 'cn-lp-conc', x: IW0, y: 128, width: IW1 - IW0, height: 22 }, isv);
  var isnow = S('rect', { class: 'cn-lp-snowi', x: IW0, y: 6, width: IW1 - IW0, height: 6 }, isv);
  var it = S('text', { class: 'tx-sm', x: 130, y: 145, 'text-anchor': 'middle' }, isv); it.textContent = 'foundation wall';
  var studG = S('g', null, isv), iflow = S('g', null, isv);
  var ipaths = [];

  function fmt(x) { return T.fmt(x, 0); }
  function buildInset(win, wft) {
    studG.innerHTML = ''; iflow.innerHTML = ''; ipaths = [];
    var cx = 130, w = wft * 12 * PXIN, x0 = cx - w / 2, x1 = cx + w / 2;
    var sx = [];
    for (var i = 0; i <= 9; i++) sx.push(IW0 + 1.5 + i * 16 * PXIN);
    sx.push(IW1 - 1.5);
    function stud(x, y0, y1, cls) { S('rect', { class: cls || 'cn-lp-wood', x: (x - 1.5).toFixed(1), y: y0, width: 3, height: y1 - y0 }, studG); }
    function ip(pts) {
      var p = { pts: pts, segs: [], len: 0, dots: [] };
      for (var k = 1; k < pts.length; k++) { var l = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); p.segs.push(l); p.len += l; }
      for (var j = 0; j < Math.max(2, Math.round(p.len / 18)); j++) p.dots.push(S('circle', { class: 'cn-lp-dot k1', r: 1.6 }, iflow));
      S('path', { class: 'cn-lp-path k1', d: 'M' + pts.map(function (a) { return a[0].toFixed(1) + ',' + a[1]; }).join(' L') }, iflow).parentNode.insertBefore(iflow.lastChild, iflow.firstChild);
      ipaths.push(p);
    }
    if (!win) {
      sx.forEach(function (x) { stud(x, 28, 112); ip([[x, 14], [x, 126]]); });
      return { jack: 0, n: 0 };
    }
    var hy = 28, hh = 14, sill = 84;
    S('rect', { class: 'cn-lp-hdrw', x: (x0 - 3).toFixed(1), y: hy, width: (w + 6).toFixed(1), height: hh }, studG);
    S('rect', { class: 'cn-lp-glassw', x: x0.toFixed(1), y: hy + hh, width: w.toFixed(1), height: sill - hy - hh }, studG);
    stud(x0 - 1.5, hy + hh, 112, 'cn-lp-jack'); stud(x1 + 1.5, hy + hh, 112, 'cn-lp-jack');
    stud(x0 - 4.5, 28, 112); stud(x1 + 4.5, 28, 112);
    S('rect', { class: 'cn-lp-wood', x: x0.toFixed(1), y: sill, width: w.toFixed(1), height: 3 }, studG);
    var lj = S('text', { class: 'tx-sm', x: (x0 - 8).toFixed(1), y: 104, 'text-anchor': 'end' }, studG); lj.textContent = 'jack';
    var lh = S('text', { class: 'tx-sm tx-b tx-ink', x: cx, y: hy + 11, 'text-anchor': 'middle' }, studG); lh.textContent = 'header';
    var n = 0;
    sx.forEach(function (x) {
      if (x > x0 - 7 && x < x1 + 7) {
        if (x > x0 + 2 && x < x1 - 2) { stud(x, sill + 3, 112, 'cn-lp-crip'); n++; }
        // the load above the opening rides the header to the nearest jack
        var j = x < cx ? x0 - 1.5 : x1 + 1.5;
        ip([[x, 14], [x, hy + 4], [j, hy + 4], [j, 126]]);
      } else { stud(x, 28, 112); ip([[x, 14], [x, 126]]); }
    });
    return { n: n };
  }

  var t = 0, last = {};
  function update() {
    var sn = +iS.value, fl = +iF.value, b = +iB.value, win = bWin.getAttribute('aria-pressed') === 'true', wft = +iW.value;
    q('.lp-v1').textContent = sn + ' lb per sq ft';
    q('.lp-v2').textContent = fl + ' lb per sq ft';
    q('.lp-v3').textContent = b + ' in (' + (b / 12).toFixed(2).replace(/0$/, '') + ' ft)';
    q('.lp-v4').textContent = wft + ' ft';
    q('.lp-wf').hidden = !win;
    var roofW = sn * 15, floorW = fl * 7, wall = roofW + floorW, soilP = wall / (b / 12);
    var beam = fl * 14, post = beam * 8, padP = post / 4;
    var stud = roofW * 16 / 12, hdr = roofW * wft, jack = hdr / 2;
    // drawing
    var th = sn * 0.3;
    snow.setAttribute('d', 'M38,179 L190,104 L342,179 L342,' + (179 - th).toFixed(1) + ' L190,' + (104 - th * 1.1).toFixed(1) + ' L38,' + (179 - th).toFixed(1) + ' Z');
    snow.style.opacity = sn ? 1 : 0;
    isnow.setAttribute('height', Math.max(0, sn * 0.12).toFixed(1)); isnow.setAttribute('y', (13 - sn * 0.12).toFixed(1));
    crates.innerHTML = '';
    var nc = Math.round(fl / 10);
    for (var i = 0; i < nc; i++) {
      [[94, 0], [176, 1], [258, 2]].forEach(function (c) {
        S('rect', { class: 'cn-lp-crate', x: c[0] + (i % 2) * 3, y: 250 - i * 8, width: 20, height: 7, rx: 1.5 }, crates);
      });
    }
    var fw = b * 1.5;
    footL.setAttribute('x', (60 - fw / 2).toFixed(1)); footL.setAttribute('width', fw.toFixed(1));
    footR.setAttribute('x', (320 - fw / 2).toFixed(1)); footR.setAttribute('width', fw.toFixed(1));
    var bo = function (p) { return Math.min(0.75, 0.1 + 0.65 * Math.sqrt(p / 3500)); };
    [bulbL, bulbR].forEach(function (e) { e.setAttribute('rx', (fw / 2 + 6).toFixed(1)); e.style.opacity = wall ? bo(soilP) : 0; });
    bulbC.style.opacity = post ? bo(padP) : 0;
    tPL.textContent = fmt(soilP) + ' psf'; tPR.textContent = fmt(soilP) + ' psf'; tPC.textContent = post ? fmt(padP) + ' psf' : '';
    var MX = 70 * 15 + 70 * 14;
    function setLoad(p, v) {
      p.load = v;
      var r = v ? 1.3 + 3.2 * Math.sqrt(v / MX) : 0;
      p.dots.forEach(function (d) { d.setAttribute('r', r.toFixed(2)); });
      p.line.style.strokeWidth = (v ? 1 + 6 * Math.sqrt(v / MX) : 0.8).toFixed(2);
      p.line.style.opacity = v ? 0.35 : 0.12;
    }
    setLoad(paths.sL, roofW); setLoad(paths.sR, roofW); setLoad(paths.fL, floorW); setLoad(paths.fR, floorW); setLoad(paths.fC, beam);
    var key = win + '|' + wft;
    if (key !== last.key) { last.inset = buildInset(win, wft); last.key = key; }
    var ir = sn ? 1 + 2.2 * Math.sqrt(sn / 70) : 0;
    ipaths.forEach(function (p) { p.dots.forEach(function (d) { d.setAttribute('r', ir.toFixed(2)); }); });
    out.innerHTML =
      '<p>Roof load on each exterior wall: <b>' + fmt(roofW) + ' lb per foot</b> <span class="hs-small">(' + sn + ' × 15 ft of roof)</span></p>' +
      '<p>Floor load on each foundation wall: <b>' + fmt(floorW) + ' lb per foot</b> <span class="hs-small">(' + fl + ' × 7 ft of floor)</span></p>' +
      '<p>Each foot of footing carries <b>' + fmt(wall) + ' lb</b>, so the soil under it feels <span class="big">' + fmt(soilP) + ' psf</span> <span class="hs-small">(' + fmt(wall) + ' lb ÷ ' + (b / 12).toFixed(2).replace(/0$/, '') + ' ft of width)</span></p>' +
      '<p>The center beam carries <b>' + fmt(beam) + ' lb per foot</b>; each post (8 ft apart) carries <b>' + fmt(post) + ' lb</b> down to a 2 × 2 ft pad: ' + fmt(padP) + ' psf on the soil.</p>' +
      (win ? '<p class="cn-lp-hl">The header gathers the roof load over the ' + wft + '-ft opening, <b>' + fmt(hdr) + ' lb</b>, and hands about <b>' + fmt(jack) + ' lb</b> to each jack stud. An ordinary stud 16 inches on center carries about ' + fmt(stud) + ' lb.</p>'
           : '<p>Each wall stud, 16 inches on center, carries about <b>' + fmt(stud) + ' lb</b> of roof load. Open a window to see where the load goes.</p>');
    if (T.reduced) draw(0);
  }
  function draw(dt) {
    t += dt * 34;
    Object.keys(paths).forEach(function (k) {
      var p = paths[k], n = p.dots.length;
      p.dots.forEach(function (d, i) { var xy = at(p, t + i * p.len / n); d.setAttribute('cx', xy[0].toFixed(1)); d.setAttribute('cy', xy[1].toFixed(1)); });
    });
    ipaths.forEach(function (p) {
      var n = p.dots.length;
      p.dots.forEach(function (d, i) { var xy = at(p, t * 0.6 + i * p.len / n); d.setAttribute('cx', xy[0].toFixed(1)); d.setAttribute('cy', xy[1].toFixed(1)); });
    });
  }
  bWin.addEventListener('click', function () { bWin.setAttribute('aria-pressed', bWin.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); update(); });
  [iS, iF, iB, iW].forEach(function (i) { i.addEventListener('input', update); });
  update();
  if (T.reduced) draw(0); else T.loop(root, draw);
})(window, document);
