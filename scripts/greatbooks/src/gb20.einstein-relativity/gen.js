/* Einstein: Relativity. Bank (the two principles, the train and embankment, simultaneity, the chest, the tests,
   the history) plus computed families: the factor γ, time dilation, length contraction, relativistic velocity
   addition, E = mc², and who sees which flash first. */
var ID = 'gb20.einstein-relativity';
var B = {
  facts: [
    ['Einstein’s popular book Relativity explains the theory with trains, an embankment and lightning.', true, 'And a closed chest pulled through space.'],
    ['In special relativity the speed of light in empty space is the same for every observer moving steadily.', true, 'About 300,000 km/s, whatever the motion of its source.'],
    ['Relativity says that everything is relative, including the laws of physics.', false, 'The laws of physics and the speed of light are the same for everyone.'],
    ['Events simultaneous for the embankment are not simultaneous for the train.', true, 'The relativity of simultaneity, Section IX.'],
    ['A clock moving past you runs fast compared with yours.', false, 'It runs slow, by the factor γ.'],
    ['Einstein’s man in a closed chest, pulled steadily upward, can’t tell that from resting in a gravitational field.', true, 'The principle of equivalence.'],
    ['The 1919 eclipse expedition measured the bending of starlight by the Sun.', true, 'Led by Eddington and Dyson.'],
    ['General relativity explained the extra turning of Mercury’s orbit, about 43 seconds of arc per century.', true, 'Newton’s theory could not.'],
    ['Robert W. Lawson’s English translation of Relativity appeared in 1920.', true, 'Methuen, London.'],
    ['Einstein completed the general theory of relativity in 1905.', false, 'The special theory was 1905; the general theory, November 1915.'],
    ['GPS satellites must correct their clocks for relativity.', true, 'Or positions would drift by kilometers a day.'],
    ['In relativity a body can be pushed past the speed of light if you push long enough.', false, 'No body with mass can reach the speed of light.']
  ],
  items: [
    { q: 'What two principles does special relativity rest on?', r: 'The laws of nature are the same for all steadily moving observers, and light’s speed is the same for all of them', w: ['Time is absolute, and space is absolute', 'Heavy bodies fall faster, and light is a wave', 'Energy is conserved, and heat flows from hot to cold', 'Gravity is a force, and mass is constant'], why: 'They seem to clash until we rethink time.' },
    { q: 'In the lightning story, why does the observer on the train judge that B struck first?', r: 'She is moving toward B, so B’s light reaches her first', w: ['B’s lightning was brighter', 'Light from A travels slower', 'She is closer to A', 'Her watch is broken'], why: 'Light’s speed is the same for her, so she concludes B came first.' },
    { q: 'How did Einstein define "simultaneous" for two lightning strokes?', r: 'An observer at the midpoint sees both flashes at the same time', w: ['Two clocks at the places show the same time', 'Someone hears both thunderclaps together', 'They are equally bright', 'They strike the same rail'], why: 'A definition you could test.' },
    { q: 'What does E = mc² say?', r: 'Mass and energy are two forms of one thing; a little mass is a lot of energy', w: ['Energy equals mass times speed', 'Light has no energy', 'Heavy things fall faster', 'Mass is always conserved separately from energy'], why: 'c² is a huge number.' },
    { q: 'In general relativity, what is gravity?', r: 'The curving of space and time by matter', w: ['A pull that acts instantly at any distance', 'Magnetism of the Earth', 'Air pressing down', 'A kind of light'], why: 'Matter tells spacetime how to curve; spacetime tells matter how to move.' },
    { q: 'What does Part III of the book discuss?', r: 'The universe as a whole', w: ['The atom', 'The origin of life', 'The history of Germany', 'Electric circuits'], why: 'Whether the universe could be finite yet unbounded.' },
    { q: 'Where was Einstein working when he published special relativity in 1905?', r: 'At the patent office in Bern', w: ['At Princeton University', 'At Cambridge University', 'At an observatory in Berlin', 'At a railway company'], why: 'He was a patent examiner.' }
  ]
};
function g(b) { return 1 / Math.sqrt(1 - b * b); }
var BETAS = [0.6, 0.8, 0.28, 0.96, 0.5, 0.9, 0.99];
function famGamma(R, lv) {
  var b = R.pick(BETAS), G = g(b);
  return H.num('Find γ = 1/√(1 − v²/c²) for a speed of ' + b + ' c, to 3 decimal places.', +G.toFixed(3),
    ['v²/c² = ' + +(b * b).toFixed(4) + '.', '1 − ' + +(b * b).toFixed(4) + ' = ' + +(1 - b * b).toFixed(4) + '; its square root is ' + +Math.sqrt(1 - b * b).toFixed(4) + '.', 'γ = 1 ÷ ' + +Math.sqrt(1 - b * b).toFixed(4) + ' ≈ ' + G.toFixed(3) + '.'], { form: 'dec', rtol: 0.003 });
}
function famDilation(R, lv) {
  var b = R.pick([0.6, 0.8, 0.28, 0.96]), G = g(b), t = R.pick([6, 12, 24, 30, 48, 60]), E = t * G;
  if (R.next() < 0.5) return H.num('A ship moves past Earth at ' + b + ' c. Its own clock records ' + t + ' minutes. How many minutes pass on Earth’s clocks?', +E.toFixed(2),
    ['γ = 1/√(1 − ' + b + '²) = ' + +G.toFixed(4) + '.', 'Earth time = ' + t + ' × ' + +G.toFixed(4) + ' ≈ ' + E.toFixed(2) + ' minutes.'], { form: 'dec', rtol: 0.01, unit: 'min' });
  return H.num('A muon lives 2.2 microseconds in its own frame. It moves at ' + b + ' c. How long does it live as measured from the ground, in microseconds?', +(2.2 * G).toFixed(2),
    ['γ = ' + +G.toFixed(4) + '.', '2.2 × ' + +G.toFixed(4) + ' ≈ ' + (2.2 * G).toFixed(2) + ' µs.'], { form: 'dec', rtol: 0.01, unit: 'µs' });
}
function famLength(R, lv) {
  var b = R.pick([0.6, 0.8, 0.28, 0.96]), L = R.pick([100, 200, 250, 500]), Lc = L / g(b);
  return H.num('A train ' + L + ' m long (measured at rest) passes at ' + b + ' c. How long is it, measured from the embankment?', +Lc.toFixed(1),
    ['Length shrinks by the factor √(1 − v²/c²) = ' + +Math.sqrt(1 - b * b).toFixed(4) + '.', L + ' × ' + +Math.sqrt(1 - b * b).toFixed(4) + ' ≈ ' + Lc.toFixed(1) + ' m.'], { form: 'dec', rtol: 0.01, unit: 'm' });
}
function famAdd(R, lv) {
  var u = R.pick([0.5, 0.6, 0.7, 0.8, 0.9]), v = R.pick([0.3, 0.5, 0.6, 0.8]), w = (u + v) / (1 + u * v);
  return H.num('A train moves at ' + u + ' c. A rocket is fired forward from it at ' + v + ' c relative to the train. Using w = (u + v)/(1 + uv/c²), how fast is the rocket relative to the ground, as a fraction of c (2 decimal places)?', +w.toFixed(2),
    ['u + v = ' + +(u + v).toFixed(2) + ' c.', '1 + uv/c² = 1 + ' + +(u * v).toFixed(2) + ' = ' + +(1 + u * v).toFixed(2) + '.', 'w = ' + +(u + v).toFixed(2) + ' ÷ ' + +(1 + u * v).toFixed(2) + ' ≈ ' + w.toFixed(2) + ' c, less than c.'], { form: 'dec', rtol: 0.01 });
}
function famEmc(R, lv) {
  var gr = R.pick([1, 2, 5, 10, 20]), E = gr * 9e13;
  return H.mc('How much energy is equivalent to ' + gr + ' gram' + (gr > 1 ? 's' : '') + ' of mass, by E = mc² (c = 3 × 10⁸ m/s)?', (E / 1e13) + ' × 10¹³ J',
    [(E / 1e13 * 10) + ' × 10¹³ J', (E / 1e13) + ' × 10¹⁰ J', (gr * 3) + ' × 10⁸ J', (E / 1e13) + ' × 10¹⁶ J'],
    ['m = ' + gr / 1000 + ' kg.', 'E = ' + gr / 1000 + ' × 9 × 10¹⁶ = ' + (E / 1e13) + ' × 10¹³ J.']);
}
function famFlash(R, lv) {
  var dir = R.pick(['A', 'B']), other = dir === 'A' ? 'B' : 'A';
  return H.mc('Lightning strikes at A and B at the same moment for the embankment observer at the midpoint. A train observer, beside the midpoint at that moment, is moving toward ' + dir + '. Which flash does she see first?', 'The flash from ' + dir,
    ['The flash from ' + other, 'Both at once', 'Neither; light can’t reach a moving train'], ['She rides toward ' + dir + '’s light and away from ' + other + '’s, so she meets ' + dir + '’s first, and judges that ' + dir + ' struck first.']);
}
H.T(ID, B, [famGamma, famDilation, famLength, famAdd, famEmc, famFlash], 0.55);
