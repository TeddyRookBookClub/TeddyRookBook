/* Coin Match: Roman and Greek coins appear one at a time. Is this coin the same as the one before?
   Higher levels: the same as the one two before, with look-alike coins (the same picture facing the other way) and a time limit.
   The level moves after every block of 10 answers. Pure rules (C) are exported for node tests. */
(function (W, D) {
  'use strict';
  // ---------- rules (pure) ----------
  // emblem index -> [name, metal, asymmetric (has a facing direction)]
  var EMB = [['owl', 'silver', 1], ['eagle', 'silver', 1], ['galley', 'bronze', 1], ['horse', 'bronze', 1], ['dolphin', 'silver', 1],
    ['temple', 'gold', 0], ['amphora', 'bronze', 0], ['laurel wreath', 'gold', 0], ['thunderbolt', 'silver', 1], ['helmet', 'bronze', 1]];
  var C = {
    EMB: EMB, P_MATCH: 0.4, BLOCK: 10, SECONDS: 60,
    // n: how many coins back; pool: how many different pictures; lure: share of non-matches that are look-alikes; limit: ms per coin (0 = none)
    LEVELS: [
      { n: 1, pool: 3, lure: 0, limit: 0 }, { n: 1, pool: 5, lure: 0, limit: 0 }, { n: 1, pool: 6, lure: 0.35, limit: 0 },
      { n: 2, pool: 3, lure: 0, limit: 0 }, { n: 2, pool: 5, lure: 0.3, limit: 0 }, { n: 2, pool: 6, lure: 0.4, limit: 0 },
      { n: 2, pool: 8, lure: 0.4, limit: 2200 }, { n: 2, pool: 10, lure: 0.45, limit: 1600 }],
    same: function (a, b) { return !!a && !!b && a.e === b.e && !!a.m === !!b.m; },
    // the next coin, given the coins shown so far (hist), the level and this session's picture order
    next: function (hist, lv, order, r) {
      r = r || Math.random;
      var L = C.LEVELS[lv - 1], pool = order.slice(0, L.pool), tgt = hist[hist.length - L.n];
      function ri(k) { return Math.floor(r() * k); }
      function any() { var e = pool[ri(pool.length)]; return { e: e, m: L.lure > 0 && EMB[e][2] ? r() < 0.5 : false }; }
      if (!tgt) return any();
      if (r() < C.P_MATCH) return { e: tgt.e, m: !!tgt.m };
      if (L.lure && r() < L.lure) {
        var opts = [], prev = hist[hist.length - 1];
        if (EMB[tgt.e][2]) opts.push({ e: tgt.e, m: !tgt.m });                       // the same picture, mirrored
        if (L.n >= 2 && prev && !C.same(prev, tgt)) opts.push({ e: prev.e, m: !!prev.m }); // the coin just before (a 1-back look-alike)
        if (opts.length) return opts[ri(opts.length)];
      }
      var c, guard = 0;
      do { c = any(); guard++; } while ((L.lure ? C.same(c, tgt) : c.e === tgt.e) && guard < 200);
      return c;
    },
    isMatch: function (hist, n) { var k = hist.length; return k > n && C.same(hist[k - 1], hist[k - 1 - n]); },
    // 10 points plus up to 10 for speed, times the streak multiplier (x2 after 5 right in a row, up to x4), more on higher levels
    points: function (rt, streak, lv) {
      var bonus = Math.max(0, Math.min(10, Math.round((1500 - rt) / 100)));
      var mult = Math.min(4, 1 + Math.floor(streak / 5));
      return Math.round((10 + bonus) * mult * (1 + (lv - 1) * 0.25));
    },
    step: function (lv, right, total) { return Math.max(1, Math.min(C.LEVELS.length, lv + (right / total >= 0.9 ? 1 : right / total < 0.7 ? -1 : 0))); }
  };
  if (typeof module === 'object' && module.exports) module.exports = C;
  if (!D) return;
  var root = D.getElementById('coinm'), K = W.TRBBrain;
  if (!root || !K) return;

  // ---------- coin drawings (original, simple) ----------
  function wreath() {
    var s = '';
    for (var i = 0; i < 8; i++) {
      var th = (112 + i * 19) * Math.PI / 180, x = 24 * Math.cos(th), y = (50 + 24 * Math.sin(th)).toFixed(1), rot = (112 + i * 19) + 90;
      s += '<ellipse cx="' + (50 + x).toFixed(1) + '" cy="' + y + '" rx="5.4" ry="2.4" transform="rotate(' + rot + ' ' + (50 + x).toFixed(1) + ' ' + y + ')"/>';
      s += '<ellipse cx="' + (50 - x).toFixed(1) + '" cy="' + y + '" rx="5.4" ry="2.4" transform="rotate(' + (180 - rot) + ' ' + (50 - x).toFixed(1) + ' ' + y + ')"/>';
    }
    return s + '<path d="M44 78l6-4 6 4-2 6-4-5-4 5z"/><circle cx="50" cy="50" r="4"/>';
  }
  var ART = [
    // owl with an olive sprig (Athens)
    '<path d="M50 30c-9 0-15 6-15 14 0 4 1 6 2 8-2 5-3 9-2 13 1 8 7 13 15 13s14-5 15-13c1-4 0-8-2-13 1-2 2-4 2-8 0-8-6-14-15-14z"/><path d="M38 33l2-9 6 7zM62 33l-2-9-6 7z"/><path class="cm-lt" d="M44.5 36.5a5 5 0 1 0 .01 0zM55.5 36.5a5 5 0 1 0 .01 0z"/><circle cx="44.5" cy="41.5" r="2"/><circle cx="55.5" cy="41.5" r="2"/><path class="cm-lt" d="M50 45l-2.2 4h4.4z"/><path class="cm-ln" d="M58 54c5 5 5 13 0 19M43 79l-2 4M48 79l-1 4M52 79l1 4M57 79l2 4"/><path class="cm-ln" d="M18 34c5-4 9-6 15-7"/><ellipse cx="22" cy="30" rx="4" ry="1.8" transform="rotate(-40 22 30)"/><ellipse cx="27" cy="33" rx="4" ry="1.8" transform="rotate(30 27 33)"/><ellipse cx="28" cy="27" rx="4" ry="1.8" transform="rotate(-50 28 27)"/>',
    // eagle with raised wings, head turned, on a perch
    '<path d="M46 46l-6-6-10-10-6-8 2 10-4 2 6 6-4 4 8 4-2 4 10 2z"/><path d="M54 46l6-6 10-10 6-8-2 10 4 2-6 6 4 4-8 4 2 4-10 2z"/><path d="M50 39c-5 6-6 19-3 27l3 4 3-4c3-8 2-21-3-27z"/><circle cx="48" cy="35" r="5"/><path d="M44 33.5l-6 2.4 6 1.4z"/><path d="M47 66l-2 9 5-3 5 3-2-9z"/><path class="cm-ln" d="M46 70l-2 7M54 70l2 7M36 78h28"/><circle class="cm-lt" cx="46.6" cy="34" r="1.1"/>',
    // galley with a ram, sail and oars
    '<path d="M14 64l12-4h44c6 0 10-6 10-14 3 6 2 16-4 22H28z"/><path class="cm-ln" d="M48 60V28"/><path d="M36 32h24l-2 18H38z"/><path class="cm-ln" d="M34 70l-4 8M42 70l-4 8M50 70l-4 8M58 70l-4 8M66 70l-4 8"/><circle class="cm-lt" cx="27" cy="64" r="1.6"/>',
    // horse's head
    '<path d="M62 26c-8 0-16 4-22 12L30 50c-2 4 0 8 4 8l6-2c4 0 6 2 6 6v16h24c0-14 0-28-2-38-1-7-2-12-6-14z"/><path d="M57 27l4-9 3 9z"/><path class="cm-ln" d="M64 28c5 5 8 14 8 24s0 18 0 26"/><circle class="cm-lt" cx="49" cy="40" r="2"/><circle class="cm-lt" cx="34" cy="53" r="1.3"/>',
    // dolphin leaping over waves
    '<path d="M14 61c6-5 12-9 18-12 8-11 28-16 40-7 6 5 9 12 10 18l6-5-1 8 5 6-9-2c-4-8-13-16-25-17-10-1-18 4-24 9-6 3-14 4-20 2z"/><path d="M48 38l8-10 2 12z"/><path d="M40 55l-4 9 10-7z"/><circle class="cm-lt" cx="27" cy="54" r="1.5"/><path class="cm-ln" d="M22 77c6-4 12 4 18 0s12 4 18 0 12 4 18 0"/>',
    // temple front
    '<path d="M24 38l26-14 26 14z"/><rect x="24" y="38" width="52" height="5"/><rect x="28" y="43" width="4.5" height="25"/><rect x="38" y="43" width="4.5" height="25"/><rect x="47.75" y="43" width="4.5" height="25"/><rect x="57.5" y="43" width="4.5" height="25"/><rect x="67.5" y="43" width="4.5" height="25"/><rect x="22" y="68" width="56" height="4"/><rect x="18" y="72" width="64" height="4"/><circle class="cm-lt" cx="50" cy="33" r="2.2"/>',
    // amphora
    '<rect x="41" y="24" width="18" height="5" rx="1"/><path d="M44 29h12v6c10 6 12 20 4 32l-6 8-2 7h-4l-2-7-6-8c-8-12-6-26 4-32z"/><path class="cm-ln" d="M44 32c-9-2-11 8-4 14M56 32c9-2 11 8 4 14"/><path class="cm-lt" d="M38 52h24v3H38z"/>',
    // laurel wreath
    null,
    // thunderbolt
    '<path d="M57 18L39 50h11l-9 32 24-38H53l11-26z"/><path class="cm-ln" d="M30 40l8 4M70 56l-8-4M34 66l6-4M66 30l-6 4"/>',
    // crested helmet
    '<path d="M30 58c-2-18 10-30 26-30 12 0 18 10 18 22v20H62l-2-12h-8l-2 12H38c-4-4-7-8-8-12z"/><path class="cm-lt" d="M37 48l13-2v6l-11 1z"/><path class="cm-lt" d="M50 52v9h-3v-9z"/><path d="M40 30c4-14 30-16 40-4-8-2-20-2-28 3z"/>'
  ];
  var LEG = { owl: 'ΑΘΕ', eagle: 'ROMA', galley: 'ROMA', 'laurel wreath': 'ROMA' };
  function coinSVG(c, big) {
    var em = EMB[c.e], art = c.e === 7 ? wreath() : ART[c.e], flip = c.m ? ' transform="matrix(-1 0 0 1 100 0)"' : '', leg = LEG[em[0]];
    var dir = em[2] ? (c.m ? ', facing right' : ', facing left') : '';
    return '<svg viewBox="0 0 100 100" class="cm-coin ' + em[1] + (big ? ' big' : '') + '" role="img" aria-label="' + em[1] + ' coin: ' + em[0] + dir + '">' +
      '<circle cx="50" cy="50" r="48" class="cm-edge"/><circle cx="50" cy="50" r="45" class="cm-face"/><circle cx="50" cy="50" r="42.5" class="cm-beads"/>' +
      '<g class="cm-em"' + flip + '><g' + (leg ? ' transform="translate(50 45) scale(.86) translate(-50 -50)"' : '') + '><g class="cm-hi" transform="translate(-0.9 -0.9)">' + art + '</g><g class="cm-lo">' + art + '</g></g></g>' +
      (leg ? '<text x="50" y="86.5" class="cm-leg" text-anchor="middle">' + leg + '</text>' : '') +
      '<ellipse cx="38" cy="30" rx="20" ry="12" class="cm-shine" transform="rotate(-30 38 30)"/></svg>';
  }

  // ---------- game ----------
  var SLUG = 'coin-match', E = K.load(SLUG), G = null, esc = K.esc;
  var SOUND = K.soundPref(); K.setSound(SOUND);
  function $(s) { return root.querySelector(s); }
  function now() { return (W.performance && performance.now) ? performance.now() : Date.now(); }
  function lvName(lv) { var L = C.LEVELS[lv - 1]; return 'Level ' + lv + ' · ' + (L.n === 1 ? 'one back' : 'two back'); }
  function soundBtn() { return '<button class="bk-btn sm" id="cm-snd" aria-pressed="' + (SOUND ? 'true' : 'false') + '" aria-label="Sound effects" title="Sound effects">' + (SOUND ? '🔊' : '🔇') + '</button>'; }
  function wireSound() {
    var b = $('#cm-snd'); if (!b) return;
    b.onclick = function () { SOUND = K.saveSoundPref(!K.soundPref()); b.setAttribute('aria-pressed', SOUND ? 'true' : 'false'); b.textContent = SOUND ? '🔊' : '🔇'; K.sfx('coin'); };
  }
  function clearT() { if (G) { clearTimeout(G.t1); clearTimeout(G.t2); cancelAnimationFrame(G.raf); } }

  function menu() {
    clearT(); G = null; E = K.load(SLUG);
    var lv = K.startLevel(E, 1, C.LEVELS.length), gallery = '';
    [0, 1, 2, 5, 4, 8, 7, 3, 6, 9].forEach(function (e) { gallery += coinSVG({ e: e, m: false }); });
    root.innerHTML = '<div class="bk-menu"><h1>Coin Match<small>idem an aliud? “the same or another?”</small></h1>' +
      '<p>Roman and Greek coins land on the table one at a time. As fast as you can, say whether each coin is the <b>same</b> as the one before it. Later the question becomes: the same as the coin <b>two</b> before? And watch for look-alikes: the same picture facing the other way is a different coin.</p>' +
      '<div class="cm-gallery" aria-hidden="true">' + gallery + '</div>' +
      '<div class="bk-stats"><div class="bk-stat"><b>' + (E.best || 0) + '</b><span>Best score</span></div><div class="bk-stat"><b>' + (E.top || '–') + '</b><span>Top level</span></div><div class="bk-stat"><b>' + (E.plays || 0) + '</b><span>Sessions</span></div></div>' +
      '<div class="bk-btns"><button class="bk-btn pri" id="cm-go">Start: ' + lvName(lv) + '</button>' + (lv > 1 ? '<button class="bk-btn" id="cm-one">Start at level 1</button>' : '') + '</div>' +
      '<div class="bk-opt"><span>Sound effects</span>' + soundBtn() + '</div>' +
      '<h2 style="font-size:1.05rem;margin:.9rem 0 .2rem">Your progress</h2>' + K.chart(E.sessions, { label: 'Score' }) +
      '<details class="bk-help" open><summary>How to play</summary><ul>' +
      '<li>A session lasts ' + C.SECONDS + ' seconds. The first coin is just to remember: press Next.</li>' +
      '<li>Then answer for every coin: <b>Same</b> (right arrow key) or <b>Different</b> (left arrow key). Fast answers score more, and five right in a row doubles your points, up to four times.</li>' +
      '<li>After every ' + C.BLOCK + ' answers the game checks your accuracy: 9 or 10 right moves you up a level, fewer than 7 moves you down.</li>' +
      '<li>Levels 1–3 ask about the coin <b>one back</b>; levels 4–8 ask about the coin <b>two back</b>. From level 3, look-alike coins appear; from level 7, each coin has a time limit.</li>' +
      '<li>P or Escape pauses. The coins are original drawings in the style of a silver drachma of Athens (the owl, with ΑΘΕ, “of the Athenians”) and Roman coins marked ROMA.</li></ul></details>' +
      '<p class="bk-honest">A speed-and-memory challenge for fun. Getting better at Coin Match mostly means getting better at Coin Match. <a href="' + esc(root.dataset.hub || '/games/brain-games/') + '">More brain games</a></p></div>';
    $('#cm-go').onclick = function () { start(lv); };
    if ($('#cm-one')) $('#cm-one').onclick = function () { start(1); };
    wireSound();
  }

  function start(lv) {
    clearT();
    var order = K.shuffle(EMB.map(function (_, i) { return i; }));
    G = { lv: lv, top: lv, order: order, hist: [], score: 0, streak: 0, right: 0, total: 0, bR: 0, bT: 0, rts: [], left: C.SECONDS * 1000, last: 0, phase: 'warm', paused: false, running: false };
    root.innerHTML = '<div class="bk-game"><div class="bk-hud"><button class="bk-btn sm" id="cm-menu">☰ Menu</button><div class="bk-info" id="cm-info"></div>' + soundBtn() + '<button class="bk-btn sm" id="cm-pause" aria-label="Pause" title="Pause (P)"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="currentColor"><rect x="3" y="2" width="3.6" height="12" rx="1"/><rect x="9.4" y="2" width="3.6" height="12" rx="1"/></svg></button></div>' +
      '<div class="bk-bar-time" aria-hidden="true"><i id="cm-time"></i></div>' +
      '<p class="cm-q" id="cm-q"></p><p class="bk-sr" id="cm-sr" aria-live="polite"></p><div class="bk-stage cm-stage"><div class="cm-table"><div class="cm-slot" id="cm-slot"></div><div class="cm-mark" id="cm-mark" aria-hidden="true"></div><div class="cm-limit" id="cm-limit" hidden><i></i></div></div></div>' +
      '<div class="cm-answers" id="cm-ans"></div><div class="bk-msg" id="cm-msg" aria-live="polite"></div></div>';
    $('#cm-menu').onclick = menu; $('#cm-pause').onclick = pause; wireSound();
    hud(); deal();
  }
  function hud() {
    var s = Math.max(0, Math.ceil(G.left / 1000));
    $('#cm-info').innerHTML = '<b>' + lvName(G.lv) + '</b><span>⏱ ' + s + ' s</span><span>Score ' + G.score + '</span>' + (G.streak >= 5 ? '<span>×' + Math.min(4, 1 + Math.floor(G.streak / 5)) + '</span>' : '');
    $('#cm-time').style.width = (100 * G.left / (C.SECONDS * 1000)) + '%';
  }
  function answers() {
    var a = $('#cm-ans');
    if (G.phase === 'warm') a.innerHTML = '<button class="bk-btn pri cm-next" id="cm-next">Next coin ▶</button>';
    else a.innerHTML = '<button class="bk-btn cm-no" id="cm-no"><span aria-hidden="true">← ✗</span> Different</button><button class="bk-btn cm-yes" id="cm-yes">Same <span aria-hidden="true">✓ →</span></button>';
    if ($('#cm-next')) $('#cm-next').onclick = function () { if (!G.paused) deal(); };
    if ($('#cm-no')) $('#cm-no').onclick = function () { answer(false); };
    if ($('#cm-yes')) $('#cm-yes').onclick = function () { answer(true); };
  }
  function question() {
    var n = C.LEVELS[G.lv - 1].n;
    $('#cm-q').innerHTML = G.phase === 'warm' ? 'Remember this coin.' : 'Same as the coin <b>' + (n === 1 ? 'just before' : 'two before') + '</b>?';
  }
  function deal() {
    if (!G || G.over) return;
    var L = C.LEVELS[G.lv - 1], c = C.next(G.hist, G.lv, G.order);
    G.hist.push(c); if (G.hist.length > 12) G.hist.shift();
    G.phase = G.hist.length > L.n ? 'ask' : 'warm';
    var slot = $('#cm-slot');
    slot.innerHTML = coinSVG(c, true);
    if (!K.reduced()) { slot.firstChild.classList.add('in'); }
    $('#cm-mark').className = 'cm-mark';
    question(); answers(); K.sfx('coin');
    G.dealt = (G.dealt || 0) + 1; $('#cm-sr').textContent = 'Coin ' + G.dealt + ': ' + EMB[c.e][1] + ', ' + EMB[c.e][0] + (EMB[c.e][2] ? (c.m ? ', facing right' : ', facing left') : '') + '. ' + $('#cm-q').textContent;
    G.t0 = now() + (K.reduced() ? 0 : 120);
    if (G.phase === 'ask' && !G.running) { G.running = true; G.last = now(); tick(); }
    limit();
  }
  // the per-coin time limit (levels 7 and 8): a draining bar under the coin
  function limit() {
    var L = C.LEVELS[G.lv - 1], lim = $('#cm-limit');
    if (G.phase === 'ask' && L.limit) {
      lim.hidden = false; var bar = lim.firstChild; bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth;
      bar.style.transition = 'width ' + L.limit + 'ms linear'; bar.style.width = '0%';
      G.limitAt = now() + L.limit + 120;
    } else { lim.hidden = true; G.limitAt = 0; }
  }
  function tick() {
    if (!G || G.over) return;
    var t = now();
    if (!G.paused && !G.banner) { G.left -= t - G.last; }
    G.last = t;
    if (G.left <= 0) { G.left = 0; hud(); return finish(); }
    if (G.limitAt && !G.paused && !G.banner && G.phase === 'ask' && t > G.limitAt) { G.limitAt = 0; answer(null); }
    hud();
    G.raf = requestAnimationFrame(tick);
  }
  function answer(said) {
    if (!G || G.phase !== 'ask' || G.paused || G.banner || G.over) return;
    var n = C.LEVELS[G.lv - 1].n, match = C.isMatch(G.hist, n), ok = said === match, rt = Math.max(0, now() - G.t0);
    G.phase = 'fb'; G.total++; G.bT++;
    var mk = $('#cm-mark');
    if (ok) {
      G.right++; G.bR++; G.streak++; G.rts.push(rt);
      var p = C.points(rt, G.streak, G.lv); G.score += p;
      mk.className = 'cm-mark ok'; mk.textContent = '✓'; K.sfx('ok');
      msg('<span class="ok">✓ ' + (match ? 'Same' : 'Different') + '! +' + p + '</span>');
    } else {
      G.streak = 0;
      mk.className = 'cm-mark bad'; mk.textContent = '✗'; K.sfx('bad');
      msg('<span class="bad">✗ ' + (said === null ? 'Too slow: it was ' + (match ? 'the same' : 'different') : 'It was ' + (match ? 'the same' : 'different')) + '.</span>');
    }
    var lim = $('#cm-limit'); lim.hidden = true;
    hud();
    G.t1 = setTimeout(function () {
      if (!G || G.over) return;
      if (G.bT >= C.BLOCK) {
        var old = G.lv; G.lv = C.step(G.lv, G.bR, G.bT); G.bR = G.bT = 0; G.top = Math.max(G.top, G.lv);
        if (G.lv !== old) return banner(old);
      }
      if (G.paused) { G.resumeDeal = true; return; }
      deal();
    }, ok ? 260 : 650);
  }
  function banner(old) {
    var L = C.LEVELS[G.lv - 1], up = G.lv > old, el = D.createElement('div');
    G.banner = true; K.sfx(up ? 'up' : 'down');
    var sub = L.n !== C.LEVELS[old - 1].n ? (L.n === 2 ? 'Now compare each coin with the one <b>two</b> before it.' : 'Back to the coin <b>just before</b>.') :
      (up ? (L.limit ? 'Each coin now has a time limit.' : L.lure && !C.LEVELS[old - 1].lure ? 'Look-alikes: the same picture facing the other way is a different coin.' : 'More kinds of coins.') : 'A little easier for a while.');
    el.className = 'bk-banner'; el.innerHTML = (up ? '▲ ' : '▼ ') + lvName(G.lv) + '<small>' + sub + '</small>';
    $('.cm-stage').appendChild(el); $('#cm-slot').innerHTML = ''; $('#cm-ans').innerHTML = ''; $('#cm-q').textContent = '';
    msg(up ? '<span class="ok">Level up!</span>' : 'Level down.');
    G.t2 = setTimeout(function () { el.remove(); if (!G) return; G.banner = false; G.last = now(); if (G.paused) { G.resumeDeal = true; return; } deal(); }, 2000);
  }
  function msg(h) { $('#cm-msg').innerHTML = h; }
  function finish() {
    if (G.over) return;
    G.over = true; clearT();
    var acc = G.total ? Math.round(100 * G.right / G.total) : 0, rts = G.rts.slice().sort(function (a, b) { return a - b; }), med = rts.length ? Math.round(rts[Math.floor(rts.length / 2)]) : 0;
    var best = K.record(SLUG, { score: G.score, level: G.top, next: Math.max(1, G.lv - 1), acc: acc, rt: med, n: G.total });
    E = K.update(SLUG, function (e) { e.top = Math.max(e.top || 0, G.top); });
    K.sfx('end');
    var m = D.createElement('div'); m.className = 'bk-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Time is up');
    m.innerHTML = '<div class="bk-box"><h2>Time!</h2><p style="font-size:1.25rem"><b>' + G.score + '</b> points' + (best ? '<span class="bk-new">New best!</span>' : '') + '</p>' +
      '<p>' + G.right + ' of ' + G.total + ' right (' + acc + '%)' + (med ? ', typical answer in ' + (med / 1000).toFixed(2) + ' s' : '') + '. Highest level: ' + G.top + '.</p>' +
      K.chart(E.sessions, { label: 'Score' }) +
      '<div class="bk-btns"><button class="bk-btn pri" id="cm-again">Play again</button><button class="bk-btn" id="cm-back">Menu</button></div></div>';
    $('.bk-game').appendChild(m);
    $('#cm-again').onclick = function () { start(K.startLevel(K.load(SLUG), 1, C.LEVELS.length)); };
    $('#cm-back').onclick = menu; $('#cm-again').focus({ preventScroll: true });
  }
  function pause() {
    if (!G || G.paused || G.over) return;
    G.paused = true; G.pausedAt = now();
    $('#cm-slot').classList.add('hide');
    K.pauseOverlay($('.bk-game'), function () {
      if (!G) return;
      G.paused = false; G.last = now(); $('#cm-slot').classList.remove('hide');
      if (G.resumeDeal) { G.resumeDeal = false; deal(); }
      else { G.t0 = now(); if (G.phase === 'ask') limit(); }   // the time limit starts again after a pause
    }, menu, '<p>' + Math.ceil(G.left / 1000) + ' seconds left, score ' + G.score + '.</p>');
  }
  D.addEventListener('keydown', function (e) {
    if (!root.isConnected || !G || G.over) return;
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    var k = e.key;
    if (k === 'p' || k === 'P' || k === 'Escape') { e.preventDefault(); if (G.paused) { var r = root.querySelector('.bk-modal [data-a="r"]'); if (r) r.click(); } else pause(); return; }
    if (G.paused) return;
    if (G.phase === 'warm' && (k === 'ArrowRight' || k === ' ' || k === 'Enter')) { e.preventDefault(); deal(); return; }
    if (k === 'ArrowRight' || k === 'y' || k === 'Y' || k === 's' || k === 'S') { e.preventDefault(); answer(true); }
    else if (k === 'ArrowLeft' || k === 'n' || k === 'N' || k === 'd' || k === 'D') { e.preventDefault(); answer(false); }
  });
  D.addEventListener('visibilitychange', function () { if (D.hidden) pause(); });
  menu();
})(typeof window !== 'undefined' ? window : null, typeof document !== 'undefined' ? document : null);
