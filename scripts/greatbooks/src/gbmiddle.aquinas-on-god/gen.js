/* Aquinas, Summa Theologica, First Part (gbe4). Bank plus families: the parts of an article and their order, the
   five ways (starting points, conclusions, numbers), the steps of the first way as an argument, key terms, dates. */
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
var ID = 'gbmiddle.aquinas-on-god';
var PARTS = ['The question ("Whether ...?")', 'Objections ("It seems that ...")', '"On the contrary"', '"I answer that"', 'Replies to the objections'];
var WAYS = [['motion', 'a first mover, moved by no other'], ['efficient causes', 'a first cause'], ['possibility and necessity (things that come and go)', 'a being that exists necessarily'], ['degrees of goodness, truth and nobility', 'a greatest, the cause of goodness in all things'], ['the order of nature (things without minds acting for an end)', 'an intelligent being who directs natural things']];
var SAYS = [
  ['"It seems that God does not exist, because there is evil in the world."', 'an objection'],
  ['"It seems that nature can explain everything without God."', 'an objection'],
  ['"It is said in the person of God: I am Who am."', 'the "On the contrary"'],
  ['"The existence of God can be proved in five ways."', 'the "I answer that"'],
  ['"God would not allow any evil unless he could bring good even out of evil."', 'a reply to an objection'],
  ['"Whether God exists?"', 'the question']];
function famParts(R, lv) {
  if (R.coin()) {
    var i = R.int(0, 3);
    return H.mc('In an article of the Summa, which part comes right after <b>' + PARTS[i] + '</b>?', PARTS[i + 1], R.sample(PARTS.filter(function (_, j) { return j !== i + 1 && j !== i; }), lv === 1 ? 2 : 3), ['The order is: ' + PARTS.join(' → ') + '.']);
  }
  var s = R.pick(SAYS);
  return H.mc('In Question 2, Article 3, which part of the article contains this sentence? ' + s[0], s[1], R.sample(H.uniq(SAYS.map(function (x) { return x[1]; }).filter(function (x) { return x !== s[1]; })), lv === 1 ? 2 : 3), ['It is ' + s[1] + '.']);
}
function famWays(R, lv) {
  var i = R.int(0, 4), r = R.next();
  if (r < 0.35) return H.mc('Which of Aquinas\'s five ways starts from <b>' + WAYS[i][0] + '</b>? Give its number.', 'The ' + ['first', 'second', 'third', 'fourth', 'fifth'][i] + ' way', ['first', 'second', 'third', 'fourth', 'fifth'].filter(function (_, j) { return j !== i; }).slice(0, lv === 1 ? 2 : 3).map(function (x) { return 'The ' + x + ' way'; }), ['Motion, causes, possibility and necessity, degrees, order: way ' + (i + 1) + ' is from ' + WAYS[i][0] + '.']);
  if (r < 0.7) return H.mc('The way that starts from <b>' + WAYS[i][0] + '</b> concludes that there must be ...', WAYS[i][1], R.sample(WAYS.filter(function (_, j) { return j !== i; }).map(function (w) { return w[1]; }), lv === 1 ? 2 : 3), ['From ' + WAYS[i][0] + ', Aquinas reaches ' + WAYS[i][1] + '.']);
  return H.num('Aquinas\'s five ways are, in order: motion, causes, possibility and necessity, degrees, and order in nature. What number is the way from <b>' + WAYS[i][0].split(' (')[0] + '</b>?', i + 1, ['It is way ' + (i + 1) + '.']);
}
var FIRST = ['Some things in the world are in motion.', 'Whatever is in motion is moved by something else.', 'The chain of movers cannot go back forever.', 'So there is a first mover, moved by no other.'];
function famArg(R, lv) {
  var r = R.next();
  if (r < 0.34) return H.mc('In the first way, which step is the <b>conclusion</b>?', FIRST[3], FIRST.slice(0, 3).slice(0, lv === 1 ? 2 : 3), ['The first three are premises; "' + FIRST[3] + '" follows from them.']);
  if (r < 0.67) return H.mc('In the first way, which premise is a matter of plain <b>observation</b>, "evident to our senses"?', FIRST[0], [FIRST[1], FIRST[2], FIRST[3]].slice(0, lv === 1 ? 2 : 3), ['Aquinas: it is evident to our senses that some things are in motion.']);
  return H.mc('A critic says: "Why can\'t the chain of movers go back forever?" Which step of the first way is the critic questioning?', FIRST[2], [FIRST[0], FIRST[1], FIRST[3]].slice(0, lv === 1 ? 2 : 3), ['That is the premise that the chain cannot go back forever.']);
}
function famObj(R, lv) {
  var n = R.int(2, lv === 3 ? 7 : 4);
  return H.num('An article of the Summa lists ' + n + ' objections. Aquinas answers every objection at the end. How many replies to objections does the article have?', n, ['One reply for each objection: ' + n + '.']);
}
var TERMS = [['act and potency', 'being something actually, versus being able to become it'], ['analogy', 'how words like "good" apply to God and creatures in related but not identical senses'], ['sacred doctrine', 'teaching based on what God has revealed, beyond what philosophy finds'], ['the soul as form of the body', 'the soul is what makes a living body a human body; a person is one thing'], ['creation', 'God making all things from nothing and keeping them in being']];
var B = {
  facts: [
    ['Aquinas was a Dominican friar.', true, 'He joined the order of preachers against his family\'s wishes.'],
    ['Aquinas finished the Summa Theologica in 1260.', false, 'He began it around 1265 and left it unfinished in 1273.'],
    ['Aquinas thought the existence of God could be shown from God\'s effects in the world.', true, 'Question 2, Article 2.'],
    ['Aquinas held that reason alone can prove the world had a beginning in time.', false, 'He held this is known by faith, not demonstrated (Question 46).'],
    ['Each article states the objections before Aquinas gives his own answer.', true, 'Then he replies to each.'],
    ['Aquinas called Aristotle "the Philosopher."', true, 'He cites him constantly.'],
    ['Aquinas taught that faith and reason contradict each other.', false, 'He held that both come from God and cannot truly conflict.'],
    ['Aquinas said we can know more about what God is not than about what God is.', true, 'He opens Question 3 this way.'],
    ['The first way is the argument from motion.', true, 'He calls it the "more manifest" way.'],
    ['Aquinas thought the soul and body are two separate things, like a sailor and a ship.', false, 'He follows Aristotle: the soul is the form of the body.']
  ],
  items: [
    { q: 'Who taught Aquinas in Paris and Cologne?', r: 'Albert the Great', w: ['Augustine', 'Anselm', 'Dante'], why: 'Albert the Great, a Dominican scholar.' },
    { q: 'What did some students call the quiet young Aquinas?', r: '"The dumb ox"', w: ['"The angel"', '"The fox"', '"The little lion"'], why: 'His teacher said the ox would one day be heard by the world.' },
    { q: 'Why does Aquinas list objections first?', r: 'To give the strongest case against his view before answering it', w: ['To confuse his readers', 'Because he agrees with them', 'Because the Church required it'], why: 'The article is a written-down debate.' },
    { q: 'How does Aquinas answer the objection from evil?', r: 'With Augustine: God allows evil only because he can bring good out of it', w: ['He says evil does not exist', 'He gives up the argument', 'He says God causes evil on purpose'], why: 'Reply to Objection 1.' },
    { q: 'What does "motion" mean in the first way?', r: 'Any change from being able to be something to actually being it', w: ['Only movement from place to place', 'Only the motion of the stars', 'The motion of the soul to God'], why: 'Like wood becoming hot in a fire.' },
    { q: 'Which thinker\'s argument about God, "that than which nothing greater can be thought," did Aquinas not accept as a proof?', r: 'Anselm', w: ['Aristotle', 'Augustine', 'Boethius'], why: 'Question 2, Article 1.' },
    { q: 'What are the three parts of the Summa about, in order?', r: 'God and creation; human life and virtue; Christ and the sacraments', w: ['Law; war; peace', 'Hell; Purgatory; Heaven', 'Logic; physics; ethics'], why: 'First, Second and Third Parts.' },
    { q: 'Which later philosophers challenged arguments like the five ways?', r: 'Hume and Kant', w: ['Plato and Aristotle', 'Dante and Chaucer', 'Euclid and Archimedes'], why: 'Hume in 1779, Kant in 1781.' }
  ]
};
H.T(ID, B, [famParts, famParts, famWays, famWays, famArg, famObj, famPairs(TERMS, function (a) { return 'In Aquinas, what does <b>' + a + '</b> mean?'; }, function (b) { return 'Which term of Aquinas\'s means this: ' + b + '?'; })].concat(dateFams(ID)), 0.6);
