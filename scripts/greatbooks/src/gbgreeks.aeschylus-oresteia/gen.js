/* gbgreeks.aeschylus-oresteia: practice generator (gbe1). Bank plus computed families: who says or does what (from our own summaries),
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
var ID = 'gbgreeks.aeschylus-oresteia';
var SAID = [['Athena', 'Founds a court of citizen jurors on the Hill of Ares and casts the deciding vote.'], ['Clytemnestra', 'Welcomes her husband home with a purple carpet.'], ['Cassandra', 'Foresees her own death, and no one believes her.'],
  ['Orestes', 'Returns in secret to avenge his father at Apollo\'s command.'], ['Electra', 'Recognizes her brother by a lock of hair on their father\'s tomb.'], ['The Furies', 'Hunt a man for shedding his mother\'s blood, then accept a home in Athens.'],
  ['The watchman', 'Waits on the palace roof for the beacon fire that means Troy has fallen.'], ['Apollo', 'Defends Orestes at his trial and says he ordered the deed.'], ['Aegisthus', 'Joins the queen in her plot and claims revenge for his father Thyestes.']];
var SEQ = ['The beacon fire signals that Troy has fallen', 'Agamemnon walks on the purple carpet', 'Cassandra foretells her death', 'Orestes and Electra meet at the tomb', 'Orestes avenges his father', 'The Furies pursue Orestes to Delphi', 'Athena founds the court', 'The jury\'s votes are counted', 'The Furies become the Kindly Ones'];
var TERMS = [['trilogy', 'three plays performed together on one theme'], ['Erinyes', 'the Furies, ancient goddesses of revenge for crimes against kin'], ['Eumenides', '"the Kindly Ones", the Furies\' new name'], ['Areopagus', 'the Hill of Ares in Athens, seat of the court Athena founds'],
  ['satyr play', 'a comic play performed after a tragic trilogy'], ['libation', 'an offering of liquid poured for the gods or the dead'], ['chorus', 'the group who sing and dance between the scenes'], ['City Dionysia', 'the spring festival in Athens where tragedies competed']];
var EV = [[-525, 'Aeschylus\' birth'], [-490, 'the battle of Marathon'], [-480, 'the battle of Salamis'], [-472, 'The Persians'], [-462, 'the reforms of the Areopagus'], [-458, 'the Oresteia'], [-456, 'Aeschylus\' death']];
var AGE = [['Aeschylus', -525, 'he', -490, 'he fought at Marathon'], ['Aeschylus', -525, 'he', -458, 'the Oresteia won first prize'], ['Aeschylus', -525, 'he', -480, 'the Greeks won at Salamis']];
var B = {
  facts: [
    ['The Oresteia is the only complete Greek tragic trilogy that survives.', true, 'Its satyr play is lost.'],
    ['Agamemnon\'s death is acted out in full view of the audience.', false, 'It happens offstage; the audience hears it.'],
    ['Athena decides Orestes\' case entirely by herself.', false, 'She founds a jury of citizens; she casts the deciding vote in a tie.'],
    ['The Furies are driven out of Athens at the end.', false, 'They accept an honored home there as the Eumenides.'],
    ['Aeschylus fought at the battle of Marathon.', true, 'His brother died there.'],
    ['Aristotle says Aeschylus added a second actor.', true, 'That made real dialogue possible.'],
    ['Clytemnestra says she killed Agamemnon to avenge their daughter Iphigenia.', true, 'He had sacrificed her at Aulis.'],
    ['All 90 or so of Aeschylus\' plays survive.', false, 'Only seven survive.']
  ],
  items: [
    { q: 'How does the Oresteia end the chain of revenge?', r: 'A court hears both sides and the jury\'s vote decides', w: ['Orestes is killed by the Furies', 'Zeus strikes everyone with lightning', 'Electra forgives her mother'], why: 'Justice passes from the family to a public court.' },
    { q: 'Why did Agamemnon sacrifice Iphigenia?', r: 'To get winds for the fleet sailing to Troy', w: ['To win a chariot race', 'Because an oracle said she would betray him', 'To end a plague in Argos'], why: 'The goddess Artemis held back the winds at Aulis.' },
    { q: 'What happens when the jury\'s votes are counted?', r: 'They are equal, and Athena\'s vote frees Orestes', w: ['Every juror votes guilty', 'The Furies refuse to let them be counted', 'Apollo changes the votes'], why: 'The tie goes to the defendant.' },
    { q: 'Who sets the chain of murders going generations earlier?', r: 'Atreus, who wronged his brother Thyestes\' children', w: ['Orestes', 'Helen', 'Athena'], why: 'Thyestes cursed the house of Atreus.' },
    { q: 'What is the chorus\'s lesson about Zeus in Agamemnon?', r: 'Wisdom comes by suffering', w: ['The strong always win', 'The gods do not care', 'Only kings are wise'], why: 'Zeus "has established as a fixed law that wisdom comes by suffering".' }
  ]
};
H.T(ID, B, [function (R, lv) { return famSaid(R, lv, SAID); }, function (R, lv) { return famSeq(R, lv, SEQ, 'the Oresteia'); }, function (R, lv) { return famTerms(R, lv, TERMS); }, function (R, lv) { return famSpan(R, lv, EV); },
  function (R, lv) { return famAge(R, lv, AGE); }].concat(dateFams(ID).slice(0, 2)), 0.6);
