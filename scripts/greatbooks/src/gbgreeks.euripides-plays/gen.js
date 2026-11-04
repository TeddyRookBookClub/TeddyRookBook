/* gbgreeks.euripides-plays: practice generator (gbe1). Bank plus computed families: who says or does what (from our own summaries),
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
var ID = 'gbgreeks.euripides-plays';
var PLAYS = [['Alcestis', 'A wife agrees to die in her husband\'s place, and Heracles brings her back from Death.', -438], ['Medea', 'A foreign princess abandoned by Jason takes a terrible revenge.', -431],
  ['Hippolytus', 'A young man\'s vow and his stepmother\'s secret love destroy a family.', -428], ['The Trojan Women', 'The queens and princesses of Troy wait to learn which Greeks will take them as captives.', -415],
  ['Helen', 'The real Helen spent the war in Egypt; only a phantom went to Troy.', -412], ['The Bacchae', 'The god Dionysus comes to Thebes and punishes the king who rejects him.', -405]];
function famPlay(R, lv) {
  var it = R.pick(PLAYS), others = PLAYS.filter(function (p) { return p !== it; });
  if (lv === 3 && R.coin()) { var p = R.sample(PLAYS, 3).sort(function (a, b) { return a[2] - b[2]; }), right = p.map(function (x) { return x[0]; }).join(' → '), w = [], t = 0; while (w.length < 3 && t++ < 20) { var s = R.shuffle(p.slice()).map(function (x) { return x[0]; }).join(' → '); if (s !== right && w.indexOf(s) < 0) w.push(s); } return H.mc('Which list puts these plays of Euripides in order of first performance?', right, w, p.map(function (x) { return x[0] + ': ' + yrs(x[2]) + (x[2] === -405 ? ' (after his death)' : '') + '.'; })); }
  return H.mc('Which play is this? <i>' + it[1] + '</i>', it[0], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[0]; }), [it[0] + ' (' + yrs(it[2]) + ').']);
}
var SAID = [['Hecuba', 'Asks what a poet could write on the tomb of a child killed out of fear.'], ['Medea', 'Speaks bitterly about how wives and foreigners are treated.'], ['The nurse', 'Wishes the ship Argo had never sailed for the Golden Fleece.'],
  ['Heracles', 'Wrestles Death to bring a queen back to her husband.'], ['Dionysus', 'Comes to Thebes in disguise to prove he is a god.'], ['Aristotle', 'Calls Euripides "the most tragic of the poets".'], ['Aristophanes', 'Mocks Euripides in The Frogs as a clever talker.']];
var TERMS = [['deus ex machina', '"a god from the machine": an ending where a god appears to settle things'], ['mēchanē', 'the stage crane that could lift an actor playing a god'], ['satyr play', 'a comic play; The Cyclops is Euripides\' only surviving one'], ['agon', 'a formal debate between two characters'],
  ['Colchis', 'Medea\'s homeland, on the Black Sea'], ['Argives', 'Greeks, in the language of the plays'], ['Archelaus', 'the king of Macedon at whose court Euripides died']];
var EV = [[-480, 'the battle of Salamis'], [-438, 'Alcestis'], [-431, 'Medea'], [-416, 'the siege of Melos'], [-415, 'The Trojan Women'], [-413, 'the Athenian disaster in Sicily'], [-406, 'Euripides\' death'], [-405, 'The Frogs']];
var AGE = [['Euripides', -480, 'he', -431, 'Medea was staged'], ['Euripides', -480, 'he', -415, 'The Trojan Women was staged'], ['Euripides', -480, 'he', -438, 'Alcestis was staged'], ['Sophocles', -496, 'Sophocles', -431, 'Medea was staged'], ['Aeschylus', -525, 'Aeschylus', -458, 'the Oresteia was staged']];
var B = {
  facts: [
    ['Euripides won first prize more often than any other tragedian.', false, 'Only four times in his life; Sophocles won the most.'],
    ['More plays survive by Euripides than by Aeschylus and Sophocles together.', true, 'Nineteen under his name, against seven each.'],
    ['In Euripides\' Helen, the real Helen never went to Troy.', true, 'A phantom went instead.'],
    ['Euripides died at the court of the king of Macedon.', true, 'Archelaus, in 406 BC.'],
    ['The Trojan Women celebrates the Greek victory at Troy.', false, 'It shows the suffering of the defeated.'],
    ['Greek tragedies usually showed killings on stage.', false, 'Violence happened offstage and was reported.'],
    ['Plutarch tells that some Athenian captives in Sicily were helped because they could recite Euripides.', true, 'In his Life of Nicias.']
  ],
  items: [
    { q: 'What was new about Euripides\' way with the old myths?', r: 'He told them from the side of victims, women and outsiders', w: ['He set them in the future', 'He removed the gods completely', 'He wrote them as comedies'], why: 'He asked the audience to see from below.' },
    { q: 'What does "deus ex machina" mean?', r: 'A god from the machine: a sudden ending by a god', w: ['A machine that writes plays', 'The god of theater', 'A chorus of gods'], why: 'From the crane that lifted actors playing gods.' },
    { q: 'What happened in the year before The Trojan Women was staged?', r: 'Athens captured the island of Melos', w: ['Athens lost the war', 'The Persians invaded', 'Socrates was tried'], why: 'Melos fell in 416 BC; the play is from 415 BC.' },
    { q: 'What did Sophocles reportedly say about himself and Euripides?', r: 'He showed people as they ought to be; Euripides as they are', w: ['That Euripides was his teacher', 'That they never met', 'That Euripides wrote only comedies'], why: 'Reported in Aristotle\'s Poetics.' }
  ]
};
H.T(ID, B, [famPlay, famPlay, function (R, lv) { return famSaid(R, lv, SAID); }, function (R, lv) { return famTerms(R, lv, TERMS); }, function (R, lv) { return famSpan(R, lv, EV); }, function (R, lv) { return famAge(R, lv, AGE); },
  function (R, lv) { return H.famOrder(R, lv, GREEKS); }].concat(dateFams(ID).slice(0, 2)), 0.62);
