/* Thermopylae: hold the pass. Leonidas stands in the middle and throws spears; the Persian army closes in from every side.
   Greek only. The game vocabulary is all found in the New Testament (Koine); the two famous quotations are classical and say so. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('th'); if (!root) return;
  function $(s) { return root.querySelector(s); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  // Greek, English. All of these words occur in the New Testament.
  var WORDS = [
    ['στρατιώτης', 'soldier'], ['ἱππεύς', 'horseman'], ['στράτευμα', 'army, troop'], ['βέλος', 'arrow'], ['λόγχη', 'spear'], ['θυρεός', 'shield'],
    ['μάχαιρα', 'sword'], ['περικεφαλαία', 'helmet'], ['τόξον', 'bow'], ['ἵππος', 'horse'], ['βασιλεύς', 'king'], ['πόλεμος', 'war'],
    ['μάχη', 'battle, fight'], ['νίκη', 'victory'], ['θάνατος', 'death'], ['ὄρος', 'mountain'], ['θάλασσα', 'sea'], ['πύλη', 'gate'],
    ['ὁδός', 'road, path'], ['ἡμέρα', 'day'], ['νύξ', 'night'], ['τρεῖς', 'three'], ['τριακόσιοι', 'three hundred'], ['ἀνήρ', 'man'],
    ['ἐχθρός', 'enemy'], ['φίλος', 'friend'], ['ἐλευθερία', 'freedom'], ['νόμος', 'law'], ['πατρίς', 'homeland'], ['αἷμα', 'blood']
  ];
  var HISTORY = [
    'In 480 BC the Persian king Xerxes marched a huge army into Greece. The Greeks chose to meet it at Thermopylae, a narrow pass between the mountains and the sea.',
    'Thermopylae means “hot gates”, from the hot springs there. The word for gate, πύλη, is in the name.',
    'King Leonidas of Sparta led about 7,000 Greeks, among them 300 Spartans. In the narrow pass the Persian numbers counted for little.',
    'For two days the Greeks threw back every attack, even that of the Immortals, the 10,000 picked men of the king’s guard.',
    'Told that the Persian arrows would hide the sun, the Spartan Dienekes is said to have answered: then we shall fight in the shade.',
    'A local man, Ephialtes, showed the Persians a mountain path that led behind the Greek position.',
    'Learning he was being surrounded, Leonidas sent most of the army away. The 300 Spartans stayed, with 700 Thespians and 400 Thebans.',
    'On the third day they were attacked from both sides and fought to the last. Leonidas fell in the battle.',
    'The stand bought time. Later that year the Greek fleet won at Salamis, and in 479 BC the Persian army was beaten at Plataea.',
    'Almost everything we know of the battle comes from Herodotus, Histories, book 7. He says he learned the names of all three hundred.'
  ];
  var KEY = 'trb-thermo-v1', st = { hi: 0, wave: 0 };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY)); if (sv) st = sv; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }

  root.innerHTML = '<canvas aria-label="Battlefield"></canvas><div class="th-hud"><span id="th-wave"></span><span id="th-score"></span><span class="sp"></span><span id="th-lives"></span><button type="button" id="th-pause" aria-label="Pause">❚❚</button></div><div class="th-word" id="th-word"></div><div class="th-ov" id="th-ov"></div>';
  var cv = $('canvas'), c = cv.getContext('2d'), dpr = 1, Wd = 0, Ht = 0;
  function fit() { dpr = Math.min(2, W.devicePixelRatio || 1); Wd = cv.clientWidth; Ht = cv.clientHeight; cv.width = Math.round(Wd * dpr); cv.height = Math.round(Ht * dpr); }
  var G = null, paused = true, keys = {}, firing = false, rocks = [];
  for (var i = 0; i < 40; i++) rocks.push([Math.random(), Math.random(), rnd(2, 7), Math.random()]);

  function newGame() {
    G = { ang: -Math.PI / 2, cool: 0, spears: [], foes: [], fx: [], queue: [], t: 0, wave: 0, score: 0, lives: 3, inv: 0, seen: {}, arrowT: 0, over: false };
    nextWave();
  }
  function nextWave() {
    G.wave++; var n = G.wave, q = [], t = 0.5;
    function add(type, gap) { q.push({ at: t, type: type }); t += gap; }
    for (var a = 0; a < 3 + n; a++) add('s', Math.max(0.35, 1.1 - n * 0.05));
    for (var b = 0; b < 1 + Math.floor(n / 2); b++) add('t', 1.6);
    for (var h = 0; h < Math.max(0, n - 2); h++) add('h', 1.0);
    q.sort(function () { return Math.random() - 0.5; }); q.forEach(function (x, i2) { x.at = 0.5 + i2 * Math.max(0.4, 1.2 - n * 0.06); });
    G.queue = q; G.t = 0; G.arrowT = 4; hud();
  }
  var DEF = { s: { r: 13, sp: 36, w: 'στρατιώτης', e: 'soldier', pts: 20 }, t: { r: 34, sp: 20, w: 'στράτευμα', e: 'troop', pts: 50 }, h: { r: 15, sp: 78, w: 'ἱππεύς', e: 'horseman', pts: 40 }, a: { r: 5, sp: 170, w: 'βέλος', e: 'arrow', pts: 10 } };
  function spawn(type, x, y, dir) {
    var d = DEF[type], R = Math.hypot(Wd, Ht) / 2 + 40;
    if (x == null) { var a = rnd(0, Math.PI * 2); x = Math.cos(a) * R; y = Math.sin(a) * R; }
    var sp = d.sp * (1 + Math.min(1.2, G.wave * 0.05)) * rnd(0.85, 1.15);
    G.foes.push({ type: type, x: x, y: y, r: d.r, sp: sp, sw: type === 'a' ? 0 : rnd(-0.5, 0.5), ph: rnd(0, 6), col: pick(['#6a3d9a', '#c9a227', '#1f8a70', '#b5532a']), dir: dir });
  }
  function say(type) { var d = DEF[type]; G.seen[d.w] = 1; $('#th-word').innerHTML = '<b class="gr">' + d.w + '</b> = ' + d.e; wordT = 2.5; }
  var wordT = 0;
  function hud() {
    $('#th-wave').textContent = 'Wave ' + G.wave; $('#th-score').textContent = G.score + ' points';
    $('#th-lives').textContent = G.lives > 0 ? Array(G.lives + 1).join('🛡️') : '';
  }
  function fire() {
    if (G.cool > 0) return; G.cool = 0.2;
    G.spears.push({ x: Math.cos(G.ang) * 24, y: Math.sin(G.ang) * 24, a: G.ang, life: 1.6 });
  }
  function boom(x, y, col) { for (var i = 0; i < 8; i++) { var a = rnd(0, 6.28), s = rnd(40, 140); G.fx.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, col: col }); } }
  function step(dt) {
    G.t += dt; G.cool -= dt; G.inv -= dt; wordT -= dt; if (wordT <= 0 && wordT > -1) { $('#th-word').innerHTML = ''; wordT = -2; }
    if (keys.ArrowLeft || keys.a) G.ang -= 3.6 * dt; if (keys.ArrowRight || keys.d) G.ang += 3.6 * dt;
    if (firing || keys[' ']) fire();
    while (G.queue.length && G.queue[0].at <= G.t) spawn(G.queue.shift().type);
    if (G.wave >= 4 && (G.queue.length || G.foes.length)) { G.arrowT -= dt; if (G.arrowT <= 0) { spawn('a'); G.arrowT = Math.max(1.2, 4.5 - G.wave * 0.25); } }
    G.spears.forEach(function (s) { s.x += Math.cos(s.a) * 540 * dt; s.y += Math.sin(s.a) * 540 * dt; s.life -= dt; });
    G.foes.forEach(function (f) {
      var d = Math.hypot(f.x, f.y) || 1, ux = -f.x / d, uy = -f.y / d, sw = f.sw * Math.min(1, d / 200) * Math.sin(G.t * 1.3 + f.ph);
      f.x += (ux - uy * sw) * f.sp * dt; f.y += (uy + ux * sw) * f.sp * dt;
    });
    // spears against foes
    G.spears.forEach(function (s) {
      if (s.life <= 0) return;
      for (var i = 0; i < G.foes.length; i++) {
        var f = G.foes[i]; if (f.dead) continue;
        if (Math.hypot(f.x - s.x, f.y - s.y) < f.r + 5) {
          f.dead = true; s.life = 0; G.score += DEF[f.type].pts; boom(f.x, f.y, f.col); say(f.type);
          if (f.type === 't') { var base = Math.atan2(-f.y, -f.x); for (var k = -1; k <= 1; k++) { spawn('s', f.x + Math.cos(base + k * 1.6) * 22, f.y + Math.sin(base + k * 1.6) * 22); } }
          hud(); break;
        }
      }
    });
    // foes reaching Leonidas
    G.foes.forEach(function (f) {
      if (f.dead) return;
      if (Math.hypot(f.x, f.y) < f.r + 18) {
        f.dead = true; boom(f.x, f.y, '#fff');
        if (G.inv <= 0) { G.lives--; G.inv = 1.2; hud(); if (G.lives <= 0) return gameOver(); }
      }
    });
    G.foes = G.foes.filter(function (f) { return !f.dead; });
    G.spears = G.spears.filter(function (s) { return s.life > 0; });
    G.fx.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }); G.fx = G.fx.filter(function (p) { return p.life > 0; });
    if (!G.over && !G.queue.length && !G.foes.length) waveDone();
  }
  // ---------- drawing ----------
  function draw() {
    if (cv.width !== Math.round(cv.clientWidth * dpr) || cv.height !== Math.round(cv.clientHeight * dpr)) fit();
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var g = c.createRadialGradient(Wd / 2, Ht / 2, 30, Wd / 2, Ht / 2, Math.max(Wd, Ht) * 0.7); g.addColorStop(0, '#b79b6a'); g.addColorStop(1, '#6f5a3a');
    c.fillStyle = g; c.fillRect(0, 0, Wd, Ht);
    rocks.forEach(function (r) { c.fillStyle = 'rgba(60,45,25,' + (0.15 + r[3] * 0.2) + ')'; c.beginPath(); c.ellipse(r[0] * Wd, r[1] * Ht, r[2] * 1.4, r[2], 0, 0, 6.3); c.fill(); });
    c.translate(Wd / 2, Ht / 2);
    if (!G) return;
    G.foes.forEach(drawFoe);
    c.strokeStyle = '#3a2a16'; c.lineWidth = 3; c.lineCap = 'round';
    G.spears.forEach(function (s) { c.beginPath(); c.moveTo(s.x - Math.cos(s.a) * 16, s.y - Math.sin(s.a) * 16); c.lineTo(s.x + Math.cos(s.a) * 10, s.y + Math.sin(s.a) * 10); c.stroke(); c.fillStyle = '#d9dde0'; c.beginPath(); c.arc(s.x + Math.cos(s.a) * 11, s.y + Math.sin(s.a) * 11, 2.6, 0, 6.3); c.fill(); });
    G.fx.forEach(function (p) { c.globalAlpha = Math.max(0, p.life * 2); c.fillStyle = p.col; c.fillRect(p.x - 2, p.y - 2, 4, 4); }); c.globalAlpha = 1;
    // Leonidas: red cloak, bronze shield with a lambda, spear
    var blink = G.inv > 0 && Math.floor(G.inv * 10) % 2;
    if (!blink) {
      c.save(); c.rotate(G.ang);
      c.fillStyle = '#8c1d2c'; c.beginPath(); c.ellipse(-8, 0, 13, 16, 0, 0, 6.3); c.fill();
      c.strokeStyle = '#3a2a16'; c.lineWidth = 3; c.beginPath(); c.moveTo(-6, 13); c.lineTo(34, 13); c.stroke();
      c.fillStyle = '#d9dde0'; c.beginPath(); c.moveTo(40, 13); c.lineTo(32, 10); c.lineTo(32, 16); c.fill();
      c.fillStyle = '#c9a227'; c.beginPath(); c.arc(0, 0, 9, 0, 6.3); c.fill();
      c.fillStyle = '#8c1d2c'; c.fillRect(-9, -2, 14, 4);
      c.restore();
      c.fillStyle = '#b8892f'; c.strokeStyle = '#6b4d14'; c.lineWidth = 2; var sx = Math.cos(G.ang - 1.1) * 13, sy = Math.sin(G.ang - 1.1) * 13;
      c.beginPath(); c.arc(sx, sy, 11, 0, 6.3); c.fill(); c.stroke();
      c.fillStyle = '#8c1d2c'; c.font = '700 14px Georgia,serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Λ', sx, sy + 1);
    }
  }
  function drawFoe(f) {
    var a = Math.atan2(-f.y, -f.x);
    if (f.type === 'a') { c.strokeStyle = '#2a1c0c'; c.lineWidth = 2; c.beginPath(); c.moveTo(f.x - Math.cos(a) * 12, f.y - Math.sin(a) * 12); c.lineTo(f.x + Math.cos(a) * 8, f.y + Math.sin(a) * 8); c.stroke(); return; }
    if (f.type === 't') {
      c.fillStyle = 'rgba(40,25,10,.18)'; c.beginPath(); c.arc(f.x, f.y, f.r, 0, 6.3); c.fill();
      for (var i = 0; i < 7; i++) { var q = i ? i * 1.047 : 0, d = i ? 20 : 0; man(f.x + Math.cos(q) * d, f.y + Math.sin(q) * d, 8, f.col, a); }
      label(f, 'στράτευμα'); return;
    }
    if (f.type === 'h') {
      c.save(); c.translate(f.x, f.y); c.rotate(a); c.fillStyle = '#5b3d22'; c.beginPath(); c.ellipse(0, 0, 17, 8, 0, 0, 6.3); c.fill(); c.beginPath(); c.arc(16, 0, 5, 0, 6.3); c.fill(); c.restore();
      man(f.x, f.y, 7, f.col, a); return;
    }
    man(f.x, f.y, 10, f.col, a);
  }
  function man(x, y, r, col, a) {
    c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.3); c.fill();
    c.fillStyle = '#e8c9a0'; c.beginPath(); c.arc(x, y, r * 0.5, 0, 6.3); c.fill();
    c.strokeStyle = '#c8a86a'; c.lineWidth = Math.max(2, r * 0.45); c.beginPath(); c.arc(x, y, r + 1, a - 0.7, a + 0.7); c.stroke(); // wicker shield toward Leonidas
  }
  function label(f, txt) { c.font = '15px "Gentium Book Plus",Georgia,serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = 'rgba(20,12,4,.85)'; c.fillText(txt, f.x, f.y - f.r - 5); }
  // ---------- overlays ----------
  function ov(html) { var o = $('#th-ov'); o.innerHTML = '<div class="th-box">' + html + '</div>'; o.hidden = false; paused = true; return o; }
  function closeOv() { $('#th-ov').hidden = true; paused = false; last = 0; }
  function title() {
    ov('<h1>Thermopylae</h1><p class="quote gr">μολὼν λαβέ</p><p class="qsub">“Come and take them”: Leonidas’ reply when told to hand over his weapons (Plutarch). Classical Greek.</p>' +
      '<p>480 BC. You are Leonidas, holding the pass. The Persian army closes in from every side: turn, throw your spears, and let no one reach you.</p>' +
      '<p><button type="button" class="th-btn pri" id="th-go">Hold the pass</button></p>' +
      (st.hi ? '<p class="th-small">Best: ' + st.hi + ' points, wave ' + st.wave + '</p>' : '') +
      '<details><summary>How to play</summary><ul><li><b>Mouse:</b> Leonidas faces the pointer; hold the button to throw.</li><li><b>Keyboard:</b> ← → (or A D) turn, Space throws, P pauses.</li><li><b>Phone:</b> touch where you want to throw, and hold to keep throwing.</li><li>A <span class="gr">στράτευμα</span> (troop) breaks into three soldiers when hit. Horsemen are fast. From wave 4, arrows fly in too.</li><li>You have three shields. After each wave, a right answer about a Greek word wins one back.</li><li>The Greek words in the game are all found in the New Testament, so they are Koine as well as classical. The two famous quotations are classical Greek.</li></ul></details>');
    $('#th-go').onclick = function () { newGame(); closeOv(); };
  }
  function waveDone() {
    G.over = true; G.score += 100; var n = G.wave;
    var seen = WORDS.filter(function (w) { return G.seen[w[0]]; }), pool = seen.concat(WORDS.slice(0, Math.min(WORDS.length, 6 + n * 3)));
    var w = pick(pool), opts = [w]; while (opts.length < 4) { var o = pick(WORDS); if (opts.indexOf(o) < 0) opts.push(o); }
    opts.sort(function () { return Math.random() - 0.5; });
    var o2 = ov('<h2>Wave ' + n + ' beaten back</h2><p>' + HISTORY[(n - 1) % HISTORY.length] + '</p><p class="th-small">What does this word mean? A right answer wins back a shield.</p><p class="big gr">' + w[0] + '</p><div class="th-opts">' +
      opts.map(function (x, i) { return '<button type="button" class="th-btn" data-o="' + i + '">' + x[1] + '</button>'; }).join('') + '</div><p id="th-res"></p><button type="button" class="th-btn" id="th-next">Skip</button>');
    var done = false;
    o2.querySelectorAll('[data-o]').forEach(function (b) { b.onclick = function () {
      if (done) return; done = true; var ok = opts[+b.dataset.o] === w; b.classList.add(ok ? 'right' : 'wrong');
      o2.querySelectorAll('[data-o]').forEach(function (x) { if (opts[+x.dataset.o] === w) x.classList.add('right'); });
      if (ok) { G.score += 200; if (G.lives < 5) G.lives++; }
      $('#th-res').innerHTML = (ok ? '<b>Right!</b> +200 points' + (G.lives <= 5 ? ' and a shield. ' : '. ') : '<b>Not quite.</b> ') + '<span class="gr">' + w[0] + '</span> means “' + w[1] + '”.';
      $('#th-next').textContent = 'Next wave'; $('#th-next').classList.add('pri'); hud();
    }; });
    $('#th-next').onclick = function () { G.over = false; nextWave(); closeOv(); };
  }
  function gameOver() {
    G.over = true; if (G.score > st.hi) { st.hi = G.score; st.wave = G.wave; save(); }
    var words = WORDS.filter(function (w) { return G.seen[w[0]]; }).map(function (w) { return '<span class="gr">' + w[0] + '</span> ' + w[1]; }).join(' · ');
    ov('<h2>The pass has fallen</h2><p>You held for ' + G.wave + ' wave' + (G.wave === 1 ? '' : 's') + ' and scored ' + G.score + ' points.</p>' +
      '<p class="quote gr" style="font-size:1.15rem">Ὦ ξεῖν’, ἀγγέλλειν Λακεδαιμονίοις ὅτι τῇδε κείμεθα, τοῖς κείνων ῥήμασι πειθόμενοι.</p><p class="qsub">“Stranger, tell the Spartans that here we lie, obedient to their words.” The epitaph at Thermopylae (Herodotus 7.228). Classical Greek.</p>' +
      (words ? '<p class="th-small">Words you met: ' + words + '</p>' : '') + '<p><button type="button" class="th-btn pri" id="th-go">Stand again</button></p>');
    $('#th-go').onclick = function () { newGame(); closeOv(); };
  }
  // ---------- input ----------
  function aim(e) { var r = cv.getBoundingClientRect(), p = e.touches ? e.touches[0] : e; if (!p || !G) return; G.ang = Math.atan2(p.clientY - r.top - r.height / 2, p.clientX - r.left - r.width / 2); }
  cv.addEventListener('mousemove', aim);
  cv.addEventListener('mousedown', function (e) { aim(e); firing = true; });
  W.addEventListener('mouseup', function () { firing = false; });
  cv.addEventListener('touchstart', function (e) { e.preventDefault(); aim(e); firing = true; }, { passive: false });
  cv.addEventListener('touchmove', function (e) { e.preventDefault(); aim(e); }, { passive: false });
  cv.addEventListener('touchend', function () { firing = false; });
  D.addEventListener('keydown', function (e) {
    if (!root.offsetParent) return; var k = e.key.length === 1 ? e.key.toLowerCase() : e.key; keys[k] = true;
    if (k === ' ' || k === 'ArrowLeft' || k === 'ArrowRight') { if ($('#th-ov').hidden) e.preventDefault(); }
    if (k === 'p') togglePause();
  });
  D.addEventListener('keyup', function (e) { keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = false; });
  function togglePause() {
    if (!G || G.over) return;
    if ($('#th-ov').hidden) { var o = ov('<h2>Paused</h2><p><button type="button" class="th-btn pri" id="th-res2">Resume</button> <button type="button" class="th-btn" id="th-quit">Quit to title</button></p>'); $('#th-res2').onclick = closeOv; $('#th-quit').onclick = function () { G = null; title(); }; }
    else if ($('#th-res2')) closeOv();
  }
  $('#th-pause').onclick = togglePause;
  D.addEventListener('visibilitychange', function () { if (D.hidden && G && !G.over && $('#th-ov').hidden) togglePause(); });
  var last = 0;
  function frame(t) {
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
    if (G && !paused && !G.over) step(dt);
    draw(); W.requestAnimationFrame(frame);
  }
  W.__th = { state: function () { return G; } };
  fit(); title(); W.requestAnimationFrame(frame);
})(window, document);
