/* Middle Egyptian I (me1): problem generators for the Egyptology Ladder.
   Built from /tmp/work_egypt/me1/gen/*.js by build_gen.js. Sign values, kinds and spellings come from the kit's model
   (MathLadder.egypt: SIGNS, WORDS, NAMES, numerals, say(), mdc()); the few extra spellings below (SP, XNAMES) use only
   signs of the model's list and were checked against Gardiner, Egyptian Grammar (1927). Grammar forms are built by rule
   from the small vocabulary VOC (gender, plural, dual) and checked in /tmp/work_egypt/me1/test/verify.js. */
(function (ML) {
  'use strict';
  function EG() { return ML.egypt; }
  // every generator's mc choices are reduced to plain text (the answer box shows choices as text, not HTML)
  function cleanSpec(a) { if (!a) return; if (a.t === 'mc' && a.choices) a.choices = a.choices.map(plain); if (a.t === 'multi') (a.parts || []).forEach(function (q) { cleanSpec(q.a); }); }
  function G(id, fn) { ML.gen(id, function (R, ctx) { var p = fn(R, ctx); if (p) cleanSpec(p.a); return p; }); }

  /* ---------- small helpers ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function sg(c, big) { var S = EG().SIGNS[c]; return '<span class="eg-h" style="font-size:' + (big || 1.7) + 'em;line-height:1">' + S.u + '</span>'; }
  function sgs(codes, big) { return '<span class="eg-h" style="font-size:' + (big || 1.5) + 'em;line-height:1">' + codes.map(function (c) { return EG().SIGNS[c].u; }).join('') + '</span>'; }
  function T(s) { return '<i class="eg-tl">' + esc(EG().show(s)) + '</i>'; }
  function Q(s) { return '“' + s + '”'; }
  function mdc(s) { return EG().mdc(s); }
  function glyphs(o) { var x = { quiet: true, interactive: false }; for (var k in o) x[k] = o[k]; return { name: 'eg-glyphs', opts: x }; }
  function cart(o) { var x = { quiet: true, interactive: false }; for (var k in o) x[k] = o[k]; return { name: 'eg-cartouche', opts: x }; }
  function tla(v, strict) { var a = { t: 'translit', v: v }; if (strict) a.strict = true; return a; }
  // multiple choice: the correct answer first, then up to k-1 different wrong ones (in the given order)
  // choices are shown as text (not HTML): markup from T() and <code> is reduced to its letters
  function plain(s) { return String(s).replace(/<span class="eg-h"[^>]*>([^<]*)<\/span>/g, '$1').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
  function mc(right, wrongs, k) {
    var tlc = /^<i class="eg-tl">[^<]*<\/i>$/.test(String(right));
    right = plain(right);
    var out = [right], seen = {}; seen[right] = 1; k = k || 4;
    for (var i = 0; i < wrongs.length && out.length < k; i++) { var w = wrongs[i] === undefined || wrongs[i] === null ? '' : plain(wrongs[i]); if (w !== '' && !seen[w]) { seen[w] = 1; out.push(w); } }
    var a = { t: 'mc', choices: out, v: 0 }; if (tlc) a.tlc = true; return a;
  }
  // "which sign…": the candidate signs are drawn in the picture, numbered; the choices are their numbers
  function signPick(R, right, wrongs, k) {
    var list = [right], i; k = k || 4;
    for (i = 0; i < wrongs.length && list.length < k; i++) if (wrongs[i] && list.indexOf(wrongs[i]) < 0) list.push(wrongs[i]);
    list = R.shuffle(list);
    return { viz: glyphs({ sp: list.join('-'), number: true }), a: { t: 'mc', choices: list.map(function (_, j) { return 'Sign ' + (j + 1); }), v: list.indexOf(right), keep: true, signs: list } };
  }
  function mck(right, wrongs, k) { var a = mc(right, wrongs, k); a.keep = true; return a; }
  function lv(ctx) { return ctx && ctx.level || 1; }
  function pick(R, a) { return R.pick(a); }
  function sample(R, a, k) { return R.sample(a, Math.min(k, a.length)); }
  function vals(c) { return EG().SIGNS[c].v; }
  function nameOf(c) { return EG().SIGNS[c].n; }
  function W(k) { return EG().WORDS[k]; }
  function letters(s) { return EG().letters(s).filter(function (x) { return !!x; }); }
  function sayIt(s) { return EG().say(s); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }


  /* ---------- determinatives: the class of meaning each one shows (from the model's "use", Gardiner's sign list) ---------- */
  var DETCLASS = { A1: 'men and male persons', B1: 'women', A2: 'eating, drinking, speaking, thinking and feeling', A40: 'gods and the king', G7: 'gods and the king',
    A24: 'force and effort', A53: 'mummies, statues and likenesses', A55: 'death and lying down', D54: 'motion', Y1: 'writing and abstract ideas',
    N1: 'the sky and things above', N25: 'foreign lands and the desert', O49: 'towns and cities', O1: 'buildings', N35A: 'water and liquids',
    N5: 'the sun, light and time', H8: 'goddesses’ names', I12: 'goddesses', E1: 'cattle', K1: 'fish', M2: 'plants and flowers', T14: 'foreign peoples',
    F27: 'animals and skins', W22: 'beer and jars', N33: 'sand, minerals and grains', G37: 'small, weak, bad or wrong things', E15: 'the god Anubis',
    Z2: 'more than one (the plural)', V10: 'names' };

  /* ---------- the alphabet in five lessons (Gardiner code, letter) ---------- */
  var ALPHA_SETS = {
    1: [['G1', 'ꜣ'], ['M17', 'j'], ['M17A', 'y'], ['D36', 'ꜥ'], ['G43', 'w']],
    2: [['D58', 'b'], ['Q3', 'p'], ['I9', 'f'], ['G17', 'm'], ['N35', 'n']],
    3: [['D21', 'r'], ['O4', 'h'], ['V28', 'ḥ'], ['Aa1', 'ḫ'], ['F32', 'ẖ']],
    4: [['O34', 'z'], ['S29', 's'], ['N37', 'š'], ['N29', 'q'], ['V31', 'k'], ['W11', 'g']],
    5: [['X1', 't'], ['V13', 'ṯ'], ['D46', 'd'], ['I10', 'ḏ']]
  };
  // letters easily confused with each one (for distractors)
  var NEAR = { 'ꜣ': ['ꜥ', 'j', 'w'], 'j': ['y', 'ꜣ', 'ꜥ'], 'y': ['j', 'w', 'ꜣ'], 'ꜥ': ['ꜣ', 'j', 'k'], 'w': ['ꜣ', 'b', 'm'], 'b': ['p', 'w', 'f'], 'p': ['b', 'f', 'q'],
    'f': ['p', 'ḏ', 'b'], 'm': ['w', 'n', 'ꜣ'], 'n': ['š', 'm', 'r'], 'r': ['n', 'h', 'ꜥ'], 'h': ['ḥ', 'ḫ', 'ẖ'], 'ḥ': ['h', 'ḫ', 'ẖ'], 'ḫ': ['ẖ', 'ḥ', 'h'],
    'ẖ': ['ḫ', 'ḥ', 'h'], 'z': ['š', 'ḏ', 'ṯ'], 's': ['š', 'q', 'ṯ'], 'š': ['n', 'h', 'ḫ'], 'q': ['k', 'g', 'ꜣ'], 'k': ['q', 'g', 'ṯ'], 'g': ['k', 'q', 'n'],
    't': ['ṯ', 'd', 'ḏ'], 'ṯ': ['t', 'ḏ', 'š'], 'd': ['ḏ', 't', 'ṯ'], 'ḏ': ['d', 'ṯ', 'f'] };
  function alphaUpTo(n) { var out = []; for (var i = 1; i <= n; i++) out = out.concat(ALPHA_SETS[i]); return out; }

  /* ---------- biliterals and triliterals taught in this course (single-valued signs only) ---------- */
  var BI1 = ['O1', 'Y5', 'G36', 'V30', 'D2', 'W24', 'N16', 'X8', 'O29', 'M23'];
  var BI2 = ['G39', 'D28', 'D4', 'F31', 'U36', 'U1', 'G40', 'F34', 'E34', 'G29', 'N26', 'M12', 'N28', 'G38', 'V4', 'E23', 'G25'];
  var TRI = ['S34', 'F35', 'R4', 'R8', 'L1', 'S38', 'F12', 'Aa11', 'P8', 'S12', 'O28'];

  /* ---------- extra spellings (signs of the model only; Gardiner 1927) ---------- */
  var SP = {
    nfr1: { tl: 'nfr', en: 'good, beautiful', sp: 'F35', parts: [['F35', 'phon', 'nfr']] },
    ankh1: { tl: 'ꜥnḫ', en: 'life; to live', sp: 'S34', parts: [['S34', 'phon', 'ꜥnḫ']] },
    ntr1: { tl: 'nṯr', en: 'god', sp: 'R8', parts: [['R8', 'logo', 'nṯr']] },
    ntr3: { tl: 'nṯr', en: 'god', sp: 'R8-G7', parts: [['R8', 'logo', 'nṯr'], ['G7', 'det', '']] },
    ra1: { tl: 'rꜥ', en: 'sun; Ra', sp: 'N5:Z1', parts: [['N5', 'logo', 'rꜥ'], ['Z1', 'stroke', '']] },
    mn1: { tl: 'mn', en: 'remain, endure', sp: 'Y5', parts: [['Y5', 'phon', 'mn']] },
    wr1: { tl: 'wr', en: 'great', sp: 'G36', parts: [['G36', 'phon', 'wr']] },
    htp1: { tl: 'ḥtp', en: 'offering; peace, be content', sp: 'R4', parts: [['R4', 'phon', 'ḥtp']] },
    kheper1: { tl: 'ḫpr', en: 'come into being, become', sp: 'L1', parts: [['L1', 'phon', 'ḫpr']] },
    amun1: { tl: 'jmn', en: 'Amun', sp: 'M17-Y5:N35', parts: [['M17', 'phon', 'j'], ['Y5', 'phon', 'mn'], ['N35', 'comp', 'n']] },
    ntrw: { tl: 'nṯrw', en: 'gods', sp: 'R8-R8-R8', parts: [['R8', 'logo', 'nṯr'], ['R8', 'logo', ''], ['R8', 'logo', '']], note: 'The word sign written three times shows the plural; the ending -w is not written.' },
    ntrt: { tl: 'nṯrt', en: 'goddess', sp: 'R8:X1-I12', parts: [['R8', 'logo', 'nṯr'], ['X1', 'end', 't'], ['I12', 'det', '']] },
    prw: { tl: 'prw', en: 'houses', sp: 'O1:Z2', parts: [['O1', 'logo', 'pr'], ['Z2', 'det', '']], note: 'The three strokes show the plural; the ending -w is not written.' },
    hmntr: { tl: 'ḥm-nṯr', en: 'servant of the god (a priest)', sp: 'R8-U36', parts: [['R8', 'logo', 'nṯr'], ['U36', 'phon', 'ḥm']], note: 'nṯr "god" is written first out of honor but read last: ḥm-nṯr.' }
  };
  // a noun with a suffix pronoun: noun spelling + the pronoun's sign
  var SUF_SIGN = { j: 'A1', k: 'V31', 'ṯ': 'V13', f: 'I9', s: 'S29' };
  var SUF_NOUNS = [ // [WORDS key or spelling, tl, en]
    ['O1:Z1', 'pr', 'house'], ['D21:N35', 'rn', 'name'], ['F34:Z1', 'jb', 'heart'], ['V30', 'nb', 'lord'], ['D28:Z1', 'kꜣ', 'ka']
  ];
  // two throne names (Gardiner 1927; Wikipedia, "Ancient Egyptian royal titulary"): the sun sign written first out of honor
  var XNAMES = {
    menkheperre: { tl: 'mn-ḫpr-rꜥ', en: 'Menkheperre', king: 'Thutmose III', signs: ['N5', 'Y5', 'N35', 'L1'], sp: 'N5-Y5:N35-L1', mean: 'enduring is the form of Ra' },
    nebkheperure: { tl: 'nb-ḫprw-rꜥ', en: 'Nebkheperure', king: 'Tutankhamun', signs: ['N5', 'L1', 'Z2', 'V30'], sp: 'N5-L1-Z2-V30', mean: 'lord of the forms of Ra' }
  };

  /* ---------- vocabulary for the grammar (transliteration only) ----------
     [tl, gender, English, plural, dual]   plural and dual are built by rule and checked against these in the test */
  var VOC = [
    ['pr', 'm', 'house', 'prw', null], ['rn', 'm', 'name', 'rnw', null], ['zꜣ', 'm', 'son', 'zꜣw', 'zꜣwj'], ['sn', 'm', 'brother', 'snw', 'snwj'],
    ['nb', 'm', 'lord', 'nbw', null], ['nṯr', 'm', 'god', 'nṯrw', 'nṯrwj'], ['ḥqꜣ', 'm', 'ruler', 'ḥqꜣw', null], ['ḥm', 'm', 'servant', 'ḥmw', null],
    ['bꜣk', 'm', 'servant', 'bꜣkw', null], ['sš', 'm', 'scribe', 'sšw', null], ['tꜣ', 'm', 'land', 'tꜣw', 'tꜣwj'], ['ḏw', 'm', 'mountain', 'ḏww', null],
    ['hrw', 'm', 'day', 'hrww', null], ['jt', 'm', 'father', 'jtw', null], ['jb', 'm', 'heart', 'jbw', null], ['ꜥ', 'm', 'arm', null, 'ꜥwj'], ['rd', 'm', 'foot', null, 'rdwj'],
    ['zꜣt', 'f', 'daughter', 'zꜣwt', 'zꜣtj'], ['snt', 'f', 'sister', 'snwt', 'sntj'], ['nbt', 'f', 'lady', 'nbwt', 'nbtj'], ['nṯrt', 'f', 'goddess', 'nṯrwt', 'nṯrtj'],
    ['ḥmt', 'f', 'wife', 'ḥmwt', null], ['mwt', 'f', 'mother', 'mwwt', null], ['njwt', 'f', 'town', 'njwwt', null], ['ḥqꜣt', 'f', 'ruler (a woman)', 'ḥqꜣwt', null],
    ['bꜣkt', 'f', 'maidservant', 'bꜣkwt', null], ['ḫꜣst', 'f', 'foreign land', 'ḫꜣswt', null], ['jrt', 'f', 'eye', null, 'jrtj'], ['drt', 'f', 'hand', null, 'drtj'],
    ['pt', 'f', 'sky', null, null]
  ];
  function voc(tl) { for (var i = 0; i < VOC.length; i++) if (VOC[i][0] === tl) return VOC[i]; return null; }
  function plural(n) { return n[1] === 'm' ? n[0] + 'w' : n[0].slice(0, -1) + 'wt'; }
  function dual(n) { return n[1] === 'm' ? n[0] + 'wj' : n[0] + 'j'; }
  function nounsWith(f) { return VOC.filter(f); }
  // English plurals for the vocabulary
  var EN_PL = { house: 'houses', name: 'names', son: 'sons', brother: 'brothers', lord: 'lords', god: 'gods', ruler: 'rulers', servant: 'servants', scribe: 'scribes', land: 'lands',
    mountain: 'mountains', day: 'days', father: 'fathers', heart: 'hearts', arm: 'arms', foot: 'feet', daughter: 'daughters', sister: 'sisters', lady: 'ladies', goddess: 'goddesses',
    wife: 'wives', mother: 'mothers', town: 'towns', 'ruler (a woman)': 'rulers (women)', maidservant: 'maidservants', 'foreign land': 'foreign lands', eye: 'eyes', hand: 'hands', man: 'men', sky: 'skies' };

  /* ---------- adjectives ---------- */
  var ADJ = [['nfr', 'good'], ['wr', 'great'], ['ꜥꜣ', 'big'], ['bjn', 'bad'], ['nḏs', 'small'], ['wꜥb', 'pure']];
  function agree(adj, g, num) { return adj + (g === 'f' ? (num === 'pl' ? 'wt' : 't') : (num === 'pl' ? 'w' : '')); }

  /* ---------- pronouns ---------- */
  // person key, English subject, English possessive, suffix, dependent, independent
  var PRON = [
    ['1s', 'I', 'my', 'me', 'j', 'wj', 'jnk'],
    ['2sm', 'you (a man)', 'your (a man’s)', 'you (a man)', 'k', 'ṯw', 'ntk'],
    ['2sf', 'you (a woman)', 'your (a woman’s)', 'you (a woman)', 'ṯ', 'ṯn', 'ntṯ'],
    ['3sm', 'he', 'his', 'him', 'f', 'sw', 'ntf'],
    ['3sf', 'she', 'her', 'her', 's', 'sj', 'nts'],
    ['1p', 'we', 'our', 'us', 'n', 'n', 'jnn'],
    ['2p', 'you (plural)', 'your (plural)', 'you (plural)', 'ṯn', 'ṯn', 'ntṯn'],
    ['3p', 'they', 'their', 'them', 'sn', 'sn', 'ntsn']
  ];
  function pron(key) { for (var i = 0; i < PRON.length; i++) if (PRON[i][0] === key) return PRON[i]; return null; }
  // accepted spellings of a dependent pronoun (j or y for the yod of sj; Gardiner writes sỉ)
  function depAcc(d) { return d === 'sj' ? ['sj', 'sy'] : [d]; }


  /* ================================================================ Unit 1: the language and its script */
  // a fact bank problem: items { q, a, w: [wrong pool], s: [steps], h, lv: lowest level }
  function bank(R, ctx, items) {
    var L = lv(ctx), ok = items.filter(function (it) { return (it.lv || 1) <= L; });
    var it = pick(R, ok);
    if (it.tf !== undefined) return { q: it.q, a: { t: 'tf', v: it.tf }, steps: it.s, hint: it.h };
    return { q: it.q, a: mc(it.a, R.shuffle(it.w), it.k || 4), steps: it.s, hint: it.h, viz: it.viz };
  }
  var REL = ['Hebrew', 'Arabic', 'Akkadian', 'Aramaic', 'Amharic', 'Tamazight (a Berber language)', 'Hausa (a Chadic language)', 'Somali (a Cushitic language)'];
  var UNREL = ['Greek', 'Latin', 'Persian', 'Sanskrit', 'Sumerian', 'Hittite', 'Turkish', 'English', 'Chinese'];

  G('me1.what-egyptian', function (R, ctx) {
    var L = lv(ctx);
    var kind = R.int(0, L === 1 ? 2 : 4);
    if (kind === 0) {
      var rel = pick(R, REL), un = sample(R, UNREL, 3);
      return { q: 'Ancient Egyptian belongs to the Afroasiatic family. Which of these languages is in the same family?', a: mc(rel, un),
        steps: [rel + ' is an Afroasiatic language: the family includes Egyptian, the Semitic languages (Hebrew, Arabic, Akkadian, Aramaic, Amharic), Berber, Chadic and Cushitic.',
          'The others belong to other families (Greek, Latin, Persian, Sanskrit, Hittite and English are Indo-European; Sumerian has no known relatives; Turkish is Turkic; Chinese is Sino-Tibetan).'],
        hint: 'Think of the Semitic languages and the languages of North and East Africa.' };
    }
    if (kind === 1) {
      return { q: 'True or false: Ancient Egyptian is an early form of Arabic.', a: { t: 'tf', v: false },
        steps: ['Egyptian is its own branch of the Afroasiatic family. Arabic is a Semitic language, a different branch of the same family: distant cousins, not parent and child.',
          'Arabic came to Egypt with the Arab conquest of the 7th century AD (Alexandria fell in AD 641) and slowly replaced Coptic, the last stage of Egyptian, in daily life.'],
        hint: 'When did Arabic arrive in Egypt?' };
    }
    if (kind === 2) {
      var right = 'more than 4,000 years', w = ['about 1,000 years', 'about 2,000 years', 'about 500 years', 'about 10,000 years'];
      return { q: 'Egyptian was first written around 3200 BC, and its last stage, Coptic, was still written in the Middle Ages. For about how long was Egyptian written?', a: mc(right, R.shuffle(w)),
        steps: ['From about 3200 BC to AD 1 is about 3,200 years; Coptic was written for well over a thousand years after that.', 'So Egyptian has a written history of more than 4,000 years, one of the longest of any language.'],
        hint: 'Add the years before and after AD 1.' };
    }
    if (kind === 3) {
      var br = R.pick([['Semitic', 'a sister branch'], ['Berber', 'a sister branch'], ['Chadic', 'a sister branch'], ['Cushitic', 'a sister branch']]);
      return { q: 'What is the relationship between Egyptian and the ' + br[0] + ' languages?', a: mc('They are separate branches of the same family, Afroasiatic.', R.shuffle(['Egyptian is descended from ' + br[0] + '.', br[0] + ' is descended from Egyptian.', 'They are not related at all.'])),
        steps: ['Egyptian forms its own branch of Afroasiatic. ' + br[0] + ' is ' + br[1] + ', not a parent or a child.', 'Shared features, such as a feminine ending -t, point back to a common ancestor much older than the first writing.'],
        hint: 'A family tree has branches, not just a line.' };
    }
    return bank(R, ctx, [
      { q: 'Which language did Egyptian become in its last stage, still used in the worship of the Coptic Church?', a: 'Coptic', w: ['Demotic', 'Arabic', 'Greek', 'Hieratic'], s: ['Coptic is the last stage of Egyptian, written in an alphabet made from Greek letters plus several taken from Demotic.', 'It gave way to Arabic in daily life during the Middle Ages but is still used in church services.'], h: 'It is written in an alphabet.' },
      { q: 'Which feature does Egyptian share with the Semitic languages, a sign of their common Afroasiatic ancestry?', a: 'a feminine ending in -t', w: ['an alphabet of vowels', 'nouns with six cases', 'tones that change meaning', 'articles like "the" from the start'], s: ['Egyptian marks feminine nouns with -t (zꜣ "son", zꜣt "daughter"), as Semitic languages do.', 'Shared grammar like this, not borrowed words, is how linguists recognize related languages.'], h: 'Compare zꜣ "son" and zꜣt "daughter".' }
    ]);
  });

  G('me1.stages', function (R, ctx) {
    var E = EG(), L = lv(ctx), S = E.LANG_STAGES;
    var kind = R.int(0, L === 1 ? 1 : 3);
    if (kind === 0) { // order of stages
      var right = S.map(function (s) { return s.name; }).join(' → ');
      var wr = [], seen = {}; seen[right] = 1;
      while (wr.length < 3) { var o = R.shuffle(S.map(function (s) { return s.name; })).join(' → '); if (!seen[o]) { seen[o] = 1; wr.push(o); } }
      return { q: 'Put the stages of Egyptian in order, earliest first.', a: mc(right, wr),
        steps: S.map(function (s) { return s.name + ': ' + E.span(s.from, s.to, true) + ', ' + s.note + '.'; }), hint: 'Coptic is the last; "Middle" is in the middle.' };
    }
    if (kind === 1) { // "Middle" means time
      return { q: 'What does "Middle" mean in "Middle Egyptian"?', a: mc('the middle stage of the language in time', R.shuffle(['the language of Middle Egypt, the region between the Delta and Thebes', 'a language spoken by the middle classes', 'a mixture of Old and Late Egyptian', 'the language of the Middle East'])),
        steps: ['Egyptologists divide Egyptian into stages in time: Old, Middle and Late Egyptian, then Demotic and Coptic.', 'Middle Egyptian is the middle stage (c. 2000–1350 BC), not the dialect of the region called Middle Egypt.'], hint: 'Old, Middle, Late…' };
    }
    if (kind === 2) { // which stage at a date
      var YR = { old: -2300, middle: -1900, late: -1100, demotic: -200 };
      var s = pick(R, S.filter(function (x) { return YR[x.key]; })), yr = E.year(YR[s.key], true);
      return { q: 'A scribe writes an everyday letter around ' + yr + '. Which stage of Egyptian is his everyday language?', a: mc(s.name, R.shuffle(S.filter(function (x) { return x !== s; }).map(function (x) { return x.name; }))),
        steps: [s.name + ' runs from ' + E.span(s.from, s.to, true) + ': ' + s.note + '.', 'The dates are approximate, and formal inscriptions kept the classical language (Middle Egyptian) long after it stopped being spoken.'], hint: 'Look at the time axis of the stages.' };
    }
    var st = pick(R, [['coptic', 'Which stage of Egyptian was written in an alphabet based on Greek letters?'], ['demotic', 'Which stage shares its name with the script used to write it, the middle text of the Rosetta Stone?'], ['late', 'Which stage was the everyday language of the New Kingdom, after about 1350 BC?'], ['old', 'Which stage is the language of the Pyramid Texts?']]);
    var me = S.filter(function (x) { return x.key === st[0]; })[0];
    return { q: st[1], a: mc(me.name, R.shuffle(S.filter(function (x) { return x !== me; }).map(function (x) { return x.name; }))),
      steps: [me.name + ' (' + E.span(me.from, me.to, true) + '): ' + me.note + '.'], hint: 'Five stages: Old, Middle, Late, Demotic, Coptic.' };
  });

  G('me1.classical', function (R, ctx) {
    var L = lv(ctx);
    var items = [
      { q: 'In which period was Middle Egyptian the spoken language?', a: 'the Middle Kingdom (c. 2055–1650 BC)', w: ['the Old Kingdom (c. 2686–2160 BC)', 'the Ptolemaic Period (332–30 BC)', 'the Roman Period (30 BC–AD 395)'], s: ['Middle Egyptian was the spoken language of the Middle Kingdom.', 'It then stayed in use as the written, classical language.'], h: 'The name gives it away.' },
      { q: 'A temple wall carved in the Roman Period (after 30 BC) has a hieroglyphic hymn. Which language is it most likely in?', a: 'a late form of Middle Egyptian', w: ['Coptic', 'Demotic', 'Latin'], s: ['Formal hieroglyphic texts kept the classical language, Middle Egyptian, for two thousand years after it stopped being spoken.', 'Temples of Ptolemaic and Roman date (Edfu, Dendera, Philae) use a late form of it, with many new signs and spellings.'], h: 'Hieroglyphic monuments kept the classical language.', lv: 2 },
      { tf: true, q: 'True or false: the stories of Sinuhe and the Eloquent Peasant are written in Middle Egyptian.', s: ['Both are classics of Middle Kingdom literature, copied by students for centuries.', 'That is one reason grammars teach Middle Egyptian first.'], h: 'They are Middle Kingdom works.' },
      { q: 'Why do most grammars, like Gardiner’s, teach Middle Egyptian first?', a: 'It was the classical written language, used on monuments for two thousand years and in the great literature.', w: ['It is the oldest stage of Egyptian.', 'It is the stage closest to Coptic.', 'It was written without hieroglyphs.'], s: ['Middle Egyptian is the language of the Middle Kingdom’s literature and of formal inscriptions down to Roman times.', 'Learn it, and you can read most hieroglyphic monuments, with adjustments for older and later texts.'], h: 'Think of Latin in medieval Europe.' },
      { q: 'Late Egyptian was the everyday language of the New Kingdom. What did royal monuments of that time mostly use?', a: 'Middle Egyptian, sometimes with Late Egyptian features', w: ['Coptic', 'Greek', 'Demotic'], s: ['Formal inscriptions held on to the classical language.', 'Some New Kingdom inscriptions mix in features of the spoken Late Egyptian.'], h: 'Formal writing changes slowly.', lv: 2 },
      { q: 'The last dated hieroglyphic inscription was carved at Philae in AD 394. About how long after the Middle Kingdom ended (c. 1650 BC) is that?', a: 'about 2,000 years', w: ['about 500 years', 'about 1,000 years', 'about 4,000 years'], s: ['From 1650 BC to AD 1 is 1,650 years; add 394: about 2,044 years.', 'So the classical language was carved for about two thousand years after the Middle Kingdom.'], h: 'Count the years BC, then add the years AD.', lv: 2 }
    ];
    return bank(R, ctx, items);
  });

  // a role in a word: 'phon' and 'comp' write sounds, 'logo' a whole word, 'det' is not read
  var ROLE3 = { phon: 'a sound sign (phonogram)', comp: 'a sound sign (phonogram)', end: 'a sound sign (phonogram)', logo: 'a word sign (logogram)', det: 'a determinative (not read)' };
  var KIND_WORDS = ['nfr', 'ankh', 'netjer', 'ra', 'per', 'za', 'zat', 'pet', 'heru', 'ib', 'niwt', 'heqa', 'wer', 'zi', 'sedjem', 'maat', 'amun', 'ptah', 'isis', 'anubis', 'geb', 'remetj', 'kheper'];
  G('me1.sign-kinds', function (R, ctx) {
    var E = EG(), L = lv(ctx);
    var key = pick(R, KIND_WORDS), w = W(key), idx = [];
    w.parts.forEach(function (p, i) { if (ROLE3[p[1]] && (L > 1 || p[1] !== 'comp')) idx.push(i); });
    var i = pick(R, idx), p = w.parts[i], c = p[0], role = ROLE3[p[1]];
    var opts = ['a sound sign (phonogram)', 'a word sign (logogram)', 'a determinative (not read)'];
    var why = p[1] === 'det' ? 'It is not read: it shows the word’s class of meaning (' + DETCLASS[c] + ') and marks the end of the word.'
      : p[1] === 'logo' ? 'It writes the whole word ' + T(p[2]) + ' by its picture.'
      : 'It writes the sound ' + T(p[2]) + (p[1] === 'comp' ? ' (a phonetic complement, repeating a sound of the sign before it).' : '.');
    return { q: 'In ' + T(w.tl) + ' ' + Q(w.en) + ', what is the sign marked with the dashed box (' + sg(c, 1.4) + ', ' + nameOf(c) + ')?', viz: glyphs({ word: key, ask: i }),
      a: mc(role, opts.filter(function (o) { return o !== role; }), 3),
      steps: ['The word ' + T(w.tl) + ' is spelled ' + w.parts.map(function (q) { return sgs([q[0]], 1.2) + (q[2] ? ' ' + T(q[2]) : ' (silent)'); }).join(' + ') + '.', 'The marked sign is the ' + nameOf(c) + '. ' + why],
      hint: 'Does the sign stand for sounds, for the whole word, or for neither?' };
  });

  var DIR_WORDS = ['ankh', 'remetj', 'heqa', 'anubis', 'zat', 'sedjem', 'geb', 'wer', 'zi', 'kheper', 'it', 'amun', 'netjer'];
  G('me1.direction', function (R, ctx) {
    var L = lv(ctx), key = pick(R, DIR_WORDS), w = W(key);
    var kind = R.int(0, L === 1 ? 0 : 2);
    if (kind < 2) {
      var dir = R.pick(['ltr', 'rtl']), right = dir === 'rtl' ? 'right to left' : 'left to right';
      return { q: 'In which direction do you read these signs? Look at the way the people, animals and birds face.', viz: glyphs({ word: key, dir: dir }),
        a: mc(right, [dir === 'rtl' ? 'left to right' : 'right to left', 'top to bottom only', 'either way: direction does not matter']),
        steps: ['Signs of people, animals and birds face the beginning of the line.', 'Here they face ' + (dir === 'rtl' ? 'right' : 'left') + ', so the line begins at the ' + (dir === 'rtl' ? 'right' : 'left') + ': read ' + right + '.', 'The word is ' + T(w.tl) + ' ' + Q(w.en) + '.'],
        hint: 'Read toward the faces.' };
    }
    var d2 = R.pick(['rtl', 'ltr']), first = d2 === 'rtl' ? 'rightmost' : 'leftmost';
    return { q: 'This word is carved facing ' + (d2 === 'rtl' ? 'right' : 'left') + '. Which sign do you read first?', viz: glyphs({ word: key, dir: d2 }),
      a: mc('the ' + first + ' sign', ['the ' + (d2 === 'rtl' ? 'leftmost' : 'rightmost') + ' sign', 'the tallest sign', 'the determinative']),
      steps: ['The signs face the start of the line, which is on the ' + (d2 === 'rtl' ? 'right' : 'left') + '.', 'So the ' + first + ' sign comes first, and the determinative (if any) comes last, at the far end.'],
      hint: 'The faces look toward the beginning.' };
  });

  // words whose spelling has a stack (top over bottom) or side-by-side group
  var QUAD_WORDS = ['ra', 'ren', 'nebet', 'pet', 'heru', 'niwt', 'heqa', 'hetep', 'djed', 'menu', 'amun', 'ptah', 'isis', 'anubis', 'jwnw', 'ankh', 'nfr', 'weser', 'maat', 'remetj'];
  G('me1.quadrats', function (R, ctx) {
    var E = EG(), L = lv(ctx), key = pick(R, QUAD_WORDS), w = W(key), codes = E.codes(w.sp), n = codes.length;
    var groups = w.sp.split('-');
    // pick a sign that is inside a stacked or side-by-side group when we can
    var cand = [], pos = 0;
    groups.forEach(function (g) { var cs = E.codes(g); cs.forEach(function (c, j) { if (cs.length > 1) cand.push(pos + j); }); pos += cs.length; });
    var i = cand.length ? pick(R, cand) : R.int(0, n - 1);
    if (L === 1 || R.coin()) {
      return { q: 'Signs in a group are read top before bottom and front before back. Counting from 1, where in the reading order is the marked sign?', viz: glyphs({ word: key, ask: i }),
        a: { t: 'num', v: String(i + 1) },
        steps: ['Read group by group from the front (the side the signs face). Inside a group, read the top sign before the bottom one.', 'The reading order is ' + codes.map(function (c, j) { return (j + 1) + ' ' + sgs([c], 1.1); }).join(', ') + '.', 'The marked sign is number ' + (i + 1) + '; the word is ' + T(w.tl) + ' ' + Q(w.en) + '.'],
        hint: 'Top before bottom inside a group.' };
    }
    // which transliteration matches the reading order
    var tl = w.tl, ls = letters(tl), wrongs = [];
    if (ls.length > 1) { var sw = ls.slice(); var a0 = R.int(0, ls.length - 2); var t0 = sw[a0]; sw[a0] = sw[a0 + 1]; sw[a0 + 1] = t0; wrongs.push(sw.join('')); wrongs.push(ls.slice().reverse().join('')); }
    var phon = w.parts.filter(function (p) { return p[1] !== 'det' && p[1] !== 'stroke'; }).map(function (p) { return p[2]; }).join('');
    wrongs.push(phon);
    var right = E.show(tl);
    var wr = wrongs.map(function (x) { return E.show(x); }).filter(function (x) { return E.norm(x) !== E.norm(tl); });
    return { q: 'Read the groups in order (top before bottom, ignoring any determinative). What is this word?', viz: glyphs({ word: key }),
      a: mc('<i class="eg-tl">' + right + '</i>', wr.map(function (x) { return '<i class="eg-tl">' + x + '</i>'; }).concat(['<i class="eg-tl">' + E.show(ls.slice(1).concat(ls[0]).join('')) + '</i>'])),
      steps: ['The signs in reading order: ' + w.parts.map(function (p) { return sgs([p[0]], 1.1) + (p[2] ? ' ' + T(p[2]) : ' (not read)'); }).join(', ') + '.', 'Phonetic complements repeat sounds already written, so they are not read twice.', 'The word is ' + T(tl) + ' ' + Q(w.en) + '.'],
      hint: 'Top sign first in each stack.' };
  });

  G('me1.consonants', function (R, ctx) {
    var E = EG(), L = lv(ctx), kind = R.int(0, L === 1 ? 1 : 3);
    if (kind === 0) {
      var key = pick(R, ['nfr', 'ankh', 'hetep', 'ren', 'djed', 'heqa', 'kheper', 'sedjem', 'weser', 'remetj', 'ptah', 'anubis', 'maat']), w = W(key), n = letters(w.tl).length;
      return { q: 'How many consonants does the word ' + T(w.tl) + ' ' + Q(w.en) + ' have?', viz: glyphs({ word: key }), a: { t: 'num', v: String(n) },
        steps: ['Every letter of a transliteration is a consonant: ' + letters(w.tl).map(function (x) { return T(x); }).join(' + ') + '.', 'That makes ' + n + '. The vowels were never written, so the transliteration has none (' + T('ꜣ') + ', ' + T('j') + ', ' + T('ꜥ') + ' and ' + T('w') + ' are consonants too).'],
        hint: 'Count the letters of the transliteration.' };
    }
    if (kind === 1) {
      var d = pick(R, E.DESCENT);
      return { q: 'Egyptologists say ' + T(d.tl) + ' ' + Q(d.en) + ' as "' + sayIt(d.tl) + '". Where does the "e" come from?', a: mc('It is a modern convention: the vowels were not written.', R.shuffle(['It is written by one of the signs.', 'It comes from the Greek alphabet.', 'It is how the word sounded in every period.'])),
        steps: ['Hieroglyphs write only consonants. Egyptologists add an "e" (and say ꜣ and ꜥ as "a") so the words can be spoken.', 'Clues to the real vowels come from Coptic, which wrote vowels: ' + T(d.tl) + ' became <span class="eg-cop">' + d.cop + '</span> (' + d.say + ').'],
        hint: 'Which letters do hieroglyphs write?' };
    }
    if (kind === 2) {
      var d2 = pick(R, E.DESCENT);
      return { q: 'The Coptic form of ' + T(d2.tl) + ' ' + Q(d2.en) + ' is <span class="eg-cop">' + d2.cop + '</span> (' + d2.say + '). What does Coptic tell us that the hieroglyphs do not?', a: mc('the vowels of a late form of the word', R.shuffle(['the consonants, which hieroglyphs leave out', 'the meaning, which hieroglyphs do not show', 'how the word sounded 4,000 years earlier'])),
        steps: ['Coptic, written in an alphabet from Greek, writes vowels as well as consonants.', 'So it shows the vowels of the word in its last stage. Earlier vowels can only be partly reconstructed.'], hint: 'Coptic is an alphabet with vowels.' };
    }
    return bank(R, ctx, [
      { tf: false, q: 'True or false: "nefer" is how the ancient Egyptians pronounced nfr.', s: ['"Nefer" is a modern convention for saying the consonants nfr aloud.', 'The Coptic descendant of the word is ⲛⲟⲩϥⲉ (noufe), which suggests very different vowels.'], h: 'Were the vowels written?' },
      { q: 'Besides Coptic, which source gives clues to how Egyptian words were pronounced?', a: 'Egyptian names written in Greek or Akkadian (cuneiform) letters', w: ['the shapes of the hieroglyphs', 'the order of the alphabet', 'the colors of painted signs'], s: ['Foreign scribes wrote Egyptian names and words in their own scripts, which show vowels.', 'Greek writers, for example, wrote Egyptian royal names with vowels; cuneiform letters from Amarna do the same.'], h: 'Other peoples wrote Egyptian names in their scripts.' }
    ]);
  });


  /* ================================================================ Unit 2: the alphabet and transliteration */
  // words spelled with one-consonant signs only (plus determinatives), by the alphabet lesson that completes them
  var UNI_WORDS = { 2: ['anubis'], 3: ['ren', 'heru'], 4: ['zi'], 5: ['pet', 'djed', 'ptah', 'remetj'] };
  function uniWordsUpTo(n) { var out = []; for (var i = 2; i <= n; i++) out = out.concat(UNI_WORDS[i] || []); return out; }
  function alphaGen(set) {
    return function (R, ctx) {
      var E = EG(), L = lv(ctx), mine = ALPHA_SETS[set], all = alphaUpTo(set);
      var pool = L === 1 ? mine : L === 2 ? (R.chance(0.7) ? mine : all) : all;
      var kind = L === 1 ? R.int(0, 2) : R.int(0, 4);
      var e = pick(R, pool), c = e[0], l = e[1];
      var note = l === 'z' ? ' By the Middle Kingdom z and s had become one sound, so older books write s for both (this course accepts either).' : l === 'y' ? ' It can also be written with two oblique strokes ' + sg('Z4', 1.2) + '.' : (l === 'ꜣ' || l === 'ꜥ') ? ' It is a consonant, not the vowel a.' : '';
      if (kind === 0) {
        return { q: 'Which sound does this sign write? Type its transliteration.', viz: glyphs({ sp: c, parts: [[c, 'phon', l]] }), a: tla(l),
          steps: ['The sign is the ' + nameOf(c) + ' (Gardiner ' + c + ').', 'It writes ' + T(l) + ' (typed ' + mdc(l) + ').' + note], hint: 'What does the picture show? Its sound is one consonant.' };
      }
      if (kind === 1) {
        var same = function (x) { return EG().norm(vals(x)[0]) === EG().norm(l); };
        var others = (NEAR[l] || []).map(function (x) { return EG().signFor(x); }).filter(function (x) { return x && x !== c && !same(x); });
        var extra = R.shuffle(all.map(function (x) { return x[0]; }).filter(function (x) { return x !== c && others.indexOf(x) < 0 && !same(x); }));
        var sp1 = signPick(R, c, others.concat(extra));
        return { q: 'Which of the numbered signs writes the sound ' + T(l) + '?', viz: sp1.viz, a: sp1.a,
          steps: [T(l) + ' is written with the ' + nameOf(c) + ' ' + sg(c, 1.3) + ' (' + c + ').' + note], hint: 'Picture the sign that stands for ' + EG().show(l) + '.' };
      }
      if (kind === 2) {
        var wr = (NEAR[l] || []).slice();
        var alts = wr.concat(R.shuffle(all.map(function (x) { return x[1]; }))).filter(function (x) { return EG().norm(x) !== EG().norm(l); });
        return { q: 'The ' + nameOf(c) + ' ' + sg(c, 1.3) + ' writes which sound?', a: mc(T(l), alts.map(function (x) { return T(x); })),
          steps: ['The ' + nameOf(c) + ' (' + c + ') writes ' + T(l) + '.' + note], hint: 'One consonant.' };
      }
      var words = uniWordsUpTo(set);
      if (kind === 3 && words.length) {
        var key = pick(R, words), w = W(key);
        return { q: 'This word is spelled with one-consonant signs and ends with a determinative, which is not read. Type its transliteration.', viz: glyphs({ word: key }), a: tla(w.tl),
          steps: w.parts.map(function (p) { return sgs([p[0]], 1.2) + ' ' + (p[1] === 'det' ? 'is the determinative (not read)' : p[1] === 'stroke' ? 'is a stroke (not read)' : 'writes ' + T(p[2])); }).concat(['So the word is ' + T(w.tl) + ' ' + Q(w.en) + '.']),
          hint: 'Read each sign as one consonant; skip the last, silent sign.' };
      }
      // a row of two or three signs: read them in order
      var n = L === 3 ? 3 : 2, row = [], seen = {};
      while (row.length < n) { var x = pick(R, R.chance(0.6) ? mine : all); if (!seen[x[0]]) { seen[x[0]] = 1; row.push(x); } }
      var tl = row.map(function (x) { return x[1]; }).join('');
      return { q: 'These signs are a reading drill, not a word. Type their sounds in order, from left to right.', viz: glyphs({ sp: row.map(function (x) { return x[0]; }).join('-'), parts: row.map(function (x) { return [x[0], 'phon', x[1]]; }) }), a: tla(tl),
        steps: row.map(function (x) { return sg(x[0], 1.2) + ' (' + nameOf(x[0]) + ') writes ' + T(x[1]); }).concat(['Together: ' + T(tl) + '.']), hint: 'One consonant for each sign.' };
    };
  }
  G('me1.alpha-1', alphaGen(1));
  G('me1.alpha-2', alphaGen(2));
  G('me1.alpha-3', alphaGen(3));
  G('me1.alpha-4', alphaGen(4));
  G('me1.alpha-5', alphaGen(5));

  // dictionary order
  function orderKey(tl) { var O = EG().ALPHA.map(function (a) { return a[0]; }); return letters(tl).map(function (c) { var i = O.indexOf(c); return String.fromCharCode(65 + (i < 0 ? 40 : i)); }).join(''); }
  var DICT = ['ꜣḫ', 'ꜣst', 'jb', 'jmn', 'jnpw', 'jt', 'jwnw', 'ꜥnḫ', 'ꜥꜣ', 'wr', 'wsr', 'wsjr', 'bꜣ', 'bꜣk', 'pr', 'pt', 'ptḥ', 'mꜣꜥt', 'mw', 'mn', 'mwt', 'nb', 'nbw', 'nfr', 'nṯr', 'njwt', 'nsw', 'rn', 'rꜥ', 'rmṯ', 'hrw', 'ḥm', 'ḥqꜣ', 'ḥtp', 'ḥr', 'ḫpr', 'ḫꜣst', 'ḫrw', 'ẖrj', 'zꜣ', 'zꜣt', 'sn', 'snt', 'sḏm', 'sš', 'šmw', 'qd', 'kꜣ', 'gb', 'tꜣ', 'ṯꜣtj', 'dj', 'ḏw', 'ḏd', 'ḏḥwtj'];
  G('me1.translit', function (R, ctx) {
    var E = EG(), L = lv(ctx), O = E.ALPHA.map(function (a) { return a[0]; }), kind = R.int(0, L === 1 ? 1 : 2);
    if (kind === 0) {
      var i = R.int(0, O.length - 2), l = O[i], nx = O[i + 1];
      var w = [O[(i + 2) % O.length], O[(i + O.length - 1) % O.length]].concat(NEAR[nx] || []).filter(function (x) { return E.norm(x) !== E.norm(nx); });
      return { q: 'In the Egyptological alphabet (dictionary order), which letter comes right after ' + T(l) + '?', a: mc(T(nx), w.map(function (x) { return T(x); })),
        steps: ['The order is ' + O.map(function (x) { return T(x); }).join(' ') + '.', 'After ' + T(l) + ' comes ' + T(nx) + '.'], hint: 'ꜣ j y ꜥ w b p f m n r h ḥ ḫ ẖ z s š q k g t ṯ d ḏ' };
    }
    if (kind === 1) {
      var ws = [], tries = 0;
      while (ws.length < 4 && tries++ < 50) { var x = pick(R, DICT); if (ws.indexOf(x) < 0 && ws.every(function (y) { return letters(y)[0] !== letters(x)[0] || L > 1; })) ws.push(x); }
      var sorted = ws.slice().sort(function (a, b) { return orderKey(a) < orderKey(b) ? -1 : 1; });
      return { q: 'Which of these words comes first in an Egyptian dictionary?', a: mc(T(sorted[0]), sorted.slice(1).map(function (x) { return T(x); })),
        steps: ['Compare first letters in the order ꜣ j y ꜥ w b p f m n r h ḥ ḫ ẖ z s š q k g t ṯ d ḏ (and the next letters when the first ones match).', 'In order: ' + sorted.map(function (x) { return T(x); }).join(', ') + '. So ' + T(sorted[0]) + ' comes first.'], hint: 'ꜣ is the first letter of the alphabet; ḏ is the last.' };
    }
    var ws2 = sample(R, DICT, 3), right = ws2.slice().sort(function (a, b) { return orderKey(a) < orderKey(b) ? -1 : 1; });
    var eng = ws2.slice().sort(function (a, b) { var A = E.mdc(a).toLowerCase(), B = E.mdc(b).toLowerCase(); return A < B ? -1 : A > B ? 1 : 0; });
    function seq(a) { return a.map(function (x) { return T(x); }).join(', '); }
    var wr = [seq(eng), seq(right.slice().reverse()), seq([right[1], right[0], right[2]]), seq([right[0], right[2], right[1]])];
    return { q: 'Put these words in Egyptian dictionary order: ' + seq(ws2) + '.', a: mc(seq(right), wr),
      steps: ['Use the order ꜣ j y ꜥ w b p f m n r h ḥ ḫ ẖ z s š q k g t ṯ d ḏ, letter by letter.', 'Result: ' + seq(right) + '.', 'English alphabetical order would be different: ḥ, ḫ and ẖ come after h; ꜣ and ꜥ are not a.'], hint: 'Compare letter by letter.' };
  });

  // MdC typing
  var MDC_WORDS = ['ḥtp', 'nṯr', 'ꜥnḫ', 'ḫpr', 'sḏm', 'ḏd', 'mꜣꜥt', 'ḥqꜣ', 'ꜣḫ', 'ḏw', 'rmṯ', 'ḏḥwtj', 'ꜣst', 'ḫꜣst', 'šmw', 'ẖrj', 'ṯꜣtj', 'ḥm-nṯr', 'ḥtp-dj-nsw', 'zꜣ-rꜥ', 'pr-ꜥꜣ', 'nsw-bjt', 'ḥr', 'jmj-rꜣ', 'mꜣꜥ-ḫrw', 'sš'];
  G('me1.mdc', function (R, ctx) {
    var E = EG(), L = lv(ctx), kind = R.int(0, L === 1 ? 1 : 2);
    var tl = pick(R, MDC_WORDS), m = E.mdc(tl);
    if (kind === 0) {
      var low = m.replace(/[HXSTDA]/g, function (c) { return c === 'A' ? 'a' : c.toLowerCase(); });
      var sw = m.replace(/[xXaA]/g, function (c) { return { x: 'X', X: 'x', a: 'A', A: 'a' }[c]; });
      var up = m.replace(/[hxsdt]/g, function (c) { return c.toUpperCase(); });
      var near1 = m.replace(/[HxXSTDAa]/, function (c) { return { H: 'x', x: 'X', X: 'H', S: 's', T: 't', D: 'd', A: 'a', a: 'A' }[c]; });
      var allUp = m.toUpperCase();
      return { q: 'How do you type ' + T(tl) + ' in the Manuel de Codage?', a: mc('<code>' + esc(m) + '</code>', [low, sw, up, near1, allUp].filter(function (x) { return x !== m; }).map(function (x) { return '<code>' + esc(x) + '</code>'; })),
        steps: ['In MdC, ꜣ is A, ꜥ is a, j is i, ḥ is H, ḫ is x, ẖ is X, š is S, ṯ is T and ḏ is D; the other letters are typed as they are.', T(tl) + ' is typed <code>' + esc(m) + '</code>.'], hint: 'Capitals mean something in MdC.' };
    }
    if (kind === 1) {
      var A = E.ALPHA.filter(function (r) { return r[0] !== r[1]; }), r = pick(R, A);
      return { q: 'Which transliteration letter does the MdC key <code>' + esc(r[1]) + '</code> stand for?', a: mc(T(r[0]), (NEAR[r[0]] || []).concat(A.map(function (x) { return x[0]; })).filter(function (x) { return x !== r[0]; }).map(function (x) { return T(x); })),
        steps: ['MdC <code>' + esc(r[1]) + '</code> = ' + T(r[0]) + ' (written with the ' + nameOf(r[2]) + ', ' + r[2] + ').'], hint: 'A ꜣ, i j, a ꜥ, H ḥ, x ḫ, X ẖ, S š, T ṯ, D ḏ' };
    }
    // read an MdC string
    var ls = letters(tl), wrongs = [];
    var bare = tl.replace(/ḥ/g, 'h').replace(/ḫ/g, 'h').replace(/ẖ/g, 'h').replace(/ṯ/g, 't').replace(/ḏ/g, 'd').replace(/š/g, 's');
    var swp = tl.replace(/[ꜣꜥ]/g, function (c) { return c === 'ꜣ' ? 'ꜥ' : 'ꜣ'; });
    var hh = tl.replace(/ḥ/g, 'ḫ').replace(/ḏ/g, 'ṯ').replace(/š/g, 'z');
    [bare, swp, hh].forEach(function (x) { if (E.norm(x) !== E.norm(tl)) wrongs.push(x); });
    wrongs.push(tl.replace(/[a-zꜣꜥḥḫẖšṯḏ]/, function (c) { return { 'ḥ': 'ẖ', 'ẖ': 'ḥ', 'ḫ': 'ḥ', 'ṯ': 't', 'ḏ': 'd', 'š': 's', 'ꜣ': 'ꜥ', 'ꜥ': 'ꜣ' }[c] || (c === 'n' ? 'm' : 'n'); }));
    return { q: 'A colleague typed <code>' + esc(m) + '</code> in MdC. Which transliteration is it?', a: mc(T(tl), wrongs.map(function (x) { return T(x); })),
      steps: letters(tl).map(function (c) { return '<code>' + esc(E.mdc(c)) + '</code> → ' + T(c); }).concat(['So it is ' + T(tl) + '.']), hint: 'Read each key: capitals are the dotted and underlined letters.' };
  });

  // saying words aloud
  var SAY_WORDS = ['nfr', 'ḥtp', 'nṯr', 'ḫpr', 'sḏm', 'ḏd', 'rn', 'pr', 'nb', 'nbt', 'mn', 'wr', 'wsr', 'ḥqꜣ', 'rmṯ', 'njwt', 'zꜣ', 'ḫꜣst', 'jnpw', 'mw', 'ḏw', 'tꜣ', 'hrw', 'zꜣt', 'jb', 'nbw', 'sš', 'sn', 'snt', 'kꜣ', 'bꜣ', 'ꜥnḫ', 'jmn'];
  G('me1.vocalization', function (R, ctx) {
    var E = EG(), L = lv(ctx), kind = R.int(0, L === 1 ? 0 : 2);
    if (kind === 0 || kind === 1) {
      var tl = pick(R, SAY_WORDS), s = sayIt(tl), wr = [];
      wr.push(s.replace(/e/g, 'a')); wr.push(s.replace(/e/g, 'o')); wr.push(E.show(tl).replace(/[ꜣꜥ]/g, '').replace(/ḫ|ẖ/g, 'kh').replace(/ḥ/g, 'h').replace(/ṯ/g, 'tj').replace(/ḏ/g, 'dj').replace(/š/g, 'sh'));
      wr = wr.concat(R.shuffle(SAY_WORDS).map(sayIt));
      var trad = ['ꜥnḫ', 'jmn'].indexOf(tl) >= 0;
      return { q: 'By the Egyptologists’ convention, how is ' + T(tl) + ' said aloud?', a: mc(s, wr.filter(function (x) { return x !== s; })),
        steps: ['The convention: ꜣ and ꜥ are said "a", j is "i", w is "u" between consonants, and an "e" goes between other consonants; ḫ and ẖ are "kh", š "sh", ṯ "tj", ḏ "dj".', T(tl) + ' is said "' + s + '".' + (trad ? ' (A few famous words keep a traditional form, such as ankh, Amun and Ra.)' : ''), 'It is a way to speak about the word, not the ancient pronunciation.'],
        hint: 'Put an e between consonants.' };
    }
    var k2 = pick(R, [['ꜣ and ꜥ', 'a'], ['j', 'i'], ['w between consonants', 'u']]);
    return bank(R, ctx, [
      { q: 'In the convention for saying words aloud, how is ' + k2[0] + ' said?', a: '"' + k2[1] + '"', w: ['"a"', '"i"', '"u"', '"e"', 'not said at all'].filter(function (x) { return x !== '"' + k2[1] + '"'; }), s: ['ꜣ and ꜥ are said "a", j is "i", w is "u" between consonants; "e" fills the other gaps.'], h: 'These are the weak consonants.' },
      { tf: false, q: 'True or false: the convention of saying nfr as "nefer" records how the word sounded in ancient Egypt.', s: ['The vowels of Egyptian were not written. The "e" is a modern convention for talking about words.', 'Coptic and foreign writings of Egyptian names give some clues to the real vowels, and they differ from the convention.'], h: 'Were vowels written?' },
      { q: 'Why do Egyptologists put an "e" between consonants when they say words aloud?', a: 'to make the consonant skeleton pronounceable; the real vowels are mostly unknown', w: ['because Egyptian had only the vowel e', 'because the e is written with the reed sign', 'because Greek writers spelled Egyptian words that way'], s: ['Hieroglyphs write consonants only, so a word like nfr has no vowels to say.', 'The "e" is a placeholder that lets people talk about words. It is not a reconstruction.'], h: 'What do the hieroglyphs leave out?' }
    ]);
  });


  /* ================================================================ Unit 3: two- and three-consonant signs */
  function getW(k) { return EG().WORDS[k] || SP[k]; }
  function wv(k, o) { var w = getW(k), x = EG().WORDS[k] ? { word: k } : { sp: w.sp, parts: w.parts, tl: w.tl, en: w.en }; for (var j in (o || {})) x[j] = o[j]; return glyphs(x); }
  var KIND_N = { uni: 'one consonant', bi: 'two consonants', tri: 'three consonants' };
  // words that use a given sign as a sound or word sign
  function wordsWith(c) { var out = []; var Wd = EG().WORDS; for (var k in Wd) if (Wd[k].parts.some(function (p) { return p[0] === c && p[1] !== 'det'; }) && !/htpdinsw|nesubit|nesu|isis|it$/.test(k)) out.push(k); return out; }
  function multiGen(pool, kindName, kindWord) {
    return function (R, ctx) {
      var E = EG(), L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 3);
      var c = pick(R, pool), v = vals(c)[0];
      if (kind === 0) {
        return { q: 'This is a ' + kindName + ' sign. Which consonants does it write? Type its transliteration.', viz: glyphs({ sp: c, parts: [[c, 'phon', v]] }), a: tla(v),
          steps: ['The sign shows the ' + nameOf(c) + ' (Gardiner ' + c + ').', 'It writes the ' + kindWord + ' ' + T(v) + ', in that order (typed ' + mdc(v) + ').'], hint: 'Think of a common word written with it.' };
      }
      if (kind === 1) {
        var others = R.shuffle(pool.filter(function (x) { return x !== c; }));
        var sp1 = signPick(R, c, others);
        return { q: 'Which of the numbered signs writes ' + T(v) + '?', viz: sp1.viz, a: sp1.a,
          steps: [T(v) + ' is written with the ' + nameOf(c) + ' ' + sg(c, 1.3) + ' (' + c + ').', 'The others: ' + others.slice(0, 3).map(function (x) { return sg(x, 1.2) + ' ' + T(vals(x)[0]); }).join(', ') + '.'], hint: 'Picture the sign.' };
      }
      if (kind === 2) {
        var mix = [pick(R, E.signsOf('uni').filter(function (x) { return vals(x).length === 1 && x !== 'Aa15' && x !== 'Z7'; })), pick(R, BI1.concat(BI2)), pick(R, TRI)];
        var cc = pick(R, mix), k = E.SIGNS[cc].k;
        return { q: 'How many consonants does this sign write?', viz: glyphs({ sp: cc, parts: [[cc, 'phon', vals(cc)[0]]] }), a: { t: 'mc', choices: ['one consonant', 'two consonants', 'three consonants'], v: ['uni', 'bi', 'tri'].indexOf(k), keep: true },
          steps: ['The sign is the ' + nameOf(cc) + ' (' + cc + '). It writes ' + T(vals(cc)[0]) + ': ' + letters(vals(cc)[0]).length + ' consonant' + (letters(vals(cc)[0]).length > 1 ? 's' : '') + '.'], hint: 'Count the letters of its sound.' };
      }
      var ws = wordsWith(c);
      var sp2 = signPick(R, c, R.shuffle(pool.filter(function (x) { return x !== c; })));
      if (!ws.length) return { q: 'Which of the numbered signs writes ' + T(v) + '?', viz: sp2.viz, a: sp2.a, steps: [T(v) + ' is the ' + nameOf(c) + ' ' + sg(c, 1.3) + '.'], hint: 'Picture the sign.' };
      var key = pick(R, ws), w = W(key);
      return { q: 'Read this word, which uses ' + sg(c, 1.3) + ' ' + T(v) + '. Phonetic complements are not read twice, and determinatives and strokes are not read. Type its transliteration.', viz: glyphs({ word: key }), a: tla(w.tl),
        steps: w.parts.map(function (p) { return sgs([p[0]], 1.2) + ' ' + (p[1] === 'det' ? 'determinative (not read)' : p[1] === 'stroke' ? 'stroke (not read)' : p[1] === 'comp' ? 'complement ' + T(p[2]) + ' (already written)' : T(p[2])); }).concat(['The word is ' + T(w.tl) + ' ' + Q(w.en) + '.']), hint: 'Read the big sign, then check which small signs only repeat its sounds.' };
    };
  }
  G('me1.biliterals', multiGen(BI1, 'two-consonant (biliteral)', 'two consonants'));
  G('me1.biliterals-2', multiGen(BI2, 'two-consonant (biliteral)', 'two consonants'));
  G('me1.triliterals', multiGen(TRI, 'three-consonant (triliteral)', 'three consonants'));

  var COMP_WORDS = ['nfr', 'ankh', 'hetep', 'kheper', 'heqa', 'wer', 'sedjem', 'menu', 'maat', 'amun', 'geb', 'weser', 'niwt'];
  G('me1.complements', function (R, ctx) {
    var E = EG(), L = lv(ctx), key = pick(R, COMP_WORDS), w = W(key), kind = L === 1 ? R.int(0, 1) : R.int(0, 2);
    var comps = w.parts.filter(function (p) { return p[1] === 'comp'; });
    var doubled = w.parts.filter(function (p) { return p[1] !== 'det' && p[1] !== 'stroke'; }).map(function (p) { return p[2]; }).join('');
    var expl = w.parts.map(function (p) { return sgs([p[0]], 1.2) + ' ' + (p[1] === 'comp' ? 'complement (repeats ' + T(p[2]) + ')' : p[1] === 'det' ? 'determinative (not read)' : p[1] === 'stroke' ? 'stroke' : T(p[2])); });
    if (kind === 0) {
      return { q: 'Type the transliteration of this word. Remember that phonetic complements repeat sounds already written.', viz: glyphs({ word: key }), a: tla(w.tl),
        steps: expl.concat(['Read each sound once: ' + T(w.tl) + ' ' + Q(w.en) + ' (not ' + T(doubled) + ').']), hint: 'Read the big sign first, then drop the repeats.' };
    }
    if (kind === 1) {
      return { q: 'How many of these signs are phonetic complements?', viz: glyphs({ word: key }), a: { t: 'num', v: String(comps.length) },
        steps: expl.concat(['Complements: ' + comps.length + ' (' + comps.map(function (p) { return sgs([p[0]], 1.1) + ' ' + T(p[2]); }).join(', ') + '). The word is ' + T(w.tl) + '.']), hint: 'Which small signs repeat sounds of the big one?' };
    }
    var right = E.show(w.tl), wr = [E.show(doubled)];
    var c0 = comps[0]; if (c0) wr.push(E.show(w.tl + c0[2]));
    wr.push(E.show(letters(w.tl).slice(0, -1).join('')));
    wr.push(E.show(comps.map(function (p) { return p[2]; }).join('')));
    return { q: 'Which is the right reading of this word?', viz: glyphs({ word: key }), a: mc('<i class="eg-tl">' + right + '</i>', wr.filter(function (x) { return E.norm(x) !== E.norm(right) && x; }).map(function (x) { return '<i class="eg-tl">' + x + '</i>'; })),
      steps: expl.concat(['The complements only confirm the reading: ' + T(w.tl) + ' ' + Q(w.en) + '.']), hint: 'Complements are reading aids.' };
  });

  var READ_WORDS = ['netjer', 'ra', 'pet', 'heru', 'zat', 'heqa', 'remetj', 'zi', 'amun', 'ptah', 'osiris', 'anubis', 'geb', 'jwnw', 'maat', 'per', 'za', 'ta', 'ib', 'niwt'];
  G('me1.reading-words', function (R, ctx) {
    var E = EG(), L = lv(ctx), pool = L === 1 ? READ_WORDS.slice(0, 12) : READ_WORDS, key = pick(R, pool), w = W(key);
    var expl = w.parts.map(function (p) { return sgs([p[0]], 1.2) + ' ' + (p[1] === 'comp' ? 'complement ' + T(p[2]) + ' (already written)' : p[1] === 'det' ? 'determinative (' + (DETCLASS[p[0]] || 'class of meaning') + '), not read' : p[1] === 'stroke' ? 'stroke, not read' : p[1] === 'logo' ? 'word sign ' + T(p[2]) : T(p[2])); });
    if (L === 1 || R.chance(0.6)) {
      return { q: 'Type the transliteration of this word.', viz: glyphs({ word: key }), a: tla(w.tl),
        steps: expl.concat(['So the word is ' + T(w.tl) + ' ' + Q(w.en) + '.']), hint: 'Stop reading where the determinative begins.' };
    }
    var sounds = w.parts.filter(function (p) { return p[1] !== 'det' && p[1] !== 'stroke' && p[1] !== 'comp'; });
    var right = T(w.tl) + ' ' + Q(w.en);
    var others = R.shuffle(READ_WORDS.filter(function (k) { return k !== key && W(k).tl !== w.tl; })).slice(0, 3).map(function (k) { return T(W(k).tl) + ' ' + Q(W(k).en); });
    return { q: 'What does this word say?', viz: glyphs({ word: key }), a: mc(right, others),
      steps: expl.concat(['The sounds are ' + sounds.map(function (p) { return T(p[2]); }).join(' + ') + ': ' + T(w.tl) + ' ' + Q(w.en) + '.']), hint: 'Read the sound signs, then check the determinative.' };
  });

  var SAME = [['nfr1', 'nfr'], ['ankh1', 'ankh'], ['ntr1', 'netjer'], ['ntr3', 'netjer'], ['ntr1', 'ntr3'], ['ra1', 'ra'], ['mn1', 'menu'], ['wr1', 'wer'], ['htp1', 'hetep'], ['kheper1', 'kheper'], ['amun1', 'amun']];
  var DIFF = [['menu', 'amun1'], ['ntr1', 'ntrw'], ['ra1', 'heru'], ['per', 'prw'], ['za', 'zat'], ['neb', 'nebet']];
  G('me1.spellings', function (R, ctx) {
    var E = EG(), L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2);
    if (kind === 0) {
      var same = R.coin(), pr = pick(R, same ? SAME : DIFF), a = getW(pr[0]), b = getW(pr[1]);
      if (R.coin()) { var t = a; a = b; b = t; }
      return { q: 'Here are two spellings, one after the other. Do they write the same word? (True = the same word.)', viz: glyphs({ sp: a.sp + ' ' + b.sp, parts: a.parts.concat(b.parts) }), a: { t: 'tf', v: same },
        steps: ['The first reads ' + T(a.tl) + ' ' + Q(a.en) + '; the second reads ' + T(b.tl) + ' ' + Q(b.en) + '.', same ? 'Same transliteration, same word: the scribe only added or left out reading aids (complements, a determinative).' : 'The transliterations differ, so these are different words, even though they share signs.'],
        hint: 'Transliterate both and compare.' };
    }
    if (kind === 1) {
      var pr2 = pick(R, SAME), k = pr2[0], w = getW(k);
      return { q: 'This is a short spelling of a word you know. Type its transliteration.', viz: wv(k), a: tla(w.tl),
        steps: ['The spelling is ' + w.parts.map(function (p) { return sgs([p[0]], 1.2) + (p[2] ? ' ' + T(p[2]) : ' (not read)'); }).join(' + ') + '.', 'It reads ' + T(w.tl) + ' ' + Q(w.en) + ', the same word as the fuller spelling ' + sgs(E.codes(getW(pr2[1]).sp), 1.2) + '.'], hint: 'The big sign carries the whole reading.' };
    }
    var pr3 = pick(R, SAME), x = getW(pr3[0]), y = getW(pr3[1]);
    var wrongs = R.shuffle(DIFF.map(function (d) { return getW(d[0]); }).concat(DIFF.map(function (d) { return getW(d[1]); }))).filter(function (z) { return E.norm(z.tl) !== E.norm(x.tl); });
    var wr3 = []; wrongs.forEach(function (z) { var t = E.show(z.tl) + ' “' + z.en + '”'; if (wr3.indexOf(t) < 0) wr3.push(t); });
    return { q: 'This is ' + (R.coin() ? 'a short' : 'another') + ' spelling of a word you know. Which word is it?', viz: wv(pr3[0]), a: mc(E.show(x.tl) + ' “' + x.en + '”', wr3),
      steps: ['The spelling ' + sgs(E.codes(x.sp), 1.2) + ' reads ' + T(x.tl) + '.', 'It is the same word as ' + sgs(E.codes(y.sp), 1.2) + ': compare the transliterations, not the number of signs.'], hint: 'Transliterate it.' };
  });


  /* ================================================================ Unit 4: word signs and determinatives */
  var LOGO_WORDS = ['per', 'za', 'ta', 'ib', 'ka', 'ra1', 'niwt'];
  function partsText(w) { return w.parts.map(function (p) { return sgs([p[0]], 1.2) + ' ' + (p[1] === 'det' ? 'determinative (not read)' : p[1] === 'stroke' ? 'stroke: “this sign means what it shows”' : p[1] === 'comp' ? 'complement ' + T(p[2]) : p[1] === 'logo' ? (p[2] ? 'word sign ' + T(p[2]) : 'the same sign again (the plural)') : p[1] === 'end' ? 'ending ' + T(p[2]) : T(p[2])); }).join('; '); }
  G('me1.logograms', function (R, ctx) {
    var E = EG(), L = lv(ctx), kind = L === 1 ? R.int(0, 2) : R.int(0, 3);
    var key = pick(R, LOGO_WORDS), w = getW(key);
    if (kind === 0) return { q: 'This sign has a stroke beside or under it, so it is a word sign. Type its transliteration.', viz: wv(key), a: tla(w.tl),
      steps: [partsText(w) + '.', 'The word is ' + T(w.tl) + ' ' + Q(w.en) + '.'], hint: 'The stroke says: read the picture as the word it shows.' };
    if (kind === 1) {
      var others = R.shuffle(LOGO_WORDS.filter(function (k) { return k !== key; })).map(function (k) { return Q(getW(k).en); });
      return { q: 'What does this word mean?', viz: wv(key), a: mc(Q(w.en), others),
        steps: [partsText(w) + '.', 'So it is ' + T(w.tl) + ' ' + Q(w.en) + '.'], hint: 'A stroke means the sign shows the word itself.' };
    }
    if (kind === 2) return { q: 'What does the single stroke ' + sg('Z1', 1.4) + ' mean when it stands with a sign like this?', viz: wv(key),
      a: mc('This sign means what it shows: it is a word sign.', R.shuffle(['the number 1', 'the sound w', 'the word is plural', 'the end of a sentence'])),
      steps: ['The stroke after or under a sign marks it as a logogram (word sign): ' + partsText(w) + '.', 'The same stroke means 1 only in numbers.'], hint: 'It is not counting here.' };
    var pr = pick(R, [['za', 'G39', 'logo'], ['zat', 'G39', 'phon'], ['ra1', 'N5', 'logo'], ['heru', 'N5', 'det'], ['ra', 'N5', 'det'], ['per', 'O1', 'logo'], ['pharaoh', 'O1', 'logo']]);
    var w2 = getW(pr[0]), idx = E.codes(w2.sp).indexOf(pr[1]);
    var lab = { logo: 'a word sign (logogram)', phon: 'a sound sign', det: 'a determinative' };
    return { q: 'In ' + T(w2.tl) + ' ' + Q(w2.en) + ', what is the marked sign ' + sg(pr[1], 1.3) + '?', viz: wv(pr[0], { ask: idx }), a: mc(lab[pr[2]], ['a word sign (logogram)', 'a sound sign', 'a determinative'].filter(function (x) { return x !== lab[pr[2]]; }), 3),
      steps: [partsText(w2) + '.', 'One sign can do different jobs in different words; the stroke, the other signs and the reading decide.'], hint: 'Is it read as the word, as sounds, or not at all?' };
  });

  var DET_WORDS = ['netjer', 'ra', 'pet', 'heru', 'zat', 'heqa', 'zi', 'amun', 'ptah', 'osiris', 'isis', 'anubis', 'geb', 'jwnw', 'maat', 'ntrt'];
  G('me1.determinatives', function (R, ctx) {
    var E = EG(), L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2), key = pick(R, DET_WORDS), w = getW(key);
    var di = -1; w.parts.forEach(function (p, i) { if (p[1] === 'det' && di < 0) di = i; });
    var dc = w.parts[di][0];
    if (kind === 0) return { q: 'The signs are numbered in reading order. Which number is the determinative?', viz: wv(key, { number: true }), a: { t: 'num', v: String(di + 1) },
      steps: [partsText(w) + '.', 'The determinative is sign ' + (di + 1) + ', ' + nameOf(dc) + ': it shows ' + DETCLASS[dc] + ' and marks the end of the word ' + T(w.tl) + ' ' + Q(w.en) + '.'], hint: 'Determinatives come at the end of a word.' };
    if (kind === 1) {
      var cls = DETCLASS[dc], others = R.shuffle(Object.keys(DETCLASS).map(function (k) { return DETCLASS[k]; }).filter(function (x) { return x !== cls; }));
      return { q: 'The last sign of ' + T(w.tl) + ' ' + Q(w.en) + ' is a determinative. Which class of meaning does it show?', viz: wv(key, { ask: di }), a: mc(cls, others),
        steps: ['The determinative ' + sg(dc, 1.3) + ' (' + dc + ', ' + nameOf(dc) + ') marks words for ' + cls + '.', 'It is not read: the word is ' + T(w.tl) + '.'], hint: 'Look at what the sign shows.' };
    }
    return { q: 'Type the transliteration of this word. Remember: the determinative is silent.', viz: wv(key), a: tla(w.tl),
      steps: [partsText(w) + '.', 'Stop at the determinative: ' + T(w.tl) + ' ' + Q(w.en) + '.'], hint: 'Read the sound signs only.' };
  });

  // words and the determinative they usually take (Gardiner's sign list)
  var DET_FOR = [['snt', 'sister', 'B1'], ['ḥmt', 'wife', 'B1'], ['sš', 'scribe', 'A1'], ['wnm', 'eat', 'A2'], ['swr', 'drink', 'A2'], ['šm', 'go', 'D54'], ['jj', 'come', 'D54'],
    ['mḏꜣt', 'papyrus roll, book', 'Y1'], ['ḥnqt', 'beer', 'W22'], ['kꜣ', 'bull', 'E1'], ['rm', 'fish', 'K1'], ['šꜥ', 'sand', 'N33'], ['nḏs', 'small', 'G37'], ['bjn', 'bad', 'G37'],
    ['ꜥꜣmw', 'Asiatics (a foreign people)', 'T14'], ['njwt', 'town', 'O49'], ['nṯr', 'god', 'A40'], ['hrw', 'day', 'N5'], ['pt', 'sky', 'N1'], ['mw', 'water', 'N35A']];
  var CDETS = ['A1', 'B1', 'A2', 'A40', 'D54', 'Y1', 'O49', 'N25', 'N35A', 'N5', 'N1', 'A24', 'A53', 'A55', 'I12', 'E1', 'K1', 'M2', 'T14', 'F27', 'W22', 'N33', 'G37'];
  G('me1.common-dets', function (R, ctx) {
    var E = EG(), L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2);
    if (kind === 0) {
      var c = pick(R, L === 1 ? CDETS.slice(0, 11) : CDETS), cls = DETCLASS[c];
      var wr = R.shuffle(CDETS.filter(function (x) { return x !== c && DETCLASS[x] !== cls; }).map(function (x) { return DETCLASS[x]; }));
      if (c === 'N25') wr.unshift('mountains (it is the sound sign ḏw)');
      if (c === 'Y1') wr.unshift('the sound m (it is a sound sign)');
      return { q: 'At the end of a word, this determinative ' + sg(c, 2) + ' (' + nameOf(c) + ') marks words for…', a: mc(cls, wr),
        steps: [c + ', ' + nameOf(c) + ': determinative of ' + cls + '.', c === 'N25' ? 'Do not confuse the three hills with ' + sg('N26', 1.3) + ' (N26, the mountain with two peaks), which writes ḏw "mountain".' : c === 'Y1' ? 'The papyrus roll marks writing and abstract ideas (like mꜣꜥt "truth"); it has no sound.' : 'Determinatives are not read; they tell you what kind of word it is.'],
        hint: 'What does the picture show?' };
    }
    if (kind === 1) {
      var d = pick(R, DET_FOR), right = d[2];
      var wr2 = R.shuffle(CDETS.filter(function (x) { return x !== right && DETCLASS[x] !== DETCLASS[right]; }));
      var sp1 = signPick(R, right, wr2);
      return { q: 'Which of the numbered signs is the determinative you would expect at the end of ' + T(d[0]) + ' ' + Q(d[1]) + '?', viz: sp1.viz, a: sp1.a,
        steps: [T(d[0]) + ' ' + Q(d[1]) + ' takes ' + sg(right, 1.3) + ' (' + right + ', ' + nameOf(right) + '), the determinative of ' + DETCLASS[right] + '.'], hint: 'Which class of meaning does the word belong to?' };
    }
    var p = R.coin() ? ['N25', 'N26', 'foreign land, desert hills', 'mountain'] : ['A40', 'A1', 'gods and the king', 'men and male persons'];
    var which = R.coin();
    var sp2 = signPick(R, which ? p[0] : p[1], [which ? p[1] : p[0]], 2);
    return { q: 'Which of these two signs is ' + (which ? 'the determinative of ' + p[2] : p[0] === 'N25' ? 'the word sign for “mountain”' : 'the determinative of ' + p[3]) + '?', viz: sp2.viz, a: sp2.a,
      steps: [sg(p[0], 1.3) + ' (' + p[0] + ', ' + nameOf(p[0]) + ') and ' + sg(p[1], 1.3) + ' (' + p[1] + ', ' + nameOf(p[1]) + ') look alike but mark different things.', p[0] === 'N25' ? 'The three hills mark foreign lands and the desert; the two-peaked mountain is the word sign ḏw "mountain".' : 'The seated god (with a beard and a god’s garment) marks gods and the king; the seated man marks men.'],
      hint: 'Look carefully at the details.' };
  });

  // honorific transposition: [spelling key or name, how it is written, how it is read, English, kind]
  var HONOR = [
    { k: 'htpdinsw', w: 'nsw ḥtp dj', r: 'ḥtp-dj-nsw', en: 'an offering that the king gives', g: true, alt: ['nsw-ḥtp-dj', 'dj-nsw-ḥtp', 'ḥtp-nsw-dj'] },
    { k: 'hmntr', w: 'nṯr ḥm', r: 'ḥm-nṯr', en: 'servant of the god (a priest)', g: true, sp: true, alt: ['nṯr-ḥm', 'nṯrt-ḥm', 'ḥm-nṯrt'] },
    { k: 'tutankhamun', w: 'jmn twt ꜥnḫ', r: 'twt-ꜥnḫ-jmn', en: 'Tutankhamun, “living image of Amun”', c: true, alt: ['jmn-twt-ꜥnḫ', 'jmn-ꜥnḫ-twt', 'ꜥnḫ-twt-jmn'] },
    { k: 'khafre', w: 'rꜥ ḫꜥ=f', r: 'ḫꜥ=f-rꜥ', en: 'Khafre', c: true, alt: ['rꜥ-ḫꜥ=f', 'ḫꜥ-rꜥ=f', 'rꜥ=f-ḫꜥ'] },
    { k: 'menkaure', w: 'rꜥ mn kꜣw', r: 'mn-kꜣw-rꜥ', en: 'Menkaure', c: true, alt: ['rꜥ-mn-kꜣw', 'kꜣw-mn-rꜥ', 'mn-rꜥ-kꜣw'] },
    { k: 'menkheperre', w: 'rꜥ mn ḫpr', r: 'mn-ḫpr-rꜥ', en: 'Menkheperre (Thutmose III), “enduring is the form of Ra”', x: true, alt: ['rꜥ-mn-ḫpr', 'ḫpr-mn-rꜥ', 'mn-rꜥ-ḫpr'] }
  ];
  var NOTRANS = [{ k: 'amenhotep', r: 'jmn-ḥtp', en: 'Amenhotep, “Amun is content”' }, { k: 'ramesses', r: 'rꜥ-ms-sw', en: 'Ramesses, “Ra is the one who bore him”' }, { k: 'thutmose', r: 'ḏḥwtj-ms', en: 'Thutmose, “Thoth is born”' }];
  function honorViz(h) {
    if (h.c) return cart({ name: h.k });
    if (h.x) return cart({ sp: XNAMES[h.k].sp });
    if (h.sp) return wv(h.k);
    return glyphs({ word: h.k });
  }
  G('me1.honorific', function (R, ctx) {
    var E = EG(), L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2);
    var h = pick(R, L === 1 ? HONOR.slice(0, 4) : HONOR);
    if (kind === 0) {
      var wr = h.alt;
      return { q: 'The honored word is written first here. How is this read?', viz: honorViz(h), a: mc(T(h.r), wr.map(function (x) { return T(x); })),
        steps: ['Written order: ' + T(h.w) + '.', 'The word for the king or the god is moved to the front in writing out of respect, but it is read in its normal place: ' + T(h.r) + ', ' + h.en + '.'], hint: 'Move the honored word back to where it belongs in the phrase.' };
    }
    if (kind === 1) {
      return { q: 'Type the transliteration in reading order (not in written order).', viz: honorViz(h), a: tla(h.r),
        steps: ['Written order: ' + T(h.w) + '.', 'Reading order: ' + T(h.r) + ', ' + h.en + '. The honored word is written first but read in its grammatical place.'], hint: 'The god or the king is read last here.' };
    }
    var n = pick(R, NOTRANS), wrongs = R.shuffle(HONOR.filter(function (x) { return x.c || x.x; })).map(function (x) { return T(x.r) + ' (' + x.en.split(',')[0] + ')'; });
    return { q: 'In which of these royal names is the god’s name both written first and read first?', a: mc(T(n.r) + ' (' + n.en.split(',')[0] + ')', wrongs),
      steps: [n.en + ': the god comes first in the meaning of the name, so writing and reading agree: ' + T(n.r) + '.', 'In the others the god’s name is written first out of honor but read last.'], hint: 'Translate each name: where does the god belong in the sentence?' };
  });

  var PLW = [{ k: 'prw', n: 'pl' }, { k: 'ntrw', n: 'pl' }, { k: 'remetj', n: 'pl' }, { k: 'per', n: 'sg' }, { k: 'netjer', n: 'sg' }, { k: 'za', n: 'sg' }, { k: 'ntrt', n: 'sg' }, { k: 'niwt', n: 'sg' }];
  G('me1.plural-writing', function (R, ctx) {
    var E = EG(), L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2);
    if (kind === 0) {
      var it = pick(R, PLW), w = getW(it.k), right = it.n === 'pl' ? 'more than one (plural)' : 'one (singular)';
      return { q: 'Does this spelling show one thing or more than one?', viz: wv(it.k), a: mc(right, ['one (singular)', 'more than one (plural)', 'exactly three'].filter(function (x) { return x !== right; }), 3),
        steps: [partsText(w) + '.', it.n === 'pl' ? (it.k === 'ntrw' ? 'A word sign written three times shows the plural.' : 'The three strokes ' + sg('Z2', 1.2) + ' show the plural (with rmṯ "people", a word for a group).') : 'There are no plural strokes and no tripled sign: one.', 'It reads ' + T(w.tl) + ' ' + Q(w.en) + '.'],
        hint: 'Look for three strokes or a sign written three times.' };
    }
    if (kind === 1) {
      return { q: 'In ' + T('prw') + ' ' + Q('houses') + ', what do the three strokes ' + sg('Z2', 1.4) + ' say?', viz: wv('prw'), a: mc('that the word is plural: more than one', R.shuffle(['the number 3', 'the sound w', 'that the house sign is a word sign', 'the consonants pr'])),
        steps: ['Three strokes are a determinative of plurality: "more than one".', 'They are not the number 3 and are not read; the plural ending -w is supplied in the transliteration: ' + T('prw') + '.'], hint: 'Three is the Egyptian way to say "many".' };
    }
    var it2 = pick(R, [{ k: 'prw', tl: 'prw' }, { k: 'ntrw', tl: 'nṯrw' }]), w2 = getW(it2.k);
    return { q: 'Type the transliteration of this plural word (the plural ending is -w).', viz: wv(it2.k), a: tla(it2.tl),
      steps: [partsText(w2) + '.', 'The plural of a masculine noun ends in -w: ' + T(it2.tl) + ' ' + Q(w2.en) + '. The ending is often not written but is read.'], hint: 'Singular + w.' };
  });


  /* ================================================================ Unit 5: nouns */
  function enOf(n) { return n[2]; }
  function plEn(n) { return EN_PL[n[2]] || n[2] + 's'; }
  var FEM_OF = [['zꜣ', 'zꜣt', 'son', 'daughter'], ['sn', 'snt', 'brother', 'sister'], ['nb', 'nbt', 'lord', 'lady'], ['nṯr', 'nṯrt', 'god', 'goddess'], ['ḥqꜣ', 'ḥqꜣt', 'ruler', 'ruler (a woman)'], ['bꜣk', 'bꜣkt', 'servant', 'maidservant']];
  G('me1.gender', function (R, ctx) {
    var E = EG(), L = lv(ctx), kind = L === 1 ? R.int(0, 2) : R.int(0, 3);
    if (kind === 3 || (L === 1 && kind === 2)) {
      var wantF = R.coin(), one = pick(R, VOC.filter(function (x) { return (x[1] === 'f') === wantF && x[0] !== 'jt'; }));
      var rest = sample(R, VOC.filter(function (x) { return (x[1] === 'f') !== wantF && x[0] !== 'pt'; }), 3);
      return { q: 'Which of these nouns is ' + (wantF ? 'feminine' : 'masculine') + '?', a: mc(T(one[0]) + ' ' + Q(one[2]), rest.map(function (x) { return T(x[0]) + ' ' + Q(x[2]); })),
        steps: [T(one[0]) + ' ' + Q(one[2]) + ' is ' + (wantF ? 'feminine: it ends in -t.' : 'masculine: it has no feminine -t.') + (rest.some(function (x) { return x[0] === 'jt'; }) ? ' Careful with ' + T('jt') + ' "father": masculine, though it ends in t (its t is part of the root).' : ''), 'The others are ' + (wantF ? 'masculine' : 'feminine') + ': ' + rest.map(function (x) { return T(x[0]); }).join(', ') + '.'],
        hint: 'Look for the feminine -t.' };
    }
    if (kind === 0) {
      var n = pick(R, R.chance(0.2) ? [voc('jt'), voc('pt')] : VOC), m = n[1] === 'm';
      return { q: 'Is ' + T(n[0]) + ' ' + Q(n[2]) + ' masculine or feminine?', a: { t: 'mc', choices: ['masculine', 'feminine'], v: m ? 0 : 1, keep: true },
        steps: [n[0] === 'jt' ? T('jt') + ' "father" is masculine: its t belongs to the root (an older form was jtf), not a feminine ending.' : m ? T(n[0]) + ' has no feminine ending -t, so it is masculine.' : T(n[0]) + ' ends in the feminine ending -t (written with the bread loaf ' + sg('X1', 1.2) + '), so it is feminine.', 'Gender is grammatical: things have gender too (' + T('pr') + ' "house" is masculine, ' + T('pt') + ' "sky" feminine).'],
        hint: 'Look for the ending -t, but think about the meaning too.' };
    }
    if (kind === 1) {
      var f = pick(R, FEM_OF);
      return { q: 'The feminine of ' + T(f[0]) + ' ' + Q(f[2]) + ' is ' + Q(f[3]) + '. Type it in transliteration.', a: tla(f[1]),
        steps: ['Add the feminine ending -t: ' + T(f[0]) + ' + t = ' + T(f[1]) + '.'], hint: 'Feminine nouns end in -t.' };
    }
    var it = pick(R, [['za', 'm'], ['zat', 'f'], ['neb', 'm'], ['nebet', 'f'], ['netjer', 'm'], ['ntrt', 'f'], ['niwt', 'f'], ['per', 'm']]), w = getW(it[0]);
    return { q: 'Is this noun masculine or feminine?', viz: wv(it[0]), a: { t: 'mc', choices: ['masculine', 'feminine'], v: it[1] === 'm' ? 0 : 1, keep: true },
      steps: [partsText(w) + '.', it[1] === 'f' ? 'The bread loaf ' + sg('X1', 1.2) + ' writes the feminine ending -t (in ' + T('njwt') + ' it also belongs to the word): ' + T(w.tl) + ' ' + Q(w.en) + ' is feminine.' : 'No feminine -t: ' + T(w.tl) + ' ' + Q(w.en) + ' is masculine.'], hint: 'Find the bread loaf.' };
  });

  G('me1.plural', function (R, ctx) {
    var E = EG(), L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2);
    var ns = VOC.filter(function (n) { return n[3]; }), n = pick(R, L === 1 ? ns.filter(function (x) { return x[0] !== 'njwt' && x[0] !== 'mwt' && x[0] !== 'hrw'; }) : ns), pl = n[3];
    var rule = n[1] === 'm' ? 'A masculine noun takes -w: ' + T(n[0]) + ' + w = ' + T(pl) + '.' : 'A feminine noun takes -wt: the w comes before the t: ' + T(n[0].slice(0, -1)) + ' + wt = ' + T(pl) + ' (not ' + T(n[0] + 'w') + ').';
    if (kind === 0) return { q: 'Type the plural of ' + T(n[0]) + ' ' + Q(n[2]) + ' (' + (n[1] === 'm' ? 'masculine' : 'feminine') + '): ' + Q(plEn(n)) + '.', a: tla(pl),
      steps: [rule, 'In hieroglyphs the ending is often left unwritten and the plural shown by three strokes; the transliteration still writes it.'], hint: n[1] === 'm' ? 'Masculine: add -w.' : 'Feminine: -wt, w before t.' };
    if (kind === 1) {
      var wr = n[1] === 'm' ? [n[0] + 'wt', n[0] + 'wj', n[0] + 't'] : [n[0] + 'w', n[0].slice(0, -1) + 'w', n[0] + 'j'];
      return { q: 'Which is the plural of ' + T(n[0]) + ' ' + Q(n[2]) + '?', a: mc(T(pl), wr.map(function (x) { return T(x); })),
        steps: [rule], hint: 'Masculine -w, feminine -wt.' };
    }
    var others = [n[2], 'two ' + plEn(n)]; var opp = voc(n[1] === 'm' ? (FEM_OF.filter(function (f) { return f[0] === n[0]; })[0] || [])[1] : (FEM_OF.filter(function (f) { return f[1] === n[0]; })[0] || [])[0]);
    if (opp) others.unshift(plEn(opp));
    return { q: 'What does ' + T(pl) + ' mean?', a: mc(plEn(n), others.concat([plEn(pick(R, VOC.filter(function (x) { return x !== n && x[3]; })))])),
      steps: [T(pl) + ' is the plural of ' + T(n[0]) + ' ' + Q(n[2]) + '. ' + rule], hint: 'Take off the ending and find the noun.' };
  });

  G('me1.dual', function (R, ctx) {
    var E = EG(), L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 3);
    var ns = VOC.filter(function (n) { return n[4]; }), n = pick(R, ns), du = n[4];
    var EN2 = { 'tꜣ': 'the Two Lands (Egypt)', 'nbt': 'the Two Ladies (the goddesses of Upper and Lower Egypt)' };
    var en2 = EN2[n[0]] || 'the two ' + plEn(n) + (n[0] === 'ꜥ' ? ' (both arms)' : '');
    var rule = n[1] === 'm' ? 'Masculine dual: -wj. ' + T(n[0]) + ' + wj = ' + T(du) + '.' : 'Feminine dual: -tj. ' + T(n[0].slice(0, -1)) + ' + tj = ' + T(du) + ' (the t of the noun plus j).';
    if (kind === 0) return { q: 'Type the dual of ' + T(n[0]) + ' ' + Q(n[2]) + ': ' + Q(en2) + '.', a: tla(du),
      steps: [rule, 'In hieroglyphs the dual is often shown by writing the sign twice or by two strokes ' + sg('Z4', 1.2) + '.'], hint: n[1] === 'm' ? 'Masculine: -wj.' : 'Feminine: -tj.' };
    if (kind === 1) {
      var wr = n[1] === 'm' ? [n[0] + 'w', n[0] + 'tj', n[0] + 'jw'] : [n[0].slice(0, -1) + 'wt', n[0].slice(0, -1) + 'wj', n[0] + 'w'];
      return { q: 'Which form means ' + Q(en2) + '?', a: mc(T(du), wr.map(function (x) { return T(x); })), steps: [rule], hint: 'Pairs take the dual, not the plural.' };
    }
    if (kind === 2) {
      return { q: 'What does ' + T(du) + ' mean?', a: mc(en2, [n[0] === 'tꜣ' ? 'lands (three or more)' : plEn(n) + ' (three or more)', 'one ' + n[2], 'the second ' + n[2]]),
        steps: [T(du) + ' is the dual of ' + T(n[0]) + ' ' + Q(n[2]) + '. ' + rule], hint: 'The ending -wj or -tj means two.' };
    }
    var pair = pick(R, [['jrt', 'eyes'], ['drt', 'hands'], ['rd', 'feet'], ['ꜥ', 'arms']]), pn = voc(pair[0]);
    return { q: 'A text speaks of a person’s two ' + pair[1] + '. Which form does Egyptian use?', a: mc(T(pn[4]) + ' (the dual)', [T(pn[1] === 'm' ? pn[0] + 'w' : pn[0].slice(0, -1) + 'wt') + ' (the plural)', T(pn[0]) + ' (the singular)']),
      steps: ['Natural pairs like eyes, hands, feet and arms take the dual: ' + T(pn[4]) + '.', 'The plural is for three or more.'], hint: 'Two of something: the dual.' };
  });

  // the direct genitive: [possessed, possessor, English]
  var DGEN = [['pr', 'nsw', 'the house of the king'], ['zꜣ', 'nsw', 'the son of the king'], ['zꜣt', 'nsw', 'the daughter of the king'], ['ḥmt', 'nsw', 'the wife of the king'], ['mwt', 'nsw', 'the mother of the king'],
    ['nb', 'tꜣwj', 'the lord of the Two Lands'], ['ḥm', 'nṯr', 'the servant of the god'], ['pr', 'nṯr', 'the house of the god'], ['rn', 'nṯr', 'the name of the god'], ['ḥqꜣ', 'ḫꜣswt', 'the ruler of the foreign lands'],
    ['nb', 'pt', 'the lord of the sky'], ['njwt', 'nṯr', 'the town of the god'], ['sš', 'nsw', 'the scribe of the king'], ['nbt', 'pr', 'the lady of the house']];
  function revEn(e) { var m = /^the (.+) of the (.+)$/.exec(e); return m ? 'the ' + m[2] + ' of the ' + m[1] : e; }
  G('me1.direct-genitive', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2), g = pick(R, DGEN), ph = g[0] + ' ' + g[1], rv = g[1] + ' ' + g[0];
    if (kind === 0) return { q: 'What does ' + T(ph) + ' mean?', a: mc(g[2], [revEn(g[2]), g[2].replace(/^the (.+?) of /, function (m, x) { return 'the ' + (EN_PL[x] || x) + ' of '; }), g[2].replace(' of the ', ' and the ')]),
      steps: ['In the direct genitive the two nouns stand side by side: the first is the thing possessed, the second the possessor.', T(g[0]) + ' + ' + T(g[1]) + ' = ' + Q(g[2]) + '.'], hint: 'The first noun is "the X of".' };
    if (kind === 1) return { q: 'Write ' + Q(g[2]) + ' with a direct genitive. Type the transliteration (a space between words is fine).', a: tla(ph),
      steps: ['Possessed first, possessor second: ' + T(g[0]) + ' then ' + T(g[1]) + '.', 'So: ' + T(ph) + '. (Not ' + T(rv) + (/^nbt?$/.test(g[0]) ? ': after a noun, ' + T(g[0]) + ' means "every".)' : ', which would mean ' + Q(revEn(g[2])) + '.)')], hint: 'Which noun is owned? It comes first.' };
    return { q: 'Which phrase means ' + Q(g[2]) + '?', a: mc(T(ph), [T(rv), T(g[0] + ' ' + (voc(g[0])[1] === 'f' ? 'n' : 'nt') + ' ' + g[1]), T(g[1] + ' n ' + g[0])]),
      steps: ['A direct genitive puts the possessed noun first: ' + T(ph) + '.', 'Reversing the nouns reverses the meaning. (The indirect genitive with the right form of n, which you meet next, says the same thing.)'], hint: 'English "king’s house" puts the king first; Egyptian does not.' };
  });

  // the indirect genitive: first noun (from VOC) + n / nt / nw + second noun
  var IG_SECOND = [['nsw', 'the king'], ['nṯr', 'the god'], ['ḥqꜣ', 'the ruler'], ['njwt', 'the town'], ['pr', 'the house']];
  var IG_FIRST = ['zꜣ', 'sn', 'nb', 'bꜣk', 'sš', 'rn', 'zꜣt', 'snt', 'ḥmt', 'mwt', 'bꜣkt'];
  function igen(n, num) { return num === 'pl' ? 'nw' : n[1] === 'f' ? 'nt' : 'n'; }
  G('me1.indirect-genitive', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2);
    var n = voc(pick(R, IG_FIRST)), num = n[1] === 'm' && L > 1 && R.chance(0.4) ? 'pl' : 'sg', s2 = pick(R, IG_SECOND.filter(function (x) { return x[0] !== n[0]; }));
    var first = num === 'pl' ? n[3] : n[0], gn = igen(n, num), ph = first + ' ' + gn + ' ' + s2[0], en = 'the ' + (num === 'pl' ? plEn(n) : n[2]) + ' of ' + s2[1];
    var why = 'The genitive word agrees with the FIRST noun: ' + T(first) + ' is ' + (num === 'pl' ? 'masculine plural, so ' + T('nw') : n[1] === 'f' ? 'feminine, so ' + T('nt') : 'masculine singular, so ' + T('n')) + '.';
    if (kind === 0) return { q: 'Fill the gap with the right form of the genitive word (n, nt or nw): ' + T(first) + ' ___ ' + T(s2[0]) + ' ' + Q(en) + '.', a: tla(gn),
      steps: [why, 'The phrase: ' + T(ph) + '.'], hint: 'Agree with the noun before the gap.' };
    if (kind === 1) {
      var wr = ['n', 'nt', 'nw'].filter(function (x) { return x !== gn; }).map(function (x) { return T(first + ' ' + x + ' ' + s2[0]); });
      wr.push(T(s2[0] + ' ' + gn + ' ' + first));
      return { q: 'Which phrase means ' + Q(en) + '?', a: mc(T(ph), wr), steps: [why, 'Possessed noun first, then the genitive word, then the possessor: ' + T(ph) + '.'], hint: 'n for masculine, nt for feminine, nw for plural.' };
    }
    var right = num === 'pl' ? 'masculine plural' : n[1] === 'f' ? 'feminine singular' : 'masculine singular';
    return { q: 'In ' + T(ph) + ', what does the form ' + T(gn) + ' tell you about ' + T(first) + '?', a: mc('it is ' + right, ['it is masculine singular', 'it is feminine singular', 'it is masculine plural', 'nothing: it agrees with ' + T(s2[0])].filter(function (x) { return x !== 'it is ' + right; })),
      steps: [why], hint: 'The genitive word looks back, not ahead.' };
  });


  /* ================================================================ Unit 6: adjectives and demonstratives */
  var ADJ_NOUNS = ['zꜣ', 'zꜣt', 'sn', 'snt', 'nṯr', 'nṯrt', 'pr', 'njwt', 'ḥqꜣ', 'sš', 'ḥmt', 'nb', 'nbt', 'bꜣk', 'tꜣ'];
  function article(w) { return /^[aeiou]/.test(w) ? 'an ' : 'a '; }
  G('me1.adjectives', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2);
    var n = voc(pick(R, ADJ_NOUNS)), a = pick(R, ADJ), num = n[1] === 'm' && L > 1 && R.chance(0.35) ? 'pl' : 'sg';
    var noun = num === 'pl' ? n[3] : n[0], adj = agree(a[0], n[1], num), ph = noun + ' ' + adj;
    var en = num === 'pl' ? a[1] + ' ' + plEn(n) : article(a[1]) + a[1] + ' ' + n[2];
    var why = 'The adjective follows the noun and agrees with it: ' + T(noun) + ' is ' + (num === 'pl' ? 'masculine plural, so ' + T(a[0]) + ' takes -w' : n[1] === 'f' ? 'feminine, so ' + T(a[0]) + ' takes -t' : 'masculine singular, so ' + T(a[0]) + ' has no ending') + ': ' + T(ph) + '.';
    if (kind === 0) return { q: 'Write ' + Q(en) + ' in Egyptian (' + T(n[0]) + ' ' + Q(n[2]) + ', ' + T(a[0]) + ' ' + Q(a[1]) + '). Type the transliteration.', a: tla(ph),
      steps: [why], hint: 'Noun first, then the adjective with a matching ending.' };
    if (kind === 1) {
      var wr = [adj + ' ' + noun, noun + ' ' + (n[1] === 'f' || num === 'pl' ? a[0] : a[0] + 't'), a[0] + ' ' + noun];
      return { q: 'Which phrase means ' + Q(en) + '?', a: mc(T(ph), wr.map(function (x) { return T(x); })), steps: [why], hint: 'Order and agreement both matter.' };
    }
    var b = pick(R, ADJ.filter(function (x) { return x !== a; }));
    return { q: 'What does ' + T(ph) + ' mean?', a: mc(en, [num === 'pl' ? b[1] + ' ' + plEn(n) : article(b[1]) + b[1] + ' ' + n[2], 'the ' + n[2] + ' is ' + a[1], num === 'pl' ? article(a[1]) + a[1] + ' ' + n[2] : a[1] + ' ' + plEn(n)]),
      steps: [why, 'An adjective after its noun describes it ("' + en + '"); an adjective first would make a sentence ("the ' + n[2] + ' is ' + a[1] + '"), which comes later in the course.'], hint: 'Adjective after noun = description.' };
  });

  // nisbes: [base, its meaning, nisbe, its meaning]
  var NISBE = [['njwt', 'town', 'njwtj', 'of the town; a townsman'], ['nṯr', 'god', 'nṯrj', 'divine, of the god'], ['ḥr', 'on, upon', 'ḥrj', 'upper; who is on, over'], ['ẖr', 'under', 'ẖrj', 'lower; who is under'],
    ['m', 'in', 'jmj', 'who is in'], ['tp', 'head; on top of', 'tpj', 'first; who is upon'], ['ḫnt', 'front', 'ḫntj', 'foremost, in front'], ['jmnt', 'the West', 'jmntj', 'western'], ['jꜣbt', 'the East', 'jꜣbtj', 'eastern']];
  function nisAcc(x) { return [x, x.replace(/j$/, 'y')]; }
  G('me1.nisbe', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2), ns = pick(R, NISBE);
    var why = ns[0] === 'm' ? 'The preposition ' + T('m') + ' becomes ' + T('jm') + ' when it takes an ending, so its nisbe is ' + T('jmj') + ' ' + Q('who is in') + '.' : T(ns[0]) + ' ' + Q(ns[1]) + ' + the nisbe ending -j = ' + T(ns[2]) + ' ' + Q(ns[3]) + '.';
    if (kind === 0) return { q: 'Make the nisbe adjective of ' + T(ns[0]) + ' ' + Q(ns[1]) + '. Type the transliteration.', a: tla(nisAcc(ns[2])),
      steps: [why, 'A nisbe means "belonging to, having to do with" (older books write the ending -y or -ỉ).'], hint: ns[0] === 'm' ? 'm changes before an ending.' : 'Add -j.' };
    if (kind === 1) {
      var others = R.shuffle(NISBE.filter(function (x) { return x !== ns; })).map(function (x) { return Q(x[3]); });
      return { q: 'What does the nisbe ' + T(ns[2]) + ' mean?', a: mc(Q(ns[3]), [Q(ns[1])].concat(others)), steps: [why], hint: 'Find the base word, then think "belonging to it".' };
    }
    if (R.coin()) return { q: 'Osiris is called ' + T('ḫntj-jmntjw') + '. What does this epithet mean?', a: mc('Foremost of the Westerners', R.shuffle(['Western foreigner', 'In front of the West', 'Lord of the West', 'Son of the West'])),
      steps: [T('ḫntj') + ' "foremost" is the nisbe of ' + T('ḫnt') + ' "front".', T('jmntjw') + ' "Westerners" is the plural of the nisbe ' + T('jmntj') + ' "western", from ' + T('jmnt') + ' "the West", used as a noun: the dead, who rest in the west.', 'Together: "Foremost of the Westerners", an old epithet taken over by Osiris.'], hint: 'Two nisbes side by side.' };
    return { q: 'Which word is the nisbe ' + Q(ns[3]) + '?', a: mc(T(ns[2]), [T(ns[0]), T(ns[0] + 't'), T(ns[0] + 'w'), ns[0] === 'm' ? T('mj') : T('j' + ns[0])]), steps: [why], hint: 'The nisbe ending is -j.' };
  });

  // nb "every, all": [noun, gender, number, English]
  var NBP = [['tꜣ', 'm', 'sg', 'every land'], ['hrw', 'm', 'sg', 'every day'], ['z', 'm', 'sg', 'every man'], ['rmṯ', 'm', 'sg', 'all people'], ['ḫt', 'f', 'sg', 'everything (every thing)'],
    ['njwt', 'f', 'sg', 'every town'], ['nṯrw', 'm', 'pl', 'all the gods'], ['ḫꜣst', 'f', 'sg', 'every foreign land'], ['pr', 'm', 'sg', 'every house'], ['zꜣt', 'f', 'sg', 'every daughter']];
  G('me1.nb', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2), p = pick(R, NBP), nb = agree('nb', p[1], p[2]), ph = p[0] + ' ' + nb;
    var why = T('nb') + ' after a noun means "every, all" and agrees like an adjective: ' + T(p[0]) + ' is ' + (p[2] === 'pl' ? 'masculine plural, so ' + T('nbw') : p[1] === 'f' ? 'feminine, so ' + T('nbt') : 'masculine, so ' + T('nb')) + ': ' + T(ph) + ' ' + Q(p[3]) + '.';
    if (kind === 0) return { q: 'Write ' + Q(p[3]) + ' (' + T(p[0]) + ', ' + (p[1] === 'f' ? 'feminine' : 'masculine') + (p[2] === 'pl' ? ' plural' : '') + '). Type the transliteration.', a: tla(ph),
      steps: [why], hint: 'Noun first, then nb with the right ending.' };
    if (kind === 1) return { q: 'Which phrase means ' + Q(p[3]) + '?', a: mc(T(ph), [T(nb + ' ' + p[0]), T(p[0] + ' ' + (nb === 'nb' ? 'nbt' : 'nb')), T('nb ' + p[0])]),
      steps: [why, 'Before a noun, ' + T('nb') + ' is the noun "lord": ' + T('nb ' + p[0]) + ' would be "the lord of ' + p[3].replace(/^(every|all the|all) /, 'the ').replace(/^everything.*/, 'things') + '".'], hint: 'nb "every" comes after the noun.' };
    var pr2 = pick(R, [['nb tꜣwj', 'the lord of the Two Lands', 'every land'], ['tꜣ nb', 'every land', 'the lord of the land'], ['nb pt', 'the lord of the sky', 'every sky'], ['hrw nb', 'every day', 'the lord of the day'], ['nbt pr', 'the lady of the house', 'every house'], ['pr nb', 'every house', 'the lord of the house']]);
    return { q: 'What does ' + T(pr2[0]) + ' mean?', a: mc(pr2[1], [pr2[2], 'the golden ' + pr2[0].split(' ').filter(function (x) { return !/^nbt?$/.test(x); })[0].replace('tꜣwj', 'Two Lands').replace('tꜣ', 'land').replace('pt', 'sky').replace('hrw', 'day').replace('pr', 'house')]),
      steps: ['The basket ' + sg('V30', 1.2) + ' writes both words. Its place decides: first, it is the noun ' + T('nb') + ' "lord" (or ' + T('nbt') + ' "lady") in a genitive; after a noun, it is ' + T('nb') + ' "every".', T(pr2[0]) + ' = ' + Q(pr2[1]) + '.'], hint: 'Is nb first or second?' };
  });

  // demonstratives: [English, noun, gender, form]
  var DEM = { pn: ['this', 'm'], tn: ['this', 'f'], pf: ['that', 'm'], tf: ['that', 'f'] };
  var DEM_NOUNS = ['z', 'zꜣ', 'zꜣt', 'snt', 'nṯr', 'nṯrt', 'pr', 'njwt', 'ḥmt', 'sš', 'tꜣ', 'ḫꜣst'];
  function vocx(t) { return voc(t) || (t === 'z' ? ['z', 'm', 'man', null, null] : null); }
  G('me1.demonstratives', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 3);
    var n = vocx(pick(R, DEM_NOUNS)), far = L > 1 && R.chance(0.35), d = n[1] === 'f' ? (far ? 'tf' : 'tn') : (far ? 'pf' : 'pn');
    var en = DEM[d][0] + ' ' + n[2], ph = n[0] + ' ' + d;
    var why = T(d) + ' ' + Q(DEM[d][0]) + ' is the ' + (n[1] === 'f' ? 'feminine' : 'masculine') + ' form, and it follows the noun: ' + T(ph) + ' ' + Q(en) + '.';
    if (kind === 0) return { q: 'Write ' + Q(en) + ' (' + T(n[0]) + ' ' + Q(n[2]) + ', ' + (n[1] === 'f' ? 'feminine' : 'masculine') + ') with pn, tn, pf or tf. Type the transliteration.', a: tla(ph),
      steps: [why, 'pn / tn "this", pf / tf "that": p for masculine, t for feminine.'], hint: 'Noun first; t-forms for feminine nouns.' };
    if (kind === 1) {
      var other = n[1] === 'f' ? (far ? 'pf' : 'pn') : (far ? 'tf' : 'tn'), near = far ? (n[1] === 'f' ? 'tn' : 'pn') : (n[1] === 'f' ? 'tf' : 'pf');
      return { q: 'Which phrase means ' + Q(en) + '?', a: mc(T(ph), [T(d + ' ' + n[0]), T(n[0] + ' ' + other), T(n[0] + ' ' + near)]), steps: [why], hint: 'pn and tn follow their noun.' };
    }
    if (kind === 2) {
      var pa = n[1] === 'f' ? 'tꜣ' : 'pꜣ', ph2 = pa + ' ' + n[0];
      return { q: 'What does ' + T(ph2) + ' mean?', a: mc('this ' + n[2], R.shuffle(['the ' + n[2] + ' of this', 'these ' + (EN_PL[n[2]] || n[2] + 's'), n[2] + ' is this'])),
        steps: [T('pꜣ') + ' (masculine), ' + T('tꜣ') + ' (feminine) and ' + T('nꜣ') + ' (plural, with ' + T('n') + ') are demonstratives that come BEFORE the noun: ' + T(ph2) + ' ' + Q('this ' + n[2]) + '.', 'In Late Egyptian they became the definite article "the".'], hint: 'pꜣ and tꜣ go first.' };
    }
    var pl = pick(R, [['nṯrw', 'gods'], ['zꜣw', 'sons'], ['sšw', 'scribes'], ['prw', 'houses']]);
    return { q: 'Which phrase means ' + Q('these ' + pl[1]) + '?', a: mc(T('nn n ' + pl[0]), [T(pl[0] + ' nn'), T(pl[0] + ' pn'), T('nn ' + pl[0] + ' pn')]),
      steps: ['For "these", Middle Egyptian uses ' + T('nn') + ' before the noun, joined by the genitive ' + T('n') + ': ' + T('nn n ' + pl[0]) + ', literally "these of ' + pl[1] + '".', T('pn') + ' and ' + T('tn') + ' are singular and follow their noun.'], hint: 'nn comes first, with n.' };
  });

  /* ================================================================ Unit 7: pronouns */
  var SUF_NOUN_POOL = ['pr', 'rn', 'zꜣ', 'zꜣt', 'sn', 'snt', 'jt', 'mwt', 'nb', 'njwt', 'ḥmt', 'jb', 'nṯr'];
  function suf(n, p) { return n + '=' + p[4]; }
  function possEn(n, p) { return p[2] + ' ' + n[2]; }
  G('me1.suffix', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 3);
    var ps = L === 1 ? PRON.filter(function (x) { return ['1s', '2sm', '3sm', '3sf'].indexOf(x[0]) >= 0; }) : PRON;
    var n = voc(pick(R, SUF_NOUN_POOL)), p = pick(R, ps), ph = suf(n[0], p), en = possEn(n, p);
    var why = 'The suffix pronoun ' + T('=' + p[4]) + ' ' + Q(p[2]) + ' is attached to the end of the noun: ' + T(ph) + ' ' + Q(en) + '.';
    if (kind === 0) return { q: 'Write ' + Q(en) + ' (' + T(n[0]) + ' ' + Q(n[2]) + '). Type the transliteration.', a: tla(ph), steps: [why], hint: 'Noun first, then = and the suffix.' };
    if (kind === 1) {
      var wr = R.shuffle(PRON.filter(function (x) { return x !== p && x[4] !== p[4]; })).slice(0, 3).map(function (x) { return possEn(n, x); });
      if (p[0] === '3sm') wr.unshift(possEn(n, pron('3sf'))); if (p[0] === '3sf') wr.unshift(possEn(n, pron('3sm')));
      return { q: 'What does ' + T(ph) + ' mean?', a: mc(en, wr), steps: [why, '=f is "he, his"; =s is "she, her".'], hint: 'Which person is ' + EG().show('=' + p[4]) + '?' };
    }
    if (kind === 2) {
      var sn = pick(R, SUF_NOUNS), pk = pick(R, ['j', 'k', 'ṯ', 'f', 's']), pp = PRON.filter(function (x) { return x[4] === pk; })[0];
      var codes = EG().codes(sn[0]).concat([SUF_SIGN[pk]]);
      return { q: 'Read this noun with its suffix pronoun. Type the transliteration (use = before the suffix if you like).', viz: glyphs({ sp: sn[0] + '-' + SUF_SIGN[pk], tl: sn[1] + '=' + pk, en: pp[2] + ' ' + sn[2] }), a: tla(sn[1] + '=' + pk),
        steps: [sgs(EG().codes(sn[0]), 1.2) + ' is ' + T(sn[1]) + ' ' + Q(sn[2]) + '.', sg(SUF_SIGN[pk], 1.2) + ' is the suffix ' + T('=' + pk) + ' ' + Q(pp[2]) + (pk === 'j' ? ' (the seated man stands for "I, my"; the j is often not written at all).' : '.'), 'Together: ' + T(sn[1] + '=' + pk) + ' ' + Q(pp[2] + ' ' + sn[2]) + '.'],
        hint: 'The last sign is the pronoun.' };
    }
    return { q: 'Which suffix pronoun means ' + Q(p[1] + ', ' + p[2]) + '?', a: mc(T('=' + p[4]), PRON.filter(function (x) { return x[4] !== p[4]; }).map(function (x) { return T('=' + x[4]); }).concat([T(p[5])])),
      steps: ['The suffix pronouns: ' + PRON.map(function (x) { return T('=' + x[4]) + ' ' + x[1]; }).join(', ') + '.', 'So ' + Q(p[1] + ', ' + p[2]) + ' is ' + T('=' + p[4]) + '.'], hint: 'k for a man, ṯ for a woman; f he, s she.' };
  });

  // prepositions and their meanings
  var PREP = [['m', 'in, from, as'], ['n', 'to, for'], ['r', 'to, toward'], ['ḥr', 'on, upon'], ['ḫr', 'with, near (a person)'], ['ḥnꜥ', 'with (together with)'], ['jn', 'by (the doer of an action)'], ['mj', 'like']];
  var PREP_EN = { m: 'in', n: 'to', r: 'toward', 'ḥr': 'on', 'ḫr': 'near', 'ḥnꜥ': 'with', mj: 'like' };
  function prepSuf(pr, p) { return (pr === 'm' ? 'jm' : pr) + '=' + p[4]; }
  G('me1.suffix-uses', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2);
    var p = pick(R, PRON.filter(function (x) { return x[0] !== '1p' || L > 1; }));
    if (kind === 0) {
      var pr = pick(R, ['n', 'r', 'ḥr', 'ḥnꜥ', 'mj']), ph = prepSuf(pr, p), en = PREP_EN[pr] + ' ' + p[3];
      var n = voc(pick(R, SUF_NOUN_POOL));
      return { q: 'What does ' + T(ph) + ' mean?', a: mc(en, R.shuffle(PRON.filter(function (x) { return x[3] !== p[3]; })).slice(0, 2).map(function (x) { return PREP_EN[pr] + ' ' + x[3]; }).concat([PREP_EN[pick(R, ['n', 'r', 'ḥr', 'ḥnꜥ', 'mj'].filter(function (x) { return PREP_EN[x] !== PREP_EN[pr]; }))] + ' ' + p[3]])),
        steps: ['After a preposition the suffix pronoun is its object: ' + T(pr) + ' ' + Q(PREP_EN[pr]) + ' + ' + T('=' + p[4]) + ' ' + Q(p[3]) + ' = ' + Q(en) + '.', 'After a noun the same suffix is possessive: ' + T(suf(n[0], p)) + ' ' + Q(possEn(n, p)) + '.'], hint: 'On a preposition, the suffix is "me, you, him…".' };
    }
    if (kind === 1) {
      var n2 = voc(pick(R, SUF_NOUN_POOL)), ph2 = suf(n2[0], p), wr = [p[1] + ' ' + n2[2], 'to ' + p[3], possEn(n2, pick(R, PRON.filter(function (x) { return x !== p; })))];
      return { q: 'What does ' + T(ph2) + ' mean?', a: mc(possEn(n2, p), wr), steps: ['On a noun, a suffix pronoun is possessive: ' + T(ph2) + ' ' + Q(possEn(n2, p)) + '.', 'It always comes after the noun, unlike English "his" or "her".'], hint: 'Noun + suffix = "my, your, his…".' };
    }
    var pr3 = pick(R, ['n', 'r', 'ḥr', 'ḥnꜥ']), en3 = PREP_EN[pr3] + ' ' + p[3];
    return { q: 'Write ' + Q(en3) + ' (' + T(pr3) + ' ' + Q(PREP_EN[pr3]) + ' with a suffix pronoun). Type the transliteration.', a: tla(prepSuf(pr3, p)),
      steps: ['Preposition + suffix: ' + T(prepSuf(pr3, p)) + '.'], hint: 'The pronoun goes on the end.' };
  });

  G('me1.dependent', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 3), p = pick(R, PRON);
    var table = PRON.map(function (x) { return T(x[5]) + ' ' + x[3]; }).join(', ');
    if (kind === 0) return { q: 'Type the dependent pronoun for ' + Q(p[3]) + '.', a: tla(depAcc(p[5])),
      steps: ['The dependent pronouns: ' + table + '.', Q(p[3]) + ' is ' + T(p[5]) + (p[5] === 'sj' ? ' (older books write sy or sỉ).' : '.')], hint: 'w-, ṯ- and s- forms: wj, ṯw, sw, sj…' };
    if (kind === 1) {
      var others5 = R.shuffle(PRON.filter(function (x) { return x[5] !== p[5]; }));
      var wr = [p[4] === p[5] ? T(others5[1][5]) : T('=' + p[4]), T(p[6]), T(others5[0][5])];
      return { q: 'Which pronoun completes ' + T('mk') + ' ___ ' + T('m pr') + ' ' + Q('look, ' + p[1] + ' ' + (p[0] === '1s' ? 'am' : /^(we|they|you)/.test(p[1]) ? 'are' : 'is') + ' in the house') + '?', a: mc(T(p[5]), wr),
        steps: ['After ' + T('mk') + ' "look" the subject is a dependent pronoun.', 'For ' + Q(p[1].replace(/ \(.*\)/, '')) + ' that is ' + T(p[5]) + ': ' + T('mk ' + p[5] + ' m pr') + '.'], hint: 'mk takes a dependent pronoun.' };
    }
    if (kind === 2) {
      var q = pick(R, PRON.filter(function (x) { return x[5] !== x[4]; })), forms = [['=' + q[4], 'a suffix pronoun'], [q[5], 'a dependent pronoun'], [q[6], 'an independent pronoun']], f = pick(R, forms);
      return { q: 'What kind of pronoun is ' + T(f[0]) + ' ' + Q(q[3]) + '?', a: mc(f[1], ['a suffix pronoun', 'a dependent pronoun', 'an independent pronoun'].filter(function (x) { return x !== f[1]; }), 3),
        steps: ['For ' + Q(q[3]) + ': suffix ' + T('=' + q[4]) + ', dependent ' + T(q[5]) + ', independent ' + T(q[6]) + '.', T(f[0]) + ' is ' + f[1] + '.'], hint: 'Suffixes attach with =; independent pronouns start with jn- or nt-.' };
    }
    var ad = pick(R, ADJ), p2 = pick(R, PRON.filter(function (x) { return ['1s', '3sm', '3sf', '2sm'].indexOf(x[0]) >= 0; }));
    return { q: 'An adjective with a dependent pronoun after it makes a sentence. Which means ' + Q(p2[1].replace(/ \(.*\)/, '') + ' ' + (p2[0] === '1s' ? 'am' : p2[0] === '2sm' ? 'are' : 'is') + ' ' + ad[1]) + (p2[0] === '2sm' ? ' (said to a man)' : '') + '?', a: mc(T(ad[0] + ' ' + p2[5]), [T(ad[0] + '=' + p2[4]), T(p2[5] + ' ' + ad[0]), T(p2[6] + ' ' + ad[0])]),
      steps: ['The dependent pronoun ' + T(p2[5]) + ' ' + Q(p2[3]) + ' is the subject after the adjective: ' + T(ad[0] + ' ' + p2[5]) + '.', T(ad[0] + '=' + p2[4]) + ' would use a suffix, which does not stand as a subject here.'], hint: 'Dependent pronouns follow the word they depend on.' };
  });

  G('me1.independent', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2), p = pick(R, L === 1 ? PRON.filter(function (x) { return /s/.test(x[0]); }) : PRON);
    if (kind === 0) return { q: 'Type the independent pronoun for ' + Q(p[1]) + '.', a: tla(p[6]),
      steps: ['The independent pronouns: ' + PRON.map(function (x) { return T(x[6]) + ' ' + x[1]; }).join(', ') + '.', 'They are built on ' + T('jn-') + ' (first person) and ' + T('nt-') + ' plus the suffix (second and third): ' + T(p[6]) + '.'], hint: 'nt + the suffix pronoun (jnk for "I").' };
    var nn = pick(R, [['zꜣ', 'son'], ['jt', 'father'], ['nb', 'lord'], ['sn', 'brother'], ['sš', 'scribe']]);
    var who = pick(R, PRON.filter(function (x) { return ['1s', '2sm', '3sm'].indexOf(x[0]) >= 0; })), poss = pick(R, PRON.filter(function (x) { return x !== who && ['1s', '2sm', '3sm'].indexOf(x[0]) >= 0; }));
    var ph = who[6] + ' ' + nn[0] + '=' + poss[4];
    var be = who[0] === '1s' ? 'am' : who[0] === '2sm' ? 'are' : 'is', subj = who[1].replace(/ \(.*\)/, '');
    var en = cap(subj) + ' ' + be + ' ' + poss[2].replace(/ \(.*\)/, '') + ' ' + nn[1] + '.';
    var other = pick(R, PRON.filter(function (x) { return x !== who && ['1s', '2sm', '3sm'].indexOf(x[0]) >= 0; })), osubj = other[1].replace(/ \(.*\)/, '');
    if (kind === 1) return { q: 'Translate: ' + T(ph), a: mc(en, [cap(osubj) + ' ' + (other[0] === '1s' ? 'am' : other[0] === '2sm' ? 'are' : 'is') + ' ' + poss[2].replace(/ \(.*\)/, '') + ' ' + nn[1] + '.', cap(poss[2].replace(/ \(.*\)/, '')) + ' ' + nn[1] + ' and ' + (who[0] === '1s' ? 'I' : subj) + '.', cap(subj) + ' ' + be + ' ' + pick(R, PRON.filter(function (x) { return x[2] !== poss[2]; }))[2].replace(/ \(.*\)/, '') + ' ' + nn[1] + '.']),
      steps: [T(who[6]) + ' ' + Q(who[1]) + ' stands first as the subject; ' + T(nn[0] + '=' + poss[4]) + ' ' + Q(poss[2] + ' ' + nn[1]) + ' is the predicate.', 'So: ' + en], hint: 'Independent pronoun + noun = "I am…, you are…".' };
    return { q: 'Which sentence means ' + Q(en) + '?', a: mc(T(ph), [T(who[5] + ' ' + nn[0] + '=' + poss[4]), T(nn[0] + '=' + poss[4] + ' ' + who[6]), T(other[6] + ' ' + nn[0] + '=' + poss[4])]),
      steps: ['A sentence "I am X" uses an independent pronoun first: ' + T(ph) + '.', 'A dependent pronoun cannot begin a sentence like this.'], hint: 'Start with jnk, ntk, ntf or nts.' };
  });


  /* ================================================================ Unit 8: prepositions */
  var PREP_PH = [['m pr', 'in the house'], ['r njwt', 'to the town'], ['ḥr tꜣ', 'on the earth'], ['mj rꜥ', 'like Ra'], ['ḥnꜥ zꜣ=f', 'with his son'], ['n nṯr', 'for the god'], ['m pt', 'in the sky'],
    ['r ḏw', 'toward the mountain'], ['mj nṯr', 'like a god'], ['ḥnꜥ snt=s', 'with her sister'], ['ḫr nsw', 'with the king (in his presence)'], ['n jt=f', 'to his father'], ['ḥr ḏw', 'on the mountain'], ['jn nsw', 'by the king']];
  var PREP_SIGN = [['G17', 'm'], ['N35', 'n'], ['D21', 'r'], ['D2', 'ḥr']];
  G('me1.prepositions', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 2) : R.int(0, 3);
    if (kind === 0) {
      var p = pick(R, PREP);
      return { q: 'What does the preposition ' + T(p[0]) + ' mean?', a: mc(Q(p[1]), R.shuffle(PREP.filter(function (x) { return x !== p; })).map(function (x) { return Q(x[1]); })),
        steps: [T(p[0]) + ' = ' + Q(p[1]) + '.', p[0] === 'm' ? 'Its sense depends on the context: "in" a place, "from" a place after verbs of leaving, "as" or "being" before a noun of role.' : 'Learn each preposition with a short example phrase.'], hint: 'm in, n to, r toward, ḥr on…' };
    }
    if (kind === 1) {
      var ph = pick(R, PREP_PH);
      return { q: 'Write ' + Q(ph[1]) + '. Type the transliteration.', a: tla(ph[0]),
        steps: ['The preposition comes first, then its noun: ' + T(ph[0]) + ' ' + Q(ph[1]) + '.'], hint: 'Preposition + noun.' };
    }
    if (kind === 2) {
      var s = pick(R, PREP_SIGN), mean = PREP.filter(function (x) { return x[0] === s[1]; })[0][1];
      return { q: 'Standing alone, this sign ' + sg(s[0], 1.8) + ' is a common preposition. Which one?', a: mc(T(s[1]) + ' ' + Q(mean), PREP_SIGN.filter(function (x) { return x !== s; }).map(function (x) { return T(x[1]) + ' ' + Q(PREP.filter(function (y) { return y[0] === x[1]; })[0][1]); })),
        steps: ['The ' + nameOf(s[0]) + ' (' + s[0] + ') writes ' + T(s[1]) + ', and by itself it is the preposition ' + T(s[1]) + ' ' + Q(mean) + '.'], hint: 'Read the sign’s sound.' };
    }
    var it = pick(R, [['jw=f m sš', 'he is a scribe (literally "he is as a scribe")', 'as'], ['prj m pr', 'go out from the house (prj "go out")', 'from'], ['ḥm=f m njwt', 'His Majesty is in the town', 'in'], ['jw=s m nbt pr', 'she is a lady of the house', 'as']]);
    return { q: 'In ' + T(it[0]) + ' ' + Q(it[1]) + ', which English word best renders ' + T('m') + '?', a: mc(Q(it[2]), ['in', 'from', 'as', 'to'].map(Q).filter(function (x) { return x !== Q(it[2]); }), 4),
      steps: [T('m') + ' covers "in", "from" and "as": the context decides. Here it is ' + Q(it[2]) + '.', it[2] === 'as' ? 'This "m of predication" says what someone is: "he is (as) a scribe".' : it[2] === 'from' ? 'After a verb of leaving, m means "from".' : 'With a place, m means "in".'], hint: 'Think about the verb and the noun.' };
  });

  var PS_EN = { n: 'to', r: 'toward', 'ḥr': 'on', 'ḥnꜥ': 'with', mj: 'like', m: 'in' };
  G('me1.prep-suffix', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2);
    var pr = L === 1 ? pick(R, ['m', 'm', 'n', 'ḥnꜥ']) : pick(R, ['m', 'm', 'n', 'r', 'ḥr', 'ḥnꜥ', 'mj']);
    var p = pick(R, PRON), obj = pr === 'm' && (p[0] === '3sm' || p[0] === '3sf') ? 'it' : p[3];
    var ph = prepSuf(pr, p), en = PS_EN[pr] + ' ' + obj + (obj === 'it' ? ' (' + (p[0] === '3sm' ? 'masculine' : 'feminine') + ')' : '');
    var why = pr === 'm' ? 'Before a suffix pronoun, ' + T('m') + ' becomes ' + T('jm') + ': ' + T(ph) + '.' : T(pr) + ' + ' + T('=' + p[4]) + ' = ' + T(ph) + '.';
    if (kind === 0) return { q: 'Write ' + Q(en) + ' with ' + T(pr) + ' and a suffix pronoun. Type the transliteration.', a: tla(ph),
      steps: [why], hint: pr === 'm' ? 'm changes before a suffix.' : 'Preposition, =, suffix.' };
    if (kind === 1) {
      var wr = [pr === 'm' ? 'm=' + p[4] : 'jm=' + p[4], prepSuf(pr, pick(R, PRON.filter(function (x) { return x[4] !== p[4]; })))].concat(p[4] !== p[5] ? [pr + ' ' + p[5]] : [prepSuf(pr, pick(R, PRON.filter(function (x) { return x[4] !== p[4]; })))]);
      return { q: 'Which means ' + Q(en) + '?', a: mc(T(ph), wr.map(function (x) { return T(x); })), steps: [why, 'Prepositions take suffix pronouns, not dependent ones.'], hint: 'Remember jm.' };
    }
    return { q: 'What does ' + T(ph) + ' mean?', a: mc(en, [PS_EN[pr] + ' ' + pick(R, PRON.filter(function (x) { return x[3] !== p[3]; }))[3], p[2].replace(/ \(.*\)/, '') + ' house', (pr === 'm' ? 'from ' : 'in ') + obj]),
      steps: [why, T(ph) + ' = ' + Q(en) + '.'], hint: 'Find the preposition, then the person.' };
  });

  var CPREP = [['m-bꜣḥ', 'in the presence of'], ['m-ḫt', 'after, behind'], ['ḥr-ḥꜣt', 'before, in front of'], ['r-gs', 'beside'], ['m-ẖnw', 'inside, within'], ['m-ꜥ', 'from (a person), in the hand of']];
  G('me1.compound-prepositions', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2), c = pick(R, CPREP);
    if (kind === 0) return { q: 'What does the compound preposition ' + T(c[0]) + ' mean?', a: mc(Q(c[1]), R.shuffle(CPREP.filter(function (x) { return x !== c && x[1].split(',')[0] !== c[1].split(',')[0]; })).map(function (x) { return Q(x[1]); })),
      steps: [T(c[0]) + ' = ' + Q(c[1]) + '. Learn it as one unit; its parts (a simple preposition and a noun) do not always add up to the meaning in English.'], hint: 'Think of the noun inside it.' };
    if (kind === 1) return { q: 'Which compound preposition means ' + Q(c[1]) + '?', a: mc(T(c[0]), R.shuffle(CPREP.filter(function (x) { return x !== c; })).map(function (x) { return T(x[0]); })),
      steps: [Q(c[1]) + ' is ' + T(c[0]) + '.'], hint: 'm-bꜣḥ, m-ḫt, ḥr-ḥꜣt, r-gs…' };
    var obj = pick(R, [['nsw', 'the king'], ['nṯr', 'the god'], ['pr', 'the house'], ['jt=f', 'his father']]), ph = c[0] + ' ' + obj[0];
    return { q: 'Translate ' + T(ph) + '.', a: mc(c[1].split(',')[0] + ' ' + obj[1], R.shuffle(CPREP.filter(function (x) { return x !== c && x[1].split(',')[0] !== c[1].split(',')[0]; })).slice(0, 2).map(function (x) { return x[1].split(',')[0] + ' ' + obj[1]; }).concat([obj[1] + ' ' + c[1].split(',')[0]])),
      steps: [T(c[0]) + ' ' + Q(c[1]) + ' + ' + T(obj[0]) + ' ' + Q(obj[1]) + '.'], hint: 'The compound works like one preposition.' };
  });

  /* ================================================================ Unit 9: sentences without verbs */
  var SUBJ = [['z', 'the man', 'm'], ['sš', 'the scribe', 'm'], ['nb', 'the lord', 'm'], ['zꜣ=f', 'his son', 'm'], ['ḥm=f', 'His Majesty', 'm'], ['nṯr', 'the god', 'm'], ['snt=j', 'my sister', 'f'], ['zꜣt=s', 'her daughter', 'f'], ['ḥqꜣ', 'the ruler', 'm']];
  var PRED = [['m pr', 'in the house'], ['m njwt', 'in the town'], ['ḥnꜥ=f', 'with him'], ['ḥnꜥ=j', 'with me'], ['m pr nsw', 'in the house of the king'], ['ḥr ḏw', 'on the mountain'], ['m ḫꜣst', 'in the foreign land']];
  function beIs(s) { return /^(his son|her daughter|my sister|His Majesty|the .*)$/.test(s) ? 'is' : 'is'; }
  G('me1.adverbial', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2), s = pick(R, SUBJ), p = pick(R, PRED.filter(function (x) { return !(s[0] === 'zꜣ=f' && x[0] === 'ḥnꜥ=f'); }));
    var ph = s[0] + ' ' + p[0], en = cap(s[1]) + ' is ' + p[1] + '.';
    if (kind === 0) return { q: 'Translate: ' + T(ph), a: mc(en, ['Put ' + s[1] + ' ' + p[1] + '!', cap(s[1]) + ' is not ' + p[1] + '.', /=/.test(p[0]) ? 'Is ' + s[1].replace(/^The/, 'the') + ' ' + p[1] + '?' : cap(s[1]) + ' of ' + p[1].replace(/^(in|with|on) (the )?/, 'the ') + '.']),
      steps: ['Subject first, then where it is: ' + T(s[0]) + ' ' + Q(s[1]) + ' + ' + T(p[0]) + ' ' + Q(p[1]) + '.', 'Egyptian needs no verb "is": subject + adverbial phrase is a whole sentence: ' + Q(en)], hint: 'Subject, then a prepositional phrase.' };
    if (kind === 1) return { q: 'Write in Egyptian: ' + Q(en) + ' Type the transliteration (no word for "is" is needed).', a: tla([ph, 'jw ' + ph]),
      steps: ['Subject: ' + T(s[0]) + '. Where: ' + T(p[0]) + '.', 'Sentence: ' + T(ph) + '. (In a main clause it often begins with ' + T('jw') + ' or ' + T('mk') + ', the next lesson.)'], hint: 'There is no verb to add.' };
    return { q: 'Which of these is a complete sentence meaning ' + Q(en) + '?', a: mc(T(ph), [T(p[0] + ' ' + s[0]), T(s[0] + ' ' + p[0].replace(/^(m|ḥnꜥ|ḥr) /, '')), T(s[0] + ' pw ' + p[0])]),
      steps: ['Subject + adverbial predicate: ' + T(ph) + '.', 'Without the preposition, two nouns side by side would be a genitive, not this sentence.'], hint: 'Keep the preposition, and put the subject first.' };
  });

  G('me1.jw-mk', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 3), p = pick(R, PRON.filter(function (x) { return x[0] !== '2p'; })), pr = pick(R, PRED.filter(function (x) { return !(new RegExp('=' + p[4] + '$').test(x[0])); }));
    var be = p[0] === '1s' ? 'am' : /^(we|they|you)/.test(p[1]) ? 'are' : 'is', subj = p[1].replace(/ \(.*\)/, ''), who = p[1].indexOf('(') > 0 ? ' (' + p[1].replace(/^.*\((.*)\)$/, '$1') + ')' : '';
    var enJ = cap(subj) + ' ' + be + ' ' + pr[1] + '.', enM = 'Look, ' + subj + ' ' + be + ' ' + pr[1] + '!';
    if (kind === 0) return { q: 'Which pronoun completes ' + T('jw') + ' ___ ' + T(pr[0]) + ' ' + Q(enJ.replace('.', '') + who) + '?', a: mc(T('jw=' + p[4]), [p[4] !== p[5] ? T('jw ' + p[5]) : T('jw=' + PRON.filter(function (x) { return x[4] !== p[4]; })[0][4]), T('jw ' + p[6]), T('jw=' + pick(R, PRON.filter(function (x) { return x[4] !== p[4]; }))[4])]),
      steps: [T('jw') + ' takes a suffix pronoun as its subject: ' + T('jw=' + p[4] + ' ' + pr[0]) + '.', 'Compare ' + T('mk') + ', which takes a dependent pronoun: ' + T('mk ' + p[5] + ' ' + pr[0]) + '.'], hint: 'jw + suffix; mk + dependent.' };
    if (kind === 1) return { q: 'Which pronoun completes ' + T('mk') + ' ___ ' + T(pr[0]) + ' ' + Q(enM.replace('!', '') + who) + '?', a: mc(T('mk ' + p[5]), [p[4] !== p[5] ? T('mk=' + p[4]) : T('mk ' + p[6]), T('mk ' + p[6]), T('mk ' + pick(R, PRON.filter(function (x) { return x[5] !== p[5]; }))[5])]),
      steps: [T('mk') + ' "look" takes a dependent pronoun: ' + T('mk ' + p[5] + ' ' + pr[0]) + '.', 'With ' + T('jw') + ' it would be the suffix: ' + T('jw=' + p[4] + ' ' + pr[0]) + '.'], hint: 'mk + dependent pronoun.' };
    if (kind === 2) {
      var useJ = R.coin(), ans = useJ ? 'jw=' + p[4] + ' ' + pr[0] : 'mk ' + p[5] + ' ' + pr[0];
      return { q: 'Write in Egyptian with ' + T(useJ ? 'jw' : 'mk') + ': ' + Q((useJ ? enJ : enM) + who) + ' Type the transliteration.', a: tla(useJ ? ans : depAcc(p[5]).map(function (d) { return 'mk ' + d + ' ' + pr[0]; })),
        steps: [useJ ? T('jw') + ' + suffix pronoun ' + T('=' + p[4]) + ' + ' + T(pr[0]) + '.' : T('mk') + ' + dependent pronoun ' + T(p[5]) + ' + ' + T(pr[0]) + '.', T(ans) + '.'], hint: useJ ? 'jw takes a suffix.' : 'mk takes a dependent pronoun.' };
    }
    return bank(R, ctx, [
      { q: 'How is ' + T('jw') + ' usually rendered in an English translation of ' + T('jw=f m pr') + '?', a: 'It is usually left untranslated: "He is in the house."', w: ['as "and": "And he is in the house."', 'as "look": "Look, he is in the house!"', 'as "was": "He was in the house."'], s: [T('jw') + ' marks the sentence as a statement in its own right; English has no word for it.', 'Translate the sentence without it: "He is in the house."'], h: 'English has no word for jw.' },
      { q: 'What does ' + T('mk') + ' add to a sentence?', a: 'It points to something: "look!", "see!"', w: ['It makes the sentence a question.', 'It makes the sentence negative.', 'It puts the sentence in the past.'], s: [T('mk') + ' (from the verb "see") draws attention: ' + T('mk wj m pr') + ' "look, I am in the house".'], h: 'It comes from the verb "see".' }
    ]);
  });

  var NOM = [['sš', 'a scribe'], ['zꜣ=k', 'your son'], ['nb=k', 'your lord'], ['jt=k', 'your father'], ['sn=f', 'his brother'], ['ḥm-nṯr', 'a priest'], ['bꜣk=k', 'your servant'], ['nb tꜣwj', 'the lord of the Two Lands']];
  G('me1.nominal', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2), n = pick(R, NOM), p = pick(R, PRON.filter(function (x) { return ['1s', '3sm', '2sm'].indexOf(x[0]) >= 0 && !(x[0] === '2sm' && /=k/.test(n[0])); }));
    var ph = p[6] + ' ' + n[0], subj = p[1].replace(/ \(.*\)/, ''), be = p[0] === '1s' ? 'am' : p[0] === '2sm' ? 'are' : 'is', en = cap(subj) + ' ' + be + ' ' + n[1] + '.';
    if (kind === 0) return { q: 'Translate: ' + T(ph), a: mc(en, [cap(p[2].replace(/ \(.*\)/, '')) + ' ' + n[1].replace(/^(a|your|his|the) /, '') + '.', (p[0] === '3sm' ? 'I am ' : 'He is ') + n[1] + '.', cap(subj) + ' ' + be + ' not ' + n[1] + '.']),
      steps: ['An independent pronoun followed by a noun phrase says who someone is: ' + T(p[6]) + ' ' + Q(p[1]) + ' + ' + T(n[0]) + ' ' + Q(n[1]) + '.', Q(en)], hint: 'jnk "I", ntk "you", ntf "he" + a noun.' };
    if (kind === 1) return { q: 'Write in Egyptian: ' + Q(en) + (p[0] === '2sm' ? ' (said to a man)' : '') + ' Type the transliteration.', a: tla(ph),
      steps: ['Independent pronoun first: ' + T(p[6]) + '. Then the noun phrase: ' + T(n[0]) + '.', T(ph) + '.'], hint: 'Begin with an independent pronoun.' };
    var pairs = [['pr nsw', 'phrase', 'the house of the king'], ['jnk sš', 'sentence', 'I am a scribe'], ['zꜣ nsw', 'phrase', 'the son of the king'], ['ntk zꜣ=j', 'sentence', 'you are my son'], ['nb tꜣwj', 'phrase', 'the lord of the Two Lands'], ['ntf jt=j', 'sentence', 'he is my father']];
    var pp = pick(R, pairs);
    return { q: 'Is ' + T(pp[0]) + ' a noun phrase or a whole sentence?', a: { t: 'mc', choices: ['a noun phrase (a direct genitive)', 'a whole sentence (A is B)'], v: pp[1] === 'phrase' ? 0 : 1, keep: true },
      steps: [T(pp[0]) + ' = ' + Q(pp[2]) + '.', pp[1] === 'phrase' ? 'Two nouns side by side are normally a direct genitive.' : 'An independent pronoun at the head makes it a sentence.'], hint: 'Does it begin with an independent pronoun?' };
  });

  var PWN = [['zꜣ=j', 'my son'], ['nṯr', 'a god'], ['pr nsw', 'the house of the king'], ['sš', 'a scribe'], ['jt=f', 'his father'], ['njwt=f', 'his town'], ['nbt pr', 'the lady of the house'], ['ḥm-nṯr', 'a priest']];
  G('me1.pw', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2), n = pick(R, PWN), ph = n[0] + ' pw', en = 'It is ' + n[1] + '.';
    var wr = n[0].indexOf(' ') > 0 ? n[0].split(' ')[0] + ' pw ' + n[0].split(' ')[1] : 'pw ' + n[0];
    if (kind === 0) return { q: 'Translate: ' + T(ph), a: mc(en, ['this ' + n[1].replace(/^(a|my|his|the) /, '') + ' (a phrase)', cap(n[1]) + ' is here.', 'Is it ' + n[1] + '?']),
      steps: [T('pw') + ' after a noun phrase makes a sentence "it is…" (or "he is…, she is…" when the context is a person): ' + Q(en), 'It is not the demonstrative "this" (' + T('pn') + ').'], hint: 'Noun + pw = "it is (noun)".' };
    if (kind === 1) return { q: 'Write ' + Q(en) + ' with ' + T('pw') + '. Type the transliteration.', a: tla(ph),
      steps: [T('pw') + ' comes after the whole noun phrase: ' + T(ph) + '.'], hint: 'pw goes last here.' };
    return { q: 'Where does ' + T('pw') + ' go in ' + Q(en) + '?', a: mc(T(ph), [T('pw ' + n[0]), T(wr), T(n[0] + ' pn')]),
      steps: [T('pw') + ' follows the first noun phrase (here the whole phrase ' + T(n[0]) + '): ' + T(ph) + '.'], hint: 'Not at the start.' };
  });

  var ADJS = [['nfr', 'good'], ['wr', 'great'], ['ꜥꜣ', 'great'], ['nḏs', 'small'], ['bjn', 'bad'], ['wꜥb', 'pure']];
  var ADJ_SUBJ = [['sw', 'he'], ['sj', 'she'], ['st', 'it'], ['wj', 'I'], ['pr=f', 'his house'], ['rn=s', 'her name'], ['nṯr', 'the god'], ['snt=j', 'my sister']];
  G('me1.adjectival', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2), a = pick(R, ADJS), s = pick(R, ADJ_SUBJ);
    var ph = a[0] + ' ' + s[0], be = s[1] === 'I' ? 'am' : 'is', en = cap(s[1]) + ' ' + be + ' ' + a[1] + '.';
    var acc = s[0] === 'sj' ? [a[0] + ' sj', a[0] + ' sy'] : ph;
    var attr = /=/.test(s[0]) || s[0] === 'nṯr' ? s[0] + ' ' + a[0] : null;
    if (kind === 0) return { q: 'Translate: ' + T(ph), a: mc(en, [attr ? cap(s[1]) + ', ' + (s[1] === 'the god' ? 'who is ' + a[1] : 'the ' + a[1] + ' one') : 'a ' + a[1] + ' ' + (s[1] === 'I' ? 'me' : s[1] === 'he' ? 'him' : s[1] === 'she' ? 'her' : 'it'), cap(s[1]) + ' ' + be + ' not ' + a[1] + '.', 'Make ' + (s[1] === 'I' ? 'me' : s[1] === 'he' ? 'him' : s[1] === 'she' ? 'her' : s[1]) + ' ' + a[1] + '!']),
      steps: ['An adjective first, then its subject, makes a sentence: ' + T(a[0]) + ' ' + Q(a[1]) + ' + ' + T(s[0]) + ' ' + Q(s[1]) + '.', Q(en) + ' (The adjective has no ending here, even with a feminine subject.)'], hint: 'Adjective first = "… is …".' };
    if (kind === 1) return { q: 'Write in Egyptian: ' + Q(en) + ' Type the transliteration.', a: tla(acc),
      steps: ['Adjective first, then the subject (' + (/^(sw|sj|st|wj)$/.test(s[0]) ? 'a dependent pronoun' : 'a noun') + '): ' + T(ph) + '.'], hint: 'Adjective, then subject.' };
    var noun = pick(R, [['pr=f', 'his house'], ['nṯr', 'the god'], ['rn=s', 'her name'], ['zꜣ=k', 'your son']]);
    var pair = R.coin();
    var A = a[0] + ' ' + noun[0], B = noun[0] + ' ' + a[0];
    return { q: 'What does ' + T(pair ? A : B) + ' mean?', a: mc(pair ? cap(noun[1]) + ' is ' + a[1] + '.' : cap(noun[1].replace(/^(his|her|your|the) /, '$1 ' + a[1] + ' ')) + ' (a phrase)', [pair ? cap(noun[1].replace(/^(his|her|your|the) /, '$1 ' + a[1] + ' ')) + ' (a phrase)' : cap(noun[1]) + ' is ' + a[1] + '.', 'How ' + a[1] + ' is ' + noun[1] + '?']),
      steps: [T(A) + ': adjective first, a sentence, ' + Q(cap(noun[1]) + ' is ' + a[1] + '.'), T(B) + ': adjective after the noun, a phrase, ' + Q(noun[1].replace(/^(his|her|your|the) /, '$1 ' + a[1] + ' ')) + '.'], hint: 'Order decides: first = sentence, after = description.' };
  });


  /* ================================================================ Unit 10: numbers and dates */
  var NUMSIGN = [[1, 'Z1', 'a single stroke'], [10, 'V20', 'a hobble for cattle'], [100, 'V1', 'a coil of rope'], [1000, 'M12', 'a lotus plant'], [10000, 'D50', 'a finger'], [100000, 'I8', 'a tadpole'], [1000000, 'C11', 'the god Heh with raised arms']];
  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function numBreak(n) { var E = EG(), cs = E.numberSigns(n), cnt = {}; cs.forEach(function (c) { cnt[c] = (cnt[c] || 0) + 1; }); return NUMSIGN.slice().reverse().filter(function (x) { return cnt[x[1]]; }).map(function (x) { return cnt[x[1]] + ' × ' + sg(x[1], 1.1) + ' (' + commas(x[0]) + ') = ' + commas(cnt[x[1]] * x[0]); }); }
  function randNum(R, L) {
    if (L === 1) return R.int(2, 9) * 10 + R.int(1, 9);
    if (L === 2) return R.int(1, 4) * 1000 + R.int(0, 9) * 100 + R.int(0, 9) * 10 + R.int(1, 9);
    return R.pick([R.int(1, 3) * 100000 + R.int(0, 9) * 10000 + R.int(1, 9) * 100 + R.int(0, 9), R.int(1, 2) * 1000000 + R.int(1, 9) * 10000 + R.int(1, 9) * 10 + R.int(0, 5)]);
  }
  G('me1.numerals', function (R, ctx) {
    var E = EG(), L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 2);
    if (kind === 0) {
      var n = randNum(R, L);
      return { q: 'What number is written here?', viz: glyphs({ num: n }), a: { t: 'num', v: String(n) },
        steps: numBreak(n).concat(['Add them up: ' + commas(n) + '. Each sign is repeated as many times as needed, the largest first in reading order; position does not matter.']), hint: 'Count each kind of sign and multiply by its value.' };
    }
    if (kind === 1) {
      var m = randNum(R, L), unit = pick(R, NUMSIGN.filter(function (x) { return x[0] <= m && x[0] >= (L === 1 ? 1 : 10); })), cnt = Math.floor(m / unit[0]) % 10;
      return { q: 'To write ' + commas(m) + ' in hieroglyphs, how many times do you write ' + sg(unit[1], 1.6) + ' (' + unit[2] + ', ' + commas(unit[0]) + ')?', a: { t: 'num', v: String(cnt) },
        steps: numBreak(m).concat(['So ' + sg(unit[1], 1.1) + ' appears ' + cnt + ' time' + (cnt === 1 ? '' : 's') + (cnt === 0 ? ': that place is simply left out.' : '.')]), hint: 'Look at the matching digit of the number.' };
    }
    var s = pick(R, NUMSIGN);
    return { q: 'Which number does ' + sg(s[1], 2) + ' (' + s[2] + ') stand for?', a: mc(commas(s[0]), NUMSIGN.filter(function (x) { return x !== s; }).map(function (x) { return commas(x[0]); })),
      steps: ['The numeral signs: ' + NUMSIGN.map(function (x) { return sg(x[1], 1.1) + ' ' + commas(x[0]); }).join(', ') + '.', s[2] + ' = ' + commas(s[0]) + '.'], hint: 'Stroke 1, hobble 10, coil 100, lotus 1,000, finger 10,000, tadpole 100,000, Heh 1,000,000.' };
  });

  var CNT_NOUNS = [['zꜣ', 'sons'], ['pr', 'houses'], ['kꜣ', 'bulls'], ['nṯr', 'gods'], ['sš', 'scribes'], ['njwt', 'towns'], ['rmṯ', 'people']];
  var CNT_GLYPH = [['zi', 'men'], ['zat', 'daughters'], ['heqa', 'rulers'], ['ntrt', 'goddesses']];
  G('me1.counting', function (R, ctx) {
    var E = EG(), L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 3);
    if (kind === 0) {
      var c = pick(R, CNT_NOUNS), k = R.int(3, 9);
      return { q: 'In writing, how does Egyptian put ' + Q(k + ' ' + c[1]) + '?', a: { t: 'mc', choices: [T(c[0]) + ' ' + k + ' (the noun, then the number)', k + ' ' + T(c[0]) + ' (the number, then the noun)'], v: 0, keep: true },
        steps: ['As written, the numeral follows the noun it counts: ' + T(c[0]) + ' ' + k + '.', 'English puts the number first; reading an inscription, turn it around: ' + Q(k + ' ' + c[1]) + '.'], hint: 'Opposite to English.' };
    }
    if (kind === 1) {
      var g = pick(R, CNT_GLYPH), w = getW(g[0]), n = L === 1 ? R.int(3, 9) : R.int(11, 59);
      var sp = w.sp + ' ' + E.numberSp(n);
      return { q: 'How many ' + g[1] + ' does this say? The noun is followed by its number.', viz: glyphs({ sp: sp }), a: { t: 'num', v: String(n) },
        steps: ['The word is ' + T(w.tl) + ' ' + Q(w.en) + ', followed by the numeral.'].concat(numBreak(n)).concat(['So: ' + n + ' ' + g[1] + '.']), hint: 'Read the word, then add up the numeral signs after it.' };
    }
    if (kind === 2) {
      var o = pick(R, [['tpj', 'first'], ['snnw', 'second'], ['ḫmtnw', 'third'], ['fdnw', 'fourth']]);
      var wr = [['tpj', 'first'], ['snnw', 'second'], ['ḫmtnw', 'third'], ['fdnw', 'fourth'], ['sn', 'two']].filter(function (x) { return x[0] !== o[0]; }).map(function (x) { return Q(x[1]); });
      return { q: 'What does the ordinal ' + T(o[0]) + ' mean?', a: mc(Q(o[1]), wr),
        steps: [o[0] === 'tpj' ? T('tpj') + ' "first" is a nisbe of ' + T('tp') + ' "head": "the one at the head".' : 'From 2 to 9, ordinals add -nw to the number: ' + T(o[0]) + ' ' + Q(o[1]) + ' (' + T('snnw') + ' from ' + T('sn') + ' "two", ' + T('ḫmtnw') + ' from ' + T('ḫmt') + ' "three").', 'From 10 on, ordinals use ' + T('mḥ') + ' "filling": ' + T('mḥ') + ' 10 "tenth".'], hint: '-nw makes an ordinal.' };
    }
    var t = pick(R, [['snnw', 'second'], ['ḫmtnw', 'third']]);
    return { q: 'Type the ordinal ' + Q(t[1]) + ' in transliteration.', a: tla(t[0]),
      steps: [t[0] === 'snnw' ? T('sn') + ' "two" + -nw = ' + T('snnw') + ' "second".' : T('ḫmt') + ' "three" + -nw = ' + T('ḫmtnw') + ' "third".'], hint: 'number + nw' };
  });

  var SEASONS = [['ꜣḫt', 'Akhet', 'the Flood (Inundation)'], ['prt', 'Peret', 'the Emergence (Growing)'], ['šmw', 'Shemu', 'the Harvest (Low Water)']];
  function ordEn(n) { return ['first', 'second', 'third', 'fourth'][n - 1]; }
  G('me1.dates', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 3);
    var y = R.int(2, 30), si = R.int(0, 2), m = R.int(1, 4), d = R.int(2, 29), S = SEASONS[si];
    var tl = 'ḥꜣt-zp ' + y + ' ꜣbd ' + m + ' ' + S[0] + ' sw ' + d;
    var en = 'Year ' + y + ', ' + ordEn(m) + ' month of ' + S[2] + ', day ' + d;
    var parts = [T('ḥꜣt-zp') + ' ' + y + ' = year ' + y + ' of the king’s reign', T('ꜣbd') + ' ' + m + ' = month ' + m, T(S[0]) + ' = the season ' + S[1] + ', ' + S[2], T('sw') + ' ' + d + ' = day ' + d];
    function tlx(s) { return s.replace(/[^\s\d]+/g, function (w) { return T(w); }); }
    if (kind === 0 || kind === 1) {
      var o = SEASONS[(si + 1) % 3];
      var wr = ['Year ' + d + ', ' + ordEn(m) + ' month of ' + S[2] + ', day ' + y, 'Year ' + y + ', ' + ordEn(m) + ' month of ' + o[2] + ', day ' + d, 'Day ' + y + ', ' + ordEn(m) + ' month of ' + S[2] + ', year ' + d];
      if (d <= 4 && d !== m) wr.push('Year ' + y + ', ' + ordEn(d) + ' month of ' + S[2] + ', day ' + m);
      return { q: 'Translate this date: ' + tlx(tl), a: mc(en, wr),
        steps: parts.concat(['Together: ' + Q(en) + '.', 'Older books read the year group ' + T('rnpt-zp') + '; the year counts from the start of the reigning king’s rule.']), hint: 'Year, month, season, day: in that order.' };
    }
    if (kind === 2) {
      var dayOfYear = (si * 4 + (m - 1)) * 30 + d;
      return { q: 'The civil year had three seasons (' + SEASONS.map(function (x) { return T(x[0]); }).join(', ') + ', in that order) of four 30-day months, then 5 extra days. Counting from the first day of ' + T('ꜣḫt') + ', which day of the year is ' + tlx('ꜣbd ' + m + ' ' + S[0] + ' sw ' + d) + '?', a: { t: 'num', v: String(dayOfYear) },
        steps: ['Full seasons before ' + T(S[0]) + ': ' + si + ' × 4 months = ' + (si * 4) + ' months.', 'Full months before month ' + m + ' of this season: ' + (m - 1) + '. Months before: ' + (si * 4 + m - 1) + ', which is ' + (si * 4 + m - 1) * 30 + ' days.', 'Add the day: ' + (si * 4 + m - 1) * 30 + ' + ' + d + ' = ' + dayOfYear + '.'], hint: 'Count whole months of 30 days, then add the day.' };
    }
    var s2 = pick(R, SEASONS);
    return { q: 'Which season is ' + T(s2[0]) + '?', a: mc(s2[1] + ', ' + s2[2], SEASONS.filter(function (x) { return x !== s2; }).map(function (x) { return x[1] + ', ' + x[2]; })),
      steps: ['The seasons, in order: ' + SEASONS.map(function (x) { return T(x[0]) + ' (' + x[1] + ') ' + x[2]; }).join('; ') + '.', 'Each had four months of 30 days.'], hint: 'The year began with the flood.' };
  });

  /* ================================================================ Unit 11: royal names, offerings and titles */
  var FIVE = [['the Horus name', 'in a serekh, a palace facade topped by the falcon Horus'], ['the Two Ladies name (nbtj)', 'after the vulture and the cobra, the goddesses Nekhbet and Wadjet'], ['the Golden Horus name', 'after the falcon on the sign for gold'], ['the throne name', 'in a cartouche, after nsw-bjt “King of Upper and Lower Egypt”'], ['the birth name', 'in a cartouche, after zꜣ-rꜥ “son of Ra”']];
  var THRONE = [['Thutmose III', 'Menkheperre', 'mn-ḫpr-rꜥ'], ['Tutankhamun', 'Nebkheperure', 'nb-ḫprw-rꜥ'], ['Ramesses II', 'Usermaatre Setepenre', 'wsr-mꜣꜥt-rꜥ stp-n-rꜥ'], ['Amenhotep III', 'Nebmaatre', 'nb-mꜣꜥt-rꜥ'], ['Hatshepsut', 'Maatkare', 'mꜣꜥt-kꜣ-rꜥ'], ['Seti I', 'Menmaatre', 'mn-mꜣꜥt-rꜥ'], ['Akhenaten', 'Neferkheperure Waenre', 'nfr-ḫprw-rꜥ wꜥ-n-rꜥ']];
  G('me1.titulary', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 3);
    if (kind === 0) {
      var i = R.int(0, 4), f = FIVE[i];
      return { q: 'Which of the king’s five names is written ' + f[1] + '?', a: mc(f[0], FIVE.filter(function (x) { return x !== f; }).map(function (x) { return x[0]; })),
        steps: ['The five names, in order: ' + FIVE.map(function (x) { return x[0]; }).join(', ') + '.', cap(f[0]) + ' is written ' + f[1] + '.'], hint: 'Two are in cartouches.' };
    }
    if (kind === 1) {
      var k = pick(R, THRONE), birth = R.coin();
      return { q: birth ? 'Which is the birth name of the king whose throne name was ' + k[1] + '?' : k[1] + ' (' + T(k[2]) + ') was the throne name of which king?', a: mc(k[0], R.shuffle(THRONE.filter(function (x) { return x !== k; })).map(function (x) { return x[0]; })),
        steps: [k[0] + ' is the birth name (after zꜣ-rꜥ); ' + k[1] + ' (' + T(k[2]) + ') is his' + (k[0] === 'Hatshepsut' ? ' (her)' : '') + ' throne name (after nsw-bjt).', 'Modern books usually call kings by their birth names, with numbers for kings of the same name.'], hint: 'Throne names often contain Ra (rꜥ).' };
    }
    if (kind === 2) {
      var k2 = pick(R, THRONE), isT = R.coin(), nm = isT ? k2[1] : k2[0];
      return { q: 'For ' + k2[0] + ', which kind of name is ' + nm + '?', a: mc(isT ? 'the throne name' : 'the birth name', ['the throne name', 'the birth name', 'the Horus name', 'the Golden Horus name'].filter(function (x) { return x !== (isT ? 'the throne name' : 'the birth name'); })),
        steps: [k2[0] + ': throne name ' + k2[1] + ' (' + T(k2[2]) + '), birth name ' + k2[0].replace(/ [IV]+$/, '') + '.', 'The throne name was taken at the coronation; the birth name was given at birth.'], hint: 'Which one was he born with?' };
    }
    var right = FIVE.map(function (x) { return x[0].replace(/ \(.*\)/, '').replace(/^the /, ''); }), seen = {}, wr = [];
    seen[right.join(' → ')] = 1;
    while (wr.length < 3) { var o = R.shuffle(right).join(' → '); if (!seen[o]) { seen[o] = 1; wr.push(o); } }
    return { q: 'Put the five royal names in their usual order.', a: mc(right.join(' → '), wr), steps: ['The usual order: ' + right.join(', ') + '.', 'The last two are in cartouches.'], hint: 'Horus first; the two cartouche names last.' };
  });

  G('me1.cartouches', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 3);
    if (kind === 0) {
      var t = pick(R, [['nsw-bjt', 'the throne name', 'nesubit'], ['zꜣ-rꜥ', 'the birth name', 'zara']]);
      return { q: 'Which name follows the title ' + T(t[0]) + '?', viz: glyphs({ word: t[2] }), a: mc(t[1], ['the throne name', 'the birth name', 'the Horus name', 'the Two Ladies name'].filter(function (x) { return x !== t[1]; })),
        steps: [T('nsw-bjt') + ' "King of Upper and Lower Egypt" introduces the throne name; ' + T('zꜣ-rꜥ') + ' "son of Ra" introduces the birth name.', 'Both names are written in cartouches; the titles stand outside, before them.'], hint: 'Son of Ra: the name he was born with.' };
    }
    if (kind === 1) {
      var t2 = pick(R, [['nesubit', 'nsw-bjt'], ['zara', 'zꜣ-rꜥ']]);
      return { q: 'This title stands before a cartouche. Type its transliteration.', viz: glyphs({ word: t2[0] }), a: tla(t2[1]),
        steps: [t2[1] === 'nsw-bjt' ? 'The sedge ' + sg('M23', 1.2) + ' with t and n writes ' + T('nsw') + ' (written first, as honor demands), and the bee ' + sg('L2', 1.2) + ' with t writes ' + T('bjt') + ': ' + T('nsw-bjt') + ' "King of Upper and Lower Egypt" (literally "he of the sedge and the bee").' : 'The pintail duck ' + sg('G39', 1.2) + ' writes ' + T('zꜣ') + ' "son" and the sun ' + sg('N5', 1.2) + ' is ' + T('rꜥ') + ' "Ra": ' + T('zꜣ-rꜥ') + ' "son of Ra".'],
        hint: t2[1] === 'nsw-bjt' ? 'Sedge and bee.' : 'Duck and sun.' };
    }
    if (kind === 2) return { q: 'True or false: in "nsw-bjt Menkheperre", the words nsw-bjt are part of the king’s name.', a: { t: 'tf', v: false },
      steps: [T('nsw-bjt') + ' is a title, "King of Upper and Lower Egypt", written before the cartouche.', 'The name itself is inside the cartouche: ' + T('mn-ḫpr-rꜥ') + '.'], hint: 'Is the title inside the cartouche?' };
    var k = pick(R, THRONE);
    return { q: 'An inscription reads: ' + T('nsw-bjt') + ' (' + k[1] + ') ' + T('zꜣ-rꜥ') + ' (' + k[0].replace(/ [IV]+$/, '') + '). Which king is it?', a: mc(k[0], R.shuffle(THRONE.filter(function (x) { return x !== k; })).map(function (x) { return x[0]; })),
      steps: ['The cartouche after ' + T('nsw-bjt') + ' holds the throne name ' + k[1] + '; the cartouche after ' + T('zꜣ-rꜥ') + ' holds the birth name.', 'Together they identify ' + k[0] + '.'], hint: 'The throne name tells kings of the same birth name apart.' };
  });

  var RN = [{ k: 'khufu', tl: ['ḫwfw'], en: 'Khufu' }, { k: 'sneferu', tl: ['snfrw'], en: 'Sneferu' }, { k: 'khafre', tl: ['ḫꜥ=f-rꜥ'], en: 'Khafre', tr: 'rꜥ' }, { k: 'menkaure', tl: ['mn-kꜣw-rꜥ'], en: 'Menkaure', tr: 'rꜥ' },
    { k: 'amenhotep', tl: ['jmn-ḥtp'], en: 'Amenhotep' }, { k: 'tutankhamun', tl: ['twt-ꜥnḫ-jmn'], en: 'Tutankhamun', tr: 'jmn' }, { k: 'ramesses', tl: ['rꜥ-ms-sw', 'rꜥ-ms-s'], en: 'Ramesses' },
    { k: 'thutmose', tl: ['ḏḥwtj-ms'], en: 'Thutmose' }, { k: 'ptolemy', tl: ['ptwlmys'], en: 'Ptolemy', gr: true }, { k: 'cleopatra', tl: ['qljwpꜣdrꜣt'], en: 'Cleopatra', gr: true },
    { k: 'menkheperre', tl: ['mn-ḫpr-rꜥ'], en: 'Menkheperre (Thutmose III)', tr: 'rꜥ', x: true }];
  function rnViz(r, vertical) { return r.x ? cart({ sp: XNAMES[r.k].sp, vertical: !!vertical }) : cart({ name: r.k, vertical: !!vertical }); }
  function rnSteps(r) {
    var signs = r.x ? XNAMES[r.k].signs : EG().NAMES[r.k].signs, note = r.x ? '' : (EG().NAMES[r.k].note || '');
    var GREEK = { ptolemy: ['p', 't', 'w (for o)', 'l', 'm', 'y', 's'], cleopatra: ['q', 'l', 'j', 'w (for o)', 'p', 'ꜣ', 'd', 'r', 'ꜣ', 't', 'the egg (a woman’s name, not read)'] };
    var lab = GREEK[r.k] ? function (c, i) { return /[a-zꜣꜥ]/.test(GREEK[r.k][i].charAt(0)) && GREEK[r.k][i].indexOf('the ') !== 0 ? T(GREEK[r.k][i].split(' ')[0]) + (GREEK[r.k][i].indexOf(' ') > 0 ? ' ' + GREEK[r.k][i].replace(/^\S+ /, '') : '') : GREEK[r.k][i]; } : function (c) { return vals(c)[0] ? T(vals(c)[0]) : '(' + nameOf(c) + ')'; };
    return ['The signs, in written order: ' + signs.map(function (c, i) { return sg(c, 1.1) + ' ' + lab(c, i); }).join(', ') + '.' + (note && !GREEK[r.k] ? ' ' + esc(note) : ''),
      r.tr ? 'The god’s name ' + T(r.tr) + ' is written first out of honor but read last: ' + T(r.tl[0]) + ', ' + r.en + '.' : r.gr ? 'A Greek name spelled out sign by sign (the lion writes l): ' + T(r.tl[0]) + ', ' + r.en + '.' : 'Read in written order: ' + T(r.tl[0]) + ', ' + r.en + '.'];
  }
  G('me1.royal-names', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? 0 : R.int(0, 2);
    var pool = kind === 1 ? RN.filter(function (r) { return !r.gr; }) : RN, r = pick(R, pool), vert = R.chance(0.3);
    if (kind === 0) return { q: 'Whose name is in this cartouche?', viz: rnViz(r, vert), a: mc(r.en, R.shuffle(RN.filter(function (x) { return x !== r; })).map(function (x) { return x.en; })),
      steps: rnSteps(r), hint: 'Read the sound signs; watch for a god’s name written first.' };
    if (kind === 1) return { q: 'Type the transliteration of this royal name, in reading order.', viz: rnViz(r, vert), a: tla(r.tl),
      steps: rnSteps(r), hint: r.tr ? 'A god’s name is written first but may be read last.' : 'Read the signs in order.' };
    var tr = pick(R, RN.filter(function (x) { return x.tr; }));
    return { q: 'In this cartouche, which part is written first but read last?', viz: rnViz(tr, vert), a: mc(T(tr.tr) + ' (the god’s name)', ['nothing: it is read in written order'].concat(tr.tl[0].split('-').filter(function (x) { return x !== tr.tr; }).map(function (x) { return T(x); }))),
      steps: rnSteps(tr), hint: 'Look for the sun disk or Amun’s name.' };
  });

  var EPI = [['wsjr nb ḏdw', 'Osiris, lord of Busiris', 'Osiris'], ['wsjr nṯr ꜥꜣ nb ꜣbḏw', 'Osiris, the great god, lord of Abydos', 'Osiris'], ['jnpw tpj ḏw=f', 'Anubis, who is upon his mountain', 'Anubis'], ['jnpw nb tꜣ ḏsr', 'Anubis, lord of the sacred land', 'Anubis']];
  G('me1.offering-formula', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 3), e = pick(R, EPI);
    if (kind === 0) return { q: 'Type the offering formula’s first words in reading order (not in written order).', viz: glyphs({ word: 'htpdinsw' }), a: tla('ḥtp-dj-nsw'),
      steps: ['Written: the sedge group ' + T('nsw') + ' "king" first, then ' + T('ḥtp') + ' "offering" and ' + T('dj') + ' "gives".', 'The king is written first out of honor, but read last: ' + T('ḥtp-dj-nsw') + ' "an offering that the king gives".'], hint: 'The king goes to the end.' };
    if (kind === 1) return { q: 'Translate: ' + T('ḥtp-dj-nsw ' + e[0]), a: mc('An offering that the king gives (to) ' + e[1] + '…', ['The king gives ' + e[1] + ' an offering of peace…', e[1] + ' gives an offering to the king…', 'An offering for the king, from ' + e[1] + '…']),
      steps: [T('ḥtp-dj-nsw') + ' = "an offering that the king gives"; the god or gods named next receive it (and pass it on to the dead person).', T(e[0]) + ' = ' + Q(e[1]) + '.', 'Scholars translate the opening in slightly different ways ("a boon which the king gives", "an offering given by the king"); the sense is the same.'], hint: 'The king gives; the god receives.' };
    if (kind === 2) return { q: 'A stela begins ' + T('ḥtp-dj-nsw ' + e[0]) + '. Which god is named?', a: mc(e[2], R.shuffle(['Osiris', 'Anubis', 'Ptah', 'Amun', 'Horus']).filter(function (x) { return x !== e[2]; })),
      steps: [T(e[0]) + ' = ' + Q(e[1]) + '.', 'Osiris and Anubis, gods of the dead, are the usual gods of the offering formula.'], hint: e[2] === 'Osiris' ? 'wsjr' : 'jnpw' };
    var who = pick(R, [['jmꜣḫ', 'the revered one'], ['sš', 'the scribe'], ['ḥm-nṯr', 'the priest'], ['nbt pr', 'the lady of the house']]);
    return { q: 'The formula ends ' + T('n kꜣ n ' + who[0]) + ' N. What does this mean?', a: mc('for the ka of ' + who[1] + ' N', ['for the ka of the king', 'to the house of ' + who[1] + ' N', 'by the ka of ' + who[1] + ' N']),
      steps: [T('n') + ' "for" + ' + T('kꜣ') + ' "ka (life force)" + ' + T('n') + ' "of" (the indirect genitive) + ' + T(who[0]) + ' ' + Q(who[1]) + '.', 'The offerings are meant for the ka of the dead person named on the monument.'], hint: 'n … n: "for … of".' };
  });

  var GIFTS = [['t', 'bread'], ['ḥnqt', 'beer'], ['kꜣw', 'oxen'], ['ꜣpdw', 'fowl (birds)'], ['šs', 'alabaster (calcite)'], ['mnḫt', 'linen (cloth)'], ['ḫt nbt nfrt wꜥbt', 'every good and pure thing']];
  G('me1.offering-list', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 3);
    if (kind === 0) { var g = pick(R, GIFTS); return { q: 'In the offering list, what is ' + T(g[0]) + '?', a: mc(Q(g[1]), R.shuffle(GIFTS.filter(function (x) { return x !== g; })).map(function (x) { return Q(x[1]); })),
      steps: [T(g[0]) + ' = ' + Q(g[1]) + '.', 'The usual list: ' + GIFTS.map(function (x) { return T(x[0]) + ' ' + x[1]; }).join(', ') + '.'], hint: 'Bread and beer come first.' }; }
    if (kind === 1) return { q: 'What does ' + T('prt-ḫrw') + ' mean in the offering formula?', a: mc('an invocation offering: offerings that "come forth at the voice" when the formula is spoken', R.shuffle(['the voice of the dead person', 'a song sung at the funeral', 'the house of the voice, a tomb chapel'])),
      steps: [T('prt') + ' "going forth" + ' + T('ḫrw') + ' "voice": the offerings that come forth when the words are said.', 'So a visitor who reads the formula aloud provides the offerings for the dead. It is not the word "voice" alone.'], hint: 'Something comes forth at the voice.' };
    if (kind === 2) {
      var two = sample(R, GIFTS.slice(0, 6), 2);
      return { q: 'Translate: ' + T('ḫꜣ m ' + two[0][0] + ' ' + two[1][0]), a: mc('a thousand of ' + two[0][1] + ' and ' + two[1][1], ['a thousand ' + two[0][1] + ' in ' + two[1][1], 'a lotus of ' + two[0][1] + ' and ' + two[1][1], 'one ' + two[0][1] + ' and one ' + two[1][1]]),
        steps: [T('ḫꜣ') + ' "a thousand" (the lotus ' + sg('M12', 1.2) + ') + ' + T('m') + ' "of, consisting of" + the gifts.', 'Lists simply put the items side by side: "' + two[0][1] + ' and ' + two[1][1] + '".'], hint: 'ḫꜣ is the number 1,000.' };
    }
    return { q: 'In offering lists, the sign ' + sg('M12', 2) + ' often stands before the gifts. What does it mean there?', a: mc('a thousand', ['a lotus flower offered to the dead', 'the sound m', 'a hundred']),
      steps: ['The lotus plant ' + sg('M12', 1.2) + ' writes ' + T('ḫꜣ') + ' "1,000": "a thousand of bread, a thousand of beer…".'], hint: 'It is a numeral sign.' };
  });

  var TITLES = [['sš', 'scribe'], ['jmj-rꜣ pr', 'steward (overseer of the house)'], ['jmj-rꜣ mšꜥ', 'general (overseer of the army)'], ['ḥm-nṯr', 'priest (servant of the god)'], ['wꜥb', 'priest (pure one)'], ['ṯꜣtj', 'vizier'], ['ẖrj-ḥbt', 'lector priest (who carries the ritual book)'], ['nbt pr', 'lady of the house'], ['smr wꜥtj', 'sole companion (a courtly rank)']];
  G('me1.titles', function (R, ctx) {
    var L = lv(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, 3);
    if (kind === 0) { var t = pick(R, TITLES); return { q: 'What does the title ' + T(t[0]) + ' mean?', a: mc(Q(t[1]), R.shuffle(TITLES.filter(function (x) { return x !== t; })).map(function (x) { return Q(x[1]); })),
      steps: [T(t[0]) + ' = ' + Q(t[1]) + '.', /jmj-rꜣ/.test(t[0]) ? T('jmj-rꜣ') + ' "overseer" is built from the nisbe ' + T('jmj') + ' "who is in" and ' + T('rꜣ') + ' "mouth".' : 'Titles come before the name on stelae and tomb walls.'], hint: 'Break it into its words.' }; }
    if (kind === 1) return { q: 'A stela names ' + T('sš') + ' Nakht ' + T('mꜣꜥ-ḫrw') + '. What is ' + T('mꜣꜥ-ḫrw') + '?', a: mc('an epithet, "true of voice", said of the blessed dead', R.shuffle(['part of his name', 'his job title, "speaker of truth"', 'the name of his father'])),
      steps: [T('mꜣꜥ-ḫrw') + ' "true of voice" (justified) follows the names of the dead, rather like "the late" or "of blessed memory".', 'It is not part of the name: Nakht is the name; ' + T('sš') + ' "scribe" his title.'], hint: 'It follows the name.' };
    if (kind === 2) return { q: 'This title is written with the god sign first. Type its transliteration in reading order.', viz: wv('hmntr'), a: tla('ḥm-nṯr'),
      steps: ['The flag ' + sg('R8', 1.2) + ' is ' + T('nṯr') + ' "god"; the club ' + sg('U36', 1.2) + ' is ' + T('ḥm') + ' "servant".', 'Honorific transposition: written nṯr ḥm, read ' + T('ḥm-nṯr') + ' "servant of the god", a priest.'], hint: 'The god goes last in reading.' };
    var t2 = pick(R, TITLES);
    return { q: 'Which title means ' + Q(t2[1]) + '?', a: mc(T(t2[0]), R.shuffle(TITLES.filter(function (x) { return x !== t2; })).map(function (x) { return T(x[0]); })),
      steps: [Q(t2[1]) + ' = ' + T(t2[0]) + '.'], hint: 'Think of the words inside the title.' };
  });


  // exposed for the course's own tests (not used by pages)
  ML._me1 = { VOC: VOC, ADJ: ADJ, PRON: PRON, SP: SP, XNAMES: XNAMES, DETCLASS: DETCLASS, ALPHA_SETS: ALPHA_SETS, BI1: BI1, BI2: BI2, TRI: TRI, plural: plural, dual: dual, agree: agree };
})(window.MathLadder);
