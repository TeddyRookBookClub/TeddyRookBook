/* The chord finder page (/music/chords/) for guitar, ukulele and banjo (Teddy Rook Book, music kit). Needs audio.js,
   song.js and fret/core.js, sound.js, draw.js. Builds itself inside <div id="cf-app"></div>.

   - Pick the instrument, tuning, root and kind of chord (and a bass note for a slash chord). The chord is spelled
     (G B D), then the common first-position shapes are shown, then other playable shapes up the neck, from the
     kit's voicing finder. Press a diagram to hear it strummed.
   - The address keeps the choice (?i=guitar&t=standard&c=G7), so song pages link straight to a chord.
   - "Name that chord": tap the frets on a blank diagram (or use the arrow keys and Enter) and the finder names the
     chord, with its notes.
   - Remembers the instrument and tuning in localStorage 'trb-music-v1' ({ chords: { inst, tuning } }).
   Test hook: window.trbChords = { state: { inst, tuning, root, quality, bass }, shown: [shape texts], named: [names] }.
*/
(function () {
  'use strict';
  var TRB = window.TRBMusic = window.TRBMusic || {};
  var F = TRB.fret;
  var KEY = 'trb-music-v1';
  var ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  var QUALS = [['', 'major'], ['m', 'minor'], ['7', '7'], ['maj7', 'maj7'], ['m7', 'm7'], ['sus2', 'sus2'], ['sus4', 'sus4'], ['add9', 'add9'],
    ['6', '6'], ['m6', 'm6'], ['9', '9'], ['m9', 'm9'], ['7sus4', '7sus4'], ['dim', 'dim'], ['dim7', 'dim7'], ['m7b5', 'm7♭5'], ['aug', 'aug'], ['5', '5 (power)']];
  function sget() { try { var o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function sput(fn) { try { var o = sget(); fn(o); localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function pretty(s) { return String(s).replace(/#/g, '♯').replace(/([A-G])b/g, '$1♭'); }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function init() {
    var root = document.getElementById('cf-app');
    if (!root || !F || !F.findVoicings) return;
    var saved = sget().chords || {}, qs = {};
    location.search.replace(/^\?/, '').split('&').forEach(function (kv) { var p = kv.split('='); if (p[0]) qs[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || '').replace(/\+/g, ' ')); });
    var st = { inst: F.INSTRUMENTS[qs.i] ? qs.i : F.INSTRUMENTS[saved.inst] ? saved.inst : 'guitar', root: 'C', quality: '', bass: '' };
    st.tuning = F.INSTRUMENTS[st.inst].tunings[qs.t] ? qs.t : (saved.inst === st.inst && F.INSTRUMENTS[st.inst].tunings[saved.tuning] ? saved.tuning : F.INSTRUMENTS[st.inst].tuning);
    if (qs.c) { var pc = F.parseChord(qs.c); if (pc) { st.root = ROOTS.filter(function (r) { return F.parseChord(r).rootPc === pc.rootPc; })[0]; st.quality = pc.quality; st.bass = pc.bass ? ROOTS.filter(function (r) { return F.parseChord(r).rootPc === pc.bassPc; })[0] : ''; } }
    var test = window.trbChords = { state: st, shown: [], named: [] };

    root.innerHTML =
      '<div class="cf-ctl">' +
        '<div><span class="cf-lab" id="cf-il">Instrument</span><div class="mus-seg" role="group" aria-labelledby="cf-il" id="cf-inst"></div></div>' +
        '<div><label class="cf-lab" for="cf-tun">Tuning</label><select id="cf-tun"></select></div>' +
        '<div><label class="cf-lab" for="cf-bass">Bass note (slash chord)</label><select id="cf-bass"><option value="">The root (no slash)</option></select></div>' +
      '</div>' +
      '<div style="margin-top:.7rem"><span class="cf-lab" id="cf-rl">Root</span><div class="mus-seg cf-roots" role="group" aria-labelledby="cf-rl" id="cf-roots"></div></div>' +
      '<div style="margin-top:.6rem"><span class="cf-lab" id="cf-ql">Kind of chord</span><div class="mus-seg cf-quals" role="group" aria-labelledby="cf-ql" id="cf-quals"></div></div>' +
      '<div class="cf-head"><h2 id="cf-title"></h2><span class="cf-notes" id="cf-notes"></span></div>' +
      '<p class="mus-small" id="cf-help">Press a diagram to hear it. Numbers in the dots are fingers: 1 index, 2 middle, 3 ring, 4 little finger (T = thumb). x = don\'t play that string, o = play it open. A curved bar is a barre: one finger flat across several strings.</p>' +
      '<p class="cf-sub" id="cf-com-h">Common shapes</p><div class="cf-grid" id="cf-common"></div>' +
      '<p class="cf-sub" id="cf-more-h">More shapes, up the neck</p><div class="cf-grid" id="cf-more"></div>' +
      '<section class="mus-box" aria-labelledby="cf-rev-h"><h2 id="cf-rev-h">Name that chord</h2>' +
        '<p class="mus-small">Tap the frets where your fingers go, tap above a string to switch it between open (o) and not played (x). On a keyboard: arrow keys to move, Enter or Space to press. The name appears as you go.</p>' +
        '<div class="cf-rev"><div><div class="cf-pad" id="cf-pad" tabindex="0" role="application" aria-roledescription="chord diagram you can set" aria-describedby="cf-pad-live"></div>' +
          '<div class="fw-row"><button type="button" class="mus-btn" id="cf-up" aria-label="Show higher frets">Higher frets ↓</button><button type="button" class="mus-btn" id="cf-down" aria-label="Show lower frets">↑ Lower</button></div>' +
          '<div class="fw-row"><button type="button" class="mus-btn" id="cf-play">▶ Play it</button><button type="button" class="mus-btn" id="cf-clear">Clear</button></div></div>' +
          '<div><p class="fl-sr" id="cf-pad-live" aria-live="polite"></p><p class="cf-lab">It could be</p><ul class="cf-names" id="cf-names" aria-live="polite"></ul><p class="mus-small" id="cf-rnotes"></p></div></div>' +
      '</section>';
    var $ = function (id) { return document.getElementById(id); };
    var instEl = $('cf-inst'), tunEl = $('cf-tun'), bassEl = $('cf-bass'), rootsEl = $('cf-roots'), qualsEl = $('cf-quals');
    Object.keys(F.INSTRUMENTS).forEach(function (k) { var b = h('button', null, F.INSTRUMENTS[k].name); b.type = 'button'; b.setAttribute('data-v', k); b.addEventListener('click', function () { st.inst = k; st.tuning = F.INSTRUMENTS[k].tuning; resetPad(); update(true); }); instEl.appendChild(b); });
    ROOTS.forEach(function (r) { var b = h('button', null, pretty(r)); b.type = 'button'; b.setAttribute('data-v', r); b.addEventListener('click', function () { st.root = r; update(); }); rootsEl.appendChild(b); });
    QUALS.forEach(function (q) { var b = h('button', null, q[1]); b.type = 'button'; b.setAttribute('data-v', q[0]); b.setAttribute('aria-label', F.QUALITIES[q[0]].long); b.addEventListener('click', function () { st.quality = q[0]; update(); }); qualsEl.appendChild(b); });
    ROOTS.forEach(function (r) { var o = h('option', null, pretty(r)); o.value = r; bassEl.appendChild(o); });
    tunEl.addEventListener('change', function () { st.tuning = tunEl.value; resetPad(); update(true); });
    bassEl.addEventListener('change', function () { st.bass = bassEl.value; update(); });
    var boxes = [];
    function update(redrawPad) {
      sput(function (o) { o.chords = { inst: st.inst, tuning: st.tuning }; });
      var I = F.INSTRUMENTS[st.inst];
      Array.prototype.forEach.call(instEl.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === st.inst)); });
      Array.prototype.forEach.call(rootsEl.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === st.root)); });
      Array.prototype.forEach.call(qualsEl.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === st.quality)); });
      tunEl.innerHTML = '';
      Object.keys(I.tunings).forEach(function (k) { var o = h('option', null, I.tunings[k].name); o.value = k; if (k === st.tuning) o.selected = true; tunEl.appendChild(o); });
      bassEl.value = st.bass;
      var bassSame = st.bass && F.parseChord(st.bass).rootPc === F.parseChord(st.root).rootPc;
      var name = st.root + st.quality + (st.bass && !bassSame ? '/' + st.bass : '');
      var ch = F.parseChord(name);
      $('cf-title').textContent = pretty(ch.long.charAt(0).toUpperCase() + ch.long.slice(1)) + ' (' + pretty(name) + ')';
      $('cf-notes').textContent = 'Notes: ' + ch.notes.map(pretty).join(' ') + (ch.optional.length ? ' (the ' + (ch.quality === '5' ? '' : '5th, ') + 'can be left out)' : '').replace(' (the 5th, can', ' (the 5th can');
      try { history.replaceState(null, '', '?i=' + st.inst + '&t=' + st.tuning + '&c=' + encodeURIComponent(name)); } catch (e) {}
      boxes.forEach(function (b) { b.destroy(); }); boxes = [];
      var all = F.shapesFor(ch, st.inst, st.tuning, { limit: 24, maxFret: 12 });
      var com = all.filter(function (v) { return v.common; }), more = all.filter(function (v) { return !v.common; });
      if (!com.length && more.length) { com = more.slice(0, 2); more = more.slice(2); }
      more = more.slice().sort(function (a, b) { return a.score - b.score; }).slice(0, 12); // the easiest twelve,
      more.sort(function (a, b) { return a.minFret - b.minFret || a.score - b.score; });   // shown from the nut up
      var cEl = $('cf-common'), mEl = $('cf-more');
      cEl.innerHTML = ''; mEl.innerHTML = '';
      $('cf-com-h').hidden = !com.length;
      $('cf-more-h').hidden = !more.length;
      if (!all.length) cEl.innerHTML = '<p class="mus-note">No playable shape for this chord in this tuning within the first 12 frets.</p>';
      test.shown = [];
      [[com, cEl], [more, mEl]].forEach(function (pair) {
        pair[0].forEach(function (v) {
          var where = v.minFret <= 0 || v.base === 1 ? 'open position' : 'fret ' + v.minFret;
          boxes.push(F.draw.chordBox(pair[1], v, { inst: st.inst, tuning: st.tuning, name: name, caption: F.shapeText(v.frets, st.inst) + ' · ' + where, title: F.shapeText(v.frets, st.inst) + ', ' + where, root: ch.rootPc }));
          test.shown.push(F.shapeText(v.frets, st.inst));
        });
      });
      if (redrawPad) drawPad();
    }
    // ---------- name that chord ----------
    var pad = $('cf-pad'), live = $('cf-pad-live'), pfr = null, pbase = 1, focus = null;
    function resetPad() { var I = F.INSTRUMENTS[st.inst]; pfr = []; for (var i = 0; i < I.strings; i++) pfr.push(I.short && i === 0 ? 0 : -1); pbase = 1; focus = null; }
    resetPad();
    function strsShown() { var I = F.INSTRUMENTS[st.inst], a = []; for (var s = I.strings; s >= 1; s--) if (!(I.short && s === I.short.string)) a.push(s); return a; }
    function drawPad() {
      var I = F.INSTRUMENTS[st.inst], fr = pfr.slice();
      var v = { frets: fr, fingers: F.fingersFor(fr, st.inst).fingers, barre: null, base: pbase };
      pad.innerHTML = F.draw.diagram(v, { inst: st.inst, tuning: st.tuning, interactive: true, frets: 5, notes: true, focus: pad === document.activeElement ? focus : null, label: 'Your chord: ' + describe() });
      var names = F.nameChord(fr, st.inst, st.tuning);
      var ul = $('cf-names');
      var P = F.shapePitches(fr, st.inst, st.tuning, 0).filter(function (p) { return !(I.short && p.s === I.short.string); });
      ul.innerHTML = names.length ? names.slice(0, 4).map(function (n, i) { return '<li>' + (i === 0 ? '<b>' + pretty(n.name) + '</b>' : pretty(n.name)) + ' <span class="mus-small">' + pretty(n.long) + '</span></li>'; }).join('') : '<li>' + (P.length < 2 ? 'Tap at least two strings: a fret, or above the nut for an open string.' : 'No common chord has exactly these notes.') + '</li>';
      $('cf-rnotes').textContent = P.length ? 'Notes, low to high: ' + P.slice().sort(function (a, b) { return a.midi - b.midi; }).map(function (p) { return pretty(F.noteName(p.midi)); }).join(' ') + '. Shape: ' + F.shapeText(fr, st.inst) + '.' : '';
      test.named = names.map(function (n) { return n.name; });
    }
    function describe() { var I = F.INSTRUMENTS[st.inst]; return strsShown().map(function (s) { var f = pfr[I.strings - s]; return 'string ' + s + (f < 0 ? ' not played' : f === 0 ? ' open' : ' fret ' + f); }).join(', '); }
    function press(s, f) {
      var I = F.INSTRUMENTS[st.inst], i = I.strings - s;
      if (f === 0) pfr[i] = pfr[i] === 0 ? -1 : 0;
      else pfr[i] = pfr[i] === f ? 0 : f;
      drawPad();
      live.textContent = 'String ' + s + (pfr[i] < 0 ? ' not played' : pfr[i] === 0 ? ' open' : ' at fret ' + pfr[i]) + '. ' + ($('cf-names').firstChild ? $('cf-names').firstChild.textContent : '');
    }
    pad.addEventListener('click', function (e) { var c = e.target.closest && e.target.closest('.fd-cell'); if (!c) return; focus = { s: +c.getAttribute('data-s'), f: +c.getAttribute('data-f') }; press(focus.s, focus.f); });
    var ptr = false;
    pad.addEventListener('pointerdown', function () { ptr = true; });
    pad.addEventListener('focus', function () { if (ptr) { ptr = false; return; } if (!focus) focus = { s: strsShown()[0], f: 0 }; drawPad(); });
    pad.addEventListener('blur', function () { drawPad(); });
    pad.addEventListener('keydown', function (e) {
      var ss = strsShown(), lefty = F.prefs.lefty(), order = lefty ? ss.slice().reverse() : ss, k = order.indexOf(focus ? focus.s : order[0]), f = focus ? focus.f : 0;
      if (e.key === 'ArrowRight') k = Math.min(order.length - 1, k + 1);
      else if (e.key === 'ArrowLeft') k = Math.max(0, k - 1);
      else if (e.key === 'ArrowDown') f = f === 0 ? pbase : Math.min(pbase + 4, f + 1);
      else if (e.key === 'ArrowUp') f = f <= pbase ? 0 : f - 1;
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); press(focus.s, focus.f); return; }
      else return;
      e.preventDefault();
      focus = { s: order[k], f: f };
      drawPad();
      live.textContent = 'String ' + focus.s + ', ' + (f === 0 ? 'above the nut (open or not played)' : 'fret ' + f);
    });
    // moving the window lets go of the fretted strings (open and muted strings stay as they are)
    function shift(d) { var nb = Math.max(1, Math.min(15, pbase + d)); if (nb === pbase) return; pbase = nb; pfr = pfr.map(function (f) { return f > 0 ? 0 : f; }); if (focus && focus.f) focus.f = pbase; drawPad(); live.textContent = 'Showing frets ' + pbase + ' to ' + (pbase + 4) + '.'; }
    $('cf-up').addEventListener('click', function () { shift(1); });
    $('cf-down').addEventListener('click', function () { shift(-1); });
    $('cf-clear').addEventListener('click', function () { resetPad(); drawPad(); });
    $('cf-play').addEventListener('click', function () {
      if (!F.sound) return;
      var I = F.INSTRUMENTS[st.inst], notes = F.shapePitches(pfr, st.inst, st.tuning, 0).filter(function (p) { return !(I.short && p.s === I.short.string); }).sort(function (a, b) { return b.s - a.s; }).map(function (p) { return { midi: p.midi, string: p.s }; });
      TRB.audio && TRB.audio.unlock();
      F.sound.strum(notes, 0, { inst: st.inst, dir: 'down', vel: 0.7, group: 'ui' });
    });
    F.prefs.onLefty(function () { update(true); });
    update(true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
