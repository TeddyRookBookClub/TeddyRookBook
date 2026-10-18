/* Egyptology Ladder: Religion, Art and Architecture (relart) problem generators.
   Built from /tmp/work_egypt/relart/gen/*.js by build_gen.js; do not edit the shipped file by hand.
   Facts that the kit's model holds (gods, their looks and cities, temple parts, kings and dates, sites, signs and
   spellings) come from MathLadder.egypt at run time, so the pictures and the answers agree. Other facts are banks of
   items, each [question, answer, [wrong choices], explanation, level] or { tf | n | tl | seq ... } (see make()). */
(function (ML) {
  'use strict';
  var G = ML.gen;
  function EG() { return ML.egypt; }
  function L(ctx) { return (ctx && ctx.level) || 1; }
  function tl(s) { return '<i class="eg-tl">' + s + '</i>'; }
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function nChoices(ctx) { return L(ctx) === 1 ? 3 : 4; }
  function godName(k) { return EG().god(k).name; }
  // typed transliteration answers need the 'translit' type in core/gen.js's validator; until it is there, the same
  // problem is asked as multiple choice among near misses (checked once at load time)
  var TL_TYPED = (function () { try { return ML.validateProblem({ q: 'x', steps: ['x'], a: { t: 'translit', v: 'nfr' } }).length === 0; } catch (e) { return false; } })();
  var TL_SWAPS = [['ḥ', 'h'], ['ḫ', 'ḥ'], ['ẖ', 'ḫ'], ['ṯ', 't'], ['ḏ', 'd'], ['ꜣ', 'ꜥ'], ['ꜥ', 'ꜣ'], ['š', 's'], ['nṯr', 'ntr'], ['z', 'š'], ['w', 'ꜥ'], ['jb', 'ꜣb'], ['n', 'm'], ['t', 'ṯ'], ['r', 'n']];
  function tlNear(v) {
    var out = [];
    TL_SWAPS.forEach(function (sw) { var i = v.indexOf(sw[0]); if (i >= 0) { var x = v.slice(0, i) + sw[1] + v.slice(i + sw[0].length); if (x !== v && out.indexOf(x) < 0) out.push(x); } });
    return out;
  }
  // a transliteration problem: typed when the engine allows it, else multiple choice
  function tlProblem(R, ctx, v, qTyped, qChoose, steps, hint, viz) {
    if (TL_TYPED) { var p = { q: qTyped, a: { t: 'translit', v: v }, steps: steps, hint: hint }; if (viz) p.viz = viz; return p; }
    var wr = tlNear(v).map(tl);
    if (wr.length < 3) Object.keys(EG().WORDS).forEach(function (k) { var o = EG().WORDS[k].tl; if (o !== v && o.length === v.length) wr.push(tl(o)); });
    return mc(R, ctx, qChoose, tl(v), wr, steps, hint, viz);
  }

  // one multiple-choice problem: the right answer first (makeProblem shuffles), wrongs sampled
  function mc(R, ctx, q, right, wrongs, steps, hint, viz, k) {
    var pool = wrongs.filter(function (w) { return w !== right; });
    var n = Math.min((k || nChoices(ctx)) - 1, pool.length);
    var p = { q: q, a: { t: 'mc', choices: [right].concat(R.sample(pool, n)), v: 0 }, steps: [].concat(steps), hint: hint };
    if (viz) p.viz = viz;
    return p;
  }
  // a bank item -> problem.  Arrays: [q, a, wrongs, why, level, hint?].  Objects:
  //   { tf: bool, q, s, l }            true or false
  //   { n: number, q, s, l, unit? }    a typed number
  //   { tl: 'mꜣꜥt', q, s, l, viz }     a typed transliteration
  //   { seq: [a, b, c, d], q, s, l }   choose the right order (the wrong orders are made by swapping)
  //   { q, a, w, s, l, viz, h }        multiple choice with a picture
  function make(R, ctx, it, hint) {
    if (Array.isArray(it)) it = { q: it[0], a: it[1], w: it[2], s: it[3], l: it[4], h: it[5] };
    var steps = [].concat(it.s);
    var h = it.h || hint;
    var p;
    if (it.tf !== undefined) {
      p = { q: 'True or false? ' + it.q, a: { t: 'tf', v: it.tf }, steps: steps.concat(['So the statement is ' + (it.tf ? 'true' : 'false') + '.']), hint: h };
    } else if (it.n !== undefined) {
      p = { q: it.q, a: { t: 'num', v: String(it.n) }, steps: steps, hint: h };
      if (it.unit) p.unit = it.unit;
    } else if (it.tl !== undefined) {
      p = tlProblem(R, ctx, it.tl, it.q, it.q.replace(/^Transliterate /, 'Choose the transliteration of '), steps, h);
    } else if (it.seq) {
      var right = it.seq.join(' → '), wr = [], n = it.seq.length;
      for (var i = 0; i < n - 1; i++) { var c = it.seq.slice(); var t = c[i]; c[i] = c[i + 1]; c[i + 1] = t; wr.push(c.join(' → ')); }
      if (n > 2) { var c2 = it.seq.slice(); var t2 = c2[0]; c2[0] = c2[n - 1]; c2[n - 1] = t2; wr.push(c2.join(' → ')); }
      wr.push(it.seq.slice().reverse().join(' → '));
      var uniq = []; wr.forEach(function (x) { if (x !== right && uniq.indexOf(x) < 0) uniq.push(x); });
      p = mc(R, ctx, it.q, right, uniq, steps.concat(['The order is ' + right + '.']), h, null, 4);
    } else {
      p = mc(R, ctx, it.q, it.a, it.w, steps.concat(['Answer: ' + it.a + '.']), h);
    }
    if (it.viz) p.viz = it.viz;
    if (it.k) p.chk = it.k;
    return p;
  }
  // pick from a bank by level: items of this level or below, items of exactly this level twice as likely
  function fromBank(R, ctx, bank) {
    var lv = L(ctx), pool = [], w = [];
    bank.forEach(function (it) {
      var l = (Array.isArray(it) ? it[4] : it.l) || 1;
      if (l <= lv) { pool.push(it); w.push(l === lv ? 2 : 1); }
    });
    if (!pool.length) pool = bank, w = bank.map(function () { return 1; });
    return R.pickW(pool, w);
  }
  // a topic: a bank plus model-driven makers [fn(R, ctx) -> problem | null, weight]
  function topic(id, bank, hint, makers) {
    G(id, function (R, ctx) {
      makers = makers || [];
      var total = 1 + makers.reduce(function (s, m) { return s + m[1]; }, 0), r = R.next() * total;
      for (var i = 0; i < makers.length; i++) {
        r -= makers[i][1];
        if (r < 0) { var p = makers[i][0](R, ctx); if (p) { if (!p.hint) p.hint = hint; return p; } break; }
      }
      return make(R, ctx, fromBank(R, ctx, bank), hint);
    });
  }

  // ---------------------------------------------------------------- model-driven makers, shared by several topics
  // the gods with a home city that is a site on the map
  var GOD_SITE = { ra: 'heliopolis', atum: 'heliopolis', amun: 'karnak', osiris: 'abydos', isis: 'philae', horus: 'edfu', thoth: 'hermopolis', hathor: 'dendera', ptah: 'memphis', bastet: 'bubastis', khnum: 'elephantine', aten: 'amarna' };
  // gods that must not be wrong choices for each other in "who looks like this?" (their pictures overlap)
  var LOOK_CLASH = { isis: ['hathor'], hathor: ['isis'], shu: ['maat'], maat: ['shu'] };
  // identify a god from how temple art shows them (GODS.look)
  function godByLook(R, ctx, keys) {
    var E = EG(), key = R.pick(keys), g = E.god(key);
    var near = { ra: ['horus', 'khepri', 'atum'], horus: ['ra', 'atum', 'anubis'], isis: ['nephthys', 'maat', 'sekhmet'], hathor: ['bastet', 'sekhmet', 'nut'], amun: ['ptah', 'osiris', 'atum'], osiris: ['ptah', 'amun', 'anubis'], ptah: ['osiris', 'amun', 'khnum'], maat: ['isis', 'nephthys', 'hathor'], anubis: ['seth', 'thoth', 'horus'], thoth: ['horus', 'anubis', 'khnum'], seth: ['anubis', 'sobek', 'khnum'], sekhmet: ['bastet', 'hathor', 'taweret'], bastet: ['sekhmet', 'hathor', 'isis'], sobek: ['taweret', 'khnum', 'seth'], khnum: ['amun', 'sobek', 'ptah'], atum: ['horus', 'ra', 'ptah'], nut: ['hathor', 'isis', 'geb'], geb: ['nut', 'shu', 'osiris'], shu: ['geb', 'nut', 'atum'], aten: ['ra', 'khepri', 'atum'], khepri: ['ra', 'aten', 'atum'], bes: ['taweret', 'khnum', 'ptah'], taweret: ['bes', 'sobek', 'hathor'], nephthys: ['isis', 'maat', 'hathor'], hapi: ['geb', 'osiris', 'ptah'] };
    var clash = LOOK_CLASH[key] || [];
    function okk(k) { return k !== key && clash.indexOf(k) < 0 && !!E.god(k); }
    var nearOk = (near[key] || []).filter(okk);
    var pool = L(ctx) >= 2 && nearOk.length >= 3 ? nearOk : keys.filter(okk);
    var names = pool.map(godName);
    var p = mc(R, ctx, 'In Egyptian art, a deity is shown as <b>' + g.look + '</b>. Who is it?', g.name, names,
      [g.name + ' is shown as ' + g.look + '.', g.name + ': ' + g.role + '.'], 'Look for the head, the crown or the emblem; several gods share an animal.');
    p.chk = { k: 'look', god: key };
    return p;
  }
  // the home city of a god (GODS.center), both ways
  function godCity(R, ctx, keys) {
    var E = EG(), key = R.pick(keys), g = E.god(key);
    var others = keys.filter(function (k) { return k !== key && E.god(k).center !== g.center; });
    if (R.coin()) {
      var cities = []; others.forEach(function (k) { var c = E.god(k).center; if (cities.indexOf(c) < 0) cities.push(c); });
      var p = mc(R, ctx, 'Which city was the main cult center of <b>' + g.name + '</b> (' + g.role + ')?', g.center, R.shuffle(cities),
        [g.name + '’s main temple and cult were at ' + g.center + '.'], 'Tie each god to one city.');
      p.chk = { k: 'center', god: key, ans: 'city' }; return p;
    }
    var p2 = mc(R, ctx, 'Which god had the main cult center at <b>' + g.center + '</b>?', g.name, R.shuffle(others).map(godName),
      [g.center + ' was the home of ' + g.name + ', ' + g.role + '.'], 'Tie each god to one city.');
    p2.chk = { k: 'center', god: key, ans: 'god' }; return p2;
  }
  // a lettered map: which dot is the site?  (choices far enough apart to tell them apart)
  function mapPick(R, ctx, target, pool, q, steps) {
    var E = EG(), t = E.site(target), picks = [t];
    R.shuffle(pool).forEach(function (k) {
      var s = E.site(k); if (!s || picks.length >= nChoices(ctx)) return;
      if (picks.every(function (o) { return E.km(o, s) > 90; })) picks.push(s);
    });
    if (picks.length < 3) return null;
    picks = R.shuffle(picks);
    var letters = picks.map(function (_, i) { return 'ABCDEF'.charAt(i); }), at = picks.indexOf(t);
    var p = { q: q, a: { t: 'mc', choices: letters, v: at, keep: true },
      viz: { name: 'eg-map', opts: { mode: 'pick', target: target, choices: picks.map(function (s) { return s.key; }), quiet: true, interactive: false, labels: false, cities: false, sites: 'none', view: picks.some(function (s) { return s.lat < 23.5; }) ? 'nile' : 'egypt' } },
      steps: [].concat(steps).concat(['On the map, ' + t.name + ' is dot ' + letters[at] + '. The other dots: ' + picks.filter(function (s) { return s !== t; }).map(function (s) { return letters[picks.indexOf(s)] + ' ' + s.name; }).join(', ') + '.']) };
    p.chk = { k: 'map', site: target, keys: picks.map(function (s) { return s.key; }) };
    return p;
  }
  // a period from the model for a king key
  function periodName(kkey) { var E = EG(); return E.period(E.king(kkey).period).name; }
  function reign(kkey) { var E = EG(), k = E.king(kkey); return k.from === k.to ? E.year(k.from, true) : E.span(k.from, k.to, true); }
  // read a word in quiet glyphs and type its transliteration
  function translitWord(R, ctx, wkey, extra) {
    var E = EG(), w = E.WORDS[wkey];
    var steps = w.parts.map(function (pt) { var s = E.sign(pt[0]); return pt[0] + ' (' + s.n + '): ' + (pt[1] === 'det' ? 'a determinative, not read' : pt[1] === 'stroke' ? 'a stroke: the sign means what it shows' : 'reads ' + pt[2] + (pt[1] === 'comp' ? ' (a phonetic complement, repeating a sound already written)' : '')); })
        .concat([tl(w.tl) + ' (typed ' + E.mdc(w.tl) + '), "' + w.en + '".']);
    var x = extra ? ' (' + extra + ')' : '';
    var p = tlProblem(R, ctx, w.tl, 'Transliterate this word' + x + '.', 'Which transliteration matches this word' + x + '?', steps,
      'Read the sound signs; a determinative at the end is not pronounced, and a phonetic complement repeats a sound.', { name: 'eg-glyphs', opts: { word: wkey, quiet: true, interactive: false } });
    p.chk = { k: 'word', word: wkey };
    return p;
  }
  // ================================================================ Unit: The Gods and Their Cults
  var ALL_LOOK = ['ra', 'amun', 'osiris', 'isis', 'horus', 'seth', 'anubis', 'thoth', 'hathor', 'ptah', 'maat', 'bastet', 'sekhmet', 'sobek', 'khnum', 'atum', 'khepri', 'bes', 'taweret', 'nephthys', 'nut', 'shu', 'aten', 'hapi'];
  var CITY_GODS = ['ra', 'amun', 'osiris', 'horus', 'thoth', 'hathor', 'ptah', 'bastet', 'khnum', 'isis'];

  topic('relart.many-gods', [
    ['The Egyptian word ' + tl('nṯr') + ' (netjer), written with a cloth wound on a pole, means:', 'god', ['king', 'temple', 'priest', 'sacred animal'], 'nṯr is the ordinary word for "god"; the flag sign (R8) stood in front of temples.', 1],
    ['In one common scheme, the sun god had three forms through the day. Which form stood for the <b>rising morning sun</b>?', 'Khepri, the scarab', ['Atum, the old man of evening', 'Ra at noon', 'Osiris, ruler of the dead'], 'Khepri (the scarab, "he who comes into being") was the morning sun, Ra the sun at its height, Atum the evening sun.', 1],
    ['In one common scheme, the sun god had three forms through the day. Which form stood for the <b>evening sun</b>?', 'Atum', ['Khepri', 'Horus', 'Hapi'], 'Khepri was the morning sun, Ra the noon sun, Atum the setting sun.', 2],
    ['Thoth could be shown as an ibis, as a man with an ibis head, or as a baboon. What does this tell us?', 'One god could take several forms', ['These were three different gods', 'Thoth was worshiped only as an animal', 'The baboon form was a foreign god'], 'Egyptians saw the forms as ways the same god showed himself; each form showed a side of him.', 2],
    ['The Apis bull, kept at Memphis and buried with honors in the Serapeum at Saqqara, was linked with which god?', 'Ptah', ['Amun', 'Thoth', 'Sobek'], 'The living Apis bull was seen as a manifestation of Ptah, the god of Memphis.', 2],
    ['Why is a god like Anubis shown as a man with a jackal’s head?', 'The animal shows a quality or role of the god', ['Egyptians thought the god was an ordinary jackal', 'Artists could not draw a human head', 'Only priests wore jackal masks, so gods did too'], 'The jackal, seen around desert cemeteries, suited the god who guarded the dead. The head is a sign of what the god is like, not a portrait.', 1],
    ['Several gods could share one role. Which of these were <b>both</b> sun gods?', 'Ra and Khepri', ['Ptah and Osiris', 'Thoth and Anubis', 'Bes and Taweret'], 'Ra, Khepri, Atum and (in combined forms) Horus were all linked with the sun.', 2],
    ['Late Period Egyptians buried millions of mummified ibises at Saqqara and Tuna el-Gebel. What were they most likely?', 'Offerings to Thoth, given by visitors', ['Pets buried by their owners', 'Food for the dead', 'Animals killed as pests'], 'Ibis mummies were bought by pilgrims and dedicated to Thoth, as a lasting prayer.', 3],
    { tf: false, q: 'Egyptians worshiped animals simply as animals.', s: 'Animal forms showed the qualities of a god, and a few chosen animals (like the Apis bull) were believed to house a god’s presence.', l: 1 },
    { tf: true, q: 'One god could be shown in several different forms.', s: 'Hathor could be a cow or a woman with cow horns; Thoth an ibis or a baboon.', l: 1 },
    { tf: false, q: 'Every Egyptian god had a fixed shape that never changed.', s: 'Gods had several forms and could be combined with other gods.', l: 2 },
    { tl: 'nṯr', q: 'Transliterate the word for "god" (the flag on a pole with the seated god determinative).', s: ['R8, the flag on a pole, writes nṯr by itself.', 'A40, the seated god, is a determinative and is not read.', 'Answer: ' + tl('nṯr') + ' (typed nTr).'], l: 3, viz: { name: 'eg-glyphs', opts: { word: 'netjer', quiet: true, interactive: false } } }
  ], 'A god’s animal form shows what the god is like; the same god can have several forms.', [
    [function (R, ctx) { return L(ctx) >= 2 ? translitWord(R, ctx, 'netjer', 'the flag on a pole is a word sign') : null; }, 0.3]
  ]);

  topic('relart.god-forms', [
    ['Ra and Horus are both shown with a falcon’s head. What usually tells you the figure is <b>Ra</b>?', 'A sun disk on the head', ['A double crown on the head', 'A crook and flail', 'A throne sign on the head'], 'Ra wears the sun disk (often with a cobra); Horus usually wears the double crown of Upper and Lower Egypt.', 1],
    ['A goddess has a hieroglyph shaped like a <b>throne</b> on her head. Who is she?', 'Isis', ['Nephthys', 'Maat', 'Hathor'], 'The throne (seat) sign writes her name, ꜣst; later she also wears cow horns and a sun disk, like Hathor.', 1],
    ['A god holds a crook and a flail and is wrapped like a mummy. Who is he?', 'Osiris', ['Ptah', 'Amun', 'Anubis'], 'The crook and flail are royal emblems; Osiris, the dead king who rules the dead, holds them.', 1],
    ['A god wears a crown with <b>two tall plumes</b>. Who is he?', 'Amun', ['Osiris', 'Atum', 'Shu'], 'Amun’s crown has two tall feathers; Osiris’s white crown has a plume on each side.', 2],
    ['A goddess wears <b>one ostrich feather</b> on her head. Who is she?', 'Maat', ['Isis', 'Nephthys', 'Nut'], 'The feather is Maat’s emblem; it is also the feather on the scale in the judgment of the dead.', 1],
    ['A god has a mummy-like body, a close skullcap and a tall scepter. Who is he?', 'Ptah', ['Osiris', 'Amun', 'Khnum'], 'Ptah of Memphis wears a skullcap and holds a scepter that combines the was, ankh and djed signs.', 2],
    ['A goddess with cow horns and a sun disk could be Hathor. Which other goddess wears the same crown in later art?', 'Isis', ['Maat', 'Sekhmet', 'Bastet'], 'In the New Kingdom and later, Isis took over Hathor’s horned crown, so you need the label or the scene to tell them apart.', 3],
    ['A woman with the signs for "lady of the house" (a basket on a house) on her head is:', 'Nephthys', ['Isis', 'Hathor', 'Maat'], 'Her name, nbt-ḥwt, means "lady of the house (or mansion)", and she wears it as her emblem.', 3],
    ['A man with a ram’s head, linked with the First Cataract, is:', 'Khnum', ['Amun', 'Sobek', 'Thoth'], 'Khnum, the potter god of Elephantine, has a ram’s head. Amun could also be a ram, but his usual human form wears the two plumes.', 2],
    { tf: false, q: 'If two gods have the same animal head, they are the same god.', s: 'Ra and Horus both have falcon heads; the sun disk or the double crown tells them apart.', l: 1 },
    { tf: true, q: 'The words written beside a figure are the surest way to know which god it is.', s: 'Scenes name each god in hieroglyphs; emblems help, but forms overlap.', l: 2 }
  ], 'Look past the animal head to the crown, the emblem and the label.', [
    [function (R, ctx) { return godByLook(R, ctx, ALL_LOOK); }, 1.6]
  ]);

  topic('relart.cult-centers', [
    ['Why could a god be very important in one city and minor in another?', 'Each city honored its own gods first', ['Gods were banned outside their cities', 'Only one god was worshiped in all Egypt', 'Cities chose a new god every year'], 'Every town had its own temple and local gods; the great gods of the capital spread more widely.', 1],
    ['The Greeks called Ra’s city Heliopolis, "sun city". What did Egyptians call it?', 'Iunu', ['Waset', 'Mennefer', 'Abdju'], 'Heliopolis was Iunu; Thebes was Waset, Memphis Mennefer, Abydos Abdju.', 3],
    ['Amun rose from a local god to the king of the gods. Which city’s god was he?', 'Thebes', ['Memphis', 'Heliopolis', 'Hermopolis'], 'Amun was the god of Thebes; when Theban kings ruled all Egypt, Amun rose with them.', 2],
    ['Pilgrims came to Abydos for centuries and set up stelae there. Why?', 'It was the cult center of Osiris', ['It was the capital of the Hyksos', 'It held the Great Pyramid', 'It was Amun’s main temple'], 'Abydos was Osiris’s holy city, where his burial place was believed to be.', 2]
  ], 'Each great god belongs to a city; learn the pairs: Ptah–Memphis, Ra–Heliopolis, Amun–Thebes, Thoth–Hermopolis, Osiris–Abydos, Hathor–Dendera.', [
    [function (R, ctx) { return godCity(R, ctx, CITY_GODS); }, 2],
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      var key = R.pick(Object.keys(GOD_SITE).filter(function (k) { return k !== 'atum' && k !== 'aten'; })), g = EG().god(key);
      var pool = Object.keys(GOD_SITE).map(function (k) { return GOD_SITE[k]; }).concat(['giza', 'abu-simbel', 'tanis', 'sais', 'meidum', 'buto', 'alexandria']);
      var p = mapPick(R, ctx, GOD_SITE[key], pool, 'Which lettered dot marks the main cult center of <b>' + g.name + '</b>?', [g.name + '’s cult center was ' + EG().site(GOD_SITE[key]).name + '. ' + EG().site(GOD_SITE[key]).note]);
      if (p) p.chk.god = key;
      return p;
    }, 1]
  ]);

  topic('relart.families', [
    ['At Thebes, Amun’s wife was Mut. Who was their son?', 'Khonsu, the moon god', ['Horus', 'Nefertem', 'Thoth'], 'The Theban triad: Amun, Mut and their son Khonsu.', 1],
    ['At Memphis, Ptah’s wife was the lioness Sekhmet. Who was their son?', 'Nefertem, the lotus god', ['Khonsu', 'Horus', 'Anubis'], 'The Memphite triad: Ptah, Sekhmet and Nefertem.', 1],
    ['Which family of three is linked most closely with kingship?', 'Osiris, Isis and Horus', ['Amun, Mut and Khonsu', 'Ptah, Sekhmet and Nefertem', 'Khnum, Satet and Anuket'], 'The king was Horus, son of Osiris and Isis; the dead king became Osiris.', 2],
    ['Khonsu belongs to which triad?', 'Amun, Mut and Khonsu (Thebes)', ['Ptah, Sekhmet and Nefertem (Memphis)', 'Osiris, Isis and Horus', 'Khnum, Satet and Anuket (Elephantine)'], 'Khonsu was the son of Amun and Mut at Thebes.', 2],
    ['Nefertem belongs to which city’s triad?', 'Memphis', ['Thebes', 'Abydos', 'Elephantine'], 'Ptah, Sekhmet and Nefertem were the triad of Memphis.', 2],
    ['At the First Cataract, Khnum was worshiped with two goddesses. Who were they?', 'Satet and Anuket', ['Mut and Sekhmet', 'Isis and Nephthys', 'Hathor and Maat'], 'Khnum, Satet and Anuket formed the triad of Elephantine.', 3],
    ['Mut, the wife of Amun, had her own temple precinct. Where?', 'At Karnak, south of Amun’s', ['At Giza', 'At Abydos, beside Osiris', 'At Memphis'], 'The Precinct of Mut lies just south of the great temple of Amun at Karnak.', 3],
    { tf: true, q: 'Egyptians often grouped a city’s gods as a father, a mother and a child.', s: 'Thebes had Amun, Mut and Khonsu; Memphis had Ptah, Sekhmet and Nefertem.', l: 1 },
    { tf: false, q: 'Sekhmet was the wife of Amun at Thebes.', s: 'Sekhmet was Ptah’s wife at Memphis; Amun’s wife was Mut.', l: 2 },
    { seq: ['father Amun', 'mother Mut', 'son Khonsu'], q: 'Which line gives the Theban triad as father, mother, son?', s: 'Amun is the father, Mut the mother, Khonsu the son.', l: 3 }
  ], 'Tie each triad to its city: Thebes (Amun, Mut, Khonsu), Memphis (Ptah, Sekhmet, Nefertem).');

  topic('relart.osiris-myth', [
    ['In the myth, who killed Osiris?', 'Seth, his brother', ['Horus, his son', 'Anubis', 'Ra'], 'Seth, jealous of his brother the king, killed him.', 1],
    ['Who searched for Osiris, restored his body and became the mother of Horus?', 'Isis', ['Nephthys', 'Hathor', 'Maat'], 'Isis, wife and sister of Osiris, gathered and restored him, helped by Nephthys and Anubis.', 1],
    ['Who won the throne of Egypt after the contest with Seth?', 'Horus', ['Osiris', 'Thoth', 'Anubis'], 'The gods judged in favor of Horus, son of Osiris; Osiris became ruler of the dead.', 1],
    ['After his death, what did Osiris rule?', 'The realm of the dead', ['The sky by day', 'The desert', 'The city of Thebes'], 'Osiris became king of the dead; every justified dead person hoped to be joined with him.', 1],
    ['Where is the fullest single telling of the Osiris myth found?', 'In Plutarch’s Greek essay On Isis and Osiris', ['In one Pyramid Text spell', 'On the Rosetta Stone', 'In the Book of the Dead, spell 125'], 'Egyptian texts give pieces of the story; Plutarch, a Greek writer of about AD 100, told it from start to end.', 2],
    ['In the fight with Seth, Horus’s eye was hurt and then healed. What did the healed eye become?', 'The wedjat eye, a sign of wholeness and protection', ['The sun disk of Ra', 'The feather of Maat', 'The ankh, the sign of life'], 'The wedjat ("sound" or "whole") eye became one of the most common amulets.', 2],
    ['How did the myth match the life of real kings?', 'The living king was Horus; the dead king became Osiris', ['The living king was Seth; the dead king became Horus', 'Kings played Osiris in a yearly play and then retired', 'Only queens were linked with the myth'], 'Each new king, as Horus, buried his predecessor, who became Osiris.', 2],
    ['A New Kingdom story on papyrus tells of the long trial between Horus and Seth before the gods. What is it called today?', 'The Contendings of Horus and Seth', ['The Tale of Sinuhe', 'The Eloquent Peasant', 'The Book of Gates'], 'The Contendings, on a 20th Dynasty papyrus (Chester Beatty I), tells the trial with humor.', 3],
    { tf: false, q: 'Egyptian texts tell the Osiris myth in one fixed official version.', s: 'Egyptian texts allude to parts of the story, and details differ; the only complete telling is Plutarch’s, much later.', l: 2 },
    { tf: true, q: 'Seth was a brother of Osiris.', s: 'In the Heliopolis family, Osiris, Isis, Seth and Nephthys were children of Geb and Nut.', l: 1 },
    { seq: ['Seth kills Osiris', 'Isis restores Osiris', 'Horus is born', 'Horus wins the throne'], q: 'Put the main events of the myth in order.', s: 'Death, restoration, the birth of the heir, and his victory.', l: 3 }
  ], 'Four roles: Osiris the murdered king, Seth the killer, Isis the restorer, Horus the heir.');

  topic('relart.amun-ra', [
    ['What does the name Amun (' + tl('jmn') + ') mean?', 'The hidden one', ['The shining one', 'The great house', 'The beautiful one'], 'jmn means "hidden"; Amun was the unseen power behind things.', 1],
    ['Amun-Ra joins which two gods?', 'Amun of Thebes and the sun god Ra', ['Amun and the moon god Khonsu', 'Atum and Ra', 'Osiris and Ra'], 'Amun-Ra combines the hidden god of Thebes with the sun god of Heliopolis.', 1],
    ['When was Amun-Ra king of the gods and the great god of the state?', 'The New Kingdom', ['The Predynastic Period', 'The Early Dynastic Period', 'The Old Kingdom'], 'Amun grew with the Theban kings of the Middle Kingdom and led the gods in the New Kingdom, when Karnak became the richest temple.', 2],
    ['After Amun-Ra appeared, what happened to the separate cults of Amun and Ra?', 'Both went on, side by side with Amun-Ra', ['They were closed for good', 'Ra was forgotten', 'Amun was renamed Ra everywhere'], 'Combining gods added a form; it did not erase the older ones.', 2],
    ['Which of these is another combined god?', 'Ra-Horakhty, "Ra, Horus of the Two Horizons"', ['Mut-Khonsu-Thebes', 'Akhenaten-Aten', 'Seth-Osiris'], 'Ra joined with Horus of the horizon; other pairs include Sobek-Ra and Khnum-Ra.', 2],
    ['The kings of the 12th Dynasty called themselves Amenemhat. What does the name show?', 'Amun was already important to Theban kings in the Middle Kingdom', ['Amun was a foreign god', 'Kings could not use Ra in names', 'Amun was a god of the Delta'], 'Amenemhat means "Amun is foremost": the god was already honored by the royal family.', 3],
    ['Which king set Amun aside and closed his temples for a time?', 'Akhenaten', ['Ramesses II', 'Thutmose III', 'Tutankhamun'], 'Akhenaten put the Aten above all gods; Tutankhamun restored Amun.', 2],
    { tf: false, q: 'When Amun and Ra were joined as Amun-Ra, Ra stopped being worshiped.', s: 'Ra kept his own cult, especially at Heliopolis.', l: 1 },
    { tf: true, q: 'A combined god like Amun-Ra kept the names of both gods.', s: 'The joined name shows that one god is present in the other.', l: 1 }
  ], 'Combined gods add a form; the older gods go on being worshiped.', [
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      var seq = ['amenemhat1', 'thutmose3', 'akhenaten', 'tutankhamun'];
      var names = seq.map(function (k) { return EG().king(k).name; });
      var p = make(R, ctx, { seq: names, q: 'Put these kings in order, earliest first: the story of Amun from his rise to his return.', s: seq.map(function (k) { return EG().king(k).name + ': ' + reign(k) + '.'; }), l: 2 });
      p.chk = { k: 'order', kings: seq };
      return p;
    }, 0.4]
  ]);
  // ================================================================ Unit: Creation Accounts
  var ENNEAD = [['Atum', 'the creator'], ['Shu', 'air'], ['Tefnut', 'moisture'], ['Geb', 'the earth'], ['Nut', 'the sky'], ['Osiris', ''], ['Isis', ''], ['Seth', ''], ['Nephthys', '']];
  var OGDOAD = [['Nun', 'Naunet', 'the waters'], ['Heh', 'Hauhet', 'endlessness'], ['Kek', 'Kauket', 'darkness'], ['Amun', 'Amaunet', 'hiddenness']];

  topic('relart.heliopolis', [
    ['In the Heliopolis account, who was the creator who rose from the waters?', 'Atum', ['Ptah', 'Amun', 'Osiris'], 'Atum, "the complete one", came into being by himself in the waters of Nun.', 1],
    ['What was Nun?', 'The dark, endless waters before creation', ['The first mound of earth', 'The sky goddess', 'The sun at night'], 'Nun was the watery state before anything existed; it still surrounded the ordered world.', 1],
    ['Atum’s first children were a pair. Who were they?', 'Shu (air) and Tefnut (moisture)', ['Geb (earth) and Nut (sky)', 'Osiris and Isis', 'Seth and Nephthys'], 'Atum produced Shu and Tefnut by himself; Pyramid Texts say he sneezed out Shu and spat out Tefnut.', 1],
    ['Shu and Tefnut were the parents of which pair?', 'Geb (earth) and Nut (sky)', ['Osiris and Isis', 'Seth and Nephthys', 'Horus and Hathor'], 'The second generation: Geb, the earth, and Nut, the sky.', 1],
    ['Which god held the sky goddess Nut up, apart from the earth god Geb?', 'Shu, the god of air', ['Atum', 'Thoth', 'Horus'], 'Shu, the air between earth and sky, is shown lifting Nut above Geb.', 2],
    ['Geb and Nut were the parents of which four gods?', 'Osiris, Isis, Seth and Nephthys', ['Shu, Tefnut, Horus and Thoth', 'Amun, Mut, Khonsu and Montu', 'Ptah, Sekhmet, Nefertem and Apis'], 'The third generation brings the gods of the Osiris story.', 2],
    ['What was the Greek name for the group of nine gods of Heliopolis?', 'The Ennead', ['The Ogdoad', 'The Triad', 'The Pantheon'], 'Ennead is from Greek "nine"; the Egyptian word was psḏt (pesedjet).', 1],
    ['Which god was later joined with Atum as the creator at Heliopolis?', 'Ra', ['Ptah', 'Thoth', 'Osiris'], 'Atum and Ra were joined as Ra-Atum (or Atum-Ra), the sun as creator.', 2],
    ['How many generations of gods descend from Atum in the Ennead (not counting Atum)?', 'Three', ['Two', 'Four', 'Nine'], 'Shu and Tefnut; Geb and Nut; then Osiris, Isis, Seth and Nephthys.', 3],
    { n: 9, q: 'How many gods were in the Ennead of Heliopolis?', s: ['Atum; Shu and Tefnut; Geb and Nut; Osiris, Isis, Seth and Nephthys.', '1 + 2 + 2 + 4 = 9.'], l: 1 },
    { tf: false, q: 'In the Heliopolis account, the creator is Ptah.', s: 'Ptah is the creator in the Memphis account; at Heliopolis it is Atum.', l: 1 },
    { seq: ['Atum', 'Shu and Tefnut', 'Geb and Nut', 'Osiris, Isis, Seth and Nephthys'], q: 'Put the generations of the Ennead in order, first to last.', s: 'Each generation is the children of the one before.', l: 3 }
  ], 'Atum first; then Shu and Tefnut; then Geb and Nut; then Osiris, Isis, Seth and Nephthys: nine in all.', [
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      var t = R.pick(['geb', 'nut', 'shu']), g = EG().god(t);
      var p = mc(R, ctx, 'In the Heliopolis account, which god is shown as <b>' + g.look + '</b>?', g.name, ['Geb', 'Nut', 'Shu', 'Atum'].filter(function (n) { return n !== g.name; }),
        [g.name + ': ' + g.role + ', shown as ' + g.look + '.'], 'Earth lies below, the sky arches over, and the air holds them apart.');
      p.chk = { k: 'look', god: t };
      return p;
    }, 0.4]
  ]);

  topic('relart.memphis', [
    ['In the Memphis account, how did Ptah create?', 'By thought (the heart) and command (the tongue)', ['By shaping people on a potter’s wheel', 'By sneezing and spitting', 'By laying a cosmic egg'], 'Ptah conceived things in his heart and brought them into being by speaking their names.', 1],
    ['On what object does the Memphite Theology survive?', 'The Shabaka Stone', ['The Rosetta Stone', 'The Narmer Palette', 'The Palermo Stone'], 'A slab inscribed under King Shabaka, now in the British Museum.', 1],
    ['King Shabaka, who had the text carved, belonged to which dynasty?', 'The 25th (Kushite) Dynasty', ['The 4th Dynasty', 'The 18th Dynasty', 'The Ptolemaic Dynasty'], 'Shabaka was a king of Kush who ruled Egypt c. 716–702 BC.', 2],
    ['The stone says the text was copied from an old original. What did it say was wrong with the original?', 'It had been eaten by worms', ['It was written in Greek', 'It had been burned', 'It was buried under the Sphinx'], 'Shabaka says he found the ancestors’ work worm-eaten and had it copied on stone.', 2],
    ['Why is much of the Shabaka Stone worn away?', 'It was later used as a millstone', ['It was struck by lightning', 'It was scraped clean by priests', 'It was left in the sea'], 'A square hole and grinding marks show it was reused for grinding.', 2],
    ['When was the Memphite Theology first composed?', 'Debated: it may be Old Kingdom, New Kingdom or Shabaka’s own time', ['Certainly in the Old Kingdom', 'Certainly under Alexander the Great', 'Certainly in the Roman period'], 'The language looks old, but many scholars now think it was written later in an old style; there is no agreement.', 2],
    ['In the Memphis account, the Ennead of Atum are pictured as:', 'The teeth and lips in Ptah’s mouth', ['Ptah’s children by Sekhmet', 'Stars on Ptah’s robe', 'Enemies Ptah defeated'], 'The gods who create at Heliopolis become the organs of Ptah’s speech: the older account is placed inside the newer one.', 3],
    ['Which god was the creator in the Memphis account?', 'Ptah', ['Atum', 'Amun', 'Khnum'], 'Ptah, the god of Memphis and patron of craftsmen.', 1],
    { tf: false, q: 'Scholars agree that the Memphite Theology was composed in the Old Kingdom.', s: 'Early scholars thought so; since the 1970s many have argued for a later date. The question is open.', l: 2 },
    { tf: true, q: 'The Memphis account makes Ptah greater than Atum, the creator of Heliopolis.', s: 'Atum and the Ennead come into being through Ptah’s heart and tongue.', l: 2 },
    { tf: true, q: 'The Shabaka Stone was carved in the 25th Dynasty, whatever the date of the text on it.', s: 'The stone itself is from Shabaka’s reign; the debate is about how old the text is.', l: 3 }
  ], 'Ptah made the world by thinking it and saying it; the stone is from Shabaka’s reign, and the text’s date is debated.', [
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      var E = EG(), d = E.DYNASTIES.filter(function (x) { return x.n === 25; })[0], per = E.period(d.period);
      var wr = E.PERIODS.filter(function (x) { return x.key !== per.key && ['ok', 'mk', 'nk', 'late', 'ptol'].indexOf(x.key) >= 0; }).map(function (x) { return x.name; });
      var p = mc(R, ctx, 'Shabaka ruled in the 25th Dynasty. In which period does the 25th Dynasty fall?', per.name, wr, ['The 25th Dynasty (' + E.span(d.from, d.to, true) + ') is the last dynasty of the ' + per.name + ' (' + E.span(per.from, per.to, true) + ').']);
      p.chk = { k: 'dynper', dyn: 25 };
      return p;
    }, 0.4]
  ]);

  topic('relart.hermopolis', [
    ['How many gods began creation in the Hermopolis account?', 'Eight', ['Nine', 'Three', 'Four'], 'The Ogdoad, "the Eight": four pairs of gods and goddesses.', 1],
    ['What was the group of eight gods called?', 'The Ogdoad', ['The Ennead', 'The Triad', 'The Duat'], 'Ogdoad is from Greek "eight"; Ennead (nine) belongs to Heliopolis.', 1],
    ['Hermopolis’s Egyptian name, Khemenu, means:', 'Eight Town', ['Sun City', 'House of Thoth', 'White Walls'], 'The name comes from ḫmn, "eight", after the eight gods.', 2],
    ['Why did the Greeks call the city Hermopolis?', 'They matched its god Thoth with their god Hermes', ['Hermes founded the city', 'It was a Greek colony', 'It held a temple of Zeus'], 'Thoth, god of writing and wisdom, was equated with Hermes.', 2],
    ['How were the eight gods often shown?', 'Gods with frogs’ heads and goddesses with snakes’ heads', ['As eight falcons', 'As ram-headed men', 'As stars on the sky goddess'], 'Frogs and snakes, creatures of the mud and water, suited the primeval waters.', 3],
    ['Which pair of the Ogdoad stands for the waters?', 'Nun and Naunet', ['Heh and Hauhet', 'Kek and Kauket', 'Amun and Amaunet'], 'Nun and Naunet are the waters; Heh and Hauhet endlessness; Kek and Kauket darkness; Amun and Amaunet hiddenness.', 2],
    ['Which pair of the Ogdoad stands for darkness?', 'Kek and Kauket', ['Nun and Naunet', 'Heh and Hauhet', 'Amun and Amaunet'], 'kkw means "darkness".', 2],
    ['Which pair of the Ogdoad stands for hiddenness, linking Hermopolis with Thebes?', 'Amun and Amaunet', ['Heh and Hauhet', 'Nun and Naunet', 'Kek and Kauket'], 'Amun, "the hidden one", is in the Ogdoad, which let Theban priests claim the eight for Amun.', 3],
    ['In some versions, what rose from the waters to bring forth the sun?', 'A lotus flower (or, in others, an egg)', ['A scarab carved in gold', 'A pyramid', 'A sycamore tree'], 'The versions differ: a lotus opening on the waters, or a cosmic egg, gives birth to the sun.', 2],
    { tf: false, q: 'The Ogdoad and the Ennead are two names for the same group of gods.', s: 'The Ogdoad is eight gods of Hermopolis; the Ennead is nine gods of Heliopolis.', l: 1 },
    { n: 4, q: 'The Ogdoad was made of male and female pairs. How many pairs?', s: ['Eight gods in pairs: 8 ÷ 2 = 4.', 'Nun and Naunet, Heh and Hauhet, Kek and Kauket, Amun and Amaunet.'], l: 1 },
    { n: 17, q: 'Add the number of gods in the Ogdoad of Hermopolis and in the Ennead of Heliopolis.', s: ['Ogdoad: 8. Ennead: 9.', '8 + 9 = 17.'], l: 3 }
  ], 'Ogdoad = eight (Hermopolis); Ennead = nine (Heliopolis).', [
    [function (R, ctx) {
      var pr = R.pick(OGDOAD), wr = OGDOAD.filter(function (x) { return x !== pr; }).map(function (x) { return x[2]; }).concat(['the sky', 'the earth']);
      var p = mc(R, ctx, 'In the Ogdoad, the pair <b>' + pr[0] + ' and ' + pr[1] + '</b> stands for:', pr[2], wr, [pr[0] + ' and ' + pr[1] + ' stand for ' + pr[2] + '.', 'The four pairs: ' + OGDOAD.map(function (x) { return x[0] + ' and ' + x[1] + ' (' + x[2] + ')'; }).join('; ') + '.']);
      p.chk = { k: 'ogdoad', pair: pr[0] };
      return p;
    }, 0.6]
  ]);

  topic('relart.first-mound', [
    ['What image do the creation accounts share?', 'A mound of land rising from the waters', ['A great flood that ends the world', 'A battle between two armies', 'A tree that holds up the sky'], 'Like the fields appearing as the flood went down, the first land rose from Nun.', 1],
    ['The benben stone of Heliopolis stood for:', 'The first mound, where the sun first rose', ['The tomb of Osiris', 'The throne of Isis', 'The boundary of Egypt'], 'The benben was a pointed stone linked with the first mound and the first sunrise.', 1],
    ['Which shapes recall the benben?', 'The capstone of a pyramid and the tip of an obelisk', ['The cartouche and the ankh', 'The pylon’s doorway and the sacred lake', 'The crook and the flail'], 'The pointed top of pyramids and obelisks (the pyramidion) echoes the benben.', 2],
    ['How did temples recall the first mound?', 'The sanctuary stood on the highest floor, at the back', ['The pylon was the tallest point', 'The sacred lake was in the sanctuary', 'Each temple had a pyramid inside'], 'The floor rises toward the sanctuary, which stood for the mound where creation began.', 2],
    ['Which yearly event in Egypt made the idea of a rising mound easy to picture?', 'The Nile flood going down, uncovering the land', ['The first frost of winter', 'Sandstorms in spring', 'An eclipse of the moon'], 'Each autumn, as the waters fell, mounds of fresh land appeared.', 1],
    ['At Memphis, the risen land was a god joined with Ptah. What was his name?', 'Tatenen ("the risen land")', ['Nefertem', 'Khonsu', 'Montu'], 'Ptah-Tatenen is Ptah as the first land.', 3],
    ['Egyptians had several creation accounts. How did they treat them?', 'They held them side by side, each true in its own way', ['They chose one and banned the rest', 'Each city burned the others’ texts', 'They thought all were fables'], 'Different accounts showed different sides of the same mystery; later texts often combine them.', 2],
    { tf: true, q: 'Egyptians held several creation accounts at once.', s: 'Heliopolis, Memphis and Hermopolis each had theirs, and texts combine them.', l: 1 },
    { tf: false, q: 'The creation accounts of Heliopolis, Memphis and Hermopolis share nothing.', s: 'All three begin with the waters of Nun and a first mound or first appearance of the sun.', l: 1 }
  ], 'Picture the land coming out of the flood: that is the first mound.', [
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      var E = EG(), part = E.TEMPLE[E.TEMPLE.length - 1];
      var p = mc(R, ctx, 'This plan shows a temple. Which part, marked with ?, stood for the first mound?', part.name, E.TEMPLE.slice(0, -1).map(function (t) { return t.name; }),
        ['The sanctuary, at the back on the highest floor, stood for the first mound.'], null, { name: 'eg-temple', opts: { mode: 'label', quiet: true, ask: part.key, interactive: false } });
      p.chk = { k: 'temple-ask', part: part.key };
      return p;
    }, 0.4]
  ]);
  // ================================================================ Unit: Kingship and Maat
  topic('relart.maat', [
    ['What was maat?', 'The right order of the world: truth, justice and balance', ['A kind of temple', 'The flood season', 'The king’s palace'], 'Maat (mꜣꜥt) was both an idea and a goddess: things as they should be.', 1],
    ['What was the opposite of maat?', 'Isfet, disorder', ['Nun, the waters', 'Ka, the life force', 'Akhet, the horizon'], 'Isfet (jzft) was chaos, injustice and wrongdoing.', 1],
    ['Whose duty was it to keep maat?', 'Everyone’s: gods, the king and ordinary people', ['Only the gods’', 'Only the priests’', 'Only foreigners’'], 'The king upheld maat for the land, but each person was to live by it.', 1],
    ['What emblem does the goddess Maat wear on her head?', 'An ostrich feather', ['A throne sign', 'A sun disk with horns', 'Two tall plumes'], 'The feather of Maat also appears on the scale in the judgment of the dead.', 1],
    ['On temple walls, the king often holds up a small seated figure of a goddess with a feather. What is he offering?', 'Maat, the right order he keeps for the gods', ['A statue of his mother', 'A gift from a foreign king', 'A toy for the god'], 'The offering of Maat showed that the king had kept order, the gift that sums up all others.', 2],
    ['Officials who judged cases were said to work for which goddess?', 'Maat', ['Sekhmet', 'Bastet', 'Taweret'], 'Judges and viziers held titles like "priest of Maat"; justice was doing maat.', 2],
    ['In the story of the Eloquent Peasant, a farmer who was robbed asks an official again and again to:', 'Do maat, that is, give justice', ['Build him a tomb', 'Make him a priest', 'Give him the robber’s land for free'], 'The peasant’s speeches praise maat and blame those who neglect it.', 3],
    ['Which of these acts would an Egyptian count as <b>isfet</b>?', 'Moving a field’s boundary stone to steal land', ['Paying workers their grain', 'Feeding the hungry', 'Telling the truth in court'], 'Wisdom texts and tomb declarations name such wrongs as against maat.', 2],
    { tf: false, q: 'Maat was only the name of a goddess.', s: 'Maat was also the idea of order, truth and justice that everyone was to live by.', l: 1 },
    { tf: true, q: 'Egyptians believed the king’s first task was to set maat in place of isfet.', s: 'Royal texts say the king puts maat in place of isfet.', l: 2 }
  ], 'Maat is order and truth; isfet is disorder. Keeping maat was everyone’s duty.', [
    [function (R, ctx) { return L(ctx) >= 2 ? translitWord(R, ctx, 'maat') : null; }, 0.4]
  ]);

  topic('relart.divine-king', [
    ['The king’s first name, the Horus name, said the king was:', 'Horus on earth', ['Osiris on earth', 'A son of Seth', 'A priest of Thoth'], 'The oldest royal name presents the king as the living Horus.', 1],
    ['The title ' + tl('zꜣ-rꜥ') + ' before the king’s birth name means:', 'Son of Ra', ['Lord of the Two Lands', 'King of Upper and Lower Egypt', 'Beloved of Amun'], 'zꜣ is "son", rꜥ is Ra; the title introduces the birth name, in a cartouche.', 1],
    ['How did Egyptians think of the king?', 'The office was divine; the man holding it was mortal', ['He was a god in every way and could not die', 'He was an ordinary official with no religious role', 'He was a priest elected by the people'], 'The king was Horus and son of Ra, but he aged, fell ill, died and could even be plotted against.', 1],
    ['Why did the king stand between the gods and the people?', 'He offered to the gods for everyone, and they gave life to Egypt through him', ['He collected taxes for the gods', 'He was the only person allowed to pray', 'He judged the gods’ quarrels'], 'In theory the king was the one priest of every god; in return the gods kept Egypt alive.', 2],
    ['What happened to the king, as Egyptians saw it, when he died?', 'He became Osiris, and the new king became Horus', ['He became Seth', 'He was forgotten', 'He became a star with no name'], 'The Osiris myth matched the passing of the throne.', 2],
    ['How many names did a king have in the full royal titulary of the Middle Kingdom and later?', 'Five', ['Two', 'Three', 'Seven'], 'Horus name, Two Ladies name, Golden Horus name, throne name and birth name.', 2],
    ['Which two of the king’s five names are written in cartouches?', 'The throne name and the birth name', ['The Horus name and the Two Ladies name', 'The Golden Horus name and the Horus name', 'All five'], 'The throne name follows nsw-bjt; the birth name follows zꜣ-rꜥ.', 3],
    ['A papyrus records the trial of people who plotted against Ramesses III. What does it show about Egyptian kingship?', 'The king was a mortal man, even though his office was divine', ['Kings could not be harmed', 'Kings were chosen by lot', 'Only priests could rule'], 'The Harem Conspiracy papers show that a king could be the target of a plot.', 3],
    { tf: false, q: 'Egyptians believed the man who was king could not die.', s: 'Kings died and were buried; the office passed to the next Horus.', l: 1 },
    { tf: true, q: 'A king’s throne name is introduced by the title nsw-bjt, "King of Upper and Lower Egypt".', s: 'nsw-bjt introduces the throne name, zꜣ-rꜥ the birth name.', l: 3 }
  ], 'The king as Horus and son of Ra: a divine office held by a mortal man.', [
    [function (R, ctx) { return L(ctx) >= 2 ? translitWord(R, ctx, 'zara', 'a royal title') : null; }, 0.5]
  ]);

  topic('relart.king-offers', [
    ['In temple scenes, who is shown making the offerings to the gods?', 'The king', ['The high priest', 'The vizier', 'Ordinary worshipers'], 'Almost every offering scene shows the king facing a god.', 1],
    ['Who did the daily offering in most temples?', 'Priests, acting in the king’s name', ['The king, in person, in every temple', 'No one: the scenes did the work', 'Visitors from the town'], 'The king could not be everywhere; priests acted as his deputies.', 1],
    ['The offering formula on tombs begins ' + tl('ḥtp-dj-nsw') + '. What does it mean?', 'An offering that the king gives', ['A gift that the god takes', 'Peace to the king’s house', 'The king is beautiful'], 'Even private offerings were made, in theory, through the king.', 2],
    ['What does the god give back in return in an offering scene?', 'Life, health, long reign and victory', ['Gold and silver', 'A new temple', 'Taxes from Nubia'], 'Captions on scenes record the gods’ gifts: life, stability, power, millions of years.', 2],
    ['Which of these did the king often offer in temple scenes?', 'Bread, incense, wine and a figure of Maat', ['Coins and paper', 'Iron weapons', 'Horses to be sacrificed'], 'Food, drink, incense, cloth and Maat herself.', 2],
    ['Why is the king shown in every scene, even in temples he never visited?', 'Only the king could rightly serve the gods; the scenes made his service last forever', ['Artists copied one drawing everywhere', 'The scenes were advertisements for the king', 'Priests were not allowed to be drawn'], 'The pictures showed the ideal: the one king serving every god, for all time.', 3],
    { tf: false, q: 'The king performed every temple ritual in Egypt in person.', s: 'Priests performed the daily ritual on his behalf.', l: 1 },
    { tf: true, q: 'Even offerings for private people in their tombs were said to be given by the king.', s: 'That is why the offering formula begins ḥtp-dj-nsw, "an offering that the king gives".', l: 2 }
  ], 'The scenes show the ideal: the king serves the gods; in practice, priests act for him.', [
    [function (R, ctx) { return L(ctx) >= 3 ? translitWord(R, ctx, 'htpdinsw', 'the start of the offering formula; the word for king is written first out of honor') : null; }, 0.4]
  ]);

  var SED_LONG = ['ramesses2', 'thutmose3', 'amenhotep3', 'senusret1', 'amenemhat3', 'psamtek1'];
  var SED_SHORT = ['tutankhamun', 'khufu', 'djoser', 'seti1', 'merneptah', 'ahmose1', 'alexander'];
  topic('relart.sed', [
    ['What was the sed festival for?', 'To renew the king’s strength and his right to rule', ['To celebrate the king’s birthday', 'To crown a new king', 'To bury the old king'], 'The jubilee renewed the king, as if he were crowned again.', 1],
    ['After how many years of rule was the first sed festival traditionally held?', 'Thirty', ['Ten', 'Seven', 'Fifty'], 'Tradition put the first jubilee in the 30th year; later ones came every few years.', 1],
    ['Djoser’s Step Pyramid complex has a court lined with rows of dummy chapels. What were they for?', 'A sed festival lasting for eternity', ['Storing grain', 'Housing his priests', 'Training soldiers'], 'The sed court let the king renew himself forever in the afterlife.', 2],
    ['During the festival, the king ran a ritual course. What did this show?', 'That he was still strong enough to rule', ['That he could outrun a lion', 'That he had won a war', 'That he was ready to die'], 'Reliefs show the king striding between boundary markers, claiming the land again.', 2],
    ['Amenhotep III held three sed festivals. In which regnal years?', 'Years 30, 34 and 37', ['Years 1, 2 and 3', 'Years 10, 20 and 30', 'Years 50, 60 and 70'], 'The first came in year 30, then two more a few years apart.', 3],
    ['Ramesses II reigned about 66 years. How many sed festivals might he have held?', 'More than ten', ['One', 'None', 'Exactly two'], 'After year 30 he held jubilees every few years: about thirteen or fourteen are recorded.', 3],
    { tf: false, q: 'The sed festival was a celebration of the king’s birthday.', s: 'It was a jubilee of renewal, usually first held in the 30th year of rule.', l: 1 },
    { tf: true, q: 'Some kings held a sed festival before their 30th year.', s: 'Thirty years was the tradition, not a fixed rule; a few kings held one earlier.', l: 3 }
  ], 'The jubilee came after thirty years of rule, then every few years.', [
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      var E = EG(), k = R.pick(SED_LONG), wr = R.sample(SED_SHORT, 4);
      function len(x) { var g = E.king(x); return g.to - g.from; }
      var p = mc(R, ctx, 'Using the reign dates, which of these kings ruled <b>more than 30 years</b>, long enough to reach the traditional time of a first sed festival?', E.king(k).name, wr.map(function (x) { return E.king(x).name; }),
        [k].concat(wr).map(function (x) { return E.king(x).name + ': ' + reign(x) + ', about ' + len(x) + ' years.'; }).concat(['Only ' + E.king(k).name + ' passed 30 years.']));
      p.chk = { k: 'reign30', king: k, others: wr };
      return p;
    }, 0.6],
    [function (R, ctx) {
      var y = R.pick([3, 4, 5]), n = R.int(2, 4) + (L(ctx) - 1);
      var last = 30 + y * (n - 1);
      var p = make(R, ctx, { n: last, q: 'A king held his first sed festival in year 30 and then one every ' + y + ' years. In which regnal year was his festival number ' + n + '?', s: ['Festival 1 is in year 30; each later one adds ' + y + ' years.', '30 + ' + y + ' × ' + (n - 1) + ' = ' + last + '.'], l: 1 });
      p.chk = { k: 'sedyear', y: y, n: n };
      return p;
    }, 0.3]
  ]);
  // ================================================================ Unit: Temples
  var CULT_T = ['karnak', 'luxor', 'edfu', 'dendera', 'philae', 'kom-ombo'];
  var MEMO_T = ['ramesseum', 'medinet-habu', 'deir-el-bahari'];
  var MEMO_KING = { ramesseum: 'ramesses2', 'medinet-habu': 'ramesses3', 'deir-el-bahari': 'hatshepsut' };

  topic('relart.temple-kinds', [
    ['What was a cult temple?', 'The house of a god, where the god’s statue was cared for', ['A meeting hall for the townspeople', 'A school for scribes', 'A royal palace'], 'The Egyptian term was ḥwt-nṯr, "god’s mansion".', 1],
    ['What was a memorial (mortuary) temple for?', 'Keeping up the cult of a king, joined with a god, forever', ['Training priests', 'Storing the king’s mummy', 'Holding the Opet festival only'], 'Egyptians called them "mansions of millions of years"; the king’s cult went on after his death.', 1],
    ['On which side of the Nile at Thebes did New Kingdom kings build their memorial temples?', 'The west bank, toward the setting sun', ['The east bank, beside Karnak', 'On islands in the river', 'In the Delta'], 'The west, where the sun sets, was the land of the dead; the tombs were there too.', 1],
    ['Could ordinary Egyptians walk into the sanctuary of a cult temple?', 'No: only the king and high-ranking priests entered', ['Yes, every morning', 'Yes, but only women', 'Yes, during harvest'], 'Most people met the gods at the gates, in outer courts, and when statues came out at festivals.', 1],
    ['Abu Simbel is a temple cut into the rock. Which king made it?', 'Ramesses II', ['Khufu', 'Hatshepsut', 'Ptolemy V'], 'Ramesses II cut two temples at Abu Simbel in Nubia.', 2],
    ['Which Ptolemaic temple, the best preserved in Egypt, was built for Horus?', 'Edfu', ['Dendera', 'Philae', 'Medinet Habu'], 'Edfu was Horus’s; Dendera Hathor’s; Philae Isis’s.', 2],
    { tf: false, q: 'Egyptian temples were places where the public gathered to worship each week, like churches.', s: 'Temples were the gods’ houses; most people never went past the outer courts.', l: 1 },
    { tf: true, q: 'Karnak and Luxor Temple stand on the east bank of the Nile at Thebes.', s: 'The living city and the great cult temples were on the east bank; the memorial temples and tombs on the west.', l: 2 }
  ], 'A cult temple housed a god; a memorial temple kept the cult of a dead king.', [
    [function (R, ctx) {
      var E = EG(), memo = R.coin(), key = R.pick(memo ? MEMO_T : CULT_T), s = E.site(key);
      var p = mc(R, ctx, 'What kind of temple is <b>' + (key === 'ramesseum' ? 'the ' : '') + s.name + '</b>?', memo ? 'A memorial temple of a king' : 'A cult temple of a god', [memo ? 'A cult temple of a god' : 'A memorial temple of a king', 'A tomb', 'A royal palace'],
        [s.name + ': ' + s.note], 'Ask: does it belong to a god, or does it keep a dead king’s cult?');
      p.chk = { k: 'tkind', site: key, memo: memo };
      return p;
    }, 0.8],
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      var E = EG(), key = R.pick(MEMO_T), kg = E.king(MEMO_KING[key]);
      var p = mc(R, ctx, 'Whose memorial temple is <b>' + (key === 'ramesseum' ? 'the ' : '') + E.site(key).name + '</b>?', kg.name, SED_SHORT.concat(['ramesses2', 'ramesses3', 'hatshepsut', 'khufu']).filter(function (k) { return k !== MEMO_KING[key]; }).map(function (k) { return E.king(k).name; }).filter(function (n, i, a) { return a.indexOf(n) === i; }),
        [E.site(key).note]);
      p.chk = { k: 'memoking', site: key };
      return p;
    }, 0.4]
  ]);

  function partName(k) { var t = EG().TEMPLE.filter(function (x) { return x.key === k; })[0]; return t.name; }
  topic('relart.temple-plan', [
    ['What is the great gateway at the front of a temple called?', 'The pylon', ['The hypostyle hall', 'The naos', 'The causeway'], 'Two massive towers with a door between: the pylon.', 1],
    ['A hall whose roof is held up by many columns is called:', 'A hypostyle hall', ['A pylon', 'A peristyle court', 'A sacred lake'], 'Hypostyle comes from Greek for "resting on pillars".', 1],
    ['What was the shrine in the sanctuary that held the god’s statue?', 'The naos', ['The pylon', 'The obelisk', 'The serdab'], 'The naos was a stone or wooden shrine with doors.', 2],
    ['What pair of tall pointed stone shafts often stood before a pylon?', 'Obelisks', ['Colossi', 'Sphinxes', 'Stelae'], 'Obelisks were set up in pairs at temple gates.', 1],
    ['What was the sacred lake for?', 'Purification: priests washed there', ['Sailing the god’s boat to Luxor', 'Watering crops', 'Keeping crocodiles'], 'Priests bathed before entering the temple.', 2],
    { tf: false, q: 'Walking in from the river, you reach the hypostyle hall before the pylon.', s: 'The pylon is the gateway; the court and the hypostyle hall lie behind it.', l: 1 }
  ], 'From the river: quay, avenue, pylon, court, hypostyle hall, offering hall, sanctuary.', [
    [function (R, ctx) {
      var E = EG(), T = E.TEMPLE, i = R.int(0, T.length - 2), after = R.coin() || i === 0;
      if (!after) i = R.int(1, T.length - 1);
      var right = after ? T[i + 1] : T[i - 1];
      var wr = T.filter(function (t) { return t !== right && t !== T[i]; }).map(function (t) { return t.name; });
      var p = mc(R, ctx, 'Walking from the river to the god’s room, which part comes <b>right ' + (after ? 'after' : 'before') + '</b> the ' + T[i].name.toLowerCase() + '?', right.name, wr,
        ['In order: ' + T.map(function (t) { return t.name; }).join(', ') + '.', (after ? 'After' : 'Before') + ' the ' + T[i].name.toLowerCase() + ' comes the ' + right.name.toLowerCase() + '.']);
      p.chk = { k: 'tnext', at: T[i].key, after: after, ans: right.key };
      return p;
    }, 1.2],
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      var E = EG(), part = R.pick(E.TEMPLE);
      var p = mc(R, ctx, 'On this temple plan, which part is marked with the question mark?', part.name, E.TEMPLE.filter(function (t) { return t !== part; }).map(function (t) { return t.name; }),
        ['The parts are numbered from the river inward. The marked part is the ' + part.name.toLowerCase() + ': ' + part.note + '.'], null, { name: 'eg-temple', opts: { mode: 'label', quiet: true, ask: part.key, interactive: false } });
      p.chk = { k: 'temple-ask', part: part.key };
      return p;
    }, 1],
    [function (R, ctx) {
      if (L(ctx) < 3) return null;
      var E = EG(), pick = R.sample(E.TEMPLE.map(function (t, i) { return i; }), 4).sort(function (a, b) { return a - b; });
      var p = make(R, ctx, { seq: pick.map(function (i) { return E.TEMPLE[i].name; }), q: 'Put these parts in order from the river to the sanctuary.', s: ['The full order: ' + E.TEMPLE.map(function (t) { return t.name; }).join(', ') + '.'], l: 3 });
      p.chk = { k: 'torder', idx: pick };
      return p;
    }, 0.8]
  ]);

  var MEANING = [['pylon', 'the horizon, where the sun rises between two hills'], ['hypostyle', 'a papyrus marsh at the edge of the first waters'], ['sanctuary', 'the first mound of creation']];
  topic('relart.temple-meaning', [
    ['Why do floors rise and roofs drop as you walk toward the sanctuary?', 'The sanctuary stood for the first mound, raised above the waters', ['To keep out floodwater only', 'Because builders ran out of stone', 'To make the temple look longer'], 'Each step inward climbed toward the mound of creation.', 1],
    ['What happens to the light as you walk from the pylon to the sanctuary?', 'It grows dimmer', ['It grows brighter', 'It stays the same', 'It turns red'], 'From the open court to the dim hall to the dark sanctuary: deeper into mystery.', 1],
    ['Temple ceilings were often painted blue with yellow stars or flying vultures. They stood for:', 'The sky', ['The Nile', 'The desert', 'The underworld only'], 'The roof was the heaven over the world.', 1],
    ['Why are temple columns shaped like papyrus and lotus plants?', 'The hall stood for the marsh that grew around the first mound', ['Plants were the only models artists had', 'To show what crops the temple owned', 'They are tent poles in stone'], 'The hypostyle hall was a stone marsh, with columns as stems and capitals as flowers.', 2],
    ['Scenes at the base of temple walls often show plants, the Nile and lines of offering-bearers. Why there?', 'The base of the wall stood for the earth and the river', ['They were easiest to reach', 'They were for children', 'They were added later by tourists'], 'The wall was a world: earth at the bottom, sky at the top.', 3],
    { tf: true, q: 'The temple was a picture of the world at the moment of creation.', s: 'Horizon (pylon), marsh (columns), sky (ceiling), first mound (sanctuary).', l: 1 },
    { tf: false, q: 'Every part of a temple was only practical, with no meaning beyond its use.', s: 'Each part carried meaning: the pylon was the horizon, the sanctuary the first mound.', l: 1 }
  ], 'Match the parts with the world: pylon the horizon, columns the marsh, ceiling the sky, sanctuary the first mound.', [
    [function (R, ctx) {
      var m = R.pick(MEANING), name = partName(m[0]);
      if (R.coin()) {
        var p = mc(R, ctx, 'In the temple as a picture of the world, what did the <b>' + name.toLowerCase() + '</b> stand for?', m[1], MEANING.filter(function (x) { return x !== m; }).map(function (x) { return x[1]; }).concat(['the tomb of Osiris']), [name + ': ' + m[1] + '.']);
        p.chk = { k: 'tmean', part: m[0] }; return p;
      }
      var p2 = mc(R, ctx, 'Which part of the temple stood for <b>' + m[1] + '</b>?', name, MEANING.filter(function (x) { return x !== m; }).map(function (x) { return partName(x[0]); }).concat(['Sacred lake']), [name + ': ' + m[1] + '.']);
      p2.chk = { k: 'tmean', part: m[0] }; return p2;
    }, 1.2]
  ]);

  var RITUAL = ['The priest purifies himself', 'He breaks the seal and opens the shrine', 'He censes and greets the god', 'He cleans, anoints and dresses the statue', 'He lays out food and drink', 'He backs out, sweeping away his footprints, and seals the shrine'];
  topic('relart.daily-ritual', [
    ['When was the main daily ritual performed?', 'Every morning, at dawn', ['Once a year', 'Only at night', 'Only when the king visited'], 'The god was woken as the sun rose; shorter rites followed at midday and evening.', 1],
    ['What did Egyptians believe about the statue in the shrine?', 'The god came to dwell in it', ['The statue was the god itself, and nothing more', 'It was only a decoration', 'It was a portrait of the king'], 'The god’s presence came to rest in the image, as in a body.', 1],
    ['What happened to the food offered to the god?', 'After the god had received it, it went to the priests and temple staff', ['It was burned', 'It was thrown into the Nile', 'It was buried in the sanctuary'], 'Offerings "reverted" from the god to the people who served the temple.', 2],
    ['Before entering, priests purified themselves. Where did they wash?', 'In the sacred lake', ['In the Nile at the quay only', 'In the god’s shrine', 'They did not wash'], 'The sacred lake inside the enclosure was for purity.', 1],
    ['As the priest left the sanctuary, he walked backward and swept the floor. Why?', 'To remove his footprints and leave the god’s room pure', ['To polish the floor for visitors', 'To hide the treasury', 'To mark the way out'], 'Nothing of the outside world was left behind in the shrine.', 2],
    ['Which temple has well-preserved scenes of the daily ritual in its chapels?', 'The temple of Seti I at Abydos', ['The Great Pyramid', 'Deir el-Medina', 'The Serapeum'], 'Seti I’s chapels at Abydos show the steps of the ritual for each god.', 3],
    { tf: false, q: 'The daily ritual was performed in front of crowds of townspeople.', s: 'It was done in the dark sanctuary by a few priests.', l: 1 },
    { seq: [RITUAL[0], RITUAL[1], RITUAL[3], RITUAL[5]], q: 'Put these steps of the morning ritual in order.', s: 'Purify, open, care for the god, then close the shrine.', l: 2 },
    { seq: [RITUAL[1], RITUAL[2], RITUAL[3], RITUAL[4]], q: 'Put these steps of the morning ritual in order.', s: 'Open the shrine, greet the god, dress the statue, then feed the god.', l: 3 }
  ], 'Wake, wash, dress and feed the god, then close the shrine: the god was cared for like an honored guest.');

  topic('relart.priests', [
    ['The title ' + tl('ḥm-nṯr') + ' means:', 'God’s servant', ['Pure one', 'Lector', 'God’s father'], 'ḥm is "servant", nṯr "god"; Greek writers translated it "prophet".', 1],
    ['The title ' + tl('wꜥb') + ' means:', 'Pure one', ['God’s servant', 'Scribe', 'Overseer'], 'The wꜥb priests were the ordinary, purified priests.', 1],
    ['What did a lector priest do?', 'He read the ritual texts aloud from a papyrus roll', ['He guarded the gates', 'He carved the reliefs', 'He collected taxes'], 'The lector (ẖrj-ḥbt, "the one who carries the ritual book") knew the sacred writings.', 1],
    ['How did most priests serve?', 'In shifts: one month on duty, then back to ordinary life', ['For life, never leaving the temple', 'Only one day each year', 'Only during wars'], 'Priests were divided into groups that served in turn.', 1],
    ['Who was the highest priest of Amun at Karnak?', 'The First God’s Servant (high priest) of Amun', ['The lector priest', 'The vizier', 'The king’s mother'], 'The ḥm-nṯr tpj, "first god’s servant", ran the richest temple in Egypt.', 2],
    ['Which rules marked priestly purity?', 'Shaving the body, washing often and wearing linen', ['Never speaking', 'Living alone in the desert', 'Wearing only wool'], 'Herodotus noticed priests shaved and wore linen; temple texts also list purity rules.', 2],
    ['Women served temples too. Which role was common for them?', 'Chantress (singer) in the god’s choir', ['Lector priest of every temple', 'Vizier', 'Embalmer'], 'Many women were chantresses of Amun; a royal woman held the title God’s Wife of Amun.', 2],
    { tf: false, q: 'Most Egyptian priests were full-time monks who never left the temple.', s: 'Many served one month in four and then returned to their own lives.', l: 1 }
  ], 'Priests served in turn, one month in four, and kept pure while on duty.', [
    [function (R, ctx) {
      var ph = 4, months = 12 / ph, yrs = R.int(2, 6 + 2 * L(ctx));
      var ask = L(ctx) === 1 ? 1 : yrs;
      var tot = months * ask;
      var p = make(R, ctx, { n: tot, unit: 'months', q: 'Temple staff were split into four groups (phyles) that took turns, one month each. How many months on duty did one priest serve in ' + (ask === 1 ? 'a year' : ask + ' years') + '?', s: ['Four groups take turns, so each serves one month in four: 12 ÷ 4 = 3 months a year.'].concat(ask > 1 ? ['In ' + ask + ' years: 3 × ' + ask + ' = ' + tot + ' months.'] : []), l: 1 });
      p.chk = { k: 'phyle', years: ask };
      return p;
    }, 0.5]
  ]);

  topic('relart.karnak', [
    ['Karnak was the great temple of which god?', 'Amun', ['Ptah', 'Osiris', 'Horus'], 'Karnak (ancient Ipet-isut, "the most select of places") was Amun’s home at Thebes.', 1],
    ['How long did kings keep adding to Karnak?', 'About two thousand years, from the Middle Kingdom to Roman times', ['Ten years', 'One reign', 'About a century'], 'Each king added gates, halls, obelisks and chapels.', 1],
    ['Which king built most of Luxor Temple’s core?', 'Amenhotep III', ['Khufu', 'Akhenaten', 'Cleopatra VII'], 'Amenhotep III built the core; Ramesses II added a court and a pylon.', 2],
    ['What links Karnak with Luxor Temple?', 'An avenue of sphinxes, about 3 km long', ['A canal through the desert', 'A tunnel', 'A bridge over the Nile'], 'The processional way runs south from Karnak to Luxor.', 1],
    ['The Great Hypostyle Hall at Karnak was finished by which two kings?', 'Seti I and Ramesses II', ['Khufu and Khafre', 'Hatshepsut and Thutmose III', 'Ptolemy V and Cleopatra VII'], 'Seti I decorated much of it and Ramesses II completed it.', 2],
    { n: 134, q: 'How many columns stand in the Great Hypostyle Hall at Karnak?', s: ['The hall has 134 columns: 12 giant ones along the central aisle and 122 smaller ones.', '12 + 122 = 134.'], l: 3 },
    { tf: false, q: 'Karnak was planned and built in one reign.', s: 'Kings from the Middle Kingdom to the Romans added to it.', l: 1 },
    { tf: true, q: 'One of the two obelisks of Ramesses II from Luxor Temple now stands in Paris.', s: 'It was moved to the Place de la Concorde in the 1830s.', l: 3 }
  ], 'Karnak grew over two thousand years; Luxor is its southern partner, joined by the avenue of sphinxes.', [
    [function (R, ctx) {
      var E = EG(), list = [['senusret1', 'the White Chapel at Karnak'], ['thutmose3', 'the Festival Hall (Akh-menu) at Karnak'], ['amenhotep3', 'Luxor Temple (the core)']];
      var it = R.pick(list), k = E.king(it[0]);
      if (k.built.indexOf(it[1]) < 0) return null;
      var wr = ['khufu', 'akhenaten', 'cleopatra7', 'djoser', 'tutankhamun'].concat(list.map(function (x) { return x[0]; })).filter(function (x) { return x !== it[0]; }).map(function (x) { return E.king(x).name; });
      var p = mc(R, ctx, 'Which king built <b>' + it[1] + '</b>?', k.name, wr, [k.name + ' (' + reign(it[0]) + ', ' + periodName(it[0]) + ') built ' + it[1] + '.']);
      p.chk = { k: 'built', king: it[0], what: it[1] };
      return p;
    }, 0.6],
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      return mapPick(R, ctx, 'karnak', ['memphis', 'abydos', 'giza', 'amarna', 'edfu', 'philae', 'tanis', 'hermopolis', 'heliopolis', 'abu-simbel'], 'Which lettered dot marks <b>Karnak</b>, at Thebes?', ['Karnak lies at Thebes (modern Luxor), in the south of Upper Egypt.']);
    }, 0.5]
  ]);
  // ================================================================ Unit: Festivals
  topic('relart.opet', [
    ['In the Opet festival, Amun’s statue traveled from Karnak to which temple?', 'Luxor Temple', ['The Ramesseum', 'Deir el-Bahari', 'Abydos'], 'Luxor Temple, Ipet-resyt ("the southern sanctuary"), was the goal of the Opet procession.', 1],
    ['How did the god’s statue travel in procession?', 'In a portable boat-shrine carried by priests, or on a river barge', ['On a chariot pulled by horses', 'Walking, carried by the king alone', 'It stayed in Karnak; only a picture traveled'], 'The statue rode in a small sacred boat (bark) on the priests’ shoulders, and on a great barge on the river.', 1],
    ['Which gods went with Amun in the Opet procession?', 'Mut and Khonsu, his wife and son', ['Ptah and Sekhmet', 'Osiris and Isis', 'Seth and Nephthys'], 'The whole Theban family traveled together.', 2],
    ['What did the Opet festival renew?', 'The king’s divine power, his royal ka', ['The flood of the Nile', 'The walls of the temple', 'The priests’ wages'], 'In Luxor Temple the king and Amun met, and the king’s royal ka was renewed.', 2],
    ['In which season was the Opet festival held?', 'Akhet, the flood season', ['Shemu, the harvest season', 'Peret, the growing season', 'In every season, once a month'], 'Opet fell in the second month of Akhet, while the river was high.', 2],
    ['Where can you still see carvings of the Opet procession?', 'On the walls of the colonnade in Luxor Temple', ['Inside the Great Pyramid', 'On the Rosetta Stone', 'In the Valley of the Kings only'], 'The reliefs of the colonnade show boats, priests, musicians and crowds.', 3],
    ['How did the length of the Opet festival change over the New Kingdom?', 'It grew longer, to more than three weeks', ['It shrank to one hour', 'It stayed one day', 'It was held only once'], 'Early in the 18th Dynasty it lasted about 11 days; by the 20th Dynasty it ran for more than three weeks.', 3],
    { tf: false, q: 'Festivals happened only inside the temple, out of sight of ordinary people.', s: 'At festivals the god’s boat came out, and crowds could see the shrine and ask the god questions.', l: 1 },
    { tf: true, q: 'Festivals were among the few times ordinary people came close to a god’s statue.', s: 'The statue, hidden in its shrine on the boat, passed through the crowds.', l: 1 }
  ], 'Opet: Amun travels south from Karnak to Luxor, and the king’s rule is renewed.', [
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      return mapPick(R, ctx, 'karnak', ['abydos', 'dendera', 'edfu', 'philae', 'amarna', 'hermopolis', 'memphis'], 'The Opet procession began at Karnak, in Thebes. Which lettered dot is Thebes?', ['Karnak and Luxor Temple stand at Thebes, on the east bank, in the south of Upper Egypt.']);
    }, 0.4]
  ]);

  topic('relart.valley-festival', [
    ['In the Beautiful Festival of the Valley, where did Amun travel?', 'Across the Nile to the temples of the west bank', ['North to Memphis', 'South to Nubia', 'Into the Delta'], 'Amun’s boat crossed from Karnak to visit the memorial temples on the west bank.', 1],
    ['What did families do during the Valley festival?', 'Visited the tombs of their dead and shared a meal there', ['Stayed indoors for fear of spirits', 'Moved their homes', 'Held races on the river'], 'Families feasted at the tombs, with flowers, music and offerings.', 1],
    ['In which season was the Beautiful Festival of the Valley held?', 'Shemu, the harvest season', ['Akhet, the flood season', 'Peret, the growing season', 'Only in years of a sed festival'], 'It fell in the second month of Shemu, at the new moon.', 2],
    ['Which west-bank temple was a main stop of Amun’s boat in the 18th Dynasty?', 'Hatshepsut’s temple at Deir el-Bahari', ['Edfu', 'Luxor Temple', 'Karnak'], 'Deir el-Bahari, in the bay of cliffs facing Karnak, was the festival’s goal; Mentuhotep II’s temple stands beside it.', 2],
    ['When did the Valley festival begin, as far as we know?', 'In the Middle Kingdom', ['In the Roman period', 'In the Predynastic Period', 'Under Alexander the Great'], 'It is known from the Middle Kingdom, linked with Mentuhotep II’s temple, and flourished in the New Kingdom.', 3],
    { tf: false, q: 'Egyptians avoided cemeteries and never visited tombs.', s: 'Families visited tomb chapels, above all at the Valley festival, to share food with the dead.', l: 1 },
    { tf: true, q: 'Tomb paintings show banquets that recall the Valley festival.', s: 'Theban tombs show guests, music and flowers at feasts held for and with the dead.', l: 2 }
  ], 'Valley festival: Amun crosses to the west bank, and families meet their dead at the tombs.', [
    [function (R, ctx) {
      var opet = R.coin(), q = 'Which festival is described? <b>' + (opet ? 'Amun’s boat travels south along the east bank from Karnak to Luxor Temple, and the king’s rule is renewed.' : 'Amun’s boat crosses the river to the west bank, and families feast at the tombs of their relatives.') + '</b>';
      var p = mc(R, ctx, q, opet ? 'The Opet festival' : 'The Beautiful Festival of the Valley', [opet ? 'The Beautiful Festival of the Valley' : 'The Opet festival', 'The sed festival', 'The Wag festival of the dead'], [opet ? 'Opet links Karnak and Luxor on the east bank.' : 'The Valley festival crosses to the west bank, the land of the dead.']);
      p.chk = { k: 'fest', opet: opet };
      return p;
    }, 0.6],
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      return mapPick(R, ctx, 'deir-el-bahari', ['karnak', 'luxor', 'kings', 'medinet-habu', 'ramesseum', 'deir-el-medina', 'queens'].concat(['abydos', 'dendera', 'edfu']), 'Which lettered dot is <b>Deir el-Bahari</b>?', ['Deir el-Bahari is on the west bank at Thebes.']);
    }, 0.2]
  ]);

  // ================================================================ Unit: The Afterlife
  topic('relart.afterlife', [
    ['What did Egyptians believe death led to?', 'A new life, if the right care was taken', ['Nothing at all', 'Rebirth as an animal', 'A life only for kings, never for others'], 'Death was a passage; the dead could live on with the gods and among the living.', 1],
    ['Which of these did a person need to live on after death?', 'A preserved body, a remembered name and continued offerings', ['A large house in the city', 'A foreign burial', 'A statue of Seth'], 'Body, name and offerings: the tomb provided all three.', 1],
    ['Why did Egyptians carve and repeat their names in tombs?', 'Because saying a name kept its owner alive', ['To show off their handwriting', 'To claim the land around the tomb', 'To scare away visitors'], 'A remembered name meant continued life; erasing a name was an attack.', 1],
    ['After death, a justified person was called ' + tl('mꜣꜥ-ḫrw') + '. What does it mean?', 'True of voice (justified)', ['Beloved of Amun', 'Lord of the Two Lands', 'Son of Ra'], 'mꜣꜥ-ḫrw, written after the names of the dead, means the person passed the judgment.', 2],
    ['In the Old Kingdom, whose afterlife do the royal texts mainly describe?', 'The king’s, rising to the sky and joining the gods', ['Every farmer’s', 'Only priests’', 'Only foreigners’'], 'Later, more and more people hoped for the same blessed life, as an Osiris.', 2],
    ['How did later Egyptians often write a dead person’s name?', 'As "the Osiris N", joined with the god of the dead', ['As "the Seth N"', 'Without any title', 'Only as a number'], 'From the Middle Kingdom on, the justified dead were each called an Osiris.', 3],
    { tf: false, q: 'Egyptians were obsessed with death and did not enjoy life.', s: 'Their care for the dead came from love of life and the wish for it to go on.', l: 1 },
    { tf: true, q: 'Egyptians believed the dead needed food and drink.', s: 'Offerings at the tomb fed the dead person’s ka.', l: 1 },
    { tl: 'rn', q: 'Transliterate the Egyptian word for "name", which the dead needed to live on.', s: ['The mouth (D21) reads r; the water ripple (N35) reads n.', 'Answer: ' + tl('rn') + '.'], l: 2, viz: { name: 'eg-glyphs', opts: { word: 'ren', quiet: true, interactive: false } } }
  ], 'Body, name and offerings: keep all three and the dead live on.');

  var SOUL = [['ka', 'kꜣ', 'the life force, born with a person, which received the offerings', 'two raised arms'], ['ba', 'bꜣ', 'the part that could move about, shown in art as a bird with a human head', 'a stork (the jabiru)'], ['akh', 'ꜣḫ', 'the transfigured, effective spirit of a blessed dead person', 'a crested ibis']];
  topic('relart.soul-parts', [
    ['Which part of a person was shown as a bird with a human head?', 'The ba', ['The ka', 'The akh', 'The shadow'], 'The ba could leave the tomb by day and return to the body.', 1],
    ['Which part of a person received the food offerings?', 'The ka', ['The ba', 'The shadow', 'The heart'], 'Offerings were made "for the ka of" the dead person.', 1],
    ['Which part was the transfigured spirit that the blessed dead became?', 'The akh', ['The ka', 'The ba', 'The name'], 'The akh was the effective spirit living among the stars and gods.', 1],
    ['The hieroglyph for ka (two arms) and the hieroglyph for ba are different from how each is shown in art. How is the <b>ba</b> written as a sign?', 'With a stork (the jabiru)', ['With a bird with a human head', 'With two raised arms', 'With a crested ibis'], 'The sign G29 is the jabiru stork; in pictures, the ba is a human-headed bird.', 3],
    ['Besides the ka, ba and akh, which other parts did Egyptians count as part of a person?', 'The name and the shadow', ['The crown and the scepter', 'The house and the field', 'The temple and the god'], 'The body, heart, name and shadow all belonged to the person.', 2],
    ['Why is it misleading to translate ba simply as "soul"?', 'Egyptians divided the person differently; no single English word fits', ['Because the ba was the body', 'Because the ba belonged only to gods', 'Because ba means "house"'], 'Each part had its own role; one-word equivalents hide those differences.', 2],
    ['A statue in the tomb gave which part a place to rest and receive offerings?', 'The ka', ['The akh', 'The shadow', 'The Duat'], 'Ka statues stood in the tomb so the ka could dwell in them.', 2],
    { tf: false, q: 'The ba is exactly the same as the "soul" in later religions.', s: 'The ba was one of several parts, with its own role; translate it with care.', l: 1 },
    { tf: true, q: 'A god or a king could have more than one ba or ka.', s: 'Gods and kings were said to have many bas and kas, a sign of their great power.', l: 3 }
  ], 'Ka: life force that eats the offerings. Ba: the moving human-headed bird. Akh: the blessed spirit.', [
    [function (R, ctx) {
      var x = R.pick(SOUL), wkey = x[0];
      var w = EG().WORDS[wkey];
      if (L(ctx) >= 2 && R.coin()) return translitWord(R, ctx, wkey, 'one part of a person');
      var p = mc(R, ctx, 'This hieroglyph (' + x[3] + ') writes which part of a person?', 'The ' + x[0] + ', ' + x[2], SOUL.filter(function (y) { return y !== x; }).map(function (y) { return 'The ' + y[0] + ', ' + y[2]; }).concat(['The shadow, a dark copy of the body']),
        [x[3] + ' writes ' + tl(w.tl) + ', the ' + x[0] + '.'], 'Two arms, a stork and an ibis: ka, ba and akh.', { name: 'eg-glyphs', opts: { word: wkey, quiet: true, interactive: false } });
      p.chk = { k: 'soul', word: wkey };
      return p;
    }, 1]
  ]);

  topic('relart.judgment', [
    ['In the judgment, the heart was weighed against what?', 'The feather of Maat', ['A gold weight', 'The heart of Osiris', 'A scarab'], 'The heart had to balance the feather of truth.', 1],
    ['What result did the dead hope for when the heart was weighed?', 'The heart and the feather balance', ['The heart is heavier than the feather', 'The heart is lighter than the feather', 'The scale breaks'], 'Balance meant a life lived in maat.', 1],
    ['Which god is usually shown working the scale?', 'Anubis', ['Thoth', 'Horus', 'Seth'], 'Jackal-headed Anubis checks the balance; ibis-headed Thoth writes down the result.', 1],
    ['Which god records the verdict?', 'Thoth', ['Anubis', 'Osiris', 'Bes'], 'Thoth, the scribe of the gods, writes the result.', 1],
    ['Who waited to eat the heart of someone who failed?', 'Ammit, "the Devourer"', ['Apep, the serpent', 'Sobek', 'Taweret'], 'Ammit had a crocodile’s head, a lion’s front and a hippopotamus’s back.', 2],
    ['Before whom was the justified dead person brought after the weighing?', 'Osiris, king of the dead', ['Amun-Ra at Karnak', 'The living king', 'Seth in the desert'], 'Horus often leads the dead to Osiris on his throne.', 2],
    ['Which spell of the Book of the Dead holds the judgment and the declarations of innocence?', 'Spell 125', ['Spell 6', 'Spell 30B', 'Spell 110'], 'Spell 125 has the "negative confession"; spell 30B asks the heart not to speak against its owner.', 3],
    { n: 42, q: 'In spell 125, the dead person declares innocence before a panel of judges. How many judges?', s: ['Each of the 42 judges hears one declaration: "I have not…".', 'Answer: 42.'], l: 3 },
    { tf: false, q: 'To pass the judgment, the heart had to be heavier than the feather.', s: 'The heart had to balance the feather: free of wrongdoing.', l: 1 },
    { tf: true, q: 'The dead declared that they had not done a list of wrongs.', s: 'This list is called the declaration of innocence, or the "negative confession".', l: 2 }
  ], 'Heart against feather: balance means a life lived in maat.', [
    [function (R, ctx) {
      var roles = [['anubis', 'works the scale'], ['thoth', 'writes down the result'], ['osiris', 'sits on the throne as judge and king of the dead']];
      var r = R.pick(roles), g = EG().god(r[0]);
      var p = mc(R, ctx, 'In judgment scenes, which god ' + r[1] + '? He is shown as <b>' + g.look + '</b>.', g.name, roles.filter(function (x) { return x !== r; }).map(function (x) { return godName(x[0]); }).concat(['Seth', 'Bes']), [g.name + ' ' + r[1] + '.']);
      p.chk = { k: 'look', god: r[0] };
      return p;
    }, 0.6]
  ]);

  topic('relart.duat', [
    ['What was the Duat?', 'The realm of the dead, through which the sun traveled at night', ['A city in the Delta', 'The flood season', 'A kind of tomb'], 'The Duat (dwꜣt) lay beyond the western horizon, and the sun passed through it each night.', 1],
    ['How many hours did the sun’s night journey have?', 'Twelve', ['Seven', 'Four', 'Twenty-four'], 'The night was divided into twelve hours, each a region of the Duat.', 1],
    ['Which serpent tried to stop the sun’s boat each night?', 'Apep (Apophis)', ['Ammit', 'Wadjet', 'Sobek'], 'Apep was the great enemy of the sun and of order.', 1],
    ['In what form was the sun reborn at dawn?', 'As Khepri, the scarab', ['As Atum, the old man', 'As Osiris, the mummy', 'As Seth'], 'The scarab pushed the new sun over the eastern horizon.', 2],
    ['Which god did the sun unite with in the depths of the night, renewing both?', 'Osiris', ['Seth', 'Thoth', 'Bes'], 'The union of Ra and Osiris was the turning point of the night.', 2],
    ['In some texts the sky goddess swallows the sun at evening and gives birth to it at dawn. Who is she?', 'Nut', ['Isis', 'Hathor', 'Maat'], 'Nut arches over the earth; the sun passes through her body at night.', 2],
    ['How was the sun god often shown on his night journey?', 'With a ram’s head, standing in his boat', ['As a lioness', 'As a crocodile', 'As a baboon'], 'The ram-headed night form travels in the boat through the hours.', 3],
    { tf: false, q: 'The Duat was simply a place of punishment, like a hell.', s: 'It was a realm of passage and renewal, with dangers along the way.', l: 1 },
    { tf: true, q: 'The blessed dead hoped to travel with the sun through the Duat.', s: 'Joining the sun’s boat meant sharing its rebirth every morning.', l: 2 },
    { n: 12, q: 'The night journey crossed one region of the Duat per hour of the night. How many regions?', s: ['One region per hour, and the night had 12 hours.', 'Answer: 12.'], l: 1 }
  ], 'Every night the sun sails through twelve hours of the Duat and is reborn at dawn.');

  topic('relart.field-of-reeds', [
    ['What was the Field of Reeds?', 'A perfect Egypt where the blessed dead lived and farmed', ['A swamp of punishment', 'A real field at Karnak', 'The desert west of Thebes'], 'The Field of Reeds (sḫt-jꜣrw) was a land of tall crops and plenty.', 1],
    ['What were shabti figures for?', 'To answer for the dead and do their work in the afterlife', ['To be toys for children', 'To be portraits of family members', 'To guard the tomb door'], 'If the dead were called to work the fields, the shabti would answer "Here I am!".', 1],
    ['Which spell of the Book of the Dead is written on many shabtis?', 'Spell 6, the shabti spell', ['Spell 125', 'Spell 30B', 'Spell 17'], 'Spell 6 tells the shabti to answer when its owner is called to work.', 2],
    ['A later word for shabti means:', '"Answerer"', ['"Servant of Ra"', '"Little mummy"', '"Stone friend"'], 'The form wšbtj (ushabti) was understood as "answerer".', 3],
    ['Why might a rich burial hold 365 shabtis, plus some overseers?', 'One worker for every day of the year', ['One for every god', 'One for every relative', 'One for every step of the pyramid'], 'Later burials provided a worker for each day and overseers to manage them.', 2],
    ['Which spell of the Book of the Dead shows a map of the Field of Reeds?', 'Spell 110', ['Spell 125', 'Spell 6', 'Spell 1'], 'The vignette of spell 110 shows canals, fields and the owner plowing and reaping.', 3],
    { tf: false, q: 'Shabtis were toys or portraits of the dead person’s friends.', s: 'They were helpers meant to do work for the dead.', l: 1 },
    { tf: true, q: 'Egyptians pictured the afterlife as much like Egypt, only better.', s: 'The Field of Reeds had canals, fields and harvests, like the Nile valley.', l: 1 },
    { n: 365, q: 'A later burial had one shabti worker for each day of the year. How many workers?', s: ['One for each day of the 365-day year.', 'Answer: 365.'], l: 2 }
  ], 'Fields and harvests forever, with shabtis to do the work.');

  topic('relart.offering-cult', [
    ['Where did the living leave offerings in an Old Kingdom tomb chapel?', 'At the false door', ['On the roof', 'In the burial shaft', 'In the serdab slit'], 'The false door was the meeting place between the living and the dead.', 1],
    ['What was a false door?', 'A carved doorway through which the ka could come and go', ['A trap for robbers', 'A painted fake to fool visitors', 'A door to the temple'], 'The dead were believed to pass through it to receive the offerings.', 1],
    ['The offering formula begins ' + tl('ḥtp-dj-nsw') + '. What does it go on to ask for?', 'An invocation offering of bread, beer, cattle, fowl and other good things', ['Victory in battle', 'A long reign for the dead', 'Gold for the priests'], 'The prt-ḫrw, "going forth of the voice", fed the dead with every good thing.', 2],
    ['Who were the ka-servants?', 'Priests paid, often with land, to bring offerings to a tomb', ['Statues in the tomb', 'Thieves', 'The dead person’s pets'], 'Endowments of land paid ka-priests to keep the offerings going.', 2],
    ['Tomb inscriptions often "appeal to the living". What do they ask passers-by to do?', 'Say the offering formula aloud for the dead', ['Leave gold', 'Repaint the tomb', 'Move the body'], 'Even spoken words could feed the dead.', 2],
    { tf: false, q: 'The false door was a fake meant only for decoration.', s: 'It was the place where the dead came to meet the living and receive offerings.', l: 1 },
    { tf: true, q: 'Reading the offering formula aloud was believed to provide for the dead.', s: 'The spoken formula made the offerings real for the ka.', l: 2 }
  ], 'At the false door, food and spoken words fed the dead.', [
    [function (R, ctx) { return L(ctx) >= 2 ? translitWord(R, ctx, 'htpdinsw', 'the start of the offering formula') : null; }, 0.3]
  ]);
  // ================================================================ Unit: Mummification
  topic('relart.why-mummify', [
    ['Why did Egyptians preserve the body?', 'So the ka and ba had a body to return to', ['To scare tomb robbers', 'Because the law required it for everyone', 'To send it to the gods as a gift'], 'The body was the anchor for the parts of the person that lived on.', 1],
    ['What first showed Egyptians that bodies could last?', 'Bodies buried in dry desert sand stayed preserved', ['Bodies left in the Nile', 'Bodies frozen in the mountains', 'Bodies kept in temples'], 'Early graves in hot, dry sand dried bodies out naturally.', 1],
    ['Was everyone in ancient Egypt mummified in the full way?', 'No: full mummification was costly, and many people had simpler burials', ['Yes, by law', 'Yes, but only children', 'No one was, except kings'], 'Burials ranged from rich tombs to simple pits in the sand.', 1],
    ['Which Greek writer described three grades of embalming at different prices?', 'Herodotus', ['Plutarch', 'Homer', 'Strabo'], 'Herodotus, in Book 2 of his Histories, describes an expensive, a middle and a cheap method.', 2],
    ['The oldest known stored internal organs belonged to a queen of the 4th Dynasty, the mother of Khufu. Who?', 'Hetepheres I', ['Nefertiti', 'Hatshepsut', 'Cleopatra VII'], 'A chest of her preserved organs was found at Giza; organ removal was by then part of embalming.', 3],
    ['Which god watched over embalming?', 'Anubis', ['Bes', 'Sobek', 'Hapi'], 'Anubis, the jackal god of cemeteries, was the god of embalming.', 1],
    { tf: false, q: 'Every Egyptian was mummified in the same way.', s: 'Full mummification was expensive; many people had simpler burials.', l: 1 },
    { tf: true, q: 'Animals were mummified too, as pets and as offerings to gods.', s: 'Cats, ibises, falcons and many others were mummified.', l: 2 },
    { n: 3, q: 'Herodotus says Egyptian embalmers offered several grades of treatment at different prices. How many?', s: ['He describes an expensive, a middle and a cheap method.', 'Answer: 3.'], l: 2 }
  ], 'The body was the home the ka and ba returned to; dry sand first showed it could last.');

  var MSTEPS = ['The body is washed', 'The internal organs are removed (the heart is left)', 'The body is covered with natron to dry', 'The body is anointed with oils and resins', 'The body is wrapped in linen with amulets', 'The mummy is placed in its coffin'];
  topic('relart.mummy-steps', [
    ['What salt did embalmers use to dry the body?', 'Natron', ['Sea salt', 'Saltpeter', 'Lime'], 'Natron, a natural salt from places like the Wadi Natrun, draws out water.', 1],
    ['About how long did the body lie in natron?', 'About forty days', ['About one day', 'About a year', 'About seven days'], 'Drying took about forty days.', 1],
    ['About how long did the whole process of embalming and wrapping take?', 'About seventy days', ['About ten days', 'About seven months', 'About three years'], 'Seventy days from death to burial is the traditional span.', 1],
    ['Which organ was usually left in the body?', 'The heart', ['The brain', 'The liver', 'The lungs'], 'The heart, seat of thought and memory, was needed at the judgment.', 1],
    ['What happened to the brain?', 'It was removed and not kept', ['It was stored in a jar of its own', 'It was left in place', 'It was placed in the coffin beside the mummy'], 'Embalmers did not value the brain; the heart was the organ of thought.', 2],
    ['What was placed among the linen wrappings?', 'Amulets for protection', ['Coins', 'Papyrus maps of the city', 'Weapons'], 'Amulets like the heart scarab and the wedjat eye were wrapped in.', 1],
    ['What were the organs that were removed treated like?', 'They were dried and kept, often in four jars', ['They were thrown away', 'They were burned', 'They were given to the temple'], 'The liver, lungs, stomach and intestines were preserved too.', 2],
    { n: 70, unit: 'days', q: 'Drying in natron took about 40 days, and anointing and wrapping about 30 more. About how many days in all?', s: ['40 + 30 = 70.', 'Seventy days is the traditional length of embalming.'], l: 2 },
    { tf: false, q: 'The brain was kept with great care, because Egyptians thought it was the seat of thought.', s: 'Egyptians saw the heart as the seat of thought; the brain was not kept.', l: 1 },
    { seq: [MSTEPS[1], MSTEPS[2], MSTEPS[4], MSTEPS[5]], q: 'Put these steps of mummification in order.', s: 'Remove the organs, dry the body, wrap it, then place it in the coffin.', l: 2 },
    { seq: [MSTEPS[0], MSTEPS[2], MSTEPS[3], MSTEPS[4]], q: 'Put these steps of mummification in order.', s: 'Wash, dry with natron, anoint, then wrap.', l: 3 }
  ], 'Remove the organs, dry with natron (about 40 days), anoint and wrap: about 70 days in all.');

  var SONS = [['Imsety', 'a human', 'the liver'], ['Hapy', 'a baboon', 'the lungs'], ['Duamutef', 'a jackal', 'the stomach'], ['Qebehsenuef', 'a falcon', 'the intestines']];
  topic('relart.coffins', [
    ['How many canopic jars held the organs?', 'Four', ['Two', 'Seven', 'One'], 'One jar each for the liver, lungs, stomach and intestines.', 1],
    ['Who guarded the canopic jars?', 'The Four Sons of Horus', ['The four winds', 'Isis alone', 'The Ennead'], 'Each son, with a goddess, protected one organ.', 1],
    ['Tutankhamun lay in nested coffins. How many?', 'Three, the innermost of solid gold', ['One, of wood', 'Seven, all of stone', 'Two, of silver'], 'Three coffins inside a stone sarcophagus inside four gilded shrines.', 2],
    ['What was the stone outer box around the coffins called?', 'A sarcophagus', ['A canopic chest', 'A naos', 'A serdab'], 'The coffins lay inside a stone sarcophagus.', 2],
    ['Middle Kingdom rectangular coffins often have a pair of eyes painted on one side. Why?', 'So the dead, lying on their side, could look out toward the east', ['To scare away robbers', 'To show the maker’s mark', 'To mark which end was the head'], 'The wedjat eyes let the dead see the rising sun and the living.', 3],
    ['In the New Kingdom, coffins were often shaped like:', 'A wrapped body, with a face (an anthropoid coffin)', ['A boat', 'A house', 'A pyramid'], 'The coffin became a second body with an idealized face.', 2],
    { tf: false, q: 'The four canopic jars all had the same head on their lids.', s: 'In the New Kingdom and later the lids show four different heads: human, baboon, jackal and falcon.', l: 1 },
    { tf: true, q: 'Tutankhamun’s mask is made of gold inlaid with colored glass and stones.', s: 'The mask is gold with inlays of glass and semiprecious stones such as lapis lazuli.', l: 2 }
  ], 'Four sons, four heads, four organs: Imsety (human, liver), Hapy (baboon, lungs), Duamutef (jackal, stomach), Qebehsenuef (falcon, intestines).', [
    [function (R, ctx) {
      var s = R.pick(SONS), mode = R.int(0, L(ctx) >= 2 ? 2 : 1), others = SONS.filter(function (x) { return x !== s; });
      var p;
      if (mode === 0) p = mc(R, ctx, 'Which Son of Horus had the head of <b>' + s[1] + '</b>?', s[0], others.map(function (x) { return x[0]; }), [s[0] + ' had the head of ' + s[1] + ' and guarded ' + s[2] + '.']);
      else if (mode === 1) p = mc(R, ctx, 'What head did <b>' + s[0] + '</b> have on his canopic jar lid?', cap1(s[1]), others.map(function (x) { return cap1(x[1]); }).concat(['A ram']), [s[0] + ': ' + s[1] + ', guarding ' + s[2] + '.']);
      else p = mc(R, ctx, 'The jar with the lid of <b>' + s[1] + '</b> (' + s[0] + ') held which organ?', cap1(s[2]), others.map(function (x) { return cap1(x[2]); }).concat(['The heart']), [s[0] + ', with the head of ' + s[1] + ', guarded ' + s[2] + '. The heart stayed in the body.']);
      p.chk = { k: 'son', son: s[0], mode: mode };
      return p;
    }, 1.5]
  ]);
  // ================================================================ Unit: Funerary Texts
  var CORPUS = [
    ['the Pyramid Texts', 'carved on the walls inside royal pyramids', 'ok', 'the Old Kingdom'],
    ['the Coffin Texts', 'painted on the coffins of officials', 'mk', 'the Middle Kingdom'],
    ['the Book of the Dead', 'written on papyrus rolls placed in the tomb', 'nk', 'the New Kingdom and later'],
    ['the Amduat', 'painted on the walls of royal tombs in the Valley of the Kings', 'nk', 'the New Kingdom']];
  function corpusMaker(R, ctx, only) {
    var list = only ? CORPUS.filter(function (c) { return only.indexOf(c[0]) >= 0; }) : CORPUS.slice(0, 3);
    var c = R.pick(list);
    var p;
    if (R.coin()) p = mc(R, ctx, 'Where ' + (c[0] === 'the Amduat' || c[0] === 'the Book of the Dead' ? 'was' : 'were') + ' <b>' + c[0] + '</b> usually written?', cap1(c[1]), CORPUS.filter(function (x) { return x !== c; }).map(function (x) { return cap1(x[1]); }).concat(['Carved on obelisks']), [cap1(c[0]) + ': ' + c[1] + ', in ' + c[3] + '.']);
    else p = mc(R, ctx, 'Spells ' + c[1] + ' belong to which collection?', cap1(c[0]), CORPUS.filter(function (x) { return x !== c; }).map(function (x) { return cap1(x[0]); }).concat(['The Instruction of Ptahhotep']), [cap1(c[0]) + ': ' + c[1] + ', in ' + c[3] + '.']);
    p.chk = { k: 'corpus', c: c[0] };
    return p;
  }
  function corpusOrder(R, ctx) {
    var names = CORPUS.slice(0, 3).map(function (c) { return cap1(c[0]); });
    var p = make(R, ctx, { seq: names, q: 'Put the three great collections of funerary spells in order, oldest first.', s: CORPUS.slice(0, 3).map(function (c) { return cap1(c[0]) + ': ' + c[3] + '.'; }), l: 2 });
    p.chk = { k: 'corpusorder' };
    return p;
  }

  topic('relart.pyramid-texts', [
    ['What are the Pyramid Texts?', 'The oldest Egyptian religious texts: spells carved inside pyramids', ['Building records of the pyramid workers', 'Graffiti left by tourists', 'Lists of kings'], 'They are spells to help the king rise to the sky and live among the gods.', 1],
    ['In whose pyramid do the Pyramid Texts first appear?', 'Unas, last king of the 5th Dynasty', ['Khufu, builder of the Great Pyramid', 'Djoser, builder of the Step Pyramid', 'Senusret I'], 'Unas’s pyramid at Saqqara has the first carved spells.', 1],
    ['Does the Great Pyramid of Khufu have Pyramid Texts inside?', 'No: the texts start about two centuries later', ['Yes, on every wall', 'Yes, but only in the King’s Chamber', 'Yes, on the outside casing'], 'Khufu’s chambers have no religious texts; the first are in the pyramid of Unas.', 1],
    ['What do many Pyramid Texts help the king do?', 'Rise to the sky, join the sun god and become a star', ['Win battles in Nubia', 'Collect taxes', 'Choose his heir'], 'The king climbs to the sky, sails with Ra and joins the stars that never set.', 2],
    ['Besides kings, who else had Pyramid Texts in the 6th Dynasty?', 'Some queens, in their own pyramids', ['Every farmer', 'Foreign ambassadors', 'Temple musicians'], 'Queens of Pepi II, among others, had spells in their pyramids.', 3],
    ['Who first published and numbered the Pyramid Texts as "utterances"?', 'Kurt Sethe, in the early 1900s', ['Champollion, in 1822', 'Herodotus', 'Howard Carter, in 1922'], 'Sethe’s edition (1908–1922) gave the numbering scholars still use.', 3],
    { tf: false, q: 'The Great Pyramid of Khufu has the oldest Pyramid Texts.', s: 'The Pyramid Texts begin with Unas, at the end of the 5th Dynasty.', l: 1 },
    { tf: true, q: 'The Pyramid Texts were carved in the burial chambers and passages, not on the outside.', s: 'They line the inner rooms near the king’s body.', l: 2 }
  ], 'The Pyramid Texts start with Unas, at the end of the 5th Dynasty, about two centuries after Khufu.', [
    [function (R, ctx) {
      var E = EG(), a = E.king('khufu'), u = E.king('unas'), gap = u.from - a.to;
      var right = 'About two centuries', ch = ['About twenty years', 'About two centuries', 'About a thousand years', 'About two thousand years'];
      var p = mc(R, ctx, 'Khufu reigned ' + reign('khufu') + ' and Unas ' + reign('unas') + '. About how long after the end of Khufu’s reign did Unas begin to rule?', right, ch.filter(function (x) { return x !== right; }),
        ['Khufu’s reign ended ' + E.year(a.to, true) + '; Unas began ' + E.year(u.from, true) + '.', 'Counting down BC years: ' + (-a.to) + ' − ' + (-u.from) + ' = ' + gap + ' years, about two centuries.']);
      p.chk = { k: 'gap', gap: gap };
      return p;
    }, 0.5],
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      var E = EG(), ks = ['djoser', 'khufu', 'unas', 'pepi2'];
      var p = make(R, ctx, { seq: ks.map(function (k) { return E.king(k).name; }), q: 'Put these Old Kingdom kings in order, earliest first. (The Pyramid Texts begin with the third.)', s: ks.map(function (k) { return E.king(k).name + ': ' + reign(k) + '.'; }), l: 2 });
      p.chk = { k: 'order', kings: ks };
      return p;
    }, 0.4]
  ]);

  topic('relart.coffin-texts', [
    ['Where were the Coffin Texts written?', 'Inside the wooden coffins of officials and their families', ['On royal pyramids', 'On temple pylons', 'On ostraca at Deir el-Medina'], 'The spells were painted in ink inside the coffin, around the body.', 1],
    ['When were the Coffin Texts used most?', 'The First Intermediate Period and the Middle Kingdom', ['The Predynastic Period', 'The New Kingdom only', 'The Roman period'], 'They follow the Pyramid Texts and come before the Book of the Dead.', 1],
    ['What changed with the Coffin Texts?', 'People who were not royal could now use afterlife spells', ['Only kings could use spells', 'Spells were written in Greek', 'Spells were banned'], 'Many Coffin Texts spells adapt Pyramid Texts spells for officials.', 1],
    ['About how many Coffin Texts spells are known?', 'More than a thousand', ['About ten', 'About fifty', 'Exactly 125'], 'Adriaan de Buck’s edition numbers 1,185 spells.', 3],
    ['Which guide, painted on the floor of some coffins from Deir el-Bersha, shows two routes through the afterlife?', 'The Book of Two Ways', ['The Book of Gates', 'The Amduat', 'The Shabaka Stone'], 'It is often called the first map of the afterlife.', 3],
    ['Scholars once called the spread of afterlife spells "the democratization of the afterlife." Why do some now question the phrase?', 'The spells reached officials and the elite, not everyone, and elite hopes may be older than the texts', ['The spells were only for kings', 'No coffins survive', 'The spells were invented by Greeks'], 'The term is debated; the coffins belong to well-off families.', 2],
    { tf: false, q: 'In every period, only kings had afterlife texts.', s: 'By the Middle Kingdom, officials had spells painted on their coffins.', l: 1 },
    { tf: true, q: 'Many Coffin Texts spells grew out of earlier Pyramid Texts spells.', s: 'Some were copied and adapted; many were new.', l: 2 }
  ], 'Pyramid Texts (kings, Old Kingdom) → Coffin Texts (officials, Middle Kingdom).', [
    [function (R, ctx) { return corpusMaker(R, ctx); }, 0.6],
    [function (R, ctx) { return L(ctx) >= 2 ? corpusOrder(R, ctx) : null; }, 0.4]
  ]);

  topic('relart.book-of-dead', [
    ['What did Egyptians call the Book of the Dead?', 'Spells for going forth by day', ['The Book of the Gods', 'The Words of Thoth', 'The Great House'], 'The Egyptian title, rw nw prt m hrw, means "spells for going forth by day".', 1],
    ['On what was the Book of the Dead usually written?', 'Papyrus rolls placed in the tomb', ['Stone pyramid walls', 'Gold plates', 'Clay tablets'], 'Rolls, often with colored pictures (vignettes), were buried with the dead.', 1],
    ['From when was the Book of the Dead used?', 'From the New Kingdom on', ['From the Predynastic Period', 'Only in the Old Kingdom', 'Only under the Romans'], 'It began early in the New Kingdom and lasted into the Ptolemaic period.', 1],
    ['Was the Book of the Dead one fixed book?', 'No: each roll was a selection of spells made for its owner', ['Yes, with exactly the same spells in every copy', 'Yes, written by one author', 'Yes, read aloud each week in temples'], 'There are about two hundred spells; no roll has them all.', 1],
    ['Some rolls were bought ready-made. How can scholars tell?', 'Blank spaces were left for the owner’s name', ['They were signed by the scribe', 'They were written in red only', 'They have a price on them'], 'The buyer’s name was filled in later, sometimes never.', 2],
    ['Which spell is the famous judgment scene with the declarations of innocence?', 'Spell 125', ['Spell 6', 'Spell 110', 'Spell 30B'], '125 is the judgment; 6 is for shabtis; 110 is the Field of Reeds; 30B speaks to the heart.', 2],
    ['Which spell asks the heart not to speak against its owner, and is often carved on heart scarabs?', 'Spell 30B', ['Spell 125', 'Spell 6', 'Spell 17'], 'The heart scarab, placed on the chest of the mummy, carries spell 30B.', 3],
    ['Who gave the book its modern name, "Book of the Dead" (Todtenbuch), in 1842?', 'Karl Richard Lepsius', ['Jean-François Champollion', 'Flinders Petrie', 'Herodotus'], 'Lepsius published a long papyrus in Turin and numbered its spells.', 3],
    { tf: false, q: 'Every copy of the Book of the Dead contains the same spells in the same order.', s: 'Each roll was a selection, made or bought for one person.', l: 1 }
  ], 'A papyrus roll of chosen spells for "going forth by day", from the New Kingdom on.', [
    [function (R, ctx) { return corpusMaker(R, ctx); }, 0.5],
    [function (R, ctx) { return L(ctx) >= 2 ? corpusOrder(R, ctx) : null; }, 0.4]
  ]);

  topic('relart.underworld-books', [
    ['What does the name Amduat mean?', 'What is in the underworld (the Duat)', ['Book of the living', 'Spells for the heart', 'The going out by day'], 'jmj-dwꜣt: "that which is in the Duat".', 1],
    ['What does the Amduat describe?', 'The sun’s journey through the twelve hours of the night', ['The building of a pyramid', 'The life of Osiris as king', 'The rules for priests'], 'Each hour has its gates, gods and dangers.', 1],
    ['Where was the Amduat painted in the New Kingdom?', 'On the walls of royal tombs in the Valley of the Kings', ['On papyri for every family', 'On temple pylons', 'On coffins of the Middle Kingdom'], 'In the New Kingdom it was a royal book; later, private copies on papyrus appear.', 1],
    ['How do the Amduat and the Book of the Dead differ?', 'The Amduat follows the sun’s night journey in royal tombs; the Book of the Dead is spells on papyri for many people', ['They are the same book', 'The Amduat is older than the Pyramid Texts', 'The Book of the Dead was only for kings'], 'Different purposes and different owners.', 2],
    ['Which tomb has a famous complete Amduat drawn like a giant papyrus?', 'Thutmose III’s tomb in the Valley of the Kings', ['Tutankhamun’s tomb', 'The Great Pyramid', 'The mastaba of Ti'], 'In KV34 the hours run around the oval burial chamber in simple line drawings.', 3],
    ['Which underworld book is named after the gates that divide the hours of the night?', 'The Book of Gates', ['The Book of Caverns', 'The Book of the Earth', 'The Amduat'], 'It first appears in the tomb of Horemheb.', 2],
    ['What was the turning point of the sun’s night journey in these books?', 'The sun’s union with Osiris in the deepest hour', ['A battle with Horus', 'The weighing of the heart', 'A visit to Memphis'], 'Ra and Osiris meet, and from that moment the sun begins to rise toward dawn.', 3],
    { tf: false, q: 'The Amduat and the Book of the Dead are two names for the same book.', s: 'The Amduat shows the sun’s journey in royal tombs; the Book of the Dead is a set of spells on papyri.', l: 1 },
    { n: 12, q: 'The Amduat divides the night into hours. How many hours?', s: ['One hour for each section of the night journey: 12.', 'Answer: 12.'], l: 1 }
  ], 'Amduat: the sun’s twelve hours of night, on royal tomb walls.', [
    [function (R, ctx) { return corpusMaker(R, ctx, ['the Amduat', 'the Book of the Dead', 'the Coffin Texts']); }, 0.5]
  ]);
  // ================================================================ Unit: Tombs and Pyramids
  topic('relart.mastaba', [
    ['What does the Arabic word mastaba mean?', 'Bench', ['Pyramid', 'House of eternity', 'Mountain'], 'The low, flat-topped tombs looked like the mud-brick benches outside village houses.', 1],
    ['Where was the body placed in a mastaba?', 'In a burial chamber at the bottom of a deep shaft', ['On the roof', 'In the chapel, in view of visitors', 'In the serdab'], 'The shaft was filled in after the burial; the chapel above stayed open for offerings.', 1],
    ['What was the serdab?', 'A closed room for the statue of the dead, with a slit to look out', ['The burial shaft', 'The false door', 'The roof of the mastaba'], 'Through the slit the statue could "see" the offerings and smell the incense.', 2],
    ['What came first in Egypt, mastabas or pyramids?', 'Mastabas', ['Pyramids', 'Both appeared in the same year', 'Rock-cut tombs'], 'Early Dynastic kings and nobles had mastaba-like tombs; the first pyramid came in the 3rd Dynasty.', 1],
    ['How did Djoser’s Step Pyramid begin?', 'As a square stone mastaba, enlarged in stages into six steps', ['As a round mound of sand', 'As a smooth pyramid, later cut into steps', 'As a temple, later filled in'], 'His architect Imhotep stacked ever smaller mastaba-like layers.', 2],
    ['What were early mastabas built of?', 'Mud brick', ['Granite', 'Wood', 'Bronze'], 'Mud brick at first; Old Kingdom officials at Giza and Saqqara often built in stone.', 2],
    ['Where were the great decorated mastabas of Old Kingdom officials like Ti and Mereruka?', 'Saqqara', ['Thebes', 'Amarna', 'Abu Simbel'], 'Their chapels are covered with scenes of daily life and offerings.', 3],
    { tf: false, q: 'Pyramids came first, and mastabas were a later, cheaper copy.', s: 'Mastabas came first; the first pyramid began as a mastaba.', l: 1 },
    { tf: true, q: 'Mastabas went on being built for officials while kings built pyramids.', s: 'Rows of officials’ mastabas surround the pyramids at Giza.', l: 2 }
  ], 'A mastaba: a flat-topped building over a burial shaft, with a chapel for offerings.', [
    [function (R, ctx) {
      var E = EG(), st = E.PYRAMIDS.step;
      var p = make(R, ctx, { n: st.steps, q: 'Djoser’s Step Pyramid grew from a mastaba into a pyramid of how many steps?', s: ['The finished monument has ' + st.steps + ' steps of stone, one on top of another.'], l: 2, viz: L(ctx) >= 2 ? { name: 'eg-pyramid', opts: { which: 'step', quiet: true, interactive: false } } : undefined });
      if (!p.viz) delete p.viz;
      p.chk = { k: 'steps' };
      return p;
    }, 0.4]
  ]);

  var COMPLEX = ['Valley temple', 'Causeway', 'Mortuary temple', 'Pyramid'];
  var PYR = ['great', 'khafre', 'menkaure', 'step', 'bent', 'red'];
  topic('relart.pyramid-complex', [
    ['In a pyramid complex, which building stood nearest the river?', 'The valley temple', ['The mortuary temple', 'The pyramid', 'The queens’ pyramids'], 'Boats reached the valley temple by a canal at the edge of the flood plain.', 1],
    ['What joined the valley temple to the mortuary temple?', 'A covered causeway', ['A tunnel under the desert', 'An avenue of obelisks', 'A canal'], 'The causeway climbed from the valley to the desert plateau.', 1],
    ['Where did the mortuary temple stand?', 'Against the east side of the pyramid', ['On the river bank', 'Inside the pyramid', 'On the north side, far away'], 'The king’s daily offerings were made there.', 2],
    ['What else stood inside the walls of a pyramid complex?', 'Smaller pyramids for queens, and boat pits', ['A palace and a market', 'A harbor for warships', 'A fortress'], 'Khufu’s complex had queens’ pyramids and pits that held boats; one boat was found whole in 1954.', 2],
    ['From the ground, Khafre’s pyramid looks taller than Khufu’s. Why?', 'It stands on higher ground and keeps some casing at its top', ['It is taller', 'It was built later and so grew', 'It is closer to the river'], 'Khufu’s was the taller when built; Khafre’s sits on a higher part of the plateau.', 3],
    { seq: COMPLEX, q: 'Put the parts of a pyramid complex in order, from the river to the pyramid.', s: 'Valley temple, causeway, mortuary temple, pyramid.', l: 2 },
    { tf: false, q: 'Pyramids stood alone in the desert with no other buildings.', s: 'Each was the center of temples, a causeway and smaller pyramids.', l: 1 }
  ], 'River → valley temple → causeway → mortuary temple → pyramid.', [
    [function (R, ctx) {
      var E = EG(), key = R.pick(PYR), py = E.PYRAMIDS[key], kg = E.king(py.king);
      var wr = PYR.filter(function (k) { return E.PYRAMIDS[k].king !== py.king; }).map(function (k) { return E.king(E.PYRAMIDS[k].king).name; }).concat(['Unas', 'Ramesses II']).filter(function (n, i, a) { return a.indexOf(n) === i; });
      var p = mc(R, ctx, 'Which king built the <b>' + py.name + '</b> at ' + E.site(py.site).name + '?', kg.name, wr, [py.name + ': built for ' + kg.name + ' (' + reign(py.king) + '), ' + py.note + '.'], null, L(ctx) >= 2 ? { name: 'eg-pyramid', opts: { which: key, quiet: true, interactive: false } } : null);
      p.chk = { k: 'pyrking', pyr: key };
      return p;
    }, 0.8],
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      var E = EG(), key = R.pick(['great', 'step', 'bent', 'red', 'menkaure']), py = E.PYRAMIDS[key];
      return mapPick(R, ctx, py.site, ['giza', 'saqqara', 'dahshur', 'meidum', 'hawara', 'lisht', 'abydos', 'karnak', 'amarna', 'tanis', 'alexandria', 'hermopolis', 'beni-hasan'], 'The <b>' + py.name + '</b> stands at ' + E.site(py.site).name + '. Which lettered dot is ' + E.site(py.site).name + '?', [E.site(py.site).name + ': ' + E.site(py.site).note]);
    }, 0.4]
  ]);

  topic('relart.rock-cut', [
    ['Where were New Kingdom kings buried?', 'In rock-cut tombs in the Valley of the Kings', ['In pyramids at Giza', 'In mastabas at Saqqara', 'In the temples of Karnak'], 'From early in the 18th Dynasty kings cut their tombs into the cliffs of western Thebes.', 1],
    ['Which site has rock-cut tombs of Middle Kingdom governors painted with daily life?', 'Beni Hasan', ['Giza', 'Tanis', 'Alexandria'], 'The governors of the region cut their tombs high in the cliffs.', 1],
    ['Which tomb in the Valley of the Kings was found nearly intact in 1922?', 'Tutankhamun’s, KV62', ['Khufu’s', 'Ramesses II’s', 'Hatshepsut’s first tomb'], 'Howard Carter found it under the debris of a later tomb.', 1],
    ['Who cut and decorated the royal tombs?', 'Skilled workmen from the village of Deir el-Medina', ['Slaves from abroad', 'Soldiers', 'Priests of Amun only'], 'The crews lived in their own village and were paid in grain and goods.', 2],
    ['Why did kings stop building pyramids?', 'The reasons are debated: theft, cost and changing beliefs may all have played a part', ['They had forgotten how', 'A law banned pyramids', 'There was no more stone'], 'Scholars weigh several reasons; none is certain on its own.', 2],
    ['In the New Kingdom, the king’s tomb and his memorial temple were:', 'Far apart: the tomb hidden in the valley, the temple on the plain', ['In the same building', 'On opposite banks', 'Both inside a pyramid'], 'Separating tomb and temple was a new plan; the temples stood near the cultivated land.', 2],
    ['The peak above the Valley of the Kings is shaped like:', 'A pyramid', ['A falcon', 'A cobra', 'A cartouche'], 'Many think the natural pyramid shape of the peak, el-Qurn, made the valley fitting; this is a suggestion, not a certainty.', 3],
    { tf: false, q: 'Scholars agree that pyramids were given up only because they were too hard to build.', s: 'The reasons are debated: theft, cost, security and new ideas all play a part in the arguments.', l: 1 }
  ], 'From the Middle Kingdom, tombs were cut into cliffs; New Kingdom kings were buried in the Valley of the Kings.', [
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      var key = R.pick(['beni-hasan', 'kings']);
      return mapPick(R, ctx, key, ['giza', 'saqqara', 'tanis', 'alexandria', 'abydos', 'philae', 'meidum', 'amarna', 'beni-hasan', 'kings', 'abu-simbel', 'sais'], 'Which lettered dot is <b>' + EG().site(key).name + '</b>?', [EG().site(key).name + ': ' + EG().site(key).note]);
    }, 0.5]
  ]);

  topic('relart.tomb-scenes', [
    ['Why were tomb walls painted with farming, feasting and offerings?', 'To provide for the dead forever', ['To record exactly what happened on certain days', 'To decorate the house of the living', 'To teach children farming'], 'The images were meant to keep working for eternity.', 1],
    ['Do tomb scenes show real events from the owner’s life?', 'They show an ideal life, more than one real day', ['Yes, like photographs', 'Only battles', 'Only the funeral'], 'Scenes repeat standard themes: plowing, harvest, fishing, banquets.', 1],
    ['A tomb owner is often shown seated before a table piled with food. Why?', 'So that he would be fed forever', ['To show he was greedy', 'To show his kitchen', 'To show a funeral meal for guests'], 'The offering table scene, with an offering list, provided food for eternity.', 1],
    ['In some burial chambers, signs of dangerous animals such as snakes are drawn cut in two. Why?', 'So that the pictures could not come to life and harm the dead', ['The artists made mistakes', 'To save paint', 'They were later damaged by robbers'], 'Egyptians believed images could act; dangerous ones were disabled.', 3],
    ['Why might a later visitor scratch out the face of a figure in a tomb?', 'To stop the image from working for its owner', ['To clean it', 'To copy it', 'For no reason'], 'Damage to images and names was meant to harm their owner.', 2],
    { tf: false, q: 'Tomb scenes are snapshots of real events, like photographs.', s: 'They show an ideal life, meant to last for eternity.', l: 1 },
    { tf: true, q: 'Egyptians believed that images in a tomb could work for the dead.', s: 'Pictures of food and servants were meant to provide forever.', l: 1 }
  ], 'Tomb pictures were meant to work: they provided an ideal life forever.');
  // ================================================================ Unit: The Rules of Egyptian Art
  var PARTS = [['the head', 'In profile (from the side)'], ['the eye', 'From the front'], ['the shoulders', 'From the front'], ['the legs', 'In profile (from the side)'], ['the feet', 'In profile (from the side)'], ['the nose and mouth', 'In profile (from the side)']];
  topic('relart.aspective', [
    ['Why do Egyptian figures show the face in profile but the eye from the front?', 'Each part is drawn from the view that shows it most clearly', ['Artists did not notice the mistake', 'The eye was added later by another artist', 'It shows the person is turning around'], 'The profile shows the shape of the nose and mouth best; the eye is clearest from the front.', 1],
    ['A pool in a garden painting is drawn from above, but the trees around it are drawn from the side. Why?', 'Each thing is shown in its most typical view', ['The painter could not decide', 'The trees were lying down', 'It is a map for travelers'], 'The pool’s shape is clearest from above; a tree’s from the side.', 2],
    ['What name do scholars give to this way of combining views?', 'Aspective (composite) representation', ['Linear perspective', 'Cubism', 'Foreshortening'], 'Aspective shows each part as it is known to be, not as seen from one spot.', 2],
    ['Did Egyptian artists use the convention because they could not draw what they saw?', 'No: they chose to show each part clearly and completely', ['Yes, they could not draw at all', 'Yes, until the Romans taught them', 'No, the convention was a mistake'], 'Lively, more naturalistic drawings on ostraca show they could; formal art kept the rules on purpose.', 1],
    ['A table of offerings is shown with the food stacked above it, as if floating. What does this show?', 'The objects on the table, each shown whole', ['Food falling from the sky', 'A table with tall shelves', 'A mistake in perspective'], 'Everything on the table is lifted into view so nothing is hidden behind anything else.', 3],
    { tf: false, q: 'Egyptian artists drew figures this way because they did not understand how bodies look.', s: 'They chose to show each part from its clearest view.', l: 1 }
  ], 'Each part from its clearest view: profile face and legs, frontal eye and shoulders.', [
    [function (R, ctx) {
      var pt = R.pick(PARTS), wr = ['In profile (from the side)', 'From the front', 'From above', 'From behind'].filter(function (x) { return x !== pt[1]; });
      var p = mc(R, ctx, 'In a standard Egyptian drawing of a standing man, how ' + (/s$|mouth$/.test(pt[0]) ? 'are' : 'is') + ' <b>' + pt[0] + '</b> drawn?', pt[1], wr, ['Head, nose and mouth, legs and feet in profile; eye and shoulders from the front.', cap1(pt[0]) + ': ' + pt[1].toLowerCase() + '.']);
      p.chk = { k: 'part', part: pt[0] };
      return p;
    }, 1.2]
  ]);

  topic('relart.canon', [
    ['How many squares tall, from the soles of the feet to the hairline, was a standing figure on the classic grid?', '18', ['21', '12', '30'], 'The classic grid used 18 squares from sole to hairline.', 1],
    ['A later grid, used from the 25th and 26th Dynasties on, divided a standing figure into how many squares (to the upper eyelid)?', '21', ['18', '14', '8'], 'The later grid had smaller squares: 21 from the soles to the upper eyelid.', 2],
    ['How do we know the grid was used in ancient times?', 'Grids survive on unfinished walls and drawing boards', ['A modern scholar invented it in 1900', 'Greek writers drew it', 'It is only a guess'], 'Unfinished tombs show red grid lines under the drawings.', 1],
    ['What was the grid for?', 'Keeping proportions the same and copying a design onto a wall at any size', ['Measuring land for taxes', 'Dividing the wall among painters by pay', 'Marking where to drill holes'], 'A small sketch on a grid could be copied square by square onto a large grid on the wall.', 1],
    ['A seated figure on the classic grid reached the hairline at about which square?', '14', ['18', '21', '9'], 'A seated figure is shorter: about 14 squares to the hairline.', 3],
    { tf: false, q: 'The grid of squares was invented by modern scholars to study Egyptian art.', s: 'Grid lines survive on unfinished ancient walls.', l: 1 }
  ], 'Classic grid: 18 squares from sole to hairline; the later grid: 21 squares to the eyelid.', [
    [function (R, ctx) {
      var lv = L(ctx), late = lv === 3 && R.coin(), n = late ? 21 : 18, sq = R.int(2, lv === 1 ? 5 : 9);
      var mode = lv === 1 ? 0 : R.int(0, 1), h = n * sq;
      var where = late ? 'the later 21-square grid (soles to upper eyelid)' : 'the classic 18-square grid (soles to hairline)';
      var p;
      if (mode === 0) p = make(R, ctx, { n: h, unit: 'cm', q: 'An artist draws a standing figure on ' + where + ', with squares ' + sq + ' cm wide. How tall is the figure from the soles to the ' + (late ? 'upper eyelid' : 'hairline') + '?', s: ['The figure is ' + n + ' squares tall.', n + ' × ' + sq + ' = ' + h + ' cm.'], l: 1 });
      else p = make(R, ctx, { n: sq, unit: 'cm', q: 'A standing figure measures ' + h + ' cm from the soles to the ' + (late ? 'upper eyelid' : 'hairline') + ' on ' + where + '. How wide is each square?', s: ['The figure spans ' + n + ' squares.', h + ' ÷ ' + n + ' = ' + sq + ' cm.'], l: 2 });
      p.chk = { k: 'grid', n: n, sq: sq, mode: mode };
      return p;
    }, 1],
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      var small = R.int(2, 4), big = small * R.int(3, 6), hs = 18 * small, hb = 18 * big;
      var p = make(R, ctx, { n: hb, unit: 'cm', q: 'A sketch of a figure is drawn on a grid of ' + small + ' cm squares: 18 squares from the soles to the hairline (' + hs + ' cm). The artist copies it square by square onto a wall grid of ' + big + ' cm squares. How tall is the copy, soles to hairline?', s: ['The copy keeps 18 squares; only the square size changes.', '18 × ' + big + ' = ' + hb + ' cm (' + (big / small) + ' times the sketch).'], l: 2 });
      p.chk = { k: 'gridcopy', big: big };
      return p;
    }, 0.5]
  ]);

  topic('relart.scale', [
    ['In Egyptian art, what does the size of a figure show?', 'Importance or rank', ['Distance from the viewer', 'Age', 'The person’s real height'], 'The most important figure is the largest.', 1],
    ['In a scene of the king defeating enemies, who is drawn largest?', 'The king', ['The enemies', 'The soldiers', 'The horses'], 'The king towers over his foes, as on the Narmer Palette from Hierakonpolis.', 1],
    ['In a tomb scene, the owner is shown much taller than the servants. Why?', 'He is the most important person in the scene', ['He was a giant', 'The servants are far away', 'The servants were children'], 'Size follows rank, not height or distance.', 1],
    ['When the king stands before a god, how are they usually sized?', 'About the same size', ['The king much larger', 'The god tiny', 'The king tiny'], 'Gods and the king share the top rank, so they are drawn at the same scale.', 2],
    ['A scene shows a man, his wife beside his leg at half his height, and small children. What does the size tell us?', 'The husband is the tomb owner, the main figure of the scene', ['The wife was very short', 'The wife was far behind him', 'The children were babies only'], 'Wives are sometimes shown as large as their husbands; when smaller, the size marks whose tomb it is.', 2],
    { tf: false, q: 'In Egyptian art, smaller figures are farther away.', s: 'Size shows rank, not distance.', l: 1 },
    { tf: true, q: 'Scholars call this convention hierarchic (or hierarchical) scale.', s: 'Hierarchic scale: size by rank.', l: 2 }
  ], 'The bigger the figure, the more important the person.');

  var COLORS = [['black', 'the fertile Nile soil, and so rebirth'], ['green', 'growth, freshness and new life'], ['red', 'energy and power, but also danger and the desert'], ['gold', 'the flesh of the gods, which never decays'], ['blue', 'the sky and the water']];
  topic('relart.color', [
    ['Egyptians called their country ' + tl('kmt') + '. What does it mean?', 'The Black Land, for its dark fertile soil', ['The Red Land', 'The Land of Gold', 'The Two Lands'], 'kmt, from km "black": the dark mud left by the flood. The desert was dšrt, the Red Land.', 1],
    ['Osiris is often painted with black or green skin. Why?', 'Black and green stood for fertile soil and new life', ['He was from a foreign land', 'The paint has changed color', 'He was sick'], 'His skin shows rebirth, not a place of origin.', 1],
    ['Red ink was used for headings in papyri. What else could red mark?', 'Danger: the names of hostile beings like Apep', ['Happiness', 'The king’s name', 'Gold'], 'Red was the color of the desert and of Seth, as well as of energy and life.', 2],
    ['Men were usually painted with reddish-brown skin and women with lighter, yellowish skin. What was this?', 'An artistic convention', ['A portrait of each person’s real skin', 'A sign of illness', 'A sign of foreign birth'], 'The colors followed rules of art, not individual skin.', 2],
    ['Egyptian texts describe the gods with flesh of gold and hair of which precious stone?', 'Lapis lazuli', ['Turquoise', 'Granite', 'Obsidian'], 'Gold flesh never decays; lapis lazuli is deep blue.', 3],
    { tf: false, q: 'Black skin on Osiris shows that he came from a land to the south.', s: 'Black stood for the fertile soil and rebirth.', l: 1 }
  ], 'Black = fertile soil and rebirth; green = new life; red = energy or danger; gold = the gods’ flesh.', [
    [function (R, ctx) {
      var c = R.pick(COLORS);
      if (R.coin()) {
        var p = mc(R, ctx, 'In Egyptian art, the color <b>' + c[0] + '</b> often stood for:', cap1(c[1]), COLORS.filter(function (x) { return x !== c; }).map(function (x) { return cap1(x[1]); }), [cap1(c[0]) + ': ' + c[1] + '.']);
        p.chk = { k: 'color', c: c[0] }; return p;
      }
      var p2 = mc(R, ctx, 'Which color often stood for <b>' + c[1] + '</b>?', cap1(c[0]), COLORS.filter(function (x) { return x !== c; }).map(function (x) { return cap1(x[0]); }), [cap1(c[0]) + ': ' + c[1] + '.']);
      p2.chk = { k: 'color', c: c[0] }; return p2;
    }, 1]
  ]);

  topic('relart.registers', [
    ['What is a register in Egyptian art?', 'A horizontal band of a scene, with its own ground line', ['A list of temple goods', 'A kind of statue', 'The frame of a door'], 'Walls are divided into rows, each standing on a line.', 1],
    ['How do you read a wall with several registers?', 'Band by band, like lines of text', ['As one scene in depth, with the top farthest away', 'Only the bottom band matters', 'From the middle outward'], 'Each band is its own row; the top is not "farther back".', 1],
    ['A tall figure of the tomb owner stands at the side of a wall with several registers. What does he usually do?', 'He watches over all the bands of activity', ['He is part of the bottom row only', 'He is a later addition', 'He is falling'], 'The owner’s large figure spans many registers, overseeing the work.', 2],
    ['In hieroglyphs and in scenes, figures and signs face toward:', 'The beginning of the line', ['The end of the line', 'The ceiling', 'The viewer'], 'Read toward the faces: the signs look at where the text starts.', 2],
    { tf: false, q: 'The upper registers show things that are farther away.', s: 'Each register is a separate row; height on the wall is not distance.', l: 1 }
  ], 'Registers are rows, read like lines of text; signs face where the line begins.', [
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      var dir = R.pick(['ltr', 'rtl']), wkey = R.pick(['remetj', 'heqa', 'anubis', 'heru', 'osiris']);
      var right = dir === 'ltr' ? 'From left to right' : 'From right to left';
      var p = mc(R, ctx, 'The people, birds and animals in this word face ' + (dir === 'ltr' ? 'left' : 'right') + '. Which way do you read it?', right, [dir === 'ltr' ? 'From right to left' : 'From left to right', 'From the bottom up', 'In any direction'],
        ['Signs face the start of the line.', 'They face ' + (dir === 'ltr' ? 'left' : 'right') + ', so you read ' + right.toLowerCase() + '.'], 'Read toward the faces.', { name: 'eg-glyphs', opts: { word: wkey, dir: dir, quiet: true, interactive: false } });
      p.chk = { k: 'dir', dir: dir };
      return p;
    }, 0.6]
  ]);
  // ================================================================ Unit: Sculpture, Relief and Painting
  var STATUES = [
    ['A man sits on a block-shaped seat, hands on his knees, looking straight ahead.', 'A seated statue'],
    ['A man stands with his left foot forward and his arms at his sides, a pillar at his back.', 'A standing striding statue'],
    ['A man sits cross-legged with a papyrus roll open on his lap.', 'A scribe statue'],
    ['A man squats with his knees drawn up to his chin, wrapped in a cloak so that his body is a block with a head on top.', 'A block statue'],
    ['A husband and wife stand or sit side by side, her arm around him.', 'A pair statue']];
  topic('relart.statues', [
    ['In standing statues of men, which foot is forward?', 'The left foot', ['The right foot', 'Neither: the feet are together', 'Both feet are raised'], 'Standing men stride with the left foot forward; women often stand with feet closer together.', 1],
    ['Does the forward left foot mean the man is walking?', 'No: it is a convention of standing statues of men', ['Yes, he is walking quickly', 'Yes, he is dancing', 'No, he is kneeling'], 'The pose is a rule of the art, used for standing men, not a moment of walking.', 1],
    ['Where were statues of the dead placed in an Old Kingdom mastaba?', 'In the serdab, a closed statue room', ['In the burial shaft', 'On the roof', 'In the valley temple only'], 'The statue was a home for the ka.', 2],
    ['Which kind of statue first became common in the Middle Kingdom?', 'The block statue', ['The seated statue', 'The standing striding statue', 'The pair statue'], 'Block statues were set up in temples so the owner could share in the offerings.', 3],
    ['Why did people set up their own statues in temples?', 'To share in the god’s offerings and be near the god forever', ['To sell them to pilgrims', 'To scare away thieves', 'To mark property lines'], 'A statue in a temple let its owner take part in the god’s rites.', 2],
    ['The famous seated statue of Khafre has a falcon behind his head. Which god is the falcon?', 'Horus, protecting the king', ['Thoth', 'Anubis', 'Sobek'], 'Horus spreads his wings around the king’s head.', 2],
    { tf: false, q: 'The forward left foot in statues of men shows that they are walking.', s: 'It is a convention of standing statues of men.', l: 1 }
  ], 'Seated, striding (left foot forward), scribe, block and pair: learn the poses.', [
    [function (R, ctx) {
      var s = R.pick(STATUES);
      var p = mc(R, ctx, 'Which kind of statue is this? <b>' + s[0] + '</b>', s[1], STATUES.filter(function (x) { return x !== s; }).map(function (x) { return x[1]; }), [s[1] + ': ' + s[0].charAt(0).toLowerCase() + s[0].slice(1)]);
      p.chk = { k: 'statue', s: s[1] };
      return p;
    }, 1.2]
  ]);

  topic('relart.relief', [
    ['In raised relief, what is cut away?', 'The background, so the figures stand out', ['The figures, so they sink into the wall', 'Nothing: it is only painted', 'The top of the wall'], 'The background is lowered around the figure.', 1],
    ['In sunk relief, what is cut away?', 'The figures are cut into the wall; the background stays flat', ['The background, so the figures stand out', 'Nothing', 'The whole wall is carved through'], 'The figure lies below the surface, outlined by a deep edge.', 1],
    ['Where does sunk relief work best?', 'Outdoors in bright sun, where deep shadows show the outline', ['In dark rooms', 'Under water', 'On small jewelry'], 'Strong sunlight casts sharp shadows in the cut edges.', 1],
    ['Where was raised relief usually used?', 'Indoors, where light was softer', ['Only on obelisks', 'Only on coffins', 'Only outdoors'], 'In soft light, raised figures show their modeling.', 2],
    ['Which king had many reliefs cut in deep sunk relief, which is also hard to erase or recarve?', 'Ramesses II', ['Khufu', 'Djoser', 'Narmer'], 'Ramesses II used sunk relief widely, even indoors.', 2],
    ['Were reliefs left the color of the stone?', 'No: most were painted', ['Yes, always', 'Only sunk reliefs were painted', 'Only gods were painted'], 'Paint survives in many protected places; the bare stone we see today has lost it.', 2],
    { tf: true, q: 'In sunk relief, the edges of the figure go down into the stone.', s: 'The figure is cut below the surface of the wall.', l: 1 },
    { tf: false, q: 'Raised relief and sunk relief are two names for the same thing.', s: 'Raised relief lowers the background; sunk relief cuts the figure in.', l: 1 }
  ], 'Raised relief lowers the background; sunk relief cuts the figure into the wall.', [
    [function (R, ctx) {
      var sunk = R.coin();
      var q = sunk ? 'A carving on an outside wall: the figure’s outline is cut deep into the stone, and the wall around it is the original flat surface.' : 'A carving inside a tomb chapel: the stone around the figure has been cut back, so the figure stands slightly above it.';
      var p = mc(R, ctx, 'What kind of relief is this? <b>' + q + '</b>', sunk ? 'Sunk relief' : 'Raised relief', [sunk ? 'Raised relief' : 'Sunk relief', 'A painting only', 'A statue in the round'], [sunk ? 'The figure is cut into the wall: sunk relief, which suits bright sun outdoors.' : 'The background is cut away: raised relief, used indoors.']);
      p.chk = { k: 'relief', sunk: sunk };
      return p;
    }, 1]
  ]);

  var PIG = [['Egyptian blue', 'a manufactured pigment: sand, lime and copper heated together'], ['red ochre', 'iron-rich earth'], ['yellow ochre', 'iron-rich earth, yellow form'], ['black', 'soot (carbon)'], ['white', 'gypsum or chalk'], ['green', 'malachite, a copper mineral (or ground green frit)']];
  topic('relart.painting', [
    ['What is special about Egyptian blue?', 'It is the first known synthetic pigment, made by people', ['It came from blue flowers', 'It was imported from China', 'It was made from the sky’s reflection in water'], 'It was made by heating sand, lime, copper and a flux, then grinding the blue result.', 1],
    ['On what surface did painters usually work?', 'Plaster or smoothed stone', ['Canvas on a frame', 'Glass', 'Paper'], 'Walls were coated with mud plaster and a fine white layer, or smoothed if the stone was good.', 1],
    ['Did Egyptian painters use fresco (painting into wet plaster)?', 'No: they painted on dry plaster', ['Yes, always', 'Only for ceilings', 'Only in Roman times'], 'Pigments were mixed with a binder such as plant gum and laid on dry plaster.', 2],
    ['What tools did painters use for brushes?', 'Reeds and palm fibers', ['Animal-hair brushes from Europe', 'Feathers only', 'Metal pens'], 'Chewed or frayed reeds and fibers made brushes.', 2],
    ['Most Egyptian statues and reliefs today look like bare stone. How did they look when new?', 'Painted in bright colors', ['The same as today', 'Covered in cloth', 'Gilded all over'], 'Paint has worn away from most surfaces, but traces survive.', 1],
    ['The paintings from the tomb chapel of Nebamun (now in the British Museum) show what?', 'Scenes such as a garden pool, a banquet and hunting in the marshes', ['The Battle of Kadesh', 'The building of the Great Pyramid', 'The Rosetta Stone'], 'They are among the finest New Kingdom paintings.', 3],
    { tf: false, q: 'Egyptian art was meant to be seen as plain stone.', s: 'Most was painted in bright colors.', l: 1 }
  ], 'Mineral colors and Egyptian blue, on dry plaster or stone.', [
    [function (R, ctx) {
      var pg = R.pick(PIG);
      var p = mc(R, ctx, 'Egyptian painters made <b>' + pg[0] + '</b> from what?', cap1(pg[1]), PIG.filter(function (x) { return x !== pg && !(/ochre/.test(x[0]) && /ochre/.test(pg[0])); }).map(function (x) { return cap1(x[1]); }), [cap1(pg[0]) + ': ' + pg[1] + '.']);
      p.chk = { k: 'pig', p: pg[0] };
      return p;
    }, 0.8]
  ]);

  var AMARNA = ['A long face with a long chin and full lips', 'A rounded belly and wide hips', 'The royal family kissing and playing together', 'The sun disk with rays ending in hands'];
  var CLASSIC = ['A calm, idealized young face', 'A broad-shouldered, slim, athletic body', 'The king smiting enemies in a formal pose', 'The god in human form with an animal head'];
  topic('relart.amarna-art', [
    ['Under which king did the Amarna style begin?', 'Akhenaten', ['Ramesses II', 'Khufu', 'Ptolemy V'], 'Akhenaten (Amenhotep IV) put the Aten above all gods and changed the art.', 1],
    ['How was the Aten shown in Amarna art?', 'As a sun disk with rays ending in hands', ['As a man with a falcon’s head', 'As a ram', 'As a cobra'], 'Hands at the ends of the rays often hold ankh signs to the noses of the king and queen.', 1],
    ['What is the most famous portrait from Amarna, found in a sculptor’s workshop in 1912?', 'The painted bust of Nefertiti', ['The gold mask of Tutankhamun', 'The seated statue of Khafre', 'The Narmer Palette'], 'It was found in the workshop of the sculptor Thutmose and is now in Berlin.', 2],
    ['Do Amarna portraits prove that Akhenaten had a disease?', 'No: they reflect an artistic style, and what it meant is debated', ['Yes, doctors agree', 'Yes, his mummy proves it', 'No, because he was never shown at all'], 'A medical cause has not been confirmed; many scholars see a deliberate style with religious meaning.', 2],
    ['What happened to Amarna art after Akhenaten?', 'Art returned to the older style, keeping some softer features', ['It was used for another thousand years', 'Art stopped being made', 'All art became Greek'], 'Under Tutankhamun and later kings, the old rules came back, but some Amarna softness lingered.', 2],
    ['Which of these scenes is typical of Amarna art?', 'The king and queen kissing their daughters under the Aten’s rays', ['The king smiting enemies before Amun', 'A god with a jackal’s head weighing a heart', 'A row of identical soldiers'], 'Family scenes were new and common at Amarna.', 1],
    { tf: false, q: 'Amarna portraits are clear medical evidence of an illness.', s: 'They reflect a new style; what it meant is debated.', l: 1 }
  ], 'Long faces, rounded bodies, family scenes and the Aten’s hands: a new style whose meaning is debated.', [
    [function (R, ctx) {
      var i = R.int(0, AMARNA.length - 1), am = R.coin();
      var p = mc(R, ctx, 'Which feature is typical of <b>' + (am ? 'Amarna art' : 'traditional Egyptian art before and after Amarna') + '</b>?', am ? AMARNA[i] : CLASSIC[i], R.shuffle(am ? CLASSIC : AMARNA), [am ? 'Amarna art shows long faces, rounded bodies, family life and the Aten’s rays.' : 'Traditional art shows idealized, calm faces and athletic bodies in formal poses.']);
      p.chk = { k: 'amarna', am: am };
      return p;
    }, 0.8],
    [function (R, ctx) {
      if (L(ctx) < 2) return null;
      var E = EG(), ks = ['amenhotep3', 'akhenaten', 'tutankhamun', 'ramesses2'];
      var p = make(R, ctx, { seq: ks.map(function (k) { return E.king(k).name; }), q: 'Put these kings in order, earliest first.', s: ks.map(function (k) { return E.king(k).name + ': ' + reign(k) + '.'; }), l: 2 });
      p.chk = { k: 'order', kings: ks };
      return p;
    }, 0.4]
  ]);

  // ================================================================ Unit: Everyday Religion
  topic('relart.household-gods', [
    ['Which god, shown as a dwarf with a lion-like face and a feathered crown, protected homes, mothers and children?', 'Bes', ['Ptah', 'Khnum', 'Thoth'], 'Bes appears on beds, headrests, mirrors and amulets.', 1],
    ['Which goddess, a standing hippopotamus with a lion’s paws and a crocodile’s tail, protected women in childbirth?', 'Taweret', ['Sekhmet', 'Hathor', 'Nut'], 'Her fierce mixed form scared away harm.', 1],
    ['Why were Bes and Taweret shown looking fierce?', 'To frighten away dangers from the family', ['Because they were evil', 'Because they were foreign enemies', 'To scare children into obedience'], 'Their fierce faces faced outward, against harm.', 1],
    ['At home, where might a family keep images of household gods or of honored ancestors?', 'In a small shrine or wall niche in the house', ['Only in the temple', 'Buried under the floor', 'Nowhere: it was forbidden'], 'Houses at Deir el-Medina had niches and small shrines.', 2],
    ['Curved wands of hippopotamus ivory carved with protective creatures were used in the Middle Kingdom to:', 'Protect mothers and babies', ['Measure fields', 'Herd cattle', 'Play music'], 'These wands drew a protective circle around mother and child.', 3],
    { tf: false, q: 'Only the great temple gods mattered to ordinary Egyptians.', s: 'Daily life had its own protectors, like Bes and Taweret.', l: 1 }
  ], 'Bes and Taweret: fierce protectors of the home, of mothers and of children.', [
    [function (R, ctx) { return godByLook(R, ctx, ['bes', 'taweret', 'hathor', 'sekhmet', 'sobek', 'khnum', 'thoth', 'ptah']); }, 0.8]
  ]);

  var AMULETS = [['S34', 'The ankh', 'life'], ['R11', 'The djed pillar', 'stability (the backbone of Osiris)'], ['L1', 'The scarab', 'renewal, like the rising sun']];
  topic('relart.amulets', [
    ['What was the wedjat eye amulet thought to give?', 'Protection and wholeness: the healed eye of Horus', ['Wealth', 'The power to fly', 'Long hair'], 'The wedjat ("sound") eye recalls the eye of Horus, hurt and healed.', 1],
    ['What does the ankh stand for?', 'Life', ['Water', 'Gold', 'Death'], 'ꜥnḫ means "life; to live".', 1],
    ['The scarab beetle stood for renewal. Why?', 'Egyptians linked it with the sun rising each day, as Khepri', ['It ate crops', 'It lived in the Nile', 'It was rare'], 'Its name, ḫpr, means "come into being".', 1],
    ['What does the djed pillar stand for?', 'Stability; it was linked with the backbone of Osiris', ['A tree of life', 'A ladder to the sky', 'A royal scepter'], 'ḏd means "stable, enduring".', 2],
    ['The tyet amulet, a knot, was linked with which goddess?', 'Isis', ['Sekhmet', 'Bastet', 'Taweret'], 'The "knot of Isis" was often made of red stone.', 2],
    ['What large amulet was placed over the heart of a mummy?', 'A heart scarab inscribed with spell 30B', ['A wedjat eye made of gold', 'A djed pillar of wood', 'A canopic jar'], 'The heart scarab asked the heart not to speak against its owner.', 3],
    { tf: false, q: 'Amulets were only jewelry, worn for their beauty.', s: 'They were worn for protection, in life and in the tomb.', l: 1 }
  ], 'Each amulet had a meaning: ankh life, djed stability, scarab renewal, wedjat wholeness, tyet Isis’s protection.', [
    [function (R, ctx) {
      var E = EG(), a = R.pick(AMULETS), s = E.sign(a[0]);
      var p = mc(R, ctx, 'This hieroglyph was also worn as an amulet. Which one is it, and what does it stand for?', a[1] + ', for ' + a[2], AMULETS.filter(function (x) { return x !== a; }).map(function (x) { return x[1] + ', for ' + x[2]; }).concat(['The wedjat eye, for protection and wholeness']),
        ['The sign is ' + a[0] + ', ' + s.n + ': ' + s.use + '.', a[1] + ' stood for ' + a[2] + '.'], 'Look at the shape: a loop with a crossbar, a pillar with bands, or a beetle.', { name: 'eg-glyphs', opts: { sp: a[0], tl: s.v[0], en: s.use, quiet: true, interactive: false } });
      p.chk = { k: 'amulet', code: a[0] };
      return p;
    }, 1]
  ]);

  topic('relart.oracles', [
    ['How did a god give answers through an oracle at a festival?', 'The god’s boat, carried by priests, moved to show yes or no', ['A priest drew lots in secret', 'The statue spoke out loud', 'A bird flew to one side'], 'Forward could mean yes and back no; questions might be written on potsherds.', 1],
    ['What did people write letters to the dead on?', 'Bowls left at the tomb, often with food offerings', ['Temple walls', 'Gold plates', 'The coffin lid of the king'], 'A bowl of food carried the letter to the dead relative.', 1],
    ['Why did people write to dead relatives?', 'To ask for help or to stop troubles they blamed on the dead', ['To announce weddings', 'To pay taxes', 'To order furniture'], 'The dead could still act among the living, for good or ill.', 1],
    ['At Deir el-Medina, the workmen asked oracle questions of which deified king?', 'Amenhotep I', ['Khufu', 'Ramesses II', 'Alexander the Great'], 'Amenhotep I, honored as the village’s founder, gave oracles in procession.', 3],
    ['What were "ear stelae"?', 'Small stelae carved with ears, so the god would hear a prayer', ['Earrings for statues', 'Records of hearing tests', 'Gate posts'], 'They show ordinary people asking gods to listen.', 2],
    ['What do oracles and letters to the dead show about ordinary Egyptians?', 'They had their own ways to reach gods and the dead', ['They had no religion', 'They could not write', 'Only kings could pray'], 'Personal religion was part of daily life.', 2],
    { tf: false, q: 'Ordinary people had no way to ask the gods for help.', s: 'They used oracles at festivals, prayers, ear stelae and letters to the dead.', l: 1 }
  ], 'Oracles at festivals and letters on bowls: how ordinary people reached gods and the dead.');
})(window.MathLadder);
