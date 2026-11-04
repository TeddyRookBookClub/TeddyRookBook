/* Hardy: A Mathematician's Apology (no excerpts: 1940). Bank (the argument, his tests for beauty, his life,
   Ramanujan, the twists of history) plus computed families: Euclid's construction (product of primes plus 1 and its
   remainders), is it prime, the steps of the √2 proof, and the taxicab number. */
var ID = 'gb20.hardy-mathematicians-apology';
var B = {
  facts: [
    ['In A Mathematician’s Apology, "apology" means a defense, as in Plato’s Apology.', true, 'Not saying sorry.'],
    ['Hardy defended pure mathematics chiefly for its usefulness in industry.', false, 'He defended it for its beauty, and called real mathematics almost useless.'],
    ['Hardy chose Euclid’s proof that there are infinitely many primes as an example of a beautiful theorem.', true, 'With the proof that √2 is irrational.'],
    ['Hardy believed mathematicians discover truths that exist independently of us.', true, 'A Platonist view.'],
    ['Hardy brought Srinivasa Ramanujan from Madras to Cambridge.', true, 'After Ramanujan’s letter of 1913.'],
    ['Hardy worked for about thirty-five years with J. E. Littlewood.', true, 'One of the great partnerships in mathematics.'],
    ['Number theory has turned out to have no practical uses at all.', false, 'It became the basis of public-key cryptography such as RSA (1977).'],
    ['The Hardy–Weinberg rule of genetics is named for G. H. Hardy.', true, 'From a short 1908 letter to Science.'],
    ['Hardy wrote the Apology as a young man at the start of his career.', false, 'He wrote it in 1940, at 62, after a heart attack.'],
    ['Hardy said mathematics is a young person’s game.', true, 'Critics point to many who did great work later.'],
    ['C. P. Snow wrote a well-known foreword to later editions of the Apology.', true, 'From 1967.'],
    ['In Euclid’s proof, the number formed (the product of the listed primes, plus 1) must always be prime.', false, 'It need not be; it only has a prime factor not on the list. 30,031 = 59 × 509.']
  ],
  items: [
    { q: 'What qualities did Hardy say a great theorem must have?', r: 'Seriousness, generality and depth', w: ['Usefulness, cheapness and speed', 'Length, difficulty and novelty', 'Popularity, simplicity and age', 'Accuracy, size and color'], why: 'And a proof with surprise, inevitability and economy.' },
    { q: 'Why did Hardy take comfort in the uselessness of number theory?', r: 'He thought useless mathematics could not be used for war', w: ['It made him rich', 'It was easy', 'It was popular', 'It needed no proofs'], why: 'He was a lifelong opponent of war.' },
    { q: 'Which two proofs does Hardy give as models of beauty?', r: 'Infinitely many primes, and √2 is irrational', w: ['The Pythagorean theorem and the area of a circle', 'Fermat’s last theorem and the four-color theorem', 'E = mc² and F = ma', 'The law of falling bodies and the law of the lever'], why: 'Both Greek, both short.' },
    { q: 'Who was Ramanujan?', r: 'A self-taught mathematician from India whom Hardy brought to Cambridge', w: ['Hardy’s teacher at school', 'A physicist who worked on the atom', 'The publisher of the Apology', 'A cricket player Hardy admired'], why: 'They worked together from 1914 to 1919.' },
    { q: 'What kind of argument is the proof that √2 is irrational?', r: 'Proof by contradiction', w: ['Proof by measurement', 'Proof by example', 'Proof by authority', 'Proof by induction'], why: 'Assume it is a fraction in lowest terms and reach an impossibility.' },
    { q: 'Where did Hardy spend most of his career?', r: 'Trinity College, Cambridge', w: ['Harvard', 'The Sorbonne', 'Göttingen', 'Princeton'], why: 'With twelve years at Oxford, 1919–1931.' }
  ]
};
var PR = [2, 3, 5, 7, 11, 13];
function famEuclid(R, lv) {
  var k = R.int(2, lv === 1 ? 4 : 6), list = PR.slice(0, k), N = list.reduce(function (a, b) { return a * b; }, 1) + 1;
  if (R.next() < 0.5) return H.num('Euclid’s step: multiply the primes ' + list.join(', ') + ' and add 1. What number do you get?', N,
    [list.join(' × ') + ' = ' + (N - 1) + '.', (N - 1) + ' + 1 = ' + N + '.']);
  var p = R.pick(list);
  return H.num('N = ' + list.join(' × ') + ' + 1 = ' + N + '. What is the remainder when N is divided by ' + p + '?', 1,
    [list.join(' × ') + ' is a multiple of ' + p + ', so adding 1 leaves remainder 1.', 'That is why no listed prime divides N.']);
}
function famPrime(R, lv) {
  var pool = [[31, true], [97, true], [91, false], [51, false], [57, false], [89, true], [2311, true], [30031, false], [101, true], [221, false], [143, false], [211, true]];
  var x = R.pick(pool), f = function (n) { for (var d = 2; d * d <= n; d++) if (n % d === 0) return d; return 0; }, d = f(x[0]);
  return H.tf(x[0] + ' is a prime number.', x[1], x[1] ? 'No whole number from 2 up to √' + x[0] + ' divides it.' : x[0] + ' = ' + d + ' × ' + (x[0] / d) + '.');
}
function famRoot2(R, lv) {
  var steps = ['Suppose √2 = a/b in lowest terms.', 'Then a² = 2b², so a is even.', 'Write a = 2c; then b² = 2c², so b is even.', 'Both even contradicts lowest terms, so √2 is not a fraction.'];
  var i = R.int(1, 3), right = steps[i];
  return H.mc('In the proof that √2 is irrational, which step comes right after: "' + steps[i - 1] + '"?', right,
    steps.filter(function (s, j) { return j !== i; }).concat(['So √2 = 1.5.']), ['The proof runs: ' + steps.join(' ')]);
}
function famTaxi(R, lv) {
  return H.mc('Hardy once told Ramanujan his taxi’s number, 1729, seemed dull. Ramanujan replied that it is the smallest number that is the sum of two cubes in two ways. Which pair works?', '1³ + 12³ and 9³ + 10³',
    ['1³ + 10³ and 9³ + 12³', '2³ + 12³ and 8³ + 10³', '10³ + 10³ and 7³ + 13³'], ['1 + 1728 = 1729 and 729 + 1000 = 1729.']);
}
H.T(ID, B, [famEuclid, famPrime, famRoot2, famTaxi, function (R, lv) { return H.famWhoWrote(R, lv, ID); }], 0.45);
