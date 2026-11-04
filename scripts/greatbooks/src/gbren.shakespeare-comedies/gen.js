/* Shakespeare, the comedies (gbw1). Families: the five acts of A Midsummer Night's Dream, who is who across the comedies,
   who says it, the Globe, comic devices, meter (computed), dates. */
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
var ID = 'gbren.shakespeare-comedies';
var WHO = [['Puck', 'Oberon\'s mischievous fairy servant (A Midsummer Night\'s Dream)'], ['Bottom', 'a weaver who is given a donkey\'s head (A Midsummer Night\'s Dream)'], ['Beatrice and Benedick', 'two sharp-tongued wits who swear they will never marry (Much Ado About Nothing)'], ['Rosalind', 'a duke\'s daughter who disguises herself as a young man in the Forest of Arden (As You Like It)'], ['Viola', 'a shipwrecked young woman who disguises herself as a page (Twelfth Night)'], ['Malvolio', 'a stuffy steward tricked by a forged letter (Twelfth Night)'], ['Portia', 'a clever heiress who argues a case in court in disguise (The Merchant of Venice)'], ['Jaques', 'a gloomy lord who says all the world\'s a stage (As You Like It)']];
var DEV = [['disguise', 'a woman dressed as a young man, as with Rosalind and Viola'], ['mistaken identity', 'twins or look-alikes confused for each other'], ['the green world', 'a forest or countryside where the rules of the city are turned upside down'], ['the wise fool', 'a jester who speaks more sense than the lords'], ['the comic ending', 'confusions cleared up and marriages, often several at once'], ['a play within the play', 'the workmen\'s Pyramus and Thisbe in A Midsummer Night\'s Dream']];
function famGlobe(R, lv) {
  var G = [['the yard', 'where "groundlings" stood for a penny, with no roof'], ['the galleries', 'three levels of covered seats around the yard'], ['the stage', 'a platform jutting into the yard, with a trapdoor'], ['the tiring house', 'behind the stage, where actors dressed'], ['the heavens', 'the roof over the stage, painted underneath']];
  return famPairs(G, function (a) { return 'At the Globe, what was <b>' + a + '</b>?'; }, function (b) { return 'Which part of the Globe was this: <i>' + b + '</i>?'; })(R, lv);
}
var B = {
  facts: [
    ['Shakespeare\'s comedies usually end in marriages.', true, 'Often several at once.'],
    ['In Shakespeare\'s time, women\'s parts were played by boys.', true, 'Women did not act on the English public stage until 1660.'],
    ['A Midsummer Night\'s Dream is set mostly in a wood outside Athens.', true, 'Ruled by the fairy king and queen.'],
    ['The Globe Theatre had a roof over the whole audience.', false, 'The yard in the middle was open to the sky.'],
    ['Shakespeare\'s company built the Globe in 1599.', true, 'On the south bank of the Thames in London.'],
    ['In Twelfth Night, Viola disguises herself as a young man.', true, 'And is mistaken for her twin brother.'],
    ['Shakespeare wrote all his plays in rhyming couplets.', false, 'Mostly blank verse (unrhymed iambic pentameter) and prose, with some rhyme.'],
    ['The workmen\'s play in A Midsummer Night\'s Dream is the tragedy of Pyramus and Thisbe.', true, 'Acted so badly it becomes a comedy.'],
    ['The First Folio, the first collected edition of the plays, was published in 1623.', true, 'Seven years after Shakespeare\'s death, by two fellow actors.'],
    ['Shakespeare was born in Stratford-upon-Avon.', true, 'In 1564.']
  ],
  items: [
    { q: 'What makes Bottom\'s adventure funny?', r: 'Puck gives him a donkey\'s head, and the enchanted fairy queen falls in love with him', w: ['He becomes king of Athens', 'He wins a sword fight', 'He discovers he is a prince'], why: 'A Midsummer Night\'s Dream, Act III.' },
    { q: 'Why do the lovers in the wood get mixed up?', r: 'Puck puts the love-juice on the wrong young man\'s eyes', w: ['They drink a potion at a feast', 'A storm separates them', 'They are twins'], why: 'Act II.' },
    { q: 'Where did the poorest playgoers stand at the Globe?', r: 'In the open yard, around the stage', w: ['On the roof', 'In the top gallery', 'Behind the stage'], why: 'They paid a penny.' },
    { q: 'What is the "green world" in Shakespeare\'s comedies?', r: 'A forest or countryside where everyday rules are turned upside down until things come right', w: ['The color of the stage curtain', 'A garden in London', 'The name of the theater'], why: 'The wood near Athens, the Forest of Arden.' },
    { q: 'Who speaks the epilogue of A Midsummer Night\'s Dream?', r: 'Puck, asking the audience to think it was all a dream', w: ['Theseus', 'Bottom', 'Hermia'], why: 'Act V.' },
    { q: 'What do the comedies usually do in their last act?', r: 'Clear up the confusions and end with marriages', w: ['Kill the main characters', 'Leave everything unresolved', 'Start a war'], why: 'That is one meaning of "comedy."' }
  ]
};
H.T(ID, B, [famSeq(['Athens', 'The wood', 'Mix-ups', 'Waking', 'The wedding play'], 'the five acts of A Midsummer Night\'s Dream', 'act'), famPairs(WHO, function (a) { return 'Who is <b>' + a + '</b>?'; }, function (b) { return 'Who is <i>' + b + '</i>?'; }), famPairs(DEV, function (a) { return 'In Shakespeare\'s comedies, what is <b>' + a + '</b>?'; }, function (b) { return 'Which comic device is this: <i>' + b + '</i>?'; }), famSaid(['A Midsummer Night’s Dream', 'As You Like It']), famGlobe, famFeet].concat(dateFams(ID)), 0.6);
