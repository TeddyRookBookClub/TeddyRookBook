/* Generators for usage, merged from part files by /tmp/merge_parts.js (edit the parts, not this file). */
/* ---- part A ---- */
/* Usage and Mechanics (Writing & Grammar Ladder, course key usage), part A: problem generators for the units Agreement,
   Pronoun Case, Verb Tenses, Voice and Mood, and Modifiers (25 topics). Source: /tmp/work_usage_A/out/gen.js, merged into
   static/writing/gen/usage.js by /tmp/merge_parts.js. Conventions: /tmp/work_writing/overview.md.
   Answers are choices (mc, keep: true for Yes/No and fixed orders), "select all" (mc with several right), and typed words
   (text, strict) only where writing the form is the skill (verb forms, comparatives). Where usage guides differ (singular
   they, collective nouns, who/whom in speech), problems ask what formal writing or a named guide does, never one bare
   "right" side. Every sentence is original. Level 1: one plain case, two or three choices. Level 2: distractors from the
   topic's trouble note. Level 3: the same idea in a harder shape (select all, a passage, a typed form, a meaning question). */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;

  /* ---------------------------------------------------------------- helpers */
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function low(s) { s = String(s); return /^(I\b|I’)/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1); }
  function para(s) { return '<p>' + s + '</p>'; }
  function q() { return Array.prototype.slice.call(arguments).filter(Boolean).join(''); }
  function quote(s) { return '“' + s + '”'; }
  function sent(s) { return para('<b>' + s + '</b>'); }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  // one right answer first, then wrong ones (duplicates of the right one or of each other are dropped)
  function mc(right, wrong) { var w = uniq(wrong).filter(function (x) { return x !== right; }); return { t: 'mc', choices: [right].concat(w), v: 0 }; }
  function keep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function yesno(yes) { return keep(['Yes', 'No'], yes ? 0 : 1); }
  // select all: items [{ text, ok }] (at least one ok)
  function selectAll(items) { var ch = [], v = []; items.forEach(function (it, i) { ch.push(it.text); if (it.ok) v.push(i); }); return { t: 'mc', choices: ch, v: v }; }
  function text(v) { return { t: 'text', v: [v], strict: true }; }
  function fill(frame, word) { return frame.replace('___', word); }
  function blankUp(frame, word) { var s = fill(frame, word); return frame.indexOf('___') === 0 ? cap(s) : s; }
  var ALL = '(Select all that apply.)';

  // verb forms (our own tables, so problems don't depend on the kit; the kit's model agrees, see the tests)
  function s3(v) {
    if (v === 'be') return 'is'; if (v === 'have') return 'has'; if (v === 'do') return 'does'; if (v === 'go') return 'goes';
    if (/(s|x|z|ch|sh|o)$/.test(v)) return v + 'es';
    if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ies';
    return v + 's';
  }
  // present form for a subject: n = 1 (he/she/it/one thing), 2 (plural), 'I', 'you'
  function pres(v, n) {
    if (v === 'be') return n === 'I' ? 'am' : n === 1 ? 'is' : 'are';
    return n === 1 ? s3(v) : v;
  }
  function pastBe(n) { return (n === 1 || n === 'I') ? 'was' : 'were'; }

  /* ================================================================ UNIT 1: AGREEMENT */

  /* ---------------------------------------------------------------- usage.sv-agreement */
  // [singular subject, plural subject, verb, rest]
  var SV = [
    ['The dog', 'The dogs', 'bark', 'at the mail truck'], ['My friend', 'My friends', 'walk', 'to school'], ['The bird', 'The birds', 'sing', 'in the morning'],
    ['The baby', 'The babies', 'cry', 'at night'], ['The bus', 'The buses', 'stop', 'at the corner'], ['The fox', 'The foxes', 'hunt', 'at dusk'],
    ['The bee', 'The bees', 'buzz', 'around the flowers'], ['My brother', 'My brothers', 'wash', 'the dishes'], ['The class', 'The classes', 'meet', 'in Room 12'],
    ['The farmer', 'The farmers', 'grow', 'corn'], ['The coach', 'The coaches', 'watch', 'every game'], ['The clock', 'The clocks', 'tick', 'loudly'],
    ['The river', 'The rivers', 'flow', 'to the sea'], ['The student', 'The students', 'study', 'after dinner'], ['The cook', 'The cooks', 'mix', 'the batter']
  ];
  // irregular plurals (no -s): [singular, plural, verb, rest]
  var SV_IRR = [
    ['The child', 'The children', 'play', 'tag at recess'], ['The mouse', 'The mice', 'hide', 'under the porch'], ['The goose', 'The geese', 'fly', 'south in the fall'],
    ['That person', 'Those people', 'wait', 'for the bus'], ['The man', 'The men', 'fix', 'the fence'], ['The woman', 'The women', 'run', 'every morning'],
    ['The sheep', 'The sheep', 'graze', 'on the hill'], ['My foot', 'My feet', 'hurt', 'after the hike']
  ];
  // be / have / do frames: [singular subject, plural subject, verb, rest]
  var SV_BE = [
    ['The cookie', 'The cookies', 'be', 'on the plate'], ['My shoe', 'My shoes', 'be', 'by the door'], ['The child', 'The children', 'be', 'ready'],
    ['The tomato', 'The tomatoes', 'be', 'ripe'], ['The puppy', 'The puppies', 'have', 'soft ears'], ['The team', 'The teams', 'have', 'new shirts'],
    ['The tooth', 'The teeth', 'be', 'loose'], ['My sister', 'My sisters', 'have', 'a bike']
  ];
  var PRON = [['I', 'I'], ['You', 'you'], ['He', 1], ['She', 1], ['We', 2], ['They', 2]];
  var PRON_FR = [['walk', 'to school'], ['play', 'chess after dinner'], ['be', 'ready for the trip'], ['have', 'a new bike'], ['wash', 'the dishes'],
    ['study', 'in the library'], ['watch', 'the game on Sundays'], ['go', 'to bed at nine'], ['do', 'the dishes on Fridays']];
  function svCase(R, pool, pronOK) {
    if (pronOK && R.chance(0.3)) {
      var p = R.pick(PRON), f = R.pick(PRON_FR), n = p[1] === 'you' ? 2 : p[1];
      return { subj: p[0], n: n, v: f[0], rest: f[1],
        why: p[0] === 'I' ? (f[0] === 'be' ? '<i>I</i> takes <i>am</i>.' : '<i>I</i> takes the plain form, with no -s.') : p[0] === 'You' ? '<i>You</i> takes the plain form, like a plural.' : n === 1 ? '<i>' + p[0] + '</i> is singular (one), so the verb takes its singular form.' : '<i>' + p[0] + '</i> is plural, so the verb takes its plural form.' };
    }
    var t = R.pick(pool), pl = R.coin(), sing = t[0].split(' ').pop(), plw = t[1].split(' ').pop();
    if (sing === plw) return { subj: t[1], n: 2, v: t[2], rest: t[3], why: '<i>' + t[1] + '</i> here means more than one (the plural of <i>sheep</i> is <i>sheep</i>).' };
    var head = pl ? plw : sing;
    return { subj: pl ? t[1] : t[0], n: pl ? 2 : 1, v: t[2], rest: t[3],
      why: pl ? '<i>' + head + '</i> is plural' + (/s$/.test(head) ? '' : ' (more than one), even without an -s') + '.' : '<i>' + head + '</i> is singular (one)' + (/s$/.test(head) ? ', even though it ends in s' : '') + '.' };
  }
  function svForms(c) {
    var right = pres(c.v, c.n), wrong;
    if (c.v === 'be') wrong = ['am', 'is', 'are'].filter(function (x) { return x !== right; });
    else wrong = [c.n === 1 ? c.v : s3(c.v)];
    return { right: right, wrong: wrong };
  }
  G('usage.sv-agreement', function (R, ctx) {
    var L = ctx.level;
    if (L < 3) {
      var c = svCase(R, L === 1 ? SV.concat(SV_BE.slice(0, 4)) : SV_IRR.concat(SV_BE, SV), L === 2), f = svForms(c);
      var wrong = L === 1 && c.v === 'be' ? [c.n === 1 ? 'are' : 'is'] : f.wrong;
      return { q: q(para('Choose the verb that agrees with the subject.'), sent(c.subj + ' ___ ' + c.rest + '.')), a: mc(f.right, wrong),
        hint: 'Find the subject first. Is it one, or more than one?',
        steps: ['The subject is <i>' + c.subj + '</i>.', c.why, 'So the verb is <i>' + f.right + '</i>: ' + quote(c.subj + ' ' + f.right + ' ' + c.rest + '.')] };
    }
    // level 3: select all the sentences whose verbs agree
    var picks = R.sample(SV.concat(SV_IRR.filter(function (x) { return x[0] !== 'The sheep'; })), 4), items = [];
    picks.forEach(function (t, i) {
      var pl = R.coin(), subj = pl ? t[1] : t[0], n = pl ? 2 : 1, ok = i === 0 ? true : i === 1 ? false : R.coin();
      var v = pres(t[2], ok ? n : (n === 1 ? 2 : 1));
      items.push({ text: subj + ' ' + v + ' ' + t[3] + '.', ok: ok, subj: subj, v: v, right: pres(t[2], n) });
    });
    var shown = R.shuffle(items);
    return { q: q(para('Which sentences have verbs that agree with their subjects? ' + ALL)), a: selectAll(shown),
      hint: 'For each one, find the subject. One takes the -s verb; more than one takes the plain verb.',
      steps: shown.map(function (it) { return quote(it.text) + (it.ok ? ' agrees.' : ' doesn’t agree: <i>' + it.subj + '</i> takes <i>' + it.right + '</i>.'); }) };
  });

  /* ---------------------------------------------------------------- usage.agreement-interrupters */
  // [singular head, plural head, phrase used with the singular head (plural noun inside), phrase used with the plural head (singular noun inside), verb, rest]
  var INT = [
    ['The box', 'The boxes', 'of old crayons', 'in the closet', 'be', 'full'], ['The list', 'The lists', 'of chores', 'on the fridge', 'be', 'long'],
    ['The leader', 'The leaders', 'of the hikers', 'of the group', 'carry', 'a map'], ['The color', 'The colors', 'of the leaves', 'of the sunset', 'be', 'bright'],
    ['The bowl', 'The bowls', 'of cherries', 'on the table', 'be', 'empty'], ['The student', 'The students', 'with the red backpacks', 'in the back row', 'need', 'a pencil'],
    ['The sound', 'The sounds', 'of the waves', 'of the wind', 'help', 'me sleep'], ['The price', 'The prices', 'of the tickets', 'at the store', 'go', 'up in the summer'],
    ['The key', 'The keys', 'to the lockers', 'to the shed', 'be', 'missing'], ['The bag', 'The bags', 'of apples', 'by the door', 'be', 'heavy'],
    ['The dog', 'The dogs', 'with the floppy ears', 'next door', 'bark', 'at night'], ['The painting', 'The paintings', 'by the students', 'by my aunt', 'hang', 'in the hall'],
    ['The plant', 'The plants', 'near the windows', 'in the kitchen', 'grow', 'fast'], ['The pile', 'The piles', 'of books', 'of sand', 'be', 'tall'],
    ['The noise', 'The noises', 'from the trucks', 'from the street', 'keep', 'us awake'], ['The flavor', 'The flavors', 'of these cookies', 'of the pie', 'be', 'amazing']
  ];
  // extra phrases that don't change the number: [subject, extra, verb, rest]
  var ALONG = [
    ['The coach', 'along with her players,', 'be', 'on the bus'], ['My sister', 'as well as my cousins,', 'be', 'coming to dinner'],
    ['The teacher', 'together with the students,', 'plant', 'a tree each spring'], ['The captain', 'along with the crew,', 'wave', 'from the ship'],
    ['Grandpa', 'as well as the twins,', 'like', 'spicy food'], ['The mayor', 'together with two reporters,', 'visit', 'our school today']
  ];
  function intCase(R) {
    var t = R.pick(INT), pl = R.coin(), subj = pl ? t[1] : t[0], ph = pl ? t[3] : t[2], n = pl ? 2 : 1, past = t[4] === 'be' && R.coin();
    var right = past ? pastBe(n) : pres(t[4], n), wrong = past ? pastBe(n === 1 ? 2 : 1) : pres(t[4], n === 1 ? 2 : 1);
    var near = ph.split(' ').pop();
    return { t: t, subj: subj, ph: ph, n: n, right: right, wrong: wrong, near: near, head: subj.split(' ').pop(), rest: t[5] };
  }
  G('usage.agreement-interrupters', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'choose', R.pick(['choose', 'choose', 'subject']), R.pick(['which', 'along', 'subject']));
    if (shape === 'along') {
      var a = R.pick(ALONG), right = pres(a[2], 1), wrong = pres(a[2], 2), sentence = a[0] + ', ' + a[1] + ' ___ ' + a[3] + '.';
      return { q: q(para('Choose the verb that agrees with the subject.'), sent(sentence)), a: mc(right, [wrong]),
        hint: 'Does <i>' + a[1].replace(/,$/, '') + '</i> join subjects the way <i>and</i> does?',
        steps: ['<i>' + a[1].replace(/,$/, '') + '</i> adds extra information. It doesn’t join subjects the way <i>and</i> does.', 'The subject is still <i>' + low(a[0]) + '</i>, which is singular.', 'So: ' + quote(a[0] + ', ' + a[1] + ' ' + right + ' ' + a[3] + '.')] };
    }
    var c = intCase(R), base = c.subj + ' ' + c.ph + ' ___ ' + c.rest + '.';
    var steps = ['Find the subject: <i>' + c.head + '</i>.', '<i>' + c.ph + '</i> is a phrase between the subject and the verb. Cross it out.', '<i>' + cap(c.head) + '</i> is ' + (c.n === 1 ? 'singular' : 'plural') + ', so: ' + quote(c.subj + ' … ' + c.right + ' ' + c.rest + '.')];
    if (shape === 'choose') {
      return { q: q(para('Choose the verb that agrees with the subject.'), sent(base)), a: mc(c.right, [c.wrong]), hint: 'Cross out the phrase between the subject and the verb.', steps: steps };
    }
    if (shape === 'subject') {
      var full = c.subj + ' ' + c.ph + ' ' + c.right + ' ' + c.rest + '.';
      var wrongs = [c.near, c.right].concat(L === 3 ? [c.rest.split(' ').pop()] : []);
      return { q: q(para('Which word is the subject that the verb agrees with?'), sent(full)), a: mc(c.head, wrongs.filter(function (w) { return w !== c.head; })),
        hint: 'Ask who or what ' + c.right + ' ' + c.rest + '. Ignore the phrase in between.', steps: steps.slice(0, 2).concat(['The verb <i>' + c.right + '</i> agrees with <i>' + c.head + '</i>, not with <i>' + c.near + '</i>.']) };
    }
    // which: which sentence is correct (the wrong one agrees with the nearest noun)
    var good = c.subj + ' ' + c.ph + ' ' + c.right + ' ' + c.rest + '.', bad = c.subj + ' ' + c.ph + ' ' + c.wrong + ' ' + c.rest + '.';
    var d = intCase(R); while (d.t === c.t) d = intCase(R);
    var bad2 = d.subj + ' ' + d.ph + ' ' + d.wrong + ' ' + d.rest + '.';
    return { q: q(para('Which sentence is correct?')), a: mc(good, [bad, bad2]), hint: 'In each one, cross out the phrase after the subject.',
      steps: [quote(good) + ': ' + c.head + ' … ' + c.right + '. It agrees.', quote(bad) + ': the verb agrees with <i>' + c.near + '</i>, the noun in the phrase.', quote(bad2) + ': the subject is <i>' + d.head + '</i>, so it needs <i>' + d.right + '</i>.'] };
  });

  /* ---------------------------------------------------------------- usage.agreement-compound */
  var PEOPLE = { 1: ['my sister', 'my brother', 'the coach', 'the teacher', 'Grandma', 'our neighbor', 'my cousin'], 2: ['my cousins', 'the students', 'the players', 'the twins', 'my parents', 'our neighbors'] };
  var ANIMALS = { 1: ['the cat', 'the dog', 'the puppy', 'the rabbit', 'the hamster'], 2: ['the cats', 'the dogs', 'the puppies', 'the rabbits', 'the hamsters'] };
  var PRED = { p: [['be', 'ready'], ['be', 'at the door'], ['like', 'spinach'], ['have', 'the key'], ['want', 'pizza'], ['need', 'a ride']], a: [['be', 'hungry'], ['need', 'water'], ['be', 'asleep'], ['want', 'a treat'], ['have', 'fleas']] };
  function stem(w) { return w.replace(/ies$/, 'y').replace(/s$/, ''); }
  function cmpCase(R, joiner, n1, n2) {
    var animal = R.coin(), pool = animal ? ANIMALS : PEOPLE, pr = R.pick(animal ? PRED.a : PRED.p);
    var x = R.pick(pool[n1]), y = R.pick(pool[n2].filter(function (w) { return stem(w) !== stem(x); }));
    var subj = joiner === 'and' ? cap(x) + ' and ' + y : joiner === 'or' ? cap(x) + ' or ' + y : joiner === 'either' ? 'Either ' + x + ' or ' + y : 'Neither ' + x + ' nor ' + y;
    var n = joiner === 'and' ? 2 : n2, past = pr[0] === 'be' && R.chance(0.3);
    var right = past ? pastBe(n) : pres(pr[0], n), wrong = past ? pastBe(n === 1 ? 2 : 1) : pres(pr[0], n === 1 ? 2 : 1);
    var why = joiner === 'and' ? '<i>And</i> joins the parts into a group, so the subject is plural.' : 'With <i>' + (joiner === 'neither' ? 'nor' : 'or') + '</i>, the verb agrees with the nearer part, <i>' + y + '</i>, which is ' + (n2 === 1 ? 'singular' : 'plural') + '.';
    return { subj: subj, rest: pr[1], right: right, wrong: wrong, why: why, near: y, n: n };
  }
  G('usage.agreement-compound', function (R, ctx) {
    var L = ctx.level, c;
    if (L === 1) c = cmpCase(R, R.pick(['and', 'or', 'either']), 1, 1);
    else if (L === 2) { var j = R.pick(['and', 'either', 'neither', 'neither', 'either']), n1 = R.pick([1, 2]), n2 = j === 'and' ? R.pick([1, 2]) : (n1 === 1 ? 2 : 1); c = cmpCase(R, j, n1, n2); }
    if (L < 3) return { q: q(para('Choose the verb that agrees with the subject.'), sent(c.subj + ' ___ ' + c.rest + '.')), a: mc(c.right, [c.wrong]),
      hint: 'Look at the joining word: <i>and</i>, <i>or</i> or <i>nor</i>.', steps: ['The subject is <i>' + low(c.subj) + '</i>.', c.why, 'So: ' + quote(c.subj + ' ' + c.right + ' ' + c.rest + '.')] };
    // level 3: which sentence is correct? one right, the trouble spot (or treated like and), one more wrong
    var a = cmpCase(R, R.pick(['either', 'neither']), 2, 1), b = cmpCase(R, 'and', 1, 1), good = R.coin();
    var s1 = a.subj + ' ' + (good ? a.right : a.wrong) + ' ' + a.rest + '.', s2 = b.subj + ' ' + (good ? b.wrong : b.right) + ' ' + b.rest + '.';
    var s3w = cmpCase(R, R.pick(['either', 'neither']), 1, 2), s3s = s3w.subj + ' ' + s3w.wrong + ' ' + s3w.rest + '.';
    var right = good ? s1 : s2, wrongs = good ? [s2, s3s] : [s1, s3s];
    return { q: q(para('Which sentence is correct?')), a: mc(right, wrongs), hint: 'For each, check the joining word. With <i>or</i> or <i>nor</i>, look at the part nearest the verb.',
      steps: [quote(s1) + (good ? ' is correct. ' : ' is not correct. ') + a.why, quote(s2) + (good ? ' is not correct. ' : ' is correct. ') + b.why, quote(s3s) + ' is not correct. ' + s3w.why] };
  });

  /* ---------------------------------------------------------------- usage.agreement-indefinite */
  // [subject, number (1 or 2), verb, rest]
  var IND_S = [['Everyone in my class', 'be', 'ready for the test'], ['Each of the students', 'have', 'a locker'], ['Nobody on the bus', 'know', 'the answer'],
    ['Someone in the stands', 'be', 'cheering'], ['One of the players', 'need', 'new shoes'], ['Everybody', 'want', 'a turn'], ['Each of the puppies', 'have', 'a name'],
    ['Everything in the boxes', 'be', 'for sale'], ['Anyone with a ticket', 'get', 'in free'], ['No one in the stores', 'sell', 'that kind of pen'],
    ['Each of the windows', 'be', 'open'], ['Somebody in the kitchen', 'be', 'singing'], ['Nothing in these drawers', 'belong', 'to me'], ['Everyone at the tables', 'like', 'the soup']];
  var IND_P = [['Both of my sisters', 'play', 'soccer'], ['Many of the trees', 'be', 'losing their leaves'], ['Several of the windows', 'be', 'open'],
    ['Few of the guests', 'know', 'the song'], ['Both of the puppies', 'have', 'spots'], ['Many of my friends', 'ride', 'the bus'], ['Several of the books', 'be', 'overdue']];
  // some/all/most: [subject, number, verb, rest]
  var IND_D = [['Some of the pie', 1, 'be', 'gone'], ['Some of the cookies', 2, 'be', 'gone'], ['All of the milk', 1, 'be', 'in the fridge'], ['All of the lights', 2, 'be', 'on'],
    ['Most of the water', 1, 'be', 'cold'], ['Most of the apples', 2, 'be', 'ripe'], ['Some of the sand', 1, 'be', 'wet'], ['Most of the students', 2, 'have', 'lunch at noon'],
    ['All of the snow', 1, 'have', 'melted'], ['Some of the players', 2, 'have', 'left'], ['Most of the cake', 1, 'have', 'frosting'], ['All of the birds', 2, 'have', 'flown south']];
  // collective nouns, American usage: [subject, verb, rest]
  var COLL = [['The team', 'be', 'winning'], ['Our class', 'be', 'going on a trip'], ['The band', 'play', 'on Fridays'], ['My family', 'eat', 'dinner at six'],
    ['The committee', 'meet', 'on Mondays'], ['The audience', 'clap', 'after every song'], ['The crowd', 'be', 'cheering'], ['The club', 'have', 'twenty members']];
  function indCase(R, kinds) {
    var k = R.pick(kinds), t, n, v, rest, why;
    if (k === 's') { t = R.pick(IND_S); n = 1; v = t[1]; rest = t[2]; why = '<i>' + t[0].split(' ')[0] + '</i> is always singular' + (/ of /.test(t[0]) ? '; the phrase after it doesn’t change that' : '') + '.'; }
    else if (k === 'p') { t = R.pick(IND_P); n = 2; v = t[1]; rest = t[2]; why = '<i>' + t[0].split(' ')[0] + '</i> is always plural.'; }
    else { t = R.pick(IND_D); n = t[1]; v = t[2]; rest = t[3]; var noun = t[0].split(' ').pop(); why = '<i>' + t[0].split(' ')[0] + '</i> follows the noun after <i>of</i>: <i>' + noun + '</i> is ' + (n === 1 ? 'one amount, so it is singular' : 'a group of separate things, so it is plural') + '.'; }
    return { subj: t[0], n: n, right: pres(v, n), wrong: pres(v, n === 1 ? 2 : 1), rest: rest, why: why, k: k };
  }
  G('usage.agreement-indefinite', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'choose', R.pick(['choose', 'choose', 'kind']), R.pick(['choose', 'collective', 'kind']));
    if (shape === 'choose') {
      var c = indCase(R, L === 1 ? ['s', 's', 'p'] : ['s', 'p', 'd', 'd']);
      if (L === 1) while (/ of /.test(c.subj)) c = indCase(R, ['s', 's', 'p']);
      return { q: q(para('Choose the verb that agrees with the subject.'), sent(c.subj + ' ___ ' + c.rest + '.')), a: mc(c.right, [c.wrong]),
        hint: L === 1 ? 'Words ending in -one, -body and -thing are singular.' : 'Is the pronoun always singular, always plural, or does it depend on the noun after <i>of</i>?',
        steps: [c.why, 'So: ' + quote(c.subj + ' ' + c.right + ' ' + c.rest + '.')] };
    }
    if (shape === 'kind') {
      var groups = { s: ['each', 'everyone', 'everybody', 'nobody', 'someone', 'anything', 'no one', 'everything', 'somebody', 'anyone'], p: ['both', 'many', 'several', 'few'], d: ['some', 'all', 'most', 'any'] };
      var k = R.pick(['s', 's', 'p', 'd']), w = R.pick(groups[k]), names = ['always singular', 'always plural', 'it depends on the noun it refers to'];
      var idx = { s: 0, p: 1, d: 2 }[k];
      return { q: q(para('Is this indefinite pronoun singular, plural, or does it depend?'), sent(w)), a: keep(names, idx),
        hint: 'Think of a sentence: “' + cap(w) + ' … is” or “' + cap(w) + ' … are”?',
        steps: [k === 's' ? '<i>' + w + '</i> looks at one at a time, so it is always singular: “' + cap(w) + ' is here.”' : k === 'p' ? '<i>' + w + '</i> always means more than one: “' + cap(w) + ' are here.”' : '<i>' + w + '</i> follows its noun: “' + cap(w) + ' of the pie is gone,” but “' + cap(w) + ' of the cookies are gone.”'] };
    }
    var t = R.pick(COLL), right = pres(t[1], 1), wrong = pres(t[1], 2);
    return { q: q(para('In American English, which verb is usual with this collective noun?'), sent(t[0] + ' ___ ' + t[2] + '.')), a: mc(right, [wrong]),
      hint: 'In American English, does a group acting as one unit take a singular or a plural verb?',
      steps: ['<i>' + t[0].split(' ').pop() + '</i> names a group acting as one unit.', 'American English usually treats it as singular: ' + quote(t[0] + ' ' + right + ' ' + t[2] + '.'), 'British English often uses the plural (“' + t[0] + ' ' + wrong + ' …”); both are standard in their own countries.'] };
  });

  /* ---------------------------------------------------------------- usage.agreement-inverted */
  var THERE = { 1: [['a note', 'on the desk'], ['a spider', 'in the bathtub'], ['one cookie', 'in the jar'], ['a new student', 'in our class'], ['a hole', 'in my sock'], ['a problem', 'with the printer']],
    2: [['three pencils', 'in the cup'], ['two reasons', 'for the delay'], ['some letters', 'in the mailbox'], ['many birds', 'at the feeder'], ['a few problems', 'with the plan'], ['ten students', 'on the team']] };
  // questions and here: [frame, right, wrong, subject, number]
  var QHERE = [
    ['Where ___ my shoes?', 'are', 'is', 'shoes', 2], ['___ the cookies ready?', 'Are', 'Is', 'cookies', 2], ['___ your brother play chess?', 'Does', 'Do', 'brother', 1],
    ['What ___ the rules of the game?', 'are', 'is', 'rules', 2], ['___ the doors locked last night?', 'Were', 'Was', 'doors', 2], ['___ the guests arrived?', 'Have', 'Has', 'guests', 2],
    ['Here ___ the bus.', 'comes', 'come', 'bus', 1], ['Here ___ the twins.', 'come', 'comes', 'twins', 2], ['Here ___ your tickets.', 'are', 'is', 'tickets', 2],
    ['Here ___ the key to the shed.', 'is', 'are', 'key', 1], ['Why ___ the baby crying?', 'is', 'are', 'baby', 1], ['Where ___ the scissors?', 'are', 'is', 'scissors', 2],
    ['___ the soup too hot?', 'Is', 'Are', 'soup', 1], ['How many legs ___ a spider have?', 'does', 'do', 'spider', 1]
  ];
  function thereCase(R) {
    var n = R.pick([1, 2]), t = R.pick(THERE[n]), past = R.chance(0.35);
    var right = past ? pastBe(n) : pres('be', n), wrong = past ? pastBe(n === 1 ? 2 : 1) : pres('be', n === 1 ? 2 : 1);
    return { frame: 'There ___ ' + t[0] + ' ' + t[1] + '.', right: right, wrong: wrong, subj: t[0], n: n, rest: t[1], past: past };
  }
  G('usage.agreement-inverted', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'there', R.pick(['there', 'q', 'q']), R.pick(['formal', 'q', 'which']));
    if (shape === 'there') {
      var c = thereCase(R);
      return { q: q(para('Choose the verb that agrees with the subject.'), sent(c.frame)), a: mc(c.right, [c.wrong]), hint: '<i>There</i> is never the subject. Look after the verb.',
        steps: ['<i>There</i> is not the subject. What is ' + c.rest + '? <i>' + c.subj + '</i>.', '<i>' + cap(c.subj) + '</i> is ' + (c.n === 1 ? 'singular' : 'plural') + '.', 'So: ' + quote(fill(c.frame, c.right))] };
    }
    if (shape === 'q') {
      var t = R.pick(QHERE);
      return { q: q(para('Choose the verb that agrees with the subject.'), sent(t[0])), a: mc(t[1], [t[2]]), hint: 'Turn it into a statement to find the subject.',
        steps: ['The subject comes after the verb here: <i>' + t[3] + '</i>.', '<i>' + cap(t[3]) + '</i> is ' + (t[4] === 1 ? 'singular' : 'plural') + '.', 'So: ' + quote(blankUp(t[0], t[1]))] };
    }
    if (shape === 'formal') {
      var d = thereCase(R); while (d.n !== 2 || d.past) d = thereCase(R);
      var good = 'There are ' + d.subj + ' ' + d.rest + '.', bad = 'There’s ' + d.subj + ' ' + d.rest + '.', bad2 = 'There is ' + d.subj + ' ' + d.rest + '.';
      return { q: q(para('Which sentence is right for formal writing?')), a: mc(good, [bad, bad2]), hint: 'What is the subject, and is it plural?',
        steps: ['The subject is <i>' + d.subj + '</i>, which is plural.', 'Many people say “there’s” before a plural in conversation; formal writing uses <i>there are</i>.', 'So: ' + quote(good)] };
    }
    var x = thereCase(R), y = R.pick(QHERE), right = R.coin();
    var s1 = fill(x.frame, right ? x.right : x.wrong), s2 = blankUp(y[0], right ? y[2] : y[1]);
    var z = thereCase(R); while (z.frame === x.frame) z = thereCase(R);
    var s3w = fill(z.frame, z.wrong);
    return { q: q(para('Which sentence is correct?')), a: mc(right ? s1 : s2, [right ? s2 : s1, s3w]), hint: 'In each, find the subject after the verb.',
      steps: [quote(s1) + (right ? ' is correct: ' : ' is not correct: ') + '<i>' + x.subj + '</i> takes <i>' + x.right + '</i>.', quote(s2) + (right ? ' is not correct: ' : ' is correct: ') + '<i>' + y[3] + '</i> takes <i>' + y[1].toLowerCase() + '</i>.', quote(s3w) + ' is not correct: <i>' + z.subj + '</i> takes <i>' + z.right + '</i>.'] };
  });

  /* ---------------------------------------------------------------- usage.pronoun-antecedent */
  // [frame, right, wrong choices, antecedent, number words]
  var PA = [
    ['The girls packed ___ own bags for the trip.', 'their', ['her', 'its'], 'girls', 'plural'], ['The tree dropped ___ leaves in October.', 'its', ['their', 'it’s'], 'tree', 'singular, a thing'],
    ['The bikes lost ___ shine in the rain.', 'their', ['its', 'it’s'], 'bikes', 'plural'], ['My uncle fixed ___ own car.', 'his', ['their', 'its'], 'uncle', 'singular, a man'],
    ['My aunt planted ___ own garden in May.', 'her', ['their', 'its'], 'aunt', 'singular, a woman'], ['The players thanked ___ own coach.', 'their', ['his', 'its'], 'players', 'plural'],
    ['The kitten chased ___ own tail.', 'its', ['their', 'it’s'], 'kitten', 'singular, an animal'], ['The students raised ___ own hands.', 'their', ['his', 'your'], 'students', 'plural'],
    ['The house lost ___ roof in the storm.', 'its', ['their', 'it’s'], 'house', 'singular, a thing'], ['The geese flapped ___ wings.', 'their', ['its', 'his'], 'geese', 'plural'],
    ['My brothers cleaned ___ own room.', 'their', ['his', 'its'], 'brothers', 'plural'], ['The library extended ___ hours.', 'its', ['their', 'it’s'], 'library', 'singular, a thing']
  ];
  // person shifts: [frame, right, wrong, antecedent]
  var PSHIFT = [
    ['When students study early, ___ remember more.', 'they', ['you', 'we'], 'students'], ['If hikers bring enough water, ___ will feel better on the trail.', 'they', ['you', 'we'], 'hikers'],
    ['Players who stretch protect ___ muscles.', 'their', ['your', 'our'], 'players'], ['If one practices daily, ___ improves quickly.', 'one', ['you', 'we'], 'one'],
    ['Drivers should check ___ mirrors often.', 'their', ['your', 'our'], 'drivers'], ['When visitors arrive, ___ sign the guest book.', 'they', ['you', 'we'], 'visitors']
  ];
  G('usage.pronoun-antecedent', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'number', R.pick(['number', 'person']), R.pick(['which', 'person']));
    if (shape === 'number') {
      var t = R.pick(PA), wrong = L === 1 ? [t[2][0]] : t[2];
      return { q: q(para('The pronoun stands for <i>' + t[3] + '</i>. Choose the pronoun that agrees with it.'), sent(t[0])), a: mc(t[1], wrong), hint: 'Which noun does the pronoun stand for? Is it one or more than one?',
        steps: ['The pronoun stands for <i>' + t[3] + '</i> (' + t[4] + ').', 'So the pronoun is <i>' + t[1] + '</i>' + (t[2].indexOf('it’s') >= 0 ? ' (no apostrophe: <i>it’s</i> means “it is”)' : '') + '.', quote(fill(t[0], t[1]))] };
    }
    if (shape === 'person') {
      var p = R.pick(PSHIFT);
      return { q: q(para('The pronoun stands for <i>' + p[3] + '</i>. Choose the pronoun that keeps the same person.'), sent(p[0])), a: mc(p[1], p[2]),
        hint: 'Is the antecedent first person (I, we), second person (you), or third person?',
        steps: ['The antecedent is <i>' + p[3] + '</i>, ' + (p[3] === 'one' ? 'third person (formal and general)' : 'third person, plural') + '.', '<i>You</i> or <i>we</i> would shift the person partway through.', 'So: ' + quote(blankUp(p[0], p[1]))] };
    }
    var a = R.sample(PA, 2), good = fill(a[0][0], a[0][1]), bad = fill(a[1][0], a[1][2][0]), pp = R.pick(PSHIFT), bad2 = blankUp(pp[0], pp[2][0]);
    return { q: q(para('In each sentence, the pronoun stands for a noun earlier in the same sentence. Which sentence uses its pronoun correctly?')), a: mc(good, [bad, bad2]), hint: 'Check number (one or more) and person (I, you, or they).',
      steps: [quote(good) + ': <i>' + a[0][1] + '</i> agrees with <i>' + a[0][3] + '</i>.', quote(bad) + ': <i>' + a[1][2][0] + '</i> doesn’t agree with <i>' + a[1][3] + '</i>; it should be <i>' + a[1][1] + '</i>.', quote(bad2) + ': the person shifts from <i>' + pp[3] + '</i> to <i>' + pp[2][0] + '</i>.'] };
  });

  /* ---------------------------------------------------------------- usage.singular-they */
  // [singular subject, plural subject, singular verb phrase, plural verb phrase, thing, things]
  var ST = [
    ['Each student', 'All students', 'should bring', 'should bring', 'notebook', 'notebooks'], ['Every camper', 'All campers', 'needs', 'need', 'sleeping bag', 'sleeping bags'],
    ['Each runner', 'All runners', 'must wear', 'must wear', 'race number', 'race numbers'], ['Every visitor', 'All visitors', 'signs', 'sign', 'name', 'names'],
    ['Each player', 'All players', 'fills', 'fill', 'water bottle', 'water bottles'], ['A new member', 'New members', 'gets', 'get', 'badge', 'badges'],
    ['Each driver', 'All drivers', 'should check', 'should check', 'mirrors', 'mirrors'], ['Every reader', 'All readers', 'needs', 'need', 'library card', 'library cards']
  ];
  // [opening, they-clause end (plural verb), he-or-she end, plural rewrite]
  var ST2 = [
    ['If a visitor arrives early,', ['are', 'welcome to wait in the lobby'], 'Visitors who arrive early are welcome to wait in the lobby.'],
    ['When a customer calls,', ['are', 'helped right away'], 'Customers who call are helped right away.'],
    ['If a student is absent,', ['have', 'two days to make up the quiz'], 'Students who are absent have two days to make up the quiz.'],
    ['Once a runner finishes,', ['are', 'handed a medal'], 'Runners who finish are handed a medal.']
  ];
  var BE_SG = { are: 'is', have: 'has', were: 'was' };
  G('usage.singular-they', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['plural', 'nopronoun']), R.pick(['plural', 'verb', 'guide']), R.pick(['all', 'guide', 'verb']));
    var t = R.pick(ST), orig = t[0] + ' ' + t[2] + ' ___ ' + t[4] + '.';
    var they = t[0] + ' ' + t[2] + ' their ' + t[4] + '.', heshe = t[0] + ' ' + t[2] + ' his or her ' + t[4] + '.', plural = t[1] + ' ' + t[3] + ' their ' + t[5] + '.', none = t[0] + ' ' + t[2] + ' ' + (/s$/.test(t[4]) ? 'the' : 'a') + ' ' + t[4] + '.';
    var range = 'Singular <i>they</i>, <i>he or she</i>, and a rewrite are all standard; style guides differ on which they prefer.';
    if (shape === 'plural') {
      var w1 = t[0] + ' ' + t[2] + ' their ' + t[5] + '.', w2 = t[1] + ' ' + (t[2] !== t[3] ? t[2] + ' their ' + t[5] : t[3] + ' his or her ' + t[4]) + '.';
      return { q: q(para('A writer wants to avoid choosing a pronoun here by rewriting the sentence in the plural. Which rewrite does that correctly?'), sent(orig)), a: mc(plural, [w1, w2]),
        hint: 'Both the subject and the verb have to become plural.',
        steps: ['Make the subject plural: <i>' + low(t[1]) + '</i>.', 'Then the verb and the pronoun follow: ' + quote(plural), range] };
    }
    if (shape === 'nopronoun') {
      return { q: q(para('Which version needs no pronoun at all?'), sent(orig)), a: mc(none, [they, heshe]),
        hint: 'Look for the version with no <i>his</i>, <i>her</i> or <i>their</i>.',
        steps: [quote(none) + ' uses <i>' + (/s$/.test(t[4]) ? 'the' : 'a') + '</i> instead of a pronoun.', 'The other two use singular <i>they</i> and <i>he or she</i>.', range] };
    }
    if (shape === 'verb') {
      var s = R.pick(ST2), right = s[0] + ' they ' + s[1][0] + ' ' + s[1][1] + '.', wrong = s[0] + ' they ' + BE_SG[s[1][0]] + ' ' + s[1][1] + '.';
      return { q: q(para('A writer uses singular <i>they</i> here. Which verb goes with it?'), sent(s[0] + ' they ___ ' + s[1][1] + '.')), a: mc(s[1][0], [BE_SG[s[1][0]]]),
        hint: 'Think of <i>you</i>: even for one person we say “you are.”',
        steps: ['Singular <i>they</i> keeps its plural verb forms, the way <i>you</i> does for one person.', 'So: ' + quote(right), 'Not: ' + quote(wrong)] };
    }
    if (shape === 'guide') {
      if (R.coin()) return { q: q(para('Which of these guides allows singular <i>they</i> only in limited cases, when other wording would be awkward?')),
        a: mc('the AP Stylebook', ['APA (7th edition)', 'MLA (9th edition)', 'Chicago (18th edition)']), hint: 'Three of these accept it for a person whose gender is unknown.',
        steps: ['APA (7th edition), MLA (9th edition) and Chicago (18th edition) accept singular <i>they</i> for a person whose gender is unknown or not the point.', 'The AP Stylebook, used by many newspapers, allows it in limited cases.'] };
      return { q: q(para('The Oxford English Dictionary’s earliest example of <i>they</i> for one unknown person dates from about when?')), a: keep(['about 1375', 'about 1875', 'about 1975'], 0),
        hint: 'It is much older than most people think.', steps: ['The earliest example dates from about 1375, in the time of Middle English.', 'Some grammarians of the 1700s objected to it, but writers kept using it.'] };
    }
    // all: which are standard ways to write it?
    var s2 = R.pick(ST2), base = s2[0] + ' ___ ' + s2[1][1] + '.';
    var opts = [{ text: s2[0] + ' they ' + s2[1][0] + ' ' + s2[1][1] + '.', ok: true }, { text: s2[0] + ' he or she ' + BE_SG[s2[1][0]] + ' ' + s2[1][1] + '.', ok: true },
      { text: s2[2], ok: true }, { text: s2[0] + ' they ' + BE_SG[s2[1][0]] + ' ' + s2[1][1] + '.', ok: false }, { text: s2[0] + ' it ' + BE_SG[s2[1][0]] + ' ' + s2[1][1] + '.', ok: false }];
    var sh = R.shuffle(opts);
    return { q: q(para('Which of these are standard ways to write this sentence? ' + ALL), sent(base)), a: selectAll(sh),
      hint: 'Three are standard. Check the verb that goes with singular <i>they</i>, and whether <i>it</i> can stand for a person.',
      steps: ['Singular <i>they</i> (with <i>' + s2[1][0] + '</i>), <i>he or she</i> (with <i>' + BE_SG[s2[1][0]] + '</i>), and the plural rewrite are all standard; guides differ on which they prefer.', '“they ' + BE_SG[s2[1][0]] + '” is not standard: singular <i>they</i> takes <i>' + s2[1][0] + '</i>.', '<i>It</i> doesn’t stand for a person.'] };
  });

  /* ---------------------------------------------------------------- usage.vague-pronouns */
  var PAIRS = [['Ana', 'Mia', 'she', 'She'], ['Leo', 'Max', 'he', 'He'], ['Grandma', 'Aunt Rosa', 'she', 'She'], ['Dad', 'Uncle Tom', 'he', 'He'], ['Kim', 'Jada', 'she', 'She'], ['Omar', 'Ben', 'he', 'He']];
  // templates: unclear, clear, still unclear; A B p P fill in
  var VTPL = [
    ['When A called B, p was upset.', 'A was upset when p called B.', 'P was upset when A called B.'],
    ['A and B ran to the gym, and p tripped on the steps.', 'A and B ran to the gym, and B tripped on the steps.', 'A and B ran to the gym, where p tripped on the steps.'],
    ['A waved at B while p was crossing the street.', 'A waved at B, who was crossing the street.', 'A waved at B as p was crossing the street.'],
    ['A argued with B until p left the room.', 'A argued with B until B left the room.', 'A and B argued until p left the room.'],
    ['A met B at the library after p finished practice.', 'After finishing practice, A met B at the library.', 'After p finished practice, A and B met at the library.']
  ];
  // no clear antecedent: [unclear, clear, wrong fix, what the pronoun lacks]
  var VNONE = [
    ['They say the pool will open in June.', 'The town website says the pool will open in June.', 'They say that the pool will open in June.', 'Who are <i>they</i>?'],
    ['The bus was late, and it rained. This made us grumpy.', 'The bus was late, and it rained. The late bus and the rain made us grumpy.', 'The bus was late, and it rained. This was what made us grumpy.', 'What does <i>this</i> point to: the bus, the rain, or both?'],
    ['The dog chased the cat until it got tired.', 'The dog chased the cat until the dog got tired.', 'The dog kept chasing the cat until it got tired.', 'Which animal does <i>it</i> mean?'],
    ['Put the books in the boxes and label them.', 'Put the books in the boxes and label the boxes.', 'Put the books in the boxes, and then label them.', 'Label the books or the boxes?'],
    ['The phone fell into the sink, but it was fine.', 'The phone fell into the sink, but the phone still worked.', 'Into the sink fell the phone, but it was fine.', 'Was the phone fine, or the sink?'],
    ['At the museum, they let you touch the fossils.', 'At the museum, the guides let visitors touch the fossils.', 'At the museum, they let us touch the fossils.', 'Who are <i>they</i>?']
  ];
  function vFill(s, p) { return s.replace(/\bA\b/g, p[0]).replace(/\bB\b/g, p[1]).replace(/\bp\b/g, p[2]).replace(/\bP\b/g, p[3]); }
  G('usage.vague-pronouns', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['why', 'fix2']), R.pick(['fix', 'none']), R.pick(['all', 'none', 'fix']));
    var p = R.pick(PAIRS), t = R.pick(VTPL), un = vFill(t[0], p), cl = vFill(t[1], p), still = vFill(t[2], p);
    if (shape === 'why') {
      return { q: q(para('Why is the pronoun in this sentence unclear?'), sent(un)), a: mc('It could mean ' + p[0] + ' or ' + p[1] + '.', ['It is in the wrong case.', 'It doesn’t agree in number.']),
        hint: 'Count the people the pronoun could point to.', steps: ['<i>' + p[2] + '</i> could point to ' + p[0] + ' or to ' + p[1] + ': both fit.', 'The case and number are fine; the reference is what’s unclear.', 'A clear version: ' + quote(cl)] };
    }
    if (shape === 'fix' || shape === 'fix2') {
      return { q: q(para('Which version makes it clear who is meant?'), sent(un)), a: mc(cl, shape === 'fix2' ? [un] : [un, still]),
        hint: 'In which version can only one person be meant?', steps: ['In the original, <i>' + p[2] + '</i> could mean ' + p[0] + ' or ' + p[1] + '.', quote(cl) + ' leaves only one possible person.'].concat(shape === 'fix' ? [quote(still) + ' moves the words around, but <i>' + p[2] + '</i> could still mean either one.'] : []) };
    }
    if (shape === 'none') {
      var v = R.pick(VNONE);
      return { q: q(para('Which revision makes the pronoun problem go away?'), sent(v[0])), a: mc(v[1], [v[2], v[0]]), hint: v[3],
        steps: [v[3] + ' The reader can’t be sure.', 'The fix names it: ' + quote(v[1]), quote(v[2]) + ' changes the words but keeps the unclear pronoun.'] };
    }
    var p2 = R.pick(PAIRS.filter(function (x) { return x !== p; })), t2 = R.pick(VTPL.filter(function (x) { return x !== t; })), v2 = R.pick(VNONE);
    var items = R.shuffle([{ text: cl, ok: true }, { text: un, ok: false }, { text: vFill(t2[1], p2), ok: true }, { text: v2[0], ok: false }]);
    return { q: q(para('Which sentences have only clear pronouns? ' + ALL)), a: selectAll(items), hint: 'For each pronoun, ask: could it point to two things, or to nothing?',
      steps: items.map(function (it) { return quote(it.text) + (it.ok ? ' is clear.' : ' is unclear.'); }) };
  });

  /* ================================================================ UNIT 2: PRONOUN CASE */
  var CASES = [['I', 'me'], ['he', 'him'], ['she', 'her'], ['we', 'us'], ['they', 'them']];
  var SUBJ_F = ['___ won the game.', '___ walked to the park after school.', '___ will bring snacks tomorrow.', '___ found the missing keys.', 'Yesterday ___ baked bread.', 'After lunch ___ played chess.', '___ wrote a thank-you note.'];
  var OBJ_F = ['The coach thanked ___.', 'Grandpa called ___ last night.', 'Please help ___ with the boxes.', 'The puppy followed ___ home.', 'Our neighbor invited ___ to dinner.', 'The loud music woke ___.'];
  var PREP_F = ['Sit with ___ at lunch.', 'This letter is for ___.', 'The ball rolled toward ___.', 'Mom made pancakes for ___.', 'The dog ran past ___.', 'The teacher handed the books to ___.'];
  function caseCase(R, kinds) {
    var k = R.pick(kinds), c = R.pick(CASES), f = R.pick(k === 's' ? SUBJ_F : k === 'o' ? OBJ_F : PREP_F);
    if (c[0] === 'I' && k !== 's' && /^Please help/.test(f)) { /* help me: fine */ }
    var right = k === 's' ? c[0] : c[1], wrong = k === 's' ? c[1] : c[0];
    var job = k === 's' ? 'the subject: it does the action' : k === 'o' ? 'the object of the verb: it receives the action' : 'the object of the preposition <i>' + f.split(' ___')[0].split(' ').pop() + '</i>';
    return { f: f, right: right, wrong: wrong, k: k, job: job };
  }
  function show(f, w) { var s = fill(f, w); return f.indexOf('___') === 0 ? cap(s) : s; }
  function showC(f, w) { return f.indexOf('___') === 0 ? cap(w) : w; }
  G('usage.pronoun-case', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'choose', R.pick(['choose', 'choose', 'kind']), R.pick(['pair', 'which', 'choose']));
    if (shape === 'choose') {
      var c = caseCase(R, L === 1 ? ['s', 'o'] : ['s', 'o', 'p']);
      return { q: q(para('Choose the correct pronoun.'), sent(c.f)), a: mc(showC(c.f, c.right), [showC(c.f, c.wrong)]), hint: 'Is the pronoun doing the action, or receiving it?',
        steps: ['The pronoun is ' + c.job + '.', (c.k === 's' ? 'Subjects take the subject form: ' : 'Objects take the object form: ') + '<i>' + c.right + '</i>.', quote(show(c.f, c.right))] };
    }
    if (shape === 'kind') {
      var pr = R.pick(CASES), obj = R.coin(), w = obj ? pr[1] : pr[0];
      if (w === 'I') w = 'I';
      return { q: q(para('Is this a subject pronoun or an object pronoun?'), sent(w)), a: keep(['subject pronoun', 'object pronoun'], obj ? 1 : 0),
        hint: 'Try it before a verb: “' + cap(w) + ' went.” Does that work?', steps: [obj ? '“' + cap(w) + ' went” doesn’t work, but “They saw ' + w + '” does.' : '“' + cap(w) + ' went” works.', '<i>' + w + '</i> is ' + (obj ? 'an object pronoun' : 'a subject pronoun') + '; its partner is <i>' + (obj ? pr[0] : pr[1]) + '</i>.'] };
    }
    if (shape === 'pair') {
      var nm = R.pick(['Sam', 'Lily', 'my cousin', 'Grandpa', 'Jo']), right = cap(nm) + ' and I went to the park.', w1 = 'Me and ' + nm + ' went to the park.', w2 = cap(nm) + ' and me went to the park.';
      var subjQ = R.coin();
      if (!subjQ) { right = 'Mom drove ' + nm + ' and me to the park.'; w1 = 'Mom drove ' + nm + ' and I to the park.'; w2 = 'Mom drove I and ' + nm + ' to the park.'; }
      return { q: q(para('Which sentence is correct?')), a: mc(right, [w1, w2]), hint: 'Take out the other person and read the pronoun alone.',
        steps: subjQ ? ['Take out ' + nm + ': “I went,” not “Me went.”', 'The pronoun is a subject, so it is <i>I</i>.', quote(right)] : ['Take out ' + nm + ': “Mom drove me,” not “Mom drove I.”', 'The pronoun is an object, so it is <i>me</i>.', quote(right)] };
    }
    var a = caseCase(R, ['s']), b = caseCase(R, ['o', 'p']), good = R.coin();
    var s1 = show(a.f, good ? a.right : a.wrong), s2 = show(b.f, good ? b.wrong : b.right), d = caseCase(R, ['o', 'p']);
    while (d.f === b.f) d = caseCase(R, ['o', 'p']);
    var s3x = show(d.f, d.wrong);
    return { q: q(para('Which sentence uses the correct pronoun?')), a: mc(good ? s1 : s2, [good ? s2 : s1, s3x]), hint: 'For each pronoun, ask: subject or object?',
      steps: [quote(s1) + ': the pronoun is a subject, so <i>' + a.right + '</i>' + (good ? ' is right.' : ', not <i>' + a.wrong + '</i>.'), quote(s2) + ': the pronoun is an object, so <i>' + b.right + '</i>' + (good ? ', not <i>' + b.wrong + '</i>.' : ' is right.'), quote(s3x) + ': it should be <i>' + d.right + '</i>.'] };
  });

  /* ---------------------------------------------------------------- usage.compound-pronouns */
  var NAMES = ['Sam', 'Lily', 'Jo', 'my cousin', 'Dad', 'Grandma', 'our neighbor', 'Ravi'];
  // frames with N (a name) and ___: [frame, kind]
  var CP = [['N and ___ went to the store.', 's'], ['___ and N built a birdhouse.', 's'], ['N and ___ will lead the hike.', 's'], ['The coach chose N and ___.', 'o'],
    ['The gift is for N and ___.', 'p'], ['Grandma sent letters to N and ___.', 'p'], ['The teacher asked N and ___ to help.', 'o'], ['Between you and ___, the quiz was hard.', 'p'],
    ['Mom took N and ___ to the dentist.', 'o'], ['The puppy ran toward N and ___.', 'p']];
  var WEUS = [['___ students cleaned the room.', 's', 'students'], ['The principal thanked ___ students.', 'o', 'students'], ['Coach gave ___ players a break.', 'o', 'players'],
    ['___ fans cheered for the team.', 's', 'fans'], ['The ranger showed ___ campers the trail.', 'o', 'campers'], ['___ kids can carry the cooler.', 's', 'kids']];
  function cpCase(R, pronouns) {
    var f = R.pick(CP), c = R.pick(pronouns), n = R.pick(NAMES.filter(function (x) { return f[0].indexOf(x) < 0 && f[0].indexOf(cap(x)) < 0; })), fr = f[0].replace('N', n);
    if (/^[a-z]/.test(fr)) fr = cap(fr);
    var right = f[1] === 's' ? c[0] : c[1], wrong = f[1] === 's' ? c[1] : c[0];
    var alone = f[1] === 's' ? 'subject' : 'object';
    var test = fr.replace(cap(n) + ' and ', '').replace(n + ' and ', '').replace(' and ' + n, '').replace('you and ', '');
    return { fr: fr, right: right, wrong: wrong, kind: f[1], n: n, alone: alone, test: test };
  }
  G('usage.compound-pronouns', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'choose', R.pick(['choose', 'weus']), R.pick(['which', 'two', 'weus']));
    if (shape === 'choose') {
      var c = cpCase(R, L === 1 ? [['I', 'me']] : CASES);
      var wr = [showC(c.fr, c.wrong)].concat(L === 2 && (c.right === 'me' || c.right === 'I') ? [showC(c.fr, 'myself')] : []);
      return { q: q(para('Choose the correct pronoun.'), sent(c.fr)), a: mc(showC(c.fr, c.right), wr), hint: 'Cover the other person and read the pronoun alone.',
        steps: ['Take out the other person: ' + quote(show(c.test, c.right)), 'The pronoun is ' + (c.kind === 's' ? 'a subject' : c.kind === 'o' ? 'an object of the verb' : 'an object of a preposition') + ', so it is <i>' + c.right + '</i>.', quote(show(c.fr, c.right))] };
    }
    if (shape === 'weus') {
      var w = R.pick(WEUS), right = w[1] === 's' ? 'we' : 'us', wrong = w[1] === 's' ? 'us' : 'we', alone = fill(w[0], right).replace(' ' + w[2], '');
      return { q: q(para('Choose the correct pronoun.'), sent(w[0])), a: mc(showC(w[0], right), [showC(w[0], wrong)]), hint: 'Cover the word <i>' + w[2] + '</i> and read the pronoun alone.',
        steps: ['Take out <i>' + w[2] + '</i>: ' + quote(cap(alone)), 'So: ' + quote(show(w[0], right))] };
    }
    if (shape === 'two') {
      var obj = R.coin(), pr = R.pick([['he', 'him'], ['she', 'her'], ['they', 'them']]);
      if (!obj) return { q: q(para('Choose the correct pronouns.'), sent('___ built the model together.')), a: mc(cap(pr[0]) + ' and I', [cap(pr[1]) + ' and me', cap(pr[1]) + ' and I', 'Me and ' + pr[0]]),
        hint: 'Test each pronoun alone.', steps: ['“' + cap(pr[0]) + ' built it.” “I built it.” Both are subjects.', 'So: ' + quote(cap(pr[0]) + ' and I built the model together.')] };
      return { q: q(para('Choose the correct pronouns.'), sent('The coach picked ___ for the relay.')), a: mc(pr[1] + ' and me', [pr[0] + ' and I', pr[1] + ' and I', pr[0] + ' and me']),
        hint: 'Test each pronoun alone.', steps: ['“The coach picked ' + pr[1] + '.” “The coach picked me.” Both are objects.', 'So: ' + quote('The coach picked ' + pr[1] + ' and me for the relay.')] };
    }
    // which: the overcorrection trap
    var n2 = R.pick(NAMES), opts = R.pick([
      ['Between you and me, the movie was too long.', ['Between you and I, the movie was too long.', 'Between I and you, the movie was too long.'], 'between'],
      ['The tickets are for ' + n2 + ' and me.', ['The tickets are for ' + n2 + ' and I.', 'The tickets are for ' + n2 + ' and myself.'], 'for'],
      ['Grandpa told ' + n2 + ' and me a story.', ['Grandpa told ' + n2 + ' and I a story.', 'Grandpa told ' + n2 + ' and myself a story.'], 'told'],
      [cap(n2) + ' and I made dinner.', ['Me and ' + n2 + ' made dinner.', cap(n2) + ' and myself made dinner.'], 'subject']]);
    return { q: q(para('Which sentence is correct?')), a: mc(opts[0], opts[1]), hint: 'Take out the other person. Which pronoun sounds right alone?',
      steps: [opts[2] === 'subject' ? 'The pronoun is a subject: “I made dinner.”' : 'The pronoun is an object (' + (opts[2] === 'told' ? 'of the verb <i>told</i>' : 'of the preposition <i>' + opts[2] + '</i>') + '): “' + (opts[2] === 'between' ? 'between … me' : opts[2] === 'for' ? 'for me' : 'told me') + '.”', '<i>I</i> is only for subjects, and <i>myself</i> needs a subject <i>I</i> to point back to.', quote(opts[0])] };
  });

  /* ---------------------------------------------------------------- usage.who-whom */
  // [frame, answer, test sentence, level (1 plain, 2 clause, 3 tricky)]
  var WH = [
    ['___ called you last night?', 'who', '<b>He</b> called you.', 1], ['___ did you call last night?', 'whom', 'You called <b>him</b>.', 1], ['To ___ did you send the letter?', 'whom', 'You sent the letter to <b>him</b>.', 1],
    ['___ is knocking at the door?', 'who', '<b>He</b> is knocking.', 1], ['With ___ are you going to the game?', 'whom', 'You are going with <b>him</b>.', 1], ['___ did the coach choose as captain?', 'whom', 'The coach chose <b>him</b>.', 1],
    ['___ wants more pizza?', 'who', '<b>He</b> wants more pizza.', 1], ['For ___ is this present?', 'whom', 'This present is for <b>him</b>.', 1],
    ['The girl ___ won the race is my cousin.', 'who', '<b>She</b> won the race.', 2], ['The friend ___ I invited brought a cake.', 'whom', 'I invited <b>him</b>.', 2],
    ['The doctor ___ we visited was kind.', 'whom', 'We visited <b>him</b>.', 2], ['The boy ___ lives next door has a parrot.', 'who', '<b>He</b> lives next door.', 2],
    ['Our coach, ___ everyone admires, is retiring.', 'whom', 'Everyone admires <b>him</b>.', 2], ['The author ___ wrote this book grew up on a farm.', 'who', '<b>She</b> wrote this book.', 2],
    ['The student to ___ I lent my pen returned it.', 'whom', 'I lent my pen to <b>him</b>.', 2], ['The neighbor ___ helped us is moving away.', 'who', '<b>She</b> helped us.', 2],
    ['Give the prize to ___ finishes first.', 'whoever', '<b>He</b> finishes first. (The whole clause is the object of <i>to</i>.)', 3], ['Invite ___ you like.', 'whomever', 'You like <b>him</b>.', 3],
    ['___ do you think will win?', 'who', 'Set aside <i>do you think</i>: <b>he</b> will win.', 3], ['___ do you think we should ask?', 'whom', 'Set aside <i>do you think</i>: we should ask <b>him</b>.', 3],
    ['The player ___ I think scored the goal is my neighbor.', 'who', 'Set aside <i>I think</i>: <b>he</b> scored the goal.', 3], ['Tell ___ answers the phone that I called.', 'whoever', '<b>She</b> answers the phone. (The clause is the object of <i>tell</i>.)', 3]
  ];
  var WH_PAIR = { who: 'whom', whom: 'who', whoever: 'whomever', whomever: 'whoever' };
  var WH_N = ['neighbor', 'coach', 'artist', 'doctor', 'author', 'teacher', 'girl', 'boy', 'pilot', 'singer'];
  var WH_OBJ = { v: ['invited', 'visited', 'met', 'called', 'thanked', 'interviewed'], s: ['I', 'we', 'my sister', 'Dad', 'our class', 'everyone'] };
  var WH_SUB = ['helped us', 'called last night', 'painted the mural', 'fixed the gate', 'won the race', 'wrote this book', 'spoke at our school'];
  var WH_PRED = ['is moving away', 'won a prize', 'lives on our street', 'came to dinner', 'sent us a card', 'is very kind'];
  function whClause(R) { // a generated adjective clause: who (subject) or whom (object)
    var n = R.pick(WH_N), pred = R.pick(WH_PRED), obj = R.coin();
    if (obj) { var v = R.pick(WH_OBJ.v), sb = R.pick(WH_OBJ.s); return ['The ' + n + ' ___ ' + sb + ' ' + v + ' ' + pred + '.', 'whom', cap(sb) + ' ' + v + ' <b>him</b> (or her).', 2]; }
    var act = R.pick(WH_SUB); return ['The ' + n + ' ___ ' + act + ' ' + pred + '.', 'who', '<b>He</b> (or she) ' + act + '.', 2];
  }
  G('usage.who-whom', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'choose', R.pick(['choose', 'choose', 'job']), R.pick(['choose', 'choose', 'all']));
    var lv = ML.byLevel(ctx, 1, R.pick([1, 2, 2]), R.pick([2, 3, 3]));
    var t = lv === 2 && R.coin() ? whClause(R) : R.pick(WH.filter(function (x) { return x[3] === lv; }));
    var sub = /^who(ever)?$/.test(t[1]);
    if (shape === 'job') {
      return { q: q(para('In this sentence, does the missing word act as a subject or as an object?'), sent(t[0])), a: keep(['subject: who', 'object: whom'], sub ? 0 : 1),
        hint: 'Turn the clause or question into a statement with <i>he</i> or <i>him</i>.', steps: ['Test it: ' + t[2], sub ? '<i>He</i> fits: a subject, so <i>' + t[1] + '</i>.' : '<i>Him</i> fits: an object, so <i>' + t[1] + '</i>.'] };
    }
    if (shape === 'all') {
      var four = [t, whClause(R), R.pick(WH.filter(function (x) { return x[3] === 1; })), R.pick(WH.filter(function (x) { return x[3] === 3 && x !== t; }))];
      var items = R.shuffle(four.map(function (x, i) { var ok = i === 0 ? true : i === 1 ? false : R.coin(); return { text: show(x[0], ok ? x[1] : WH_PAIR[x[1]]), ok: ok, x: x }; }));
      return { q: q(para('Which sentences use <i>who</i>, <i>whom</i>, <i>whoever</i> or <i>whomever</i> correctly for formal writing? ' + ALL)), a: selectAll(items),
        hint: 'For each, find the word’s job in its own clause.', steps: items.map(function (it) { return quote(it.text) + (it.ok ? ' is correct. ' : ' should use <i>' + it.x[1] + '</i>. ') + 'Test: ' + it.x[2]; }) };
    }
    var right = showC(t[0], t[1]), wrong = showC(t[0], WH_PAIR[t[1]]), full = show(t[0], t[1]);
    return { q: q(para('In formal writing, which word is correct?'), sent(t[0])), a: mc(right, [wrong]),
      hint: 'Turn ' + (t[3] === 1 ? 'the question' : 'the clause') + ' into a statement with <i>he</i> or <i>him</i>.',
      steps: ['Test it: ' + t[2], sub ? '<i>He</i> fits, so the word is a subject: <i>' + t[1] + '</i>.' : '<i>Him</i> fits, so the word is an object: <i>' + t[1] + '</i>.', quote(full)] };
  });

  /* ---------------------------------------------------------------- usage.reflexive-pronouns */
  // [frame, right, wrongs, why]
  var RF = [
    ['I made the card ___.', 'myself', ['me'], 'Emphasis: <i>myself</i> points back to the subject <i>I</i>.'],
    ['Please send the photos to Sam or ___.', 'me', ['myself', 'I'], 'There is no <i>I</i> in the sentence for <i>myself</i> to point back to, and the pronoun is an object of <i>to</i>.'],
    ['Sam and ___ will lead the hike.', 'I', ['myself', 'me'], 'Take out Sam: “I will lead.” The pronoun is a subject.'],
    ['The twins built the fort by ___.', 'themselves', ['theirselves'], 'The -self word points back to <i>the twins</i>. Standard written English uses <i>themselves</i>.'],
    ['He taught ___ to play guitar.', 'himself', ['hisself'], '<i>Himself</i> points back to the subject <i>he</i>. Standard written English uses <i>himself</i>.'],
    ['I hurt ___ on the slide.', 'myself', ['me'], 'The subject acts on itself, so use <i>myself</i>.'],
    ['We treated ___ to ice cream.', 'ourselves', ['us'], 'The subject <i>we</i> acts on itself: <i>ourselves</i>.'],
    ['They introduced ___ to the new neighbor.', 'themselves', ['theirselves', 'theirself'], 'The -self word points back to <i>they</i>: <i>themselves</i>.'],
    ['He bought ___ a new hat.', 'himself', ['hisself'], 'Standard written English uses <i>himself</i>.'],
    ['Mom and ___ went to the store.', 'I', ['myself', 'me'], 'Take out Mom: “I went.” The pronoun is a subject.'],
    ['The teacher gave Lena and ___ a prize.', 'me', ['myself', 'I'], 'Take out Lena: “gave me a prize.” Nothing for <i>myself</i> to point back to.'],
    ['Call Dad or ___ when you get there.', 'me', ['myself', 'I'], 'The subject is an understood <i>you</i>; the pronoun is an object of <i>call</i>.'],
    ['The prize went to Mia and ___.', 'me', ['myself', 'I'], 'Take out Mia: “went to me.”'],
    ['You should be proud of ___ for finishing.', 'yourself', ['you'], 'One person: <i>yourself</i> points back to <i>you</i>.']
  ];
  G('usage.reflexive-pronouns', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'choose', 'choose', R.pick(['which', 'yesno']));
    if (shape === 'choose') {
      var t = R.pick(RF), wrong = L === 1 ? [t[2][0]] : t[2];
      return { q: q(para('Choose the pronoun that fits standard written English.'), sent(t[0])), a: mc(showC(t[0], t[1]), wrong.map(function (w) { return showC(t[0], w); })),
        hint: 'Is there a subject earlier in the sentence for a -self word to point back to?', steps: [t[3], quote(show(t[0], t[1]))] };
    }
    var good = RF.filter(function (x) { return /self|selves/.test(x[1]); }), bad = RF.filter(function (x) { return x[2][0] === 'myself'; });
    if (shape === 'yesno') {
      var ok = R.coin(), t2 = ok ? R.pick(good) : R.pick(bad), s = ok ? show(t2[0], t2[1]) : show(t2[0], 'myself');
      return { q: q(para('Is the -self word used correctly here?'), sent(s)), a: yesno(ok), hint: 'Does the -self word point back to the subject, or add emphasis?',
        steps: ok ? [t2[3], 'So yes.'] : ['<i>Myself</i> has no subject <i>I</i> to point back to here.', 'It should be <i>' + t2[1] + '</i>: ' + quote(show(t2[0], t2[1]))] };
    }
    var g = R.pick(good), b = R.sample(bad, 2);
    var right = show(g[0], g[1]), w1 = show(b[0][0], 'myself'), w2 = show(b[1][0], 'myself');
    return { q: q(para('Which sentence uses a -self word correctly?')), a: mc(right, [w1, w2]), hint: 'A -self word needs a subject to point back to.',
      steps: [quote(right) + ': ' + g[3], quote(w1) + ' should use <i>' + b[0][1] + '</i>.', quote(w2) + ' should use <i>' + b[1][1] + '</i>.'] };
  });

  /* ================================================================ UNIT 3: VERB TENSES, VOICE AND MOOD */
  // regular verbs: base, past (hand-checked spelling), object
  var REG = [['walk', 'walked', 'to the library'], ['play', 'played', 'soccer'], ['carry', 'carried', 'the groceries'], ['stop', 'stopped', 'at the store'], ['hope', 'hoped', 'for snow'],
    ['plan', 'planned', 'a picnic'], ['try', 'tried', 'a new recipe'], ['clean', 'cleaned', 'the garage'], ['paint', 'painted', 'the fence'], ['bake', 'baked', 'bread'],
    ['study', 'studied', 'for the test'], ['hurry', 'hurried', 'to the bus'], ['shop', 'shopped', 'for shoes'], ['wash', 'washed', 'the dishes'], ['watch', 'watched', 'the birds'],
    ['fix', 'fixed', 'the gate'], ['cook', 'cooked', 'dinner'], ['dance', 'danced', 'at the party'], ['clap', 'clapped', 'for the band'], ['cry', 'cried', 'at the sad part'],
    ['jog', 'jogged', 'around the track'], ['stay', 'stayed', 'up late'], ['visit', 'visited', 'Grandma'], ['drop', 'dropped', 'the ball']];
  var SUBJS = [['I', 'I'], ['we', 2], ['they', 2], ['she', 1], ['he', 1], ['my brother', 1], ['the twins', 2], ['our class', 1]];
  var TIMES = { past: ['Yesterday', 'Last week', 'Two days ago', 'Last summer', 'On Monday'], present: ['Every day', 'Usually', 'Every Saturday', 'Most mornings', 'Each week'], future: ['Tomorrow', 'Next week', 'Next summer', 'Later this year', 'Next Friday'] };
  function simpleForm(v, past, time, n) { return time === 'past' ? past : time === 'future' ? 'will ' + v : (n === 1 ? s3(v) : v); }
  G('usage.simple-tenses', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'choose', R.pick(['choose', 'name', 'timeline']), R.pick(['spell', 'spell', 'choose']));
    var v = R.pick(REG), s = R.pick(SUBJS), time = R.pick(['past', 'present', 'future']), tw = R.pick(TIMES[time]);
    var forms = { past: v[1], present: s[1] === 1 ? s3(v[0]) : v[0], future: 'will ' + v[0] }, right = forms[time];
    var frame = tw + ', ' + s[0] + ' ___ ' + v[2] + '.', full = tw + ', ' + s[0] + ' ' + right + ' ' + v[2] + '.';
    var names = { past: 'simple past', present: 'simple present', future: 'simple future' };
    if (shape === 'choose') {
      var wrong = ['past', 'present', 'future'].filter(function (x) { return x !== time; }).map(function (x) { return forms[x]; });
      return { q: q(para('Choose the verb that fits the time.'), sent(frame + ' <span style="font-weight:normal">(' + v[0] + ')</span>')), a: mc(right, wrong),
        hint: 'Look at the time words at the start.', steps: ['<i>' + tw + '</i> points to the ' + (time === 'present' ? 'present: a habit' : time) + '.', 'Use the ' + names[time] + ': <i>' + right + '</i>.', quote(full)] };
    }
    if (shape === 'name') {
      return { q: q(para('Which tense is the verb in this sentence?'), sent(full)), a: keep(['simple past', 'simple present', 'simple future'], ['past', 'present', 'future'].indexOf(time)),
        hint: 'Does the verb end in -ed, use <i>will</i>, or neither?', steps: ['The verb is <i>' + right + '</i>.', time === 'past' ? 'It is the -ed form: simple past.' : time === 'future' ? '<i>Will</i> + the verb: simple future.' : 'The plain or -s form: simple present.'] };
    }
    if (shape === 'timeline') {
      var subj = s[0] === 'I' ? 'I' : s[1] === 1 ? 'she' : 'they';
      return { q: q(para('The timeline shows when the action happens. Which verb phrase matches it?')), a: mc(forms[time], ['past', 'present', 'future'].filter(function (x) { return x !== time; }).map(function (x) { return forms[x]; })),
        viz: { name: 'wr-tense', opts: { verb: v[0], subject: subj, tense: time, rest: v[2], pick: false, quiet: true, interactive: false } },
        hint: 'Is the mark before now, at now, or after now?', steps: ['The timeline marks the ' + time + '.', 'The ' + names[time] + ' is <i>' + forms[time] + '</i>.'] };
    }
    // spell: type the simple past
    var t = R.pick(REG);
    var rule = /ied$/.test(t[1]) ? 'It ends in a consonant + y: change y to i and add -ed.' : /([a-z])\1ed$/.test(t[1]) ? 'One vowel and one consonant at the end: double the consonant, then add -ed.' : /e$/.test(t[0]) ? 'It ends in e: just add -d.' : /y$/.test(t[0]) ? 'A vowel + y: just add -ed.' : 'Just add -ed.';
    return { q: q(para('Type the simple past of the verb.'), sent(t[0])), a: text(t[1]), hint: 'Check the ending: e, y, or one vowel and one consonant?',
      steps: [rule, '<i>' + t[0] + '</i> → <i>' + t[1] + '</i>'] };
  });

  /* ---------------------------------------------------------------- usage.irregular-verbs */
  // [base, past, participle, object]
  var IRR = [['go', 'went', 'gone', 'to the fair'], ['see', 'saw', 'seen', 'a hawk'], ['do', 'did', 'done', 'the dishes'], ['eat', 'ate', 'eaten', 'the last pear'],
    ['write', 'wrote', 'written', 'a letter'], ['take', 'took', 'taken', 'the early bus'], ['begin', 'began', 'begun', 'the puzzle'], ['swim', 'swam', 'swum', 'across the pool'],
    ['ring', 'rang', 'rung', 'the bell'], ['give', 'gave', 'given', 'the dog a bath'], ['ride', 'rode', 'ridden', 'the train'], ['speak', 'spoke', 'spoken', 'to the class'],
    ['break', 'broke', 'broken', 'the record'], ['choose', 'chose', 'chosen', 'the blue one'], ['fly', 'flew', 'flown', 'a kite'], ['know', 'knew', 'known', 'the answer'],
    ['grow', 'grew', 'grown', 'tomatoes'], ['throw', 'threw', 'thrown', 'the ball'], ['draw', 'drew', 'drawn', 'a map'], ['sing', 'sang', 'sung', 'the song'],
    ['drink', 'drank', 'drunk', 'some water'], ['drive', 'drove', 'driven', 'to the lake'], ['hide', 'hid', 'hidden', 'the gift'], ['wear', 'wore', 'worn', 'a hat'],
    ['steal', 'stole', 'stolen', 'second base'], ['blow', 'blew', 'blown', 'out the candles'], ['forget', 'forgot', 'forgotten', 'the password'], ['tear', 'tore', 'torn', 'the paper'],
    ['shake', 'shook', 'shaken', 'the jar'], ['freeze', 'froze', 'frozen', 'the leftovers'], ['come', 'came', 'come', 'home early'], ['run', 'ran', 'run', 'two miles']];
  // past = participle: [base, past/participle, object]
  var IRR2 = [['bring', 'brought', 'snacks'], ['buy', 'bought', 'a new bike'], ['think', 'thought', 'about the question'], ['catch', 'caught', 'the ball'],
    ['teach', 'taught', 'the puppy a trick'], ['find', 'found', 'a shell'], ['keep', 'kept', 'the receipt'], ['sleep', 'slept', 'late'], ['leave', 'left', 'early'],
    ['tell', 'told', 'a story'], ['build', 'built', 'a fort'], ['send', 'sent', 'a postcard'], ['win', 'won', 'the game'], ['dig', 'dug', 'a hole'], ['feed', 'fed', 'the cat'],
    ['hear', 'heard', 'the thunder'], ['sell', 'sold', 'lemonade'], ['lose', 'lost', 'a mitten'], ['make', 'made', 'pancakes'], ['hold', 'held', 'the door']];
  var IRR_SUBJ = [['I', 'have'], ['we', 'have'], ['they', 'have'], ['she', 'has'], ['he', 'has'], ['my sister', 'has'], ['the twins', 'have']];
  function naive(v) { return /e$/.test(v) ? v + 'd' : v + 'ed'; }
  G('usage.irregular-verbs', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'past', R.pick(['past', 'part', 'same']), R.pick(['type', 'type', 'which']));
    var s = R.pick(IRR_SUBJ), tw = R.pick(['Yesterday', 'Last night', 'On Saturday', 'Last week']);
    if (shape === 'past' || shape === 'part') {
      var t = R.pick(IRR.filter(function (x) { return x[1] !== x[2]; })), part = shape === 'part';
      var frame = part ? cap(s[0]) + ' ' + s[1] + ' ___ ' + t[3] + '.' : tw + ', ' + s[0] + ' ___ ' + t[3] + '.';
      var right = part ? t[2] : t[1], wrong = part ? [t[1], naive(t[0])] : [t[2], naive(t[0])];
      if (L === 1) wrong = [wrong[0]];
      return { q: q(para('Choose the standard written form of <i>' + t[0] + '</i>.'), sent(frame)), a: mc(right, wrong),
        hint: part ? 'There is a helper (<i>' + s[1] + '</i>), so you need the past participle.' : 'There is no helper, so you need the past.',
        steps: ['The principal parts: ' + t[0] + ', ' + t[1] + ', ' + t[2] + '.', part ? 'After <i>' + s[1] + '</i>, use the past participle: <i>' + t[2] + '</i>.' : 'With no helper, use the past: <i>' + t[1] + '</i>.', quote(fill(frame, right))] };
    }
    if (shape === 'same') {
      var u = R.pick(IRR2), fr = tw + ', ' + s[0] + ' ___ ' + u[2] + '.';
      return { q: q(para('Choose the standard written form of <i>' + u[0] + '</i>.'), sent(fr)), a: mc(u[1], [naive(u[0]), u[0]]), hint: 'This verb is irregular: it doesn’t take -ed.',
        steps: ['<i>' + u[0] + '</i> is irregular: ' + u[0] + ', ' + u[1] + ', ' + u[1] + '.', quote(fill(fr, u[1]))] };
    }
    if (shape === 'type') {
      var w = R.pick(IRR.concat(IRR2.map(function (x) { return [x[0], x[1], x[1], x[2]]; }))), helper = R.coin();
      var fr2 = helper ? cap(s[0]) + ' ' + s[1] + ' ___ ' + w[3] + '.' : tw + ', ' + s[0] + ' ___ ' + w[3] + '.', ans = helper ? w[2] : w[1];
      return { q: q(para('Type the correct form of <i>' + w[0] + '</i>.'), sent(fr2)), a: text(ans), hint: helper ? 'After <i>' + s[1] + '</i>, use the past participle.' : 'No helper: use the past.',
        steps: ['The principal parts: ' + w[0] + ', ' + w[1] + ', ' + w[2] + '.', helper ? 'After a helper, use the past participle.' : 'With no helper, use the past.', quote(fill(fr2, ans))] };
    }
    // which: standard written vs everyday speech forms
    var x = R.pick([['see', 'saw', 'seen', 'the eclipse'], ['do', 'did', 'done', 'my homework'], ['go', 'went', 'gone', 'home'], ['come', 'came', 'come', 'to the party'], ['run', 'ran', 'run', 'the whole way']]);
    var good = cap(s[0]) + ' ' + x[1] + ' ' + x[3] + ' ' + low(tw) + '.', bad = cap(s[0]) + ' ' + x[2] + ' ' + x[3] + ' ' + low(tw) + '.', bad2 = cap(s[0]) + ' ' + s[1] + ' ' + x[1] + ' ' + x[3] + '.';
    if (x[0] === 'come' || x[0] === 'run') bad = cap(s[0]) + ' ' + naive(x[0]) + ' ' + x[3] + ' ' + low(tw) + '.';
    return { q: q(para('Which sentence uses standard written English?')), a: mc(good, [bad, bad2]), hint: 'Past alone; past participle only after <i>has</i>, <i>have</i> or <i>had</i>.',
      steps: ['The principal parts: ' + x[0] + ', ' + x[1] + ', ' + x[2] + '.', quote(good) + ' uses the past with no helper.', quote(bad2) + ' needs the participle after <i>' + s[1] + '</i>: <i>' + s[1] + ' ' + x[2] + '</i>.'] };
  });

  /* ---------------------------------------------------------------- usage.progressive-tenses */
  // [base, -ing, object]
  var PRG = [['read', 'reading', 'a book'], ['play', 'playing', 'chess'], ['swim', 'swimming', 'in the lake'], ['bake', 'baking', 'cookies'], ['paint', 'painting', 'the fence'],
    ['run', 'running', 'around the track'], ['ride', 'riding', 'a horse'], ['watch', 'watching', 'a movie'], ['write', 'writing', 'a story'], ['dance', 'dancing', 'in the kitchen'],
    ['study', 'studying', 'for the test'], ['cook', 'cooking', 'dinner'], ['practice', 'practicing', 'the piano'], ['plan', 'planning', 'a party'], ['shop', 'shopping', 'for shoes'], ['wait', 'waiting', 'for the bus']];
  var PSUBJ = [['I', 'I'], ['she', 1], ['he', 1], ['we', 2], ['they', 2], ['my brother', 1], ['the twins', 2]];
  var PTIMES = { present: ['Right now', 'At the moment', 'Look! Right now'], past: ['At eight last night', 'When the phone rang', 'All afternoon yesterday'], future: ['At noon tomorrow', 'This time next week', 'When you arrive tonight'] };
  function beP(time, n) { return time === 'future' ? 'will be' : time === 'past' ? pastBe(n) : pres('be', n); }
  var STATE = [['know', 'the answer'], ['believe', 'your story'], ['own', 'a red bike'], ['need', 'a new pencil'], ['want', 'a snack'], ['belong', 'to the chess club'], ['seem', 'tired today'], ['like', 'mint ice cream']];
  G('usage.progressive-tenses', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'choose', R.pick(['choose', 'state', 'spell']), R.pick(['type', 'type', 'state']));
    var v = R.pick(PRG), s = R.pick(PSUBJ), time = R.pick(['present', 'past', 'future']), tw = R.pick(PTIMES[time]);
    var right = beP(time, s[1]) + ' ' + v[1], subj = tw === 'Look! Right now' ? s[0] : s[0];
    var frame = tw + ', ' + subj + ' ___ ' + v[2] + '.';
    var names = { present: 'present progressive', past: 'past progressive', future: 'future progressive' };
    if (shape === 'choose') {
      var wrongBe = time === 'future' ? 'will ' + v[1] : (time === 'past' ? pastBe(s[1] === 1 || s[1] === 'I' ? 2 : 1) : pres('be', s[1] === 1 ? 2 : 1)) + ' ' + v[1];
      var wrong = L === 1 ? [time === 'present' ? (s[1] === 1 ? s3(v[0]) : v[0]) : v[1]] : [wrongBe, v[1]];
      return { q: q(para('Choose the verb that shows an action in progress.'), sent(frame + ' <span style="font-weight:normal">(' + v[0] + ')</span>')), a: mc(right, wrong),
        hint: 'A form of <i>be</i> + the -ing verb. Which form of <i>be</i> fits the time and the subject?',
        steps: ['<i>' + tw + '</i>: the action is in progress in the ' + time + '.', 'The ' + names[time] + ' is ' + (time === 'future' ? '<i>will be</i>' : 'a ' + time + ' form of <i>be</i>') + ' + <i>' + v[1] + '</i>.', quote(fill(frame, right))] };
    }
    if (shape === 'state') {
      var st = R.pick(STATE), n = s[1], simple = n === 1 ? s3(st[0]) : st[0], prog = pres('be', n) + ' ' + (st[0] === 'believe' ? 'believing' : st[0] === 'like' ? 'liking' : st[0] + 'ing');
      var sentence = cap(s[0]) + ' ___ ' + st[1] + '.';
      return { q: q(para('Which verb fits best?'), sent(sentence)), a: mc(simple, [prog]), hint: 'Is this an action in progress, or a state?',
        steps: ['<i>' + cap(st[0]) + '</i> names a state, not an action in progress.', 'States usually take the simple form: ' + quote(fill(sentence, simple))] };
    }
    if (shape === 'spell') {
      var w = R.pick(PRG.filter(function (x) { return /(mm|nn|pp|tt|ing)$/.test(x[1]) && x[0] !== x[1].replace(/ing$/, ''); }));
      var bad = w[0] + 'ing';
      return { q: q(para('Which is the correct -ing spelling of <i>' + w[0] + '</i>?')), a: mc(w[1], [bad]),
        hint: 'Does it end in a silent e, or in one vowel and one consonant?',
        steps: [/e$/.test(w[0]) ? 'It ends in a silent e: drop the e, then add -ing.' : 'One vowel and one consonant at the end: double the consonant, then add -ing.', '<i>' + w[0] + '</i> → <i>' + w[1] + '</i>'] };
    }
    return { q: q(para('Type the ' + names[time] + ' of <i>' + v[0] + '</i>.'), sent(frame)), a: text(right), hint: 'Use ' + (time === 'future' ? '<i>will be</i>' : 'the ' + time + ' form of <i>be</i> that fits the subject') + ', then the -ing verb.',
      steps: ['The subject is <i>' + s[0] + '</i>; the time is the ' + time + '.', 'The ' + names[time] + ': <i>' + right + '</i>.', quote(fill(frame, right))] };
  });

  /* ---------------------------------------------------------------- usage.perfect-tenses */
  // [base, past, participle, object]
  var PF = [['see', 'saw', 'seen', 'that movie'], ['visit', 'visited', 'visited', 'the museum'], ['eat', 'ate', 'eaten', 'at that diner'], ['read', 'read', 'read', 'that book'],
    ['ride', 'rode', 'ridden', 'the roller coaster'], ['climb', 'climbed', 'climbed', 'that hill'], ['play', 'played', 'played', 'that game'], ['write', 'wrote', 'written', 'to my pen pal'],
    ['swim', 'swam', 'swum', 'in that lake'], ['hear', 'heard', 'heard', 'that song']];
  var FIN = ['yesterday', 'last night', 'two days ago', 'last summer', 'on Monday'], UPTO = ['twice', 'three times', 'many times', 'once before'];
  // past perfect: [opening, subject, verb parts, rest]
  var PP = [['By the time we reached the station,', 'the train', ['leave', 'left'], ''], ['When we got to the theater,', 'the movie', ['start', 'started'], ''],
    ['By the time Dad came home,', 'we', ['eat', 'eaten'], 'dinner'], ['When I opened the oven,', 'the cookies', ['burn', 'burned'], ''],
    ['By the time the rain stopped,', 'the game', ['end', 'ended'], ''], ['When the firefighters arrived,', 'everyone', ['leave', 'left'], 'the building'],
    ['By the time I found my ticket,', 'the bus', ['go', 'gone'], ''], ['When we checked the mailbox,', 'the letter', ['come', 'come'], '']];
  // future perfect: [opening, subject, verb parts, rest]
  var FP = [['By next Friday,', 'I', ['finish', 'finished'], 'my project'], ['By June,', 'she', ['read', 'read'], 'ten books'], ['By the end of the day,', 'we', ['walk', 'walked'], 'five miles'],
    ['By the time you wake up,', 'Dad', ['make', 'made'], 'breakfast'], ['By next year,', 'the twins', ['learn', 'learned'], 'to swim'], ['By noon,', 'the snow', ['melt', 'melted'], '']];
  function wrap(s) { return s.replace(/\s+\./, '.').replace(/\s+/g, ' '); }
  G('usage.perfect-tenses', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'fin', R.pick(['fin', 'pastperf', 'futperf']), R.pick(['type', 'meaning', 'pastperf']));
    var s = R.pick([['I', 'have'], ['we', 'have'], ['she', 'has'], ['they', 'have'], ['my cousin', 'has']]);
    if (shape === 'fin') {
      var v = R.pick(PF), fin = R.coin(), tw = fin ? R.pick(FIN) : R.pick(UPTO);
      var frame = cap(s[0]) + ' ___ ' + v[3] + ' ' + tw + '.', right = fin ? v[1] : s[1] + ' ' + v[2], wrong = fin ? s[1] + ' ' + v[2] : v[1];
      if (fin === false && v[1] === v[2]) wrong = v[1];
      return { q: q(para('Choose the verb that fits the time words.'), sent(frame + ' <span style="font-weight:normal">(' + v[0] + ')</span>')), a: mc(right, [wrong]),
        hint: 'Does the sentence name a finished time?',
        steps: fin ? ['<i>' + tw + '</i> names a finished time.', 'A finished time takes the simple past: <i>' + v[1] + '</i>.', quote(fill(frame, right))] : ['<i>' + tw + '</i> counts up to now, with no finished time named.', 'Use the present perfect: <i>' + s[1] + ' ' + v[2] + '</i>.', quote(fill(frame, right))] };
    }
    if (shape === 'pastperf' || (shape === 'type' && R.coin())) {
      var p = R.pick(PP), right2 = 'had ' + p[2][1], fr = wrap(p[0] + ' ' + p[1] + ' ___ ' + p[3] + '.');
      var simplePast = { leave: 'left', start: 'started', eat: 'ate', burn: 'burned', end: 'ended', go: 'went', come: 'came' }[p[2][0]];
      var hasHave = (/^(we|the cookies)$/.test(p[1]) ? 'have ' : 'has ') + p[2][1];
      if (shape === 'type') return { q: q(para('Type the past perfect of <i>' + p[2][0] + '</i>.'), sent(fr)), a: text(right2), hint: '<i>had</i> + the past participle.',
        steps: ['Two past events; this one happened first.', 'The past perfect: <i>had</i> + <i>' + p[2][1] + '</i>.', quote(fill(fr, right2))] };
      return { q: q(para('Choose the verb that shows this happened first.'), sent(fr + ' <span style="font-weight:normal">(' + p[2][0] + ')</span>')), a: mc(right2, [simplePast, hasHave]),
        hint: 'Two past events. Which one came first?', steps: ['Both events are in the past; this one happened before the other.', 'The past perfect shows that: <i>had ' + p[2][1] + '</i>.', quote(fill(fr, right2))] };
    }
    if (shape === 'futperf' || shape === 'type') {
      var f = R.pick(FP), right3 = 'will have ' + f[2][1], fr3 = wrap(f[0] + ' ' + f[1] + ' ___ ' + f[3] + '.');
      if (shape === 'type') return { q: q(para('Type the future perfect of <i>' + f[2][0] + '</i>.'), sent(fr3)), a: text(right3), hint: '<i>will have</i> + the past participle.',
        steps: ['It will be finished before a future time.', 'The future perfect: <i>will have ' + f[2][1] + '</i>.', quote(fill(fr3, right3))] };
      return { q: q(para('Choose the verb that shows this will be finished before a future time.'), sent(fr3 + ' <span style="font-weight:normal">(' + f[2][0] + ')</span>')),
        a: mc(right3, ['will ' + f[2][0], (f[1] === 'I' || f[1] === 'we' || f[1] === 'the twins' ? 'have ' : 'has ') + f[2][1]]), hint: '<i>By</i> a future time: the action will be done before then.',
        steps: ['<i>' + f[0].replace(/,$/, '') + '</i> names a future point.', 'Finished before it: <i>will have ' + f[2][1] + '</i>.', quote(fill(fr3, right3))] };
    }
    // meaning: which sentence shows we missed the beginning?
    var m = R.pick([['we arrived', 'the movie', 'started', 'had started', 'we missed the beginning of the movie'], ['we reached the station', 'the train', 'left', 'had left', 'the train was already gone when we got there'],
      ['I got to the party', 'the cake', 'was cut', 'had been cut', 'the cake was cut before I arrived'], ['Mom came home', 'my brother', 'cleaned his room', 'had cleaned his room', 'the room was clean before Mom came home']]);
    var a1 = 'When ' + m[0] + ', ' + m[1] + ' ' + m[3] + '.', a2 = 'When ' + m[0] + ', ' + m[1] + ' ' + m[2] + '.';
    return { q: q(para('Which sentence shows that ' + m[4] + '?')), a: mc(a1, [a2]), hint: 'Which verb looks back to an earlier time?',
      steps: [quote(a1) + ': the past perfect puts that event first.', quote(a2) + ': the simple past suggests it happened at the same moment, or right after.'] };
  });

  /* ---------------------------------------------------------------- usage.tense-shifts */
  // stories: each verb [past, present]; text with {0} {1} {2}
  var STORY = [
    ['Mia {0} the door. She {1} a puppy on the step. It {2} its tail.', [['opened', 'opens', 'open'], ['saw', 'sees', 'see'], ['wagged', 'wags', 'wag']]],
    ['We {0} to the top of the hill. Then we {1} our lunch. A hawk {2} above us.', [['hiked', 'hike', 'hike'], ['ate', 'eat', 'eat'], ['circled', 'circles', 'circle']]],
    ['The lights {0} out. Someone {1} my arm. I {2} so loudly that the dog barked.', [['went', 'go', 'go'], ['grabbed', 'grabs', 'grab'], ['yelled', 'yell', 'yell']]],
    ['The bus {0} suddenly. Everyone {1} up. A deer {2} in the road.', [['stopped', 'stops', 'stop'], ['looked', 'looks', 'look'], ['stood', 'stands', 'stand']]],
    ['Leo {0} the ball hard. It {1} over the fence. Our neighbor {2} it back.', [['kicked', 'kicks', 'kick'], ['flew', 'flies', 'fly'], ['tossed', 'tosses', 'toss']]],
    ['The team {0} all week. On Saturday they {1} the game. The crowd {2} for ten minutes.', [['practiced', 'practices', 'practice'], ['won', 'win', 'win'], ['cheered', 'cheers', 'cheer']]],
    ['I {0} my lunch box. A note {1} out. It {2} “Good luck!”', [['opened', 'open', 'open'], ['fell', 'falls', 'fall'], ['said', 'says', 'say']]],
    ['Grandpa {0} tomatoes in May. Every morning he {1} them. By August they {2} huge.', [['planted', 'plants', 'plant'], ['watered', 'waters', 'water'], ['were', 'are', 'be']]]
  ];
  var SHIFT_OK = [['Last year I lived in Ohio, but now I live in Texas.', true, 'The time really changes: last year, then now.'], ['My grandmother grew up on a farm, and she still loves fresh corn.', true, '<i>Still</i> moves to the present: the time changes.'],
    ['In the fable, the fox flatters the crow, and the crow drops the cheese.', true, 'Writing about a story uses the present (the literary present), and it stays there.'], ['Yesterday we visited the zoo, and tomorrow we will visit the museum.', true, 'Yesterday, then tomorrow: the time really changes.'],
    ['We hiked to the top, and then we eat lunch.', false, 'The lunch happened then too, so <i>eat</i> should be <i>ate</i>.'], ['The bell rang, and everyone runs outside.', false, 'Same moment, so <i>runs</i> should be <i>ran</i>.'],
    ['She opened the box and finds a kitten inside.', false, '<i>Finds</i> should be <i>found</i>, like <i>opened</i>.'], ['The storm knocked out the power, so we light candles.', false, '<i>Light</i> should be <i>lit</i>: the same night.']];
  function story(R, nVerbs) {
    var s = R.pick(STORY), shift = R.int(1, nVerbs - 1), words = s[1].slice(0, 3);
    var txt = s[0];
    words.forEach(function (w, i) { txt = txt.replace('{' + i + '}', i === shift ? w[1] : w[0]); });
    if (nVerbs === 2) txt = txt.split('. ').slice(0, 2).join('. ').replace(/([^.!”])$/, '$1.');
    return { txt: txt, shift: shift, words: words };
  }
  G('usage.tense-shifts', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'find2', R.pick(['find3', 'fix']), R.pick(['ok', 'ok', 'fix']));
    if (shape === 'find2' || shape === 'find3') {
      var st = story(R, shape === 'find2' ? 2 : 3), shown = st.words.slice(0, shape === 'find2' ? 2 : 3).map(function (w, i) { return i === st.shift ? w[1] : w[0]; });
      return { q: q(para('The story is told in the past. Which verb shifts into the present for no reason?'), sent(st.txt)), a: mc(shown[st.shift], shown.filter(function (w, i) { return i !== st.shift; })),
        hint: 'Underline each verb. Which one is not in the past?', steps: ['The other verbs are in the past: ' + shown.filter(function (w, i) { return i !== st.shift; }).map(function (w) { return '<i>' + w + '</i>'; }).join(', ') + '.', '<i>' + shown[st.shift] + '</i> is in the present, but the time didn’t change.', 'Fix: <i>' + st.words[st.shift][0] + '</i>.'] };
    }
    if (shape === 'fix') {
      var st2 = story(R, 3), bad = st2.words[st2.shift][1], good = st2.words[st2.shift][0];
      var w = st2.words[st2.shift];
      return { q: q(para('One verb shifts tense for no reason. Which should replace <i>' + bad + '</i>?'), sent(st2.txt)), a: mc(good, [bad, 'will ' + w[2]]),
        hint: 'What tense are the other verbs in?', steps: ['The story is in the past.', '<i>' + bad + '</i> slips into the present.', 'Use the past: <i>' + good + '</i>.'] };
    }
    var x = R.pick(SHIFT_OK);
    return { q: q(para('Is the tense used correctly all through this sentence?'), sent(x[0])), a: yesno(x[1]), hint: 'Does the time really change, or only the tense?',
      steps: [x[2], x[1] ? 'So yes, it is correct.' : 'So no: the tense shifts when the time didn’t change.'] };
  });

  /* ---------------------------------------------------------------- usage.lie-lay */
  // [frame, right, wrongs, why, level]
  var LL = [
    ['Every afternoon the dog ___ on the porch.', 'lies', ['lays'], 'The dog is resting; nothing is being put down. No object: <i>lie</i>, present <i>lies</i>.', 1],
    ['Please ___ the map on the table.', 'lay', ['lie'], 'You put something down: the map. That is an object, so use <i>lay</i>.', 1],
    ['Please ___ here.', 'sit', ['set'], 'Nobody is putting anything anywhere. No object: <i>sit</i>.', 1],
    ['___ the vase on the shelf.', 'Set', ['Sit'], 'You put something somewhere: the vase. Use <i>set</i>.', 1],
    ['The sun ___ at six.', 'rises', ['raises'], 'The sun goes up by itself. No object: <i>rise</i>, present <i>rises</i>.', 1],
    ['___ your hand to answer.', 'Raise', ['Rise'], 'You lift something: your hand. Use <i>raise</i>.', 1],
    ['Yesterday I ___ down for a nap.', 'lay', ['laid', 'lied'], 'No object, so the verb is <i>lie</i>. Its past is <i>lay</i>.', 2],
    ['She ___ the baby in the crib last night.', 'laid', ['lay', 'lied'], 'She put something down: the baby. The verb is <i>lay</i>; its past is <i>laid</i>.', 2],
    ['The book has ___ on the shelf for weeks.', 'lain', ['laid', 'lay'], 'No object: the verb is <i>lie</i>. After <i>has</i>, use its past participle, <i>lain</i>.', 2],
    ['The cat is ___ in the sun.', 'lying', ['laying'], 'The cat is resting; nothing is being put down: <i>lie</i>, -ing form <i>lying</i>.', 2],
    ['The hens are ___ eggs.', 'laying', ['lying'], 'The hens are putting something down: eggs. <i>Lay</i>, -ing form <i>laying</i>.', 2],
    ['We ___ in the front row yesterday.', 'sat', ['set', 'sit'], 'No object: <i>sit</i>. Its past is <i>sat</i>.', 2],
    ['He ___ the table for dinner last night.', 'set', ['sat', 'sit'], 'He put things on the table: an object. <i>Set</i> stays <i>set</i> in the past.', 2],
    ['The bread ___ in the oven yesterday.', 'rose', ['raised', 'rised'], 'The bread went up by itself: <i>rise</i>, past <i>rose</i>.', 2],
    ['The river has ___ after the rain.', 'risen', ['raised', 'rose'], 'The river goes up by itself: <i>rise</i>. After <i>has</i>, use <i>risen</i>.', 2],
    ['They ___ the flag at dawn yesterday.', 'raised', ['rose', 'risen'], 'They lifted something: the flag. <i>Raise</i>, past <i>raised</i>.', 2],
    ['I ___ my keys on the counter every night.', 'lay', ['lie'], 'You put something down: your keys. <i>Lay</i>, present <i>lay</i> after <i>I</i>.', 2],
    ['___ down and rest for a while.', 'Lie', ['Lay'], 'Nothing is being put down. No object: <i>lie</i>.', 2]
  ];
  // [verb, meaning, past, past participle, -ing]
  var LLP = [['lie', 'to rest or recline', 'lay', 'lain', 'lying'], ['lay', 'to put something down', 'laid', 'laid', 'laying'], ['sit', 'to be seated', 'sat', 'sat', 'sitting'],
    ['set', 'to put something somewhere', 'set', 'set', 'setting'], ['rise', 'to go up', 'rose', 'risen', 'rising'], ['raise', 'to lift something', 'raised', 'raised', 'raising']];
  G('usage.lie-lay', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'choose', R.pick(['choose', 'choose', 'parts']), R.pick(['yesno', 'object', 'choose', 'parts']));
    if (shape === 'parts') {
      var pv = R.pick(LLP), k = R.pick([2, 3, 4]), kn = { 2: 'past tense', 3: 'past participle (after has, have or had)', 4: '-ing form' }[k];
      var pool = []; LLP.forEach(function (x) { [2, 3, 4].forEach(function (j) { pool.push(x[j]); }); });
      var wrong = R.shuffle(uniq(pool.filter(function (w) { return w !== pv[k] && (w.slice(0, 2) === pv[0].slice(0, 2) || w.slice(0, 2) === { lie: 'la', lay: 'li', sit: 'se', set: 'si', rise: 'ra', raise: 'ri' }[pv[0]]); }))).slice(0, 3);
      return { q: q(para('What is the ' + kn + ' of <i>' + pv[0] + '</i> (' + pv[1] + ')?')), a: mc(pv[k], wrong), hint: 'Say the principal parts aloud: ' + pv[0] + ', …',
        steps: ['The parts of <i>' + pv[0] + '</i> (' + pv[1] + '): ' + pv[0] + ', ' + pv[2] + ', (has) ' + pv[3] + ', ' + pv[4] + '.', 'So the ' + kn + ' is <i>' + pv[k] + '</i>.'] };
    }
    if (shape === 'choose') {
      var t = R.pick(LL.filter(function (x) { return L === 1 ? x[4] === 1 : x[4] === 2 || L === 3; }));
      return { q: q(para('Choose the right verb.'), sent(t[0])), a: mc(t[1], t[2]), hint: 'Is something being put or lifted?', steps: [t[3], quote(blankUp(t[0], t[1]))] };
    }
    if (shape === 'object') {
      var pair = R.pick([['lay', 'lie'], ['set', 'sit'], ['raise', 'rise']]), obj = R.coin(), w = obj ? pair[0] : pair[1];
      return { q: q(para('Does this verb take an object (something being put or lifted)?'), sent(w)), a: yesno(obj), hint: 'Can you ' + w + ' <i>something</i>?',
        steps: [obj ? 'You ' + w + ' something: “' + cap(w) + ' it down.” It takes an object.' : 'You don’t ' + w + ' something; you just ' + w + '. No object.', 'Its partner, <i>' + (obj ? pair[1] : pair[0]) + '</i>, ' + (obj ? 'takes no object.' : 'takes one.')] };
    }
    var u = R.pick(LL.filter(function (x) { return x[4] === 2; })), ok = R.coin(), shown = blankUp(u[0], ok ? u[1] : R.pick(u[2]));
    return { q: q(para('Is the verb right for formal writing?'), sent(shown)), a: yesno(ok), hint: 'Is something being put or lifted? Then check the tense.',
      steps: [u[3], ok ? 'So yes.' : 'So no: ' + quote(blankUp(u[0], u[1]))] };
  });

  /* ---------------------------------------------------------------- usage.active-passive */
  // [doer, receiver, receiver plural?, verb past, participle, doer is plural?]
  var AP = [['Sam', 'the ball', false, 'threw', 'thrown'], ['the storm', 'the roof', false, 'damaged', 'damaged'], ['Grandma', 'the cake', false, 'baked', 'baked'],
    ['the class', 'the trees', true, 'planted', 'planted'], ['a baseball', 'the window', false, 'broke', 'broken'], ['the students', 'the play', false, 'wrote', 'written'],
    ['the dog', 'my shoe', false, 'chewed', 'chewed'], ['the wind', 'the leaves', true, 'scattered', 'scattered'], ['Mia', 'the mural', false, 'painted', 'painted'],
    ['the coach', 'the captain', false, 'chose', 'chosen'], ['our neighbor', 'the fence', false, 'fixed', 'fixed'], ['the puppy', 'the cookies', true, 'ate', 'eaten']];
  var NOTPASS = ['The sky was blue.', 'Sam was running to the bus.', 'The soup is hot.', 'The players were tired after the game.', 'We were singing in the car.', 'My brother is tall.', 'The kids were happy.', 'The puppy is sleeping.'];
  function apSent(t) { return { act: cap(t[0]) + ' ' + t[3] + ' ' + t[1] + '.', pas: cap(t[1]) + ' ' + (t[2] ? 'were' : 'was') + ' ' + t[4] + ' by ' + t[0] + '.' }; }
  G('usage.active-passive', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'which', R.pick(['which', 'yesno', 'toactive']), R.pick(['topassive', 'yesno', 'toactive']));
    var t = R.pick(AP), s = apSent(t);
    if (shape === 'which') {
      var pas = R.coin();
      return { q: q(para('Is this sentence in the active voice or the passive voice?'), sent(pas ? s.pas : s.act)), a: keep(['active', 'passive'], pas ? 1 : 0),
        hint: 'Does the subject do the action, or receive it?', steps: pas ? ['The subject, <i>' + t[1] + '</i>, receives the action.', 'The verb is a form of <i>be</i> + a past participle: <i>' + (t[2] ? 'were' : 'was') + ' ' + t[4] + '</i>. Passive.'] : ['The subject, <i>' + t[0] + '</i>, does the action: <i>' + t[3] + '</i>. Active.'] };
    }
    if (shape === 'yesno') {
      var kind = R.pick(['pas', 'act', 'be']), x = kind === 'pas' ? s.pas : kind === 'act' ? s.act : R.pick(NOTPASS);
      return { q: q(para('Is this sentence in the passive voice?'), sent(x)), a: yesno(kind === 'pas'), hint: 'Passive = a form of <i>be</i> + a past participle, with the subject receiving the action.',
        steps: kind === 'pas' ? ['A form of <i>be</i> + the past participle <i>' + t[4] + '</i>; the subject receives the action. Yes, passive.'] : kind === 'act' ? ['The subject does the action. Active, not passive.'] : ['There is a form of <i>be</i>, but no action is done to the subject (it is a linking verb or the progressive).', 'So it is not passive.'] };
    }
    if (shape === 'toactive') {
      var w1 = cap(t[1]) + ' ' + t[3] + ' ' + t[0] + '.', w2 = cap(t[0]) + ' was ' + t[4] + ' by ' + t[1] + '.';
      return { q: q(para('Which is the active version of this sentence?'), sent(s.pas)), a: mc(s.act, [w1, w2]), hint: 'Find the doer after <i>by</i> and make it the subject.',
        steps: ['The doer comes after <i>by</i>: <i>' + t[0] + '</i>.', 'Make the doer the subject and the receiver the object: ' + quote(s.act)] };
    }
    var p1 = cap(t[1]) + ' ' + (t[2] ? 'were' : 'was') + ' ' + t[3] + ' by ' + t[0] + '.', p2 = cap(t[0]) + ' ' + 'was ' + t[4] + ' by ' + t[1] + '.', p3 = cap(t[1]) + ' ' + (t[2] ? 'was' : 'were') + ' ' + t[4] + ' by ' + t[0] + '.';
    var wrongs = [p2, p3]; if (t[3] !== t[4]) wrongs.unshift(p1);
    return { q: q(para('Which is the passive version of this sentence?'), sent(s.act)), a: mc(s.pas, wrongs.slice(0, 2)), hint: 'The receiver becomes the subject; the verb is a form of <i>be</i> + the past participle.',
      steps: ['The receiver, <i>' + t[1] + '</i>, becomes the subject.', 'It is ' + (t[2] ? 'plural, so <i>were</i>' : 'singular, so <i>was</i>') + ', plus the past participle <i>' + t[4] + '</i>.', 'The doer goes after <i>by</i>: ' + quote(s.pas)] };
  });

  /* ---------------------------------------------------------------- usage.verb-mood */
  var MOODS = [['The library opens at nine.', 0], ['Our cat sleeps all day.', 0], ['Did you feed the fish?', 0], ['The bus was late again.', 0], ['We will leave at noon.', 0],
    ['Turn left at the corner.', 1], ['Please pass the salt.', 1], ['Close the door behind you.', 1], ['Bring a jacket tonight.', 1], ['Wait for me at the gate.', 1],
    ['If I were you, I would rest.', 2], ['I wish it were summer.', 2], ['The coach asks that every player arrive on time.', 2], ['If she were here, she would know the way.', 2], ['It is important that he be ready by six.', 2]];
  // [frame, right, wrong, why]
  var WERE = [['If I ___ a bird, I would fly south.', 'were', 'was', 'I am not a bird: the condition isn’t true.'], ['I wish my room ___ bigger.', 'were', 'was', 'A wish for something that isn’t true.'],
    ['If he ___ taller, he could reach the shelf.', 'were', 'was', 'He is not taller: the condition isn’t true.'], ['If it ___ Saturday, we would sleep in.', 'were', 'was', 'It isn’t Saturday: the condition isn’t true.'],
    ['She talks as if she ___ the boss.', 'were', 'was', 'She isn’t the boss: the comparison isn’t true.'], ['If I ___ the coach, I would change the lineup.', 'were', 'was', 'I am not the coach: the condition isn’t true.']];
  var WAS = [['If she ___ at the game yesterday, she saw the goal.', 'was', 'were', 'We don’t know; it may well be true. A real possibility takes the indicative <i>was</i>.'],
    ['If I ___ rude earlier, I am sorry.', 'was', 'were', 'It may really have happened. A real possibility takes the indicative <i>was</i>.'],
    ['When I ___ little, I loved trains.', 'was', 'were', 'This states a fact about the past, not a condition: indicative <i>was</i>.']];
  var MAND = [['The rules require that every rider ___ a helmet.', 'wear', 'wears'], ['The teacher asked that each student ___ quietly.', 'work', 'works'], ['It is important that she ___ on time.', 'be', 'is'],
    ['The doctor recommends that he ___ more water.', 'drink', 'drinks'], ['We insist that he ___ for dinner.', 'stay', 'stays'], ['The coach requests that each player ___ a water bottle.', 'bring', 'brings']];
  var UNREAL = [['I', 'a bird', 'fly south for the winter'], ['she', 'taller', 'reach the top shelf'], ['he', 'the coach', 'change the lineup'], ['I', 'older', 'drive us to the lake'],
    ['it', 'warmer', 'go swimming'], ['my dog', 'smaller', 'fit in my backpack'], ['Grandpa', 'here', 'tell us a story'], ['the store', 'open', 'buy some milk'], ['she', 'a pilot', 'fly us to Alaska']];
  var WISH = [['I', 'my room', 'bigger'], ['Sam', 'it', 'Friday'], ['we', 'the pool', 'open'], ['she', 'her brother', 'home'], ['I', 'the test', 'over'], ['they', 'summer', 'longer']];
  var M_WHO = ['The coach', 'The teacher', 'Our principal', 'The doctor', 'The librarian'], M_V = ['asks', 'insists', 'recommends', 'requests'];
  var M_P = ['each player', 'every student', 'she', 'he', 'my brother'], M_A = [['arrive', 'arrives', 'on time'], ['bring', 'brings', 'a water bottle'], ['be', 'is', 'ready by six'], ['rest', 'rests', 'for a day'], ['read', 'reads', 'one chapter a night'], ['wait', 'waits', 'by the door']];
  function moodGen(R, kind) {
    if (kind === 'unreal') { var u = R.pick(UNREAL), would = u[0] === 'it' || u[0] === 'the store' ? 'we could' : (u[0] === 'my dog' ? 'I could take it to school, and it would' : (u[0] === 'I' ? 'I would' : low(u[0]) === 'grandpa' ? 'he would' : u[0] + ' would'));
      if (u[0] === 'my dog') return ['If my dog ___ smaller, it would fit in my backpack.', 'were', 'was', 'My dog isn’t smaller: the condition isn’t true.'];
      return ['If ' + u[0] + ' ___ ' + u[1] + ', ' + would + ' ' + u[2] + '.', 'were', 'was', cap(u[0]) + ' ' + (u[0] === 'I' ? 'am' : 'is') + ' not ' + u[1] + ': the condition isn’t true.']; }
    var w = R.pick(WISH); return [cap(w[0]) + ' ' + (w[0] === 'I' || w[0] === 'we' || w[0] === 'they' ? 'wish' : 'wishes') + ' ' + w[1] + ' ___ ' + w[2] + '.', 'were', 'was', 'A wish for something that isn’t true now.'];
  }
  function mandGen(R) { var a = R.pick(M_A); return [R.pick(M_WHO) + ' ' + R.pick(M_V) + ' that ' + R.pick(M_P) + ' ___ ' + a[2] + '.', a[0], a[1]]; }
  G('usage.verb-mood', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'name', R.pick(['were', 'name']), R.pick(['realunreal', 'mand', 'were']));
    if (shape === 'name') {
      var m = R.pick(MOODS);
      if (R.coin()) { var kind = R.int(0, 2), rg = R.pick(REG.filter(function (x) { return !/^(hope|cry)$/.test(x[0]); })), md = mandGen(R);
        m = kind === 0 ? [cap(R.pick(['my brother', 'the twins', 'our class', 'Grandma'])) + ' ' + rg[1] + ' ' + rg[2] + '.', 0] : kind === 1 ? [(R.coin() ? 'Please ' + rg[0] : cap(rg[0])) + ' ' + rg[2] + '.', 1]
          : [R.coin() ? fill(moodGen(R, R.pick(['unreal', 'wish']))[0], 'were') : fill(md[0], md[1]), 2]; }
      var why = ['It states a fact or asks a question.', 'It gives a command or makes a request.', 'It expresses a wish, an unreal condition, or a requirement.'];
      return { q: q(para('What is the mood of this sentence?'), sent(m[0])), a: keep(['indicative', 'imperative', 'subjunctive'], m[1]),
        hint: 'A fact or question, a command, or something wished for or not true?', steps: [why[m[1]], 'So the mood is ' + ['indicative', 'imperative', 'subjunctive'][m[1]] + '.'] };
    }
    if (shape === 'were' || shape === 'realunreal') {
      var t = shape === 'were' ? (R.coin() ? R.pick(WERE) : moodGen(R, R.pick(['unreal', 'unreal', 'wish']))) : R.pick(R.coin() ? WERE.concat([moodGen(R, 'unreal')]) : WAS);
      return { q: q(para('In formal writing, which verb is right?'), sent(t[0])), a: mc(t[1], [t[2]]), hint: 'Is the condition untrue, or a real possibility?',
        steps: [t[3], t[1] === 'were' ? 'An unreal condition or wish takes the subjunctive <i>were</i>.' : 'So <i>was</i> is right; <i>were</i> would wrongly suggest it isn’t true.', quote(fill(t[0], t[1]))] };
    }
    var d = R.coin() ? R.pick(MAND) : mandGen(R);
    return { q: q(para('In formal American writing, which verb is standard?'), sent(d[0])), a: mc(d[1], [d[2]]), hint: 'After <i>require</i>, <i>ask</i>, <i>insist</i> or <i>important</i> + <i>that</i>, what form does the verb take?',
      steps: ['A requirement or request after <i>that</i> takes the subjunctive: the base form of the verb, with no -s.', quote(fill(d[0], d[1])), 'British English often says “should ' + d[1] + '” here instead.'] };
  });

  /* ================================================================ UNIT 4: MODIFIERS */
  // [base, comparative, superlative, two-thing frame, group frame]
  var CMP = [
    ['tall', 'taller', 'tallest', 'Of the two trees, the oak is ___.', 'The oak is the ___ tree in the park.'],
    ['fast', 'faster', 'fastest', 'Of the twins, Ana is the ___ runner.', 'Ana is the ___ runner on the team.'],
    ['big', 'bigger', 'biggest', 'Of the two pumpkins, this one is ___.', 'This is the ___ pumpkin in the patch.'],
    ['hot', 'hotter', 'hottest', 'Today is ___ than yesterday.', 'Today is the ___ day of the year.'],
    ['wide', 'wider', 'widest', 'The river is ___ than the creek.', 'This is the ___ river in the state.'],
    ['happy', 'happier', 'happiest', 'Of my two dogs, Rex is the ___ one.', 'Rex is the ___ dog at the shelter.'],
    ['busy', 'busier', 'busiest', 'Monday is ___ than Sunday.', 'Monday is the ___ day of the week.'],
    ['funny', 'funnier', 'funniest', 'His second joke was ___ than his first.', 'That was the ___ joke of the night.'],
    ['easy', 'easier', 'easiest', 'The second question was ___ than the first.', 'That was the ___ question on the test.'],
    ['careful', 'more careful', 'most careful', 'Of the two drivers, Mom is the ___ one.', 'Mom is the ___ driver in our family.'],
    ['exciting', 'more exciting', 'most exciting', 'The second ride was ___ than the first.', 'This is the ___ ride at the fair.'],
    ['colorful', 'more colorful', 'most colorful', 'Of the two kites, the red one is ___.', 'This is the ___ kite in the sky.'],
    ['difficult', 'more difficult', 'most difficult', 'This puzzle is ___ than that one.', 'This is the ___ puzzle in the book.'],
    ['interesting', 'more interesting', 'most interesting', 'Of the two books, this one is ___.', 'This is the ___ book on the shelf.'],
    ['good', 'better', 'best', 'Of the two pizzas, this one is ___.', 'This is the ___ pizza in town.'],
    ['bad', 'worse', 'worst', 'Today’s storm was ___ than last week’s.', 'That was the ___ storm of the year.'],
    ['quickly', 'more quickly', 'most quickly', 'Lena finished ___ than Ben.', 'Of all the runners, Lena finished ___.'],
    ['well', 'better', 'best', 'Sam sings ___ than his brother.', 'Of everyone in the choir, Sam sings ___.']
  ];
  function dbl(t, sup) { // the common doubled or wrong-ending form
    if (t[1].indexOf('more ') === 0) return /y$/.test(t[0]) ? t[0].slice(0, -1) + (sup ? 'iest' : 'ier') : t[0] + (sup ? 'est' : 'er');
    return sup ? 'most ' + t[2] : 'more ' + t[1];
  }
  G('usage.comparatives', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['two', 'group']), R.pick(['two', 'group']), R.pick(['type', 'type', 'group']));
    var t = R.pick(CMP);
    if (shape === 'type') {
      var u = R.pick(CMP.filter(function (x) { return x[1].indexOf('more') < 0; })), sup = R.coin(), ans = sup ? u[2] : u[1];
      var rule = u[0] === 'good' || u[0] === 'bad' || u[0] === 'well' ? '<i>' + u[0] + '</i> is irregular: ' + u[0] + ', ' + u[1] + ', ' + u[2] + '.' : /y$/.test(u[0]) ? 'It ends in a consonant + y: change y to i, then add -' + (sup ? 'est' : 'er') + '.' : /e$/.test(u[0]) ? 'It ends in e: add -' + (sup ? 'st' : 'r') + '.' : /([a-z])\1(er|est)$/.test(ans) && !/([a-z])\1$/.test(u[0]) ? 'One vowel and one consonant at the end: double the consonant, then add -' + (sup ? 'est' : 'er') + '.' : 'Add -' + (sup ? 'est' : 'er') + '.';
      return { q: q(para('Type the ' + (sup ? 'superlative' : 'comparative') + ' of <i>' + u[0] + '</i>.')), a: text(ans), hint: sup ? 'The form for three or more.' : 'The form for comparing two.',
        steps: [rule, '<i>' + u[0] + '</i> → <i>' + ans + '</i>'] };
    }
    var two = shape === 'two', frame = two ? t[3] : t[4], right = two ? t[1] : t[2];
    var wrong = L === 1 ? [two ? t[2] : t[1]] : [two ? t[2] : t[1], dbl(t, !two)];
    return { q: q(para('Choose the right form.'), sent(frame)), a: mc(right, wrong),
      hint: two ? 'Two things are compared.' : 'One stands out from a group of three or more.',
      steps: [two ? 'Two things are compared: use the comparative.' : 'A group of three or more: use the superlative.', '<i>' + t[0] + '</i> → <i>' + right + '</i>' + (right.indexOf(' ') > 0 ? ' (a longer word takes <i>' + right.split(' ')[0] + '</i>).' : '.'), quote(fill(frame, right))] };
  });

  /* ---------------------------------------------------------------- usage.adjective-or-adverb */
  // [frame, right, wrong, why]
  var ADV = [['You did ___ on the quiz.', 'well', 'good', 'It tells how you <i>did</i>: an action takes the adverb.'], ['She sings ___.', 'well', 'good', 'It tells how she <i>sings</i>: an action takes the adverb.'],
    ['He drives ___.', 'carefully', 'careful', 'It tells how he <i>drives</i>: an adverb.'], ['The team played ___ in the rain.', 'badly', 'bad', 'It tells how the team <i>played</i>: an adverb.'],
    ['Please speak ___ in the library.', 'quietly', 'quiet', 'It tells how to <i>speak</i>: an adverb.'], ['She answered every question ___.', 'correctly', 'correct', 'It tells how she <i>answered</i>: an adverb.'],
    ['He was ___ tired after the hike.', 'really', 'real', 'It describes the adjective <i>tired</i>: an adverb.'], ['The kids worked ___ on the poster.', 'happily', 'happy', 'It tells how they <i>worked</i>: an adverb.']];
  var ADJ = [['The soup smells ___.', 'good', 'well', '<i>Smells</i> links the soup to a description: an adjective.'], ['I feel ___ about the mix-up.', 'bad', 'badly', '<i>Feel</i> links <i>I</i> to a description: an adjective.'],
    ['The milk tastes ___.', 'sour', 'sourly', '<i>Tastes</i> links the milk to a description: an adjective.'], ['The music sounds ___.', 'beautiful', 'beautifully', '<i>Sounds</i> links the music to a description: an adjective.'],
    ['Your plan seems ___.', 'reasonable', 'reasonably', '<i>Seems</i> is a linking verb: an adjective.'], ['The baby looks ___.', 'happy', 'happily', '<i>Looks</i> links the baby to a description: an adjective.'],
    ['The room became ___.', 'quiet', 'quietly', '<i>Became</i> is a linking verb: an adjective.'], ['The bread smells ___.', 'delicious', 'deliciously', '<i>Smells</i> links the bread to a description: an adjective.']];
  var TWOJOB = [['She looked ___ at the map.', 'carefully', 'careful', 'Here <i>looked</i> is an action (looking at the map): an adverb.'], ['She looked ___ after the race.', 'tired', 'tiredly', 'Here <i>looked</i> links her to a description: an adjective.'],
    ['The dog sniffed ___ at the bowl.', 'carefully', 'careful', '<i>Sniffed</i> is an action: an adverb.'], ['He felt ___ about the good news.', 'happy', 'happily', '<i>Felt</i> links him to a description: an adjective.'],
    ['He felt ___ for the light switch in the dark.', 'carefully', 'careful', 'Here <i>felt</i> is an action (feeling around with his hand): an adverb.'], ['The cook tasted the sauce ___.', 'slowly', 'slow', '<i>Tasted</i> is an action here, with an object: an adverb.']];
  // action verbs with adverbs that fit them; linking verbs with adjectives that fit them
  var ACT = [['waited', ['patient', 'patiently'], ['calm', 'calmly'], ['quiet', 'quietly']], ['answered', ['polite', 'politely'], ['careful', 'carefully'], ['correct', 'correctly']],
    ['wrote', ['neat', 'neatly'], ['careful', 'carefully'], ['clear', 'clearly']], ['spoke', ['calm', 'calmly'], ['clear', 'clearly'], ['proud', 'proudly'], ['polite', 'politely']],
    ['played', ['good', 'well'], ['bad', 'badly'], ['brave', 'bravely']], ['worked', ['careful', 'carefully'], ['quiet', 'quietly'], ['steady', 'steadily']],
    ['petted the kitten', ['gentle', 'gently'], ['soft', 'softly']], ['solved the puzzle', ['easy', 'easily'], ['clever', 'cleverly']]];
  var LINK = [['looked', ['happy', 'happily'], ['tired', 'tiredly'], ['calm', 'calmly'], ['proud', 'proudly'], ['nervous', 'nervously']],
    ['seemed', ['calm', 'calmly'], ['nervous', 'nervously'], ['happy', 'happily'], ['ready', 'readily']], ['felt', ['bad', 'badly'], ['proud', 'proudly'], ['nervous', 'nervously'], ['calm', 'calmly']],
    ['became', ['quiet', 'quietly'], ['nervous', 'nervously'], ['calm', 'calmly']]];
  var AA_S = ['The girl', 'My brother', 'Grandpa', 'The new student', 'Our coach', 'My aunt'];
  function aaGen(R, action) {
    var v = R.pick(action ? ACT : LINK), pair = R.pick(v.slice(1)), subj = R.pick(AA_S);
    var why = action ? '<i>' + v[0].split(' ')[0] + '</i> is an action; the word tells how: an adverb.' : '<i>' + v[0] + '</i> is a linking verb here; the word describes ' + low(subj) + ': an adjective.';
    return [subj + ' ' + v[0] + ' ___.', action ? pair[1] : pair[0], action ? pair[0] : pair[1], why];
  }
  G('usage.adjective-or-adverb', function (R, ctx) {
    var L = ctx.level, t = R.chance(0.5) && L < 3 ? aaGen(R, R.coin()) : R.pick(ML.byLevel(ctx, ADV.concat(ADJ), ADV.concat(ADJ), TWOJOB.concat(ADJ, TWOJOB)));
    return { q: q(para('In formal writing, which word fits?'), sent(t[0])), a: mc(showC(t[0], t[1]), [showC(t[0], t[2])]), hint: 'What does the word describe: a thing (or the subject after a linking verb), or an action?',
      steps: [t[3], quote(show(t[0], t[1]))] };
  });

  /* ---------------------------------------------------------------- usage.double-negatives */
  // [frame, right, wrong, the negative already there]
  var DN = [['There isn’t ___ in the box.', 'anything', 'nothing', 'isn’t'], ['I don’t have ___ homework tonight.', 'any', 'no', 'don’t'], ['We ___ hardly wait for the trip.', 'can', 'can’t', 'hardly'],
    ['She didn’t see ___ at the park.', 'anybody', 'nobody', 'didn’t'], ['He isn’t ___ late.', 'ever', 'never', 'isn’t'], ['They couldn’t find ___ to sit.', 'anywhere', 'nowhere', 'couldn’t'],
    ['I ___ barely see the stage.', 'could', 'couldn’t', 'barely'], ['Nobody ___ ever told me.', 'has', 'hasn’t', 'nobody'], ['The store doesn’t sell ___ bread.', 'any', 'no', 'doesn’t'],
    ['There ___ scarcely any milk left.', 'was', 'wasn’t', 'scarcely'], ['We haven’t ___ been to Alaska.', 'ever', 'never', 'haven’t'], ['Don’t tell ___ about the surprise.', 'anyone', 'no one', 'don’t'],
    ['I can’t find my shoes ___.', 'anywhere', 'nowhere', 'can’t'], ['She ___ hardly believe it.', 'could', 'couldn’t', 'hardly']];
  G('usage.double-negatives', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'choose', R.pick(['choose', 'which']), R.pick(['all', 'which']));
    var t = R.pick(DN), good = show(t[0], t[1]), bad = show(t[0], t[2]);
    var steps = ['<i>' + t[3] + '</i> is already a negative' + (/hardly|barely|scarcely/.test(t[3]) ? ' (it means “almost not”)' : '') + '.', 'Standard written English uses one negative per idea, so use <i>' + t[1] + '</i>.', quote(good)];
    if (shape === 'choose') return { q: q(para('Choose the word that fits standard written English.'), sent(t[0])), a: mc(showC(t[0], t[1]), [showC(t[0], t[2])]), hint: 'Is there already a negative word in the sentence?', steps: steps };
    if (shape === 'which') {
      var u = R.pick(DN.filter(function (x) { return x !== t; })), bad2 = show(u[0], u[2]);
      return { q: q(para('Which sentence is written in standard English?')), a: mc(good, [bad, bad2]), hint: 'Count the negative words in each sentence.',
        steps: steps.slice(0, 2).concat([quote(bad) + ' and ' + quote(bad2) + ' each use two negatives.']) };
    }
    var picks = R.sample(DN, 4), items = picks.map(function (x, i) { var ok = i === 0 ? true : i === 1 ? false : R.coin(); return { text: show(x[0], ok ? x[1] : x[2]), ok: ok, x: x }; });
    var sh = R.shuffle(items);
    return { q: q(para('Which sentences use one negative per idea, as standard written English does? ' + ALL)), a: selectAll(sh), hint: 'Remember the hidden negatives: hardly, barely, scarcely.',
      steps: sh.map(function (it) { return quote(it.text) + (it.ok ? ' uses one negative.' : ' uses two: <i>' + it.x[3] + '</i> and <i>' + it.x[2] + '</i>.'); }) };
  });

  /* ---------------------------------------------------------------- usage.misplaced-modifiers */
  // [misplaced, fixed, modifier, seems to describe, should describe]
  var MM = [
    ['She served sandwiches to the children on paper plates.', 'She served sandwiches on paper plates to the children.', 'on paper plates', 'the children', 'the sandwiches'],
    ['Dad bought a hat for my mom with a feather.', 'Dad bought a hat with a feather for my mom.', 'with a feather', 'my mom', 'the hat'],
    ['The girl walked the dog in a raincoat.', 'The girl in a raincoat walked the dog.', 'in a raincoat', 'the dog', 'the girl'],
    ['The boy fed the cat wearing pajamas.', 'The boy wearing pajamas fed the cat.', 'wearing pajamas', 'the cat', 'the boy'],
    ['We bought a bike from a neighbor with a flat tire.', 'We bought a bike with a flat tire from a neighbor.', 'with a flat tire', 'the neighbor', 'the bike'],
    ['The waiter brought a cake to the table covered in candles.', 'The waiter brought a cake covered in candles to the table.', 'covered in candles', 'the table', 'the cake'],
    ['I found a ring in the sand that belonged to my aunt.', 'In the sand, I found a ring that belonged to my aunt.', 'that belonged to my aunt', 'the sand', 'the ring'],
    ['Grandpa told us about catching a fish in the kitchen.', 'In the kitchen, Grandpa told us about catching a fish.', 'in the kitchen', 'catching a fish', 'telling the story'],
    ['The kids watched the parade from the porch with tall floats.', 'From the porch, the kids watched the parade with tall floats.', 'with tall floats', 'the porch', 'the parade'],
    ['My sister gave a bone to the dog wrapped in a bow.', 'My sister gave the dog a bone wrapped in a bow.', 'wrapped in a bow', 'the dog', 'the bone']
  ];
  var ONLY = [['Sam', 'ate', 'the pie', 'there was no other pie'], ['Lena', 'passed', 'the test', 'there was no other test'], ['Ari', 'brought', 'two pencils', 'there were no other pencils'], ['Mom', 'drank', 'the juice', 'there was no other juice'], ['Our class', 'visited', 'the museum', 'there was no other museum'], ['Jo', 'fed', 'the goldfish', 'there was no other goldfish']];
  G('usage.misplaced-modifiers', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'fix', R.pick(['seems', 'only', 'fix']), R.pick(['seems', 'only', 'fix3']));
    if (shape === 'fix' || shape === 'fix3') {
      var t = R.pick(MM), u = R.pick(MM.filter(function (x) { return x !== t; }));
      return { q: q(para('Which sentence puts the modifier in the right place?')), a: mc(t[1], shape === 'fix3' ? [t[0], u[0]] : [t[0]]),
        hint: 'What should <i>' + t[2] + '</i> describe? Is it next to that word?', steps: ['<i>' + cap(t[2]) + '</i> should describe ' + t[4] + '.', 'In ' + quote(t[0]) + ' it sits next to ' + t[3] + ', so it seems to describe ' + t[3] + '.', 'Moved: ' + quote(t[1])] };
    }
    if (shape === 'seems') {
      var m = R.pick(MM.slice(0, 7).concat(MM.slice(8)));
      return { q: q(para('As this sentence is written, what does <i>' + m[2] + '</i> seem to describe?'), sent(m[0])), a: mc(m[3], [m[4]]),
        hint: 'A modifier attaches to the nearest word it could describe.', steps: ['<i>' + cap(m[2]) + '</i> sits right after <i>' + m[3].replace(/^the /, '') + '</i>.', 'So, as written, it seems to describe ' + m[3] + ', though the writer meant ' + m[4] + '.', 'Better: ' + quote(m[1])] };
    }
    var o = R.pick(ONLY), who = R.coin(), nm = o[0] === 'Our class' ? 'our class' : o[0];
    var a1 = 'Only ' + nm + ' ' + o[1] + ' ' + o[2] + '.', a2 = o[0] + ' ' + o[1] + ' only ' + o[2] + '.', a3 = o[0] + ' ' + o[1] + ' ' + o[2].replace(/^the /, 'the only ').replace(/^two /, 'the only two ') + '.';
    var ask = who ? nm + ', and no one else, ' + o[1] + ' ' + o[2] : nm + ' ' + o[1] + ' ' + o[2] + ', and nothing else';
    return { q: q(para('Which sentence says that ' + ask + '?')), a: mc(who ? a1 : a2, [who ? a2 : a1, a3]), hint: '<i>Only</i> limits the word right after it.',
      steps: ['<i>Only</i> goes right before the word it limits.', who ? 'To limit who, put it before <i>' + nm + '</i>: ' + quote(a1) : 'To limit what, put it before <i>' + o[2] + '</i>: ' + quote(a2), quote(a3) + ' means something else: ' + o[3] + '.'] };
  });

  /* ---------------------------------------------------------------- usage.dangling-modifiers */
  // [dangling, fixes [...], grammatical subject, intended doer]
  var DM = [
    ['Walking home, a fox appeared.', ['Walking home, I saw a fox.', 'As I was walking home, a fox appeared.'], 'a fox', 'the writer (I)'],
    ['After finishing the test, the bell rang.', ['After finishing the test, we heard the bell ring.', 'After we finished the test, the bell rang.'], 'the bell', 'the students (we)'],
    ['To win the race, practice is needed.', ['To win the race, you need practice.', 'If you want to win the race, you need practice.'], 'practice', 'the runner (you)'],
    ['Running for the bus, my backpack fell open.', ['Running for the bus, I felt my backpack fall open.', 'As I ran for the bus, my backpack fell open.'], 'my backpack', 'the writer (I)'],
    ['Hungry after practice, the pizza disappeared fast.', ['Hungry after practice, we ate the pizza fast.', 'Because we were hungry after practice, the pizza disappeared fast.'], 'the pizza', 'the players (we)'],
    ['Looking out the window, the snow was falling.', ['Looking out the window, I saw the snow falling.', 'When I looked out the window, the snow was falling.'], 'the snow', 'the writer (I)'],
    ['At the age of six, my family moved to Ohio.', ['At the age of six, I moved to Ohio with my family.', 'When I was six, my family moved to Ohio.'], 'my family', 'the writer (I)'],
    ['Climbing the tree, a branch scratched my arm.', ['Climbing the tree, I scratched my arm on a branch.', 'As I was climbing the tree, a branch scratched my arm.'], 'a branch', 'the writer (I)'],
    ['Excited about the trip, the bags were packed early.', ['Excited about the trip, we packed our bags early.', 'Because we were excited about the trip, we packed our bags early.'], 'the bags', 'the travelers (we)']
  ];
  var DM_OK = ['Tired from the hike, the campers went to bed early.', 'Laughing loudly, the twins ran outside.', 'To catch the bus, Leo left early.', 'After eating lunch, we played tag.', 'Holding the rail, Grandma climbed the stairs.', 'Startled by the thunder, the puppy hid under the bed.'];
  G('usage.dangling-modifiers', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'fix', R.pick(['who', 'fix']), R.pick(['all', 'who']));
    var t = R.pick(DM);
    if (shape === 'fix') {
      var good = R.pick(t[1]), w = R.pick(DM.filter(function (x) { return x !== t; }));
      return { q: q(para('Which sentence is written correctly?')), a: mc(good, L === 1 ? [t[0]] : [t[0], w[0]]),
        hint: 'Who is doing the action in the opening phrase? Is that the subject right after the comma?',
        steps: ['In ' + quote(t[0]) + ', the subject after the comma is <i>' + t[2] + '</i>, so by the grammar the opening phrase describes ' + t[2] + '. The one really doing it is ' + t[3] + '.', quote(good) + ' makes the doer clear.'] };
    }
    if (shape === 'who') {
      return { q: q(para('By the grammar of this sentence, who or what does the opening phrase describe?'), sent(t[0])), a: mc(t[2], [t[3]]),
        hint: 'An opening phrase describes the subject that comes right after the comma.', steps: ['The subject right after the comma is <i>' + t[2] + '</i>.', 'So, by the grammar, the phrase describes ' + t[2] + ', though the writer meant ' + t[3] + '. The modifier dangles.', 'A fix: ' + quote(t[1][0])] };
    }
    var four = R.sample(DM, 3), mixed = R.coin();
    var items = R.shuffle([{ text: four[0][0], ok: true }, { text: mixed ? four[1][0] : four[1][1][1], ok: mixed }, { text: R.pick(DM_OK), ok: false }, { text: four[2][1][0], ok: false }]);
    return { q: q(para('Which sentences have a dangling modifier? ' + ALL)), a: selectAll(items), hint: 'For each, ask: can the subject after the comma do what the opening phrase says?',
      steps: items.map(function (it) { return quote(it.text) + (it.ok ? ' dangles: the subject after the comma isn’t the doer.' : ' is fine: the opening phrase describes the subject after the comma, or has its own subject.'); }) };
  });
})(window.MathLadder);

/* ---- part B ---- */
/* Usage and Mechanics (Writing & Grammar Ladder, course key usage), part B: problem generators for the units Punctuation,
   Sentence Errors, Parallel Structure, and Capitals and Usage (26 topics). Source: /tmp/work_usage_B/src/gen_*.js, joined by
   /tmp/work_usage_B/build_gen.sh into /tmp/work_usage_B/out/gen.js and merged into static/writing/gen/usage.js by
   /tmp/merge_parts.js. Conventions: /tmp/work_writing/overview.md.
   Answers are choices (mc, several right for "select all", keep: true for numbered gaps and Yes/No), and typed text only
   where the corrected word is the skill (a possessive, a contraction, a standard form). Where style guides differ (the
   serial comma, a comma after a short opener, which/that, names ending in s, title case of longer prepositions, fewer/less
   with counts, alright, split infinitives, final prepositions, And/But openers), problems ask what a named guide does, or
   accept every standard choice, and never score one side as wrong. Sentences are original. Numbered gaps come from the
   kit's quiet wr-punct (gap i is the space after word i), built from the same correct sentence as the answer. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;
  function W() { return ML.writing; }

  /* ---------------------------------------------------------------- shared helpers */
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  // lowercase the first letter only of a common word (The, My, Our …); names and I stay as they are
  function low(s) { s = String(s); return /^(The|A|An|My|Our|Your|His|Her|Their|Its|This|That|These|Those|Every|Each|Some|Two|Three|We|They|It|He|She|You)\b/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function q(lines) { return lines.filter(Boolean).join(''); }
  function para(s) { return '<p>' + s + '</p>'; }
  function say(s) { return '<p><b>' + s + '</b></p>'; }
  function cq(s) { return '“' + s + '”'; }
  function samp(R, a, k) { return R.sample(a, Math.min(k, a.length)); } // R.sample, never asking for more than there are
  function uniq(a) { var o = []; a.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); }); return o; }
  // one right choice first, then wrong ones (the engine shuffles unless keep)
  function mc(right, wrong) {
    var w = uniq(wrong).filter(function (x) { return x !== right; });
    return { t: 'mc', choices: [right].concat(w), v: 0 };
  }
  // several right choices ("select all"); the engine shuffles them
  function mcAll(rights, wrongs) {
    var r = uniq(rights), w = uniq(wrongs).filter(function (x) { return r.indexOf(x) < 0; });
    return { t: 'mc', choices: r.concat(w), v: r.map(function (_, i) { return i; }) };
  }
  function mcKeep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  var YN = ['Yes', 'No'];
  function yn(yes) { return mcKeep(YN, yes ? 0 : 1); }
  function nums(n) { var a = []; for (var i = 1; i <= n; i++) a.push(String(i)); return a; }
  function words(s) { return String(s).trim().split(/\s+/); }
  function stripCommas(s) { return String(s).replace(/,(?=\s)/g, ''); }
  function series(items, serial, conj) {
    conj = conj || 'and';
    if (items.length === 2) return items[0] + ' ' + conj + ' ' + items[1];
    return items.slice(0, -1).join(', ') + (serial ? ',' : '') + ' ' + conj + ' ' + items[items.length - 1];
  }
  function ol(items) { return '<ol>' + items.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>'; }
  // numbered gaps in a quiet wr-punct: the marks of `correct` (a sentence) taken out, the gaps after the words that carry
  // a mark, plus k decoy gaps (never after the last word or a word that already carries a mark, never in `avoid`). Returns { viz, gaps, right (0-based indexes
  // into gaps), text, after: [the word before each right gap] }
  function markGaps(correct, R, k, mark, avoid) {
    mark = mark || ',';
    var re = mark === ',' ? /,$/ : new RegExp('\\' + mark + '$');
    var toks = words(correct), plain = [], at = [];
    toks.forEach(function (t, i) { if (re.test(t)) { at.push(i); plain.push(t.slice(0, -1)); } else plain.push(t); });
    var cand = []; for (var i = 0; i < toks.length - 1; i++) if (at.indexOf(i) < 0 && !/[,.;:!?—”)]$/.test(toks[i]) && (!avoid || avoid.indexOf(i) < 0)) cand.push(i);
    var dec = samp(R, cand, Math.min(k, cand.length));
    var gaps = at.concat(dec).sort(function (a, b) { return a - b; });
    var right = gaps.map(function (g, j) { return at.indexOf(g) >= 0 ? j : -1; }).filter(function (j) { return j >= 0; });
    return { text: plain.join(' '), gaps: gaps, right: right, after: at.map(function (i) { return plain[i]; }),
      viz: { name: 'wr-punct', opts: { text: plain.join(' '), gaps: gaps, quiet: true, interactive: false } } };
  }
  function gapAnswer(M) { return mcKeep(nums(M.gaps.length), M.right.length === 1 ? M.right[0] : M.right); }
  function gapNames(M) { return M.right.map(function (j) { return (j + 1) + ' (after “' + M.after[M.right.indexOf(j)] + '”)'; }).join(', '); }
  function article(w) { return W() && W().article ? W().article(w) : (/^[aeiou]/i.test(w) ? 'an' : 'a'); }
  function ingOf(v) { return W() && W().ing ? W().ing(v) : v + 'ing'; }

  /* ---------------------------------------------------------------- shared banks (original sentences) */
  // clause pairs: subject, pronoun, two verb phrases with the same subject, the joining conjunction that fits the meaning,
  // and whether a compound verb with that conjunction reads well (so … as a compound verb doesn't)
  var PAIRS = [
    { s: 'Mia', p: 'she', a: 'ran to the corner', b: 'waved at the bus', c: 'and', sub: 'After' },
    { s: 'The dog', p: 'it', a: 'barked at the door', b: 'wagged its tail', c: 'and', sub: 'After' },
    { s: 'Ben', p: 'he', a: 'studied for an hour', b: 'still missed two questions', c: 'but', sub: 'Although' },
    { s: 'Grandpa', p: 'he', a: 'planted tomatoes in May', b: 'watered them every morning', c: 'and', sub: 'After' },
    { s: 'Ana', p: 'she', a: 'likes soccer', b: 'doesn’t like basketball', c: 'but', sub: 'Although' },
    { s: 'The baby', p: 'she', a: 'laughed at the puppet', b: 'clapped her hands', c: 'and', sub: 'After' },
    { s: 'Leo', p: 'he', a: 'was very tired', b: 'kept working on his model', c: 'but', sub: 'Although' },
    { s: 'The bakery', p: 'it', a: 'opens at six', b: 'sells out of bread by noon', c: 'but', sub: 'Although' },
    { s: 'Sam', p: 'he', a: 'forgot his umbrella', b: 'got soaked on the way home', c: 'so', noVerb: true, sub: 'Because' },
    { s: 'My sister', p: 'she', a: 'practiced the song all week', b: 'sang it perfectly at the show', c: 'and', sub: 'After' },
    { s: 'The museum', p: 'it', a: 'was crowded', b: 'was worth the long trip', c: 'but', sub: 'Although' },
    { s: 'Dad', p: 'he', a: 'burned the toast', b: 'made pancakes instead', c: 'so', noVerb: true, sub: 'Because' },
    { s: 'The puppy', p: 'it', a: 'chewed my left shoe', b: 'hid under the bed', c: 'and', sub: 'After' },
    { s: 'Ms. Park', p: 'she', a: 'read the story aloud', b: 'asked us three questions', c: 'and', sub: 'After' },
    { s: 'The river', p: 'it', a: 'rose quickly in the storm', b: 'flooded the low road', c: 'and', sub: 'After' },
    { s: 'Our team', p: 'we', a: 'lost the first game', b: 'won the next three', c: 'but', sub: 'Although', plural: true },
    { s: 'The library', p: 'it', a: 'got new computers', b: 'added a reading room', c: 'and', sub: 'After' },
    { s: 'Grandma', p: 'she', a: 'missed the early train', b: 'took a taxi to the station', c: 'so', noVerb: true, sub: 'Because' }
  ];
  function clause1(P) { return P.s + ' ' + P.a; }
  function clause2(P) { return P.p + ' ' + P.b; }
  function compound(P, conj) { return clause1(P) + ', ' + (conj || P.c) + ' ' + clause2(P) + '.'; }
  function compoundVerb(P) { return clause1(P) + ' ' + P.c + ' ' + P.b + '.'; }
  function runOn(P) { return clause1(P) + ' ' + clause2(P) + '.'; }
  function splice(P) { return clause1(P) + ', ' + clause2(P) + '.'; }
  function semi(P) { return clause1(P) + '; ' + clause2(P) + '.'; }
  function twoSent(P) { return clause1(P) + '. ' + cap(clause2(P)) + '.'; }
  function subOpen(P) { return P.sub + ' ' + low(P.s) + ' ' + P.a + ', ' + clause2(P) + '.'; }
  // a conjunctive adverb that fits the link: contrast → however, result → therefore, addition → then
  function adverbFor(P) { return P.c === 'but' ? 'however' : P.c === 'so' ? 'therefore' : 'then'; }
  function semiAdv(P) { return clause1(P) + '; ' + adverbFor(P) + ', ' + clause2(P) + '.'; }
  function commaAdv(P) { return clause1(P) + ', ' + adverbFor(P) + ' ' + clause2(P) + '.'; }
  function commaAdv2(P) { return clause1(P) + ', ' + adverbFor(P) + ', ' + clause2(P) + '.'; }

  var CITIES = [['Akron', 'Ohio'], ['Boise', 'Idaho'], ['Tulsa', 'Oklahoma'], ['Reno', 'Nevada'], ['Austin', 'Texas'], ['Salem', 'Oregon'],
    ['Provo', 'Utah'], ['Bangor', 'Maine'], ['Dayton', 'Ohio'], ['Mobile', 'Alabama'], ['Fresno', 'California'], ['Tampa', 'Florida'],
    ['Duluth', 'Minnesota'], ['Macon', 'Georgia']];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var NAMES = ['Sam', 'Mia', 'Ana', 'Ben', 'Leo', 'Grandma', 'Dad', 'Mom', 'Ms. Park', 'Mr. Diaz', 'Coach Lee', 'Nora'];

  /* ================================================================ unit 5: Punctuation */

  /* ---------------------------------------------------------------- usage.commas-series */
  // frames: words before the series, a pool of items, words after (may be empty); items in a pool are the same kind
  var SERIES = [
    { pre: 'We packed', pool: ['sandwiches', 'apples', 'lemonade', 'pretzels', 'carrot sticks'], post: 'for the picnic' },
    { pre: 'Mia can', pool: ['sing', 'dance', 'play the drums', 'juggle', 'whistle'], post: '' },
    { pre: 'The garden has', pool: ['roses', 'tulips', 'sunflowers', 'daisies', 'mint'], post: 'along the fence' },
    { pre: 'For the trip we need', pool: ['a map', 'two flashlights', 'a tent', 'warm socks', 'a first-aid kit'], post: '' },
    { pre: 'On Saturday we', pool: ['cleaned the garage', 'washed the car', 'raked the leaves', 'fixed the gate', 'walked the dog'], post: '' },
    { pre: 'The zoo has', pool: ['lions', 'zebras', 'penguins', 'giraffes', 'a sleepy bear'], post: 'near the gate' },
    { pre: 'My little brother collects', pool: ['rocks', 'stamps', 'bottle caps', 'old keys', 'shells'], post: '' },
    { pre: 'Please bring', pool: ['a pencil', 'an eraser', 'a ruler', 'colored markers', 'glue'], post: 'to class' },
    { pre: 'Grandpa', pool: ['fixed the fence', 'painted the shed', 'swept the porch', 'fed the hens', 'mended the net'], post: 'before lunch' },
    { pre: 'The soup has', pool: ['onions', 'carrots', 'beans', 'celery', 'potatoes'], post: 'in it' },
    { pre: 'You can pay with', pool: ['cash', 'a check', 'a card', 'coins'], post: '', conj: 'or' },
    { pre: 'For dessert you can pick', pool: ['pie', 'cake', 'ice cream', 'fruit'], post: '', conj: 'or' },
    { pre: 'Our class read', pool: ['poems', 'fables', 'tall tales', 'myths', 'letters'], post: 'this year' }
  ];
  // series whose last item has its own and: the serial comma keeps it clear (even AP style adds it)
  var SERIES_AND = [
    { pre: 'For lunch we had', items: ['soup', 'salad', 'macaroni and cheese'] },
    { pre: 'The shop sells', items: ['jam', 'honey', 'peanut butter and jelly sandwiches'] },
    { pre: 'We needed', items: ['flour', 'sugar', 'salt and pepper'] },
    { pre: 'The band played', items: ['jazz', 'blues', 'rock and roll'] },
    { pre: 'My favorite breakfasts are', items: ['oatmeal', 'pancakes', 'ham and eggs'] },
    { pre: 'The art box held', items: ['crayons', 'glue', 'paper and scissors'] }
  ];
  function seriesSentence(F, items, serial) { return F.pre + ' ' + series(items, serial, F.conj) + (F.post ? ' ' + F.post : '') + '.'; }
  G('usage.commas-series', function (R, ctx) {
    var F = R.pick(SERIES), n = ML.byLevel(ctx, 3, R.pick([3, 4]), 4), items = samp(R, F.pool, n), conj = F.conj || 'and';
    var shape = ML.byLevel(ctx, R.pick(['pick', 'count']), R.pick(['gaps', 'both', 'style']), R.pick(['clear', 'gaps', 'both']));
    var withS = seriesSentence(F, items, true), noS = seriesSentence(F, items, false);
    var noCommas = F.pre + ' ' + items.slice(0, -1).join(' ') + ' ' + conj + ' ' + items[n - 1] + (F.post ? ' ' + F.post : '') + '.';
    var afterLast = F.post ? F.pre + ' ' + series(items, true, conj) + ', ' + F.post + '.' : F.pre + ', ' + series(items, true, conj) + '.';
    var afterConj = F.pre + ' ' + items.slice(0, -1).join(', ') + ' ' + conj + ', ' + items[n - 1] + (F.post ? ' ' + F.post : '') + '.';
    var itemsList = items.map(function (x) { return '<i>' + x + '</i>'; }).join(' / ');
    if (shape === 'pick') {
      var right = R.coin() ? withS : noS;
      return { q: para('Which sentence uses commas correctly?'), a: mc(right, [noCommas, afterLast, afterConj].slice(0, ctx.level === 1 ? 2 : 3)),
        hint: 'Find the items. A comma goes after each one except the last.',
        steps: ['The items are ' + itemsList + '.', 'A comma goes after each item except the last. The comma right before <i>' + conj + '</i> is the serial comma: a style choice.', 'No comma goes after the last item or after <i>' + conj + '</i>.', 'Correct: ' + right] };
    }
    if (shape === 'count') {
      return { q: q([para('How many commas does this series need in Chicago or MLA style, which use the serial comma?'), say(noCommas)]), a: mcKeep(['1', '2', '3', '4'], n - 2),
        hint: 'Count the items, then put a comma after each one except the last.',
        steps: ['The items are ' + itemsList + ': ' + n + ' items.', 'With the serial comma, every item except the last gets a comma: ' + (n - 1) + ' commas.', withS] };
    }
    if (shape === 'gaps') {
      var M = markGaps(withS, R, ctx.level === 3 ? 2 : 1);
      return { q: para('In Chicago style (with the serial comma), which numbered gaps need a comma? Choose all that apply.'), a: gapAnswer(M), viz: M.viz,
        hint: 'Find where each item ends.',
        steps: ['The items are ' + itemsList + '.', 'A comma goes after each item except the last, including the one before <i>' + conj + '</i>.', 'Commas at gaps ' + gapNames(M) + '.', withS] };
    }
    if (shape === 'both') {
      var wr = samp(R, [noCommas, afterLast, afterConj], 2);
      return { q: para('Which sentences are punctuated in a standard way? Choose all that apply.'), a: mcAll([withS, noS], wr),
        hint: 'The comma before the last item is a style choice. Look for commas in the wrong places.',
        steps: ['With the serial comma (Chicago, MLA, APA): ' + withS, 'Without it (AP style): ' + noS, 'Both are standard.', 'The others leave out commas between items or put one after the last item or after <i>' + conj + '</i>.'] };
    }
    if (shape === 'style') {
      var gd = R.pick([['AP Stylebook (most newspapers)', true], ['Chicago Manual of Style', false], ['MLA Handbook', false], ['APA Publication Manual', false]]);
      return { q: q([para('Does the <b>' + gd[0] + '</b> usually put a comma before <i>' + conj + '</i> in a simple series like this one?'), say(withS)]), a: yn(!gd[1]),
        hint: 'Newspapers usually skip it; book and school styles use it.',
        steps: ['Chicago, MLA and APA use the serial comma.', 'The AP Stylebook usually leaves it out unless leaving it out would confuse.', 'So the ' + gd[0] + (gd[1] ? ' usually leaves it out.' : ' uses it.')] };
    }
    // clear: an item with its own and
    var S = R.pick(SERIES_AND), it = S.items, last = it[2];
    var good = S.pre + ' ' + it[0] + ', ' + it[1] + ', and ' + last + '.', amb = S.pre + ' ' + it[0] + ', ' + it[1] + ' and ' + last + '.';
    var bad = S.pre + ' ' + it[0] + ', ' + it[1] + ', ' + last.replace(' and ', ', and ') + '.';
    return { q: para('The last item is <i>' + last + '</i>. Which sentence is clearest?'), a: mc(good, [amb, bad]),
      hint: 'Without the serial comma, the last two items run together.',
      steps: ['The items are <i>' + it[0] + '</i> / <i>' + it[1] + '</i> / <i>' + last + '</i>.', 'Without a comma before <i>and</i>, “' + it[1] + ' and ' + last + '” reads as one mixed-up item.', 'The serial comma keeps them apart; even AP style adds it here.', good] };
  });

  /* ---------------------------------------------------------------- usage.commas-everyday */
  var DATE_MAIN = ['the library opened', 'our team won the city final', 'my sister was born', 'we planted the oak tree', 'the new bridge opened', 'the school held its first science fair', 'my grandparents moved to the farm'];
  var EAT = [['eat', 'Grandma'], ['paint', 'Dad'], ['call', 'Sam'], ['draw', 'Mom'], ['help', 'Coach'], ['wash', 'Ben'], ['cook', 'Nora']];
  function everyday(R) { // a correct sentence and a description of its commas
    var kind = R.pick(['date', 'place', 'yes', 'address', 'tag', 'addressMid']);
    if (kind === 'date') { var m = R.pick(MONTHS), d = R.int(1, 28), y = R.int(1990, 2025), c = R.pick(DATE_MAIN);
      return { kind: kind, s: 'On ' + m + ' ' + d + ', ' + y + ', ' + c + '.', why: 'A comma between the day and the year, and another after the year because the sentence goes on.' }; }
    if (kind === 'place') { var P = samp(R, CITIES, 2);
      return { kind: kind, s: R.pick(['We drove from ' + P[0][0] + ', ' + P[0][1] + ', to ' + P[1][0] + ' last summer.', 'My cousin moved to ' + P[0][0] + ', ' + P[0][1] + ', in the spring.', P[0][0] + ', ' + P[0][1] + ', is where my aunt grew up.']),
        why: 'A comma between the city and the state, and another after the state because the sentence goes on.' }; }
    if (kind === 'yes') return { kind: kind, s: R.pick(['Yes, I finished my homework.', 'No, thank you.', 'Yes, the bus is here.', 'No, the store is closed today.', 'Yes, we can go after lunch.']), why: 'A comma after yes or no at the start.' };
    if (kind === 'tag') return { kind: kind, s: R.pick(['It’s cold today, isn’t it?', 'You finished the book, didn’t you?', 'The game starts at noon, doesn’t it?', 'We can walk there, can’t we?']), why: 'A comma before the short tag question at the end.' };
    var nm = R.pick(NAMES);
    if (kind === 'addressMid') return { kind: kind, s: 'I think, ' + nm + ', that the bus is late.', why: 'The name of the person spoken to gets a comma on each side.' };
    return { kind: kind, s: R.pick([nm + ', please close the door.', 'Can you help me, ' + nm + '?', 'Thanks for the ride, ' + nm + '.', nm + ', the soup is ready.']), why: 'A comma sets off the name of the person spoken to.' };
  }
  G('usage.commas-everyday', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'pick', R.pick(['gaps', 'pick']), R.pick(['meaning', 'second', 'gaps']));
    if (shape === 'meaning') {
      var E = R.pick(EAT), withC = 'Let’s ' + E[0] + ', ' + E[1] + '!', noC = 'Let’s ' + E[0] + ' ' + E[1] + '!';
      var askTo = R.coin();
      return { q: para(askTo ? 'In which sentence is the speaker talking <b>to</b> ' + E[1] + '?' : 'In which sentence is ' + E[1] + ' the one being ' + W().pp(E[0]) + '?'), a: mc(askTo ? withC : noC, [askTo ? noC : withC]),
        hint: 'A comma before a name shows the name is the person spoken to.',
        steps: ['“' + withC + '” speaks to ' + E[1] + ': the comma sets off the name (direct address).', '“' + noC + '” makes ' + E[1] + ' the object of <i>' + E[0] + '</i>.', 'One comma changes the meaning.'] };
    }
    var X = everyday(R);
    if (shape === 'second') {
      while (X.kind !== 'date' && X.kind !== 'place') X = everyday(R);
      var toks = words(X.s), commas = []; toks.forEach(function (t, i) { if (/,$/.test(t)) commas.push(i); });
      var dropLast = toks.map(function (t, i) { return i === commas[1] ? t.slice(0, -1) : t; }).join(' ');
      var dropFirst = toks.map(function (t, i) { return i === commas[0] ? t.slice(0, -1) : t; }).join(' ');
      var none = stripCommas(X.s);
      return { q: para('Which sentence uses commas correctly?'), a: mc(X.s, [dropLast, dropFirst, none].slice(0, ctx.level === 3 ? 3 : 2)),
        hint: 'In the middle of a sentence, a year or a state is closed off on both sides.',
        steps: [X.why, 'Leaving out the second comma is the most common slip.', X.s] };
    }
    if (shape === 'gaps') {
      var M = markGaps(X.s, R, ctx.level === 3 ? 2 : 1);
      return { q: para('Which numbered gaps need a comma? Choose all that apply.'), a: gapAnswer(M), viz: M.viz,
        hint: 'Look for a date, a place, yes or no, a tag question, or a name of someone spoken to.',
        steps: [X.why, 'Commas at gaps ' + gapNames(M) + '.', X.s] };
    }
    var t = words(X.s), ci = []; t.forEach(function (w, i) { if (/,$/.test(w)) ci.push(i); });
    var wrongs = [stripCommas(X.s)];
    if (ci.length > 1) wrongs.push(t.map(function (w, i) { return i === ci[1] ? w.slice(0, -1) : w; }).join(' '));
    if (X.kind === 'date') wrongs.push(X.s.replace(/^On (\w+) /, 'On $1, '));
    else { var j = R.pick(t.map(function (_, i) { return i; }).filter(function (i) { return ci.indexOf(i) < 0 && i < t.length - 1 && i > 0; })); wrongs.push(t.map(function (w, i) { return i === j ? w + ',' : w; }).join(' ')); }
    return { q: para('Which sentence uses commas correctly?'), a: mc(X.s, samp(R, wrongs, Math.min(2, wrongs.length))),
      hint: 'Check dates, places, yes and no, tag questions, and names of people spoken to.',
      steps: [X.why, X.s] };
  });

  /* ---------------------------------------------------------------- usage.commas-compound */
  G('usage.commas-compound', function (R, ctx) {
    // compound verbs come only from and-pairs: with but, a comma before a contrasting second verb is allowed by some guides
    var isC = R.coin(), P = R.pick(PAIRS.filter(function (x) { return isC || x.c === 'and'; })), shape = ML.byLevel(ctx, 'yn', R.pick(['pick', 'yn']), R.pick(['all', 'pick']));
    if (shape === 'yn') {
      var s = isC ? clause1(P) + ' ' + P.c + ' ' + clause2(P) + '.' : compoundVerb(P);
      return { q: q([para('Should a comma go before <i>' + P.c + '</i> in this sentence?'), say(s)]), a: yn(isC),
        hint: 'Is there a new subject right after the conjunction?',
        steps: isC ? ['After <i>' + P.c + '</i> comes a new subject and verb: “' + clause2(P) + '.”', 'Both sides are independent clauses, so a comma goes before <i>' + P.c + '</i>.', compound(P)]
          : ['After <i>' + P.c + '</i> there is no new subject: “' + P.b + '” shares the subject ' + low(P.s) + '.', 'It is one clause with a compound verb, so no comma.', compoundVerb(P)] };
    }
    var right = isC ? compound(P) : compoundVerb(P);
    var badVerbComma = clause1(P) + ', ' + P.c + ' ' + P.b + '.';
    var afterConj = clause1(P) + ' ' + P.c + ', ' + clause2(P) + '.';
    var splc = splice(P);
    if (shape === 'pick') {
      var wr = P.noVerb ? [afterConj, splc] : (isC ? [afterConj, badVerbComma] : [badVerbComma, afterConj]);
      return { q: para('Which sentence is punctuated correctly?'), a: mc(right, wr),
        hint: 'A comma goes before the conjunction only when a full clause follows it.',
        steps: [isC ? 'The sentence joins two clauses, so the comma goes before <i>' + P.c + '</i>, not after it.' : 'One subject with two verbs: no comma.', right] };
    }
    // all: several sentences, choose the correct ones
    var Q = R.pick(PAIRS.filter(function (x) { return x !== P && x.c === 'and'; }));
    var rights = [compound(P), compoundVerb(Q)], wrongs = [clause1(Q) + ', ' + Q.c + ' ' + Q.b + '.', afterConj];
    return { q: para('Which sentences are punctuated correctly? Choose all that apply.'), a: mcAll(rights, wrongs),
      hint: 'For each one, check whether a new subject follows the conjunction.',
      steps: ['“' + compound(P) + '” joins two independent clauses: comma before <i>' + P.c + '</i>.', '“' + compoundVerb(Q) + '” has one subject and two verbs: no comma.', 'A comma before a compound verb, or after the conjunction, is wrong.'] };
  });

  /* ---------------------------------------------------------------- usage.commas-introductory */
  var OPEN = [
    ['When the bell rang', 'we packed our bags', 'dep'], ['Because the road was icy', 'the bus came late', 'dep'], ['After the game ended', 'the players shook hands', 'dep'],
    ['If it rains tomorrow', 'the race will move indoors', 'dep'], ['Although she was tired', 'Nora finished the race', 'dep'], ['While we were eating', 'the dog barked at the window', 'dep'],
    ['Before the movie started', 'we bought popcorn', 'dep'], ['Since the store was closed', 'we went home', 'dep'], ['As soon as the sun came up', 'the birds began to sing', 'dep'],
    ['After the long game on Saturday afternoon', 'we went out for pizza', 'long'], ['At the end of a long school day', 'Leo fell asleep on the couch', 'long'],
    ['During the first week of summer vacation', 'my cousins visited', 'long'], ['With a big smile on her face', 'Grandma opened the gift', 'long'],
    ['In the back of the old green truck', 'we found a box of photos', 'long'], ['However', 'the test was easier than we feared', 'word'], ['Yes', 'the tickets are still on sale', 'word'],
    ['Well', 'that was a surprise', 'word'], ['Finally', 'the rain stopped', 'word']
  ];
  var SHORT_OPEN = [['At noon', 'we ate lunch'], ['In 2020', 'we moved to Ohio'], ['Today', 'we start a new book'], ['On Monday', 'the pool opens'], ['Last night', 'it snowed']];
  var KIND_WHY = { dep: 'It opens with a dependent clause', long: 'It opens with a long phrase', word: 'It opens with an introductory word' };
  G('usage.commas-introductory', function (R, ctx) {
    var O = R.pick(OPEN), right = O[0] + ', ' + O[1] + '.', shape = ML.byLevel(ctx, 'where', R.pick(['pick', 'end']), R.pick(['optional', 'where', 'end']));
    if (shape === 'where') {
      var M = markGaps(right, R, 2);
      return { q: para('After which numbered gap does the comma go?'), a: gapAnswer(M), viz: M.viz,
        hint: 'Find where the main clause begins.',
        steps: ['The main clause is “' + O[1] + '.”', KIND_WHY[O[2]] + ': “' + O[0] + '.”', 'The comma goes where the opener ends: gap ' + gapNames(M) + '.', right] };
    }
    if (shape === 'pick') {
      var ow = words(O[0]), wrongs = [];
      if (ow.length > 2) { var k = R.int(0, ow.length - 2); wrongs.push(ow.map(function (w, i) { return i === k ? w + ',' : w; }).join(' ') + ' ' + O[1] + '.'); }
      var mw = words(O[1]); wrongs.push(O[0] + ' ' + mw[0] + ', ' + mw.slice(1).join(' ') + '.');
      if (O[2] !== 'word') wrongs.push(O[0] + ' ' + O[1] + '.');
      return { q: para('Which sentence is punctuated correctly?'), a: mc(right, wrongs.slice(0, 2)),
        hint: 'The comma goes right where the opener ends.',
        steps: [KIND_WHY[O[2]] + ': “' + O[0] + '.”', 'The main clause starts with “' + words(O[1])[0] + '.”', right] };
    }
    if (shape === 'end') {
      // (although-clauses at the end often take a comma for contrast, so they are left out here)
      var dep = OPEN.filter(function (x) { return x[2] === 'dep' && !/^Although/.test(x[0]); }), D = dep.indexOf(O) >= 0 ? O : R.pick(dep);
      var first = D[0] + ' ' + D[1] + '.', last = cap(D[1]) + ' ' + D[0].charAt(0).toLowerCase() + D[0].slice(1) + '.';
      return { q: para('Which sentence needs a comma added?'), a: mc(first, [last]),
        hint: 'Where is the dependent clause: at the start or at the end?',
        steps: ['In “' + first + '” the dependent clause comes first, so it needs a comma: “' + D[0] + ', ' + D[1] + '.”', 'In “' + last + '” it comes at the end, where it usually takes no comma.'] };
    }
    // optional: a short opener may go either way
    var S = R.pick(SHORT_OPEN), a1 = S[0] + ' ' + S[1] + '.', a2 = S[0] + ', ' + S[1] + '.', sw = words(S[1]);
    var bad = S[0] + ' ' + sw[0] + ', ' + sw.slice(1).join(' ') + '.';
    var bad2 = D2();
    function D2() { var d = R.pick(OPEN.filter(function (x) { return x[2] === 'dep'; })); return d[0] + ' ' + d[1] + '.'; }
    return { q: para('Which sentences are punctuated in a standard way? Choose all that apply.'), a: mcAll([a1, a2], [bad, bad2]),
      hint: 'After a short opening phrase, the comma is optional.',
      steps: ['“' + S[0] + '” is a short opening phrase, so the comma after it is optional: both versions are standard.', '“' + bad2 + '” opens with a dependent clause and needs a comma after it.', 'A comma between a subject and its verb is never right.'] };
  });

  /* ---------------------------------------------------------------- usage.commas-coordinate */
  var COORD = [['a', 'long', 'cold', 'winter'], ['a', 'bright', 'cheerful', 'kitchen'], ['a', 'quiet', 'patient', 'teacher'], ['a', 'soft', 'fluffy', 'blanket'],
    ['a', 'warm', 'sunny', 'afternoon'], ['a', 'noisy', 'crowded', 'bus'], ['a', 'dark', 'stormy', 'night'], ['a', 'clever', 'funny', 'story'],
    ['a', 'kind', 'generous', 'neighbor'], ['a', 'steep', 'rocky', 'trail'], ['a', 'hot', 'dusty', 'road'], ['a', 'calm', 'gentle', 'voice']];
  var CUMUL = [['a', 'big', 'red', 'barn'], ['', 'three', 'small', 'puppies'], ['an', 'old', 'stone', 'wall'], ['a', 'little', 'brown', 'puppy'],
['', 'two', 'wooden', 'chairs'], ['a', 'delicious', 'chocolate', 'cake'], ['a', 'tall', 'oak', 'tree'],
    ['a', 'cozy', 'wool', 'sweater'], ['a', 'huge', 'stone', 'castle'], ['a', 'tiny', 'green', 'frog'], ['a', 'heavy', 'iron', 'gate'], ['a', 'beautiful', 'old', 'house']];
  function adjPhrase(A, comma) { return (A[0] ? A[0] + ' ' : '') + A[1] + (comma ? ',' : '') + ' ' + A[2] + ' ' + A[3]; }
  function swapPhrase(A) { var art = A[0] ? article(A[2]) + ' ' : ''; return art + A[2] + ' ' + A[1] + ' ' + A[3]; }
  function andPhrase(A) { return (A[0] ? A[0] + ' ' : '') + A[1] + ' and ' + A[2] + ' ' + A[3]; }
  G('usage.commas-coordinate', function (R, ctx) {
    var co = R.coin(), A = R.pick(co ? COORD : CUMUL), shape = ML.byLevel(ctx, 'yn', R.pick(['pick', 'test']), R.pick(['all', 'pick']));
    var tests = co ? ['Switch them: “' + swapPhrase(A) + '” sounds natural.', 'Put and between them: “' + andPhrase(A) + '” sounds natural.', 'They are coordinate adjectives: use a comma.']
      : ['Switch them: “' + swapPhrase(A) + '” sounds wrong.', 'Put and between them: “' + andPhrase(A) + '” sounds odd.', 'They are cumulative adjectives: no comma.'];
    if (shape === 'yn') return { q: q([para('Should a comma go between <i>' + A[1] + '</i> and <i>' + A[2] + '</i>?'), say(cap(adjPhrase(A, false)))]), a: yn(co),
      hint: 'Try switching the two adjectives, or putting and between them.', steps: tests.concat([adjPhrase(A, co)]) };
    if (shape === 'pick') {
      var right = adjPhrase(A, co), wr = [adjPhrase(A, !co), (A[0] ? A[0] + ' ' : '') + A[1] + ', ' + A[2] + ', ' + A[3]];
      return { q: para('Which phrase is punctuated correctly?'), a: mc(right, wr),
        hint: 'Use the switch test and the and test. A comma never goes between the last adjective and the noun.', steps: tests.concat([right]) };
    }
    if (shape === 'test') {
      var C = R.pick(COORD);
      return { q: para('How can you tell that <i>' + C[1] + '</i> and <i>' + C[2] + '</i> in “' + adjPhrase(C, false) + '” need a comma between them?'),
        a: mc('You can switch their order or put and between them, and it still sounds natural.', ['Both of them come before the noun.', 'One of them is longer than the other.', 'All adjectives in a row need commas.']),
        hint: 'Think of the two tests.', steps: ['Switch: “' + swapPhrase(C) + '.” And: “' + andPhrase(C) + '.” Both sound natural.', 'So the adjectives are coordinate: ' + adjPhrase(C, true) + '.', 'Being before the noun is true of cumulative adjectives too, so it isn’t a test.'] };
    }
    var c2 = samp(R, COORD, 2), u2 = samp(R, CUMUL, 2);
    return { q: para('Which phrases need a comma between the adjectives? Choose all that apply.'), a: mcAll(c2.map(function (x) { return adjPhrase(x, false); }), u2.map(function (x) { return adjPhrase(x, false); })),
      hint: 'Use the switch test and the and test on each one.',
      steps: [c2.map(function (x) { return adjPhrase(x, true); }).join('; ') + ': coordinate, so commas.', u2.map(function (x) { return adjPhrase(x, false); }).join('; ') + ': cumulative (switching sounds wrong), so no commas.'] };
  });

  /* ---------------------------------------------------------------- usage.commas-nonessential */
  var NONESS = [['Mount Rainier', 'which is in Washington', 'is a volcano'], ['Our principal', 'Ms. Lee', 'visited our class today'], ['Jupiter', 'which is the largest planet', 'has dozens of moons'],
    ['The Mississippi River', 'which flows into the Gulf of Mexico', 'is more than two thousand miles long'], ['My mother', 'who grew up in Maine', 'loves blueberry pie'],
    ['Abraham Lincoln', 'who was born in Kentucky', 'was the sixteenth president'], ['The Pacific Ocean', 'which is the largest ocean', 'covers about a third of Earth’s surface'],
    ['Ms. Diaz', 'our music teacher', 'plays the cello'], ['Grandpa', 'who is seventy today', 'still rides his bike to town'], ['Our dog', 'a very old beagle', 'still chases squirrels']];
  var ESS = [['The students', 'who finished early', 'went outside'], ['The book', 'that I borrowed', 'is overdue'], ['Anyone', 'who wants a snack', 'should raise a hand'],
    ['The author', 'Louisa May Alcott', 'wrote Little Women'], ['The dog', 'that lives next door', 'barks all night'], ['Players', 'who miss practice', 'can’t start the game'],
    ['The bike', 'with the flat tire', 'is mine'], ['The poem', 'that won the contest', 'was about the sea'], ['Students', 'who ride the bus', 'leave at three'], ['The girl', 'in the red coat', 'is my cousin']];
  function withExtra(E, commas) { return commas ? E[0] + ', ' + E[1] + ', ' + E[2] + '.' : E[0] + ' ' + E[1] + ' ' + E[2] + '.'; }
  var RELATIVES = [['sister', 'Texas', 'a nurse'], ['brother', 'Ohio', 'a pilot'], ['cousin', 'Maine', 'a baker'], ['uncle', 'Utah', 'a teacher'], ['aunt', 'Idaho', 'a doctor']];
  G('usage.commas-nonessential', function (R, ctx) {
    var ne = R.coin(), E = R.pick(ne ? NONESS : ESS), shape = ML.byLevel(ctx, 'yn', R.pick(['pick', 'yn']), R.pick(['meaning', 'which', 'pick']));
    var test = 'Take the words out: “' + E[0] + ' ' + E[2] + '.” ' + (ne ? 'We still know exactly who or what, so the words are extra: commas.' : 'Now we can’t tell which one, so the words are essential: no commas.');
    if (shape === 'yn') return { q: q([para('Should the underlined words be set off with commas?'), say(E[0] + ' <u>' + E[1] + '</u> ' + E[2] + '.')]), a: yn(ne),
      hint: 'Take the words out. Does the sentence still tell which one?', steps: [test, withExtra(E, ne)] };
    if (shape === 'pick') {
      var one = E[0] + ', ' + E[1] + ' ' + E[2] + '.';
      return { q: para('Which sentence is punctuated correctly?'), a: mc(withExtra(E, ne), [withExtra(E, !ne), one]),
        hint: 'Extra information takes a pair of commas; essential information takes none.', steps: [test, 'Extra words in the middle of a sentence need a comma on each side, never just one.', withExtra(E, ne)] };
    }
    if (shape === 'meaning') {
      var X = R.pick(RELATIVES), a = 'My ' + X[0] + ' who lives in ' + X[1] + ' is ' + X[2] + '.', b = 'My ' + X[0] + ', who lives in ' + X[1] + ', is ' + X[2] + '.', more = R.coin();
      return { q: para('Which sentence suggests that the writer has <b>' + (more ? 'more than one' : 'only one') + '</b> ' + X[0] + '?'), a: mc(more ? a : b, [more ? b : a]),
        hint: 'Without commas, the clause tells which one. With commas, it is extra.',
        steps: ['“' + a + '” uses the clause to pick out one ' + X[0] + ' from several: no commas, essential.', '“' + b + '” treats the clause as extra news about the only ' + X[0] + ': commas.'] };
    }
    // which: what usage guides say about which and that
    var opts = [['For an essential clause, which word do American usage guides prefer?', 'that', ['which', 'who']], ['A clause that starts with which and adds extra information is set off how?', 'With a pair of commas', ['With no commas', 'With one comma before which']],
      ['Is “the book which I lent you” (an essential clause with which, no commas) an error?', 'No: it is standard, especially in British English, though American guides prefer that', ['Yes: which can never start an essential clause', 'Yes: it needs commas']]];
    var O = R.pick(opts);
    return { q: para(O[0]), a: mc(O[1], O[2]), hint: 'Think about what the guides prefer, and what is still standard.',
      steps: ['American usage guides prefer that for essential clauses and which, with commas, for extra ones.', 'Which in an essential clause is still standard English, especially in British English, so it isn’t scored as an error.'] };
  });

  /* ---------------------------------------------------------------- usage.semicolons */
  var LISTS3 = function (R) { var c = samp(R, CITIES, 3); return c; };
  G('usage.semicolons', function (R, ctx) {
    var P = R.pick(PAIRS), shape = ML.byLevel(ctx, 'pick', R.pick(['adverb', 'list', 'pick']), R.pick(['all', 'adverb', 'list']));
    var right = semi(P), afterDep = P.sub + ' ' + low(P.s) + ' ' + P.a + '; ' + clause2(P) + '.', beforeList = R.pick(['I need three things; flour, eggs, and milk.', 'Bring these tools; a hammer, a saw, and some nails.', 'We saw three animals; a fox, a deer, and an owl.']);
    if (shape === 'pick') return { q: para('Which sentence uses a semicolon correctly?'), a: mc(right, [afterDep, beforeList]),
      hint: 'Could a period go where the semicolon is?',
      steps: ['“' + right + '” joins two independent clauses: a period could go there, so a semicolon can too.', '“' + afterDep + '” puts it after a dependent clause; that spot takes a comma.', '“' + beforeList + '” introduces a list; that takes a colon.'] };
    if (shape === 'adverb') {
      P = R.pick(PAIRS.filter(function (x) { return x.c !== 'and'; }));
      var adv = adverbFor(P);
      return { q: para('Which sentence is punctuated correctly?'), a: mc(semiAdv(P), [commaAdv(P), commaAdv2(P)]),
        hint: 'Is <i>' + adv + '</i> a conjunction?',
        steps: ['<i>' + cap(adv) + '</i> is a conjunctive adverb, not a conjunction, so it can’t join two clauses with a comma.', 'Put a semicolon before it and a comma after it.', semiAdv(P)] };
    }
    if (shape === 'list') {
      var C = LISTS3(R), good = 'We visited ' + C[0][0] + ', ' + C[0][1] + '; ' + C[1][0] + ', ' + C[1][1] + '; and ' + C[2][0] + ', ' + C[2][1] + '.';
      var allC = 'We visited ' + C[0][0] + ', ' + C[0][1] + ', ' + C[1][0] + ', ' + C[1][1] + ', and ' + C[2][0] + ', ' + C[2][1] + '.';
      var mixed = 'We visited ' + C[0][0] + '; ' + C[0][1] + ', ' + C[1][0] + '; ' + C[1][1] + ', and ' + C[2][0] + '; ' + C[2][1] + '.';
      return { q: para('Which sentence is clearest?'), a: mc(good, [allC, mixed]),
        hint: 'Each place already has a comma inside it.',
        steps: ['Each item is a city and a state with its own comma.', 'Semicolons between the items show where each one ends.', good] };
    }
    var Q = R.pick(PAIRS.filter(function (x) { return x !== P && x.c !== 'and'; }));
    return { q: para('Which sentences use semicolons correctly? Choose all that apply.'), a: mcAll([right, semiAdv(Q)], [afterDep, beforeList]),
      hint: 'A semicolon needs an independent clause on each side (or list items that contain commas).',
      steps: ['“' + right + '” and “' + semiAdv(Q) + '” each join two independent clauses.', 'After a dependent clause, use a comma; before a list, use a colon.'] };
  });

  /* ---------------------------------------------------------------- usage.colons */
  var COLON_LISTS = [
    ['Bring three things', 'You should bring', ['a pencil', 'an eraser', 'a ruler']], ['The recipe needs four things', 'The recipe needs', ['flour', 'butter', 'sugar', 'eggs']],
    ['We saw three animals on the hike', 'On the hike we saw', ['a fox', 'a deer', 'an owl']], ['Our club has two rules', 'Our two rules are', ['be kind', 'clean up']],
    ['The kit includes three tools', 'The kit includes', ['a hammer', 'a saw', 'a level']], ['I have two favorite fruits', 'My favorite fruits are', ['apples', 'pears']],
    ['Pack these for the beach', 'For the beach, pack', ['sunscreen', 'towels', 'water']], ['The flag has three colors', 'The flag’s colors are', ['red', 'white', 'blue']]];
  var COLON_EXPL = [['The answer was clear', 'we needed a bigger tent'], ['Leo had one goal', 'to finish the race'], ['The problem was simple', 'the battery was dead'],
    ['Mia knew what to do', 'she called for help'], ['The sign said one thing', 'Keep out'], ['We learned a lesson', 'always check the weather']];
  G('usage.colons', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'pick', R.pick(['where', 'pick']), R.pick(['all', 'where', 'expl']));
    var C = R.pick(COLON_LISTS), list = series(C[2], true);
    var right = C[0] + ': ' + list + '.', afterVerb = C[1] + ': ' + list + '.', semiL = C[0] + '; ' + list + '.';
    if (shape === 'pick') return { q: para('Which sentence uses a colon correctly?'), a: mc(right, ctx.level === 1 ? [afterVerb] : [afterVerb, semiL]),
      hint: 'Cover the colon and everything after it. Is what’s left a complete sentence?',
      steps: ['“' + C[0] + '” is a complete sentence, so a colon can introduce the list after it.', '“' + C[1] + '” is not complete; no colon there.', right] };
    if (shape === 'where') {
      var M = markGaps(right, R, 2, ':');
      return { q: para('After which numbered gap should a colon go?'), a: gapAnswer(M), viz: M.viz,
        hint: 'Where does the complete sentence end and the list begin?',
        steps: ['“' + C[0] + '” is a complete sentence.', 'The list follows it, so the colon goes at gap ' + gapNames(M) + '.', right] };
    }
    if (shape === 'expl') {
      var E = R.pick(COLON_EXPL), good = E[0] + ': ' + E[1] + '.', w = words(E[0]), bad = w.slice(0, -1).join(' ') + ': ' + w[w.length - 1] + ' ' + E[1] + '.';
      var w2 = words(E[1]), bad2 = E[0] + ' ' + w2[0] + ': ' + w2.slice(1).join(' ') + '.';
      return { q: para('Which sentence uses a colon correctly?'), a: mc(good, [bad, bad2]),
        hint: 'The colon comes right after a complete sentence and points to what explains it.',
        steps: ['“' + E[0] + '” is a complete sentence, and “' + E[1] + '” explains it.', 'So the colon goes right after “' + w[w.length - 1] + '.”', good] };
    }
    var D = R.pick(COLON_LISTS.filter(function (x) { return x !== C; })), E2 = R.pick(COLON_EXPL);
    return { q: para('Which sentences use colons correctly? Choose all that apply.'), a: mcAll([right, E2[0] + ': ' + E2[1] + '.'], [D[1] + ': ' + series(D[2], true) + '.', semiL]),
      hint: 'Before a colon there must be a complete sentence.',
      steps: ['Correct: “' + right + '” and “' + E2[0] + ': ' + E2[1] + '.”', '“' + D[1] + ':” puts a colon after a verb, before the sentence is complete.', 'A semicolon can’t introduce a list.'] };
  });

  /* ---------------------------------------------------------------- usage.apostrophes-possessive */
  var OWN1 = ['dog', 'cat', 'girl', 'teacher', 'bird', 'horse', 'baby', 'player', 'farmer', 'pilot', 'puppy', 'doctor'];
  var THING = { dog: 'bowl', cat: 'toy', girl: 'coat', teacher: 'desk', bird: 'nest', horse: 'saddle', baby: 'blanket', player: 'jersey', farmer: 'truck', pilot: 'hat', puppy: 'bed', doctor: 'office' };
  var IRR = [['child', 'children', 'room'], ['man', 'men', 'team'], ['woman', 'women', 'club'], ['mouse', 'mice', 'cheese'], ['goose', 'geese', 'pond'], ['person', 'people', 'choice']];
  var SNAMES = ['James', 'Chris', 'Carlos', 'Lucas', 'Thomas', 'Doris', 'Marcus', 'Iris'];
  function plOf(n) { return W().pluralOf(n); }
  G('usage.apostrophes-possessive', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'oneMany', R.pick(['irr', 'oneMany', 'plural']), R.pick(['type', 'guides', 'irr']));
    var n = R.pick(OWN1), pl = plOf(n), th = THING[n];
    if (shape === 'oneMany') {
      var many = R.coin(), right = many ? pl + '’' : n + '’s', wr = many ? [pl + '’s', n + '’s', pl] : [pl + '’', pl, pl + '’s'];
      return { q: para(many ? 'Two ' + pl + ' share one ' + th + '. Fill in the blank: the ___ ' + th : 'One ' + n + ' has a ' + th + '. Fill in the blank: the ___ ' + th), a: mc(right, wr.slice(0, ctx.level === 1 ? 2 : 3)),
        hint: 'Write the owner word first, one or more than one.',
        steps: many ? ['The owners: ' + pl + ' (plural, ends in s).', 'A plural ending in s adds only an apostrophe.', 'the ' + pl + '’ ' + th] : ['The owner: one ' + n + '.', 'A singular noun adds ’s.', 'the ' + n + '’s ' + th] };
    }
    if (shape === 'irr') {
      var I = R.pick(IRR);
      return { q: para('The ' + I[2] + ' belongs to the ' + I[1] + '. Which is correct?'), a: mc('the ' + I[1] + '’s ' + I[2], ['the ' + I[1] + 's’ ' + I[2], 'the ' + I[1] + '’ ' + I[2], 'the ' + I[1] + 's ' + I[2]]),
        hint: '<i>' + cap(I[1]) + '</i> is already plural, but it doesn’t end in s.',
        steps: ['The owner word is <i>' + I[1] + '</i>, the plural of ' + I[0] + '.', 'It doesn’t end in s, so add ’s.', 'the ' + I[1] + '’s ' + I[2]] };
    }
    if (shape === 'plural') {
      var food = R.pick(['apple', 'pumpkin', 'tomato', 'peach', 'puppy', 'kitten', 'muffin', 'pie']), fp = plOf(food);
      return { q: para('Which sign is correct?'), a: mc(cap(fp) + ' for sale', [cap(food) + '’s for sale', cap(fp) + '’ for sale']),
        hint: 'Is anything owning anything?',
        steps: ['Nothing belongs to anything here; it just means more than one ' + food + '.', 'A plural takes no apostrophe: ' + cap(fp) + ' for sale.'] };
    }
    if (shape === 'guides') {
      var nm = R.pick(SNAMES), style = R.pick([['Chicago and MLA', nm + '’s'], ['AP', nm + '’']]);
      return { q: para('How does <b>' + style[0] + '</b> style write the possessive of the name <i>' + nm + '</i>?'), a: mc(style[1] + ' book', [(style[1] === nm + '’s' ? nm + '’' : nm + '’s') + ' book', nm + 's’ book']),
        hint: 'Guides differ on singular names ending in s.',
        steps: ['Chicago and MLA add ’s: ' + nm + '’s book.', 'AP adds only an apostrophe: ' + nm + '’ book.', 'Both are standard; use one style consistently.'] };
    }
    // type the possessive
    var tm = R.coin(), I2 = R.pick(IRR), word, ans, own;
    if (tm) { word = pl; own = THING[n] + 's'; ans = pl + '’'; } else { word = I2[1]; own = I2[2]; ans = I2[1] + '’s'; }
    return { q: para('Type the possessive form of <i>' + word + '</i> to fill the blank: the ___ ' + own), a: { t: 'text', v: [ans, ans + ' ' + own, 'the ' + ans + ' ' + own], strict: true },
      hint: 'Plural and ends in s? Add only an apostrophe. Otherwise add ’s.',
      steps: ['<i>' + cap(word) + '</i> is plural' + (tm ? ' and ends in s, so add only an apostrophe.' : ' but doesn’t end in s, so add ’s.'), 'the ' + ans + ' ' + own] };
  });

  /* ---------------------------------------------------------------- usage.contractions */
  var CONTR = [['do not', 'don’t'], ['does not', 'doesn’t'], ['did not', 'didn’t'], ['is not', 'isn’t'], ['are not', 'aren’t'], ['was not', 'wasn’t'], ['cannot', 'can’t'],
    ['I am', 'I’m'], ['you are', 'you’re'], ['they are', 'they’re'], ['we are', 'we’re'], ['it is', 'it’s'], ['she will', 'she’ll'], ['we have', 'we’ve'], ['I would', 'I’d'],
    ['let us', 'let’s'], ['will not', 'won’t'], ['could have', 'could’ve'], ['should not', 'shouldn’t'], ['he is', 'he’s'], ['they will', 'they’ll'], ['would not', 'wouldn’t']];
  function misplace(c) { // wrong apostrophe places for a contraction
    var k = c.indexOf('’'), plain = c.replace('’', ''), out = [];
    [k - 1, k + 1, plain.length].forEach(function (j) { if (j > 0 && j <= plain.length) { var w = plain.slice(0, j) + '’' + plain.slice(j); if (w !== c) out.push(w); } });
    out.push(plain); return uniq(out);
  }
  var ITS = [['The bird fed ___ babies.', 'its'], ['___ going to rain.', 'It’s'], ['The town changed ___ name.', 'its'], ['I think ___ broken.', 'it’s'], ['___ been a long day.', 'It’s'],
    ['The dog chased ___ tail.', 'its'], ['The team won ___ first game.', 'its'], ['Tell me when ___ ready.', 'it’s'], ['The tree lost ___ leaves.', 'its'], ['___ my turn now.', 'It’s']];
  G('usage.contractions', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['make', 'its']), R.pick(['its', 'make', 'long']), R.pick(['type', 'its2']));
    var C = R.pick(CONTR);
    if (shape === 'make') return { q: para('What is the contraction of <i>' + C[0] + '</i>?'), a: mc(C[1], samp(R, misplace(C[1]), ctx.level === 1 ? 2 : 3)),
      hint: 'The apostrophe goes where letters are left out.', steps: [C[0] === 'will not' ? 'Will not is the odd one: it becomes won’t.' : C[0] === 'cannot' ? 'Cannot drops the n and o: can’t.' : 'Take out the letters and put the apostrophe in their place.', C[0] + ' → ' + C[1]] };
    if (shape === 'long') return { q: para('What two words does <i>' + C[1] + '</i> stand for?'), a: mc(C[0], samp(R, CONTR.filter(function (x) { return x !== C && x[0].split(' ')[0] !== C[0].split(' ')[0]; }).map(function (x) { return x[0]; }), 2)),
      hint: 'Put the missing letters back.', steps: [C[1] + ' = ' + C[0] + '.'] };
    if (shape === 'its' || shape === 'its2') {
      var T = R.pick(ITS), start = /^___/.test(T[0]), right = T[1], other = /’/.test(right) ? (start ? 'Its' : 'its') : (start ? 'It’s' : 'it’s');
      var choices = [right, other]; if (shape === 'its2') choices.push(start ? 'Its’' : 'its’');
      return { q: q([para('Which word fills the blank?'), say(T[0])]), a: mc(right, choices.slice(1)),
        hint: 'Try reading “it is” or “it has” in the blank.',
        steps: [/’/.test(right) ? '“It is” (or “it has”) fits the blank, so use the contraction: ' + right + '.' : '“It is” doesn’t fit; the word means “belonging to it,” so no apostrophe: ' + right + '.', T[0].replace('___', right)] };
    }
    return { q: para('Type the contraction of <i>' + C[0] + '</i>.'), a: { t: 'text', v: [C[1]], strict: true },
      hint: 'The apostrophe goes where letters are left out.', steps: [C[0] + ' → ' + C[1]] };
  });

  /* ---------------------------------------------------------------- usage.quotation-marks */
  var QS = { st: ['I’m ready', 'The bus is here', 'We won the game', 'It’s my turn', 'I found your hat', 'The soup is hot', 'The library opens at nine'],
    qu: ['Are you ready', 'Where is the map', 'Can I come too', 'Who took my pencil', 'Is it raining', 'What time is it'], ex: ['Watch out', 'We did it', 'Look at that rainbow', 'Hooray, it snowed'] };
  var SPK = ['Mia', 'Sam', 'Ana', 'Leo', 'Grandpa', 'Ms. Park', 'Dad', 'Coach Lee'];
  G('usage.quotation-marks', function (R, ctx) {
    var who = R.pick(SPK), shape = ML.byLevel(ctx, 'after', R.pick(['before', 'qmark']), R.pick(['whole', 'concept', 'qmark']));
    if (shape === 'after') {
      var w = R.pick(QS.st), right = '“' + w + ',” said ' + who + '.';
      return { q: para('Which line of dialogue is punctuated in American style?'), a: mc(right, ['“' + w + '”, said ' + who + '.', '“' + w + '.” said ' + who + '.', '“' + w + ',” Said ' + who + '.'].slice(0, 2 + (ctx.level > 1 ? 1 : 0))),
        hint: 'In American style, the comma goes inside the closing mark.',
        steps: ['The quoted statement ends with a comma (not a period), because the sentence goes on.', 'The comma goes inside the closing quotation mark.', 'The tag “said ' + who + '” continues the sentence: small s.', right] };
    }
    if (shape === 'before') {
      var w2 = R.pick(QS.st), r2 = who + ' said, “' + w2 + '.”';
      return { q: para('Which sentence is punctuated correctly?'), a: mc(r2, [who + ' said “' + w2 + '.”', who + ' said, “' + w2 + '”.', who + ' said, ' + w2 + '.']),
        hint: 'A comma after the tag, and the period inside the closing mark.',
        steps: ['A comma separates the tag from the quoted words.', 'The quotation marks go around the exact words.', 'The period goes inside the closing mark.', r2] };
    }
    if (shape === 'qmark') {
      var isQ = R.coin(), w3 = isQ ? R.pick(QS.qu) : R.pick(QS.ex), m = isQ ? '?' : '!', v = isQ ? 'asked' : 'shouted';
      var r3 = '“' + w3 + m + '” ' + v + ' ' + who + '.';
      return { q: para('Which sentence is punctuated correctly?'), a: mc(r3, ['“' + w3 + '”' + m + ' ' + v + ' ' + who + '.', '“' + w3 + m + ',” ' + v + ' ' + who + '.']),
        hint: 'Does the ' + (isQ ? 'question mark' : 'exclamation point') + ' belong to the quoted words?',
        steps: ['The quoted words themselves ' + (isQ ? 'ask a question' : 'exclaim') + ', so the ' + (isQ ? 'question mark' : 'exclamation point') + ' goes inside the closing mark.', 'It replaces the comma; don’t use both.', r3] };
    }
    if (shape === 'whole') {
      var w4 = R.pick(QS.st), r4 = 'Did ' + who + ' say, “' + w4 + '”?';
      return { q: para('The quoted words are a statement, but the whole sentence asks a question. Which is correct?'), a: mc(r4, ['Did ' + who + ' say, “' + w4 + '?”', 'Did ' + who + ' say, “' + w4 + '.”?']),
        hint: 'Whose question is it: the speaker’s, or yours?',
        steps: ['The quoted words don’t ask anything; the whole sentence does.', 'So the question mark goes outside the closing mark, and the quotation loses its period.', r4] };
    }
    var cs = R.pick([
      ['In a story, Sam and Mia take turns talking. When do you start a new paragraph?', 'Each time the speaker changes', ['Only when a new day begins', 'After every three lines of dialogue']],
      ['Which sentence needs quotation marks?', who + ' said, It’s time to go.', [who + ' said that it was time to go.', who + ' told us it was time to go.']],
      ['In American style, where do commas and periods go at the end of a quotation?', 'Inside the closing quotation mark', ['Outside the closing quotation mark', 'Either place, as you like']]]);
    return { q: para(cs[0]), a: mc(cs[1], cs[2]), hint: 'Quotation marks go around exact words; dialogue has a few set rules.',
      steps: ['A new speaker gets a new paragraph.', 'Only exact words take quotation marks; a report of what someone said (said that …) doesn’t.', 'American style puts commas and periods inside the closing mark.', 'Answer: ' + cs[1]] };
  });

  /* ---------------------------------------------------------------- usage.titles-italics */
  var WORKS = [['Little Women', 'novel', 1], ['Treasure Island', 'novel', 1], ['Black Beauty', 'novel', 1], ['The Raven', 'poem', 0], ['Casey at the Bat', 'poem', 0],
    ['The Tell-Tale Heart', 'short story', 0], ['Yankee Doodle', 'song', 0], ['Storms at Sea', 'chapter of a book', 0], ['How Bees Make Honey', 'magazine article', 0],
    ['Ocean Explorers', 'TV series', 1], ['The Lost Map', 'episode of a TV series', 0], ['Mountain Days', 'movie', 1], ['The Riverside Gazette', 'newspaper', 1],
    ['Kids Science Monthly', 'magazine', 1], ['Songs for a Rainy Day', 'album', 1], ['A Visit to the Moon', 'short story', 0]];
  var MADE = ['Storms at Sea', 'How Bees Make Honey', 'Ocean Explorers', 'The Lost Map', 'Mountain Days', 'The Riverside Gazette', 'Kids Science Monthly', 'Songs for a Rainy Day', 'A Visit to the Moon'];
  function workName(Wk) { return 'the ' + Wk[1] + ' ' + Wk[0] + (MADE.indexOf(Wk[0]) >= 0 ? ' (a made-up title)' : ''); }
  var PARTS = [['The Raven', 'poem', 'Poems of the Night', 'book of poems'], ['Storms at Sea', 'chapter', 'Wild Waters', 'book'], ['How Bees Make Honey', 'article', 'Kids Science Monthly', 'magazine'],
    ['The Lost Map', 'episode', 'Ocean Explorers', 'TV series'], ['Rain on the Roof', 'song', 'Songs for a Rainy Day', 'album']];
  G('usage.titles-italics', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'one', R.pick(['part', 'one']), R.pick(['all', 'hand', 'part']));
    if (shape === 'one') {
      var Wk = R.pick(WORKS), ital = !!Wk[2];
      return { q: para('How should you write the title of ' + workName(Wk) + ' in a typed essay?'), a: mcKeep(['In italics', 'In quotation marks'], ital ? 0 : 1),
        hint: 'Is it a long work, or a short work or part of something bigger?',
        steps: [cap(article(Wk[1])) + ' ' + Wk[1] + ' is ' + (ital ? 'a long work, or one that holds smaller parts' : 'a short work or a part of a bigger one') + '.', ital ? 'Italics: <i>' + Wk[0] + '</i>' : 'Quotation marks: “' + Wk[0] + '”'] };
    }
    if (shape === 'part') {
      var P = R.pick(PARTS);
      return { q: q([para('Which title goes in quotation marks? (Titles without their marks; some are made up.)'), say('Our class studied the ' + P[1] + ' ' + P[0] + ' from the ' + P[3] + ' ' + P[2] + '.')]), a: mc(P[0], [P[2], 'Both titles', 'Neither title']),
        hint: 'Which is the part and which is the whole?',
        steps: ['The ' + P[1] + ' is a part: quotation marks, “' + P[0] + '.”', 'The ' + P[3] + ' is the whole: italics, <i>' + P[2] + '</i>.'] };
    }
    if (shape === 'hand') return { q: para('You are writing an essay by hand. How do you mark the title of a novel?'), a: mc('Underline it', ['Put it in quotation marks', 'Write it in capital letters', 'Put it in parentheses']),
      hint: 'You can’t write italics by hand.', steps: ['Typed, a novel’s title goes in italics.', 'By hand, underline what you would italicize.'] };
    var it = samp(R, WORKS.filter(function (x) { return x[2]; }), 2), qu = samp(R, WORKS.filter(function (x) { return !x[2]; }), 2);
    function lab(x) { return article(x[1]) + ' ' + x[1] + ': ' + x[0]; }
    return { q: para('Which of these titles go in italics? Choose all that apply.'), a: mcAll(it.map(lab), qu.map(lab)),
      hint: 'Long works and whole collections take italics.',
      steps: [it.map(lab).join('; ') + ': long works or wholes, so italics.', qu.map(lab).join('; ') + ': short works or parts, so quotation marks.'] };
  });

  /* ---------------------------------------------------------------- usage.dashes-parentheses */
  var ASIDES = [['Our dog', 'a very old beagle', 'still chases squirrels'], ['My aunt', 'a pilot for twenty years', 'flew us home'], ['The test', 'all forty questions of it', 'took an hour'],
    ['Grandpa’s truck', 'older than my parents', 'still starts every morning'], ['The library', 'my favorite place in town', 'is closed for repairs'], ['Our coach', 'the calmest person I know', 'finally shouted']];
  var ENDS = [['There was only one thing left to do', 'run'], ['I knew who had taken the cookies', 'my little brother'], ['We had forgotten the most important thing', 'the tent'],
    ['She opened the box and saw it', 'a puppy'], ['After all that work, the result was clear', 'we had won']];
  var PARENS = [['We hiked for six hours', 'with two short breaks'], ['The museum opens at ten', 'on weekdays'], ['My cousin lives in Duluth', 'a city in Minnesota'], ['The recipe makes twelve muffins', 'or ten big ones']];
  var CUTS = [['The pool', ', which was built in 1985,', 'will not open until June 1'], ['The trail', ', which climbs for three miles,', 'is not open to bikes'],
    ['The bake sale', ', which the fifth grade runs every year,', 'will not take place this spring'], ['Our library', ', which has served the town since 1910,', 'does not charge late fees']];
  G('usage.dashes-parentheses', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['dash', 'ellipsis']), R.pick(['pair', 'tone', 'dash']), R.pick(['cut', 'paren', 'pair']));
    if (shape === 'dash') {
      var E = R.pick(ENDS);
      return { q: para('Which sentence uses a dash (not a hyphen) correctly?'), a: mc(E[0] + '—' + E[1] + '.', [E[0] + '-' + E[1] + '.', E[0] + ' - ' + E[1] + '.']),
        hint: 'A dash is the long mark; a hyphen is the short one that joins words.',
        steps: ['The writer wants a sharp break before the last words.', 'That is the dash (—), the long mark, not the short hyphen (-).', E[0] + '—' + E[1] + '.'] };
    }
    if (shape === 'ellipsis') return { q: para('In a quotation, what does an ellipsis (…) show?'), a: mc('Some words were left out', ['The speaker is shouting', 'The quotation is a question', 'The words are a title']),
      hint: 'Three dots stand for something missing.', steps: ['An ellipsis marks words left out of a quotation (or a trailing pause).', 'The words that remain must keep the original meaning.'] };
    if (shape === 'pair') {
      var A = R.pick(ASIDES), r = A[0] + '—' + A[1] + '—' + A[2] + '.';
      return { q: para('Which sentence uses dashes correctly?'), a: mc(r, [A[0] + '—' + A[1] + ', ' + A[2] + '.', A[0] + '—' + A[1] + ' ' + A[2] + '.']),
        hint: 'An interruption in the middle of a sentence is closed off on both sides with the same mark.',
        steps: ['The extra words “' + A[1] + '” interrupt the sentence.', 'Dashes in the middle come in pairs, like commas: one before and one after.', r] };
    }
    if (shape === 'tone') {
      var loud = R.coin(), A2 = R.pick(ASIDES);
      return { q: q([para('Which mark sets off the extra words ' + (loud ? 'most strongly, so they stand out?' : 'most quietly, as an aside?')), say(A2[0] + ' ___ ' + A2[1] + ' ___ ' + A2[2] + '.')]), a: mc(loud ? 'Dashes' : 'Parentheses', [loud ? 'Parentheses' : 'Dashes', 'Commas']),
        hint: 'Commas are ordinary; one of the others is loud and one is quiet.',
        steps: ['Commas set off ordinary extra information.', 'Dashes make it louder; parentheses make it quieter.', loud ? A2[0] + '—' + A2[1] + '—' + A2[2] + '.' : A2[0] + ' (' + A2[1] + ') ' + A2[2] + '.'] };
    }
    if (shape === 'paren') {
      var Pp = R.pick(PARENS), r2 = Pp[0] + ' (' + Pp[1] + ').';
      return { q: para('Which sentence is punctuated correctly?'), a: mc(r2, [Pp[0] + ' (' + Pp[1] + '.)', Pp[0] + '. (' + Pp[1] + ')']),
        hint: 'Are the words in parentheses part of the sentence?',
        steps: ['The words in parentheses are part of the sentence.', 'So the period goes after the closing parenthesis, at the end of the whole sentence.', r2] };
    }
    var C = R.pick(CUTS), orig = C[0] + C[1] + ' ' + C[2] + '.', good = '“' + C[0] + ' … ' + C[2] + '.”', silent = '“' + C[0] + ' ' + C[2] + '.”', changed = '“' + C[0] + C[1] + ' ' + C[2].replace(/ not /, ' … ') + '.”';
    return { q: q([para('A practice notice says (made up for this problem):'), say(cq(orig)), para('You want to quote it without the part between the commas. Which quotation is correct?')]), a: mc(good, [silent, changed]),
      hint: 'Show where words were left out, and don’t change the meaning.',
      steps: ['The part “' + C[1].replace(/^, |,$/g, '') + '” is left out, so an ellipsis marks the spot.', 'Leaving words out with no ellipsis hides the change.', 'Cutting the word <i>not</i> would reverse the meaning: never do that.', good] };
  });

  /* ---------------------------------------------------------------- usage.hyphens */
  var CMOD = [['well', 'known', 'author'], ['two', 'story', 'house'], ['ten', 'minute', 'walk'], ['part', 'time', 'job'], ['high', 'speed', 'train'], ['fast', 'moving', 'river'],
    ['long', 'term', 'plan'], ['full', 'time', 'worker'], ['old', 'fashioned', 'recipe'], ['last', 'minute', 'change'], ['five', 'page', 'report'], ['bright', 'eyed', 'puppy']];
  var LY = [['newly', 'built', 'house'], ['brightly', 'lit', 'room'], ['freshly', 'baked', 'bread'], ['quickly', 'growing', 'town'], ['carefully', 'planned', 'trip'], ['highly', 'trained', 'dog']];
  var ONES = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function art(w) { return article(w); }
  G('usage.hyphens', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['before', 'ly']), R.pick(['yn', 'number', 'before']), R.pick(['all', 'ly', 'number']));
    if (shape === 'before') {
      var C = R.pick(CMOD), r = art(C[0]) + ' ' + C[0] + '-' + C[1] + ' ' + C[2];
      return { q: para('Which phrase is written correctly?'), a: mc(r, [art(C[0]) + ' ' + C[0] + ' ' + C[1] + ' ' + C[2], art(C[0]) + ' ' + C[0] + '-' + C[1] + '-' + C[2]].slice(0, ctx.level === 1 ? 1 : 2)),
        hint: 'Do two words work together as one describing word before the noun?',
        steps: ['<i>' + C[0] + ' ' + C[1] + '</i> works as one adjective before <i>' + C[2] + '</i>.', 'Join a compound modifier before a noun with a hyphen (but don’t join it to the noun).', r] };
    }
    if (shape === 'ly') {
      var L = R.pick(LY), r2 = art(L[0]) + ' ' + L[0] + ' ' + L[1] + ' ' + L[2];
      return { q: para('Which phrase is written correctly?'), a: mc(r2, [art(L[0]) + ' ' + L[0] + '-' + L[1] + ' ' + L[2]]),
        hint: 'Look at the ending of the first word.',
        steps: ['<i>' + cap(L[0]) + '</i> is an -ly adverb; it already clearly describes the next word.', 'Style guides say: no hyphen after an -ly adverb.', r2] };
    }
    if (shape === 'yn') {
      var ly = R.coin(), X = ly ? R.pick(LY) : R.pick(CMOD);
      return { q: q([para('Does this phrase need a hyphen?'), say(art(X[0]) + ' ' + X[0] + ' ' + X[1] + ' ' + X[2])]), a: yn(!ly),
        hint: 'Is it a compound modifier before a noun, and does the first word end in -ly?',
        steps: ly ? ['<i>' + cap(X[0]) + '</i> is an -ly adverb: no hyphen.', art(X[0]) + ' ' + X[0] + ' ' + X[1] + ' ' + X[2]] : ['<i>' + X[0] + ' ' + X[1] + '</i> works as one adjective before the noun: hyphen.', art(X[0]) + ' ' + X[0] + '-' + X[1] + ' ' + X[2]] };
    }
    if (shape === 'number') {
      var n = R.int(2, 9) * 10 + R.int(1, 9), t = TENS[Math.floor(n / 10)], o = ONES[n % 10 - 1];
      return { q: para('How do you write ' + n + ' in words?'), a: mc(t + '-' + o, [t + ' ' + o, t + o, t + '—' + o].slice(0, ctx.level === 3 ? 3 : 2)),
        hint: 'Numbers from twenty-one to ninety-nine take a hyphen.', steps: [n + ' is between twenty-one and ninety-nine.', 'Write it with a hyphen: ' + t + '-' + o + '.'] };
    }
    var c2 = samp(R, CMOD, 2), l2 = samp(R, LY, 2);
    var rights = [art(c2[0][0]) + ' ' + c2[0][0] + '-' + c2[0][1] + ' ' + c2[0][2], art(l2[0][0]) + ' ' + l2[0][0] + ' ' + l2[0][1] + ' ' + l2[0][2]];
    var wrongs = [art(c2[1][0]) + ' ' + c2[1][0] + ' ' + c2[1][1] + ' ' + c2[1][2], art(l2[1][0]) + ' ' + l2[1][0] + '-' + l2[1][1] + ' ' + l2[1][2]];
    return { q: para('Which phrases are written correctly? Choose all that apply.'), a: mcAll(rights, wrongs),
      hint: 'Hyphenate a compound modifier before a noun, but never after an -ly adverb.',
      steps: ['Correct: ' + rights.join('; ') + '.', '“' + wrongs[0] + '” needs a hyphen: ' + art(c2[1][0]) + ' ' + c2[1][0] + '-' + c2[1][1] + ' ' + c2[1][2] + '.', '“' + wrongs[1] + '” has a hyphen after an -ly adverb; take it out.'] };
  });

  /* ================================================================ unit 6: Sentence Errors */

  /* ---------------------------------------------------------------- usage.fragments */
  var FRAGS = {
    dep: ['Because the road was icy.', 'When the game ended.', 'Although we were tired.', 'If you finish early.', 'While Grandma was cooking.', 'After the storm passed.', 'Since the bus was late.', 'Until the bell rings.'],
    ing: ['Running for the bus.', 'Hoping for sunny weather.', 'Laughing at the clown.', 'Waiting in the long line.', 'Carrying a heavy box.', 'Looking for my keys.'],
    nosubj: ['Ran all the way home.', 'Jumped over the puddle.', 'Ate three slices of pizza.', 'Fixed the flat tire in ten minutes.', 'Sang a song for the class.'],
    noverb: ['The man with the green umbrella.', 'A big box of old toys.', 'My best friend from summer camp.', 'The tall tree near the fence.', 'Three hungry ducks on the pond.']
  };
  var LACK = { dep: 'An independent clause: it is a dependent clause', ing: 'A subject and a full verb', nosubj: 'A subject', noverb: 'A verb' };
  var LACK_WHY = { dep: 'It has a subject and a verb, but the first word makes it dependent: it can’t stand alone.', ing: 'An -ing word alone isn’t a full verb, and nobody is named as the subject.',
    nosubj: 'It tells what happened, but not who did it.', noverb: 'It names someone or something, but says nothing about what it does or is.' };
  var WHOLE = ['The road was icy.', 'We stayed inside.', 'Birds sing.', 'I ran.', 'The game ended at noon.', 'Grandma was cooking soup.', 'Close the door.', 'Sit down, please.', 'The ducks swam away.', 'It rained all night.'];
  var FIXES = [['We stayed inside', 'Because it rained', 'We stayed inside because it rained.'], ['We left early', 'Because the roads were icy', 'We left early because the roads were icy.'],
    ['I dropped my lunch', 'Running for the bus', 'Running for the bus, I dropped my lunch.'], ['The players cheered', 'When the game ended', 'When the game ended, the players cheered.'],
    ['We waited for an hour', 'Hoping for sunny weather', 'Hoping for sunny weather, we waited for an hour.'], ['Leo kept reading', 'Until the bell rang', 'Leo kept reading until the bell rang.']];
  G('usage.fragments', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'yn', R.pick(['lack', 'yn', 'fix']), R.pick(['passage', 'lack', 'fix']));
    var kind = R.pick(['dep', 'ing', 'nosubj', 'noverb']), f = R.pick(FRAGS[kind]);
    if (shape === 'yn') {
      var whole = R.coin(), s = whole ? R.pick(WHOLE) : f;
      var imp = /^(Close|Sit)/.test(s);
      return { q: q([para('Is this a complete sentence?'), say(s)]), a: yn(whole),
        hint: 'Does it have a subject, a verb, and an independent clause?',
        steps: whole ? [imp ? 'A command has the understood subject you: “(You) ' + s.charAt(0).toLowerCase() + s.slice(1) + '”' : 'It has a subject and a verb and stands alone.', 'So it is a complete sentence, however short.'] : [LACK_WHY[kind], 'So it is a fragment, even with a capital letter and a period.'] };
    }
    if (shape === 'lack') return { q: q([para('This is a fragment. What does it lack?'), say(f)]), a: mcKeep(['A subject', 'A verb', 'A subject and a full verb', 'An independent clause: it is a dependent clause'], ['nosubj', 'noverb', 'ing', 'dep'].indexOf(kind)),
      hint: 'Look for a subject, then a verb, then a word like because or when at the start.', steps: [LACK_WHY[kind], 'It lacks: ' + low(LACK[kind]) + '.'] };
    if (shape === 'fix') {
      var F = R.pick(FIXES), asIs = F[0] + '. ' + F[1] + '.', depFirst = /^(Because|Until)/.test(F[1]);
      var wrong2 = F[1] + '. ' + F[0] + '.', wrong3 = F[0] + ', ' + F[1].split(' ')[0].toLowerCase() + '. ' + cap(F[1].split(' ').slice(1).join(' ')) + '.';
      return { q: q([para('Which is the best way to fix the fragment?'), say(asIs)]), a: mc(F[2], [asIs.replace('. ' + F[1], '; ' + F[1].charAt(0).toLowerCase() + F[1].slice(1)), wrong2, wrong3].slice(0, ctx.level === 3 ? 3 : 2)),
        hint: 'Join the fragment to the sentence it belongs to.',
        steps: ['“' + F[1] + '” is a fragment that belongs with “' + F[0] + '.”', depFirst ? 'Join them; a because- or until-clause at the end needs no comma.' : 'Join them; an opener at the start takes a comma.', F[2], 'A semicolon won’t work: it needs an independent clause on both sides.'] };
    }
    // passage: one fragment among sentences
    var ws = samp(R, WHOLE.filter(function (x) { return !/^(Birds|I ran|Sit|Close)/.test(x); }), 3), pos = R.int(0, 3), list = ws.slice(); list.splice(pos, 0, f);
    return { q: q([para('Which numbered piece is a fragment?'), ol(list)]), a: mcKeep(nums(4), pos),
      hint: 'Read each piece alone, out of order. Is it a whole statement?', steps: ['Piece ' + (pos + 1) + ': “' + f + '” ' + LACK_WHY[kind], 'The others each have a subject and a verb and stand alone.'] };
  });

  /* ---------------------------------------------------------------- usage.run-ons */
  var LONG_OK = ['After the rain finally stopped on Saturday afternoon, the children ran outside and splashed in every puddle they could find.',
    'My grandmother, who grew up on a farm in Iowa, still wakes up before sunrise and makes coffee for everyone in the house.',
    'The old wooden bridge over the creek behind our school creaked loudly whenever a heavy truck drove across it.',
    'Because the library was closed for repairs, our class met in the gym and read stories on the bleachers all morning.',
    'Every summer my cousins and I build a tall sandcastle with towers, tunnels, and a moat that fills with water at high tide.',
    'The small brown dog with the red collar waited patiently by the front door for the children to come home from school.'];
  var SHORT_RUN = [['I ran', 'I won'], ['The bus was late', 'we walked'], ['It snowed', 'school closed'], ['Mia laughed', 'Sam smiled'], ['The dog barked', 'I woke up'], ['We knocked', 'nobody answered']];
  G('usage.run-ons', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'yn', R.pick(['border', 'yn']), R.pick(['pick', 'border']));
    if (shape === 'yn') {
      var k = R.pick(['run', 'run', 'long', 'ok']), P = R.pick(PAIRS), s = k === 'run' ? runOn(P) : k === 'long' ? R.pick(LONG_OK) : compound(P);
      return { q: q([para('Is this a run-on sentence?'), say(s)]), a: yn(k === 'run'),
        hint: 'Count the independent clauses, then check what joins them.',
        steps: k === 'run' ? ['Two independent clauses: “' + clause1(P) + '” and “' + clause2(P) + '.”', 'Nothing joins them, so it is a run-on.', 'One fix: ' + twoSent(P)] : k === 'long' ? ['It is long, but it has only one independent clause, properly joined to the rest.', 'Length doesn’t make a run-on.'] : ['Two independent clauses, joined by a comma and <i>' + P.c + '</i>.', 'That is a correct compound sentence.'] };
    }
    if (shape === 'border') {
      var P2 = R.pick(PAIRS), rs = runOn(P2), toks = words(rs), end = words(clause1(P2)).length - 1;
      var cand = [end - 2, end - 1, end, end + 1, end + 2].filter(function (i) { return i >= 0 && i < toks.length - 1; });
      var gaps = [end].concat(samp(R, cand.filter(function (i) { return i !== end; }), 2)).sort(function (a, b) { return a - b; });
      return { q: para('This run-on joins two independent clauses with nothing between them. After which numbered gap does the first clause end?'), a: mcKeep(nums(gaps.length), gaps.indexOf(end)),
        viz: { name: 'wr-punct', opts: { text: rs, gaps: gaps, quiet: true, interactive: false } },
        hint: 'Find the second subject and verb.',
        steps: ['The second clause starts with its own subject: “' + clause2(P2) + '.”', 'So the first clause ends after “' + toks[end] + '”, at gap ' + (gaps.indexOf(end) + 1) + '.', 'One fix: ' + twoSent(P2)] };
    }
    var S = R.pick(SHORT_RUN), run = S[0] + ' ' + S[1] + '.';
    return { q: para('Which one is a run-on?'), a: mc(run, [R.pick(LONG_OK), compound(R.pick(PAIRS))]),
      hint: 'A run-on is about how clauses are joined, not how long the sentence is.',
      steps: ['“' + run + '” is short, but it runs two independent clauses together with nothing between them.', 'The long sentence has one independent clause, and the compound sentence joins its clauses with a comma and a conjunction.'] };
  });

  /* ---------------------------------------------------------------- usage.comma-splices */
  G('usage.comma-splices', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'yn', R.pick(['pick', 'yn']), R.pick(['all', 'however']));
    var P = R.pick(PAIRS);
    if (shape === 'yn') {
      var k = R.pick(['splice', 'splice', 'comp', 'sub']), s = k === 'splice' ? splice(P) : k === 'comp' ? compound(P) : subOpen(P);
      return { q: q([para('Is this a comma splice?'), say(s)]), a: yn(k === 'splice'),
        hint: 'Cover the comma. Can both sides stand alone? Is there a conjunction?',
        steps: k === 'splice' ? ['“' + clause1(P) + '” and “' + clause2(P) + '” are both independent clauses.', 'Only a comma joins them: a comma splice.', 'One fix: ' + compound(P)]
          : k === 'comp' ? ['The comma comes with the conjunction <i>' + P.c + '</i>.', 'That is a correct compound sentence, not a splice.'] : ['“' + P.sub + ' …” is a dependent clause.', 'A comma after an opening dependent clause is correct, so this is not a splice.'] };
    }
    if (shape === 'pick') return { q: para('Which sentence is a comma splice?'), a: mc(splice(P), [compound(P), subOpen(P)]),
      hint: 'Look for two independent clauses joined by a comma alone.', steps: ['“' + splice(P) + '” joins two independent clauses with only a comma.', 'The other two use a conjunction or a dependent clause.'] };
    var Q = R.pick(PAIRS.filter(function (x) { return x !== P && x.c !== 'and'; }));
    if (shape === 'however') return { q: para('Which sentence is punctuated correctly?'), a: mc(semiAdv(Q), [commaAdv(Q), commaAdv2(Q)]),
      hint: 'Is <i>' + adverbFor(Q) + '</i> a conjunction?',
      steps: ['<i>' + cap(adverbFor(Q)) + '</i> is a conjunctive adverb, not a conjunction.', 'A comma before it still splices the two clauses.', 'Use a semicolon before it and a comma after it: ' + semiAdv(Q)] };
    var P2 = R.pick(PAIRS.filter(function (x) { return x !== P && x !== Q; }));
    return { q: para('Which sentences are comma splices? Choose all that apply.'), a: mcAll([splice(P), commaAdv(Q)], [compound(P2), subOpen(R.pick([P, P2]))]),
      hint: 'However and therefore are not conjunctions.',
      steps: ['“' + splice(P) + '”: a comma alone between two clauses.', '“' + commaAdv(Q) + '”: <i>' + adverbFor(Q) + '</i> is not a conjunction, so it is still a splice.', 'The others join their clauses with a conjunction or a dependent clause.'] };
  });

  /* ---------------------------------------------------------------- usage.fixing-run-ons */
  G('usage.fixing-run-ons', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'one', R.pick(['adverb', 'one']), R.pick(['all', 'all', 'adverb']));
    var P = R.pick(PAIRS), rs = runOn(P);
    if (shape === 'one') {
      var right = R.pick([twoSent(P), compound(P), semi(P), subOpen(P)]);
      return { q: q([para('Which is a correct way to fix this run-on?'), say(rs)]), a: mc(right, [splice(P), clause1(P) + ' ' + P.c + ', ' + clause2(P) + '.']),
        hint: 'A comma alone can’t join two independent clauses.',
        steps: ['The two clauses are “' + clause1(P) + '” and “' + clause2(P) + '.”', 'Fixes: a period, a comma and a conjunction, a semicolon, or a subordinating word.', 'A comma alone makes a comma splice.', right] };
    }
    if (shape === 'adverb') {
      var Q = R.pick(PAIRS.filter(function (x) { return x.c !== 'and'; })), a = adverbFor(Q);
      return { q: q([para('Fix this run-on using the word <i>' + a + '</i>.'), say(runOn(Q))]), a: mc(semiAdv(Q), [commaAdv2(Q), commaAdv(Q)]),
        hint: 'A conjunctive adverb needs a semicolon (or a period) before it.',
        steps: ['<i>' + cap(a) + '</i> is not a conjunction.', 'Semicolon before it, comma after it.', semiAdv(Q)] };
    }
    var rights = samp(R, [twoSent(P), compound(P), semi(P), subOpen(P)], 3), wrongs = [splice(P)];
    if (P.c !== 'and') wrongs.push(commaAdv2(P)); else wrongs.push(clause1(P) + ' ' + P.c + ', ' + clause2(P) + '.');
    return { q: q([para('Which are correct ways to fix this run-on? Choose all that apply.'), say(rs)]), a: mcAll(rights, wrongs),
      hint: 'Check each one: period, comma + conjunction, semicolon, subordinating word.',
      steps: ['Correct: ' + rights.join(' / '), '“' + splice(P) + '” is a comma splice.', P.c !== 'and' ? 'A comma before ' + adverbFor(P) + ' still splices.' : 'The comma belongs before <i>and</i>, not after it.'] };
  });

  /* ================================================================ unit 7: Parallel Structure */

  /* ---------------------------------------------------------------- usage.parallel-lists */
  var ACTS = [['hike', ''], ['swim', ''], ['read', ' mysteries'], ['paint', ' pictures'], ['bake', ' bread'], ['play', ' chess'], ['ride', ' bikes'], ['plant', ' flowers'],
    ['build', ' models'], ['watch', ' birds'], ['write', ' stories'], ['fish', ' in the lake'], ['draw', ' cartoons'], ['camp', ' in the woods']];
  var FRAMES = ['On weekends I like', 'In the summer we love', 'My grandpa likes', 'At camp the kids liked', 'After school Mia loves'];
  function ger(a) { return ingOf(a[0]) + a[1]; }
  function inf(a) { return 'to ' + a[0] + a[1]; }
  G('usage.parallel-lists', function (R, ctx) {
    var A = samp(R, ACTS, 3), Fr = R.pick(FRAMES), useGer = R.coin(), form = useGer ? ger : inf, other = useGer ? inf : ger;
    var good = Fr + ' ' + series(A.map(form), true) + '.', odd = R.int(0, 2), mix = A.map(function (a, i) { return i === odd ? other(a) : form(a); });
    var bad = Fr + ' ' + series(mix, true) + '.';
    var shape = ML.byLevel(ctx, 'pick', R.pick(['odd', 'pick']), R.pick(['fix', 'both']));
    var kindName = useGer ? 'an -ing word' : 'an infinitive (to + verb)';
    if (shape === 'pick') {
      var mix2 = A.map(function (a, i) { return i === (odd + 1) % 3 ? other(a) : form(a); });
      return { q: para('Which sentence has parallel structure?'), a: mc(good, [bad, Fr + ' ' + series(mix2, true) + '.'].slice(0, ctx.level === 1 ? 1 : 2)),
        hint: 'Every item in the list should have the same form.', steps: ['In “' + good + '” every item is ' + kindName + '.', 'The other sentence mixes -ing words and infinitives.'] };
    }
    if (shape === 'odd') return { q: q([para('Which item breaks the pattern of the list?'), say(bad)]), a: mc(mix[odd], mix.filter(function (_, i) { return i !== odd; })),
      hint: 'Two items share a form. Which one doesn’t?', steps: ['Two items are ' + kindName + '.', '“' + mix[odd] + '” is ' + (useGer ? 'an infinitive' : 'an -ing word') + '.', 'Parallel: ' + good] };
    if (shape === 'fix') {
      var allOther = Fr + ' ' + series(A.map(other), true) + '.';
      return { q: q([para('Which revision makes the list parallel?'), say(bad)]), a: mcAll([good, allOther], [bad, Fr + ' ' + series(A.map(function (a, i) { return i === odd ? form(a) : other(a); }), true) + '.']),
        hint: 'Every item must have the same form. There may be more than one way.',
        steps: ['All -ing words or all infinitives: either way, the items match.', 'Choose all the versions where every item has the same form.'] };
    }
    // both: infinitives with or without a repeated to
    var I = A.map(inf), short = Fr + ' ' + I[0] + ', ' + A[1][0] + A[1][1] + ', and ' + A[2][0] + A[2][1] + '.', full = Fr + ' ' + series(I, true) + '.';
    var mixTo = Fr + ' ' + I[0] + ', ' + A[1][0] + A[1][1] + ', and ' + I[2] + '.';
    return { q: para('Which sentences have parallel structure? Choose all that apply.'), a: mcAll([full, short], [mixTo, Fr + ' ' + I[0] + ', ' + ger(A[1]) + ', and ' + I[2] + '.']),
      hint: 'You may repeat to before every verb or use it only once, but don’t switch partway.',
      steps: ['“' + full + '” repeats to: parallel.', '“' + short + '” uses to once for all three: parallel.', 'Mixing (to with some items but not others, or an -ing word) breaks the pattern.'] };
  });

  /* ---------------------------------------------------------------- usage.parallel-pairs */
  var CORR = [['She', 'plays', 'the piano', 'the violin'], ['Our class', 'visited', 'the museum', 'the zoo'], ['Leo', 'speaks', 'Spanish', 'French'], ['The store', 'sells', 'fresh bread', 'homemade jam'],
    ['My aunt', 'grows', 'tomatoes', 'peppers'], ['Grandpa', 'fixed', 'the fence', 'the gate'], ['Ana', 'reads', 'mysteries', 'comics'], ['The team', 'won', 'the first game', 'the final']];
  var EITHER = [['You', 'walk', 'take the bus'], ['We', 'eat now', 'wait for Dad'], ['Sam', 'call', 'send a text'], ['You', 'pay now', 'pay at the door'], ['They', 'stay inside', 'play in the rain']];
  // [right, wrong (unlike things or forms), another right way]
  var COMPARE = [['Swimming is harder than running.', 'Swimming is harder than to run.', 'To swim is harder than to run.'],
    ['Ana’s grades are higher than Ben’s.', 'Ana’s grades are higher than Ben.', 'Ana’s grades are higher than Ben’s grades.'],
    ['Reading a book is more fun than watching a movie.', 'Reading a book is more fun than to watch a movie.', 'To read a book is more fun than to watch a movie.'],
    ['My bike is faster than Leo’s.', 'My bike is faster than Leo.', 'My bike is faster than Leo’s bike.'],
    ['Our tomatoes are bigger than our neighbors’.', 'Our tomatoes are bigger than our neighbors.', 'Our tomatoes are bigger than our neighbors’ tomatoes.'],
    ['Biking to school is faster than walking.', 'Biking to school is faster than to walk.', 'To bike to school is faster than to walk.']];
  G('usage.parallel-pairs', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['notonly', 'either']), R.pick(['notonly', 'either', 'compare']), R.pick(['all', 'compare', 'both']));
    if (shape === 'notonly' || shape === 'all') {
      var C = R.pick(CORR), pr = R.pick([['not only', 'but also'], ['both', 'and'], ['neither', 'nor']]);
      if (pr[0] === 'neither') C = R.pick(CORR.filter(function (x) { return /^(Ana|Leo|My aunt)$/.test(x[0]); }));
      var right = C[0] + ' ' + C[1] + ' ' + pr[0] + ' ' + C[2] + ' ' + pr[1] + ' ' + C[3] + '.', wrong = C[0] + ' ' + pr[0] + ' ' + C[1] + ' ' + C[2] + ' ' + pr[1] + ' ' + C[3] + '.';
      var wrong2 = cap(pr[0]) + ' ' + low(C[0]) + ' ' + C[1] + ' ' + C[2] + ' ' + pr[1] + ' ' + C[3] + '.';
      if (shape === 'all') {
        var verbs = pr[0] === 'not only' ? C[0] + ' not only ' + C[1] + ' ' + C[2] + ' but also ' + C[1] + ' ' + C[3] + '.' : null;
        if (verbs) return { q: para('Which sentences are parallel? Choose all that apply.'), a: mcAll([right, verbs], [wrong, wrong2]),
          hint: 'Read what follows each half of the pair. Do they match?',
          steps: ['“' + right + '”: a noun after each half.', '“' + verbs + '”: a verb phrase after each half.', 'Both are parallel; the others put different kinds of words after the two halves.'] };
      }
      return { q: para('Which sentence is parallel?'), a: mc(right, ctx.level === 1 ? [wrong] : [wrong, wrong2]),
        hint: 'What comes right after <i>' + pr[0] + '</i>, and right after <i>' + pr[1] + '</i>?',
        steps: ['In “' + wrong + '” a verb follows <i>' + pr[0] + '</i> but a noun follows <i>' + pr[1] + '</i>.', 'Move <i>' + pr[0] + '</i> so a noun follows it too.', right] };
    }
    if (shape === 'either') {
      var E = R.pick(EITHER), r = E[0] + ' can either ' + E[1] + ' or ' + E[2] + '.', w = 'Either ' + low(E[0]) + ' can ' + E[1] + ' or ' + E[2] + '.';
      return { q: para('Which sentence is parallel?'), a: mc(r, ctx.level === 1 ? [w] : [w, E[0] + ' can either ' + E[1] + ' or ' + low(E[0]) + ' ' + E[2] + '.'].slice(0, 2)),
        hint: 'Put <i>either</i> right before the first choice.',
        steps: ['The two choices are verbs: “' + E[1] + '” and “' + E[2] + '.”', 'So <i>either</i> goes right before the first verb, and <i>or</i> before the second.', r] };
    }
    var Cm = R.pick(COMPARE);
    if (shape === 'compare') return { q: para('Which comparison is parallel?'), a: mc(Cm[0], [Cm[1]]),
      hint: 'Compare like with like.', steps: ['Both sides of <i>than</i> must be the same kind of thing.', '“' + Cm[1] + '” compares unlike things or forms.', Cm[0]] };
    var other = R.pick(COMPARE.filter(function (x) { return x !== Cm; }));
    return { q: para('Which comparisons compare like with like? Choose all that apply.'), a: mcAll([Cm[0], Cm[2]], [Cm[1], other[1]]),
      hint: 'Check what is on each side of <i>than</i>.', steps: ['“' + Cm[0] + '” and “' + Cm[2] + '” compare matching things in matching forms.', '“' + Cm[1] + '” and “' + other[1] + '” don’t.'] };
  });

  /* ================================================================ unit 8: Capitals and Usage */

  /* ---------------------------------------------------------------- usage.capitalization */
  // a correct sentence and the wrong case of some of its words (the trap)
  var CAPS = [
    ['Last summer my uncle drove south to visit Aunt Rosa in Atlanta.', { summer: 'Summer', uncle: 'Uncle', south: 'South', Aunt: 'aunt', Atlanta: 'atlanta' }],
    ['On Monday Mayor Diaz spoke to our class about Texas.', { Monday: 'monday', Mayor: 'mayor', class: 'Class', Texas: 'texas' }],
    ['My mom and Grandpa flew to the West Coast in the spring.', { mom: 'Mom', Grandpa: 'grandpa', spring: 'Spring', West: 'west' }],
    ['We study English, Spanish, and math at Lincoln Middle School.', { English: 'english', math: 'Math', School: 'school' }],
    ['The doctor said that Dr. Rivera would see us on Friday.', { doctor: 'Doctor', Friday: 'friday', Rivera: 'rivera' }],
    ['In July we hiked along the Colorado River near Moab.', { July: 'july', River: 'river', hiked: 'Hiked' }],
    ['Dad said that my grandmother grew up in the Midwest.', { Dad: 'dad', grandmother: 'Grandmother', Midwest: 'midwest' }],
    ['Our team will play the Tigers on Thanksgiving Day.', { team: 'Team', Thanksgiving: 'thanksgiving', Tigers: 'tigers' }],
    ['Ms. Park asked us to read a book about the Pacific Ocean this fall.', { fall: 'Fall', Ocean: 'ocean', book: 'Book' }],
    ['Turn left at the bank and drive east for two miles.', { east: 'East', bank: 'Bank', miles: 'Miles' }],
    ['Our governor spoke in Boise, Idaho, on Monday.', { governor: 'Governor', Idaho: 'idaho', Monday: 'monday' }]
  ];
  function capWrong(S, keys) { var t = words(S[0]); keys.forEach(function (k) { for (var i = 0; i < t.length; i++) { var core = t[i].replace(/[.,!?]$/, ''); if (core === k) { t[i] = S[1][k] + t[i].slice(core.length); break; } } }); return t.join(' '); }
  G('usage.capitalization', function (R, ctx) {
    var S = R.pick(CAPS), keys = Object.keys(S[1]), shape = ML.byLevel(ctx, 'pick', R.pick(['which', 'pick']), R.pick(['all', 'which']));
    if (shape === 'pick') {
      var ks = samp(R, keys, 2);
      return { q: para('Which sentence uses capital letters correctly?'), a: mc(S[0], [capWrong(S, [ks[0]]), capWrong(S, [ks[1]])]),
        hint: 'Capitals go on names: particular people, places, days, months, languages and regions.',
        steps: ['Check each word that changes: ' + ks.map(function (k) { return k + ' / ' + S[1][k]; }).join('; ') + '.', S[0]] };
    }
    if (shape === 'which') {
      var k = R.pick(keys), bad = capWrong(S, [k]), others = samp(R, uniq(words(S[0]).map(function (w) { return w.replace(/[.,!?]$/, ''); }).filter(function (w) { return w !== k && w !== S[1][k] && keys.indexOf(w) < 0 && w.length > 2; })), 2);
      return { q: q([para('Which word has a capitalization error?'), say(bad)]), a: mc(S[1][k], others),
        hint: 'Is each capitalized word a name? Is each lowercase name missing its capital?',
        steps: ['“' + S[1][k] + '” should be “' + k + '.”', /^[A-Z]/.test(k) ? 'It is a name (or part of one), so it takes a capital.' : 'It is an ordinary word here, so it takes a small letter.', S[0]] };
    }
    // all: in an all-lowercase version, which words need a capital?
    var t = words(S[0]).map(function (w) { return w.replace(/[.,!?]$/, ''); }), capd = uniq(t.filter(function (w, i) { return /^[A-Z]/.test(w) && w !== 'I'; }));
    var lowW = uniq(keys.filter(function (k) { return /^[a-z]/.test(k); }));
    var rights = samp(R, capd, Math.min(3, capd.length)), wrongs = samp(R, lowW, Math.min(2, lowW.length));
    if (wrongs.length < 2) wrongs = wrongs.concat(samp(R, t.filter(function (w) { return /^[a-z]{3,}/.test(w) && wrongs.indexOf(w) < 0; }), 2 - wrongs.length));
    function lc(w) { return w.toLowerCase(); }
    return { q: q([para('These words come from the sentence below, written in small letters. Which of them need a capital letter? Choose all that apply.'), say(S[0].toLowerCase())]), a: mcAll(rights.map(lc), wrongs.map(lc)),
      hint: 'Names of particular people, places, days, months, languages and regions; the first word; a title right before a name.',
      steps: ['Correct: ' + S[0], 'Capitals: ' + rights.join(', ') + '.', 'Small letters: ' + wrongs.join(', ') + '.'] };
  });

  /* ---------------------------------------------------------------- usage.title-case */
  // word kinds: n v adj adv pro (capitalized everywhere); art conj p (short prepositions, lowercase in the middle everywhere);
  // p4 (four-letter prepositions: APA and AP capitalize; Chicago 18 and MLA don't); p5 (five or more: Chicago 18, APA, AP capitalize; MLA doesn't)
  var TITLES = [
    [['the', 'art'], ['secret', 'n'], ['of', 'p'], ['the', 'art'], ['old', 'adj'], ['mill', 'n']],
    [['a', 'art'], ['walk', 'n'], ['through', 'p5'], ['the', 'art'], ['woods', 'n']],
    [['the', 'art'], ['girl', 'n'], ['with', 'p4'], ['the', 'art'], ['silver', 'adj'], ['kite', 'n']],
    [['stars', 'n'], ['and', 'conj'], ['stories', 'n'], ['of', 'p'], ['the', 'art'], ['night', 'adj'], ['sky', 'n']],
    [['a', 'art'], ['house', 'n'], ['by', 'p'], ['the', 'art'], ['sea', 'n']],
    [['the', 'art'], ['boy', 'n'], ['from', 'p4'], ['the', 'art'], ['mountain', 'adj'], ['town', 'n']],
    [['the', 'art'], ['mystery', 'n'], ['under', 'p5'], ['the', 'art'], ['bridge', 'n']],
    [['running', 'v'], ['in', 'p'], ['the', 'art'], ['rain', 'n']],
    [['what', 'pro'], ['is', 'v'], ['in', 'p'], ['the', 'art'], ['box', 'n']],
    [['the', 'art'], ['race', 'n'], ['between', 'p5'], ['the', 'art'], ['turtle', 'n'], ['and', 'conj'], ['the', 'art'], ['hare', 'n']],
    [['bread', 'n'], ['and', 'conj'], ['butter', 'n'], ['for', 'p'], ['every', 'adj'], ['season', 'n']],
    [['it', 'pro'], ['is', 'v'], ['a', 'art'], ['small', 'adj'], ['world', 'n']],
    [['the', 'art'], ['road', 'n'], ['into', 'p4'], ['the', 'art'], ['quiet', 'adj'], ['hills', 'n']],
    [['life', 'n'], ['on', 'p'], ['a', 'art'], ['very', 'adv'], ['busy', 'adj'], ['farm', 'n']],
    [['the', 'art'], ['house', 'n'], ['behind', 'p5'], ['the', 'art'], ['old', 'adj'], ['school', 'n']],
    [['songs', 'n'], ['about', 'p5'], ['the', 'art'], ['sea', 'n']]
  ];
  var GUIDES = ['Chicago (18th ed.)', 'MLA (9th ed.)', 'APA (7th ed.)', 'AP'];
  function capsIn(k, guide) { // is a middle word of kind k capitalized in this guide?
    if (k === 'art' || k === 'conj' || k === 'p') return false;
    if (k === 'p4') return guide === 'APA (7th ed.)' || guide === 'AP';
    if (k === 'p5') return guide !== 'MLA (9th ed.)';
    return true;
  }
  function titleIn(T, guide) { return T.map(function (x, i) { return i === 0 || i === T.length - 1 || capsIn(x[1], guide) ? cap(x[0]) : x[0]; }).join(' '); }
  function hasLongPrep(T) { return T.some(function (x) { return x[1] === 'p4' || x[1] === 'p5'; }); }
  G('usage.title-case', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'pick', R.pick(['lower', 'pick']), R.pick(['guides', 'lower', 'mla']));
    var T = R.pick(TITLES), plain = T.map(function (x) { return x[0]; }).join(' ');
    if (shape === 'pick') {
      T = R.pick(TITLES.filter(function (x) { return !hasLongPrep(x); })); plain = T.map(function (x) { return x[0]; }).join(' ');
      var right = titleIn(T, 'Chicago (18th ed.)'), every = T.map(function (x) { return cap(x[0]); }).join(' '), sent = cap(plain), noFirst = T.map(function (x, i) { return i > 0 && capsIn(x[1], 'MLA (9th ed.)') ? cap(x[0]) : x[0]; }).join(' ');
      return { q: para('Which is the title “' + plain + '” in title case?'), a: mc(right, ctx.level === 1 ? [every, sent] : [every, sent, noFirst]),
        hint: 'Capitalize the first word and the major words; keep small words like the, of and and lowercase in the middle.',
        steps: ['Capitalize the first word and every noun, pronoun, verb, adjective and adverb.', 'Keep articles, and/but/or, and short prepositions lowercase in the middle.', right] };
    }
    if (shape === 'lower') {
      var mids = T.slice(1, -1), lowers = uniq(mids.filter(function (x) { return x[1] === 'art' || x[1] === 'conj' || x[1] === 'p'; }).map(function (x) { return x[0]; }));
      var caps = uniq(mids.filter(function (x) { return ['n', 'v', 'adj', 'adv', 'pro'].indexOf(x[1]) >= 0; }).map(function (x) { return x[0]; }).concat([T[0][0], T[T.length - 1][0]])).filter(function (w) { return lowers.indexOf(w) < 0; });
      return { q: para('In the title “' + plain + '”, which words stay lowercase in every major style guide? Choose all that apply.'), a: mcAll(lowers, caps),
        hint: 'Articles, and/but/or, and short prepositions stay lowercase in the middle; the major words are capitalized.',
        steps: ['Lowercase in the middle: ' + lowers.join(', ') + '.', 'Capitalized: the first word, the last word, and every noun, pronoun, verb, adjective and adverb.', 'In title case (Chicago style): ' + titleIn(T, 'Chicago (18th ed.)')] };
    }
    T = R.pick(TITLES.filter(hasLongPrep)); plain = T.map(function (x) { return x[0]; }).join(' ');
    var P = T.filter(function (x) { return x[1] === 'p4' || x[1] === 'p5'; })[0];
    if (shape === 'guides') {
      var yes = GUIDES.filter(function (g) { return capsIn(P[1], g); }), no = GUIDES.filter(function (g) { return !capsIn(P[1], g); });
      return { q: para('In the title “' + plain + '”, which style guides capitalize <i>' + P[0] + '</i>? Choose all that apply.'), a: mcAll(yes, no),
        hint: '<i>' + cap(P[0]) + '</i> is a preposition of ' + P[0].length + ' letters. Guides differ on longer prepositions.',
        steps: ['APA and AP capitalize words of four letters or more.', 'Chicago’s 18th edition (2024) capitalizes prepositions of five letters or more.', 'MLA keeps prepositions lowercase in the middle, whatever their length.', 'So ' + P[0] + ' is capitalized in: ' + yes.join(', ') + '.'] };
    }
    var g = R.pick(GUIDES), r = titleIn(T, g), alt = titleIn(T, capsIn(P[1], g) ? 'MLA (9th ed.)' : 'AP');
    return { q: para('How does <b>' + g + '</b> style write the title “' + plain + '”?'), a: mc(r, [alt, T.map(function (x) { return cap(x[0]); }).join(' ')]),
      hint: 'Look at the preposition <i>' + P[0] + '</i> (' + P[0].length + ' letters).',
      steps: ['The major words are capitalized in every guide.', g + (capsIn(P[1], g) ? ' capitalizes ' : ' lowercases ') + '<i>' + P[0] + '</i> here.', r] };
  });

  /* ---------------------------------------------------------------- usage.confused-common */
  var CC = [
    ['The bird fed ___ babies.', 'its', ['it’s']], ['___ going to rain.', 'It’s', ['Its']], ['I think ___ broken.', 'it’s', ['its']], ['The town changed ___ name.', 'its', ['it’s']],
    ['Put the box over ___.', 'there', ['their', 'they’re']], ['___ coming at noon.', 'They’re', ['Their', 'There']], ['The kids lost ___ ball.', 'their', ['there', 'they’re']], ['I think ___ right.', 'they’re', ['their', 'there']],
    ['___ late again.', 'You’re', ['Your']], ['Is this ___ coat?', 'your', ['you’re']], ['I hope ___ feeling better.', 'you’re', ['your']], ['Wash ___ hands.', 'your', ['you’re']],
    ['___ coming to the party?', 'Who’s', ['Whose']], ['___ backpack is this?', 'Whose', ['Who’s']], ['I know ___ turn it is.', 'whose', ['who’s']], ['Tell me ___ ready.', 'who’s', ['whose']],
    ['I want to come ___.', 'too', ['to', 'two']], ['We have ___ cats.', 'two', ['to', 'too']], ['Let’s walk ___ the park.', 'to', ['too', 'two']], ['The soup is ___ hot.', 'too', ['to', 'two']],
    ['My dog is bigger ___ yours.', 'than', ['then']], ['We ate lunch, and ___ we played.', 'then', ['than']], ['I’d rather walk ___ ride.', 'than', ['then']], ['First stir the batter, ___ pour it.', 'then', ['than']]];
  var CC_WHY = { its: 'Its means “belonging to it” (no apostrophe, like his).', 'it’s': 'It’s means “it is” or “it has.”', their: 'Their means “belonging to them.”', there: 'There means “in that place” (or starts “there is/are”).',
    'they’re': 'They’re means “they are.”', your: 'Your means “belonging to you.”', 'you’re': 'You’re means “you are.”', whose: 'Whose means “belonging to whom.”', 'who’s': 'Who’s means “who is.”',
    too: 'Too means “also” or “more than enough.”', two: 'Two is the number 2.', to: 'To shows direction, or goes with a verb.', than: 'Than compares.', then: 'Then tells when: next, or at that time.' };
  var CC2 = [['___ late, so grab ___ coat.', ['You’re', 'your']], ['I ate ___ cookies, and that was ___ many.', ['two', 'too']], ['___ the boy ___ dog won the prize?', ['Who’s', 'whose']],
    ['The cat licked ___ paw because ___ hungry.', ['its', 'it’s']], ['___ bags are over ___.', ['Their', 'there']], ['If ___ ready, put on ___ shoes.', ['you’re', 'your']], ['She ran faster ___ Leo, and ___ she rested.', ['than', 'then']]];
  function fillIn(s, ws) { var i = 0; return s.replace(/___/g, function () { return ws[i++]; }); }
  function swapForm(w) { var m = { its: 'it’s', 'it’s': 'its', Its: 'It’s', 'It’s': 'Its', your: 'you’re', 'you’re': 'your', Your: 'You’re', 'You’re': 'Your', whose: 'who’s', 'who’s': 'whose', Whose: 'Who’s', 'Who’s': 'Whose', two: 'too', too: 'two', than: 'then', then: 'than', their: 'there', there: 'their', Their: 'There', There: 'Their' }; return m[w] || w; }
  G('usage.confused-common', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'one', 'one', R.pick(['two', 'one']));
    if (shape === 'one') {
      var C = R.pick(CC), key = C[1].toLowerCase();
      return { q: q([para('Which word fills the blank?'), say(C[0])]), a: mc(C[1], ctx.level === 1 ? C[2].slice(0, 1) : C[2]),
        hint: /’/.test(C[1] + C[2].join('')) ? 'Read an apostrophe word as two words. Does it fit?' : 'Think about what each word means.',
        steps: [CC_WHY[key], C[0].replace('___', C[1])] };
    }
    var D = R.pick(CC2), right = fillIn(D[0], D[1]);
    var w1 = fillIn(D[0], [swapForm(D[1][0]), D[1][1]]), w2 = fillIn(D[0], [D[1][0], swapForm(D[1][1])]), w3 = fillIn(D[0], [swapForm(D[1][0]), swapForm(D[1][1])]);
    return { q: q([para('Which sentence uses the right words?')]), a: mc(right, [w1, w2, w3]),
      hint: 'Test each blank on its own.', steps: [CC_WHY[D[1][0].toLowerCase()] || '', CC_WHY[D[1][1].toLowerCase()] || '', right].filter(Boolean) };
  });

  /* ---------------------------------------------------------------- usage.confused-advanced */
  var CA = {
    affect: { pair: ['affect', 'effect'], why: 'Affect is usually a verb (to influence); effect is usually a noun (a result).', s: [['Sleep can ___ your mood.', 0], ['The new rule had a big ___ on recess.', 1], ['How will the storm ___ our trip?', 0], ['The ___ of the medicine wore off.', 1], ['Noise can ___ how well you study.', 0], ['What ___ did the change have?', 1]] },
    accept: { pair: ['accept', 'except'], why: 'Accept means to take or agree to; except means leaving out.', s: [['Please ___ this small gift.', 0], ['Everyone ___ Leo came.', 1], ['I ___ your apology.', 0], ['The store is open every day ___ Sunday.', 1]] },
    imply: { pair: ['imply', 'infer'], why: 'The speaker implies (hints); the listener or reader infers (concludes).', s: [['From the dark clouds, I ___ that it will rain.', 1], ['Are you trying to ___ that I was late?', 0], ['What can we ___ from these numbers?', 1], ['Her smile seemed to ___ that she had good news.', 0]] },
    lose: { pair: ['lose', 'loose'], why: 'Lose means to misplace or not win; loose means not tight.', s: [['Don’t ___ your keys.', 0], ['My tooth is ___.', 1], ['We might ___ the game.', 0], ['The dog got ___ from its leash.', 1]] },
    complement: { pair: ['complement', 'compliment'], why: 'A complement completes or goes well with something; a compliment is praise.', s: [['She paid me a ___ on my drawing.', 1], ['The sauce will ___ the pasta.', 0], ['Thanks for the kind ___.', 1], ['The blue rug is a nice ___ to the walls.', 0]] },
    fewer: { pair: ['fewer', 'less'], why: 'In formal writing, usage guides recommend fewer for things you count and less for amounts.', formal: true, s: [['We had ___ students this year.', 0], ['There is ___ milk in the jug.', 1], ['I made ___ mistakes on this test.', 0], ['Use ___ salt next time.', 1], ['There are ___ cars on the road today.', 0], ['We need ___ noise in here.', 1]] }
  };
  var CA_KEYS = Object.keys(CA);
  G('usage.confused-advanced', function (R, ctx) {
    var K = CA[R.pick(CA_KEYS)], shape = ML.byLevel(ctx, 'one', R.pick(['one', 'one', 'why']), R.pick(['two', 'one']));
    var S = R.pick(K.s), right = K.pair[S[1]], other = K.pair[1 - S[1]], start = /^___/.test(S[0]);
    var ask = K.formal ? 'In formal writing, which word do usage guides recommend for the blank?' : 'Which word fills the blank?';
    if (shape === 'one') return { q: q([para(ask), say(S[0])]), a: mc(start ? cap(right) : right, [start ? cap(other) : other]),
      hint: K.why.split(';')[0] + '.', steps: [K.why, S[0].replace('___', right)] };
    if (shape === 'why') {
      var reasons = { affect: ['It needs a verb here.', 'It needs a noun here.'], accept: ['It means to take or agree to.', 'It means leaving out.'], imply: ['The speaker is hinting.', 'Someone is drawing a conclusion.'],
        lose: ['It means to misplace or not win.', 'It means not tight.'], complement: ['It means goes well with or completes.', 'It means praise.'], fewer: ['The noun names things you can count.', 'The noun names an amount, not separate things.'] }[K.pair[0]];
      return { q: q([para('The answer is <i>' + right + '</i>. Why?'), say(S[0])]), a: mc(reasons[S[1]], [reasons[1 - S[1]], 'Both words mean the same thing.']),
        hint: K.why, steps: [K.why, S[0].replace('___', right)] };
    }
    var a = R.pick(K.s.filter(function (x) { return x[1] === 0; })), b = R.pick(K.s.filter(function (x) { return x[1] === 1; })), first = R.coin(), s1 = first ? a : b, s2 = first ? b : a;
    function lab(x, y) { return '1: ' + x + ', 2: ' + y; }
    var r = lab(K.pair[s1[1]], K.pair[s2[1]]);
    return { q: q([para(K.formal ? 'Fill both blanks as usage guides recommend for formal writing.' : 'Fill both blanks.'), ol([s1[0], s2[0]])]),
      a: mc(r, [lab(K.pair[s2[1]], K.pair[s1[1]]), lab(K.pair[0], K.pair[0]), lab(K.pair[1], K.pair[1])]),
      hint: K.why, steps: [K.why, '1. ' + s1[0].replace('___', K.pair[s1[1]]), '2. ' + s2[0].replace('___', K.pair[s2[1]])] };
  });

  /* ---------------------------------------------------------------- usage.standard-forms */
  var SF = [['I ___ gone with you.', 'could have', 'could of'], ['You ___ called first.', 'should have', 'should of'], ['We ___ won with one more goal.', 'would have', 'would of'],
    ['They ___ left early.', 'must have', 'must of'], ['We ___ live near the lake.', 'used to', 'use to'], ['You are ___ wear a helmet.', 'supposed to', 'suppose to'],
    ['Thanks ___ for the help.', 'a lot', 'alot'], ['Is everything ___?', 'all right', 'alright'], ['___ of the weather, the game will go on.', 'Regardless', 'Irregardless'],
    ['___, the race was over.', 'For all intents and purposes', 'For all intensive purposes'], ['My grandma ___ make soup every Sunday.', 'used to', 'use to'],
    ['We were ___ meet at noon.', 'supposed to', 'suppose to'], ['I ___ sworn I saw a fox.', 'could have', 'could of']];
  var SF_WHY = { 'could have': 'Could’ve sounds like “could of,” but the word is have.', 'should have': 'Should’ve sounds like “should of,” but the word is have.', 'would have': 'Would’ve sounds like “would of,” but the word is have.',
    'must have': 'Must’ve sounds like “must of,” but the word is have.', 'used to': 'The past form is used to; the -d is hard to hear before to.', 'supposed to': 'The form is supposed to; the -d is hard to hear before to.',
    'a lot': 'A lot is always two words.', 'all right': 'Alright is common informally and is in dictionaries, but many editors still expect all right in formal writing.', Regardless: 'Formal writing uses regardless; irregardless is heard in speech.',
    'For all intents and purposes': 'The phrase means “in every practical way”: intents and purposes.' };
  G('usage.standard-forms', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'one', R.pick(['passage', 'one']), R.pick(['type', 'passage']));
    var S = R.pick(shape === 'passage' ? SF.filter(function (x) { return x[1] !== 'all right'; }) : SF);
    if (shape === 'one') return { q: q([para(S[1] === 'all right' ? 'Which form do many teachers and editors expect in formal writing?' : 'Which form belongs in formal writing?'), say(S[0])]), a: mc(S[1], [S[2]]),
      hint: 'In fast speech the two sound alike. What are the actual words?', steps: [SF_WHY[S[1]], S[0].replace('___', S[1])] };
    if (shape === 'passage') {
      var rest = samp(R, SF.filter(function (x) { return x[1] !== S[1] && x[1] !== 'all right'; }), 3), bad = R.int(0, 3);
      var list = rest.map(function (x) { return cap(x[0].replace('___', x[1])); }); list.splice(bad, 0, cap(S[0].replace('___', S[2])));
      return { q: q([para('Which numbered sentence uses a form that formal writing avoids?'), ol(list)]), a: mcKeep(nums(4), bad),
        hint: 'Look for words written the way they sound in fast speech.', steps: ['Sentence ' + (bad + 1) + ' uses “' + S[2] + '.”', SF_WHY[S[1]], cap(S[0].replace('___', S[1]))] };
    }
    var T = R.pick(SF.filter(function (x) { return /have$|to$|^a lot$/.test(x[1]); })), v = [T[1]];
    if (/have$/.test(T[1])) v.push(T[1].replace(' have', '’ve'));
    return { q: q([para('Type the standard form of the underlined words.'), say(cap(T[0].replace('___', '<u>' + T[2] + '</u>')))]), a: { t: 'text', v: v, strict: true },
      hint: 'Write the words that the sounds stand for.', steps: [SF_WHY[T[1]], cap(T[0].replace('___', T[1]))] };
  });

  /* ---------------------------------------------------------------- usage.usage-myths */
  var MYTHS = [
    ['She promised to carefully check each answer.', 'split'], ['We need to really listen to each other.', 'split'], ['He hopes to someday visit Japan.', 'split'], ['The club expects to more than double in size.', 'split'],
    ['What are you looking at?', 'prep'], ['This is the house I grew up in.', 'prep'], ['Which chair did you sit on?', 'prep'], ['That’s the song I was thinking of.', 'prep'],
    ['But the door was locked.', 'and'], ['And then the lights went out.', 'and'], ['But nobody knew the answer.', 'and'], ['And that is how the race was won.', 'and']];
  var REAL = [['The list of chores are long.', 'The subject is list (singular), so the verb is is: “The list of chores is long.”'], ['Each of the girls have a ticket.', 'Each is singular: “Each of the girls has a ticket.”'],
    ['The dogs barks at night.', 'Dogs is plural: “The dogs bark at night.”'], ['It was late, we went home.', 'A comma splice: “It was late, so we went home.”'],
    ['Because the bus was late.', 'A fragment: a dependent clause alone.'], ['The box of crayons are on the shelf.', 'The subject is box: “The box of crayons is on the shelf.”']];
  var MYTH_NAME = { split: 'Never split an infinitive.', prep: 'Never end a sentence with a preposition.', and: 'Never start a sentence with And or But.' };
  var MYTH_WHY = { split: 'A split infinitive (to + adverb + verb) is standard English; usage guides such as the Chicago Manual of Style accept it.', prep: 'Ending a sentence with a preposition is standard English; the Chicago Manual of Style and Merriam-Webster both say so.',
    and: 'Starting a sentence with And or But is standard English and has been for centuries.' };
  G('usage.usage-myths', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'yn', R.pick(['pick', 'yn']), R.pick(['name', 'statement', 'pick']));
    var M = R.pick(MYTHS), E = R.pick(REAL);
    if (shape === 'yn') {
      var real = R.chance(0.35), s = real ? E[0] : M[0];
      return { q: q([para('Does this sentence break a rule of standard English grammar?'), say(s)]), a: yn(real),
        hint: 'Some old classroom “rules” aren’t rules of grammar.', steps: real ? [E[1]] : [MYTH_WHY[M[1]], 'Some readers still prefer to avoid it in very formal writing, but it is not an error.'] };
    }
    if (shape === 'pick') {
      var ms = samp(R, MYTHS.filter(function (x) { return x !== M; }), 2).concat([M]).slice(0, ctx.level === 3 ? 3 : 2);
      return { q: para('Which sentence breaks a rule of standard grammar?'), a: mc(E[0], ms.map(function (x) { return x[0]; })),
        hint: 'Splitting an infinitive, ending with a preposition and starting with And or But are not errors.', steps: [E[1], 'The others follow old classroom bans that usage guides call myths.'] };
    }
    if (shape === 'name') return { q: q([para('This sentence is standard English, but it breaks an old classroom “rule.” Which one?'), say(M[0])]), a: mc(MYTH_NAME[M[1]], Object.keys(MYTH_NAME).filter(function (k) { return k !== M[1]; }).map(function (k) { return MYTH_NAME[k]; })),
      hint: 'Look at the start, the end, and any to + verb.', steps: [MYTH_WHY[M[1]]] };
    var st = R.pick([['split', 'splitting an infinitive (“to quickly finish”)'], ['prep', 'ending a sentence with a preposition'], ['and', 'starting a sentence with And or But']]);
    return { q: para('Which statement about ' + st[1] + ' is accurate?'), a: mc('It is not a grammar error, though some readers prefer to avoid it in formal writing.', ['It is always a grammar error.', 'It is allowed only in British English.', 'It is allowed only in questions.']),
      hint: 'Think about what usage guides say, and what some readers still prefer.', steps: [MYTH_WHY[st[0]], 'Some teachers and readers still object, so know your audience.'] };
  });

})(window.MathLadder);

/* ---- More forms of the same questions (round 7, "widen"): every topic of this course keeps its own generator above and
   sometimes asks the same skill in another form, built only from problems that generator made, so every answer is the
   generator's own:
   - check an answer: the question, one of its choices as a classmate's answer, and "Is that right?" (Yes / No; not in
     placement, where a guess is too easy; only for single-answer questions with three or more choices);
   - two at once: two different questions of the topic, answered together (short questions only, at most one of them with
     a picture, which then comes first; not in the courses for young children, whose answer box for two parts would
     also show a keypad button they don't need).
   Placed after the generators and registered with the same ids, so lessons, ids and the engine are unchanged. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var COURSE = 'usage', YOUNG = false, VAR = {};
  // how often another form is used: a quarter of the time when the topic's own generator already varies a lot at this
  // level, up to half the time when it has few different questions
  // (counted once per topic and level from 40 fixed seeds, ignoring the order of the choices)
  function share(id, base, ctx) {
    var L = (ctx && ctx.level) || 1, key = id + '|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 40; s++) {
        try {
          var p = base(ML.rand(id + '#variety#' + s + '#' + L), { level: L, mode: 'learn' }), a = p.a || {};
          var k = p.q + '|' + JSON.stringify(a.choices ? a.choices.slice().sort() : a.v) + '|' + JSON.stringify(p.viz || null);
          if (!seen[k]) { seen[k] = 1; n++; }
        } catch (e) { }
      }
      VAR[key] = n;
    }
    return VAR[key] >= 36 ? 0.25 : VAR[key] >= 25 ? 0.4 : 0.5;
  }
  function txt(s) { return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  var YN = /^(yes|no|true|false|right|wrong|correct|incorrect|not sure)\b/i;
  function checkable(p) {
    var a = p.a;
    if (!a || a.t !== 'mc' || Array.isArray(a.v) || !Array.isArray(a.choices) || a.choices.length < 3) return false;
    if (a.choices.some(function (c) { var t = txt(c); return !t || YN.test(t) || t.length > 180; })) return false;
    if (!p.viz && a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })) return false; // letters name parts of a picture
    if (/\b(is|was) (that|this|it) (right|correct)\b|\btrue or false\b/i.test(txt(p.q))) return false;
    return !p.unit;
  }
  function pairable(p, vizOk) {
    if ((p.viz && !vizOk) || p.unit || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf')) return false;
    if (p.a.t === 'mc' && (!Array.isArray(p.a.choices) || (!p.viz && p.a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })))) return false;
    return txt(p.q).length <= (YOUNG ? 240 : 480) && !/<(table|svg|img|canvas|ol|ul)\b/i.test(p.q) && !(YOUNG && /<blockquote\b/i.test(p.q));
  }
  function sameQ(p, p2) { // the same question, even with its choices in another order
    function k(x) { var a = x.a; return txt(x.q) + '|' + (a.t === 'mc' ? a.choices.slice().sort().join('|') + '|' + (Array.isArray(a.v) ? a.v.map(function (i) { return a.choices[i]; }).sort().join('|') : a.choices[a.v]) : JSON.stringify(a.v)); }
    return k(p) === k(p2);
  }
  function end(s) { s = String(s).replace(/\s+$/, ''); return /[.!?…”’)]$/.test(txt(s)) ? s : s + '.'; }
  function listed(q) { return /\b(these|those|the following|below|the choices|the options|one of them)\b/i.test(txt(q)); }
  function checkForm(R, p) {
    var a = p.a, right = R.coin(), k = right ? a.v : R.pick(a.choices.map(function (_, i) { return i; }).filter(function (i) { return i !== a.v; }));
    var who = YOUNG ? 'A friend picked' : 'A classmate answered', shown = a.choices[k], good = a.choices[a.v];
    var letters = a.choices.every(function (c) { return /^[A-H]$/.test(txt(c)); });
    var q = p.q + (!letters && listed(p.q.replace(/<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, '')) ? '<p>The choices: ' + a.choices.join(' &middot; ') + '</p>' : '') + '<p>' + who + ': <b>' + shown + '</b></p><p>Is that right?</p>';
    var out = { q: q, a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: p.hint || 'Work it out yourself first, then compare.',
      steps: [(right ? 'Yes, that is right: ' : 'No. The right answer is: ') + end(good)].concat(p.steps) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function pairForm(R, id, ctx, p, base) {
    for (var t = 0; t < 6; t++) {
      var R2 = ML.rand(id + '#pair#' + R.int(0, 999999999)), p2;
      try { p2 = base(R2, ctx); } catch (e) { return null; }
      if (p2 && p2.a && p2.a.t === 'mc' && !p2.a.choices && Array.isArray(p2.choices)) p2.a.choices = p2.choices;
      if (!p2 || !pairable(p2, !p.viz) || sameQ(p, p2)) continue;
      if (p2.viz) { var t2 = p; p = p2; p2 = t2; } // the question with the picture comes first
      var RM = /<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, rm = (p.q.match(RM) || p2.q.match(RM) || [''])[0];
      var out = { q: rm + '<p>Answer both questions.</p><ol class="ml-two"><li>' + p.q.replace(RM, '') + '</li><li>' + p2.q.replace(RM, '') + '</li></ol>',
        a: { t: 'multi', parts: [{ label: '1.', a: p.a }, { label: '2.', a: p2.a }] },
        hint: 'Take them one at a time.',
        steps: ['Question 1: ' + p.steps[0]].concat(p.steps.slice(1), ['Question 2: ' + p2.steps[0]], p2.steps.slice(1)) };
      var nl = [].concat(p.nolint || [], p2.nolint || []); if (nl.length) out.nolint = nl;
      if (p.viz) out.viz = p.viz;
      return out;
    }
    return null;
  }
  ML.genIds().filter(function (id) { return id.indexOf(COURSE + '.') === 0; }).forEach(function (id) {
    var base = ML.getGen(id);
    if (!base || base._forms) return;
    var fn = function (R, ctx) {
      var p = base(R, ctx), L = (ctx && ctx.level) || 1, mode = ctx && ctx.mode;
      if (!p || !p.a || !R.chance(share(id, base, ctx))) return p;
      if (p.a.t === 'mc' && !p.a.choices && Array.isArray(p.choices)) p.a.choices = p.choices;
      var forms = [];
      if (mode !== 'place' && checkable(p)) forms.push('check');
      if (pairable(p, true) && !YOUNG) forms.push('pair');
      if (!forms.length) return p;
      var f = R.pick(forms), out = f === 'check' ? checkForm(R, p) : pairForm(R, id, ctx, p, base);
      return out || p;
    };
    fn._forms = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : null);
