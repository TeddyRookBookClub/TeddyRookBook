/* gb18.rousseau-social-contract: practice generator (gbw3). */
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
var ID = 'gb18.rousseau-social-contract';
function famShare(R, lv) {
  var n = R.pick([1000, 5000, 10000, 20000, 50000, 100000]), k = R.pick([2, 5, 10]);
  if (lv === 1 || R.coin()) return H.num('Rousseau supposes a State of ' + n.toLocaleString('en-US') + ' citizens. Each has 1/N of the sovereign authority. What is N?', n, ['Each citizen\'s share is 1/' + n.toLocaleString('en-US') + ' (Book III, ch. 1).']);
  return H.num('A State of ' + n.toLocaleString('en-US') + ' citizens grows to ' + (n * k).toLocaleString('en-US') + '. By what factor does each citizen\'s share of the sovereign shrink?', k, ['Share before: 1/' + n.toLocaleString('en-US') + '; after: 1/' + (n * k).toLocaleString('en-US') + '.', 'The share is ' + k + ' times smaller, though each is still wholly under the law. Rousseau: \"the larger the State, the less the liberty.\"']);
}
var TERMS = [['sovereign', 'the whole people as law-maker'], ['government', 'the officials who carry out the laws, between sovereign and subjects'], ['general will', 'the will directed to the common good'], ['will of all', 'the sum of private wishes'], ['social contract', 'each gives himself wholly to the community, on equal terms'], ['law', 'an act of the general will about matters common to all'], ['civil religion', 'a short public creed with tolerance of all religions that tolerate others']];
var BK = [['Book I: the social compact', 1, ''], ['Book II: sovereignty and law', 2, ''], ['Book III: forms of government', 3, ''], ['Book IV: voting, the Roman assemblies and civil religion', 4, '']];
var B = { facts: [
  ['The Social Contract begins, \"Man is born free; and everywhere he is in chains.\"', true, 'Book I, ch. 1.'],
  ['Rousseau says force can make right.', false, 'If might made right, the right would vanish with the might.'],
  ['For Rousseau, the general will can be represented by elected deputies.', false, 'Sovereignty can\'t be represented.'],
  ['Rousseau distinguishes the general will from the will of all.', true, 'Book II, ch. 3.'],
  ['Rousseau wrote that whoever refuses to obey the general will may be forced to be free.', true, 'Book I, ch. 7.'],
  ['Rousseau says the larger the State, the less the liberty.', true, 'Book III, ch. 1.'],
  ['Rousseau thought true democracy suits every large nation.', false, 'Only a small people of great virtue.'],
  ['The Social Contract was condemned in Paris and Geneva.', true, '1762.'],
  ['For Rousseau, the government is the sovereign.', false, 'The government is only the people\'s agent; the people are sovereign.']],
 items: [
  { q: 'What question does Rousseau say he can answer?', r: 'What can make the chains legitimate?', w: ['How did the chains begin?', 'Who invented money?', 'Why do kings exist?'], why: 'He says he doesn\'t know how the change came about.' },
  { q: 'Which phrase of Rousseau\'s have critics found most troubling?', r: '\"Forced to be free\"', w: ['\"All is for the best\"', '\"Cultivate our garden\"', '\"Extend the sphere\"'], why: 'Book I, ch. 7.' },
  { q: 'Which revolutionaries honored Rousseau and moved his remains to the Panthéon?', r: 'The French revolutionaries, especially the Jacobins', w: ['The American Federalists', 'The English Parliament of 1688', 'The Roman senate'], why: '1794.' },
  { q: 'Which novel on education did Rousseau publish the same year?', r: 'Emile', w: ['Candide', 'Rasselas', 'Persian Letters'], why: '1762.' },
  { q: 'What, for Rousseau, is a law?', r: 'An act of the general will about matters common to all', w: ['Any command of a king', 'A custom of the rich', 'A rule of the church'], why: 'Book II, ch. 6.' }] };
H.T(ID, B, [famShare, famShare, function (R, lv) { return famTerm(R, lv, TERMS, 'The Social Contract'); }, function (R, lv) { return famSeq(R, lv, BK, 'books of The Social Contract'); }].concat(dateFams(ID)), 0.6);
