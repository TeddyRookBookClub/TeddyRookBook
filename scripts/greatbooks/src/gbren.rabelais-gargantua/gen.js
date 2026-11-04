/* Rabelais, Gargantua and Pantagruel (gbw1). Families: characters, Thélème, the books in order, terms, dates. Nothing coarse. */
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
var ID = 'gbren.rabelais-gargantua';
var WHO = [['Gargantua', 'a good-hearted giant prince, son of Grandgousier'], ['Pantagruel', 'Gargantua\'s giant son, wise and kind'], ['Panurge', 'Pantagruel\'s clever, cowardly, talkative friend'], ['Friar John', 'a bold, cheerful monk who fights for Gargantua and is given the Abbey of Thélème'], ['Grandgousier', 'Gargantua\'s peace-loving father'], ['Picrochole', 'a hot-headed king who starts a silly war over cakes']];
var TOW = ['Arctic', 'Calaer', 'Anatole', 'Mesembrine', 'Hesperia', 'Criere'];
function famTheleme(R, lv) {
  var r = R.next();
  if (r < 0.3) return H.num('The Abbey of Thélème has a round tower at each corner of its six sides. How many towers is that?', 6, ['Six sides, six corners, six towers: ' + TOW.join(', ') + '.']);
  if (r < 0.6) return H.mc('What is the only rule of the Abbey of Thélème?', 'Do what thou wilt', ['Rise at the bell', 'Never speak at meals', 'Obey the abbot in all things'].slice(0, lv === 1 ? 2 : 3), ['"Do What Thou Wilt," because free, well-taught people in good company are naturally drawn to do good, Rabelais says.']);
  if (r < 0.8) return H.mc('Which tower of Thélème is named for the <b>east</b>, where the sun rises?', 'Anatole', ['Hesperia', 'Arctic', 'Mesembrine'].slice(0, lv === 1 ? 2 : 3), ['Anatole: east. Hesperia: west. Arctic: north. Mesembrine: south (the noonday side).']);
  return H.mc('Why does Gargantua say Thélème should have no wall around it?', 'Walls, he jokes, are where grumbling and plotting grow', ['There was no stone nearby', 'The giants would step over it', 'The king forbade walls'], ['It is the opposite of a strict, walled monastery.']);
}
var B = {
  facts: [
    ['Rabelais was a monk, a doctor and a writer.', true, 'He studied medicine and practiced in Lyon.'],
    ['Gargantua and Pantagruel are giants.', true, 'Comic giants, though their size changes when the story needs it.'],
    ['The Abbey of Thélème has strict rules for every hour of the day.', false, 'It has one rule: do what thou wilt. It has no clocks.'],
    ['Pantagruel was published before Gargantua, though Gargantua is about the father.', true, 'Pantagruel came out in 1532, Gargantua in 1534.'],
    ['Rabelais wrote in Latin.', false, 'He wrote in French, full of new and invented words.'],
    ['The war in Gargantua begins in a quarrel over cakes.', true, 'Shepherds and cake-bakers argue, and King Picrochole goes to war.'],
    ['Gargantua\'s letter to his son Pantagruel praises learning and good character.', true, 'It is one of the most famous passages on education of the Renaissance.'],
    ['Thomas Urquhart translated the first books into English in the 1650s.', true, 'Peter Motteux finished the work in the 1690s.'],
    ['Some authorities in Paris condemned Rabelais\'s books.', true, 'The theologians of the Sorbonne disapproved of them.'],
    ['Panurge is brave and quiet.', false, 'He is clever, talkative and a coward.']
  ],
  items: [
    { q: 'What makes Rabelais\'s humor famous?', r: 'It mixes great learning with wild exaggeration and nonsense', w: ['It is always quiet and gentle', 'It has no jokes at all', 'It is all in rhyme'], why: 'Learning and laughter together.' },
    { q: 'What is the Abbey of Thélème?', r: 'An imaginary abbey, the opposite of a strict monastery, given to Friar John', w: ['A real church in Paris', 'Gargantua\'s school', 'A castle where the war ends'], why: 'Gargantua, chapters LII to LVII.' },
    { q: 'What does Rabelais say laughter is, in his verse to the reader?', r: 'Proper to man: something that makes us human', w: ['A sin', 'Something only for children', 'Bad for the health'], why: '"Because to laugh is proper to the man."' },
    { q: 'What does Gargantua\'s letter to Pantagruel urge him to do?', r: 'Study languages, history, science and Scripture, and live a good life', w: ['Give up books', 'Become a soldier at once', 'Travel to the moon'], why: 'He also warns that "science without conscience" ruins the soul.' },
    { q: 'How does Grandgousier first respond to Picrochole\'s attack?', r: 'He tries to make peace and even pays for the cakes', w: ['He invades at once', 'He runs away', 'He asks the Pope to fight'], why: 'Rabelais mocks wars of conquest.' },
    { q: 'Who is Friar John?', r: 'A bold, cheerful monk who defends his abbey\'s vineyard and fights for Gargantua', w: ['Pantagruel\'s teacher', 'A villain', 'The King of France'], why: 'He becomes the head of Thélème.' }
  ]
};
H.T(ID, B, [famPairs(WHO, function (a) { return 'Who is <b>' + a + '</b>?'; }, function (b) { return 'Which character is <i>' + b + '</i>?'; }), famTheleme, famTheleme, famSeq(['Pantagruel (1532)', 'Gargantua (1534)', 'The Third Book (1546)', 'The Fourth Book (1552)', 'The Fifth Book (1564, after Rabelais\'s death)'], 'the five books of Gargantua and Pantagruel, by date', 'book')].concat(dateFams(ID)), 0.55);
