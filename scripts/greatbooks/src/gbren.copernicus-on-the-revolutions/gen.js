/* Copernicus: On the Revolutions. Bank (the dedication, the system, the history set straight) plus computed families:
   how often Earth laps a planet (synodic period), an inner planet's distance from its greatest elongation and back,
   the order of the planets, and when an outer planet loops backward. Computed problems carry chk for an independent
   recomputation (scripts/greatbooks/verify-science-b.js). */
var ID = 'gbren.copernicus-on-the-revolutions';
function nm(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = 'int'; if (unit === '%') p.a.pct = true; else if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.chk) p.chk = o.chk; return p; }
var B = {
  facts: [
    ['Copernicus put the sun near the center and made the Earth a planet that turns daily and circles the sun yearly.', true, 'That is the system of Book I.'],
    ['Copernicus got rid of epicycles entirely.', false, 'He still used small epicycles to match the observations; he dropped the big ones for backward loops, and the equant.'],
    ['In Copernicus’s system, a planet’s backward loop is what we see when Earth overtakes it (or it overtakes Earth).', true, 'The loops come from our own moving point of view.'],
    ['Copernicus’s tables were at once far more accurate than the old ones.', false, 'The Prutenic Tables (1551) were about as good as the old tables; big gains came with Tycho and Kepler.'],
    ['The unsigned note "To the Reader" at the front of the book was written by Andreas Osiander, not by Copernicus.', true, 'Osiander, who oversaw the printing, added it; Kepler made this public.'],
    ['On the Revolutions was banned as soon as it was printed in 1543.', false, 'It was read and taught for decades; in 1616 it was suspended "until corrected".'],
    ['Copernicus dedicated the book to Pope Paul III.', true, 'His dedication explains why he dared to publish.'],
    ['Copernicus said his book had waited "not nine years merely, but already going on four times nine."', true, 'He had held it back for a very long time.'],
    ['In the sun-centered order, the planets from the sun are Mercury, Venus, Earth, Mars, Jupiter, Saturn.', true, 'Only six planets were known.'],
    ['Copernicus argued that the farther a planet is from the sun, the faster it goes around.', false, 'The farther, the slower: Saturn is slowest.'],
    ['Copernicus said the stars are so far away that Earth’s yearly motion causes no shift we can see in them.', true, 'The shift (parallax) was finally measured in 1838 by Bessel.'],
    ['Ptolemy’s equant was a point around which a planet’s motion looked even, and Copernicus disliked it.', true, 'He thought it broke the rule of uniform circular motion.'],
    ['Copernicus published the full book when he was a young man.', false, 'It came out in 1543, the year he died, at about seventy.'],
    ['Copernicus compared the old astronomy to a figure made of hands, feet and a head from different bodies: "a monster rather than a man."', true, 'From his dedication.'],
    ['Copernicus’s system and Ptolemy’s give very different paths for Mars in our sky.', false, 'For the main loop they can trace the same path; the difference is in how the parts fit together and the distances.']
  ],
  items: [
    { q: 'What did Copernicus see as the main fault of the old astronomy, in his dedication?', r: 'Its parts did not fit together into one system', w: ['It used too few circles', 'It ignored the Moon', 'It was written in Greek', 'It put the stars too close'], why: 'He compares it to a body made of parts that don’t belong together.' },
    { q: 'Why do outer planets like Mars sometimes seem to move backward?', r: 'Earth, moving faster on an inside orbit, passes them', w: ['They really reverse direction', 'The sun pulls them back', 'Their epicycles turn backward', 'Clouds hide their real motion'], why: 'It is our moving viewpoint, like passing a slower car.' },
    { q: 'When does an outer planet loop backward?', r: 'When it is opposite the sun in our sky', w: ['When it is next to the sun in our sky', 'Only in winter', 'When the Moon is full', 'At random times'], why: 'That is when Earth passes between it and the sun.' },
    { q: 'Who wrote the unsigned preface saying the system was only a way to calculate?', r: 'Andreas Osiander', w: ['Copernicus himself', 'Pope Paul III', 'Galileo', 'Tycho Brahe'], why: 'Osiander added it during printing.' },
    { q: 'What happened to On the Revolutions in 1616?', r: 'It was suspended "until corrected" by the Congregation of the Index', w: ['It was first printed', 'Copernicus revised it', 'It was translated into English', 'It was proved by a telescope'], why: 'Corrections were issued in 1620.' },
    { q: 'Where was On the Revolutions printed in 1543?', r: 'Nuremberg', w: ['Rome', 'Kraków', 'London', 'Paris'], why: 'By Johann Petreius in Nuremberg.' },
    { q: 'Which part of Ptolemy’s system did Copernicus most want to remove?', r: 'The equant', w: ['The Moon', 'Circles', 'The zodiac', 'The stars'], why: 'He wanted every motion to be even around its own center.' },
    { q: 'In Copernicus’s system, what makes the whole sky seem to turn once a day?', r: 'The Earth spinning on its axis', w: ['The sun circling the Earth', 'The stars’ sphere turning', 'The Moon’s orbit', 'The Earth’s yearly orbit'], why: 'Book I gives the Earth a daily rotation.' },
    { q: 'What did Copernicus’s arrangement give that Ptolemy’s could not?', r: 'The distances of the planets from the sun, compared with Earth’s', w: ['Perfect predictions', 'The masses of the planets', 'The speed of light', 'The cause of gravity'], why: 'The sizes of the orbits follow from what we see.' },
    { q: 'Who replaced Copernicus’s circles with ellipses?', r: 'Johannes Kepler', w: ['Ptolemy', 'Andreas Osiander', 'Galileo', 'Aristotle'], why: 'In A New Astronomy (1609).' },
    { q: 'Which earlier text did Copernicus quote to show that others had thought the Earth moves?', r: 'Plutarch, on Philolaus and other Pythagoreans', w: ['The Almagest', 'Euclid’s Elements', 'Galen', 'Aristotle’s Physics'], why: 'He also mentions Cicero on Hicetas (Niceta).' }
  ]
};
var OUT = [['Mars', 1.881], ['Jupiter', 11.86], ['Saturn', 29.46], ['a far asteroid', 6], ['Ceres', 4.6]], INN = [['Venus', 0.615], ['Mercury', 0.241]];
function famSynodic(R, lv) {
  var inner = lv > 1 && R.chance(0.35), p = inner ? R.pick(INN) : R.pick(OUT.slice(0, lv === 1 ? 3 : 5)), P = p[1];
  var S = 1 / Math.abs(1 - 1 / P), days = Math.round(S * 365.25);
  var st = inner ? ['An inner planet laps Earth. Each year it gains $\\frac{1}{' + P + '} - 1$ of a lap on Earth.', '$\\frac{1}{' + P + '} - 1 \\approx ' + (1 / P - 1).toFixed(3) + '$ laps per year, so one lap takes $1 \\div ' + (1 / P - 1).toFixed(3) + ' \\approx ' + S.toFixed(3) + '$ years.', S.toFixed(3) + ' × 365.25 ≈ ' + days + ' days.']
    : ['Earth laps the outer planet. Each year Earth gains $1 - \\frac{1}{' + P + '}$ of a lap.', '$1 - \\frac{1}{' + P + '} \\approx ' + (1 - 1 / P).toFixed(3) + '$, so one lap takes $1 \\div ' + (1 - 1 / P).toFixed(3) + ' \\approx ' + S.toFixed(3) + '$ years.', S.toFixed(3) + ' × 365.25 ≈ ' + days + ' days.'];
  return nm(p[0].charAt(0).toUpperCase() + p[0].slice(1) + ' goes around the sun once every ' + P + ' years; Earth takes 1 year. In Copernicus’s picture, how many <b>days</b> pass between one ' + (inner ? 'time it passes Earth' : 'backward loop') + ' and the next?', days, 'days', st,
    { rtol: 0.02, hint: 'Find how much of a lap one planet gains on the other each year.', chk: { f: 'syn', P: P } });
}
function famElong(R, lv) {
  var back = lv === 3 && R.coin();
  if (back) {
    var a = R.pick([0.39, 0.5, 0.6, 0.72, 0.8]), e = Math.asin(a) * 180 / Math.PI;
    return nm('A planet circles the sun at ' + a + ' times Earth’s distance. What is the greatest angle (in degrees) it can appear from the sun in our sky?', +e.toFixed(1), '°',
      ['At greatest elongation the sight line touches the planet’s orbit, making a right angle at the planet.', '$\\sin E = ' + a + '$, so $E = \\arcsin ' + a + ' \\approx ' + e.toFixed(1) + '°$.'], { rtol: 0.015, chk: { f: 'asin', x: a } });
  }
  var pl = lv === 1 ? ['Venus', 46] : R.pick([['Venus', 46], ['Venus', 47], ['Mercury', 23], ['Mercury', 28], ['an inner asteroid', 30], ['an inner asteroid', 35]]);
  var d = Math.sin(pl[1] * Math.PI / 180);
  return nm(pl[0].charAt(0).toUpperCase() + pl[0].slice(1) + ' is seen at most ' + pl[1] + '° from the sun. With circular orbits and Earth’s distance as 1, how far is it from the sun? (Two decimal places.)', +d.toFixed(2), '',
    ['At greatest elongation the angle at the planet is a right angle.', 'Distance $= \\sin ' + pl[1] + '° \\approx ' + d.toFixed(3) + '$.'], { rtol: 0.02, hint: 'Draw the right triangle Sun–planet–Earth.', chk: { f: 'sin', x: pl[1] } });
}
var ORDER = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn'];
function famOrderPl(R, lv) {
  var k = lv === 1 ? 3 : 4, idx = R.sample([0, 1, 2, 3, 4, 5], k).sort(), right = idx.map(function (i) { return ORDER[i]; }).join(', ');
  var w = []; for (var t = 0; t < 8 && w.length < 3; t++) { var s = R.shuffle(idx).map(function (i) { return ORDER[i]; }).join(', '); if (s !== right && w.indexOf(s) < 0) w.push(s); }
  return H.mc('In Copernicus’s order, which list goes <b>outward from the sun</b>?', right, w, ['From the sun: ' + ORDER.join(', ') + '. In his system, the farther out, the slower the planet goes.']);
}
function famLoop(R, lv) {
  var p = R.pick(['Mars', 'Jupiter', 'Saturn']), where = R.pick([['opposite the sun in our sky (rising at sunset)', 1], ['close to the sun in our sky', 0], ['high at noon', 0]]);
  return H.tf(p + ' is moving backward (retrograde) against the stars. It must be ' + where[0] + '.', !!where[1],
    where[1] ? 'Loops happen when Earth passes between the sun and the planet, so the planet is opposite the sun.' : 'Loops happen when the planet is opposite the sun in our sky, as Earth passes it.');
}
H.T(ID, B, [famSynodic, famElong, famOrderPl, famLoop, function (R, lv) { return H.famBefore(R, lv, ID); }, function (R, lv) { return H.famWhoWrote(R, lv, ID); }], 0.5);
