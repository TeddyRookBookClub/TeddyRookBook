/* Shakespeare, the history plays (gbw1). Families: kings in order, which play tells which reign, royal houses,
   reign lengths (computed), who says it, Falstaff and Hal, dates. */
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
var ID = 'gbren.shakespeare-histories';
var KINGS = ['Richard II', 'Henry IV', 'Henry V', 'Henry VI', 'Edward IV', 'Richard III', 'Henry VII'];
var REIGN = [['Richard II', 1377, 1399], ['Henry IV', 1399, 1413], ['Henry V', 1413, 1422], ['Richard III', 1483, 1485], ['Henry VII', 1485, 1509]];
var HOUSE = [['Henry IV', 'Lancaster'], ['Henry V', 'Lancaster'], ['Henry VI', 'Lancaster'], ['Edward IV', 'York'], ['Richard III', 'York'], ['Henry VII', 'Tudor']];
var PLAY = [['the deposing of Richard II by his cousin Bolingbroke', 'Richard II'], ['Prince Hal in the tavern with Falstaff, and the Battle of Shrewsbury', 'Henry IV, Part 1'], ['the Battle of Agincourt', 'Henry V'], ['the loss of France and the start of the Wars of the Roses', 'Henry VI'], ['a scheming king who tells the audience his plans, defeated at Bosworth', 'Richard III'], ['King John\'s quarrels with France and the Pope', 'King John']];
function famReign(R, lv) {
  var k = R.pick(REIGN), n = k[2] - k[1];
  return H.num(k[0] + ' reigned from ' + k[1] + ' to ' + k[2] + '. About how many years is that?', n, ['$' + k[2] + ' - ' + k[1] + ' = ' + n + '$ years.']);
}
function famHouse(R, lv) {
  var h = R.pick(HOUSE);
  return H.mc('To which royal house did <b>' + h[0] + '</b> belong?', h[1], ['Lancaster', 'York', 'Tudor', 'Stuart'].filter(function (x) { return x !== h[1]; }).slice(0, lv === 1 ? 2 : 3), [h[0] + ': House of ' + h[1] + '. The red rose stood for Lancaster, the white rose for York.']);
}
var B = {
  facts: [
    ['Shakespeare\'s history plays tell the story of English kings, mostly from Richard II to Richard III.', true, 'From 1398 to 1485.'],
    ['The Wars of the Roses were fought between the houses of Lancaster and York.', true, 'From 1455 to 1487.'],
    ['Falstaff is a stern old general who never jokes.', false, 'He is a fat, witty, cowardly knight, Prince Hal\'s tavern friend, and one of Shakespeare\'s most loved characters.'],
    ['At the end of Henry IV, Part 2, the new King Henry V rejects Falstaff.', true, '"I know thee not, old man."'],
    ['Henry V wins the Battle of Agincourt in the play.', true, 'In 1415, against a much larger French army.'],
    ['Richard III ends with Henry Tudor becoming King Henry VII.', true, 'After the Battle of Bosworth, 1485.'],
    ['Shakespeare wrote the history plays as exact, modern history.', false, 'He drew on chronicles such as Holinshed\'s, and changed facts for drama.'],
    ['Queen Elizabeth I was the granddaughter of Henry VII.', true, 'So the Tudor ending mattered to Shakespeare\'s audience.'],
    ['Henry V\'s prologue asks the audience to use their imagination.', true, '"O for a Muse of fire."'],
    ['Historians agree that Shakespeare\'s portrait of Richard III is entirely fair.', false, 'Many think the Tudor sources made him darker than he was; the debate continues.']
  ],
  items: [
    { q: 'What is the "Henriad"?', r: 'The four plays Richard II, Henry IV Parts 1 and 2, and Henry V', w: ['A long poem by Shakespeare', 'A royal palace', 'A book of sonnets'], why: 'They follow Prince Hal from tavern to throne.' },
    { q: 'Why does Prince Hal spend time in the tavern with Falstaff?', r: 'He says he will surprise everyone later by reforming, like the sun breaking through clouds', w: ['Falstaff is his teacher', 'He is hiding from the king\'s enemies', 'He owns the tavern'], why: 'Henry IV, Part 1, Act I.' },
    { q: 'Who were the two sides in the Wars of the Roses?', r: 'The houses of Lancaster (red rose) and York (white rose)', w: ['England and France', 'Scotland and Wales', 'The Church and the king'], why: 'Henry VII united them.' },
    { q: 'What happens to Richard II in Shakespeare\'s play?', r: 'He loses his crown to his cousin, who becomes Henry IV', w: ['He wins at Agincourt', 'He marries Elizabeth of York', 'He becomes Pope'], why: 'The trouble that follows fills the next plays.' },
    { q: 'Where did Shakespeare find much of his history?', r: 'In chronicles, especially Raphael Holinshed\'s', w: ['In newspapers', 'In Plutarch\'s Lives', 'In letters from the kings'], why: 'Holinshed\'s Chronicles, 1577 and 1587.' },
    { q: 'Why does the Chorus in Henry V apologize for the stage?', r: 'A small wooden theater cannot really hold the fields of France, so the audience must imagine them', w: ['The actors forgot their lines', 'The play is too short', 'The king is in the audience'], why: 'The prologue.' }
  ]
};
H.T(ID, B, [famSeq(KINGS, 'the English kings, earliest first', 'king'), famPairs(PLAY, function (a) { return 'Which play shows <b>' + a + '</b>?'; }), famHouse, famReign, famSaid(['Henry V', 'Richard II']), famFeet].concat(dateFams(ID)), 0.6);
