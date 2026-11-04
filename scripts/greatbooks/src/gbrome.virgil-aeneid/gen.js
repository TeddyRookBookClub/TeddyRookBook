/* gbrome.virgil-aeneid (gbe3): the story in order, who is who, which book, Virgil's key words, Rome's founding legend, dates. */
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
var ID = 'gbrome.virgil-aeneid';
var EV = ['Troy falls to the wooden horse', 'Aeneas carries Anchises out of the burning city', 'Anchises dies in Sicily', 'Juno’s storm drives the fleet to Carthage', 'Aeneas leaves Dido and Carthage', 'Funeral games in Sicily', 'Aeneas visits the underworld with the Sibyl', 'The Trojans reach the mouth of the Tiber', 'Aeneas visits Evander at Pallanteum', 'Turnus kills Pallas', 'Aeneas defeats Turnus'];
var WHO = [
  ['Aeneas', 'is the Trojan prince who leads his people from Troy to Italy', 'is the hero: a Trojan prince, son of Venus, called “pius” (faithful)'],
  ['Anchises', 'is the hero’s father, carried out of Troy on his son’s shoulders', 'is Aeneas’s father; he dies in Sicily and later shows his son the future in the underworld'],
  ['Ascanius', 'is the hero’s young son, also called Iulus', 'is Aeneas’s son; the Julian family of Caesar and Augustus claimed descent from him'],
  ['Dido', 'is the queen who founded Carthage and welcomes the Trojans', 'is the queen of Carthage, who falls in love with Aeneas'],
  ['Juno', 'is the goddess who hates the Trojans and sends a storm against them', 'is queen of the gods and the Trojans’ enemy'],
  ['Venus', 'is the goddess who is Aeneas’s mother', 'is the goddess of love and Aeneas’s mother'],
  ['Mercury', 'is the messenger god sent to remind Aeneas of his duty', 'is sent by Jupiter to tell Aeneas to leave Carthage'],
  ['The Sibyl of Cumae', 'is the priestess who guides Aeneas into the underworld', 'is Apollo’s prophetess at Cumae'],
  ['Turnus', 'is the Rutulian prince who leads the war against the Trojans in Italy', 'is the leader of the Italians against Aeneas'],
  ['Latinus', 'is the king of Latium who first offers the Trojans peace', 'is the old king of Latium'],
  ['Lavinia', 'is the king’s daughter whose promised marriage to Aeneas causes the war', 'is Latinus’s daughter'],
  ['Evander', 'is the Greek-born king living on the site of the future Rome', 'is the king of Pallanteum, who becomes Aeneas’s ally'],
  ['Pallas', 'is the young son of Evander, killed by Turnus', 'is Evander’s son, whom Aeneas promised to protect'],
  ['Vulcan', 'is the god who makes Aeneas a shield showing Rome’s future', 'is the smith god'],
  ['Laocoön', 'is the Trojan priest who warns against the wooden horse', 'is the priest who warned “I fear the Greeks, even bearing gifts”']
];
var BK = [[1, 'does Juno’s storm drive the Trojans to Carthage'], [2, 'does Aeneas tell the story of the fall of Troy'], [3, 'does Aeneas tell of seven years of wandering, ending with his father’s death'], [4, 'do Dido and Aeneas fall in love, until Mercury calls him away'], [5, 'are the funeral games held for Anchises'], [6, 'does Aeneas visit the underworld'], [8, 'does Vulcan make Aeneas’s shield'], [12, 'does Aeneas fight Turnus in single combat']];
var TERMS = [['pietas', 'faithful duty to the gods, to family and to country'], ['epic', 'a long poem about heroes and great deeds'], ['Arma virumque cano', '“Arms and the man I sing,” the poem’s first words'], ['the Sibyl', 'the prophetess of Cumae'], ['Latium', 'the region of Italy where the Latins lived, near the Tiber'], ['the Penates', 'the household gods Aeneas carries from Troy'], ['the golden bough', 'the branch Aeneas must pluck to enter the underworld'], ['Pallanteum', 'Evander’s town on the hills where Rome will stand'], ['lacrimae rerum', '“the tears of things,” a phrase from Book 1']];
function famHalves(R, lv) {
  var odd = R.pick([['the voyage', 'Odyssey', 'first'], ['the war in Italy', 'Iliad', 'second']]);
  if (lv === 1) return H.mc('The first half of the Aeneid is like Homer’s Odyssey. Why?', 'It tells of a long sea voyage home', ['It tells of a long war', 'It is about a hero who never leaves home', 'It is written in prose'], ['Books 1–6 are a voyage, like the Odyssey; Books 7–12 are a war, like the Iliad.']);
  return H.mc('The ' + odd[2] + ' half of the Aeneid, ' + odd[0] + ', is modeled most on which poem?', 'Homer’s ' + odd[1], ['Homer’s ' + (odd[1] === 'Iliad' ? 'Odyssey' : 'Iliad'), 'Virgil’s Georgics', 'Lucretius’s On the Nature of Things'], ['Books 1–6 follow the Odyssey; Books 7–12 follow the Iliad.']);
}
function famYears(R, lv) {
  var a = R.pick([[70, 'born'], [19, 'died']]), b = R.pick([[31, 'the battle of Actium'], [27, 'Octavian took the name Augustus']]);
  if (lv === 1) return H.num('Virgil was born in 70 BC and died in 19 BC. How many years apart are those two dates?', 51, ['Both are BC, so subtract: 70 − 19 = 51. (He died in September, a month before his 51st birthday.)']);
  return H.num('Virgil ' + a[1] + ' in ' + a[0] + ' BC. ' + b[1].charAt(0).toUpperCase() + b[1].slice(1) + ' ' + (b[1].indexOf('took') > 0 ? 'in' : 'was in') + ' ' + b[0] + ' BC. How many years apart were these?', Math.abs(a[0] - b[0]), ['Both dates are BC, so subtract: ' + Math.max(a[0], b[0]) + ' − ' + Math.min(a[0], b[0]) + ' = ' + Math.abs(a[0] - b[0]) + '.'], { hint: 'With two BC dates, subtract the smaller number from the larger.' });
}
var B = {
  facts: [
    ['Virgil died before he had finished revising the Aeneid.', true, 'He died in 19 BC; an ancient life says he wanted it burned.'],
    ['The Aeneid has twelve books.', true, 'Six of voyage, six of war.'],
    ['Aeneas is a Greek hero who destroys Troy.', false, 'He is a Trojan who escapes when the Greeks take Troy.'],
    ['Juno is the Trojans’ enemy in the poem.', true, 'She sends the storm in Book 1 and stirs up war in Book 7.'],
    ['Aeneas stays in Carthage and marries Dido.', false, 'Mercury reminds him of his duty, and he leaves.'],
    ['In the underworld, Anchises shows Aeneas the future heroes of Rome.', true, 'Book 6.'],
    ['Virgil invented the hero Aeneas.', false, 'Aeneas already appears in Homer’s Iliad.'],
    ['Augustus’s family claimed descent from Aeneas’s son Iulus.', true, 'The Julian family; Julius Caesar was one of them.'],
    ['The poem ends with a wedding and the founding of Rome.', false, 'It ends suddenly, with Aeneas killing Turnus.'],
    ['Dante made Virgil his guide in the Divine Comedy.', true, 'Through Hell and Purgatory.'],
    ['Virgil called Aeneas “pius,” faithful to gods, family and country.', true, 'Pietas is the poem’s key virtue.'],
    ['The Aeneid was written in Greek.', false, 'In Latin, in dactylic hexameter, the meter of Homer.']
  ],
  items: [
    { q: 'Why does Aeneas leave Dido?', r: 'The gods remind him that his duty is to found a new home in Italy', w: ['Dido sends him away', 'He is afraid of her army', 'He wants to return to Troy', 'He loses a bet'], why: 'Mercury brings Jupiter’s message in Book 4.' },
    { q: 'What does Aeneas carry out of burning Troy?', r: 'His father Anchises, on his shoulders', w: ['The wooden horse', 'A golden shield', 'The body of Hector'], why: 'Book 2: he also leads his son and carries the household gods.' },
    { q: 'What is the Aeneid mainly about?', r: 'A Trojan’s journey to Italy and the beginnings of the Roman people', w: ['The founding of Athens', 'The life of Julius Caesar', 'Odysseus’s return to Ithaca'], why: 'Aeneas’s people become the ancestors of the Romans.' },
    { q: 'What does Anchises say will be Rome’s special art, in Book 6?', r: 'To rule peoples, keep the peace, spare the conquered and humble the proud', w: ['To make the finest statues', 'To study the stars', 'To write the best poems'], why: 'He grants that others may surpass Rome in sculpture, speaking and astronomy.' },
    { q: 'Which earlier poems did Virgil take as his models?', r: 'Homer’s Iliad and Odyssey', w: ['The Bible', 'Lucretius’s poem on atoms', 'Plato’s Republic'], why: 'Arma for the Iliad, virum for the Odyssey.' },
    { q: 'What does Aeneas see that makes him kill Turnus instead of sparing him?', r: 'The belt Turnus took from young Pallas', w: ['Turnus reaching for a sword', 'An eagle in the sky', 'His mother Venus'], why: 'Grief and anger for Pallas decide it, in the last lines of the poem.' },
    { q: 'Who prevented the Aeneid from being burned after Virgil’s death, according to the ancient life of Virgil?', r: 'Augustus', w: ['Maecenas', 'Dido', 'Homer'], why: 'His friends Varius and Tucca edited it at Augustus’s order.' },
    { q: 'What does “Endure, and conquer!” show about Aeneas as a leader?', r: 'He hides his own worry to give his people courage', w: ['He wants to fight the gods', 'He has no feelings', 'He plans to give up the voyage'], why: 'Book 1: he speaks hopefully, though he is anxious inside.' }
  ]
};
H.T(ID, B, [seqF(EV, 'events of the Aeneid'), seqF(EV, 'events of the Aeneid'), whoF(WHO, 'In the Aeneid, who'), whoF(WHO, 'In the Aeneid, who'), bookF(BK, 'the Aeneid'), termF(TERMS, 'the Aeneid'), famHalves, famYears].concat(dateFams(ID).slice(0, 2)), 0.6);
