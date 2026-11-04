/* gbrome.plutarch-roman-lives (gbe3): the Roman lives, who did what, the fall of the Republic in order, sayings, dates. */
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
var ID = 'gbrome.plutarch-roman-lives';
var PAIRS = [['Theseus', 'Romulus'], ['Lycurgus', 'Numa'], ['Solon', 'Publicola'], ['Themistocles', 'Camillus'], ['Pericles', 'Fabius Maximus'], ['Alcibiades', 'Coriolanus'], ['Aristides', 'Cato the Elder'], ['Demosthenes', 'Cicero'], ['Alexander', 'Julius Caesar'], ['Demetrius', 'Antony'], ['Dion', 'Brutus'], ['Agis and Cleomenes', 'Tiberius and Gaius Gracchus'], ['Nicias', 'Crassus'], ['Agesilaus', 'Pompey'], ['Phocion', 'Cato the Younger']];
function famPair(R, lv) {
  var p = R.pick(PAIRS), others = PAIRS.filter(function (x) { return x !== p; });
  if (R.next() < 0.6) return H.mc('In the Parallel Lives, which Greek is paired with <b>' + p[1] + '</b>?', p[0], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[0]; }), [p[0] + ' and ' + p[1] + '.']);
  return H.mc('In the Parallel Lives, which Roman is paired with <b>' + p[0] + '</b>?', p[1], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[1]; }), [p[0] + ' and ' + p[1] + '.']);
}
var WHO = [
  ['Julius Caesar', 'told pirates he was worth a bigger ransom than they asked', 'asked them to raise it from twenty talents to fifty'],
  ['Julius Caesar', 'said he would rather be first in a poor village than second in Rome', 'said it crossing the Alps'],
  ['Julius Caesar', 'reported a victory in three words: I came, saw, and conquered', 'wrote it after the battle of Zela, 47 BC'],
  ['the soothsayer', 'answered, “Yes, they are come, but they are not past”', 'had warned Caesar about the ides of March'],
  ['Romulus', 'was, by legend, raised with his twin by a she-wolf and founded Rome', 'is paired with Theseus'],
  ['Coriolanus', 'led an enemy army against Rome and turned back when his mother pleaded', 'is paired with Alcibiades'],
  ['Volumnia', 'persuaded her son to spare Rome', 'was Coriolanus’s mother'],
  ['Cato the Elder', 'wore plain clothes and worked in the fields with his workers', 'fought luxury as censor'],
  ['Cicero', 'was the great orator who spoke for the Republic', 'is paired with Demosthenes'],
  ['Brutus', 'joined the plot against Caesar for the sake of the Republic', 'is paired with Dion'],
  ['Antony', 'allied with Cleopatra and lost the battle of Actium', 'is paired with Demetrius, as a warning'],
  ['Tiberius Gracchus', 'tried to give public land to poor citizens', 'was a tribune in 133 BC']
];
var EV = ['Rome founded, by tradition (753 BC)', 'Coriolanus marches on Rome (about 491 BC)', 'Tiberius Gracchus’s land law (133 BC)', 'Caesar crosses the Rubicon (49 BC)', 'Caesar: “I came, saw, and conquered” (47 BC)', 'Caesar is killed on the ides of March (44 BC)', 'Antony and Cleopatra are defeated at Actium (31 BC)'];
var TERMS = [['ides of March', 'March 15 on the Roman calendar, the day Caesar was killed'], ['veni, vidi, vici', '“I came, I saw, I conquered”'], ['the Rubicon', 'the stream Caesar crossed with his army in 49 BC, starting a civil war'], ['censor', 'the Roman official who kept the list of citizens and judged their morals, as Cato did'], ['tribune', 'an official elected to protect ordinary citizens, as the Gracchi were'], ['the Republic', 'Rome’s government by elected officials and the senate, before the emperors'], ['proscription', 'a published list of enemies who could be killed, as Cicero was in 43 BC']];
function famAge(R, lv) {
  var D = [['Julius Caesar', 100, 44], ['Cicero', 106, 43], ['Cato the Elder', 234, 149], ['Antony', 83, 30], ['Brutus', 85, 42], ['Pompey', 106, 48]];
  var d = R.pick(D);
  return H.num(d[0] + ' was born in ' + d[1] + ' BC and died in ' + d[2] + ' BC. How many years apart are those two dates?', d[1] - d[2], ['Both BC, so the years count down: ' + d[1] + ' − ' + d[2] + ' = ' + (d[1] - d[2]) + '.'], { hint: 'BC years count down toward AD 1.' });
}
var B = {
  facts: [
    ['Plutarch tells of Caesar’s death in several lives, from different sides.', true, 'Caesar, Brutus, Cicero and Antony.'],
    ['Shakespeare’s Julius Caesar takes the soothsayer’s warning from Plutarch.', true, 'Through North’s translation.'],
    ['Plutarch writes as a supporter of one Roman political party.', false, 'His judgments are moral: bravery, honesty, self-control.'],
    ['Caesar was captured by pirates as a young man.', true, 'He was held for thirty-eight days.'],
    ['Coriolanus captured Rome and became its king.', false, 'He turned back when his mother pleaded with him.'],
    ['Cato the Elder lived in luxury.', false, 'He was famous for plain living.'],
    ['“Veni, vidi, vici” has three Latin words that sound alike.', true, 'Plutarch admires its brevity.'],
    ['Plutarch says the story of Romulus contains a good deal of fable.', true, 'He gives several versions.'],
    ['Plutarch pairs Antony with Demetrius as a warning.', true, 'Both were spoiled by luxury and power.'],
    ['Plutarch wrote while Julius Caesar was still alive.', false, 'He wrote about AD 100, under the emperors.'],
    ['The Gracchi brothers tried to give land to poor citizens.', true, 'Both died in political violence.']
  ],
  items: [
    { q: 'What did Caesar mean by “I had rather be the first man among these fellows than the second man in Rome”?', r: 'His ambition was to be first, wherever he was', w: ['He wanted to retire to the mountains', 'He disliked Rome', 'He thought the villagers were wiser'], why: 'Plutarch uses it to show Caesar’s ambition.' },
    { q: 'Who persuaded Coriolanus to turn his army away from Rome?', r: 'His mother, Volumnia', w: ['Julius Caesar', 'The senate’s soldiers', 'A soothsayer'], why: 'Life of Coriolanus.' },
    { q: 'Why does Plutarch tell Caesar’s death in more than one life?', r: 'Each life shows the event through a different man’s character', w: ['He forgot he had already told it', 'He wanted to make the book longer', 'Each version is about a different Caesar'], why: 'Caesar, Brutus, Cicero, Antony.' },
    { q: 'What did the soothsayer warn Caesar about?', r: 'A great danger on the ides of March', w: ['A storm at sea', 'Pirates', 'A battle in Gaul'], why: '“They are come, but they are not past.”' },
    { q: 'Which period do most of Plutarch’s Roman lives describe?', r: 'The Roman Republic, especially its last century', w: ['The reign of Nero', 'The fall of the Western Empire', 'The founding of Constantinople'], why: 'From Romulus to Antony.' },
    { q: 'Which Shakespeare play is NOT based on Plutarch’s Roman lives?', r: 'Hamlet', w: ['Julius Caesar', 'Antony and Cleopatra', 'Coriolanus'], why: 'Hamlet is set in Denmark and comes from other sources.' }
  ]
};
H.T(ID, B, [famPair, famPair, whoF(WHO, 'In Plutarch, who'), whoF(WHO, 'In Plutarch, who'), seqF(EV, 'events from the Roman lives'), termF(TERMS, 'Plutarch’s Roman lives'), famAge].concat(dateFams(ID).slice(0, 2)), 0.6);
