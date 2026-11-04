/* Dobzhansky: Genetics and the Origin of Species (no excerpts: 1937). Bank (the synthesis, the flies, isolating
   mechanisms, the people) plus computed families: Hardy–Weinberg proportions (both directions), the chance of losing an
   allele by drift in one generation, and one generation of selection on allele frequency. */
var ID = 'gb20.dobzhansky-genetics';
var B = {
  facts: [
    ['Genetics and the Origin of Species (1937) joined Darwin’s natural selection with Mendel’s genetics.', true, 'The founding book of the modern synthesis.'],
    ['Dobzhansky studied wild populations of the fruit fly Drosophila pseudoobscura.', true, 'Their chromosome arrangements varied from place to place.'],
    ['Genetic drift is strongest in very large populations.', false, 'It is strongest in small ones, where chance matters most.'],
    ['Dobzhansky defined evolution as a change in the genetic make-up of populations.', true, 'Not of single individuals.'],
    ['Reproductive isolation means two populations no longer interbreed.', true, 'Dobzhansky named and sorted the isolating mechanisms.'],
    ['A mule is an example of a sterile hybrid, one kind of isolating mechanism.', true, 'Horse and donkey stay separate species.'],
    ['Before the synthesis, many geneticists thought Mendel’s genes and Darwin’s gradual selection were rivals.', true, 'Dobzhansky helped show they fit together.'],
    ['Dobzhansky came to the United States in 1927 to work in Thomas Hunt Morgan’s fly laboratory.', true, 'At Columbia, then Caltech.'],
    ['Fisher, Haldane and Wright worked out the mathematics of selection in populations.', true, 'In the 1920s and early 1930s.'],
    ['Wild populations, Dobzhansky found, are nearly uniform, with little hidden variation.', false, 'They are full of hidden variation.'],
    ['Mutation supplies the raw material of evolution.', true, 'New alleles and chromosome changes.'],
    ['Dobzhansky was born in what is now Ukraine.', true, 'In Nemyriv, in 1900.']
  ],
  items: [
    { q: 'What is the "modern synthesis"?', r: 'The joining of natural selection with Mendelian genetics', w: ['A way of making new chemicals', 'A theory of the atom', 'A new method of classifying stars', 'The idea that species never change'], why: 'Built in the 1930s and 1940s.' },
    { q: 'What is genetic drift?', r: 'Random change in how common a gene version is, strongest in small populations', w: ['Genes moving from one chromosome to another', 'Animals migrating with the seasons', 'Selection for the fittest', 'Mutation caused by radiation'], why: 'Sewall Wright’s idea, taken up by Dobzhansky.' },
    { q: 'What makes two populations separate species, for Dobzhansky?', r: 'They are reproductively isolated: they no longer interbreed', w: ['They look different', 'They live far apart', 'They eat different foods', 'They have different names'], why: 'Isolating mechanisms keep their gene pools apart.' },
    { q: 'Which is an isolating mechanism?', r: 'Different courtship displays, so the animals don’t mate', w: ['A shared water hole', 'A common ancestor', 'A long life span', 'A large population'], why: 'Others: different seasons, sterile or weak hybrids.' },
    { q: 'Whose lab did Dobzhansky join in America?', r: 'Thomas Hunt Morgan’s', w: ['Charles Darwin’s', 'Gregor Mendel’s', 'Louis Pasteur’s', 'Niels Bohr’s'], why: 'The fruit-fly lab, first at Columbia, then Caltech.' },
    { q: 'Which later books extended the synthesis?', r: 'Mayr (1942), Huxley (1942), Simpson (1944)', w: ['Darwin (1859), Wallace (1858)', 'Newton (1687), Huygens (1690)', 'Freud (1900), James (1890)', 'Smith (1776), Marx (1867)'], why: 'To classification, fossils and more.' }
  ]
};
function r2(x) { return +x.toFixed(2); }
function famHW(R, lv) {
  var q = R.pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]), p = r2(1 - q);
  var ask = R.pick(['AA', 'Aa', 'aa']), val = ask === 'AA' ? p * p : ask === 'Aa' ? 2 * p * q : q * q;
  return H.num('A gene has versions A (frequency p = ' + p + ') and a (q = ' + q + '). With random mating (Hardy–Weinberg), what percent of individuals are ' + ask + '?', Math.round(val * 100),
    ['AA: p² = ' + r2(p * p) + '; Aa: 2pq = ' + r2(2 * p * q) + '; aa: q² = ' + r2(q * q) + '.', ask + ' is ' + Math.round(val * 100) + '%.'], { unit: '%' });
}
function famHWBack(R, lv) {
  var q = R.pick([0.1, 0.2, 0.3, 0.4, 0.5]), p = r2(1 - q), aa = Math.round(q * q * 100);
  return H.num(aa + '% of a population show a recessive trait (aa). Assuming Hardy–Weinberg proportions, what percent are hidden carriers (Aa)?', Math.round(2 * p * q * 100),
    ['q² = ' + (aa / 100) + ', so q = ' + q + ' and p = ' + p + '.', '2pq = 2 × ' + p + ' × ' + q + ' = ' + r2(2 * p * q) + ', or ' + Math.round(2 * p * q * 100) + '%.'], { unit: '%' });
}
function famLoss(R, lv) {
  var n = R.pick([2, 3, 4, 5, 6]), pr = Math.pow(0.5, n);
  return H.mc('A tiny population carries ' + n + ' gene copies; A is half of them. Each copy in the next generation is drawn at random (A with chance 1/2). What is the chance A is lost in one generation?', '1/' + Math.pow(2, n),
    ['1/' + (2 * n), '1/' + Math.pow(2, n + 1), '1/2', '1/' + n], ['Every one of the ' + n + ' copies must be a: (1/2)<sup>' + n + '</sup> = 1/' + Math.pow(2, n) + '.']);
}
function famSel(R, lv) {
  var p = R.pick([0.2, 0.3, 0.4, 0.5]), s = R.pick([0.1, 0.2, 0.5]), np = p * (1 + s) / (p * (1 + s) + (1 - p));
  return H.num('Version A has frequency ' + p + '. Carriers of A leave ' + Math.round(s * 100) + '% more offspring per copy. After one generation, what is A’s frequency? Use p′ = p(1 + s) / [p(1 + s) + (1 − p)], 3 decimal places.', +np.toFixed(3),
    ['p(1 + s) = ' + p + ' × ' + (1 + s) + ' = ' + +(p * (1 + s)).toFixed(3) + '.', 'Denominator = ' + +(p * (1 + s)).toFixed(3) + ' + ' + +(1 - p).toFixed(2) + ' = ' + +(p * (1 + s) + 1 - p).toFixed(3) + '.', 'p′ ≈ ' + np.toFixed(3) + '.'], { form: 'dec', rtol: 0.005 });
}
H.T(ID, B, [famHW, famHWBack, famLoss, famSel, function (R, lv) { return H.famBefore(R, lv, ID); }], 0.5);
