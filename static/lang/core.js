/* Shared engine for the sentence drills and reader: data, word rendering, grammar panel, audio, progress.
   Language codes: g = Gospel Greek (MACULA tokens), l = Vulgate Latin (PROIEL tokens),
   L = classical Latin, G = classical Greek (7-field treebank tokens, PROIEL or Perseus AGLDT). */
(function (W, D) {
  'use strict';
  var BASE = (D.querySelector('meta[name="lang-base"]') || {}).content || '/lang/';
  var GREEK_AUDIO = 'https://archive.org/download/AudiogreeknewtestamentOfWescott.hort.readByMarilynPhemister/';
  var BOOKS = { MAT: 'Matthew', MRK: 'Mark', LUK: 'Luke', JHN: 'John' };
  var LATIN_BOOKS = { MAT: 'Matthaeum', MRK: 'Marcum', LUK: 'Lucam', JHN: 'Ioannem' };
  var GREEK_BOOKS = { MAT: 'Ματθαῖον', MRK: 'Μᾶρκον', LUK: 'Λουκᾶν', JHN: 'Ἰωάννην' };

  var cache = {};
  // Failed downloads are forgotten so "Try again" can fetch them afresh; retry=true skips the browser cache.
  function getJSON(name, retry) {
    if (!cache[name]) cache[name] = fetch(BASE + 'data/' + name + (retry ? '?r=' + Date.now() : ''), retry ? { cache: 'reload' } : undefined).then(function (r) {
      if (!r.ok) throw new Error('Could not load ' + name + ' (' + r.status + ')'); return r.json();
    }).catch(function (e) { delete cache[name]; throw e; });
    return cache[name];
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- rendering ----------
  // Greek token: [text, after, lexIdx, gloss, morph, role]
  // Latin and classical tokens: [form, before, after, lexIdx, pos, morph, rel]
  function renderWords(lang, toks, opts) {
    opts = opts || {};
    var h = '';
    toks.forEach(function (t, i) {
      var word, before = '', after, gloss;
      if (lang === 'g') { word = t[0]; after = t[1] || ''; if (after && !/\s$/.test(after)) after += ' '; gloss = t[3]; }
      else { word = t[0]; before = t[1] || ''; after = t[2]; gloss = null; }
      var g = opts.interlinear ? '<span class="w-gl">' + esc(glossFor(lang, t) || '·') + '</span>' : '';
      var red = (lang === 'g' ? t[6] : t[7]) === 1 ? ' wj' : '';
      h += esc(before) + '<span class="w' + red + '" tabindex="0" data-l="' + lang + '" data-i="' + i + '"><span class="w-t">' + esc(word) + '</span>' + g + '</span>' + esc(after);
    });
    return h;
  }
  var LEX = { g: null, l: null, L: null, G: null };
  function glossFor(lang, t) {
    if (lang === 'g') return (t[3] || '').replace(/^\[|\]$/g, '');
    var e = LEX[lang] && LEX[lang][t[3]]; if (!e) return '';
    return shortGloss(e.g);
  }
  function shortGloss(s) { s = String(s || ''); if (/^\(/.test(s)) return s; return s.split(/[;,(]/)[0].trim(); }
  function loadLex(retry) {
    return Promise.all([getJSON('grc-lex.json', retry), getJSON('lat-lex.json', retry)]).then(function (r) { LEX.g = r[0]; LEX.l = r[1]; return LEX; });
  }
  // Classical sentences: which = 'L' (Latin) or 'G' (Greek). Resolves to { works, s: [...] }.
  function loadClassics(which, retry) {
    var n = which === 'L' ? 'lat' : 'grc';
    return Promise.all([getJSON('cls-' + n + '.json', retry), getJSON('cls-' + n + '-lex.json', retry)]).then(function (r) { LEX[which] = r[1]; return r[0]; });
  }

  // ---------- word panel ----------
  function wordInfo(lang, t) {
    if (lang === 'g') {
      var e = LEX.g[t[2]] || {}, gr = W.Grammar.greek(t[4], t[5]);
      return {
        lang: 'Koine Greek', word: t[0], lemma: e.l, gloss: (t[3] || '').replace(/[\[\]]/g, ''), def: e.d || e.b, pos: gr.pos,
        parts: gr.parts, notes: gr.notes, cls: W.Grammar.greekClass(e.l, t[4]), freq: e.n, code: t[4], strong: e.s
      };
    }
    if (lang === 'L' || lang === 'G') {
      var ce = LEX[lang][t[3]] || {}, ct = W.Grammar.tree(t[4], t[5], t[6]), co = W.Grammar.coarse(t[4], t[5]);
      return {
        lang: lang === 'L' ? 'Latin' : 'Ancient Greek', word: t[0], lemma: ce.l, gloss: shortGloss(ce.g), def: ce.g, pos: ct.pos, parts: ct.parts, notes: ct.notes,
        cls: lang === 'L' ? W.Grammar.latinClass(ce.l, co === 'V' ? 'V-' : co === 'N' ? 'Nb' : '') : W.Grammar.greekClass(ce.l, co),
        freq: ce.n, freqNote: 'in the classical sentences', code: t[5]
      };
    }
    var le = LEX.l[t[3]] || {}, lt = W.Grammar.latin(t[4], t[5], t[6]);
    return {
      lang: 'Latin', word: t[0], lemma: le.l, gloss: shortGloss(le.g), def: le.g, pos: lt.pos, parts: lt.parts, notes: lt.notes,
      cls: W.Grammar.latinClass(le.l, t[4]), freq: le.n, code: t[5]
    };
  }
  function panelHTML(info) {
    var h = '<div class="wp-head"><span class="wp-lang">' + esc(info.lang) + '</span>' +
      '<div class="wp-word ' + (info.lang === 'Latin' ? 'lat' : 'grc') + '">' + esc(info.word) + '</div>' +
      '<div class="wp-lemma">dictionary form: <b class="' + (info.lang === 'Latin' ? 'lat' : 'grc') + '">' + esc(info.lemma || '—') + '</b>' +
      (info.pos ? ' · <i>' + esc(info.pos) + '</i>' : '') + '</div>' +
      (info.gloss ? '<div class="wp-gloss">“' + esc(info.gloss) + '”</div>' : '') + '</div>';
    if (info.parts.length) {
      h += '<dl class="wp-parts">';
      info.parts.forEach(function (p) {
        h += '<div><dt>' + esc(p.k) + '</dt><dd>' + esc(p.v) + (p.tip ? '<small>' + esc(p.tip) + '</small>' : '') + '</dd></div>';
      });
      h += '</dl>';
    }
    if (info.cls) h += '<p class="wp-note"><b>Pattern:</b> ' + esc(info.cls) + '</p>';
    info.notes.forEach(function (n) { h += '<p class="wp-note">' + esc(n) + '</p>'; });
    if (info.def) h += '<p class="wp-def"><b>Dictionary:</b> ' + esc(info.def) + '</p>';
    if (info.freq) h += '<p class="wp-freq">Appears ' + info.freq + '× ' + (info.freqNote || 'in the four Gospels') + (info.strong ? ' · Strong’s G' + info.strong : '') + '</p>';
    return h;
  }
  function tooltipHTML(info) {
    return '<b>' + esc(info.lemma || info.word) + '</b> ' + (info.gloss ? '“' + esc(info.gloss) + '”' : '') +
      '<br><small>' + esc([info.pos].concat(info.parts.filter(function (p) { return p.k !== 'Role'; }).map(function (p) { return p.v; })).join(' · ')) + '</small>';
  }

  // Attach hover/click behavior. getTok(lang, el) must return the token for a word element.
  function bindWords(root, getTok, panel) {
    var tip = D.createElement('div'); tip.className = 'wtip'; tip.hidden = true; D.body.appendChild(tip);
    var current = null;
    function info(el) { var t = getTok(el.dataset.l, el); return t ? wordInfo(el.dataset.l, t) : null; }
    root.addEventListener('mouseover', function (e) {
      var el = e.target.closest('.w'); if (!el || !root.contains(el) || W.matchMedia('(hover: none)').matches) return;
      var i = info(el); if (!i) return;
      tip.innerHTML = tooltipHTML(i); tip.hidden = false;
      var r = el.getBoundingClientRect();
      tip.style.left = Math.min(W.innerWidth - 280, Math.max(8, r.left + W.scrollX)) + 'px';
      tip.style.top = (r.bottom + W.scrollY + 6) + 'px';
    });
    root.addEventListener('mouseout', function (e) { if (e.target.closest('.w')) tip.hidden = true; });
    function pick(el) {
      var i = info(el); if (!i) return;
      if (current) current.classList.remove('sel');
      current = el; el.classList.add('sel'); tip.hidden = true;
      panel.innerHTML = panelHTML(i); panel.classList.add('open');
      if (panel.dataset.sheet !== undefined) panel.scrollTop = 0;
    }
    root.addEventListener('click', function (e) { var el = e.target.closest('.w'); if (el && root.contains(el)) pick(el); });
    root.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var el = e.target.closest('.w'); if (el) pick(el); } });
  }

  // ---------- audio ----------
  var voices = [];
  function loadVoices() { voices = W.speechSynthesis ? W.speechSynthesis.getVoices() : []; }
  if (W.speechSynthesis) { loadVoices(); W.speechSynthesis.onvoiceschanged = loadVoices; }
  function pickVoice(prefixes) {
    for (var i = 0; i < prefixes.length; i++) {
      var p = prefixes[i].toLowerCase();
      var list = voices.filter(function (v) { return v.lang.toLowerCase().replace('_', '-').indexOf(p) === 0; });
      if (list.length) {
        list.sort(function (a, b) { return score(b) - score(a); });
        return list[0];
      }
    }
    return null;
  }
  function score(v) { var n = v.name.toLowerCase(); return (/natural|neural|premium|enhanced|google/.test(n) ? 2 : 0) + (v.localService ? 1 : 0); }
  var VOICE_PREFS = { en: ['en-us', 'en-gb', 'en'], l: ['it-it', 'it', 'la', 'es'], g: ['el-gr', 'el'] };
  function voiceFor(kind) { return pickVoice(VOICE_PREFS[kind]); }

  function Player() {
    this.audio = new Audio(); this.audio.preload = 'auto';
    if ('preservesPitch' in this.audio) this.audio.preservesPitch = true;
    this.token = 0;
  }
  Player.prototype.stop = function () {
    this.token++; try { this.audio.pause(); } catch (e) { }
    if (W.speechSynthesis) W.speechSynthesis.cancel();
  };
  // Device voices are modern Greek: give them monotonic text (no breathings, one accent) so they read words
  // instead of spelling out unfamiliar ancient characters letter by letter.
  function monotonic(s) {
    return s.normalize('NFD').replace(/[\u0313\u0314\u0345\u0306\u0304]/g, '').replace(/[\u0300\u0342]/g, '\u0301')
      .replace(/\u0301(?=\u0301)/g, '').normalize('NFC').replace(/[\u1FBD\u1FBF\u2019\u02BC']/g, '');
  }
  Player.prototype.speak = function (text, kind, rate) {
    var self = this, tok = self.token;
    return new Promise(function (res) {
      if (!W.speechSynthesis) return res(false);
      var v = voiceFor(kind);
      // No Greek voice on this device: another language's voice would only spell the letters, so stay silent.
      if (kind === 'g' && !v) { setTimeout(function () { res(tok === self.token); }, 600); return; }
      var u = new SpeechSynthesisUtterance(kind === 'g' ? monotonic(text) : text);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = { en: 'en-US', l: 'it-IT', g: 'el-GR' }[kind];
      u.rate = Math.max(0.1, Math.min(10, rate));
      var done = false; function fin() { if (!done) { done = true; clearInterval(k); res(tok === self.token); } }
      u.onend = fin; u.onerror = fin;
      // Chrome can stall long utterances; keep it alive and guard with a timeout.
      var k = setInterval(function () { if (tok !== self.token) { fin(); } else if (!W.speechSynthesis.speaking) { fin(); } }, 250);
      W.speechSynthesis.speak(u);
    });
  };
  Player.prototype.clip = function (a, rate) { // a = [file, start, end]
    var self = this, tok = self.token, au = self.audio, url = GREEK_AUDIO + a[0];
    return new Promise(function (res) {
      var ended = false;
      function fin(ok) { if (ended) return; ended = true; au.removeEventListener('timeupdate', tu); clearInterval(k); try { au.pause(); } catch (e) { } res(ok && tok === self.token); }
      function tu() { if (tok !== self.token) return fin(false); if (au.currentTime >= a[2]) fin(true); }
      var k = setInterval(tu, 40);
      function go() {
        au.playbackRate = rate; au.currentTime = a[1];
        au.addEventListener('timeupdate', tu);
        var p = au.play(); if (p && p.catch) p.catch(function () { fin(false); });
      }
      if (au.src.indexOf(url) === -1 || au.src !== url) {
        au.src = url;
        au.addEventListener('loadedmetadata', function once() { au.removeEventListener('loadedmetadata', once); if (tok === self.token) go(); else fin(false); });
        au.addEventListener('error', function () { fin(false); }, { once: true });
        au.load();
      } else go();
      // safety net if the clip never ends
      setTimeout(function () { fin(true); }, ((a[2] - a[1]) / rate + 25) * 1000);
    });
  };
  Player.prototype.wait = function (ms) {
    var self = this, tok = self.token;
    return new Promise(function (res) { setTimeout(function () { res(tok === self.token); }, ms); });
  };

  // ---------- progress (this browser only) ----------
  var KEY = 'trb-gospels-v1';
  function loadProgress() {
    var p = null;
    try { p = JSON.parse(W.localStorage.getItem(KEY)); } catch (e) { }
    p = p || { seen: {}, total: 0, seconds: 0, since: Date.now() };
    return p;
  }
  function saveProgress(p) { try { W.localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { } }
  function sessionCount(delta) {
    var n = 0;
    try { n = +(W.sessionStorage.getItem(KEY + '-s') || 0) + (delta || 0); W.sessionStorage.setItem(KEY + '-s', n); } catch (e) { n = (W.__trbSess = (W.__trbSess || 0) + (delta || 0)); }
    return n;
  }

  // English with words of Christ in red. ranges = [[start, end], ...] character offsets.
  function renderEnglish(text, ranges) {
    if (!ranges || !ranges.length) return esc(text);
    var h = '', at = 0;
    ranges.forEach(function (r) { h += esc(text.slice(at, r[0])) + '<span class="wj">' + esc(text.slice(r[0], r[1])) + '</span>'; at = r[1]; });
    return h + esc(text.slice(at));
  }
  function refLabel(b, c, v) { return BOOKS[b] + ' ' + c + ':' + v; }
  function latinText(toks) { return toks.map(function (t) { return (t[1] || '') + t[0] + (t[2] || ''); }).join('').trim(); }
  function greekText(toks) { return toks.map(function (t) { return t[0] + (t[1] || ''); }).join('').trim(); }

  W.Gospels = {
    BOOKS: BOOKS, LATIN_BOOKS: LATIN_BOOKS, GREEK_BOOKS: GREEK_BOOKS, getJSON: getJSON, loadLex: loadLex, LEX: LEX,
    renderWords: renderWords, bindWords: bindWords, loadClassics: loadClassics, wordInfo: wordInfo, panelHTML: panelHTML, esc: esc,
    Player: Player, voiceFor: voiceFor, monotonic: monotonic, loadProgress: loadProgress, saveProgress: saveProgress, sessionCount: sessionCount,
    refLabel: refLabel, renderEnglish: renderEnglish, latinText: latinText, greekText: greekText, glossFor: glossFor
  };
})(window, document);
