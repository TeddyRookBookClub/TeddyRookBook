/* Hegel, The Philosophy of Right (gbw4). Also defines H.k19, the families shared by the wave-2 gb19 rungs
   (this rung comes first among them in rungs.yaml, so the build runs this file before theirs; they call H.k19 lazily,
   when a problem is made). Families:
     H.k19.seq(list, what, it, R, lv)   order, "what comes right after", "what number is"
     H.k19.pairs(pairs, qa, qb, R, lv)  matching both ways
     H.k19.who(list, R, lv)             who says or argues this (from our own summaries): list = [[summary, who], ...]
     H.k19.dates(id)                    the ladder-wide families for this rung (when, before/after, volume, who wrote) */
H.k19 = {
  seq: function (seq, what, it, R, lv) {
    var r = R.next();
    if (r < 0.4) {
      var k = Math.min(seq.length, lv === 1 ? 3 : 4), idx = R.sample(seq.map(function (_, i) { return i; }), k).sort(function (a, b) { return a - b; });
      var right = idx.map(function (i) { return seq[i]; }).join(' → '), w = [];
      for (var t = 0; t < 12 && w.length < 3; t++) { var sh = R.shuffle(idx.slice()).map(function (i) { return seq[i]; }).join(' → '); if (sh !== right && w.indexOf(sh) < 0) w.push(sh); }
      return H.mc('Which list puts these in the right order (' + what + ')?', right, w, ['In order: ' + right + '.'], { hint: 'Find the first one, then work forward.' });
    }
    if (r < 0.7 || lv === 1) {
      var i = R.int(0, seq.length - 2), wr = R.sample(seq.filter(function (_, j) { return j !== i + 1 && j !== i; }), Math.min(seq.length - 2, lv === 1 ? 2 : 3));
      return H.mc('In ' + what + ', which ' + it + ' comes right after <b>' + seq[i] + '</b>?', seq[i + 1], wr, [seq[i] + ' is followed by ' + seq[i + 1] + '.']);
    }
    var j = R.int(0, seq.length - 1);
    return H.num('Counting ' + what + ', what number is <b>' + seq[j] + '</b>? (The first is 1.)', j + 1, ['The order is: ' + seq.map(function (x, n) { return (n + 1) + '. ' + x; }).join('; ') + '.'], { hint: 'Count from the start.' });
  },
  pairs: function (pairs, qa, qb, R, lv) {
    var p = R.pick(pairs), k = lv === 1 ? 2 : 3;
    if (qb && R.coin()) {
      var wa = H.uniq(pairs.filter(function (x) { return x[1] !== p[1] && x[0] !== p[0]; }).map(function (x) { return x[0]; }));
      return H.mc(qb(p[1]), p[0], R.sample(wa, Math.min(k, wa.length)), [p[0] + ': ' + p[1] + '.']);
    }
    var wb = H.uniq(pairs.filter(function (x) { return x[1] !== p[1]; }).map(function (x) { return x[1]; }));
    return H.mc(qa(p[0]), p[1], R.sample(wb, Math.min(k, wb.length)), [p[0] + ': ' + p[1] + '.']);
  },
  who: function (list, R, lv) {
    var p = R.pick(list), names = H.uniq(list.map(function (x) { return x[1]; })).filter(function (x) { return x !== p[1]; });
    return H.mc('Who says or argues this? (Our summary.) <i>' + p[0] + '</i>', p[1], R.sample(names, Math.min(names.length, lv === 1 ? 2 : 3)), [p[1] + '. ' + (p[2] || '')]);
  },
  dates: function (id) {
    return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); },
      function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }];
  }
};

var ID = 'gb19.hegel-philosophy-of-right';
var PLAN = ['Abstract right', 'Morality', 'The family', 'Civil society', 'The state'];
var PARTS = [['property and contract', 'Abstract right'], ['crime and punishment', 'Abstract right'], ['intention and conscience', 'Morality'], ['love and marriage', 'The family'], ['work, trade and the market', 'Civil society'], ['courts, police and trade associations', 'Civil society'], ['the constitution and the monarch', 'The state']];
var WHO = [
  ['Be a person and respect others as persons.', 'Hegel', 'The command of abstract right, Philosophy of Right, section 36.'],
  ['Philosophy understands its own age only when that age is growing old: the owl of Minerva flies at dusk.', 'Hegel', 'The Preface.'],
  ['Each pursuing his own gain in the market can, without meaning to, serve the good of all.', 'Adam Smith', 'Hegel read Smith and built on this idea in his account of civil society.'],
  ['The state, if it rests on a contract, can be dissolved when the parties wish.', 'the social-contract thinkers Hegel criticizes', 'Hegel argued the state is not a mere contract between individuals.'],
  ['The real is not yet rational; philosophy must help change the world.', 'the "Young Hegelians" such as Marx', 'Hegel\'s left-wing students turned his ideas toward criticism and change.']
];
var B = {
  facts: [
    ['Hegel published the Philosophy of Right in 1820 (dated 1821).', true, 'In Berlin, where he taught.'],
    ['For Hegel, "right" means much more than law: it means freedom made real in the world.', true, 'Property, morality, family, society and state are all forms of right.'],
    ['Hegel calls the family, civil society and the state together "ethical life."', true, '<i>Sittlichkeit</i>: freedom lived in shared institutions.'],
    ['Hegel thought the state is only a contract among individuals.', false, 'He rejected the contract picture of the state.'],
    ['Hegel learned from the economists, including Adam Smith, when he wrote about civil society.', true, 'He calls economics a science that finds laws in a mass of chance events.'],
    ['Hegel saw no problems at all in the market society of his time.', false, 'He worried about poverty and a growing "rabble."'],
    ['"The owl of Minerva" stands for philosophy, which understands an age only as it ends.', true, 'Minerva\'s owl flies at dusk.'],
    ['Hegel wrote the Philosophy of Right as a novel.', false, 'It is a treatise in numbered sections, with his own remarks and additions from students\' notes.'],
    ['S. W. Dyde\'s English translation appeared in 1896.', true, 'London, George Bell and Sons.']
  ],
  items: [
    { q: 'In Hegel\'s plan, which part comes first?', r: 'Abstract right (persons and property)', w: ['The state', 'Civil society', 'Morality'], why: 'He begins with the simplest form of freedom and builds up.' },
    { q: 'What holds the family together, for Hegel?', r: 'Love and trust', w: ['A contract', 'Fear of punishment', 'Self-interest in the market'], why: 'Marriage begins in consent, but the family is a unity of feeling.' },
    { q: 'What is "civil society" in Hegel\'s book?', r: 'The world of work, trade and courts where each pursues his own interest', w: ['Polite manners at dinner', 'The army', 'The church'], why: 'It sits between the family and the state.' },
    { q: 'Hegel\'s Preface says, "What is rational is real; and what is real is rational." Why have readers argued about it?', r: 'Some read it as praise of things as they are; others as a claim that reason works itself out in history', w: ['Because Hegel took it back the next year', 'Because it is a mistranslation of a poem', 'Because no one could find it in the book'], why: 'Hegel later explained that by "real" he meant what truly fulfills its nature, not whatever happens to exist.' },
    { q: 'What did Hegel think punishment does?', r: 'It restores right by canceling the wrong', w: ['It only frightens other people', 'It pays the victim back in money', 'It is never justified'], why: 'He treats punishment as the criminal\'s own act turned back on him.' },
    { q: 'Which later thinkers took Hegel\'s ideas in very different directions?', r: 'Both conservatives and radicals, such as the "Right" and "Left" Hegelians', w: ['Only Plato\'s students', 'Nobody; the book was ignored', 'Only scientists'], why: 'Marx, a Left Hegelian, is later on this ladder.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.seq(PLAN, 'the parts of the Philosophy of Right, from first to last', 'part', R, lv); },
  function (R, lv) { return H.k19.seq(PLAN, 'the parts of the Philosophy of Right, from first to last', 'part', R, lv); },
  function (R, lv) { return H.k19.pairs(PARTS, function (a) { return 'In which part of Hegel\'s plan does he discuss <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(H.k19.dates(ID)), 0.6);
