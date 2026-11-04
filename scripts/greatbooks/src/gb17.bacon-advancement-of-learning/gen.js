/* gb17.bacon-advancement-of-learning: practice generator (gbw2). Shared helpers first. */
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
var ID = 'gb17.bacon-advancement-of-learning';
var POW = [['History', 'memory'], ['Poesy (poetry and invented stories)', 'imagination'], ['Philosophy', 'reason']];
var KIDS = [['natural history', 'History'], ['civil history', 'History'], ['church history', 'History'], ['the history of learning', 'History'], ['narrative poesy', 'Poesy'], ['dramatic poesy', 'Poesy'], ['allegorical poesy (fables)', 'Poesy'], ['natural philosophy', 'Philosophy'], ['divine philosophy (God as known by reason)', 'Philosophy'], ['human philosophy (body, mind, society)', 'Philosophy']];
var DIST = [['fantastical learning', 'taking vain imaginations for truth'], ['contentious learning', 'endless arguing about words and fine points'], ['delicate learning', 'caring more for elegant style than for matter'], ['the relief of man\'s estate', 'making human life better through knowledge'], ['deficient', 'Bacon\'s word for a field of learning that was still missing or poorly done'], ['De Augmentis Scientiarum', 'Bacon\'s enlarged Latin version of the Advancement (1623)']];
var EV = [['Bacon is born', 1561, '1561'], ['The Advancement of Learning', 1605, '1605'], ['Novum Organum', 1620, '1620'], ['De Augmentis Scientiarum', 1623, '1623'], ['Bacon dies', 1626, '1626'], ['The Royal Society is founded', 1660, '1660'], ['The Encyclopédie begins to appear', 1751, '1751']];
var WHO = [['Bacon', 'Learning should be a storehouse for the relief of man\'s estate, not a shop for profit.'], ['Bacon\'s critics among statesmen', 'Scholars make poor men of action and unfit for business.'], ['Bacon\'s critics among churchmen', 'Too much knowledge puffs people up with pride.'], ['Diderot and d\'Alembert', 'Our tree of knowledge follows Bacon\'s division into memory, imagination and reason.']];
function famPow(R, lv) {
  var p = R.pick(POW);
  if (R.coin()) return H.mc('In Bacon\'s map of learning, which power of the mind does <b>' + p[0] + '</b> belong to?', p[1], POW.filter(function (x) { return x !== p; }).map(function (x) { return x[1]; }).concat(lv > 1 ? ['the will'] : []), [p[0] + ' belongs to ' + p[1] + '.']);
  var k = R.pick(KIDS);
  return H.mc('Bacon divides learning into History, Poesy and Philosophy. Where does <b>' + k[0] + '</b> go?', k[1], ['History', 'Poesy', 'Philosophy'].filter(function (x) { return x !== k[1]; }), [k[0] + ' is a part of ' + k[1] + '.']);
}
var B = {
  facts: [
    ['Bacon dedicated The Advancement of Learning to King James I.', true, 'It appeared in 1605.'],
    ['The Advancement of Learning was first written in Latin.', false, 'It was in English; the Latin De Augmentis (1623) enlarged it.'],
    ['Bacon divides learning by memory, imagination and reason.', true, 'History, poesy and philosophy.'],
    ['Bacon says it is best to begin with certainties.', false, 'Begin with doubts, he says, and you may end in certainties.'],
    ['Bacon calls the arguing over words "contentious learning".', true, 'One of the three distempers of learning.'],
    ['Bacon says poetry belongs to reason.', false, 'Poesy belongs to imagination.'],
    ['Bacon thought the art of discovering new things was still missing.', true, 'His Novum Organum tried to supply it.'],
    ['Bacon rejects all ancient authors.', false, 'He quotes and praises them often; he objects to treating them as the end of learning.'],
    ['The Encyclopédie\'s tree of knowledge followed Bacon\'s division.', true, 'Diderot and d\'Alembert said so.'],
    ['For Bacon, the right end of knowledge is winning arguments.', false, 'It is the glory of the Creator and the relief of man\'s estate.']
  ],
  items: [
    { q: 'What is the "greatest error" Bacon names in Book One?', r: 'Mistaking the true end of knowledge', w: ['Reading too many books', 'Studying mathematics', 'Writing in English'], why: 'People seek knowledge for the wrong ends.' },
    { q: 'Which image does Bacon use for learning sought for profit?', r: 'A shop', w: ['A couch', 'A terrace', 'A ship'], why: '"a shop, for profit or sale".' },
    { q: 'Which image does Bacon use for learning sought for pride?', r: 'A tower of state', w: ['A shop', 'A couch', 'A garden'], why: '"a tower of state, for a proud mind to raise itself upon".' },
    { q: 'What did Bacon often write about a field of learning that was missing?', r: 'That it was "deficient"', w: ['That it was forbidden', 'That it was finished', 'That it was foolish'], why: 'His list of gaps is the most original part of Book Two.' },
    { q: 'Which later book of Bacon\'s tried to give a new method of discovery?', r: 'Novum Organum (1620)', w: ['The Essays', 'New Atlantis', 'Leviathan'], why: 'Leviathan is by Hobbes.' },
    { q: 'What job did Bacon hold late in his career?', r: 'Lord Chancellor of England', w: ['Archbishop of Canterbury', 'Professor at Oxford', 'Admiral of the fleet'], why: 'He was a lawyer and statesman.' }
  ]
};
H.T(ID, B, [famPow, famPow, function (R, lv) { return famTerm(R, lv, DIST, 'The Advancement of Learning'); }, function (R, lv) { return famSeq(R, lv, EV, 'events'); }, function (R, lv) { return famFirst(R, lv, EV, 'events'); }, function (R, lv) { return famWho(R, lv, WHO, 'the story of The Advancement of Learning'); }].concat(dateFams(ID)), 0.6);
