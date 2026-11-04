/* gb17.milton-paradise-lost: practice generator (gbw2). Shared helpers first. */
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
var ID = 'gb17.milton-paradise-lost';
var STORY = [['the rebel angels in Hell build Pandemonium', 1, 'Books I–II'], ['Satan crosses Chaos', 2, 'Book II'], ['in Heaven, the Son offers to redeem humankind', 3, 'Book III'], ['Satan first sees Adam and Eve in Eden', 4, 'Book IV'], ['Raphael tells of the war in Heaven', 5, 'Books V–VI'], ['Raphael tells of the creation', 6, 'Book VII'], ['the serpent tempts Eve', 7, 'Book IX'], ['Adam and Eve repent', 8, 'Book X'], ['Michael shows Adam the future', 9, 'Books XI–XII'], ['Adam and Eve leave Eden', 10, 'Book XII']];
var WHO = [['Satan', 'The mind is its own place, and can make a Heaven of Hell.'], ['Raphael', 'Let me tell you of the war in Heaven, so you can be warned.'], ['Michael', 'Here is what will happen to your children in times to come.'], ['Milton (the narrator)', 'I will justify the ways of God to men.'], ['God (in Book III)', 'I made them free to stand or fall.']];
var PL = [['Satan', 'the rebel archangel'], ['Raphael', 'the angel who visits Adam to warn him'], ['Michael', 'the angel who shows Adam the future and leads them from Eden'], ['Pandemonium', 'the palace of the devils in Hell'], ['Chaos', 'the dark, wild realm between Heaven and Hell'], ['Eden', 'the garden where Adam and Eve first live'], ['the Muse', 'the heavenly power the poet calls on for help']];
var EV = [['Milton is born', 1608, '1608'], ['Areopagitica', 1644, '1644'], ['Milton is totally blind', 1652, 'c. 1652'], ['the monarchy is restored', 1660, '1660'], ['Paradise Lost, ten books', 1667, '1667'], ['Paradise Lost, twelve books', 1674, '1674'], ['Milton dies', 1674.9, '1674']];
function famVerse(R, lv) {
  var k = R.pick([0, 1, 2]);
  if (k === 0) return H.num('Milton\'s blank verse uses lines of iambic pentameter. How many syllables are in a regular line?', 10, ['Five iambs ("penta-" means five), each with two syllables: $5 \\times 2 = 10$.']);
  if (k === 1) return H.num('In iambic pentameter, how many syllables in a regular line are <b>stressed</b>?', 5, ['Each iamb is unstressed-stressed, and there are five of them.']);
  var n = R.pick([10, 12]); return H.mc('How many books does the ' + (n === 10 ? 'first edition (1667)' : 'second edition (1674)') + ' of Paradise Lost have?', String(n), [n === 10 ? '12' : '10', '24', '6'], ['1667: ten books; 1674: twelve.']);
}
var B = {
  facts: [
    ['Paradise Lost is written in rhymed couplets.', false, 'It is in blank verse: unrhymed iambic pentameter.'],
    ['Milton was blind when he composed Paradise Lost.', true, 'He dictated it.'],
    ['The poem begins in Hell, with Satan and the rebel angels.', true, 'In the manner of the ancient epics, in the middle of things.'],
    ['Milton says his aim is to justify the ways of God to men.', true, 'Book I.'],
    ['In the poem, Adam eats the fruit first and Eve follows.', false, 'Eve eats first; Adam, unwilling to lose her, eats too.'],
    ['Raphael tells Adam about the war in Heaven.', true, 'Books V–VI.'],
    ['The poem ends with Adam and Eve leaving Eden together.', true, 'Book XII.'],
    ['Milton wrote the poem in Latin.', false, 'In English.'],
    ['In Milton\'s universe, the World hangs from Heaven by a golden chain.', true, 'Book II.'],
    ['Satan grows grander and grander as the poem goes on.', false, 'He shrinks, at last to a serpent.']
  ],
  items: [
    { q: 'What is the subject of Paradise Lost, in Milton\'s first line?', r: 'Man\'s first disobedience', w: ['The fall of Troy', 'The founding of Rome', 'The English Civil War'], why: 'Book I, line 1.' },
    { q: 'Whom does Milton call on for help at the start?', r: 'The Heavenly Muse', w: ['King Charles', 'Homer', 'Shakespeare'], why: '"Sing, Heavenly Muse".' },
    { q: 'What is Pandemonium?', r: 'The palace of the devils', w: ['A garden in Eden', 'A star', 'A river in Heaven'], why: 'Built in Book I.' },
    { q: 'Which poet said Milton was "of the Devil\'s party without knowing it"?', r: 'William Blake', w: ['Samuel Johnson', 'Shakespeare', 'Dante'], why: 'In the 1790s.' },
    { q: 'What job did Milton hold under the Commonwealth?', r: 'Secretary for Foreign Tongues', w: ['Lord Chancellor', 'Archbishop', 'Admiral'], why: 'He wrote the government\'s letters in Latin.' },
    { q: 'Why, in the poem, did God make angels and people free?', r: 'Because obedience not freely chosen is worth nothing', w: ['By accident', 'To test the angels\' strength', 'Because Satan asked him to'], why: 'Book III.' }
  ]
};
H.T(ID, B, [famVerse, function (R, lv) { return famSeq(R, lv, STORY, 'events of the poem'); }, function (R, lv) { return famSeq(R, lv, STORY, 'events of the poem'); }, function (R, lv) { return famMatch(R, lv, PL, 'In Paradise Lost, who or what is #?', 'In Paradise Lost, which name belongs to #?'); }, function (R, lv) { return famWho(R, lv, WHO, 'Paradise Lost (in our own summary)'); }, function (R, lv) { return famFirst(R, lv, EV, 'events'); }].concat(dateFams(ID)), 0.6);
