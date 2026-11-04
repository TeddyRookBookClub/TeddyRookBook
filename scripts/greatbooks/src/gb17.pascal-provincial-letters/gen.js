/* gb17.pascal-provincial-letters: practice generator (gbw2). Shared helpers first. */
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
var ID = 'gb17.pascal-provincial-letters';
var TM = [['casuistry', 'working out moral rules for particular cases'], ['probabilism', 'the view (as Pascal presents it) that one may follow any opinion a learned author holds, even if the opposite is more likely right'], ['directing the intention', 'excusing an act by fixing the mind on a harmless purpose while doing it'], ['mental reservation', 'saying something misleading while silently adding words that make it technically true'], ['Jansenism', 'a movement in the Catholic Church, named after Bishop Cornelius Jansen, stressing dependence on God\'s grace'], ['Port-Royal', 'the convent near Paris at the center of the Jansenist movement'], ['proximate power', 'the disputed term the narrator of Letter I cannot get anyone to define']];
var GRP = [['Letters I–III', 'the Sorbonne quarrel over grace'], ['Letters IV–X', 'dialogues with a Jesuit Father about the casuists'], ['Letters XI–XVI', 'open replies to the Jesuit Fathers'], ['Letters XVII–XVIII', 'letters to Father Annat on the grace dispute']];
var EV = [['Pascal is born', 1623, '1623'], ['Pascal\'s religious experience', 1654, '1654'], ['Letter I', 1656.05, 'January 1656'], ['Letter XI, the first to the Jesuits', 1656.6, 'August 1656'], ['Letter XVIII', 1657.2, 'March 1657'], ['the Letters are put on the Index', 1657.7, '1657'], ['Pascal dies', 1662, '1662']];
var WHO = [['Pascal', 'Mockery is a fair weapon against error, if it stays truthful.'], ['the Jesuit replies', 'The author quotes out of context and blames a whole order for a few writers.'], ['the good Father (in the Letters)', 'One learned author is enough to make an opinion safe to follow.'], ['Voltaire', 'The Provincial Letters were the first book of genius in French prose.']];
var B = {
  facts: [
    ['Pascal wrote the first letter to defend Arnauld.', true, 'The Sorbonne was moving to censure him in 1656.'],
    ['Pascal signed the letters with his own name from the start.', false, 'They were anonymous; the collection used "Louis de Montalte".'],
    ['There are eighteen Provincial Letters.', true, 'January 1656 to March 1657.'],
    ['In Letters IV–X the narrator talks with a friendly Jesuit Father.', true, 'The Father explains the casuists.'],
    ['From Letter XI Pascal writes to the Jesuit Fathers directly.', true, 'He drops the fictional friend.'],
    ['The Jesuits agreed that Pascal had been fair to them.', false, 'They said he quoted out of context.'],
    ['Letter XVI ends with an apology for its length.', true, 'He lacked the leisure to make it shorter.'],
    ['The Letters were written in Latin for scholars.', false, 'They were in clear, everyday French for the public.'],
    ['Rome later condemned some lax moral propositions too.', true, 'In 1665–66 and 1679.'],
    ['Port-Royal was the center of the Jansenist movement.', true, 'Pascal\'s sister Jacqueline was a nun there.']
  ],
  items: [
    { q: 'Whom was Pascal defending in the first letters?', r: 'Antoine Arnauld', w: ['Descartes', 'Galileo', 'Cardinal Richelieu'], why: 'Port-Royal\'s leading theologian.' },
    { q: 'Who is the narrator pretending to write to?', r: 'A friend in the provinces', w: ['The king', 'The Pope', 'His sister'], why: 'Hence "Provincial" Letters.' },
    { q: 'What is the joke in Letter I?', r: 'A serious censure rests on a word nobody can define', w: ['The doctors speak only Greek', 'The narrator falls asleep', 'The Sorbonne burns down'], why: 'The word "proximate".' },
    { q: 'Which writer called the Letters the first book of genius in French prose?', r: 'Voltaire', w: ['Molière', 'Descartes', 'Montaigne'], why: 'Though he disagreed with Pascal about religion.' },
    { q: 'What is casuistry?', r: 'Working out moral rules for particular cases', w: ['A kind of geometry', 'A style of poetry', 'A method of farming'], why: 'From the Latin for "case".' },
    { q: 'What tone made the Letters popular?', r: 'Wit and irony', w: ['Anger and shouting', 'Dry lists of rules', 'Long Latin quotations only'], why: 'Readers laughed and wanted more.' }
  ]
};
H.T(ID, B, [function (R, lv) { return famTerm(R, lv, TM, 'the Provincial Letters'); }, function (R, lv) { return famTerm(R, lv, TM, 'the Provincial Letters'); }, function (R, lv) { return famMatch(R, lv, GRP, 'What are # mainly about?', 'Which letters are mainly about #?'); }, function (R, lv) { return famSeq(R, lv, EV, 'events'); }, function (R, lv) { return famFirst(R, lv, EV, 'events'); }, function (R, lv) { return famWho(R, lv, WHO, 'the quarrel over the Provincial Letters'); }].concat(dateFams(ID)), 0.6);
