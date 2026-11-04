/* Background music: Teddy Rook's Continued-Fraction Suite, played while you use the site (Teddy Rook Book).
   Loaded only when needed by the small "Background music" stub in assets/js/site-shell.js (the ♪ button in the header, buttons with
   data-trb-music="play" on the Suite and Rhythm of Numbers pages, or a resume after a page change). The pop-out window,
   /music/player/ (static/music/player/index.html), loads this same file and plays there instead.
   Styles: player.css (prefix trbm-). Audio: static/music/suite/audio/*.mp3 (96 kbps, about -18 LUFS), fetched only when played.

   STATE  localStorage 'trb-music-v1' (device-wide: listed in SHARED in static/js/profiles.js)
     { track, pos, list: [ids in the playlist], order: 'seq'|'shuffle', q: [shuffle order], rep: 'all'|'one'|'off',
       vol 0..1, playing, t: time saved, sleep: time the sleep timer ends (0 = off), pop: pop-out heartbeat }
     A page that loads while `playing` is true (saved less than 30 minutes ago) resumes at `pos`. If the browser blocks
     sound until a tap, a small "Resume music" chip appears instead; one tap resumes, × forgets it.
   POP-OUT  BroadcastChannel 'trb-music'. The pop-out sends its state every second and a heartbeat in `pop`; a main tab that
     hears it pauses its own audio and turns its controls into a remote for the pop-out, so the music never plays twice.
     A tab that starts playing tells the others ({t:'local'}), and they pause.
   OTHER SOUNDS  The page's own instruments send a window event 'trb:sound-start' (static/music/kit/audio.js,
     static/music/rhythm/sound.js, static/connections/rhythm/core.js, static/games/brain-kit.js). The music then drops to
     a low volume and comes back 4 seconds after the last one. In a main tab with a pop-out open, the stub passes it on.
   API  window.TRBPlayer.cmd('panel' | 'play' | 'resume' | 'popout-init') */
(function (W, D) {
  'use strict';
  if (W.TRBPlayer) return;
  var me = D.currentScript && D.currentScript.src || '';
  var SUITE = me ? me.replace(/player\/player\.js.*$/, '') : '/music/suite/';
  var ROOT = SUITE.replace(/music\/suite\/$/, '');
  var KEY = 'trb-music-v1', FRESH = 30 * 60 * 1000;
  var T = [
    { id: 'golden', n: 'I. Golden', f: '1-golden.mp3', u: 'golden/', d: 200 },
    { id: 'silver', n: 'II. Silver', f: '2-silver.mp3', u: 'silver/', d: 232 },
    { id: 'fifth', n: 'III. The Fifth', f: '3-the-fifth.mp3', u: 'the-fifth/', d: 154 },
    { id: 'euler', n: 'IV. Euler', f: '4-euler.mp3', u: 'euler/', d: 142 },
    { id: 'pi', n: 'V. Pi', f: '5-pi.mp3', u: 'pi/', d: 291 },
    { id: 'pi32996', n: 'VI. Pi, bar 32,996', f: '6-pi-bar-32996.mp3', u: 'pi-bar-32996/', d: 133 }
  ];
  var IDS = T.map(function (t) { return t.id; });
  function tr(id) { for (var i = 0; i < T.length; i++) if (T[i].id === id) return T[i]; return T[0]; }
  var POP = D.documentElement.hasAttribute('data-trb-popout');

  /* ---------- state ---------- */
  var S = { track: 'golden', pos: 0, list: IDS.slice(), order: 'seq', q: [], rep: 'all', vol: 0.6, playing: false, t: 0, sleep: 0, pop: 0 };
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  (function () {
    var s = read(); if (!s || typeof s !== 'object') return;
    if (IDS.indexOf(s.track) >= 0) S.track = s.track;
    if (s.pos > 0) S.pos = +s.pos;
    if (Array.isArray(s.list)) { var l = s.list.filter(function (x) { return IDS.indexOf(x) >= 0; }); if (l.length) S.list = l; }
    if (s.order === 'shuffle') S.order = 'shuffle';
    if (Array.isArray(s.q)) S.q = s.q.filter(function (x) { return IDS.indexOf(x) >= 0; });
    if (s.rep === 'one' || s.rep === 'off') S.rep = s.rep;
    if (s.vol >= 0 && s.vol <= 1) S.vol = +s.vol;
    S.playing = !!s.playing; S.t = +s.t || 0; S.sleep = +s.sleep || 0; S.pop = +s.pop || 0;
  })();
  var remote = false, R = null, lastPop = 0; // main tab: the pop-out is playing; R = its last state
  function save() {
    if (remote) return;
    S.t = Date.now(); if (A.src && A.readyState > 0 && seekTo < 0) S.pos = A.currentTime || 0;
    if (POP) S.pop = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
  }

  /* ---------- audio ---------- */
  var A = new Audio(); A.preload = 'none';
  var seekTo = -1, duck = 0, fade = 1, blocked = false;
  function vol() { A.volume = Math.max(0, Math.min(1, S.vol * fade * (duck > Date.now() ? 0.15 : 1))); }
  function load(id) {
    S.track = id; var url = SUITE + 'audio/' + tr(id).f;
    if (A.getAttribute('src') !== url) { A.src = url; }
  }
  // jump to the saved position once the browser can (a server without range requests allows it only after more has loaded)
  function applySeek() {
    if (seekTo < 0 || !(A.duration > 0)) return;
    if (seekTo > 0 && seekTo < A.duration - 1) { try { A.currentTime = seekTo; } catch (e) { } if (Math.abs(A.currentTime - seekTo) > 1) return; }
    seekTo = -1; ui();
  }
  ['loadedmetadata', 'canplay', 'progress'].forEach(function (ev) { A.addEventListener(ev, applySeek); });
  function play() {
    if (remote) return send('play');
    var cur = A.getAttribute('src'); load(S.track);
    if (!cur || A.readyState === 0) { seekTo = S.pos; }
    vol(); S.playing = true; blocked = false;
    var p; try { p = A.play(); } catch (e) { p = null; }
    if (p && p.then) p.then(function () { blocked = false; tellOthers(); ui(); }, function (e) {
      if (e && e.name === 'NotAllowedError') { blocked = true; ui(); }
      else if (e && e.name !== 'AbortError') { S.playing = false; status('This track could not load. Check your connection.'); ui(); }
    }); else tellOthers();
    save(); meta(); ui();
  }
  function pause(keep) {
    if (remote) return send('pause');
    A.pause(); if (!keep) S.playing = false; blocked = false; save(); ui();
  }
  function pick(id, from0) {
    if (remote) return send('pick', id);
    var same = id === S.track; S.track = id;
    if (!same || from0) { S.pos = 0; seekTo = 0; load(id); if (A.readyState > 0) try { A.currentTime = 0; } catch (e) { } }
    play();
  }
  function queue() {
    var on = IDS.filter(function (x) { return S.list.indexOf(x) >= 0; });
    if (S.order !== 'shuffle') return on;
    var q = S.q.filter(function (x) { return on.indexOf(x) >= 0; });
    if (q.length !== on.length) { q = shuffle(on, S.track); S.q = q; }
    return q;
  }
  function shuffle(a, first) {
    a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    var k = a.indexOf(first); if (k > 0) { a.splice(k, 1); a.unshift(first); } return a;
  }
  function step(dir, auto) {
    if (remote) return send(dir > 0 ? 'next' : 'prev');
    if (auto && S.rep === 'one') return pick(S.track, true);
    if (dir < 0 && A.currentTime > 3) { try { A.currentTime = 0; } catch (e) { } return; }
    var q = queue(), i = q.indexOf(S.track), n;
    if (i < 0) { // the track playing was taken off the list: go to the next one on it, in suite order
      var base = IDS.indexOf(S.track);
      n = dir > 0 ? (q.filter(function (x) { return IDS.indexOf(x) > base; })[0] || q[0]) : (q.filter(function (x) { return IDS.indexOf(x) < base; }).pop() || q[q.length - 1]);
    } else if (i + dir >= q.length) {
      if (auto && S.rep === 'off') { S.track = q[0]; S.pos = 0; seekTo = 0; A.removeAttribute('src'); A.load(); pause(); status('End of the playlist.'); return; }
      if (S.order === 'shuffle' && q.length > 1) { var last = S.track; do { S.q = shuffle(q); } while (S.q[0] === last); q = S.q; }
      n = q[0];
    } else if (i + dir < 0) n = q[q.length - 1];
    else n = q[i + dir];
    pick(n || S.track, true);
  }
  A.addEventListener('ended', function () { step(1, true); });
  A.addEventListener('play', function () { ui(); meta(); });
  A.addEventListener('pause', function () { ui(); });
  A.addEventListener('error', function () { if (A.getAttribute('src')) { S.playing = false; status('This track could not load. Check your connection.'); ui(); } });
  var lastSave = 0;
  A.addEventListener('timeupdate', function () { var n = Date.now(); if (n - lastSave > 3000) { lastSave = n; save(); } prog(); });
  W.addEventListener('pagehide', function () { if (POP) { S.pop = 0; S.playing = false; A.pause(); } save(); if (POP) bc && bc.postMessage({ t: 'bye' }); });
  D.addEventListener('visibilitychange', function () { if (D.hidden) save(); });

  /* ducking under the page's own sounds; the sleep timer */
  function onSound() { if (remote) return send('duck'); duck = Date.now() + 4000; vol(); }
  W.addEventListener('trb:sound-start', onSound);
  setInterval(function () {
    var n = Date.now();
    if (duck && duck <= n) { duck = 0; vol(); }
    if (!remote && S.sleep) {
      var left = S.sleep - n;
      if (left <= 0) { S.sleep = 0; fade = 1; pause(); status('The sleep timer paused the music.'); }
      else if (left < 8000) { fade = left / 8000; vol(); }
      sleepLabel();
    }
    if (remote && n - lastPop > 6000) { remote = false; R = null; status('The pop-out window was closed.'); ui(); }
    if (POP) { broadcast(); if (n - lastSave > 3000) { lastSave = n; save(); } }
  }, 1000);

  /* ---------- Media Session (lock screen, keyboard media keys) ---------- */
  var MS = navigator.mediaSession;
  function meta() {
    if (!MS || remote) return;
    try {
      MS.metadata = new W.MediaMetadata({ title: tr(S.track).n, artist: 'Teddy Rook', album: 'The Continued-Fraction Suite',
        artwork: [{ src: ROOT + 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: ROOT + 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }] });
    } catch (e) { }
  }
  if (MS) {
    var H = { play: function () { play(); }, pause: function () { pause(); }, previoustrack: function () { step(-1); }, nexttrack: function () { step(1); },
      seekto: function (d) { if (d && d.seekTime >= 0) try { A.currentTime = d.seekTime; } catch (e) { } } };
    for (var h in H) try { MS.setActionHandler(h, H[h]); } catch (e) { }
  }

  /* ---------- pop-out and other tabs ---------- */
  var bc = null, ME = Math.random().toString(36).slice(2);
  try { bc = new BroadcastChannel('trb-music'); } catch (e) { }
  function send(c, a) { if (bc) bc.postMessage({ t: 'cmd', c: c, a: a }); }
  function tellOthers() { if (bc && !POP) bc.postMessage({ t: 'local', id: ME }); }
  function snap() { return { S: S, pos: A.currentTime || S.pos || 0, dur: A.duration || tr(S.track).d, paused: A.paused, blocked: blocked }; }
  function broadcast() { if (bc && POP) bc.postMessage({ t: 'state', s: snap() }); }
  if (bc) bc.onmessage = function (e) {
    var m = e.data || {};
    if (POP) {
      if (m.t === 'ping') broadcast();
      else if (m.t === 'duck') onSound();
      else if (m.t === 'cmd') { run(m.c, m.a); broadcast(); }
      return;
    }
    if (m.t === 'local' && m.id !== ME && !A.paused) { A.pause(); S.playing = false; ui(); } // another tab took over; it saves the state
    if (m.t === 'state') {
      lastPop = Date.now(); R = m.s;
      if (!remote) { if (!A.paused) A.pause(); S.playing = false; remote = true; blocked = false; status(''); }
      ui();
    }
    if (m.t === 'bye') { remote = false; R = null; status('The pop-out window was closed.'); ui(); }
  };
  function run(c, a) {
    if (c === 'play') play(); else if (c === 'pause') pause(); else if (c === 'next') step(1); else if (c === 'prev') step(-1);
    else if (c === 'pick') pick(a, true); else if (c === 'duck') onSound();
    else if (c === 'seek') { try { A.currentTime = +a; } catch (e) { } }
    else if (c === 'set') { setOpt(a.k, a.v); }
    ui();
  }
  function setOpt(k, v) {
    if (remote) return send('set', { k: k, v: v });
    if (k === 'vol') { S.vol = +v; vol(); }
    else if (k === 'order') { S.order = v; S.q = v === 'shuffle' ? shuffle(queue(), S.track) : []; }
    else if (k === 'rep') S.rep = v;
    else if (k === 'list') { S.list = v; S.q = []; }
    else if (k === 'sleep') { S.sleep = +v ? Date.now() + v * 60000 : 0; fade = 1; vol(); }
    save(); ui();
  }
  function popout() {
    var url = ROOT + 'music/player/' + (S.playing && !A.paused ? '?play=1' : '');
    save();
    var w = null; try { w = W.open(url, 'trbmusic', 'popup,width=420,height=640'); } catch (e) { }
    if (!w) { status('Your browser blocked the window. Allow pop-ups for this site, or keep the player here.'); return; }
    if (!A.paused) A.pause(); S.playing = false;
    remote = true; lastPop = Date.now(); R = null; status('Opening the pop-out player…'); ui();
  }

  /* ---------- the panel ---------- */
  var ICON = {
    play: '<path d="M8 5v14l11-7z" fill="currentColor"/>', pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/>',
    prev: '<path d="M6 5h2v14H6zM20 5v14L9 12z" fill="currentColor"/>', next: '<path d="M16 5h2v14h-2zM4 5v14l11-7z" fill="currentColor"/>',
    note: '<path d="M9 17.5V6l10-2v11.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6.5" cy="17.5" r="2.5" fill="currentColor"/><circle cx="16.5" cy="15.5" r="2.5" fill="currentColor"/>'
  };
  function svg(k, s) { return '<svg viewBox="0 0 24 24" width="' + (s || 20) + '" height="' + (s || 20) + '" aria-hidden="true" focusable="false">' + ICON[k] + '</svg>'; }
  function fmt(s) { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  var P = D.createElement('section'), mini = D.createElement('div'), hb = null, open = false, msg = '';
  P.className = 'trbm' + (POP ? ' trbm-pop' : ''); P.setAttribute('aria-label', 'Background music player'); P.hidden = !POP;
  P.innerHTML =
    '<div class="trbm-h">' + svg('note', 18) + '<h2 class="trbm-tt">' + (POP ? 'The Continued-Fraction Suite' : 'Background music') + '</h2>' +
    (POP ? '' : '<button type="button" class="trbm-x" data-a="hide" aria-label="Hide the player (the music keeps playing)" title="Hide">×</button>') + '</div>' +
    '<p class="trbm-now"><span class="trbm-st"></span><a class="trbm-tl" href="#"></a></p>' +
    '<div class="trbm-prog"><span class="trbm-cur">0:00</span><input type="range" class="trbm-seek" min="0" max="200" step="1" value="0" aria-label="Position in the track"><span class="trbm-dur">0:00</span></div>' +
    '<div class="trbm-ctl"><button type="button" data-a="prev" aria-label="Previous track" title="Previous">' + svg('prev') + '</button>' +
    '<button type="button" class="trbm-pp" data-a="toggle" aria-label="Play">' + svg('play', 26) + '</button>' +
    '<button type="button" data-a="next" aria-label="Next track" title="Next">' + svg('next') + '</button>' +
    '<button type="button" class="trbm-opt" data-a="order" aria-pressed="false">Shuffle</button>' +
    '<button type="button" class="trbm-opt" data-a="rep"></button></div>' +
    '<label class="trbm-vol"><span>Volume</span><input type="range" min="0" max="1" step="0.05" aria-label="Volume"></label>' +
    '<details class="trbm-list"' + (POP ? ' open' : '') + '><summary></summary><ul>' + T.map(function (t) {
      return '<li><input type="checkbox" id="trbm-c-' + t.id + '" data-id="' + t.id + '"><label for="trbm-c-' + t.id + '">' + t.n + '</label>' +
        '<span class="trbm-d">' + fmt(t.d) + '</span><button type="button" data-a="pick" data-id="' + t.id + '" aria-label="Play ' + t.n + '">' + svg('play', 16) + '</button></li>';
    }).join('') + '</ul><p class="trbm-hint">Ticked movements are in the playlist.</p></details>' +
    '<div class="trbm-row"><label>Sleep timer <select class="trbm-sleep"><option value="0">Off</option><option value="15">15 min</option><option value="30">30 min</option><option value="60">60 min</option></select></label><span class="trbm-sl"></span>' +
    (POP ? '' : '<button type="button" class="trbm-opt" data-a="pop">Pop out player ↗</button>') + '</div>' +
    '<p class="trbm-msg" role="status" aria-live="polite"></p>' +
    '<p class="trbm-cr">Music: <i>The Continued-Fraction Suite</i>, composed by Teddy Rook. Piano sound: FluidR3_GM SoundFont by Frank Wen (MIT licence).</p>';
  mini.className = 'trbm-mini'; mini.hidden = true;
  function $(s) { return P.querySelector(s); }
  var el = { st: $('.trbm-st'), tl: $('.trbm-tl'), cur: $('.trbm-cur'), dur: $('.trbm-dur'), seek: $('.trbm-seek'), pp: $('.trbm-pp'),
    order: $('[data-a="order"]'), rep: $('[data-a="rep"]'), vol: $('.trbm-vol input'), sum: $('.trbm-list summary'), sleep: $('.trbm-sleep'),
    sl: $('.trbm-sl'), msg: $('.trbm-msg'), pop: $('[data-a="pop"]') };
  function status(t) { msg = t || ''; if (el.msg.textContent !== msg) el.msg.textContent = msg; }
  function view() { return remote && R ? R : snap(); }
  var seeking = false;
  function prog() {
    var v = view(), d = v.dur > 0 && isFinite(v.dur) ? v.dur : tr(v.S.track).d;
    el.cur.textContent = fmt(v.pos); el.dur.textContent = fmt(d);
    if (!seeking) { el.seek.max = Math.round(d); el.seek.value = Math.round(v.pos); }
    el.seek.setAttribute('aria-valuetext', fmt(v.pos) + ' of ' + fmt(d));
  }
  function sleepLabel() {
    var s = view().S.sleep, left = s - Date.now();
    el.sl.textContent = s && left > 0 ? 'pauses in ' + Math.ceil(left / 60000) + ' min' : '';
    if (!s || left <= 0) el.sleep.value = '0';
  }
  function ui() {
    var v = view(), s = v.S, t = tr(s.track), on = remote ? !v.paused : !A.paused || (S.playing && blocked);
    var playingNow = remote ? !v.paused : !A.paused;
    el.st.textContent = remote ? 'In the pop-out window: ' : (playingNow ? 'Now playing: ' : 'Paused: ');
    el.tl.textContent = t.n; el.tl.href = ROOT + 'music/continued-fraction-suite/' + t.u;
    el.tl.title = 'The piano lesson for ' + t.n;
    el.pp.innerHTML = svg(playingNow ? 'pause' : 'play', 26); el.pp.setAttribute('aria-label', playingNow ? 'Pause' : 'Play');
    el.order.setAttribute('aria-pressed', String(s.order === 'shuffle'));
    el.rep.textContent = 'Repeat: ' + s.rep; el.rep.setAttribute('aria-label', 'Repeat: ' + (s.rep === 'all' ? 'all tracks' : s.rep === 'one' ? 'this track' : 'off') + '. Press to change.');
    if (D.activeElement !== el.vol) el.vol.value = s.vol;
    var n = 0;
    T.forEach(function (x) {
      var c = P.querySelector('#trbm-c-' + x.id), inl = s.list.indexOf(x.id) >= 0; c.checked = inl; if (inl) n++;
      c.parentNode.classList.toggle('trbm-cur-t', x.id === s.track);
    });
    T.forEach(function (x) { var c = P.querySelector('#trbm-c-' + x.id); c.disabled = c.checked && n === 1; });
    el.sum.textContent = 'Tracks (' + n + ' of ' + T.length + ' in the playlist)';
    if (el.pop) el.pop.hidden = remote;
    prog(); sleepLabel();
    if (hb) { hb.classList.toggle('on', playingNow); hb.setAttribute('aria-expanded', String(open)); }
    // the small bar shown while the panel is closed: "Resume music" after a blocked autoplay, or what is playing
    if (!POP) {
      var show = !open && (blocked || playingNow);
      mini.hidden = !show;
      if (show) {
        var key = blocked ? 'b' : 'p' + s.track;
        if (mini.dataset.k !== key) {
          mini.dataset.k = key;
          mini.innerHTML = blocked
            ? '<button type="button" class="trbm-chip" data-a="toggle">Resume music ' + svg('play', 16) + '</button><button type="button" class="trbm-mx" data-a="forget" aria-label="No thanks, stop the music">×</button>'
            : '<button type="button" class="trbm-chip" data-a="show" aria-label="Show the music player. ' + (remote ? 'Playing in the pop-out window: ' : 'Now playing: ') + t.n + '">' + svg('note', 16) + '<span>' + t.n + '</span></button><button type="button" class="trbm-mx" data-a="toggle" aria-label="Pause">' + svg('pause', 16) + '</button>';
        }
      }
    }
  }
  function act(a, b) {
    if (a === 'toggle') { var v = view(); if (remote ? !v.paused : (!A.paused)) pause(); else play(); }
    else if (a === 'prev') step(-1); else if (a === 'next') step(1);
    else if (a === 'pick') pick(b.getAttribute('data-id'), true);
    else if (a === 'order') setOpt('order', view().S.order === 'shuffle' ? 'seq' : 'shuffle');
    else if (a === 'rep') { var r = view().S.rep; setOpt('rep', r === 'all' ? 'one' : r === 'one' ? 'off' : 'all'); }
    else if (a === 'pop') popout();
    else if (a === 'hide') panel(false, true);
    else if (a === 'show') panel(true);
    else if (a === 'forget') { blocked = false; S.playing = false; save(); ui(); }
    ui();
  }
  function click(e) { var b = e.target.closest('[data-a]'); if (!b) return; act(b.getAttribute('data-a'), b); }
  P.addEventListener('click', click); mini.addEventListener('click', click);
  el.vol.addEventListener('input', function () { setOpt('vol', el.vol.value); });
  el.seek.addEventListener('input', function () { seeking = true; el.cur.textContent = fmt(+el.seek.value); });
  el.seek.addEventListener('change', function () {
    seeking = false; var t = +el.seek.value;
    if (remote) send('seek', t); else if (A.readyState > 0) { try { A.currentTime = t; } catch (e) { } } else { S.pos = t; seekTo = t; save(); }
    prog();
  });
  el.sleep.addEventListener('change', function () { setOpt('sleep', +el.sleep.value); });
  P.addEventListener('change', function (e) {
    var c = e.target; if (!c.matches('input[type="checkbox"]')) return;
    var l = view().S.list.slice(), id = c.getAttribute('data-id'), i = l.indexOf(id);
    if (c.checked && i < 0) l.push(id); if (!c.checked && i >= 0) l.splice(i, 1);
    if (!l.length) { c.checked = true; return; }
    setOpt('list', IDS.filter(function (x) { return l.indexOf(x) >= 0; }));
  });
  P.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !POP) { panel(false, true); } });
  function panel(want, focusBack) {
    open = want == null ? !open : want; P.hidden = !open;
    if (open) { var f = el.pp; setTimeout(function () { try { f.focus(); } catch (e) { } }, 0); }
    else if (focusBack && hb) hb.focus();
    ui();
  }

  /* ---------- start ---------- */
  function mount() {
    if (POP) { var m = D.querySelector('main') || D.body; m.insertBefore(P, m.querySelector('.pp-note')); }
    else { D.body.appendChild(P); D.body.appendChild(mini); hb = D.querySelector('.trb-mbtn'); }
    if (bc && !POP) bc.postMessage({ t: 'ping' });
    if (S.sleep && S.sleep < Date.now()) S.sleep = 0;
    ui(); meta();
  }
  function cmd(c) {
    if (c === 'panel') panel();
    else if (c === 'play') { panel(true); var v = view(); if (remote ? v.paused : A.paused) play(); }
    else if (c === 'resume') {
      // a page change while music was playing: carry on from where it was, unless the pop-out has it
      setTimeout(function () { if (!remote && S.playing && Date.now() - S.t < FRESH) play(); }, 250);
    } else if (c === 'popout-init') {
      if (/[?&]play=1/.test(location.search) || (S.playing && Date.now() - S.t < FRESH)) play();
      ui();
    }
  }
  W.TRBPlayer = { cmd: cmd, audio: A };
  if (D.body) mount(); else D.addEventListener('DOMContentLoaded', mount);
  if (POP) { save(); cmd('popout-init'); }
})(window, document);
