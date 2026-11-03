/* Euclid, Elements XI–XIII. Bank plus computed families: counts for the five regular solids, Euler's V − E + F = 2 for
   prisms and pyramids, angles meeting at a corner (the five-solids argument), XII.10 (cone = a third of the cylinder),
   XII.7 (pyramid = a third of the prism), XII.2 (circles as the squares on their diameters), XII.18 (spheres as the cubes). */
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = o.form || 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function mcc(q, right, wrongs, steps, o) { var p = H.mc(q, right, wrongs, steps, o); if (o && o.chk) p.chk = o.chk; return p; }
function cm(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function r2(x, d) { var k = Math.pow(10, d == null ? 2 : d); return Math.round(x * k) / k; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbgreeks.euclid-solid-geometry';
var SOL = [['tetrahedron', 4, 6, 4, 'triangles', 3], ['cube', 6, 12, 8, 'squares', 3], ['octahedron', 8, 12, 6, 'triangles', 4], ['dodecahedron', 12, 30, 20, 'pentagons', 3], ['icosahedron', 20, 30, 12, 'triangles', 5]];
function famCount(R, lv) {
  var s = R.pick(lv === 1 ? SOL.slice(0, 3) : SOL), what = R.pick(lv === 1 ? ['faces', 'corners'] : ['faces', 'edges', 'corners']), v = what === 'faces' ? s[1] : what === 'edges' ? s[2] : s[3];
  var steps = what === 'edges' ? ['A ' + s[0] + ' has ' + s[1] + ' faces, each with ' + (s[4] === 'triangles' ? 3 : s[4] === 'squares' ? 4 : 5) + ' edges; each edge is shared by 2 faces.', '$' + s[1] + ' \\times ' + (s[4] === 'triangles' ? 3 : s[4] === 'squares' ? 4 : 5) + ' \\div 2 = ' + s[2] + '$.'] :
    what === 'corners' ? ['Each face has ' + (s[4] === 'triangles' ? 3 : s[4] === 'squares' ? 4 : 5) + ' corners, and ' + s[5] + ' faces meet at each corner of the solid.', '$' + s[1] + ' \\times ' + (s[4] === 'triangles' ? 3 : s[4] === 'squares' ? 4 : 5) + ' \\div ' + s[5] + ' = ' + s[3] + '$.'] : ['A ' + s[0] + ' has ' + s[1] + ' faces (' + s[4] + ').'];
  return num('How many ' + what + ' does a regular ' + s[0] + ' have?', v, '', steps, { hint: lv > 1 ? 'Count by faces, then divide by how many faces share each edge or corner.' : '', chk: { f: 'count', s: s[0], what: what } });
}
function famEuler(R, lv) {
  var n = R.int(3, lv === 1 ? 6 : 12), prism = R.coin(), V = prism ? 2 * n : n + 1, E = prism ? 3 * n : 2 * n, F = prism ? n + 2 : n + 1;
  var nm = (prism ? 'A prism whose two ends are ' : 'A pyramid whose base is ') + n + '-sided', hide = R.pick(['V', 'E', 'F']);
  var known = { V: V, E: E, F: F }, lab = { V: 'corners', E: 'edges', F: 'faces' }, giv = ['V', 'E', 'F'].filter(function (k) { return k !== hide; });
  var ans = known[hide];
  return num(nm + ' polygons has ' + known[giv[0]] + ' ' + lab[giv[0]] + ' and ' + known[giv[1]] + ' ' + lab[giv[1]] + '. Using corners − edges + faces = 2, how many ' + lab[hide] + ' does it have?', ans, '',
    ['$V - E + F = 2$ holds for every solid without holes (Euler, 1750).', '$' + V + ' - ' + E + ' + ' + F + ' = 2$, so there are ' + ans + ' ' + lab[hide] + '.'], { chk: { f: 'euler', V: V, E: E, F: F, hide: hide } });
}
function famCorner(R, lv) {
  var shapes = [['equilateral triangles', 60], ['squares', 90], ['regular pentagons', 108], ['regular hexagons', 120]], s = R.pick(shapes), k = R.int(3, s[1] === 60 ? 6 : 4), sum = k * s[1];
  if (lv === 1 || R.coin()) return num('If ' + k + ' ' + s[0] + ' meet at one corner, how many degrees do their angles add up to there?', sum, '°', ['Each angle is ' + s[1] + '°.', '$' + k + ' \\times ' + s[1] + ' = ' + sum + '$ degrees.'], { chk: { f: 'corner', k: k, a: s[1] } });
  var ok = sum < 360;
  return mcc(k + ' ' + s[0] + ' meet at a corner. Can they fold up into the corner of a solid?', ok ? 'Yes: the angles add to less than 360°' : sum === 360 ? 'No: they lie flat' : 'No: they overlap', [ok ? 'No: they lie flat' : 'Yes: the angles add to less than 360°', ok ? 'No: they overlap' : (sum === 360 ? 'No: they overlap' : 'No: they lie flat')],
    ['$' + k + ' \\times ' + s[1] + ' = ' + sum + '$ degrees.', ok ? 'Less than four right angles, so they fold up (XI.21).' : sum === 360 ? 'Exactly 360°: they lie flat, as a tiling.' : 'More than 360°: they can\'t fit around a point without overlapping.'], { chk: { f: 'fold', k: k, a: s[1] } });
}
function famCone(R, lv) {
  var b = R.int(2, 20) * 3, h = R.int(2, 15), pyr = R.coin(), v = b * h;
  if (lv === 3 && R.coin()) return num('A cone holds ' + (v / 3) + ' cm³. What does the cylinder with the same base and height hold?', v, 'cm³', ['By XII.10 the cone is a third of the cylinder.', '$' + (v / 3) + ' \\times 3 = ' + v + '$ cm³.'], { chk: { f: 'cyl', cone: v / 3 } });
  return num('A ' + (pyr ? 'prism' : 'cylinder') + ' has a base of area ' + b + ' cm² and height ' + h + ' cm. What is the volume of the ' + (pyr ? 'pyramid' : 'cone') + ' with the same base and height?', v / 3, 'cm³', ['The ' + (pyr ? 'prism' : 'cylinder') + ' holds $' + b + ' \\times ' + h + ' = ' + v + '$ cm³.', 'By ' + (pyr ? 'XII.7' : 'XII.10') + ' the ' + (pyr ? 'pyramid' : 'cone') + ' is a third of it: $' + v / 3 + '$ cm³.'], { chk: { f: 'pyr3', b: b, h: h } });
}
function famRatio(R, lv) {
  var k = R.int(2, lv === 1 ? 4 : 6), sph = lv > 1 && R.coin();
  if (sph) return num('One sphere has ' + k + ' times the diameter of another. By XII.18, how many times as much does it hold?', k * k * k, '', ['Spheres are to one another as the cubes of their diameters.', '$' + k + '^3 = ' + k * k * k + '$.'], { chk: { f: 'sph', k: k } });
  return num('One circle has ' + k + ' times the diameter of another. By XII.2, how many times the area does it have?', k * k, '', ['Circles are to one another as the squares on their diameters.', '$' + k + '^2 = ' + k * k + '$.'], { chk: { f: 'circ', k: k } });
}
var B = {
  facts: [
    ['There are exactly five regular solids.', true, 'Euclid proves it after XIII.18.'],
    ['A regular solid can be made from regular hexagons.', false, 'Three hexagons already make 360° at a corner and lie flat.'],
    ['A cone holds a third of the cylinder with the same base and height.', true, 'XII.10.'],
    ['Plato discovered all five regular solids.', false, 'Ancient sources credit Pythagoreans and Theaetetus; Plato wrote about them in the Timaeus.'],
    ['Euclid wrote down the formula V − E + F = 2.', false, 'Euler stated it in 1750.'],
    ['The method of exhaustion in Book XII is credited to Eudoxus.', true, ''],
    ['The icosahedron has twenty triangular faces.', true, 'Five meet at each corner.'],
    ['Kepler once tried to fit the planets\' orbits between nested regular solids.', true, 'In his book of 1596; the idea was wrong, but it started his search.'],
    ['Spheres are to one another as the squares of their diameters.', false, 'As the cubes (XII.18); circles go as the squares (XII.2).'],
    ['Book XIII builds each regular solid inside a sphere.', true, '']
  ],
  items: [
    { q: 'Why can\'t six equilateral triangles meet at a corner of a solid?', r: 'Their angles add to 360°, so they lie flat', w: ['Triangles are too small to make solids', 'Six is an even number', 'Euclid forbade it in a postulate'], why: '6 × 60° = 360°.' },
    { q: 'Which solid has twelve pentagon faces?', r: 'The dodecahedron', w: ['The icosahedron', 'The octahedron', 'The cube'], why: 'Three pentagons meet at each of its 20 corners.' },
    { q: 'What is the method of exhaustion?', r: 'Fill a shape with simpler pieces until what is left is smaller than any amount named', w: ['Try every possible answer until one works', 'Measure the shape with water', 'Cut the shape into exactly two halves'], why: 'An ancestor of the integral in calculus.' },
    { q: 'Which dialogue of Plato matched the regular solids to the elements?', r: 'The Timaeus', w: ['The Republic', 'The Apology', 'The Symposium'], why: 'Written about 360 BC.' },
    { q: 'How many faces meet at each corner of an octahedron?', r: '4', w: ['3', '5', '6'], why: '4 × 60° = 240°.' }
  ]
};
H.T(ID, B, [famCount, famCount, famEuler, famCorner, famCone, famRatio].concat(dateFams(ID).slice(0, 2)), 0.62);
