/* Shakespeare, Romeo and Juliet (gbw1). Families: the five acts, who is who, who says it, haste and chance in the plot,
   meter and the sonnet in the play (computed), dates. */
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
var ID = 'gbren.shakespeare-romeo-and-juliet';
var WHO = [['Romeo', 'a young Montague'], ['Juliet', 'a young Capulet, not yet fourteen'], ['Mercutio', 'Romeo\'s witty friend, kin to the Prince'], ['Tybalt', 'Juliet\'s hot-tempered cousin'], ['Friar Laurence', 'the friar who marries the lovers in secret'], ['the Nurse', 'Juliet\'s nurse and go-between'], ['Escalus', 'the Prince of Verona'], ['Paris', 'the count Juliet\'s father wants her to marry']];
function famChance(R, lv) {
  var C = [['The servant who cannot read asks Romeo to read the Capulets\' guest list.', 'That is how Romeo learns of the feast.'], ['Friar Laurence\'s letter to Romeo never arrives.', 'The messenger is kept in a house closed for plague.'], ['Romeo arrives at the tomb just before Juliet wakes.', 'A few minutes change everything.'], ['Romeo steps between Mercutio and Tybalt to stop the fight.', 'Tybalt strikes Mercutio under Romeo\'s arm.']];
  var c = R.pick(C);
  return H.mc('Which part does chance (bad luck or bad timing) play here? <i>' + c[0] + '</i>', 'It moves the story toward disaster', ['It has no effect on the plot', 'It saves the lovers', 'It ends the feud at once'], [c[1] + ' Chance and haste work together in the play.']);
}
var B = {
  facts: [
    ['Romeo and Juliet is set in Verona, in Italy.', true, '"In fair Verona, where we lay our scene."'],
    ['The play opens with a sonnet, spoken as a prologue.', true, 'Fourteen lines, ABAB CDCD EFEF GG.'],
    ['Romeo and Juliet know each other\'s families before they meet.', false, 'They learn it only after they fall in love at the feast.'],
    ['Friar Laurence hopes the marriage will end the feud.', true, 'Act II.'],
    ['Romeo kills Tybalt after Tybalt kills Mercutio.', true, 'Act III, the turning point.'],
    ['The Prince sentences Romeo to death.', false, 'He banishes him from Verona.'],
    ['The prologue tells the audience at the start that the lovers will die.', true, '"A pair of star-cross\'d lovers take their life."'],
    ['The whole story takes place over about four or five days.', true, 'From Sunday to Thursday or Friday: haste is part of the tragedy.'],
    ['At the end the Montagues and Capulets make peace.', true, 'Too late.'],
    ['Shakespeare invented the story of Romeo and Juliet.', false, 'He took it from an English poem by Arthur Brooke (1562), based on Italian tales.']
  ],
  items: [
    { q: 'What does "star-cross\'d" mean in the prologue?', r: 'Ill-fated: as if the stars are against them', w: ['Very famous', 'Born on the same night', 'In love with astronomy'], why: 'Many people then believed the stars influenced fate.' },
    { q: 'What is Friar Laurence\'s advice, "Wisely, and slow," a warning against?', r: 'Haste', w: ['Laziness', 'Too much study', 'Eating late'], why: '"They stumble that run fast."' },
    { q: 'Why does Juliet ask "What\'s in a name?"', r: 'Romeo\'s family name is the only thing that makes him her enemy', w: ['She has forgotten his name', 'She wants to change her own name for fun', 'She is naming a rose'], why: 'Act II, scene 2.' },
    { q: 'What is the turning point (Act III) of Romeo and Juliet?', r: 'The deaths of Mercutio and Tybalt, and Romeo\'s banishment', w: ['The feast', 'The wedding', 'The balcony scene'], why: 'From here everything goes wrong.' },
    { q: 'Why does Friar Laurence give Juliet a potion?', r: 'To make her seem dead, so she can escape marrying Paris', w: ['To cure a fever', 'To make her forget Romeo', 'To make her fall asleep at the feast'], why: 'Act IV.' },
    { q: 'What does the play suggest finally ends the feud?', r: 'The grief of both families at the loss of their children', w: ['A law from the Prince', 'A war', 'A marriage between the parents'], why: 'Act V.' }
  ]
};
H.T(ID, B, [famSeq(['A feud and a feast', 'The balcony and the wedding', 'Mercutio and Tybalt', 'The friar\'s plan', 'The tomb'], 'the five acts of Romeo and Juliet', 'act'), famPairs(WHO, function (a) { return 'Who is <b>' + a + '</b>?'; }, function (b) { return 'Who is <i>' + b + '</i>?'; }), famSaid(['Romeo and Juliet']), famSaid(), famChance, famSonnet, famFeet].concat(dateFams(ID)), 0.6);
