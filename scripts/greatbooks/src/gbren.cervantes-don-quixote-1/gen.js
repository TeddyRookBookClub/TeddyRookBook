/* Cervantes, Don Quixote, Part One (gbw1). Families: who is who, adventures in order, what he sees vs what is there,
   terms, who says it (from our summaries and the Ormsby translation), dates. */
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
var ID = 'gbren.cervantes-don-quixote-1';
var WHO = [['Don Quixote', 'a country gentleman, Alonso Quixano, who reads so many tales of chivalry that he decides to become a knight'], ['Sancho Panza', 'a farmer who becomes his squire, hoping to govern an island'], ['Dulcinea del Toboso', 'the lady Don Quixote chooses to serve: in fact a farm girl he has hardly seen'], ['Rocinante', 'Don Quixote\'s thin old horse'], ['the priest and the barber', 'his village friends, who try to bring him home'], ['Cide Hamete Benengeli', 'the invented Arab historian who is supposed to have written the story']];
var SEE = [['windmills', 'giants with long arms'], ['two flocks of sheep', 'two great armies'], ['a barber\'s brass basin', 'the golden helmet of Mambrino'], ['a country inn', 'a castle'], ['the innkeeper', 'the lord of the castle']];
var ADV = ['He reads too many books of chivalry', 'He is "knighted" at an inn', 'Sancho joins him as squire', 'The windmills', 'The flocks of sheep', 'Friends bring him home in a cage'];
function famSee(R, lv) {
  var s = R.pick(SEE);
  if (R.coin()) return H.mc('Don Quixote sees <b>' + s[1] + '</b>. What is really there?', s[0], SEE.filter(function (x) { return x !== s; }).map(function (x) { return x[0]; }).slice(0, lv === 1 ? 2 : 3), ['Sancho sees ' + s[0] + '; Don Quixote sees ' + s[1] + '.']);
  return H.mc('What does Don Quixote think the <b>' + s[0] + '</b> are?', s[1], SEE.filter(function (x) { return x !== s; }).map(function (x) { return x[1]; }).slice(0, lv === 1 ? 2 : 3), ['Sancho sees ' + s[0] + '; Don Quixote sees ' + s[1] + '.']);
}
function famWords(R, lv) {
  var W = [['quixotic', 'chasing a noble but impractical dream'], ['tilting at windmills', 'fighting imaginary enemies'], ['squire', 'a knight\'s helper and companion'], ['romance of chivalry', 'a story of knights, ladies, giants and enchanters']];
  return famPairs(W, function (a) { return 'What does <b>' + a + '</b> mean?'; }, function (b) { return 'Which word or phrase means <i>' + b + '</i>?'; })(R, lv);
}
var B = {
  facts: [
    ['Don Quixote goes mad from reading too many books of chivalry.', true, 'His wits dry up, Cervantes says.'],
    ['Don Quixote\'s real name is Alonso Quixano (or Quixada).', true, 'The narrator is never quite sure.'],
    ['Sancho Panza is a knight.', false, 'He is a farmer who becomes Don Quixote\'s squire.'],
    ['Don Quixote attacks windmills, thinking they are giants.', true, 'Part One, Chapter VIII.'],
    ['Dulcinea is a princess Don Quixote knows well.', false, 'She is a farm girl he has barely seen, renamed in his imagination.'],
    ['Part One was published in 1605.', true, 'In Madrid.'],
    ['Cervantes lost the use of his left hand in the sea battle of Lepanto.', true, 'In 1571; he was proud of it all his life.'],
    ['Cervantes was held captive in Algiers for five years.', true, 'From 1575 to 1580.'],
    ['The priest and the barber burn some of Don Quixote\'s books.', true, 'Chapter VI, a comic trial of his library.'],
    ['John Ormsby\'s English translation was published in 1885.', true, 'The translation quoted in this lesson.']
  ],
  items: [
    { q: 'Why does Don Quixote become a knight-errant?', r: 'He has read so many tales of chivalry that he believes them and wants to live them', w: ['The king orders him', 'He wants to become rich', 'He is running from the law'], why: 'Chapter I.' },
    { q: 'What does Sancho Panza hope to get from his adventures?', r: 'An island to govern', w: ['A castle in Spain', 'A wife', 'A new horse'], why: 'Don Quixote promises him one.' },
    { q: 'What does Don Quixote say when he loses the fight with the windmills?', r: 'That an enchanter turned the giants into windmills', w: ['That Sancho was right', 'That he will never fight again', 'That windmills are dangerous'], why: 'He always finds a reason within his story.' },
    { q: 'What makes Don Quixote and Sancho a good pair?', r: 'One is a dreamer and one is practical, and each changes the other', w: ['They are brothers', 'They agree about everything', 'They are both knights'], why: 'Their conversations are the heart of the book.' },
    { q: 'What is Part One partly a parody of?', r: 'The popular romances of chivalry of Cervantes\'s day', w: ['Shakespeare\'s plays', 'Greek tragedy', 'Newspapers'], why: 'Amadis of Gaul and the rest.' },
    { q: 'Who is Rocinante?', r: 'Don Quixote\'s thin old horse', w: ['His squire', 'His lady', 'An enchanter'], why: 'The name plays on rocín, a nag.' }
  ]
};
H.T(ID, B, [famPairs(WHO, function (a) { return 'Who is <b>' + a + '</b>?'; }, function (b) { return 'Who is this: <i>' + b + '</i>?'; }), famSee, famSee, famSeq(ADV, 'Part One', 'adventure'), famWords].concat(dateFams(ID)), 0.6);
