/* gbgreeks.sophocles-oedipus: practice generator (gbe1). Bank plus computed families: who says or does what (from our own summaries),
   story order, key terms, years between dated events (BC/AD, no year zero), ages, and the ladder-wide date families. */
/* gbe1 shared families (copied into each Greek literature/history rung):
   said (who says or does this, from our own summaries), seq (story order), terms (key words both ways),
   span (years between two dated events, with no year zero between 1 BC and AD 1), age (how old was someone). */
function yrs(y) { return y < 0 ? (-y) + ' BC' : 'AD ' + y; }
function famSaid(R, lv, SAID) {
  var it = R.pick(SAID), others = H.uniq(SAID.map(function (s) { return s[0]; }).filter(function (n) { return n !== it[0]; }));
  return H.mc('Who says or does this (in our summary)? <i>' + it[1] + '</i>', it[0], H.samp(R, others, lv === 1 ? 2 : 3), [it[0] + ': ' + it[1]]);
}
function famSeq(R, lv, SEQ, what) {
  var k = lv === 1 ? 2 : lv === 2 ? 3 : 4, idx = R.sample(SEQ.map(function (_, i) { return i; }), k).sort(function (a, b) { return a - b; });
  var ev = idx.map(function (i) { return SEQ[i]; });
  if (k === 2) { var first = R.coin(); return H.mc('In ' + what + ', which happens <b>' + (first ? 'first' : 'later') + '</b>?', first ? ev[0] : ev[1], [first ? ev[1] : ev[0]], [ev[0] + ' comes before: ' + ev[1] + '.']); }
  var right = ev.join(' → '), w = [], t = 0;
  while (w.length < 3 && t++ < 30) { var s = R.shuffle(ev.slice()).join(' → '); if (s !== right && w.indexOf(s) < 0) w.push(s); }
  return H.mc('Which list puts these events of ' + what + ' in the order they happen?', right, w, ev.map(function (e, i) { return (i + 1) + '. ' + e; }), { hint: 'Find the first event, then the next.' });
}
function famTerms(R, lv, TERMS) {
  var it = R.pick(TERMS), others = TERMS.filter(function (x) { return x !== it; });
  if (R.coin()) return H.mc('Which best describes <b>' + it[0] + '</b>?', it[1], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[1]; }), [it[0] + ': ' + it[1] + '.']);
  return H.mc('Which word or name fits? <i>' + it[1] + '</i>', it[0], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[0]; }), [it[0] + ': ' + it[1] + '.']);
}
function famSpan(R, lv, EV) {
  var a, b, t = 0;
  do { var p = R.sample(EV, 2).sort(function (x, y) { return x[0] - y[0]; }); a = p[0]; b = p[1]; t++; } while (t < 20 && (a[0] === b[0] || (lv === 1 && b[0] > 0 && a[0] < 0)));
  var cross = a[0] < 0 && b[0] > 0, d = b[0] - a[0] - (cross ? 1 : 0);
  var steps = cross ? ['From ' + yrs(a[0]) + ' to 1 BC is ' + (-a[0] - 1) + ' years; from 1 BC to AD 1 is 1 year; from AD 1 to ' + yrs(b[0]) + ' is ' + (b[0] - 1) + ' years.', 'There is no year zero, so the total is ' + (-a[0] - 1) + ' + 1 + ' + (b[0] - 1) + ' = ' + d + '.']
    : a[0] < 0 && b[0] < 0 ? ['Both dates are BC, so count down: ' + (-a[0]) + ' − ' + (-b[0]) + ' = ' + d + '.'] : [b[0] + ' − ' + a[0] + ' = ' + d + '.'];
  return H.num('How many years passed between ' + a[1] + ' (' + yrs(a[0]) + ') and ' + b[1] + ' (' + yrs(b[0]) + ')?', d, steps, { hint: cross ? 'Remember: 1 BC is followed by AD 1.' : 'BC years count down toward AD 1.' });
}
function famAge(R, lv, AGE) {
  var it = R.pick(AGE), d = it[3] - it[1];
  return H.num(it[0] + ' was born about ' + yrs(it[1]) + '. About how old was ' + it[2] + ' in ' + yrs(it[3]) + ', when ' + it[4] + '?', d, [yrs(it[1]) + ' to ' + yrs(it[3]) + ': ' + (-it[1]) + ' − ' + (-it[3]) + ' = ' + d + ' years.'], { hint: 'BC years count down, so subtract the later (smaller) number from the earlier one.' });
}
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var GREEKS = ['gbgreeks.homer-iliad', 'gbgreeks.homer-odyssey', 'gbgreeks.aeschylus-oresteia', 'gbgreeks.sophocles-oedipus', 'gbgreeks.euripides-plays', 'gbgreeks.aristophanes-comedies', 'gbgreeks.herodotus-histories', 'gbgreeks.thucydides-peloponnesian-war'];
var ID = 'gbgreeks.sophocles-oedipus';
var SAID = [['Antigone', 'Buries her brother against the king\'s order, citing the unwritten laws of the gods.'], ['Creon', 'Forbids the burial of a prince who attacked his own city.'], ['Oedipus', 'Vows to find the killer of the old king, whoever he is.'],
  ['Tiresias', 'A blind prophet who sees the truth and warns the king.'], ['Jocasta', 'Tells the king not to trust prophecies, then begs him to stop asking questions.'], ['Haemon', 'Pleads with his father to listen to the people of the city.'],
  ['Ismene', 'Tells her sister that they are too weak to defy the king.'], ['The chorus', 'Sings that there are many wonders and none more wonderful than man.'], ['The shepherd', 'Admits that he once saved a baby he was told to leave on the mountain.']];
var SEQ = ['A plague strikes Thebes', 'Creon brings the oracle\'s answer', 'Tiresias accuses the king', 'Jocasta tells of the old prophecy', 'A messenger arrives from Corinth', 'The old shepherd tells the truth', 'Oedipus learns who he is'];
var SEQ2 = ['Creon forbids the burial', 'Antigone buries her brother', 'Antigone is brought before Creon', 'Haemon pleads with his father', 'Tiresias warns Creon', 'Creon changes his mind, too late'];
var TERMS = [['peripeteia', 'reversal: a turn of fortune to its opposite'], ['anagnorisis', 'recognition: a change from ignorance to knowledge'], ['unwritten laws', 'laws Antigone says come from the gods and outlast any ruler\'s decree'], ['Sphinx', 'the monster whose riddle Oedipus solved'],
  ['Tyrannus', 'in Greek, a ruler who gained power himself rather than by inheritance'], ['Colonus', 'Sophocles\' home, just outside Athens, and the setting of his last play'], ['third actor', 'Aristotle says Sophocles added it to tragedy'], ['orchestra', 'the round dancing floor of the chorus']];
var EV = [[-496, 'Sophocles\' birth'], [-480, 'the battle of Salamis'], [-441, 'Antigone'], [-429, 'Oedipus the King'], [-409, 'Philoctetes'], [-406, 'Sophocles\' death'], [-401, 'Oedipus at Colonus staged']];
var AGE = [['Sophocles', -496, 'he', -441, 'Antigone was staged'], ['Sophocles', -496, 'he', -429, 'Oedipus the King was staged'], ['Sophocles', -496, 'he', -409, 'Philoctetes won first prize'], ['Sophocles', -496, 'he', -480, 'the Greeks won at Salamis']];
var LOGIC = [
  ['Antigone\'s argument: The king\'s edict goes against the unwritten laws of the gods. No mortal decree can override the laws of the gods. So…', 'the edict does not bind her', ['the gods agree with the king', 'she must obey the edict', 'the edict is a law of the gods']],
  ['Creon\'s argument: A city cannot survive if its laws are disobeyed. Antigone disobeyed the law. So, Creon concludes…', 'she must be punished, or the city is in danger', ['the law was wrong', 'the gods will punish him', 'Antigone is innocent']],
  ['The chorus: Call no one happy until they have crossed life\'s border free from pain. Oedipus once seemed the happiest of men. So…', 'seeming happy was no proof that he was', ['he was truly happy all along', 'the gods hated him from birth', 'no one is ever unhappy']]
];
function famLogic(R, lv) { var it = R.pick(LOGIC); return H.mc(it[0], it[1], H.samp(R, it[2], lv === 1 ? 2 : 3), ['The conclusion that follows from these premises: ' + it[1] + '.']); }
var B = {
  facts: [
    ['Sophocles\' three Theban plays were written as a trilogy for one festival.', false, 'They were written many years apart.'],
    ['Oedipus blinds himself on stage in full view.', false, 'It happens offstage and is reported by a messenger.'],
    ['Antigone defies Creon to bury her brother.', true, 'She says the gods\' unwritten laws come first.'],
    ['Aristotle held up Oedipus the King as a model tragedy.', true, 'Reversal and recognition come together.'],
    ['Sophocles served as one of the generals of Athens.', true, 'Around 441 BC, with Pericles.'],
    ['Oedipus knew all along who his parents were.', false, 'He acts in ignorance; the play is his discovery.'],
    ['Creon changes his mind in time to save Antigone.', false, 'He relents too late.'],
    ['Seven of Sophocles\' plays survive.', true, 'Out of about 123.']
  ],
  items: [
    { q: 'Why does Oedipus begin his investigation?', r: 'An oracle says the plague will end when the old king\'s killer is found', w: ['He wants to find his real parents', 'Creon accuses him', 'The Sphinx returns'], why: 'He vows to find the killer of Laius.' },
    { q: 'What reason does Antigone give for breaking Creon\'s law?', r: 'The unwritten laws of the gods come before any ruler\'s decree', w: ['Her brother was innocent', 'The people told her to', 'Creon is not the real king'], why: 'They are "not of today or yesterday, but for all time".' },
    { q: 'What does Aristotle praise most in Oedipus the King?', r: 'The reversal and the recognition coming at the same moment', w: ['Its happy ending', 'Its large cast', 'Its songs'], why: 'The messenger who comes to bring good news brings the opposite.' },
    { q: 'How did Hegel read Antigone?', r: 'As a clash between two real goods, each pushed too far', w: ['As a simple story of good against evil', 'As a comedy', 'As a history of Thebes'], why: 'Family and gods against the order of the city.' },
    { q: 'What did Sophocles add to Greek tragedy, according to Aristotle?', r: 'A third actor', w: ['Masks', 'The chorus', 'Comedy'], why: 'Aeschylus had added the second.' }
  ]
};
H.T(ID, B, [function (R, lv) { return famSaid(R, lv, SAID); }, function (R, lv) { return famSeq(R, lv, SEQ, 'Oedipus the King'); }, function (R, lv) { return famSeq(R, lv, SEQ2, 'Antigone'); }, function (R, lv) { return famTerms(R, lv, TERMS); },
  function (R, lv) { return famAge(R, lv, AGE); }, function (R, lv) { return famSpan(R, lv, EV); }, famLogic].concat(dateFams(ID).slice(0, 2)), 0.62);
