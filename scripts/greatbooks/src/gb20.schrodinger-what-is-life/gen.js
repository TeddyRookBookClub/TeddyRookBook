/* Schrödinger: What Is Life? (no excerpts: 1944). Bank (the lectures, the √n law, the gene puzzle, the code-script,
   negative entropy, the influence on DNA) plus computed families: the √n error and its percentage, counting codes
   from a few symbols, and entropy bookkeeping (living thing plus surroundings). */
var ID = 'gb20.schrodinger-what-is-life';
var B = {
  facts: [
    ['What Is Life? grew from public lectures Schrödinger gave at Trinity College, Dublin, in 1943.', true, 'The book appeared in 1944.'],
    ['Schrödinger argued that the exact laws of physics are statistical, averages over huge numbers of molecules.', true, 'The √n law.'],
    ['By the √n law, a count of 100 random molecules is typically off by about 10%.', true, '√100 = 10, and 10 is 10% of 100.'],
    ['Schrödinger proposed that the gene is an aperiodic crystal carrying a code-script.', true, 'An orderly structure whose units do not simply repeat.'],
    ['Living things break the second law of thermodynamics.', false, 'They take order from their surroundings; total disorder still grows.'],
    ['Schrödinger used Morse code to show how a few symbols can make many messages.', true, 'Two signs in groups of up to four give 30 codes.'],
    ['Crick, Watson and Wilkins each said What Is Life? helped turn them toward the gene.', true, 'They shared the Nobel Prize for DNA’s structure.'],
    ['Schrödinger knew that DNA carries the genes.', false, 'He thought the gene was probably a protein; DNA’s role was being shown in 1944.'],
    ['Schrödinger built on Max Delbrück’s model of the gene as a stable molecule.', true, 'Stability from quantum energy barriers.'],
    ['In Schrödinger’s account, mutations are like quantum jumps of the gene molecule.', true, 'Rare, sudden and lasting changes.'],
    ['Schrödinger created the wave equation of quantum mechanics in 1926.', true, 'He shared the 1933 Nobel Prize.'],
    ['An ordinary repeating crystal, like salt, is a good way to store a long message.', false, 'Repeating the same unit says very little; that is why he proposed an aperiodic crystal.']
  ],
  items: [
    { q: 'Why, according to Schrödinger, must organisms be large compared with atoms?', r: 'So that the statistical laws governing them are accurate', w: ['So that they can be seen', 'So that gravity can hold them together', 'Because atoms are sticky', 'Because big things live longer'], why: 'Errors shrink like 1/√n.' },
    { q: 'What did Schrödinger call the structure he thought holds the genetic plan?', r: 'An aperiodic crystal', w: ['A perfect sphere', 'A liquid crystal', 'A repeating lattice', 'A gas cloud'], why: 'Units that do not repeat can carry a code-script.' },
    { q: 'What do living things "feed on," in Schrödinger’s phrase?', r: 'Negative entropy, that is, order', w: ['Pure energy only', 'Light alone', 'Heat', 'Nothing; they make order from nothing'], why: 'Physicists would say free energy, as he later agreed.' },
    { q: 'What surprised Schrödinger about genes?', r: 'They are very small yet copied faithfully for many generations', w: ['They are very large', 'They change every day', 'They are made of metal', 'They are only found in plants'], why: 'Small things should be shaky by the √n law.' },
    { q: 'How does life produce its order, in Schrödinger’s summary?', r: 'Order from order, guided by the gene’s code', w: ['Order from random jostling alone', 'Disorder from order', 'Order from nothing', 'By breaking the laws of physics'], why: 'Unlike the statistical order of a gas.' },
    { q: 'Who later found that DNA carries genes (1944)?', r: 'Avery, MacLeod and McCarty', w: ['Schrödinger and Delbrück', 'Watson and Crick', 'Darwin and Wallace', 'Bohr and Einstein'], why: 'Watson and Crick found DNA’s structure in 1953.' }
  ]
};
function famRoot(R, lv) {
  var N = R.pick([100, 10000, 1000000, 100000000, 400, 2500, 90000]), s = Math.sqrt(N);
  if (R.next() < 0.5) return H.num('By Schrödinger’s √n law, a count of ' + N.toLocaleString('en-US') + ' random molecules is typically off by about how many?', s,
    ['√' + N.toLocaleString('en-US') + ' = ' + s.toLocaleString('en-US') + '.']);
  var pct = 100 / s;
  return H.num('By the √n law, a count of ' + N.toLocaleString('en-US') + ' molecules is off by about √n. What percentage of the count is that?', +pct.toFixed(4),
    ['√n = ' + s.toLocaleString('en-US') + '.', s.toLocaleString('en-US') + ' ÷ ' + N.toLocaleString('en-US') + ' × 100 = ' + +pct.toFixed(4) + '%.'], { form: 'dec', rtol: 0.01, unit: '%' });
}
function famCodes(R, lv) {
  var k = R.pick([2, 3, 4]), L = R.int(2, lv === 1 ? 3 : 5);
  if (R.next() < 0.5 || k !== 2) return H.num('A code uses ' + k + ' kinds of symbol. How many different strings of exactly ' + L + ' symbols can it make?', Math.pow(k, L),
    [k + ' choices for each of ' + L + ' places: ' + k + '<sup>' + L + '</sup> = ' + Math.pow(k, L) + '.']);
  var tot = 0, parts = []; for (var i = 1; i <= L; i++) { tot += Math.pow(2, i); parts.push(Math.pow(2, i)); }
  return H.num('With Morse code’s two signs (dot and dash), how many different groups of 1 to ' + L + ' signs are there?', tot,
    ['Groups of 1, 2, … ' + L + ': ' + parts.join(' + ') + ' = ' + tot + '.']);
}
function famEntropy(R, lv) {
  var dOrg = -R.int(1, 9) * 10, dSur = R.int(Math.abs(dOrg) / 10 + 1, 20) * 10;
  return H.num('A growing plant lowers its own entropy by ' + Math.abs(dOrg) + ' J/K and, by giving off heat, raises its surroundings’ entropy by ' + dSur + ' J/K. What is the total change in entropy (J/K)?', dOrg + dSur,
    [dOrg + ' + ' + dSur + ' = ' + (dOrg + dSur) + ' J/K.', 'Positive: the total still grows, as the second law requires.'], { unit: 'J/K' });
}
H.T(ID, B, [famRoot, famCodes, famEntropy, function (R, lv) { return H.famBefore(R, lv, ID); }], 0.5);
