/* gbgreeks.aristophanes-comedies: practice generator (gbe1). Bank plus computed families: who says or does what (from our own summaries),
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
var ID = 'gbgreeks.aristophanes-comedies';
var PLAYS = [['The Acharnians', 'A farmer makes his own private peace with Sparta.', -425], ['The Knights', 'An attack on the powerful politician Cleon.', -424], ['The Clouds', 'A father sends his son to Socrates\' "Thinkery" to learn to win any argument.', -423],
  ['The Wasps', 'An old man is addicted to serving on juries.', -422], ['Peace', 'A farmer flies to heaven on a giant beetle to rescue the goddess Peace.', -421], ['The Birds', 'Two Athenians found Cloudcuckooland in the sky.', -414],
  ['The Frogs', 'Dionysus goes to the underworld to bring back a poet.', -405], ['Wealth', 'The blind god of wealth is cured, and riches go to the honest.', -388]];
function famPlay(R, lv) {
  var it = R.pick(PLAYS), others = PLAYS.filter(function (p) { return p !== it; });
  if (lv >= 2 && R.coin()) { var p = R.sample(PLAYS, lv === 2 ? 3 : 4).sort(function (a, b) { return a[2] - b[2]; }), right = p.map(function (x) { return x[0]; }).join(' → '), w = [], t = 0; while (w.length < 3 && t++ < 20) { var s = R.shuffle(p.slice()).map(function (x) { return x[0]; }).join(' → '); if (s !== right && w.indexOf(s) < 0) w.push(s); } return H.mc('Which list puts these comedies in order, earliest first?', right, w, p.map(function (x) { return x[0] + ': ' + yrs(x[2]) + '.'; })); }
  return H.mc('Which comedy is this? <i>' + it[1] + '</i>', it[0], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[0]; }), [it[0] + ' (' + yrs(it[2]) + ').']);
}
var PARTS = [['prologue', 'the opening scene, where the hero explains the bright idea'], ['parodos', 'the entrance song of the chorus'], ['agon', 'the formal contest or debate'], ['parabasis', 'the chorus steps forward and speaks straight to the audience for the poet'], ['exodos', 'the finale and exit, often a wedding or procession'], ['Old Comedy', 'the comedy of Athens in Aristophanes\' time, which mocked living people by name'], ['New Comedy', 'the later comedy of family plots, by Menander and others'], ['Cloudcuckooland', 'the city the birds build in the sky']];
var SAID = [['Xanthias', 'Asks his master which tired old jokes he may use.'], ['Dionysus', 'Rows across the lake of the dead while frogs croak at him.'], ['Peisetaerus', 'Persuades the birds to build a city in the sky.'], ['Aeschylus', 'Wins the contest of poets and is brought back to Athens.'],
  ['Euripides', 'Loses the contest of poets in the underworld.'], ['The frogs', 'Sing "Brekekekex, ko-ax, ko-ax!"'], ['Socrates', 'In The Clouds, hangs in a basket to study the sky (a cartoon of the real man).'], ['The parabasis chorus of The Frogs', 'Advises the city to restore citizens\' rights.']];
var EV = [[-446, 'Aristophanes\' birth'], [-431, 'the start of the Peloponnesian War'], [-423, 'The Clouds'], [-414, 'The Birds'], [-405, 'The Frogs'], [-404, 'the end of the war'], [-399, 'the trial of Socrates'], [-388, 'Wealth']];
var AGE = [['Aristophanes', -446, 'he', -425, 'The Acharnians won first prize'], ['Aristophanes', -446, 'he', -405, 'The Frogs won first prize'], ['Aristophanes', -446, 'he', -423, 'The Clouds was staged'], ['Aristophanes', -446, 'he', -414, 'The Birds was staged']];
var B = {
  facts: [
    ['Eleven comedies by Aristophanes survive.', true, 'Out of about 40.'],
    ['In The Frogs, Dionysus finally brings Euripides back to Athens.', false, 'He chooses Aeschylus.'],
    ['The Clouds is a fair, accurate portrait of Socrates.', false, 'It is a cartoon; Socrates later complained of the false picture it helped spread.'],
    ['The Frogs won first prize.', true, 'And reportedly a second performance.'],
    ['In Old Comedy, the chorus sometimes speaks straight to the audience for the poet.', true, 'The parabasis.'],
    ['Aristophanes wrote most of his surviving plays during the Peloponnesian War.', true, 'War and peace run through them.'],
    ['Plato shows Aristophanes and Socrates at the same dinner party.', true, 'In the Symposium.']
  ],
  items: [
    { q: 'Why does Dionysus go down to the underworld in The Frogs?', r: 'To bring back a great poet, since Athens has none left', w: ['To rescue his mother', 'To find the goddess Peace', 'To defeat the Furies'], why: 'Sophocles and Euripides had both just died.' },
    { q: 'Why do historians read Aristophanes carefully?', r: 'His comedies show everyday Athens, but jokes exaggerate', w: ['He wrote in a secret code', 'He lived long after the events', 'He wrote only about gods'], why: 'Good evidence, used with care.' },
    { q: 'How do the birds in The Birds put pressure on the gods?', r: 'Their sky city blocks the smoke of sacrifices from reaching heaven', w: ['They steal Zeus\'s thunderbolt', 'They stop singing', 'They carry off Athena'], why: 'The gods go hungry and give in.' },
    { q: 'How is the contest of poets settled in The Frogs?', r: 'Verses are weighed on a giant scale, and Dionysus chooses', w: ['The audience votes by shouting', 'The frogs decide', 'They draw lots'], why: 'He picks Aeschylus.' }
  ]
};
H.T(ID, B, [famPlay, famPlay, function (R, lv) { return famTerms(R, lv, PARTS); }, function (R, lv) { return famSaid(R, lv, SAID); }, function (R, lv) { return famSpan(R, lv, EV); }, function (R, lv) { return famAge(R, lv, AGE); }].concat(dateFams(ID).slice(0, 2)), 0.62);
