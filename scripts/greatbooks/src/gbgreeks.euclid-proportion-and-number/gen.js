/* Euclid, Elements V–X. Bank plus computed families: the Euclidean algorithm (VII.2) and its steps, prime to one another
   (VII.1), the least common multiple (VII.34), Euclid's "multiply and add one" (IX.20), perfect numbers (IX.36),
   primality, the side-splitter (VI.2) and which square roots are incommensurable (X.9). chk carries the inputs. */
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = o.form || 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function mcc(q, right, wrongs, steps, o) { var p = H.mc(q, right, wrongs, steps, o); if (o && o.chk) p.chk = o.chk; return p; }
function cm(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function r2(x, d) { var k = Math.pow(10, d == null ? 2 : d); return Math.round(x * k) / k; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbgreeks.euclid-proportion-and-number';
function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
function famGcd(R, lv) {
  var g = lv === 1 ? R.int(2, 9) : lv === 2 ? R.int(3, 30) : R.int(7, 99), m = R.int(2, lv === 3 ? 40 : 12), n = R.int(2, lv === 3 ? 40 : 12);
  while (gcd(m, n) !== 1 || m === n) { n = R.int(2, lv === 3 ? 40 : 12); }
  var a = g * Math.max(m, n), b = g * Math.min(m, n), x = a, y = b, st = [];
  while (y) { var q = Math.floor(x / y), r = x - q * y; st.push('$' + texn(x) + ' = ' + q + ' \\times ' + texn(y) + (r ? ' + ' + texn(r) : '') + '$'); x = y; y = r; }
  return num('Use Euclid\'s method (VII.2) to find the greatest common measure of ' + cm(a) + ' and ' + cm(b) + '.', g, '', st.concat(['The last nonzero remainder (or the last divisor) is ' + g + '.']), { hint: 'Divide the larger by the smaller, then the smaller by the remainder, until nothing is left over.', chk: { f: 'gcd', a: a, b: b } });
}
function famSteps(R, lv) {
  var a = R.int(20, 200), b = R.int(5, a - 1), x = a, y = b, k = 0, st = [];
  while (y) { var q = Math.floor(x / y), r = x - q * y; st.push('$' + x + ' = ' + q + ' \\times ' + y + (r ? ' + ' + r : '') + '$'); x = y; y = r; k++; }
  return num('How many divisions does Euclid\'s algorithm take for ' + a + ' and ' + b + ' (count the last one, which leaves no remainder)?', k, '', st.concat(['That is ' + k + ' divisions; the greatest common measure is ' + x + '.']), { chk: { f: 'steps', a: a, b: b } });
}
function famCoprime(R, lv) {
  var a = R.int(6, lv === 1 ? 40 : 150), b = R.int(6, lv === 1 ? 40 : 150); if (a === b) b++;
  var g = gcd(a, b);
  return mcc('Are ' + a + ' and ' + b + ' "prime to one another" (measured only by the unit), in Euclid\'s sense?', g === 1 ? 'Yes' : 'No', [g === 1 ? 'No' : 'Yes'],
    [g === 1 ? 'Their greatest common measure is 1, so yes (VII.1).' : 'Both are measured by ' + g + ', so no.'], { chk: { f: 'cop', a: a, b: b } });
}
function famLcm(R, lv) {
  var a = R.int(2, lv === 1 ? 12 : 30), b = R.int(2, lv === 1 ? 12 : 30); if (a === b) b++;
  var g = gcd(a, b), l = a * b / g;
  return num('Book VII, Proposition 34 finds the least number that two numbers both measure. What is it for ' + a + ' and ' + b + '?', l, '', ['Their greatest common measure is ' + g + '.', 'Least common multiple $= \\frac{' + a + ' \\times ' + b + '}{' + g + '} = ' + l + '$.'], { chk: { f: 'lcm', a: a, b: b } });
}
var PR = [2, 3, 5, 7, 11, 13];
function famEuclidPrime(R, lv) {
  var k = lv === 1 ? R.int(2, 3) : R.int(3, 5), list = PR.slice(0, k), N = list.reduce(function (s, x) { return s * x; }, 1) + 1, p = R.pick(list);
  return num('Following IX.20, multiply the primes ' + list.join(', ') + ' and add 1, getting ' + cm(N) + '. What is the remainder when ' + cm(N) + ' is divided by ' + p + '?', 1, '',
    [cm(N - 1) + ' is a multiple of ' + p + ', so ' + cm(N) + ' is 1 more than a multiple of ' + p + '.', 'The remainder is 1, for every prime on the list. So any prime that measures ' + cm(N) + ' is a new one.'], { chk: { f: 'eprime', list: list, p: p } });
}
function famPerfect(R, lv) {
  var ns = [[2, 6], [3, 28], [5, 496], [7, 8128]], t = R.pick(lv === 1 ? ns.slice(0, 2) : ns), n = t[0], s = Math.pow(2, n) - 1, last = Math.pow(2, n - 1);
  var terms = []; for (var i = 0; i < n; i++) terms.push(Math.pow(2, i));
  return num('IX.36: add the doubles ' + terms.join(' + ') + ' = ' + s + ', which is prime. Multiply this sum by the last number added. What perfect number results?', s * last, '', ['$' + s + ' \\times ' + last + ' = ' + texn(s * last) + '$.', 'Its parts add up to itself, so it is perfect.'], { chk: { f: 'perf', n: n } });
}
function famIsPrime(R, lv) {
  var cand = [], hi = lv === 1 ? 60 : lv === 2 ? 150 : 400; for (var x = 11; x <= hi; x += 2) cand.push(x);
  var n = R.pick(cand), f = 0; for (var d = 3; d * d <= n; d += 2) if (n % d === 0) { f = d; break; }
  return mcc('Is ' + n + ' a prime number?', f ? 'No' : 'Yes', [f ? 'Yes' : 'No'], [f ? n + ' = ' + f + ' × ' + (n / f) + ', so it is composite.' : 'No odd number from 3 up to $\\sqrt{' + n + '} \\approx ' + Math.floor(Math.sqrt(n)) + '$ divides it, so it is prime.'], { chk: { f: 'isp', n: n } });
}
function famSplitter(R, lv) {
  var ad = R.int(2, 9), db = R.int(2, 9), k = R.int(1, 4), ae = ad * k, ec = db * k;
  if (lv === 1) { ad = 2 * k; db = 2; ae = 3 * k; ec = 3; }
  return num('In triangle ABC, a line DE is drawn parallel to BC, with D on AB and E on AC. AD = ' + ad + ', DB = ' + db + ' and AE = ' + ae + '. Find EC.', ec, '', ['By VI.2 the parallel line cuts the sides proportionally: $AD : DB = AE : EC$.', '$' + ad + ' : ' + db + ' = ' + ae + ' : EC$, so $EC = \\frac{' + ae + ' \\times ' + db + '}{' + ad + '} = ' + ec + '$.'], { chk: { f: 'split', ad: ad, db: db, ae: ae } });
}
function famIncomm(R, lv) {
  var n = R.int(2, lv === 1 ? 20 : 80), sq = Math.round(Math.sqrt(n)) * Math.round(Math.sqrt(n)) === n;
  return mcc('Is the side of a square of area ' + n + ' commensurable with the unit length (is $\\sqrt{' + n + '}$ a whole number or fraction)?', sq ? 'Yes: it is ' + Math.sqrt(n) : 'No: it is incommensurable', [sq ? 'No: it is incommensurable' : 'Yes: it is a fraction we could find with enough work'],
    [sq ? n + ' is a square number, $' + Math.sqrt(n) + '^2 = ' + n + '$.' : n + ' is not a square number, and by X.9 the side of such a square has no common measure with the unit.'], { chk: { f: 'inc', n: n } });
}
var B = {
  facts: [
    ['Euclid proved that the prime numbers never run out.', true, 'Book IX, Proposition 20.'],
    ['Euclid proved that 2 × 3 × 5 × … × p + 1 is always prime.', false, 'He did not claim that; 30,031 = 59 × 509 is not prime. He only needs a prime factor not on the list.'],
    ['Euclid\'s algorithm finds the greatest common measure of two numbers.', true, 'VII.1 and VII.2.'],
    ['The theory of proportion in Book V is credited to Eudoxus.', true, 'Eudoxus of Cnidus, about 390 to 340 BC.'],
    ['For Euclid, 1 is a number like any other.', false, 'Euclid treats the unit as the source of number, not a number: "a number is a multitude composed of units."'],
    ['The diagonal and side of a square have no common measure.', true, 'Their ratio is the square root of 2.'],
    ['Euler proved that every even perfect number comes from Euclid\'s recipe.', true, 'In the 1700s.'],
    ['An odd perfect number was found in the 1900s.', false, 'No odd perfect number is known, and none has been ruled out.'],
    ['Book X is the longest book of the Elements.', true, 'It classifies irrational lines.'],
    ['Dedekind\'s 1872 definition of the real numbers follows Book V\'s idea of equal ratios closely.', true, ''],
    ['Euclid writes that there are "infinitely many" primes.', false, 'He says primes are more than any assigned multitude: for any list, there are more.']
  ],
  items: [
    { q: 'What problem did incommensurable lengths cause for Greek mathematics?', r: 'Some lengths can\'t be compared as ratios of whole numbers', w: ['Some triangles have angles adding to more than 180°', 'Circles could not be drawn exactly', 'There were not enough prime numbers'], why: 'Book V gives a theory of ratio that works anyway.' },
    { q: 'Which book of the Elements contains the proof that primes never run out?', r: 'Book IX', w: ['Book I', 'Book V', 'Book XIII'], why: 'IX.20.' },
    { q: 'What is a perfect number?', r: 'A number equal to the sum of its parts (its divisors smaller than itself)', w: ['A number with no divisors except 1 and itself', 'A number that is a perfect square', 'A number that ends in 6 or 8'], why: '6 = 1 + 2 + 3 is the first.' },
    { q: 'In Euclid, what does "A is prime to B" mean?', r: 'A and B are measured by no common number except the unit', w: ['A is a prime number larger than B', 'A comes before B in the list of primes', 'A divides B exactly'], why: 'We say they are relatively prime or coprime.' },
    { q: 'Book VI is mainly about:', r: 'Similar figures', w: ['Solid figures', 'Odd and even numbers', 'Circles and tangents'], why: 'It applies Book V\'s proportion to figures of the same shape.' },
    { q: 'Where is the Euclidean algorithm used today?', r: 'In computers, to reduce fractions and in the arithmetic behind encryption', w: ['Only in history classes', 'To measure the angles of triangles', 'To find the area of circles'], why: 'It is one of the oldest procedures still in daily use.' }
  ]
};
H.T(ID, B, [famGcd, famGcd, famSteps, famCoprime, famLcm, famEuclidPrime, famPerfect, famIsPrime, famSplitter, famIncomm].concat(dateFams(ID).slice(0, 2)), 0.65);
