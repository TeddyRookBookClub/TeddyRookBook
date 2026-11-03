/* Huygens: Treatise on Light. Bank plus computed families: refraction from speeds (Huygens's sine law), speed in a
   medium from the index, the speed of light from Rømer's eclipse delay (Huygens's own estimate and modern numbers),
   wavelet radii, the critical angle, and the pendulum of Huygens's clock. Computed problems carry chk (their inputs). */
var ID = 'gb17.huygens-treatise-on-light';
var D2R = Math.PI / 180;
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function grp(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function sf(v, n) { return +(+v).toPrecision(n || 3); }
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else if (o.tol) p.a.tol = o.tol; else p.a.form = 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function famSpeeds(R, lv) {
  var v1 = 300000, v2 = R.pick([225000, 200000, 197000, 186000, 124000]), i = R.pick([20, 30, 40, 45, 50, 60]);
  var r = Math.asin(v2 / v1 * Math.sin(i * D2R)) / D2R;
  return num('In Huygens\u2019s picture, the ratio of the sines equals the ratio of the speeds: $\\dfrac{\\sin\\theta_1}{\\sin\\theta_2} = \\dfrac{v_1}{v_2}$. Light at ' + grp(v1) + ' km/s meets a material where it travels at ' + grp(v2) + ' km/s, at ' + i + '° from the perpendicular. At what angle does it continue? Give one decimal place.', +r.toFixed(1), '°',
    ['$\\sin\\theta_2 = \\dfrac{v_2}{v_1}\\sin\\theta_1 = \\dfrac{' + texn(v2) + '}{' + texn(v1) + '} \\times ' + Math.sin(i * D2R).toFixed(4) + ' = ' + (v2 / v1 * Math.sin(i * D2R)).toFixed(4) + '$.', '$\\theta_2 \\approx ' + r.toFixed(1) + '^\\circ$. Slower light bends toward the perpendicular.'],
    { tol: 0.15, chk: { f: 'hsnell', v1: v1, v2: v2, i: i } });
}
function famVfromN(R, lv) {
  var m = R.pick([['water', 1.33], ['glass', 1.50], ['diamond', 2.42], ['ice', 1.31], ['quartz', 1.54]]), v = 299792 / m[1];
  if (lv > 1 && R.coin()) {
    var i = R.pick([30, 40, 50, 60]), r = Math.asin(Math.sin(i * D2R) / m[1]) / D2R, rr = +r.toFixed(1), n = Math.sin(i * D2R) / Math.sin(rr * D2R), vv = 299792 / n;
    return num('A ray enters ' + m[0] + ' at ' + i + '° and continues at ' + rr + '°. By Huygens\u2019s rule, how fast does light travel in the ' + m[0] + '? Take 299,792 km/s in air and give km/s.', Math.round(vv), 'km/s',
      ['$\\dfrac{v_2}{v_1} = \\dfrac{\\sin ' + rr + '^\\circ}{\\sin ' + i + '^\\circ} = ' + (1 / n).toFixed(4) + '$.', '$v_2 \\approx ' + (1 / n).toFixed(4) + ' \\times 299{,}792 \\approx ' + texn(Math.round(vv)) + '$ km/s.'],
      { rtol: 0.01, chk: { f: 'vang', i: i, r: rr } });
  }
  return num('The index of refraction of ' + m[0] + ' is $n = ' + m[1] + '$, which means light goes $n$ times slower in it than in empty space (299,792 km/s). How fast does light travel in ' + m[0] + ', in km/s?', Math.round(v), 'km/s',
    ['$v = c/n = 299{,}792 / ' + m[1] + ' \\approx ' + texn(Math.round(v)) + '$ km/s.', 'Huygens predicted light is slower in denser materials; Foucault measured it in 1850.'],
    { rtol: 0.01, chk: { f: 'vn', n: m[1] } });
}
function famRomer(R, lv) {
  var t = R.pick([16.6, 16.7, 22, 20, 18]), d = 299.2e6; // orbit diameter, km
  if (lv === 1 || R.coin()) {
    var diam = R.pick([22000, 24000, 20000]), mins = R.pick([22, 20, 24]), perSec = diam / (mins * 60);
    return num('Huygens took the Earth\u2019s orbit to be ' + grp(diam) + ' Earth diameters across, and Rømer\u2019s eclipses of Io to show that light crosses it in ' + mins + ' minutes. How many Earth diameters does light travel per second, by these figures? Give two decimal places.', +perSec.toFixed(2), 'Earth diameters',
      ['Per minute: $' + texn(diam) + ' / ' + mins + ' \\approx ' + (diam / mins).toFixed(1) + '$ diameters.', 'Per second: divide by 60, about ' + perSec.toFixed(2) + ' diameters.' + (diam === 22000 && mins === 22 ? ' Huygens\u2019s own result: 16⅔.' : '')],
      { rtol: 0.01, chk: { f: 'romer1', D: diam, m: mins } });
  }
  var c = d / (t * 60);
  return num('The Earth\u2019s orbit is about 299 million km across. If light takes ' + t + ' minutes to cross it, what speed does that give, in km/s?', Math.round(c), 'km/s',
    ['$v = \\dfrac{299{,}200{,}000\\ \\text{km}}{' + t + ' \\times 60\\ \\text{s}} \\approx ' + texn(Math.round(c)) + '$ km/s.', t > 17 ? 'Too slow: Rømer\u2019s timing of ' + t + ' minutes was too long. The true time is about 16.6 minutes.' : 'Very close to the modern 299,792 km/s.'],
    { rtol: 0.01, chk: { f: 'romer2', d: d, t: t } });
}
function famWavelet(R, lv) {
  var v = R.pick([300000, 225000, 200000]), t = R.pick([1, 2, 5, 10]) , r = v * t / 1e6;
  return num('A wavelet starts from a point the moment the wave arrives. In a material where light moves at ' + grp(v) + ' km/s, how big is the wavelet\u2019s radius ' + t + ' microsecond' + (t > 1 ? 's' : '') + ' later, in kilometers? (1 microsecond = 0.000001 s)', sf(r, 3), 'km',
    ['Radius = speed × time: $' + texn(v) + ' \\times ' + t + '\\times10^{-6} = ' + sf(r, 3) + '$ km.', 'The new wave front is the surface that touches all such wavelets.'],
    { rtol: 0.01, chk: { f: 'wl', v: v, t: t } });
}
function famCritical(R, lv) {
  var m = R.pick([['water', 1.33], ['glass', 1.50], ['diamond', 2.42], ['flint glass', 1.62]]), cA = Math.asin(1 / m[1]) / D2R;
  return num('Light inside ' + m[0] + ' ($n = ' + m[1] + '$) meets the surface with air. Beyond what angle from the perpendicular is it all reflected back inside? Give one decimal place.', +cA.toFixed(1), '°',
    ['At the critical angle the light would leave along the surface ($90^\\circ$): $' + m[1] + '\\sin\\theta_c = 1$.', '$\\theta_c = \\arcsin(1/' + m[1] + ') \\approx ' + cA.toFixed(1) + '^\\circ$. Huygens explains this with wavelets that can no longer form a front in the air.'],
    { tol: 0.15, chk: { f: 'crit', n: m[1] } });
}
function famPendulum(R, lv) {
  if (R.coin()) {
    var L = R.pick([0.25, 0.5, 0.994, 1, 1.5, 2, 4]), T = 2 * Math.PI * Math.sqrt(L / 9.81);
    return num('Huygens\u2019s pendulum clock: a small swing has period $T = 2\\pi\\sqrt{L/g}$. What is the period of a pendulum ' + L + ' m long? Use $g = 9.81$ m/s² and give seconds.', sf(T, 3), 's',
      ['$T = 2\\pi\\sqrt{' + L + '/9.81} \\approx ' + sf(T, 3) + '$ s.'], { rtol: 0.01, chk: { f: 'pend', L: L } });
  }
  var Ts = R.pick([1, 2, 3, 0.5]), Lx = 9.81 * Math.pow(Ts / (2 * Math.PI), 2);
  return num('How long must a pendulum be for a period of ' + Ts + ' s? Use $T = 2\\pi\\sqrt{L/g}$ with $g = 9.81$ m/s², and give meters.', sf(Lx, 3), 'm',
    ['$L = g\\left(\\dfrac{T}{2\\pi}\\right)^2 = 9.81 \\times \\left(\\dfrac{' + Ts + '}{2\\pi}\\right)^2 \\approx ' + sf(Lx, 3) + '$ m.'], { rtol: 0.01, chk: { f: 'pendL', T: Ts } });
}
var B = {
  facts: [
    ['Huygens argued that light is a motion passed through a fine matter, not a substance flying from the source.', true, 'Beams cross without hindering each other, as sounds do.'],
    ['Huygens\u2019s wave theory explained the colors of a prism.', false, 'It had no idea of wavelength, so it said nothing about color.'],
    ['Huygens\u2019s principle says every point a wave reaches becomes the source of a small new wave.', true, 'The new front touches all these \u201cparticular\u201d waves.'],
    ['Huygens\u2019s theory requires light to travel slower in glass and water than in air.', true, 'Foucault confirmed this in 1850.'],
    ['Huygens\u2019s waves had a regular rhythm, with a definite wavelength like modern light waves.', false, 'He pictured irregular pulses; Young and Fresnel added wavelength.'],
    ['The Treatise on Light was presented to the Paris Academy in 1679 and published in 1690.', true, 'In French, with a discourse on the cause of gravity.'],
    ['Iceland crystal splits one ray into two.', true, 'Double refraction, first described by Erasmus Bartholin in 1669.'],
    ['Huygens said light travels instantly.', false, 'He used Rømer\u2019s eclipses of Io to show it takes time and estimated its speed.'],
    ['Huygens found that light is more than six hundred thousand times faster than sound.', true, 'His own comparison in Chapter I.'],
    ['Huygens built the first accurate pendulum clock.', true, 'In 1656; he described it in 1658 and in Horologium Oscillatorium (1673).'],
    ['Huygens was the first to explain Saturn\u2019s ring.', true, 'In 1659, and he found Saturn\u2019s moon Titan in 1655.'],
    ['Huygens accepted Newton\u2019s idea of gravity acting at a distance with no medium.', false, 'He wanted a mechanical cause and thought attraction at a distance was not an explanation.'],
    ['The ether that Huygens imagined is still part of physics today.', false, 'After Michelson and Morley (1887) and Einstein (1905), physics does without it.'],
    ['Huygens wrote that he could not explain what happens when light passes through two Iceland crystals.', true, 'The effect is polarization, named by Malus in 1808.']
  ],
  items: [
    { q: 'Why did Huygens compare light to the rings on a pond?', r: ['Light spreads out as waves, like the circles from a stone in water'], w: ['Light is made of water', 'Light only travels on flat surfaces', 'Light is reflected by water'], why: 'He notes the pond waves are only an image: they are flat and have another cause.' },
    { q: 'Whose observations did Huygens use to show that light takes time to travel?', r: ['Ole Rømer\u2019s timing of the eclipses of Jupiter\u2019s moon Io'], w: ['Galileo\u2019s lanterns on hills', 'Newton\u2019s prism experiments', 'Kepler\u2019s laws'], why: 'The eclipses came late when the Earth was far from Jupiter.' },
    { q: 'Which law did Huygens derive from his wavelets?', r: ['The law of refraction (the sine law)'], w: ['The law of gravity', 'The laws of motion', 'Boyle\u2019s law'], why: 'Along with the law of reflection.' },
    { q: 'What did Huygens call the small waves from each point?', r: ['Particular waves'], w: ['Photons', 'Corpuscles', 'Standing waves'], why: 'Thompson translates them as \u201cparticular\u201d or \u201cpartial\u201d waves.' },
    { q: 'Who added wavelength and interference to Huygens\u2019s principle?', r: ['Thomas Young and Augustin Fresnel'], w: ['Isaac Newton', 'Ole Rømer', 'Robert Hooke'], why: 'Young around 1801, Fresnel in 1818: the Huygens–Fresnel principle.' },
    { q: 'What shape did Huygens give the waves of the second, strange ray in Iceland crystal?', r: ['Squashed spheres (spheroids)'], w: ['Cubes', 'Flat circles', 'Spirals'], why: 'Because the crystal passes the motion faster in some directions.' },
    { q: 'Who measured in 1850 that light is slower in water, as Huygens\u2019s theory requires?', r: ['Léon Foucault'], w: ['James Clerk Maxwell', 'Thomas Young', 'Michael Faraday'], why: 'The particle theory had predicted the opposite.' },
    { q: 'In his preface, what kind of certainty does Huygens say physics can reach?', r: ['A very high likelihood, when principles explain many facts and predict new ones'], w: ['The same certainty as geometry', 'No knowledge at all', 'Certainty only from ancient authorities'], why: 'Close to how scientists talk about evidence today.' },
    { q: 'What did Huygens publish in 1657?', r: ['The first printed book on probability'], w: ['The first book on electricity', 'A map of the Moon', 'A treatise on the heart'], why: 'On reasoning in games of chance, after hearing of the Pascal–Fermat problems.' }
  ]
};
H.T(ID, B, [famSpeeds, famVfromN, famRomer, famWavelet, famCritical, famPendulum,
  function (R, lv) { return H.famBefore(R, lv, ID); }, function (R, lv) { return H.famWhoWrote(R, lv, ID); }], 0.55);
