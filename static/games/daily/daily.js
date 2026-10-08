/* Daily Word Puzzle: guess today's five-letter Latin or Greek word in six tries.
   Everyone gets the same word on the same day. Saved under localStorage 'trb-daily-v1'. */
(function (W, D) {
  'use strict';
  var KEY = 'trb-daily-v1', EPOCH = Date.UTC(2026, 9, 8), TRIES = 6, LEN = 5;
  var root = D.getElementById('daily'); if (!root) return;
  var LANGS = {
    l: { name: 'Latin', rows: ['QERTYUIOP', 'ASDFGHKL', 'ZXCVBNM'], cls: 'la' },
    g: { name: 'Greek', rows: ['ΕΡΤΥΘΙΟΠ', 'ΑΣΔΦΓΗΞΚΛ', 'ΖΧΨΩΒΝΜ'], cls: 'gr' }
  };
  /* A Greek keyboard on a Latin layout: the usual Greek typing positions. */
  var GKEY = { a: 'α', b: 'β', g: 'γ', d: 'δ', e: 'ε', z: 'ζ', h: 'η', u: 'θ', i: 'ι', k: 'κ', l: 'λ', m: 'μ', n: 'ν', j: 'ξ', o: 'ο', p: 'π', r: 'ρ', s: 'σ', w: 'σ', t: 'τ', y: 'υ', f: 'φ', x: 'χ', c: 'ψ', v: 'ω' };
  var data, okSet = {}, lang, st, cur = '', busy = false;

  function today() { var t = new Date(); return Math.floor((Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) - EPOCH) / 864e5) + 1; }
  function strip(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function norm(s, lg) { s = strip(s); return lg === 'g' ? s.replace(/ς/g, 'σ') : s.replace(/j/g, 'i').replace(/v/g, 'u'); }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function order(n, seed) { var a = [], r = rng(seed), i, j, x; for (i = 0; i < n; i++) a.push(i); for (i = n - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function answer(lg, day) { var A = data[lg].ans, n = A.length, cycle = Math.floor((day - 1) / n), o = order(n, (lg === 'g' ? 7919 : 104729) + cycle * 31); return A[o[((day - 1) % n + n) % n]]; }

  function load() { var d; try { d = JSON.parse(W.localStorage.getItem(KEY)); } catch (e) { } d = d && typeof d === 'object' ? d : {}; d.played = d.played || 0; d.won = d.won || 0; d.streak = d.streak || 0; d.max = d.max || 0; d.dist = d.dist || [0, 0, 0, 0, 0, 0]; d.games = d.games || {}; return d; }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function game() { var k = lang + today(); return st.games[k] || (st.games[k] = { g: [], done: 0 }); }
  function prune() { var t = today(); Object.keys(st.games).forEach(function (k) { if (+k.slice(1) < t - 40) delete st.games[k]; }); }

  function score(guess, ans) {
    var res = [0, 0, 0, 0, 0], left = {}, i;
    for (i = 0; i < LEN; i++) { if (guess[i] === ans[i]) res[i] = 2; else left[ans[i]] = (left[ans[i]] || 0) + 1; }
    for (i = 0; i < LEN; i++) if (res[i] !== 2 && left[guess[i]]) { res[i] = 1; left[guess[i]]--; }
    return res;
  }
  function show(ch) { return lang === 'g' ? ch.toUpperCase() : ch.toUpperCase(); }

  function build() {
    root.innerHTML =
      '<div class="dw-top"><h1>Daily Word Puzzle</h1>' +
      '<div class="dw-langs" role="group" aria-label="Language"><button class="bg-btn" data-l="l">Latin</button><button class="bg-btn" data-l="g">Greek</button></div>' +
      '<button class="bg-btn" id="dw-bank-b" aria-pressed="false">Word bank</button><button class="bg-btn" id="dw-help-b" aria-expanded="false">How to play</button></div>' +
      '<div class="dw-help" id="dw-help" hidden><p>Guess today’s five-letter word in six tries. Each guess must be a real word form. After each guess the tiles change colour:</p>' +
      '<p><span class="dw-mini s2">A</span> right letter, right place &nbsp; <span class="dw-mini s1">A</span> in the word, wrong place &nbsp; <span class="dw-mini s0">A</span> not in the word</p>' +
      '<p>Accents and breathings are ignored: you only guess the letters. In Latin, U and V count as one letter, as they did for the Romans, and so do I and J. In Greek, Σ and ς are one letter. Type Greek with a Greek keyboard, the buttons below, or Latin keys in the usual Greek layout (a = α, u = θ, j = ξ, c = ψ, v = ω, w = ς).</p>' +
      '<p>The answers are common words: Latin nouns and adjectives from classical authors, and Greek words found in the New Testament (Koine). Guesses may be any five-letter form found in the Perseus and PROIEL treebanks. Everyone gets the same word each day, with a new Latin and a new Greek word at midnight.</p><p>Stuck? The <b>Word bank</b> lists every possible answer with its meaning, and crosses out the ones your tiles have ruled out.</p></div>' +
      '<div class="dw-msg" id="dw-msg" role="status" aria-live="polite"></div>' +
      '<div class="dw-grid" id="dw-grid" aria-label="Guesses"></div>' +
      '<div class="dw-end" id="dw-end" hidden></div>' +
      '<div class="dw-kb" id="dw-kb"></div>' +
      '<div class="dw-bank" id="dw-bank" hidden></div>' +
      '<div class="dw-stats bg-small" id="dw-stats"></div>';
    root.querySelectorAll('[data-l]').forEach(function (b) { b.onclick = function () { setLang(b.getAttribute('data-l')); }; });
    var bb = D.getElementById('dw-bank-b'); bb.onclick = function () { bankOn = !bankOn; try { W.localStorage.setItem('trb-daily-bank', bankOn ? '1' : ''); } catch (e) { } bank(); };
    var hb = D.getElementById('dw-help-b'); hb.onclick = function () { var h = D.getElementById('dw-help'); h.hidden = !h.hidden; hb.setAttribute('aria-expanded', String(!h.hidden)); };
  }

  function setLang(lg) {
    lang = lg; cur = ''; try { W.localStorage.setItem('trb-daily-lang', lg); } catch (e) { }
    root.querySelectorAll('[data-l]').forEach(function (b) { var on = b.getAttribute('data-l') === lg; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    root.classList.toggle('is-g', lg === 'g');
    var kb = D.getElementById('dw-kb'), L = LANGS[lg];
    kb.innerHTML = L.rows.map(function (r, i) {
      return '<div class="dw-row">' + (i === 2 ? '<button class="dw-k wide" data-k="enter">Enter</button>' : '') +
        r.split('').map(function (c) { return '<button class="dw-k ' + L.cls + '" data-k="' + c.toLowerCase() + '">' + c + '</button>'; }).join('') +
        (i === 2 ? '<button class="dw-k wide" data-k="back" aria-label="Delete">⌫</button>' : '') + '</div>';
    }).join('');
    kb.querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () { key(b.getAttribute('data-k')); b.blur(); }; });
    msg(''); render();
  }

  function msg(t, keep) { var m = D.getElementById('dw-msg'); m.innerHTML = t; clearTimeout(msg.t); if (t && !keep) msg.t = setTimeout(function () { m.innerHTML = ''; }, 2200); }

  function render() {
    var g = game(), ans = norm(answer(lang, today())[0], lang), grid = D.getElementById('dw-grid'), h = '', r, i, keys = {};
    for (r = 0; r < TRIES; r++) {
      var word = g.g[r], sc = word ? score(norm(word, lang), ans) : null, typing = !word && r === g.g.length && !g.done;
      h += '<div class="dw-line' + (typing ? ' cur' : '') + '">';
      for (i = 0; i < LEN; i++) {
        var ch = word ? word[i] : typing ? cur[i] || '' : '';
        h += '<span class="dw-t' + (sc ? ' s' + sc[i] : ch ? ' full' : '') + (word && r === g.g.length - 1 && render.flip ? ' flip' : '') + '" style="--d:' + (i * 90) + 'ms">' + (ch ? show(ch) : '') + '</span>';
        if (sc) { var nk = norm(word[i], lang); keys[nk] = Math.max(keys[nk] == null ? -1 : keys[nk], sc[i]); }
      }
      h += '</div>';
    }
    render.flip = false;
    grid.innerHTML = h;
    grid.setAttribute('aria-label', 'Guesses: ' + (g.g.length ? g.g.map(function (w) { return w.toUpperCase(); }).join(', ') : 'none yet'));
    D.querySelectorAll('#dw-kb [data-k]').forEach(function (b) {
      var k = b.getAttribute('data-k'), n = lang === 'l' ? norm(k, 'l') : k, s = keys[n];
      b.classList.remove('s0', 's1', 's2'); if (s != null) b.classList.add('s' + s);
    });
    D.getElementById('dw-kb').hidden = !!g.done;
    bank();
    end(); stats();
  }

  // The word bank: every word that can be an answer in this language, with its meaning. Words that no longer fit
  // the coloured tiles are crossed out; tap a word to type it in.
  var bankOn = false; try { bankOn = !!W.localStorage.getItem('trb-daily-bank'); } catch (e) { }
  function bank() {
    var el = D.getElementById('dw-bank'), b = D.getElementById('dw-bank-b'); if (!el || !data) return;
    b.classList.toggle('on', bankOn); b.setAttribute('aria-pressed', String(bankOn)); el.hidden = !bankOn; if (!bankOn) return;
    var g = game(), ans = norm(answer(lang, today())[0], lang), L = LANGS[lang];
    var res = g.g.map(function (w) { var n = norm(w, lang); return [n, score(n, ans).join('')]; });
    var list = data[lang].ans.slice().sort(function (a, b) { return norm(a[0], lang) < norm(b[0], lang) ? -1 : 1; });
    var fit = 0;
    var h = list.map(function (a) { var n = norm(a[0], lang), ok = res.every(function (r) { return score(r[0], n).join('') === r[1]; }); if (ok) fit++; return '<button class="dw-bw' + (ok ? '' : ' out') + '" data-w="' + (lang === 'g' ? n : strip(a[0])) + '"' + (ok ? '' : ' aria-label="' + a[0] + ', ruled out"') + '><b class="' + L.cls + '" lang="' + (lang === 'g' ? 'grc' : 'la') + '">' + a[0] + '</b><small>' + a[1] + '</small></button>'; }).join('');
    el.innerHTML = '<p class="bg-small">Every possible answer in ' + L.name + ' (' + list.length + ' words). ' + (res.length ? fit + ' still fit your tiles; the rest are crossed out. ' : '') + (g.done ? '' : 'Tap a word to type it in.') + '</p><div class="dw-bws">' + h + '</div>';
    el.querySelectorAll('.dw-bw').forEach(function (bt) { bt.onclick = function () { if (game().done) return; cur = bt.getAttribute('data-w'); render(); }; });
  }

  function key(k) {
    var g = game(); if (g.done || busy) return;
    if (k === 'enter') return submit();
    if (k === 'back') { cur = cur.slice(0, -1); return render(); }
    if (cur.length < LEN) { cur += k; render(); }
  }

  function submit() {
    var g = game(), n = norm(cur, lang);
    if (cur.length < LEN) { msg('Not enough letters'); shake(); return; }
    if (!okSet[lang][n]) { msg('Not in the word list'); shake(); return; }
    var ans = answer(lang, today()), a = norm(ans[0], lang);
    g.g.push(cur); cur = ''; render.flip = !W.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var won = n === a;
    if (won || g.g.length >= TRIES) {
      g.done = won ? 1 : 2; st.played++;
      if (won) {
        st.won++; st.dist[g.g.length - 1]++;
        var t = today(); if (st.sd !== t) { st.streak = st.sd === t - 1 ? st.streak + 1 : 1; st.sd = t; st.max = Math.max(st.max, st.streak); }
      }
      if (W.TRBWords) W.TRBWords.log('daily', lang, ans[0], ans[1]);
    }
    save(); render();
    if (won) msg(['Superb!', 'Magnificent!', 'Excellent!', 'Well done!', 'Good!', 'Phew!'][g.g.length - 1], true);
  }

  function shake() { var l = D.querySelector('.dw-line.cur'); if (!l) return; l.classList.remove('shake'); void l.offsetWidth; l.classList.add('shake'); }

  function shareText() {
    var g = game(), ans = norm(answer(lang, today())[0], lang);
    return 'Teddy Rook Book · Daily ' + LANGS[lang].name + ' Word #' + today() + ' ' + (g.done === 1 ? g.g.length : 'X') + '/6\n' +
      g.g.map(function (w) { return score(norm(w, lang), ans).map(function (s) { return ['⬜', '🟨', '🟩'][s]; }).join(''); }).join('\n') + '\n' + location.origin + '/games/daily/';
  }

  function end() {
    var g = game(), box = D.getElementById('dw-end'); if (!g.done) { box.hidden = true; return; }
    var a = answer(lang, today()), other = lang === 'l' ? 'g' : 'l', og = st.games[other + today()];
    box.hidden = false;
    box.innerHTML = '<p>' + (g.done === 1 ? 'Solved in ' + g.g.length + (g.g.length === 1 ? ' try' : ' tries') + '.' : 'Not this time. The word was') + '</p>' +
      '<p class="dw-ans ' + LANGS[lang].cls + '" lang="' + (lang === 'g' ? 'grc' : 'la') + '">' + a[0] + '</p><p class="dw-eng">“' + a[1] + '”</p>' +
      '<p class="dw-btns"><button class="bg-btn pri" id="dw-share">Share result</button>' +
      (og && og.done ? '' : '<button class="bg-btn" id="dw-other">Try today’s ' + LANGS[other].name + ' word</button>') +
      '<a class="bg-btn" href="/languages/flashcards/?lang=' + lang + '&src=games:daily">Study it in the flashcards</a></p>' +
      '<p class="bg-small" id="dw-next"></p>';
    D.getElementById('dw-share').onclick = share;
    var ob = D.getElementById('dw-other'); if (ob) ob.onclick = function () { setLang(other); };
    tick();
  }
  function tick() {
    var el = D.getElementById('dw-next'); if (!el) return;
    var t = new Date(), m = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1), s = Math.max(0, Math.floor((m - t) / 1000));
    el.textContent = 'Next words in ' + Math.floor(s / 3600) + 'h ' + ('0' + Math.floor(s % 3600 / 60)).slice(-2) + 'm.';
  }
  function share() {
    var t = shareText();
    if (navigator.share && /Mobi|Android|iPhone|iPad/.test(navigator.userAgent)) { navigator.share({ text: t }).catch(function () { }); return; }
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { msg('Result copied: paste it anywhere.'); }, function () { W.prompt('Copy your result:', t); });
  }
  function stats() {
    var el = D.getElementById('dw-stats'), mx = Math.max.apply(null, st.dist.concat(1));
    el.innerHTML = '<span>Played <b>' + st.played + '</b></span><span>Solved <b>' + (st.played ? Math.round(100 * st.won / st.played) : 0) + '%</b></span><span>Streak <b>' + st.streak + '</b></span><span>Best <b>' + st.max + '</b></span>' +
      (st.won ? '<div class="dw-dist" aria-label="Guess distribution">' + st.dist.map(function (n, i) { return '<div><i>' + (i + 1) + '</i><b style="width:' + Math.max(8, 100 * n / mx) + '%">' + n + '</b></div>'; }).join('') + '</div>' : '');
  }

  D.addEventListener('keydown', function (e) {
    if (!lang || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (D.querySelector('.trb-search:not([hidden])')) return;
    var k = e.key;
    if (k === 'Enter') { if (t && t.tagName === 'BUTTON' && !t.classList.contains('dw-k')) return; e.preventDefault(); key('enter'); return; }
    if (k === 'Backspace') { e.preventDefault(); key('back'); return; }
    if (k.length !== 1) return;
    var c = strip(k);
    if (lang === 'g') { if (GKEY[c]) c = GKEY[c]; if (c === 'ς') c = 'σ'; if (!/^[α-ω]$/.test(c)) return; }
    else { if (!/^[a-z]$/.test(c) || c === 'w') return; }
    e.preventDefault(); key(c);
  });

  build();
  fetch(root.getAttribute('data-src')).then(function (r) { return r.json(); }).then(function (d) {
    data = d;
    ['l', 'g'].forEach(function (lg) { var s = d[lg].ok, o = okSet[lg] = {}; for (var i = 0; i < s.length; i += LEN) o[s.substr(i, LEN)] = 1; d[lg].ans.forEach(function (a) { o[norm(a[0], lg)] = 1; }); });
    st = load(); prune();
    var q = (location.search.match(/[?&]lang=([lg])/) || [])[1], saved; try { saved = W.localStorage.getItem('trb-daily-lang'); } catch (e) { }
    setLang(q || saved || 'l');
    var shown = today(); setInterval(function () { if (today() !== shown) { shown = today(); cur = ''; render(); } tick(); }, 30000);
    W.__daily = { answer: answer, today: today, norm: norm };
  }).catch(function () { root.querySelector('#dw-msg').textContent = 'Could not load the word list. Please reload the page.'; });
})(window, document);
