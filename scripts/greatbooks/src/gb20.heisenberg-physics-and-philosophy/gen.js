/* Heisenberg: Physics and Philosophy (no excerpts: 1958). Bank (his life, the principle, the microscope, the
   Copenhagen interpretation, the Greek parallels) plus computed families: the minimum momentum spread
   Δp = ħ/(2Δx), the minimum velocity spread for an electron, proton or ball, and how the spread scales. */
var ID = 'gb20.heisenberg-physics-and-philosophy';
var HB = 1.055e-34;
var B = {
  facts: [
    ['Heisenberg found the first form of quantum mechanics on the island of Helgoland in 1925.', true, 'Matrix mechanics.'],
    ['The uncertainty principle says Δx · Δp is at least ħ/2.', true, 'ħ = h/2π.'],
    ['The uncertainty principle only reflects clumsy measuring tools that better tools will overcome.', false, 'It comes from the wave description itself, as Bohr stressed and Heisenberg accepted.'],
    ['Physics and Philosophy grew from Gifford Lectures at the University of St Andrews in 1955–56.', true, 'Published in 1958.'],
    ['Heisenberg compared the quantum wave to Aristotle’s idea of potentiality.', true, 'A tendency toward events.'],
    ['Heisenberg thought elementary particles are more like Democritus’ hard atoms than like Plato’s mathematical forms.', false, 'The reverse.'],
    ['For a baseball the uncertainty principle is far too small to notice.', true, 'Because its mass is enormous compared with an electron’s.'],
    ['Heisenberg led part of Germany’s nuclear research during the Second World War.', true, 'His aims and role are still debated by historians.'],
    ['In the Copenhagen interpretation, experiments must be described in the concepts of classical physics.', true, 'Used in limited, complementary ways.'],
    ['Einstein fully accepted the Copenhagen interpretation.', false, 'He remained its great critic.'],
    ['Heisenberg saw Heraclitus’ fire as close to the modern idea of energy.', true, 'Energy changing into particles and back.'],
    ['Heisenberg received the Nobel Prize for 1932.', true, 'For creating quantum mechanics.']
  ],
  items: [
    { q: 'What does the uncertainty principle say?', r: 'The more exactly a particle’s position is fixed, the less exactly its momentum can be', w: ['Atoms can’t be measured at all', 'Particles move faster than light', 'All measurements are wrong', 'Energy is never conserved'], why: 'Δx Δp ≥ ħ/2.' },
    { q: 'In Heisenberg’s microscope thought experiment, why does seeing an electron sharply disturb it?', r: 'Short-wavelength light, needed for a sharp image, gives it a big kick', w: ['The microscope is too heavy', 'The electron is afraid of light', 'The lens heats the electron', 'Long waves push it away'], why: 'Short wavelength means large momentum.' },
    { q: 'Which ancient philosopher did Heisenberg think modern particle physics resembles most?', r: 'Plato (in the Timaeus)', w: ['Democritus', 'Epicurus', 'Lucretius', 'Thales'], why: 'Particles as mathematical forms.' },
    { q: 'What gives probabilities in quantum mechanics?', r: 'The wave function', w: ['The speed of light', 'The mass of the nucleus', 'A coin toss by the observer', 'The temperature'], why: 'Observation turns possibilities into one fact.' },
    { q: 'Where did Heisenberg give the lectures that became Physics and Philosophy?', r: 'St Andrews, Scotland', w: ['Copenhagen', 'Princeton', 'Göttingen', 'Paris'], why: 'The Gifford Lectures, 1955–56.' },
    { q: 'Who were Heisenberg’s main teachers and colleagues in the 1920s?', r: 'Sommerfeld, Born and Bohr', w: ['Newton, Leibniz and Huygens', 'Darwin, Huxley and Wallace', 'Faraday, Maxwell and Kelvin', 'Freud, Jung and Adler'], why: 'Munich, Göttingen and Copenhagen.' }
  ]
};
function sci(x) { var e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e); return +m.toFixed(2) + ' × 10<sup>' + String(e).replace('-', '−') + '</sup>'; }
function famDp(R, lv) {
  var m = R.pick([1, 2, 5]), e = R.pick([-10, -11, -12, -9]), dx = m * Math.pow(10, e), dp = HB / (2 * dx), ex = Math.floor(Math.log10(dp)), mant = dp / Math.pow(10, ex);
  return H.num('A particle is located to within Δx = ' + m + ' × 10<sup>' + e + '</sup> m. Using Δp ≥ ħ/(2Δx) with ħ = 1.055 × 10⁻³⁴ J·s, find the least Δp. Give the number that multiplies 10<sup>' + ex + '</sup> kg·m/s (2 decimal places).', +mant.toFixed(2),
    ['2Δx = ' + sci(2 * dx) + ' m.', 'Δp = 1.055 × 10⁻³⁴ ÷ ' + sci(2 * dx) + ' ≈ ' + sci(dp) + ' kg·m/s.'], { form: 'dec', rtol: 0.02 });
}
function famDv(R, lv) {
  var who = R.pick([['an electron', 9.11e-31], ['a proton', 1.67e-27]]), dx = R.pick([1e-10, 1e-9, 1e-15, 5e-11]), dv = HB / (2 * who[1] * dx);
  var ex = Math.floor(Math.log10(dv)), right = sci(dv) + ' m/s';
  var w = [sci(dv * 1000) + ' m/s', sci(dv / 1000) + ' m/s', sci(dv * 1e6) + ' m/s'];
  return H.mc('What is the least spread in velocity of ' + who[0] + ' (mass ' + sci(who[1]) + ' kg) confined to Δx = ' + sci(dx) + ' m? (Δv = ħ/(2mΔx))', right, w,
    ['Δv = 1.055 × 10⁻³⁴ ÷ (2 × ' + sci(who[1]) + ' × ' + sci(dx) + ').', '≈ ' + right + '.']);
}
function famScale(R, lv) {
  var k = R.pick([2, 3, 4, 10]);
  if (R.next() < 0.5) return H.num('If you pin down a particle’s position ' + k + ' times more tightly (Δx divided by ' + k + '), by what factor does the least momentum spread grow?', k,
    ['Δp is proportional to 1/Δx, so it grows ' + k + ' times.']);
  return H.mc('Two particles are confined to the same Δx. One is 1,000 times heavier. How does its least velocity spread compare?', '1,000 times smaller',
    ['1,000 times larger', 'The same', '√1000 times smaller'], ['Δv = ħ/(2mΔx): heavier means smaller Δv, in proportion.']);
}
H.T(ID, B, [famDp, famDv, famScale, function (R, lv) { return H.famWhen(R, lv, ID); }], 0.5);
