/* Bacon: New Atlantis. Bank (the story, Salomon's House, its instruments, honesty and secrecy, the Royal Society) plus
   computed families: which team of Fellows does a job, a modern counterpart for a team, the arithmetic of the Fellows,
   and the order of the research cycle. Counting problems carry chk (verify-science-b.js). */
var ID = 'gb17.bacon-new-atlantis';
function nm(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = 'int'; if (unit === '%') p.a.pct = true; else if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.chk) p.chk = o.chk; return p; }
var B = {
  facts: [
    ['New Atlantis was published in 1627, the year after Bacon died.', true, 'By his chaplain William Rawley.'],
    ['Bacon wrote New Atlantis in Latin.', false, 'He wrote it in English.'],
    ['The island in New Atlantis is called Bensalem.', true, 'Its house of learning is Salomon’s House.'],
    ['The purpose of Salomon’s House is "the knowledge of causes, and secret motions of things".', true, '"… and the enlarging of the bounds of human empire."'],
    ['The story ends with the sailors’ happy return home.', false, 'It breaks off in the middle of the Father’s speech: "The rest was not perfected."'],
    ['Salomon’s House has twelve Merchants of Light who travel abroad in secret.', true, 'They bring back books and experiments.'],
    ['The Fellows of Salomon’s House forbid showing natural things "adorned or swelling".', true, 'They "hate all impostures, and lies".'],
    ['In the story, the Fellows publish every discovery to everyone.', false, 'They decide which to publish and keep some secret.'],
    ['The founders of the Royal Society saw themselves as building something like Salomon’s House.', true, 'Founded in 1660.'],
    ['Salomon’s House has towers about half a mile high for studying weather.', true, 'And caves six hundred fathoms deep.'],
    ['The islanders charge the sailors a large price for food and shelter.', false, 'They refuse any payment.'],
    ['Bacon imagines "means of seeing objects afar off" in the perspective-houses.', true, 'Written when the telescope was new.'],
    ['New Atlantis follows in the tradition of Thomas More’s Utopia.', true, 'An imagined ideal place, but organized around research.'],
    ['The islanders in the story are Christians, and Bacon presents their faith and science side by side.', true, 'Their conversion is told as a miracle.']
  ],
  items: [
    { q: 'What is Salomon’s House?', r: 'A great house of research on the island of Bensalem', w: ['The king’s palace', 'A church', 'A ship', 'A library of old books only'], why: 'It studies nature for the good of all.' },
    { q: 'How did New Atlantis come to be published?', r: 'Bacon’s chaplain William Rawley published it after Bacon’s death', w: ['Bacon published it at the start of his career', 'The Royal Society found it in 1660', 'It was printed in Bensalem', 'King James ordered it'], why: '1627, at the end of Sylva Sylvarum.' },
    { q: 'Where was the ship in the story sailing when it was blown off course?', r: 'From Peru toward China and Japan', w: ['From England to America', 'From Italy to Greece', 'Around Africa to India', 'From Spain to Peru'], why: 'Across the South Sea (the Pacific).' },
    { q: 'What do the Fellows of Salomon’s House forbid?', r: 'Showing any natural thing as more wonderful than it is', w: ['Traveling abroad', 'Doing experiments', 'Asking questions', 'Writing in English'], why: 'They "hate all impostures, and lies".' },
    { q: 'Which real society took Salomon’s House as a model?', r: 'The Royal Society of London', w: ['The Academy of Plato', 'The University of Padua', 'The Inquisition', 'The East India Company'], why: 'Its founders praised Bacon.' },
    { q: 'How does New Atlantis end?', r: 'It breaks off unfinished: "The rest was not perfected."', w: ['With a shipwreck', 'With the sailors’ return to Peru', 'With a battle', 'With the founding of the Royal Society'], why: 'Bacon left it unfinished.' },
    { q: 'What did Bacon think a research institution needed?', r: 'Many people, organized, supported and working over generations', w: ['One genius working alone', 'Only books', 'Secret magic', 'No money at all'], why: 'That is the picture the story gives.' }
  ]
};
var TEAM = [
  ['Merchants of Light', 12, 'sail abroad in secret and bring home books and experiments', 'scientists who visit labs abroad and bring back new journals'],
  ['Depredators', 3, 'collect the experiments already written in books', 'reviewers who search the published literature'],
  ['Mystery-men', 3, 'collect the experiments of the crafts and trades', 'researchers who learn from industry and craftspeople'],
  ['Pioneers or Miners', 3, 'try new experiments of their own choosing', 'exploratory research'],
  ['Compilers', 3, 'arrange the experiments into titles and tables', 'people who build databases and tables of data'],
  ['Dowry-men or Benefactors', 3, 'look for practical uses in the results', 'engineers and applied researchers'],
  ['Lamps', 3, 'plan new, deeper experiments after the whole house meets', 'scientists who design the next experiments'],
  ['Inoculators', 3, 'carry out the planned experiments and report them', 'the lab teams who run experiments'],
  ['Interpreters of Nature', 3, 'raise the discoveries into general axioms and laws', 'theorists who find the general law']
];
function famTeam(R, lv) {
  var t = R.pick(TEAM), modern = lv === 3 && R.coin();
  var others = R.sample(TEAM.filter(function (x) { return x !== t; }), lv === 1 ? 2 : 3).map(function (x) { return x[0]; });
  return H.mc(modern ? 'Which team of Salomon’s House is most like today’s ' + t[3] + '?' : 'In Salomon’s House, which team’s job is to ' + t[2] + '?', t[0], others, [t[0] + ': they ' + t[2] + '.']);
}
function famCount(R, lv) {
  var c = R.pick(['total', 'three', 'frac', 'double']);
  if (c === 'total' || lv === 1) return nm('Salomon’s House has 12 Merchants of Light and 3 Fellows in each of the other 8 teams. How many Fellows in all?', 36, 'Fellows', ['8 × 3 = 24.', '12 + 24 = 36.'], { chk: { f: 'fellows', m: 12, k: 8, e: 3 } });
  if (c === 'three') return nm('Leave out the 12 Merchants of Light. How many Fellows of Salomon’s House stay at home in the other 8 teams of 3?', 24, 'Fellows', ['8 × 3 = 24.'], { chk: { f: 'mul', a: 8, b: 3 } });
  if (c === 'frac') return nm('What percent of the 36 Fellows are Merchants of Light (12 of them)? Round to the nearest whole percent.', 33, '%', ['12 ÷ 36 = 1/3 ≈ 33%.'], { chk: { f: 'pctr', a: 12, b: 36 } });
  var m = R.pick([2, 3, 4]);
  return nm('Suppose Salomon’s House grew so that every team had ' + m + ' times as many Fellows. How many would there be in all? (Now: 12 Merchants of Light and 8 teams of 3.)', 36 * m, 'Fellows', ['Now 36 in all.', '36 × ' + m + ' = ' + 36 * m + '.'], { chk: { f: 'mul', a: 36, b: m } });
}
function famCycle(R, lv) {
  var k = lv === 1 ? 3 : 4, idx = R.sample([0, 4, 6, 7, 8], k).sort(), right = idx.map(function (i) { return TEAM[i][0]; }).join(' → ');
  var w = []; for (var t = 0; t < 10 && w.length < 3; t++) { var s = R.shuffle(idx).map(function (i) { return TEAM[i][0]; }).join(' → '); if (s !== right && w.indexOf(s) < 0) w.push(s); }
  return H.mc('In what order does Bacon list these teams of Salomon’s House?', right, w, ['Bacon’s order: ' + TEAM.map(function (x) { return x[0]; }).join(', ') + '.', 'Gather, arrange, use, plan, test, generalize.']);
}
H.T(ID, B, [famTeam, famCount, famCycle, function (R, lv) { return H.famBefore(R, lv, ID); }, function (R, lv) { return H.famWhoWrote(R, lv, ID); }], 0.5);
