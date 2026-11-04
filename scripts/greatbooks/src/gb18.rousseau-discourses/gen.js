/* gb18.rousseau-discourses: practice generator (gbw3). */
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
var ID = 'gb18.rousseau-discourses';
var ST = [['living alone in the forest', 1, ''], ['huts and families', 2, ''], ['gathering to sing and dance, and comparing', 3, ''], ['agriculture and metalworking', 4, ''], ['the first fence: \"This is mine\"', 5, ''], ['the rich propose laws and government', 6, '']];
var TERMS = [['state of nature', 'human life before society, as Rousseau imagines it'], ['pity', 'natural sympathy at the suffering of others'], ['perfectibility', 'the human power to change and develop'], ['amour de soi', 'natural care for oneself'], ['amour-propre', 'self-love that compares itself with others and wants to be thought better'], ['general will', 'the will of the body politic for the common good']];
var WHO = [['Rousseau', 'Natural man is solitary, peaceful and moved by pity.'], ['Hobbes', 'Without government people would be at war, each against all.'], ['Locke', 'People in the state of nature already have property through their labor.'], ['Voltaire', 'No one ever used so much wit to make us want to walk on all fours.'], ['Rousseau', 'The first man who fenced land and said \"This is mine\" founded civil society.']];
var EV = [['Discourse on the Arts and Sciences', 1750, '1750'], ['Discourse on the Origin of Inequality', 1755, '1755'], ['Discourse on Political Economy', 1755, '1755'], ['The Social Contract and Emile', 1762, '1762'], ['Rousseau dies', 1778, '1778']];
var B = { facts: [
  ['Rousseau wrote the Discourse on Inequality for a prize question from the Academy of Dijon.', true, '1754–55.'],
  ['Rousseau says natural man is at war with everyone, as Hobbes thought.', false, 'He is solitary and peaceful, moved by pity.'],
  ['For Rousseau, comparing ourselves with others was a first step toward inequality and vice.', true, 'Part II.'],
  ['Rousseau said we should all go back to living in forests.', false, 'He said that was impossible for us.'],
  ['The Discourse on Political Economy first sets out the general will.', true, 'An article for the Encyclopédie.'],
  ['In Rousseau\'s story, the first laws were proposed by the poor.', false, 'By the rich, to protect their property.'],
  ['Rousseau was born in Geneva.', true, '1712.'],
  ['Rousseau called his state of nature a hypothesis rather than a history.', true, 'To help judge the present.']],
 items: [
  { q: 'What two feelings does Rousseau give natural man?', r: 'Self-preservation and pity', w: ['Pride and fear', 'Greed and envy', 'Faith and hope'], why: 'Preface and Part I.' },
  { q: 'Who, in Rousseau\'s words, was the real founder of civil society?', r: 'The first man who fenced land and said \"This is mine\"', w: ['The first king', 'The first priest', 'The first farmer'], why: 'Part II.' },
  { q: 'Which kind of self-love does Rousseau blame for vanity and envy?', r: 'Amour-propre', w: ['Amour de soi', 'Pity', 'Perfectibility'], why: 'It compares itself with others.' },
  { q: 'What happens to the rich man\'s plan of laws, in Rousseau\'s story?', r: 'It fixes inequality in place and leads in time to despotism', w: ['It makes everyone equal', 'It abolishes property', 'It returns people to the forest'], why: 'Part II.' },
  { q: 'Who translated the Discourses quoted here?', r: 'G. D. H. Cole', w: ['Thomas Nugent', 'William Popple', 'Thomas Abbott'], why: 'Everyman\'s Library, 1913.' }] };
H.T(ID, B, [function (R, lv) { return famSeq(R, lv, ST, 'stages in Rousseau\'s story'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'Rousseau\'s Discourses'); }, function (R, lv) { return famWho(R, lv, WHO, 'the debate about the state of nature'); }, function (R, lv) { return famSeq(R, lv, EV, 'works'); }].concat(dateFams(ID)), 0.6);
