/* gb18.gibbon-decline-and-fall-2: practice generator (gbw3). */
/* gbw3 shared generator helpers (copied into each gb18 rung by gbw3). */
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
/* put events in order: ev = [[label, key, when]] */
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
/* who said what (our own summaries): sd = [[speaker, claim]] */
function famWho(R, lv, sd, ctx) {
  var s = R.pick(sd), names = H.uniq(sd.map(function (x) { return x[0]; })).filter(function (n) { return n !== s[0]; });
  return H.mc('In ' + ctx + ', who argues this (in our own summary)? <i>"' + s[1] + '"</i>', s[0], H.samp(R, names, lv === 1 ? 2 : 3), [s[0] + ' says this, in our words.']);
}
/* match two columns: pr = [[a, b]] */
function famMatch(R, lv, pr, qa, qb) {
  var p = R.pick(pr), n = lv === 1 ? 2 : 3;
  var wb = H.uniq(pr.map(function (x) { return x[1]; })).filter(function (x) { return x !== p[1]; }), wa = H.uniq(pr.map(function (x) { return x[0]; })).filter(function (x) { return x !== p[0]; });
  if (qb && wa.length && (R.coin() || !wb.length)) return H.mc(qb.replace('#', '<b>' + p[1] + '</b>'), p[0], H.samp(R, wa, n), [p[1] + ': ' + p[0] + '.']);
  return H.mc(qa.replace('#', '<b>' + p[0] + '</b>'), p[1], H.samp(R, wb, n), [p[0] + ': ' + p[1] + '.']);
}
/* sort an example into a category: ex = [[example, category, why]], cats = list of all category names */
function famClass(R, lv, ex, cats, q) {
  var e = R.pick(ex), w = cats.filter(function (c) { return c !== e[1]; });
  return H.mc(q.replace('#', '<i>' + e[0] + '</i>'), e[1], H.samp(R, w, lv === 1 ? Math.min(2, w.length) : w.length), [e[0] + ': ' + e[1] + '.' + (e[2] ? ' ' + e[2] : '')]);
}
var ID = 'gb18.gibbon-decline-and-fall-2';
var EV = [['Justinian becomes emperor', 527, 'AD 527'], ['Muhammad goes to Medina (the Hijra)', 622, 'AD 622'], ['Charlemagne crowned emperor', 800, 'AD 800'], ['the split between the churches of Rome and Constantinople', 1054, 'AD 1054'], ['the First Crusade', 1096, 'AD 1096'], ['crusaders sack Constantinople', 1204, 'AD 1204'], ['the Mongols take Baghdad', 1258, 'AD 1258'], ['the Ottomans take Constantinople', 1453, 'AD 1453']];
var PP = [['Justinian', 'the emperor who gathered Roman law into one great code'], ['Belisarius', 'Justinian\'s general who reconquered Africa and Italy'], ['Muhammad', 'the prophet of Islam'], ['Charlemagne', 'the Frankish king crowned emperor in Rome in 800'], ['Mehmed II', 'the Ottoman sultan who took Constantinople'], ['Constantine XI', 'the last Roman emperor, who died defending Constantinople'], ['Cola di Rienzo', 'the Roman who dreamed of reviving the republic in 1347']];
function famSpan(R, lv) {
  var a = R.pick([[330, 1453, 'Constantinople as the capital of the Roman Empire'], [476, 1453, 'the eastern empire after the last western emperor'], [527, 565, 'Justinian\'s reign'], [1096, 1204, 'the time from the First Crusade to the sack of Constantinople']]);
  return H.num('About how many years passed from ' + a[0] + ' to ' + a[1] + ' (' + a[2] + ')?', a[1] - a[0], ['$' + a[1] + ' - ' + a[0] + ' = ' + (a[1] - a[0]) + '$ years.']);
}
var B = { facts: [
  ['The eastern Roman Empire lasted until 1453.', true, 'When the Ottomans took Constantinople.'],
  ['Justinian\'s lawyers gathered Roman law into a great code.', true, 'The Corpus Juris Civilis.'],
  ['The people of the eastern empire called themselves Greeks, not Romans.', false, 'They called themselves Romans; \"Byzantine\" is a later name.'],
  ['Charlemagne was crowned emperor in Rome in 800.', true, 'ch. XLIX.'],
  ['Crusaders sacked Constantinople in 1204.', true, 'The Fourth Crusade.'],
  ['Gibbon ends his history with the fall of Constantinople and says nothing more.', false, 'He ends with Rome in the Middle Ages and his own memory of the Capitol.'],
  ['Gibbon called his subject \"the triumph of barbarism and religion.\"', true, 'ch. LXXI.'],
  ['Modern historians judge the eastern empire much as Gibbon did.', false, 'They give a much fuller, more favorable picture.'],
  ['Gibbon\'s last three volumes appeared in 1788.', true, 'Finished at Lausanne in 1787.']],
 items: [
  { q: 'Which great church did Justinian rebuild in Constantinople?', r: 'Hagia Sophia', w: ['St Peter\'s', 'Notre-Dame', 'Westminster Abbey'], why: 'Dedicated in 537.' },
  { q: 'Who took Constantinople in 1453?', r: 'The Ottoman sultan Mehmed II', w: ['Charlemagne', 'Attila', 'The Fourth Crusade'], why: 'May 29, 1453.' },
  { q: 'Where did Gibbon finish writing his history?', r: 'Lausanne', w: ['Rome', 'London', 'Paris'], why: 'June 27, 1787.' },
  { q: 'Which code became a foundation of the civil law in much of Europe?', r: 'Justinian\'s Corpus Juris Civilis', w: ['The Articles of Confederation', 'The Code of Hammurabi', 'The Magna Carta'], why: 'Gibbon, ch. XLIV.' },
  { q: 'Where does Gibbon say he first conceived his history?', r: 'Among the ruins of the Capitol in Rome', w: ['In a London coffee house', 'On a ship to America', 'In a Swiss library'], why: 'The last sentence of the book.' }] };
H.T(ID, B, [function (R, lv) { return famSeq(R, lv, EV, 'events'); }, function (R, lv) { return famMatch(R, lv, PP, 'In the second half of Gibbon\'s history, who was #?', 'Who was #?'); }, famSpan, function (R, lv) { return famFirst(R, lv, EV, 'events'); }].concat(dateFams(ID)), 0.6);
