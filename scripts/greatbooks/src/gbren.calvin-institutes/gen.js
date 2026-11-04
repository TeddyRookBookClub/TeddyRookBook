/* Calvin, Institutes of the Christian Religion (gbw1). Calvin's teaching presented as his views. Families: the four books and
   the Creed, chapter counts (computed), key terms, the Reformation timeline, the opening argument, dates. */
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
var ID = 'gbren.calvin-institutes';
var BK = [['Book I', 'the knowledge of God the Creator', 18], ['Book II', 'the knowledge of God the Redeemer, in Christ', 17], ['Book III', 'how we receive the grace of Christ (faith and the Christian life)', 25], ['Book IV', 'the church, the sacraments and civil government', 20]];
var TERMS = [['providence', 'God\'s care and rule over all that happens'], ['justification by faith', 'being made right with God through faith, not earned by good works'], ['election (predestination)', 'Calvin\'s teaching that God chooses, from eternity, who will be saved'], ['sacraments', 'for Calvin, two: baptism and the Lord\'s Supper'], ['sovereignty of God', 'God\'s supreme authority over everything'], ['Reformed', 'the name for the churches that follow Calvin\'s and similar teaching']];
function famBooks(R, lv) {
  var r = R.next();
  if (r < 0.4) { var b = R.pick(BK); return H.mc('In the 1559 Institutes, what is <b>' + b[0] + '</b> about?', b[1], BK.filter(function (x) { return x !== b; }).map(function (x) { return x[1]; }).slice(0, lv === 1 ? 2 : 3), [b[0] + ': ' + b[1] + ' (' + b[2] + ' chapters).']); }
  if (r < 0.75) { var i = R.int(0, 2), j = R.int(i + 1, 3), s = BK[i][2] + BK[j][2]; return H.num('Book ' + (i + 1) + ' of the 1559 Institutes has ' + BK[i][2] + ' chapters and Book ' + (j + 1) + ' has ' + BK[j][2] + '. How many chapters is that together?', s, ['$' + BK[i][2] + ' + ' + BK[j][2] + ' = ' + s + '$.']); }
  var pages = R.int(lv === 1 ? 2 : 3, lv === 1 ? 4 : 8);
  return H.num('The 1559 Institutes has 80 chapters. If you read ' + pages + ' chapters a week, how many weeks would it take (counting a last short week as a whole week)?', Math.ceil(80 / pages), ['$80 \\div ' + pages + ' \\approx ' + (80 / pages).toFixed(1) + '$, so ' + Math.ceil(80 / pages) + ' weeks.']);
}
function famOpen(R, lv) {
  if (R.coin()) return H.mc('Calvin begins: true wisdom consists almost entirely of two parts. What are they?', 'The knowledge of God and the knowledge of ourselves', ['Grammar and logic', 'Law and medicine', 'Prayer and fasting'].slice(0, lv === 1 ? 2 : 3), ['Book I, Chapter 1.']);
  return H.mc('Why, according to Calvin, can we not know ourselves truly without first looking to God?', 'Only by comparing ourselves with God do we see how far we fall short', ['Because we have no minds', 'Because the stars decide our character', 'Because only kings may know themselves'], ['Book I, Chapter 1, section 2, as Calvin argues it.']);
}
var B = {
  facts: [
    ['Calvin first published the Institutes in 1536, as a short book of six chapters.', true, 'He kept enlarging it until the final edition of 1559.'],
    ['The final Institutes has four books.', true, 'Following the order of the Apostles\' Creed.'],
    ['Calvin was born in Switzerland.', false, 'He was born in Noyon, France, in 1509, and did his life\'s work in Geneva.'],
    ['Calvin dedicated the first edition to King Francis I of France.', true, 'Asking the king to stop persecuting French Protestants.'],
    ['Calvin wrote the Institutes in both Latin and French.', true, 'His French version (1541) helped shape French prose.'],
    ['Calvin taught that people earn salvation by good works.', false, 'He taught justification by faith alone, through grace; good works follow from faith.'],
    ['Calvin held that there are seven sacraments.', false, 'He counted two: baptism and the Lord\'s Supper.'],
    ['Calvin\'s teaching spread to Scotland, the Netherlands, France and later North America.', true, 'Through Presbyterian and Reformed churches and the Puritans.'],
    ['Henry Beveridge translated the Institutes into English in 1845.', true, 'For the Calvin Translation Society, Edinburgh.'],
    ['Calvin\'s teaching on election has always been accepted by all Christians.', false, 'It has been debated from his day to ours, among Protestants too.']
  ],
  items: [
    { q: 'Which city is most connected with Calvin\'s work?', r: 'Geneva', w: ['Wittenberg', 'Rome', 'Paris'], why: 'He led the church there from 1541 until his death.' },
    { q: 'What does Calvin say true wisdom mostly consists of?', r: 'Knowledge of God and knowledge of ourselves', w: ['Wealth and power', 'Mathematics and music', 'Latin and Greek'], why: 'The first sentence of the Institutes.' },
    { q: 'What does the last chapter of the Institutes discuss?', r: 'Civil government', w: ['The planets', 'Medicine', 'Poetry'], why: 'Book IV, Chapter 20.' },
    { q: 'Which earlier reformer\'s ideas did Calvin build on?', r: 'Martin Luther\'s', w: ['Machiavelli\'s', 'Montaigne\'s', 'Shakespeare\'s'], why: 'Calvin was a second-generation reformer.' },
    { q: 'What was one main criticism of Calvin\'s Geneva, by people of his own time and later?', r: 'That its church courts controlled private life closely and punished dissent, as in the execution of Servetus in 1553', w: ['That it had no church at all', 'That it banned all books', 'That it was ruled by the Pope'], why: 'Historians judge this differently; most agree it was strict.' },
    { q: 'What did Calvin mean by God\'s providence?', r: 'That God cares for and governs everything that happens', w: ['That God made the world and left it alone', 'That chance rules everything', 'That the stars decide our fate'], why: 'Book I, Chapters 16 to 18.' }
  ]
};
H.T(ID, B, [famBooks, famBooks, famOpen, famPairs(TERMS, function (a) { return 'In Calvin\'s teaching, what is <b>' + a + '</b>?'; }, function (b) { return 'Which term matches: <i>' + b + '</i>?'; }), famSeq(['Calvin born in Noyon (1509)', 'Luther\'s 95 Theses (1517)', 'First Institutes (1536)', 'Calvin settles in Geneva for good (1541)', 'Final Latin Institutes (1559)', 'Calvin dies (1564)'], 'Calvin and the Reformation', 'event')].concat(dateFams(ID)), 0.6);
