/* Greek Alphabet: six short lessons from the letters to reading real Koine words.
   Example words are all found in the New Testament. Sounds are the ones most English-speaking courses teach. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('ab'); if (!root) return;
  function $(s) { return root.querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var TR = function (s) { return W.grTranslit ? W.grTranslit(s) : s; };

  // [upper, lower, name, Latin letters, how it sounds, example word, meaning]
  var L = {
    a: ['Α', 'α', 'alpha', 'a', '“a” as in father', 'ἄρτος', 'bread'],
    b: ['Β', 'β', 'beta', 'b', '“b” as in book', 'βιβλίον', 'book'],
    g: ['Γ', 'γ', 'gamma', 'g', '“g” as in go. Before γ, κ, ξ or χ it sounds like “n”: ἄγγελος is angelos', 'γῆ', 'earth'],
    d: ['Δ', 'δ', 'delta', 'd', '“d” as in dog', 'δένδρον', 'tree'],
    e: ['Ε', 'ε', 'epsilon', 'e', 'short “e” as in get', 'ἐλαία', 'olive'],
    z: ['Ζ', 'ζ', 'zeta', 'z', '“z” or “zd” as in wisdom', 'ζύμη', 'yeast'],
    h: ['Η', 'η', 'eta', 'ē', 'long “e”, like the “ey” in they', 'ἥλιος', 'sun'],
    q: ['Θ', 'θ', 'theta', 'th', '“th” as in thin', 'θάλασσα', 'sea'],
    i: ['Ι', 'ι', 'iota', 'i', '“i” as in machine (long) or pit (short)', 'ἰχθύς', 'fish'],
    k: ['Κ', 'κ', 'kappa', 'k', '“k” as in kite', 'κλείς', 'key'],
    l: ['Λ', 'λ', 'lambda', 'l', '“l” as in lamp', 'λύχνος', 'lamp'],
    m: ['Μ', 'μ', 'mu', 'm', '“m” as in mother', 'μέλι', 'honey'],
    n: ['Ν', 'ν', 'nu', 'n', '“n” as in night. The small letter looks like an English v', 'νύξ', 'night'],
    x: ['Ξ', 'ξ', 'xi', 'x', '“ks” as in box', 'ξύλον', 'wood'],
    o: ['Ο', 'ο', 'omicron', 'o', 'short “o” as in pot', 'ὄρος', 'mountain'],
    p: ['Π', 'π', 'pi', 'p', '“p” as in pot', 'πῦρ', 'fire'],
    r: ['Ρ', 'ρ', 'rho', 'r', '“r”, rolled. Looks like an English p but is not', 'ῥάβδος', 'staff'],
    s: ['Σ', 'σ', 'sigma', 's', '“s” as in sun. At the end of a word it is written ς', 'σῖτος', 'wheat'],
    t: ['Τ', 'τ', 'tau', 't', '“t” as in table', 'τράπεζα', 'table'],
    u: ['Υ', 'υ', 'upsilon', 'y', 'like French “u” or German “ü”. After another vowel it is written u', 'ὕδωρ', 'water'],
    f: ['Φ', 'φ', 'phi', 'ph', '“f” as in phone', 'φῶς', 'light'],
    c: ['Χ', 'χ', 'chi', 'ch', '“ch” as in Scottish loch (or simply “k”). Looks like an English X but is not', 'χείρ', 'hand'],
    y: ['Ψ', 'ψ', 'psi', 'ps', '“ps” as in lips', 'ψυχή', 'soul, life'],
    w: ['Ω', 'ω', 'omega', 'ō', 'long “o” as in tone', 'ὥρα', 'hour']
  };
  var DIPH = [
    ['αι', 'ai', '“ai” as in aisle', 'καί', 'and'], ['ει', 'ei', '“ei” as in eight', 'εἰρήνη', 'peace'],
    ['οι', 'oi', '“oi” as in oil', 'οἶκος', 'house'], ['υι', 'ui', '“wee” as in we', 'υἱός', 'son'],
    ['αυ', 'au', '“ow” as in now', 'αὐτός', 'he, himself'], ['ευ', 'eu', '“eh-oo”, close to feud', 'εὐαγγέλιον', 'good news, gospel'],
    ['ου', 'ou', '“oo” as in soup', 'οὐρανός', 'sky, heaven'], ['γγ', 'ng', '“ng” as in angle', 'ἄγγελος', 'messenger, angel']
  ];
  // Reading practice: Koine words (all in the New Testament) with meanings.
  var WORDS = [['λόγος', 'word'], ['ἄρτος', 'bread'], ['ἰχθύς', 'fish'], ['θάλασσα', 'sea'], ['οἶκος', 'house'], ['ὁδός', 'road, way'], ['ἡμέρα', 'day'], ['νύξ', 'night'],
    ['ἥλιος', 'sun'], ['ἀστήρ', 'star'], ['πλοῖον', 'boat, ship'], ['πρόβατον', 'sheep'], ['ἵππος', 'horse'], ['ὕδωρ', 'water'], ['πῦρ', 'fire'], ['φῶς', 'light'],
    ['λίθος', 'stone'], ['ὄρος', 'mountain'], ['πόλις', 'city'], ['βασιλεύς', 'king'], ['στέφανος', 'crown'], ['καρδία', 'heart'], ['χείρ', 'hand'], ['πούς', 'foot'],
    ['ὀφθαλμός', 'eye'], ['στόμα', 'mouth'], ['γυνή', 'woman'], ['ἀνήρ', 'man'], ['παιδίον', 'child'], ['ἀδελφός', 'brother'], ['θεός', 'God'], ['ἄγγελος', 'messenger, angel'],
    ['εἰρήνη', 'peace'], ['ἀγάπη', 'love'], ['χαρά', 'joy'], ['ζωή', 'life'], ['θάνατος', 'death'], ['κόσμος', 'world'], ['οὐρανός', 'sky, heaven'], ['γῆ', 'earth'],
    ['ἐκκλησία', 'assembly, church'], ['εὐαγγέλιον', 'good news, gospel'], ['βιβλίον', 'book'], ['ἐπιστολή', 'letter'], ['διδάσκαλος', 'teacher'], ['μαθητής', 'disciple'],
    ['ὥρα', 'hour'], ['ψυχή', 'soul, life'], ['ῥάβδος', 'staff'], ['ποτήριον', 'cup'], ['τράπεζα', 'table'], ['θύρα', 'door'], ['ἐλευθερία', 'freedom'], ['ἀλήθεια', 'truth']];
  var NAMES = [['Ἰησοῦς', 'Jesus'], ['Πέτρος', 'Peter'], ['Παῦλος', 'Paul'], ['Μαρία', 'Mary'], ['Ἰωάννης', 'John'], ['Ἀθῆναι', 'Athens'], ['Ῥώμη', 'Rome'], ['Ἱεροσόλυμα', 'Jerusalem']];
  var LESSONS = [
    { id: 1, t: 'Letters you already know', s: 'They look like English letters and sound like them too.', k: 'letters', set: 'a b d e i k o t z m', intro: 'Ten letters that look and sound much like their English cousins. Learn the small forms first: they are what you will read most.' },
    { id: 2, t: 'Letters that fool you', s: 'They look like English letters but sound different.', k: 'letters', set: 'h n r c p u w g', intro: 'These are the tricky ones: η looks like n but is a long e, ν looks like v but is n, ρ looks like p but is r, and χ looks like x but is ch.' },
    { id: 3, t: 'New shapes', s: 'The letters with no English look-alike.', k: 'letters', set: 'q l x s f y', intro: 'Six letters with shapes of their own. Three of them stand for two sounds at once: ξ is ks, ψ is ps, and θ is th.' },
    { id: 4, t: 'Pairs of letters', s: 'Diphthongs, and γγ that sounds like “ng”.', k: 'diph', intro: 'Two vowels can join into one sound, called a diphthong. And when γ comes before γ, κ, ξ or χ, it sounds like n.' },
    { id: 5, t: 'Breathings, accents and marks', s: 'The little signs above and below the letters.', k: 'marks', intro: '' },
    { id: 6, t: 'Read real words', s: 'Put it all together with words from the New Testament.', k: 'read', intro: 'Every word here is found in the New Testament. Choose how each one is written in Latin letters, then see what it means.' }
  ];
  var KEY = 'trb-alpha-v1', st = { done: {} };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY)); if (sv) st = sv; st.done = st.done || {}; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }

  function letterCard(k) {
    var x = L[k];
    return '<div class="ab-card"><div class="ab-big grc">' + x[0] + ' ' + x[1] + (k === 's' ? ' ς' : '') + '</div><div class="ab-name">' + x[2] + ' · <b>' + x[3] + '</b></div>' +
      '<p>' + esc(x[4]) + '</p><p class="ab-ex"><span class="grc">' + x[5] + '</span> <i>' + esc(TR(x[5])) + '</i> = ' + esc(x[6]) + '</p></div>';
  }
  function menu() {
    var n = Object.keys(st.done).length;
    root.innerHTML = '<div class="ab-menu"><p class="ab-prog">' + n + ' of ' + LESSONS.length + ' lessons finished</p><div class="ab-lessons">' +
      LESSONS.map(function (l) { return '<button type="button" class="ab-les' + (st.done[l.id] ? ' done' : '') + '" data-l="' + l.id + '"><span class="ab-n">' + (st.done[l.id] ? '✓' : l.id) + '</span><span><b>' + esc(l.t) + '</b><small>' + esc(l.s) + '</small></span></button>'; }).join('') +
      '</div><details class="ab-all"><summary>The whole alphabet at a glance</summary><div class="ab-grid">' + Object.keys(L).map(letterCard).join('') + '</div></details>' +
      '<p class="ab-note">About the sounds: these are the sounds most English-speaking courses teach (often called the Erasmian pronunciation), and they match the Latin-letter spellings used across this site. By New Testament times Greek speakers already said some letters differently; modern Greek is different again.</p></div>';
    root.querySelectorAll('[data-l]').forEach(function (b) { b.onclick = function () { lesson(+b.dataset.l); }; });
    W.scrollTo(0, Math.max(0, root.offsetTop - 80));
  }
  function lesson(id) {
    var l = LESSONS[id - 1], body = '';
    if (l.k === 'letters') body = '<div class="ab-grid">' + l.set.split(' ').map(letterCard).join('') + '</div>';
    if (l.k === 'diph') body = '<div class="ab-grid">' + DIPH.map(function (d) { return '<div class="ab-card"><div class="ab-big grc">' + d[0] + '</div><div class="ab-name"><b>' + d[1] + '</b></div><p>' + esc(d[2]) + '</p><p class="ab-ex"><span class="grc">' + d[3] + '</span> <i>' + esc(TR(d[3])) + '</i> = ' + esc(d[4]) + '</p></div>'; }).join('') + '</div>';
    if (l.k === 'marks') body = '<div class="ab-marks">' +
      '<div class="ab-card"><h3>Breathings</h3><p>Every word that begins with a vowel has a small mark above it. The <b>rough breathing</b> <span class="grc big">ἁ</span> (opening to the right, like a c) adds an <b>h</b>: <span class="grc">ὁδός</span> <i>' + TR('ὁδός') + '</i>, <span class="grc">ἡμέρα</span> <i>' + TR('ἡμέρα') + '</i>. The <b>smooth breathing</b> <span class="grc big">ἀ</span> adds nothing: <span class="grc">ἄρτος</span> <i>' + TR('ἄρτος') + '</i>.</p><p>Words that begin with ρ or υ always have a rough breathing: <span class="grc">ῥάβδος</span> <i>' + TR('ῥάβδος') + '</i>, <span class="grc">ὕδωρ</span> <i>' + TR('ὕδωρ') + '</i>. On a diphthong the mark sits on the second vowel: <span class="grc">οἶκος</span>, <span class="grc">υἱός</span> <i>' + TR('υἱός') + '</i>.</p></div>' +
      '<div class="ab-card"><h3>Accents</h3><p>Three accents, <b>acute</b> <span class="grc big">ά</span>, <b>grave</b> <span class="grc big">ὰ</span> and <b>circumflex</b> <span class="grc big">ᾶ</span>, mark the syllable to stress. They first marked a rise and fall in pitch; most learners today simply stress that syllable: <span class="grc">λόγος</span> is <i>LO-gos</i>, <span class="grc">ἀγάπη</span> is <i>a-GA-pē</i>.</p></div>' +
      '<div class="ab-card"><h3>Iota subscript</h3><p>A tiny ι written under α, η or ω: <span class="grc big">ᾳ ῃ ῳ</span>. It is a silent remnant of an old diphthong; the site’s Latin-letter spelling shows it as an i: <span class="grc">ᾠδή</span> <i>' + TR('ᾠδή') + '</i> (song).</p></div>' +
      '<div class="ab-card"><h3>Punctuation</h3><p>The comma and full stop look like ours. But <span class="grc big">;</span> is a <b>question mark</b>, and a raised dot <span class="grc big">·</span> is a semicolon or colon. Capital letters start names and paragraphs, not every sentence.</p></div>' +
      '<div class="ab-card"><h3>Names you know</h3><p>' + NAMES.map(function (n) { return '<span class="grc">' + n[0] + '</span> <i>' + TR(n[0]) + '</i> = ' + n[1]; }).join('<br>') + '</p></div></div>';
    if (l.k === 'read') body = '<p class="ab-intro">You will see 12 words. Pick the right Latin-letter spelling, and the meaning appears.</p>';
    root.innerHTML = '<div class="ab-les-view"><button type="button" class="ab-back" id="ab-back">‹ All lessons</button><h2>' + id + '. ' + esc(l.t) + '</h2>' + (l.intro ? '<p class="ab-intro">' + esc(l.intro) + '</p>' : '') + body +
      '<div class="ab-go"><button type="button" class="ab-btn pri" id="ab-quiz">' + (l.k === 'read' ? 'Start reading' : 'Quiz me') + ' →</button></div></div>';
    $('#ab-back').onclick = menu; $('#ab-quiz').onclick = function () { quiz(id); };
    W.scrollTo(0, Math.max(0, root.offsetTop - 80));
  }
  // ---------- quizzes ----------
  function makeQs(id) {
    var l = LESSONS[id - 1], qs = [];
    if (l.k === 'letters') {
      var set = l.set.split(' '), all = Object.keys(L);
      shuffle(set.concat(set)).slice(0, 10).forEach(function (k, i) {
        var x = L[k], others = shuffle(all.filter(function (o) { return o !== k; })).slice(0, 3);
        if (i % 2) qs.push({ q: '<span class="grc ab-qbig">' + (Math.random() < .3 ? x[0] : x[1]) + '</span>', ask: 'Which sound is this letter?', a: x[3], opts: shuffle([x[3]].concat(others.map(function (o) { return L[o][3]; }))), after: x[2] + ': ' + x[4] });
        else qs.push({ q: '<span class="ab-qbig">' + x[3] + '</span>', ask: 'Which Greek letter makes this sound?', a: x[1], opts: shuffle([x[1]].concat(others.map(function (o) { return L[o][1]; }))), grc: true, after: x[2] + ': ' + x[4] });
      });
    } else if (l.k === 'diph') {
      shuffle(DIPH.concat(shuffle(DIPH).slice(0, 2))).forEach(function (d) {
        var others = shuffle(DIPH.filter(function (o) { return o !== d; })).slice(0, 3);
        qs.push({ q: '<span class="grc ab-qbig">' + d[3] + '</span>', ask: 'How is this word written in Latin letters? Look at the pair ' + d[0] + '.', a: TR(d[3]), opts: shuffle([TR(d[3])].concat(others.map(function (o) { return TR(o[3]); }))), after: d[3] + ' = ' + d[4] + '. ' + d[0] + ' sounds ' + d[2] + '.' });
      });
    } else if (l.k === 'marks') {
      var pool = shuffle(WORDS.concat(NAMES)).filter(function (w) { return variants(w[0], TR(w[0])).length === 3; }).slice(0, 10);
      pool.forEach(function (w) {
        var right = TR(w[0]), wrong = variants(w[0], right);
        qs.push({ q: '<span class="grc ab-qbig">' + w[0] + '</span>', ask: 'Which spelling is right? Check the breathing and the accent.', a: right, opts: shuffle([right].concat(wrong)), after: w[0] + ' = ' + w[1] });
      });
    } else {
      var ws = shuffle(WORDS).slice(0, 12);
      ws.forEach(function (w) {
        var right = TR(w[0]), others = shuffle(WORDS.filter(function (o) { return o !== w && Math.abs(o[0].length - w[0].length) < 3; })).slice(0, 3).map(function (o) { return TR(o[0]); });
        qs.push({ q: '<span class="grc ab-qbig">' + w[0] + '</span>', ask: 'Read it: which spelling is right?', a: right, opts: shuffle([right].concat(others)), after: w[0] + ' = ' + w[1], word: w });
      });
    }
    return qs;
  }
  function variants(g, right) { // plausible wrong spellings: breathing swapped, stress on another syllable, long and short vowels mixed up
    var out = [], cap = /^[A-Z]/.test(right);
    function add(v) { v = v.normalize('NFC'); if (v !== right.normalize('NFC') && out.indexOf(v) < 0) out.push(v); }
    function capf(v) { return cap ? v.charAt(0).toUpperCase() + v.slice(1) : v; }
    var low = right.charAt(0).toLowerCase() + right.slice(1);
    if (/^h[aeiouyēō]/.test(low)) add(capf(low.slice(1)));
    else if (/^[aeiouyēō]/.test(low.normalize('NFD'))) add(capf('h' + low));
    // syllables: split NFD into chunks, each vowel group with its combining marks
    var d = right.normalize('NFD').replace(/\u0301/g, ''), groups = [], m, re = /[aeiouyAEIOUY][\u0304\u0308]?(?:[iu](?![\u0308]))?[\u0304]?/g;
    while ((m = re.exec(d))) groups.push(m.index + m[0].length);
    var stressAt = right.normalize('NFD').indexOf('\u0301');
    shuffle(groups).forEach(function (end) { if (Math.abs(end - stressAt) <= 1 && stressAt >= 0) return; add(d.slice(0, end) + '\u0301' + d.slice(end)); });
    var swaps = [[/ē/, 'e'], [/ō/, 'o'], [/e(?![\u0304])/, 'ē'], [/o(?![\u0304u])/, 'ō']];
    swaps.forEach(function (sw) { var n = right.normalize('NFD'); if (sw[0].test(n)) add(n.replace(sw[0], sw[1])); });
    return shuffle(out).slice(0, 3);
  }
  function quiz(id) {
    var qs = makeQs(id), i = 0, right = 0, l = LESSONS[id - 1];
    function show() {
      if (i >= qs.length) return finish();
      var q = qs[i];
      root.innerHTML = '<div class="ab-quiz"><div class="ab-qhead"><button type="button" class="ab-back" id="ab-back">‹ ' + esc(l.t) + '</button><span>' + (i + 1) + ' / ' + qs.length + ' · ✓ ' + right + '</span></div>' +
        '<div class="ab-q">' + q.q + '</div><p class="ab-ask">' + esc(q.ask) + '</p><div class="ab-opts">' +
        q.opts.map(function (o) { return '<button type="button" class="ab-opt' + (q.grc ? ' grc' : '') + '">' + esc(o) + '</button>'; }).join('') + '</div><p class="ab-after" id="ab-after" aria-live="polite"></p></div>';
      $('#ab-back').onclick = function () { lesson(id); };
      root.querySelectorAll('.ab-opt').forEach(function (b, n) {
        b.onclick = function () {
          if (root.querySelector('.ab-opt[disabled]')) return;
          var ok = q.opts[n] === q.a; if (ok) right++;
          root.querySelectorAll('.ab-opt').forEach(function (x, m) { x.disabled = true; if (q.opts[m] === q.a) x.classList.add('right'); });
          if (!ok) b.classList.add('wrong');
          if (q.word && W.TRBWords) W.TRBWords.log('alphabet', 'g', q.word[0], q.word[1]);
          $('#ab-after').innerHTML = (ok ? '<b class="ok">Right.</b> ' : '<b class="no">Not quite.</b> ') + esc(q.after) + ' <button type="button" class="ab-btn pri" id="ab-next">Next →</button>';
          var nx = $('#ab-next'); nx.onclick = function () { i++; show(); }; nx.focus();
        };
      });
    }
    function finish() {
      var pass = right >= Math.ceil(qs.length * 0.8);
      if (pass) { st.done[id] = 1; save(); }
      root.innerHTML = '<div class="ab-quiz ab-end"><h2>' + (pass ? 'Lesson finished!' : 'Almost there') + '</h2><p class="ab-score">' + right + ' of ' + qs.length + ' right</p><p>' +
        (pass ? (id < LESSONS.length ? 'On to the next lesson when you are ready.' : 'You can read Greek letters now. Try the <a href="/languages/readings/">short readings</a>, the <a href="/languages/reader/">Gospel reader</a>, or the <a href="/games/daily/">daily word puzzle</a>.') : 'Get ' + Math.ceil(qs.length * 0.8) + ' right to finish the lesson. Have another look at the letters and try again.') + '</p>' +
        '<div class="ab-go"><button type="button" class="ab-btn" id="ab-again">Try again</button> ' + (pass && id < LESSONS.length ? '<button type="button" class="ab-btn pri" id="ab-next">Next lesson →</button> ' : '') + '<button type="button" class="ab-btn" id="ab-menu">All lessons</button></div></div>';
      $('#ab-again').onclick = function () { quiz(id); }; $('#ab-menu').onclick = menu;
      var nx = $('#ab-next'); if (nx) nx.onclick = function () { lesson(id + 1); };
    }
    show();
  }
  var m = /#lesson-(\d)/.exec(W.location.hash); if (m && LESSONS[+m[1] - 1]) lesson(+m[1]); else menu();
  W.__alpha = { L: L, WORDS: WORDS, variants: variants, makeQs: makeQs };
})(window, document);
