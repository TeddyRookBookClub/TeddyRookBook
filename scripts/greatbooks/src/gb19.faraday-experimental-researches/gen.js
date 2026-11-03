/* Faraday: Experimental Researches in Electricity. Bank (the 1831 experiments, the words he coined, fields, Henry,
   the candle) plus computed families: Faraday's law, magnetic flux, the transformer (Faraday's ring), electrolysis,
   charge from current, and the direction of the induced kick. Computed problems carry chk (their inputs). */
var ID = 'gb19.faraday-experimental-researches';
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function sf(v, n) { return +(+v).toPrecision(n || 3); }
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else if (o.tol) p.a.tol = o.tol; else p.a.form = 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function famEmf(R, lv) {
  var N = R.pick([50, 100, 200, 250, 400, 500]), A = R.pick([0.002, 0.003, 0.004, 0.005, 0.01]), B = R.pick([0.05, 0.1, 0.2, 0.25, 0.4, 0.5]), t = R.pick([0.05, 0.1, 0.2, 0.25, 0.5]);
  var dPhi = B * A, E = N * dPhi / t;
  if (lv === 1) {
    var dP = R.pick([0.001, 0.002, 0.004, 0.005]), tt = R.pick([0.1, 0.2, 0.5, 1]), NN = R.pick([10, 20, 50, 100]), EE = NN * dP / tt;
    return num('The magnetic flux through each turn of a ' + NN + '-turn coil changes by ' + dP + ' Wb in ' + tt + ' s. What average voltage is induced? (Faraday’s law: $\\mathcal{E} = N\\,\\Delta\\Phi/\\Delta t$.)', sf(EE, 3), 'V',
      ['$\\mathcal{E} = ' + NN + ' \\times \\dfrac{' + dP + '}{' + tt + '} = ' + sf(EE, 3) + '$ V.'], { rtol: 0.01, chk: { f: 'emf', N: NN, dPhi: dP, t: tt } });
  }
  return num('A magnet is thrust into a coil of ' + N + ' turns, each of area ' + A + ' m². The field through the coil rises from 0 to ' + B + ' T in ' + t + ' s. What average voltage is induced?', sf(E, 3), 'V',
    ['Change of flux per turn: $\\Delta\\Phi = B A = ' + B + ' \\times ' + A + ' = ' + sf(dPhi, 3) + '$ Wb.', '$\\mathcal{E} = N\\dfrac{\\Delta\\Phi}{\\Delta t} = ' + N + ' \\times \\dfrac{' + sf(dPhi, 3) + '}{' + t + '} = ' + sf(E, 3) + '$ V.'],
    { rtol: 0.01, hint: 'Flux = field × area; then multiply by the turns and divide by the time.', chk: { f: 'emfBA', N: N, B: B, A: A, t: t } });
}
function famFaster(R, lv) {
  var k = R.pick([2, 3, 4, 5]), E0 = R.pick([0.2, 0.5, 1.2, 1.5, 3]), what = R.pick(['speed', 'turns', 'both']);
  var E = what === 'both' ? E0 * k * 2 : E0 * k;
  var txt = what === 'speed' ? 'the magnet is pushed in ' + k + ' times as fast' : what === 'turns' ? 'the coil has ' + k + ' times as many turns' : 'the magnet is pushed in ' + k + ' times as fast and the coil has twice as many turns';
  return num('Pushing a magnet into a coil gives an average of ' + E0 + ' V. What average voltage do you get if ' + txt + '?', sf(E, 3), 'V',
    ['The voltage is proportional to the number of turns and to the rate of change of flux.', what === 'both' ? '$' + E0 + ' \\times ' + k + ' \\times 2 = ' + sf(E, 3) + '$ V.' : '$' + E0 + ' \\times ' + k + ' = ' + sf(E, 3) + '$ V.'],
    { rtol: 0.01, chk: { f: 'scale', E0: E0, k: what === 'both' ? 2 * k : k } });
}
function famTransformer(R, lv) {
  var V1 = R.pick([120, 240, 2400, 11000, 12]), N1 = R.pick([100, 200, 500, 1000, 1200, 2000]), N2 = R.pick([10, 20, 50, 100, 4000, 5000]);
  var V2 = V1 * N2 / N1;
  if (lv === 3 && R.coin()) {
    var want = R.pick([6, 9, 12, 24]), V0 = R.pick([120, 240]), Np = R.pick([600, 1200, 2400]), Ns = want * Np / V0;
    return num('Faraday’s iron ring with two coils is a transformer. For an alternating current, $V_2/V_1 = N_2/N_1$. How many turns must the second coil have to step ' + V0 + ' V down to ' + want + ' V, if the first coil has ' + texn(Np) + ' turns?', Ns, 'turns',
      ['$N_2 = N_1 \\times \\dfrac{V_2}{V_1} = ' + texn(Np) + ' \\times \\dfrac{' + want + '}{' + V0 + '} = ' + Ns + '$.'], { chk: { f: 'tN', N1: Np, V1: V0, V2: want } });
  }
  return num('A transformer has ' + texn(N1) + ' turns on its first coil and ' + texn(N2) + ' on its second. If ' + texn(V1) + ' V (alternating) goes into the first coil, what voltage comes out of the second?', sf(V2, 4), 'V',
    ['$V_2 = V_1 \\times \\dfrac{N_2}{N_1} = ' + texn(V1) + ' \\times \\dfrac{' + texn(N2) + '}{' + texn(N1) + '} = ' + texn(sf(V2, 4)) + '$ V.', 'A steady current would induce nothing, as Faraday found in 1831: only a changing one does.'],
    { rtol: 0.01, chk: { f: 'tV', V1: V1, N1: N1, N2: N2 } });
}
var METALS = [['copper', 63.55, 2], ['silver', 107.87, 1], ['zinc', 65.38, 2], ['nickel', 58.69, 2], ['gold', 196.97, 3], ['aluminum', 26.98, 3]];
function famElectrolysis(R, lv) {
  var m = R.pick(METALS), I = R.pick([0.5, 1, 1.5, 2, 2.5, 3, 5]), mins = R.pick([10, 15, 20, 30, 45, 60]), Q = I * mins * 60, mass = Q / 96485 / m[2] * m[1];
  if (lv === 1) {
    return num('A current of ' + I + ' A flows for ' + mins + ' minutes. How much charge passes, in coulombs? ($Q = It$)', Q, 'C',
      ['$Q = I t = ' + I + ' \\times ' + (mins * 60) + ' = ' + texn(Q) + '$ C.'], { rtol: 0.001, chk: { f: 'Q', I: I, t: mins * 60 } });
  }
  return num('Faraday’s law of electrolysis: a current of ' + I + ' A deposits ' + m[0] + ' (molar mass ' + m[1] + ' g/mol, ' + m[2] + ' electron' + (m[2] > 1 ? 's' : '') + ' per atom) for ' + mins + ' minutes. How many grams are deposited? Use 96,485 C per mole of electrons; give three significant figures.', sf(mass, 3), 'g',
    ['Charge: $Q = It = ' + I + ' \\times ' + (mins * 60) + ' = ' + texn(Q) + '$ C.', 'Moles of electrons: $' + texn(Q) + ' / 96{,}485 = ' + (Q / 96485).toFixed(4) + '$.', 'Moles of ' + m[0] + ': divide by ' + m[2] + ', then multiply by ' + m[1] + ' g/mol: about ' + sf(mass, 3) + ' g.'],
    { rtol: 0.01, chk: { f: 'elec', I: I, t: mins * 60, M: m[1], z: m[2] } });
}
function famDirection(R, lv) {
  var acts = [['The magnet is thrust into the coil', 'one way'], ['The magnet is held still inside the coil', 'not at all'], ['The magnet is pulled out of the coil', 'the opposite way'],
    ['The battery is connected to the first coil', 'one way'], ['A steady current flows in the first coil', 'not at all'], ['The battery is disconnected', 'the opposite way']];
  var i = R.int(0, 5), a = acts[i], setup = i < 3 ? 'In paragraph 39 Faraday thrust a magnet into a coil and the galvanometer needle kicked one way.' : 'In paragraph 10, connecting the battery to one coil made the needle on the other coil kick one way.';
  return H.mc(setup + ' ' + a[0] + '. How does the needle move?', a[1] === 'one way' ? 'It kicks the same way' : a[1] === 'not at all' ? 'It does not move' : 'It kicks the opposite way',
    ['It kicks the same way', 'It does not move', 'It kicks the opposite way', 'It swings steadily back and forth'],
    [a[1] === 'not at all' ? 'Nothing is changing, so nothing is induced.' : 'Only a change induces a current, and the opposite change gives the opposite kick.']);
}
var B = {
  facts: [
    ['Faraday found that a moving magnet can make an electric current in a coil.', true, 'Electromagnetic induction, 1831.'],
    ['A strong magnet held still inside a coil makes a steady current.', false, 'Only a change induces a current.'],
    ['Faraday’s first paper on induction was read to the Royal Society on November 24, 1831.', true, 'The First Series of the Experimental Researches.'],
    ['Faraday had a university education in mathematics.', false, 'He left school at 13 and taught himself; his papers have almost no equations.'],
    ['Faraday coined the words electrode, anode, cathode and ion, with help from William Whewell.', true, 'In his work on electrolysis, 1833–1834.'],
    ['Faraday pictured the space around magnets as filled with lines of force.', true, 'The start of the idea of a field.'],
    ['Joseph Henry discovered induction independently at about the same time.', true, 'Faraday published first.'],
    ['Faraday’s spinning copper disk was the first electric generator.', true, 'October 1831.'],
    ['Maxwell later turned Faraday’s lines of force into equations and found that light is an electromagnetic wave.', true, 'In 1855–1865.'],
    ['Faraday showed that a magnet can affect light passing through heavy glass.', true, 'The Faraday effect, 1845.'],
    ['Faraday found the link between gravity and electricity that he searched for.', false, 'He never found one; gravity is still treated separately.'],
    ['Faraday founded the Royal Institution’s Christmas Lectures for young people.', true, 'In 1825; he gave nineteen series.'],
    ['The Chemical History of a Candle shows that a burning candle produces water.', true, 'And carbon dioxide.'],
    ['Faraday found that electricity from batteries, friction and magnets are all the same thing.', true, 'The Third Series, 1833.'],
    ['Faraday began as an apprentice bookbinder.', true, 'He read the science books he bound.']
  ],
  items: [
    { q: 'Whose discovery of 1820 did Faraday try to reverse?', r: ['Ørsted’s: an electric current turns a compass needle'], w: ['Galvani’s: frogs’ legs twitch', 'Franklin’s: lightning is electricity', 'Volta’s: the battery'], why: 'If electricity can make magnetism, can magnetism make electricity?' },
    { q: 'Who hired Faraday as his assistant at the Royal Institution in 1813?', r: ['Humphry Davy'], w: ['Joseph Henry', 'John Dalton', 'William Whewell'], why: 'Faraday had sent Davy his notes of Davy’s lectures.' },
    { q: 'What did Faraday see when he switched the battery on and off in his first experiment?', r: ['A sudden, slight kick of the galvanometer, opposite each time'], w: ['A steady deflection while the current flowed', 'Sparks between the coils', 'Nothing at all'], why: 'Paragraph 10: while the current ran steadily, nothing.' },
    { q: 'What is the modern unit of electric capacitance named after Faraday?', r: ['The farad'], w: ['The henry', 'The tesla', 'The volt'], why: 'And the faraday, 96,485 coulombs, is a mole of electrons.' },
    { q: 'In Faraday’s law, what makes the induced voltage bigger?', r: ['More turns and a faster change of magnetic flux'], w: ['A heavier coil', 'A longer wire to the meter', 'Holding the magnet still for longer'], why: '$\\mathcal{E} = N\\,\\Delta\\Phi/\\Delta t$.' },
    { q: 'What everyday machine works on Faraday’s discovery of induction?', r: ['The generator in a power station'], w: ['A candle', 'A steam whistle', 'A mechanical clock'], why: 'Spinning magnets and coils make almost all our electricity.' },
    { q: 'How are the Experimental Researches organized?', r: ['In numbered paragraphs, across 30 series of papers'], w: ['As a dialogue between two friends', 'As a long poem', 'As a single short letter'], why: 'He refers back to earlier paragraphs by number.' },
    { q: 'What object did Faraday choose to teach children all of science, in his Christmas Lectures of 1860–1861?', r: ['A candle'], w: ['A magnet', 'An apple', 'A clock'], why: '“There is no more open door by which you can enter into the study of natural philosophy.”' },
    { q: 'What did Maxwell say about Faraday’s way of thinking?', r: ['It was mathematical, though not written in symbols'], w: ['It had no value for science', 'It was copied from Ampère', 'It was only about chemistry'], why: 'From the preface to Maxwell’s Treatise on Electricity and Magnetism (1873).' }
  ]
};
H.T(ID, B, [famEmf, famFaster, famTransformer, famElectrolysis, famDirection,
  function (R, lv) { return H.famBefore(R, lv, ID); }, function (R, lv) { return H.famWhoWrote(R, lv, ID); }], 0.55);
