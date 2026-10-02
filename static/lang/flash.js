/* Flashcards: Gospel vocabulary (Greek + Latin), real word forms, three-sided Greek–Latin–English prisms,
   spaced repetition (a simplified SM-2) saved in this browser. Data: /lang/data/flash.json (built from the
   Nestle 1904 Greek NT / MACULA and the PROIEL Vulgate; see SOURCES.md). */
(function (W, D) {
  'use strict';
  var G = W.Gospels, $ = function (s, r) { return (r || D).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var root = $('#fc'); if (!root || !G) return;
  var esc = G.esc;

  // ---------- labels ----------
  var LBL = {
    g: {
      t: { p: 'present', i: 'imperfect', f: 'future', a: 'aorist', r: 'perfect', l: 'pluperfect' },
      m: { i: 'indicative', s: 'subjunctive', o: 'optative', m: 'imperative', n: 'infinitive', p: 'participle' },
      v: { a: 'active', m: 'middle', p: 'passive', e: 'middle/passive', d: 'middle (deponent)', o: 'passive (deponent)', n: 'middle/passive (deponent)' },
      c: { n: 'nominative', g: 'genitive', d: 'dative', a: 'accusative', v: 'vocative' }
    },
    l: {
      t: { p: 'present', i: 'imperfect', f: 'future', r: 'perfect', l: 'pluperfect', t: 'future perfect' },
      m: { i: 'indicative', s: 'subjunctive', m: 'imperative', n: 'infinitive', p: 'participle', d: 'gerund', g: 'gerundive', u: 'supine' },
      v: { a: 'active', p: 'passive' },
      c: { n: 'nominative', g: 'genitive', d: 'dative', a: 'accusative', b: 'ablative', v: 'vocative', l: 'locative' }
    }
  };
  var NUM = { s: 'singular', p: 'plural', d: 'dual' }, GEN = { m: 'masculine', f: 'feminine', n: 'neuter' }, PERS = { 1: '1st', 2: '2nd', 3: '3rd' };
  var KIND = { noun: 'Nouns', adj: 'Adjectives', pron: 'Pronouns', art: 'Article', num: 'Numbers', verb: 'Verbs' };
  var LANGNAME = { g: 'Greek', l: 'Latin', e: 'English' };
  function parseAttrs(s) { var a = {}; s.split(' ').forEach(function (kv) { var p = kv.split('='); a[p[0]] = p[1]; }); return a; }
  function describe(lang, a) { // "aorist active indicative · 3rd person singular" / "genitive singular masculine"
    var L = LBL[lang], out = [];
    if (a.p === 'verb') {
      var tvm = [L.t[a.t], L.v[a.v], L.m[a.m]].filter(Boolean).join(' ');
      out.push(tvm);
      if (a.pe) out.push(PERS[a.pe] + ' person ' + (NUM[a.n] || ''));
      else if (a.c) out.push([L.c[a.c], NUM[a.n], GEN[a.g]].filter(Boolean).join(' '));
      return out.join(' · ');
    }
    return [L.c[a.c], NUM[a.n], GEN[a.g]].filter(Boolean).join(' ');
  }
  var BOOK = { MAT: 'Matthew', MRK: 'Mark', LUK: 'Luke', JHN: 'John' };
  function refLabel(r) { var p = r.split(' '); return (BOOK[p[0]] || p[0]) + ' ' + p[1]; }
  function snipHTML(s) { return esc(s).replace(/\[(.+?)\]/, '<mark>$1</mark>'); }
  function posGroup(lang, p) { // lexicon part of speech -> filter group
    if (lang === 'g') { if (p === 'noun') return 'noun'; if (p === 'verb') return 'verb'; if (p === 'adj' || p === 'num') return 'adj'; if (p === 'pron' || p === 'det') return 'pron'; return 'other'; }
    var c = p[0]; if (c === 'N') return 'noun'; if (c === 'V') return 'verb'; if (c === 'A' || c === 'M') return 'adj'; if (c === 'P') return 'pron'; return 'other';
  }
  function posName(lang, p) {
    var g = posGroup(lang, p); return { noun: 'noun', verb: 'verb', adj: (lang === 'l' && p[0] === 'M') || p === 'num' ? 'number' : 'adjective', pron: lang === 'g' && p === 'det' ? 'article' : 'pronoun' }[g] ||
      (lang === 'g' ? { prep: 'preposition', conj: 'conjunction', adv: 'adverb', ptcl: 'particle', intj: 'interjection', num: 'number' }[p] || p :
        { R: 'preposition', C: 'conjunction', G: 'conjunction', D: 'adverb', I: 'interjection' }[p[0]] || p);
  }

  // ---------- storage ----------
  var KEY = 'trb-flash-v1', st;
  try { st = JSON.parse(W.localStorage.getItem(KEY)); } catch (e) { }
  st = st || {};
  st.cards = st.cards || {}; st.prefs = st.prefs || {}; st.day = st.day || {};
  var P = st.prefs, DEF = { lang: 'g', type: 'v', range: '100', pos: 'all', order: 'shuffle', nw: '20', dir: 't', faces: ['g', 'l', 'e'], f: {} };
  for (var k in DEF) if (P[k] == null) P[k] = DEF[k];
  if (!P.v2) { P.v2 = 1; P.order = 'shuffle'; }            // shuffle became the default
  if (['50', '100', '250', '500', '1000', '2500', 'all'].indexOf(String(P.range)) < 0) P.range = '100';
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function dayStats() { if (st.day.d !== today()) st.day = { d: today(), nw: 0, rv: 0 }; return st.day; }

  // ---------- spaced repetition (simplified SM-2) ----------
  var MIN = 60e3, DAY = 864e5;
  function sched(c, q, now) { // returns a new state; c may be undefined (new card)
    c = c ? JSON.parse(JSON.stringify(c)) : { r: 0, e: 2.5, i: 0, l: 0 };
    if (q === 1) { c.l++; c.r = 0; c.e = Math.max(1.3, c.e - 0.2); c.i = 0; c.d = now + MIN; }
    else {
      if (c.r === 0) c.i = q === 2 ? 0.5 : q === 3 ? 1 : 4;
      else if (c.r === 1 && q === 3) c.i = Math.max(3, c.i * 2);
      else c.i = Math.max(c.i + 1, c.i * (q === 2 ? 1.2 : q === 3 ? c.e : c.e * 1.3));
      if (q === 2) c.e = Math.max(1.3, c.e - 0.15);
      if (q === 4) c.e += 0.15;
      c.r++; c.d = now + c.i * DAY;
    }
    c.s = now; return c;
  }
  function ivlText(c) {
    if (!c || c.i === 0) return '< 1 min';
    var d = c.i; if (d < 1) return Math.round(d * 24) + ' h';
    if (d < 30) return Math.round(d) + ' d'; if (d < 365) return Math.round(d / 30) + ' mo'; return (d / 365).toFixed(1) + ' y';
  }

  // ---------- data & decks ----------
  var data = null, deck = [], queue = [], cur = null, shown = 0, faces = [], seenThisSession = {};
  function lemOf(lang, i) { return data[lang].lem[i]; }
  // vocabulary cards
  function vocabCards(lang, n, pos) {
    var out = [];
    data[lang].lem.slice(0, n).forEach(function (e, i) {
      if (!e[1] || (pos !== 'all' && posGroup(lang, e[2]) !== pos)) return;
      out.push({ id: 'v:' + lang + ':' + e[0], k: 'v', lang: lang, i: i, rank: i, alpha: e[0] });
    });
    return out;
  }
  function bothCards(n, pos) {
    var out = [];
    data.g.lem.slice(0, n).forEach(function (e, i) {
      if (e[4] < 0) return; if (pos !== 'all' && posGroup('g', e[2]) !== pos) return;
      out.push({ id: 'b:' + e[0], k: 'b', lang: 'g', i: i, li: e[4], rank: i, alpha: e[0] });
    });
    return out;
  }
  function formPass(a, F) {
    var kinds = F.kind || [], kind = a.p;
    if (kinds.length && kinds.indexOf(kind) < 0) return false;
    for (var g in F) {
      if (g === 'kind' || !F[g] || !F[g].length) continue;
      if (a[g] == null || F[g].indexOf(a[g]) < 0) return false; // e.g. a tense filter leaves out nouns
    }
    return true;
  }
  function formCards(lang, n, pos, mode) {
    var F = P.f[lang] || {}, by = {}, out = [];
    data[lang].forms.forEach(function (f) {
      if (f[0] >= n) return;
      var lem = lemOf(lang, f[0]); if (pos !== 'all' && posGroup(lang, lem[2]) !== pos) return;
      var a = parseAttrs(f[2]); if (!formPass(a, F)) return;
      // forms that differ only in accent or case (ζητεῖτε / ζητεῖτέ) are one card
      var key = mode === 'f' ? f[0] + '|' + f[1].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : f[0] + '|' + f[2];
      if (!by[key]) { by[key] = { id: mode + ':' + lang + ':' + lem[0] + '|' + (mode === 'f' ? f[1] : f[2]), k: mode, lang: lang, i: f[0], rank: f[0] + 1 / (1 + f[3]), alpha: mode === 'f' ? f[1] : lem[0], items: [] }; out.push(by[key]); }
      by[key].items.push({ form: f[1], a: a, attrs: f[2], n: f[3], ref: f[4], snip: f[5] });
    });
    return out;
  }
  function buildDeck() {
    var n = P.range === 'all' ? 1e9 : +P.range, langs = P.lang === 'b' ? ['g', 'l'] : [P.lang];
    if (P.type === 'v') deck = P.lang === 'b' ? bothCards(n, P.pos) : vocabCards(P.lang, n, P.pos);
    else { deck = []; langs.forEach(function (l) { deck = deck.concat(formCards(l, n, P.pos, P.type)); }); }
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function ordered(list) {
    var o = list.slice();
    if (P.order === 'shuffle') return shuffle(o);
    if (P.order === 'alpha') return o.sort(function (a, b) { return a.alpha.localeCompare(b.alpha, P.lang === 'l' ? 'la' : 'el'); });
    if (P.order === 'rare') return o.sort(function (a, b) { return b.rank - a.rank; });
    o.sort(function (a, b) { return a.rank - b.rank; });
    if (P.type !== 'v' && P.order === 'srs') { // interleave forms of different words so one word doesn't run in a row
      var groups = {}, keys = []; o.forEach(function (c) { var g = c.lang + c.i; if (!groups[g]) { groups[g] = []; keys.push(g); } groups[g].push(c); });
      var out = [], more = true; while (more) { more = false; keys.forEach(function (g) { var x = groups[g].shift(); if (x) { out.push(x); more = true; } }); }
      return out;
    }
    return o;
  }
  // keep cards of the same word at least a few cards apart where the deck allows it
  function spread(list) {
    if (P.type === 'v' || P.order === 'alpha') return list;
    var rest = list.slice(), out = [], GAP = 4;
    while (rest.length) {
      var pick = -1, lim = Math.min(rest.length, 60);
      for (var i = 0; i < lim && pick < 0; i++) {
        var ok = true, w = rest[i].lang + rest[i].i;
        for (var j = out.length - 1; j >= 0 && j >= out.length - GAP; j--) if (out[j].lang + out[j].i === w) { ok = false; break; }
        if (ok) pick = i;
      }
      out.push(rest.splice(pick < 0 ? 0 : pick, 1)[0]);
    }
    return out;
  }
  function buildQueue() {
    var now = Date.now();
    if (P.order === 'srs') {
      var due = deck.filter(function (c) { var s = st.cards[c.id]; return s && s.d <= now; }).sort(function (a, b) { return st.cards[a.id].d - st.cards[b.id].d; });
      var left = Math.max(0, +P.nw - dayStats().nw);
      var fresh = ordered(deck.filter(function (c) { return !st.cards[c.id]; })).slice(0, left);
      queue = spread(due.concat(fresh));
    } else queue = spread(ordered(deck));
  }
  function counts() {
    var now = Date.now(), due = 0, nw = 0, learned = 0, mature = 0;
    deck.forEach(function (c) { var s = st.cards[c.id]; if (!s) nw++; else { if (s.d <= now) due++; if (s.r > 0) learned++; if (s.i >= 21) mature++; } });
    return { due: due, nw: nw, learned: learned, mature: mature, total: deck.length };
  }

  // ---------- rendering ----------
  function cardFaces(c) { // returns array of {lab, html, lang}
    if (c.k === 'b') {
      var g = lemOf('g', c.i), l = lemOf('l', c.li);
      var f = { g: { lab: 'ΕΛΛ', lang: 'g', html: '<div class="fc-word grc">' + esc(g[0]) + '</div><div class="fc-sub">' + esc(posName('g', g[2])) + '</div>' },
        l: { lab: 'LAT', lang: 'l', html: '<div class="fc-word lat">' + esc(l[0]) + '</div><div class="fc-sub">' + esc(posName('l', l[2])) + '</div>' },
        e: { lab: 'EN', lang: 'e', html: '<div class="fc-word en">' + esc(g[1]) + '</div><div class="fc-sub">#' + (c.i + 1) + ' in the Gospels · ' + g[3] + '× in Greek</div>' } };
      return P.faces.map(function (k) { return f[k]; });
    }
    var lang = c.lang, e = lemOf(lang, c.i), cls = lang === 'g' ? 'grc' : 'lat', lab = lang === 'g' ? 'ΕΛΛ' : 'LAT';
    var freq = '#' + (c.i + 1) + ' · ' + e[3] + '× in the Gospels';
    if (c.k === 'v') {
      var t = { lab: lab, lang: lang, html: '<div class="fc-word ' + cls + '">' + esc(e[0]) + '</div><div class="fc-sub">' + esc(posName(lang, e[2])) + '</div>' };
      var en = { lab: 'EN', lang: 'e', html: '<div class="fc-word en">' + esc(e[1]) + '</div><div class="fc-sub">' + esc(posName(lang, e[2])) + ' · ' + freq + '</div>' };
      var back = { lab: 'EN', lang: lang, html: '<div class="fc-word ' + cls + ' sm">' + esc(e[0]) + '</div><div class="fc-ans en">' + esc(e[1]) + '</div><div class="fc-sub">' + esc(posName(lang, e[2])) + ' · ' + freq + '</div>' };
      var backT = { lab: lab, lang: lang, html: '<div class="fc-word en sm">' + esc(e[1]) + '</div><div class="fc-ans ' + cls + '">' + esc(e[0]) + '</div><div class="fc-sub">' + esc(posName(lang, e[2])) + ' · ' + freq + '</div>' };
      var dir = P.dir === 'x' ? (hash(c.id) % 2 ? 'e' : 't') : P.dir;
      return dir === 'e' ? [en, backT] : [t, back];
    }
    var it = c.items[0], parses = uniq(c.items.map(function (x) { return describe(lang, x.a); }));
    var ex = c.items.slice().sort(function (a, b) { return b.n - a.n; })[0];
    var exHTML = '<div class="fc-ex"><span class="' + cls + '">' + snipHTML(ex.snip) + '</span> <small>' + esc(refLabel(ex.ref)) + '</small></div>';
    if (c.k === 'f') {
      return [{ lab: lab, lang: lang, html: '<div class="fc-q">What form is this?</div><div class="fc-word ' + cls + '">' + esc(it.form) + '</div><div class="fc-sub">from the Gospels · ' + c.items.reduce(function (s, x) { return s + x.n; }, 0) + '×</div>' },
        { lab: lab, lang: lang, html: '<div class="fc-word ' + cls + ' sm">' + esc(it.form) + '</div><div class="fc-ans">' + parses.map(esc).join('<br><span class="fc-or">or</span> ') + '</div>' +
          '<div class="fc-lemma">from <b class="' + cls + '">' + esc(e[0]) + '</b> “' + esc(e[1]) + '”</div>' + exHTML }];
    }
    var forms = uniq(c.items.map(function (x) { return x.form; }));
    return [{ lab: lab, lang: lang, html: '<div class="fc-q">Build the form</div><div class="fc-word ' + cls + ' sm">' + esc(e[0]) + '</div><div class="fc-sub">“' + esc(e[1]) + '”</div><div class="fc-ask">' + esc(parses[0]) + '</div>' },
      { lab: lab, lang: lang, html: '<div class="fc-ask sm">' + esc(e[0]) + ' · ' + esc(parses[0]) + '</div><div class="fc-word ' + cls + '">' + forms.map(esc).join(' <span class="fc-or">or</span> ') + '</div>' + exHTML }];
  }
  // Greek written in Latin letters (standard scholarly transliteration), with the accent kept to show the stress.
  var TR = { 'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'ē', 'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'φ': 'ph', 'χ': 'ch', 'ψ': 'ps', 'ω': 'ō' };
  function translit(s) {
    return s.split(/(\s+)/).map(function (w) {
      var d = w.normalize('NFD'), out = '', prev = '', rough = d.indexOf('̔') >= 0, cap = /^[Α-Ω]/.test(d), started = false;
      for (var i = 0; i < d.length; i++) {
        var ch = d[i], lc = ch.toLowerCase(), r = TR[lc];
        if (r == null) {
          if (ch === '́' || ch === '̀' || ch === '͂') out += '́';       // any accent -> stress mark
          else if (ch === '̈') out += '̈';
          else if (ch === 'ͅ') out += 'i';                                             // iota subscript
          else if (ch === '̓' || ch === '̔') { }                                   // breathings handled below
          else if (ch === '’' || ch === '᾽' || ch === 'ʼ') out += '’';
          else out += ch;
          continue;
        }
        if (lc === 'γ' && /[γκξχ]/.test((d[i + 1] || '').toLowerCase())) r = 'n';
        if (lc === 'υ' && /[αεοη]/.test(prev) && d[i + 1] !== '̈') r = 'u';
        if (lc === 'υ' && /^[\u0300-\u036f]*ι(?![\u0300-\u036f]*\u0308)/.test(d.slice(i + 1).toLowerCase())) r = 'u';
        if (!started) { started = true; if (rough) r = lc === 'ρ' ? 'rh' : 'h' + r; }
        out += r; prev = lc;
      }
      out = out.normalize('NFC');
      return cap ? out.charAt(0).toUpperCase() + out.slice(1) : out;
    }).join('');
  }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

  function render() {
    var stage = $('#fc-stage'), grade = $('#fc-grade'), flip = $('#fc-flip');
    updateBar();
    if (!cur) {
      var c = counts();
      stage.innerHTML = '<div class="fc-done"><div class="fc-word">' + (deck.length ? '🌿' : '—') + '</div><p>' +
        (!deck.length ? 'No cards match these settings. Widen the range or turn some filters off.' :
          P.order === 'srs' ? (c.nw && dayStats().nw >= +P.nw ? 'All caught up for today. You’ve met your ' + P.nw + ' new cards; raise the daily limit or come back tomorrow.' : 'All caught up! Nothing is due right now.') :
            'You’ve been through every card in this set.') + '</p>' +
        (deck.length ? '<button type="button" class="cbtn" id="fc-again">Go through them again</button>' : '') + '</div>';
      grade.hidden = true; flip.hidden = true;
      var ag = $('#fc-again'); if (ag) ag.onclick = function () { var o = P.order; if (o === 'srs') P.order = 'freq'; buildQueue(); P.order = o; next(); };
      return;
    }
    faces = cardFaces(cur); shown = 0;
    var n = faces.length, prism = cur.k === 'b';
    var h = '<div class="fc-card ' + (prism ? 'prism' : 'flip') + '" id="fc-card" style="--n:' + n + '">';
    faces.forEach(function (f, i) {
      h += '<div class="fc-face fc-f' + i + ' face-' + f.lang + '"><span class="fc-tag t-' + f.lang + '">' + f.lab + '</span>' + f.html +
        (prism ? '<span class="fc-dots">' + faces.map(function (_, j) { return '<i' + (j === i ? ' class="on"' : '') + '></i>'; }).join('') + '</span>' : '') + '</div>';
    });
    stage.innerHTML = h + '</div>';
    $$('.fc-face .fc-word.grc, .fc-face .fc-ans.grc', stage).forEach(function (el) { var d = D.createElement('div'); d.className = 'fc-tr'; d.textContent = translit(el.textContent); d.title = 'The Greek in Latin letters. The accent mark shows the stressed syllable; ē and ō are long e and o.'; el.parentNode.insertBefore(d, el.nextSibling); });
    flip.hidden = false; grade.hidden = true; flip.textContent = prism ? 'Turn ↻' : 'Show answer';
    setTurn();
    var s = st.cards[cur.id], now = Date.now();
    $$('.g', grade).forEach(function (b) { b.querySelector('small').textContent = ivlText(sched(s, +b.dataset.q, now)); });
  }
  function setTurn() {
    var card = $('#fc-card'); if (!card) return;
    card.style.setProperty('--k', shown);
    card.classList.toggle('turned', shown > 0);
    $$('.fc-face', card).forEach(function (f, i) { f.classList.toggle('front', i === shown % faces.length); });
  }
  function turn() {
    if (!cur) return;
    shown++; setTurn();
    if (shown >= faces.length - 1) { $('#fc-grade').hidden = false; $('#fc-flip').hidden = cur.k !== 'b'; }
    if (cur.k === 'b') $('#fc-flip').textContent = 'Turn ↻';
  }
  function updateBar() {
    var c = counts(), done = Object.keys(seenThisSession).length;
    $('#fc-pos-lbl').textContent = cur ? (done + 1) + ' of ' + (done + queue.length + 1) : done ? done + ' studied' : '';
    $('#fc-prog').style.width = (done + queue.length + (cur ? 1 : 0) ? Math.round(100 * done / (done + queue.length + (cur ? 1 : 0))) : 0) + '%';
    $('#fc-due').textContent = c.due + ' due · ' + c.nw + ' new';
    var d = dayStats(); $('#fc-today').textContent = 'Today: ' + d.rv + ' reviewed, ' + d.nw + ' new';
    $('#fc-count').textContent = c.total + ' card' + (c.total === 1 ? '' : 's') + ' in this set · ' + c.learned + ' learned · ' + c.mature + ' known well (3+ weeks)';
    $('#fc-nums').innerHTML = '<div><b>' + c.total + '</b>cards in this set</div><div><b>' + c.learned + '</b>learned</div><div><b>' + c.mature + '</b>known well</div><div><b>' + c.due + '</b>due now</div><div><b>' + Object.keys(st.cards).length + '</b>cards studied (all sets)</div>';
  }
  function next() { cur = queue.shift() || null; render(); }
  function grade(q) {
    if (!cur || $('#fc-grade').hidden) return;
    var now = Date.now(), d = dayStats(), was = st.cards[cur.id];
    if (!was) d.nw++;
    d.rv++;
    st.cards[cur.id] = sched(was, q, now); seenThisSession[cur.id] = 1; save();
    if (q === 1) queue.splice(Math.min(queue.length, 3 + Math.floor(Math.random() * 3)), 0, cur);
    next();
  }

  // ---------- save the card as a picture ----------
  function drawPicture(mode, withForms) {
    var dark = D.documentElement.dataset.theme === 'dark';
    var gi = cur.k === 'b' ? cur.i : (cur.lang === 'g' ? cur.i : null), li = cur.k === 'b' ? cur.li : (cur.lang === 'l' ? cur.i : null);
    var gr = mode !== 'l' && gi != null ? lemOf('g', gi) : null, la = mode !== 'g' && li != null ? lemOf('l', li) : null;
    var main = gr || la, mainLang = gr ? 'g' : 'l';
    function formsOf(lang, i) { return withForms ? data[lang].forms.filter(function (f) { return f[0] === i; }).sort(function (a, b) { return b[3] - a[3]; }).slice(0, 14) : []; }
    if (gr && la) return drawBoth(gr, la, gi, li, formsOf('g', gi), formsOf('l', li), dark);
    var secs = [];
    if (gr) { var fg = formsOf('g', gi); if (fg.length) secs.push(['g', fg, 'Greek forms found in the Gospels']); }
    if (la) { var fl = formsOf('l', li); if (fl.length) secs.push(['l', fl, 'Latin forms found in the Gospels']); }
    if (secs.length === 1) secs[0][2] = 'Forms found in the Gospels';
    var Wd = 1200, pad = 70, H = 150 + (gr ? 175 : 0) + (la ? (gr ? 110 : 130) : 0) + 100 + (gr && la ? 100 : 60) + 10;
    secs.forEach(function (s) { H += 100 + Math.ceil(s[1].length / 2) * 50; });
    H += 70;
    var cv = D.createElement('canvas'); cv.width = Wd; cv.height = H; var c = cv.getContext('2d');
    var bg = dark ? '#26332c' : '#f3ead2', ink = dark ? '#eef3ef' : '#1d2320', mut = dark ? '#a9b8af' : '#5d6862', gold = '#b8963e', wine = dark ? '#e9a0b1' : '#7a2338', grn = dark ? '#6cc79a' : '#004C2A';
    c.fillStyle = bg; c.fillRect(0, 0, Wd, H); c.fillStyle = grn; c.fillRect(0, 0, Wd, 14);
    var SER = '"Gentium Book Plus", Georgia, serif', SAN = 'system-ui, -apple-system, "Segoe UI", sans-serif', y = 80;
    function line(txt, font, col, dy) { c.font = font; c.fillStyle = col; c.textAlign = 'center'; c.fillText(txt, Wd / 2, y); y += dy; }
    function fit(txt, size, fam) { do { c.font = size + 'px ' + fam; size -= 4; } while (c.measureText(txt).width > Wd - 2 * pad && size > 24); return c.font; }
    line((gr ? 'KOINE GREEK · ' : '') + (la ? 'LATIN · ' : '') + 'ENGLISH', '600 22px ' + SAN, gold, 100);
    if (gr) { line(gr[0], fit(gr[0], 110, SER), ink, 62); line(translit(gr[0]), 'italic 40px Georgia, serif', mut, gr && la ? 95 : 80); }
    if (la) line(la[0], fit(la[0], gr ? 84 : 110, SER), gr ? wine : ink, gr ? 85 : 90);
    line(main[1], fit(main[1], 56, 'Georgia, serif'), grn, 62);
    function freq(l, i, e, tag) { return (tag ? tag + ': ' : '') + '#' + (i + 1) + ' most common in the Gospels · ' + e[3] + ' times'; }
    if (gr && la) { line(posName('g', gr[2]) + ' · ' + freq('g', gi, gr, 'Greek'), '24px ' + SAN, mut, 38); line(freq('l', li, la, 'Latin'), '24px ' + SAN, mut, 50); }
    else line(posName(mainLang, main[2]) + ' · ' + freq(mainLang, gr ? gi : li, main), '26px ' + SAN, mut, 50);
    secs.forEach(function (s) {
      var lang = s[0], forms = s[1];
      c.strokeStyle = gold; c.lineWidth = 2; c.beginPath(); c.moveTo(pad, y); c.lineTo(Wd - pad, y); c.stroke(); y += 46;
      line(s[2], '600 24px ' + SAN, mut, 44);
      var y0 = y, half = Math.ceil(forms.length / 2);
      forms.forEach(function (f, i) {
        var x = i < half ? pad : Wd / 2 + 20, yy = y0 + (i % half) * 50;
        c.textAlign = 'left'; c.font = '34px ' + SER; c.fillStyle = lang === 'l' && gr ? wine : ink; c.fillText(f[1], x, yy);
        var w = c.measureText(f[1]).width, d = describe(lang, parseAttrs(f[2])).replace(' person ', ' ').replace(/ · /g, ', '), max = Wd / 2 - pad - w - 34, sz = 19;
        c.fillStyle = mut; c.font = sz + 'px ' + SAN;
        while (c.measureText(d).width > max && sz > 13) { sz--; c.font = sz + 'px ' + SAN; }
        if (c.measureText(d).width > max) { while (c.measureText(d + '…').width > max && d.length > 8) d = d.slice(0, -1); d += '…'; }
        c.fillText(d, x + w + 14, yy - 3);
      });
      y = y0 + half * 50 + 10;
    });
    c.textAlign = 'center'; c.font = '600 22px ' + SAN; c.fillStyle = mut; c.fillText('teddyrookbook.com', Wd / 2, H - 30);
    function slug(e, l) { return l === 'g' ? translit(e[0]).normalize('NFD').replace(/[^a-z]/gi, '') : e[0]; }
    return { url: cv.toDataURL('image/png'), name: 'flashcard-' + (gr ? slug(gr, 'g') : '') + (gr && la ? '-' : '') + (la ? slug(la, 'l') : '') + '.png' };
  }
  function drawBoth(gr, la, gi, li, fg, fl, dark) {
    var Wd = 1800, pad = 70, mid = Wd / 2, colW = mid - pad - 40, rows = Math.max(fg.length, fl.length);
    var H = 250 + 330 + (rows ? 70 + rows * 50 : 0) + 80;
    var cv = D.createElement('canvas'); cv.width = Wd; cv.height = H; var c = cv.getContext('2d');
    var bg = dark ? '#26332c' : '#f3ead2', ink = dark ? '#eef3ef' : '#1d2320', mut = dark ? '#a9b8af' : '#5d6862', gold = '#b8963e', wine = dark ? '#e9a0b1' : '#7a2338', grn = dark ? '#6cc79a' : '#004C2A';
    var SER = '"Gentium Book Plus", Georgia, serif', SAN = 'system-ui, -apple-system, "Segoe UI", sans-serif';
    c.fillStyle = bg; c.fillRect(0, 0, Wd, H); c.fillStyle = grn; c.fillRect(0, 0, Wd, 14);
    function fit(txt, size, fam, max) { do { c.font = size + 'px ' + fam; size -= 4; } while (c.measureText(txt).width > max && size > 24); }
    c.textAlign = 'center';
    c.font = '600 22px ' + SAN; c.fillStyle = gold; c.fillText('ENGLISH', mid, 70);
    fit(gr[1], 64, 'Georgia, serif', Wd - 2 * pad); c.fillStyle = grn; c.fillText(gr[1], mid, 140);
    c.font = '26px ' + SAN; c.fillStyle = mut; c.fillText(posName('g', gr[2]), mid, 185);
    c.strokeStyle = gold; c.lineWidth = 2;
    c.beginPath(); c.moveTo(pad, 215); c.lineTo(Wd - pad, 215); c.stroke();
    c.beginPath(); c.moveTo(mid, 240); c.lineTo(mid, H - 80); c.stroke();
    function col(cx, x0, label, e, idx, lang, colr, forms) {
      c.textAlign = 'center';
      c.font = '700 26px ' + SAN; c.fillStyle = gold; c.fillText(label, cx, 280);
      fit(e[0], 104, SER, colW); c.fillStyle = colr; c.fillText(e[0], cx, 395);
      if (lang === 'g') { c.font = 'italic 38px Georgia, serif'; c.fillStyle = mut; c.fillText(translit(e[0]), cx, 450); }
      c.font = '24px ' + SAN; c.fillStyle = mut; c.fillText('#' + (idx + 1) + ' most common in the Gospels · ' + e[3] + ' times', cx, 505);
      if (!rows) return;
      c.font = '600 24px ' + SAN; c.fillText(forms.length ? 'Forms found in the Gospels' : 'This word does not change form', cx, 580);
      forms.forEach(function (f, i) {
        var yy = 650 + i * 50; c.textAlign = 'left'; c.font = '34px ' + SER; c.fillStyle = colr; c.fillText(f[1], x0, yy);
        var w = c.measureText(f[1]).width, d = describe(lang, parseAttrs(f[2])).replace(' person ', ' ').replace(/ · /g, ', '), max = colW - w - 20, sz = 21;
        c.fillStyle = mut; c.font = sz + 'px ' + SAN;
        while (c.measureText(d).width > max && sz > 14) { sz--; c.font = sz + 'px ' + SAN; }
        c.fillText(d, x0 + w + 16, yy - 3);
      });
    }
    col(pad + colW / 2, pad, 'KOINE GREEK', gr, gi, 'g', ink, fg);
    col(mid + 40 + colW / 2, mid + 40, 'LATIN', la, li, 'l', wine, fl);
    c.textAlign = 'center'; c.font = '600 22px ' + SAN; c.fillStyle = mut; c.fillText('teddyrookbook.com', mid, H - 30);
    var sl = translit(gr[0]).normalize('NFD').replace(/[^a-z]/gi, '');
    return { url: cv.toDataURL('image/png'), name: 'flashcard-' + sl + '-' + la[0] + '.png' };
  }
  function savePicture() {
    if (!cur) return;
    var box = $('#fc-prev');
    if (!box) {
      box = D.createElement('div'); box.id = 'fc-prev'; box.className = 'fc-prev';
      box.innerHTML = '<div class="fc-prev-in" role="dialog" aria-label="Picture preview"><div class="fc-prev-opts"><span id="fc-prev-langs">Show: <label><input type="radio" name="fc-prev-l" value="b" checked> Greek + Latin</label> <label><input type="radio" name="fc-prev-l" value="g"> Greek only</label> <label><input type="radio" name="fc-prev-l" value="l"> Latin only</label></span> <label><input type="checkbox" id="fc-prev-forms"> include forms</label></div><img alt="Preview of the flashcard picture"><p>This is exactly the picture you’ll get: a PNG image made in your browser, nothing else.</p><div class="fc-prev-btns"><button type="button" class="cbtn play" id="fc-prev-share" hidden>📲 Save to Photos / Share</button><a class="cbtn play" id="fc-prev-dl">⬇ Download picture</a><button type="button" class="cbtn" id="fc-prev-x">Close</button></div></div>';
      D.body.appendChild(box);
      box.addEventListener('click', function (e) { if (e.target === box || e.target.id === 'fc-prev-x') box.hidden = true; });
      $('#fc-prev-share').onclick = function () {
        var dl = $('#fc-prev-dl');
        fetch(dl.href).then(function (r) { return r.blob(); }).then(function (b) {
          var f = new File([b], dl.download, { type: 'image/png' });
          return navigator.share({ files: [f] });
        }).catch(function (e) { if (e && e.name !== 'AbortError') dl.click(); });
      };
      try {
        var touch = matchMedia('(pointer: coarse)').matches;
        if (touch && navigator.canShare && navigator.canShare({ files: [new File([new Blob(['x'], { type: 'image/png' })], 'x.png', { type: 'image/png' })] })) {
          $('#fc-prev-share').hidden = false; $('#fc-prev-dl').className = 'cbtn'; $('#fc-prev-dl').textContent = '⬇ Download file';
          box.querySelector('p').textContent = 'This is exactly the picture you’ll get. Tap “Save to Photos / Share”, then “Save Image” to put it in your photos.';
        }
      } catch (e) {}
      box.addEventListener('change', function (e) { if (e.target.id === 'fc-prev-forms') $('#fc-pic-forms').checked = e.target.checked; refreshPicture(); });
      D.addEventListener('keydown', function (e) { if (e.key === 'Escape') box.hidden = true; });
    }
    $('#fc-prev-langs').hidden = cur.k !== 'b';
    $('#fc-prev-forms').checked = $('#fc-pic-forms').checked;
    refreshPicture(); box.hidden = false;
  }
  function refreshPicture() {
    var box = $('#fc-prev'), mode = cur.k === 'b' ? box.querySelector('input[name="fc-prev-l"]:checked').value : cur.lang;
    var r = drawPicture(mode, $('#fc-prev-forms').checked);
    box.querySelector('img').src = r.url;
    var dl = $('#fc-prev-dl'); dl.href = r.url; dl.download = r.name;
  }

  // ---------- audio ----------
  var player = new G.Player();
  function say() {
    if (!cur) return;
    var f = faces[shown % faces.length], lang = f.lang === 'e' ? (cur.k === 'b' ? 'g' : cur.lang) : f.lang;
    var text;
    if (cur.k === 'b') text = lang === 'l' ? lemOf('l', cur.li)[0] : lemOf('g', cur.i)[0];
    else if (cur.k === 'v' || cur.k === 'm') text = cur.k === 'm' && shown ? cur.items[0].form : lemOf(cur.lang, cur.i)[0];
    else text = cur.items[0].form;
    player.stop(); player.speak(text, lang === 'g' ? 'g' : 'l', 0.9);
  }

  // ---------- setup UI ----------
  function filterChoices(lang) {
    var L = LBL[lang], A = { kind: {}, t: {}, m: {}, v: {}, pe: { 1: '1st', 2: '2nd', 3: '3rd' }, c: {}, n: { s: 'singular', p: 'plural' } };
    var kinds = lang === 'g' ? ['verb', 'noun', 'adj', 'pron', 'art'] : ['verb', 'noun', 'adj', 'pron', 'num'];
    kinds.forEach(function (k) { A.kind[k] = KIND[k]; });
    ['t', 'm', 'v', 'c'].forEach(function (g) { for (var x in L[g]) A[g][x] = L[g][x]; });
    if (lang === 'g') { delete A.v.o; delete A.v.d; delete A.v.n; A.v.d = 'deponent'; }
    if (lang === 'l') delete A.c.l;
    return A;
  }
  function buildFormFilters() {
    var wrap = $('#fc-forms'), langs = P.lang === 'b' ? ['g', 'l'] : [P.lang];
    wrap.hidden = P.type === 'v';
    if (P.type === 'v') return;
    $$('.fc-fgroup', wrap).forEach(function (grp) {
      var g = grp.dataset.g; $$('.chips', grp).forEach(function (x) { x.remove(); });
      langs.forEach(function (lang) {
        var A = filterChoices(lang), F = P.f[lang] = P.f[lang] || {}, sel = F[g] || [];
        var box = D.createElement('span'); box.className = 'chips';
        if (langs.length > 1) box.innerHTML = '<em>' + LANGNAME[lang] + '</em>';
        Object.keys(A[g]).forEach(function (v) {
          var b = D.createElement('button'); b.type = 'button'; b.className = 'chip' + (sel.indexOf(v) >= 0 ? ' on' : ''); b.textContent = A[g][v];
          b.onclick = function () {
            var arr = F[g] = F[g] || [], i = arr.indexOf(v);
            if (g === 'v' && lang === 'g' && v === 'd') { ['d', 'o', 'n'].forEach(function (x) { var j = arr.indexOf(x); if (i >= 0) { if (j >= 0) arr.splice(j, 1); } else if (j < 0) arr.push(x); }); }
            else if (i >= 0) arr.splice(i, 1); else arr.push(v);
            b.classList.toggle('on'); save(); restart();
          };
          box.appendChild(b);
        });
        grp.appendChild(box);
      });
    });
  }
  function buildFaces() {
    var wrap = $('#fc-faces-wrap'), list = $('#fc-faces');
    wrap.hidden = !(P.lang === 'b' && P.type === 'v');
    $('#fc-dir-wrap').hidden = !(P.type === 'v' && P.lang !== 'b');
    list.innerHTML = P.faces.map(function (k, i) {
      return '<li class="lo-item lo-' + (k === 'e' ? 'en' : k) + '"><span class="lo-n">' + (i + 1) + '</span><span class="lo-name">' + LANGNAME[k] + '</span>' +
        '<span class="lo-move"><button type="button" data-mv="-1" data-k="' + k + '" ' + (i === 0 ? 'disabled' : '') + ' aria-label="Earlier">▲</button><button type="button" data-mv="1" data-k="' + k + '" ' + (i === 2 ? 'disabled' : '') + ' aria-label="Later">▼</button></span></li>';
    }).join('');
    $$('button', list).forEach(function (b) {
      b.onclick = function () { var i = P.faces.indexOf(b.dataset.k), j = i + (+b.dataset.mv), t = P.faces[i]; P.faces[i] = P.faces[j]; P.faces[j] = t; save(); buildFaces(); if (cur) render(); };
    });
  }
  function syncSetup() {
    $$('.seg').forEach(function (s) { $$('button', s).forEach(function (b) { b.classList.toggle('on', P[s.dataset.pref] === b.dataset.v); b.setAttribute('aria-pressed', P[s.dataset.pref] === b.dataset.v); }); });
    $('#fc-range').value = P.range; $('#fc-pos').value = P.pos; $('#fc-order').value = P.order; $('#fc-new').value = P.nw; $('#fc-dir').value = P.dir;
    $('#fc-new-wrap').hidden = P.order !== 'srs';
    buildFaces(); buildFormFilters();
  }
  function restart() { buildDeck(); buildQueue(); seenThisSession = {}; syncSetup(); next(); }
  $$('.seg').forEach(function (s) {
    $$('button', s).forEach(function (b) { b.type = 'button'; b.onclick = function () { P[s.dataset.pref] = b.dataset.v; save(); restart(); }; });
  });
  [['#fc-range', 'range'], ['#fc-pos', 'pos'], ['#fc-order', 'order'], ['#fc-new', 'nw'], ['#fc-dir', 'dir']].forEach(function (x) {
    $(x[0]).addEventListener('change', function () { P[x[1]] = this.value; save(); restart(); });
  });
  $('#fc-flip').onclick = turn;
  $('#fc-stage').addEventListener('click', function (e) { if (e.target.closest('button')) return; if (cur && (cur.k === 'b' || $('#fc-grade').hidden)) turn(); });
  $$('#fc-grade .g').forEach(function (b) { b.onclick = function () { grade(+b.dataset.q); }; });
  $('#fc-say').onclick = say;
  $('#fc-pic').onclick = function () { (D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve()).then(savePicture); };
  $('#fc-skip').onclick = function () { if (cur) { queue.push(cur); next(); } };
  $('#fc-reset').onclick = function () {
    if (W.confirm && !W.confirm('Forget your progress on the ' + deck.length + ' cards in this set?')) return;
    deck.forEach(function (c) { delete st.cards[c.id]; }); save(); restart();
  };
  D.addEventListener('keydown', function (e) {
    if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === ' ' || e.key === 'Enter') { if (e.target.tagName === 'BUTTON' && e.target.id !== 'fc-flip') return; e.preventDefault(); turn(); }
    else if (/^[1-4]$/.test(e.key)) grade(+e.key);
    else if (e.key === 'p' || e.key === 'P') say();
  });

  // ---------- load ----------
  function load(retry) {
    $('#fc-stage').innerHTML = '<p class="fc-msg" id="fc-msg">Loading the cards…</p>';
    var slow = setTimeout(function () { var m = $('#fc-msg'); if (m) m.innerHTML = 'Still loading… a slow connection can take a while. <button type="button" class="cbtn" id="fc-retry">Try again</button>'; var r = $('#fc-retry'); if (r) r.onclick = function () { load(true); }; }, 15000);
    G.getJSON('flash.json', retry).then(function (d) { clearTimeout(slow); data = d; restart(); }).catch(function (e) {
      clearTimeout(slow);
      $('#fc-stage').innerHTML = '<p class="fc-msg err"><b>The cards didn’t download.</b> (' + esc(e.message) + ')<br><button type="button" class="cbtn play" id="fc-retry">Try again</button></p>';
      $('#fc-retry').onclick = function () { load(true); };
    });
  }
  syncSetup();
  load();
  W.__fcStarted = true;
})(window, document);
