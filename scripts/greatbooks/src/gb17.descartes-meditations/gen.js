/* gb17.descartes-meditations: practice generator (gbw2). Shared helpers first. */
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
var ID = 'gb17.descartes-meditations';
var MED = [['doubting the senses, dreams and the deceiving demon', 1, 'Meditation I'], ['"I am, I exist" and the piece of wax', 2, 'Meditation II'], ['proving God exists from the idea of the infinite', 3, 'Meditation III'], ['explaining error: the will outruns the understanding', 4, 'Meditation IV'], ['extension as the essence of bodies, and a second proof of God', 5, 'Meditation V'], ['mind and body distinct; bodies exist', 6, 'Meditation VI']];
var MAP = MED.map(function (m) { return [m[2], m[0]]; });
var TM = [['the method of doubt', 'refusing to accept anything that could possibly be false, in order to find a sure foundation'], ['the malignant demon', 'an imagined powerful deceiver who might fool me about everything'], ['a thinking thing', 'what Descartes says he is: a thing that doubts, understands, wills, imagines and perceives'], ['extension', 'length, breadth and depth: for Descartes, the essence of bodies'], ['clear and distinct', 'ideas so plainly seen that, Descartes says, we cannot doubt them'], ['the Cartesian circle', 'the objection that Descartes uses clear ideas to prove God, then God to guarantee clear ideas'], ['the Objections and Replies', 'critics\' comments printed with the Meditations, with Descartes\'s answers']];
var WHO = [['Descartes', 'I am, I exist, is necessarily true each time I think it.'], ['Hobbes', 'Perhaps the thing that thinks is a body.'], ['Arnauld', 'You prove God from clear ideas, then trust clear ideas because of God.'], ['Gassendi', 'Our ideas come to us through the senses.'], ['Princess Elisabeth', 'How can a mind that takes up no space move a body?']];
var EV = [['Descartes is born', 1596, '1596'], ['Discourse on the Method', 1637, '1637'], ['Meditations, in Latin', 1641, '1641'], ['Elisabeth\'s letters on mind and body', 1643, '1643'], ['Principles of Philosophy', 1644, '1644'], ['the French Meditations', 1647, '1647'], ['Descartes dies in Stockholm', 1650, '1650']];
function famArg(R, lv) {
  var A = [
    ['If I am deceived, I exist. I am deceived (or might be). So…', 'I exist.', ['I am not deceived.', 'The demon exists.', 'My body exists.']],
    ['A perfect being is not a deceiver. God is a perfect being. So…', 'God is not a deceiver.', ['God is a deceiver.', 'I am perfect.', 'Nothing can be known.']],
    ['If I affirm only what I see clearly and distinctly, I will not err. I affirm only that. So…', 'I will not err.', ['I will err.', 'I see nothing clearly.', 'God deceives me.']],
    ['I can clearly understand mind without body. Whatever I can clearly understand apart can exist apart (by God\'s power). So…', 'Mind and body can exist apart; they are distinct.', ['Mind is a kind of body.', 'Bodies do not exist.', 'I have no mind.']]
  ];
  var a = R.pick(A);
  return H.mc('Complete Descartes\'s reasoning: <i>' + a[0] + '</i>', a[1], H.samp(R, a[2], lv === 1 ? 2 : 3), ['The conclusion follows from the two premises.'], { hint: 'What do the two premises guarantee together?' });
}
var B = {
  facts: [
    ['The Meditations were first published in Latin.', true, '1641; the French version followed in 1647.'],
    ['Descartes doubts the senses because they never deceive us.', false, 'Because they sometimes do.'],
    ['In Meditation II Descartes concludes "I am, I exist."', true, 'It is true whenever he thinks it.'],
    ['The phrase "I think, therefore I am" appears word for word in the Meditations.', false, 'Its famous forms are in the Discourse and the Principles.'],
    ['The piece of wax shows that the mind grasps what a body is.', true, 'Every sensed quality changes, yet it is the same wax.'],
    ['Descartes says error comes from the will outrunning the understanding.', true, 'Meditation IV.'],
    ['Hobbes wrote one set of the Objections.', true, 'The Third Objections.'],
    ['Descartes concludes in Meditation VI that bodies do not exist.', false, 'He concludes that they do.'],
    ['Descartes thought mind and body are one and the same thing.', false, 'He held they are really distinct, though closely joined.'],
    ['The "malignant demon" is a supposition Descartes uses to keep his doubt strong.', true, 'Meditation I.']
  ],
  items: [
    { q: 'What does Descartes find that he cannot doubt?', r: 'That he exists while he thinks', w: ['That he has a body', 'That 2 + 3 = 5', 'That he is awake'], why: 'Meditation II.' },
    { q: 'What happens to the wax near the fire?', r: 'Its color, smell, shape and sound all change', w: ['Nothing changes', 'It turns into stone', 'It disappears completely'], why: 'Yet we judge it the same wax.' },
    { q: 'What, for Descartes, is the essence of bodies?', r: 'Extension (length, breadth and depth)', w: ['Color', 'Weight', 'Thought'], why: 'Meditation V.' },
    { q: 'Why did Descartes print Objections with the book?', r: 'To answer learned critics in public', w: ['Because the printer insisted', 'To make the book shorter', 'Because he agreed with all of them'], why: 'He gathered them before printing.' },
    { q: 'Who later asked how a mind can move a body?', r: 'Princess Elisabeth of Bohemia', w: ['Galileo', 'Bacon', 'Pascal'], why: 'In letters of 1643.' },
    { q: 'How does Meditation VI tell waking from dreaming?', r: 'Waking life hangs together; dreams do not', w: ['Dreams are always in black and white', 'You can pinch yourself', 'Dreams never have people in them'], why: 'Memory connects waking events with the rest of life.' }
  ]
};
H.T(ID, B, [famArg, famArg, function (R, lv) { return famSeq(R, lv, MED, 'steps of the Meditations'); }, function (R, lv) { return famMatch(R, lv, MAP, 'What happens in #?', 'In which meditation does Descartes do this: #?'); }, function (R, lv) { return famTerm(R, lv, TM, 'the Meditations'); }, function (R, lv) { return famWho(R, lv, WHO, 'the Meditations and their critics'); }, function (R, lv) { return famFirst(R, lv, EV, 'events'); }].concat(dateFams(ID)), 0.6);
