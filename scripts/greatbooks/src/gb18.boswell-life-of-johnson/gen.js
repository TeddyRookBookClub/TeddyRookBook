/* gb18.boswell-life-of-johnson: practice generator (gbw3). */
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
var ID = 'gb18.boswell-life-of-johnson';
var EV = [['Johnson born in Lichfield', 1709, '1709'], ['Boswell born in Edinburgh', 1740, '1740'], ['Johnson\'s Dictionary', 1755, '1755'], ['Rasselas', 1759, '1759'], ['Boswell meets Johnson', 1763, '1763'], ['the tour to the Hebrides', 1773, '1773'], ['Johnson dies', 1784, '1784'], ['the Life of Samuel Johnson published', 1791, '1791']];
var WORKS = [['A Dictionary of the English Language', 'Samuel Johnson'], ['Rasselas', 'Samuel Johnson'], ['The Lives of the Poets', 'Samuel Johnson'], ['The Rambler', 'Samuel Johnson'], ['The Life of Samuel Johnson', 'James Boswell'], ['The Journal of a Tour to the Hebrides', 'James Boswell'], ['The Decline and Fall of the Roman Empire', 'Edward Gibbon'], ['She Stoops to Conquer', 'Oliver Goldsmith']];
function famAge(R, lv) {
  var p = R.pick([['Johnson', 1709, 1763, 'when he met Boswell'], ['Boswell', 1740, 1763, 'when he met Johnson'], ['Johnson', 1709, 1755, 'when his Dictionary appeared'], ['Boswell', 1740, 1791, 'when the Life was published'], ['Johnson', 1709, 1784, 'when he died']]);
  return H.num('About how old was ' + p[0] + ' (born ' + p[1] + ') ' + p[3] + ' in ' + p[2] + '?', p[2] - p[1], ['$' + p[2] + ' - ' + p[1] + ' = ' + (p[2] - p[1]) + '$ (give or take a year, depending on the month).'], { rtol: 0.03 });
}
var B = { facts: [
  ['Boswell first met Johnson in a London bookshop in 1763.', true, 'Thomas Davies\'s shop.'],
  ['Johnson made the first great English dictionary almost by himself.', true, '1755.'],
  ['Boswell was English, from Lichfield.', false, 'Boswell was Scottish; Johnson was from Lichfield.'],
  ['Johnson and Boswell toured the Hebrides together in 1773.', true, 'Boswell published his journal in 1785.'],
  ['The Life of Samuel Johnson was published in 1791.', true, 'Seven years after Johnson\'s death.'],
  ['Boswell\'s Life leaves out all of Johnson\'s faults.', false, 'It shows him faults and all.'],
  ['Johnson\'s letter to Lord Chesterfield complains of help that came too late.', true, '1755.'],
  ['Boswell\'s private journals were found in the 20th century.', true, 'In Ireland and Scotland.'],
  ['Johnson and Reynolds founded The Club in 1764.', true, 'Burke, Goldsmith, Gibbon and Smith were later members.']],
 items: [
  { q: 'What did Boswell say when he first met Johnson?', r: '\"I do indeed come from Scotland, but I cannot help it.\"', w: ['\"Sir, I have read your Dictionary.\"', '\"I refute it thus.\"', '\"Let us cultivate our garden.\"'], why: 'Life of Johnson, 1763.' },
  { q: 'How did Boswell gather the talk in the Life?', r: 'He wrote down conversations soon after, often the same night', w: ['He used a recording machine', 'He made it all up later', 'Johnson dictated it to him'], why: 'From his journals.' },
  { q: 'What made Boswell\'s biography new?', r: 'A living portrait, faults and all, mostly in Johnson\'s own words', w: ['It was the first book in English', 'It was written in Latin', 'It had no dates'], why: 'Earlier lives were mostly praise.' },
  { q: 'Who, in Johnson\'s letter, is like one who watches a man struggling in the water and then helps when he reaches ground?', r: 'A patron', w: ['A friend', 'A doctor', 'A teacher'], why: 'The letter to Lord Chesterfield.' },
  { q: 'Where was Johnson buried?', r: 'Westminster Abbey', w: ['St Paul\'s Cathedral', 'Lichfield Cathedral', 'Edinburgh'], why: '1784.' }] };
H.T(ID, B, [function (R, lv) { return famSeq(R, lv, EV, 'events'); }, function (R, lv) { return famMatch(R, lv, WORKS, 'Who wrote #?'); }, famAge, function (R, lv) { return famFirst(R, lv, EV, 'events'); }].concat(dateFams(ID)), 0.6);
