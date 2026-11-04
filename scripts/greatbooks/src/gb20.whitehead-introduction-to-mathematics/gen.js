/* Whitehead: An Introduction to Mathematics. Bank (abstraction, variables, symbolism, the chapters, his life) plus
   computed families from the book's own topics: the period of sin(kx), products of complex numbers, i to a power,
   the sum of a geometric series, and the value of a function. */
var ID = 'gb20.whitehead-introduction-to-mathematics';
var B = {
  facts: [
    ['Whitehead wrote An Introduction to Mathematics for a series of short books for general readers.', true, 'The Home University Library, 1911.'],
    ['Whitehead and Bertrand Russell wrote Principia Mathematica together.', true, 'In three volumes, 1910–1913.'],
    ['Whitehead says mathematics is about particular things, never about "any" things.', false, 'The reverse: it began when someone proved propositions about any things.'],
    ['Whitehead argued that good notation lets us do important operations without thinking about them.', true, 'That, he says, is how civilization advances.'],
    ['Whitehead says we should always think carefully about every routine step we take.', false, 'He calls that a "profoundly erroneous truism."'],
    ['A variable is a symbol that stands for any number of a certain kind.', true, 'Like x in algebra.'],
    ['The sine function repeats every 360 degrees.', true, 'sin(x + 360°) = sin x.'],
    ['Whitehead later moved to Harvard and became a philosopher.', true, 'In 1924.'],
    ['Whitehead thought imaginary numbers were nonsense with no uses.', false, 'He explains them as numbers that obey the ordinary rules, and they became everyday tools.'],
    ['In Whitehead’s account, geometry was the great Greek mathematical science.', true, 'The Greeks first proved general propositions in geometry.'],
    ['Fourier showed that almost any repeating shape is a sum of sine waves.', true, 'A Fourier series.']
  ],
  items: [
    { q: 'According to Whitehead, when did mathematics as a science begin?', r: 'When someone first proved propositions about any things, without naming particular ones', w: ['When people first counted sheep', 'When the calculus was invented', 'When Whitehead and Russell began Principia', 'When numbers were first written down'], why: 'Probably a Greek, he says.' },
    { q: 'How does civilization advance, in Whitehead’s famous line?', r: 'By extending the number of important operations we can perform without thinking about them', w: ['By thinking harder about every step', 'By memorizing more facts', 'By building bigger machines', 'By studying only practical subjects'], why: 'Chapter V, The Symbolism of Mathematics.' },
    { q: 'Which word did Whitehead use for the tool that captures "any number"?', r: 'Variable', w: ['Constant', 'Axiom', 'Theorem', 'Fraction'], why: 'Chapter II is called Variables.' },
    { q: 'Which chapter title is in An Introduction to Mathematics?', r: 'Periodicity in Nature', w: ['The Origin of Species', 'The Uncertainty Principle', 'The Expanding Universe', 'The Wealth of Nations'], why: 'Chapter XII.' },
    { q: 'Whitehead compares operations of thought to what?', r: 'Cavalry charges in a battle: few, and saved for decisive moments', w: ['Rivers that never stop', 'Seeds in a garden', 'Bricks in a wall', 'Stars in the sky'], why: 'They need fresh horses, he adds.' },
    { q: 'Who proved in 1931 that no logical system can prove every true statement of arithmetic?', r: 'Kurt Gödel', w: ['Bertrand Russell', 'Henri Poincaré', 'G. H. Hardy', 'Albert Einstein'], why: 'A blow to the hope of building all mathematics on logic.' },
    { q: 'What is i² equal to?', r: '−1', w: ['1', '0', 'i', '2'], why: 'The imaginary unit is defined so that i² = −1.' }
  ]
};
function famPeriod(R, lv) {
  var k = R.pick([2, 3, 4, 5, 6, 8, 9, 10, 12]);
  if (R.next() < 0.5) return H.num('With x in degrees, after how many degrees does y = sin(' + k + 'x) repeat? (its period)', 360 / k,
    ['sin repeats when its input grows by 360°.', k + 'x grows by 360° when x grows by 360 ÷ ' + k + ' = ' + V(360 / k) + '°.'], { form: 360 % k ? 'dec' : 'int', rtol: 0.01, unit: '°' });
  return H.num('How many complete waves of y = sin(' + k + 'x) fit between x = 0° and x = 360°?', k, ['The period is 360 ÷ ' + k + '°, so ' + k + ' waves fit in one full turn.']);
}
function V(x) { return +(+x).toFixed(2); }
function famComplex(R, lv) {
  var a = R.int(-4, 5), b = R.int(1, 5), c = R.int(-4, 5), d = R.int(-5, -1);
  var re = a * c - b * d, im = a * d + b * c;
  var fmtC = function (x, y) { return x + (y < 0 ? ' − ' + (-y) : ' + ' + y) + 'i'; };
  var right = fmtC(re, im);
  return H.mc('Work out (' + fmtC(a, b) + ')(' + fmtC(c, d) + '), using i² = −1.', right,
    [fmtC(a * c + b * d, im), fmtC(re, a * d - b * c), fmtC(a * c, b * d), fmtC(re + 1, im)],
    ['Multiply out: ' + a + '·' + c + ' + ' + a + '·(' + d + 'i) + ' + b + 'i·' + c + ' + ' + b + 'i·(' + d + 'i).', '= ' + (a * c) + ' + ' + (a * d) + 'i + ' + (b * c) + 'i + ' + (b * d) + 'i².', 'Since i² = −1: = ' + right + '.']);
}
function famIPower(R, lv) {
  var n = R.int(2, lv === 1 ? 8 : 40), r = n % 4, val = ['1', 'i', '−1', '−i'][r];
  return H.mc('What is i<sup>' + n + '</sup>?', val, ['1', 'i', '−1', '−i'].filter(function (x) { return x !== val; }),
    ['Powers of i repeat every 4: i, −1, −i, 1, …', n + ' ÷ 4 leaves remainder ' + r + ', so i<sup>' + n + '</sup> = ' + val + '.']);
}
function famGeo(R, lv) {
  var a = R.pick([1, 2, 3, 5]), r = R.pick([2, 3]), n = R.int(4, lv === 1 ? 6 : 9), s = a * (Math.pow(r, n) - 1) / (r - 1);
  return H.num('Find the sum of the series ' + a + ' + ' + (a * r) + ' + ' + (a * r * r) + ' + … with ' + n + ' terms (each term ' + r + ' times the last).', s,
    ['Sum = a(rⁿ − 1)/(r − 1) = ' + a + '(' + r + '<sup>' + n + '</sup> − 1)/(' + r + ' − 1).', '= ' + a + ' × ' + (Math.pow(r, n) - 1) + ' ÷ ' + (r - 1) + ' = ' + s + '.']);
}
function famFunc(R, lv) {
  var a = R.int(1, 4), b = R.int(-5, 5), x = R.int(-3, 4), y = a * x * x + b;
  return H.num('A function links each x to y = ' + a + 'x² ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + '. What is y when x = ' + x + '?', y,
    [a + ' × (' + x + ')² = ' + (a * x * x) + '.', (a * x * x) + (b < 0 ? ' − ' + (-b) : ' + ' + b) + ' = ' + y + '.']);
}
H.T(ID, B, [famPeriod, famComplex, famIPower, famGeo, famFunc, function (R, lv) { return H.famWhen(R, lv, ID); }], 0.55);
