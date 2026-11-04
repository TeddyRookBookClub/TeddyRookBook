/* gbgreeks.herodotus-histories: practice generator (gbe1). Bank plus computed families: who says or does what (from our own summaries),
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
var ID = 'gbgreeks.herodotus-histories';
var EV = [[-499, 'the Ionian Revolt'], [-494, 'the fall of Miletus'], [-490, 'the battle of Marathon'], [-480, 'Thermopylae and Salamis'], [-479, 'Plataea and Mycale'], [-484, 'Herodotus\' birth'], [-443, 'the founding of Thurii'], [-430, 'the Histories published'], [-546, 'the fall of Croesus'], [-522, 'Darius becomes king']];
var SEQ = ['The fall of Croesus', 'The Ionian Revolt', 'The burning of Sardis', 'The fall of Miletus', 'The battle of Marathon', 'Xerxes crosses the Hellespont', 'Thermopylae', 'Salamis', 'Plataea'];
var SAID = [['Solon', 'Tells a rich king not to call anyone happy until the end of life.'], ['Croesus', 'Asks who is the happiest man in the world, expecting to hear his own name.'], ['Dieneces', 'Says that if Persian arrows hide the sun, they will fight in the shade.'],
  ['Demaratus', 'Tells Xerxes that the Spartans are free but fear their law.'], ['Leonidas', 'Holds the pass at Thermopylae and sends most of the allies away.'], ['Themistocles', 'Reads the oracle\'s "wooden wall" as the Athenian fleet.'],
  ['Xerxes', 'Bridges the Hellespont with boats and digs a canal through Athos.'], ['Ephialtes', 'Shows the Persians a mountain path around the pass.'], ['Darius', 'Sends a fleet across the Aegean to punish Athens and Eretria.']];
var WHERE = [['Marathon', 'where the Athenians and Plataeans beat Darius\' army in 490 BC'], ['Thermopylae', 'the narrow pass Leonidas held for three days'], ['Salamis', 'the strait where the Greek fleet won in 480 BC'], ['Plataea', 'where the Greek land army beat Mardonius in 479 BC'],
  ['Halicarnassus', 'Herodotus\' home city, modern Bodrum'], ['Sardis', 'the Lydian capital, burned in the Ionian Revolt'], ['the Hellespont', 'the strait Xerxes\' army crossed on bridges of boats'], ['Delphi', 'the oracle that told Athens to trust its "wooden wall"'], ['Egypt', 'the subject of Book II']];
var AGE = [['Herodotus', -484, 'he', -443, 'Thurii was founded'], ['Herodotus', -484, 'he', -480, 'the battle of Salamis was fought'], ['Herodotus', -484, 'he', -430, 'the Histories were being finished']];
var B = {
  facts: [
    ['The Greek word historiē meant "inquiry".', true, 'Finding out by asking.'],
    ['Herodotus believed every story he wrote down.', false, 'He often says he doesn\'t, and gives several versions.'],
    ['Cicero called Herodotus "the father of history".', true, 'In his work On the Laws.'],
    ['Herodotus was born in Athens.', false, 'In Halicarnassus, in Asia Minor.'],
    ['The Histories were divided into nine books, each named after a Muse.', true, 'By later editors.'],
    ['Herodotus wrote with contempt for every people who were not Greek.', false, 'He wrote about Persians, Egyptians and Scythians with curiosity and respect.'],
    ['Leonidas had only Spartans with him at Thermopylae.', false, 'Several thousand allies were with him at first; the Thespians stayed to the end.'],
    ['The famous marathon run to Athens appears in Herodotus.', false, 'It is a later legend; he tells of a runner sent to Sparta.']
  ],
  items: [
    { q: 'What two things does Herodotus say he wants his book to do?', r: 'Keep great deeds from being forgotten, and explain the causes of the war', w: ['Praise Athens and attack Sparta', 'Teach the Persian language', 'Prove the gods do not exist'], why: 'From his first sentence.' },
    { q: 'What is the lesson of Solon\'s talk with Croesus?', r: 'Call no one happy until you see how their life ends', w: ['Gold is the key to happiness', 'Kings are always happy', 'Never trust an Athenian'], why: 'Croesus later lost his kingdom.' },
    { q: 'How did the Persians get around the pass at Thermopylae?', r: 'A local man showed them a mountain path', w: ['They sailed around it', 'They dug a tunnel', 'The Spartans surrendered'], why: 'Ephialtes of Trachis.' },
    { q: 'How do historians today judge Herodotus?', r: 'An invaluable source who must be read with care', w: ['A complete liar', 'Always right', 'Not worth reading'], why: 'Archaeology confirms much and corrects some.' },
    { q: 'Who later wrote an essay "On the Malice of Herodotus"?', r: 'Plutarch', w: ['Thucydides', 'Cicero', 'Homer'], why: 'He accused Herodotus of bias.' }
  ]
};
H.T(ID, B, [function (R, lv) { return famSpan(R, lv, EV); }, function (R, lv) { return famSpan(R, lv, EV); }, function (R, lv) { return famSeq(R, lv, SEQ, 'the Persian Wars'); }, function (R, lv) { return famSaid(R, lv, SAID); }, function (R, lv) { return famTerms(R, lv, WHERE); },
  function (R, lv) { return famAge(R, lv, AGE); }].concat(dateFams(ID).slice(0, 2)), 0.62);
