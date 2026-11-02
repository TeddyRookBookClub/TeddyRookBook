/* /earth-and-space/ocean-floor-gravity/ ("Mapping the Ocean Floor with Gravity"): the map explorer, the profile tool and
   the before-and-after swipe. Layout: layouts/oceanfloor/single.html; styles: of.css; animation: how.js.
   Tiles: tiles/<layer>/<z>/<x>/<y>.png (Web Mercator, 256 px, 8-bit gray). Each pixel is a code, not a color:
   0 = land or no data, 1..255 = value v = a * sinh((code - 128) * asinh(vmax / a) / 127). manifest.json lists every
   tile, so we never ask for one that doesn't exist. All made by scripts/ocean/make-tiles.py. */
(function () {
  'use strict';
  var root = document.querySelector('.of');
  if (!root) return;
  var BASE = root.getAttribute('data-base') || '';
  var CFG = {};
  try { CFG = JSON.parse(document.getElementById('of-cfg').textContent); } catch (e) { CFG = {}; }
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MAN = null;

  // ---------------------------------------------------------------- theme and colors
  function isDark() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  var SCALES = {
    relief: [[0, '#06121f'], [0.3, '#2a3f55'], [0.5, '#7d8c99'], [0.72, '#c6d0d8'], [1, '#ffffff']],
    diverging: [[0, '#1d4b8f'], [0.25, '#6b9bd1'], [0.5, '#f3f0e8'], [0.75, '#e08a5c'], [1, '#9b2a17']]
  };
  function ramp(stops, t) {
    if (t <= 0) return hex(stops[0][1]);
    for (var i = 1; i < stops.length; i++) {
      if (t <= stops[i][0]) {
        var a = stops[i - 1], b = stops[i], f = (t - a[0]) / (b[0] - a[0]), ca = hex(a[1]), cb = hex(b[1]);
        return [ca[0] + (cb[0] - ca[0]) * f, ca[1] + (cb[1] - ca[1]) * f, ca[2] + (cb[2] - ca[2]) * f];
      }
    }
    return hex(stops[stops.length - 1][1]);
  }
  function landRGB() { return isDark() ? [74, 69, 54] : [190, 178, 146]; }
  function landCSS() { var c = landRGB(); return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }

  // ---------------------------------------------------------------- state
  var S = { layer: 'vgg', scale: 'relief', con: { vgg: 60, grav: 80 } };
  try {
    var saved = JSON.parse(localStorage.getItem('of-settings') || 'null');
    if (saved && saved.layer) { S.layer = saved.layer === 'grav' ? 'grav' : 'vgg'; S.scale = saved.scale === 'diverging' ? 'diverging' : 'relief'; }
  } catch (e) { /* no storage */ }
  function saveSettings() { try { localStorage.setItem('of-settings', JSON.stringify({ layer: S.layer, scale: S.scale })); } catch (e) { /* ignore */ } }

  function decoder(L) {
    var k = Math.asinh(L.vmax / L.a) / 127, t = new Float32Array(256);
    for (var c = 1; c < 256; c++) t[c] = L.a * Math.sinh((c - 128) * k);
    t[0] = NaN;
    return t;
  }

  // color a code array (w x h) into an ImageData, with the current scale, contrast and (for relief) light from the NW
  function colorize(codes, w, h, lk, out) {
    var L = MAN.layers[lk], dec = L.dec, C = S.con[lk], st = SCALES[S.scale], land = landRGB();
    var lut = new Uint8ClampedArray(256 * 3), i, c;
    for (c = 1; c < 256; c++) {
      var t = Math.max(-1, Math.min(1, dec[c] / C)) * 0.5 + 0.5, rgb = ramp(st, t);
      lut[c * 3] = rgb[0]; lut[c * 3 + 1] = rgb[1]; lut[c * 3 + 2] = rgb[2];
    }
    var d = out.data, relief = S.scale === 'relief';
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        i = y * w + x; c = codes[i];
        var o = i * 4;
        if (!c) { d[o] = land[0]; d[o + 1] = land[1]; d[o + 2] = land[2]; d[o + 3] = 255; continue; }
        var r = lut[c * 3], g = lut[c * 3 + 1], b = lut[c * 3 + 2];
        if (relief) {
          // central differences inside the tile, one-sided (doubled) at its edges, so tile seams don't show
          var cl = x > 0 ? codes[i - 1] : 0, cr = x < w - 1 ? codes[i + 1] : 0, cu = y > 0 ? codes[i - w] : 0, cd = y < h - 1 ? codes[i + w] : 0;
          var vc = dec[c], vl = cl ? dec[cl] : NaN, vr = cr ? dec[cr] : NaN, vu = cu ? dec[cu] : NaN, vd = cd ? dec[cd] : NaN;
          var gx = !isNaN(vl) && !isNaN(vr) ? vl - vr : !isNaN(vl) ? 2 * (vl - vc) : !isNaN(vr) ? 2 * (vc - vr) : 0;
          var gy = !isNaN(vu) && !isNaN(vd) ? vu - vd : !isNaN(vu) ? 2 * (vu - vc) : !isNaN(vd) ? 2 * (vc - vd) : 0;
          var sh = (gx + gy) / (C * 0.9);
          sh = Math.max(-0.45, Math.min(0.45, sh));
          if (sh > 0) { r += (255 - r) * sh; g += (255 - g) * sh; b += (255 - b) * sh; } else { r *= 1 + sh; g *= 1 + sh; b *= 1 + sh; }
        }
        d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
      }
    }
    return out;
  }

  // ---------------------------------------------------------------- tiles
  var cache = {}, avail = {}, version = 0;
  function key(lk, z, x, y) { return lk + '/' + z + '/' + x + '/' + y; }
  function hasTile(lk, z, x, y) { return !!avail[key(lk, z, x, y)]; }
  function loadCodes(url) {
    return new Promise(function (res, rej) {
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () {
        var cv = document.createElement('canvas');
        cv.width = im.naturalWidth; cv.height = im.naturalHeight;
        var cx = cv.getContext('2d', { willReadFrequently: true });
        cx.drawImage(im, 0, 0);
        var px = cx.getImageData(0, 0, cv.width, cv.height).data, n = cv.width * cv.height, codes = new Uint8Array(n);
        for (var i = 0; i < n; i++) codes[i] = px[i * 4];
        res({ codes: codes, w: cv.width, h: cv.height });
      };
      im.onerror = function () { rej(new Error('tile')); };
      im.src = url;
    });
  }
  function getTile(lk, z, x, y) {
    var k = key(lk, z, x, y), t = cache[k];
    if (t) return t;
    t = cache[k] = { lk: lk, z: z, x: x, y: y, ok: false, cv: null, ver: -1 };
    t.p = loadCodes(BASE + 'tiles/' + k + '.png').then(function (r) {
      t.codes = r.codes; t.ok = true; paint(t); requestDraw();
      return t;
    }, function () { t.fail = true; return t; });
    return t;
  }
  function paint(t) {
    if (!t.ok || t.ver === version) return;
    if (!t.cv) { t.cv = document.createElement('canvas'); t.cv.width = 256; t.cv.height = 256; }
    var cx = t.cv.getContext('2d');
    var img = cx.createImageData(256, 256);
    colorize(t.codes, 256, 256, t.lk, img);
    cx.putImageData(img, 0, 0);
    t.ver = version;
  }

  // ---------------------------------------------------------------- geometry
  var R2D = 180 / Math.PI, YMAX = 0.1, YMIN = 0.9;   // data band: latitude +-80.738 (Mercator y +-144 degrees)
  function lon2x(lon) { return (lon + 180) / 360; }
  function lat2y(lat) { return (180 - R2D * Math.log(Math.tan(Math.PI / 4 + lat / R2D / 2))) / 360; }
  function x2lon(x) { var l = x * 360 - 180; l = ((l + 180) % 360 + 360) % 360 - 180; return l; }
  function y2lat(y) { return R2D * (2 * Math.atan(Math.exp((180 - y * 360) / R2D)) - Math.PI / 2); }
  function fmtLat(lat) { return Math.abs(lat).toFixed(2) + '° ' + (lat >= 0 ? 'N' : 'S'); }
  function fmtLon(lon) { return Math.abs(lon).toFixed(2) + '° ' + (lon >= 0 ? 'E' : 'W'); }
  function hav(a, b) {
    var p1 = a[1] / R2D, p2 = b[1] / R2D, dp = p2 - p1, dl = (b[0] - a[0]) / R2D;
    var h = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  function fmtVal(v, unit) {
    var a = Math.abs(v), s = a < 10 ? v.toFixed(1) : Math.round(v).toString();
    return s.replace('-', '−') + ' ' + unit;
  }
  function zmaxOf(lk) { return MAN.layers[lk].zmax; }

  // value at world point (x, y) from the best tile already loaded (z <= zcap); null if none yet; NaN on land
  function valueAt(lk, wx, wy, zcap, load) {
    wx = ((wx % 1) + 1) % 1;
    if (wy < 0 || wy >= 1) return { v: NaN, z: 0 };
    var pending = false;
    for (var z = Math.min(zcap, zmaxOf(lk)); z >= 0; z--) {
      var n = 1 << z, tx = Math.floor(wx * n), ty = Math.floor(wy * n);
      if (!hasTile(lk, z, tx, ty)) continue;
      var t = cache[key(lk, z, tx, ty)];
      if (!t && load) t = getTile(lk, z, tx, ty);
      if (!t || !t.ok) { if (!t || !t.fail) pending = true; continue; }
      var px = Math.min(255, Math.floor((wx * n - tx) * 256)), py = Math.min(255, Math.floor((wy * n - ty) * 256));
      var c = t.codes[py * 256 + px];
      return { v: c ? MAN.layers[lk].dec[c] : NaN, z: z };
    }
    if (wy < YMAX || wy > YMIN) return { v: NaN, z: 0, none: true };
    if (pending) return null;
    // no tile at any zoom: the whole tile is land
    return { v: NaN, z: 0 };
  }

  // ---------------------------------------------------------------- the map
  var mapEl = root.querySelector('.of-map'), wrap = root.querySelector('.of-mapwrap');
  var ctx = mapEl.getContext('2d');
  var view = { x: lon2x(-150), y: lat2y(10), z: 1.3 };
  var W = 0, H = 0, DPR = 1;
  var prof = null, profHover = null, tourIdx = -1, hoverPt = null;
  function scl() { return 256 * Math.pow(2, view.z); }
  function zMin() { return Math.max(0, Math.log2(Math.max(W, 256) / 256)); }
  function clampView() {
    view.z = Math.max(zMin(), Math.min(8.5, view.z));
    var half = H / 2 / scl();
    var lo = YMAX - 0.02 + half, hi = YMIN + 0.02 - half;
    view.y = lo > hi ? 0.5 : Math.max(lo, Math.min(hi, view.y));
    view.x = ((view.x % 1) + 1) % 1;
  }
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = mapEl.clientWidth; H = mapEl.clientHeight;
    mapEl.width = Math.round(W * DPR); mapEl.height = Math.round(H * DPR);
    clampView(); requestDraw();
  }
  var raf = 0;
  function requestDraw() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; draw(); }); }
  function screenToWorld(px, py) { var s = scl(); return [view.x + (px - W / 2) / s, view.y + (py - H / 2) / s]; }
  function worldToScreen(wx, wy) { var s = scl(); return [(wx - view.x) * s + W / 2, (wy - view.y) * s + H / 2]; }

  function draw() {
    if (!MAN || !W) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = landCSS();
    ctx.fillRect(0, 0, W, H);
    var lk = S.layer, s = scl();
    var tz = Math.max(0, Math.min(zmaxOf(lk), Math.round(view.z)));
    var n = 1 << tz, ts = s / n;
    var left = view.x - W / 2 / s, top = view.y - H / 2 / s;
    var tx0 = Math.floor(left * n), tx1 = Math.floor((left + W / s) * n);
    var ty0 = Math.max(0, Math.floor(top * n)), ty1 = Math.min(n - 1, Math.floor((top + H / s) * n));
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    for (var ty = ty0; ty <= ty1; ty++) {
      for (var tx = tx0; tx <= tx1; tx++) {
        var xx = ((tx % n) + n) % n;
        var sx = (tx / n - left) * s, sy = (ty / n - top) * s;
        drawTile(lk, tz, xx, ty, sx, sy, ts);
      }
    }
    // the data stops at +-80.7 degrees: shade beyond
    drawOverlays();
  }
  function drawTile(lk, tz, x, y, sx, sy, ts) {
    var fx = Math.floor(sx), fy = Math.floor(sy), fw = Math.ceil(sx + ts) - fx, fh = Math.ceil(sy + ts) - fy;
    for (var z = tz; z >= 0; z--) {
      var d = tz - z, px = x >> d, py = y >> d;
      if (!hasTile(lk, z, px, py)) continue;
      var t = cache[key(lk, z, px, py)] || getTile(lk, z, px, py);
      if (!t.ok) continue;
      if (t.ver !== version) paint(t);
      var f = 1 << d, sub = 256 / f, ox = (x - (px << d)) * sub, oy = (y - (py << d)) * sub;
      ctx.drawImage(t.cv, ox, oy, sub, sub, fx, fy, fw, fh);
      return;
    }
  }
  function css(v) { return getComputedStyle(root).getPropertyValue(v).trim() || '#b8963e'; }
  function drawOverlays() {
    var s = scl(), gold = css('--of-gold'), i, k;
    // featured regions, as dashed boxes when zoomed out
    if (view.z < 4.6 && MAN.regions) {
      ctx.save();
      ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.strokeStyle = gold;
      ctx.font = '600 12px system-ui, sans-serif'; ctx.fillStyle = gold;
      for (i = 0; i < MAN.regions.length; i++) {
        var b = MAN.regions[i].box;
        for (k = -1; k <= 1; k++) {
          var a = worldToScreen(lon2x(b[0]) + k, lat2y(b[3])), c = worldToScreen(lon2x(b[2]) + k, lat2y(b[1]));
          if (c[0] < 0 || a[0] > W || c[1] < 0 || a[1] > H) continue;
          ctx.strokeRect(a[0], a[1], c[0] - a[0], c[1] - a[1]);
          if (c[0] - a[0] > 26) { ctx.fillText(String(i + 1), a[0] + 4, a[1] + 14); }
        }
      }
      ctx.restore();
    }
    // the profile line
    if (prof) {
      var A = prof.a, B = prof.b;
      for (k = -1; k <= 1; k++) {
        var p = worldToScreen(A[0] + k, A[1]), q = worldToScreen(B[0] + k, B[1]);
        if (Math.max(p[0], q[0]) < -20 || Math.min(p[0], q[0]) > W + 20) continue;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
        ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
        dot(p, '#f2c94c', 'A'); dot(q, '#f2c94c', 'B');
        if (profHover) {
          var h = worldToScreen(profHover[0] + k, profHover[1]);
          ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(h[0], h[1], 5, 0, 7); ctx.fill(); ctx.stroke();
        }
        ctx.restore();
      }
    }
    if (hoverPt && !dragging) {
      var hp = worldToScreen(hoverPt[0], hoverPt[1]);
      ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.shadowColor = '#000'; ctx.shadowBlur = 2;
      ctx.beginPath(); ctx.arc(hp[0], hp[1], 6, 0, 7); ctx.stroke(); ctx.restore();
    }
    drawScaleBar();
  }
  function dot(p, col, label) {
    ctx.fillStyle = col; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#000'; ctx.font = '700 10px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, p[0], p[1] + 0.5); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
  }
  var scaleEl = root.querySelector('.of-scale');
  function drawScaleBar() {
    if (!scaleEl) return;
    var lat = y2lat(view.y), kmPerPx = 40075 * Math.cos(lat / R2D) / scl();
    var target = kmPerPx * 110, p = Math.pow(10, Math.floor(Math.log10(target))), m = target / p;
    var nice = (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p, px = nice / kmPerPx;
    scaleEl.style.width = Math.round(px) + 'px';
    scaleEl.textContent = (nice >= 1 ? nice.toLocaleString('en-US') : nice) + ' km';
  }

  // ---------------------------------------------------------------- readout
  var readEl = root.querySelector('.of-read');
  function readout(wx, wy) {
    var lat = y2lat(wy), lon = x2lon(wx), L = MAN.layers[S.layer];
    var r = valueAt(S.layer, wx, wy, Math.max(0, Math.round(view.z)), false);
    var txt = fmtLat(lat) + ', ' + fmtLon(lon) + ' · ';
    if (!r) txt += 'loading…';
    else if (r.none) txt += 'no data this far north or south';
    else if (isNaN(r.v)) txt += 'land or ice shelf';
    else txt += '<b>' + fmtVal(r.v, L.unit) + '</b>' + (r.v >= L.vmax - 1 ? ' or more' : r.v <= -L.vmax + 1 ? ' or less' : '');
    readEl.innerHTML = txt;
  }
  function readoutIdle() {
    readEl.textContent = S.layer === 'vgg' ? 'Point at the map to read the gravity gradient (Eötvös) and the place.' : 'Point at the map to read the gravity anomaly (milligals) and the place.';
  }

  // ---------------------------------------------------------------- pointer, wheel, keys
  var ptrs = {}, dragging = false, drawMode = false, start = null, pinch = null, pendingA = null, moved = 0;
  function rel(e) { var r = mapEl.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function nPtr() { return Object.keys(ptrs).length; }
  mapEl.addEventListener('pointerdown', function (e) {
    if (e.button !== undefined && e.button > 0) return;
    mapEl.setPointerCapture(e.pointerId);
    var p = rel(e);
    ptrs[e.pointerId] = p;
    moved = 0;
    if (nPtr() === 1) {
      start = { p: p, x: view.x, y: view.y, t: Date.now() };
      if (drawMode) {
        var w = screenToWorld(p[0], p[1]);
        if (pendingA) { setProfile(pendingA, w); pendingA = null; }
        else { prof = { a: w, b: w }; start.draw = true; requestDraw(); }
      }
      stopFly();
    } else if (nPtr() === 2) {
      var ks = Object.keys(ptrs), a = ptrs[ks[0]], b = ptrs[ks[1]];
      pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: view.z, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], w: screenToWorld((a[0] + b[0]) / 2, (a[1] + b[1]) / 2) };
      if (start) start.draw = false;
    }
  });
  mapEl.addEventListener('pointermove', function (e) {
    var p = rel(e);
    if (!ptrs[e.pointerId]) {
      if (e.pointerType === 'mouse') { var w0 = screenToWorld(p[0], p[1]); hoverPt = null; readout(w0[0], w0[1]); }
      return;
    }
    var prev = ptrs[e.pointerId];
    moved += Math.abs(p[0] - prev[0]) + Math.abs(p[1] - prev[1]);
    ptrs[e.pointerId] = p;
    if (nPtr() === 2 && pinch) {
      var ks = Object.keys(ptrs), a = ptrs[ks[0]], b = ptrs[ks[1]];
      var d = Math.hypot(a[0] - b[0], a[1] - b[1]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      view.z = pinch.z + Math.log2(d / Math.max(1, pinch.d));
      clampView();
      var s = scl();
      view.x = pinch.w[0] - (m[0] - W / 2) / s; view.y = pinch.w[1] - (m[1] - H / 2) / s;
      clampView(); dragging = true; requestDraw();
      return;
    }
    if (start && start.draw) {
      prof.b = screenToWorld(p[0], p[1]); requestDraw();
      return;
    }
    if (start && moved > 3) {
      var s2 = scl();
      dragging = true;
      view.x = start.x - (p[0] - start.p[0]) / s2; view.y = start.y - (p[1] - start.p[1]) / s2;
      clampView(); requestDraw();
    }
  });
  function endPtr(e) {
    if (!ptrs[e.pointerId]) return;
    var p = ptrs[e.pointerId];
    delete ptrs[e.pointerId];
    if (nPtr() === 1) { var k = Object.keys(ptrs)[0]; start = { p: ptrs[k], x: view.x, y: view.y, t: Date.now() }; pinch = null; return; }
    if (nPtr() > 0) return;
    pinch = null;
    if (start && start.draw) {
      var a = worldToScreen(prof.a[0], prof.a[1]), b = worldToScreen(prof.b[0], prof.b[1]);
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) > 12) setProfile(prof.a, prof.b);
      else { pendingA = prof.a; setStatus('Now tap or click where the line should end.'); }
    } else if (!dragging && moved <= 6) {
      var w = screenToWorld(p[0], p[1]);
      hoverPt = w; readout(w[0], w[1]); requestDraw();
    }
    start = null; dragging = false;
  }
  mapEl.addEventListener('pointerup', endPtr);
  mapEl.addEventListener('pointercancel', endPtr);
  mapEl.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !nPtr()) readoutIdle(); });
  mapEl.addEventListener('wheel', function (e) {
    e.preventDefault();
    var p = rel(e), dz = -e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0022);
    zoomAt(p[0], p[1], view.z + Math.max(-1, Math.min(1, dz)));
  }, { passive: false });
  mapEl.addEventListener('dblclick', function (e) { var p = rel(e); if (!drawMode) zoomAt(p[0], p[1], view.z + 1, true); });
  function zoomAt(px, py, z, anim) {
    var w = screenToWorld(px, py);
    if (anim && !RM) {
      var z0 = view.z, t0 = performance.now();
      stopFly();
      var step = function (now) {
        var t = Math.min(1, (now - t0) / 220);
        view.z = z0 + (z - z0) * t; clampView();
        var s = scl(); view.x = w[0] - (px - W / 2) / s; view.y = w[1] - (py - H / 2) / s; clampView(); draw();
        if (t < 1) fly = requestAnimationFrame(step); else fly = 0;
      };
      fly = requestAnimationFrame(step);
      return;
    }
    view.z = z; clampView();
    var s = scl();
    view.x = w[0] - (px - W / 2) / s; view.y = w[1] - (py - H / 2) / s;
    clampView(); requestDraw();
  }
  mapEl.addEventListener('keydown', function (e) {
    var s = scl(), step = Math.min(W, H) / 6 / s, used = true;
    switch (e.key) {
      case 'ArrowLeft': view.x -= step; break;
      case 'ArrowRight': view.x += step; break;
      case 'ArrowUp': view.y -= step; break;
      case 'ArrowDown': view.y += step; break;
      case '+': case '=': zoomAt(W / 2, H / 2, view.z + 0.5); break;
      case '-': case '_': zoomAt(W / 2, H / 2, view.z - 0.5); break;
      case '0': resetView(); break;
      default: used = false;
    }
    if (used) { e.preventDefault(); clampView(); requestDraw(); var c = screenToWorld(W / 2, H / 2); readout(c[0], c[1]); }
  });
  mapEl.addEventListener('focus', function () { var c = screenToWorld(W / 2, H / 2); readout(c[0], c[1]); });

  // ---------------------------------------------------------------- flying (tour and region buttons)
  var fly = 0;
  function stopFly() { if (fly) { cancelAnimationFrame(fly); fly = 0; } }
  function flyTo(lon, lat, z, done) {
    stopFly();
    var x0 = view.x, y0 = view.y, z0 = view.z, x1 = lon2x(lon), y1 = lat2y(lat);
    var dx = x1 - x0; if (dx > 0.5) dx -= 1; if (dx < -0.5) dx += 1;
    var dist = Math.hypot(dx, y1 - y0), bump = Math.min(4, Math.max(0, Math.log2(1 + dist * 6) + Math.max(z0, z) - 3.5));
    if (RM) { view.x = x0 + dx; view.y = y1; view.z = z; clampView(); requestDraw(); if (done) done(); return; }
    var t0 = performance.now(), dur = 900 + Math.min(1400, dist * 3000);
    var step = function (now) {
      var t = Math.min(1, (now - t0) / dur), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      view.x = x0 + dx * e; view.y = y0 + (y1 - y0) * e; view.z = z0 + (z - z0) * e - bump * 4 * e * (1 - e);
      clampView(); draw();
      if (t < 1) fly = requestAnimationFrame(step); else { fly = 0; if (done) done(); }
    };
    fly = requestAnimationFrame(step);
  }
  function resetView() { flyTo(-150, 10, Math.max(zMin(), Math.log2(H / (256 * 0.8)))); }

  // ---------------------------------------------------------------- toolbar
  function pressGroup(sel, val, attr) {
    root.querySelectorAll(sel).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === val)); });
  }
  var conEl = root.querySelector('.of-con'), conOut = root.querySelector('.of-con-out');
  function syncControls() {
    pressGroup('[data-layer]', S.layer, 'data-layer');
    pressGroup('[data-scale]', S.scale, 'data-scale');
    var L = MAN.layers[S.layer];
    conEl.min = 10; conEl.max = S.layer === 'vgg' ? 200 : 300; conEl.step = 5; conEl.value = S.con[S.layer];
    conOut.textContent = '±' + S.con[S.layer] + ' ' + L.unit;
    drawLegend();
  }
  function recolor() { version++; requestDraw(); drawLegend(); cmpPaint(); }
  root.querySelectorAll('[data-layer]').forEach(function (b) {
    b.addEventListener('click', function () { S.layer = b.getAttribute('data-layer'); saveSettings(); syncControls(); requestDraw(); readoutIdle(); });
  });
  root.querySelectorAll('[data-scale]').forEach(function (b) {
    b.addEventListener('click', function () { S.scale = b.getAttribute('data-scale'); saveSettings(); syncControls(); recolor(); });
  });
  conEl.addEventListener('input', function () { S.con[S.layer] = +conEl.value; conOut.textContent = '±' + conEl.value + ' ' + MAN.layers[S.layer].unit; recolor(); });
  root.querySelector('.of-zin').addEventListener('click', function () { zoomAt(W / 2, H / 2, view.z + 1, true); });
  root.querySelector('.of-zout').addEventListener('click', function () { zoomAt(W / 2, H / 2, view.z - 1, true); });
  root.querySelector('.of-reset').addEventListener('click', function () { closeTour(); resetView(); });

  var legCv = root.querySelector('.of-leg-cv'), legLo = root.querySelector('.of-leg-lo'), legHi = root.querySelector('.of-leg-hi'), legMid = root.querySelector('.of-leg-mid');
  function drawLegend() {
    if (!legCv || !MAN) return;
    var w = legCv.width = 256, h = legCv.height = 1, cx = legCv.getContext('2d'), img = cx.createImageData(w, h), st = SCALES[S.scale];
    for (var i = 0; i < w; i++) { var c = ramp(st, i / (w - 1)); img.data[i * 4] = c[0]; img.data[i * 4 + 1] = c[1]; img.data[i * 4 + 2] = c[2]; img.data[i * 4 + 3] = 255; }
    cx.putImageData(img, 0, 0);
    var u = MAN.layers[S.layer].unit, C = S.con[S.layer];
    legLo.textContent = '−' + C + ' ' + u; legHi.textContent = '+' + C + ' ' + u;
    legMid.textContent = S.layer === 'vgg' ? '0: average' : '0: normal gravity';
  }

  // ---------------------------------------------------------------- tour and regions
  var card = root.querySelector('.of-tour'), cardH = card.querySelector('.of-tour-h'), cardP = card.querySelector('.of-tour-p'), cardN = card.querySelector('.of-tour-n');
  var TOUR = (CFG.tour || []).filter(function (s) { return MAN === null || regionById(s.id); });
  function regionById(id) { if (!MAN) return null; for (var i = 0; i < MAN.regions.length; i++) if (MAN.regions[i].id === id) return MAN.regions[i]; return null; }
  function showStop(i, focus) {
    TOUR = (CFG.tour || []).filter(function (s) { return regionById(s.id); });
    if (!TOUR.length) return;
    tourIdx = (i + TOUR.length) % TOUR.length;
    var st = TOUR[tourIdx], r = regionById(st.id), v = r.view;
    var z = v[2] - (W < 600 ? 0.7 : 0);
    card.hidden = false;
    cardN.textContent = 'Stop ' + (tourIdx + 1) + ' of ' + TOUR.length;
    cardH.textContent = st.title; cardP.textContent = st.text;
    root.querySelectorAll('.of-reg').forEach(function (b) { b.setAttribute('aria-current', String(b.getAttribute('data-r') === st.id)); });
    var lon = v[0];
    if (W >= 700) lon -= (Math.min(360, W * 0.35) / 2 + 10) / (256 * Math.pow(2, z)) * 360;   // keep the region clear of the card
    flyTo(lon, v[1], z);
    if (focus) cardH.focus({ preventScroll: true });
  }
  function closeTour() { card.hidden = true; tourIdx = -1; root.querySelectorAll('.of-reg').forEach(function (b) { b.setAttribute('aria-current', 'false'); }); }
  root.querySelector('.of-tourbtn').addEventListener('click', function () { showStop(tourIdx < 0 ? 0 : tourIdx, true); });
  card.querySelector('.of-tour-next').addEventListener('click', function () { showStop(tourIdx + 1); });
  card.querySelector('.of-tour-prev').addEventListener('click', function () { showStop(tourIdx - 1); });
  card.querySelector('.of-tour-x').addEventListener('click', function () { closeTour(); root.querySelector('.of-tourbtn').focus(); });
  root.querySelectorAll('.of-reg').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-r'), list = (CFG.tour || []).filter(function (s) { return regionById(s.id); });
      for (var i = 0; i < list.length; i++) if (list[i].id === id) { showStop(i); break; }
      mapEl.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' });
    });
  });
  card.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeTour(); root.querySelector('.of-tourbtn').focus(); } });

  // ---------------------------------------------------------------- profile
  var pBox = root.querySelector('.of-prof'), pCv = root.querySelector('.of-prof-cv'), pSum = root.querySelector('.of-prof-sum');
  var pBtn = root.querySelector('.of-drawbtn'), statusEl = root.querySelector('.of-status');
  var pData = null;
  function setStatus(t) { statusEl.textContent = t; }
  pBtn.addEventListener('click', function () {
    drawMode = !drawMode; pendingA = null;
    pBtn.setAttribute('aria-pressed', String(drawMode));
    wrap.classList.toggle('drawing', drawMode);
    setStatus(drawMode ? 'Drawing mode: drag across the map to draw a line (or tap its two ends). Press the button again to pan.' : '');
    if (drawMode) mapEl.focus({ preventScroll: true });
  });
  root.querySelectorAll('.of-preset').forEach(function (b) {
    b.addEventListener('click', function () {
      var P = (CFG.profiles || [])[+b.getAttribute('data-i')];
      if (!P) return;
      var A = [lon2x(P.a[0]), lat2y(P.a[1])], B = [lon2x(P.b[0]), lat2y(P.b[1])];
      setProfile(A, B);
      var mx = (P.a[0] + P.b[0]) / 2, my = (P.a[1] + P.b[1]) / 2;
      var span = Math.max(Math.abs(A[0] - B[0]), Math.abs(A[1] - B[1]));
      flyTo(mx, my, Math.max(1, Math.min(6, Math.log2(Math.min(W, H) * 0.7 / 256 / Math.max(span, 1e-4)))));
    });
  });
  root.querySelector('.of-prof-x').addEventListener('click', function () { prof = null; pData = null; profHover = null; pBox.hidden = true; requestDraw(); pBtn.focus(); });
  function setProfile(a, b) {
    var dx = b[0] - a[0]; if (dx > 0.5) b = [b[0] - 1, b[1]]; if (dx < -0.5) b = [b[0] + 1, b[1]];
    prof = { a: a, b: b };
    pBox.hidden = false;
    requestDraw();
    computeProfile();
    if (drawMode) { drawMode = false; pBtn.setAttribute('aria-pressed', 'false'); wrap.classList.remove('drawing'); }
    setStatus('');
  }
  function bestZ(lk, wx, wy) {
    wx = ((wx % 1) + 1) % 1;
    for (var z = zmaxOf(lk); z >= 0; z--) { var n = 1 << z; if (hasTile(lk, z, Math.floor(wx * n), Math.floor(wy * n))) return z; }
    return -1;
  }
  function computeProfile() {
    var N = 360, pts = [], need = {}, lks = ['vgg', 'grav'], i, j;
    for (i = 0; i <= N; i++) {
      var t = i / N, wx = prof.a[0] + (prof.b[0] - prof.a[0]) * t, wy = prof.a[1] + (prof.b[1] - prof.a[1]) * t;
      pts.push([wx, wy]);
      for (j = 0; j < 2; j++) {
        var z = bestZ(lks[j], wx, wy);
        if (z < 0) continue;
        var n = 1 << z, x = ((wx % 1) + 1) % 1;
        need[key(lks[j], z, Math.floor(x * n), Math.floor(wy * n))] = [lks[j], z, Math.floor(x * n), Math.floor(wy * n)];
      }
    }
    var ps = Object.keys(need).map(function (k) { var a = need[k]; return getTile(a[0], a[1], a[2], a[3]).p; });
    var my = prof;
    pSum.textContent = 'Reading the tiles…';
    Promise.all(ps).then(function () {
      if (prof !== my) return;
      var d = 0, ll = [], out = { d: [], vgg: [], grav: [], pts: pts, zv: 0 };
      for (i = 0; i <= N; i++) {
        var w = pts[i], g = [x2lon(w[0]), y2lat(w[1])];
        if (i) d += hav(ll, g);
        ll = g;
        out.d.push(d);
        var rv = valueAt('vgg', w[0], w[1], 99, false), rg = valueAt('grav', w[0], w[1], 99, false);
        out.vgg.push(rv ? rv.v : NaN); out.grav.push(rg ? rg.v : NaN);
        if (rv) out.zv = Math.max(out.zv, rv.z);
      }
      pData = out; drawProfile(); summary();
    });
  }
  function range(a) { var lo = Infinity, hi = -Infinity; a.forEach(function (v) { if (!isNaN(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }); return lo === Infinity ? null : [lo, hi]; }
  function summary() {
    var rv = range(pData.vgg), rg = range(pData.grav), L = pData.d[pData.d.length - 1];
    var t = 'Line A to B: ' + Math.round(L).toLocaleString('en-US') + ' km. ';
    if (rv) t += 'Gravity gradient from ' + fmtVal(rv[0], 'E') + ' to ' + fmtVal(rv[1], 'E') + '. ';
    if (rg) t += 'Gravity anomaly from ' + fmtVal(rg[0], 'mGal') + ' to ' + fmtVal(rg[1], 'mGal') + '. ';
    if (!rv) t += 'The line crosses only land.';
    else if (pData.zv < 5) t += 'Outside the featured regions the map is coarse, so small features are smoothed out.';
    pSum.textContent = t;
  }
  function nice(lo, hi) {
    var span = hi - lo || 1, st = Math.pow(10, Math.floor(Math.log10(span / 4))), m = span / 4 / st;
    st *= m > 5 ? 10 : m > 2 ? 5 : m > 1 ? 2 : 1;
    return { lo: Math.floor(lo / st) * st, hi: Math.ceil(hi / st) * st, st: st };
  }
  var pHoverI = -1;
  function drawProfile() {
    if (!pData || pBox.hidden) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1), w = pCv.clientWidth, h = pCv.clientHeight;
    pCv.width = Math.round(w * dpr); pCv.height = Math.round(h * dpr);
    var c = pCv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    var ink = css('--of-ink'), dim = css('--of-dim'), grid = css('--of-grid'), cv = css('--of-g'), cg = css('--of-gold');
    var m = { l: 46, r: 52, t: 14, b: 30 }, pw = w - m.l - m.r, ph = h - m.t - m.b;
    var D = pData.d[pData.d.length - 1] || 1;
    var rv = range(pData.vgg) || [-1, 1], rg = range(pData.grav) || [-1, 1];
    var nv = nice(Math.min(rv[0], 0), Math.max(rv[1], 0)), ng = nice(Math.min(rg[0], 0), Math.max(rg[1], 0));
    function X(d) { return m.l + d / D * pw; }
    function Yv(v) { return m.t + (1 - (v - nv.lo) / (nv.hi - nv.lo)) * ph; }
    function Yg(v) { return m.t + (1 - (v - ng.lo) / (ng.hi - ng.lo)) * ph; }
    c.font = '11px system-ui, sans-serif'; c.lineWidth = 1;
    // land stretches
    c.fillStyle = landCSS();
    for (var i = 0; i < pData.d.length; i++) if (isNaN(pData.vgg[i])) { var x0 = X(pData.d[Math.max(0, i - 1)]), x1 = X(pData.d[Math.min(pData.d.length - 1, i + 1)]); c.fillRect(x0, m.t, x1 - x0, ph); }
    // grid and left axis (VGG)
    c.strokeStyle = grid; c.fillStyle = cv; c.textAlign = 'right'; c.textBaseline = 'middle';
    for (var v = nv.lo; v <= nv.hi + 1e-9; v += nv.st) {
      var y = Yv(v); c.beginPath(); c.moveTo(m.l, y); c.lineTo(m.l + pw, y); c.stroke();
      c.fillText(String(Math.round(v)).replace('-', '−'), m.l - 5, y);
    }
    c.save(); c.translate(11, m.t + ph / 2); c.rotate(-Math.PI / 2); c.textAlign = 'center'; c.fillText('Gradient (E)', 0, 0); c.restore();
    // right axis (gravity)
    c.fillStyle = cg; c.textAlign = 'left';
    for (var g = ng.lo; g <= ng.hi + 1e-9; g += ng.st) c.fillText(String(Math.round(g)).replace('-', '−'), m.l + pw + 5, Yg(g));
    c.save(); c.translate(w - 9, m.t + ph / 2); c.rotate(Math.PI / 2); c.textAlign = 'center'; c.fillText('Gravity (mGal)', 0, 0); c.restore();
    // zero line
    c.strokeStyle = dim; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(m.l, Yv(0)); c.lineTo(m.l + pw, Yv(0)); c.stroke(); c.setLineDash([]);
    // x axis
    c.fillStyle = dim; c.textAlign = 'center'; c.textBaseline = 'top';
    var nx = nice(0, D);
    for (var dd = 0; dd <= D + 1e-9; dd += nx.st) c.fillText(Math.round(dd).toLocaleString('en-US'), X(dd), m.t + ph + 4);
    c.textAlign = 'right'; c.fillText('km from A', m.l + pw, m.t + ph + 16);
    c.textAlign = 'left'; c.fillText('A', m.l, m.t + ph + 16);
    function line(arr, Y, col, wd) {
      c.strokeStyle = col; c.lineWidth = wd; c.lineJoin = 'round'; c.beginPath();
      var pen = false;
      for (var i = 0; i < arr.length; i++) {
        if (isNaN(arr[i])) { pen = false; continue; }
        var x = X(pData.d[i]), y = Y(arr[i]);
        if (pen) c.lineTo(x, y); else { c.moveTo(x, y); pen = true; }
      }
      c.stroke();
    }
    line(pData.grav, Yg, cg, 1.6);
    line(pData.vgg, Yv, cv, 2);
    c.strokeStyle = ink; c.lineWidth = 1; c.strokeRect(m.l, m.t, pw, ph);
    if (pHoverI >= 0) {
      var hx = X(pData.d[pHoverI]);
      c.strokeStyle = ink; c.beginPath(); c.moveTo(hx, m.t); c.lineTo(hx, m.t + ph); c.stroke();
    }
    pCv._m = m; pCv._pw = pw; pCv._D = D;
  }
  var pRead = root.querySelector('.of-prof-read');
  function profHoverAt(clientX) {
    if (!pData || !pCv._m) return;
    var r = pCv.getBoundingClientRect(), x = clientX - r.left - pCv._m.l, d = Math.max(0, Math.min(1, x / pCv._pw)) * pCv._D;
    var i = 0; while (i < pData.d.length - 1 && pData.d[i] < d) i++;
    pHoverI = i; profHover = pData.pts[i];
    var v = pData.vgg[i], g = pData.grav[i];
    pRead.textContent = Math.round(pData.d[i]) + ' km from A: ' + (isNaN(v) ? 'land' : 'gradient ' + fmtVal(v, 'E') + ', gravity ' + fmtVal(g, 'mGal'));
    drawProfile(); requestDraw();
  }
  pCv.addEventListener('pointermove', function (e) { profHoverAt(e.clientX); });
  pCv.addEventListener('pointerdown', function (e) { profHoverAt(e.clientX); });
  pCv.addEventListener('pointerleave', function () { pHoverI = -1; profHover = null; pRead.textContent = ''; drawProfile(); requestDraw(); });

  // ---------------------------------------------------------------- before and after
  var cmp = document.querySelector('.of-cmp'), cmpData = {}, cmpCur = null;
  function cmpPaint() {
    if (!cmp || !cmpCur || !cmpData[cmpCur]) return;
    var D = cmpData[cmpCur];
    ['v33', 'swot'].forEach(function (s) {
      var cv = cmp.querySelector('.of-cmp-' + s);
      cv.width = D.w; cv.height = D.h;
      var cx = cv.getContext('2d'), img = cx.createImageData(D.w, D.h);
      var keep = S.con.vgg;
      S.con.vgg = 40;                         // the swipe uses one fixed contrast, so both sides match
      colorize(D[s], D.w, D.h, 'vgg', img);
      S.con.vgg = keep;
      cx.putImageData(img, 0, 0);
    });
    cmp.querySelector('.of-cmp-stage').style.aspectRatio = D.w + ' / ' + D.h;
  }
  function cmpShow(id) {
    cmpCur = id;
    cmp.querySelectorAll('[data-cmp]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-cmp') === id)); });
    var meta = null; MAN.compare.forEach(function (c) { if (c.id === id) meta = c; });
    var bx = meta.box, km = (bx[2] - bx[0]) * 111.32 * Math.cos((bx[1] + bx[3]) / 2 / R2D);
    var bar = cmp.querySelector('.of-cmp-scale'), pct = 100 / km * 100;
    bar.style.width = pct + '%'; bar.textContent = '100 km';
    cmp.querySelector('.of-cmp-where').textContent = meta.name + ': ' + fmtLat((bx[1] + bx[3]) / 2).replace('.00', '') + ', ' + fmtLon((bx[0] + bx[2]) / 2).replace('.00', '') + ', about ' + Math.round(km / 10) * 10 + ' km across.';
    if (cmpData[id]) { cmpPaint(); return; }
    Promise.all([loadCodes(BASE + 'compare/' + id + '-v33.png'), loadCodes(BASE + 'compare/' + id + '-swot.png')]).then(function (r) {
      cmpData[id] = { v33: r[0].codes, swot: r[1].codes, w: r[0].w, h: r[0].h };
      if (cmpCur === id) cmpPaint();
    });
  }
  function cmpSet(p) {
    p = Math.max(0, Math.min(100, p));
    cmp.querySelector('.of-cmp-swot').style.clipPath = 'inset(0 0 0 ' + p + '%)';
    cmp.querySelector('.of-cmp-line').style.left = p + '%';
    var rg = cmp.querySelector('.of-cmp-range');
    if (+rg.value !== Math.round(p)) rg.value = Math.round(p);
  }
  function cmpInit() {
    if (!cmp || !MAN.compare) return;
    cmp.querySelectorAll('[data-cmp]').forEach(function (b) { b.addEventListener('click', function () { cmpShow(b.getAttribute('data-cmp')); }); });
    var rg = cmp.querySelector('.of-cmp-range'), stage = cmp.querySelector('.of-cmp-stage'), down = false;
    rg.addEventListener('input', function () { cmpSet(+rg.value); });
    function at(e) { var r = stage.getBoundingClientRect(); cmpSet((e.clientX - r.left) / r.width * 100); }
    stage.addEventListener('pointerdown', function (e) { down = true; stage.setPointerCapture(e.pointerId); at(e); });
    stage.addEventListener('pointermove', function (e) { if (down) at(e); });
    stage.addEventListener('pointerup', function () { down = false; });
    stage.addEventListener('pointercancel', function () { down = false; });
    cmpSet(50);
    cmpShow(MAN.compare[0].id);
  }

  // ---------------------------------------------------------------- start
  function themeChanged() { version++; requestDraw(); drawLegend(); cmpPaint(); drawProfile(); }
  new MutationObserver(themeChanged).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  if (document.body) new MutationObserver(themeChanged).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  if (window.matchMedia) { var mq = matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', themeChanged); }

  fetch(BASE + 'manifest.json').then(function (r) { return r.json(); }).then(function (m) {
    MAN = m;
    Object.keys(m.layers).forEach(function (lk) {
      var L = m.layers[lk];
      L.dec = decoder(L);
      Object.keys(L.tiles).forEach(function (z) { L.tiles[z].forEach(function (t) { avail[key(lk, +z, t[0], t[1])] = 1; }); });
    });
    if (!m.layers[S.layer]) S.layer = 'vgg';
    root.classList.add('ready');
    syncControls(); readoutIdle();
    if (window.ResizeObserver) new ResizeObserver(function () { resize(); drawProfile(); }).observe(mapEl);
    else window.addEventListener('resize', function () { resize(); drawProfile(); });
    resize();
    view.z = Math.max(zMin(), Math.log2(H / (256 * 0.8))); clampView(); requestDraw();
    cmpInit();
  }).catch(function () {
    readEl.textContent = 'The map data could not be loaded. Please reload the page.';
  });
})();
