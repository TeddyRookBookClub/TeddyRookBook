/* Descartes: The Geometry. Bank (lines as numbers, letters for lengths, curves as equations, the rule of signs, the
   history) plus computed families: multiplying and dividing lines with a unit (similar triangles), the square-root
   construction, Descartes's construction for z^2 = az + b^2, counting sign changes (the rule of signs) in a polynomial
   built from chosen roots, and whether a point lies on a curve. Computed problems carry chk (verify-science-b.js). */
var ID = 'gb17.descartes-geometry';
function nm(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = 'int'; if (unit === '%') p.a.pct = true; else if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.chk) p.chk = o.chk; return p; }
function fx(x, d) { return +x.toFixed(d); }
var B = {
  facts: [
    ['Descartes chose one line as the unit, so that the product of two lines could be another line.', true, 'With similar triangles.'],
    ['For the Greek geometers, the product of two lengths was an area.', true, 'Descartes made it a length instead.'],
    ['Descartes used letters near the end of the alphabet (x, y, z) for unknowns.', true, 'And a, b, c for known quantities.'],
    ['Descartes’s Geometry is full of graphs on a grid with x and y axes at right angles.', false, 'That picture was built later by his followers, such as van Schooten.'],
    ['Pierre de Fermat worked out the same basic idea, curves as equations, independently.', true, 'About 1636, circulated in manuscript.'],
    ['Descartes got the idea of coordinates by watching a fly on the ceiling.', false, 'A legend with no evidence from his time.'],
    ['The Geometry was published in 1637 as one of three essays with the Discourse on Method.', true, 'With the Optics and the Meteors.'],
    ['Descartes’s rule of signs counts the most positive ("true") roots an equation can have.', true, 'Count the changes of sign.'],
    ['Descartes called negative roots "false roots".', true, 'And positive roots "true roots".'],
    ['Descartes solved the problem of Pappus with his new method.', true, 'The answer is a conic section.'],
    ['Descartes wrote x² as xx most of the time.', true, 'He used raised numbers for higher powers.'],
    ['Descartes welcomed spirals and other "mechanical" curves into geometry.', false, 'He excluded them; Newton and Leibniz brought them back.'],
    ['Newton learned mathematics from Descartes’s Geometry, in van Schooten’s Latin edition.', true, 'Calculus grew from it.'],
    ['The square-root construction uses a half-circle and a unit length.', true, 'GI² = EG × GH with EG = 1.']
  ],
  items: [
    { q: 'Why did Descartes need a unit length?', r: 'So that multiplying two lines gives a line, not an area', w: ['To measure angles', 'To draw circles', 'To count roots', 'Because rulers had no marks'], why: 'BE : BD = BC : 1.' },
    { q: 'In Descartes’s notation, which letters stand for unknowns?', r: 'x, y, z', w: ['a, b, c', 'p, q, r', 'm, n, o', 'i, j, k'], why: 'A habit still followed in every algebra class.' },
    { q: 'What did Descartes call negative roots?', r: 'False roots', w: ['Imaginary roots', 'True roots', 'Square roots', 'Wrong answers'], why: 'Positive ones were "true roots".' },
    { q: 'Who independently found the idea of describing curves by equations?', r: 'Pierre de Fermat', w: ['Isaac Newton', 'Galileo', 'Euclid', 'Francis Bacon'], why: 'His work was printed only in 1679.' },
    { q: 'Whose old problem did Descartes solve to show the power of his method?', r: 'Pappus of Alexandria', w: ['Pythagoras', 'Archimedes', 'Ptolemy', 'Zeno'], why: 'Pappus wrote about AD 320.' },
    { q: 'Who did much to give us the familiar x–y grid, after Descartes?', r: 'His followers, such as Frans van Schooten, and later Wallis, Newton and Euler', w: ['Descartes alone, in 1637', 'Euclid', 'The ancient Egyptians', 'Galileo'], why: 'Descartes’s book has few graphs and no pair of perpendicular axes.' },
    { q: 'What are the three books of The Geometry about?', r: 'Problems with lines and circles; the nature of curves; solid problems and equations', w: ['Points, lines and planes', 'Arithmetic, algebra and calculus', 'Optics, meteors and music', 'Triangles, circles and spheres'], why: 'Book I, Book II, Book III.' }
  ]
};
function famMult(R, lv) {
  var a = R.pick([1.5, 2, 2.5, 3, 4]), b = R.pick([1.2, 1.5, 2, 3, 0.5]), div = lv > 1 && R.coin();
  if (div) { var e = fx(a * b, 2); return nm('With AB = 1 as the unit, Descartes divides BE by BD: join E to D and draw AC parallel to DE. If BE = ' + e + ' and BD = ' + a + ', how long is BC?', b, '', ['Similar triangles: BC : 1 = BE : BD.', 'BC = ' + e + ' ÷ ' + a + ' = ' + b + '.'], { rtol: 0.005, chk: { f: 'div', a: e, b: a } }); }
  return nm('Descartes multiplies lines: with AB = 1, join A to C and draw DE parallel to CA. If BD = ' + a + ' and BC = ' + b + ', how long is BE?', fx(a * b, 2), '', ['Similar triangles BAC and BDE: BE : BD = BC : BA.', 'BE = ' + a + ' × ' + b + ' ÷ 1 = ' + fx(a * b, 2) + '.'], { rtol: 0.005, chk: { f: 'mul', a: a, b: b } });
}
function famRoot(R, lv) {
  var x = lv === 1 ? R.pick([4, 9, 16, 25]) : R.pick([2, 3, 5, 7, 10, 12, 20]), r = Math.sqrt(x), back = lv === 3 && R.coin();
  if (back) { var g = R.pick([1.5, 2.5, 3, 4, 6]); return nm('In the square-root construction EG = 1, and the upright line GI turns out to be ' + g + '. How long was GH?', fx(g * g, 2), '', ['GI × GI = EG × GH, so GH = GI² ÷ 1.', 'GH = ' + g + '² = ' + fx(g * g, 2) + '.'], { rtol: 0.001, chk: { f: 'sq', x: g } }); }
  return nm('Descartes’s square root: EG = 1 and GH = ' + x + ' lie on one line; a half-circle stands on EH, and the upright line at G meets it at I. How long is GI?' + (Number.isInteger(r) ? '' : ' (Three decimal places.)'), Number.isInteger(r) ? r : fx(r, 3), '',
    ['The angle at I is a right angle, so GI² = EG × GH = ' + x + '.', 'GI = √' + x + (Number.isInteger(r) ? ' = ' + r : ' ≈ ' + r.toFixed(3)) + '.'], Number.isInteger(r) ? { chk: { f: 'sqrt', x: x } } : { rtol: 0.001, chk: { f: 'sqrt', x: x } });
}
var TRI = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [12, 5, 13], [4, 3, 5], [9, 12, 15]];
function famQuad(R, lv) {
  var t = R.pick(TRI), a = 2 * t[0], b = t[1], z = t[0] + t[2];
  return nm('Use Descartes’s construction to solve $z^2 = ' + a + 'z + ' + (b * b) + '$. (Make a right triangle with legs $a/2$ and $b$; then $z$ is the hypotenuse plus $a/2$.)', z, '',
    ['Here $a = ' + a + '$ and $b^2 = ' + b * b + '$, so the legs are $a/2 = ' + t[0] + '$ and $b = ' + b + '$.', 'Hypotenuse $= \\sqrt{' + t[0] * t[0] + ' + ' + b * b + '} = ' + t[2] + '$.', '$z = ' + t[2] + ' + ' + t[0] + ' = ' + z + '$. Check: $' + z + '^2 = ' + z * z + '$ and $' + a + ' \\times ' + z + ' + ' + b * b + ' = ' + (a * z + b * b) + '$.'], { chk: { f: 'quadz', a: a, b2: b * b } });
}
function polyFrom(roots) { var c = [1]; roots.forEach(function (r) { var n = c.length, d = new Array(n + 1).fill(0); for (var i = 0; i < n; i++) { d[i] += c[i]; d[i + 1] -= r * c[i]; } c = d; }); return c; }
function texPoly(c) {
  var deg = c.length - 1, s = '';
  c.forEach(function (k, i) { if (k === 0) return; var p = deg - i, ak = Math.abs(k), sign = k < 0 ? ' - ' : (s ? ' + ' : ''); s += sign + ((ak === 1 && p > 0) ? '' : ak) + (p > 1 ? 'x^{' + p + '}' : p === 1 ? 'x' : ''); });
  return s.replace(/^ - /, '-');
}
function famSigns(R, lv) {
  var pool = [1, 2, 3, 4, 5, -1, -2, -3, -4, -5], k = lv === 1 ? 2 : 3, roots, c, tries = 0;
  do { roots = R.sample(pool, k); c = polyFrom(roots); tries++; } while (tries < 20 && c.some(function (x) { return x === 0; }));
  if (c.some(function (x) { return x === 0; })) return null;
  var ch = 0; for (var i = 1; i < c.length; i++) if ((c[i] > 0) !== (c[i - 1] > 0)) ch++;
  var pos = roots.filter(function (r) { return r > 0; }).length, askTrue = R.coin();
  return nm('By Descartes’s rule of signs, ' + (askTrue ? 'at most how many <b>true</b> (positive) roots can' : 'how many changes of sign are in') + ' $' + texPoly(c) + ' = 0$' + (askTrue ? ' have?' : '?') + (askTrue ? ' (Count the changes of sign.)' : ''), ch, '',
    ['Signs of the coefficients: ' + c.map(function (x) { return x > 0 ? '+' : '−'; }).join(' ') + '.', 'Changes of sign: ' + ch + '.', 'In fact its roots are ' + roots.slice().sort(function (a, b) { return a - b; }).join(', ') + ': ' + pos + ' positive' + (pos === ch ? ', exactly as many as the changes of sign.' : '.')], { chk: { f: 'signs', c: c } });
}
function famOnCurve(R, lv) {
  var r = R.pick([5, 10, 13, 25]), pts = { 5: [[3, 4], [4, 3], [0, 5]], 10: [[6, 8], [8, 6]], 13: [[5, 12], [12, 5]], 25: [[7, 24], [15, 20]] }[r], on = R.coin(), p = R.pick(pts).slice();
  if (!on) p[1] += R.pick([1, -1, 2]);
  return H.tf('The point $(' + p[0] + ', ' + p[1] + ')$ lies on the circle $x^2 + y^2 = ' + r * r + '$.', on, '$' + p[0] + '^2 + ' + (p[1] < 0 ? '(' + p[1] + ')' : p[1]) + '^2 = ' + (p[0] * p[0] + p[1] * p[1]) + '$, ' + (on ? 'which equals ' : 'which is not ') + r * r + '. A curve is the set of points that satisfy its equation.');
}
H.T(ID, B, [famMult, famRoot, famQuad, famSigns, famOnCurve, function (R, lv) { return H.famBefore(R, lv, ID); }], 0.55);
