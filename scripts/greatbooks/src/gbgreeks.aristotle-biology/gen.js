/* Aristotle, the animal books. Bank plus computed families: sorting animals by Aristotle's features (red blood or not,
   live young or eggs, lungs or gills), "choose all" with two features, Aristotle's group for a bloodless animal, and
   counting days in his chick-egg observations. chk carries the inputs. */
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = o.form || 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function mcc(q, right, wrongs, steps, o) { var p = H.mc(q, right, wrongs, steps, o); if (o && o.chk) p.chk = o.chk; return p; }
function cm(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function r2(x, d) { var k = Math.pow(10, d == null ? 2 : d); return Math.round(x * k) / k; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbgreeks.aristotle-biology';
// name, red blood, live young, lungs, Aristotle's bloodless group (if any), modern group
var AN = [
  ['horse', 1, 1, 1, '', 'mammal'], ['dolphin', 1, 1, 1, '', 'mammal'], ['whale', 1, 1, 1, '', 'mammal'], ['bat', 1, 1, 1, '', 'mammal'], ['seal', 1, 1, 1, '', 'mammal'], ['dog', 1, 1, 1, '', 'mammal'],
  ['eagle', 1, 0, 1, '', 'bird'], ['pigeon', 1, 0, 1, '', 'bird'], ['tortoise', 1, 0, 1, '', 'reptile'], ['lizard', 1, 0, 1, '', 'reptile'], ['frog', 1, 0, 1, '', 'amphibian'],
  ['tuna', 1, 0, 0, '', 'fish'], ['sea bass', 1, 0, 0, '', 'fish'], ['dogfish shark', 1, 1, 0, '', 'fish'],
  ['octopus', 0, 0, 0, 'softies (cephalopods)', 'mollusk'], ['squid', 0, 0, 0, 'softies (cephalopods)', 'mollusk'], ['crab', 0, 0, 0, 'soft-shelled animals', 'crustacean'], ['lobster', 0, 0, 0, 'soft-shelled animals', 'crustacean'],
  ['snail', 0, 0, 0, 'shell-skinned animals', 'mollusk'], ['oyster', 0, 0, 0, 'shell-skinned animals', 'mollusk'], ['bee', 0, 0, 0, 'insects', 'insect'], ['ant', 0, 0, 0, 'insects', 'insect'], ['locust', 0, 0, 0, 'insects', 'insect']
];
var FEAT = [[1, 'red blood', 'has red blood'], [2, 'live young', 'bears live young'], [3, 'lungs', 'breathes with lungs']];
function famFeature(R, lv) {
  var a = R.pick(AN), f = R.pick(lv === 1 ? FEAT.slice(0, 2) : FEAT), yes = !!a[f[0]];
  var why = f[0] === 1 ? (yes ? 'It is a blooded animal (a vertebrate, in modern terms).' : 'Aristotle classed it among the bloodless animals (an invertebrate).') : f[0] === 2 ? (yes ? 'It gives birth to live young' + (a[0] === 'dogfish shark' ? ': the smooth dogfish nourishes its young inside, as Aristotle reported.' : '.') : 'It lays eggs.') : (yes ? 'It breathes air with lungs' + (a[5] === 'mammal' && /dolphin|whale|seal/.test(a[0]) ? ', even though it lives in the sea.' : '.') : 'It does not breathe with lungs.');
  return H.tf('The ' + a[0] + ' ' + f[2] + '.', yes, why);
}
function famAll(R, lv) {
  var f1 = FEAT[0], f2 = R.pick(FEAT.slice(1)), pool = R.sample(AN, 5), pick = pool.filter(function (a) { return a[f1[0]] && a[f2[0]]; });
  if (!pick.length || pick.length === 5) return null;
  var ch = pool.map(function (a) { return a[0]; }), v = []; pool.forEach(function (a, i) { if (a[f1[0]] && a[f2[0]]) v.push(i); });
  return { q: 'Choose <b>all</b> the animals that have red blood <b>and</b> ' + (f2[0] === 2 ? 'bear live young' : 'breathe with lungs') + '.', a: { t: 'mc', choices: ch, v: v }, steps: pool.map(function (a) { return a[0] + ': ' + (a[1] ? 'red blood' : 'no red blood') + ', ' + (a[f2[0]] ? (f2[0] === 2 ? 'live young' : 'lungs') : (f2[0] === 2 ? 'eggs' : 'no lungs')) + '.'; }), hint: 'Check each animal for both features.', chk: { f: 'all', animals: ch, f2: f2[0] } };
}
function famGroup(R, lv) {
  var bl = AN.filter(function (a) { return !a[1]; }), a = R.pick(bl), gs = ['softies (cephalopods)', 'soft-shelled animals', 'shell-skinned animals', 'insects'];
  return mcc('Aristotle split the bloodless animals into four groups. Where did he put the ' + a[0] + '?', a[4], gs.filter(function (g) { return g !== a[4]; }).slice(0, lv === 1 ? 2 : 3), ['The ' + a[0] + ' belongs with the ' + a[4] + '. Today it is called ' + (/^[aeiou]/.test(a[5]) ? 'an ' : 'a ') + a[5] + '.'], { chk: { f: 'group', a: a[0] } });
}
function famModern(R, lv) {
  var a = R.pick(AN.filter(function (x) { return x[1]; })), gs = ['mammal', 'bird', 'reptile', 'amphibian', 'fish'];
  return mcc('Aristotle put the ' + a[0] + ' among the blooded animals. Which modern group is it in?', a[5], gs.filter(function (g) { return g !== a[5]; }).slice(0, lv === 1 ? 2 : 3), ['The ' + a[0] + ' is ' + (/^[aeiou]/.test(a[5]) ? 'an ' : 'a ') + a[5] + '.' + (a[0] === 'dolphin' || a[0] === 'whale' ? ' Aristotle saw that it breathes air and suckles its young, like land mammals.' : '')], { chk: { f: 'modern', a: a[0] } });
}
function ord(n) { var s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th'; return n + s; }
function famEgg(R, lv) {
  var start = R.int(1, 20), days = R.int(2, 6), open = start + days;
  return num('Aristotle opened hens\' eggs on successive days. Suppose a hen begins sitting on her eggs on the ' + ord(start) + ' of the month, and an egg is opened on the ' + ord(open) + '. How many days of incubation is that?', days, 'days', ['$' + open + ' - ' + start + ' = ' + days + '$ days.', days >= 3 ? 'By then, Aristotle says, the heart shows as a beating speck of blood.' : 'Aristotle says the first sign of the embryo comes after three days and nights.'], { chk: { f: 'egg', start: start, open: open } });
}
var B = {
  facts: [
    ['Aristotle studied the sea animals of a lagoon on the island of Lesbos.', true, 'At Pyrrha, around 345–343 BC.'],
    ['Aristotle classed the dolphin as a fish.', false, 'He saw that it breathes with lungs and suckles its young, and grouped it with live-bearing animals.'],
    ['Aristotle described about five hundred kinds of animals.', true, ''],
    ['Aristotle\'s split between blooded and bloodless animals matches the modern split into vertebrates and invertebrates.', true, 'Almost exactly.'],
    ['Aristotle thought the brain is the seat of thought.', false, 'He thought the heart was; he thought the brain cooled the blood.'],
    ['Aristotle believed species gradually change over time.', false, 'He thought each kind was fixed; Darwin (1859) showed that species change.'],
    ['Aristotle saw the chick\'s heart beating in the egg after about three days.', true, 'History of Animals VI.3.'],
    ['Some of Aristotle\'s octopus and dogfish reports were confirmed only in the 1800s.', true, ''],
    ['Darwin wrote that Linnaeus and Cuvier were "mere school-boys to old Aristotle".', true, 'In a letter to William Ogle, 1882.'],
    ['Aristotle wrote that men have more teeth than women.', true, 'A mistake that a count would have corrected.']
  ],
  items: [
    { q: 'What is the History of Animals?', r: 'A collection of facts about the parts, lives and behavior of hundreds of animals', w: ['A story of how animals were created', 'A book of fables like Aesop\'s', 'A list of animals sacrificed in temples'], why: '"History" here means inquiry.' },
    { q: 'Why, according to Parts of Animals I.5, should we study even humble animals?', r: 'Every realm of nature is marvellous, and each shows something natural and beautiful', w: ['They are useful for food', 'The gods commanded it', 'They are easier to catch'], why: 'Aristotle\'s defense of studying all animals.' },
    { q: 'How did Aristotle mostly explain animals\' parts in Parts of Animals?', r: 'By what each part is for', w: ['By the shapes of atoms', 'By the positions of the stars', 'By chance alone'], why: 'Final causes, along with necessity.' },
    { q: 'Who went on to write the first great books on plants?', r: 'Theophrastus, Aristotle\'s student', w: ['Plato', 'Hippocrates', 'Euclid'], why: 'He worked with Aristotle on Lesbos.' },
    { q: 'What did Darwin change in Aristotle\'s picture of animals?', r: 'Species are not fixed; they change and share common ancestors', w: ['Animals have no parts', 'Animals do not breathe', 'Dolphins are fish after all'], why: 'On the Origin of Species, 1859.' }
  ]
};
H.T(ID, B, [famFeature, famFeature, famAll, famGroup, famModern, famEgg].concat(dateFams(ID).slice(0, 2)), 0.6);
