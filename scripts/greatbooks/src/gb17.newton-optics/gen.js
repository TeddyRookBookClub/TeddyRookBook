/* Newton: Optics. Bank (the experiments, the claims, what later science found) plus computed families: Snell's law,
   dispersion between red and violet, the prism's minimum deviation, a telescope's magnification, Newton's rings,
   and the order of the spectrum. Computed problems carry chk (their inputs). */
var ID = 'gb17.newton-optics';
var D2R = Math.PI / 180;
function sf(v, n) { return +(+v).toPrecision(n || 3); }
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else if (o.tol) p.a.tol = o.tol; else p.a.form = 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
var MEDIA = [['water', 1.33], ['glass', 1.50], ['crown glass', 1.52], ['flint glass', 1.62], ['diamond', 2.42]];
function famSnell(R, lv) {
  var m = R.pick(lv === 1 ? MEDIA.slice(0, 3) : MEDIA), i = R.pick([20, 30, 35, 40, 45, 50, 60]), r = Math.asin(Math.sin(i * D2R) / m[1]) / D2R;
  return num('Sunlight passes from air into ' + m[0] + ' ($n = ' + m[1] + '$) at ' + i + '° from the perpendicular. At what angle from the perpendicular does it travel inside? Give degrees to one decimal place.', +r.toFixed(1), '°',
    ['Law of refraction: $\\sin\\theta_2 = \\dfrac{\\sin ' + i + '^\\circ}{' + m[1] + '} = \\dfrac{' + Math.sin(i * D2R).toFixed(4) + '}{' + m[1] + '} = ' + (Math.sin(i * D2R) / m[1]).toFixed(4) + '$.', '$\\theta_2 \\approx ' + r.toFixed(1) + '^\\circ$: bent toward the perpendicular.'],
    { tol: 0.15, hint: 'n₁ sin θ₁ = n₂ sin θ₂, with n = 1 for air.', chk: { f: 'snell', n1: 1, n2: m[1], i: i } });
}
function famDisp(R, lv) {
  var nr = R.pick([1.510, 1.513, 1.515, 1.612]), dn = nr > 1.6 ? 0.032 : R.pick([0.016, 0.018, 0.02]), nv = +(nr + dn).toFixed(3), i = R.pick([40, 45, 50, 55, 60]);
  var rr = Math.asin(Math.sin(i * D2R) / nr) / D2R, rv = Math.asin(Math.sin(i * D2R) / nv) / D2R, d = rr - rv;
  return num('White light enters a glass block at ' + i + '° from the perpendicular. The glass has $n = ' + nr + '$ for red light and $n = ' + nv + '$ for violet. How many degrees apart are the red and violet rays inside the glass? Give two decimal places.', +d.toFixed(2), '°',
    ['Red: $\\sin\\theta = \\sin ' + i + '^\\circ / ' + nr + '$, so $\\theta \\approx ' + rr.toFixed(2) + '^\\circ$.', 'Violet: $\\sin\\theta = \\sin ' + i + '^\\circ / ' + nv + '$, so $\\theta \\approx ' + rv.toFixed(2) + '^\\circ$.', 'Difference: about ' + d.toFixed(2) + '°. Violet bends more: Newton\u2019s \u201cdifferently refrangible\u201d rays.'],
    { tol: 0.03, chk: { f: 'disp', i: i, nr: nr, nv: nv } });
}
function famMinDev(R, lv) {
  var A = R.pick([60, 45, 30]), n = R.pick([1.50, 1.52, 1.55, 1.60, 1.33]), D = 2 * Math.asin(n * Math.sin(A / 2 * D2R)) / D2R - A;
  if (lv === 3 && R.coin()) {
    var Dm = +D.toFixed(1), nn = Math.sin((A + Dm) / 2 * D2R) / Math.sin(A / 2 * D2R);
    return num('Newton set each prism at the angle where the colored image stood still: the angle of least deviation. A ' + A + '° prism deviates a color by at least ' + Dm + '°. What is its index of refraction for that color, $n = \\dfrac{\\sin\\frac{A+D}{2}}{\\sin\\frac{A}{2}}$? Give three decimal places.', +nn.toFixed(3), '',
      ['$n = \\dfrac{\\sin ' + ((A + Dm) / 2).toFixed(2) + '^\\circ}{\\sin ' + (A / 2) + '^\\circ} = \\dfrac{' + Math.sin((A + Dm) / 2 * D2R).toFixed(4) + '}{' + Math.sin(A / 2 * D2R).toFixed(4) + '} \\approx ' + nn.toFixed(3) + '$.'],
      { tol: 0.003, chk: { f: 'mdn', A: A, D: Dm } });
  }
  return num('A prism with an angle of ' + A + '° has $n = ' + n + '$. Turned to its position of least deviation (where Newton fixed his prisms), how many degrees does it bend the light? Use $D = 2\\arcsin\\left(n\\sin\\frac{A}{2}\\right) - A$ and give one decimal place.', +D.toFixed(1), '°',
    ['$n \\sin(A/2) = ' + n + ' \\times \\sin ' + (A / 2) + '^\\circ = ' + (n * Math.sin(A / 2 * D2R)).toFixed(4) + '$.', '$D = 2 \\times ' + (Math.asin(n * Math.sin(A / 2 * D2R)) / D2R).toFixed(2) + '^\\circ - ' + A + '^\\circ \\approx ' + D.toFixed(1) + '^\\circ$.'],
    { tol: 0.15, chk: { f: 'md', A: A, n: n } });
}
function famScope(R, lv) {
  var fo = R.pick([600, 900, 1000, 1200, 150, 160]), fe = R.pick([10, 12, 20, 25, 6, 8]), m = fo / fe;
  if (m !== Math.round(m)) { fe = 10; m = fo / fe; }
  return num('Newton\u2019s reflecting telescope uses a curved mirror instead of a lens, so it makes no colored fringes. A reflector has a mirror of focal length ' + fo + ' mm and an eyepiece of ' + fe + ' mm. What is its magnification?', m, '×',
    ['Magnification = focal length of the mirror ÷ focal length of the eyepiece.', '$' + fo + ' / ' + fe + ' = ' + m + '$.' + (fo === 160 ? ' Newton\u2019s own 1668 telescope, about 15 cm long, magnified roughly 40 times.' : '')],
    { chk: { f: 'mag', fo: fo, fe: fe } });
}
function famRings(R, lv) {
  var lam = R.pick([450, 500, 550, 589, 600, 650]), Rr = R.pick([1, 2, 3, 5, 10]), m = R.int(1, lv === 1 ? 3 : 8);
  var r = Math.sqrt(m * lam * 1e-9 * Rr) * 1000;
  return num('Newton\u2019s rings: a lens with a curved face of radius ' + Rr + ' m rests on flat glass. In light of wavelength ' + lam + ' nm, the dark rings have radii $r = \\sqrt{m\\lambda R}$. What is the radius of dark ring number ' + m + ', in millimeters?', sf(r, 3), 'mm',
    ['$r = \\sqrt{' + m + ' \\times ' + lam + '\\times10^{-9} \\times ' + Rr + '}$ m.', '$r \\approx ' + sf(r / 1000, 3) + '$ m $= ' + sf(r, 3) + '$ mm.', 'Thomas Young used Newton\u2019s own ring measurements in this way to find the wavelengths of light (1802).'],
    { rtol: 0.02, chk: { f: 'ring', m: m, lam: lam, R: Rr } });
}
var SPEC = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
function famSpectrum(R, lv) {
  var i = R.int(0, 5), j = R.int(i + 1, 6), more = R.coin();
  var a = SPEC[i], b = SPEC[j];
  return H.mc('In a glass prism, which color is bent <b>' + (more ? 'more' : 'less') + '</b>: ' + a + ' or ' + b + '?', more ? b : a, [more ? a : b],
    ['Bending increases from red to violet: ' + SPEC.join(', ') + '. So ' + b + ' is bent more than ' + a + '.']);
}
function famOrder7(R, lv) {
  var k = lv === 1 ? 3 : 4, pick = R.sample([0, 1, 2, 3, 4, 5, 6], k).sort(), L = 'ABCD', idx = R.shuffle(pick.map(function (_, i) { return i; }));
  if (idx.every(function (v, i) { return v === i; })) idx.reverse();
  var ans = pick.map(function (_, q) { return L[idx.indexOf(q)]; }).join('');
  return { q: 'Put these colors in the order they appear in Newton\u2019s spectrum, starting from the least bent:<br>' + idx.map(function (q, j) { return '<b>' + L[j] + '.</b> ' + SPEC[pick[q]]; }).join('<br>') + '<br>Type the letters in order.',
    a: { t: 'text', v: [ans, ans.split('').join(' '), ans.split('').join(', '), ans.split('').join(','), ans.split('').join('-')] },
    steps: ['Least bent to most: red, orange, yellow, green, blue, indigo, violet.', 'So the order is ' + ans + '.'] };
}
var B = {
  facts: [
    ['Newton showed that white sunlight is a mixture of rays that bend by different amounts.', true, '\u201cThe Light of the Sun consists of Rays differently Refrangible.\u201d'],
    ['Newton believed the prism adds colors to white light.', false, 'He showed the colors are already in the light; the prism only separates them.'],
    ['A single color picked out by one prism keeps its color when it passes through a second prism.', true, 'This was his \u201ccrucial experiment.\u201d'],
    ['Opticks was first published in English in 1704.', true, 'A Latin edition followed in 1706 and the fourth English edition in 1730.'],
    ['Newton waited to publish Opticks until after Robert Hooke\u2019s death in 1703.', true, 'He disliked the disputes his 1672 paper had started.'],
    ['Newton concluded that the colored fringes of lens telescopes could never be removed.', true, 'He was wrong: achromatic lenses came in 1733 and 1758.'],
    ['Newton chose seven colors partly by matching the spectrum to the seven steps of a musical scale.', true, 'He divided it like the notes of an octave.'],
    ['Violet light bends less than red light in glass.', false, 'Violet bends more.'],
    ['Newton wrote that rays of light are not themselves colored, but have a power to stir up a sensation of color.', true, 'Book I, Part II.'],
    ['Opticks ends with a set of open questions called Queries.', true, '31 of them in the later editions.'],
    ['Newton insisted that light is certainly made of particles.', false, 'He asked it as a question (Query 29) rather than claiming it.'],
    ['Newton\u2019s rings are colored rings in a thin layer of air between a lens and flat glass.', true, 'He measured them in Book II.'],
    ['Thomas Young used Newton\u2019s ring measurements to work out the wavelengths of light.', true, 'In 1802, supporting the wave theory.'],
    ['A red apple looks red because it reflects red rays more than others.', true, 'Newton\u2019s account of the colors of bodies.']
  ],
  items: [
    { q: 'What did Newton put in his window shutter to begin his prism experiments?', r: ['A small round hole'], w: ['A colored glass', 'A mirror', 'A candle'], why: '\u201cAt a round Hole, about one third Part of an Inch broad, made in the Shut of a Window.\u201d' },
    { q: 'What happened when Newton passed a single color through a second prism?', r: ['It bent again but stayed the same color'], w: ['It split into all the colors again', 'It turned white', 'It disappeared'], why: 'This showed the prism sorts the colors rather than making them.' },
    { q: 'Why did Newton build a telescope with a mirror?', r: ['Lenses spread colors and blur the image, and he thought that could not be fixed'], w: ['Mirrors were cheaper than glass', 'He could not grind lenses', 'Mirrors magnify more'], why: 'A mirror reflects all colors alike.' },
    { q: 'What is the name of the color effect that makes a spectrum: the spreading of colors because each bends differently?', r: ['Dispersion'], w: ['Reflection', 'Diffraction', 'Polarization'], why: 'Different colors have slightly different indexes of refraction.' },
    { q: 'Who first explained the rainbow\u2019s angle, in 1637, before Newton explained its colors?', r: ['René Descartes'], w: ['Robert Hooke', 'Galileo Galilei', 'Johannes Kepler'], why: 'Descartes, in his essay on meteors.' },
    { q: 'Who made the first achromatic (color-free) lenses, proving Newton wrong about lenses?', r: ['Chester Moor Hall and John Dollond'], w: ['Christiaan Huygens', 'Robert Boyle', 'Edmond Halley'], why: 'Hall in 1733, Dollond in 1758, using two kinds of glass.' },
    { q: 'Which writer rejected Newton\u2019s theory of color in his own Theory of Colours (1810)?', r: ['Goethe'], w: ['Voltaire', 'Benjamin Franklin', 'Faraday'], why: 'Goethe studied color as an experience; physicists kept Newton\u2019s account of the physics.' },
    { q: 'How is Opticks written, compared with the Principia?', r: ['In plain English, as a series of experiments'], w: ['In Latin geometry', 'As a long poem', 'As a dialogue between friends'], why: 'Anyone with a prism and a dark room could repeat it.' },
    { q: 'Today, what do we say each color of light corresponds to?', r: ['A different wavelength'], w: ['A different speed in empty space', 'A different temperature', 'A different kind of particle that never changes'], why: 'Red is about 700 nanometers, violet about 400.' }
  ]
};
H.T(ID, B, [famSnell, famDisp, famMinDev, famScope, famRings, famSpectrum, famOrder7,
  function (R, lv) { return H.famBefore(R, lv, ID); }, function (R, lv) { return H.famWhoWrote(R, lv, ID); }], 0.55);
