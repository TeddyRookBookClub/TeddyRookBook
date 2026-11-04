/* gbgreeks.plato-symposium-phaedrus: practice generator (gbe2). Bank plus computed families; shared helpers first. */
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
var ID = 'gbgreeks.plato-symposium-phaedrus';
var SP = [['Phaedrus', 1, 'love makes lovers brave'], ['Pausanias', 2, 'two loves, heavenly and common'], ['Eryximachus', 3, 'love as harmony in nature'], ['Aristophanes', 4, 'the split round people'], ['Agathon', 5, 'love is young and beautiful'], ['Socrates', 6, 'what Diotima taught him'], ['Alcibiades', 7, 'praise of Socrates']];
var LAD = [['one beautiful person', 1, ''], ['beauty in many people', 2, ''], ['beauty of character', 3, ''], ['beautiful ways of life and laws', 4, ''], ['beautiful knowledge', 5, ''], ['Beauty itself', 6, '']];
var WHO = [['Aristophanes', 'Humans were once round and double, and love is the search for one\'s other half.'], ['Pausanias', 'There are two kinds of love, one heavenly and one common.'], ['Eryximachus', 'Love is a force of harmony in medicine, music and the seasons.'], ['Agathon', 'Love is the youngest and most beautiful of the gods.'], ['Diotima', 'Love is a spirit between gods and mortals, wanting the good for ever.'], ['Alcibiades', 'Socrates is like a Silenus statue: plain outside, gods within.'], ['Phaedrus', 'Lovers are the bravest of all, ashamed to act badly in front of each other.']];
var CH = [['the charioteer', 'reason, which steers'], ['the noble horse', 'the spirited part, which cares about honor'], ['the unruly horse', 'appetite, which pulls toward pleasure'], ['the wings', 'what lets the soul rise toward the Forms']];
var TERMS = [['symposium', 'a drinking party with conversation, after dinner'], ['Eros', 'the Greek god of love'], ['Diotima', 'the wise woman of Mantinea who, Socrates says, taught him about love'], ['Beauty itself', 'the Form of beauty, which every beautiful thing shares in'], ['Platonic love', 'a later phrase, from readings of the Symposium, for love not about the body'], ['Theuth', 'the Egyptian god who, in the Phaedrus\'s story, invented writing']];
var B = {
  facts: [
    ['The Symposium is set at a party celebrating Agathon\'s win in a tragedy competition.', true, 'In 416 BC.'],
    ['Aristophanes tells the story of the round people split in two.', true, 'His comic myth of the "other half".'],
    ['Diotima says Love is the most beautiful of the gods.', false, 'She says Love lacks beauty and wants it; it is a spirit between gods and mortals.'],
    ['The top of Diotima\'s ladder is Beauty itself.', true, 'Symposium 211.'],
    ['Alcibiades praises Love like the other guests.', false, 'He praises Socrates instead.'],
    ['In the Phaedrus, the soul is compared to a charioteer with two winged horses.', true, 'Phaedrus 246a.'],
    ['Socrates says writing is like painting: it cannot answer questions.', true, 'Phaedrus 275d.'],
    ['The Phaedrus takes place in the marketplace of Athens.', false, 'Outside the walls, by a stream under a plane tree.'],
    ['King Thamus says writing will make people forgetful.', true, 'In Socrates\' story of Theuth.'],
    ['The party ends at dawn with Socrates still talking.', true, 'Then he goes off to spend the day as usual.']
  ],
  items: [
    { q: 'What does Diotima say love really wants?', r: 'To have the good for ever', w: ['To win prizes', 'To be admired by everyone', 'Nothing at all'], why: 'Symposium 206a.' },
    { q: 'Why can Love not itself be beautiful, according to Socrates?', r: 'Love wants beauty, and we do not want what we already have', w: ['Love is invisible', 'Only gods are beautiful', 'Beauty is an illusion'], why: 'His questions to Agathon, 200a–201b.' },
    { q: 'What does Alcibiades compare Socrates to?', r: 'Statues of Silenus that open to show gods inside', w: ['A lion', 'A golden cup', 'A swift ship'], why: 'Symposium 215a–b.' },
    { q: 'What makes a speech good, according to the Phaedrus?', r: 'It is put together like a living creature, and the speaker knows the truth and the listeners', w: ['It is very long', 'It uses many rare words', 'It is written down'], why: 'Phaedrus 264c, 271–272.' },
    { q: 'What does "giving birth in beauty" mean in Diotima\'s speech?', r: 'Leaving behind children, works, laws or ideas that outlast us', w: ['Painting beautiful pictures only', 'Becoming young again', 'Winning a beauty contest'], why: 'Symposium 206b–209e.' },
    { q: 'How do the guests decide to spend the evening?', r: 'Each gives a speech in praise of Love', w: ['They play music all night', 'They hold a trial', 'They watch a play'], why: 'Proposed by Eryximachus, the doctor, for Phaedrus.' }
  ]
};
H.T(ID, B, [function (R, lv) { return famSeq(R, lv, SP, 'speakers at the party'); }, function (R, lv) { return famSeq(R, lv, LAD, 'steps of Diotima\'s ladder'); }, function (R, lv) { return famWho(R, lv, WHO, 'the Symposium'); }, function (R, lv) { return famMatch(R, lv, CH, 'In the Phaedrus\'s chariot of the soul, what does # stand for?', 'In the Phaedrus\'s chariot of the soul, which part stands for #?'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'the Symposium and Phaedrus'); }].concat(dateFams(ID)), 0.55);
