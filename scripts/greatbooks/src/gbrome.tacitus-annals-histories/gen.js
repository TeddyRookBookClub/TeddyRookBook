/* gbrome.tacitus-annals-histories (gbe3): the emperors in order, which work covers what, what survives, his method and sources. */
function seqF(evs, what) { return function (R, lv) {
  var k = Math.min(evs.length, lv === 1 ? 3 : 4), idx = R.sample(evs.map(function (_, i) { return i; }), k).sort(function (a, b) { return a - b; });
  var ord = idx.map(function (i) { return evs[i]; }), right = ord.join(' → '), w = [];
  for (var t = 0; t < 20 && w.length < 3; t++) { var s = R.shuffle(ord.slice()).join(' → '); if (s !== right && w.indexOf(s) < 0) w.push(s); }
  return H.mc('Put these ' + what + ' in order, <b>first to last</b>.', right, w, ord.map(function (e, j) { return (j + 1) + '. ' + e; }), { hint: 'Find the one that must come first, then work forward.' });
}; }
function termF(T, ctx) { return function (R, lv) {
  var t = R.pick(T), others = T.filter(function (x) { return x !== t; }), k = lv === 1 ? 2 : 3;
  if (R.next() < 0.5) return H.mc('In ' + ctx + ', what does <b>' + t[0] + '</b> mean?', t[1], H.samp(R, others, k).map(function (x) { return x[1]; }), [t[0] + ': ' + t[1] + '.']);
  return H.mc('In ' + ctx + ', which word or name means <i>' + t[1] + '</i>?', t[0], H.samp(R, others, k).map(function (x) { return x[0]; }), [t[0] + ': ' + t[1] + '.']);
}; }
function whoF(P, pre) { return function (R, lv) {
  var p = R.pick(P), names = H.uniq(P.map(function (x) { return x[0]; }).filter(function (x) { return x !== p[0]; }));
  return H.mc(pre + ' ' + p[1] + '?', p[0], H.samp(R, names, lv === 1 ? 2 : 3), [p[0] + ' ' + (p[2] || p[1]) + '.']);
}; }
function bookF(B, work, unit) { unit = unit || 'book'; return function (R, lv) {
  var b = R.pick(B), all = H.uniq(B.map(function (x) { return x[0]; }));
  if (lv === 1) return H.mc('In which ' + unit + ' of ' + work + ' ' + b[1] + '?', unit.charAt(0).toUpperCase() + unit.slice(1) + ' ' + b[0], H.samp(R, all.filter(function (x) { return x !== b[0]; }), 2).map(function (x) { return unit.charAt(0).toUpperCase() + unit.slice(1) + ' ' + x; }), [unit.charAt(0).toUpperCase() + unit.slice(1) + ' ' + b[0] + ': ' + (b[2] || b[1]) + '.']);
  return H.num('In which ' + unit + ' of ' + work + ' ' + b[1] + '? Give the number.', b[0], [unit.charAt(0).toUpperCase() + unit.slice(1) + ' ' + b[0] + ': ' + (b[2] || b[1]) + '.']);
}; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbrome.tacitus-annals-histories';
var EMP = [['Augustus', 27, 14], ['Tiberius', 14, 37], ['Caligula', 37, 41], ['Claudius', 41, 54], ['Nero', 54, 68], ['Galba', 68, 69], ['Vespasian', 69, 79], ['Titus', 79, 81], ['Domitian', 81, 96], ['Nerva', 96, 98], ['Trajan', 98, 117]];
var EV = ['Augustus dies; Tiberius becomes emperor (AD 14)', 'Claudius begins the conquest of Britain (AD 43)', 'The great fire of Rome under Nero (AD 64)', 'The year of the four emperors (AD 69)', 'Tacitus is consul (AD 97)', 'Tacitus writes the Annals (about AD 115)'];
function famEmpOrder(R, lv) {
  var k = lv === 1 ? 3 : 4, idx = R.sample(EMP.map(function (_, i) { return i; }), k).sort(function (a, b) { return a - b; }), ord = idx.map(function (i) { return EMP[i][0]; });
  var right = ord.join(' → '), w = [];
  for (var t = 0; t < 20 && w.length < 3; t++) { var s = R.shuffle(ord.slice()).join(' → '); if (s !== right && w.indexOf(s) < 0) w.push(s); }
  return H.mc('Put these emperors in the order they ruled, <b>earliest first</b>.', right, w, idx.map(function (i) { var e = EMP[i]; return e[0] + ': ' + (e[0] === 'Augustus' ? '27 BC' : 'AD ' + e[1]) + '–AD ' + e[2] + '.'; }));
}
function famWhich(R, lv) {
  var E = [['Tiberius', 'the Annals'], ['Claudius', 'the Annals'], ['Nero', 'the Annals'], ['Galba', 'the Histories'], ['Otho', 'the Histories'], ['Vitellius', 'the Histories'], ['Vespasian', 'the Histories'], ['Domitian', 'the Histories']];
  var e = R.pick(E);
  return H.mc('Which of Tacitus’s works told the story of <b>' + e[0] + '</b>’s reign?', e[1], [e[1] === 'the Annals' ? 'the Histories' : 'the Annals', 'the Germania', 'the Agricola'].slice(0, lv === 1 ? 2 : 3), ['The Annals cover AD 14–68 (Tiberius to Nero); the Histories cover AD 69–96 (Galba to Domitian).']);
}
function famSurv(R, lv) {
  var S = [['Tiberius', true], ['Caligula', false], ['the second half of Claudius', true], ['the first years of Claudius', false], ['most of Nero', true], ['the year of the four emperors', true], ['Titus', false], ['Domitian', false]];
  var s = R.pick(S);
  return H.tf('Tacitus’s account of ' + s[0] + ' survives today.', s[1], s[1] ? 'It is in the surviving books.' : 'That part of his work is lost.');
}
function famSpan(R, lv) {
  var D = [['the Annals', 14, 68], ['the Histories', 69, 96], ['Tiberius’s reign', 14, 37], ['Nero’s reign', 54, 68], ['Claudius’s reign', 41, 54], ['Domitian’s reign', 81, 96]], d = R.pick(D);
  return H.num('How many years from AD ' + d[1] + ' to AD ' + d[2] + ' (' + d[0] + ')?', d[2] - d[1], [d[2] + ' − ' + d[1] + ' = ' + (d[2] - d[1]) + ' years.']);
}
var TERMS = [['sine ira et studio', '“without anger and without partiality,” Tacitus’s promise'], ['annals', 'a history told year by year'], ['the year of the four emperors', 'AD 69: Galba, Otho, Vitellius and Vespasian'], ['Sejanus', 'Tiberius’s ambitious minister, who rose and fell'], ['the senate', 'Rome’s council of former officials, to which Tacitus belonged'], ['consul', 'the highest yearly office, which Tacitus held in AD 97'], ['Boudica', 'the British queen who led a revolt in AD 60–61'], ['Suetonius', 'a Roman biographer of the emperors, often compared with Tacitus']];
var B = {
  facts: [
    ['Tacitus promised to write “without anger and without partiality.”', true, 'Sine ira et studio, Annals I.1.'],
    ['Tacitus was a Roman senator and consul.', true, 'Consul in AD 97.'],
    ['All of Tacitus’s Annals survive.', false, 'Large parts are lost, including all of Caligula’s reign.'],
    ['The Histories begin with the civil war of AD 69.', true, 'The year of the four emperors.'],
    ['Tacitus wrote the Annals before the Histories.', false, 'The Histories came first; the Annals went back to earlier times.'],
    ['Tacitus thought histories written under the emperors were often distorted by fear or hatred.', true, 'He says so in the first chapter of the Annals.'],
    ['Tacitus describes the great fire of Rome in AD 64.', true, 'Annals Book XV.'],
    ['Tacitus wrote in Greek.', false, 'In Latin, in a famously compressed style.'],
    ['Tacitus married the daughter of the general Agricola.', true, 'He wrote a short life of Agricola.'],
    ['Historians today accept every judgment in Tacitus without question.', false, 'They admire him but check him against other evidence.'],
    ['Tacitus records that Nero blamed the Christians for the fire.', true, 'Annals XV.44.']
  ],
  items: [
    { q: 'Why did Tacitus think a new history of the emperors was needed?', r: 'Earlier accounts were bent by fear while the emperors lived and by hatred after they died', w: ['No one had ever written about Rome', 'He wanted to praise every emperor', 'The emperor ordered him to'], why: 'Annals I.1.' },
    { q: 'What does Tacitus say about Galba?', r: 'Everyone would have thought him fit to rule, had he never ruled', w: ['He was the greatest emperor', 'He ruled for forty years', 'He founded Rome'], why: 'Histories I.49: capax imperii nisi imperasset.' },
    { q: 'Which period do the Annals cover?', r: 'From the death of Augustus (AD 14) to the death of Nero (AD 68)', w: ['From the founding of Rome to Augustus', 'From AD 69 to AD 96', 'The reign of Trajan'], why: 'Tiberius, Caligula, Claudius and Nero.' },
    { q: 'Why must readers be careful with Tacitus’s judgments?', r: 'He writes from a senator’s point of view and sometimes lets rumors color the story', w: ['He invented all his facts', 'He wrote centuries later', 'He could not read Latin'], why: 'Historians compare him with Suetonius, inscriptions and coins.' },
    { q: 'What happened to free speech under Domitian, according to the Agricola?', r: 'People lost even the memory of it', w: ['It grew stronger', 'It was protected by law', 'Tacitus does not mention it'], why: 'Agricola, chapter 2.' },
    { q: 'How do Tacitus’s Annals reach us?', r: 'Mostly through two medieval manuscripts', w: ['Carved on a stone monument', 'In Tacitus’s own handwriting', 'Through a modern rewrite'], why: 'One for Books 1–6, another for Books 11–16 and the Histories.' }
  ]
};
H.T(ID, B, [famEmpOrder, famEmpOrder, famWhich, famSurv, famSpan, seqF(EV, 'events'), termF(TERMS, 'Tacitus')].concat(dateFams(ID).slice(0, 2)), 0.6);
