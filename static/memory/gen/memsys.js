/* Memory Systems (Memory Ladder, course key memsys): problem generators for all 27 topics.
   Uses the helpers MathLadder.memgen from memsk.js when it is loaded, and defines its own copies otherwise (each course file
   must work alone). The Major System words below were written for this course and checked against a pronouncing
   dictionary (CMU) by /tmp/work_memladder/verify.py: each word's consonant sounds give its number.
   Major System: 0 s z · 1 t d · 2 n · 3 m · 4 r · 5 l · 6 j sh ch soft g · 7 k hard g · 8 f v · 9 p b; vowels, w, h, y free.
   Levels: 1 small numbers and three choices; 2 four choices, longer numbers; 3 tricky spellings, typed answers, PAO triples. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;

  // ------------------------------------------------------------------ helpers (own copies; same behavior as memsk.js)
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { var k = String(x); if (!s[k]) { s[k] = 1; o.push(x); } }); return o; }
  function samp(R, a, k) { return R.sample(a, Math.max(0, Math.min(k, a.length))); }
  function pickV(R, x) { return Array.isArray(x) ? R.pick(x) : x; }
  function mc(q, right, wrongs, steps, o) {
    o = o || {};
    wrongs = uniq(wrongs.filter(function (w) { return String(w) !== String(right); }));
    var p = { q: q, a: { t: 'mc', choices: [right].concat(wrongs), v: 0 }, steps: steps && steps.length ? steps : ['The answer is: ' + right + '.'] };
    if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.keep) p.a.keep = true;
    return p;
  }
  function tf(stmt, val, why) { return { q: 'True or false? ' + stmt, a: { t: 'tf', v: !!val }, steps: [(val ? 'True. ' : 'False. ') + (why || '')] }; }
  function num(q, v, steps, o) { var p = { q: q, a: { t: 'num', v: String(v), form: 'int' }, steps: steps }; if (o && o.viz) p.viz = o.viz; if (o && o.hint) p.hint = o.hint; return p; }
  function text(q, v, steps, o) { var p = { q: q, a: { t: 'text', v: v, strict: true }, steps: steps }; if (o && o.hint) p.hint = o.hint; if (o && o.viz) p.viz = o.viz; return p; }
  function ceilDiv(a, b) { return Math.floor((a + b - 1) / b); }
  function itemMc(R, it, k) { var r = pickV(R, it.r); return mc(pickV(R, it.q), r, samp(R, it.w, k - 1), [it.why || ('The answer is: ' + r + '.')]); }
  function whichOne(R, facts, wantTrue, k) {
    var T = facts.filter(function (f) { return f[1]; }), F = facts.filter(function (f) { return !f[1]; }), odd = wantTrue ? T : F, rest = wantTrue ? F : T;
    if (!odd.length || rest.length < k - 1) return null;
    var o = R.pick(odd), others = R.sample(rest, k - 1);
    return mc(wantTrue ? 'Which statement is <b>true</b>?' : 'Which statement is <b>false</b>?', o[0], others.map(function (f) { return f[0]; }), [o[0] + ' ' + (wantTrue ? 'True' : 'False') + (o[2] ? ': ' + o[2] : '.')]);
  }
  function chooseAll(R, facts) {
    var T = facts.filter(function (f) { return f[1]; }), F = facts.filter(function (f) { return !f[1]; });
    if (T.length < 2 || F.length < 2) return null;
    var nT = R.int(2, Math.min(3, T.length)), nF = Math.min(F.length, 5 - nT), pick = R.sample(T, nT).concat(R.sample(F, nF)), ord = R.shuffle(pick.map(function (_, i) { return i; })), v = [];
    ord.forEach(function (i, j) { if (i < nT) v.push(j); });
    return { q: 'Choose <b>all</b> the statements that are true.', a: { t: 'mc', choices: ord.map(function (i) { return pick[i][0]; }), v: v }, steps: ord.map(function (i) { return pick[i][0] + ' ' + (pick[i][1] ? 'True.' : 'False.'); }), hint: 'Decide about each statement on its own.' };
  }
  function bankProblem(R, lv, D) {
    var facts = D.facts || [], items = D.items || [], r = R.next(), p = null;
    if (lv === 1) { if (facts.length && (r < 0.25 || !items.length)) { var f = R.pick(facts); return tf(f[0], f[1], f[2]); } return itemMc(R, R.pick(items), 3); }
    if (lv === 2) { if (r < 0.35 && facts.length) p = whichOne(R, facts, true, 3); return p || (items.length ? itemMc(R, R.pick(items), 4) : whichOne(R, facts, true, 3)) || tfAny(R, facts); }
    if (r < 0.25 && facts.length) p = whichOne(R, facts, false, 4); else if (r < 0.5 && facts.length) p = chooseAll(R, facts);
    return p || (items.length ? itemMc(R, R.pick(items), 4) : whichOne(R, facts, false, 3)) || tfAny(R, facts);
  }
  function tfAny(R, facts) { var f = R.pick(facts); return tf(f[0], f[1], f[2]); }
  function T(id, D, fams, share) {
    G(id, function (R, ctx) {
      var lv = ctx && ctx.level || 1;
      if (fams.length && (R.next() < share || !D || !((D.items && D.items.length) || (D.facts && D.facts.length)))) { var p = R.pick(fams)(R, lv); if (p) return p; }
      return bankProblem(R, lv, D || {});
    });
  }
  var NAMES = ['Ana', 'Ben', 'Cora', 'Dev', 'Eli', 'Faith', 'Gus', 'Hope', 'Ivan', 'June', 'Kai', 'Lena', 'Milo', 'Nia', 'Owen', 'Pia'];
  var ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

  // ------------------------------------------------------------------ pegs
  var RHYME = ['', 'bun', 'shoe', 'tree', 'door', 'hive', 'sticks', 'heaven', 'gate', 'vine', 'hen'];
  var SHAPE = ['ball', 'candle', 'swan', 'butterfly', 'sailboat', 'hook', 'golf club', 'boomerang', 'snowman', 'balloon on a string'];
  var THINGS = ['a kite', 'a drum', 'a lamp', 'a rope', 'a bell', 'a boat', 'a trumpet', 'a pumpkin', 'a ladder', 'a clock', 'a hat', 'a whale', 'a cactus', 'a robot', 'milk', 'stamps', 'batteries', 'a map', 'a violin', 'pizza', 'a teapot', 'an anchor', 'a feather', 'a globe'];
  function famRhymePeg(R, lv) {
    var n = R.int(1, 10), k = R.int(0, 2);
    if (k === 0) return mc('In the number-rhyme pegs, what is the peg for <b>' + n + '</b>?', RHYME[n], samp(R, RHYME.slice(1).filter(function (x) { return x !== RHYME[n]; }), lv === 1 ? 2 : 3), [n + ' rhymes with ' + RHYME[n] + '.']);
    if (k === 1) return num('In the number-rhyme pegs, which number is the peg <b>' + RHYME[n] + '</b>?', n, [RHYME[n] + ' rhymes with ' + n + '.']);
    var t = R.pick(THINGS);
    return mc('Using rhyme pegs, item number ' + n + ' on your list is ' + t + '. Which picture hangs it on its peg?', 'Something joining ' + t + ' with a ' + RHYME[n], samp(R, uniq(RHYME.slice(1).filter(function (x) { return x !== RHYME[n]; })).map(function (x) { return 'Something joining ' + t + ' with a ' + x; }), lv === 1 ? 2 : 3), ['Peg ' + n + ' is ' + RHYME[n] + ', so the picture joins ' + t + ' with a ' + RHYME[n] + '.']);
  }
  function famShapePeg(R, lv) {
    var d = R.int(0, 9), k = R.int(0, 2);
    if (k === 0) return mc('In the number-shape pegs, which object stands for <b>' + d + '</b>?', SHAPE[d], samp(R, SHAPE.filter(function (_, i) { return i !== d; }), lv === 1 ? 2 : 3), [d + ' looks like a ' + SHAPE[d] + '.']);
    if (k === 1) return num('In the number-shape pegs, which digit is the <b>' + SHAPE[d] + '</b>?', d, ['A ' + SHAPE[d] + ' looks like ' + d + '.']);
    var t = R.pick(THINGS);
    return mc('Using shape pegs, item ' + d + ' is ' + t + '. Which picture hangs it on its peg?', 'Something joining ' + t + ' with a ' + SHAPE[d], samp(R, SHAPE.filter(function (_, i) { return i !== d; }).map(function (x) { return 'Something joining ' + t + ' with a ' + x; }), lv === 1 ? 2 : 3), ['Digit ' + d + ' is the ' + SHAPE[d] + '.']);
  }
  function famPegList(R, lv) {
    var n = lv === 1 ? 4 : lv === 2 ? 6 : 8, it = samp(R, THINGS, n), k = R.int(0, n - 1), useShape = R.coin();
    var peg = function (i) { return useShape ? SHAPE[i + 1] : RHYME[i + 1]; };
    var listing = it.map(function (x, i) { return (i + 1) + ' ' + peg(i) + ' (' + x + ')'; }).join(', ');
    if (lv >= 2 && R.coin() && k < n - 1) return mc('Your ' + (useShape ? 'shape' : 'rhyme') + ' pegs hold: ' + listing + '. Which item comes right after ' + it[k] + '?', it[k + 1], samp(R, it.filter(function (x) { return x !== it[k + 1]; }), 3), [it[k] + ' is on peg ' + (k + 1) + '; peg ' + (k + 2) + ' (' + peg(k + 1) + ') holds ' + it[k + 1] + '.']);
    return mc('Your ' + (useShape ? 'shape' : 'rhyme') + ' pegs hold: ' + listing + '. What was item ' + (k + 1) + '?', it[k], samp(R, it.filter(function (x) { return x !== it[k]; }), lv === 1 ? 2 : 3), ['Peg ' + (k + 1) + ' is ' + peg(k) + ', which holds ' + it[k] + '.']);
  }

  // ------------------------------------------------------------------ the Major System
  var SND = ['s, z', 't, d', 'n', 'm', 'r', 'l', 'j, sh, ch, soft g', 'k, hard g', 'f, v', 'p, b'];
  var SND1 = ['s', 't', 'n', 'm', 'r', 'l', 'sh', 'k', 'f', 'p'];
  var CONF = { 0: [1, 6], 1: [0, 2], 2: [3, 1], 3: [2, 4], 4: [5, 3], 5: [4, 6], 6: [7, 0], 7: [6, 9], 8: [9, 6], 9: [8, 7] };
  // the course's 00 to 99 list (lesson memsys.major-list) and one-digit words
  var MAJ2 = ['sauce', 'suit', 'sun', 'sumo', 'sore', 'sail', 'sash', 'sock', 'sofa', 'soap',
    'toes', 'toad', 'tuna', 'team', 'tire', 'tail', 'dish', 'duck', 'dove', 'tub',
    'nose', 'net', 'onion', 'gnome', 'winner', 'nail', 'notch', 'neck', 'knife', 'knob',
    'mouse', 'mat', 'moon', 'mime', 'mower', 'mail', 'match', 'mug', 'movie', 'map',
    'rose', 'rat', 'rain', 'ram', 'rower', 'roll', 'ridge', 'rock', 'roof', 'rope',
    'lace', 'light', 'lion', 'lime', 'lawyer', 'lily', 'leash', 'lock', 'leaf', 'lip',
    'cheese', 'sheet', 'chain', 'jam', 'jar', 'jelly', 'judge', 'chalk', 'chef', 'ship',
    'goose', 'cat', 'can', 'comb', 'car', 'coal', 'cage', 'cake', 'cave', 'cub',
    'vase', 'foot', 'fan', 'foam', 'fire', 'file', 'fish', 'fog', 'fife', 'fob',
    'bus', 'bat', 'bone', 'beam', 'bear', 'bell', 'beach', 'book', 'puff', 'pipe'];
  var MAJ1 = ['sea', 'tie', 'knee', 'home', 'ray', 'hill', 'shoe', 'cow', 'ivy', 'bee'];
  function two(n) { return (n < 10 ? '0' : '') + n; }
  // more words with their numbers: [word, code, the code a spelling-reader would wrongly give, the rule]
  var DEC = [['rocket', '471'], ['candle', '7215'], ['pencil', '9205'], ['tomato', '131'], ['parrot', '941'], ['lemon', '532'], ['ladder', '514'], ['camel', '735'], ['window', '21'], ['hammer', '34', '334', 'mm is one sound'],
    ['button', '912', '9112', 'tt is one sound'], ['kitten', '712', '7112', 'tt is one sound'], ['bell', '95', '955', 'll is one sound'], ['knife', '28', '728', 'the k is silent'], ['lamb', '53', '539', 'the b is silent'], ['comb', '73', '739', 'the b is silent'],
    ['knight', '21', '7271', 'k and gh are silent'], ['phone', '82', '962', 'ph sounds like f'], ['city', '01', '71', 'this c sounds like s'], ['giraffe', '648', '7488', 'this g sounds like j, and ff is one sound'], ['chef', '68', '78', 'ch here sounds like sh'], ['box', '970', '97', 'x is two sounds, k and s'],
    ['honey', '2', '2', 'h and y are free'], ['lighthouse', '510', '57100', 'gh is silent and h is free'], ['laugh', '58', '57', 'gh sounds like f here'], ['ghost', '701', '7701', 'gh sounds like hard g'], ['school', '075', '0675', 'ch sounds like k here'], ['wheel', '5', '5', 'w and h are free'],
    ['yellow', '5', '55', 'y and w are free; ll is one sound'], ['muffin', '382', '3882', 'ff is one sound'], ['cherry', '64', '644', 'rr is one sound'], ['jacket', '671', '6771', 'ck is one k sound'], ['dollar', '154', '1554', 'll is one sound'], ['hippo', '9', '99', 'h is free; pp is one sound'],
    ['zebra', '094'], ['music', '307'], ['garden', '7412'], ['robot', '491'], ['tiger', '174'], ['spider', '0914'], ['basket', '9071'], ['magnet', '3721']];
  function code(w) { var i = MAJ2.indexOf(w); if (i >= 0) return two(i); i = MAJ1.indexOf(w); if (i >= 0) return String(i); for (var k = 0; k < DEC.length; k++) if (DEC[k][0] === w) return DEC[k][1]; return null; }
  function soundsOf(c) { return String(c).split('').map(function (d) { return SND[+d]; }).join(' · '); }
  function famSoundDigit(R, lv) {
    var d = R.int(0, 9);
    if (R.coin()) return mc('In the Major System, which sounds stand for <b>' + d + '</b>?', SND[d], samp(R, CONF[d].map(function (x) { return SND[x]; }).concat(SND.filter(function (_, i) { return i !== d; })), lv === 1 ? 2 : 3), [d + ' = ' + SND[d] + '.']);
    var s = SND[d].split(', '), one = R.pick(s);
    return num('In the Major System, which digit does the sound <b>' + one + '</b> stand for?', d, ['“' + one + '” is a sound for ' + d + ' (' + SND[d] + ').']);
  }
  function famDigitsToSounds(R, lv) {
    var n = lv === 1 ? 2 : lv === 2 ? 3 : 4, ds = R.ints(n, 0, 9).map(String).join('');
    var right = ds.split('').map(function (d) { return SND1[+d]; }).join(' · ');
    var wr = [];
    for (var t = 0; t < 8 && wr.length < 3; t++) {
      var arr = ds.split(''), i = R.int(0, n - 1); arr[i] = String(R.pick(CONF[+arr[i]]));
      var w = arr.map(function (d) { return SND1[+d]; }).join(' · '); if (w !== right && wr.indexOf(w) < 0) wr.push(w);
    }
    var rev = ds.split('').reverse().map(function (d) { return SND1[+d]; }).join(' · '); if (rev !== right) wr.push(rev);
    return mc('Turn <b>' + ds + '</b> into Major System sounds, in order (one sound per digit).', right, samp(R, uniq(wr), lv === 1 ? 2 : 3), ds.split('').map(function (d) { return d + ' → ' + SND[+d]; }), { hint: 'One digit, one consonant sound, in order.' });
  }
  function famWordFor(R, lv) {
    var n = lv === 1 ? R.int(10, 99) : R.int(0, 99), w = MAJ2[n], c = two(n);
    var near = [MAJ2[+(c[1] + c[0])], MAJ2[(CONF[+c[0]][0]) * 10 + (+c[1])], MAJ2[(+c[0]) * 10 + CONF[+c[1]][0]], MAJ2[(CONF[+c[0]][1]) * 10 + CONF[+c[1]][1]]];
    var oth = uniq(near.filter(function (x) { return x && x !== w; }));
    if (lv === 3 && R.coin()) {
      var d = R.pick(DEC);
      var wr2 = DEC.filter(function (x) { return x[1] !== d[1]; });
      return mc('Which word stands for <b>' + d[1] + '</b> in the Major System?', d[0], samp(R, wr2, 3).map(function (x) { return x[0]; }), [d[0] + ': ' + d[1].split('').map(function (x) { return SND[+x]; }).join(', ') + ' → ' + d[1] + '.']);
    }
    return mc('Which word stands for <b>' + c + '</b> in the Major System?', w, samp(R, oth, lv === 1 ? 2 : 3), [c[0] + ' = ' + SND[+c[0]] + '; ' + c[1] + ' = ' + SND[+c[1]] + '.', w + ' has exactly those sounds, in that order.']);
  }
  function famDecode(R, lv) {
    var w, c, d;
    if (lv === 1) { var n = R.int(10, 99); w = MAJ2[n]; c = two(n); }
    else if (lv === 2) { if (R.coin()) { var n2 = R.int(0, 99); w = MAJ2[n2]; c = two(n2); } else { d = R.pick(DEC.filter(function (x) { return !x[2]; })); w = d[0]; c = d[1]; } }
    else { d = R.pick(DEC.filter(function (x) { return x[2]; })); w = d[0]; c = d[1]; }
    var q = 'Decode the word <b>' + w + '</b> with the Major System. What number does it make?' + (c.charAt(0) === '0' ? ' (Keep a leading 0.)' : '');
    var steps = ['Say it aloud and keep only the consonant sounds.', c.split('').map(function (x) { return SND1[+x] + ' sound = ' + x; }).join('; ') + '.'];
    if (d && d[3]) steps.splice(1, 0, 'Careful: ' + d[3] + '.');
    steps.push('The number is ' + c + '.');
    if (lv === 3 && d && d[2] && R.coin()) return mc('Decode <b>' + w + '</b> with the Major System (sounds, not spelling).', c, uniq([d[2], c.split('').reverse().join(''), c + c.slice(-1)]).filter(function (x) { return x !== c; }), steps);
    if (c.charAt(0) === '0') return text(q, [c], steps, { hint: 'Vowels and w, h, y count for nothing.' });
    return num(q, c, steps, { hint: 'Vowels and w, h, y count for nothing.' });
  }
  function famRules(R, lv) {
    var d = R.pick(DEC.filter(function (x) { return x[2] && x[2] !== x[1]; }));
    return mc('A beginner coded <b>' + d[0] + '</b> as ' + d[2] + ' by reading its letters. What is the right number, by sound?', d[1], uniq([d[2], d[1].split('').reverse().join(''), d[1] + '0']).filter(function (x) { return x !== d[1]; }).slice(0, lv === 1 ? 2 : 3), ['The rule: ' + d[3] + '.', d[0] + ' = ' + d[1] + '.']);
  }
  var YEARS = [['1066', 'the Norman conquest of England'], ['1215', 'Magna Carta'], ['1492', 'Columbus’s first voyage'], ['1607', 'the founding of Jamestown'], ['1620', 'the Mayflower’s voyage'], ['1776', 'the Declaration of Independence'], ['1787', 'the U.S. Constitution was written'], ['1803', 'the Louisiana Purchase'], ['1865', 'the end of the American Civil War'], ['1903', 'the Wright brothers’ first powered flight'], ['1969', 'the first Moon landing'], ['1455', 'Gutenberg’s Bible was printed (about this year)'], ['1588', 'the Spanish Armada'], ['1815', 'the Battle of Waterloo'], ['1869', 'the transcontinental railroad was finished']];
  function famAnyYear(R, lv) {
    var y = String(R.int(lv === 1 ? 1100 : 1000, 1999)), a = +y.slice(0, 2), b = +y.slice(2);
    if (R.coin()) return mc('Using the course’s 00 to 99 list, which two pictures stand for the year <b>' + y + '</b>?', MAJ2[a] + ' + ' + MAJ2[b], samp(R, uniq([MAJ2[b] + ' + ' + MAJ2[a], MAJ2[(a + 1) % 100] + ' + ' + MAJ2[b], MAJ2[a] + ' + ' + MAJ2[(b + 10) % 100], MAJ2[a] + ' + ' + MAJ2[(b + 1) % 100]]).filter(function (x) { return x !== MAJ2[a] + ' + ' + MAJ2[b]; }), lv === 1 ? 2 : 3), [y.slice(0, 2) + ' = ' + MAJ2[a] + '; ' + y.slice(2) + ' = ' + MAJ2[b] + '.']);
    return num('With the course’s 00 to 99 list, a <b>' + MAJ2[a] + '</b> and a <b>' + MAJ2[b] + '</b> stand for a year. Which year?', y, [MAJ2[a] + ' = ' + two(a) + '; ' + MAJ2[b] + ' = ' + two(b) + '.', 'The year is ' + y + '.']);
  }
  function famYear(R, lv) {
    var y = R.pick(YEARS), a = +y[0].slice(0, 2), b = +y[0].slice(2), right = MAJ2[a] + ' + ' + MAJ2[b];
    if (lv >= 2 && R.coin()) return num('With the course’s 00 to 99 list, a picture of a <b>' + MAJ2[a] + '</b> and a <b>' + MAJ2[b] + '</b> stands for the year of ' + y[1] + '. What year is it?', y[0], [MAJ2[a] + ' = ' + two(a) + '; ' + MAJ2[b] + ' = ' + two(b) + '.', 'Together: ' + y[0] + '.']);
    var wr = [MAJ2[b] + ' + ' + MAJ2[a], MAJ2[(a + 1) % 100] + ' + ' + MAJ2[b], MAJ2[a] + ' + ' + MAJ2[(b + 1) % 100], MAJ2[+String(a).split('').reverse().join('')] + ' + ' + MAJ2[b]];
    return mc('Using the course’s 00 to 99 list, which two pictures stand for <b>' + y[0] + '</b> (' + y[1] + ')?', right, samp(R, uniq(wr).filter(function (x) { return x !== right; }), lv === 1 ? 2 : 3), [y[0].slice(0, 2) + ' = ' + MAJ2[a] + '; ' + y[0].slice(2) + ' = ' + MAJ2[b] + '.']);
  }
  function famLongNum(R, lv) {
    var k = R.int(0, 2);
    if (k === 0 || lv === 1) {
      var n = lv === 1 ? R.pick([2, 3]) : R.int(3, 4), ds = R.ints(n * 2, 0, 9).join(''), prs = ds.match(/../g), right = prs.map(function (p) { return MAJ2[+p]; }).join(', ');
      var wr = [prs.slice().reverse().map(function (p) { return MAJ2[+p]; }).join(', '), prs.map(function (p) { return MAJ2[+(p[1] + p[0])]; }).join(', '), prs.map(function (p, i) { return MAJ2[i ? +p : (+p + 1) % 100]; }).join(', ')];
      return mc('Split <b>' + ds + '</b> into pairs and use the course’s 00 to 99 list. Which pictures, in order?', right, samp(R, uniq(wr).filter(function (x) { return x !== right; }), lv === 1 ? 2 : 3), ['Pairs: ' + prs.join(' · ') + '.', 'Pictures: ' + right + '.'], { viz: { name: 'mm-chunks', opts: { digits: ds, groups: prs.map(function () { return 2; }), names: prs.map(function (p) { return MAJ2[+p]; }) } } });
    }
    var dg = R.int(lv === 2 ? 10 : 21, lv === 2 ? 40 : 120), per = R.pick([1, 2, 3]), pics = ceilDiv(dg, 2), stops = ceilDiv(pics, per);
    if (k === 1) return num('How many pictures does a <b>' + dg + '-digit</b> number need with two digits per picture? (A last single digit gets its own picture.)', pics, [dg + ' ÷ 2 = ' + (dg / 2) + (dg % 2 ? ', round up' : '') + '.', pics + ' pictures.']);
    return num('A <b>' + dg + '-digit</b> number, two digits per picture, ' + per + ' picture' + (per > 1 ? 's' : '') + ' per stop. How many stops do you need?', stops, ['Pictures: ' + dg + ' ÷ 2 → ' + pics + '.', 'Stops: ' + pics + ' ÷ ' + per + ' → ' + stops + ' (round up).']);
  }

  // ------------------------------------------------------------------ cards, PAO, capacity
  var PAO = [['A♠', 'a pilot', 'flying', 'a kite'], ['K♥', 'a king', 'waving', 'a crown'], ['7♦', 'a chef', 'stirring', 'a pot'], ['2♣', 'a farmer', 'planting', 'a seed'], ['Q♠', 'a queen', 'pouring', 'a teapot'], ['5♥', 'a firefighter', 'spraying', 'a hose'],
    ['9♣', 'a painter', 'painting', 'an easel'], ['3♦', 'a baker', 'kneading', 'dough'], ['J♥', 'a sailor', 'rowing', 'an oar'], ['8♠', 'a juggler', 'juggling', 'pins'], ['4♣', 'a gardener', 'digging with', 'a spade'], ['6♦', 'a drummer', 'drumming on', 'a drum']];
  function paoTable(cs) { return cs.map(function (c) { return c[0] + ' = ' + c[1] + ' / ' + c[2] + ' / ' + c[3]; }).join('; '); }
  function famPAO(R, lv) {
    var cs = R.sample(PAO, lv === 1 ? 3 : lv === 2 ? 4 : 5), tri = R.sample(cs, 3), right = cap(tri[0][1]) + ' ' + tri[1][2] + ' ' + tri[2][3];
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    var tab = 'Your PAO codes (person / action / object): ' + paoTable(cs) + '. ';
    if (lv === 3 && R.coin()) {
      var rightC = tri.map(function (c) { return c[0]; }).join(', ');
      var w = [[tri[1], tri[0], tri[2]], [tri[2], tri[1], tri[0]], [tri[0], tri[2], tri[1]]].map(function (t) { return t.map(function (c) { return c[0]; }).join(', '); });
      return mc(tab + 'You see the picture: <b>' + right.toLowerCase() + '</b>. Which three cards, in order?', rightC, uniq(w).filter(function (x) { return x !== rightC; }), ['Person ' + tri[0][1] + ' → ' + tri[0][0] + ' (first card).', 'Action ' + tri[1][2] + ' → ' + tri[1][0] + ' (second).', 'Object ' + tri[2][3] + ' → ' + tri[2][0] + ' (third).']);
    }
    var wr = [cap(tri[1][1]) + ' ' + tri[0][2] + ' ' + tri[2][3], cap(tri[0][1]) + ' ' + tri[0][2] + ' ' + tri[0][3], cap(tri[2][1]) + ' ' + tri[1][2] + ' ' + tri[0][3], cap(tri[0][1]) + ' ' + tri[2][2] + ' ' + tri[1][3]];
    return mc(tab + 'The cards come up <b>' + tri.map(function (c) { return c[0]; }).join(', ') + '</b>. What is the PAO picture?', right, samp(R, uniq(wr).filter(function (x) { return x !== right; }), lv === 1 ? 2 : 3), ['Person from the first card (' + tri[0][0] + '): ' + tri[0][1] + '.', 'Action from the second (' + tri[1][0] + '): ' + tri[1][2] + '.', 'Object from the third (' + tri[2][0] + '): ' + tri[2][3] + '.']);
  }
  function famCapacity(R, lv) {
    var k = R.int(0, 3), items, per, pps, what;
    if (k === 0) { items = R.coin() ? 52 : R.int(10, lv === 1 ? 30 : 104); per = R.pick([1, 2, 3]); var pics = ceilDiv(items, per); return num('How many pictures do <b>' + items + ' cards</b> need with ' + per + ' card' + (per > 1 ? 's' : '') + ' per picture?', pics, [items + ' ÷ ' + per + (items % per ? ' = ' + (items / per).toFixed(1) + ', round up' : '') + ' → ' + pics + '.']); }
    if (k === 1) { per = R.pick([1, 2, 3]); pps = R.pick([1, 2, 3]); return num('With ' + per + ' card' + (per > 1 ? 's' : '') + ' per picture and ' + pps + ' picture' + (pps > 1 ? 's' : '') + ' per stop, how many cards does <b>one stop</b> hold?', per * pps, [per + ' × ' + pps + ' = ' + (per * pps) + '.']); }
    if (k === 2) { items = R.pick([52, 104, 156]); per = R.pick([1, 2, 3]); pps = R.pick([1, 2, 3]); var p2 = ceilDiv(items, per), st = ceilDiv(p2, pps); what = items === 52 ? 'a deck (52 cards)' : items / 52 + ' decks (' + items + ' cards)'; return num('You memorize ' + what + ' with ' + per + ' cards per picture and ' + pps + ' picture' + (pps > 1 ? 's' : '') + ' per stop. How many stops?', st, ['Pictures: ' + items + ' ÷ ' + per + ' → ' + p2 + '.', 'Stops: ' + p2 + ' ÷ ' + pps + ' → ' + st + '.']); }
    var stops = R.int(lv === 1 ? 5 : 10, lv === 1 ? 20 : 60); per = R.pick([2, 2, 3]); pps = R.pick([1, 2]);
    return num('A journey has ' + stops + ' stops, ' + pps + ' picture' + (pps > 1 ? 's' : '') + ' per stop, ' + per + ' digits per picture. How many digits can it hold?', stops * pps * per, [stops + ' × ' + pps + ' × ' + per + ' = ' + (stops * pps * per) + '.']);
  }
  var SPOTS = ['gate', 'porch', 'front door', 'hall', 'stairs', 'kitchen', 'stove', 'garden', 'shed', 'mailbox', 'fence', 'pond', 'bench', 'oak tree', 'bridge', 'library', 'bakery', 'fountain'];
  function famJourney(R, lv) {
    var n = lv === 1 ? 5 : lv === 2 ? 7 : 10, sp = R.sample(SPOTS, n), it = R.sample(THINGS, n), k = R.int(1, n - 1), kind = R.int(0, 2);
    var listing = sp.map(function (s, i) { return (i + 1) + ' ' + s + ' (' + it[i] + ')'; }).join(', ');
    var viz = { name: 'mm-palace', opts: { spots: sp, items: it, quiet: true } };
    if (kind === 0) return mc('Your journey: ' + listing + '. What came just <b>before</b> ' + it[k] + '?', it[k - 1], samp(R, it.filter(function (_, i) { return i !== k - 1; }), lv === 1 ? 2 : 3), [it[k] + ' is at stop ' + (k + 1) + ' (' + sp[k] + ').', 'Stop ' + k + ' (' + sp[k - 1] + ') holds ' + it[k - 1] + '.'], { viz: viz });
    if (kind === 1) return num('Your journey: ' + listing + '. At which stop <b>number</b> is ' + it[k] + '?', k + 1, ['Count along the route: ' + it[k] + ' is at the ' + sp[k] + ', stop ' + (k + 1) + '.'], { viz: viz });
    var right = sp.join(' → '), wr = [sp.slice().reverse().join(' → '), R.shuffle(sp).join(' → '), sp.slice(1).concat(sp[0]).join(' → ')];
    return mc('Your journey stops are numbered ' + sp.map(function (s, i) { return s + ' (' + (i + 1) + ')'; }).join(', ') + '. Which is the route in order?', right, samp(R, uniq(wr).filter(function (x) { return x !== right; }), lv === 1 ? 2 : 3), ['Follow the numbers 1 to ' + n + ': ' + right + '.']);
  }
  function famLandmark(R, lv) {
    var s = R.int(6, lv === 1 ? 20 : 60), lm = Math.floor(s / 5) * 5;
    if (s % 5 === 0) return num('You mark every fifth stop of a journey with a landmark. Stop ' + s + ' is a landmark. How many landmarks come up to and including it?', s / 5, [s + ' ÷ 5 = ' + (s / 5) + '.']);
    return num('You mark every fifth stop with a landmark. You need stop <b>' + s + '</b>. How many stops past the landmark at stop ' + lm + ' is it?', s - lm, [s + ' − ' + lm + ' = ' + (s - lm) + '.']);
  }
  var JOBS = [['a short list of 6 errands', 'A link or story'], ['a numbered list where you must answer “what was seventh?”', 'Number pegs'], ['a 40-item list in order', 'A journey'], ['a 30-digit number', 'The Major System on a journey'],
    ['a shuffled deck of cards', 'PAO (or card codes) on a journey'], ['the key points of a 10-minute talk', 'A journey, one point per stop'], ['a phone number', 'The Major System'], ['a list of 5 things to pack', 'A link or story'], ['the years of ten events', 'The Major System']];
  var SYS = ['A link or story', 'Number pegs', 'A journey', 'The Major System', 'PAO (or card codes) on a journey', 'The Major System on a journey', 'A journey, one point per stop'];
  function famSystem(R, lv) {
    var j = R.pick(JOBS), w = SYS.filter(function (x) { return x !== j[1] && x.indexOf(j[1]) < 0 && j[1].indexOf(x) < 0; });
    return mc('Which system fits best for <b>' + j[0] + '</b>?', j[1], samp(R, w, lv === 1 ? 2 : 3), ['Match the system to the job: ' + j[0] + ' → ' + j[1].toLowerCase() + '.']);
  }
  function famLink(R, lv) {
    var n = lv === 1 ? 4 : lv === 2 ? 5 : 6, it = R.sample(THINGS, n), k = R.int(0, n - 2);
    if (lv >= 2 && R.coin()) {
      var b = R.int(1, n - 2);
      return mc('You linked a chain: ' + it.join(' → ') + '. The picture joining ' + it[b] + ' and ' + it[b + 1] + ' is forgotten. With the link method, what can you still recall in order from the start?', it.slice(0, b + 1).join(', '), [it.join(', '), it.slice(0, b).join(', '), it.slice(b + 1).join(', ')].filter(function (x) { return x; }), ['Each link leads to the next, so the chain stops at the broken link: ' + it.slice(0, b + 1).join(', ') + '.', 'That is why journeys are safer for long lists.']);
    }
    return mc('You linked a chain: ' + it.join(' → ') + '. Which item does the picture with ' + it[k] + ' lead you to?', it[k + 1], samp(R, it.filter(function (_, i) { return i !== k + 1; }), lv === 1 ? 2 : 3), ['Each picture joins an item with the next one: ' + it[k] + ' → ' + it[k + 1] + '.']);
  }

  // ------------------------------------------------------------------ verse (public-domain lines)
  var LINES = [['Twinkle, twinkle, little star,', 'Jane Taylor, 1806'], ['How I wonder what you are!', 'Jane Taylor, 1806'], ['Up above the world so high,', 'Jane Taylor, 1806'], ['Like a diamond in the sky.', 'Jane Taylor, 1806'],
    ['Mary had a little lamb,', 'Sarah Josepha Hale, 1830'], ['Its fleece was white as snow;', 'Sarah Josepha Hale, 1830'], ['Who has seen the wind?', 'Christina Rossetti, 1872'], ['Neither I nor you:', 'Christina Rossetti, 1872'],
    ['But when the leaves hang trembling,', 'Christina Rossetti, 1872'], ['The wind is passing through.', 'Christina Rossetti, 1872'], ['Whose woods these are I think I know.', 'Robert Frost, 1923'], ['His house is in the village though;', 'Robert Frost, 1923'],
    ['He will not see me stopping here', 'Robert Frost, 1923'], ['To watch his woods fill up with snow.', 'Robert Frost, 1923'], ['I have a little shadow that goes in and out with me,', 'Robert Louis Stevenson, 1885'], ['I shot an arrow into the air,', 'Henry Wadsworth Longfellow, 1845'],
    ['It fell to earth, I knew not where;', 'Henry Wadsworth Longfellow, 1845'], ['Four score and seven years ago', 'Abraham Lincoln, 1863']];
  function cue(line) { return line.replace(/[^A-Za-z ]/g, '').trim().split(/\s+/).map(function (w) { return w[0]; }).join(''); }
  function famFirstLetters(R, lv) {
    var L = R.pick(LINES), c = cue(L[0]);
    if (lv === 3 && R.coin()) {
      var oth = samp(R, LINES.filter(function (x) { return x !== L && cue(x[0]) !== c; }), 3);
      return mc('Which line does the first-letter cue <b>' + c + '</b> come from?', L[0], oth.map(function (x) { return x[0]; }), ['Check each word’s first letter: ' + L[0].replace(/[^A-Za-z ]/g, '').trim().split(/\s+/).map(function (w) { return w[0] + ' (' + w + ')'; }).join(', ') + '.']);
    }
    if (lv === 3) return text('Type the first-letter cue for this line (' + L[1] + '), keeping capitals: “' + L[0] + '”', [c, c.split('').join(' ')], ['Take the first letter of each word: ' + c.split('').join(' ') + '.'], { hint: 'One letter per word, in order.' });
    var others = samp(R, LINES.filter(function (x) { return x !== L && cue(x[0]) !== c; }), 3).map(function (x) { return cue(x[0]); });
    var wr = uniq([c.split('').reverse().join(''), c.slice(1), c + c.slice(-1)].concat(others)).filter(function (x) { return x !== c; });
    return mc('Which is the first-letter cue for “' + L[0] + '” (' + L[1] + ')?', c, samp(R, wr, lv === 1 ? 2 : 3), ['One letter per word, in order: ' + c + '.']);
  }
  function famCumulative(R, lv) {
    var n = R.int(lv === 1 ? 3 : 4, lv === 1 ? 5 : 12), k = R.int(2, n);
    if (lv >= 2 && R.coin()) return num('You learn a ' + n + '-line poem cumulatively (round 1: line 1; round 2: lines 1 and 2; and so on). How many lines have you said in all by the end of round ' + k + '?', k * (k + 1) / 2, ['1 + 2 + … + ' + k + ' = ' + (k * (k + 1) / 2) + '.']);
    if (R.coin()) return num('You learn a ' + n + '-line poem cumulatively: round 1 says line 1, round 2 says lines 1 and 2, and so on. How many lines do you say in all to reach the whole poem?', n * (n + 1) / 2, ['1 + 2 + … + ' + n + ' = ' + (n * (n + 1) / 2) + '.']);
    return mc('Learning a ' + n + '-line poem cumulatively, what do you recite in round ' + k + '?', 'Lines 1 to ' + k, ['Line ' + k + ' only', 'Lines ' + (k - 1) + ' and ' + k, 'The whole poem'].filter(function (x) { return x !== 'Lines 1 to ' + k; }).slice(0, lv === 1 ? 2 : 3), ['Each round starts from line 1 and adds one more line: lines 1 to ' + k + '.']);
  }
  function famSpeech(R, lv) {
    var pts = R.int(3, 12), oc = lv > 1 && R.coin();
    return num('A talk has ' + pts + ' key points. You put one point on each stop' + (oc ? ', plus one stop for the opening and one for the closing' : '') + '. How many stops?', pts + (oc ? 2 : 0), [pts + ' points' + (oc ? ' + 2 = ' + (pts + 2) : '') + ' stops.']);
  }
  function famPace(R, lv) {
    var c = R.pick([10, 12, 20, 26, 30, 52]), per = R.int(lv === 1 ? 3 : 2, lv === 1 ? 10 : 15), tot = c * per, nm = R.pick(NAMES);
    if (R.coin()) return num(nm + ' memorizes ' + c + ' cards in ' + tot + ' seconds. How many seconds per card is that?', per, [tot + ' ÷ ' + c + ' = ' + per + ' seconds per card.']);
    return num(nm + ' takes about ' + per + ' seconds per card. How many seconds for ' + c + ' cards?', tot, [c + ' × ' + per + ' = ' + tot + ' seconds.']);
  }
  function famPlanStep(R, lv) {
    var nm = R.pick(NAMES), c = R.pick([10, 20, 26, 52]), m = R.int(2, 6), e = R.int(3, 9);
    return mc(nm + ' memorizes ' + c + ' cards in ' + m + ' minutes but makes ' + e + ' errors. What should ' + nm + ' work on next?', 'The codes behind the errors, before going faster', samp(R, ['Going faster right away', 'Switching to a brand-new system', 'Practicing only once a month', 'Stopping review of the codes'], lv === 1 ? 2 : 3), ['Accuracy comes first; speed grows as the codes become automatic.']);
  }

  // ------------------------------------------------------------------ banks
  var B = {};
  B['peg-idea'] = { facts: [['A peg is a fixed picture for a number.', true], ['Pegs let you jump straight to item 7.', true], ['Pegs must be learned well before you use them.', true], ['Pegs suit short numbered lists.', true],
      ['You make up new pegs for every list.', false, 'Pegs stay fixed.'], ['A peg system needs a building you know.', false, 'That is a memory palace; pegs hang on numbers.'], ['Reusing the same pegs the same day never causes mix-ups.', false, 'Old images can linger.']],
    items: [{ q: 'What does a peg system hang items on?', r: 'Numbers, each with a fixed picture', w: ['Rooms in a house', 'First letters', 'A song'] }, { q: 'Why can pegs answer “What was item 7?” quickly?', r: 'You go straight to peg 7', w: ['You must walk past items 1 to 6', 'Pegs keep items in alphabetical order', 'They can’t'] }] };
  B['number-rhyme'] = { facts: [['In the rhyme pegs, 1 is bun.', true], ['In the rhyme pegs, 4 is door.', true], ['In the rhyme pegs, 10 is hen.', true], ['In the rhyme pegs, 3 is shoe.', false, '3 is tree; 2 is shoe.'], ['In the rhyme pegs, 8 is vine.', false, '8 is gate; 9 is vine.']], items: [] };
  B['number-shape'] = { facts: [['In the shape pegs, 2 is a swan.', true], ['In the shape pegs, 8 is a snowman.', true], ['In the shape pegs, 5 is a hook.', true], ['In the shape pegs, 1 is a ball.', false, '1 is a candle; 0 is a ball.'], ['In the shape pegs, 4 is a boomerang.', false, '4 is a sailboat; 7 is a boomerang.']], items: [] };
  B['peg-lists'] = { facts: [['Each peg holds one item.', true], ['With pegs you can recall a list backward.', true], ['Ten pegs hold ten items.', true], ['Two items on one peg keeps the order clear.', false, 'It muddles the order.'], ['Pegs only work forward.', false, 'You can jump to any peg.']], items: [] };
  B['major-sounds'] = { facts: [['In the Major System, 2 is n.', true], ['In the Major System, 7 is k or hard g.', true], ['Vowels count for nothing in the Major System.', true], ['w, h and y count for nothing.', true],
      ['In the Major System, 6 is p or b.', false, '6 is j, sh, ch, soft g; 9 is p or b.'], ['Every letter in a word is a digit.', false, 'Only consonant sounds count.'], ['In the Major System, 0 is t or d.', false, '0 is s or z; 1 is t or d.']], items: [] };
  B['major-rules'] = { facts: [['Silent letters count for nothing.', true], ['A double letter that makes one sound is one digit.', true], ['A soft c, as in city, counts as s (0).', true], ['x counts as two sounds, k and s.', true],
      ['The k in knife counts as 7.', false, 'It is silent.'], ['Hammer is 334.', false, 'mm is one sound: 34.'], ['ph counts as p (9).', false, 'ph sounds like f: 8.']], items: [] };
  B['digits-to-sounds'] = { facts: [['Each digit becomes one consonant sound, in order.', true], ['To make a word from sounds, add vowels.', true], ['6 and 7 are easy to mix up: soft sounds (j, sh) versus hard (k, g).', true], ['Digits can be turned into sounds in any order.', false, 'Keep the order.']], items: [] };
  B['decode-words'] = { facts: [['To decode a word, say it and keep only the consonant sounds.', true], ['Honey decodes to 2.', true], ['Rocket decodes to 471.', true], ['Honey decodes to 22.', false, 'h and y are free, and n is one sound: 2.']], items: [] };
  B['major-list'] = { facts: [['A fixed 00 to 99 list turns two digits into one picture.', true], ['Changing your list words often slows you down.', true], ['In the course list, 47 is rock.', true], ['In the course list, 14 is tire.', true], ['A 00 to 99 list has 10 words.', false, 'It has 100.']], items: [] };
  B['long-numbers'] = { facts: [['A long number is split into pairs, each turned into a picture.', true], ['Pictures are placed along a journey to keep their order.', true], ['A 20-digit number needs 10 pictures at two digits each.', true], ['A long number is best kept as one giant story with no places.', false, 'Use a journey.']], items: [] };
  B['dates'] = { facts: [['A four-digit year is two pictures from a 00 to 99 list.', true], ['The year’s picture should include the event.', true], ['A date picture without the event still tells you what happened.', false, 'Join the event to the picture.']], items: [] };
  B['card-codes'] = { facts: [['A deck has 52 cards: 4 suits of 13.', true], ['Each card needs a fixed image before you memorize decks.', true], ['Card codes are made up during the timed run.', false, 'They must be learned first.'], ['A deck needs 13 codes.', false, 'It needs 52.']],
    items: [{ q: 'How many codes does a full deck need?', r: '52', w: ['13', '4', '26'] }, { q: 'When should you learn your card codes?', r: 'Before trying to memorize a deck', w: ['During the timed run', 'After the competition', 'Never: make them up each time'] }] };
  B['pao'] = { facts: [['PAO stands for person, action, object.', true], ['In PAO, three cards make one picture.', true], ['The person comes from the first card of the three.', true], ['In PAO, all three parts come from the same card.', false, 'Each part comes from a different card.'], ['PAO pictures are chained in one long story.', false, 'Each sits on its own stop.']], items: [] };
  B['pao-capacity'] = { facts: [['With PAO, a deck needs 18 pictures.', true], ['With two cards per picture, a deck needs 26 pictures.', true], ['Always round up the number of pictures.', true], ['With PAO, a deck needs 17 pictures exactly, with no leftover.', false, '52 = 17 × 3 + 1, so 18.']], items: [] };
  B['journeys'] = { facts: [['A journey links several rooms or places into one long route.', true], ['Marking every fifth stop helps you keep count.', true], ['Walk a new journey until it is automatic before using it.', true], ['A journey should change direction each time you use it.', false, 'Use the same direction.']], items: [] };
  B['journey-order'] = { facts: [['A journey can be walked backward.', true], ['Each stop has a fixed number.', true], ['You can start recall from any stop.', true], ['Skipping stops in your head is fine.', false, 'Skipped stops lose items.']], items: [] };
  B['palace-capacity'] = { facts: [['Holds = stops × pictures per stop × items per picture.', true], ['It is wise to plan a few spare stops.', true], ['A 20-stop journey with 2 pictures per stop and 2 digits per picture holds 80 digits.', true], ['A 10-stop journey with 1 picture per stop holds 100 digits at 2 digits per picture.', false, 'It holds 20.']], items: [] };
  B['reuse-palaces'] = { facts: [['Leftover images from an earlier list are sometimes called ghosts.', true], ['Permanent lists should get their own routes.', true], ['Rotating several practice routes reduces mix-ups.', true], ['Using one route for every list on the same day causes no trouble.', false, 'Old images can linger.']], items: [] };
  B['link-method'] = { facts: [['The link method joins each item to the next with a picture.', true], ['If one link breaks, the items after it are lost.', true], ['The link method needs no places.', true], ['The link method is safest for very long lists.', false, 'A journey is safer.']], items: [] };
  B['story-method'] = { facts: [['The story method turns a list into one short story.', true], ['In a good memory story, each item causes the next.', true], ['After telling the story, list the items alone.', true], ['A longer story with extra details is always better.', false, 'Keep it short.']],
    items: [{ q: 'Story: “A frog climbs a ladder into a cloud, the cloud rains spoons, and the spoons ring a bell.” What is the third item?', r: 'cloud', w: ['ladder', 'spoon', 'bell', 'frog'] }, { q: 'Story: “A frog climbs a ladder into a cloud, the cloud rains spoons, and the spoons ring a bell.” What is the last item?', r: 'bell', w: ['spoon', 'cloud', 'frog', 'ladder'] }] };
  B['choose-system'] = { facts: [['Systems can be combined, like Major words on a journey.', true], ['Number pegs fit “what was seventh?” questions.', true], ['A journey fits a long ordered list.', true], ['One system fits every job best.', false, 'Match the system to the job.']], items: [] };
  B['first-letters'] = { facts: [['A first-letter cue keeps one letter per word.', true], ['First-letter cues turn reading into recall.', true], ['A first-letter cue should include every word in full.', false, 'Then it is just the text.']], items: [] };
  B['poem-by-line'] = { facts: [['Cumulative learning recites from the start each round.', true], ['The joins between lines get the most practice that way.', true], ['Learn each line alone and never join them.', false, 'The joins need practice.']], items: [] };
  B['speech-outline'] = { facts: [['For a speech, put key points on a journey.', true], ['Learning the opening and closing word for word gives a strong start and finish.', true], ['Memorizing a whole speech word for word is the only safe way.', false, 'One slipped word can freeze you.']], items: [] };
  B['competitions'] = { facts: [['Memory competitions include cards, numbers, words, and names and faces.', true], ['Nearly all top memory athletes use the method of loci.', true], ['Memory competitions have run since the 1990s.', true], ['Memory athletes’ brains are a different size from other people’s.', false, 'Dresler and others found no structural difference.'], ['Memory athletes use no methods; they were simply born with it.', false, 'They use trained strategies.']], items: [] };
  B['training-study'] = { facts: [['Dresler and colleagues published their study in 2017.', true], ['The method-of-loci group trained 30 minutes a day for 40 days.', true], ['The loci group went from about 26 to about 62 words out of 72.', true], ['Four months later, the loci group still recalled over 22 more words than at the start.', true],
      ['The study showed memory training raises general intelligence.', false, 'It measured word-list recall.'], ['The group with no training improved as much as the loci group.', false, 'They gained about 7 words; the loci group about 35.'], ['The training gains were gone after four months.', false, 'Much of the gain remained.']],
    items: [{ q: 'In Dresler and others (2017), how long did the training last?', r: '40 days, 30 minutes a day', w: ['One afternoon', 'Two years', '5 minutes a week'] }, { q: 'Before training, the loci group recalled about 26 words; after, about 62. About how many more?', r: 'About 36', w: ['About 16', 'About 62', 'About 88'] }, { q: 'What did the 2017 study measure?', r: 'How many words from a list people could recall', w: ['School grades', 'General intelligence', 'Reading speed'] }] };
  B['training-plan'] = { facts: [['Learn the codes before working on speed.', true], ['Short daily practice beats long, rare sessions.', true], ['Logging time and errors shows what to fix.', true], ['Time yourself before you have learned the codes.', false, 'Accuracy first.']], items: [] };

  // ------------------------------------------------------------------ register (literal ids)
  T('memsys.peg-idea', B['peg-idea'], [famPegList, famRhymePeg], 0.5);
  T('memsys.number-rhyme', B['number-rhyme'], [famRhymePeg], 0.85);
  T('memsys.number-shape', B['number-shape'], [famShapePeg], 0.85);
  T('memsys.peg-lists', B['peg-lists'], [famPegList], 0.85);
  T('memsys.major-sounds', B['major-sounds'], [famSoundDigit, famWordFor], 0.85);
  T('memsys.major-rules', B['major-rules'], [famRules, famDecode], 0.85);
  T('memsys.digits-to-sounds', B['digits-to-sounds'], [famDigitsToSounds, famSoundDigit], 0.85);
  T('memsys.decode-words', B['decode-words'], [famDecode, famDecode, famWordFor], 0.85);
  T('memsys.major-list', B['major-list'], [famWordFor, famDecode], 0.85);
  T('memsys.long-numbers', B['long-numbers'], [famLongNum], 0.85);
  T('memsys.dates', B['dates'], [famYear, famAnyYear], 0.9);
  T('memsys.card-codes', B['card-codes'], [famCapacity, famPAO], 0.6);
  T('memsys.pao', B['pao'], [famPAO], 0.85);
  T('memsys.pao-capacity', B['pao-capacity'], [famCapacity], 0.95);
  T('memsys.journeys', B['journeys'], [famJourney, famLandmark], 0.85);
  T('memsys.journey-order', B['journey-order'], [famJourney], 0.85);
  T('memsys.palace-capacity', B['palace-capacity'], [famCapacity, famLongNum], 0.85);
  T('memsys.reuse-palaces', B['reuse-palaces'], [famJourney, famSystem], 0.8);
  T('memsys.link-method', B['link-method'], [famLink], 0.8);
  T('memsys.story-method', B['story-method'], [famLink], 0.6);
  T('memsys.choose-system', B['choose-system'], [famSystem], 0.85);
  T('memsys.first-letters', B['first-letters'], [famFirstLetters], 0.85);
  T('memsys.poem-by-line', B['poem-by-line'], [famCumulative, famFirstLetters], 0.85);
  T('memsys.speech-outline', B['speech-outline'], [famSpeech, famSystem, famJourney], 0.85);
  T('memsys.competitions', B['competitions'], [famPace, famCapacity], 0.75);
  T('memsys.training-study', B['training-study'], [famPace], 0.3);
  T('memsys.training-plan', B['training-plan'], [famPlanStep, famPace], 0.8);

  ML.memsysData = { MAJ2: MAJ2, MAJ1: MAJ1, DEC: DEC, SND: SND, RHYME: RHYME, SHAPE: SHAPE, YEARS: YEARS, PAO: PAO, LINES: LINES, cue: cue, code: code };
})(typeof window !== 'undefined' ? window.MathLadder : undefined);
