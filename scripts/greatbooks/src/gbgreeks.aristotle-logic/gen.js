/* gbgreeks.aristotle-logic: practice generator (gbe2). Bank plus computed families; shared helpers first. */
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
/* put events in order: ev = [[label, key, when]] (key sorts; when is shown in the answer) */
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
/* who said what (from our own summaries): sd = [[speaker, claim]] */
function famWho(R, lv, sd, ctx) {
  var s = R.pick(sd), names = H.uniq(sd.map(function (x) { return x[0]; })).filter(function (n) { return n !== s[0]; });
  return H.mc('In ' + ctx + ', who argues this (in our own summary)? <i>"' + s[1] + '"</i>', s[0], H.samp(R, names, lv === 1 ? 2 : 3), [s[0] + ' says this, in our words.']);
}
/* match two columns: pr = [[a, b]]; ask which b goes with a given a (or the reverse) */
function famMatch(R, lv, pr, qa, qb) {
  var p = R.pick(pr), others = pr.filter(function (x) { return x !== p; }), n = Math.min(others.length, lv === 1 ? 2 : 3);
  if (R.coin()) return H.mc(qa.replace('#', '<b>' + p[0] + '</b>'), p[1], H.samp(R, others, n).map(function (x) { return x[1]; }), [p[0] + ' goes with ' + p[1] + '.']);
  return H.mc(qb.replace('#', '<b>' + p[1] + '</b>'), p[0], H.samp(R, others, n).map(function (x) { return x[0]; }), [p[1] + ' goes with ' + p[0] + '.']);
}
var ID = 'gbgreeks.aristotle-logic';
var FORMS = { A: ['All', 'are'], E: ['No', 'are'], I: ['Some', 'are'], O: ['Some', 'are not'] };
var FIG = { 1: [['M', 'P'], ['S', 'M']], 2: [['P', 'M'], ['S', 'M']], 3: [['M', 'P'], ['M', 'S']], 4: [['P', 'M'], ['M', 'S']] };
var BIT = { S: 1, M: 2, P: 4 };
function holds(f, x, y, occ) { var X = BIT[x], Y = BIT[y]; for (var r = 0; r < 8; r++) { if (!occ[r] || !(r & X)) continue; if (f === 'A' && !(r & Y)) return false; if (f === 'E' && (r & Y)) return false; if (f === 'I' && (r & Y)) return true; if (f === 'O' && !(r & Y)) return true; } return f === 'A' || f === 'E'; }
function valid(fig, a, b, c) {
  var p = FIG[fig];
  for (var m = 0; m < 256; m++) {
    var occ = []; for (var r = 0; r < 8; r++) occ.push(!!(m >> r & 1));
    if (!['S', 'M', 'P'].every(function (t) { for (var r = 0; r < 8; r++) if (occ[r] && (r & BIT[t])) return true; return false; })) continue;
    if (holds(a, p[0][0], p[0][1], occ) && holds(b, p[1][0], p[1][1], occ) && !holds(c, 'S', 'P', occ)) return false;
  }
  return true;
}
var TERMS3 = [['whales', 'mammals', 'air-breathers'], ['squares', 'rectangles', 'four-sided figures'], ['oaks', 'trees', 'plants'], ['robins', 'birds', 'animals with feathers'], ['poets', 'dreamers', 'happy people'], ['sharks', 'fish', 'swimmers'], ['violins', 'string instruments', 'things with strings'], ['tigers', 'cats', 'hunters'], ['triangles', 'polygons', 'figures with straight sides'], ['planets', 'heavenly bodies', 'things that move']];
function say(f, x, y) { return FORMS[f][0] + ' ' + x + ' ' + FORMS[f][1] + ' ' + y; }
function famSyl(R, lv) {
  var t = R.pick(TERMS3), w = { S: t[0], M: t[1], P: t[2] }, fig = lv === 1 ? '1' : R.pick(['1', '2', '3', '4']), F = 'AEIO';
  var a, b, c, tries = 0, want = R.coin();
  do { a = R.pick(F.split('')); b = R.pick(F.split('')); c = R.pick(F.split('')); tries++; } while (tries < 60 && valid(fig, a, b, c) !== want);
  var p = FIG[fig], ok = valid(fig, a, b, c);
  var arg = '1. ' + say(a, w[p[0][0]], w[p[0][1]]) + '.<br>2. ' + say(b, w[p[1][0]], w[p[1][1]]) + '.<br>So: ' + say(c, w.S, w.P) + '.';
  return H.mc('Is this syllogism <b>valid</b>? (Valid means: if both premises were true, the conclusion would have to be true. Assume, as Aristotle does, that each term names something that exists.)<br>' + arg, ok ? 'Valid' : 'Not valid', [ok ? 'Not valid' : 'Valid'],
    ['Write it with letters: ' + say(a, p[0][0], p[0][1]) + '; ' + say(b, p[1][0], p[1][1]) + '; so ' + say(c, 'S', 'P') + ' (figure ' + fig + ', ' + a + b + c + ').', ok ? 'Every way of making both premises true also makes the conclusion true.' : 'There is a way for both premises to be true while the conclusion is false.', 'Validity is about the form, not whether the statements are actually true.'], { keep: true });
}
function famConc(R, lv) {
  var t = R.pick(TERMS3), w = { S: t[0], M: t[1], P: t[2] }, combos = [];
  ['1', '2', '3'].forEach(function (fig) { 'AEIO'.split('').forEach(function (a) { 'AEIO'.split('').forEach(function (b) { var cs = 'AEIO'.split('').filter(function (c) { return valid(fig, a, b, c); }); if (cs.length === 1 || (cs.length === 2 && cs.indexOf('A') + cs.indexOf('E') > -2)) combos.push([fig, a, b, cs]); }); }); });
  var k = R.pick(combos), p = FIG[k[0]], best = k[3].indexOf('A') >= 0 ? 'A' : k[3].indexOf('E') >= 0 ? 'E' : k[3][0];
  var right = say(best, w.S, w.P), wr = 'AEIO'.split('').filter(function (c) { return k[3].indexOf(c) < 0; }).map(function (c) { return say(c, w.S, w.P); });
  return H.mc('Which conclusion follows from these premises?<br>1. ' + say(k[1], w[p[0][0]], w[p[0][1]]) + '.<br>2. ' + say(k[2], w[p[1][0]], w[p[1][1]]) + '.', right, H.samp(R, wr, lv === 1 ? 2 : 3), ['With letters: ' + say(k[1], p[0][0], p[0][1]) + '; ' + say(k[2], p[1][0], p[1][1]) + '.', 'The strongest conclusion that must follow is: ' + say(best, 'S', 'P') + '.']);
}
var CONTRA = { A: 'O', O: 'A', E: 'I', I: 'E' };
function famSquare(R, lv) {
  var t = R.pick(TERMS3), f = R.pick('AEIO'.split('')), x = t[0], y = t[2];
  return H.mc('Aristotle says every statement has a <b>contradictory</b>: exactly one of the two is true. What is the contradictory of “' + say(f, x, y) + '”?', say(CONTRA[f], x, y), 'AEIO'.split('').filter(function (g) { return g !== CONTRA[f] && g !== f; }).map(function (g) { return say(g, x, y); }).concat(lv > 1 ? [say(f, y, x)] : []), ['A and O contradict each other; so do E and I.', 'So the contradictory of “' + say(f, x, y) + '” is “' + say(CONTRA[f], x, y) + '”.']);
}
var CAT = [['a horse', 'substance'], ['two cubits long', 'quantity'], ['white', 'quality'], ['double', 'relation'], ['in the Lyceum', 'place'], ['yesterday', 'time'], ['sitting', 'position'], ['wearing shoes', 'state'], ['cutting', 'action'], ['being cut', 'affection (being acted on)']];
var FAL = [['A bat can fly; this baseball bat is a bat; so it can fly.', 'equivocation (a word with two meanings)'], ['The book is true because it says so, and what it says is true.', 'begging the question (assuming what is to be proved)'], ['Have you stopped being late for school?', 'many questions (two questions asked as one)'], ['Every part of this machine is light, so the machine is light.', 'composition (treating parts as the whole)'], ['Water is healthy, so drinking ten gallons at once is healthy.', 'secundum quid (ignoring a limit or qualification)'], ['If it rained, the street is wet. The street is wet, so it rained.', 'the consequent (reversing an if-then)']];
var TERMS = [['syllogism', 'an argument where, from two stated premises, a new conclusion follows of necessity'], ['middle term', 'the term in both premises that drops out of the conclusion'], ['valid', 'having a form where true premises guarantee a true conclusion'], ['Organon', '"the tool": the name for Aristotle\'s logical works'], ['first principles', 'starting points of a science that cannot themselves be proved'], ['induction', 'reasoning from many particular cases to a general truth']];
var B = {
  facts: [
    ['Aristotle\'s logical works were later called the Organon, "the tool".', true, 'His followers saw logic as a tool for every science.'],
    ['A valid argument always has a true conclusion.', false, 'Only if its premises are true.'],
    ['The Categories lists ten kinds of thing we can say.', true, 'Substance, quantity, quality, relation, place, time, position, state, action, affection.'],
    ['In a syllogism, the middle term appears in the conclusion.', false, 'It appears in both premises and drops out of the conclusion.'],
    ['"All S are P" and "Some S are not P" contradict each other.', true, 'Exactly one of them is true.'],
    ['Aristotle says every truth can be proved from something earlier.', false, 'Proof rests on first principles that cannot be proved.'],
    ['The names Barbara and Celarent were given by Aristotle.', false, 'By medieval students, as memory aids.'],
    ['Sophistical Refutations studies arguments that only look like proofs.', true, 'Thirteen kinds of fallacy.'],
    ['Kant thought logic had hardly changed since Aristotle.', true, 'In 1787. New symbolic logics came in the 1800s.'],
    ['Aristotle founded the Lyceum in Athens.', true, 'In 335 BC.']
  ],
  items: [
    { q: 'What does Aristotle say real scientific knowledge must grasp?', r: 'The cause of a fact', w: ['Only the fact', 'Its usefulness', 'What most people think'], why: 'Posterior Analytics I.2.' },
    { q: 'Which is the first of the ten categories?', r: 'Substance', w: ['Quantity', 'Place', 'Action'], why: 'Substance is what the others are said of.' },
    { q: 'What is the fallacy of the undistributed middle?', r: 'The middle term never covers its whole class, so the premises do not connect', w: ['The conclusion is too long', 'A premise is false', 'There are four terms'], why: '"All cats have tails; all dogs have tails; so all dogs are cats."' },
    { q: 'What puzzle does On Interpretation raise about a sea battle?', r: 'Whether a statement about tomorrow is already true or false today', w: ['Who will win the battle', 'How ships float', 'Whether battles are just'], why: 'On Interpretation 9: future contingents.' },
    { q: 'What did Aristotle say about earlier work on reasoning?', r: 'He had nothing to build on and worked it out himself', w: ['He copied it from Plato', 'He learned it in Egypt', 'He found it in Homer'], why: 'End of Sophistical Refutations.' },
    { q: 'How do we reach first principles, according to Aristotle?', r: 'By induction from perception, and by understanding', w: ['By more syllogisms', 'By voting', 'By memorizing'], why: 'Posterior Analytics II.19.' }
  ]
};
H.T(ID, B, [famSyl, famSyl, famSyl, famConc, famConc, famSquare, function (R, lv) { return famMatch(R, lv, CAT, 'In Aristotle\'s Categories, which category does <i>#</i> belong to?', 'In Aristotle\'s Categories, which of his examples belongs to <i>#</i>?'); }, function (R, lv) { return famMatch(R, lv, FAL, 'Which fallacy is this? <i>#</i>', 'Which example shows the fallacy of #?'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'Aristotle\'s logic'); }].concat(dateFams(ID)), 0.6);
