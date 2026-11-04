/* gbrome.plutarch-greek-lives (gbe3): Plutarch's pairs, who did what, his method, timelines, dates. */
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
var ID = 'gbrome.plutarch-greek-lives';
var PAIRS = [['Theseus', 'Romulus'], ['Lycurgus', 'Numa'], ['Solon', 'Publicola'], ['Themistocles', 'Camillus'], ['Pericles', 'Fabius Maximus'], ['Alcibiades', 'Coriolanus'], ['Aristides', 'Cato the Elder'], ['Demosthenes', 'Cicero'], ['Alexander', 'Julius Caesar'], ['Demetrius', 'Antony'], ['Dion', 'Brutus'], ['Timoleon', 'Aemilius Paulus'], ['Pelopidas', 'Marcellus']];
function famPair(R, lv) {
  var p = R.pick(PAIRS), others = PAIRS.filter(function (x) { return x !== p; });
  if (R.next() < 0.5) return H.mc('Plutarch paired the Greek <b>' + p[0] + '</b> with which Roman?', p[1], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[1]; }), [p[0] + ' and ' + p[1] + ' are a pair in the Parallel Lives.']);
  return H.mc('Plutarch paired the Roman <b>' + p[1] + '</b> with which Greek?', p[0], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[0]; }), [p[0] + ' and ' + p[1] + ' are a pair in the Parallel Lives.']);
}
var WHO = [
  ['Alexander', 'tamed the horse Bucephalus by turning it toward the sun', 'saw the horse was afraid of its own shadow'],
  ['Diogenes', 'asked a king only to stand out of his sunlight', 'the philosopher, to Alexander'],
  ['Solon', 'would call no one happy until his life had ended well', 'told King Croesus so'],
  ['Aristides', 'wrote his own name on a voting shard for a farmer who was tired of hearing him called “the Just”', 'was exiled by the vote, and later recalled'],
  ['Demosthenes', 'practiced speaking with pebbles in his mouth', 'trained his weak voice and became Athens’s greatest orator'],
  ['Themistocles', 'built the Athenian fleet that beat the Persians at Salamis', 'later was exiled by Athens'],
  ['Pericles', 'led Athens in its golden age and had the Parthenon built', 'is paired with Fabius Maximus'],
  ['Lycurgus', 'gave Sparta its strict laws and training', 'is the lawgiver about whom, Plutarch admits, almost nothing is certain'],
  ['Croesus', 'was the rich king who asked who the happiest man was', 'king of Lydia'],
  ['Theseus', 'is the legendary hero who united the villages of Attica into Athens', 'is paired with Romulus']
];
var EV = ['Solon’s laws for Athens (594 BC)', 'The battle of Salamis (480 BC)', 'The Parthenon is begun under Pericles (447 BC)', 'Alcibiades goes over to Sparta (415 BC)', 'Demosthenes speaks against Philip of Macedon (351 BC)', 'Alexander crosses into Asia (334 BC)', 'Plutarch writes the Lives (about AD 100)'];
var TERMS = [['Parallel Lives', 'Plutarch’s paired lives of a Greek and a Roman'], ['comparison', 'the short essay after a pair, weighing the two men'], ['Moralia', 'Plutarch’s collected essays on ethics, religion and education'], ['Chaeronea', 'Plutarch’s home town in central Greece'], ['Delphi', 'the shrine of Apollo where Plutarch served as a priest'], ['ostracism', 'the Athenian vote to send a citizen into exile for ten years, written on pottery shards'], ['character', 'what a person is like inside, which Plutarch cared about most']];
function famGap(R, lv) {
  var D = [['Pericles', 429, 'Fabius Maximus', 203], ['Demosthenes', 322, 'Cicero', 43], ['Alexander', 323, 'Julius Caesar', 44], ['Aristides', 468, 'Cato the Elder', 149], ['Dion', 354, 'Brutus', 42]];
  var d = R.pick(D);
  return H.num(d[0] + ' died in ' + d[1] + ' BC and ' + d[2] + ' died in ' + d[3] + ' BC. How many years apart were their deaths?', d[1] - d[3], ['Both BC: ' + d[1] + ' − ' + d[3] + ' = ' + (d[1] - d[3]) + ' years.', 'Plutarch paired them for character, not for their dates.'], { hint: 'With two BC dates, subtract the smaller from the larger.' });
}
var B = {
  facts: [
    ['Plutarch paired a famous Greek with a famous Roman.', true, 'That is why the Lives are called parallel.'],
    ['Plutarch said he was writing histories, not lives.', false, 'The opposite: “my design is not to write histories, but lives.”'],
    ['Plutarch thought a small saying or joke can show character better than a battle.', true, 'Life of Alexander, chapter 1.'],
    ['Plutarch was a Roman senator who lived in Rome.', false, 'He was a Greek of Chaeronea, though a Roman citizen.'],
    ['Plutarch served as a priest at Delphi.', true, 'At the temple of Apollo, for many years.'],
    ['Shakespeare used Plutarch for Julius Caesar and Antony and Cleopatra.', true, 'Through North’s English translation of 1579.'],
    ['Plutarch says almost nothing about Lycurgus is certain.', true, 'He begins the life by saying so.'],
    ['Plutarch only wrote about good people.', false, 'Some lives, like Demetrius and Antony, are warnings.'],
    ['After most pairs Plutarch adds a comparison of the two men.', true, 'He weighs their virtues and faults.'],
    ['Alexander tamed Bucephalus by whipping him.', false, 'He turned him toward the sun and calmed him gently.'],
    ['All of Plutarch’s pairs survive.', false, 'One pair, Epaminondas and Scipio, is lost.']
  ],
  items: [
    { q: 'Why did Plutarch pair Greeks with Romans?', r: 'To compare their characters and draw lessons from both', w: ['Because they were related', 'Because they lived at the same time', 'To prove the Greeks were always better'], why: 'The comparison is the point; some pairs lived centuries apart.' },
    { q: 'What does Plutarch compare himself to in the Life of Alexander?', r: 'A portrait painter who studies the face', w: ['A sculptor of statues', 'A general planning a battle', 'A judge in court'], why: 'He attends to “the marks and indications of the souls of men.”' },
    { q: 'What, says Plutarch in the Life of Pericles, do good actions make us want to do?', r: 'Imitate the people who did them', w: ['Become sculptors', 'Forget about them', 'Write histories'], why: 'Virtue creates “desire to imitate the doers.”' },
    { q: 'Why did Plutarch keep the story of Solon and Croesus, though some doubted it?', r: 'It fits Solon’s character and wisdom', w: ['He invented it himself', 'Croesus wrote it down', 'It was in Homer'], why: 'He discusses the chronology and keeps the story anyway.' },
    { q: 'What did Alexander say after meeting Diogenes?', r: 'If he were not Alexander, he would choose to be Diogenes', w: ['That Diogenes should be punished', 'That he wanted to conquer India', 'That philosophers were useless'], why: 'Life of Alexander, chapter 14.' },
    { q: 'Where did Plutarch live most of his life?', r: 'Chaeronea, a small town in Greece', w: ['Rome', 'Alexandria', 'Athens'], why: 'He stayed there, he said, so that it would not become smaller by one.' }
  ]
};
H.T(ID, B, [famPair, famPair, whoF(WHO, 'In Plutarch, who'), whoF(WHO, 'In Plutarch, who'), seqF(EV, 'events from the Greek lives'), termF(TERMS, 'Plutarch'), famGap].concat(dateFams(ID).slice(0, 2)), 0.6);
