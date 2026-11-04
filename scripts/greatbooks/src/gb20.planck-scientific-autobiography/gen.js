/* Planck: Scientific Autobiography (no excerpts: English 1949). Bank (blackbody radiation, the discovery of 1900,
   Planck's principle, his life) plus computed families: Wien's peak wavelength (both ways), the energy of one quantum
   E = hc/λ, Stefan–Boltzmann ratios (T⁴), and photons per second from a light source. */
var ID = 'gb20.planck-scientific-autobiography';
var B = {
  facts: [
    ['Planck presented his quantum hypothesis on 14 December 1900.', true, 'Often called the birthday of quantum theory.'],
    ['Planck assumed energy is exchanged in packets E = hf.', true, 'f is the frequency, h Planck’s constant.'],
    ['Planck set out from the start to overthrow classical physics.', false, 'He was cautious and hoped for years to fit quanta back into classical physics.'],
    ['A hotter blackbody’s glow peaks at a shorter wavelength.', true, 'Wien’s displacement law.'],
    ['The classical (Rayleigh–Jeans) formula predicted infinite brightness at short wavelengths.', true, 'The "ultraviolet catastrophe."'],
    ['Einstein in 1905 treated light quanta as real particles of light.', true, 'Planck at first resisted this.'],
    ['Planck’s principle says new scientific truths usually win because their opponents are persuaded by argument.', false, 'He said they win as opponents pass away and a new generation grows up with them.'],
    ['Planck won the Nobel Prize in Physics in 1918.', true, 'For the discovery of energy quanta.'],
    ['Planck’s constant h is now used to define the kilogram.', true, 'Since 2019.'],
    ['Blue light comes in smaller quanta than red light.', false, 'Higher frequency means more energy per quantum.'],
    ['The Max Planck Society was named after him.', true, 'After the Second World War.'],
    ['Heinrich Rubens checked Planck’s new formula against his measurements.', true, 'It fit.']
  ],
  items: [
    { q: 'What is a blackbody?', r: 'An ideal object that absorbs all light, whose glow depends only on its temperature', w: ['Any object painted black', 'A black hole', 'A cold piece of coal', 'A body with no atoms'], why: 'Kirchhoff showed its spectrum is a universal law.' },
    { q: 'What was the "ultraviolet catastrophe"?', r: 'The classical prediction of infinite brightness at short wavelengths', w: ['A sunburn epidemic', 'A failed telescope', 'An explosion in Planck’s lab', 'The collapse of the atom'], why: 'Planck’s law removes it.' },
    { q: 'What is Planck’s constant h about?', r: '6.63 × 10⁻³⁴ J·s', w: ['3.0 × 10⁸ m/s', '9.8 m/s²', '1.6 × 10⁻¹⁹ C', '6.0 × 10²³'], why: 'The others are the speed of light, gravity, the electron’s charge and Avogadro’s number.' },
    { q: 'How did Planck describe the way new ideas win acceptance?', r: 'A new generation grows up familiar with them as opponents pass away', w: ['Opponents are always convinced by evidence at once', 'Governments decide', 'The oldest scientists choose', 'A vote of scientists'], why: 'Now called Planck’s principle.' },
    { q: 'What did Planck call questions that only seem deep because they are badly posed?', r: 'Phantom problems', w: ['Quantum problems', 'Absolute problems', 'Black problems', 'Final problems'], why: 'One of the "other papers."' },
    { q: 'What was Planck’s first love in physics?', r: 'The law of conservation of energy', w: ['Astronomy', 'Electricity', 'Chemistry', 'Optics'], why: 'His early work was in thermodynamics.' }
  ]
};
function famWien(R, lv) {
  var T = R.pick([3000, 4000, 5800, 6000, 10000, 1500, 300]), lam = 2.898e6 / T;
  if (R.next() < 0.6) return H.num('By Wien’s law, λ_peak = 2,898,000 nm·K ÷ T. Where does a blackbody at ' + T.toLocaleString('en-US') + ' K peak, to the nearest nanometer?', Math.round(lam),
    ['2,898,000 ÷ ' + T.toLocaleString('en-US') + ' ≈ ' + Math.round(lam) + ' nm.', lam > 750 ? 'That is infrared.' : lam < 380 ? 'That is ultraviolet.' : 'That is visible light.'], { rtol: 0.01, unit: 'nm' });
  var L = R.pick([500, 580, 725, 966, 290]), TT = 2.898e6 / L;
  return H.num('A star’s glow peaks at ' + L + ' nm. Using T = 2,898,000 nm·K ÷ λ_peak, about how hot is its surface (K)?', Math.round(TT),
    ['2,898,000 ÷ ' + L + ' ≈ ' + Math.round(TT) + ' K.'], { rtol: 0.01, unit: 'K' });
}
function famQuantum(R, lv) {
  var L = R.pick([400, 450, 500, 550, 600, 650, 700]), E = 6.63e-34 * 3e8 / (L * 1e-9), m = E / 1e-19;
  return H.num('How much energy is in one quantum of light of wavelength ' + L + ' nm? Use E = hc/λ with h = 6.63 × 10⁻³⁴ J·s and c = 3.0 × 10⁸ m/s. Give the number in units of 10⁻¹⁹ J (2 decimal places).', +m.toFixed(2),
    ['hc = 6.63 × 10⁻³⁴ × 3.0 × 10⁸ = 1.989 × 10⁻²⁵ J·m.', 'λ = ' + L + ' × 10⁻⁹ m.', 'E = 1.989 × 10⁻²⁵ ÷ ' + L + ' × 10⁻⁹ ≈ ' + m.toFixed(2) + ' × 10⁻¹⁹ J.'], { form: 'dec', rtol: 0.01 });
}
function famStefan(R, lv) {
  var k = R.pick([2, 3, 0.5, 1.5]), r = Math.pow(k, 4);
  return H.num('A blackbody’s total glow grows as T⁴. If its temperature is multiplied by ' + k + ', by what factor does its total glow change?', +r.toFixed(4),
    [k + '⁴ = ' + +r.toFixed(4) + '.'], { form: 'dec', rtol: 0.01 });
}
function famPhotons(R, lv) {
  var P = R.pick([1, 2, 5, 10]), L = R.pick([500, 600, 400]), E = 6.63e-34 * 3e8 / (L * 1e-9), n = P / E, m = n / 1e18;
  return H.num('A ' + P + '-watt lamp gives out light of wavelength ' + L + ' nm. Each quantum carries ' + (E / 1e-19).toFixed(2) + ' × 10⁻¹⁹ J. About how many quanta does it emit per second, in units of 10¹⁸? (1 decimal place)', +m.toFixed(1),
    [P + ' J per second ÷ ' + (E / 1e-19).toFixed(2) + ' × 10⁻¹⁹ J ≈ ' + m.toFixed(1) + ' × 10¹⁸ quanta per second.', 'So many that the light looks smooth.'], { form: 'dec', rtol: 0.03 });
}
H.T(ID, B, [famWien, famQuantum, famStefan, famPhotons, function (R, lv) { return H.famBefore(R, lv, ID); }], 0.5);
