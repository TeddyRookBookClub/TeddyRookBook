/* gb17.racine-phaedra: practice generator (gbw2). Shared helpers first. */
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
var ID = 'gb17.racine-phaedra';
var PLOT = [['Hippolytus says he must leave Troezen', 1, 'Act I'], ['Phaedra tells Oenone her secret', 2, 'Act I'], ['false news comes that Theseus is dead', 3, 'Act I'], ['Theseus returns alive', 4, 'Act III'], ['Oenone accuses Hippolytus to Theseus', 5, 'Act IV'], ['Theseus banishes his son and calls on Neptune', 6, 'Act IV'], ['Theramenes reports Hippolytus\'s death', 7, 'Act V'], ['Phaedra confesses the truth', 8, 'Act V']];
var WHO = [['Theseus', 'the king of Athens, father of Hippolytus'], ['Phaedra', 'the queen, daughter of Minos'], ['Hippolytus', 'the king\'s son, who loves Aricia'], ['Aricia', 'the princess Theseus forbade to marry'], ['Oenone', 'Phaedra\'s nurse and confidant'], ['Theramenes', 'Hippolytus\'s tutor, who reports his death'], ['Titus', 'the Roman emperor in Berenice'], ['Antiochus', 'the king who silently loves Berenice']];
var TM = [['the three unities', 'one action, in one place, within about one day'], ['alexandrine', 'a line of twelve syllables, used in rhymed pairs in French tragedy'], ['decorum', 'the rule that violence is not shown on stage and speech stays noble'], ['verisimilitude', 'likelihood: the action should seem believable'], ['confidant', 'a trusted companion to whom a main character tells secrets'], ['tragedy', 'a serious play in which great people are brought to suffering']];
var EV = [['Racine is born', 1639, '1639'], ['Andromache, his first great success', 1667, '1667'], ['Berenice', 1670, '1670'], ['Phaedra', 1677, '1677'], ['he becomes the king\'s historian', 1677.5, '1677'], ['Esther, for a girls\' school', 1689, '1689'], ['Athalie', 1691, '1691'], ['Racine dies', 1699, '1699']];
function famUnity(R, lv) {
  var k = R.int(0, 2);
  if (k === 0) return H.num('A French alexandrine has how many syllables?', 12, ['Twelve, usually with a pause after the sixth.']);
  if (k === 1) { var n = R.pick([2, 3, 4]); return H.num('Racine\'s tragedies are in alexandrines, rhymed in pairs. How many syllables are in ' + n + ' full lines?', 12 * n, ['$' + n + ' \\times 12 = ' + 12 * n + '$.']); }
  return H.mc('Which is NOT one of the three unities?', 'Unity of costume', ['Unity of time', 'Unity of place', 'Unity of action'], ['Time, place and action.']);
}
var B = {
  facts: [
    ['Racine was educated by the Jansenists of Port-Royal.', true, 'Like Pascal, he knew Port-Royal well.'],
    ['In Berenice, Titus marries Berenice at the end.', false, 'He sends her away, for Rome\'s sake.'],
    ['Racine said a tragedy needs no blood or death.', true, 'In his preface to Berenice.'],
    ['Phaedra takes place in Troezen.', true, 'In Greece.'],
    ['Racine shows Hippolytus\'s death on stage.', false, 'Theramenes reports it in a speech.'],
    ['Oenone\'s plan leads to the false accusation of Hippolytus.', true, 'Phaedra allows it out of fear.'],
    ['Racine invented the story of Phaedra.', false, 'He took it from Euripides and Seneca, and changed it.'],
    ['Racine wrote mostly comedies.', false, 'He wrote tragedies; his one comedy is The Litigants.'],
    ['In Racine\'s play, Hippolytus loves Aricia.', true, 'Racine added her to the story.'],
    ['After Phaedra, Racine wrote only two more plays, on biblical subjects.', true, 'Esther and Athalie.']
  ],
  items: [
    { q: 'Why must Titus give up Berenice?', r: 'Rome will not accept a foreign queen', w: ['She loves Antiochus', 'She is a spy', 'His father forbids it'], why: 'Duty to Rome.' },
    { q: 'Which Greek playwright wrote the Hippolytus that Racine used?', r: 'Euripides', w: ['Aristophanes', 'Homer', 'Aeschylus'], why: 'On this ladder\'s Greek rungs.' },
    { q: 'What keeps Phaedra silent when she comes to tell Theseus the truth?', r: 'Jealousy, when she learns Hippolytus loves Aricia', w: ['Theseus will not let her speak', 'She has lost her voice', 'Oenone locks her in'], why: 'Act IV.' },
    { q: 'Whom does Theseus call on to punish his son?', r: 'Neptune', w: ['Jupiter', 'Apollo', 'Minerva'], why: 'He had promised Theseus a wish.' },
    { q: 'Who was Racine\'s great older rival in tragedy?', r: 'Pierre Corneille', w: ['Molière', 'Pascal', 'Milton'], why: 'Corneille\'s heroes master their passions by will.' },
    { q: 'How does Racine describe Phaedra?', r: 'Neither entirely guilty nor entirely innocent', w: ['Entirely wicked', 'Entirely innocent', 'A comic figure'], why: 'In his preface.' }
  ]
};
H.T(ID, B, [famUnity, function (R, lv) { return famSeq(R, lv, PLOT, 'events of Phaedra'); }, function (R, lv) { return famSeq(R, lv, PLOT, 'events of Phaedra'); }, function (R, lv) { return famMatch(R, lv, WHO, 'In Racine, who is #?', 'In Racine, which character is #?'); }, function (R, lv) { return famTerm(R, lv, TM, 'French classical tragedy'); }, function (R, lv) { return famFirst(R, lv, EV, 'events'); }].concat(dateFams(ID)), 0.6);
