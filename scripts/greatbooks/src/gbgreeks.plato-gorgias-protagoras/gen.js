/* gbgreeks.plato-gorgias-protagoras: practice generator (gbe2). Bank plus computed families; shared helpers first. */
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
var ID = 'gbgreeks.plato-gorgias-protagoras';
var FL = [['cosmetics', 'gymnastics'], ['cookery', 'medicine'], ['sophistry', 'lawmaking'], ['rhetoric', 'justice']];
function famAnalogy(R, lv) {
  var a = R.pick(FL), b = R.pick(FL.filter(function (x) { return x !== a; })), askSham = R.coin();
  var right = askSham ? b[0] : b[1], wrong = H.uniq(FL.map(function (x) { return x[0]; }).concat(FL.map(function (x) { return x[1]; }))).filter(function (x) { return x !== right && x !== (askSham ? b[1] : b[0]); });
  var q = askSham ? 'In the Gorgias, Socrates says: ' + a[0] + ' is to ' + a[1] + ' as <b>___</b> is to ' + b[1] + '. Fill the blank.' : 'In the Gorgias, Socrates says: ' + a[0] + ' is to ' + a[1] + ' as ' + b[0] + ' is to <b>___</b>. Fill the blank.';
  return H.mc(q, right, H.samp(R, wrong, lv === 1 ? 2 : 3), ['Each imitation (flattery) copies one true art: ' + FL.map(function (x) { return x[0] + ' copies ' + x[1]; }).join('; ') + '.']);
}
var DLG = [['Charmides', 'self-control'], ['Laches', 'courage'], ['Lysis', 'friendship'], ['Euthydemus', 'word tricks that only seem to be wisdom'], ['Ion', 'whether poets work by skill or by inspiration'], ['Protagoras', 'whether virtue can be taught'], ['Gorgias', 'what rhetoric is for, and whether doing wrong is worse than suffering it']];
var WHO = [['Protagoras', 'Zeus gave justice and reverence to everyone, so every citizen may speak about justice.'], ['Gorgias', 'My art is persuasion, in the courts and assemblies.'], ['Polus', 'Powerful men who do as they like are the happiest.'], ['Callicles', 'By nature the strong should have more; laws are made by the weak.'], ['Socrates', 'It is worse to do wrong than to suffer it.'], ['Socrates', 'No one does wrong willingly.']];
var TERMS = [['sophist', 'a traveling teacher who taught speaking and success for a fee'], ['rhetoric', 'the art of persuasive public speaking'], ['flattery', 'Socrates\' word for a knack that aims at pleasure, not good'], ['sōphrosynē', 'self-control or moderation, the topic of the Charmides'], ['akrasia', 'weakness of will: knowing the better and doing the worse (Aristotle\'s word)'], ['eristic', 'arguing to win, not to find the truth, as the brothers in the Euthydemus do']];
var B = {
  facts: [
    ['Protagoras and Gorgias were famous teachers called sophists.', true, 'They taught speaking and success, for a fee.'],
    ['In the Gorgias, Socrates says cookery imitates medicine.', true, 'Gorgias 464d.'],
    ['Socrates says it is better to do wrong than to suffer it.', false, 'He says the opposite: doing wrong is worse.'],
    ['In Protagoras\' story, Zeus gives justice only to rulers.', false, 'He gives justice and reverence to everyone.'],
    ['Callicles argues that by nature the strong should have more.', true, 'Gorgias 483–484.'],
    ['The Laches asks what courage is.', true, 'The generals Laches and Nicias try to define it.'],
    ['Socrates says a wrongdoer is better off escaping punishment.', false, 'Better off punished, he argues, as a sick man is better off cured.'],
    ['The Ion compares poets to iron rings hanging from a magnet.', true, 'The Muse is the magnet; inspiration passes down the chain.'],
    ['At the end of the Protagoras, Socrates and Protagoras have swapped sides on whether virtue is teachable.', true, 'Socrates says they should start again.'],
    ['Gorgias came from Leontini, in Sicily.', true, 'He was the most celebrated speaker of his day.']
  ],
  items: [
    { q: 'Why would the cook beat the doctor if children were the judges?', r: 'Children judge by what tastes good, not by what is good for them', w: ['The cook is more skilled', 'Doctors cannot cook', 'Children are always right'], why: 'Gorgias 464d–e.' },
    { q: 'What does Socrates mean by "no one does wrong willingly"?', r: 'People do wrong because they misjudge what is good', w: ['Nobody is ever to blame', 'Everyone is forced to do wrong', 'Wrong things are actually right'], why: 'Protagoras 358c–d.' },
    { q: 'What does Socrates compare a life of endless desire to?', r: 'Filling a leaky jar', w: ['Climbing a ladder', 'Sailing home', 'Building a wall'], why: 'His reply to Callicles in the Gorgias.' },
    { q: 'In the Gorgias, what is Socrates\' objection to rhetoric as taught?', r: 'It persuades without knowledge and aims at pleasing, not at good', w: ['It is too difficult to learn', 'It uses too many long words', 'It is only for courts'], why: 'He calls it a kind of flattery.' },
    { q: 'What does Protagoras say he teaches?', r: 'How to manage one\'s own affairs and the city\'s: good citizenship', w: ['Geometry', 'Sculpture', 'Medicine'], why: 'Protagoras 318e–319a.' },
    { q: 'Which later work on this ladder treats persuasion as a real art?', r: 'Aristotle\'s Rhetoric', w: ['Euclid\'s Elements', 'Homer\'s Odyssey', 'Plato\'s Timaeus'], why: 'Aristotle answers both Socrates and the sophists.' }
  ]
};
H.T(ID, B, [famAnalogy, famAnalogy, function (R, lv) { return famMatch(R, lv, DLG, 'Which topic is the <i>#</i> mostly about?', 'Which of Plato\'s dialogues is mostly about #?'); }, function (R, lv) { return famWho(R, lv, WHO, 'these dialogues'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'these dialogues'); }].concat(dateFams(ID)), 0.55);
