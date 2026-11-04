/* gbgreeks.aristotle-metaphysics: practice generator (gbe2). Bank plus computed families; shared helpers first. */
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
var ID = 'gbgreeks.aristotle-metaphysics';
var OBJ = [['a bronze statue', 'bronze', 'its shape', 'the sculptor', 'to honor someone'], ['a house', 'bricks and timber', 'the plan of a house', 'the builder', 'shelter'], ['a wooden table', 'wood', 'a flat top on legs', 'the carpenter', 'eating and working at'], ['a clay bowl', 'clay', 'the shape of a bowl', 'the potter', 'holding food'], ['an oak tree', 'wood and leaves', 'the form of an oak', 'the parent oak', 'to be a full-grown oak'], ['a loaf of bread', 'flour, water and yeast', 'the shape and makeup of a loaf', 'the baker', 'to be eaten'], ['a sailboat', 'wood and cloth', 'the design of a boat', 'the boatbuilder', 'sailing']];
var CN = ['material', 'formal', 'efficient', 'final'];
function famCause(R, lv) {
  var o = R.pick(OBJ), c = R.int(0, 3);
  if (lv === 1 || R.coin()) return H.mc('In Aristotle\'s four causes, what is the <b>' + CN[c] + '</b> cause of ' + o[0] + '?', o[c + 1], [0, 1, 2, 3].filter(function (i) { return i !== c; }).map(function (i) { return o[i + 1]; }).slice(0, lv === 1 ? 2 : 3), ['Material: ' + o[1] + '. Formal: ' + o[2] + '. Efficient: ' + o[3] + '. Final: ' + o[4] + '.']);
  return H.mc('For ' + o[0] + ', "' + o[c + 1] + '" is which of Aristotle\'s four causes?', CN[c], CN.filter(function (x) { return x !== CN[c]; }), ['Material: what it is made of. Formal: its form. Efficient: what made it. Final: what it is for.']);
}
var POT = [['an acorn', 'an oak'], ['a seed of wheat', 'a stalk of wheat'], ['a block of marble', 'a statue'], ['a child', 'a grown person'], ['a caterpillar', 'a butterfly'], ['a student of medicine', 'a doctor'], ['an egg', 'a hen']];
function famPot(R, lv) {
  var p = R.pick(POT), others = POT.filter(function (x) { return x !== p; });
  if (R.coin()) return H.mc('In Aristotle\'s terms, <b>' + p[0] + '</b> is potentially what?', p[1], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[1]; }), [p[0] + ' can become ' + p[1] + ': it is ' + p[1] + ' potentially, not yet actually.']);
  return H.mc('Aristotle says actuality comes before potentiality. Which comes first, in his sense: ' + p[1] + ' or ' + p[0] + ' (taking the whole cycle, as he does)?', p[1] + ' (something already actual is needed to produce it)', [p[0] + ' (the potential always comes first)'], ['The acorn comes from an oak; the learner from a teacher who knows. Something actual starts every change.']);
}
var EV = [['Thales', -585, 'water is the first principle (6th century BC)'], ['Heraclitus', -500, 'everything flows (about 500 BC)'], ['Empedocles', -450, 'four elements (5th century BC)'], ['Democritus', -420, 'atoms and the void (late 5th century BC)'], ['Plato', -380, 'the Forms (4th century BC)'], ['Aristotle', -340, 'the four causes (4th century BC)']];
var TERMS = [['being as being', 'the subject of first philosophy: what it is to be at all'], ['ousia (substance)', 'what is most truly real: individual things like this horse'], ['potentiality', 'the power to become something'], ['actuality', 'being something fully, at work'], ['unmoved mover', 'the first cause of motion, which moves by being desired'], ['non-contradiction', 'the principle that a thing cannot both be and not be so, at once, in the same respect']];
var B = {
  facts: [
    ['The Metaphysics begins: "All men by nature desire to know."', true, 'Metaphysics I.1.'],
    ['Aristotle himself named the book Metaphysics.', false, 'A later editor did; it means "after the Physics".'],
    ['Aristotle says philosophy began in wonder.', true, 'Metaphysics I.2, as Plato\'s Theaetetus also says.'],
    ['Aristotle agrees that Plato\'s Forms exist apart from things.', false, 'He argues that forms exist in things.'],
    ['The principle of non-contradiction can be proved from simpler principles, Aristotle says.', false, 'Every proof uses it, so it cannot be proved; but deniers can be refuted.'],
    ['In Book XII, the first mover causes motion by being loved or desired.', true, 'Metaphysics XII.7.'],
    ['Thales said the first principle of all things was water.', true, 'Aristotle reports this in Book I.'],
    ['For Aristotle, the most real things are qualities like white or tall.', false, 'Substances, such as this horse or this person.'],
    ['Aristotle says the first mover\'s life is thinking.', true, '"A thinking on thinking".'],
    ['Avicenna and Averroes wrote on the Metaphysics.', true, 'Averroes was called "the Commentator".']
  ],
  items: [
    { q: 'How does Aristotle show that we desire to know?', r: 'We delight in our senses, especially sight, even when they are not useful', w: ['We go to school', 'We fear the gods', 'We buy books'], why: 'Metaphysics I.1.' },
    { q: 'What is the difference between experience and art (skill) in Book I?', r: 'Experience knows that something works; art knows why it works', w: ['Experience is for animals only', 'Art is only painting', 'There is no difference'], why: 'The doctor example of Callias and Socrates.' },
    { q: 'What does the principle of non-contradiction say?', r: 'The same thing cannot both belong and not belong to the same subject at once, in the same respect', w: ['Everything is always changing', 'All opinions are equally true', 'Nothing can be known'], why: 'Metaphysics IV.3.' },
    { q: 'Why does Aristotle think there must be an unmoved mover?', r: 'The eternal motion of the heavens needs a first cause that is not itself moved', w: ['Plato said so', 'Someone must have pushed the stars once', 'Motion is an illusion'], why: 'Metaphysics XII.6–7.' },
    { q: 'What does "after the Physics" refer to?', r: 'The place of these books in the ancient edition, after the Physics', w: ['Events after the end of the world', 'Aristotle\'s last years', 'A sequel by Plato'], why: 'The name came from an editor.' },
    { q: 'Which of these is a substance, for Aristotle?', r: 'This horse', w: ['Whiteness', 'Two feet long', 'Yesterday'], why: 'Qualities, quantities and times are said of substances.' }
  ]
};
H.T(ID, B, [famCause, famCause, famPot, function (R, lv) { return famSeq(R, lv, EV, 'thinkers Aristotle reviews'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'the Metaphysics'); }].concat(dateFams(ID)), 0.55);
