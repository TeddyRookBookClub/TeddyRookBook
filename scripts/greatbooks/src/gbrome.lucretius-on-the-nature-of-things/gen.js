/* Lucretius, On the Nature of Things. Bank plus computed families: atoms lost from a worn ring per second, the random
   walk (distance grows as the square root of the steps), conservation of mass (nothing from nothing), counting atoms
   across a width, and which observation shows unseen bodies. chk carries the inputs. */
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = o.form || 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function mcc(q, right, wrongs, steps, o) { var p = H.mc(q, right, wrongs, steps, o); if (o && o.chk) p.chk = o.chk; return p; }
function cm(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function r2(x, d) { var k = Math.pow(10, d == null ? 2 : d); return Math.round(x * k) / k; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbrome.lucretius-on-the-nature-of-things';
function sci(v) { var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e); return m.toFixed(1) + ' \\times 10^{' + e + '}'; }
function famRing(R, lv) {
  var g = R.pick([0.02, 0.03, 0.05, 0.06, 0.1]), yrs = R.pick([10, 20, 30, 40, 50]), atoms = g * 3.06e21, secs = yrs * 365.25 * 86400, per = atoms / secs, perYear = atoms / yrs;
  if (lv === 1) return num('A gold ring wears away ' + g + ' g (' + r2(g * 1000, 0) + ' milligrams) in ' + yrs + ' years, a few atoms at a time, as Lucretius said. How many milligrams is that per year?', r2(g * 1000 / yrs, 3), 'mg', ['$' + r2(g * 1000, 0) + ' \\div ' + yrs + ' = ' + r2(g * 1000 / yrs, 3) + '$ mg a year: far too little to see from one day to the next.'], { rtol: 0.01, chk: { f: 'ringg', g: g, yrs: yrs } });
  return num('A gold ring loses ' + g + ' g in ' + yrs + ' years. A gram of gold has about $3.06 \\times 10^{21}$ atoms. About how many atoms does it lose per ' + (lv === 2 ? 'year' : 'second') + '? (Give the answer in a form like 2.5e11.)', lv === 2 ? +perYear.toPrecision(3) : +per.toPrecision(3), '', ['Atoms lost: $' + g + ' \\times 3.06 \\times 10^{21} = ' + sci(atoms) + '$.', lv === 2 ? 'Per year: $\\div ' + yrs + ' \\approx ' + sci(perYear) + '$.' : 'Seconds in ' + yrs + ' years: about $' + sci(secs) + '$. Per second: $\\approx ' + sci(per) + '$.'], { rtol: 0.03, hint: 'You can type 2.5e11 for 2.5 × 10¹¹.', chk: { f: 'ring', g: g, yrs: yrs, per: lv === 2 ? 'year' : 'sec' } });
}
function famWalk(R, lv) {
  var n = R.pick([4, 9, 16, 25, 36, 49, 64, 100, 144, 400, 900, 2500]), step = R.pick([1, 2, 3, 5]);
  return num('A speck is knocked one step of ' + step + ' micrometers in a random direction, ' + n + ' times. About how far from its start is it, typically? (For a random walk, the typical distance is the step times the square root of the number of steps.)', step * Math.sqrt(n), 'micrometers', ['$\\sqrt{' + n + '} = ' + Math.sqrt(n) + '$.', '$' + step + ' \\times ' + Math.sqrt(n) + ' = ' + step * Math.sqrt(n) + '$ micrometers. A random walk wanders slowly: ' + n + ' steps, but only ' + Math.sqrt(n) + ' steps\' worth of distance.'], { chk: { f: 'walk', n: n, step: step } });
}
function famMass(R, lv) {
  var wood = R.int(2, 9) * 100, ox = R.int(3, 12) * 100, ash = R.int(1, 5) * 10, gas = wood + ox - ash;
  if (lv === 1) return num('In a sealed jar, ' + wood + ' g of material and ' + ox + ' g of air are turned into new substances. Nothing gets in or out. What do the new substances weigh in all?', wood + ox, 'g', ['Nothing comes from nothing and nothing goes to nothing (Lucretius); in modern terms, mass is conserved (Lavoisier, 1789).', '$' + wood + ' + ' + ox + ' = ' + (wood + ox) + '$ g.'], { chk: { f: 'mass1', a: wood, b: ox } });
  return num('A log of ' + wood + ' g burns, using ' + ox + ' g of oxygen from the air. It leaves ' + ash + ' g of ash. What is the mass of the gases (smoke, carbon dioxide and water vapor) given off?', gas, 'g', ['The atoms are not destroyed, only rearranged: mass before = mass after.', '$' + wood + ' + ' + ox + ' - ' + ash + ' = ' + gas + '$ g.'], { chk: { f: 'mass', wood: wood, ox: ox, ash: ash } });
}
function famAcross(R, lv) {
  var obj = R.pick([['a human hair', 0.1], ['a sheet of paper', 0.1], ['a grain of fine sand', 0.2], ['a pinhead', 1]]), atom = 0.0000001, n = Math.round(obj[1] / atom);
  return num('An atom is about 0.1 nanometers (0.0000001 mm) across. About how many atoms would fit side by side across ' + obj[0] + ' ' + obj[1] + ' mm wide?', n, '', ['$' + obj[1] + ' \\div 0.0000001 = ' + texn(n) + '$.', 'About ' + cm(n) + ' atoms: Lucretius was right that they are far too small to see.'], { rtol: 0.01, chk: { f: 'across', w: obj[1] } });
}
var OBS = [['Wet clothes dry in the sun, though no one sees the water leave', 'Water leaves in particles too small to see'], ['A ring on the finger grows thinner over many years', 'Tiny bits wear off, too small to see one at a time'], ['We smell a scent from across a room', 'Small bodies travel from the scent to the nose'], ['Dripping water hollows a stone', 'The stone loses bits too small to see, drop by drop']];
function famObs(R, lv) {
  var o = R.pick(OBS);
  return mcc('Lucretius points to this: "' + o[0] + '." What does he think it shows?', o[1], ['The gods are at work', 'Things can come from nothing', 'Matter can be destroyed into nothing'].slice(0, lv === 1 ? 2 : 3), ['Lucretius: "Nature therefore works by unseen bodies."', o[1] + '.'], { chk: { f: 'obs', o: o[0] } });
}
var B = {
  facts: [
    ['Lucretius wrote On the Nature of Things as a poem.', true, 'In six books of Latin verse.'],
    ['Lucretius followed the teaching of Epicurus.', true, 'A Greek philosopher, 341–270 BC.'],
    ['Lucretius taught that atoms can be split into smaller pieces.', false, 'He thought they were indivisible; electrons (1897) and the nucleus (1911) showed otherwise.'],
    ['Lucretius discovered Brownian motion by watching dust in a sunbeam.', false, 'Dust is moved by air currents; Brownian motion was seen by Robert Brown in 1827 under a microscope.'],
    ['Einstein\'s 1905 paper and Perrin\'s 1908 measurements helped prove that atoms are real.', true, 'By explaining Brownian motion.'],
    ['The poem was rediscovered in 1417 by Poggio Bracciolini.', true, 'In a German monastery.'],
    ['Lucretius thought the Sun is about as big as it looks.', true, 'Following Epicurus; a mistake.'],
    ['Cicero mentioned the poem in a letter of 54 BC.', true, ''],
    ['Lucretius said things can come from nothing.', false, 'His first principle is that nothing comes from nothing.'],
    ['Lavoisier\'s conservation of mass (1789) agrees with Lucretius\'s first principles.', true, 'Matter is neither created nor destroyed in chemical change.']
  ],
  items: [
    { q: 'What did Lucretius hope his readers would gain from understanding nature?', r: 'Freedom from fear of the gods and of death', w: ['Riches', 'Victory in war', 'The power to work magic'], why: 'Epicurus taught that peace of mind is the aim of life.' },
    { q: 'What are the two things that, for Lucretius, everything is made of?', r: 'Atoms and the void', w: ['Earth and water', 'Fire and air', 'Numbers and shapes'], why: 'Atoms moving in empty space.' },
    { q: 'What is the "swerve" in Lucretius?', r: 'A tiny, unpredictable sideways motion of atoms, used to explain free will', w: ['A kind of comet', 'A curve in the Earth\'s surface', 'A poem form'], why: 'Book II.' },
    { q: 'Which later scientist revived atomism in the 1600s, drawing on Epicurus and Lucretius?', r: 'Pierre Gassendi', w: ['Ptolemy', 'Galen', 'Euclid'], why: 'Boyle and Newton also held atomist views.' },
    { q: 'What was right and what was wrong about Lucretius\'s sunbeam example?', r: 'Right idea (moving invisible bodies), wrong example (dust is pushed by air currents)', w: ['Right example, wrong idea', 'Both were wrong', 'Both were exactly right'], why: 'Real Brownian motion needs a microscope.' }
  ]
};
H.T(ID, B, [famRing, famWalk, famMass, famMass, famAcross, famObs].concat(dateFams(ID).slice(0, 2)), 0.6);
