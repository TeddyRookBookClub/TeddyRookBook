/* gb17.milton-areopagitica-and-poems: practice generator (gbw2). Shared helpers first. */
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
var ID = 'gb17.milton-areopagitica-and-poems';
var WORKS = [['On the Morning of Christ\'s Nativity', 1629, '1629'], ['Comus', 1634, '1634'], ['Lycidas', 1637, '1637'], ['the Licensing Order', 1643, '1643'], ['Areopagitica', 1644, '1644'], ['Paradise Lost', 1667, '1667'], ['Samson Agonistes', 1671, '1671'], ['licensing in England lapses', 1695, '1695']];
var KIND = [['Lycidas', 'an elegy for a drowned college friend'], ['Comus', 'a masque, a play with music, about a lady who resists a sorcerer'], ['L\'Allegro and Il Penseroso', 'paired poems on the cheerful man and the thoughtful man'], ['Samson Agonistes', 'a tragedy in the Greek form about blind Samson'], ['Areopagitica', 'a speech in print against licensing books before printing'], ['Sonnet XIX', 'a fourteen-line poem on the poet\'s blindness']];
var WHO = [['Milton', 'As good almost kill a man as kill a good book.'], ['the supporters of licensing', 'In wartime, books that stir up rebellion must be stopped before they spread.'], ['Patience (in Sonnet XIX)', 'They also serve who only stand and wait.'], ['Samson (in Milton\'s drama)', 'Blind and captive, I have lost the strength that was my gift.']];
function famRhyme(R, lv) {
  var L = 'abbaabbacdecde', W = ['spent', 'wide', 'hide', 'bent', 'present', 'chide', 'deny\'d', 'prevent', 'need', 'best', 'State', 'speed', 'rest', 'waite'];
  var k = R.int(0, 2);
  if (k === 0) return H.num('Milton\'s Sonnet XIX rhymes <b>abbaabba cdecde</b>. How many lines end with an <b>' + (R.coin() ? 'a' : 'b') + '</b> rhyme?', 4, ['abbaabba has four a\'s and four b\'s.']);
  if (k === 1) { var i = R.int(0, 13), mates = []; for (var j = 0; j < 14; j++) if (j !== i && L[j] === L[i]) mates.push(W[j]); var others = W.filter(function (w, j) { return L[j] !== L[i]; }); return H.mc('In Sonnet XIX (rhyme scheme abbaabba cdecde), line ' + (i + 1) + ' ends "' + W[i] + '". Which line ending rhymes with it in the scheme?', R.pick(mates), H.samp(R, others, lv === 1 ? 2 : 3), ['Line ' + (i + 1) + ' has rhyme ' + L[i] + ', like ' + mates.join(', ') + '.']); }
  var oc = R.coin(); return H.num('An Italian sonnet like Milton\'s Sonnet XIX has 14 lines: an octave and a sestet. How many lines are in the <b>' + (oc ? 'octave' : 'sestet') + '</b>?', oc ? 8 : 6, ['Octave 8 + sestet 6 = 14.']);
}
var B = {
  facts: [
    ['Areopagitica argued against licensing books before they were printed.', true, 'It answered the order of June 1643.'],
    ['Milton argued that no book should ever be punished.', false, 'He accepted punishment after printing for books found harmful.'],
    ['The title Areopagitica recalls the ancient council of Athens.', true, 'The Areopagus.'],
    ['Milton\'s Areopagitica ended licensing at once.', false, 'Licensing went on; it lapsed in 1695.'],
    ['Milton says virtue that never meets its adversary is not worth praising.', true, '"a fugitive and cloistered virtue".'],
    ['Lycidas is an elegy for a drowned friend.', true, 'Edward King, of Milton\'s Cambridge college.'],
    ['Samson Agonistes was written to be staged with music and dancing.', false, 'It is a drama in the Greek form, not meant for the stage.'],
    ['Sonnet XIX is about Milton\'s blindness.', true, '"When I consider how my light is spent".'],
    ['Milton included Roman Catholic worship in the toleration he asked for.', false, 'He excluded it, and what he called open superstition.'],
    ['Areopagitica was written as if it were a speech to Parliament.', true, 'But it was printed, not spoken.']
  ],
  items: [
    { q: 'What did the 1643 order require?', r: 'A licenser\'s approval before a book was printed', w: ['That all books be in Latin', 'That printers pay a tax on paper', 'That plays be closed'], why: 'Pre-publication licensing.' },
    { q: 'According to Milton, who destroys a good book kills what?', r: 'Reason itself', w: ['A tree', 'The printer', 'Time'], why: 'Areopagitica.' },
    { q: 'What does Milton say happens when Truth and Falsehood grapple in a free and open encounter?', r: 'Truth is never put to the worse', w: ['Falsehood always wins', 'Both are destroyed', 'Nobody can tell which won'], why: 'Areopagitica.' },
    { q: 'What is the last line of Sonnet XIX (modern spelling)?', r: 'They also serve who only stand and wait.', w: ['Death, thou shalt die.', 'To be or not to be.', 'The world was all before them.'], why: 'Patience\'s answer.' },
    { q: 'Who is held captive in Samson Agonistes?', r: 'Samson, by the Philistines', w: ['Adam, by Satan', 'Milton, by the king', 'Lycidas, by the sea'], why: 'In Gaza.' },
    { q: 'Which later book on this ladder echoes Milton\'s case for free discussion?', r: 'Mill\'s On Liberty', w: ['Hobbes\'s Leviathan', 'Machiavelli\'s The Prince', 'Euclid\'s Elements'], why: '1859.' }
  ]
};
H.T(ID, B, [famRhyme, function (R, lv) { return famSeq(R, lv, WORKS, 'works and events'); }, function (R, lv) { return famFirst(R, lv, WORKS, 'works and events'); }, function (R, lv) { return famMatch(R, lv, KIND, 'What kind of work is #?', 'Which of Milton\'s works is #?'); }, function (R, lv) { return famWho(R, lv, WHO, 'Milton\'s prose and poems (in our own summary)'); }].concat(dateFams(ID)), 0.6);
