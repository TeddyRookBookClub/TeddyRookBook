/* Ptolemy, the Almagest. Bank plus computed families: how often an outer planet goes retrograde (synodic period),
   Ptolemy's epicycle-to-deferent ratios against modern distances, sexagesimal numbers (39;30 = 39.5), the chord table
   (chord = 120 sin(θ/2) in parts of a 60-radius circle), the Sun's daily motion and the magnitude scale. chk: inputs. */
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = o.form || 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function mcc(q, right, wrongs, steps, o) { var p = H.mc(q, right, wrongs, steps, o); if (o && o.chk) p.chk = o.chk; return p; }
function cm(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function r2(x, d) { var k = Math.pow(10, d == null ? 2 : d); return Math.round(x * k) / k; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbrome.ptolemy-almagest';
var PL = [['Mars', 1.881, 1.524, 39.5], ['Jupiter', 11.86, 5.203, 11.5], ['Saturn', 29.46, 9.537, 6.5]];
var INNER = [['Venus', 0.6152, 0.7233, 43 + 10 / 60, '43;10'], ['Mercury', 0.2408, 0.3871, 22.5, '22;30']];
function famSynIn(R, lv) {
  var p = R.pick(INNER), S = 1 / (1 / p[1] - 1), days = S * 365.25;
  return num(p[0] + ' goes around the Sun in ' + p[1] + ' years, faster than Earth. About how many days pass between one retrograde loop of ' + p[0] + ' and the next? Round to the nearest day.', Math.round(days), 'days', [p[0] + ' gains $\\frac{1}{' + p[1] + '} - 1$ of a lap on Earth each year.', '$S = \\frac{1}{1/' + p[1] + ' - 1} \\approx ' + r2(S, 3) + '$ years $\\approx ' + Math.round(days) + '$ days.'], { rtol: 0.004, chk: { f: 'synin', P: p[1] } });
}
function famRatioIn(R, lv) {
  var p = R.pick(INNER), rp = p[3] / 60;
  return num('For ' + p[0] + ', Ptolemy\'s epicycle has radius ' + p[4] + ' (that is, ' + r2(p[3], 3) + ') on a deferent of 60. What is the ratio, to three decimal places? (In a Sun-centered system it matches ' + p[0] + '\'s distance from the Sun, ' + p[2] + ' times Earth\'s.)', r2(rp, 3), '', ['$' + r2(p[3], 3) + ' \\div 60 \\approx ' + r2(rp, 3) + '$, close to ' + p[2] + '.', 'For the inner planets the epicycle is the planet\'s own orbit; the deferent is Earth\'s.'], { rtol: 0.003, chk: { f: 'rp', e: p[3] } });
}
function famSynAny(R, lv) {
  var P = R.pick([1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50]), S = 1 / (1 - 1 / P);
  return num('Imagine an outer planet that goes around the Sun once every ' + P + ' years. How often (in years) would Earth overtake it, so that it loops backward in the sky? Give two decimal places.', r2(S, 2), 'years', ['$\\frac{1}{S} = 1 - \\frac{1}{' + P + '} = ' + r2(1 - 1 / P, 4) + '$.', '$S \\approx ' + r2(S, 2) + '$ years. The farther out the planet, the closer this gets to 1 year.'], { rtol: 0.006, chk: { f: 'syn', P: P, unit: 'y' } });
}
function famSunDays(R, lv) {
  var deg = R.pick([10, 15, 20, 30, 45, 60, 90, 120]), d = deg * 365.25 / 360;
  return num('The Sun moves about 360° along the zodiac in 365.25 days. About how many days does it take to move ' + deg + '°? Give one decimal place.', r2(d, 1), 'days', ['Days per degree: $365.25 \\div 360 \\approx 1.0146$.', '$' + deg + ' \\times 1.0146 \\approx ' + r2(d, 1) + '$ days.'], { rtol: 0.004, chk: { f: 'sundays', deg: deg } });
}
function famSyn(R, lv) {
  var p = R.pick(PL), S = 1 / (1 - 1 / p[1]), days = S * 365.25;
  if (lv === 3 && R.coin()) return num(p[0] + ' goes around the Sun in ' + p[1] + ' years. About how many days pass between one retrograde loop of ' + p[0] + ' and the next? Round to the nearest day.', Math.round(days), 'days', ['Earth gains $1 - \\frac{1}{' + p[1] + '}$ of a lap on ' + p[0] + ' each year.', 'One lap: $S = \\frac{1}{1 - 1/' + p[1] + '} \\approx ' + r2(S, 3) + '$ years.', '$' + r2(S, 3) + ' \\times 365.25 \\approx ' + Math.round(days) + '$ days.'], { rtol: 0.004, chk: { f: 'syn', P: p[1], unit: 'd' } });
  return num(p[0] + ' goes around the Sun in ' + p[1] + ' years. How many years pass between one retrograde loop and the next? Give two decimal places.', r2(S, 2), 'years', ['A loop happens each time Earth overtakes ' + p[0] + '.', '$\\frac{1}{S} = 1 - \\frac{1}{' + p[1] + '}$, so $S \\approx ' + r2(S, 2) + '$ years.'], { rtol: 0.006, chk: { f: 'syn', P: p[1], unit: 'y' } });
}
function famRatio(R, lv) {
  var p = R.pick(PL), rp = p[3] / 60, rm = 1 / p[2], ask = lv >= 2 && R.coin();
  if (ask) return num('In a Sun-centered system, an outer planet\'s epicycle corresponds to Earth\'s own orbit. If ' + p[0] + ' is ' + p[2] + ' times as far from the Sun as Earth is, what epicycle-to-deferent ratio does that predict? Give three decimal places.', r2(rm, 3), '', ['Epicycle : deferent = Earth\'s distance : planet\'s distance = $1 : ' + p[2] + '$.', '$1 \\div ' + p[2] + ' \\approx ' + r2(rm, 3) + '$. Ptolemy\'s own value was $' + p[3] + ' \\div 60 \\approx ' + r2(rp, 3) + '$.'], { rtol: 0.003, chk: { f: 'rm', a: p[2] } });
  return num('Ptolemy gave ' + p[0] + ' an epicycle of radius ' + p[3] + ' on a deferent of radius 60. What is the ratio of epicycle to deferent? Give three decimal places.', r2(rp, 3), '', ['$' + p[3] + ' \\div 60 \\approx ' + r2(rp, 3) + '$.', 'Compare $1 \\div ' + p[2] + ' \\approx ' + r2(rm, 3) + '$, Earth\'s distance over ' + p[0] + '\'s: nearly the same.'], { rtol: 0.003, chk: { f: 'rp', e: p[3] } });
}
function famSexa(R, lv) {
  var a = R.int(1, 59), b = R.pick(lv === 1 ? [30, 15, 45, 20, 40] : [6, 12, 18, 24, 36, 48, 54, 9, 27, 33]), v = a + b / 60;
  if (lv === 3 && R.coin()) { var c = R.pick([30, 15, 45]); v = a + b / 60 + c / 3600; return num('Ptolemy wrote fractions in base 60. Write $' + a + ';' + b + ',' + c + '$ (that is, $' + a + ' + \\frac{' + b + '}{60} + \\frac{' + c + '}{3600}$) as a decimal, to four places.', r2(v, 4), '', ['$' + b + ' \\div 60 = ' + r2(b / 60, 4) + '$ and $' + c + ' \\div 3600 = ' + r2(c / 3600, 4) + '$.', 'Total: $' + r2(v, 4) + '$.'], { rtol: 0.0001, chk: { f: 'sexa', a: a, b: b, c: c } }); }
  return num('Ptolemy wrote fractions in base 60, as we still do for minutes. Write $' + a + ';' + b + '$ (that is, $' + a + ' + \\frac{' + b + '}{60}$) as a decimal.', r2(v, 3), '', ['$' + b + ' \\div 60 = ' + r2(b / 60, 3) + '$.', 'So $' + a + ';' + b + ' = ' + r2(v, 3) + '$.'], { form: 'dec', rtol: 0.0005, chk: { f: 'sexa', a: a, b: b, c: 0 } });
}
function famChord(R, lv) {
  var th = R.pick(lv === 1 ? [60, 90, 120, 180, 30] : [30, 36, 45, 60, 72, 90, 120, 150, 20, 100]), ch = 120 * Math.sin(th * Math.PI / 360);
  return num('Ptolemy\'s table of chords uses a circle of radius 60. The chord of an angle $\\theta$ is $120 \\sin(\\theta / 2)$. Find the chord of ' + th + '°, to two decimal places.', r2(ch, 2), '', ['$\\theta / 2 = ' + th / 2 + '°$.', '$120 \\sin ' + th / 2 + '° \\approx ' + r2(ch, 2) + '$.', th === 60 ? 'The chord of 60° is the radius, 60: the side of a hexagon.' : th === 180 ? 'The chord of 180° is the diameter, 120.' : 'Ptolemy built such a table in half-degree steps, without a calculator.'], { rtol: 0.002, chk: { f: 'chord', th: th } });
}
function famSun(R, lv) {
  var d = R.int(5, 120), v = 360 / 365.25 * d;
  return num('The Sun goes once around the zodiac in about 365.25 days. On average, how many degrees does it move in ' + d + ' days? Give two decimal places.', r2(v, 2), '°', ['Per day: $360 \\div 365.25 \\approx 0.9856°$, just under 1°.', '$0.9856 \\times ' + d + ' \\approx ' + r2(v, 2) + '°$.'], { rtol: 0.003, chk: { f: 'sun', d: d } });
}
function famMag(R, lv) {
  var a = R.int(1, 3), b = R.int(a + 1, 6);
  var kk = b - a, ff = Math.pow(100, kk / 5);
  return num('Ptolemy\'s catalog ranks stars from the 1st magnitude (brightest) to the 6th (faintest). In 1856 the scale was fixed so that 5 magnitudes means exactly 100 times the brightness. How many times brighter is a star of magnitude ' + a + ' than one of magnitude ' + b + '? Give one decimal place.', r2(ff, 1), '', ['Each magnitude is a factor of $100^{1/5} \\approx 2.512$.', kk + ' magnitudes: $2.512^{' + kk + '} \\approx ' + r2(ff, 1) + '$.'], { rtol: 0.01, chk: { f: 'mag', k: kk } });
}
var B = {
  facts: [
    ['Ptolemy worked in Alexandria in the 2nd century AD.', true, 'His observations date from AD 127 to 141.'],
    ['The name "Almagest" comes from Arabic.', true, 'al-majisti, "the greatest".'],
    ['Ptolemy\'s star catalog lists about a thousand stars.', true, '1,022 stars in 48 constellations.'],
    ['By 1500, astronomers had added dozens of epicycles to each planet to keep Ptolemy\'s system working.', false, 'Gingerich (1975) showed the tables still used Ptolemy\'s single epicycle per planet.'],
    ['Copernicus\'s system used far fewer circles than Ptolemy\'s.', false, 'About as many; it won for other reasons.'],
    ['Ptolemy thought the Earth is tiny compared with the distance to the stars.', true, 'Almagest Book I.'],
    ['Ptolemy argued that a spinning Earth would leave clouds and thrown objects behind.', true, 'A physical objection answered only by Galileo\'s and Newton\'s physics.'],
    ['Ptolemy\'s equant is a point from which a planet\'s epicycle center seems to move at a steady rate.', true, ''],
    ['A public-domain English translation of the Almagest is free online.', false, 'There is none; Toomer\'s (1984) and Taliaferro\'s (1952) translations are under copyright.'],
    ['Ptolemy built on the work of Hipparchus.', true, 'Hipparchus\'s own books are lost.'],
    ['The Almagest was translated from Arabic into Latin by Gerard of Cremona in 1175.', true, ''],
    ['Ptolemy\'s model was used to predict the planets for about 1,400 years.', true, 'Until Copernicus, Tycho and Kepler.'],
    ['Ptolemy placed the Sun at the center of his system.', false, 'He placed the Earth at the center, at rest.'],
    ['The Almagest includes a table of chords, an early form of trigonometry.', true, 'Book I.'],
    ['Ibn al-Shatir in Damascus replaced the equant with extra small circles, in the 1300s.', true, 'His models resemble Copernicus\'s later ones.'],
    ['Kepler\'s second law echoes Ptolemy\'s equant.', true, 'Seen from the empty focus, a planet moves at a nearly steady angular rate.'],
    ['Ptolemy never wrote about anything except astronomy.', false, 'He also wrote on geography, optics, music and astrology.']
  ],
  items: [
    { q: 'What is retrograde motion?', r: 'A planet seeming to move backward (westward) against the stars for a while', w: ['A planet falling toward the Earth', 'The Moon\'s phases', 'A star twinkling'], why: 'Mars does it about every 26 months.' },
    { q: 'In Ptolemy\'s system, what is an epicycle?', r: 'A small circle whose center rides around a larger circle', w: ['The path of a comet', 'A circle centered on the Sun', 'A kind of telescope'], why: 'The larger circle is the deferent.' },
    { q: 'For the outer planets, which direction does the epicycle radius always point?', r: 'The same way as the line from Earth to the Sun', w: ['Toward the North Star', 'Straight up', 'Toward the Moon'], why: 'A clue that the Sun matters, which Copernicus explained.' },
    { q: 'Which later discovery replaced circles on circles?', r: 'Kepler\'s ellipses (1609)', w: ['Galen\'s faculties', 'Euclid\'s parallel postulate', 'Lavoisier\'s oxygen'], why: 'One ellipse per planet, with the Sun at a focus.' },
    { q: 'What is the deferent in Ptolemy\'s system?', r: 'The large circle around the Earth that carries the epicycle\'s center', w: ['The path of the Sun around a planet', 'A star at the edge of the universe', 'The Moon\'s shadow'], why: 'The epicycle rides on it.' },
    { q: 'Why did Ptolemy reject the idea that the Earth spins?', r: 'He thought clouds, birds and thrown things would be left behind', w: ['A priest forbade it', 'Hipparchus had disproved it with a telescope', 'The stars would fall'], why: 'Answering this needed Galileo\'s and Newton\'s physics of motion.' },
    { q: 'Why did later astronomers dislike the equant?', r: 'It broke the rule of uniform motion about a circle\'s center', w: ['It made the predictions worse', 'It put the Sun at the center', 'It needed a telescope'], why: 'But it made the predictions better, which is why Ptolemy used it.' },
    { q: 'What does "Almagest" mean?', r: '"The greatest", from Arabic', w: ['"The book of stars", from Latin', '"The circle", from Greek', '"The Earth", from Egyptian'], why: 'Ptolemy called it the Mathematical Composition.' },
    { q: 'What did Ptolemy\'s Almagest let astronomers do?', r: 'Compute where the Sun, Moon and planets would be, years ahead', w: ['See moons around Jupiter', 'Measure the speed of light', 'Prove that the Earth moves'], why: 'It came with tables and methods.' }
  ]
};
H.T(ID, B, [famSyn, famSynIn, famSynAny, famSunDays, famRatio, famRatioIn, famSexa, famChord, famSun, famMag].concat(dateFams(ID).slice(0, 2)), 0.68);
