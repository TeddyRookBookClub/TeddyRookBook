/* gb18.kant-moral-philosophy: practice generator (gbw3). */
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
var ID = 'gb18.kant-moral-philosophy';
var MAX = [['make a promise I don\'t intend to keep when I need money', 'fails: can\'t even be thought as a universal law', 'Kant\'s example: promises would no longer be believed.'], ['cut in line whenever I\'m in a hurry', 'fails: can\'t even be thought as a universal law', 'There would be no lines.'], ['never help anyone in need, though I could', 'fails: can\'t be willed without contradiction', 'Kant\'s example: I will need help someday.'], ['let my talents rust and only amuse myself', 'fails: can\'t be willed without contradiction', 'Kant\'s example of a duty to oneself.'], ['keep my promises', 'passes: can be a universal law', ''], ['tell the truth when asked', 'passes: can be a universal law', ''], ['return what I borrow', 'passes: can be a universal law', '']];
var VERD = ['fails: can\'t even be thought as a universal law', 'fails: can\'t be willed without contradiction', 'passes: can be a universal law'];
var IMP = [['If you want to be healthy, exercise.', 'hypothetical imperative', 'It binds only if you want the goal.'], ['If you want to win, practice.', 'hypothetical imperative', ''], ['Do not make false promises.', 'categorical imperative', 'It commands with no \"if.\"'], ['Treat every person as an end, never merely as a means.', 'categorical imperative', ''], ['If you want to be liked, be polite.', 'hypothetical imperative', ''], ['Act only on a maxim you could will as a universal law.', 'categorical imperative', '']];
var TERMS = [['good will', 'the only thing good without qualification'], ['duty', 'the necessity of acting from respect for the moral law'], ['maxim', 'the personal rule behind an action'], ['categorical imperative', 'a command that holds with no \"if\"'], ['hypothetical imperative', 'a command that holds only if you want a certain goal'], ['autonomy', 'giving the moral law to oneself through reason'], ['kingdom of ends', 'a union of rational beings, each a law-maker and each an end'], ['dignity', 'a worth beyond any price']];
var EV = [['Fundamental Principles (Groundwork)', 1785, '1785'], ['Critique of Practical Reason', 1788, '1788'], ['Critique of Judgment', 1790, '1790'], ['The Metaphysics of Morals', 1797, '1797'], ['Kant dies', 1804, '1804']];
var B = { facts: [
  ['Kant says nothing is good without qualification except a good will.', true, 'Fundamental Principles, First Section.'],
  ['For Kant, an action done only for profit has full moral worth if it is right.', false, 'The prudent shopkeeper acts rightly but not from duty.'],
  ['Kant\'s first formula asks whether your maxim could be a universal law.', true, 'Second Section.'],
  ['Kant\'s test works by adding up good and bad results for everyone.', false, 'It tests whether the maxim can consistently be a law.'],
  ['Kant says to treat humanity always as an end, never as a means only.', true, 'The formula of humanity.'],
  ['Kant held that moral commands are hypothetical.', false, 'Morality commands categorically.'],
  ['Kant was filled with awe by the starry heavens above and the moral law within.', true, 'Conclusion of the Critique of Practical Reason.'],
  ['Kant postulates God and immortality as hopes of practical reason, not as proved knowledge.', true, 'Critique of Practical Reason.'],
  ['Hegel praised the universal-law test as full of content.', false, 'He called it empty.']],
 items: [
  { q: 'In Kant\'s example, why does the lying promise fail the test?', r: 'If everyone did it, no one would believe a promise', w: ['It makes people sad', 'It is against the law', 'It is impolite'], why: 'The maxim destroys itself as a law.' },
  { q: 'Which philosopher, later on the ladder, judged actions by their consequences for happiness?', r: 'John Stuart Mill', w: ['George Berkeley', 'Montesquieu', 'Jonathan Swift'], why: 'Utilitarianism.' },
  { q: 'What does \"ought implies can\" show, for Kant?', r: 'That we are free', w: ['That God exists', 'That space is real', 'That pleasure is good'], why: 'Critique of Practical Reason.' },
  { q: 'What is a maxim?', r: 'The personal rule behind an action', w: ['A law passed by a king', 'A famous saying', 'A kind of syllogism'], why: 'Kant\'s term.' },
  { q: 'Who translated the ethical works quoted on this rung?', r: 'Thomas Kingsmill Abbott', w: ['J. M. D. Meiklejohn', 'William Popple', 'Thomas Nugent'], why: 'Longmans, 1873 onward.' }] };
H.T(ID, B, [function (R, lv) { return famClass(R, lv, MAX, VERD, 'Run Kant\'s test on the maxim \"I will #.\" What is the result?'); }, function (R, lv) { return famClass(R, lv, IMP, ['hypothetical imperative', 'categorical imperative'], 'Is this a hypothetical or a categorical imperative? #'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'Kant\'s ethics'); }, function (R, lv) { return famSeq(R, lv, EV, 'works'); }].concat(dateFams(ID)), 0.6);
