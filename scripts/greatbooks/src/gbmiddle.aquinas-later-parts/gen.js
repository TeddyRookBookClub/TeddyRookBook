/* Aquinas, Summa Theologica, later parts (gbe4). Families: theological vs cardinal virtues, the vices opposed to
   each, the order of the treatises, the argument that charity is greatest, the marks of friendship, numbers. */
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
var ID = 'gbmiddle.aquinas-later-parts';
var VIR = [['faith', 'theological'], ['hope', 'theological'], ['charity', 'theological'], ['prudence', 'cardinal'], ['justice', 'cardinal'], ['fortitude', 'cardinal'], ['temperance', 'cardinal']];
function famKind(R, lv) {
  if (lv >= 2 && R.coin()) {
    var k = R.coin() ? 'theological' : 'cardinal', T = VIR.filter(function (v) { return v[1] === k; }), F = VIR.filter(function (v) { return v[1] !== k; });
    var r = R.pick(T)[0];
    return H.mc('Which of these is a <b>' + k + '</b> virtue?', r, R.sample(F, 3).map(function (v) { return v[0]; }), [r + ' is ' + k + '. The theological virtues are faith, hope and charity; the cardinal, prudence, justice, fortitude and temperance.']);
  }
  var v = R.pick(VIR);
  return H.mc('Is <b>' + v[0] + '</b> a theological or a cardinal virtue?', v[1] === 'theological' ? 'Theological' : 'Cardinal', [v[1] === 'theological' ? 'Cardinal' : 'Theological'], [v[0] + ' is ' + v[1] + '.']);
}
var OPP = [['despair', 'hope'], ['presumption', 'hope'], ['unbelief', 'faith'], ['hatred', 'charity'], ['envy', 'charity'], ['discord', 'charity'], ['cowardice', 'fortitude'], ['injustice', 'justice'], ['overindulgence', 'temperance'], ['negligence', 'prudence']];
var EFF = ['joy', 'peace', 'mercy'];
function famOpp(R, lv) {
  if (R.next() < 0.25) {
    var e = R.pick(EFF);
    return H.mc('Aquinas names <b>' + e + '</b> as an effect, or fruit, of which virtue?', 'charity', ['justice', 'fortitude', 'prudence'].slice(0, lv === 1 ? 2 : 3), ['Joy, peace and mercy are effects of charity (II-II, Questions 28 to 30).']);
  }
  return famPairs(OPP, function (a) { return 'Which virtue does Aquinas set the vice of <b>' + a + '</b> against?'; })(R, lv);
}
var ORDER = ['faith', 'hope', 'charity', 'prudence', 'justice', 'fortitude', 'temperance'];
var ARG = ['The theological virtues reach God himself.', 'Faith and hope reach God as something not yet seen or had.', 'Charity reaches God as he is, resting in him.', 'So charity is the greatest of the virtues.'];
function famArg(R, lv) {
  if (R.coin()) return H.mc('In Aquinas\'s argument that charity is the greatest virtue, which step is the <b>conclusion</b>?', ARG[3], ARG.slice(0, lv === 1 ? 2 : 3), ['The first three steps are premises.']);
  return H.mc('Which step of the argument explains why charity is above <b>faith and hope</b>?', ARG[2], [ARG[0], ARG[3], 'Charity is the easiest virtue.'].slice(0, lv === 1 ? 2 : 3), ['Faith and hope look to what is not yet seen or had; charity rests in God now.']);
}
var FRIEND = ['it wishes the friend well', 'the love is returned', 'it rests on something the friends share'];
function famFriend(R, lv) {
  var i = R.int(0, 2), others = FRIEND.filter(function (_, j) { return j !== i; });
  return H.mc('Aquinas, following Aristotle, says friendship needs three things: ' + others.join(', ') + ', and one more. Which?', FRIEND[i], ['it lasts at least a year', 'the friends live in the same town', 'the friends are the same age'].slice(0, lv === 1 ? 2 : 3), ['The three marks: ' + FRIEND.join('; ') + '.']);
}
function famNums(R, lv) {
  var qs = [
    ['How many theological virtues does Aquinas treat?', 3, 'Faith, hope and charity.'],
    ['How many cardinal virtues are there?', 4, 'Prudence, justice, fortitude and temperance.'],
    ['How many sacraments does Aquinas count in the Third Part?', 7, 'He matches the seven to the stages of life.'],
    ['How many virtues are on the wheel: theological plus cardinal?', 7, '$3 + 4 = 7$.'],
    ['Aquinas died in 1274. How many years after he began the Summa (about 1265) was that?', 9, '$1274 - 1265 = 9$.']];
  var q = R.pick(qs);
  return H.num(q[0], q[1], [q[2]]);
}
var B = {
  facts: [
    ['Aquinas calls charity a kind of friendship with God.', true, 'II-II, Question 23, Article 1.'],
    ['Aquinas says hope is opposed by despair and by presumption.', true, 'One gives up; the other takes it for granted.'],
    ['Aquinas finished every part of the Summa himself.', false, 'He stopped in December 1273; followers added a Supplement.'],
    ['Aquinas held the same thing cannot be both known and believed by the same person in the same respect.', true, 'II-II, Question 1.'],
    ['Aquinas said charity loves only friends, never enemies.', false, 'Charity wishes good even to enemies, for God\'s sake.'],
    ['Aquinas\'s question on war set out conditions later called "just war" teaching.', true, 'II-II, Question 40: right authority, just cause, right intention.'],
    ['Aquinas calls charity the "form" of the virtues.', true, 'It directs all of them to their last end.'],
    ['The Third Part of the Summa is about the laws of kings.', false, 'It is about Christ and the sacraments.'],
    ['Aquinas died at the abbey of Fossanova on his way to a council in Lyon.', true, 'On 7 March 1274.'],
    ['Aquinas is traditionally credited with hymns for the feast of Corpus Christi.', true, 'Such as <i>Pange lingua</i>.']
  ],
  items: [
    { q: 'What did Aquinas reportedly say, after he stopped writing, about all he had written?', r: 'That it seemed like straw compared with what he had seen', w: ['That it was perfect and complete', 'That it should be burned at once', 'That only the First Part mattered'], why: 'Reported by his companion Reginald of Piperno.' },
    { q: 'Which Bible verse does Aquinas use to show charity is the greatest virtue?', r: '"The greatest of these is charity" (1 Corinthians 13:13)', w: ['"In the beginning was the Word"', '"Love your neighbor as yourself"', '"Blessed are the meek"'], why: 'Paul\'s letter to the Corinthians.' },
    { q: 'Why does Aquinas call faith, hope and charity "theological"?', r: 'God is their object and, he holds, their giver', w: ['Only theologians have them', 'They are taught in books', 'They come from Greek philosophy'], why: 'Theos is Greek for God.' },
    { q: 'According to Aquinas, what does charity love first?', r: 'God, then oneself, then one\'s neighbor', w: ['One\'s neighbor, then God', 'Oneself only', 'The world, then God'], why: 'The order of charity, II-II, Question 26.' },
    { q: 'Where does Dante have Saints Peter, James and John examine him on faith, hope and love?', r: 'In the heaven of the fixed stars', w: ['At the gate of Hell', 'On the shore of Purgatory', 'In the heaven of the Moon'], why: 'Paradiso, Cantos XXIV to XXVI.' },
    { q: 'What is the Supplement of the Summa?', r: 'Questions completed after Aquinas\'s death from his earlier writings', w: ['A list of his sermons', 'A book of hymns', 'An index made in 1900'], why: 'His followers assembled it.' }
  ]
};
H.T(ID, B, [famKind, famKind, famOpp, famOpp, famSeq(ORDER, 'the order in which Aquinas treats the seven virtues', 'virtue'), famArg, famFriend, famNums].concat(dateFams(ID)), 0.62);
