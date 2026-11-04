/* gb18.gibbon-decline-and-fall-1: practice generator (gbw3). */
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
var ID = 'gb18.gibbon-decline-and-fall-1';
var EV = [['the five good emperors (from Nerva)', 96, 'AD 96'], ['Commodus becomes emperor', 180, 'AD 180'], ['Diocletian\'s reforms', 284, 'AD 284'], ['Constantinople founded', 330, 'AD 330'], ['the Battle of Adrianople', 378, 'AD 378'], ['Alaric sacks Rome', 410, 'AD 410'], ['Attila checked in Gaul', 451, 'AD 451'], ['the last western emperor deposed', 476, 'AD 476']];
var EMP = [['Nerva, Trajan, Hadrian, Antoninus Pius and Marcus Aurelius', 'the \"good emperors\" of Gibbon\'s happiest age'], ['Commodus', 'Marcus Aurelius\' son, whose reign begins the decline'], ['Diocletian', 'the emperor who divided rule and reorganized the empire'], ['Constantine', 'the first Christian emperor, founder of Constantinople'], ['Julian', 'the emperor who tried to restore the old religion'], ['Romulus Augustulus', 'the boy who was the last emperor in the west'], ['Odoacer', 'the general who deposed the last western emperor'], ['Alaric', 'the Gothic king who sacked Rome in 410']];
function famSpan(R, lv) {
  var a = R.pick([[96, 180, 'the age of the good emperors (Nerva to Commodus)'], [330, 1453, 'Constantinople as a Roman capital'], [476, 1453, 'the eastern empire after the fall in the west'], [1776, 1788, 'the publication of the Decline and Fall, first volume to last'], [235, 284, 'the crisis of the third century'], [410, 476, 'the time from Alaric\'s sack of Rome to the last western emperor']]);
  return H.num('About how many years passed from ' + a[0] + ' to ' + a[1] + ' (' + a[2] + ')?', a[1] - a[0], ['$' + a[1] + ' - ' + a[0] + ' = ' + (a[1] - a[0]) + '$ years.']);
}
var B = { facts: [
  ['Gibbon called the age from Domitian\'s death to Commodus the most happy and prosperous.', true, 'ch. III.'],
  ['The first volume of the Decline and Fall appeared in 1776.', true, 'The same year as The Wealth of Nations.'],
  ['Gibbon said the decline of Rome was the natural effect of immoderate greatness.', true, 'General Observations.'],
  ['Gibbon thought Rome fell for a single cause.', false, 'He pointed to many causes.'],
  ['Constantine founded Constantinople.', true, 'Dedicated in AD 330.'],
  ['The whole Roman Empire ended in AD 476.', false, 'The eastern empire lasted until 1453.'],
  ['Gibbon\'s chapters 15 and 16 on Christianity caused controversy.', true, 'Many readers were angered.'],
  ['Gibbon got the idea for his history among the ruins of the Capitol in Rome.', true, 'In 1764.'],
  ['Alaric\'s Goths sacked Rome in AD 410.', true, 'ch. XXXI.']],
 items: [
  { q: 'Whom does Gibbon credit with the happiest age of the human race?', r: 'Nerva, Trajan, Hadrian and the Antonines', w: ['Nero and Caligula', 'Romulus and Remus', 'Charlemagne and his sons'], why: 'ch. III.' },
  { q: 'Who deposed Romulus Augustulus in 476?', r: 'Odoacer', w: ['Attila', 'Alaric', 'Constantine'], why: 'ch. XXXVI.' },
  { q: 'Instead of asking why Rome was destroyed, what does Gibbon say we should be surprised at?', r: 'That it lasted so long', w: ['That it was ever founded', 'That it had emperors', 'That it spoke Latin'], why: 'General Observations.' },
  { q: 'What do many modern historians prefer to call the change in late antiquity?', r: 'A transformation of the Roman world', w: ['A sudden collapse in one day', 'The Renaissance', 'The Enlightenment'], why: 'Though some stress real decline.' },
  { q: 'Which Christian work on this ladder answered pagans after the sack of 410?', r: 'Augustine\'s City of God', w: ['Boswell\'s Life of Johnson', 'The Spirit of Laws', 'Candide'], why: 'Rome and Late Antiquity era.' }] };
H.T(ID, B, [function (R, lv) { return famSeq(R, lv, EV, 'events'); }, function (R, lv) { return famMatch(R, lv, EMP, 'In Gibbon\'s history, who was #?', 'In Gibbon\'s history, who is described as #?'); }, famSpan, function (R, lv) { return famFirst(R, lv, EV, 'events'); }].concat(dateFams(ID)), 0.6);
