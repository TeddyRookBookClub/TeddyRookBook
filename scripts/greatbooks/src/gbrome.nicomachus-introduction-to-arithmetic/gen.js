/* Nicomachus, Introduction to Arithmetic. Bank plus computed families: deficient, perfect and superabundant numbers
   (I.14–16), the sum of a number's parts, figurate numbers (II.8–17), cubes from odd numbers (II.20), Nicomachus's kinds
   of even number (I.8–10), the three means (II.22–27), the sieve (I.13) and ratio names (I.18–23). chk carries inputs. */
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = o.form || 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function mcc(q, right, wrongs, steps, o) { var p = H.mc(q, right, wrongs, steps, o); if (o && o.chk) p.chk = o.chk; return p; }
function cm(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function r2(x, d) { var k = Math.pow(10, d == null ? 2 : d); return Math.round(x * k) / k; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbrome.nicomachus-introduction-to-arithmetic';
function parts(n) { var o = []; for (var d = 1; d < n; d++) if (n % d === 0) o.push(d); return o; }
function sum(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
function famKind(R, lv) {
  var n = R.pick(lv === 1 ? [6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24, 28] : [6, 28, 496].concat([R.int(10, 99), R.int(10, 99), R.int(30, 120), 12, 18, 20, 24, 30, 36, 40, 42, 48, 54, 56, 60, 66, 70, 72, 78, 80, 84, 88, 90, 96, 100]));
  var p = parts(n), s = sum(p), k = s < n ? 'Deficient' : s === n ? 'Perfect' : 'Superabundant';
  return mcc('Nicomachus sorts numbers by adding their parts (the smaller numbers that divide them). Is ' + n + ' deficient, perfect or superabundant?', k, ['Deficient', 'Perfect', 'Superabundant'], ['Parts of ' + n + ': ' + p.join(', ') + '.', 'They add to ' + s + (s < n ? ', less than ' + n + '.' : s === n ? ', exactly ' + n + '.' : ', more than ' + n + '.')], { chk: { f: 'kind', n: n } });
}
function famParts(R, lv) {
  var n = R.int(lv === 1 ? 6 : 12, lv === 1 ? 30 : lv === 2 ? 80 : 200), p = parts(n); while (p.length < 3) { n++; p = parts(n); }
  return num('What do the parts of ' + n + ' (the numbers smaller than ' + n + ' that divide it exactly) add up to?', sum(p), '', ['Parts: ' + p.join(', ') + '.', 'Sum: ' + sum(p) + '.'], { chk: { f: 'parts', n: n } });
}
function fig(k, n) { return k === 'triangular' ? n * (n + 1) / 2 : k === 'square' ? n * n : k === 'pentagonal' ? n * (3 * n - 1) / 2 : k === 'hexagonal' ? n * (2 * n - 1) : n * (n + 1); }
function famFig(R, lv) {
  var kinds = lv === 1 ? ['triangular', 'square'] : ['triangular', 'square', 'pentagonal', 'oblong', 'hexagonal'], k = R.pick(kinds), n = R.int(lv === 1 ? 3 : 4, lv === 1 ? 7 : 12), seq = [];
  for (var i = 1; i <= 4; i++) seq.push(fig(k, i));
  var how = k === 'triangular' ? '$1 + 2 + \\dots + ' + n + ' = \\frac{' + n + ' \\times ' + (n + 1) + '}{2}$' : k === 'square' ? '$' + n + ' \\times ' + n + '$' : k === 'oblong' ? 'a side times one more: $' + n + ' \\times ' + (n + 1) + '$' : k === 'pentagonal' ? '$\\frac{' + n + '(3 \\times ' + n + ' - 1)}{2}$' : '$' + n + '(2 \\times ' + n + ' - 1)$';
  return num('The ' + k + ' numbers begin ' + seq.join(', ') + ', … What is the ' + n + 'th?', fig(k, n), '', ['The ' + n + 'th ' + k + ' number is ' + how + ' = ' + fig(k, n) + '.'], { hint: 'Look at how much is added each time.', chk: { f: 'fig', k: k, n: n } });
}
function famCube(R, lv) {
  var n = R.int(2, lv === 1 ? 5 : 10), first = n * n - n + 1, terms = []; for (var i = 0; i < n; i++) terms.push(first + 2 * i);
  if (lv >= 2 && R.coin()) return num('Nicomachus groups the odd numbers: 1 | 3, 5 | 7, 9, 11 | … The ' + n + 'th group has ' + n + ' numbers. What is the first number in the ' + n + 'th group?', first, '', ['Before it come $1 + 2 + \\dots + ' + (n - 1) + ' = ' + (n * (n - 1) / 2) + '$ odd numbers.', 'The next odd number is $2 \\times ' + (n * (n - 1) / 2) + ' + 1 = ' + first + '$ (also $n^2 - n + 1$).'], { chk: { f: 'cubefirst', n: n } });
  return num('Add the ' + n + ' odd numbers ' + terms.join(' + ') + '. What do you get?', n * n * n, '', ['$' + terms.join(' + ') + ' = ' + n * n * n + '$.', 'That is $' + n + '^3$: Nicomachus\'s groups of odd numbers make the cubes (II.20).'], { chk: { f: 'cube', n: n } });
}
function famEven(R, lv) {
  var n = 2 * R.int(2, 64), x = n, h = 0; while (x % 2 === 0) { x /= 2; h++; }
  var k = x === 1 ? 'even-times even' : h === 1 ? 'even-times odd' : 'odd-times even';
  return mcc('Nicomachus divides even numbers into three kinds. Which kind is ' + n + '?', k, ['even-times even', 'even-times odd', 'odd-times even'], [n + ' halves ' + h + ' time' + (h > 1 ? 's' : '') + ' to reach ' + x + '.', x === 1 ? 'It halves all the way to 1: even-times even.' : h === 1 ? 'One halving gives an odd number: even-times odd.' : 'It halves more than once but stops at an odd number above 1: odd-times even.'], { chk: { f: 'even', n: n } });
}
var MEANS = [[2, 8], [4, 9], [3, 12], [6, 24], [2, 18], [4, 16], [9, 16], [5, 20], [8, 18], [3, 27], [4, 25], [12, 27]];
function famMean(R, lv) {
  var pr = R.pick(MEANS), a = pr[0], b = pr[1], k = R.pick(lv === 1 ? ['arithmetic', 'geometric'] : ['arithmetic', 'geometric', 'harmonic']);
  var v = k === 'arithmetic' ? (a + b) / 2 : k === 'geometric' ? Math.sqrt(a * b) : 2 * a * b / (a + b);
  var st = k === 'arithmetic' ? ['$\\frac{' + a + ' + ' + b + '}{2} = ' + r2(v, 2) + '$: the middle term exceeds one end by as much as the other end exceeds it.'] : k === 'geometric' ? ['$' + a + ' : g = g : ' + b + '$, so $g^2 = ' + a * b + '$ and $g = ' + v + '$.'] : ['$\\frac{2 \\times ' + a + ' \\times ' + b + '}{' + a + ' + ' + b + '} = \\frac{' + 2 * a * b + '}{' + (a + b) + '} \\approx ' + r2(v, 2) + '$.'];
  return num('Find the ' + k + ' mean of ' + a + ' and ' + b + (Number.isInteger(v) ? '.' : ', to two decimal places.'), r2(v, 2), '', st, { form: Number.isInteger(v) ? 'int' : 'dec', rtol: Number.isInteger(v) ? 0 : 0.003, chk: { f: 'mean', k: k, a: a, b: b } });
}
function famSieve(R, lv) {
  var N = R.pick(lv === 1 ? [20, 30, 40] : [50, 60, 70, 80, 100, 120]), c = 0, list = []; for (var x = 3; x < N; x += 2) { var pr = true; for (var d = 3; d * d <= x; d += 2) if (x % d === 0) { pr = false; break; } if (pr) { c++; list.push(x); } }
  return num('Nicomachus\'s sieve sorts the odd numbers. How many odd primes are there between 3 and ' + N + ' (counting 3)?', c, '', ['Strike out the multiples of 3, 5, 7, … from the odd numbers below ' + N + '.', 'Left: ' + list.join(', ') + '.', 'That is ' + c + '.'], { chk: { f: 'sieve', N: N } });
}
var RAT = [[2, 1, 'double'], [3, 1, 'triple'], [3, 2, 'sesquialter'], [4, 3, 'sesquitertian'], [5, 4, 'sesquiquartan']];
function famRatio(R, lv) {
  var r = R.pick(RAT), k = R.int(2, 9), a = r[0] * k, b = r[1] * k;
  return mcc('Nicomachus names ratios. What does he call the ratio of ' + a + ' to ' + b + '?', r[2], RAT.filter(function (x) { return x !== r; }).map(function (x) { return x[2]; }).slice(0, lv === 1 ? 2 : 3),
    [a + ' : ' + b + ' = ' + r[0] + ' : ' + r[1] + '.', r[1] === 1 ? 'A multiple ratio: ' + r[2] + '.' : 'The larger is the smaller plus a ' + (r[1] === 2 ? 'half' : r[1] === 3 ? 'third' : 'fourth') + ' of it: ' + r[2] + '.'], { chk: { f: 'ratio', a: a, b: b } });
}
var B = {
  facts: [
    ['Nicomachus came from Gerasa, today Jerash in Jordan.', true, ''],
    ['Nicomachus proved each claim from definitions, as Euclid did.', false, 'He taught by examples and named patterns; he gave few proofs.'],
    ['Boethius adapted the Introduction to Arithmetic into Latin around AD 500.', true, 'It became the standard arithmetic of medieval schools.'],
    ['Nicomachus\'s book is our earliest surviving description of the sieve of Eratosthenes.', true, 'Book I, Chapter 13.'],
    ['Nicomachus was right that perfect numbers end alternately in 6 and 8.', false, 'The fifth (33,550,336) and sixth (8,589,869,056) both end in 6.'],
    ['Nicomachus listed four perfect numbers: 6, 28, 496 and 8,128.', true, ''],
    ['There is a perfect number with five digits.', false, 'The fifth perfect number, 33,550,336, has eight.'],
    ['The cubes 1, 8, 27, … are sums of groups of consecutive odd numbers.', true, 'II.20: 1; 3 + 5; 7 + 9 + 11; …'],
    ['Nicomachus called 6, 8, 9, 12 the "most perfect proportion".', true, 'It holds the arithmetic and harmonic means and the musical ratios.'],
    ['Nicomachus was a follower of Pythagoras\'s tradition.', true, 'A Neopythagorean of the Roman era.']
  ],
  items: [
    { q: 'How does Nicomachus define number?', r: 'Limited multitude, a combination of units', w: ['Anything that can be measured with a ruler', 'A symbol written by a scribe', 'The ratio of two lines'], why: 'Book I, Chapter 7.' },
    { q: 'What is a superabundant number, for Nicomachus?', r: 'One whose parts add up to more than itself', w: ['One with many digits', 'One that is a perfect square', 'One with no parts except 1'], why: '12: 1 + 2 + 3 + 4 + 6 = 16.' },
    { q: 'Which shape do the numbers 1, 3, 6, 10, 15 make with dots?', r: 'Triangles', w: ['Squares', 'Pentagons', 'Cubes'], why: 'Each row is one longer.' },
    { q: 'What did the Introduction to Arithmetic become in medieval schools?', r: 'The basis of the arithmetic taught in the quadrivium', w: ['A banned book', 'A book of poems', 'A guide to building churches'], why: 'Through Boethius\'s Latin version.' },
    { q: 'How does Nicomachus\'s book differ from Euclid\'s books on number?', r: 'It gives examples and names instead of proofs', w: ['It uses algebra with letters', 'It is much longer and harder', 'It is about geometry, not number'], why: 'That made it a good beginners\' book, and let errors slip in.' },
    { q: 'What are the parts of 28?', r: '1, 2, 4, 7 and 14', w: ['1, 2, 4, 7, 14 and 28', '2, 4, 7 and 14', '1, 3, 7 and 14'], why: 'They add to 28: perfect.' }
  ]
};
H.T(ID, B, [famKind, famKind, famParts, famFig, famFig, famCube, famEven, famMean, famSieve, famRatio].concat(dateFams(ID).slice(0, 2)), 0.65);
