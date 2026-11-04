/* gb18.montesquieu-spirit-of-laws: practice generator (gbw3). */
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
var ID = 'gb18.montesquieu-spirit-of-laws';
var PRIN = [['republic', 'virtue'], ['monarchy', 'honor'], ['despotism', 'fear']];
var POW = [['the legislative power', 'makes the laws'], ['the executive power', 'carries out the laws'], ['the power of judging', 'tries crimes and settles disputes']];
var JOIN = [['legislative and executive joined', 'no liberty: tyrannical laws carried out tyrannically', 'XI.6.'], ['judging joined to legislative', 'arbitrary control over life and liberty, for the judge would be the legislator', 'XI.6.'], ['judging joined to executive', 'the judge might behave with violence and oppression', 'XI.6.'], ['all three powers in one person or body', 'an end of everything: despotism', 'XI.6.'], ['each power in different hands', 'power checks power, and liberty is possible', 'XI.4 and XI.6.']];
var EV = [['Persian Letters', 1721, '1721'], ['Montesquieu\'s stay in England', 1730, '1729–1731'], ['The Spirit of Laws', 1748, '1748'], ['Nugent\'s English translation', 1750, '1750'], ['the Constitutional Convention', 1787, '1787'], ['Federalist No. 47 cites \"the celebrated Montesquieu\"', 1788, '1788']];
var B = { facts: [
  ['Montesquieu says power should be a check to power.', true, 'XI.4.'],
  ['For Montesquieu, the principle of a monarchy is fear.', false, 'Honor; fear is the principle of despotism.'],
  ['The principle of a republic, for Montesquieu, is virtue.', true, 'Book III.'],
  ['Montesquieu says that when legislative and executive powers are united there can be no liberty.', true, 'XI.6.'],
  ['Montesquieu thought laws should be the same in every country.', false, 'Laws should fit each people\'s government, climate and customs.'],
  ['Montesquieu described the constitution of England as a model of liberty.', true, 'XI.6.'],
  ['The Spirit of Laws was translated into English by Thomas Nugent.', true, '1750.'],
  ['Montesquieu defended slavery in Book XV.', false, 'He attacked it with irony.'],
  ['Montesquieu was a judge in Bordeaux.', true, 'In the parlement of Bordeaux.'],
  ['Political liberty, for Montesquieu, is doing whatever one wants.', false, 'It is security under laws, so that no one need fear another.']],
 items: [
  { q: 'What, for Montesquieu, is political liberty?', r: 'The security of living under laws, without fear of other citizens', w: ['Doing whatever one wants', 'Having no laws', 'Voting on every question'], why: 'XI.6.' },
  { q: 'Which country\'s constitution did Montesquieu describe in his famous chapter on liberty?', r: 'England\'s', w: ['France\'s', 'Persia\'s', 'China\'s'], why: 'XI.6.' },
  { q: 'Which earlier book by Montesquieu satirized France through the eyes of Persian visitors?', r: 'The Persian Letters', w: ['Candide', 'Gulliver\'s Travels', 'The Social Contract'], why: '1721.' },
  { q: 'Which Federalist essay calls Montesquieu the \"oracle\" on separation of powers?', r: 'No. 47', w: ['No. 1', 'No. 10', 'No. 85'], why: 'By Madison.' },
  { q: 'Which things did Montesquieu say laws should fit?', r: 'A people\'s government, climate, customs, commerce and religion', w: ['Only the wishes of the king', 'Only the Bible', 'Only ancient Roman law'], why: 'The \"spirit\" of the laws.' }] };
H.T(ID, B, [function (R, lv) { return famMatch(R, lv, PRIN, 'For Montesquieu, what is the principle of a #?', 'For Montesquieu, which government has the principle of #?'); }, function (R, lv) { return famMatch(R, lv, POW, 'In Montesquieu\'s three powers, what does # do?', 'Which of Montesquieu\'s powers #?'); }, function (R, lv) { return famMatch(R, lv, JOIN, 'Montesquieu (XI.6): what happens with #?'); }, function (R, lv) { return famSeq(R, lv, EV, 'events'); }].concat(dateFams(ID)), 0.6);
