/* gb18.voltaire-candide: practice generator (gbw3). */
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
var ID = 'gb18.voltaire-candide';
var ROUTE = [['the castle in Westphalia', 1, 'ch. I'], ['Lisbon and the earthquake', 2, 'ch. V–VI'], ['Buenos Aires', 3, 'ch. XIII'], ['Paraguay', 4, 'ch. XIV'], ['El Dorado', 5, 'ch. XVII–XVIII'], ['Surinam', 6, 'ch. XIX'], ['Paris', 7, 'ch. XXII'], ['Venice', 8, 'ch. XXIV–XXVI'], ['the garden near Constantinople', 9, 'ch. XXX']];
var WHO = [['Pangloss', 'All is for the best in this best of all possible worlds.'], ['Martin', 'The world is mostly evil, and people were born to live in restlessness or boredom.'], ['Candide', 'That is well said, but we must cultivate our garden.'], ['The old Turk', 'Work keeps away three great evils: boredom, vice and need.'], ['Pangloss', 'Noses were made to wear spectacles, so we have spectacles.'], ['Cacambo', 'If this world won\'t do, let us try another.']];
var CH = [['Pangloss', 'Candide\'s tutor, the endless optimist'], ['Cunégonde', 'the Baron\'s daughter whom Candide loves'], ['Martin', 'a gloomy scholar who expects the worst'], ['Cacambo', 'Candide\'s loyal servant'], ['the old woman', 'Cunégonde\'s companion, who tells a tale of misfortunes'], ['Jacques', 'the kind Anabaptist in Holland']];
var B = { facts: [
  ['Pangloss teaches that this is the best of all possible worlds.', true, 'Candide, ch. I.'],
  ['Candide is expelled from the castle for kissing Cunégonde.', true, 'ch. I.'],
  ['Voltaire published Candide under his own name with royal approval.', false, 'It appeared anonymously and was banned in places.'],
  ['The Lisbon earthquake of 1755 helped prompt Voltaire\'s attack on optimism.', true, 'He also wrote a poem on it.'],
  ['In El Dorado gold is as common as pebbles.', true, 'ch. XVII.'],
  ['Candide decides to stay forever in El Dorado.', false, 'He leaves with treasure to find Cunégonde.'],
  ['The book ends with \"let us cultivate our garden.\"', true, 'ch. XXX.'],
  ['Martin agrees with Pangloss that all is for the best.', false, 'Martin is a pessimist.'],
  ['Voltaire was the pen name of François-Marie Arouet.', true, '1694–1778.']],
 items: [
  { q: 'Which philosopher\'s idea of the best of all possible worlds does Candide mock?', r: 'Leibniz', w: ['Locke', 'Kant', 'Hume'], why: 'Through Pangloss.' },
  { q: 'What disaster strikes when Candide reaches Lisbon?', r: 'An earthquake', w: ['A flood', 'A fire', 'A plague'], why: 'ch. V.' },
  { q: 'What does Candide finally say they must do?', r: 'Cultivate their garden', w: ['Return to El Dorado', 'Write a philosophy book', 'Go back to the castle'], why: 'ch. XXX.' },
  { q: 'Where do Candide and his friends settle at the end?', r: 'On a small farm near Constantinople', w: ['In Paris', 'In El Dorado', 'In the Baron\'s castle'], why: 'ch. XXX.' },
  { q: 'What kind of book is Candide?', r: 'A satire', w: ['A history', 'A dictionary', 'A treatise on law'], why: 'A comic tale aimed at optimism.' }] };
H.T(ID, B, [function (R, lv) { return famSeq(R, lv, ROUTE, 'stops on Candide\'s journey'); }, function (R, lv) { return famWho(R, lv, WHO, 'Candide'); }, function (R, lv) { return famMatch(R, lv, CH, 'In Candide, who is #?', 'In Candide, which character is #?'); }, function (R, lv) { return famFirst(R, lv, ROUTE, 'stops'); }].concat(dateFams(ID)), 0.6);
