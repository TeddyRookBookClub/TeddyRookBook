/* Montaigne, Essays (gbw1). Families: essay titles and what they ask, terms, his views on education, the shape of a
   skeptic's argument, the three books, dates. */
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
var ID = 'gbren.montaigne-essays';
var ESS = [['Of the Education of Children', 'a tutor should train judgment, not just stuff the memory'], ['That to Study Philosophy is to Learn to Die', 'thinking about death ahead of time takes away its terror'], ['Of Cannibals', 'the people Europeans call savages may be no more barbarous than Europeans'], ['Of Friendship', 'his friendship with Étienne de La Boétie, which he can explain only by saying it was he, and it was I'], ['Apology for Raymond Sebond', 'human reason is weaker than we think; we cannot even be sure we know more than a cat'], ['Of Experience', 'the last essay: learning to live well from watching one\'s own life']];
var TERMS = [['essay', 'from the French essai, "a try" or "an attempt"'], ['skepticism', 'doubting that we can be certain, and holding back from judging too fast'], ['Que sais-je?', 'Montaigne\'s motto: "What do I know?"'], ['the tower library', 'where Montaigne read and wrote, with sayings painted on the beams'], ['Stoicism', 'an ancient philosophy of calm and self-control he admired in his early essays']];
function famSkeptic(R, lv) {
  var r = R.next();
  if (r < 0.5) return H.mc('A skeptic like Montaigne hears two sides of a question and finds the reasons equally strong. What does he do?', 'Holds back from judging, and keeps looking', ['Picks the side his friends like', 'Picks the side he heard first', 'Gives up thinking about it forever'], ['He suspends judgment: "What do I know?"'], { hint: 'Think of a level balance.' });
  var a = R.int(1, 4), b = R.int(1, 4), right = a === b ? 'level' : (a > b ? 'toward the first side' : 'toward the second side');
  return H.mc('On Montaigne\'s balance, one side gets ' + a + ' good reason' + (a > 1 ? 's' : '') + ' and the other ' + b + '. If every reason weighs the same, which way does the beam tip?', right, ['level', 'toward the first side', 'toward the second side'].filter(function (x) { return x !== right; }), [a + ' against ' + b + ': ' + right + '.']);
}
var B = {
  facts: [
    ['Montaigne invented the essay as a kind of writing.', true, 'Essai means "a try" in French.'],
    ['Montaigne wrote, "myself am the matter of my book."', true, 'In his note to the reader (Cotton\'s translation).'],
    ['Montaigne wrote the Essays in Latin.', false, 'In French. Latin was his first language as a child, though: his father had him taught it from birth.'],
    ['Montaigne kept adding to his essays for the rest of his life.', true, 'Books I and II in 1580; Book III in 1588; more notes until his death in 1592.'],
    ['Montaigne was mayor of Bordeaux.', true, 'For two terms, from 1581.'],
    ['Montaigne thought a good tutor should fill a child\'s head with as many facts as possible.', false, 'He wanted "a well-made rather than a well-filled head."'],
    ['Shakespeare seems to have read Montaigne in John Florio\'s translation.', true, 'A speech in The Tempest borrows from "Of Cannibals."'],
    ['Montaigne\'s motto was "What do I know?"', true, 'Que sais-je?'],
    ['Montaigne\'s friend Étienne de La Boétie lived to old age.', false, 'He died young, in 1563, and Montaigne never stopped missing him.'],
    ['Montaigne wrote in a tower on his family\'s estate.', true, 'His library had sayings painted on the ceiling beams.']
  ],
  items: [
    { q: 'What does the French word essai mean?', r: 'A try, an attempt', w: ['A long poem', 'A sermon', 'A letter'], why: 'Montaigne tries out his thoughts.' },
    { q: 'What is the main subject of Montaigne\'s book, by his own account?', r: 'Himself', w: ['The history of France', 'The stars', 'The Bible'], why: '"Myself am the matter of my book."' },
    { q: 'What kind of head does Montaigne want a child\'s tutor to have?', r: 'A well-made rather than a well-filled head', w: ['The biggest head possible', 'A head full of Latin', 'A head for business'], why: 'Judgment over memory.' },
    { q: 'What does Montaigne say about bees in "Of the Education of Children"?', r: 'They gather from many flowers but make honey all their own, as a student should with what he reads', w: ['That they are dangerous', 'That they work only in summer', 'That they make better teachers than people'], why: 'Learn from others, then think for yourself.' },
    { q: 'In "Of Cannibals," what does Montaigne suggest about the people of Brazil he heard about?', r: 'That calling them barbarians says as much about European customs as theirs', w: ['That they should be conquered', 'That they were giants', 'That they did not exist'], why: 'We call barbarous whatever is not our custom, he says.' },
    { q: 'Who translated Montaigne into English in 1603?', r: 'John Florio', w: ['Charles Cotton', 'William Shakespeare', 'Francis Bacon'], why: 'Charles Cotton\'s translation came in 1685.' },
    { q: 'What did Montaigne put on a medal in 1576?', r: 'A pair of balanced scales and the motto "What do I know?"', w: ['A lion and a fox', 'A ship', 'His tower'], why: 'Balance and doubt.' }
  ]
};
H.T(ID, B, [famPairs(ESS, function (a) { return 'What is the main idea of Montaigne\'s essay <b>' + a + '</b>?'; }, function (b) { return 'Which essay says: <i>' + b + '</i>?'; }), famPairs(TERMS, function (a) { return 'What is <b>' + a + '</b>?'; }, function (b) { return 'Which term matches: <i>' + b + '</i>?'; }), famSkeptic, famSeq(['Montaigne born (1533)', 'La Boétie dies (1563)', 'Montaigne retires to his tower (1571)', 'Books I and II published (1580)', 'Mayor of Bordeaux (1581–1585)', 'Book III added (1588)', 'Montaigne dies (1592)'], 'Montaigne\'s life', 'event')].concat(dateFams(ID)), 0.6);
