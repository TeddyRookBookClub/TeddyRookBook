/* gb17.hobbes-leviathan: practice generator (gbw2). Shared helpers first. */
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
var ID = 'gb17.hobbes-leviathan';
var CAUSE = [['competition', 'gain'], ['diffidence (distrust)', 'safety'], ['glory', 'reputation']];
var LAWS = [['the first law of nature', 'seek peace when you can; when you cannot, defend yourself'], ['the second law of nature', 'be willing to lay down your right to all things, if others will do the same'], ['the third law of nature', 'keep the agreements you make: the root of justice']];
var PARTS = [['Of Man', 1, 'Part I'], ['Of Commonwealth', 2, 'Part II'], ['Of a Christian Commonwealth', 3, 'Part III'], ['Of the Kingdom of Darkness', 4, 'Part IV']];
var ARG = [['People are roughly equal in their power to harm one another', 1, ''], ['Equal people wanting the same things, with no common power, distrust one another', 2, ''], ['So they live in a state of war of every one against every one', 3, ''], ['Reason finds laws of nature: seek peace, lay down rights together, keep agreements', 4, ''], ['Agreements need power behind them, so people covenant to set up a sovereign', 5, ''], ['The sovereign keeps the peace, and work, trade and learning become possible', 6, '']];
var TM = [['state of nature', 'the condition of people with no common power over them'], ['covenant', 'an agreement in which people bind themselves for the future'], ['sovereign', 'the person or assembly that holds the united power of the commonwealth'], ['commonwealth', 'a multitude of people united under one sovereign power'], ['diffidence', 'Hobbes\'s word for distrust of others'], ['law of nature', 'a rule, found by reason, for preserving one\'s life']];
var WHO = [['Hobbes', 'Without a common power, life is solitary, poor, nasty, brutish, and short.'], ['Locke', 'People in the state of nature already have rights, and a government that violates them may be resisted.'], ['Rousseau', 'Hobbes\'s "natural" man is really a person already shaped by society.'], ['Hobbes\'s royalist critics', 'Kings do not owe their power to the people\'s agreement.']];
var EV = [['Hobbes is born, the year of the Spanish Armada', 1588, '1588'], ['Hobbes visits Galileo', 1636, '1636'], ['Hobbes goes to Paris', 1640, '1640'], ['the English Civil War begins', 1642, '1642'], ['Leviathan is published', 1651, '1651'], ['Parliament\'s inquiry into irreligious books', 1666, '1666'], ['Locke\'s Two Treatises of Government', 1689, '1689']];
function famCause(R, lv) { return famMatch(R, lv, CAUSE, 'In Leviathan XIII, the quarrel-cause # makes people fight for what?', 'Which of Hobbes\'s three causes of quarrel makes people fight for #?'); }
var B = {
  facts: [
    ['Hobbes says people are roughly equal in their power to harm one another.', true, 'Even the weakest can kill the strongest by plot or with allies.'],
    ['Hobbes says the state of nature is peaceful and happy.', false, 'It is a war of every one against every one.'],
    ['For Hobbes, "war" includes a known readiness to fight, not only battles.', true, 'Like foul weather: an inclination of many days to rain.'],
    ['Hobbes bases the sovereign\'s authority on divine right.', false, 'On the people\'s covenant, made for their safety.'],
    ['The sovereign may be one person or an assembly.', true, 'Monarchy, aristocracy or democracy are all possible.'],
    ['Hobbes says subjects keep the right to defend their own lives.', true, 'No covenant can give that up.'],
    ['Hobbes favored dividing the powers of government.', false, 'He thought divided power leads to civil war.'],
    ['Leviathan was published in 1651.', true, 'In London, as the civil wars ended.'],
    ['Leviathan is only about politics; it never discusses religion.', false, 'Parts III and IV are about religion and the church.'],
    ['Locke later argued for limited government against Hobbes\'s strong sovereign.', true, 'Two Treatises of Government, 1689.']
  ],
  items: [
    { q: 'What is the name Hobbes gives the condition of people with no common power?', r: 'The state of nature', w: ['The golden age', 'The commonwealth', 'The social order'], why: 'Leviathan XIII.' },
    { q: 'Why can\'t agreements alone keep the peace, according to Hobbes?', r: 'Without power to enforce them, they are only words', w: ['People never make agreements', 'Agreements are against the law of nature', 'The sovereign forbids them'], why: 'So people set up a common power.' },
    { q: 'Where does the name Leviathan come from?', r: 'A great sea creature in the Bible', w: ['A Greek god', 'A Roman emperor', 'An English ship'], why: 'Hobbes calls the commonwealth a mortal god.' },
    { q: 'Where was Hobbes during most of the English Civil War?', r: 'In Paris', w: ['In Rome', 'In Amsterdam', 'In Edinburgh'], why: 'From 1640 to 1651.' },
    { q: 'Which is NOT one of Hobbes\'s three causes of quarrel?', r: 'Boredom', w: ['Competition', 'Diffidence', 'Glory'], why: 'Competition, diffidence and glory.' },
    { q: 'When does a subject\'s duty to obey end, in Hobbes\'s view?', r: 'When the sovereign can no longer protect him', w: ['Whenever he disagrees with a law', 'Never, under any conditions', 'When he moves to another town'], why: 'Obedience lasts as long as protection.' }
  ]
};
H.T(ID, B, [famCause, function (R, lv) { return famTerm(R, lv, TM, 'Leviathan'); }, function (R, lv) { return famMatch(R, lv, LAWS, 'What does # say?', 'Which law of nature says: #?'); }, function (R, lv) { return famSeq(R, lv, ARG, 'steps of Hobbes\'s argument'); }, function (R, lv) { return famSeq(R, lv, PARTS, 'parts of Leviathan'); }, function (R, lv) { return famWho(R, lv, WHO, 'the debate over Leviathan'); }, function (R, lv) { return famFirst(R, lv, EV, 'events'); }].concat(dateFams(ID)), 0.6);
