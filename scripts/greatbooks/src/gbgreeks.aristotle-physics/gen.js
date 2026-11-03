/* Aristotle, Physics. Bank plus computed families: the four causes (II.3) for many things, Aristotle's rule for speed
   in a medium (IV.8: faster with weight, slower in a thicker medium) against free fall, Zeno's halves, and the void
   argument. chk carries the inputs. */
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = o.form || 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function mcc(q, right, wrongs, steps, o) { var p = H.mc(q, right, wrongs, steps, o); if (o && o.chk) p.chk = o.chk; return p; }
function cm(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function r2(x, d) { var k = Math.pow(10, d == null ? 2 : d); return Math.round(x * k) / k; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbgreeks.aristotle-physics';
var CAUSES = [
  ['a bronze statue', 'the bronze', 'the shape of the statue', 'the sculptor', 'to honor someone'],
  ['a wooden table', 'the wood', 'the design of a table', 'the carpenter', 'to eat and work at'],
  ['a house', 'bricks and timber', 'the plan of a house', 'the builder', 'to give shelter'],
  ['a silver bowl', 'the silver', 'the shape of a bowl', 'the silversmith', 'to hold food'],
  ['an oak tree', 'wood and sap', 'the form of an oak', 'the parent tree, through an acorn', 'a full-grown oak that makes acorns'],
  ['a walk after dinner', 'the body', 'what a walk is', 'the decision to walk', 'health'],
  ['a bird\'s nest', 'twigs and grass', 'the cup shape', 'the bird', 'to keep the eggs safe'],
  ['a ship', 'planks, rope and pitch', 'the shipwright\'s design', 'the shipwright', 'to carry people and cargo by sea'],
  ['a loaf of bread', 'flour, water and yeast', 'what a loaf is', 'the baker', 'to be eaten']
];
var CN = ['material cause', 'formal cause', 'moving (efficient) cause', 'final cause'];
function famCause(R, lv) {
  var t = R.pick(CAUSES), j = R.int(0, 3);
  if (lv >= 2 && R.coin()) {
    var others = CAUSES.filter(function (x) { return x !== t; }), wr = [t[1 + (j + 1) % 4], t[1 + (j + 2) % 4], t[1 + (j + 3) % 4]];
    return mcc('For ' + t[0] + ', what is the <b>' + CN[j] + '</b>, in Aristotle\'s sense?', t[1 + j], lv === 3 ? wr : wr.slice(0, 2), ['Material: what it is made of. Formal: what it is. Moving: what made it. Final: what it is for.', 'For ' + t[0] + ', the ' + CN[j] + ' is ' + t[1 + j] + '.'], { chk: { f: 'cause', t: t[0], j: j, ask: 'which' } });
  }
  return mcc('For ' + t[0] + ', which of Aristotle\'s four causes is "' + t[1 + j] + '"?', CN[j], CN.filter(function (x, i) { return i !== j; }).slice(0, lv === 1 ? 2 : 3), ['Material: what it is made of. Formal: what it is. Moving: what made it. Final: what it is for.', '"' + t[1 + j] + '" answers the question of the ' + CN[j] + '.'], { chk: { f: 'cause', t: t[0], j: j, ask: 'name' } });
}
function famRule(R, lv) {
  var w1 = R.int(1, 5), k = R.int(2, 5), w2 = w1 * k, t1 = R.int(2, 8) * k;
  return num('By Aristotle\'s rule (speed in proportion to weight, in the same medium), a ' + w1 + ' kg stone falls a certain height in ' + t1 + ' s. How long would a ' + w2 + ' kg stone of the same shape take, by the same rule?', t1 / k, 's', [w2 + ' kg is ' + k + ' times as heavy, so by the rule it moves ' + k + ' times as fast.', 'Time: $' + t1 + ' \\div ' + k + ' = ' + t1 / k + '$ s. (In fact, with little air resistance, both take about the same time.)'], { chk: { f: 'rule', t1: t1, k: k } });
}
function famMedium(R, lv) {
  var t = R.int(1, 4), k = R.pick([2, 3, 4, 5, 10]);
  return num('Aristotle (Physics IV.8) says that the same body moves through a thicker medium more slowly, in proportion to the thickness. If a body crosses a distance through air in ' + t + ' s, and water is taken as ' + k + ' times as thick, how long does the rule say it takes through water?', t * k, 's', ['Speed is inversely proportional to the thickness of the medium.', k + ' times as thick: ' + k + ' times as slow, so $' + t + ' \\times ' + k + ' = ' + t * k + '$ s.', 'Aristotle then argued that in a void (thickness zero) the speed would be infinite, so there is no void.'], { chk: { f: 'medium', t: t, k: k } });
}
function famFall(R, lv) {
  var h = R.pick([5, 10, 20, 45, 80, 125]), t = Math.sqrt(2 * h / 9.8);
  return num('With air resistance ignored (as Galileo and Newton taught), how long does any stone, heavy or light, take to fall ' + h + ' m? Use $g = 9.8$ m/s² and give two decimal places.', r2(t, 2), 's', ['$h = \\tfrac12 g t^2$, so $t = \\sqrt{2h/g}$.', '$t = \\sqrt{2 \\times ' + h + ' / 9.8} \\approx ' + r2(t, 2) + '$ s, the same for every weight.'], { rtol: 0.01, chk: { f: 'fall', h: h } });
}
function famZeno(R, lv) {
  var L = R.pick([64, 128, 256, 400, 800, 1600]), n = R.int(2, lv === 1 ? 3 : 6), left = L / Math.pow(2, n);
  var ask = lv >= 2 && R.coin();
  return num('Zeno\'s runner covers half of a ' + L + ' m course, then half of what remains, and so on. After ' + n + ' of these steps, how many meters ' + (ask ? 'has she run' : 'are left') + '?', ask ? L - left : left, 'm', ['Each step halves what is left: $' + L + ' \\div 2^{' + n + '} = ' + left + '$ m left.', ask ? 'Run so far: $' + L + ' - ' + left + ' = ' + (L - left) + '$ m.' : 'Aristotle\'s answer to Zeno: the time divides just as the distance does, so the whole is crossed in a finite time.'], { form: Number.isInteger(left) ? 'int' : 'dec', chk: { f: 'zeno', L: L, n: n, ask: ask } });
}
var B = {
  facts: [
    ['Aristotle studied in Plato\'s Academy for about twenty years.', true, ''],
    ['In the Physics, "physics" means the study of nature: everything that changes.', true, 'From the Greek physis, nature.'],
    ['Aristotle believed a void (empty space) exists.', false, 'He argued against it in Physics IV.6–9.'],
    ['Aristotle wrote that a body in a void would never stop unless something stopped it.', true, 'Physics IV.8; he took it as a sign that a void is impossible. Newton accepted it as the first law.'],
    ['Aristotle\'s rule fits slow, steady motion through thick fluids fairly well.', true, 'Carlo Rovelli (2015) made this point.'],
    ['The four causes are called material, formal, efficient and final.', true, 'The Latin names came later; Aristotle describes them in Physics II.3.'],
    ['Aristotle thought the infinite exists all at once, as a finished whole.', false, 'Only potentially: a line can always be divided again.'],
    ['Aristotle defined time as the number of motion with respect to before and after.', true, 'Physics IV.11.'],
    ['Galileo showed that, with air resistance taken away, heavy and light bodies fall together.', true, ''],
    ['Aristotle dropped two balls from a tower to test his rule.', false, 'There is no record of such a test by him.']
  ],
  items: [
    { q: 'What problem was Aristotle answering in the Physics?', r: 'Earlier thinkers had argued that change or motion is impossible or purposeless', w: ['Nobody had ever studied animals', 'Rome had banned philosophy', 'Euclid had disproved geometry'], why: 'Parmenides and Zeno denied change; atomists denied purpose.' },
    { q: 'Which cause is "that for the sake of which" a thing is done?', r: 'The final cause', w: ['The material cause', 'The formal cause', 'The efficient cause'], why: 'Aristotle\'s example: health is the cause of walking.' },
    { q: 'Why did Aristotle reject the void?', r: 'His rule for speed would give an infinite speed in a medium of zero thickness', w: ['He had measured a vacuum and found it full', 'Plato forbade it', 'He thought air was made of atoms'], why: 'Physics IV.8.' },
    { q: 'What later idea does Aristotle\'s remark in Physics IV.8 anticipate?', r: 'Newton\'s first law, inertia', w: ['Kepler\'s ellipses', 'Darwin\'s natural selection', 'Lavoisier\'s conservation of mass'], why: 'A body set moving in a void would keep moving.' },
    { q: 'How does modern biology answer Aristotle\'s question "what is this part for"?', r: 'By natural selection: the part helped its owners\' ancestors survive and reproduce', w: ['It refuses to ask the question', 'By the four elements', 'By the shapes of atoms'], why: 'Darwin, 1859.' },
    { q: 'What is Aristotle\'s "unmoved mover"?', r: 'A first source of all motion that is not itself moved', w: ['A heavy stone at the center of the Earth', 'A machine for lifting weights', 'The Moon'], why: 'Physics VIII; developed further in the Metaphysics.' }
  ]
};
H.T(ID, B, [famCause, famCause, famRule, famMedium, famFall, famZeno].concat(dateFams(ID).slice(0, 2)), 0.6);
