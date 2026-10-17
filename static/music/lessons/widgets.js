/* TRBMusic.lessons.ui: the interactive pieces of the music lessons (Teddy Rook Book). Needs the kit (audio.js, song.js,
   staff.js, keyboard.js) and lessons/core.js. Every widget is declared in the page's HTML with a data-ml attribute and
   mounted here; nothing sounds before the reader presses, clicks or taps something.

   Widgets (attributes in brackets are optional)
     data-ml="kb"        a piano keyboard to play  [data-range="C3-C5" data-range-sm="C4-C5" data-labels="on|off|c"
                         data-lit='{"rh": ["C4"], "lh": ["F3"]}' data-fingers='{"rh": {"C4": 1}}' data-min-key="20"]
     data-ml="keys"      keyboard tasks: data-tasks='[{ "say": "Press every C.", "find": "C" }, …]' (see Keys below)
                         [data-range, data-range-sm, data-labels, data-black-names="1", data-title]
     data-ml="staff"     a staff picture from the kit's renderer: data-src="C4/4 D4/4" (or JSON {rh, lh, key, time, marks})
                         [data-clef, data-key, data-time, data-opts='{"timeSig":false}', data-letters="1",
                          data-letters-btn="1", data-hear="0", data-tempo="80", data-under="1 2 3 _ 4" (labels under the
                          notes), data-artic=". > - _" (staccato, accent, tenuto per note), data-norest="1",
                          data-order="0 1 0 2" (play order of bars), data-cursor="1", data-label, data-max="420" (px),
                          data-vels="0.3 0.4 0.5" (loudness per note when played)]
     data-ml="explore"   press a key and see the note on the staff  data-clef="treble|bass|grand" [data-range…]
     data-ml="drill"     a ten-question drill: data-type = name | findkey | place | linespace | beats | keysig |
                         interval | stepskip | halfwhole | quiz;  data-id (progress key), data-clef, data-title,
                         [data-levels='[…]', data-intro]; quiz items in a child <script type="application/json">
     data-ml="rhythm"    read a rhythm and tap it with the metronome click  data-id [data-times="4/4 3/4 2/4"]
     data-ml="playalong" play notes in time with a click  data-id data-music="C4/4 D4/4 | …" [data-fingers, data-range]
     data-ml="fingers"   two hands with finger numbers to tap, and a finger quiz
     data-ml="pedals"    a keyboard with the three pedals
     data-ml="circle"    the circle of fifths with each key's signature and scale
     data-ml="check"     a checklist (items in a child <ul>) remembered in this browser  data-id
     data-ml="player"    the kit's song player for a song the page embeds (data-song = slug; the layout supplies the YAML)
   Progress (drill scores, finished chapters, preferences) lives only in this browser: localStorage
   'trb-music-read-v1' = { drills: { id: { best: [right, total], last, rounds, at } }, done: { chapter: time }, prefs }.
*/
(function () {
  'use strict';
  var TRB = window.TRBMusic = window.TRBMusic || {};
  var L = TRB.lessons = TRB.lessons || {};
  var C = L.core, A = TRB.audio, K = TRB.keyboard, ST = TRB.staff, SO = TRB.song;
  if (!C) return;
  var KEY = 'trb-music-read-v1';
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var uid = 0;

  /* ================= small helpers ================= */
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function attr(el, n, d) { var v = el.getAttribute('data-' + n); return v == null || v === '' ? d : v; }
  function jattr(el, n, d) { var v = el.getAttribute('data-' + n); if (!v) return d; try { return JSON.parse(v); } catch (e) { return d; } }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function btn(label, cls, title) { var b = h('button', 'mus-btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; if (title) b.title = title; return b; }
  function midiOf(x) { if (typeof x === 'number') return x; if (/^\d+$/.test(x)) return +x; var p = C.pitch(x); if (!p) throw new Error('music lessons: bad note "' + x + '"'); return p.midi; }
  function range(s, d) { var p = String(s || d).split('-'); return [midiOf(p[0]), midiOf(p[1])]; }
  var SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  var FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  function pc(m) { return ((m % 12) + 12) % 12; }
  function isBlack(m) { return [1, 3, 6, 8, 10].indexOf(pc(m)) >= 0; }
  function keyName(m) { var p = pc(m); return isBlack(m) ? SHARP[p] + ' (also called ' + FLAT[p] + ')' : SHARP[p]; }
  function shortName(m) { var p = pc(m); return isBlack(m) ? SHARP[p] + '/' + FLAT[p] : SHARP[p]; }
  function oct(m) { return Math.floor(m / 12) - 1; }
  function clean(o) { var r = {}; Object.keys(o).forEach(function (k) { if (o[k] !== undefined) r[k] = o[k]; }); return r; }
  function smallScreen(el) { return (el.clientWidth || window.innerWidth) < 520; }
  function later(fn, ms) { return setTimeout(fn, ms); }
  function posText(p, clef) {
    var s = C.staffPos(p, clef), n = C.ledgers(p, clef);
    var cn = clef === 'bass' ? 'bass' : 'treble';
    if (s >= 0 && s <= 8) return s % 2 === 0 ? 'on line ' + (s / 2 + 1) + ' of the ' + cn + ' staff (counting from the bottom)' : 'in space ' + ((s + 1) / 2) + ' of the ' + cn + ' staff (counting from the bottom)';
    if (s === -1) return 'just below the ' + cn + ' staff';
    if (s === 9) return 'just above the ' + cn + ' staff';
    var ord = ['', 'first', 'second', 'third', 'fourth'][n] || n + 'th';
    if (s < 0) return s % 2 === 0 ? 'on the ' + ord + ' ledger line below the ' + cn + ' staff' : 'just under the ' + ord + ' ledger line below the ' + cn + ' staff';
    return s % 2 === 0 ? 'on the ' + ord + ' ledger line above the ' + cn + ' staff' : 'just above the ' + ord + ' ledger line above the ' + cn + ' staff';
  }

  /* ================= progress in this browser ================= */
  function sget() { try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); return s && typeof s === 'object' ? s : {}; } catch (e) { return {}; } }
  function sput(fn) { var s = sget(); try { fn(s); localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} return s; }
  function pref(name, val) {
    if (val === undefined) { var p = sget().prefs || {}; return p[name]; }
    sput(function (s) { (s.prefs = s.prefs || {})[name] = val; });
  }
  function page() { var p = document.getElementById('ml-page'); return p ? p.getAttribute('data-chapter') : ''; }
  function markDone() {
    var k = page();
    if (!k) return;
    sput(function (s) { (s.done = s.done || {})[k] = Date.now(); });
    paintDone();
  }
  function paintDone() {
    var done = sget().done || {};
    document.querySelectorAll('[data-done-key]').forEach(function (a) {
      var on = !!done[a.getAttribute('data-done-key')];
      a.classList.toggle('done', on);
      var sr = a.querySelector('.ml-sr-done');
      if (on && !sr) a.appendChild(h('span', 'ml-sr ml-sr-done', ' (done)'));
    });
    var n = document.querySelectorAll('[data-done-count]');
    n.forEach(function (el) {
      var pre = el.getAttribute('data-done-count'), c = Object.keys(done).filter(function (k) { return k.indexOf(pre) === 0; }).length;
      var tot = +el.getAttribute('data-done-total') || 0;
      el.textContent = c ? (c >= tot && tot ? 'You have finished every chapter here. Well done.' : 'You have finished ' + c + ' of ' + tot + ' chapters in this browser.') : '';
      el.hidden = !c;
    });
  }
  function recordDrill(id, right, total) {
    var st = sput(function (s) { C.record(s, id, right, total, Date.now()); });
    return st.drills && st.drills[id];
  }
  function drillInfo(id) { var d = sget().drills || {}; return d[id] || null; }

  /* ================= sound ================= */
  function audioOK() { return !!(A && A.play); }
  function tone(m, dur, vel, when) { if (!audioOK()) return; A.unlock(); A.play(m, when || 0, dur || 0.9, vel == null ? 0.7 : vel); }
  function playSeq(ms, gap, dur) { if (!audioOK()) return; A.unlock(); var t = A.now() + 0.05; ms.forEach(function (m, i) { [].concat(m).forEach(function (x) { A.play(x, t + i * gap, dur || gap * 0.95, 0.65); }); }); }
  // the AudioContext time the listener hears at an event's timeStamp (falls back to "now minus output latency")
  function heardAt(stamp) {
    var c = A.ctx && A.ctx();
    if (!c) return 0;
    try {
      if (c.getOutputTimestamp && stamp) {
        var ts = c.getOutputTimestamp();
        if (ts && ts.performanceTime > 0 && ts.contextTime > 0) return ts.contextTime + (stamp - ts.performanceTime) / 1000;
      }
    } catch (e) {}
    return c.currentTime - (A.latency ? A.latency() : 0);
  }
  function heardNow() { return heardAt(window.performance ? performance.now() : 0); }
  function calib() { // the delay correction measured in the Rhythm trainer, if the reader did that (seconds)
    try { var r = JSON.parse(localStorage.getItem('trb-music-rhythm-v1') || '{}'); return r && r.calib && isFinite(r.calib.ms) ? r.calib.ms / 1000 : 0; } catch (e) { return 0; }
  }

  /* ================= keyboard ================= */
  // whole rests can be hidden in a box with class ml-norest (a key signature shown alone, an empty staff of a grand staff)
  function restCSS() {
    if (!ST || !ST.glyphs || !ST.glyphs.r1 || document.getElementById('ml-norest-css')) return;
    var st = h('style'); st.id = 'ml-norest-css';
    st.textContent = '.ml-norest path.ms-ink[d="' + ST.glyphs.r1.d.replace(/["\\]/g, '\\$&') + '"]{display:none}';
    document.head.appendChild(st);
  }
  function Piano(host, o) {
    var self = this;
    o = o || {};
    this.wrap = h('div', 'ml-kb');
    host.appendChild(this.wrap);
    var big = range(o.range, 'C3-C5'), sm = o.rangeSm ? range(o.rangeSm) : null;
    this.small = !!(sm && smallScreen(host));
    this.range = this.small ? sm : big;
    var labels = o.labels || (pref('labels') === false ? 'off' : 'on');
    this.kb = K.create(this.wrap, clean({ from: this.range[0], to: this.range[1], labels: labels === 'c' ? 'c' : 'all', sound: o.sound !== false,
      computerKeys: o.computerKeys == null ? true : o.computerKeys, label: o.label || 'Piano keyboard', minKey: o.minKey, midi: o.midi !== false,
      toolbar: o.toolbar === false ? false : undefined }));
    var bar = this.wrap.querySelector('.mk-bar');
    if (labels !== 'c' && o.labelsBtn !== false && bar) {
      var lb = h('button', 'ml-labb', 'Letter names');
      lb.type = 'button';
      lb.title = 'Show or hide the letter names on the keys';
      bar.insertBefore(lb, bar.querySelector('.mk-sp'));
      this.labBtn = lb;
      lb.addEventListener('click', function () { self.setLabels(self.wrap.classList.contains('ml-nolab')); pref('labels', !self.wrap.classList.contains('ml-nolab')); });
    }
    this.setLabels(labels !== 'off');
    if (o.blackNames) {
      this.wrap.classList.add('ml-bnames');
      var keysEl = this.wrap.querySelector('.mk-keys');
      var deco = function () {
        keysEl.querySelectorAll('.mk-b').forEach(function (k) {
          if (k.querySelector('.ml-bn')) return;
          var m = +k.getAttribute('data-midi');
          k.insertBefore(h('span', 'ml-bn', SHARP[pc(m)] + '<br>' + FLAT[pc(m)]), k.firstChild);
        });
      };
      deco();
      if (window.MutationObserver) new MutationObserver(deco).observe(keysEl, { childList: true });
    }
    if (sm && window.ResizeObserver) {
      var ro = new ResizeObserver(function () {
        var s = smallScreen(host);
        if (s === self.small) return;
        self.small = s; self.range = s ? sm : big;
        self.kb.setRange(self.range[0], self.range[1]);
        if (self.onRange) self.onRange();
      });
      ro.observe(host);
    }
  }
  Piano.prototype.setLabels = function (on) {
    this.wrap.classList.toggle('ml-nolab', !on);
    if (this.labBtn) this.labBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  };
  Piano.prototype.keysIn = function () { var out = []; for (var m = this.range[0]; m <= this.range[1]; m++) out.push(m); return out; };
  Piano.prototype.fingers = function (ms, fs, hand) {
    var kb = this.kb;
    ms.forEach(function (m, i) { if (fs && fs[i]) { kb.highlight(m, 'f' + fs[i]); kb.highlight(m, hand === 'lh' ? 'fl' : 'fr'); } });
  };
  Piano.prototype.clearFingers = function () { var kb = this.kb; ['f1', 'f2', 'f3', 'f4', 'f5', 'fl', 'fr'].forEach(function (f) { kb.clear(f); }); };

  /* ================= plain keyboard ================= */
  function minKey(el) { var v = +attr(el, 'min-key', 0); return v > 0 ? v : undefined; }
  function mountKb(el) {
    if (attr(el, 'bare') !== '1') el.classList.add('ml-w', 'ml-kbfig');
    var p = new Piano(el, { range: attr(el, 'range', 'C3-C5'), rangeSm: attr(el, 'range-sm'), labels: attr(el, 'labels'), blackNames: attr(el, 'black-names') === '1', minKey: minKey(el) });
    var say = attr(el, 'say');
    if (say) el.insertBefore(h('p', 'ml-say', say), el.firstChild);
    var lit = jattr(el, 'lit', null);
    function paintLit() { if (lit) Object.keys(lit).forEach(function (hand) { [].concat(lit[hand]).forEach(function (k) { p.kb.highlight(midiOf(k), hand); }); }); }
    paintLit();
    var fing = jattr(el, 'fingers', null); // { "rh": { "C4": 1, … }, "lh": { … } }
    if (fing) Object.keys(fing).forEach(function (hand) { Object.keys(fing[hand]).forEach(function (k) { p.kb.highlight(midiOf(k), 'f' + fing[hand][k]); p.kb.highlight(midiOf(k), hand === 'lh' ? 'fl' : 'fr'); }); });
    var fb = h('p', 'ml-fb ml-quiet', '');
    fb.setAttribute('aria-live', 'polite');
    el.appendChild(fb);
    p.kb.on('down', function (e) { fb.textContent = 'You played ' + keyName(e.midi) + (e.midi === 60 ? ', middle C' : '') + '.'; });
  }

  /* ================= keyboard tasks ================= */
  /* A task: { say, find: "C" | "F#" (every key with that name), keys: ["C4", …] (+ order: true, fingers: [1, 2, 3], hand),
     group: 2 | 3 (black keys in groups of two or three; count), chord: [...] (together, or quickly one after another),
     side: 'left' | 'right' (count presses on that side of the keyboard),
     min, max, count (presses inside a range), free: true (count presses), hint: true | false, help, done } */
  function mountKeys(el) {
    var tasks = jattr(el, 'tasks', []);
    if (!tasks.length) return;
    el.classList.add('ml-w', 'ml-keys');
    var head = h('div', 'ml-head');
    head.appendChild(h('span', 'ml-tag', esc(attr(el, 'title', 'Try it'))));
    var dots = h('span', 'ml-dots');
    dots.setAttribute('aria-hidden', 'true');
    head.appendChild(dots);
    el.appendChild(head);
    var say = h('p', 'ml-say');
    say.setAttribute('aria-live', 'polite');
    el.appendChild(say);
    var P = new Piano(el, { range: attr(el, 'range', 'C3-C5'), rangeSm: attr(el, 'range-sm'), labels: attr(el, 'labels'), blackNames: attr(el, 'black-names') === '1', minKey: minKey(el) });
    var kb = P.kb;
    var foot = h('div', 'ml-foot');
    var fb = h('p', 'ml-fb');
    fb.setAttribute('aria-live', 'polite');
    var again = btn('↺ Start over', 'ml-again');
    var skip = btn('Skip ›', 'ml-skip', 'Go to the next step');
    foot.appendChild(fb); foot.appendChild(skip); foot.appendChild(again);
    el.appendChild(foot);
    var i = 0, st = null, finished = false;
    function inRange(m) { return m >= P.range[0] && m <= P.range[1]; }
    function targets(t) {
      if (t.find) { var p0 = pc(midiOf(t.find + '4')); return P.keysIn().filter(function (m) { return pc(m) === p0; }); }
      if (t.keys) return t.keys.map(midiOf);
      if (t.chord) return t.chord.map(midiOf);
      return [];
    }
    function paintDots() {
      dots.innerHTML = tasks.map(function (t, k) { return '<i class="' + (k < i || finished ? 'on' : k === i ? 'cur' : '') + '"></i>'; }).join('');
    }
    function start(k) {
      i = k; finished = false;
      var t = tasks[i];
      kb.clear();
      st = { found: {}, pos: 0, n: 0, recent: [], tg: targets(t) };
      say.innerHTML = t.say || '';
      fb.textContent = ''; fb.className = 'ml-fb';
      if (t.keys && t.fingers) P.fingers(st.tg, t.fingers, t.hand);
      if (t.chord && t.fingers) P.fingers(st.tg, t.fingers, t.hand);
      hintNext();
      if (st.tg.length) kb.follow(st.tg.filter(inRange).slice(0, 1).concat(st.tg.filter(inRange).slice(-1)));
      skip.hidden = i >= tasks.length - 1;
      paintDots();
    }
    function hintNext() {
      var t = tasks[i];
      kb.clear('hint');
      if (t.keys && t.hint !== false) {
        if (t.order) { if (st.pos < st.tg.length) kb.highlight(st.tg[st.pos], 'hint'); }
        else st.tg.forEach(function (m) { if (!st.found[m]) kb.highlight(m, 'hint'); });
      }
      if (t.chord && t.hint !== false) st.tg.forEach(function (m) { kb.highlight(m, 'hint'); });
    }
    function good(msg) { fb.className = 'ml-fb ok'; fb.innerHTML = msg; }
    function bad(m, msg) {
      kb.flash(m, 'bad', 420);
      fb.className = 'ml-fb bad';
      fb.innerHTML = 'That’s ' + esc(keyName(m)) + '. ' + (msg || '');
    }
    function complete() {
      var t = tasks[i];
      kb.clear('hint');
      good(t.done || 'Yes! ✓');
      st.complete = true;
      if (i < tasks.length - 1) later(function () { if (st.complete && tasks[i] === t) start(i + 1); }, 1300);
      else {
        finished = true;
        paintDots();
        later(function () {
          if (!finished) return;
          fb.className = 'ml-fb ok';
          fb.innerHTML = (t.done ? t.done + ' ' : '') + '<b>All done.</b> Press <i>Start over</i> to do it again.';
          say.innerHTML = attr(el, 'end', 'You did every step. Play anything you like.');
        }, 900);
        markDone();
      }
    }
    kb.on('down', function (e) {
      var m = e.midi, t = tasks[i];
      if (!t || finished || (st && st.complete)) return;
      if (t.find) {
        if (st.tg.indexOf(m) >= 0) {
          if (!st.found[m]) { st.found[m] = 1; kb.highlight(m, 'ok'); }
          var left = st.tg.filter(function (x) { return !st.found[x]; }).length;
          if (!left) complete();
          else good('Yes, that’s ' + SHARP[pc(m)] + (m === 60 ? ' (middle C)' : '') + '. ' + left + ' more to find.');
        } else bad(m, t.help || '');
      } else if (t.keys && t.order) {
        if (m === st.tg[st.pos]) {
          kb.flash(m, 'ok', 300);
          st.pos++;
          if (st.pos >= st.tg.length) complete();
          else { hintNext(); fb.className = 'ml-fb ok'; fb.textContent = SHARP[pc(m)] + ' ✓'; }
        } else bad(m, t.help || 'Look for the key with the gold outline.');
      } else if (t.keys) {
        if (st.tg.indexOf(m) >= 0) {
          st.found[m] = 1; kb.highlight(m, 'ok'); hintNext();
          if (st.tg.every(function (x) { return st.found[x]; })) complete();
          else good(keyName(m) + ' ✓');
        } else bad(m, t.help || '');
      } else if (t.group) {
        var want = t.group === 2 ? [1, 3] : [6, 8, 10];
        if (want.indexOf(pc(m)) >= 0) {
          if (!st.found[m]) { st.found[m] = 1; st.n++; kb.highlight(m, 'ok'); }
          if (st.n >= (t.count || 3)) complete();
          else good('Yes, that black key is in a group of ' + (t.group === 2 ? 'two' : 'three') + '. ' + ((t.count || 3) - st.n) + ' more.');
        } else if (isBlack(m)) bad(m, 'That black key is in a group of ' + (t.group === 2 ? 'three' : 'two') + '. ' + (t.help || ''));
        else bad(m, 'That’s a white key. ' + (t.help || 'Look for the black keys.'));
      } else if (t.chord) {
        if (st.tg.indexOf(m) < 0) { bad(m, t.help || 'Play only the keys with the gold outline.'); return; }
        var now = Date.now();
        st.recent = st.recent.filter(function (r) { return now - r.t < 2500 && r.m !== m; });
        st.recent.push({ m: m, t: now });
        kb.highlight(m, 'ok');
        var all = st.tg.every(function (x) { return kb.isDown(x) || st.recent.some(function (r) { return r.m === x; }); });
        var together = st.tg.every(function (x) { return kb.isDown(x); });
        if (all) complete(together ? null : 1);
        else good(SHARP[pc(m)] + ' ✓ Now the others' + (st.tg.length > 2 ? '' : ' one') + '.');
        if (all && !together) fb.innerHTML += ' <span class="ml-quiet">On a real piano, press them all at the same moment.</span>';
      } else if (t.side) {
        var midK = (P.range[0] + P.range[1]) / 2, okSide = t.side === 'left' ? m < midK - 2 : m > midK + 2;
        if (okSide) { st.n++; kb.flash(m, 'ok', 300); if (st.n >= (t.count || 4)) complete(); else good(st.n + ' of ' + (t.count || 4) + ' ✓'); }
        else bad(m, t.help || ('Try keys further to the ' + t.side + '.'));
      } else if (t.min || t.max) {
        var lo = t.min ? midiOf(t.min) : 0, hi = t.max ? midiOf(t.max) : 200;
        if (m >= lo && m <= hi) { st.n++; kb.flash(m, 'ok', 300); if (st.n >= (t.count || 5)) complete(); else good(st.n + ' ✓'); }
        else bad(m, t.help || '');
      } else if (t.free) {
        st.n++;
        if (st.n >= (t.count || 5)) complete();
      }
    });
    kb.on('up', function (e) {
      var t = tasks[i];
      if (t && t.chord && !st.complete) kb.unhighlight(e.midi, 'ok');
    });
    again.addEventListener('click', function () { start(0); });
    skip.addEventListener('click', function () { if (i < tasks.length - 1) start(i + 1); });
    P.onRange = function () { start(i); };
    el._keys = { piano: P, get step() { return i; }, get finished() { return finished; } }; // for tests
    start(0);
  }

  /* ================= staff pictures ================= */
  function srcOf(el) {
    var s = attr(el, 'src', '');
    if (/^\s*\{/.test(s)) { try { return JSON.parse(s); } catch (e) { return s; } }
    return s;
  }
  // run fn after the score is drawn and again after every redraw (the kit redraws on resize)
  function afterDraw(box, fn) {
    fn();
    if (window.MutationObserver) new MutationObserver(function (list) {
      if (list.some(function (r) { return [].some.call(r.addedNodes, function (n) { return n.nodeName && n.nodeName.toLowerCase() === 'svg'; }); })) fn();
    }).observe(box, { childList: true });
  }
  function noteGroups(svg) { return [].slice.call(svg.querySelectorAll('.ms-n')); }
  function itemsOf(model, staff) { // written items (notes, chords and rests) of one staff, in order
    var out = [], S = model.staves.filter(function (s) { return !staff || s.id === staff; })[0];
    if (!S) return out;
    S.measures.forEach(function (M) { M.voices.forEach(function (v) { v.forEach(function (it) { out.push(it); }); }); });
    return out;
  }
  function growSvg(svg, bottomAbs) { // make room below the music for labels
    var vb = svg.viewBox.baseVal;
    if (!vb || bottomAbs <= vb.height) return;
    var sp = (+svg.getAttribute('height')) / vb.height;
    svg.setAttribute('viewBox', '0 0 ' + vb.width + ' ' + bottomAbs);
    svg.setAttribute('height', String(bottomAbs * sp));
  }
  function staffTop(g) { // y of the staff group's translate (the top line)
    var tr = g.getAttribute('transform') || '', m = /translate\(\s*[-\d.]+[ ,]+([-\d.]+)/.exec(tr);
    return m ? +m[1] : 0;
  }
  function overlay(score, o) {
    var svg = score.el.querySelector('svg.ms-svg');
    if (!svg) return;
    var NS = 'http://www.w3.org/2000/svg';
    var items = itemsOf(score.model, o.staff || 'rh');
    var notes = items.filter(function (it) { return it.kind !== 'rest'; });
    var maxBottom = 0;
    function place(it, k) {
      var id = it.notes[0].id, g = svg.querySelector('.ms-n[data-id="' + id + '"]');
      return g ? { g: g, b: g.getBBox(), parent: g.parentNode, top: staffTop(g.parentNode), it: it, k: k } : null;
    }
    if (o.under) {
      var labs = String(o.under).split(/\s+/), placed = [], low = {};
      notes.forEach(function (it, k) {
        var P = place(it, k);
        if (!P) return;
        placed.push(P);
        // one baseline per staff line (system), below everything drawn on it (stems, beams, tuplet numbers)
        if (low[P.top] == null) { var gb = P.parent.getBBox(); low[P.top] = gb.y + gb.height; }
      });
      placed.forEach(function (P) {
        var lab = labs[P.k];
        if (!lab || lab === '_') return;
        var y = Math.max(7.2, low[P.top] + 1.9);
        var t = document.createElementNS(NS, 'text');
        t.setAttribute('class', 'ml-under');
        t.setAttribute('x', P.b.x + P.b.width / 2);
        t.setAttribute('y', y);
        t.setAttribute('font-size', '1.45');
        t.setAttribute('text-anchor', 'middle');
        t.textContent = lab.replace(/_/g, ' ');
        P.parent.appendChild(t);
        maxBottom = Math.max(maxBottom, P.top + y + 0.8);
      });
    }
    if (o.artic) {
      // staff-local units: 0 = top line, 4 = bottom line. Marks go opposite the stem (above for notes on or above
      // the middle line); dots and tenuto lines sit in a space next to the notehead, never on a line; accents sit
      // outside the staff.
      var arts = String(o.artic).split(/\s+/);
      notes.forEach(function (it, k) {
        var a = arts[k];
        if (!a || a === '_') return;
        var P = place(it, k);
        if (!P) return;
        var cx = P.b.x + P.b.width / 2, yc = P.b.y + P.b.height / 2, above = yc <= 2.01, off = above ? -1 : 1, y;
        if (a === '>') y = above ? Math.min(-1.1, yc - 1.5) : Math.max(5.1, yc + 1.5);
        else {
          y = yc + off;
          var r = Math.round(y * 2) / 2;
          if (r === Math.round(r) && r >= 0 && r <= 4) y = r + off * 0.5;
        }
        var el;
        if (a === '.') { el = document.createElementNS(NS, 'circle'); el.setAttribute('cx', cx); el.setAttribute('cy', y); el.setAttribute('r', '0.22'); el.setAttribute('class', 'ml-art'); }
        else if (a === '>') { el = document.createElementNS(NS, 'path'); el.setAttribute('d', 'M' + (cx - 0.8) + ' ' + (y - 0.42) + 'L' + (cx + 0.8) + ' ' + y + 'L' + (cx - 0.8) + ' ' + (y + 0.42)); el.setAttribute('class', 'ml-art-l'); el.setAttribute('stroke-width', '0.16'); }
        else if (a === '-') { el = document.createElementNS(NS, 'path'); el.setAttribute('d', 'M' + (cx - 0.62) + ' ' + y + 'H' + (cx + 0.62)); el.setAttribute('class', 'ml-art-l'); el.setAttribute('stroke-width', '0.18'); }
        if (!el) return;
        P.parent.appendChild(el);
      });
    }
    if (maxBottom) growSvg(svg, maxBottom);
  }
  function drawStaff(box, src, o) {
    o = o || {};
    restCSS();
    if (o.norest) box.classList.add('ml-norest');
    var base = o.opts || {};
    var opts = clean(Object.assign({ barNumbers: false }, base, { letters: o.letters, label: o.label, clef: o.clef, key: o.key, time: o.time, sp: o.sp, onClick: o.onClick }));
    if (o.finalBar === false) opts.finalBar = false;
    if (o.timeSig === false) opts.timeSig = false;
    var sc = ST.render(box, src, opts);
    if (o.under || o.artic) afterDraw(box, function () { overlay(sc, o); });
    return sc;
  }
  function perfOf(model, order) {
    if (!order) return SO.performance(model);
    var t = 0, out = { events: [], columns: [], measures: [], total: 0 };
    order.forEach(function (mi) {
      var p = SO.performance(model, { from: mi, to: mi });
      p.events.forEach(function (e) { out.events.push(Object.assign({}, e, { start: e.start + t })); });
      p.columns.forEach(function (c) { out.columns.push(Object.assign({}, c, { t: c.t + t })); });
      p.measures.forEach(function (M) { out.measures.push(Object.assign({}, M, { start: M.start + t })); });
      t += p.total;
    });
    out.total = t;
    return out;
  }
  // plays a score in time, lighting each note as it sounds; artic: per-note marks ('.' short, '>' louder)
  function Performer(score, o) {
    this.score = score; this.o = o || {};
    this.playing = false; this.raf = 0;
  }
  Performer.prototype.play = function (bpm) {
    if (!audioOK()) return;
    var self = this, sc = this.score, M = sc.model, o = this.o;
    if (this.playing) this.stop();
    A.unlock();
    var perf = perfOf(M, o.order), TPQ = SO.TPQ, spq = 60 / (bpm || o.tempo || 80);
    var art = {}, vv = {};
    var notesRH = itemsOf(M, 'rh').filter(function (it) { return it.kind !== 'rest'; });
    if (o.artic) {
      var marks = String(o.artic).split(/\s+/);
      notesRH.forEach(function (it, k) { it.notes.forEach(function (n) { art[n.id] = marks[k]; }); });
    }
    if (o.vels) { // per-note loudness (0–1), e.g. to hear a crescendo
      var vs = String(o.vels).split(/\s+/).map(Number);
      notesRH.forEach(function (it, k) { if (vs[k] > 0) it.notes.forEach(function (n) { vv[n.id] = vs[k]; }); });
    }
    var t0 = A.now() + 0.12;
    perf.events.forEach(function (e) {
      var a = art[e.ids[0]], dur = e.dur / TPQ * spq, vel = vv[e.ids[0]] || e.vel || 0.62;
      if (a === '.') dur = Math.min(dur * 0.4, 0.22);
      else dur *= 0.96;
      if (a === '>') vel = Math.min(1, vel + 0.22);
      A.play(e.midi, t0 + e.start / TPQ * spq, Math.max(0.06, dur), vel);
    });
    this.playing = true; this.t0 = t0;
    var lit = {};
    var end = t0 + perf.total / TPQ * spq;
    if (o.onState) o.onState(true);
    function frame() {
      if (!self.playing) return;
      var now = A.now(), tick = (now - t0) / spq * TPQ;
      var want = {};
      perf.columns.forEach(function (c) {
        c.notes.forEach(function (n) { if (tick >= c.t && tick < c.t + n.dur - TPQ * 0.04) want[n.id] = n.hand === 'lh' ? 'lh' : 'rh'; });
      });
      Object.keys(lit).forEach(function (id) { if (!want[id]) { sc.unhighlight([id]); delete lit[id]; } });
      Object.keys(want).forEach(function (id) { if (!lit[id]) { sc.highlight([id], want[id]); lit[id] = 1; } });
      if (o.cursor) {
        var cur = null;
        perf.measures.forEach(function (Mm) { if (tick >= Mm.start && tick < Mm.start + Mm.len) cur = Mm; });
        if (cur) sc.cursor(cur.index, tick - cur.start); else sc.cursor(null);
      }
      if (now >= end + 0.15) { self.stop(true); return; }
      self.raf = requestAnimationFrame(frame);
    }
    this.raf = requestAnimationFrame(frame);
  };
  Performer.prototype.stop = function (quiet) {
    var was = this.playing;
    this.playing = false;
    cancelAnimationFrame(this.raf);
    if (was && !quiet && audioOK()) A.stopAll();
    this.score.clear();
    this.score.cursor(null);
    if (was && this.o.onState) this.o.onState(false);
  };
  function mountStaff(el) {
    if (!ST) return;
    el.classList.add('ml-fig');
    var cap = el.querySelector('figcaption');
    var box = h('div', 'ml-score');
    var maxw = attr(el, 'max');
    if (maxw) box.style.maxWidth = maxw + 'px';
    el.insertBefore(box, cap || null);
    var letters = attr(el, 'letters', '0') === '1';
    var o = { clef: attr(el, 'clef'), key: attr(el, 'key'), time: attr(el, 'time'), letters: letters, opts: jattr(el, 'opts', {}),
      label: attr(el, 'label'), under: attr(el, 'under'), artic: attr(el, 'artic'), norest: attr(el, 'norest') === '1', sp: +attr(el, 'sp', 0) || (smallScreen(el) ? 9.5 : 11.5) };
    var perf = null, sc;
    o.onClick = function (mi, tick) { // tap a note to hear it
      if (!audioOK() || (perf && perf.playing)) return;
      var p = SO.performance(sc.model, { from: mi, to: mi }), ids = [];
      p.columns.forEach(function (c) { if (c.off === tick) c.notes.forEach(function (n) { if (!n.tied) { tone(n.midi, 0.8, 0.62); ids.push(n.id); } }); });
      if (ids.length) { sc.highlight(ids, 'hint'); later(function () { sc.unhighlight(ids); }, 450); }
    };
    sc = drawStaff(box, srcOf(el), o);
    var bar = h('div', 'ml-figbar');
    if (attr(el, 'hear', '1') !== '0' && audioOK()) {
      var order = attr(el, 'order') ? attr(el, 'order').split(/\s+/).map(Number) : null;
      var hb = btn('▶ Hear it', 'ml-hear');
      perf = new Performer(sc, { tempo: +attr(el, 'tempo', 80), artic: o.artic, vels: attr(el, 'vels'), order: order, cursor: attr(el, 'cursor') === '1',
        onState: function (on) { hb.innerHTML = on ? '■ Stop' : '▶ Hear it'; hb.setAttribute('aria-pressed', on ? 'true' : 'false'); } });
      hb.addEventListener('click', function () { if (perf.playing) perf.stop(); else perf.play(); });
      bar.appendChild(hb);
    }
    if (attr(el, 'letters-btn') === '1') {
      var lb = btn('Letter names', 'ml-letb');
      lb.setAttribute('aria-pressed', letters ? 'true' : 'false');
      lb.addEventListener('click', function () { letters = !letters; lb.setAttribute('aria-pressed', letters ? 'true' : 'false'); sc.setLetters(letters); });
      bar.appendChild(lb);
    }
    if (bar.children.length) {
      bar.appendChild(h('span', 'ml-quiet ml-tapnote', 'Tap a note to hear it.'));
      el.insertBefore(bar, cap || null);
    }
  }

  /* ================= explorer: key -> staff ================= */
  function mountExplore(el) {
    if (!ST) return;
    el.classList.add('ml-w', 'ml-explore');
    var clef = attr(el, 'clef', 'treble');
    el.appendChild(h('div', 'ml-head', '<span class="ml-tag">' + esc(attr(el, 'title', 'Explore')) + '</span>'));
    var say = h('p', 'ml-say', esc(attr(el, 'say', 'Press any key and see where its note goes on the staff.')));
    el.appendChild(say);
    var row = h('div', 'ml-exrow');
    var box = h('div', 'ml-score ml-exscore');
    var info = h('div', 'ml-exinfo');
    info.setAttribute('aria-live', 'polite');
    row.appendChild(box); row.appendChild(info);
    el.appendChild(row);
    var tools = h('div', 'ml-figbar');
    var flatB = btn('Show black keys as flats', 'ml-flatb');
    flatB.setAttribute('aria-pressed', 'false');
    tools.appendChild(flatB);
    el.appendChild(tools);
    var P = new Piano(el, { range: attr(el, 'range', clef === 'bass' ? 'C2-C4' : clef === 'grand' ? 'C2-C6' : 'C4-C6'), rangeSm: attr(el, 'range-sm'), blackNames: attr(el, 'black-names') === '1' });
    var flats = false, last = null;
    function show(m) {
      last = m;
      var name = C.midiName(m, flats), p = C.pitch(name);
      var cl = clef === 'grand' ? C.clefFor(p) : clef;
      var src, o = { letters: true, timeSig: false, finalBar: false, sp: smallScreen(el) ? 10 : 12, norest: true };
      if (clef === 'grand') src = cl === 'treble' ? { rh: name + '/1', lh: 'R' } : { rh: 'R', lh: name + '/1' };
      else { src = name + '/1'; o.clef = cl; }
      o.label = 'The note ' + C.label(p, true) + ', ' + posText(p, cl);
      drawStaff(box, src, o);
      var where = posText(p, cl);
      info.innerHTML = '<b class="ml-big">' + esc(C.label(p, true)) + '</b>' +
        (m === 60 ? '<span class="ml-tagline">middle C</span>' : '') +
        '<span>' + esc(where.charAt(0).toUpperCase() + where.slice(1)) + '.</span>' +
        (isBlack(m) ? '<span class="ml-quiet">The same key is also called ' + esc(C.label(C.midiName(m, !flats), false)) + '.</span>' : '') +
        (clef === 'grand' && m === 60 ? '<span class="ml-quiet">Middle C can also be written just above the bass staff. Same key, same sound.</span>' : '');
    }
    P.kb.on('down', function (e) { show(e.midi); });
    flatB.addEventListener('click', function () { flats = !flats; flatB.setAttribute('aria-pressed', flats ? 'true' : 'false'); if (last != null) show(last); });
    show(60);
    info.insertAdjacentHTML('beforeend', '<span class="ml-quiet">Press a key to see another note.</span>');
  }

  /* ================= drills ================= */
  var LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  function renderNote(stage, note, clef, extra) {
    var p = C.pitch(note), cl = clef === 'grand' ? C.clefFor(p) : clef;
    var src, o = Object.assign({ timeSig: false, finalBar: false, norest: true, sp: smallScreen(stage) ? 11 : 13 }, extra || {});
    if (clef === 'grand') src = cl === 'treble' ? { rh: p.name + '/1', lh: 'R' } : { rh: 'R', lh: p.name + '/1' };
    else { src = p.name + '/1'; o.clef = cl; }
    if (!o.label) o.label = 'A note ' + posText(p, cl) + '.';
    stage.innerHTML = '';
    var box = h('div', 'ml-score ml-dscore');
    stage.appendChild(box);
    return drawStaff(box, src, o);
  }
  function idsOf(score) { return Object.keys(score.model.notes || {}); }
  function stagePiano(D, host, o) { // one keyboard per question in the stage: the previous one is taken down first
    if (D._skb) { try { D._skb.kb.destroy(); } catch (e) {} }
    D._skb = new Piano(host, o);
    return D._skb;
  }
  var DEF_LEVELS = {
    treble: [{ label: 'On the staff', lo: 'E4', hi: 'F5' }, { label: 'With ledger lines', lo: 'A3', hi: 'C6' }],
    bass: [{ label: 'On the staff', lo: 'G2', hi: 'A3' }, { label: 'With ledger lines', lo: 'C2', hi: 'E4' }],
    grand: [{ label: 'Around middle C', lo: 'F3', hi: 'G4' }, { label: 'The whole grand staff', lo: 'C2', hi: 'C6' }]
  };
  var TYPES = {};

  TYPES.name = {
    title: 'Name the note', q: 'What is this note’s letter name?',
    levels: function (el) { return DEF_LEVELS[attr(el, 'clef', 'treble')]; },
    make: function (D, lv) { if (!D.pick || D.pickLv !== lv) { D.pick = C.picker(C.notePool(lv.lo, lv.hi, { acc: lv.acc }), Math.random, 3); D.pickLv = lv; } return { note: D.pick() }; },
    show: function (D, q) { q.sc = renderNote(D.stage, q.note, D.clef); },
    answers: function (D) { return LETTERS.map(function (l) { return { label: l, value: l, key: l.toLowerCase() }; }); },
    check: function (D, q, v) { return C.checkLetter(q.note, v); },
    right: function (D, q) { return C.pitch(q.note).letter; },
    reveal: function (D, q, ok) {
      q.sc.setLetters(true);
      q.sc.highlight(idsOf(q.sc), ok ? 'ok' : 'bad');
      tone(C.pitch(q.note).midi);
      var p = C.pitch(q.note), cl = D.clef === 'grand' ? C.clefFor(p) : D.clef;
      return (ok ? 'Yes, ' : 'It’s ') + C.label(p) + ' (' + C.label(p, true) + '), ' + posText(p, cl) + '.';
    }
  };
  TYPES.linespace = {
    title: 'Line or space?', q: 'Is this note on a line or in a space?',
    levels: function (el) { var c = attr(el, 'clef', 'treble'); return [{ label: 'On the staff', lo: c === 'bass' ? 'G2' : 'E4', hi: c === 'bass' ? 'A3' : 'F5' }, { label: 'Just outside it too', lo: c === 'bass' ? 'E2' : 'C4', hi: c === 'bass' ? 'C4' : 'A5' }]; },
    make: TYPES.name.make,
    show: TYPES.name.show,
    answers: function () { return [{ label: 'On a line', value: 'line', key: 'l' }, { label: 'In a space', value: 'space', key: 's' }]; },
    check: function (D, q, v) { return (v === 'line') === C.onLine(q.note, D.clef); },
    right: function (D, q) { return C.onLine(q.note, D.clef) ? 'line' : 'space'; },
    reveal: function (D, q, ok) {
      q.sc.highlight(idsOf(q.sc), ok ? 'ok' : 'bad');
      tone(C.pitch(q.note).midi);
      var line = C.onLine(q.note, D.clef), w = posText(q.note, D.clef);
      return (ok ? 'Yes: ' : 'Look closely: ') + 'it’s ' + w + (C.ledgers(q.note, D.clef) && line ? ' (a ledger line is a line too)' : '') + '.' + (line ? ' The line runs through the middle of the note.' : ' The note sits between two lines.');
    }
  };
  TYPES.findkey = {
    title: 'Find it on the keyboard', q: 'Press the key that matches this note.', keyboard: true,
    levels: function (el) { return DEF_LEVELS[attr(el, 'clef', 'treble')]; },
    make: TYPES.name.make,
    show: function (D, q) { q.sc = renderNote(D.stage, q.note, D.clef); D.piano.kb.clear(); D.piano.kb.follow([C.pitch(q.note).midi]); },
    kbRange: function (D, lv) { var lo = C.pitch(lv.lo).midi, hi = C.pitch(lv.hi).midi; lo = lo - pc(lo); hi = hi + (pc(hi) ? 12 - pc(hi) : 0); return [lo, hi]; },
    check: function (D, q, m) { return C.checkKey(q.note, m, true).ok; },
    reveal: function (D, q, ok, m) {
      var p = C.pitch(q.note), c = C.checkKey(q.note, m, true);
      q.sc.setLetters(true);
      q.sc.highlight(idsOf(q.sc), ok ? 'ok' : 'bad');
      if (ok) { D.piano.kb.flash(m, 'ok', 700); return 'Yes, that’s ' + C.label(p, true) + '.'; }
      D.piano.kb.flash(m, 'bad', 500);
      D.piano.kb.highlight(p.midi, 'hint');
      D.piano.kb.follow([p.midi]);
      if (c.octaves) return 'Right letter, but that ' + C.label(p) + ' is ' + Math.abs(c.octaves) + ' octave' + (Math.abs(c.octaves) > 1 ? 's' : '') + ' too ' + (c.octaves > 0 ? 'high' : 'low') + '. This note is ' + C.label(p, true) + ': the key with the gold outline. Press it to go on.';
      return 'That key is ' + shortName(m) + '. This note is ' + C.label(p, true) + ': the key with the gold outline. Press it to go on.';
    }
  };
  TYPES.place = {
    title: 'Put it on the staff', q: 'Which note is this key? Move the note to the right line or space, then press Check.', place: true,
    levels: function (el) { return DEF_LEVELS[attr(el, 'clef', 'treble')]; },
    make: TYPES.name.make,
    show: function (D, q) {
      var p = C.pitch(q.note), lv = D.level;
      q.lo = C.pitch(lv.lo).step - 2; q.hi = C.pitch(lv.hi).step + 2;
      var startStep = D.clef === 'bass' ? C.pitch('D3').step : C.pitch('B4').step;
      if (startStep === p.step) startStep += 2;
      q.ghost = Math.max(q.lo, Math.min(q.hi, startStep));
      D.stage.innerHTML = '';
      var wrap = h('div', 'ml-place');
      var kbw = h('div', 'ml-placekb');
      wrap.appendChild(kbw);
      var right = h('div', 'ml-placestaff');
      var box = h('div', 'ml-score ml-dscore ml-ghostbox');
      box.tabIndex = 0;
      box.setAttribute('role', 'slider');
      box.setAttribute('aria-label', 'Your note on the staff. Up and down arrows move it; Enter checks.');
      right.appendChild(box);
      var arrows = h('div', 'ml-arrows');
      var up = btn('▲', 'ml-up', 'Move the note up'), dn = btn('▼', 'ml-dn', 'Move the note down');
      up.setAttribute('aria-label', 'Move the note up'); dn.setAttribute('aria-label', 'Move the note down');
      arrows.appendChild(up); arrows.appendChild(dn);
      right.appendChild(arrows);
      wrap.appendChild(right);
      D.stage.appendChild(wrap);
      // the key: a small keyboard with only the C names, the key lit
      var lo = p.midi - pc(p.midi) - (p.midi - pc(p.midi) > C.pitch(lv.lo).midi ? 12 : 0), hi = lo + 24;
      if (p.midi > hi) hi += 12;
      var P = stagePiano(D, kbw, { range: lo + '-' + hi, labels: 'c', computerKeys: false, toolbar: false, midi: false, minKey: 18, label: 'The key to find on the staff' });
      kbw.querySelector('.mk-bar') && kbw.querySelector('.mk-bar').classList.add('ml-mini');
      P.kb.highlight(p.midi, 'rh');
      P.kb.follow([p.midi]);
      var hear = btn('▶ Hear the key', 'ml-hearkey');
      hear.addEventListener('click', function () { tone(p.midi); });
      kbw.appendChild(hear);
      q.box = box; q.P = P;
      function draw() {
        var g = C.pitchFromStep(q.ghost, 0);
        q.sc = drawStaff(box, D.clef === 'bass' ? g.name + '/1' : g.name + '/1', { clef: D.clef, timeSig: false, finalBar: false, sp: smallScreen(D.stage) ? 11 : 13, label: 'Your note: ' + posText(g, D.clef) });
        q.sc.highlight(idsOf(q.sc), 'hint');
        box.setAttribute('aria-valuetext', posText(g, D.clef));
      }
      q.draw = draw;
      function move(d) { if (q.done) return; q.ghost = Math.max(q.lo, Math.min(q.hi, q.ghost + d)); draw(); }
      up.addEventListener('click', function () { move(1); });
      dn.addEventListener('click', function () { move(-1); });
      box.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp') { move(1); e.preventDefault(); }
        else if (e.key === 'ArrowDown') { move(-1); e.preventDefault(); }
        else if (e.key === 'Enter') { D.answer(q.ghost); e.preventDefault(); }
      });
      box.addEventListener('click', function (e) {
        if (q.done) return;
        var ln = box.querySelector('.ms-ln');
        if (!ln) return;
        var r = ln.getBoundingClientRect(), half = r.height / 8;
        if (!half) return;
        var pos = Math.round((r.bottom - e.clientY) / half);
        var bottom = D.clef === 'bass' ? 18 : 30;
        q.ghost = Math.max(q.lo, Math.min(q.hi, bottom + pos));
        draw();
      });
      draw();
      if (A && A.ready && A.ready()) tone(p.midi);
    },
    check: function (D, q, step) { return step === C.pitch(q.note).step; },
    reveal: function (D, q, ok) {
      q.done = true;
      var p = C.pitch(q.note), g = C.pitchFromStep(q.ghost, 0);
      tone(p.midi);
      if (ok) { q.sc.setLetters(true); q.sc.highlight(idsOf(q.sc), 'ok'); return 'Yes: ' + C.label(p, true) + ' goes ' + posText(p, D.clef) + '.'; }
      var sc = drawStaff(q.box, g.name + '/2 ' + p.name + '/2', { clef: D.clef, timeSig: false, finalBar: false, letters: true, sp: smallScreen(D.stage) ? 11 : 13, label: 'Your note ' + C.label(g, true) + ' and the right note ' + C.label(p, true) });
      var ids = Object.keys(sc.model.notes).sort();
      var items = itemsOf(sc.model, D.clef === 'bass' ? 'lh' : 'rh');
      if (items[0]) sc.highlight([items[0].notes[0].id], 'bad');
      if (items[1]) sc.highlight([items[1].notes[0].id], 'ok');
      return 'Your note, in red, is ' + C.label(g, true) + '. The key is ' + C.label(p, true) + ', shown in green: it goes ' + posText(p, D.clef) + '.';
    },
    buttonsAfter: function () { return [{ label: 'Check', value: '__check', key: 'enter', cls: 'pri' }]; }
  };
  TYPES.beats = {
    title: 'How many beats?', q: 'In 4/4 time, how many beats does this last?',
    levels: function () { return [{ label: 'Plain notes and rests', v: 1 }, { label: 'Dotted notes too', v: 2 }, { label: 'Everything', v: 3 }]; },
    make: function (D, lv) {
      if (!D.pick || D.pickLv !== lv) { D.pick = C.picker(C.VALUES.filter(function (x) { return (x.lv || 1) <= lv.v; }), Math.random, 2); D.pickLv = lv; }
      return { v: D.pick() };
    },
    show: function (D, q) {
      D.stage.innerHTML = '';
      var box = h('div', 'ml-score ml-dscore');
      D.stage.appendChild(box);
      q.sc = drawStaff(box, q.v.tok, { timeSig: false, finalBar: false, sp: smallScreen(D.stage) ? 11 : 13, label: 'A ' + (q.v.rest ? 'rest' : 'note') + ' on the staff (its kind is the question).' });
    },
    answers: function (D, lv) {
      var vals = {};
      C.VALUES.forEach(function (x) { if ((x.lv || 1) <= lv.v) vals[x.beats] = 1; });
      return Object.keys(vals).map(Number).sort(function (a, b) { return b - a; }).map(function (b, i) { return { label: C.fmtBeats(b), value: b, key: String(i + 1) }; });
    },
    check: function (D, q, v) { return +v === q.v.beats; },
    right: function (D, q) { return q.v.beats; },
    reveal: function (D, q, ok) {
      if (!q.v.rest) { q.sc.highlight(idsOf(q.sc), ok ? 'ok' : 'bad'); tone(72, Math.min(2.5, q.v.beats * 0.6)); }
      var b = C.fmtBeats(q.v.beats), dot = /\.$/.test(q.v.tok) ? ' The dot adds half the note’s value again.' : '';
      return (ok ? 'Yes: ' : 'It’s ') + 'a ' + q.v.name + ', ' + b + ' beat' + (q.v.beats === 1 ? '' : 's') + '.' + dot + (q.v.rest ? ' A rest is a beat of silence: you count it but don’t play.' : '');
    }
  };
  var KS_LEVELS = [{ label: 'Up to 3 sharps or flats', max: 3 }, { label: 'Up to 5', max: 5 }, { label: 'All 15 keys', max: 7 }];
  TYPES.keysig = {
    title: 'Name the key signature', q: 'Which major key has this key signature?',
    levels: function () { return KS_LEVELS; },
    make: function (D, lv) {
      if (!D.pick || D.pickLv !== lv) { D.pick = C.picker(C.MAJOR_KEYS.filter(function (k) { return Math.abs(k.fifths) <= lv.max; }), Math.random, 2); D.pickLv = lv; }
      var clef = D.clef === 'both' ? (Math.random() < 0.5 ? 'treble' : 'bass') : D.clef;
      return { k: D.pick(), clef: clef };
    },
    show: function (D, q) {
      D.stage.innerHTML = '';
      var box = h('div', 'ml-score ml-dscore');
      D.stage.appendChild(box);
      var n = Math.abs(q.k.fifths);
      q.sc = drawStaff(box, 'R', { clef: q.clef, key: q.k.key, timeSig: false, finalBar: false, norest: true, sp: smallScreen(D.stage) ? 11 : 13,
        label: 'A key signature on the ' + q.clef + ' staff with ' + (n ? n + (q.k.fifths > 0 ? ' sharp' : ' flat') + (n > 1 ? 's' : '') : 'no sharps or flats') + '.' });
    },
    answers: function (D, lv) {
      return C.MAJOR_KEYS.filter(function (k) { return Math.abs(k.fifths) <= lv.max; })
        .map(function (k) { return { label: C.keyLabel(k.key).replace(' major', ''), value: k.key }; });
    },
    check: function (D, q, v) { return v === q.k.key; },
    right: function (D, q) { return q.k.key; },
    reveal: function (D, q, ok) {
      var f = q.k.fifths, n = Math.abs(f), sig = C.keySig(f).map(function (x) { return C.label(x + '4'); });
      var sc = C.scale(q.k.key, 4).slice(0, 8).map(midiOf);
      playSeq([[sc[0], sc[2], sc[4]]], 0.6, 1.2);
      var why;
      if (!n) why = 'No sharps or flats: C major.';
      else if (f > 0) why = n + ' sharp' + (n > 1 ? 's' : '') + ' (' + sig.join(' ') + '). The last sharp, ' + sig[n - 1] + ', is a half step below the key: ' + C.keyLabel(q.k.key) + '.';
      else if (n === 1) why = 'One flat (B♭) is F major.';
      else why = n + ' flats (' + sig.join(' ') + '). The second-to-last flat names the key: ' + C.keyLabel(q.k.key) + '.';
      return (ok ? 'Yes! ' : 'Not quite. ') + why + ' Its relative minor is ' + C.keyLabel(q.k.minor) + '.';
    }
  };
  TYPES.interval = {
    title: 'Name the interval', q: 'What is the distance between these two notes?',
    levels: function () { return [{ label: 'Count the letters', v: 1 }, { label: 'Major, minor or perfect', v: 2 }]; },
    make: function (D, lv) {
      if (!D.pick || D.pickLv !== lv) { D.pick = C.picker(C.intervalPool(lv.v, 'C4', 'C5'), Math.random, 4); D.pickLv = lv; }
      return { pair: D.pick(), harm: Math.random() < 0.35 };
    },
    show: function (D, q) {
      D.stage.innerHTML = '';
      var box = h('div', 'ml-score ml-dscore');
      D.stage.appendChild(box);
      var a = q.pair[0], b = q.pair[1];
      q.sc = drawStaff(box, q.harm ? '[' + a + ' ' + b + ']/1' : a + '/2 ' + b + '/2', { timeSig: false, finalBar: false, sp: smallScreen(D.stage) ? 11 : 13,
        label: 'Two notes ' + (q.harm ? 'played together' : 'one after the other') + ': one ' + posText(a, 'treble') + ', the other ' + posText(b, 'treble') + '.' });
      var hb = btn('▶ Hear them', 'ml-hearkey');
      hb.addEventListener('click', function () { q.harm ? playSeq([[midiOf(a), midiOf(b)]], 1, 1.2) : playSeq([midiOf(a), midiOf(b)], 0.6); });
      D.stage.appendChild(hb);
      if (A && A.ready && A.ready()) later(function () { if (D.q === q) hb.click(); }, 250);
    },
    answers: function (D, lv) {
      if (lv.v === 1) return [2, 3, 4, 5, 6, 7, 8].map(function (n, i) { return { label: C.ordinal(n), value: String(n), key: String(i + 2) }; });
      return ['m2', 'M2', 'm3', 'M3', 'P4', 'A4', 'd5', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'].map(function (s) {
        var q = { m: 'minor', M: 'major', P: 'perfect', A: 'augmented', d: 'diminished' }[s[0]], n = +s.slice(1);
        return { label: (q === 'augmented' ? 'aug.' : q === 'diminished' ? 'dim.' : q) + ' ' + C.ordinal(n), value: s };
      });
    },
    check: function (D, q, v) { var iv = C.interval(q.pair[0], q.pair[1]); return D.level.v === 1 ? +v === iv.number : v === iv.short; },
    right: function (D, q) { var iv = C.interval(q.pair[0], q.pair[1]); return D.level.v === 1 ? String(iv.number) : iv.short; },
    reveal: function (D, q, ok) {
      var a = C.pitch(q.pair[0]), b = C.pitch(q.pair[1]), iv = C.interval(a, b);
      if (!q.harm) q.sc.setLetters(true); // (letters inside two stacked noteheads would crowd each other)
      q.sc.highlight(idsOf(q.sc), ok ? 'ok' : 'bad');
      var letters = [];
      for (var s = a.step; s <= b.step; s++) letters.push(C.pitchFromStep(s, 0).letter);
      var txt = (ok ? 'Yes: ' : 'It’s ') + (D.level.v === 1 ? 'a ' + C.ordinal(iv.number) : 'a ' + iv.name) + '. Count the letters: ' + letters.join(' ') + ' is ' + letters.length + '.';
      if (D.level.v === 2) txt += ' It spans ' + iv.semis + ' half steps.';
      return txt;
    }
  };
  TYPES.stepskip = {
    title: 'Step, skip or the same?', q: 'Is the second note a step, a skip, or the same note?',
    levels: function () { return [{ label: 'Look', v: 1 }, { label: 'Listen only', v: 2 }]; },
    make: function (D) {
      var s0 = C.pitch('C4').step, a = s0 + Math.floor(Math.random() * 5), kind = ['step', 'skip', 'same', 'step', 'skip'][Math.floor(Math.random() * 5)];
      var d = kind === 'same' ? 0 : kind === 'step' ? 1 : 2;
      var b = a + (Math.random() < 0.5 ? d : -d);
      if (b < s0 || b > s0 + 4) b = a + (b < s0 ? d : -d);
      return { a: C.pitchFromStep(a, 0).name, b: C.pitchFromStep(b, 0).name, kind: kind };
    },
    show: function (D, q) {
      D.stage.innerHTML = '';
      var box = h('div', 'ml-score ml-dscore');
      D.stage.appendChild(box);
      q.sc = drawStaff(box, q.a + '/2 ' + q.b + '/2', { clef: 'treble', timeSig: false, finalBar: false, sp: smallScreen(D.stage) ? 11 : 13, label: 'Two notes: the first ' + posText(q.a, 'treble') + ', the second ' + posText(q.b, 'treble') + '.' });
      if (D.level.v === 2) { box.classList.add('ml-hidden'); box.setAttribute('aria-hidden', 'true'); }
      var hb = btn('▶ Hear them', 'ml-hearkey');
      hb.addEventListener('click', function () { playSeq([midiOf(q.a), midiOf(q.b)], 0.65); });
      D.stage.appendChild(hb);
      if (D.level.v === 2 && A && A.ready && A.ready()) later(function () { if (D.q === q) hb.click(); }, 250);
    },
    answers: function () { return [{ label: 'Step', value: 'step', key: 's' }, { label: 'Skip', value: 'skip', key: 'k' }, { label: 'Same note', value: 'same', key: 'm' }]; },
    check: function (D, q, v) { return v === q.kind; },
    right: function (D, q) { return q.kind; },
    reveal: function (D, q, ok) {
      var box = D.stage.querySelector('.ml-score');
      box.classList.remove('ml-hidden'); box.removeAttribute('aria-hidden');
      q.sc.setLetters(true);
      q.sc.highlight(idsOf(q.sc), ok ? 'ok' : 'bad');
      playSeq([midiOf(q.a), midiOf(q.b)], 0.5);
      var why = q.kind === 'same' ? 'Both notes sit in the same place: the same key, played twice.' : q.kind === 'step' ? C.label(q.a) + ' to ' + C.label(q.b) + ' is a step: the very next key, from a line to the next space or a space to the next line.' : C.label(q.a) + ' to ' + C.label(q.b) + ' is a skip: it jumps over one key, from a line to the next line or a space to the next space.';
      return (ok ? 'Yes. ' : 'Not quite. ') + why;
    }
  };
  TYPES.halfwhole = {
    title: 'Half step or whole step?', q: 'Two keys light up. Are they a half step or a whole step apart?',
    levels: function () { return [{ label: 'Look and listen', v: 1 }]; },
    make: function () { var a = 60 + Math.floor(Math.random() * 12), d = Math.random() < 0.5 ? 1 : 2; return { a: a, b: a + d, d: d }; },
    show: function (D, q) {
      D.stage.innerHTML = '';
      var kbw = h('div', 'ml-hwkb');
      D.stage.appendChild(kbw);
      var P = stagePiano(D, kbw, { range: 'C4-C6', rangeSm: 'C4-C5', computerKeys: false, toolbar: false, midi: false, sound: true, label: 'Two lit keys', blackNames: true });
      if (q.b > P.range[1]) { q.a -= 12; q.b -= 12; }
      P.kb.highlight(q.a, 'rh'); P.kb.highlight(q.b, 'rh');
      var hb = btn('▶ Hear them', 'ml-hearkey');
      hb.addEventListener('click', function () { playSeq([q.a, q.b], 0.6); });
      D.stage.appendChild(hb);
      q.P = P;
    },
    answers: function () { return [{ label: 'Half step', value: 1, key: 'h' }, { label: 'Whole step', value: 2, key: 'w' }]; },
    check: function (D, q, v) { return +v === q.d; },
    right: function (D, q) { return q.d; },
    reveal: function (D, q, ok) {
      playSeq([q.a, q.b], 0.5);
      if (q.d === 2) q.P.kb.highlight(q.a + 1, 'hint');
      var between = q.d === 1 ? 'There is no key between ' + shortName(q.a) + ' and ' + shortName(q.b) + ': a half step.' : 'One key, ' + shortName(q.a + 1) + ' (gold outline), sits between ' + shortName(q.a) + ' and ' + shortName(q.b) + ': a whole step is two half steps.';
      return (ok ? 'Yes. ' : 'Not quite. ') + between;
    }
  };
  TYPES.keyname = {
    title: 'Name the key', q: 'What is the letter name of the lit key?',
    levels: function () { return [{ label: 'One octave', lo: 'C4', hi: 'B4' }, { label: 'Two octaves', lo: 'C3', hi: 'B4' }]; },
    make: function (D, lv) { if (!D.pick || D.pickLv !== lv) { D.pick = C.picker(C.notePool(lv.lo, lv.hi), Math.random, 2); D.pickLv = lv; } return { note: D.pick() }; },
    show: function (D, q) {
      D.stage.innerHTML = '';
      var kbw = h('div', 'ml-hwkb');
      D.stage.appendChild(kbw);
      var lv = D.level, lo = C.pitch(lv.lo).midi, hi = C.pitch(lv.hi).midi + 1;
      var P = stagePiano(D, kbw, { range: lo + '-' + hi, labels: 'off', labelsBtn: false, computerKeys: false, toolbar: false, midi: false, minKey: 20, label: 'A keyboard with one key lit' });
      P.kb.highlight(C.pitch(q.note).midi, 'rh');
      q.P = P;
    },
    answers: TYPES.name.answers,
    check: function (D, q, v) { return C.checkLetter(q.note, v); },
    right: function (D, q) { return C.pitch(q.note).letter; },
    reveal: function (D, q, ok) {
      var m = C.pitch(q.note).midi;
      tone(m);
      q.P.setLabels(true);
      var L = C.pitch(q.note).letter, where = { C: 'just left of a group of two black keys', D: 'between the two black keys', E: 'just right of a group of two black keys', F: 'just left of a group of three black keys', G: 'between the first and second of three black keys', A: 'between the second and third of three black keys', B: 'just right of a group of three black keys' }[L];
      return (ok ? 'Yes: ' : 'It’s ') + L + ', ' + where + (m === 60 ? '. It’s middle C.' : '.');
    }
  };
  TYPES.quiz = {
    title: 'Quick quiz',
    levels: function () { return [{ label: 'All questions', v: 1 }]; },
    make: function (D) {
      if (!D.items) { var s = D.el.querySelector('script[type="application/json"]'); try { D.items = JSON.parse(s ? s.textContent : '[]'); } catch (e) { D.items = []; } D.order = []; }
      if (!D.order.length) D.order = C.shuffle(D.items.map(function (x, i) { return i; }));
      var it = D.items[D.order.shift()];
      return { it: it };
    },
    show: function (D, q) {
      D.stage.innerHTML = '';
      var it = q.it;
      if (it.staff) {
        var box = h('div', 'ml-score ml-dscore' + (it.wide ? ' ml-wide' : ''));
        D.stage.appendChild(box);
        var o = Object.assign({ timeSig: false, finalBar: false, sp: smallScreen(D.stage) ? 10 : 12 }, it.o || {});
        q.sc = drawStaff(box, it.staff, o);
        if (it.hear !== false) {
          var perf = new Performer(q.sc, { tempo: it.tempo || 90, artic: o.artic, order: it.order || null, cursor: !!it.order || !!it.cursor });
          var hb = btn('▶ Hear it', 'ml-hearkey');
          hb.addEventListener('click', function () { if (perf.playing) perf.stop(); else perf.play(); });
          D.stage.appendChild(hb);
          q.perf = perf;
        }
      } else if (it.big) {
        D.stage.appendChild(h('div', 'ml-bigsym', it.big));
      }
      D.qEl.innerHTML = it.q;
    },
    answers: function (D, lv, q) {
      var ch = q.it.choices.map(function (c, i) { return { label: c, value: i }; });
      return q.it.fixed ? ch : C.shuffle(ch);
    },
    check: function (D, q, v) { return +v === q.it.a; },
    right: function (D, q) { return q.it.a; },
    reveal: function (D, q, ok) { if (q.perf) q.perf.stop(true); return (ok ? 'Yes. ' : 'Not quite: it’s “' + q.it.choices[q.it.a] + '.” ') + (q.it.why || ''); },
    perQuestion: true
  };

  function mountDrill(el) {
    var type = TYPES[attr(el, 'type', 'name')];
    if (!type || !ST) return;
    var D = { el: el, clef: attr(el, 'clef', 'treble'), id: attr(el, 'id', attr(el, 'type', 'drill')), total: +attr(el, 'total', 10) };
    var levels = jattr(el, 'levels', null) || type.levels(el);
    var lvPref = (pref('lv') || {})[D.id];
    var lvi = lvPref != null && levels[lvPref] ? lvPref : 0;
    el.classList.add('ml-w', 'ml-drill');
    var head = h('div', 'ml-dhead');
    head.appendChild(h('span', 'ml-tag', 'Practice'));
    var title = h('h3', 'ml-dtitle', esc(attr(el, 'title', type.title)));
    head.appendChild(title);
    var seg = h('div', 'mus-seg ml-levels');
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', 'Level');
    if (levels.length > 1) levels.forEach(function (lv, k) {
      var b = h('button', '', esc(lv.label));
      b.type = 'button';
      b.setAttribute('aria-pressed', k === lvi ? 'true' : 'false');
      b.addEventListener('click', function () { lvi = k; seg.querySelectorAll('button').forEach(function (x, j) { x.setAttribute('aria-pressed', j === k ? 'true' : 'false'); }); var lp = pref('lv') || {}; lp[D.id] = k; pref('lv', lp); newRound(); });
      seg.appendChild(b);
    });
    head.appendChild(seg);
    el.insertBefore(head, el.firstChild);
    var intro = attr(el, 'intro');
    if (intro) el.appendChild(h('p', 'ml-dintro', intro));
    var stage = D.stage = h('div', 'ml-stage');
    el.appendChild(stage);
    var qEl = D.qEl = h('p', 'ml-q');
    qEl.id = 'mlq' + (++uid);
    el.appendChild(qEl);
    var ans = h('div', 'ml-ans');
    ans.setAttribute('role', 'group');
    ans.setAttribute('aria-labelledby', qEl.id);
    el.appendChild(ans);
    var fb = h('p', 'ml-fb');
    fb.setAttribute('aria-live', 'polite');
    el.appendChild(fb);
    var foot = h('div', 'ml-dfoot');
    var prog = h('span', 'ml-prog');
    var best = h('span', 'ml-best');
    var next = btn('Next →', 'pri ml-next');
    next.hidden = true;
    var restart = btn('↺ New round', 'ml-restart');
    foot.appendChild(prog); foot.appendChild(best); foot.appendChild(h('span', 'ml-grow')); foot.appendChild(restart); foot.appendChild(next);
    el.appendChild(foot);
    var kbHost = null;
    if (type.keyboard) { kbHost = h('div', 'ml-dkb'); el.insertBefore(kbHost, fb); }
    var n = 0, right = 0, answered = false, q = null, results = [], lastLv = null;

    function lv() { return levels[lvi]; }
    function paintBest() {
      var inf = drillInfo(D.id + ':' + lvi);
      best.textContent = inf && inf.best ? 'Best: ' + inf.best[0] + ' of ' + inf.best[1] : '';
    }
    function paintProg() {
      prog.innerHTML = '<span class="ml-pdots" aria-hidden="true">' + Array.apply(null, Array(D.total)).map(function (x, k) { return '<i class="' + (results[k] === true ? 'ok' : results[k] === false ? 'bad' : k === n ? 'cur' : '') + '"></i>'; }).join('') + '</span>' +
        '<span class="ml-sr">Question ' + Math.min(n + 1, D.total) + ' of ' + D.total + ', ' + right + ' right so far.</span>';
    }
    function buildAnswers() {
      ans.innerHTML = '';
      if (type.keyboard) {
        if (!D.piano || lastLv !== lvi) {
          if (D.piano) D.piano.kb.destroy();
          kbHost.innerHTML = '';
          var r = type.kbRange(D, lv());
          D.piano = new Piano(kbHost, { range: r[0] + '-' + r[1], label: 'Answer on this keyboard', blackNames: !!lv().acc });
          D.piano.kb.on('down', function (e) {
            if (!q) return;
            if (answered) { if (!D.done && e.midi === C.pitch(q.note).midi) goNext(); return; }
            answer(e.midi);
          });
        }
        return;
      }
      var list = (type.answers ? type.answers(D, lv(), q) : []).concat(type.buttonsAfter ? type.buttonsAfter(D, lv(), q) : []);
      list.forEach(function (a) {
        var b = h('button', 'ml-a' + (a.cls ? ' ' + a.cls : ''), esc(a.label));
        b.type = 'button';
        b.setAttribute('data-v', String(a.value));
        if (a.key && a.key.length === 1) b.setAttribute('aria-keyshortcuts', a.key.toUpperCase());
        b.addEventListener('click', function () { if (a.value === '__check') answer(q.ghost); else answer(a.value, b); });
        ans.appendChild(b);
      });
      ans.classList.toggle('ml-many', list.length > 8);
    }
    function ask() {
      answered = false; D.done = false;
      next.hidden = true;
      fb.textContent = ''; fb.className = 'ml-fb';
      D.level = lv();
      q = D.q = type.make(D, lv());
      qEl.innerHTML = type.q || '';
      if (type.keyboard) { buildAnswers(); lastLv = lvi; }
      type.show(D, q);
      if (!type.keyboard && (type.perQuestion || !ans.children.length || lastLv !== lvi)) buildAnswers();
      lastLv = lvi;
      ans.querySelectorAll('button').forEach(function (b) { b.disabled = false; b.classList.remove('ok', 'bad', 'right'); });
      paintProg();
    }
    D.answer = answer;
    function answer(v, b) {
      if (answered || !q) return;
      answered = true;
      var ok = type.check(D, q, v);
      results[n] = ok;
      if (ok) right++;
      var msg = type.reveal(D, q, ok, v);
      fb.className = 'ml-fb ' + (ok ? 'ok' : 'bad');
      fb.innerHTML = esc(msg);
      if (b) b.classList.add(ok ? 'ok' : 'bad');
      if (!ok && type.right) { var rv = String(type.right(D, q)); ans.querySelectorAll('button').forEach(function (x) { if (x.getAttribute('data-v') === rv) x.classList.add('right'); }); }
      ans.querySelectorAll('button').forEach(function (x) { if (x.getAttribute('data-v') !== '__check') x.disabled = true; else x.disabled = true; });
      n++;
      paintProg();
      if (ok) later(function () { if (answered && q === D.q) goNext(); }, 1400);
      else { next.hidden = false; next.focus({ preventScroll: true }); }
    }
    function goNext() {
      if (!answered) return;
      if (n >= D.total) finish(); else ask();
    }
    function finish() {
      D.done = true;
      next.hidden = true;
      var inf = recordDrill(D.id + ':' + lvi, right, D.total);
      markDone();
      paintBest();
      var pct = right / D.total, word = pct === 1 ? 'Perfect!' : pct >= 0.8 ? 'Very good.' : pct >= 0.5 ? 'Good work. A few more rounds and these will feel easy.' : 'A fine start. Go slowly and try another round.';
      stage.innerHTML = '<div class="ml-done"><p class="ml-big">' + right + ' of ' + D.total + '</p><p>' + word + '</p>' + (inf && inf.best ? '<p class="ml-quiet">Your best at this level: ' + inf.best[0] + ' of ' + inf.best[1] + '.</p>' : '') + '</div>';
      var again = btn('↺ Another round', 'pri');
      again.addEventListener('click', newRound);
      stage.querySelector('.ml-done').appendChild(again);
      qEl.textContent = ''; ans.innerHTML = ''; fb.textContent = '';
      if (kbHost) kbHost.hidden = true;
      q = null;
      again.focus({ preventScroll: true });
    }
    function newRound() {
      n = 0; right = 0; results = []; D.pick = null;
      if (kbHost) kbHost.hidden = false;
      ans.innerHTML = '';
      paintBest();
      ask();
    }
    next.addEventListener('click', goNext);
    restart.addEventListener('click', newRound);
    el._drill = D; // for tests: D.q is the current question
    el.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey || !q) return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT')) return;
      if (answered) { if (e.key === 'Enter' && document.activeElement !== next && !next.hidden) { goNext(); e.preventDefault(); } return; }
      if (type.keyboard || type.place) return;
      var k = e.key.toLowerCase();
      var hit = null;
      ans.querySelectorAll('button').forEach(function (b) { var s = b.getAttribute('aria-keyshortcuts'); if (s && s.toLowerCase() === k) hit = b; });
      if (hit && !hit.disabled) { hit.click(); e.preventDefault(); }
    });
    newRound();
  }

  /* ================= rhythm: read and tap ================= */
  function mountRhythm(el) {
    if (!ST || !audioOK()) return;
    var id = attr(el, 'id', 'rhythm');
    var times = attr(el, 'times', '4/4 3/4 2/4').split(/\s+/);
    var levels = [{ label: 'Quarters & halves', v: 1 }, { label: 'Eighths & rests', v: 2 }, { label: 'Dots & ties', v: 3 }];
    var lvi = ((pref('lv') || {})[id]) || 0, bpm = pref('rbpm') || 72, counts = pref('rcounts') !== false;
    el.classList.add('ml-w', 'ml-rhythm');
    el.innerHTML = '';
    var head = h('div', 'ml-dhead');
    head.appendChild(h('span', 'ml-tag', 'Practice'));
    head.appendChild(h('h3', 'ml-dtitle', esc(attr(el, 'title', 'Read it, then tap it'))));
    var seg = h('div', 'mus-seg ml-levels');
    seg.setAttribute('role', 'group'); seg.setAttribute('aria-label', 'Level');
    levels.forEach(function (lv, k) {
      var b = h('button', '', esc(lv.label)); b.type = 'button';
      b.setAttribute('aria-pressed', k === lvi ? 'true' : 'false');
      b.addEventListener('click', function () { stop(); lvi = k; seg.querySelectorAll('button').forEach(function (x, j) { x.setAttribute('aria-pressed', j === k ? 'true' : 'false'); }); var lp = pref('lv') || {}; lp[id] = k; pref('lv', lp); fresh(); });
      seg.appendChild(b);
    });
    head.appendChild(seg);
    el.appendChild(head);
    el.appendChild(h('p', 'ml-dintro', 'Press <b>Listen</b> to hear the rhythm with the click. Then press <b>Tap along</b>: after one bar of clicks to get ready, tap the big pad (or press the space bar, <kbd>F</kbd> or <kbd>J</kbd>) once for every note. Count out loud as you go.'));
    var stage = h('div', 'ml-stage ml-rstage');
    var box = h('div', 'ml-score ml-rscore');
    stage.appendChild(box);
    var beatRow = h('div', 'ml-beats');
    beatRow.setAttribute('aria-hidden', 'true');
    stage.appendChild(beatRow);
    el.appendChild(stage);
    var ctl = h('div', 'ml-rctl');
    var listenB = btn('▶ Listen', 'ml-listen'), tapB = btn('● Tap along', 'pri ml-go'), stopB = btn('■ Stop', 'ml-stop'), newB = btn('↻ New rhythm', 'ml-new');
    stopB.disabled = true;
    var tseg = h('div', 'mus-seg ml-tempo');
    tseg.setAttribute('role', 'group'); tseg.setAttribute('aria-label', 'Tempo in beats per minute');
    [56, 72, 92].forEach(function (b) {
      var x = h('button', '', b + ' BPM'); x.type = 'button'; x.setAttribute('aria-pressed', b === bpm ? 'true' : 'false');
      x.addEventListener('click', function () { if (running) return; bpm = b; pref('rbpm', b); tseg.querySelectorAll('button').forEach(function (y) { y.setAttribute('aria-pressed', y === x ? 'true' : 'false'); }); });
      tseg.appendChild(x);
    });
    var cntB = btn('Counts', 'ml-cnt');
    cntB.setAttribute('aria-pressed', counts ? 'true' : 'false');
    [listenB, tapB, stopB, newB, cntB, tseg].forEach(function (x) { ctl.appendChild(x); });
    el.appendChild(ctl);
    var pad = h('button', 'ml-pad', '<span>Tap</span><small>space bar, F or J</small>');
    pad.type = 'button';
    pad.setAttribute('aria-label', 'Tap pad: tap once for every note');
    el.appendChild(pad);
    var status = h('p', 'ml-fb ml-rstatus');
    status.setAttribute('aria-live', 'polite');
    el.appendChild(status);
    var foot = h('div', 'ml-dfoot');
    var best = h('span', 'ml-best');
    foot.appendChild(best);
    foot.appendChild(h('span', 'ml-quiet ml-lat', calib() ? 'Using the delay correction you measured in the Rhythm trainer (' + Math.round(calib() * 1000) + ' ms).' : 'Wireless headphones add a delay. If your taps all come out late, measure your delay in the <a href="../../rhythm/">Rhythm trainer</a> and this drill will use it too.'));
    el.appendChild(foot);

    var time, pat, rh, sc, running = null, raf = 0, taps = [], timers = [], lastRes = null;
    function paintBest() { var inf = drillInfo(id + ':' + lvi); best.textContent = inf && inf.best ? 'Best at this level: ' + Math.round(100 * inf.best[0] / inf.best[1]) + '%' : ''; }
    function fresh() {
      time = times[Math.floor(Math.random() * times.length)];
      var pool = (C.RHYTHMS[time] || C.RHYTHMS['4/4']).filter(function (r) { return r.lv === lvi + 1; });
      var prev = pat;
      for (var k = 0; k < 6 && (pat === prev || !pat); k++) pat = pool[Math.floor(Math.random() * pool.length)];
      if (pat === prev && pool.length > 1) pat = pool[(pool.indexOf(pat) + 1) % pool.length];
      rh = C.parseRhythm(pat.t);
      lastRes = null;
      draw();
      status.className = 'ml-fb ml-rstatus';
      status.textContent = 'Time signature ' + time + ': ' + time.split('/')[0] + ' beats in each bar, a quarter note gets one beat.';
      paintBest();
    }
    function draw(result) {
      var per = +time.split('/')[0];
      var under = counts ? C.onsets(rh).map(function (b) { return C.countLabel(b, per); }).join(' ') : null;
      sc = drawStaff(box, { rh: pat.t, time: time }, { timeSig: true, sp: smallScreen(el) ? 9.5 : 11, under: under, label: 'A two-bar rhythm in ' + time + ' time: ' + rh.notes.map(function (n) { return n.rest ? 'rest' : n.tied ? 'tied' : C.fmtBeats(n.beats) + (n.beats === 1 ? ' beat' : ' beats'); }).join(', ') });
      var nb = per * 2;
      beatRow.innerHTML = Array.apply(null, Array(nb)).map(function (x, k) { return '<i data-b="' + k + '">' + ((k % per) + 1) + '</i>'; }).join('');
      if (result) paintResult(result);
    }
    function noteIds() { return itemsOf(sc.model, 'rh').filter(function (it) { return it.kind !== 'rest' && !it.notes[0].tiedFrom; }).map(function (it) { return it.notes[0].id; }); }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function stop() {
      if (!running) return;
      running = null;
      cancelAnimationFrame(raf);
      clearTimers();
      A.stopAll();
      sc.clear(); sc.cursor(null);
      beatRow.querySelectorAll('i').forEach(function (i) { i.classList.remove('on'); });
      stopB.disabled = true; listenB.disabled = false; tapB.disabled = false; newB.disabled = false;
      pad.classList.remove('live');
    }
    function run(mode) {
      stop();
      A.unlock();
      var per = +time.split('/')[0], spb = 60 / bpm, countIn = mode === 'tap' ? per : per;
      var t0 = A.now() + 0.15, start = t0 + countIn * spb, total = rh.total;
      for (var b = 0; b < countIn + total; b++) A.click(t0 + b * spb, b % per === 0, b < countIn ? 0.75 : 0.5);
      if (mode === 'listen') rh.notes.forEach(function (n) { if (!n.rest && !n.tied) { var len = n.beats; var k = rh.notes.indexOf(n); while (rh.notes[k] && rh.notes[k].tie && rh.notes[k + 1]) { len += rh.notes[k + 1].beats; k++; } A.play(72, start + n.beat * spb, Math.max(0.1, len * spb * 0.9), 0.6); } });
      running = { mode: mode, t0: t0, start: start, spb: spb, per: per, countIn: countIn };
      taps = [];
      stopB.disabled = false; listenB.disabled = true; tapB.disabled = true; newB.disabled = true;
      if (mode === 'tap') { pad.classList.add('live'); pad.focus({ preventScroll: true }); }
      status.className = 'ml-fb ml-rstatus';
      status.textContent = mode === 'tap' ? 'Get ready… count along with the clicks.' : 'Listen and follow the notes.';
      sc.clear();
      var ids = noteIds(), ons = C.onsets(rh), end = start + total * spb;
      function frame() {
        if (!running) return;
        var now = mode === 'tap' ? heardNow() : A.now(), beat = (now - start) / spb;
        var cb = Math.floor((now - t0) / spb);
        beatRow.querySelectorAll('i').forEach(function (i) { i.classList.toggle('on', +i.getAttribute('data-b') === cb - countIn); });
        if (beat < 0) {
          var left = Math.ceil(-beat);
          status.textContent = (mode === 'tap' ? 'Get ready: ' : 'Listen: ') + (per - left + 1) + '…';
        } else if (beat < total) {
          status.textContent = mode === 'tap' ? 'Tap!' : 'Listen…';
          var bar = Math.floor(beat / per);
          sc.cursor(bar, (beat - bar * per) * SO.TPQ);
          if (mode === 'listen') {
            ons.forEach(function (o, k) { var lit = beat >= o && beat < o + 0.45; if (lit) sc.highlight([ids[k]], 'rh'); else sc.unhighlight([ids[k]]); });
          }
        }
        if (now > end + 0.45) { finish(mode); return; }
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
    }
    function finish(mode) {
      var r = running;
      running = null;
      cancelAnimationFrame(raf);
      stopB.disabled = true; listenB.disabled = false; tapB.disabled = false; newB.disabled = false;
      pad.classList.remove('live');
      beatRow.querySelectorAll('i').forEach(function (i) { i.classList.remove('on'); });
      sc.cursor(null); sc.clear();
      if (mode !== 'tap') { status.textContent = 'Now press Tap along and tap it yourself.'; return; }
      var targets = C.onsets(rh).map(function (b) { return r.start + b * r.spb; });
      var res = C.scoreTaps(targets, taps.map(function (t) { return t - calib(); }), { window: Math.min(0.3, r.spb * 0.45) });
      paintResult(res);
      lastRes = res;
      recordDrill(id + ':' + lvi, res.pct, 100);
      markDone();
      paintBest();
      var word = res.pct >= 90 ? 'Excellent, right with the beat.' : res.pct >= 70 ? 'Nicely done.' : res.pct >= 40 ? 'Getting there. Count out loud and try again.' : 'Try it slower, and count “1 & 2 &” out loud.';
      var lateish = res.items.filter(function (i) { return i.err != null; });
      var avg = lateish.length ? lateish.reduce(function (a, i) { return a + i.err; }, 0) / lateish.length : 0;
      var lean = Math.abs(avg) > 0.04 ? ' On average you were ' + Math.round(Math.abs(avg) * 1000) + ' ms ' + (avg > 0 ? 'late' : 'early') + '.' : '';
      status.className = 'ml-fb ml-rstatus ' + (res.pct >= 70 ? 'ok' : 'bad');
      status.innerHTML = '<b>' + res.pct + '%</b>. ' + esc(word) + ' ' + res.hit + ' of ' + targets.length + ' notes tapped' + (res.extras ? ', ' + res.extras + ' extra tap' + (res.extras > 1 ? 's' : '') : '') + '.' + esc(lean) + ' <span class="ml-quiet">Green: on time. Gold: close. Red: off or missed.</span>';
      running = null;
      el._last = res;
    }
    function paintResult(res) {
      var ids = noteIds();
      res.items.forEach(function (it, k) { if (ids[k]) sc.highlight([ids[k]], it.cat === 'on' ? 'ok' : it.cat === 'close' ? 'hint' : 'bad'); });
    }
    function tap(stamp) {
      if (!running || running.mode !== 'tap') return;
      var t = heardAt(stamp);
      taps.push(t);
      A.play(84, 0, 0.08, 0.5);
      pad.classList.remove('hit'); void pad.offsetWidth; pad.classList.add('hit');
    }
    pad.addEventListener('pointerdown', function (e) { if (running && running.mode === 'tap') { e.preventDefault(); tap(e.timeStamp); } });
    pad.addEventListener('click', function (e) { if (!running && e.detail === 0) tapB.click(); });
    el.addEventListener('keydown', function (e) {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if (running && running.mode === 'tap' && (e.key === ' ' || e.code === 'KeyF' || e.code === 'KeyJ' || e.key === 'Enter')) { e.preventDefault(); tap(e.timeStamp); }
      else if (running && e.key === 'Escape') stop();
    });
    listenB.addEventListener('click', function () { run('listen'); });
    tapB.addEventListener('click', function () { run('tap'); });
    stopB.addEventListener('click', stop);
    newB.addEventListener('click', function () { stop(); fresh(); });
    cntB.addEventListener('click', function () { counts = !counts; pref('rcounts', counts); cntB.setAttribute('aria-pressed', counts ? 'true' : 'false'); draw(running ? null : lastRes); });
    el._test = { get pattern() { return pat; }, get time() { return time; }, get bpm() { return bpm; }, get running() { return running; }, taps: function () { return taps; } };
    fresh();
  }

  /* ================= play along with the click ================= */
  function mountPlayalong(el) {
    if (!ST || !audioOK()) return;
    var id = attr(el, 'id', 'playalong'), music = attr(el, 'music', 'C4/4 D4/4 E4/4 F4/4 | G4/1');
    var fingers = attr(el, 'fingers', '');
    var bpm = +attr(el, 'tempo', 60);
    el.classList.add('ml-w', 'ml-play');
    var head = h('div', 'ml-dhead');
    head.appendChild(h('span', 'ml-tag', 'Practice'));
    head.appendChild(h('h3', 'ml-dtitle', esc(attr(el, 'title', 'Play along with the click'))));
    var tseg = h('div', 'mus-seg ml-tempo');
    tseg.setAttribute('role', 'group'); tseg.setAttribute('aria-label', 'Tempo in beats per minute');
    [48, 60, 72, 88].forEach(function (b) {
      var x = h('button', '', b + ' BPM'); x.type = 'button'; x.setAttribute('aria-pressed', b === bpm ? 'true' : 'false');
      x.addEventListener('click', function () { if (running) return; bpm = b; tseg.querySelectorAll('button').forEach(function (y) { y.setAttribute('aria-pressed', y === x ? 'true' : 'false'); }); paintBest(); });
      tseg.appendChild(x);
    });
    head.appendChild(tseg);
    el.appendChild(head);
    var intro = attr(el, 'intro');
    if (intro) el.appendChild(h('p', 'ml-dintro', intro));
    var box = h('div', 'ml-score ml-pscore');
    el.appendChild(box);
    var sc = drawStaff(box, { rh: music, time: attr(el, 'time', '4/4'), fingering: fingers ? { rh: fingers } : undefined }, { timeSig: true, letters: true, sp: smallScreen(el) ? 9.5 : 11, label: attr(el, 'label', 'The notes to play') });
    var ctl = h('div', 'ml-rctl');
    var go = btn('▶ Start', 'pri'), stopB = btn('■ Stop'), guide = btn('Play the notes with me', 'ml-guide');
    guide.setAttribute('aria-pressed', 'false');
    stopB.disabled = true;
    ctl.appendChild(go); ctl.appendChild(stopB); ctl.appendChild(guide);
    el.appendChild(ctl);
    var status = h('p', 'ml-fb');
    status.setAttribute('aria-live', 'polite');
    el.appendChild(status);
    var P = new Piano(el, { range: attr(el, 'range', 'C4-C5'), label: 'Play the notes here' });
    var foot = h('div', 'ml-dfoot');
    var best = h('span', 'ml-best');
    foot.appendChild(best);
    el.appendChild(foot);
    var perf = SO.performance(sc.model), TPQ = SO.TPQ;
    var cols = perf.columns.filter(function (c) { return c.notes.some(function (n) { return !n.tied; }); });
    var running = null, raf = 0, taps = [], guideOn = false;
    function paintBest() { var inf = drillInfo(id + ':' + bpm); best.textContent = inf && inf.best ? 'Best at ' + bpm + ' BPM: ' + Math.round(100 * inf.best[0] / inf.best[1]) + '%' : ''; }
    function stop(quiet) {
      if (!running) return;
      running = null;
      cancelAnimationFrame(raf);
      if (!quiet) A.stopAll();
      sc.cursor(null);
      P.kb.clear('hint');
      go.disabled = false; stopB.disabled = true;
    }
    P.kb.on('down', function (e) { if (running && running.play) taps.push({ t: heardAt(performance.now()) - calib(), midi: e.midi }); });
    guide.addEventListener('click', function () { guideOn = !guideOn; guide.setAttribute('aria-pressed', guideOn ? 'true' : 'false'); });
    go.addEventListener('click', function () {
      stop(true);
      A.unlock();
      sc.clear();
      var spq = 60 / bpm, per = sc.model.time.num * 4 / sc.model.time.den, t0 = A.now() + 0.15, start = t0 + per * spq;
      var totalQ = perf.total / TPQ;
      for (var b = 0; b < per + totalQ; b++) A.click(t0 + b * spq, b % per === 0, b < per ? 0.75 : 0.45);
      if (guideOn) perf.events.forEach(function (e) { A.play(e.midi, start + e.start / TPQ * spq, e.dur / TPQ * spq * 0.9, 0.35); });
      running = { start: start, spq: spq, play: true };
      taps = [];
      go.disabled = true; stopB.disabled = false;
      P.kb.el.querySelector('.mk-keys').focus({ preventScroll: true });
      var end = start + totalQ * spq;
      function frame() {
        if (!running) return;
        var now = heardNow(), q = (now - start) / spq;
        if (q < 0) status.textContent = 'Get ready: ' + (per - Math.ceil(-q) + 1) + '…';
        else if (q < totalQ) {
          status.textContent = 'Play!';
          var tick = q * TPQ, cur = null;
          perf.measures.forEach(function (M) { if (tick >= M.start && tick < M.start + M.len) cur = M; });
          if (cur) sc.cursor(cur.index, tick - cur.start);
        }
        // light the next key a little ahead of its beat
        var nextCol = null;
        for (var k = 0; k < cols.length; k++) { if (cols[k].t / TPQ > q - 0.25) { nextCol = cols[k]; break; } }
        P.kb.clear('hint');
        if (nextCol && nextCol.t / TPQ - q < 1.05) nextCol.notes.forEach(function (n) { if (!n.tied) P.kb.highlight(n.midi, 'hint'); });
        if (now > end + 0.4) { done(); return; }
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
    });
    function done() {
      var r = running;
      stop(true);
      var targets = [];
      cols.forEach(function (c) { c.notes.forEach(function (n) { if (!n.tied) targets.push({ t: r.start + c.t / TPQ * r.spq, midi: n.midi, id: n.id }); }); });
      var res = C.scoreNotes(targets, taps, { window: Math.min(0.32, r.spq * 0.45) });
      res.items.forEach(function (it, k) { sc.highlight([targets[k].id], it.cat === 'on' ? 'ok' : it.cat === 'close' ? 'hint' : 'bad'); });
      recordDrill(id + ':' + bpm, res.pct, 100);
      markDone();
      paintBest();
      var wrong = res.items.filter(function (i) { return i.cat === 'wrong'; }).length;
      status.className = 'ml-fb ' + (res.pct >= 70 ? 'ok' : 'bad');
      status.innerHTML = '<b>' + res.pct + '%</b>. ' + res.hit + ' of ' + targets.length + ' notes right and in time' + (wrong ? ', ' + wrong + ' wrong key' + (wrong > 1 ? 's' : '') : '') + '. ' +
        (res.pct >= 85 ? 'Lovely and steady. Try the next tempo up.' : res.pct >= 50 ? 'Good. Play it a few more times at this tempo before speeding up.' : 'Try a slower tempo, and turn on “Play the notes with me.”') +
        ' <span class="ml-quiet">Green: on time. Gold: close. Red: off, missed or a wrong key.</span>';
      el._last = res;
    }
    stopB.addEventListener('click', function () { stop(); status.textContent = 'Stopped.'; });
    paintBest();
    el._test = { get running() { return running; } };
  }

  /* ================= fingers ================= */
  function handSVG(side) {
    // a hand seen from above, palm down; the thumb points toward the other hand. Finger shapes are drawn first and the
    // palm over their bases; the numbered fingertips (the buttons) go on top.
    var R = side === 'rh', sx = function (x) { return R ? x : 200 - x; };
    var F = [ // finger: base x, base y, length, width, angle (degrees, 0 = straight up)
      { n: 1, x: 74, y: 182, len: 64, w: 27, a: -48 }, { n: 2, x: 81, y: 114, len: 76, w: 23, a: -8 }, { n: 3, x: 105, y: 108, len: 85, w: 23, a: -1 },
      { n: 4, x: 129, y: 110, len: 78, w: 22, a: 6 }, { n: 5, x: 151, y: 120, len: 60, w: 20, a: 14 }];
    var NAMES = { 1: 'thumb', 2: 'index finger', 3: 'middle finger', 4: 'ring finger', 5: 'little finger' };
    var hand = R ? 'Right' : 'Left';
    var s = '<svg viewBox="0 0 200 250" class="ml-hand" role="group" aria-label="' + hand + ' hand">', tips = '';
    F.forEach(function (f) {
      var a = (R ? f.a : -f.a), x = sx(f.x);
      var tipx = x + Math.sin(a * Math.PI / 180) * f.len, tipy = f.y - Math.cos(a * Math.PI / 180) * f.len;
      s += '<g class="ml-fing" data-f="' + f.n + '" data-hand="' + side + '" aria-hidden="true"><rect x="' + (x - f.w / 2) + '" y="' + (f.y - f.len - f.w / 2) + '" width="' + f.w + '" height="' + (f.len + f.w / 2 + 24) + '" rx="' + (f.w / 2) + '" transform="rotate(' + a + ' ' + x + ' ' + f.y + ')"/></g>';
      tips += '<g class="ml-fing ml-tip" data-f="' + f.n + '" data-hand="' + side + '" tabindex="0" role="button" aria-label="' + hand + ' hand ' + NAMES[f.n] + '">' +
        '<circle cx="' + tipx.toFixed(1) + '" cy="' + tipy.toFixed(1) + '" r="11.5"/><text x="' + tipx.toFixed(1) + '" y="' + (tipy + 4.6).toFixed(1) + '" text-anchor="middle">' + f.n + '</text></g>';
    });
    s += '<path class="ml-palm" d="M' + sx(66) + ' 118 C' + sx(58) + ' 162 ' + sx(64) + ' 214 ' + sx(80) + ' 242 L' + sx(152) + ' 242 C' + sx(163) + ' 212 ' + sx(167) + ' 164 ' + sx(163) + ' 114 C' + sx(150) + ' 98 ' + sx(84) + ' 98 ' + sx(66) + ' 118 Z"/>';
    s += '<path class="ml-thumbline" d="M' + sx(70) + ' 150 C' + sx(76) + ' 176 ' + sx(86) + ' 196 ' + sx(98) + ' 208" fill="none"/>';
    s += tips + '<text class="ml-handlab" x="' + sx(112) + '" y="214" text-anchor="middle">' + hand + '</text>';
    return s + '</svg>';
  }
  function mountFingers(el) {
    el.classList.add('ml-w', 'ml-fingers');
    var NAMES = { 1: 'thumb', 2: 'index finger (pointer)', 3: 'middle finger', 4: 'ring finger', 5: 'little finger (pinky)' };
    var RHC = { 1: 60, 2: 62, 3: 64, 4: 65, 5: 67 }, LHC = { 5: 48, 4: 50, 3: 52, 2: 53, 1: 55 };
    el.innerHTML = '';
    var head = h('div', 'ml-dhead');
    head.appendChild(h('span', 'ml-tag', 'Try it'));
    head.appendChild(h('h3', 'ml-dtitle', 'Your finger numbers'));
    var seg = h('div', 'mus-seg');
    seg.setAttribute('role', 'group'); seg.setAttribute('aria-label', 'Mode');
    var exB = h('button', '', 'Explore'), qzB = h('button', '', 'Quiz me');
    exB.type = qzB.type = 'button';
    exB.setAttribute('aria-pressed', 'true'); qzB.setAttribute('aria-pressed', 'false');
    seg.appendChild(exB); seg.appendChild(qzB);
    head.appendChild(seg);
    el.appendChild(head);
    var say = h('p', 'ml-say', 'Tap a finger on either hand.');
    say.setAttribute('aria-live', 'polite');
    el.appendChild(say);
    var hands = h('div', 'ml-hands', handSVG('lh') + handSVG('rh'));
    el.appendChild(hands);
    var fb = h('p', 'ml-fb');
    fb.setAttribute('aria-live', 'polite');
    el.appendChild(fb);
    var foot = h('div', 'ml-dfoot');
    var prog = h('span', 'ml-prog'), best = h('span', 'ml-best');
    foot.appendChild(prog); foot.appendChild(best);
    el.appendChild(foot);
    var quiz = null;
    function light(f, hand, cls) {
      hands.querySelectorAll('.ml-fing[data-f="' + f + '"][data-hand="' + hand + '"]').forEach(function (g) {
        g.classList.add(cls);
        later(function () { g.classList.remove(cls); }, 900);
      });
    }
    function paintBest() { var inf = drillInfo('fingers'); best.textContent = inf && inf.best ? 'Best: ' + inf.best[0] + ' of ' + inf.best[1] : ''; }
    function ask() {
      if (quiz.n >= 10) {
        recordDrill('fingers', quiz.right, 10); markDone(); paintBest();
        say.innerHTML = '<b>' + quiz.right + ' of 10.</b> ' + (quiz.right >= 9 ? 'You know your finger numbers.' : 'Try another round: it gets quick.');
        prog.textContent = '';
        quiz = null;
        exB.setAttribute('aria-pressed', 'true'); qzB.setAttribute('aria-pressed', 'false');
        return;
      }
      quiz.f = 1 + Math.floor(Math.random() * 5); quiz.hand = Math.random() < 0.5 ? 'lh' : 'rh';
      say.innerHTML = 'Tap: <b>' + (quiz.hand === 'rh' ? 'right' : 'left') + ' hand, finger ' + quiz.f + '</b>';
      prog.textContent = 'Question ' + (quiz.n + 1) + ' of 10 · ' + quiz.right + ' right';
    }
    function pick(g) {
      var f = +g.getAttribute('data-f'), hand = g.getAttribute('data-hand');
      tone(hand === 'rh' ? RHC[f] : LHC[f], 0.7);
      if (!quiz) {
        light(f, hand, 'on');
        fb.className = 'ml-fb';
        fb.textContent = (hand === 'rh' ? 'Right' : 'Left') + ' hand, finger ' + f + ': your ' + NAMES[f] + '. In C position it plays ' + C.label(C.midiName(hand === 'rh' ? RHC[f] : LHC[f]), true) + '.';
        return;
      }
      var ok = f === quiz.f && hand === quiz.hand;
      quiz.n++;
      if (ok) quiz.right++;
      light(f, hand, ok ? 'ok' : 'bad');
      if (!ok) light(quiz.f, quiz.hand, 'right');
      fb.className = 'ml-fb ' + (ok ? 'ok' : 'bad');
      fb.textContent = ok ? 'Yes! Finger ' + f + ' is the ' + NAMES[f] + '.' : 'That was ' + (hand === 'rh' ? 'right' : 'left') + ' hand finger ' + f + '. Finger ' + quiz.f + ' on the ' + (quiz.hand === 'rh' ? 'right' : 'left') + ' hand is the ' + NAMES[quiz.f] + ' (lit in gold).';
      later(function () { if (quiz) ask(); }, ok ? 800 : 1800);
    }
    hands.addEventListener('click', function (e) { var g = e.target.closest && e.target.closest('.ml-fing'); if (g) pick(g); });
    hands.addEventListener('keydown', function (e) { var g = e.target.closest && e.target.closest('.ml-fing'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(g); } });
    exB.addEventListener('click', function () { quiz = null; exB.setAttribute('aria-pressed', 'true'); qzB.setAttribute('aria-pressed', 'false'); say.textContent = 'Tap a finger on either hand.'; prog.textContent = ''; fb.textContent = ''; });
    qzB.addEventListener('click', function () { quiz = { n: 0, right: 0 }; qzB.setAttribute('aria-pressed', 'true'); exB.setAttribute('aria-pressed', 'false'); fb.textContent = ''; ask(); });
    paintBest();
  }

  /* ================= pedals ================= */
  function mountPedals(el) {
    if (!audioOK()) return;
    el.classList.add('ml-w', 'ml-pedals');
    el.innerHTML = '';
    el.appendChild(h('div', 'ml-head', '<span class="ml-tag">Try it</span>'));
    var say = h('p', 'ml-say', 'Press the right pedal, play a few keys, and let go of them. Then lift the pedal.');
    el.appendChild(say);
    var P = new Piano(el, { range: 'C3-C5', rangeSm: 'C4-C5', sound: false, label: 'Piano keyboard with pedals' });
    var row = h('div', 'ml-pedrow');
    var defs = [{ k: 'soft', t: 'Soft', s: 'left' }, { k: 'sost', t: 'Sostenuto', s: 'middle' }, { k: 'sus', t: 'Sustain', s: 'right' }];
    var B = {};
    defs.forEach(function (d) {
      var b = h('button', 'ml-ped ml-ped-' + d.k, '<span class="ml-pedfoot" aria-hidden="true"></span><b>' + d.t + '</b><small>' + d.s + ' pedal</small>');
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      row.appendChild(b);
      B[d.k] = b;
    });
    el.appendChild(row);
    var fb = h('p', 'ml-fb');
    fb.setAttribute('aria-live', 'polite');
    el.appendChild(fb);
    el.appendChild(h('p', 'ml-quiet', 'Each pedal stays down until you press it again. Shortcut: hold <kbd>Shift</kbd> for the sustain pedal. On this screen the soft pedal simply plays more quietly; a real one also makes the tone a little softer.'));
    var state = { soft: false, sost: false, sus: false }, caught = {}, kb = P.kb;
    var msg = {
      sus: ['Sustain pedal down: every note keeps ringing after you let go of its key.', 'Sustain pedal up: the dampers drop and the notes stop.'],
      sost: ['Sostenuto down: only the keys you were holding at that moment keep ringing. Notes you play now stop when you let go.', 'Sostenuto up.'],
      soft: ['Soft pedal down: everything you play now is quieter.', 'Soft pedal up.']
    };
    function set(k, on) {
      state[k] = on;
      B[k].setAttribute('aria-pressed', on ? 'true' : 'false');
      if (k === 'sus') A.pedal(on);
      if (k === 'sost') {
        if (on) { caught = {}; for (var m = 21; m <= 108; m++) if (kb.isDown(m)) caught[m] = 1; }
        else { Object.keys(caught).forEach(function (m) { if (!kb.isDown(+m)) A.noteOff(+m); }); caught = {}; }
      }
      fb.textContent = msg[k][on ? 0 : 1] + (k === 'sost' && on && !Object.keys(caught).length ? ' (You weren’t holding any key, so nothing was caught. Hold a key, or a computer key such as A, then press this pedal.)' : '');
    }
    defs.forEach(function (d) { B[d.k].addEventListener('click', function () { A.unlock(); set(d.k, !state[d.k]); }); });
    kb.on('down', function (e) { A.unlock(); A.noteOff(e.midi); A.noteOn(e.midi, (e.velocity || 0.7) * (state.soft ? 0.5 : 1)); });
    kb.on('up', function (e) { if (state.sost && caught[e.midi]) return; A.noteOff(e.midi); });
    function onShift(e) {
      if (e.key !== 'Shift' || e.repeat) return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (!el.contains(document.activeElement) && document.activeElement !== document.body) return;
      if (e.type === 'keydown' && !state.sus) set('sus', true);
      if (e.type === 'keyup' && state.sus) set('sus', false);
    }
    document.addEventListener('keydown', onShift);
    document.addEventListener('keyup', onShift);
    window.addEventListener('pagehide', function () { if (state.sus) A.pedal(false); });
  }

  /* ================= circle of fifths ================= */
  function mountCircle(el) {
    el.classList.add('ml-w', 'ml-circle');
    el.innerHTML = '';
    el.appendChild(h('div', 'ml-head', '<span class="ml-tag">Explore</span>'));
    el.appendChild(h('p', 'ml-say', 'Pick a key on the circle to see its key signature and hear its scale.'));
    var CIRC = [['C', 'Am'], ['G', 'Em'], ['D', 'Bm'], ['A', 'F#m'], ['E', 'C#m'], ['B', 'G#m', 'Cb', 'Abm'], ['F#', 'D#m', 'Gb', 'Ebm'], ['Db', 'Bbm', 'C#', 'A#m'], ['Ab', 'Fm'], ['Eb', 'Cm'], ['Bb', 'Gm'], ['F', 'Dm']];
    var row = h('div', 'ml-circrow');
    var s = '<svg viewBox="-150 -150 300 300" class="ml-csvg" role="group" aria-label="The circle of fifths">';
    s += '<circle r="138" class="ml-cring"/><circle r="92" class="ml-cring2"/><circle r="52" class="ml-cmid"/>';
    s += '<text y="-6" text-anchor="middle" class="ml-cmidt">sharps →</text><text y="12" text-anchor="middle" class="ml-cmidt">← flats</text>';
    CIRC.forEach(function (k, i) {
      var a = i * 30 * Math.PI / 180, x = Math.sin(a), y = -Math.cos(a);
      var f = C.fifthsOf(k[0]), n = Math.abs(f);
      var acc = n ? n + (f > 0 ? '♯' : '♭') : '';
      s += '<g class="ml-ck" tabindex="0" role="button" data-i="' + i + '" aria-label="' + esc(C.keyLabel(k[0]) + (k[2] ? ' or ' + C.keyLabel(k[2]) : '') + ', relative minor ' + C.keyLabel(k[1])) + '">' +
        '<circle cx="' + (x * 115) + '" cy="' + (y * 115) + '" r="21"/>' +
        '<text x="' + (x * 115) + '" y="' + (y * 115 + (k[2] ? -1 : 5)) + '" text-anchor="middle" class="ml-ckmaj">' + esc(C.keyLabel(k[0]).replace(' major', '')) + '</text>' +
        (k[2] ? '<text x="' + (x * 115) + '" y="' + (y * 115 + 12) + '" text-anchor="middle" class="ml-ckalt">' + esc(C.keyLabel(k[2]).replace(' major', '')) + '</text>' : '') +
        '<text x="' + (x * 72) + '" y="' + (y * 72 + 4) + '" text-anchor="middle" class="ml-ckmin">' + esc(C.keyLabel(k[1]).replace(' minor', 'm')) + '</text>' +
        (acc ? '<text x="' + (x * 147) + '" y="' + (y * 147 + 4) + '" text-anchor="middle" class="ml-ckacc">' + acc + '</text>' : '') + '</g>';
    });
    s += '</svg>';
    var circ = h('div', 'ml-cwrap', s);
    row.appendChild(circ);
    var side = h('div', 'ml-cside');
    var title = h('p', 'ml-ctitle');
    title.setAttribute('aria-live', 'polite');
    var box1 = h('div', 'ml-score ml-dscore'), box2 = h('div', 'ml-score ml-dscore');
    var info = h('p', 'ml-cinfo');
    var hb = btn('▶ Hear the scale', 'ml-hearkey');
    side.appendChild(title); side.appendChild(box1); side.appendChild(box2); side.appendChild(info); side.appendChild(hb);
    row.appendChild(side);
    el.appendChild(row);
    var cur = 0, alt = false;
    function show(i, useAlt) {
      cur = i; alt = !!useAlt;
      var k = CIRC[i], key = alt && k[2] ? k[2] : k[0], minor = alt && k[3] ? k[3] : k[1];
      var f = C.fifthsOf(key), n = Math.abs(f), sig = C.keySig(f).map(function (x) { return C.label(x + '4'); });
      circ.querySelectorAll('.ml-ck').forEach(function (g) { g.classList.toggle('on', +g.getAttribute('data-i') === i); g.setAttribute('aria-pressed', +g.getAttribute('data-i') === i ? 'true' : 'false'); });
      title.innerHTML = '<b>' + esc(C.keyLabel(key)) + '</b> · relative minor ' + esc(C.keyLabel(minor)) + (k[2] ? ' <button type="button" class="ml-altb">or ' + esc(C.keyLabel(alt ? k[0] : k[2])) + '</button>' : '');
      var scale = C.scale(key, 4);
      drawStaff(box1, scale.slice(0, 4).map(function (x) { return x + '/4'; }).join(' ') + ' | ' + scale.slice(4).map(function (x) { return x + '/4'; }).join(' '), { clef: 'treble', key: key, timeSig: false, finalBar: false, sp: smallScreen(el) ? 8.5 : 9.5, label: C.keyLabel(key) + ' scale on the treble staff with its key signature' });
      drawStaff(box2, 'R', { clef: 'bass', key: key, timeSig: false, finalBar: false, norest: true, sp: smallScreen(el) ? 8.5 : 9.5, label: 'The same key signature on the bass staff' });
      info.innerHTML = (n ? n + (f > 0 ? ' sharp' : ' flat') + (n > 1 ? 's' : '') + ': ' + sig.join(' ') : 'No sharps or flats.') +
        ' The scale: ' + scale.map(function (x) { return C.label(x); }).join(' ') + '.' + (k[2] ? ' ' + C.keyLabel(k[0]) + ' and ' + C.keyLabel(k[2]) + ' use the same keys on the piano, written two ways.' : '');
      var ab = title.querySelector('.ml-altb');
      if (ab) ab.addEventListener('click', function () { show(cur, !alt); });
    }
    circ.addEventListener('click', function (e) { var g = e.target.closest && e.target.closest('.ml-ck'); if (g) { show(+g.getAttribute('data-i')); playScale(); } });
    circ.addEventListener('keydown', function (e) {
      var g = e.target.closest && e.target.closest('.ml-ck');
      if (!g) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(+g.getAttribute('data-i')); playScale(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var j = (+g.getAttribute('data-i') + (e.key === 'ArrowRight' ? 1 : 11)) % 12; circ.querySelector('.ml-ck[data-i="' + j + '"]').focus(); }
    });
    function playScale() {
      var k = CIRC[cur], key = alt && k[2] ? k[2] : k[0];
      playSeq(C.scale(key, 4).map(midiOf), 0.28, 0.3);
    }
    hb.addEventListener('click', playScale);
    show(0);
  }

  /* ================= checklist ================= */
  function mountCheck(el) {
    var id = attr(el, 'id', 'check');
    el.classList.add('ml-w', 'ml-check');
    var saved = (pref('checks') || {})[id] || {};
    var lis = el.querySelectorAll('li');
    lis.forEach(function (li, k) {
      var lab = h('label', 'ml-chk');
      var cb = h('input');
      cb.type = 'checkbox';
      cb.checked = !!saved[k];
      lab.appendChild(cb);
      var span = h('span', '', li.innerHTML);
      lab.appendChild(span);
      li.innerHTML = '';
      li.appendChild(lab);
      cb.addEventListener('change', function () {
        var all = pref('checks') || {};
        all[id] = all[id] || {};
        all[id][k] = cb.checked;
        pref('checks', all);
        if ([].every.call(el.querySelectorAll('input'), function (x) { return x.checked; })) { markDone(); tone(72, 0.5, 0.4); }
      });
    });
  }

  /* ================= song player embed ================= */
  function mountPlayer(el) {
    if (!TRB.player) return;
    var slug = attr(el, 'song');
    var src = document.querySelector('.ml-songsrc[data-slug="' + slug + '"]');
    if (!src) return;
    el.classList.add('mus-box', 'ml-player');
    el.innerHTML = '';
    TRB.player.mount(el, src.getAttribute('data-yaml'), { letters: true });
  }

  /* ================= mount everything ================= */
  var MOUNT = { kb: mountKb, keys: mountKeys, staff: mountStaff, explore: mountExplore, drill: mountDrill, rhythm: mountRhythm, playalong: mountPlayalong,
    fingers: mountFingers, pedals: mountPedals, circle: mountCircle, check: mountCheck, player: mountPlayer };
  function mountAll(root) {
    (root || document).querySelectorAll('[data-ml]').forEach(function (el) {
      if (el._ml) return;
      el._ml = true;
      var f = MOUNT[el.getAttribute('data-ml')];
      if (!f) return;
      try { f(el); } catch (e) { setTimeout(function () { throw e; }); }
    });
    paintDone();
    // keep the current chapter in view in the chapter strip (it scrolls sideways on phones)
    var cur = document.querySelector('.ml-strip ol a[aria-current="page"]');
    if (cur) { var ol = cur.closest('ol'); if (ol.scrollWidth > ol.clientWidth) ol.scrollLeft = Math.max(0, cur.parentNode.offsetLeft - ol.offsetLeft - (ol.clientWidth - cur.offsetWidth) / 2); }
  }
  L.ui = { mount: mountAll, Piano: Piano, drawStaff: drawStaff, Performer: Performer, store: { get: sget, put: sput, KEY: KEY }, markDone: markDone, TYPES: TYPES };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mountAll(); });
  else mountAll();
})();
