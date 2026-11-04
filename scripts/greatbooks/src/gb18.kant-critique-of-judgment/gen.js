/* gb18.kant-critique-of-judgment: practice generator (gbw3). */
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
var ID = 'gb18.kant-critique-of-judgment';
var SC = [['the taste of your favorite ice cream', 'pleasant (agreeable)', 'It pleases the senses; others may differ.'], ['a rose', 'beautiful', 'It pleases without a concept, and we expect agreement.'], ['a bird\'s song', 'beautiful', ''], ['the starry sky at night', 'sublime', 'Vast: the mathematically sublime.'], ['a storm at sea, seen from a safe shore', 'sublime', 'Mighty: the dynamically sublime.'], ['the great pyramids seen up close', 'sublime', 'Kant\'s own example of the vast.'], ['a well-made hammer', 'good (useful)', 'Liked for its purpose.'], ['a kind act', 'good (useful)', 'Liked through a concept of what ought to be.']];
var KINDS = ['pleasant (agreeable)', 'beautiful', 'sublime', 'good (useful)'];
var TERMS = [['disinterested', 'not depending on wanting to own or use the thing'], ['purposiveness without purpose', 'seeming designed, though for no purpose we can name'], ['mathematically sublime', 'something so vast that imagination can\'t take it in'], ['dynamically sublime', 'overwhelming power, enjoyed when we are safe'], ['genius', 'a talent that gives the rule to art'], ['teleological judgment', 'judging things, especially living things, as organized for purposes'], ['agreeable', 'what pleases the senses of a particular person']];
var EV = [['Critique of Pure Reason', 1781, '1781'], ['Critique of Practical Reason', 1788, '1788'], ['Critique of Judgment', 1790, '1790'], ['Bernard\'s English translation', 1892, '1892'], ['Darwin\'s Origin of Species', 1859, '1859']];
var B = { facts: [
  ['Kant says the beautiful pleases universally, without a concept.', true, 'End of §9.'],
  ['For Kant, calling something beautiful is just stating a private taste.', false, 'It claims everyone\'s agreement, unlike the agreeable.'],
  ['Kant calls sublime what is absolutely great.', true, '§25.'],
  ['Kant says we can enjoy a storm as sublime only when we are safe.', true, 'The dynamically sublime.'],
  ['Kant thought beauty can be proved by rules.', false, 'No rule or concept proves it.'],
  ['The second part of the book is about purpose in living things.', true, 'The critique of teleological judgment.'],
  ['Kant said a new Newton would surely explain a blade of grass by mechanical laws alone.', false, 'He called that hope absurd.'],
  ['The Romantic poets and painters took up the idea of the sublime.', true, 'Storms, mountains and seas.']],
 items: [
  { q: 'Which liking claims that everyone ought to agree?', r: 'Finding something beautiful', w: ['Liking a food', 'Liking a tool for its use', 'Wanting to own something'], why: 'The second moment.' },
  { q: 'Why is the starry sky sublime, for Kant?', r: 'It is too vast for imagination to take in at once', w: ['It is useful for sailors', 'It is a pleasant color', 'It obeys the laws of motion'], why: 'The mathematically sublime.' },
  { q: 'What does genius do, according to Kant?', r: 'Gives the rule to art', w: ['Follows every rule exactly', 'Copies nature', 'Proves beauty by logic'], why: '§46.' },
  { q: 'What are Kant\'s three Critiques about, in order?', r: 'Knowledge, morality, judgment of beauty and purpose', w: ['Beauty, knowledge, politics', 'Morality, religion, history', 'Law, war, trade'], why: '1781, 1788, 1790.' },
  { q: 'Who translated the Critique of Judgement quoted here?', r: 'J. H. Bernard', w: ['T. K. Abbott', 'J. M. D. Meiklejohn', 'Thomas Nugent'], why: '1892; 2nd edition 1914.' }] };
H.T(ID, B, [function (R, lv) { return famClass(R, lv, SC, KINDS, 'In Kant\'s terms, is # pleasant, beautiful, sublime or good?'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'the Critique of Judgment'); }, function (R, lv) { return famSeq(R, lv, EV, 'works'); }].concat(dateFams(ID)), 0.55);
