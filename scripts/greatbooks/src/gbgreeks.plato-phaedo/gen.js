/* gbgreeks.plato-phaedo: practice generator (gbe2). Bank plus computed families; shared helpers first. */
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
var ID = 'gbgreeks.plato-phaedo';
var ARGS = [['The argument from opposites', 1, 'the first argument'], ['The argument from recollection', 2, 'the second'], ['The argument from likeness to the unseen', 3, 'the third'], ['The argument from the Form of life', 4, 'the last']];
var DAY = [['Friends gather at the prison at dawn', 1, ''], ['Xanthippe is taken home', 2, ''], ['Socrates explains the dream that said "make music"', 3, ''], ['Simmias and Cebes raise their objections', 4, ''], ['Socrates tells of his disappointment with Anaxagoras', 5, ''], ['The story of the true earth', 6, ''], ['Socrates drinks the cup at sunset', 7, '']];
var WHO = [['Simmias', 'The soul may be like the tuning of a lyre, gone when the lyre breaks.'], ['Cebes', 'The soul may be like a weaver who outlasts many cloaks but dies at last.'], ['Socrates', 'Do not become a hater of arguments because some arguments fail.'], ['Phaedo', 'Of all the men of his time, he was the wisest and justest and best.'], ['Echecrates', 'Tell me everything that was said and done on that last day.'], ['Crito', 'How shall we bury you?']];
var OPP = [['asleep', 'awake', 'waking up', 'falling asleep'], ['smaller', 'larger', 'growing', 'shrinking'], ['cold', 'hot', 'warming', 'cooling'], ['weaker', 'stronger', 'strengthening', 'weakening'], ['worse', 'better', 'improving', 'getting worse'], ['dead', 'living', 'coming back to life', 'dying']];
var TERMS = [['Form', 'a perfect, unchanging pattern, such as Equality itself, that things only resemble'], ['recollection', 'learning as remembering what the soul knew before birth'], ['misology', 'hatred of arguments, from being let down by bad ones'], ['harmony', 'Simmias\'s picture of the soul as the tuning of a lyre'], ['swan song', 'the last and finest song, which Socrates says swans sing in joy'], ['second voyage', 'Socrates\' turn to the Forms after Anaxagoras disappointed him']];
function famOpp(R, lv) {
  var p = R.pick(OPP), dir = R.coin(), others = OPP.filter(function (x) { return x !== p; });
  if (lv === 1) return H.mc('In the Phaedo, opposites come from opposites. What is the opposite of <b>' + p[dir ? 0 : 1] + '</b>?', p[dir ? 1 : 0], H.samp(R, others, 2).map(function (x) { return x[dir ? 1 : 0]; }), ['Socrates pairs ' + p[0] + ' with ' + p[1] + '.']);
  return H.mc('Socrates says every pair of opposites is joined by two processes. What turns something <b>' + p[dir ? 0 : 1] + '</b> into something <b>' + p[dir ? 1 : 0] + '</b>?', dir ? p[2] : p[3], H.samp(R, others, 3).map(function (x) { return dir ? x[2] : x[3]; }), [p[0] + ' → ' + p[1] + ': ' + p[2] + '; ' + p[1] + ' → ' + p[0] + ': ' + p[3] + '.']);
}
var B = {
  facts: [
    ['Plato was present on Socrates\' last day.', false, 'Phaedo says Plato was ill.'],
    ['The story is told by Phaedo to Echecrates.', true, 'Some time after the event.'],
    ['Socrates spent his last days setting Aesop\'s fables to verse.', true, 'A dream had told him to "make music".'],
    ['Simmias compares the soul to the tuning of a lyre.', true, 'His objection: tuning vanishes when the lyre breaks.'],
    ['Socrates says the arguments are complete and need no more testing.', false, 'He says the starting points deserve more study.'],
    ['The recollection argument says we knew Equality itself before birth.', true, 'Because no two sticks are perfectly equal, yet we know what equal means.'],
    ['Socrates says swans sing before death out of sorrow.', false, 'Out of joy, he says, because they are going to the god they serve.'],
    ['Socrates was disappointed by the philosopher Anaxagoras.', true, 'Anaxagoras explained bones and muscles, not what is best.'],
    ['Socrates warns against becoming a hater of arguments.', true, 'The fault is in our skill, not in reasoning.'],
    ['Socrates\' last words ask Crito to offer a rooster to Asclepius.', true, 'Asclepius was the god of healing.']
  ],
  items: [
    { q: 'What is the main question of the Phaedo?', r: 'Does the soul outlive the body?', w: ['What is justice?', 'Can virtue be taught?', 'What is knowledge?'], why: 'It is asked on Socrates\' last day.' },
    { q: 'Why does Socrates say a philosopher should not fear death?', r: 'A philosopher has been practicing for it, by turning from the body to the mind', w: ['Death is only a dream', 'The gods punish the fearful', 'Philosophers do not feel pain'], why: 'Phaedo 64a–67e, as Socrates believes.' },
    { q: 'What is Cebes\' objection?', r: 'The soul might outlast many bodies, like a weaver many cloaks, and still die at last', w: ['The soul is a kind of music', 'There is no such thing as a soul', 'Socrates should escape'], why: 'Phaedo 87b–88b.' },
    { q: 'What does the recollection argument show, even if it works?', r: 'That the soul existed before birth', w: ['That the soul lasts for ever', 'That the body is the soul', 'That geometry is false'], why: 'Simmias and Cebes point out it needs adding to.' },
    { q: 'Which earlier dialogue also uses the idea that learning is recollection?', r: 'The Meno', w: ['The Euthyphro', 'The Crito', 'The Laws'], why: 'Socrates questions a boy about a square.' },
    { q: 'How does Plato describe Socrates\' death?', r: 'Calmly, among his friends, at sunset', w: ['As a battle', 'In a storm at sea', 'In secret, with no friends present'], why: 'Phaedo 116a–118a.' }
  ]
};
H.T(ID, B, [famOpp, famOpp, function (R, lv) { return famSeq(R, lv, ARGS, 'arguments'); }, function (R, lv) { return famSeq(R, lv, DAY); }, function (R, lv) { return famWho(R, lv, WHO, 'the Phaedo'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'the Phaedo'); }].concat(dateFams(ID)), 0.55);
