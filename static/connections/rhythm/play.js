/* The Rhythm of Numbers, chapter VI: poly (the polyrhythm layerer), drums (the Euclidean drum machine), compose
   (Compose a piece: piano roll, MIDI and WAV download, share link). Conventions: core.js.
   RN.writeMidi(tracks, bpm) -> Uint8Array: a Standard MIDI File, format 1, 480 ticks per beat.
     tracks: [{ name, ch, program, notes: [[startBeat, lengthBeats, midi, velocity 1-127], …] }] */
(function (RN) {
  'use strict';
  var $ = RN.$, c = RN.c, F = RN.font, gcd = RN.gcd, D = document;
  var lcm = function (a, b) { return a / gcd(a, b) * b; };
  /* convergent levels of [0; a1, a2, …]: level lv has k hits in n beats (n = block length) */
  function levelsOf(terms, maxN) {
    var out = [], Q = [1, 1], P = [1, 0];
    for (var n = 1; n <= terms.length; n++) { var a = terms[n - 1], reps = n === 1 ? a - 1 : a, q = reps * Q[n] + Q[n - 1], p = reps * P[n] + P[n - 1]; Q.push(q); P.push(p); if (q > maxN) break; out.push({ lv: n, k: p, n: q }); }
    return out;
  }
  var chris = function (k, n) { var o = []; for (var i = 0; i < n; i++) o.push(Math.floor((i + 1) * k / n) > Math.floor(i * k / n) ? 1 : 0); return o; };
  var cfStr = function (n, k) { if (!k) return '—'; var t = [], a = n, b = k; while (b) { t.push(Math.floor(a / b)); var r = a % b; a = b; b = r; } return '[' + t[0] + (t.length > 1 ? '; ' + t.slice(1).join(', ') : '') + ']'; };
  var VOICE_OPTS = RN.VOICES.concat([['d:kick', 'Kick drum'], ['d:snare', 'Snare'], ['d:hat', 'Hi-hat'], ['d:bell', 'Bell']]);
  function sel(opts, val, label) { var s = D.createElement('select'); s.setAttribute('aria-label', label); opts.forEach(function (o) { var e = D.createElement('option'); e.value = o[0]; e.textContent = o[1]; s.append(e); }); s.value = val; return s; }
  function btn(text, cls, label) { var b = D.createElement('button'); b.type = 'button'; b.className = cls || 'rn-ghost'; b.textContent = text; if (label) b.setAttribute('aria-label', label); return b; }
  var COLS = ['--rn-g', '--rn-prime', '--rn-violet', '--rn-teal', '--rn-rose', '--rn-blue'];

  /* ================= 20 the polyrhythm layerer ================= */
  var PL = { tracks: [], ev: [], head: -1, T: 5, angle: 0, P: null };
  function plSources() {
    var s = $('plSrc'); s.innerHTML = '';
    var o = D.createElement('option'); o.value = 'bar'; o.textContent = 'the bar’s number'; s.append(o);
    Object.keys(RN.CONST).forEach(function (k) { var e = D.createElement('option'); e.value = k; e.textContent = RN.CONST[k].name; s.append(e); });
    var e2 = D.createElement('option'); e2.value = 'own'; e2.textContent = 'my own pulses and slots'; s.append(e2);
  }
  function plTerms(src) { return src === 'bar' ? RN.W.allTerms : RN.CONST[src].t; }
  function plLevels() {
    var src = $('plSrc').value, lvs = $('plLv'), own = src === 'own';
    $('plOwn').hidden = !own; lvs.parentNode.hidden = own; lvs.innerHTML = '';
    if (own) return;
    levelsOf(plTerms(src), 240).forEach(function (L) { if (L.n < 2) return; var o = D.createElement('option'); o.value = L.k + '/' + L.n; o.textContent = L.lv + ': ' + L.k + ' in ' + L.n; lvs.append(o); });
    if (lvs.options.length) lvs.selectedIndex = Math.min(lvs.options.length - 1, 2);
  }
  function plName(src) { return src === 'bar' ? RN.W.name : src === 'own' ? 'own' : RN.CONST[src].name; }
  function plAdd(k, n, name, voice) {
    if (PL.tracks.length >= 6) { $('rn-live').textContent = 'Six tracks is the most. Remove one first.'; return; }
    n = Math.max(1, Math.min(240, n | 0)); k = Math.max(1, Math.min(n, k | 0));
    var i = PL.tracks.length;
    PL.tracks.push({ k: k, n: n, name: name, voice: voice || ['mallet', 'pluck', 'organ', 'd:bell', 'sine', 'd:hat'][i % 6], mute: false, solo: false, deg: [0, 4, 2, 7, 9, 5][i % 6], col: COLS[i % 6], pat: chris(k, n) });
    plRender(); plEvents(); plDraw();
  }
  function plRender() {
    var box = $('plTracks'); box.innerHTML = '';
    if (!PL.tracks.length) { var p = D.createElement('p'); p.className = 'rn-small'; p.textContent = 'No tracks yet. Add one above, or press a Remix button.'; box.append(p); }
    PL.tracks.forEach(function (t, i) {
      var row = D.createElement('div'); row.className = 'rn-track'; row.style.setProperty('--c', 'var(' + t.col + ')');
      var sw = D.createElement('span'); sw.className = 'rn-sw'; sw.setAttribute('aria-hidden', 'true');
      var b = D.createElement('b'); b.textContent = t.k + ' in ' + t.n;
      var cf = D.createElement('span'); cf.className = 'rn-cf'; cf.textContent = t.name + ' · ' + t.n + '/' + t.k + ' = ' + cfStr(t.n, t.k) + (gcd(t.k, t.n) === 1 ? ' · coprime' : ' · share ' + gcd(t.k, t.n));
      var vs = sel(VOICE_OPTS, t.voice, 'Voice for track ' + (i + 1)); vs.addEventListener('change', function () { t.voice = vs.value; });
      var mu = btn('Mute', 'rn-ghost rn-mute', 'Mute track ' + (i + 1)); mu.setAttribute('aria-pressed', String(t.mute)); mu.addEventListener('click', function () { t.mute = !t.mute; mu.setAttribute('aria-pressed', String(t.mute)); plDraw(); });
      var so = btn('Solo', 'rn-ghost', 'Solo track ' + (i + 1)); so.setAttribute('aria-pressed', String(t.solo)); so.addEventListener('click', function () { t.solo = !t.solo; so.setAttribute('aria-pressed', String(t.solo)); plDraw(); });
      var rm = btn('✕', 'rn-ghost', 'Remove track ' + (i + 1)); rm.addEventListener('click', function () { PL.tracks.splice(i, 1); PL.tracks.forEach(function (tt, j) { tt.col = COLS[j % 6]; }); plRender(); plEvents(); plDraw(); });
      row.append(sw, b, cf, vs, mu, so, rm); box.append(row);
    });
  }
  /* one turn as a list of moments: each moment is a time (0..1 of a turn) and the tracks that hit then */
  function plEvents() {
    var m = {};
    PL.tracks.forEach(function (t, ti) { for (var i = 0; i < t.n; i++) if (t.pat[i]) { var key = (i / t.n).toFixed(9); (m[key] = m[key] || { f: i / t.n, hits: [] }).hits.push([ti, i]); } });
    var ev = Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return a.f - b.f; });
    if (!ev.length || ev[0].f > 0) ev.unshift({ f: 0, hits: [] });
    PL.ev = ev;
  }
  function audible(t) { var anySolo = PL.tracks.some(function (x) { return x.solo; }); return anySolo ? t.solo : !t.mute; }
  function plDraw() {
    var cv = $('plCan'), w0 = cv.clientWidth, r = RN.setup(cv, Math.min(Math.max(300, w0), 460)), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var cx = w / 2, cy = H / 2, R0 = Math.min(w, H) / 2 - 14, nT = PL.tracks.length, f = PL.head >= 0 && PL.ev[PL.head] ? PL.ev[PL.head].f : -1;
    var rot = ($('plFollow').checked && f >= 0 && !RN.reduced) ? -2 * Math.PI * f : 0;
    var ang = function (fr) { return -Math.PI / 2 + 2 * Math.PI * fr + rot; };
    if (!nT) { x.fillStyle = c('--rn-muted'); x.font = F(13); x.textAlign = 'center'; x.fillText('Add a track to begin', cx, cy); return; }
    var nowHits = {}; if (f >= 0) PL.ev[PL.head].hits.forEach(function (h) { nowHits[h[0] + ',' + h[1]] = 1; });
    PL.tracks.forEach(function (t, ti) {
      var R = R0 * (1 - ti * 0.75 / Math.max(nT, 1) * (nT > 1 ? 1 : 0)), on = audible(t), col = c(t.col);
      x.strokeStyle = c('--rn-line'); x.lineWidth = 1; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
      x.globalAlpha = on ? 1 : 0.3;
      var pts = []; for (var i = 0; i < t.n; i++) if (t.pat[i]) pts.push([cx + R * Math.cos(ang(i / t.n)), cy + R * Math.sin(ang(i / t.n))]);
      if (pts.length > 1) { x.strokeStyle = col; x.globalAlpha = on ? 0.35 : 0.12; x.beginPath(); pts.forEach(function (p, j) { if (j) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]); }); x.closePath(); x.stroke(); x.globalAlpha = on ? 1 : 0.3; }
      for (i = 0; i < t.n; i++) {
        var a = ang(i / t.n), hit = t.pat[i], now = nowHits[ti + ',' + i];
        x.fillStyle = hit ? col : c('--rn-muted'); x.beginPath(); x.arc(cx + R * Math.cos(a), cy + R * Math.sin(a), hit ? (now ? 7 : t.n > 60 ? 3 : 5) : (t.n > 60 ? 0.9 : 1.6), 0, 7); x.fill();
        if (now) { x.strokeStyle = c('--rn-ink'); x.lineWidth = 2; x.stroke(); x.lineWidth = 1; }
      }
      x.globalAlpha = 1;
    });
    if (f >= 0) { var a2 = ang(f); x.strokeStyle = c('--rn-ink'); x.lineWidth = 2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + (R0 + 8) * Math.cos(a2), cy + (R0 + 8) * Math.sin(a2)); x.stroke(); x.lineWidth = 1; }
  }
  function plVoice(t, when) {
    if (t.voice.indexOf('d:') === 0) { RN.drum(t.voice.slice(2), when, 0.8); return; }
    RN.voice(t.voice, when, RN.mtof(RN.degree(t.deg, 60)), Math.min(0.5, PL.T / t.n * 0.9), 0.22);
  }
  function plPreset(list) { PL.tracks = []; list.forEach(function (a) { plAdd(a[0], a[1], a[2], a[3]); }); }
  function deepest(key, maxN) { var L = levelsOf(RN.CONST[key].t, maxN), x = L[L.length - 1]; return [x.k, x.n, RN.CONST[key].name]; }
  RN.def('poly', {
    init: function () {
      /* "my own" inputs, built here so the page has them only when the instrument runs */
      var own = D.createElement('span'); own.id = 'plOwn'; own.hidden = true; own.className = 'rn-controls';
      own.innerHTML = '<label for="plK">pulses <input id="plK" type="number" min="1" max="240" value="3"></label><label for="plN">slots <input id="plN" type="number" min="1" max="240" value="4"></label>';
      $('plLv').parentNode.after(own);
      plSources(); plLevels();
      $('plSrc').addEventListener('change', plLevels);
      $('plAdd').addEventListener('click', function () {
        var src = $('plSrc').value;
        if (src === 'own') { var n = +$('plN').value, k = +$('plK').value; plAdd(k, n, k === n ? k + ' even beats' : 'own'); return; }
        var v = ($('plLv').value || '1/7').split('/'); plAdd(+v[0], +v[1], plName(src));
      });
      $('plLoop').addEventListener('input', function () { PL.T = +$('plLoop').value; $('plLoopV').textContent = PL.T + ' s'; });
      $('plFollow').addEventListener('change', plDraw);
      if (RN.reduced) { $('plFollow').checked = false; $('plFollow').parentNode.title = 'Turned off because your device asks for reduced motion; you can still turn it on.'; }
      $('plPi').addEventListener('click', function () { plPreset([[1, 7, 'π − 3, level 1'], [15, 106, 'π − 3, level 2'], [16, 113, 'π − 3, level 3']]); });
      $('plConst').addEventListener('click', function () { plPreset([[16, 113, 'π − 3', 'mallet'], deepest('e', 120).concat(['pluck']), deepest('phi', 120).concat(['organ'])]); });
      $('plThree').addEventListener('click', function () { plPreset([[3, 3, '3 even beats', 'd:kick'], [4, 4, '4 even beats', 'mallet'], [5, 5, '5 even beats', 'd:bell']]); });
      /* orbits in resonance (Chapter 18 of the paper): turns made in the same time, one ring each */
      $('plMoons').addEventListener('click', function () { plPreset([[4, 4, 'Io: 4 turns', 'mallet'], [2, 2, 'Europa: 2 turns', 'pluck'], [1, 1, 'Ganymede: 1 turn', 'd:bell']]); });
      $('plHD').addEventListener('click', function () { plPreset([[54, 54, 'planet b: 54 turns', 'd:hat'], [36, 36, 'c: 36', 'mallet'], [24, 24, 'd: 24', 'pluck'], [16, 16, 'e: 16', 'sine'], [12, 12, 'f: 12', 'organ'], [9, 9, 'g: 9', 'd:bell']]); });
      $('plTrap').addEventListener('click', function () { plPreset([[24, 24, 'planet b: about 24 turns', 'd:hat'], [15, 15, 'c: 15', 'mallet'], [9, 9, 'd: 9', 'pluck'], [6, 6, 'e: 6', 'sine'], [4, 4, 'f: 4', 'organ'], [3, 3, 'g: 3', 'd:bell']]); });
      PL.P = RN.player({ sec: $('poly'), btn: $('plPlay'), teach: $('plTeach'), swing: false,
        len: function () { return PL.ev.length; }, reset: plEvents,
        dur: function (i) { var a = PL.ev[i], b = PL.ev[i + 1]; return ((b ? b.f : 1) - a.f) * PL.T; },
        step: function (i, t) { var e = PL.ev[i]; if (!e) return; e.hits.forEach(function (h) { var tr = PL.tracks[h[0]]; if (tr && audible(tr)) plVoice(tr, t); }); },
        draw: function (i) { PL.head = i; plDraw(); } });
      plPreset([[1, 7, 'π − 3, level 1'], [16, 113, 'π − 3, level 3']]);
    },
    number: function () { if ($('plSrc').value === 'bar') plLevels(); },
    redraw: plDraw
  });

  /* ================= 21 the Euclidean drum machine ================= */
  var DR = { tracks: [], head: -1, P: null };
  var KINDS = [['kick', 'Kick'], ['snare', 'Snare'], ['hat', 'Hi-hat'], ['bell', 'Bell']];
  function bj(k, n) { return RN.bjork ? RN.bjork(k, n) : chris(k, n); }
  function drPat(t) { if (t.custom) return t.custom; var b = bj(t.k, t.n), o = []; for (var i = 0; i < t.n; i++) o.push(b[(i + t.r) % t.n]); return o; }
  function fromPattern(t, s) {
    var p = s.split('').map(function (ch) { return ch === 'x' ? 1 : 0; }), n = p.length, k = p.reduce(function (a, b) { return a + b; }, 0);
    t.k = k; t.n = n; t.custom = null; t.r = 0;
    var b = bj(k, n);
    for (var r = 0; r < n; r++) { var ok = true; for (var i = 0; i < n; i++) if (b[(i + r) % n] !== p[i]) { ok = false; break; } if (ok) { t.r = r; return true; } }
    t.custom = p; return false;
  }
  var PRESETS = [
    { name: 'Tresillo (Cuba)', note: 'E(3,8), the tresillo: Cuban, and the first half of the son clave.', t: { kick: 'x..x..x.', hat: 'x.x.x.x.' } },
    { name: 'Cinquillo (Cuba)', note: 'E(5,8), the cinquillo: Cuban, also heard in West African music.', t: { kick: 'x...x...', snare: 'x.xx.xx.', hat: 'xxxxxxxx' } },
    { name: 'Son clave, 3-2 (Cuba)', note: 'The son clave is not a Euclidean rhythm: its gaps are 3, 3, 4, 2, 4, less even than E(5,16)’s 3, 3, 3, 3, 4. The bell plays it as a hand-set pattern.', t: { bell: 'x..x..x...x.x...', kick: 'x...x...x...x...', hat: '..x...x...x...x.' } },
    { name: 'Rumba clave, 3-2 (Cuba)', note: 'The rumba clave, also not Euclidean (gaps 3, 4, 3, 2, 4). Hand-set on the bell.', t: { bell: 'x..x...x..x.x...', kick: 'x.......x.......', hat: 'x.x.x.x.x.x.x.x.' } },
    { name: 'Bossa nova (Brazil)', note: 'E(5,16), started on its third hit, as bossa nova usually plays it.', t: { bell: 'x..x..x...x..x..', kick: 'x.......x.......', hat: 'x.x.x.x.x.x.x.x.' } },
    { name: 'Samba (Brazil)', note: 'E(7,16), the samba necklace.', t: { bell: 'x..x.x.x..x.x.x.', kick: 'x...x...x...x...', hat: 'xxxxxxxxxxxxxxxx' } },
    { name: 'West African bell, 7 in 12', note: 'E(7,12), a common West African bell pattern, the Mpre rhythm of the Ashanti people of Ghana.', t: { bell: 'x.xx.x.xx.x.', kick: 'x..x..x..x..', hat: 'xxxxxxxxxxxx' } },
    { name: 'Venda clapping (South Africa)', note: 'E(5,12), a clapping pattern from a Venda children’s song.', t: { snare: 'x..x.x..x.x.', kick: 'x.....x.....', hat: 'x.x.x.x.x.x.' } },
    { name: 'Ruchenitza (Bulgaria)', note: 'E(3,7), the 7-beat rhythm of the Bulgarian ruchenitza dance.', t: { kick: 'x.x.x..', hat: 'xxxxxxx' } },
    { name: 'Khafif-e-ramal (Persia)', note: 'E(2,5), a 13th-century Persian rhythm.', t: { kick: 'x.x..', hat: 'xxxxx' } },
    { name: 'Cumbia (Colombia)', note: 'E(3,4), heard in Colombian cumbia and Trinidadian calypso.', t: { kick: 'x.xx', hat: 'xxxx' } }
  ];
  function drRender() {
    var box = $('drTracks'); box.innerHTML = '';
    DR.tracks.forEach(function (t, i) {
      var row = D.createElement('div'); row.className = 'rn-track'; row.style.setProperty('--c', 'var(' + COLS[i] + ')');
      var sw = D.createElement('span'); sw.className = 'rn-sw'; sw.setAttribute('aria-hidden', 'true');
      var b = D.createElement('b'); b.textContent = KINDS[i][1];
      var mk = function (lab, val, min, max, on) { var l = D.createElement('label'); l.textContent = lab + ' '; var inp = D.createElement('input'); inp.type = 'number'; inp.min = min; inp.max = max; inp.value = val; inp.setAttribute('aria-label', KINDS[i][1] + ' ' + lab); inp.addEventListener('change', function () { on(+inp.value); }); l.append(inp); return l; };
      var kL = mk('pulses', t.k, 0, 128, function (v) { t.k = Math.max(0, Math.min(t.n, v | 0)); t.custom = null; drChanged(); });
      var nL = mk('slots', t.n, 1, 128, function (v) { t.n = Math.max(1, Math.min(128, v | 0)); t.k = Math.min(t.k, t.n); t.r = t.r % t.n; t.custom = null; drChanged(); });
      var rL = mk('rotate', t.r, 0, 127, function (v) { t.r = ((v | 0) % t.n + t.n) % t.n; if (t.custom) { var p = t.custom; t.custom = p.slice(1).concat(p.slice(0, 1)); } drChanged(); });
      var g = gcd(t.k, t.n), cf = D.createElement('span'); cf.className = 'rn-cf';
      cf.textContent = t.custom ? 'hand-set pattern, ' + t.k + ' in ' + t.n : (t.k ? t.n + '/' + t.k + ' = ' + cfStr(t.n, t.k) + ' · ' + (g === 1 ? 'coprime' : 'gcd ' + g + ': repeats ' + g + '× per bar') : 'silent');
      var mu = btn('Mute', 'rn-ghost rn-mute', 'Mute ' + KINDS[i][1]); mu.setAttribute('aria-pressed', String(t.mute)); mu.addEventListener('click', function () { t.mute = !t.mute; mu.setAttribute('aria-pressed', String(t.mute)); drDraw(); });
      row.append(sw, b, kL, nL, rL, cf, mu); box.append(row);
    });
  }
  function drChanged() { drRender(); DR.P && DR.P.resetStep(); drDraw(); drNote(); }
  function drLen() { var L = 1; DR.tracks.forEach(function (t) { L = lcm(L, t.n); }); return Math.min(L, 50400); }
  function drNote(extra) { var L = 1; DR.tracks.forEach(function (t) { L = lcm(L, t.n); }); $('drNote').textContent = (extra ? extra + ' ' : '') + 'All four tracks line up again every ' + L.toLocaleString() + ' steps (the least common multiple of their lengths).'; }
  function drDraw() {
    var cv = $('drCan'), r = RN.setup(cv, 40 * DR.tracks.length + 30), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var L = 56, rowH = 40;
    DR.tracks.forEach(function (t, i) {
      var p = drPat(t), y = 10 + i * rowH, cw = (w - L - 4) / t.n, col = c(COLS[i]), now = DR.head >= 0 ? DR.head % t.n : -1;
      x.fillStyle = c('--rn-muted'); x.font = F(11); x.textAlign = 'right'; x.textBaseline = 'middle'; x.fillText(KINDS[i][1], L - 6, y + rowH / 2 - 4);
      for (var j = 0; j < t.n; j++) {
        x.globalAlpha = t.mute ? 0.3 : 1; x.fillStyle = p[j] ? col : c('--rn-soft'); var g = cw > 5 ? 1.5 : 0.3;
        x.fillRect(L + j * cw + g / 2, y, Math.max(0.8, cw - g), rowH - 12);
        if (j === now) { x.globalAlpha = 1; x.strokeStyle = c('--rn-ink'); x.lineWidth = 2; x.strokeRect(L + j * cw + 1, y - 1, Math.max(1, cw - 2), rowH - 10); x.lineWidth = 1; }
      }
      x.globalAlpha = 1;
    });
    if (DR.head >= 0) { x.fillStyle = c('--rn-muted'); x.font = F(11, 1); x.textAlign = 'left'; x.textBaseline = 'bottom'; x.fillText('step ' + (DR.head + 1), L, H - 2); }
  }
  function drPreset(p) {
    DR.tracks.forEach(function (t, i) { var s = p.t[KINDS[i][0]]; if (s) fromPattern(t, s); else { t.k = 0; t.n = (p.t.kick || p.t.bell || p.t.snare || 'x...').length; t.r = 0; t.custom = null; } });
    drChanged(); drNote(p.note);
    D.querySelectorAll('#drPresets button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.textContent === p.name)); });
  }
  RN.def('drums', {
    init: function () {
      DR.tracks = KINDS.map(function () { return { k: 0, n: 8, r: 0, mute: false, custom: null }; });
      var pb = $('drPresets'); PRESETS.forEach(function (p) { var b = btn(p.name, 'rn-ghost'); b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', function () { drPreset(p); }); pb.append(b); });
      $('drBpm').addEventListener('input', function () { $('drBpmV').textContent = $('drBpm').value; });
      $('drPiBtn').addEventListener('click', function () { var s = [[1, 7], [15, 106], [16, 113], [0, 7]]; DR.tracks.forEach(function (t, i) { t.k = s[i][0]; t.n = s[i][1]; t.r = 0; t.custom = null; }); drChanged(); drNote('Pi’s first three levels as drums: they drift and meet.'); });
      $('drPoly').addEventListener('click', function () { var s = [[3, 7], [5, 11], [7, 13], [1, 1]]; DR.tracks.forEach(function (t, i) { t.k = s[i][0]; t.n = s[i][1]; t.r = 0; t.custom = null; }); drChanged(); drNote('Three prime lengths drifting over a steady hi-hat.'); });
      DR.P = RN.player({ sec: $('drums'), btn: $('drPlay'), teach: $('drTeach'), len: drLen, dur: function () { return 60 / (+$('drBpm').value); },
        step: function (i, t) { DR.tracks.forEach(function (tr, j) { if (tr.mute || !tr.n) return; var p = drPat(tr); if (p[i % tr.n]) RN.drum(KINDS[j][0], t, (i % tr.n) === 0 ? 1 : 0.75); }); },
        draw: function (i) { DR.head = i; drDraw(); } });
      drPreset(PRESETS[0]);
    }, redraw: drDraw
  });

  /* ================= MIDI writer ================= */
  function vlq(n) { var b = [n & 0x7f]; n >>= 7; while (n > 0) { b.unshift((n & 0x7f) | 0x80); n >>= 7; } return b; }
  function str(s) { return s.split('').map(function (ch) { return ch.charCodeAt(0) & 0x7f; }); }
  function u32(n) { return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]; }
  RN.writeMidi = function (tracks, bpm) {
    var PPQ = 480, chunks = [];
    var head = str('MThd').concat(u32(6), [0, 1], [0, tracks.length + 1], [PPQ >> 8, PPQ & 255]);
    function trk(evs) { /* evs: [[tick, bytes…]] */ evs.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }); var out = [], last = 0; evs.forEach(function (e) { out = out.concat(vlq(e[0] - last)); last = e[0]; out = out.concat(e[2]); }); out = out.concat([0, 0xff, 0x2f, 0]); return str('MTrk').concat(u32(out.length), out); }
    var us = Math.round(60000000 / bpm), name = str('The Rhythm of Numbers');
    chunks.push(trk([[0, 0, [0xff, 0x03, name.length].concat(name)], [0, 1, [0xff, 0x51, 3, (us >> 16) & 255, (us >> 8) & 255, us & 255]], [0, 2, [0xff, 0x58, 4, 4, 2, 24, 8]]]));
    tracks.forEach(function (t) {
      var ev = [], nm = str(t.name || 'track');
      ev.push([0, 0, [0xff, 0x03, nm.length].concat(nm)]);
      if (t.ch !== 9) ev.push([0, 1, [0xc0 | t.ch, t.program & 127]]);
      t.notes.forEach(function (n) { var s = Math.round(n[0] * PPQ), e = Math.max(s + 1, Math.round((n[0] + n[1]) * PPQ)), m = Math.max(0, Math.min(127, n[2] | 0)), v = Math.max(1, Math.min(127, n[3] | 0)); ev.push([s, 3, [0x90 | t.ch, m, v]]); ev.push([e, 2, [0x80 | t.ch, m, 0]]); });
      chunks.push(trk(ev));
    });
    var all = head; chunks.forEach(function (ch) { all = all.concat(ch); });
    return new Uint8Array(all);
  };
  function wav(buf) {
    var ch = buf.getChannelData(0), n = ch.length, sr = buf.sampleRate, out = new DataView(new ArrayBuffer(44 + n * 2)), i;
    var w = function (o, s) { for (var k = 0; k < s.length; k++) out.setUint8(o + k, s.charCodeAt(k)); };
    w(0, 'RIFF'); out.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true); out.setUint32(24, sr, true); out.setUint32(28, sr * 2, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * 2, true);
    var peak = 0; for (i = 0; i < n; i++) peak = Math.max(peak, Math.abs(ch[i])); var g = peak > 0.98 ? 0.98 / peak : 1;
    for (i = 0; i < n; i++) { var s = Math.max(-1, Math.min(1, ch[i] * g)); out.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
    return new Blob([out.buffer], { type: 'audio/wav' });
  }
  function save(blob, name) { var a = D.createElement('a'), u = URL.createObjectURL(blob); a.href = u; a.download = name; D.body.append(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000); }

  /* ================= 22 Compose a piece ================= */
  var CP = { piece: null, head: -1, P: null };
  var PROG = [0, 3, 4, 0, 5, 3, 4, 0], CONTOUR = [0, 2, 4, 2, 1, 3, 5, 4, 2, 0, -1, 1];
  var PROGRAM = { sine: 73, mallet: 12, pluck: 24, organ: 16, kit: 12 };
  function cpGet() {
    return { n: $('cpNum').value, f: +$('cpForm').value, s: $('cpScale').value, k: +$('cpKey').value, m: $('cpMel').checked, b: $('cpBass').checked, c: $('cpChord').checked, d: $('cpDrum').checked, v: $('cpMelV').value, t: +$('cpBpm').value, l: +$('cpLen').value, r: $('cpRare').checked };
  }
  function cpTerms(n) { if (n === 'bar') return RN.W.allTerms; return (RN.CONST[n] || RN.CONST.pi).t; }
  function cpName(n) { return n === 'bar' ? RN.W.name : (RN.CONST[n] || RN.CONST.pi).name; }
  /* pick the form's levels: the bar is the first level of 4 beats or more; a phrase or section is a level at least
     3 times longer whose next term is not 1 (a term of 1 just adds one smaller block, so the next level reads better) */
  function pickLevels(X, depth) {
    var R = X.R, q = function (lv) { return X.q(lv); }, out = [], lv = 1;
    while (lv < R && q(lv) < 4) lv++;
    out.push(lv);
    for (var d = 1; d < depth; d++) {
      var want = q(out[out.length - 1]) * 3, nl = out[out.length - 1] + 1;
      while (nl < R && (q(nl) < want || (d === 1 && X.terms[nl] === 1))) nl++;
      if (nl > R || q(nl) <= q(out[out.length - 1])) break;
      out.push(nl);
    }
    return out;
  }
  function compose(o) {
    var X = RN.build(cpTerms(o.n)), lv = pickLevels(X, o.f), bar = lv[0], phr = lv[1], sec = lv[2];
    var scale = RN.SCALES[o.s] || RN.SCALES.minor, SN = scale.length, key = o.k > 6 ? o.k - 12 : o.k;
    var deg = function (d, base, tr) { var oc = Math.floor(d / SN), r = ((d % SN) + SN) % SN; return base + key + (tr || 0) + 12 * oc + scale[r]; };
    var S = 0, rare = -1;
    if (o.r) { var row = phr || bar, rt = X.rowType[row]; for (var i = 1; i < RN.MAXLEN; i++) if (rt[i] === 2 && i > 8) { rare = i; break; } if (rare > 0) S = Math.max(0, rare - Math.floor(o.l / 2)); }
    if (S + o.l > RN.MAXLEN) S = RN.MAXLEN - o.l;
    var mel = [], bass = [], chords = [], drums = [], marks = [], barN = 0, phrN = 0, hitN = 0, root = 0, tr = 0, curBarLen = X.q(bar), barAt = S;
    var isStart = function (row, b) { return row && X.rowType[row] && X.rowType[row][b]; };
    for (var b = S; b < S + o.l; b++) {
      var t = b - S, sStart = sec && isStart(sec, b), pStart = phr && isStart(phr, b), bStart = isStart(bar, b) || t === 0;
      if (sStart && t > 0) { tr = (tr + (X.rowType[sec][b] === 2 ? 7 : 5)) % 12; if (tr > 6) tr -= 12; marks.push([t, 3]); if (o.d) drums.push([t, 2, 49, 100]); }
      if (pStart || (t === 0 && phr)) { phrN = 0; barN = 0; if (t > 0) marks.push([t, 2]); }
      if (bStart) {
        var e = b + 1; while (e < S + o.l && !(X.rowType[bar][e])) e++; curBarLen = e - b; barAt = b;
        var short = phr && X.rowType[phr][b] === 2 && pStart;
        root = short ? 5 : PROG[barN % PROG.length]; barN++;
        if (o.b) bass.push([t, Math.max(1, curBarLen - 0.1), deg(root, 36, tr), 92]);
        if (o.c) [0, 2, 4].forEach(function (s, j) { chords.push([t, Math.max(1, curBarLen - 0.1), deg(root + s, 60, tr), j ? 52 : 60]); });
        if (o.d) drums.push([t, 0.5, 36, 110]);
        marks.push([t, 1]);
      } else if (o.d && curBarLen >= 4 && b - barAt === Math.floor(curBarLen / 2)) drums.push([t, 0.5, 38, 90]);
      if (X.word[b]) {
        var g = 1; while (b + g < S + o.l && !X.word[b + g]) g++;
        if (o.m) mel.push([t, Math.min(g, 6) * 0.95, deg(root + CONTOUR[hitN % CONTOUR.length], 72, tr), 96]);
        hitN++;
        if (o.d) drums.push([t, 0.25, 42, 70]);
      } else if (o.d && t % 2 === 0) drums.push([t, 0.25, 42, 38]);
    }
    return { o: o, X: X, lv: lv, S: S, rare: rare, len: o.l, mel: mel, bass: bass, chords: chords, drums: drums, marks: marks, name: cpName(o.n) };
  }
  function byBeat(pc) {
    var m = []; for (var i = 0; i < pc.len; i++) m.push([]);
    [['mel', pc.mel], ['bass', pc.bass], ['chords', pc.chords], ['drums', pc.drums]].forEach(function (p) { p[1].forEach(function (n) { var k = Math.floor(n[0]); if (m[k]) m[k].push([p[0], n]); }); });
    return m;
  }
  var DRUMK = { 36: 'kick', 38: 'snare', 42: 'hat', 49: 'clap', 56: 'bell' };
  function playNote(kind, n, when, beatSec, voice, ctx, dest) {
    var f = RN.mtof(n[2]), d = n[1] * beatSec, v = n[3] / 127;
    if (kind === 'drums') { if (n[2] === 49) { RN.noise(when, 1.2, 0.12 * v, 5000, ctx, dest); return; } RN.drum(DRUMK[n[2]] || 'hat', when, v, ctx, dest); return; }
    if (kind === 'mel') RN.voice(voice, when, f, Math.min(d, 2.5), 0.26 * v, ctx, dest);
    else if (kind === 'bass') RN.voice('pluck', when, f, Math.min(d, 3), 0.3 * v, ctx, dest);
    else RN.voice('organ', when, f, Math.min(d, 4), 0.07 * v, ctx, dest);
  }
  function cpDraw() {
    var pc = CP.piece; if (!pc) return;
    var cv = $('cpRoll'), box = $('cpScore'), ppb = Math.max(2, Math.min(8, Math.floor(box.clientWidth / pc.len * 4) || 4)), W2 = Math.max(box.clientWidth - 2, pc.len * ppb + 40);
    cv.style.width = W2 + 'px'; var r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var lo = 30, hi = 100, top = 6, dh = 34, ph = H - top - dh - 18, Y = function (m) { return top + ph * (1 - (m - lo) / (hi - lo)); }, X = function (bt) { return 30 + bt * ppb; };
    x.fillStyle = c('--rn-soft'); x.fillRect(30, top, pc.len * ppb, ph);
    pc.marks.forEach(function (mk) { x.strokeStyle = mk[1] === 3 ? c('--rn-prime') : mk[1] === 2 ? c('--rn-ink') : c('--rn-line'); x.globalAlpha = mk[1] === 1 ? 0.6 : 0.9; x.lineWidth = mk[1] === 1 ? 1 : 2; x.beginPath(); x.moveTo(X(mk[0]), top); x.lineTo(X(mk[0]), top + ph); x.stroke(); });
    x.globalAlpha = 1; x.lineWidth = 1;
    var lane = function (arr, col, hgt) { x.fillStyle = col; arr.forEach(function (n) { x.fillRect(X(n[0]), Y(n[2]) - hgt / 2, Math.max(1.5, n[1] * ppb - 0.5), hgt); }); };
    lane(pc.chords, c('--rn-violet'), 3); lane(pc.bass, c('--rn-teal'), 4); lane(pc.mel, c('--rn-g'), 5);
    var dy = top + ph + 6; x.fillStyle = c('--rn-muted'); x.font = F(9, 1); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('drum', 1, dy + dh / 2 - 4);
    var drow = { 36: 0, 38: 1, 42: 2, 49: 3 }; pc.drums.forEach(function (n) { var rr = drow[n[2]] || 0; x.fillStyle = rr === 3 ? c('--rn-prime') : c('--rn-ink'); x.globalAlpha = 0.3 + 0.7 * n[3] / 127; x.fillRect(X(n[0]), dy + rr * 7, Math.max(1.5, ppb * 0.6), 5); });
    x.globalAlpha = 1; x.textAlign = 'right'; x.fillText('high', 26, top + 6); x.fillText('low', 26, top + ph - 6);
    x.textAlign = 'left'; x.textBaseline = 'bottom'; x.fillText('beat ' + pc.S.toLocaleString() + (pc.rare > 0 ? ' · rare block at ' + pc.rare.toLocaleString() : ''), 32, H - 2);
    if (CP.head >= 0) { x.fillStyle = c('--rn-prime'); x.fillRect(X(CP.head), top, 2.5, ph + dh); }
  }
  function cpInfo() {
    var pc = CP.piece, X = pc.X, names = ['bars', 'phrases', 'sections'], parts = pc.lv.map(function (lv, i) { return names[i] + ' of ' + X.q(lv).toLocaleString() + (i === 1 && lv > 1 && X.q(lv - 1) > 1 ? ' (or ' + X.q(lv - 1).toLocaleString() + ')' : '') + ' beats'; });
    var secs = pc.len * 60 / pc.o.t;
    $('cpInfo').textContent = pc.name + ': ' + parts.join(', ') + '. ' + pc.len.toLocaleString() + ' beats, about ' + (secs >= 90 ? (Math.round(secs / 30) / 2) + ' minutes' : Math.round(secs) + ' seconds') + '. ' + pc.mel.length + ' melody notes.';
  }
  function cpLink() {
    var o = cpGet(), q = new URLSearchParams();
    q.set('cp', o.n); q.set('cf', o.f); q.set('cs', o.s); q.set('ck', o.k); q.set('cv', (o.m ? 'm' : '') + (o.b ? 'b' : '') + (o.c ? 'c' : '') + (o.d ? 'd' : '')); q.set('cmv', o.v); q.set('ct', o.t); q.set('cl', o.l); if (o.r) q.set('cr', '1');
    if (o.n === 'bar') q.set('cterms', RN.W.allTerms.slice(0, 40).join(','));
    $('cpLink').value = location.origin + location.pathname + '?' + q.toString() + '#compose';
  }
  function cpBuild() { CP.piece = compose(cpGet()); CP.beats = byBeat(CP.piece); CP.head = -1; if (CP.P) CP.P.resetStep(); cpDraw(); cpInfo(); cpLink(); }
  function cpFromURL() {
    var q = new URLSearchParams(location.search); if (!q.get('cp')) return;
    var n = q.get('cp');
    if (n === 'bar' && q.get('cterms')) { var r = RN.parseNum(q.get('cterms'), 'terms'); if (!r.err) { $('gNum').value = 'terms'; $('gIn').hidden = $('gApply').hidden = false; $('gIn').value = q.get('cterms'); RN.setNum(r); } }
    var setv = function (id, v, ok) { if (v != null && v !== '' && (!ok || ok(v))) $(id).value = v; };
    if (n === 'bar' || RN.CONST[n]) $('cpNum').value = n;
    setv('cpForm', q.get('cf'), function (v) { return /^[123]$/.test(v); }); setv('cpScale', q.get('cs'), function (v) { return RN.SCALES[v]; }); setv('cpKey', q.get('ck'), function (v) { return /^\d{1,2}$/.test(v) && +v < 12; });
    setv('cpMelV', q.get('cmv'), function (v) { return RN.VOICES.some(function (x) { return x[0] === v; }); });
    setv('cpBpm', q.get('ct'), function (v) { return +v >= 60 && +v <= 480; }); setv('cpLen', q.get('cl'), function (v) { return ['226', '452', '904', '1808'].indexOf(v) >= 0; });
    var vv = q.get('cv'); if (vv != null) { $('cpMel').checked = vv.indexOf('m') >= 0; $('cpBass').checked = vv.indexOf('b') >= 0; $('cpChord').checked = vv.indexOf('c') >= 0; $('cpDrum').checked = vv.indexOf('d') >= 0; }
    $('cpRare').checked = q.get('cr') === '1';
  }
  function midiTracks(pc) {
    var prog = PROGRAM[pc.o.v] != null ? PROGRAM[pc.o.v] : 12, T = [];
    if (pc.mel.length) T.push({ name: 'Melody', ch: 0, program: prog, notes: pc.mel });
    if (pc.bass.length) T.push({ name: 'Bass', ch: 1, program: 32, notes: pc.bass });
    if (pc.chords.length) T.push({ name: 'Chords', ch: 2, program: 19, notes: pc.chords });
    if (pc.drums.length) T.push({ name: 'Drums', ch: 9, program: 0, notes: pc.drums.map(function (n) { return [n[0], 0.25, n[2], n[3]]; }) });
    return T;
  }
  var fileBase = function (pc) { return 'rhythm-of-numbers-' + (pc.o.n === 'bar' ? 'custom' : pc.o.n) + '-' + pc.o.s; };
  RN.def('compose', {
    init: function () {
      var cn = $('cpNum'); var o0 = D.createElement('option'); o0.value = 'bar'; o0.textContent = 'the bar’s number'; cn.append(o0);
      Object.keys(RN.CONST).forEach(function (k) { var e = D.createElement('option'); e.value = k; e.textContent = RN.CONST[k].name; cn.append(e); }); cn.value = 'pi';
      RN.KEYS.forEach(function (n, i) { var e = D.createElement('option'); e.value = i; e.textContent = n; $('cpKey').append(e); }); $('cpKey').value = RN.snd.key;
      RN.VOICES.forEach(function (v) { var e = D.createElement('option'); e.value = v[0]; e.textContent = v[1]; $('cpMelV').append(e); }); $('cpMelV').value = RN.snd.voice === 'kit' ? 'mallet' : RN.snd.voice;
      cpFromURL();
      ['cpNum', 'cpForm', 'cpScale', 'cpKey', 'cpMel', 'cpBass', 'cpChord', 'cpDrum', 'cpMelV', 'cpLen', 'cpRare'].forEach(function (id) { $(id).addEventListener('change', function () { if (CP.P && CP.P.on) CP.P.stop(); cpBuild(); }); });
      $('cpBpm').addEventListener('input', function () { $('cpBpmV').textContent = $('cpBpm').value; cpInfo(); cpLink(); });
      $('cpBpmV').textContent = $('cpBpm').value;
      CP.P = RN.player({ sec: $('compose'), btn: $('cpPlay'), teach: $('cpTeach'), loop: false,
        len: function () { return CP.piece.len; }, dur: function () { return 60 / (+$('cpBpm').value); },
        step: function (i, t) { var bs = 60 / (+$('cpBpm').value) / (RN.snd.tempo || 1), v = $('cpMelV').value; (CP.beats[i] || []).forEach(function (e) { var n = e[1], off = (n[0] - Math.floor(n[0])) * bs; playNote(e[0], n, t + off, bs, v); }); },
        draw: function (i) {
          CP.head = i; cpDraw();
          if (i >= 0 && $('cpFollow').checked) { var box = $('cpScore'), ppb = cpScale(), xh = 30 + i * ppb; if (xh < box.scrollLeft + 40 || xh > box.scrollLeft + box.clientWidth - 60) box.scrollLeft = Math.max(0, xh - 60); }
        } });
      function cpScale() { var box = $('cpScore'); return Math.max(2, Math.min(8, Math.floor(box.clientWidth / CP.piece.len * 4) || 4)); }
      $('cpMidi').addEventListener('click', function () { var pc = CP.piece; save(new Blob([RN.writeMidi(midiTracks(pc), pc.o.t)], { type: 'audio/midi' }), fileBase(pc) + '.mid'); $('rn-live').textContent = 'The MIDI file is downloading.'; });
      $('cpWav').addEventListener('click', function () {
        var pc = CP.piece, OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!OAC) { $('cpInfo').textContent = 'This browser can’t make WAV files. The MIDI file works everywhere.'; return; }
        var bs = 60 / pc.o.t, secs = Math.min(240, pc.len * bs + 3), sr = 44100, ctx = new OAC(1, Math.ceil(sr * secs), sr), dest = RN.chain(ctx); dest.gain.value = 0.8;
        var bt = byBeat(pc), v = pc.o.v;
        bt.forEach(function (list, i) { var t = 0.05 + i * bs; if (t > secs - 2.5) return; list.forEach(function (e) { var n = e[1]; playNote(e[0], n, t + (n[0] - Math.floor(n[0])) * bs, bs, v, ctx, dest); }); });
        $('cpWav').disabled = true; $('cpInfo').textContent = 'Making the WAV file…';
        ctx.startRendering().then(function (buf) { save(wav(buf), fileBase(pc) + '.wav'); $('cpWav').disabled = false; cpInfo(); $('rn-live').textContent = 'The WAV file is downloading.'; })
          .catch(function () { $('cpWav').disabled = false; $('cpInfo').textContent = 'The WAV file could not be made in this browser. The MIDI file works everywhere.'; });
      });
      $('cpCopy').addEventListener('click', function () { var inp = $('cpLink'); inp.select(); var done = function () { $('cpCopy').textContent = 'Copied'; setTimeout(function () { $('cpCopy').textContent = 'Copy link'; }, 1600); }; if (navigator.clipboard) navigator.clipboard.writeText(inp.value).then(done, function () { document.execCommand('copy'); done(); }); else { document.execCommand('copy'); done(); } });
      cpBuild();
    },
    number: function () { if ($('cpNum').value === 'bar') cpBuild(); else cpLink(); },
    redraw: cpDraw
  });
})(window.RN);
