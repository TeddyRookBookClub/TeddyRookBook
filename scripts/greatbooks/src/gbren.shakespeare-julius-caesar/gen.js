/* Shakespeare, Julius Caesar and the Roman plays (gbw1). Families: the five acts, who is who, who says it, the two funeral
   speeches (rhetoric), Plutarch, the Roman plays, dates. */
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
var ID = 'gbren.shakespeare-julius-caesar';
var WHO = [['Brutus', 'Caesar\'s friend, who joins the plot for the Republic\'s sake'], ['Cassius', 'the organizer of the plot'], ['Mark Antony', 'Caesar\'s loyal friend, whose speech turns the crowd'], ['Calpurnia', 'Caesar\'s wife, who dreams of his death'], ['Portia', 'Brutus\'s wife'], ['Octavius', 'Caesar\'s heir, later the emperor Augustus'], ['the soothsayer', 'who warns Caesar to beware the Ides of March']];
var ROM = [['Julius Caesar', 'the murder of Caesar and the fall of the conspirators (44 to 42 BC)'], ['Antony and Cleopatra', 'Mark Antony and the Egyptian queen against Octavius (40s and 30s BC)'], ['Coriolanus', 'a proud general of the early Republic who scorns the people']];
function famRhet(R, lv) {
  var S = [['Brutus speaks in plain prose and asks the crowd to judge with reason.', 'logos: an appeal to reasons'], ['Antony keeps calling Brutus "an honourable man" until the words sound bitter.', 'irony and repetition'], ['Antony shows the crowd Caesar\'s wounded cloak and reads his will.', 'pathos: an appeal to feelings'], ['Brutus says he loved Caesar, but loved Rome more.', 'ethos: an appeal to his own character']];
  var s = R.pick(S);
  return H.mc('In the funeral scene (Act III, scene 2): <i>' + s[0] + '</i> Which tool of persuasion is this?', s[1], S.filter(function (x) { return x !== s; }).map(function (x) { return x[1]; }), ['Aristotle\'s three appeals (ethos, pathos, logos) fit the two speeches well.']);
}
var B = {
  facts: [
    ['Shakespeare took the story of Julius Caesar from Plutarch\'s Lives, in Thomas North\'s translation.', true, 'North\'s Plutarch (1579).'],
    ['Caesar is killed on the Ides of March, the 15th.', true, 'In 44 BC.'],
    ['Brutus joins the conspiracy because he hates Caesar.', false, 'He loves Caesar, but fears that Caesar\'s power will end the Republic.'],
    ['Mark Antony\'s speech turns the crowd against the conspirators.', true, '"Friends, Romans, countrymen."'],
    ['The play ends with Caesar\'s victory.', false, 'Caesar dies in Act III; the play ends with the conspirators\' defeat at Philippi.'],
    ['Caesar\'s ghost appears to Brutus.', true, 'Act IV.'],
    ['Antony calls Brutus "the noblest Roman of them all."', true, 'Act V.'],
    ['The title character is on stage for most of the play.', false, 'Caesar dies halfway through; Brutus has more lines.'],
    ['Julius Caesar was probably one of the first plays at the Globe, in 1599.', true, 'A Swiss traveler described seeing it that year.'],
    ['Shakespeare\'s Roman plays include Antony and Cleopatra and Coriolanus.', true, 'All three drew on Plutarch.']
  ],
  items: [
    { q: 'What does Cassius mean by "The fault, dear Brutus, is not in our stars, / But in ourselves"?', r: 'We cannot blame fate; we are responsible for being under Caesar', w: ['Astrology is always right', 'Brutus is to blame for everything', 'The stars are falling'], why: 'Act I, scene 2.' },
    { q: 'What is the turning point of the play?', r: 'Caesar\'s murder and the two funeral speeches', w: ['Calpurnia\'s dream', 'The battle at Philippi', 'Caesar\'s triumph'], why: 'Act III.' },
    { q: 'Why is Brutus called a tragic hero?', r: 'He is a good man whose noble aims lead to disaster', w: ['He is a villain', 'He wins in the end', 'He never makes a choice'], why: 'His idealism makes him misjudge Antony and the crowd.' },
    { q: 'What mistake does Brutus make after the murder?', r: 'He lets Antony speak to the crowd, and speaks first himself', w: ['He kills Antony', 'He flees Rome at once', 'He crowns himself'], why: 'Cassius warns him against it.' },
    { q: 'Which ancient writer gave Shakespeare his Roman stories?', r: 'Plutarch', w: ['Homer', 'Virgil', 'Tacitus'], why: 'His paired Lives of Greeks and Romans.' },
    { q: 'What warning does the soothsayer give Caesar?', r: 'Beware the Ides of March', w: ['Do not cross the Rubicon', 'Trust no Greeks', 'Stay out of Egypt'], why: 'Act I, scene 2.' }
  ]
};
H.T(ID, B, [famSeq(['Caesar\'s triumph', 'The plot', 'The Ides of March', 'The quarrel', 'Philippi'], 'the five acts of Julius Caesar', 'act'), famPairs(WHO, function (a) { return 'In Julius Caesar, who is <b>' + a + '</b>?'; }, function (b) { return 'Who is <i>' + b + '</i>?'; }), famPairs(ROM, function (a) { return 'What is <b>' + a + '</b> about?'; }, function (b) { return 'Which Roman play is about <i>' + b + '</i>?'; }), famSaid(['Julius Caesar']), famRhet, famRhet, famFeet].concat(dateFams(ID)), 0.6);
