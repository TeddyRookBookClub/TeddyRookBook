/* gb18.smith-wealth-of-nations: practice generator (gbw3). */
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
var ID = 'gb18.smith-wealth-of-nations';
function famPins(R, lv) {
  var lbs = R.int(8, 16), per = R.pick([4000, 4500, 5000]), w = R.pick([5, 8, 10, 12]);
  if (lv === 1) return H.num('A pin factory makes ' + lbs + ' pounds of pins a day, with ' + per.toLocaleString('en-US') + ' pins in a pound. How many pins is that?', lbs * per, ['$' + lbs + ' \\times ' + per + ' = ' + lbs * per + '$.', 'Smith\'s own factory: 12 pounds, over 4,000 to the pound, about 48,000 pins.']);
  var tot = lbs * per; if (tot % w) { w = 10; tot = Math.round(tot / 10) * 10; }
  return H.num('A factory of ' + w + ' workers makes ' + tot.toLocaleString('en-US') + ' pins a day. How many is that per worker?', tot / w, ['$' + tot + ' \\div ' + w + ' = ' + tot / w + '$.', 'Smith: 48,000 ÷ 10 = 4,800 each, against fewer than 20 for a worker alone.']);
}
var REASONS = [['more skill from doing one task', 'a reason the division of labor raises output'], ['no time lost switching tasks', 'a reason the division of labor raises output'], ['machines invented by workers focused on one job', 'a reason the division of labor raises output'], ['the size of the market', 'the limit on how far labor can be divided'], ['regard to their own interest', 'why the butcher, brewer and baker give us our dinner'], ['the invisible hand', 'how self-interest can promote the public good without being intended']];
var TERMS = [['division of labor', 'splitting work into separate tasks done by different people'], ['mercantilism', 'policy of piling up gold and silver through trade surpluses and protection'], ['natural price', 'the price that just covers wages, profit and rent'], ['market price', 'the actual price, set by supply and demand'], ['invisible hand', 'Smith\'s image for self-interest promoting the public good without intending it'], ['extent of the market', 'how many buyers can be reached, which limits specialization'], ['system of natural liberty', 'each free to pursue his own interest within the laws of justice']];
var DUTY = [['defending the nation', 'a duty of government, for Smith'], ['administering justice', 'a duty of government, for Smith'], ['roads, harbors and schooling for the common people', 'a duty of government, for Smith'], ['setting the price of bread', 'not a duty of government, for Smith'], ['granting trade monopolies', 'not a duty of government, for Smith']];
var B = { facts: [
  ['Smith\'s pin factory has about eighteen distinct operations.', true, 'Book I, ch. I.'],
  ['Smith says ten workers could make about 48,000 pins a day.', true, '4,800 each.'],
  ['Smith thought a nation\'s wealth is the gold and silver in its treasury.', false, 'That was the mercantilist view he attacked.'],
  ['Smith says we get our dinner from the butcher\'s regard to his own interest.', true, 'Book I, ch. II.'],
  ['The phrase \"invisible hand\" appears many times in The Wealth of Nations.', false, 'Only once, in Book IV.'],
  ['Smith gave government no duties at all.', false, 'Defense, justice and public works, including schooling.'],
  ['Smith warned that merchants often conspire to raise prices.', true, 'Book I, ch. X.'],
  ['Smith also wrote The Theory of Moral Sentiments.', true, '1759.'],
  ['The Wealth of Nations was published in 1776.', true, 'The same year as the Declaration of Independence.'],
  ['Smith said the division of labor is limited by the extent of the market.', true, 'Book I, ch. III.']],
 items: [
  { q: 'What trade does Smith use to show the division of labor?', r: 'Pin-making', w: ['Shipbuilding', 'Bread-baking', 'Printing'], why: 'Book I, ch. I.' },
  { q: 'Which policy is The Wealth of Nations written against?', r: 'Mercantilism', w: ['Free trade', 'Feudalism only', 'The gold standard'], why: 'Book IV.' },
  { q: 'Which worry did Smith have about the division of labor?', r: 'Repetitive work could dull workers\' minds without education', w: ['It makes goods too cheap', 'It needs too much gold', 'It ends all trade'], why: 'Book V.' },
  { q: 'Which later economist built on Smith\'s labor theory of value, toward conclusions Smith did not draw?', r: 'Karl Marx', w: ['Edward Gibbon', 'David Hume', 'Montesquieu'], why: 'In the next era.' },
  { q: 'Where did Smith teach moral philosophy?', r: 'Glasgow', w: ['Oxford', 'Paris', 'Königsberg'], why: 'From 1752.' }] };
H.T(ID, B, [famPins, famPins, function (R, lv) { return famMatch(R, lv, REASONS, 'In The Wealth of Nations, what is #?'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'The Wealth of Nations'); }, function (R, lv) { return famMatch(R, lv, DUTY, 'Smith on government: is # a duty of government?'); }].concat(dateFams(ID)), 0.6);
