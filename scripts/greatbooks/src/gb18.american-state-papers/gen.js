/* gb18.american-state-papers: practice generator (gbw3). */
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
var ID = 'gb18.american-state-papers';
var EV = [['the Declaration of Independence', 1776.5, 'July 4, 1776'], ['the Articles of Confederation agreed by Congress', 1777.9, 'November 1777'], ['the Articles take effect', 1781.2, 'March 1, 1781'], ['Shays\' Rebellion', 1786.8, '1786–87'], ['the Constitution signed', 1787.7, 'September 17, 1787'], ['the Constitution ratified by a ninth state', 1788.5, 'June 21, 1788'], ['George Washington inaugurated', 1789.3, 'April 30, 1789'], ['the Bill of Rights ratified', 1791.9, 'December 15, 1791']];
var ART = [['Article I', 'Congress: the legislative branch'], ['Article II', 'the President: the executive branch'], ['Article III', 'the federal courts: the judicial branch'], ['Article IV', 'the states and their relations'], ['Article V', 'how to amend the Constitution'], ['Article VI', 'the Constitution as the supreme law of the land'], ['Article VII', 'ratification by nine states']];
var DOC = [['All men are created equal, with unalienable rights to life, liberty and the pursuit of happiness.', 'the Declaration of Independence', ''], ['Each state keeps its sovereignty, freedom and independence, with one vote in Congress.', 'the Articles of Confederation', ''], ['We the People … do ordain and establish this Constitution.', 'the Constitution', 'The Preamble.'], ['Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof.', 'the Bill of Rights', 'The First Amendment.'], ['A long list of grievances against King George III.', 'the Declaration of Independence', ''], ['Congress may not tax, and amendments need every state\'s consent.', 'the Articles of Confederation', ''], ['Three branches: legislative, executive and judicial.', 'the Constitution', '']];
var DOCS = ['the Declaration of Independence', 'the Articles of Confederation', 'the Constitution', 'the Bill of Rights'];
var GOALS = ['form a more perfect union', 'establish justice', 'insure domestic tranquility', 'provide for the common defense', 'promote the general welfare', 'secure the blessings of liberty'];
function famPreamble(R, lv) { var g = R.pick(GOALS); return H.mc('Which of these is one of the goals listed in the Preamble to the Constitution?', g, H.samp(R, ['establish a national church', 'abolish the states', 'guarantee every citizen a farm', 'crown a king', 'end all taxes'], lv === 1 ? 2 : 3), ['The Preamble: to form a more perfect union, establish justice, insure domestic tranquility, provide for the common defense, promote the general welfare, and secure the blessings of liberty.']); }
var B = { facts: [
  ['The Declaration of Independence was approved on July 4, 1776.', true, 'By the Continental Congress.'],
  ['The Articles of Confederation gave Congress the power to tax.', false, 'It could not tax; it asked the states for money.'],
  ['Under the Articles, each state had one vote in Congress.', true, 'Whatever its size.'],
  ['The Constitution was signed in Philadelphia in 1787.', true, 'September 17, 1787.'],
  ['The Bill of Rights is the first ten amendments.', true, 'Ratified 1791.'],
  ['The Declaration of Independence set up the federal government.', false, 'The Articles and then the Constitution did.'],
  ['The Constitution needed nine states to ratify it.', true, 'Article VII.'],
  ['Thomas Jefferson drafted the Declaration of Independence.', true, 'Edited by a committee and by Congress.'],
  ['The Constitution begins \"We the States.\"', false, 'It begins \"We the People.\"'],
  ['Shays\' Rebellion made many leaders think the Articles were too weak.', true, '1786–87.']],
 items: [
  { q: 'Which document begins \"We the People of the United States\"?', r: 'The Constitution', w: ['The Declaration of Independence', 'The Articles of Confederation', 'The Federalist'], why: 'The Preamble.' },
  { q: 'Which document called the union of states a \"firm league of friendship\"?', r: 'The Articles of Confederation', w: ['The Constitution', 'The Bill of Rights', 'The Declaration of Independence'], why: 'Article III of the Articles.' },
  { q: 'Which three rights does the Declaration name first?', r: 'Life, liberty and the pursuit of happiness', w: ['Speech, press and religion', 'Property, trial and petition', 'Voting, travel and arms'], why: 'The second paragraph.' },
  { q: 'Which philosopher\'s ideas are often heard in the Declaration?', r: 'John Locke', w: ['George Berkeley', 'Jonathan Swift', 'Edward Gibbon'], why: 'Equality, rights and consent.' },
  { q: 'Which article of the Constitution describes the President?', r: 'Article II', w: ['Article I', 'Article III', 'Article V'], why: 'The executive branch.' }] };
H.T(ID, B, [function (R, lv) { return famSeq(R, lv, EV, 'events of the founding'); }, function (R, lv) { return famMatch(R, lv, ART, 'What does # of the Constitution cover?', 'Which article of the Constitution covers #?'); }, function (R, lv) { return famClass(R, lv, DOC, DOCS, 'Which founding document says or does this? #'); }, famPreamble, function (R, lv) { return famFirst(R, lv, EV, 'events'); }].concat(dateFams(ID)), 0.6);
