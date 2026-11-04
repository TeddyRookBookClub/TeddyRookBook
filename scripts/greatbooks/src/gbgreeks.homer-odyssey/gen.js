/* gbgreeks.homer-odyssey: practice generator (gbe1). Bank plus computed families: who says or does what (from our own summaries),
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
var ID = 'gbgreeks.homer-odyssey';
var SAID = [['Odysseus', 'Tells the Cyclops that his name is "Noman".'], ['Penelope', 'Weaves a burial cloth by day and unpicks it by night to put off the suitors.'],
  ['Telemachus', 'Travels to Pylos and Sparta for news of his father.'], ['Athena', 'Disguises the hero as an old beggar when he reaches home.'], ['Calypso', 'Offers to make him immortal if he will stay on her island.'],
  ['Polyphemus', 'Prays to his father Poseidon to punish the man who blinded him.'], ['Circe', 'Turns the scouts into pigs, then later warns of the dangers ahead.'], ['Argos', 'Knows his master after twenty years, wags his tail, and dies.'],
  ['Eurycleia', 'Recognizes the old beggar by a scar on his leg.'], ['Nausicaa', 'Finds the shipwrecked stranger on the beach and shows him the way to her father\'s palace.'], ['Aeolus', 'Gives Odysseus all the storm winds tied in a bag.']];
var SEQ = ['The Cicones', 'The Lotus-eaters', 'The Cyclops', 'Aeolus and the bag of winds', 'The Laestrygonians', 'Circe', 'The land of the dead', 'The Sirens', 'Scylla and Charybdis', 'The cattle of the Sun', 'Calypso\'s island', 'The Phaeacians'];
var SEQ2 = ['Telemachus sets out for news', 'Calypso lets Odysseus go', 'Odysseus tells his story to the Phaeacians', 'He wakes on Ithaca', 'Argos the dog knows him', 'The contest of the bow', 'Penelope tests him with the bed'];
var TERMS = [['xenia', 'guest-friendship: the duty to welcome and help strangers'], ['polytropos', '"of many turns", Odysseus\' epithet for his cunning'], ['nostos', 'a homecoming, the subject of the poem'], ['Telemachy', 'Books 1–4, which follow Telemachus'],
  ['suitors', 'the young men who want to marry Penelope'], ['Ithaca', 'Odysseus\' island kingdom'], ['Phaeacians', 'the seafaring people who carry Odysseus home'], ['Ulysses', 'the Latin form of the name Odysseus']];
var EV = [[-1184, 'the traditional fall of Troy'], [-725, 'the Odyssey taking shape'], [-250, 'Eratosthenes\' joke about the bag of winds'], [1842, 'Tennyson\'s "Ulysses"'], [1900, 'Butler\'s translation'], [1320, 'Dante\'s Divine Comedy finished']];
var B = {
  facts: [
    ['Odysseus spends all twenty years away at sea.', false, 'Ten were the war; seven of the ten years home were on Calypso\'s island.'],
    ['The poem begins with Odysseus\' son, Telemachus.', true, 'Books 1–4.'],
    ['Odysseus tells the story of his wanderings himself, to the Phaeacians.', true, 'Books 9–12.'],
    ['Poseidon is angry with Odysseus for blinding his son, the Cyclops.', true, 'That is why the journey takes so long.'],
    ['Penelope recognizes Odysseus the moment he walks in.', false, 'She tests him with the secret of their bed.'],
    ['Odysseus\' crew opened the bag of winds thinking it held gold.', true, 'Just as Ithaca came in sight.'],
    ['Odysseus accepts Calypso\'s offer of immortality.', false, 'He chooses to go home.'],
    ['The locations of Odysseus\' adventures are known for certain.', false, 'They have been argued over since ancient times.'],
    ['Odysseus strings the great bow that none of the suitors can string.', true, 'Book 21.']
  ],
  items: [
    { q: 'Why does Odysseus tell the Cyclops his name is "Noman"?', r: 'So the giant will shout "Noman is hurting me" and get no help', w: ['Because he is ashamed of his real name', 'To make the Cyclops laugh', 'Because Athena told him to forget it'], why: 'The other Cyclopes think nothing is wrong.' },
    { q: 'How does Penelope delay the suitors for years?', r: 'She unpicks at night the cloth she weaves by day', w: ['She hides on another island', 'She sets them impossible riddles', 'She says Odysseus wrote that he was coming'], why: 'She said she would choose when the cloth was finished.' },
    { q: 'How does Penelope finally test the stranger?', r: 'She asks for their bed to be moved; he knows it is built around a living olive tree', w: ['She asks him to string the bow', 'She asks his name', 'She sends Argos to sniff him'], why: 'Only the two of them knew the secret.' },
    { q: 'What do the Lotus-eaters\' fruit do to those who eat it?', r: 'Make them forget all wish to go home', w: ['Turn them into pigs', 'Make them fall asleep for years', 'Make them immortal'], why: 'Odysseus drags his scouts back to the ships.' },
    { q: 'How does Odysseus hear the Sirens and survive?', r: 'He has himself tied to the mast while his crew plug their ears with wax', w: ['He sails past at night', 'He sings louder than they do', 'Circe charms the Sirens to sleep'], why: 'Circe told him how.' },
    { q: 'What rule does the Odyssey test again and again?', r: 'Guest-friendship: treat strangers and guests well', w: ['Always obey the eldest', 'Never sail in winter', 'Honor the dead with games'], why: 'Xenia, protected by Zeus.' }
  ]
};
H.T(ID, B, [function (R, lv) { return famSaid(R, lv, SAID); }, function (R, lv) { return famSeq(R, lv, SEQ, 'Odysseus\' voyage'); }, function (R, lv) { return famSeq(R, lv, SEQ2, 'the Odyssey'); }, function (R, lv) { return famTerms(R, lv, TERMS); },
  function (R, lv) { return famSpan(R, lv, EV); }].concat(dateFams(ID).slice(0, 2)), 0.6);
