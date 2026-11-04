/* gb18.federalist-papers: practice generator (gbw3). */
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
var ID = 'gb18.federalist-papers';
var NUM = [['No. 1', 'whether good government can come from reflection and choice'], ['No. 10', 'controlling the effects of faction in a large republic'], ['No. 39', 'the new government as partly national and partly federal'], ['No. 47', 'Montesquieu and the separation of powers'], ['No. 51', 'ambition made to counteract ambition'], ['No. 70', 'energy in the executive'], ['No. 78', 'the judiciary as the least dangerous branch'], ['No. 84', 'why a bill of rights is not needed']];
var AUTH = [['No. 10', 'James Madison'], ['No. 51', 'James Madison'], ['No. 47', 'James Madison'], ['No. 1', 'Alexander Hamilton'], ['No. 70', 'Alexander Hamilton'], ['No. 78', 'Alexander Hamilton'], ['No. 84', 'Alexander Hamilton'], ['No. 2', 'John Jay']];
var WHO = [['Publius (Madison)', 'Extend the sphere, and you take in a greater variety of parties and interests.'], ['Publius (Madison)', 'If men were angels, no government would be necessary.'], ['Publius (Hamilton)', 'The judiciary is the least dangerous branch.'], ['Brutus (an Anti-Federalist)', 'A republic as large as the United States will be ruled by a distant few.'], ['Publius (Hamilton)', 'A bill of rights is unnecessary in a government of limited powers.'], ['Montesquieu', 'When the legislative and executive powers are united, there can be no liberty.']];
var TERMS = [['faction', 'a group moved by an interest against others\' rights or the common good'], ['republic', 'a government in which a scheme of representation takes place'], ['pure democracy', 'citizens meeting and governing in person'], ['Publius', 'the pen name shared by the three authors'], ['Anti-Federalists', 'opponents of the Constitution during ratification'], ['separation of powers', 'legislative, executive and judicial powers in different hands'], ['checks and balances', 'each branch given means to resist the others']];
function famCount(R, lv) {
  var k = R.pick(['h', 'm', 'j', 't']);
  if (k === 't') return H.num('How many essays are in The Federalist?', 85, ['There are 85 essays, published 1787–1788.']);
  return H.num('By the common count, how many of the 85 essays did ' + { h: 'Alexander Hamilton', m: 'James Madison', j: 'John Jay' }[k] + ' write?', { h: 51, m: 29, j: 5 }[k], ['Common count: Hamilton 51, Madison 29, Jay 5 (51 + 29 + 5 = 85).']);
}
var B = { facts: [
  ['The Federalist essays first appeared in New York newspapers.', true, '1787–1788.'],
  ['The authors signed their essays with their own names.', false, 'They used the shared pen name Publius.'],
  ['In No. 10 Madison argues a large republic controls faction better than a small one.', true, '\"Extend the sphere.\"'],
  ['Madison thought the causes of faction could be removed without harming liberty.', false, 'He said we must control the effects instead.'],
  ['No. 51 says ambition must be made to counteract ambition.', true, 'Madison.'],
  ['Hamilton called the judiciary the most dangerous branch.', false, 'The least dangerous (No. 78).'],
  ['John Jay wrote the fewest of the essays.', true, 'He fell ill.'],
  ['Hamilton argued in No. 84 that a bill of rights was unnecessary.', true, 'Anti-Federalists disagreed.'],
  ['The Federalist was written to support ratification of the Constitution.', true, 'Especially in New York.']],
 items: [
  { q: 'What pen name did Hamilton, Madison and Jay share?', r: 'Publius', w: ['Brutus', 'Cato', 'Federal Farmer'], why: 'After a founder of the Roman republic.' },
  { q: 'What is Madison\'s remedy for faction in No. 10?', r: 'A large republic with many interests and elected representatives', w: ['Banning political parties', 'Making everyone think alike', 'A pure democracy'], why: 'Federalist No. 10.' },
  { q: 'Which essay contains \"If men were angels, no government would be necessary\"?', r: 'No. 51', w: ['No. 1', 'No. 10', 'No. 78'], why: 'Madison, 1788.' },
  { q: 'Who called The Federalist the best commentary on the principles of government ever written?', r: 'Thomas Jefferson', w: ['George III', 'Montesquieu', 'Adam Smith'], why: 'In a letter to Madison, 1788.' },
  { q: 'What did Anti-Federalists most want added to the Constitution?', r: 'A bill of rights', w: ['A king', 'A national church', 'A larger army'], why: 'It came in 1791.' }] };
H.T(ID, B, [famCount, function (R, lv) { return famMatch(R, lv, NUM, 'What is Federalist # about?', 'Which Federalist essay is about #?'); }, function (R, lv) { return famMatch(R, lv, AUTH, 'Who wrote Federalist #, by the common attribution?'); }, function (R, lv) { return famWho(R, lv, WHO, 'the ratification debate'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'The Federalist'); }].concat(dateFams(ID)), 0.6);
