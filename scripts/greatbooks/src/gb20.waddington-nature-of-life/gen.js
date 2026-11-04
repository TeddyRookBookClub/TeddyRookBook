/* Waddington: The Nature of Life (no excerpts: 1961). Bank (epigenetics, the landscape, canalization, genetic
   assimilation, his life, later science) plus computed families: cell numbers after n divisions and rounds needed,
   the chance of reaching an intended fate through several forks, and counting the fates of a branching landscape. */
var ID = 'gb20.waddington-nature-of-life';
var B = {
  facts: [
    ['Waddington coined the word "epigenetics" for how genes act in development to produce traits.', true, 'In 1942.'],
    ['In Waddington’s landscape, a ball rolling down branching valleys stands for a developing cell.', true, 'Each valley floor is a kind of cell.'],
    ['Canalization means development is easily knocked off course by small upsets.', false, 'The reverse: development is buffered against small upsets.'],
    ['Nearly every cell in a body carries the same genes.', true, 'Different genes are switched on in different cells.'],
    ['In genetic assimilation, a trait first produced by heat shock appeared without it after generations of selection.', true, 'Waddington’s crossveinless fruit flies, early 1950s.'],
    ['Waddington argued that traits acquired in a lifetime are passed on directly, as Lamarck thought.', false, 'Genetic assimilation works by ordinary selection on hidden genetic variation.'],
    ['Waddington was professor of animal genetics at Edinburgh.', true, 'From 1947 to 1970.'],
    ['Harvey’s word "epigenesis" means building an embryo step by step.', true, 'The root of Waddington’s word.'],
    ['Stem-cell researchers still use Waddington’s landscape picture.', true, 'To explain pushing cells back "uphill."'],
    ['Waddington thought development, genes and evolution are best studied completely apart.', false, 'He argued they can’t be understood apart.'],
    ['The Nature of Life was published in 1961.', true, 'A short book for general readers.']
  ],
  items: [
    { q: 'Why do a nerve cell and a muscle cell differ, if they have the same genes?', r: 'Different genes are switched on in them', w: ['They have different DNA', 'One has lost its genes', 'They come from different parents', 'Muscles have more chromosomes'], why: 'Gene action depends on the cell’s history and surroundings.' },
    { q: 'In the epigenetic landscape, what shapes the hills and valleys?', r: 'The action of many genes pulling together', w: ['The weather', 'The parents’ habits', 'Gravity alone', 'A single master gene'], why: 'Like guy ropes under a tent.' },
    { q: 'What did Waddington call the buffering that makes development reliable?', r: 'Canalization', w: ['Assimilation', 'Mutation', 'Selection', 'Adaptation'], why: 'Deep valleys.' },
    { q: 'What was the trait in Waddington’s genetic assimilation experiment?', r: 'A missing cross vein in fruit-fly wings', w: ['Eye color in mice', 'Height in pea plants', 'Beak size in finches', 'Fur color in rabbits'], why: 'First caused by heat shock, later appearing without it.' },
    { q: 'Whose 2006 discovery of how to turn adult cells back into stem cells is often explained with Waddington’s picture?', r: 'Shinya Yamanaka', w: ['James Watson', 'Gregor Mendel', 'Theodosius Dobzhansky', 'Erwin Schrödinger'], why: 'It earned a Nobel Prize in 2012.' },
    { q: 'What does epigenetics often mean today, in a narrower sense?', r: 'Chemical marks on DNA and its packaging that switch genes on and off', w: ['The study of fossils', 'Gene changes caused only by mutation', 'The study of planets', 'Breeding animals for show'], why: 'A modern use of Waddington’s word.' }
  ]
};
function famCells(R, lv) {
  var n = R.int(3, lv === 1 ? 10 : 20);
  if (R.next() < 0.5) return H.num('A fertilized egg divides, and every cell divides again each round. How many cells are there after ' + n + ' rounds?', Math.pow(2, n),
    ['After n rounds there are 2ⁿ cells.', '2<sup>' + n + '</sup> = ' + Math.pow(2, n).toLocaleString('en-US') + '.']);
  var target = Math.pow(2, n) - R.int(1, Math.pow(2, n - 1) - 1);
  return H.num('Cells double every round, starting from one. What is the fewest number of rounds needed to reach at least ' + target.toLocaleString('en-US') + ' cells?', n,
    ['2<sup>' + (n - 1) + '</sup> = ' + Math.pow(2, n - 1).toLocaleString('en-US') + ' is too few.', '2<sup>' + n + '</sup> = ' + Math.pow(2, n).toLocaleString('en-US') + ' is enough, so ' + n + ' rounds.']);
}
function famForks(R, lv) {
  var p = R.pick([0.99, 0.95, 0.9, 0.8, 0.7, 0.6]), k = R.int(2, lv === 1 ? 2 : 4), v = Math.pow(p, k);
  return H.num('At each fork in the landscape a cell follows its signal with probability ' + p + '. What is the chance (in percent, 1 decimal place) that it follows the signal at all ' + k + ' forks?', +(v * 100).toFixed(1),
    [p + '<sup>' + k + '</sup> = ' + v.toFixed(4) + '.', 'That is ' + (v * 100).toFixed(1) + '%.'], { form: 'dec', rtol: 0.005, unit: '%' });
}
function famFates(R, lv) {
  var k = R.int(2, 6);
  return H.num('In a landscape where every valley splits in two at each fork, how many different end valleys (cell fates) are there after ' + k + ' levels of forks?', Math.pow(2, k),
    ['Each fork doubles the number of valleys: 2<sup>' + k + '</sup> = ' + Math.pow(2, k) + '.']);
}
H.T(ID, B, [famCells, famForks, famFates, function (R, lv) { return H.famBefore(R, lv, ID); }], 0.5);
