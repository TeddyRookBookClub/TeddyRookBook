/* Machiavelli, The Prince (gbw1). Families: kinds of principality and chapters, his examples, key terms (virtù, fortuna),
   argument structure (premises and conclusion), the fortune half computed, critics' views, dates. */
/* shared helpers for the gbren rungs by gbw1 (each gen.js carries its own copy, since each is wrapped on its own). */
var LETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
/* a sequence family: seq = [label, ...] in order; what = "the acts of the play"; it = noun for one item */
function famSeq(seq, what, it) {
  return function (R, lv) {
    var r = R.next();
    if (r < 0.45) {
      var k = Math.min(seq.length, lv === 1 ? 3 : 4), idx = R.sample(seq.map(function (_, i) { return i; }), k).sort(function (a, b) { return a - b; });
      var right = idx.map(function (i) { return seq[i]; }).join(' → '), w = [];
      for (var t = 0; t < 10 && w.length < 3; t++) { var sh = R.shuffle(idx.slice()).map(function (i) { return seq[i]; }).join(' → '); if (sh !== right && w.indexOf(sh) < 0) w.push(sh); }
      return H.mc('Which list puts these in the right order (' + what + ')?', right, w, ['In order: ' + right + '.'], { hint: 'Find the first one, then work forward.' });
    }
    if (r < 0.75 || lv === 1) {
      var i = R.int(0, seq.length - 2), wr = R.sample(seq.filter(function (_, j) { return j !== i + 1 && j !== i; }), Math.min(seq.length - 2, lv === 1 ? 2 : 3));
      return H.mc('In ' + what + ', what comes right after <b>' + seq[i] + '</b>?', seq[i + 1], wr, [seq[i] + ' is followed by ' + seq[i + 1] + '.']);
    }
    var j = R.int(0, seq.length - 1), wb = R.sample(seq.filter(function (_, x) { return x !== j; }), Math.min(seq.length - 1, 3));
    return H.mc('In ' + what + ', which ' + it + ' comes <b>' + (j === 0 ? 'first' : 'number ' + (j + 1)) + '</b>?', seq[j], wb, ['The order is: ' + seq.map(function (x, n) { return (n + 1) + '. ' + x; }).join('; ') + '.'], { hint: 'Count from the start.' });
  };
}
/* a matching family: pairs = [[a, b], ...]; qa(a) asks for b; qb(b) asks for a (optional) */
function famPairs(pairs, qa, qb) {
  return function (R, lv) {
    var p = R.pick(pairs), k = lv === 1 ? 2 : 3;
    if (qb && R.coin()) {
      var wa = H.uniq(pairs.filter(function (x) { return x[1] !== p[1] && x[0] !== p[0]; }).map(function (x) { return x[0]; }));
      return H.mc(qb(p[1]), p[0], R.sample(wa, Math.min(k, wa.length)), [p[0] + ': ' + p[1] + '.']);
    }
    var wb = H.uniq(pairs.filter(function (x) { return x[1] !== p[1] && x[0] !== p[0]; }).map(function (x) { return x[1]; }));
    return H.mc(qa(p[0]), p[1], R.sample(wb, Math.min(k, wb.length)), [p[0] + ': ' + p[1] + '.']);
  };
}
/* iambic pentameter and its cousins, computed */
function famFeet(R, lv) {
  var r = R.next();
  if (r < 0.35) {
    var F = [['trimeter', 3], ['tetrameter', 4], ['pentameter', 5], ['hexameter', 6]], f = R.pick(lv === 1 ? F.slice(1, 3) : F);
    return H.num('A line of iambic <b>' + f[0] + '</b> has ' + f[1] + ' iambs (da-DUM). How many syllables is that, if it has no extra ending syllable?', 2 * f[1], ['Each iamb has 2 syllables: $' + f[1] + ' \\times 2 = ' + (2 * f[1]) + '$.']);
  }
  if (r < 0.65) {
    var n = R.int(lv === 1 ? 4 : 8, lv === 1 ? 10 : 30);
    return H.num('A speech has ' + n + ' lines of regular iambic pentameter (10 syllables each). How many <b>stressed</b> syllables does it have?', 5 * n, ['Each line has 5 stresses: $' + n + ' \\times 5 = ' + (5 * n) + '$.']);
  }
  var L = [['To be, or not to be, that is the question:', 11, 'an extra unstressed syllable at the end ("ques-<b>tion</b>" ends soft)'], ['Is this a dagger which I see before me,', 11, 'an extra soft syllable at the end ("be-FORE me")'], ['But soft! What light through yonder window breaks?', 10, 'a regular line'], ['Shall I compare thee to a summer’s day?', 10, 'a regular line'], ['The course of true love never did run smooth.', 10, 'a regular line'], ['Fair is foul, and foul is fair:', 7, 'a short line in a different beat (DUM-da), used for the witches']];
  var l = R.pick(L);
  return H.num('Count the syllables: <i>' + l[0] + '</i>', l[1], ['It has ' + l[1] + ' syllables: ' + l[2] + '.'], { hint: 'Tap out each syllable on the table.' });
}
/* the Shakespearean sonnet: ABAB CDCD EFEF GG */
var SON = 'ABABCDCDEFEFGG';
function famSonnet(R, lv) {
  var r = R.next();
  if (r < 0.4) {
    var k = R.int(1, 14), right = SON[k - 1], w = H.uniq([LETS[LETS.indexOf(right) + 1], LETS[Math.max(0, LETS.indexOf(right) - 1)], SON[(k + 1) % 14], 'H']).filter(function (x) { return x !== right; });
    return H.mc('A Shakespearean sonnet rhymes ABAB CDCD EFEF GG. Which rhyme letter does <b>line ' + k + '</b> have?', right, R.sample(w, Math.min(w.length, lv === 1 ? 2 : 3)), ['Lines 1–4: ABAB; 5–8: CDCD; 9–12: EFEF; 13–14: GG. Line ' + k + ' is ' + right + '.'], { hint: 'Which group of four (or the last two) is the line in?' });
  }
  if (r < 0.7) {
    var a = R.int(1, 12), q = Math.floor((a - 1) / 4) + 1, b = a + 2 <= q * 4 ? a + 2 : a - 2;
    return H.num('In a Shakespearean sonnet, line ' + a + ' rhymes with which other line?', b, ['In each quatrain, line 1 rhymes with line 3 and line 2 with line 4. Line ' + a + ' is in quatrain ' + q + ', so it rhymes with line ' + b + '.']);
  }
  var n = R.int(2, lv === 1 ? 4 : 12);
  return H.num('How many lines are there in ' + n + ' sonnets?', 14 * n, ['$' + n + ' \\times 14 = ' + (14 * n) + '$.']);
}
/* who says it: verified lines (Project Gutenberg texts), with speaker and play */
var SAID = [
  ['Fair is foul, and foul is fair', 'the three witches', 'Macbeth'], ['Is this a dagger which I see before me', 'Macbeth', 'Macbeth'], ['Vaulting ambition, which o’erleaps itself', 'Macbeth', 'Macbeth'],
  ['To be, or not to be, that is the question', 'Hamlet', 'Hamlet'], ['This above all: to thine own self be true', 'Polonius', 'Hamlet'], ['The time is out of joint', 'Hamlet', 'Hamlet'],
  ['O, beware, my lord, of jealousy', 'Iago', 'Othello'], ['Who steals my purse steals trash', 'Iago', 'Othello'],
  ['Nothing will come of nothing: speak again', 'King Lear', 'King Lear'], ['What shall Cordelia speak? Love, and be silent', 'Cordelia', 'King Lear'], ['How sharper than a serpent’s tooth it is / To have a thankless child!', 'King Lear', 'King Lear'],
  ['What’s in a name? That which we call a rose / By any other name would smell as sweet', 'Juliet', 'Romeo and Juliet'], ['But soft! What light through yonder window breaks?', 'Romeo', 'Romeo and Juliet'], ['Wisely, and slow. They stumble that run fast', 'Friar Laurence', 'Romeo and Juliet'],
  ['The fault, dear Brutus, is not in our stars, / But in ourselves', 'Cassius', 'Julius Caesar'], ['Friends, Romans, countrymen, lend me your ears', 'Mark Antony', 'Julius Caesar'], ['Not that I loved Caesar less, but that I loved Rome more', 'Brutus', 'Julius Caesar'],
  ['We are such stuff / As dreams are made on', 'Prospero', 'The Tempest'], ['O brave new world / That has such people in ’t!', 'Miranda', 'The Tempest'],
  ['Lord, what fools these mortals be!', 'Puck', 'A Midsummer Night’s Dream'], ['The course of true love never did run smooth', 'Lysander', 'A Midsummer Night’s Dream'],
  ['All the world’s a stage, / And all the men and women merely players', 'Jaques', 'As You Like It'],
  ['Once more unto the breach, dear friends, once more', 'King Henry', 'Henry V'], ['This royal throne of kings, this sceptered isle', 'John of Gaunt', 'Richard II']
];
function famSaid(plays) {
  var pool = plays ? SAID.filter(function (s) { return plays.indexOf(s[2]) >= 0; }) : SAID;
  return function (R, lv) {
    var s = R.pick(pool);
    if (R.next() < 0.55) {
      var near = H.uniq(pool.filter(function (x) { return x[1] !== s[1]; }).map(function (x) { return x[1]; })), w = near.length >= 2 && R.coin() ? near : H.uniq(SAID.filter(function (x) { return x[1] !== s[1]; }).map(function (x) { return x[1]; }));
      return H.mc('Who says this? <i>"' + s[0] + '"</i>', s[1], R.sample(w, Math.min(w.length, lv === 1 ? 2 : 3)), ['In ' + s[2] + ', ' + s[1] + ' says it.']);
    }
    var wp = H.uniq(SAID.filter(function (x) { return x[2] !== s[2]; }).map(function (x) { return x[2]; }));
    return H.mc('Which play is this line from? <i>"' + s[0] + '"</i>', s[2], R.sample(wp, Math.min(wp.length, lv === 1 ? 2 : 3)), ['It is from ' + s[2] + ' (' + s[1] + ').']);
  };
}
var ID = 'gbren.machiavelli-the-prince';
var KIND = [['hereditary principalities', 'easy to keep, if the prince does not upset old customs'], ['new principalities won by one\'s own arms and ability', 'hard to win but easier to keep'], ['new principalities won by others\' arms or by fortune', 'easy to win but hard to keep'], ['principalities won by wickedness', 'power may be won this way, but not glory'], ['civil principalities', 'raised up by fellow citizens; keep the people\'s friendship'], ['ecclesiastical principalities', 'held up by ancient religious customs']];
var EX = [['Cesare Borgia', 'rose by his father\'s help and fortune, and lost everything when fortune turned (Chapter VII)'], ['Agathocles of Syracuse', 'rose to power by crimes (Chapter VIII)'], ['Moses, Cyrus, Romulus and Theseus', 'founders who rose by their own ability (Chapter VI)'], ['Lorenzo de\' Medici', 'the ruler of Florence to whom the book is dedicated'], ['Italy in the last chapter', 'which Machiavelli begs a new prince to free from foreign armies']];
var TERMS = [['virtù', 'a ruler\'s skill, energy and boldness (not quite our word "virtue")'], ['fortuna', 'luck or chance, which he pictures as a flooding river'], ['mercenaries', 'hired soldiers, whom he calls useless and dangerous'], ['"Machiavellian"', 'a later word for cunning, scheming politics'], ['the fox and the lion', 'his picture of cunning (to spot traps) and strength (to scare enemies)']];
function famArg(R, lv) {
  var A = [
    ['Men are fickle and look after themselves. Love is a bond people break when it suits them; fear of punishment never fails.', 'So it is safer for a prince to be feared than loved, if he cannot be both.', 'Chapter XVII'],
    ['Mercenaries fight only for pay. They are not loyal and will not risk their lives for you.', 'So a prince should rely on his own soldiers.', 'Chapter XII'],
    ['Fortune controls about half of what happens. Like a river, she does most damage where no defenses were built.', 'So a prince should prepare in calm times.', 'Chapter XXV']
  ], a = R.pick(A);
  if (R.coin()) return H.mc('Machiavelli argues: "' + a[0] + ' ' + a[1] + '" Which sentence is the <b>conclusion</b>?', a[1], [a[0].split('. ')[0] + '.', 'A prince should read history.', 'Italy has many small states.'].slice(0, lv === 1 ? 2 : 3), ['The conclusion is what the reasons are meant to prove (' + a[2] + '). It often starts with "so."'], { hint: 'Look for the "so."' });
  return H.mc('In ' + a[2] + ', what reason does Machiavelli give for this conclusion? <i>' + a[1] + '</i>', a[0], A.filter(function (x) { return x !== a; }).map(function (x) { return x[0]; }).concat(['Because God commands it.']).slice(0, lv === 1 ? 2 : 3), ['The premise: ' + a[0]]);
}
function famHalf(R, lv) {
  var n = 2 * R.int(lv === 1 ? 3 : 6, lv === 1 ? 10 : 40);
  return H.num('Machiavelli says fortune decides about one-half of our actions and leaves the other half to us. Out of ' + n + ' events, about how many does he say we can direct?', n / 2, ['One-half of ' + n + ' is ' + (n / 2) + '. (He adds "or perhaps a little less.")']);
}
function famCritic(R, lv) {
  var C = [['Some readers, from Machiavelli\'s day on, said the book teaches wickedness.', 'Its advice to break promises and use cruelty when "necessary" shocked readers; the Church placed it on its list of banned books in 1559.'], ['Some readers think the book is a warning in disguise, showing people how tyrants work.', 'The philosopher Rousseau later suggested this; others disagree.'], ['Many readers see it as the start of modern, realistic political science.', 'He looks at how rulers actually behave, not how they should.']];
  var c = R.pick(C);
  return H.tf(c[0], true, c[1]);
}
var B = {
  facts: [
    ['Machiavelli wrote The Prince after he lost his job in the government of Florence.', true, 'In 1512, when the Medici family returned to power.'],
    ['The Prince was printed in 1532, after Machiavelli\'s death.', true, 'It circulated in handwritten copies before that.'],
    ['Machiavelli says a prince should be feared rather than loved, whatever the cost.', false, 'He says it is best to be both, safer to be feared if you must choose, and that a prince must above all avoid being hated.'],
    ['Machiavelli dedicated The Prince to Lorenzo de\' Medici.', true, 'Hoping for a new post.'],
    ['Machiavelli says hired armies (mercenaries) are the best defense.', false, 'He says they are useless and dangerous.'],
    ['Machiavelli compares fortune to a river that floods.', true, 'Chapter XXV.'],
    ['The book\'s last chapter calls for a leader to free Italy from foreign armies.', true, 'Chapter XXVI.'],
    ['Machiavelli also wrote a longer book about republics, the Discourses on Livy.', true, 'Many readers think it shows his preference for free republics.'],
    ['W. K. Marriott\'s English translation of The Prince was published in 1908.', true, 'The translation quoted in this lesson.'],
    ['Machiavelli says a prince should seem merciful, faithful and religious.', true, 'Chapter XVIII: appearances matter to him.']
  ],
  items: [
    { q: 'What does Machiavelli mean by virtù?', r: 'A ruler\'s skill, energy and boldness', w: ['Goodness and holiness', 'Wealth', 'Good luck'], why: 'Not quite our word "virtue."' },
    { q: 'Why does Machiavelli say a prince should be "a fox and a lion"?', r: 'The fox spots traps and the lion frightens wolves; a ruler needs cunning and strength', w: ['Because both animals were on Florence\'s flag', 'Because foxes and lions are loyal', 'To show that rulers should hunt'], why: 'Chapter XVIII.' },
    { q: 'What does Machiavelli say a prince must avoid above all?', r: 'Being hated by his people', w: ['Being feared', 'Reading history', 'Fighting wars'], why: 'Fear without hatred, he says, is safe; hatred is dangerous.' },
    { q: 'What is new about how Machiavelli writes about politics?', r: 'He describes how rulers actually act, not how they ought to act', w: ['He wrote in Latin', 'He used poetry', 'He wrote only about kings of England'], why: 'Chapter XV.' },
    { q: 'Which city did Machiavelli serve as a diplomat and official?', r: 'Florence', w: ['Venice', 'Rome', 'Milan'], why: 'From 1498 to 1512.' },
    { q: 'What does the word "Machiavellian" mean today?', r: 'Cunning and scheming in pursuit of power', w: ['Generous and kind', 'Lazy', 'Musical'], why: 'A later reputation, more extreme than the book itself.' },
    { q: 'Which ruler does Machiavelli use as his main example of a prince raised by fortune?', r: 'Cesare Borgia', w: ['Julius Caesar', 'Charlemagne', 'Henry V'], why: 'Chapter VII.' }
  ]
};
H.T(ID, B, [famPairs(KIND, function (a) { return 'What does Machiavelli say about <b>' + a + '</b>?'; }, function (b) { return 'Which kind of principality does Machiavelli describe this way: <i>' + b + '</i>?'; }), famPairs(EX, function (a) { return 'Why does Machiavelli mention <b>' + a + '</b>?'; }), famPairs(TERMS, function (a) { return 'In The Prince, what is <b>' + a + '</b>?'; }, function (b) { return 'Which term matches: <i>' + b + '</i>?'; }), famArg, famArg, famHalf, famCritic].concat(dateFams(ID)), 0.6);
