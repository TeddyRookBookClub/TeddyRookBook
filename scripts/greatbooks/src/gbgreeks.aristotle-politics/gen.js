/* gbgreeks.aristotle-politics: practice generator (gbe2). Bank plus computed families; shared helpers first. */
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
var ID = 'gbgreeks.aristotle-politics';
var SIX = [['kingship', 'one', 'the common good'], ['aristocracy', 'a few', 'the common good'], ['polity', 'many', 'the common good'], ['tyranny', 'one', 'the rulers\' own good'], ['oligarchy', 'a few', 'the rulers\' own good'], ['democracy (in Aristotle\'s sense)', 'many', 'the rulers\' own good']];
function famSix(R, lv) {
  var f = R.pick(SIX), others = SIX.filter(function (x) { return x !== f; }), k = R.int(0, lv === 1 ? 0 : 2);
  if (k === 0) return H.mc('In Aristotle\'s Politics, what is rule by <b>' + f[1] + '</b> for <b>' + f[2] + '</b> called?', f[0], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[0]; }), [f[0] + ': rule by ' + f[1] + ', for ' + f[2] + '.']);
  if (k === 1) { var twin = SIX.filter(function (x) { return x[1] === f[1] && x !== f; })[0]; return H.mc('In Aristotle\'s scheme, what is the twin of <b>' + f[0] + '</b>, with the same number of rulers but the ' + (f[2] === 'the common good' ? 'bad' : 'good') + ' aim?', twin[0], others.filter(function (x) { return x !== twin; }).slice(0, 3).map(function (x) { return x[0]; }), [f[0] + ' and ' + twin[0] + ' are both rule by ' + f[1] + '.']); }
  return H.mc('Is <b>' + f[0] + '</b> one of Aristotle\'s good forms (for the common good) or one of the deviations?', f[2] === 'the common good' ? 'A good form' : 'A deviation', [f[2] === 'the common good' ? 'A deviation' : 'A good form'], ['Good forms: kingship, aristocracy, polity. Deviations: tyranny, oligarchy, democracy (in his sense).']);
}
function famVote(R, lv) {
  var n = R.int(3, 9), t = R.int(1, 3);
  return H.num('Aristotle compares the many to a feast where each guest brings a dish. If ' + n + ' families each bring ' + t + ' dish' + (t > 1 ? 'es' : '') + ', and one host alone could make 2, how many more dishes does the shared feast have than the single host\'s dinner?', n * t - 2, ['Shared feast: $' + n + ' \\times ' + t + ' = ' + n * t + '$ dishes.', '$' + n * t + ' - 2 = ' + (n * t - 2) + '$ more. His point: together, ordinary people may judge better than a few.']);
}
var EV = [['Solon\'s reforms in Athens', -594, 'about 594 BC'], ['Cleisthenes\' reforms', -508, 'about 508 BC'], ['Aristotle joins Plato\'s Academy', -367, '367 BC'], ['Aristotle tutors young Alexander', -343, 'about 343 BC'], ['Aristotle founds the Lyceum', -335, '335 BC'], ['The Athenian Constitution is published from a papyrus', 1891, '1891']];
var TERMS = [['polis', 'the Greek city-state, a self-governing community'], ['political animal', 'a being made by nature to live in a city'], ['polity', 'rule by the many for the common good, a mix of rich and poor'], ['citizen', 'for Aristotle, one who shares in judging and ruling'], ['deviation', 'a bad form of government, ruling for the rulers\' own good'], ['the middle class', 'citizens neither very rich nor very poor, who steady a city']];
var B = {
  facts: [
    ['Aristotle says man is by nature a political animal.', true, 'Politics I.2.'],
    ['Aristotle says someone who needs no city is either a beast or a god.', true, 'Politics I.2.'],
    ['Aristotle praised Plato\'s plan for guardians to share all property.', false, 'He criticized it in Book II.'],
    ['For Aristotle, the real difference between oligarchy and democracy is wealth.', true, 'Rule by the rich versus rule by the poor.'],
    ['Aristotle thought a large middle class makes a city stable.', true, 'Politics IV.11.'],
    ['In Aristotle\'s scheme, "democracy" is one of the good forms.', false, 'It is the deviation; polity is the good form of rule by many.'],
    ['Aristotle argues that the many, together, may judge better than the few.', true, 'The feast argument, Politics III.11.'],
    ['The Athenian Constitution was found on a papyrus and published in 1891.', true, 'From Egypt, by way of the British Museum.'],
    ['Aristotle says education should aim only at making money.', false, 'Also at the right use of leisure.'],
    ['Aristotle\'s defense of slavery is accepted today.', false, 'It has been rejected.']
  ],
  items: [
    { q: 'Why does Aristotle say humans are more political than bees?', r: 'Only humans have speech, to share ideas of just and unjust', w: ['Humans are bigger', 'Bees cannot fly far', 'Humans have kings'], why: 'Politics I.2.' },
    { q: 'What is a citizen, in Aristotle\'s definition?', r: 'One who shares in judging and ruling', w: ['Anyone who lives in the city', 'Anyone who pays taxes', 'Only the king'], why: 'Politics III.1.' },
    { q: 'What is the main cause of revolutions, according to Book V?', r: 'Quarrels over fairness: one side thinks it gets less than its due', w: ['Bad weather', 'Foreign music', 'Too many festivals'], why: 'Politics V.1.' },
    { q: 'About how many constitutions did Aristotle and his students collect?', r: 'About 158', w: ['About 5', 'About 20', 'About 1,000'], why: 'Only the Athenian one survives.' },
    { q: 'Why did Aristotle think law should rule where it can?', r: 'Law is reason without passion; rulers decide only what law cannot settle', w: ['Laws never change', 'Rulers are always bad', 'The gods wrote the laws'], why: 'Politics III.15–16.' },
    { q: 'What does Aristotle say a city exists for?', r: 'Not just for life, but for the good life', w: ['Only for trade', 'Only for war', 'For the king\'s glory'], why: 'Politics I.2, III.9.' }
  ]
};
H.T(ID, B, [famSix, famSix, famVote, function (R, lv) { return famSeq(R, lv, EV); }, function (R, lv) { return famTerm(R, lv, TERMS, 'the Politics'); }].concat(dateFams(ID)), 0.55);
