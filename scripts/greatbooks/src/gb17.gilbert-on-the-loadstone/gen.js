/* Gilbert: On the Magnet. Bank (the terrella, the Earth as a magnet, the tales he tested, electric attraction, the
   history) plus computed families: the dip from the magnetic latitude (tan I = 2 tan L) and back, where a needle lies
   flat or stands upright, magnet or amber (which pulls what), and like and unlike poles.
   Computed problems carry chk (verify-science-b.js recomputes them). */
var ID = 'gb17.gilbert-on-the-loadstone';
function nm(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = 'int'; if (o.tol) { p.a.tol = o.tol; delete p.a.form; } if (unit === '%') p.a.pct = true; else if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.chk) p.chk = o.chk; return p; }
var D = Math.PI / 180;
var B = {
  facts: [
    ['Gilbert made a ball of lodestone and called it a terrella, a "little earth".', true, 'Book I, chapter 3.'],
    ['Gilbert concluded that the Earth itself is a great magnet.', true, 'Book I, chapter 17: "That the globe of the earth is magnetick, & a magnet."'],
    ['Gilbert believed a magnetic mountain near the North Pole pulls compass needles.', false, 'He rejected that tale: the whole Earth turns the needle.'],
    ['A magnetized needle balanced to swing up and down dips more steeply as you go toward a pole.', true, 'Flat at the magnetic equator, upright at a pole.'],
    ['The dip of the needle was first described and measured by Robert Norman, in 1581.', true, 'In The Newe Attractive; Gilbert built on it.'],
    ['Gilbert proved that garlic destroys a magnet’s power.', false, 'Testers found garlic does nothing; Gilbert called the story a fable.'],
    ['Rubbed amber, glass and sulfur attract light bits of many materials, not just iron.', true, 'Gilbert called such bodies "electrics".'],
    ['Gilbert treated the pull of rubbed amber as just another kind of magnetism.', false, 'He showed the two are different.'],
    ['The English word "electricity" comes, through Gilbert’s Latin, from the Greek word for amber.', true, 'Thomas Browne first used "electricity" in 1646.'],
    ['Gilbert published On the Magnet in 1600.', true, 'In Latin, in London.'],
    ['Gilbert was a physician who served Queen Elizabeth I.', true, 'He was also president of the College of Physicians.'],
    ['Today we know the Earth’s field comes from a solid lodestone core.', false, 'It comes from moving molten iron in the outer core, a natural dynamo.'],
    ['Gilbert marked his own discoveries in the margins with asterisks, large and small.', true, 'He asked readers to repeat his experiments carefully.'],
    ['Gilbert thought magnetism might make the Earth spin once a day.', true, 'That part of his idea was later dropped.'],
    ['The Earth’s magnetic field has never changed.', false, 'The poles wander, and the field has reversed many times over the ages.']
  ],
  items: [
    { q: 'What was Gilbert’s terrella?', r: 'A lodestone carved into a ball, a model of the Earth', w: ['A kind of compass for ships', 'A map of the stars', 'A telescope', 'A clock driven by magnets'], why: 'He studied it as a little earth.' },
    { q: 'What happens to a dip needle at the magnetic equator?', r: 'It lies flat', w: ['It points straight down', 'It spins around', 'It points straight up', 'It loses its magnetism'], why: 'The dip is zero there.' },
    { q: 'What happens to a dip needle at a magnetic pole?', r: 'It stands straight up and down', w: ['It lies flat', 'It points east', 'It stops working', 'It points at the sun'], why: 'The dip is 90°.' },
    { q: 'Who first measured the dip of the needle, at London?', r: 'Robert Norman', w: ['William Gilbert', 'Christopher Columbus', 'Francis Bacon', 'Galileo'], why: 'In 1581, about 72°.' },
    { q: 'Which word did Gilbert make from the Greek word for amber?', r: 'Electric', w: ['Magnet', 'Compass', 'Gravity', 'Lodestone'], why: 'Amber is ēlektron in Greek.' },
    { q: 'What does rubbed amber attract that a magnet does not?', r: 'Straw, paper and many other light things', w: ['Only iron', 'Only other magnets', 'Nothing at all', 'Only gold'], why: 'Electric attraction pulls many materials.' },
    { q: 'Who complained that Gilbert built a whole philosophy out of the magnet?', r: 'Francis Bacon', w: ['Galileo', 'Kepler', 'Robert Norman', 'Queen Elizabeth I'], why: 'In Novum Organum, Book I, aphorism 54.' },
    { q: 'Which astronomer took up Gilbert’s idea of magnetic forces to explain how the sun moves the planets?', r: 'Johannes Kepler', w: ['Ptolemy', 'Tycho Brahe', 'Copernicus', 'Aristotle'], why: 'Kepler imagined a magnet-like force from the sun.' },
    { q: 'What makes the Earth’s magnetic field, as we understand it today?', r: 'Moving molten iron in the outer core', w: ['A giant lodestone at the center', 'The pole star', 'The Moon', 'Iron mountains at the poles'], why: 'A natural dynamo.' },
    { q: 'Gilbert hoped sailors could use the dip of the needle to find what?', r: 'Their latitude, even on a cloudy night', w: ['The time of day', 'The depth of the sea', 'Their longitude exactly', 'The direction of the wind'], why: 'Dip changes with magnetic latitude.' },
    { q: 'What did Gilbert call the little pivoted needle he used to test attraction?', r: 'A versorium', w: ['A terrella', 'An astrolabe', 'A sextant', 'A telescope'], why: 'From the Latin for "turn".' }
  ]
};
function famDip(R, lv) {
  var L = lv === 1 ? R.pick([0, 45, 90]) : R.pick([10, 15, 20, 25, 30, 35, 40, 50, 55, 60, 65, 70]), I = L === 90 ? 90 : Math.atan(2 * Math.tan(L * D)) / D;
  if (lv === 1) {
    var v = Math.round(I);
    return nm('Use $\\tan I = 2 \\tan L$. What is the dip $I$ (in degrees) of a needle at magnetic latitude $' + L + '°$?' + (L === 45 ? ' (Round to the nearest degree.)' : ''), v, '°',
      L === 0 ? ['$\\tan 0° = 0$, so $\\tan I = 0$ and $I = 0°$: the needle lies flat.'] : L === 90 ? ['At a magnetic pole the needle stands upright: $I = 90°$.'] : ['$\\tan 45° = 1$, so $\\tan I = 2$.', '$I = \\arctan 2 \\approx 63.4°$, about 63°.'], { tol: 0.6, chk: { f: 'dip', L: L } });
  }
  return nm('Use $\\tan I = 2 \\tan L$ (a simple bar-magnet field). What is the dip $I$ at magnetic latitude $' + L + '°$? (One decimal place.)', +I.toFixed(1), '°',
    ['$\\tan ' + L + '° \\approx ' + Math.tan(L * D).toFixed(4) + '$, so $\\tan I \\approx ' + (2 * Math.tan(L * D)).toFixed(4) + '$.', '$I \\approx ' + I.toFixed(1) + '°$.'], { tol: 0.15, chk: { f: 'dip', L: L } });
}
function famLat(R, lv) {
  var I = R.pick([30, 40, 50, 60, 63.4, 70, 72, 75, 80]), L = Math.atan(Math.tan(I * D) / 2) / D;
  return nm('A dip needle tilts ' + I + '° below the horizon. Using $\\tan I = 2 \\tan L$, what is the magnetic latitude $L$? (One decimal place.)', +L.toFixed(1), '°',
    ['$\\tan L = \\tfrac12 \\tan ' + I + '° \\approx ' + (Math.tan(I * D) / 2).toFixed(4) + '$.', '$L \\approx ' + L.toFixed(1) + '°$.'], { tol: 0.15, hint: 'Halve the tangent of the dip, then take the arctangent.', chk: { f: 'lat', I: I } });
}
function famWhere(R, lv) {
  var c = R.pick([['lies flat', 'At the magnetic equator', ['At a magnetic pole', 'Halfway to a pole', 'Anywhere in the northern half']], ['stands straight up and down', 'At a magnetic pole', ['At the magnetic equator', 'Halfway to a pole', 'At the same latitude as London']], ['dips about 63°', 'About halfway (45°) from the magnetic equator to a pole', ['At the magnetic equator', 'At a magnetic pole', 'Just 5° from the magnetic equator']]]);
  return H.mc('Gilbert carried a small dip needle over his terrella. Where on the little earth does the needle ' + c[0] + '?', c[1], c[2].slice(0, lv === 1 ? 2 : 3), ['Dip is 0° at the magnetic equator, 90° at a pole, and about 63° at 45° (tan I = 2 tan 45° = 2).']);
}
var MAT = [['an iron nail', 1, 0], ['a scrap of paper', 0, 1], ['a piece of straw', 0, 1], ['a few copper filings', 0, 1], ['some iron filings', 1, 1], ['a small feather', 0, 1], ['a steel pin', 1, 0]];
function famPull(R, lv) {
  var m = R.pick(MAT), amber = R.coin();
  var yes = amber ? m[2] : m[1];
  return H.tf((amber ? 'A piece of amber rubbed with cloth' : 'A strong lodestone') + ' pulls ' + m[0] + '.', !!yes,
    amber ? (yes ? 'Rubbed amber (an "electric") attracts light bits of almost any material.' : 'Its pull is weak: it lifts only light bits, so a whole nail or pin stays put. (Gilbert used a light pivoted needle to see it act on metal.)') : (yes ? 'Magnets pull iron and steel.' : 'A magnet pulls iron and steel, not ' + m[0].replace(/^(an?|some|a few) /, '') + '; that kind of pull belongs to rubbed amber.'));
}
function famPoles(R, lv) {
  var c = R.pick([
    ['The north end of a compass needle points north. So near the Earth’s geographic North Pole there must be a magnetic pole of which kind?', 'A south-seeking (south) magnetic pole', ['A north magnetic pole', 'No pole at all', 'Both kinds at once'], 'Unlike poles attract, so the north end of the needle is pulled toward a south-type pole.'],
    ['Two lodestones are brought together with their north-seeking ends facing. What happens?', 'They push apart', ['They pull together', 'Nothing happens', 'Both lose their magnetism'], 'Like poles repel.'],
    ['A terrella is cut in half across its equator. What do you get?', 'Two magnets, each with two poles', ['One north pole and one south pole, separate', 'Two pieces with no magnetism', 'One magnet and one plain stone'], 'Every piece of a magnet has both poles; Gilbert found this too.']
  ]);
  return H.mc(c[0], c[1], c[2].slice(0, lv === 1 ? 2 : 3), [c[3]]);
}
H.T(ID, B, [famDip, famLat, famWhere, famPull, famPoles, function (R, lv) { return H.famBefore(R, lv, ID); }], 0.5);
