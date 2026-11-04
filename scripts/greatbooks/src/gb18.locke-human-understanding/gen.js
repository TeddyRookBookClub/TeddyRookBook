/* gb18.locke-human-understanding: practice generator (gbw3). */
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
var ID = 'gb18.locke-human-understanding';
var SRC = [['seeing the color red', 'sensation', ''], ['hearing thunder', 'sensation', ''], ['feeling cold', 'sensation', ''], ['tasting something sweet', 'sensation', ''], ['noticing that you are thinking', 'reflection', 'the mind observing its own operation'], ['remembering', 'reflection', ''], ['doubting', 'reflection', ''], ['willing (deciding to do something)', 'reflection', '']];
var QUAL = [['shape', 'primary quality', ''], ['size', 'primary quality', ''], ['motion', 'primary quality', ''], ['solidity', 'primary quality', ''], ['number', 'primary quality', ''], ['color', 'secondary quality', ''], ['taste', 'secondary quality', ''], ['smell', 'secondary quality', ''], ['sound', 'secondary quality', ''], ['warmth', 'secondary quality', '']];
var TERMS = [['white paper (tabula rasa)', 'the mind at birth, with no ideas yet'], ['innate idea', 'an idea stamped on the mind from birth'], ['sensation', 'ideas brought in by the senses'], ['reflection', 'the mind noticing its own operations'], ['simple idea', 'an idea the mind receives and can\'t make or divide'], ['complex idea', 'an idea the mind builds by combining simple ones'], ['personal identity', 'being the same person over time, through consciousness and memory'], ['probability', 'judgment where certain knowledge is lacking']];
var BOOKS = [['Book I: against innate ideas', 1, ''], ['Book II: of ideas', 2, ''], ['Book III: of words', 3, ''], ['Book IV: of knowledge and opinion', 4, '']];
var B = { facts: [
  ['Locke says the mind at first is like white paper, without any ideas.', true, 'Essay II.i.2.'],
  ['Locke believed children are born knowing the idea of God.', false, 'He argued against innate ideas in Book I.'],
  ['For Locke, all ideas come from sensation or reflection.', true, 'The two fountains of knowledge.'],
  ['Locke counts color as a primary quality.', false, 'Color is a secondary quality.'],
  ['Locke says solidity, shape and motion are really in objects.', true, 'Primary qualities.'],
  ['For Locke, personal identity rests on consciousness.', true, 'Essay II.xxvii.'],
  ['Locke thought words always have clear ideas behind them.', false, 'Book III warns about the abuse of words.'],
  ['Locke says where we lack certain knowledge we must use judgment and probability.', true, 'Book IV.'],
  ['The mind, for Locke, can invent a new simple idea it never experienced.', false, 'It can only combine simple ideas it has received.'],
  ['Leibniz wrote a reply to Locke\'s Essay.', true, 'New Essays on Human Understanding.']],
 items: [
  { q: 'What does Locke compare the newborn mind to?', r: 'White paper', w: ['A marble block with veins', 'A mirror', 'A full library'], why: 'Leibniz used the marble image in reply.' },
  { q: 'What are Locke\'s two \"fountains\" of ideas?', r: 'Sensation and reflection', w: ['Reason and faith', 'Memory and imagination', 'Habit and custom'], why: 'Essay II.i.' },
  { q: 'Which is a complex idea, for Locke?', r: 'An apple', w: ['Red', 'Sweet', 'Cold'], why: 'It combines simple ideas.' },
  { q: 'What experiment shows warmth is in us rather than in water?', r: 'One warm and one cold hand in the same water', w: ['Boiling water on a fire', 'Freezing water in winter', 'Weighing a bucket of water'], why: 'The same water feels warm to one hand and cold to the other.' },
  { q: 'What, for Locke, makes you the same person over time?', r: 'The same consciousness, reaching back in memory', w: ['The same body', 'The same name', 'The same house'], why: 'Essay II.xxvii.' },
  { q: 'Which later thinker pushed Locke\'s ideas to say there is no matter outside minds?', r: 'Berkeley', w: ['Hobbes', 'Smith', 'Montesquieu'], why: 'The next rung.' }] };
H.T(ID, B, [function (R, lv) { return famClass(R, lv, SRC, ['sensation', 'reflection'], 'In Locke\'s terms, does the idea of # come from sensation or reflection?'); }, function (R, lv) { return famClass(R, lv, QUAL, ['primary quality', 'secondary quality'], 'For Locke, is # a primary or a secondary quality?'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'Locke\'s Essay'); }, function (R, lv) { return famSeq(R, lv, BOOKS, 'books of the Essay'); }].concat(dateFams(ID)), 0.55);
