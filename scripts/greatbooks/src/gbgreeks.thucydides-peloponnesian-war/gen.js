/* gbgreeks.thucydides-peloponnesian-war: practice generator (gbe1). Bank plus computed families: who says or does what (from our own summaries),
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
var ID = 'gbgreeks.thucydides-peloponnesian-war';
var EV = [[-431, 'the start of the war'], [-430, 'the plague in Athens'], [-427, 'the Mytilene debate'], [-425, 'Pylos'], [-424, 'the fall of Amphipolis'], [-421, 'the Peace of Nicias'], [-416, 'the siege of Melos'], [-415, 'the sailing of the Sicilian Expedition'], [-413, 'the disaster at Syracuse'], [-411, 'where the history breaks off'], [-404, 'the surrender of Athens'], [-480, 'the battle of Salamis'], [1629, 'Hobbes\'s translation']];
var SEQ = ['Sparta invades Attica', 'Pericles\' Funeral Oration', 'The plague in Athens', 'The Mytilene debate', 'Pylos and Sphacteria', 'Amphipolis falls to Brasidas', 'The Peace of Nicias', 'The Melian Dialogue', 'The Sicilian Expedition', 'Athens surrenders'];
var SAID = [['Pericles', 'Praises Athens as "the school of Hellas" at the funeral of the war dead.'], ['The Athenian envoys at Melos', 'Say that the strong do what they can and the weak suffer what they must.'], ['The Melians', 'Appeal to justice and the gods, and refuse to give up their freedom.'],
  ['Cleon', 'Urges the assembly to stick to its harsh punishment of Mytilene.'], ['Diodotus', 'Argues that mercy to Mytilene is wiser policy, and wins the vote.'], ['Brasidas', 'Marches north and takes Amphipolis.'], ['Alcibiades', 'Leads the plan to conquer Sicily, then flees to Sparta.'], ['Archidamus', 'The Spartan king who warns his people that the war will be long.'], ['Thucydides', 'Says he checked reports carefully because eyewitnesses disagree.']];
var TERMS = [['Delian League', 'Athens\' alliance of islands and coastal cities, which became its empire'], ['Peloponnesian League', 'Sparta\'s alliance'], ['Melian Dialogue', 'the debate in which Athens tells a neutral island to submit'], ['Funeral Oration', 'Pericles\' speech praising Athens and its dead'],
  ['truest cause', 'Thucydides\' phrase for the growth of Athenian power and the fear it caused in Sparta'], ['Peace of Nicias', 'the treaty of 421 BC'], ['stasis', 'civil strife within a city, as at Corcyra'], ['Attica', 'the countryside around Athens']];
var LOGIC = [
  ['The Athenians at Melos: Justice only matters between equals in power. Athens and Melos are not equals. So, the Athenians conclude…', 'justice does not matter between Athens and Melos', ['Melos is stronger than Athens', 'justice always matters', 'Athens must leave Melos alone']],
  ['Diodotus on Mytilene: Harsh punishment does not stop cities from revolting. If it doesn\'t stop revolts, it is not useful. So…', 'harsh punishment of Mytilene is not useful', ['Mytilene is innocent', 'Athens should give up its empire', 'all punishment is wrong']],
  ['Thucydides: Witnesses of the same event often disagree. So, a careful historian must…', 'check each report against others', ['trust the first witness', 'only use speeches', 'leave the event out']]
];
function famLogic(R, lv) { var it = R.pick(LOGIC); return H.mc(it[0], it[1], H.samp(R, it[2], lv === 1 ? 2 : 3), ['The conclusion that follows from the premises: ' + it[1] + '. Whether the premises are true is another question, which Thucydides leaves to the reader.']); }
var B = {
  facts: [
    ['Thucydides\' history covers the whole war to 404 BC.', false, 'It breaks off in 411 BC; Xenophon tells the end.'],
    ['Thucydides caught the plague and recovered.', true, 'He describes it so it could be recognized again.'],
    ['Thucydides says his speeches are word-for-word records.', false, 'He says they give what was most likely said, or what the occasion called for.'],
    ['Thucydides was exiled after Amphipolis fell to Brasidas.', true, 'For twenty years.'],
    ['Sparta won the Peloponnesian War.', true, 'Athens surrendered in 404 BC.'],
    ['The Sicilian Expedition was a great Athenian victory.', false, 'It ended in disaster at Syracuse in 413 BC.'],
    ['Thomas Hobbes made an English translation of Thucydides.', true, 'Published in 1629.'],
    ['Thucydides explains events by the anger of the gods.', false, 'He looks for human causes.']
  ],
  items: [
    { q: 'What does Thucydides call the truest cause of the war?', r: 'The growth of Athenian power and the fear it caused in Sparta', w: ['A quarrel over a stolen queen', 'The plague', 'A Persian plot'], why: 'Book I, set apart from the stated quarrels.' },
    { q: 'Why did Thucydides hope his work would be useful in the future?', r: 'Because human nature makes such things happen again', w: ['Because the war would never end', 'Because he predicted the future', 'Because he wrote laws'], why: '"A possession for all time".' },
    { q: 'What did Pericles advise the Athenians to do when Sparta invaded?', r: 'Move inside the city walls and use the fleet', w: ['March out and fight a pitched battle', 'Surrender at once', 'Flee to Sicily'], why: 'Athens was strong at sea, Sparta on land.' },
    { q: 'What happened at Melos in 416 BC?', r: 'Athens demanded the neutral island submit, and destroyed it when it refused', w: ['Melos defeated the Athenian fleet', 'Melos joined Sparta and won', 'The two sides made peace'], why: 'Book V, the Melian Dialogue.' },
    { q: 'Who continued the story of the war after Thucydides\' history breaks off?', r: 'Xenophon', w: ['Herodotus', 'Homer', 'Plato'], why: 'In his Hellenica.' }
  ]
};
H.T(ID, B, [function (R, lv) { return famSpan(R, lv, EV); }, function (R, lv) { return famSeq(R, lv, SEQ, 'the war'); }, function (R, lv) { return famSaid(R, lv, SAID); }, function (R, lv) { return famTerms(R, lv, TERMS); }, famLogic].concat(dateFams(ID).slice(0, 2)), 0.62);
