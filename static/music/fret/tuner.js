/* The tuner page (/music/tuner/) for guitar, ukulele and banjo (Teddy Rook Book, music kit). Needs audio.js and
   fret/core.js, pitch.js, sound.js, draw.js. Builds itself inside <div id="tu-app"></div>.

   - Pick the instrument and tuning; the string buttons play a steady reference tone to tune by ear (press again, or
     Stop sound, to stop it).
   - "Start the tuner" asks for the microphone with getUserMedia, only after that press. The sound is analyzed in the
     browser (fret/pitch.js, YIN) and is never recorded, stored or sent anywhere. A message explains what to do when
     the microphone is missing, blocked or the page isn't on https.
   - Shows the nearest note, its octave and frequency, the string it belongs to, a needle from 50 cents flat to 50
     cents sharp, and "In tune" within ±5 cents. Auto mode follows whichever string you play; pressing a string's
     button while listening makes it the target.
   - Remembers the instrument and tuning in localStorage 'trb-music-v1' ({ tuner: { inst, tuning, a4 } }).
   Test hook: window.trbTuner = { state: 'idle' | 'asking' | 'listening' | 'error', last: { freq, note, cents,
     string, inTune }, readings }.
*/
(function () {
  'use strict';
  var TRB = window.TRBMusic = window.TRBMusic || {};
  var F = TRB.fret;
  var KEY = 'trb-music-v1';
  function sget() { try { var o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function sput(fn) { try { var o = sget(); fn(o); localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function pretty(s) { return String(s).replace(/#/g, '♯').replace(/([A-G])b/g, '$1♭'); }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function init() {
    var root = document.getElementById('tu-app');
    if (!root || !F || !F.pitch) return;
    var saved = sget().tuner || {};
    var st = { inst: F.INSTRUMENTS[saved.inst] ? saved.inst : 'guitar', tuning: null, a4: saved.a4 >= 430 && saved.a4 <= 450 ? saved.a4 : 440, target: null, tone: null, toneIdx: -1 };
    st.tuning = saved.tuning && F.INSTRUMENTS[st.inst].tunings[saved.tuning] ? saved.tuning : F.INSTRUMENTS[st.inst].tuning;
    var test = window.trbTuner = { state: 'idle', last: null, readings: 0 };

    root.className = 'tu';
    root.innerHTML =
      '<div class="tu-ctl">' +
        '<div class="mus-seg" role="group" aria-label="Instrument" id="tu-inst"></div>' +
        '<label>Tuning <select id="tu-tuning"></select></label>' +
        '<label>A4 = <select id="tu-a4" aria-label="Reference pitch for A4, in hertz"></select> Hz</label>' +
      '</div>' +
      '<section class="tu-stage" aria-labelledby="tu-h">' +
        '<h2 id="tu-h" class="fl-sr">Tuner</h2>' +
        '<p class="tu-note" id="tu-note" aria-hidden="true">–</p>' +
        '<p class="tu-freq" id="tu-freq"></p>' +
        '<svg class="tu-meter" viewBox="0 0 100 54" aria-hidden="true">' +
          '<path class="tu-zone" d="M46.6 13.3 A36 36 0 0 1 53.4 13.3 L50 48 Z"/>' +
          '<path class="tu-scale" d="M14 48 A36 36 0 0 1 86 48" fill="none"/>' +
          ticks() +
          '<text class="tu-lab" x="12" y="53" text-anchor="middle">−50</text><text class="tu-lab" x="50" y="9" text-anchor="middle">0</text><text class="tu-lab" x="88" y="53" text-anchor="middle">+50</text>' +
          '<text class="tu-lab" x="22" y="30" text-anchor="middle">flat</text><text class="tu-lab" x="78" y="30" text-anchor="middle">sharp</text>' +
          '<line class="tu-needle" id="tu-needle" x1="50" y1="48" x2="50" y2="15"/>' +
          '<circle class="tu-hub" cx="50" cy="48" r="2.2"/>' +
        '</svg>' +
        '<p class="tu-say" id="tu-say" aria-live="polite"></p>' +
        '<div class="tu-level" aria-hidden="true"><i id="tu-level"></i></div>' +
        '<div class="tu-strings" id="tu-strings" role="group" aria-label="Strings: press one to hear its note"></div>' +
        '<div class="tu-ctl">' +
          '<button type="button" class="mus-btn pri" id="tu-go">🎤 Start the tuner</button>' +
          '<button type="button" class="mus-btn" id="tu-auto" aria-pressed="true" title="Follow whichever string you play">Auto string</button>' +
          '<button type="button" class="mus-btn" id="tu-stop">■ Stop sound</button>' +
        '</div>' +
        '<p class="tu-msg" id="tu-msg">The tuner listens through your microphone after you press <b>Start the tuner</b>. Your browser will ask first. The sound is analyzed right here on your device: nothing is recorded, saved or sent anywhere.</p>' +
      '</section>';
    var $ = function (id) { return document.getElementById(id); };
    var instEl = $('tu-inst'), tunEl = $('tu-tuning'), a4El = $('tu-a4'), strEl = $('tu-strings'), noteEl = $('tu-note'), freqEl = $('tu-freq'), sayEl = $('tu-say'), needle = $('tu-needle'), msg = $('tu-msg'), go = $('tu-go'), autoB = $('tu-auto'), lvl = $('tu-level');
    for (var a = 430; a <= 450; a++) { var op = h('option', null, String(a)); op.value = a; if (a === st.a4) op.selected = true; a4El.appendChild(op); }
    Object.keys(F.INSTRUMENTS).forEach(function (k) {
      var b = h('button', null, F.INSTRUMENTS[k].name); b.type = 'button'; b.setAttribute('data-i', k);
      b.addEventListener('click', function () { setInst(k); });
      instEl.appendChild(b);
    });
    function save() { sput(function (o) { o.tuner = { inst: st.inst, tuning: st.tuning, a4: st.a4 }; }); }
    function tun() { return F.tuning(st.inst, st.tuning); }
    function setInst(k) {
      st.inst = k; st.tuning = F.INSTRUMENTS[k].tuning; st.target = null; stopTone();
      paint(); save();
    }
    tunEl.addEventListener('change', function () { st.tuning = tunEl.value; st.target = null; stopTone(); paint(); save(); });
    a4El.addEventListener('change', function () { st.a4 = +a4El.value; save(); });
    function midiFreq(m) { return st.a4 * Math.pow(2, (m - 69) / 12); }
    function paint() {
      Array.prototype.forEach.call(instEl.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-i') === st.inst)); });
      var I = F.INSTRUMENTS[st.inst];
      tunEl.innerHTML = '';
      Object.keys(I.tunings).forEach(function (k) { var o = h('option', null, I.tunings[k].name); o.value = k; if (k === st.tuning) o.selected = true; tunEl.appendChild(o); });
      var T = tun();
      strEl.innerHTML = '';
      // strings from the highest number to string 1, as they sit from the top of the neck down
      T.midi.forEach(function (m, i) {
        var s = I.strings - i;
        var b = h('button', 'tu-str', '<span>' + pretty(T.notes[i].replace(/(-?\d)$/, '<sub>$1</sub>')) + '</span>' + '<small>string ' + s + (I.short && s === I.short.string ? ' (short)' : '') + '</small>');
        b.type = 'button'; b.setAttribute('data-k', i);
        b.setAttribute('aria-pressed', 'false');
        b.setAttribute('aria-label', 'String ' + s + ': ' + pretty(T.notes[i]) + ', ' + midiFreq(m).toFixed(1) + ' hertz. Press to hear it' + (listening ? ' and tune this string' : ''));
        b.addEventListener('click', function () { pressString(i); });
        strEl.appendChild(b);
      });
      autoB.setAttribute('aria-pressed', String(st.target == null));
      markStrings();
    }
    function markStrings(near, ok) {
      Array.prototype.forEach.call(strEl.children, function (b) {
        var k = +b.getAttribute('data-k');
        b.classList.toggle('on', near === k);
        b.classList.toggle('ok', near === k && !!ok);
        b.setAttribute('aria-pressed', String(st.toneIdx === k || st.target === k));
      });
    }
    function pressString(i) {
      if (listening) { st.target = i; autoB.setAttribute('aria-pressed', 'false'); }
      if (st.toneIdx === i) { stopTone(); markStrings(); return; }
      stopTone();
      if (TRB.audio) TRB.audio.unlock();
      var m = tun().midi[i];
      if (F.sound && F.sound.tone) {
        // A4 other than 440: shift the reference tone by the same ratio
        st.tone = F.sound.tone(m + 12 * Math.log(st.a4 / 440) / Math.LN2, { secs: 6, vol: listening ? 0.12 : 0.18 });
        st.toneIdx = i;
        clearTimeout(st.toneT); st.toneT = setTimeout(function () { st.toneIdx = -1; st.tone = null; markStrings(); }, 6000);
      }
      markStrings();
    }
    function stopTone() { if (st.tone) st.tone.stop(); st.tone = null; st.toneIdx = -1; clearTimeout(st.toneT); }
    autoB.addEventListener('click', function () { st.target = null; paint(); });
    $('tu-stop').addEventListener('click', function () { stopTone(); if (TRB.audio) TRB.audio.stopAll(); markStrings(); });

    // ---------- listening ----------
    var listening = false, stream = null, src = null, an = null, buf = null, raf = 0, tracker = F.pitch.tracker(), inTune = false, lastT = 0;
    function say(t, bad) { msg.innerHTML = t; msg.classList.toggle('tu-bad', !!bad); }
    go.addEventListener('click', function () { if (listening) stop(); else start(); });
    function start() {
      if (TRB.audio) TRB.audio.unlock();
      var md = navigator.mediaDevices;
      if (!window.isSecureContext || !md || !md.getUserMedia) {
        test.state = 'error';
        say('This browser can\'t use the microphone on this page. The microphone works only on secure (https) pages in an up-to-date browser. You can still tune by ear: press a string above to hear its note.', true);
        return;
      }
      test.state = 'asking';
      say('Waiting for permission to use the microphone…');
      md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (s) {
        stream = s;
        var c = TRB.audio.ctx();
        if (c.state === 'suspended' && c.resume) c.resume();
        src = c.createMediaStreamSource(s);
        an = c.createAnalyser(); an.fftSize = 4096; an.smoothingTimeConstant = 0;
        src.connect(an); // not connected to the speakers: nothing is played back, nothing is kept
        buf = new Float32Array(an.fftSize);
        listening = true; test.state = 'listening';
        go.innerHTML = '■ Stop the tuner';
        say('Listening. Play one string at a time and let it ring. Nothing is recorded or sent anywhere.');
        paint();
        tracker.reset();
        loop();
      }).catch(function (e) {
        test.state = 'error';
        var n = e && e.name;
        if (n === 'NotAllowedError' || n === 'SecurityError') say('The microphone is blocked for this page. To use the tuner, allow the microphone in your browser\'s site settings (often the lock or camera icon next to the address), then press Start again. Or tune by ear with the string buttons above.', true);
        else if (n === 'NotFoundError' || n === 'OverconstrainedError') say('No microphone was found. Plug one in or check your sound settings, then press Start again. You can also tune by ear with the string buttons above.', true);
        else say('The microphone could not be started' + (n ? ' (' + n + ')' : '') + '. Close other apps that may be using it and try again, or tune by ear with the string buttons above.', true);
      });
    }
    function stop() {
      listening = false; test.state = 'idle';
      cancelAnimationFrame(raf);
      try { if (src) src.disconnect(); } catch (e) {}
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null; src = null; an = null;
      go.innerHTML = '🎤 Start the tuner';
      say('The tuner has stopped and the microphone is off.');
      show(null);
      paint();
    }
    function loop() {
      if (!listening) return;
      raf = requestAnimationFrame(loop);
      var now = performance.now();
      if (now - lastT < 45) return; // about 20 readings a second
      lastT = now;
      an.getFloatTimeDomainData(buf);
      var T = tun(), lo = Math.min.apply(null, T.midi.map(midiFreq));
      var r = F.pitch.detect(buf, an.context.sampleRate, { minHz: Math.max(30, lo * 0.55), maxHz: 1500 });
      var rms = 0; for (var i = 0; i < buf.length; i += 4) rms += buf[i] * buf[i];
      lvl.style.width = Math.min(100, Math.sqrt(rms / (buf.length / 4)) * 600) + '%';
      var t = tracker.push(r, now / 1000);
      test.readings++;
      show(t);
    }
    function show(t) {
      if (!t) {
        noteEl.innerHTML = '–'; freqEl.textContent = ''; sayEl.textContent = listening ? 'Play a string' : '';
        needle.style.transform = 'rotate(0deg)'; root.classList.remove('tu-in'); markStrings(); inTune = false;
        return;
      }
      var f = t.freq, T = tun(), ref, label, sIdx = null;
      if (st.target != null) { sIdx = st.target; ref = midiFreq(T.midi[sIdx]); }
      else {
        var ns = F.pitch.nearestString(f, T.midi, st.a4);
        if (ns && Math.abs(ns.cents) < 350) { sIdx = ns.index; ref = midiFreq(ns.midi); }
      }
      var nn = F.pitch.nearestNote(f, st.a4);
      var c = sIdx != null && Math.abs(F.pitch.cents(f, ref)) < 600 ? F.pitch.cents(f, ref) : nn.cents;
      var targetName = sIdx != null && Math.abs(F.pitch.cents(f, ref)) < 600 ? T.notes[sIdx] : nn.name;
      noteEl.innerHTML = pretty(nn.name.replace(/(-?\d)$/, '<small>$1</small>'));
      var I = F.INSTRUMENTS[st.inst];
      freqEl.textContent = f.toFixed(1) + ' Hz' + (sIdx != null ? ' · string ' + (I.strings - sIdx) + ' (' + pretty(T.notes[sIdx]) + ')' : '');
      var cc = Math.max(-50, Math.min(50, c));
      needle.style.transform = 'rotate(' + (cc * 1.1).toFixed(1) + 'deg)';
      var was = inTune;
      inTune = Math.abs(c) <= (was ? 6 : 5); // a little hysteresis so it doesn't flicker at the edge
      root.classList.toggle('tu-in', inTune && t.stable !== false);
      var txt;
      if (inTune) txt = '✓ In tune' + (sIdx != null ? ': ' + pretty(targetName) : '');
      else if (Math.abs(c) > 50) txt = (c < 0 ? 'Far too low: tighten (tune up) toward ' : 'Far too high: loosen (tune down) toward ') + pretty(targetName);
      else txt = Math.round(Math.abs(c)) + ' cents ' + (c < 0 ? 'flat: tune up a little' : 'sharp: tune down a little');
      if (!t.held) sayEl.textContent = txt;
      markStrings(sIdx, inTune);
      test.last = { freq: f, note: nn.name, cents: c, string: sIdx != null ? I.strings - sIdx : null, inTune: inTune, target: targetName };
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden && listening) stop(); });
    window.addEventListener('pagehide', function () { if (listening) stop(); });
    paint();
  }
  function ticks() {
    var s = '';
    for (var c = -50; c <= 50; c += 10) {
      var a = (c * 1.1 - 90) * Math.PI / 180, r0 = c === 0 ? 31 : 33, r1 = 36;
      s += '<line class="tu-scale" x1="' + (50 + r0 * Math.cos(a)).toFixed(2) + '" y1="' + (48 + r0 * Math.sin(a)).toFixed(2) + '" x2="' + (50 + r1 * Math.cos(a)).toFixed(2) + '" y2="' + (48 + r1 * Math.sin(a)).toFixed(2) + '"/>';
    }
    return s;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
