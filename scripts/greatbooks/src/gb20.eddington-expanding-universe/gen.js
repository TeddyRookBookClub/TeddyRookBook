/* Eddington: The Expanding Universe (no excerpts: first published 1933). Bank (Eddington, the discovery, the people,
   the age puzzle, what came after) plus computed families: Hubble's law v = H d (both ways), the Hubble time
   978/H in billions of years, the balloon's proportional speeds, and megaparsecs to light-years. */
var ID = 'gb20.eddington-expanding-universe';
var B = {
  facts: [
    ['Eddington led the 1919 eclipse expedition to Príncipe that tested general relativity.', true, 'Its photographs showed starlight bent by the Sun.'],
    ['The Expanding Universe grew from a lecture at the International Astronomical Union meeting in Cambridge, Massachusetts, in 1932.', true, 'Published in 1933.'],
    ['Hubble found that the farther a galaxy is, the faster it moves away.', true, 'Speed is proportional to distance (1929).'],
    ['In an expanding universe, our galaxy is the center from which everything flies away.', false, 'Every galaxy sees the same pattern; there is no center.'],
    ['Light from receding galaxies is shifted toward the red.', true, 'The redshift.'],
    ['Georges Lemaître had worked out an expanding universe from Einstein’s equations by 1927.', true, 'Alexander Friedmann had done so in 1922.'],
    ['Eddington liked the idea of a sudden beginning of the universe.', false, 'He disliked it, and favored a slow start from a balanced, unchanging state.'],
    ['With Hubble’s early numbers, the universe seemed younger than the Earth.', true, 'About 2 billion years; the puzzle was solved in the 1950s.'],
    ['Today’s best estimate of the age of the universe is about 13.8 billion years.', true, 'From the expansion rate and the cosmic microwave background.'],
    ['In 1998 astronomers found that the expansion of the universe is slowing to a stop.', false, 'They found it is speeding up.'],
    ['Eddington explained the expansion as the growth of space itself.', true, 'Not galaxies flying through a fixed space.'],
    ['Vesto Slipher measured the first large redshifts of spiral nebulae, from 1912 on.', true, 'At Lowell Observatory.']
  ],
  items: [
    { q: 'What does Hubble’s law say?', r: 'A galaxy’s speed away from us is proportional to its distance', w: ['All galaxies move at the same speed', 'Nearer galaxies move away faster', 'Galaxies are moving toward us', 'Galaxies do not move'], why: 'v = H d.' },
    { q: 'What everyday picture shows why an expanding universe has no center?', r: 'Dots on an inflating balloon', w: ['A bomb exploding in a room', 'A spinning top', 'A ball rolling downhill', 'A river flowing to the sea'], why: 'Every dot sees all the others moving away.' },
    { q: 'What did astronomers measure to learn that galaxies are receding?', r: 'The redshift of their light', w: ['Their weight', 'Their sound', 'Their temperature by touch', 'Their shadows'], why: 'Stretched light, like the falling pitch of a passing engine.' },
    { q: 'Which discovery of 1965 supported a hot, dense beginning, the big bang?', r: 'The cosmic microwave background', w: ['The planet Pluto', 'The electron', 'The expansion itself', 'Black holes'], why: 'The faint glow left over from the early universe.' },
    { q: 'Why did the universe seem too young in the 1930s?', r: 'Distances to galaxies had been underestimated, making the expansion rate too high', w: ['The Earth was younger than thought', 'Light was slower then', 'Telescopes were pointed the wrong way', 'Einstein’s theory was wrong'], why: 'Walter Baade’s work in the 1950s raised the distances.' },
    { q: 'Who first put the cosmical constant into Einstein’s equations?', r: 'Einstein himself, in 1917', w: ['Eddington, in 1933', 'Hubble, in 1929', 'Newton, in 1687', 'Lemaître, in 1931'], why: 'To keep his model universe from changing; Eddington treated it as a cosmic repulsion.' },
    { q: 'Where was Eddington a professor?', r: 'Cambridge', w: ['Oxford', 'Harvard', 'Berlin', 'Copenhagen'], why: 'He was Plumian Professor of Astronomy.' }
  ]
};
function famHubble(R, lv) {
  var Hc = R.pick([67, 70, 72]), d = R.pick([10, 20, 50, 80, 100, 150, 200, 300]), v = Hc * d;
  if (R.next() < 0.5) return H.num('A galaxy is ' + d + ' megaparsecs away. With H₀ = ' + Hc + ' km/s per megaparsec, how fast is it receding (km/s)?', v,
    ['v = H₀ × d = ' + Hc + ' × ' + d + ' = ' + v + ' km/s.'], { unit: 'km/s' });
  return H.num('A galaxy recedes at ' + v.toLocaleString('en-US') + ' km/s. With H₀ = ' + Hc + ' km/s per megaparsec, how far away is it (megaparsecs)?', d,
    ['d = v ÷ H₀ = ' + v + ' ÷ ' + Hc + ' = ' + d + ' Mpc.'], { unit: 'Mpc' });
}
function famAge(R, lv) {
  var Hc = R.pick([50, 60, 70, 75, 100, 250, 500]), t = 978 / Hc;
  return H.num('If the galaxies always moved at today’s speeds, the universe’s age is about 978 ÷ H₀ billion years (H₀ in km/s per megaparsec). What age does H₀ = ' + Hc + ' give? (1 decimal place)', +t.toFixed(1),
    ['978 ÷ ' + Hc + ' ≈ ' + t.toFixed(1) + ' billion years.', Hc >= 250 ? 'A value this high made the universe younger than the Earth: Eddington’s puzzle.' : 'Compare the modern figure, 13.8 billion years.'], { form: 'dec', rtol: 0.02, unit: 'billion years' });
}
function famBalloon(R, lv) {
  var d1 = R.pick([2, 3, 4, 5]), v1 = R.pick([10, 20, 30]), m = R.pick([2, 3, 4, 5]);
  return H.num('On an inflating balloon, a dot ' + d1 + ' cm from yours moves away at ' + v1 + ' mm per second. How fast does a dot ' + (d1 * m) + ' cm away move away?', v1 * m,
    ['Speed is proportional to distance.', (d1 * m) + ' cm is ' + m + ' times as far, so ' + m + ' × ' + v1 + ' = ' + (v1 * m) + ' mm/s.'], { unit: 'mm/s' });
}
function famMpc(R, lv) {
  var d = R.pick([1, 2, 5, 10, 30, 100]), ly = d * 3.26;
  return H.num('One megaparsec is about 3.26 million light-years. How many million light-years is ' + d + ' megaparsecs?', +ly.toFixed(2),
    [d + ' × 3.26 = ' + +ly.toFixed(2) + ' million light-years.'], { form: 'dec', rtol: 0.01 });
}
H.T(ID, B, [famHubble, famAge, famBalloon, famMpc, function (R, lv) { return H.famBefore(R, lv, ID); }], 0.5);
