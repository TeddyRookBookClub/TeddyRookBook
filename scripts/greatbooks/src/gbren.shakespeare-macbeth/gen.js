/* Shakespeare, Macbeth (gbw1). Families: the five acts, who is who, the prophecies and how they come true, who says it,
   meter (computed: the witches' trochees), dates. */
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
var ID = 'gbren.shakespeare-macbeth';
var WHO = [['Macbeth', 'a Scottish general who becomes king by murder'], ['Lady Macbeth', 'his wife, who urges him on'], ['Duncan', 'the King of Scotland'], ['Banquo', 'Macbeth\'s fellow general and friend'], ['Macduff', 'the lord who finally faces Macbeth'], ['Malcolm', 'Duncan\'s son and heir'], ['Fleance', 'Banquo\'s son, who escapes'], ['the witches', 'three strange sisters who speak in riddles']];
var PROPH = [['Macbeth will be Thane of Cawdor', 'The King gives him the title that same day'], ['Macbeth will be king', 'He murders Duncan and takes the crown'], ['Banquo\'s children will be kings', 'Banquo\'s son Fleance escapes'], ['No man born of woman can harm Macbeth', 'Macduff was born in an unusual way, before his time'], ['Macbeth is safe until Birnam Wood comes to Dunsinane', 'Malcolm\'s soldiers carry branches from the wood as cover']];
var B = {
  facts: [
    ['Macbeth is set in Scotland.', true, 'Based loosely on a real king of the 1000s.'],
    ['The witches tell Macbeth he will be king.', true, 'Act I, scene 3.'],
    ['Macbeth kills King Duncan while Duncan is his guest.', true, 'Breaking the duty of a host as well as a subject.'],
    ['Lady Macbeth tries to stop the murder.', false, 'She urges it, then is haunted by guilt.'],
    ['Only Macbeth sees Banquo\'s ghost at the feast.', true, 'Act III, scene 4.'],
    ['Lady Macbeth walks in her sleep, trying to wash an imaginary spot from her hands.', true, 'Act V, scene 1.'],
    ['Macbeth is Shakespeare\'s longest tragedy.', false, 'It is his shortest.'],
    ['The witches speak in a different rhythm from the other characters.', true, 'A chanting DUM-da beat.'],
    ['Malcolm becomes king at the end.', true, 'The rightful heir is restored.'],
    ['Shakespeare wrote Macbeth soon after King James VI of Scotland became James I of England.', true, 'James, who claimed descent from Banquo, came to the English throne in 1603.']
  ],
  items: [
    { q: 'What does Macbeth mean by "Vaulting ambition, which o\'erleaps itself"?', r: 'His ambition is like a rider who jumps too hard and falls on the other side', w: ['He wants to be an acrobat', 'He has no ambition', 'He is praising Duncan'], why: 'Act I, scene 7.' },
    { q: 'What do the witches\' words "Fair is foul, and foul is fair" warn the audience about?', r: 'In this play things will not be what they seem', w: ['The weather will be fine', 'Everyone will be fair', 'The witches are kind'], why: 'Act I, scene 1.' },
    { q: 'What does Macbeth see before the murder?', r: 'A dagger in the air, leading him on', w: ['A crown', 'A ghost of Banquo', 'An army'], why: '"Is this a dagger which I see before me?"' },
    { q: 'How does guilt show itself in the Macbeths?', r: 'He sees ghosts and visions; she walks in her sleep washing her hands', w: ['They give everything away', 'They confess to the court', 'It never does'], why: 'Their crimes haunt them.' },
    { q: 'What happens to Macbeth as the play goes on?', r: 'Each crime leads him to the next, until he feels almost nothing', w: ['He becomes kinder', 'He gives back the crown', 'He becomes a monk'], why: 'His speech "Tomorrow, and tomorrow" shows his despair.' },
    { q: 'Is Macbeth\'s fate decided by the witches?', r: 'The play leaves it open: they foretell, but he chooses the murders', w: ['Yes, he has no choice at all', 'No, the witches are lying about everything', 'The play says it is decided by the stars'], why: 'A big question about fate and free will.' }
  ]
};
H.T(ID, B, [famSeq(['The prophecy', 'The murder', 'Banquo', 'New prophecies', 'Birnam Wood'], 'the five acts of Macbeth', 'act'), famPairs(WHO, function (a) { return 'In Macbeth, who is <b>' + a + '</b>?'; }, function (b) { return 'Who is <i>' + b + '</i>?'; }), famPairs(PROPH, function (a) { return 'The witches\' words: <i>' + a + '</i>. How does it come true?'; }, function (b) { return 'Which prophecy comes true this way: <i>' + b + '</i>?'; }), famSaid(['Macbeth']), famSaid(), famFeet, famFeet].concat(dateFams(ID)), 0.6);
