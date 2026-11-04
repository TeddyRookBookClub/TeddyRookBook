/* Bohr: Atomic Theory and the Discussion with Einstein (no excerpts: English 1934 and 1949). Bank (the 1913 atom,
   complementarity, the Solvay debates, EPR, reception) plus computed families: hydrogen's levels E_n = −13.6/n²,
   photon energy and wavelength for a jump, which series a jump belongs to, ionization energy, orbit radius. */
var ID = 'gb20.bohr-atomic-theory';
var B = {
  facts: [
    ['In Bohr’s 1913 model the electron gives off light only when it jumps from one allowed state to a lower one.', true, 'As one photon carrying the energy difference.'],
    ['In Bohr’s model an electron can have any energy at all.', false, 'Only certain allowed energies, the stationary states.'],
    ['Bohr worked with Ernest Rutherford in Manchester before his 1913 theory.', true, 'Rutherford had found the atomic nucleus.'],
    ['Complementarity says wave and particle pictures are both needed, each in its own kind of experiment.', true, 'Bohr first set it out at Como in 1927.'],
    ['Bohr and Einstein debated quantum physics at the Solvay conferences of 1927 and 1930.', true, 'In Brussels.'],
    ['Bohr answered Einstein’s 1930 light-box puzzle using Einstein’s own general relativity.', true, 'Weighing the box moves its clock in gravity, changing its rate.'],
    ['Einstein accepted in the end that nature at bottom runs on chance.', false, 'He never accepted it.'],
    ['Bohr’s model explained hydrogen’s spectral lines for the first time.', true, 'Including the visible Balmer series.'],
    ['Quantum mechanics kept the idea of electrons moving on definite planetary orbits.', false, 'It kept the energy levels but replaced orbits with probability clouds.'],
    ['Bohr founded the Institute for Theoretical Physics in Copenhagen.', true, 'In 1921.'],
    ['Bohr won the Nobel Prize in Physics in 1922.', true, 'For his work on atomic structure.'],
    ['Bohr’s Discussion with Einstein was written in 1949 for a book in Einstein’s honor.', true, 'Albert Einstein: Philosopher-Scientist.']
  ],
  items: [
    { q: 'What happens when an electron in Bohr’s atom falls to a lower level?', r: 'The atom gives off one photon carrying the energy difference', w: ['The atom explodes', 'The electron leaves the atom', 'The nucleus gets heavier', 'Nothing at all'], why: 'hf = E(upper) − E(lower).' },
    { q: 'What did Bohr call the idea that wave and particle descriptions are both needed?', r: 'Complementarity', w: ['Relativity', 'Uncertainty', 'Correspondence', 'Conservation'], why: 'Como, 1927.' },
    { q: 'Which jumps in hydrogen give visible light?', r: 'Jumps down to level 2 (the Balmer series)', w: ['Jumps down to level 1', 'Jumps up from level 1', 'Jumps down to level 4', 'No jumps give visible light'], why: 'Jumps to level 1 give ultraviolet; to level 3, infrared.' },
    { q: 'Why couldn’t the old physics explain stable atoms?', r: 'A circling electron should radiate, lose energy and spiral into the nucleus', w: ['Electrons are too heavy', 'Atoms have no nucleus', 'Light has no energy', 'Gravity pulls electrons out'], why: 'In a tiny fraction of a second.' },
    { q: 'In 1935, with Podolsky and Rosen, what did Einstein argue?', r: 'That quantum mechanics is an incomplete description of reality', w: ['That atoms do not exist', 'That light is only a wave', 'That relativity was wrong', 'That Bohr’s energy levels were wrong'], why: 'Bohr replied the same year.' },
    { q: 'What language did Bohr insist every experiment must still be described in?', r: 'Ordinary language, the language of the laboratory', w: ['Latin', 'Pure mathematics only', 'Danish', 'A new symbolic code'], why: 'Even when what we describe is not ordinary.' },
    { q: 'What became known as the "Copenhagen interpretation"?', r: 'The view of quantum mechanics built around Bohr’s complementarity', w: ['A map of Denmark', 'Einstein’s theory of gravity', 'A treaty on atomic weapons', 'Rutherford’s model of the atom'], why: 'For decades the standard way of talking about quantum mechanics.' }
  ]
};
function E(n) { return -13.6 / (n * n); }
function f3(x) { return +x.toFixed(3); }
function jump(R) { var lo = R.pick([1, 2, 2, 2, 3]), hi = lo + R.int(1, 3); return [hi, lo]; }
function famLevel(R, lv) {
  var n = R.int(1, 6);
  return H.num('In Bohr’s model, E_n = −13.6 eV ÷ n². What is the energy of level n = ' + n + '? (eV, 2 decimal places)', +E(n).toFixed(2),
    ['n² = ' + (n * n) + '.', '−13.6 ÷ ' + (n * n) + ' ≈ ' + E(n).toFixed(2) + ' eV.'], { form: 'dec', rtol: 0.01, unit: 'eV' });
}
function famPhoton(R, lv) {
  var j = jump(R), dE = E(j[0]) - E(j[1]), lam = 1239.84 / dE;
  if (lv === 1 || R.next() < 0.4) return H.num('Hydrogen’s electron falls from n = ' + j[0] + ' to n = ' + j[1] + '. What is the photon’s energy in eV? (2 decimal places)', +dE.toFixed(2),
    ['E_' + j[0] + ' = ' + f3(E(j[0])) + ' eV; E_' + j[1] + ' = ' + f3(E(j[1])) + ' eV.', 'ΔE = ' + f3(E(j[0])) + ' − (' + f3(E(j[1])) + ') = ' + dE.toFixed(2) + ' eV.'], { form: 'dec', rtol: 0.01, unit: 'eV' });
  return H.num('Hydrogen’s electron falls from n = ' + j[0] + ' to n = ' + j[1] + '. Using λ ≈ 1240 ÷ ΔE (nm, with ΔE in eV), find the wavelength to the nearest nanometer.', Math.round(lam),
    ['ΔE = 13.6 × (1/' + (j[1] * j[1]) + ' − 1/' + (j[0] * j[0]) + ') = ' + dE.toFixed(3) + ' eV.', 'λ ≈ 1240 ÷ ' + dE.toFixed(3) + ' ≈ ' + Math.round(lam) + ' nm.'], { rtol: 0.01, unit: 'nm' });
}
function famSeries(R, lv) {
  var j = jump(R), names = { 1: 'Ultraviolet (the Lyman series)', 2: 'Visible light (the Balmer series)', 3: 'Infrared (the Paschen series)' };
  var r = names[j[1]];
  return H.mc('A hydrogen atom’s electron falls from n = ' + j[0] + ' to n = ' + j[1] + '. What kind of light comes out?', r, Object.keys(names).map(function (k) { return names[k]; }).concat(['Radio waves (no series)']),
    ['Falls to level 1: ultraviolet. To level 2: visible. To level 3: infrared.']);
}
function famIonize(R, lv) {
  var n = R.int(1, 5);
  return H.num('How much energy (eV) is needed to pull hydrogen’s electron free from level n = ' + n + '? (2 decimal places)', +(13.6 / (n * n)).toFixed(2),
    ['Free means E = 0.', 'From E_' + n + ' = ' + E(n).toFixed(2) + ' eV up to 0 takes ' + (13.6 / (n * n)).toFixed(2) + ' eV.'], { form: 'dec', rtol: 0.01, unit: 'eV' });
}
function famRadius(R, lv) {
  var n = R.int(2, 6);
  return H.num('In Bohr’s model the orbit radius grows as n². If level 1 has radius 0.053 nm, what is the radius of level ' + n + '? (nm, 3 decimal places)', +(0.053 * n * n).toFixed(3),
    ['n² = ' + (n * n) + '.', '0.053 × ' + (n * n) + ' = ' + (0.053 * n * n).toFixed(3) + ' nm.'], { form: 'dec', rtol: 0.01, unit: 'nm' });
}
H.T(ID, B, [famLevel, famPhoton, famSeries, famIonize, famRadius, function (R, lv) { return H.famWhen(R, lv, ID); }], 0.55);
