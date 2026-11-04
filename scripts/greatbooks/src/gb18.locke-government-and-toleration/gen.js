/* gb18.locke-government-and-toleration: practice generator (gbw3). */
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
var ID = 'gb18.locke-government-and-toleration';
var PATH = [['the state of nature, under the law of nature', 1, ''], ['the troubles: no known law, no fair judge', 2, ''], ['people consent to join one society', 3, ''], ['a legislature makes settled, known laws', 4, ''], ['a long train of abuses breaks the trust', 5, ''], ['the people set up a new legislature', 6, '']];
var EV = [['the English Civil War begins', 1642, '1642'], ['Locke is born', 1632, '1632'], ['Charles II restored to the throne', 1660, '1660'], ['the Glorious Revolution', 1688, '1688'], ['Two Treatises and the Letter Concerning Toleration published', 1689, '1689'], ['the American Declaration of Independence', 1776, '1776']];
var TERMS = [['state of nature', 'people living with no common judge over them'], ['law of nature', 'the moral law reason teaches: harm no one in life, health, liberty or possessions'], ['consent', 'agreeing to join a political society'], ['property (Locke\'s wide sense)', 'a person\'s life, liberty and estate'], ['tacit consent', 'agreement shown by living under a government and enjoying its benefits'], ['legislative power', 'the supreme power to make the laws'], ['toleration', 'not using force to make people change their religion']];
var WHO = [['Locke', 'Mixing your labor with something from nature makes it your property.'], ['Filmer', 'Kings inherit their power from Adam, the first father.'], ['Locke', 'The magistrate\'s power is outward force, but belief is the inward persuasion of the mind.'], ['Hume', 'Most governments did not begin by consent but by conquest and habit.'], ['Locke', 'A government that breaks its trust dissolves itself.'], ['Hobbes', 'Without a common power, life would be a war of all against all.']];
var B = { facts: [
  ['Locke says the state of nature is a state of liberty but not of license.', true, 'Second Treatise, §6.'],
  ['For Locke, the law of nature applies only after a government is formed.', false, 'It binds everyone even in the state of nature.'],
  ['Locke says labor joined to something from nature makes it one\'s property.', true, '§27.'],
  ['Locke says there must be enough, and as good, left in common for others.', true, 'A limit on taking property, §27.'],
  ['Locke thought the legislature may take people\'s property without their consent.', false, 'It may not; taxes need the consent of the people or their representatives.'],
  ['The First Treatise answers Sir Robert Filmer.', true, 'Filmer defended the divine right of kings.'],
  ['Locke said people may overthrow a government for any small mistake.', false, 'Only after a long train of abuses against its trust.'],
  ['Locke\'s Letter argues that belief can\'t be forced by outward penalties.', true, 'Such is the nature of the understanding.'],
  ['Locke\'s Letter extended toleration to everyone without exception.', false, 'He excluded atheists and churches he thought owed obedience to a foreign ruler.'],
  ['Locke published the Two Treatises without his name.', true, 'They appeared anonymously in 1689.']],
 items: [
  { q: 'What problem of the state of nature makes people want government, in Locke\'s account?', r: 'Everyone judges his own case, and there is no impartial judge', w: ['There is no law of nature', 'People are too equal', 'There is no religion'], why: 'Second Treatise, ch. IX.' },
  { q: 'How, for Locke, does something from the common earth become yours?', r: 'By mixing your labor with it', w: ['By the king\'s gift', 'By being the first to see it', 'By buying it with gold'], why: '§27.' },
  { q: 'Which power does Locke call supreme in a commonwealth?', r: 'The legislative', w: ['The executive', 'The judges', 'The church'], why: 'ch. XI and XIII.' },
  { q: 'Why can\'t the care of souls belong to the magistrate, according to the Letter?', r: 'His power is outward force, and belief can\'t be compelled by force', w: ['Because magistrates are not educated', 'Because churches are richer', 'Because the king forbids it'], why: 'A Letter Concerning Toleration.' },
  { q: 'What event of 1688 forms the background of the Two Treatises\' publication?', r: 'The Glorious Revolution', w: ['The Spanish Armada', 'The American Revolution', 'The Great Fire of London'], why: 'James II was replaced by William and Mary.' },
  { q: 'Which American document is often said to echo Locke?', r: 'The Declaration of Independence', w: ['The Northwest Ordinance', 'The Emancipation Proclamation', 'The Monroe Doctrine'], why: 'Equality, rights and government by consent.' }] };
H.T(ID, B, [function (R, lv) { return famSeq(R, lv, PATH, 'steps in Locke\'s argument'); }, function (R, lv) { return famSeq(R, lv, EV, 'events'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'Locke\'s political writings'); }, function (R, lv) { return famWho(R, lv, WHO, 'the debate about government'); }].concat(dateFams(ID)), 0.55);
