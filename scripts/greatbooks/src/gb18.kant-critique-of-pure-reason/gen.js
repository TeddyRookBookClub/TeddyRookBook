/* gb18.kant-critique-of-pure-reason: practice generator (gbw3). */
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
var ID = 'gb18.kant-critique-of-pure-reason';
var JD = [['All bodies are extended.', 'analytic a priori', 'Kant\'s example: extension is part of the concept of body.'], ['All bachelors are unmarried.', 'analytic a priori', ''], ['7 + 5 = 12.', 'synthetic a priori', 'Kant\'s example: 12 is not contained in the concept of 7 + 5.'], ['Every event has a cause.', 'synthetic a priori', 'A first principle of experience, for Kant.'], ['A straight line is the shortest path between two points.', 'synthetic a priori', 'Kant\'s geometry example.'], ['All bodies are heavy.', 'synthetic a posteriori', 'Kant\'s example: weight is learned by experience.'], ['This rose is red.', 'synthetic a posteriori', ''], ['It is raining in Königsberg.', 'synthetic a posteriori', '']];
var CATS = ['analytic a priori', 'synthetic a priori', 'synthetic a posteriori'];
var TERMS = [['a priori', 'known independently of experience'], ['a posteriori', 'known from experience'], ['analytic judgment', 'one whose predicate is contained in the subject'], ['synthetic judgment', 'one that adds something not contained in the subject'], ['forms of intuition', 'space and time, the ways anything must appear to us'], ['categories', 'the understanding\'s pure concepts, such as unity, substance and cause'], ['thing in itself', 'a thing as it is apart from how it appears to us'], ['antinomy', 'a pair of equally strong proofs of opposite conclusions']];
var EV = [['Hume\'s Enquiry', 1748, '1748'], ['Kant becomes professor at Königsberg', 1770, '1770'], ['first edition of the Critique of Pure Reason', 1781, '1781'], ['Prolegomena to Any Future Metaphysics', 1783, '1783'], ['second edition of the Critique', 1787, '1787'], ['Critique of Judgment', 1790, '1790']];
var WHO = [['Kant', 'Though all knowledge begins with experience, not all of it arises from experience.'], ['Hume', 'We never observe a necessary connection between cause and effect.'], ['Locke', 'The mind begins as white paper and gets all its ideas from experience.'], ['Kant', 'Let us try supposing that objects must conform to our knowledge.'], ['Berkeley', 'For sensible things, to be is to be perceived.']];
var B = { facts: [
  ['Kant says all our knowledge begins with experience.', true, 'Introduction, §I.'],
  ['Kant says all our knowledge arises out of experience.', false, 'It begins with experience but does not all arise from it.'],
  ['Kant compares his new approach to Copernicus.', true, 'Preface to the second edition.'],
  ['For Kant, space and time are forms of our intuition.', true, 'The Transcendental Aesthetic.'],
  ['Kant held that we can know things in themselves through careful science.', false, 'We know only appearances.'],
  ['Kant thought 7 + 5 = 12 is an analytic judgment.', false, 'He counted it synthetic a priori.'],
  ['Kant wrote that thoughts without content are empty and intuitions without concepts are blind.', true, 'In Meiklejohn: void and blind.'],
  ['Kant believed reason could prove God\'s existence by theoretical argument.', false, 'He argued such proofs go beyond possible experience.'],
  ['Kant spent nearly his whole life in Königsberg.', true, 'He rarely traveled.']],
 items: [
  { q: 'What does Kant say woke him from his dogmatic slumber?', r: 'Reading Hume', w: ['Reading Plato', 'A trip to Paris', 'An earthquake'], why: 'Prolegomena.' },
  { q: 'What is the main question of the Critique?', r: 'How are synthetic a priori judgments possible?', w: ['Is the soul made of atoms?', 'Which government is best?', 'What is the origin of language?'], why: 'Introduction.' },
  { q: 'Which are, for Kant, the two forms of intuition?', r: 'Space and time', w: ['Cause and effect', 'Matter and form', 'Pleasure and pain'], why: 'Transcendental Aesthetic.' },
  { q: 'What does Kant call the contradictions reason falls into about the world as a whole?', r: 'Antinomies', w: ['Categories', 'Intuitions', 'Maxims'], why: 'The Transcendental Dialectic.' },
  { q: 'Who translated the Critique in 1855, the version quoted here?', r: 'J. M. D. Meiklejohn', w: ['Thomas Abbott', 'J. H. Bernard', 'G. D. H. Cole'], why: 'Bohn\'s Philosophical Library.' }] };
H.T(ID, B, [function (R, lv) { return famClass(R, lv, JD, CATS, 'In Kant\'s terms, what kind of judgment is #'); }, function (R, lv) { return famClass(R, lv, JD, CATS, 'Sort this judgment as Kant would: #'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'the Critique of Pure Reason'); }, function (R, lv) { return famSeq(R, lv, EV, 'events'); }, function (R, lv) { return famWho(R, lv, WHO, 'the debate about knowledge'); }].concat(dateFams(ID)), 0.6);
