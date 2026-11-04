/* Darwin, On the Origin of Species (gbw4). Families: geometric increase (computed, after Darwin's Chapter III), selection
   arithmetic (computed), the steps of the argument, chapters, terms, who said what (our summaries), dates. Uses H.k19. */
var ID = 'gb19.darwin-origin-of-species';
function famGrow(R, lv) {
  var r = R.next();
  if (r < 0.4) { var y = R.int(lv === 1 ? 3 : 8, lv === 1 ? 8 : 20), v = Math.pow(2, y); return H.num('Darwin\'s Chapter III: a plant makes 2 seeds a year, every seed grows, and each new plant does the same. Starting from 1 plant, how many plants after ' + y + ' years?', v, ['It doubles each year: $2^{' + y + '} = ' + v + '$.', 'Darwin: with only two seeds a year, in twenty years there would be a million plants ($2^{20} = 1{,}048{,}576$).'], { hint: 'Doubling each year: 2 to the power of the number of years.' }); }
  if (r < 0.7) { var k = R.pick([2, 3, 4]), g = R.int(2, lv === 1 ? 4 : 6), v2 = Math.pow(k, g); return H.num('A pair of animals has young so that each generation is ' + k + ' times as large as the last, if all survive. Starting with 1 pair, how many pairs after ' + g + ' generations?', v2, ['$' + k + '^{' + g + '} = ' + v2 + '$.', 'Darwin\'s point: since numbers do not grow like this, most young must die before they breed: a struggle for existence.']); }
  var n = R.int(4, 10) * 100, s = R.pick([10, 20, 25, 50]), surv = n * s / 100;
  return H.num('Of ' + n + ' seedlings in a patch of ground, only ' + s + '% survive to make seeds. How many is that?', surv, ['$' + n + ' \\times ' + (s / 100) + ' = ' + surv + '$.']);
}
function famSel(R, lv) {
  var a = R.int(2, 8) * 10, b = 100 - a, sa = R.pick([90, 80]), sb = R.pick([50, 40]), A = a * sa / 100, Bv = b * sb / 100, pct = Math.round(A / (A + Bv) * 100);
  return H.num('100 beetles: ' + a + ' dark and ' + b + ' light, on dark ground. Birds catch the easy-to-see ones, so ' + sa + '% of dark and ' + sb + '% of light beetles survive. What percent of the survivors are dark? (Round to a whole percent.)', pct, ['Dark survivors: $' + a + ' \\times ' + (sa / 100) + ' = ' + A + '$.', 'Light survivors: $' + b + ' \\times ' + (sb / 100) + ' = ' + Bv + '$.', 'Share dark: $' + A + ' \\div ' + (A + Bv) + ' \\approx ' + pct + '\\%$, up from ' + a + '%.'], { hint: 'Count survivors of each kind, then divide.', unit: '%' });
}
var STEPS = ['Living things vary', 'Many variations are inherited', 'More are born than can survive', 'A struggle for existence follows', 'Useful variations are preserved more often', 'Over long ages, new species arise'];
var CH = [['Variation under Domestication', 'breeders\' pigeons, dogs and crops'], ['Struggle for Existence', 'more are born than can survive'], ['Natural Selection', 'the preservation of favorable variations'], ['Difficulties on Theory', 'the eye, and how complex organs could arise'], ['On the Imperfection of the Geological Record', 'why the fossil record has gaps'], ['Geographical Distribution', 'island species and how they spread'], ['Recapitulation and Conclusion', '"one long argument" summed up']];
var WHO = [
  ['There is grandeur in this view of life.', 'Darwin', 'The last paragraph of the Origin.'],
  ['Population, when unchecked, increases in a geometrical ratio.', 'Thomas Malthus', 'Darwin read Malthus in 1838; it gave him the key to natural selection.'],
  ['Species arise by natural selection, as I too have concluded from my travels in the Malay islands.', 'Alfred Russel Wallace', 'His essay, with Darwin\'s, was read in 1858.'],
  ['The Earth\'s surface was shaped slowly by causes still at work today.', 'Charles Lyell', 'Principles of Geology, which Darwin took on the Beagle.'],
  ['Heredity comes in units passed on unchanged, in fixed ratios.', 'Gregor Mendel', 'Mendel\'s 1866 paper, rediscovered in 1900, filled the gap in Darwin\'s theory.']
];
var TERMS = [['natural selection', 'the preservation of favorable variations and the rejection of harmful ones'], ['struggle for existence', 'competition for life, in a broad sense, since more are born than survive'], ['variation', 'differences among members of a species'], ['descent with modification', 'Darwin\'s phrase for evolution: species descend from ancestors and change'], ['artificial selection', 'breeders choosing which animals or plants have young']];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['On the Origin of Species was published on November 24, 1859.', true, 'By John Murray, London; the first printing sold out.'],
    ['Darwin sailed around the world on HMS Beagle, 1831 to 1836.', true, 'Including the Galápagos Islands in 1835.'],
    ['Darwin knew how genes work.', false, 'He did not; Mendel\'s work was rediscovered in 1900, and DNA\'s structure in 1953.'],
    ['Alfred Russel Wallace reached the idea of natural selection on his own.', true, 'Their papers were presented together in 1858.'],
    ['Darwin began the book by discussing breeders of pigeons and other domestic animals.', true, 'Chapter I, Variation under Domestication.'],
    ['The first edition used the word "evolved" only once, as the very last word.', true, '"...have been, and are being, evolved."'],
    ['Darwin thought new species appear suddenly, in one generation.', false, 'By slow steps over long ages.'],
    ['Darwin called the Origin "one long argument."', true, 'In the last chapter.']
  ],
  items: [
    { q: 'What is natural selection, in Darwin\'s words?', r: 'The preservation of favourable variations and the rejection of injurious variations', w: ['Choosing the prettiest animals for a zoo', 'Living things changing because they want to', 'Breeders mixing two species'], why: 'Chapter IV.' },
    { q: 'Which book gave Darwin the idea of the struggle for existence?', r: 'Malthus\'s Essay on the Principle of Population', w: ['Newton\'s Principia', 'Euclid\'s Elements', 'Smith\'s Wealth of Nations'], why: 'He read it in 1838.' },
    { q: 'Why did Darwin start with domestic pigeons and dogs?', r: 'Breeders show how much selection can change a species over generations', w: ['He did not travel', 'Wild animals were too rare', 'He disliked wild animals'], why: 'Artificial selection as a model for natural selection.' },
    { q: 'What was the biggest gap in Darwin\'s theory?', r: 'He did not know how traits are inherited', w: ['He had no examples', 'He ignored fossils', 'He thought the Earth was young'], why: 'Genetics later filled it, in the "modern synthesis" of the 1930s and 1940s.' },
    { q: 'Which islands\' finches and tortoises puzzled Darwin after the Beagle voyage?', r: 'The Galápagos', w: ['The Azores', 'Hawaii', 'The British Isles'], why: 'Each island had its own forms.' },
    { q: 'What does today\'s biology say about Darwin\'s central idea?', r: 'Evolution by natural selection is the foundation of modern biology, confirmed by genetics and fossils', w: ['It was disproved in 1900', 'It is about the stars', 'It only applies to plants'], why: 'Darwin was wrong on some details, such as how inheritance works.' }
  ]
};
H.T(ID, B, [famGrow, famGrow, famSel,
  function (R, lv) { return H.k19.seq(STEPS, 'Darwin\'s argument for natural selection', 'step', R, lv); },
  function (R, lv) { return H.k19.pairs(CH, function (a) { return 'What is the Origin\'s chapter <b>' + a + '</b> about?'; }, function (b) { return 'Which chapter of the Origin is about <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.pairs(TERMS, function (a) { return 'In Darwin, what is <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
