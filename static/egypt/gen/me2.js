/* Egyptology Ladder generators: Middle Egyptian II (course key me2). One generator per topic in data/egypt/topics/me2.json,
   registered with MathLadder.gen. Built from /tmp/work_egypt/me2/gen/*.js (concatenated in order by build.sh).

   Conventions (/tmp/work_egypt/overview.md): transliteration in the Egyptological alphabet with yod written j; "." before an
   ending (sḏm.n), "=" before a suffix pronoun (sḏm.n=f); the 'translit' answer type ignores separators and reads MdC.
   Grammar follows Gardiner, Egyptian Grammar (1927; the lesson numbers are the same in the later editions), with Allen's
   names noted where they differ. Hieroglyphic spellings come from the kit's model (MathLadder.egypt WORDS) or from the
   short list XW below, built only from signs in the site's font. Problems carry `chk`, the setup in machine-readable
   form, so /tmp/work_egypt/me2/verify.js can recompute every answer from its own tables. The runner ignores chk. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  function EG() { return ML.egypt; }
  /* Shim: core/gen.js's validateProblem does not list the 'translit' answer type yet (check.js has it), so makeProblem
     would throw on every transliteration answer. Until gen.js adds `translit` to its TYPES, accept a translit spec whose
     v is a non-empty string or array of strings. It does nothing once gen.js knows the type. (Reported for a shared fix.) */
  (function () {
    var orig = ML.validateProblem; if (!orig || orig._tl) return;
    var probe = orig({ q: 'x', steps: ['x'], a: { t: 'translit', v: 'x' } });
    if (!probe.length) return;
    function okTl(a) { var v = a && [].concat(a.v); return v && v.length && v.every(function (x) { return typeof x === 'string' && x.trim(); }); }
    function walk(a, path, bad) { if (!a) return; if (a.t === 'translit') { if (!okTl(a)) bad.push(path + '.v must be a transliteration or an array of them'); return; } if (a.t === 'multi' && a.parts) a.parts.forEach(function (p, i) { walk(p && p.a, path + '.parts[' + i + '].a', bad); }); }
    var shim = function (p) { var out = orig(p).filter(function (m) { return !/\.t is "translit" \(not an answer type\)/.test(m); }); if (p && p.a) walk(p.a, 'a', out); return out; };
    shim._tl = true; ML.validateProblem = shim;
  })();
  var G = function (id, fn) { ML.gen(id, fn); };
  function lvl(ctx) { return (ctx && ctx.level) || 1; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function P(q, a, steps, hint, chk, viz) { var p = { q: q, a: a, steps: steps }; if (hint) p.hint = hint; if (chk) p.chk = chk; if (viz) p.viz = viz; return p; }
  function mc(correct, wrongs) { var seen = {}, ch = [correct]; seen[correct] = 1; (wrongs || []).forEach(function (w) { if (w && !seen[w]) { seen[w] = 1; ch.push(w); } }); return { t: 'mc', choices: ch.slice(0, 5), v: 0 }; }
  function keep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function TL(v) { return { t: 'translit', v: [].concat(v) }; }
  // a transliteration in running text (Unicode, separators kept, in the transliteration font)
  function tl(s) {
    var E = EG(); s = String(s);
    var out = s.split(/(\d+)/).map(function (x) { if (/^\d+$/.test(x)) return '<span style="font-style:normal">' + x + '</span>'; if (!x.trim()) return x; var a = /^\s/.test(x) ? ' ' : '', b = /\s$/.test(x) ? ' ' : ''; return a + (E ? E.show(x) : x) + b; }).join('');
    return '<i class="eg-tl">' + out + '</i>';
  }
  function q(s) { return '“' + s + '”'; }
  function box(lines) { return '<div style="border-left:3px solid var(--ml-acc,#2e6e5e);padding:.15em 0 .15em .8em;margin:.55em 0">' + [].concat(lines).join('<br>') + '</div>'; }
  function bank(R, ctx, list) { var L = lvl(ctx), pool = list.filter(function (x) { return (x.lv || 1) <= L; }); var top = pool.filter(function (x) { return (x.lv || 1) === L; }); return R.chance(0.6) && top.length ? R.pick(top) : R.pick(pool); }
  function mdcHint(s) { var E = EG(); return E ? ' (type ' + E.mdc(s) + ')' : ''; }
  // a hieroglyphic picture for a problem: quiet (no transliteration or meaning), still
  function gviz(sp, extra) { if (!sp) return null; var o = { sp: sp, quiet: true, interactive: false, size: 64 }; if (extra) for (var k in extra) o[k] = extra[k]; return { name: 'eg-glyphs', opts: o }; }
  function wsp(key) { var E = EG(); return E && E.WORDS[key] ? E.WORDS[key].sp : (XW[key] ? XW[key].sp : null); }

  /* ---------------------------------------------------------------- extra spellings (signs in the site's font only)
     Each from Gardiner's sign list and vocabularies (1927): [spelling, transliteration, parts]. */
  var XW = {
    xrw: { tl: 'ḫrw', en: 'voice', sp: 'P8-G43-A2', parts: [['P8', 'phon', 'ḫrw'], ['G43', 'comp', 'w'], ['A2', 'det', '']] },
    rx: { tl: 'rḫ', en: 'know', sp: 'D21:Aa1-Y1', parts: [['D21', 'phon', 'r'], ['Aa1', 'phon', 'ḫ'], ['Y1', 'det', '']] },
    t: { tl: 't', en: 'bread', sp: 'X1:Z1', parts: [['X1', 'logo', 't'], ['Z1', 'stroke', '']] },
    mAA: { tl: 'mꜣꜣ', en: 'see', sp: 'U1-G1-D4', parts: [['U1', 'phon', 'mꜣ'], ['G1', 'comp', 'ꜣ'], ['D4', 'det', '']] },
    wnn: { tl: 'wnn', en: 'be, exist', sp: 'E34-N35:N35', parts: [['E34', 'phon', 'wn'], ['N35', 'comp', 'n'], ['N35', 'phon', 'n']] },
    jr: { tl: 'jr', en: 'do, make', sp: 'D4', parts: [['D4', 'phon', 'jr']] },
    jrt: { tl: 'jrt', en: 'to do (infinitive)', sp: 'D4:X1', parts: [['D4', 'phon', 'jr'], ['X1', 'end', 't']] },
    rdj: { tl: 'rdj', en: 'give', sp: 'D21:X8', parts: [['D21', 'phon', 'r'], ['X8', 'phon', 'dj']] },
    dj: { tl: 'dj', en: 'give', sp: 'X8', parts: [['X8', 'phon', 'dj']] },
    rdjt: { tl: 'rdjt', en: 'to give (infinitive)', sp: 'D21:X8-X1', parts: [['D21', 'phon', 'r'], ['X8', 'phon', 'dj'], ['X1', 'end', 't']] },
    ms: { tl: 'ms', en: 'give birth', sp: 'F31-S29', parts: [['F31', 'phon', 'ms'], ['S29', 'comp', 's']] },
    sanx: { tl: 'sꜥnḫ', en: 'make live', sp: 'S29-S34-N35:Aa1', parts: [['S29', 'phon', 's'], ['S34', 'phon', 'ꜥnḫ'], ['N35', 'comp', 'n'], ['Aa1', 'comp', 'ḫ']] },
    smn: { tl: 'smn', en: 'make firm, establish', sp: 'S29-Y5:N35', parts: [['S29', 'phon', 's'], ['Y5', 'phon', 'mn'], ['N35', 'comp', 'n']] },
    shtp: { tl: 'sḥtp', en: 'satisfy, pacify', sp: 'S29-R4:X1*Q3', parts: [['S29', 'phon', 's'], ['R4', 'phon', 'ḥtp'], ['X1', 'comp', 't'], ['Q3', 'comp', 'p']] },
    sxpr: { tl: 'sḫpr', en: 'bring into being, create', sp: 'S29-L1-D21', parts: [['S29', 'phon', 's'], ['L1', 'phon', 'ḫpr'], ['D21', 'comp', 'r']] },
    snfr: { tl: 'snfr', en: 'make good, beautify', sp: 'S29-F35-I9:D21', parts: [['S29', 'phon', 's'], ['F35', 'phon', 'nfr'], ['I9', 'comp', 'f'], ['D21', 'comp', 'r']] },
    swsr: { tl: 'swsr', en: 'make powerful', sp: 'S29-F12-S29:D21', parts: [['S29', 'phon', 's'], ['F12', 'phon', 'wsr'], ['S29', 'comp', 's'], ['D21', 'comp', 'r']] },
    jn: { tl: 'jn', en: 'question particle; "it is … who"', sp: 'M17-N35', parts: [['M17', 'phon', 'j'], ['N35', 'phon', 'n']] },
    jrc: { tl: 'jr', en: 'if; as for', sp: 'M17-D21', parts: [['M17', 'phon', 'j'], ['D21', 'phon', 'r']] },
    mk: { tl: 'mk', en: 'look, behold', sp: 'G17-V31', parts: [['G17', 'phon', 'm'], ['V31', 'phon', 'k']] },
    ntj: { tl: 'ntj', en: 'who, which (masculine)', sp: 'N35:X1-Z4', parts: [['N35', 'phon', 'n'], ['X1', 'phon', 't'], ['Z4', 'end', 'j']] },
    Hr: { tl: 'ḥr', en: 'on (with an infinitive: "doing")', sp: 'D2:Z1', parts: [['D2', 'phon', 'ḥr'], ['Z1', 'stroke', '']] },
    r: { tl: 'r', en: 'to, toward', sp: 'D21', parts: [['D21', 'phon', 'r']] },
    m: { tl: 'm', en: 'in, from, as', sp: 'G17', parts: [['G17', 'phon', 'm']] },
    n: { tl: 'n', en: 'to, for; the .n of the sḏm.n=f', sp: 'N35', parts: [['N35', 'phon', 'n']] },
    tw: { tl: 'tw', en: 'the passive ending .tw', sp: 'X1-G43', parts: [['X1', 'phon', 't'], ['G43', 'phon', 'w']] },
    sw: { tl: 'sw', en: 'him, it (dependent pronoun)', sp: 'S29-G43', parts: [['S29', 'phon', 's'], ['G43', 'phon', 'w']] }
  };
  // suffix pronouns: transliteration, English subject / object / possessive, spelling
  var SUF = [
    { k: 'j', s: '=j', sub: 'I', obj: 'me', pos: 'my', sp: 'A1', p: 1 },
    { k: 'k', s: '=k', sub: 'you', obj: 'you', pos: 'your', who: 'you (a man)', sp: 'V31', p: 2 },
    { k: 't', s: '=ṯ', sub: 'you', obj: 'you', pos: 'your', who: 'you (a woman)', sp: 'V13', p: 2 },
    { k: 'f', s: '=f', sub: 'he', obj: 'him', pos: 'his', sp: 'I9', p: 3 },
    { k: 's', s: '=s', sub: 'she', obj: 'her', pos: 'her', sp: 'S29', p: 3 },
    { k: 'n', s: '=n', sub: 'we', obj: 'us', pos: 'our', sp: 'N35:Z2', p: 1, pl: 1 },
    { k: 'tn', s: '=ṯn', sub: 'you', obj: 'you', pos: 'your', who: 'you (more than one)', sp: 'V13-N35:Z2', p: 2, pl: 1 },
    { k: 'sn', s: '=sn', sub: 'they', obj: 'them', pos: 'their', sp: 'S29-N35:Z2', p: 3, pl: 1 }
  ];
  function suf(k) { for (var i = 0; i < SUF.length; i++) if (SUF[i].k === k) return SUF[i]; return null; }
  function who(S) { return S.who || S.sub; }
  var SUF_MAIN = ['j', 'k', 'f', 's', 'n', 'sn'];

  /* ---------------------------------------------------------------- the verbs
     cls: s2 / s3 strong (two or three consonants), caus (s + root), 3inf (third-weak: final j drops in most forms),
     gem (second-geminate: the last consonant doubles in some forms), anom (rdj, jj, jnj).
     e: English [base, he-form, past, past participle, -ing]. stem: what stands before endings in the sḏm.n=f and most
     forms. inf: the infinitive. sp: hieroglyphic spelling (XW or WORDS) when the font has every sign. tr: transitive.
     obj: objects that suit the verb, as [transliteration, English, spelling key]. */
  var VB = {
    sdm: { tl: 'sḏm', cls: 's3', tr: 1, sp: 'sedjem', e: ['hear', 'hears', 'heard', 'heard', 'hearing'], stem: 'sḏm', inf: 'sḏm', obj: [['ḫrw', 'the voice', 'xrw'], ['mdt', 'the words'], ['rn', 'the name', 'ren']] },
    dd: { tl: 'ḏd', cls: 's2', tr: 1, sp: 'djed', e: ['say', 'says', 'said', 'said', 'saying'], stem: 'ḏd', inf: 'ḏd', obj: [['mꜣꜥt', 'the truth', 'maat'], ['rn', 'the name', 'ren'], ['mdt', 'the words']] },
    rx: { tl: 'rḫ', cls: 's2', tr: 1, sp: 'rx', e: ['know', 'knows', 'knew', 'known', 'knowing'], stem: 'rḫ', inf: 'rḫ', obj: [['rn', 'the name', 'ren'], ['mꜣꜥt', 'the truth', 'maat']] },
    anx: { tl: 'ꜥnḫ', cls: 's3', tr: 0, sp: 'ankh', e: ['live', 'lives', 'lived', 'lived', 'living'], stem: 'ꜥnḫ', inf: 'ꜥnḫ' },
    xpr: { tl: 'ḫpr', cls: 's3', tr: 0, sp: 'kheper', e: ['come into being', 'comes into being', 'came into being', 'come into being', 'coming into being'], stem: 'ḫpr', inf: 'ḫpr' },
    mn: { tl: 'mn', cls: 's2', tr: 0, sp: 'menu', e: ['remain', 'remains', 'remained', 'remained', 'remaining'], stem: 'mn', inf: 'mn' },
    sdr: { tl: 'sḏr', cls: 's3', tr: 0, e: ['lie down', 'lies down', 'lay down', 'lain down', 'lying down'], stem: 'sḏr', inf: 'sḏr' },
    aha: { tl: 'ꜥḥꜥ', cls: 's3', tr: 0, e: ['stand', 'stands', 'stood', 'stood', 'standing'], stem: 'ꜥḥꜥ', inf: 'ꜥḥꜥ' },
    smn: { tl: 'smn', cls: 'caus', base: 'mn', tr: 1, sp: 'smn', e: ['establish', 'establishes', 'established', 'established', 'establishing'], stem: 'smn', inf: null },
    sanx: { tl: 'sꜥnḫ', cls: 'caus', base: 'anx', tr: 1, sp: 'sanx', e: ['give life to', 'gives life to', 'gave life to', 'given life to', 'giving life to'], stem: 'sꜥnḫ', inf: 'sꜥnḫ', obj: [['rmṯ', 'the people', 'remetj']] },
    shtp: { tl: 'sḥtp', cls: 'caus', base: 'htp', tr: 1, sp: 'shtp', e: ['satisfy', 'satisfies', 'satisfied', 'satisfied', 'satisfying'], stem: 'sḥtp', inf: 'sḥtp', obj: [['nṯr', 'the god', 'netjer']] },
    sxpr: { tl: 'sḫpr', cls: 'caus', base: 'xpr', tr: 1, sp: 'sxpr', e: ['create', 'creates', 'created', 'created', 'creating'], stem: 'sḫpr', inf: 'sḫpr' },
    irj: { tl: 'jrj', cls: '3inf', tr: 1, sp: 'jr', e: ['do', 'does', 'did', 'done', 'doing'], stem: 'jr', inf: 'jrt', obj: [['mꜣꜥt', 'what is right', 'maat']] },
    mrj: { tl: 'mrj', cls: '3inf', tr: 1, e: ['love', 'loves', 'loved', 'loved', 'loving'], stem: 'mr', inf: 'mrt', obj: [['mꜣꜥt', 'what is right', 'maat']] },
    msj: { tl: 'msj', cls: '3inf', tr: 1, sp: 'ms', e: ['give birth to', 'gives birth to', 'gave birth to', 'born', 'giving birth to'], stem: 'ms', inf: 'mst' },
    hzj: { tl: 'ḥzj', cls: '3inf', tr: 1, e: ['praise', 'praises', 'praised', 'praised', 'praising'], stem: 'ḥz', inf: 'ḥzt' },
    gmj: { tl: 'gmj', cls: '3inf', tr: 1, e: ['find', 'finds', 'found', 'found', 'finding'], stem: 'gm', inf: 'gmt' },
    maa: { tl: 'mꜣꜣ', cls: 'gem', tr: 1, sp: 'mAA', e: ['see', 'sees', 'saw', 'seen', 'seeing'], stem: 'mꜣꜣ', inf: 'mꜣꜣ' },
    wnn: { tl: 'wnn', cls: 'gem', tr: 0, sp: 'wnn', e: ['be', 'is', 'was', 'been', 'being'], stem: 'wn', inf: 'wnn' },
    rdj: { tl: 'rdj', cls: 'anom', tr: 1, sp: 'rdj', e: ['give', 'gives', 'gave', 'given', 'giving'], stem: 'rdj', inf: 'rdjt', obj: [['t', 'bread', 't'], ['nbw', 'gold', 'nebu'], ['ḥtp', 'an offering', 'hetep']] },
    jj: { tl: 'jj', cls: 'anom', tr: 0, e: ['come', 'comes', 'came', 'come', 'coming'], stem: 'jj', inf: 'jjt' },
    jnj: { tl: 'jnj', cls: 'anom', tr: 1, e: ['bring', 'brings', 'brought', 'brought', 'bringing'], stem: 'jn', inf: 'jnt' }
  };
  var CLS_NAME = { s2: 'strong (two consonants)', s3: 'strong (three consonants)', caus: 'causative (s- + a root)', '3inf': 'third-weak (ends in a weak j)', gem: 'second-geminate (the last consonant doubles)', anom: 'irregular (anomalous)' };
  var STRONG = ['sdm', 'dd', 'rx', 'anx', 'xpr', 'mn', 'smn', 'sanx', 'shtp', 'sxpr'];
  var TRANS_STRONG = ['sdm', 'dd', 'rx', 'smn', 'sanx', 'shtp', 'sxpr'];
  function vsp(k) { var v = VB[k]; return v && v.sp ? wsp(v.sp) : null; }
  // English: subject + present ("he hears", "I hear")
  function enPres(v, S) { return S.sub + ' ' + (S.p === 3 && !S.pl ? v.e[1] : (v.e[0] === 'be' ? (S.sub === 'I' ? 'am' : 'are') : v.e[0])); }
  function enPast(v, S) { return S.sub + ' ' + (v.e[0] === 'be' ? (S.p === 3 && !S.pl || S.sub === 'I' ? 'was' : 'were') : v.e[2]); }

  // noun subjects: [transliteration, English, spelling key, gender]
  var NOUN = [
    { tl: 'z', en: 'the man', w: 'zi', g: 'm' }, { tl: 'nsw', en: 'the king', w: 'nesu', g: 'm' }, { tl: 'nṯr', en: 'the god', w: 'netjer', g: 'm' },
    { tl: 'zꜣ', en: 'the son', w: 'za', g: 'm' }, { tl: 'zꜣt', en: 'the daughter', w: 'zat', g: 'f' }, { tl: 'ḥm=f', en: 'His Majesty', w: 'hemef', g: 'm' },
    { tl: 'jt', en: 'the father', w: 'it', g: 'm' }
  ];
  function nsp(N) { return N.w ? wsp(N.w) : null; }
  ML._me2 = { XW: XW, VB: VB, SUF: SUF }; // for the course's own tests
  function join(arr) { var a = arr.filter(function (x) { return x; }); return a.length === arr.length ? a.join(' ') : null; }
  /* ================================================================ unit: the verb */
  // forms of a strong verb built from the stem (for "find the root" and "name the form" problems)
  function formOf(v, f, S) {
    var st = v.stem;
    switch (f) {
      case 'sdmf': return st + S.s;
      case 'sdmnf': return st + '.n' + S.s;
      case 'tw': return st + '.tw' + S.s;
      case 'stat1': return st + '.kj';
      case 'inf_r': return 'r ' + v.inf;
      case 'inf_hr': return 'ḥr ' + v.inf;
      case 'imp': return st;
    }
  }
  var FORM_NAME = { sdmf: 'the sḏm=f (stem + subject)', sdmnf: 'the sḏm.n=f (stem + .n + subject)', tw: 'the passive sḏm.tw=f (stem + .tw + subject)', stat1: 'the stative (old perfective), with an ending for "I"', inf_r: 'an infinitive after the preposition r', inf_hr: 'an infinitive after the preposition ḥr' };

  G('me2.roots', function (R, ctx) {
    var L = lvl(ctx), shape = L === 1 ? R.pick(['glyph', 'glyph', 'count']) : L === 2 ? R.pick(['form', 'form', 'count', 'glyph']) : R.pick(['weak', 'weak', 'form']);
    if (shape === 'glyph') {
      var k = R.pick(['sdm', 'dd', 'rx', 'anx', 'xpr', 'mn']), v = VB[k], W = EG().WORDS[v.sp] || XW[v.sp];
      return P('The hieroglyphs spell a verb meaning ' + q(v.e[0]) + '. Read its root: type the consonants in transliteration.',
        TL(v.tl), ['Read the sound signs in order and drop the phonetic complements (signs that repeat a sound already written) and any determinative.', W.parts.map(function (p) { return p[0] + ': ' + (p[1] === 'comp' ? 'complement, repeats ' + p[2] : p[1] === 'det' ? 'determinative, not read' : 'reads ' + p[2]); }).join('; ') + '.', 'The root is ' + tl(v.tl) + mdcHint(v.tl) + ', ' + q(v.e[0]) + '.'],
        'Only the sounds count: the root of a verb is its consonants.', { k: 'root', v: k }, gviz(W.sp));
    }
    if (shape === 'count') {
      var k2 = R.pick(['sdm', 'dd', 'rx', 'anx', 'xpr', 'mn', 'sdr', 'aha']), v2 = VB[k2], S = suf(R.pick(SUF_MAIN)), f = R.pick(['sdmf', 'sdmnf', 'tw']), form = formOf(v2, f, S), n = EG().letters(v2.tl).length;
      return P('The form ' + tl(form) + ' comes from the verb ' + q(v2.e[0]) + '. How many consonants does its root have?', { t: 'num', v: String(n) },
        ['Take off what is not the root: ' + (f === 'sdmnf' ? 'the .n and ' : f === 'tw' ? 'the .tw and ' : '') + 'the suffix pronoun ' + tl(S.s) + '.', 'What is left is ' + tl(v2.tl) + ': ' + EG().letters(v2.tl).join(', ') + '.', 'The root has ' + n + ' consonants.'],
        'Separators mark the endings: everything after "." or "=" is not part of the root.', { k: 'count', v: k2, n: n });
    }
    if (shape === 'form') {
      var k3 = R.pick(['sdm', 'dd', 'rx', 'anx', 'xpr', 'mn', 'sdr', 'aha']), v3 = VB[k3], S3 = suf(R.pick(SUF_MAIN)), f3 = R.pick(['sdmf', 'sdmnf', 'tw']), form3 = formOf(v3, f3, S3);
      return P('What is the root of the verb in ' + tl(form3) + '? Type it in transliteration.', TL(v3.tl),
        ['The suffix pronoun ' + tl(S3.s) + ' (' + who(S3) + ') is the subject, not part of the verb.', f3 === 'sdmnf' ? 'The .n is an ending that makes the sḏm.n=f.' : f3 === 'tw' ? 'The .tw is the passive ending.' : 'Here nothing stands between the stem and the suffix.', 'The root is ' + tl(v3.tl) + ', ' + q(v3.e[0]) + '.'],
        'Strip the endings after the dot and the equals sign.', { k: 'root', v: k3 });
    }
    // weak roots: a final j that the form does not show
    var k4 = R.pick(['irj', 'mrj', 'gmj', 'hzj', 'msj']), v4 = VB[k4], S4 = suf(k4 === 'msj' ? 's' : R.pick(SUF_MAIN)), form4 = v4.stem + '.n' + S4.s;
    return P('The form ' + tl(form4) + ' means ' + q(enPast(v4, S4).replace(/^./, function (c) { return c.toUpperCase(); })) + '. Dictionaries list this verb with its full root. Type the root.', TL(v4.tl),
      ['Take off the .n and the suffix ' + tl(S4.s) + ': the stem is ' + tl(v4.stem) + '.', 'This is a third-weak verb: its root ends in a weak consonant j that is not written in this form.', 'The root is ' + tl(v4.tl) + mdcHint(v4.tl) + '.'],
      'Some roots end in a weak j that most forms leave out.', { k: 'root', v: k4 });
  });

  G('me2.classes', function (R, ctx) {
    var L = lvl(ctx), shape = L === 1 ? 'name' : L === 2 ? R.pick(['name', 'which']) : R.pick(['lost', 'which', 'name']);
    var CL = ['s3', 's2', 'caus', '3inf', 'gem', 'anom'];
    var keysBy = function (c) { return Object.keys(VB).filter(function (k) { return VB[k].cls === c && k !== 'wnn'; }); };
    if (shape === 'name') {
      var c = R.pick(L === 1 ? ['s3', '3inf', 'gem', 'caus'] : CL), k = R.pick(keysBy(c)), v = VB[k];
      var wr = CL.filter(function (x) { return x !== c && !(c[0] === 's' && x[0] === 's' && c.length === 2 && x.length === 2); }).map(function (x) { return CLS_NAME[x]; });
      return P('To which class does the verb ' + tl(v.tl) + ' ' + q(v.e[0]) + ' belong?', mc(CLS_NAME[c], R.shuffle(wr).slice(0, 3)),
        [c === '3inf' ? 'Its root ends in the weak consonant j, which drops in most forms (' + tl(v.stem + '.n=f') + ').' : c === 'gem' ? 'Its last two consonants are the same; some forms write the doubled consonant and others only one.' : c === 'caus' ? 'It is ' + tl('s') + ' + the root ' + tl(VB[v.base] ? VB[v.base].tl : v.tl.slice(1)) + ': a causative.' : c === 'anom' ? 'It is one of the few verbs whose forms change in irregular ways.' : 'All its consonants are firm and show in every form.', 'So ' + tl(v.tl) + ' is ' + CLS_NAME[c] + '.'],
        'Look at the end of the root: a weak j, a doubled consonant, or a firm consonant?', { k: 'class', v: k, c: c });
    }
    if (shape === 'which') {
      var c2 = R.pick(['3inf', 'gem', 'caus']), right = VB[R.pick(keysBy(c2))], others = R.sample(STRONG.filter(function (k) { return VB[k].cls !== c2 && VB[k].cls !== 'caus'; }), 3).map(function (k) { return VB[k]; });
      return P('Which of these verbs is ' + CLS_NAME[c2] + '?', mc(tl(right.tl) + ' ' + q(right.e[0]), others.map(function (v) { return tl(v.tl) + ' ' + q(v.e[0]); })),
        ['The others are strong verbs: every consonant of their roots is firm.', tl(right.tl) + ' is ' + CLS_NAME[c2] + '.'], 'Check the shape of each root.', { k: 'which', v: right.tl, c: c2 });
    }
    var k5 = R.pick(['irj', 'mrj', 'gmj', 'hzj', 'msj']), v5 = VB[k5], S5 = suf(k5 === 'msj' ? 's' : R.pick(SUF_MAIN));
    return P('In ' + tl(v5.stem + '.n' + S5.s) + ' (' + q(enPast(v5, S5)) + '), which consonant of the root ' + tl(v5.tl) + ' is not written?', TL('j'),
      ['Compare the root ' + tl(v5.tl) + ' with the stem ' + tl(v5.stem) + '.', 'The last consonant, the weak ' + tl('j') + ', is missing: third-weak verbs drop it in the sḏm.n=f.'], 'Third-weak means the third consonant is weak.', { k: 'lost', v: k5 });
  });

  // [root, its meaning, causative, the causative's meaning, the misreading with =s "she", a noun from the root]
  var CAUS = [['ꜥnḫ', 'live', 'sꜥnḫ', 'make live, keep alive', 'she lives', 'life'], ['mn', 'remain, be firm', 'smn', 'make firm, establish', 'she remains', 'the one who remains'],
    ['ḥtp', 'be content, be at peace', 'sḥtp', 'satisfy, pacify', 'she is content', 'an offering'], ['ḫpr', 'come into being', 'sḫpr', 'bring into being, create', 'she comes into being', 'forms, shapes'],
    ['nfr', 'be good, be beautiful', 'snfr', 'make good, beautify', 'she is good', 'goodness'], ['wsr', 'be powerful', 'swsr', 'make powerful', 'she is powerful', 'power'],
    ['ꜥꜣ', 'be great', 'sꜥꜣ', 'make great, magnify', 'she is great', 'greatness'], ['wꜥb', 'be pure', 'swꜥb', 'purify', 'she is pure', 'a priest']];
  G('me2.causatives', function (R, ctx) {
    var L = lvl(ctx), c = R.pick(CAUS), shape = L === 1 ? R.pick(['make', 'meaning']) : L === 2 ? R.pick(['make', 'meaning', 'root']) : R.pick(['root', 'meaning', 'make']);
    var spk = { 'sꜥnḫ': 'sanx', smn: 'smn', 'sḥtp': 'shtp', 'sḫpr': 'sxpr', snfr: 'snfr', swsr: 'swsr' }[c[2]];
    var viz = spk ? gviz(XW[spk].sp) : null;
    if (shape === 'make') return P('The verb ' + tl(c[0]) + ' means ' + q(c[1]) + '. Write its causative, ' + q(c[3]) + '.', TL(c[2]),
      ['A causative puts ' + tl('s') + ' in front of the root: ' + tl('s') + ' + ' + tl(c[0]) + '.', 'The causative is ' + tl(c[2]) + mdcHint(c[2]) + ', ' + q(c[3]) + '.'], 'Causatives begin with s.', { k: 'caus', base: c[0] });
    if (shape === 'meaning') return P('What does the causative verb ' + tl(c[2]) + ' mean?', mc(cap(c[3]), [cap(c[4]), cap(c[1]), cap(c[5])]),
      ['Split it: ' + tl('s') + ' + ' + tl(c[0]) + ' ' + q(c[1]) + '.', 'The s- prefix means "make (someone or something) …": ' + tl(c[2]) + ' is ' + q(c[3]) + '.', 'It is not the pronoun =s "she": a suffix pronoun comes after the verb, never before it.'],
      'The s- comes before the root. What does a prefix like that add?', { k: 'causmean', c: c[2] }, viz);
    return P('The causative ' + tl(c[2]) + ' means ' + q(c[3]) + '. What is the root it is built on? Type it.', TL(c[0]),
      ['Take off the causative prefix ' + tl('s') + '.', 'The root is ' + tl(c[0]) + ', ' + q(c[1]) + '.'], 'Remove the prefix.', { k: 'causroot', c: c[2] }, viz);
  });

  var IRREG = [
    ['dj=f', 'rdj', 'he gives', 'The r of rdj is often dropped in writing, and in the sḏm=f the form is usually dj.'],
    ['rdj.n=f', 'rdj', 'he gave', 'In the sḏm.n=f the r usually stays: rdj.n=f.'],
    ['dj.tw', 'rdj', 'is given', 'dj.tw is the passive (.tw) of rdj, without its r.'],
    ['jmj', 'rdj', 'give!', 'The command "give!" uses a different word, jmj, which grammars list with rdj.'],
    ['jj.n=f', 'jj', 'he came', 'The verb "come" is written jj or jw; jj.n=f is its sḏm.n=f.'],
    ['mj', 'jj', 'come!', 'The command "come!" is mj, a different word used with jj.'],
    ['jn.n=f', 'jnj', 'he brought', 'jnj "bring" drops its final weak j: jn.n=f.'],
    ['wn.n=f', 'wnn', 'he was', 'wnn "be, exist" writes only one n in the sḏm.n=f: wn.n=f.']];
  var IRR_V = { rdj: 'rdj “give”', jj: 'jj (jw) “come”', jnj: 'jnj “bring”', wnn: 'wnn “be, exist”' };
  G('me2.weak-verbs', function (R, ctx) {
    var L = lvl(ctx), it = L === 1 ? R.pick(IRREG.slice(0, 3).concat([IRREG[4], IRREG[6]])) : R.pick(IRREG), shape = L === 1 ? 'mc' : L === 2 ? R.pick(['mc', 'type']) : R.pick(['type', 'tf', 'mc']);
    if (shape === 'mc') return P('The form ' + tl(it[0]) + ' (' + q(it[2]) + ') belongs to which verb?', mc(IRR_V[it[1]], Object.keys(IRR_V).filter(function (k) { return k !== it[1]; }).map(function (k) { return IRR_V[k]; })),
      [it[3], 'So ' + tl(it[0]) + ' is a form of ' + IRR_V[it[1]] + '.'], 'Which dictionary verb has these consonants, or is this a special form?', { k: 'irr', f: it[0], v: it[1] }, it[1] === 'rdj' && it[0] === 'dj=f' ? gviz('X8-I9') : null);
    if (shape === 'type') return P('Under which verb would you look up ' + tl(it[0]) + ' (' + q(it[2]) + ') in a dictionary? Type its dictionary form.', TL(it[1]),
      [it[3], 'Look it up under ' + tl(it[1]) + mdcHint(it[1]) + '.'], 'Irregular verbs are listed under one dictionary form.', { k: 'irr', f: it[0], v: it[1] });
    var S = bank(R, ctx, [{ s: 'In ḥtp-dj-nsw, dj is a form of the verb rdj "give".', v: true }, { s: 'The command "give!" is written rdj.', v: false, why: 'The command "give!" is jmj, a different word.' },
      { s: 'The command "come!" is mj.', v: true }, { s: 'dj=f and rdj.n=f come from two different verbs.', v: false, why: 'Both are rdj "give"; the r is often dropped in writing.' },
      { s: 'jn.n=f "he brought" comes from the verb jnj.', v: true }, { s: 'wn.n=f comes from the verb wnn "be, exist".', v: true },
      { s: 'The verb "come" can be written jj or jw.', v: true }, { s: 'jnj "bring" keeps its final j in the sḏm.n=f: jnj.n=f.', v: false, why: 'Like other weak verbs it drops it: jn.n=f.' }]);
    return P('True or false? ' + S.s.replace(/(ḥtp-dj-nsw|rdj\.n=f|dj=f|jn\.n=f|wn\.n=f|jnj\.n=f|\bjmj\b|\bmj\b|\brdj\b|\bjnj\b|\bwnn\b|\bjj\b|\bjw\b|\bdj\b)/g, function (m) { return tl(m); }), tf(S.v),
      [S.v ? 'True.' : 'False. ' + (S.why || '')], 'Think of rdj/dj, jj/jw, jnj and wnn.', { k: 'tf', v: S.v });
  });

  G('me2.forms-overview', function (R, ctx) {
    var L = lvl(ctx), k = R.pick(L === 1 ? ['sdm', 'dd', 'rx'] : ['sdm', 'dd', 'rx', 'anx', 'xpr', 'shtp', 'sanx']), v = VB[k], S = suf(R.pick(SUF_MAIN));
    var fs = L === 1 ? ['sdmf', 'sdmnf', 'tw'] : ['sdmf', 'sdmnf', 'tw', 'stat1', 'inf_r', 'inf_hr'];
    var f = R.pick(fs), form = formOf(v, f, S);
    if (L < 3 || R.coin()) {
      var wr = ['sdmf', 'sdmnf', 'tw', 'stat1', 'inf_r'].filter(function (x) { return x !== f && !(f === 'inf_hr' && x === 'inf_r'); }).map(function (x) { return FORM_NAME[x]; });
      return P('Which verb form is ' + tl(form) + ' (from ' + tl(v.tl) + ' ' + q(v.e[0]) + ')?', mc(FORM_NAME[f], R.shuffle(wr).slice(0, 3)),
        ['Look at what follows the stem ' + tl(v.stem) + '.', f === 'sdmf' ? 'A suffix pronoun comes right after it: the sḏm=f.' : f === 'sdmnf' ? '.n comes between the stem and the subject: the sḏm.n=f.' : f === 'tw' ? '.tw comes between the stem and the subject: the passive sḏm.tw=f.' : f === 'stat1' ? 'The ending .kj is a stative ending, for "I".' : 'A preposition stands before the verb: the verb is an infinitive, a noun.', 'It is ' + FORM_NAME[f] + '.'],
        'The endings tell the forms apart, since vowels are not written.', { k: 'form', f: f, form: form });
    }
    var f2 = R.pick(['sdmnf', 'tw', 'stat1']), right = formOf(v, f2, S), others = ['sdmf', 'sdmnf', 'tw', 'stat1'].filter(function (x) { return x !== f2; }).map(function (x) { return tl(formOf(v, x, S)); });
    return P('Which of these is ' + FORM_NAME[f2] + '?', mc(tl(right), others),
      [f2 === 'sdmnf' ? 'The sḏm.n=f has .n before the subject.' : f2 === 'tw' ? 'The passive has .tw before the subject.' : 'The stative has its own endings, like .kj for "I".', 'So the answer is ' + tl(right) + '.'], 'Look for the ending.', { k: 'formpick', f: f2, form: right });
  });
  /* ================================================================ unit: the infinitive */
  function infAcc(k) { var v = VB[k]; return k === 'mrj' ? ['mrt', 'mrjt'] : k === 'rdj' ? ['rdjt', 'djt'] : [v.inf]; }
  G('me2.inf-forms', function (R, ctx) {
    var L = lvl(ctx), shape = L === 1 ? R.pick(['give', 'give', 'which']) : L === 2 ? R.pick(['give', 'which', 'what']) : R.pick(['give', 'what', 'which']);
    var pool = L === 1 ? ['sdm', 'dd', 'irj', 'mrj', 'gmj'] : ['sdm', 'dd', 'rx', 'anx', 'shtp', 'irj', 'mrj', 'gmj', 'hzj', 'msj', 'maa', 'rdj'];
    if (shape === 'give') {
      var k = R.pick(pool), v = VB[k], weak = v.cls === '3inf' || k === 'rdj';
      return P('Write the infinitive of ' + tl(v.tl) + ' ' + q(v.e[0]) + '.', TL(infAcc(k)),
        [weak ? (k === 'rdj' ? 'rdj adds -t like the third-weak verbs: ' + tl('rdjt') + ' (often written without its r: ' + tl('djt') + ').' : tl(v.tl) + ' is third-weak: the infinitive drops the weak j and adds -t.') : v.cls === 'gem' ? 'Doubled verbs keep both consonants in the infinitive.' : 'A strong verb shows no ending in the infinitive.',
          'The infinitive is ' + tl(infAcc(k)[0]) + mdcHint(infAcc(k)[0]) + ', ' + q('to ' + v.e[0]) + ' or ' + q(v.e[4]) + '.'],
        'Is the verb strong or third-weak?', { k: 'inf', v: k }, k === 'irj' ? null : null);
    }
    if (shape === 'which') {
      var right = R.pick(['irj', 'mrj', 'gmj', 'hzj', 'msj']), wr = R.sample(['sdm', 'dd', 'rx', 'anx', 'mn', 'shtp', 'xpr'], 3);
      return P('Which of these verbs adds -t in the infinitive?', mc(tl(VB[right].tl) + ' ' + q(VB[right].e[0]), wr.map(function (k) { return tl(VB[k].tl) + ' ' + q(VB[k].e[0]); })),
        ['Third-weak verbs (roots ending in a weak j) form the infinitive with -t.', tl(VB[right].tl) + ' is third-weak: its infinitive is ' + tl(VB[right].inf) + '. The others are strong and show no ending.'], 'Look for the root that ends in a weak consonant.', { k: 'infwhich', v: right });
    }
    var it = R.pick([['jrt', 'irj', 'nb'], ['mrt', 'mrj', 'nb'], ['gmt', 'gmj', 'nb'], ['rdjt', 'rdj', 'nb']]);
    var ctxs = { jrt: ['r jrt mꜣꜥt', 'in order to do what is right'], mrt: ['ḥr mrt mꜣꜥt', 'loving what is right'], gmt: ['r gmt=f', 'in order to find him'], rdjt: ['ḥr rdjt t', 'giving bread'] }[it[0]];
    return P('In ' + tl(ctxs[0]) + ' ' + q(ctxs[1]) + ', what is ' + tl(it[0]) + '?', mc('The infinitive of ' + tl(VB[it[1]].tl) + ', with the -t of third-weak verbs', ['A feminine noun with the ending -t', 'The sḏm.n=f of ' + tl(VB[it[1]].tl), 'A stative with the ending -tj']),
      ['It stands after a preposition, where a noun goes; a verb there is an infinitive.', 'The -t is the infinitive ending of third-weak verbs (and of rdj), not the feminine ending of a noun, and there is no .n.'], 'What can follow a preposition?', { k: 'infwhat', f: it[0] }, it[0] === 'jrt' ? gviz('D21 D4:X1 Aa11:D36*X1-Y1') : it[0] === 'rdjt' ? gviz('D2:Z1 D21:X8-X1 X1:Z1') : null);
  });

  var INFUSE = [
    { tl: 'r sḏm mdt', en: 'in order to hear the words', role: 'prep', inf: 'sḏm', sp: 'D21 S29-F21-G17' },
    { tl: 'ḥr ḏd mꜣꜥt', en: 'saying the truth', role: 'prep', inf: 'ḏd', sp: 'D2:Z1 I10:D46 Aa11:D36*X1-Y1' },
    { tl: 'r jrt mꜣꜥt', en: 'in order to do what is right', role: 'prep', inf: 'jrt', sp: 'D21 D4:X1 Aa11:D36*X1-Y1' },
    { tl: 'rdjt ḥtp n nṯr', en: 'Giving an offering to the god', role: 'caption', inf: 'rdjt', sp: 'D21:X8-X1 R4:X1*Q3 N35 R8-A40' },
    { tl: 'mꜣꜣ nṯr', en: 'Seeing the god', role: 'caption', inf: 'mꜣꜣ', sp: 'U1-G1-D4 R8-A40' },
    { tl: 'rꜣ n prt m hrw', en: 'Spell for going out by day (the title of the Book of the Dead)', role: 'caption', inf: 'prt', lv: 2 },
    { tl: 'wḏ.n ḥm=f rdjt ḥtp', en: 'His Majesty commanded the giving of an offering', role: 'obj', inf: 'rdjt', lv: 2 },
    { tl: 'wḏ.n nsw jrt mꜣꜥt', en: 'The king commanded the doing of what is right', role: 'obj', inf: 'jrt', lv: 3 },
    { tl: 'mr.n=j sḏm mdt=k', en: 'I loved to hear your words', role: 'obj', inf: 'sḏm', lv: 3 }];
  var ROLE_EN = { prep: 'after a preposition', caption: 'as a heading or caption', obj: 'as the object of another verb' };
  G('me2.inf-uses', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, INFUSE);
    if (L === 1 || R.coin()) return P('In ' + tl(it.tl) + ' ' + q(it.en) + ', how is the infinitive ' + tl(it.inf) + ' used?', mc(cap(ROLE_EN[it.role]), ['prep', 'caption', 'obj'].filter(function (r) { return r !== it.role; }).map(function (r) { return cap(ROLE_EN[r]); }).concat(['As the main verb, with its own subject'])),
      [it.role === 'prep' ? 'A preposition (' + tl(it.tl.split(' ')[0]) + ') stands right before it, and a preposition takes a noun: the infinitive is the verb as a noun.' : it.role === 'caption' ? 'It stands alone at the head, with nothing before it: a heading names an action, the way English uses "-ing".' : 'Another verb comes first, and the infinitive is what that verb is about: its object.', 'So the infinitive is used ' + ROLE_EN[it.role] + '.'],
      'Look at the word right before the infinitive.', { k: 'role', tl: it.tl, role: it.role }, it.sp ? gviz(it.sp) : null);
    var alts = { 'r sḏm mdt': ['toward hearing the words', 'the words heard', 'he hears the words'], 'ḥr ḏd mꜣꜥt': ['on the truth, he said', 'the truth was said', 'he said the truth'], 'r jrt mꜣꜥt': ['toward the eye of Maat', 'Maat was done', 'he does what is right'],
      'rdjt ḥtp n nṯr': ['The offering gave to the god', 'The god gave an offering', 'He gives an offering to the god'], 'mꜣꜣ nṯr': ['The god sees', 'The god was seen', 'The god saw him'], 'rꜣ n prt m hrw': ['The mouth of a house in the day', 'He went out by day', 'The day went out of the spell'],
      'wḏ.n ḥm=f rdjt ḥtp': ['His Majesty commanded; he gave an offering', 'An offering commanded His Majesty', 'His Majesty was given an offering'], 'wḏ.n nsw jrt mꜣꜥt': ['The king commanded; he did what is right', 'What is right commanded the king', 'The king was commanded to do right'], 'mr.n=j sḏm mdt=k': ['I loved; I heard your words', 'Your words loved to hear me', 'I love your words, which hear me'] }[it.tl];
    return P('Choose the best translation of ' + tl(it.tl) + '.', mc(it.en, alts),
      ['Find the infinitive ' + tl(it.inf) + ': it is used ' + ROLE_EN[it.role] + '.', 'Translate it as a noun or with "to …" / "-ing": ' + q(it.en) + '.'], 'The infinitive is a noun; it has no subject of its own here.', { k: 'inftr', tl: it.tl }, it.sp ? gviz(it.sp) : null);
  });

  var INFSUB = [
    { tl: 'm-ḫt jjt=f', en: 'after he came (after his coming)', r: 'sub', why: 'jj "come" takes no object, so the suffix can only be its subject.' },
    { tl: 'r mꜣꜣ=f', en: 'in order to see him', r: 'obj', why: 'mꜣꜣ "see" takes an object, and here the suffix is what is seen.' },
    { tl: 'ḥr rdjt=f n=j', en: 'giving it to me', r: 'obj', why: 'rdj "give" needs an object; the giver is the subject of the main clause.' },
    { tl: 'm-ḫt ꜥnḫ=f', en: 'after he lived', r: 'sub', why: 'ꜥnḫ "live" takes no object, so the suffix is its subject.', lv: 2 },
    { tl: 'r ḏd=s', en: 'in order to say it', r: 'obj', why: 'ḏd "say" takes an object: what is said.', lv: 2 },
    { tl: 'm jjt=s', en: 'as she comes, in her coming', r: 'sub', why: 'jj "come" takes no object: =s is the one coming.', lv: 2 },
    { tl: 'rdjt ḥtp jn nsw', en: 'the giving of an offering by the king', r: 'agent', why: 'ḥtp, right after the infinitive, is the object; the doer is added with jn "by".', lv: 3 },
    { tl: 'sḏm mdt jn zꜣ=f', en: 'the hearing of the words by his son', r: 'agent', why: 'mdt is the object; jn "by" introduces the doer.', lv: 3 }];
  var RSUB = { sub: 'The subject (the one who does it)', obj: 'The object (the one it is done to)', agent: 'The object; the doer comes after jn "by"' };
  G('me2.inf-subject', function (R, ctx) {
    var it = bank(R, ctx, INFSUB), word = it.r === 'agent' ? it.tl.split(' ')[1] : it.tl.split(' ').pop().split('=').slice(1).map(function (x) { return '=' + x; })[0];
    if (it.r === 'agent') return P('In ' + tl(it.tl) + ', what is the noun ' + tl(word) + ' to the infinitive?', mc(RSUB.agent, [RSUB.sub, 'The verb of a new clause', 'A second infinitive']),
      [it.why, 'Translate: ' + q(it.en) + '.'], 'What does jn "by" introduce?', { k: 'infsub', tl: it.tl, r: it.r });
    return P('In ' + tl(it.tl) + ', is the suffix ' + tl(word) + ' the subject or the object of the infinitive?', mc(RSUB[it.r], [RSUB[it.r === 'sub' ? 'obj' : 'sub'], 'Neither: it shows the owner of a noun', 'It is part of the verb\'s root']),
      [it.why, 'Translate: ' + q(it.en) + '.'], 'Does the verb take an object?', { k: 'infsub', tl: it.tl, r: it.r });
  });

  /* ================================================================ unit: the sḏm=f */
  function nounSp(N) { return nsp(N); }
  G('me2.sdmf-form', function (R, ctx) {
    var L = lvl(ctx), k = R.pick(L === 1 ? ['sdm', 'dd', 'rx'] : TRANS_STRONG.concat(['anx', 'mn', 'xpr'])), v = VB[k];
    var useNoun = L >= 2 && R.chance(0.35), S = suf(R.pick(L === 1 ? ['j', 'k', 'f', 's'] : SUF.map(function (x) { return x.k; })));
    var N = R.pick(NOUN), subjTl = useNoun ? ' ' + N.tl : S.s, subjEn = useNoun ? N.en : who(S);
    var form = v.stem + subjTl, enS = useNoun ? cap(N.en) + ' ' + v.e[1] : cap(enPres(v, S));
    var spx = vsp(k), viz = spx ? gviz(spx + (useNoun ? (nounSp(N) ? ' ' + nounSp(N) : null) : '-' + S.sp)) : null;
    if (useNoun && !nounSp(N)) viz = null;
    if (R.coin()) return P('Write the sḏm=f of ' + tl(v.tl) + ' ' + q(v.e[0]) + ' with the subject ' + (useNoun ? tl(N.tl) + ' ' + q(N.en) : q(who(S))) + ': ' + q(enS) + '.', TL(form),
      ['The sḏm=f is the stem with its subject right after it.', useNoun ? 'A noun subject follows the verb as a separate word: ' + tl(form) + '.' : 'The suffix for ' + q(who(S)) + ' is ' + tl(S.s) + ': ' + tl(form) + mdcHint(form) + '.'],
      'Stem first, subject second.', { k: 'sdmf', v: k, s: useNoun ? N.tl : S.k });
    var wr = [cap(useNoun ? 'the ' + v.e[4] + ' of ' + N.en : S.pos + ' ' + v.e[4]), useNoun ? (v.tr ? 'He ' + v.e[1] + ' ' + N.en.replace(/^His/, 'his') : 'Make ' + N.en.replace(/^His/, 'his') + ' ' + v.e[0] + '!') : cap(v.e[0]) + '!'];
    var other = SUF.filter(function (x) { return x.sub !== S.sub && x.k !== 'tn' && x.k !== 't'; }); wr.push(cap(enPres(v, R.pick(other))));
    return P('Translate the sḏm=f ' + tl(form) + '.', mc(enS, wr),
      ['The stem is ' + tl(v.tl) + ' ' + q(v.e[0]) + '.', 'What follows is its subject: ' + (useNoun ? tl(N.tl) + ' ' + q(N.en) : tl(S.s) + ' ' + q(who(S))) + '.', 'On a verb the suffix is the subject, not "his" or "my": ' + q(enS) + '.'],
      'A suffix on a verb names who does it.', { k: 'sdmftr', v: k, s: useNoun ? N.tl : S.k }, viz);
  });

  var SVO = [['sdm', 'ḫrw', 'the voice', 'xrw'], ['dd', 'mꜣꜥt', 'the truth', 'maat'], ['rx', 'rn', 'the name', 'ren'], ['sdm', 'rn', 'the name', 'ren'], ['shtp', 'nṯr', 'the god', 'netjer'], ['sanx', 'rmṯ', 'the people', 'remetj'], ['dd', 'rn', 'the name', 'ren']];
  G('me2.sdmf-subject', function (R, ctx) {
    var L = lvl(ctx), it = R.pick(SVO), v = VB[it[0]], subs = NOUN.filter(function (n) { return n.tl !== it[1] && n.tl !== 'ḥm=f'; }), N = R.pick(subs);
    var right = v.stem + ' ' + N.tl + ' ' + it[1], en = cap(N.en) + ' ' + v.e[1] + ' ' + it[2];
    var adv = L === 3 && R.coin() ? R.pick([['m pr', 'in the house', 'G17 O1:Z1'], ['m njwt', 'in the town', 'G17 O49:X1*Z1']]) : null;
    if (adv) { right += ' ' + adv[0]; en += ' ' + adv[1]; }
    var vsp_ = vsp(it[0]), sp = vsp_ && nsp(N) && wsp(it[3]) ? [vsp_, nsp(N), wsp(it[3])].concat(adv ? [adv[2]] : []).join(' ') : null;
    if (L === 3 && R.coin()) return P('Write in transliteration, in Egyptian word order: ' + q(en + '.') + ' Use ' + tl(v.tl) + ' for ' + q(v.e[0]) + '.', TL(right),
      ['Egyptian puts the verb first: ' + tl(v.stem) + '.', 'Then the subject, ' + tl(N.tl) + ', then the object, ' + tl(it[1]) + (adv ? ', and the adverbial phrase last, ' + tl(adv[0]) : '') + '.', 'Answer: ' + tl(right) + '.'],
      'Verb, subject, object, then phrases of place or time.', { k: 'vso', tl: right });
    var w = [N.tl + ' ' + v.stem + ' ' + it[1], v.stem + ' ' + it[1] + ' ' + N.tl, it[1] + ' ' + v.stem + ' ' + N.tl].map(function (x) { return tl(x + (adv ? ' ' + adv[0] : '')); });
    return P('Which word order says ' + q(en + '.') + '?', mc(tl(right), w),
      ['Egyptian word order is verb, subject, object, then adverbs.', 'So: ' + tl(v.stem) + ' (verb), ' + tl(N.tl) + ' (subject), ' + tl(it[1]) + ' (object)' + (adv ? ', ' + tl(adv[0]) : '') + '.', 'Beware: ' + tl(v.stem + ' ' + it[1] + ' ' + N.tl) + ' would make ' + tl(it[1]) + ' the subject.'],
      'The verb comes first, and the word right after it is the subject.', { k: 'vso', tl: right }, sp ? gviz(sp) : null);
  });

  var SDMF_CTX = [
    { tl: 'ḥtp-dj-nsw wsjr dj=f prt-ḫrw', en: 'may he give an invocation offering', f: 'wish', w: ['he gave an invocation offering', 'he is given an invocation offering', 'giving an invocation offering'], why: 'In the offering formula, the sḏm=f after the god\'s name is a wish: "may he give".' },
    { tl: 'jw ḏd=f mꜣꜥt', en: 'he speaks the truth', f: 'pres', w: ['may he speak the truth', 'he spoke the truth', 'the truth was spoken'], why: 'After jw, a sḏm=f states what is generally so: "he speaks (always)".' },
    { tl: 'ḥꜣ sḏm=f', en: 'if only he would hear!', f: 'wish', w: ['he heard', 'he is heard', 'his hearing'], why: 'The particle ḥꜣ "would that" makes the sḏm=f a wish.', lv: 2 },
    { tl: 'jw sḏm=f mdt nbt', en: 'he hears every word', f: 'pres', w: ['may he hear every word', 'he heard every word', 'every word hears him'], why: 'After jw, the sḏm=f gives a general present.', lv: 2 },
    { tl: 'ḥtp-dj-nsw jnpw dj=f ḥtp', en: 'may he give an offering', f: 'wish', w: ['he gave an offering', 'Anubis is an offering', 'giving an offering'], why: 'In the offering formula, dj=f after the god\'s name is a wish.', lv: 2 },
    { tl: 'jr sḏm=k', en: 'if you listen', f: 'cond', w: ['you listened', 'may you listen', 'your listening'], why: 'After jr "if", the sḏm=f gives the condition; it often refers to the future.', lv: 3 },
    { tl: 'ꜥnḫ=k ḏt', en: 'may you live forever', f: 'wish', w: ['you lived forever', 'your life is forever', 'you are alive (a fact)'], why: 'A blessing: the sḏm=f is a wish, "may you live".', lv: 3 }];
  G('me2.sdmf-meaning', function (R, ctx) {
    var it = bank(R, ctx, SDMF_CTX);
    return P('What does the sḏm=f mean in ' + tl(it.tl) + '?', mc(cap(it.en), it.w.map(cap)),
      [it.why, 'So: ' + q(it.en) + '.'], 'Look at what comes before the verb.', { k: 'sdmfmean', tl: it.tl, f: it.f });
  });

  var WEAKF = [
    { f: 'jr=f', v: 'irj', en: 'he does', sp: 'D4-I9', note: 'The eye writes jr; the root jrj has lost its final weak j.' },
    { f: 'dj=f', v: 'rdj', en: 'he gives', sp: 'X8-I9', note: 'The conical loaf writes dj; rdj often drops its r.' },
    { f: 'mꜣꜣ=f', v: 'maa', en: 'he sees', sp: 'U1-G1-D4-I9', note: 'The doubled verb mꜣꜣ keeps both ꜣ in this form.' },
    { f: 'mr=f', v: 'mrj', en: 'he loves', note: 'mrj loses its final weak j.' },
    { f: 'gm=f', v: 'gmj', en: 'he finds', note: 'gmj loses its final weak j.', lv: 2 },
    { f: 'jn=f', v: 'jnj', en: 'he brings', note: 'jnj loses its final weak j.', lv: 2 },
    { f: 'jrr=f', v: 'irj', en: 'he does', sp: 'D4-D21-I9', note: 'Some forms double the r of a third-weak verb (jrr=f); it is still jrj.', lv: 3 },
    { f: 'mꜣ=f', v: 'maa', en: 'he sees', note: 'Some forms of a doubled verb write only one ꜣ; it is still mꜣꜣ.', lv: 3 }];
  G('me2.sdmf-weak', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, WEAKF), v = VB[it.v], shape = L === 1 ? R.pick(['dict', 'mc']) : R.pick(['dict', 'mc', 'tr']);
    var viz = it.sp ? gviz(it.sp) : null;
    if (shape === 'dict') return P('The sḏm=f ' + tl(it.f) + ' means ' + q(it.en) + '. Type the verb as a dictionary lists it.', TL(v.tl),
      [it.note, 'Take off the suffix ' + tl('=f') + ' and restore the full root: ' + tl(v.tl) + mdcHint(v.tl) + ', ' + q(v.e[0]) + '.'], 'Weak and doubled verbs change shape; the dictionary form is the full root.', { k: 'weakdict', f: it.f, v: it.v }, viz);
    if (shape === 'mc') { var others = WEAKF.filter(function (x) { return x.v !== it.v; }).map(function (x) { return tl(VB[x.v].tl) + ' ' + q(VB[x.v].e[0]); });
      return P('Which verb is ' + tl(it.f) + ' a form of?', mc(tl(v.tl) + ' ' + q(v.e[0]), R.shuffle(others).filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(0, 3)),
        [it.note, 'So ' + tl(it.f) + ' is the sḏm=f of ' + tl(v.tl) + ', ' + q(it.en) + '.'], 'Match the consonants to a root, allowing for a lost j or r.', { k: 'weakmc', f: it.f, v: it.v }, viz); }
    var obj = it.v === 'irj' ? ['mꜣꜥt', 'what is right'] : it.v === 'rdj' ? ['t', 'bread'] : it.v === 'maa' ? ['nṯr', 'the god'] : it.v === 'mrj' ? ['mꜣꜥt', 'what is right'] : it.v === 'gmj' ? ['z', 'the man'] : ['nbw', 'gold'];
    var en = cap(it.en + ' ' + obj[1]);
    return P('Translate ' + tl(it.f + ' ' + obj[0]) + '.', mc(en, ['His ' + VB[it.v].e[4] + ' of ' + obj[1], cap(obj[1]) + ' ' + VB[it.v].e[1] + ' him', cap(VB[it.v].e[0]) + ' ' + obj[1] + '!']),
      [it.note, 'The suffix =f is the subject and ' + tl(obj[0]) + ' is the object: ' + q(en) + '.'], 'Verb, subject, object.', { k: 'weaktr', f: it.f, v: it.v });
  });

  var RDJ = [
    { tl: 'rdj.n=f sḏm=j', en: 'he let me hear', w: ['he gave, and I heard', 'he gave my hearing', 'I let him hear'] },
    { tl: 'rdj.n nsw ꜥnḫ=j', en: 'the king let me live', w: ['the king gave me life and I lived', 'I let the king live', 'the king gave and I live'] },
    { tl: 'jmj sḏm=f', en: 'let him hear!', w: ['give him a hearing!', 'he gave, he heard', 'give, he hears'] },
    { tl: 'rdj.n=j ḫpr=f', en: 'I caused it to come into being', w: ['I gave, and it came into being', 'it caused me to come into being', 'I gave its form'], lv: 2 },
    { tl: 'rdj.n ḥm=f sḏm=j mdt', en: 'His Majesty let me hear the words', w: ['His Majesty gave the words, and I heard', 'I let His Majesty hear the words', 'His Majesty gave my words'], lv: 2 },
    { tl: 'jmj ꜥnḫ=f', en: 'let him live!', w: ['give him life!', 'he gives, he lives', 'he caused me to live'], lv: 3 },
    { tl: 'rdj.n=sn mꜣꜣ=j nṯr', en: 'they let me see the god', w: ['they gave, I saw the god', 'I let them see the god', 'they gave the god, I saw'], lv: 3 }];
  G('me2.rdj-sdmf', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 3 && R.chance(0.4)) {
      var pr = R.pick([['f', 'j', 'sdm', 'He let me hear.'], ['s', 'f', 'sdm', 'She let him hear.'], ['k', 'j', 'anx', 'You let me live.'], ['f', 'sn', 'sdm', 'He let them hear.'], ['sn', 'j', 'anx', 'They let me live.']]);
      var ans = 'rdj.n' + suf(pr[0]).s + ' ' + VB[pr[2]].stem + suf(pr[1]).s;
      return P('Write in transliteration with rdj.n=f and a sḏm=f: ' + q(pr[3]), TL(ans),
        ['"Let" (or "cause") is rdj followed by a sḏm=f; for the past, rdj stands in the sḏm.n=f: ' + tl('rdj.n' + suf(pr[0]).s) + '.', 'Then the sḏm=f of the verb with its own subject: ' + tl(VB[pr[2]].stem + suf(pr[1]).s) + '.', 'Answer: ' + tl(ans) + '.'],
        'Two verbs, each with its own subject.', { k: 'rdjw', tl: ans });
    }
    var it = bank(R, ctx, RDJ);
    return P('Translate ' + tl(it.tl) + '.', mc(cap(it.en), it.w.map(cap)),
      ['Here ' + tl(it.tl.split(' ')[0]) + ' is followed by a second verb with its own subject (a sḏm=f).', 'rdj (or the command jmj) + sḏm=f means "cause that…, let…", not "give".', 'So: ' + q(it.en) + '.'],
      'rdj + another sḏm=f: "let" or "cause".', { k: 'rdjtr', tl: it.tl });
  });
  /* ================================================================ unit: the sḏm.n=f */
  var SDMN_V = ['sdm', 'dd', 'rx', 'anx', 'smn', 'shtp', 'irj', 'mrj', 'gmj', 'hzj', 'rdj', 'jj', 'jnj'];
  function sdmn(k, subj) { return VB[k].stem + '.n' + subj; }
  G('me2.sdmnf-form', function (R, ctx) {
    var L = lvl(ctx), k = R.pick(L === 1 ? ['sdm', 'dd', 'irj', 'rdj'] : SDMN_V), v = VB[k];
    var shape = L === 1 ? R.pick(['write', 'write', 'dot']) : R.pick(['write', 'dot', 'read']);
    var useNoun = L >= 2 && R.chance(0.35), S = suf(R.pick(SUF_MAIN)), N = R.pick(NOUN), subj = useNoun ? ' ' + N.tl : S.s;
    var form = sdmn(k, subj), en = useNoun ? cap(N.en) + ' ' + v.e[2] : cap(enPast(v, S));
    var spx = k === 'irj' ? 'D4-N35' : k === 'rdj' ? 'D21:X8-N35' : k === 'sdm' ? 'S29-F21-G17-N35' : k === 'dd' ? 'I10:D46-N35' : null;
    var viz = spx && (!useNoun || nsp(N)) ? gviz(spx + (useNoun ? ' ' + nsp(N) : '-' + S.sp)) : null;
    if (shape === 'write') return P('Write the sḏm.n=f of ' + tl(v.tl) + ' ' + q(v.e[0]) + ': ' + q(en + '.'), TL(form),
      [v.cls === '3inf' || k === 'jnj' ? 'The stem drops the weak j: ' + tl(v.stem) + '.' : k === 'rdj' ? 'rdj keeps its r in the sḏm.n=f: ' + tl('rdj') + '.' : 'The stem is the root: ' + tl(v.stem) + '.', 'Add .n, then the subject ' + (useNoun ? tl(N.tl) : tl(S.s)) + ': ' + tl(form) + mdcHint(form) + '.'],
      'Stem + .n + subject.', { k: 'sdmn', v: k, s: useNoun ? N.tl : S.k });
    if (shape === 'dot') return P('In ' + tl(form) + ' ' + q(en) + ', what is the ' + tl('n') + ' after the stem?', mc('The .n that makes the sḏm.n=f', ['The preposition n "to, for"', 'The suffix pronoun =n "we, our"', 'The genitive n "of"']),
      ['It stands between the verb stem and the subject' + (useNoun ? ' noun' : ' pronoun ' + tl(S.s)) + '.', 'There, n is the ending of the sḏm.n=f, the form for completed action: ' + q(en) + '.', 'The preposition n would need something after it to point to, and the suffix =n would be the subject itself.'],
      'Where does it stand: between the verb and its subject?', { k: 'sdmndot' }, viz);
    var others = SUF.filter(function (x) { return x.sub !== S.sub; });
    return P('Translate ' + tl(form) + '.', mc(en, [useNoun ? cap(N.en) + ' ' + v.e[1] + ' to him' : cap(enPres(v, S)) + ' for us', useNoun ? cap(v.e[0]) + ' for ' + N.en.replace(/^His/, 'his') + '!' : cap(enPast(v, R.pick(others))), 'We ' + v.e[2]]),
      ['The .n between the stem and the subject marks the sḏm.n=f: completed action, usually past.', 'The subject is ' + (useNoun ? tl(N.tl) : tl(S.s)) + ': ' + q(en) + '.'], 'Read the .n as part of the verb form.', { k: 'sdmntr', v: k, s: useNoun ? N.tl : S.k }, viz);
  });

  var SDMN_M = [
    { tl: 'rdj.n=f t n z', en: 'he gave bread to the man', w: ['he gives bread to the man', 'may he give bread to the man', 'he will give bread to the man'] },
    { tl: 'sḏm.n=j ḫrw=f', en: 'I heard his voice', w: ['I hear his voice', 'may I hear his voice', 'his voice heard me'] },
    { tl: 'jr.n=f mꜣꜥt', en: 'he did what is right', w: ['he does what is right', 'he will do what is right', 'do what is right!'] },
    { tl: 'jj.n=sn m njwt', en: 'they came from the town', w: ['they come from the town', 'may they come from the town', 'they will come from the town'], lv: 2 },
    { tl: 'jr sḏm.n=k', en: 'if you have heard', w: ['if you will hear', 'you heard if', 'may you hear'], lv: 2, note: 'After jr "if" the sḏm.n=f is still completed action: "if you have heard", not "if you will hear".' },
    { tl: 'jr jr.n=f mꜣꜥt', en: 'if he has done what is right', w: ['if he will do what is right', 'he did what is right if', 'may he do what is right'], lv: 3, note: 'jr "if" stands first; then jr.n=f, the sḏm.n=f of jrj: completed action.' },
    { tl: 'rḫ.n=f rn=j', en: 'he knows my name', w: ['he will know my name', 'may he know my name', 'my name knows him'], lv: 3, note: 'With rḫ the completed action "he has learned" means "he knows".' }];
  G('me2.sdmnf-meaning', function (R, ctx) {
    var it = bank(R, ctx, SDMN_M);
    return P('Translate ' + tl(it.tl) + '.', mc(cap(it.en), it.w.map(cap)),
      [it.note || 'The .n marks the sḏm.n=f: an action seen as completed, usually in the past.', 'So: ' + q(it.en) + '.'], 'The sḏm.n=f is about completed action.', { k: 'sdmnmean', tl: it.tl });
  });

  var JWN = [
    { tl: 'jw rdj.n=j t n ḥqr', en: 'I gave bread to the hungry', lv: 1 },
    { tl: 'jw jr.n=j mꜣꜥt', en: 'I did what is right', lv: 1 },
    { tl: 'jw jj.n=j m njwt=j', en: 'I came from my town', lv: 1 },
    { tl: 'jw sḏm.n=j ḫrw=f', en: 'I heard his voice', lv: 2 },
    { tl: 'jw ḥz.n wj nsw', en: 'the king praised me', lv: 2 },
    { tl: 'jw gm.n=j zꜣ=f', en: 'I found his son', lv: 3 },
    { tl: 'jw jn.n=j nbw', en: 'I brought gold', lv: 3 }];
  G('me2.jw-sdmnf', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, JWN), parts = it.tl.split(' '), verb = parts[1];
    if (L >= 2 && R.chance(0.35)) return P('In ' + tl(it.tl) + ', what does ' + tl('jw') + ' do?', mc('It presents the clause as a statement of fact; it is usually not translated', ['It is the verb "is"', 'It is the verb "come" (jw)', 'It means "if"']),
      ['jw stands before the sḏm.n=f ' + tl(verb) + ' and introduces it as a statement.', 'English has no word for it: ' + q(cap(it.en) + '.')], 'Translate the sentence without jw first.', { k: 'jwrole', tl: it.tl });
    var root = verb.split('.')[0], vk = Object.keys(VB).filter(function (k) { return VB[k].stem === root; })[0], v = VB[vk];
    var rest = it.en.replace(/^(I|the king) \w+ ?/, '');
    var subjEn = /^the king/.test(it.en) ? 'the king' : 'I';
    var wr = [cap(subjEn + ' ' + (subjEn === 'I' ? 'am ' : 'is ') + v.e[4] + (rest ? ' ' + rest : '')), cap(subjEn + ' will ' + v.e[0] + (rest ? ' ' + rest : '')), cap('It is that ' + it.en)];
    return P('Translate ' + tl(it.tl) + ', a line in the style of a tomb autobiography.', mc(cap(it.en), wr),
      ['jw introduces a statement; it is not "is".', tl(verb) + ' is the sḏm.n=f of ' + tl(v.tl) + ' ' + q(v.e[0]) + ': completed action, here a past event.', 'So: ' + q(cap(it.en) + '.')],
      'jw + sḏm.n=f: "I did …", a fact about the past.', { k: 'jwtr', tl: it.tl });
  });

  /* ================================================================ unit: the stative */
  // [person key, English subject, endings accepted (first is the course's), description]
  var STAT = [
    ['1s', 'I', ['kj', 'kw', 'kwj'], 'I'], ['2s', 'you', ['tj'], 'you (one person)'], ['3ms', 'he', ['w', ''], 'he'], ['3fs', 'she', ['tj', 't'], 'she'],
    ['1p', 'we', ['wjn', 'wn'], 'we'], ['2p', 'you', ['tjwnj'], 'you (more than one)'], ['3p', 'they', ['w', ''], 'they']];
  var STAT_V = [['jj', 'come', 'come', 'have come', 'has come'], ['ꜥḥꜥ', 'stand', 'standing', 'am standing', 'is standing'], ['sḏr', 'lie down', 'lying down', 'am lying down', 'is lying down'], ['ꜥnḫ', 'live', 'alive', 'am alive', 'is alive'], ['mn', 'remain', 'firm', 'am firm', 'is firm']];
  function statEn(sv, p) { var be = { '1s': sv[3], '3ms': sv[4], '3fs': sv[4] }[p[0]]; if (be) return p[1] + ' ' + be; return p[1] + ' ' + sv[3].replace(/^am /, 'are ').replace(/^have /, 'have '); }
  function statForms(stem, p) { return p[2].map(function (e) { return e ? stem + '.' + e : stem; }); }
  G('me2.stative-endings', function (R, ctx) {
    var L = lvl(ctx), sv = R.pick(STAT_V), p = R.pick(L === 1 ? [STAT[0], STAT[2], STAT[3]] : STAT), shape = L === 1 ? R.pick(['write', 'who']) : R.pick(['write', 'who', 'dual']);
    if (shape === 'write') return P('Write the stative of ' + tl(sv[0]) + ' ' + q(sv[1]) + ' for ' + q(p[3]) + ' (' + q(statEn(sv, p)) + ').', TL(statForms(sv[0], p)),
      ['The stative adds an ending for its subject.', 'For ' + q(p[3]) + ' the ending is ' + (p[2][0] ? tl('.' + p[2][0]) : 'none') + (p[0] === '3ms' || p[0] === '3p' ? ' (often .w, often not written at all)' : p[0] === '1s' ? ' (also transliterated .kw or .kwj)' : '') + '.', 'Answer: ' + tl(statForms(sv[0], p)[0]) + '.'],
      'The stative endings are a set of their own, not the suffix pronouns.', { k: 'stat', v: sv[0], p: p[0] });
    if (shape === 'who') {
      var form = statForms(sv[0], p)[0], amb = p[0] === '2s' || p[0] === '3fs' ? 'you (one person) or she' : p[0] === '3ms' || p[0] === '3p' ? 'he or they' : p[3];
      if (p[0] === '3ms' || p[0] === '3p') form = sv[0] + '.w';
      var opts = ['I', 'you (one person) or she', 'he or they', 'we', 'you (more than one)'];
      return P('Which subject does the stative ending in ' + tl(form) + ' point to?', mc(cap(amb), opts.filter(function (x) { return x !== amb; }).map(cap)),
        ['The ending is ' + tl(form.slice(form.indexOf('.'))) + '.', p[0] === '2s' || p[0] === '3fs' ? '.tj serves both "you" (one person) and "she"; the subject word in the sentence tells which.' : p[0] === '3ms' || p[0] === '3p' ? '.w (or no ending) serves "he" and "they".' : 'This ending belongs to ' + q(p[3]) + ' only.'],
        'Learn the endings as a set: .kj, .tj, .w, .tj, .wjn, .tjwnj, .w.', { k: 'statwho', p: p[0] });
    }
    var dual = R.coin();
    return P(dual ? 'In ' + tl('nṯrtj') + ' ' + q('the two goddesses') + ', what is the ending -tj?' : 'In ' + tl('zꜣt=f jj.tj') + ' ' + q('his daughter has come') + ', what is the ending .tj?',
      mc(dual ? 'The feminine dual ending of a noun' : 'The stative ending for a feminine subject ("she")', [dual ? 'The stative ending for "she"' : 'The feminine dual ending of a noun', 'The infinitive ending -t', 'The suffix pronoun =ṯ "you"']),
      [dual ? 'It ends a noun, nṯrt "goddess": two of them make the dual nṯrtj.' : 'It follows its subject zꜣt=f as part of a verb, jj "come": that is the stative.', 'The two endings look alike; a stative comes after its subject, a dual ends a noun.'],
      'Is the word a noun or a verb?', { k: 'statdual', d: dual });
  });

  var STATM = [
    { tl: 'jw pr ḫtm.w', en: 'the house is sealed', w: ['the house sealed', 'the house seals', 'seal the house!'], t: 1 },
    { tl: 'jw nsw jj.w', en: 'the king has come (the king is here)', w: ['the king comes often', 'may the king come', 'the king was brought'], t: 0 },
    { tl: 'jw=f sḏr.w', en: 'he is lying down', w: ['he laid it down', 'he will lie down', 'lie down!'], t: 0 },
    { tl: 'jw ḫt nbt jr.tj', en: 'everything is done', w: ['everything did', 'everything does', 'she did everything'], t: 1, lv: 2 },
    { tl: 'jw mdt sḏm.tj', en: 'the words are heard', w: ['the words heard', 'the words hear', 'you heard the words'], t: 1, lv: 2 },
    { tl: 'jw=j ꜥḥꜥ.kj', en: 'I am standing', w: ['I stood it up', 'I will stand', 'he stood me up'], t: 0, lv: 2 },
    { tl: 'jw ꜥꜣ ḫtm.w', en: 'the door is sealed', w: ['the door sealed', 'the great one seals', 'the door will seal'], t: 1, lv: 3 },
    { tl: 'jw zꜣt=f ms.tj', en: 'his daughter is born', w: ['his daughter gave birth', 'his daughter gives birth', 'she gave birth to his daughter'], t: 1, lv: 3 }];
  G('me2.stative-meaning', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, STATM);
    if (L === 3 && R.chance(0.35)) return P('In ' + tl(it.tl) + ', is the stative active or passive in meaning?', mc(it.t ? 'Passive: a state that results from being acted on' : 'Not passive: the state the subject itself has reached', [it.t ? 'Active: the subject does the action' : 'Passive: the subject is acted on', 'Neither: it is an infinitive', 'Neither: it is the sḏm.n=f']),
      [it.t ? 'The verb is transitive, so its stative describes the subject as acted on.' : 'The verb is intransitive, so its stative describes the state its subject has reached.', 'Translate: ' + q(it.en) + '.'], 'Does the verb take an object?', { k: 'statvoice', tl: it.tl, t: it.t });
    return P('Translate ' + tl(it.tl) + '.', mc(cap(it.en), it.w.map(cap)),
      [it.t ? 'The verb takes an object, so its stative is passive: a state the subject is in after being acted on.' : 'The verb takes no object, so its stative is the state the subject has reached.', 'So: ' + q(it.en) + '.'],
      'Transitive verb: passive state. Intransitive verb: state reached.', { k: 'statmean', tl: it.tl });
  });

  var STATU = [
    { tl: 'mk wj jj.kj', en: 'look, I have come', subj: 'wj', sen: 'wj "me", the dependent pronoun after mk', w: 'jj.kj' },
    { tl: 'jw=f jj.w', en: 'he has come', subj: '=f', sen: 'the suffix =f on jw', w: 'jj.w' },
    { tl: 'mk sw ꜥnḫ.w', en: 'look, he is alive', subj: 'sw', sen: 'sw "him", the dependent pronoun after mk', w: 'ꜥnḫ.w', lv: 2 },
    { tl: 'jw zꜣt=j ꜥḥꜥ.tj', en: 'my daughter is standing', subj: 'zꜣt=j', sen: 'the noun zꜣt=j "my daughter"', w: 'ꜥḥꜥ.tj', lv: 2 },
    { tl: 'jw nṯr ḥtp.w', en: 'the god is content', subj: 'nṯr', sen: 'the noun nṯr "the god"', w: 'ḥtp.w', lv: 3 },
    { tl: 'mk ṯw jj.tj', en: 'look, you have come', subj: 'ṯw', sen: 'ṯw "you", the dependent pronoun after mk', w: 'jj.tj', lv: 3 }];
  G('me2.stative-use', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, STATU);
    if (L === 3 && R.chance(0.4)) {
      var w = R.pick([['Look, I have come.', ['mk wj jj.kj', 'mk wj jj.kw', 'mk wj jj.kwj'], 'mk + wj "me" + jj.kj'], ['He has come.', ['jw=f jj.w', 'jw=f jj'], 'jw=f + jj.w'], ['Look, he is alive.', ['mk sw ꜥnḫ.w', 'mk sw ꜥnḫ'], 'mk + sw "him" + ꜥnḫ.w'], ['I am standing.', ['jw=j ꜥḥꜥ.kj', 'jw=j ꜥḥꜥ.kw', 'jw=j ꜥḥꜥ.kwj'], 'jw=j + ꜥḥꜥ.kj']]);
      return P('Write in transliteration with a stative: ' + q(w[0]) + ' Use ' + tl('jj') + ' "come", ' + tl('ꜥnḫ') + ' "live" or ' + tl('ꜥḥꜥ') + ' "stand".', TL(w[1]),
        ['The subject comes first: after mk a dependent pronoun, after jw a suffix pronoun.', 'Then the stative with its ending: ' + w[2] + '.', 'Answer: ' + tl(w[1][0]) + '.'], 'Subject first, stative second.', { k: 'statw', tl: w[1][0] });
    }
    var first = it.tl.split(' ')[0].split('=')[0];
    return P('In ' + tl(it.tl) + ' ' + q(it.en) + ', which word is the subject of the stative ' + tl(it.w) + '?', mc(tl(it.subj), [tl(it.w), tl(first), 'There is none: it comes after the stative']),
      ['The stative follows its subject, the way an adjective follows its noun.', 'The subject here is ' + it.sen + '.'], 'Look before the stative, not after it.', { k: 'statsubj', tl: it.tl });
  });

  var SVS = [
    { tl: 'jj.n=f', en: 'he came', f: 'n' }, { tl: 'jw=f jj.w', en: 'he has come (he is here)', f: 's' }, { tl: 'sḏm.n=j', en: 'I heard', f: 'n' },
    { tl: 'mk wj ꜥḥꜥ.kj', en: 'look, I am standing', f: 's' }, { tl: 'rdj.n=sn', en: 'they gave', f: 'n', lv: 2 }, { tl: 'jw pr ḫtm.w', en: 'the house is sealed', f: 's', lv: 2 },
    { tl: 'gm.n=f sw', en: 'he found him', f: 'n', lv: 2 }, { tl: 'jw zꜣt=f ms.tj', en: 'his daughter is born', f: 's', lv: 3 }, { tl: 'jr.n nsw', en: 'the king did', f: 'n', lv: 3 },
    { tl: 'jw nsw jj.w', en: 'the king has come', f: 's', lv: 3 }, { tl: 'mk sw sḏr.w', en: 'look, he is lying down', f: 's' }, { tl: 'sḏr.n=f', en: 'he lay down', f: 'n' },
    { tl: 'jw=j ꜥnḫ.kj', en: 'I am alive', f: 's', lv: 2 }, { tl: 'ꜥnḫ.n=j', en: 'I lived', f: 'n', lv: 2 }, { tl: 'jw=sn jj.w', en: 'they have come', f: 's', lv: 3 }, { tl: 'jj.n=sn', en: 'they came', f: 'n', lv: 3 }];
  G('me2.stative-vs-sdmnf', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, SVS), isN = it.f === 'n';
    if (L >= 2 && R.chance(0.4)) {
      var pair = R.pick([['sḏr.n=f', 'mk sw sḏr.w', 'he lay down (an act)', 'look, he is lying down (a state)'], ['ꜥḥꜥ.n=j', 'jw=j ꜥḥꜥ.kj', 'I stood up (an act)', 'I am standing (a state)'], ['jj.n=sn', 'jw=sn jj.w', 'they came (an act)', 'they have come, they are here (a state)'], ['jj.n=f', 'jw=f jj.w', 'he came (an act)', 'he has come, he is here (a state)'], ['ḫtm.n=f pr', 'jw pr ḫtm.w', 'he sealed the house (an act)', 'the house is sealed (a state)'], ['jr.n=f ḫt nbt', 'jw ḫt nbt jr.tj', 'he did everything (an act)', 'everything is done (a state)']]);
      var askState = R.coin();
      return P('Which one describes ' + (askState ? 'a state' : 'an act that was done') + ': ' + q(askState ? pair[3] : pair[2]) + '?', mc(tl(askState ? pair[1] : pair[0]), [tl(askState ? pair[0] : pair[1])]),
        [tl(pair[0]) + ' is the sḏm.n=f: the subject comes after the verb, and it reports an act.', tl(pair[1]) + ' has its subject first and a stative ending: it describes a state.'], 'Where is the subject?', { k: 'svspair', tl: askState ? pair[1] : pair[0] });
    }
    if (R.chance(0.4)) { var oth = R.sample(SVS.filter(function (x) { return x.tl !== it.tl && x.en !== it.en; }), 3).map(function (x) { return cap(x.en); });
      return P('Translate ' + tl(it.tl) + '.', mc(cap(it.en), oth),
        [isN ? 'Verb first, .n, then the subject: a sḏm.n=f, an act that was done.' : 'Subject first, then a stative: a state.', 'So: ' + q(it.en) + '.'], 'Find the subject first.', { k: 'svstr', tl: it.tl }); }
    return P('Is ' + tl(it.tl) + ' ' + q(it.en) + ' a sḏm.n=f or a stative?', mc(isN ? 'The sḏm.n=f: the subject comes after the verb' : 'The stative: the subject comes first, then the verb with a stative ending', [isN ? 'The stative: the subject comes first, then the verb with a stative ending' : 'The sḏm.n=f: the subject comes after the verb']),
      [isN ? 'The .n and the subject after it mark the sḏm.n=f.' : 'The subject stands before the verb, and the verb carries a stative ending (or none, for "he").', 'It is ' + (isN ? 'a sḏm.n=f, reporting an act.' : 'a stative, describing a state.')], 'Find the subject: before or after the verb?', { k: 'svs', tl: it.tl, f: it.f });
  });
  /* ================================================================ unit: participles and relative forms */
  var APART = [
    { tl: 'sḏm mdt', en: 'one who hears the words', w: ['he hears the words', 'hear the words!', 'the words hear'] },
    { tl: 'ḏd mꜣꜥt', en: 'one who speaks the truth', w: ['he speaks the truth', 'speak the truth!', 'the truth speaks'] },
    { tl: 'rḫ rn=f', en: 'one who knows his name', w: ['he knows his name', 'know his name!', 'his name knows'] },
    { tl: 'z sḏm ḫrw', en: 'the man who hears the voice', w: ['the man hears the voice', 'the voice hears the man', 'hear the man\'s voice!'], lv: 2 },
    { tl: 'mrr mꜣꜥt', en: 'one who loves what is right', w: ['he loves what is right', 'what is right loves', 'love what is right!'], lv: 2, note: 'mrr: third-weak verbs double their second consonant in this participle.' },
    { tl: 'nṯr sꜥnḫ rmṯ', en: 'the god who gives life to the people', w: ['the god gives life to the people', 'the people give life to the god', 'give life to the god\'s people!'], lv: 2 },
    { tl: 'zꜣt ḏdt mꜣꜥt', en: 'the daughter who speaks the truth', w: ['the daughter speaks the truth', 'the truth speaks to the daughter', 'the daughter of the one who speaks'], lv: 3, note: 'ḏdt takes -t because it describes zꜣt, a feminine noun.' },
    { tl: 'nṯrw sḏmw ḫrw=j', en: 'the gods who hear my voice', w: ['the gods hear my voice', 'my voice hears the gods', 'the gods\' hearing of my voice'], lv: 3, note: 'sḏmw takes -w because it describes nṯrw, a plural.' }];
  G('me2.active-participles', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, APART);
    if (L >= 2 && R.chance(0.3)) {
      var part = it.tl.split(' ')[it.tl.split(' ').length > 2 || /^(z|nṯr|zꜣt|nṯrw) /.test(it.tl) ? 1 : 0];
      return P('In ' + tl(it.tl) + ', what is ' + tl(part) + '?', mc('An active participle, "one who …"', ['A sḏm=f with its subject left out', 'An infinitive, "to …"', 'An imperative, a command']),
        ['It describes a person, the way an adjective does: ' + q(it.en) + '.', 'A sḏm=f always has its subject after it; here nothing after the verb is its subject.'], 'Does the verb have a subject of its own?', { k: 'aptwhat', tl: it.tl });
    }
    return P('Translate ' + tl(it.tl) + '.', mc(cap(it.en), it.w.map(cap)),
      [(it.note ? it.note + ' ' : '') + 'The verb here is an active participle: a verbal adjective, "one who …".', 'So: ' + q(it.en) + '.'], 'A participle describes someone; it is not a verb with a hidden subject.', { k: 'apttr', tl: it.tl });
  });

  var PPART = [
    { tl: 'mrj nb=f', en: 'beloved of his lord', a: 0, w: ['one who loves his lord', 'his lord loves', 'love his lord!'] },
    { tl: 'ḥzj nb=f', en: 'praised by his lord', a: 0, w: ['one who praises his lord', 'his lord praises', 'praise his lord!'] },
    { tl: 'mrj jmn', en: 'beloved of Amun', a: 0, w: ['one who loves Amun', 'Amun loves', 'love Amun!'] },
    { tl: 'dj ꜥnḫ', en: 'given life', a: 0, w: ['one who gives life', 'give life!', 'life gives'], lv: 2 },
    { tl: 'ḫt nbt rdjt n=f', en: 'everything that was given to him', a: 0, w: ['everything that he gave', 'he gave everything', 'everything gives to him'], lv: 2 },
    { tl: 'sḏm mdt', en: 'one who hears the words', a: 1, w: ['the words that were heard', 'hear the words!', 'the words hear'], lv: 2 },
    { tl: 'jrt n=f', en: 'what was done for him', a: 0, w: ['what he did', 'one who does for him', 'do it for him!'], lv: 3 },
    { tl: 'ḏd mꜣꜥt', en: 'one who speaks the truth', a: 1, w: ['the truth that was spoken', 'speak the truth!', 'the truth speaks'], lv: 3 }];
  G('me2.passive-participles', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, PPART);
    if (R.chance(L === 1 ? 0.5 : 0.35)) return P('Is the participle in ' + tl(it.tl) + ' ' + q(it.en) + ' active or passive?', mc(it.a ? 'Active: the one described does the action' : 'Passive: the one described receives the action', [it.a ? 'Passive: the one described receives the action' : 'Active: the one described does the action']),
      [it.a ? 'The person described is the one who does it: ' + q(it.en) + '.' : 'The person or thing described is acted on' + (/nb=f|jmn/.test(it.tl) ? '; the noun after it names who does the loving or praising' : '') + ': ' + q(it.en) + '.'], 'Who does the action: the one described, or someone else?', { k: 'ppvoice', tl: it.tl, a: it.a });
    return P('Translate ' + tl(it.tl) + '.', mc(cap(it.en), it.w.map(cap)),
      [it.a ? 'This participle is active: ' + q(it.en) + '.' : 'This participle is passive: the one described is acted on' + (/nb=f|jmn/.test(it.tl) ? ', and the noun after it is the one who acts (a direct genitive: "beloved of …")' : '') + '.', 'So: ' + q(it.en) + '.'],
      'Active and passive participles often look the same: let the sense decide.', { k: 'pptr', tl: it.tl });
  });

  // [antecedent tl, English, gender/number] and the participle of sḏm or ḏd
  var PA_N = [['z', 'the man', 'm'], ['zꜣt', 'the daughter', 'f'], ['nṯrw', 'the gods', 'p'], ['nṯrt', 'the goddess', 'f'], ['nsw', 'the king', 'm'], ['rmṯ', 'the people', 'p'], ['ḥmt', 'the wife', 'f'], ['zꜣw', 'the sons', 'p']];
  var PA_END = { m: '', f: 't', p: 'w' };
  G('me2.participle-agreement', function (R, ctx) {
    var L = lvl(ctx), vb = R.pick(L === 1 ? [['sḏm', 'hears', 'hear'], ['ḏd', 'speaks', 'speak'], ['rḫ', 'knows', 'know']] : [['sḏm', 'hears', 'hear'], ['ḏd', 'speaks', 'speak'], ['rḫ', 'knows', 'know'], ['mrr', 'loves', 'love'], ['jrr', 'does', 'do'], ['sꜥnḫ', 'gives life to', 'give life to']]), N = R.pick(L === 1 ? PA_N.slice(0, 3) : PA_N);
    var obj = { 'sḏm': ['ḫrw', 'the voice'], 'ḏd': ['mꜣꜥt', 'the truth'], 'rḫ': ['rn', 'the name'], mrr: ['mꜣꜥt', 'what is right'], jrr: ['mꜣꜥt', 'what is right'], 'sꜥnḫ': ['rmṯ', 'the people'] }[vb[0]];
    if (vb[0] === 'sꜥnḫ' && N[0] === 'rmṯ') N = PA_N[0];
    var form = vb[0] + PA_END[N[2]], phr = N[0] + ' ' + form + ' ' + obj[0], en = N[1] + ' who ' + (N[2] === 'p' ? vb[2] : vb[1]) + ' ' + obj[1];
    var alone = L === 3 && R.chance(0.35);
    if (alone) { var g = R.pick([['m', 'the one who ' + vb[1] + ' ' + obj[1]], ['f', 'she who ' + vb[1] + ' ' + obj[1]], ['p', 'those who ' + vb[2] + ' ' + obj[1]]]);
      var f2 = vb[0] + PA_END[g[0]] + ' ' + obj[0];
      return P('A participle can stand alone as a noun. Write ' + q(g[1]) + ' with the participle of ' + tl(vb[0]) + '.', TL(f2),
        ['With no noun to describe, the participle itself is the noun; it still takes the ending of the person meant.', g[0] === 'm' ? 'One man: no ending.' : g[0] === 'f' ? 'A woman: -t.' : 'Several people: -w.', 'Answer: ' + tl(f2) + '.'], 'The ending shows who is meant.', { k: 'paalone', tl: f2 }); }
    if (R.coin() || L === 1) return P('Write ' + q(en) + ' in transliteration, with the participle of ' + tl(vb[0]) + ' after ' + tl(N[0]) + '.', TL(phr),
      ['The participle follows the noun and agrees with it, like an adjective.', tl(N[0]) + ' is ' + (N[2] === 'm' ? 'masculine singular: no ending' : N[2] === 'f' ? 'feminine: add -t' : 'plural: add -w') + '.', 'Answer: ' + tl(phr) + '.'],
      'Masculine: no ending; feminine: -t; plural: -w.', { k: 'pagree', tl: phr });
    var forms = [vb[0], vb[0] + 't', vb[0] + 'w'];
    return P('Which form of the participle fits? ' + tl(N[0] + ' … ' + obj[0]) + ' ' + q(en), mc(tl(form), forms.filter(function (x) { return x !== form; }).map(tl)),
      ['The participle agrees with ' + tl(N[0]) + ', which is ' + (N[2] === 'm' ? 'masculine singular' : N[2] === 'f' ? 'feminine' : 'plural') + '.', 'So: ' + tl(form) + '.'], 'Agreement with the noun described.', { k: 'pagreemc', tl: phr });
  });

  var RELF = [
    ['rn', 'the name', 'm', 'dd', 'f', 'that he said'], ['pr', 'the house', 'm', 'irj', 'f', 'that he made'], ['t', 'the bread', 'm', 'rdj', 'j', 'that I gave'],
    ['ḫt', 'the thing', 'f', 'rdj', 'f', 'that he gave'], ['mꜣꜥt', 'the truth', 'f', 'dd', 'j', 'that I said'], ['zꜣt', 'the daughter', 'f', 'mrj', 'f', 'whom he loved'],
    ['njwt', 'the town', 'f', 'irj', 'f', 'that he made'], ['mdt', 'the words', 'f', 'sdm', 'j', 'that I heard'], ['ḫrw', 'the voice', 'm', 'sdm', 'n', 'that we heard']];
  function relf(r) { return r[0] + ' ' + VB[r[3]].stem + (r[2] === 'f' ? 't' : '') + '.n=' + suf(r[4]).s.slice(1); }
  G('me2.relative-forms', function (R, ctx) {
    var L = lvl(ctx), r = R.pick(L === 1 ? RELF.filter(function (x) { return x[2] === 'm'; }) : RELF), form = relf(r), en = r[1] + ' ' + r[5];
    var sp = r[0] === 'rn' && r[3] === 'dd' ? 'D21:N35 I10:D46-N35-I9' : r[0] === 'pr' ? 'O1:Z1 D4-N35-I9' : null;
    if (L >= 2 && R.coin()) return P('Write ' + q(en) + ' with a relative form of ' + tl(VB[r[3]].tl) + ' ' + q(VB[r[3]].e[0]) + '.', TL(form),
      ['The relative form is the sḏm.n=f with its own subject, placed after the noun it describes.', r[2] === 'f' ? tl(r[0]) + ' is feminine, so the verb takes -t before the .n: ' + tl(VB[r[3]].stem + 't.n') + '.' : tl(r[0]) + ' is masculine: no extra ending.', 'Answer: ' + tl(form) + '.'],
      'Noun + relative form (stem + .n + subject); feminine nouns add -t.', { k: 'relw', tl: form });
    var S = suf(r[4]), vv = VB[r[3]];
    var w = [cap(r[1]) + ' ' + vv.e[2] + ' ' + S.obj, cap(S.sub) + ' ' + vv.e[2] + ' ' + r[1], cap(r[1]) + '; ' + S.sub + ' ' + vv.e[2]];
    return P('Translate the phrase ' + tl(form) + '.', mc(cap(en), w),
      ['The verb after the noun is a relative form: it describes the noun and has its own subject, ' + tl(S.s) + '.', 'Read it as one phrase, "' + r[1] + ' which/that…": ' + q(en) + '.'], 'The verb describes the noun before it.', { k: 'reltr', tl: form }, sp ? gviz(sp) : null);
  });

  var NTJ_N = [['z', 'the man', 'm'], ['zꜣt', 'the daughter', 'f'], ['nṯrw', 'the gods', 'p'], ['rmṯ', 'the people', 'p'], ['nṯrt', 'the goddess', 'f'], ['nsw', 'the king', 'm']];
  var NTJ = { m: 'ntj', f: 'ntt', p: 'ntjw' }, JWTJ = { m: 'jwtj', f: 'jwtt', p: 'jwtjw' };
  var NTJ_P = [['m pr', 'in the house'], ['m njwt', 'in the town'], ['m pt', 'in the sky'], ['ḥr tꜣ', 'on earth']];
  G('me2.ntj', function (R, ctx) {
    var L = lvl(ctx), N = R.pick(NTJ_N), pp = R.pick(NTJ_P), shape = L === 1 ? R.pick(['write', 'pick']) : L === 2 ? R.pick(['write', 'pick', 'neg']) : R.pick(['whose', 'write', 'neg']);
    var be = N[2] === 'p' ? 'are' : 'is', en = N[1] + ' who ' + be + ' ' + pp[1];
    if (shape === 'write') { var ans = N[0] + ' ' + NTJ[N[2]] + ' ' + pp[0];
      return P('Write ' + q(en) + ' in transliteration with ' + tl('ntj') + '.', TL(ans),
        ['ntj agrees with the noun it describes: ' + tl('ntj') + ' (masculine), ' + tl('ntt') + ' (feminine), ' + tl('ntjw') + ' (plural).', tl(N[0]) + ' is ' + (N[2] === 'm' ? 'masculine' : N[2] === 'f' ? 'feminine' : 'plural') + ': ' + tl(NTJ[N[2]]) + '.', 'Answer: ' + tl(ans) + '.'],
        'Noun + ntj (agreeing) + the rest of the clause.', { k: 'ntjw', tl: ans }, N[0] === 'z' && pp[0] === 'm pr' ? null : null); }
    if (shape === 'pick') return P('Which form fits? ' + tl(N[0] + ' … ' + pp[0]) + ' ' + q(en), mc(tl(NTJ[N[2]]), ['ntj', 'ntt', 'ntjw'].filter(function (x) { return x !== NTJ[N[2]]; }).map(tl)),
      ['ntj agrees in gender and number with ' + tl(N[0]) + '.', 'So: ' + tl(NTJ[N[2]]) + '.'], 'Masculine ntj, feminine ntt, plural ntjw.', { k: 'ntjmc', n: N[0] }, N[0] === 'z' ? gviz('O34-A1 N35:X1-Z4 ' + (pp[0] === 'm pr' ? 'G17 O1:Z1' : pp[0] === 'm njwt' ? 'G17 O49:X1*Z1' : pp[0] === 'm pt' ? 'G17 Q3:X1-N1' : 'D2:Z1 N16:Z1')) : null);
    if (shape === 'neg') { var M = R.pick([['z', 'a man', 'm', 'zꜣ=f', 'who has no son'], ['zꜣt', 'a daughter', 'f', 'jt=s', 'who has no father'], ['rmṯ', 'people', 'p', 'pr=sn', 'who have no house']]), a2 = M[0] + ' ' + JWTJ[M[2]] + ' ' + M[3];
      return P('The negative of ntj is ' + tl('jwtj') + ', "who … not". Write ' + q(M[1] + ' ' + M[4]) + ' (literally "' + M[1] + ' who not his/her/their …").', TL(a2),
        ['jwtj agrees like ntj: ' + tl('jwtj') + ', ' + tl('jwtt') + ', ' + tl('jwtjw') + '.', tl(M[0]) + ' is ' + (M[2] === 'm' ? 'masculine' : M[2] === 'f' ? 'feminine' : 'plural') + ': ' + tl(JWTJ[M[2]]) + ', then the noun with a suffix pointing back.', 'Answer: ' + tl(a2) + '.'],
        'jwtj + noun + suffix: "who has no …".', { k: 'jwtj', tl: a2 }); }
    var W = R.pick([['zꜣt', 'the daughter', 'f', 'jt=s', 'whose father is in the house', 'm pr'], ['z', 'the man', 'm', 'zꜣt=f', 'whose daughter is in the town', 'm njwt'], ['nṯrw', 'the gods', 'p', 'pr=sn', 'whose house is in the sky', 'm pt']]);
    var a3 = W[0] + ' ' + NTJ[W[2]] + ' ' + W[3] + ' ' + W[5];
    return P('Write ' + q(W[1] + ' ' + W[4]) + ': ' + tl(W[0] + ' … ' + W[3] + ' ' + W[5]) + '. Which form of ntj goes in the gap?', mc(tl(NTJ[W[2]]), ['ntj', 'ntt', 'ntjw'].filter(function (x) { return x !== NTJ[W[2]]; }).map(tl)),
      ['ntj agrees with the noun it describes, ' + tl(W[0]) + ', not with the subject of its own clause, ' + tl(W[3]) + '.', 'So: ' + tl(a3) + '.'], 'Agree with the noun before ntj.', { k: 'ntjwhose', tl: a3 });
  });

  /* ================================================================ unit: the passive */
  G('me2.tw-passive', function (R, ctx) {
    var L = lvl(ctx), shape = L === 1 ? R.pick(['write', 'tr']) : R.pick(['write', 'tr', 'what']);
    var k = R.pick(['sdm', 'dd', 'rx', 'smn', 'shtp']), v = VB[k], S = suf(R.pick(['f', 's', 'j', 'k', 'sn']));
    var useNounOnly = k === 'dd' || k === 'smn';
    var useNoun = useNounOnly || L >= 2 && R.chance(0.4), N = R.pick([['ḫrw', 'the voice', 'xrw'], ['mdt', 'the words'], ['rn', 'the name', 'ren'], ['nsw', 'the king', 'nesu'], ['nṯr', 'the god', 'netjer']]);
    var TWN = { sdm: [['ḫrw', 'the voice', 'xrw'], ['mdt', 'the words'], ['nsw', 'the king', 'nesu']], dd: [['mdt', 'the words'], ['rn', 'the name', 'ren'], ['mꜣꜥt', 'the truth', 'maat']],
      rx: [['rn', 'the name', 'ren'], ['nsw', 'the king', 'nesu']], smn: [['rn', 'the name', 'ren']], shtp: [['nṯr', 'the god', 'netjer']] };
    N = R.pick(TWN[k]);
    var form = v.stem + '.tw' + (useNoun ? ' ' + N[0] : S.s), be = useNoun ? (N[0] === 'mdt' ? 'are' : 'is') : S.sub === 'I' ? 'am' : S.p === 3 && !S.pl ? 'is' : 'are';
    var en = cap((useNoun ? N[1] : S.sub) + ' ' + be + ' ' + v.e[3]);
    if (shape === 'write') return P('Write the passive with .tw: ' + q(en + '.') + ' Use ' + tl(v.tl) + ' ' + q(v.e[0]) + '.', TL(form),
      ['Put .tw between the stem and the subject.', 'The subject of the passive is the one acted on: ' + (useNoun ? tl(N[0]) : tl(S.s)) + '.', 'Answer: ' + tl(form) + mdcHint(form) + '.'], 'Stem + .tw + subject.', { k: 'tww', tl: form });
    if (shape === 'tr') return P('Translate ' + tl(form) + '.', mc(en, [useNoun ? cap(N[1]) + ' ' + v.e[1] + ' you' : cap(enPres(v, S)) + ' you', cap(enPres(v, suf('k'))) + (useNoun ? ' ' + N[1] : ' ' + S.obj), useNoun ? 'You ' + v.e[2] + ' ' + N[1] : cap(enPres(v, S))]),
      ['.tw between the stem and the subject makes the sḏm=f passive.', 'So the subject is acted on: ' + q(en) + '.', 'It is not the pronoun ṯw "you", which is a separate word (with ṯ, not t).'], 'What does .tw do to the verb?', { k: 'twtr', tl: form }, vsp(k) && (!useNoun || N[2]) ? gviz(vsp(k) + '-' + XW.tw.sp + (useNoun ? ' ' + wsp(N[2]) : '-' + S.sp)) : null);
    return P('In ' + tl(form) + ', what is ' + tl('.tw') + '?', mc('The passive ending: "is …ed"', ['The dependent pronoun ṯw "you"', 'The feminine ending -t with the plural -w', 'The infinitive ending']),
      ['It stands between the verb stem and the subject, where the .n of the sḏm.n=f would stand.', 'That is the passive ending: ' + q(en) + '. The pronoun "you" is ṯw, with ṯ.'], 'Where does it stand?', { k: 'twwhat' });
  });

  var OPASS = [
    { tl: 'sḏm.tw=f', en: 'he is heard', k: 'tw' }, { tl: 'jw pr ḫtm.w', en: 'the house is sealed', k: 'stat' }, { tl: 'mrj nb=f', en: 'beloved of his lord', k: 'part' },
    { tl: 'rdj n=j t', en: 'bread was given to me', k: 'psdmf', lv: 2 }, { tl: 'rdj.tw ḥtp n nṯr', en: 'an offering is given to the god', k: 'tw', lv: 2 }, { tl: 'jw ḫt nbt jr.tj', en: 'everything is done', k: 'stat', lv: 2 },
    { tl: 'ḥzj nb=f', en: 'praised by his lord', k: 'part', lv: 3 }, { tl: 'ms zꜣ n nsw', en: 'a son was born to the king', k: 'psdmf', lv: 3 }];
  var OPK = { tw: 'The sḏm.tw=f (with .tw)', stat: 'The stative of a transitive verb', part: 'A passive participle', psdmf: 'The passive sḏm=f (no .tw, no ending to see)' };
  G('me2.other-passives', function (R, ctx) {
    var it = bank(R, ctx, OPASS);
    return P('Which kind of passive is ' + tl(it.tl) + ' ' + q(it.en) + '?', mc(OPK[it.k], Object.keys(OPK).filter(function (x) { return x !== it.k; }).map(function (x) { return OPK[x]; })),
      [it.k === 'tw' ? 'The .tw marks it.' : it.k === 'stat' ? 'The subject comes first and the verb has a stative ending: a state that results from being acted on.' : it.k === 'part' ? 'It describes someone as acted on, like an adjective; the noun after it is the doer.' : 'The verb comes first with no .tw; only the sense shows it is passive: the passive sḏm=f.', 'So it is ' + OPK[it.k].charAt(0).toLowerCase() + OPK[it.k].slice(1) + '.'],
      'Look for .tw first; then for a subject before the verb; then for a verb describing a noun.', { k: 'opass', tl: it.tl, c: it.k });
  });
  /* ================================================================ unit: negation */
  var NEGV = [['sḏm', 'hear', 'heard'], ['ḏd', 'say', 'said'], ['jr', 'do', 'did', 'jrj'], ['gm', 'find', 'found', 'gmj']];
  G('me2.neg-n', function (R, ctx) {
    var L = lvl(ctx), v = R.pick(NEGV), S = suf(R.pick(['f', 's', 'j', 'k', 'sn'])), shape = L === 1 ? R.pick(['tr', 'tr', 'write']) : R.pick(['tr', 'write', 'which']);
    var past = S.sub + ' did not ' + v[1], cannot = S.sub + ' cannot ' + v[1], doesnt = S.sub + (S.p === 3 && !S.pl ? ' does not ' : ' do not ') + v[1], f1 = 'n ' + v[0] + S.s, f2 = 'n ' + v[0] + '.n' + S.s;
    var askN = R.coin();
    if (shape === 'tr') return P('Translate ' + tl(askN ? f2 : f1) + '.', mc(cap(askN ? cannot + ' (' + doesnt + ')' : past), [cap(askN ? past : cannot + ' (' + doesnt + ')'), cap(S.sub + ' ' + v[2]), cap(S.sub + ' will not ' + v[1])]),
      [askN ? 'n + sḏm.n=f is the negation of the present: ' + q(cannot) + ' or ' + q(doesnt) + '. The .n does not make it past.' : 'n + sḏm=f is the negation of the past: ' + q(past) + '.', 'The two negated forms seem to swap their meanings; learn them as a pair.'],
      'n sḏm=f: did not. n sḏm.n=f: cannot, does not.', { k: 'negn', f: askN ? 'n' : 'f', v: v[0] });
    if (shape === 'write') return P('Write in transliteration with the negative ' + tl('n') + ': ' + q(cap(askN ? cannot : past) + '.'), TL(askN ? f2 : f1),
      [askN ? '"Cannot / does not" is n + the sḏm.n=f.' : '"Did not" is n + the sḏm=f, with no .n.', 'Answer: ' + tl(askN ? f2 : f1) + '.'], 'The negated forms swap: past uses the sḏm=f.', { k: 'negnw', f: askN ? 'n' : 'f', v: v[0] });
    return P('Which form says ' + q(cap(askN ? cannot : past)) + '?', mc(tl(askN ? f2 : f1), [tl(askN ? f1 : f2), tl(v[0] + '.n' + S.s), tl('nn ' + v[0] + S.s)]),
      ['n sḏm=f is "did not"; n sḏm.n=f is "cannot, does not"; nn sḏm=f is "will not".', 'So: ' + tl(askN ? f2 : f1) + '.'], 'Remember the swap.', { k: 'negnmc', f: askN ? 'n' : 'f', v: v[0] });
  });

  var NN = [
    { tl: 'nn mw', en: 'there is no water', k: 'neg' }, { tl: 'nn zꜣ=f', en: 'he has no son (there is no son of his)', k: 'neg' }, { tl: 'nn sḏm=f', en: 'he will not hear', k: 'fut' },
    { tl: 'nn n rmṯ', en: 'these people', k: 'dem', lv: 2 }, { tl: 'nn ḏd=j grg', en: 'I will not tell a lie', k: 'fut', lv: 2 }, { tl: 'nn wn mw', en: 'there is no water', k: 'neg', lv: 2 },
    { tl: 'nn n nṯrw', en: 'these gods', k: 'dem', lv: 3 }, { tl: 'nn ḥqꜣ m njwt', en: 'there is no ruler in the town', k: 'neg', lv: 3 }];
  var NNK = { neg: 'The negative "there is no …"', fut: 'The negative of the future, "will not"', dem: 'The demonstrative "these" (followed by the genitive n)' };
  G('me2.neg-nn', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, NN);
    if (R.coin()) return P('What is ' + tl('nn') + ' in ' + tl(it.tl) + '?', mc(NNK[it.k], Object.keys(NNK).filter(function (x) { return x !== it.k; }).map(function (x) { return NNK[x]; }).concat(['The ending of the dual'])),
      [it.k === 'dem' ? 'nn is followed by the genitive n and a noun: "these (of) …".' : it.k === 'fut' ? 'nn is followed by a sḏm=f: it negates the future.' : 'nn is followed directly by a noun (or by wn): "there is no …".', 'Translate: ' + q(it.en) + '.'],
      'Look at what follows nn.', { k: 'nnk', tl: it.tl, c: it.k });
    var wr = { neg: ['there is water', 'this water', 'water is not (a thing)'], fut: ['he did not hear', 'these hear', 'he cannot hear'], dem: ['there are no people', 'no people are here', 'the people are not'] }[it.k];
    if (it.tl === 'nn ḏd=j grg') wr = ['I did not tell a lie', 'these lies I tell', 'I cannot tell a lie'];
    if (it.tl === 'nn zꜣ=f') wr = ['this is his son', 'his son did not come', 'these sons of his'];
    if (it.tl === 'nn n nṯrw') wr = ['there are no gods', 'the gods are not', 'not for the gods'];
    if (it.tl === 'nn ḥqꜣ m njwt') wr = ['these rulers are in the town', 'the ruler is in the town', 'the ruler did not come to the town'];
    return P('Translate ' + tl(it.tl) + '.', mc(cap(it.en), wr.map(cap)),
      [it.k === 'dem' ? 'nn + n + noun is the demonstrative "these".' : it.k === 'fut' ? 'nn + sḏm=f: "will not".' : 'nn + noun: "there is no …".', 'So: ' + q(it.en) + '.'], 'What follows nn: a noun, a verb, or n?', { k: 'nntr', tl: it.tl });
  });

  var SDMT = [
    { tl: 'n sḏmt=f', en: 'he has not yet heard', k: 'n', w: ['he did not hear', 'he has heard', 'his daughter did not hear'] },
    { tl: 'r sḏmt=f', en: 'until he hears', k: 'r', w: ['toward his hearing', 'he hears now', 'until the daughter hears'] },
    { tl: 'n jjt=f', en: 'he has not yet come (before he came)', k: 'n', w: ['he did not come', 'he has come', 'he cannot come'] },
    { tl: 'r jjt=f', en: 'until he comes', k: 'r', w: ['toward his coming', 'he comes now', 'he has not yet come'] },
    { tl: 'n ḏdt=s', en: 'she has not yet spoken', k: 'n', w: ['she did not speak', 'she has spoken', 'until she speaks'], lv: 2 },
    { tl: 'r jrt=k', en: 'until you do (it)', k: 'r', w: ['toward your eye', 'you have not yet done it', 'you do it now'], lv: 2 },
    { tl: 'n sḏmt=sn', en: 'they have not yet heard', k: 'n', w: ['they did not hear', 'they have heard', 'until they hear'], lv: 3 },
    { tl: 'r ḏdt=j', en: 'until I speak', k: 'r', w: ['toward my words', 'I have not yet spoken', 'I speak now'], lv: 3 }];
  G('me2.sdmtf', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, SDMT);
    if (L >= 2 && R.chance(0.4)) return P('Write the sḏmt=f in transliteration: ' + q(cap(it.en.replace(/ \(.*\)/, '')) + '.'), TL(it.tl),
      ['"' + (it.k === 'n' ? 'Not yet' : 'Until') + '" is ' + tl(it.k) + ' + the sḏmt=f: the stem with -t, then the subject.', 'Answer: ' + tl(it.tl) + '.'], 'n sḏmt=f "not yet"; r sḏmt=f "until".', { k: 'sdmtw', tl: it.tl });
    if (R.coin()) return P('In ' + tl(it.tl) + ', what is the ' + tl('t') + ' after the stem?', mc('The ending of the sḏmt=f form', ['The feminine ending of a noun', 'The passive ending .tw, shortened', 'The infinitive ending of a weak verb']),
      ['After ' + tl(it.k) + ', the verb with -t and a suffix is the sḏmt=f.', 'Translate: ' + q(it.en) + '.'], 'This t belongs to the verb form, not to a noun.', { k: 'sdmtt', tl: it.tl });
    var wr = it.w;
    return P('Translate ' + tl(it.tl) + '.', mc(cap(it.en), wr.map(cap)),
      [it.k === 'n' ? 'n + sḏmt=f: "has not yet …" (in narrative often "before … had …").' : 'r + sḏmt=f: "until …".', 'So: ' + q(it.en) + '.'], 'n sḏmt=f "not yet"; r sḏmt=f "until".', { k: 'sdmttr', tl: it.tl });
  });

  var TM = [
    { tl: 'r tm sḏm', en: 'so as not to hear', why: 'r + infinitive gives purpose; tm negates the infinitive.' },
    { tl: 'jr tm=k sḏm', en: 'if you do not listen', why: 'After jr "if", the negation is tm=k + the verb.' },
    { tl: 'tm sḏm', en: 'one who does not hear', why: 'tm as a participle negates the participle that follows.' },
    { tl: 'r tm rdjt', en: 'so as not to give', why: 'tm negates the infinitive after r.', lv: 2 },
    { tl: 'jr tm=f ḏd', en: 'if he does not speak', why: 'After jr "if", tm=f carries the negation.', lv: 2 },
    { tl: 'rdj.n=f tm=j sḏm', en: 'he caused me not to hear', why: 'After rdj, the sḏm=f is negated with tm: tm=j + verb.', lv: 3 },
    { tl: 'tm ḏd', en: 'not speaking (the not-saying)', why: 'An infinitive negated with tm.', lv: 3 }];
  G('me2.neg-tm', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, TM);
    if (L >= 2 && R.chance(0.35)) return P('Why does ' + tl(it.tl) + ' use ' + tl('tm') + ' instead of the negative ' + tl('n') + '?', mc('n cannot negate an infinitive, a participle or a verb after jr or rdj; tm carries the negation there', ['tm is a stronger "not", for emphasis', 'tm means "complete", so it marks the past', 'tm and n can always replace each other']),
      [it.why, 'tm is a verb, "not to do", and the verb after it is the one negated.'], 'Where can n not stand?', { k: 'tmwhy', tl: it.tl });
    var wr = { 'r tm sḏm': ['in order to hear', 'toward the end of hearing', 'he did not hear'], 'jr tm=k sḏm': ['if you listen', 'you did not listen', 'as for your hearing'], 'tm sḏm': ['one who hears', 'complete hearing', 'do not hear'], 'r tm rdjt': ['in order to give', 'he did not give', 'until he gives'], 'jr tm=f ḏd': ['if he speaks', 'he did not speak', 'as for his speech'], 'rdj.n=f tm=j sḏm': ['he made me hear', 'he did not hear me', 'he gave me hearing'], 'tm ḏd': ['saying', 'complete speech', 'he did not say'] }[it.tl];
    return P('Translate ' + tl(it.tl) + '.', mc(cap(it.en), wr.map(cap)),
      [it.why, 'So: ' + q(it.en) + '.'], 'tm is the "not" here.', { k: 'tmtr', tl: it.tl });
  });

  var MNEG = [['sḏm', 'Do not listen!', ['In the hearing', 'Listen!', 'He did not listen.']], ['ḏd grg', 'Do not tell lies!', ['In the lie', 'Tell lies!', 'He did not lie.']], ['jr ḏwt', 'Do not do evil!', ['In the evil eye', 'Do evil!', 'He did no evil.']],
    ['rdj', 'Do not give!', ['In the giving', 'Give!', 'He did not give.']], ['sḏr', 'Do not lie down!', ['In the bed', 'Lie down!', 'He did not lie down.']], ['ḏd', 'Do not speak!', ['In the speech', 'Speak!', 'He did not speak.']]];
  G('me2.neg-imperative', function (R, ctx) {
    var L = lvl(ctx), it = R.pick(MNEG), shape = L === 1 ? R.pick(['tr', 'write']) : R.pick(['tr', 'write', 'which']);
    var a = 'm ' + it[0], first = it[0].split(' ')[0], rest = it[0].split(' ').slice(1).join(' ');
    if (shape === 'write') return P('Write the negative command in transliteration: ' + q(it[1]), TL([a, 'm ' + first + 'w' + (rest ? ' ' + rest : '')]),
      ['"Do not …!" is ' + tl('m') + ' (the command form of the negative verb jmj) + the verb.', 'Answer: ' + tl(a) + ' (the verb after m is sometimes written with -w: ' + tl('m ' + first + 'w' + (rest ? ' ' + rest : '')) + ').'], 'm + verb.', { k: 'mw', tl: a });
    if (shape === 'tr') return P('Translate ' + tl(a) + '.', mc(it[1], it[2]),
      ['m at the head of a command, before a verb, means "do not".', 'So: ' + q(it[1]) + '. The preposition m "in" would be followed by a noun.'], 'Is m followed by a verb or a noun?', { k: 'mtr', tl: a });
    var pr = R.pick([['m pr', 'in the house'], ['m njwt', 'in the town'], ['m pt', 'in the sky']]);
    return P('In which phrase is ' + tl('m') + ' the negative command "do not"?', mc(tl(a), [tl(pr[0]) + ' ' + q(pr[1]), tl('m-ḫt'), tl('mk')]),
      [tl(a) + ': m before a verb, at the start of a command, means "do not": ' + q(it[1]) + '.', tl(pr[0]) + ' is the preposition m "in" before a noun.'], 'A verb follows the negative m.', { k: 'mwhich', tl: a });
  });

  /* ================================================================ unit: clauses */
  var CIRC = [
    { tl: 'gm.n=j sw sḏr.w', c: 'sw sḏr.w', en: 'I found him lying down', w: ['I found him. He lay down.', 'He found me lying down', 'I found the one who lay down'] },
    { tl: 'gm.n=f zꜣt=f ꜥḥꜥ.tj', c: 'zꜣt=f ꜥḥꜥ.tj', en: 'he found his daughter standing', w: ['He found his daughter. She stood up.', 'His daughter found him standing', 'He found the standing of his daughter'] },
    { tl: 'jj.n=j ꜥnḫ.kj', c: 'ꜥnḫ.kj', en: 'I came back alive', w: ['I came. I live.', 'He came to me alive', 'I came to life'] },
    { tl: 'ḏd.n=f n=j jw=j m pr', c: 'jw=j m pr', en: 'he spoke to me while I was in the house', w: ['He spoke to me. I am in the house.', 'I spoke to him in his house', 'He spoke to me about the house'], lv: 2 },
    { tl: 'rdj.n=f n=j t jw=j ḥqr.kj', c: 'jw=j ḥqr.kj', en: 'he gave me bread when I was hungry', w: ['He gave me bread. I am hungry.', 'He gave bread to the hungry', 'I gave him bread when he was hungry'], lv: 2 },
    { tl: 'sḏm.n=j ḫrw=f jw=f ḥr mdt', c: 'jw=f ḥr mdt', en: 'I heard his voice as he was speaking', w: ['I heard his voice. He will speak.', 'He heard my voice as I spoke', 'I heard his voice on the words'], lv: 3 },
    { tl: 'jj.n nsw jb=f ḥtp.w', c: 'jb=f ḥtp.w', en: 'the king came, his heart content', w: ['The king came. His heart will be content.', 'The king came to the content heart', 'The king\'s heart came in peace'], lv: 3 }];
  G('me2.circumstantial', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, CIRC);
    if (L >= 2 && R.chance(0.3)) { var circ = it.c;
      return P('In ' + tl(it.tl) + ', what does the second clause, ' + tl(circ) + ', do?', mc('It describes the circumstances of the main clause ("while, when, as")', ['It starts a new, separate sentence', 'It gives the purpose ("in order to")', 'It is a condition ("if")']),
        ['It follows the main clause with no word like "if" or "in order to" to introduce it.', 'A clause like that usually tells the circumstances: ' + q(it.en) + '.'], 'How does it relate to the clause before it?', { k: 'circwhat', tl: it.tl }); }
    return P('Translate ' + tl(it.tl) + '.', mc(cap(it.en), it.w),
      ['The first clause is the main one, with a sḏm.n=f.', 'What follows describes the situation at that moment (a circumstantial clause): a stative or a jw-clause, translated with "while", "when", "as" or an -ing word.', 'So: ' + q(it.en) + '.'], 'Read the second clause as the circumstances of the first.', { k: 'circtr', tl: it.tl });
  });

  var COND = [
    { tl: 'jr sḏm=k mdt=j', en: 'if you listen to my words', w: ['you listened to my words', 'do my words, listen!', 'as for my words, you heard'] },
    { tl: 'jr jr=k mꜣꜥt', en: 'if you do what is right', w: ['do what is right!', 'you did what is right', 'your eye does what is right'] },
    { tl: 'jr gm=k z', en: 'if you find a man', w: ['you found a man', 'the man finds you', 'do find a man!'] },
    { tl: 'jr sḏm.n=k', en: 'if you have heard', w: ['if you will hear', 'you heard', 'do hear!'], lv: 2 },
    { tl: 'jr z pn', en: 'as for this man', w: ['make this man!', 'if this man', 'this man does'], lv: 2 },
    { tl: 'jr tm=k sḏm', en: 'if you do not listen', w: ['if you listen', 'you did not listen', 'as for the hearing'], lv: 3 },
    { tl: 'jr jj.n=f', en: 'if he has come', w: ['if he will come', 'he made the coming', 'he came'], lv: 3 }];
  G('me2.conditionals', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, COND);
    if (L >= 2 && R.chance(0.3)) return P('What is the first ' + tl('jr') + ' in ' + tl(it.tl) + '?', mc(it.tl === 'jr z pn' ? 'The particle jr "as for", before a noun' : 'The particle jr "if", introducing a condition', [it.tl === 'jr z pn' ? 'The particle jr "if", introducing a condition' : 'The particle jr "as for", before a noun', 'The verb jrj "do, make"', 'The preposition r "to"']),
      ['jr at the head of a clause is a particle.', it.tl === 'jr z pn' ? 'Before a noun it means "as for".' : 'Before a verb form it means "if".', 'Translate: ' + q(it.en) + '.'], 'What follows it: a noun or a verb?', { k: 'condwhat', tl: it.tl }, it.tl.indexOf('jr jr') === 0 ? gviz('M17-D21 D4-V31 Aa11:D36*X1-Y1') : null);
    return P('Translate ' + tl(it.tl) + '.', mc(cap(it.en), it.w.map(cap)),
      ['jr at the head of a clause is the particle "if" (before a noun, "as for").', it.tl.indexOf('.n') > 0 ? 'The sḏm.n=f keeps its sense of completed action: "if … has …".' : 'The verb after it gives the condition.', 'So: ' + q(it.en) + '.'], 'Particle jr first, then the condition.', { k: 'condtr', tl: it.tl }, it.tl.indexOf('jr jr') === 0 ? gviz('M17-D21 D4-V31 Aa11:D36*X1-Y1') : null);
  });

  var PURP = [
    { tl: 'jj.n=j r mꜣꜣ nfrw=k', en: 'I have come to see your beauty', w: ['I have come toward your beauty, seeing', 'I came, and I saw your beauty', 'your beauty came to see me'] },
    { tl: 'jj.n=f r ḏd n=j', en: 'he came to tell me', w: ['he came toward my words', 'he came and I said', 'I came to tell him'] },
    { tl: 'rdj.n=f n=j t ꜥnḫ=j', en: 'he gave me bread so that I might live', w: ['he gave me bread and my life', 'he gave bread to my life', 'I gave him bread so that he might live'], lv: 2 },
    { tl: 'šm.n=f r gmt zꜣ=f', en: 'he went to find his son', w: ['he went toward his son\'s finding', 'his son went to find him', 'he went and found his son'], lv: 2 },
    { tl: 'jj.n=sn r sḏm mdt=f', en: 'they came to hear his words', w: ['they came toward his words', 'his words came to them', 'they heard his words and came'], lv: 3 },
    { tl: 'jj.n=j r rdjt n=k t', en: 'I have come to give you bread', w: ['I came toward your bread', 'you came to give me bread', 'I came, and you gave bread'], lv: 3 }];
  G('me2.purpose', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, PURP);
    var isR = / r (?!tm)/.test(' ' + it.tl.split(' ').slice(1).join(' ')) || / r tm/.test(it.tl);
    if (L >= 2 && R.chance(0.3) && isR) return P('In ' + tl(it.tl) + ', what does ' + tl('r') + ' + the infinitive mean?', mc('"In order to …": purpose', ['"Toward" a place', '"Until"', '"Is going to …", the future']),
      ['r before an infinitive after a verb of motion or action gives its purpose.', 'Translate: ' + q(it.en) + '.'], 'r + infinitive after a verb.', { k: 'purpr', tl: it.tl });
    return P('Translate ' + tl(it.tl) + '.', mc(cap(it.en), it.w.map(cap)),
      [isR ? 'r + infinitive gives the purpose: "(in order) to …".' : 'A sḏm=f right after another verb can give the purpose or result: "so that …".', 'So: ' + q(it.en) + '.'], 'Purpose: r + infinitive, or a sḏm=f after the verb.', { k: 'purptr', tl: it.tl });
  });

  var PSV = [['jw=f ḥr sḏm', 'He is hearing (he hears).', 'ḥr', 'sḏm', ['He is on the hearing.', 'He heard.', 'Hear!']], ['jw=s ḥr ḏd mꜣꜥt', 'She is speaking the truth.', 'ḥr', 'ḏd', ['She is on the truth.', 'She spoke the truth.', 'Speak the truth!']],
    ['jw=f r sḏm', 'He will hear (he is going to hear).', 'r', 'sḏm', ['He is at the hearing.', 'He heard.', 'Toward the hearing!']], ['jw nsw m jjt', 'The king is coming.', 'm', 'jjt', ['The king is in the coming.', 'The king came.', 'Come, O king!']],
    ['mk wj ḥr sḏm', 'Look, I am listening.', 'ḥr', 'sḏm', ['Look, I am on the hearing.', 'Look, I listened.', 'Look at me: listen!']], ['jw=sn r ḏd mdt', 'They will say the words.', 'r', 'ḏd', ['They are toward the words.', 'They said the words.', 'Say the words to them!']],
    ['jw=j ḥr rdjt t', 'I am giving bread.', 'ḥr', 'rdjt', ['I am on the bread.', 'I gave bread.', 'Give me bread!']]];
  var PSV_P = { 'ḥr': 'ḥr + infinitive: "is doing" (in the middle of it)', r: 'r + infinitive: "is going to do, will do"', m: 'm + infinitive of a verb of motion: "is going, is coming"' };
  G('me2.pseudoverbal', function (R, ctx) {
    var L = lvl(ctx), it = R.pick(L === 1 ? PSV.filter(function (x) { return x[2] === 'ḥr'; }) : PSV), shape = L === 1 ? R.pick(['write', 'tr']) : R.pick(['write', 'tr', 'prep']);
    var sp = it[0] === 'jw=f ḥr sḏm' ? null : it[0] === 'mk wj ḥr sḏm' ? 'G17-V31 G43-A1 D2:Z1 S29-F21-G17' : null;
    if (shape === 'write') return P('Write in transliteration with the pseudoverbal construction: ' + q(it[1].replace(/ \(.*\)/, '')), TL(it[0]),
      ['Subject first: ' + tl(it[0].split(' ')[0]) + '.', 'Then ' + PSV_P[it[2]] + ': ' + tl(it[2] + ' ' + it[3]) + '.', 'Answer: ' + tl(it[0]) + '.'], 'Subject + preposition + infinitive.', { k: 'psvw', tl: it[0] });
    if (shape === 'prep') return P('In ' + tl(it[0]) + ', what does ' + tl(it[2]) + ' before the infinitive show?', mc(cap(PSV_P[it[2]]), Object.keys(PSV_P).filter(function (x) { return x !== it[2]; }).map(function (x) { return cap(PSV_P[x]); }).concat(['A place: "on", "to" or "in"'])),
      ['Before an infinitive, the preposition loses its sense of place and marks the action: ' + PSV_P[it[2]] + '.', 'Translate: ' + q(it[1]) + '.'], 'The preposition + infinitive works like a verb.', { k: 'psvp', tl: it[0] });
    var wrong = it[4];
    return P('Translate ' + tl(it[0]) + '.', mc(it[1], wrong),
      ['Subject + ' + tl(it[2]) + ' + infinitive is the pseudoverbal construction.', PSV_P[it[2]] + '.', 'So: ' + q(it[1]) + '.'], 'The preposition is not a place word here.', { k: 'psvtr', tl: it[0] }, sp ? gviz(sp) : null);
  });

  var VREL = [
    { tl: 'z ḏd=f mꜣꜥt', en: 'a man who speaks the truth', w: ['the man speaks the truth', 'a man, he speaks; the truth', 'the man\'s words of truth'] },
    { tl: 'zꜣ mr=f jt=f', en: 'a son who loves his father', w: ['the son loves his father', 'a father who loves his son', 'his son and his father'] },
    { tl: 'njwt n rḫ=j rn=s', en: 'a town whose name I do not know', w: ['the town does not know my name', 'I know the name of the town', 'a town of my name'], lv: 2 },
    { tl: 'rmṯ nn ḥqꜣ=sn', en: 'people who have no ruler', w: ['these people are rulers', 'the people of the ruler', 'the ruler has no people'], lv: 2 },
    { tl: 'z ꜥnḫ.w', en: 'a man who is alive (a living man)', w: ['the man lived', 'live, O man!', 'the life of a man'], lv: 3 }];
  G('me2.virtual-relative', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, VREL);
    if (L >= 2 && R.chance(0.35)) return P('In ' + tl(it.tl) + ' ' + q(it.en) + ', why is there no ' + tl('ntj') + '?', mc('The noun is indefinite ("a …"), and after an indefinite noun a clause can describe it without ntj', ['ntj was left out by mistake', 'ntj is never used in Middle Egyptian', 'The clause is a separate sentence']),
      ['ntj usually follows a definite noun ("the man who…").', 'After an indefinite noun, a plain clause does the same job, with a pronoun pointing back to the noun.'], 'Is the noun "the …" or "a …"?', { k: 'vrelwhy', tl: it.tl });
    return P('Translate ' + tl(it.tl) + '.', mc(cap(it.en), it.w.map(cap)),
      ['The clause after the noun describes it, even with no ntj: the noun is indefinite.', 'A pronoun in the clause points back to the noun.', 'So: ' + q(it.en) + '.'], 'Read the clause as "who …" or "whose …".', { k: 'vreltr', tl: it.tl });
  });

  var EMPH = [
    { tl: 'jj.n=j m njwt=j', plain: 'I came from my town', emph: 'It was from my town that I came', adv: 'm njwt=j' },
    { tl: 'sḏm.n=f mdt m pr', plain: 'he heard the words in the house', emph: 'It was in the house that he heard the words', adv: 'm pr' },
    { tl: 'jj.n=f r mꜣꜣ nṯr', plain: 'he came to see the god', emph: 'It was to see the god that he came', adv: 'r mꜣꜣ nṯr' },
    { tl: 'ḏd.n=s nn n ḥm=f', plain: 'she said this to His Majesty', emph: 'It was to His Majesty that she said this', adv: 'n ḥm=f' },
    { tl: 'gm.n=j sw m njwt', plain: 'I found him in the town', emph: 'It was in the town that I found him', adv: 'm njwt' },
    { tl: 'rdj.n=f t n z', plain: 'he gave bread to the man', emph: 'It was to the man that he gave bread', adv: 'n z' },
    { tl: 'jj.n=sn r sḏm mdt', plain: 'they came to hear the words', emph: 'It was to hear the words that they came', adv: 'r sḏm mdt' },
    { tl: 'sḏm.n=j ḫrw=f m pt', plain: 'I heard his voice in the sky', emph: 'It was in the sky that I heard his voice', adv: 'm pt' }];
  var EMPH_TF = [
    { s: 'All Egyptologists agree on how many "emphatic" verb forms Middle Egyptian has.', v: false, why: 'This is one of the most debated questions in Egyptian grammar.' },
    { s: 'In the emphatic reading, the stress falls on an adverbial part of the sentence, such as a place, time or purpose.', v: true },
    { s: 'H. J. Polotsky\'s work made the idea of emphatic forms central to modern Egyptian grammar.', v: true },
    { s: 'Gardiner\'s grammar of 1927 was built on the emphatic-form theory.', v: false, why: 'The theory came later; Gardiner described the forms in other terms.' },
    { s: 'Some grammars, such as Allen\'s, call these forms "nominal" forms.', v: true },
    { s: 'A translation that does not show the emphasis is always wrong.', v: false, why: 'Often both translations are possible; the stress is a matter of reading the context.' },
    { s: 'The debate is partly about whether some sḏm=f and sḏm.n=f forms were separate forms or one form used in different ways.', v: true },
    { s: 'Because vowels are not written, the emphatic forms can always be told apart by their spelling.', v: false, why: 'Often they look the same as other forms in writing; that is one reason the question is debated.' }];
  G('me2.emphatic', function (R, ctx) {
    var L = lvl(ctx), it = R.pick(EMPH), shape = L === 1 ? R.pick(['which', 'stress']) : R.pick(['which', 'stress', 'tf']);
    if (shape === 'which') return P('Two translations of ' + tl(it.tl) + ' are offered. Which one gives the "emphatic" reading?', mc(it.emph, [cap(it.plain)]),
      ['The emphatic reading puts the stress on the adverbial part, ' + tl(it.adv) + ', with an English cleft: "It was … that …".', 'The plain reading, ' + q(it.plain) + ', is also possible; grammars debate when the emphatic one is meant.'], 'Which translation stresses a phrase with "It was … that"?', { k: 'emphwhich', tl: it.tl });
    if (shape === 'stress') return P('If ' + tl(it.tl) + ' is read as an emphatic sentence, which part carries the stress?', mc(tl(it.adv), [tl(it.tl.split(' ')[0]), tl(it.tl.split(' ')[0].split('.')[0]), 'Nothing: the sentence has no stress']),
      ['In the emphatic reading the verb form is backgrounded and the adverbial part is the point: ' + q(it.emph) + '.'], 'The stress goes on a phrase after the verb.', { k: 'emphstress', tl: it.tl });
    var S = R.pick(EMPH_TF);
    return P('True or false? ' + S.s, tf(S.v), [S.v ? 'True.' : 'False. ' + S.why], 'This topic is about a scholarly debate.', { k: 'emphtf', v: S.v });
  });
  /* ================================================================ unit: commands, questions and particles */
  var IMP = [['sḏm', 'Hear! Listen!', 'sdm'], ['ḏd', 'Say! Speak!', 'dd'], ['jr', 'Do! Make!', 'irj'], ['jmj', 'Give!', 'rdj'], ['mj', 'Come!', 'jj'], ['jn', 'Bring!', 'jnj'], ['sḏm ḫrw=j', 'Hear my voice!', 'sdm'], ['ḏd mꜣꜥt', 'Speak the truth!', 'dd'], ['jr mꜣꜥt', 'Do what is right!', 'irj'], ['jmj t', 'Give bread!', 'rdj']];
  G('me2.imperative', function (R, ctx) {
    var L = lvl(ctx), it = R.pick(L === 1 ? IMP.filter(function (x) { return ['sḏm', 'ḏd', 'jr', 'jmj', 'mj', 'sḏm ḫrw=j'].indexOf(x[0]) >= 0; }) : IMP), v = VB[it[2]], shape = L === 1 ? R.pick(['write', 'pick']) : R.pick(['write', 'pick', 'tr']);
    var irr = it[0].split(' ')[0] === 'jmj' || it[0].split(' ')[0] === 'mj';
    if (shape === 'write') return P('Write the command in transliteration: ' + q(it[1].split('!')[0] + '!') + (irr ? '' : ' (verb: ' + tl(v.tl) + ')'), TL(it[0]),
      [irr ? (it[0].indexOf('jmj') === 0 ? '"Give!" is not made from rdj: it is the special word jmj.' : '"Come!" is the special word mj, not a form of jj.') : 'The imperative is usually the bare stem, with no suffix pronoun' + (v.cls === '3inf' || it[2] === 'jnj' ? '; third-weak verbs drop the j (' + tl(v.stem) + ')' : '') + '.', 'Answer: ' + tl(it[0]) + '.'],
      irr ? 'This one is irregular.' : 'Just the stem.', { k: 'impw', tl: it[0] });
    if (shape === 'pick') { var base = it[0].split(' ')[0], rest = it[0].slice(base.length);
      var X = it[0].indexOf('jmj') === 0 ? 'rdj' : 'jj', wr = irr ? [X + '=k' + rest, X + '.n=k' + rest, X + '.tw' + rest] : [base + '=k' + rest, base + '.n=k' + rest, base + '.tw' + rest];
      return P('Which is the command ' + q(it[1].split('!')[0] + '!') + '?', mc(tl(it[0]), wr.map(tl)),
        [irr ? 'This verb uses a special word for its command: ' + tl(base) + '.' : 'Commands have no suffix pronoun: the "you" is understood.', 'So: ' + tl(it[0]) + '.'], 'No suffix on a command.', { k: 'imppick', tl: it[0] }); }
    return P('What does ' + tl(it[0]) + ' mean, said to one person?', mc(it[1].split('!')[0] + '!', IMP.filter(function (x) { return x[1] !== it[1] && x[0].split(' ').length === it[0].split(' ').length; }).slice(0, 6).map(function (x) { return x[1].split('!')[0] + '!'; }).filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(0, 3)),
      [irr ? tl(it[0].split(' ')[0]) + ' is an irregular command.' : tl(it[0].split(' ')[0]) + ' is the imperative of ' + tl(v.tl) + '.', 'So: ' + q(it[1].split('!')[0] + '!') + '.'], 'Find the verb.', { k: 'imptr', tl: it[0] });
  });

  var QW = [['zj', 'who? what?', ['zj', 'zy']], ['jḫ', 'what?', ['jḫ']], ['tnj', 'where?', ['tnj', 'tnw']], ['ptr', 'what? who?', ['ptr', 'pty']]];
  var QS = [
    { tl: 'jn jw=k m pr', en: 'Are you in the house?', w: ['By you, in the house.', 'You are in the house.', 'Be in the house!'] },
    { tl: 'jn sḏm.n=k', en: 'Have you heard?', w: ['By you, it was heard.', 'You have heard.', 'Hear!'] },
    { tl: 'jn jw=f ḥr sḏm', en: 'Is he listening?', w: ['He is listening.', 'It is by him that it is heard.', 'Listen to him!'] },
    { tl: 'jn rḫ.n=k rn=f', en: 'Do you know his name?', w: ['You know his name.', 'His name is known by you.', 'Know his name!'], lv: 2 },
    { tl: 'zj pw', en: 'Who is it?', w: ['It is a man.', 'This is the door bolt.', 'Where is he?'], lv: 2 },
    { tl: 'jḫ pw', en: 'What is it?', w: ['It is a thing.', 'Who is it?', 'Where is it?'], lv: 3 },
    { tl: 'jw=k tnj', en: 'Where are you?', w: ['You are here.', 'Who are you?', 'What are you?'], lv: 3 }];
  G('me2.questions', function (R, ctx) {
    var L = lvl(ctx);
    if (L >= 2 && R.chance(0.35)) { var w = R.pick(QW);
      return P('Write the question word for ' + q(w[1].split('?')[0] + '?') + ' in transliteration.', TL(w[2]),
        ['The Middle Egyptian question words: ' + tl('zj') + ' "who? what?", ' + tl('jḫ') + ' "what?", ' + tl('tnj') + ' "where?", ' + tl('ptr') + ' "what? who?".', 'Answer: ' + tl(w[0]) + (w[2].length > 1 ? ' (also written ' + tl(w[2][1]) + ')' : '') + '.'], 'One of zj, jḫ, tnj, ptr.', { k: 'qw', tl: w[0] }); }
    var it = bank(R, ctx, QS);
    return P('Translate ' + tl(it.tl) + '.', mc(it.en, it.w),
      [/^jn /.test(it.tl) ? 'jn at the head of a sentence turns the statement after it into a yes-or-no question.' : 'The question word asks for the missing piece.', 'So: ' + q(it.en) + '. (jn "by" introduces the doer after a passive or an infinitive; at the start of a sentence it asks.)'], 'At the head of a sentence, jn asks.', { k: 'qtr', tl: it.tl }, /^jn /.test(it.tl) ? null : null);
  });

  var PRT = [['mk', 'look, behold (draws attention to what follows)'], ['jsṯ', 'now, while (sets the scene)'], ['ḥꜣ', 'would that, if only (a wish)'], ['jn', 'asks a yes-or-no question'], ['jr', 'if; as for']];
  var PRT_EX = [
    { tl: 'mk wj m pr', en: 'Look, I am in the house.', p: 'mk' }, { tl: 'ḥꜣ jj=f', en: 'If only he would come!', p: 'ḥꜣ' }, { tl: 'jsṯ ḥm=f m njwt', en: 'Now His Majesty was in the town.', p: 'jsṯ' },
    { tl: 'jn jw=k m pr', en: 'Are you in the house?', p: 'jn' }, { tl: 'jr sḏm=k', en: 'If you listen…', p: 'jr' }, { tl: 'mk sw jj.w', en: 'Look, he has come.', p: 'mk', lv: 2 }, { tl: 'ḥꜣ sḏm=k ḫrw=j', en: 'If only you would hear my voice!', p: 'ḥꜣ', lv: 2 },
    { tl: 'jsṯ zꜣ=f m pr', en: 'Meanwhile his son was in the house.', p: 'jsṯ', lv: 3 }];
  G('me2.particles', function (R, ctx) {
    var L = lvl(ctx), it = bank(R, ctx, PRT_EX), P0 = PRT.filter(function (x) { return x[0] === it.p; })[0];
    if (R.coin()) return P('What does the particle ' + tl(it.p) + ' add in ' + tl(it.tl) + '?', mc(cap(P0[1]), PRT.filter(function (x) { return x[0] !== it.p; }).map(function (x) { return cap(x[1]); })),
      ['Translate: ' + q(it.en), tl(it.p) + ': ' + P0[1] + '. Particles set the tone; English often shows them with a word like "look", "now" or "if only", or with punctuation.'], 'What does the sentence do: point, set a scene, wish, ask?', { k: 'prt', tl: it.tl }, it.p === 'mk' && it.tl === 'mk wj m pr' ? gviz('G17-V31 G43-A1 G17 O1:Z1') : null);
    var others = PRT_EX.filter(function (x) { return x.p !== it.p; }).map(function (x) { return x.en; });
    return P('Translate ' + tl(it.tl) + '.', mc(it.en, R.shuffle(others).slice(0, 3)),
      [tl(it.p) + ': ' + P0[1] + '.', 'So: ' + q(it.en)], 'Start from the particle.', { k: 'prttr', tl: it.tl });
  });

  var JNF = [
    { tl: 'jn nsw rdj ḥtp', en: 'It is the king who gives an offering.', w: ['Does the king give an offering?', 'An offering is given by the king.', 'The king gave an offering.'] },
    { tl: 'jn nṯr sḏm ḫrw=j', en: 'It is the god who hears my voice.', w: ['Does the god hear my voice?', 'My voice is heard by the god.', 'The god heard my voice.'] },
    { tl: 'jn zꜣ=f ḏd mdt', en: 'It is his son who says the words.', w: ['Does his son say the words?', 'The words were said by his son.', 'His son said the words.'] },
    { tl: 'jn ḥm=f rdj jj=j', en: 'It was His Majesty who caused me to come.', w: ['Did His Majesty cause me to come?', 'I came by His Majesty.', 'His Majesty came to me.'], lv: 2 },
    { tl: 'jn nsw rdj=f n=k t', en: 'It is the king who will give you bread.', w: ['Will the king give you bread?', 'The bread was given to you by the king.', 'The king gave you bread.'], lv: 3 }];
  G('me2.jn-focus', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 3 && R.chance(0.4)) { var W = R.pick([['nṯr', 'the god', 'sḏm', 'hears'], ['nsw', 'the king', 'ḏd', 'speaks'], ['zꜣt=f', 'his daughter', 'sḏm', 'hears'], ['jt=j', 'my father', 'rḫ', 'knows']]), a = 'jn ' + W[0] + ' ' + W[2];
      return P('Write in transliteration: ' + q('It is ' + W[1] + ' who ' + W[3] + '.') + ' Use ' + tl('jn') + ' and the participle of ' + tl(W[2]) + '.', TL(a),
        ['jn + the noun singled out + a participle: "it is … who …".', 'Answer: ' + tl(a) + '.'], 'jn + noun + participle.', { k: 'jnfw', tl: a }); }
    var it = bank(R, ctx, JNF);
    return P('Translate ' + tl(it.tl) + '.', mc(it.en, it.w),
      ['jn + noun + participle (or + sḏm=f for the future) singles out the doer: "It is … who …".', 'It is not a question here: a question with jn is followed by a full statement, not by a noun and a participle.', 'So: ' + q(it.en)], 'jn before a noun and a participle: focus on the doer.', { k: 'jnftr', tl: it.tl }, it.tl === 'jn nṯr sḏm ḫrw=j' ? gviz('M17-N35 R8-A40 S29-F21-G17 P8-G43-A2-A1') : null);
  });
  /* ================================================================ unit: reading real texts
     Passages are short, standard phrases (offering formulas, epithets, set phrases of autobiographies) and a few lines of
     Sinuhe, the Eloquent Peasant and the Rosetta Stone, quoted in transliteration and translated afresh. */
  // an mc of orderings shown in a fixed (shuffled here) order: right is choices[0] before shuffling
  function orderMc(R, list) { var idx = R.shuffle(list.map(function (_, i) { return i; })); return keep(idx.map(function (i) { return list[i]; }), idx.indexOf(0)); }
  function art(s) { return /^(a|an|the|two|three) /.test(s) ? s : (/^[aeiouAEIOU]/.test(s) ? 'an ' : 'a ') + s; }
  function mapPick(R, target, others, view) { var ch = R.shuffle([target].concat(others)); return { viz: { name: 'eg-map', opts: { mode: 'pick', target: target, choices: ch, quiet: true, view: view, layerChips: false, cities: false, height: 360 } }, a: keep(ch.map(function (_, i) { return String.fromCharCode(65 + i); }), ch.indexOf(target)) }; }
  var STELA = [
    { tl: 'ḥtp-dj-nsw wsjr nb ḏdw', en: 'An offering that the king gives (to) Osiris, lord of Busiris', w: ['The king gives an offering to the lord of the house', 'Osiris gives an offering to the king of Busiris', 'May the king give Osiris to the lord of Busiris'] },
    { tl: 'nṯr ꜥꜣ nb ꜣbḏw', en: 'the great god, lord of Abydos', w: ['the god of the great lord of Abydos', 'the great one, the god of every Abydos', 'the lord of the great god of Abydos'] },
    { tl: 'dj=f prt-ḫrw t ḥnqt kꜣ ꜣpd', en: 'that he may give an invocation offering of bread and beer, oxen and fowl', w: ['he gave the voice of bread and beer to the ox', 'bread and beer give him oxen and fowl', 'give the ka of bread, beer and fowl!'] },
    { tl: 'šs mnḫt', en: 'alabaster and linen', w: ['bread and beer', 'oxen and fowl', 'gold and silver'], lv: 2 },
    { tl: 'ḫt nbt nfrt wꜥbt', en: 'every good and pure thing', w: ['the lady of good and pure things', 'all the goodness of the priest', 'the good thing of every lord'], lv: 2 },
    { tl: 'n kꜣ n jmꜣḫy', en: 'for the ka of the revered one', w: ['to the bull of the revered one', 'for the revered ka of the king', 'the ka is not revered'], lv: 2 },
    { tl: 'ḥtp-dj-nsw jnpw tpj-ḏw=f', en: 'An offering that the king gives (to) Anubis, who is upon his mountain', w: ['Anubis gives an offering to the king on his mountain', 'The king gives Anubis his mountain as an offering', 'An offering of the mountain to the king of Anubis'], lv: 3 },
    { tl: 'jnpw nb tꜣ-ḏsr', en: 'Anubis, lord of the sacred land', w: ['Anubis, the land of the sacred lord', 'the lord Anubis gives the sacred land', 'Anubis, the sacred lord of every land'], lv: 3 }];
  var STELA_ORDER = ['the offering formula, ḥtp-dj-nsw', 'the god or gods named', 'the gifts: dj=f prt-ḫrw…', 'the owner: n kꜣ n … and his name and titles'];
  G('me2.stela', function (R, ctx) {
    var L = lvl(ctx), shape = L === 1 ? R.pick(['tr', 'dir']) : L === 2 ? R.pick(['tr', 'tr', 'dir', 'order']) : R.pick(['tr', 'order', 'map', 'dir']);
    if (shape === 'dir') { var rtl = R.coin();
      return P('This is the opening of an offering formula. Which way do you read it?', mc(rtl ? 'From right to left: the signs face right, toward the start' : 'From left to right: the signs face left, toward the start', [rtl ? 'From left to right: the signs face left, toward the start' : 'From right to left: the signs face right, toward the start', 'Always top to bottom, whatever the signs face', 'From whichever end has the largest sign']),
        ['Look at a sign with a face, such as a bird or the arm: it looks toward the beginning of the line.', 'Here they face ' + (rtl ? 'right, so you start at the right edge.' : 'left, so you start at the left edge.'), 'The words read ' + tl('ḥtp-dj-nsw') + ', "an offering that the king gives".'],
        'Which way do the signs look?', { k: 'stdir', rtl: rtl }, gviz(EG().WORDS.htpdinsw.sp, { dir: rtl ? 'rtl' : 'ltr' })); }
    if (shape === 'order') return P('In what order do the parts of a Middle Kingdom offering stela usually come?', orderMc(R, [STELA_ORDER.join(' → '), [STELA_ORDER[0], STELA_ORDER[3], STELA_ORDER[1], STELA_ORDER[2]].join(' → '), [STELA_ORDER[3], STELA_ORDER[0], STELA_ORDER[2], STELA_ORDER[1]].join(' → '), [STELA_ORDER[2], STELA_ORDER[1], STELA_ORDER[0], STELA_ORDER[3]].join(' → ')].map(function (x) { return x.replace(/ḥtp-dj-nsw|dj=f prt-ḫrw|n kꜣ n/g, function (m) { return tl(m); }); })),
      ['The formula opens the text: ' + tl('ḥtp-dj-nsw') + '.', 'Next the god (Osiris, Anubis), then the wish for gifts, then "for the ka of" the owner, with his name and titles.'], 'Formula, god, gifts, owner.', { k: 'storder' });
    if (shape === 'map') { var M = mapPick(R, 'abydos', R.sample(['karnak', 'memphis', 'elephantine', 'amarna', 'giza'], 3), 'egypt');
      return P('Many Middle Kingdom stelae call Osiris ' + tl('nb ꜣbḏw') + ', "lord of Abydos", and many were set up there. Which lettered dot is Abydos?', M.a,
        ['Abydos lies in Upper Egypt, on the west bank of the Nile, north of Thebes (Karnak) and far south of Memphis.', 'It was the great cult center of Osiris, where people set up stelae to share in his festivals.'], 'Upper Egypt, north of Thebes.', { k: 'stmap' }, M.viz); }
    var it = bank(R, ctx, STELA);
    return P('Translate this line of a stela: ' + tl(it.tl), mc(it.en, it.w),
      ['Read it phrase by phrase: ' + it.tl.split(' ').map(function (w) { return tl(w); }).join(' · ') + '.', 'So: ' + q(it.en) + '.'], 'These are fixed phrases of the offering formula.', { k: 'sttr', tl: it.tl }, it.tl.indexOf('ḥtp-dj-nsw wsjr') === 0 ? gviz(EG().WORDS.htpdinsw.sp + ' ' + EG().WORDS.osiris.sp) : null);
  });

  var FAM = [
    { tl: 'zꜣ=f mrj=f', en: 'his beloved son (literally "his son, his beloved")', w: ['his son loves him', 'his son, who loves the beloved', 'he loves his son'] },
    { tl: 'zꜣt=f mrt=f', en: 'his beloved daughter', w: ['his daughter loves him', 'his daughter Meret', 'he loved his daughter'] },
    { tl: 'ḥmt=f mrt=f', en: 'his beloved wife', w: ['his wife loves him', 'his wife Meret', 'he loved his wife'] },
    { tl: 'ms.n nbt-pr nfrt', en: 'born of the lady of the house Nefret', w: ['the lady of the house Nefret bore him a child', 'Nefret gave birth to the lady of the house', 'the lady of the house is beautiful'], lv: 2 },
    { tl: 'jr.n ḥnwt', en: 'born of Henut (whom Henut bore)', w: ['Henut made it', 'he made Henut', 'the eye of Henut'], lv: 2 },
    { tl: 'jmnjj mꜣꜥ-ḫrw ms.n mrt', en: 'Ameny, true of voice, born of Meret', w: ['Ameny gave birth to Meret, true of voice', 'Meret is the true voice of Ameny', 'Ameny, true of voice, made Meret'], lv: 3 },
    { tl: 'zꜣ=f jtj jr.n nbt-pr ḥnwt', en: 'his son Iti, born of the lady of the house Henut', w: ['his son Iti made the lady of the house Henut', 'Iti\'s son, whom he made for the lady of the house Henut', 'his son made Iti for Henut'], lv: 3 }];
  G('me2.stela-family', function (R, ctx) {
    var L = lvl(ctx);
    if (L >= 2 && R.chance(0.35)) { var w = R.pick([['his beloved son', 'zꜣ=f mrj=f'], ['his beloved daughter', 'zꜣt=f mrt=f'], ['born of (the mother\'s name follows)', ['ms.n', 'jr.n']], ['true of voice', 'mꜣꜥ-ḫrw'], ['lady of the house', 'nbt-pr']]);
      return P('Write the stela phrase in transliteration: ' + q(w[0]) + '.', TL(w[1]),
        ['The fixed phrase is ' + tl([].concat(w[1])[0]) + ([].concat(w[1]).length > 1 ? ' (or ' + tl([].concat(w[1])[1]) + ')' : '') + '.', /mrj=f|mrt=f/.test([].concat(w[1])[0]) ? 'The second word is a passive participle, "beloved", agreeing with the noun, with =f "his" (of him): "his son, his beloved".' : /ms\.n/.test([].concat(w[1])[0]) ? 'It is the relative form of msj "give birth" (or of jrj "make"): "whom (the mother) bore".' : 'It is a set title or epithet.'],
        'These phrases recur on every family stela.', { k: 'famw', tl: [].concat(w[1])[0] }); }
    var it = bank(R, ctx, FAM);
    return P('Translate this phrase from a family stela: ' + tl(it.tl), mc(it.en, it.w),
      [/ms\.n|jr\.n/.test(it.tl) ? 'ms.n and jr.n are relative forms: "whom (the mother) bore" or "made", that is, "born of". The mother\'s name follows; she is the subject.' : 'The noun with =f is followed by a participle "beloved" with its own =f: "his son, beloved of him", that is, his beloved son.', 'So: ' + q(it.en) + '.'], 'The mother\'s name follows ms.n or jr.n.', { k: 'famtr', tl: it.tl }, it.tl === 'ms.n nbt-pr nfrt' ? null : null);
  });

  var AUTO = [
    { tl: 'rdj.n=j t n ḥqr', en: 'I gave bread to the hungry', w: ['I give bread to the hungry', 'the hungry gave me bread', 'may I give bread to the hungry'] },
    { tl: 'ḥbs n ḥꜣy', en: '(I gave) clothes to the naked', w: ['the naked clothed me', 'clothes for the hungry', 'the naked man\'s clothes'] },
    { tl: 'jw rdj.n=j t n ḥqr ḥbs n ḥꜣy', en: 'I gave bread to the hungry and clothes to the naked', w: ['I give bread and clothes to the hungry', 'the hungry and the naked gave me bread and clothes', 'bread is given to the hungry; clothes are naked'], lv: 2 },
    { tl: 'ḏd.n=j mꜣꜥt jr.n=j mꜣꜥt', en: 'I spoke what is right and I did what is right', w: ['Maat spoke to me and Maat made me', 'I will speak and do what is right', 'speak what is right and do what is right!'], lv: 2 }];
  G('me2.autobiography', function (R, ctx) {
    var L = lvl(ctx), shape = L === 1 ? R.pick(['tr', 'word']) : R.pick(['tr', 'word', 'form', 'nature']);
    if (shape === 'word') { var w = R.pick([['ḥqr', 'the hungry (one)'], ['ḥꜣy', 'the naked (one)'], ['ḥbs', 'clothing'], ['t', 'bread']]);
      return P('In the set phrase ' + tl('rdj.n=j t n ḥqr ḥbs n ḥꜣy') + ', what does ' + tl(w[0]) + ' mean?', mc(cap(w[1]), ['the hungry (one)', 'the naked (one)', 'clothing', 'bread'].filter(function (x) { return x !== w[1]; }).map(cap)),
        ['The whole phrase: ' + q('I gave bread to the hungry and clothes to the naked') + '.', tl(w[0]) + ' is ' + q(w[1]) + '.'], 'Bread for the hungry, clothes for the naked.', { k: 'autow', w: w[0] }); }
    if (shape === 'form') return P('In ' + tl('jw rdj.n=j t n ḥqr') + ', what is ' + tl('rdj.n=j') + '?', mc('The sḏm.n=f of rdj "give", with the subject =j "I": "I gave"', ['The infinitive of rdj with the object "me"', 'The passive "I was given"', 'The sḏm=f of rdj, "may I give"']),
      ['rdj + .n + =j: stem, the .n of completed action, then the subject.', 'After jw it states a past fact: ' + q('I gave bread to the hungry') + '.'], 'Find the .n.', { k: 'autoform' });
    if (shape === 'nature') return P('How do Egyptologists read lines like ' + tl('rdj.n=j t n ḥqr ḥbs n ḥꜣy') + ' in tomb autobiographies?', mc('As partly ideal statements of a good life, repeated in many tombs, not only as personal records', ['As exact records of one official\'s daily charity', 'As religious spells to feed the gods', 'As later Greek additions to the tomb']),
      ['The same phrases appear in tomb after tomb, from the Old Kingdom on.', 'They describe the ideal official who lived by maat; they may also reflect real deeds, but they are not a diary.'], 'Think of how often the same words appear.', { k: 'autonat' });
    var it = bank(R, ctx, AUTO);
    return P('Translate this line from a tomb autobiography: ' + tl(it.tl), mc(cap(it.en), it.w.map(cap)),
      ['The verbs are sḏm.n=f forms with =j "I": completed actions the owner claims.', 'So: ' + q(it.en) + '.'], 'The sḏm.n=f tells what the owner did.', { k: 'autotr', tl: it.tl });
  });

  var SIN1 = [
    { tl: 'zꜣ-nht ḏd=f', en: 'Sinuhe says:', w: ['The son of Sinuhe says it', 'Say it to Sinuhe!', 'Sinuhe said nothing'], why: 'zꜣ-nht "son of the sycamore" is the hero\'s name; ḏd=f "he says" introduces his story.' },
    { tl: 'jnk šmsw šms nb=f', en: 'I was a follower who followed his lord', w: ['I followed a follower of his lord', 'His lord followed me', 'Follow your lord, follower!'], why: 'jnk "I" leads a nominal sentence; šmsw is "a follower", and šms nb=f is a participle phrase, "who followed his lord".' },
    { tl: 'ḥꜣt-zp 30 ꜣbd 3 ꜣḫt sw 7', en: 'Year 30, third month of the Flood season, day 7', w: ['Year 3, thirtieth month of the Flood, day 7', 'Thirty years, three months and seven days of flooding', 'Year 7, third month of the Harvest, day 30'], why: 'The usual dating formula: regnal year, month of a season (ꜣḫt is the Flood season), day.', lv: 2 },
    { tl: 'ꜥr nṯr r ꜣḫt=f', en: 'the god ascended to his horizon', w: ['the god went down to his tomb', 'his horizon ascended to the god', 'may the god go to his horizon'], why: 'ꜥr "go up, ascend"; ꜣḫt "horizon". The "god" is the king, and the phrase is the polite way to say that he died.', lv: 2 },
    { tl: 'nsw-bjt sḥtp-jb-rꜥ', en: 'the King of Upper and Lower Egypt, Sehetepibre', w: ['the king of Lower Egypt, son of Ra', 'Ra satisfied the heart of the king', 'the king who pleases Ra\'s heart, son of Sehetep'], why: 'nsw-bjt introduces the throne name; sḥtp-jb-rꜥ "the one who satisfies the heart of Ra" is the throne name of Amenemhat I.', lv: 3 }];
  G('me2.sinuhe-opening', function (R, ctx) {
    var L = lvl(ctx), shape = L === 1 ? R.pick(['tr', 'fact']) : R.pick(['tr', 'fact', 'tr']);
    if (shape === 'fact') { var F = bank(R, ctx, [
        { q: 'Which king\'s death opens the Tale of Sinuhe?', a: 'Amenemhat I', w: ['Senusret III', 'Khufu', 'Ramesses II'], why: 'The tale begins in year 30 of Amenemhat I, founder of the 12th Dynasty, when "the god ascended to his horizon".' },
        { q: 'How does the tale begin?', a: 'With Sinuhe\'s titles, then his name and "he says"', w: ['With his name, then the date of his birth', 'With a prayer to Osiris', 'With the king\'s speech to Sinuhe'], why: 'Like a tomb autobiography, it opens with titles, then zꜣ-nht ḏd=f "Sinuhe says".' },
        { q: 'In ꜥr nṯr r ꜣḫt=f, who is "the god"?', a: 'The dead king', w: ['Ra, the sun god', 'Sinuhe', 'Osiris'], why: 'The king is called nṯr "god"; going up to his horizon means he died.', lv: 2 },
        { q: 'Who was leading the army against the Libyans when the old king died?', a: 'His son, the future Senusret I', w: ['Sinuhe', 'Amenemhat I himself', 'Ramesses II'], why: 'The prince Senusret was away on campaign; messengers came to him, and Sinuhe overheard the news.', lv: 2 },
        { q: 'In which period was the Tale of Sinuhe composed?', a: 'The Middle Kingdom', w: ['The Old Kingdom', 'The New Kingdom', 'The Ptolemaic Period'], why: 'It is set in the early 12th Dynasty and is a classic of Middle Kingdom literature; copies were still made in the New Kingdom.', lv: 3 }]);
      return P(F.q.replace(/ꜥr nṯr r ꜣḫt=f/, function (m) { return tl(m); }), mc(F.a, F.w), [F.why], 'Think of the 12th Dynasty.', { k: 'sinfact', q: F.q }); }
    var it = bank(R, ctx, SIN1);
    return P('Translate this line from the opening of the Tale of Sinuhe: ' + tl(it.tl), mc(cap(it.en), it.w.map(cap)), [it.why, 'So: ' + q(it.en) + '.'], 'Take it phrase by phrase.', { k: 'sintr', tl: it.tl });
  });

  G('me2.sinuhe-flight', function (R, ctx) {
    var L = lvl(ctx), shape = L === 1 ? R.pick(['story', 'map']) : R.pick(['story', 'map', 'line', 'parse']);
    if (shape === 'map') { var M = mapPick(R, 'byblos', ['kadesh', 'megiddo', 'serabit'], 'levant');
      return P('Fleeing Egypt, Sinuhe says he set out for Byblos before turning back toward Qedem. Which lettered dot is Byblos?', M.a,
        ['Byblos is a port on the coast of Lebanon, north of Megiddo and southwest of Kadesh.', 'Serabit el-Khadim is in Sinai, Egypt\'s own mining area.'], 'On the Mediterranean coast, north of Megiddo.', { k: 'flmap' }, M.viz); }
    if (shape === 'line') { var it = R.pick([['nfr tw ḥnꜥ=j', 'you will fare well with me', ['you are good to me', 'I am good with you', 'make me good!']], ['sḏm=k r n kmt', 'you will hear the speech of Egypt', ['you heard the mouth of Egypt', 'Egypt hears your speech', 'hear the speech of Egypt!']], ['nfr tw ḥnꜥ=j sḏm=k r n kmt', 'you will fare well with me, you will hear the speech of Egypt', ['I am good with you, I heard Egypt', 'Egypt is good to me, I hear you', 'be good with me and hear Egypt!']]]);
      return P('The ruler Amunenshi welcomes Sinuhe with these words: ' + tl(it[0]) + '. Translate.', mc(cap(it[1]), it[2].map(cap)),
        ['nfr tw is an adjectival sentence (adjective + dependent pronoun): "you are well".', 'sḏm=k is a sḏm=f, here looking ahead; r n kmt is "the mouth (speech) of Egypt": there are Egyptians with him.', 'So: ' + q(it[1]) + '.'], 'Adjective first, then its subject tw "you".', { k: 'flline', tl: it[0] }); }
    if (shape === 'parse') return P('In Amunenshi\'s words ' + tl('nfr tw ḥnꜥ=j') + ', what kind of sentence is ' + tl('nfr tw') + '?', mc('An adjectival sentence: the adjective nfr, then the dependent pronoun tw "you"', ['A sḏm=f of nfr with the passive .tw', 'An imperative, "be good!"', 'A nominal sentence with pw']),
      ['nfr first, then a dependent pronoun as its subject: the adjectival sentence of Middle Egyptian I.', 'It is not the passive: .tw would stand between a verb stem and its subject, and here tw is the subject itself.'], 'Adjective + dependent pronoun.', { k: 'flparse' });
    var S = bank(R, ctx, [
      { q: 'How does Sinuhe learn of the king\'s death?', a: 'He overhears a messenger speaking to the king\'s son', w: ['He reads it on a stela', 'The new king tells him at court', 'He dreams it'], why: 'He was near the prince\'s camp and overheard the news being told.' },
      { q: 'What does Sinuhe do when he hears the news?', a: 'He panics and flees from Egypt', w: ['He hurries to the palace to mourn', 'He is crowned king', 'He writes to the king of the Hittites'], why: 'His heart fails him and he runs, fearing what might come; why he fled is never fully explained.' },
      { q: 'Why did Sinuhe hide near the Walls of the Ruler?', a: 'They were a line of forts on Egypt\'s eastern border, with guards', w: ['They were the walls of the palace', 'They were a temple of Osiris', 'They were the walls of Byblos'], why: 'He crouched in a bush so the watchmen on the wall would not see him.', lv: 2 },
      { q: 'What nearly kills Sinuhe in the desert?', a: 'Thirst', w: ['A lion', 'The king\'s soldiers', 'A flood'], why: 'He says his throat was parched and he tasted death, until a sheikh of the herdsmen, who recognized him, gave him water and boiled milk.', lv: 2 },
      { q: 'Where does Sinuhe finally settle and prosper?', a: 'In Upper Retjenu, as a guest of the ruler Amunenshi', w: ['In Nubia, at Kerma', 'In Babylon', 'In the Faiyum'], why: 'Amunenshi welcomes him, gives him his eldest daughter in marriage and land to live on.', lv: 3 }]);
    return P(S.q, mc(S.a, S.w), [S.why], 'Recall the story of the flight.', { k: 'flstory', q: S.q });
  });

  G('me2.peasant', function (R, ctx) {
    var L = lvl(ctx), shape = L === 1 ? R.pick(['tr', 'story']) : R.pick(['tr', 'story', 'parse']);
    if (shape === 'tr') { var it = bank(R, ctx, [
        { tl: 'z pw wn ḫw-n-jnpw rn=f', en: 'There was a man named Khun-Anup (literally "a man it was who existed, Khun-Anup his name")', w: ['Khun-Anup was the name of his son', 'This man said his name to Anubis', 'A man protected by Anubis is named'] },
        { tl: 'sḫtj pw n sḫt-ḥmꜣt', en: 'he was a peasant of the Field of Salt', w: ['this field is salty', 'the peasant went to the field', 'a field of peasants made salt'] },
        { tl: 'jr mꜣꜥt n nb mꜣꜥt', en: 'Do what is right for the lord of what is right!', w: ['If what is right is for the lord', 'The eye of Maat belongs to the lord', 'He did right, but not for the lord'], lv: 2 },
        { tl: 'jw ḥmt=f mrt rn=s', en: 'his wife was named Meret', w: ['his wife loved her name', 'his beloved wife named him', 'his wife\'s name is beloved'], lv: 3 }]);
      return P('Translate this line from the Eloquent Peasant: ' + tl(it.tl), mc(it.en, it.w),
        [it.tl.indexOf('z pw') === 0 ? 'z pw wn is a set way to start a tale: "a man it was who existed", that is, "there was a man". Then the name and rn=f "his name".' : it.tl.indexOf('sḫtj pw') === 0 ? 'X pw: "he was X" (a sentence with pw). sḫt-ḥmꜣt is the Field of Salt, today\'s Wadi el-Natrun, west of the Delta.' : it.tl.indexOf('jr mꜣꜥt') === 0 ? 'jr is the imperative of jrj "do": a command to the official, to do maat for the lord of maat.' : 'Name + rn=s: "Meret (is) her name".', 'So: ' + q(it.en) + '.'], 'Start with the verb or the particle.', { k: 'peastr', tl: it.tl }); }
    if (shape === 'parse') return P('In ' + tl('jr mꜣꜥt n nb mꜣꜥt') + ', what is ' + tl('jr') + '?', mc('The imperative of jrj "do": "Do!"', ['The particle jr "if"', 'The noun "eye"', 'The sḏm=f of jrj with its subject left out']),
      ['It begins a command addressed to the high steward Rensi, with no suffix pronoun: the imperative.', 'Translate: "Do what is right for the lord of what is right!"'], 'It begins a command.', { k: 'peasparse' });
    var S = bank(R, ctx, [
      { q: 'What happens to the peasant on his way to market?', a: 'An official\'s man seizes his donkeys and goods', w: ['A flood carries away his house', 'Bandits from the desert kill his wife', 'The king takes his land'], why: 'Nemtynakht tricks him on a narrow path and takes his donkeys and their loads.' },
      { q: 'To whom does the peasant plead for justice?', a: 'The high steward Rensi, son of Meru', w: ['Pharaoh Ramesses II', 'Nemtynakht himself', 'The god Osiris at Abydos'], why: 'He appeals to Rensi, Nemtynakht\'s master, in a series of speeches.' },
      { q: 'How many petitions does the peasant make?', a: 'Nine', w: ['Three', 'Five', 'Twelve'], why: 'The tale gives nine petitions, each more passionate than the last.', lv: 2 },
      { q: 'Why does the king let the pleading go on?', a: 'He enjoys the peasant\'s eloquence and wants his speeches written down', w: ['He has forgotten the case', 'He wants to punish the peasant', 'He is away fighting in Nubia'], why: 'The king tells Rensi to keep him talking, have his words written down, and see that his family is fed meanwhile.', lv: 2 },
      { q: 'How should the peasant\'s praise of Rensi be read?', a: 'As a mix of praise, complaint and irony, not simple flattery', w: ['As sincere flattery only', 'As a hymn to the sun god', 'As a legal contract'], why: 'He praises Rensi as the balance and the rudder of justice and then accuses him of failing to act.', lv: 3 }]);
    return P(S.q, mc(S.a, S.w), [S.why], 'Recall the story of the Eloquent Peasant.', { k: 'peasstory', q: S.q });
  });

  G('me2.rosetta-hiero', function (R, ctx) {
    var L = lvl(ctx), shape = L === 1 ? R.pick(['cart', 'fact']) : R.pick(['cart', 'fact', 'tr', 'script']);
    if (shape === 'cart') return P('This cartouche appears again and again in the hieroglyphic text of the Rosetta Stone. Transliterate the name.', TL('ptwlmys'),
      ['Read the sound signs in order: p (stool), t (bread loaf), w (lasso, for Greek o), l (lion), m, y (two reeds), s (folded cloth).', 'That spells ' + tl('ptwlmys') + ', Ptolemy (Greek Ptolemaios): here Ptolemy V.'],
      'A Greek name spelled out with sound signs.', { k: 'rocart' }, { name: 'eg-cartouche', opts: { name: 'ptolemy', quiet: true, interactive: false } });
    if (shape === 'tr') { var it = R.pick([['ptwlmys ꜥnḫ ḏt mrj ptḥ', 'Ptolemy, living forever, beloved of Ptah', ['Ptolemy loved Ptah and lived forever', 'Ptah, beloved of Ptolemy, lives', 'Ptolemy gave life to Ptah forever']], ['ꜥnḫ ḏt', 'living forever', ['life is a cobra', 'he lived for a time', 'make him live!']], ['mrj ptḥ', 'beloved of Ptah', ['who loves Ptah', 'Ptah loves', 'love Ptah!']]]);
      return P('Translate this phrase from Ptolemy V\'s cartouche on the Rosetta Stone: ' + tl(it[0]), mc(it[1], it[2]),
        ['ꜥnḫ ḏt: "living forever" (ḏt "eternity").', 'mrj ptḥ: a passive participle, "beloved", with the god as the one who loves. Ptah\'s name is written before mrj out of honor but read after it.', 'So: ' + q(it[1]) + '.'], 'mrj is a passive participle.', { k: 'rotr', tl: it[0] }); }
    if (shape === 'script') { var s = R.pick([['sẖ n mdw-nṯr', 'hieroglyphs ("the writing of the god\'s words")'], ['sẖ n šꜥt', 'Demotic ("the writing of documents")'], ['sẖ n ḥꜣw-nbw', 'Greek ("the writing of the Greeks")']]);
      return P('The decree ends by ordering that it be written in three scripts. Which script is ' + tl(s[0]) + '?', mc(cap(s[1]), ['hieroglyphs ("the writing of the god\'s words")', 'Demotic ("the writing of documents")', 'Greek ("the writing of the Greeks")'].filter(function (x) { return x !== s[1]; }).map(cap).concat(['Coptic ("the writing of the church")'])),
        ['sẖ is "writing". mdw-nṯr "god\'s words" is the Egyptian name for hieroglyphs; šꜥt "letters, documents" names Demotic; ḥꜣw-nbw is a name for the Greeks.', 'So: ' + s[1] + '.'], 'mdw-nṯr: the god\'s words.', { k: 'roscript', tl: s[0] }); }
    var F = bank(R, ctx, [
      { q: 'Which king does the Rosetta Stone decree honor?', a: 'Ptolemy V', w: ['Ramesses II', 'Cleopatra VII', 'Alexander the Great'], why: 'The priests met at Memphis in 196 BC and issued the decree in honor of Ptolemy V.' },
      { q: 'In which year was the Rosetta decree issued?', a: '196 BC', w: ['c. 1274 BC', '30 BC', 'AD 394'], why: 'It is dated to 196 BC, in the Ptolemaic Period.' },
      { q: 'Why does the Rosetta hieroglyphic text not look like classical Middle Egyptian everywhere?', a: 'It was written in the Ptolemaic Period, with later spellings and some new signs', w: ['It was carved by Greek workmen who did not know Egyptian', 'It is a modern copy', 'It is written in Coptic letters'], why: 'Priests wrote it in the traditional language, but with the spellings and signs of their own day.', lv: 2 },
      { q: 'Which of the three texts on the Rosetta Stone is the most damaged?', a: 'The hieroglyphic text at the top', w: ['The Demotic text in the middle', 'The Greek text at the bottom', 'None: all three are complete'], why: 'Only the last 14 lines of the hieroglyphic text survive; the Demotic has 32 lines and the Greek 54.', lv: 2 }]);
    return P(F.q, mc(F.a, F.w), [F.why], 'The decree is Ptolemaic.', { k: 'rofact', q: F.q }, F.q.indexOf('damaged') > 0 ? { name: 'eg-scripts', opts: { mode: 'rosetta', quiet: true, interactive: false } } : null);
  });

  var TRN = [
    { tl: 'jw=j jj.kj', lit: 'is I come-I', good: 'I have come.', w: ['Is I come.', 'I come every day.', 'Come to me!'] },
    { tl: 'nfr sw', lit: 'good he', good: 'He is good.', w: ['Good him.', 'He made it good.', 'His goodness.'] },
    { tl: 'zꜣ=f mrj=f', lit: 'his son, his beloved', good: 'his beloved son', w: ['his son, he loves him', 'his son, his love', 'he loves his son'] },
    { tl: 'nn mw', lit: 'not water', good: 'There is no water.', w: ['Not water.', 'These waters.', 'Water is nothing.'] },
    { tl: 'jn nsw rdj ḥtp', lit: 'by the king one who gives an offering', good: 'It is the king who gives an offering.', w: ['By the king, giving an offering.', 'Does the king give an offering?', 'The offering gives the king.'], lv: 2 },
    { tl: 'mk wj jj.kj', lit: 'look me come-I', good: 'Here I am! (Look, I have come.)', w: ['Look at me, come!', 'Look, I will come.', 'Me, I look at the coming.'], lv: 2 },
    { tl: 'z pw wn ḫw-n-jnpw rn=f', lit: 'a man it was, existing, Khun-Anup his name', good: 'There was once a man named Khun-Anup.', w: ['A man, this, was Khun-Anup, his name.', 'This man was named for Anubis.', 'Khun-Anup was a man of his name.'], lv: 3 },
    { tl: 'ꜥr nṯr r ꜣḫt=f', lit: 'went up the god to his horizon', good: 'The god ascended to his horizon (the king died).', w: ['Went up the god to his horizon.', 'The god will go up to his horizon.', 'His horizon rose to the god.'], lv: 3 }];
  G('me2.translating', function (R, ctx) {
    var it = bank(R, ctx, TRN);
    return P('A word-for-word gloss of ' + tl(it.tl) + ' is "' + it.lit + '". Which is the best English translation?', mc(it.good, it.w),
      ['Keep the meaning and the grammar (who does what, when), then say it the way English does.', 'So: ' + q(it.good)], 'Read the whole clause, then say it in natural English.', { k: 'trn', tl: it.tl });
  });

  // Gardiner's sign-list groups (Egyptian Grammar, Sign-list)
  var GROUPS = { A: 'Man and his occupations', B: 'Woman and her occupations', C: 'Anthropomorphic deities', D: 'Parts of the human body', E: 'Mammals', F: 'Parts of mammals', G: 'Birds', H: 'Parts of birds',
    I: 'Amphibious animals, reptiles, etc.', K: 'Fishes and parts of fishes', L: 'Invertebrates and lesser animals', M: 'Trees and plants', N: 'Sky, earth, water', O: 'Buildings, parts of buildings, etc.', P: 'Ships and parts of ships',
    Q: 'Domestic and funerary furniture', R: 'Temple furniture and sacred emblems', S: 'Crowns, dress, staves, etc.', T: 'Warfare, hunting, butchery', U: 'Agriculture, crafts and professions', V: 'Rope, fiber, baskets, bags, etc.',
    W: 'Vessels of stone and earthenware', X: 'Loaves and cakes', Y: 'Writings, games, music', Z: 'Strokes, signs derived from hieratic, geometrical figures', Aa: 'Unclassified' };
  function groupOf(code) { var m = /^(Aa|[A-Z])/.exec(code); return m ? m[1] : null; }
  G('me2.sign-list', function (R, ctx) {
    var L = lvl(ctx), E = EG(), codes = E.SIGN_ORDER.filter(function (c) { return GROUPS[groupOf(c)] && !/A$/.test(c.replace(/^Aa/, '')); });
    var c = R.pick(codes), g = groupOf(c), S = E.SIGNS[c], shape = L === 1 ? 'group' : L === 2 ? R.pick(['group', 'letter', 'code']) : R.pick(['code', 'letter', 'group']);
    var others = R.sample(Object.keys(GROUPS).filter(function (x) { return x !== g && x !== 'Aa' && x !== 'Z'; }), 3);
    if (shape === 'group') return P('This sign shows ' + art(S.n) + '. In which group of Gardiner\'s sign list will you find it?', mc(g + ': ' + GROUPS[g], others.map(function (x) { return x + ': ' + GROUPS[x]; })),
      ['Gardiner sorts signs by what they show, not by their sound or meaning.', 'It shows ' + S.n + ', so it is in group ' + g + ' (' + GROUPS[g] + '): its code is ' + c + '.'], 'What is pictured?', { k: 'slgroup', c: c, g: g }, gviz(c, { size: 90 }));
    if (shape === 'letter') return P('The sign ' + c + ' (' + S.n + ') belongs to which group? Type the group letter.', { t: 'text', v: [g] },
      ['A Gardiner code is the group letter(s) plus a number: ' + c + ' is in group ' + g + ', ' + GROUPS[g] + '.'], 'The letters before the number.', { k: 'slletter', c: c, g: g }, gviz(c, { size: 90 }));
    var sib = codes.filter(function (x) { return groupOf(x) !== g; }), wr = R.sample(sib, 3);
    return P('Which of these codes is the sign that shows ' + art(S.n) + '?', mc(c, wr),
      ['Find the group first: ' + S.n + ' belongs in group ' + g + ' (' + GROUPS[g] + ').', 'Only ' + c + ' is in that group.'], 'First the group letter, then the number.', { k: 'slcode', c: c, g: g }, gviz(c, { size: 90 }));
  });

  function dictCmp(a, b) { var E = EG(), A = E.letters(a), B = E.letters(b), O = E.ALPHA_ORDER; for (var i = 0; i < Math.min(A.length, B.length); i++) { var d = O.indexOf(A[i]) - O.indexOf(B[i]); if (d) return d; } return A.length - B.length; }
  var DICTW = ['ꜣḫ', 'jb', 'jmn', 'jt', 'ꜥnḫ', 'ꜥꜣ', 'wr', 'wsr', 'bꜣ', 'pr', 'pt', 'mꜣꜥt', 'mw', 'mn', 'nb', 'nfr', 'nṯr', 'rn', 'rꜥ', 'hrw', 'ḥtp', 'ḥqꜣ', 'ḫpr', 'ḫrw', 'zꜣ', 'sḏm', 'sꜥnḫ', 'kꜣ', 'tꜣ', 'ḏd', 'ḏw', 'ḥm', 'šms', 'qd', 'gb', 'ṯꜣw'];
  var HEAD = [['sḏm.n=f', 'sḏm', 'the sḏm.n=f of sḏm "hear"'], ['nfrt', 'nfr', 'the feminine of nfr "good"'], ['jr.n=f', 'jrj', 'the sḏm.n=f of jrj "do"'], ['nṯrw', 'nṯr', 'the plural of nṯr "god"'], ['mr.n=j', 'mrj', 'the sḏm.n=f of mrj "love"'],
    ['dj=f', 'rdj', 'the sḏm=f of rdj "give"'], ['sḏmt=f', 'sḏm', 'the sḏmt=f of sḏm'], ['ḏd.tw', 'ḏd', 'the passive of ḏd "say"'], ['jj.kj', 'jj', 'the stative of jj "come"'], ['wrw', 'wr', 'the plural of wr "great (one)"'], ['ꜥnḫ.tj', 'ꜥnḫ', 'the stative of ꜥnḫ "live"']];
  G('me2.dictionary', function (R, ctx) {
    var L = lvl(ctx), shape = L === 1 ? R.pick(['first', 'head']) : R.pick(['first', 'head', 'order']);
    if (shape === 'head') { var h = R.pick(L === 1 ? HEAD.slice(0, 4) : HEAD);
      return P('Under which headword would you look up ' + tl(h[0]) + ' in a Middle Egyptian dictionary? Type it.', TL(h[1]),
        [tl(h[0]) + ' is ' + h[2] + '.', 'Dictionaries list the base word (for verbs, the full root), so look under ' + tl(h[1]) + '.'], 'Strip endings and restore weak consonants.', { k: 'dhead', f: h[0], h: h[1] }); }
    var n = shape === 'order' ? 3 : 4, ws = R.sample(DICTW, n), sorted = ws.slice().sort(dictCmp);
    if (shape === 'first') return P('Which of these words comes first in a Middle Egyptian dictionary?', mc(tl(sorted[0]), sorted.slice(1).map(tl)),
      ['The order is ꜣ j y ꜥ w b p f m n r h ḥ ḫ ẖ z s š q k g t ṯ d ḏ.', 'Compare the first letters (then the second, if they tie): ' + sorted.map(function (w) { return tl(w); }).join(', ') + '.', 'So ' + tl(sorted[0]) + ' comes first.'], 'ꜣ and j come first; ḏ comes last.', { k: 'dfirst', ws: ws, a: sorted[0] });
    var perms = [sorted, [sorted[1], sorted[0], sorted[2]], [sorted[2], sorted[1], sorted[0]], [sorted[0], sorted[2], sorted[1]]];
    return P('Put these words in dictionary order: ' + R.shuffle(ws).map(tl).join(', ') + '.', orderMc(R, perms.map(function (p) { return p.map(tl).join(' → '); })),
      ['The order is ꜣ j y ꜥ w b p f m n r h ḥ ḫ ẖ z s š q k g t ṯ d ḏ.', 'Sorted: ' + sorted.map(tl).join(' → ') + '.'], 'Compare first letters, then second letters.', { k: 'dorder', ws: ws, a: sorted });
  });
})(window.MathLadder);

/* ---- widen_hum: more questions from the lesson's own tables -----------------------------------------------------
   Each topic listed below also asks about the facts in its lesson's tables (copied here from the lesson, so the
   answers are the lesson's own). Forms, by level:
     match   "Which museum is in Turin?": the right cell and others from the same column (3 choices at level 1, 4 above)
     pairs   lines "A → B": which pairing is right (level 2), or which one is wrong (level 3)
     sort    a comparison table: which column does this cell describe (levels 1-2), or choose all for one column (level 3)
   How often: about a third to a half of the draws, more when the topic's own questions are few at that level.
   Generated by /tmp/work_widen_widen_hum/tabbuild.js from data/<ladder>/lessons/<course>.json. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var TABS = [{"k":"me2.roots#6","h":["Form","Take off","Root"],"r":[["<i class=\"eg-tl\">sḏm=f</i>","<i class=\"eg-tl\">=f</i> \"he\"","<i class=\"eg-tl\">sḏm</i>"],["<i class=\"eg-tl\">sḏm.n=f</i>","<i class=\"eg-tl\">.n</i> and <i class=\"eg-tl\">=f</i>","<i class=\"eg-tl\">sḏm</i>"],["<i class=\"eg-tl\">ḏd.tw=s</i>","<i class=\"eg-tl\">.tw</i> and <i class=\"eg-tl\">=s</i>","<i class=\"eg-tl\">ḏd</i>"],["<i class=\"eg-tl\">ꜥnḫ=j</i>","<i class=\"eg-tl\">=j</i> \"I\"","<i class=\"eg-tl\">ꜥnḫ</i>"]],"cap":"The dots and equals signs are a modern convention that marks where endings begin.","m":[[0,2,"What is the root of the form {a}?",0,"a form with its root"],[0,1,"In the form {a}, what do you take off to find the root?",0,0,2]]},
    {"k":"me2.causatives#4","h":["Root","Meaning"],"r":[["<i class=\"eg-tl\">ꜥnḫ</i>","live"],["<i class=\"eg-tl\">sꜥnḫ</i>","make live, keep alive"],["<i class=\"eg-tl\">mn</i>","remain, be firm"],["<i class=\"eg-tl\">smn</i>","make firm, establish"],["<i class=\"eg-tl\">ḥtp</i>","be content"],["<i class=\"eg-tl\">sḥtp</i>","satisfy, pacify"],["<i class=\"eg-tl\">ḫpr</i>","come into being"],["<i class=\"eg-tl\">sḫpr</i>","bring into being, create"],["<i class=\"eg-tl\">nfr</i>","be good"],["<i class=\"eg-tl\">snfr</i>","make good, beautify"],["<i class=\"eg-tl\">wꜥb</i>","be pure"],["<i class=\"eg-tl\">swꜥb</i>","purify"],["<i class=\"eg-tl\">ꜥꜣ</i>","be great"],["<i class=\"eg-tl\">sꜥꜣ</i>","make great, magnify"]],"cap":"","m":[[0,1,"What does {a} mean?",0,"a word with its meaning"],[1,0,"Which word means \"{a}\"?",0,0,2]]},
    {"k":"me2.weak-verbs#3","h":["Verb","Forms you will see","Notes"],"r":[["<i class=\"eg-tl\">rdj</i> \"give\"","<i class=\"eg-tl\">dj=f</i>, <i class=\"eg-tl\">rdj.n=f</i>, <i class=\"eg-tl\">dj.tw</i>, <i class=\"eg-tl\">jmj</i>","the <i class=\"eg-tl\">r</i> is often missing; \"give!\" is <i class=\"eg-tl\">jmj</i>"],["<i class=\"eg-tl\">jj</i> / <i class=\"eg-tl\">jw</i> \"come\"","<i class=\"eg-tl\">jj.n=f</i>, <i class=\"eg-tl\">jw=f</i>…, <i class=\"eg-tl\">jj.kj</i>, <i class=\"eg-tl\">mj</i>","\"come!\" is <i class=\"eg-tl\">mj</i>"],["<i class=\"eg-tl\">jnj</i> \"bring\"","<i class=\"eg-tl\">jn.n=f</i>, <i class=\"eg-tl\">jn=f</i>, <i class=\"eg-tl\">jnt</i>","drops its final <i class=\"eg-tl\">j</i> like a third-weak verb"],["<i class=\"eg-tl\">wnn</i> \"be, exist\"","<i class=\"eg-tl\">wnn=f</i>, <i class=\"eg-tl\">wn.n=f</i>","writes one or two <i class=\"eg-tl\">n</i>; used as a helping verb"]],"cap":"","m":[[0,1,"Which forms will you see of the verb {a}?",0,"a verb with its forms"]]},
    {"k":"me2.inf-forms#3","h":["Verb","Class","Infinitive"],"r":[["<i class=\"eg-tl\">sḏm</i> \"hear\"","strong","<i class=\"eg-tl\">sḏm</i>"],["<i class=\"eg-tl\">ḏd</i> \"say\"","strong","<i class=\"eg-tl\">ḏd</i>"],["<i class=\"eg-tl\">jrj</i> \"do\"","third-weak","<i class=\"eg-tl\">jrt</i>"],["<i class=\"eg-tl\">mrj</i> \"love\"","third-weak","<i class=\"eg-tl\">mrt</i> (some books write <i class=\"eg-tl\">mrjt</i>)"],["<i class=\"eg-tl\">gmj</i> \"find\"","third-weak","<i class=\"eg-tl\">gmt</i>"],["<i class=\"eg-tl\">msj</i> \"give birth\"","third-weak","<i class=\"eg-tl\">mst</i>"],["<i class=\"eg-tl\">mꜣꜣ</i> \"see\"","second-geminate","<i class=\"eg-tl\">mꜣꜣ</i>"],["<i class=\"eg-tl\">rdj</i> \"give\"","irregular","<i class=\"eg-tl\">rdjt</i>, <i class=\"eg-tl\">djt</i>"],["<i class=\"eg-tl\">jj</i> \"come\"","irregular","<i class=\"eg-tl\">jjt</i> or <i class=\"eg-tl\">jwt</i>"],["<i class=\"eg-tl\">jnj</i> \"bring\"","irregular","<i class=\"eg-tl\">jnt</i>"]],"cap":"","m":[[0,2,"What is the infinitive of {a}?",0,"a verb with its infinitive"],[0,1,"To which class does the verb {a} belong?",0,0,2]]},
    {"k":"me2.sdmf-form#4","h":["Suffix","sḏm=f","Meaning"],"r":[["<i class=\"eg-tl\">=j</i>","<i class=\"eg-tl\">sḏm=j</i>","I hear"],["<i class=\"eg-tl\">=k</i>","<i class=\"eg-tl\">sḏm=k</i>","you hear (said to a man)"],["<i class=\"eg-tl\">=ṯ</i>","<i class=\"eg-tl\">sḏm=ṯ</i>","you hear (said to a woman)"],["<i class=\"eg-tl\">=f</i>","<i class=\"eg-tl\">sḏm=f</i>","he hears"],["<i class=\"eg-tl\">=s</i>","<i class=\"eg-tl\">sḏm=s</i>","she hears"],["<i class=\"eg-tl\">=n</i>","<i class=\"eg-tl\">sḏm=n</i>","we hear"],["<i class=\"eg-tl\">=ṯn</i>","<i class=\"eg-tl\">sḏm=ṯn</i>","you hear (more than one)"],["<i class=\"eg-tl\">=sn</i>","<i class=\"eg-tl\">sḏm=sn</i>","they hear"]],"cap":"","m":[[1,2,"What does {a} mean?",0,"a form with its meaning"],[0,1,"Add the suffix {a} to sḏm. Which form is it?",0,0,2]]},
    {"k":"me2.sdmf-meaning#3","h":["Setting","Example","Meaning"],"r":[["a statement with <i class=\"eg-tl\">jw</i>","<i class=\"eg-tl\">jw ḏd=f mꜣꜥt</i>","he speaks the truth (always, as a rule)"],["the offering formula","<i class=\"eg-tl\">ḥtp-dj-nsw wsjr dj=f prt-ḫrw</i>","may he give an invocation offering"],["a blessing","<i class=\"eg-tl\">ꜥnḫ=k ḏt</i>","may you live forever"],["after <i class=\"eg-tl\">ḥꜣ</i> \"would that\"","<i class=\"eg-tl\">ḥꜣ sḏm=f</i>","if only he would hear!"],["after <i class=\"eg-tl\">jr</i> \"if\"","<i class=\"eg-tl\">jr sḏm=k</i>","if you listen"]],"cap":"","m":[[1,2,"What does {a} mean?",0,"an Egyptian form with its meaning"],[2,1,"Which Egyptian sentence means \"{a}\"?",0,0,2]]},
    {"k":"me2.sdmf-weak#4","h":["Verb","sḏm=f","Meaning"],"r":[["<i class=\"eg-tl\">jrj</i> \"do\"","<i class=\"eg-tl\">jr=f</i>, <i class=\"eg-tl\">jrr=f</i>","he does"],["<i class=\"eg-tl\">mrj</i> \"love\"","<i class=\"eg-tl\">mr=f</i>, <i class=\"eg-tl\">mrr=f</i>","he loves"],["<i class=\"eg-tl\">gmj</i> \"find\"","<i class=\"eg-tl\">gm=f</i>","he finds"],["<i class=\"eg-tl\">rdj</i> \"give\"","<i class=\"eg-tl\">dj=f</i>, <i class=\"eg-tl\">rdj=f</i>","he gives"],["<i class=\"eg-tl\">mꜣꜣ</i> \"see\"","<i class=\"eg-tl\">mꜣꜣ=f</i>, <i class=\"eg-tl\">mꜣ=f</i>","he sees"],["<i class=\"eg-tl\">jnj</i> \"bring\"","<i class=\"eg-tl\">jn=f</i>","he brings"]],"cap":"","m":[[0,1,"What is the sḏm=f of the verb {a}?",0,"a verb with its sḏm=f"],[1,2,"What does {a} mean?",0,0,2]]},
    {"k":"me2.rdj-sdmf#4","h":["Egyptian","Word for word","Translation"],"r":[["<i class=\"eg-tl\">rdj.n=f sḏm=j</i>","he gave (that) I hear","he let me hear"],["<i class=\"eg-tl\">rdj.n nsw ꜥnḫ=j</i>","the king gave (that) I live","the king let me live"],["<i class=\"eg-tl\">jmj sḏm=f</i>","give (that) he hear!","let him hear!"],["<i class=\"eg-tl\">rdj.n=j ḫpr=f</i>","I gave (that) it come into being","I caused it to come into being"]],"cap":"","m":[[0,2,"How would you translate {a}?",0,"an Egyptian form with its meaning"],[2,0,"Which Egyptian means \"{a}\"?",0,0,2]]},
    {"k":"me2.sdmnf-meaning#4","h":["Setting","Example","Translation"],"r":[["narrative","<i class=\"eg-tl\">rdj.n=f t n z</i>","he gave bread to the man"],["a speech","<i class=\"eg-tl\">jj.n=j ḫr=k</i>","I have come to you"],["after <i class=\"eg-tl\">jr</i> \"if\"","<i class=\"eg-tl\">jr sḏm.n=k</i>","if you have heard"],["with <i class=\"eg-tl\">rḫ</i> \"learn, know\"","<i class=\"eg-tl\">rḫ.n=f rn=j</i>","he knows my name (he has learned it)"]],"cap":"","m":[[1,2,"How would you translate {a}?",0,"an Egyptian form with its meaning"],[2,1,"Which Egyptian means \"{a}\"?",0,0,2]]},
    {"k":"me2.stative-meaning#3","h":["Verb","Kind","Stative","Meaning"],"r":[["<i class=\"eg-tl\">jj</i> \"come\"","intransitive","<i class=\"eg-tl\">jw=f jj.w</i>","he has come, he is here"],["<i class=\"eg-tl\">sḏr</i> \"lie down\"","intransitive","<i class=\"eg-tl\">jw=f sḏr.w</i>","he is lying down"],["<i class=\"eg-tl\">ꜥḥꜥ</i> \"stand\"","intransitive","<i class=\"eg-tl\">jw=j ꜥḥꜥ.kj</i>","I am standing"],["<i class=\"eg-tl\">ḫtm</i> \"seal\"","transitive","<i class=\"eg-tl\">jw pr ḫtm.w</i>","the house is sealed"],["<i class=\"eg-tl\">jrj</i> \"do\"","transitive","<i class=\"eg-tl\">jw ḫt nbt jr.tj</i>","everything is done"],["<i class=\"eg-tl\">sḏm</i> \"hear\"","transitive","<i class=\"eg-tl\">jw mdt sḏm.tj</i>","the words are heard"]],"cap":"","m":[[2,3,"What does {a} mean?",0,"a stative with its meaning"]]},
    {"k":"me2.stative-use#3","h":["Subject","Stative","Together"],"r":[["after <i class=\"eg-tl\">mk</i>: dependent pronoun <i class=\"eg-tl\">wj</i>","<i class=\"eg-tl\">jj.kj</i>","<i class=\"eg-tl\">mk wj jj.kj</i> \"look, I have come\""],["after <i class=\"eg-tl\">jw</i>: suffix pronoun <i class=\"eg-tl\">=f</i>","<i class=\"eg-tl\">jj.w</i>","<i class=\"eg-tl\">jw=f jj.w</i> \"he has come\""],["a noun: <i class=\"eg-tl\">nṯr</i>","<i class=\"eg-tl\">ḥtp.w</i>","<i class=\"eg-tl\">jw nṯr ḥtp.w</i> \"the god is content\""],["after a verb: object <i class=\"eg-tl\">sw</i>","<i class=\"eg-tl\">sḏr.w</i>","<i class=\"eg-tl\">gm.n=j sw sḏr.w</i> \"I found him lying down\""]],"cap":"","m":[[2,0,"In {a}, what kind of subject comes before the stative?",0]]},
    {"k":"me2.active-participles#4","h":["Verb","Participle","Meaning"],"r":[["<i class=\"eg-tl\">sḏm</i> \"hear\"","<i class=\"eg-tl\">sḏm</i>","one who hears"],["<i class=\"eg-tl\">ḏd</i> \"say\"","<i class=\"eg-tl\">ḏd</i>","one who says"],["<i class=\"eg-tl\">rḫ</i> \"know\"","<i class=\"eg-tl\">rḫ</i>","one who knows"],["<i class=\"eg-tl\">mrj</i> \"love\"","<i class=\"eg-tl\">mrr</i>","one who loves (repeatedly, as a habit)"],["<i class=\"eg-tl\">jrj</i> \"do\"","<i class=\"eg-tl\">jrr</i>","one who does"],["<i class=\"eg-tl\">sꜥnḫ</i> \"make live\"","<i class=\"eg-tl\">sꜥnḫ</i>","one who gives life"]],"cap":"","m":[[0,2,"What does the active participle of {a} mean?",0,"a verb with its participle's meaning"],[2,0,"From which verb comes the participle meaning \"{a}\"?",0,0,2]]},
    {"k":"me2.passive-participles#4","h":["Phrase","Participle","Meaning"],"r":[["<i class=\"eg-tl\">mrj nb=f</i>","passive","beloved of his lord"],["<i class=\"eg-tl\">ḥzj nb=f</i>","passive","praised by his lord"],["<i class=\"eg-tl\">mrj jmn</i>","passive","beloved of Amun"],["<i class=\"eg-tl\">dj ꜥnḫ</i>","passive","given life (after a king's name)"],["<i class=\"eg-tl\">ḫt nbt rdjt n=f</i>","passive","everything that was given to him"],["<i class=\"eg-tl\">sḏm mdt</i>","active","one who hears the words"]],"cap":"","m":[[0,2,"What does {a} mean?",0,"an Egyptian form with its meaning"],[2,0,"Which phrase means \"{a}\"?",0,0,2]]},
    {"k":"me2.participle-agreement#3","h":["Noun","Participle","Phrase","Meaning"],"r":[["<i class=\"eg-tl\">z</i> man (m.)","<i class=\"eg-tl\">sḏm</i>","<i class=\"eg-tl\">z sḏm ḫrw</i>","the man who hears the voice"],["<i class=\"eg-tl\">zꜣt</i> daughter (f.)","<i class=\"eg-tl\">sḏmt</i>","<i class=\"eg-tl\">zꜣt sḏmt ḫrw</i>","the daughter who hears the voice"],["<i class=\"eg-tl\">nṯrw</i> gods (pl.)","<i class=\"eg-tl\">sḏmw</i>","<i class=\"eg-tl\">nṯrw sḏmw ḫrw</i>","the gods who hear the voice"],["","<i class=\"eg-tl\">ḏdw</i>","<i class=\"eg-tl\">ḏdw mꜣꜥt</i>","those who speak the truth"],["","<i class=\"eg-tl\">ḏdt</i>","<i class=\"eg-tl\">ḏdt mꜣꜥt</i>","she who speaks the truth"]],"cap":"","m":[[2,3,"What does {a} mean?",0,"an Egyptian form with its meaning"],[3,2,"Which phrase means \"{a}\"?",0,0,2]]},
    {"k":"me2.relative-forms#4","h":["Noun","Relative form","Meaning"],"r":[["<i class=\"eg-tl\">rn</i> name (m.)","<i class=\"eg-tl\">ḏd.n=f</i>","the name that he said"],["<i class=\"eg-tl\">t</i> bread (m.)","<i class=\"eg-tl\">rdj.n=j</i>","the bread that I gave"],["<i class=\"eg-tl\">ḫt</i> thing (f.)","<i class=\"eg-tl\">rdjt.n=f</i>","the thing that he gave"],["<i class=\"eg-tl\">zꜣt</i> daughter (f.)","<i class=\"eg-tl\">mrt.n=f</i>","the daughter whom he loved"],["<i class=\"eg-tl\">njwt</i> town (f.)","<i class=\"eg-tl\">jrt.n=f</i>","the town that he made"]],"cap":"","m":[[1,2,"What does {a} mean?",0,"a relative form with its meaning"]]},
    {"k":"me2.ntj#4","h":["Noun","ntj","Negative"],"r":[["masculine: <i class=\"eg-tl\">z</i>","<i class=\"eg-tl\">ntj</i>","<i class=\"eg-tl\">jwtj</i>"],["feminine: <i class=\"eg-tl\">zꜣt</i>","<i class=\"eg-tl\">ntt</i>","<i class=\"eg-tl\">jwtt</i>"],["plural: <i class=\"eg-tl\">rmṯ</i>, <i class=\"eg-tl\">nṯrw</i>","<i class=\"eg-tl\">ntjw</i>","<i class=\"eg-tl\">jwtjw</i>"]],"cap":"","m":[[0,1,"Which form of ntj goes with this noun: {a}?",0,"a noun with its form of ntj"],[0,2,"Which negative relative goes with this noun: {a}?",0,0,2]]},
    {"k":"me2.tw-passive#4","h":["Active","Passive with .tw"],"r":[["<i class=\"eg-tl\">sḏm=f</i> he hears","<i class=\"eg-tl\">sḏm.tw=f</i> he is heard"],["<i class=\"eg-tl\">rḫ=s</i> she knows","<i class=\"eg-tl\">rḫ.tw=s</i> she is known"],["<i class=\"eg-tl\">dj=f ḥtp</i> he gives an offering","<i class=\"eg-tl\">rdj.tw ḥtp</i> an offering is given"],["<i class=\"eg-tl\">sḏm.n=f</i> he heard","<i class=\"eg-tl\">sḏm.n.tw=f</i> he was heard"]],"cap":"","m":[[0,1,"What is the passive with .tw of {a}?",0,"an active with its passive"],[1,0,"What is the active of {a}?",0,0,2]]},
    {"k":"me2.other-passives#3","h":["Kind","Example","Meaning","How to spot it"],"r":[["sḏm.tw=f","<i class=\"eg-tl\">sḏm.tw=f</i>","he is heard","the ending <i class=\"eg-tl\">.tw</i>"],["passive sḏm=f","<i class=\"eg-tl\">rdj n=j t</i>","bread was given to me","the sense: no doer, the thing given as subject"],["stative","<i class=\"eg-tl\">jw pr ḫtm.w</i>","the house is sealed","subject first, stative ending"],["passive participle","<i class=\"eg-tl\">mrj nb=f</i>","beloved of his lord","it describes a noun, like an adjective"]],"cap":"","m":[[1,2,"What does {a} mean?",0,"a passive with its meaning"],[0,3,"How do you spot this kind of passive: {a}?",0,0,2]]},
    {"k":"me2.sdmtf#3","h":["Egyptian","Meaning"],"r":[["<i class=\"eg-tl\">n sḏmt=f</i>","he has not yet heard; before he heard"],["<i class=\"eg-tl\">r sḏmt=f</i>","until he hears"],["<i class=\"eg-tl\">n jjt=f</i>","he has not yet come; before he came"],["<i class=\"eg-tl\">r jjt=f</i>","until he comes"],["<i class=\"eg-tl\">n ḏdt=s</i>","she has not yet spoken"],["<i class=\"eg-tl\">r jrt=k</i>","until you do (it)"]],"cap":"","m":[[0,1,"What does {a} mean?",0,"an Egyptian form with its meaning"],[1,0,"Which Egyptian means \"{a}\"?",0,0,2]]},
    {"k":"me2.neg-imperative#3","h":["Positive","Negative"],"r":[["<i class=\"eg-tl\">sḏm</i> listen!","<i class=\"eg-tl\">m sḏm</i> do not listen!"],["<i class=\"eg-tl\">ḏd mꜣꜥt</i> speak the truth!","<i class=\"eg-tl\">m ḏd grg</i> do not tell lies!"],["<i class=\"eg-tl\">jr mꜣꜥt</i> do what is right!","<i class=\"eg-tl\">m jr ḏwt</i> do not do evil!"],["<i class=\"eg-tl\">jmj</i> give!","<i class=\"eg-tl\">m rdj</i> do not give!"]],"cap":"","m":[[0,1,"What is the negative of the command {a}?",0,"a command with its negative"],[1,0,"What is the positive of the command {a}?",0,0,2]]},
    {"k":"me2.circumstantial#3","h":["Main clause","Circumstantial clause","Translation"],"r":[["<i class=\"eg-tl\">gm.n=j sw</i>","<i class=\"eg-tl\">sḏr.w</i>","I found him lying down"],["<i class=\"eg-tl\">gm.n=f zꜣt=f</i>","<i class=\"eg-tl\">ꜥḥꜥ.tj</i>","he found his daughter standing"],["<i class=\"eg-tl\">jj.n=j</i>","<i class=\"eg-tl\">ꜥnḫ.kj</i>","I came back alive"],["<i class=\"eg-tl\">ḏd.n=f n=j</i>","<i class=\"eg-tl\">jw=j m pr</i>","he spoke to me while I was in the house"],["<i class=\"eg-tl\">rdj.n=f n=j t</i>","<i class=\"eg-tl\">jw=j ḥqr.kj</i>","he gave me bread when I was hungry"],["<i class=\"eg-tl\">sḏm.n=j ḫrw=f</i>","<i class=\"eg-tl\">jw=f ḥr mdt</i>","I heard his voice as he was speaking"]],"cap":"","m":[[2,1,"The sentence \"{a}\" has a main clause and a circumstantial clause. Which is the circumstantial clause?",0]]},
    {"k":"me2.conditionals#4","h":["Condition","Meaning"],"r":[["<i class=\"eg-tl\">jr sḏm=k mdt=j</i>","if you listen to my words"],["<i class=\"eg-tl\">jr jr=k mꜣꜥt</i>","if you do what is right"],["<i class=\"eg-tl\">jr gm=k z</i>","if you find a man (meet someone)"],["<i class=\"eg-tl\">jr sḏm.n=k</i>","if you have heard"],["<i class=\"eg-tl\">jr jj.n=f</i>","if he has come"],["<i class=\"eg-tl\">jr tm=k sḏm</i>","if you do not listen"],["<i class=\"eg-tl\">jr z pn</i>","as for this man"]],"cap":"","m":[[0,1,"What does {a} mean?",0,"an Egyptian form with its meaning"],[1,0,"Which Egyptian means \"{a}\"?",0,0,2]]},
    {"k":"me2.purpose#4","h":["Egyptian","How","Meaning"],"r":[["<i class=\"eg-tl\">jj.n=j r mꜣꜣ nfrw=k</i>","<i class=\"eg-tl\">r</i> + infinitive","I have come to see your beauty"],["<i class=\"eg-tl\">jj.n=f r ḏd n=j</i>","<i class=\"eg-tl\">r</i> + infinitive","he came to tell me"],["<i class=\"eg-tl\">šm.n=f r gmt zꜣ=f</i>","<i class=\"eg-tl\">r</i> + infinitive","he went to find his son"],["<i class=\"eg-tl\">jj.n=j r rdjt n=k t</i>","<i class=\"eg-tl\">r</i> + infinitive","I have come to give you bread"],["<i class=\"eg-tl\">rdj.n=f n=j t ꜥnḫ=j</i>","sḏm=f after a verb","he gave me bread so that I might live"],["<i class=\"eg-tl\">r tm sḏm</i>","<i class=\"eg-tl\">r</i> + <i class=\"eg-tl\">tm</i>","so as not to hear"]],"cap":"","m":[[0,2,"What does {a} mean?",0,"an Egyptian sentence with its meaning"],[0,1,"How is the purpose shown in {a}?",0,0,2]]},
    {"k":"me2.pseudoverbal#4","h":["Construction","Example","Meaning"],"r":[["subject + <i class=\"eg-tl\">ḥr</i> + infinitive","<i class=\"eg-tl\">jw=s ḥr ḏd mꜣꜥt</i>","she is speaking the truth"],["subject + <i class=\"eg-tl\">ḥr</i> + infinitive","<i class=\"eg-tl\">jw=j ḥr rdjt t</i>","I am giving bread"],["subject + <i class=\"eg-tl\">r</i> + infinitive","<i class=\"eg-tl\">jw=sn r ḏd mdt</i>","they will say the words"],["subject + <i class=\"eg-tl\">m</i> + infinitive","<i class=\"eg-tl\">jw nsw m jjt</i>","the king is coming"],["after <i class=\"eg-tl\">mk</i>","<i class=\"eg-tl\">mk wj ḥr sḏm</i>","look, I am listening"]],"cap":"","m":[[1,2,"What does {a} mean?",0,"an example with its meaning"],[1,0,"Which construction does {a} use?",0,0,2]]},
    {"k":"me2.virtual-relative#3","h":["Egyptian","Literally","Translation"],"r":[["<i class=\"eg-tl\">z ḏd=f mꜣꜥt</i>","a man, he speaks the truth","a man who speaks the truth"],["<i class=\"eg-tl\">zꜣ mr=f jt=f</i>","a son, he loves his father","a son who loves his father"],["<i class=\"eg-tl\">njwt n rḫ=j rn=s</i>","a town, I do not know its name","a town whose name I do not know"],["<i class=\"eg-tl\">rmṯ nn ḥqꜣ=sn</i>","people, there is no ruler of theirs","people who have no ruler"],["<i class=\"eg-tl\">z ꜥnḫ.w</i>","a man, being alive","a living man"]],"cap":"","m":[[0,2,"How would you translate {a}?",0,"an Egyptian form with its meaning"],[2,0,"Which Egyptian means \"{a}\"?",0,0,2]]},
    {"k":"me2.imperative#3","h":["Verb","Command","Meaning"],"r":[["<i class=\"eg-tl\">sḏm</i> \"hear\"","<i class=\"eg-tl\">sḏm</i>","hear! listen!"],["<i class=\"eg-tl\">ḏd</i> \"say\"","<i class=\"eg-tl\">ḏd</i>","say! speak!"],["<i class=\"eg-tl\">jrj</i> \"do\"","<i class=\"eg-tl\">jr</i>","do! make!"],["<i class=\"eg-tl\">rdj</i> \"give\"","<i class=\"eg-tl\">jmj</i>","give!"],["<i class=\"eg-tl\">jj</i> \"come\"","<i class=\"eg-tl\">mj</i>","come!"],["<i class=\"eg-tl\">jnj</i> \"bring\"","<i class=\"eg-tl\">jn</i>","bring!"]],"cap":"","m":[[0,1,"What is the command form of {a}?",0,"a verb with its command"],[1,2,"What does the command {a} mean?",0]]},
    {"k":"me2.questions#3","h":["Question","Meaning","Answer pattern"],"r":[["<i class=\"eg-tl\">jn jw=k m pr</i>","are you in the house?","<i class=\"eg-tl\">jw=j m pr</i> I am in the house"],["<i class=\"eg-tl\">jn sḏm.n=k</i>","have you heard?","<i class=\"eg-tl\">sḏm.n=j</i> I have heard"],["<i class=\"eg-tl\">jn rḫ.n=k rn=f</i>","do you know his name?","<i class=\"eg-tl\">rḫ.n=j rn=f</i> I know his name"],["<i class=\"eg-tl\">zj pw</i>","who is it?","<i class=\"eg-tl\">zꜣ=k pw</i> it is your son"],["<i class=\"eg-tl\">jḫ pw</i>","what is it?","<i class=\"eg-tl\">t pw</i> it is bread"],["<i class=\"eg-tl\">jw=k tnj</i>","where are you?","<i class=\"eg-tl\">jw=j m njwt</i> I am in the town"]],"cap":"","m":[[0,1,"What does {a} mean?",0,"a question with its meaning"],[0,2,"How would you answer {a}?",0,0,2]]},
    {"k":"me2.jn-focus#4","h":["Egyptian","Translation"],"r":[["<i class=\"eg-tl\">jn nsw rdj ḥtp</i>","it is the king who gives an offering"],["<i class=\"eg-tl\">jn nṯr sḏm ḫrw=j</i>","it is the god who hears my voice"],["<i class=\"eg-tl\">jn zꜣ=f ḏd mdt</i>","it is his son who says the words"],["<i class=\"eg-tl\">jn ḥm=f rdj jj=j</i>","it was His Majesty who caused me to come"],["<i class=\"eg-tl\">jn nsw rdj=f n=k t</i>","it is the king who will give you bread"],["<i class=\"eg-tl\">ntf sḏm</i>","it is he who hears"]],"cap":"","m":[[0,1,"How would you translate {a}?",0,"an Egyptian form with its meaning"],[1,0,"Which Egyptian means \"{a}\"?",0,0,2]]},
    {"k":"me2.rosetta-hiero#6","h":["Egyptian","Translation","Notes"],"r":[["<i class=\"eg-tl\">ptwlmys</i>","Ptolemy","a Greek name spelled with sound signs (Reading Royal Names)"],["<i class=\"eg-tl\">ꜥnḫ ḏt</i>","living forever","<i class=\"eg-tl\">ḏt</i> \"eternity\""],["<i class=\"eg-tl\">mrj ptḥ</i>","beloved of Ptah","a passive participle; Ptah's name is written first out of honor"],["<i class=\"eg-tl\">sẖ n mdw-nṯr</i>","the writing of the god's words","the Egyptian name for hieroglyphs"],["<i class=\"eg-tl\">sẖ n šꜥt</i>","the writing of documents","Demotic"],["<i class=\"eg-tl\">sẖ n ḥꜣw-nbw</i>","the writing of the Greeks","Greek"]],"cap":"Short extracts, transliterated in the usual Middle Egyptian way.","m":[[0,1,"In the hieroglyphic text of the Rosetta Stone, what does {a} mean?",0,"an Egyptian word with its meaning"]]},
    {"k":"me2.dictionary#4","h":["Form in a text","Strip","Headword"],"r":[["<i class=\"eg-tl\">sḏm.n=f</i>","<i class=\"eg-tl\">.n</i>, <i class=\"eg-tl\">=f</i>","<i class=\"eg-tl\">sḏm</i>"],["<i class=\"eg-tl\">jr.n=f</i>","<i class=\"eg-tl\">.n</i>, <i class=\"eg-tl\">=f</i>; restore <i class=\"eg-tl\">j</i>","<i class=\"eg-tl\">jrj</i>"],["<i class=\"eg-tl\">dj=f</i>","<i class=\"eg-tl\">=f</i>; restore <i class=\"eg-tl\">r</i>","<i class=\"eg-tl\">rdj</i>"],["<i class=\"eg-tl\">nṯrw</i>","plural <i class=\"eg-tl\">-w</i>","<i class=\"eg-tl\">nṯr</i>"],["<i class=\"eg-tl\">nfrt</i>","feminine <i class=\"eg-tl\">-t</i>","<i class=\"eg-tl\">nfr</i>"],["<i class=\"eg-tl\">jj.kj</i>","stative ending","<i class=\"eg-tl\">jj</i>"]],"cap":"","m":[[0,2,"Under which headword would you look up {a} in a dictionary?",0,"a form with its headword"],[0,1,"To look up {a}, what do you strip off?",0,0,2]]},
    {"k":"me2.sdmf-weak@sdmnf-form#4","h":["Verb","sḏm.n=f","Meaning"],"r":[["<i class=\"eg-tl\">sḏm</i> \"hear\"","<i class=\"eg-tl\">sḏm.n=f</i>","he heard"],["<i class=\"eg-tl\">ḏd</i> \"say\"","<i class=\"eg-tl\">ḏd.n=s</i>","she said"],["<i class=\"eg-tl\">jrj</i> \"do\"","<i class=\"eg-tl\">jr.n=j</i>","I did"],["<i class=\"eg-tl\">gmj</i> \"find\"","<i class=\"eg-tl\">gm.n=sn</i>","they found"],["<i class=\"eg-tl\">rdj</i> \"give\"","<i class=\"eg-tl\">rdj.n=f</i>","he gave"],["<i class=\"eg-tl\">jj</i> \"come\"","<i class=\"eg-tl\">jj.n=j</i>","I came"],["<i class=\"eg-tl\">jnj</i> \"bring\"","<i class=\"eg-tl\">jn.n=k</i>","you brought"]],"cap":"","m":[[0,1,"What is the sḏm.n=f of {a}?",0,"a verb with its sḏm.n=f"]]},
    {"k":"me2.neg-n#3","h":["Positive","Meaning"],"r":[["<i class=\"eg-tl\">sḏm=f</i>","he hears; may he hear"],["<i class=\"eg-tl\">n sḏm=f</i>","he did not hear"],["<i class=\"eg-tl\">sḏm.n=f</i>","he heard"],["<i class=\"eg-tl\">n sḏm.n=f</i>","he cannot hear, he does not hear"],["<i class=\"eg-tl\">jr=f</i>","he does"],["<i class=\"eg-tl\">n jr=f</i>","he did not do"],["<i class=\"eg-tl\">gm.n=f</i>","he found"],["<i class=\"eg-tl\">n gm.n=f</i>","he cannot find"]],"cap":"The negated forms are learned as a pair.","m":[[0,1,"What does {a} mean?",0,"a form with its meaning"]]},
    {"k":"me2.neg-nn#3","h":["Egyptian","Meaning","What follows nn"],"r":[["<i class=\"eg-tl\">nn mw</i>","there is no water","a noun"],["<i class=\"eg-tl\">nn wn mw</i>","there is no water","<i class=\"eg-tl\">wn</i> + a noun"],["<i class=\"eg-tl\">nn zꜣ=f</i>","he has no son","a noun with a suffix"],["<i class=\"eg-tl\">nn ḥqꜣ m njwt</i>","there is no ruler in the town","a noun and a phrase"],["<i class=\"eg-tl\">nn sḏm=f</i>","he will not hear","a sḏm=f"],["<i class=\"eg-tl\">nn ḏd=j grg</i>","I will not tell a lie","a sḏm=f with an object"]],"cap":"","m":[[0,1,"What does {a} mean?",0,"a sentence with its meaning"],[0,2,"In {a}, what follows nn?",0,0,2]]},
    {"k":"me2.neg-tm#3","h":["Where","Example","Meaning"],"r":[["after <i class=\"eg-tl\">r</i> (purpose)","<i class=\"eg-tl\">r tm sḏm</i>","so as not to hear"],["after <i class=\"eg-tl\">r</i>","<i class=\"eg-tl\">r tm rdjt</i>","so as not to give"],["a participle","<i class=\"eg-tl\">tm sḏm</i>","one who does not hear"],["after <i class=\"eg-tl\">jr</i> \"if\"","<i class=\"eg-tl\">jr tm=k sḏm</i>","if you do not listen"],["after <i class=\"eg-tl\">rdj</i> \"cause\"","<i class=\"eg-tl\">rdj.n=f tm=j sḏm</i>","he caused me not to hear"],["an infinitive","<i class=\"eg-tl\">tm ḏd</i>","not speaking"]],"cap":"","m":[[1,2,"What does {a} mean?",0,"an example with its meaning"],[1,0,"Where is tm used in {a}?",0,0,2]]},
    {"k":"me2.stative-endings#3","h":["Person","Ending","Example","Meaning"],"r":[["I","<i class=\"eg-tl\">.kj</i> (also <i class=\"eg-tl\">.kw</i>, <i class=\"eg-tl\">.kwj</i>)","<i class=\"eg-tl\">jj.kj</i>","I have come"],["you (one person)","<i class=\"eg-tl\">.tj</i>","<i class=\"eg-tl\">jj.tj</i>","you have come"],["he","<i class=\"eg-tl\">.w</i> or none","<i class=\"eg-tl\">jj.w</i>","he has come"],["she","<i class=\"eg-tl\">.tj</i>","<i class=\"eg-tl\">jj.tj</i>","she has come"],["we","<i class=\"eg-tl\">.wjn</i>","<i class=\"eg-tl\">jj.wjn</i>","we have come"],["you (more than one)","<i class=\"eg-tl\">.tjwnj</i>","<i class=\"eg-tl\">jj.tjwnj</i>","you have come"],["they","<i class=\"eg-tl\">.w</i> or none","<i class=\"eg-tl\">jj.w</i>","they have come"]],"cap":"Grammars transliterate the first person differently: Gardiner .kwj, others .kw; this course writes .kj and accepts all three.","m":[[0,1,"Which stative ending goes with the person \"{a}\"?",0,"a person with the stative ending"]]},
    {"k":"me2.inf-uses#4","h":["Use","Example","Translation"],"r":[["after a preposition","<i class=\"eg-tl\">r sḏm mdt</i>","in order to hear the words"],["after a preposition","<i class=\"eg-tl\">ḥr ḏd mꜣꜥt</i>","saying the truth"],["object of a verb","<i class=\"eg-tl\">mr.n=j sḏm mdt=k</i>","I loved to hear your words"],["caption","<i class=\"eg-tl\">rdjt ḥtp n nṯr</i>","Giving an offering to the god"],["title","<i class=\"eg-tl\">rꜣ n prt m hrw</i>","Spell for going out by day"]],"cap":"","m":[[1,2,"What does {a} mean?",0,"an example with its translation"],[1,0,"How is the infinitive used in {a}?",0,0,2]]}];
  var FUNS = {};
  function plain(s) { return String(s).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); }
  function txt(s) { return String(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function low(s) { return txt(s).toLowerCase().replace(/[.;:,]+$/, ''); }
  function big(x) { return String(x).replace(/<span class="(sc-b|eg-cop|eg-h)">/g, '<span class="$1" style="font-size:1.6em;line-height:1">'); }
  function fill(t, x) { x = big(x); return t.replace('{a:l}', String(x).replace(/^[A-Z](?=[a-z])/, function (c) { return c.toLowerCase(); })).replace('{a}', x); }
  function dot(s) { s = String(s); return /[.!?…"”’)]$/.test(txt(s)) ? s : s + '.'; }
  function sameRow(t, i, a) { return t.r.filter(function (r) { return low(r[a]) === low(t.r[i][a]); }); }
  function partnerSteps(t, tp, right, shown) { // what each wrong choice goes with
    var out = [];
    shown.forEach(function (c) {
      if (low(c) === low(right)) return;
      var rows = t.r.filter(function (r) { return low(r[tp[1]]) === low(c); });
      if (rows.length === 1 && txt(rows[0][tp[0]]).length <= 90) out.push(dot(c + ': that goes with ' + rows[0][tp[0]]));
    });
    return out.slice(0, 3);
  }
  // match: ask for column b from a cell of column a
  function match(R, t, tp, L) {
    var a = tp[0], b = tp[1], ok = t.r.map(function (_, i) { return i; }).filter(function (i) { return t.r[i][a] && t.r[i][b] && txt(t.r[i][b]).length <= 130; });
    if (!ok.length) return null;
    var i = R.pick(ok), right = t.r[i][b], seen = {};
    seen[low(right)] = 1;
    var bad = {}; sameRow(t, i, a).forEach(function (r) { bad[low(r[b])] = 1; }); // never a choice that is also right
    var pool = []; t.r.forEach(function (r) { var k = low(r[b]); if (r[b] && !seen[k] && !bad[k] && txt(r[b]).length <= 130) { seen[k] = 1; pool.push(r[b]); } });
    var k = Math.min(L === 1 ? 3 : 4, pool.length + 1); if (k < 3) return null;
    var wrongs = R.shuffle(pool).slice(0, k - 1), choices = [right].concat(wrongs);
    return { q: fill(tp[2], t.r[i][a]), a: { t: 'mc', choices: choices, v: 0 },
      steps: [dot(t.r[i][a] + ' → ' + right), ].concat(partnerSteps(t, tp, right, choices)),
      hint: tp[3] || 'Think back to the lesson’s table' + (t.cap ? ' (' + t.cap.replace(/\.$/, '') + ')' : '') + '.', wh: [t.k, 'm', a, b, i, txt(t.r[i][a])] };
  }
  // pairs: three or four lines "a → b"; one right (level 2) or one wrong (level 3)
  function pairs(R, t, tp, L) {
    var a = tp[0], b = tp[1], ok = t.r.map(function (_, i) { return i; }).filter(function (i) { return t.r[i][a] && t.r[i][b] && txt(t.r[i][a]).length <= 70 && txt(t.r[i][b]).length <= 70; });
    var uniq = {}; ok = ok.filter(function (i) { var k = low(t.r[i][a]); if (uniq[k]) return false; uniq[k] = 1; return true; });
    var n = Math.min(4, ok.length); if (n < 3) return null;
    var rows = R.shuffle(ok).slice(0, n), wrongOne = L >= 3, target = R.int(0, n - 1), lines = [], steps = [];
    for (var j = 0; j < n; j++) {
      var i = rows[j], right = wrongOne ? j !== target : j === target, ans = t.r[i][b];
      if (!right) {
        var good = {}; sameRow(t, i, a).forEach(function (r) { good[low(r[b])] = 1; });
        var ws = []; t.r.forEach(function (r) { if (r[b] && !good[low(r[b])] && txt(r[b]).length <= 70 && ws.map(low).indexOf(low(r[b])) < 0) ws.push(r[b]); });
        if (!ws.length) return null;
        ans = R.pick(ws);
      }
      lines.push(t.r[i][a] + ' → ' + ans);
      steps.push(dot(t.r[i][a] + ' → ' + t.r[i][b] + (right ? ': right' : ', not ' + ans)));
    }
    var what = tp[4] ? ' Each line pairs ' + tp[4] + '.' : '';
    return { q: (wrongOne ? 'Exactly one of these pairings is <b>wrong</b>. Which one?' : 'Exactly one of these pairings is right. Which one?') + what,
      a: { t: 'mc', choices: lines, v: target }, steps: steps, hint: 'Check each line on its own against what you learned.', wh: [t.k, wrongOne ? 'pw' : 'pr', a, b] };
  }
  // sort: which column of a comparison table does a cell belong to
  function sortQ(R, t, L) {
    var cols = t.h.map(function (_, j) { return j; }).filter(function (j) { return j >= (t.na ? 0 : 1) && txt(t.h[j]); });
    if (cols.length < 2) return null;
    var cells = [];
    t.r.forEach(function (r, i) { cols.forEach(function (j) {
      if (!r[j] || (!t.na && !txt(r[0]))) return;
      var dup = cols.some(function (j2) { return j2 !== j && r[j2] && (low(r[j2]) === low(r[j]) || low(r[j2]).indexOf(low(r[j])) >= 0 || low(r[j]).indexOf(low(r[j2])) >= 0); });
      if (!dup && txt(r[j]).length <= 140) cells.push([i, j]);
    }); });
    if (cells.length < 2) return null;
    var heads = cols.map(function (j) { return t.h[j]; });
    if (L >= 3 && cells.length >= 5) {
      var j0 = R.pick(cols), pick = R.shuffle(cells).slice(0, Math.min(5, cells.length));
      var hits = pick.filter(function (c) { return c[1] === j0; }).length;
      if (hits >= 1 && hits < pick.length) {
        var ch = pick.map(function (c) { return lab(t, c); });
        var v = pick.map(function (c, k) { return c[1] === j0 ? k : -1; }).filter(function (k) { return k >= 0; });
        return { q: fill(t.all, t.h[j0]), a: { t: 'mc', choices: ch, v: v },
          steps: pick.map(function (c) { return dot(lab(t, c) + ' (' + t.h[c[1]] + ')'); }),
          hint: 'Go through them one at a time.', wh: [t.k, 'sa', j0, pick] };
      }
    }
    var c = R.pick(cells);
    return { q: t.one + (t.na ? (/^["“]/.test(txt(t.r[c[0]][c[1]])) ? '<br>' + t.r[c[0]][c[1]] : '<br>“' + t.r[c[0]][c[1]] + '”') : '<br>' + asp(t.r[c[0]][0]) + t.r[c[0]][c[1]]), a: { t: 'mc', choices: heads.slice(), v: cols.indexOf(c[1]) },
      steps: t.na ? [dot('That is ' + t.h[c[1]].replace(/^./, function (x) { return x.toLowerCase(); }))] : [dot(txt(t.r[c[0]][0]) + ' for ' + t.h[c[1]] + ': ' + t.r[c[0]][c[1]])].concat(cols.filter(function (j) { return j !== c[1] && t.r[c[0]][j]; }).map(function (j) { return dot('For ' + t.h[j] + ': ' + t.r[c[0]][j]); })),
      hint: 'Think back to the lesson’s comparison' + (t.cap ? ' (' + t.cap.replace(/\.$/, '') + ')' : '') + '.', wh: [t.k, 's', c[0], c[1]] };
  }
  function asp(x) { return '<b>' + x + (/\?$/.test(txt(x)) ? '' : ':') + '</b> '; }
  function lab(t, c) { return t.na ? t.r[c[0]][c[1]] : asp(t.r[c[0]][0]) + t.r[c[0]][c[1]]; }
  // extra bank items: { q, a, w: [wrong answers, more than are shown], s: [steps], h: hint, lv } or { q, tf: true|false, s, lv }
  function extra(R, t, L) {
    var its = t.x.filter(function (it) { return (it.lv || 1) <= L; }); if (!its.length) return null;
    var it = R.pick(its), p;
    if (it.f) { it = FUNS[it.f](R, L); if (!it) return null; }
    if (it.num !== undefined) {
      p = { q: it.q, a: { t: 'num', v: String(it.num) }, steps: it.s.slice() };
      if (Number.isInteger(it.num) && !it.unit && !it.pct) p.a.form = 'int';
      if (it.pct) p.a.pct = true;
      if (it.tol != null) p.a.tol = it.tol;
      if (it.unit) p.unit = it.unit;
    }
    else if (it.tf !== undefined) p = { q: it.q, a: { t: 'tf', v: it.tf }, steps: it.s.slice() };
    else {
      var k = Math.min(L === 1 ? 3 : 4, it.w.length + 1);
      p = { q: it.q, a: { t: 'mc', choices: [it.a].concat(R.shuffle(it.w).slice(0, k - 1)), v: 0 }, steps: it.s.slice() };
    }
    p.hint = it.h || 'Think back to the lesson.';
    p.wh = [t.k, 'x', its.indexOf(it) >= 0 ? t.x.indexOf(it) : -1];
    return FUNS.__wrap ? FUNS.__wrap(p, L) : p;
  }
  function make(R, list, L) {
    for (var tries = 0; tries < 8; tries++) {
      var t = R.pick(list), p = null;
      if (t.x) p = extra(R, t, L);
      else if (t.one) p = sortQ(R, t, L);
      else {
        var tps = t.m.filter(function (tp) { return (tp[5] || 1) <= L; }); if (!tps.length) continue;
        var tp = R.pick(tps);
        p = L >= 2 && tp[4] && R.chance(0.35) ? pairs(R, t, tp, L) : match(R, t, tp, L);
      }
      if (p) {
        // ladder pages show choices as plain text (only $…$ math is rendered), so choices carry no tags
        if (p.a.t === 'mc') { p.a.choices = p.a.choices.map(plain); var seen = {}; if (p.a.choices.some(function (c) { var k = seen[c]; seen[c] = 1; return k; })) continue; }
        p.nowiden = true; return p;
      }
    }
    return null;
  }
  var BY = {}; TABS.forEach(function (t) { var id = t.k.split('#')[0].split('@')[0]; (BY[id] = BY[id] || []).push(t); });
  var VAR = {};
  function baseCount(id, base, L) { // different questions (ignoring the order of choices) from 40 fixed seeds
    var key = id + '|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 24; s++) {
        try { var p = base(ML.rand(id + '#whv#' + s + '#' + L), { level: L, mode: 'learn' }), a = p.a || {};
          var k = p.q + '|' + JSON.stringify(a.choices ? a.choices.slice().sort() : a.v) + '|' + JSON.stringify(p.viz || null);
          if (!seen[k]) { seen[k] = 1; n++; } } catch (e) { }
      }
      VAR[key] = n;
    }
    return VAR[key];
  }
  function extCount(id, L) { // different table questions from 40 fixed seeds
    var key = id + '|x|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 24; s++) {
        var p = make(ML.rand(id + '#whx#' + s + '#' + L), BY[id], L); if (!p) continue;
        var k = p.q + '|' + JSON.stringify(p.a.choices ? p.a.choices.slice().sort() : p.a.v);
        if (!seen[k]) { seen[k] = 1; n++; }
      }
      VAR[key] = n;
    }
    return VAR[key];
  }
  Object.keys(BY).forEach(function (id) {
    var base = ML.getGen(id); if (!base || base._wh) return;
    var fn = function (R, ctx) {
      var L = (ctx && ctx.level) || 1, n = baseCount(id, base, L), x = extCount(id, L), share = Math.max(0.15, Math.min(0.5, x / (x + n + 1)));
      if (R.chance(share)) { var p = make(R, BY[id], L); if (p) return p; }
      return base(R, ctx);
    };
    fn._wh = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : undefined);
/* ---- end widen_hum ---- */

/* ---- widen: more forms of the same questions (so practice repeats less) ----------------------------------------
   Every topic of this course keeps its own problems, and some draws are turned into other forms of the same skill,
   built only from the topic's own problems (so their answers stay the ones the topic already checks):
     check   "Ava chose X. Is Ava right?" (Yes or No) from a one-answer multiple-choice problem
     pairs   two or three lines "question → answer"; which line is right (or, at level 3, which one is wrong)
     tfpick  "Which sentence is true?" (or false) from three of the topic's true-or-false sentences
   Questions whose answer depends on the other choices (first, best, most, not …) show the choices in the check form
   and never go into pairs. Mix per level: CFG.mix[level] = [check, pairs, tfpick] shares; the rest stays as it was. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var CFG = {"prefix":"me2.","only":["roots","causatives","weak-verbs","inf-forms","inf-uses","inf-subject","sdmf-form","sdmf-meaning","sdmf-weak","rdj-sdmf","sdmnf-form","sdmnf-meaning","jw-sdmnf","stative-endings","stative-meaning","stative-use","stative-vs-sdmnf","active-participles","passive-participles","participle-agreement","relative-forms","ntj","tw-passive","other-passives","neg-nn","sdmtf","neg-tm","neg-imperative","circumstantial","conditionals","purpose","pseudoverbal","virtual-relative","emphatic","imperative","questions","jn-focus","stela","stela-family","autobiography","sinuhe-opening","sinuhe-flight","peasant","rosetta-hiero","translating","dictionary"]};
  var NAMES = ['Ava', 'Ben', 'Cora', 'Dev', 'Eli', 'Finn', 'Gus', 'Hana', 'Ivy', 'Jude', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Pia',
    'Quinn', 'Rosa', 'Sam', 'Tess', 'Uma', 'Vic', 'Wren', 'Zoe', 'Ada', 'Leo', 'Mia', 'Theo', 'June', 'Max'];
  var REL = /\b(first|last|earliest|latest|earlier|later|before|after|older|oldest|newer|newest|most|least|largest|smallest|biggest|best|better|worse|worst|closest|nearest|farthest|longest|shortest|highest|lowest|odd|not|except|different|same|these|this|those|following|below|above|shown|picture|pictures|map|table|chart|graph|diagram|passage|scene|story|look|read|here|example|examples|likely|probably|mainly|main|usually|typically|other|another|which one|each|order|then|next)\b|n['’]t\b/i;
  // pairs judge each line on its own, so only questions whose answer depends on the other choices are left out
  var RELP = /\b(first|last|earliest|latest|oldest|newest|most|least|largest|smallest|biggest|best|better|worse|worst|closest|nearest|farthest|longest|shortest|highest|lowest|odd|not|except|different|same|these|this|those|following|below|above|shown|picture|pictures|map|table|chart|graph|diagram|passage|scene|story|which one|other|another|rank|order|more|less|fewer)\b|n['’]t\b|\w+est\b/i;
  var REF = /\b(this|these|those|shown|picture|map|table|chart|graph|diagram|passage|scene|story|above|below|here|following)\b/i;
  var BADCH = /\b(all|none|both|neither) of\b|\b(above|below)\b|^(both|neither|all|none)\b|\bchoice\b|\boption\b/i;
  function strip(s) { return String(s).replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function plainish(s) { return !/<(?!\/?(b|i|em|strong)\b)[^>]*>/.test(String(s).replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, '').replace(/<span class="[\w-]*big">([\s\S]*)<\/span>/, '$1')); }
  function add(q, html) { // inside a read-aloud big span when there is one
    var m = /<span class="[\w-]*big">/.exec(q);
    if (m) { var k = q.lastIndexOf('</span>'); if (k > m.index) return q.slice(0, k) + '<br>' + html.replace(/<\/p>\s*<p[^>]*>/g, '<br>').replace(/<\/?p[^>]*>/g, '') + q.slice(k); }
    return q + html;
  }
  function single(p) {
    return p && p.a && p.a.t === 'mc' && !Array.isArray(p.a.v) && Array.isArray(p.a.choices) && p.a.choices.length >= 2 &&
      !p.a.choices.some(function (c) { return BADCH.test(strip(c)); });
  }
  function hash(t) { var h = 7; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; }
  function nameFor(q, key) { // the same claim always gets the same name, so a name alone never makes a "new" problem
    var t = strip(q), ok = NAMES.filter(function (n) { return t.indexOf(n) < 0 && String(key).indexOf(n) < 0; });
    return (ok.length ? ok : NAMES)[hash(t + '|' + key) % (ok.length || NAMES.length)];
  }
  function dot(s) { s = String(s); return /[.!?…"”')\]]\s*(<\/b>)?$/.test(strip(s)) || /\$$/.test(s) ? s : s + '.'; }
  function optList(ch) { return '<p class="wd-opts">The choices were:<br>' + ch.map(function (c) { return '• ' + c; }).join('<br>') + '</p>'; }
  function copyP(p, q, a, steps) { var o = {}; for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) o[k] = p[k]; o.q = q; o.a = a; o.steps = steps; delete o.choices; return o; }

  // check: show one choice (the right one half the time) and ask whether it is right
  function check(p, R) {
    var ch = p.a.choices, v = p.a.v, idx = ch.map(function (_, i) { return i; }), others = idx.filter(function (i) { return i !== v; });
    var i = R.chance(0.5) ? v : R.pick(others), ok = i === v, nm = nameFor(p.q, ch[i]), letters = ch.every(function (c) { return /^[A-Z]$/.test(String(c)); });
    var stem = strip(p.q), html = '';
    if (!letters && (REL.test(stem) || ch.length > 4 || CFG.listAll)) {
      var shown = p.a.keep ? ch.slice() : R.shuffle(ch);
      html += optList(shown);
    }
    html += '<p class="wd-check">' + nm + ' chose: <b>' + ch[i] + '</b>' + (/[.!?…"”]$/.test(strip(ch[i])) ? '' : '.') + ' Is ' + nm + ' right?</p>';
    var first = ok ? 'Yes. ' + dot(ch[v]) + ' is the right answer.' : 'No. The right answer is: ' + dot(ch[v]);
    if (ok) first = 'Yes, that is the right answer.';
    return copyP(p, add(p.q, html), { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true }, [first].concat(p.steps || []));
  }
  // check for "choose all": the whole list is shown, and one learner's picks; right only if exactly the right ones
  function checkAll(p, R) {
    var ch = p.a.choices, v = p.a.v.slice().sort(), n = ch.length, pick;
    if (R.chance(0.45)) pick = v.slice();
    else {
      var t = 0; do { var j = R.int(0, n - 1), s = v.slice(), k = s.indexOf(j); if (k >= 0) s.splice(k, 1); else s.push(j); if (R.chance(0.3)) { var j2 = R.int(0, n - 1), k2 = s.indexOf(j2); if (k2 >= 0) s.splice(k2, 1); else s.push(j2); } pick = s.sort(); t++; }
      while (t < 20 && (!pick.length || pick.join() === v.join()));
      if (!pick.length || pick.join() === v.join()) return null;
    }
    var ok = pick.join() === v.join(), nm = nameFor(p.q, pick.join());
    var html = optList(ch) + '<p class="wd-check">' + nm + ' chose ' +
      (pick.length === 1 ? 'only: <b>' + ch[pick[0]] + '</b>' : 'these: <b>' + pick.map(function (i) { return ch[i]; }).join('</b>; <b>') + '</b>') + '. Is ' + nm + ' right?</p>';
    var first = ok ? 'Yes, those are exactly the right ones.' : 'No. The right ones are: ' + v.map(function (i) { return ch[i]; }).join('; ');
    return copyP(p, add(p.q.replace(/\s*(Choose|Select|Pick) (all|every)[^.?!<]*[.?!]?/i, ''), html), { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true }, [dot(first)].concat(p.steps || []));
  }

  // items for pairs: one-answer questions that stand on their own (no picture, no passage, no "first/best/…")
  function pairItem(p) {
    if (!single(p) || p.viz) return null;
    var max = CFG.maxStem || 120, maxA = CFG.maxAns || 70, a = strip(p.a.choices[p.a.v]), stem, group = '';
    // "prompt<br><b>thing</b>" or "prompt<blockquote>thing</blockquote>": a line is "thing → answer", lines share the prompt
    var q0 = p.q.replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, '').replace(/<span class="[\w-]*big">([\s\S]*)<\/span>/, '$1').trim();
    var m = /^([^<]{6,140}?)\s*(?:<br>\s*<b>([^<]{3,140})<\/b>|<blockquote>([^<]{3,140})<\/blockquote>)\s*$/.exec(q0);
    if (m) { group = m[1].trim(); stem = (m[2] || m[3]).trim(); if (RELP.test(group.replace(/\b(this|these)\b/gi, ''))) return null; }
    else {
      if (!plainish(p.q)) return null;
      stem = strip(p.q); if (RELP.test(stem)) return null;
    }
    if (stem.length > max || stem.length < 3 || a.length > maxA || /^[A-Z]$/.test(a) || /\$/.test(stem + a + group)) return null;
    var w = p.a.choices.filter(function (_, i) { return i !== p.a.v; }).map(strip).filter(function (x) { return x.length <= maxA && x !== a; });
    if (!w.length) return null;
    return { stem: stem.replace(/\s*(Choose one|Pick one)\.?$/i, ''), a: a, w: w, why: (p.steps || [])[0] || '', group: group };
  }
  function tfItem(p) {
    if (!p || !p.a || p.a.t !== 'tf' || p.viz || !plainish(p.q)) return null;
    var s = strip(p.q).replace(/^(True or false\?|True or false:)\s*/i, '').replace(/\s*(True or false\?|Is this true or false\?|Is it true or false\?)$/i, '').trim();
    if (s.length < 8 || s.length > (CFG.maxStem || 120) + 20 || REF.test(s) || /\?$/.test(s) || /\$/.test(s)) return null;
    return { s: s, v: p.a.v, why: (p.steps || [])[0] || '' };
  }
  function harvest(base, R, ctx, make, n, distinct) {
    var out = [], keys = {};
    for (var t = 0; t < 24 && out.length < n; t++) {
      // at level 3, lines may come from level 2 questions too: three lines with one wrong is the harder form
      var c2 = ctx && ctx.level >= 3 && (t % 2) ? Object.assign({}, ctx, { level: 2 }) : ctx;
      var p; try { p = base(ML.rand(R.int(1, 2e9)), c2); } catch (e) { continue; }
      var it = make(p); if (!it) continue;
      if (out.length && it.group !== undefined && it.group !== out[0].group) continue;
      var k = distinct(it); if (k.some(function (x) { return keys[x]; })) continue;
      k.forEach(function (x) { keys[x] = 1; }); out.push(it);
    }
    return out;
  }
  function pairs(base, R, ctx, n, wrongOne) {
    var its = harvest(base, R, ctx, pairItem, n, function (it) { return it.group ? ['s:' + it.stem] : ['s:' + it.stem, 'a:' + it.a]; });
    if (its.length < n) return null;
    var answers = its.map(function (it) { return it.a; }), used = {};
    var target = R.int(0, n - 1), lines = [], steps = [];
    for (var i = 0; i < n; i++) {
      var it = its[i], right = wrongOne ? i !== target : i === target, ans = it.a;
      if (!right) {
        var ws = it.w.filter(function (x) { return (its[0].group || answers.indexOf(x) < 0) && !used[x]; });
        if (!ws.length) return null;
        ans = R.pick(ws); if (!its[0].group) used[ans] = 1;
      }
      lines.push(it.stem + ' → ' + ans); // plain text: ladder pages show choices as text
      steps.push(it.group ? dot(it.stem) + ' Answer: ' + it.a + (right ? '.' : ', not ' + ans + '.') : it.stem + ' The answer is ' + it.a + (right ? '.' : ', not ' + ans + '.'));
    }
    var g = its[0].group, q = g ? '<p class="wd-group">The question for every line: <i>' + g + '</i></p>' + (wrongOne ? 'One line has the <b>wrong</b> answer. Which line is it?' : n === 2 ? 'Which line has the <b>right</b> answer?' : 'Only one line has the right answer. Which line is it?') : wrongOne ? 'Each line is a question and an answer. One answer is <b>wrong</b>. Which line is it?'
      : (n === 2 ? 'Each line is a question and an answer. Which line has the <b>right</b> answer?' : 'Each line is a question and an answer. Only one answer is right. Which line is it?');
    if (its[target].why) steps.push(its[target].why);
    return { q: q, a: { t: 'mc', choices: lines, v: target }, steps: steps, hint: 'Check each line on its own. Does the answer fit the question?' };
  }
  function tfpick(base, R, ctx, wantFalse) {
    var its = harvest(base, R, ctx, tfItem, 6, function (it) { return ['s:' + it.s]; });
    var T = its.filter(function (x) { return x.v; }), F = its.filter(function (x) { return !x.v; });
    var odd = wantFalse ? F : T, rest = wantFalse ? T : F;
    if (!odd.length || rest.length < 2) return null;
    var pick = [odd[0], rest[0], rest[1]], order = R.shuffle([0, 1, 2]), choices = order.map(function (i) { return pick[i].s; });
    var steps = pick.map(function (x) { return x.s + ' ' + (x.v ? 'True.' : 'False.'); });
    if (odd[0].why) steps.push(odd[0].why);
    return { q: wantFalse ? 'Which sentence is <b>false</b>?' : 'Which sentence is <b>true</b>?', a: { t: 'mc', choices: choices, v: order.indexOf(0) }, steps: steps,
      hint: 'Decide about each sentence on its own.' };
  }
  var MIX = CFG.mix || { 1: [0.38, 0.25, 0.04], 2: [0.27, 0.3, 0.1], 3: [0.17, 0.4, 0.15] };
  function wrap(id, base) {
    var fn = function (R, ctx) {
      var lv = ctx && ctx.level || 1, p = base(R, ctx), m = MIX[lv] || MIX[3], r = R.next();
      if (p.nowiden || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf') || (CFG.skip && CFG.skip.indexOf(id) >= 0)) return p; // typed answers stay as they are
      var form = r < m[0] ? 0 : r < m[0] + m[1] ? 1 : r < m[0] + m[1] + m[2] ? 2 : -1;
      if (form < 0) return p;
      var tries = [form, (form + 1) % 3, (form + 2) % 3].filter(function (f) { return m[f] > 0; });
      for (var t = 0; t < tries.length; t++) {
        var f = tries[t], alt = null;
        if (f === 0) alt = single(p) ? check(p, R) : (p.a && p.a.t === 'mc' && Array.isArray(p.a.v) && !p.viz ? checkAll(p, R) : null);
        else if (f === 1) alt = pairs(base, R, ctx, lv === 1 ? 2 : 3, lv >= 3 && R.chance(0.6));
        else alt = tfpick(base, R, ctx, R.chance(0.4));
        if (alt) return alt;
      }
      return p;
    };
    fn.widened = true;
    return fn;
  }
  ML.genIds().forEach(function (id) {
    if (id.indexOf(CFG.prefix) !== 0 || (CFG.only && CFG.only.indexOf(id.slice(CFG.prefix.length)) < 0)) return;
    var g = ML.getGen(id); if (g && !g.widened) ML.gen(id, wrap(id, g));
  });
})(typeof window !== 'undefined' ? window.MathLadder : undefined);
/* ---- end widen ---- */
