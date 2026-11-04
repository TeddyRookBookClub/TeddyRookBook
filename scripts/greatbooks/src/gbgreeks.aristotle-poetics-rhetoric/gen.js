/* gbgreeks.aristotle-poetics-rhetoric: practice generator (gbe2). Bank plus computed families; shared helpers first. */
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
/* put events in order: ev = [[label, key, when]] (key sorts; when is shown in the answer) */
function famSeq(R, lv, ev, what) {
  var k = lv === 1 ? 3 : 4, pick = R.sample(ev, Math.min(k, ev.length)), srt = pick.slice().sort(function (a, b) { return a[1] - b[1]; });
  var lab = function (e) { return e[0]; }, right = srt.map(lab).join(' → '), w = [];
  for (var i = 0; i < 8 && w.length < 4; i++) { var s = R.shuffle(srt.slice()).map(lab).join(' → '); if (s !== right && w.indexOf(s) < 0) w.push(s); }
  return H.mc('Which list puts these ' + (what || 'events') + ' in order, <b>first to last</b>?', right, H.samp(R, w, lv === 1 ? 2 : 3), srt.map(function (e) { return e[0] + (e[2] ? ': ' + e[2] : '') + '.'; }), { hint: 'Find the one that must come first, then work forward.' });
}
function famFirst(R, lv, ev, what) {
  var pick = R.sample(ev, lv === 1 ? 3 : 4), late = R.coin(), srt = pick.slice().sort(function (a, b) { return a[1] - b[1]; });
  var right = late ? srt[srt.length - 1] : srt[0];
  return H.mc('Which of these ' + (what || 'events') + ' came <b>' + (late ? 'last' : 'first') + '</b>?', right[0], pick.filter(function (e) { return e !== right; }).map(function (e) { return e[0]; }), srt.map(function (e) { return e[0] + (e[2] ? ': ' + e[2] : '') + '.'; }));
}
/* key terms: tm = [[term, meaning]] */
function famTerm(R, lv, tm, ctx) {
  var t = R.pick(tm), others = tm.filter(function (x) { return x !== t; }), n = lv === 1 ? 2 : 3;
  if (R.coin()) return H.mc('In ' + ctx + ', what does <b>' + t[0] + '</b> mean?', t[1], H.samp(R, others, n).map(function (x) { return x[1]; }), [t[0] + ': ' + t[1] + '.']);
  return H.mc('In ' + ctx + ', which term means: <i>' + t[1] + '</i>?', t[0], H.samp(R, others, n).map(function (x) { return x[0]; }), [t[0] + ': ' + t[1] + '.']);
}
/* who said what (from our own summaries): sd = [[speaker, claim]] */
function famWho(R, lv, sd, ctx) {
  var s = R.pick(sd), names = H.uniq(sd.map(function (x) { return x[0]; })).filter(function (n) { return n !== s[0]; });
  return H.mc('In ' + ctx + ', who argues this (in our own summary)? <i>"' + s[1] + '"</i>', s[0], H.samp(R, names, lv === 1 ? 2 : 3), [s[0] + ' says this, in our words.']);
}
/* match two columns: pr = [[a, b]]; ask which b goes with a given a (or the reverse) */
function famMatch(R, lv, pr, qa, qb) {
  var p = R.pick(pr), others = pr.filter(function (x) { return x !== p; }), n = Math.min(others.length, lv === 1 ? 2 : 3);
  if (R.coin()) return H.mc(qa.replace('#', '<b>' + p[0] + '</b>'), p[1], H.samp(R, others, n).map(function (x) { return x[1]; }), [p[0] + ' goes with ' + p[1] + '.']);
  return H.mc(qb.replace('#', '<b>' + p[1] + '</b>'), p[0], H.samp(R, others, n).map(function (x) { return x[0]; }), [p[1] + ' goes with ' + p[0] + '.']);
}
var ID = 'gbgreeks.aristotle-poetics-rhetoric';
var AP = [['I have taught chemistry for thirty years, so trust me on this.', 'ethos'], ['Picture the little ones shivering without coats this winter.', 'pathos'], ['The bridge was built for 4,000 cars a day and now carries 9,000.', 'logos'], ['As a nurse, I see what this does to patients every day.', 'ethos'], ['If each student saves one sheet a day, the school saves 50,000 a year.', 'logos'], ['Imagine how proud you will feel when you cross the finish line.', 'pathos'], ['Every sample tested from the north well was clean.', 'logos'], ['I grew up on this street, and I want what you want for it.', 'ethos'], ['Think of the old dog waiting at the shelter, hoping today is the day.', 'pathos']];
var AN = { ethos: 'ethos (the speaker\'s character)', pathos: 'pathos (the audience\'s feelings)', logos: 'logos (the reasoning)' };
function famAppeal(R, lv) { var a = R.pick(AP); return H.mc('Which of Aristotle\'s three modes of persuasion does this lean on most? <i>“' + a[0] + '”</i>', AN[a[1]], Object.keys(AN).filter(function (k) { return k !== a[1]; }).map(function (k) { return AN[k]; }), ['It leans on ' + AN[a[1]] + '.', 'Ethos: trust in the speaker. Pathos: feelings. Logos: the argument itself.']); }
var KIND = [['A senator urges a vote for a new road.', 'deliberative', 'the future'], ['A lawyer argues that the accused did not take the money.', 'forensic', 'the past'], ['A speaker honors a town\'s firefighters at a festival.', 'epideictic', 'the present'], ['A council member argues against raising the fee next year.', 'deliberative', 'the future'], ['A speech at a funeral praises a teacher\'s life.', 'epideictic', 'the present'], ['A prosecutor shows that the contract was broken.', 'forensic', 'the past']];
function famKind(R, lv) {
  var k = R.pick(KIND);
  if (lv >= 2 && R.coin()) return H.mc('Aristotle ties each kind of speech to a time. Which time does a <b>' + k[1] + '</b> speech look to?', k[2], ['the future', 'the past', 'the present'].filter(function (x) { return x !== k[2]; }), ['Deliberative: the future. Forensic: the past. Epideictic: the present.']);
  return H.mc('Which of Aristotle\'s three kinds of speech is this? <i>' + k[0] + '</i>', k[1], ['deliberative', 'forensic', 'epideictic'].filter(function (x) { return x !== k[1]; }), ['Deliberative (assembly, future), forensic (court, past), epideictic (ceremony, present).']);
}
var PARTS = [['plot', 1], ['character', 2], ['thought', 3], ['diction', 4], ['song', 5], ['spectacle', 6]];
function famParts(R, lv) {
  var p = R.sample(PARTS, 2), hi = p[0][1] < p[1][1] ? p[0] : p[1];
  if (lv === 1) return H.mc('Which part of tragedy does Aristotle call the most important, the "soul" of tragedy?', 'plot', ['spectacle', 'song', 'character'], ['Plot comes first; spectacle is last.']);
  return H.mc('Aristotle ranks the six parts of tragedy. Which does he rank higher: <b>' + p[0][0] + '</b> or <b>' + p[1][0] + '</b>?', hi[0], [(hi === p[0] ? p[1] : p[0])[0]], ['His order: plot, character, thought, diction, song, spectacle.']);
}
var ARC = [['beginning', 1, ''], ['tying the knot (complication)', 2, ''], ['reversal', 3, ''], ['recognition', 4, ''], ['unraveling', 5, ''], ['end', 6, '']];
var TERMS = [['mimēsis', 'imitation, which Aristotle says is natural to us from childhood'], ['catharsis', 'the cleansing or release of pity and fear that tragedy brings about'], ['peripeteia', 'reversal: the action turning to its opposite'], ['anagnōrisis', 'recognition: a change from ignorance to knowledge'], ['hamartia', 'the error or mistake that brings a tragic hero down'], ['enthymeme', 'a rhetorical syllogism, with a step left for listeners to supply']];
var B = {
  facts: [
    ['Aristotle defines rhetoric as the faculty of seeing the available means of persuasion.', true, 'Rhetoric I.2.'],
    ['Aristotle names three modes of persuasion: character, feeling and argument.', true, 'Ethos, pathos, logos.'],
    ['For Aristotle, spectacle is the most important part of tragedy.', false, 'Plot is; spectacle is the least artistic.'],
    ['A whole plot has a beginning, a middle and an end.', true, 'Poetics 7.'],
    ['Aristotle says history is more philosophic than poetry.', false, 'The reverse: poetry speaks of universals.'],
    ['Aristotle\'s favorite example of a reversal comes from Oedipus the King.', true, 'The messenger who comes to cheer the king.'],
    ['The tragic hero, for Aristotle, should be perfectly good.', false, 'Neither perfectly good nor wicked; he falls through some error.'],
    ['Aristotle\'s second book of the Poetics, on comedy, survives complete.', false, 'It is lost.'],
    ['Forensic speeches, in law courts, are about the past.', true, 'Rhetoric I.3.'],
    ['Aristotle calls rhetoric the counterpart of dialectic.', true, 'Rhetoric I.1.']
  ],
  items: [
    { q: 'What does tragedy arouse, according to the Poetics?', r: 'Pity and fear', w: ['Laughter and joy', 'Anger and pride', 'Boredom and sleep'], why: 'Leading to a catharsis of such feelings.' },
    { q: 'Why is poetry "more philosophic" than history?', r: 'It tells what kind of thing would happen, the universal; history tells what one person did', w: ['It rhymes', 'It is older', 'It is shorter'], why: 'Poetics 9.' },
    { q: 'What is the recognition in the Odyssey that Aristotle mentions?', r: 'Odysseus\'s nurse knows him by his scar', w: ['Odysseus wins a race', 'Penelope weaves a cloak', 'The Cyclops is blinded'], why: 'Poetics 16.' },
    { q: 'Why does a tragic hero\'s fall make us feel pity and fear?', r: 'It is undeserved, and it could happen to someone like us', w: ['He is wicked', 'He is a god', 'It is funny'], why: 'Poetics 13.' },
    { q: 'What does Book II of the Rhetoric study?', r: 'The emotions and the characters of different audiences', w: ['The stars', 'Geometry', 'Laws of Sparta'], why: 'So a speaker understands listeners.' },
    { q: 'What did later critics turn into the strict "three unities"?', r: 'Ideas drawn from the Poetics, about action, time and place', w: ['Plato\'s Republic', 'Euclid\'s axioms', 'Homer\'s gods'], why: 'Stricter than Aristotle himself.' }
  ]
};
H.T(ID, B, [famAppeal, famAppeal, famKind, famParts, function (R, lv) { return famSeq(R, lv, ARC, 'parts of a complex plot'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'the Rhetoric and Poetics'); }].concat(dateFams(ID)), 0.55);
