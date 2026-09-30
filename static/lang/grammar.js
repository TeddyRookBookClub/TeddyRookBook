/* Grammar decoders for Koine Greek (Robinson/MACULA codes) and Latin (PROIEL codes).
   Each decoder returns { pos, parts:[{k,v,tip}], summary, notes:[...] } for the word panel. */
(function (W) {
  'use strict';

  // ---------- shared explanations ----------
  var CASE_TIP = {
    nominative: 'The subject case: who or what does the action (or is described).',
    genitive: 'The "of" case: possession, source, or description ("of the kingdom").',
    dative: 'The "to / for / with / by" case: indirect object, means, or location.',
    accusative: 'The direct-object case: what receives the action; also motion toward.',
    vocative: 'The case of direct address ("O Lord!").',
    ablative: 'Latin\'s "by / with / from" case: means, manner, separation, time when.',
    locative: 'The "place where" case (rare, used with names of towns).'
  };
  var NUM = { S: 'singular', P: 'plural', D: 'dual' };
  var GEN = { M: 'masculine', F: 'feminine', N: 'neuter' };
  var CASE = { N: 'nominative', G: 'genitive', D: 'dative', A: 'accusative', V: 'vocative' };
  var PERS = { '1': '1st person', '2': '2nd person', '3': '3rd person' };

  // ---------- GREEK ----------
  var G_TENSE = {
    P: ['present', 'Ongoing or repeated action ("is loving, keeps loving").'],
    I: ['imperfect', 'Ongoing action in the past ("was teaching").'],
    F: ['future', 'Action that will happen ("will see").'],
    A: ['aorist', 'Action viewed as a simple whole; usually a simple past in the indicative ("saw").'],
    R: ['perfect', 'A completed action with results that still stand ("it is written").'],
    L: ['pluperfect', 'A completed past action whose results stood at a past time ("had come").']
  };
  var G_VOICE = {
    A: ['active', 'The subject does the action.'],
    M: ['middle', 'The subject acts on or for itself.'],
    P: ['passive', 'The subject receives the action.'],
    E: ['middle or passive', 'Form shared by middle and passive; context decides.'],
    D: ['middle (deponent)', 'Middle in form, active in meaning.'],
    O: ['passive (deponent)', 'Passive in form, active in meaning.'],
    N: ['middle/passive (deponent)', 'Middle/passive in form, active in meaning.'],
    Q: ['impersonal active', 'Used impersonally ("it is necessary").'],
    X: ['(no voice)', '']
  };
  var G_MOOD = {
    I: ['indicative', 'States a fact or asks a question.'],
    S: ['subjunctive', 'Possibility, purpose, or exhortation ("that he might", "let us").'],
    O: ['optative', 'A wish or remote possibility ("may it be").'],
    M: ['imperative', 'A command ("Follow me!").'],
    N: ['infinitive', 'A verbal noun: "to ___".'],
    P: ['participle', 'A verbal adjective: "___-ing / having ___ed"; agrees with a noun in case, number, gender.'],
    R: ['imperatival participle', 'A participle used as a command.']
  };
  var G_POS = {
    N: 'noun', A: 'adjective', T: 'article', V: 'verb', P: 'personal pronoun', R: 'relative pronoun',
    C: 'reciprocal pronoun', D: 'demonstrative pronoun', K: 'correlative pronoun', I: 'interrogative pronoun',
    X: 'indefinite pronoun', Q: 'correlative/interrogative pronoun', F: 'reflexive pronoun', S: 'possessive pronoun',
    ADV: 'adverb', CONJ: 'conjunction', COND: 'conditional conjunction', PRT: 'particle', PREP: 'preposition',
    INJ: 'interjection', ARAM: 'Aramaic word', HEB: 'Hebrew word', 'N-PRI': 'proper noun (indeclinable)',
    'A-NUI': 'number (indeclinable)', 'N-LI': 'letter', 'N-OI': 'noun (indeclinable)'
  };
  var G_ROLE = {
    s: 'Subject of its clause', o: 'Direct object', o2: 'Second object', io: 'Indirect object',
    v: 'Main verb of its clause', vc: 'Linking verb ("is / become")', p: 'Predicate (what is said about the subject)',
    adv: 'Adverbial: tells how, when, where or why', aux: 'Helper word (article, particle, etc.)'
  };

  function cng(s, parts) { // case-number-gender like NSM
    if (!s) return;
    if (CASE[s[0]]) parts.push({ k: 'Case', v: CASE[s[0]], tip: CASE_TIP[CASE[s[0]]] });
    if (NUM[s[1]]) parts.push({ k: 'Number', v: NUM[s[1]] });
    if (GEN[s[2]]) parts.push({ k: 'Gender', v: GEN[s[2]] });
  }

  function greek(code, role) {
    var r = { pos: '', parts: [], notes: [] };
    if (!code) return r;
    if (G_POS[code]) { r.pos = G_POS[code]; }
    var seg = code.split('-'), head = seg[0];
    if (!r.pos) r.pos = G_POS[head] || head;
    if (head === 'V') {
      var tvm = seg[1] || '';
      var m = tvm.match(/^(2?)([PIFARL])([A-Z])([A-Z])$/);
      if (m) {
        var t = G_TENSE[m[2]], vo = G_VOICE[m[3]], mo = G_MOOD[m[4]];
        if (t) r.parts.push({ k: 'Tense', v: (m[1] ? 'second ' : '') + t[0], tip: t[1] });
        if (vo) r.parts.push({ k: 'Voice', v: vo[0], tip: vo[1] });
        if (mo) r.parts.push({ k: 'Mood', v: mo[0], tip: mo[1] });
        var rest = seg[2] || '';
        if (/^[123]/.test(rest)) {
          r.parts.push({ k: 'Person', v: PERS[rest[0]] });
          if (NUM[rest[1]]) r.parts.push({ k: 'Number', v: NUM[rest[1]] });
        } else cng(rest, r.parts);
        r.summary = [t && t[0], vo && vo[0], mo && mo[0]].filter(Boolean).join(' ') +
          (/^[123]/.test(rest) ? ', ' + PERS[rest[0]] + ' ' + (NUM[rest[1]] || '') : rest ? ', ' + r.parts.slice(3).map(function (p) { return p.v; }).join(' ') : '');
      }
    } else if (/^[NATRCDKIXQ]$/.test(head)) {
      var cs = seg[1] || '';
      if (/^(PRI|LI|OI|NUI)$/.test(cs)) { r.notes.push('Indeclinable: its form never changes.'); }
      else cng(cs, r.parts);
      if (seg[2] === 'C') r.parts.push({ k: 'Degree', v: 'comparative', tip: '"more ___ / ___-er"' });
      if (seg[2] === 'S') r.parts.push({ k: 'Degree', v: 'superlative', tip: '"most ___ / ___-est"' });
      r.summary = r.parts.map(function (p) { return p.v; }).join(' ');
    } else if (head === 'P' || head === 'F' || head === 'S') {
      var x = seg[1] || '';
      if (/^[123]/.test(x)) {
        r.parts.push({ k: 'Person', v: PERS[x[0]] });
        if (head === 'S') { // S-1SNSM : possessor person+number, then case-number-gender
          r.parts.push({ k: 'Possessor', v: NUM[x[1]] });
          cng(x.slice(2), r.parts);
        } else cng(x.slice(1, 2) + x.slice(2, 3) + (x[3] || ''), r.parts);
      } else cng(x, r.parts);
      r.summary = r.parts.map(function (p) { return p.v; }).join(' ');
    }
    if (head === 'T') r.notes.push('The article ("the") matches its noun in case, number and gender. Greek has no word for "a".');
    if (role && G_ROLE[role]) r.parts.push({ k: 'Role', v: G_ROLE[role] });
    return r;
  }

  // ---------- LATIN (PROIEL) ----------
  var L_POS = {
    A: 'adjective', C: 'conjunction', D: 'adverb', F: 'foreign word', G: 'subordinating conjunction', I: 'interjection',
    M: 'number', N: 'noun', P: 'pronoun', R: 'preposition', S: 'article', V: 'verb'
  };
  var L_POS2 = { Nb: 'noun', Ne: 'proper noun', Pp: 'personal pronoun', Pk: 'reflexive pronoun', Ps: 'possessive pronoun',
    Pt: 'possessive reflexive pronoun', Pd: 'demonstrative pronoun', Pr: 'relative pronoun', Pi: 'interrogative pronoun',
    Px: 'indefinite pronoun', Pc: 'reciprocal pronoun', Ma: 'cardinal number', Mo: 'ordinal number', Df: 'adverb', Du: 'interrogative adverb',
    Dq: 'relative adverb', 'C-': 'conjunction', 'G-': 'subordinating conjunction', 'R-': 'preposition', 'V-': 'verb', 'A-': 'adjective', 'I-': 'interjection', 'F-': 'foreign word' };
  var L_TENSE = {
    p: ['present', 'Happening now, or habitually.'], i: ['imperfect', 'Ongoing or repeated in the past ("was saying").'],
    r: ['perfect', 'Completed action: a simple past ("said") or a finished state ("has said").'],
    l: ['pluperfect', 'Completed before another past event ("had said").'], f: ['future', 'Will happen ("will say").'],
    t: ['future perfect', 'Will have been completed ("will have said").'],
    a: ['aorist', 'Action viewed as a simple whole; usually a simple past in the indicative ("saw").'], s: ['resultative', ''], u: ['past', '']
  };
  var L_MOOD = {
    o: ['optative', 'A wish or a remote possibility ("may it be", "he would…").'],
    i: ['indicative', 'States a fact or asks a question.'], s: ['subjunctive', 'Wish, purpose, possibility, or indirect question ("that he may…").'],
    m: ['imperative', 'A command.'], n: ['infinitive', 'A verbal noun: "to ___".'],
    p: ['participle', 'A verbal adjective ("loving / having been loved"); agrees with a noun.'],
    d: ['gerund', 'A verbal noun: "(of) ___-ing".'], g: ['gerundive', 'A verbal adjective of obligation: "to be ___ed".'], u: ['supine', 'Expresses purpose after verbs of motion.']
  };
  var L_VOICE = { a: ['active', 'The subject does the action.'], p: ['passive', 'The subject receives the action (or a deponent verb with active meaning).'],
    m: ['middle', 'The subject acts on or for itself (Greek).'], e: ['middle or passive', 'A form shared by middle and passive; context decides.'],
    d: ['deponent', 'Passive in form, active in meaning.'] };
  var L_CASE = { n: 'nominative', g: 'genitive', d: 'dative', a: 'accusative', v: 'vocative', b: 'ablative', l: 'locative', c: 'genitive/dative', i: 'ablative' };
  var L_NUM = { s: 'singular', p: 'plural', d: 'dual' };
  var L_GEN = { m: 'masculine', f: 'feminine', n: 'neuter', p: 'masculine/feminine', o: 'masculine/neuter', r: 'feminine/neuter', q: 'any gender' };
  var L_DEG = { p: '', c: 'comparative', s: 'superlative' };
  var L_REL = {
    pred: 'Main verb / predicate of its clause', sub: 'Subject', obj: 'Direct object', obl: 'Oblique argument (object of a preposition or case)',
    adv: 'Adverbial: tells how, when, where or why', atr: 'Attribute: describes a nearby noun', apos: 'Apposition: renames a nearby noun',
    aux: 'Helper word (conjunction, particle, auxiliary)', xobj: 'Open complement (completes the verb)', xadv: 'Open adverbial complement',
    comp: 'Complement clause', ag: 'Agent ("by whom")', narg: 'Argument of a noun', part: 'Partitive ("some of")', voc: 'Direct address',
    parpred: 'Parenthetical remark', arg: 'Argument of the verb', nonsub: 'Non-subject argument', per: 'Peripheral (adverbial or oblique)',
    rel: 'Apposition or attribute', expl: 'Placeholder word', xsub: 'External subject', adnom: 'Modifies a noun'
  };
  function latin(pos, m, rel) {
    var r = { pos: L_POS2[pos] || L_POS[pos && pos[0]] || '', parts: [], notes: [] };
    m = m || '----------';
    var p = m[0], n = m[1], t = m[2], md = m[3], v = m[4], g = m[5], c = m[6], d = m[7];
    if (L_TENSE[t]) r.parts.push({ k: 'Tense', v: L_TENSE[t][0], tip: L_TENSE[t][1] });
    if (L_VOICE[v]) r.parts.push({ k: 'Voice', v: L_VOICE[v][0], tip: L_VOICE[v][1] });
    if (L_MOOD[md]) r.parts.push({ k: 'Mood', v: L_MOOD[md][0], tip: L_MOOD[md][1] });
    if (PERS[p]) r.parts.push({ k: 'Person', v: PERS[p] });
    if (L_CASE[c]) r.parts.push({ k: 'Case', v: L_CASE[c], tip: CASE_TIP[L_CASE[c]] });
    if (L_NUM[n]) r.parts.push({ k: 'Number', v: L_NUM[n] });
    if (L_GEN[g]) r.parts.push({ k: 'Gender', v: L_GEN[g] });
    if (L_DEG[d]) r.parts.push({ k: 'Degree', v: L_DEG[d] });
    if (m[9] === 'n') r.notes.push('Does not inflect: its form never changes.');
    r.summary = r.parts.map(function (x) { return x.v; }).join(' ');
    if (rel && L_REL[rel]) r.parts.push({ k: 'Role', v: L_REL[rel] });
    return r;
  }

  // ---------- Perseus AGLDT (Latin and Greek treebanks): 9-character postag ----------
  // pos, person, number, tense, mood, voice, gender, case, degree
  var A_POS = { n: 'noun', v: 'verb', t: 'participle', a: 'adjective', d: 'adverb', l: 'article', g: 'particle', c: 'conjunction',
    r: 'preposition', p: 'pronoun', m: 'number', i: 'interjection', e: 'exclamation', x: 'word' };
  var A_CASE = { n: 'nominative', g: 'genitive', d: 'dative', a: 'accusative', v: 'vocative', b: 'ablative', l: 'locative' };
  var A_GEN = { m: 'masculine', f: 'feminine', n: 'neuter', c: 'masculine/feminine' };
  var A_REL = {
    PRED: 'Main verb / predicate of its clause', SBJ: 'Subject', OBJ: 'Object of the verb', ATR: 'Attribute: describes a nearby noun',
    ADV: 'Adverbial: tells how, when, where or why', ATV: 'Describes the subject or object while the action happens',
    AtvV: 'Describes the subject or object while the action happens', PNOM: 'Predicate nominative: what the subject is or becomes',
    OCOMP: 'Object complement: what the object is made or called', COORD: 'Coordinator: joins equal parts ("and", "or")',
    APOS: 'Apposition: renames a nearby noun', AuxP: 'Preposition', AuxC: 'Subordinating conjunction: introduces a clause',
    AuxY: 'Sentence adverb or connecting particle', AuxZ: 'Emphasizing particle', AuxV: 'Auxiliary verb', AuxX: 'Comma',
    AuxK: 'End punctuation', AuxG: 'Bracket or quotation mark', ExD: 'Part of a construction whose governing word is left out'
  };
  function agldt(tag, rel) {
    tag = tag || '---------';
    var r = { pos: A_POS[tag[0]] || '', parts: [], notes: [] };
    var p = tag[1], n = tag[2], t = tag[3], md = tag[4], v = tag[5], g = tag[6], c = tag[7], d = tag[8];
    if (tag[0] === 'v' && md === 'p') r.pos = 'participle';
    if (L_TENSE[t]) r.parts.push({ k: 'Tense', v: L_TENSE[t][0], tip: L_TENSE[t][1] });
    if (L_VOICE[v]) r.parts.push({ k: 'Voice', v: L_VOICE[v][0], tip: L_VOICE[v][1] });
    if (L_MOOD[md]) r.parts.push({ k: 'Mood', v: L_MOOD[md][0], tip: L_MOOD[md][1] });
    if (PERS[p]) r.parts.push({ k: 'Person', v: PERS[p] });
    if (A_CASE[c]) r.parts.push({ k: 'Case', v: A_CASE[c], tip: CASE_TIP[A_CASE[c]] });
    if (L_NUM[n]) r.parts.push({ k: 'Number', v: L_NUM[n] });
    if (A_GEN[g]) r.parts.push({ k: 'Gender', v: A_GEN[g] });
    if (L_DEG[d]) r.parts.push({ k: 'Degree', v: L_DEG[d] });
    if (tag[0] === 'l') r.notes.push('The article ("the") matches its noun in case, number and gender. In Homer it often works as a pronoun: "he, she, it".');
    r.summary = r.parts.map(function (x) { return x.v; }).join(' ');
    if (rel) {
      var base = rel.replace(/_.*$/, ''), co = /_CO/.test(rel), ap = /_AP/.test(rel);
      if (A_REL[base]) r.parts.push({ k: 'Role', v: A_REL[base] + (co ? ' (one of a coordinated pair or list)' : ap ? ' (in apposition)' : '') });
    }
    return r;
  }
  // One entry point for 7-field tokens: PROIEL (10-character morphology) or AGLDT (9-character postag).
  function tree(pos, morph, rel) {
    if (morph && morph.length === 9) return agldt(morph, rel);
    return latin(pos, morph, rel);
  }
  // Normalize either tag set to a coarse part of speech: 'V', 'N', 'A' or ''.
  function coarse(pos, morph) {
    if (morph && morph.length === 9) return { v: 'V', t: 'V', n: 'N', a: 'A' }[morph[0]] || '';
    return { V: 'V', N: 'N', A: 'A' }[(pos || '')[0]] || '';
  }

  // ---------- word-class hints (declension / conjugation) ----------
  function greekClass(lemma, code) {
    if (!lemma) return '';
    if (/^V/.test(code || '')) {
      if (/μι$/.test(lemma)) return '-μι verb (athematic conjugation)';
      if (/(ομαι|ωμαι)$/.test(lemma)) return 'deponent -ομαι verb';
      if (/(άω|αω)$/.test(lemma)) return 'contract verb in -άω';
      if (/(έω|εω)$/.test(lemma)) return 'contract verb in -έω';
      if (/(όω|οω)$/.test(lemma)) return 'contract verb in -όω';
      return 'thematic -ω verb';
    }
    if (/^N/.test(code || '')) {
      if (/(η|α)$/.test(lemma)) return '1st declension noun';
      if (/(ης|ας)$/.test(lemma) && /-.[SP]M/.test(code)) return '1st declension (masculine) noun';
      if (/(ος|ον)$/.test(lemma)) return '2nd declension noun';
      return '3rd declension noun';
    }
    return '';
  }
  function latinClass(lemma, pos) {
    if (!lemma) return '';
    if (pos === 'V-') {
      if (/^(sum|possum|eo|fero|volo|nolo|malo|fio)$/.test(lemma)) return 'irregular verb';
      if (/(or)$/.test(lemma)) return 'deponent verb';
      if (/eo$/.test(lemma)) return '2nd conjugation verb';
      if (/io$/.test(lemma)) return '3rd -io or 4th conjugation verb';
      return '1st or 3rd conjugation verb';
    }
    if (pos === 'Nb' || pos === 'Ne') {
      if (/a$/.test(lemma)) return '1st declension noun';
      if (/(us|um|er)$/.test(lemma)) return '2nd (or 4th) declension noun';
      if (/es$/.test(lemma)) return '3rd or 5th declension noun';
      return '3rd declension noun';
    }
    return '';
  }

  W.Grammar = { greek: greek, latin: latin, agldt: agldt, tree: tree, coarse: coarse, greekClass: greekClass, latinClass: latinClass };
})(window);
