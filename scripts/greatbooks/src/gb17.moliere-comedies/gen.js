/* gb17.moliere-comedies: practice generator (gbw2). Shared helpers first. */
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
var ID = 'gb17.moliere-comedies';
var HERO = [['Harpagon', 'The Miser'], ['Orgon', 'Tartuffe'], ['Monsieur Jourdain', 'The Would-Be Gentleman'], ['Argan', 'The Would-Be Invalid'], ['Arnolphe', 'The School for Wives'], ['Sganarelle', 'Don Juan']];
var FOLLY = [['Harpagon', 'his money-box'], ['Orgon', 'blind trust in a false saint'], ['Monsieur Jourdain', 'wanting to be a nobleman'], ['Argan', 'being sure he is sick'], ['Arnolphe', 'fear of being deceived by a clever wife'], ['Don Juan', 'pleasure and contempt for promises']];
var CLEAR = [['Dorine', 'Tartuffe'], ['Toinette', 'The Would-Be Invalid'], ['Nicole', 'The Would-Be Gentleman'], ['Sganarelle', 'Don Juan']];
var PLAYS = [['The School for Wives', 1662, '1662'], ['Tartuffe, first version', 1664, '1664'], ['Don Juan', 1665, '1665'], ['The Miser', 1668, '1668'], ['Tartuffe allowed in public', 1669, '1669'], ['The Would-Be Gentleman', 1670, '1670'], ['The Would-Be Invalid', 1673, '1673']];
var WHO = [['Harpagon', 'Thieves! Who has taken my money? Is it you?'], ['Monsieur Jourdain', 'I have been speaking prose for forty years without knowing it!'], ['Valère', 'We must eat to live, and not live to eat.'], ['Dorine', 'Sir, your guest is not the saint you think he is.'], ['Molière, defending Tartuffe', 'The play mocks false piety, not true piety.']];
var B = {
  facts: [
    ['Molière was a stage name.', true, 'He was born Jean-Baptiste Poquelin.'],
    ['Molière only wrote plays and never acted.', false, 'He led his company and played the leading comic roles.'],
    ['Tartuffe was banned for several years after religious objections.', true, 'From 1664 to 1669.'],
    ['In Tartuffe, Orgon sees through the hypocrite at once.', false, 'He is completely taken in until his wife exposes Tartuffe.'],
    ['Harpagon is the miser.', true, 'He loves his money-box above his children.'],
    ['Monsieur Jourdain learns he has been speaking prose all his life.', true, 'The Would-Be Gentleman.'],
    ['Molière died after performing in his last play.', true, 'The Would-Be Invalid, February 1673.'],
    ['Argan is a doctor who thinks everyone else is sick.', false, 'He is a healthy man convinced that he himself is sick.'],
    ['The Comédie-Française grew out of Molière\'s company.', true, 'Founded 1680.'],
    ['Molière believed comedy can correct faults by making people laugh.', true, 'He defended his plays this way.']
  ],
  items: [
    { q: 'Who protected Molière and enjoyed his plays?', r: 'King Louis XIV', w: ['King James I', 'Cardinal Richelieu', 'Oliver Cromwell'], why: 'From 1658.' },
    { q: 'Who exposes Tartuffe to Orgon?', r: 'Elmire, Orgon\'s wife', w: ['Harpagon', 'Argan', 'Agnès'], why: 'Orgon hides and overhears.' },
    { q: 'What does Toinette disguise herself as?', r: 'A doctor', w: ['A soldier', 'A priest', 'A Turk'], why: 'In The Would-Be Invalid.' },
    { q: 'What fools Monsieur Jourdain at the end?', r: 'A mock Turkish ceremony', w: ['A forged letter', 'A ghost', 'A stolen money-box'], why: 'He is made a "Mamamouchi".' },
    { q: 'What is Arnolphe\'s plan in The School for Wives?', r: 'To raise his ward in ignorance so she will be an obedient wife', w: ['To become a doctor', 'To bury his money', 'To become a nobleman'], why: 'It backfires.' },
    { q: 'What is "character comedy"?', r: 'Comedy built around a type of person ruled by one trait', w: ['Comedy with no characters', 'Comedy about animals', 'Comedy told only in songs'], why: 'The miser, the hypocrite, the snob.' }
  ]
};
H.T(ID, B, [function (R, lv) { return famMatch(R, lv, HERO, 'In which play does # appear?', 'Which of these characters is in #?'); }, function (R, lv) { return famMatch(R, lv, FOLLY, 'What is # ruled by?', 'Which character is ruled by #?'); }, function (R, lv) { return famMatch(R, lv, CLEAR, 'In which play does # help others see the truth?', 'Who helps others see the truth in #?'); }, function (R, lv) { return famSeq(R, lv, PLAYS, 'plays and events'); }, function (R, lv) { return famFirst(R, lv, PLAYS, 'plays and events'); }, function (R, lv) { return famWho(R, lv, WHO, 'Molière\'s plays (in our own summary)'); }].concat(dateFams(ID)), 0.6);
