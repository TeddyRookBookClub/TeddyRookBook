/* Chaucer, Troilus and Criseyde (gbe4). Families: the books in order (events), who is who, Fortune's wheel,
   rhyme royal (computed line counts and rhyme letters), Middle English glosses, sources, dates. */
/* shared helpers for the gbmiddle rungs (gbe4); each gen.js carries its own copy, since each is wrapped on its own. */
var LETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
/* a sequence family: seq = [label, ...] in order; what = "the circles of Hell, from the top"; it = noun for one item */
function famSeq(seq, what, it) {
  return function (R, lv) {
    var r = R.next();
    if (r < 0.4) {
      var k = lv === 1 ? 3 : 4, idx = R.sample(seq.map(function (_, i) { return i; }), k).sort(function (a, b) { return a - b; });
      var right = idx.map(function (i) { return seq[i]; }).join(' → '), w = [];
      for (var t = 0; t < 8 && w.length < 3; t++) { var sh = R.shuffle(idx.slice()).map(function (i) { return seq[i]; }).join(' → '); if (sh !== right && w.indexOf(sh) < 0) w.push(sh); }
      return H.mc('Which list puts these in the right order (' + what + ')?', right, w, ['In order: ' + right + '.'], { hint: 'Find the first one, then work forward.' });
    }
    if (r < 0.7 || lv === 1) {
      var i = R.int(0, seq.length - 2), wr = R.sample(seq.filter(function (_, j) { return j !== i + 1 && j !== i; }), lv === 1 ? 2 : 3);
      return H.mc('In ' + what + ', which ' + it + ' comes right after <b>' + seq[i] + '</b>?', seq[i + 1], wr, [seq[i] + ' is followed by ' + seq[i + 1] + '.']);
    }
    var j = R.int(0, seq.length - 1);
    return H.num('Counting ' + what + ', what number is <b>' + seq[j] + '</b>? (The first is 1.)', j + 1, ['The order is: ' + seq.map(function (x, n) { return (n + 1) + '. ' + x; }).join('; ') + '.'], { hint: 'Count from the start.' });
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
    var wb = H.uniq(pairs.filter(function (x) { return x[1] !== p[1]; }).map(function (x) { return x[1]; }));
    return H.mc(qa(p[0]), p[1], R.sample(wb, Math.min(k, wb.length)), [p[0] + ': ' + p[1] + '.']);
  };
}
var ID = 'gbmiddle.chaucer-troilus';
var EV = ['Troilus sees Criseyde at a temple feast', 'Pandarus learns his secret and offers help', 'Criseyde sees Troilus ride home from battle', 'Troilus and Criseyde promise to be faithful', 'Troy agrees to trade Criseyde for Antenor', 'Diomede courts Criseyde in the Greek camp', 'Troilus is killed in battle', 'Troilus\'s spirit looks down from the heavens'];
var BOOK = [['Troilus first sees Criseyde and falls in love', 'Book I'], ['Pandarus visits Criseyde and tells her of Troilus', 'Book II'], ['The two promise to love each other; Troilus is at the top of Fortune\'s wheel', 'Book III'], ['Criseyde is to be traded to the Greeks', 'Book IV'], ['Criseyde does not return, and Troilus dies', 'Book V']];
var WHO = [['Troilus', 'a prince of Troy, son of King Priam'], ['Criseyde', 'a widow of Troy whose father has gone over to the Greeks'], ['Pandarus', 'Criseyde\'s uncle and Troilus\'s talkative friend'], ['Calchas', 'Criseyde\'s father, a prophet who joins the Greeks'], ['Diomede', 'the Greek who courts Criseyde in the Greek camp'], ['Antenor', 'the captured Trojan traded for Criseyde']];
var RR = 'ABABBCC';
function famRR(R, lv) {
  var r = R.next();
  if (r < 0.35) { var n = R.int(lv === 1 ? 2 : 20, lv === 1 ? 9 : 260); return H.num('Rhyme royal stanzas have 7 lines. How many lines are in ' + n + ' stanzas?', 7 * n, ['$7 \\times ' + n + ' = ' + 7 * n + '$.']); }
  if (r < 0.6) { var m = R.int(lv === 1 ? 2 : 30, lv === 1 ? 10 : 260); return H.num('A passage of Troilus and Criseyde has ' + 7 * m + ' lines, all in rhyme royal. How many stanzas is it?', m, ['$' + 7 * m + ' \\div 7 = ' + m + '$.']); }
  var k = R.int(1, 7), right = RR[k - 1], all = ['A', 'B', 'C'];
  if (lv >= 2 && R.coin()) { var L = R.int(8, 70), pos = (L - 1) % 7 + 1; return H.mc('The poem begins with a full stanza at line 1 and continues in rhyme royal (ABABBCC). What rhyme letter does <b>line ' + L + '</b> have within its stanza?', RR[pos - 1], all.filter(function (x) { return x !== RR[pos - 1]; }), ['Line ' + L + ' is line ' + pos + ' of its stanza (' + L + ' = 7 × ' + Math.floor((L - 1) / 7) + ' + ' + pos + ').', 'In ABABBCC, position ' + pos + ' is ' + RR[pos - 1] + '.'], { hint: 'Divide by 7 and look at the remainder.' }); }
  return H.mc('Rhyme royal rhymes ABABBCC. What letter is <b>line ' + k + '</b> of a stanza?', right, all.filter(function (x) { return x !== right; }), ['A B A B B C C: line ' + k + ' is ' + right + '.']);
}
var GL = [['sorwe', 'sorrow'], ['wele', 'happiness, well-being'], ['eek', 'also'], ['er', 'before'], ['tendyte', 'to write, to compose'], ['wepen', 'weep'], ['sondry', 'different, various'], ['usages', 'customs'], ['tho', 'then'], ['spedde', 'succeeded']];
var B = {
  facts: [
    ['Troilus and Criseyde has five books.', true, 'Books I to V.'],
    ['Chaucer took the story directly from Homer\'s Iliad.', false, 'It grew up in the Middle Ages; Chaucer used Boccaccio\'s Il Filostrato.'],
    ['Pandarus is Criseyde\'s uncle.', true, 'And Troilus\'s friend.'],
    ['Criseyde returns to Troy within ten days, as she promised.', false, 'She stays in the Greek camp.'],
    ['Chaucer translated Boethius\'s Consolation of Philosophy.', true, 'Its ideas about Fortune run through the poem.'],
    ['Chaucer claims to follow an old writer called Lollius, who did not exist.', true, 'A playful invention.'],
    ['The poem is written in heroic couplets.', false, 'It is in seven-line rhyme royal stanzas.'],
    ['At the end, Troilus\'s spirit laughs at the grief of those weeping for him.', true, 'Seen from the eighth sphere.'],
    ['Chaucer\'s narrator condemns Criseyde harshly.', false, 'He says he would excuse her if he could.'],
    ['Chaucer wrote Troilus before the Canterbury Tales.', true, 'In the 1380s.']
  ],
  items: [
    { q: 'What image of life shapes the poem, taken from Boethius?', r: 'The wheel of Fortune', w: ['The ladder of saints', 'The tree of life', 'The river of time'], why: 'Troilus rises and falls on it.' },
    { q: 'Why is Criseyde sent to the Greek camp?', r: 'Troy trades her for a captured Trojan, Antenor', w: ['She is captured in battle', 'She runs away', 'Troilus sends her for safety'], why: 'Book IV.' },
    { q: 'What does Troilus argue alone in the temple in Book IV?', r: 'That if God foresees everything, he cannot be free', w: ['That Troy will win the war', 'That Pandarus lied', 'That the gods do not exist'], why: 'An argument from Boethius.' },
    { q: 'Who are the two friends Chaucer asks to correct the poem at its end?', r: 'John Gower and Ralph Strode', w: ['Dante and Petrarch', 'Boccaccio and Homer', 'Henry II and Becket'], why: '"Moral Gower" and "philosophical Strode."' },
    { q: 'What does Chaucer say about language at the start of Book II?', r: 'Ways of speaking change within a thousand years', w: ['English will never change', 'Only Latin is worth writing', 'Old words are always better'], why: '"In forme of speche is chaunge."' },
    { q: 'Which later writer retold the story as a darker play?', r: 'Shakespeare, in Troilus and Cressida', w: ['Milton', 'Dante', 'Virgil'], why: 'Later on this ladder.' }
  ]
};
H.T(ID, B, [famSeq(EV, 'the events of the story', 'event'), famSeq(EV, 'the events of the story', 'event'), famPairs(BOOK, function (a) { return 'In which book does this happen? <b>' + a + '</b>'; }), famPairs(WHO, function (a) { return 'Who is <b>' + a + '</b> in Troilus and Criseyde?'; }, function (b) { return 'Who is ' + b + '?'; }), famRR, famRR, famPairs(GL, function (a) { return 'In Chaucer\'s Middle English, what does <b><i>' + a + '</i></b> mean?'; })].concat(dateFams(ID)), 0.64);
