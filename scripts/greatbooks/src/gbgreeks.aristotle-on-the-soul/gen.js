/* gbgreeks.aristotle-on-the-soul: practice generator (gbe2). Bank plus computed families; shared helpers first. */
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
var ID = 'gbgreeks.aristotle-on-the-soul';
var LIV = [['an oak tree', 1], ['grass', 1], ['a rose bush', 1], ['a moss', 1], ['a dog', 2], ['a horse', 2], ['a sparrow', 2], ['a fish', 2], ['an ant', 2], ['a person', 3]];
var POW = ['Nutrition and growth', 'Sensation', 'Desire', 'Thought'];
function famPowers(R, lv) {
  var t = R.pick(LIV), has = t[1] === 1 ? [0] : t[1] === 2 ? [0, 1, 2] : [0, 1, 2, 3];
  if (lv === 1) {
    var p = R.int(0, 3), yes = has.indexOf(p) >= 0;
    return H.tf('In Aristotle\'s account, ' + t[0] + ' has the power of ' + POW[p].toLowerCase() + '.', yes, (yes ? '' : 'No: ') + t[0] + ' has ' + has.map(function (i) { return POW[i].toLowerCase(); }).join(', ') + '.');
  }
  var ord = R.shuffle([0, 1, 2, 3]), v = [];
  ord.forEach(function (i, j) { if (has.indexOf(i) >= 0) v.push(j); });
  return { q: 'Choose <b>all</b> the powers of soul that Aristotle gives to <b>' + t[0] + '</b>.', a: { t: 'mc', choices: ord.map(function (i) { return POW[i]; }), v: v.sort(function (a, b) { return a - b; }) }, steps: [t[1] === 1 ? 'Plants have only nutrition.' : t[1] === 2 ? 'Animals have nutrition, sensation and desire, but not thought.' : 'People have all of them, thought included.'] };
}
var SENSE = [['sight', 'light, through air or water'], ['hearing', 'air set moving'], ['touch', 'the flesh'], ['smell', 'air or water'], ['taste', 'moisture on the tongue']];
var TERMS = [['psychē', 'soul: what makes a living body alive'], ['entelechy', 'actuality: being fully at work'], ['common sense', 'the power that unites the senses and perceives size, shape, number and motion'], ['phantasia', 'imagination: calling up images when the object is absent'], ['recollection', 'searching memory by likeness, opposites or what came together'], ['homonym', 'something that shares only the name, like a painted eye']];
var B = {
  facts: [
    ['For Aristotle, plants have souls.', true, 'The nutritive soul: feeding, growing, reproducing.'],
    ['Aristotle says the soul is a ghost that lives inside the body.', false, 'It is the form or actuality of the living body.'],
    ['Every animal has at least the sense of touch, Aristotle says.', true, 'On the Soul II–III.'],
    ['In Aristotle\'s ladder, a being can think without being able to sense.', false, 'Each higher power needs the lower ones (among living bodies).'],
    ['"If the eye were an animal, vision would be its soul" is Aristotle\'s example.', true, 'On the Soul II.1.'],
    ['Aristotle says a sense takes in an object\'s form without its matter.', true, 'Like wax taking a ring\'s mark without the gold.'],
    ['The "common sense" in Aristotle means practical good judgment.', false, 'It means the power that unites the senses.'],
    ['Aristotle was sure that dreams foretell the future.', false, 'He thought most seeming prophecies were coincidence.'],
    ['Before it thinks, the mind is like a tablet with nothing written on it.', true, 'On the Soul III.4.'],
    ['Aristotle reviewed earlier thinkers\' views of the soul before giving his own.', true, 'Book I.']
  ],
  items: [
    { q: 'How does Aristotle define the soul?', r: 'The first actuality of a natural body that has organs', w: ['A puff of air', 'A tiny flame in the heart', 'A harmony of the elements'], why: 'On the Soul II.1.' },
    { q: 'Why does Aristotle say we need not ask whether body and soul are one?', r: 'Just as we need not ask whether wax and its shape are one', w: ['Because they are enemies', 'Because only the body exists', 'Because the gods forbid it'], why: 'On the Soul II.1, 412b.' },
    { q: 'Which power do all animals have but plants lack?', r: 'Sensation', w: ['Nutrition', 'Reproduction', 'Growth'], why: 'All animals have at least touch.' },
    { q: 'Where do dreams come from, according to Aristotle?', r: 'Leftover movements from the senses, noticed when the world is quiet', w: ['Messages from the gods', 'The stomach alone', 'The stars'], why: 'On Dreams.' },
    { q: 'What does Aristotle compare the productive mind of III.5 to?', r: 'Light, which makes colors actually visible', w: ['A river', 'A wax tablet', 'A ship\'s pilot'], why: 'On the Soul III.5.' },
    { q: 'Which later thinker on this ladder used Aristotle\'s definition of the soul?', r: 'Thomas Aquinas', w: ['Homer', 'Herodotus', 'Euclid'], why: 'He argued the human soul is the body\'s form and can survive it.' }
  ]
};
H.T(ID, B, [famPowers, famPowers, famPowers, function (R, lv) { return famMatch(R, lv, SENSE, 'For Aristotle, what is the medium of <b>#</b>?', 'For Aristotle, which sense works through #?'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'On the Soul'); }].concat(dateFams(ID)), 0.55);
