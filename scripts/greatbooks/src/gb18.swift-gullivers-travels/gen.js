/* gb18.swift-gullivers-travels: practice generator (gbw3). */
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
var ID = 'gb18.swift-gullivers-travels';
var VOY = [['Lilliput, the land of tiny people', 1, 'Part I'], ['Brobdingnag, the land of giants', 2, 'Part II'], ['Laputa, the flying island', 3, 'Part III'], ['the land of the Houyhnhnms', 4, 'Part IV']];
var PL = [['Lilliput', 'people about six inches tall'], ['Brobdingnag', 'giants as tall as church steeples'], ['Laputa', 'a flying island of absent-minded thinkers'], ['the Academy of Lagado', 'projectors trying to get sunbeams out of cucumbers'], ['the Houyhnhnms', 'wise horses who live by reason'], ['Blefuscu', 'Lilliput\'s rival island, across a narrow channel']];
function famScale(R, lv) {
  var k = R.pick(lv === 1 ? [2, 3, 4, 10] : [2, 3, 4, 5, 6, 10, 12]), kind = lv === 1 ? 'height' : R.pick(['area', 'volume', 'volume']);
  var v = kind === 'height' ? k : kind === 'area' ? k * k : k * k * k;
  var q = kind === 'height' ? 'A giant is the same shape as Gulliver but ' + k + ' times taller. How many times longer is the giant\'s arm?' : kind === 'area' ? 'A giant is the same shape as Gulliver but ' + k + ' times taller. How many times as much cloth would the giant\'s coat need (area)?' : 'A giant is the same shape as Gulliver but ' + k + ' times taller. How many times as much does the giant\'s body hold (volume), and so how many of Gulliver\'s meals would it need?';
  return H.num(q, v, kind === 'height' ? ['Every length scales by the same factor: ' + k + '.'] : kind === 'area' ? ['Area scales as the square: $' + k + '^2 = ' + v + '$.'] : ['Volume scales as the cube: $' + k + '^3 = ' + v + '$.', 'Swift\'s Lilliputians did this for $12^3 = 1728$.'], { hint: kind === 'volume' ? 'Length, width and depth each grow.' : '' });
}
function famLilli(R, lv) {
  var g = R.pick([60, 66, 72]), l = g / 12;
  return H.num('Gulliver is about ' + g + ' inches tall, and Lilliputians are 1/12 as tall. How tall is a Lilliputian, in inches?', l, ['$' + g + ' \\div 12 = ' + l + '$ inches.', 'Swift says they were \"not six inches high\".'], { form: 'dec' });
}
var B = { facts: [
  ['Gulliver is a ship\'s surgeon.', true, 'He is trained as a surgeon and sails on merchant ships.'],
  ['In Lilliput, Gulliver is the tiny one.', false, 'He is the giant; he is tiny in Brobdingnag.'],
  ['The Lilliputians allowed Gulliver food for 1728 of their people.', true, '12 × 12 × 12 = 1728.'],
  ['Lilliput and Blefuscu fought over which end of an egg to break.', true, 'Big-Endians and Little-Endians.'],
  ['The king of Brobdingnag admired England\'s wars and politicians.', false, 'He was shocked by Gulliver\'s account.'],
  ['Laputa is a flying island.', true, 'Part III.'],
  ['The Houyhnhnms are wise horses.', true, 'Part IV.'],
  ['Swift said he wrote the book to vex the world rather than divert it.', true, 'In a letter to Alexander Pope.'],
  ['Gulliver\'s Travels was first published in 1826.', false, 'It was published in 1726.']],
 items: [
  { q: 'Who takes care of Gulliver in Brobdingnag?', r: 'Glumdalclitch, a farmer\'s daughter', w: ['The emperor of Lilliput', 'A Houyhnhnm', 'A Laputan scholar'], why: 'Part II.' },
  { q: 'What did the king of Brobdingnag say deserved better of mankind than all the politicians?', r: 'Making two ears of corn grow where one grew before', w: ['Winning a great war', 'Writing a long book', 'Building a palace'], why: 'Part II, ch. VII.' },
  { q: 'How do the Lilliputians\' officials win high office?', r: 'By rope-dancing', w: ['By election', 'By a writing contest', 'By inheritance only'], why: 'Part I, ch. III.' },
  { q: 'What does Part III\'s Academy of Lagado mock?', r: 'Learning cut off from common sense', w: ['Horse racing', 'Sea travel', 'Farming'], why: 'Projects like sunbeams from cucumbers.' },
  { q: 'Where was Swift Dean of the cathedral?', r: 'St Patrick\'s, Dublin', w: ['St Paul\'s, London', 'Notre-Dame, Paris', 'St Giles\', Edinburgh'], why: 'From 1713.' }] };
H.T(ID, B, [famScale, famScale, famLilli, function (R, lv) { return famSeq(R, lv, VOY, 'voyages'); }, function (R, lv) { return famMatch(R, lv, PL, 'In Gulliver\'s Travels, what is #?', 'In Gulliver\'s Travels, which place or people is: #?'); }].concat(dateFams(ID)), 0.6);
