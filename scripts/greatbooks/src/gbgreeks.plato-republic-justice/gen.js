/* gbgreeks.plato-republic-justice: practice generator (gbe2). Bank plus computed families; shared helpers first. */
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
var ID = 'gbgreeks.plato-republic-justice';
var TRI = [['Rulers', 'Reason', 'Wisdom'], ['Soldiers (auxiliaries)', 'Spirit', 'Courage'], ['Producers', 'Appetite', 'Moderation (shared by all)']];
function famTri(R, lv) {
  var t = R.pick(TRI), i = R.int(0, 2), j = (i + R.int(1, 2)) % 3, nm = ['part of the city', 'part of the soul', 'virtue'];
  return H.mc('In Republic IV, which <b>' + nm[j] + '</b> goes with <b>' + t[i] + '</b>?', t[j], TRI.filter(function (x) { return x !== t; }).map(function (x) { return x[j]; }).concat(j === 2 ? ['Justice'] : []), ['City, soul and virtue line up: ' + TRI.map(function (x) { return x.join(' / '); }).join('; ') + '. Justice is all three doing their own work.']);
}
var DEF = [['Cephalus', 'telling the truth and paying back what you owe'], ['Polemarchus', 'helping friends and harming enemies'], ['Thrasymachus', 'the advantage of the stronger'], ['Glaucon', 'a bargain people make out of fear of being wronged'], ['Socrates', 'each part doing its own work, with reason leading']];
var BK = [['Cephalus on paying debts', 1, 'Book I'], ['Thrasymachus\'s outburst', 2, 'Book I'], ['The ring of Gyges', 3, 'Book II'], ['The city of guardians and their education', 4, 'Books II–III'], ['The four virtues and the three-part soul', 5, 'Book IV'], ['The three waves, ending with philosopher-kings', 6, 'Book V']];
var TERMS = [['guardians', 'the rulers and soldiers of the city in words'], ['the noble lie', 'a founding myth of gold, silver and bronze souls'], ['the three waves', 'Book V\'s three startling proposals'], ['philosopher-king', 'a ruler who loves wisdom, or a king who becomes a philosopher'], ['the ring of Gyges', 'Glaucon\'s story of a ring that makes its wearer invisible'], ['spirit (thumos)', 'the part of the soul that feels anger at wrong and cares for honor']];
var B = {
  facts: [
    ['The Republic opens at the house of Cephalus, in the port of Piraeus.', true, 'During a festival.'],
    ['Thrasymachus says justice is the advantage of the stronger.', true, 'Republic I, 338c.'],
    ['Glaucon and Adeimantus are Plato\'s brothers.', true, 'They press Socrates in Book II.'],
    ['The ring of Gyges makes its wearer very strong.', false, 'It makes him invisible.'],
    ['Socrates looks for justice in a city first because it is larger and easier to see.', true, 'Then he looks in the soul.'],
    ['In Plato\'s city, the soldiers rule.', false, 'The rulers rule; soldiers are their helpers.'],
    ['Socrates proposes that women with the right gifts could be guardians.', true, 'The first of the three waves in Book V.'],
    ['Aristotle praised the Republic\'s idea that guardians should share all property.', false, 'He criticized it in Politics II.'],
    ['Justice in the soul means reason leading, with spirit as its ally, over appetite.', true, 'Republic IV.'],
    ['Book I ends with a complete definition of justice.', false, 'Socrates admits they have not yet said what justice is.']
  ],
  items: [
    { q: 'What is Glaucon\'s challenge?', r: 'Show that justice is good in itself, not just for its rewards', w: ['Show that the city is large enough', 'Prove that the gods exist', 'Find the ring of Gyges'], why: 'Republic II, 358–367.' },
    { q: 'What is Socrates\' objection to Cephalus?', r: 'Returning a weapon to a friend who has gone mad would not be just', w: ['Paying debts is too hard', 'Old men cannot be just', 'Telling the truth is never right'], why: 'Republic I, 331c.' },
    { q: 'In the Republic, what is justice in a city?', r: 'Each class doing its own work and not meddling in the others\'', w: ['Everyone doing every job in turn', 'The rich ruling the poor', 'Whatever the strongest want'], why: 'Republic IV, 433a–b.' },
    { q: 'Why does Socrates call his Book V proposals "waves"?', r: 'He expects them to be greeted with laughter, like waves that might drown him', w: ['They are about the sea', 'They come from Egypt', 'They are about sailors'], why: 'The third and greatest wave is philosopher-kings.' },
    { q: 'What does Glaucon think most people believe justice is?', r: 'A bargain made out of fear of being wronged', w: ['A gift of the gods', 'The health of the soul', 'Paying debts'], why: 'An early form of social contract theory.' },
    { q: 'Which critic said that what belongs to everyone is cared for by no one?', r: 'Aristotle', w: ['Thrasymachus', 'Homer', 'Gyges'], why: 'Politics II.' }
  ]
};
H.T(ID, B, [famTri, famTri, function (R, lv) { return famMatch(R, lv, DEF, 'In the Republic, how does # define justice?', 'In the Republic, who says justice is #?'); }, function (R, lv) { return famSeq(R, lv, BK, 'parts of the Republic'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'the Republic'); }].concat(dateFams(ID)), 0.55);
