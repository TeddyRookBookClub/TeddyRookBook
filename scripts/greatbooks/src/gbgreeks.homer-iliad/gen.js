/* gbgreeks.homer-iliad: practice generator (gbe1). Bank plus computed families: who says or does what (from our own summaries),
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
var ID = 'gbgreeks.homer-iliad';
var SAID = [['Achilles', 'Refuses the embassy\'s gifts and will not return to the fighting.'], ['Agamemnon', 'Takes Briseis from Achilles to make up for the captive he had to return.'],
  ['Hector', 'Prays that his baby son will one day be called far better than his father.'], ['Priam', 'Kneels before his son\'s killer and asks him to think of his own father.'],
  ['Patroclus', 'Goes into battle wearing Achilles\' armor.'], ['Thetis', 'Asks Zeus to let the Trojans win until the Greeks honor her son.'],
  ['Andromache', 'Begs her husband not to leave her a widow and their son an orphan.'], ['Hephaestus', 'Makes Achilles a new shield showing a city at peace and a city at war.'],
  ['Helen', 'Names the Greek heroes for Priam from the wall of Troy.'], ['Odysseus', 'Leads the embassy to Achilles and later goes on a night raid with Diomedes.']];
var SEQ = ['Agamemnon takes Briseis', 'Paris and Menelaus fight a duel', 'Hector says goodbye to Andromache', 'The embassy to Achilles', 'Patroclus is killed', 'Hephaestus makes the new shield', 'Achilles kills Hector', 'The funeral games for Patroclus', 'Priam ransoms Hector\'s body'];
var TERMS = [['mēnis', 'wrath, the first word of the Iliad'], ['kleos', 'glory, the fame that outlives a hero'], ['timē', 'honor, a person\'s worth as others recognize it'], ['epithet', 'a describing phrase used again and again, like "swift-footed Achilles"'],
  ['hexameter', 'the six-beat line of Greek epic verse'], ['Achaeans', 'one of Homer\'s names for the Greeks'], ['Ilium (Ilius)', 'another name for Troy'], ['simile', 'a comparison using "like" or "as", as when battle is compared to a storm']];
var EV = [[-1184, 'the traditional date for the fall of Troy'], [-725, 'the Iliad and Odyssey taking shape'], [-490, 'the battle of Marathon'], [-458, 'the Oresteia'], [1870, 'Schliemann\'s first dig at Troy'], [1795, 'Wolf\'s book on Homer'], [-19, 'the death of Virgil']];
var B = {
  facts: [
    ['The Iliad tells the whole ten years of the Trojan War.', false, 'It tells a few weeks in the tenth year.'],
    ['The first word of the Iliad in Greek means "wrath" or "anger".', true, 'Mēnin: the anger of Achilles.'],
    ['The Trojan horse is described in full in the Iliad.', false, 'It is mentioned in the Odyssey and told in full in Virgil\'s Aeneid.'],
    ['Hector is killed by Achilles.', true, 'In Book 22.'],
    ['The Iliad ends with the funeral of Hector.', true, 'After Priam ransoms his body.'],
    ['Achilles returns to battle because Agamemnon\'s gifts persuade him.', false, 'He refuses the gifts in Book 9; Patroclus\' death brings him back.'],
    ['Homer treats the Trojans with honor as well as the Greeks.', true, 'Hector, Andromache and Priam are among the poem\'s most moving figures.'],
    ['The Iliad was composed in Latin.', false, 'In Greek hexameter verse.'],
    ['Milman Parry studied how oral poets use repeated phrases to compose as they sing.', true, 'His work in the 1920s and 1930s reshaped the Homeric question.'],
    ['Troy was entirely invented by Homer.', false, 'It was a real city at Hisarlik in Turkey, destroyed more than once.']
  ],
  items: [
    { q: 'What starts the quarrel between Achilles and Agamemnon?', r: 'Agamemnon takes Achilles\' captive, Briseis', w: ['Achilles kills Agamemnon\'s brother', 'Achilles wants to go home to marry', 'A dispute over a horse race'], why: 'Agamemnon has to give back his own captive to end a plague, and takes Briseis instead.' },
    { q: 'Why does Achilles go back into battle?', r: 'To avenge his friend Patroclus, killed by Hector', w: ['Agamemnon pays him more gold', 'Zeus orders him to', 'The Greeks elect him leader'], why: 'His anger turns from Agamemnon to Hector.' },
    { q: 'What frightens the baby Astyanax in Book 6?', r: 'The horsehair crest on his father\'s helmet', w: ['A thunderstorm', 'The Greek army', 'His grandfather Priam'], why: 'Hector laughs and takes the helmet off.' },
    { q: 'How does the Iliad end?', r: 'Priam ransoms Hector\'s body, and Hector is buried', w: ['Troy is burned', 'Achilles is killed by Paris', 'Helen goes home to Sparta'], why: 'The fall of Troy and Achilles\' death come after the poem ends.' },
    { q: 'What two fates does Achilles know he can choose between?', r: 'A short life with lasting glory, or a long life forgotten', w: ['Kingship or exile', 'Wealth or love', 'War or farming'], why: 'Glory (kleos) is what he chooses.' },
    { q: 'What did Milman Parry show about Homer\'s repeated phrases like "swift-footed Achilles"?', r: 'They fit the meter like building blocks for a singer composing aloud', w: ['They were added by later editors', 'They prove Homer was blind', 'They are mistakes in copying'], why: 'Oral-formulaic composition.' },
    { q: 'Who guides Priam safely to Achilles\' hut?', r: 'The god Hermes', w: ['Athena', 'Hector\'s ghost', 'Odysseus'], why: 'Zeus sends Hermes.' }
  ]
};
H.T(ID, B, [function (R, lv) { return famSaid(R, lv, SAID); }, function (R, lv) { return famSeq(R, lv, SEQ, 'the Iliad'); }, function (R, lv) { return famTerms(R, lv, TERMS); }, function (R, lv) { return famSpan(R, lv, EV); },
  function (R, lv) { return H.famOrder(R, lv, GREEKS); }].concat(dateFams(ID).slice(0, 2)), 0.6);
