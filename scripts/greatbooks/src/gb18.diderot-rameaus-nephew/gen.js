/* gb18.diderot-rameaus-nephew: practice generator (gbw3). */
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
var ID = 'gb18.diderot-rameaus-nephew';
var WHO = [['Me (the philosopher)', 'Virtue and happiness go together in the end.'], ['Him (the nephew)', 'In a world of flatterers, a poor man is a fool not to flatter too.'], ['Him (the nephew)', 'Everyone takes a position, posing like a dancer to please someone above him.'], ['Me (the philosopher)', 'Even the king takes a position before someone; whoever needs another must pose.'], ['Him (the nephew)', 'I envy my uncle\'s genius.'], ['Me (the philosopher)', 'There are pleasures of friendship and doing good that last longer than a dinner.']];
var EV = [['Diderot begins editing the Encyclopédie', 1751, '1751'], ['Rameau\'s Nephew written (about)', 1762, 'c. 1761–1774'], ['Diderot dies', 1784, '1784'], ['Goethe\'s German translation published', 1805, '1805'], ['Diderot\'s own manuscript found in Paris', 1890, '1890']];
var TERMS = [['Moi (Me)', 'the narrator, a philosopher who defends virtue'], ['Lui (Him)', 'Rameau\'s nephew, a brilliant, shameless musician'], ['the Encyclopédie', 'the great reference work Diderot edited, 1751–1772'], ['a \"position\"', 'the nephew\'s word for the poses people strike to please the powerful'], ['pantomime', 'acting out without words, as the nephew mimes a whole orchestra'], ['satire', 'writing that mocks folly to expose it']];
var B = { facts: [
  ['Rameau\'s Nephew was published in Diderot\'s lifetime.', false, 'It first appeared in 1805, after his death.'],
  ['It was first published in a German translation by Goethe.', true, '1805.'],
  ['The conversation takes place in a Paris café near the chess players.', true, 'The Café de la Régence.'],
  ['The nephew is related to the composer Jean-Philippe Rameau.', true, 'He was his nephew.'],
  ['The dialogue ends with Me clearly proving Him wrong.', false, 'It leaves the reader to weigh both.'],
  ['Him mimes whole operas and instruments.', true, 'His famous pantomimes.'],
  ['Diderot edited the Encyclopédie.', true, '1751–1772.'],
  ['Diderot\'s own manuscript was found in 1890.', true, 'In a Paris bookstall.']],
 items: [
  { q: 'Who are the two speakers?', r: 'Me, a philosopher, and Him, Rameau\'s nephew', w: ['Candide and Pangloss', 'Boswell and Johnson', 'Hylas and Philonous'], why: 'Moi and Lui.' },
  { q: 'Which later philosopher used the nephew as a picture of a mind torn apart by its society?', r: 'Hegel', w: ['Locke', 'Berkeley', 'Montesquieu'], why: 'In the Phenomenology of Spirit.' },
  { q: 'What kind of music does the nephew favor over the old French style?', r: 'The new Italian comic opera', w: ['Church organ music', 'Folk songs', 'Marching bands'], why: 'The quarrel over Italian opera in Paris.' },
  { q: 'Why does this rung quote no excerpt?', r: 'We could not confirm a public-domain English translation online', w: ['The book is lost', 'It was written in Latin', 'It has no dialogue'], why: 'English versions in libraries are later translations.' }] };
H.T(ID, B, [function (R, lv) { return famWho(R, lv, WHO, 'Rameau\'s Nephew'); }, function (R, lv) { return famSeq(R, lv, EV, 'events'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'Rameau\'s Nephew'); }].concat(dateFams(ID)), 0.55);
