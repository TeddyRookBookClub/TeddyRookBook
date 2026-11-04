/* Aquinas, Summa Theologica, First Part of the Second Part (gbe4). Families: the eight candidates for happiness,
   the kinds of law from examples, the four marks of a law (which one a bad rule lacks), virtues and the mean,
   the passions, the chain of ends, dates. */
/* shared helpers for the gbmiddle rungs (gbe4); each gen.js carries its own copy, since each is wrapped on its own. */
var LETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
/* a sequence family: seq = [label, ...] in order; what = "the circles of Hell, from the top"; it = noun for one item */
function famSeq(seq, what, it) {
  return function (R, lv) {
    var r = R.next();
    if (r < 0.4) {
      var k = lv === 1 ? 3 : 4, idx = R.sample(seq.map(function (_, i) { return i; }), k).sort(function (a, b) { return a - b; });
      var right = idx.map(function (i) { return seq[i]; }).join(' → '), w = [];
      for (var t = 0; t < 8 && w.length < 3; t++) { var sh = R.shuffle(idx.slice()).map(function (i) { return seq[i]; }).join(' → '); if (sh !== right && w.indexOf(sh) < 0) w.push(sh); }
      return H.mc('Which list puts these in the right order (' + what + ')?', right, w, ['In order: ' + right + '.'], { hint: 'Find the first one, then work forward.' });
    }
    if (r < 0.7 || lv === 1) {
      var i = R.int(0, seq.length - 2), wr = R.sample(seq.filter(function (_, j) { return j !== i + 1 && j !== i; }), lv === 1 ? 2 : 3);
      return H.mc('In ' + what + ', which ' + it + ' comes right after <b>' + seq[i] + '</b>?', seq[i + 1], wr, [seq[i] + ' is followed by ' + seq[i + 1] + '.']);
    }
    var j = R.int(0, seq.length - 1);
    return H.num('Counting ' + what + ', what number is <b>' + seq[j] + '</b>? (The first is 1.)', j + 1, ['The order is: ' + seq.map(function (x, n) { return (n + 1) + '. ' + x; }).join('; ') + '.'], { hint: 'Count from the start.' });
  };
}
/* a matching family: pairs = [[a, b], ...]; qa(a) asks for b; qb(b) asks for a (optional) */
function famPairs(pairs, qa, qb) {
  return function (R, lv) {
    var p = R.pick(pairs), k = lv === 1 ? 2 : 3;
    if (qb && R.coin()) {
      var wa = H.uniq(pairs.filter(function (x) { return x[1] !== p[1] && x[0] !== p[0]; }).map(function (x) { return x[0]; }));
      return H.mc(qb(p[1]), p[0], R.sample(wa, Math.min(k, wa.length)), [p[0] + ': ' + p[1] + '.']);
    }
    var wb = H.uniq(pairs.filter(function (x) { return x[1] !== p[1]; }).map(function (x) { return x[1]; }));
    return H.mc(qa(p[0]), p[1], R.sample(wb, Math.min(k, wb.length)), [p[0] + ': ' + p[1] + '.']);
  };
}
var ID = 'gbmiddle.aquinas-on-happiness-and-law';
var GOODS = [['wealth', 'it is wanted for the sake of something else'], ['honor', 'it is given because of an excellence already there'], ['fame', 'it lives in other people\'s opinions, which can be wrong'], ['power', 'it can be used well or badly'], ['health and beauty', 'they serve the soul and can be lost'], ['pleasure', 'it comes along with a good; it is not the good itself'], ['knowledge and other goods of the soul', 'the soul itself seeks a good beyond itself'], ['any created good', 'the will reaches for goodness without limit']];
function famGood(R, lv) {
  var g = R.pick(GOODS);
  if (R.coin()) return H.mc('Aquinas asks whether happiness consists in <b>' + g[0] + '</b>. What is his reason for saying no?', 'Because ' + g[1], R.sample(GOODS.filter(function (x) { return x !== g; }), lv === 1 ? 2 : 3).map(function (x) { return 'Because ' + x[1]; }), ['Question 2: ' + g[0] + ': ' + g[1] + '.']);
  var cand = R.sample(GOODS, lv === 1 ? 2 : 3).map(function (x) { return x[0].charAt(0).toUpperCase() + x[0].slice(1); });
  return H.mc('Where does Aquinas say perfect happiness is found?', 'In God alone, in seeing God as he is', cand, ['Question 2, Article 8, and Question 3: God alone; the other goods are ruled out one by one.']);
}
var LAWS = [
  ['God\'s wise plan for governing the whole universe', 'eternal law'],
  ['"Good is to be done and pursued, and evil avoided"', 'natural law'],
  ['Care for and teach your children', 'natural law'],
  ['Live in society with others and do not harm them', 'natural law'],
  ['A town rule about which side of the road to drive on', 'human law'],
  ['The particular fine set for a crime in one city', 'human law'],
  ['The Ten Commandments given to Moses', 'divine law'],
  ['The Gospel\'s command to love God and neighbor', 'divine law']];
function famLaw(R, lv) {
  var e = R.pick(LAWS), all = ['eternal law', 'natural law', 'human law', 'divine law'];
  return H.mc('Which of Aquinas\'s four kinds of law is this? <b>' + e[0] + '</b>', e[1], R.sample(all.filter(function (x) { return x !== e[1]; }), lv === 1 ? 2 : 3), ['It is ' + e[1] + ' (Question 91).'], { hint: 'Eternal: God\'s plan. Natural: known by reason. Human: made by a community. Divine: given in Scripture.' });
}
var MARKS = [
  ['A king makes a rule but keeps it secret, so nobody knows it.', 'It is not made public (promulgated)'],
  ['A mayor makes a rule only to make himself rich.', 'It is not for the common good'],
  ['A rule makes no sense and was made on a whim.', 'It is not an ordinance of reason'],
  ['A passer-by announces rules for the whole town.', 'It is not made by the one who has care of the community']];
function famMark(R, lv) {
  var m = R.pick(MARKS);
  return H.mc('Aquinas defines law as an ordinance of reason, for the common good, made by the one who has care of the community, and made public. ' + m[0] + ' Which mark is missing?', m[1], R.sample(MARKS.filter(function (x) { return x !== m; }).map(function (x) { return x[1]; }), lv === 1 ? 2 : 3), ['Question 90: ' + m[1].toLowerCase() + '.']);
}
var MEANS = [['courage', 'cowardice', 'recklessness'], ['generosity', 'stinginess', 'wastefulness'], ['temperance', 'insensibility to all pleasure', 'overindulgence'], ['gentleness', 'never being angry even at injustice', 'being quick-tempered'], ['truthfulness about oneself', 'false modesty', 'boasting']];
function famMean(R, lv) {
  var m = R.pick(MEANS);
  if (R.coin()) return H.mc('Following Aristotle, Aquinas puts a moral virtue in a mean between two extremes. Which virtue lies between <b>' + m[1] + '</b> and <b>' + m[2] + '</b>?', m[0], R.sample(MEANS.filter(function (x) { return x !== m; }).map(function (x) { return x[0]; }), lv === 1 ? 2 : 3), [m[0] + ' is the mean between ' + m[1] + ' and ' + m[2] + '.']);
  return H.mc('<b>' + m[0].charAt(0).toUpperCase() + m[0].slice(1) + '</b> is a mean. Which pair are its two extremes?', m[1] + ' and ' + m[2], R.sample(MEANS.filter(function (x) { return x !== m; }), lv === 1 ? 2 : 3).map(function (x) { return x[1] + ' and ' + x[2]; }), ['The extremes are ' + m[1] + ' (too little) and ' + m[2] + ' (too much).']);
}
var VK = [['wisdom', 'intellectual'], ['understanding', 'intellectual'], ['art (skill in making)', 'intellectual'], ['justice', 'moral'], ['courage', 'moral'], ['temperance', 'moral'], ['faith', 'theological'], ['hope', 'theological'], ['charity', 'theological']];
function famVK(R, lv) {
  var v = R.pick(VK), all = ['intellectual', 'moral', 'theological'];
  return H.mc('Aquinas sorts virtues into intellectual, moral and theological. Which kind is <b>' + v[0] + '</b>?', v[1], all.filter(function (x) { return x !== v[1]; }), ['It is ' + v[1] + '.' + (v[0] === 'justice' || v[0] === 'courage' || v[0] === 'temperance' ? ' It is also one of the four cardinal virtues.' : '')]);
}
var PASS = { concupiscible: ['love', 'hatred', 'desire', 'aversion', 'joy', 'sorrow'], irascible: ['hope', 'despair', 'fear', 'daring', 'anger'] };
function famPass(R, lv) {
  if (lv >= 2 && R.coin()) return H.num('Aquinas counts the passions (feelings): six about good and evil simply, and five about good or evil that is hard to reach or avoid. How many passions in all?', 11, ['$6 + 5 = 11$.']);
  var k = R.coin() ? 'concupiscible' : 'irascible', o = k === 'concupiscible' ? 'irascible' : 'concupiscible', p = R.pick(PASS[k]);
  return H.mc('Which group does the feeling <b>' + p + '</b> belong to in Aquinas\'s list?', k === 'concupiscible' ? 'About good or evil simply' : 'About good or evil that is hard to reach or avoid', [k === 'concupiscible' ? 'About good or evil that is hard to reach or avoid' : 'About good or evil simply'], [p + ' is in the ' + (k === 'concupiscible' ? 'first group of six' : 'second group of five') + '.']);
}
function famChain(R, lv) {
  var chains = [['study', 'pass the course', 'graduate', 'get good work'], ['save money', 'buy a bicycle', 'ride to see friends', 'enjoy friendship'], ['practice the violin', 'play well', 'join an orchestra', 'make music with others']];
  var c = R.pick(chains), n = R.int(2, c.length - 1);
  var parts = []; for (var i = 0; i < n; i++) parts.push(c[i] + ' in order to ' + c[i + 1]);
  return H.mc('You ' + parts.join('; you ') + '. Aquinas asks: can this chain of "in order to" go on forever?', 'No: there must be a last end wanted for itself, which he calls happiness', ['Yes: every end is wanted for something else', 'It does not matter; only the first step counts', 'Yes, as long as each step is pleasant'].slice(0, lv === 1 ? 2 : 3), ['Question 1: without a last end, nothing would be desired at all.']);
}
var B = {
  facts: [
    ['Aquinas says it is impossible for happiness to consist in wealth.', true, 'Question 2, Article 1.'],
    ['Aquinas says perfect happiness can be fully reached in this life.', false, 'He holds it belongs to the life to come; this life has an imperfect happiness.'],
    ['For Aquinas, a virtue is a good habit.', true, 'Question 55.'],
    ['Aquinas thought all feelings are bad.', false, 'Feelings become good or bad by how reason guides them.'],
    ['A law, for Aquinas, must be made public.', true, 'Question 90, Article 4.'],
    ['Aquinas thought human law should forbid every vice.', false, 'Only the graver ones, especially those that harm others (Question 96).'],
    ['The natural law is the part of the eternal law that human reason can know.', true, 'Question 91, Article 2.'],
    ['Aquinas held that a human rule against the natural law is not truly a law.', true, 'Question 95, Article 2. Legal positivists disagree.'],
    ['The four cardinal virtues are faith, hope, charity and justice.', false, 'They are prudence, justice, fortitude and temperance.'],
    ['Aquinas built much of this Part on Aristotle\'s Ethics.', true, 'He also wrote a commentary on it.']
  ],
  items: [
    { q: 'What is the first rule of the natural law, according to Aquinas?', r: 'Good is to be done and pursued, and evil avoided', w: ['Obey the strongest', 'Each person decides what is good', 'Pleasure is the only good'], why: 'Question 94, Article 2.' },
    { q: 'Human laws are worked out from the natural law in two ways. What are they?', r: 'As conclusions, and by settling details reason leaves open', w: ['By votes and by wars', 'By custom and by chance', 'By the stars and by dreams'], why: 'Question 95, Article 2.' },
    { q: 'Who later quoted Aquinas on unjust laws in a famous 1963 letter?', r: 'Martin Luther King Jr.', w: ['Abraham Lincoln', 'Thomas Jefferson', 'John Locke'], why: 'In the Letter from Birmingham Jail.' },
    { q: 'What does "cardinal" mean in "cardinal virtues"?', r: 'Hinge: the other moral virtues turn on these', w: ['Red, like a bird', 'Belonging to a cardinal of the Church', 'Most difficult'], why: 'From Latin <i>cardo</i>, hinge.' },
    { q: 'Why is divine law needed, besides human law, according to Aquinas?', r: 'Human judgment can err, and human law cannot reach the heart', w: ['Human law is always unjust', 'Kings asked for it', 'Natural law does not exist'], why: 'Question 91, Article 4.' },
    { q: 'What does Aquinas call the help God gives so people can reach an end beyond their powers?', r: 'Grace', w: ['Habit', 'Fortune', 'Promulgation'], why: 'Questions 109 to 114.' }
  ]
};
H.T(ID, B, [famGood, famGood, famLaw, famLaw, famMark, famMean, famVK, famPass, famChain].concat(dateFams(ID)), 0.62);
