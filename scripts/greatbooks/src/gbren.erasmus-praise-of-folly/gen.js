/* Erasmus, The Praise of Folly (gbw1). Families: who Folly teases, irony (who is speaking, and do we believe her),
   the book's story and dates, its terms, plus the ladder-wide date families. */
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
var ID = 'gbren.erasmus-praise-of-folly';
var TEASE = [['schoolmasters', 'ruling a classroom like little kings and fussing over grammar'], ['poets and authors', 'living for praise and rewriting their books for years'], ['philosophers', 'claiming to measure the stars while missing what is in front of them'], ['theologians', 'arguing endless puzzling questions instead of living the Gospel simply'], ['some monks', 'caring more about rules of dress and diet than about kindness'], ['kings and courtiers', 'thinking only of pleasure and flattery'], ['popes and bishops', 'living like princes instead of like the poor apostles']];
var TERMS = [['satire', 'writing that mocks people\'s faults to show them up'], ['irony', 'saying one thing while meaning something different, often the opposite'], ['mock encomium', 'a speech of praise for something unworthy, as a joke'], ['humanist', 'a Renaissance scholar who studied Greek and Latin classics to renew learning and life'], ['Moriae Encomium', 'the book\'s Latin title, which also puns on Thomas More\'s name']];
function famIrony(R, lv) {
  var r = R.next();
  if (r < 0.5) return H.mc('In The Praise of Folly, who gives the speech?', 'Folly herself, praising herself', ['Erasmus, in his own voice', 'Thomas More', 'A wise old monk'].slice(0, lv === 1 ? 2 : 3), ['The whole book is a speech by Folly. That is the joke: a fool praising foolishness.']);
  return H.mc('Folly says the world could not get along without a little foolishness. Why should a careful reader not simply believe or reject everything she says?', 'Because the speaker is Folly: some of her points are silly, and some are wise truths in disguise', ['Because Erasmus wrote it in Greek', 'Because every sentence means the exact opposite', 'Because the book is unfinished'], ['Irony works on two levels: sometimes the fool is foolish, and sometimes she says what wise people dare not.'], { hint: 'Think about who is talking.' });
}
var B = {
  facts: [
    ['Erasmus wrote The Praise of Folly while staying with his friend Thomas More in England.', true, 'He wrote it in 1509 and dedicated it to More; it was first printed in 1511.'],
    ['The book is a speech given by Folly, a goddess-like figure who praises herself.', true, 'A mock speech of praise.'],
    ['Erasmus wrote The Praise of Folly in English.', false, 'He wrote it in Latin, the shared language of European scholars.'],
    ['The Latin title, Moriae Encomium, makes a pun on More\'s name.', true, '"Moria" is Greek for folly.'],
    ['Erasmus also prepared a famous printed edition of the Greek New Testament.', true, 'First published in 1516.'],
    ['Erasmus left the Catholic Church to lead the Protestant Reformation.', false, 'He criticized abuses but remained a Catholic all his life, and disagreed with Luther in print.'],
    ['Folly says that friendship and marriage need a little foolishness to work.', true, 'People overlook one another\'s faults.'],
    ['Near the end, Folly praises the "folly" of Christian faith, which the world thinks foolish.', true, 'Echoing St. Paul.'],
    ['The book was a failure and was quickly forgotten.', false, 'It was a best seller, printed again and again in Erasmus\'s lifetime.'],
    ['John Wilson\'s English translation appeared in 1668.', true, 'The translation quoted in this lesson.']
  ],
  items: [
    { q: 'What kind of writing is The Praise of Folly?', r: 'A satire: a playful speech that mocks human foolishness', w: ['A history of the Netherlands', 'A book of Bible commentary', 'A play in five acts'], why: 'A mock speech of praise.' },
    { q: 'Where was Erasmus born?', r: 'Rotterdam, in the Netherlands', w: ['Florence, in Italy', 'Paris, in France', 'London, in England'], why: 'He is often called Erasmus of Rotterdam.' },
    { q: 'Why does Folly say no one could live together pleasantly without her?', r: 'People get along by overlooking each other\'s faults and flattering a little', w: ['Everyone is wise already', 'Laws keep people apart', 'Folly owns all the houses'], why: 'Her point is half joke, half truth.' },
    { q: 'Which friend of Erasmus later wrote Utopia?', r: 'Thomas More', w: ['Martin Luther', 'Niccolò Machiavelli', 'John Calvin'], why: 'More\'s Utopia appeared in 1516.' },
    { q: 'What is a humanist, in Erasmus\'s time?', r: 'A scholar who studied the Greek and Latin classics to renew learning', w: ['A doctor who studied the human body', 'Someone who rejected all religion', 'A painter of portraits'], why: 'Erasmus was the best-known humanist in Europe.' },
    { q: 'Which language did Erasmus write in?', r: 'Latin', w: ['Dutch', 'Italian', 'German'], why: 'Latin let him reach readers all over Europe.' },
    { q: 'What happens to the tone near the end of the speech?', r: 'It turns serious, praising the "foolishness" of simple faith', w: ['Folly admits she was lying about everything', 'It becomes a list of recipes', 'It turns into a love poem'], why: 'The joke deepens into a religious point.' }
  ]
};
H.T(ID, B, [famPairs(TEASE, function (a) { return 'Folly teases <b>' + a + '</b> for what?'; }, function (b) { return 'Whom does Folly tease for <b>' + b + '</b>?'; }), famPairs(TERMS, function (a) { return 'What does <b>' + a + '</b> mean?'; }, function (b) { return 'Which word means <b>' + b + '</b>?'; }), famIrony, famSeq(['Erasmus born in Rotterdam (c. 1466)', 'Folly written in More\'s house (1509)', 'First printed (1511)', 'Erasmus\'s Greek New Testament (1516)', 'Luther\'s 95 Theses (1517)', 'Erasmus dies in Basel (1536)'], 'Erasmus\'s life and times', 'event')].concat(dateFams(ID)), 0.6);
