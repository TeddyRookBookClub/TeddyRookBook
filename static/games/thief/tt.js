/* The Thief of Time: a detective chase through ancient Greece (Koine Greek) or Rome (Latin).
   Data: tt-greece.js and tt-rome.js. Progress is kept in this browser (localStorage). */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tt'); if (!root || !W.TT_DATA) return;
  var DATA = W.TT_DATA;
  var $ = function (s, r) { return (r || root).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---------- saved progress (this browser only) ----------
  var KEY = 'tt-v1', mem = null;
  function load() {
    var s = null; try { s = JSON.parse(W.localStorage.getItem(KEY)); } catch (e) { }
    s = s || mem || {};
    ['greece', 'rome'].forEach(function (k) { s[k] = s[k] || { played: [], solved: 0, failed: 0, words: {} }; });
    if (s.en === undefined) s.en = true;
    return s;
  }
  function save() { mem = store; try { W.localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { } }
  var store = load();

  var V = null, C = null; // current version data, current case
  var RANKS = [[0, 'Recruit'], [2, 'Junior Chronographer'], [5, 'Chronographer'], [10, 'Senior Chronographer'], [16, 'Chief Chronographer'], [24, 'Master of Time']];
  function rank(n) { var r = RANKS[0][1]; RANKS.forEach(function (x) { if (n >= x[0]) r = x[1]; }); return r; }

  // ---------- text helpers ----------
  function yearLabel(y) { return y < 0 ? (-y) + ' BC' : 'AD ' + y; }
  function P(id) { for (var i = 0; i < V.places.length; i++) if (V.places[i].id === id) return V.places[i]; return null; }
  function pron(t, sex) {
    var f = sex === 'f';
    return t.replace(/\{S\}/g, f ? 'She' : 'He').replace(/\{s\}/g, f ? 'she' : 'he').replace(/\{his\}/g, f ? 'her' : 'his').replace(/\{him\}/g, f ? 'her' : 'him');
  }
  // [[word|gloss]] -> tappable word; also records the word as seen in this case
  function rich(t, record) {
    return esc(t).replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, function (m, w, g) {
      if (record && C) addWord(w, g);
      return '<b class="tw ' + V.lang + '" tabindex="0" data-g="' + g + '">' + w + '</b>' + (store.en ? '<span class="tw-g"> (' + g + ')</span>' : '');
    });
  }
  function L(pair, cls) { // target language + optional English
    return '<span class="' + V.lang + ' ' + (cls || '') + '">' + esc(pair[0]) + '</span>' + (store.en && pair[1] ? ' <span class="en">' + esc(pair[1]) + '</span>' : '');
  }
  function addWord(w, g) {
    if (window.TRBWords) window.TRBWords.log('thief', V.lang === 'grc' ? 'g' : 'l', w, g);
    if (C && !C.words.some(function (x) { return x[0] === w; })) C.words.push([w, g]);
    var sv = store[V.key].words; if (!sv[w]) { sv[w] = g; save(); }
  }
  function placeName(p) { return '<span class="' + V.lang + ' pn">' + esc(p.gr) + '</span>' + (p.tr ? ' <span class="tr">' + esc(p.tr) + '</span>' : ''); }

  // ---------- clock ----------
  var START = 8, DEADLINE = 4 * 24 + 18; // Day 1 08:00 to Day 5 18:00
  var GR_NUM = ['αʹ', 'βʹ', 'γʹ', 'δʹ', 'εʹ', 'ϛʹ'], LA_NUM = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  function clockHTML(t) {
    var d = Math.floor(t / 24), h = t % 24;
    var num = V.lang === 'grc' ? GR_NUM[d] : LA_NUM[d];
    return '<span class="ck"><span class="' + V.lang + '">' + V.day[0] + ' ' + num + '</span> · Day ' + (d + 1) + ', ' + (h < 10 ? '0' : '') + h + ':00</span>';
  }
  function advance(h) {
    C.t += h; var note = '';
    var hr = C.t % 24;
    if (hr >= 22 || hr < 7) { C.t += hr >= 22 ? (24 - hr) + 7 : 7 - hr; note = '🌙 You sleep for the night.'; }
    return note;
  }
  function late() { return C.t > DEADLINE; }

  // ---------- starting a case ----------
  function newCase() {
    var sv = store[V.key];
    var left = V.places.filter(function (p) { return sv.played.indexOf(p.id) < 0; });
    var cycled = false;
    if (!left.length) { sv.played = []; save(); left = V.places.slice(); cycled = true; }
    var crime = pick(left);
    var others = shuffle(V.places.filter(function (p) { return p.id !== crime.id; }));
    var thief = pick(V.suspects);
    C = {
      id: crime.id, loot: crime.loot, thief: thief, trail: [crime.id, others[0].id, others[1].id, others[2].id],
      pos: 0, at: crime.id, back: null, t: START, warrant: null, words: [], notes: [], spots: {}, opts: {}, finalVisits: 0,
      traits: shuffle(['hair', 'pet', 'food', 'item']), done: false, cycled: cycled
    };
    C.trail.forEach(function (id, i) { C.opts[i] = travelOptions(i); });
    showBriefing();
  }
  function travelOptions(i) {
    var trail = C.trail, next = trail[i + 1];
    var pool = shuffle(V.places.filter(function (p) { return trail.indexOf(p.id) < 0; })).map(function (p) { return p.id; });
    return shuffle((next ? [next] : []).concat(pool.slice(0, next ? 3 : 3)));
  }
  function spotsFor(pid) {
    if (!C.spots[pid]) {
      var s = shuffle(V.spots.map(function (x, i) { return i; })).slice(0, 3), r = shuffle(V.roles).slice(0, 3);
      C.spots[pid] = { spot: s, role: r, done: [false, false, false], said: [null, null, null], traitAt: Math.floor(Math.random() * 3) };
    }
    return C.spots[pid];
  }

  // ---------- witnesses ----------
  var TRAIT_T = {
    hair: ['{S} had {W} hair. I noticed it right away.', 'Hair? {W}. I’m sure of it.'],
    pet: ['{S} had a {W} with {him}.', 'A {W} followed {him} everywhere.'],
    food: ['{S} asked where to buy some {W}.', '{S} would talk about nothing but {W}.'],
    item: ['{S} was carrying a {W}.', 'I saw a {W} in {his} hands.']
  };
  var WARN = ['Someone just like that is hiding close by. Be careful!', 'I saw a nervous traveler duck around the corner a moment ago.'];
  function traitClue(tr) {
    var v = V.traits[tr].vals[C.thief[tr]];
    return pron(pick(TRAIT_T[tr]), C.thief.sex).replace('{W}', '[[' + v[0] + '|' + v[1] + ']]');
  }
  function interview(k) {
    var here = C.at, sp = spotsFor(here), ti = C.trail.indexOf(here);
    if (sp.done[k]) { renderPanel(); return; }
    var msg = [], cap = false;
    var note = advance(2);
    if (ti < 0 || ti < C.pos) { // wrong place, or an earlier stop the thief has already left
      if (ti < 0) msg.push(pick(V.dunno));
      else msg.push(['The one you are after has already moved on from here.', '']);
    } else if (ti < 3) {
      if (k === sp.traitAt) msg.push({ text: traitClue(C.traits[ti]) });
      else {
        var next = P(C.trail[ti + 1]), used = sp.said.filter(Boolean);
        var cl = shuffle(next.clues).filter(function (c) { return used.indexOf(c) < 0; })[0] || next.clues[0];
        msg.push({ text: pron(cl, C.thief.sex), raw: cl });
      }
    } else { // final stop
      C.finalVisits++;
      if (C.finalVisits >= 3) cap = true;
      else msg.push({ text: pick(WARN) + ' ' + traitClue(C.finalVisits === 1 ? C.traits[3] : C.traits[0]) });
    }
    sp.done[k] = true;
    if (msg[0] && msg[0].raw) sp.said[k] = msg[0].raw;
    if (cap) { return capture(); }
    var role = V.roles.indexOf(sp.role[k]) >= 0 ? sp.role[k] : sp.role[k];
    var html = '<div class="tt-say"><div class="who">' + L(role) + ' · ' + L(V.spots[sp.spot[k]]) + '</div>' +
      '<p class="greet">' + L(pick(V.greet)) + '</p>';
    msg.forEach(function (m) {
      if (m.text) { var r = rich(m.text, true); html += '<p class="clue">“' + r + '”</p>'; C.notes.push({ at: here, html: r }); }
      else html += '<p class="clue">' + (m[1] ? L(m) : esc(m[0])) + '</p>';
    });
    html += '<p class="bye">' + L(V.bye) + '</p>' + (note ? '<p class="note">' + note + '</p>' : '') + '</div>';
    sp.last = sp.last || []; sp.last[k] = html;
    if (late()) return timeUp();
    render(); showTab('investigate', k);
  }

  // ---------- travel ----------
  function optionsHere() {
    var ti = C.trail.indexOf(C.at);
    if (ti < 0) return [C.back];
    if (ti < C.pos) return [C.trail[C.pos]]; // shouldn't normally happen
    return C.opts[ti];
  }
  function travel(id) {
    var from = P(C.at), to = P(id);
    var hrs = 4 + Math.min(4, Math.round(Math.abs(to.year - from.year) / 400));
    var ti = C.trail.indexOf(id);
    if (C.trail.indexOf(C.at) >= 0) C.back = C.at;
    C.at = id;
    if (ti === C.pos + 1) C.pos = ti;
    var note = advance(hrs);
    timeWarp(from, to, hrs, function () {
      if (late()) return timeUp();
      P(id).words.forEach(function (w) { addWord(w[0], w[1]); });
      render(); showTab('investigate'); if (note) toast(note);
    });
  }
  function timeWarp(from, to, hrs, done) {
    var m = modal('<div class="tt-warp"><div class="warp-ring"></div><p class="warp-lbl">Traveling through time…</p><p class="warp-year" id="warp-y">' + yearLabel(from.year) + '</p>' +
      '<p class="warp-to">' + placeName(to) + '<br><span class="en">' + esc(to.en) + ' · ' + esc(to.when) + '</span></p><p class="warp-h">' + hrs + ' hours</p></div>', true);
    var y0 = from.year, y1 = to.year, t0 = null, dur = 1300;
    function step(ts) {
      if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      var y = Math.round(y0 + (y1 - y0) * e); if (y === 0) y = y1 > y0 ? 1 : -1;
      var el = D.getElementById('warp-y'); if (el) el.textContent = yearLabel(y);
      if (k < 1) W.requestAnimationFrame(step); else setTimeout(function () { closeModal(); done(); }, 350);
    }
    W.requestAnimationFrame(step);
    return m;
  }

  // ---------- warrant ----------
  var SEX = { grc: { m: ['ἀνήρ', 'man'], f: ['γυνή', 'woman'] }, lat: { m: ['vir', 'man'], f: ['fēmina', 'woman'] } };
  var filt = { sex: '', hair: '', pet: '', food: '', item: '' };
  function matches() {
    return V.suspects.filter(function (s) { return Object.keys(filt).every(function (k) { return !filt[k] || s[k] === filt[k]; }); });
  }
  function issueWarrant(id) {
    var note = advance(1); C.warrant = id; toast('📜 Warrant issued for ' + V.suspects.filter(function (s) { return s.id === id; })[0].name + '.' + (note ? ' ' + note : ''));
    if (late()) return timeUp();
    render(); showTab('warrant');
  }

  // ---------- endings ----------
  function capture() {
    var thief = C.thief, ok = C.warrant === thief.id, accused = C.warrant && V.suspects.filter(function (s) { return s.id === C.warrant; })[0];
    var h = '<div class="tt-end ' + (ok ? 'win' : 'lose') + '">' + portrait(thief, 96) +
      (ok ? '<h2>' + L(V.caught[thief.sex], 'big') + '</h2><p>You cornered <b>' + esc(thief.name) + '</b> of the Klepsydra gang in ' + esc(P(C.at).en) + ', ' + esc(P(C.at).when) + ', and recovered ' + esc(C.loot) + '.</p>'
        : '<h2>They got away!</h2><p>You found <b>' + esc(thief.name) + '</b> in ' + esc(P(C.at).en) + ', but ' +
          (accused ? 'your warrant named ' + esc(accused.name) + '. By the time you sorted it out, the thief had slipped away.' : 'you had no warrant. The thief simply walked off.') + '</p>');
    finish(ok, h);
  }
  function timeUp() {
    finish(false, '<div class="tt-end lose">' + portrait(C.thief, 96) + '<h2>Time is up!</h2><p>The trail went cold. The thief was <b>' + esc(C.thief.name) + '</b>, last seen in ' + esc(P(C.trail[3]).en) + ', ' + esc(P(C.trail[3]).when) + '.</p>');
  }
  function finish(ok, head) {
    if (C.done) return; C.done = true;
    var sv = store[V.key];
    if (sv.played.indexOf(C.id) < 0) sv.played.push(C.id);
    if (ok) sv.solved++; else sv.failed++;
    save();
    var tl = C.trail.map(P).slice().sort(function (a, b) { return a.year - b.year; });
    var h = head + '<h3>The trail, in time order</h3><ol class="tt-tl">' + tl.map(function (p) {
      return '<li><b>' + esc(p.when) + '</b> · ' + placeName(p) + ' <span class="en">' + esc(p.en) + '</span><br><small>' + rich(pick(p.facts)) + '</small></li>';
    }).join('') + '</ol>' + quizHTML() +
      '<p class="tt-prog">Cases played: <b>' + sv.played.length + ' of ' + V.places.length + '</b> · solved ' + sv.solved + ' · rank: <b>' + rank(sv.solved) + '</b>' +
      (sv.played.length === V.places.length ? '<br>🏆 You have played every case in ' + esc(V.region) + '! The next case starts a new round.' : '') + '</p>' +
      '<div class="tt-row"><button type="button" class="tt-btn big" data-act="next">Next case →</button><button type="button" class="tt-btn" data-act="menu">Choose Greece or Rome</button></div></div>';
    modal(h);
    bindQuiz();
  }
  // quick vocabulary quiz from the words met in this case
  var Q = [];
  function allVocab() {
    var out = [];
    V.places.forEach(function (p) { p.words.forEach(function (w) { out.push(w); }); });
    Object.keys(V.traits).forEach(function (k) { Object.keys(V.traits[k].vals).forEach(function (v) { out.push(V.traits[k].vals[v]); }); });
    return out;
  }
  function quizHTML() {
    var vocab = allVocab(), met = C.words.map(function (w) { return w[0]; });
    var pool = vocab.filter(function (w) { return met.indexOf(w[0]) >= 0; });
    if (pool.length < 4) pool = pool.concat(shuffle(vocab).slice(0, 4 - pool.length));
    Q = shuffle(pool).slice(0, 4).map(function (w) {
      var seen = {}; seen[w[1]] = 1; var wrong = shuffle(vocab).map(function (x) { return x[1]; }).filter(function (g) { if (seen[g]) return false; seen[g] = 1; return true; }).slice(0, 3);
      return { w: w[0], a: w[1], opts: shuffle(wrong.concat([w[1]])), got: null };
    });
    return '<h3>Word check</h3><div class="tt-quiz">' + Q.map(function (q, i) {
      return '<div class="qz" data-q="' + i + '"><p><b class="' + V.lang + '">' + esc(q.w) + '</b> means…</p>' +
        q.opts.map(function (o) { return '<button type="button" class="qo" data-o="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div>';
    }).join('') + '<p class="qscore" id="qscore"></p></div>';
  }
  function bindQuiz() {
    $$('.qz', mroot).forEach(function (box) {
      var q = Q[+box.dataset.q];
      $$('.qo', box).forEach(function (b) {
        b.onclick = function () {
          if (q.got !== null) return;
          q.got = b.dataset.o === q.a;
          $$('.qo', box).forEach(function (x) { x.disabled = true; if (x.dataset.o === q.a) x.classList.add('right'); });
          if (!q.got) b.classList.add('wrong');
          var n = Q.filter(function (x) { return x.got !== null; }).length, r = Q.filter(function (x) { return x.got; }).length;
          if (n === Q.length) D.getElementById('qscore').textContent = ['Keep practicing!', 'A start!', 'Not bad!', 'Very good!', 'Perfect! ⭐'][r] + ' ' + r + ' of ' + Q.length;
        };
      });
    });
  }

  // ---------- portraits ----------
  var HAIR = { blond: '#e2bf55', black: '#2a2522', red: '#b8481e', gray: '#b9b6ae' };
  function portrait(s, size) {
    size = size || 56; var hc = HAIR[s.hair], f = s.sex === 'f';
    return '<svg class="pt" viewBox="0 0 64 64" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<circle cx="32" cy="32" r="31" fill="' + (f ? '#f1e3d3' : '#e3ebe6') + '"/>' +
      (f ? '<path d="M14 34 C12 14 52 14 50 34 L52 56 L12 56 Z" fill="' + hc + '"/>' : '') +
      '<path d="M18 58 C20 46 44 46 46 58 Z" fill="' + (f ? '#7a2338' : '#1d4e89') + '"/>' +
      '<ellipse cx="32" cy="33" rx="12" ry="14" fill="#e8c39e"/>' +
      (f ? '<path d="M20 30 C20 18 44 18 44 30 C40 23 26 23 20 30 Z" fill="' + hc + '"/>'
        : '<path d="M19 30 C18 16 46 16 45 30 C42 24 24 24 19 30 Z" fill="' + hc + '"/><path d="M21 36 C22 50 42 50 43 36 C40 44 24 44 21 36 Z" fill="' + hc + '"/>') +
      '<circle cx="27" cy="32" r="1.6" fill="#222"/><circle cx="37" cy="32" r="1.6" fill="#222"/>' +
      '<path d="M28 40 Q32 42 36 40" stroke="#8a4b3a" stroke-width="1.4" fill="none"/></svg>';
  }

  // ---------- rendering ----------
  function shell() {
    root.innerHTML =
      '<header class="tt-top"><div class="tt-title" id="tt-title"></div><div class="tt-clock" id="tt-clock"></div>' +
      '<div class="tt-tools"><label class="tt-en"><input type="checkbox" id="tt-en"' + (store.en ? ' checked' : '') + '> English</label>' +
      '<button type="button" class="tt-btn sm" id="tt-menu" title="Choose Greece or Rome">⏳ Eras</button><button type="button" class="tt-btn sm" id="tt-help" title="How to play">?</button></div></header>' +
      '<div class="tt-main"><section class="tt-stage" id="tt-stage"></section><aside class="tt-side" id="tt-side"></aside></div>' +
      '<div class="tt-modal" id="tt-modal" hidden><div class="tt-mbox" id="tt-mbox"></div></div><div class="tt-tip" id="tt-tip" hidden></div><div class="tt-toast" id="tt-toast"></div>';
    $('#tt-en').onchange = function (e) { store.en = e.target.checked; save(); if (C && !C.done) { render(); showTab(curTab, curSpot); } if (!mroot.parentNode.hidden && modalFn) modal(modalFn); };
    $('#tt-menu').onclick = function () { menu(); };
    $('#tt-help').onclick = function () { help(); };
    root.addEventListener('click', function (e) {
      var w = e.target.closest('.tw');
      if (w) { showTip(w); return; }
      hideTip();
      var b = e.target.closest('[data-act]'); if (!b) return;
      var a = b.dataset.act;
      if (a === 'ver') { V = DATA[b.dataset.v]; store.ver = V.key; save(); root.dataset.ver = V.key; menu(); }
      if (a === 'start' || a === 'next') { closeModal(); newCase(); }
      if (a === 'menu') menu();
      if (a === 'helpbtn') help();
      if (a === 'go') { closeModal(); render(); showTab('investigate'); }
      if (a === 'close') { closeModal(); }
      if (a === 'tab') showTab(b.dataset.tab);
      if (a === 'ask') interview(+b.dataset.k);
      if (a === 'travel') travel(b.dataset.id);
      if (a === 'warrant') issueWarrant(b.dataset.id);
      if (a === 'clear') { Object.keys(filt).forEach(function (k) { filt[k] = ''; }); showTab('warrant'); }
    });
    root.addEventListener('change', function (e) { if (e.target.dataset.f) { filt[e.target.dataset.f] = e.target.value; showTab('warrant'); } });
    root.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.classList.contains('tw')) showTip(e.target); });
    mroot = $('#tt-mbox');
  }
  var mroot, modalFn = null;
  function modal(html, noClose) {
    modalFn = typeof html === 'function' ? html : null;
    mroot.innerHTML = (typeof html === 'function' ? html() : html); mroot.parentNode.hidden = false; mroot.scrollTop = 0; mroot.parentNode.scrollTop = 0;
    return mroot;
  }
  function closeModal() { mroot.parentNode.hidden = true; modalFn = null; }
  var toastT;
  function toast(t) { var el = $('#tt-toast'); el.textContent = t; el.className = 'tt-toast on'; clearTimeout(toastT); toastT = setTimeout(function () { el.className = 'tt-toast'; }, 2600); }
  function showTip(w) {
    var tip = $('#tt-tip'), r = w.getBoundingClientRect(), rr = root.getBoundingClientRect();
    tip.innerHTML = '<b class="' + V.lang + '">' + esc(w.textContent) + '</b><br>' + esc(w.dataset.g); tip.hidden = false;
    tip.style.left = Math.max(6, Math.min(rr.width - 230, r.left - rr.left)) + 'px'; tip.style.top = (r.bottom - rr.top + 6) + 'px';
  }
  function hideTip() { var t = $('#tt-tip'); if (t) t.hidden = true; }

  function header() {
    $('#tt-title').innerHTML = V ? '<span class="t1">Time Thief</span><span class="en">' + esc(V.region) + '</span>' : '<span class="t1">Time Thief</span>';
    $('#tt-clock').innerHTML = C && !C.done ? clockHTML(C.t).replace('<span class="ck">', '<span class="ck">🕰️ ') + '<small>Deadline: Day 5, 18:00</small>' : '';
  }
  var curTab = 'investigate', curSpot = null;
  function render() {
    header(); if (!C) return;
    var p = P(C.at), ti = C.trail.indexOf(C.at);
    var fact = C.factShown && C.factShown[p.id] || (C.factShown = C.factShown || {}, C.factShown[p.id] = pick(p.facts));
    $('#tt-stage').innerHTML =
      '<div class="tt-place"><span class="ic" aria-hidden="true">' + p.icon + '</span><div><h2>' + placeName(p) + '</h2><p class="sub">' + esc(p.en) + ' · <b>' + esc(p.when) + '</b></p></div></div>' +
      '<p class="tt-scene">' + rich(p.scene) + '</p>' +
      '<div class="tt-fact"><b>💡 Fun fact</b> ' + rich(fact) + '</div>' +
      '<details class="tt-more"><summary>📜 More history here (' + p.facts.length + ')</summary><ul>' + p.facts.map(function (f) { return '<li>' + rich(f) + '</li>'; }).join('') + '</ul>' +
      '<p class="words">Words of this place: ' + p.words.map(function (w) { return '<b class="tw ' + V.lang + '" tabindex="0" data-g="' + esc(w[1]) + '">' + esc(w[0]) + '</b>' + (store.en ? ' <span class="en">' + esc(w[1]) + '</span>' : ''); }).join(' · ') + '</p></details>' +
      '<nav class="tt-tabs" role="tablist">' + [['investigate', '🔎 Investigate'], ['travel', '🧭 Travel'], ['warrant', '📜 Suspects & warrant'], ['notes', '🗒️ Notes']].map(function (t) {
        return '<button type="button" class="tt-tab" data-act="tab" data-tab="' + t[0] + '" role="tab">' + t[1] + '</button>'; }).join('') + '</nav>' +
      '<div class="tt-panel" id="tt-panel"></div>';
    var sv = store[V.key];
    $('#tt-side').innerHTML =
      '<div class="box"><h3>Case file</h3><p><b>Stolen:</b> ' + esc(C.loot) + '</p><p><b>From:</b> ' + esc(P(C.id).en) + ', ' + esc(P(C.id).when) + '</p>' +
      '<p><b>Suspect:</b> a ' + (C.thief.sex === 'f' ? 'woman' : 'man') + ' of the Klepsydra gang</p>' +
      '<p><b>Warrant:</b> ' + (C.warrant ? esc(V.suspects.filter(function (s) { return s.id === C.warrant; })[0].name) : '<i>none yet</i>') + '</p>' +
      '<p class="stops">Stops found: ' + (C.pos + 1) + ' of 4</p></div>' +
      '<div class="box"><h3>Words this case <small>(' + C.words.length + ')</small></h3><ul class="tt-words">' +
      (C.words.slice().reverse().map(function (w) { return '<li><b class="' + V.lang + '">' + esc(w[0]) + '</b> <span>' + esc(w[1]) + '</span></li>'; }).join('') || '<li class="muted">Tap any colored word to see what it means.</li>') + '</ul></div>' +
      '<div class="box small"><b>' + rank(sv.solved) + '</b><br>Cases played ' + sv.played.length + ' of ' + V.places.length + ' · solved ' + sv.solved + '<br>Words collected: ' + Object.keys(sv.words).length + '</div>';
  }
  function showTab(tab, spot) {
    curTab = tab; curSpot = spot;
    $$('.tt-tab').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === tab); b.setAttribute('aria-selected', b.dataset.tab === tab); });
    var el = $('#tt-panel'); if (!el) return;
    var h = '';
    if (tab === 'investigate') {
      var sp = spotsFor(C.at);
      h = '<p class="hint">Question people around town. Each question takes 2 hours.</p><div class="tt-spots">' + [0, 1, 2].map(function (k) {
        return '<button type="button" class="tt-spot' + (sp.done[k] ? ' done' : '') + '" data-act="ask" data-k="' + k + '">' +
          '<span class="' + V.lang + ' s1">' + esc(V.spots[sp.spot[k]][0]) + '</span><span class="en">' + esc(V.spots[sp.spot[k]][1]) + '</span>' +
          '<small>' + (sp.done[k] ? '✓ asked' : 'ask the ' + esc(sp.role[k][1])) + '</small></button>';
      }).join('') + '</div>';
      if (spot != null && sp.last && sp.last[spot]) h += sp.last[spot];
      else if (sp.last) { var lastK = [2, 1, 0].filter(function (k) { return sp.last[k]; })[0]; if (lastK != null) h += sp.last[lastK]; }
    } else if (tab === 'travel') {
      var opts = optionsHere(), here = P(C.at);
      h = '<p class="hint">Where in time did the thief go? Travel takes 4 to 8 hours, longer across more centuries.</p><div class="tt-dests">' + opts.map(function (id) {
        var p = P(id), hrs = 4 + Math.min(4, Math.round(Math.abs(p.year - here.year) / 400));
        return '<button type="button" class="tt-dest" data-act="travel" data-id="' + id + '"><span class="ic">' + p.icon + '</span><span class="dn">' + placeName(p) + '<br><span class="en">' + esc(p.en) + '</span></span><span class="dy">' + esc(p.when) + '<small>' + hrs + ' h</small></span></button>';
      }).join('') + '</div>';
    } else if (tab === 'warrant') {
      var m = matches();
      h = '<p class="hint">Pick what the witnesses told you. When only one suspect matches, you can ask for a warrant (1 hour). You can only arrest the thief with the right warrant.</p><div class="tt-filters">' +
        '<label>Sex<select data-f="sex"><option value="">?</option>' + ['m', 'f'].map(function (k) { return '<option value="' + k + '"' + (filt.sex === k ? ' selected' : '') + '>' + SEX[V.lang][k][0] + ' · ' + SEX[V.lang][k][1] + '</option>'; }).join('') + '</select></label>' +
        Object.keys(V.traits).map(function (k) {
          var T = V.traits[k];
          return '<label><span><span class="' + V.lang + '">' + esc(T.label[0]) + '</span> · ' + esc(T.label[1]) + '</span><select data-f="' + k + '"><option value="">?</option>' + Object.keys(T.vals).map(function (v) {
            return '<option value="' + v + '"' + (filt[k] === v ? ' selected' : '') + '>' + esc(T.vals[v][0]) + ' · ' + esc(T.vals[v][1]) + '</option>'; }).join('') + '</select></label>';
        }).join('') + '<button type="button" class="tt-btn sm" data-act="clear">Clear</button></div>' +
        (m.length === 1 ? '<div class="tt-row"><button type="button" class="tt-btn big" data-act="warrant" data-id="' + m[0].id + '"' + (C.warrant === m[0].id ? ' disabled' : '') + '>' + (C.warrant === m[0].id ? '✓ Warrant issued for ' : '📜 Issue a warrant for ') + esc(m[0].name) + '</button></div>' : '<p class="hint"><b>' + m.length + '</b> suspects match.</p>') +
        '<div class="tt-susp">' + V.suspects.map(function (s) {
          var on = m.indexOf(s) >= 0;
          return '<div class="sc' + (on ? '' : ' out') + (C.warrant === s.id ? ' w' : '') + '">' + portrait(s) + '<div><b>' + esc(s.name) + '</b><small>' + esc(s.bio) + '</small><ul>' +
            Object.keys(V.traits).map(function (k) { var v = V.traits[k].vals[s[k]]; return '<li><span class="' + V.lang + '">' + esc(v[0]) + '</span> <span class="en">' + esc(v[1]) + '</span></li>'; }).join('') + '</ul></div></div>';
        }).join('') + '</div>';
    } else if (tab === 'notes') {
      h = C.notes.length ? '<ol class="tt-notes">' + C.notes.map(function (n) { return '<li><b>' + esc(P(n.at).en) + ' (' + esc(P(n.at).when) + '):</b> ' + n.html + '</li>'; }).join('') + '</ol>' : '<p class="hint">Nothing yet. Clues you hear are saved here.</p>';
    }
    el.innerHTML = h;
  }

  // ---------- screens ----------
  function menu() {
    C = C && !C.done ? C : null;
    header();
    modal(function () {
      return '<div class="tt-menu"><h2>Time Thief</h2><p class="lead">The <b>Klepsydra</b> gang is stealing treasures from across history. Named after the Greek water clock, [[κλεψύδρα|water clock (literally “water-thief”)]], they slip from century to century. Follow the clues, learn the language, and bring them to justice.</p>'.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '<b class="grc">$1</b> <span class="en">($2)</span>') +
        '<div class="tt-vers">' + ['greece', 'rome'].map(function (k) {
          var d = DATA[k], sv = store[k];
          return '<button type="button" class="tt-ver v-' + k + (V && V.key === k ? ' sel' : '') + '" data-act="ver" data-v="' + k + '"><b>' + esc(d.region) + '</b><small>Learn ' + esc(d.langName) + ' · ' + d.places.length + ' cases<br>Played ' + sv.played.length + ' · solved ' + sv.solved + ' · ' + rank(sv.solved) + '</small></button>';
        }).join('') + '</div>' +
        (V ? '<div class="tt-row"><button type="button" class="tt-btn big" data-act="start">' + (C ? 'Abandon this case and take a new one' : 'Take a case in ' + esc(V.region) + ' →') + '</button>' + (C ? '<button type="button" class="tt-btn" data-act="close">Back to my case</button>' : '') + '</div>' : '<p class="hint">Choose an era to begin.</p>') +
        '<p class="small">Cases come in random order and none repeats until you have played them all. Progress is saved only in this browser. <button type="button" class="linkish" data-act="helpbtn">How to play</button></p></div>';
    });
  }
  function showBriefing() {
    var p = P(C.id);
    p.words.forEach(function (w) { addWord(w[0], w[1]); });
    header();
    modal('<div class="tt-brief"><p class="stamp">🚨 Case ' + (store[V.key].played.length + 1) + ' of ' + V.places.length + (C.cycled ? ' · new round' : '') + '</p>' +
      '<h2>' + p.icon + ' Stolen from ' + esc(p.en) + ', ' + esc(p.when) + '</h2>' +
      '<p class="lead">' + esc(C.loot.charAt(0).toUpperCase() + C.loot.slice(1)) + ' has vanished!</p>' +
      '<p>A member of the Klepsydra gang was seen leaving: a <b>' + (C.thief.sex === 'f' ? 'woman' : 'man') + '</b>, <span class="' + V.lang + '">' + SEX[V.lang][C.thief.sex][0] + '</span>. Question witnesses, follow the trail through time, and get a warrant before you make the arrest.</p>' +
      '<p>You have until <b>Day 5, 18:00</b>. It is now Day 1, 08:00.</p>' +
      '<div class="tt-row"><button type="button" class="tt-btn big" data-act="go">Start investigating →</button></div></div>');
  }
  function help() {
    var back = C && !C.done;
    modal('<div class="tt-help"><h2>How to play</h2><ol>' +
      '<li><b>Take a case.</b> Something has been stolen from a moment in ' + (V ? esc(V.region) : 'history') + '. The briefing tells you whether the thief is a man or a woman.</li>' +
      '<li><b>🔎 Investigate.</b> Question people at three places around town (2 hours each). Two will tell you where in time the thief is heading. One will describe the thief.</li>' +
      '<li><b>🧭 Travel.</b> Pick the place and year that match the clues. The wrong choice costs time: witnesses there have seen nothing, and you will need to go back.</li>' +
      '<li><b>📜 Suspects &amp; warrant.</b> Use the descriptions (hair, animal, food, something carried) to narrow eight suspects down to one, then issue a warrant.</li>' +
      '<li><b>The fourth stop</b> is the hideout. Witnesses there will warn you the thief is near. Keep asking and you will find them. Without the right warrant, they escape.</li>' +
      '<li><b>Beat the clock.</b> You have until Day 5 at 18:00. At night you sleep (22:00 to 07:00).</li>' +
      '<li><b>Learn as you go.</b> Colored words are ' + (V ? esc(V.langName) : 'Greek or Latin') + '. Tap one to see its meaning. Words you meet are kept in your list, and each case ends with a quick word check.</li></ol>' +
      '<h3>About the history</h3><p>Every place, date and fun fact is real history or clearly marked legend, with ancient sources named where it matters. The thieves, their gang and the stolen items (in a few cases) are made up. Dates before about 500 BC are approximate.</p>' +
      '<p class="small">Greek: Koine and classical forms, with accents. Latin: long vowels are marked with macrons (ā, ē, ī, ō, ū) to help pronunciation.</p>' +
      '<div class="tt-row"><button type="button" class="tt-btn big" data-act="' + (back ? 'close' : 'menu') + '">' + (back ? 'Back to the case' : 'OK') + '</button></div></div>');
  }

  shell();
  V = DATA[store.ver] || null; if (V) root.dataset.ver = V.key;
  header(); menu();
  W.__tt = { get C() { return C; }, get store() { return store; }, get V() { return V; }, travel: travel, interview: interview, issueWarrant: issueWarrant, newCase: newCase, setVer: function (k) { V = DATA[k]; root.dataset.ver = k; } };
})(window, document);
