/* Linear A and Linear B (aegean): problem generators for the Ancient Scripts Ladder.
   Built from /tmp/work_aegean/gen/*.js by build_gen.js. Sign values, logograms, numerals, measures, words, tablets, dates
   and sites come from the kit's model (MathLadder.scripts, static/scripts/viz/scripts.js), so pictures and answers agree.
   The generator's own data: SPELL (Mycenaean sound forms of words in the model's WORDS, with the spelling rules each shows;
   checked by an independent speller in /tmp/work_aegean/test/verify.js), fact banks (from the course's lessons), and
   practice tablet lines made from WORDS and LOGO. Linear A values are always "by convention"; only ku-ro is taught as
   having an accepted meaning. Transliteration answers are 'text' with variants (hyphens, spaces, joined, a₂ for a2). */
(function (ML) {
  'use strict';
  function SC() { return ML.scripts; }
  function plain(s) { return String(s).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); }
  function cleanSpec(a) { if (!a) return; if (a.t === 'mc' && a.choices) a.choices = a.choices.map(plain); if (a.t === 'multi') (a.parts || []).forEach(function (q) { cleanSpec(q.a); }); }
  function G(id, fn) { ML.gen(id, function (R, ctx) { var p = fn(R, ctx || { level: 1 }); if (p) cleanSpec(p.a); return p; }); }
  function lv(ctx) { return (ctx && ctx.level) || 1; }

  /* ---------- text helpers ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function tl(s) { return '<i class="sc-tl">' + esc(s) + '</i>'; }
  function sb(t, size) { return '<span class="sc-b" style="font-size:' + (size || 1.6) + 'em;line-height:1.2">' + SC().toSigns(t) + '</span>'; }
  function sa(t, size) { return '<span class="sc-a" style="font-size:' + (size || 1.6) + 'em;line-height:1.2">' + SC().toSigns(t, 'A') + '</span>'; }
  function su(u, size) { return '<span class="sc-b" style="font-size:' + (size || 1.6) + 'em;line-height:1.2">' + u + '</span>'; }
  function sua(u, size) { return '<span class="sc-a" style="font-size:' + (size || 1.6) + 'em;line-height:1.2">' + u + '</span>'; }
  function lgu(k, size) { return su(SC().logo(k).u, size); }
  function nmu(n, size) { return su(SC().num(n), size); }
  function Q(s) { return '“' + s + '”'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ---------- answers ---------- */
  // a transliteration: hyphenated, with subscript digits, joined, and spaced (unless it starts with a/an, which the checker drops)
  function tlVars(s) {
    var out = [];
    function add(x) { if (out.indexOf(x) < 0) out.push(x); }
    add(s);
    var sub = s.replace(/([a-z])([23])/g, function (m, a, d) { return a + (d === '2' ? '₂' : '₃'); });
    add(sub); add(s.replace(/-/g, '')); add(sub.replace(/-/g, ''));
    if (!/^(a|an|the)-/.test(s)) { add(s.replace(/-/g, ' ')); add(sub.replace(/-/g, ' ')); }
    add(s.replace(/-/g, '.'));
    return out;
  }
  function txt(s, more) { var v = tlVars(s); (more || []).forEach(function (m) { tlVars(m).forEach(function (x) { if (v.indexOf(x) < 0) v.push(x); }); }); return { t: 'text', v: v, strict: true }; }
  function words(list) { return { t: 'text', v: list }; }
  function num(n) { return { t: 'num', v: String(n) }; }
  function mc(right, wrongs, k, keep) {
    right = plain(right);
    var out = [right], seen = {}; seen[right] = 1; k = k || 4;
    for (var i = 0; i < wrongs.length && out.length < k; i++) { var w = plain(wrongs[i] === undefined || wrongs[i] === null ? '' : wrongs[i]); if (w !== '' && !seen[w]) { seen[w] = 1; out.push(w); } }
    var a = { t: 'mc', choices: out, v: 0 };
    if (keep) { // keep a natural order (Yes/No, 1st/2nd/3rd, A/B) with the right answer wherever it falls
      var rank = function (c) { var m = /^(\D*?)(\d+)/.exec(c); if (/^None/.test(c)) return 99; if (/^Yes/.test(c)) return 0; if (/^No\b/.test(c)) return 1; return m ? +m[2] : 50; };
      var sorted = out.slice().sort(function (x, y) { return rank(x) - rank(y); });
      a.choices = sorted; a.v = sorted.indexOf(right); a.keep = true;
    }
    return a;
  }
  // mc with wrong answers sampled from a pool (so problems vary)
  function mcs(R, right, pool, k) { var w = R.shuffle(pool.filter(function (x) { return plain(x) !== plain(right); })); return mc(right, w, k || 4); }
  function tf(v) { return { t: 'tf', v: !!v }; }
  // a question from a bank item { q, a, w: [wrong answers], s: [steps], h: hint }
  function fact(R, it, k) {
    return { q: it.q, a: mcs(R, it.a, it.w, k || 4), steps: it.s || [it.a + '.'], hint: it.h || 'Think back to the lesson.' };
  }
  // a true/false question from a bank of statements [text, true?, why]
  function tfq(R, bank) { var it = R.pick(bank); return { q: 'True or false? ' + it[0], a: tf(it[1]), steps: [(it[1] ? 'True. ' : 'False. ') + it[2]], hint: 'Ask what the evidence actually shows.' }; }
  // order: items [{ name, y }] (y: year, BC negative); returns a problem asking for the earliest-first order
  function orderQ(R, items, what) {
    var right = items.slice().sort(function (a, b) { return a.y - b.y; });
    var seq = function (arr) { return arr.map(function (x) { return x.name; }).join(' → '); };
    var wrongs = [], tries = 0;
    while (wrongs.length < 6 && tries++ < 60) { var s = seq(R.shuffle(items)); if (s !== seq(right) && wrongs.indexOf(s) < 0) wrongs.push(s); }
    return {
      q: 'Put these ' + (what || 'events') + ' in order, earliest first: ' + R.shuffle(items).map(function (x) { return '<b>' + esc(x.name) + '</b>'; }).join('; ') + '.',
      a: mc(seq(right), wrongs, 4),
      steps: right.map(function (x) { return x.name + ': ' + x.when + '.'; }).concat(['So the order is ' + seq(right) + '.']),
      hint: 'Place each one on a timeline: which came first?'
    };
  }
  function signsViz(text, o) { var x = { text: text, quiet: true, interactive: false }; for (var k in (o || {})) x[k] = o[k]; return { name: 'sc-signs', opts: x }; }
  function mapPick(R, target, others, view) {
    var ch = R.shuffle([target].concat(others));
    return { viz: { name: 'sc-map', opts: { mode: 'pick', quiet: true, target: target, choices: ch, view: view || 'aegean', views: false } }, a: { t: 'mc', choices: letterChoices(ch.length), v: ch.indexOf(target), keep: true }, letters: ch, letter: String.fromCharCode(65 + ch.indexOf(target)) };
  }
  function letterChoices(n) { var out = []; for (var i = 0; i < n; i++) out.push('Place ' + String.fromCharCode(65 + i)); return out; }
  function site(k) { return SC().site(k); }
  var REGION = { crete: 'on Crete', islands: 'on an Aegean island', mainland: 'on the Greek mainland', cyprus: 'on Cyprus' };


  /* ================= Unit 1: The Bronze Age Aegean ================= */
  // sites with a clear region, for map and region questions
  var CRETE = ['knossos', 'phaistos', 'triada', 'malia', 'zakros', 'chania', 'palaikastro'];
  var MAIN = ['pylos', 'mycenae', 'tiryns', 'thebes', 'iklaina', 'midea', 'vasileios', 'volos'];
  var ISLES = ['akrotiri', 'phylakopi', 'kea'];
  var BIG = ['knossos', 'phaistos', 'zakros', 'chania', 'pylos', 'mycenae', 'thebes', 'akrotiri', 'phylakopi', 'kea', 'malia', 'volos'];
  function regionQ(R, keys) {
    var k = R.pick(keys), s = site(k);
    var right = REGION[s.region], pool = ['on Crete', 'on an Aegean island', 'on the Greek mainland', 'on Cyprus'];
    return { q: 'Where is <b>' + esc(s.name) + '</b>?', a: mcs(R, right, pool, 4), steps: [s.name + ' is ' + right + '.', s.note], hint: 'Picture the map: Crete in the south, the Cyclades in the middle, the mainland to the west and north.' };
  }
  var CRETE_PICK = ['knossos', 'phaistos', 'malia', 'zakros', 'chania', 'palaikastro'];
  function pickQ(R, pool, view, sentence) {
    var t = R.pick(pool), from = view === 'crete' ? CRETE_PICK : BIG;
    var oth = R.sample(from.filter(function (x) { return x !== t; }), 3);
    var mp = mapPick(R, t, oth, view), s = site(t);
    return { q: (sentence || 'Which lettered place on the map is <b>' + esc(s.name) + '</b>?'), viz: mp.viz, a: mp.a, steps: [s.name + ' is place ' + mp.letter + '.', s.note], hint: view === 'crete' ? 'Knossos is near the middle of the north coast; Phaistos in the south; Zakros at the far east; Chania in the west.' : 'Crete is the long island in the south; the Peloponnese is the large peninsula in the west.' };
  }


  var WORLD = [
    { q: 'About when was the Aegean Bronze Age?', a: 'From about 3000 to about 1100 BC', w: ['From about 800 to about 300 BC', 'From about 1100 to about 500 BC', 'From about AD 100 to AD 500', 'From about 6000 to about 4000 BC'], s: ['The Bronze Age in the Aegean ran from about 3000 to about 1100 BC.', 'The Greek alphabet and Classical Greece came later.'] },
    { q: 'What joined the Bronze Age communities of the Aegean most?', a: 'The sea: ships linked islands, Crete and the mainland', w: ['A network of paved Roman roads', 'One government ruling all of Greece', 'A shared alphabet', 'Rivers flowing across the mainland'], s: ['Ships could cross from island to island, rarely out of sight of land.', 'Goods and ideas, including writing, traveled by sea.'] },
    { q: 'Which statement describes Bronze Age Greece best?', a: 'A patchwork: a civilization on Crete, island towns and separate palace states on the mainland', w: ['One Greek nation under one king', 'A single empire ruled from Athens', 'Empty land until the Classical age', 'A province of Egypt'], s: ['There was no Greek nation then.', 'Crete, the islands and each mainland palace had their own rulers.'] },
    { q: 'Which script was used by the Greek-speaking palaces of the mainland?', a: 'Linear B', w: ['Linear A', 'Cretan hieroglyphs', 'The Greek alphabet', 'Egyptian hieroglyphs'], s: ['The mainland palaces at Pylos, Mycenae and Thebes kept records in Linear B, which writes Greek.'] },
    { q: 'Which scripts were used by the Minoans of Crete?', a: 'Cretan hieroglyphs and Linear A', w: ['Linear B only', 'The Greek alphabet', 'Phoenician letters', 'Egyptian hieroglyphs and cuneiform'], s: ['The Minoans wrote first in Cretan hieroglyphs, then in Linear A; both are still unread.'] },
    { q: 'What is bronze?', a: 'Copper mixed with tin', w: ['Iron mixed with carbon', 'Pure copper', 'Gold mixed with silver', 'A kind of stone'], s: ['Bronze is an alloy of copper and tin, harder than copper alone, and it gave the Bronze Age its name.'] }
  ];
  G('aegean.aegean-world', function (R, ctx) {
    var L0 = lv(ctx), r = R.int(0, 2);
    if (L0 === 1 && r === 0) return fact(R, R.pick(WORLD));
    if (r === 1 || L0 === 1) return regionQ(R, CRETE.concat(MAIN, ISLES));
    if (r === 2) return pickQ(R, ['knossos', 'pylos', 'mycenae', 'thebes', 'akrotiri', 'zakros', 'chania'], 'aegean');
    return fact(R, R.pick(WORLD));
  });

  var MINO = [
    { q: 'Where does the name "Minoan" come from?', a: 'Arthur Evans named the civilization after Minos, a king of Cretan legend', w: ['It is what the people called themselves', 'It comes from a Linear A word meaning "islanders"', 'It is the name of the island in Egyptian', 'It comes from the city of Minoa in Greece'], s: ['Evans borrowed the name of the legendary King Minos of Knossos.', 'The people\'s own name for themselves is unknown.'] },
    { q: 'What did the Minoans call themselves?', a: 'We do not know', w: ['Minoans', 'Mycenaeans', 'Achaeans', 'Hellenes'], s: ['Their script, Linear A, cannot be read, so their own name is lost.', '"Minoan" is a modern label.'] },
    { q: 'What language did the Minoans speak?', a: 'An unknown language, not Greek as far as anyone can tell', w: ['Greek', 'Egyptian', 'Latin', 'Phoenician'], s: ['Linear A, the Minoan script, writes a language that matches no known language.'] },
    { q: 'Which of these do we know about the Minoans without reading their writing?', a: 'They built palaces around central courts and traded across the sea', w: ['The names of their kings', 'The words of their prayers', 'Their own history of their island', 'The name of their language'], s: ['Archaeology shows buildings, crafts and trade.', 'Names, prayers and history would need readable texts.'] },
    { q: 'Was King Minos a known, historical ruler of Knossos?', a: 'No: he belongs to later Greek legend, and no inscription names him', w: ['Yes: Linear A tablets give his name', 'Yes: Evans found his tomb', 'Yes: Egyptian records list his reign', 'Yes: Linear B lists him as wanax'], s: ['Minos is a figure of Greek myth, written down long after the palaces fell.'] }
  ];
  G('aegean.minoans', function (R, ctx) {
    var r = R.int(0, 2);
    if (r === 0) {
      var t = R.pick(CRETE.filter(function (k) { return k !== 'triada'; })), oth = R.sample(MAIN, 3), s = site(t);
      return { q: 'Which of these places is on Crete, the Minoan homeland?', a: mc(s.name, oth.map(function (k) { return site(k).name; }), 4), steps: [s.name + ' is on Crete.', 'The others are on the Greek mainland, home of the Mycenaeans.'], hint: 'Pylos, Mycenae, Tiryns and Thebes are mainland palaces.' };
    }
    if (r === 1 && lv(ctx) > 1) return pickQ(R, ['knossos', 'phaistos', 'malia', 'zakros', 'chania'], 'crete');
    return fact(R, R.pick(MINO));
  });

  var PAL_TF = [
    ['A Cretan palace was only a royal home.', false, 'Palaces were also storehouses, workshops, shrines and record offices.'],
    ['The Cretan palaces were built around a large open central court.', true, 'Knossos, Phaistos, Malia and Zakros all have one.'],
    ['Rows of huge storage jars show that palaces gathered goods such as oil and grain.', true, 'The storerooms held the produce of the region.'],
    ['Writing in the Aegean began mainly as a way to tell stories.', false, 'Nearly everything in Linear A and Linear B is accounts: bookkeeping.'],
    ['We know for certain that a king lived in the palace at Knossos.', false, 'The word "palace" is a modern label; who lived there is not known.'],
    ['The first Cretan palaces were destroyed around 1700 BC and rebuilt.', true, 'The second palaces were grander still, until destructions around 1450 BC.']
  ];
  G('aegean.cretan-palaces', function (R, ctx) {
    var r = R.int(0, 2);
    if (r === 0) return pickQ(R, ['knossos', 'phaistos', 'malia', 'zakros'], 'crete');
    if (r === 1) {
      var t = R.pick(['knossos', 'phaistos', 'malia', 'zakros']), oth = R.sample(['pylos', 'mycenae', 'thebes', 'tiryns', 'akrotiri', 'phylakopi'], 3);
      return { q: 'Which of these is a palace site on Crete?', a: mc(site(t).name, oth.map(function (k) { return site(k).name; }), 4), steps: [site(t).name + ' is one of the Cretan palaces (Knossos, Phaistos, Malia, Zakros).', 'The others are mainland palaces or island towns.'], hint: 'Four big Cretan palaces: Knossos, Phaistos, Malia and Zakros.' };
    }
    var it = R.pick([
      { q: 'A palace room holds thirty tall jars and clay labels with signs. What was it most likely for?', a: 'A storeroom whose contents officials recorded', w: ['A throne room', 'A bedroom for the king', 'A school for children', 'A tomb'], s: ['Many large jars mean storage.', 'Labels with signs mean someone kept track of the contents.'] },
      { q: 'Why did the Cretan palaces need writing?', a: 'To keep track of goods, workers and payments', w: ['To write poems about their kings', 'To send letters to Egypt', 'To print books', 'To record laws for citizens'], s: ['A palace gathered and paid out large amounts of goods.', 'Clay records let officials track it all.'] },
      { q: 'What happened to the Cretan palaces around 1450 BC?', a: 'Many were destroyed; afterward Knossos was run by Greek speakers', w: ['They were first built', 'They were turned into Roman villas', 'They began to use the Greek alphabet', 'Nothing: they flourished until 300 BC'], s: ['Destructions swept Crete around 1450 BC.', 'Knossos continued, now with records in Linear B.'] }
    ]);
    return R.coin() ? fact(R, it) : tfq(R, PAL_TF);
  });

  var MYC_TF = [
    ['The Minoans and the Mycenaeans were the same people.', false, 'They were different cultures: the Minoans on Crete with an unknown language, the Mycenaeans on the mainland speaking Greek.'],
    ['The Mycenaeans spoke Greek.', true, 'Their Linear B tablets are written in an early form of Greek.'],
    ['Homer\'s poems are records written by Mycenaean scribes.', false, 'Homer\'s poems were composed centuries after the palaces fell; the scribes wrote accounts.'],
    ['Linear B was adapted from the Minoan script, Linear A.', true, 'Many signs share their shapes.'],
    ['By about 1450 BC Greek speakers ran Knossos on Crete.', true, 'The later Knossos archive is in Linear B, which writes Greek.'],
    ['Mycenaean citadels such as Mycenae and Tiryns had massive stone walls.', true, 'Unlike most Minoan palaces, they were fortified.']
  ];
  G('aegean.mycenaeans', function (R, ctx) {
    var r = R.int(0, 2);
    if (r === 0) {
      var t = R.pick(['pylos', 'mycenae', 'thebes', 'tiryns']), oth = R.sample(['knossos', 'phaistos', 'malia', 'zakros', 'akrotiri', 'triada'], 3);
      return { q: 'Which of these was a Mycenaean palace on the mainland?', a: mc(site(t).name, oth.map(function (k) { return site(k).name; }), 4), steps: [site(t).name + ' is on the Greek mainland, a Mycenaean palace with Linear B records.', 'The others are on Crete or the islands.'], hint: 'Mycenae, Pylos, Thebes and Tiryns are on the mainland.' };
    }
    if (r === 1) {
      var k = R.pick(MAIN.concat(['akrotiri', 'phaistos', 'zakros', 'triada'])), s = site(k), B = s.scripts.indexOf('B') >= 0;
      return { q: 'Records found at <b>' + esc(s.name) + '</b> are written in which script?', a: mc(B ? 'Linear B' : 'Linear A', [B ? 'Linear A' : 'Linear B', 'The Greek alphabet', 'Cretan hieroglyphs'], 4), steps: [s.note, B ? 'Mainland palaces wrote Greek in Linear B.' : 'Minoan Crete and the islands used Linear A.'], hint: 'Mainland palaces used Linear B; Minoan sites used Linear A.' };
    }
    return tfq(R, MYC_TF);
  });

  var PERI = [{ name: 'Early Minoan', y: -3100, when: 'about 3100 to 2100 BC' }, { name: 'Middle Minoan', y: -2100, when: 'about 2100 to 1600 BC' }, { name: 'Late Minoan', y: -1600, when: 'about 1600 to 1100 BC' }];
  var DATING = [
    { q: 'What do the names Early, Middle and Late Minoan tell you first of all?', a: 'The order of periods, worked out from pottery styles', w: ['Exact years from Minoan texts', 'The names of Minoan kings', 'Dates read from Linear A tablets', 'How rich each period was'], s: ['Pottery styles give the order of the periods.', 'Years come from radiocarbon and links to Egypt.'] },
    { q: 'How do archaeologists tie Aegean periods to years?', a: 'By radiocarbon dating and by links to Egypt\'s dated history', w: ['By reading dates on the tablets', 'By counting kings in Linear B', 'From Homer\'s poems', 'From the Greek alphabet'], s: ['No Aegean text gives a year.', 'Radiocarbon and Egyptian objects found with Aegean ones supply dates.'] },
    { q: 'A book says the second Cretan palaces ended "c. 1450 BC". What does "c." mean here?', a: 'About: the date could be off by decades', w: ['Exactly 1450 BC', 'Century: the 1450s', 'Crete: a Cretan calendar date', 'Counted from the creation of Knossos'], s: ['c. is circa, "about".', 'Aegean dates have margins of decades or more.'] },
    { q: 'What is debated about the eruption of Thera?', a: 'Its date: radiocarbon points to about 1600 BC, older dating to about 1500 BC', w: ['Whether it happened at all', 'Which island erupted', 'Whether Akrotiri was buried', 'Whether it ended the Roman Empire'], s: ['The eruption buried Akrotiri.', 'Methods disagree on its date by about a century; it is still debated.'] },
    { q: 'A Middle Minoan pot lies in one layer and a Late Minoan pot in another. Which layer is older?', a: 'The one with the Middle Minoan pot', w: ['The one with the Late Minoan pot', 'Both are the same age', 'It cannot be told from pottery', 'Neither: pots are never in layers'], s: ['Early comes before Middle, and Middle before Late.'] }
  ];
  G('aegean.aegean-dating', function (R, ctx) {
    if (R.int(0, 2) === 0) return orderQ(R, R.shuffle(PERI), 'periods');
    return fact(R, R.pick(DATING));
  });

  var END = [
    { q: 'What happened to writing in Greece after the palaces fell around 1200 BC?', a: 'It disappeared for about four centuries', w: ['Linear B became more popular', 'The Greek alphabet replaced it at once', 'Linear A came back into use', 'Nothing changed'], s: ['Linear B was a palace bookkeeping tool.', 'With no palaces, no one needed or taught it, until the alphabet around 800 BC.'] },
    { q: 'What do scholars think caused the end of the Mycenaean palaces?', a: 'Probably several factors together; the causes are debated', w: ['Certainly one earthquake in 1200 BC', 'Certainly the Sea Peoples alone', 'The Romans conquered them', 'The eruption of Thera'], s: ['Earthquakes, raids, warfare, drought and the breakdown of trade are all proposed.', 'Most think more than one played a part.'] },
    { q: 'Why did Linear B die out with the palaces?', a: 'Only palace scribes used it, for palace accounts', w: ['The Greeks banned it', 'It was replaced by Latin', 'Clay ran out', 'The scribes switched to Linear A'], s: ['Linear B was used by a few scribes for palace records.', 'With the palaces gone, the script was not needed or taught.'] },
    { q: 'How did the fire at Pylos help modern scholars?', a: 'It baked the clay tablets hard and preserved them', w: ['It revealed buried gold', 'It left a written account of the attack', 'It destroyed all the tablets', 'It dated the tablets exactly'], s: ['The tablets were unbaked clay.', 'The fire baked about a thousand of them.'] }
  ];
  var END_TF = [
    ['All the Mycenaean palaces were destroyed in a single year.', false, 'The destructions came in waves over decades around 1200 BC.'],
    ['Scholars agree that one single cause ended the palaces.', false, 'Several causes are debated, and most think more than one worked together.'],
    ['After about 1200 BC, Greece had no writing for about four centuries.', true, 'Writing returned with the alphabet around 800 BC.'],
    ['The eastern Mediterranean as a whole was in trouble around 1200 BC.', true, 'The Hittite empire collapsed and coastal cities of the Levant were destroyed.']
  ];
  G('aegean.end-of-palaces', function (R, ctx) {
    var r = R.int(0, 3);
    if (r === 0) return orderQ(R, R.sample([{ name: 'Linear B at Knossos', y: -1450, when: 'from about 1450 BC' }, { name: 'Pylos burns', y: -1200, when: 'about 1200 BC' }, { name: 'The Greek alphabet', y: -800, when: 'about 800 BC' }, { name: 'The first Cretan palaces', y: -1900, when: 'about 1900 BC' }], 3));
    if (r === 1) {
      var a = R.pick([[1200, 800, 'Linear B goes out of use', 'the Greek alphabet appears'], [1450, 1200, 'Linear B appears at Knossos', 'the mainland palaces fall'], [1450, 800, 'Linear B appears at Knossos', 'the Greek alphabet appears']]);
      return { q: 'About ' + a[0] + ' BC ' + a[2] + '; about ' + a[1] + ' BC ' + a[3] + '. About how many years lie between?', a: num(a[0] - a[1]), steps: ['Both dates are BC, so subtract the smaller from the larger.', a[0] + ' − ' + a[1] + ' = ' + (a[0] - a[1]) + ' years.'], hint: 'For two BC dates, subtract the smaller number from the larger.' };
    }
    if (r === 2) return tfq(R, END_TF);
    return fact(R, R.pick(END));
  });


  /* ================= Unit 2: Kinds of Writing ================= */
  var GREEK_LET = [['α', 'alpha'], ['β', 'beta'], ['γ', 'gamma'], ['δ', 'delta'], ['λ', 'lambda'], ['π', 'pi'], ['σ', 'sigma'], ['ω', 'omega']];
  var LOGO_COMMON = ['VIR', 'MUL', 'EQU', 'GRA', 'OLE', 'VIN', 'AES', 'AUR', 'LANA', 'CUR', 'ROTA', 'OVISm', 'BOSf', '*201VAS', '*202VAS', '*209VAS'];
  function gridSigns(rows) { return SC().SIGNS.filter(function (s) { return s.kind === 'grid' && !s.doubt && (!rows || rows.indexOf(s.c) >= 0); }); }
  G('aegean.kinds-of-writing', function (R, ctx) {
    var r = R.int(0, 3), KINDS = ['A logogram (a word sign)', 'A syllable sign', 'A letter of an alphabet'];
    if (r === 0) {
      var k = R.pick(LOGO_COMMON), L0 = SC().logo(k);
      return { q: 'In Linear B, the sign ' + su(L0.u, 2) + ' stands alone before a number and means ' + Q(L0.en) + '. What kind of sign is it?', a: mc(KINDS[0], KINDS.slice(1).concat(['A punctuation mark']), 4), steps: ['It stands for a whole thing, ' + L0.en + ', and says what is counted.', 'A sign for a whole word or thing is a logogram.'], hint: 'Does the sign stand for a thing or for a sound?' };
    }
    if (r === 1) {
      var w = R.pick(['ko-no-so', 'ti-ri-po', 'pa-te', 'a-mi-ni-so', 'ka-ko', 'po-ro', 'me-ri', 'wo-no']), parts = w.split('-'), i = R.int(0, parts.length - 1);
      return { q: 'In the word ' + sb(w) + ' (' + tl(w) + '), what kind of sign is the sign for ' + tl(parts[i]) + '?', a: mc(KINDS[1], [KINDS[0], KINDS[2], 'A number'], 4), steps: [tl(parts[i]) + ' stands for a syllable: ' + (parts[i].length > 1 ? 'a consonant and a vowel' : 'a vowel alone') + '.', 'Linear B spells words with syllable signs.'], hint: 'Count the sounds one sign stands for.' };
    }
    if (r === 2 && lv(ctx) > 1) {
      var c = R.int(8, 14);
      return { q: 'A syllabary has a sign for each of the 5 vowels alone and a sign for each of ' + c + ' consonants followed by each of the 5 vowels. At most, how many sound signs does it need?', a: num(5 + 5 * c), steps: ['Vowels alone: 5 signs.', 'Consonant plus vowel: ' + c + ' × 5 = ' + (5 * c) + ' signs.', 'Total: 5 + ' + (5 * c) + ' = ' + (5 + 5 * c) + '.'], hint: 'Think of the grid: rows times columns, plus the vowel row.' };
    }
    var n = R.pick([[24, 2], [26, 2], [22, 2], [60, 1], [87, 1], [56, 1], [700, 0], [1000, 0]]);
    return { q: 'A script uses about ' + commas(n[0]) + ' different signs over and over. What kind of script is it most likely?', a: mc(['Mostly word signs (logograms)', 'A syllabary', 'An alphabet'][n[1]], ['Mostly word signs (logograms)', 'A syllabary', 'An alphabet', 'A code with no sounds'], 4), steps: ['An alphabet needs about 20 to 30 signs, a syllabary several dozen, a word-sign script hundreds or more.', 'About ' + commas(n[0]) + ' signs fits ' + ['a script of word signs', 'a syllabary', 'an alphabet'][n[1]] + '.'], hint: 'Languages have a few dozen sounds, more syllables and thousands of words.' };
  });

  G('aegean.how-syllabary-works', function (R, ctx) {
    var r = R.int(0, 2), S0;
    if (r === 0) {
      S0 = R.pick(gridSigns(['d', 'k', 'm', 'n', 'p', 's', 't', 'r']));
      return { q: 'In the Linear B grid, which value is in the <b>' + S0.c + '</b> row and the <b>' + S0.vw + '</b> column?', a: txt(S0.v), steps: ['The row gives the consonant: ' + S0.c + '.', 'The column gives the vowel: ' + S0.vw + '.', 'Together: ' + S0.v + ', written ' + S0.u + '.'], hint: 'Consonant from the row, vowel from the column.' };
    }
    if (r === 1) {
      S0 = R.pick(gridSigns(['k', 'm', 'n', 'p', 's', 't', 'r']));
      var same = R.pick(gridSigns([S0.c]).filter(function (x) { return x.v !== S0.v; }));
      var others = R.sample(gridSigns(['d', 'k', 'm', 'n', 'p', 's', 't', 'r']).filter(function (x) { return x.c !== S0.c && x.vw !== S0.vw; }), 3);
      return { q: 'Which sign shares its consonant with ' + tl(S0.v) + '?', a: mc(same.v, others.map(function (x) { return x.v; }), 4), steps: ['Signs that share a consonant sit in the same row of the grid.', same.v + ' begins with ' + S0.c + ', like ' + S0.v + '.'], hint: 'Look for the same first letter.' };
    }
    var w = R.pick(Object.keys(SC().WORDS).filter(function (k) { return /^[a-z-]+$/.test(k) && k.split('-').length >= 2 && k.split('-').length <= 6; }));
    return { q: 'How many signs does Linear B use to write ' + tl(w) + '?', a: num(w.split('-').length), steps: ['Each piece between hyphens is one sign: ' + w.split('-').join(', ') + '.', 'That is ' + w.split('-').length + ' signs: ' + SC().toSigns(w) + '.'], hint: 'One sign per syllable.' };
  });

  var CH = [
    { q: 'Cretan hieroglyphs are found mostly on what?', a: 'Seals and sealings', w: ['Temple walls in Egypt', 'Papyrus scrolls', 'Coins', 'Stone libation tables only'], s: ['Most Cretan hieroglyphic inscriptions are short texts on seal stones and the clay they stamped.'] },
    { q: 'Can scholars read Cretan hieroglyphs?', a: 'No; the script is still unread', w: ['Yes, since 1952', 'Yes, with the Rosetta Stone', 'Yes, it is a kind of Greek', 'Yes, it is Egyptian'], s: ['The language is unknown and the texts are few and short.'] },
    { q: 'How are Cretan hieroglyphs related to Egyptian hieroglyphs?', a: 'They are separate scripts that share only the nickname "hieroglyphs"', w: ['They are the same script', 'Cretan hieroglyphs are a copy of Egyptian', 'Egyptian hieroglyphs came from Crete', 'They write the same language'], s: ['Both look picture-like, hence the name.', 'The signs and languages are different.'] },
    { q: 'Which script was used on Crete at the same time as Cretan hieroglyphs for most of their history?', a: 'Linear A', w: ['Linear B', 'The Greek alphabet', 'The Cypriot syllabary', 'Latin'], s: ['Linear A began around 1800 BC and overlapped with the hieroglyphs until about 1700 BC.'] },
    { q: 'Where on Crete were many Cretan hieroglyphic documents found?', a: 'At Malia and Knossos', w: ['At Pylos', 'At Mycenae', 'At Thebes', 'At Enkomi on Cyprus'], s: ['Malia and Knossos have many of them; Pylos, Mycenae and Thebes are mainland sites.'] }
  ];
  G('aegean.cretan-hieroglyphs', function (R, ctx) {
    if (R.int(0, 2) === 0) return orderQ(R, R.shuffle([{ name: 'Cretan hieroglyphs begin', y: -2000, when: 'about 2100 or 1900 BC' }, { name: 'Linear A begins', y: -1800, when: 'about 1800 BC' }, { name: 'Linear B appears', y: -1450, when: 'about 1450 BC' }]), 'events');
    return fact(R, R.pick(CH));
  });

  var FAMILY = [['Linear A', 'An unknown language (Minoan)'], ['Linear B', 'Greek'], ['Cretan hieroglyphs', 'An unknown language'], ['Cypro-Minoan', 'An unknown language'], ['The Cypriot syllabary', 'Greek (and one other local language)']];
  G('aegean.aegean-scripts', function (R, ctx) {
    var r = R.int(0, 3);
    if (r === 0) {
      var f = R.pick(FAMILY);
      var pool = ['Greek', 'An unknown language', 'Latin', 'Egyptian', 'Phoenician'];
      var right = /^Greek/.test(f[1]) ? 'Greek' : 'An unknown language';
      return { q: 'What language does <b>' + f[0] + '</b> write?', a: mcs(R, right, pool, 4), steps: [f[0] + ': ' + f[1].toLowerCase() + '.', 'Of the Aegean scripts, only Linear B and the Cypriot syllabary write Greek.'], hint: 'Two of the family write Greek; the others are unread.' };
    }
    if (r === 1) {
      var p = R.pick([['Linear B', 'Linear A'], ['the Cypriot syllabary', 'Cypro-Minoan']]);
      return { q: 'From which script was ' + p[0] + ' adapted?', a: mc(p[1], ['Linear A', 'Cypro-Minoan', 'The Greek alphabet', 'Phoenician', 'Linear B'].filter(function (x) { return x !== p[1]; }), 4), steps: [p[0].charAt(0).toUpperCase() + p[0].slice(1) + ' grew out of ' + p[1] + '.'], hint: 'Crete: Linear A to Linear B. Cyprus: Cypro-Minoan to the Cypriot syllabary.' };
    }
    if (r === 2) return tfq(R, [
      ['Linear B is the oldest of the Aegean scripts.', false, 'It is the youngest of the Cretan line, adapted from Linear A.'],
      ['The Greek alphabet grew out of Linear B.', false, 'The alphabet came from Phoenician, about four centuries after Linear B died out.'],
      ['The Cypriot syllabary wrote Greek and was read in the 1870s.', true, 'An inscription in both Phoenician and Cypriot Greek helped.'],
      ['Cypro-Minoan is still unread.', true, 'Like Linear A, its language is unknown.'],
      ['Scholars read Linear A with Linear B values by convention, assuming the values carried over with the shapes.', true, 'It is a working guess, not proof.']
    ]);
    var it = R.pick(['Linear A', 'Linear B', 'Cypro-Minoan', 'The Cypriot syllabary']);
    var rd = { 'Linear A': 'No', 'Linear B': 'Yes, since 1952', 'Cypro-Minoan': 'No', 'The Cypriot syllabary': 'Yes, since the 1870s' }[it];
    return { q: 'Can scholars read <b>' + it + '</b>?', a: mc(rd, ['No', 'Yes, since 1952', 'Yes, since the 1870s', 'Yes, since the 1820s'], 4), steps: [it + ': ' + rd + '.'], hint: 'Only the scripts that write Greek can be read.' };
  });

  var ALPHA = [
    { q: 'From which script did the Greeks borrow their alphabet?', a: 'Phoenician', w: ['Linear B', 'Linear A', 'Egyptian hieroglyphs', 'Cretan hieroglyphs'], s: ['The letter names (alpha, beta) echo Phoenician names (ʾalep, bet), and the shapes match.'] },
    { q: 'What did the Greeks add when they adapted the Phoenician letters?', a: 'Letters for vowels', w: ['Signs for whole words', 'Syllable signs', 'Number signs for fractions', 'Nothing'], s: ['Phoenician wrote only consonants.', 'Greek reused some letters for vowels: ʾalep became alpha.'] },
    { q: 'About when did the Greek alphabet appear?', a: 'Around 800 BC', w: ['Around 1450 BC', 'Around 1900 BC', 'Around AD 100', 'Around 1200 BC'], s: ['It appears around 800 BC, about four centuries after the palaces fell.'] },
    { q: 'Why could the alphabet write Greek better than Linear B?', a: 'Each letter is one sound, so clusters and final consonants can be written', w: ['It had more signs', 'It used logograms', 'It was older', 'It was carved in stone'], s: ['Linear B signs always end in a vowel.', 'Letters can write any consonant alone.'] },
    { q: 'About how many letters does the Classical Greek alphabet have?', a: '24', w: ['87', '200', '5', '12'], s: ['The Classical Greek alphabet has 24 letters; Linear B has about 87 syllable signs.'] }
  ];
  G('aegean.greek-alphabet', function (R, ctx) {
    var r = R.int(0, 2);
    if (r === 0) return tfq(R, [
      ['The Greek alphabet grew out of Linear B.', false, 'It came from the Phoenician letters, long after Linear B was forgotten.'],
      ['Between the end of Linear B and the alphabet, Greece had no writing for about four centuries.', true, 'About 1200 to 800 BC.'],
      ['The Phoenician script wrote only consonants.', true, 'Greek added vowels.'],
      ['Linear B and the alphabet both show every sound of a Greek word.', false, 'Only the alphabet does; Linear B leaves many consonants out.']
    ]);
    if (r === 1) {
      var w = R.pick(['ka-ko', 'ku-ru-so', 'pa-te', 'ti-ri-po', 'po-ro']), W = SC().word(w);
      return { q: 'In the Greek alphabet the word for ' + Q(W.en) + ' is ' + W.gr + '. Linear B writes it ' + sb(w) + ', ' + tl(w) + '. Which script shows every sound?', a: mc('The Greek alphabet', ['Linear B', 'Both', 'Neither'], 4), steps: ['The alphabet writes each sound with a letter: ' + W.gr + '.', 'Linear B leaves out consonants that have no vowel after them: ' + w + '.'], hint: 'Compare the number of sounds each one shows.' };
    }
    return fact(R, R.pick(ALPHA));
  });


  /* ================= Unit 3: The Discovery ================= */
  // modern events with whole-number years (from MODERN)
  function modern(keys) { return keys.map(function (k) { var it = SC().item(k); return { name: it.name, y: it.y, when: String(Math.floor(it.y)), key: k }; }); }
  var MOD_INT = ['evans', 'scripta1', 'blegen', 'kober', 'bennett', 'ventris', 'article', 'documents'];
  function yearsBetween(R, keys) {
    var two = R.sample(keys, 2).map(function (k) { return SC().item(k); }).sort(function (a, b) { return a.y - b.y; });
    var d = Math.floor(two[1].y) - Math.floor(two[0].y);
    if (d < 2) return null;
    return { q: '<b>' + esc(two[0].name) + '</b> happened in ' + Math.floor(two[0].y) + ' and <b>' + esc(two[1].name) + '</b> in ' + Math.floor(two[1].y) + '. How many years apart are they?', a: num(d), steps: [Math.floor(two[1].y) + ' − ' + Math.floor(two[0].y) + ' = ' + d + ' years.'], hint: 'Subtract the earlier year from the later one.' };
  }
  var EVANS = [
    { q: 'When did Arthur Evans begin digging at Knossos?', a: 'In March 1900', w: ['In 1876', 'In 1939', 'In 1952', 'In 1800'], s: ['Evans began at Knossos in March 1900 and found tablets within weeks.'] },
    { q: 'What did Evans believe about the language of the Knossos tablets?', a: 'That it was the Minoans\' own language, not Greek', w: ['That it was Greek', 'That it was Egyptian', 'That it was Latin', 'That it was not a language at all'], s: ['Evans was sure the tablets were Minoan, not Greek.', 'Ventris showed in 1952 that Linear B was Greek.'] },
    { q: 'Why did Evans call the scripts "linear"?', a: 'Their signs are drawn with lines rather than pictures', w: ['They were written in straight rows only', 'They were found in a line of rooms', 'They were the first scripts in line to be read', 'They used only straight strokes for numbers'], s: ['Evans named them Linear A and Linear B for their line-drawn signs, unlike the picture-like hieroglyphs.'] },
    { q: 'Why did it take so long for scholars to work on the Knossos tablets?', a: 'Evans published only a few; most appeared in 1952, after his death', w: ['The tablets were lost in the war', 'The tablets were written in invisible ink', 'Nobody was interested', 'Greece banned their study'], s: ['Evans kept most of the tablets for his own publication and did not finish it.', 'Most Knossos texts appeared only in 1952.'] },
    { q: 'What was Evans looking for when he first went to Crete in the 1890s?', a: 'Seal stones engraved with signs', w: ['The tomb of Agamemnon', 'Gold coins', 'The Rosetta Stone', 'The Palace of Nestor'], s: ['He suspected the signs on Cretan seal stones were writing.'] }
  ];
  G('aegean.evans-knossos', function (R, ctx) {
    var r = R.int(0, 3);
    if (r === 0) return orderQ(R, modern(R.sample(['evans', 'blegen', 'ventris', 'documents', 'kober'], 3)));
    if (r === 1 && lv(ctx) > 1) { var y = yearsBetween(R, ['evans', 'scripta1', 'blegen', 'ventris']); if (y) return y; }
    if (r === 2) return tfq(R, [
      ['Evans found the Linear B tablets at Knossos.', true, 'From 1900 on he found thousands.'],
      ['Evans showed that Linear B was Greek.', false, 'He believed it was not Greek; Ventris showed it was, in 1952.'],
      ['Evans named the scripts Linear A and Linear B.', true, 'He sorted the Cretan scripts and named them.'],
      ['Evans recognized the numerals and many of the logograms.', true, 'He saw that the tablets were accounts.']
    ]);
    return fact(R, R.pick(EVANS));
  });

  var BLEGEN = [
    { q: 'What did Carl Blegen find at Pylos in 1939?', a: 'The palace archive room, full of Linear B tablets', w: ['Linear A tablets', 'The Rosetta Stone', 'A Greek alphabet inscription', 'The tomb of Minos'], s: ['On the first day of digging, his team found the archive room.'] },
    { q: 'Why did the Pylos tablets matter so much?', a: 'They showed Linear B was used on the mainland too, not only on Crete', w: ['They were written in Linear A', 'They were bilingual', 'They named the Trojan War', 'They were the oldest tablets known'], s: ['Pylos is far from Crete, in the heart of later Greek-speaking land.', 'That made Greek a reasonable guess for Linear B.'] },
    { q: 'Why did the digging at Pylos stop after 1939?', a: 'The Second World War', w: ['The tablets were all found', 'An earthquake', 'Evans forbade it', 'The palace was flooded'], s: ['The war halted work; it resumed in 1952.'] },
    { q: 'Who published the Pylos tablets in 1951 with a standard sign list?', a: 'Emmett Bennett', w: ['Arthur Evans', 'Michael Ventris', 'John Chadwick', 'Alice Kober'], s: ['Bennett\'s edition of 1951 gave scholars good copies of the Pylos texts.'] }
  ];
  G('aegean.blegen-pylos', function (R, ctx) {
    var r = R.int(0, 3);
    if (r === 0) {
      var mp = mapPick(R, 'pylos', R.sample(['knossos', 'mycenae', 'thebes', 'zakros', 'chania', 'phylakopi'], 3), 'aegean');
      return { q: 'Which lettered place on the map is <b>Pylos</b>, where Blegen found the archive?', viz: mp.viz, a: mp.a, steps: ['Pylos is on the west coast of the Peloponnese: place ' + mp.letter + '.', site('pylos').note], hint: 'The southwest corner of the mainland.' };
    }
    if (r === 1) { var y = yearsBetween(R, ['evans', 'blegen', 'bennett', 'ventris', 'documents']); if (y) return y; }
    if (r === 2) return orderQ(R, modern(R.sample(['evans', 'blegen', 'bennett', 'ventris'], 3)));
    return fact(R, R.pick(BLEGEN));
  });

  var CLAY_TF = [
    ['Linear B tablets were fired in kilns on purpose so they would last.', false, 'They were sun-dried working notes; fires that destroyed the palaces baked them.'],
    ['Unbaked clay tablets could be softened and reused.', true, 'They were meant for one season\'s records.'],
    ['The fire that destroyed Pylos baked about a thousand tablets.', true, 'Heat turned the soft clay hard.'],
    ['The tablets of an archive record many centuries of history.', false, 'They are a snapshot of roughly the palace\'s last year.'],
    ['Most clay tablets ever written have crumbled away.', true, 'Only those baked by fire survived well.']
  ];
  var CLAY = [
    { q: 'Why have the Linear B tablets survived?', a: 'The fires that destroyed the palaces baked them hard', w: ['They were carved in stone', 'They were fired in kilns to last', 'They were kept in sealed jars by later Greeks', 'They were copied onto papyrus'], s: ['The tablets were sun-dried clay.', 'Fire baked them, as a kiln bakes a pot.'] },
    { q: 'What time does a burned archive record?', a: 'Roughly the palace\'s last months before the fire', w: ['The whole history of the palace', 'The year the palace was founded', 'The time of Homer', 'Exactly the year 1200 BC'], s: ['Tablets were working notes for the current season.', 'The fire caught them as they were.'] },
    { q: 'Why are Linear A inscriptions so few?', a: 'Unbaked clay crumbled; only texts baked by fire or cut in stone lasted', w: ['The Minoans rarely wrote', 'They were all taken to Egypt', 'Evans threw most away', 'They were written in ink'], s: ['Clay that was not baked returned to mud or was reused.'] }
  ];
  G('aegean.clay-and-fire', function (R, ctx) { return R.coin() ? tfq(R, CLAY_TF) : fact(R, R.pick(CLAY)); });


  /* ================= Unit 4: The Decipherment ================= */
  G('aegean.sign-numbers', function (R, ctx) {
    var r = R.int(0, 2), g = gridSigns();
    if (r === 0 || lv(ctx) === 1) {
      var S0 = R.pick(g);
      return { q: 'The sign ' + su(S0.u, 2) + ' is number <b>' + S0.n + '</b> in Bennett\'s list. What is its value?', a: txt(S0.v), steps: [S0.n + ' is the sign read ' + S0.v + ' (the ' + (S0.c ? S0.c + ' row' : 'vowel row') + ', ' + S0.vw + ' column).', 'The number is only a label; the value came from the decipherment.'], hint: 'Picture the sign\'s place in the grid.' };
    }
    if (r === 1) {
      var S1 = R.pick(g), oth = R.sample(g.filter(function (x) { return x.n !== S1.n; }), 6).map(function (x) { return x.n; });
      return { q: 'Which Bennett number belongs to the sign read ' + tl(S1.v) + ', ' + su(S1.u, 1.8) + '?', a: mc(S1.n, oth, 4), steps: [S1.v + ' is ' + S1.n + '.', 'Scholars use the numbers so that everyone means the same sign.'], hint: 'Bennett numbers are labels; you learn them sign by sign.' };
    }
    var U = R.pick(SC().SIGNS.filter(function (s) { return s.kind === 'unread'; })), S2 = R.pick(g.filter(function (x) { return x.c; })), first = R.coin();
    var t = first ? U.n + '-' + S2.v : S2.v + '-' + U.n;
    return { q: 'A word has ' + (first ? 'the unread sign ' + U.n + ' followed by ' + tl(S2.v) : tl(S2.v) + ' followed by the unread sign ' + U.n) + ': ' + sb(t) + '. How do scholars transliterate it?', a: txt(t), steps: ['A sign without an agreed value is written by its number with an asterisk.', 'Signs are joined by hyphens: ' + t + '.'], hint: 'Number with an asterisk, then a hyphen.' };
  });

  // made-up triplets built the way Kober's sets work: stem + C·o / stem + C·i-jo / stem + C·i-ja
  var KOB_C = ['s', 'n', 't', 'r', 'm', 'p', 'k', 'd'];
  function kober(R) {
    var c = R.pick(KOB_C), stem = R.sample(gridSigns(['d', 'k', 'm', 'n', 'p', 'r', 's', 't', 'w']).concat(gridSigns([''])).filter(function (x) { return x.c !== c; }), R.int(1, 3)).map(function (x) { return x.v; });
    var w1 = stem.concat([c + 'o']), w2 = stem.concat([c + 'i', 'jo']), w3 = stem.concat([c + 'i', 'ja']);
    return { c: c, w: [w1, w2, w3] };
  }
  function kobQ(K) { return 'Three made-up words of the kind Alice Kober studied (one stem, three forms): <br><b>Word 1</b> ' + sb(K.w[0].join('-')) + '<br><b>Word 2</b> ' + sb(K.w[1].join('-')) + '<br><b>Word 3</b> ' + sb(K.w[2].join('-')) + '<br>'; }
  G('aegean.kober-triplets', function (R, ctx) {
    var K = kober(R), r = R.int(0, 2), ord = ['1st', '2nd', '3rd', '4th', '5th'];
    var vals = 'Read today, the words are ' + K.w.map(function (w) { return w.join('-'); }).join(', ') + '.';
    var L1 = K.w[0].length, oN = ord[L1 - 1];
    if (r === 0 || lv(ctx) === 1) return { q: kobQ(K) + 'Words 2 and 3 have one more sign than Word 1, and the last sign of Word 1 (its ' + oN + ') is different from the ' + oN + ' sign of Words 2 and 3. By Kober\'s reasoning, which sign of Word 2 shares a consonant with the last sign of Word 1?', a: mc('Its ' + oN + ' sign', ord.slice(0, L1 + 1).filter(function (o) { return o !== oN; }).map(function (o) { return 'Its ' + o + ' sign'; }).concat(['None of them']), 6, true), steps: ['The first ' + (L1 - 1 === 1 ? 'sign is' : (L1 - 1) + ' signs are') + ' the stem, the same in all three words.', 'The stem ends in a consonant, which must be written with a vowel: one vowel in Word 1, another in Words 2 and 3.', 'So the ' + oN + ' signs, the "bridge", share that consonant.', vals + ' The bridge signs are ' + K.c + 'o and ' + K.c + 'i.'], hint: 'Where does the ending begin to change?' };
    if (r === 1) return { q: kobQ(K) + 'The last signs of Words 2 and 3 are different. Following Kober, what do they most likely share?', a: mc('A consonant (they differ in vowel)', ['A vowel (they differ in consonant)', 'Nothing at all', 'They are the same sign drawn two ways'], 4), steps: ['Words 2 and 3 are the same word with two different endings (as in masculine and feminine).', 'The endings differ in their vowel but share a consonant.', vals + ' The last signs are jo and ja: both j.'], hint: 'Think of endings like -ios and -ia.' };
    return { q: kobQ(K) + 'Kober found sets like this without knowing any sound values. What did such sets let her prove?', a: mc('That words change their endings, and which signs share a consonant', ['The sound value of every sign', 'That the language was Greek', 'That the language was Etruscan', 'The meaning of each word'], 4), steps: ['The sets show a stem with changing endings: the language is inflected.', 'The changing "bridge" signs must share a consonant.', 'She assigned no sounds; that came later.'], hint: 'She avoided guessing sounds.' };
  });

  G('aegean.the-grid', function (R, ctx) {
    var r = R.int(0, 2), g = gridSigns(['d', 'k', 'm', 'n', 'p', 'r', 's', 't', '']);
    if (r < 2 || lv(ctx) === 1) {
      var T0, A0, B0, tries = 0;
      do { T0 = R.pick(g.filter(function (x) { return x.c; })); A0 = R.pick(g.filter(function (x) { return x.c === T0.c && x.v !== T0.v; })); B0 = R.pick(g.filter(function (x) { return x.vw === T0.vw && x.c !== T0.c; })); } while ((!A0 || !B0) && tries++ < 20);
      return { q: 'In Ventris\'s grid, sign X is in the same row as ' + tl(A0.v) + ' and the same column as ' + tl(B0.v) + '. What is the value of X?', a: txt(T0.v), steps: ['Same row as ' + A0.v + ': X begins with ' + T0.c + '.', 'Same column as ' + B0.v + ': X ends in ' + T0.vw + '.', 'So X is ' + T0.v + ', ' + T0.u + '.'], hint: 'Rows share a consonant; columns share a vowel.' };
    }
    var S0 = R.pick(g.filter(function (x) { return x.c; })), rowv = gridSigns([S0.c]).map(function (x) { return x.v; });
    return { q: 'A row of the grid holds ' + rowv.length + ' signs whose values are not yet known. You learn that one of them is ' + tl(S0.v) + '. What do you now know about the others in that row?', a: mc('They all begin with ' + S0.c, ['They all end in ' + S0.vw, 'They are all vowels', 'Nothing: rows are not related', 'They are all read ' + S0.v], 4), steps: ['Signs in one row share a consonant.', S0.v + ' begins with ' + S0.c + ', so the row is ' + rowv.join(', ') + '.'], hint: 'What do signs in a row share?' };
  });

  var PLACES = ['ko-no-so', 'a-mi-ni-so', 'tu-ri-so', 'pa-i-to', 'pu-ro', 'ku-do-ni-ja', 'te-qa'];
  function placeName(k) { return SC().word(k).en.replace(/ \(.*\)$/, '').replace(/,.*$/, ''); }
  G('aegean.place-names', function (R, ctx) {
    var r = R.int(0, 2), k = R.pick(PLACES.slice(0, lv(ctx) === 1 ? 3 : PLACES.length));
    if (r === 0) return { q: 'Read this place name, written in Linear B. Type its transliteration.', viz: signsViz(k, { number: true }), a: txt(k), steps: k.split('-').map(function (v, i) { return 'Sign ' + (i + 1) + ': ' + v + '.'; }).concat([k + ' is ' + placeName(k) + '.']), hint: 'Read sign by sign and join with hyphens.' };
    if (r === 1) return { q: 'Which place is ' + tl(k) + ', ' + sb(k) + '?', a: mcs(R, placeName(k), PLACES.map(placeName).concat(['Mycenae', 'Athens', 'Tiryns']), 4), steps: [k + ' is ' + SC().word(k).en + '.', SC().word(k).note || 'Read it through the spelling rules.'], hint: 'Add back a final s; read r as l and p as ph where needed.' };
    var kk = R.pick(['ko-no-so', 'a-mi-ni-so', 'tu-ri-so']), parts = kk.split('-'), i = R.int(0, parts.length - 1);
    return { q: 'Ventris guessed that ' + sb(kk) + ' was ' + placeName(kk) + '. If so, what value must sign ' + (i + 1) + ' have?', a: txt(parts[i]), steps: [placeName(kk) + ' in open syllables is ' + kk + '.', 'Sign ' + (i + 1) + ' is ' + parts[i] + '.'], hint: 'Write the name the Linear B way, then count the signs.' };
  });

  var ANN = [
    { q: 'What did Michael Ventris announce on BBC radio on 1 July 1952?', a: 'That the Linear B tablets were written in Greek', w: ['That Linear A was Greek', 'That Linear B was Etruscan', 'That he had found new tablets', 'That the tablets were forgeries'], s: ['He said the Knossos and Pylos tablets were in an early, difficult Greek.'] },
    { q: 'What language did Ventris expect Linear B to be before 1952?', a: 'Something related to Etruscan', w: ['Greek', 'Latin', 'Egyptian', 'Hebrew'], s: ['His 1940 article argued for a link with Etruscan.', 'The Greek results surprised him.'] },
    { q: 'Who joined Ventris after the broadcast, bringing expert knowledge of early Greek?', a: 'John Chadwick', w: ['Arthur Evans', 'Carl Blegen', 'Alice Kober', 'Emmett Bennett'], s: ['Chadwick, a Cambridge scholar of early Greek, heard the talk and wrote to Ventris.'] },
    { q: 'What did Ventris and Chadwick publish in 1953?', a: '"Evidence for Greek Dialect in the Mycenaean Archives"', w: ['Scripta Minoa', 'The Pylos Tablets', 'The Iliad', 'Work Notes on Linear A'], s: ['Their article appeared in the Journal of Hellenic Studies in 1953.'] },
    { q: 'Why does Ventris\'s surprise at the result make his case stronger?', a: 'The evidence pushed him to Greek against his own expectation', w: ['Surprise proves nothing either way', 'He wanted Greek all along', 'Chadwick told him what to find', 'The BBC checked his work'], s: ['He expected Etruscan.', 'Greek was the answer the grid forced on him, not one he forced on it.'] },
    { q: 'What was Ventris\'s profession?', a: 'Architect', w: ['Archaeologist', 'Professor of Greek', 'Codebreaker', 'Museum curator'], s: ['Ventris was an architect who worked on Linear B in his spare time.'] }
  ];
  G('aegean.announcement-1952', function (R, ctx) {
    var r = R.int(0, 2);
    if (r === 0) return orderQ(R, modern(R.sample(['kober', 'bennett', 'ventris', 'article', 'documents'], lv(ctx) === 3 ? 4 : 3)));
    if (r === 1 && lv(ctx) > 1) { var y = yearsBetween(R, ['evans', 'blegen', 'kober', 'ventris', 'documents']); if (y) return y; }
    return fact(R, R.pick(ANN));
  });

  function segIndex(T, w) { var i = 0, found = -1; T.lines.forEach(function (L) { L.segs.forEach(function (s) { if (found < 0 && s.w === w) found = i; i++; }); }); return found; }
  var HANDLES = [['qe-to-ro-we', 4], ['ti-ri-jo-we', 3], ['a-no-we', 0], ['o-wo-we', 1], ['ti-ri-o-we-e', 3]];
  G('aegean.tripod-tablet', function (R, ctx) {
    var T = SC().tablet('ta641'), r = R.int(0, 6);
    if (r === 6) {
      var ws = [], ii = 0; T.lines.forEach(function (L) { L.segs.forEach(function (sg) { if (sg.w && sg.w !== 'ke-ka-u-me-no') ws.push([ii, sg.w]); ii++; }); });
      var pk = R.pick(ws), WW = SC().word(pk[1]);
      return { q: 'Read the highlighted word on Pylos tablet Ta 641. Type its transliteration.', viz: { name: 'sc-tablet', opts: { tablet: 'ta641', quiet: true, interactive: false, highlight: [pk[0]] } }, a: txt(pk[1]), steps: ['The highlighted signs are ' + pk[1].split('-').join(', ') + '.', pk[1] + (WW ? ': ' + (WW.grl ? WW.grl + ', ' : '') + Q(WW.en) + '.' : '.')], hint: 'Read sign by sign; a2 and a3 are special signs.' };
    }
    if (r === 4) {
      var sz = R.pick([['me-zo-e', 'larger'], ['me-wi-jo', 'smaller']]);
      return { q: 'On Ta 641 some cups are described as ' + tl(sz[0]) + '. Does that word mean larger or smaller?', viz: { name: 'sc-tablet', opts: { tablet: 'ta641', quiet: true, interactive: false, highlight: [segIndex(T, sz[0])] } }, a: mc(cap(sz[1]), [sz[1] === 'larger' ? 'Smaller' : 'Larger', 'With handles', 'Burnt'], 4), steps: [sz[0] + ' is Greek ' + SC().word(sz[0]).grl + ', ' + Q(SC().word(sz[0]).en) + '.', 'Ta 641 sorts its cups into larger ones (me-zo-e) and smaller ones (me-wi-jo).'], hint: 'me-zo- is related to Greek meizon; me-wi- to meion.' };
    }
    if (r === 5) {
      var what = R.pick([['*202VAS', 'cups (di-pa)', 6], ['*201VAS', 'tripods', 4]]);
      var parts = []; T.lines.forEach(function (L) { L.segs.forEach(function (sg, i) { if (sg.l === what[0]) { var nx = L.segs[i + 1]; parts.push(nx && nx.n !== undefined ? nx.n : 1); } }); });
      var tot = parts.reduce(function (x, y) { return x + y; }, 0);
      return { q: 'Count the ' + what[1] + ' on Ta 641: add the numbers after each ' + (what[0] === '*202VAS' ? 'cup' : 'tripod') + ' sign. (Count a sign with a broken or missing number as 1.)', viz: { name: 'sc-tablet', opts: { tablet: 'ta641', quiet: true, interactive: false } }, a: num(tot), steps: ['The numbers after the signs are ' + parts.join(', ') + '.', parts.join(' + ') + ' = ' + tot + '.'], hint: 'Find each vessel sign and the strokes after it.' };
    }
    if (r === 0 || r === 1) {
      var h = R.pick(HANDLES), W = SC().word(h[0]), ix = segIndex(T, h[0]);
      return { q: 'On Pylos tablet Ta 641, the highlighted word is ' + tl(h[0]) + '. How many handles should the vessel beside it have?', viz: { name: 'sc-tablet', opts: { tablet: 'ta641', quiet: true, interactive: false, highlight: [ix] } }, a: num(h[1]), steps: [h[0] + ' is Greek ' + W.grl + ', ' + Q(W.en) + '.', '-o-we means "eared", that is, handled; the first part gives the number.', 'So ' + h[1] + ' handle' + (h[1] === 1 ? '' : 's') + ', as the picture shows.'], hint: 'ti-ri- is three, qe-to-ro- is four, a-no- is none, o-wo- is one.' };
    }
    if (r === 2) {
      var m = R.pick([['ti-ri-po-de', 'two tripods', 2], ['di-pa-e', 'two cups', 2], ['qe-to', 'jars', 3]]);
      var ixs = segIndex(T, m[0]);
      return { q: 'On Ta 641 the word ' + tl(m[0]) + ' (' + m[1] + ') stands before a vessel sign. What number follows the sign?', viz: { name: 'sc-tablet', opts: { tablet: 'ta641', quiet: true, interactive: false, highlight: [ixs] } }, a: num(m[2]), steps: [m[0] + ' means ' + m[1] + '.', 'The scribe wrote the vessel logogram and then ' + m[2] + '.', m[2] === 2 ? 'A dual form, for exactly two, matches the number 2.' : 'Count the strokes after the jar sign: 3.'], hint: 'Find the word, then the logogram and the strokes after it.' };
    }
    return fact(R, R.pick([
      { q: 'Why was Ta 641 such strong evidence for the decipherment?', a: 'Words read with Ventris\'s values matched the pictured vessels', w: ['It was a bilingual with Egyptian', 'Ventris wrote it himself', 'It named the Trojan War', 'It was found by Evans in 1900'], s: ['The tablet has pictures anyone can see and words that need the values.', 'The values were fixed before the tablet was read, and the words matched.'] },
      { q: 'What did Blegen write to Ventris about Ta 641 in May 1953?', a: 'That the words matched the pictures, "too good to be true"', w: ['That the tablet was a fake', 'That the words were Etruscan', 'That the tablet could not be read', 'That Linear A was solved'], s: ['Blegen asked, "Is coincidence excluded?"'] },
      { q: 'Did every specialist accept the decipherment at once?', a: 'No: most were convinced within a few years, but some doubted it for a long time', w: ['Yes, everyone agreed in 1952', 'No one accepted it until 2000', 'Only Evans accepted it', 'It has never been accepted'], s: ['Acceptance grew as tests like Ta 641 came in.'] },
      { q: 'On Ta 641, what does qe-to-ro-we show about the q signs?', a: 'They write kʷ, the first sound of early Greek "four", as in Latin quattuor', w: ['They write a modern English q', 'They write a silent letter', 'They write th', 'They are logograms'], s: ['qe-to-ro-we, "four-handled", stands by a four-handled cup.', 'Its q matches the kʷ of "four".'] }
    ]));
  });


  /* ================= Unit 5: The Linear B Signs ================= */
  // "what is this sign?" (typed) or "which numbered sign is X?" (mc) for a set of signs
  function signValueQ(R, set, ctx, what) {
    var S0 = R.pick(set), r = R.int(0, 2);
    if (r === 0 || lv(ctx) === 1) return { q: 'What is the value of this Linear B sign? ' + su(S0.u, 2.4), a: txt(S0.v), steps: ['This is ' + S0.n + ', read ' + S0.v + (S0.c ? ' (the ' + S0.c + ' row, ' + S0.vw + ' column)' : '') + '.'], hint: what || 'Picture the sign in the grid.' };
    if (r === 1) {
      var four = R.shuffle([S0].concat(R.sample(set.filter(function (x) { return x.v !== S0.v; }), 3)));
      return { q: 'Which of the numbered signs is ' + tl(S0.v) + '?', viz: signsViz(four.map(function (x) { return x.v; }).join(' '), { number: true }), a: { t: 'mc', choices: ['Sign 1', 'Sign 2', 'Sign 3', 'Sign 4'], v: four.indexOf(S0), keep: true }, steps: [S0.v + ' is ' + S0.u + ', sign ' + (four.indexOf(S0) + 1) + '.', 'The others are ' + four.filter(function (x) { return x !== S0; }).map(function (x) { return x.v; }).join(', ') + '.'], hint: what || 'Compare the details of each shape.' };
    }
    // read a word whose signs all come from the set (plus the vowels)
    var ok = {}; set.concat(gridSigns([''])).forEach(function (x) { ok[x.v] = 1; });
    var cand = Object.keys(SC().WORDS).filter(function (k) { return k.split('-').length >= 2 && k.split('-').every(function (v) { return ok[v]; }); });
    if (!cand.length) return signValueQ(R, set, { level: 1 }, what);
    var w = R.pick(cand);
    return { q: 'Read this word sign by sign and type its transliteration.', viz: signsViz(w, { number: true }), a: txt(w), steps: w.split('-').map(function (v, i) { return 'Sign ' + (i + 1) + ': ' + v + '.'; }).concat([w + ' is ' + (SC().word(w).grl ? '<i>' + SC().word(w).grl + '</i>, ' : '') + Q(SC().word(w).en) + '.']), hint: 'Join the values with hyphens.' };
  }
  var VHINT = 'a: arms bent down; e: a peak with a box; i: three prongs and a crossbar; o: a pennant; u: a hook on a stem.';
  G('aegean.vowels', function (R, ctx) {
    if (R.coin()) return signValueQ(R, gridSigns(['']), ctx, VHINT);
    var V5 = { a: 1, e: 1, i: 1, o: 1, u: 1 };
    var cand = Object.keys(SC().WORDS).filter(function (k) { var p = k.split('-'); return p.length >= 2 && p.length <= 5 && p.filter(function (v) { return V5[v]; }).length === 1 && p.every(function (v) { return SC().sign(v); }); });
    var w = R.pick(cand), parts = w.split('-'), i = parts.findIndex(function (v) { return V5[v]; });
    if (R.coin()) return { q: 'One sign in this word is a vowel alone. Which numbered sign is it?', viz: signsViz(w, { number: true }), a: { t: 'mc', choices: parts.map(function (_, j) { return 'Sign ' + (j + 1); }), v: i, keep: true }, steps: ['The word is ' + w + '.', 'Sign ' + (i + 1) + ' is the vowel ' + parts[i] + ', ' + SC().sign(parts[i]).u + '.'], hint: VHINT };
    return { q: 'Sign ' + (i + 1) + ' of this word is a vowel alone. Which vowel is it?', viz: signsViz(w, { number: true }), a: txt(parts[i]), steps: ['Sign ' + (i + 1) + ' is ' + SC().sign(parts[i]).n + ', the vowel ' + parts[i] + '.', 'The word is ' + w + ' (' + SC().word(w).en + ').'], hint: VHINT };
  });
  G('aegean.first-rows', function (R, ctx) { return signValueQ(R, gridSigns(lv(ctx) === 1 ? ['d', 'k', 'p'] : ['d', 'k', 'm', 'n', 'p']), ctx, 'Learn each sign with an anchor word: ka-ko, ko-no-so, pa-te, ma-te, di-pa.'); });
  var ROWQ = [
    { q: 'In Linear B, which sounds do the r signs write?', a: 'Both r and l', w: ['Only r', 'Only l', 'r and n', 'A rolled r only'], s: ['Linear B had one set of signs for r and l: me-ri is meli, honey.'] },
    { q: 'What do the q signs of Linear B write?', a: 'The old Greek labiovelars kʷ, gʷ and kʷʰ', w: ['The English sound "kw" as in queen', 'A silent letter', 'The sound th', 'The sound q in Arabic'], s: ['q writes kʷ-type sounds, which later Greek turned into p, b, t or d: qa-si-re-u became basileus.'] },
    { q: 'What sound does the z row of Linear B write?', a: 'A sound like dz, later written ζ', w: ['The English z of "zoo"', 'The sound ts', 'A silent sound', 'The sound sh'], s: ['z writes a dz-like sound, as in to-pe-za, table.'] },
    { q: 'Why does Linear B have no signs for ji, wu or qu?', a: 'Those syllables were rare or did not occur, so no sign was kept', w: ['The signs were lost', 'Scribes were forbidden to write them', 'They were written as logograms', 'Evans removed them'], s: ['A script keeps the signs its writers need.'] },
    { q: 'Which later Greek word does qa-si-re-u become?', a: 'basileus', w: ['kasileus', 'quasileus', 'gasileus', 'tasileus'], s: ['q writes an old gʷ, which became b: gʷasileus → basileus.'] }
  ];
  G('aegean.more-rows', function (R, ctx) { if (R.int(0, 3) === 0) return fact(R, R.pick(ROWQ)); return signValueQ(R, gridSigns(['j', 'q', 'r', 's', 't', 'w', 'z']), ctx, 'Anchor words: me-ri (r), qa-si-re-u (q), to-pe-za (z), wo-no (w), si-to (s).'); });

  var SPECIALS = function () { return SC().SIGNS.filter(function (s) { return s.kind === 'special'; }); };
  G('aegean.special-signs', function (R, ctx) {
    var sp = SPECIALS(), S0 = R.pick(sp), r = R.int(0, 3);
    if (r === 0) return { q: 'This is one of the special signs of Linear B: ' + su(S0.u, 2.4) + '. How is it transliterated?', a: txt(S0.v), steps: ['It is ' + S0.n + ', transliterated ' + S0.v + ' and read ' + S0.say + '.'], hint: 'Special signs are written with a value and sometimes a digit, like a2.' };
    if (r === 1) {
      var withD = sp.filter(function (x) { return /\d/.test(x.v); }), S1 = R.pick(withD);
      return { q: 'How is the special sign ' + tl(S1.v) + ' read?', a: mcs(R, S1.say, withD.map(function (x) { return x.say; }).concat(['a2 twice', 'the number two']), 4), steps: [S1.v + ' (' + S1.n + ') is read ' + S1.say + '.', 'The digit names a second or third sign related to a syllable; it is not a sound.'], hint: 'a2 is ha, a3 is ai, pu2 is phu.' };
    }
    if (r === 2) {
      var w = R.pick(['e-ma-a2', 'a3-ku-pi-ti-jo', 'ke-re-a2']);
      return { q: 'Read this word, which contains a special sign. Type its transliteration.', viz: signsViz(w, { number: true }), a: txt(w), steps: w.split('-').map(function (v, i) { return 'Sign ' + (i + 1) + ': ' + v + (SC().sign(v).kind === 'special' ? ' (a special sign, read ' + SC().sign(v).say + ')' : '') + '.'; }).concat([w + ': ' + SC().word(w).en + '.']), hint: 'Type a special sign with its digit: a2, a3.' };
    }
    return tfq(R, [
      ['Scribes had to use the special signs whenever they could.', false, 'They were optional; olive oil appears both as e-ra-wo and as e-ra3-wo.'],
      ['a2 is read ha.', true, 'It is sign *25.'],
      ['a3 is read ai.', true, 'It is sign *43, as in a3-ku-pi-ti-jo.'],
      ['The digit in a2 tells you to say the sound twice.', false, 'It only names a second sign related to a; a2 is read ha.'],
      ['Some special signs write consonant clusters, such as two and dwe.', true, 'They write tw and dw before a vowel.']
    ]);
  });

  G('aegean.unread-signs', function (R, ctx) {
    var un = SC().SIGNS.filter(function (s) { return s.kind === 'unread'; }), r = R.int(0, 3);
    if (r === 0) {
      var U = R.pick(un), oth = R.sample(gridSigns(), 3);
      var four = R.shuffle([U].concat(oth));
      return { q: 'One of these signs has no agreed value. Which one?', viz: signsViz(four.map(function (x) { return x.v || x.n; }).join(' '), { number: true }), a: { t: 'mc', choices: ['Sign 1', 'Sign 2', 'Sign 3', 'Sign 4'], v: four.indexOf(U), keep: true }, steps: ['Sign ' + (four.indexOf(U) + 1) + ' is ' + U.n + ', which has no agreed value' + (U.prop ? ' (perhaps ' + U.prop + ')' : '') + '.', 'The others are ' + oth.map(function (x) { return x.v + ' (' + x.n + ')'; }).join(', ') + '.'], hint: 'The common signs of the grid all have values.' };
    }
    if (r === 1) {
      var U2 = R.pick(un), S2 = R.pick(gridSigns().filter(function (x) { return x.c; })), t = R.coin() ? U2.n + '-' + S2.v : S2.v + '-' + U2.n;
      return { q: 'Transliterate this made-up word, which contains a sign with no agreed value.', viz: signsViz(t, { number: true }), a: txt(t), steps: ['The unread sign is written by its number with an asterisk: ' + U2.n + '.', 'So the word is ' + t + '.'], hint: 'Write the unread sign as *number.' };
    }
    if (r === 2) {
      var P0 = R.pick(un.filter(function (x) { return x.prop; }));
      return { q: 'A book transliterates sign ' + P0.n + ' as ' + tl(P0.prop) + '. How sure is that value?', a: mc('Only proposed: "perhaps ' + P0.prop + '"', ['Certain, like ka or po', 'Proved by the tripod tablet', 'Known from Linear A', 'Certainly wrong'], 4), steps: [P0.n + ' is one of the signs without an agreed value.', P0.prop + ' is a proposal.'], hint: 'Rare signs are hard to test.' };
    }
    return tfq(R, [
      ['The unread signs show that Linear B is not really deciphered.', false, 'They are rare; the common signs give good Greek again and again.'],
      ['A sign with no agreed value is written by its Bennett number, like *18.', true, 'The asterisk number is a neutral label.'],
      ['Rare signs are hard to read because there are few words to test a value on.', true, 'A value is proved by fitting many words.'],
      ['The sign *65 is read ju with full confidence.', false, 'ju is its usual reading, but it is doubtful.']
    ]);
  });


  /* ================= Unit 6: How Linear B Spells Greek ================= */
  /* SPELL: words of the model's WORDS with their Mycenaean sound forms (Latin letters; ʷ marks a labiovelar) and the rules
     each shows: [rule id, what it does in this word]. Rule ids: final, droplr, drops, dropnasal, finalstop, empty, stops,
     lr, h, double, q, z, diphu, diphi, glide, dkeep. alt: other accepted spellings. */
  var SPELL = {
    'ka-ko': ['khalkos', [['droplr', 'the l before k is not written'], ['stops', 'kh is written with the k signs'], ['final', 'the final s is not written']]],
    'ku-ru-so': ['khrusos', [['empty', 'kh and r are split by an empty vowel: ku-ru'], ['stops', 'kh is written with the k signs'], ['final', 'the final s is not written']]],
    'pa-te': ['pater', [['final', 'the final r is not written']]],
    'ti-ri-po': ['tripos', [['empty', 't and r are split by an empty vowel: ti-ri'], ['final', 'the final s is not written']]],
    'pa-ta': ['panta', [['dropnasal', 'the n before t is not written']]],
    'do-ra': ['dora', [['dkeep', 'd has its own signs, kept apart from t']]],
    'ko-no-so': ['Knosos', [['empty', 'k and n are split by an empty vowel: ko-no'], ['final', 'the final s is not written']]],
    'a-mi-ni-so': ['Amnisos', [['empty', 'm and n are split by an empty vowel: mi-ni'], ['final', 'the final s is not written']]],
    'tu-ri-so': ['Tulisos', [['lr', 'l is written with the r signs: ri'], ['final', 'the final s is not written']]],
    'pu-ro': ['Pulos', [['lr', 'l is written with the r signs: ro'], ['final', 'the final s is not written']]],
    'me-ri': ['meli', [['lr', 'l is written with the r signs: ri']]],
    'si-to': ['sitos', [['final', 'the final s is not written']]],
    'ku-mi-no': ['kuminon', [['final', 'the final n is not written']]],
    'ke-ra-me-u': ['kerameus', [['diphu', 'the u of eu is written as its own sign'], ['final', 'the final s is not written']]],
    'ka-ke-u': ['khalkeus', [['droplr', 'the l before k is not written'], ['stops', 'kh is written with the k signs'], ['diphu', 'the u of eu is written as its own sign'], ['final', 'the final s is not written']]],
    'i-je-re-u': ['hiereus', [['h', 'the h is not written'], ['glide', 'a j glide is written between i and e'], ['diphu', 'the u of eu is written as its own sign'], ['final', 'the final s is not written']]],
    'to-ra-ke': ['thorakes', [['stops', 'th is written with the t signs'], ['final', 'the final s is not written']]],
    'pa-ka-na': ['phasgana', [['stops', 'ph is written with the p signs and g with the k signs'], ['drops', 'the s before g is not written']]],
    'e-ke-a': ['enkhea', [['dropnasal', 'the n before kh is not written'], ['stops', 'kh is written with the k signs']]],
    'wo-no': ['woinos', [['diphi', 'the i of oi is left out'], ['final', 'the final s is not written']]],
    'po-ro': ['polos', [['lr', 'l is written with the r signs: ro'], ['final', 'the final s is not written']]],
    'te-o': ['theos', [['stops', 'th is written with the t signs'], ['final', 'the final s is not written']]],
    'e-ra': ['Hera', [['h', 'the h is not written']]],
    'a-re': ['Ares', [['final', 'the final s is not written']]],
    'ko-wo': ['korwos', [['droplr', 'the r before w is not written'], ['final', 'the final s is not written']]],
    'ko-wa': ['korwa', [['droplr', 'the r before w is not written']]],
    'wa-na-ka': ['wanaks', [['finalstop', 'the final k is written with the vowel before it, ka'], ['final', 'the final s is not written']]],
    'wa-na-sa': ['wanassa', [['double', 'the double s is written once']]],
    'qa-si-re-u': ['gʷasileus', [['q', 'gʷ is written with the q signs'], ['lr', 'l is written with the r signs: re'], ['diphu', 'the u of eu is written as its own sign'], ['final', 'the final s is not written']]],
    'ra-wa-ke-ta': ['lawagetas', [['lr', 'l is written with the r signs: ra'], ['stops', 'g is written with the k signs'], ['final', 'the final s is not written']]],
    'e-ra-wo': ['elaiwon', [['lr', 'l is written with the r signs'], ['diphi', 'the i of ai is left out'], ['final', 'the final n is not written']], ['e-ra3-wo']],
    'to-pe-za': ['torpedza', [['droplr', 'the r before p is not written'], ['z', 'dz is written with the z signs']]],
    'a-re-ka-sa-da-ra': ['Aleksandra', [['lr', 'l is written with the r signs'], ['empty', 'k-s and d-r are split by empty vowels: ka-sa, da-ra'], ['dropnasal', 'the n before d is not written']]],
    'po-ti-ni-ja': ['potnia', [['empty', 't and n are split by an empty vowel: ti-ni'], ['glide', 'a j glide is written between i and a']]],
    'ku-do-ni-ja': ['Kudonia', [['glide', 'a j glide is written between i and a']]],
    'qo-u-ko-ro': ['gʷoukoloi', [['q', 'gʷ is written with the q signs'], ['diphu', 'the u of ou is written as its own sign'], ['lr', 'l is written with the r signs'], ['diphi', 'the i of the final oi is left out']]],
    'ke-re-si-jo': ['Kresios', [['empty', 'k and r are split by an empty vowel: ke-re'], ['glide', 'a j glide is written between i and o'], ['final', 'the final s is not written']]],
    'ti-ri-po-de': ['tripode', [['empty', 't and r are split by an empty vowel: ti-ri']]],
    'e-qe-ta': ['hekʷetas', [['h', 'the h is not written'], ['q', 'kʷ is written with the q signs'], ['final', 'the final s is not written']]]
  };
  var RULE_NAME = {
    final: 'A consonant at the end of a word is not written', droplr: 'l and r before another consonant are not written', drops: 's before another consonant is not written',
    dropnasal: 'm and n before a stop are not written', finalstop: 'A final stop is written with the vowel before it', empty: 'A cluster is split by an empty vowel copied from the next syllable',
    stops: 'One sign covers voiced, voiceless and aspirated sounds (k, g, kh; p, b, ph; t, th)', lr: 'r and l share the r signs', h: 'h is not written', double: 'A double consonant is written once',
    q: 'q writes the labiovelars kʷ, gʷ and kʷʰ', z: 'z writes a dz-like sound', diphu: 'The u of a diphthong (au, eu, ou) is written', diphi: 'The i of ai, ei or oi is often left out', glide: 'A glide (j or w) is written between vowels',
    dkeep: 'd is kept apart from t'
  };
  function spellKeys(rules) { return Object.keys(SPELL).filter(function (k) { return !rules || SPELL[k][1].some(function (r) { return rules.indexOf(r[0]) >= 0; }); }); }
  function spellQ(R, k) {
    var e = SPELL[k], W = SC().word(k);
    return { q: 'The Mycenaean word <i>' + esc(e[0]) + '</i> means ' + Q(W.en) + '. How would a scribe spell it in Linear B? Type the transliteration.', a: txt(k, e[2]), steps: e[1].map(function (r) { return cap(r[1]) + '.'; }).concat(['So the spelling is ' + k + (e[2] ? ' (also ' + e[2].join(', ') + ')' : '') + ': ' + SC().toSigns(k) + '.']), hint: 'Split into syllables; drop l, m, n, r, s before a consonant or at the end; split other clusters with the next vowel.' };
  }
  function ruleQ(R, k, only) {
    var e = SPELL[k], rs = e[1].filter(function (r) { return !only || only.indexOf(r[0]) >= 0; }), pick = R.pick(rs.length ? rs : e[1]);
    var has = e[1].map(function (r) { return r[0]; });
    var wrong = Object.keys(RULE_NAME).filter(function (id) { return has.indexOf(id) < 0; }).map(function (id) { return RULE_NAME[id]; });
    var feature = pick[1].replace(/^the /, 'the ');
    return { q: 'In ' + tl(k) + ' (<i>' + esc(e[0]) + '</i>, ' + Q(SC().word(k).en) + '), ' + feature + '. Which rule explains that?', a: mcs(R, RULE_NAME[pick[0]], wrong, 4), steps: [cap(pick[1]) + ': ' + RULE_NAME[pick[0]].charAt(0).toLowerCase() + RULE_NAME[pick[0]].slice(1) + '.'], hint: 'Ask what the script cannot write, then which habit the scribe used.' };
  }
  // which sounds of the spoken word are not written (open syllables)
  function unwritten(k) {
    var said = SPELL[k][0].toLowerCase(), out = [];
    SPELL[k][1].forEach(function (r) { var m = /^the (final )?([a-zʷ]+) (before [a-z]+ )?is not written/.exec(r[1]); if (m) out.push((m[1] ? 'the final ' : 'the ') + m[2] + (m[3] ? ' ' + m[3].trim() : '')); });
    return out;
  }
  G('aegean.open-syllables', function (R, ctx) {
    var r = R.int(0, 2);
    var OKR = ['final', 'droplr', 'dropnasal', 'drops', 'stops', 'lr', 'empty', 'dkeep', 'finalstop', 'z', 'q', 'diphu'];
    var ks = spellKeys(['final', 'droplr', 'dropnasal', 'drops']).filter(function (k) { return unwritten(k).length && SPELL[k][1].every(function (x) { return OKR.indexOf(x[0]) >= 0; }); }), k = R.pick(ks), e = SPELL[k];
    if (r === 0) {
      var right = unwritten(k).join(' and ');
      var pool = ['the first vowel', 'the k sound', 'nothing: every sound is written', 'the last vowel', 'the p sound', 'the t sound'];
      return { q: 'The Mycenaean word <i>' + esc(e[0]) + '</i> is spelled ' + sb(k) + ' (' + tl(k) + '). Which sounds of the word are not written?', a: mcs(R, right, pool, 4), steps: ['Every Linear B sign ends in a vowel, so a consonant with no vowel after it cannot be written alone.', cap(right) + ': not written.'], hint: 'Look for consonants with no vowel after them.' };
    }
    if (r === 1) {
      var said = e[0].toLowerCase(), lastC = /[^aeiou]$/.test(said) ? said.slice(-1) : '';
      var cands = [said, said.replace(/([aeiou])/g, '$1-').replace(/-$/, ''), lastC ? k + '-' + lastC : '', lastC ? k.replace(/-[^-]+$/, function (x) { return x + lastC; }) : '', said.replace(/([aeiou])(?=[^aeiou])/g, '$1-'), k.replace(/^([^-]+)/, function (x) { return x + said.charAt(x.length) ; })];
      var bad = cands.filter(function (x) { return x && x !== k && x.split('-').some(function (v) { return !SC().sign(v) || SC().sign(v).kind === 'unread'; }); });
      return { q: 'Which of these could be a Linear B spelling of <i>' + esc(e[0]) + '</i>?', a: mc(k, bad.filter(function (x) { return x !== k; }).concat(['the word cannot be written at all']), 4), steps: ['A Linear B spelling uses only open syllables: a vowel, or a consonant plus a vowel.', 'The other choices leave consonants without vowels.', 'The spelling is ' + k + '.'], hint: 'Every piece must end in a vowel.' };
    }
    return tfq(R, [
      ['Every Linear B sign ends in a vowel.', true, 'The signs are vowels alone or a consonant plus a vowel.'],
      ['Linear B has a sign for the consonant s alone.', false, 'It has sa, se, si, so and su, but no s alone.'],
      ['ka-ko was pronounced "kako".', false, 'It was khalkos; the spelling leaves out the l and the final s.'],
      ['A reader of Linear B had to supply sounds the spelling left out.', true, 'Knowing the language and the context, the reader filled in the gaps.'],
      ['Linear B spelling shows every sound of a Greek word.', false, 'Final consonants and many clusters are not written as said.']
    ]);
  });
  G('aegean.dropped-consonants', function (R, ctx) {
    var ks = spellKeys(['final', 'droplr', 'dropnasal', 'drops', 'finalstop']), k = R.pick(ks);
    if (lv(ctx) === 1) ks = ['pa-ta', 'ka-ko', 'pa-te', 'si-to', 'ku-mi-no', 'ko-wo', 'a-re', 'to-ra-ke'];
    k = R.pick(ks);
    return R.int(0, 2) ? spellQ(R, k) : ruleQ(R, k, ['final', 'droplr', 'dropnasal', 'drops', 'finalstop']);
  });
  G('aegean.empty-vowels', function (R, ctx) {
    var ks = spellKeys(['empty']), k = R.pick(ks), r = R.int(0, 2);
    if (r === 2) {
      var e = SPELL[k], parts = k.split('-'), said = e[0].toLowerCase();
      // the empty vowel: first syllable whose vowel copies the next one where the spoken word has a cluster
      var pairs = { 'ti-ri-po': 0, 'ti-ri-po-de': 0, 'ko-no-so': 0, 'ku-ru-so': 0, 'a-mi-ni-so': 1, 'po-ti-ni-ja': 1, 'ke-re-si-jo': 0, 'a-re-ka-sa-da-ra': 2 };
      if (pairs[k] !== undefined) {
        var i = pairs[k], v = parts[i].slice(-1);
        return { q: 'In ' + tl(k) + ' (said <i>' + esc(e[0]) + '</i>), which written vowel was not pronounced?', a: mc('The ' + v + ' of ' + parts[i], parts.filter(function (p, j) { return j !== i && /[aeiou]$/.test(p); }).map(function (p) { return 'The ' + p.slice(-1) + ' of ' + p; }).concat(['None: every vowel was said']), 4), steps: ['The spoken word has a cluster where the spelling has ' + parts[i] + '-' + parts[i + 1] + '.', 'The ' + v + ' of ' + parts[i] + ' copies the vowel of ' + parts[i + 1] + ': it is an empty vowel.'], hint: 'Find the cluster in the spoken word.' };
      }
    }
    return r === 1 && lv(ctx) > 1 ? ruleQ(R, k) : spellQ(R, k);
  });
  var MERGE_POOL = [['pa', ['pa', 'ba', 'pha']], ['ka', ['ka', 'ga', 'kha']], ['ta', ['ta', 'tha']], ['ro', ['ro', 'lo']], ['re', ['re', 'le']], ['po', ['po', 'bo', 'pho']], ['ke', ['ke', 'ge', 'khe']], ['ti', ['ti', 'thi']]];
  G('aegean.sound-mergers', function (R, ctx) {
    var r = R.int(0, 3);
    if (r === 0) {
      var m = R.pick(MERGE_POOL), right = m[1].join(', ');
      var wrongs = [m[1][0] + ' only', m[1].concat(['da']).join(', '), m[1].slice(0, 1).concat([m[0].replace(/^./, 'd')]).join(', '), m[1][m[1].length - 1] + ' only'];
      return { q: 'Which syllables could the Linear B sign ' + tl(m[0]) + ' stand for?', a: mc(right, wrongs, 4), steps: ['The ' + m[0][0] + ' row covers ' + ({ p: 'p, b and ph', k: 'k, g and kh', t: 't and th', r: 'r and l' }[m[0][0]]) + '.', 'So ' + m[0] + ' can be ' + right + '.'], hint: 'Only d is kept apart from t.' };
    }
    if (r === 1) return ruleQ(R, R.pick(spellKeys(['stops', 'lr', 'h', 'q', 'dkeep'])), ['stops', 'lr', 'h', 'q', 'dkeep']);
    return spellQ(R, R.pick(spellKeys(['stops', 'lr', 'h', 'q', 'dkeep'])));
  });
  G('aegean.glides-diphthongs', function (R, ctx) {
    var ks = spellKeys(['glide', 'diphu', 'diphi']), k = R.pick(ks);
    if (R.int(0, 2) === 0) return ruleQ(R, k, ['glide', 'diphu', 'diphi']);
    return spellQ(R, k);
  });


  /* ================= Unit 7: Logograms, Numbers and Tablets ================= */
  var SEXED = [['OVIS', 'sheep', 'ram', 'ewe'], ['CAP', 'goat', 'he-goat', 'she-goat'], ['SUS', 'pig', 'boar', 'sow'], ['BOS', 'cattle', 'bull', 'cow'], ['EQU', 'horse', 'stallion', 'mare']];
  function logoMeanings() { return LOGO_COMMON.map(function (k) { return SC().logo(k).en; }); }
  G('aegean.logograms', function (R, ctx) {
    var r = R.int(0, 2), k = R.pick(LOGO_COMMON), L0 = SC().logo(k);
    if (r === 0) return { q: 'This Linear B logogram stands before a number: ' + su(L0.u, 2.6) + '. What does it count?', a: mcs(R, L0.en, logoMeanings().concat(['a syllable, ka', 'the number ten']), 4), steps: ['This is ' + L0.n + ', written ' + k + ' in transliteration: ' + L0.en + '.'], hint: 'Many logograms look like what they mean.' };
    if (r === 1) {
      var lines = [['ti-ri-po', '*201VAS'], ['di-pa', '*202VAS'], ['i-qo', 'EQU'], ['po-ro', 'EQU'], ['e-ra-wo', 'OLE'], ['wo-no', 'VIN'], ['ka-ko', 'AES'], ['ku-ru-so', 'AUR'], ['si-to', 'GRA'], ['qe-to', '*203VAS']], ln = R.pick(lines), n = R.int(2, 12);
      var parts = ln[0].split('-').concat([ln[1], String(n)]), pos = ln[0].split('-').length;
      return { q: 'In this line, which numbered sign is the logogram?', viz: signsViz(ln[0] + ' ' + ln[1] + ' ' + n, { number: true }), a: { t: 'mc', choices: parts.slice(0, pos + 1).map(function (_, i) { return 'Sign ' + (i + 1); }), v: pos, keep: true }, steps: ['Signs 1 to ' + pos + ' spell the word ' + ln[0] + '.', 'Sign ' + (pos + 1) + ' stands alone before the number: the logogram ' + ln[1] + ', ' + SC().logo(ln[1]).en + '.', 'The number is ' + n + '.'], hint: 'The logogram stands alone right before the number.' };
    }
    var easy = ['VIR', 'MUL', 'EQU', 'GRA', 'OLE', 'VIN', 'AES', 'AUR', 'LANA', 'CUR'], kk = R.pick(easy), LL = SC().logo(kk);
    return { q: 'Scholars write each logogram with a short Latin label. What is the label for the logogram meaning ' + Q(LL.en) + ', ' + su(LL.u, 2) + '?', a: mcs(R, kk, easy.concat(['OVIS', 'HORD']), 4), steps: [LL.en + ' is written ' + kk + ' (sign ' + LL.n + ').'], hint: 'VIR man, MUL woman, EQU horse, GRA wheat, OLE oil, VIN wine, AES bronze, AUR gold, LANA wool, CUR chariot.' };
  });

  G('aegean.sex-marks', function (R, ctx) {
    var a = R.pick(SEXED), male = R.coin(), key = a[0] + (male ? 'm' : 'f'), r = R.int(0, 2);
    if (r === 0) {
      var all = []; SEXED.forEach(function (x) { all.push(x[2], x[3]); });
      return { q: 'This logogram is the ' + a[1] + ' sign with a mark for its sex: ' + lgu(key, 2.6) + '. What animal does it count?', a: mc(male ? a[2] : a[3], [male ? a[3] : a[2]].concat(R.shuffle(all.filter(function (x) { return x !== a[2] && x !== a[3]; }))), 4), steps: [key + ': ' + a[1] + ', ' + (male ? 'male' : 'female') + ', so ' + (male ? a[2] : a[3]) + '.', 'Male signs carry two short bars across the stem; female signs have a forked stem.'], hint: 'Look at the animal first, then at the small mark.' };
    }
    if (r === 1) {
      var m = R.int(2, 9) * 10, f = R.int(1, 9) * 10 + R.pick([0, 5]);
      return { q: 'A line ends with ' + lgu(a[0] + 'm', 1.8) + ' ' + nmu(m, 1.6) + ' ' + lgu(a[0] + 'f', 1.8) + ' ' + nmu(f, 1.6) + '. How many ' + (a[1] === 'sheep' ? 'sheep' : a[1] === 'cattle' ? 'cattle' : a[1] + 's') + ' are recorded in all?', a: num(m + f), steps: [a[0] + 'm ' + m + ': ' + m + ' ' + a[2] + 's.', a[0] + 'f ' + f + ': ' + f + ' ' + a[3] + 's.', m + ' + ' + f + ' = ' + (m + f) + '.'], hint: 'Read each logogram with the number right after it, then add.' };
    }
    return tfq(R, [
      ['OVISm and OVISf are two different kinds of animal.', false, 'They are one logogram, sheep, marked male (OVISm, ram) or female (OVISf, ewe).'],
      ['The same male and female marks are used for goats, pigs and cattle.', true, 'CAPm, CAPf, SUSm, SUSf, BOSm, BOSf.'],
      ['EQUf is a mare.', true, 'EQU is horse; f marks a female.'],
      ['BOSm is a cow.', false, 'BOSm is a bull; BOSf is a cow.'],
      ['SUSf is a sow.', true, 'SUS is pig; f marks a female.']
    ]);
  });

  G('aegean.numerals', function (R, ctx) {
    var L0 = lv(ctx), n = L0 === 1 ? R.int(11, 99) : L0 === 2 ? R.int(101, 999) : R.int(1001, 9999), r = R.int(0, 3);
    var parts = SC().numParts(n), NAME = { 1: 'strokes (ones)', 10: 'bars (tens)', 100: 'circles (hundreds)', 1000: 'rayed circles (thousands)', 10000: 'barred rayed circles (ten thousands)' };
    var st = parts.map(function (p) { return p.count + ' ' + NAME[p.place] + ': ' + (p.count * p.place); });
    if (r === 3) {
      var pl = R.pick(parts.filter(function (p) { return p.place >= 10; }).concat(parts.slice(0, 1)));
      return { q: 'How many ' + NAME[pl.place].replace(/ \(.*\)/, '') + ' would a scribe draw to write ' + commas(n) + '?', a: num(pl.count), steps: ['Split ' + commas(n) + ' into places: ' + parts.map(function (p) { return p.count + ' × ' + p.place; }).join(' + ') + '.', 'The ' + pl.place + 's place has ' + pl.count + '.'], hint: 'Each mark has its own value; count how many of each you need.' };
    }
    return { q: 'What number is this?' + (r === 1 ? '' : ' ' + nmu(n, 2)), viz: r === 1 ? { name: 'sc-numbers', opts: { mode: 'read', n: n, quiet: true, interactive: false } } : undefined, a: num(n), steps: st.concat([parts.map(function (p) { return p.count * p.place; }).join(' + ') + ' = ' + commas(n) + '.']), hint: 'Strokes are ones, bars tens, circles hundreds, rayed circles thousands. Add them.' };
  });

  G('aegean.measures', function (R, ctx) {
    var r = R.int(0, 4), sys = R.pick(['dry', 'liquid', 'dry', 'weight']), M = SC().MEASURES[sys], q, ans, steps;
    var top = sys === 'dry' ? 'units of wheat' : sys === 'liquid' ? 'units of oil' : 'talents (L) of bronze';
    if (sys === 'weight') {
      var L = R.int(2, 6), back = R.coin();
      if (back) { q = 'How many talents (L) are ' + (L * 30) + ' M of bronze?'; ans = L; steps = ['1 L = 30 M.', (L * 30) + ' ÷ 30 = ' + L + '.']; }
      else { q = 'How many M are in ' + L + ' L of bronze?'; ans = L * 30; steps = ['1 L = 30 M.', L + ' × 30 = ' + ans + '.']; }
      return { q: q, a: num(ans), steps: steps, hint: '1 L (talent) = 30 M.' };
    }
    var st = M.steps; // [[unit, how many in the one above]]
    var i = R.int(0, st.length - 1), j = R.int(i, st.length - 1);
    if (r === 0 || lv(ctx) === 1) { // one step
      var a = R.int(2, 9), u = st[i][0], above = i ? st[i - 1][0] : 'unit';
      q = 'In ' + sys + ' measure, 1 ' + (above === 'unit' ? 'unit' : above) + ' = ' + st[i][1] + ' ' + u + '. How many ' + u + ' are in ' + a + ' ' + (above === 'unit' ? 'units' : above) + '?';
      ans = a * st[i][1]; steps = [a + ' × ' + st[i][1] + ' = ' + ans + '.'];
      return { q: q, a: num(ans), steps: steps, hint: 'Multiply by the step between the two units.' };
    }
    if (r === 1 || r === 2) { // from a bigger unit down to a smaller one, several steps
      var from = i === 0 ? 'unit' : st[i - 1][0], to = st[j][0], f = 1, chain = [];
      for (var k = i; k <= j; k++) { f *= st[k][1]; chain.push(st[k][1]); }
      var amt = R.int(2, 5);
      q = 'Using ' + sys + ' measure (' + st.map(function (s, x) { return '1 ' + (x ? st[x - 1][0] : 'unit') + ' = ' + s[1] + ' ' + s[0]; }).join('; ') + '), how many ' + to + ' are in ' + amt + ' ' + (from === 'unit' ? 'units' : from) + '?';
      ans = amt * f; steps = ['Multiply by each step: ' + amt + ' × ' + chain.join(' × ') + ' = ' + ans + '.'];
      return { q: q, a: num(ans), steps: steps, hint: 'Go down one step at a time, multiplying by each ratio.' };
    }
    // smaller to bigger: divide
    var bigU = i === 0 ? 'unit' : st[i - 1][0], smU = st[i][0], cnt = R.int(2, 6);
    q = 'In ' + sys + ' measure 1 ' + bigU + ' = ' + st[i][1] + ' ' + smU + '. How many ' + (bigU === 'unit' ? 'units' : bigU) + ' are ' + (cnt * st[i][1]) + ' ' + smU + '?';
    return { q: q, a: num(cnt), steps: [(cnt * st[i][1]) + ' ÷ ' + st[i][1] + ' = ' + cnt + '.'], hint: 'Going up a unit, divide by the step.' };
  });

  var FORMS = [
    { q: 'A record names one shepherd, his place, the sheep logogram and a number. Which format is most likely?', a: 'A palm-leaf tablet', w: ['A page-shaped tablet', 'A painted stirrup jar', 'A stone offering table', 'A papyrus scroll'], s: ['One transaction, one line: a narrow palm-leaf tablet.'] },
    { q: 'A record lists twenty groups of workers with rations and a total at the bottom. Which format?', a: 'A page-shaped tablet', w: ['A palm-leaf tablet', 'A clay label', 'A sealing', 'A painted jar'], s: ['Many lines and a total make a list: a page-shaped tablet.'] },
    { q: 'What were Linear B clay labels for?', a: 'Pressed onto baskets to name the tablets inside', w: ['Hung around the necks of animals', 'Worn as jewelry', 'Used as coins', 'Sent as letters'], s: ['Labels were pressed onto the ends of baskets of tablets.'] },
    { q: 'What is a sealing?', a: 'Clay pressed over a knot and stamped with a seal', w: ['A tablet baked on purpose', 'A painted jar', 'A stone with a long text', 'A wax writing board'], s: ['A sealing shows a package was checked; a word or logogram may be added.'] },
    { q: 'Where were Linear B words sometimes painted?', a: 'On stirrup jars, before firing', w: ['On palace walls as poems', 'On coins', 'On papyrus', 'On swords'], s: ['Large stirrup jars for oil and wine sometimes carry painted words, often a name or place.'] },
    { q: 'What shape is a palm-leaf tablet?', a: 'Long and narrow, with a line or two', w: ['Round like a coin', 'Tall with many ruled lines', 'Square with a hole in the middle', 'Shaped like a jar'], s: ['Palm-leaf tablets are long and narrow; Ta 641 is about 15 cm long and 4 cm high.'] }
  ];
  G('aegean.tablet-forms', function (R, ctx) { return fact(R, R.pick(FORMS)); });

  var HANDS = [
    { q: 'What does a scribal "hand" mean?', a: 'One scribe, recognized by his handwriting', w: ['A logogram of a hand', 'A unit of measure', 'A tablet shape', 'A word divider'], s: ['Specialists tell scribes apart by how they draw the signs, and number each hand.'] },
    { q: 'About how many scribal hands are counted at Knossos?', a: 'About 66', w: ['About 6', 'About 600', 'About 6,000', 'Only one'], s: ['About 66 hands at Knossos and 45 at Pylos.'] },
    { q: 'About how many scribal hands are counted at Pylos?', a: 'About 45', w: ['About 4', 'About 450', 'About 4,500', 'About 1,000'], s: ['About 45 hands at Pylos, and 66 at Knossos.'] },
    { q: 'How are scribes told apart, since none signed a tablet?', a: 'By details of their handwriting, spacing and spelling', w: ['By their names written at the end', 'By the color of the clay', 'By seals on every tablet', 'They cannot be told apart'], s: ['How a sign is drawn, its size, spacing and spelling habits all mark a hand.'] },
    { q: 'What does the small number of hands suggest?', a: 'Writing was a specialist palace skill', w: ['Everyone in Greece could write', 'Children wrote most tablets', 'Only one person wrote Linear B', 'Writing was forbidden'], s: ['A few dozen scribes at each palace did the writing.'] }
  ];
  G('aegean.scribal-hands', function (R, ctx) {
    if (R.int(0, 2) === 0) {
      var a = R.int(12, 40), b = R.int(12, 40), c = R.int(5, 20);
      return { q: 'In one archive, one hand wrote ' + a + ' sheep tablets, another ' + b + ' tablets about bronze, and a third ' + c + ' tablets about land. How many tablets did the three hands write together?', a: num(a + b + c), steps: [a + ' + ' + b + ' + ' + c + ' = ' + (a + b + c) + '.', 'Each hand tends to write about one subject, which shows how the palace divided its work.'], hint: 'Add the three counts.' };
    }
    return fact(R, R.pick(HANDS));
  });

  // practice lines in the style of the tablets: [word, logogram], built from WORDS and LOGO
  var LINES = [['i-qo', 'EQU'], ['po-ro', 'EQU'], ['ti-ri-po', '*201VAS'], ['di-pa', '*202VAS'], ['qe-to', '*203VAS'], ['e-ra-wo', 'OLE'], ['wo-no', 'VIN'], ['si-to', 'GRA'], ['ka-ko', 'AES'], ['ku-ru-so', 'AUR'], ['pa-i-to', 'OVISm'], ['ku-do-ni-ja', 'OVISf'], ['ko-no-so', 'OVISm'], ['do-e-ro', 'VIR'], ['ka-ke-u', 'VIR'], ['ke-ra-me-u', 'VIR']];
  G('aegean.reading-a-tablet', function (R, ctx) {
    var ln = R.pick(LINES), n = R.int(2, lv(ctx) === 1 ? 19 : 140), r = R.int(0, 2), W = SC().word(ln[0]), LG = SC().logo(ln[1]);
    var viz = { name: 'sc-tablet', opts: { lines: [[{ w: ln[0] }, { l: ln[1] }, { n: n }]], shape: 'leaf', quiet: true, interactive: false } };
    var reading = 'Word: ' + ln[0] + ' (' + W.en + '). Logogram: ' + ln[1] + ' (' + LG.en + '). Number: ' + n + '.';
    if (r === 0) return { q: 'Read this tablet line (made for practice in the style of the tablets). What is being counted?', viz: viz, a: mcs(R, LG.en, logoMeanings().concat(['a syllable', 'the word divider']), 4), steps: ['Find the number at the end and the sign standing alone before it.', reading], hint: 'The logogram stands alone right before the number.' };
    if (r === 1) return { q: 'Read this tablet line (made for practice). What number is written?', viz: viz, a: num(n), steps: [SC().numParts(n).map(function (p) { return p.count + ' × ' + p.place; }).join(' + ') + ' = ' + n + '.', reading], hint: 'Strokes are ones, bars tens, circles hundreds.' };
    return { q: 'Read this tablet line (made for practice). Transliterate the word before the logogram.', viz: viz, a: txt(ln[0]), steps: ['The word is spelled with syllable signs: ' + ln[0].split('-').join(', ') + '.', reading], hint: 'Read the syllable signs one by one, joined by hyphens.' };
  });


  /* ================= Unit 8: Mycenaean Greek ================= */
  var DESC = ['ti-ri-po', 'di-pa', 'e-ra-wo', 'wa-na-ka', 'ka-ko', 'ku-ru-so', 'wo-no', 'pa-te', 'ma-te', 'te-o', 'do-ra', 'i-qo', 'po-ro', 'me-ri', 'si-to', 'ke-ra-me-u', 'i-je-re-u', 'to-ra-ke', 'pa-ka-na', 'e-ke-a', 'qa-si-re-u', 'to-pe-za', 'pa-ra-jo', 'a-to-ro-qo', 'ku-mi-no', 'sa-sa-ma', 'ko-ri-ja-do-no'];
  G('aegean.words-descendants', function (R, ctx) {
    var k = R.pick(DESC), W = SC().word(k), r = R.int(0, 3);
    if (r === 0) return { q: 'Which later Greek word does Mycenaean ' + tl(k) + ' (' + sb(k, 1.4) + ') become?', a: mcs(R, W.gr + ' (' + W.grl + ')', DESC.map(function (x) { var w = SC().word(x); return w.gr + ' (' + w.grl + ')'; }), 4), steps: [k + ' is ' + W.gr + ', ' + W.grl + ', ' + Q(W.en) + '.', W.note || 'Undo the spelling rules to see the Greek word.'], hint: 'Add back missing final consonants; read r as l, p as ph, k as kh where needed.' };
    if (r === 1) return { q: 'What does the Mycenaean word ' + tl(k) + ' mean?', a: mcs(R, W.en, DESC.map(function (x) { return SC().word(x).en; }), 4), steps: [k + ' is Greek ' + W.grl + ', ' + Q(W.en) + '.'], hint: 'Think of the later Greek word, or an English word borrowed from it.' };
    if (r === 2) return { q: 'Which Linear B spelling writes the word that later Greek has as ' + W.gr + ' (' + W.grl + ', ' + Q(W.en) + ')?', a: mcs(R, k, DESC, 4), steps: [W.grl + ' is spelled ' + k + ' in Linear B.', W.note || ''].filter(Boolean), hint: 'Spell the word in open syllables, dropping final consonants.' };
    var ch = R.pick([['wa-na-ka', 'wanax', 'anax', 'the w was lost'], ['wo-no', 'woinos', 'oinos', 'the w was lost'], ['e-ra-wo', 'elaiwon', 'elaion', 'the w was lost'], ['qa-si-re-u', 'gʷasileus', 'basileus', 'gʷ became b']]);
    return { q: 'Mycenaean ' + tl(ch[0]) + ' was said <i>' + ch[1] + '</i>; later Greek has <i>' + ch[2] + '</i>. What sound change happened?', a: mc(cap(ch[3]), ['The w was lost', 'gʷ became b', 'An l became r', 'A final s was added', 'Nothing changed'].filter(function (x) { return x.toLowerCase() !== ch[3]; }), 4), steps: [ch[1] + ' → ' + ch[2] + ': ' + ch[3] + '.'], hint: 'Compare the two forms sound by sound.' };
  });

  var CASES = [
    { q: 'Which form means "of Zeus"?', a: 'di-wo', w: ['di-we', 'e-ra', 'te-o', 'po-se-da-o'], s: ['di-wo is the genitive, Diwos, "of Zeus".', 'di-we is the dative, "to Zeus".'] },
    { q: 'Which form means "to Zeus"?', a: 'di-we', w: ['di-wo', 'te-o-jo', 'e-ra', 'di-wo-nu-so'], s: ['di-we is the dative, Diwei: "to Zeus", the receiver of an offering.'] },
    { q: 'Which form means "of the god"?', a: 'te-o-jo', w: ['te-o', 'di-we', 'ti-ri-po-de', 'di-pa-e'], s: ['te-o-jo ends in -o-jo, the old genitive -oio.'] },
    { q: 'Which form means "two tripods"?', a: 'ti-ri-po-de', w: ['ti-ri-po', 'di-pa', 'di-pa-e', 'te-o'], s: ['ti-ri-po-de is the dual, a form for exactly two.'] },
    { q: 'Which form means "two cups"?', a: 'di-pa-e', w: ['di-pa', 'ti-ri-po-de', 'di-we', 'te-o-jo'], s: ['di-pa-e is the dual of di-pa, cup.'] },
    { q: 'What does the ending -o-jo show?', a: 'The genitive ("of …") of an o-stem, Greek -oio', w: ['The plural', 'The dative ("to …")', 'A woman\'s name', 'A logogram'], s: ['-o-jo writes -oio, the old genitive ending that Homer still uses; Classical Greek has -ou.'] },
    { q: 'Why can\'t the spelling te-o show whether the word is theos (subject) or theon (object)?', a: 'Final consonants are not written, so -os and -on look the same', w: ['The scribe forgot', 'te-o is a logogram', 'Mycenaean had no cases', 'Only the dual is written'], s: ['A final s or n is dropped, so both forms are spelled te-o.'] },
    { q: 'What is the dual?', a: 'A form for exactly two of something', w: ['A form for many', 'A form for "of"', 'A form for "to"', 'Two words written as one'], s: ['ti-ri-po-de, "two tripods", stands before the number 2 on Ta 641.'] },
    { q: 'Which ending writes the old instrumental plural, Greek -phi?', a: '-pi', w: ['-o-jo', '-e', '-de', '-ja'], s: ['ph uses the p signs, so -phi is written -pi.'] }
  ];
  G('aegean.case-endings', function (R, ctx) { return fact(R, R.pick(CASES)); });

  var PLACE_SITE = { 'ko-no-so': 'knossos', 'pa-i-to': 'phaistos', 'ku-do-ni-ja': 'chania', 'pu-ro': 'pylos', 'te-qa': 'thebes' };
  G('aegean.tablet-places', function (R, ctx) {
    var r = R.int(0, 3), k = R.pick(PLACES);
    if (r === 0) {
      var kk = R.pick(Object.keys(PLACE_SITE)), t = PLACE_SITE[kk], oth = R.sample(BIG.filter(function (x) { return x !== t && !(t === 'phaistos' && x === 'triada'); }), 3);
      var mp = mapPick(R, t, oth, 'aegean');
      return { q: 'The tablets name a place ' + tl(kk) + '. Which lettered place on the map is it?', viz: mp.viz, a: mp.a, steps: [kk + ' is ' + placeName(kk) + ': place ' + mp.letter + '.', site(t).note], hint: 'Read the name through the spelling rules, then find it.' };
    }
    if (r === 1) return { q: 'How do the Linear B tablets spell ' + placeName(k) + '? Type the transliteration.', a: txt(k), steps: [placeName(k) + ' is spelled ' + k + '.', SC().word(k).note || 'Open syllables, with the final s dropped.'], hint: 'Open syllables; drop the final s; l is written with r.' };
    return { q: 'Which place is named ' + tl(k) + ' on the tablets?', a: mcs(R, placeName(k), PLACES.map(placeName).concat(['Mycenae', 'Athens', 'Sparta']), 4), steps: [k + ' is ' + SC().word(k).en + '.', SC().word(k).note || ''].filter(Boolean), hint: 'Add back the final s; read r as l, p as ph, q as an old b-like sound.' };
  });

  var GODS = ['po-se-da-o', 'di-we', 'e-ra', 'di-wo-nu-so', 'e-ma-a2', 'a-ta-na-po-ti-ni-ja', 'a-re', 'e-re-u-ti-ja'];
  function godName(k) { return { 'po-se-da-o': 'Poseidon', 'di-we': 'Zeus', 'di-wo': 'Zeus', 'e-ra': 'Hera', 'di-wo-nu-so': 'Dionysus', 'e-ma-a2': 'Hermes', 'a-ta-na-po-ti-ni-ja': 'Athena', 'a-re': 'Ares', 'e-re-u-ti-ja': 'Eileithyia', 'di-ri-mi-jo': 'Drimios' }[k]; }
  G('aegean.gods-named', function (R, ctx) {
    var r = R.int(0, 3), k = R.pick(GODS);
    if (r === 0) return { q: 'Which god is named ' + tl(k) + ' on the tablets?', a: mcs(R, godName(k), ['Poseidon', 'Zeus', 'Hera', 'Dionysus', 'Hermes', 'Athena', 'Ares', 'Eileithyia', 'Apollo', 'Aphrodite'].filter(function (x) { return x !== godName(k); }), 4), steps: [k + ': ' + SC().word(k).en + '.', SC().word(k).note || ''].filter(Boolean), hint: 'Undo the spelling rules: add back h and final s, read r as l.' };
    if (r === 1) { var kk = R.pick(['po-se-da-o', 'e-ra', 'di-wo-nu-so', 'a-re', 'e-ma-a2']); return { q: 'Read this god\'s name from a tablet. Type the transliteration.', viz: signsViz(kk, { number: true }), a: txt(kk), steps: kk.split('-').map(function (v, i) { return 'Sign ' + (i + 1) + ': ' + v + '.'; }).concat([kk + ' is ' + godName(kk) + '.']), hint: 'Read the signs one by one; a special sign is typed with its digit.' }; }
    if (r === 2) return tfq(R, [
      ['Several Olympian gods are named on Linear B tablets, centuries before Homer.', true, 'Zeus, Hera, Poseidon, Hermes and Dionysus among them.'],
      ['The tablets tell the myths of the gods they name.', false, 'They list names and offerings, not stories.'],
      ['Dionysus is named on tablets from Pylos and Chania.', true, 'He was once thought to be a later arrival in Greece.'],
      ['di-we means "of Zeus".', false, 'di-we is the dative, "to Zeus"; di-wo is "of Zeus".'],
      ['Drimios, called a son of Zeus on Pylos tablet Tn 316, is a well-known god of later Greece.', false, 'He is unknown from later Greek religion.']
    ]);
    var kd = R.pick(['di-we', 'di-wo']);
    return { q: 'An offering list begins with ' + tl(kd) + '. Does it mean "to Zeus" or "of Zeus"?', a: mc(kd === 'di-we' ? '"to Zeus"' : '"of Zeus"', [kd === 'di-we' ? '"of Zeus"' : '"to Zeus"', '"Zeus" as a subject', '"two gods"'], 4), steps: [kd === 'di-we' ? 'di-we is the dative: the receiver, "to Zeus".' : 'di-wo is the genitive: "of Zeus".'], hint: '-e is a dative ending; -o here is a genitive.' };
  });


  /* ================= Unit 9: What the Tablets Tell ================= */
  var ECON = [['OVISm', 'flocks of sheep'], ['LANA', 'wool'], ['MUL', 'women workers'], ['GRA', 'wheat for rations'], ['AES', 'bronze for smiths'], ['OLE', 'olive oil'], ['CUR', 'chariots'], ['ROTA', 'chariot wheels'], ['VIN', 'wine'], ['AUR', 'gold']];
  G('aegean.palace-economy', function (R, ctx) {
    var r = R.int(0, 2);
    if (r === 0 || lv(ctx) > 1 && r === 1) {
      var cnt = ByL(ctx, 3, 4, 5), items = [], big = lv(ctx) === 1 ? 30 : 160;
      for (var i = 0; i < cnt; i++) items.push(R.int(3, big));
      var tot = items.reduce(function (x, y) { return x + y; }, 0), LG = R.pick(['MUL', 'VIR', 'OVISm', 'GRA']);
      return { q: 'A list (made for practice in the style of the tablets) records ' + SC().logo(LG).en + ' at ' + cnt + ' places. Add the numbers for the total line.<br>' + items.map(function (n, j) { return 'Line ' + (j + 1) + ': ' + lgu(LG, 1.5) + ' ' + nmu(n, 1.5); }).join('<br>'), a: num(tot), steps: ['Read each number: ' + items.join(', ') + '.', items.join(' + ') + ' = ' + tot + '.', 'A Linear B total line begins with to-so, "so many".'], hint: 'Read each number (circles 100, bars 10, strokes 1), then add.' };
    }
    if (r === 1) {
      var e = R.pick(ECON);
      return { q: 'A group of tablets records many entries with the logogram ' + lgu(e[0], 2) + '. What part of the palace economy do they track?', a: mcs(R, cap(e[1]), ECON.map(function (x) { return cap(x[1]); }), 4), steps: [e[0] + ' is ' + SC().logo(e[0]).en + '.', 'So the tablets track ' + e[1] + '.'], hint: 'Name the logogram first.' };
    }
    return tfq(R, [
      ['The tablets are mostly accounts of goods, people and animals.', true, 'They track what came in and went out.'],
      ['The tablets include letters between kings.', false, 'No letters survive; the texts are accounts.'],
      ['Bronze was handed out to smiths, who were expected to return finished work.', true, 'The Pylos bronze tablets record such allocations.'],
      ['The palaces controlled every part of the economy, including all pottery making.', false, 'Many activities, such as most pottery making, barely appear in the records.'],
      ['Groups of women workers received rations recorded on the tablets.', true, 'Ration lists record women, their children and wheat and figs.']
    ]);
  });
  function ByL(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }

  var RANKS = [['wa-na-ka', 'the ruler of the palace state'], ['ra-wa-ke-ta', 'the official ranked second, "leader of the people"'], ['e-qe-ta', 'a "follower", an official attached to the palace'], ['qa-si-re-u', 'a local official, far below the ruler']];
  G('aegean.wanax-lawagetas', function (R, ctx) {
    var r = R.int(0, 3);
    if (r === 0) {
      var right = 'wa-na-ka → ra-wa-ke-ta → qa-si-re-u';
      return { q: 'Put these titles in order of rank, highest first: ' + R.shuffle(['wa-na-ka', 'ra-wa-ke-ta', 'qa-si-re-u']).map(tl).join(', ') + '.', a: mc(right, ['qa-si-re-u → wa-na-ka → ra-wa-ke-ta', 'ra-wa-ke-ta → wa-na-ka → qa-si-re-u', 'qa-si-re-u → ra-wa-ke-ta → wa-na-ka', 'wa-na-ka → qa-si-re-u → ra-wa-ke-ta'], 4), steps: ['The wanax ruled.', 'The lawagetas ranked next.', 'The basileus (qa-si-re-u) was a local official.'], hint: 'The later word for king started low.' };
    }
    if (r === 1) { var t = R.pick(RANKS); return { q: 'Who was the ' + tl(t[0]) + ' in a Mycenaean palace state?', a: mcs(R, cap(t[1]), RANKS.map(function (x) { return cap(x[1]); }).concat(['A god of the sea', 'A scribe who wrote the tablets']), 4), steps: [t[0] + ' (' + SC().word(t[0]).grl + '): ' + t[1] + '.'], hint: 'wanax ruler, lawagetas second, basileus local official.' }; }
    if (r === 2) return { q: 'In the tablets, what was a ' + tl('qa-si-re-u') + ', and what did the word mean later in Classical Greek?', a: mc('A local official then; "king" later', ['The king then; a local official later', 'A priest then and later', 'A god then; "king" later', 'A scribe then; a poet later'], 4), steps: ['In the tablets the basileus was a minor local official.', 'After the palaces fell, local leaders rose, and by Classical times basileus meant king.'], hint: 'The wanax disappeared with the palaces.' };
    var W = R.pick(['wa-na-ka', 'ra-wa-ke-ta', 'qa-si-re-u']);
    return spellQ(R, W);
  });

  var TN = [[0, 'di-we', 'Zeus', 'VIR', 'a man'], [1, 'e-ra', 'Hera', 'MUL', 'a woman'], [2, 'di-ri-mi-jo', 'Drimios, son of Zeus', null, null]];
  G('aegean.offerings', function (R, ctx) {
    var r = R.int(0, 3), e = R.pick(TN);
    var viz = { name: 'sc-tablet', opts: { tablet: 'tn316', quiet: true, interactive: false } };
    if (r === 0) return { q: 'On this extract from Pylos tablet Tn 316, line ' + (e[0] + 1) + ' begins ' + tl(e[1]) + '. To which god does that entry go?', viz: viz, a: mcs(R, e[2], ['Zeus', 'Hera', 'Drimios, son of Zeus', 'Poseidon', 'Dionysus'], 4), steps: [e[1] + ': ' + SC().word(e[1]).en + '.', 'The entry gives a gold bowl' + (e[3] ? ' and ' + e[4] : '') + '.'], hint: 'di-we is "to Zeus"; e-ra is Hera.' };
    if (r === 1) return { q: 'On Tn 316, each of these entries lists ' + lgu('AUR', 1.6) + ' ' + lgu('*213VAS', 1.6) + ' ' + nmu(1, 1.6) + '. What is offered?', viz: viz, a: mc('One gold bowl', ['One bronze tripod', 'One jar of oil', 'One man', 'One horse'], 4), steps: ['AUR is gold.', '*213VAS is a bowl.', 'The number is 1.'], hint: 'Read the two logograms, then the number.' };
    if (r === 2) return fact(R, R.pick([
      { q: 'What does Tn 316 actually state about the man listed for Zeus?', a: 'Only that one man (VIR 1) is listed with the gold bowl', w: ['That he was sacrificed', 'That he was a priest for life', 'That he was a king', 'That he was a slave from Egypt'], s: ['The tablet gives a name, the gold and vessel signs, VIR and a number.', 'What happened to him is an interpretation.'] },
      { q: 'What do scholars debate about the people on Tn 316?', a: 'Whether they were human offerings or servants given to the gods', w: ['Whether the tablet is Linear A', 'Whether Zeus is named', 'Whether the tablet is from Pylos', 'Whether the signs are numbers'], s: ['Some read them as sacrifices, others as temple servants; the text does not settle it.'] },
      { q: 'Which of these is a typical offering recorded on the tablets?', a: 'Oil, honey, wheat or animals sent to a god or shrine', w: ['Coins for the temple', 'Books of prayers', 'Statues of marble', 'Paper scrolls'], s: ['Offering lists send oil, honey, grain, wine, animals and vessels.'] }
    ]));
    return tfq(R, [
      ['Tn 316 proves that the Mycenaeans sacrificed humans.', false, 'It lists people with the gold vessels, but no word says what happened to them; the reading is debated.'],
      ['Tn 316 lists gold vessels for Zeus and Hera.', true, 'di-we AUR *213VAS 1; e-ra AUR *213VAS 1.'],
      ['A Knossos tablet sends a jar of honey to Eileithyia at Amnisos.', true, 'me-ri, honey, is a common offering.'],
      ['The offering tablets explain what each festival meant.', false, 'They are lists; they record gifts, not beliefs.']
    ]);
  });

  var DONT = [
    ['Can the tablets tell us why Pylos burned?', false, 'They record palace business up to the fire, not events or causes.'],
    ['Can the tablets tell us how many tripods were stored at Pylos?', true, 'Inventories are exactly what tablets record: Ta 641 lists tripods.'],
    ['Can the tablets tell us the words of a Mycenaean poem?', false, 'No poems survive in Linear B.'],
    ['Can the tablets tell us the names of gods who received offerings?', true, 'Zeus, Hera, Poseidon and others are named.'],
    ['Can the tablets confirm that the Trojan War happened?', false, 'They name no war and no Agamemnon.'],
    ['Can the tablets tell us how many sheep a shepherd was responsible for?', true, 'The sheep tablets record flocks with numbers.'],
    ['Can the tablets tell us the laws of Pylos?', false, 'No laws survive; the texts are accounts.'],
    ['Can the tablets tell us what titles officials held?', true, 'wanax, lawagetas and basileus appear.'],
    ['Can the tablets tell us what the Mycenaeans believed about the afterlife?', false, 'They record offerings, not beliefs.']
  ];
  G('aegean.what-they-dont-say', function (R, ctx) {
    var r = R.int(0, 2), yes = DONT.filter(function (x) { return x[1]; }), no = DONT.filter(function (x) { return !x[1]; });
    function strip(x) { return x[0].replace(/^Can the tablets tell us /, '').replace(/^Can the tablets /, '').replace(/\?$/, ''); }
    if (r === 1) { var y = R.pick(yes); return { q: 'Which of these can the Linear B tablets tell us?', a: mc(cap(strip(y)), R.sample(no, 3).map(function (x) { return cap(strip(x)); }), 4), steps: [y[2], 'The others need stories, laws, beliefs or history, which the tablets do not contain.'], hint: 'The tablets are accounts.' }; }
    if (r === 2) { var nn = R.pick(no); return { q: 'Which of these can the Linear B tablets NOT tell us?', a: mc(cap(strip(nn)), R.sample(yes, 3).map(function (x) { return cap(strip(x)); }), 4), steps: [nn[2], 'The others are the kind of thing accounts record.'], hint: 'Look for the one that needs a story, a law, a belief or history.' }; }
    var it = R.pick(DONT);
    return { q: it[0], a: mc(it[1] ? 'Yes' : 'No', [it[1] ? 'No' : 'Yes'], 2, true), steps: [(it[1] ? 'Yes. ' : 'No. ') + it[2]], hint: 'The tablets are accounts: names, things, numbers.' };
  });


  /* ================= Unit 10: Linear A ================= */
  var LA_SITES = ['triada', 'zakros', 'chania', 'phaistos', 'akrotiri', 'phylakopi', 'kea', 'palaikastro'];
  var LAC = [
    { q: 'About when was Linear A used?', a: 'From about 1800 to 1450 BC', w: ['From about 1450 to 1200 BC', 'From about 800 to 400 BC', 'From about 3000 to 2500 BC', 'From about AD 100 to 300'], s: ['Linear A was the Minoan script, about 1800 to 1450 BC.', 'Linear B followed, about 1450 to 1200 BC.'] },
    { q: 'About how many Linear A inscriptions survive?', a: 'About 1,400', w: ['About 14', 'About 140,000', 'About 6,000', 'About 40'], s: ['About 1,400 inscriptions, with about 7,400 signs in all.'] },
    { q: 'Which site has produced about half of all Linear A inscriptions?', a: 'Hagia Triada', w: ['Pylos', 'Mycenae', 'Thebes', 'Athens'], s: ['Hagia Triada, near Phaistos, has the largest group.'] },
    { q: 'What are most Linear A texts?', a: 'Short lists of words and numbers', w: ['Long poems', 'Letters between kings', 'Law codes', 'Histories of Crete'], s: ['Most are short administrative lists; many are damaged.'] },
    { q: 'Besides clay tablets, where else is Linear A found?', a: 'On stone libation tables, vessels and small clay sealings', w: ['On papyrus scrolls', 'On coins', 'On temple walls in Egypt', 'On Roman milestones'], s: ['Stone offering tables, inscribed pots, roundels and sealings carry Linear A too.'] },
    { q: 'About how many signs are in the whole Linear A corpus?', a: 'About 7,400', w: ['About 74', 'About 740,000', 'About 74 million', 'About 700'], s: ['About 7,400 signs in all: small for a decipherer.'] }
  ];
  G('aegean.linear-a-corpus', function (R, ctx) {
    var r = R.int(0, 2);
    if (r === 0) {
      var t = R.pick(['triada', 'zakros', 'chania', 'akrotiri']), oth = R.sample(['pylos', 'mycenae', 'thebes', 'knossos', 'zakros', 'chania', 'phylakopi', 'akrotiri'].filter(function (x) { return x !== t; }), 3);
      var mp = mapPick(R, t, oth, 'aegean');
      return { q: 'Linear A has been found at <b>' + esc(site(t).name) + '</b>. Which lettered place on the map is it?', viz: mp.viz, a: mp.a, steps: [site(t).name + ' is place ' + mp.letter + '.', site(t).note], hint: 'Linear A finds cluster on Crete, with a few on the islands.' };
    }
    if (r === 1) {
      var k = R.pick(LA_SITES.concat(['pylos', 'mycenae', 'thebes', 'tiryns'])), s0 = site(k), A = s0.scripts.indexOf('A') >= 0;
      return { q: 'Has Linear A been found at <b>' + esc(s0.name) + '</b>?', a: mc(A ? 'Yes' : 'No, only Linear B', [A ? 'No, only Linear B' : 'Yes'], 2, true), steps: [s0.note], hint: 'Linear A is Minoan: Crete and the islands.' };
    }
    return fact(R, R.pick(LAC));
  });

  var LA_SYL = function () { return SC().LA_SIGNS.filter(function (s) { return s.kind === 'syl' && /^[a-z]+$/.test(s.v); }); };
  G('aegean.shared-signs', function (R, ctx) {
    var r = R.int(0, 2), S0 = R.pick(LA_SYL());
    if (r === 0 || lv(ctx) === 1) return { q: 'This Linear A sign looks like a Linear B sign: ' + sua(S0.u, 2.4) + '. By convention, how is it read?', a: txt(S0.v), steps: ['It is ' + S0.n + ', the sign shared with Linear B ' + S0.b + ', ' + S0.v + '.', 'By convention Linear A takes the Linear B value: ' + S0.v + '. The Minoan sound is a guess.'], hint: 'Picture the Linear B sign with the same shape.' };
    if (r === 1) return fact(R, R.pick([
      { q: 'How sure are the sound values used for Linear A signs?', a: 'They are a working convention borrowed from Linear B, likely for many signs but not proved', w: ['Proved by a bilingual inscription', 'Known from Minoan grammar books', 'Exactly the same as Greek letters', 'Completely unknown, so never used'], s: ['Scholars read shared signs with the Linear B values, assuming the sounds carried over with the shapes.'] },
      { q: 'What best supports reading Linear A with Linear B values?', a: 'Place names, such as pa-i-to, come out the same in both scripts', w: ['A bilingual text with Egyptian', 'The Minoans wrote in Greek', 'Ventris read Linear A in 1952', 'Every Linear A word is a Greek word'], s: ['Read with the borrowed values, pa-i-to in Linear A matches Linear B pa-i-to, Phaistos, near where it was found.'] },
      { q: 'If we can sound out a Linear A word by convention, can we read it?', a: 'No: knowing rough sounds is not knowing the language', w: ['Yes: sounds are all we need', 'Yes, if it is a place name', 'Yes, because it is Greek'], s: ['The conventional values give syllables in an unknown language, so the meaning stays unknown.'] }
    ]));
    var k = R.pick(['pa-i-to', 'su-ki-ri-ta', 'se-to-i-ja']);
    return { q: 'Read this Linear A word by convention, using the Linear B values. Type the transliteration.', viz: { name: 'sc-signs', opts: { text: k, script: 'A', quiet: true, interactive: false, number: true } }, a: txt(k), steps: k.split('-').map(function (v, i) { return 'Sign ' + (i + 1) + ': read by convention ' + v + '.'; }).concat([SC().LA_WORDS[k].note]), hint: 'Each Linear A sign here matches a Linear B sign.' };
  });

  function fracStr(n, half) { return n + (half ? ' J' : ''); }
  function showVal(v) { var w = Math.floor(v + 1e-9), h = Math.abs(v - w - 0.5) < 1e-9; return h ? (w ? w + '½' : '½') : String(w); }
  function valSpec(v) { var w = Math.floor(v + 1e-9), h = Math.abs(v - w - 0.5) < 1e-9; return { t: 'num', v: h ? (2 * w + 1) + '/2' : String(w) }; }
  function laSumQ(R, ctx, withJ, intro) {
    var cnt = ML.byLevel(ctx, 3, 4, 5), items = [], vals = [];
    for (var i = 0; i < cnt; i++) { var n = R.int(1, lv(ctx) === 1 ? 15 : 60), h = withJ && R.chance(0.5); items.push(fracStr(n, h)); vals.push(n + (h ? 0.5 : 0)); }
    var tot = vals.reduce(function (x, y) { return x + y; }, 0);
    return { q: intro + ' What number should follow ' + tl('ku-ro') + '?' + (withJ ? ' (J is one half; type a half as 1/2 or .5, for example 23 1/2 or 23.5.)' : ''), viz: { name: 'sc-numbers', opts: { mode: 'sum', items: items, script: 'A', ask: true, quiet: true, interactive: false } }, a: valSpec(tot), steps: ['The lines are ' + vals.map(showVal).join(', ') + '.', vals.map(showVal).join(' + ') + ' = ' + showVal(tot) + '.', 'The ku-ro line gives the sum: that is why ku-ro is read as "total".'], hint: withJ ? 'Count the J signs: two halves make one whole.' : 'Add the lines.' };
  }
  G('aegean.la-numbers', function (R, ctx) {
    var r = R.int(0, 3);
    if (r === 0) return laSumQ(R, ctx, true, 'A Linear A list in the style of the Hagia Triada tablets (made for practice).');
    if (r === 1) { var n = R.int(2, 99), h = R.coin(); return { q: 'What value does this Linear A number have? ' + nmu(n, 2) + (h ? ' ' + sua(SC().FRACTIONS[0].u, 2) : '') + (h ? ' (the last sign is the fraction J)' : ''), a: valSpec(n + (h ? 0.5 : 0)), steps: [SC().numParts(n).map(function (p) { return p.count + ' × ' + p.place; }).join(' + ') + ' = ' + n + '.'].concat(h ? ['J adds one half: ' + n + '½.'] : []), hint: 'The whole numbers work as in Linear B; J is one half.' }; }
    if (r === 2) { var F = R.pick(SC().FRACTIONS.filter(function (f) { return f.k !== 'J'; })); return { q: 'How sure is the value of the Linear A fraction sign ' + F.k + ' ' + sua(F.u, 2) + '?', a: mc(F.sure === 'proposed' ? 'Proposed (' + F.num + '), not agreed' : F.sure === 'uncertain' ? 'Uncertain' : 'Unknown', ['Widely accepted, like J', 'Proved by a bilingual', 'Known from Linear B values'], 4), steps: [F.k + ': ' + F.note, 'Only J, one half, is widely accepted.'], hint: 'Only one fraction sign is widely agreed.' }; }
    return fact(R, R.pick([
      { q: 'Which Linear A fraction sign has a widely accepted value?', a: 'J, one half', w: ['E, one quarter', 'L, one tenth', 'H, one sixteenth', 'All of them'], s: ['J = 1/2 is widely accepted; the others are proposals or unknown.'] },
      { q: 'How were the values of Linear A fraction signs worked out?', a: 'From lists whose entries must add up to their totals', w: ['From a bilingual with Egyptian', 'From the Greek alphabet', 'From Linear B words for fractions', 'From the Phaistos Disc'], s: ['If a list adds up only when J is 1/2, that is evidence for J.'] },
      { q: 'Do Linear A and Linear B use the same marks for whole numbers?', a: 'Yes: strokes, bars, circles and rayed circles', w: ['No: Linear A has place value', 'No: Linear A uses letters', 'No: Linear A has no numbers'], s: ['Both use the Aegean numerals.'] }
    ]));
  });

  G('aegean.ku-ro', function (R, ctx) {
    var r = R.int(0, 3);
    if (r === 0) return laSumQ(R, ctx, lv(ctx) > 1, 'A Linear A list in the style of the Hagia Triada tablets (made for practice).');
    if (r === 1) {
      var vals = [R.int(2, 30), R.int(2, 30), R.int(2, 30)], tot = vals[0] + vals[1] + vals[2], ok = R.coin(), shown = ok ? tot : tot + R.pick([-3, -1, 1, 2, 10]);
      return { q: 'A Linear A list reads ' + vals.join(', ') + ', then ' + tl('ku-ro') + ' ' + shown + '. Does the total work?', a: mc(ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes'], 2, true), steps: [vals.join(' + ') + ' = ' + tot + '.', ok ? 'It matches the ku-ro line.' : 'The ku-ro line says ' + shown + ', so this list does not add up (perhaps a damaged entry, or a mistake).'], hint: 'Add the lines and compare.' };
    }
    if (r === 2) return fact(R, R.pick([
      { q: 'Why is ku-ro widely accepted to mean "total"?', a: 'It stands before a number equal to the sum of the list above it', w: ['It sounds like a Greek word for total', 'A bilingual inscription translates it', 'Ventris read it in 1952', 'It is a picture of an abacus'], s: ['In list after list, the number after ku-ro is the sum.', 'The meaning comes from arithmetic, not from knowing the language.'] },
      { q: 'What does knowing ku-ro tell us about the Minoan language?', a: 'Almost nothing: we know what the word does, not what language it belongs to', w: ['That it was Greek', 'That it was Egyptian', 'All of its grammar', 'How every sign sounded'], s: ['A word for "total" can belong to any language.'] },
      { q: 'What is known about the Linear A word ki-ro?', a: 'It recurs in lists before numbers, but its meaning is uncertain', w: ['It means "total"', 'It means "king"', 'It is the name of Knossos', 'It is a god\'s name'], s: ['ki-ro is often discussed; some suggest an amount owed or missing, but there is no agreement.'] },
      { q: 'What is po-to-ku-ro thought to be?', a: 'Perhaps a grand total, less securely than ku-ro', w: ['Certainly a god\'s name', 'A place name in Greece', 'A word for "half"', 'The name of a scribe'], s: ['It seems to sum several totals, but it is less certain than ku-ro.'] }
    ]));
    return { q: 'Which of these can be said about the Linear A word ' + tl('ku-ro') + '?', a: mc('It is widely accepted to mean "total", from the arithmetic of lists', ['It proves the Minoans spoke Greek', 'Its true pronunciation is known for certain', 'It was translated from a bilingual text', 'It is the name of a Minoan king'], 4), steps: ['The number after ku-ro is the sum of the list above, again and again.', 'That shows its job, not its language or its exact sound.'], hint: 'What does the arithmetic prove, and what does it not prove?' };
  });

  var LIB = [
    { q: 'Where is the Linear A "libation formula" found?', a: 'On stone offering tables from sanctuaries', w: ['On palace storage jars', 'On Linear B tablets at Pylos', 'On Egyptian papyri', 'On coins'], s: ['Stone libation tables from sanctuaries, such as peak shrines, carry versions of the formula.'] },
    { q: 'What does a-sa-sa-ra-me mean?', a: 'Its meaning is unknown', w: ['"Mistress", a known goddess', '"Total"', '"Phaistos"', '"Wine"'], s: ['The word is recognized because it recurs, not because it is understood.'] },
    { q: 'What can scholars say about a-sa-sa-ra-me and ja-sa-sa-ra-me?', a: 'They are probably forms of one word, meaning unknown', w: ['They are two different goddesses', 'They mean "total" and "grand total"', 'They are Greek words', 'They are logograms'], s: ['They share most signs and the same place in the formula.'] },
    { q: 'Why are the libation formula words recognized at all?', a: 'They recur, often in the same order, on many objects', w: ['They are translated in Egyptian', 'They are Greek', 'Ventris read them', 'They are pictures of gods'], s: ['Repetition shows which words belong together.'] },
    { q: 'Which word often appears with i-pi-na-ma in the formula?', a: 'si-ru-te', w: ['ku-ro', 'ti-ri-po', 'pa-i-to', 'wa-na-ka'], s: ['i-pi-na-ma and si-ru-te are often near each other.'] }
  ];
  G('aegean.libation-formula', function (R, ctx) {
    var r = R.int(0, 2);
    if (r === 0) { var k = R.pick(['a-sa-sa-ra-me', 'ja-sa-sa-ra-me', 'i-pi-na-ma', 'si-ru-te']); return { q: 'This word recurs on Linear A offering tables. Read it by convention and type the transliteration.', viz: { name: 'sc-signs', opts: { text: k, script: 'A', quiet: true, interactive: false, number: true } }, a: txt(k), steps: k.split('-').map(function (v, i) { return 'Sign ' + (i + 1) + ': by convention ' + v + '.'; }).concat([k + ': ' + SC().LA_WORDS[k].en + '.']), hint: 'Use the Linear B values of the matching signs.' }; }
    if (r === 1) return tfq(R, [
      ['a-sa-sa-ra-me is the name of a known Minoan goddess.', false, 'Many have guessed; its meaning is unknown.'],
      ['The libation formula words recur, often in the same order.', true, 'That is how they are recognized.'],
      ['The libation formula has been translated with a bilingual text.', false, 'No bilingual is known.'],
      ['Libation tables with Linear A were found at peak sanctuaries such as Mount Iouktas.', true, 'Iouktas is south of Knossos.'],
      ['Different forms like a-sa-sa-ra-me and ja-sa-sa-ra-me suggest the language had grammar that changes words.', true, 'Variation in one slot of a formula suggests word forms, though not which ones.']
    ]);
    return fact(R, R.pick(LIB));
  });

  var WHYU = [
    { q: 'Which is NOT one of the main reasons Linear A cannot be read yet?', a: 'Its signs are too hard to draw', w: ['The texts are few and short', 'The language matches no known language', 'There is no bilingual text'], s: ['The signs are well recorded and many match Linear B.', 'The problems are the small corpus, the unknown language and the lack of a bilingual.'] },
    { q: 'What did Ventris have for Linear B that Linear A lacks?', a: 'A known language, Greek, to test readings against', w: ['A sign list', 'Numbers', 'Logograms', 'Clay tablets'], s: ['Linear A has a sign list, numbers, logograms and tablets.', 'What it lacks is a known language.'] },
    { q: 'What kind of find would help most to read Linear A?', a: 'A bilingual: the same text in Linear A and a known script', w: ['Another short list with ku-ro', 'A new drawing of a known tablet', 'A Linear B tablet from Pylos', 'A Greek coin'], s: ['A bilingual gives meanings directly, as the Rosetta Stone did for Egyptian.'] },
    { q: 'Why can\'t the borrowed Linear B values simply read Linear A?', a: 'They give rough sounds in an unknown language, which no one can understand', w: ['The values are all wrong', 'Linear A has no signs in common with Linear B', 'Linear A is written backwards', 'Linear A is Greek'], s: ['Sounds alone are not meanings; with Linear B they led into Greek, a known language.'] },
    { q: 'Why does the small size of the Linear A corpus matter?', a: 'Patterns must repeat many times before they can be trusted', w: ['Small texts are always forgeries', 'It does not matter at all', 'The signs are too small to see', 'Short texts are easy to read'], s: ['About 7,400 signs, mostly names and numbers, give few patterns to test.'] }
  ];
  G('aegean.why-unread', function (R, ctx) {
    if (R.int(0, 3) === 0) {
      var x = R.pick([['Tens of thousands of words of text', 'Linear B'], ['About 7,400 signs, mostly in short lists', 'Linear A'], ['A known language to test readings against', 'Linear B'], ['No related known language', 'Linear A'], ['Many place names that match later Greek names', 'Linear B'], ['Read since 1952', 'Linear B'], ['Still undeciphered', 'Linear A']]);
      return { q: 'Which script does this describe: <b>' + esc(x[0]) + '</b>?', a: mc(x[1], [x[1] === 'Linear A' ? 'Linear B' : 'Linear A'], 2), steps: [x[0] + ': ' + x[1] + '.'], hint: 'Linear B had text, a known language and tests; Linear A lacks them.' };
    }
    return fact(R, R.pick(WHYU));
  });


  /* ================= Unit 11: Judging and Comparing ================= */
  var TESTS = ['Fixed values: each sign has one value, used everywhere', 'The whole corpus: the values read most texts, not a chosen few', 'Predictions: the reading makes sense of texts it had not seen', 'Outside checks: place names, logograms and numbers agree', 'Acceptance: independent specialists check it and agree'];
  // imaginary claims, each failing one test (no real claim or person is described)
  var CLAIMS = [
    ['An imaginary claim gives the same sign the value ka in one word and pe in another, whichever makes each word fit.', 0],
    ['An imaginary claim reads one Linear A word as Greek, the next as Egyptian and a third as Sanskrit, whichever gives a meaning.', 0],
    ['An imaginary claim offers twelve words that seem to match words of a known language and leaves the other inscriptions unread.', 1],
    ['An imaginary claim explains a few short labels but cannot read any of the longer tablets.', 1],
    ['An imaginary claim reads every known text, but when a newly found tablet is read with its values, the result is nonsense.', 2],
    ['An imaginary claim reads a word beside a sheep logogram as "wine" and the number after it as a name.', 3],
    ['An imaginary claim reads the place name pa-i-to, found near Phaistos, as a word for "sky" and makes no use of the Linear B parallels.', 3],
    ['An imaginary claim is announced to newspapers, but its author shares no full list of values for specialists to check.', 4]
  ];
  G('aegean.judging-claims', function (R, ctx) {
    var r = R.int(0, 3);
    if (r <= 1) { var c = R.pick(CLAIMS); return { q: c[0] + ' Which test of a decipherment does it fail most clearly?', a: mc(TESTS[c[1]], R.shuffle(TESTS.filter(function (_, i) { return i !== c[1]; })), 4), steps: ['A good decipherment needs: ' + TESTS.map(function (t) { return t.split(':')[0].toLowerCase(); }).join(', ') + '.', 'This one fails the test of ' + TESTS[c[1]].split(':')[0].toLowerCase() + ': ' + TESTS[c[1]].split(': ')[1] + '.'], hint: 'Ask what Ventris\'s decipherment did that this claim does not.' }; }
    if (r === 2) return tfq(R, [
      ['A few words that seem to match a known language are enough to prove a decipherment.', false, 'Chance produces matches; a decipherment must read the whole corpus with fixed values and pass new tests.'],
      ['Claims to have deciphered Linear A appear every few years; none has been accepted by specialists.', true, 'None has met the tests.'],
      ['The tripod tablet Ta 641 was a correct prediction for Ventris\'s values.', true, 'Its words, read with values fixed beforehand, matched its pictures.'],
      ['A decipherment that needs different values for the same sign in different words is likely to be wrong.', true, 'Real values stay fixed.'],
      ['If a claim is reported in the news, specialists have already accepted it.', false, 'Acceptance comes from specialists checking the evidence, often over years.']
    ]);
    return fact(R, R.pick([
      { q: 'Why are a few matching words not enough to show a decipherment is right?', a: 'Chance produces matches when you can choose sounds and meanings freely', w: ['Matching words are always forgeries', 'Words never match across languages', 'Only numbers can be deciphered', 'Because Linear A has no words'], s: ['With thousands of languages and some freedom, a few hits turn up for almost anything.', 'The test is what the values do with all the rest.'] },
      { q: 'What made the Linear B decipherment convincing?', a: 'Fixed values read thousands of words as Greek and predicted new tablets like Ta 641', w: ['Ventris announced it on the radio', 'Evans approved it', 'It used a bilingual text', 'It matched a few words only'], s: ['Consistency across the corpus and correct predictions convinced the specialists.'] },
      { q: 'Has any claim to read Linear A been accepted by specialists?', a: 'No; claims appear every few years, but none has met the tests', w: ['Yes, in 1952', 'Yes, every claim so far', 'Yes, by Arthur Evans', 'Yes, by using Ta 641'], s: ['Linear A remains undeciphered.'] }
    ]));
  });

  var SIDE = [
    ['A Pylos tablet lists ti-ri-po with the tripod sign.', 'Linear B', 'Pylos is a mainland palace and ti-ri-po is Greek.'],
    ['A stone offering table from a Cretan peak sanctuary carries a-sa-sa-ra-me and i-pi-na-ma.', 'Linear A', 'These are words of the Minoan libation formula.'],
    ['A Hagia Triada list ends with ku-ro and the sum.', 'Linear A', 'ku-ro is the Linear A word for "total".'],
    ['A list ends with to-so and the sum.', 'Linear B', 'to-so, "so many", introduces totals in Linear B.'],
    ['A tablet names the wa-na-ka and the ra-wa-ke-ta.', 'Linear B', 'These are the Greek titles of the Mycenaean palaces.'],
    ['A Knossos tablet counts horses, i-qo, with the horse sign.', 'Linear B', 'i-qo is Greek hikkʷos, horse.'],
    ['A tablet from Zakros, about 1500 BC, lists unread words and numbers with fraction signs.', 'Linear A', 'Zakros is a Minoan palace of the Linear A period; fraction signs are typical of Linear A.'],
    ['A tablet from Thebes on the mainland names te-qa.', 'Linear B', 'Thebes is a Mycenaean palace; te-qa is the Greek name of the city.']
  ];
  var FACTS2 = [
    { q: 'Which script writes Greek?', a: 'Linear B', w: ['Linear A', 'Both', 'Neither'], s: ['Linear B writes Mycenaean Greek; Linear A an unknown language.'] },
    { q: 'What do Linear A and Linear B share?', a: 'Many sign shapes and the same numerals', w: ['The same language', 'Nothing at all', 'The Greek alphabet', 'A bilingual text'], s: ['Linear B was adapted from Linear A, keeping many signs and the number system.'] },
    { q: 'Which script has the larger surviving corpus?', a: 'Linear B', w: ['Linear A', 'They are the same size', 'Neither has any texts'], s: ['About 6,000 Linear B texts against about 1,400 short Linear A inscriptions.'] },
    { q: 'Which is older?', a: 'Linear A', w: ['Linear B', 'They began in the same year', 'Neither is from the Bronze Age'], s: ['Linear A: about 1800 to 1450 BC. Linear B: about 1450 to 1200 BC.'] },
    { q: 'In which script are the sound values only a convention?', a: 'Linear A', w: ['Linear B', 'Both', 'Neither'], s: ['Linear B values are proved; Linear A borrows them by convention.'] },
    { q: 'Knowing the Latin alphabet lets you sound out Turkish but not understand it. Which script is in the same position?', a: 'Linear A', w: ['Linear B', 'The Greek alphabet', 'Neither'], s: ['We can sound out Linear A by convention, but not understand its language.'] }
  ];
  G('aegean.side-by-side', function (R, ctx) {
    var r = R.int(0, 2);
    if (r === 0) { var x = R.pick(SIDE); return { q: x[0] + ' Which script is it in?', a: mc(x[1], [x[1] === 'Linear A' ? 'Linear B' : 'Linear A', 'Cretan hieroglyphs', 'The Greek alphabet'], 4), steps: [x[2], 'So it is ' + x[1] + '.'], hint: 'Ask where it was found, what language its words are and when.' }; }
    if (r === 1) {
      var v = R.pick(LA_SYL().filter(function (s) { return SC().sign(s.v); })), LA = R.coin();
      return { q: 'The sign read ' + tl(v.v) + ' appears in both scripts: ' + sua(v.u, 2) + ' (Linear A) and ' + su(SC().sign(v.v).u, 2) + ' (Linear B). How sure is its value in ' + (LA ? 'Linear A' : 'Linear B') + '?', a: mc(LA ? 'Borrowed by convention from Linear B, not proved' : 'Proved by the decipherment of 1952', [LA ? 'Proved by the decipherment of 1952' : 'Borrowed by convention from Linear A, not proved', 'Completely unknown', 'Known from a bilingual'], 4), steps: [LA ? 'Linear A values are borrowed from Linear B on the assumption that the sounds carried over with the shapes.' : 'Linear B values were proved by the decipherment: they read thousands of words as Greek.'], hint: 'One script is read; the other is not.' };
    }
    return fact(R, R.pick(FACTS2));
  });


})(window.MathLadder);
