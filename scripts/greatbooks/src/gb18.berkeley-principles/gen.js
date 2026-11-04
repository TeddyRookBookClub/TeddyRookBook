/* gb18.berkeley-principles: practice generator (gbw3). */
/* gbw3 shared generator helpers (copied into each gb18 rung by gbw3). */
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
/* put events in order: ev = [[label, key, when]] */
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
/* who said what (our own summaries): sd = [[speaker, claim]] */
function famWho(R, lv, sd, ctx) {
  var s = R.pick(sd), names = H.uniq(sd.map(function (x) { return x[0]; })).filter(function (n) { return n !== s[0]; });
  return H.mc('In ' + ctx + ', who argues this (in our own summary)? <i>"' + s[1] + '"</i>', s[0], H.samp(R, names, lv === 1 ? 2 : 3), [s[0] + ' says this, in our words.']);
}
/* match two columns: pr = [[a, b]] */
function famMatch(R, lv, pr, qa, qb) {
  var p = R.pick(pr), n = lv === 1 ? 2 : 3;
  var wb = H.uniq(pr.map(function (x) { return x[1]; })).filter(function (x) { return x !== p[1]; }), wa = H.uniq(pr.map(function (x) { return x[0]; })).filter(function (x) { return x !== p[0]; });
  if (qb && wa.length && (R.coin() || !wb.length)) return H.mc(qb.replace('#', '<b>' + p[1] + '</b>'), p[0], H.samp(R, wa, n), [p[1] + ': ' + p[0] + '.']);
  return H.mc(qa.replace('#', '<b>' + p[0] + '</b>'), p[1], H.samp(R, wb, n), [p[0] + ': ' + p[1] + '.']);
}
/* sort an example into a category: ex = [[example, category, why]], cats = list of all category names */
function famClass(R, lv, ex, cats, q) {
  var e = R.pick(ex), w = cats.filter(function (c) { return c !== e[1]; });
  return H.mc(q.replace('#', '<i>' + e[0] + '</i>'), e[1], H.samp(R, w, lv === 1 ? Math.min(2, w.length) : w.length), [e[0] + ': ' + e[1] + '.' + (e[2] ? ' ' + e[2] : '')]);
}
var ID = 'gb18.berkeley-principles';
var WHO = [['Berkeley', 'To be, for a sensible thing, is to be perceived.'], ['Locke', 'Shape and size are really in objects, but color and taste are only powers to cause ideas in us.'], ['Berkeley', 'A shape with no color can\'t even be imagined.'], ['Johnson', 'Kicking a stone is enough to answer the philosophers who deny matter.'], ['Hume', 'We know only our perceptions; reason can\'t prove an outside world of matter.'], ['Berkeley', 'The order of nature is the steady way God gives us ideas.']];
var TERMS = [['esse est percipi', 'to be is to be perceived'], ['idea (Berkeley)', 'whatever is perceived by the senses or imagined'], ['spirit', 'a mind, which perceives and acts'], ['matter (as Berkeley attacks it)', 'an unthinking stuff existing apart from all minds'], ['laws of nature (Berkeley)', 'the regular order in which God gives us ideas of sense'], ['idealism', 'the view that reality is fundamentally mental']];
var EV = [['Locke\'s Essay', 1689, '1689'], ['Berkeley\'s Principles', 1710, '1710'], ['the Three Dialogues', 1713, '1713'], ['Berkeley sails to Rhode Island', 1728, '1728'], ['Berkeley becomes Bishop of Cloyne', 1734, '1734'], ['Hume\'s Enquiry', 1748, '1748']];
function famWater(R, lv) {
  var w = R.int(18, 30), a = w + R.int(6, 15), b = w - R.int(6, 12), left = R.coin();
  return H.mc('One hand has been in water at ' + (left ? a : b) + '°C and the other at ' + (left ? b : a) + '°C. Both go into the same bowl at ' + w + '°C. How does the water feel to the <b>first</b> hand?', left ? 'cold' : 'warm', [left ? 'warm' : 'cold', 'exactly ' + w + '°C', 'the same to both hands'], ['The first hand was ' + (left ? 'warmer' : 'colder') + ' than the water, so the water feels ' + (left ? 'cold' : 'warm') + ' to it.', 'Berkeley: the same water can\'t be both warm and cold, so these qualities are in the feeling.']);
}
var B = { facts: [
  ['Berkeley says the being of sensible things is to be perceived.', true, 'Principles §3.'],
  ['Berkeley denied that the things we see and touch are real.', false, 'He said they are real; what he denied was mind-independent matter.'],
  ['Berkeley argued primary qualities are in the mind just as secondary ones are.', true, 'Against Locke.'],
  ['For Berkeley, things go out of existence when no human perceives them.', false, 'God always perceives them.'],
  ['Berkeley was a bishop in the Church of Ireland.', true, 'Bishop of Cloyne.'],
  ['Berkeley thought science becomes impossible without matter.', false, 'Science studies the regular order of our ideas.'],
  ['Berkeley wrote the Principles when he was about 25.', true, 'Published 1710.'],
  ['Berkeley gave his library and farm to Yale.', true, 'After his time in Rhode Island.'],
  ['Berkeley said spirits (minds) are only ideas.', false, 'Spirits perceive and act; ideas are what is perceived.']],
 items: [
  { q: 'What does \"esse est percipi\" mean?', r: 'To be is to be perceived', w: ['I think, therefore I am', 'Knowledge is power', 'All is for the best'], why: 'Principles §3.' },
  { q: 'Why don\'t things vanish when no one is in the room, for Berkeley?', r: 'God always perceives them', w: ['Matter holds them in place', 'They are remembered', 'They turn into atoms'], why: 'The mind of God sustains the world.' },
  { q: 'Whose distinction of primary and secondary qualities does Berkeley attack?', r: 'Locke\'s', w: ['Plato\'s', 'Hume\'s', 'Kant\'s'], why: 'The previous rung.' },
  { q: 'Who is said to have kicked a stone and said, \"I refute it thus\"?', r: 'Samuel Johnson', w: ['David Hume', 'John Locke', 'Voltaire'], why: 'Reported by Boswell.' },
  { q: 'Which book presents Berkeley\'s ideas as a conversation?', r: 'Three Dialogues between Hylas and Philonous', w: ['The Social Contract', 'Rameau\'s Nephew', 'The Spirit of Laws'], why: '1713.' }] };
H.T(ID, B, [famWater, function (R, lv) { return famWho(R, lv, WHO, 'the debate about matter'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'Berkeley\'s Principles'); }, function (R, lv) { return famSeq(R, lv, EV, 'events'); }].concat(dateFams(ID)), 0.55);
