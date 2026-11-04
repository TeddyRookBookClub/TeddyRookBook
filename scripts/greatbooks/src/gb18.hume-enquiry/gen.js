/* gb18.hume-enquiry: practice generator (gbw3). */
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
var ID = 'gb18.hume-enquiry';
var FORK = [['Three times five is half of thirty.', 'relation of ideas', 'Hume\'s own example; denying it is a contradiction.'], ['The sun will rise tomorrow.', 'matter of fact', 'Its denial is conceivable; known only by experience.'], ['A square has four sides.', 'relation of ideas', ''], ['Fire burns wood.', 'matter of fact', ''], ['Bread nourishes people.', 'matter of fact', ''], ['The angles of a triangle add up to two right angles.', 'relation of ideas', ''], ['This billiard ball will move when struck.', 'matter of fact', ''], ['If all A are B and all B are C, then all A are C.', 'relation of ideas', ''], ['Water freezes in cold weather.', 'matter of fact', '']];
var TERMS = [['impression', 'a lively perception, as when we see, hear, feel or want'], ['idea (Hume)', 'a fainter copy of an impression'], ['relations of ideas', 'truths known by thought alone, whose denial is a contradiction'], ['matters of fact', 'truths known only by experience, whose denial is conceivable'], ['constant conjunction', 'one kind of event always followed by another in our experience'], ['custom', 'the habit by which repeated experience makes us expect the same again'], ['necessary connexion', 'a supposed power binding cause to effect, which we never observe'], ['mitigated skepticism', 'a modest doubt, limited to what our minds can handle']];
var EV = [['A Treatise of Human Nature', 1739, '1739–40'], ['An Enquiry Concerning Human Understanding', 1748, '1748'], ['The History of England begins to appear', 1754, '1754'], ['Hume dies', 1776, '1776'], ['Kant\'s Critique of Pure Reason, partly an answer to Hume', 1781, '1781']];
function famTrials(R, lv) {
  var n = R.int(3, 40);
  return H.mc('You have seen one billiard ball strike another ' + n + ' times, and each time the second moved. According to Hume, what has <b>changed</b> after all these trials?', 'Your mind now expects the second ball to move (custom)', ['You can now see the power in the first ball', 'You have proved by reason that it must always happen', 'The balls have become more connected'], ['Repetition shows nothing new in the objects; it produces a habit of expectation in us.', 'Enquiry, Section VII.']);
}
var B = { facts: [
  ['Hume says every simple idea is copied from an impression.', true, 'Enquiry, Section II.'],
  ['Hume thought reason alone, before experience, can tell what effect a cause will have.', false, 'Section IV: only experience can.'],
  ['Hume calls custom the great guide of human life.', true, 'Section V.'],
  ['Hume says we directly see the necessary connection between cause and effect.', false, 'We see only one event following another.'],
  ['Hume\'s Enquiry rewrote part of his earlier Treatise of Human Nature.', true, 'The Treatise appeared 1739–40.'],
  ['Hume recommended a total doubt that gives up all belief.', false, 'He recommended a mitigated skepticism.'],
  ['Hume argued a wise person proportions belief to the evidence.', true, 'Section X, on miracles.'],
  ['Kant said Hume woke him from his dogmatic slumber.', true, 'In the Prolegomena.'],
  ['Hume\'s fork divides reasoning into relations of ideas and matters of fact.', true, 'Section IV.']],
 items: [
  { q: 'What does Hume use as his famous example of cause and effect?', r: 'Billiard balls', w: ['A falling apple', 'A ticking clock', 'A rising tide'], why: 'Enquiry, Section IV.' },
  { q: 'What carries us from past experience to expectations about the future, for Hume?', r: 'Custom, or habit', w: ['A proof of reason', 'Innate ideas', 'The authority of books'], why: 'Section V.' },
  { q: 'What should be done, Hume says, with a book with no reasoning about number or about matter of fact?', r: 'Commit it to the flames', w: ['Learn it by heart', 'Translate it', 'Teach it to children'], why: 'The last lines of the Enquiry.' },
  { q: 'Which friend of Hume wrote The Wealth of Nations?', r: 'Adam Smith', w: ['Edward Gibbon', 'James Boswell', 'George Berkeley'], why: 'They were close friends.' },
  { q: 'Which philosopher wrote a great work partly to answer Hume on cause?', r: 'Immanuel Kant', w: ['John Locke', 'Jonathan Swift', 'Montesquieu'], why: 'The Critique of Pure Reason.' }] };
H.T(ID, B, [famTrials, function (R, lv) { return famClass(R, lv, FORK, ['relation of ideas', 'matter of fact'], 'Using Hume\'s fork, is this a relation of ideas or a matter of fact? #'); }, function (R, lv) { return famClass(R, lv, FORK, ['relation of ideas', 'matter of fact'], 'Hume\'s fork: which kind of statement is #'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'Hume\'s Enquiry'); }, function (R, lv) { return famSeq(R, lv, EV, 'works and events'); }].concat(dateFams(ID)), 0.6);
