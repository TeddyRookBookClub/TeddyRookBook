/* Cervantes, Don Quixote, Part Two (gbw1). Families: the story within the story (narrative layers), events in order,
   Sancho's governorship, who is who, the false sequel, the ending, dates. */
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
var ID = 'gbren.cervantes-don-quixote-2';
var LAY = ['You, the reader', 'Cervantes, the narrator', 'The translator', 'Cide Hamete Benengeli', 'Don Quixote and Sancho'];
var WHO = [['Sansón Carrasco', 'a student who has read Part One and later fights Don Quixote to bring him home'], ['the Duke and Duchess', 'readers of Part One who play elaborate tricks on the pair'], ['the Knight of the White Moon', 'Sansón Carrasco in disguise, who defeats Don Quixote in Barcelona'], ['Avellaneda', 'the pen name of the author of a false Part Two (1614)'], ['Sancho Panza', 'governor, for ten days, of the "island" of Barataria'], ['Alonso Quixano the Good', 'the name Don Quixote takes back on his deathbed']];
var EVT = ['They learn Part One has been published', 'They meet the Duke and Duchess', 'Sancho governs Barataria', 'They hear of the false sequel', 'Defeat on the beach at Barcelona', 'Home, and Alonso Quixano\'s last days'];
function famLayers(R, lv) {
  var r = R.next();
  if (r < 0.5) { var i = R.int(1, 4); return H.mc('In the "boxes inside boxes" of Don Quixote, who tells the story <b>directly to</b> ' + LAY[i - 1].replace('You, the reader', 'you, the reader') + '?', LAY[i], LAY.filter(function (_, j) { return j !== i && j !== i - 1; }).slice(0, lv === 1 ? 2 : 3), ['Outside in: ' + LAY.join(' → ') + '.']); }
  return H.num('Count the layers from you, the reader, to Don Quixote himself: reader, narrator, translator, Cide Hamete, the knight. How many is that?', 5, ['Five, if you count the reader and the knight.']);
}
function famIsland(R, lv) {
  var J = [['Two men argue over a loan; one hides the money in his walking stick and swears he has returned it.', 'Sancho breaks the stick and finds the money.'], ['Sancho must decide a puzzling case about a bridge and an oath.', 'He chooses mercy over the letter of the law.']];
  var j = R.pick(J);
  return H.mc('As governor of Barataria, Sancho faces this: <i>' + j[0] + '</i> How does he do?', 'He judges wisely and fairly, surprising everyone', ['He runs away', 'He asks Don Quixote to decide', 'He has everyone arrested'], [j[1] + ' The joke is on the tricksters: the simple farmer governs well.']);
}
var B = {
  facts: [
    ['Part Two was published in 1615, ten years after Part One.', true, 'A year before Cervantes died.'],
    ['In Part Two, many characters have already read Part One.', true, 'Don Quixote is famous.'],
    ['Sancho governs the "island" of Barataria well.', true, 'Then resigns, preferring his freedom.'],
    ['A false Part Two by another writer appeared in 1614.', true, 'Under the name Avellaneda.'],
    ['Don Quixote dies still believing he is a knight.', false, 'He recovers his wits and dies as Alonso Quixano the Good.'],
    ['Sansón Carrasco disguises himself as a knight to bring Don Quixote home.', true, 'As the Knight of the White Moon.'],
    ['Cervantes died in 1616, the same year as Shakespeare.', true, 'Cervantes on April 22, Shakespeare on April 23, but by different calendars.'],
    ['The Duke and Duchess are kind and never trick the pair.', false, 'They play long, sometimes cruel tricks on them.'],
    ['Sancho grows wiser in Part Two.', true, 'His proverbs and judgments win readers\' hearts.'],
    ['Part Two ends with Don Quixote crowned emperor.', false, 'It ends with his peaceful death at home.']
  ],
  items: [
    { q: 'What is new about Part Two compared with Part One?', r: 'The characters know they are in a famous book, and others recognize them', w: ['It has no Sancho', 'It is written in verse', 'It takes place in England'], why: 'A book that knows it is a book.' },
    { q: 'Why does Don Quixote go to Barcelona instead of Zaragoza?', r: 'To prove the false sequel wrong, since it sent him to Zaragoza', w: ['To see the king', 'To catch a ship to the Indies', 'Because Sancho is ill'], why: 'Cervantes answers his rival inside the story.' },
    { q: 'What does Sancho decide after ten days as governor?', r: 'To give up the post and go back to his old free life', w: ['To become king', 'To stay forever', 'To start a war'], why: 'He prefers his freedom.' },
    { q: 'What happens when Don Quixote is defeated by the Knight of the White Moon?', r: 'He must go home and give up knight-errantry for a year', w: ['He becomes a monk', 'He wins Dulcinea', 'He becomes governor'], why: 'The terms of the fight.' },
    { q: 'How does Don Quixote die?', r: 'At home, in his right mind, calling himself Alonso Quixano the Good', w: ['In battle', 'At sea', 'As a giant\'s prisoner'], why: 'Part Two, Chapter LXXIV.' },
    { q: 'Who is Cide Hamete Benengeli?', r: 'The invented Arab historian Cervantes says wrote the story', w: ['A real Spanish king', 'Sancho\'s brother', 'The innkeeper'], why: 'A joke about trustworthy narrators.' }
  ]
};
H.T(ID, B, [famLayers, famLayers, famSeq(EVT, 'Part Two', 'event'), famIsland, famPairs(WHO, function (a) { return 'In Part Two, who is <b>' + a + '</b>?'; }, function (b) { return 'Who is this: <i>' + b + '</i>?'; })].concat(dateFams(ID)), 0.6);
