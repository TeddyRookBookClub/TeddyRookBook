/* Harvey: On the Generation of Animals. Bank (the daily egg, the leaping point, epigenesis, every animal from an egg,
   the history) plus computed families: incubation day arithmetic (days left, the weekday of hatching, fractions of the
   21 days), the order of the stages, and incubation times compared. Computed problems carry chk (verify-science-b.js). */
var ID = 'gb17.harvey-generation-of-animals';
function nm(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = 'int'; if (unit === '%') p.a.pct = true; else if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.chk) p.chk = o.chk; return p; }
var B = {
  facts: [
    ['Harvey opened hens’ eggs day after day to watch the chick develop.', true, 'He recorded each stage of incubation.'],
    ['Harvey saw the chick’s heart as a tiny red "leaping point" by about the fourth day.', true, 'The punctum saliens, "like the smallest spark of fire".'],
    ['Harvey argued that a chick is already complete but tiny inside the egg, and only grows larger.', false, 'He argued the parts appear one after another (epigenesis).'],
    ['Harvey showed that development begins at the small white spot on the yolk.', true, 'The cicatricula, now called the germinal disc.'],
    ['The frontispiece of Harvey’s 1651 book shows an egg with the words "ex ovo omnia", "all things from an egg".', true, 'Jupiter opens an egg from which animals come out.'],
    ['Harvey found the egg of a mammal.', false, 'It was too small to see; Karl Ernst von Baer found it in 1827.'],
    ['Harvey still allowed that some small creatures might arise by themselves from other matter.', true, 'Redi and later Pasteur showed they come from other living things.'],
    ['Many of Harvey’s notes were lost when his rooms were ransacked in 1642, during the English Civil War.', true, 'He finished the book anyway.'],
    ['Harvey studied deer from King Charles I’s parks.', true, 'To see how young deer first form.'],
    ['A hen’s egg hatches after about 21 days of incubation.', true, 'Three weeks.'],
    ['Today we know the chick’s heart starts beating at about two days.', true, 'Earlier than Harvey could see without a microscope.'],
    ['On the Generation of Animals came out before On the Motion of the Heart and Blood.', false, 'Heart and blood was 1628; generation was 1651.'],
    ['Harvey’s teacher Fabricius had studied the chick in the egg before him.', true, 'Harvey corrected where Fabricius thought development begins.'],
    ['The science of how animals develop before birth or hatching is called embryology.', true, 'Harvey helped found it.']
  ],
  items: [
    { q: 'What did Harvey call the beating heart he saw in the egg?', r: 'The punctum saliens, the "leaping point"', w: ['The cicatricula', 'The yolk sac', 'The air cell', 'The chalaza'], why: 'From Exercise 17.' },
    { q: 'What is epigenesis?', r: 'The idea that an animal is built up part by part', w: ['The idea that it is complete but tiny from the start', 'The idea that animals arise from mud', 'The study of eggs’ shells', 'A kind of incubator'], why: 'Harvey argued for it.' },
    { q: 'What is preformation?', r: 'The idea that a living thing exists complete but tiny from the start', w: ['The idea that parts appear one after another', 'Harvey’s word for the heartbeat', 'The hatching of a chick', 'A way of counting days'], why: 'The view Harvey argued against.' },
    { q: 'Who first saw the egg of a mammal?', r: 'Karl Ernst von Baer, in 1827', w: ['William Harvey', 'Fabricius', 'Galen', 'Louis Pasteur'], why: 'Almost two hundred years after Harvey’s guess.' },
    { q: 'Who showed with covered meat that maggots come from flies’ eggs?', r: 'Francesco Redi', w: ['William Harvey', 'Aristotle', 'Karl Ernst von Baer', 'Fabricius'], why: 'In 1668.' },
    { q: 'What was Harvey’s main way of studying generation?', r: 'Patient, daily observation of developing eggs', w: ['Reading Aristotle only', 'Mathematical calculation', 'Using a modern microscope', 'Asking farmers'], why: 'He watched and wrote down what he saw.' },
    { q: 'In what year did On the Generation of Animals appear?', r: '1651', w: ['1628', '1543', '1687', '1600'], why: 'When Harvey was over seventy.' },
    { q: 'What words are on the frontispiece of Harvey’s book on generation?', r: 'Ex ovo omnia ("all things from an egg")', w: ['Knowledge is power', 'I think, therefore I am', 'Know thyself', 'Nature does nothing in vain'], why: 'Jupiter opens an egg from which animals emerge.' }
  ]
};
var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
function famLeft(R, lv) {
  var d = R.int(1, 20);
  return nm('A hen’s egg hatches about 21 days after incubation starts. Today is day ' + d + '. How many more days until it hatches?', 21 - d, 'days', ['21 − ' + d + ' = ' + (21 - d) + ' days.'], { chk: { f: 'diff', a: 21, b: d } });
}
function famWeekday(R, lv) {
  var s = R.int(0, 6), n = lv === 1 ? 21 : R.pick([4, 10, 17, 18, 21, 19]), e = (s + n) % 7;
  return H.mc('Eggs are set under a hen on a ' + DAYS[s] + ' morning. What day of the week is it ' + n + ' days later' + (n === 21 ? ', when they hatch' : n === 4 ? ', when Harvey could easily see the heart beating' : '') + '?', DAYS[e], R.sample(DAYS.filter(function (x) { return x !== DAYS[e]; }), lv === 1 ? 2 : 3),
    [n + ' days is ' + Math.floor(n / 7) + ' week(s) and ' + (n % 7) + ' day(s).', 'Count ' + (n % 7) + ' day(s) on from ' + DAYS[s] + ': ' + DAYS[e] + '.']);
}
function famFrac(R, lv) {
  var d = R.pick([3, 7, 14, 4, 10.5]), pct = d / 21 * 100;
  return nm('Harvey watched the chick develop over 21 days. What percent of the incubation has passed by day ' + d + '? (Round to the nearest whole percent.)', Math.round(pct), '%',
    [d + ' ÷ 21 ≈ ' + (d / 21).toFixed(3) + ', which is about ' + Math.round(pct) + '%.'], { chk: { f: 'pctr', a: d, b: 21 } });
}
var STAGES = ['a white spot on the yolk', 'a beating red point (the heart)', 'blood vessels spreading over the yolk', 'a large dark eye', 'a beak, wings and legs', 'feathers', 'hatching'];
function famStages(R, lv) {
  var k = lv === 1 ? 3 : 4, idx = R.sample([0, 1, 3, 4, 5, 6], k).sort(), right = idx.map(function (i) { return STAGES[i]; }).join(' → ');
  var w = []; for (var t = 0; t < 10 && w.length < 3; t++) { var s = R.shuffle(idx).map(function (i) { return STAGES[i]; }).join(' → '); if (s !== right && w.indexOf(s) < 0) w.push(s); }
  return H.mc('Which list puts these stages of the chick in the egg in order, <b>earliest first</b>?', right, w, ['In order: ' + STAGES.join(', ') + '.', 'Harvey saw the parts appear one after another.']);
}
var INC = [['a hen', 21], ['a duck', 28], ['a goose', 30], ['a pigeon', 18], ['a quail', 17], ['an ostrich', 42]];
function famInc(R, lv) {
  var a = R.pick(INC), b = R.pick(INC.filter(function (x) { return x !== a; }));
  return nm('The egg of ' + a[0] + ' takes about ' + a[1] + ' days to hatch, and the egg of ' + b[0] + ' about ' + b[1] + '. How many days longer does the slower one take?', Math.abs(a[1] - b[1]), 'days',
    ['|' + a[1] + ' − ' + b[1] + '| = ' + Math.abs(a[1] - b[1]) + ' days.'], { chk: { f: 'adiff', a: a[1], b: b[1] } });
}
H.T(ID, B, [famLeft, famWeekday, famFrac, famStages, famInc, function (R, lv) { return H.famBefore(R, lv, ID); }], 0.5);
