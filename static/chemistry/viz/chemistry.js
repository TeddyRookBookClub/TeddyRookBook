/* chemistry/viz/chemistry.js: the Chemistry Ladder's interactive visuals (35 of them, all named ch-…).
   Load after math/viz/core.js; the engine loads this file on its own for any visual whose name starts with "ch-".
   Pure JavaScript, no libraries, no network. Every visual is a canvas plus ordinary HTML controls.

   ---------------------------------------------------------------------------------------------------------------
   HOW TO USE ONE IN A LESSON
     A visual is a div with a name and a JSON object of options:
       <div class="ml-viz" data-viz="ch-titration" data-opts='{"acid":{"type":"weak","Ka":1.8e-5,"C":0.1,"V":25}}'></div>
     Every option has a sensible default, so data-opts can be left out entirely.

   OPTIONS EVERY VISUAL TAKES
     quiet: false        true hides every number or label that would give away an answer (computed results, the name
                         of a mystery element, the pH at the pointer, and so on). The picture and the controls stay, so
                         a learner can still work the problem. readout: false means the same thing.
     edit: true          false freezes the visual: no buttons or sliders, no dragging; a figure for the page.
     task: ''            a short instruction shown above the picture ("Balance the equation."). When the visual can tell
                         the learner has done it, the instruction gets a green check.
     label: ''           a replacement for the visual's own title as its accessible name (the name screen readers
                         announce for the visual and its canvas).
     height: null        a fixed canvas height in px; leave it out and the canvas keeps a good shape at any width.

   WHAT EVERY VISUAL DOES ON ITS OWN
     - light and dark themes (follows the site's toggle), widths down to 320 px without sideways scrolling
     - mouse, touch and keyboard: anything you can drag can also be moved with the arrow keys once the canvas has focus
       (Tab to it), and Enter picks
     - an aria-label on the canvas and a short text alternative (the sr-only paragraph it points to), kept up to date
     - nothing moves by itself when the reader prefers reduced motion; a Play button appears instead
     - animation pauses while the visual is off screen

   FORMULAS AND EQUATIONS IN OPTIONS
     Plain strings: 'H2O', 'Ca3(PO4)2', 'CuSO4·5H2O', 'SO4^2-' (or 'SO42-' / 'NO3-'), 'Fe3+'.
     Equations: '2H2 + O2 -> 2H2O' (also '→'); equilibria use '<=>' ('N2+3H2<=>2NH3').
     Configurations follow the filling order: [Ar] 4s² 3d⁶ (OpenStax and AP use the same order).

   FOR COURSE BUILDERS: MathLadder.chem
     The models behind the pictures are exported so a lesson's text or a checker can use the same numbers:
     parseF(f) {atoms, charge}, molarMass(f), fH(f) (HTML with subscripts), fT(f) (plain Unicode), parseEq(s), eqH(eq),
     config(Z, charge), cfgStr(Z, charge, {short, html}), shells(Z), valence(Z), el('Fe') (an element record),
     titrPH(acid, Cbase, mL), phSolve(f), cellCalc(anode, cathode, [anode ion], [cathode ion]), halfLife(order, k, A),
     conc(order, k, A0, t), mbFrac(Ea, T), mbSpeed(v, kg/mol, T), antoineH2O(°C), heatSegments(sub, g, T1, T2),
     bornHaber(salt), morse(pair), moFill(mol, charge), lewStruct(key), lewCalc(struct), sigDigits(str), solAt(salt, °C),
     photon(nm), hLevel(n), nucParse('U-238'), decayOf(nuclide, mode), K (exact SI constants), KP (the rounded
     constants problems use: h 6.626e-34, c 3.00e8, NA 6.022e23, R 8.314 and 0.08206, F 96485).

   SOURCES
     Element data: IUPAC atomic weights (NIST), Cordero 2008 covalent radii, NIST ASD ionization energies, Allred's
     revised Pauling electronegativities. Thermodynamic data: NIST Chemistry WebBook as tabulated in OpenStax Chemistry 2e
     (Appendix G); reduction potentials: OpenStax Appendix L; solubilities: CRC Handbook; Henry's-law constants:
     Sander 2015; half-lives: NNDC NuDat; ionic radii: Shannon 1976. Each table's source is noted beside it below.
     Pictures that are not to scale say so on the canvas.

   ---------------------------------------------------------------------------------------------------------------
   THE 35 VISUALS AND THEIR OPTIONS
   (the value after each option is its default)

   ch-particles: the particle view of matter (Johnstone's middle level). One to four boxes of atoms, molecules and ions.
    opts:
      mode: 'sort'                  'sort' | 'state' | 'react' | 'dissolve' | 'ionize' | 'mix' | 'osmosis' | 'equilibrium'
      names: ['A','B','C','D']      box labels
      motion: true                  gentle motion (off with reduced motion; a Play button appears instead)
      seed: 1                       fixed layout for a problem
      labels: true                  formula tags beside the particles' legend (false: none); atoms: true writes symbols on atoms
      tally: true                   the counts table under the picture (react, mix, equilibrium, dissolve, ionize)
      sort:        boxes: [[{f:'H2', n:4}], [{f:'H2', n:2}, {f:'O2', n:2}], …], legend: true (each box's kind), state: 'gas'|'liquid'|'solid'
      state:       f: 'H2O', state: 'solid'|'liquid'|'gas'|'all' (three boxes), T: true (a temperature slider) or a starting °C
      react:       eq: '2H2 + O2 -> 2H2O', sets: 2 (times the reaction runs) or amounts: {H2: 5, O2: 2} (molecules before;
                   the reaction runs until one runs out), regroup: true (a button that replays the atoms regrouping)
      dissolve:    solute: 'NaCl' | 'KCl' | 'CaCl2' | 'C12H22O11' | 'C6H12O6' | 'C2H5OH' or a list of two to compare; n: 6;
                   water: true (draw the water molecules and the hydration shells)
      ionize:      acid: 'HCl' (or 'HBr','HI','HNO3','HClO4','CH3COOH','HCOOH','HF','HCN','HOCl','NaOH','KOH','NH3',
                   'C12H22O11','C2H5OH'), or acids: [two or three to compare]; C: 8 (particles of solute per box); frac (fraction
                   ionized, drawn); M: 0.10 (molarity used for the exact percent ionized from Ka); bulb: true
      mix:         a: {f:'AgNO3', n:3}, b: {f:'NaCl', n:3}, spectators: true (ring the spectator ions)
      osmosis:     left: 0, right: 8 (solute particles on each side of the membrane)
      equilibrium: species: [{f:'NO2', n:6}, {f:'N2O4', n:3}] (2 NO2 ⇌ N2O4, or A ⇌ B with one atom each side)
    quiet: hides the kind names in the legend, the tally totals and the balanced check, the state name, the percent
      ionized and the precipitate's name. Particles and their formula tags stay unless labels: false.

   ch-atom: build an atom from protons, neutrons and electrons; the gold-foil experiment; the history of atomic models.
    opts:
      mode: 'build'                 'build' | 'goldfoil' | 'models'
      p: 6, n: 6, e: 6              protons, neutrons, electrons (build); edit: true adds − and + buttons for each
      view: 'shells'                'shells' (Bohr picture) | 'cloud'
      show: ['symbol','name','charge','mass','shells']   what the card shows (default all)
      highlight: 'valence'          colors the outer shell
      motion: true                  electrons circle on their own (never when the reader prefers reduced motion; then a Play button)
      goldfoil: thomson: true (a button to compare with Thomson's prediction)
    quiet: hides the element name and symbol, the charge, the mass number and the shell counts in text; the drawing stays
      so learners can count.

   ch-periodic: the periodic table (118 elements, f block below), trend maps and trend charts.
    opts:
      mode: 'category'              'category' | 'block' | 'valence' | 'charges' | 'trend' | 'chart' | 'successive'
      prop: 'ie1'                   trend and chart: 'radius' (covalent radius) | 'ie1' | 'en' | 'mass'
      el: 'Na'                      the selected element (successive: Z ≤ 20)
      scale: 'linear'               successive: 'linear' | 'log'
      highlight: ['Na','Mg']        outline these cells
      mystery: 'Se'                 a blank "?" cell at that element's place
      modes: […]                    which views get buttons (default: the starting one only; lessons can offer several)
    quiet: hides the card's numbers and configuration, the heat-map legend values, the chart's values, the "big jump"
      marker and the mystery cell's identity.

   ch-orbitalbox: orbital diagrams with boxes at their energies; Aufbau, Pauli and Hund; ions; quantum numbers;
    crystal-field splitting.
    opts:
      Z: 26, charge: 0              the atom (Z ≤ 54) and, in 'ion' mode, the ion's charge (default +2)
      mode: 'fill'                  'fill' | 'ion' | 'qn' | 'field'
      step: Z                       electrons shown at the start (fill mode; 0 starts empty)
      edit: true                    learner mode in 'fill': tap boxes to place arrows (empty → ↑ → ↑↓ → ↓ → empty); notes
                                    when a rule is broken. Pass place: true to start empty for the learner
      place: false
      order: 'fill'                 configuration written in filling order ('fill') or by shell ('n')
      field: d: 6, geometry: 'oct' | 'tet' | 'sqpl', delta: 240 (kJ/mol, the splitting), pairing: 200 (kJ/mol),
             spin: 'high' | 'low' (overrides delta against pairing), ion: 'Fe2+' (a label)
    quiet: hides the configuration string, the unpaired count, the paramagnetic/diamagnetic verdict, the quantum-number
      card and, in field mode, the spin label and absorbed color.

   ch-pes: a photoelectron spectrum. Peak position = binding energy of a subshell (MJ/mol, increasing to the left as on
    the AP exam); peak height ∝ electrons in the subshell. Tap a peak to name it.
    opts: el: 'Na' (or Z; H to Ca), compare: 'Mg' (a second element, outlined), labels: true (subshell names on peaks),
          axis: 'left-high' | 'right-high', scale: 'log' | 'broken'
    quiet: hides the subshell labels and the binding-energy values; positions and heights stay.
    Data: approximate binding energies of free atoms in MJ/mol (the standard teaching table; outer subshells agree with
    the NIST first ionization energies, core values with gas-phase photoelectron measurements). Z ≤ 20 only: beyond
    calcium the 3d and 4s peaks overlap and our sources do not give free-atom values for every subshell.

   ch-massspec: the mass spectrum of an element, with a balance beam whose balance point is the average atomic mass.
    opts: el: 'Cl' (presets B, Ne, Mg, Si, Cl, Cu, Br, Zr) or isotopes: [{m: 62.93, ab: 69.15}, …] (ab in percent);
          norm: 'percent' | 'tallest' (bar heights); avg: true (show the balance point); diatomic: true (Cl₂ or Br₂);
          drag: the learner drags the fulcrum to find the balance point (edit: true)
    quiet: hides the average readout and the abundance numbers (bars and the mass axis stay).
    Data: isotopic masses (u) and abundances (atom %), NIST "Atomic Weights and Isotopic Compositions".

   ch-coulomb: charge and distance explain the trends.
    opts: mode: 'atom' | 'ions' | 'isoelectronic'
      atom: a: 'Na', b: 'Cl' (two atoms side by side; Z ≤ 36); show: ['zeff','bar','radius']
      ions: pairs: [['Na+','Cl-'],['K+','Cl-'],['Mg2+','O2-']]
      isoelectronic: list: ['O2-','F-','Na+','Mg2+','Al3+']
    quiet: hides every number and the attraction bars, and draws the atoms or ions at one generic size, keeping only
      their charges and shell counts.
    Data: covalent radii from the shared element table (Cordero 2008); ionic radii for six-coordinate ions,
    R. D. Shannon, Acta Crystallographica A32 (1976) 751, the "effective ionic radii" that textbook figures use.

   ch-lewis: Lewis dot symbols and Lewis structures.
    opts:
      mol: 'H2O'                    a species from the library (about 60: H2 … ICl4-, HClO to HClO4, HNO3, H2SO4, SCN-, CN-, …)
                                    or a custom {atoms: [[sym, x, y, lonePairs]], bonds: [[i, j, order]], q}
      mode: 'structure'             'dots' | 'structure' | 'build' | 'resonance' | 'transfer' | 'adduct'
      el: 'Cl', charge: 0           dots: an element's dot symbol (an ion with charge)
      fc: true, budget: true        formal charges; the electron budget (valence electrons available against placed)
      form: 'alt'                   structure: the expanded-octet form where the library has one (SO4^2-, SO2, HClO4, …)
      transfer: a: 'Na', b: 'Cl'    electron transfer from a metal to a nonmetal (MgCl2, Na2O… worked out from charges)
      adduct: pair: 'NH3+BF3' | 'H2O+H+' | 'NH3+H+'
    quiet: hides formal charges, the electron budget, octet checks and the "best structure" marker.

   ch-vsepr: molecular shape in 3-D, polarity, hybrid orbitals, complexes and isomers. Drag (or arrow keys) to turn.
    opts:
      mol: 'H2O'                    a species from the Lewis library, or {bonds: 3, lone: 1, ligands: ['H','H','H'], center: 'N'}
      mode: 'shape'                 'shape' | 'polarity' | 'diatomic' | 'hybrid' | 'complex' | 'isomers'
      show: ['angles','names','dipoles','lonepairs','hybrid','pi']
      dipoles: true                 bond dipoles in quiet mode too
      en: [2.20, 3.16]              diatomic: two electronegativities (or pair: ['H','Cl']); a slider changes the difference
      complex: geometry: 'oct' | 'tet' | 'sqpl', metal: 'Co', ligands: ['NH3', …], charge
      isomers: pair: 'cis-trans' | 'mirror' | 'same', geometry: 'sqpl' | 'oct'
    quiet: hides the shape names, angle values, hybridization labels, the net dipole arrow and the polar/nonpolar verdict.

   ch-bondcurve: potential energy against the distance between two nuclei (a Morse curve).
    opts: pair: 'H2' | 'HCl' | 'Cl2' | 'N2' | 'O2' | 'HF' | 'F2' | 'Br2' | 'I2'; compare: 'Cl2' (a second curve);
          parts: true (the repulsive and attractive parts); r: starting distance in pm
    quiet: hides the bond length and bond energy values (the curve stays).
    Model: V(r) = D(1 − e^(−a(r − r₀)))² − D, with r₀ the bond length and D the bond energy; a from the vibrational
    frequency ωₑ (k = μ(2πcωₑ)², a = √(k / 2D)). The well depth is set to the bond dissociation enthalpy at 298 K (the
    zero-point energy is left out). Bond lengths and ωₑ: NIST (Huber and Herzberg constants of diatomic molecules);
    bond enthalpies: standard tables (CRC Handbook; the same values as general chemistry bond-energy tables).

   ch-modiagram: molecular orbital diagrams for first- and second-row diatomics.
    opts: mol: 'O2' ('H2','He2','Li2','Be2','B2','C2','N2','O2','F2','Ne2','NO','CO'); charge: 0 (e.g. 1 for O2⁺);
          step: electrons shown at the start (default all valence electrons)
    quiet: hides the bond order, the unpaired count and the magnetism verdict.
    Order: with s–p mixing (B₂, C₂, N₂, and CO and NO) π2p lies below σ2p; for O₂, F₂ and Ne₂ σ2p lies below π2p. For
    the second row only the valence orbitals are drawn (σ1s and σ*1s are full and cancel).

   ch-imf: forces between molecules.
    opts:
      subs: ['H2O']                 substances from the library (about 40): H2O NH3 HF CH4 C2H6 C3H8 C4H10 C5H12 C6H14 C8H18
                                    CH3OH C2H5OH CH3OCH3 CH3COCH3 CH3F CH3Cl CH2Cl2 CHCl3 CCl4 H2S HCl HBr HI F2 Cl2 Br2 I2 N2
                                    O2 He Ne Ar Kr Xe H2Se H2Te PH3 SiH4 GeH4 SnH4 H2O2 CH3COOH CO2
      mode: 'forces'                'forces' | 'boil' | 'compare' | 'dissolve' | 'chromatography'
      labels: true                  name the forces on the picture
      dissolve: ion: 'Na+' (ion–dipole: water around an ion)
      chromatography: spots: [{name:'A', rf:0.25}, {name:'B', rf:0.62}], solvent: 'water'
    quiet: hides the force-type labels, boiling-point values and bars, and Rf values.
    Data: normal boiling points from the NIST Chemistry WebBook (CO₂ sublimes at −78.5 °C at 1 atm).

   ch-crystal: solids and unit cells.
    opts:
      mode: 'ionic'                 'ionic' (rock-salt lattice) | 'metallic' (cations in a sea of electrons) | 'network'
                                    (diamond, graphite, quartz) | 'molecular' (ice or dry ice) | 'cell' (3-D unit cell) | 'alloy'
      strike: true                  ionic and metallic: a hammer button (metal layers slide; ionic layers line up like
                                    charges and the crystal shatters)
      network: 'diamond' | 'graphite' | 'quartz';  molecular: 'ice' | 'dryice';  alloy: 'substitutional' | 'interstitial'
      cell: 'sc' | 'bcc' | 'fcc' | 'nacl', fractions: true (label each atom's share), rotate: true (auto-turn)
    quiet: hides the atoms-per-cell count, the edge–radius formula and the solid-type labels.

   ch-phasediagram: phase diagrams (not to scale), vapor pressure and solutions.
    opts:
      sub: 'H2O'                    'H2O' | 'CO2' | 'generic'
      point: {T: 25, P: 1}          a draggable state point (°C, atm)
      path: 'heat' | 'squeeze'      an arrow for heating at constant pressure or squeezing at constant temperature
      mode: 'diagram'               'diagram' | 'vp' (a closed flask: vapor pressure) | 'solution' (freezing and boiling
                                    points of a solution beside the pure solvent)
      vp: T: 25 (°C), amount: 0.5 (fraction of the flask that is liquid)
      solution: m: 1.0 (mol/kg), i: 1 (van 't Hoff factor); water's Kf = 1.86 and Kb = 0.512 °C·kg/mol
    quiet: hides the region names, the phase readout at the point, the triple- and critical-point values and ΔT values.
    Data: water triple point 0.01 °C, 0.00604 atm; critical point 374 °C, 218 atm. CO₂ triple point −56.6 °C, 5.11 atm;
    critical point 31.0 °C, 72.8 atm; sublimes at −78.5 °C at 1 atm (NIST Chemistry WebBook). Water's vapor pressure from
    the Antoine equation, log₁₀(P/mmHg) = 8.07131 − 1730.63 / (T/°C + 233.426), for 1 to 100 °C.

   ch-heatingcurve: temperature against heat added (or removed) for a sample.
    opts: sub: 'H2O' | 'ethanol', mass: 100 (g), T1: −20, T2: 120 (°C), cool: false (a cooling curve), q: true (each
          segment's heat), inset: true (a particle picture at the marker), at: 0.5 (marker position, fraction of all heat)
    quiet: hides the q values, the segment labels and the temperature readout at the marker.
    Data (overview's constants): water c(ice) 2.09, c(liquid) 4.184, c(steam) 2.01 J/(g·°C); ΔH_fus 6.01 kJ/mol,
    ΔH_vap 40.7 kJ/mol; M = 18.02 g/mol. Ethanol (liquid and vapor only, T1 ≥ −100 °C): c(liquid) 2.44, c(vapor) 1.42
    J/(g·°C), ΔH_vap 38.6 kJ/mol at its boiling point 78.3 °C, M = 46.07 g/mol (NIST Chemistry WebBook).

   ch-calorimeter: heat flowing between objects, and calorimeters.
    opts:
      mode: 'cup'                   'contact' (two blocks touching) | 'cup' (a hot block in a cup of water) | 'reaction'
                                    (two solutions mixed in the cup) | 'bomb'
      metal: 'Cu'                   'Cu' | 'Fe' | 'Al' | 'Pb' | 'Au' | 'glass' | 'granite' (or c1)
      m1: 50, T1: 95, m2: 100, T2: 22, c1, c2 (g, °C, J/(g·°C)); in 'contact' both blocks use metal/metal2 or c1/c2
      rxn: 'neutralization' | 'NH4NO3' | 'CaCl2' (presets), or n (mol) and dH (kJ/mol) with mass (g of solution)
      bomb: q: −26.4 (kJ released by the sample, negative), Ccal: 10.0 (kJ/°C), T1: 25.0
    quiet: hides the final temperature, the q values on the bars (the bars stay equal and opposite) and the graph's end value.
    Specific heats (J/(g·°C)): Cu 0.385, Fe 0.449, Al 0.897, Pb 0.129, Au 0.129 (OpenStax Chemistry 2e, Table 5.1);
    glass 0.84, granite 0.84 (OpenStax College Physics 2e, Table 14.1); water 4.184. Reactions: ΔH of neutralization
    −55.8 kJ/mol (from standard enthalpies of formation, OpenStax Appendix G); ΔH of solution NH₄NO₃ +25.7 and CaCl₂
    −81.3 kJ/mol (CRC Handbook). Solutions are taken as water: density 1.00 g/mL, c = 4.184 J/(g·°C); no heat is lost.

   ch-energydiagram: energy diagrams for reactions.
    opts:
      mode: 'profile'               'profile' | 'steps' | 'bonds' | 'hess' | 'bornhaber' | 'dissolve' | 'coupled'
      profile: dH: −90, Ea: 120 (kJ/mol), catalyst: true (a toggle; catEa default 0.5 × Ea), surroundings: true
      steps: steps: [{dE: 40, Ea: 90, label: 'step 1'}, {dE: −110, Ea: 50, label: 'step 2'}] (each Ea measured from the
             valley before it; the step with the largest Ea is marked as the slow step)
      bonds: breaks: [['H–H', 436], ['Cl–Cl', 242]], forms: [['H–Cl', 432], ['H–Cl', 432]], eq: 'H2 + Cl2 -> 2HCl'
      hess: levels: [{label, E}] (the first and last joined directly and step by step; default C + O₂ → CO → CO₂)
      bornhaber: salt: 'NaCl' | 'KCl' | 'LiF'
      dissolve: dH: [ΔH1 separate solute, ΔH2 separate solvent, ΔH3 mix] (default an example: +60, +40, −110)
      coupled: dG: [20, −30] (kJ/mol), labels: ['Reaction 1', 'Reaction 2']
      labels: true                  text on the diagram
    quiet: hides the numeric ΔH and Ea, the words exothermic and endothermic, and the slow-step marker; the shape stays.
    Data: enthalpies of formation (NIST Chemistry WebBook, as in OpenStax Appendix G): CO −110.5, CO₂ −393.5; Na(g) 107.5,
    K(g) 89.0, Li(g) 159.3, Cl(g) 121.3, F(g) 79.4; NaCl(s) −411.2, KCl(s) −436.5, LiF(s) −616.0 kJ/mol. First ionization
    energies (NIST) Na 495.8, K 418.8, Li 520.2; electron affinities Cl 348.6, F 328.2 kJ/mol (released). Bond
    enthalpies as in ch-bondcurve. Lattice energies come out of each cycle.

   ch-convert: conversion factors and the mole map.
    opts:
      mode: 'chain'                 'chain' | 'map' | 'prefix'
      chain: start: {v: 36.04, unit: 'g', sub: 'H2O'}, factors: [{n: [1, 'mol', 'H2O'], d: [18.02, 'g', 'H2O'], flip: false,
             pow: 1}], target: 'mol H2O' (a check mark when the units left over match), dp: 4
      map:   eq: '2H2 + O2 -> 2H2O', a: 'H2', b: 'H2O' (the two substances), M: {H2: 2.02, …} (molar masses; default from
             the two-decimal atomic masses), from: 'g', to: 'g' ('g' | 'particles' | 'Lgas' | 'Lsoln' | 'mol', and which
             side: fromSub / toSub default a and b), start: 4.04 (a starting amount), Msol: 1.0 (mol/L, solution spokes)
      prefix: v: 2.5, from: 'k', to: 'm' (G M k h da '' d c m μ n), unit: 'm'
    quiet: hides the final number and any numbers filled into the factors (units and the route stay).

   ch-measure: reading instruments, significant figures, accuracy and precision.
    opts:
      mode: 'ruler'                 'ruler' | 'cylinder' | 'buret' | 'thermometer' | 'balance' | 'digits' | 'target'
      value: 4.37                   the true reading (instruments); div: smallest marking (ruler 0.1 cm, cylinder 1 mL,
                                    buret 0.1 mL, thermometer 1 °C); range: [0, 10]; zoom: 1 (start zoom, up to 8);
                                    decimals: 2 (balance display)
      digits: num: '0.004050' (a string, so its zeros survive; "4.050e-3" and "1200." work too)
      target: preset: 'accurate-precise' | 'precise-not-accurate' | 'accurate-not-precise' | 'neither', or shots: [values],
              true: 10.00 (the true value)
    quiet: hides the reading, the significant-figure count, the accuracy and precision verdict and the percent error.

   ch-eqbalance: an equation balancer with an atom tally.
    opts:
      eq: 'CH4 + O2 -> CO2 + H2O'   the equation (coefficients in it are ignored; coef sets the start)
      coef: [1, 1, 1, 1]            starting coefficients (default all 1)
      mode: 'molecular'             'molecular' | 'half' | 'nuclear'
      pictures: true                particle pictures of each species × its coefficient
      half: ['Fe2+ -> Fe3+', 'MnO4- -> Mn2+'], medium: 'acid' | 'base' (H₂O, H⁺ or OH⁻ and e⁻ helpers on both sides)
      nuclear: eq: 'U-238 -> Th-234 + He-4' (tokens: Sym-A, e- (beta), e+ (positron), n, p, gamma)
    quiet: hides the tally totals and the balanced check marks (the equation and pictures stay).

   ch-limiting: the limiting reactant workshop.
    opts:
      eq: '2H2 + O2 -> 2H2O'
      amounts: {H2: 5, O2: 2}       how much of each reactant, in unit
      unit: 'particles'             'particles' | 'mol' | 'g'
      M: {H2: 2.02, …}              molar masses (default from the two-decimal atomic masses)
      actual: 30.0                  the actual yield of the first product (in grams when unit is 'g', else in its unit)
      show: ['bars','table']        bars of the product each reactant could make; a before–change–after table
      step: false                   true: start before the reaction (Run builds it)
    quiet: hides which reactant is limiting, the product amount, the leftover amount and the yield.

   ch-gasbox: gas particles in a box with a piston, a heater and a valve.
    opts:
      n: 1, T: 300, V: 24.6         moles, kelvins, liters (P follows from PV = nRT)
      species: [{f:'He', n:1}, {f:'Ar', n:0.5}]   up to three gases (partial pressures and mole fractions)
      lock: 'T'                     held constant: 'T' (Boyle: move the piston), 'P' (Charles and Avogadro: the piston
                                    floats), 'V' (Gay-Lussac: the piston is pinned), '' (V, T and n all free)
      graph: 'PV' | 'VT' | 'PT'     a live graph (V–T and P–T lines are extended to 0 K)
      gauges: true, hist: false (a speed histogram), hits: true (a wall-hit counter)
      real: false                   van der Waals pressure and PV/nRT beside the ideal values (a, b from OpenStax 2e Table 9.3)
      work: false                   shade w = −∫P dV along the path since the last reset
      effusion: false               open a pinhole; count light and heavy particles escaping
      units: 'atm' | 'kPa' | 'mmHg'
    quiet: hides the gauge values and computed quantities (the picture and the graph's shape stay).
    Exactness: gauges show values from PV = nRT (R = 0.08206 L·atm/(mol·K)), never counts from the animation.

   ch-maxwell: the Maxwell–Boltzmann distribution.
    opts: curves: [{f:'N2', T:300}, {f:'N2', T:600}], x: 'speed' | 'energy', Ea: null (kJ/mol, shades the fraction at or
          above it), catEa: null (a lower threshold with a catalyst), marks: true (most probable, average and rms speeds),
          slider: true (a temperature slider for the first curve)
    quiet: hides the speed values at the marks and the shaded fraction.
    Formulas: f(v) = 4π (M/2πRT)^(3/2) v² e^(−Mv²/2RT) (M in kg/mol); v_mp = √(2RT/M), v_avg = √(8RT/πM), v_rms = √(3RT/M);
    energy: f(E) = 2√(E/π) (RT)^(−3/2) e^(−E/RT), fraction with E ≥ Ea = erfc(√x) + 2√(x/π) e^(−x), x = Ea/RT.

   ch-collisions: collision theory in a box of A and B particles.
    opts: nA: 12, nB: 12, T: 300 (K), Ea: 12 (kJ/mol), orient: false (A reacts only when B hits its marked end),
          surface: null | 'lump' | 'powder' (B as a solid), cat: false (a catalyst toggle that halves Ea), mode: 'box' | 'elementary'
    quiet: hides the rates and percentages.
    Model: hard disks. An A–B collision reacts when its energy along the line of centers reaches Ea, measured against
    RT (as on Mixing Lab's bench): ½μv² ≥ (Ea/RT)·kT_box. The counts come from the animation; they illustrate.

   ch-kineticsplot: concentration against time; radioactive decay.
    opts:
      order: 1, k: 0.1, A0: 1.0     rate constant (units to suit the order; time in s) and starting concentration (M)
      plot: 'A' | 'lnA' | 'invA' | 'all'   which graph ('all' draws the three side by side: the straight one tells the order)
      halves: true                  half-life markers
      tangent: false                a point you drag along the curve with its tangent (instantaneous rate); chord: false
      data: [[0, 1.0], [10, 0.61], …] plot a table of points (and the three graphs of it)
      mode: 'decay', iso: 'C-14' (C-14, H-3, I-131, Co-60, Rn-222, K-40, U-238, F-18) or half: 10 (any unit), N0: 400
            (up to 1000 nuclei), unit (time unit for 'half'), dating: true (fraction left → age)
    quiet: hides k, the order label, half-life values and the amount-left readout.
    Data: half-lives from the National Nuclear Data Center (NuDat).

   ch-solubilitycurve: solubility against temperature; Henry's law.
    opts:
      subs: ['KNO3','NaCl','KCl','NH4Cl','KClO3']   salts (g per 100 g of water); gases 'O2' and 'CO2' get their own panel
      point: {T: 40, g: 80}         a draggable point: unsaturated, saturated or supersaturated (for the first salt)
      cool: 20                      cool a saturated solution from the point's temperature to this one: crystals that form
      mode: 'curves' | 'henry'      henry: dissolved gas against partial pressure, C = k_H·P, for O₂, N₂ and CO₂ at 25 °C
    quiet: hides the class of the point, the values read at the point and the crystal mass.
    Data: salts at 0, 20, 40, 60, 80, 100 °C (CRC Handbook aqueous solubility tables, as g per 100 g of water); gases at
    1 atm of the pure gas, 0 to 60 °C (O₂ from Bunsen coefficients; CO₂ 0.335, 0.169, 0.097, 0.058 g/100 g). Henry's law
    constants at 25 °C (mol/(L·atm)): O₂ 1.3 × 10⁻³, N₂ 6.4 × 10⁻⁴, CO₂ 3.3 × 10⁻² (R. Sander, Atmos. Chem. Phys. 15,
    4399, 2015). NaNO₃, Ce₂(SO₄)₃ and NH₃ from the list were left out: the values we could check disagree between sources.

   ch-beaker: concentration in a beaker or flask.
    opts:
      mode: 'molarity'              'molarity' | 'dilute' | 'mix' | 'ions' | 'units'
      sub: 'NaCl', mol: 0.20, V: 0.50 (L)   each dot stands for a fixed amount of solute
      mix: b: {sub: 'NaCl', M: 0.0010, V: 0.100} mixed with {sub, M, V} of the first (a: {sub:'AgNO3', M:0.0010, V:0.100}),
           Ksp: 1.8e-10 (given) for the possible precipitate
      ions: sub: 'CaCl2', M: 0.10
      units: sub: 'NaCl', g: 5.85 (g solute), water: 100 (g), density: 1.00 (g/mL of solution)
    quiet: hides the molarity (and ion concentrations, Q and the precipitate verdict).

   ch-phscale: the pH scale.
    opts: pH: 3 (or H3O: 1e-3, or OH: 1e-11), show: ['conc','pOH','liquids','indicators'], ind: 'universal' (indicator
          band: 'universal' | 'cabbage' | 'phenolphthalein' | 'litmus' | 'bromothymol' | 'methylorange'), mode: 'scale' |
          'pka', acids: [{name: 'acetic acid', Ka: 1.8e-5}, …] (pka mode)
    quiet: hides the pH at the pointer and any concentration not given in the problem.
    Data: everyday liquids as on Mixing Lab's page (FDA, OpenStax 14.2, Reddy et al. 2016, Tarun et al. 2014, Penn State);
    indicator ranges as on Mixing Lab and OpenStax 14.7 (bromothymol blue 6.0–7.6, methyl orange 3.1–4.4). Ka values
    from OpenStax Chemistry 2e, Appendix H (acetic acid as on Mixing Lab). Kw = 1.0 × 10⁻¹⁴ at 25 °C.

   ch-titration: titration curves, computed from the full charge balance.
    opts:
      acid: {type: 'weak', Ka: 1.8e-5 (or pKa: 4.74; diprotic: pKa: [2.0, 7.0]), C: 0.100, V: 25.0}   type: 'strong' | 'weak' |
            'diprotic' | 'weakbase' (then Kb, titrated with strong acid); base: {C: 0.100} (the titrant)
      vol: 12.5                     mL of titrant added at the start
      ind: 'phenolphthalein'        the indicator ('universal','phenolphthalein','methylorange','bromothymol','litmus')
      show: ['landmarks','species','indicator']
      mode: 'acidbase' | 'redox'    redox: Fe²⁺ (C, V) titrated with MnO₄⁻ (base.C): MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O
    quiet: hides the pH readout, the landmark labels and the equivalence volume.
    Exactness: every pH solves [H₃O⁺] + [Na⁺] = [OH⁻] + [A⁻] (+ 2[A²⁻]) with Kw = 1.0 × 10⁻¹⁴: no shortcut formulas.

   ch-buffer: buffer bars, species fractions and capacity.
    opts:
      pKa: 4.74 (or acid: 'CH3COOH' from the Ka table), nHA: 0.10, nA: 0.10 (mol), V: 1.0 (L), adds: 0.01 (mol per click)
      mode: 'bars'                  'bars' | 'species' | 'capacity'
      water: true                   a beaker of plain water given the same additions
      pH: 5 (species mode: the marked pH)
    quiet: hides pH values, the ratio and the capacity value.
    The buffer's pH comes from the Henderson–Hasselbalch equation while both HA and A⁻ are present, after the strong acid or
    base has reacted (stoichiometry first); once one of them is used up, from the full charge balance.

   ch-equilibrium: approach to equilibrium and Le Chatelier's principle, from rate laws.
    opts:
      rxn: 'A<=>B'                  presets 'A<=>B', 'A+B<=>C+D', 'N2+3H2<=>2NH3', '2NO2<=>N2O4', or {a: [['A',1]], b: [['B',1]],
                                    kf: 0.3, kr: 0.1, dH: 0} (rate = k × product of concentrations to their coefficients)
      c0: {A: 1.0}                  starting concentrations (M)
      events: [{t: 20, type: 'add' | 'remove' | 'volume' | 'temp' | 'catalyst' | 'inert', sp: 'A', amt: 0.5}]
                                    volume: amt = new volume ÷ old (0.5 halves it); temp: amt = new T in K (start 298 K)
      show: ['rates','Q','ice','particles']
    quiet: hides the values of K and Q, the direction label ("shifts toward products") and the ICE table's equilibrium row.
    Model: rate constants are model values chosen to show the behavior (K = kf/kr in mol/L units); a temperature change
    scales kf and kr by Arrhenius factors with Ea(forward) = 50 kJ/mol and Ea(reverse) = 50 − ΔH, so K follows
    van 't Hoff: K₂/K₁ = e^(−ΔH/R (1/T₂ − 1/T₁)). Equilibrium values in the ICE table are solved from K, not read from the curves.

   ch-microstates: counting arrangements (microstates).
    opts:
      mode: 'gas'                   'gas' (N particles in a box with a divider; C(N, k) ways to have k on the left) |
                                    'energy' (two Einstein solids sharing q quanta: W_A × W_B for each split) | 'compare'
      N: 10                         gas: particles (2 to 20)
      q: 6, NA: 3, NB: 3            energy: quanta and oscillators in solids A and B (q at first all in A)
      compare: 'count' | 'phases'   W for 2 against 4 molecules on M = 16 sites, or solid / liquid / gas on a lattice (a toy model)
    quiet: hides W and S values and the most-probable marker.
    S = k ln W; values are given as S/k = ln W.

   ch-cell: electrochemical cells.
    opts:
      anode: 'Zn2+/Zn', cathode: 'Cu2+/Cu'   couples from the table below (as standard reduction potentials)
      c: [1.0, 1.0]                 concentrations (M) of the anode's and the cathode's dissolved ion (Nernst sliders)
      mode: 'galvanic'              'galvanic' | 'electrolytic' | 'ladder' | 'corrosion'
      electrolytic: couple: 'Cu2+/Cu' (metal plated at the cathode), I: 2.0 (A), t: 600 (s)
      show: ['labels','signs','volts','ions']
      corrosion: zinc: false (a zinc block attached to the iron)
    quiet: hides E values, the anode and cathode labels, the electrode signs and the plated mass.
    Data: standard reduction potentials at 25 °C (OpenStax Chemistry 2e, Appendix L). E = E° − (0.0592 V / n) log Q;
    m = I t M / (n F) with F = 96 485 C/mol.

   ch-nuclide: the chart of the nuclides, decay, decay chains and binding energy.
    opts:
      mode: 'chart'                 'chart' | 'equation' | 'binding' | 'chain'
      nuc: 'C-14'                   the chosen nuclide (examples with measured decay modes: H-3 C-14 N-13 F-18 Na-22 P-32 K-40
                                    Co-60 Sr-90 Tc-99m I-131 Cs-137 Po-210 Rn-222 Ra-226 Th-232 U-235 U-238 Pu-239 Am-241)
      decay: 'beta-' | 'alpha' | 'beta+' | 'ec' | 'gamma' (equation mode; default: the nuclide's own)
      arrows: true                  all four decay arrows on the chart (each labeled)
    quiet: hides the product nuclide, the decay-mode name and the binding-energy values.
    Data: stable nuclides (the 251 observed to be stable; Bi-209 decays with a half-life near 2 × 10¹⁹ years and is
    marked), decay modes, and binding energies per nucleon from the National Nuclear Data Center (NuDat) and the 2020
    Atomic Mass Evaluation it uses.

   ch-spectrum: light as waves and photons; energy levels; what light does to molecules; color.
    opts:
      mode: 'wave'                  'wave' | 'photo' | 'levels' | 'molecule' | 'color'
      lambda: 500                   wavelength in nm (wave, photo, molecule, color)
      intensity: 3                  wave and photo: brightness (more photons, never bigger ones)
      metal: 'Na'                   photo: 'Na','Al','Zn','Fe','Cu','Ag','Pt' (or phi: work function in eV)
      el: 'H'                       levels: 'H' (an energy-level ladder) or 'He','Na','Ne','Hg' (their visible lines)
      from: 3, to: 2                levels: the jump (down = emission, up = absorption); series: 'Balmer' (marks its lines)
    quiet: hides λ, ν and E readouts, the ΔE of a jump, the series name and the wavelengths written on the lines.
    Data: c and h exact (readouts round with h = 6.626 × 10⁻³⁴ J·s, c = 3.00 × 10⁸ m/s, as problems do); hydrogen levels
    Eₙ = −2.18 × 10⁻¹⁸ J / n² (Rydberg energy, CODATA via NIST); visible lines of He, Na, Ne, Hg and H (in air) from the
    NIST Atomic Spectra Database; work functions from OpenStax University Physics Volume 3, Table 6.1. Region boundaries
    are approximate.
*/
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('chemistry/viz/chemistry.js: load math/viz/core.js first'); return; }
  var M = Math, PI = M.PI, TAU = 2 * PI, fm = V.fmt, mk = V.el;

  // ---------- small helpers ----------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function num(v, d) { var x = typeof v === 'string' && v !== '' ? +v : v; return isNum(x) ? x : d; }
  function opt(o, d) { var r = {}, k; for (k in d) r[k] = d[k]; for (k in o) if (o[k] !== undefined) r[k] = o[k]; return r; }
  function log10(x) { return M.log(x) / M.LN10; }
  var SUPC = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '−': '⁻', '+': '⁺' };
  var SUBC = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  function sup(n) { return String(n).split('').map(function (ch) { return SUPC[ch] || ch; }).join(''); }
  function sub(n) { return String(n).split('').map(function (ch) { return SUBC[ch] || ch; }).join(''); }
  function rgb(hex) { if (hex[0] !== '#') { var m = hex.match(/[\d.]+/g); return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0]; } var v = parseInt(hex.length === 4 ? hex.replace(/#(.)(.)(.)/, '$1$1$2$2$3$3') : hex.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
  function rgba(hex, a) { var c = rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function mixC(h1, h2, t) { var a = rgb(h1), b = rgb(h2); return 'rgb(' + M.round(lerp(a[0], b[0], t)) + ',' + M.round(lerp(a[1], b[1], t)) + ',' + M.round(lerp(a[2], b[2], t)) + ')'; }
  function shade(hex, t) { return t > 0 ? mixC(hex, '#ffffff', t) : mixC(hex, '#000000', -t); }
  // a seeded random source (mulberry32), so a problem's picture is the same every time
  function rng(seed) { var a = (seed >>> 0) || 1; return function () { a = (a + 0x6D2B79F5) | 0; var t = M.imul(a ^ (a >>> 15), 1 | a); t = (t + M.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(r) { var u = 1 - r(), v = r(); return M.sqrt(-2 * M.log(u)) * M.cos(TAU * v); }
  function bisect(f, lo, hi, n) { var flo = f(lo); for (var i = 0; i < (n || 100); i++) { var mid = (lo + hi) / 2, fm2 = f(mid); if ((fm2 > 0) === (flo > 0)) { lo = mid; flo = fm2; } else hi = mid; } return (lo + hi) / 2; }
  function erfc(x) { // Numerical Recipes erfcc, fractional error below 1.2e-7
    var z = M.abs(x), t = 1 / (1 + 0.5 * z), r = t * M.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }
  function choose(n, k) { if (k < 0 || k > n) return 0; k = M.min(k, n - k); var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return M.round(r); }
  // numbers: sig figs and powers of ten
  function sf(v, n) { if (!isFinite(v) || v === 0) return fm(v, 0); var d = n - 1 - M.floor(log10(M.abs(v))); return d > 0 ? (+v).toFixed(M.min(d, 12)).replace('-', '−') : fm(M.round(v / M.pow(10, -d)) * M.pow(10, -d), 0); }
  function sciParts(v, n) { if (v === 0 || !isFinite(v)) return null; var e = M.floor(log10(M.abs(v))), m = v / M.pow(10, e); var s = (+m).toFixed(n - 1); if (+s >= 10) { e++; s = (m / 10).toFixed(n - 1); } return [s.replace('-', '−'), e]; }
  function sci(v, n, html) { // 1.0 × 10⁻⁷ (text) or with <sup> (html); plain decimals for 0.001 ≤ |v| < 10 000
    n = n || 3; if (!isFinite(v)) return fm(v); if (v === 0) return '0';
    var a = M.abs(v); if (a >= 1e-3 && a < 1e4) return sf(v, n);
    var p = sciParts(v, n); return p[0] + ' × 10' + (html ? '<sup>' + String(p[1]).replace('-', '−') + '</sup>' : sup(p[1]));
  }
  function sciH(v, n) { return sci(v, n, true); }
  // physical constants (exact SI values where SI defines them; overview's constants table)
  var K = { NA: 6.02214076e23, h: 6.62607015e-34, c: 299792458, e: 1.602176634e-19, kB: 1.380649e-23, R: 8.314462618, RL: 0.082057366, F: 96485.33212, Kw: 1.0e-14, RH: 2.18e-18, amu: 1.66053907e-27 };
  // the rounded values problems use (h = 6.626e-34, c = 3.00e8, N_A = 6.022e23): readouts that a problem could also compute use these
  var KP = { NA: 6.022e23, h: 6.626e-34, c: 3.00e8, R: 8.314, RL: 0.08206, F: 96485, RH: 2.18e-18 };

  // ---------- the element table ----------
  /* Z|symbol|name|standard atomic weight|kind|covalent radius|IE1|EN|common ions
     - standard atomic weights: IUPAC abridged values as published by NIST ("Atomic Weights and Isotopic Compositions");
       [n] = no standard atomic weight, the mass number of the longest-lived known isotope.
     - kind: m metal, d metalloid, n nonmetal, u not known (superheavy elements; predicted)
     - covalent radius, pm: B. Cordero et al., "Covalent radii revisited", Dalton Trans. 2008, 2832 (single-bond radii;
       C sp3; Mn, Fe, Co low spin). Cordero is the standard modern table, used alone so values from different tables
       are never mixed.
     - IE1: first ionization energy in eV, NIST Atomic Spectra Database (converted to kJ/mol × 96.485 33).
     - EN: Pauling electronegativity (revised Pauling scale, A. L. Allred 1961, as tabulated in the CRC Handbook).
     - common ions: the charges of common monatomic ions (OpenStax Chemistry 2e, 2.6, and standard tables). */
  var ELS = 'H|Hydrogen|1.008|n|31|13.598434599|2.20|1,-1;He|Helium|4.0026|n|28|24.587389011||;Li|Lithium|6.94|m|128|5.391714996|0.98|1;Be|Beryllium|9.0122|m|96|9.322699|1.57|2;B|Boron|10.81|d|84|8.298019|2.04|;C|Carbon|12.011|n|76|11.260288|2.55|;N|Nitrogen|14.007|n|71|14.53413|3.04|-3;O|Oxygen|15.999|n|66|13.618055|3.44|-2;F|Fluorine|18.998|n|57|17.42282|3.98|-1;Ne|Neon|20.180|n|58|21.564541||;' +
    'Na|Sodium|22.990|m|166|5.1390769|0.93|1;Mg|Magnesium|24.305|m|141|7.646236|1.31|2;Al|Aluminum|26.982|m|121|5.985769|1.61|3;Si|Silicon|28.085|d|111|8.15168|1.90|;P|Phosphorus|30.974|n|107|10.486686|2.19|-3;S|Sulfur|32.06|n|105|10.36001|2.58|-2;Cl|Chlorine|35.45|n|102|12.967633|3.16|-1;Ar|Argon|39.95|n|106|15.7596119||;' +
    'K|Potassium|39.098|m|203|4.34066373|0.82|1;Ca|Calcium|40.078|m|176|6.11315547|1.00|2;Sc|Scandium|44.956|m|170|6.56149|1.36|3;Ti|Titanium|47.867|m|160|6.82812|1.54|2,3,4;V|Vanadium|50.942|m|153|6.746187|1.63|2,3;Cr|Chromium|51.996|m|139|6.76651|1.66|2,3;Mn|Manganese|54.938|m|139|7.4340379|1.55|2;Fe|Iron|55.845|m|132|7.9024681|1.83|2,3;Co|Cobalt|58.933|m|126|7.88101|1.88|2,3;Ni|Nickel|58.693|m|124|7.639878|1.91|2;Cu|Copper|63.546|m|132|7.72638|1.90|1,2;Zn|Zinc|65.38|m|122|9.394197|1.65|2;Ga|Gallium|69.723|m|122|5.9993018|1.81|3;Ge|Germanium|72.630|d|120|7.899435|2.01|;As|Arsenic|74.922|d|119|9.78855|2.18|;Se|Selenium|78.971|n|120|9.752392|2.55|-2;Br|Bromine|79.904|n|120|11.81381|2.96|-1;Kr|Krypton|83.798|n|116|13.9996055|3.00|;' +
    'Rb|Rubidium|85.468|m|220|4.1771281|0.82|1;Sr|Strontium|87.62|m|195|5.69486745|0.95|2;Y|Yttrium|88.906|m|190|6.21726|1.22|3;Zr|Zirconium|91.224|m|175|6.634126|1.33|4;Nb|Niobium|92.906|m|164|6.75885|1.6|;Mo|Molybdenum|95.95|m|154|7.09243|2.16|;Tc|Technetium|[97]|m|147|7.11938|1.9|;Ru|Ruthenium|101.07|m|146|7.3605|2.2|;Rh|Rhodium|102.91|m|142|7.4589|2.28|;Pd|Palladium|106.42|m|139|8.336839|2.20|2;Ag|Silver|107.87|m|145|7.576234|1.93|1;Cd|Cadmium|112.41|m|144|8.99382|1.69|2;In|Indium|114.82|m|142|5.7863554|1.78|3;Sn|Tin|118.71|m|139|7.343918|1.96|2,4;Sb|Antimony|121.76|d|139|8.608389|2.05|;Te|Tellurium|127.60|d|138|9.009808|2.1|-2;I|Iodine|126.90|n|139|10.45126|2.66|-1;Xe|Xenon|131.29|n|140|12.1298437|2.60|;' +
    'Cs|Cesium|132.91|m|244|3.89390572|0.79|1;Ba|Barium|137.33|m|215|5.2116646|0.89|2;La|Lanthanum|138.91|m|207|5.5769|1.10|3;Ce|Cerium|140.12|m|204|5.5386|1.12|3,4;Pr|Praseodymium|140.91|m|203|5.4702|1.13|3;Nd|Neodymium|144.24|m|201|5.525|1.14|3;Pm|Promethium|[145]|m|199|5.577||3;Sm|Samarium|150.36|m|198|5.64371|1.17|3;Eu|Europium|151.96|m|198|5.670385||2,3;Gd|Gadolinium|157.25|m|196|6.1498|1.20|3;Tb|Terbium|158.93|m|194|5.8638||3;Dy|Dysprosium|162.50|m|192|5.93905|1.22|3;Ho|Holmium|164.93|m|192|6.0215|1.23|3;Er|Erbium|167.26|m|189|6.1077|1.24|3;Tm|Thulium|168.93|m|190|6.18431|1.25|3;Yb|Ytterbium|173.05|m|187|6.25416||3;Lu|Lutetium|174.97|m|187|5.425871|1.27|3;' +
    'Hf|Hafnium|178.49|m|175|6.82507|1.3|;Ta|Tantalum|180.95|m|170|7.549571|1.5|;W|Tungsten|183.84|m|162|7.86403|2.36|;Re|Rhenium|186.21|m|151|7.83352|1.9|;Os|Osmium|190.23|m|144|8.43823|2.2|;Ir|Iridium|192.22|m|141|8.96702|2.20|;Pt|Platinum|195.08|m|136|8.95883|2.28|2,4;Au|Gold|196.97|m|136|9.225553|2.54|1,3;Hg|Mercury|200.59|m|132|10.437504|2.00|1,2;Tl|Thallium|204.38|m|145|6.1082873|1.62|1,3;Pb|Lead|207.2|m|146|7.4166799|2.33|2,4;Bi|Bismuth|208.98|m|148|7.285516|2.02|3;Po|Polonium|[209]|m|140|8.41807|2.0|;At|Astatine|[210]|d|150|9.31751|2.2|;Rn|Radon|[222]|n|150|10.74850||;' +
    'Fr|Francium|[223]|m|260|4.0727410|0.7|1;Ra|Radium|[226]|m|221|5.2784239|0.9|2;Ac|Actinium|[227]|m|215|5.380226|1.1|3;Th|Thorium|232.04|m|206|6.3067|1.3|4;Pa|Protactinium|231.04|m|200|5.89|1.5|;U|Uranium|238.03|m|196|6.19405|1.38|;Np|Neptunium|[237]|m|190|6.2655|1.36|;Pu|Plutonium|[244]|m|187|6.025712|1.28|;Am|Americium|[243]|m|180|5.97381|1.13|;Cm|Curium|[247]|m|169|5.99141|1.28|;Bk|Berkelium|[247]|m||6.19785|1.3|;Cf|Californium|[251]|m||6.28166|1.3|;Es|Einsteinium|[252]|m||6.36758|1.3|;Fm|Fermium|[257]|m||6.50|1.3|;Md|Mendelevium|[258]|m||6.58|1.3|;No|Nobelium|[259]|m||6.62621|1.3|;Lr|Lawrencium|[266]|m||4.96|1.3|;' +
    'Rf|Rutherfordium|[267]|m||||;Db|Dubnium|[268]|m||||;Sg|Seaborgium|[269]|m||||;Bh|Bohrium|[270]|m||||;Hs|Hassium|[269]|m||||;Mt|Meitnerium|[278]|u||||;Ds|Darmstadtium|[281]|u||||;Rg|Roentgenium|[282]|u||||;Cn|Copernicium|[285]|u||||;Nh|Nihonium|[286]|u||||;Fl|Flerovium|[289]|u||||;Mc|Moscovium|[290]|u||||;Lv|Livermorium|[293]|u||||;Ts|Tennessine|[294]|u||||;Og|Oganesson|[294]|u||||';
  var EV_KJ = 96.48533212;
  var EL = [null], BYS = {};
  ELS.split(';').forEach(function (row, i) {
    var f = row.split('|'), Z = i + 1, w = f[2], pos = place(Z);
    var e = { Z: Z, s: f[0], name: f[1], w: w, mass: +w.replace(/[\[\]]/g, ''), stable: w[0] !== '[', kind: f[3], rcov: f[4] ? +f[4] : null,
      ie: f[5] ? +f[5] * EV_KJ : null, ieV: f[5] ? +f[5] : null, en: f[6] ? +f[6] : null, ions: f[7] ? f[7].split(',').map(Number) : [],
      group: pos.g, period: pos.p, block: pos.b, row: pos.r, col: pos.c };
    e.fam = family(e); EL.push(e); BYS[e.s] = e;
  });
  // group, period and block from Z; row/col place the element in the 18-column table (f block on rows 9 and 10)
  // Layout as on the AP Chemistry reference table and in OpenStax: La and Ac in group 3, Ce–Lu and Th–Lr in the two
  // rows below (rows 9 and 10, under groups 4 to 17), so each f row has 14 cells.
  function place(Z) {
    var P = [0, 2, 10, 18, 36, 54, 86, 118], p = 1; while (Z > P[p]) p++;
    var k = Z - P[p - 1], g = null, b, r = p, c;
    if (p === 1) { g = Z === 1 ? 1 : 18; b = 's'; }
    else if (p <= 3) { g = k <= 2 ? k : k + 10; b = k <= 2 ? 's' : 'p'; }
    else if (p <= 5) { g = k; b = k <= 2 ? 's' : k <= 12 ? 'd' : 'p'; }
    else if (k <= 2) { g = k; b = 's'; }
    else if (k === 3) { g = 3; b = 'd'; }
    else if (k <= 17) { b = 'f'; r = p + 3; c = k; }
    else { g = k - 14; b = k <= 26 ? 'd' : 'p'; }
    if (c == null) c = g;
    return { g: g, p: p, b: b, r: r, c: c };
  }
  function family(e) {
    if (e.Z === 1) return 'hydrogen';
    if (e.Z >= 57 && e.Z <= 71) return 'lanthanide'; if (e.Z >= 89 && e.Z <= 103) return 'actinide';
    if (e.group === 1) return 'alkali'; if (e.group === 2) return 'alkearth';
    if (e.kind === 'u') return 'unknown';
    if (e.group === 18) return 'noble'; if (e.group === 17) return 'halogen';
    if (e.group >= 3 && e.group <= 12) return 'transition';
    if (e.kind === 'd') return 'metalloid'; if (e.kind === 'm') return 'post'; if (e.kind === 'u') return 'unknown';
    return 'nonmetal';
  }
  var FAMN = { hydrogen: 'Hydrogen', alkali: 'Alkali metals', alkearth: 'Alkaline earth metals', transition: 'Transition metals', lanthanide: 'Lanthanides', actinide: 'Actinides', post: 'Other metals', metalloid: 'Metalloids', nonmetal: 'Other nonmetals', halogen: 'Halogens', noble: 'Noble gases', unknown: 'Properties not yet known' };
  function el(x) { if (x == null) return null; if (typeof x === 'number') return EL[x] || null; var s = String(x).trim(); if (BYS[s]) return BYS[s]; for (var i = 1; i < EL.length; i++) if (EL[i].name.toLowerCase() === s.toLowerCase()) return EL[i]; return null; }

  // ---------- electron configurations ----------
  // Madelung (n + l, then n) filling, with the ground-state exceptions measured for real atoms (NIST Atomic Spectra
  // Database). Elements from Lr (103) on are predictions.
  var SUBS = []; (function () { for (var s = 1; s <= 8; s++) for (var l = M.min(3, s - 1); l >= 0; l--) { var n = s - l; if (n > l && n <= 7) SUBS.push([n, l]); } })();
  SUBS.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]) || a[0] - b[0]; });
  var LL = 'spdf', CAPL = [2, 6, 10, 14];
  var EXC = { 24: { '3d': 5, '4s': 1 }, 29: { '3d': 10, '4s': 1 }, 41: { '4d': 4, '5s': 1 }, 42: { '4d': 5, '5s': 1 }, 44: { '4d': 7, '5s': 1 }, 45: { '4d': 8, '5s': 1 }, 46: { '4d': 10, '5s': 0 }, 47: { '4d': 10, '5s': 1 },
    57: { '4f': 0, '5d': 1 }, 58: { '4f': 1, '5d': 1 }, 64: { '4f': 7, '5d': 1 }, 78: { '5d': 9, '6s': 1 }, 79: { '5d': 10, '6s': 1 },
    89: { '5f': 0, '6d': 1 }, 90: { '5f': 0, '6d': 2 }, 91: { '5f': 2, '6d': 1 }, 92: { '5f': 3, '6d': 1 }, 93: { '5f': 4, '6d': 1 }, 96: { '5f': 7, '6d': 1 }, 103: { '6d': 0, '7p': 1 } };
  function aufbau(ne) { var occ = {}, left = ne; SUBS.forEach(function (q) { if (left <= 0) return; var k = q[0] + LL[q[1]], e = M.min(left, CAPL[q[1]]); occ[k] = e; left -= e; }); return occ; }
  function config(Z, charge) { // {occ: {'1s': 2, ...}, list: [[n, l, e]] in filling order}
    var occ = aufbau(Z);
    if (EXC[Z]) for (var k in EXC[Z]) occ[k] = EXC[Z][k];
    charge = charge || 0;
    if (charge > 0) { // cations lose electrons from the highest n first (4s before 3d), then the highest l
      for (var i = 0; i < charge; i++) {
        var best = null; for (var kk in occ) if (occ[kk] > 0) { var n = +kk[0], l = LL.indexOf(kk[1]); if (!best || n > best[0] || (n === best[0] && l > best[1])) best = [n, l, kk]; }
        if (best) occ[best[2]]--;
      }
    } else if (charge < 0) { // anions: the next electrons go where the neutral atom would put them
      var occ2 = aufbau(Z - charge), base = aufbau(Z); for (var k2 in occ2) occ[k2] = (occ[k2] || 0) + occ2[k2] - (base[k2] || 0);
    }
    var list = SUBS.map(function (q) { var k = q[0] + LL[q[1]]; return [q[0], q[1], occ[k] || 0]; }).filter(function (x) { return x[2] > 0; });
    return { occ: occ, list: list };
  }
  var NOBLE = [2, 10, 18, 36, 54, 86, 118];
  function cfgStr(Z, charge, o) { // o: {short: true (noble-gas core), html: true, order: 'fill' | 'n'}
    o = o || {}; var cf = config(Z, charge), list = cf.list.slice(), core = '', ne = Z - (charge || 0);
    if (o.order === 'n') list.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    if (o.short) { // the largest noble-gas core the electrons contain (Ar is [Ne] 3s² 3p⁶; Na⁺ is [Ne])
      var ng = 0, ncore = null;
      NOBLE.forEach(function (g) { if (g < ne || (g === ne && charge)) { var nc = config(g).occ, full = true; for (var k in nc) if ((cf.occ[k] || 0) < nc[k]) full = false; if (full) { ng = g; ncore = nc; } } });
      if (ng) { core = '[' + EL[ng].s + ']'; list = list.map(function (x) { var k2 = x[0] + LL[x[1]]; return [x[0], x[1], x[2] - (ncore[k2] || 0)]; }).filter(function (x) { return x[2] > 0; }); }
    }
    var parts = list.map(function (x) { return x[0] + LL[x[1]] + (o.html ? '<sup>' + x[2] + '</sup>' : sup(x[2])); });
    if (core) parts.unshift(core);
    return parts.join(o.html ? ' ' : ' ') || (o.html ? '(no electrons)' : '(no electrons)');
  }
  function shells(Z, charge) { var cf = config(Z, charge), s = []; cf.list.forEach(function (x) { s[x[0] - 1] = (s[x[0] - 1] || 0) + x[2]; }); for (var i = 0; i < s.length; i++) s[i] = s[i] || 0; return s; }
  function valence(Z) { var e = EL[Z]; if (!e) return null; if (e.group === 18) return Z === 2 ? 2 : 8; if (e.group <= 2) return e.group; if (e.group >= 13) return e.group - 10; return null; }

  // ---------- formulas ----------
  /* parseF("Ca(NO3)2") -> {atoms: {Ca: 1, N: 2, O: 6}, charge: 0, ok: true, coef: 1}
     Accepts groups ( ) and [ ], hydrates with * or ·, a charge after ^ ("SO4^2-", "[Cu(NH3)4]^2+") or trailing signs
     ("Na+", "Cl-", "Fe3+" for a single element), state symbols (aq) (s) (l) (g), the electron "e-", and a leading
     coefficient ("2H2O"). */
  function splitCharge(s) {
    s = s.replace(/\((aq|s|l|g)\)\s*$/, '').trim(); var ch = 0, m;
    if ((m = s.match(/\^\s*(\d*)\s*([+\-−])\s*$/))) { ch = (m[1] ? +m[1] : 1) * (m[2] === '+' ? 1 : -1); s = s.slice(0, m.index); }
    else if ((m = s.match(/\^\s*([+\-−])(\d*)\s*$/))) { ch = (m[2] ? +m[2] : 1) * (m[1] === '+' ? 1 : -1); s = s.slice(0, m.index); }
    else if ((m = s.match(/^([A-Z][a-z]?)(\d+)([+\-−])$/)) && BYS[m[1]]) { ch = +m[2] * (m[3] === '+' ? 1 : -1); s = m[1]; }
    else if ((m = s.match(/([+\-−]+)$/))) { ch = m[1].length * (m[1][0] === '+' ? 1 : -1); s = s.slice(0, m.index); }
    return [s.trim(), ch];
  }
  function parseF(str) {
    var out = { atoms: {}, charge: 0, ok: true, coef: 1, src: String(str || '') }, s = out.src.trim();
    if (s === 'e-' || s === 'e−' || s === 'e^-') { out.electron = true; out.charge = -1; return out; }
    var cm = s.match(/^(\d+)\s*(?=[A-Z(\[])/); if (cm) { out.coef = +cm[1]; s = s.slice(cm[0].length); }
    var sc = splitCharge(s); s = sc[0]; out.charge = sc[1];
    s.split(/[*·•]/).forEach(function (part) {
      part = part.trim(); var mult = 1, mm = part.match(/^(\d+)/); if (mm) { mult = +mm[1]; part = part.slice(mm[0].length); }
      var stack = [{}], i = 0;
      while (i < part.length) {
        var ch = part[i];
        if (ch === '(' || ch === '[') { stack.push({}); i++; }
        else if (ch === ')' || ch === ']') { i++; var nm = part.slice(i).match(/^\d+/), n = nm ? +nm[0] : 1; if (nm) i += nm[0].length; var top = stack.pop(); if (!stack.length) { out.ok = false; return; } for (var k in top) stack[stack.length - 1][k] = (stack[stack.length - 1][k] || 0) + top[k] * n; }
        else if (/[A-Z]/.test(ch)) { var em = part.slice(i).match(/^([A-Z][a-z]?)(\d*)/); var sym = em[1]; if (!BYS[sym]) out.ok = false; stack[stack.length - 1][sym] = (stack[stack.length - 1][sym] || 0) + (em[2] ? +em[2] : 1); i += em[0].length; }
        else if (/\s/.test(ch)) i++;
        else { out.ok = false; i++; }
      }
      if (stack.length !== 1) out.ok = false;
      for (var k2 in stack[0]) out.atoms[k2] = (out.atoms[k2] || 0) + stack[0][k2] * mult;
    });
    return out;
  }
  function molarMass(f) { var p = typeof f === 'string' ? parseF(f) : f, m = 0; for (var k in p.atoms) m += BYS[k].mass * p.atoms[k]; return m; }
  function atomCount(f) { var p = typeof f === 'string' ? parseF(f) : f, n = 0; for (var k in p.atoms) n += p.atoms[k]; return n; }
  function chargeStr(q) { return q === 0 ? '' : (M.abs(q) === 1 ? '' : M.abs(q)) + (q > 0 ? '+' : '−'); }
  // runs of text for drawing a formula: [[text, 'n'|'sub'|'sup']]
  function fRuns(str) {
    var s = String(str), runs = [], cm = s.match(/^(\d+)\s*(?=[A-Z(\[])/), lead = '';
    if (s === 'e-' || s === 'e−') return [['e', 'n'], ['−', 'sup']];
    if (cm) { lead = cm[1]; s = s.slice(cm[0].length); }
    var st = s.match(/\s*\((aq|s|l|g)\)\s*$/), state = ''; if (st) { state = '(' + st[1] + ')'; s = s.slice(0, st.index); }
    var sc = splitCharge(s), body = sc[0], q = sc[1];
    if (lead) runs.push([lead, 'n']);
    var prevAtomOrClose = false, afterDot = false;
    for (var i = 0; i < body.length; i++) {
      var ch = body[i];
      if (/\d/.test(ch)) { var m = body.slice(i).match(/^\d+/)[0]; if (prevAtomOrClose && !afterDot) runs.push([m, 'sub']); else runs.push([m, 'n']); i += m.length - 1; afterDot = false; continue; }
      if (ch === '*' || ch === '·' || ch === '•') { runs.push(['·', 'n']); prevAtomOrClose = false; afterDot = true; continue; }
      afterDot = false; prevAtomOrClose = /[A-Za-z)\]]/.test(ch); runs.push([ch, 'n']);
    }
    if (q) runs.push([chargeStr(q), 'sup']);
    if (state) runs.push([state, 'n']);
    // merge neighbors of the same kind
    var out = []; runs.forEach(function (r) { if (out.length && out[out.length - 1][1] === r[1]) out[out.length - 1][0] += r[0]; else out.push(r.slice()); });
    return out;
  }
  function fH(str) { return fRuns(str).map(function (r) { return r[1] === 'n' ? esc(r[0]) : '<' + r[1] + '>' + esc(r[0]) + '</' + r[1] + '>'; }).join(''); }
  function fT(str) { return fRuns(str).map(function (r) { return r[1] === 'sub' ? sub(r[0]) : r[1] === 'sup' ? sup(r[0].replace('−', '-')) : r[0]; }).join(''); }
  // equations: "2H2 + O2 -> 2H2O" -> {left: [{c, f}], right: [...], arrow: '->' | '<=>'}
  function parseEq(s) {
    var m = String(s).split(/\s*(->|→|<=>|⇌|=)\s*/), out = { left: [], right: [], arrow: '->' };
    if (m.length < 3) return null; out.arrow = /<=>|⇌/.test(m[1]) ? '<=>' : '->';
    function side(t) { return t.split(/\s+\+\s+/).map(function (x) { x = x.trim(); var c = x.match(/^(\d+)\s*(?=[A-Za-z(\[])/); return { c: c ? +c[1] : 1, f: c ? x.slice(c[0].length).trim() : x }; }).filter(function (x) { return x.f; }); }
    out.left = side(m[0]); out.right = side(m[2]); return out;
  }
  function eqH(eq, coefs) { // HTML for an equation object; coefs optional array of left+right coefficients
    var i = 0; function side(L) { return L.map(function (t) { var c = coefs ? coefs[i++] : t.c; return (c === 1 ? '' : '<b>' + c + '</b>') + fH(t.f); }).join(' + '); }
    return side(eq.left) + (eq.arrow === '<=>' ? ' ⇌ ' : ' → ') + side(eq.right);
  }
  // draw a formula on a canvas; returns its width. o: {size, align ('left'|'center'|'right'), color, bold, measure}
  function fDraw(ctx, str, x, y, o) {
    o = o || {}; var size = o.size || 14, runs = typeof str === 'string' ? fRuns(str) : str, w = 0, font = function (k) { return (o.bold ? '700 ' : '600 ') + (k === 'n' ? size : M.round(size * 0.68)) + 'px system-ui,sans-serif'; };
    ctx.save(); runs.forEach(function (r) { ctx.font = font(r[1]); r.w = ctx.measureText(r[0]).width + (r[1] !== 'n' ? 0.5 : 0); w += r.w; });
    if (o.measure) { ctx.restore(); return w; }
    var x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    ctx.fillStyle = o.color || V.colors().ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    runs.forEach(function (r) { ctx.font = font(r[1]); ctx.fillText(r[0], x0, y + (r[1] === 'sub' ? size * 0.3 : r[1] === 'sup' ? -size * 0.38 : 0)); x0 += r.w; });
    ctx.restore(); return w;
  }

  // ---------- colors ----------
  // site colors: racing green #004225 / #00562f, dark accent #6cc79a, gold #b8963e; the Chemistry Ladder accent #7d3c78 (dark #d39ad0)
  function dark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function pal() {
    var k = V.colors(), d = dark();
    k.dark = d; k.acc = d ? '#d39ad0' : '#7d3c78'; k.accSoft = d ? 'rgba(211,154,208,.25)' : 'rgba(125,60,120,.14)';
    k.site = d ? '#6cc79a' : '#00562f'; k.brass = '#b8963e';
    k.glass = d ? 'rgba(160,200,220,.10)' : 'rgba(120,170,200,.10)'; k.glassLine = d ? 'rgba(190,220,235,.55)' : 'rgba(70,110,140,.55)';
    k.water = d ? 'rgba(90,160,220,.22)' : 'rgba(80,150,220,.16)'; k.waterLine = d ? 'rgba(120,190,240,.7)' : 'rgba(40,110,190,.6)';
    k.lab = d ? '#0f1c16' : '#f7faf8'; k.labLine = d ? '#2a4034' : '#d7e1db';
    k.plus = d ? '#ff8787' : '#d6336c'; k.minus = d ? '#74c0fc' : '#1c6fd6';
    return k;
  }
  // element colors, one table for every visual: H white with a gray outline, C dark gray, N blue, O red, F and Cl green,
  // Br dark red, I purple, S yellow, P orange, metals silver-blue, Na and K violet, unknown pink (plus a few extras)
  var ELC = { H: '#f8f9fa', C: '#3b4148', N: '#3b6fd8', O: '#e03131', F: '#7bd88f', Cl: '#2f9e44', Br: '#a61e1e', I: '#6741d9', S: '#f2c230', P: '#f08c00', Na: '#ae5ad8', K: '#ae5ad8', Li: '#c084fc', Rb: '#ae5ad8', Cs: '#ae5ad8',
    He: '#66d9e8', Ne: '#66d9e8', Ar: '#66d9e8', Kr: '#66d9e8', Xe: '#66d9e8', B: '#f4a582', Si: '#c9a46a', Se: '#e8a33d', X: '#f06595', A: '#3b6fd8', Bz: '#f08c00' };
  function elColor(sym) {
    if (ELC[sym]) return ELC[sym];
    var e = BYS[sym]; if (e && (e.kind === 'm')) return '#8ea9c8'; return '#f06595';
  }
  /* ball(ctx, x, y, r, sym, o): an atom or ion as a softly lit sphere.
     o: {charge, label (true: the symbol), color (override), alpha, ring (selection ring color), flat (no shading)} */
  function ball(ctx, x, y, r, sym, o) {
    o = o || {}; var k = pal(), col = o.color || elColor(sym), light = sym === 'H' && !o.color;
    ctx.save(); if (o.alpha != null) ctx.globalAlpha = o.alpha;
    if (o.flat || r < 3.5) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
    else {
      var g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.08, x, y, r * 1.02);
      g.addColorStop(0, shade(col, 0.55)); g.addColorStop(0.55, col); g.addColorStop(1, shade(col, light ? -0.18 : -0.38));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
    ctx.lineWidth = M.max(0.8, r * 0.07); ctx.strokeStyle = light ? '#8a959e' : (sym === 'C' && k.dark ? '#9aa4ad' : shade(col, -0.45)); ctx.stroke();
    if (o.label && r >= 7) { ctx.fillStyle = light || ['S', 'F', 'He', 'Ne', 'Ar', 'B', 'Se', 'Si'].indexOf(sym) >= 0 ? '#1d2320' : '#fff'; var lbl = String(o.text || sym), fsz = clamp(r * (lbl.length > 2 ? 0.62 : lbl.length > 1 ? 0.78 : 0.95), 7, 18); ctx.font = '700 ' + M.round(fsz) + 'px system-ui,sans-serif'; var lw = ctx.measureText(lbl).width; if (lw > r * 1.85) { fsz = M.max(6, fsz * r * 1.85 / lw); ctx.font = '700 ' + M.round(fsz) + 'px system-ui,sans-serif'; } ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.text || sym, x, y + 0.5); }
    if (o.charge) {
      var q = o.charge, t = (M.abs(q) > 1 ? M.abs(q) : '') + (q > 0 ? '+' : '−'), br = M.max(6.5, r * 0.42), bx = x + r * 0.72, by = y - r * 0.72;
      ctx.fillStyle = q > 0 ? k.plus : k.minus; ctx.beginPath(); ctx.arc(bx, by, br + (t.length > 1 ? 2.5 : 0), 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '700 ' + M.round(br * 1.25) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, bx, by + 0.5);
    }
    if (o.ring) { ctx.globalAlpha = 1; ctx.strokeStyle = o.ring; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(x, y, r + 5, 0, TAU); ctx.stroke(); }
    ctx.restore();
  }
  // drawing radius of an atom in a particle picture (sizes follow covalent radii, squeezed so H is still visible)
  function aR(sym, base) { var e = BYS[sym], rc = e && e.rcov ? e.rcov : 100; return base * (0.5 + 0.5 * M.sqrt(rc / 100)); }

  // ---------- molecule sprites: 2-D layouts for particle pictures ----------
  /* sprite(f) -> {atoms: [{s, x, y, q}], bonds: [[i, j, order]], r (radius in bond-length units), ion}
     Coordinates are in units of one bond length. Known shapes come from MOLS; anything else gets a central atom with its
     neighbors spread around it (good enough for a particle picture; ch-vsepr and ch-lewis have the real geometry). */
  var A104 = 104.5 * PI / 180, A107 = 107 * PI / 180;
  function bent(c, o, ang, L) { L = L || 1; return [[c, 0, 0], [o, -L * M.sin(ang / 2), L * M.cos(ang / 2)], [o, L * M.sin(ang / 2), L * M.cos(ang / 2)]]; }
  var MOLS = {
    H2O: { a: bent('O', 'H', A104, 0.78) }, H2S: { a: bent('S', 'H', 92 * PI / 180, 0.85) }, SO2: { a: bent('S', 'O', 119 * PI / 180, 1) }, O3: { a: bent('O', 'O', 117 * PI / 180, 1) }, NO2: { a: bent('N', 'O', 134 * PI / 180, 1) },
    CO2: { a: [['C', 0, 0], ['O', -1, 0], ['O', 1, 0]] }, HCN: { a: [['C', 0, 0], ['H', -0.85, 0], ['N', 1, 0]] }, N2O: { a: [['N', 0, 0], ['N', -1, 0], ['O', 1, 0]] },
    NH3: { a: [['N', 0, -0.1], ['H', -0.8, 0.45], ['H', 0.8, 0.45], ['H', 0, 0.75]] }, CH4: { a: [['C', 0, 0], ['H', -0.75, -0.55], ['H', 0.75, -0.55], ['H', -0.55, 0.75], ['H', 0.6, 0.7]] },
    NH4: { a: [['N', 0, 0], ['H', -0.75, -0.55], ['H', 0.75, -0.55], ['H', -0.55, 0.75], ['H', 0.6, 0.7]] }, H3O: { a: [['O', 0, -0.1], ['H', -0.8, 0.45], ['H', 0.8, 0.45], ['H', 0, 0.78]] },
    HCl: { a: [['Cl', 0, 0], ['H', 0.95, 0]] }, HF: { a: [['F', 0, 0], ['H', 0.8, 0]] }, HBr: { a: [['Br', 0, 0], ['H', 1, 0]] }, HI: { a: [['I', 0, 0], ['H', 1.05, 0]] }, OH: { a: [['O', 0, 0], ['H', 0.78, 0]] },
    N2O4: { a: [['N', -0.5, 0], ['N', 0.5, 0], ['O', -1.05, -0.75], ['O', -1.05, 0.75], ['O', 1.05, -0.75], ['O', 1.05, 0.75]] },
    SO3: { a: [['S', 0, 0], ['O', 0, -1], ['O', -0.87, 0.5], ['O', 0.87, 0.5]] }, NO3: { a: [['N', 0, 0], ['O', 0, -1], ['O', -0.87, 0.5], ['O', 0.87, 0.5]] }, CO3: { a: [['C', 0, 0], ['O', 0, -1], ['O', -0.87, 0.5], ['O', 0.87, 0.5]] },
    SO4: { a: [['S', 0, 0], ['O', 0, -1], ['O', -0.95, 0.3], ['O', 0.95, 0.3], ['O', 0, 0.98]] }, PO4: { a: [['P', 0, 0], ['O', 0, -1], ['O', -0.95, 0.3], ['O', 0.95, 0.3], ['O', 0, 0.98]] }, ClO4: { a: [['Cl', 0, 0], ['O', 0, -1], ['O', -0.95, 0.3], ['O', 0.95, 0.3], ['O', 0, 0.98]] },
    CH3OH: { a: [['C', -0.5, 0], ['O', 0.5, 0], ['H', 1, 0.6], ['H', -0.9, -0.7], ['H', -1.15, 0.35], ['H', -0.55, 0.85]] },
    C2H5OH: { a: [['C', -0.95, 0.1], ['C', 0, -0.4], ['O', 0.95, 0.1], ['H', 1.55, -0.35], ['H', -1.6, -0.35], ['H', -1.1, 0.95], ['H', -0.7, -0.15], ['H', -0.05, -1.25], ['H', 0.15, 0.25]] },
    CH3COOH: { a: [['C', -0.6, 0], ['C', 0.4, 0], ['O', 0.95, -0.8], ['O', 1, 0.75], ['H', 1.75, 0.6], ['H', -1.3, -0.55], ['H', -1.25, 0.6], ['H', -0.6, 0.9]] },
    CH3COO: { a: [['C', -0.6, 0], ['C', 0.4, 0], ['O', 0.95, -0.8], ['O', 1, 0.75], ['H', -1.3, -0.55], ['H', -1.25, 0.6], ['H', -0.6, 0.9]] },
    C2H6: { a: [['C', -0.5, 0], ['C', 0.5, 0], ['H', -0.95, -0.75], ['H', -0.95, 0.75], ['H', -1.3, 0], ['H', 0.95, -0.75], ['H', 0.95, 0.75], ['H', 1.3, 0]] },
    C2H4: { a: [['C', -0.45, 0], ['C', 0.45, 0], ['H', -1, -0.7], ['H', -1, 0.7], ['H', 1, -0.7], ['H', 1, 0.7]], b: [[0, 1, 2]] },
    CCl4: { a: [['C', 0, 0], ['Cl', -0.8, -0.6], ['Cl', 0.8, -0.6], ['Cl', -0.6, 0.8], ['Cl', 0.65, 0.75]] },
    H2O2: { a: [['O', -0.5, 0], ['O', 0.5, 0], ['H', -0.9, 0.6], ['H', 0.9, -0.6]] }
  };
  // sucrose and glucose: two (or one) sugar rings, drawn as rings with a few OH groups; enough to show one whole molecule
  function sugarSprite(two) {
    var at = [], i, cx, cy;
    function ring(nn, x0, y0, R, oAt) { var start = at.length; for (i = 0; i < nn; i++) { var a = -PI / 2 + i * TAU / nn; at.push([i === oAt ? 'O' : 'C', x0 + R * M.cos(a), y0 + R * M.sin(a)]); } return start; }
    var s1 = ring(6, two ? -1.05 : 0, 0, 0.8, 0);
    for (i = 1; i < 6; i += 2) { var a1 = -PI / 2 + i * TAU / 6; at.push(['O', (two ? -1.05 : 0) + 1.45 * M.cos(a1), 1.45 * M.sin(a1)]); }
    if (two) { at.push(['O', 0, -0.25]); var s2 = ring(5, 1.05, 0, 0.72, 0); cx = 1.05; cy = 0; for (i = 2; i < 5; i += 2) { var a2 = -PI / 2 + i * TAU / 5; at.push(['O', cx + 1.3 * M.cos(a2), cy + 1.3 * M.sin(a2)]); } }
    return at;
  }
  var SPR = {};
  function sprite(f) {
    if (SPR[f]) return SPR[f];
    var p = parseF(f), key = splitCharge(String(f).replace(/^\d+/, ''))[0].replace(/[()\[\]]/g, ''), def = MOLS[key], atoms, n = atomCount(p), out;
    if (def) atoms = def.a.map(function (a) { return { s: a[0], x: a[1], y: a[2] }; });
    else if (key === 'C12H22O11' || key === 'C6H12O6') atoms = sugarSprite(key === 'C12H22O11').map(function (a) { return { s: a[0], x: a[1], y: a[2] }; });
    else if (n === 1) atoms = [{ s: Object.keys(p.atoms)[0], x: 0, y: 0 }];
    else if (n === 2) { var ks = Object.keys(p.atoms); atoms = [{ s: ks[0], x: -0.5, y: 0 }, { s: ks.length > 1 ? ks[1] : ks[0], x: 0.5, y: 0 }]; }
    else { // central atom (the first non-H atom that occurs once, else the first), the rest around it
      var syms = []; for (var s in p.atoms) for (var i = 0; i < p.atoms[s]; i++) syms.push(s);
      var ci = syms.findIndex(function (s2) { return s2 !== 'H' && p.atoms[s2] === 1; }); if (ci < 0) ci = 0;
      var cen = syms.splice(ci, 1)[0]; atoms = [{ s: cen, x: 0, y: 0 }];
      syms.forEach(function (s2, j) { var a = -PI / 2 + j * TAU / syms.length; atoms.push({ s: s2, x: M.cos(a), y: M.sin(a) }); });
    }
    var bonds = [];
    if (def && def.b) bonds = def.b.slice();
    // bond every atom to its nearest heavier neighbor (enough for drawing sticks)
    for (var a2 = 1; a2 < atoms.length; a2++) {
      var best = -1, bd = 9; for (var b2 = 0; b2 < atoms.length; b2++) { if (b2 === a2) continue; if (atoms[b2].s === 'H' && atoms[a2].s === 'H') continue; var d = M.hypot(atoms[a2].x - atoms[b2].x, atoms[a2].y - atoms[b2].y); if (d < bd && (b2 < a2 || atoms[a2].s === 'H')) { bd = d; best = b2; } }
      if (best >= 0 && bd < 1.6 && !bonds.some(function (q) { return (q[0] === a2 && q[1] === best) || (q[1] === a2 && q[0] === best); })) bonds.push([best, a2, 1]);
    }
    var R = 0; atoms.forEach(function (a) { R = M.max(R, M.hypot(a.x, a.y) + 0.45); });
    out = { atoms: atoms, bonds: bonds, r: R, charge: p.charge, f: f, ion: p.charge !== 0 };
    SPR[f] = out; return out;
  }
  /* drawMol(ctx, f, x, y, unit, o): a molecule (or ion) with its center at x, y; unit = px per bond length.
     o: {rot, alpha, label (tag under it), labels (atom symbols), charge badge on ions, ring} */
  function drawMol(ctx, f, x, y, unit, o) {
    o = o || {}; var sp = typeof f === 'string' ? sprite(f) : f, k = pal(), c = M.cos(o.rot || 0), s = M.sin(o.rot || 0);
    if (sp.r > 1.8) unit = unit * 1.8 / sp.r; // big molecules (sugar) are drawn smaller so they fit among the others
    var base = unit * 0.42;
    var pts = sp.atoms.map(function (a) { return [x + (a.x * c - a.y * s) * unit, y + (a.x * s + a.y * c) * unit]; });
    ctx.save(); if (o.alpha != null) ctx.globalAlpha = o.alpha;
    if (sp.atoms.length === 1) ball(ctx, x, y, o.r || aR(sp.atoms[0].s, unit * 0.62), sp.atoms[0].s, { charge: sp.charge, label: o.labels, ring: o.ring, alpha: o.alpha });
    else {
      ctx.strokeStyle = k.dark ? 'rgba(220,230,225,.55)' : 'rgba(60,70,65,.55)'; ctx.lineWidth = M.max(1.5, unit * 0.12); ctx.lineCap = 'round';
      sp.bonds.forEach(function (b) { ctx.beginPath(); ctx.moveTo(pts[b[0]][0], pts[b[0]][1]); ctx.lineTo(pts[b[1]][0], pts[b[1]][1]); ctx.stroke(); });
      // draw far-from-viewer feel: hydrogens first, then heavier atoms
      var order = sp.atoms.map(function (a, i) { return i; }).sort(function (i, j) { return (sp.atoms[i].s === 'H' ? 0 : 1) - (sp.atoms[j].s === 'H' ? 0 : 1); });
      order.forEach(function (i) { ball(ctx, pts[i][0], pts[i][1], aR(sp.atoms[i].s, base), sp.atoms[i].s, { label: o.labels && base > 6, alpha: o.alpha }); });
      if (sp.charge) { var rr = sp.r * unit; ctx.globalAlpha = o.alpha != null ? o.alpha : 1; var t = (M.abs(sp.charge) > 1 ? M.abs(sp.charge) : '') + (sp.charge > 0 ? '+' : '−'); ctx.fillStyle = sp.charge > 0 ? k.plus : k.minus; ctx.beginPath(); ctx.arc(x + rr * 0.75, y - rr * 0.75, 7.5 + (t.length > 1 ? 2 : 0), 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 10px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x + rr * 0.75, y - rr * 0.75 + 0.5); }
      if (o.ring) { ctx.strokeStyle = o.ring; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(x, y, sp.r * unit + 4, 0, TAU); ctx.stroke(); }
    }
    if (o.tag) { ctx.globalAlpha = 1; fDraw(ctx, o.tag === true ? sp.f : o.tag, x, y + (sp.atoms.length === 1 ? (o.r || aR(sp.atoms[0].s, unit * 0.62)) : sp.r * unit) + 9, { size: 11, align: 'center', color: k.muted }); }
    ctx.restore();
  }
  function molR(f, unit) { var sp = sprite(f); return sp.atoms.length === 1 ? aR(sp.atoms[0].s, unit * 0.62) : M.min(sp.r, 1.8) * unit; }

  // ---------- frame: task line, picture, controls, readout, text alternative ----------
  var nViz = 0;
  function frame(el, o, label, alt) {
    el.classList.add('chv'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { el: el, o: o, quiet: !!(o.quiet || o.readout === false), edit: o.edit !== false, id: 'chv' + (++nViz) };
    if (o.task) { F.task = mk('p', 'chv-task', '<span class="chv-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = mk('div', 'chv-box'); el.appendChild(F.box);
    F.ctl = mk('div', 'ml-ctl'); el.appendChild(F.ctl); if (!F.edit) F.ctl.hidden = true;
    F.out = V.readout(el); F.out.el.classList.add('chv-ro');
    F.alt = mk('p', 'chv-sr'); F.alt.id = F.id + '-alt'; el.appendChild(F.alt); F.setAlt = function (t) { F.alt.textContent = t; }; F.setAlt(alt || label);
    var was = false;
    F.done = function (ok) { if (!F.task) return; ok = !!ok; F.task.classList.toggle('ok', ok); if (ok && !was) F.task.setAttribute('aria-live', 'polite'); was = ok; };
    F.say = function (h) { F.out.set(h); };
    F.canvas = function (q) { // a canvas sized by aspect ratio; narrow screens get a squarer one unless q.narrow is false
      q = q || {}; var qq = { aspect: q.aspect || 1.6, min: q.min || 240, max: q.max || 460, height: o.height || q.height }, c = V.canvas(F.box, qq); c.q = qq;
      c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-describedby', F.alt.id); c.cv.setAttribute('aria-label', q.label || o.label || label);
      if (q.narrow !== false && !o.height && !q.height) { var adj = function () { if (qq.fixed) return; var w = F.box.clientWidth || 300, nh = w < 520 ? M.round(w / M.min(qq.aspect, q.narrow || 1.15)) : 0; if (nh && q.min) nh = M.max(nh, q.min); if (nh !== (qq.height || 0)) { qq.height = nh || undefined; c.fit(); } }; c.onResize(adj); adj(); }
      return c;
    };
    F.row = function (cls) { var r = mk('div', 'ml-ctl' + (cls ? ' ' + cls : '')); el.insertBefore(r, F.out.el); if (!F.edit) r.hidden = true; return r; };
    F.html = function (cls) { var r = mk('div', cls || ''); el.insertBefore(r, F.out.el); return r; };
    return F;
  }
  function redraw(c, fn) { c.onResize(fn); V.onTheme(fn); }
  function check(parent, text, on, fn) { var l = mk('label', 'chv-chk'), i = D.createElement('input'); i.type = 'checkbox'; i.checked = !!on; l.appendChild(i); l.appendChild(D.createTextNode(' ' + text)); i.addEventListener('change', function () { fn(i.checked); }); parent.appendChild(l); return i; }
  function seg(parent, label, items, value, fn) { return V.seg(parent, { label: label, items: items, value: value, change: fn }); }
  function btn(parent, text, fn, cls) { return V.button(parent, text, fn, cls); }
  function sl(parent, o) { return V.slider(parent, o); }
  /* animation: anim(F, c, step) runs step(dt) every frame while on screen. With reduced motion it never starts by itself;
     a Play button (added by the visual) calls .play(). Returns {play(), stop(), running(), toggle()} */
  function anim(el, step, auto) {
    var on = false, lp = null;
    var api = {
      play: function () { on = true; if (!lp) lp = V.loop(el, function (dt) { if (on) step(dt); }); else lp.start(); },
      stop: function () { on = false; if (lp) lp.stop(); }, running: function () { return on; },
      toggle: function () { if (on) api.stop(); else api.play(); return on; }
    };
    if (auto !== false && !V.reduced) api.play();
    return api;
  }
  function playBtn(parent, A, onToggle) { // ▶ Play / ❚❚ Pause, aria-pressed
    var b = btn(parent, A.running() ? '❚❚ Pause' : '▶ Play', function () { A.toggle(); sync(); if (onToggle) onToggle(A.running()); });
    function sync() { b.textContent = A.running() ? '❚❚ Pause' : '▶ Play'; b.setAttribute('aria-pressed', String(A.running())); }
    sync(); b.sync = sync; return b;
  }

  // ---------- canvas drawing helpers (pixel coordinates) ----------
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
  function txt(ctx, s, x, y, o) { o = o || {}; var k = pal(); ctx.save(); ctx.font = o.font || ((o.italic ? 'italic ' : '') + (o.bold ? '700 ' : o.light ? '400 ' : '600 ') + (o.size || 12) + 'px ' + (o.serif ? 'Georgia,serif' : 'system-ui,sans-serif')); ctx.fillStyle = o.color || k.muted; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle'; if (o.rot) { ctx.translate(x, y); ctx.rotate(o.rot); ctx.fillText(s, 0, 0); } else ctx.fillText(s, x, y); ctx.restore(); }
  function tw(ctx, s, size, bold) { ctx.save(); ctx.font = (bold ? '700 ' : '600 ') + (size || 12) + 'px system-ui,sans-serif'; var w = ctx.measureText(s).width; ctx.restore(); return w; }
  function wrapL(ctx, s, maxW, size, bold) { // split text into lines no wider than maxW
    var words = String(s).split(' '), out = [], cur = '';
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (cur && tw(ctx, t, size, bold) > maxW) { out.push(cur); cur = w; } else cur = t; });
    if (cur) out.push(cur); return out;
  }
  function txtw(ctx, s, x, y, maxW, o) { // wrapped text; o.up draws the lines upward so the last one sits at y
    o = o || {}; var size = o.size || 12, lh = o.lh || M.round(size * 1.25), L = wrapL(ctx, s, maxW, size, o.bold), y0 = o.up ? y - (L.length - 1) * lh : y;
    if (o.bg) { var mw = 0; L.forEach(function (ln) { mw = M.max(mw, tw(ctx, ln, size, o.bold)); }); var bx = o.align === 'center' ? x - mw / 2 : o.align === 'right' ? x - mw : x; ctx.save(); ctx.fillStyle = o.bg; rr(ctx, bx - 5, y0 - lh / 2 - 2, mw + 10, L.length * lh + 4, 6); ctx.fill(); ctx.restore(); }
    L.forEach(function (ln, i) { txt(ctx, ln, x, y0 + i * lh, o); }); return L.length;
  }
  function pill(ctx, s, x, y, o) { // text on a soft rounded background; returns [x0, y0, w, h]
    o = o || {}; var k = pal(), size = o.size || 12; ctx.save(); ctx.font = (o.bold === false ? '600 ' : '700 ') + size + 'px system-ui,sans-serif';
    var w = ctx.measureText(s).width + 12, h = size + 8, al = o.align || 'center', bx = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x, by = y - h / 2;
    if (o.clampW) bx = clamp(bx, 2, o.clampW - w - 2);
    ctx.fillStyle = o.bg || rgba(k.bg, 0.9); rr(ctx, bx, by, w, h, h / 2); ctx.fill(); if (o.line) { ctx.strokeStyle = o.line; ctx.lineWidth = 1.2; ctx.stroke(); }
    ctx.fillStyle = o.color || k.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, bx + 6, by + h / 2 + 0.5); ctx.restore(); return [bx, by, w, h];
  }
  function arrow(ctx, x1, y1, x2, y2, col, w, head, dash) {
    var ang = M.atan2(y2 - y1, x2 - x1), L = M.hypot(x2 - x1, y2 - y1), hs = M.min(head || 9, L * 0.5);
    ctx.save(); ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = w || 2; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.6 * M.cos(ang), y2 - hs * 0.6 * M.sin(ang)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(ang - 0.42), y2 - hs * M.sin(ang - 0.42)); ctx.lineTo(x2 - hs * M.cos(ang + 0.42), y2 - hs * M.sin(ang + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function line(ctx, pts, col, w, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash); ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.restore(); }
  function panel(ctx, x, y, w, h, o) { o = o || {}; var k = pal(); ctx.save(); rr(ctx, x, y, w, h, o.r == null ? 10 : o.r); ctx.fillStyle = o.fill || k.lab; ctx.fill(); ctx.strokeStyle = o.line || k.labLine; ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); }
  function knob(ctx, x, y, col, r) { var k = pal(); r = r || 7; ctx.save(); ctx.fillStyle = k.bg; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, TAU); ctx.fill(); ctx.restore(); }
  function focusRing(ctx, x, y, r) { var k = pal(); ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(x, y, r || 13, 0, TAU); ctx.stroke(); ctx.restore(); }
  function focusBox(ctx, x, y, w, h) { var k = pal(); ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]); rr(ctx, x, y, w, h, 6); ctx.stroke(); ctx.restore(); }
  // visible-light wavelength (nm) to a display color (after Dan Bruton's approximation; outside 380–750 nm a gray)
  function wlColor(nm, a) {
    var r = 0, g = 0, b = 0, f;
    if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; } else if (nm < 490) { g = (nm - 440) / 50; b = 1; } else if (nm < 510) { g = 1; b = -(nm - 510) / 20; } else if (nm < 580) { r = (nm - 510) / 70; g = 1; } else if (nm < 645) { r = 1; g = -(nm - 645) / 65; } else if (nm <= 750) r = 1;
    if (nm < 380 || nm > 750) return a == null ? '#9aa3a8' : 'rgba(154,163,168,' + a + ')';
    f = nm < 420 ? 0.3 + 0.7 * (nm - 380) / 40 : nm > 700 ? 0.3 + 0.7 * (750 - nm) / 50 : 1;
    function c(v) { return M.round(255 * M.pow(v * f, 0.8)); }
    return 'rgba(' + c(r) + ',' + c(g) + ',' + c(b) + ',' + (a == null ? 1 : a) + ')';
  }
  // color names for visible wavelengths (nm) and the complementary color on the artist's color wheel
  var WHEEL = [[380, 430, 'violet', 'yellow'], [430, 490, 'blue', 'orange'], [490, 560, 'green', 'red'], [560, 580, 'yellow', 'violet'], [580, 620, 'orange', 'blue'], [620, 750, 'red', 'green']];
  function colorName(nm) { for (var i = 0; i < WHEEL.length; i++) if (nm >= WHEEL[i][0] && nm < WHEEL[i][1]) return WHEEL[i][2]; return nm < 380 ? 'ultraviolet' : 'infrared'; }
  function compColor(nm) { for (var i = 0; i < WHEEL.length; i++) if (nm >= WHEEL[i][0] && nm < WHEEL[i][1]) return WHEEL[i][3]; return null; }
  var NAMED = { violet: '#8f3fd1', blue: '#2f6fdc', green: '#2f9e44', yellow: '#f2c230', orange: '#f08c00', red: '#e03131' };

  /* chart(c, o): a plot box with axes on its left and bottom edges.
     o: {x: [min, max], y: [min, max], ml, mr, mt, mb (margins), xlog, ylog, xrev, xl, yl (titles), xt, yt (tick step or
     list), xf, yf (tick formatters), grid (default true), xticks/yticks: false}. Returns {X, Y, x, y, box(), draw(ctx), clip(ctx), unclip(ctx)} */
  function niceStep(span, px, per) { var raw = span / M.max(2, px / (per || 70)), m = M.pow(10, M.floor(log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m; }
  function chart(c, o) {
    var C = { o: o };
    function L(v, lg) { return lg ? log10(v) : v; }
    C.box = function () { return { x0: o.ml == null ? 52 : o.ml, x1: c.w - (o.mr == null ? 14 : o.mr), y0: o.mt == null ? 12 : o.mt, y1: c.h - (o.mb == null ? 40 : o.mb) }; };
    C.X = function (v) { var b = C.box(), a = L(o.x[0], o.xlog), z = L(o.x[1], o.xlog), t = (L(v, o.xlog) - a) / (z - a); if (o.xrev) t = 1 - t; return b.x0 + t * (b.x1 - b.x0); };
    C.Y = function (v) { var b = C.box(), a = L(o.y[0], o.ylog), z = L(o.y[1], o.ylog); return b.y1 - (L(v, o.ylog) - a) / (z - a) * (b.y1 - b.y0); };
    C.x = function (px) { var b = C.box(), a = L(o.x[0], o.xlog), z = L(o.x[1], o.xlog), t = (px - b.x0) / (b.x1 - b.x0); if (o.xrev) t = 1 - t; var v = a + t * (z - a); return o.xlog ? M.pow(10, v) : v; };
    C.y = function (py) { var b = C.box(), a = L(o.y[0], o.ylog), z = L(o.y[1], o.ylog), v = a + (b.y1 - py) / (b.y1 - b.y0) * (z - a); return o.ylog ? M.pow(10, v) : v; };
    function ticks(r, lg, step, px) {
      if (Array.isArray(step)) return step.filter(function (v) { return v >= M.min(r[0], r[1]) - 1e-12 && v <= M.max(r[0], r[1]) + 1e-12; });
      var out = [], v;
      if (lg) { for (var e = M.ceil(log10(r[0]) - 1e-9); e <= log10(r[1]) + 1e-9; e += (step || 1)) out.push(M.pow(10, e)); return out; }
      var st = step || niceStep(r[1] - r[0], px); for (v = M.ceil(r[0] / st - 1e-9) * st; v <= r[1] + st * 1e-6; v += st) out.push(M.abs(v) < st * 1e-9 ? 0 : v); return out;
    }
    C.xticks = function () { var b = C.box(); return ticks(o.x, o.xlog, o.xt, b.x1 - b.x0); };
    C.yticks = function () { var b = C.box(); return ticks(o.y, o.ylog, o.yt, (b.y1 - b.y0) * 1.3); };
    C.draw = function (ctx, q) {
      q = q || {}; var k = pal(), b = C.box();
      ctx.save(); ctx.fillStyle = o.bg || k.bg; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
      if (o.grid !== false) { ctx.strokeStyle = k.grid; ctx.lineWidth = 1; ctx.beginPath(); C.xticks().forEach(function (v) { var x = M.round(C.X(v)) + 0.5; ctx.moveTo(x, b.y0); ctx.lineTo(x, b.y1); }); C.yticks().forEach(function (v) { var y = M.round(C.Y(v)) + 0.5; ctx.moveTo(b.x0, y); ctx.lineTo(b.x1, y); }); ctx.stroke(); }
      ctx.strokeStyle = k.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(b.x0, b.y0); ctx.lineTo(b.x0, b.y1); ctx.lineTo(b.x1, b.y1); ctx.stroke();
      ctx.fillStyle = k.muted; ctx.font = '11px system-ui,sans-serif';
      if (o.xticks !== false) { ctx.textAlign = 'center'; ctx.textBaseline = 'top'; var used = []; C.xticks().forEach(function (v) { var x = C.X(v), s = o.xf ? o.xf(v) : (o.xlog ? '10' + sup(M.round(log10(v))) : fm(v, 6)); var w2 = ctx.measureText(s).width; if (used.some(function (u) { return M.abs(u[0] - x) < (u[1] + w2) / 2 + 4; })) return; ctx.fillText(s, x, b.y1 + 4); used.push([x, w2]); }); }
      if (o.yticks !== false) { ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; C.yticks().forEach(function (v) { var y = C.Y(v); if (y < b.y0 - 2 || y > b.y1 + 2) return; ctx.fillText(o.yf ? o.yf(v) : (o.ylog ? '10' + sup(M.round(log10(v))) : fm(v, 6)), b.x0 - 5, y); }); }
      if (o.xl) { ctx.fillStyle = k.ink; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(o.xl, (b.x0 + b.x1) / 2, c.h - 2); }
      if (o.yl) { ctx.save(); ctx.fillStyle = k.ink; ctx.font = '600 12px system-ui,sans-serif'; ctx.translate(11, (b.y0 + b.y1) / 2); ctx.rotate(-PI / 2); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.yl, 0, 0); ctx.restore(); }
      ctx.restore();
    };
    C.clip = function (ctx) { var b = C.box(); ctx.save(); ctx.beginPath(); ctx.rect(b.x0, b.y0 - 1, b.x1 - b.x0 + 1, b.y1 - b.y0 + 2); ctx.clip(); };
    C.unclip = function (ctx) { ctx.restore(); };
    C.curve = function (ctx, f, a, b2, col, w, dash, n) { var pts = [], N = n || 240; for (var i = 0; i <= N; i++) { var xv = a + (b2 - a) * i / N, yv = f(xv); if (isFinite(yv)) pts.push([C.X(xv), C.Y(yv)]); } C.clip(ctx); line(ctx, pts, col, w || 2.5, dash); C.unclip(ctx); };
    C.path = function (ctx, data, col, w, dash) { C.clip(ctx); line(ctx, data.map(function (p) { return [C.X(p[0]), C.Y(p[1])]; }), col, w || 2.5, dash); C.unclip(ctx); };
    C.inside = function (px, py) { var b = C.box(); return px >= b.x0 && px <= b.x1 && py >= b.y0 && py <= b.y1; };
    return C;
  }

  /* hand(c, list, o): draggable handles in pixel coordinates, with keyboard support.
     list: [{get() -> [px, py], set(px, py, byKey), key(dx, dy) (optional: keyboard step instead of a pixel move), name, off()}]
     o: {change(i), r (hit radius), free(px, py) -> handle id for a drag that starts on empty canvas}. Returns {draw(ctx), cur(), focused()} */
  function hand(c, list, o) {
    o = o || {}; var cur = 0, focus = false, cv = c.cv;
    V.drag(cv, {
      hit: function (px, py) { var best = null, bd = o.r || 24; list.forEach(function (h, i) { if (h.off && h.off()) return; var p = h.get(); if (!p) return; var d = M.hypot(p[0] - px, p[1] - py); if (d < bd) { bd = d; best = i; } }); if (best == null && o.free) return o.free(px, py); return best; },
      start: function (i, px, py) { if (typeof i === 'number') { cur = i; if (list[i].start) list[i].start(); } else if (o.freeStart) o.freeStart(i, px, py); },
      move: function (i, px, py) { if (typeof i !== 'number') { if (o.freeMove) o.freeMove(i, px, py); return; } list[i].set(clamp(px, 0, c.w), clamp(py, 0, c.h), false); if (o.change) o.change(i); },
      end: function (i) { if (typeof i === 'number' && list[i].end) list[i].end(); if (o.end) o.end(i); }
    });
    cv.tabIndex = 0;
    cv.addEventListener('focus', function () { focus = true; if (o.change) o.change(-1); });
    cv.addEventListener('blur', function () { focus = false; if (o.change) o.change(-1); });
    cv.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (o.keys && o.keys(e, cur)) { e.preventDefault(); return; }
      if (d && list.length) { var h = list[cur]; if (h.off && h.off()) return; var mult = e.shiftKey ? 5 : 1; if (h.key) h.key(d[0] * mult, d[1] * mult); else { var p = h.get(); h.set(p[0] + d[0] * 4 * mult, p[1] + d[1] * 4 * mult, true); } if (o.change) o.change(cur); e.preventDefault(); }
      else if ((e.key === 'Enter' || e.key === 'n' || e.key === 'N') && list.length > 1) { var k2 = 0; do { cur = (cur + 1) % list.length; k2++; } while (list[cur].off && list[cur].off() && k2 < list.length); if (o.change) o.change(cur); e.preventDefault(); }
    });
    return {
      draw: function (ctx) { if (!focus || !list.length) return; var h = list[cur]; if (h.off && h.off()) return; var p = h.get(); if (p) focusRing(ctx, p[0], p[1], h.ring || 14); },
      cur: function () { return cur; }, sel: function (i) { cur = i; }, focused: function () { return focus; }
    };
  }
  /* keyNav(cv, o): a focusable canvas with arrow keys / Enter / Space handled by o.key(e) -> true when used, plus a tap
     handler o.tap(px, py). Used by pickers (periodic table cells, levels, peaks). */
  function keyNav(c, o) {
    var focus = false; c.cv.tabIndex = 0;
    c.cv.addEventListener('focus', function () { focus = true; if (o.change) o.change(); });
    c.cv.addEventListener('blur', function () { focus = false; if (o.change) o.change(); });
    c.cv.addEventListener('keydown', function (e) { if (o.key && o.key(e)) e.preventDefault(); });
    if (o.tap) c.cv.addEventListener('click', function (e) { var r = c.cv.getBoundingClientRect(); o.tap(e.clientX - r.left, e.clientY - r.top, e); });
    if (o.hover) { c.cv.addEventListener('pointermove', function (e) { var r = c.cv.getBoundingClientRect(); o.hover(e.clientX - r.left, e.clientY - r.top, e); }); c.cv.addEventListener('pointerleave', function () { o.hover(null, null); }); }
    return { focused: function () { return focus; } };
  }

  /* particle box: positions and velocities in pixels, walls at the box edges, optional hard-disk collisions.
     P = pbox({x0, y0, x1, y1}); P.add({x, y, vx, vy, r, m, ...}); P.step(dt, {collide, onWall(p, side), onHit(a, b, vRel)}) */
  function pbox(b) {
    var P = { b: b, ps: [] };
    P.add = function (p) { p.m = p.m || 1; P.ps.push(p); return p; };
    P.step = function (dt, q) {
      q = q || {}; var ps = P.ps, B = P.b;
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i]; if (p.fixed) continue; p.x += p.vx * dt; p.y += p.vy * dt;
        var r = p.r || 4;
        if (p.x < B.x0 + r) { p.x = B.x0 + r; p.vx = M.abs(p.vx); if (q.onWall) q.onWall(p, 'l'); }
        if (p.x > B.x1 - r) { p.x = B.x1 - r; p.vx = -M.abs(p.vx); if (q.onWall) q.onWall(p, 'r'); }
        if (p.y < B.y0 + r) { p.y = B.y0 + r; p.vy = M.abs(p.vy); if (q.onWall) q.onWall(p, 't'); }
        if (p.y > B.y1 - r) { p.y = B.y1 - r; p.vy = -M.abs(p.vy); if (q.onWall) q.onWall(p, 'b'); }
      }
      if (q.collide) {
        var cell = q.cell || 24, grid = {}, k2;
        for (i = 0; i < ps.length; i++) { k2 = M.floor(ps[i].x / cell) + ',' + M.floor(ps[i].y / cell); (grid[k2] = grid[k2] || []).push(i); }
        for (i = 0; i < ps.length; i++) {
          var a = ps[i], cx = M.floor(a.x / cell), cy = M.floor(a.y / cell);
          for (var gx = cx - 1; gx <= cx + 1; gx++) for (var gy = cy - 1; gy <= cy + 1; gy++) {
            var lst = grid[gx + ',' + gy]; if (!lst) continue;
            for (var j = 0; j < lst.length; j++) {
              var jj = lst[j]; if (jj <= i) continue; var bb = ps[jj], dx = bb.x - a.x, dy = bb.y - a.y, rs = (a.r || 4) + (bb.r || 4), d2 = dx * dx + dy * dy;
              if (d2 >= rs * rs || d2 === 0) continue;
              var d = M.sqrt(d2), nx = dx / d, ny = dy / d, vr = (a.vx - bb.vx) * nx + (a.vy - bb.vy) * ny;
              if (a.fixed && bb.fixed) continue;
              if (vr > 0) { // approaching: elastic bounce along the line of centers
                var res = q.onHit ? q.onHit(a, bb, vr, nx, ny) : null; if (res === 'skip') continue;
                if (a.fixed) { bb.vx += 2 * vr * nx; bb.vy += 2 * vr * ny; }
                else if (bb.fixed) { a.vx -= 2 * vr * nx; a.vy -= 2 * vr * ny; }
                else { var ma = a.m, mb = bb.m, f = 2 * vr / (ma + mb); a.vx -= f * mb * nx; a.vy -= f * mb * ny; bb.vx += f * ma * nx; bb.vy += f * ma * ny; }
              }
              var ov = (rs - d) / 2; if (!a.fixed) { a.x -= nx * ov; a.y -= ny * ov; } if (!bb.fixed) { bb.x += nx * ov; bb.y += ny * ov; }
            }
          }
        }
      }
    };
    return P;
  }
  // a random velocity for a 2-D gas at speed scale s (Maxwell–Boltzmann in 2-D: Gaussian components)
  function vel(r, s) { return [gauss(r) * s, gauss(r) * s]; }
  // scatter n points in a box without much overlap (for still pictures); returns [[x, y]]
  function scatter(r, n, x0, y0, x1, y1, minD) {
    var pts = [], tries = 0; minD = minD || 10;
    while (pts.length < n && tries < n * 300) { tries++; var x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), ok = true; for (var i = 0; i < pts.length; i++) if (M.hypot(pts[i][0] - x, pts[i][1] - y) < minD) { ok = false; break; } if (ok || tries > n * 200) pts.push([x, y]); }
    return pts;
  }
  var QUEUE = []; function R(name, f) { QUEUE.push([name, f]); } // registered at the end of the file, once every table is defined
  var CH = ML.chem = ML.chem || {};

  // =====================================================================================================
  // ch-particles: options are documented at the top of this file
  var MPBP = { // normal melting and boiling points, °C (NIST Chemistry WebBook); CO2 sublimes at 1 atm
    H2O: [0, 100], N2: [-210.0, -195.8], O2: [-218.8, -183.0], NH3: [-77.7, -33.3], CH4: [-182.5, -161.5], Br2: [-7.2, 58.8], I2: [113.7, 184.4], C2H5OH: [-114.1, 78.3], CH3OH: [-97.6, 64.7], CO2: [-78.5, -78.5, true], Ar: [-189.3, -185.8], Cl2: [-101.5, -34.0], Hg: [-38.8, 356.7]
  };
  var NAMEF = { H2O: 'water', CO2: 'carbon dioxide', NaCl: 'sodium chloride', C12H22O11: 'sucrose (table sugar)', C6H12O6: 'glucose', C2H5OH: 'ethanol', CH3OH: 'methanol', NH3: 'ammonia', O2: 'oxygen', N2: 'nitrogen', H2: 'hydrogen', CH4: 'methane', HCl: 'hydrogen chloride', CH3COOH: 'acetic acid', HCOOH: 'formic acid', HF: 'hydrofluoric acid', HCN: 'hydrocyanic acid', HOCl: 'hypochlorous acid', HNO3: 'nitric acid', HBr: 'hydrobromic acid', HI: 'hydroiodic acid', HClO4: 'perchloric acid', NaOH: 'sodium hydroxide', KOH: 'potassium hydroxide', AgCl: 'silver chloride', AgBr: 'silver bromide', AgI: 'silver iodide', BaSO4: 'barium sulfate', PbI2: 'lead(II) iodide', PbCl2: 'lead(II) chloride', CaCO3: 'calcium carbonate', Fe2O3: 'iron(III) oxide', Br2: 'bromine', I2: 'iodine', Cl2: 'chlorine', NO2: 'nitrogen dioxide', N2O4: 'dinitrogen tetroxide', KCl: 'potassium chloride', CaCl2: 'calcium chloride', Ag2CrO4: 'silver chromate', 'Cu(OH)2': 'copper(II) hydroxide', 'Fe(OH)3': 'iron(III) hydroxide', PbSO4: 'lead(II) sulfate', BaCO3: 'barium carbonate', CuS: 'copper(II) sulfide', 'Mg(OH)2': 'magnesium hydroxide', 'Ca3(PO4)2': 'calcium phosphate', Hg: 'mercury', Ar: 'argon' };
  // acids and bases: strength, and Ka or Kb at 25 °C (OpenStax Chemistry 2e, Appendices H and I; acetic acid as on Mixing Lab)
  var ACIDS = {
    HCl: { k: 'sa', ion: ['H3O+', 'Cl-'] }, HBr: { k: 'sa', ion: ['H3O+', 'Br-'] }, HI: { k: 'sa', ion: ['H3O+', 'I-'] }, HNO3: { k: 'sa', ion: ['H3O+', 'NO3-'] }, HClO4: { k: 'sa', ion: ['H3O+', 'ClO4-'] },
    CH3COOH: { k: 'wa', Ka: 1.8e-5, ion: ['H3O+', 'CH3COO-'] }, HCOOH: { k: 'wa', Ka: 1.8e-4, ion: ['H3O+', 'HCOO-'] }, HF: { k: 'wa', ion: ['H3O+', 'F-'] }, HCN: { k: 'wa', Ka: 4.9e-10, ion: ['H3O+', 'CN-'] }, HOCl: { k: 'wa', Ka: 2.9e-8, ion: ['H3O+', 'OCl-'] },
    NaOH: { k: 'sb', ion: ['Na+', 'OH-'] }, KOH: { k: 'sb', ion: ['K+', 'OH-'] }, NH3: { k: 'wb', Kb: 1.8e-5, ion: ['NH4+', 'OH-'] },
    C12H22O11: { k: 'ne' }, C6H12O6: { k: 'ne' }, C2H5OH: { k: 'ne' }, CH3OH: { k: 'ne' }
  };
  // ionic compounds: cation and anion (formula, count); unknown ones are split by ionsOf()
  var POLY = { NO3: -1, SO4: -2, CO3: -2, PO4: -3, OH: -1, CH3COO: -1, ClO4: -1, CrO4: -2, NH4: 1, HCO3: -1, ClO3: -1, MnO4: -1, CN: -1 };
  function ionsOf(f) { // 'Ca(NO3)2' -> [['Ca2+', 1], ['NO3-', 2]]; null when f is not a simple ionic compound
    var s = String(f).replace(/\s/g, ''), m, cat, catN = 1, an, anN = 1, rest;
    if ((m = s.match(/^\(?NH4\)?(\d*)/)) && m[0]) { cat = 'NH4'; catN = m[1] ? +m[1] : 1; rest = s.slice(m[0].length); }
    else if ((m = s.match(/^([A-Z][a-z]?)(\d*)/)) && BYS[m[1]] && BYS[m[1]].kind === 'm') { cat = m[1]; catN = m[2] ? +m[2] : 1; rest = s.slice(m[0].length); }
    else return null;
    if ((m = rest.match(/^\(([A-Za-z0-9]+)\)(\d+)$/))) { an = m[1]; anN = +m[2]; }
    else if (POLY[rest] != null) { an = rest; anN = 1; }
    else if ((m = rest.match(/^([A-Z][a-z]?)(\d*)$/)) && BYS[m[1]]) { an = m[1]; anN = m[2] ? +m[2] : 1; }
    else return null;
    var qa = POLY[an] != null ? POLY[an] : (BYS[an] && BYS[an].ions.length ? BYS[an].ions[BYS[an].ions.length - 1] : null);
    if (qa == null || qa >= 0) return null;
    var qc = -qa * anN / catN; if (qc !== M.round(qc) || qc <= 0) return null;
    function ion(base, q) { return (POLY[base] != null && base.length > 2 ? base : base) + (M.abs(q) === 1 ? '' : '^' + M.abs(q)) + (q > 0 ? '+' : '-'); }
    return [[ion(cat, qc), catN], [ion(an, qa), anN]];
  }
  // solubility rules for ionic compounds in water (OpenStax Chemistry 2e, Table 4.1). true = forms a precipitate
  function insoluble(cat, an) {
    var c = splitCharge(cat)[0], a = splitCharge(an)[0];
    var always = ['Li', 'Na', 'K', 'Rb', 'Cs', 'NH4']; if (always.indexOf(c) >= 0) return false;
    if (['NO3', 'CH3COO', 'ClO4', 'ClO3'].indexOf(a) >= 0) return false;
    if (['Cl', 'Br', 'I'].indexOf(a) >= 0) return ['Ag', 'Pb', 'Hg', 'Cu'].indexOf(c) >= 0 && !(c === 'Cu' && splitCharge(cat)[1] === 2);
    if (a === 'SO4') return ['Ba', 'Pb', 'Sr', 'Hg'].indexOf(c) >= 0;
    if (a === 'OH') return ['Ba', 'Sr'].indexOf(c) < 0;
    if (['CO3', 'PO4', 'S', 'CrO4'].indexOf(a) >= 0) return true;
    return false;
  }
  function saltF(cat, nc, an, na) { // ('Ag+',1,'Cl-',1) -> 'AgCl'
    var c = splitCharge(cat)[0], a = splitCharge(an)[0], g = function (x, n) { return n === 1 ? x : (POLY[x] != null && x.length > 2 ? '(' + x + ')' + n : x + n); };
    return g(c, nc) + g(a, na);
  }
  function gcdI(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }

  R('ch-particles', function (elx, o) {
    o = opt(o, { mode: 'sort', motion: true, seed: 1, labels: true, tally: true, legend: true, names: ['A', 'B', 'C', 'D'], state: null, f: 'H2O', eq: '2H2 + O2 -> 2H2O', sets: 2, solute: 'NaCl', n: 6, water: true, acid: 'HCl', C: 8, M: 0.10, bulb: true, a: { f: 'AgNO3', n: 3 }, b: { f: 'NaCl', n: 3 }, spectators: true, left: 0, right: 8, species: [{ f: 'NO2', n: 6 }, { f: 'N2O4', n: 3 }], regroup: true });
    var mode = o.mode, rnd = rng(num(o.seed, 1) * 7919 + 13), k0 = pal();
    var titles = { sort: 'Particle pictures of matter', state: 'Particles in a solid, a liquid and a gas', react: 'Particles before and after a reaction', dissolve: 'Particles of a solute dissolving in water', ionize: 'Acid particles in water', mix: 'Two solutions poured together', osmosis: 'Osmosis through a membrane', equilibrium: 'Particles at dynamic equilibrium' };
    var F = frame(elx, o, titles[mode] || titles.sort), quiet = F.quiet;
    var boxes = [], S = { t: 0, T: 25, play: false, regroupT: -1, dis: 0, osm: 0, fwd: 0, rev: 0 };
    var tallyEl = o.tally !== false ? F.html('chv-tbl') : null; if (tallyEl) tallyEl.hidden = true;
    var c = F.canvas({ aspect: 2.1, min: 230, max: 420, narrow: 1.0 });

    // ---------- layout ----------
    function nb() { return boxes.length || 1; }
    var lay = {};
    function layout() {
      var n = nb(), per = c.w < 560 && n > 2 ? 2 : n, rows = M.ceil(n / per), gap = 14, top = 22, bot = mode === 'sort' && o.legend !== false ? (c.w < 560 ? 36 : 22) : 8;
      var bw = (c.w - gap * (per + 1)) / per, bh = M.min(bw * (per === 1 ? 0.55 : 0.92), 250);
      if (mode === 'osmosis') bh = M.min(bw * 0.62, 300);
      var H = rows * (bh + top + bot) + 6;
      if (M.abs(H - c.h) > 2) { c.q.height = M.round(H); c.q.min = 100; c.q.fixed = true; c.fit(); }
      boxes.forEach(function (b, i) { var r = M.floor(i / per), cc = i % per, rowN = M.min(per, n - r * per), off = (c.w - (rowN * bw + (rowN - 1) * gap)) / 2; b.x = off + cc * (bw + gap); b.y = r * (bh + top + bot) + top; b.w = bw; b.h = bh; });
      lay.unit = clamp(M.min(bw, bh) / 9.5, 7, 21);
    }
    // ---------- particle placement ----------
    function placeGas(b, items) { var u = lay.unit, mr = u; items.forEach(function (p) { mr = M.max(mr, molR(p.f, u)); }); var pts = scatter(rnd, items.length, b.x + mr + 2, b.y + mr + 2, b.x + b.w - mr - 2, b.y + b.h - mr - 2, mr * 2 + 3); items.forEach(function (p, i) { p.x = pts[i][0]; p.y = pts[i][1]; p.st = 'gas'; var v = vel(rnd, 26); p.vx = v[0]; p.vy = v[1]; p.rot = rnd() * TAU; p.vr = (rnd() - 0.5) * 1.2; }); }
    function placeLattice(b, items, frac, st) { // solid: a lattice at the bottom; liquid: the same density, disordered
      var u = lay.unit, n = items.length; if (!n) return; var d = u * 2.3, cols = M.max(2, M.min(n, M.floor((b.w - 20) / d), M.max(3, M.ceil(M.sqrt(n * 1.8))))), rowsN = M.ceil(n / cols);
      var x0 = b.x + (b.w - (cols - 1) * d) / 2, y0 = b.y + b.h - 12 - u * 1.1;
      items.forEach(function (p, i) { var r = M.floor(i / cols), cc = i % cols, hx = x0 + cc * d + (r % 2 ? d / 2 : 0) * (st === 'solid' ? 0 : 1), hy = y0 - r * d * 0.92; if (st === 'liquid') { hx += (rnd() - 0.5) * d * 0.5; hy += (rnd() - 0.5) * d * 0.3; } p.hx = clamp(hx, b.x + 12, b.x + b.w - 12); p.hy = hy; p.x = p.hx; p.y = p.hy; p.st = st; p.vx = (rnd() - 0.5) * 14; p.vy = (rnd() - 0.5) * 14; p.rot = st === 'solid' ? 0 : rnd() * TAU; p.vr = st === 'solid' ? 0 : (rnd() - 0.5) * 0.8; });
      b.surface = y0 - (rowsN - 1) * d * 0.92 - u * 1.4;
    }
    function items(list) { var out = []; list.forEach(function (s) { for (var i = 0; i < (s.n || 1); i++) out.push({ f: s.f, kind: s.kind }); }); return out; }
    function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = M.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

    // ---------- modes ----------
    var M_ = {};
    M_.sort = function () {
      var spec = o.boxes || [[{ f: 'H2', n: 4 }], [{ f: 'H2O', n: 4 }], [{ f: 'H2', n: 3 }, { f: 'O2', n: 3 }], [{ f: 'H2O', n: 3 }, { f: 'CO2', n: 3 }]];
      boxes = spec.slice(0, 4).map(function (list, i) { return { title: o.names[i] || String.fromCharCode(65 + i), list: list, ps: shuffle(items(list)), st: o.state || 'gas' }; });
    };
    function kindOf(list) {
      var sp = {}; list.forEach(function (s) { if ((s.n || 0) > 0) sp[s.f] = 1; }); var fs = Object.keys(sp), els = 0, cps = 0;
      fs.forEach(function (f) { var p = parseF(f); if (Object.keys(p.atoms).length === 1 && !p.charge) els++; else cps++; });
      if (fs.length === 1) return els ? 'Element' : 'Compound';
      if (fs.length === 2) return els === 2 ? 'Mixture of two elements' : cps === 2 ? 'Mixture of two compounds' : 'Mixture of an element and a compound';
      return els && cps ? 'Mixture of elements and compounds' : els ? 'Mixture of elements' : 'Mixture of compounds';
    }
    M_.state = function () {
      var sts = o.state === 'all' ? ['solid', 'liquid', 'gas'] : [o.state || 'liquid'];
      var nn = o.n > 6 ? o.n : 14;
      boxes = sts.map(function (st, i) { return { title: o.state === 'all' ? st[0].toUpperCase() + st.slice(1) : '', list: [{ f: o.f, n: nn }], ps: items([{ f: o.f, n: nn }]), st: st }; });
      var mp = MPBP[o.f]; if (o.T != null && o.T !== false && mp && o.state !== 'all') S.T = typeof o.T === 'number' ? o.T : 25;
    };
    function stateAt(f, T) { var mp = MPBP[f]; if (!mp) return 'liquid'; if (mp[2]) return T < mp[0] ? 'solid' : 'gas'; return T < mp[0] ? 'solid' : T < mp[1] ? 'liquid' : 'gas'; }
    var RX = null;
    M_.react = function () {
      var eq = parseEq(o.eq); if (!eq) eq = parseEq('2H2 + O2 -> 2H2O'); RX = { eq: eq };
      var before = {}, ext = M.max(0, num(o.sets, 1));
      if (o.amounts) { eq.left.forEach(function (t) { before[t.f] = o.amounts[t.f] || 0; }); ext = 1e9; eq.left.forEach(function (t) { ext = M.min(ext, M.floor(before[t.f] / t.c)); }); }
      else eq.left.forEach(function (t) { before[t.f] = t.c * ext; });
      var after = {}; eq.left.forEach(function (t) { after[t.f] = before[t.f] - t.c * ext; }); eq.right.forEach(function (t) { after[t.f] = (after[t.f] || 0) + t.c * ext; });
      RX.before = before; RX.after = after; RX.ext = ext;
      var lb = Object.keys(before).map(function (f) { return { f: f, n: before[f] }; }), la = Object.keys(after).map(function (f) { return { f: f, n: after[f] }; });
      boxes = [{ title: 'Before', list: lb, ps: shuffle(items(lb)), st: 'gas' }, { title: 'After', list: la, ps: shuffle(items(la)), st: 'gas' }];
    };
    function atomTally(list) { var t = {}; list.forEach(function (s) { var p = parseF(s.f); for (var e in p.atoms) t[e] = (t[e] || 0) + p.atoms[e] * s.n; }); return t; }
    M_.dissolve = function () {
      var sols = Array.isArray(o.solute) ? o.solute.slice(0, 3) : [o.solute];
      boxes = sols.map(function (s) {
        var io = ionsOf(s), ps = [], n = M.max(1, M.min(12, num(o.n, 6)));
        for (var i = 0; i < n; i++) { if (io) io.forEach(function (pair) { for (var j = 0; j < pair[1]; j++) ps.push({ f: pair[0], unit: i, ion: true }); }); else ps.push({ f: s, unit: i }); }
        return { title: fT(s), solute: s, ionic: !!io, ps: ps, st: 'crystal', n: n };
      });
    };
    M_.ionize = function () {
      var list = o.acids ? o.acids.slice(0, 3) : [o.acid];
      boxes = list.map(function (a) {
        var A = ACIDS[a] || { k: 'wa' }, C = M.max(2, M.min(14, num(o.C, 8))), alpha = 0, ni;
        if (A.k === 'sa' || A.k === 'sb') alpha = 1; else if (A.k === 'ne') alpha = 0;
        else { var Kx = A.Ka || A.Kb, Mo = num(o.M, 0.1); alpha = Kx ? (-Kx + M.sqrt(Kx * Kx + 4 * Kx * Mo)) / (2 * Mo) : null; }
        if (o.frac != null) ni = M.round(clamp(num(o.frac, 0), 0, 1) * C); else ni = alpha == null ? 1 : alpha >= 0.999 ? C : alpha === 0 ? 0 : M.max(1, M.round(alpha * C));
        var ps = []; for (var i = 0; i < C; i++) { if (i < ni && A.ion) { ps.push({ f: A.ion[0] }); ps.push({ f: A.ion[1] }); } else ps.push({ f: a }); }
        return { title: fT(a), acid: a, A: A, alpha: alpha, ni: ni, C: C, ps: shuffle(ps), st: 'gas' };
      });
    };
    M_.mix = function () {
      var A = o.a, B = o.b, ia = ionsOf(A.f), ib = ionsOf(B.f);
      function ionList(io, n) { var ps = []; if (!io) return ps; for (var i = 0; i < n; i++) io.forEach(function (pr) { for (var j = 0; j < pr[1]; j++) ps.push({ f: pr[0] }); }); return ps; }
      var pa = ionList(ia, A.n || 3), pb = ionList(ib, B.n || 3);
      // which cation–anion pair (one from each solution) is insoluble?
      var pr = null; if (ia && ib) { if (insoluble(ia[0][0], ib[1][0])) pr = [ia[0][0], ib[1][0]]; else if (insoluble(ib[0][0], ia[1][0])) pr = [ib[0][0], ia[1][0]]; }
      var mixPs = pa.concat(pb).map(function (p) { return { f: p.f }; }), solid = [];
      if (pr) { // form as many formula units as the ions allow
        var qc = parseF(pr[0]).charge, qa = -parseF(pr[1]).charge, g = gcdI(qc, qa), nc = qa / g, na = qc / g;
        var cs = mixPs.filter(function (p) { return p.f === pr[0]; }), as = mixPs.filter(function (p) { return p.f === pr[1]; }), units = M.min(M.floor(cs.length / nc), M.floor(as.length / na));
        for (var u = 0; u < units; u++) { for (var j = 0; j < nc; j++) cs[u * nc + j].solid = true; for (j = 0; j < na; j++) as[u * na + j].solid = true; }
        solid = mixPs.filter(function (p) { return p.solid; });
        RX = { ppt: saltF(pr[0], nc, pr[1], na), cat: pr[0], an: pr[1], nc: nc, na: na, units: units };
      } else RX = { ppt: null };
      mixPs.forEach(function (p) { p.spect = !p.solid; });
      boxes = [{ title: 'Solution 1: ' + fT(A.f), ps: shuffle(pa), st: 'gas', soln: true }, { title: 'Solution 2: ' + fT(B.f), ps: shuffle(pb), st: 'gas', soln: true }, { title: 'Mixed', ps: shuffle(mixPs), st: 'gas', soln: true, mixed: true }];
    };
    M_.osmosis = function () { boxes = [{ title: '', st: 'osm', ps: [] }]; };
    M_.equilibrium = function () {
      var sp = o.species; boxes = [{ title: '', ps: shuffle(items(sp)), st: 'gas' }];
      var a = parseF(sp[0].f), b = parseF(sp[1].f), na = atomCount(a), nb2 = atomCount(b); RX = { a: sp[0].f, b: sp[1].f, ratio: nb2 === 2 * na ? 2 : na === 2 * nb2 ? 0.5 : 1 };
    };
    (M_[mode] || M_.sort)();
    if (!M_[mode]) mode = 'sort';

    // ---------- (re)placing particles ----------
    function setup() {
      layout(); var u = lay.unit;
      boxes.forEach(function (b, bi) {
        if (mode === 'state') { var st = o.state === 'all' ? b.st : (S.T != null && MPBP[o.f] && o.T != null && o.T !== false ? stateAt(o.f, S.T) : b.st); b.st = st; if (st === 'gas') placeGas(b, b.ps); else placeLattice(b, b.ps, 1, st); }
        else if (mode === 'dissolve') setupDissolve(b);
        else if (mode === 'mix') { placeGas(b, b.ps); if (b.mixed) placeSolid(b); }
        else if (mode === 'osmosis') setupOsmosis(b);
        else if (b.st === 'solid' || b.st === 'liquid') placeLattice(b, b.ps, 1, b.st);
        else placeGas(b, b.ps);
        if (mode === 'ionize' || mode === 'mix' || mode === 'dissolve') b.soln = true;
      });
    }
    // the precipitate: its ions packed so they touch, alternating, at the bottom of the mixed solution
    function placeSolid(b) {
      var u = lay.unit, sol = b.ps.filter(function (p) { return p.solid; }); if (!sol.length) return;
      var cats = sol.filter(function (p) { return parseF(p.f).charge > 0; }), ans = sol.filter(function (p) { return parseF(p.f).charge < 0; }), ord = [];
      while (cats.length || ans.length) { if (cats.length) ord.push(cats.shift()); if (ans.length) ord.push(ans.shift()); if (ans.length > cats.length + 1) ord.push(ans.shift()); }
      var d = 0; ord.forEach(function (p) { d = M.max(d, molR(p.f, u)); }); d *= 1.95;
      var cols = M.min(ord.length, M.max(2, M.round(M.sqrt(ord.length * 2)))), rows = M.ceil(ord.length / cols);
      ord.forEach(function (p, i) { var r = M.floor(i / cols), cc = i % cols; p.hx = b.x + b.w / 2 + (cc - (cols - 1) / 2) * d + (r % 2 ? d / 2 : 0) * 0; p.hy = b.y + b.h - 8 - d / 2 - r * d; p.x = p.hx; p.y = p.hy; p.rot = 0; });
      b.solidBox = [b.x + b.w / 2 - cols * d / 2 - 4, b.y + b.h - 8 - rows * d - 4, cols * d + 8, rows * d + 8];
      b.ps.filter(function (p) { return !p.solid; }).forEach(function (p) { p.y = M.min(p.y, b.solidBox[1] - u * 1.5); });
    }
    // dissolving: the solute starts as a crystal (or a clump of molecules) at the bottom; particles leave one at a time
    function setupDissolve(b) {
      var u = lay.unit, ps = b.ps, n = ps.length, cols = M.ceil(M.sqrt(n * 1.6)), d = 0; ps.forEach(function (p) { d = M.max(d, molR(p.f, u)); }); d *= b.ionic ? 1.96 : 2.1;
      var x0 = b.x + b.w / 2 - (cols - 1) * d / 2, y0 = b.y + b.h - 12 - u;
      // order the crystal so that ions alternate (cation, anion) like a lattice
      if (b.ionic) { var cats = ps.filter(function (p) { return parseF(p.f).charge > 0; }), ans = ps.filter(function (p) { return parseF(p.f).charge < 0; }), ord = []; while (cats.length || ans.length) { if (cats.length) ord.push(cats.shift()); if (ans.length) ord.push(ans.shift()); if (ans.length && ord.length % 3 === 2 && cats.length < ans.length) ord.push(ans.shift()); } b.ps = ps = ord; }
      ps.forEach(function (p, i) { var r = M.floor(i / cols), cc = i % cols; p.hx = x0 + cc * d; p.hy = y0 - r * d; p.x = p.hx; p.y = p.hy; p.st = 'xtal'; p.rot = 0; p.vr = 0; p.out = false; p.order = i; });
      // the next particle to leave is from the top layer
      b.queue = ps.slice().sort(function (a, c2) { return a.hy - c2.hy || a.order - c2.order; });
      b.water = []; if (o.water !== false) { var nw = M.round(b.w * b.h / 1500); for (var i = 0; i < nw; i++) { var v = vel(rnd, 18); b.water.push({ f: 'H2O', x: b.x + 10 + rnd() * (b.w - 20), y: b.y + 10 + rnd() * (b.h - 30), vx: v[0], vy: v[1], rot: rnd() * TAU, vr: (rnd() - 0.5) * 2 }); } }
      b.left = 0;
    }
    function releaseOne(b) {
      var p = b.queue.shift(); if (!p) return false; p.out = true; p.st = 'gas'; var v = vel(rnd, 20); p.vx = v[0]; p.vy = -M.abs(v[1]) - 10; p.rot = rnd() * TAU; p.vr = (rnd() - 0.5) * 0.6; b.left++;
      if (b.ionic && o.water !== false) { // a hydration shell: water molecules with O toward a cation and H toward an anion
        var q = parseF(p.f).charge, nshell = 4; p.shell = [];
        for (var i = 0; i < nshell; i++) { var ang = i * TAU / nshell + rnd() * 0.4; p.shell.push({ ang: ang, rotOff: q > 0 ? PI / 2 : -PI / 2 }); }
      }
      return true;
    }
    function setupOsmosis(b) {
      var u = lay.unit, mid = b.x + b.w / 2; b.ps = []; b.water = [];
      b.lvl = [b.y + b.h * 0.42, b.y + b.h * 0.42]; b.d0 = b.lvl[0];
      var nl = M.max(0, M.min(14, num(o.left, 0))), nr = M.max(0, M.min(14, num(o.right, 8)));
      function addSol(n, side) { for (var i = 0; i < n; i++) b.ps.push({ f: 'C12H22O11', side: side, x: side ? mid + 16 + rnd() * (b.w / 2 - 32) : b.x + 16 + rnd() * (b.w / 2 - 32), y: b.lvl[side] + 30 + rnd() * (b.y + b.h - b.lvl[side] - 50), vx: (rnd() - 0.5) * 10, vy: (rnd() - 0.5) * 10, rot: rnd() * TAU, vr: 0 }); }
      addSol(nl, 0); addSol(nr, 1); b.nl = nl; b.nr = nr;
      var nw = M.round(b.w * b.h / 700); for (var i = 0; i < nw; i++) { var side = i % 2, v = vel(rnd, 30); b.water.push({ side: side, x: side ? mid + 6 + rnd() * (b.w / 2 - 12) : b.x + 6 + rnd() * (b.w / 2 - 12), y: b.y + b.h * 0.45 + rnd() * b.h * 0.5, vx: v[0], vy: v[1] }); }
      b.cross = [0, 0];
    }

    // ---------- motion ----------
    function move(b, dt) {
      var u = lay.unit, temp = mode === 'state' && S.T != null ? M.sqrt((S.T + 273.15) / 298) : 1;
      b.ps.forEach(function (p) {
        if (p.st === 'xtal' && !p.out) return;
        if (p.st === 'gas' || (mode === 'dissolve' && p.out)) {
          var sp = (mode === 'dissolve' || b.soln ? 0.35 : 1) * temp, top = mode === 'dissolve' ? b.y + 10 : b.y;
          if (p.solid) { p.x += (p.hx - p.x) * M.min(1, dt * 3); p.y += (p.hy - p.y) * M.min(1, dt * 3); return; }
          if (b.soln || mode === 'dissolve') { p.vx += gauss(rnd) * 40 * dt; p.vy += gauss(rnd) * 40 * dt; var vv = M.hypot(p.vx, p.vy), cap = 26 * sp + 8; if (vv > cap) { p.vx *= cap / vv; p.vy *= cap / vv; } }
          p.x += p.vx * dt * sp * (b.soln || mode === 'dissolve' ? 2.4 : 1); p.y += p.vy * dt * sp * (b.soln || mode === 'dissolve' ? 2.4 : 1); p.rot += p.vr * dt;
          var r = molR(p.f, u) + 3, x0 = b.x + r, x1 = b.x + b.w - r, y0 = top + r, y1 = (b.solidBox ? b.solidBox[1] - 4 : b.y + b.h) - r;
          if (p.x < x0) { p.x = x0; p.vx = M.abs(p.vx); } if (p.x > x1) { p.x = x1; p.vx = -M.abs(p.vx); } if (p.y < y0) { p.y = y0; p.vy = M.abs(p.vy); } if (p.y > y1) { p.y = y1; p.vy = -M.abs(p.vy); }
        } else if (p.st === 'liquid') { // slide past neighbors: a random walk around a slowly drifting home
          p.hx += gauss(rnd) * 9 * dt * temp; p.hy += gauss(rnd) * 4 * dt * temp; p.hx = clamp(p.hx, b.x + 12, b.x + b.w - 12); p.hy = clamp(p.hy, (b.surface || b.y) + 6, b.y + b.h - 10);
          p.x += (p.hx - p.x) * M.min(1, dt * 4) + gauss(rnd) * 0.6 * temp; p.y += (p.hy - p.y) * M.min(1, dt * 4) + gauss(rnd) * 0.6 * temp; p.rot += p.vr * dt * temp;
        } else if (p.st === 'solid') { p.x = p.hx + M.sin(S.t * 9 + p.hy) * 1.2 * temp; p.y = p.hy + M.cos(S.t * 11 + p.hx) * 1.2 * temp; }
      });
      if (b.water) b.water.forEach(function (w) { w.x += w.vx * dt * 0.8; w.y += w.vy * dt * 0.8; w.rot = (w.rot || 0) + (w.vr || 0) * dt; w.vx += gauss(rnd) * 30 * dt; w.vy += gauss(rnd) * 30 * dt; var x0 = b.x + 6, x1 = b.x + b.w - 6, y0 = (b.lvl ? b.lvl[w.side || 0] : b.y) + 6, y1 = b.y + b.h - 6; if (b.lvl) { var mid = b.x + b.w / 2; if (w.side) x0 = mid + 5; else x1 = mid - 5; } if (w.x < x0) { w.x = x0; w.vx = M.abs(w.vx); } if (w.x > x1) { w.x = x1; w.vx = -M.abs(w.vx); } if (w.y < y0) { w.y = y0; w.vy = M.abs(w.vy); } if (w.y > y1) { w.y = y1; w.vy = -M.abs(w.vy); } var v = M.hypot(w.vx, w.vy); if (v > 40) { w.vx *= 40 / v; w.vy *= 40 / v; } });
    }
    // osmosis: water crosses the membrane both ways; on the solution side some of the membrane is blocked by solute,
    // so fewer water molecules cross from that side and the level there rises (until the extra weight of liquid pushes back)
    function osmStep(b, dt) {
      var mid = b.x + b.w / 2, conc = [b.nl, b.nr], target = (b.nr - b.nl) * b.h * 0.018;
      var diff = (b.lvl[0] - b.lvl[1]); // > 0 when the right side is higher
      var rate = (target - diff) * 0.35 * dt; b.lvl[0] += rate / 2; b.lvl[1] -= rate / 2; S.osm = diff;
      b.water.forEach(function (w) { // random crossings for the picture
        var near = M.abs(w.x - mid) < 7; if (!near || rnd() > dt * 6) return;
        var from = w.side, pass = rnd() < (1 - conc[from] * 0.045); if (!pass) return;
        w.side = 1 - from; w.x = w.side ? mid + 7 : mid - 7; w.vx = w.side ? M.abs(w.vx) : -M.abs(w.vx); b.cross[from]++;
      });
      b.ps.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx += gauss(rnd) * 16 * dt; p.vy += gauss(rnd) * 16 * dt; var x0 = p.side ? mid + 16 : b.x + 16, x1 = p.side ? b.x + b.w - 16 : mid - 16, y0 = b.lvl[p.side] + 18, y1 = b.y + b.h - 16; if (p.x < x0) { p.x = x0; p.vx = M.abs(p.vx); } if (p.x > x1) { p.x = x1; p.vx = -M.abs(p.vx); } if (p.y < y0) { p.y = y0; p.vy = M.abs(p.vy); } if (p.y > y1) { p.y = y1; p.vy = -M.abs(p.vy); } });
    }
    // dynamic equilibrium: now and then two NO2 join while one N2O4 splits, so the counts never change
    var flashes = [];
    function eqStep(b, dt) {
      if (rnd() > dt * 1.4) return;
      var A = b.ps.filter(function (p) { return p.f === RX.a && !p.gone; }), B = b.ps.filter(function (p) { return p.f === RX.b && !p.gone; });
      if (RX.ratio === 2 && A.length >= 2 && B.length >= 1) {
        var a1 = A[M.floor(rnd() * A.length)], a2 = A.filter(function (q) { return q !== a1; }).sort(function (p, q) { return M.hypot(p.x - a1.x, p.y - a1.y) - M.hypot(q.x - a1.x, q.y - a1.y); })[0], b1 = B[M.floor(rnd() * B.length)];
        a1.f = RX.b; a1.x = (a1.x + a2.x) / 2; a1.y = (a1.y + a2.y) / 2; a2.f = RX.a; a2.x = b1.x + 10; a2.y = b1.y; b1.f = RX.a; b1.x -= 10; flashes.push({ x: a1.x, y: a1.y, t: 0, c: 'fwd' }, { x: b1.x + 5, y: b1.y, t: 0, c: 'rev' });
      } else if (RX.ratio === 1 && A.length && B.length) { var p1 = A[M.floor(rnd() * A.length)], q1 = B[M.floor(rnd() * B.length)]; p1.f = RX.b; q1.f = RX.a; flashes.push({ x: p1.x, y: p1.y, t: 0, c: 'fwd' }, { x: q1.x, y: q1.y, t: 0, c: 'rev' }); }
      else return;
      S.fwd++; S.rev++;
    }
    function step(dt) {
      S.t += dt;
      boxes.forEach(function (b) {
        if (mode === 'osmosis') osmStep(b, dt); else move(b, dt);
        if (mode === 'equilibrium') eqStep(b, dt);
        if (mode === 'dissolve' && S.disAuto) { b.acc = (b.acc || 0) + dt; if (b.acc > 0.7) { b.acc = 0; releaseOne(b); } }
      });
      flashes.forEach(function (f) { f.t += dt; }); flashes = flashes.filter(function (f) { return f.t < 0.8; });
      if (S.regroupT >= 0) { S.regroupT += dt; if (S.regroupT > 2.2) S.regroupT = -1; }
      draw();
    }

    // ---------- drawing ----------
    function drawBox(b, bi) {
      var ctx = c.ctx, k = pal(), u = lay.unit;
      if (b.title) txt(ctx, b.title, b.x + 2, b.y - 11, { size: 12, bold: true, color: k.ink });
      ctx.save(); rr(ctx, b.x, b.y, b.w, b.h, 8); ctx.fillStyle = b.soln || mode === 'dissolve' ? k.water : k.lab; ctx.fill(); ctx.strokeStyle = b.soln || mode === 'dissolve' ? k.waterLine : k.labLine; ctx.lineWidth = 1.5; ctx.stroke(); ctx.clip();
      if (b.water) b.water.forEach(function (w) { drawMol(ctx, 'H2O', w.x, w.y, u * 0.55, { rot: w.rot || 0, alpha: 0.42 }); });
      if (mode === 'state' && b.st === 'liquid' && b.surface) { ctx.fillStyle = k.water; ctx.fillRect(b.x, b.surface, b.w, b.y + b.h - b.surface); }
      if (b.solidBox) { ctx.fillStyle = k.dark ? 'rgba(220,210,190,.12)' : 'rgba(120,100,70,.10)'; rr(ctx, b.solidBox[0], b.solidBox[1], b.solidBox[2], b.solidBox[3], 6); ctx.fill(); }
      b.ps.forEach(function (p) {
        if (mode === 'dissolve' && p.out && p.shell) p.shell.forEach(function (s, i) { var a = s.ang + S.t * 0.4, rr2 = molR(p.f, u) + u * 0.95; drawMol(ctx, 'H2O', p.x + M.cos(a) * rr2, p.y + M.sin(a) * rr2, u * 0.55, { rot: a + s.rotOff, alpha: 0.95 }); });
        var ring = (mode === 'mix' && b.mixed && o.spectators && p.spect && S.showSpect) ? k.gold : null;
        drawMol(ctx, p.f, p.x, p.y, u, { rot: p.rot || 0, ring: ring, labels: o.atoms });
      });
      flashes.forEach(function (f) { ctx.save(); ctx.globalAlpha = 1 - f.t / 0.8; ctx.strokeStyle = f.c === 'fwd' ? k.gold : k.acc; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(f.x, f.y, u * 1.5 + f.t * 20, 0, TAU); ctx.stroke(); ctx.restore(); });
      ctx.restore();
      if (b.solidBox && !quiet && RX && RX.ppt) txt(ctx, 'solid ' + fT(RX.ppt), b.solidBox[0] + b.solidBox[2] / 2, b.solidBox[1] - 9, { size: 11, align: 'center', bold: true, color: k.ink });
      if (mode === 'sort' && o.legend !== false && !quiet) { var kn = kindOf(b.list), kl = [kn]; if (tw(ctx, kn, 12, true) > b.w + 6) { var mid = kn.length / 2, sp = -1; for (var q = 0; q < kn.length; q++) if (kn[q] === ' ' && (sp < 0 || M.abs(q - mid) < M.abs(sp - mid))) sp = q; if (sp > 0) kl = [kn.slice(0, sp), kn.slice(sp + 1)]; } kl.forEach(function (ln, li) { txt(ctx, ln, b.x + b.w / 2, b.y + b.h + 12 + li * 14, { size: 12, align: 'center', color: k.acc, bold: true }); }); }
      if (mode === 'state' && !quiet && o.state !== 'all') pill(ctx, (S.T != null && o.T != null && o.T !== false ? fm(S.T, 0) + ' °C · ' : '') + b.st, b.x + b.w - 8, b.y + 14, { align: 'right', size: 12 });
      if (mode === 'ionize' && o.bulb !== false) drawBulb(ctx, b);
      if (mode === 'osmosis') drawOsm(ctx, b);
    }
    function drawBulb(ctx, b) { // a conductivity tester: brighter with more ions in solution
      var k = pal(), ions = b.ps.filter(function (p) { return parseF(p.f).charge; }).length, f = clamp(ions / (b.C * 2), 0, 1), x = b.x + b.w - 18, y = b.y + 18;
      ctx.save(); if (f > 0) { var g = ctx.createRadialGradient(x, y, 2, x, y, 22); g.addColorStop(0, 'rgba(255,214,90,' + (0.25 + 0.75 * f) + ')'); g.addColorStop(1, 'rgba(255,214,90,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill(); }
      ctx.fillStyle = f > 0 ? 'rgba(255,224,120,' + (0.35 + 0.65 * f) + ')' : (k.dark ? '#3a4740' : '#e6ece8'); ctx.strokeStyle = k.muted; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = k.muted; ctx.fillRect(x - 4, y + 8, 8, 5); ctx.restore();
    }
    function drawOsm(ctx, b) {
      var k = pal(), mid = b.x + b.w / 2, u = lay.unit;
      ctx.save(); rr(ctx, b.x, b.y, b.w, b.h, 8); ctx.clip();
      ctx.fillStyle = k.lab; ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = k.water; ctx.fillRect(b.x, b.lvl[0], b.w / 2, b.y + b.h - b.lvl[0]); ctx.fillRect(mid, b.lvl[1], b.w / 2, b.y + b.h - b.lvl[1]);
      ctx.strokeStyle = k.waterLine; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x, b.lvl[0]); ctx.lineTo(mid, b.lvl[0]); ctx.moveTo(mid, b.lvl[1]); ctx.lineTo(b.x + b.w, b.lvl[1]); ctx.stroke();
      b.water.forEach(function (w) { ctx.fillStyle = k.dark ? 'rgba(140,200,255,.75)' : 'rgba(30,110,200,.55)'; ctx.beginPath(); ctx.arc(w.x, w.y, 2.6, 0, TAU); ctx.fill(); });
      b.ps.forEach(function (p) { drawMol(ctx, p.f, p.x, p.y, u * 0.75, { rot: p.rot }); });
      ctx.strokeStyle = k.gold; ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(mid, b.y); ctx.lineTo(mid, b.y + b.h); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      ctx.save(); rr(ctx, b.x, b.y, b.w, b.h, 8); ctx.strokeStyle = k.labLine; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
      txt(ctx, 'membrane: water passes, sugar does not', mid, b.y - 10, { size: 11, align: 'center', color: k.gold, bold: true });
      txt(ctx, b.nl ? b.nl + ' sugar' : 'pure water', b.x + b.w / 4, b.y + 13, { size: 11, align: 'center', color: k.ink, bold: true }); txt(ctx, b.nr ? b.nr + ' sugar' : 'pure water', b.x + b.w * 0.75, b.y + 13, { size: 11, align: 'center', color: k.ink, bold: true });
      var d = b.lvl[0] - b.lvl[1]; if (M.abs(d) > 3) { var hi = d > 0 ? 1 : 0, x = hi ? b.x + b.w - 14 : b.x + 14; arrow(ctx, x, M.max(b.lvl[0], b.lvl[1]), x, M.min(b.lvl[0], b.lvl[1]) + 1, k.acc, 2.5, 7); }
      arrow(ctx, mid - 22, b.y + b.h * 0.7, mid + 22 * (b.nr >= b.nl ? 1 : -1) * (b.nr === b.nl ? 0 : 1) + (b.nr === b.nl ? -22 : 0), b.y + b.h * 0.7, k.blue, 3, 9);
    }
    function regroupDraw() { // after-box atoms flying from the reactant arrangement to the products
      var b0 = boxes[0], b1 = boxes[1], ctx = c.ctx, u = lay.unit, t = clamp(S.regroupT / 1.6, 0, 1), e = t * t * (3 - 2 * t);
      if (!b1.from) return;
      ctx.save(); rr(ctx, b1.x, b1.y, b1.w, b1.h, 8); ctx.fillStyle = pal().lab; ctx.fill(); ctx.clip();
      b1.from.forEach(function (a, i) { var to = b1.to[i]; if (!to) return; ball(ctx, lerp(a.x, to.x, e), lerp(a.y, to.y, e), aR(a.s, u * 0.42), a.s, {}); });
      ctx.restore();
    }
    function atomsOf(b, dx) { var out = [], u = lay.unit; b.ps.forEach(function (p) { var sp = sprite(p.f), cr = M.cos(p.rot || 0), sr = M.sin(p.rot || 0); sp.atoms.forEach(function (a) { out.push({ s: a.s, x: p.x + dx + (a.x * cr - a.y * sr) * (sp.atoms.length === 1 ? 0 : u), y: p.y + (a.x * sr + a.y * cr) * (sp.atoms.length === 1 ? 0 : u) }); }); }); return out; }
    function startRegroup() {
      var b0 = boxes[0], b1 = boxes[1], from = atomsOf(b0, b1.x - b0.x), to = atomsOf(b1, 0), used = {};
      b1.from = from; b1.to = from.map(function (a) { for (var j = 0; j < to.length; j++) if (!used[j] && to[j].s === a.s) { used[j] = 1; return to[j]; } return null; });
      S.regroupT = 0; if (!A.running()) { A.play(); S.stopAfter = true; }
    }
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      boxes.forEach(drawBox);
      if (mode === 'react' && S.regroupT >= 0) regroupDraw();
      if (mode === 'react' && boxes.length === 2 && boxes[1].x > boxes[0].x) { var b0 = boxes[0], b1 = boxes[1]; arrow(ctx, b0.x + b0.w + 2, b0.y + b0.h / 2, b1.x - 2, b1.y + b0.h / 2, k.muted, 2, 7); }
      if (S.stopAfter && S.regroupT < 0 && (V.reduced || o.motion === false)) { S.stopAfter = false; A.stop(); }
    }

    // ---------- readout and tally ----------
    function tbl(head, rows) { return '<table><thead><tr>' + head.map(function (h) { return '<th scope="col">' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr' + (r.cls ? ' class="' + r.cls + '"' : '') + '>' + r.map(function (x) { return '<td' + (x && x.c ? ' class="' + x.c + '"' : '') + '>' + (x && x.h != null ? x.h : x) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>'; }
    function report() {
      var s = '', alt = '';
      if (mode === 'sort') {
        s = boxes.map(function (b) { return '<b>' + b.title + '</b>: ' + b.list.map(function (x) { return x.n + ' ' + fH(x.f); }).join(' + ') + (quiet ? '' : ' (' + kindOf(b.list).toLowerCase() + ')'); }).join(' · ');
        alt = 'Boxes of particles: ' + boxes.map(function (b) { return b.title + ' holds ' + b.list.map(function (x) { return x.n + ' ' + fT(x.f); }).join(' and '); }).join('; ') + '.';
      } else if (mode === 'state') {
        var b = boxes[0], st = b.st;
        s = o.state === 'all' ? 'The same ' + fH(o.f) + ' molecules in each box. They never change size or shape; only their spacing and motion change.' : (quiet ? 'The particles of ' + fH(o.f) + '.' : (S.T != null && o.T != null && o.T !== false ? 'At ' + fm(S.T, 0) + ' °C, ' : '') + fH(o.f) + ' is a <b>' + st + '</b>: ' + (st === 'solid' ? 'the molecules vibrate in fixed places.' : st === 'liquid' ? 'the molecules touch but slide past one another.' : 'the molecules fly far apart and fill the box.')) + ' Each molecule stays whole and keeps its size.';
        alt = 'Particles of ' + fT(o.f) + (quiet ? '.' : ' as a ' + st + '.');
      } else if (mode === 'react') {
        var tb = atomTally(Object.keys(RX.before).map(function (f) { return { f: f, n: RX.before[f] }; })), ta = atomTally(Object.keys(RX.after).map(function (f) { return { f: f, n: RX.after[f] }; })), ok = true;
        Object.keys(tb).forEach(function (e) { if (tb[e] !== ta[e]) ok = false; });
        s = eqH(RX.eq) + ' · ran ' + RX.ext + ' time' + (RX.ext === 1 ? '' : 's') + '. ' + (quiet ? 'Count the atoms in each box.' : (ok ? '<span class="chv-ok">Every atom is still there</span>: atoms regroup into new molecules; none appear or vanish.' : 'The atom counts differ: check the equation.'));
        if (tallyEl) { tallyEl.hidden = false; tallyEl.innerHTML = tbl(['Atoms', 'Before', 'After', ''], Object.keys(tb).map(function (e) { return [fH(e), quiet ? '?' : tb[e], quiet ? '?' : ta[e], quiet ? '' : { h: tb[e] === ta[e] ? '✓' : '✗', c: tb[e] === ta[e] ? 'ok' : 'no' }]; })) + '<p class="chv-note" style="margin:.3rem .5rem">Molecules before: ' + Object.keys(RX.before).map(function (f) { return RX.before[f] + ' ' + fH(f); }).join(', ') + ' · after: ' + Object.keys(RX.after).filter(function (f) { return RX.after[f] > 0; }).map(function (f) { return RX.after[f] + ' ' + fH(f); }).join(', ') + '</p>'; }
        alt = 'Before: ' + Object.keys(RX.before).map(function (f) { return RX.before[f] + ' ' + fT(f); }).join(', ') + '. After: ' + Object.keys(RX.after).filter(function (f) { return RX.after[f] > 0; }).map(function (f) { return RX.after[f] + ' ' + fT(f); }).join(', ') + '.';
      } else if (mode === 'dissolve') {
        s = boxes.map(function (b) { var io = ionsOf(b.solute); return '<b>' + fH(b.solute) + '</b>: ' + (b.ionic ? b.left + ' of ' + b.ps.length + ' ions in solution. Each formula unit gives ' + io.map(function (pr) { return pr[1] + ' ' + fH(pr[0]); }).join(' + ') + '.' : b.left + ' of ' + b.n + ' molecules in solution, each one whole.'); }).join('<br>') + ' Nothing disappears: the particles spread out among the water molecules.';
        alt = boxes.map(function (b) { return fT(b.solute) + (b.ionic ? ' splits into ions surrounded by water' : ' molecules spread out and stay whole'); }).join('; ') + '.';
        if (tallyEl) { tallyEl.hidden = false; tallyEl.innerHTML = tbl(['Solute', 'In the solid', 'In solution'], boxes.map(function (b) { var n = b.ps.length; return [fH(b.solute), n - b.left, b.left]; })); }
      } else if (mode === 'ionize') {
        s = boxes.map(function (b) {
          var A2 = b.A, kind = { sa: 'strong acid', wa: 'weak acid', sb: 'strong base', wb: 'weak base', ne: 'nonelectrolyte' }[A2.k];
          var pct = b.alpha == null ? '' : ' (' + (b.alpha >= 0.999 ? '100' : sf(b.alpha * 100, 2)) + '% ionized at ' + fm(num(o.M, 0.1), 3) + ' M)';
          return '<b>' + fH(b.acid) + '</b>: ' + (quiet ? b.ps.length + ' particles' : kind + pct + '. Drawn: ' + b.ni + ' of ' + b.C + ' ionized' + (A2.k === 'wa' || A2.k === 'wb' ? ' (a weak acid or base ionizes only a little; the picture exaggerates it so you can see it).' : '.'));
        }).join('<br>');
        alt = boxes.map(function (b) { return fT(b.acid) + ': ' + b.ni + ' of ' + b.C + ' molecules ionized'; }).join('; ') + '.';
      } else if (mode === 'mix') {
        var mb = boxes[2], spec = mb.ps.filter(function (p) { return !p.solid; }), names = {}; spec.forEach(function (p) { names[p.f] = 1; });
        s = RX.ppt ? (quiet ? 'A solid forms when the two solutions mix. The ions left floating are spectator ions.' : 'A precipitate of <b>' + fH(RX.ppt) + '</b> forms: ' + (RX.nc === 1 ? '' : RX.nc) + fH(RX.cat) + '(aq) + ' + (RX.na === 1 ? '' : RX.na) + fH(RX.an) + '(aq) → ' + fH(RX.ppt) + '(s). Spectator ions: ' + Object.keys(names).map(fH).join(', ') + '.') : 'No precipitate: every cation–anion pair stays dissolved.';
        alt = 'Two solutions mixed. ' + (RX.ppt && !quiet ? fT(RX.ppt) + ' settles as a solid; the other ions stay dissolved.' : '');
        if (tallyEl) { var cnt = {}; mb.ps.forEach(function (p) { var key = p.f + (p.solid ? '|s' : '|aq'); cnt[key] = (cnt[key] || 0) + 1; }); tallyEl.hidden = false; tallyEl.innerHTML = tbl(['Ion', 'Dissolved', 'In the solid'], Object.keys(names).concat(RX.ppt ? [RX.cat, RX.an] : []).filter(function (f, i, a) { return a.indexOf(f) === i; }).map(function (f) { return [fH(f), cnt[f + '|aq'] || 0, quiet && RX.ppt ? '?' : (cnt[f + '|s'] || 0)]; })); }
      } else if (mode === 'osmosis') {
        var b2 = boxes[0]; s = 'Water molecules cross the membrane both ways' + (b2.nr !== b2.nl ? ', but more of them move into the side with ' + (b2.nr > b2.nl ? 'more' : 'more') + ' dissolved sugar, so its level rises' : ', and with equal amounts of sugar the levels stay level') + '. The sugar molecules are too big to pass.';
        alt = 'Two compartments split by a membrane. ' + (b2.nl ? b2.nl + ' sugar molecules' : 'Pure water') + ' on the left, ' + b2.nr + ' sugar molecules on the right.';
      } else if (mode === 'equilibrium') {
        var cnt2 = {}; boxes[0].ps.forEach(function (p) { cnt2[p.f] = (cnt2[p.f] || 0) + 1; });
        s = 'Counts: ' + Object.keys(cnt2).map(function (f) { return '<b>' + cnt2[f] + '</b> ' + fH(f); }).join(' · ') + '. Reactions keep happening in both directions (' + S.fwd + ' forward, ' + S.rev + ' reverse so far), at the same rate, so the counts stay the same.';
        alt = 'A box at dynamic equilibrium: molecules keep reacting both ways while the counts stay steady.';
      }
      F.say(s); F.setAlt(alt || F.el.getAttribute('aria-label'));
    }

    // ---------- controls ----------
    var A = anim(elx, step, o.motion !== false);
    if (F.edit) {
      if (mode === 'state' && o.state !== 'all' && o.T != null && o.T !== false && MPBP[o.f]) {
        var mp = MPBP[o.f], lo = M.floor((mp[0] - 40) / 10) * 10, hi = M.ceil(((mp[2] ? mp[0] : mp[1]) + 40) / 10) * 10;
        sl(F.ctl, { label: 'Temperature (°C)', min: lo, max: hi, step: 1, value: clamp(S.T, lo, hi), fmt: function (v) { return fm(v, 0) + ' °C'; }, input: function (v) { var was = stateAt(o.f, S.T); S.T = v; var now = stateAt(o.f, v); if (now !== was) { var b = boxes[0]; b.st = now; if (now === 'gas') placeGas(b, b.ps); else placeLattice(b, b.ps, 1, now); } report(); draw(); } });
        S.T = clamp(S.T, lo, hi);
      }
      if (mode === 'react' && o.regroup !== false) btn(F.ctl, 'Watch the atoms regroup', startRegroup, 'pri');
      if (mode === 'dissolve') { btn(F.ctl, 'Dissolve one more', function () { boxes.forEach(releaseOne); report(); draw(); }, 'pri'); var auto = btn(F.ctl, '▶ Keep dissolving', function () { S.disAuto = !S.disAuto; auto.textContent = S.disAuto ? '❚❚ Stop dissolving' : '▶ Keep dissolving'; auto.setAttribute('aria-pressed', String(!!S.disAuto)); if (S.disAuto && !A.running()) { A.play(); pb.sync(); } }); btn(F.ctl, 'Start again', function () { S.disAuto = false; auto.textContent = '▶ Keep dissolving'; setup(); report(); draw(); }); }
      if (mode === 'mix' && o.spectators) { S.showSpect = false; check(F.ctl, 'Ring the spectator ions', false, function (v) { S.showSpect = v; draw(); }); }
      if (mode === 'osmosis' || mode === 'equilibrium' || mode === 'dissolve' || o.motion !== false) var pb = playBtn(F.ctl, A);
      if (mode === 'osmosis') btn(F.ctl, 'Start again', function () { setup(); report(); draw(); });
    }
    if (V.reduced && mode === 'osmosis') { // show the end state: the level difference already grown
      setup(); var b0 = boxes[0], tgt = (b0.nr - b0.nl) * b0.h * 0.018; b0.lvl[0] += tgt / 2; b0.lvl[1] -= tgt / 2;
    } else setup();
    if (mode === 'dissolve' && (V.reduced || o.motion === false)) boxes.forEach(function (b) { var n = M.ceil(b.ps.length / 2); for (var i = 0; i < n; i++) releaseOne(b); });
    c.onResize(function () { setup(); report(); draw(); }); V.onTheme(draw);
    report(); draw();
    // the counts readout in equilibrium mode updates now and then
    if (mode === 'equilibrium') { var lastF = -1; V.loop(elx, function () { if (S.fwd !== lastF) { lastF = S.fwd; report(); } }); }
    if (mode === 'dissolve') { var lastL = -1; V.loop(elx, function () { var L = boxes.reduce(function (a, b) { return a + b.left; }, 0); if (L !== lastL) { lastL = L; report(); } }); }
    return { draw: draw };
  });
  CH.ionsOf = ionsOf; CH.insoluble = insoluble; CH.ACIDS = ACIDS;

  // =====================================================================================================
  // ch-atom: options are documented at the top of this file
  R('ch-atom', function (elx, o) {
    o = opt(o, { mode: 'build', p: 6, n: 6, e: null, view: 'shells', show: ['symbol', 'name', 'charge', 'mass', 'shells'], highlight: null, motion: true, thomson: true });
    var mode = o.mode, F = frame(elx, o, mode === 'goldfoil' ? 'The gold foil experiment' : mode === 'models' ? 'Models of the atom, from Dalton to Bohr' : 'An atom: protons, neutrons and electrons'), quiet = F.quiet;
    if (mode === 'goldfoil') return goldfoil(F, o);
    if (mode === 'models') return models(F, o);
    var S = { p: clamp(M.round(num(o.p, 6)), 0, 118), n: clamp(M.round(num(o.n, 6)), 0, 180), e: 0, view: o.view, t: 0 };
    S.e = clamp(M.round(num(o.e, S.p)), 0, 120);
    var show = {}; (o.show || []).forEach(function (x) { show[x] = true; });
    var c = F.canvas({ aspect: 1.75, min: 300, max: 440, narrow: 0.78 }), rnd = rng(5);
    var nuc = []; // nucleon positions (golden-angle packing), recomputed when counts change
    function pack() {
      var A = S.p + S.n, GA = PI * (3 - M.sqrt(5)), list = [], r2 = rng(S.p * 131 + S.n * 7 + 1);
      var kinds = []; for (var i = 0; i < S.p; i++) kinds.push('p'); for (i = 0; i < S.n; i++) kinds.push('n');
      for (i = kinds.length - 1; i > 0; i--) { var j = M.floor(r2() * (i + 1)), t = kinds[i]; kinds[i] = kinds[j]; kinds[j] = t; }
      for (i = 0; i < A; i++) { var rr2 = M.sqrt(i + 0.5), a = i * GA; list.push({ k: kinds[i], x: rr2 * M.cos(a), y: rr2 * M.sin(a) }); }
      nuc = list.reverse();
    }
    pack();
    function info() { var e = EL[S.p], q = S.p - S.e, sh = S.p ? shellsFor() : []; return { e: e, q: q, A: S.p + S.n, sh: sh }; }
    function shellsFor() { if (!S.p) return []; var q = S.p - S.e; if (S.e <= 0) return []; try { return shells(S.p, q); } catch (er) { return []; } }
    function draw() {
      var ctx = c.ctx, k = pal(), I = info(), wide = c.w >= 560, ax = wide ? c.w * 0.3 : c.w / 2, ay = wide ? c.h / 2 : c.h * 0.31, R0 = wide ? M.min(c.w * 0.26, c.h * 0.45) : M.min(c.w * 0.44, c.h * 0.28);
      ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var sh = I.sh, ns = M.max(1, sh.length), nr = M.max(4, M.min(R0 * 0.2, 4 + M.sqrt(I.A) * 1.6)), rad = function (i) { return nr + 8 + (R0 - nr - 8) * (i + 1) / ns; };
      // electrons: shells or a cloud
      if (S.view === 'cloud' && sh.length) {
        var g = ctx.createRadialGradient(ax, ay, nr, ax, ay, rad(ns - 1) * 1.15); g.addColorStop(0, rgba(k.blue, 0.42)); g.addColorStop(0.6, rgba(k.blue, 0.16)); g.addColorStop(1, rgba(k.blue, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ax, ay, rad(ns - 1) * 1.15, 0, TAU); ctx.fill();
        for (var d = 0; d < S.e * 18; d++) { var rr3 = rad(ns - 1) * 1.1 * M.sqrt(-M.log(1 - rnd() * 0.97)) / 1.9, a3 = rnd() * TAU; ctx.fillStyle = rgba(k.blue, 0.35); ctx.fillRect(ax + rr3 * M.cos(a3), ay + rr3 * M.sin(a3), 1.6, 1.6); }
        rnd = rng(5);
      } else sh.forEach(function (cnt, i) {
        var r = rad(i), outer = i === sh.length - 1, hl = o.highlight === 'valence' && outer;
        ctx.save(); ctx.strokeStyle = hl ? k.gold : k.grid; ctx.lineWidth = hl ? 2.5 : 1.5; ctx.beginPath(); ctx.arc(ax, ay, r, 0, TAU); ctx.stroke(); ctx.restore();
        for (var j = 0; j < cnt; j++) { var a = -PI / 2 + j * TAU / cnt + S.t * (0.25 / (i + 1)); ball(ctx, ax + r * M.cos(a), ay + r * M.sin(a), M.max(3.5, M.min(6, 160 / (cnt + 20))), 'e', { color: hl ? k.gold : k.blue, flat: false }); }
      });
      // nucleus
      var sc = nr / M.max(1, M.sqrt(I.A + 0.5)), br = M.max(2.2, sc * 0.95);
      nuc.forEach(function (q) { ball(ctx, ax + q.x * sc, ay + q.y * sc, br, q.k, { color: q.k === 'p' ? '#e8590c' : '#adb5bd' }); });
      if (!I.A) txt(ctx, 'no nucleus yet', ax, ay, { align: 'center' });
      // the card: nuclear symbol, name, numbers
      var cx = wide ? c.w * 0.76 : c.w / 2, cw = wide ? M.min(250, c.w * 0.38) : M.min(320, c.w - 16), ch = wide ? 200 : 112, cy = wide ? c.h * 0.4 : c.h - 30 - ch / 2;
      panel(ctx, cx - cw / 2, cy - ch / 2, cw, ch, { r: 12 });
      var e = I.e, sym = e ? e.s : '?', hide = quiet;
      ctx.save(); ctx.fillStyle = k.ink; ctx.textBaseline = 'middle';
      var fs = wide ? 46 : 36, sx = wide ? cx : cx - cw / 2 + 50, sy = cy - (wide ? 52 : 4);
      ctx.font = '700 ' + fs + 'px Georgia,serif'; ctx.textAlign = 'center'; ctx.fillText(hide || !show.symbol ? '?' : sym, sx, sy);
      ctx.font = '600 ' + M.round(fs * 0.36) + 'px system-ui,sans-serif'; ctx.fillStyle = k.muted; ctx.textAlign = 'right';
      ctx.fillText(hide || !show.mass ? '' : String(I.A), sx - fs * 0.42, sy - fs * 0.36); ctx.fillText(String(S.p), sx - fs * 0.42, sy + fs * 0.36);
      ctx.textAlign = 'left'; ctx.fillStyle = I.q > 0 ? k.plus : I.q < 0 ? k.minus : k.muted; if (!hide && show.charge && I.q) ctx.fillText(chargeStr(I.q), sx + fs * 0.4, sy - fs * 0.36);
      ctx.restore();
      var lx = wide ? cx - cw / 2 + 14 : cx - cw / 2 + 100, ly = wide ? cy + 2 : cy - 36;
      if (wide) { txt(ctx, hide || !show.name ? 'Which element?' : e ? e.name + (I.A ? '-' + I.A : '') : 'no protons', cx, ly, { align: 'center', size: 15, bold: true, color: k.ink }); }
      else { txt(ctx, hide || !show.name ? 'Which element?' : e ? e.name + (I.A ? '-' + I.A : '') : 'no protons', lx, ly, { size: 14, bold: true, color: k.ink }); }
      var qs = I.q === 0 ? 'neutral atom' : 'ion, charge ' + (I.q > 0 ? '+' : '−') + M.abs(I.q), lines = wide ? ['protons ' + S.p + ' · neutrons ' + S.n + ' · electrons ' + S.e] : ['protons ' + S.p + ' · neutrons ' + S.n, 'electrons ' + S.e + (!hide && show.charge ? ' · ' + qs : '')];
      if (!hide && show.charge && wide) lines.push(qs);
      if (!hide && show.shells && sh.length) lines.push('shells: ' + sh.join(', '));
      lines.forEach(function (s, i) { txt(ctx, s, wide ? cx : lx, ly + 22 + i * 17, { align: wide ? 'center' : 'left', size: wide ? 12 : 11.5 }); });
      // mini periodic strip
      if (!hide && S.p && wide) { var w5 = M.min(36, cw / 5.5), x0 = cx - w5 * 2.5, y0 = cy + ch / 2 + 14; for (var z = S.p - 2; z <= S.p + 2; z++) { var ez = EL[z]; if (!ez) continue; var xx = x0 + (z - S.p + 2) * w5; ctx.save(); rr(ctx, xx + 1, y0, w5 - 2, w5 - 2, 5); ctx.fillStyle = z === S.p ? k.accSoft : k.panel; ctx.fill(); ctx.strokeStyle = z === S.p ? k.acc : k.labLine; ctx.lineWidth = z === S.p ? 2 : 1; ctx.stroke(); ctx.restore(); txt(ctx, String(z), xx + 4, y0 + 7, { size: 8 }); txt(ctx, ez.s, xx + w5 / 2, y0 + w5 / 2 + 2, { size: 12, bold: true, align: 'center', color: k.ink }); } txt(ctx, 'neighbors on the periodic table', cx, y0 + w5 + 8, { size: 10, align: 'center' }); }
      // legend
      ball(ctx, 14, c.h - 14, 5, 'p', { color: '#e8590c' }); txt(ctx, 'proton', 23, c.h - 14, { size: 11 });
      ball(ctx, 80, c.h - 14, 5, 'n', { color: '#adb5bd' }); txt(ctx, 'neutron', 89, c.h - 14, { size: 11 });
      ball(ctx, 150, c.h - 14, 4, 'e', { color: k.blue }); txt(ctx, 'electron', 158, c.h - 14, { size: 11 });
      if (c.w > 520) txt(ctx, 'not to scale: a real nucleus is about 100 000 times smaller than the atom', c.w - 8, c.h - 14, { size: 10, align: 'right' });
    }
    function report() {
      var I = info(), e = I.e;
      var s = quiet ? 'Protons ' + S.p + ', neutrons ' + S.n + ', electrons ' + S.e + '.' : (e ? '<b>' + e.name + '-' + I.A + '</b> (' + (I.q ? fH(e.s + (M.abs(I.q) > 1 ? M.abs(I.q) : '') + (I.q > 0 ? '+' : '-')) + ', an ion' : e.s + ', a neutral atom') + '): ' : 'No protons, so no element. ') + S.p + ' protons decide the element' + (e ? ' (atomic number ' + S.p + ')' : '') + '; ' + S.n + ' neutrons make mass number ' + I.A + '; ' + S.e + ' electrons' + (I.q ? ' give a charge of ' + (I.q > 0 ? '+' : '−') + M.abs(I.q) : ' balance the protons') + '.' + (I.sh.length ? ' Shells: ' + I.sh.join(', ') + '.' : '');
      F.say(s); F.setAlt('An atom with ' + S.p + ' protons and ' + S.n + ' neutrons in the nucleus and ' + S.e + ' electrons around it' + (I.sh.length ? ', in shells of ' + I.sh.join(', ') : '') + '.');
    }
    if (F.edit) {
      [['p', 'Protons', 118], ['n', 'Neutrons', 180], ['e', 'Electrons', 120]].forEach(function (it) {
        var g = mk('div', 'chv-pm'); g.innerHTML = '<span>' + it[1] + '</span>'; var out = mk('output', '', String(S[it[0]]));
        var minus = btn(g, '−', function () { S[it[0]] = M.max(0, S[it[0]] - 1); upd(); }); minus.setAttribute('aria-label', 'One fewer ' + it[1].toLowerCase().replace(/s$/, ''));
        g.appendChild(out); var plus = btn(g, '+', function () { S[it[0]] = M.min(it[2], S[it[0]] + 1); upd(); }); plus.setAttribute('aria-label', 'One more ' + it[1].toLowerCase().replace(/s$/, ''));
        g.out = out; g.key = it[0]; F.ctl.appendChild(g); (S.pms = S.pms || []).push(g);
      });
      seg(F.ctl, 'Electron view', [['shells', 'Shells'], ['cloud', 'Cloud']], S.view, function (v) { S.view = v; draw(); });
    }
    function upd() { pack(); (S.pms || []).forEach(function (g) { g.out.textContent = S[g.key]; }); report(); draw(); }
    var A = anim(elx, function (dt) { S.t += dt; draw(); }, o.motion !== false);
    redraw(c, draw); report(); draw();
    return { draw: draw };
  });
  // the gold foil experiment: Rutherford scattering. Deflection angle θ = 2·atan(d / 2b) for impact parameter b, with d the
  // distance of closest approach in a head-on collision (about 45 fm for 5 MeV alpha particles on gold).
  function goldfoil(F, o) {
    var c = F.canvas({ aspect: 1.9, min: 280, max: 420, narrow: 0.8 }), rnd = rng(11), S = { tracks: [], hits: [], n: 0, back: 0, thomson: false, t: 0 }, quiet = F.quiet;
    function geo() { var w = c.w, h = c.h, nar = w < 560, cx = w * (nar ? 0.6 : 0.58), cy = h * (nar ? 0.42 : 0.5), R = M.min(w * 0.36, h * (nar ? 0.36 : 0.44)); return { cx: cx, cy: cy, R: R, sx: M.max(48, cx - R - 50) }; }
    function shoot() {
      // impact parameters drawn so that a few in a hundred come close to a nucleus (the picture speeds up the rare events);
      // the real fraction is far smaller, as the readout says
      var b = M.pow(rnd(), 1.8) * 1.0, th;
      if (S.thomson) th = (rnd() - 0.5) * 0.02;
      else { var d = 0.0035; th = 2 * M.atan(d / (2 * M.max(b, 1e-4))) * (rnd() < 0.5 ? 1 : -1); }
      var g = geo(); S.tracks.push({ y0: g.cy + (rnd() - 0.5) * 16, th: th, t: 0 }); S.n++; if (M.abs(th) > PI / 2) S.back++;
    }
    function step(dt) { S.t += dt; if (S.tracks.length < 40) { S.acc = (S.acc || 0) + dt; while (S.acc > 0.06) { S.acc -= 0.06; shoot(); } } S.tracks.forEach(function (t) { t.t += dt * 1.6; }); var g = geo(); S.tracks = S.tracks.filter(function (t) { if (t.t > 2) { S.hits.push(t.th); if (S.hits.length > 600) S.hits.shift(); return false; } return true; }); draw(); if (S.n % 10 === 0) report(); }
    function pos(t, tr, g) { // straight in to the foil, then out along the deflected direction
      var L1 = g.cx - g.sx; if (t < 1) return [g.sx + L1 * t, tr.y0]; var u = (t - 1); return [g.cx + M.cos(tr.th) * g.R * u, tr.y0 + M.sin(tr.th) * g.R * u];
    }
    function draw() {
      var ctx = c.ctx, k = pal(), g = geo(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.dark ? '#0f1c16' : '#f4f7f5'; ctx.fillRect(0, 0, c.w, c.h);
      // detector ring with a histogram of hits
      ctx.save(); ctx.strokeStyle = k.dark ? 'rgba(160,230,190,.35)' : 'rgba(0,86,47,.25)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(g.cx, g.cy, g.R, 0, TAU); ctx.stroke(); ctx.restore();
      S.hits.forEach(function (th, i) { var a = th + (i % 7 - 3) * 0.004; ctx.fillStyle = M.abs(th) > PI / 2 ? k.red : k.gold; ctx.globalAlpha = 0.7; ctx.fillRect(g.cx + M.cos(a) * g.R - 1.5, g.cy + M.sin(a) * g.R - 1.5, 3, 3); }); ctx.globalAlpha = 1;
      // source and beam
      panel(ctx, g.sx - 34, g.cy - 16, 30, 32, { r: 5, fill: k.dark ? '#7a6658' : '#d8cfc7' }); txt(ctx, 'α source', g.sx - 19, g.cy + 26, { size: 10, align: 'center' });
      ctx.fillStyle = 'rgba(233,196,106,.85)'; ctx.fillRect(g.cx - 2, g.cy - g.R * 0.55, 4, g.R * 1.1); txt(ctx, 'gold foil', g.cx, g.cy - g.R * 0.55 - 8, { size: 11, align: 'center', bold: true, color: k.ink });
      S.tracks.forEach(function (t) { var p = pos(t.t, t, g); ball(ctx, p[0], p[1], 3, 'a', { color: '#e8590c', flat: true }); var q = pos(M.max(0, t.t - 0.08), t, g); ctx.strokeStyle = 'rgba(232,89,12,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); });
      // inset: the foil's atoms up close (not to scale)
      var iw = c.w < 560 ? 128 : M.min(150, c.w * 0.3), ih = iw * 0.75, ix = 8, iy = c.w < 560 ? c.h - ih - 8 : 8; panel(ctx, ix, iy, iw, ih, { r: 8, fill: k.bg });
      for (var r2 = 0; r2 < 3; r2++) for (var c2 = 0; c2 < 4; c2++) { var x = ix + iw * (c2 + 0.5) / 4, y = iy + 14 + (ih - 20) * (r2 + 0.5) / 3; ctx.strokeStyle = k.grid; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(x, y, iw / 9, 0, TAU); ctx.stroke(); ctx.setLineDash([]); if (!S.thomson) ball(ctx, x, y, 2.2, 'n', { color: '#e8590c', flat: true }); else { ctx.fillStyle = rgba(k.red, 0.15); ctx.beginPath(); ctx.arc(x, y, iw / 9, 0, TAU); ctx.fill(); } }
      txt(ctx, S.thomson ? 'Thomson: spread-out charge' : 'tiny nucleus in empty space', ix + iw / 2, iy + 8, { size: 9, align: 'center' }); txt(ctx, 'not to scale', ix + iw / 2, iy + ih - 6, { size: 9, align: 'center' });
    }
    function report() { var f = S.n ? S.back / S.n : 0; F.say((S.thomson ? '<b>Thomson\'s prediction:</b> with the charge spread through the atom, every alpha particle would pass almost straight through.' : '<b>What Geiger and Marsden saw:</b> most alpha particles pass straight through, but a few bounce off at large angles. Only a tiny, dense, positive nucleus can push that hard.') + (quiet ? '' : ' Shown: ' + S.n + ' particles, ' + S.back + ' bounced back. (The picture makes close hits common; in the real experiment about 1 in 8,000 bounced back.)')); }
    F.setAlt('Alpha particles fly from a source at a thin gold foil. Most pass straight through to the detector ring behind it; a few are deflected at large angles or bounce back.');
    var A = anim(F.el, step, true);
    if (F.edit) { playBtn(F.ctl, A); if (o.thomson !== false) { var tb = btn(F.ctl, "Show Thomson's prediction", function () { S.thomson = !S.thomson; tb.textContent = S.thomson ? 'Show the real result' : "Show Thomson's prediction"; S.hits = []; S.n = 0; S.back = 0; report(); draw(); }); } }
    if (V.reduced) { for (var i = 0; i < 400; i++) { shoot(); var t = S.tracks.pop(); S.hits.push(t.th); } }
    redraw(c, draw); report(); draw();
    return { draw: draw };
  }
  function models(F, o) {
    var c = F.canvas({ aspect: 2.4, min: 230, max: 320, narrow: 0.9 }), S = { t: 0 };
    var MD = [
      ['Dalton', 'early 1800s', 'Atoms are tiny solid spheres; each element has its own kind.', 'Then: cathode rays showed that atoms hold tiny negative particles, electrons (Thomson, 1897).'],
      ['Thomson', '1904', 'Electrons sit in a spread-out ball of positive charge (the "plum pudding").', 'Then: the gold foil experiment bounced a few alpha particles back (1909).'],
      ['Rutherford', '1911', 'A tiny, dense, positive nucleus; electrons move in the empty space around it.', 'Then: atoms give off only certain colors of light, which this model could not explain.'],
      ['Bohr', '1913', 'Electrons move only in fixed energy levels; jumps between levels give the line spectra.', 'Later: the quantum model (1926) replaced orbits with electron clouds.']
    ];
    function draw() {
      var ctx = c.ctx, k = pal(), per = c.w < 560 ? 2 : 4, rows = M.ceil(4 / per), cw = (c.w - 10 * (per + 1)) / per, chh = (c.h - 10) / rows;
      ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      MD.forEach(function (m, i) {
        var x = 10 + (i % per) * (cw + 10), y = 5 + M.floor(i / per) * chh, cx = x + cw / 2, cy = y + chh * 0.45, r = M.min(cw * 0.3, chh * 0.3);
        panel(ctx, x, y, cw, chh - 8, { r: 10 });
        txt(ctx, m[0], cx, y + 14, { size: 13, bold: true, align: 'center', color: k.ink }); txt(ctx, m[1], cx, y + 29, { size: 11, align: 'center' });
        if (i === 0) ball(ctx, cx, cy + 6, r * 0.85, 'x', { color: '#8d99ae' });
        if (i === 1) { ctx.save(); var g = ctx.createRadialGradient(cx, cy + 6, 2, cx, cy + 6, r); g.addColorStop(0, rgba(k.red, 0.35)); g.addColorStop(1, rgba(k.red, 0.12)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy + 6, r, 0, TAU); ctx.fill(); ctx.restore(); for (var j = 0; j < 7; j++) { var a = j * 2.4, rr2 = r * 0.62 * M.sqrt((j + 0.5) / 7); ball(ctx, cx + rr2 * M.cos(a), cy + 6 + rr2 * M.sin(a), 3.5, 'e', { color: k.blue }); } }
        if (i === 2) { ball(ctx, cx, cy + 6, 3, 'n', { color: '#e8590c' }); for (j = 0; j < 6; j++) { var a2 = j * 1.7 + S.t * 0.8, r3 = r * (0.5 + 0.45 * ((j * 37) % 10) / 10); ball(ctx, cx + r3 * M.cos(a2), cy + 6 + r3 * M.sin(a2), 3, 'e', { color: k.blue }); } }
        if (i === 3) { ball(ctx, cx, cy + 6, 4, 'n', { color: '#e8590c' }); [0.45, 0.75, 1].forEach(function (f, s) { ctx.strokeStyle = k.grid; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy + 6, r * f, 0, TAU); ctx.stroke(); var nE = [2, 4, 1][s]; for (var q = 0; q < nE; q++) { var a3 = q * TAU / nE + S.t * 0.6 / (s + 1); ball(ctx, cx + r * f * M.cos(a3), cy + 6 + r * f * M.sin(a3), 3, 'e', { color: k.blue }); } }); }
      });
    }
    var list = mk('ol', 'chv-models'); MD.forEach(function (m) { var li = mk('li', '', '<b>' + m[0] + ' (' + m[1] + ')</b>: ' + m[2] + ' <span class="chv-then">' + m[3] + '</span>'); list.appendChild(li); }); F.el.insertBefore(list, F.out.el);
    F.out.el.hidden = true; F.setAlt('Four models of the atom side by side: Dalton\'s solid sphere, Thomson\'s plum pudding, Rutherford\'s nuclear atom and Bohr\'s energy levels. Each one was replaced after a new experiment.');
    var A = anim(F.el, function (dt) { S.t += dt; draw(); }, true); if (F.edit && !V.reduced) { } if (F.edit) playBtn(F.ctl, A);
    redraw(c, draw); draw(); return { draw: draw };
  }

  // =====================================================================================================
  // ch-periodic: options are documented at the top of this file
  // successive ionization energies, kJ/mol, H to Ca (NIST Atomic Spectra Database, as tabulated in kJ/mol)
  var SIE = {
    1: [1312.0], 2: [2372.3, 5250.5], 3: [520.2, 7298.1, 11815.0], 4: [899.5, 1757.1, 14848.7, 21006.6], 5: [800.6, 2427.1, 3659.7, 25025.8, 32826.7],
    6: [1086.5, 2352.6, 4620.5, 6222.7, 37831, 47277.0], 7: [1402.3, 2856, 4578.1, 7475.0, 9444.9, 53266.6, 64360], 8: [1313.9, 3388.3, 5300.5, 7469.2, 10989.5, 13326.5, 71330, 84078.0],
    9: [1681.0, 3374.2, 6050.4, 8407.7, 11022.7, 15164.1, 17868, 92038.1, 106434.3], 10: [2080.7, 3952.3, 6122, 9371, 12177, 15238, 19999.0, 23069.5, 115379.5, 131432],
    11: [495.8, 4562, 6910.3, 9543, 13354, 16613, 20117, 25496, 28932, 141362, 159076], 12: [737.7, 1450.7, 7732.7, 10542.5, 13630, 18020, 21711, 25661, 31653, 35458, 169988, 189368],
    13: [577.5, 1816.7, 2744.8, 11577, 14842, 18379, 23326, 27465, 31853, 38473, 42647, 201266, 222316], 14: [786.5, 1577.1, 3231.6, 4355.5, 16091, 19805, 23780, 29287, 33878, 38726, 45962, 50502, 235196, 257923],
    15: [1011.8, 1907, 2914.1, 4963.6, 6273.9, 21267, 25431, 29872, 35905, 40950, 46261, 54110, 59024, 271791, 296195], 16: [999.6, 2252, 3357, 4556, 7004.3, 8495.8, 27107, 31719, 36621, 43177, 48710, 54460, 62930, 68216, 311048, 337138],
    17: [1251.2, 2298, 3822, 5158.6, 6542, 9362, 11018, 33604, 38600, 43961, 51068, 57118, 63363, 72341, 78095, 352994, 380760], 18: [1520.6, 2665.8, 3931, 5771, 7238, 8781, 11995, 13842, 40760, 46186, 52002, 59653, 66199, 72918, 82473, 88576, 397605, 427066],
    19: [418.8, 3052, 4420, 5877, 7975, 9590, 11343, 14944, 16963.7, 48610, 54490, 60730, 68950, 75900, 83080, 93400, 99710, 444880, 476063], 20: [589.8, 1145.4, 4912.4, 6491, 8153, 10496, 12270, 14206, 18191, 20385, 57110, 63410, 70110, 78890, 86310, 94000, 104900, 111711, 494850, 527762]
  };
  var FAMC = { hydrogen: '#94a3b8', alkali: '#ff8787', alkearth: '#ffa94d', transition: '#ffd43b', lanthanide: '#c0eb75', actinide: '#8ce99a', post: '#a5d8ff', metalloid: '#66d9e8', nonmetal: '#b197fc', halogen: '#f783ac', noble: '#d0bfff', unknown: '#dee2e6' };
  var BLOCKC = { s: '#ff8787', p: '#ffd43b', d: '#74c0fc', f: '#8ce99a' };
  var PROPS = { radius: { k: 'rcov', name: 'Covalent radius', unit: 'pm', d: 0, up: 'down a group and to the left' }, ie1: { k: 'ie', name: 'First ionization energy', unit: 'kJ/mol', d: 0, up: 'up a group and to the right' }, en: { k: 'en', name: 'Electronegativity', unit: '', d: 2, up: 'up a group and to the right' }, mass: { k: 'mass', name: 'Atomic mass', unit: 'u', d: 2, up: 'with atomic number' } };
  R('ch-periodic', function (elx, o) {
    o = opt(o, { mode: 'category', prop: 'ie1', el: null, scale: 'linear', highlight: [], mystery: null });
    var S = { mode: o.mode, prop: PROPS[o.prop] ? o.prop : 'ie1', sel: el(o.el) ? el(o.el).Z : (o.mode === 'successive' ? 11 : 0), scale: o.scale, hover: 0 };
    if (S.mode === 'successive' && (!S.sel || S.sel > 20)) S.sel = 11;
    var F = frame(elx, o, 'The periodic table'), quiet = F.quiet, mys = el(o.mystery), hl = {}; (o.highlight || []).forEach(function (s) { var e = el(s); if (e) hl[e.Z] = 1; });
    var c = F.canvas({ aspect: 1.75, min: 240, max: 520, narrow: 1.45 }), legend = F.html('chv-legend');
    var modes = o.modes || [S.mode];
    if (F.edit && modes.length > 1) seg(F.ctl, 'View', modes.map(function (m) { return [m, { category: 'Families', block: 'Blocks', valence: 'Valence electrons', charges: 'Ion charges', trend: 'Trend map', chart: 'Trend chart', successive: 'Successive IE' }[m] || m]; }), S.mode, function (v) { S.mode = v; if (v === 'successive' && (!S.sel || S.sel > 20)) S.sel = 11; layout(); draw(); report(); });
    if (F.edit && (modes.indexOf('trend') >= 0 || modes.indexOf('chart') >= 0)) seg(F.ctl, 'Property', [['radius', 'Radius'], ['ie1', 'Ionization energy'], ['en', 'Electronegativity']].concat(modes.indexOf('trend') >= 0 ? [['mass', 'Mass']] : []), S.prop, function (v) { S.prop = v; draw(); report(); });
    var scaleSeg = null; if (F.edit && modes.indexOf('successive') >= 0) scaleSeg = seg(F.ctl, 'Scale', [['linear', 'Linear'], ['log', 'Log']], S.scale, function (v) { S.scale = v; draw(); });
    var L = {};
    function layout() {
      if (S.mode === 'chart' || S.mode === 'successive') { c.q.fixed = false; c.q.height = undefined; c.q.aspect = 1.75; c.fit(); return; }
      var cw = M.min(46, (c.w - 8) / 18), H = cw * 10.0 + 6; L.cw = cw; L.x0 = (c.w - cw * 18) / 2; L.y0 = 4;
      c.q.fixed = true; c.q.height = M.round(H); c.fit();
    }
    function cell(e) { var r = e.row, x = L.x0 + (e.col - 1) * L.cw, y = L.y0 + (r <= 7 ? (r - 1) * L.cw : (r - 9 + 7.35) * L.cw); return [x, y]; }
    function val(e) { var p = PROPS[S.prop]; return e[p.k]; }
    function range() { var lo = 1e9, hi = -1e9; EL.forEach(function (e) { if (!e) return; var v = val(e); if (v == null || (S.prop === 'mass' && !e.stable)) return; lo = M.min(lo, v); hi = M.max(hi, v); }); return [lo, hi]; }
    function heat(t) { var k = pal(); return k.dark ? mixC('#1f3a2e', '#d39ad0', t) : mixC('#f3eef6', '#6d2a68', t); }
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      if (S.mode === 'chart') return drawChart(ctx);
      if (S.mode === 'successive') return drawSucc(ctx);
      var cw = L.cw, rg = range(), fsz = M.max(8, M.min(15, cw * 0.36));
      EL.forEach(function (e) {
        if (!e) return; var p = cell(e), x = p[0], y = p[1], fill = k.panel, ink = '#1d2320', label = e.s, sm = String(e.Z), isM = mys && mys.Z === e.Z;
        if (S.mode === 'category') fill = FAMC[e.fam];
        else if (S.mode === 'block') fill = BLOCKC[e.block];
        else if (S.mode === 'valence') { var v = valence(e.Z); fill = v != null ? mixC('#e7f5ff', '#1c7ed6', v / 8) : (k.dark ? '#2a3a32' : '#eef1ef'); if (v != null) { sm = e.s; label = String(v); } ink = v != null && v > 4 ? '#fff' : (v == null && k.dark ? '#a9b8af' : '#1d2320'); }
        else if (S.mode === 'charges') { fill = e.ions.length ? (e.ions[0] > 0 ? '#ffe3e3' : '#d0ebff') : (k.dark ? '#2a3a32' : '#eef1ef'); sm = e.s; label = e.ions.length ? e.ions.map(function (q) { return (q > 0 ? '+' : '−') + M.abs(q); }).join(',') : ''; if (!e.ions.length && k.dark) ink = '#a9b8af'; }
        else if (S.mode === 'trend') { var vv = val(e); if (vv == null || (S.prop === 'mass' && !e.stable)) { fill = k.dark ? '#26332c' : '#f1f3f2'; ink = k.dark ? '#7d8b83' : '#98a29c'; } else { var t = (vv - rg[0]) / (rg[1] - rg[0]); fill = heat(t); ink = (k.dark ? t < 0.55 : t > 0.5) ? '#fff' : '#1d2320'; if (k.dark && t >= 0.55) ink = '#1b1220'; } }
        if (isM) { fill = k.bg; label = '?'; sm = quiet ? '' : sm; }
        ctx.save(); rr(ctx, x + 1, y + 1, cw - 2, cw - 2, M.min(5, cw * 0.15)); ctx.fillStyle = fill; ctx.fill();
        var sel = S.sel === e.Z; ctx.lineWidth = sel || hl[e.Z] ? 2.5 : 0.8; ctx.strokeStyle = sel ? k.acc : hl[e.Z] ? k.gold : (k.dark ? 'rgba(0,0,0,.35)' : 'rgba(0,0,0,.12)'); if (isM) { ctx.setLineDash([3, 2]); ctx.strokeStyle = k.acc; ctx.lineWidth = 2; } ctx.stroke(); ctx.restore();
        if (cw >= 26 && sm) txt(ctx, sm, x + 3, y + 7, { size: M.max(7, cw * 0.2), color: ink === '#fff' ? 'rgba(255,255,255,.85)' : 'rgba(29,35,32,.7)', light: true });
        txt(ctx, label, x + cw / 2, y + cw * (cw >= 26 ? 0.58 : 0.52), { size: label.length > 3 ? fsz * 0.72 : label.length > 2 ? fsz * 0.85 : fsz, bold: true, align: 'center', color: isM ? k.acc : ink });
      });
      // group numbers and block labels
      if (cw >= 22) for (var g = 1; g <= 18; g++) { var yy = g === 1 || g === 18 ? L.y0 - 1 : g === 2 || g >= 13 ? L.y0 + cw - 1 : L.y0 + 3 * cw - 1; if (S.mode === 'valence' || S.mode === 'block') { } }
      if (S.mode === 'block' && cw >= 20) { var segs = []; EL.forEach(function (e) { if (!e) return; var last = segs[segs.length - 1]; if (last && last.row === e.row && last.block === e.block && last.c1 === e.col - 1) last.c1 = e.col; else segs.push({ row: e.row, block: e.block, c0: e.col, c1: e.col, e: e }); });
        segs.forEach(function (sg) { var e = sg.e; if (e.Z === 2) return; var n = e.block === 'd' ? e.period - 1 : e.block === 'f' ? e.period - 2 : e.period; var p0 = cell(e); pill(ctx, n + e.block, L.x0 + ((sg.c0 + sg.c1) / 2 - 0.5) * cw, p0[1] + cw - 3, { size: M.max(8, cw * 0.24), bg: 'rgba(255,255,255,.88)', color: '#1d2320' }); }); }
      if (S.mode === 'trend') { var p2 = PROPS[S.prop], ax = L.x0 + 2.2 * cw, ay = L.y0 + cw * 0.35; if (S.prop !== 'mass') { var right = S.prop !== 'radius'; arrow(ctx, L.x0 + cw * 2.6, L.y0 + cw * 1.45, L.x0 + cw * 11.6, L.y0 + cw * 1.45, k.acc, 2.5, 9); if (cw >= 26) txt(ctx, (right ? 'increases across a period →' : 'decreases across a period →'), L.x0 + cw * 7.1, L.y0 + cw * 1.15, { size: M.max(9, cw * 0.26), align: 'center', color: k.acc, bold: true }); arrow(ctx, L.x0 + cw * 2.45, L.y0 + cw * 2.3, L.x0 + cw * 2.45, L.y0 + cw * 2.95, k.acc, 2.5, 7); txt(ctx, S.prop === 'radius' ? 'grows down a group' : 'falls down a group', L.x0 + cw * 2.75, L.y0 + cw * 2.62, { size: M.max(9, cw * 0.26), color: k.acc, bold: true }); } }
      // the card in the gap above the d block (wide screens)
      if (S.sel && cw >= 30 && S.mode !== 'trend') { var e2 = EL[S.sel], bx = L.x0 + 2.15 * cw, by = L.y0 + 0.1 * cw, bw = cw * 9.7, bh = cw * 2.75; panel(ctx, bx, by, bw, bh, { r: 10, fill: k.bg }); var hide = quiet || (mys && mys.Z === S.sel); txt(ctx, hide ? '?' : e2.s, bx + 12, by + bh * 0.42, { size: cw * 0.9, bold: true, color: k.acc, serif: true }); txt(ctx, (hide ? 'Element ?' : e2.name) + ' · Z = ' + (hide && mys && mys.Z === S.sel ? '?' : e2.Z), bx + cw * 1.75, by + 16, { size: 13, bold: true, color: k.ink }); var lines = quiet ? ['Group ' + (e2.group || '—') + ', period ' + e2.period + ', ' + e2.block + ' block'] : ['Atomic weight ' + e2.w + (e2.stable ? '' : ' (mass number)'), 'Group ' + (e2.group || 'f block') + ', period ' + e2.period + ', ' + e2.block + ' block', cfgStr(e2.Z, 0, { short: true }) + (e2.Z >= 103 ? ' (predicted)' : '')]; if (hide && mys && mys.Z === S.sel) lines = ['Group ' + (e2.group || '—') + ', period ' + e2.period]; lines.forEach(function (s, i) { txt(ctx, s, bx + cw * 1.75, by + 36 + i * 17, { size: 12, color: k.ink, light: true }); }); }
      if (S.mode === 'trend') { // legend bar
        var lx = L.x0 + 2.4 * cw, ly = L.y0 + 0.25 * cw, lw = cw * 9, p3 = PROPS[S.prop]; for (var i = 0; i < 60; i++) { ctx.fillStyle = heat(i / 59); ctx.fillRect(lx + lw * i / 60, ly, lw / 60 + 1, M.max(7, cw * 0.22)); }
        txt(ctx, p3.name + (quiet ? '' : ': ' + fm(rg[0], p3.d) + ' to ' + fm(rg[1], p3.d) + ' ' + p3.unit), lx, ly + M.max(7, cw * 0.22) + 9, { size: M.max(9, cw * 0.25), color: k.ink });
      }
      if (H.focused()) { var pz = cell(EL[S.sel || 1]); focusBox(ctx, pz[0], pz[1], cw, cw); }
    }
    function drawChart(ctx) {
      var k = pal(), p = PROPS[S.prop], data = []; for (var z = 1; z <= 56; z++) { var v = EL[z][p.k]; if (v != null) data.push([z, v]); }
      var mx = 0; data.forEach(function (d) { mx = M.max(mx, d[1]); });
      var C = chart(c, { x: [0, 57], y: [0, mx * 1.12], xl: 'Atomic number Z', yl: p.name + (p.unit ? ' (' + p.unit + ')' : ''), ml: 56, xt: 5 }); L.C = C; C.draw(ctx);
      var segs = []; data.forEach(function (d, i) { if (i && d[0] !== data[i - 1][0] + 1) segs.push(null); segs.push(d); });
      var cur = []; segs.forEach(function (d) { if (!d) { C.path(ctx, cur, k.acc, 2); cur = []; } else cur.push(d); }); C.path(ctx, cur, k.acc, 2);
      data.forEach(function (d) { var e = EL[d[0]]; ctx.fillStyle = FAMC[e.fam]; ctx.strokeStyle = k.dark ? '#0f1a14' : '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(C.X(d[0]), C.Y(d[1]), d[0] === S.sel ? 6 : 3.5, 0, TAU); ctx.fill(); ctx.stroke(); });
      if (S.prop === 'ie1') { ['B', 'O', 'Al', 'S'].forEach(function (s) { var e = BYS[s]; arrow(ctx, C.X(e.Z), C.Y(e.ie) + 26, C.X(e.Z), C.Y(e.ie) + 8, k.gold, 2, 6); txt(ctx, s, C.X(e.Z), C.Y(e.ie) + 34, { size: 11, bold: true, align: 'center', color: k.gold }); }); ['He', 'Ne', 'Ar', 'Kr', 'Xe'].forEach(function (s) { var e = BYS[s]; txt(ctx, s, C.X(e.Z), C.Y(e.ie) - 10, { size: 10, align: 'center', color: k.muted }); }); }
      if (S.prop === 'radius') ['Li', 'Na', 'K', 'Rb', 'Cs'].forEach(function (s) { var e = BYS[s]; txt(ctx, s, C.X(e.Z), C.Y(e.rcov) - 10, { size: 10, align: 'center', color: k.muted }); });
      if (S.prop === 'en') ['F', 'Cl', 'Br', 'I'].forEach(function (s) { var e = BYS[s]; txt(ctx, s, C.X(e.Z), C.Y(e.en) - 10, { size: 10, align: 'center', color: k.muted }); });
      if (S.sel && S.sel <= 56 && EL[S.sel][p.k] != null) { var e3 = EL[S.sel]; if (!quiet) pill(ctx, e3.s + ': ' + fm(e3[p.k], p.d) + ' ' + p.unit, C.X(S.sel), C.Y(e3[p.k]) - 22, { clampW: c.w, size: 11 }); }
    }
    function drawSucc(ctx) {
      var k = pal(), Z = S.sel, ie = SIE[Z], e = EL[Z], v = valence(Z), lg = S.scale === 'log', n = ie.length;
      var C = chart(c, { x: [0.4, n + 0.6], y: lg ? [100, 1e6] : [0, ie[n - 1] * 1.08], ylog: lg, xl: 'Electron removed (1st, 2nd, …)', yl: 'Ionization energy (kJ/mol)', ml: 64, xt: 1, yf: lg ? null : function (y) { return fm(y / 1000, 0) + 'k'; } }); C.draw(ctx);
      var bw = M.max(4, (C.X(2) - C.X(1)) * 0.7), y0 = C.Y(lg ? 100 : 0), jump = -1, best = 0;
      for (var i = 1; i < n; i++) { var r2 = ie[i] / ie[i - 1]; if (r2 > best) { best = r2; jump = i; } }
      var sh = shells(Z), core = Z - sh[sh.length - 1];
      ie.forEach(function (val2, i) { var x = C.X(i + 1), y = C.Y(val2), outer = i < Z - core; ctx.fillStyle = outer ? k.acc : rgba(k.blue, 0.85); rr(ctx, x - bw / 2, y, bw, y0 - y, 3); ctx.fill(); if (!quiet && n <= 12 && c.w > 500) txt(ctx, fm(val2, 0), x, y - 8, { size: 10, align: 'center' }); });
      if (!quiet && jump > 0) { var xj = (C.X(jump) + C.X(jump + 1)) / 2; ctx.save(); ctx.strokeStyle = k.gold; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xj, C.box().y0); ctx.lineTo(xj, C.box().y1); ctx.stroke(); ctx.restore(); pill(ctx, 'big jump: into the core', xj, C.box().y0 + (c.w < 560 ? 66 : 36), { size: 11, color: k.ink, clampW: c.w }); }
      txt(ctx, e.name + ' (' + e.s + '), Z = ' + Z, C.box().x0 + 8, C.box().y0 + 12, { size: 13, bold: true, color: k.ink });
      var nw = c.w < 560, lgx = nw ? C.box().x0 + 8 : C.box().x1 - 150, lgy = nw ? C.box().y0 + 24 : C.box().y0 + 8; ctx.fillStyle = k.acc; ctx.fillRect(lgx, lgy, 10, 10); txt(ctx, 'outer (valence) electrons', lgx + 14, lgy + 5, { size: 10 }); ctx.fillStyle = rgba(k.blue, 0.85); ctx.fillRect(lgx, lgy + 16, 10, 10); txt(ctx, 'core electrons', lgx + 14, lgy + 21, { size: 10 });
    }
    function report() {
      var s = '', e = EL[S.sel];
      var legendHTML = '';
      if (S.mode === 'category') legendHTML = Object.keys(FAMC).filter(function (f) { return f !== 'unknown'; }).map(function (f) { return '<span><span class="chv-key" style="--c:' + FAMC[f] + '"></span>' + FAMN[f] + '</span>'; }).join('');
      if (S.mode === 'block') legendHTML = 'spdf'.split('').map(function (b) { return '<span><span class="chv-key" style="--c:' + BLOCKC[b] + '"></span>' + b + ' block</span>'; }).join('') + '<span>Each row of a block is a sublevel, such as 4p.</span>';
      if (S.mode === 'valence') legendHTML = '<span>Main-group elements show their valence electrons (groups 1, 2 and 13–18). The group number gives them only for main-group elements.</span>';
      if (S.mode === 'charges') legendHTML = '<span><span class="chv-key" style="--c:#ffe3e3"></span>forms positive ions</span><span><span class="chv-key" style="--c:#d0ebff"></span>forms negative ions</span><span>Several transition metals form more than one ion.</span>';
      legend.innerHTML = legendHTML; legend.hidden = !legendHTML;
      if (S.mode === 'successive') { var ie = SIE[S.sel], v = valence(S.sel), sh = shells(S.sel); s = quiet ? e.name + ': ' + ie.length + ' ionization energies, one for each electron.' : e.name + ' has ' + sh[sh.length - 1] + ' outer electron' + (sh[sh.length - 1] === 1 ? '' : 's') + '. Removing them takes ' + ie.slice(0, sh[sh.length - 1]).map(function (x) { return fm(x, 0); }).join(', ') + ' kJ/mol; the next one comes from the core and takes ' + (ie[sh[sh.length - 1]] ? fm(ie[sh[sh.length - 1]], 0) + ' kJ/mol' : '—') + '. Each electron is harder to remove than the last, because it is pulled away from an ion with a larger positive charge.'; }
      else if (S.mode === 'chart') { var p = PROPS[S.prop]; s = p.name + ' against atomic number for Z = 1 to 56. ' + (S.prop === 'ie1' ? 'The pattern repeats each period: lowest at the alkali metals, highest at the noble gases, with small dips at B, O, Al and S.' : S.prop === 'radius' ? 'The radius jumps up at each alkali metal and shrinks across each period.' : 'Electronegativity rises across each period and falls down each group; noble gases have no value.') + (e && !quiet && e.Z <= 56 && e[p.k] != null ? ' ' + e.name + ': ' + fm(e[p.k], p.d) + ' ' + p.unit + '.' : ''); }
      else if (e && !(mys && mys.Z === e.Z)) s = quiet ? 'Selected: group ' + (e.group || 'f block') + ', period ' + e.period + '.' : '<b>' + e.name + '</b> (' + e.s + '), Z = ' + e.Z + ', atomic weight ' + e.w + ', group ' + (e.group || '— (f block)') + ', period ' + e.period + ', ' + e.block + ' block, ' + FAMN[e.fam].toLowerCase().replace(/s$/, '') + '. Configuration ' + cfgStr(e.Z, 0, { short: true, html: true }) + (e.Z >= 103 ? ' (predicted)' : '') + '.' + (S.mode === 'trend' && e[PROPS[S.prop].k] != null ? ' ' + PROPS[S.prop].name + ': ' + fm(e[PROPS[S.prop].k], PROPS[S.prop].d) + ' ' + PROPS[S.prop].unit + '.' : '');
      else if (mys) s = 'Which element sits in the dashed cell? (group ' + (mys.group || '—') + ', period ' + mys.period + ')';
      else s = 'Tap an element, or focus the table and use the arrow keys.';
      F.say(s);
      F.setAlt(S.mode === 'successive' ? 'Bar chart of the successive ionization energies of ' + e.name.toLowerCase() + '.' : S.mode === 'chart' ? 'Line chart of ' + PROPS[S.prop].name.toLowerCase() + ' against atomic number.' : 'The periodic table colored by ' + { category: 'family', block: 'block', valence: 'valence electrons', charges: 'common ion charges', trend: PROPS[S.prop].name.toLowerCase() }[S.mode] + '.');
    }
    function at(px, py) { if (S.mode === 'chart') { var C = L.C; if (!C) return 0; var z = M.round(C.x(px)); return z >= 1 && z <= 56 ? z : 0; } if (S.mode === 'successive') return 0; for (var z2 = 1; z2 < EL.length; z2++) { var p = cell(EL[z2]); if (px >= p[0] && px < p[0] + L.cw && py >= p[1] && py < p[1] + L.cw) return z2; } return 0; }
    function move(dz) { var e = EL[S.sel || 1], tr = null, best = 1e9; EL.forEach(function (q) { if (!q) return; var dx = q.col - e.col, dy = (q.row <= 7 ? q.row : q.row - 1.6) - (e.row <= 7 ? e.row : e.row - 1.6); if (dz[0] && M.sign(dx) !== dz[0]) return; if (dz[1] && M.sign(dy) !== dz[1]) return; var d = M.abs(dx) * (dz[0] ? 1 : 4) + M.abs(dy) * (dz[1] ? 1 : 4); if (d > 0 && d < best) { best = d; tr = q; } }); if (tr) S.sel = tr.Z; }
    var H = keyNav(c, {
      tap: function (px, py) { if (S.mode === 'successive') return; var z = at(px, py); if (z) { S.sel = z; draw(); report(); } },
      key: function (e) {
        var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
        if (S.mode === 'successive') { if (d && d[0]) { S.sel = clamp(S.sel + d[0], 1, 20); draw(); report(); return true; } return false; }
        if (S.mode === 'chart') { if (d && d[0]) { S.sel = clamp((S.sel || 1) + d[0], 1, 56); draw(); report(); return true; } return false; }
        if (d) { if (!S.sel) S.sel = 1; else move(d); draw(); report(); return true; } return false;
      }, change: function () { draw(); }
    });
    if (S.mode === 'successive' || modes.indexOf('successive') >= 0) { var es = mk('label', 'chv-lab', 'Element'); var sel = D.createElement('select'); for (var z = 1; z <= 20; z++) { var op = D.createElement('option'); op.value = z; op.textContent = z + ' ' + EL[z].s + ' (' + EL[z].name + ')'; sel.appendChild(op); } sel.value = S.sel <= 20 ? S.sel : 11; sel.addEventListener('change', function () { S.sel = +sel.value; draw(); report(); }); es.appendChild(sel); if (F.edit) F.ctl.appendChild(es); }
    c.cv.setAttribute('aria-label', 'Periodic table. Arrow keys move between elements; the readout below names the selected element.');
    c.onResize(function () { layout(); draw(); }); V.onTheme(draw); layout(); report(); draw();
    return { draw: draw };
  });
  CH.SIE = SIE;

  // =====================================================================================================
  // ch-orbitalbox: options are documented at the top of this file
  var LNAME = 'spdf';
  function orbitalsFor(maxIdx) { var list = []; for (var i = 0; i <= maxIdx && i < SUBS.length; i++) { var q = SUBS[i]; for (var m = -q[1]; m <= q[1]; m++) list.push({ n: q[0], l: q[1], ml: m, sub: q[0] + LNAME[q[1]], si: i, up: 0, dn: 0 }); } return list; }
  function hundPlace(orbs, si, e) { var os = orbs.filter(function (q) { return q.si === si; }); os.forEach(function (q) { q.up = 0; q.dn = 0; }); for (var i = 0; i < e; i++) { if (i < os.length) os[i].up = 1; else os[i - os.length].dn = 1; } }
  function aufbauOrder(orbs) { var seq = []; SUBS.forEach(function (q, si) { var os = orbs.filter(function (x) { return x.si === si; }); os.forEach(function (x) { seq.push([x, 'up']); }); os.forEach(function (x) { seq.push([x, 'dn']); }); }); return seq; }
  R('ch-orbitalbox', function (elx, o) {
    o = opt(o, { Z: 26, charge: null, mode: 'fill', step: null, place: false, order: 'fill', d: 6, geometry: 'oct', delta: 240, pairing: 200, spin: null, ion: null });
    var mode = o.mode, F = frame(elx, o, mode === 'field' ? 'Crystal-field splitting of the d orbitals' : 'Orbital diagram'), quiet = F.quiet;
    if (mode === 'field') return crystalField(F, o);
    var Z = clamp(M.round(num(o.Z, 26)), 1, 54), charge = mode === 'ion' ? num(o.charge, 2) : 0, S = { step: 0, sel: -1, removed: 0, learner: mode === 'fill' && F.edit && o.place };
    var cfFinal = config(Z, 0), lastIdx = 0; SUBS.forEach(function (q, i) { if (cfFinal.occ[q[0] + LNAME[q[1]]] > 0) lastIdx = M.max(lastIdx, i); });
    if (charge < 0) { var cfA = config(Z, charge); SUBS.forEach(function (q, i) { if (cfA.occ[q[0] + LNAME[q[1]]] > 0) lastIdx = M.max(lastIdx, i); }); }
    var showIdx = M.min(SUBS.length - 1, lastIdx + 1), orbs = orbitalsFor(showIdx), seq = aufbauOrder(orbs);
    var exc = !!EXC[Z];
    function setStep(n) { // n electrons by Aufbau and Hund; at n = Z the measured ground state (Cr, Cu, … differ)
      S.step = clamp(n, 0, Z + (exc ? 1 : 0)); orbs.forEach(function (q) { q.up = 0; q.dn = 0; q.gone = 0; });
      if (exc && S.step === Z + 1) { SUBS.forEach(function (q, si) { if (si <= showIdx) hundPlace(orbs, si, cfFinal.occ[q[0] + LNAME[q[1]]] || 0); }); return; }
      for (var i = 0; i < M.min(S.step, seq.length); i++) seq[i][0][seq[i][1]] = 1;
    }
    function count() { var n = 0; orbs.forEach(function (q) { n += q.up + q.dn; }); return n; }
    function occ() { var r = {}; orbs.forEach(function (q) { r[q.sub] = (r[q.sub] || 0) + q.up + q.dn; }); return r; }
    function cfgText(oc, html) { var parts = []; var list = SUBS.slice(0, showIdx + 1).map(function (q) { return [q[0], q[1]]; }); if (o.order === 'n') list.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }); list.forEach(function (q) { var k2 = q[0] + LNAME[q[1]]; if (oc[k2]) parts.push(k2 + (html ? '<sup>' + oc[k2] + '</sup>' : sup(oc[k2]))); }); return parts.join(' ') || '—'; }
    function unpaired() { var u = 0; orbs.forEach(function (q) { if (q.up + q.dn === 1) u++; }); return u; }
    function finalIon() { // remove (or add) electrons: highest n first, then highest l
      setStep(exc ? Z + 1 : Z); var target = config(Z, charge).occ; SUBS.forEach(function (q, si) { if (si > showIdx) return; var key = q[0] + LNAME[q[1]], have = cfFinal.occ[key] || 0, want = target[key] || 0; if (want !== have) { hundPlace(orbs, si, want); orbs.forEach(function (x) { if (x.si === si) x.gone = 0; }); } });
    }
    // rule checks for the learner's own diagram
    function rules() {
      var notes = [], oc = occ(), total = count(), need = Z;
      if (total !== need) notes.push((total < need ? 'Place ' + (need - total) + ' more electron' + (need - total === 1 ? '' : 's') : 'That is ' + (total - need) + ' too many electron' + (total - need === 1 ? '' : 's')) + ' (a neutral atom of ' + EL[Z].name.toLowerCase() + ' has ' + need + ').');
      SUBS.forEach(function (q, si) { if (si > showIdx) return; var os = orbs.filter(function (x) { return x.si === si; }), e = oc[os[0].sub] || 0; if (!e) return;
        var paired = os.some(function (x) { return x.up && x.dn; }), empty = os.some(function (x) { return !x.up && !x.dn; }), sUp = os.filter(function (x) { return x.up + x.dn === 1 && x.up; }).length, sDn = os.filter(function (x) { return x.up + x.dn === 1 && x.dn; }).length;
        if (paired && empty) notes.push("Hund's rule: in " + os[0].sub + ', fill every box with one electron before pairing.');
        if (sUp && sDn) notes.push("Hund's rule: the single electrons in " + os[0].sub + ' should spin the same way.');
        for (var sj = 0; sj < si; sj++) { var lower = SUBS[sj], lk = lower[0] + LNAME[lower[1]], cap = CAPL[lower[1]]; if ((oc[lk] || 0) < cap) { notes.push('Aufbau: ' + lk + ' fills before ' + os[0].sub + '.'); break; } }
      });
      return notes.filter(function (n, i, a) { return a.indexOf(n) === i; });
    }
    // ---------- layout and drawing ----------
    var c = F.canvas({ aspect: 1.45, min: 280, max: 520, narrow: 0.85 }), Lg = {};
    function layout() {
      var nLev = showIdx + 1, h = M.max(260, 40 + nLev * 34); c.q.fixed = true; c.q.height = h; c.fit();
      var maxL = 0; orbs.forEach(function (q) { maxL = M.max(maxL, q.l); }); var bs = M.min(34, (c.w - 84) / [2.4, 5.4, 10.6, 18.2][maxL]); Lg.bs = bs; Lg.y = function (si) { return c.h - 30 - si * (c.h - 60) / M.max(1, nLev - 1 || 1) - (nLev === 1 ? (c.h - 60) / 2 : 0); };
      Lg.colX = [64, 64 + bs * 1.6, 64 + bs * 5.2, 64 + bs * 11.0];
    }
    function boxXY(q) { var bs = Lg.bs; return [Lg.colX[q.l] + (q.ml + q.l) * bs, Lg.y(q.si) - bs / 2]; }
    function arrowGlyph(ctx, x, y, up, col, bs) { ctx.save(); ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = 2.2; var top = y + bs * 0.18, bot = y + bs * 0.82; ctx.beginPath(); ctx.moveTo(x, up ? bot : top); ctx.lineTo(x, up ? top + 4 : bot - 4); ctx.stroke(); ctx.beginPath(); if (up) { ctx.moveTo(x, top); ctx.lineTo(x - 4.5, top + 7); ctx.lineTo(x + 4.5, top + 7); } else { ctx.moveTo(x, bot); ctx.lineTo(x - 4.5, bot - 7); ctx.lineTo(x + 4.5, bot - 7); } ctx.closePath(); ctx.fill(); ctx.restore(); }
    function draw() {
      var ctx = c.ctx, k = pal(), bs = Lg.bs; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      arrow(ctx, 20, c.h - 18, 20, 14, k.muted, 1.8, 8); txt(ctx, 'Energy', 9, c.h / 2, { size: 11, rot: -PI / 2, align: 'center' });
      orbs.forEach(function (q, i) {
        var p = boxXY(q), x = p[0], y = p[1]; ctx.save(); ctx.fillStyle = k.bg; ctx.strokeStyle = S.sel === i && H.focused() ? k.gold : k.ink; ctx.lineWidth = S.sel === i && H.focused() ? 2.5 : 1.3; ctx.fillRect(x, y, bs, bs); ctx.strokeRect(x + 0.5, y + 0.5, bs - 1, bs - 1); ctx.restore();
        if (q.up) arrowGlyph(ctx, x + bs * 0.34, y, true, q.l === 0 ? k.acc : q.l === 1 ? k.blue : q.l === 2 ? k.green : k.orange, bs);
        if (q.dn) arrowGlyph(ctx, x + bs * 0.66, y, false, q.l === 0 ? k.acc : q.l === 1 ? k.blue : q.l === 2 ? k.green : k.orange, bs);
        if (q.ml === -q.l) txt(ctx, q.sub, x - 6, y + bs / 2, { size: 13, bold: true, align: 'right', color: k.ink });
        if (mode === 'qn') txt(ctx, (q.ml > 0 ? '+' : q.ml < 0 ? '−' : '') + M.abs(q.ml), x + bs / 2, y + bs + 8, { size: 9, align: 'center' });
      });
      if (mode === 'qn' && S.pick && !quiet && c.w >= 560) { var q2 = S.pick.q, p2 = boxXY(q2); pill(ctx, 'n = ' + q2.n + ', l = ' + q2.l + ', mₗ = ' + (q2.ml > 0 ? '+' : q2.ml < 0 ? '−' : '') + M.abs(q2.ml) + ', mₛ = ' + (S.pick.up ? '+½' : '−½'), p2[0] + bs / 2, p2[1] - 14, { clampW: c.w, size: 12, line: k.gold }); }
    }
    function report() {
      var oc = occ(), n = count(), u = unpaired(), s;
      if (mode === 'ion') s = (quiet ? fH(EL[Z].s + (charge ? (M.abs(charge) > 1 ? M.abs(charge) : '') + (charge > 0 ? '+' : '-') : '')) + ': ' + n + ' electrons.' : '<b>' + fH(EL[Z].s + (M.abs(charge) > 1 ? M.abs(charge) : '') + (charge > 0 ? '+' : '-')) + '</b>: ' + cfgText(oc, true) + '. ' + (charge > 0 ? 'The ' + charge + ' electron' + (charge === 1 ? '' : 's') + ' leave from the highest shell first (4s before 3d), even though 4s filled first.' : 'The extra electrons go where the neutral atom would put its next ones.') + ' Unpaired: ' + u + ' (' + (u ? 'paramagnetic' : 'diamagnetic') + ').');
      else if (S.learner) { var notes = rules(); s = n + ' electron' + (n === 1 ? '' : 's') + ' placed. ' + (notes.length ? '<span class="chv-no">' + notes[0] + '</span>' + (notes[1] ? ' ' + notes[1] : '') : '<span class="chv-ok">This diagram follows the Aufbau principle, Pauli\'s rule and Hund\'s rule.</span>' + (exc && n === Z ? ' (Real ' + EL[Z].name.toLowerCase() + ' differs: ' + cfgStr(Z, 0, { html: true, short: true }) + '.)' : '')); F.done(!notes.length); }
      else s = quiet ? n + ' electron' + (n === 1 ? '' : 's') + ' placed.' : n + ' electron' + (n === 1 ? '' : 's') + ': ' + cfgText(oc, true) + (n >= Z ? ' = ' + EL[Z].name.toLowerCase() : '') + '. Unpaired electrons: ' + u + ' (' + (u ? 'paramagnetic' : 'diamagnetic') + ').' + (exc && S.step === Z + 1 ? ' <b>' + EL[Z].name + ' breaks the pattern:</b> one 4s electron moves into 3d (' + cfgStr(Z, 0, { short: true, html: true }) + '), measured from its spectrum.' : exc && S.step === Z ? ' Step once more to see the real ground state.' : '');
      if (mode === 'qn' && S.pick && !quiet && c.w >= 560) { var q = S.pick.q; s += ' Selected electron: <b>n = ' + q.n + ', l = ' + q.l + ' (' + LNAME[q.l] + '), mₗ = ' + q.ml + ', mₛ = ' + (S.pick.up ? '+½' : '−½') + '</b>.'; }
      F.say(s); F.setAlt('Orbital diagram for ' + (mode === 'ion' ? 'an ion of ' : '') + EL[Z].name.toLowerCase() + ': boxes for each orbital, drawn by energy, with up and down arrows for electrons.');
    }
    // controls
    if (F.edit && !S.learner && mode !== 'qn') {
      btn(F.ctl, 'Empty', function () { if (mode === 'ion') { setStep(exc ? Z + 1 : Z); S.removed = 0; } else setStep(0); report(); draw(); });
      btn(F.ctl, mode === 'ion' ? (charge > 0 ? 'Remove one electron' : 'Add one electron') : 'Step: add one electron', function () {
        if (mode === 'ion') { if (S.removed < M.abs(charge)) { S.removed++; ionStep(); } } else setStep(S.step + 1); report(); draw(); }, 'pri');
      btn(F.ctl, mode === 'ion' ? 'All the way' : 'Fill all', function () { if (mode === 'ion') { S.removed = M.abs(charge); finalIon(); } else setStep(Z + (exc ? 1 : 0)); report(); draw(); });
    }
    if (S.learner) btn(F.ctl, 'Clear', function () { setStep(0); report(); draw(); });
    function ionStep() { // remove (or add) one electron at a time, highest n first
      if (charge > 0) { var best = null; orbs.forEach(function (q) { if (q.up + q.dn) { if (!best || q.n > best.n || (q.n === best.n && q.l > best.l) || (q.n === best.n && q.l === best.l && q.dn && !best.dn)) best = q; } }); if (best) { if (best.dn) best.dn = 0; else best.up = 0; } }
      else { for (var i = 0; i < seq.length; i++) { var sq = seq[i]; if (!sq[0][sq[1]]) { sq[0][sq[1]] = 1; break; } } }
    }
    var H = keyNav(c, {
      tap: function (px, py) { var i = hit(px, py); if (i < 0) return; S.sel = i; tapBox(i, px); },
      key: function (e) { if (!orbs.length) return false; if (S.sel < 0) S.sel = 0; var q = orbs[S.sel]; if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var dir = e.key === 'ArrowRight' ? 1 : -1; S.sel = clamp(S.sel + dir, 0, orbs.length - 1); draw(); return true; } if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { var tgt = q.si + (e.key === 'ArrowUp' ? 1 : -1), cand = orbs.findIndex(function (x) { return x.si === tgt; }); if (cand >= 0) S.sel = cand; draw(); return true; } if (e.key === 'Enter' || e.key === ' ') { tapBox(S.sel, null); return true; } return false; },
      change: function () { draw(); }
    });
    function hit(px, py) { var bs = Lg.bs; for (var i = 0; i < orbs.length; i++) { var p = boxXY(orbs[i]); if (px >= p[0] && px <= p[0] + bs && py >= p[1] && py <= p[1] + bs) return i; } return -1; }
    function tapBox(i, px) {
      var q = orbs[i];
      if (S.learner) { if (!q.up && !q.dn) q.up = 1; else if (q.up && !q.dn) q.dn = 1; else if (q.up && q.dn) { q.up = 0; } else q.dn = 0; report(); draw(); return; }
      if (mode === 'qn') { var p = boxXY(q), up = px == null ? (S.pick && S.pick.q === q ? !S.pick.up : true) : px < p[0] + Lg.bs / 2; if ((up && q.up) || (!up && q.dn)) S.pick = { q: q, up: up }; else if (q.up) S.pick = { q: q, up: true }; report(); draw(); }
    }
    if (S.learner) setStep(0); else if (mode === 'ion') { setStep(exc ? Z + 1 : Z); if (num(o.step, -1) >= 0) { } } else setStep(o.step != null ? num(o.step, Z) : Z + (exc ? 1 : 0));
    if (mode === 'ion' && (!F.edit || o.step === 'end')) { S.removed = M.abs(charge); finalIon(); }
    if (mode === 'qn') { var lastE = null; orbs.forEach(function (q) { if (q.up) lastE = q; }); if (lastE) S.pick = { q: lastE, up: !lastE.dn ? true : false }; if (lastE && lastE.dn) S.pick.up = false; }
    c.cv.setAttribute('aria-label', 'Orbital diagram. Arrow keys move between boxes' + (S.learner ? '; Enter or Space adds or removes an electron.' : mode === 'qn' ? '; Enter picks an electron to see its quantum numbers.' : '.'));
    c.onResize(function () { layout(); draw(); }); V.onTheme(draw); layout(); report(); draw();
    return { draw: draw };
  });
  // crystal field: place d electrons one at a time in the cheapest spot (an empty orbital costs its energy; pairing in a
  // half-filled one costs its energy plus the pairing energy P). Square-planar energies (units of Δ) from the angular
  // overlap model: x²−y² 1.228, xy 0.228, z² −0.428, xz and yz −0.514.
  var GEO = { oct: { name: 'octahedral', orbs: [['xy', -0.4], ['xz', -0.4], ['yz', -0.4], ['z²', 0.6], ['x²−y²', 0.6]], sets: [['t', '2g'], ['e', 'g']] }, tet: { name: 'tetrahedral', orbs: [['z²', -0.6], ['x²−y²', -0.6], ['xy', 0.4], ['xz', 0.4], ['yz', 0.4]], sets: [['e', ''], ['t', '2']] }, sqpl: { name: 'square planar', orbs: [['xz', -0.514], ['yz', -0.514], ['z²', -0.428], ['xy', 0.228], ['x²−y²', 1.228]] } };
  function fieldFill(geo, d, delta, P) { var os = GEO[geo].orbs.map(function (q) { return { n: q[0], E: q[1] * delta, e: 0 }; }); for (var i = 0; i < d; i++) { var best = null, bc = 1e9; os.forEach(function (q) { if (q.e >= 2) return; var cost = q.E + (q.e === 1 ? P : 0) + 1e-6 * os.indexOf(q); if (cost < bc) { bc = cost; best = q; } }); best.e++; } return os; }
  function crystalField(F, o) {
    var S = { d: clamp(M.round(num(o.d, 6)), 0, 10), geo: GEO[o.geometry] ? o.geometry : 'oct', delta: num(o.delta, 240), P: num(o.pairing, 200), spin: o.spin }, quiet = F.quiet;
    var c = F.canvas({ aspect: 1.9, min: 260, max: 360, narrow: 1.0 });
    function arrangement() { // high spin: maximize unpaired (Hund across the whole set); low spin: fill lowest first
      if (S.spin === 'high') { var os = GEO[S.geo].orbs.map(function (q) { return { n: q[0], E: q[1] * S.delta, e: 0 }; }), sorted = os.slice().sort(function (a, b) { return a.E - b.E; }); for (var i = 0; i < S.d; i++) sorted[i < 5 ? i : i - 5].e++; return os; }
      if (S.spin === 'low') return fieldFill(S.geo, S.d, S.delta, 1e-9);
      return fieldFill(S.geo, S.d, S.delta, S.P);
    }
    function lam() { return 119627 / S.delta; } // λ (nm) = h c N_A / Δ, with Δ in kJ/mol
    function draw() {
      var ctx = c.ctx, k = pal(), os = arrangement(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var wide = c.w > 560, x0 = 40, x1 = wide ? c.w * 0.62 : c.w - 20, Emin = -0.65, Emax = 1.3, yE = function (E) { return c.h - 34 - (E / S.delta - Emin) / (Emax - Emin) * (c.h - 70); };
      // free-ion d level
      var yf = yE(0), bs = M.min(30, (x1 - x0) / 11); txt(ctx, 'free ion', x0 + bs * 2.5, yf - bs / 2 - 10, { size: 11, align: 'center' });
      for (var i = 0; i < 5; i++) { ctx.strokeStyle = k.muted; ctx.lineWidth = 1.2; ctx.strokeRect(x0 + i * bs, yf - bs / 2, bs, bs); }
      // split levels: group orbitals of equal energy
      var groups = []; os.forEach(function (q) { var g = groups.find(function (G) { return M.abs(G.E - q.E) < 1e-9; }); if (!g) groups.push(g = { E: q.E, os: [] }); g.os.push(q); });
      var xs = x0 + bs * 7.5;
      groups.forEach(function (g) { var y = yE(g.E), w = g.os.length * bs, xg = xs; ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = k.grid; ctx.beginPath(); ctx.moveTo(x0 + bs * 5, yf); ctx.lineTo(xg, y); ctx.stroke(); ctx.restore();
        g.os.forEach(function (q, j) { var bx = xg + j * bs, by = y - bs / 2; ctx.strokeStyle = k.ink; ctx.lineWidth = 1.3; ctx.strokeRect(bx, by, bs, bs); txt(ctx, (bs < 30 ? '' : 'd') + q.n, bx + bs / 2, by + bs + 8 + (bs < 30 ? (j % 2) * 10 : 0), { size: 9, align: 'center' }); if (q.e >= 1) { arr(ctx, bx + bs * 0.34, by, true, bs); } if (q.e === 2) arr(ctx, bx + bs * 0.66, by, false, bs); }); });
      function arr(ctx2, x, y, up, b) { ctx2.save(); ctx2.strokeStyle = ctx2.fillStyle = k.acc; ctx2.lineWidth = 2; var t = y + b * 0.18, bt = y + b * 0.82; ctx2.beginPath(); ctx2.moveTo(x, up ? bt : t); ctx2.lineTo(x, up ? t + 4 : bt - 4); ctx2.stroke(); ctx2.beginPath(); if (up) { ctx2.moveTo(x, t); ctx2.lineTo(x - 4, t + 6); ctx2.lineTo(x + 4, t + 6); } else { ctx2.moveTo(x, bt); ctx2.lineTo(x - 4, bt - 6); ctx2.lineTo(x + 4, bt - 6); } ctx2.closePath(); ctx2.fill(); ctx2.restore(); }
      // Δ bracket
      var Elo = M.min.apply(null, groups.map(function (g) { return g.E; })), Ehi = M.max.apply(null, groups.map(function (g) { return g.E; })), bxk = xs + 5.4 * bs;
      arrow(ctx, bxk, yE(Elo), bxk, yE(Ehi), k.gold, 2, 7); arrow(ctx, bxk, yE(Ehi), bxk, yE(Elo), k.gold, 2, 7); txt(ctx, 'Δ' + (S.geo === 'oct' ? 'o' : S.geo === 'tet' ? 't' : '') + (quiet ? '' : ' = ' + fm(S.delta, 0) + ' kJ/mol'), bxk + 8, (yE(Elo) + yE(Ehi)) / 2, { size: 12, bold: true, color: k.gold });
      if (GEO[S.geo].sets) [[0, Elo], [1, Ehi]].forEach(function (pr) { var L = GEO[S.geo].sets[pr[0]], ws = L[1] ? tw(ctx, L[1], 9, true) + 1 : 0, yy = yE(pr[1]); txt(ctx, L[0], xs - 6 - ws, yy, { size: 13, align: 'right', bold: true, color: k.ink }); if (L[1]) txt(ctx, L[1], xs - 6 - ws + 1, yy + 5, { size: 9, bold: true, color: k.ink }); });
      txt(ctx, GEO[S.geo].name + ' field', xs + bs * 2, 14, { size: 12, bold: true, align: 'center', color: k.ink });
      // color wheel: absorbed and seen
      if (wide && !quiet) { var cx = c.w * 0.83, cy = c.h * 0.5, R0 = M.min(c.w * 0.12, c.h * 0.32), L = lam(), an = colorName(L), comp = compColor(L);
        var order = ['red', 'orange', 'yellow', 'green', 'blue', 'violet']; order.forEach(function (nm2, i2) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R0, -PI / 2 + i2 * TAU / 6 - TAU / 12, -PI / 2 + (i2 + 1) * TAU / 6 - TAU / 12); ctx.closePath(); ctx.fillStyle = NAMED[nm2]; ctx.globalAlpha = nm2 === an || nm2 === comp ? 1 : 0.28; ctx.fill(); ctx.globalAlpha = 1; if (nm2 === an || nm2 === comp) { ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.stroke(); } });
        txt(ctx, an === 'ultraviolet' || an === 'infrared' ? 'absorbs ' + an : 'absorbs ' + an + ' (' + fm(L, 0) + ' nm)', cx, cy + R0 + 14, { size: 11, align: 'center', color: k.ink }); if (comp) txt(ctx, 'looks ' + comp, cx, cy + R0 + 29, { size: 11, align: 'center', bold: true, color: k.ink }); }
    }
    function report() {
      var os = arrangement(), u = os.filter(function (q) { return q.e === 1; }).length, L = lam(), an = colorName(L), comp = compColor(L), hs = S.spin ? S.spin : (S.delta > S.P ? 'low' : 'high');
      var lowE = os.slice().sort(function (a, b) { return a.E - b.E; });
      var s = 'd' + sup(S.d) + ' ion in a ' + GEO[S.geo].name + ' field. ' + (quiet ? '' : (S.geo === 'tet' ? 'Tetrahedral splitting is small, so these complexes are high spin. ' : (S.spin ? '' : 'Δ = ' + fm(S.delta, 0) + ' kJ/mol ' + (S.delta > S.P ? '>' : '<') + ' pairing energy ' + fm(S.P, 0) + ' kJ/mol, so ')) + '<b>' + hs + ' spin</b>: ' + u + ' unpaired electron' + (u === 1 ? '' : 's') + ' (' + (u ? 'paramagnetic' : 'diamagnetic') + '). Absorbs light near ' + fm(L, 0) + ' nm' + (comp ? ' (' + an + '), so it looks ' + comp + '.' : ' (' + an + ').'));
      F.say(s); F.setAlt('Crystal-field diagram: the five d orbitals of the free ion split into groups in a ' + GEO[S.geo].name + ' field, with ' + S.d + ' electrons placed in them.');
    }
    if (F.edit) {
      sl(F.ctl, { label: 'd electrons', min: 0, max: 10, step: 1, value: S.d, input: function (v) { S.d = v; draw(); report(); } });
      sl(F.ctl, { label: 'Splitting Δ (kJ/mol)', min: 100, max: 400, step: 5, value: S.delta, fmt: function (v) { return fm(v, 0); }, input: function (v) { S.delta = v; draw(); report(); } });
      seg(F.ctl, 'Geometry', [['oct', 'Octahedral'], ['tet', 'Tetrahedral'], ['sqpl', 'Square planar']], S.geo, function (v) { S.geo = v; draw(); report(); });
    }
    redraw(c, draw); draw(); report(); return { draw: draw };
  }

  // =====================================================================================================
  // ch-pes: options are documented at the top of this file
  var PES = { 1: [1.31], 2: [2.37], 3: [6.26, 0.52], 4: [11.5, 0.90], 5: [19.3, 1.36, 0.80], 6: [28.6, 1.72, 1.09], 7: [39.6, 2.45, 1.40], 8: [52.6, 3.12, 1.31], 9: [67.2, 3.88, 1.68], 10: [84.0, 4.68, 2.08],
    11: [104, 6.84, 3.67, 0.50], 12: [126, 9.07, 5.31, 0.74], 13: [151, 12.1, 7.79, 1.09, 0.58], 14: [178, 15.1, 10.3, 1.46, 0.79], 15: [208, 18.7, 13.5, 1.95, 1.01], 16: [239, 22.7, 16.5, 2.05, 1.00], 17: [273, 26.8, 20.2, 2.44, 1.25], 18: [309, 31.5, 24.1, 2.82, 1.52], 19: [347, 37.1, 29.1, 3.93, 2.38, 0.42], 20: [390, 42.7, 34.0, 4.65, 2.90, 0.59] };
  var PSUB = ['1s', '2s', '2p', '3s', '3p', '4s'];
  function pesPeaks(Z) { var cf = config(Z).occ; return (PES[Z] || []).map(function (E, i) { return { sub: PSUB[i], E: E, n: cf[PSUB[i]] || 0 }; }); }
  R('ch-pes', function (elx, o) {
    o = opt(o, { el: 'Na', compare: null, labels: true, axis: 'left-high', scale: 'log' });
    var e1 = el(o.el) || BYS.Na; if (e1.Z > 20) e1 = BYS.Ca; var e2 = el(o.compare); if (e2 && e2.Z > 20) e2 = null;
    var F = frame(elx, o, 'Photoelectron spectrum of ' + (F_q(o) ? 'an element' : e1.name)), quiet = F.quiet, S = { sel: -1, Z: e1.Z };
    function F_q(oo) { return !!(oo.quiet || oo.readout === false); }
    var c = F.canvas({ aspect: 2.0, min: 250, max: 360, narrow: 1.15 }), Ch = null;
    function peaksAll() { return pesPeaks(S.Z); }
    function makeChart() {
      var pk = peaksAll().concat(e2 ? pesPeaks(e2.Z) : []), mx = 0; pk.forEach(function (p) { mx = M.max(mx, p.E); });
      var rev = o.axis !== 'right-high';
      if (o.scale === 'broken') { // a broken axis: the 1s peak on its own short stretch, everything else linear from 0
        var others = pk.filter(function (p) { return p.sub !== '1s'; }), om = 0; others.forEach(function (p) { om = M.max(om, p.E); }); om = M.max(om * 1.15, 1);
        var e1s = pk.filter(function (p) { return p.sub === '1s'; }).map(function (p) { return p.E; }), lo = M.min.apply(null, e1s) * 0.85, hi = M.max.apply(null, e1s) * 1.15;
        Ch = chart(c, { x: [0, 1], y: [0, 1.38], ml: 18, yticks: false, xticks: false, grid: false, xl: 'Binding energy (MJ/mol)' });
        Ch.E = function (E) { var b = Ch.box(), W = b.x1 - b.x0, f; if (others.length === 0) f = (E - lo) / (hi - lo); else if (E >= lo) f = 0.75 + 0.25 * (E - lo) / (hi - lo); else f = 0.72 * E / om; f = clamp(f, 0, 1); return rev ? b.x1 - f * W : b.x0 + f * W; };
        Ch.brk = { lo: lo, hi: hi, om: om, others: others.length };
      } else {
        Ch = chart(c, { x: [0.1, M.pow(10, M.ceil(log10(mx * 1.3)))], xlog: true, xrev: rev, y: [0, 1.38], ml: 18, yticks: false, xl: 'Binding energy (MJ/mol), log scale', xf: function (v) { return fm(v, 2); } });
        Ch.E = function (E) { return Ch.X(E); };
      }
    }
    function draw() {
      makeChart(); var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); Ch.draw(ctx); var b = Ch.box();
      if (Ch.brk) { // tick labels for the broken axis
        var tk = function (E) { var x = Ch.E(E); ctx.strokeStyle = k.axis; ctx.beginPath(); ctx.moveTo(x, b.y1); ctx.lineTo(x, b.y1 + 4); ctx.stroke(); txt(ctx, fm(E, E < 10 ? 1 : 0), x, b.y1 + 11, { size: 10, align: 'center' }); };
        [0, Ch.brk.om / 2, Ch.brk.om / 1.15].forEach(function (E) { if (Ch.brk.others) tk(E); }); tk(Ch.brk.lo / 0.85);
        if (Ch.brk.others) { var xb = (Ch.E(Ch.brk.lo) + Ch.E(Ch.brk.om)) / 2; ctx.save(); ctx.fillStyle = k.bg; ctx.fillRect(xb - 5, b.y1 - 6, 10, 12); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xb - 6, b.y1 + 5); ctx.lineTo(xb - 2, b.y1 - 5); ctx.moveTo(xb + 2, b.y1 + 5); ctx.lineTo(xb + 6, b.y1 - 5); ctx.stroke(); ctx.restore(); }
      }
      txt(ctx, 'Relative number of electrons', b.x0 - 6, (b.y0 + b.y1) / 2, { size: 11, rot: -PI / 2, align: 'center', color: k.ink });
      function peaks(list, col, outline) {
        list.forEach(function (p, i) { var x = Ch.E(p.E), hgt = p.n / 6, y = Ch.Y(hgt), w = 7; ctx.save(); ctx.beginPath(); ctx.moveTo(x - w * 2.2, b.y1); ctx.bezierCurveTo(x - w * 0.9, b.y1, x - w * 0.7, y, x, y); ctx.bezierCurveTo(x + w * 0.7, y, x + w * 0.9, b.y1, x + w * 2.2, b.y1); if (outline) { ctx.setLineDash([5, 3]); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = rgba(col, S.sel === i ? 0.9 : 0.65); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore();
          if (!outline && o.labels !== false && !quiet) txt(ctx, p.sub, x, y - 10, { size: 11, bold: true, align: 'center', color: k.ink });
          if (!outline && S.sel === i) { var s = quiet ? p.n + ' electron' + (p.n === 1 ? '' : 's') : p.sub + ': ' + p.n + ' electron' + (p.n === 1 ? '' : 's') + ', ' + fm(p.E, 2) + ' MJ/mol'; pill(ctx, s, x, M.max(b.y0 + 12, y - 28), { clampW: c.w, size: 11, line: k.gold }); } });
      }
      if (e2) peaks(pesPeaks(e2.Z), k.blue, true);
      peaks(peaksAll(), k.acc, false);
      var lab = quiet ? 'Element ?' : EL[S.Z].name + (e2 ? ' (filled) and ' + e2.name.toLowerCase() + ' (dashed)' : '');
      if (e2 && !quiet && tw(ctx, lab, 12, true) > b.x1 - b.x0 - 16) { txt(ctx, EL[S.Z].name + ' (filled) and', b.x0 + 8, b.y0 + 10, { size: 12, bold: true, color: k.ink }); txt(ctx, e2.name.toLowerCase() + ' (dashed)', b.x0 + 8, b.y0 + 25, { size: 12, bold: true, color: k.ink }); } else txt(ctx, lab, b.x0 + 8, b.y0 + 10, { size: 12, bold: true, color: k.ink });
      if (H.focused() && S.sel >= 0) { var p2 = peaksAll()[S.sel]; focusRing(ctx, Ch.E(p2.E), Ch.Y(p2.n / 6), 12); }
    }
    function report() {
      var pk = peaksAll(), s = quiet ? 'A spectrum with ' + pk.length + ' peak' + (pk.length === 1 ? '' : 's') + '. Heights: ' + pk.map(function (p) { return p.n; }).join(', ') + ' (left to right, high to low binding energy).' : EL[S.Z].name + ': ' + pk.map(function (p) { return p.sub + ' ' + fm(p.E, 2) + ' MJ/mol (' + p.n + ' e⁻)'; }).join(', ') + '. Taller peaks mean more electrons, not more energy; the far-left peak comes from the electrons nearest the nucleus.' + (e2 ? ' Compared with ' + e2.name.toLowerCase() + ', ' + (e2.Z < S.Z ? 'every peak of ' + EL[S.Z].name.toLowerCase() + ' sits farther left, because its nucleus has more protons.' : 'every peak of ' + e2.name.toLowerCase() + ' sits farther left, because its nucleus has more protons.') : '');
      F.say(s); F.setAlt('Photoelectron spectrum with ' + pk.length + ' peaks of heights ' + pk.map(function (p) { return p.n; }).join(', ') + '.');
    }
    var H = keyNav(c, { tap: function (px, py) { var best = -1, bd = 26; peaksAll().forEach(function (p, i) { var d = M.abs(Ch.E(p.E) - px); if (d < bd) { bd = d; best = i; } }); S.sel = best; draw(); }, key: function (e) { var n = peaksAll().length; if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { var d = (e.key === 'ArrowRight') === (o.axis !== 'right-high') ? 1 : -1; S.sel = clamp((S.sel < 0 ? 0 : S.sel + d), 0, n - 1); draw(); return true; } return false; }, change: draw });
    c.cv.setAttribute('aria-label', 'Photoelectron spectrum. Left and right arrow keys select a peak.');
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  CH.PES = PES;

  // =====================================================================================================
  // ch-massspec: options are documented at the top of this file
  var ISO = { B: [[10.0129370, 19.9], [11.0093054, 80.1]], Ne: [[19.9924402, 90.48], [20.9938467, 0.27], [21.9913851, 9.25]], Mg: [[23.9850417, 78.99], [24.9858370, 10.00], [25.9825930, 11.01]], Si: [[27.9769265, 92.223], [28.9764947, 4.685], [29.9737701, 3.092]],
    Cl: [[34.9688527, 75.76], [36.9659026, 24.24]], Cu: [[62.9295975, 69.15], [64.9277897, 30.85]], Br: [[78.9183376, 50.69], [80.9162897, 49.31]], Zr: [[89.9046977, 51.45], [90.9056396, 11.22], [91.9050347, 17.15], [93.9063108, 17.38], [95.9082714, 2.80]] };
  R('ch-massspec', function (elx, o) {
    o = opt(o, { el: 'Cl', isotopes: null, norm: 'percent', avg: true, diatomic: false });
    var sym = ISO[o.el] ? o.el : 'Cl', iso = o.isotopes ? o.isotopes.map(function (q) { return [num(q.m, 1), num(q.ab, 0)]; }) : ISO[sym].slice(), quiet = !!(o.quiet || o.readout === false);
    if (o.diatomic) { var di = []; iso.forEach(function (a) { iso.forEach(function (b2) { var m = a[0] + b2[0], ab = a[1] * b2[1] / 100, f = di.find(function (x) { return M.abs(x[0] - m) < 0.5; }); if (f) f[1] += ab; else di.push([m, ab]); }); }); iso = di.sort(function (a, b2) { return a[0] - b2[0]; }); }
    var tot = 0, avg = 0; iso.forEach(function (q) { tot += q[1]; }); iso.forEach(function (q) { avg += q[0] * q[1] / tot; });
    var name = o.isotopes ? 'an element' : (o.diatomic ? fT(sym + '2') : EL[BYS[sym].Z].name);
    var F = frame(elx, o, 'Mass spectrum of ' + name), S = { f: F.edit ? lerpMid() : avg, drag: false };
    function lerpMid() { var lo = iso[0][0], hi = iso[iso.length - 1][0], tallest = iso.slice().sort(function (a, b) { return b[1] - a[1]; })[0][0]; return o.avg === false || !F.edit ? avg : tallest; }
    var c = F.canvas({ aspect: 1.8, min: 310, max: 420, narrow: 0.95 }), Ch;
    var mx = 0; iso.forEach(function (q) { mx = M.max(mx, q[1]); });
    function draw() {
      var ctx = c.ctx, k = pal(), lo = M.floor(iso[0][0]) - 1, hi = M.ceil(iso[iso.length - 1][0]) + 1, yMax = o.norm === 'tallest' ? 115 : M.min(110, M.ceil(mx / 10) * 10 + 12);
      Ch = chart(c, { x: [lo, hi], y: [0, yMax], mb: 130, xl: '', yl: o.norm === 'tallest' ? 'Relative abundance' : 'Abundance (%)', xt: hi - lo > 14 ? 2 : 1, yticks: !quiet });
      ctx.clearRect(0, 0, c.w, c.h); Ch.draw(ctx); var b = Ch.box();
      txt(ctx, 'Mass (u)', (b.x0 + b.x1) / 2, b.y1 + 26, { size: 12, align: 'center', bold: true, color: k.ink });
      var bw = M.max(6, M.min(22, (Ch.X(lo + 1) - Ch.X(lo)) * 0.35));
      iso.forEach(function (q) { var h = o.norm === 'tallest' ? q[1] / mx * 100 : q[1] / tot * 100, x = Ch.X(q[0]), y = Ch.Y(h); ctx.fillStyle = k.acc; rr(ctx, x - bw / 2, y, bw, b.y1 - y, 3); ctx.fill(); if (!quiet) txt(ctx, fm(h, h < 1 ? 2 : 1) + (o.norm === 'tallest' ? '' : '%'), x, y - 8, { size: 10, align: 'center', color: k.ink }); });
      // the balance beam
      var by = b.y1 + 62, tq = 0; iso.forEach(function (q) { tq += q[1] / tot * (q[0] - S.f); }); var fx = Ch.X(S.f), mdx = M.max(M.abs(Ch.X(lo + 0.3) - fx), M.abs(Ch.X(hi - 0.3) - fx), 1), amax = M.min(0.32, M.asin(M.min(1, 22 / mdx))), ang = clamp(tq * 0.5, -amax, amax), bal = M.abs(S.f - avg) < (hi - lo) * 0.004;
      if (bal) ang = 0;
      function bp(m) { var dx = Ch.X(m) - fx; return [fx + dx * M.cos(ang), by + dx * M.sin(ang)]; }
      var e0 = bp(lo + 0.3), e1 = bp(hi - 0.3); line(ctx, [e0, e1], k.dark ? '#c9b37a' : '#8a6d2b', 6);
      iso.forEach(function (q) { var p = bp(q[0]), wgt = M.sqrt(q[1] / tot) * 26 + 3; ctx.strokeStyle = k.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], p[1] + 8); ctx.stroke(); ctx.fillStyle = k.dark ? '#9aa5ad' : '#5c6670'; rr(ctx, p[0] - wgt / 2, p[1] + 8, wgt, wgt * 0.8, 3); ctx.fill(); });
      ctx.fillStyle = bal ? k.green : k.gold; ctx.beginPath(); ctx.moveTo(fx, by + 3); ctx.lineTo(fx - 11, by + 26); ctx.lineTo(fx + 11, by + 26); ctx.closePath(); ctx.fill();
      if (H.focused()) focusRing(ctx, fx, by + 16, 16);
      var bl = bal ? (quiet ? 'balanced' : 'balanced at ' + fm(S.f, 2) + ' u') : 'drag the triangle to balance the beam', blw = tw(ctx, bl, 11, bal) / 2 + 6; txt(ctx, bl, clamp(fx, blw, c.w - blw), c.h - 9, { size: 11, align: 'center', bold: bal, color: bal ? k.green : k.muted });
      F.done(bal && F.edit && o.avg !== false && !!o.task);
    }
    function report() { var s = quiet ? 'Isotope masses: ' + iso.map(function (q) { return fm(q[0], 2) + ' u'; }).join(', ') + '.' : name[0].toUpperCase() + name.slice(1) + ': ' + iso.map(function (q) { return fm(q[0], 3) + ' u (' + fm(q[1] / tot * 100, 2) + '%)'; }).join(', ') + '. Average atomic mass = Σ (mass × fraction) = <b>' + fm(avg, 3) + ' u</b>. No single atom has this mass; it is the balance point of the beam' + (iso.length === 2 ? ', closer to the more common isotope.' : '.'); F.say(s); F.setAlt('Mass spectrum with ' + iso.length + ' peaks, and a balance beam with weights at each isotope mass.'); }
    var H = hand(c, [{ get: function () { var b = Ch.box(); return [Ch.X(S.f), b.y1 + 78]; }, set: function (px) { S.f = clamp(Ch.x(px), iso[0][0] - 0.5, iso[iso.length - 1][0] + 0.5); if (M.abs(S.f - avg) < 0.06) S.f = avg; }, key: function (dx) { S.f = clamp(S.f + dx * 0.05, iso[0][0] - 0.5, iso[iso.length - 1][0] + 0.5); if (M.abs(S.f - avg) < 0.026) S.f = avg; } }], { change: draw, r: 30 });
    if (!F.edit) S.f = avg;
    c.cv.setAttribute('aria-label', 'Mass spectrum and balance beam. Left and right arrow keys move the balance point.');
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  CH.ISO = ISO;

  // =====================================================================================================
  // ch-coulomb: options are documented at the top of this file
  var IONR = { 'Li+': 76, 'Na+': 102, 'K+': 138, 'Rb+': 152, 'Cs+': 167, 'Be2+': 45, 'Mg2+': 72, 'Ca2+': 100, 'Sr2+': 118, 'Ba2+': 135, 'Al3+': 53.5, 'F-': 133, 'Cl-': 181, 'Br-': 196, 'I-': 220, 'O2-': 140, 'S2-': 184, 'Se2-': 198, 'Zn2+': 74, 'Ag+': 115, 'Cu2+': 73, 'Fe2+': 78, 'Fe3+': 64.5 };
  function ionKey(s) { var p = parseF(s), sym = Object.keys(p.atoms)[0]; return sym + (M.abs(p.charge) > 1 ? M.abs(p.charge) : '') + (p.charge > 0 ? '+' : '-'); }
  R('ch-coulomb', function (elx, o) {
    o = opt(o, { mode: 'atom', a: 'Na', b: 'Cl', show: ['zeff', 'bar', 'radius'], pairs: [['Na+', 'Cl-'], ['K+', 'Cl-'], ['Mg2+', 'O2-']], list: ['O2-', 'F-', 'Na+', 'Mg2+', 'Al3+'] });
    var mode = o.mode, F = frame(elx, o, mode === 'ions' ? 'Ion charges, ion sizes and lattice energy' : mode === 'isoelectronic' ? 'An isoelectronic series' : 'Nuclear charge, shielding and distance'), quiet = F.quiet;
    var c = F.canvas({ aspect: 2.0, min: 250, max: 380, narrow: 1.0 }), show = {}; (o.show || []).forEach(function (x) { show[x] = 1; });
    function atomInfo(s) { var e = el(s) || BYS.Na, sh = shells(e.Z), val2 = sh[sh.length - 1], core = e.Z - val2; return { e: e, sh: sh, val: val2, core: core, zeff: e.Z - core, r: e.rcov, f: (e.Z - core) / (e.rcov * e.rcov) * 1e4 }; }
    function drawAtom(ctx, I, cx, cy, R0, fmax, k) {
      var r = quiet ? R0 * 0.75 : R0 * I.r / 220, coreR = r * (I.sh.length > 1 ? 0.62 : 0.15);
      var g = ctx.createRadialGradient(cx, cy, 2, cx, cy, coreR); g.addColorStop(0, rgba(k.blue, 0.45)); g.addColorStop(1, rgba(k.blue, 0.15)); if (I.core) { ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = k.grid; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
      for (var i = 0; i < I.val; i++) { var a = -PI / 2 + i * TAU / I.val; ball(ctx, cx + r * M.cos(a), cy + r * M.sin(a), 4.5, 'e', { color: k.blue }); }
      ball(ctx, cx, cy, M.max(7, M.min(13, 5 + I.e.Z * 0.35)), 'p', { color: '#e8590c' }); txt(ctx, '+' + I.e.Z, cx, cy, { size: 10, bold: true, align: 'center', color: '#fff' });
      txt(ctx, I.e.s, cx, cy - r - 14, { size: 14, bold: true, align: 'center', color: k.ink });
      if (I.core && tw(ctx, I.core + ' core e⁻', 10) < coreR * 1.7) txt(ctx, I.core + ' core e⁻', cx, cy + coreR * 0.55 + 8, { size: 10, align: 'center', color: k.ink });
      if (!quiet) { var lines = []; if (show.zeff) lines.push('Zeff ≈ ' + I.e.Z + ' − ' + I.core + ' = +' + I.zeff); if (show.radius) lines.push('radius ' + I.r + ' pm'); lines.forEach(function (s, j) { txt(ctx, s, cx, cy + R0 + 12 + j * 15, { size: 11, align: 'center' }); });
        if (show.bar) { var bwid = M.min(140, R0 * 1.6), bx = cx - bwid / 2, byy = cy + R0 + 12 + lines.length * 15 + 4; ctx.fillStyle = k.grid; rr(ctx, bx, byy, bwid, 9, 4); ctx.fill(); ctx.fillStyle = k.acc; rr(ctx, bx, byy, bwid * I.f / fmax, 9, 4); ctx.fill(); txt(ctx, c.w < 560 ? 'pull on outer e⁻' : 'pull on an outer electron', cx, byy + 18, { size: 10, align: 'center' }); } }
    }
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      if (mode === 'atom') { var A = atomInfo(o.a), B = atomInfo(o.b), fmax = M.max(A.f, B.f), R0 = M.min(c.w * 0.2, c.h * 0.3); drawAtom(ctx, A, c.w * 0.27, c.h * 0.4, R0, fmax, k); drawAtom(ctx, B, c.w * 0.73, c.h * 0.4, R0, fmax, k); }
      else if (mode === 'ions') {
        var prs = o.pairs, n = prs.length, cw = c.w / n, vals = prs.map(function (p) { var q1 = parseF(p[0]).charge, q2 = parseF(p[1]).charge, r1 = IONR[ionKey(p[0])] || 100, r2 = IONR[ionKey(p[1])] || 150; return { q: M.abs(q1 * q2), r1: r1, r2: r2, d: r1 + r2, v: M.abs(q1 * q2) / (r1 + r2) }; }), vmax = M.max.apply(null, vals.map(function (v) { return v.v; }));
        var sc = M.min(cw * 0.42, c.h * 0.36) / 400;
        prs.forEach(function (p, i) { var v = vals[i], cx = cw * (i + 0.5), cy = c.h * 0.38, r1 = quiet ? 110 * sc * 1.2 : v.r1 * sc * 1.2, r2 = quiet ? 110 * sc * 1.2 : v.r2 * sc * 1.2, sym1 = Object.keys(parseF(p[0]).atoms)[0], sym2 = Object.keys(parseF(p[1]).atoms)[0];
          ball(ctx, cx - r2 * 0.0 - r1, cy, r1, sym1, { charge: parseF(p[0]).charge }); ball(ctx, cx + r2, cy, r2, sym2, { charge: parseF(p[1]).charge });
          fDraw(ctx, p[0], cx - r1, cy + M.max(r1, r2) + 14, { size: 13, align: 'center' }); fDraw(ctx, p[1], cx + r2, cy + M.max(r1, r2) + 14, { size: 13, align: 'center' });
          if (!quiet) { if (cw < 190) { txt(ctx, 'q₁q₂ = ' + v.q, cx, cy + M.max(r1, r2) + 34, { size: 11, align: 'center' }); txt(ctx, 'd = ' + fm(v.d, 1) + ' pm', cx, cy + M.max(r1, r2) + 49, { size: 11, align: 'center' }); } else txt(ctx, 'q₁q₂ = ' + v.q + ' · d = ' + fm(v.d, 1) + ' pm', cx, cy + M.max(r1, r2) + 34, { size: 11, align: 'center' }); var bw2 = M.min(120, cw * 0.8); ctx.fillStyle = k.grid; rr(ctx, cx - bw2 / 2, c.h - 40, bw2, 10, 4); ctx.fill(); ctx.fillStyle = k.acc; rr(ctx, cx - bw2 / 2, c.h - 40, bw2 * v.v / vmax, 10, 4); ctx.fill(); txt(ctx, '∝ q₁q₂ / d', cx, c.h - 20, { size: 10, align: 'center' }); } });
      } else {
        var L = o.list, nn = L.length, cw2 = c.w / nn, rTop = 70; L.forEach(function (s3) { rTop = M.max(rTop, quiet ? 100 : (IONR[ionKey(s3)] || 0)); }); var sc2 = M.min(cw2 * 0.45, c.h * 0.3) / M.max(140, rTop);
        L.forEach(function (s, i) { var key = ionKey(s), rr2 = quiet ? 100 * sc2 : (IONR[key] || 0) * sc2, p = parseF(s), sym = Object.keys(p.atoms)[0], cx = cw2 * (i + 0.5), cy = c.h * 0.42;
          if (!IONR[key] && !quiet) { ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = k.muted; ctx.beginPath(); ctx.arc(cx, cy, 70 * sc2, 0, TAU); ctx.stroke(); ctx.restore(); txt(ctx, 'no ionic radius', cx, cy, { size: 9, align: 'center' }); }
          else ball(ctx, cx, cy, M.max(6, rr2), sym, { charge: p.charge, alpha: 0.9 });
          var yB = c.h * 0.42 + rTop * sc2; fDraw(ctx, s, cx, yB + 16, { size: 13, align: 'center' }); var two = cw2 < 100, yz = yB + 34; if (two) { txt(ctx, 'Z = ' + BYS[sym].Z, cx, yz, { size: 10, align: 'center' }); txt(ctx, (BYS[sym].Z - p.charge) + ' e⁻', cx, yz + 13, { size: 10, align: 'center' }); } else txt(ctx, 'Z = ' + BYS[sym].Z + ' · ' + (BYS[sym].Z - p.charge) + ' e⁻', cx, yz, { size: 10, align: 'center' }); if (!quiet && IONR[key]) txt(ctx, fm(IONR[key], 1) + ' pm', cx, yz + (two ? 29 : 15), { size: 10, align: 'center', color: k.ink, bold: true }); });
      }
    }
    function report() {
      var s;
      if (mode === 'atom') { var A = atomInfo(o.a), B = atomInfo(o.b); s = quiet ? 'Two atoms: ' + A.e.s + ' (' + A.sh.join(', ') + ') and ' + B.e.s + ' (' + B.sh.join(', ') + ').' : A.e.s + ': <i>Z</i><sub>eff</sub> ≈ ' + A.e.Z + ' − ' + A.core + ' = +' + A.zeff + ', radius ' + A.r + ' pm. ' + B.e.s + ': <i>Z</i><sub>eff</sub> ≈ ' + B.e.Z + ' − ' + B.core + ' = +' + B.zeff + ', radius ' + B.r + ' pm. Inner electrons shield the outer ones; electrons in the same shell shield each other poorly. A larger <i>Z</i><sub>eff</sub> at a smaller distance holds the outer electrons more tightly (Coulomb\'s law, F ∝ q₁q₂/r²).'; }
      else if (mode === 'ions') s = quiet ? 'Pairs of ions: ' + o.pairs.map(function (p) { return fH(p[0]) + fH(p[1]); }).join(', ') + '.' : 'Lattice energy grows with q₁q₂/d, where d is the distance between ion centers. ' + o.pairs.map(function (p) { var q = M.abs(parseF(p[0]).charge * parseF(p[1]).charge), d = (IONR[ionKey(p[0])] || 0) + (IONR[ionKey(p[1])] || 0); return fH(p[0]) + fH(p[1]) + ': ' + q + '/' + fm(d, 1) + ' pm'; }).join('; ') + '. Doubling both charges multiplies q₁q₂ by 4, which beats any change in size.';
      else { var ecs = o.list.map(function (x) { var pp = parseF(x); return BYS[Object.keys(pp.atoms)[0]].Z - pp.charge; }), same = ecs.every(function (v) { return v === ecs[0]; }), ne = same ? ecs[0] + ' electrons' : 'different numbers of electrons'; s = quiet ? 'Ions with ' + (same ? ecs[0] + ' electrons each' : ne) + '.' : (same ? 'Every ion here has ' + ne + '.' : 'These ions do not all have the same number of electrons, so this is not an isoelectronic series.') + ' As Z rises, the same electrons feel a stronger pull and the ion shrinks: ' + o.list.filter(function (x) { return IONR[ionKey(x)]; }).map(function (x) { return fH(x) + ' ' + fm(IONR[ionKey(x)], 1) + ' pm'; }).join(', ') + '.'; }
      F.say(s); F.setAlt(mode === 'atom' ? 'Two atoms drawn to scale with nuclear charge, core electrons and outer electrons.' : mode === 'ions' ? 'Pairs of touching ions drawn to scale.' : 'An isoelectronic series of ions drawn to scale.');
    }
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  CH.IONR = IONR;

  // =====================================================================================================
  // The Lewis library shared by ch-lewis and ch-vsepr. Atoms: [symbol, x, y, lone pairs, single electrons]; x, y in bond
  // lengths (y down). Bonds: [i, j, order]. q: the species' charge. res: other resonance forms (bond orders and lone
  // pairs that change). alt: a structure that lowers formal charges with an expanded octet (shown on request).
  // Formal charge = valence electrons − (2 × lone pairs + single electrons) − bonds; every structure is checked by the tests.
  function ring4(c, lp, X, xl) { return [[c, 0, 0, lp], [X, 0, -1, xl], [X, 1, 0, xl], [X, 0, 1, xl], [X, -1, 0, xl]]; }
  var LEW = {
    H2: { a: [['H', -0.5, 0, 0], ['H', 0.5, 0, 0]], b: [[0, 1, 1]] },
    F2: { a: [['F', -0.5, 0, 3], ['F', 0.5, 0, 3]], b: [[0, 1, 1]] }, Cl2: { a: [['Cl', -0.5, 0, 3], ['Cl', 0.5, 0, 3]], b: [[0, 1, 1]] }, Br2: { a: [['Br', -0.5, 0, 3], ['Br', 0.5, 0, 3]], b: [[0, 1, 1]] }, I2: { a: [['I', -0.5, 0, 3], ['I', 0.5, 0, 3]], b: [[0, 1, 1]] },
    O2: { a: [['O', -0.5, 0, 2], ['O', 0.5, 0, 2]], b: [[0, 1, 2]] }, N2: { a: [['N', -0.5, 0, 1], ['N', 0.5, 0, 1]], b: [[0, 1, 3]] },
    HF: { a: [['H', -0.5, 0, 0], ['F', 0.5, 0, 3]], b: [[0, 1, 1]] }, HCl: { a: [['H', -0.5, 0, 0], ['Cl', 0.5, 0, 3]], b: [[0, 1, 1]] }, HBr: { a: [['H', -0.5, 0, 0], ['Br', 0.5, 0, 3]], b: [[0, 1, 1]] }, HI: { a: [['H', -0.5, 0, 0], ['I', 0.5, 0, 3]], b: [[0, 1, 1]] },
    CO: { a: [['C', -0.5, 0, 1], ['O', 0.5, 0, 1]], b: [[0, 1, 3]] }, NO: { a: [['N', -0.5, 0, 1, 1], ['O', 0.5, 0, 2]], b: [[0, 1, 2]] },
    H2O: { a: [['O', 0, 0, 2], ['H', -0.8, 0.6, 0], ['H', 0.8, 0.6, 0]], b: [[0, 1, 1], [0, 2, 1]] }, H2S: { a: [['S', 0, 0, 2], ['H', -0.8, 0.6, 0], ['H', 0.8, 0.6, 0]], b: [[0, 1, 1], [0, 2, 1]] },
    NH3: { a: [['N', 0, 0, 1], ['H', -0.9, 0.5, 0], ['H', 0.9, 0.5, 0], ['H', 0, 1, 0]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] }, PCl3: { a: [['P', 0, 0, 1], ['Cl', -0.9, 0.5, 3], ['Cl', 0.9, 0.5, 3], ['Cl', 0, 1, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] }, NF3: { a: [['N', 0, 0, 1], ['F', -0.9, 0.5, 3], ['F', 0.9, 0.5, 3], ['F', 0, 1, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
    CH4: { a: ring4('C', 0, 'H', 0), b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] }, CCl4: { a: ring4('C', 0, 'Cl', 3), b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] }, SiH4: { a: ring4('Si', 0, 'H', 0), b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
    CH3Cl: { a: [['C', 0, 0, 0], ['H', 0, -1, 0], ['Cl', 1, 0, 3], ['H', 0, 1, 0], ['H', -1, 0, 0]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] }, CH2Cl2: { a: [['C', 0, 0, 0], ['H', 0, -1, 0], ['Cl', 1, 0, 3], ['H', 0, 1, 0], ['Cl', -1, 0, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
    'NH4+': { a: ring4('N', 0, 'H', 0), b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], q: 1 },
    'H3O+': { a: [['O', 0, 0, 1], ['H', -0.9, 0.5, 0], ['H', 0.9, 0.5, 0], ['H', 0, -1, 0]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]], q: 1 },
    'OH-': { a: [['O', 0, 0, 3], ['H', 1, 0, 0]], b: [[0, 1, 1]], q: -1 }, 'CN-': { a: [['C', -0.5, 0, 1], ['N', 0.5, 0, 1]], b: [[0, 1, 3]], q: -1 },
    CO2: { a: [['O', -1, 0, 2], ['C', 0, 0, 0], ['O', 1, 0, 2]], b: [[0, 1, 2], [1, 2, 2]] }, HCN: { a: [['H', -1, 0, 0], ['C', 0, 0, 0], ['N', 1, 0, 1]], b: [[0, 1, 1], [1, 2, 3]] },
    BeCl2: { a: [['Cl', -1, 0, 3], ['Be', 0, 0, 0], ['Cl', 1, 0, 3]], b: [[0, 1, 1], [1, 2, 1]] },
    H2CO: { a: [['C', 0, 0, 0], ['O', 0, -1, 2], ['H', -0.87, 0.5, 0], ['H', 0.87, 0.5, 0]], b: [[0, 1, 2], [0, 2, 1], [0, 3, 1]] },
    BF3: { a: [['B', 0, 0, 0], ['F', 0, -1, 3], ['F', -0.87, 0.5, 3], ['F', 0.87, 0.5, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] }, BCl3: { a: [['B', 0, 0, 0], ['Cl', 0, -1, 3], ['Cl', -0.87, 0.5, 3], ['Cl', 0.87, 0.5, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
    C2H4: { a: [['C', -0.5, 0, 0], ['C', 0.5, 0, 0], ['H', -1, -0.85, 0], ['H', -1, 0.85, 0], ['H', 1, -0.85, 0], ['H', 1, 0.85, 0]], b: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]] },
    C2H2: { a: [['H', -1.5, 0, 0], ['C', -0.5, 0, 0], ['C', 0.5, 0, 0], ['H', 1.5, 0, 0]], b: [[0, 1, 1], [1, 2, 3], [2, 3, 1]] },
    C2H6: { a: [['C', -0.5, 0, 0], ['C', 0.5, 0, 0], ['H', -0.5, -1, 0], ['H', -1.5, 0, 0], ['H', -0.5, 1, 0], ['H', 0.5, -1, 0], ['H', 1.5, 0, 0], ['H', 0.5, 1, 0]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1], [1, 6, 1], [1, 7, 1]] },
    CH3OH: { a: [['C', 0, 0, 0], ['O', 1, 0, 2], ['H', 1.6, 0.75, 0], ['H', 0, -1, 0], ['H', -1, 0, 0], ['H', 0, 1, 0]], b: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1]] },
    CH3COOH: { a: [['C', -1, 0, 0], ['C', 0, 0, 0], ['O', 0.6, -0.8, 2], ['O', 0.8, 0.6, 2], ['H', 1.75, 0.45, 0], ['H', -1, -1, 0], ['H', -2, 0, 0], ['H', -1, 1, 0]], b: [[0, 1, 1], [1, 2, 2], [1, 3, 1], [3, 4, 1], [0, 5, 1], [0, 6, 1], [0, 7, 1]] },
    'CH3COO-': { a: [['C', -1, 0, 0], ['C', 0, 0, 0], ['O', 0.6, -0.8, 2], ['O', 0.6, 0.8, 3], ['H', -1, -1, 0], ['H', -2, 0, 0], ['H', -1, 1, 0]], b: [[0, 1, 1], [1, 2, 2], [1, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 1]], q: -1, res: [{ b: { '1-2': 1, '1-3': 2 }, lp: { 2: 3, 3: 2 } }] },
    'NO3-': { a: [['N', 0, 0, 0], ['O', 0, -1, 2], ['O', -0.87, 0.5, 3], ['O', 0.87, 0.5, 3]], b: [[0, 1, 2], [0, 2, 1], [0, 3, 1]], q: -1, res: [{ b: { '0-1': 1, '0-2': 2 }, lp: { 1: 3, 2: 2 } }, { b: { '0-1': 1, '0-3': 2 }, lp: { 1: 3, 3: 2 } }] },
    'CO3^2-': { a: [['C', 0, 0, 0], ['O', 0, -1, 2], ['O', -0.87, 0.5, 3], ['O', 0.87, 0.5, 3]], b: [[0, 1, 2], [0, 2, 1], [0, 3, 1]], q: -2, res: [{ b: { '0-1': 1, '0-2': 2 }, lp: { 1: 3, 2: 2 } }, { b: { '0-1': 1, '0-3': 2 }, lp: { 1: 3, 3: 2 } }] },
    'NO2-': { a: [['N', 0, 0, 1], ['O', -0.87, 0.5, 2], ['O', 0.87, 0.5, 3]], b: [[0, 1, 2], [0, 2, 1]], q: -1, res: [{ b: { '0-1': 1, '0-2': 2 }, lp: { 1: 3, 2: 2 } }] },
    O3: { a: [['O', 0, 0, 1], ['O', -0.87, 0.5, 2], ['O', 0.87, 0.5, 3]], b: [[0, 1, 2], [0, 2, 1]], res: [{ b: { '0-1': 1, '0-2': 2 }, lp: { 1: 3, 2: 2 } }] },
    SO2: { a: [['S', 0, 0, 1], ['O', -0.87, 0.5, 2], ['O', 0.87, 0.5, 3]], b: [[0, 1, 2], [0, 2, 1]], res: [{ b: { '0-1': 1, '0-2': 2 }, lp: { 1: 3, 2: 2 } }], alt: { b: { '0-2': 2 }, lp: { 2: 2 } } },
    SO3: { a: [['S', 0, 0, 0], ['O', 0, -1, 2], ['O', -0.87, 0.5, 3], ['O', 0.87, 0.5, 3]], b: [[0, 1, 2], [0, 2, 1], [0, 3, 1]], res: [{ b: { '0-1': 1, '0-2': 2 }, lp: { 1: 3, 2: 2 } }, { b: { '0-1': 1, '0-3': 2 }, lp: { 1: 3, 3: 2 } }], alt: { b: { '0-2': 2, '0-3': 2 }, lp: { 2: 2, 3: 2 } } },
    NO2: { a: [['N', 0, 0, 0, 1], ['O', -0.87, 0.5, 2], ['O', 0.87, 0.5, 3]], b: [[0, 1, 2], [0, 2, 1]], res: [{ b: { '0-1': 1, '0-2': 2 }, lp: { 1: 3, 2: 2 } }] },
    'SO4^2-': { a: ring4('S', 0, 'O', 3), b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], q: -2, alt: { b: { '0-1': 2, '0-3': 2 }, lp: { 1: 2, 3: 2 } } },
    'PO4^3-': { a: ring4('P', 0, 'O', 3), b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], q: -3, alt: { b: { '0-1': 2 }, lp: { 1: 2 } } },
    'ClO4-': { a: ring4('Cl', 0, 'O', 3), b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], q: -1, alt: { b: { '0-1': 2, '0-2': 2, '0-3': 2 }, lp: { 1: 2, 2: 2, 3: 2 } } },
    HClO: { a: [['O', 0, 0, 2], ['H', -0.8, 0.6, 0], ['Cl', 0.95, 0.35, 3]], b: [[0, 1, 1], [0, 2, 1]] },
    HClO2: { a: [['Cl', 0, 0, 2], ['O', -1, 0, 2], ['H', -1.6, 0.75, 0], ['O', 0.8, 0.6, 3]], b: [[0, 1, 1], [1, 2, 1], [0, 3, 1]], alt: { b: { '0-3': 2 }, lp: { 3: 2 } } },
    HClO3: { a: [['Cl', 0, 0, 1], ['O', -1, 0, 2], ['H', -1.6, 0.75, 0], ['O', 0.7, -0.75, 3], ['O', 0.7, 0.75, 3]], b: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 4, 1]], alt: { b: { '0-3': 2, '0-4': 2 }, lp: { 3: 2, 4: 2 } } },
    HClO4: { a: [['Cl', 0, 0, 0], ['O', -1, 0, 2], ['H', -1.6, 0.75, 0], ['O', 0, -1, 3], ['O', 1, 0, 3], ['O', 0, 1, 3]], b: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1]], alt: { b: { '0-3': 2, '0-4': 2, '0-5': 2 }, lp: { 3: 2, 4: 2, 5: 2 } } },
    HNO3: { a: [['N', 0, 0, 0], ['O', -1, 0, 2], ['H', -1.6, 0.75, 0], ['O', 0.6, -0.8, 2], ['O', 0.6, 0.8, 3]], b: [[0, 1, 1], [1, 2, 1], [0, 3, 2], [0, 4, 1]], res: [{ b: { '0-3': 1, '0-4': 2 }, lp: { 3: 3, 4: 2 } }] },
    H2SO4: { a: [['S', 0, 0, 0], ['O', -1, 0, 2], ['H', -1.6, 0.75, 0], ['O', 1, 0, 2], ['H', 1.6, -0.75, 0], ['O', 0, -1, 3], ['O', 0, 1, 3]], b: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [3, 4, 1], [0, 5, 1], [0, 6, 1]], alt: { b: { '0-5': 2, '0-6': 2 }, lp: { 5: 2, 6: 2 } } },
    'SCN-': { a: [['S', -1, 0, 2], ['C', 0, 0, 0], ['N', 1, 0, 2]], b: [[0, 1, 2], [1, 2, 2]], q: -1, res: [{ b: { '0-1': 1, '1-2': 3 }, lp: { 0: 3, 2: 1 } }] },
    PCl5: { a: [['P', 0, 0, 0], ['Cl', 0, -1.05, 3], ['Cl', 0, 1.05, 3], ['Cl', -1.05, 0, 3], ['Cl', 0.85, -0.5, 3], ['Cl', 0.85, 0.5, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1]] },
    SF6: { a: [['S', 0, 0, 0], ['F', 0, -1.05, 3], ['F', 0, 1.05, 3], ['F', -0.95, -0.5, 3], ['F', 0.95, -0.5, 3], ['F', -0.95, 0.5, 3], ['F', 0.95, 0.5, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 1]] },
    SF4: { a: [['S', 0, 0, 1], ['F', 0, -1.05, 3], ['F', 0, 1.05, 3], ['F', 0.85, -0.45, 3], ['F', 0.85, 0.45, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
    ClF3: { a: [['Cl', 0, 0, 2], ['F', 0, -1.05, 3], ['F', 0, 1.05, 3], ['F', 1.05, 0, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
    XeF2: { a: [['F', -1.05, 0, 3], ['Xe', 0, 0, 3], ['F', 1.05, 0, 3]], b: [[0, 1, 1], [1, 2, 1]] },
    XeF4: { a: [['Xe', 0, 0, 2], ['F', -1.05, 0, 3], ['F', 1.05, 0, 3], ['F', 0, -1.05, 3], ['F', 0, 1.05, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
    'I3-': { a: [['I', -1.1, 0, 3], ['I', 0, 0, 3], ['I', 1.1, 0, 3]], b: [[0, 1, 1], [1, 2, 1]], q: -1 },
    'ICl4-': { a: [['I', 0, 0, 2], ['Cl', -1.05, 0, 3], ['Cl', 1.05, 0, 3], ['Cl', 0, -1.05, 3], ['Cl', 0, 1.05, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], q: -1 },
    'BF4-': { a: ring4('B', 0, 'F', 3), b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], q: -1 },
    'H3NBF3': { a: [['N', -0.55, 0, 0], ['B', 0.55, 0, 0], ['H', -0.95, -0.9, 0], ['H', -1.5, 0.2, 0], ['H', -0.85, 0.95, 0], ['F', 0.95, -0.9, 3], ['F', 1.5, 0.2, 3], ['F', 0.85, 0.95, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1], [1, 6, 1], [1, 7, 1]] }
  };
  var LEWALIAS = { 'NH4': 'NH4+', 'H3O': 'H3O+', 'OH': 'OH-', 'NO3': 'NO3-', 'CO3': 'CO3^2-', 'SO4': 'SO4^2-', 'PO4': 'PO4^3-', 'CH3COO': 'CH3COO-', 'I3': 'I3-', 'ICl4': 'ICl4-', 'SCN': 'SCN-', 'CN': 'CN-', 'ClO4': 'ClO4-', 'NO2-': 'NO2-', 'HOCl': 'HClO', 'HCOH': 'H2CO', 'CH2O': 'H2CO', 'HC2H3O2': 'CH3COOH' };
  function lewKey(m) { if (LEW[m]) return m; var s = String(m).replace(/\s/g, ''); if (LEW[s]) return s; var sc = splitCharge(s), body = sc[0], q = sc[1], k2 = body + (q ? (M.abs(q) > 1 ? '^' + M.abs(q) : '') + (q > 0 ? '+' : '-') : ''); if (LEW[k2]) return k2; if (LEWALIAS[s]) return LEWALIAS[s]; if (LEWALIAS[body] && !q) return LEWALIAS[body]; return null; }
  // a structure object: atoms with lp, rad; bonds with order. form: 0 = main, 1.. = resonance forms, 'alt' = expanded octet
  function lewStruct(key, form) {
    var d = LEW[key]; if (!d) return null;
    var st = { key: key, q: d.q || 0, atoms: d.a.map(function (a) { return { s: a[0], x: a[1], y: a[2], lp: a[3] || 0, rad: a[4] || 0 }; }), bonds: d.b.map(function (b) { return { i: b[0], j: b[1], o: b[2] }; }) };
    var ch = form === 'alt' ? d.alt : (form && d.res ? d.res[form - 1] : null);
    if (ch) { for (var bk in ch.b) { var ij = bk.split('-').map(Number); st.bonds.forEach(function (b) { if ((b.i === ij[0] && b.j === ij[1]) || (b.i === ij[1] && b.j === ij[0])) b.o = ch.b[bk]; }); } for (var ak in ch.lp) st.atoms[+ak].lp = ch.lp[ak]; }
    return st;
  }
  function veOf(s) { var e = BYS[s]; return e ? (valence(e.Z) || 0) : 0; }
  function lewCalc(st) { // formal charges, electron counts, octets
    var out = { fc: [], tot: 0, placed: 0, oct: [] }; st.atoms.forEach(function (a, i) { var bo = 0; st.bonds.forEach(function (b) { if (b.i === i || b.j === i) bo += b.o; }); var v = veOf(a.s); out.fc.push(v - 2 * a.lp - a.rad - bo); out.tot += v; out.placed += 2 * a.lp + a.rad; out.oct.push(2 * a.lp + a.rad + 2 * bo); });
    st.bonds.forEach(function (b) { out.placed += 2 * b.o; }); out.tot -= st.q; return out;
  }
  // directions for lone pairs: the largest gaps between bonds (y down)
  function lpDirs(st, i, n) {
    var a = st.atoms[i], used = []; st.bonds.forEach(function (b) { if (b.i === i || b.j === i) { var o2 = st.atoms[b.i === i ? b.j : b.i]; used.push(M.atan2(o2.y - a.y, o2.x - a.x)); } });
    var out = [];
    for (var k2 = 0; k2 < n; k2++) { var best = 0, bd = -1; for (var t = 0; t < 72; t++) { var ang = t * TAU / 72 - PI / 2, md = PI * 4; used.concat(out).forEach(function (u) { var d = M.abs(((ang - u) % TAU + TAU + PI) % TAU - PI); md = M.min(md, d); }); if (!used.length && !out.length) md = (t === 0 ? 9 : 0) + (t % 18 === 0 ? 1 : 0); if (md > bd + 1e-9) { bd = md; best = ang; } } out.push(best); }
    return out;
  }

  // ch-lewis: options are documented at the top of this file
  R('ch-lewis', function (elx, o) {
    o = opt(o, { mol: 'H2O', mode: 'structure', el: 'Cl', charge: 0, fc: true, budget: true, form: 0, a: 'Na', b: 'Cl', pair: 'NH3+BF3' });
    var mode = o.mode, quiet = !!(o.quiet || o.readout === false), key = typeof o.mol === 'object' ? null : lewKey(o.mol);
    var F = frame(elx, o, mode === 'dots' ? 'Lewis dot symbol' : mode === 'transfer' ? 'Electron transfer in ionic bonding' : mode === 'adduct' ? 'A Lewis acid–base adduct' : 'Lewis structure' + (key ? ' of ' + fT(key) : ''));
    var c = F.canvas({ aspect: 2.0, min: 240, max: 380, narrow: 1.1 }), S = { st: null, sel: 0, selKind: 'atom', t: 1 };
    if (typeof o.mol === 'object' && o.mol) { LEW.__custom = { a: o.mol.atoms, b: o.mol.bonds, q: o.mol.q || 0 }; key = '__custom'; }
    if (!key && mode !== 'dots' && mode !== 'transfer' && mode !== 'adduct') key = 'H2O';
    function form0() { return mode === 'structure' && o.form === 'alt' && LEW[key].alt ? 'alt' : 0; }
    if (key) S.st = lewStruct(key, form0());
    if (mode === 'build' && S.st) { S.target = lewCalc(lewStruct(key, 0)); S.st.atoms.forEach(function (a) { a.lp = 0; a.rad = 0; }); S.st.bonds.forEach(function (b) { b.o = 1; }); }
    // ---------- drawing a structure ----------
    function drawStruct(ctx, st, cx, cy, u, opt2) {
      opt2 = opt2 || {}; var k = pal(), calc = lewCalc(st), fs = M.max(13, M.min(24, u * 0.42)), xs = st.atoms.map(function (a) { return cx + a.x * u; }), ys = st.atoms.map(function (a) { return cy + a.y * u; }), ink = k.ink;
      st.bonds.forEach(function (b, bi) { var x1 = xs[b.i], y1 = ys[b.i], x2 = xs[b.j], y2 = ys[b.j], L2 = M.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L2, uy = (y2 - y1) / L2, gap = fs * 0.62, nx = -uy, ny = ux, ord = opt2.orders ? opt2.orders[bi] : b.o;
        var a1 = x1 + ux * gap, b1 = y1 + uy * gap, a2 = x2 - ux * gap, b2 = y2 - uy * gap, n = M.ceil(ord - 1e-9), sp = 5;
        for (var m = 0; m < n; m++) { var off = (m - (n - 1) / 2) * sp; var partial = opt2.orders && m === n - 1 && M.abs(ord - M.round(ord)) > 0.01; line(ctx, [[a1 + nx * off, b1 + ny * off], [a2 + nx * off, b2 + ny * off]], opt2.selB === bi ? k.gold : ink, 2.2, partial ? [4, 4] : null); }
      });
      st.atoms.forEach(function (a, i) {
        var x = xs[i], y = ys[i], hlA = opt2.selA === i;
        txt(ctx, a.s, x, y + 1, { size: fs, bold: true, align: 'center', color: hlA ? k.gold : (a.s === 'H' ? ink : k.acc) });
        var dirs = lpDirs(st, i, a.lp + (a.rad ? 1 : 0)), rr2 = fs * 0.78 + (a.s.length > 1 ? 3 : 0);
        dirs.forEach(function (ang, j) { var px = x + M.cos(ang) * rr2, py = y + M.sin(ang) * rr2, tx = -M.sin(ang) * 3.4, ty = M.cos(ang) * 3.4; ctx.fillStyle = opt2.lpColor || ink; var single = a.rad && j === dirs.length - 1; ctx.beginPath(); if (single) ctx.arc(px, py, 2.4, 0, TAU); else { ctx.arc(px + tx, py + ty, 2.4, 0, TAU); ctx.moveTo(px - tx, py - ty); ctx.arc(px - tx, py - ty, 2.4, 0, TAU); } ctx.fill(); });
        if (opt2.fc && calc.fc[i] !== 0) { var fd = lpDirs(st, i, a.lp + (a.rad ? 1 : 0) + 1), fa = fd[fd.length - 1], fr = fs * 1.05 + (a.s.length > 1 ? 4 : 0), fx = x + M.cos(fa) * fr, fy = y + M.sin(fa) * fr; ctx.save(); ctx.strokeStyle = calc.fc[i] > 0 ? k.plus : k.minus; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(fx, fy, 8, 0, TAU); ctx.stroke(); ctx.restore(); txt(ctx, (calc.fc[i] > 0 ? '+' : '−') + (M.abs(calc.fc[i]) > 1 ? M.abs(calc.fc[i]) : ''), fx, fy + 0.5, { size: 10, bold: true, align: 'center', color: calc.fc[i] > 0 ? k.plus : k.minus }); }
        if (opt2.oct && a.s !== 'H') { var ok = calc.oct[i] === 8, ex = calc.oct[i] > 8; txt(ctx, calc.oct[i] + ' e⁻', x, y + fs * 1.35, { size: 9, align: 'center', color: ok ? k.green : ex ? k.gold : k.red }); }
      });
      if (st.q) { var minX = M.min.apply(null, xs) - fs * 1.3, maxX = M.max.apply(null, xs) + fs * 1.3, minY = M.min.apply(null, ys) - fs * 1.3, maxY = M.max.apply(null, ys) + fs * 1.3; ctx.save(); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(minX + 7, minY); ctx.lineTo(minX, minY); ctx.lineTo(minX, maxY); ctx.lineTo(minX + 7, maxY); ctx.moveTo(maxX - 7, minY); ctx.lineTo(maxX, minY); ctx.lineTo(maxX, maxY); ctx.lineTo(maxX - 7, maxY); ctx.stroke(); ctx.restore(); txt(ctx, chargeStr(st.q), maxX + 4, minY + 4, { size: 14, bold: true, color: ink }); }
      return { xs: xs, ys: ys, fs: fs };
    }
    function fitU(st, w, h) { var xs = st.atoms.map(function (a) { return a.x; }), ys = st.atoms.map(function (a) { return a.y; }), sx = M.max(1, M.max.apply(null, xs) - M.min.apply(null, xs)), sy = M.max(0.6, M.max.apply(null, ys) - M.min.apply(null, ys)); return M.min(78, (w - 70) / (sx + 1.2), (h - 60) / (sy + 1.4)); }
    function center(st) { var xs = st.atoms.map(function (a) { return a.x; }), ys = st.atoms.map(function (a) { return a.y; }); return [(M.max.apply(null, xs) + M.min.apply(null, xs)) / 2, (M.max.apply(null, ys) + M.min.apply(null, ys)) / 2]; }
    function dotSymbol(ctx, sym, q, x, y, fs) {
      var k = pal(), e = BYS[sym], v = valence(e.Z) - q, n = clamp(v, 0, 8); txt(ctx, sym, x, y, { size: fs, bold: true, align: 'center', color: k.acc });
      var sides = [[0, -1], [1, 0], [0, 1], [-1, 0]], cnt = [0, 0, 0, 0]; for (var i = 0; i < n; i++) cnt[i % 4]++; // one on each side first, then pair them
      sides.forEach(function (sd, j) { var cxp = x + sd[0] * fs * 0.85, cyp = y + sd[1] * fs * 0.8, tx = sd[1] * 4, ty = sd[0] * 4; ctx.fillStyle = k.ink; ctx.beginPath(); if (cnt[j] === 1) ctx.arc(cxp, cyp, 2.6, 0, TAU); else if (cnt[j] === 2) { ctx.arc(cxp + tx, cyp + ty, 2.6, 0, TAU); ctx.moveTo(cxp - tx, cyp - ty); ctx.arc(cxp - tx, cyp - ty, 2.6, 0, TAU); } ctx.fill(); });
      if (q) { var bx = fs * 1.35; ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - bx + 6, y - bx); ctx.lineTo(x - bx, y - bx); ctx.lineTo(x - bx, y + bx); ctx.lineTo(x - bx + 6, y + bx); ctx.moveTo(x + bx - 6, y - bx); ctx.lineTo(x + bx, y - bx); ctx.lineTo(x + bx, y + bx); ctx.lineTo(x + bx - 6, y + bx); ctx.stroke(); ctx.restore(); txt(ctx, chargeStr(q), x + bx + 3, y - bx + 4, { size: 13, bold: true, color: k.ink }); }
      return n;
    }
    // ---------- transfer: metal atoms give electrons to nonmetal atoms ----------
    function transferPlan() { var a = BYS[o.a] || BYS.Na, b = BYS[o.b] || BYS.Cl, qa = valence(a.Z), qb = valence(b.Z) - 8, l = qa * -qb / gcdI(qa, -qb), na = l / qa, nb = l / -qb; return { a: a, b: b, qa: qa, qb: qb, na: na, nb: nb }; }
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      if (mode === 'dots') { var sym = (BYS[o.el] || BYS.Cl).s; var list = Array.isArray(o.el) ? o.el : [sym]; var n = list.length, w = c.w / n; list.forEach(function (s, i) { var e = BYS[s] || BYS.Cl; var dsz = M.min(48, c.h * 0.2, w * 0.3); dotSymbol(ctx, e.s, i === 0 && n === 1 ? num(o.charge, 0) : 0, w * (i + 0.5), c.h / 2, dsz); if (quiet) return; var nv = valence(e.Z) - (n === 1 ? num(o.charge, 0) : 0), vl = nv + ' valence electron' + (nv === 1 ? '' : 's'), ly = c.h / 2 + dsz * 1.9; if (n > 1 && w < 110) { txt(ctx, String(nv), w * (i + 0.5), ly, { size: 13, bold: true, align: 'center', color: k.ink }); if (i === n - 1) txt(ctx, 'valence electrons', c.w / 2, ly + 18, { size: 11, align: 'center' }); } else if (tw(ctx, vl, 11) > w - 6) { txt(ctx, nv + ' valence', w * (i + 0.5), ly, { size: 11, align: 'center' }); txt(ctx, 'electron' + (nv === 1 ? '' : 's'), w * (i + 0.5), ly + 14, { size: 11, align: 'center' }); } else txt(ctx, vl, w * (i + 0.5), ly, { size: 11, align: 'center' }); }); return; }
      if (mode === 'transfer') return drawTransfer(ctx, k);
      if (mode === 'adduct') return drawAdduct(ctx, k);
      if (mode === 'resonance') return drawRes(ctx, k);
      var st = S.st, u = fitU(st, c.w, c.h), ce = center(st), sh = quiet ? 0 : 1;
      var calc0 = lewCalc(st), g = drawStruct(ctx, st, c.w / 2 - ce[0] * u, c.h / 2 - ce[1] * u + 4, u, { fc: !quiet && o.fc !== false && (mode !== 'build' || calc0.placed === calc0.tot), oct: mode === 'build' && !quiet, selA: mode === 'build' && S.selKind === 'atom' && H.focused() ? S.sel : -1, selB: mode === 'build' && S.selKind === 'bond' && H.focused() ? S.sel : -1 });
      S.geom = g; S.u = u; S.ce = ce;
      if (!quiet && o.budget !== false) { var calc = lewCalc(st); pill(ctx, 'valence electrons: ' + calc.tot + ' available · ' + calc.placed + ' placed', c.w / 2, 14, { size: 12, color: calc.tot === calc.placed ? k.green : k.ink, clampW: c.w }); }
    }
    function drawRes(ctx, k) {
      var d = LEW[key], forms = [lewStruct(key, 0)].concat((d.res || []).map(function (r, i) { return lewStruct(key, i + 1); })), n = forms.length, wide = c.w > 560;
      var rows = wide ? 1 : 2, per = wide ? n + 1 : M.ceil((n + 1) / 2), cw = c.w / per, chh = c.h / rows, u = M.min(fitU(forms[0], cw, chh), 60);
      forms.forEach(function (st, i) { var col = i % per, row = M.floor(i / per), ce = center(st), cx = cw * (col + 0.5), cy = chh * (row + 0.5); drawStruct(ctx, st, cx - ce[0] * u, cy - ce[1] * u, u, { fc: !quiet && o.fc !== false }); if (i < n - 1 && col < per - 1) { txt(ctx, '↔', cw * (col + 1), cy, { size: 22, bold: true, align: 'center', color: k.gold }); } });
      // the blend: average bond orders, drawn with dashed partial bonds
      var avg = forms[0].bonds.map(function (b, bi) { var s = 0; forms.forEach(function (f) { s += f.bonds[bi].o; }); return s / n; }), blend = lewStruct(key, 0);
      blend.atoms.forEach(function (a, i) { a.lp = 0; a.rad = 0; });
      var col2 = n % per, row2 = M.floor(n / per), cxb = cw * (col2 + 0.5), cyb = chh * (row2 + 0.5), ce2 = center(blend);
      ctx.save(); ctx.fillStyle = k.accSoft; rr(ctx, cxb - cw / 2 + 6, cyb - chh / 2 + 6, cw - 12, chh - 12, 10); ctx.fill(); ctx.restore();
      drawStruct(ctx, blend, cxb - ce2[0] * u, cyb - ce2[1] * u, u, { orders: avg }); txt(ctx, tw(ctx, 'the real ion: one blended structure', 10, true) > cw - 20 ? 'the real ion: a blend' : 'the real ion: one blended structure', cxb, cyb + chh / 2 - 16, { size: 10, align: 'center', color: k.acc, bold: true });
    }
    function drawTransfer(ctx, k) {
      var P = transferPlan(), fs = M.min(34, c.h * 0.13), t = S.t, y1 = c.h * 0.3, y2 = c.h * 0.74, tot = P.na + P.nb, w = c.w / (tot + 1);
      txt(ctx, 'before', 10, y1 - fs * 1.6, { size: 11 }); txt(ctx, 'after', 10, y2 - fs * 1.6, { size: 11 });
      var xs = []; for (var i = 0; i < tot; i++) xs.push(w * (i + 1));
      for (i = 0; i < tot; i++) { var isA = i < P.na; dotSymbol(ctx, isA ? P.a.s : P.b.s, 0, xs[i], y1, fs); if (i < tot - 1) txt(ctx, '+', (xs[i] + xs[i + 1]) / 2, y1, { size: 18, align: 'center', color: k.muted }); }
      for (i = 0; i < tot; i++) { isA = i < P.na; dotSymbol(ctx, isA ? P.a.s : P.b.s, isA ? P.qa : P.qb, xs[i], y2, fs); }
      // arrows: each metal electron to a nonmetal
      var e = 0; for (var a2 = 0; a2 < P.na; a2++) for (var j = 0; j < P.qa; j++) { var bi = P.na + M.floor(e / -P.qb); e++; var x1 = xs[a2] + fs * 0.85, x2 = xs[bi] - fs * 0.85; ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1 - fs * 0.4 - j * 6); ctx.quadraticCurveTo((x1 + x2) / 2, y1 - fs * 1.9 - j * 10, x2, y1 - fs * 0.4 - j * 6); ctx.stroke(); ctx.restore(); arrow(ctx, x2 - 6, y1 - fs * 0.8 - j * 6, x2, y1 - fs * 0.4 - j * 6, k.gold, 2, 7); }
      txt(ctx, '↓', c.w / 2, (y1 + y2) / 2, { size: 22, align: 'center', color: k.muted });
    }
    function drawAdduct(ctx, k) {
      var pr = o.pair, ks = pr === 'H2O+H+' ? ['H2O', 'H+', 'H3O+'] : pr === 'NH3+H+' ? ['NH3', 'H+', 'NH4+'] : ['NH3', 'BF3', 'H3NBF3'], wide = c.w > 560;
      var A = lewStruct(ks[0], 0), B = ks[1] === 'H+' ? { atoms: [{ s: 'H', x: 0, y: 0, lp: 0, rad: 0 }], bonds: [], q: 1 } : lewStruct(ks[1], 0), P = lewStruct(ks[2], 0), u = M.min(46, c.h / 5);
      var y0 = wide ? c.h / 2 : c.h * 0.3, xa = wide ? c.w * 0.14 : c.w * 0.25, xb = wide ? c.w * 0.38 : c.w * 0.72, xp = wide ? c.w * 0.76 : c.w / 2, yp = wide ? c.h / 2 : c.h * 0.68;
      var ca = center(A), cb = center(B), cp = center(P);
      var gA = drawStruct(ctx, A, xa - ca[0] * u, y0 - ca[1] * u, u, {}), gB = drawStruct(ctx, B, xb - cb[0] * u, y0 - cb[1] * u, u, {});
      txt(ctx, '+', (xa + xb) / 2 + u * 0.4, y0, { size: 20, align: 'center', color: k.muted });
      // curved arrow from the donor's lone pair to the acceptor
      var dx = gA.xs[0], dy = gA.ys[0], tx2 = gB.xs[0], ty2 = gB.ys[0]; ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(dx + 6, dy - gA.fs); ctx.quadraticCurveTo((dx + tx2) / 2, dy - gA.fs * 3.2, tx2 - 10, ty2 - gB.fs * 0.9); ctx.stroke(); ctx.restore(); arrow(ctx, tx2 - 16, ty2 - gB.fs * 1.3, tx2 - 8, ty2 - gB.fs * 0.8, k.gold, 2.2, 8);
      txt(ctx, wide ? '→' : '↓', wide ? c.w * 0.56 : c.w / 2, wide ? y0 : (y0 + yp) / 2 + 6, { size: 24, align: 'center', color: k.muted });
      drawStruct(ctx, P, xp - cp[0] * u, yp - cp[1] * u, u, { fc: !quiet && o.fc !== false });
      if (wide) { txt(ctx, 'Lewis base: gives a lone pair', xa, c.h - 10, { size: 10, align: 'center', color: k.acc }); txt(ctx, 'Lewis acid: accepts it', xb, c.h - 10, { size: 10, align: 'center', color: k.acc }); } else { txt(ctx, 'Lewis base (left): gives a lone pair', c.w / 2, c.h - 24, { size: 10, align: 'center', color: k.acc }); txt(ctx, 'Lewis acid (right): accepts it', c.w / 2, c.h - 10, { size: 10, align: 'center', color: k.acc }); }
    }
    function report() {
      var s = '', alt = '';
      if (mode === 'dots') { var e = BYS[o.el] || BYS.Cl, q = num(o.charge, 0); s = quiet ? 'The dot symbol of ' + e.s + (q ? ' as an ion' : '') + '.' : e.name + ' (group ' + e.group + ') has ' + valence(e.Z) + ' valence electrons' + (q ? '; the ' + fH(e.s + (M.abs(q) > 1 ? M.abs(q) : '') + (q > 0 ? '+' : '-')) + ' ion has ' + (valence(e.Z) - q) : '') + '. Dots go one to a side before any pair up.'; alt = 'Lewis dot symbol of ' + e.name.toLowerCase() + '.'; }
      else if (mode === 'transfer') { var P = transferPlan(); s = (P.na > 1 ? P.na + ' ' : 'A ') + P.a.name.toLowerCase() + ' atom' + (P.na > 1 ? 's give ' : ' gives ') + P.na * P.qa + ' electron' + (P.na * P.qa > 1 ? 's' : '') + ' to ' + (P.nb > 1 ? P.nb + ' ' : 'a ') + P.b.name.toLowerCase() + ' atom' + (P.nb > 1 ? 's' : '') + '. ' + (quiet ? '' : 'The ions ' + fH(P.a.s + (P.qa > 1 ? P.qa : '') + '+') + ' and ' + fH(P.b.s + (-P.qb > 1 ? -P.qb : '') + '-') + ' attract each other: ' + fH(P.a.s + (P.na > 1 ? P.na : '') + P.b.s + (P.nb > 1 ? P.nb : '')) + '. Transferred electrons balance: ' + P.na + ' × ' + P.qa + ' = ' + P.nb + ' × ' + (-P.qb) + '.'); alt = 'Electron transfer from ' + P.a.name + ' to ' + P.b.name + '.'; }
      else if (mode === 'adduct') { s = o.pair === 'NH3+BF3' ? 'Ammonia\'s lone pair forms a new bond to boron, which had only six electrons. Both electrons of the new bond come from nitrogen' + (quiet ? '.' : ', so N gets a formal charge of +1 and B gets −1. These are bookkeeping charges, not real ionic charges.') : 'The lone pair of the base bonds to H⁺ (a Lewis acid). The new N–H or O–H bond is the same as the others once it forms.'; alt = 'A Lewis base donating a lone pair to a Lewis acid.'; }
      else if (mode === 'resonance') { var d = LEW[key], n = 1 + (d.res ? d.res.length : 0), forms = [lewStruct(key, 0)].concat((d.res || []).map(function (r, i) { return lewStruct(key, i + 1); })), vary = []; forms[0].bonds.forEach(function (b, bi) { var os = forms.map(function (f) { return f.bonds[bi].o; }); if (M.max.apply(null, os) !== M.min.apply(null, os)) vary.push(os.reduce(function (a2, x) { return a2 + x; }, 0) / n); });
        var bo = vary.length ? vary[0] : null, frac = bo == null ? '' : M.abs(bo - 4 / 3) < 1e-9 ? '1⅓' : M.abs(bo - 1.5) < 1e-9 ? '1½' : fm(bo, 2);
        s = fH(key) + ' has ' + n + ' resonance structure' + (n === 1 ? '' : 's') + '. The real ' + (d.q ? 'ion' : 'molecule') + ' does not flip between them: it is one blend' + (bo != null && !quiet && vary.every(function (x) { return M.abs(x - bo) < 1e-9; }) ? ', and each of the ' + vary.length + ' changing bonds has a bond order of ' + frac + ', between a single and a double bond.' : '.'); alt = 'Resonance structures of ' + fT(key) + ' and their blend.'; }
      else { var calc = lewCalc(S.st), fcs = S.st.atoms.map(function (a, i) { return calc.fc[i] ? a.s + ' ' + (calc.fc[i] > 0 ? '+' : '−') + M.abs(calc.fc[i]) : null; }).filter(Boolean);
        if (mode === 'build') { var notes = []; if (calc.placed !== calc.tot) notes.push(calc.placed < calc.tot ? 'Place ' + (calc.tot - calc.placed) + ' more electrons.' : 'That is ' + (calc.placed - calc.tot) + ' electrons too many.'); S.st.atoms.forEach(function (a, i) { if (a.s === 'H' && calc.oct[i] !== 2) notes.push('H holds just 2 electrons (one bond).'); else if (a.s !== 'H' && calc.oct[i] < 8 && ['B', 'Be'].indexOf(a.s) < 0) notes.push(a.s + ' has ' + calc.oct[i] + ' electrons around it; aim for 8.'); else if (a.s === 'C' && calc.oct[i] > 8) notes.push('Carbon can have at most 4 bonds.'); }); notes = notes.filter(function (x, i, a) { return a.indexOf(x) === i; }); var ok = !notes.length; F.done(ok); s = quiet ? 'Electrons placed: ' + calc.placed + '.' : (ok ? '<span class="chv-ok">Every atom is satisfied and all ' + calc.tot + ' valence electrons are placed.</span>' + (fcs.length ? ' Formal charges: ' + fcs.join(', ') + '.' : ' No formal charges.') : '<span class="chv-no">' + notes[0] + '</span>' + (notes[1] ? ' ' + notes[1] : '')); }
        else s = quiet ? 'Lewis structure of ' + fH(S.st.key === '__custom' ? 'the molecule' : S.st.key) + '.' : fH(S.st.key) + ': ' + calc.tot + ' valence electrons (' + S.st.atoms.map(function (a) { return a.s; }).filter(function (x, i, a) { return a.indexOf(x) === i; }).map(function (x) { var n = S.st.atoms.filter(function (a) { return a.s === x; }).length; return (n > 1 ? n + ' × ' : '') + veOf(x) + ' for ' + x; }).join(', ') + (S.st.q ? (S.st.q < 0 ? ', + ' + (-S.st.q) : ', − ' + S.st.q) + ' for the charge' : '') + '). ' + (fcs.length ? 'Formal charges: ' + fcs.join(', ') + ' (bookkeeping, not real charges).' : 'Every formal charge is zero.') + (o.form === 'alt' ? ' This form puts more than 8 electrons on the central atom to lower the formal charges.' : '');
        alt = 'Lewis structure of ' + fT(S.st.key) + '.'; }
      F.say(s); F.setAlt(alt);
    }
    // ---------- build mode input ----------
    var H = { focused: function () { return false; } };
    if (mode === 'build' && F.edit) {
      H = keyNav(c, {
        tap: function (px, py) { var g = S.geom; if (!g) return; var best = -1, bd = 30, kind = 'atom'; g.xs.forEach(function (x, i) { var d = M.hypot(x - px, g.ys[i] - py); if (d < bd) { bd = d; best = i; } }); S.st.bonds.forEach(function (b, i) { var mx = (g.xs[b.i] + g.xs[b.j]) / 2, my = (g.ys[b.i] + g.ys[b.j]) / 2, d = M.hypot(mx - px, my - py); if (d < bd) { bd = d; best = i; kind = 'bond'; } }); if (best < 0) return; S.sel = best; S.selKind = kind; act(1); },
        key: function (e) { var nA = S.st.atoms.length, nB = S.st.bonds.length; if (e.key === 'Tab') return false; if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') { S.sel++; if (S.selKind === 'atom' && S.sel >= nA) { S.selKind = 'bond'; S.sel = 0; } else if (S.selKind === 'bond' && S.sel >= nB) { S.selKind = 'atom'; S.sel = 0; } draw(); return true; } if (e.key === 'ArrowLeft') { S.sel--; if (S.sel < 0) { S.selKind = S.selKind === 'atom' ? 'bond' : 'atom'; S.sel = (S.selKind === 'atom' ? nA : nB) - 1; } draw(); return true; } if (e.key === 'Enter' || e.key === ' ' || e.key === '+' || e.key === 'ArrowUp') { act(1); return true; } if (e.key === '-' || e.key === 'ArrowDown') { act(-1); return true; } return false; },
        change: draw
      });
      btn(F.ctl, 'Start over', function () { S.st.atoms.forEach(function (a) { a.lp = 0; a.rad = 0; }); S.st.bonds.forEach(function (b) { b.o = 1; }); report(); draw(); });
      F.html('chv-note').innerHTML = 'Tap an atom to add a lone pair (up to 4, then back to none). Tap a bond to make it double, triple, then single again. Keys: arrows pick, Enter or + adds, − removes.';
    }
    function act(d) { if (S.selKind === 'atom') { var a = S.st.atoms[S.sel]; a.lp = (a.lp + d + 5) % 5; if (a.s === 'H') a.lp = 0; } else { var b = S.st.bonds[S.sel]; b.o = ((b.o - 1 + d) % 3 + 3) % 3 + 1; } report(); draw(); }
    if (mode === 'structure' && F.edit && LEW[key] && LEW[key].alt) { var fb = btn(F.ctl, o.form === 'alt' ? 'Show the octet structure' : 'Show the expanded-octet structure', function () { o.form = o.form === 'alt' ? 0 : 'alt'; S.st = lewStruct(key, form0()); fb.textContent = o.form === 'alt' ? 'Show the octet structure' : 'Show the expanded-octet structure'; report(); draw(); }); }
    if (mode !== 'build') c.cv.removeAttribute('tabindex');
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  CH.LEW = LEW; CH.lewStruct = lewStruct; CH.lewCalc = lewCalc; CH.lewKey = lewKey;

  // =====================================================================================================
  // ch-vsepr: options are documented at the top of this file
  var DOM = { 2: [[1, 0, 0], [-1, 0, 0]], 3: [[0, 0, 1], [0.866, 0, -0.5], [-0.866, 0, -0.5]], 4: [[0, 0, 1], [0.943, 0, -0.333], [-0.471, 0.816, -0.333], [-0.471, -0.816, -0.333]], 5: [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-0.5, 0.866, 0], [-0.5, -0.866, 0]], 6: [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]] };
  // positions for lone pairs first: trigonal bipyramid → equatorial (2, 3, 4); octahedron → axial, trans (0, 1)
  var LPPOS = { 2: [0, 1], 3: [0, 1, 2], 4: [0, 1, 2, 3], 5: [2, 3, 4, 0, 1], 6: [0, 1, 2, 3, 4, 5] };
  var SHAPE = { '2,0': ['linear', 'linear', '180°'], '3,0': ['trigonal planar', 'trigonal planar', '120°'], '3,1': ['trigonal planar', 'bent', 'a little less than 120°'], '4,0': ['tetrahedral', 'tetrahedral', '109.5°'], '4,1': ['tetrahedral', 'trigonal pyramidal', 'a little less than 109.5°'], '4,2': ['tetrahedral', 'bent', 'a little less than 109.5°'], '5,0': ['trigonal bipyramidal', 'trigonal bipyramidal', '90°, 120° and 180°'], '5,1': ['trigonal bipyramidal', 'seesaw', 'a little less than 90° and 120°'], '5,2': ['trigonal bipyramidal', 'T-shaped', 'a little less than 90°'], '5,3': ['trigonal bipyramidal', 'linear', '180°'], '6,0': ['octahedral', 'octahedral', '90° and 180°'], '6,1': ['octahedral', 'square pyramidal', 'a little less than 90°'], '6,2': ['octahedral', 'square planar', '90° and 180°'] };
  var MEAS = { H2O: '104.5°', NH3: '107°', H2S: '92°', SO2: '119°', O3: '117°' }; // measured bond angles (NIST CCCBDB)
  var HYB = { 2: 'sp', 3: 'sp²', 4: 'sp³', 5: 'sp³d', 6: 'sp³d²' };
  function vseprOf(mol) { // {center, lone, ligands: [{s, o}], q, n (domains)}
    if (mol && typeof mol === 'object') { var lg = (mol.ligands || []).map(function (s) { return { s: s, o: 1 }; }); while (lg.length < (mol.bonds || 0)) lg.push({ s: 'H', o: 1 }); return { center: mol.center || 'X', lone: mol.lone || 0, lig: lg, n: lg.length + (mol.lone || 0), key: 'custom' }; }
    var key = lewKey(mol) || 'H2O', st = lewStruct(key, 0), deg = st.atoms.map(function (a, i) { return st.bonds.filter(function (b) { return b.i === i || b.j === i; }).length; }), ci = 0;
    deg.forEach(function (d, i) { if (d > deg[ci] || (d === deg[ci] && st.atoms[i].s !== 'H' && st.atoms[ci].s === 'H')) ci = i; });
    var lig = []; st.bonds.forEach(function (b) { if (b.i === ci || b.j === ci) lig.push({ s: st.atoms[b.i === ci ? b.j : b.i].s, o: b.o, idx: b.i === ci ? b.j : b.i }); });
    return { center: st.atoms[ci].s, lone: st.atoms[ci].lp + (st.atoms[ci].rad ? 1 : 0), rad: st.atoms[ci].rad, lig: lig, n: lig.length + st.atoms[ci].lp + (st.atoms[ci].rad ? 1 : 0), key: key, q: st.q };
  }
  function cam(c, o) { // a small orthographic camera: yaw about z, pitch about x; drag or arrow keys turn it
    var S = { yaw: o.yaw == null ? 0.6 : o.yaw, pitch: o.pitch == null ? 0.35 : o.pitch, sc: 1, cx: 0, cy: 0 };
    S.p = function (v) { var cyw = M.cos(S.yaw), syw = M.sin(S.yaw), cp = M.cos(S.pitch), sp2 = M.sin(S.pitch), x1 = v[0] * cyw - v[1] * syw, y1 = v[0] * syw + v[1] * cyw; return [S.cx + S.sc * x1, S.cy - S.sc * (v[2] * cp - y1 * sp2), y1 * cp + v[2] * sp2]; };
    var dr = null; V.drag(c.cv, { hit: function (px, py) { return o.hit ? o.hit(px, py) : 'cam'; }, start: function (h, px, py) { dr = [px, py, S.yaw, S.pitch, h]; }, move: function (h, px, py) { var t = o.target ? o.target(dr[4]) : S; t.yaw = dr[2] - (px - dr[0]) * 0.012; t.pitch = clamp(dr[3] + (py - dr[1]) * 0.012, -1.5, 1.5); if (o.change) o.change(); }, end: function () { dr = null; } });
    c.cv.tabIndex = 0; c.cv.addEventListener('keydown', function (e) { var d = { ArrowLeft: [-0.12, 0], ArrowRight: [0.12, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] }[e.key]; if (!d) return; var t = o.target ? o.target(null) : S; t.yaw += d[0]; t.pitch = clamp(t.pitch + d[1], -1.5, 1.5); if (o.change) o.change(); e.preventDefault(); });
    return S;
  }
  function proj(v, yaw, pitch, cx, cy, sc) { var cyw = M.cos(yaw), syw = M.sin(yaw), cp = M.cos(pitch), sp2 = M.sin(pitch), x1 = v[0] * cyw - v[1] * syw, y1 = v[0] * syw + v[1] * cyw; return [cx + sc * x1, cy - sc * (v[2] * cp - y1 * sp2), y1 * cp + v[2] * sp2]; }
  // draw a ball-and-stick model: atoms [{s, v:[x,y,z], r, label, q}], bonds [[i, j, order]], lobes [{v, kind}]
  function drawModel(ctx, m, yaw, pitch, cx, cy, sc, o2) {
    o2 = o2 || {}; var k = pal(), items = [];
    var P = m.atoms.map(function (a) { return proj(a.v, yaw, pitch, cx, cy, sc); });
    m.bonds.forEach(function (b) { var p1 = P[b[0]], p2 = P[b[1]]; items.push({ d: (p1[2] + p2[2]) / 2 - 0.01, f: function () { var n = b[2] || 1, dx = p2[0] - p1[0], dy = p2[1] - p1[1], L2 = M.hypot(dx, dy) || 1, nx = -dy / L2, ny = dx / L2; for (var j = 0; j < n; j++) { var off = (j - (n - 1) / 2) * 5; line(ctx, [[p1[0] + nx * off, p1[1] + ny * off], [p2[0] + nx * off, p2[1] + ny * off]], k.dark ? '#c9d2cd' : '#7b8680', n > 1 ? 3 : 5); } } }); });
    (m.lobes || []).forEach(function (L) { var p0 = proj([0, 0, 0], yaw, pitch, cx, cy, sc), p1 = proj(L.v.map(function (x) { return x * (L.len || 0.75); }), yaw, pitch, cx, cy, sc); items.push({ d: p1[2] - 0.02, f: function () { var dx = p1[0] - p0[0], dy = p1[1] - p0[1], ang = M.atan2(dy, dx), len = M.hypot(dx, dy), wid = sc * (L.w || 0.28); ctx.save(); ctx.translate(p0[0], p0[1]); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(len * 0.35, -wid, len * 1.05, -wid * 0.9, len * 1.05, 0); ctx.bezierCurveTo(len * 1.05, wid * 0.9, len * 0.35, wid, 0, 0); ctx.fillStyle = L.fill || rgba(k.blue, 0.28); ctx.fill(); ctx.strokeStyle = L.stroke || rgba(k.blue, 0.6); ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore(); if (L.label) txt(ctx, L.label, p1[0], p1[1], { size: 10, align: 'center', color: k.ink }); } }); });
    m.atoms.forEach(function (a, i) { var p = P[i]; items.push({ d: p[2], f: function () { ball(ctx, p[0], p[1], a.r * sc * (1 + p[2] * 0.06), a.s, { label: true, charge: a.q, color: a.col, text: a.text }); } }); });
    items.sort(function (x, y) { return x.d - y.d; }); items.forEach(function (it) { it.f(); });
    return P;
  }
  function vModel(V0, showLP) { // build the 3-D model of a VSEPR species
    var n = V0.n, dirs = DOM[n] || DOM[4], order = LPPOS[n] || [0, 1, 2, 3], lpIdx = order.slice(0, V0.lone), atoms = [{ s: V0.center, v: [0, 0, 0], r: 0.3 }], bonds = [], lobes = [], li = 0;
    for (var i = 0; i < dirs.length; i++) { if (lpIdx.indexOf(i) >= 0) { if (showLP !== false) lobes.push({ v: dirs[i], kind: 'lp', fill: 'rgba(184,150,62,.30)', stroke: 'rgba(184,150,62,.85)', len: 0.62, w: 0.3 }); continue; } var L = V0.lig[li++]; if (!L) continue; atoms.push({ s: L.s, v: dirs[i].map(function (x) { return x * 1.0; }), r: L.s === 'H' ? 0.18 : 0.25, o: L.o }); bonds.push([0, atoms.length - 1, L.o]); }
    var R3 = orientFor(V0, dirs, lpIdx);
    atoms.forEach(function (at) { at.v = mul3(R3, at.v); }); lobes.forEach(function (L) { L.v = mul3(R3, L.v); });
    return { atoms: atoms, bonds: bonds, lobes: lobes, lpIdx: lpIdx, dirs: dirs.map(function (d) { return mul3(R3, d); }) };
  }
  function mul3(Rm, v) { return [Rm[0][0] * v[0] + Rm[0][1] * v[1] + Rm[0][2] * v[2], Rm[1][0] * v[0] + Rm[1][1] * v[1] + Rm[1][2] * v[2], Rm[2][0] * v[0] + Rm[2][1] * v[1] + Rm[2][2] * v[2]]; }
  function rotTo(a, b) { // the rotation taking unit vector a onto unit vector b (Rodrigues)
    var v = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], cth = a[0] * b[0] + a[1] * b[1] + a[2] * b[2], s2 = M.hypot(v[0], v[1], v[2]);
    if (s2 < 1e-9) return cth > 0 ? [[1, 0, 0], [0, 1, 0], [0, 0, 1]] : [[1, 0, 0], [0, -1, 0], [0, 0, -1]];
    var k2 = v.map(function (x) { return x / s2; }), K2 = [[0, -k2[2], k2[1]], [k2[2], 0, -k2[0]], [-k2[1], k2[0], 0]], I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], out = [];
    for (var i = 0; i < 3; i++) { out.push([]); for (var j = 0; j < 3; j++) { var kk = 0; for (var q = 0; q < 3; q++) kk += K2[i][q] * K2[q][j]; out[i].push(I[i][j] + s2 * K2[i][j] + (1 - cth) * kk); } } return out;
  }
  function mulM(A2, B2) { var o2 = []; for (var i = 0; i < 3; i++) { o2.push([]); for (var j = 0; j < 3; j++) { var x = 0; for (var q = 0; q < 3; q++) x += A2[i][q] * B2[q][j]; o2[i].push(x); } } return o2; }
  function orientFor(V0, dirs, lpIdx) {
    var I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; if (V0.n > 4 && !(V0.n === 6 && V0.lone === 2)) return I;
    var R1 = I;
    if (V0.lone) { var m = [0, 0, 0]; lpIdx.forEach(function (i) { for (var q = 0; q < 3; q++) m[q] += dirs[i][q]; }); var L = M.hypot(m[0], m[1], m[2]); if (L > 1e-6) R1 = rotTo(m.map(function (x) { return x / L; }), [0, 0, 1]); else R1 = rotTo(dirs[lpIdx[0]], [0, 1, 0]); }
    else if (V0.n === 4) R1 = rotTo([0, 0, 1], [0, 0, 1]);
    // then turn about z so the first bonded atom lies in the picture plane (y = 0, x > 0)
    var first = null; for (var i = 0; i < dirs.length; i++) if (lpIdx.indexOf(i) < 0) { first = mul3(R1, dirs[i]); break; }
    if (!first || M.hypot(first[0], first[1]) < 1e-6) return R1;
    var ang = -M.atan2(first[1], first[0]), cz = M.cos(ang), sz = M.sin(ang); return mulM([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]], R1);
  }
  R('ch-vsepr', function (elx, o) {
    o = opt(o, { mol: 'H2O', mode: 'shape', show: null, dipoles: null, en: null, pair: null, geometry: 'oct', metal: 'Co', ligands: null, charge: null });
    var mode = o.mode, F = frame(elx, o, mode === 'diatomic' ? 'Bond polarity between two atoms' : mode === 'complex' ? 'A metal complex in 3-D' : mode === 'isomers' ? 'Isomers in 3-D' : 'Molecular shape in 3-D'), quiet = F.quiet;
    var show = {}; (o.show || (mode === 'polarity' ? ['dipoles', 'lonepairs', 'names'] : mode === 'hybrid' ? ['hybrid', 'pi', 'names'] : ['angles', 'names', 'lonepairs'])).forEach(function (x) { show[x] = 1; });
    if (o.dipoles) show.dipoles = 1;
    if (mode === 'diatomic') return diatomic(F, o);
    var c = F.canvas({ aspect: 1.7, min: 280, max: 420, narrow: 1.0 }), Vs = mode === 'complex' || mode === 'isomers' ? null : vseprOf(o.mol);
    var S = { a: { yaw: 0.35, pitch: 0.22 }, b: { yaw: 0.35, pitch: 0.22 }, act: 'a' };
    var C = cam(c, { change: draw, hit: function (px) { if (mode === 'isomers') { S.act = px < c.w / 2 ? 'a' : 'b'; } return 'cam'; }, target: function () { return mode === 'isomers' ? S[S.act] : S.a; } });
    function dipoleOf(m) { var cen = BYS[m.atoms[0].s], sum = [0, 0, 0], arrows = []; m.atoms.forEach(function (a, i) { if (!i) return; var e = BYS[a.s], d = (e && e.en && cen && cen.en) ? e.en - cen.en : 0; arrows.push({ i: i, d: d }); for (var j = 0; j < 3; j++) sum[j] += a.v[j] * d; }); return { arrows: arrows, net: sum, mag: M.hypot(sum[0], sum[1], sum[2]) }; }
    function complexModel() { var geo = mode === 'isomers' ? (o.geometry === 'oct' ? 'oct' : 'sqpl') : o.geometry, dirs = geo === 'tet' ? DOM[4] : geo === 'sqpl' ? [[1, 0, 0], [0, 1, 0], [-1, 0, 0], [0, -1, 0]] : DOM[6], lig = o.ligands || (geo === 'oct' ? ['NH3', 'NH3', 'NH3', 'NH3', 'NH3', 'NH3'] : geo === 'tet' ? ['Cl', 'Cl', 'Cl', 'Cl'] : ['NH3', 'NH3', 'Cl', 'Cl']); var atoms = [{ s: o.metal, v: [0, 0, 0], r: 0.32 }], bonds = []; dirs.forEach(function (d, i) { var L = lig[i] || 'Cl', don = Object.keys(parseF(L).atoms).filter(function (x) { return x !== 'H'; })[0] || L; atoms.push({ s: don, v: d.map(function (x) { return x * 1.05; }), r: 0.24, text: L.length <= 3 ? fT(L) : don }); bonds.push([0, atoms.length - 1, 1]); }); return { atoms: atoms, bonds: bonds, lobes: [] }; }
    function isomerModels() { var pr = o.pair || 'cis-trans', geo = o.geometry === 'oct' ? 'oct' : 'sqpl';
      if (pr === 'mirror') { var base = [['C', [0, 0, 0]], ['H', DOM[4][0]], ['F', DOM[4][1]], ['Cl', DOM[4][2]], ['Br', DOM[4][3]]]; var A2 = { atoms: base.map(function (b, i) { return { s: b[0], v: b[1], r: i ? (b[0] === 'H' ? 0.18 : 0.26) : 0.28 }; }), bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], lobes: [] }; var B2 = JSON.parse(JSON.stringify(A2)); B2.atoms.forEach(function (a) { a.v = [-a.v[0], a.v[1], a.v[2]]; }); return [A2, B2, 'mirror images'];
      }
      function mk2(arr, g) { var dirs = g === 'sqpl' ? [[1, 0, 0], [0, 1, 0], [-1, 0, 0], [0, -1, 0]] : DOM[6], atoms = [{ s: g === 'sqpl' ? 'Pt' : 'Co', v: [0, 0, 0], r: 0.3 }], bonds = []; arr.forEach(function (L, i) { atoms.push({ s: L === 'NH3' ? 'N' : L, v: dirs[i], r: 0.24, text: L === 'NH3' ? 'NH₃' : L }); bonds.push([0, i + 1, 1]); }); return { atoms: atoms, bonds: bonds, lobes: [] }; }
      if (geo === 'sqpl') { var cis = ['NH3', 'NH3', 'Cl', 'Cl'], trans = ['NH3', 'Cl', 'NH3', 'Cl']; return pr === 'same' ? [mk2(cis, 'sqpl'), mk2(['Cl', 'NH3', 'NH3', 'Cl'], 'sqpl'), 'the same compound, turned'] : [mk2(cis, 'sqpl'), mk2(trans, 'sqpl'), 'cis and trans isomers']; }
      var cisO = ['Cl', 'NH3', 'Cl', 'NH3', 'NH3', 'NH3'], transO = ['Cl', 'Cl', 'NH3', 'NH3', 'NH3', 'NH3']; return pr === 'same' ? [mk2(cisO, 'oct'), mk2(['NH3', 'NH3', 'Cl', 'NH3', 'Cl', 'NH3'], 'oct'), 'the same compound, turned'] : [mk2(cisO, 'oct'), mk2(transO, 'oct'), 'cis and trans isomers'];
    }
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.dark ? '#13201a' : '#f7faf8'; ctx.fillRect(0, 0, c.w, c.h);
      var sc = M.min(c.w, c.h) * 0.3;
      if (mode === 'isomers') { var IM = isomerModels(), sc2 = M.min(c.w / 2, c.h) * 0.3; drawModel(ctx, IM[0], S.a.yaw, S.a.pitch, c.w * 0.27, c.h / 2, sc2); drawModel(ctx, IM[1], S.b.yaw, S.b.pitch, c.w * 0.73, c.h / 2, sc2); ctx.strokeStyle = k.grid; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(c.w / 2, 10); ctx.lineTo(c.w / 2, c.h - 10); ctx.stroke(); ctx.setLineDash([]); txt(ctx, 'drag either one to turn it', c.w / 2, c.h - 10, { size: 10, align: 'center' }); if (!quiet) { txt(ctx, IM[2] === 'mirror images' ? 'mirror' : '', c.w / 2 + 4, 14, { size: 10 }); } return; }
      if (mode === 'complex') { drawModel(ctx, complexModel(), S.a.yaw, S.a.pitch, c.w / 2, c.h / 2, sc); if (!quiet) txt(ctx, { oct: 'octahedral', tet: 'tetrahedral', sqpl: 'square planar' }[o.geometry] || '', 12, 16, { size: 13, bold: true, color: k.ink }); return; }
      var m = vModel(Vs, show.lonepairs !== undefined ? !!show.lonepairs : true);
      if (mode === 'hybrid' && show.hybrid) { m.dirs.forEach(function (d) { m.lobes.push({ v: d, len: 0.7, w: 0.22, fill: rgba(k.acc, 0.16), stroke: rgba(k.acc, 0.6) }); }); }
      var P = drawModel(ctx, m, S.a.yaw, S.a.pitch, c.w / 2, c.h / 2, sc);
      // π bonds: two lobes above and below each multiple bond, perpendicular to the molecule's plane
      if (mode === 'hybrid' && show.pi) m.bonds.forEach(function (b) { if ((b[2] || 1) < 2) return; var a1 = m.atoms[b[1]].v, mid = a1.map(function (x) { return x * 0.5; }), perp = Vs.n === 2 ? [[0, 1, 0], [0, 0, 1]] : [[0, 1, 0]]; perp.slice(0, b[2] - 1).forEach(function (pv, j) { [1, -1].forEach(function (sg) { var p0 = proj(mid, S.a.yaw, S.a.pitch, c.w / 2, c.h / 2, sc), p1 = proj(mid.map(function (x, q) { return x + pv[q] * 0.42 * sg; }), S.a.yaw, S.a.pitch, c.w / 2, c.h / 2, sc); ctx.save(); ctx.fillStyle = j ? rgba(k.orange, 0.3) : rgba(k.green, 0.3); ctx.strokeStyle = j ? k.orange : k.green; ctx.beginPath(); ctx.ellipse(p1[0], p1[1], 17, 10, M.atan2(p1[1] - p0[1], p1[0] - p0[0]), 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }); }); });
      if (show.dipoles && (mode === 'polarity' || o.dipoles)) { var dp = dipoleOf(m); dp.arrows.forEach(function (ar) { if (M.abs(ar.d) < 0.05) return; var a = m.atoms[ar.i].v, from = ar.d > 0 ? [0, 0, 0] : a, to = ar.d > 0 ? a : [0, 0, 0], L2 = M.min(1, 0.35 + M.abs(ar.d) * 0.35), f1 = from.map(function (x, q) { return x + (to[q] - from[q]) * (0.5 - L2 / 2); }), t1 = from.map(function (x, q) { return x + (to[q] - from[q]) * (0.5 + L2 / 2); }), p1 = proj(f1, S.a.yaw, S.a.pitch, c.w / 2, c.h / 2, sc), p2 = proj(t1, S.a.yaw, S.a.pitch, c.w / 2, c.h / 2, sc), ang = M.atan2(p2[1] - p1[1], p2[0] - p1[0]), ox = -M.sin(ang) * 16, oy = M.cos(ang) * 16; if (oy > 0) { ox = -ox; oy = -oy; } arrow(ctx, p1[0] + ox, p1[1] + oy, p2[0] + ox, p2[1] + oy, k.blue, 2.2, 8); line(ctx, [[p1[0] + ox - 5 * M.sin(ang) + 6 * M.cos(ang), p1[1] + oy + 5 * M.cos(ang) + 6 * M.sin(ang)], [p1[0] + ox + 5 * M.sin(ang) + 6 * M.cos(ang), p1[1] + oy - 5 * M.cos(ang) + 6 * M.sin(ang)]], k.blue, 2); });
        if (!quiet && dp.mag > 0.05) { var nv2 = dp.net.map(function (x) { return x / dp.mag * M.min(1.3, 0.5 + dp.mag * 0.4); }), q0 = proj([0, 0, 0], S.a.yaw, S.a.pitch, c.w / 2, c.h / 2, sc), q1 = proj(nv2, S.a.yaw, S.a.pitch, c.w / 2, c.h / 2, sc); arrow(ctx, q0[0], q0[1], q1[0], q1[1], k.acc, 4, 12); txt(ctx, 'net dipole', q1[0] + 8, q1[1], { size: 11, bold: true, color: k.acc }); } }
      var t1w = 0; if (!quiet && show.names) { var sh = SHAPE[Vs.n + ',' + Vs.lone] || ['', '', '']; var ttl = sh[1] + (Vs.lone ? ' (electron groups: ' + sh[0] + ')' : ''), two = tw(ctx, ttl, 13, true) > c.w - 24; t1w = two ? tw(ctx, sh[1], 13, true) : tw(ctx, ttl, 13, true); if (two) { txt(ctx, sh[1], 12, 16, { size: 13, bold: true, color: k.ink }); txt(ctx, 'electron groups: ' + sh[0], 12, 32, { size: 11, color: k.ink }); } else txt(ctx, ttl, 12, 16, { size: 13, bold: true, color: k.ink }); if (mode === 'hybrid') txt(ctx, HYB[Vs.n] + ' hybridized ' + Vs.center, 12, two ? 50 : 34, { size: 12, color: k.acc, bold: true }); }
      if (!quiet && show.angles && mode === 'shape') { var sh2 = SHAPE[Vs.n + ',' + Vs.lone]; txt(ctx, 'bond angle: ' + (MEAS[Vs.key] ? MEAS[Vs.key] + ' (measured)' : sh2 ? sh2[2] : ''), 12, c.h - 14, { size: 12, color: k.ink }); }
      if (c.w >= 560) txt(ctx, 'drag to turn', c.w - 10, c.h - 12, { size: 10, align: 'right' }); else txt(ctx, 'drag to turn', c.w - 10, t1w < c.w - 100 ? 16 : c.h - 34, { size: 10, align: 'right' });
    }
    function report() {
      var s, alt;
      if (mode === 'complex') { s = quiet ? 'A metal ion with ' + (o.ligands ? o.ligands.length : o.geometry === 'oct' ? 6 : 4) + ' ligands.' : 'A ' + { oct: 'octahedral', tet: 'tetrahedral', sqpl: 'square planar' }[o.geometry] + ' complex: each ligand gives a lone pair to the metal ion (a coordinate bond). Coordination number ' + (o.geometry === 'oct' ? 6 : 4) + '.'; alt = 'A 3-D model of a metal complex.'; }
      else if (mode === 'isomers') { var IM = isomerModels(); s = quiet ? 'Two 3-D models. Turn them to compare.' : (IM[2] === 'the same compound, turned' ? 'These two are the <b>same compound</b>: turn one and it matches the other exactly. Turned copies are not isomers.' : IM[2] === 'mirror images' ? 'These are <b>mirror images</b> that cannot be laid on top of each other however you turn them, like your left and right hands.' : 'These are <b>cis and trans isomers</b>: in cis the two Cl ligands are next to each other (90° apart); in trans they are across from each other (180°). No turning changes one into the other.'); alt = 'Two 3-D models of isomers side by side.'; }
      else { var sh = SHAPE[Vs.n + ',' + Vs.lone] || ['?', '?', '?'], m = vModel(Vs), dp = dipoleOf(m), pol = dp.mag > 0.05;
        var multi = Vs.key !== 'custom' && lewStruct(Vs.key, 0).atoms.filter(function (a2, i2, arr) { return a2.s !== 'H' && lewStruct(Vs.key, 0).bonds.filter(function (b) { return b.i === i2 || b.j === i2; }).length > 1; }).length > 1;
        s = (multi ? '<i>The shape around one ' + Vs.center + ' atom.</i> ' : '') + (quiet ? fH(Vs.key) + ': ' + Vs.lig.length + ' bonded atom' + (Vs.lig.length === 1 ? '' : 's') + ' and ' + Vs.lone + ' lone pair' + (Vs.lone === 1 ? '' : 's') + ' on the central ' + Vs.center + '.' : fH(Vs.key) + ': ' + Vs.n + ' electron groups on ' + Vs.center + ' (' + Vs.lig.length + ' bonding, ' + Vs.lone + ' lone pair' + (Vs.lone === 1 ? '' : 's') + '): electron-group geometry <b>' + sh[0] + '</b>, molecular shape <b>' + sh[1] + '</b>' + (mode === 'shape' ? ', bond angle ' + (MEAS[Vs.key] || sh[2]) : '') + '.' + (mode === 'polarity' ? ' Bond dipoles point toward the more electronegative atom. ' + (pol ? 'They do not cancel, so the molecule is <b>polar</b>.' : 'They cancel by symmetry, so the molecule is <b>nonpolar</b>' + (dp.arrows.some(function (a) { return M.abs(a.d) > 0.05; }) ? ' even though its bonds are polar.' : '.')) : '') + (mode === 'hybrid' ? ' Hybridization ' + HYB[Vs.n] + '. Each double bond is one σ bond plus one π bond; a triple bond is one σ plus two π.' : '') + (Vs.lone ? ' Lone pairs take up room, so they push the bonds a little closer together.' : ''));
        alt = '3-D model of ' + fT(Vs.key) + ' with ' + Vs.lig.length + ' bonded atoms and ' + Vs.lone + ' lone pairs on the central atom.'; }
      F.say(s); F.setAlt(alt);
    }
    if (mode === 'isomers' && F.edit) btn(F.ctl, 'Line them up', function () { S.b.yaw = S.a.yaw; S.b.pitch = S.a.pitch; draw(); });
    c.cv.setAttribute('aria-label', 'A 3-D model. Drag, or use the arrow keys, to turn it.');
    var A = anim(elx, function (dt) { if (S.spin === false) return; S.a.yaw += dt * 0.25; if (mode === 'isomers') S.b.yaw += dt * 0.25; draw(); }, false);
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  // diatomic: an electron cloud pulled toward the more electronegative atom; δ+ and δ− labels; a nonpolar–polar–ionic bar
  function diatomic(F, o) {
    var pr = o.pair || ['H', 'Cl'], e1 = BYS[pr[0]] || BYS.H, e2 = BYS[pr[1]] || BYS.Cl, en = o.en ? [num(o.en[0], 2.2), num(o.en[1], 3.16)] : [e1.en || 2.2, e2.en || 3.16], S = { d: en[1] - en[0] }, quiet = F.quiet;
    var c = F.canvas({ aspect: 2.1, min: 230, max: 320, narrow: 1.2 });
    function draw() {
      var ctx = c.ctx, k = pal(), d = S.d, cy = c.h * 0.4, x1 = c.w * 0.36, x2 = c.w * 0.64, r = M.min(36, c.h * 0.14), sh = clamp(d / 3.3, -1, 1);
      ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var mx = (x1 + x2) / 2 + sh * (x2 - x1) * 0.45, g = ctx.createRadialGradient(mx, cy, 4, mx, cy, (x2 - x1) * 0.95); g.addColorStop(0, rgba(k.blue, 0.55)); g.addColorStop(0.55, rgba(k.blue, 0.22)); g.addColorStop(1, rgba(k.blue, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(mx, cy, (x2 - x1) * 0.95, r * 2.3, 0, 0, TAU); ctx.fill();
      ball(ctx, x1, cy, r, e1.s, { label: true }); ball(ctx, x2, cy, r, e2.s, { label: true });
      if (M.abs(d) > 0.05) { txt(ctx, d > 0 ? 'δ+' : 'δ−', x1, cy - r - 16, { size: 16, bold: true, align: 'center', color: d > 0 ? k.plus : k.minus, serif: true }); txt(ctx, d > 0 ? 'δ−' : 'δ+', x2, cy - r - 16, { size: 16, bold: true, align: 'center', color: d > 0 ? k.minus : k.plus, serif: true }); }
      if (!quiet) { txt(ctx, 'EN ' + fm(en[0], 2), x1, cy + r + 14, { size: 11, align: 'center' }); txt(ctx, 'EN ' + fm(en[0] + d, 2), x2, cy + r + 14, { size: 11, align: 'center' }); }
      // the bar: nonpolar … polar covalent … ionic; boundaries are rules of thumb
      var bx = 30, bw = c.w - 60, by = c.h - 46; var nar = c.w < 560, ZB = [['nonpolar covalent', 0, 0.4, '#d3f9d8', 'nonpolar'], ['polar covalent', 0.4, 1.8, '#fff3bf', 'polar covalent'], ['mostly ionic', 1.8, 3.3, '#ffe3e3', 'mostly ionic']]; ZB.forEach(function (z) { ctx.fillStyle = k.dark ? shade(z[3], -0.6) : z[3]; ctx.fillRect(bx + bw * z[1] / 3.3, by, bw * (z[2] - z[1]) / 3.3, 16); }); ZB.forEach(function (z, zi) { var zl = nar ? z[4] : z[0], zx = bx + bw * (z[1] + z[2]) / 6.6; if (zi === 0 && nar) { zx = bx + 2; txt(ctx, zl, zx, by + 8, { size: 10, align: 'left', color: k.ink }); return; } txt(ctx, zl, zx, by + 8, { size: 10, align: 'center', color: k.ink }); });
      if (!quiet) { var px = bx + bw * clamp(M.abs(d), 0, 3.3) / 3.3; ctx.fillStyle = k.acc; ctx.beginPath(); ctx.moveTo(px, by - 2); ctx.lineTo(px - 7, by - 12); ctx.lineTo(px + 7, by - 12); ctx.closePath(); ctx.fill(); txt(ctx, 'ΔEN = ' + fm(M.abs(d), 2), px, by - 20, { size: 11, bold: true, align: 'center', color: k.acc }); }
      txt(ctx, '0', bx, by + 26, { size: 10, align: 'center' }); txt(ctx, '3.3', bx + bw, by + 26, { size: 10, align: 'center' }); txt(ctx, nar ? 'ΔEN (boundaries are rules of thumb)' : 'difference in electronegativity (the boundaries are rules of thumb)', c.w / 2, by + 26, { size: 10, align: 'center' });
    }
    function report() { var a = M.abs(S.d); F.say(quiet ? 'A bond between ' + e1.s + ' and ' + e2.s + '.' : 'ΔEN = ' + fm(a, 2) + ': ' + (a < 0.4 ? 'electrons shared about equally (nonpolar covalent).' : a < 1.8 ? 'electrons pulled toward ' + (S.d > 0 ? e2.s : e1.s) + ' (polar covalent); it carries the partial negative charge δ−.' : 'the electrons are mostly transferred (ionic).') + ' Bond character changes gradually; there is no sharp line.'); F.setAlt('Two atoms with an electron cloud pulled toward the more electronegative one.'); }
    if (F.edit && !o.fixed) sl(F.ctl, { label: 'Electronegativity difference', min: 0, max: 3.3, step: 0.01, value: M.abs(S.d), input: function (v) { S.d = v * (S.d < 0 ? -1 : 1) || v; draw(); report(); } });
    redraw(c, draw); draw(); report(); return { draw: draw };
  }

  // =====================================================================================================
  // ch-bondcurve: options are documented at the top of this file
  var BONDS = { H2: [74.1, 436, 4401.2, 0.50391], HF: [91.7, 570, 4138.3, 0.95705], HCl: [127.5, 432, 2990.9, 0.97959], Cl2: [198.8, 242, 559.7, 17.4844], N2: [109.8, 945, 2358.6, 7.00154], O2: [120.7, 498, 1580.2, 7.99746], F2: [141.2, 159, 916.6, 9.49920], Br2: [228.1, 193, 325.3, 39.958], I2: [266.6, 151, 214.5, 63.452] };
  function morse(pair) { var b = BONDS[pair] || BONDS.H2, re = b[0], De = b[1], mu = b[3] * 1.66053907e-27, w = 2 * PI * 2.99792458e10 * b[2], kf = mu * w * w, DeJ = De * 1000 / K.NA, a = M.sqrt(kf / (2 * DeJ)) * 1e-12; return { re: re, De: De, a: a, V: function (r) { var x = M.exp(-a * (r - re)); return De * (1 - x) * (1 - x) - De; }, rep: function (r) { return De * M.exp(-2 * a * (r - re)); }, att: function (r) { return -2 * De * M.exp(-a * (r - re)); } }; }
  R('ch-bondcurve', function (elx, o) {
    o = opt(o, { pair: 'H2', compare: null, parts: false, r: null });
    var mA = morse(BONDS[o.pair] ? o.pair : 'H2'), mB = o.compare && BONDS[o.compare] ? morse(o.compare) : null, pA = BONDS[o.pair] ? o.pair : 'H2';
    var F = frame(elx, o, 'Potential energy of two atoms against their distance'), quiet = F.quiet, S = { r: num(o.r, mA.re * 2.2), parts: !!o.parts };
    var c = F.canvas({ aspect: 1.7, min: 290, max: 430, narrow: 1.0 }), Ch;
    function range() { var re = M.max(mA.re, mB ? mB.re : 0), De = M.max(mA.De, mB ? mB.De : 0); return { x: [M.min(mA.re, mB ? mB.re : 1e9) * 0.45, re * 3.6], y: [-De * 1.2, De * 0.9] }; }
    function draw() {
      var ctx = c.ctx, k = pal(), rg = range(); Ch = chart(c, { x: rg.x, y: rg.y, mt: 64, xl: 'Distance between the nuclei (pm)', yl: 'Potential energy (kJ/mol)', ml: 58, yticks: !quiet, xticks: !quiet });
      ctx.clearRect(0, 0, c.w, c.h); Ch.draw(ctx); var b = Ch.box();
      line(ctx, [[b.x0, Ch.Y(0)], [b.x1, Ch.Y(0)]], k.muted, 1.2, [5, 4]); var sepBelow = Ch.X(S.r) > b.x1 - 170 && M.abs(Ch.Y(mA.V(S.r)) - Ch.Y(0)) < 45; txt(ctx, 'separate atoms: 0', b.x1 - 4, Ch.Y(0) + (sepBelow ? 10 : -9), { size: 10, align: 'right' });
      if (S.parts) { Ch.curve(ctx, mA.rep, rg.x[0], rg.x[1], k.red, 1.6, [6, 4]); Ch.curve(ctx, mA.att, rg.x[0], rg.x[1], k.blue, 1.6, [6, 4]); txt(ctx, 'repulsion', Ch.X(mA.re * 0.75) + 6, Ch.Y(M.min(rg.y[1] * 0.8, mA.rep(mA.re * 0.75))), { size: 10, color: k.red }); txt(ctx, 'attraction', Ch.X(mA.re * 1.6), Ch.Y(mA.att(mA.re * 1.6)) + 12, { size: 10, color: k.blue }); }
      if (mB) Ch.curve(ctx, mB.V, rg.x[0], rg.x[1], k.blue, 2.4);
      Ch.curve(ctx, mA.V, rg.x[0], rg.x[1], k.acc, 3);
      if (mB) { txt(ctx, fT(pA), Ch.X(mA.re * 1.25) + 4, Ch.Y(mA.V(mA.re * 1.25)) + 12, { size: 12, bold: true, color: k.acc }); txt(ctx, fT(o.compare), Ch.X(mB.re * 1.3) + 4, Ch.Y(mB.V(mB.re * 1.3)) + 12, { size: 12, bold: true, color: k.blue }); }
      // the well: bond length and bond energy
      var xr = Ch.X(mA.re), yb = Ch.Y(-mA.De); ctx.fillStyle = k.acc; ctx.beginPath(); ctx.arc(xr, yb, 4, 0, TAU); ctx.fill();
      arrow(ctx, xr + 14, yb, xr + 14, Ch.Y(0) + 2, k.gold, 2.2, 8); var bel = quiet ? 'energy needed to break the bond' : 'bond energy ' + mA.De + ' kJ/mol: put in to break', bey = (yb + Ch.Y(0)) / 2; txtw(ctx, bel, xr + 20, bey, c.w - xr - 26, { size: 11, bold: true, color: k.gold, bg: rgba(k.bg, 0.82), lh: 14 });
      line(ctx, [[xr, yb], [xr, b.y1]], k.muted, 1, [3, 3]); if (!quiet) txt(ctx, 'bond length ' + fm(mA.re, 1) + ' pm', xr + 4, b.y1 - 10, { size: 10, color: k.ink });
      // the two atoms above the plot
      var u = 1, ay = 34, xA = Ch.X(rg.x[0]) + 12, xB = Ch.X(S.r), syms = Object.keys(parseF(pA).atoms), s1 = syms[0], s2 = syms[1] || syms[0], rad = M.min(20, (Ch.X(mA.re) - Ch.X(0.001 + rg.x[0])) * 0.5 + 8);
      line(ctx, [[Ch.X(S.r), ay + 16], [Ch.X(S.r), Ch.Y(mA.V(S.r))]], rgba(k.gold, 0.6), 1.2, [3, 3]);
      ball(ctx, Ch.X(0) > b.x0 ? Ch.X(0) : b.x0 + 2, ay, 14, s1, { label: true }); ball(ctx, xB, ay, 14, s2, { label: true }); line(ctx, [[b.x0 + 2, ay - 22], [b.x0 + 2, ay + 22]], k.muted, 1);
      knob(ctx, Ch.X(S.r), Ch.Y(mA.V(S.r)), k.gold, 7); H.draw(ctx);
      if (!quiet) pill(ctx, 'r = ' + fm(S.r, 0) + ' pm, E = ' + fm(mA.V(S.r), 0) + ' kJ/mol', Ch.X(S.r), Ch.Y(mA.V(S.r)) - 20, { size: 11, clampW: c.w });
    }
    function report() { var E = mA.V(S.r), dir = S.r < mA.re * 0.97 ? 'Pushed closer than the bond length, the nuclei repel and the energy climbs steeply.' : S.r > mA.re * 1.03 ? 'Pulled apart, the energy rises toward zero: separating the atoms takes energy in.' : 'At the bottom of the well: the most stable distance, the bond length.'; F.say((quiet ? '' : fT(pA) + ': bond length ' + fm(mA.re, 1) + ' pm, bond energy ' + mA.De + ' kJ/mol' + (mB ? '; ' + fT(o.compare) + ': ' + fm(mB.re, 1) + ' pm, ' + mB.De + ' kJ/mol' : '') + '. ') + dir + ' Breaking a bond always takes energy; energy is released when bonds form.'); F.setAlt('A potential energy curve for ' + fT(pA) + ': a well whose lowest point marks the bond length; the energy rises steeply at short distances and levels off at zero for separate atoms.'); }
    var H = hand(c, [{ get: function () { return Ch ? [Ch.X(S.r), 34] : [0, 0]; }, set: function (px) { var rg = range(); S.r = clamp(Ch.x(px), rg.x[0] * 1.05, rg.x[1]); report(); }, key: function (dx) { var rg = range(); S.r = clamp(S.r + dx * mA.re * 0.03, rg.x[0] * 1.05, rg.x[1]); report(); } }], { change: draw, r: 28 });
    if (F.edit) check(F.ctl, 'Show the attraction and repulsion parts', S.parts, function (v) { S.parts = v; draw(); });
    c.cv.setAttribute('aria-label', 'Energy curve. Drag the right atom, or use the left and right arrow keys, to change the distance.');
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  CH.morse = morse; CH.BONDS = BONDS;

  // =====================================================================================================
  // ch-modiagram: options are documented at the top of this file
  var MOSEQ = { mix: [['σ2s', 0, 1], ['σ*2s', 1, 1], ['π2p', 0, 2], ['σ2p', 0, 1], ['π*2p', 1, 2], ['σ*2p', 1, 1]], nomix: [['σ2s', 0, 1], ['σ*2s', 1, 1], ['σ2p', 0, 1], ['π2p', 0, 2], ['π*2p', 1, 2], ['σ*2p', 1, 1]], one: [['σ1s', 0, 1], ['σ*1s', 1, 1]] };
  function moFill(mol, charge) {
    var syms = mol === 'NO' ? ['N', 'O'] : mol === 'CO' ? ['C', 'O'] : [mol.replace(/2$/, ''), mol.replace(/2$/, '')], row1 = syms[0] === 'H' || syms[0] === 'He';
    var ne = syms.reduce(function (a, s) { var Z = BYS[s].Z; return a + (row1 ? Z : Z - 2); }, 0) - (charge || 0);
    var seq = row1 ? MOSEQ.one : (['O', 'F', 'Ne'].indexOf(syms[0]) >= 0 && syms[0] === syms[1]) ? MOSEQ.nomix : MOSEQ.mix;
    var levels = seq.map(function (q) { return { n: q[0], anti: q[1], deg: q[2], e: [] }; }), left = ne;
    levels.forEach(function (L) { var cap = 2 * L.deg, put = M.min(cap, left); left -= put; for (var i = 0; i < L.deg; i++) L.e[i] = 0; for (var j = 0; j < put; j++) L.e[j < L.deg ? j : j - L.deg]++; });
    var bond = 0, anti = 0, unp = 0; levels.forEach(function (L) { L.e.forEach(function (x) { if (L.anti) anti += x; else bond += x; if (x === 1) unp++; }); });
    return { syms: syms, row1: row1, ne: ne, levels: levels, bo: (bond - anti) / 2, unp: unp, seq: seq };
  }
  R('ch-modiagram', function (elx, o) {
    o = opt(o, { mol: 'O2', charge: 0, step: null });
    var mol = ['H2', 'He2', 'Li2', 'Be2', 'B2', 'C2', 'N2', 'O2', 'F2', 'Ne2', 'NO', 'CO'].indexOf(o.mol) >= 0 ? o.mol : 'O2', ch = num(o.charge, 0), full = moFill(mol, ch);
    var name = fT(mol) + (ch ? sup(chargeStr(ch).replace('−', '-')) : '');
    var F = frame(elx, o, 'Molecular orbital diagram of ' + name), quiet = F.quiet, S = { n: o.step == null ? full.ne : clamp(num(o.step, full.ne), 0, full.ne) };
    var c = F.canvas({ aspect: 1.5, min: 320, max: 470, narrow: 0.9 });
    function state() { var f = moFill(mol, ch), left = S.n; f.levels.forEach(function (L) { var cap = 2 * L.deg, put = M.min(cap, left); left -= put; for (var i = 0; i < L.deg; i++) L.e[i] = 0; for (var j = 0; j < put; j++) L.e[j < L.deg ? j : j - L.deg]++; }); var b = 0, a = 0, u = 0; f.levels.forEach(function (L) { L.e.forEach(function (x) { if (L.anti) a += x; else b += x; if (x === 1) u++; }); }); f.bo = (b - a) / 2; f.unp = u; return f; }
    function draw() {
      var ctx = c.ctx, k = pal(), f = state(), nL = f.levels.length; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var top = 34, bot = c.h - 24, yOf = function (i) { return bot - (i + 0.5) * (bot - top) / nL; }, mx = c.w / 2, bw = M.min(30, c.w / 16), hetero = f.syms[0] !== f.syms[1];
      var nar = c.w < 560; arrow(ctx, nar ? 8 : 14, bot, nar ? 8 : 14, top, k.muted, 1.6, 7); txt(ctx, 'Energy', nar ? 3 : 20, top - (nar ? 16 : 6), { size: 11 });
      // atomic orbitals on the sides
      var aoL = f.row1 ? [['1s', 0.5]] : [['2s', 0.5], ['2p', 3.0]], lx = M.max(c.w * 0.15, 1.5 * bw + 36), rx = c.w - lx;
      function aoY(name, side) { var base = f.row1 ? yOf(0.5) : name === '2s' ? (yOf(0) + yOf(1)) / 2 : (yOf(2) + yOf(nL - 3)) / 2; if (hetero) base += side ? 18 : -14; return base; } // O (right) lies lower
      [0, 1].forEach(function (side) { var x = side ? rx : lx, s = f.syms[side]; txt(ctx, s, x, top - 10, { size: 13, bold: true, align: 'center', color: k.ink }); aoL.forEach(function (a) { var y = aoY(a[0], side), n = a[0] === '2p' ? 3 : 1; for (var i = 0; i < n; i++) { ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - n * bw / 2 + i * bw + 3, y); ctx.lineTo(x - n * bw / 2 + (i + 1) * bw - 3, y); ctx.stroke(); } txt(ctx, a[0], x + (side ? 1 : -1) * (n * bw / 2 + 6), y, { size: 11, align: side ? 'left' : 'right' }); }); });
      f.levels.forEach(function (L, i) {
        var y = yOf(i), w = L.deg * bw;
        var src = f.row1 ? '1s' : /2s/.test(L.n) ? '2s' : '2p';
        ctx.save(); ctx.strokeStyle = k.grid; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(lx + (src === '2p' ? 1.5 * bw : 0.5 * bw), aoY(src, 0)); ctx.lineTo(mx - w / 2, y); ctx.moveTo(rx - (src === '2p' ? 1.5 * bw : 0.5 * bw), aoY(src, 1)); ctx.lineTo(mx + w / 2, y); ctx.stroke(); ctx.restore();
        for (var j = 0; j < L.deg; j++) { var x0 = mx - w / 2 + j * bw; ctx.strokeStyle = L.anti ? k.red : k.green; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(x0 + 3, y); ctx.lineTo(x0 + bw - 3, y); ctx.stroke(); var e = L.e[j] || 0; if (e >= 1) txt(ctx, '↑', x0 + bw * 0.36, y - 8, { size: 15, bold: true, align: 'center', color: k.acc }); if (e === 2) txt(ctx, '↓', x0 + bw * 0.66, y - 8, { size: 15, bold: true, align: 'center', color: k.acc }); }
        txt(ctx, L.n, mx + w / 2 + 8, y, { size: 12, bold: true, color: L.anti ? k.red : k.green });
      });
      txt(ctx, 'bonding', mx - c.w * 0.12, bot + 12, { size: 10, align: 'center', color: k.green }); txt(ctx, 'antibonding (*)', mx + c.w * 0.12, bot + 12, { size: 10, align: 'center', color: k.red });
    }
    function report() { var f = state(); F.say((quiet ? name + ': ' + S.n + ' of ' + full.ne + ' ' + (f.row1 ? '' : 'valence ') + 'electrons placed.' : name + ': ' + S.n + ' of ' + full.ne + ' ' + (f.row1 ? '' : 'valence ') + 'electrons placed. Bond order = (bonding − antibonding) ÷ 2 = <b>' + fm(f.bo, 1) + '</b>; unpaired electrons: <b>' + f.unp + '</b> (' + (f.unp ? 'paramagnetic: attracted to a magnet' : 'diamagnetic') + ').') + (mol === 'O2' && !ch && !quiet && S.n === full.ne ? ' The Lewis structure of O₂ pairs every electron, but the two electrons in π*2p are unpaired, so liquid oxygen sticks to a magnet.' : '')); F.setAlt('Molecular orbital diagram of ' + name + ' with atomic orbitals on each side and molecular orbitals in the middle.'); }
    if (F.edit) { btn(F.ctl, 'Empty', function () { S.n = 0; draw(); report(); }); btn(F.ctl, 'Step: add one electron', function () { S.n = M.min(full.ne, S.n + 1); draw(); report(); }, 'pri'); btn(F.ctl, 'Fill all', function () { S.n = full.ne; draw(); report(); }); }
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  CH.moFill = moFill;

  // =====================================================================================================
  // ch-imf: options are documented at the top of this file
  var IMF = { // formula: [bp °C, polar, hydrogen bonding, name]
    H2O: [100.0, 1, 1, 'water'], NH3: [-33.3, 1, 1, 'ammonia'], HF: [19.5, 1, 1, 'hydrogen fluoride'], CH4: [-161.5, 0, 0, 'methane'], C2H6: [-88.6, 0, 0, 'ethane'], C3H8: [-42.1, 0, 0, 'propane'], C4H10: [-0.5, 0, 0, 'butane'], C5H12: [36.1, 0, 0, 'pentane'], C6H14: [68.7, 0, 0, 'hexane'], C8H18: [125.6, 0, 0, 'octane'],
    CH3OH: [64.7, 1, 1, 'methanol'], C2H5OH: [78.3, 1, 1, 'ethanol'], CH3OCH3: [-24.8, 1, 0, 'dimethyl ether'], CH3COCH3: [56.1, 1, 0, 'acetone'], CH3F: [-78.4, 1, 0, 'fluoromethane'], CH3Cl: [-24.2, 1, 0, 'chloromethane'], CH2Cl2: [39.6, 1, 0, 'dichloromethane'], CHCl3: [61.2, 1, 0, 'chloroform'], CCl4: [76.7, 0, 0, 'carbon tetrachloride'],
    H2S: [-60.3, 1, 0, 'hydrogen sulfide'], HCl: [-85.0, 1, 0, 'hydrogen chloride'], HBr: [-66.4, 1, 0, 'hydrogen bromide'], HI: [-35.4, 1, 0, 'hydrogen iodide'], F2: [-188.1, 0, 0, 'fluorine'], Cl2: [-34.0, 0, 0, 'chlorine'], Br2: [58.8, 0, 0, 'bromine'], I2: [184.4, 0, 0, 'iodine'], N2: [-195.8, 0, 0, 'nitrogen'], O2: [-183.0, 0, 0, 'oxygen'],
    He: [-268.9, 0, 0, 'helium'], Ne: [-246.0, 0, 0, 'neon'], Ar: [-185.8, 0, 0, 'argon'], Kr: [-153.4, 0, 0, 'krypton'], Xe: [-108.1, 0, 0, 'xenon'], H2Se: [-41.3, 1, 0, 'hydrogen selenide'], H2Te: [-2.2, 1, 0, 'hydrogen telluride'], PH3: [-87.7, 1, 0, 'phosphine'], SiH4: [-111.9, 0, 0, 'silane'], GeH4: [-88.5, 0, 0, 'germane'], SnH4: [-51.8, 0, 0, 'stannane'],
    H2O2: [150.2, 1, 1, 'hydrogen peroxide'], CH3COOH: [117.9, 1, 1, 'acetic acid'], CO2: [-78.5, 0, 0, 'carbon dioxide (sublimes)']
  };
  function imfKinds(f) { var d = IMF[f]; if (!d) return ['dispersion']; var ks = ['dispersion']; if (d[1]) ks.push('dipole–dipole'); if (d[2]) ks.push('hydrogen bonding'); return ks; }
  R('ch-imf', function (elx, o) {
    o = opt(o, { subs: null, mode: 'forces', labels: true, ion: 'Na+', spots: [{ name: 'A', rf: 0.25 }, { name: 'B', rf: 0.62 }, { name: 'C', rf: 0.85 }], solvent: 'water' });
    var mode = o.mode, subs = (o.subs || (mode === 'compare' ? ['CCl4', 'CH3F'] : ['H2O'])).filter(function (x) { return IMF[x] || x; }), quiet = !!(o.quiet || o.readout === false);
    var F = frame(elx, o, mode === 'chromatography' ? 'Paper chromatography' : mode === 'boil' ? 'Boiling pulls molecules apart' : mode === 'dissolve' ? 'Water around a dissolved ion' : 'Forces between molecules'), rnd = rng(3);
    var c = F.canvas({ aspect: mode === 'chromatography' ? 1.5 : 1.9, min: 260, max: 520, narrow: mode === 'compare' && !(o.quiet || o.readout === false) ? 0.62 : 1.0 }), S = { sep: 0, t: 0, front: V.reduced ? 1 : 0 };
    if (mode === 'chromatography') return chroma(F, o, c);
    // a fixed arrangement of molecules per panel; orientations chosen so dipoles line up head to tail
    // six molecules close together; each one's positive end points at the negative end of the next one along a chain
    function ends(f) { var sp = sprite(f), pos = 0, neg = 0, best = -1, worst = 9; sp.atoms.forEach(function (at, i) { var e = BYS[at.s] ? BYS[at.s].en || 0 : 0; if (e > best) { best = e; neg = i; } }); var hs = sp.atoms.map(function (at, i) { return at.s === 'H' ? i : -1; }).filter(function (i) { return i >= 0; }); if (hs.length) pos = hs[0]; else sp.atoms.forEach(function (at, i) { var e = BYS[at.s] ? BYS[at.s].en || 9 : 9; if (e < worst) { worst = e; pos = i; } }); return [pos, neg]; }
    function arrange(f, b, sep) {
      var u = lay(b), cx = b.x + b.w / 2, cy = b.y + b.h / 2 - 6, sx = M.min(b.w / 3.2, u * 3.1), sy = M.min((b.h - 40) / 2.2, u * 2.9), grid = [[-1, -0.5], [0, -0.5], [1, -0.5], [1, 0.5], [0, 0.5], [-1, 0.5]], out = [], r2 = rng(7), sp = sprite(f), en = ends(f), d = IMF[f] || [0, 0, 0];
      grid.forEach(function (g, i) { var x = cx + g[0] * sx * (1 + sep * 1.3) + (r2() - 0.5) * u * 0.5 + (r2() - 0.5) * sep * 40, y = cy + g[1] * sy * (1 + sep * 1.3) + (r2() - 0.5) * u * 0.4 + (r2() - 0.5) * sep * 30; out.push({ x: x, y: y, rot: r2() * TAU }); });
      if (d[1]) out.forEach(function (m, i) { var nx = out[(i + 1) % out.length], tgt = M.atan2(nx.y - m.y, nx.x - m.x), a = sp.atoms[en[0]], c0 = sp.atoms[0], base = M.atan2(a.y - c0.y, a.x - c0.x); if (en[0] === 0) base = M.atan2(-sp.atoms[en[1]].y, -sp.atoms[en[1]].x); m.rot = tgt - base; });
      return out;
    }
    function lay(b) { return clamp(M.min(b.w / 3, (b.h - 40) / 2) / 2.9, 9, 34); }
    function hAtoms(f, m, u) { var sp = sprite(f), cr = M.cos(m.rot), sr = M.sin(m.rot); return sp.atoms.map(function (a) { return { s: a.s, x: m.x + (a.x * cr - a.y * sr) * u, y: m.y + (a.x * sr + a.y * cr) * u }; }); }
    function panelDraw(ctx, f, b, sep, k) {
      var u = lay(b), ms = arrange(f, b, sep), d = IMF[f] || [0, 0, 0], flick = S.t;
      panel(ctx, b.x, b.y, b.w, b.h, { r: 10 });
      ctx.save(); rr(ctx, b.x, b.y, b.w, b.h, 10); ctx.clip();
      var all = ms.map(function (m) { return hAtoms(f, m, u); });
      // hydrogen bonds: H on one molecule to N, O or F on another, when close enough
      var en = ends(f);
      if (d[1] && sep < 0.5) ms.forEach(function (m, i) { var A = all[i], B2 = all[(i + 1) % all.length], h = A[en[0]], acc = B2[en[1]]; if (d[2]) line(ctx, [[h.x, h.y], [acc.x, acc.y]], k.gold, 2.4, [5, 4]); else line(ctx, [[h.x, h.y], [acc.x, acc.y]], k.blue, 1.6, [2, 4]); });
      ms.forEach(function (m, i) {
        // dispersion: a flickering temporary dipole (a shifting electron cloud)
        var ph = M.sin(flick * 3 + i * 1.7), cl = ctx.createRadialGradient(m.x + ph * u * 0.5, m.y, 2, m.x, m.y, u * 1.8); cl.addColorStop(0, rgba(k.blue, 0.22)); cl.addColorStop(1, rgba(k.blue, 0)); ctx.fillStyle = cl; ctx.beginPath(); ctx.arc(m.x, m.y, u * 1.8, 0, TAU); ctx.fill();
        drawMol(ctx, f, m.x, m.y, u, { rot: m.rot });
        if (d[1] && !quiet && o.labels !== false && u > 11) { var hs = hAtoms(f, m, u), neg = hs[en[1]], pos = hs[en[0]]; txt(ctx, 'δ−', neg.x + u * 0.55, neg.y - u * 0.75, { size: 11, bold: true, align: 'center', color: k.minus, serif: true }); txt(ctx, 'δ+', pos.x + u * 0.4, pos.y - u * 0.6, { size: 11, bold: true, align: 'center', color: k.plus, serif: true }); }
      });
      ctx.restore();
      fDraw(ctx, f, b.x + 10, b.y + 14, { size: 14, color: k.ink });
      if (!quiet && o.labels !== false) txtw(ctx, imfKinds(f).join(' + '), b.x + 10, b.y + b.h - 12, b.w - 20, { size: 11, bold: true, color: k.acc, up: true });
    }
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      if (mode === 'dissolve') return drawIonDipole(ctx, k);
      var n = mode === 'compare' ? M.min(3, subs.length) : 1, gap = 12, below = mode === 'compare' && !quiet && c.w < 560, barW = mode === 'compare' && !quiet ? (below ? c.w - 30 : M.min(150, c.w * 0.26)) : 0, pw = (c.w - (below ? 0 : barW) - gap * (n + 1)) / n, ph = below ? c.h * 0.58 : c.h - 16;
      for (var i = 0; i < n; i++) panelDraw(ctx, subs[i], { x: gap + i * (pw + gap), y: 8, w: pw, h: ph }, mode === 'boil' ? S.sep : 0, k);
      if (mode === 'boil' && S.sep > 0.5) txt(ctx, 'gas: molecules far apart, each still whole', c.w / 2, c.h - 24, { size: 12, bold: true, align: 'center', color: k.ink });
      if (barW) { // boiling-point bars, −270 °C to 200 °C
        var bx = c.w - barW - 4, y0 = below ? ph + 40 : 22, y1 = c.h - 26, T0 = -270, T1 = 200, Y = function (T) { return y1 - (T - T0) / (T1 - T0) * (y1 - y0); }; txt(ctx, below ? 'boiling point (°C)' : 'boiling point', bx + barW / 2, y0 - 12, { size: 11, bold: true, align: 'center', color: k.ink });
        [-200, -100, 0, 100, 200].forEach(function (T) { line(ctx, [[bx + 22, Y(T)], [bx + barW - 4, Y(T)]], k.grid, 1); txt(ctx, fm(T, 0) + '°', bx + 20, Y(T), { size: 9, align: 'right' }); });
        subs.slice(0, n).forEach(function (f, i) { var bp = (IMF[f] || [0])[0], w2 = M.min((barW - 30) / n, below ? 90 : 1e9), x = bx + 26 + i * w2 + (below ? (barW - 30 - w2 * n) / 2 : 0); ctx.fillStyle = [k.acc, k.blue, k.orange][i]; rr(ctx, x + 3, Y(bp), w2 - 6, y1 - Y(bp), 4); ctx.fill(); txt(ctx, fm(bp, 1), x + w2 / 2, Y(bp) - 8, { size: 10, align: 'center', color: k.ink }); fDraw(ctx, f, x + w2 / 2, y1 + 12, { size: 10, align: 'center' }); });
      }
    }
    function drawIonDipole(ctx, k) {
      var cx = c.w / 2, cy = c.h / 2, u = M.min(22, c.h / 12), ion = o.ion, q = parseF(ion).charge, sym = Object.keys(parseF(ion).atoms)[0], R0 = u * 3.2;
      panel(ctx, 8, 8, c.w - 16, c.h - 16, { r: 10, fill: k.water, line: k.waterLine });
      for (var i = 0; i < 6; i++) { var a = i * TAU / 6 + S.t * 0.2, x = cx + R0 * M.cos(a), y = cy + R0 * M.sin(a); drawMol(ctx, 'H2O', x, y, u, { rot: a + (q > 0 ? PI / 2 : -PI / 2) }); if (!quiet && o.labels !== false) txt(ctx, q > 0 ? 'δ−' : 'δ+', cx + (R0 - u * 1.3) * M.cos(a), cy + (R0 - u * 1.3) * M.sin(a), { size: 10, bold: true, align: 'center', color: q > 0 ? k.minus : k.plus, serif: true }); }
      ball(ctx, cx, cy, u * 1.15, sym, { charge: q, label: true });
      if (!quiet && o.labels !== false) txtw(ctx, 'ion–dipole attraction: the ' + (q > 0 ? 'O (δ−) ends' : 'H (δ+) ends') + ' of water face the ' + (q > 0 ? 'cation' : 'anion'), cx, c.h - 22, c.w - 40, { size: 12, bold: true, align: 'center', color: k.acc, up: true });
    }
    function report() {
      var s;
      if (mode === 'dissolve') s = 'Water molecules turn their ' + (parseF(o.ion).charge > 0 ? 'partly negative oxygen' : 'partly positive hydrogen') + ' ends toward the ion. Many such ion–dipole attractions pay for pulling the ion out of its crystal.';
      else if (mode === 'boil') s = S.sep < 0.5 ? 'Liquid: the molecules touch and attract one another.' : 'Gas: the molecules have pulled apart. Boiling overcomes the forces <i>between</i> molecules; the bonds <i>inside</i> each ' + fH(subs[0]) + ' molecule are not broken.';
      else if (mode === 'compare') { s = quiet ? 'Compare the forces between molecules in ' + subs.map(fH).join(' and ') + '.' : subs.map(function (f) { var d = IMF[f]; return fH(f) + ' (' + (d ? d[3] : f) + '): ' + imfKinds(f).join(', ') + '; boils at ' + (d ? fm(d[0], 1) : '?') + ' °C, molar mass ' + fm(molarMass(f), 1) + ' g/mol'; }).join('. ') + '.'; if (!quiet && subs.indexOf('CCl4') >= 0 && subs.indexOf('CH3F') >= 0) s += ' Nonpolar CCl₄ boils higher than polar CH₃F: its large electron clouds give strong dispersion forces.'; }
      else { var f = subs[0], d = IMF[f]; s = quiet ? 'Molecules of ' + fH(f) + '.' : fH(f) + ': ' + imfKinds(f).join(', ') + '.' + (d && d[2] ? ' Hydrogen bonds (dashed gold) link an H on one molecule to an N, O or F on the next.' : d && d[1] ? ' The partly positive end of each molecule attracts the partly negative end of its neighbor.' : ' Only dispersion: electron clouds shift for an instant and make temporary dipoles.') + (d ? ' Normal boiling point: ' + fm(d[0], 1) + ' °C (NIST).' : ''); }
      F.say(s); F.setAlt(mode === 'compare' ? 'Molecules of ' + subs.map(fT).join(' and ') + ' with the forces between them and their boiling points.' : 'Molecules of ' + fT(subs[0]) + ' with the attractions between them drawn.');
    }
    if (mode === 'boil' && F.edit) sl(F.ctl, { label: 'Heat it: pull the molecules apart', min: 0, max: 1, step: 0.01, value: 0, fmt: function (v) { return v < 0.5 ? 'liquid' : 'gas'; }, input: function (v) { S.sep = v; draw(); report(); } });
    var A = anim(elx, function (dt) { S.t += dt; draw(); }, true); if (F.edit) playBtn(F.ctl, A);
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  function chroma(F, o, c) { // paper chromatography: spots climb with the solvent; Rf = spot distance ÷ solvent distance
    var S = { front: V.reduced ? 1 : 0 }, quiet = F.quiet, spots = o.spots, cols = ['#e03131', '#1c7ed6', '#2f9e44', '#f08c00', '#7048e8'];
    function draw() {
      var ctx = c.ctx, k = pal(), x0 = c.w * 0.3, w = M.min(120, c.w * 0.28), y0 = c.h - 30, top = 20, start = y0 - 24, H2 = start - top - 14, fr = S.front * H2; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      ctx.fillStyle = k.dark ? '#e9e4d8' : '#fbf8ef'; ctx.fillRect(x0, top, w, y0 - top); ctx.fillStyle = 'rgba(80,150,220,.16)'; ctx.fillRect(x0, start - fr, w, y0 - start + fr); ctx.strokeStyle = k.labLine; ctx.strokeRect(x0, top, w, y0 - top);
      ctx.fillStyle = k.water; ctx.fillRect(x0 - 20, y0 - 10, w + 40, 18); line(ctx, [[x0 - 2, start], [x0 + w + 2, start]], k.muted, 1, [3, 3]); txt(ctx, 'start line', x0 - 6, start, { size: 10, align: 'right' });
      if (S.front > 0.02) { line(ctx, [[x0, start - fr], [x0 + w, start - fr]], k.blue, 1.5); txt(ctx, 'solvent front', x0 + w + 6, start - fr, { size: 10, color: k.blue }); }
      spots.forEach(function (s, i) { var y = start - num(s.rf, 0.5) * fr, x = x0 + w * (i + 1) / (spots.length + 1); ctx.fillStyle = s.color || cols[i % cols.length]; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.ellipse(x, y, 7, 5 + S.front * 3, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; txt(ctx, s.name, x, y - 13, { size: 10, bold: true, align: 'center', color: k.ink }); });
      // ruler
      var rx = x0 + w + 70; if (c.w > 420) { line(ctx, [[rx, start], [rx, start - H2]], k.ink, 1.5); for (var t = 0; t <= 10; t++) { var yy = start - H2 * t / 10; line(ctx, [[rx, yy], [rx + (t % 5 ? 5 : 9), yy]], k.ink, 1); if (!(t % 5)) txt(ctx, fm(t / 10 * 10, 0) + ' cm', rx + 12, yy, { size: 9 }); } }
      if (!quiet && S.front > 0.98) spots.forEach(function (s, i) { txt(ctx, s.name + ': Rf = ' + fm(num(s.rf, 0.5), 2), 12, 20 + i * 16, { size: 11, color: k.ink }); });
    }
    function report() { F.say(S.front < 0.98 ? 'The solvent climbs the paper and carries each substance at its own pace.' : (quiet ? 'Measure each spot\'s distance from the start line and the solvent front\'s distance.' : 'Rf = distance moved by the spot ÷ distance moved by the solvent: ' + spots.map(function (s) { return s.name + ' ' + fm(num(s.rf, 0.5), 2); }).join(', ') + '.') + ' A substance that is attracted more to the paper than to the solvent moves less; mass has nothing to do with it.'); F.setAlt('A paper chromatography strip with spots that have moved different distances.'); }
    var A = anim(F.el, function (dt) { S.front = M.min(1, S.front + dt * 0.12); draw(); if (S.front >= 1) { A.stop(); report(); } }, true);
    if (F.edit) btn(F.ctl, 'Run it again', function () { S.front = V.reduced ? 1 : 0; if (!V.reduced) A.play(); draw(); report(); });
    redraw(c, draw); draw(); report(); return { draw: draw };
  }
  CH.IMF = IMF;

  // =====================================================================================================
  // ch-crystal: options are documented at the top of this file
  R('ch-crystal', function (elx, o) {
    o = opt(o, { mode: 'ionic', strike: true, network: 'diamond', molecular: 'ice', alloy: 'substitutional', cell: 'fcc', fractions: true, rotate: false });
    var mode = o.mode, quiet = !!(o.quiet || o.readout === false);
    var F = frame(elx, o, { ionic: 'An ionic crystal', metallic: 'Metallic bonding', network: 'A network solid', molecular: 'A molecular solid', cell: 'A cubic unit cell', alloy: 'An alloy' }[mode] || 'A crystal');
    var c = F.canvas({ aspect: 1.7, min: 270, max: 420, narrow: 1.0 }), S = { hit: 0, t: 0, yaw: 0.55, pitch: 0.38, cell: o.cell };
    if (mode === 'cell') return unitCell(F, o, c, S);
    var rnd = rng(9);
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      if (mode === 'ionic' || mode === 'metallic') { var two = o.strike && F.edit; drawLattice(ctx, k, mode, { x: 8, y: 8, w: c.w - 16, h: c.h - 16 }); return; }
      if (mode === 'network') return drawNetwork(ctx, k);
      if (mode === 'molecular') return drawMolecular(ctx, k);
      if (mode === 'alloy') return drawAlloy(ctx, k);
    }
    function drawLattice(ctx, k, kind, b) {
      panel(ctx, b.x, b.y, b.w, b.h, { r: 10 });
      var cols = 9, rows = 5, d = M.min(b.w / (cols + 1), (b.h - 40) / (rows + 0.6)), x0 = b.x + (b.w - (cols - 1) * d) / 2, y0 = b.y + 26 + d * 0.6, sh = S.hit, crack = kind === 'ionic' && sh >= 1;
      for (var r = 0; r < rows; r++) for (var cc = 0; cc < cols; cc++) {
        var upper = r < 2, off = upper ? sh * d : 0, x = x0 + cc * d + off, y = y0 + r * d + (crack && upper ? -(sh - 1) * 0 - 14 * M.min(1, sh - 0.99) * 0 : 0);
        if (crack && upper) { y -= 16; x += (cc - cols / 2) * 2; }
        if (kind === 'ionic') { var pos = ((r + cc) % 2 === 0); ball(ctx, x, y, d * (pos ? 0.3 : 0.44), pos ? 'Na' : 'Cl', { charge: pos ? 1 : -1 }); }
        else ball(ctx, x, y, d * 0.38, 'Cu', { charge: 1, color: '#c98a5a' });
      }
      if (kind === 'metallic') { for (var i = 0; i < 46; i++) { var ex = b.x + 8 + ((i * 97.3 + S.t * (30 + (i % 7) * 9)) % (b.w - 16)), ey = y0 - d * 0.5 + ((i * 53.7 + S.t * (20 + (i % 5) * 7) * (i % 2 ? 1 : -1)) % (rows * d) + rows * d) % (rows * d); ctx.fillStyle = k.blue; ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.arc(ex, ey, 2.6, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
      if (kind === 'ionic' && sh > 0.3) { // like charges facing each other: repulsion arrows between the layers
        for (var c2 = 1; c2 < cols - 1; c2 += 2) { var xx = x0 + c2 * d + sh * d, yy = y0 + 1.5 * d - (crack ? 8 : 0); arrow(ctx, xx, yy, xx, yy - d * 0.45, k.red, 2, 6); arrow(ctx, xx - sh * d, yy + 2, xx - sh * d, yy + d * 0.45, k.red, 2, 6); } }
      if (!quiet) txtw(ctx, kind === 'ionic' ? (crack ? 'like charges line up and repel: it shatters' : sh > 0 ? 'one layer shifts…' : 'every ion touches ions of the other charge: no separate NaCl molecules') : (sh > 0 ? 'layers slide, and the electron sea still holds them: the metal bends' : 'metal cations in a sea of moving electrons'), b.x + b.w / 2, c.w < 560 ? b.y + b.h - 12 : b.y + 14, b.w - 16, { size: 12, bold: true, align: 'center', color: k.acc, up: c.w < 560 });
    }
    function drawNetwork(ctx, k) {
      var kind = o.network, cx = c.w / 2, cy = c.h / 2, u = M.min(c.w, c.h) / 9; panel(ctx, 8, 8, c.w - 16, c.h - 16, { r: 10 });
      if (kind === 'graphite') { // three hexagonal sheets seen at a slant
        for (var layer = 0; layer < 3; layer++) { var ly = cy - u * 2.6 + layer * u * 2.5, pts = [], aa = u * 0.8;
          for (var i = -7; i <= 7; i++) for (var j = -2; j <= 2; j++) { var hx = i * aa * 1.5, hy = j * aa * 1.732 + (i % 2 ? aa * 0.866 : 0); [[aa, 0], [aa / 2, aa * 0.866], [-aa / 2, aa * 0.866], [-aa, 0], [-aa / 2, -aa * 0.866], [aa / 2, -aa * 0.866]].forEach(function (d0) { var lx = hx + d0[0], lyy = hy + d0[1], px = cx + lx + lyy * 0.35, py = ly + lyy * 0.3; if (px > 24 && px < c.w - 24 && M.abs(lyy) < aa * 2.6 && !pts.some(function (q) { return M.hypot(q[2] - lx, q[3] - lyy) < 1; })) pts.push([px, py, lx, lyy]); }); }
          pts.forEach(function (p, i2) { pts.forEach(function (q, j2) { if (j2 > i2 && M.abs(M.hypot(q[2] - p[2], q[3] - p[3]) - aa) < 1) line(ctx, [[p[0], p[1]], [q[0], q[1]]], k.muted, 1.6); }); });
          pts.forEach(function (p) { ball(ctx, p[0], p[1], u * 0.11, 'C', { flat: true }); });
          if (layer < 2) txt(ctx, 'weak forces between sheets', c.w - 30, ly + u * 1.25, { size: 10, align: 'right' }); }
        if (!quiet) txtw(ctx, 'graphite: covalent sheets held together by weak forces, so the layers slide', cx, c.h - 18, c.w - 24, { size: 12, bold: true, align: 'center', color: k.acc, up: true, bg: rgba(pal().bg, 0.85) }); return; }
      if (kind === 'quartz') { var pts = []; for (var a = 0; a < 6; a++) for (var r2 = 0; r2 < 2; r2++) { var ang = a * TAU / 6 + r2 * PI / 6, rad = u * (r2 ? 3.2 : 1.7); pts.push([cx + rad * M.cos(ang), cy + rad * M.sin(ang) * 0.8]); } pts.forEach(function (p, i) { pts.forEach(function (q, j) { if (j <= i) return; var dd = M.hypot(p[0] - q[0], p[1] - q[1]); if (dd < u * 1.9) { var mxx = (p[0] + q[0]) / 2, myy = (p[1] + q[1]) / 2; line(ctx, [p, q], k.muted, 2); ball(ctx, mxx, myy, u * 0.2, 'O'); } }); }); pts.forEach(function (p) { ball(ctx, p[0], p[1], u * 0.26, 'Si'); }); if (!quiet) txtw(ctx, 'quartz, SiO₂: each Si bonded to 4 O, each O to 2 Si, through the whole crystal', cx, c.h - 18, c.w - 24, { size: 12, bold: true, align: 'center', color: k.acc, up: true, bg: rgba(pal().bg, 0.85) }); return; }
      // diamond: a 2-D view of the tetrahedral network (zigzag rows)
      for (var row = -2; row <= 2; row++) for (var col = -6; col <= 6; col++) { var x3 = cx + col * u * 0.8, y3 = cy + row * u * 1.25 + (col % 2 ? u * 0.32 : -u * 0.32) * (row % 2 ? -1 : 1); if (x3 < 24 || x3 > c.w - 24) continue; var nx = cx + (col + 1) * u * 0.8, ny = cy + row * u * 1.25 + ((col + 1) % 2 ? u * 0.32 : -u * 0.32) * (row % 2 ? -1 : 1); if (nx < c.w - 24) line(ctx, [[x3, y3], [nx, ny]], k.muted, 2.2); if (row < 2 && (col + row) % 2 === 0) line(ctx, [[x3, y3], [x3, y3 + u * 1.25 + ((col % 2 ? -u * 0.32 : u * 0.32) * (row % 2 ? -1 : 1)) * 2]], k.muted, 2.2); ball(ctx, x3, y3, u * 0.2, 'C'); }
      if (!quiet) txtw(ctx, 'diamond: every carbon is covalently bonded to 4 others; no molecules, one giant network', cx, c.h - 18, c.w - 24, { size: 12, bold: true, align: 'center', color: k.acc, up: true, bg: rgba(pal().bg, 0.85) });
    }
    function drawMolecular(ctx, k) {
      var ice = o.molecular !== 'dryice', cx = c.w / 2, cy = c.h / 2, u = M.min(c.w, c.h) / 11; panel(ctx, 8, 8, c.w - 16, c.h - 16, { r: 10 });
      if (ice) { // open hexagonal rings of water molecules joined by hydrogen bonds
        var cen = [], R0 = u * 1.9; for (var i = -2; i <= 2; i++) for (var j = -1; j <= 1; j++) { var hx = cx + i * R0 * 1.5, hy = cy + j * R0 * 1.73 + (i % 2 ? R0 * 0.87 : 0); for (var a = 0; a < 6; a++) { var px = hx + R0 * M.cos(a * PI / 3), py = hy + R0 * M.sin(a * PI / 3); if (px > 20 && px < c.w - 20 && py > 20 && py < c.h - 34 && !cen.some(function (q) { return M.hypot(q[0] - px, q[1] - py) < 4; })) cen.push([px, py]); } }
        cen.forEach(function (p, i) { cen.forEach(function (q, j) { if (j <= i) return; if (M.abs(M.hypot(p[0] - q[0], p[1] - q[1]) - R0) < 3) line(ctx, [p, q], k.gold, 1.6, [4, 4]); }); });
        cen.forEach(function (p, i) { drawMol(ctx, 'H2O', p[0], p[1], u * 0.62, { rot: (i * 2.1) % TAU }); });
        if (!quiet) txtw(ctx, 'ice: hydrogen bonds hold water molecules in open rings, so ice is less dense than liquid water', cx, c.h - 18, c.w - 24, { size: 12, bold: true, align: 'center', color: k.acc, up: true, bg: rgba(pal().bg, 0.85) });
      } else { for (var r = 0; r < 4; r++) for (var cc = 0; cc < 7; cc++) { var x = cx + (cc - 3) * u * 2.2, y = cy - u * 3 + r * u * 2 + (cc % 2) * u; if (x < 20 || x > c.w - 20) continue; drawMol(ctx, 'CO2', x, y, u * 0.7, { rot: (r + cc) % 2 ? 0.8 : -0.8 }); } if (!quiet) txtw(ctx, 'dry ice: whole CO₂ molecules held in place only by weak dispersion forces', cx, c.h - 18, c.w - 24, { size: 12, bold: true, align: 'center', color: k.acc, up: true, bg: rgba(pal().bg, 0.85) }); }
    }
    function drawAlloy(ctx, k) {
      var sub2 = o.alloy !== 'interstitial', cols = 9, rows = 5, d = M.min((c.w - 30) / cols, (c.h - (c.w < 560 ? 80 : 60)) / rows), x0 = (c.w - (cols - 1) * d) / 2, y0 = (c.w < 560 ? 18 : 30) + d * 0.5; panel(ctx, 8, 8, c.w - 16, c.h - 16, { r: 10 });
      for (var r = 0; r < rows; r++) for (var cc = 0; cc < cols; cc++) { var x = x0 + cc * d, y = y0 + r * d, other = sub2 && ((r * 7 + cc * 3) % 5 === 0); ball(ctx, x, y, d * 0.46, other ? 'Zn' : 'Cu', { color: other ? '#9fb7d0' : '#c98a5a' }); if (!sub2 && r < rows - 1 && cc < cols - 1 && (r + cc) % 3 === 0) ball(ctx, x + d / 2, y + d / 2, d * 0.17, 'C'); }
      if (!quiet) { var at2 = sub2 ? 'substitutional alloy (brass): Zn atoms take the places of some Cu atoms' : 'interstitial alloy (steel): small C atoms fit in the gaps between Fe atoms'; if (c.w < 560) txtw(ctx, at2, c.w / 2, y0 + (rows - 0.5) * d + 18, c.w - 32, { size: 12, bold: true, align: 'center', color: k.acc }); else txt(ctx, at2, c.w / 2, 20, { size: 12, bold: true, align: 'center', color: k.acc }); }
    }
    function report() {
      var s = { ionic: S.hit >= 1 ? 'The shift lines up ions of the same charge, which repel, so the crystal breaks: ionic solids are brittle.' : 'An ionic crystal is a lattice: each Na⁺ touches six Cl⁻ and each Cl⁻ six Na⁺. The formula NaCl gives the 1 : 1 ratio, not a molecule.', metallic: S.hit > 0 ? 'The layers slid, but the electrons still hold every cation, so the metal bends instead of breaking (it is malleable).' : 'In a metal the outer electrons move freely among the cations. That is why metals conduct electricity and bend instead of shattering.', network: 'In a network solid every atom is joined to its neighbors by covalent bonds, so melting it means breaking bonds: very high melting points.', molecular: 'In a molecular solid whole molecules are held by forces between molecules, which are weak, so these solids melt or sublime at low temperatures.', alloy: o.alloy === 'interstitial' ? 'Small atoms in the gaps make it harder for layers to slide, so steel is harder than pure iron.' : 'Different-sized atoms in the lattice make the layers slide less easily, so brass is harder than copper.' }[mode];
      F.say(s); F.setAlt({ ionic: 'A grid of alternating sodium and chloride ions.', metallic: 'A grid of metal cations with electrons moving among them.', network: 'A network of covalently bonded atoms.', molecular: 'Molecules held in a regular pattern by forces between molecules.', alloy: 'A metal lattice with atoms of a second element.' }[mode]);
    }
    if (F.edit && o.strike && (mode === 'ionic' || mode === 'metallic')) { btn(F.ctl, '🔨 Strike it', function () { S.target = mode === 'ionic' ? 1.2 : 1; if (V.reduced) { S.hit = S.target; draw(); report(); } else if (!A.running()) A.play(); }, 'pri'); btn(F.ctl, 'Reset', function () { S.hit = 0; S.target = 0; draw(); report(); }); }
    var A = anim(elx, function (dt) { S.t += dt; if (S.target != null && S.hit < S.target) { S.hit = M.min(S.target, S.hit + dt * 0.8); if (S.hit >= S.target) report(); } draw(); }, mode === 'metallic');
    if (mode === 'metallic' && F.edit) playBtn(F.ctl, A);
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  // the unit cell: sc (a = 2r), bcc (a√3 = 4r), fcc (a√2 = 4r); each corner atom is shared by 8 cells, each face atom by 2
  var CELLS = { sc: { n: 1, f: 'a = 2r', name: 'simple cubic' }, bcc: { n: 2, f: 'a√3 = 4r', name: 'body-centered cubic' }, fcc: { n: 4, f: 'a√2 = 4r', name: 'face-centered cubic' }, nacl: { n: 4, f: 'a = 2r₊ + 2r₋', name: 'rock salt (NaCl)' } };
  function cellAtoms(kind) { // positions in units of the edge, from 0 to 1; share = fraction inside the cell
    var at = [], i, j, l;
    for (i = 0; i <= 1; i++) for (j = 0; j <= 1; j++) for (l = 0; l <= 1; l++) at.push({ v: [i, j, l], share: 1 / 8, s: kind === 'nacl' ? 'Cl' : 'Cu' });
    if (kind === 'bcc') at.push({ v: [0.5, 0.5, 0.5], share: 1, s: 'Cu' });
    if (kind === 'fcc' || kind === 'nacl') [[0.5, 0.5, 0], [0.5, 0.5, 1], [0.5, 0, 0.5], [0.5, 1, 0.5], [0, 0.5, 0.5], [1, 0.5, 0.5]].forEach(function (p) { at.push({ v: p, share: 1 / 2, s: kind === 'nacl' ? 'Cl' : 'Cu' }); });
    if (kind === 'nacl') { [[0.5, 0, 0], [0.5, 1, 0], [0.5, 0, 1], [0.5, 1, 1], [0, 0.5, 0], [1, 0.5, 0], [0, 0.5, 1], [1, 0.5, 1], [0, 0, 0.5], [1, 0, 0.5], [0, 1, 0.5], [1, 1, 0.5]].forEach(function (p) { at.push({ v: p, share: 1 / 4, s: 'Na' }); }); at.push({ v: [0.5, 0.5, 0.5], share: 1, s: 'Na' }); }
    return at;
  }
  function unitCell(F, o, c, S) {
    var quiet = F.quiet;
    var C2 = cam(c, { change: draw }); C2.yaw = 0.55; C2.pitch = 0.4;
    if (F.edit) seg(F.ctl, 'Cell', [['sc', 'Simple'], ['bcc', 'Body-centered'], ['fcc', 'Face-centered'], ['nacl', 'NaCl']], S.cell, function (v) { S.cell = v; draw(); report(); });
    function draw() {
      var ctx = c.ctx, k = pal(), kind = S.cell, at = cellAtoms(kind), sc = M.min(c.w, c.h) * 0.42, cx = c.w / 2, cy = c.h / 2 + 6; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.dark ? '#13201a' : '#f7faf8'; ctx.fillRect(0, 0, c.w, c.h);
      function P(v) { return proj([v[0] - 0.5, v[1] - 0.5, v[2] - 0.5], C2.yaw, C2.pitch, cx, cy, sc); }
      var corners = []; for (var i = 0; i < 8; i++) corners.push([i & 1, (i >> 1) & 1, (i >> 2) & 1]);
      var edges = []; corners.forEach(function (a, i) { corners.forEach(function (b, j) { if (j > i && M.abs(a[0] - b[0]) + M.abs(a[1] - b[1]) + M.abs(a[2] - b[2]) === 1) edges.push([a, b]); }); });
      // the hull of the projected cube, to show which part of each atom lies inside the cell
      var hull = corners.map(P).map(function (p) { return [p[0], p[1]]; }); hull = convexHull(hull);
      var rAtom = kind === 'sc' ? 0.5 : kind === 'bcc' ? M.sqrt(3) / 4 : kind === 'fcc' ? M.sqrt(2) / 4 : 0.29;
      var items = at.map(function (a) { var p = P(a.v); return { p: p, a: a }; }).sort(function (x, y) { return x.p[2] - y.p[2]; });
      items.forEach(function (it) { var rr2 = (it.a.s === 'Na' ? 0.21 : rAtom) * sc * 0.98; ball(ctx, it.p[0], it.p[1], rr2, it.a.s, { alpha: 0.13, color: it.a.s === 'Na' ? '#ae5ad8' : it.a.s === 'Cl' ? '#2f9e44' : '#c98a5a' }); ctx.save(); ctx.beginPath(); hull.forEach(function (h, j) { if (j) ctx.lineTo(h[0], h[1]); else ctx.moveTo(h[0], h[1]); }); ctx.closePath(); ctx.clip(); ball(ctx, it.p[0], it.p[1], rr2, it.a.s, { color: it.a.s === 'Na' ? '#ae5ad8' : it.a.s === 'Cl' ? '#2f9e44' : '#c98a5a' }); ctx.restore(); if (o.fractions !== false && !quiet) { var lab = it.a.share === 1 ? '1' : it.a.share === 0.5 ? '½' : it.a.share === 0.25 ? '¼' : '⅛'; pill(ctx, lab, it.p[0], it.p[1], { size: 11, bg: 'rgba(255,255,255,.85)', color: '#1d2320' }); } });
      edges.forEach(function (e) { var a = P(e[0]), b = P(e[1]); line(ctx, [[a[0], a[1]], [b[0], b[1]]], k.ink, 1.6); });
      // the touching line: body diagonal (bcc), face diagonal (fcc) or edge (sc)
      if (!quiet) { var d0 = kind === 'bcc' ? [[0, 0, 0], [1, 1, 1]] : kind === 'fcc' ? [[0, 0, 0], [1, 1, 0]] : kind === 'sc' ? [[0, 0, 0], [1, 0, 0]] : [[0, 0, 0], [1, 0, 0]]; var p0 = P(d0[0]), p1 = P(d0[1]); line(ctx, [[p0[0], p0[1]], [p1[0], p1[1]]], k.gold, 2.5, [6, 4]); txt(ctx, CELLS[kind].f, 12, c.h - 14, { size: 13, bold: true, color: k.gold }); txt(ctx, CELLS[kind].name, 12, 16, { size: 13, bold: true, color: k.ink }); }
      txt(ctx, 'drag to turn', c.w - 10, c.h - 12, { size: 10, align: 'right' });
    }
    function report() { var kind = S.cell, s; if (quiet) s = 'A ' + CELLS[kind].name.replace(/ \(NaCl\)/, '') + ' unit cell. Count the atoms that belong to it.'; else if (kind === 'nacl') s = 'NaCl cell: Cl⁻ at 8 corners (8 × ⅛ = 1) and 6 faces (6 × ½ = 3): 4 Cl⁻. Na⁺ on 12 edges (12 × ¼ = 3) and 1 center: 4 Na⁺. So 4 formula units per cell, a 1 : 1 ratio.'; else s = CELLS[kind].name + ': ' + (kind === 'sc' ? '8 corners × ⅛ = <b>1 atom</b>' : kind === 'bcc' ? '8 × ⅛ + 1 center = <b>2 atoms</b>' : '8 × ⅛ + 6 faces × ½ = <b>4 atoms</b>') + ' per cell. The atoms touch along the ' + (kind === 'sc' ? 'edge' : kind === 'bcc' ? 'body diagonal' : 'face diagonal') + ', so ' + CELLS[kind].f + '.'; F.say(s); F.setAlt('A 3-D cubic unit cell (' + CELLS[kind].name + ') with the parts of each atom inside the cell shown solid.'); }
    var A = anim(F.el, function (dt) { C2.yaw += dt * 0.3; draw(); }, !!o.rotate);
    if (F.edit) playBtn(F.ctl, A);
    c.cv.setAttribute('aria-label', 'A 3-D unit cell. Drag, or use the arrow keys, to turn it.');
    redraw(c, draw); draw(); report(); return { draw: draw };
  }
  function convexHull(pts) { pts = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }); function cr(o2, a, b) { return (a[0] - o2[0]) * (b[1] - o2[1]) - (a[1] - o2[1]) * (b[0] - o2[0]); } var lo = [], up = []; pts.forEach(function (p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }); pts.slice().reverse().forEach(function (p) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }); return lo.slice(0, -1).concat(up.slice(0, -1)); }
  CH.cellAtoms = cellAtoms;

  // =====================================================================================================
  // ch-phasediagram: options are documented at the top of this file
  var PHD = {
    H2O: { name: 'water', T: [[-60, 0.04], [0, 0.275], [0.01, 0.30], [100, 0.58], [374, 0.84], [450, 0.97]], P: [[1e-5, 0.03], [0.00604, 0.24], [1, 0.52], [218, 0.84], [2000, 0.97]], tp: [0.01, 0.00604], cp: [374, 218], mp: 0, bp: 100, fusSlope: -1 },
    CO2: { name: 'carbon dioxide', T: [[-120, 0.04], [-78.5, 0.30], [-56.6, 0.42], [31.0, 0.80], [80, 0.97]], P: [[0.01, 0.03], [1, 0.38], [5.11, 0.55], [72.8, 0.86], [300, 0.97]], tp: [-56.6, 5.11], cp: [31.0, 72.8], subl: -78.5, fusSlope: 1 },
    generic: { name: 'a substance', T: [[0, 0.04], [1, 0.32], [2, 0.6], [3, 0.82], [4, 0.97]], P: [[0.01, 0.03], [0.1, 0.30], [1, 0.5], [10, 0.82], [100, 0.97]], tp: [1, 0.1], cp: [3, 10], fusSlope: 0.4, generic: true }
  };
  function pwl(keys, v, lg) { // piecewise linear (log for pressure) mapping between key values and schematic positions
    var f = function (x) { return lg ? log10(x) : x; }, x = f(v);
    if (x <= f(keys[0][0])) return keys[0][1] + (x - f(keys[0][0])) * (keys[1][1] - keys[0][1]) / (f(keys[1][0]) - f(keys[0][0]));
    for (var i = 1; i < keys.length; i++) if (x <= f(keys[i][0])) return lerp(keys[i - 1][1], keys[i][1], (x - f(keys[i - 1][0])) / (f(keys[i][0]) - f(keys[i - 1][0])));
    var n = keys.length; return keys[n - 1][1] + (x - f(keys[n - 1][0])) * (keys[n - 1][1] - keys[n - 2][1]) / (f(keys[n - 1][0]) - f(keys[n - 2][0]));
  }
  function ipwl(keys, u, lg) { var lo = keys[0][0], hi = keys[keys.length - 1][0]; if (lg) { lo = log10(lo) - 2; hi = log10(hi) + 1; var r = bisect(function (x) { return pwl(keys, M.pow(10, x), true) - u; }, lo, hi, 60); return M.pow(10, r); } return bisect(function (x) { return pwl(keys, x, false) - u; }, lo - (hi - lo), hi + (hi - lo), 60); }
  function phaseModel(sub) {
    var D = PHD[sub] || PHD.H2O, xt = pwl(D.T, D.tp[0]), yt = pwl(D.P, D.tp[1], true), xc = pwl(D.T, D.cp[0]), yc = pwl(D.P, D.cp[1], true), y1 = pwl(D.P, 1, true);
    var xb = D.bp != null ? pwl(D.T, D.bp) : (xt + xc) / 2 + 0.02, yb = D.bp != null ? y1 : (yt + yc) / 2 - 0.04;
    var vap = function (x) { // quadratic through the triple point, (bp, 1 atm) and the critical point
      var x0 = xt, x1b = xb, x2 = xc, a0 = yt, a1 = yb, a2 = yc; return a0 * (x - x1b) * (x - x2) / ((x0 - x1b) * (x0 - x2)) + a1 * (x - x0) * (x - x2) / ((x1b - x0) * (x1b - x2)) + a2 * (x - x0) * (x - x1b) / ((x2 - x0) * (x2 - x1b)); };
    var subl = function (x) { var x0 = 0.02; return x <= x0 ? 0 : yt * M.pow((x - x0) / (xt - x0), 1.7); };
    if (D.subl != null) { var xs = pwl(D.T, D.subl), x0s = 0.02, pw = log10(y1 / yt) / log10((xs - x0s) / (xt - x0s)); subl = function (x) { return x <= x0s ? 0 : yt * M.pow((x - x0s) / (xt - x0s), pw); }; }
    var fus = function (y) { return xt + D.fusSlope * 0.07 * (y - yt) / (1 - yt) * (D.fusSlope < 0 ? 1 : 1.2); };
    if (D.mp != null) { var xm = pwl(D.T, D.mp), k2 = (xm - xt) / (y1 - yt); fus = function (y) { return xt + k2 * (y - yt); }; }
    function phase(x, y) { if (x > xc && y > yc) return 'supercritical fluid'; if (x < xt) return y < subl(x) ? 'gas' : (y >= yt && x > fus(y) ? 'liquid' : 'solid'); if (x <= xc) { if (y < vap(x)) return 'gas'; return y >= yt && x < fus(y) ? 'solid' : 'liquid'; } return y < yc ? 'gas' : 'liquid'; }
    return { D: D, xt: xt, yt: yt, xc: xc, yc: yc, y1: y1, vap: vap, subl: subl, fus: fus, phase: phase };
  }
  function antoineH2O(T) { return M.pow(10, 8.07131 - 1730.63 / (T + 233.426)); } // mmHg, T in °C (1 to 100 °C)
  R('ch-phasediagram', function (elx, o) {
    o = opt(o, { sub: 'H2O', point: null, path: null, mode: 'diagram', T: 25, amount: 0.5, m: 1.0, i: 1 });
    var mode = o.mode, F = frame(elx, o, mode === 'vp' ? 'Vapor pressure in a closed flask' : mode === 'solution' ? 'A solution beside the pure solvent' : 'Phase diagram of ' + (PHD[o.sub] || PHD.H2O).name), quiet = F.quiet;
    if (mode === 'vp') return vaporFlask(F, o);
    var Pm = phaseModel(mode === 'solution' ? 'H2O' : o.sub), D = Pm.D, c = F.canvas({ aspect: 1.45, min: 300, max: 440, narrow: 1.0 }), Ch;
    var S = { x: o.point ? pwl(D.T, num(o.point.T, 25)) : 0.45, y: o.point ? pwl(D.P, num(o.point.P, 1), true) : Pm.y1 };
    if (!o.point && D.generic) { S.x = 0.5; S.y = 0.5; }
    function draw() {
      var ctx = c.ctx, k = pal(); Ch = chart(c, { x: [0, 1], y: [0, 1], xticks: false, yticks: false, grid: false, xl: 'Temperature', yl: 'Pressure', ml: 54, mb: 40 }); ctx.clearRect(0, 0, c.w, c.h); Ch.draw(ctx); var b = Ch.box();
      // regions, lightly tinted
      var cols = { solid: rgba(k.blue, 0.10), liquid: rgba(k.green, 0.10), gas: rgba(k.gold, 0.10), 'supercritical fluid': rgba(k.purple, 0.10) };
      var step = 6; for (var px = b.x0; px < b.x1; px += step) for (var py = b.y0; py < b.y1; py += step) { var ph = Pm.phase(Ch.x(px + step / 2), Ch.y(py + step / 2)); ctx.fillStyle = cols[ph]; ctx.fillRect(px, py, step, step); }
      // the three curves
      var sub2 = [], vap2 = [], fus2 = [], i; for (i = 0; i <= 60; i++) { var x = 0.02 + (Pm.xt - 0.02) * i / 60; sub2.push([x, Pm.subl(x)]); x = Pm.xt + (Pm.xc - Pm.xt) * i / 60; vap2.push([x, Pm.vap(x)]); var y = Pm.yt + (1 - Pm.yt) * i / 60; fus2.push([Pm.fus(y), y]); }
      if (mode === 'solution') drawSolution(ctx, k, b);
      Ch.path(ctx, sub2, k.ink, 2.4); Ch.path(ctx, vap2, k.ink, 2.4); Ch.path(ctx, fus2, k.ink, 2.4);
      ctx.fillStyle = k.ink; [[Pm.xt, Pm.yt], [Pm.xc, Pm.yc]].forEach(function (p) { ctx.beginPath(); ctx.arc(Ch.X(p[0]), Ch.Y(p[1]), 5, 0, TAU); ctx.fill(); });
      var nar = b.x1 - b.x0 < 400; if (!quiet) { pill(ctx, 'triple point' + (D.generic || nar ? '' : ': ' + fm(D.tp[0], 2) + ' °C, ' + fm(D.tp[1], 5) + ' atm'), Ch.X(Pm.xt) + 8, Ch.Y(Pm.yt) + 16, { align: 'left', size: 11, bold: false, clampW: c.w }); pill(ctx, 'critical point' + (D.generic || nar ? '' : ': ' + fm(D.cp[0], 1) + ' °C, ' + fm(D.cp[1], 1) + ' atm'), Ch.X(Pm.xc) - 6, Ch.Y(Pm.yc) - 16, { align: 'right', size: 11, bold: false, clampW: c.w });
        var yLq = nar ? 0.7 : 0.66, xV = Pm.xc; if (yLq < Pm.yc) { var lo3 = Pm.xt, hi3 = Pm.xc; for (var it3 = 0; it3 < 40; it3++) { var md3 = (lo3 + hi3) / 2; if (Pm.vap(md3) < yLq) lo3 = md3; else hi3 = md3; } xV = (lo3 + hi3) / 2; } var xLq = (Pm.fus(yLq) + xV) / 2;
        [['solid', 0.12, 0.8], ['liquid', xLq, yLq], ['gas', nar ? 0.78 : (Pm.xt + Pm.xc) / 2 + 0.12, nar ? 0.2 : 0.14]].forEach(function (L) { txt(ctx, L[0], Ch.X(L[1]), Ch.Y(L[2]), { size: 15, bold: true, align: 'center', color: k.ink }); }); if (Pm.xc < 0.9) txt(ctx, nar ? 'super-' : 'supercritical', nar ? b.x1 - 4 : Ch.X(0.93), Ch.Y(0.93) - (nar ? 6 : 0), { size: 11, align: nar ? 'right' : 'center', color: k.purple }); if (Pm.xc < 0.9 && nar) txt(ctx, 'critical', b.x1 - 4, Ch.Y(0.93) + 7, { size: 11, align: 'right', color: k.purple }); }
      // 1 atm line and the normal melting and boiling points
      if (!D.generic) { line(ctx, [[b.x0, Ch.Y(Pm.y1)], [b.x1, Ch.Y(Pm.y1)]], k.muted, 1.2, [5, 4]); txt(ctx, '1 atm', b.x0 - 4, Ch.Y(Pm.y1), { size: 10, align: 'right' });
        var marks = D.subl != null ? [[D.subl, 'sublimes ' + fm(D.subl, 1) + ' °C']] : [[D.mp, 'normal melting point ' + fm(D.mp, 0) + ' °C'], [D.bp, 'normal boiling point ' + fm(D.bp, 0) + ' °C']];
        marks.forEach(function (mk2, j) { var xm = Ch.X(pwl(D.T, mk2[0])); ctx.fillStyle = k.acc; ctx.beginPath(); ctx.arc(xm, Ch.Y(Pm.y1), 4.5, 0, TAU); ctx.fill(); line(ctx, [[xm, Ch.Y(Pm.y1)], [xm, b.y1]], rgba(k.acc, 0.5), 1, [2, 3]); if (!quiet) txt(ctx, fm(mk2[0], mk2[0] % 1 ? 1 : 0) + ' °C', xm, b.y1 + 10, { size: 10, align: 'center', color: k.acc }); }); }
      if (o.path) { var px0 = Ch.X(S.x), py0 = Ch.Y(S.y); if (o.path === 'heat') arrow(ctx, px0 + 8, py0, M.min(b.x1 - 6, px0 + (b.x1 - b.x0) * 0.35), py0, k.red, 3, 10); else arrow(ctx, px0, py0 - 8, px0, M.max(b.y0 + 6, py0 - (b.y1 - b.y0) * 0.35), k.blue, 3, 10); }
      knob(ctx, Ch.X(S.x), Ch.Y(S.y), k.acc, 8); H.draw(ctx);
      txt(ctx, 'not to scale', b.x1 - 4, b.x1 - b.x0 < 400 ? b.y1 - 10 : b.y0 + 10, { size: 10, align: 'right' });
    }
    function drawSolution(ctx, k, b) { // the solution's lines: freezing point lowered by ΔTf, boiling point raised by ΔTb
      var dTf = num(o.i, 1) * 1.86 * num(o.m, 1), dTb = num(o.i, 1) * 0.512 * num(o.m, 1), xf = pwl(D.T, -dTf) - pwl(D.T, 0), xb2 = pwl(D.T, 100 + dTb) - pwl(D.T, 100), shift = 8 * xf;
      var v2 = [], f2 = []; for (var i = 0; i <= 60; i++) { var x = Pm.xt + (Pm.xc - Pm.xt) * i / 60; v2.push([x + xb2 * 3, Pm.vap(x)]); var y = Pm.yt * 0.9 + (1 - Pm.yt * 0.9) * i / 60; f2.push([Pm.fus(y) + shift, y]); }
      Ch.path(ctx, v2, k.acc, 2.4, [7, 5]); Ch.path(ctx, f2, k.acc, 2.4, [7, 5]);
      var xfp = Ch.X(pwl(D.T, 0)), xfs = Ch.X(pwl(D.T, 0) + shift), xbp = Ch.X(pwl(D.T, 100)), xbs = Ch.X(pwl(D.T, 100) + xb2 * 3), y1 = Ch.Y(Pm.y1);
      arrow(ctx, xfp, y1 + 14, xfs, y1 + 14, k.acc, 2, 7); arrow(ctx, xbp, y1 + 14, xbs, y1 + 14, k.acc, 2, 7);
      if (!quiet) { pill(ctx, 'ΔTf = ' + fm(dTf, 2) + ' °C', (xfp + xfs) / 2, y1 + 30, { size: 11, clampW: c.w }); pill(ctx, 'ΔTb = ' + fm(dTb, 3) + ' °C', (xbp + xbs) / 2, y1 + (M.abs(xbp - xfp) < 150 ? 52 : 30), { size: 11, clampW: c.w }); }
      if (b.x1 - b.x0 >= 400) txt(ctx, '— pure water   - - solution', b.x0 + 8, b.y0 + 12, { size: 11, color: k.ink });
    }
    function report() {
      var T = ipwl(D.T, S.x), P = ipwl(D.P, S.y, true), ph = Pm.phase(S.x, S.y), s;
      if (mode === 'solution') { var dTf = num(o.i, 1) * 1.86 * num(o.m, 1), dTb = num(o.i, 1) * 0.512 * num(o.m, 1); s = quiet ? 'Dissolved particles move both lines.' : 'With ' + fm(num(o.m, 1), 3) + ' mol/kg of dissolved particles (i = ' + fm(num(o.i, 1), 2) + '): ΔTf = i·Kf·m = ' + fm(dTf, 3) + ' °C lower, ΔTb = i·Kb·m = ' + fm(dTb, 3) + ' °C higher. The solution freezes at ' + fm(-dTf, 2) + ' °C and boils at ' + fm(100 + dTb, 3) + ' °C at 1 atm, because the dissolved particles lower the vapor pressure. (The shifts are exaggerated on the picture: solid lines are pure water, dashed lines the solution.)'; }
      else { var nb = {}; [[0.012, 0], [-0.012, 0], [0, 0.012], [0, -0.012]].forEach(function (d0) { nb[Pm.phase(S.x + d0[0], S.y + d0[1])] = 1; }); var both = Object.keys(nb); if (both.length > 1 && ph !== 'supercritical fluid' && both.indexOf('supercritical fluid') < 0) ph = 'on the line: ' + both.join(' and ') + ' together'; }
      if (mode !== 'solution') s = quiet ? 'Read the phase from the region the point is in.' : 'The point: ' + (D.generic ? '' : 'about ' + fm(T, M.abs(T) < 10 ? 1 : 0) + ' °C and ' + sf(P, 2) + ' atm: ') + '<b>' + ph + '</b>. ' + (ph === 'supercritical fluid' ? 'Above the critical point, liquid and gas are no longer different.' : 'The phase comes from the region the point is in, not from the nearest line.') + (o.sub === 'H2O' ? ' Water\'s solid–liquid line leans left: squeezing ice can melt it.' : o.sub === 'CO2' ? ' At 1 atm, solid CO₂ turns straight into gas: its triple point is above 1 atm.' : '') + (!D.generic && c.w < 560 ? ' Triple point ' + fm(D.tp[0], 2) + ' °C, ' + fm(D.tp[1], 5) + ' atm; critical point ' + fm(D.cp[0], 1) + ' °C, ' + fm(D.cp[1], 1) + ' atm.' : '');
      F.say(s); F.setAlt('Pressure–temperature phase diagram of ' + D.name + ' (not to scale), with solid, liquid and gas regions, the triple point and the critical point.');
    }
    var H = hand(c, [{ get: function () { return Ch ? [Ch.X(S.x), Ch.Y(S.y)] : [0, 0]; }, set: function (px, py) { S.x = clamp(Ch.x(px), 0.01, 0.99); S.y = clamp(Ch.y(py), 0.01, 0.99); report(); }, key: function (dx, dy) { S.x = clamp(S.x + dx * 0.01, 0.01, 0.99); S.y = clamp(S.y - dy * 0.01, 0.01, 0.99); report(); } }], { change: draw });
    if (!F.edit) H = { draw: function () { } };
    c.cv.setAttribute('aria-label', 'Phase diagram. Drag the point, or use the arrow keys, to move it.');
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  function vaporFlask(F, o) { // equal rates of leaving and returning; the vapor pressure depends on T only
    var S = { T: clamp(num(o.T, 25), 1, 100), amt: clamp(num(o.amount, 0.5), 0.15, 0.85), t: 0, out: 0, back: 0 }, quiet = F.quiet, rnd = rng(4), ps = [];
    var c = F.canvas({ aspect: 1.7, min: 280, max: 380, narrow: 1.05 });
    function geo() { var w = M.min(c.w * 0.5, 280), x0 = c.w < 520 ? (c.w - w) / 2 : c.w * 0.1, y0 = 20, h = c.h - 40; return { x0: x0, y0: y0, w: w, h: h, surf: y0 + h * (1 - S.amt) }; }
    function nVap() { return M.round(4 + antoineH2O(S.T) / 760 * 60); } // vapor molecules drawn ∝ vapor pressure (not the liquid amount)
    function sync() { var g = geo(), n = nVap(); while (ps.length < n) { var v = vel(rnd, 60); ps.push({ x: g.x0 + 10 + rnd() * (g.w - 20), y: g.y0 + 10 + rnd() * (g.surf - g.y0 - 20), vx: v[0], vy: v[1] }); } ps.length = n; }
    function step(dt) { S.t += dt; var g = geo(); ps.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; if (p.x < g.x0 + 4) { p.x = g.x0 + 4; p.vx = M.abs(p.vx); } if (p.x > g.x0 + g.w - 4) { p.x = g.x0 + g.w - 4; p.vx = -M.abs(p.vx); } if (p.y < g.y0 + 4) { p.y = g.y0 + 4; p.vy = M.abs(p.vy); } if (p.y > g.surf - 3) { // returns to the liquid; another one leaves somewhere else
        S.back++; S.out++; p.flash = 0.5; p.y = g.surf - 4; p.x = g.x0 + 6 + rnd() * (g.w - 12); var v = vel(rnd, 60); p.vx = v[0]; p.vy = -M.abs(v[1]) - 20; } if (p.flash) p.flash = M.max(0, p.flash - dt); }); draw(); }
    function draw() {
      var ctx = c.ctx, k = pal(), g = geo(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      ctx.save(); rr(ctx, g.x0, g.y0, g.w, g.h, 16); ctx.fillStyle = k.glass; ctx.fill(); ctx.strokeStyle = k.glassLine; ctx.lineWidth = 2.5; ctx.stroke(); ctx.clip(); ctx.fillStyle = k.water; ctx.fillRect(g.x0, g.surf, g.w, g.y0 + g.h - g.surf); ctx.strokeStyle = k.waterLine; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(g.x0, g.surf); ctx.lineTo(g.x0 + g.w, g.surf); ctx.stroke();
      var lr = rng(7), lh = M.max(8, g.y0 + g.h - g.surf - 14), nL = M.round(clamp((g.w - 16) * lh / 90, 12, 90)); for (var i = 0; i < nL; i++) { var lx = g.x0 + 8 + lr() * (g.w - 16), ly = g.surf + 8 + lr() * lh; ctx.fillStyle = rgba(k.blue, 0.5); ctx.beginPath(); ctx.arc(lx + M.sin(S.t * 2 + i) * 1.5, ly, 3, 0, TAU); ctx.fill(); }
      ps.forEach(function (p) { ctx.fillStyle = p.flash ? k.gold : k.blue; ctx.beginPath(); ctx.arc(p.x, p.y, 3.4, 0, TAU); ctx.fill(); });
      ctx.restore();
      // the gauge
      var gx = c.w < 520 ? c.w / 2 : c.w * 0.76, gy = c.w < 520 ? 0 : c.h * 0.4, R0 = M.min(64, c.w * 0.16); if (c.w >= 520) { var P = antoineH2O(S.T), fr = clamp(P / 760, 0, 1); ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(gx, gy, R0, PI * 0.8, PI * 2.2); ctx.stroke(); ctx.strokeStyle = k.acc; ctx.beginPath(); ctx.arc(gx, gy, R0, PI * 0.8, PI * 0.8 + fr * PI * 1.4); ctx.stroke(); ctx.restore(); txt(ctx, quiet ? 'vapor pressure' : fm(P, 1) + ' mmHg', gx, gy, { size: 15, bold: true, align: 'center', color: k.ink }); txt(ctx, 'at ' + fm(S.T, 0) + ' °C', gx, gy + 20, { size: 11, align: 'center' }); }
    }
    function report() { var P = antoineH2O(S.T); F.say((quiet ? '' : 'Water at ' + fm(S.T, 0) + ' °C: vapor pressure ' + fm(P, 1) + ' mmHg (' + sf(P / 760, 3) + ' atm). ') + 'Molecules leave the liquid and return at the same rate. Adding or removing liquid changes neither rate per unit of surface, so the vapor pressure stays the same; only the temperature changes it.' + (S.T >= 99.95 && !quiet ? ' At 100 °C it reaches 760 mmHg: water boils at 1 atm.' : '')); F.setAlt('A closed flask partly filled with water, with vapor molecules above the liquid and a pressure gauge.'); }
    if (F.edit) { sl(F.ctl, { label: 'Amount of liquid', min: 0.15, max: 0.85, step: 0.01, value: S.amt, fmt: function (v) { return M.round(v * 100) + '% full'; }, input: function (v) { S.amt = v; draw(); report(); } }); sl(F.ctl, { label: 'Temperature', min: 1, max: 100, step: 1, value: S.T, fmt: function (v) { return fm(v, 0) + ' °C'; }, input: function (v) { S.T = v; sync(); draw(); report(); } }); }
    sync(); var A = anim(F.el, step, true); if (F.edit) playBtn(F.ctl, A);
    redraw(c, draw); draw(); report(); return { draw: draw };
  }
  CH.antoineH2O = antoineH2O; CH.phaseModel = phaseModel;

  // =====================================================================================================
  // ch-heatingcurve: options are documented at the top of this file
  var HCD = { H2O: { M: 18.02, mp: 0, bp: 100, cs: 2.09, cl: 4.184, cg: 2.01, Hf: 6.01, Hv: 40.7, name: 'water' }, ethanol: { M: 46.07, mp: null, bp: 78.3, cl: 2.44, cg: 1.42, Hv: 38.6, name: 'ethanol' } };
  function heatSegments(sub, m, T1, T2) { // returns [{kind, T0, T1, q (J), label}] from T1 up to T2
    var d = HCD[sub] || HCD.H2O, n = m / d.M, segs = [], T = T1;
    function warm(c2, to, phase) { if (to > T) { segs.push({ kind: 'warm', phase: phase, T0: T, T1: to, q: m * c2 * (to - T), c: c2 }); T = to; } }
    if (d.mp != null && T < d.mp) { warm(d.cs, M.min(T2, d.mp), 'solid'); if (T2 > d.mp) segs.push({ kind: 'melt', T0: d.mp, T1: d.mp, q: n * d.Hf * 1000, H: d.Hf }); }
    if (T < d.bp) { warm(d.cl, M.min(T2, d.bp), 'liquid'); if (T2 > d.bp) segs.push({ kind: 'boil', T0: d.bp, T1: d.bp, q: n * d.Hv * 1000, H: d.Hv }); }
    warm(d.cg, T2, 'gas'); return { segs: segs, n: n, d: d };
  }
  R('ch-heatingcurve', function (elx, o) {
    o = opt(o, { sub: 'H2O', mass: 100, T1: -20, T2: 120, cool: false, q: true, inset: true, at: 0.35 });
    var sub = HCD[o.sub] ? o.sub : 'H2O', d = HCD[sub], m = M.max(1, num(o.mass, 100)), T1 = num(o.T1, -20), T2 = num(o.T2, 120); if (sub === 'ethanol') T1 = M.max(T1, -100); if (T2 <= T1) T2 = T1 + 10;
    var F = frame(elx, o, (o.cool ? 'Cooling' : 'Heating') + ' curve of ' + d.name), quiet = F.quiet, HS = heatSegments(sub, m, T1, T2), tot = HS.segs.reduce(function (a, s) { return a + s.q; }, 0), S = { f: clamp(num(o.at, 0.35), 0, 1), t: 0 };
    var c = F.canvas({ aspect: 1.75, min: 290, max: 420, narrow: 1.0 }), Ch;
    var segCol = { solid: 'blue', liquid: 'green', gas: 'orange', melt: 'purple', boil: 'red' };
    function TatQ(q) { var acc = 0; for (var i = 0; i < HS.segs.length; i++) { var sg = HS.segs[i]; if (q <= acc + sg.q + 1e-9) { var f = sg.q ? (q - acc) / sg.q : 0; return { T: sg.kind === 'warm' ? sg.T0 + f * (sg.T1 - sg.T0) : sg.T0, seg: sg, f: f }; } acc += sg.q; } var last = HS.segs[HS.segs.length - 1]; return { T: last.T1, seg: last, f: 1 }; }
    function draw() {
      var ctx = c.ctx, k = pal(), kJ = tot / 1000, wide = c.w >= 560, insetW = o.inset && wide ? 130 : 0;
      Ch = chart(c, { x: [0, kJ * 1.04], y: [M.floor((T1 - 10) / 10) * 10, M.ceil((T2 + 10) / 10) * 10], xl: 'Heat ' + (o.cool ? 'removed' : 'added') + ' (kJ)', yl: 'Temperature (°C)', mr: 14 + insetW, ml: 56, xrev: false });
      ctx.clearRect(0, 0, c.w, c.h); Ch.draw(ctx);
      var acc = 0, placed = [], hitP = function (x, y, w) { return placed.some(function (r) { return M.abs(r[0] - x) < (r[2] + w) / 2 + 2 && M.abs(r[1] - y) < 18; }); }; HS.segs.forEach(function (sg) { var x0 = acc / 1000, x1 = (acc + sg.q) / 1000, col = k[segCol[sg.kind === 'warm' ? sg.phase : sg.kind]], Ta = o.cool ? sg.T1 : sg.T0, Tb = o.cool ? sg.T0 : sg.T1; if (o.cool) { Ta = sg.T1; Tb = sg.T0; } var pts = o.cool ? [[kJ - x1, sg.T0], [kJ - x0, sg.T1]] : [[x0, sg.T0], [x1, sg.T1]]; if (o.cool) pts = [[(tot - acc - sg.q) / 1000, sg.T1], [(tot - acc) / 1000, sg.T0]].reverse(); Ch.path(ctx, pts, col, 3.5);
        if (o.q !== false && !quiet) { var mx = (pts[0][0] + pts[1][0]) / 2, my = (pts[0][1] + pts[1][1]) / 2, lab = sg.kind === 'warm' ? 'q = mcΔT = ' + fm(sg.q / 1000, 2) + ' kJ' : (sg.kind === 'melt' ? (o.cool ? 'freezing' : 'melting') : (o.cool ? 'condensing' : 'boiling')) + ': q = nΔH = ' + fm(sg.q / 1000, 2) + ' kJ'; var w2 = tw(ctx, lab, 10) + 12, bx2 = Ch.box(), px = sg.kind === 'warm' ? Ch.X(mx) + 8 + w2 / 2 : M.max(bx2.x0 + w2 / 2 + 4, Ch.X(M.min(pts[0][0], pts[1][0])) + w2 / 2), py = Ch.Y(my) + (sg.kind === 'warm' ? 0 : -14); px = clamp(px, w2 / 2 + 2, c.w - insetW - w2 / 2 - 2); for (var tries = 0; tries < 4 && hitP(px, py, w2); tries++) py += sg.kind === 'warm' ? 18 : -18; placed.push([px, py, w2]); pill(ctx, lab, px, py, { size: 10, bold: false, clampW: c.w - insetW, color: col }); }
        acc += sg.q; });
      // the marker
      var q = S.f * tot, st = TatQ(o.cool ? tot - q : q), mxp = Ch.X(q / 1000), myp = Ch.Y(st.T); knob(ctx, mxp, myp, k.acc, 8); H.draw(ctx);
      if (!quiet) { var mw = tw(ctx, fm(st.T, 1) + ' °C', 11, true) + 12, mpx = clamp(mxp, mw / 2 + 2, c.w - insetW - mw / 2 - 2), mpy = hitP(mpx, myp - 22, mw) ? myp + 22 : myp - 22; pill(ctx, fm(st.T, 1) + ' °C', mxp, mpy, { size: 11, clampW: c.w - insetW }); }
      if (insetW) drawInset(ctx, k, c.w - insetW + 4, 16, insetW - 14, st);
    }
    function phaseAt(st) { var sg = st.seg; if (sg.kind === 'warm') return [sg.phase, 0]; return sg.kind === 'melt' ? ['melt', o.cool ? 1 - st.f : st.f] : ['boil', o.cool ? 1 - st.f : st.f]; }
    function drawInset(ctx, k, x, y, w, st) { // particles at the marker: spacing and motion follow the phase
      var h = w, ph = phaseAt(st), n = 16, r2 = rng(2); panel(ctx, x, y, w, h, { r: 10 }); var spd = M.sqrt((st.T + 273.15) / 273.15);
      for (var i = 0; i < n; i++) { var col = i % 4, row = M.floor(i / 4), gx = x + 18 + col * (w - 36) / 3, gy = y + h - 18 - row * 18, liq = { x: x + 14 + r2() * (w - 28), y: y + h * 0.45 + r2() * (h * 0.48) }, gas = { x: x + 10 + r2() * (w - 20), y: y + 10 + r2() * (h - 20) };
        var mode2 = ph[0] === 'solid' ? 'solid' : ph[0] === 'liquid' ? 'liquid' : ph[0] === 'gas' ? 'gas' : ph[0] === 'melt' ? (i / n < ph[1] ? 'liquid' : 'solid') : (i / n < ph[1] ? 'gas' : 'liquid');
        var px = mode2 === 'solid' ? gx : mode2 === 'liquid' ? liq.x : gas.x, py = mode2 === 'solid' ? gy : mode2 === 'liquid' ? liq.y : gas.y, wob = (mode2 === 'solid' ? 1 : mode2 === 'liquid' ? 3 : 8) * spd;
        drawMol(ctx, sub === 'H2O' ? 'H2O' : 'C2H5OH', px + M.sin(S.t * 6 + i) * wob, py + M.cos(S.t * 5 + i * 2) * wob, sub === 'H2O' ? 7 : 5, { rot: i + S.t * (mode2 === 'solid' ? 0 : 0.8) }); }
      txt(ctx, ph[0] === 'melt' ? (o.cool ? 'freezing' : 'melting') : ph[0] === 'boil' ? (o.cool ? 'condensing' : 'boiling') : ph[0], x + w / 2, y + h + 10, { size: 11, bold: true, align: 'center', color: k.ink });
    }
    function report() {
      var q = S.f * tot, st = TatQ(o.cool ? tot - q : q), ph = phaseAt(st), s;
      s = (quiet ? '' : 'Marker: ' + fm(q / 1000, 2) + ' kJ ' + (o.cool ? 'removed' : 'added') + ', ' + fm(st.T, 1) + ' °C (' + (ph[0] === 'melt' ? (o.cool ? 'freezing' : 'melting') : ph[0] === 'boil' ? (o.cool ? 'condensing' : 'boiling') : ph[0]) + '). ') + (ph[0] === 'melt' || ph[0] === 'boil' ? 'The temperature stays flat: the energy goes into ' + (o.cool ? 'letting the particles come together' : 'pulling the particles apart') + ', not into making them move faster.' : 'The temperature changes steadily here; the slope depends on the specific heat of this phase.') + (quiet ? '' : ' Total: ' + fm(tot / 1000, 2) + ' kJ for ' + fm(m, 1) + ' g (' + HS.segs.map(function (sg) { return fm(sg.q / 1000, 2); }).join(' + ') + ').');
      F.say(s); F.setAlt((o.cool ? 'Cooling' : 'Heating') + ' curve of ' + d.name + ': temperature against heat, with sloped segments where one phase changes temperature and flat segments during melting and boiling.');
    }
    var H = hand(c, [{ get: function () { return Ch ? [Ch.X(S.f * tot / 1000), Ch.Y(TatQ(o.cool ? tot - S.f * tot : S.f * tot).T)] : [0, 0]; }, set: function (px) { S.f = clamp(Ch.x(px) * 1000 / tot, 0, 1); report(); }, key: function (dx) { S.f = clamp(S.f + dx * 0.01, 0, 1); report(); } }], { change: draw, r: 26 });
    if (F.edit) sl(F.ctl, { label: 'Heat ' + (o.cool ? 'removed' : 'added'), min: 0, max: 1, step: 0.005, value: S.f, fmt: function (v) { return quiet ? '' : fm(v * tot / 1000, 1) + ' kJ'; }, input: function (v) { S.f = v; draw(); report(); } });
    var A = anim(elx, function (dt) { S.t += dt; draw(); }, true);
    c.cv.setAttribute('aria-label', (o.cool ? 'Cooling' : 'Heating') + ' curve. Drag the marker, or use the left and right arrow keys.');
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  CH.heatSegments = heatSegments;

  // =====================================================================================================
  // ch-calorimeter: options are documented at the top of this file
  var SPH = { Cu: [0.385, 'copper'], Fe: [0.449, 'iron'], Al: [0.897, 'aluminum'], Pb: [0.129, 'lead'], Au: [0.129, 'gold'], glass: [0.84, 'glass'], granite: [0.84, 'granite'], H2O: [4.184, 'water'] };
  var RXN = { neutralization: { name: 'HCl(aq) + NaOH(aq)', V: 50.0, M: 1.00, dH: -55.8, eq: 'HCl + NaOH -> NaCl + H2O' }, NH4NO3: { name: 'NH₄NO₃ dissolving', g: 10.0, Mm: 80.04, w: 100, dH: 25.7 }, CaCl2: { name: 'CaCl₂ dissolving', g: 10.0, Mm: 110.98, w: 100, dH: -81.3 } };
  function rxnPlan(o) { var r = RXN[o.rxn] || RXN.neutralization; if (o.dH != null && o.n != null) return { name: 'the reaction', n: num(o.n, 0.05), dH: num(o.dH, -55.8), mass: num(o.mass, 100) }; if (r.V) return { name: r.name, n: r.V / 1000 * r.M, dH: r.dH, mass: 2 * r.V, note: r.V + ' mL of 1.00 M HCl + ' + r.V + ' mL of 1.00 M NaOH' }; return { name: r.name, n: r.g / r.Mm, dH: r.dH, mass: r.w + r.g, note: r.g + ' g of solid in ' + r.w + ' g of water' }; }
  R('ch-calorimeter', function (elx, o) {
    o = opt(o, { mode: 'cup', metal: 'Cu', metal2: 'Al', m1: 50, T1: 95, m2: 100, T2: 22, c1: null, c2: null, rxn: 'neutralization', q: -26.4, Ccal: 10.0 });
    var mode = o.mode, F = frame(elx, o, { contact: 'Heat flows from hot to cold', cup: 'A coffee-cup calorimeter', reaction: 'A reaction in a calorimeter', bomb: 'A bomb calorimeter' }[mode] || 'Calorimeter'), quiet = F.quiet;
    var S = { t: V.reduced ? 1 : 0 }, c = F.canvas({ aspect: 1.9, min: 280, max: 520, narrow: o.mode === 'contact' ? 1.0 : 0.66 });
    var m1 = num(o.m1, 50), m2 = num(o.m2, 100), T1 = num(o.T1, mode === 'reaction' ? 22 : mode === 'bomb' ? 25 : 95), T2 = num(o.T2, 22), c1 = num(o.c1, (SPH[o.metal] || SPH.Cu)[0]), c2 = num(o.c2, mode === 'contact' ? (SPH[o.metal2] || SPH.Al)[0] : 4.184);
    var plan = mode === 'reaction' ? rxnPlan(o) : null, Ti, Tf, qA;
    if (mode === 'contact' || mode === 'cup') { Tf = (m1 * c1 * T1 + m2 * c2 * T2) / (m1 * c1 + m2 * c2); qA = m1 * c1 * (Tf - T1); }
    else if (mode === 'reaction') { Ti = T1; qA = -plan.n * plan.dH * 1000; Tf = Ti + qA / (plan.mass * 4.184); } // q of the solution = −q of the reaction
    else { Ti = T1; Tf = Ti - num(o.q, -26.4) / num(o.Ccal, 10); qA = -num(o.q, -26.4) * 1000; }
    // temperatures over time: an exponential approach (the end values are exact; the time scale is for the picture)
    function temps(t) { var e = 1 - M.exp(-t * 4); if (mode === 'contact' || mode === 'cup') return [T1 + (Tf - T1) * e, T2 + (Tf - T2) * e]; return [Ti + (Tf - Ti) * e, Ti + (Tf - Ti) * e]; }
    function draw() {
      var ctx = c.ctx, k = pal(), wide = c.w >= 560, tm = temps(S.t); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var bars = mode === 'cup' || mode === 'reaction' || mode === 'bomb', pw = wide ? c.w * 0.45 : c.w, ph = wide ? c.h : c.h * (bars ? 0.46 : 0.55);
      if (mode === 'contact') { var bw = M.min(pw * 0.32, 110), bh = bw * 0.8, x0 = pw / 2 - bw, y0 = ph * 0.3; [0, 1].forEach(function (i) { var T = tm[i], hot = (T - 20) / 80, col = mixC('#4dabf7', '#fa5252', clamp(hot, 0, 1)); ctx.fillStyle = col; rr(ctx, x0 + i * bw, y0, bw, bh, 6); ctx.fill(); ctx.strokeStyle = k.ink; ctx.lineWidth = 1.2; ctx.stroke(); txt(ctx, (i ? SPH[o.metal2] || ['', 'block B'] : SPH[o.metal] || ['', 'block A'])[1], x0 + i * bw + bw / 2, y0 + bh + 12, { size: 11, align: 'center', color: k.ink }); if (!quiet || S.t === 0) txt(ctx, fm(T, 1) + ' °C', x0 + i * bw + bw / 2, y0 + bh / 2, { size: 14, bold: true, align: 'center', color: '#fff' }); });
        if (M.abs(tm[0] - tm[1]) > 0.3) { var dir = tm[0] > tm[1] ? 1 : -1; for (var j = 0; j < 3; j++) arrow(ctx, pw / 2 - dir * 14, y0 + bh * (0.25 + j * 0.25), pw / 2 + dir * 14, y0 + bh * (0.25 + j * 0.25), k.gold, 3, 8); txt(ctx, 'heat', pw / 2, y0 - 10, { size: 11, bold: true, align: 'center', color: k.gold }); } }
      else drawCup(ctx, k, pw, ph, tm);
      var gy = wide ? 8 : ph + (bars ? 70 : 6); drawGraph(ctx, k, wide ? pw + 10 : 8, gy, wide ? c.w - pw - 18 : c.w - 16, wide ? c.h * 0.6 : c.h - gy - 6);
      if (bars) drawBars(ctx, k, wide ? pw + 10 : 8, wide ? c.h * 0.66 : ph + 2, wide ? c.w - pw - 18 : c.w - 16, wide ? c.h * 0.32 : 60);
    }
    function drawCup(ctx, k, pw, ph, tm) {
      var cw = M.min(pw * 0.5, 170), ch2 = cw * 0.95, x0 = (pw - cw) / 2, y0 = ph * 0.2;
      // insulated cup (or the steel bomb inside water)
      ctx.save(); ctx.fillStyle = k.dark ? '#3b4a42' : '#eef1ef'; ctx.beginPath(); ctx.moveTo(x0 - 8, y0); ctx.lineTo(x0 + 6, y0 + ch2 + 8); ctx.lineTo(x0 + cw - 6, y0 + ch2 + 8); ctx.lineTo(x0 + cw + 8, y0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = k.labLine; ctx.stroke();
      ctx.fillStyle = mixC('#a5d8ff', '#ffa8a8', clamp((tm[1] - 15) / 30, 0, 1)); ctx.globalAlpha = 0.65; ctx.beginPath(); ctx.moveTo(x0, y0 + ch2 * 0.18); ctx.lineTo(x0 + 10, y0 + ch2); ctx.lineTo(x0 + cw - 10, y0 + ch2); ctx.lineTo(x0 + cw, y0 + ch2 * 0.18); ctx.closePath(); ctx.fill(); ctx.restore();
      if (mode === 'cup') { var dropY = y0 - 30 + M.min(1, S.t * 3) * (ch2 * 0.55), bs = cw * 0.3; ctx.fillStyle = mixC('#4dabf7', '#fa5252', clamp((tm[0] - 15) / 80, 0, 1)); rr(ctx, x0 + cw / 2 - bs / 2, dropY, bs, bs * 0.75, 5); ctx.fill(); ctx.strokeStyle = k.ink; ctx.stroke(); txt(ctx, (SPH[o.metal] || ['', 'metal'])[1], x0 + cw / 2, dropY + bs * 0.38, { size: 10, align: 'center', color: '#fff', bold: true }); }
      if (mode === 'bomb') { var bx = x0 + cw * 0.3, by = y0 + ch2 * 0.35, bw2 = cw * 0.4, bh2 = ch2 * 0.5; ctx.fillStyle = k.dark ? '#7b8a92' : '#9aa5ad'; rr(ctx, bx, by, bw2, bh2, 8); ctx.fill(); if (S.t > 0 && S.t < 0.25) { ctx.fillStyle = 'rgba(255,190,60,.9)'; ctx.beginPath(); ctx.arc(bx + bw2 / 2, by + bh2 / 2, 9 + S.t * 30, 0, TAU); ctx.fill(); } txt(ctx, 'steel bomb', bx + bw2 / 2, by + bh2 + 10, { size: 10, align: 'center' }); }
      if (mode === 'reaction') { for (var i = 0; i < 14; i++) { ctx.fillStyle = i % 2 ? k.blue : k.acc; ctx.beginPath(); ctx.arc(x0 + 20 + ((i * 37 + S.t * 60) % (cw - 40)), y0 + ch2 * 0.35 + ((i * 23) % (ch2 * 0.55)), 3, 0, TAU); ctx.fill(); } }
      // thermometer
      var tx = x0 + cw * 0.82, ty0 = y0 - 40, ty1 = y0 + ch2 * 0.8; ctx.fillStyle = k.bg; rr(ctx, tx - 5, ty0, 10, ty1 - ty0, 5); ctx.fill(); ctx.strokeStyle = k.ink; ctx.lineWidth = 1.2; ctx.stroke(); var lvl = clamp((tm[1] - 0) / 60, 0.05, 1); ctx.fillStyle = k.red; ctx.fillRect(tx - 2.5, ty1 - (ty1 - ty0 - 6) * lvl, 5, (ty1 - ty0 - 6) * lvl); ctx.beginPath(); ctx.arc(tx, ty1, 7, 0, TAU); ctx.fill();
      if (!quiet || S.t === 0) pill(ctx, fm(tm[1], 2) + ' °C', tx + 12, M.max(14, ty0 + 10), { align: 'left', size: 12, clampW: pw });
      txt(ctx, mode === 'bomb' ? 'insulated water bath' : 'insulated cup', x0 + cw / 2, y0 + ch2 + 22, { size: 10, align: 'center' });
    }
    function drawGraph(ctx, k, x, y, w, h) {
      var lo = M.min(T1, T2, Tf, Ti == null ? 1e9 : Ti), hi = M.max(T1, T2, Tf, Ti == null ? -1e9 : Ti), pad = M.max(2, (hi - lo) * 0.15), Cg = { X: function (t) { return x + 40 + (w - 50) * t; }, Y: function (T) { return y + h - 22 - (T - (lo - pad)) / (hi - lo + 2 * pad) * (h - 32); } };
      ctx.fillStyle = k.bg; ctx.fillRect(x, y, w, h); line(ctx, [[x + 40, y + 6], [x + 40, y + h - 22], [x + w - 6, y + h - 22]], k.axis, 1.4);
      txt(ctx, 'time', x + w - 8, y + h - 10, { size: 10, align: 'right' }); txt(ctx, 'T (°C)', x + 4, y + 10, { size: 10 });
      var used = []; (quiet ? [] : [Tf]).concat([lo, hi]).forEach(function (T) { var yT = Cg.Y(T); if (used.some(function (u2) { return M.abs(u2 - yT) < 11; })) return; used.push(yT); txt(ctx, fm(T, 1), x + 36, yT, { size: 9, align: 'right' }); });
      var curves = mode === 'contact' || mode === 'cup' ? [[0, k.red], [1, k.blue]] : [[1, k.blue]];
      curves.forEach(function (cv) { var pts = []; for (var i = 0; i <= 60; i++) { var t = i / 60 * M.max(S.t, 0.001); pts.push([Cg.X(i / 60 * S.t), Cg.Y(temps(t)[cv[0]])]); } line(ctx, pts, cv[1], 2.5); });
      if (!quiet && S.t > 0.8) { line(ctx, [[x + 40, Cg.Y(Tf)], [x + w - 6, Cg.Y(Tf)]], k.gold, 1.2, [4, 4]); txt(ctx, 'final ' + fm(Tf, 2) + ' °C', x + w - 8, Cg.Y(Tf) - 9, { size: 10, align: 'right', color: k.gold, bold: true }); }
    }
    function drawBars(ctx, k, x, y, w, h) { // heat lost and heat gained: equal size, opposite signs
      var qa = M.abs(qA), lab = mode === 'cup' ? [(SPH[o.metal] || ['', 'metal'])[1], 'water'] : mode === 'reaction' ? ['reaction', 'solution'] : ['reaction', 'calorimeter'], sg = mode === 'cup' ? [qA, -qA] : [-qA, qA];
      var labw = M.max(tw(ctx, lab[0], 10), tw(ctx, lab[1], 10)) + 10, half = M.min(130, (w - labw) * 0.36), x0 = x + labw + half; txt(ctx, 'q (heat)', x, y + 6, { size: 10 });
      sg.forEach(function (q, i) { var yy = y + 18 + i * 22, len = half * M.abs(q) / M.max(1e-9, qa); ctx.fillStyle = q < 0 ? k.blue : k.red; rr(ctx, q < 0 ? x0 - len : x0, yy, len, 14, 4); ctx.fill(); txt(ctx, lab[i], x, yy + 7, { size: 10 }); if (!quiet) txt(ctx, (q < 0 ? '−' : '+') + fm(M.abs(q) / 1000, 2) + ' kJ', x0 + (q < 0 ? 4 : len + 4), yy + 7, { size: 10, color: k.ink }); });
      line(ctx, [[x0, y + 14], [x0, y + 58]], k.ink, 1.2);
    }
    function report() {
      var s; if (mode === 'contact') s = (quiet ? 'Heat flows from the hotter block to the colder one until they reach the same temperature.' : 'Heat flows from the ' + fm(T1, 1) + ' °C block to the ' + fm(T2, 1) + ' °C block, never the other way, until both reach ' + fm(Tf, 2) + ' °C. The heat one loses equals the heat the other gains: ' + fm(M.abs(qA) / 1000, 2) + ' kJ.') + ' Cold does not flow; heat does.';
      else if (mode === 'cup') s = quiet ? 'The hot metal and the water end at the same temperature; the heat the metal loses equals the heat the water gains.' : 'q(metal) = m c ΔT = ' + fm(m1, 1) + ' × ' + c1 + ' × (' + fm(Tf, 2) + ' − ' + fm(T1, 1) + ') = ' + fm(qA / 1000, 3) + ' kJ; q(water) = +' + fm(-qA / 1000, 3) + ' kJ. Final temperature ' + fm(Tf, 2) + ' °C: q lost = −q gained. The water barely warms because its specific heat is so high.';
      else if (mode === 'reaction') s = (plan.note ? plan.note + ': ' : '') + (quiet ? 'the temperature of the solution changes; q(reaction) = −q(solution).' : 'q(solution) = ' + fm(qA / 1000, 2) + ' kJ, so q(reaction) = ' + fm(-qA / 1000, 2) + ' kJ (ΔH = ' + fm(plan.dH, 1) + ' kJ/mol × ' + fm(plan.n, 4) + ' mol). The solution goes from ' + fm(Ti, 1) + ' to ' + fm(Tf, 2) + ' °C: an ' + (plan.dH < 0 ? 'exothermic reaction warms its surroundings.' : 'endothermic process cools its surroundings.'));
      else s = quiet ? 'The burning sample heats the bomb and the water around it.' : 'q(calorimeter) = C_cal × ΔT = ' + fm(num(o.Ccal, 10), 2) + ' kJ/°C × ' + fm(Tf - Ti, 3) + ' °C = ' + fm(qA / 1000, 2) + ' kJ, so q(reaction) = ' + fm(-qA / 1000, 2) + ' kJ. The bomb keeps the volume fixed, so this heat is ΔU.';
      F.say(s); F.setAlt({ contact: 'Two blocks at different temperatures touching, with heat arrows from the hot one to the cold one.', cup: 'A hot metal block dropped into an insulated cup of water with a thermometer.', reaction: 'Two solutions mixed in an insulated cup with a thermometer.', bomb: 'A steel bomb in an insulated water bath.' }[mode]);
    }
    var A = anim(elx, function (dt) { S.t = M.min(1, S.t + dt * 0.35); draw(); if (S.t >= 1) { A.stop(); report(); if (pb) pb.sync(); } }, true), pb = null;
    if (F.edit) { btn(F.ctl, mode === 'bomb' ? 'Ignite' : mode === 'reaction' ? 'Mix' : mode === 'cup' ? 'Drop it in' : 'Touch', function () { S.t = V.reduced ? 1 : 0; if (!V.reduced) A.play(); draw(); report(); }, 'pri'); }
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  CH.SPH = SPH; CH.rxnPlan = rxnPlan;

  // =====================================================================================================
  // ch-energydiagram: options are documented at the top of this file
  var BH = { NaCl: { M: 'Na', X: 'Cl', sub: 107.5, half: 121.3, ie: 495.8, ea: 348.6, f: -411.2 }, KCl: { M: 'K', X: 'Cl', sub: 89.0, half: 121.3, ie: 418.8, ea: 348.6, f: -436.5 }, LiF: { M: 'Li', X: 'F', sub: 159.3, half: 79.4, ie: 520.2, ea: 328.2, f: -616.0 } };
  function bornHaber(salt) { var d = BH[salt] || BH.NaCl, L = []; var E = 0; L.push(['elements: ' + d.M + '(s) + ½' + d.X + '₂(g)', 0, null]); E += d.sub; L.push([d.M + '(g) + ½' + d.X + '₂(g)', E, 'atomize ' + d.M + ': +' + fm(d.sub, 1)]); E += d.half; L.push([d.M + '(g) + ' + d.X + '(g)', E, 'break ½ ' + d.X + '–' + d.X + ': +' + fm(d.half, 1)]); E += d.ie; L.push([d.M + '⁺(g) + e⁻ + ' + d.X + '(g)', E, 'ionize ' + d.M + ': +' + fm(d.ie, 1)]); E -= d.ea; L.push([d.M + '⁺(g) + ' + d.X + '⁻(g)', E, 'electron to ' + d.X + ': −' + fm(d.ea, 1)]); var lat = d.f - E; L.push([d.M + d.X + '(s)', d.f, 'lattice: ' + fm(lat, 1)]); return { levels: L, lattice: lat, d: d }; }
  R('ch-energydiagram', function (elx, o) {
    o = opt(o, { mode: 'profile', dH: -90, Ea: 120, catalyst: true, catEa: null, surroundings: true, steps: [{ dE: 40, Ea: 95, label: 'step 1' }, { dE: -110, Ea: 45, label: 'step 2' }], breaks: [['H–H', 436], ['Cl–Cl', 242]], forms: [['H–Cl', 432], ['H–Cl', 432]], eq: 'H2 + Cl2 -> 2HCl', levels: null, salt: 'NaCl', dG: [20, -30], labels: ['Reaction 1', 'Reaction 2'] });
    var mode = o.mode, quiet = !!(o.quiet || o.readout === false);
    var F = frame(elx, o, { profile: 'Energy diagram of a reaction', steps: 'Energy diagram of a multistep reaction', bonds: 'Bonds broken and bonds formed', hess: "Hess's law: two routes, one ΔH", bornhaber: 'Born–Haber cycle', dissolve: 'The three steps of dissolving', coupled: 'Coupled reactions' }[mode] || 'Energy diagram');
    var S = { cat: false }, bhT = mode === 'bornhaber' && !quiet ? F.html('chv-tbl') : null, c = F.canvas({ aspect: 1.75, min: 290, max: 480, narrow: mode === 'profile' ? 1.0 : 0.74 });
    var dH = num(o.dH, -90), Ea = M.max(num(o.Ea, 120), M.max(0, dH) + 5), catEa = num(o.catEa, M.max(M.max(0, dH) + 2, Ea * 0.5));
    function prof(x, ea) { if (x < 0.18) return 0; if (x > 0.82) return dH; if (x < 0.5) { var t = (x - 0.18) / 0.32; return ea * (1 - M.cos(PI * t)) / 2; } var t2 = (x - 0.5) / 0.32; return ea + (dH - ea) * (1 - M.cos(PI * t2)) / 2; }
    function vArrow(ctx, x, y1, y2, col, lab, side) { arrow(ctx, x, y1, x, y2, col, 2.2, 8); if (!lab) return; var ls = [lab], ix = lab.indexOf(' = '); if (c.w < 560 && ix > 0) ls = [lab.slice(0, ix + 2), lab.slice(ix + 3)]; ls.forEach(function (l2, j) { txt(ctx, l2, x + (side === 'l' ? -6 : 6), (y1 + y2) / 2 + (j - (ls.length - 1) / 2) * 13, { size: 11, bold: true, color: col, align: side === 'l' ? 'right' : 'left' }); }); }
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      ({ profile: drawProfile, steps: drawSteps, bonds: drawBonds, hess: drawHess, bornhaber: drawBH, dissolve: drawDissolve, coupled: drawCoupled }[mode] || drawProfile)(ctx, k);
    }
    function drawProfile(ctx, k) {
      var wide = c.w >= 560, lo = M.min(0, dH) - 30, hi = M.max(Ea, 0) + 30, Ch = chart(c, { x: [0, 1], y: [lo, hi], xticks: false, yticks: false, grid: false, xl: 'Reaction progress', yl: 'Potential energy', ml: 30, mr: wide && o.surroundings ? 120 : 14 }); Ch.draw(ctx); var b = Ch.box();
      if (S.cat) Ch.curve(ctx, function (x) { return prof(x, catEa); }, 0, 1, k.green, 2.5, [7, 5]);
      Ch.curve(ctx, function (x) { return prof(x, Ea); }, 0, 1, k.acc, 3);
      line(ctx, [[b.x0, Ch.Y(0)], [Ch.X(0.62), Ch.Y(0)]], k.muted, 1, [3, 3]); line(ctx, [[Ch.X(0.6), Ch.Y(dH)], [b.x1, Ch.Y(dH)]], k.muted, 1, [3, 3]);
      txt(ctx, 'reactants', Ch.X(0.09), Ch.Y(0) - 12, { size: 11, align: 'center', bold: true, color: k.ink }); txt(ctx, 'products', Ch.X(0.91), Ch.Y(dH) + (dH < 0 ? 14 : -12), { size: 11, align: 'center', bold: true, color: k.ink });
      txt(ctx, 'transition state', Ch.X(0.5), Ch.Y(Ea) - 12, { size: 11, align: 'center', color: k.ink });
      vArrow(ctx, Ch.X(0.3), Ch.Y(0), Ch.Y(Ea), k.gold, quiet ? 'Ea' : 'Ea = ' + fm(Ea, 0) + ' kJ/mol', 'l');
      vArrow(ctx, Ch.X(0.7), Ch.Y(dH), Ch.Y(Ea), rgba(k.gold, 0.7), quiet ? 'Ea (reverse)' : 'Ea, reverse = ' + fm(Ea - dH, 0) + ' kJ/mol', 'r');
      vArrow(ctx, Ch.X(0.86), Ch.Y(0), Ch.Y(dH), dH < 0 ? k.blue : k.red, quiet ? 'ΔH' : 'ΔH = ' + (dH > 0 ? '+' : '') + fm(dH, 0) + ' kJ/mol', 'l');
      if (S.cat) { vArrow(ctx, Ch.X(0.42), Ch.Y(0), Ch.Y(catEa), k.green, quiet ? 'Ea with catalyst' : 'with catalyst ' + fm(catEa, 0), 'r'); }
      if (wide && o.surroundings) { // the surroundings: a thermometer that rises for an exothermic reaction
        var tx = c.w - 60, ty0 = 30, ty1 = c.h - 60, f = dH < 0 ? 0.75 : 0.25; ctx.fillStyle = k.bg; rr(ctx, tx - 7, ty0, 14, ty1 - ty0, 7); ctx.fill(); ctx.strokeStyle = k.ink; ctx.lineWidth = 1.2; ctx.stroke(); ctx.fillStyle = dH < 0 ? k.red : k.blue; ctx.fillRect(tx - 3.5, ty1 - (ty1 - ty0) * f, 7, (ty1 - ty0) * f); ctx.beginPath(); ctx.arc(tx, ty1 + 4, 10, 0, TAU); ctx.fill();
        txt(ctx, 'surroundings', tx, ty1 + 26, { size: 10, align: 'center' }); txt(ctx, dH < 0 ? 'get warmer' : 'get cooler', tx, ty1 + 40, { size: 10, align: 'center', bold: true, color: dH < 0 ? k.red : k.blue }); arrow(ctx, b.x1 + 8, c.h / 2, tx - 16, c.h / 2, dH < 0 ? k.red : k.blue, 2, 7); if (dH > 0) arrow(ctx, tx - 16, c.h / 2 + 14, b.x1 + 8, c.h / 2 + 14, k.blue, 2, 7); }
    }
    function drawSteps(ctx, k) {
      var st = o.steps, E = 0, pts = [[0, 0]], peaks = [], valleys = [0], n = st.length;
      st.forEach(function (s, i) { var top = E + M.max(num(s.Ea, 50), M.max(0, num(s.dE, 0)) + 5); peaks.push(top); E += num(s.dE, 0); valleys.push(E); });
      var lo = M.min.apply(null, valleys) - 30, hi = M.max.apply(null, peaks) + 30, Ch = chart(c, { x: [0, 1], y: [lo, hi], xticks: false, yticks: false, grid: false, xl: 'Reaction progress', yl: 'Potential energy', ml: 30, mt: quiet ? 30 : 58 }); Ch.draw(ctx);
      var seg = 0.84 / n, x0 = 0.08, slow = 0, bigE = -1; st.forEach(function (s, i) { var ea = peaks[i] - valleys[i]; if (ea > bigE) { bigE = ea; slow = i; } });
      var f = function (x) { if (x <= x0) return 0; if (x >= x0 + n * seg) return valleys[n]; var i = M.min(n - 1, M.floor((x - x0) / seg)), t = (x - x0 - i * seg) / seg; return t < 0.5 ? valleys[i] + (peaks[i] - valleys[i]) * (1 - M.cos(PI * t * 2)) / 2 : peaks[i] + (valleys[i + 1] - peaks[i]) * (1 - M.cos(PI * (t - 0.5) * 2)) / 2; };
      Ch.curve(ctx, f, 0, 1, k.acc, 3, null, 400);
      st.forEach(function (s, i) { var xp = x0 + (i + 0.5) * seg; txt(ctx, s.label || 'step ' + (i + 1), Ch.X(xp), Ch.Y(peaks[i]) - 12, { size: 11, align: 'center', color: k.ink }); if (!quiet) txt(ctx, 'Ea ' + fm(peaks[i] - valleys[i], 0), Ch.X(xp), Ch.Y(peaks[i]) - 26, { size: 10, align: 'center', color: k.gold }); if (i < n - 1) txt(ctx, 'intermediate', Ch.X(x0 + (i + 1) * seg), Ch.Y(valleys[i + 1]) + 14, { size: 10, align: 'center', color: k.blue }); });
      if (!quiet && n > 1) pill(ctx, 'slow step: ' + (st[slow].label || 'step ' + (slow + 1)), Ch.X(x0 + (slow + 0.5) * seg), Ch.Y(peaks[slow]) - 44, { size: 11, line: k.gold, clampW: c.w });
      txt(ctx, 'reactants', Ch.X(0) + 4, Ch.Y(0) - 12, { size: 10, align: 'left', color: k.ink }); txt(ctx, 'products', Ch.X(1) - 4, Ch.Y(valleys[n]) - 12, { size: 10, align: 'right', color: k.ink });
    }
    function stair(ctx, k, steps, title) { // steps: [[label, change]] from 0
      var E = 0, lv = [0]; steps.forEach(function (s) { E += s[1]; lv.push(E); }); var lo = M.min.apply(null, lv), hi = M.max.apply(null, lv), pad = (hi - lo) * 0.12 + 10, Ch = chart(c, { x: [0, steps.length + 2.1], y: [lo - pad, hi + pad], xticks: false, yticks: false, grid: false, yl: title || 'Enthalpy', ml: 30, mb: 16 }); Ch.draw(ctx);
      line(ctx, [[Ch.X(0.15), Ch.Y(0)], [Ch.X(steps.length + 1.9), Ch.Y(0)]], k.muted, 1, [4, 4]); line(ctx, [[Ch.X(steps.length + 0.95), Ch.Y(E)], [Ch.X(steps.length + 1.9), Ch.Y(E)]], k.muted, 1, [4, 4]);
      var w = (Ch.X(1) - Ch.X(0)); lv.forEach(function (L, i) { line(ctx, [[Ch.X(i + 0.15), Ch.Y(L)], [Ch.X(i + 0.95), Ch.Y(L)]], k.ink, 2.5); });
      steps.forEach(function (s, i) { var up = s[1] > 0, col = up ? k.red : k.blue; arrow(ctx, Ch.X(i + 0.95), Ch.Y(lv[i]), Ch.X(i + 0.95) + 0.001, Ch.Y(lv[i + 1]), col, 2.5, 9); var lab = s[0] + (quiet ? '' : ' ' + (s[1] > 0 ? '+' : '−') + fm(M.abs(s[1]), 1)), my = (Ch.Y(lv[i]) + Ch.Y(lv[i + 1])) / 2; if (c.w < 560) { var Lz = wrapL(ctx, lab, M.max(44, w * 0.95), 10, true); Lz.forEach(function (l2, j) { txt(ctx, l2, Ch.X(i + 0.95) + 4, my + (j - (Lz.length - 1) / 2) * 12, { size: 10, color: col, bold: true }); }); } else txt(ctx, lab, Ch.X(i + 1.0), my, { size: M.min(11, w / 8), color: col, bold: true }); });
      return { Ch: Ch, lv: lv };
    }
    function drawBonds(ctx, k) { var steps = o.breaks.map(function (b) { return ['break ' + b[0], num(b[1], 0)]; }).concat(o.forms.map(function (b) { return ['form ' + b[0], -num(b[1], 0)]; })); var r = stair(ctx, k, steps), tot = r.lv[r.lv.length - 1]; finalArrow(r, steps.length, tot, quiet ? 'ΔH' : 'ΔH = ' + (tot > 0 ? '+' : '−') + fm(M.abs(tot), 0) + ' kJ', k); }
    function finalArrow(r, n, tot, lab, k) { var x = r.Ch.X(n + 1.5); arrow(c.ctx, x, r.Ch.Y(0), x + 0.001, r.Ch.Y(tot), k.acc, 3, 10); txt(c.ctx, lab, x - 6, (r.Ch.Y(0) + r.Ch.Y(tot)) / 2, { size: 12, bold: true, color: k.acc, align: 'right' }); }
    function hessLevels() { return o.levels || [{ label: 'C(s) + O₂(g)', E: 0 }, { label: 'CO(g) + ½O₂(g)', E: -110.5 }, { label: 'CO₂(g)', E: -393.5 }]; }
    function drawHess(ctx, k) {
      var L = hessLevels(), Es = L.map(function (l) { return num(l.E, 0); }), lo = M.min.apply(null, Es), hi = M.max.apply(null, Es), pad = (hi - lo) * 0.14 + 10, Ch = chart(c, { x: [0, 1], y: [lo - pad, hi + pad], xticks: false, yticks: false, grid: false, yl: 'Enthalpy (kJ)', ml: 30, mb: 14 }); Ch.draw(ctx);
      L.forEach(function (l, i) { var y = Ch.Y(Es[i]); line(ctx, [[Ch.X(0.12), y], [Ch.X(0.88), y]], k.ink, 2.5); txt(ctx, l.label, Ch.X(0.5), y - 10, { size: 12, bold: true, align: 'center', color: k.ink }); if (!quiet) txt(ctx, fm(Es[i], 1), Ch.X(0.12) - 4, y, { size: 10, align: 'right' }); });
      for (var i = 0; i < L.length - 1; i++) { var d = Es[i + 1] - Es[i]; arrow(ctx, Ch.X(0.25), Ch.Y(Es[i]), Ch.X(0.25) + 0.001, Ch.Y(Es[i + 1]), d < 0 ? k.blue : k.red, 2.5, 9); txt(ctx, quiet ? 'step ' + (i + 1) : (d > 0 ? '+' : '−') + fm(M.abs(d), 1), Ch.X(0.25) + 6, (Ch.Y(Es[i]) + Ch.Y(Es[i + 1])) / 2, { size: 11, bold: true, color: d < 0 ? k.blue : k.red }); }
      var tot = Es[Es.length - 1] - Es[0]; arrow(ctx, Ch.X(0.75), Ch.Y(Es[0]), Ch.X(0.75) + 0.001, Ch.Y(Es[Es.length - 1]), k.acc, 3, 10); txtw(ctx, quiet ? 'direct' : 'direct: ' + (tot > 0 ? '+' : '−') + fm(M.abs(tot), 1), Ch.X(0.75) + 6, (Ch.Y(Es[0]) + Ch.Y(Es[Es.length - 1])) / 2, M.max(40, Ch.box().x1 - Ch.X(0.75) - 4), { size: 11, bold: true, color: k.acc });
    }
    function drawBH(ctx, k) {
      var B2 = bornHaber(o.salt), Lv = B2.levels, Es = Lv.map(function (l) { return l[1]; }), lo = M.min.apply(null, Es), hi = M.max.apply(null, Es), pad = (hi - lo) * 0.08, Ch = chart(c, { x: [0, Lv.length + 0.6], y: [lo - pad, hi + pad], xticks: false, yticks: false, grid: false, yl: 'Enthalpy (kJ/mol)', ml: 30, mb: 10 }); Ch.draw(ctx);
      var wide = c.w >= 560, topI = 0, xOf = function (i) { return Ch.X((i === Lv.length - 1 ? i - 1 : i) * 0.85 + 0.2); }, lw = Ch.X(1.7) - Ch.X(0), marks = [];
      Lv.forEach(function (l2, j2) { if (l2[1] > Lv[topI][1]) topI = j2; });
      Lv.forEach(function (l, i) { var y = Ch.Y(l[1]), x0 = xOf(i); line(ctx, [[x0, y], [x0 + lw, y]], k.ink, 2.2);
        if (i) { var prev = Lv[i - 1][1], xa = x0 + 6, col = l[1] > prev ? k.red : k.blue; if (i === Lv.length - 1) { xa = xOf(i - 1) + 6; col = k.acc; } arrow(ctx, xa, Ch.Y(prev), xa + 0.001, y, col, 2.2, 8); marks.push({ i: i, x: xa, y: (Ch.Y(prev) + y) / 2, col: col }); } });
      // level names on a soft background so the arrows pass behind them; the first one sits below its line
      Lv.forEach(function (l, i) { if (!(wide || i === 0 || i === Lv.length - 1 || i === topI)) return; var y = Ch.Y(l[1]), x0 = xOf(i), lab = !wide && i === 0 ? 'elements' : l[0], sz = wide ? 11 : 10, below = i === 0, w = tw(ctx, lab, sz, true), tx = i === Lv.length - 1 ? x0 + lw - w - 4 : x0 + 14, ty = below ? y + 10 : y - 9; ctx.save(); ctx.fillStyle = rgba(k.bg, 0.86); ctx.fillRect(tx - 3, ty - sz / 2 - 2, w + 6, sz + 4); ctx.restore(); txt(ctx, lab, tx, ty, { size: sz, bold: true, color: k.ink }); });
      marks.forEach(function (m) { if (!quiet) { ctx.save(); ctx.fillStyle = m.col; ctx.beginPath(); ctx.arc(m.x - 12, m.y, 8, 0, TAU); ctx.fill(); ctx.restore(); txt(ctx, String(m.i), m.x - 12, m.y + 0.5, { size: 10, bold: true, align: 'center', color: '#fff' }); } else if (m.i === Lv.length - 1) txt(ctx, 'lattice energy', m.x + 5, m.y, { size: wide ? 10 : 9, color: m.col, bold: true }); });
      if (bhT) bhT.innerHTML = tbl(['Step', 'Change', 'ΔH (kJ/mol)'], Lv.slice(1).map(function (l, i) { var p = l[2].split(': '); return [String(i + 1), p[0].replace(/^lattice$/, 'form the lattice'), i === Lv.length - 2 ? { h: '<b>' + p[1] + '</b>' } : p[1]]; }).concat([['', 'overall: ΔHf', fm(B2.d.f, 1)]]));
      var y0 = Ch.Y(0), yf = Ch.Y(B2.d.f), xf = Ch.X(0.12); arrow(ctx, xf, y0, xf + 0.001, yf, k.gold, 2.5, 9); txt(ctx, quiet ? 'ΔHf' : 'ΔHf = ' + fm(B2.d.f, 1), xf + 5, (y0 + yf) / 2, { size: 10, bold: true, color: k.gold });
    }
    function drawDissolve(ctx, k) { var d = (o.dH && o.dH.length === 3) ? o.dH.map(function (x) { return num(x, 0); }) : [60, 40, -110]; var r = stair(ctx, k, [['separate solute', d[0]], ['separate solvent', d[1]], ['mix (attractions form)', d[2]]]), tot = d[0] + d[1] + d[2]; finalArrow(r, 3, tot, quiet ? 'ΔH(solution)' : 'ΔH(solution) = ' + (tot > 0 ? '+' : '−') + fm(M.abs(tot), 0), k); }
    function drawCoupled(ctx, k) { var g = (o.dG || [20, -30]).map(function (x) { return num(x, 0); }), labs = o.labels || ['Reaction 1', 'Reaction 2'], r = stair(ctx, k, [[labs[0], g[0]], [labs[1], g[1]]], 'Free energy'), tot = g[0] + g[1]; finalArrow(r, 2, tot, quiet ? 'total ΔG°' : 'total ΔG° = ' + (tot > 0 ? '+' : '−') + fm(M.abs(tot), 1) + ' kJ/mol', k); }
    function report() {
      var s = '';
      if (mode === 'profile') s = quiet ? 'Read the energy of the reactants, the products and the transition state from the curve.' : 'ΔH = ' + (dH > 0 ? '+' : '') + fm(dH, 0) + ' kJ/mol (' + (dH < 0 ? 'exothermic: the products are lower, and the energy released warms the surroundings' : 'endothermic: the products are higher, and the energy taken in cools the surroundings') + '). Ea = ' + fm(Ea, 0) + ' kJ/mol forward, ' + fm(Ea - dH, 0) + ' kJ/mol in reverse.' + (S.cat ? ' The catalyst offers a lower path (Ea = ' + fm(catEa, 0) + ' kJ/mol) with the same start and end, so ΔH does not change.' : '');
      else if (mode === 'steps') s = quiet ? 'A reaction in ' + o.steps.length + ' steps. Each valley between peaks is an intermediate; each peak is a transition state.' : 'Each peak is a transition state; each valley between peaks is an intermediate that is made and then used up. The step with the largest activation energy is the slow step, which sets the overall rate.';
      else if (mode === 'bonds') { var tot = 0; o.breaks.forEach(function (b) { tot += num(b[1], 0); }); var form = 0; o.forms.forEach(function (b) { form += num(b[1], 0); }); s = quiet ? 'Breaking bonds goes up in energy; forming bonds goes down.' : 'Breaking bonds takes in ' + fm(tot, 0) + ' kJ; forming bonds releases ' + fm(form, 0) + ' kJ. ΔH = ' + fm(tot, 0) + ' − ' + fm(form, 0) + ' = ' + (tot - form > 0 ? '+' : '−') + fm(M.abs(tot - form), 0) + ' kJ' + (o.eq ? ' for ' + eqH(parseEq(o.eq)) : '') + '. Breaking bonds never releases energy.'; }
      else if (mode === 'hess') { var L = hessLevels(), d = num(L[L.length - 1].E, 0) - num(L[0].E, 0); s = quiet ? 'Two routes from the same start to the same end.' : 'Step by step or directly, the change is the same: ' + (d > 0 ? '+' : '−') + fm(M.abs(d), 1) + ' kJ. Enthalpy depends only on the start and the end, not the path.'; }
      else if (mode === 'bornhaber') { var B2 = bornHaber(o.salt); s = quiet ? 'A Born–Haber cycle for ' + fH(o.salt) + '.' : 'Born–Haber cycle for ' + fH(BH[o.salt] ? o.salt : 'NaCl') + ': the steps up and down must add to ΔHf = ' + fm(B2.d.f, 1) + ' kJ/mol, so the lattice energy (forming the solid from its gaseous ions) is ' + fm(B2.d.f, 1) + ' − (' + fm(B2.levels[4][1], 1) + ') = <b>' + fm(B2.lattice, 1) + ' kJ/mol</b>.'; }
      else if (mode === 'dissolve') { var dd = (o.dH && o.dH.length === 3) ? o.dH.map(function (x) { return num(x, 0); }) : [60, 40, -110], t2 = dd[0] + dd[1] + dd[2]; s = 'Pulling the solute apart and making room in the solvent both take energy; the new solute–solvent attractions release it. ' + (quiet ? '' : 'ΔH(solution) = ' + dd.map(function (x) { return (x > 0 ? '+' : '−') + fm(M.abs(x), 0); }).join(' ') + ' = ' + (t2 > 0 ? '+' : '−') + fm(M.abs(t2), 0) + ' kJ/mol' + (o.dH ? '.' : ' (example values).')); }
      else if (mode === 'coupled') { var g = (o.dG || [20, -30]).map(function (x) { return num(x, 0); }); s = quiet ? 'Two reactions added together.' : 'Alone, ' + (o.labels || ['Reaction 1'])[0] + ' is not thermodynamically favored (ΔG° = +' + fm(g[0], 1) + ' kJ/mol). Coupled to a reaction with ΔG° = ' + fm(g[1], 1) + ' kJ/mol, the total is ' + fm(g[0] + g[1], 1) + ' kJ/mol, so the pair together is favored.'; }
      F.say(s); F.setAlt({ profile: 'Energy profile: reactants, a hump at the transition state, and products ' + (dH < 0 ? 'lower' : 'higher') + ' than the reactants.', steps: 'A multistep energy profile with peaks and intermediate valleys.', bonds: 'A staircase: up for each bond broken, down for each bond formed.', hess: 'Enthalpy levels joined by a two-step route and a direct route.', bornhaber: 'A Born–Haber cycle of enthalpy levels for forming an ionic solid.', dissolve: 'Three steps of dissolving shown as enthalpy changes.', coupled: 'Two free-energy changes adding to a negative total.' }[mode] || '');
    }
    if (mode === 'profile' && F.edit && o.catalyst !== false) { var cb = btn(F.ctl, 'Add a catalyst', function () { S.cat = !S.cat; cb.textContent = S.cat ? 'Remove the catalyst' : 'Add a catalyst'; cb.setAttribute('aria-pressed', String(S.cat)); draw(); report(); }); }
    if (mode === 'profile' && F.edit && o.sliders) { sl(F.ctl, { label: 'ΔH (kJ/mol)', min: -150, max: 100, step: 5, value: dH, input: function (v) { dH = v; Ea = M.max(Ea, M.max(0, dH) + 5); catEa = M.max(M.max(0, dH) + 2, M.min(catEa, Ea)); draw(); report(); } }); sl(F.ctl, { label: 'Ea (kJ/mol)', min: 10, max: 200, step: 5, value: Ea, input: function (v) { Ea = M.max(v, M.max(0, dH) + 5); catEa = M.max(M.max(0, dH) + 2, Ea * 0.5); draw(); report(); } }); }
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  CH.bornHaber = bornHaber;

  // =====================================================================================================
  // shared: molar masses from the overview's two-decimal atomic masses (the values problems give)
  var AM2 = { H: 1.01, C: 12.01, N: 14.01, O: 16.00, Na: 22.99, Mg: 24.31, Al: 26.98, S: 32.07, Cl: 35.45, K: 39.10, Ca: 40.08, Fe: 55.85, Cu: 63.55, Ag: 107.87, I: 126.90, Pb: 207.2 };
  function mm2(f) { var p = parseF(f), m = 0; for (var e in p.atoms) m += (AM2[e] != null ? AM2[e] : M.round(BYS[e].mass * 100) / 100) * p.atoms[e]; return M.round(m * 100) / 100; }
  function tbl(head, rows, cls) { return '<table' + (cls ? ' class="' + cls + '"' : '') + '><thead><tr>' + head.map(function (h) { return '<th scope="col">' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr' + (r.cls ? ' class="' + r.cls + '"' : '') + '>' + r.map(function (x) { return '<td' + (x && x.c ? ' class="' + x.c + '"' : '') + '>' + (x && x.h != null ? x.h : x) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>'; }

  // ch-convert: options are documented at the top of this file
  function U(u, s) { return u + (s ? ' ' + s : ''); }
  R('ch-convert', function (elx, o) {
    o = opt(o, { mode: 'chain', start: { v: 36.04, unit: 'g', sub: 'H2O' }, factors: null, target: null, dp: 4, eq: '2H2 + O2 -> 2H2O', a: null, b: null, M: null, from: 'g', to: 'g', fromSub: null, toSub: null, Msol: 1.0, v: 2.5, unit: 'm' });
    var mode = o.mode, quiet = !!(o.quiet || o.readout === false), F = frame(elx, o, mode === 'map' ? 'The mole road map' : mode === 'prefix' ? 'Metric prefixes and powers of ten' : 'A chain of conversion factors');
    if (mode === 'map') return moleMap(F, o);
    if (mode === 'prefix') return prefixLadder(F, o);
    var st = o.start, fac = (o.factors || [{ n: [1, 'mol', st.sub || ''], d: [mm2(st.sub || 'H2O'), 'g', st.sub || ''] }]).map(function (f) { return { n: f.n, d: f.d, flip: !!f.flip, pow: f.pow || 1 }; });
    var box = F.html('chv-chain'); F.box.hidden = true;
    function key(u, s) { return u + '|' + (s || ''); }
    function upow(u) { var m = String(u).match(/^(.*?)\^?([23])$/); return m && m[1] && !/\d$/.test(m[1]) ? [m[1], +m[2]] : [u, 1]; } // 'm3' or 'cm^3' -> ['m', 3]
    function tally() { var t = {}; function add(u, s, e) { var up = upow(u), kk = key(up[0], s); t[kk] = (t[kk] || 0) + e * up[1]; } add(st.unit, st.sub, 1); fac.forEach(function (f) { var top = f.flip ? f.d : f.n, bot = f.flip ? f.n : f.d; add(top[1], top[2], f.pow); add(bot[1], bot[2], -f.pow); }); return t; }
    function value() { var v = num(st.v, 1); fac.forEach(function (f) { var top = f.flip ? f.d : f.n, bot = f.flip ? f.n : f.d; v *= M.pow(num(top[0], 1) / num(bot[0], 1), f.pow); }); return v; }
    function render() {
      var t = tally(), left = []; for (var kk in t) if (t[kk] !== 0) left.push([kk, t[kk]]);
      function unitH(u, s, cancel) { var up = upow(u), h = '<span class="chv-u' + (cancel ? ' chv-x' : '') + '">' + esc(up[0]) + (up[1] > 1 ? '<sup>' + up[1] + '</sup>' : '') + (s ? ' ' + fH(s) : '') + '</span>'; return h; }
      function cancelled(u, s) { return t[key(upow(u)[0], s)] === 0; }
      var h = '<span class="chv-res" style="background:none;border:0">' + (quiet && o.hideStart ? '?' : fm(num(st.v, 1), 6)) + ' ' + unitH(st.unit, st.sub, cancelled(st.unit, st.sub)) + '</span>';
      fac.forEach(function (f, i) { var top = f.flip ? f.d : f.n, bot = f.flip ? f.n : f.d, pw = f.pow !== 1 ? '<sup>' + f.pow + '</sup>' : ''; h += '<span class="chv-times">×</span>' + (f.pow !== 1 ? '<span class="chv-paren">(</span>' : '') + '<span class="chv-frac" data-i="' + i + '"><span>' + (quiet ? '' : fm(num(top[0], 1), 6) + ' ') + unitH(top[1], top[2], cancelled(top[1], top[2])) + '</span><span>' + (quiet ? '' : fm(num(bot[0], 1), 6) + ' ') + unitH(bot[1], bot[2], cancelled(bot[1], bot[2])) + '</span>' + (F.edit ? '<button type="button" class="ml-btn" data-flip="' + i + '" aria-label="Flip factor ' + (i + 1) + '">⇅ Flip</button>' : '') + '</span>' + (f.pow !== 1 ? '<span class="chv-paren">)' + pw + '</span>' : ''); });
      var unitsLeft = left.map(function (x) { var p = x[0].split('|'); return esc(p[0]) + (x[1] !== 1 ? '<sup>' + String(x[1]).replace('-', '−') + '</sup>' : '') + (p[1] ? ' ' + fH(p[1]) : ''); }).join(' · ');
      h += '<span class="chv-times">=</span><span class="chv-res">' + (quiet ? '?' : sf(value(), o.sf || 4)) + ' ' + unitsLeft + '</span>';
      box.innerHTML = h;
      box.querySelectorAll('[data-flip]').forEach(function (b) { b.addEventListener('click', function () { var f = fac[+b.dataset.flip]; f.flip = !f.flip; render(); var nb = box.querySelector('[data-flip="' + b.dataset.flip + '"]'); if (nb) nb.focus(); }); });
      var target = o.target, ok = target && left.length === 1 && left[0][1] === 1 && (function () { var p = left[0][0].split('|'); return (p[0] + (p[1] ? ' ' + p[1] : '')).replace(/\s+/g, ' ').trim() === String(target).replace(/\s+/g, ' ').trim(); })();
      F.done(ok);
      var msg = left.length === 1 && left[0][1] === 1 ? (target ? (ok ? 'The units cancel down to ' + esc(target) + ': each factor equals 1, so the amount is unchanged.' : 'The units left over are not ' + esc(target) + ' yet. Flip a factor so the unit you want to cancel sits on the bottom.') : 'Every unit but one cancels.') : 'Units left: ' + unitsLeft + '. A factor cancels a unit when that unit sits on the opposite side of the fraction line; flip any factor that does not.';
      F.say(msg); F.setAlt('A chain of conversion factors starting from ' + fm(num(st.v, 1), 6) + ' ' + st.unit + (st.sub ? ' of ' + fT(st.sub) : '') + '.');
    }
    render(); return { draw: render };
  });
  var PRE = [['G', 9, 'giga'], ['M', 6, 'mega'], ['k', 3, 'kilo'], ['h', 2, 'hecto'], ['da', 1, 'deka'], ['', 0, '(base unit)'], ['d', -1, 'deci'], ['c', -2, 'centi'], ['m', -3, 'milli'], ['μ', -6, 'micro'], ['n', -9, 'nano']];
  function prefixLadder(F, o) {
    var u = o.unit || 'm', S = { a: PRE.findIndex(function (p) { return p[0] === (o.from == null ? 'k' : o.from); }), b: PRE.findIndex(function (p) { return p[0] === (o.to == null ? 'm' : o.to); }), sel: 0 }, quiet = F.quiet; if (S.a < 0) S.a = 2; if (S.b < 0) S.b = 8;
    var c = F.canvas({ aspect: 1.5, min: 330, max: 420, narrow: 0.85 });
    function Y(e) { return 20 + (9 - e) / 18 * (c.h - 40); }
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var nar = c.w < 560, x0 = M.min(c.w * (nar ? 0.24 : 0.32), 150); line(ctx, [[x0, Y(9) - 6], [x0, Y(-9) + 6]], k.ink, 3);
      PRE.forEach(function (p, i) { var y = Y(p[1]), on = i === S.a || i === S.b; line(ctx, [[x0 - 16, y], [x0 + 16, y]], on ? k.acc : k.ink, on ? 3 : 2); txt(ctx, p[0] + u, x0 - 22, y, { size: 13, bold: true, align: 'right', color: on ? k.acc : k.ink }); txt(ctx, p[2] + '  10' + sup(p[1]), x0 + 24, y, { size: 12, color: k.muted }); if (H.focused() && S.sel === i) focusBox(ctx, x0 - 70, y - 11, 150, 22); });
      var ya = Y(PRE[S.a][1]), yb = Y(PRE[S.b][1]), d = PRE[S.a][1] - PRE[S.b][1], xa = nar ? c.w - 14 : x0 + Math.min(220, c.w * 0.45);
      if (d !== 0 && nar) { arrow(ctx, xa, ya, xa, yb, k.gold, 3, 10); var tl = wrapL(ctx, (d > 0 ? 'down ' : 'up ') + M.abs(d) + (M.abs(d) === 1 ? ' power' : ' powers') + ' of ten', xa - 8 - (x0 + 140), 11, true).map(function (t) { return [t, true]; }).concat(wrapL(ctx, (d > 0 ? '× 10' + sup(d) + ': more of the smaller unit' : '× 10' + sup(d) + ': fewer of the bigger unit'), xa - 8 - (x0 + 140), 10).map(function (t) { return [t, false]; })), ty = (ya + yb) / 2 - (tl.length - 1) * 6.5; tl.forEach(function (t, j) { txt(ctx, t[0], xa - 8, ty + j * 13, { size: t[1] ? 11 : 10, bold: t[1], color: k.gold, align: 'right' }); }); }
      else if (d !== 0) { arrow(ctx, xa, ya, xa, yb, k.gold, 3, 10); txt(ctx, (d > 0 ? 'down ' : 'up ') + M.abs(d) + (M.abs(d) === 1 ? ' power' : ' powers') + ' of ten', xa + 8, (ya + yb) / 2 - 8, { size: 12, bold: true, color: k.gold }); txt(ctx, d > 0 ? '× 10' + sup(d) + ': more of the smaller unit' : '× 10' + sup(d) + ': fewer of the bigger unit', xa + 8, (ya + yb) / 2 + 9, { size: 11, color: k.gold }); }
    }
    function report() { var a = PRE[S.a], b = PRE[S.b], d = a[1] - b[1], v = num(o.v, 2.5); F.say(quiet ? 'Convert from ' + a[0] + u + ' to ' + b[0] + u + '.' : fm(v, 6) + ' ' + a[0] + u + ' = ' + sci(v * M.pow(10, d), 4, true) + ' ' + b[0] + u + ' (1 ' + a[0] + u + ' = 10<sup>' + String(d).replace('-', '−') + '</sup> ' + b[0] + u + '). Going to a smaller unit, the number gets bigger.'); F.setAlt('A ladder of metric prefixes from giga to nano with their powers of ten.'); }
    var H = keyNav(c, { tap: function (px, py) { var best = 0, bd = 1e9; PRE.forEach(function (p, i) { var d = M.abs(Y(p[1]) - py); if (d < bd) { bd = d; best = i; } }); if (S.pick === 'b') { S.b = best; S.pick = 'a'; } else { S.a = best; S.pick = 'b'; } draw(); report(); }, key: function (e) { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { S.sel = clamp(S.sel + (e.key === 'ArrowDown' ? 1 : -1), 0, PRE.length - 1); draw(); return true; } if (e.key === 'Enter' || e.key === ' ') { if (S.pick === 'b') { S.b = S.sel; S.pick = 'a'; } else { S.a = S.sel; S.pick = 'b'; } draw(); report(); return true; } return false; }, change: draw });
    F.html('chv-note').textContent = 'Tap a rung to choose the starting unit, then tap another for the target. Keys: up and down arrows, Enter.';
    c.cv.setAttribute('aria-label', 'Metric prefix ladder. Up and down arrows move; Enter picks the starting unit, then the target.');
    redraw(c, draw); draw(); report(); return { draw: draw };
  }
  // the mole map: every route between substances passes through moles, and the coefficients apply only there
  function moleMap(F, o) {
    var eq = parseEq(o.eq) || parseEq('2H2 + O2 -> 2H2O'), all = eq.left.concat(eq.right), A = o.a || eq.left[0].f, B = o.b || eq.right[0].f, ca = (all.find(function (t) { return t.f === A; }) || { c: 1 }).c, cb = (all.find(function (t) { return t.f === B; }) || { c: 1 }).c, quiet = F.quiet;
    var Mm = {}; [A, B].forEach(function (f) { Mm[f] = o.M && o.M[f] != null ? num(o.M[f], 1) : mm2(f); });
    var S = { from: { k: o.from || 'g', s: o.fromSub || A }, to: { k: o.to || 'g', s: o.toSub || B }, pick: 'from', sel: 0 }, c = F.canvas({ aspect: 2.0, min: 280, max: 360, narrow: 0.95 }), chainBox = F.html('chv-chain');
    var KIND = { g: 'grams', particles: 'particles', Lgas: 'liters of gas', Lsoln: 'liters of solution', mol: 'moles' };
    function nodes() { var wide = c.w >= 560, cy = c.h / 2, out = []; if (!wide) { var cx = c.w / 2, dx = M.min(118, c.w * 0.33); [[A, c.h * 0.29, -1], [B, c.h * 0.71, 1]].forEach(function (p) { var y = p[1], d = p[2]; out.push({ k: 'mol', s: p[0], x: cx, y: y }); out.push({ k: 'g', s: p[0], x: cx - dx, y: y }); out.push({ k: 'particles', s: p[0], x: cx + dx, y: y }); out.push({ k: 'Lgas', s: p[0], x: cx - dx * 0.55, y: y + d * 62 }); out.push({ k: 'Lsoln', s: p[0], x: cx + dx * 0.55, y: y + d * 62 }); }); return out; } [[A, wide ? c.w * 0.3 : c.w * 0.27], [B, wide ? c.w * 0.7 : c.w * 0.73]].forEach(function (p, side) { var cx = p[1], r = M.min(wide ? 110 : 80, c.h * 0.36); out.push({ k: 'mol', s: p[0], x: cx, y: cy }); [['g', -PI / 2], ['particles', side ? 0 : PI], ['Lgas', PI / 2 + (side ? -0.5 : 0.5)], ['Lsoln', PI / 2 + (side ? 0.5 : -0.5)]].forEach(function (q) { out.push({ k: q[0], s: p[0], x: cx + r * M.cos(q[1]) * (side ? 1 : 1), y: cy + r * M.sin(q[1]) * 0.85 }); }); }); return out; }
    function route() { var r = [S.from]; if (S.from.k !== 'mol') r.push({ k: 'mol', s: S.from.s }); if (S.to.s !== S.from.s) r.push({ k: 'mol', s: S.to.s }); if (S.to.k !== 'mol') r.push(S.to); var out = []; r.forEach(function (n) { if (!out.length || out[out.length - 1].k !== n.k || out[out.length - 1].s !== n.s) out.push(n); }); return out; }
    function factor(a, b) { // the factor that turns a into b
      var s = a.s, Mx = Mm[s], v = { g: [Mx, 'g'], particles: [6.022e23, 'particles'], Lgas: [22.4, 'L'], Lsoln: [1 / num(o.Msol, 1), 'L soln'] };
      if (a.k === 'mol' && b.k === 'mol') { var cA = a.s === A ? ca : cb, cB = b.s === A ? ca : cb; return { n: [cB, 'mol', b.s], d: [cA, 'mol', a.s], why: 'coefficients from the equation' }; }
      if (a.k === 'mol') { var q = v[b.k]; return { n: [q[0], q[1], s], d: [1, 'mol', s], why: { g: 'molar mass', particles: 'Avogadro\'s number', Lgas: 'molar volume at 0 °C and 1 atm', Lsoln: 'molarity' }[b.k] }; }
      var q2 = v[a.k]; return { n: [1, 'mol', s], d: [q2[0], q2[1], s], why: { g: 'molar mass', particles: 'Avogadro\'s number', Lgas: 'molar volume at 0 °C and 1 atm', Lsoln: 'molarity' }[a.k] };
    }
    function draw() {
      var ctx = c.ctx, k = pal(), ns = nodes(), rt = route(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      function onRoute(a, b) { for (var i = 0; i < rt.length - 1; i++) { var p = rt[i], q = rt[i + 1]; if ((p.k === a.k && p.s === a.s && q.k === b.k && q.s === b.s) || (q.k === a.k && q.s === a.s && p.k === b.k && p.s === b.s)) return true; } return false; }
      var hubs = ns.filter(function (n) { return n.k === 'mol'; });
      ns.forEach(function (n) { if (n.k === 'mol') return; var h = hubs.find(function (q) { return q.s === n.s; }), on = onRoute(n, h); line(ctx, [[h.x, h.y], [n.x, n.y]], on ? k.gold : k.grid, on ? 5 : 2.5); });
      var on2 = onRoute(hubs[0], hubs[1]); line(ctx, [[hubs[0].x, hubs[0].y], [hubs[1].x, hubs[1].y]], on2 ? k.gold : k.grid, on2 ? 6 : 3); if (c.w >= 560) { pill(ctx, 'mole ratio ' + cb + ' : ' + ca, (hubs[0].x + hubs[1].x) / 2, hubs[0].y - 14, { size: 11, color: k.acc, line: k.accSoft }); txt(ctx, 'the only bridge between substances', (hubs[0].x + hubs[1].x) / 2, hubs[0].y + 16, { size: 10, align: 'center' }); } else { var my2 = (hubs[0].y + hubs[1].y) / 2; pill(ctx, 'mole ratio ' + cb + ' : ' + ca, hubs[0].x + 10, my2 - 9, { size: 11, color: k.acc, line: k.accSoft, align: 'left' }); txt(ctx, 'the only bridge', hubs[0].x + 12, my2 + 11, { size: 10 }); }
      ns.forEach(function (n, i) { var isHub = n.k === 'mol', isF = S.from.k === n.k && S.from.s === n.s, isT = S.to.k === n.k && S.to.s === n.s, lab = (isHub ? 'moles of ' : KIND[n.k] + ' of ').replace('liters of solution of', 'L of solution of').replace('liters of gas of', 'L of gas of'); var w2 = M.max(tw(ctx, lab, 11), 54) + 16, h2 = isHub ? 44 : 36; ctx.save(); rr(ctx, n.x - w2 / 2, n.y - h2 / 2, w2, h2, 10); ctx.fillStyle = isHub ? k.accSoft : k.panel; ctx.fill(); ctx.lineWidth = isF || isT ? 3 : 1.2; ctx.strokeStyle = isF ? k.green : isT ? k.red : isHub ? k.acc : k.labLine; ctx.stroke(); ctx.restore(); txt(ctx, lab, n.x, n.y - 7, { size: 11, align: 'center', color: k.ink, bold: isHub }); fDraw(ctx, n.s, n.x, n.y + 9, { size: 12, align: 'center', color: k.ink }); if (isF) txt(ctx, 'start', n.x, n.y - h2 / 2 - 7, { size: 10, bold: true, align: 'center', color: k.green }); if (isT) txt(ctx, 'goal', n.x, n.y - h2 / 2 - 7, { size: 10, bold: true, align: 'center', color: k.red }); if (H.focused() && S.sel === i) focusBox(ctx, n.x - w2 / 2 - 3, n.y - h2 / 2 - 3, w2 + 6, h2 + 6); });
    }
    function report() {
      var rt = route(), facs = []; for (var i = 0; i < rt.length - 1; i++) facs.push(factor(rt[i], rt[i + 1]));
      var v = o.start != null && typeof o.start !== 'object' ? num(o.start, 1) : null, val = v;
      var h = (v != null ? '<span class="chv-res" style="background:none;border:0">' + fm(v, 6) + ' ' + esc(rt[0].k === 'mol' ? 'mol' : facs[0] ? facs[0].d[1] : '') + ' ' + fH(rt[0].s) + '</span>' : '<span class="chv-res" style="background:none;border:0">' + esc(KIND[rt[0].k]) + ' of ' + fH(rt[0].s) + '</span>');
      facs.forEach(function (f) { if (val != null) val *= num(f.n[0], 1) / num(f.d[0], 1); h += '<span class="chv-times">×</span><span class="chv-frac"><span>' + (quiet ? '' : sciH(f.n[0], 4) + ' ') + '<span class="chv-u">' + esc(f.n[1]) + ' ' + fH(f.n[2]) + '</span></span><span>' + (quiet ? '' : sciH(f.d[0], 4) + ' ') + '<span class="chv-u">' + esc(f.d[1]) + ' ' + fH(f.d[2]) + '</span></span></span>'; });
      if (val != null) h += '<span class="chv-times">=</span><span class="chv-res">' + (quiet ? '?' : sciH(val, 4)) + ' ' + esc(facs.length ? facs[facs.length - 1].n[1] : '') + ' ' + fH(rt[rt.length - 1].s) + '</span>';
      chainBox.innerHTML = facs.length ? h : 'Pick two different places on the map.';
      F.say('Route: ' + rt.map(function (n) { return (n.k === 'mol' ? 'moles' : KIND[n.k]) + ' of ' + fH(n.s); }).join(' → ') + '. ' + (S.from.s !== S.to.s ? 'Grams of one substance never convert straight to grams of another: go through moles, where the coefficients (' + cb + ' mol ' + fH(B) + ' per ' + ca + ' mol ' + fH(A) + ') apply.' : '') + ' Factors used: ' + facs.map(function (f) { return f.why; }).join(', ') + '.');
      F.setAlt('The mole road map: moles of ' + fT(A) + ' and moles of ' + fT(B) + ' at the hubs, linked by the mole ratio, each with spokes to grams, particles, liters of gas and liters of solution.');
    }
    var H = keyNav(c, { tap: function (px, py) { var ns = nodes(), best = -1, bd = 50; ns.forEach(function (n, i) { var d = M.hypot(n.x - px, n.y - py); if (d < bd) { bd = d; best = i; } }); if (best < 0) return; pickNode(ns[best]); }, key: function (e) { var ns = nodes(); if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { S.sel = (S.sel + 1) % ns.length; draw(); return true; } if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { S.sel = (S.sel + ns.length - 1) % ns.length; draw(); return true; } if (e.key === 'Enter' || e.key === ' ') { pickNode(ns[S.sel]); return true; } return false; }, change: draw });
    function pickNode(n) { if (S.pick === 'from') { S.from = { k: n.k, s: n.s }; S.pick = 'to'; } else { S.to = { k: n.k, s: n.s }; S.pick = 'from'; } draw(); report(); }
    F.html('chv-note').innerHTML = 'Tap a box to set the start, then another for the goal. Keys: arrows move, Enter picks. Molar masses used: ' + [A, B].map(function (f) { return fH(f) + ' ' + fm(Mm[f], 2) + ' g/mol'; }).join(', ') + '; 22.4 L/mol for a gas at 0 °C and 1 atm' + (o.Msol ? '; ' + fm(num(o.Msol, 1), 3) + ' mol/L for solutions' : '') + '.';
    c.cv.setAttribute('aria-label', 'The mole road map. Arrow keys move between boxes; Enter picks the start, then the goal.');
    redraw(c, draw); draw(); report(); return { draw: draw };
  }
  CH.mm2 = mm2;

  // =====================================================================================================
  // ch-measure: options are documented at the top of this file
  var INST = { ruler: { div: 0.1, range: [0, 10], unit: 'cm', value: 4.37 }, cylinder: { div: 1, range: [0, 50], unit: 'mL', value: 36.5 }, buret: { div: 0.1, range: [0, 50], unit: 'mL', value: 21.37 }, thermometer: { div: 1, range: [-10, 110], unit: '°C', value: 24.6 }, balance: { unit: 'g', value: 12.507, decimals: 3 } };
  function sigDigits(str) { // returns {digits: [{ch, sig: true|false|'amb'}], count, ambiguous}
    var s = String(str).trim(), m = s.match(/^([+\-]?)(\d*\.?\d*)(?:\s*(?:e|E|×\s*10\^?)\s*([+\-−]?\d+))?$/); if (!m) return null;
    var mant = m[2], hasDot = mant.indexOf('.') >= 0, chars = mant.split(''), out = [], seenNZ = false, firstNZ = -1, lastNZ = -1;
    chars.forEach(function (ch, i) { if (/[1-9]/.test(ch)) { if (firstNZ < 0) firstNZ = i; lastNZ = i; } });
    chars.forEach(function (ch, i) { if (ch === '.') { out.push({ ch: ch, sig: null }); return; } if (firstNZ < 0) { out.push({ ch: ch, sig: hasDot && i === chars.length - 1 ? true : false }); return; } if (i < firstNZ) out.push({ ch: ch, sig: false }); else if (i <= lastNZ) out.push({ ch: ch, sig: true }); else out.push({ ch: ch, sig: hasDot ? true : 'amb' }); });
    var cnt = out.filter(function (d) { return d.sig === true; }).length, amb = out.some(function (d) { return d.sig === 'amb'; });
    return { digits: out, count: cnt, ambiguous: amb, exp: m[3] ? m[3].replace('−', '-') : null, sign: m[1] };
  }
  var PRESETS = { 'accurate-precise': [10.01, 9.99, 10.02, 10.00, 9.98], 'precise-not-accurate': [10.51, 10.49, 10.52, 10.50, 10.48], 'accurate-not-precise': [9.62, 10.41, 10.13, 9.68, 10.16], 'neither': [10.92, 9.81, 11.38, 10.24, 11.15] };
  R('ch-measure', function (elx, o) {
    o = opt(o, { mode: 'ruler', value: null, div: null, range: null, zoom: 1, decimals: null, num: '0.004050', preset: 'precise-not-accurate', shots: null, 'true': 10.0 });
    var mode = o.mode, quiet = !!(o.quiet || o.readout === false);
    var F = frame(elx, o, mode === 'digits' ? 'Significant figures' : mode === 'target' ? 'Accuracy and precision' : 'Reading a ' + ({ ruler: 'ruler', cylinder: 'graduated cylinder', buret: 'buret', thermometer: 'thermometer', balance: 'balance' }[mode] || 'scale'));
    if (mode === 'digits') return digitsView(F, o);
    if (mode === 'target') return targetView(F, o);
    var I = INST[mode] || INST.ruler, val = num(o.value, I.value), div = num(o.div, I.div), rg = o.range || I.range, S = { z: clamp(num(o.zoom, 1), 1, 8) };
    var c = F.canvas({ aspect: mode === 'ruler' ? 3.0 : 1.5, min: mode === 'ruler' ? 170 : 300, max: 420, narrow: mode === 'ruler' ? 1.6 : 0.9 });
    var dp = M.max(0, -M.floor(log10(div) + 1e-9)) + 1; // one estimated digit past the smallest marking
    function reading() { return mode === 'balance' ? val.toFixed(o.decimals != null ? o.decimals : I.decimals) : (M.round(val / (div / 10)) * (div / 10)).toFixed(dp); }
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      if (mode === 'balance') { var bw = M.min(c.w * 0.7, 340), bx = (c.w - bw) / 2, by = c.h * 0.25; ctx.fillStyle = k.dark ? '#2b3a32' : '#dde3df'; rr(ctx, bx, by + 70, bw, c.h * 0.4, 14); ctx.fill(); ctx.fillStyle = k.dark ? '#5b6c63' : '#b9c4be'; rr(ctx, bx + bw * 0.2, by + 40, bw * 0.6, 20, 8); ctx.fill(); ctx.fillStyle = '#16231b'; rr(ctx, bx + bw * 0.22, by + 100, bw * 0.56, 54, 8); ctx.fill(); var dTxt = quiet ? '–.–––' : reading() + ' ' + I.unit, dW = bw * 0.56 - 16, dF = 28; ctx.save(); ctx.font = '600 28px ui-monospace,Menlo,Consolas,monospace'; var mw0 = ctx.measureText(dTxt).width; ctx.restore(); if (mw0 > dW) dF = M.max(14, M.floor(28 * dW / mw0)); txt(ctx, dTxt, bx + bw / 2, by + 127, { size: dF, align: 'center', color: '#7CFC9A', font: '600 ' + dF + 'px ui-monospace,Menlo,Consolas,monospace' }); ctx.fillStyle = k.acc; rr(ctx, bx + bw / 2 - 30, by + 6, 60, 34, 8); ctx.fill(); txt(ctx, 'sample', bx + bw / 2, by + 23, { size: 11, align: 'center', color: '#fff', bold: true }); return; }
      // a scale (vertical for cylinder, buret and thermometer; horizontal for the ruler), zoomed around the reading
      var vert = mode !== 'ruler', L = vert ? c.h - 40 : c.w - 40, span = (rg[1] - rg[0]) / S.z, lo = clamp(val - span / 2, rg[0], rg[1] - span), hi = lo + span, P = function (v) { var t = (v - lo) / span; if (mode === 'buret') return 20 + t * L; return vert ? 20 + (1 - t) * L : 20 + t * L; };
      var majorEvery = 10, pxPerDiv = L / (span / div);
      var cx = vert ? c.w * (c.w < 560 ? 0.6 : 0.45) : 0, tubeW = vert ? M.min(90, c.w * 0.22) : 0;
      if (vert) { // the glass, the liquid and the meniscus
        ctx.fillStyle = k.glass; ctx.fillRect(cx - tubeW / 2, 0, tubeW, c.h); ctx.strokeStyle = k.glassLine; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - tubeW / 2, 0); ctx.lineTo(cx - tubeW / 2, c.h); ctx.moveTo(cx + tubeW / 2, 0); ctx.lineTo(cx + tubeW / 2, c.h); ctx.stroke();
        var ly = P(val), men = M.min(14, 4 + 1.5 * S.z);
        if (mode === 'thermometer') { ctx.fillStyle = k.red; ctx.fillRect(cx - 4, ly, 8, c.h - ly); }
        else { ctx.fillStyle = k.water; if (mode === 'buret') ctx.fillRect(cx - tubeW / 2, ly - men, tubeW, c.h); else ctx.fillRect(cx - tubeW / 2, ly - men, tubeW, c.h - ly + men); ctx.strokeStyle = k.waterLine; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - tubeW / 2, ly - men); ctx.quadraticCurveTo(cx, ly + men * 0.9, cx + tubeW / 2, ly - men); ctx.stroke(); }
      } else { ctx.fillStyle = k.dark ? '#d9c79a' : '#f3e2b3'; ctx.fillRect(20, c.h * 0.42, c.w - 40, c.h * 0.4); ctx.fillStyle = k.acc; ctx.globalAlpha = 0.85; var x1 = P(rg[0] > lo ? rg[0] : lo), x2 = P(val); ctx.fillRect(M.min(x1, x2), c.h * 0.16, M.abs(x2 - x1), c.h * 0.18); ctx.globalAlpha = 1; line(ctx, [[x2, c.h * 0.16], [x2, c.h * 0.42]], k.acc, 1.5, [3, 3]); }
      // marks
      var first = M.ceil(lo / div - 1e-9);
      for (var i = first; i * div <= hi + 1e-9; i++) { var v = i * div, p = P(v), major = M.abs(v / (div * majorEvery) - M.round(v / (div * majorEvery))) < 1e-6, mid = !major && M.abs(v / (div * 5) - M.round(v / (div * 5))) < 1e-6; var len = major ? 18 : mid ? 12 : 7;
        if (vert) { line(ctx, [[cx + tubeW / 2 - len, p], [cx + tubeW / 2, p]], k.ink, major ? 1.6 : 1); if (major || (mid && pxPerDiv > 5) || pxPerDiv > 22) txt(ctx, fm(v, 4), cx + tubeW / 2 + 6, p, { size: major ? 12 : 10, color: k.ink }); }
        else { line(ctx, [[p, c.h * 0.42], [p, c.h * 0.42 + len]], '#3b3b3b', major ? 1.6 : 1); if (major || (mid && pxPerDiv > 8) || pxPerDiv > 34) txt(ctx, fm(v, 4), p, c.h * 0.42 + len + 9, { size: major ? 12 : 10, align: 'center', color: '#1d2320' }); } }
      if (vert) { txt(ctx, I.unit, cx + tubeW / 2 + 6, 12, { size: 12, bold: true, color: k.ink }); if (mode !== 'thermometer') { line(ctx, [[cx - tubeW / 2 - 30, P(val)], [cx - tubeW / 2 - 4, P(val)]], k.gold, 2); var eL = wrapL(ctx, 'eye level: read the bottom of the curve', cx - tubeW / 2 - 40, 10); eL.forEach(function (t, j) { txt(ctx, t, cx - tubeW / 2 - 34, P(val) + (j - (eL.length - 1) / 2) * 12, { size: 10, align: 'right', color: k.gold }); }); } if (mode === 'buret') txtw(ctx, 'numbers grow downward', cx - tubeW / 2 - 8, 30, cx - tubeW / 2 - 14, { size: 10, align: 'right' }); }
      txt(ctx, 'zoom ' + fm(S.z, 1) + '×', c.w - 8, c.h - 10, { size: 10, align: 'right' });
    }
    function report() { var r = reading(), sd = sigDigits(r); F.say(quiet ? 'Read the scale to one digit past the smallest marking (' + fm(div, 4) + ' ' + I.unit + ').' : (mode === 'balance' ? 'A digital balance shows every digit it measures: ' + r + ' ' + I.unit + ' has ' + sd.count + ' significant figures; the last one is uncertain.' : 'Reading: <b>' + r + ' ' + I.unit + '</b>. The smallest marking is ' + fm(div, 4) + ' ' + I.unit + ', so estimate one more digit (here the ' + (dp === 1 ? 'tenths' : dp === 2 ? 'hundredths' : 'thousandths') + '). That last digit is uncertain but still significant: ' + sd.count + ' significant figures.' + (mode === 'cylinder' || mode === 'buret' ? ' Read the bottom of the meniscus at eye level.' : ''))); F.setAlt('A ' + mode + ' showing a reading to be estimated.'); }
    if (F.edit && mode !== 'balance') { btn(F.ctl, '− Zoom out', function () { S.z = M.max(1, S.z / 2); draw(); }); btn(F.ctl, '+ Zoom in', function () { S.z = M.min(8, S.z * 2); draw(); }); }
    redraw(c, draw); draw(); report(); return { draw: draw };
  }
  );
  function digitsView(F, o) {
    var S = { s: String(o.num) }, quiet = F.quiet, box = F.html('chv-digits'); F.box.hidden = true;
    function render() { var d = sigDigits(S.s); if (!d) { box.innerHTML = 'Type a number such as 0.004050 or 1.20e3.'; return; } box.innerHTML = '<div class="chv-dg">' + (d.sign || '') + d.digits.map(function (x) { return '<span class="' + (x.sig === true ? 'sig' : x.sig === 'amb' ? 'amb' : x.sig === false ? 'no' : 'pt') + '">' + x.ch + '</span>'; }).join('') + (d.exp ? '<span class="pt"> × 10<sup>' + d.exp.replace('-', '−') + '</sup></span>' : '') + '</div>' + '<p class="chv-legend"><span><span class="chv-key" style="--c:var(--chv-acc)"></span>significant</span><span><span class="chv-key" style="--c:#adb5bd"></span>placeholder zero (not significant)</span>' + (d.ambiguous ? '<span><span class="chv-key" style="--c:var(--chv-gold)"></span>trailing zero with no decimal point: ambiguous</span>' : '') + '</p>';
      F.say(quiet ? 'Which digits are significant?' : '<b>' + d.count + ' significant figure' + (d.count === 1 ? '' : 's') + '</b>' + (d.ambiguous ? ' (or more: the trailing zeros might be measured; write it in scientific notation to say)' : '') + '. Leading zeros only place the decimal point; zeros between digits count; trailing zeros count when there is a decimal point.'); F.setAlt('The number ' + S.s + ' with its significant digits highlighted.'); }
    if (F.edit) { var l = mk('label', 'chv-lab', 'Number'), inp = D.createElement('input'); inp.type = 'text'; inp.value = S.s; inp.inputMode = 'decimal'; inp.style.cssText = 'font:600 1rem system-ui;min-height:36px;padding:.2rem .5rem;border-radius:10px;border:1px solid var(--mv-line);background:var(--mv-card);color:var(--mv-ink);max-width:12rem'; inp.addEventListener('input', function () { S.s = inp.value; render(); }); l.appendChild(inp); F.ctl.appendChild(l); }
    render(); return { draw: render };
  }
  function targetView(F, o) {
    var T0 = num(o['true'], 10), shots = o.shots ? o.shots.map(function (x) { return num(x, T0); }) : (PRESETS[o.preset] || PRESETS['precise-not-accurate']).map(function (x) { return x * T0 / 10; }), quiet = F.quiet;
    var mean = shots.reduce(function (a, b) { return a + b; }, 0) / shots.length, sd = M.sqrt(shots.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / (shots.length - 1)), pe = M.abs(mean - T0) / M.abs(T0) * 100;
    var acc = pe < 1, prec = sd / M.abs(T0) * 100 < 1, c = F.canvas({ aspect: 2.0, min: 250, max: 340, narrow: 1.1 });
    function draw() {
      var ctx = c.ctx, k = pal(), wide = c.w >= 520, R0 = M.min(wide ? c.w * 0.18 : c.w * 0.3, c.h * 0.4), cx = wide ? c.w * 0.22 : c.w / 2, cy = wide ? c.h / 2 : c.h * 0.32; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      [1, 0.75, 0.5, 0.25].forEach(function (f, i) { ctx.fillStyle = i % 2 ? (k.dark ? '#2a3a32' : '#f1f3f5') : (k.dark ? '#3b2a33' : '#ffe3e3'); ctx.beginPath(); ctx.arc(cx, cy, R0 * f, 0, TAU); ctx.fill(); }); ctx.fillStyle = k.red; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, TAU); ctx.fill();
      var spread = R0 / (T0 * 0.15); shots.forEach(function (v, i) { var a = i * 2.39996, r = M.min(R0 * 0.95, M.abs(v - T0) * spread); ball(ctx, cx + r * M.cos(a), cy + r * M.sin(a), 5, 'x', { color: k.blue }); });
      // dot plot against the true value
      var x0 = wide ? c.w * 0.48 : 20, x1 = c.w - 20, y = wide ? c.h * 0.55 : c.h * 0.8, lo = T0 * 0.88, hi = T0 * 1.12, X = function (v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); };
      line(ctx, [[x0, y], [x1, y]], k.axis, 1.5); [lo, T0, hi].forEach(function (v, j) { line(ctx, [[X(v), y], [X(v), y + 6]], k.axis, 1); txt(ctx, fm(v, 2), X(v), y + 15, { size: 10, align: ['left', 'center', 'right'][j] }); });
      line(ctx, [[X(T0), y - 50], [X(T0), y]], k.red, 2, [4, 3]); txt(ctx, 'true value', X(T0), y - 58, { size: 10, align: 'center', color: k.red });
      var stack = {}; shots.forEach(function (v) { var key2 = M.round(X(v) / 8); stack[key2] = (stack[key2] || 0) + 1; ball(ctx, X(v), y - 8 - (stack[key2] - 1) * 11, 5, 'x', { color: k.blue }); });
      if (!quiet) { var maxS = 1; Object.keys(stack).forEach(function (q) { maxS = M.max(maxS, stack[q]); }); var ay = M.min(y - 46, y - 8 - (maxS - 1) * 11 - 16); if (M.abs(X(mean) - X(T0)) < 80 && M.abs(ay - (y - 58)) < 14) ay = y - 76; line(ctx, [[X(mean), ay + 6], [X(mean), y]], k.acc, 2); var aw = tw(ctx, 'average ' + fm(mean, 3), 10, true) / 2 + 2; txt(ctx, 'average ' + fm(mean, 3), clamp(X(mean), aw, c.w - aw), ay, { size: 10, align: 'center', color: k.acc, bold: true }); }
    }
    function report() { F.say(quiet ? 'Five measurements of a quantity whose true value is ' + fm(T0, 3) + '.' : 'Average ' + fm(mean, 3) + ', percent error ' + fm(pe, 2) + '% (|average − true| ÷ true × 100); spread (standard deviation) ' + fm(sd, 3) + '. <b>' + (acc ? 'Accurate' : 'Not accurate') + '</b> (close to the true value or not) and <b>' + (prec ? 'precise' : 'not precise') + '</b> (close to one another or not).' + (prec && !acc ? ' Precise results can still be wrong: a consistent error moves them all together.' : '')); F.setAlt('A target with five shots and a dot plot of the five measurements beside the true value.'); }
    redraw(c, draw); draw(); report(); return { draw: draw };
  }
  CH.sigDigits = sigDigits;

  // =====================================================================================================
  // ch-eqbalance: options are documented at the top of this file
  function nucTok(t) { t = t.trim(); var special = { 'e-': [0, -1, 'β⁻', 'e', 'beta'], 'e+': [0, 1, 'β⁺', 'e', 'positron'], n: [1, 0, 'n', 'n', 'neutron'], p: [1, 1, 'p', 'p', 'proton'], gamma: [0, 0, 'γ', 'γ', 'gamma'], alpha: [4, 2, 'He', 'He', 'alpha'] }; if (special[t]) return { A: special[t][0], Z: special[t][1], s: special[t][3], name: special[t][4] }; var m = t.match(/^([A-Z][a-z]?)-?(\d+)$/) || t.match(/^(\d+)([A-Z][a-z]?)$/); if (!m) return null; var sym = /\d/.test(m[1]) ? m[2] : m[1], A = +(/\d/.test(m[1]) ? m[1] : m[2]); return BYS[sym] ? { A: A, Z: BYS[sym].Z, s: sym } : null; }
  function nucH(t) { var q = nucTok(t); if (!q) return esc(t); return '<span class="chv-nuc"><span><sup>' + q.A + '</sup><sub>' + (q.Z < 0 ? '−' + (-q.Z) : q.Z) + '</sub></span>' + (q.s === 'γ' ? 'γ' : q.s) + '</span>'; }
  R('ch-eqbalance', function (elx, o) {
    o = opt(o, { eq: 'CH4 + O2 -> CO2 + H2O', coef: null, mode: 'molecular', pictures: true, half: ['Fe2+ -> Fe3+', 'MnO4- -> Mn2+'], medium: 'acid' });
    var mode = o.mode, quiet = !!(o.quiet || o.readout === false), F = frame(elx, o, mode === 'half' ? 'Balancing a redox equation with half-reactions' : mode === 'nuclear' ? 'Balancing a nuclear equation' : 'Balancing a chemical equation');
    if (mode === 'half') return halfBalance(F, o);
    var eq = mode === 'nuclear' ? (function () { var m = String(o.eq === 'CH4 + O2 -> CO2 + H2O' ? 'U-238 -> Th-234 + He-4' : o.eq).split(/\s*->\s*|\s*→\s*/); return { left: m[0].split(/\s+\+\s+/).map(function (f) { return { f: f.trim(), c: 1 }; }), right: m[1].split(/\s+\+\s+/).map(function (f) { return { f: f.trim(), c: 1 }; }) }; })() : (parseEq(o.eq) || parseEq('CH4 + O2 -> CO2 + H2O'));
    var terms = eq.left.map(function (t) { return { f: t.f, side: 0 }; }).concat(eq.right.map(function (t) { return { f: t.f, side: 1 }; })), co = terms.map(function (t, i) { return o.coef && o.coef[i] != null ? M.max(1, M.round(num(o.coef[i], 1))) : 1; });
    var row = F.html('chv-eq'), tallyEl = F.html('chv-tbl'), note = F.html('chv-note'); F.el.insertBefore(row, F.box); row.setAttribute('role', 'group'); row.setAttribute('aria-label', 'The equation, with a coefficient in front of each formula');
    var c = o.pictures !== false && mode !== 'nuclear' ? F.canvas({ aspect: 3.6, min: 140, max: 210, narrow: 2.2 }) : null; if (!c) F.box.hidden = true;
    function counts() { var L = {}, Rr = {}, qL = 0, qR = 0; terms.forEach(function (t, i) { if (mode === 'nuclear') { var q = nucTok(t.f); if (!q) return; var tg = t.side ? Rr : L; tg.A = (tg.A || 0) + q.A * co[i]; tg.Z = (tg.Z || 0) + q.Z * co[i]; return; } var p = parseF(t.f), tg2 = t.side ? Rr : L; for (var e in p.atoms) tg2[e] = (tg2[e] || 0) + p.atoms[e] * co[i]; if (t.side) qR += p.charge * co[i]; else qL += p.charge * co[i]; }); return { L: L, R: Rr, qL: qL, qR: qR }; }
    function build() {
      row.innerHTML = '';
      terms.forEach(function (t, i) {
        if (i && terms[i - 1].side === t.side) row.appendChild(mk('span', 'chv-op', '+'));
        if (i && terms[i - 1].side !== t.side) row.appendChild(mk('span', 'chv-op', '→'));
        var term = mk('span', 'chv-term');
        if (F.edit && mode !== 'nuclear') { var sp = mk('span', 'chv-spin'), up = mk('button', '', '▲'), out = mk('output', '', String(co[i])), dn = mk('button', '', '▼'); up.type = dn.type = 'button'; up.setAttribute('aria-label', 'More ' + fT(t.f)); dn.setAttribute('aria-label', 'Fewer ' + fT(t.f)); up.addEventListener('click', function () { co[i] = M.min(20, co[i] + 1); out.textContent = co[i]; update(); }); dn.addEventListener('click', function () { co[i] = M.max(1, co[i] - 1); out.textContent = co[i]; update(); }); sp.appendChild(up); sp.appendChild(out); sp.appendChild(dn); term.appendChild(sp); }
        else if (co[i] !== 1) term.appendChild(mk('b', '', String(co[i])));
        var fb = mk('button', 'chv-f', mode === 'nuclear' ? nucH(t.f) : fH(t.f)); fb.type = 'button'; fb.style.cssText = 'border:0;background:none;color:inherit;font:inherit;padding:0 .15rem'; fb.setAttribute('aria-label', mode === 'nuclear' ? t.f : fT(t.f) + ' (its subscripts are locked)');
        fb.addEventListener('click', function () { note.innerHTML = mode === 'nuclear' ? 'In a nuclear equation the mass numbers (top) and atomic numbers (bottom) must add up to the same totals on both sides.' : 'Subscripts are locked: changing the 2 in H₂O would make H₂O₂, a different substance. Change the coefficient in front instead.'; });
        term.appendChild(fb); row.appendChild(term);
      });
    }
    function draw() {
      if (!c) return; var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var n = terms.length, gap = 10, arrowW = 26, w = (c.w - gap * (n + 1) - arrowW) / n, x = gap;
      terms.forEach(function (t, i) { if (i && terms[i - 1].side !== t.side) { arrow(ctx, x, c.h / 2, x + arrowW - 6, c.h / 2, k.muted, 2, 7); x += arrowW; }
        panel(ctx, x, 6, w, c.h - 12, { r: 8 }); var cnt = co[i], sp = sprite(t.f), rad = M.min(sp.r, 1.8), H2 = c.h - 34, best = null;
        for (var cols = 1; cols <= cnt; cols++) { var rows = M.ceil(cnt / cols), cell = M.min((w - 8) / cols, H2 / rows), uu = M.min(22, cell / (rad * 2.3 + 0.3)); if (!best || uu > best[2]) best = [cols, rows, uu]; }
        for (var j = 0; j < cnt; j++) { var r = M.floor(j / best[0]), cc = j % best[0], rowN = M.min(best[0], cnt - r * best[0]), cw2 = (w - 8) / best[0]; drawMol(ctx, t.f, x + w / 2 + (cc - (rowN - 1) / 2) * cw2, 8 + H2 / 2 + (r - (best[1] - 1) / 2) * (H2 / best[1]), best[2], {}); }
        fDraw(ctx, (cnt > 1 ? cnt : '') + t.f, x + w / 2, c.h - 12, { size: 11, align: 'center', color: k.muted }); x += w + gap; });
    }
    function update() {
      var t = counts(), keys = mode === 'nuclear' ? ['A', 'Z'] : Object.keys(Object.assign({}, t.L, t.R)), ok = keys.every(function (e) { return (t.L[e] || 0) === (t.R[e] || 0); }) && t.qL === t.qR, ionic = terms.some(function (tt) { return parseF(tt.f).charge; });
      var rows = keys.map(function (e) { var a = t.L[e] || 0, b = t.R[e] || 0; return [mode === 'nuclear' ? (e === 'A' ? 'mass number A' : 'atomic number Z') : fH(e), quiet ? '?' : a, quiet ? '?' : b, quiet ? '' : { h: a === b ? '✓' : '✗', c: a === b ? 'ok' : 'no' }]; });
      if (ionic && mode !== 'nuclear') rows.push(['charge', quiet ? '?' : t.qL, quiet ? '?' : t.qR, quiet ? '' : { h: t.qL === t.qR ? '✓' : '✗', c: t.qL === t.qR ? 'ok' : 'no' }]);
      tallyEl.innerHTML = tbl([mode === 'nuclear' ? 'Totals' : 'Atoms', 'Left', 'Right', ''], rows);
      F.done(ok && !quiet); draw();
      F.say(quiet ? 'Count each kind of atom on both sides.' : ok ? '<span class="chv-ok">Balanced.</span> Every ' + (mode === 'nuclear' ? 'total (mass number and atomic number)' : 'element' + (ionic ? ' and the charge' : '')) + ' matches on both sides. Coefficients count whole molecules: ' + terms.map(function (tt, i) { return co[i] + ' ' + fH(tt.f); }).filter(function (s, i) { return co[i] > 1; }).join(', ') + (terms.some(function (tt, i) { return co[i] > 1; }) ? '.' : ' (all 1).') : 'Not balanced yet: ' + keys.filter(function (e) { return (t.L[e] || 0) !== (t.R[e] || 0); }).map(function (e) { return (mode === 'nuclear' ? e : fH(e)) + ' ' + (t.L[e] || 0) + ' ≠ ' + (t.R[e] || 0); }).join(', ') + (t.qL !== t.qR ? ', charge ' + t.qL + ' ≠ ' + t.qR : '') + '.');
      F.setAlt('The equation ' + terms.map(function (tt, i) { return co[i] + ' ' + (mode === 'nuclear' ? tt.f : fT(tt.f)); }).join(' and ') + ', with an atom tally.');
    }
    build(); if (c) redraw(c, draw); update(); return { draw: update };
  });
  // half-reactions: each half gets helper species (H₂O, H⁺ or OH⁻, e⁻) on both sides with coefficients from 0, and a multiplier
  function halfBalance(F, o) {
    var med = o.medium === 'base' ? 'OH-' : 'H+', quiet = F.quiet, halves = (o.half || ['Fe2+ -> Fe3+', 'MnO4- -> Mn2+']).slice(0, 2).map(function (h) { var e = parseEq(h); var terms = []; e.left.forEach(function (t) { terms.push({ f: t.f, side: 0, c: 1, main: true }); }); ['H2O', med, 'e-'].forEach(function (f) { terms.push({ f: f, side: 0, c: 0 }); }); e.right.forEach(function (t) { terms.push({ f: t.f, side: 1, c: 1, main: true }); }); ['H2O', med, 'e-'].forEach(function (f) { terms.push({ f: f, side: 1, c: 0 }); }); return { terms: terms, mult: 1 }; });
    var wrap = F.html('chv-halves'); F.box.hidden = true; var out = F.html('chv-tbl');
    function tally(h) { var L = {}, Rr = {}, q = [0, 0], e = [0, 0]; h.terms.forEach(function (t) { if (!t.c) return; var p = parseF(t.f), tg = t.side ? Rr : L; for (var el2 in p.atoms) tg[el2] = (tg[el2] || 0) + p.atoms[el2] * t.c; q[t.side] += p.charge * t.c; if (p.electron) e[t.side] += t.c; }); var ok = Object.keys(Object.assign({}, L, Rr)).every(function (k2) { return (L[k2] || 0) === (Rr[k2] || 0); }) && q[0] === q[1]; return { L: L, R: Rr, q: q, e: e[0] - e[1], ok: ok }; }
    function render() {
      wrap.innerHTML = ''; var results = halves.map(tally);
      halves.forEach(function (h, hi) {
        var row = mk('div', 'chv-eq'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', 'Half-reaction ' + (hi + 1));
        var mult = mk('span', 'chv-term', '<span class="chv-op">×</span>'); spin(mult, function () { return h.mult; }, function (v) { h.mult = clamp(v, 1, 10); }, 'Multiplier for half-reaction ' + (hi + 1)); row.appendChild(mult);
        var first = [true, true];
        h.terms.forEach(function (t) { if (!t.main && !t.c && !F.edit) return; if (!first[t.side]) row.appendChild(mk('span', 'chv-op', '+')); else if (t.side === 1) row.appendChild(mk('span', 'chv-op', '→')); first[t.side] = false; var term = mk('span', 'chv-term' + (t.main ? '' : ' chv-helper')); if (F.edit) spin(term, function () { return t.c; }, function (v) { t.c = clamp(v, t.main ? 1 : 0, 20); }, fT(t.f)); else if (t.c !== 1) term.appendChild(mk('b', '', String(t.c))); term.appendChild(mk('span', '', fH(t.f))); row.appendChild(term); });
        if (first[1]) { }
        var r = results[hi]; row.appendChild(mk('span', r.ok ? 'chv-ok' : 'chv-no', quiet ? '' : r.ok ? '✓ balanced' : 'not yet')); wrap.appendChild(row);
      });
      var eA = results[0].e * halves[0].mult, eB = results[1] ? results[1].e * halves[1].mult : 0, allOk = results.every(function (r) { return r.ok; }), match = eA + eB === 0 && eA !== 0;
      out.innerHTML = quiet ? '' : tbl(['', 'Atoms, charge', 'Electrons'], halves.map(function (h, i) { return ['Half ' + (i + 1) + ' × ' + h.mult, { h: results[i].ok ? '✓' : '✗', c: results[i].ok ? 'ok' : 'no' }, results[i].e * h.mult > 0 ? 'takes ' + results[i].e * h.mult : results[i].e * h.mult < 0 ? 'gives ' + (-results[i].e * h.mult) : '0']; }));
      F.done(allOk && match);
      F.say(quiet ? 'Balance each half-reaction for atoms and charge, then make the electrons match.' : !allOk ? 'Balance each half for atoms (use ' + fH('H2O') + ' for O and ' + fH(med) + ' for H' + (med === 'OH-' ? ', since this is a basic solution' : '') + ') and then for charge with ' + fH('e-') + '.' : match ? '<span class="chv-ok">The electrons match</span>: ' + M.abs(eA) + ' given and ' + M.abs(eA) + ' taken. Add the two halves and cancel what appears on both sides.' : 'Each half is balanced. Now set the multipliers so the electrons given equal the electrons taken.');
      F.setAlt('Two half-reactions with coefficient spinners.');
    }
    function spin(parent, get, set, label) { var sp = mk('span', 'chv-spin'), up = mk('button', '', '▲'), o2 = mk('output', '', String(get())), dn = mk('button', '', '▼'); up.type = dn.type = 'button'; up.setAttribute('aria-label', 'More: ' + label); dn.setAttribute('aria-label', 'Fewer: ' + label); up.addEventListener('click', function () { set(get() + 1); render(); }); dn.addEventListener('click', function () { set(get() - 1); render(); }); sp.appendChild(up); sp.appendChild(o2); sp.appendChild(dn); parent.appendChild(sp); }
    render(); return { draw: render };
  }
  CH.nucTok = nucTok;

  // =====================================================================================================
  // ch-limiting: options are documented at the top of this file
  R('ch-limiting', function (elx, o) {
    o = opt(o, { eq: '2H2 + O2 -> 2H2O', amounts: null, unit: 'particles', M: null, actual: null, show: ['bars', 'table'], step: true });
    var eq = parseEq(o.eq) || parseEq('2H2 + O2 -> 2H2O'), unit = o.unit, quiet = !!(o.quiet || o.readout === false), show = {}; (o.show || []).forEach(function (x) { show[x] = 1; });
    var F = frame(elx, o, 'Which reactant runs out first?'), Mm = {}; eq.left.concat(eq.right).forEach(function (t) { Mm[t.f] = o.M && o.M[t.f] != null ? num(o.M[t.f], 1) : mm2(t.f); });
    var amt = {}; eq.left.forEach(function (t, i) { amt[t.f] = o.amounts && o.amounts[t.f] != null ? num(o.amounts[t.f], 0) : [5, 2, 3][i] || 2; });
    function mol(f) { return unit === 'g' ? amt[f] / Mm[f] : amt[f]; } // particles count as "mole-like" counts
    var P0 = eq.right[0], ext = M.min.apply(null, eq.left.map(function (t) { return mol(t.f) / t.c; })), lim = eq.left.filter(function (t) { return M.abs(mol(t.f) / t.c - ext) < 1e-12; }).map(function (t) { return t.f; });
    if (unit === 'particles') ext = M.floor(ext + 1e-9);
    var S = { done: o.step === false || !F.edit, sets: 0, t: 0 }, c = F.canvas({ aspect: 2.5, min: 230, max: 330, narrow: 1.05 }), tblEl = show.table ? F.html('chv-tbl') : null;
    if (S.done) S.sets = ext;
    function after(f, sets) { var t = eq.left.find(function (x) { return x.f === f; }); if (t) return mol(f) - t.c * sets; var r = eq.right.find(function (x) { return x.f === f; }); return r ? r.c * sets : 0; }
    function fmtAmt(v, f) { if (unit === 'particles') return fm(v, 0); if (unit === 'g') return sf(v * Mm[f], 3) + ' g'; return sf(v, 3) + ' mol'; }
    function draw() {
      var ctx = c.ctx, k = pal(), wide = c.w >= 560, bins = eq.left.concat(eq.right), n = bins.length, bw = wide && show.bars ? c.w * 0.62 : c.w, gap = 10, agap = 26, w = (bw - gap * (n + 1) - agap) / n, h = wide || !show.bars ? c.h - 16 : c.h * 0.58; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      bins.forEach(function (t, i) { var x = gap + i * (w + gap) + (i >= eq.left.length ? agap : 0), isP = i >= eq.left.length, count = isP ? after(t.f, S.sets) : after(t.f, S.sets), drawN = unit === 'particles' ? M.round(count) : 0, isLim = !quiet && S.done && lim.indexOf(t.f) >= 0;
        panel(ctx, x, 8, w, h - 8, { r: 10, line: isLim ? k.red : null }); fDraw(ctx, t.f, x + w / 2, 20, { size: 13, align: 'center', color: k.ink, bold: true });
        if (unit === 'particles') { var sp = sprite(t.f), rad = M.min(sp.r, 1.8), H2 = h - 64, nmax = M.max(drawN, 1), best = null; for (var cols = 1; cols <= nmax; cols++) { var rows = M.ceil(nmax / cols), cell = M.min((w - 10) / cols, H2 / rows), uu = M.min(18, cell / (rad * 2.3 + 0.3)); if (!best || uu > best[2]) best = [cols, rows, uu]; } for (var j = 0; j < drawN; j++) { var r2 = M.floor(j / best[0]), cc = j % best[0]; drawMol(ctx, t.f, x + w / 2 + (cc - (best[0] - 1) / 2) * (w - 10) / best[0], 32 + H2 / 2 + (r2 - (best[1] - 1) / 2) * (H2 / best[1]), best[2], {}); } if (!quiet || !isP) txt(ctx, (isP ? 'made: ' : S.sets ? 'left: ' : '') + fm(count, 0), x + w / 2, h - 10, { size: 11, align: 'center', color: isLim ? k.red : k.ink, bold: isLim }); }
        else if (!quiet || !isP) txt(ctx, fmtAmt(count, t.f), x + w / 2, h / 2, { size: 13, align: 'center', color: k.ink, bold: true });
        if (isLim) txt(ctx, 'limiting', x + w / 2, h - 26, { size: 11, align: 'center', color: k.red, bold: true });
        if (i === eq.left.length - 1) arrow(ctx, x + w + 4, h / 2, x + w + gap + agap - 4, h / 2, k.muted, 2.5, 8); });
      if (show.bars) { // how much product each reactant could make
        var bx = wide ? bw + 14 : 14, by = wide ? 24 : h + 22, bW = wide ? c.w - bw - 48 : c.w - 48, cap = eq.left.map(function (t) { return mol(t.f) / t.c * P0.c; }), mx = M.max.apply(null, cap); txt(ctx, fT(P0.f) + ' each reactant could make', bx, by - 10, { size: 11, bold: true, color: k.ink });
        eq.left.forEach(function (t, i) { var y = by + 6 + i * 26, len = (bW - 70) * cap[i] / mx; ctx.fillStyle = !quiet && lim.indexOf(t.f) >= 0 ? k.red : k.blue; rr(ctx, bx + 52, y, M.max(2, len), 16, 4); ctx.fill(); fDraw(ctx, t.f, bx + 46, y + 8, { size: 11, align: 'right' }); if (!quiet) txt(ctx, fmtAmt(cap[i], P0.f), bx + 56 + len, y + 8, { size: 10, color: k.ink }); });
        if (!quiet) txt(ctx, 'the smaller bar wins', bx + 52, by + 12 + eq.left.length * 26, { size: 10 }); }
    }
    function report() {
      var s; if (!S.done) s = 'Run the reaction: each set uses ' + eq.left.map(function (t) { return t.c + ' ' + fH(t.f); }).join(' and ') + '.' + (S.sets ? ' Sets so far: ' + S.sets + '.' : '');
      else s = quiet ? 'The reaction ran until a reactant ran out.' : '<b>' + lim.map(fH).join(' and ') + '</b> ' + (lim.length > 1 ? 'run out together' : 'runs out first: it is the limiting reactant') + '. Product: ' + fmtAmt(after(P0.f, ext), P0.f) + ' of ' + fH(P0.f) + '. Left over: ' + eq.left.filter(function (t) { return lim.indexOf(t.f) < 0; }).map(function (t) { return fmtAmt(after(t.f, ext), t.f) + ' of ' + fH(t.f); }).join(', ') + '.' + (unit === 'g' ? ' Compare moles divided by coefficients, not grams.' : ' Divide each amount by its coefficient: the smallest result is limiting.');
      if (S.done && o.actual != null && !quiet) { var theo = unit === 'g' ? after(P0.f, ext) * Mm[P0.f] : after(P0.f, ext); s += ' Percent yield = actual ÷ theoretical × 100 = ' + fm(num(o.actual, 0), 3) + ' ÷ ' + sf(theo, 4) + ' × 100 = <b>' + fm(num(o.actual, 0) / theo * 100, 1) + '%</b>.'; }
      F.say(s);
      if (tblEl) { var sets = S.done ? ext : S.sets, all = eq.left.concat(eq.right), u2 = unit === 'particles' ? '' : ' (mol)'; tblEl.innerHTML = tbl([''].concat(all.map(function (t) { return fH(t.f); })), [['Before' + u2].concat(all.map(function (t) { var b = eq.left.indexOf(t) >= 0 ? mol(t.f) : 0; return unit === 'particles' ? fm(b, 0) : sf(b, 3); })), ['Change' + u2].concat(all.map(function (t) { var ch = (eq.left.indexOf(t) >= 0 ? -1 : 1) * t.c * sets; return quiet && S.done ? '?' : (ch > 0 ? '+' : ch < 0 ? '−' : '') + (unit === 'particles' ? fm(M.abs(ch), 0) : sf(M.abs(ch), 3)); })), ['After' + u2].concat(all.map(function (t) { var a = after(t.f, sets); return quiet && S.done ? '?' : unit === 'particles' ? fm(a, 0) : sf(a, 3); }))]); }
      F.setAlt('Bins of reactant particles and product particles for ' + fT(o.eq) + '.');
    }
    var A = anim(elx, function (dt) { S.t += dt; if (S.t > 0.6) { S.t = 0; if (S.sets < ext) S.sets++; if (S.sets >= ext) { S.done = true; A.stop(); if (pb) pb.textContent = 'Run the reaction'; } draw(); report(); } }, false), pb = null;
    if (F.edit) { pb = btn(F.ctl, 'Run the reaction', function () { if (S.done) { S.sets = 0; S.done = false; } if (V.reduced) { S.sets = ext; S.done = true; draw(); report(); } else A.play(); }, 'pri'); btn(F.ctl, 'One set at a time', function () { if (S.sets < ext) S.sets++; if (S.sets >= ext) S.done = true; draw(); report(); }); btn(F.ctl, 'Reset', function () { A.stop(); S.sets = 0; S.done = false; draw(); report(); }); }
    redraw(c, draw); draw(); report(); return { draw: draw };
  });

  // =====================================================================================================
  // ch-gasbox: options are documented at the top of this file
  var VDW = { He: [0.0341, 0.0237], Ne: [0.211, 0.0171], Ar: [1.34, 0.0322], H2: [0.244, 0.0266], N2: [1.39, 0.0391], O2: [1.36, 0.0318], CO2: [3.59, 0.0427], CH4: [2.25, 0.0428], NH3: [4.17, 0.0371], H2O: [5.46, 0.0305] };
  var GASC = ['#e8a33d', '#4c9be8', '#cc5de8'];
  function pConv(P, u) { return u === 'kPa' ? P * 101.325 : u === 'mmHg' ? P * 760 : P; }
  R('ch-gasbox', function (elx, o) {
    o = opt(o, { n: 1, T: 300, V: null, P: null, species: null, lock: 'T', graph: 'PV', gauges: true, hist: false, hits: true, real: false, work: false, effusion: false, units: 'atm' });
    var sp = (o.species || [{ f: o.effusion ? 'He' : 'He', n: num(o.n, 1) }].concat(o.effusion && !o.species ? [{ f: 'Ar', n: num(o.n, 1) }] : [])).slice(0, 3).map(function (s, i) { return { f: s.f, n: num(s.n, 1), M: molarMass(s.f), col: GASC[i] }; });
    var S = { T: clamp(num(o.T, 300), 50, 1000), V: 0, t: 0, hits: 0, hitT: 0, hitRate: 0, out: {}, path: [], lock: o.lock || '' };
    var nTot = function () { return sp.reduce(function (a, s) { return a + s.n; }, 0); };
    S.V = o.V != null ? clamp(num(o.V, 24.6), 2, 60) : o.P != null ? clamp(nTot() * K.RL * S.T / num(o.P, 1), 2, 60) : clamp(nTot() * 0.082057 * S.T, 2, 60);
    var F = frame(elx, o, 'Gas particles in a box'), quiet = F.quiet, rnd = rng(17);
    var c = F.canvas({ aspect: 1.7, min: 300, max: 440, narrow: 0.95 });
    function P() { return nTot() * K.RL * S.T / S.V; }
    function Preal() { var a = 0, b = 0, n = nTot(); sp.forEach(function (s) { var d = VDW[s.f] || [0, 0]; a += s.n / n * M.sqrt(d[0]); b += s.n / n * d[1]; }); a = a * a; return n * K.RL * S.T / (S.V - n * b) - a * n * n / (S.V * S.V); }
    // particles: about 30 per mole, each moving at a speed ∝ √(T/M) (a 2-D Maxwell–Boltzmann spread)
    var ps = [];
    function lay() { var wide = c.w >= 560, bw = wide ? M.min(c.w * 0.48, 330) : c.w - 24, x0 = wide ? 12 : 12, bot = c.h - 14, maxH = c.h - 40, top = bot - maxH * S.V / 60; return { x0: x0, x1: x0 + bw, top: top, bot: bot, wide: wide, gx: wide ? x0 + bw + 22 : 12, gw: wide ? c.w - bw - 44 : c.w - 24 }; }
    function sync() { var L = lay(); sp.forEach(function (s, si) { var want = M.round(clamp(s.n * 44, 0, 180)), have = ps.filter(function (p) { return p.si === si && !p.gone; }); while (have.length < want) { var v = vel(rnd, 1), p = { si: si, x: L.x0 + 8 + rnd() * (L.x1 - L.x0 - 16), y: L.top + 8 + rnd() * (L.bot - L.top - 16), ux: v[0], uy: v[1], r: si === 0 ? 3.6 : 4.6 }; ps.push(p); have.push(p); } while (have.length > want) { var q = have.pop(); ps.splice(ps.indexOf(q), 1); } }); }
    function speed(p) { var s = sp[p.si]; return 60 * M.sqrt(S.T / 300 * 4.0 / s.M); } // px per second for a unit-variance velocity
    function step(dt) {
      var L = lay(); S.t += dt; S.hitT += dt;
      ps.forEach(function (p) { if (p.gone) return; var v = speed(p); p.x += p.ux * v * dt; p.y += p.uy * v * dt;
        if (p.x < L.x0 + p.r) { p.x = L.x0 + p.r; p.ux = M.abs(p.ux); S.hits++; }
        if (p.x > L.x1 - p.r) { if (o.effusion && M.abs(p.y - (L.top + L.bot) / 2) < 7) { p.gone = true; S.out[p.si] = (S.out[p.si] || 0) + 1; return; } p.x = L.x1 - p.r; p.ux = -M.abs(p.ux); S.hits++; }
        if (p.y < L.top + p.r) { p.y = L.top + p.r; p.uy = M.abs(p.uy); S.hits++; }
        if (p.y > L.bot - p.r) { p.y = L.bot - p.r; p.uy = -M.abs(p.uy); S.hits++; } });
      if (S.hitT > 1) { S.hitRate = S.hits / S.hitT; S.hits = 0; S.hitT = 0; S.hitWin = true; report(); }
      draw();
    }
    function draw() {
      var ctx = c.ctx, k = pal(), L = lay(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      // box, piston and heater
      ctx.fillStyle = k.dark ? '#0f1c16' : '#f4f7f5'; ctx.fillRect(L.x0, L.top, L.x1 - L.x0, L.bot - L.top); ctx.strokeStyle = k.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L.x0, 10); ctx.lineTo(L.x0, L.bot); ctx.lineTo(L.x1, L.bot); ctx.lineTo(L.x1, 10); ctx.stroke();
      if (o.effusion) { ctx.fillStyle = k.bg; ctx.fillRect(L.x1 - 2, (L.top + L.bot) / 2 - 7, 5, 14); }
      ctx.fillStyle = S.lock === 'V' ? (k.dark ? '#6b7a72' : '#8d99a0') : (k.dark ? '#8fa39a' : '#adb5bd'); rr(ctx, L.x0 + 2, L.top - 12, L.x1 - L.x0 - 4, 12, 3); ctx.fill(); ctx.fillRect((L.x0 + L.x1) / 2 - 4, M.max(6, L.top - 40), 8, M.min(28, L.top - 6)); if (S.lock === 'V') { txt(ctx, 'pinned', L.x1 - 6, L.top - 18, { size: 10, align: 'right' }); }
      var heat = clamp((S.T - 50) / 950, 0, 1); ctx.fillStyle = mixC('#4dabf7', '#ff6b6b', heat); ctx.fillRect(L.x0 + 2, L.bot - 5, L.x1 - L.x0 - 4, 4);
      ps.forEach(function (p) { if (p.gone) return; ctx.fillStyle = sp[p.si].col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill(); });
      H.draw(ctx);
      // gauges
      var gx = L.gx, gw = L.gw, gy = L.wide ? 14 : L.bot + 6;
      if (o.gauges !== false && L.wide && !quiet) { var items = [['P', quiet ? '' : sf(pConv(P(), o.units), 3) + ' ' + o.units], ['V', quiet ? '' : sf(S.V, 3) + ' L'], ['T', quiet ? '' : fm(S.T, 0) + ' K (' + fm(S.T - 273.15, 0) + ' °C)'], ['n', quiet ? '' : sf(nTot(), 3) + ' mol']]; items.forEach(function (it, i) { var yy = gy + i * 24; panel(ctx, gx, yy, gw, 20, { r: 6 }); txt(ctx, it[0], gx + 8, yy + 10, { size: 12, bold: true, color: k.acc, italic: true, serif: true }); txt(ctx, it[1], gx + gw - 8, yy + 10, { size: 12, bold: true, align: 'right', color: k.ink }); }); }
      if (L.wide) drawGraph(ctx, k, gx, gy + (o.gauges !== false && !quiet ? 104 : 0), gw, c.h - gy - (o.gauges !== false && !quiet ? 104 : 0) - 10);
      if (o.hits !== false && !quiet) pill(ctx, S.hitWin ? 'wall hits: ' + fm(S.hitRate, 0) + ' per second' : 'counting wall hits…', L.x0 + 6, L.top + 16, { size: 10, align: 'left', bold: false, color: k.muted });
    }
    function drawGraph(ctx, k, x, y, w, h) {
      if (h < 80) return;
      if (o.hist) { var hh = o.graph ? h * 0.45 : h; drawHist(ctx, k, x, y + h - hh, w, hh); h -= hh + 8; if (!o.graph || h < 80) return; }
      var g = o.graph, n = nTot(), Pn = P(), Ch2;
      var save = c.w; var C2 = { w: c.w, h: c.h }; // a small chart in a sub-rectangle
      var ml = x + 44, mb = y + h - 26, mr = x + w - 6, mt = y + 8, X, Y, xr, yr;
      if (g === 'VT') { xr = [0, 1000]; yr = [0, n * K.RL * 1000 / M.max(0.1, Pn) * 1.05]; } else if (g === 'PT') { xr = [0, 1000]; yr = [0, n * K.RL * 1000 / S.V * 1.05]; } else { xr = [0, 60]; yr = [0, M.max(5, Pn * 1.6)]; }
      X = function (v) { return ml + (v - xr[0]) / (xr[1] - xr[0]) * (mr - ml); }; Y = function (v) { return mb - (v - yr[0]) / (yr[1] - yr[0]) * (mb - mt); };
      ctx.fillStyle = k.bg; ctx.fillRect(ml, mt, mr - ml, mb - mt); line(ctx, [[ml, mt], [ml, mb], [mr, mb]], k.axis, 1.4);
      var lab = g === 'VT' ? ['T (K)', 'V (L)'] : g === 'PT' ? ['T (K)', 'P (atm)'] : ['V (L)', 'P (atm)']; txt(ctx, lab[0], mr, mb - 9, { size: 10, align: 'right', color: k.ink, bold: true }); txt(ctx, lab[1], x + 2, mt + 4, { size: 10, color: k.ink });
      [xr[1] / 2, xr[1]].forEach(function (v) { txt(ctx, fm(v, 0), X(v), mb + 8, { size: 9, align: 'center' }); }); txt(ctx, '0', X(0), mb + 8, { size: 9, align: 'center' });
      if (!quiet) [yr[1] / 2].forEach(function (v) { txt(ctx, sf(v, 2), ml - 4, Y(v), { size: 9, align: 'right' }); });
      var pts = [], pd = [], i;
      if (g === 'VT') { for (i = 0; i <= 50; i++) { var T = i * 20; (T < 50 ? pd : pts).push([X(T), Y(n * K.RL * T / Pn)]); } pd.push(pts[0]); line(ctx, pd, k.muted, 1.6, [4, 4]); line(ctx, pts, k.acc, 2.4); ctx.fillStyle = k.acc; ctx.beginPath(); ctx.arc(X(S.T), Y(S.V), 5, 0, TAU); ctx.fill(); txt(ctx, '0 K', X(0) + 4, Y(0) - 8, { size: 9, color: k.muted }); }
      else if (g === 'PT') { for (i = 0; i <= 50; i++) { var T2 = i * 20; (T2 < 50 ? pd : pts).push([X(T2), Y(n * K.RL * T2 / S.V)]); } pd.push(pts[0]); line(ctx, pd, k.muted, 1.6, [4, 4]); line(ctx, pts, k.acc, 2.4); ctx.fillStyle = k.acc; ctx.beginPath(); ctx.arc(X(S.T), Y(Pn), 5, 0, TAU); ctx.fill(); }
      else { if (o.work && S.path.length > 1) { ctx.fillStyle = k.accSoft; ctx.beginPath(); ctx.moveTo(X(S.path[0][0]), Y(0)); S.path.forEach(function (q) { ctx.lineTo(X(q[0]), Y(q[1])); }); ctx.lineTo(X(S.path[S.path.length - 1][0]), Y(0)); ctx.closePath(); ctx.fill(); } for (i = 1; i <= 120; i++) { var Vv = i / 2; pts.push([X(Vv), Y(n * K.RL * S.T / Vv)]); } ctx.save(); ctx.beginPath(); ctx.rect(ml, mt, mr - ml, mb - mt); ctx.clip(); line(ctx, pts, k.acc, 2.4); if (o.real) { var rp = []; for (i = 2; i <= 120; i++) { var V2 = i / 2, s0 = S.V; S.V = V2; rp.push([X(V2), Y(Preal())]); S.V = s0; } line(ctx, rp, k.blue, 2, [5, 4]); } ctx.restore(); ctx.fillStyle = k.acc; ctx.beginPath(); ctx.arc(X(S.V), Y(Pn), 5, 0, TAU); ctx.fill(); }
    }
    // the speeds of the particles in the picture (a 2-D gas: component spread σ = √(RT/M)), with the 2-D Maxwell curve
    function drawHist(ctx, k, x, y, w, h) {
      var vmax = 0, sig = sp.map(function (g) { return M.sqrt(K.R * S.T / (g.M / 1000)); }); sig.forEach(function (s2) { vmax = M.max(vmax, s2 * 3.6); });
      var nb = 18, bins = sp.map(function () { var a = []; for (var i = 0; i < nb; i++) a.push(0); return a; }), cnt = sp.map(function () { return 0; });
      ps.forEach(function (p) { if (p.gone) return; var v = M.hypot(p.ux, p.uy) * sig[p.si], b = M.min(nb - 1, M.floor(v / vmax * nb)); bins[p.si][b]++; cnt[p.si]++; });
      var ml = x + 10, mb = y + h - 18, mr = x + w - 6, mt = y + 4, bw = (mr - ml) / nb, peak = 0;
      bins.forEach(function (b, si) { b.forEach(function (v) { peak = M.max(peak, v / M.max(1, cnt[si])); }); }); peak = M.max(peak, 0.2);
      ctx.fillStyle = k.bg; ctx.fillRect(ml, mt, mr - ml, mb - mt); line(ctx, [[ml, mb], [mr, mb]], k.axis, 1.2);
      bins.forEach(function (b, si) { ctx.fillStyle = rgba(sp[si].col, 0.55); b.forEach(function (v, i) { var hgt = v / M.max(1, cnt[si]) / peak * (mb - mt - 4); ctx.fillRect(ml + i * bw + 1 + si * 2, mb - hgt, bw - 2 - si * 2, hgt); });
        var pts = []; for (var j = 0; j <= 60; j++) { var vv = vmax * j / 60, f2 = vv / (sig[si] * sig[si]) * M.exp(-vv * vv / (2 * sig[si] * sig[si])) * vmax / nb; pts.push([ml + vv / vmax * (mr - ml), mb - f2 / peak * (mb - mt - 4)]); } line(ctx, pts, sp[si].col, 2); });
      txt(ctx, 'speed (m/s) →' + (quiet ? '' : '  0 to ' + fm(vmax, 0)), ml, mb + 9, { size: 9 });
    }
    function report() {
      var Pn = P(), s = '';
      if (quiet) s = 'The particles keep moving and hitting the walls in every direction; their hits are the pressure.';
      else { s = 'P = nRT/V = ' + sf(nTot(), 3) + ' × 0.08206 × ' + fm(S.T, 0) + ' ÷ ' + sf(S.V, 3) + ' = <b>' + sf(pConv(Pn, o.units), 3) + ' ' + o.units + '</b>.';
        if (sp.length > 1) s += ' Partial pressures: ' + sp.map(function (g) { return fH(g.f) + ' ' + sf(pConv(g.n * K.RL * S.T / S.V, o.units), 3) + ' ' + o.units + ' (mole fraction ' + fm(g.n / nTot(), 3) + ')'; }).join(', ') + '; they add up to the total.';
        if (o.real) { var Pr = Preal(); s += ' Van der Waals: ' + sf(pConv(Pr, o.units), 3) + ' ' + o.units + ' (PV/nRT = ' + fm(Pr * S.V / (nTot() * K.RL * S.T), 3) + '): real particles take up room and attract one another, which matters at high pressure and low temperature.'; }
        if (o.work && S.path.length > 1) { var V1 = S.path[0][0], wJ = 0; for (var i = 1; i < S.path.length; i++) wJ -= (S.path[i][1] + S.path[i - 1][1]) / 2 * (S.path[i][0] - S.path[i - 1][0]); s += ' Work on the gas along the shaded path: w = −∫P dV = ' + fm(wJ * 101.325, 0) + ' J' + (wJ < 0 ? ' (negative: the gas pushed the piston out).' : '.'); }
        if (o.effusion) { var o1 = S.out[0] || 0, o2 = S.out[1] || 0; s += ' Escaped through the pinhole: ' + sp.map(function (g, i) { return fH(g.f) + ' ' + (S.out[i] || 0); }).join(', ') + (sp.length > 1 ? '. Graham\'s law: rate ratio = √(M₂/M₁) = √(' + fm(sp[1].M, 2) + '/' + fm(sp[0].M, 2) + ') = ' + fm(M.sqrt(sp[1].M / sp[0].M), 2) + '. Lighter molecules move faster at the same temperature (same average kinetic energy).' : '.'); }
        s += { T: ' Temperature held fixed: squeeze it and P rises as V falls (Boyle).', P: ' Pressure held fixed: heat it and V grows in step with the kelvin temperature (Charles); add gas and V grows too (Avogadro).', V: ' Volume held fixed: heat it and P rises in step with the kelvin temperature (Gay-Lussac).' }[S.lock] || ''; }
      F.say(s); F.setAlt('A box of gas particles under a piston' + (o.effusion ? ' with a pinhole' : '') + ', with gauges for pressure, volume, temperature and moles' + (o.graph ? ' and a ' + o.graph + ' graph' : '') + '.');
    }
    // controls
    function setV(v) { S.V = clamp(v, 2, 60); if (o.work) S.path.push([S.V, P()]); }
    function setT(T) { if (S.lock === 'P') { var Pk = P(); S.T = T; S.V = clamp(nTot() * K.RL * S.T / Pk, 2, 60); } else S.T = T; if (o.work) S.path.push([S.V, P()]); }
    function setN(i, v) { if (S.lock === 'P') { var Pk = P(); sp[i].n = v; S.V = clamp(nTot() * K.RL * S.T / Pk, 2, 60); } else sp[i].n = v; sync(); }
    var vs = null, ts = null;
    if (F.edit) {
      if (S.lock !== 'P' && S.lock !== 'V') vs = sl(F.ctl, { label: 'Volume (piston)', min: 2, max: 60, step: 0.1, value: S.V, fmt: function (v) { return fm(v, 1) + ' L'; }, input: function (v) { setV(v); draw(); report(); } });
      if (S.lock !== 'T') ts = sl(F.ctl, { label: 'Temperature (heater)', min: 50, max: 1000, step: 5, value: S.T, fmt: function (v) { return fm(v, 0) + ' K'; }, input: function (v) { setT(v); if (vs) vs.set(S.V); draw(); report(); } });
      if (S.lock !== 'T' || o.species) sp.forEach(function (g, i) { sl(F.ctl, { label: 'Moles of ' + fT(g.f) + ' (valve)', min: 0.1, max: 4, step: 0.1, value: g.n, input: function (v) { setN(i, v); if (vs) vs.set(S.V); draw(); report(); } }); });
      if (o.work) btn(F.ctl, 'Reset the path', function () { S.path = [[S.V, P()]]; draw(); report(); });
    }
    if (o.work) S.path = [[S.V, P()]];
    var H = hand(c, S.lock === 'P' || S.lock === 'V' || !F.edit ? [] : [{ get: function () { var L = lay(); return [(L.x0 + L.x1) / 2, L.top - 6]; }, set: function (px, py) { var L = lay(); setV((L.bot - py) / (c.h - 40) * 60); if (vs) vs.set(S.V); report(); }, key: function (dx, dy) { setV(S.V - dy * 0.5); if (vs) vs.set(S.V); report(); } }], { change: draw, r: 30 });
    sync(); var A = anim(elx, step, true); if (F.edit) playBtn(F.ctl, A);
    c.cv.setAttribute('aria-label', 'Gas in a box.' + (S.lock === 'P' || S.lock === 'V' ? '' : ' Drag the piston, or use the up and down arrow keys, to change the volume.'));
    c.onResize(function () { sync(); draw(); }); V.onTheme(draw); draw(); report(); return { draw: draw };
  });
  CH.VDW = VDW;

  // =====================================================================================================
  // ch-maxwell: options are documented at the top of this file
  function mbSpeed(v, Mkg, T) { var a = Mkg / (2 * K.R * T); return 4 * PI * M.pow(a / PI, 1.5) * v * v * M.exp(-a * v * v); }
  function mbEnergy(E, T) { var RT = K.R * T / 1000; return 2 * M.sqrt(E / PI) * M.pow(RT, -1.5) * M.exp(-E / RT); } // E in kJ/mol
  function mbFrac(Ea, T) { var x = Ea * 1000 / (K.R * T); return erfc(M.sqrt(x)) + 2 * M.sqrt(x / PI) * M.exp(-x); }
  R('ch-maxwell', function (elx, o) {
    o = opt(o, { curves: [{ f: 'N2', T: 300 }, { f: 'N2', T: 600 }], x: 'speed', Ea: null, catEa: null, marks: true, slider: true });
    var cv = o.curves.slice(0, 3).map(function (q) { return { f: q.f || 'N2', T: num(q.T, 300), Mkg: molarMass(q.f || 'N2') / 1000 }; }), quiet = !!(o.quiet || o.readout === false), en = o.x === 'energy';
    var F = frame(elx, o, 'The Maxwell–Boltzmann distribution'), c = F.canvas({ aspect: 1.75, min: 280, max: 420, narrow: 1.05 }), cols = ['acc', 'blue', 'orange'];
    function speeds(q) { return { mp: M.sqrt(2 * K.R * q.T / q.Mkg), avg: M.sqrt(8 * K.R * q.T / (PI * q.Mkg)), rms: M.sqrt(3 * K.R * q.T / q.Mkg) }; }
    function draw() {
      var ctx = c.ctx, k = pal(), xmax = en ? M.max.apply(null, cv.map(function (q) { return K.R * q.T / 1000 * 6; })) : M.max.apply(null, cv.map(function (q) { return speeds(q).mp * 3.2; })), ymax = 0;
      cv.forEach(function (q) { var f = en ? mbEnergy(K.R * q.T / 1000 * 0.5, q.T) : mbSpeed(speeds(q).mp, q.Mkg, q.T); ymax = M.max(ymax, f); });
      if (o.Ea != null && en) xmax = M.max(xmax, num(o.Ea, 10) * 1.25);
      var Ch = chart(c, { x: [0, xmax], y: [0, ymax * 1.15], xl: en ? 'Kinetic energy (kJ/mol)' : 'Speed (m/s)', yl: 'Fraction of molecules', yticks: false, ml: 30 }); ctx.clearRect(0, 0, c.w, c.h); Ch.draw(ctx);
      var pkL = []; cv.forEach(function (q, i) { var f = function (x) { return en ? mbEnergy(M.max(x, 1e-9), q.T) : mbSpeed(x, q.Mkg, q.T); }, col = k[cols[i]];
        if (o.Ea != null) [[num(o.Ea, 10), 0.35], [o.catEa != null ? num(o.catEa, 5) : null, 0.18]].forEach(function (th) { if (th[0] == null) return; var thr = en ? th[0] : M.sqrt(2 * th[0] * 1000 / q.Mkg); Ch.clip(ctx); ctx.fillStyle = rgba(col, th[1]); ctx.beginPath(); ctx.moveTo(Ch.X(thr), Ch.Y(0)); for (var j = 0; j <= 100; j++) { var xx = thr + (xmax - thr) * j / 100; ctx.lineTo(Ch.X(xx), Ch.Y(f(xx))); } ctx.lineTo(Ch.X(xmax), Ch.Y(0)); ctx.closePath(); ctx.fill(); Ch.unclip(ctx); });
        Ch.curve(ctx, f, 1e-6, xmax, col, 3, null, 300);
        if (o.marks !== false && !en) { var s = speeds(q); [['mp', s.mp], ['avg', s.avg], ['rms', s.rms]].forEach(function (m2, j) { line(ctx, [[Ch.X(m2[1]), Ch.Y(0)], [Ch.X(m2[1]), Ch.Y(f(m2[1]))]], col, 1.2, [3, 3]); if (!quiet && i === 0) txt(ctx, { mp: 'v_mp', avg: 'v_avg', rms: 'v_rms' }[m2[0]], Ch.X(m2[1]) + 3, M.min(Ch.Y(f(s.mp) * 0.45), Ch.Y(0) - 34) + j * 13, { size: 10, color: col }); }); }
        var pk = en ? K.R * q.T / 2000 : speeds(q).mp, lx = Ch.X(pk) + 8, ly = Ch.Y(f(pk)) - 12, lw = fDraw(ctx, q.f, 0, 0, { size: 11, measure: true }) + 44; for (var tr = 0; tr < 4 && pkL.some(function (r) { return M.abs(r[1] - ly) < 14 && lx < r[0] + r[2] && r[0] < lx + lw; }); tr++) ly += 14; pkL.push([lx, ly, lw]); fDraw(ctx, q.f, lx, ly, { size: 11, color: col }); txt(ctx, fm(q.T, 0) + ' K', lx + lw - 40, ly, { size: 11, color: col, bold: true });
      });
      if (o.Ea != null) { var thr0 = en ? num(o.Ea, 10) : M.sqrt(2 * num(o.Ea, 10) * 1000 / cv[0].Mkg); line(ctx, [[Ch.X(thr0), Ch.box().y0], [Ch.X(thr0), Ch.Y(0)]], k.gold, 2, [6, 4]); txt(ctx, 'Ea', Ch.X(thr0) + 4, Ch.box().y0 + 10, { size: 12, bold: true, color: k.gold }); if (o.catEa != null) { var thc = en ? num(o.catEa, 5) : M.sqrt(2 * num(o.catEa, 5) * 1000 / cv[0].Mkg); line(ctx, [[Ch.X(thc), Ch.box().y0], [Ch.X(thc), Ch.Y(0)]], k.green, 2, [6, 4]); txt(ctx, 'Ea with catalyst', Ch.X(thc) + 4, Ch.box().y0 + 26, { size: 11, bold: true, color: k.green }); } }
    }
    function report() {
      var s = cv.map(function (q) { var sp2 = speeds(q); return fH(q.f) + ' at ' + fm(q.T, 0) + ' K' + (quiet || en ? '' : ': v_mp ' + fm(sp2.mp, 0) + ', v_avg ' + fm(sp2.avg, 0) + ', v_rms ' + fm(sp2.rms, 0) + ' m/s'); }).join('; ') + '.';
      if (o.Ea != null && !quiet) s += ' Fraction with at least Ea = ' + fm(num(o.Ea, 10), 1) + ' kJ/mol: ' + cv.map(function (q) { return fm(q.T, 0) + ' K: ' + sci(mbFrac(num(o.Ea, 10), q.T), 3, true); }).join(', ') + (o.catEa != null ? '; with the catalyst (' + fm(num(o.catEa, 5), 1) + ' kJ/mol): ' + cv.map(function (q) { return sci(mbFrac(num(o.catEa, 5), q.T), 3, true); }).join(', ') : '') + '.';
      s += ' The area under each curve is the same (all the molecules). ' + (cv.length > 1 && cv[0].f === cv[1].f ? 'Hotter: the peak moves right, gets lower and spreads out.' : cv.length > 1 ? 'A heavier gas has a narrower curve at lower speeds.' : '');
      F.say(s); F.setAlt('Maxwell–Boltzmann curves of the fraction of molecules against ' + (en ? 'kinetic energy' : 'speed') + '.');
    }
    if (F.edit && o.slider !== false) sl(F.ctl, { label: 'Temperature of the first curve', min: 100, max: 1500, step: 10, value: cv[0].T, fmt: function (v) { return fm(v, 0) + ' K'; }, input: function (v) { cv[0].T = v; draw(); report(); } });
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  CH.mbSpeed = mbSpeed; CH.mbFrac = mbFrac; CH.mbEnergy = mbEnergy;

  // =====================================================================================================
  // ch-collisions: options are documented at the top of this file
  R('ch-collisions', function (elx, o) {
    o = opt(o, { nA: 16, nB: 16, T: 300, Ea: 12, orient: false, surface: null, cat: false, mode: 'box' });
    var mode = o.mode, quiet = !!(o.quiet || o.readout === false), F = frame(elx, o, mode === 'elementary' ? 'One-particle and two-particle steps' : 'Collisions between reacting particles'), rnd = rng(23);
    var S = { T: num(o.T, 300), Ea: num(o.Ea, 12), cat: !!o.cat, nA: clamp(num(o.nA, 12), 1, 40), nB: clamp(num(o.nB, 12), 1, 40), surf: o.surface, coll: 0, react: 0, tw: 0, cr: 0, rr: 0, flashes: [] }, c = F.canvas({ aspect: 1.8, min: 260, max: 400, narrow: 1.0 }), P0;
    function sigma() { return 115 * M.sqrt(S.T / 300); } // velocity spread (px/s) for the box's temperature
    function build() {
      var w = mode === 'elementary' ? c.w / 2 - 12 : c.w - 16; P0 = pbox({ x0: 8, y0: 8, x1: 8 + w, y1: c.h - 8 });
      var r = 8, s = sigma();
      for (var i = 0; i < S.nA; i++) { var v = vel(rnd, s); P0.add({ x: 20 + rnd() * (w - 30), y: 20 + rnd() * (c.h - 40), vx: v[0], vy: v[1], r: r, k: 'A', ang: rnd() * TAU }); }
      if (S.surf) { var n = S.nB, lump = S.surf === 'lump', cx = 8 + w / 2; for (var j = 0; j < n; j++) { var px, py; if (lump) { var cols = M.ceil(M.sqrt(n)); px = cx + ((j % cols) - cols / 2) * 13; py = c.h / 2 + (M.floor(j / cols) - cols / 2) * 13; } else { var g = j % 4; px = 8 + w * (0.2 + 0.2 * g) + ((j >> 2) % 2) * 13; py = c.h * (0.3 + 0.4 * ((j >> 3) % 2)) + ((j >> 2) % 2) * 13; } P0.add({ x: px, y: py, vx: 0, vy: 0, r: r, k: 'B', fixed: true }); } }
      else for (var q = 0; q < S.nB; q++) { var v2 = vel(rnd, s); P0.add({ x: 20 + rnd() * (w - 30), y: 20 + rnd() * (c.h - 40), vx: v2[0], vy: v2[1], r: r, k: 'B' }); }
      if (mode === 'elementary') { S.P2 = pbox({ x0: c.w / 2 + 4, y0: 8, x1: c.w - 8, y1: c.h - 8 }); for (var u = 0; u < 12; u++) { var v3 = vel(rnd, s); S.P2.add({ x: c.w / 2 + 20 + rnd() * (c.w / 2 - 40), y: 20 + rnd() * (c.h - 40), vx: v3[0], vy: v3[1], r: r, k: 'A' }); } }
      S.coll = S.react = S.tw = 0;
    }
    function step(dt) {
      var s = sigma(), x = (S.cat ? S.Ea / 2 : S.Ea) * 1000 / (K.R * S.T), thr = x * s * s; // threshold for ½μv_n² with unit masses
      P0.step(dt, { collide: true, cell: 18, onHit: function (a, b, vr, nx, ny) { var ab = (a.k === 'A' && b.k === 'B') || (a.k === 'B' && b.k === 'A'); if (!ab) return; S.coll++; var mu = b.fixed || a.fixed ? 1 : 0.5, E = 0.5 * mu * vr * vr; var ok = E >= thr; if (ok && o.orient) { var A2 = a.k === 'A' ? a : b, dir = a.k === 'A' ? [nx, ny] : [-nx, -ny]; ok = M.cos(A2.ang) * dir[0] + M.sin(A2.ang) * dir[1] > 0.7; } S.flashes.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, t: 0, ok: ok }); if (ok) { S.react++; a.k = a.k === 'A' ? 'C' : 'D'; b.k = b.k === 'B' ? 'D' : 'C'; if (b.fixed) { b.fixed = false; var v = vel(rnd, s); b.vx = v[0]; b.vy = v[1]; } if (a.fixed) { a.fixed = false; } } } });
      if (S.P2) { S.P2.step(dt, {}); S.P2.ps.forEach(function (p) { if (p.k === 'A' && rnd() < dt * 0.15 * M.exp(-(x - 4.8))) { p.k = 'C'; S.flashes.push({ x: p.x, y: p.y, t: 0, ok: true }); } }); }
      S.tw += dt; if (S.tw > 2) { S.cr = S.coll / S.tw; S.rr = S.react / S.tw; S.coll = 0; S.react = 0; S.tw = 0; S.win = true; report(); }
      S.flashes.forEach(function (f) { f.t += dt; }); S.flashes = S.flashes.filter(function (f) { return f.t < 0.4; });
      draw();
    }
    var COL = { A: '#e03131', B: '#1c7ed6', C: '#9c36b5', D: '#2f9e44' };
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      [P0].concat(S.P2 ? [S.P2] : []).forEach(function (P) { panel(ctx, P.b.x0, P.b.y0, P.b.x1 - P.b.x0, P.b.y1 - P.b.y0, { r: 10 }); P.ps.forEach(function (p) { ball(ctx, p.x, p.y, p.r, p.k, { color: COL[p.k] }); if (o.orient && p.k === 'A') { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.r - 1.5, p.ang - 0.6, p.ang + 0.6); ctx.stroke(); } }); });
      S.flashes.forEach(function (f) { ctx.save(); ctx.globalAlpha = 1 - f.t / 0.4; ctx.strokeStyle = f.ok ? k.gold : k.muted; ctx.lineWidth = f.ok ? 3 : 1.2; ctx.beginPath(); ctx.arc(f.x, f.y, 8 + f.t * 40, 0, TAU); ctx.stroke(); ctx.restore(); });
      if (S.P2) { [[P0, 'A + B → products: needs a collision'], [S.P2, 'A → products: one particle on its own']].forEach(function (pp) { var bb = pp[0].b, hl = wrapL(ctx, pp[1], bb.x1 - bb.x0 - 10, 11, true); ctx.save(); ctx.fillStyle = rgba(k.bg, 0.85); ctx.fillRect(bb.x0 + 2, bb.y0 + 2, bb.x1 - bb.x0 - 4, hl.length * 14 + 6); ctx.restore(); hl.forEach(function (t, j) { txt(ctx, t, (bb.x0 + bb.x1) / 2, bb.y0 + 12 + j * 14, { size: 11, align: 'center', bold: true, color: k.ink }); }); }); }
      if (!quiet && !S.P2) { pill(ctx, S.win ? 'collisions A–B: ' + fm(S.cr, 1) + '/s · reactions: ' + fm(S.rr, 1) + '/s' : 'counting collisions…', c.w / 2, 20, { size: 11 }); }
    }
    function report() {
      var x = (S.cat ? S.Ea / 2 : S.Ea) * 1000 / (K.R * S.T), left = P0.ps.filter(function (p) { return p.k === 'A'; }).length;
      F.say(quiet ? 'Only some collisions are hard enough' + (o.orient ? ' and lined up right' : '') + ' to react.' : (S.win ? 'A–B collisions about ' + fm(S.cr, 1) + ' per second; reactions about ' + fm(S.rr, 1) + ' per second (' + (S.cr ? fm(S.rr / S.cr * 100, 1) : '0') + '% of collisions). ' : 'Counting collisions over the first two seconds. ') + 'A left: ' + left + '. Most collisions just bounce. ' + 'At ' + fm(S.T, 0) + ' K, Ea/RT = ' + fm(x, 2) + '; warming raises the share of hard-enough collisions much more than it raises the number of collisions.' + (S.cat ? ' The catalyst halves Ea.' : '') + (S.surf ? ' Only B particles on the surface can be hit: ' + (S.surf === 'powder' ? 'a powder exposes more of them.' : 'a lump hides most of them inside.') : ''));
      F.setAlt('A box of red A particles and blue B particles bouncing around; some collisions flash gold and turn into products.');
    }
    if (F.edit) {
      sl(F.ctl, { label: 'Temperature', min: 200, max: 700, step: 10, value: S.T, fmt: function (v) { return fm(v, 0) + ' K'; }, input: function (v) { var f = M.sqrt(v / S.T); S.T = v; P0.ps.forEach(function (p) { p.vx *= f; p.vy *= f; }); if (S.P2) S.P2.ps.forEach(function (p) { p.vx *= f; p.vy *= f; }); report(); } });
      if (mode !== 'elementary') { sl(F.ctl, { label: 'Particles of A (concentration)', min: 2, max: 40, step: 1, value: S.nA, input: function (v) { S.nA = v; build(); } }); var cb = btn(F.ctl, 'Add a catalyst', function () { S.cat = !S.cat; cb.textContent = S.cat ? 'Remove the catalyst' : 'Add a catalyst'; cb.setAttribute('aria-pressed', String(S.cat)); report(); }); if (S.surf) seg(F.ctl, 'Solid B', [['lump', 'Lump'], ['powder', 'Powder']], S.surf, function (v) { S.surf = v; build(); }); }
      btn(F.ctl, 'Start again', function () { build(); draw(); });
    }
    build(); var A = anim(elx, step, true); if (F.edit) playBtn(F.ctl, A);
    c.onResize(function () { build(); draw(); }); V.onTheme(draw); draw(); report(); return { draw: draw };
  });

  // =====================================================================================================
  // ch-kineticsplot: options are documented at the top of this file
  var HALF = { 'C-14': [5700, 'years'], 'H-3': [12.32, 'years'], 'I-131': [8.02, 'days'], 'Co-60': [5.27, 'years'], 'Rn-222': [3.82, 'days'], 'K-40': [1.25e9, 'years'], 'U-238': [4.468e9, 'years'], 'F-18': [109.8, 'minutes'] };
  function conc(order, k, A0, t) { if (order === 0) return M.max(0, A0 - k * t); if (order === 2) return 1 / (1 / A0 + k * t); return A0 * M.exp(-k * t); }
  function halfLife(order, k, A) { return order === 0 ? A / (2 * k) : order === 2 ? 1 / (k * A) : M.LN2 / k; }
  R('ch-kineticsplot', function (elx, o) {
    o = opt(o, { order: 1, k: 0.1, A0: 1.0, plot: 'A', halves: true, tangent: false, chord: false, data: null, mode: 'rate', iso: 'C-14', half: null, N0: 400, unit: null, dating: true });
    if (o.mode === 'decay') return decay(elx, o);
    var S = { order: [0, 1, 2].indexOf(num(o.order, 1)) >= 0 ? num(o.order, 1) : 1, k: num(o.k, 0.1), A0: num(o.A0, 1), t: 0, t2: 0 }, quiet = !!(o.quiet || o.readout === false), data = o.data;
    var F = frame(elx, o, 'Concentration against time'), c = F.canvas({ aspect: o.plot === 'all' ? 2.4 : 1.75, min: 260, max: 400, narrow: o.plot === 'all' ? 0.8 : 1.05 });
    function tEnd() { if (data) return data[data.length - 1][0] * 1.05; return S.order === 0 ? S.A0 / S.k * 1.15 : S.order === 2 ? 7 / (S.k * S.A0) : 4.2 * M.LN2 / S.k; }
    S.t = tEnd() * 0.2; S.t2 = tEnd() * 0.5;
    function f(t) { return conc(S.order, S.k, S.A0, t); }
    var CH0 = null;
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var kinds = o.plot === 'all' ? ['A', 'lnA', 'invA'] : [o.plot], T = tEnd(), wide = c.w >= 560, n = kinds.length, stack = n > 1 && !wide;
      kinds.forEach(function (kd, i) {
        var g = function (y) { return kd === 'lnA' ? M.log(y) : kd === 'invA' ? 1 / y : y; }, ys = [], j;
        var pts = data ? data.map(function (d) { return [d[0], g(num(d[1], 1))]; }) : null;
        for (j = 0; j <= 80; j++) { var tt = T * j / 80, yv = f(tt); if (yv > 1e-6) ys.push(g(yv)); } if (pts) pts.forEach(function (p) { ys.push(p[1]); });
        var lo = M.min.apply(null, ys), hi = M.max.apply(null, ys); if (kd === 'A') lo = 0; var pad = (hi - lo) * 0.08 || 0.1;
        var box = stack ? { x: 0, y: i * c.h / n, w: c.w, h: c.h / n } : { x: i * c.w / n, y: 0, w: c.w / n, h: c.h };
        var sub = { w: box.w, h: box.h, onResize: function () { } }, Ch = chart(sub, { x: [0, T], y: [lo - (kd === 'A' ? 0 : pad), hi + pad], xl: 'time (s)', yl: kd === 'A' ? '[A] (M)' : kd === 'lnA' ? 'ln[A]' : '1/[A] (1/M)', ml: 50, mb: 34, mt: 18 });
        ctx.save(); ctx.translate(box.x, box.y); Ch.draw(ctx);
        if (data) pts.forEach(function (p) { ctx.fillStyle = k.acc; ctx.beginPath(); ctx.arc(Ch.X(p[0]), Ch.Y(p[1]), 4, 0, TAU); ctx.fill(); });
        else Ch.curve(ctx, function (tt) { var yv = f(tt); return yv > 1e-9 ? g(yv) : NaN; }, 0, T, k.acc, 2.8);
        if (data && n > 1) { var xs2 = pts.map(function (p) { return p[0]; }), ys2 = pts.map(function (p) { return p[1]; }), mx = xs2.reduce(function (a, b) { return a + b; }, 0) / xs2.length, my = ys2.reduce(function (a, b) { return a + b; }, 0) / ys2.length, sxy = 0, sxx = 0, syy = 0; xs2.forEach(function (x, q) { sxy += (x - mx) * (ys2[q] - my); sxx += (x - mx) * (x - mx); syy += (ys2[q] - my) * (ys2[q] - my); }); var r2 = sxy * sxy / (sxx * syy || 1), sl2 = sxy / sxx; line(ctx, [[Ch.X(0), Ch.Y(my - sl2 * mx)], [Ch.X(T), Ch.Y(my + sl2 * (T - mx))]], k.blue, 1.5, [5, 4]); if (!quiet) txt(ctx, 'r² = ' + fm(r2, 4), Ch.box().x1 - 4, Ch.box().y0 + 10, { size: 10, align: 'right', color: r2 > 0.999 ? k.green : k.muted, bold: r2 > 0.999 }); }
        if (kd === 'A' && !data && o.halves !== false) { var t0 = 0, A = S.A0; for (var h = 0; h < 4; h++) { var th = halfLife(S.order, S.k, A); if (t0 + th > T) break; t0 += th; A /= 2; line(ctx, [[Ch.X(t0), Ch.Y(0)], [Ch.X(t0), Ch.Y(A)]], k.gold, 1.4, [3, 3]); line(ctx, [[Ch.X(0), Ch.Y(A)], [Ch.X(t0), Ch.Y(A)]], k.gold, 1, [2, 4]); var tl2 = 't½ = ' + sf(th, 3); if (!quiet && (h === 0 || c.w >= 560) && Ch.X(t0) + 3 + tw(ctx, tl2, 10, true) <= c.w - 2) txt(ctx, tl2, Ch.X(t0) + 3, Ch.Y(A) - 9, { size: 10, color: k.gold, bold: true }); } }
        if (kd === 'A' && !data && (o.tangent || o.chord)) { var y1 = f(S.t), rate = S.order === 0 ? (y1 > 0 ? S.k : 0) : S.order === 1 ? S.k * y1 : S.k * y1 * y1; if (o.tangent) { var dt2 = T * 0.18; line(ctx, [[Ch.X(S.t - dt2), Ch.Y(y1 + rate * dt2)], [Ch.X(S.t + dt2), Ch.Y(y1 - rate * dt2)]], k.blue, 2); knob(ctx, Ch.X(S.t), Ch.Y(y1), k.blue, 7); if (!quiet) pill(ctx, 'rate = ' + sf(rate, 3) + ' M/s', Ch.X(S.t), Ch.Y(y1) - 22, { size: 10, clampW: box.w }); } if (o.chord) { var y2 = f(S.t2); line(ctx, [[Ch.X(S.t), Ch.Y(y1)], [Ch.X(S.t2), Ch.Y(y2)]], k.green, 2); knob(ctx, Ch.X(S.t2), Ch.Y(y2), k.green, 7); if (!quiet) pill(ctx, 'average rate = ' + sf((y1 - y2) / (S.t2 - S.t), 3) + ' M/s', (Ch.X(S.t) + Ch.X(S.t2)) / 2, (Ch.Y(y1) + Ch.Y(y2)) / 2 + 20, { size: 10, clampW: box.w }); } }
        if (kd === 'A') CH0 = { Ch: Ch, box: box };
        ctx.restore();
      });
      if (CH0 && H) H.draw(ctx);
    }
    function report() {
      var s; if (data) s = 'Plot the data three ways. The graph that comes out straight tells the order: [A] against t for zero order, ln[A] for first order, 1/[A] for second order.';
      else { var th = halfLife(S.order, S.k, S.A0); s = quiet ? 'Concentration of A against time.' : (['Zero', 'First', 'Second'][S.order]) + ' order, k = ' + sf(S.k, 3) + ' ' + ['M/s', '1/s', '1/(M·s)'][S.order] + ': ' + ['[A] = [A]₀ − kt, a straight line; each half-life is half as long as the one before.', '[A] = [A]₀e^(−kt); ln[A] falls in a straight line, and every half-life is the same, ' + sf(th, 3) + ' s.', '1/[A] = 1/[A]₀ + kt; each half-life is twice as long as the one before.'][S.order] + (o.tangent ? ' The tangent\'s slope is the instantaneous rate; it falls as A is used up' + (S.order === 0 ? ' (except in zero order, where it stays k).' : '.') : ''); }
      F.say(s); F.setAlt('Graph of concentration against time' + (o.plot === 'all' ? ', with ln[A] and 1/[A] beside it' : '') + '.');
    }
    var H = null;
    if (!data && (o.tangent || o.chord)) H = hand(c, [{ get: function () { return CH0 ? [CH0.box.x + CH0.Ch.X(S.t), CH0.box.y + CH0.Ch.Y(f(S.t))] : null; }, set: function (px) { S.t = clamp(CH0.Ch.x(px - CH0.box.x), 0, tEnd() * 0.95); report(); }, key: function (dx) { S.t = clamp(S.t + dx * tEnd() / 100, 0, tEnd() * 0.95); report(); } }].concat(o.chord ? [{ get: function () { return CH0 ? [CH0.box.x + CH0.Ch.X(S.t2), CH0.box.y + CH0.Ch.Y(f(S.t2))] : null; }, set: function (px) { S.t2 = clamp(CH0.Ch.x(px - CH0.box.x), 0, tEnd() * 0.98); report(); }, key: function (dx) { S.t2 = clamp(S.t2 + dx * tEnd() / 100, 0, tEnd() * 0.98); report(); } }] : []), { change: draw });
    if (F.edit && !data) { seg(F.ctl, 'Order', [[0, 'Zero'], [1, 'First'], [2, 'Second']], S.order, function (v) { S.order = +v; S.t = M.min(S.t, tEnd() * 0.9); draw(); report(); }); sl(F.ctl, { label: 'k', min: 0.01, max: 0.5, step: 0.01, value: S.k, fmt: function (v) { return quiet ? '' : fm(v, 2); }, input: function (v) { S.k = v; draw(); report(); } }); sl(F.ctl, { label: '[A]₀ (M)', min: 0.2, max: 2, step: 0.1, value: S.A0, input: function (v) { S.A0 = v; draw(); report(); } }); }
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  function decay(elx, o) { // each nucleus decays at random with probability ln2/t½ per unit time; no nucleus has a timer
    var iso = HALF[o.iso] ? o.iso : 'C-14', th = o.half != null ? num(o.half, 10) : HALF[iso][0], unit = o.unit || (o.half != null ? 'time units' : HALF[iso][1]), N0 = clamp(M.round(num(o.N0, 400)), 10, 1000), quiet = !!(o.quiet || o.readout === false);
    var F = frame(elx, o, 'Radioactive decay of ' + (o.half != null ? 'a sample' : iso)), rnd = rng(29), life = [];
    for (var i = 0; i < N0; i++) life.push(-M.log(1 - rnd()) * th / M.LN2); // exponential lifetimes
    var S = { t: V.reduced ? th : 0, play: false, frac: 0.5 }, c = F.canvas({ aspect: 2.0, min: 260, max: 380, narrow: 0.95 }), Tm = th * 5;
    function left(t) { var n = 0; life.forEach(function (L) { if (L > t) n++; }); return n; }
    function draw() {
      var ctx = c.ctx, k = pal(), wide = c.w >= 560; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var gw = wide ? c.w * 0.38 : c.w - 16, gh = wide ? c.h - 16 : c.h * 0.42, cols = M.ceil(M.sqrt(N0 * gw / gh)), rows = M.ceil(N0 / cols), cell = M.min(gw / cols, gh / rows);
      life.forEach(function (L, i) { var x = 8 + (i % cols + 0.5) * cell, y = 8 + (M.floor(i / cols) + 0.5) * cell, alive = L > S.t; ctx.fillStyle = alive ? k.acc : (k.dark ? '#33443b' : '#dfe5e1'); ctx.beginPath(); ctx.arc(x, y, M.max(1.5, cell * 0.38), 0, TAU); ctx.fill(); });
      var sub = { w: wide ? c.w - gw - 24 : c.w, h: wide ? c.h : c.h - gh - 16 }, ox = wide ? gw + 16 : 0, oy = wide ? 0 : gh + 16, Ch = chart(sub, { x: [0, Tm], y: [0, N0 * 1.05], xl: 'time (' + unit + ')', yl: 'nuclei left', ml: 48, xt: th, xf: function (v) { return v ? fm(v / th, 0) + ' t½' : '0'; } });
      ctx.save(); ctx.translate(ox, oy); Ch.draw(ctx); Ch.curve(ctx, function (t) { return N0 * M.pow(0.5, t / th); }, 0, Tm, k.blue, 2, [6, 4]);
      var pts = []; for (var j = 0; j <= 100; j++) { var tt = M.min(S.t, Tm) * j / 100; pts.push([tt, left(tt)]); } Ch.path(ctx, pts, k.acc, 2.5);
      txt(ctx, 'N₀(½)^(t/t½)', Ch.X(th * 1.2), Ch.Y(N0 * M.pow(0.5, 1.2)) - 12, { size: 10, color: k.blue });
      line(ctx, [[Ch.X(M.min(S.t, Tm)), Ch.box().y0], [Ch.X(M.min(S.t, Tm)), Ch.box().y1]], k.gold, 1.2, [3, 3]);
      ctx.restore();
    }
    function report() { var n = left(S.t), age = th * M.log(1 / S.frac) / M.LN2; F.say((quiet ? '' : 't = ' + sf(S.t, 3) + ' ' + unit + ' (' + fm(S.t / th, 2) + ' half-lives): ' + n + ' of ' + N0 + ' left (' + fm(n / N0 * 100, 1) + '%; the formula predicts ' + fm(100 * M.pow(0.5, S.t / th), 1) + '%). ') + 'Each nucleus decays at random; none has a timer. The count halves every half-life' + (quiet ? '' : ' (' + sf(th, 4) + ' ' + unit + ')') + ', and a sample never "runs out" all at once.' + (o.dating !== false && !quiet ? ' Dating: ' + fm(S.frac * 100, 1) + '% left means an age of t½ × log₂(1/' + fm(S.frac, 3) + ') = ' + sci(age, 3, true) + ' ' + unit + '.' : '')); F.setAlt('A grid of ' + N0 + ' nuclei, some decayed, beside a graph of the number left against time.'); }
    var A = anim(elx, function (dt) { S.t = M.min(Tm, S.t + dt * th / 3); ts.set(S.t / th); draw(); report(); if (S.t >= Tm) { A.stop(); pb.sync(); } }, false), ts, pb;
    ts = sl(F.ctl, { label: 'Time (half-lives)', min: 0, max: 5, step: 0.01, value: S.t / th, fmt: function (v) { return fm(v, 2); }, input: function (v) { S.t = v * th; draw(); report(); } });
    pb = playBtn(F.ctl, A, function (on) { if (on && S.t >= Tm) S.t = 0; });
    if (o.dating !== false) sl(F.ctl, { label: 'Dating: fraction left', min: 0.01, max: 1, step: 0.01, value: S.frac, input: function (v) { S.frac = v; report(); } });
    redraw(c, draw); draw(); report(); return { draw: draw };
  }
  CH.conc = conc; CH.halfLife = halfLife; CH.HALF = HALF;

  // =====================================================================================================
  // ch-solubilitycurve: options are documented at the top of this file
  var SOLT = [0, 20, 40, 60, 80, 100], SOL = { KNO3: [13.3, 31.6, 63.9, 110, 169, 246], NaCl: [35.7, 36.0, 36.6, 37.3, 38.4, 39.8], KCl: [27.6, 34.0, 40.0, 45.5, 51.1, 56.7], NH4Cl: [29.4, 37.2, 45.8, 55.2, 65.6, 77.3], KClO3: [3.3, 7.3, 13.9, 23.8, 37.6, 56.3] };
  var GAS = { O2: [[0, 0.0070], [20, 0.0044], [40, 0.0033], [60, 0.0028]], CO2: [[0, 0.335], [20, 0.169], [40, 0.097], [60, 0.058]] }, KH = { O2: 1.3e-3, N2: 6.4e-4, CO2: 3.3e-2 };
  function solAt(sub, T) { // monotone cubic (Fritsch–Carlson) through the tabulated points
    var ys = SOL[sub], xs = SOLT; if (!ys) return NaN; T = clamp(T, 0, 100); var n = xs.length, d = [], m = [], i; for (i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    m[0] = d[0]; m[n - 1] = d[n - 2]; for (i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } var a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b; if (h > 9) { var t = 3 / M.sqrt(h); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; } }
    for (i = 0; i < n - 1; i++) if (T <= xs[i + 1]) { var hh = xs[i + 1] - xs[i], s = (T - xs[i]) / hh, s2 = s * s, s3 = s2 * s; return (2 * s3 - 3 * s2 + 1) * ys[i] + (s3 - 2 * s2 + s) * hh * m[i] + (-2 * s3 + 3 * s2) * ys[i + 1] + (s3 - s2) * hh * m[i + 1]; }
    return ys[n - 1];
  }
  function gasAt(sub, T) { var p = GAS[sub]; for (var i = 1; i < p.length; i++) if (T <= p[i][0]) return M.exp(lerp(M.log(p[i - 1][1]), M.log(p[i][1]), (T - p[i - 1][0]) / (p[i][0] - p[i - 1][0]))); return p[p.length - 1][1]; }
  R('ch-solubilitycurve', function (elx, o) {
    o = opt(o, { subs: ['KNO3', 'NaCl', 'KCl', 'NH4Cl', 'KClO3'], point: { T: 40, g: 80 }, cool: null, mode: 'curves' });
    var quiet = !!(o.quiet || o.readout === false), salts = o.subs.filter(function (s) { return SOL[s]; }), gases = o.subs.filter(function (s) { return GAS[s]; });
    var F = frame(elx, o, o.mode === 'henry' ? "Henry's law: dissolved gas and pressure" : 'Solubility curves'), c = F.canvas({ aspect: 1.6, min: 300, max: 440, narrow: 0.95 }), Ch, cols = ['acc', 'blue', 'green', 'orange', 'red'];
    var S = { T: o.point ? num(o.point.T, 40) : 40, g: o.point ? num(o.point.g, 80) : 80, P: 1 };
    if (o.mode === 'henry') return henry(F, o, c);
    function draw() {
      var ctx = c.ctx, k = pal(), ymax = 0; salts.forEach(function (s) { ymax = M.max(ymax, SOL[s][5]); }); ymax = M.max(40, M.ceil(ymax * 1.08 / 20) * 20); var gW = gases.length && c.w >= 560 ? c.w * 0.3 : 0;
      ctx.clearRect(0, 0, c.w, c.h);
      if (salts.length) { var sub = { w: c.w - gW, h: c.h }; Ch = chart(sub, { x: [0, 100], y: [0, ymax], xl: 'Temperature (°C)', yl: 'Solubility (g per 100 g water)', ml: 50, xt: 20 }); Ch.draw(ctx);
        var labs = salts.map(function (s, i) { Ch.curve(ctx, function (T) { return solAt(s, T); }, 0, 100, k[cols[i % 5]], 2.6); return { s: s, col: k[cols[i % 5]], y: Ch.Y(solAt(s, 100)) }; }).sort(function (p, q) { return p.y - q.y; });
        for (var li = 1; li < labs.length; li++) if (labs[li].y - labs[li - 1].y < 15) labs[li].y = labs[li - 1].y + 15; // keep the names apart
        labs.forEach(function (L) { fDraw(ctx, L.s, Ch.box().x1 - 4, L.y - 8, { size: 11, align: 'right', color: L.col }); });
        if (o.point && salts.length) { var s0 = salts[0], sat = solAt(s0, S.T); if (o.cool != null) { var T2 = num(o.cool, 20), s2 = solAt(s0, T2), g0 = M.min(S.g, sat); arrow(ctx, Ch.X(S.T), Ch.Y(g0), Ch.X(T2) + 4, Ch.Y(g0), k.blue, 2, 8); if (g0 > s2) { line(ctx, [[Ch.X(T2), Ch.Y(g0)], [Ch.X(T2), Ch.Y(s2)]], k.gold, 3); if (!quiet) pill(ctx, 'crystals: ' + fm(g0 - s2, 1) + ' g', Ch.X(T2) + 6, Ch.Y((g0 + s2) / 2), { align: 'left', size: 11, line: k.gold }); } }
          knob(ctx, Ch.X(S.T), Ch.Y(S.g), k.ink, 8); H.draw(ctx); if (!quiet) pill(ctx, cls(), Ch.X(S.T), Ch.Y(S.g) - 22, { size: 11, clampW: c.w - gW }); } }
      if (gases.length) { var gx = salts.length ? c.w - gW : 0, sub2 = { w: gW || c.w, h: c.h }, gmax = 0, gmin = 1; gases.forEach(function (s) { GAS[s].forEach(function (p) { gmax = M.max(gmax, p[1]); gmin = M.min(gmin, p[1]); }); });
        if (salts.length && !gW) return; var G = chart(sub2, { x: [0, 60], y: [gmin / 2, gmax * 2], ylog: gases.length > 1, xl: 'Temperature (°C)', yl: 'g gas per 100 g water', ml: 52, xt: 20, yf: function (v) { return sf(v, 1); } });
        ctx.save(); ctx.translate(gx, 0); G.draw(ctx); gases.forEach(function (s, i) { G.curve(ctx, function (T) { return gasAt(s, T); }, 0, 60, k[['blue', 'red'][i % 2]], 2.6); fDraw(ctx, s, G.X(30), G.Y(gasAt(s, 30)) - 10, { size: 11, color: k[['blue', 'red'][i % 2]] }); }); txtw(ctx, 'gases dissolve less when warm', G.box().x1 - 4, G.box().y0 + 10, G.box().x1 - G.box().x0 - 10, { size: 10, align: 'right', lh: 12 }); ctx.restore(); }
    }
    function cls() { var sat = solAt(salts[0], S.T), d = S.g - sat; return M.abs(d) <= M.max(1, sat * 0.02) ? 'saturated' : d < 0 ? 'unsaturated' : 'supersaturated'; }
    function report() {
      var s = ''; if (salts.length && o.point) { var s0 = salts[0], sat = solAt(s0, S.T); s = quiet ? 'The point stands for ' + fm(S.g, 1) + ' g of ' + fH(s0) + ' in 100 g of water at ' + fm(S.T, 0) + ' °C.' : 'At ' + fm(S.T, 0) + ' °C, 100 g of water can dissolve ' + fm(sat, 1) + ' g of ' + fH(s0) + '. The point (' + fm(S.g, 1) + ' g) is <b>' + cls() + '</b>' + (cls() === 'supersaturated' ? ': more than the curve allows, an unstable state that a seed crystal ends.' : cls() === 'saturated' ? ': on the curve, the most that will dissolve. "Saturated" means on the curve, not "a lot".' : ': below the curve, so more could dissolve.') + (o.cool != null ? ' Cooling a saturated solution to ' + fm(num(o.cool, 20), 0) + ' °C leaves room for only ' + fm(solAt(s0, num(o.cool, 20)), 1) + ' g, so ' + fm(M.max(0, M.min(S.g, sat) - solAt(s0, num(o.cool, 20))), 1) + ' g crystallizes.' : ''); }
      if (gases.length) s += ' Gases dissolve less in warm water: ' + gases.map(function (g) { return fH(g) + ' ' + sf(gasAt(g, 0), 2) + ' g at 0 °C, ' + sf(gasAt(g, 40), 2) + ' g at 40 °C'; }).join('; ') + ' (per 100 g of water, 1 atm of the gas).';
      F.say(s); F.setAlt('Solubility curves of ' + salts.concat(gases).map(fT).join(', ') + ' against temperature.');
    }
    var H = hand(c, salts.length && o.point && F.edit ? [{ get: function () { return Ch ? [Ch.X(S.T), Ch.Y(S.g)] : null; }, set: function (px, py) { S.T = clamp(Ch.x(px), 0, 100); S.g = clamp(Ch.y(py), 0, Ch.o.y[1]); report(); }, key: function (dx, dy) { S.T = clamp(S.T + dx, 0, 100); S.g = clamp(S.g - dy, 0, Ch.o.y[1]); report(); } }] : [], { change: draw });
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  function henry(F, o, c) {
    var quiet = F.quiet, S = { P: 1 }, Ch, gs = ['O2', 'N2', 'CO2'], cols = ['blue', 'green', 'red'];
    function draw() { // one small linear graph per gas: each a straight line through the origin
      var ctx = c.ctx, k = pal(), wide = c.w >= 560, n = gs.length; ctx.clearRect(0, 0, c.w, c.h);
      gs.forEach(function (g, i) { var box = wide ? { x: i * c.w / n, y: 0, w: c.w / n, h: c.h } : { x: 0, y: i * c.h / n, w: c.w, h: c.h / n }, ymax = KH[g] * 5 * 1.1, sc = ymax < 0.01 ? 1000 : 1, G = chart({ w: box.w, h: box.h }, { x: [0, 5], y: [0, ymax * sc], xl: 'P (atm)', yl: (sc === 1000 ? 'mmol/L' : 'mol/L'), ml: 48, mb: 34, mt: 20, yf: function (v) { return sf(v, 2); } });
        ctx.save(); ctx.translate(box.x, box.y); G.draw(ctx); G.curve(ctx, function (P) { return KH[g] * P * sc; }, 0, 5, k[cols[i]], 2.8); ctx.fillStyle = k[cols[i]]; ctx.beginPath(); ctx.arc(G.X(S.P), G.Y(KH[g] * S.P * sc), 5, 0, TAU); ctx.fill(); line(ctx, [[G.X(S.P), G.box().y0], [G.X(S.P), G.box().y1]], k.gold, 1.2, [4, 4]); fDraw(ctx, g, G.box().x0 + 8, G.box().y0 + 4, { size: 13, color: k[cols[i]], bold: true }); ctx.restore(); }); }
    function report() { F.say((quiet ? '' : 'At ' + fm(S.P, 2) + ' atm and 25 °C: ' + gs.map(function (g) { return fH(g) + ' ' + sci(KH[g] * S.P, 2, true) + ' mol/L'; }).join(', ') + '. ') + "Henry's law: C = k<sub>H</sub>P. Opening a soda lowers the pressure of CO₂ above it, so CO₂ comes out of solution."); F.setAlt("Lines of dissolved gas against partial pressure for oxygen, nitrogen and carbon dioxide."); }
    if (F.edit) sl(F.ctl, { label: 'Partial pressure', min: 0.1, max: 5, step: 0.05, value: S.P, fmt: function (v) { return fm(v, 2) + ' atm'; }, input: function (v) { S.P = v; draw(); report(); } });
    redraw(c, draw); draw(); report(); return { draw: draw };
  }
  CH.solAt = solAt; CH.KH = KH;

  // =====================================================================================================
  // ch-beaker: options are documented at the top of this file
  R('ch-beaker', function (elx, o) {
    o = opt(o, { mode: 'molarity', sub: 'NaCl', mol: 0.20, V: 0.50, a: { sub: 'AgNO3', M: 0.0010, V: 0.100 }, b: { sub: 'NaCl', M: 0.0010, V: 0.100 }, Ksp: 1.8e-10, M: 0.10, g: 5.85, water: 100, density: 1.00 });
    var mode = o.mode, quiet = !!(o.quiet || o.readout === false), F = frame(elx, o, { molarity: 'Molarity: moles per liter of solution', dilute: 'Diluting a solution', mix: 'Mixing two solutions', ions: 'Ions in solution', units: 'One solution, four concentration units' }[mode] || 'A solution');
    var S = { n: num(o.mol, 0.2), V: num(o.V, 0.5), n0: num(o.mol, 0.2), V0: num(o.V, 0.5), poured: false }, c = F.canvas({ aspect: 1.9, min: 260, max: 380, narrow: 1.1 }), rnd = rng(31), dots = [];
    var perDot = 0.01; // mol per dot (changed to keep the count readable)
    function regen() { var nd = M.round(S.n / perDot); while (dots.length < nd) dots.push([rnd(), rnd()]); dots.length = M.max(0, nd); }
    while (S.n / perDot > 80) perDot *= 2;
    function beaker(ctx, k, x, y, w, h, frac, n, label, vol, col) { // a beaker with a liquid filled to frac, n dots, a label
      ctx.save(); ctx.strokeStyle = k.glassLine; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4, y + h); ctx.lineTo(x + w - 4, y + h); ctx.lineTo(x + w, y); ctx.stroke();
      var ly = y + h * (1 - frac); ctx.fillStyle = k.water; ctx.beginPath(); ctx.moveTo(x + 2, ly); ctx.lineTo(x + 5, y + h - 1); ctx.lineTo(x + w - 5, y + h - 1); ctx.lineTo(x + w - 2, ly); ctx.closePath(); ctx.fill();
      for (var i = 0; i < n; i++) { var d = dots[i % dots.length] || [((i * 0.618) % 1), ((i * 0.37) % 1)]; ctx.fillStyle = col || k.acc; ctx.beginPath(); ctx.arc(x + 10 + d[0] * (w - 20), ly + 6 + d[1] * (y + h - ly - 12), 3.2, 0, TAU); ctx.fill(); }
      for (var t = 1; t <= 4; t++) { var yy = y + h - h * t / 5; line(ctx, [[x + w - 18, yy], [x + w - 4, yy]], k.glassLine, 1); }
      txt(ctx, label, x + w / 2, y + h + 14, { size: 11, align: 'center', color: k.ink, bold: true }); if (vol) { var vl = tw(ctx, vol, 10) > w + 10 && vol.indexOf(', ') > 0 ? vol.split(', ') : [vol]; vl.forEach(function (t, j) { txt(ctx, t, x + w / 2, y + h + 28 + j * 13, { size: 10, align: 'center' }); }); } ctx.restore();
    }
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var bh = c.h - 60, bw = M.min(170, c.w * 0.32);
      if (mode === 'molarity' || mode === 'dilute' || mode === 'units') { regen(); var Vmax = M.max(1.0, S.V * 1.2); beaker(ctx, k, (c.w - bw) / 2 - (c.w >= 560 ? c.w * 0.15 : 0), 14, bw, bh, S.V / Vmax, dots.length, fT(o.sub) + (quiet ? '' : ' · ' + sf(S.n / S.V, 3) + ' M'), sf(S.V, 3) + ' L of solution'); if (c.w >= 560) { var x0 = c.w * 0.6; txt(ctx, 'each dot = ' + fm(perDot, 3) + ' mol', x0, 30, { size: 12, color: k.ink }); txt(ctx, 'moles: ' + sf(S.n, 3), x0, 54, { size: 13, bold: true, color: k.ink }); txt(ctx, 'liters of solution: ' + sf(S.V, 3), x0, 76, { size: 13, bold: true, color: k.ink }); txt(ctx, quiet ? 'molarity = moles ÷ liters' : 'molarity = ' + sf(S.n, 3) + ' ÷ ' + sf(S.V, 3) + ' = ' + sf(S.n / S.V, 3) + ' M', x0, 100, { size: 13, bold: true, color: k.acc }); } }
      else if (mode === 'ions') { var io = ionsOf(o.sub) || [[o.sub, 1]], Mx = num(o.M, 0.1); io.forEach(function (pr, i) { var n = M.round(6 * pr[1]); beaker(ctx, k, 20 + i * (bw + 30), 14, bw, bh, 0.75, n, fT(pr[0]) + (quiet ? '' : ': ' + sf(Mx * pr[1], 3) + ' M'), pr[1] + ' per formula unit', i ? k.blue : k.acc); }); }
      else if (mode === 'mix') { var A = o.a, B = o.b, Vt = num(A.V, 0.1) + num(B.V, 0.1), w3 = M.min(140, (c.w - 80) / 3); beaker(ctx, k, 14, 14, w3, bh * 0.8, 0.5, 6, fT(A.sub), fm(num(A.V, 0.1) * 1000, 0) + ' mL, ' + sf(num(A.M, 0.001), 2) + ' M', k.acc); beaker(ctx, k, 34 + w3, 14, w3, bh * 0.8, 0.5, 6, fT(B.sub), fm(num(B.V, 0.1) * 1000, 0) + ' mL, ' + sf(num(B.M, 0.001), 2) + ' M', k.blue); arrow(ctx, 44 + 2 * w3, bh * 0.45, 60 + 2 * w3, bh * 0.45, k.muted, 2, 7); beaker(ctx, k, 66 + 2 * w3, 14, w3, bh * 0.8, 0.9, 12, 'mixed', fm(Vt * 1000, 0) + ' mL', k.green); var MQ = mixQ(); if (!quiet && MQ) { var qt = MQ.ppt ? 'Q > Ksp: ' + fT(MQ.salt) + ' precipitates' : 'Q < Ksp: no precipitate', qw = tw(ctx, qt, 11, true); txt(ctx, qt, clamp(66 + 2.5 * w3, qw / 2 + 4, c.w - qw / 2 - 4), bh * 0.8 + (c.w < 560 ? 78 : 62), { size: 11, bold: true, align: 'center', color: MQ.ppt ? k.red : k.green }); } }
    }
    function mixQ() { var A = o.a, B = o.b, ia = ionsOf(A.sub), ib = ionsOf(B.sub); if (!ia || !ib) return null; var Vt = num(A.V, 0.1) + num(B.V, 0.1), pr = insoluble(ia[0][0], ib[1][0]) ? [ia[0], ib[1], A, B] : insoluble(ib[0][0], ia[1][0]) ? [ib[0], ia[1], B, A] : null; if (!pr) return { ppt: false, Q: 0 };
      var cC = num(pr[2].M, 0.001) * pr[0][1] * num(pr[2].V, 0.1) / Vt, cA = num(pr[3].M, 0.001) * pr[1][1] * num(pr[3].V, 0.1) / Vt, qc = parseF(pr[0][0]).charge, qa = -parseF(pr[1][0]).charge, g = gcdI(qc, qa), nc = qa / g, na = qc / g, Q = M.pow(cC, nc) * M.pow(cA, na); return { ppt: Q > num(o.Ksp, 1.8e-10), Q: Q, cC: cC, cA: cA, nc: nc, na: na, cat: pr[0][0], an: pr[1][0], salt: saltF(pr[0][0], nc, pr[1][0], na), Vt: Vt }; }
    function report() {
      var s = '';
      if (mode === 'molarity' || mode === 'dilute') s = quiet ? 'Moles of solute: ' + sf(S.n, 3) + '; liters of solution: ' + sf(S.V, 3) + '.' : 'M = moles ÷ liters of <i>solution</i> = ' + sf(S.n, 3) + ' ÷ ' + sf(S.V, 3) + ' = <b>' + sf(S.n / S.V, 3) + ' M</b>.' + (S.V !== S.V0 || S.n !== S.n0 ? (S.n === S.n0 * (S.V / S.V0) ? ' Pouring some out keeps the concentration.' : S.n === S.n0 || M.abs(S.n - S.n0) < 1e-9 ? ' Adding water spreads the same moles through more liters: M₁V₁ = M₂V₂ = ' + sf(S.n, 3) + ' mol.' : '') : '');
      else if (mode === 'ions') { var io = ionsOf(o.sub) || [], Mx = num(o.M, 0.1); s = quiet ? fH(o.sub) + ' dissolves into ions.' : sf(Mx, 3) + ' M ' + fH(o.sub) + ' gives ' + io.map(function (pr) { return '[' + fH(pr[0]) + '] = ' + pr[1] + ' × ' + sf(Mx, 3) + ' = ' + sf(Mx * pr[1], 3) + ' M'; }).join(' and ') + '. The subscripts set how many of each ion.'; }
      else if (mode === 'mix') { var MQ = mixQ(); s = !MQ ? 'Mix two ionic solutions.' : quiet ? 'Both solutions are diluted by mixing. Compare Q with Ksp.' : 'After mixing, the volume is ' + fm(MQ.Vt * 1000, 0) + ' mL, so each ion is diluted: [' + fH(MQ.cat) + '] = ' + sci(MQ.cC, 2, true) + ' M, [' + fH(MQ.an) + '] = ' + sci(MQ.cA, 2, true) + ' M. Q = ' + sci(MQ.Q, 2, true) + (MQ.ppt ? ' > ' : ' < ') + 'Ksp = ' + sci(num(o.Ksp, 1.8e-10), 2, true) + ' (given), so ' + (MQ.ppt ? fH(MQ.salt) + ' precipitates.' : 'no precipitate forms.'); }
      else if (mode === 'units') { var g = num(o.g, 5.85), Mm = mm2(o.sub), n = g / Mm, wat = num(o.water, 100), tot = g + wat, Vs = tot / num(o.density, 1) / 1000, nw = wat / 18.02; S.n = n; S.V = Vs; s = quiet ? fm(g, 3) + ' g of ' + fH(o.sub) + ' in ' + fm(wat, 1) + ' g of water.' : fm(g, 3) + ' g of ' + fH(o.sub) + ' (' + sf(n, 3) + ' mol) in ' + fm(wat, 1) + ' g of water, ' + sf(Vs * 1000, 3) + ' mL of solution (density ' + fm(num(o.density, 1), 3) + ' g/mL): molarity ' + sf(n / Vs, 3) + ' M · molality ' + sf(n / (wat / 1000), 3) + ' mol/kg · mole fraction ' + sf(n / (n + nw), 3) + ' · ' + sf(g / tot * 1e6, 3) + ' ppm by mass.'; }
      F.say(s); F.setAlt('A beaker of ' + fT(o.sub) + ' solution with dots for the dissolved particles.');
    }
    if (F.edit && (mode === 'molarity' || mode === 'dilute')) { btn(F.ctl, 'Add solute', function () { S.n += perDot * 2; report(); draw(); }); btn(F.ctl, 'Add water', function () { S.V = M.min(S.V + 0.1, 2.0); report(); draw(); }, 'pri'); btn(F.ctl, 'Pour some out', function () { S.n *= 0.75; S.V *= 0.75; dots.length = M.round(S.n / perDot); report(); draw(); }); btn(F.ctl, 'Reset', function () { S.n = S.n0; S.V = S.V0; report(); draw(); }); }
    if (mode === 'units') report();
    redraw(c, draw); draw(); report(); return { draw: draw };
  });

  // =====================================================================================================
  // ch-phscale: options are documented at the top of this file
  var LIQ = [['lemon juice', 2.3, 2.0, 2.6], ['cola', 2.4, 2.4, 2.4], ['vinegar', 2.5, 2.4, 3.4], ['black coffee', 5.0, 5.0, 5.0], ['milk', 6.6, 6.4, 6.8], ['pure water', 7.0, 7.0, 7.0], ['baking soda in water', 8.3, 8.3, 8.3], ['soapy water', 9.5, 9.0, 10.0], ['household ammonia', 11.5, 11.0, 12.0]];
  var UNI = [[0, [205, 32, 38]], [3, [226, 48, 40]], [4, [240, 116, 36]], [5, [246, 164, 34]], [6, [236, 206, 44]], [7, [52, 168, 74]], [8, [34, 150, 178]], [9, [40, 110, 204]], [10, [46, 78, 192]], [11, [78, 56, 168]], [14, [112, 40, 150]]], CAB = [[0, [196, 26, 58]], [2, [208, 38, 74]], [4, [150, 50, 128]], [6, [112, 62, 176]], [8, [52, 92, 204]], [10, [36, 150, 142]], [12, [168, 198, 58]], [14, [196, 206, 46]]];
  function ramp(st, x) { if (x <= st[0][0]) return st[0][1]; for (var i = 1; i < st.length; i++) if (x <= st[i][0]) { var t = (x - st[i - 1][0]) / (st[i][0] - st[i - 1][0]); return [0, 1, 2].map(function (j) { return M.round(lerp(st[i - 1][1][j], st[i][1][j], t)); }); } return st[st.length - 1][1]; }
  var INDS = { universal: { name: 'universal indicator', f: function (p) { return [ramp(UNI, p), 0.9]; } }, cabbage: { name: 'red cabbage juice', f: function (p) { return [ramp(CAB, p), 0.85]; } }, phenolphthalein: { name: 'phenolphthalein', lo: 8.2, hi: 10, f: function (p) { var t = clamp((p - 8.2) / 1.8, 0, 1); return [[226, 52, 150], 0.9 * M.pow(t, 0.8)]; } }, litmus: { name: 'litmus', lo: 4.5, hi: 8.3, f: function (p) { return [ramp([[4.5, [204, 46, 60]], [6.4, [132, 62, 150]], [8.3, [48, 82, 192]]], p), 0.85]; } }, bromothymol: { name: 'bromothymol blue', lo: 6.0, hi: 7.6, f: function (p) { return [ramp([[6.0, [232, 196, 40]], [6.8, [90, 160, 80]], [7.6, [40, 90, 190]]], p), 0.85]; } }, methylorange: { name: 'methyl orange', lo: 3.1, hi: 4.4, f: function (p) { return [ramp([[3.1, [214, 40, 40]], [3.8, [236, 120, 40]], [4.4, [246, 196, 40]]], p), 0.85]; } } };
  function indRGB(id, p) { var I = INDS[id] || INDS.universal, r = I.f(p); return 'rgba(' + r[0].join(',') + ',' + r[1] + ')'; }
  R('ch-phscale', function (elx, o) {
    o = opt(o, { pH: null, H3O: null, OH: null, show: ['conc', 'pOH', 'liquids', 'indicators'], ind: 'universal', mode: 'scale', acids: null });
    var quiet = !!(o.quiet || o.readout === false), show = {}; (o.show || []).forEach(function (x) { show[x] = 1; });
    var p0 = o.pH != null ? num(o.pH, 7) : o.H3O != null ? -log10(num(o.H3O, 1e-7)) : o.OH != null ? 14 + log10(num(o.OH, 1e-7)) : 3, S = { pH: clamp(p0, 0, 14) };
    var F = frame(elx, o, o.mode === 'pka' ? 'Acid strength on a pKa ruler' : 'The pH scale'), c = F.canvas({ aspect: 1.6, min: 330, max: 540, narrow: o.mode === 'pka' ? 0.8 : 0.68 }), X;
    if (o.mode === 'pka') return pkaRuler(F, o, c);
    function draw() {
      var ctx = c.ctx, k = pal(), x0 = 24, x1 = c.w - 24, y0 = 46, bh = 26; X = function (p) { return x0 + p / 14 * (x1 - x0); }; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      for (var i = 0; i < 140; i++) { var p = i / 10; ctx.fillStyle = indRGB('universal', p + 0.05); ctx.fillRect(X(p), y0, (x1 - x0) / 140 + 1, bh); }
      for (var q = 0; q <= 14; q++) { line(ctx, [[X(q), y0 + bh], [X(q), y0 + bh + 5]], k.ink, 1); txt(ctx, String(q), X(q), y0 + bh + 13, { size: 11, align: 'center', color: k.ink }); }
      txt(ctx, 'acidic', X(1), y0 - 10, { size: 11, bold: true, color: k.red }); txt(ctx, 'neutral', X(7), y0 - 10, { size: 11, bold: true, align: 'center', color: k.green }); txt(ctx, 'basic', X(13), y0 - 10, { size: 11, bold: true, align: 'right', color: k.blue });
      var px = X(S.pH); ctx.fillStyle = k.ink; ctx.beginPath(); ctx.moveTo(px, y0 + bh + 18); ctx.lineTo(px - 8, y0 + bh + 30); ctx.lineTo(px + 8, y0 + bh + 30); ctx.closePath(); ctx.fill(); line(ctx, [[px, y0 - 4], [px, y0 + bh + 18]], k.ink, 2.5); if (!quiet) pill(ctx, 'pH ' + fm(S.pH, 2), px, y0 + bh + 42, { size: 12, clampW: c.w, line: k.ink }); H.draw(ctx);
      var y = y0 + bh + 62;
      if (show.liquids) { var rowEnd = [], items = LIQ.map(function (L) { var lx = X(L[1]), w = tw(ctx, L[0], 10), e0 = L[1] > 10 ? lx - 6 - w : lx - 4, e1 = L[1] > 10 ? lx + 4 : lx + 6 + w; return { L: L, e0: M.min(e0, X(L[2])), e1: M.max(e1, X(L[3])) }; }).sort(function (p2, q2) { return p2.e0 - q2.e0; }); items.forEach(function (it) { var r = 0; while (rowEnd[r] != null && rowEnd[r] > it.e0 - 8) r++; rowEnd[r] = it.e1; it.row = r; }); var nRows = rowEnd.length; items.forEach(function (it) { var L = it.L, lx = X(L[1]), row = it.row, yy = y + row * 17; if (L[2] !== L[3]) { ctx.fillStyle = rgba(k.acc, 0.2); ctx.fillRect(X(L[2]), yy - 6, X(L[3]) - X(L[2]), 12); } ctx.fillStyle = k.acc; ctx.beginPath(); ctx.arc(lx, yy, 3.5, 0, TAU); ctx.fill(); txt(ctx, L[0], lx + (L[1] > 10 ? -6 : 6), yy, { size: 10, color: k.ink, align: L[1] > 10 ? 'right' : 'left' }); }); y += nRows * 17 + 13; }
      if (show.indicators) { var ids = o.ind && o.ind !== 'universal' ? [o.ind] : ['universal', 'litmus', 'phenolphthalein']; ids.forEach(function (id) { for (var i2 = 0; i2 < 140; i2++) { var pp = i2 / 10; ctx.fillStyle = k.bg; ctx.fillRect(X(pp), y, (x1 - x0) / 140 + 1, 14); ctx.fillStyle = indRGB(id, pp + 0.05); ctx.fillRect(X(pp), y, (x1 - x0) / 140 + 1, 14); } ctx.strokeStyle = k.labLine; ctx.strokeRect(X(0), y, X(14) - X(0), 14); txt(ctx, INDS[id].name + (INDS[id].lo ? ' (changes ' + INDS[id].lo + '–' + INDS[id].hi + ')' : ''), X(0) + 4, y + 22, { size: 10, color: k.ink }); y += 34; }); }
      if (show.conc) { // tenfold blocks: one step down in pH means ten times the hydronium
        y += 14; var bx = X(0), base = M.floor(S.pH), cells = [1, 10, 100], labels = ['pH ' + (base), 'pH ' + (base - 1), 'pH ' + (base - 2)]; txt(ctx, 'each step of 1 is ×10 in [H₃O⁺]:', bx, y + 6, { size: 11, color: k.ink }); var cx = bx + 210, sp = 120; if (c.w < 520) { cx = bx; y += 32; sp = (x1 - x0) / 3; }
        cells.forEach(function (n, i) { if (base - i < 0) return; var sz = 4, cols = M.min(n, 20), x = cx + i * sp; for (var j = 0; j < n; j++) { ctx.fillStyle = rgba(k.red, 0.75); ctx.fillRect(x + (j % cols) * (sz + 1), y + 2 + M.floor(j / cols) * (sz + 1), sz, sz); } txt(ctx, labels[i], x, y - 6 + 2, { size: 10 }); });
        y += 32;
      }
      var need = M.max(200, M.round(y + 12)); if (!o.height && M.abs(need - c.h) > 4) { c.q.height = need; c.q.min = 100; c.q.fixed = true; c.fit(); draw(); }
    }
    function report() { var h = M.pow(10, -S.pH), oh = 1e-14 / h; F.say(quiet ? 'Where does the pointer sit on the scale?' : 'pH ' + fm(S.pH, 2) + ': [H₃O⁺] = 10<sup>−' + fm(S.pH, 2) + '</sup> = ' + sciH(h, 2) + ' M' + (show.pOH ? ', pOH = ' + fm(14 - S.pH, 2) : '') + ', [OH⁻] = ' + sciH(oh, 2) + ' M. ' + (S.pH < 7 ? 'Acidic.' : S.pH > 7 ? 'Basic, yet it still contains some H₃O⁺.' : 'Neutral.') + ' [H₃O⁺][OH⁻] = 1.0 × 10<sup>−14</sup> at 25 °C. Each pH unit is a factor of 10: pH 3 has 10 times the hydronium of pH 4.'); F.setAlt('A pH scale from 0 to 14 colored like universal indicator, with a pointer' + (show.liquids ? ', everyday liquids' : '') + (show.indicators ? ' and indicator color bands' : '') + '.'); }
    var H = hand(c, F.edit ? [{ get: function () { return X ? [X(S.pH), 46 + 26 + 24] : null; }, set: function (px) { S.pH = clamp(M.round((px - 24) / (c.w - 48) * 14 * 10) / 10, 0, 14); report(); }, key: function (dx) { S.pH = clamp(M.round((S.pH + dx * 0.1) * 10) / 10, 0, 14); report(); } }] : [], { change: draw, r: 30 });
    c.cv.setAttribute('aria-label', 'pH scale. Drag the pointer, or use the left and right arrow keys.');
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  function pkaRuler(F, o, c) {
    var acids = (o.acids || [{ name: 'formic acid', Ka: 1.8e-4 }, { name: 'acetic acid', Ka: 1.8e-5 }, { name: 'hypochlorous acid', Ka: 2.9e-8 }, { name: 'ammonium ion', Ka: 5.6e-10 }, { name: 'hydrocyanic acid', Ka: 4.9e-10 }]).map(function (a) { return { name: a.name, Ka: num(a.Ka, 1e-5), pKa: -log10(num(a.Ka, 1e-5)) }; }), quiet = F.quiet;
    function draw() { var ctx = c.ctx, k = pal(), x0 = 30, x1 = c.w - 30, y = c.h * 0.35, X = function (p) { return x0 + p / 14 * (x1 - x0); }; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h); line(ctx, [[x0, y], [x1, y]], k.ink, 3); for (var q = 0; q <= 14; q += 2) { line(ctx, [[X(q), y - 6], [X(q), y + 6]], k.ink, 1.5); txt(ctx, String(q), X(q), y + 16, { size: 11, align: 'center', color: k.ink }); } txt(ctx, 'pKa', x1, y + 30, { size: 12, bold: true, align: 'right', color: k.ink }); arrow(ctx, X(6), y - 40, X(1), y - 40, k.red, 2.5, 9); txt(ctx, 'stronger acids', X(3.5), y - 50, { size: 12, bold: true, align: 'center', color: k.red }); acids.sort(function (a, b) { return a.pKa - b.pKa; }).forEach(function (a, i) { var xx = X(a.pKa), yy = y + 46 + i * 24; line(ctx, [[xx, y + 6], [xx, yy - 8]], k.acc, 1.2, [2, 3]); ctx.fillStyle = k.acc; ctx.beginPath(); ctx.arc(xx, y, 5, 0, TAU); ctx.fill(); var nl = a.name + (quiet ? '' : ' (' + fm(a.pKa, 2) + ')'), nw = tw(ctx, nl, 11), fitsL = xx - 2 + nw <= c.w - 4, fitsR = xx + 2 - nw >= 4; txt(ctx, nl, fitsL ? xx - 2 : fitsR ? xx + 2 : clamp(xx, nw / 2 + 4, c.w - nw / 2 - 4), yy, { size: 11, align: fitsL ? 'left' : fitsR ? 'right' : 'center', color: k.ink }); }); }
    function report() { F.say((quiet ? '' : acids.map(function (a) { return a.name + ': Ka ' + sciH(a.Ka, 2) + ', pKa ' + fm(a.pKa, 2); }).join('; ') + '. ') + 'pKa = −log Ka: a lower pKa means a larger Ka and a stronger acid. Each step of 1 is a factor of 10 in Ka.'); F.setAlt('A pKa ruler from 0 to 14 with weak acids placed on it.'); }
    redraw(c, draw); draw(); report(); return { draw: draw };
  }
  CH.indRGB = indRGB; CH.LIQ = LIQ;

  // =====================================================================================================
  // exact pH from the charge balance (Kw = 1.0e-14 at 25 °C), solved by bisection on log[H3O+]
  function phSolve(fn) { var lo = -15.5, hi = 1.5; for (var i = 0; i < 90; i++) { var mid = (lo + hi) / 2, h = M.pow(10, mid); if (fn(h) > 0) hi = mid; else lo = mid; } return -(lo + hi) / 2; }
  // a titration's pH. acid {type: 'strong'|'weak'|'diprotic'|'weakbase', Ka (or Kas), Kb, C (M), V (mL)}, titrant C (M), Vb (mL)
  function titrPH(a, Ct, Vb) {
    var Va = a.V / 1000, Vt = Va + Vb / 1000, Kw = 1e-14, CA = a.C * Va / Vt, CB = Ct * Vb / 1000 / Vt;
    if (a.type === 'weakbase') { var Kab = Kw / a.Kb; return phSolve(function (h) { return h + CA * h / (h + Kab) - Kw / h - CB; }); } // B + HCl: [H+] + [BH+] = [OH-] + [Cl-]
    if (a.type === 'strongbase') return phSolve(function (h) { return h + CA - Kw / h - CB; });
    if (a.type === 'diprotic') { var K1 = a.Kas[0], K2 = a.Kas[1]; return phSolve(function (h) { var D = h * h + K1 * h + K1 * K2; return h + CB - Kw / h - CA * (K1 * h + 2 * K1 * K2) / D; }); }
    if (a.type === 'weak') return phSolve(function (h) { return h + CB - Kw / h - CA * a.Ka / (a.Ka + h); });
    return phSolve(function (h) { return h + CB - Kw / h - CA; });
  }
  // ch-titration: options are documented at the top of this file
  R('ch-titration', function (elx, o) {
    o = opt(o, { acid: { type: 'weak', Ka: 1.8e-5, C: 0.100, V: 25.0 }, base: { C: 0.100 }, vol: 12.5, ind: 'phenolphthalein', show: ['landmarks', 'species', 'indicator'], mode: 'acidbase' });
    var quiet = !!(o.quiet || o.readout === false), show = {}; (o.show || []).forEach(function (x) { show[x] = 1; });
    var a = Object.assign({ type: 'weak', C: 0.1, V: 25 }, o.acid); if (a.pKa != null) { if (Array.isArray(a.pKa)) a.Kas = a.pKa.map(function (p) { return M.pow(10, -p); }); else a.Ka = M.pow(10, -a.pKa); } if (a.type === 'diprotic' && !a.Kas) a.Kas = [M.pow(10, -2.0), M.pow(10, -7.0)]; if (a.type === 'weak' && !a.Ka) a.Ka = 1.8e-5; if (a.type === 'weakbase' && !a.Kb) a.Kb = 1.8e-5; a.C = num(a.C, 0.1); a.V = num(a.V, 25);
    var Ct = num(o.base.C, 0.1), nEq = a.type === 'diprotic' ? 2 : 1, Veq = a.C * a.V * nEq / Ct, redox = o.mode === 'redox', S = { v: clamp(num(o.vol, Veq / 2), 0, Veq * 2) }, Vmax = Veq * 2;
    var F = frame(elx, o, redox ? 'A redox titration' : 'A titration curve'), c = F.canvas({ aspect: 1.75, min: 300, max: 440, narrow: 0.95 }), Ch;
    var titrant = a.type === 'weakbase' ? 'HCl' : 'NaOH', analyte = a.type === 'weakbase' ? 'weak base' : a.type === 'strong' ? 'strong acid (HCl)' : a.type === 'diprotic' ? 'diprotic acid' : 'weak acid';
    function pH(v) { return titrPH(a, Ct, v); }
    function draw() {
      var ctx = c.ctx, k = pal(), wide = c.w >= 560, apW = wide ? 110 : 0; ctx.clearRect(0, 0, c.w, c.h);
      if (redox) return drawRedox(ctx, k, apW);
      var sub = { w: c.w - apW, h: c.h }; Ch = chart(sub, { x: [0, Vmax], y: [0, 14], xl: 'Volume of ' + titrant + ' added (mL)', yl: 'pH', ml: 40, yt: 2 }); ctx.save(); ctx.translate(apW, 0); Ch.draw(ctx);
      if (show.indicator && INDS[o.ind] && INDS[o.ind].lo) { ctx.fillStyle = rgba(k.gold, 0.18); ctx.fillRect(Ch.box().x0, Ch.Y(INDS[o.ind].hi), Ch.box().x1 - Ch.box().x0, Ch.Y(INDS[o.ind].lo) - Ch.Y(INDS[o.ind].hi)); var leftSide = M.abs(pH(0) - INDS[o.ind].hi - 0.4) >= M.abs(pH(Vmax) - INDS[o.ind].hi - 0.4); txt(ctx, INDS[o.ind].name + ' changes here', leftSide ? Ch.box().x0 + 4 : Ch.box().x1 - 4, Ch.Y(INDS[o.ind].hi) - 7, { size: 10, align: leftSide ? 'left' : 'right', color: k.gold, bold: true }); }
      Ch.curve(ctx, pH, 0, Vmax, k.acc, 2.8, null, 400);
      if (show.landmarks) { var lm = [[0, 'start']]; if (a.type === 'weak' || a.type === 'weakbase') lm.push([Veq / 2, 'half-equivalence: pH = pKa']); if (a.type === 'diprotic') { lm.push([Veq / 4, 'pH = pKa₁']); lm.push([Veq / 2, '1st equivalence']); lm.push([Veq * 3 / 4, 'pH = pKa₂']); } lm.push([Veq, 'equivalence']); var placedL = []; lm.forEach(function (L) { var x = Ch.X(L[0]), y = Ch.Y(pH(L[0])); ctx.fillStyle = k.gold; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, TAU); ctx.fill(); if (quiet) return; var lt = L[1] + ' (' + fm(pH(L[0]), 2) + ')', mw = M.max(70, Ch.box().x1 - x - 9), nl = wrapL(ctx, lt, mw, 10).length, lw = M.min(mw, tw(ctx, lt, 10)), ly = y + (L[1] === 'start' ? -10 - (nl - 1) * 12 : 12), hit = function () { return placedL.some(function (r) { return x + 7 < r[0] + r[2] && r[0] < x + 7 + lw && ly - 7 < r[1] + r[3] && r[1] < ly - 7 + nl * 12; }); }; for (var tr = 0; tr < 5 && hit(); tr++) ly += 13; placedL.push([x + 7, ly - 7, lw, nl * 12]); txtw(ctx, lt, x + 7, ly, mw, { size: 10, color: k.ink, lh: 12 }); }); if (!quiet) { line(ctx, [[Ch.X(Veq), Ch.box().y0], [Ch.X(Veq), Ch.box().y1]], k.gold, 1, [4, 4]); txt(ctx, fm(Veq, 2) + ' mL', Ch.X(Veq) + 3, Ch.box().y1 - 8, { size: 10, color: k.gold, bold: true }); } }
      var y = Ch.Y(pH(S.v)); knob(ctx, Ch.X(S.v), y, k.ink, 7); H.draw(ctx, apW); if (!quiet) pill(ctx, 'pH ' + fm(pH(S.v), 2), Ch.X(S.v), y - 20, { size: 11, clampW: c.w - apW });
      ctx.restore(); if (wide) drawApparatus(ctx, k, 0, 0, apW, c.h, indRGB(o.ind, pH(S.v)));
    }
    function drawApparatus(ctx, k, x, y, w, h, col, label) { var bx = x + w / 2, top = 10, bh = h * 0.5, frac = clamp(S.v / (Vmax * 1.1), 0, 1); ctx.fillStyle = k.glass; ctx.fillRect(bx - 7, top, 14, bh); ctx.strokeStyle = k.glassLine; ctx.strokeRect(bx - 7, top, 14, bh); ctx.fillStyle = redox ? 'rgba(130,40,150,.75)' : k.water; ctx.fillRect(bx - 6, top + bh * frac, 12, bh * (1 - frac)); line(ctx, [[bx, top + bh], [bx, top + bh + 14]], k.glassLine, 2); var fy = top + bh + 22, fw = w * 0.8; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(bx - 10, fy); ctx.lineTo(bx - fw / 2, h - 18); ctx.lineTo(bx + fw / 2, h - 18); ctx.lineTo(bx + 10, fy); ctx.closePath(); ctx.fill(); ctx.strokeStyle = k.glassLine; ctx.lineWidth = 2; ctx.stroke(); txt(ctx, fm(S.v, 2) + ' mL', bx + 10, top + 8, { size: 10, color: k.ink }); }
    function drawRedox(ctx, k, apW) { // Fe2+ with MnO4-: the purple color stays once all the Fe2+ is used
      var nFe = a.C * a.V / 1000, nMn = Ct * S.v / 1000, VeqR = nFe / 5 / Ct * 1000, sub = { w: c.w - apW, h: c.h }; Vmax = VeqR * 2; Ch = chart(sub, { x: [0, Vmax], y: [0, nFe * 1000 * 1.1], xl: 'Volume of KMnO₄ added (mL)', yl: 'mmol', ml: 46 }); ctx.save(); ctx.translate(apW, 0); Ch.draw(ctx);
      Ch.curve(ctx, function (v) { return M.max(0, nFe - 5 * Ct * v / 1000) * 1000; }, 0, Vmax, k.acc, 2.6); Ch.curve(ctx, function (v) { return M.max(0, Ct * v / 1000 - nFe / 5) * 1000; }, 0, Vmax, k.purple, 2.6, [6, 4]);
      txt(ctx, 'Fe²⁺ left', Ch.X(VeqR * 0.2), Ch.Y((nFe - 5 * Ct * VeqR * 0.2 / 1000) * 1000) - 10, { size: 11, color: k.acc, bold: true }); txt(ctx, 'extra MnO₄⁻ (purple)', Ch.X(VeqR * 1.3), Ch.Y((Ct * VeqR * 1.3 / 1000 - nFe / 5) * 1000) - 10, { size: 11, color: k.purple, bold: true });
      if (!quiet) { line(ctx, [[Ch.X(VeqR), Ch.box().y0], [Ch.X(VeqR), Ch.box().y1]], k.gold, 1, [4, 4]); txt(ctx, 'endpoint ' + fm(VeqR, 2) + ' mL', Ch.X(VeqR) + 4, Ch.box().y0 + 10, { size: 10, color: k.gold, bold: true }); }
      knob(ctx, Ch.X(S.v), Ch.Y(M.max(0, nFe - 5 * nMn) * 1000), k.ink, 7); ctx.restore(); if (c.w >= 560) drawApparatus(ctx, k, 0, 0, apW, c.h, nMn > nFe / 5 + 1e-9 ? 'rgba(150,40,160,' + clamp((nMn - nFe / 5) / (nFe / 5) * 4, 0.15, 0.8) + ')' : 'rgba(240,230,170,.5)');
    }
    function report() {
      var s; if (redox) { var nFe = a.C * a.V / 1000, nMn = Ct * S.v / 1000, VeqR = nFe / 5 / Ct * 1000; s = quiet ? 'Each MnO₄⁻ takes 5 electrons, one from each of 5 Fe²⁺.' : fm(S.v, 2) + ' mL added: ' + fm(nMn * 1000, 3) + ' mmol MnO₄⁻ takes ' + fm(5 * nMn * 1000, 3) + ' mmol of electrons from Fe²⁺ (5 per MnO₄⁻). Endpoint at ' + fm(VeqR, 2) + ' mL, when the purple color first stays: moles MnO₄⁻ = moles Fe²⁺ ÷ 5.'; }
      else { var p = pH(S.v), ha = a.C * a.V / 1000, ad = Ct * S.v / 1000; s = quiet ? 'Titrating a ' + analyte + '. Watch how the pH changes as titrant is added.' : fm(S.v, 2) + ' mL of ' + fm(Ct, 3) + ' M ' + titrant + ' added: pH ' + fm(p, 2) + '. Equivalence at ' + fm(Veq, 2) + ' mL, pH ' + fm(pH(Veq), 2) + (a.type === 'weak' ? ' (above 7: the acetate-like ions left over are a weak base). At half-equivalence pH = pKa = ' + fm(-log10(a.Ka), 2) + '.' : a.type === 'weakbase' ? ' (below 7: the conjugate acid is left over). At half-equivalence pH = 14 − pKb = ' + fm(14 + log10(a.Kb), 2) + '.' : a.type === 'diprotic' ? '; two jumps, one for each proton.' : ' (7.00 for a strong acid with a strong base).');
        if (show.species && (a.type === 'weak' || a.type === 'strong')) { var h = M.pow(10, -p), Vt = (a.V + S.v) / 1000, Aminus = ha * a.Ka / (a.Ka + h); s += ' In the flask: ' + (a.type === 'weak' ? 'HA ' + sf(M.max(0, ha - Aminus) * 1000, 3) + ' mmol, A⁻ ' + sf(Aminus * 1000, 3) + ' mmol, ' : 'Cl⁻ ' + sf(ha * 1000, 3) + ' mmol, Na⁺ ' + sf(ad * 1000, 3) + ' mmol, ') + 'H₃O⁺ ' + sci(h * Vt * 1000, 2, true) + ' mmol, OH⁻ ' + sci(1e-14 / h * Vt * 1000, 2, true) + ' mmol.'; } }
      F.say(s); F.setAlt(redox ? 'A redox titration graph of iron(II) left and permanganate in excess against volume added.' : 'A titration curve of pH against volume of ' + titrant + ' added for a ' + analyte + '.');
    }
    var vsl = null;
    var H = hand(c, F.edit ? [{ get: function () { return Ch ? [(c.w >= 560 ? 110 : 0) + Ch.X(S.v), redox ? 0 : Ch.Y(pH(S.v))] : null; }, set: function (px) { S.v = clamp(Ch.x(px - (c.w >= 560 ? 110 : 0)), 0, Vmax); if (vsl) vsl.set(S.v); report(); }, key: function (dx) { S.v = clamp(S.v + dx * Vmax / 100, 0, Vmax); if (vsl) vsl.set(S.v); report(); } }] : [], { change: draw });
    var H0 = H.draw; H.draw = function (ctx, off) { ctx.save(); ctx.translate(-(off || 0), 0); H0(ctx); ctx.restore(); };
    if (F.edit) vsl = sl(F.ctl, { label: 'Volume added', min: 0, max: Vmax, step: 0.05, value: S.v, fmt: function (v) { return fm(v, 2) + ' mL'; }, input: function (v) { S.v = v; draw(); report(); } });
    var A = anim(elx, function (dt) { S.v = M.min(Vmax, S.v + dt * Vmax / 12); if (vsl) vsl.set(S.v); draw(); report(); if (S.v >= Vmax) { A.stop(); pb.sync(); } }, false), pb = F.edit ? playBtn(F.ctl, A, function (on) { if (on && S.v >= Vmax) S.v = 0; }) : null;
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  CH.titrPH = titrPH; CH.phSolve = phSolve;

  // =====================================================================================================
  // ch-buffer: options are documented at the top of this file
  R('ch-buffer', function (elx, o) {
    o = opt(o, { pKa: null, acid: 'CH3COOH', nHA: 0.10, nA: 0.10, V: 1.0, adds: 0.01, mode: 'bars', water: true, pH: null });
    var Ka = o.pKa != null ? M.pow(10, -num(o.pKa, 4.74)) : (ACIDS[o.acid] && ACIDS[o.acid].Ka) || 1.8e-5, pKa = -log10(Ka), quiet = !!(o.quiet || o.readout === false);
    var S = { HA: num(o.nHA, 0.1), A: num(o.nA, 0.1), add: 0, pHm: o.pH != null ? num(o.pH, pKa) : pKa }, V2 = num(o.V, 1), step = num(o.adds, 0.01), Ct = S.HA + S.A, Na0 = S.A;
    var F = frame(elx, o, o.mode === 'species' ? 'Which form wins: HA or A⁻?' : o.mode === 'capacity' ? 'Buffer capacity' : 'A buffer soaks up added acid and base'), c = F.canvas({ aspect: 1.9, min: 270, max: 400, narrow: 1.0 });
    function bufPH() { var Na = Na0 + S.add; if (Na > 1e-12 && Na < Ct - 1e-12) return pKa + log10(Na / (Ct - Na)); return phSolve(function (h) { return h + Na / V2 - 1e-14 / h - Ct / V2 * Ka / (Ka + h); }); } // S.add: net strong base added (mol); negative = acid
    function waterPH() { return S.add >= 0 ? 14 + log10(M.max(1e-7, (S.add + M.sqrt(S.add * S.add + 4e-14 * V2 * V2)) / 2 / V2)) : -log10((-S.add + M.sqrt(S.add * S.add + 4e-14 * V2 * V2)) / 2 / V2); }
    function cur() { var Na = Na0 + S.add; return { HA: M.max(0, Ct - Na), A: M.min(Ct, M.max(0, Na)), xs: Na < 0 ? -Na : Na > Ct ? Na - Ct : 0, xsKind: Na < 0 ? 'H₃O⁺' : 'OH⁻' }; }
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      if (o.mode === 'species') { var Ch = chart(c, { x: [0, 14], y: [0, 1.05], xl: 'pH', yl: 'Fraction', ml: 46, xt: 2 }); Ch.draw(ctx); Ch.curve(ctx, function (p) { var h = M.pow(10, -p); return h / (h + Ka); }, 0, 14, k.red, 2.8); Ch.curve(ctx, function (p) { var h = M.pow(10, -p); return Ka / (h + Ka); }, 0, 14, k.blue, 2.8); txt(ctx, 'HA', Ch.X(M.max(0.5, pKa - 3)), Ch.Y(0.95) - 8, { size: 13, bold: true, color: k.red }); txt(ctx, 'A⁻', Ch.X(M.min(13, pKa + 3)), Ch.Y(0.95) - 8, { size: 13, bold: true, color: k.blue }); line(ctx, [[Ch.X(pKa), Ch.Y(0)], [Ch.X(pKa), Ch.Y(0.5)]], k.gold, 1.2, [4, 4]); if (!quiet) txt(ctx, 'pKa ' + fm(pKa, 2), Ch.X(pKa) + 4, Ch.Y(0.5) + 12, { size: 10, color: k.gold, bold: true }); var hm = M.pow(10, -S.pHm); line(ctx, [[Ch.X(S.pHm), Ch.box().y0], [Ch.X(S.pHm), Ch.box().y1]], k.ink, 2); knob(ctx, Ch.X(S.pHm), Ch.Y(Ka / (hm + Ka)), k.blue, 6); knob(ctx, Ch.X(S.pHm), Ch.Y(hm / (hm + Ka)), k.red, 6); HS.draw(ctx); S.Ch = Ch; return; }
      var C2 = cur(), wide = c.w >= 560, mx = Ct * 1.15, bx = 30, by = 24, bh = c.h - 70, bw = 46;
      [['HA', C2.HA, k.red], ['A⁻', C2.A, k.blue]].forEach(function (b, i) { var x = bx + i * (bw + 22), hh = b[1] / mx * bh; ctx.fillStyle = k.grid; ctx.fillRect(x, by, bw, bh); ctx.fillStyle = b[2]; ctx.fillRect(x, by + bh - hh, bw, hh); txt(ctx, b[0], x + bw / 2, by + bh + 14, { size: 13, bold: true, align: 'center', color: b[2] }); txt(ctx, sf(b[1], 3) + ' mol', x + bw / 2, by + bh + 30, { size: 10, align: 'center' }); });
      if (C2.xs > 1e-12) txt(ctx, 'extra ' + C2.xsKind + ': ' + sf(C2.xs, 2) + ' mol', bx, by - 10, { size: 11, bold: true, color: k.red });
      var gx = bx + 2 * (bw + 22) + 20, p1 = bufPH(), p2 = waterPH(), gw2 = c.w - gx - 20, X = function (p) { return gx + p / 14 * gw2; };
      [['buffer', p1, by + 30], o.water !== false ? ['plain water', p2, by + 100] : null].forEach(function (r) { if (!r) return; for (var i = 0; i < 70; i++) { ctx.fillStyle = indRGB('universal', i / 5 + 0.1); ctx.fillRect(X(i / 5), r[2], gw2 / 70 + 1, 16); } txt(ctx, r[0], gx, r[2] - 9, { size: 12, bold: true, color: k.ink }); var px = X(clamp(r[1], 0, 14)); ctx.fillStyle = k.ink; ctx.beginPath(); ctx.moveTo(px, r[2] + 18); ctx.lineTo(px - 7, r[2] + 30); ctx.lineTo(px + 7, r[2] + 30); ctx.closePath(); ctx.fill(); if (!quiet) txt(ctx, 'pH ' + fm(r[1], 2), px, r[2] + 40, { size: 11, bold: true, align: 'center', color: k.ink }); });
      [0, 7, 14].forEach(function (q) { txt(ctx, String(q), X(q), by + 30 + 24, { size: 9, align: 'center' }); });
      if (o.mode === 'capacity' && !quiet) { var r0 = S.A / S.HA, up = (10 * r0 * S.HA - S.A) / (1 + 10 * r0), dn = (S.A - r0 * S.HA / 10) / (1 + r0 / 10); if (c.w - gx - 6 < tw(ctx, 'to raise the pH by 1: ' + sf(up, 3) + ' mol OH⁻', 12, true)) { ['to raise the pH by 1:', sf(up, 3) + ' mol OH⁻', 'to lower it by 1:', sf(dn, 3) + ' mol H₃O⁺'].forEach(function (t, j) { txt(ctx, t, gx, c.h - 62 + j * 15 + (j > 1 ? 4 : 0), { size: 11, color: k.ink, bold: j % 2 === 1 }); }); } else { txt(ctx, 'to raise the pH by 1: ' + sf(up, 3) + ' mol OH⁻', gx, c.h - 34, { size: 12, color: k.ink, bold: true }); txt(ctx, 'to lower it by 1: ' + sf(dn, 3) + ' mol H₃O⁺', gx, c.h - 14, { size: 12, color: k.ink, bold: true }); } }
    }
    function report() {
      var s; if (o.mode === 'species') { var h = M.pow(10, -S.pHm), fa = Ka / (h + Ka); s = quiet ? 'Compare the two curves at the marked pH.' : 'At pH ' + fm(S.pHm, 2) + ': ' + fm((1 - fa) * 100, 1) + '% HA and ' + fm(fa * 100, 1) + '% A⁻. ' + (S.pHm < pKa ? 'Below the pKa, the acid form HA wins.' : S.pHm > pKa ? 'Above the pKa, the base form A⁻ wins.' : 'At the pKa they are equal.') + ' The curves cross at 50% when pH = pKa = ' + fm(pKa, 2) + '.'; }
      else { var C2 = cur(), p = bufPH(); s = quiet ? 'Added so far: ' + (S.add >= 0 ? sf(S.add, 2) + ' mol OH⁻' : sf(-S.add, 2) + ' mol H₃O⁺') + '.' : (S.add === 0 ? '' : 'Added ' + (S.add > 0 ? sf(S.add, 2) + ' mol OH⁻: OH⁻ + HA → A⁻ + H₂O' : sf(-S.add, 2) + ' mol H₃O⁺: H₃O⁺ + A⁻ → HA + H₂O') + ' happens first. ') + (C2.HA > 0 && C2.A > 0 ? 'Then pH = pKa + log(A⁻/HA) = ' + fm(pKa, 2) + ' + log(' + sf(C2.A, 3) + '/' + sf(C2.HA, 3) + ') = <b>' + fm(p, 2) + '</b>.' : 'The buffer is used up: pH ' + fm(p, 2) + ' from what is left over.') + (o.water !== false ? ' The same additions to plain water: pH ' + fm(waterPH(), 2) + '.' : '') + ' A buffer resists changes in pH; it does not freeze it.'; }
      F.say(s); F.setAlt(o.mode === 'species' ? 'Fractions of HA and A⁻ against pH, crossing at the pKa.' : 'Bars for the moles of HA and A⁻ beside pH scales for the buffer and for plain water.');
    }
    var HS = { draw: function () { } };
    if (o.mode === 'species') { HS = hand(c, F.edit ? [{ get: function () { return S.Ch ? [S.Ch.X(S.pHm), S.Ch.Y(0.5)] : null; }, set: function (px) { S.pHm = clamp(S.Ch.x(px), 0, 14); report(); }, key: function (dx) { S.pHm = clamp(S.pHm + dx * 0.1, 0, 14); report(); } }] : [], { change: draw, r: 40 }); }
    else if (F.edit) { btn(F.ctl, 'Add H⁺ (' + fm(step, 3) + ' mol)', function () { S.add -= step; draw(); report(); }); btn(F.ctl, 'Add OH⁻ (' + fm(step, 3) + ' mol)', function () { S.add += step; draw(); report(); }); btn(F.ctl, 'Reset', function () { S.add = 0; draw(); report(); }); }
    redraw(c, draw); draw(); report(); return { draw: draw };
  });

  // =====================================================================================================
  // ch-equilibrium: options are documented at the top of this file
  var EQP = { 'A<=>B': { a: [['A', 1]], b: [['B', 1]], kf: 0.30, kr: 0.10, dH: 0, c0: { A: 1.0 } }, 'A+B<=>C+D': { a: [['A', 1], ['B', 1]], b: [['C', 1], ['D', 1]], kf: 0.50, kr: 0.125, dH: 0, c0: { A: 1.0, B: 1.0 } },
    'N2+3H2<=>2NH3': { a: [['N2', 1], ['H2', 3]], b: [['NH3', 2]], kf: 0.08, kr: 0.05, dH: -92, c0: { N2: 1.0, H2: 3.0 } }, '2NO2<=>N2O4': { a: [['NO2', 2]], b: [['N2O4', 1]], kf: 0.6, kr: 0.12, dH: -57, c0: { NO2: 1.0 } } };
  function eqRun(R0, c0, events, tmax) { // RK4; returns {ts, cs: [{sp: conc}], rf, rr, segs: [{t0, c0, kf, kr}]}
    var sp = R0.a.map(function (x) { return x[0]; }).concat(R0.b.map(function (x) { return x[0]; })), nu = R0.a.map(function (x) { return -x[1]; }).concat(R0.b.map(function (x) { return x[1]; }));
    var c = sp.map(function (s) { return num(c0[s], 0); }), kf = R0.kf, kr = R0.kr, T = 298, out = { sp: sp, ts: [], cs: [], rf: [], rr: [], segs: [], ev: [] }, dt = 0.02, t = 0, ei = 0, evs = (events || []).slice().sort(function (p, q) { return p.t - q.t; });
    function rates(cc) { var f = kf, r = kr; R0.a.forEach(function (x, i) { f *= M.pow(M.max(cc[i], 0), x[1]); }); R0.b.forEach(function (x, j) { r *= M.pow(M.max(cc[R0.a.length + j], 0), x[1]); }); return [f, r]; }
    function deriv(cc) { var r = rates(cc), net = r[0] - r[1]; return nu.map(function (v) { return v * net; }); }
    out.segs.push({ t0: 0, c: c.slice(), kf: kf, kr: kr, T: T });
    while (t <= tmax + 1e-9) {
      while (ei < evs.length && evs[ei].t <= t + 1e-9) { var e = evs[ei++], idx = sp.indexOf(e.sp);
        if (e.type === 'add' && idx >= 0) c[idx] += num(e.amt, 0.5); else if (e.type === 'remove' && idx >= 0) c[idx] = M.max(0, c[idx] - num(e.amt, 0.5)); else if (e.type === 'volume') { var f = 1 / num(e.amt, 0.5); c = c.map(function (x) { return x * f; }); }
        else if (e.type === 'temp') { var T2 = num(e.amt, 350), Ef = 50, Er = 50 - R0.dH; kf *= M.exp(-Ef * 1000 / K.R * (1 / T2 - 1 / T)); kr *= M.exp(-Er * 1000 / K.R * (1 / T2 - 1 / T)); T = T2; } else if (e.type === 'catalyst') { kf *= 5; kr *= 5; }
        out.segs.push({ t0: t, c: c.slice(), kf: kf, kr: kr, T: T, e: e }); out.ev.push({ t: t, e: e }); }
      if (M.round(t / dt) % 5 === 0) { var r2 = rates(c); out.ts.push(t); out.cs.push(c.slice()); out.rf.push(r2[0]); out.rr.push(r2[1]); }
      var k1 = deriv(c), k2 = deriv(c.map(function (x, i) { return x + dt / 2 * k1[i]; })), k3 = deriv(c.map(function (x, i) { return x + dt / 2 * k2[i]; })), k4 = deriv(c.map(function (x, i) { return x + dt * k3[i]; }));
      c = c.map(function (x, i) { return M.max(0, x + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])); }); t += dt;
    }
    return out;
  }
  function eqSolve(R0, c0, kf, kr) { // the extent x at equilibrium: Q(x) = K, by bisection between the limits
    var K2 = kf / kr, a = R0.a, b = R0.b, lo = -1e9, hi = 1e9; a.forEach(function (x) { hi = M.min(hi, num(c0[x[0]], 0) / x[1]); }); b.forEach(function (x) { lo = M.max(lo, -num(c0[x[0]], 0) / x[1]); });
    function g(x) { var num2 = 1, den = 1; b.forEach(function (y) { num2 *= M.pow(num(c0[y[0]], 0) + y[1] * x, y[1]); }); a.forEach(function (y) { den *= M.pow(num(c0[y[0]], 0) - y[1] * x, y[1]); }); return M.log(num2 + 1e-300) - M.log(den + 1e-300) - M.log(K2); }
    var x = bisect(g, lo + 1e-12, hi - 1e-12, 200), out = {}; a.forEach(function (y) { out[y[0]] = num(c0[y[0]], 0) - y[1] * x; }); b.forEach(function (y) { out[y[0]] = num(c0[y[0]], 0) + y[1] * x; }); out._x = x; return out;
  }
  function qOf(R0, c) { var n = 1, d = 1; R0.b.forEach(function (y) { n *= M.pow(M.max(c[y[0]] || 0, 0), y[1]); }); R0.a.forEach(function (y) { d *= M.pow(M.max(c[y[0]] || 0, 0), y[1]); }); return d > 0 ? n / d : Infinity; }
  R('ch-equilibrium', function (elx, o) {
    o = opt(o, { rxn: 'A<=>B', c0: null, events: null, show: ['rates', 'Q', 'ice', 'particles'] });
    var R0 = typeof o.rxn === 'object' ? o.rxn : (EQP[String(o.rxn).replace(/\s/g, '')] || EQP['A<=>B']), c0 = o.c0 || R0.c0 || {}, quiet = !!(o.quiet || o.readout === false), show = {}; (o.show || []).forEach(function (x) { show[x] = 1; });
    R0.dH = num(R0.dH, 0);
    var name = R0.a.map(function (x) { return (x[1] > 1 ? x[1] : '') + x[0]; }).join(' + ') + ' ⇌ ' + R0.b.map(function (x) { return (x[1] > 1 ? x[1] : '') + x[0]; }).join(' + ');
    var F = frame(elx, o, 'Approach to equilibrium: ' + fT(name)), evs = (o.events || []).slice(), win = 10 / (R0.kf + R0.kr) / (R0.a.length > 1 || R0.a[0][1] > 1 ? 1.5 : 1), tmax = win * (1 + evs.length) + (evs.length ? 0 : 0), run, S = { now: V.reduced ? 1 : 0.999 };
    function simulate() { tmax = M.max(win * 1.2, evs.length ? evs[evs.length - 1].t + win : win * 1.2); run = eqRun(R0, c0, evs, tmax); }
    simulate();
    var c = F.canvas({ aspect: 1.7, min: 320, max: 460, narrow: 0.75 }), iceEl = show.ice ? F.html('chv-tbl') : null, cols = ['acc', 'blue', 'green', 'orange'];
    function last() { var i = run.ts.length - 1, cc = {}; run.sp.forEach(function (s, j) { cc[s] = run.cs[i][j]; }); return cc; }
    function draw() {
      var ctx = c.ctx, k = pal(), wide = c.w >= 560; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var mainH = show.rates ? c.h * 0.62 : c.h, sideW = wide && (show.particles || show.Q) ? 170 : 0, cmax = 0; run.cs.forEach(function (r) { r.forEach(function (v) { cmax = M.max(cmax, v); }); });
      var tNow = run.ts[run.ts.length - 1] * S.now, sub = { w: c.w - sideW, h: mainH }, Ch = chart(sub, { x: [0, run.ts[run.ts.length - 1]], y: [0, cmax * 1.12], xl: 'time', yl: 'concentration (M)', ml: 46, mb: 32 }); Ch.draw(ctx);
      var endL = []; run.sp.forEach(function (s, j) { var pts = []; run.ts.forEach(function (t, i) { if (t <= tNow) pts.push([t, run.cs[i][j]]); }); Ch.path(ctx, pts, k[cols[j % 4]], 2.6); var lp = pts[pts.length - 1]; if (lp) endL.push({ s: s, j: j, x: Ch.X(lp[0]) - 4, y: Ch.Y(lp[1]) - 9 }); }); endL.sort(function (p2, q2) { return p2.y - q2.y; }); for (var ei = 1; ei < endL.length; ei++) if (endL[ei].y - endL[ei - 1].y < 14) endL[ei].y = endL[ei - 1].y + 14; endL.forEach(function (L) { fDraw(ctx, L.s, L.x, L.y, { size: 11, align: 'right', color: k[cols[L.j % 4]], bold: true }); });
      run.ev.forEach(function (ev) { line(ctx, [[Ch.X(ev.t), Ch.box().y0], [Ch.X(ev.t), Ch.box().y1]], k.gold, 1.2, [4, 4]); txt(ctx, evLabel(ev.e), Ch.X(ev.t) + 4, Ch.box().y0 + 10, { size: 10, color: k.gold, bold: true }); });
      if (show.rates) { var sub2 = { w: c.w - sideW, h: c.h - mainH }, rmax = 0; run.rf.forEach(function (v, i) { rmax = M.max(rmax, v, run.rr[i]); }); var C2 = chart(sub2, { x: [0, run.ts[run.ts.length - 1]], y: [0, rmax * 1.1], xl: '', yl: 'rate', ml: 46, mb: 18, mt: 6, xticks: false, yticks: false }); ctx.save(); ctx.translate(0, mainH); C2.draw(ctx); var pf = [], pr = []; run.ts.forEach(function (t, i) { if (t <= tNow) { pf.push([t, run.rf[i]]); pr.push([t, run.rr[i]]); } }); C2.path(ctx, pf, k.red, 2); C2.path(ctx, pr, k.blue, 2, [6, 4]); if (C2.box().x1 - C2.box().x0 < 380) { txt(ctx, 'forward rate', C2.box().x1 - 4, C2.box().y0 + 8, { size: 10, color: k.red, bold: true, align: 'right' }); txt(ctx, 'reverse rate (dashed)', C2.box().x1 - 4, C2.box().y0 + 21, { size: 10, color: k.blue, bold: true, align: 'right' }); txt(ctx, 'they become equal, not zero', C2.box().x1 - 4, C2.box().y0 + 34, { size: 10, color: k.ink, align: 'right' }); } else { txt(ctx, 'forward rate', C2.box().x0 + 6, C2.box().y0 + 8, { size: 10, color: k.red, bold: true }); txt(ctx, 'reverse rate (dashed): they become equal, not zero', C2.box().x0 + 90, C2.box().y0 + 8, { size: 10, color: k.blue, bold: true }); } ctx.restore(); }
      if (sideW) { var x0 = c.w - sideW + 10, cc = last(), Kv = run.segs[run.segs.length - 1].kf / run.segs[run.segs.length - 1].kr, Qv = qOf(R0, curAt(tNow));
        if (show.Q) { var gy = 24, gw = sideW - 20, lo = log10(Kv) - 3, hi = log10(Kv) + 3, Xg = function (v) { return x0 + clamp((log10(v) - lo) / (hi - lo), 0, 1) * gw; }; txt(ctx, 'Q compared with K', x0, gy - 12, { size: 11, bold: true, color: k.ink }); ctx.fillStyle = k.grid; rr(ctx, x0, gy, gw, 10, 5); ctx.fill(); line(ctx, [[Xg(Kv), gy - 4], [Xg(Kv), gy + 14]], k.ink, 2.5); txt(ctx, 'K', Xg(Kv), gy + 24, { size: 11, bold: true, align: 'center', color: k.ink }); if (isFinite(Qv)) { ctx.fillStyle = k.acc; ctx.beginPath(); ctx.arc(Xg(Qv), gy + 5, 6, 0, TAU); ctx.fill(); } txt(ctx, 'Q', isFinite(Qv) ? Xg(Qv) : x0 + gw, gy - 3 - 6, { size: 11, bold: true, align: 'center', color: k.acc }); if (!quiet) txt(ctx, M.abs(log10(Qv / Kv)) < 0.02 ? 'Q = K: at equilibrium' : Qv < Kv ? 'Q < K: toward products' : 'Q > K: toward reactants', x0, gy + 40, { size: 10, color: k.acc, bold: true }); }
        if (show.particles) { var py = show.Q ? 80 : 10, ph = mainH - py - 10; panel(ctx, x0, py, sideW - 20, ph, { r: 8, fill: R0.a[0][0] === 'NO2' ? 'rgba(160,82,45,' + clamp((curAt(tNow).NO2 || 0) * 0.35, 0.05, 0.45) + ')' : null }); var r2 = rng(3), cur2 = curAt(tNow); run.sp.forEach(function (s, j) { var n = M.round((cur2[s] || 0) * 8), real = parseF(s).ok && !/^[A-D]$/.test(s); for (var q = 0; q < n; q++) { var px = x0 + 8 + r2() * (sideW - 36), py2 = py + 8 + r2() * (ph - 16); if (real) drawMol(ctx, s, px, py2, 5, { rot: r2() * 6 }); else ball(ctx, px, py2, 5, s, { color: k[cols[j % 4]] }); } }); txt(ctx, 'particles (8 per M)', x0, py + ph + 6, { size: 9 }); } }
      if (S.now < 0.999) line(ctx, [[Ch.X(tNow), Ch.box().y0], [Ch.X(tNow), Ch.box().y1]], k.muted, 1);
    }
    function curAt(t) { var i = 0; while (i < run.ts.length - 1 && run.ts[i + 1] <= t) i++; var cc = {}; run.sp.forEach(function (s, j) { cc[s] = run.cs[i][j]; }); return cc; }
    function evLabel(e) { return { add: 'add ' + (e.sp || ''), remove: 'remove ' + (e.sp || ''), volume: num(e.amt, 0.5) < 1 ? 'squeeze' : 'expand', temp: num(e.amt, 350) > (e._T0 || 298) ? 'heat' : 'cool', catalyst: 'catalyst', inert: 'inert gas' }[e.type] || e.type; }
    function report() {
      var seg = run.segs[run.segs.length - 1], Kv = seg.kf / seg.kr, eqc = eqSolve(R0, (function () { var cc = {}; run.sp.forEach(function (s, j) { cc[s] = seg.c[j]; }); return cc; })(), seg.kf, seg.kr), lastE = run.ev.length ? run.ev[run.ev.length - 1].e : null;
      var s = quiet ? 'The concentrations change until the forward and reverse rates are equal.' : 'K = ' + sf(Kv, 3) + ' (a model value). At equilibrium: ' + run.sp.map(function (sp2) { return '[' + fH(sp2) + '] = ' + sf(eqc[sp2], 3) + ' M'; }).join(', ') + '. Both reactions keep going at equal rates: the equilibrium is dynamic, and the amounts need not be equal.';
      if (lastE && !quiet) s += ' ' + ({ add: 'Adding ' + fH(lastE.sp || '') + ' made Q ' + (R0.b.some(function (y) { return y[0] === lastE.sp; }) ? '> K, so the reaction shifted back toward reactants' : '< K, so it shifted toward products') + ', using up part of what was added.', remove: 'Removing ' + fH(lastE.sp || '') + ' made the reaction shift to replace part of it.', volume: 'Changing the volume changed every concentration at once; the side with ' + (num(lastE.amt, 0.5) < 1 ? 'fewer' : 'more') + ' moles of gas is favored.', temp: 'Changing the temperature changed K itself (ΔH = ' + fm(R0.dH, 0) + ' kJ/mol): ' + (R0.dH < 0 ? 'heating an exothermic reaction lowers K.' : R0.dH > 0 ? 'heating an endothermic reaction raises K.' : 'with ΔH = 0, K does not change.'), catalyst: 'The catalyst sped up both directions equally: equilibrium arrives sooner, at the same place.', inert: 'An inert gas at constant volume changes no concentration, so nothing shifts.' }[lastE.type] || '') + ' The shift only partly undoes the change.';
      F.say(s); F.setAlt('Concentration against time for ' + fT(name) + (run.ev.length ? ', with a disturbance' : '') + ', and the forward and reverse rates meeting.');
      if (iceEl) { var start = run.segs[run.segs.length - 1], ci = {}; run.sp.forEach(function (sp2, j) { ci[sp2] = start.c[j]; }); var x = eqc._x; iceEl.innerHTML = tbl([run.ev.length ? 'ICE (from the last change)' : 'ICE'].concat(run.sp.map(fH)), [['Initial (M)'].concat(run.sp.map(function (sp2) { return sf(ci[sp2], 3); })), ['Change (M)'].concat(run.sp.map(function (sp2) { var y = R0.a.find(function (q) { return q[0] === sp2; }), z = R0.b.find(function (q) { return q[0] === sp2; }); var d = y ? -y[1] * x : z[1] * x; return quiet ? (y ? '−' + (y[1] > 1 ? y[1] : '') + 'x' : '+' + (z[1] > 1 ? z[1] : '') + 'x') : (d >= 0 ? '+' : '−') + sf(M.abs(d), 3); })), ['Equilibrium (M)'].concat(run.sp.map(function (sp2) { return quiet ? '?' : sf(eqc[sp2], 3); }))]); }
    }
    function addEvent(type, sp2, amt) { var t = run.ts[run.ts.length - 1]; var e = { t: t, type: type, sp: sp2, amt: amt }; if (type === 'temp') e._T0 = run.segs[run.segs.length - 1].T; evs.push(e); simulate(); S.now = V.reduced ? 1 : (run.ts[run.ts.length - 1] - win) / run.ts[run.ts.length - 1]; if (!V.reduced) A.play(); draw(); report(); }
    if (F.edit) {
      var r1 = R0.a[0][0], p1 = R0.b[0][0], gas = !!(BYS[r1] || /\d/.test(r1));
      btn(F.ctl, 'Add ' + fT(r1), function () { addEvent('add', r1, 0.5); }); btn(F.ctl, 'Remove some ' + fT(p1), function () { addEvent('remove', p1, 0.3); });
      if (gas || R0.a.length + R0.b.length > 2) btn(F.ctl, 'Halve the volume', function () { addEvent('volume', null, 0.5); });
      btn(F.ctl, 'Heat it', function () { addEvent('temp', null, run.segs[run.segs.length - 1].T + 50); }); btn(F.ctl, 'Add a catalyst', function () { addEvent('catalyst'); }); btn(F.ctl, 'Add an inert gas', function () { addEvent('inert'); });
      btn(F.ctl, 'Start over', function () { evs = (o.events || []).slice(); simulate(); S.now = V.reduced ? 1 : 0; if (!V.reduced) A.play(); draw(); report(); });
    }
    var A = anim(elx, function (dt) { S.now = M.min(1, S.now + dt / 6); draw(); if (S.now >= 1) A.stop(); }, false);
    if (!V.reduced && o.motion !== false) { S.now = 0; A.play(); }
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  CH.eqRun = eqRun; CH.eqSolve = eqSolve; CH.EQP = EQP;

  // =====================================================================================================
  // ch-microstates: options are documented at the top of this file
  R('ch-microstates', function (elx, o) {
    o = opt(o, { mode: 'gas', N: 10, q: 6, NA: 3, NB: 3, compare: 'count' });
    var mode = o.mode, quiet = !!(o.quiet || o.readout === false), F = frame(elx, o, mode === 'energy' ? 'Energy spreads toward the most arrangements' : mode === 'compare' ? 'Counting arrangements' : 'Particles spread toward the most arrangements'), rnd = rng(37);
    var c = F.canvas({ aspect: 1.9, min: 280, max: 400, narrow: 0.95 }), S = { open: false, t: 0, qA: clamp(M.round(num(o.q, 6)), 0, 30), hist: [] };
    var N = clamp(M.round(num(o.N, 10)), 2, 20), ps = [];
    function initGas() { ps = []; for (var i = 0; i < N; i++) { var v = vel(rnd, 60); ps.push({ x: rnd() * 0.45, y: rnd(), vx: v[0], vy: v[1] }); } S.open = false; }
    initGas();
    var NA = clamp(M.round(num(o.NA, 3)), 1, 10), NB = clamp(M.round(num(o.NB, 3)), 1, 10), q = S.qA, occ = [];
    function initE() { occ = []; for (var i = 0; i < NA + NB; i++) occ.push(0); for (var j = 0; j < q; j++) occ[j % NA]++; S.qA = q; S.open = false; }
    initE();
    function W(n, qq) { return choose(qq + n - 1, qq); }
    function step(dt) {
      S.t += dt;
      if (mode === 'gas') { ps.forEach(function (p) { p.x += p.vx * dt / 300; p.y += p.vy * dt / 180; if (p.y < 0.02) { p.y = 0.02; p.vy = M.abs(p.vy); } if (p.y > 0.98) { p.y = 0.98; p.vy = -M.abs(p.vy); } if (p.x < 0.02) { p.x = 0.02; p.vx = M.abs(p.vx); } if (p.x > 0.98) { p.x = 0.98; p.vx = -M.abs(p.vx); } if (!S.open) { if (p.x > 0.48) { p.x = 0.48; p.vx = -M.abs(p.vx); } } }); }
      else if (mode === 'energy' && S.open) { S.acc = (S.acc || 0) + dt; while (S.acc > 0.12) { S.acc -= 0.12; // pick any oscillator; if it has a quantum, move one to any oscillator. The moves are symmetric, so every microstate is equally likely in the long run
          var from = M.floor(rnd() * (NA + NB)), to = M.floor(rnd() * (NA + NB)); if (occ[from] > 0) { occ[from]--; occ[to]++; } S.qA = occ.slice(0, NA).reduce(function (a2, b2) { return a2 + b2; }, 0); } }
      draw(); if (M.floor(S.t * 4) !== M.floor((S.t - dt) * 4)) report();
    }
    function left() { return ps.filter(function (p) { return p.x < 0.5; }).length; }
    function draw() {
      var ctx = c.ctx, k = pal(), wide = c.w >= 560; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      if (mode === 'gas') { var bw = wide ? c.w * 0.42 : c.w - 20, bh = wide ? c.h - 20 : c.h * 0.45, bx = 10, by = 10; panel(ctx, bx, by, bw, bh, { r: 8 }); if (!S.open) line(ctx, [[bx + bw / 2, by], [bx + bw / 2, by + bh]], k.ink, 3); else line(ctx, [[bx + bw / 2, by], [bx + bw / 2, by + 8]], k.ink, 3); ps.forEach(function (p) { ctx.fillStyle = k.acc; ctx.beginPath(); ctx.arc(bx + p.x * bw, by + p.y * bh, 5, 0, TAU); ctx.fill(); });
        var gx = wide ? bx + bw + 30 : 10, gy = wide ? 10 : by + bh + 14, gw = wide ? c.w - gx - 10 : c.w - 20, gh = wide ? c.h - 20 : c.h - gy - 6, Wmax = choose(N, M.floor(N / 2)), kl = left(), bwid = gw / (N + 1);
        var two1 = !quiet && tw(ctx, 'ways (W) to arrange them', 10, true) + tw(ctx, 'most likely: an even split (W = ' + Wmax + ')', 10, true) + 16 > gw; for (var kk = 0; kk <= N; kk++) { var w2 = choose(N, kk), h = w2 / Wmax * (gh - (two1 ? 48 : 34)); ctx.fillStyle = kk === kl ? k.acc : (k.dark ? '#3c5a4b' : '#c8d6ce'); ctx.fillRect(gx + kk * bwid + 1, gy + gh - 20 - h, bwid - 2, h); if (bwid > 16 || kk % 2 === 0) txt(ctx, String(kk), gx + (kk + 0.5) * bwid, gy + gh - 10, { size: 9, align: 'center' }); }
        txt(ctx, 'number of particles on the left', gx + gw / 2, gy + gh + 2, { size: 10, align: 'center' }); txt(ctx, 'ways (W) to arrange them', gx, gy + 6, { size: 10, color: k.ink, bold: true }); if (!quiet) txt(ctx, 'most likely: an even split (W = ' + Wmax + ')', two1 ? gx : gx + gw, gy + (two1 ? 20 : 6), { size: 10, align: two1 ? 'left' : 'right', color: k.acc, bold: true }); }
      else if (mode === 'energy') { var cw2 = wide ? c.w * 0.45 : c.w - 20, top = 14, rowH = M.min(30, (c.h * 0.42) / 2); var boxW = M.min(34, (cw2 - 10) / M.max(NA, NB)); rowH = M.max(rowH, 34); [[NA, S.qA, 'A', 0], [NB, q - S.qA, 'B', NA]].forEach(function (sd, i) { var y = top + i * (rowH + 22); txt(ctx, 'solid ' + sd[2] + ': ' + sd[0] + ' oscillators, ' + sd[1] + ' quanta' + (i === 0 && !S.open ? ' (hot)' : i === 1 && !S.open ? ' (cold)' : ''), 10, y + 4, { size: 11, bold: true, color: k.ink }); for (var j = 0; j < sd[0]; j++) { var bx2 = 10 + j * boxW; ctx.strokeStyle = k.labLine; ctx.strokeRect(bx2, y + 12, boxW - 4, rowH - 12); for (var d = 0; d < occ[sd[3] + j]; d++) { ctx.fillStyle = i ? k.blue : k.red; ctx.beginPath(); ctx.arc(bx2 + 6 + (d % 3) * 8, y + rowH - 5 - M.floor(d / 3) * 7, 3, 0, TAU); ctx.fill(); } } });
        var gx2 = wide ? c.w * 0.5 : 10, gy2 = wide ? 10 : c.h * 0.5, gw2 = wide ? c.w * 0.48 : c.w - 20, gh2 = wide ? c.h - 20 : c.h * 0.5 - 10, tot = 0, mx = 0, best = 0; for (var qa = 0; qa <= q; qa++) { var ww = W(NA, qa) * W(NB, q - qa); tot += ww; if (ww > mx) { mx = ww; best = qa; } } var bw2 = gw2 / (q + 1);
        var two2 = !quiet && tw(ctx, 'quanta in A →  W_A × W_B', 10, true) + tw(ctx, 'most arrangements at q_A = ' + best, 10, true) + 16 > gw2; for (qa = 0; qa <= q; qa++) { var ww2 = W(NA, qa) * W(NB, q - qa), hh = ww2 / mx * (gh2 - (two2 ? 50 : 36)); ctx.fillStyle = qa === S.qA ? k.acc : (k.dark ? '#3c5a4b' : '#c8d6ce'); ctx.fillRect(gx2 + qa * bw2 + 1, gy2 + gh2 - 20 - hh, bw2 - 2, hh); txt(ctx, String(qa), gx2 + (qa + 0.5) * bw2, gy2 + gh2 - 10, { size: 9, align: 'center' }); }
        txt(ctx, 'quanta in A →  W_A × W_B', gx2, gy2 + 6, { size: 10, bold: true, color: k.ink }); if (!quiet) txt(ctx, 'most arrangements at q_A = ' + best, two2 ? gx2 : gx2 + gw2, gy2 + (two2 ? 20 : 6), { size: 10, align: two2 ? 'left' : 'right', bold: true, color: k.acc }); }
      else { var items = o.compare === 'phases' ? [['solid', 1], ['liquid', choose(8, 4)], ['gas', choose(16, 4)]] : [['2 molecules', choose(16, 2)], ['4 molecules', choose(16, 4)]], mxW = M.max.apply(null, items.map(function (x) { return x[1]; })), bw3 = (c.w - 40) / items.length;
        items.forEach(function (it, i) { var x = 20 + i * bw3, nar3 = c.w < 560, hh2 = log10(it[1] + 1) / log10(mxW + 1) * (c.h - (nar3 ? 120 : 80)); ctx.fillStyle = k.acc; ctx.fillRect(x + bw3 * 0.25, c.h - 40 - hh2, bw3 * 0.5, hh2); txt(ctx, it[0], x + bw3 / 2, c.h - 26, { size: 12, bold: true, align: 'center', color: k.ink }); if (!quiet) { if (nar3) { txt(ctx, 'W = ' + it[1], x + bw3 / 2, c.h - 59 - hh2, { size: 11, align: 'center', color: k.ink }); txt(ctx, 'S/k = ' + fm(M.log(it[1]), 2), x + bw3 / 2, c.h - 46 - hh2, { size: 11, align: 'center', color: k.ink }); } else txt(ctx, 'W = ' + it[1] + ', S/k = ln W = ' + fm(M.log(it[1]), 2), x + bw3 / 2, c.h - 46 - hh2, { size: 11, align: 'center', color: k.ink }); } }); txtw(ctx, o.compare === 'phases' ? 'toy model: 4 particles fixed in place (solid), anywhere in half the 16 sites (liquid), anywhere in all 16 (gas)' : 'arrangements on 16 sites (log scale)', c.w / 2, 12, c.w - 20, { size: 10, align: 'center' }); }
    }
    function report() {
      var s; if (mode === 'gas') { var kl = left(); s = quiet ? kl + ' of ' + N + ' particles are on the left.' : 'Now ' + kl + ' of ' + N + ' on the left: W = C(' + N + ', ' + kl + ') = ' + choose(N, kl) + ' of the 2<sup>' + N + '</sup> = ' + M.pow(2, N) + ' ways. All on one side: 1 way, a chance of 1 in ' + M.pow(2, N) + '. ' + (S.open ? 'The particles spread out because evenly spread arrangements are by far the most numerous.' : 'Lift the divider and watch.'); }
      else if (mode === 'energy') { var Wa = W(NA, S.qA), Wb = W(NB, q - S.qA); s = quiet ? 'Quanta in A: ' + S.qA + ' of ' + q + '.' : 'q_A = ' + S.qA + ': W_A = ' + Wa + ', W_B = ' + Wb + ', W = W_A × W_B = ' + Wa * Wb + ', S/k = ln W = ' + fm(M.log(Wa * Wb), 2) + '. Energy flows from the hot solid to the cold one because the shared states have overwhelmingly more arrangements; it is not drawn to "disorder".'; }
      else s = quiet ? 'Compare the numbers of arrangements.' : o.compare === 'phases' ? 'More freedom of position means more arrangements, so S(gas) > S(liquid) > S(solid).' : 'More molecules means many more arrangements: W grows very fast with the number of particles, and so does S = k ln W.';
      F.say(s); F.setAlt(mode === 'gas' ? 'A box of particles with a divider beside a bar chart of the number of arrangements for each split.' : mode === 'energy' ? 'Two small solids sharing quanta of energy beside a bar chart of the arrangements for each split.' : 'Bars comparing numbers of arrangements.');
    }
    if (F.edit) { if (mode === 'gas') { btn(F.ctl, 'Lift the divider', function () { S.open = true; if (!A.running()) A.play(); report(); }, 'pri'); btn(F.ctl, 'Start again', function () { initGas(); draw(); report(); }); } if (mode === 'energy') { btn(F.ctl, 'Let energy flow', function () { S.open = true; if (V.reduced) { var mx = 0, b = 0; for (var qa = 0; qa <= q; qa++) { var ww = W(NA, qa) * W(NB, q - qa); if (ww > mx) { mx = ww; b = qa; } } occ = occ.map(function () { return 0; }); for (var j2 = 0; j2 < b; j2++) occ[j2 % NA]++; for (j2 = 0; j2 < q - b; j2++) occ[NA + j2 % NB]++; S.qA = b; draw(); report(); } else if (!A.running()) A.play(); }, 'pri'); btn(F.ctl, 'Start again', function () { initE(); draw(); report(); }); } }
    var A = anim(elx, step, mode === 'gas');
    if (V.reduced && mode === 'gas') { /* the picture stays still until the visitor plays it */ }
    if (F.edit && mode === 'gas') playBtn(F.ctl, A);
    redraw(c, draw); draw(); report(); return { draw: draw };
  });

  // =====================================================================================================
  // ch-cell: options are documented at the top of this file
  var EZ = { // couple: [E° (V), electrons, oxidized form, reduced form, oxidized coefficient, reduced coefficient, metal?]
    'Li+/Li': [-3.04, 1, 'Li+', 'Li', 1, 1, 1], 'K+/K': [-2.93, 1, 'K+', 'K', 1, 1, 1], 'Ca2+/Ca': [-2.87, 2, 'Ca2+', 'Ca', 1, 1, 1], 'Na+/Na': [-2.71, 1, 'Na+', 'Na', 1, 1, 1], 'Mg2+/Mg': [-2.37, 2, 'Mg2+', 'Mg', 1, 1, 1], 'Al3+/Al': [-1.66, 3, 'Al3+', 'Al', 1, 1, 1],
    'Zn2+/Zn': [-0.7618, 2, 'Zn2+', 'Zn', 1, 1, 1], 'Cr3+/Cr': [-0.744, 3, 'Cr3+', 'Cr', 1, 1, 1], 'Fe2+/Fe': [-0.447, 2, 'Fe2+', 'Fe', 1, 1, 1], 'Cd2+/Cd': [-0.4030, 2, 'Cd2+', 'Cd', 1, 1, 1], 'Ni2+/Ni': [-0.257, 2, 'Ni2+', 'Ni', 1, 1, 1], 'Sn2+/Sn': [-0.1375, 2, 'Sn2+', 'Sn', 1, 1, 1], 'Pb2+/Pb': [-0.1262, 2, 'Pb2+', 'Pb', 1, 1, 1],
    'H+/H2': [0.0000, 2, 'H+', 'H2', 2, 1, 0], 'Cu2+/Cu': [0.3419, 2, 'Cu2+', 'Cu', 1, 1, 1], 'I2/I-': [0.5355, 2, 'I2', 'I-', 1, 2, 0], 'Fe3+/Fe2+': [0.771, 1, 'Fe3+', 'Fe2+', 1, 1, 0], 'Ag+/Ag': [0.7996, 1, 'Ag+', 'Ag', 1, 1, 1], 'Br2/Br-': [1.066, 2, 'Br2', 'Br-', 1, 2, 0], 'Cl2/Cl-': [1.35827, 2, 'Cl2', 'Cl-', 1, 2, 0], 'Au3+/Au': [1.498, 3, 'Au3+', 'Au', 1, 1, 1], 'F2/F-': [2.866, 2, 'F2', 'F-', 1, 2, 0] };
  // the slider sets one dissolved species per half-cell: the metal ion, Fe³⁺ (Fe²⁺ at 1 M), H⁺ (H₂ at 1 atm) or the halide
  // ion (the halogen pure); solids, liquids and gases count as 1
  function acts(cp, cval) { var d = EZ[cp], halide = /-$/.test(d[3]); return halide ? [1, cval] : [cval, d[6] || d[3] === 'Fe2+' || d[3] === 'H2' ? 1 : 1]; }
  function cellCalc(an, ca, cA, cC) { // E°cell = E°cathode − E°anode; n = electrons in the balanced equation; Q from the activities
    var A = EZ[an], C = EZ[ca], n = A[1] * C[1] / gcdI(A[1], C[1]), E0 = C[0] - A[0], mA = n / A[1], mC = n / C[1], aA = acts(an, cA), aC = acts(ca, cC);
    // cathode: oxidized form → reduced form (Q gets [red]/[ox]); anode runs backward: reduced → oxidized (Q gets [ox]/[red])
    var logQ = mC * (C[5] * log10(aC[1]) - C[4] * log10(aC[0])) + mA * (A[4] * log10(aA[0]) - A[5] * log10(aA[1]));
    return { E0: E0, n: n, Q: M.pow(10, logQ), E: E0 - 0.0592 / n * logQ, eqn: eqText(A, C, mA, mC) };
  }
  function eqText(A, C, mA, mC) { function t(cf, f) { return (cf > 1 ? cf : '') + fH(f); } return t(mA * A[5], A[3]) + ' + ' + t(mC * C[4], C[2]) + ' → ' + t(mA * A[4], A[2]) + ' + ' + t(mC * C[5], C[3]); }
  R('ch-cell', function (elx, o) {
    o = opt(o, { anode: 'Zn2+/Zn', cathode: 'Cu2+/Cu', c: [1.0, 1.0], mode: 'galvanic', couple: 'Cu2+/Cu', I: 2.0, t: 600, show: ['labels', 'signs', 'volts', 'ions'], zinc: false });
    var mode = o.mode, quiet = !!(o.quiet || o.readout === false), show = {}; (o.show || []).forEach(function (x) { show[x] = 1; });
    var an = EZ[o.anode] ? o.anode : 'Zn2+/Zn', ca = EZ[o.cathode] ? o.cathode : 'Cu2+/Cu'; if (mode === 'galvanic' && EZ[an][0] > EZ[ca][0]) { var sw = an; an = ca; ca = sw; } // the cathode has the higher E°
    var F = frame(elx, o, { galvanic: 'A galvanic cell', electrolytic: 'An electrolytic cell', ladder: 'Choosing the cathode and the anode', corrosion: 'Corrosion of iron' }[mode] || 'An electrochemical cell');
    var S = { cA: num(o.c[0], 1), cC: num(o.c[1], 1), t: 0, I: num(o.I, 2), tt: num(o.t, 600), ladA: an, ladC: ca, sel: 0, zinc: !!o.zinc }, c = F.canvas({ aspect: mode === 'ladder' ? 1.3 : 1.75, min: 300, max: 440, narrow: 0.9 });
    if (mode === 'ladder') return ladder(F, o, c, S);
    if (mode === 'corrosion') return corrosion(F, o, c, S);
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var el2 = mode === 'electrolytic', w = c.w, bw = M.min(w * 0.3, 170), bh = c.h * 0.42, y0 = c.h * 0.48, xl = w * 0.27 - bw / 2, xr = w * 0.73 - bw / 2;
      var left = el2 ? { name: 'anode', E: null, metal: el2 ? EZ[o.couple][3] : EZ[an][3], ion: EZ[el2 ? o.couple : an][2] } : { name: 'anode', metal: EZ[an][6] ? EZ[an][3] : 'Pt', ion: EZ[an][2] }, right = el2 ? { name: 'cathode', metal: EZ[o.couple][3], ion: EZ[o.couple][2] } : { name: 'cathode', metal: EZ[ca][6] ? EZ[ca][3] : 'Pt', ion: EZ[ca][2] };
      [[xl, left, -1], [xr, right, 1]].forEach(function (b) { var x = b[0]; ctx.fillStyle = k.water; ctx.fillRect(x + 3, y0 + bh * 0.2, bw - 6, bh * 0.8 - 3); ctx.strokeStyle = k.glassLine; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + bh); ctx.lineTo(x + bw, y0 + bh); ctx.lineTo(x + bw, y0); ctx.stroke();
        var ex = x + bw * (b[2] < 0 ? 0.35 : 0.65); ctx.fillStyle = b[1].metal === 'Pt' ? '#c9ccd0' : b[1].metal === 'Cu' ? '#c97a4a' : b[1].metal === 'Zn' || b[1].metal === 'Ag' ? '#b9c4cf' : '#9aa5ad'; rr(ctx, ex - 9, y0 - 30, 18, bh * 0.85 + 30, 3); ctx.fill(); txt(ctx, b[1].metal, ex, y0 - 38, { size: 12, bold: true, align: 'center', color: k.ink });
        fDraw(ctx, b[1].ion + '(aq)', x + bw / 2, y0 + bh + 14, { size: 11, align: 'center', color: k.ink });
        if (show.labels && !quiet) txt(ctx, b[1].name + (b[1].name === 'anode' ? ' (oxidation)' : ' (reduction)'), x + bw / 2, y0 + bh + 30, { size: 11, bold: true, align: 'center', color: b[1].name === 'anode' ? k.red : k.blue });
        if (show.signs && !quiet) { var sign = el2 ? (b[1].name === 'anode' ? '+' : '−') : (b[1].name === 'anode' ? '−' : '+'); pill(ctx, sign, ex, y0 - 56, { size: 14, color: sign === '+' ? k.plus : k.minus, line: k.labLine }); }
        // ions drifting in each beaker
        for (var i = 0; i < 6; i++) { var ix = x + 14 + ((i * 41 + S.t * 9 * (i % 2 ? 1 : -1)) % (bw - 28) + (bw - 28)) % (bw - 28), iy = y0 + bh * 0.35 + (i % 3) * bh * 0.2; ball(ctx, ix, iy, 6, b[1].ion.replace(/[\d+\-^]+$/, ''), { charge: parseF(b[1].ion).charge }); }
      });
      // the wire and the meter (or power supply)
      var exl = xl + bw * 0.35, exr = xr + bw * 0.65, wy = c.h * 0.12; line(ctx, [[exl, y0 - 30], [exl, wy], [exr, wy], [exr, y0 - 30]], k.ink, 2.5);
      // electrons only in the wire: from the anode to the cathode (galvanic) or pushed by the supply (electrolytic)
      for (var e = 0; e < 7; e++) { var f = ((S.t * 0.35 + e / 7) % 1), path = [[exl, y0 - 30], [exl, wy], [exr, wy], [exr, y0 - 30]], L1 = wy - y0 + 30, total = -L1 * 2 + (exr - exl), d = f * total, px, py; if (d < -L1) { px = exl; py = y0 - 30 - d; } else if (d < -L1 + (exr - exl)) { px = exl + d + L1; py = wy; } else { px = exr; py = wy + (d + L1 - (exr - exl)); } ball(ctx, px, py, 4, 'e', { color: k.gold }); }
      panel(ctx, w / 2 - 46, wy - 18, 92, 36, { r: 8, fill: el2 ? (k.dark ? '#3b3020' : '#fff3bf') : k.bg, line: k.ink });
      var Cc = el2 ? null : cellCalc(an, ca, S.cA, S.cC); txt(ctx, el2 ? 'power supply' : (quiet || !show.volts ? 'voltmeter' : fm(Cc.E, 3) + ' V'), w / 2, wy, { size: el2 ? 11 : 15, bold: true, align: 'center', color: k.ink, font: el2 ? null : '700 15px ui-monospace,Menlo,Consolas,monospace' });
      arrow(ctx, w / 2 - 70, wy - 26, w / 2 - 50, wy - 26, k.gold, 2, 7); txt(ctx, 'e⁻', w / 2 - 78, wy - 26, { size: 11, bold: true, color: k.gold, align: 'right' });
      if (!el2) { // the salt bridge: anions toward the anode, cations toward the cathode; no electrons ever cross it
        var sbx0 = xl + bw * 0.75, sbx1 = xr + bw * 0.25, sby = y0 - 8; ctx.save(); ctx.strokeStyle = k.dark ? 'rgba(220,210,170,.6)' : 'rgba(170,150,90,.7)'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sbx0, y0 + bh * 0.45); ctx.lineTo(sbx0, sby); ctx.lineTo(sbx1, sby); ctx.lineTo(sbx1, y0 + bh * 0.45); ctx.stroke(); ctx.restore(); txt(ctx, 'salt bridge (KNO₃)', w / 2, sby - 14, { size: 10, align: 'center' });
        if (show.ions) for (var q = 0; q < 4; q++) { var g = (S.t * 0.18 + q / 4) % 1, xa = lerp(sbx1, sbx0, g), xc = lerp(sbx0, sbx1, (g + 0.5) % 1); ball(ctx, xa, sby, 5, 'N', { charge: -1 }); ball(ctx, xc, sby + 1, 5, 'K', { charge: 1 }); } }
      if (el2 && !quiet) { var m = S.I * S.tt * molarMass(EZ[o.couple][3]) / (EZ[o.couple][1] * K.F); txt(ctx, 'plated: ' + fm(m, 3) + ' g ' + EZ[o.couple][3], xr + bw / 2, y0 - 70, { size: 11, bold: true, align: 'center', color: k.acc }); }
    }
    function report() {
      var s; if (mode === 'electrolytic') { var cp = EZ[o.couple], m = S.I * S.tt * molarMass(cp[3]) / (cp[1] * K.F); s = 'A power supply pushes electrons onto the cathode (now negative) and pulls them from the anode (now positive). ' + (quiet ? '' : 'Mass plated = I t M / (n F) = ' + fm(S.I, 2) + ' A × ' + fm(S.tt, 0) + ' s × ' + fm(molarMass(cp[3]), 2) + ' g/mol ÷ (' + cp[1] + ' × 96 485 C/mol) = <b>' + fm(m, 3) + ' g</b> of ' + EZ[o.couple][3] + '.'); }
      else { var Cc = cellCalc(an, ca, S.cA, S.cC); s = quiet ? 'Electrons flow through the wire; ions move through the salt bridge.' : 'E°cell = E°cathode − E°anode = ' + v2(EZ[ca][0]) + ' − (' + v2(EZ[an][0]) + ') = ' + v2(Cc.E0) + ' V; E° is never multiplied by a coefficient. ' + Cc.eqn + ' (n = ' + Cc.n + '). Nernst: E = E° − (0.0592/' + Cc.n + ') log Q = ' + fm(Cc.E0, 3) + ' − ' + fm(0.0592 / Cc.n, 4) + ' × log ' + sci(Cc.Q, 3, true) + ' = <b>' + fm(Cc.E, 3) + ' V</b>. Electrons travel only through the wire, from the anode (−) to the cathode (+); in the salt bridge, anions drift toward the anode and cations toward the cathode.'; }
      F.say(s); F.setAlt(mode === 'electrolytic' ? 'An electrolytic cell with a power supply.' : 'A galvanic cell: two beakers with electrodes, a wire with a voltmeter and a salt bridge.');
    }
    if (F.edit && mode === 'galvanic') { var ce = function (v) { return sci(v, 2); }; sl(F.ctl, { label: '[' + fT(/-$/.test(EZ[an][3]) ? EZ[an][3] : EZ[an][2]) + '] at the anode', min: -3, max: 1, step: 0.05, value: log10(S.cA), fmt: function (v) { return ce(M.pow(10, v)) + ' M'; }, input: function (v) { S.cA = M.pow(10, v); draw(); report(); } }); sl(F.ctl, { label: '[' + fT(/-$/.test(EZ[ca][3]) ? EZ[ca][3] : EZ[ca][2]) + '] at the cathode', min: -3, max: 1, step: 0.05, value: log10(S.cC), fmt: function (v) { return ce(M.pow(10, v)) + ' M'; }, input: function (v) { S.cC = M.pow(10, v); draw(); report(); } }); }
    if (F.edit && mode === 'electrolytic') { sl(F.ctl, { label: 'Current', min: 0.1, max: 10, step: 0.1, value: S.I, fmt: function (v) { return fm(v, 1) + ' A'; }, input: function (v) { S.I = v; draw(); report(); } }); sl(F.ctl, { label: 'Time', min: 60, max: 7200, step: 60, value: S.tt, fmt: function (v) { return fm(v / 60, 0) + ' min'; }, input: function (v) { S.tt = v; draw(); report(); } }); }
    var A = anim(elx, function (dt) { S.t += dt; draw(); }, true); if (F.edit) playBtn(F.ctl, A);
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  function v2(x) { return (x < 0 ? '−' : '') + M.abs(x).toFixed(2); } // potentials always to the hundredth of a volt
  function ladder(F, o, c, S) { // the table of standard reduction potentials: the higher one is the cathode
    var list = ['Li+/Li', 'Mg2+/Mg', 'Al3+/Al', 'Zn2+/Zn', 'Fe2+/Fe', 'Ni2+/Ni', 'Pb2+/Pb', 'H+/H2', 'Cu2+/Cu', 'I2/I-', 'Fe3+/Fe2+', 'Ag+/Ag', 'Br2/Br-', 'Cl2/Cl-', 'Au3+/Au', 'F2/F-'], quiet = F.quiet, pick = 'a';
    function Y(E) { return c.h - 20 - (E + 3.2) / 6.3 * (c.h - 40); }
    function draw() { var ctx = c.ctx, k = pal(), x0 = M.min(130, c.w * 0.3); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h); line(ctx, [[x0, Y(-3.1)], [x0, Y(3.0)]], k.ink, 3);
      var lastY = 1e9; list.slice().sort(function (p, q) { return EZ[p][0] - EZ[q][0]; }).forEach(function (cp, i) { var E = EZ[cp][0], y = Y(E), isA = cp === S.ladA, isC = cp === S.ladC, ly = M.min(y, lastY - 15); lastY = ly; line(ctx, [[x0 - 8, y], [x0 + 8, y]], isA || isC ? (isA ? k.red : k.blue) : k.ink, isA || isC ? 3 : 1.5); txt(ctx, (quiet ? '' : (E > 0 ? '+' : E < 0 ? '−' : '') + v2(M.abs(E)) + ' V  '), x0 - 12, ly, { size: 11, align: 'right', color: k.ink }); var lab = EZ[cp][2].replace(/\^?(\d?)([+\-])$/, '') ; fDraw(ctx, fRuns((EZ[cp][4] > 1 ? EZ[cp][4] : '') + EZ[cp][2]).concat([[' + ' + (EZ[cp][1] > 1 ? EZ[cp][1] : '') + 'e', 'n'], ['−', 'sup'], [' → ', 'n']]).concat(fRuns((EZ[cp][5] > 1 ? EZ[cp][5] : '') + EZ[cp][3])), x0 + 14, ly, { size: 11, color: isA ? k.red : isC ? k.blue : k.ink }); if ((isA || isC) && !quiet) txt(ctx, isA ? 'anode' : 'cathode', c.w - 8, ly, { size: 11, bold: true, align: 'right', color: isA ? k.red : k.blue }); if (H.focused() && S.sel === i) focusBox(ctx, x0 + 10, ly - 9, c.w - x0 - 16, 18); });
      txt(ctx, 'stronger oxidizing agents ↑', x0 + 14, 10, { size: 10, color: k.muted }); var srp = 'standard reduction potentials, 25 °C'; txt(ctx, srp, M.min(x0 + 14, c.w - tw(ctx, srp, 10) - 6), c.h - 6, { size: 10, color: k.muted }); }
    function report() { var a = EZ[S.ladA], b = EZ[S.ladC], hiC = b[0] >= a[0], E = (hiC ? b[0] - a[0] : a[0] - b[0]); F.say(quiet ? 'Pick the two half-reactions. The higher one is reduced.' : 'Cathode (reduction): ' + fH(hiC ? b[2] : a[2]) + ' (E° ' + v2(hiC ? b[0] : a[0]) + ' V); anode (oxidation): ' + fH(hiC ? a[3] : b[3]) + ' (E° ' + v2(hiC ? a[0] : b[0]) + ' V). E°cell = ' + v2(E) + ' V, positive, so the cell runs on its own. The higher couple is reduced; the lower one runs backward as an oxidation.'); F.setAlt('A vertical table of standard reduction potentials.'); }
    var sorted = function () { return list.slice().sort(function (p, q) { return EZ[p][0] - EZ[q][0]; }); };
    var H = keyNav(c, { tap: function (px, py) { var best = null, bd = 12; sorted().forEach(function (cp) { var d = M.abs(Y(EZ[cp][0]) - py); if (d < bd) { bd = d; best = cp; } }); if (!best) return; choose2(best); }, key: function (e) { var L = sorted(); if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { S.sel = clamp(S.sel + (e.key === 'ArrowDown' ? -1 : 1), 0, L.length - 1); draw(); return true; } if (e.key === 'Enter' || e.key === ' ') { choose2(L[S.sel]); return true; } return false; }, change: draw });
    function choose2(cp) { if (pick === 'a') { S.ladA = cp; pick = 'c'; } else { S.ladC = cp; pick = 'a'; } if (EZ[S.ladA][0] > EZ[S.ladC][0]) { var t = S.ladA; S.ladA = S.ladC; S.ladC = t; } draw(); report(); }
    F.html('chv-note').textContent = 'Tap two half-reactions (or use the up and down arrows and Enter). The higher one becomes the cathode.';
    redraw(c, draw); draw(); report(); return { draw: draw };
  }
  function corrosion(F, o, c, S) { // iron under a water drop: the anode where O2 is scarce (the middle), the cathode at the edge
    var quiet = F.quiet;
    function draw() {
      var ctx = c.ctx, k = pal(), w = c.w, h = c.h, y0 = h * 0.62; ctx.clearRect(0, 0, w, h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = k.dark ? '#5d6670' : '#8d99a3'; ctx.fillRect(20, y0, w - 40, h * 0.2); txt(ctx, 'iron', 30, y0 + h * 0.1, { size: 12, bold: true, color: '#fff' });
      if (S.zinc) { ctx.fillStyle = '#b9c4cf'; ctx.fillRect(w - 110, y0 - 30, 70, 30); txt(ctx, 'zinc', w - 75, y0 - 15, { size: 12, bold: true, align: 'center', color: '#1d2320' }); }
      var cx = w * 0.45, rx = w * 0.28, ry = h * 0.32; ctx.fillStyle = k.water; ctx.beginPath(); ctx.ellipse(cx, y0, rx, ry, 0, PI, TAU); ctx.fill(); ctx.strokeStyle = k.waterLine; ctx.lineWidth = 2; ctx.stroke();
      if (!S.zinc) { ctx.fillStyle = 'rgba(166,82,40,.75)'; ctx.beginPath(); ctx.ellipse(cx, y0 - 4, rx * 0.5, 8, 0, PI, TAU); ctx.fill(); txt(ctx, 'rust forms here', cx, y0 - 22, { size: 10, align: 'center', color: k.ink }); }
      if (!quiet) { var at = S.zinc ? 'zinc is the anode: Zn → Zn²⁺ + 2e⁻' : 'anode (less O₂): Fe → Fe²⁺ + 2e⁻', aw = tw(ctx, at, 11, true) / 2 + 4; txt(ctx, at, clamp(S.zinc ? w - 75 : cx, aw, w - aw), S.zinc ? y0 - 44 : y0 - ry * 0.55, { size: 11, bold: true, align: 'center', color: k.red }); var ct = 'cathode (edge, more O₂): O₂ + 2H₂O + 4e⁻ → 4OH⁻', cw3 = tw(ctx, ct, 11, true); if (cw3 > w - 12) { var c1 = 'cathode (edge, more O₂):', c2 = 'O₂ + 2H₂O + 4e⁻ → 4OH⁻', ww1 = M.max(tw(ctx, c1, 11, true), tw(ctx, c2, 11, true)) / 2 + 4, xc = clamp(cx - rx * 0.6, ww1, w - ww1); txt(ctx, c1, xc, y0 - ry - 26, { size: 11, bold: true, align: 'center', color: k.blue }); txt(ctx, c2, xc, y0 - ry - 12, { size: 11, bold: true, align: 'center', color: k.blue }); } else txt(ctx, ct, clamp(cx - rx * 0.6, cw3 / 2 + 4, w - cw3 / 2 - 4), y0 - ry - 12, { size: 11, bold: true, align: 'center', color: k.blue }); }
      for (var e = 0; e < 6; e++) { var f = (S.t * 0.3 + e / 6) % 1, x0 = S.zinc ? w - 90 : cx, x1 = cx - rx * 0.85; ball(ctx, lerp(x0, x1, f), y0 + h * 0.06, 4, 'e', { color: k.gold }); }
      arrow(ctx, (S.zinc ? w - 110 : cx - 20), y0 + h * 0.13, cx - rx * 0.8, y0 + h * 0.13, k.gold, 2, 7); txt(ctx, 'electrons move through the metal', cx - rx * 0.4, y0 + h * 0.17, { size: 10, align: 'center', color: k.ink });
    }
    function report() { F.say(S.zinc ? 'Zinc has the lower reduction potential (−0.76 V against −0.45 V for iron), so zinc is oxidized instead and feeds electrons to the iron, which becomes the cathode and stays whole: a sacrificial anode.' : 'Under the drop, iron at the center (where oxygen is scarce) is oxidized; electrons travel through the iron to the edge of the drop, where oxygen is reduced. Fe²⁺ and OH⁻ meet in the water and form rust.'); F.setAlt('A water drop on iron with the anode at its center, the cathode at its edge and rust forming.'); }
    if (F.edit) { var zb = btn(F.ctl, S.zinc ? 'Remove the zinc' : 'Attach a zinc block', function () { S.zinc = !S.zinc; zb.textContent = S.zinc ? 'Remove the zinc' : 'Attach a zinc block'; draw(); report(); }); }
    var A = anim(F.el, function (dt) { S.t += dt; draw(); }, true); if (F.edit) playBtn(F.ctl, A);
    redraw(c, draw); draw(); report(); return { draw: draw };
  }
  CH.EZ = EZ; CH.cellCalc = cellCalc;

  // =====================================================================================================
  // ch-nuclide: options are documented at the top of this file
  var STABLE = '1:1,2;2:3,4;3:6,7;4:9;5:10,11;6:12,13;7:14,15;8:16,17,18;9:19;10:20,21,22;11:23;12:24,25,26;13:27;14:28,29,30;15:31;16:32,33,34,36;17:35,37;18:36,38,40;19:39,41;20:40,42,43,44,46;21:45;22:46,47,48,49,50;23:51;24:50,52,53,54;25:55;26:54,56,57,58;27:59;28:58,60,61,62,64;29:63,65;30:64,66,67,68,70;31:69,71;32:70,72,73,74;33:75;34:74,76,77,78,80;35:79,81;36:78,80,82,83,84,86;' +
    '37:85;38:84,86,87,88;39:89;40:90,91,92,94;41:93;42:92,94,95,96,97,98;44:96,98,99,100,101,102,104;45:103;46:102,104,105,106,108,110;47:107,109;48:106,108,110,111,112,114;49:113;50:112,114,115,116,117,118,119,120,122,124;51:121,123;52:120,122,123,124,125,126;53:127;54:126,128,129,130,131,132,134;55:133;56:132,134,135,136,137,138;57:139;58:136,138,140,142;59:141;60:142,143,145,146,148;62:144,149,150,152,154;63:153;64:154,155,156,157,158,160;65:159;66:156,158,160,161,162,163,164;67:165;68:162,164,166,167,168,170;69:169;70:168,170,171,172,173,174,176;71:175;72:176,177,178,179,180;73:181;74:182,183,184,186;75:185;76:187,188,189,190,192;77:191,193;78:192,194,195,196,198;79:197;80:196,198,199,200,201,202,204;81:203,205;82:204,206,207,208';
  var STB = {}; STABLE.split(';').forEach(function (r) { var p = r.split(':'); p[1].split(',').forEach(function (a) { STB[p[0] + '-' + a] = 1; }); });
  var NUCS = { 'H-3': ['β−'], 'C-14': ['β−'], 'N-13': ['β+'], 'F-18': ['β+', 'EC'], 'Na-22': ['β+'], 'P-32': ['β−'], 'K-40': ['β−', 'EC'], 'Co-60': ['β−'], 'Sr-90': ['β−'], 'Tc-99m': ['γ'], 'I-131': ['β−'], 'Cs-137': ['β−'], 'Po-210': ['α'], 'Rn-222': ['α'], 'Ra-226': ['α'], 'Th-232': ['α'], 'U-235': ['α'], 'U-238': ['α'], 'Pu-239': ['α'], 'Am-241': ['α'] };
  var DMODE = { 'α': [-2, -2, 'alpha decay', 'He-4'], 'β−': [1, -1, 'beta-minus decay', 'e-'], 'β+': [-1, 1, 'beta-plus decay (positron emission)', 'e+'], 'EC': [-1, 1, 'electron capture', null], 'γ': [0, 0, 'gamma emission', 'gamma'] };
  var CHAIN238 = [['U', 238], ['Th', 234, 'α'], ['Pa', 234, 'β−'], ['U', 234, 'β−'], ['Th', 230, 'α'], ['Ra', 226, 'α'], ['Rn', 222, 'α'], ['Po', 218, 'α'], ['Pb', 214, 'α'], ['Bi', 214, 'β−'], ['Po', 214, 'β−'], ['Pb', 210, 'α'], ['Bi', 210, 'β−'], ['Po', 210, 'β−'], ['Pb', 206, 'α']];
  var BE = [[2, 1.112], [3, 2.827], [4, 7.074], [6, 5.332], [7, 5.606], [9, 6.463], [10, 6.475], [11, 6.928], [12, 7.680], [14, 7.476], [16, 7.976], [19, 7.779], [20, 8.032], [23, 8.112], [24, 8.261], [27, 8.332], [28, 8.448], [31, 8.481], [32, 8.493], [35, 8.520], [40, 8.551], [48, 8.723], [52, 8.776], [55, 8.765], [56, 8.790], [59, 8.768], [62, 8.795], [63, 8.752], [64, 8.736], [74, 8.725], [84, 8.717], [90, 8.710], [98, 8.635], [107, 8.554], [120, 8.505], [130, 8.430], [138, 8.393], [142, 8.346], [158, 8.202], [166, 8.142], [174, 8.084], [184, 8.005], [197, 7.916], [208, 7.867], [209, 7.848], [226, 7.662], [232, 7.615], [235, 7.591], [238, 7.570]];
  function nucParse(s) { var m = String(s).match(/^([A-Z][a-z]?)-(\d+)(m?)$/); return m && BYS[m[1]] ? { s: m[1], Z: BYS[m[1]].Z, A: +m[2], N: +m[2] - BYS[m[1]].Z, meta: !!m[3], key: s } : null; }
  function decayOf(n, mode) { var d = DMODE[mode]; var Z = n.Z + d[0], A = n.A + d[0] + d[1]; return { Z: Z, A: A, N: A - Z, s: EL[Z] ? EL[Z].s : '?' }; }
  R('ch-nuclide', function (elx, o) {
    o = opt(o, { mode: 'chart', nuc: 'C-14', decay: null, arrows: false });
    var mode = o.mode, quiet = !!(o.quiet || o.readout === false), S = { nuc: nucParse(o.nuc) || nucParse('C-14'), zoom: mode === 'chart' && !!o.nuc };
    var F = frame(elx, o, { chart: 'The chart of the nuclides', equation: 'A nuclear equation', binding: 'Binding energy per nucleon', chain: 'The uranium-238 decay chain' }[mode] || 'Nuclides');
    var c = F.canvas({ aspect: mode === 'equation' ? 2.8 : 1.6, min: mode === 'equation' ? 160 : 300, max: 460, narrow: mode === 'equation' ? 1.8 : 0.9 }), Ch;
    function modes() { return o.decay ? [{ 'beta-': 'β−', alpha: 'α', 'beta+': 'β+', ec: 'EC', gamma: 'γ' }[o.decay] || 'β−'] : (NUCS[S.nuc.key] || predict(S.nuc)); }
    function predict(n) { if (n.Z > 83) return ['α']; var stableN = [], best = 1e9; for (var a = 1; a < 300; a++) if (STB[n.s + '-' + a]) best = M.min(best, M.abs(a - n.A)); var nn = n.A - n.Z, ratioOK = 0; return [nn > n.Z * (n.Z < 20 ? 1.0 : n.Z < 50 ? 1.25 : 1.45) ? 'β−' : 'β+']; }
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      if (mode === 'binding') return drawBE(ctx, k);
      if (mode === 'equation') return drawEq(ctx, k);
      var chain = mode === 'chain', n0 = S.nuc, zoom = chain ? { z0: 80, z1: 94, n0: 122, n1: 148 } : S.zoom ? { z0: M.max(0, n0.Z - 9), z1: n0.Z + 9, n0: M.max(0, n0.N - 13), n1: n0.N + 13 } : { z0: 0, z1: 95, n0: 0, n1: 150 };
      Ch = chart(c, { x: [zoom.n0 - 0.5, zoom.n1 + 0.5], y: [zoom.z0 - 0.5, zoom.z1 + 0.5], xl: 'Neutrons, N', yl: 'Protons, Z', ml: 44 }); Ch.draw(ctx);
      var cw = M.max(1.5, Ch.X(1) - Ch.X(0)), chh = M.max(1.5, Ch.Y(0) - Ch.Y(1));
      for (var key in STB) { var p = key.split('-'), Z = +p[0], A = +p[1], N = A - Z; if (Z < zoom.z0 || Z > zoom.z1 || N < zoom.n0 || N > zoom.n1) continue; ctx.fillStyle = k.dark ? '#d0d8d3' : '#24302a'; ctx.fillRect(Ch.X(N) - cw / 2, Ch.Y(Z) - chh / 2, cw * 0.92, chh * 0.92); if (cw > 16) txt(ctx, EL[Z].s + '-' + A, Ch.X(N), Ch.Y(Z), { size: M.min(10, cw * 0.28), align: 'center', color: k.dark ? '#1d2320' : '#fff' }); }
      if (zoom.n1 > 80) { ctx.fillStyle = k.dark ? '#d0d8d3' : '#24302a'; ctx.globalAlpha = 0.5; ctx.fillRect(Ch.X(126) - cw / 2, Ch.Y(83) - chh / 2, cw, chh); ctx.globalAlpha = 1; }
      var zmax = M.min(zoom.z1, zoom.n1); line(ctx, [[Ch.X(M.max(zoom.n0, zoom.z0)), Ch.Y(M.max(zoom.n0, zoom.z0))], [Ch.X(zmax), Ch.Y(zmax)]], k.gold, 1.6, [6, 4]); txt(ctx, 'N = Z', Ch.X(zmax) - 4, Ch.Y(zmax) + 12, { size: 10, align: 'right', color: k.gold, bold: true });
      if (chain) { var prev = null; CHAIN238.forEach(function (st, i) { var Z = BYS[st[0]].Z, N = st[1] - Z, x = Ch.X(N), y = Ch.Y(Z); if (prev) arrow(ctx, prev[0], prev[1], x, y, st[2] === 'α' ? k.red : k.blue, 2.4, 8); ctx.fillStyle = i === CHAIN238.length - 1 ? k.green : k.acc; ctx.beginPath(); ctx.arc(x, y, M.min(cw, chh) * 0.42, 0, TAU); ctx.fill(); if (cw > 14) txt(ctx, st[0] + '-' + st[1], x + cw * 0.5, y - chh * 0.5, { size: 9, color: k.ink }); prev = [x, y]; }); txt(ctx, 'α: 2 down, 2 left', Ch.box().x0 + 8, Ch.box().y0 + 12, { size: 11, bold: true, color: k.red }); txt(ctx, 'β⁻: 1 up, 1 left', Ch.box().x0 + 8, Ch.box().y0 + 28, { size: 11, bold: true, color: k.blue }); return; }
      // the chosen nuclide and its decay arrows
      var x0 = Ch.X(n0.N), y0 = Ch.Y(n0.Z); ctx.strokeStyle = k.acc; ctx.lineWidth = 3; ctx.strokeRect(x0 - cw / 2 - 2, y0 - chh / 2 - 2, cw + 3, chh + 3); if (cw > 14) txt(ctx, n0.s + '-' + n0.A, x0, y0 - chh * 0.9, { size: 11, bold: true, align: 'center', color: k.acc });
      var ms = o.arrows ? ['α', 'β−', 'β+', 'γ'] : modes();
      ms.forEach(function (md) { var d = decayOf(n0, md); if (md === 'γ') { if (S.zoom) txt(ctx, 'γ: stays put', x0 + cw, y0 + chh, { size: 10, color: k.purple, bold: true }); return; } var col = md === 'α' ? k.red : md === 'β−' ? k.blue : k.green; arrow(ctx, x0, y0, Ch.X(d.N), Ch.Y(d.Z), col, 2.6, 9); if (!quiet || o.arrows) txt(ctx, md, (x0 + Ch.X(d.N)) / 2 + 6, (y0 + Ch.Y(d.Z)) / 2 - 6, { size: 12, bold: true, color: col }); });
    }
    function drawEq(ctx, k) { var n0 = S.nuc, md = modes()[0], d = decayOf(n0, md), y = c.h / 2, fs = M.min(34, c.h * 0.24), parts = [[n0.A, n0.Z, n0.s + (n0.meta ? 'ᵐ' : '')], '→', quiet ? ['?', '?', '?'] : [d.A, d.Z, d.s]], em = DMODE[md][3];
      if (md === 'EC') parts = [[n0.A, n0.Z, n0.s], '+', [0, -1, 'e'], '→', quiet ? ['?', '?', '?'] : [d.A, d.Z, d.s]]; else if (em) { parts.push('+'); parts.push(em === 'He-4' ? [4, 2, 'He'] : em === 'e-' ? [0, -1, 'e'] : em === 'e+' ? [0, 1, 'e'] : [0, 0, 'γ']); }
      if (md === 'γ') parts[2] = quiet ? ['?', '?', '?'] : [n0.A, n0.Z, n0.s];
      var tot = 0; ctx.save(); parts.forEach(function (p) { tot += typeof p === 'string' ? fs * 1.2 : fs * 1.5 + 10; }); var x = (c.w - tot) / 2;
      parts.forEach(function (p) { if (typeof p === 'string') { txt(ctx, p, x + fs * 0.6, y, { size: fs * 0.8, align: 'center', color: k.muted }); x += fs * 1.2; return; } txt(ctx, String(p[0]), x + fs * 0.5, y - fs * 0.42, { size: fs * 0.42, align: 'right', color: k.acc, bold: true }); txt(ctx, String(p[1]).replace('-', '−'), x + fs * 0.5, y + fs * 0.42, { size: fs * 0.42, align: 'right', color: k.blue, bold: true }); txt(ctx, p[2], x + fs * 0.56, y, { size: fs, color: k.ink, bold: true, serif: true }); x += fs * 1.5 + 10; });
      ctx.restore(); txtw(ctx, 'mass numbers (top) and atomic numbers (bottom) balance', c.w / 2, c.h - 12, c.w - 20, { size: 11, align: 'center', up: true }); }
    function drawBE(ctx, k) { Ch = chart(c, { x: [0, 245], y: [0, 9.4], xl: 'Mass number A', yl: 'Binding energy per nucleon (MeV)', ml: 46, xt: 20 }); Ch.draw(ctx); var pts = BE.map(function (p) { return [p[0], p[1]]; }); Ch.path(ctx, pts.filter(function (p) { return p[0] !== 4; }), rgba(k.acc, 0.6), 1.6); pts.forEach(function (p) { ctx.fillStyle = k.acc; ctx.beginPath(); ctx.arc(Ch.X(p[0]), Ch.Y(p[1]), 3.5, 0, TAU); ctx.fill(); });
      [[4, 'He-4'], [56, 'Fe-56'], [62, 'Ni-62'], [238, 'U-238'], [2, 'H-2']].forEach(function (L) { var p = BE.find(function (q) { return q[0] === L[0]; }); if (p) txt(ctx, L[1] + (quiet ? '' : ' ' + fm(p[1], 2)), Ch.X(p[0]) + (L[0] > 200 ? -6 : 6), Ch.Y(p[1]) + (L[0] === 62 ? -12 : 14), { size: 10, color: k.ink, bold: true, align: L[0] > 200 ? 'right' : 'left' }); });
      arrow(ctx, Ch.X(8), Ch.Y(5.2), Ch.X(45), Ch.Y(8.3), k.blue, 3, 10); txt(ctx, 'fusion', Ch.X(30) + 6, Ch.Y(6.0), { size: 12, bold: true, color: k.blue }); arrow(ctx, Ch.X(230), Ch.Y(7.1), Ch.X(120), Ch.Y(8.1), k.red, 3, 10); var nb = Ch.box().x1 - Ch.box().x0 < 400; txt(ctx, 'fission', Ch.X(185), Ch.Y(nb ? 6.3 : 6.7), { size: 12, bold: true, color: k.red }); txtw(ctx, 'most tightly bound near iron and nickel', Ch.X(110), Ch.Y(nb ? 5.2 : 6.2), Ch.box().x1 - Ch.X(110) - 4, { size: 11, color: k.ink }); }
    function report() {
      var s, n0 = S.nuc;
      if (mode === 'binding') s = quiet ? 'Binding energy per nucleon rises steeply, peaks, then falls slowly.' : 'Binding energy per nucleon peaks near iron-56 and nickel-62 (about 8.8 MeV). Fusing light nuclei and splitting heavy ones both move toward the peak, to more tightly bound nuclei, so both release energy.';
      else if (mode === 'chain') s = 'Uranium-238 decays through 14 steps (8 alpha, 6 beta-minus) to stable lead-206. Each α moves 2 down and 2 left (Z − 2, N − 2); each β⁻ moves 1 up and 1 left (Z + 1, N − 1).';
      else { var md = modes()[0], d = decayOf(n0, md); s = quiet ? n0.s + '-' + n0.A + ' (' + n0.Z + ' protons, ' + n0.N + ' neutrons).' : n0.s + '-' + n0.A + ' (Z = ' + n0.Z + ', N = ' + n0.N + ', N/Z = ' + fm(n0.N / n0.Z, 2) + '): ' + (NUCS[n0.key] ? 'decays by ' : 'predicted from the band of stability: ') + DMODE[md][2] + (md === 'γ' ? '; the nucleus only loses energy, so the element and mass number stay the same.' : ' to ' + d.s + '-' + d.A + ' (Z ' + (d.Z - n0.Z >= 0 ? '+' : '−') + M.abs(d.Z - n0.Z) + ', N ' + (d.N - n0.N >= 0 ? '+' : '−') + M.abs(d.N - n0.N) + ').') + (md === 'β−' ? ' Too many neutrons: a neutron becomes a proton.' : md === 'β+' || md === 'EC' ? ' Too few neutrons: a proton becomes a neutron.' : md === 'α' ? ' Heavy nuclei (beyond bismuth) shed alpha particles.' : ''); }
      F.say(s); F.setAlt(mode === 'binding' ? 'Binding energy per nucleon against mass number, peaking near iron.' : mode === 'equation' ? 'A nuclear equation with mass and atomic numbers.' : 'A chart of stable nuclides, neutrons across and protons up' + (mode === 'chain' ? ', with the uranium-238 decay chain.' : ', with decay arrows from the chosen nuclide.'));
    }
    if (F.edit && mode !== 'binding' && mode !== 'chain') { var lab = mk('label', 'chv-lab', 'Nuclide'), sel = D.createElement('select'); Object.keys(NUCS).forEach(function (k2) { var op = D.createElement('option'); op.value = k2; op.textContent = k2; sel.appendChild(op); }); sel.value = NUCS[S.nuc.key] ? S.nuc.key : 'C-14'; sel.addEventListener('change', function () { S.nuc = nucParse(sel.value); draw(); report(); }); lab.appendChild(sel); F.ctl.appendChild(lab); if (mode === 'chart') { var zb = btn(F.ctl, S.zoom ? 'Show the whole chart' : 'Zoom to the nuclide', function () { S.zoom = !S.zoom; zb.textContent = S.zoom ? 'Show the whole chart' : 'Zoom to the nuclide'; draw(); }); } }
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  CH.STB = STB; CH.nucParse = nucParse; CH.decayOf = decayOf; CH.BE = BE;

  // =====================================================================================================
  // ch-spectrum: options are documented at the top of this file
  var WF = { Na: 2.46, Al: 4.08, Zn: 4.31, Fe: 4.50, Cu: 4.70, Ag: 4.73, Pt: 6.35 };
  var LINES = { H: [656.3, 486.1, 434.0, 410.2], He: [447.1, 471.3, 492.2, 501.6, 587.6, 667.8, 706.5], Na: [589.0, 589.6], Ne: [540.1, 585.2, 588.2, 594.5, 607.4, 609.6, 614.3, 616.4, 621.7, 626.6, 633.4, 638.3, 640.2, 650.7, 659.9, 692.9, 703.2], Hg: [404.7, 435.8, 546.1, 577.0, 579.1] };
  var REG = [[1e-14, 1e-11, 'gamma rays'], [1e-11, 1e-8, 'X-rays'], [1e-8, 4e-7, 'ultraviolet'], [4e-7, 7e-7, 'visible'], [7e-7, 1e-3, 'infrared'], [1e-3, 1, 'microwaves'], [1, 1e4, 'radio waves']];
  function regionOf(m) { for (var i = 0; i < REG.length; i++) if (m < REG[i][1]) return REG[i][2]; return 'radio waves'; }
  function photon(nm) { var lam = nm * 1e-9, nu = KP.c / lam, E = KP.h * nu; return { nu: nu, E: E, Emol: E * KP.NA / 1000, eV: E / 1.602176634e-19 }; }
  function hLevel(n) { return -KP.RH / (n * n); }
  var SERIES = { 1: 'Lyman', 2: 'Balmer', 3: 'Paschen', 4: 'Brackett', 5: 'Pfund' };
  R('ch-spectrum', function (elx, o) {
    o = opt(o, { mode: 'wave', lambda: 500, intensity: 3, metal: 'Na', phi: null, el: 'H', from: 3, to: 2, series: null });
    var mode = o.mode, quiet = !!(o.quiet || o.readout === false), S = { nm: num(o.lambda, 500), I: clamp(num(o.intensity, 3), 0, 10), from: clamp(M.round(num(o.from, 3)), 1, 7), to: clamp(M.round(num(o.to, 2)), 1, 7), t: 0, pick: 0, ej: [] };
    var F = frame(elx, o, { wave: 'The electromagnetic spectrum', photo: 'The photoelectric effect', levels: 'Energy levels and spectral lines', molecule: 'What light does to a molecule', color: 'Color absorbed and color seen' }[mode] || 'Light');
    var c = F.canvas({ aspect: mode === 'color' ? 1.8 : 1.7, min: 280, max: 430, narrow: 0.9 }), H = { draw: function () { }, focused: function () { return false; } };
    var phi = o.phi != null ? num(o.phi, 2.46) : (WF[o.metal] || WF.Na);
    function logX(m, x0, x1) { return x0 + (log10(m) + 14) / 18 * (x1 - x0); } // 1e-14 m to 1e4 m
    function draw() {
      var ctx = c.ctx, k = pal(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      ({ wave: drawWave, photo: drawPhoto, levels: drawLevels, molecule: drawMolecule, color: drawColor }[mode] || drawWave)(ctx, k);
    }
    function drawWave(ctx, k) {
      var x0 = 20, x1 = c.w - 20, sy = c.h * 0.62, sh = 30, m = S.nm * 1e-9;
      var nar = c.w < 560, rowEnd = [], rows = 1; REG.forEach(function (r, i) { var a = logX(M.max(r[0], 1e-14), x0, x1), b = logX(M.min(r[1], 1e4), x0, x1); ctx.fillStyle = i % 2 ? (k.dark ? '#22332a' : '#eef3ef') : (k.dark ? '#1b2a22' : '#f7faf8'); ctx.fillRect(a, sy, b - a, sh); if (r[2] === 'visible') return; if (!nar) { txt(ctx, r[2], (a + b) / 2, sy + sh + 12, { size: M.min(11, (b - a) / 6), align: 'center', color: k.ink }); return; } var lw = tw(ctx, r[2], 9), lc = clamp((a + b) / 2, x0 + lw / 2, x1 - lw / 2), rr0 = 0; while (rowEnd[rr0] != null && rowEnd[rr0] > lc - lw / 2 - 4) rr0++; rowEnd[rr0] = lc + lw / 2; rows = M.max(rows, rr0 + 1); txt(ctx, r[2], lc, sy + sh + 10 + rr0 * 11, { size: 9, align: 'center', color: k.ink }); }); var tkY = nar ? 12 + rows * 11 : 0;
      var va = logX(4e-7, x0, x1), vb = logX(7e-7, x0, x1); for (var x = va; x < vb; x++) { ctx.fillStyle = wlColor(400 + (x - va) / (vb - va) * 300); ctx.fillRect(x, sy, 1.5, sh); } txt(ctx, 'visible', (va + vb) / 2, sy - 8, { size: 10, align: 'center', color: k.ink, bold: true });
      ctx.strokeStyle = k.labLine; ctx.strokeRect(x0, sy, x1 - x0, sh); [[1e-12, '1 pm'], [1e-9, '1 nm'], [1e-6, '1 µm'], [1e-3, '1 mm'], [1, '1 m'], [1e3, '1 km']].forEach(function (t) { var xx = logX(t[0], x0, x1); if (tkY) { line(ctx, [[xx, sy + sh], [xx, sy + sh + 5]], k.muted, 1); line(ctx, [[xx, sy + sh + 16 + tkY * 0.6], [xx, sy + sh + 22 + tkY * 0.6]], k.muted, 1); } else line(ctx, [[xx, sy + sh], [xx, sy + sh + 22]], k.muted, 1); txt(ctx, t[1], xx, sy + sh + 30 + tkY * 0.6, { size: 9, align: 'center' }); });
      var ay2 = sy + sh + 46 + tkY * 0.6, lt2 = 'longer wavelength, lower energy'; if (tw(ctx, lt2, 10) > x1 - 124 - x0) { var tY = sy + sh + 30 + tkY * 0.6; txt(ctx, lt2, x1, tY + 16, { size: 10, align: 'right' }); arrow(ctx, x1 - 120, tY + 28, x1, tY + 28, k.muted, 1.5, 7); } else { arrow(ctx, x1 - 120, ay2, x1, ay2, k.muted, 1.5, 7); txt(ctx, lt2, x1 - 124, ay2, { size: 10, align: 'right' }); }
      // the marker and the wave above it (drawn to a relative scale)
      var mx = logX(m, x0, x1); line(ctx, [[mx, sy - 4], [mx, sy + sh + 4]], k.ink, 3); knob(ctx, mx, sy + sh / 2, k.ink, 8); H.draw(ctx);
      var col = S.nm >= 380 && S.nm <= 750 ? wlColor(S.nm) : k.acc, per = clamp(14 + (log10(m) + 14) * 11, 10, 220), amp = c.h * (c.w < 560 ? 0.12 : 0.16), wy = c.h * (c.w < 560 ? 0.3 : 0.25); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); for (var xx2 = x0; xx2 <= x1; xx2 += 2) { var yy = wy + amp * M.sin(TAU * (xx2 - S.t * 40) / per); if (xx2 === x0) ctx.moveTo(xx2, yy); else ctx.lineTo(xx2, yy); } ctx.stroke(); ctx.restore();
      for (var p = 0; p < S.I; p++) { var px = x0 + ((p * 97 + S.t * 90) % (x1 - x0)); ctx.fillStyle = rgba(k.gold, 0.85); ctx.beginPath(); ctx.arc(px, wy - amp - 12, 5, 0, TAU); ctx.fill(); } txtw(ctx, 'photons (same size; brighter light only means more of them)', x0, wy - amp - 26, x1 - x0, { size: 10, color: k.muted, up: true });
    }
    function drawPhoto(ctx, k) {
      var P = photon(S.nm), KE = P.eV - phi, plateX = c.w * 0.62, col = S.nm >= 380 && S.nm <= 750 ? wlColor(S.nm) : (S.nm < 380 ? '#8f5fd1' : '#c0392b');
      ctx.fillStyle = k.dark ? '#7b8a92' : '#9aa5ad'; ctx.fillRect(plateX, c.h * 0.15, 18, c.h * 0.6); txt(ctx, (o.phi != null ? 'metal' : (BYS[o.metal] || BYS.Na).name.toLowerCase()) + (quiet ? '' : ' (φ = ' + fm(phi, 2) + ' eV)'), plateX + 9, c.h * 0.8, { size: 11, align: 'center', bold: true, color: k.ink });
      for (var i = 0; i < S.I; i++) { var f = (S.t * 0.8 + i / M.max(1, S.I)) % 1, px = lerp(20, plateX, f), py = c.h * 0.2 + (i * 37 % (c.h * 0.5)); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (var j = 0; j < 22; j++) { var xx = px - 22 + j, yy = py + 5 * M.sin(j * 0.9); if (j) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); } ctx.stroke(); }
      if (KE > 0) { for (var e = 0; e < S.I; e++) { var g = (S.t * (0.3 + M.sqrt(KE) * 0.25) + e / M.max(1, S.I)) % 1, ex = plateX + 18 + g * (c.w - plateX - 30), ey = c.h * 0.22 + (e * 41 % (c.h * 0.46)) - g * 20; ball(ctx, ex, ey, 5, 'e', { color: k.blue }); } }
      else txt(ctx, 'no electrons leave', plateX + 30, c.h * 0.45, { size: 12, bold: true, color: k.red });
      txt(ctx, 'light', 24, c.h * 0.1, { size: 11, bold: true, color: k.ink }); var ejw = tw(ctx, 'ejected electrons', 11, true); txt(ctx, 'ejected electrons', M.min(plateX + 30, c.w - ejw - 6), c.h * 0.1, { size: 11, bold: true, color: k.ink });
    }
    function drawLevels(ctx, k) {
      if (o.el !== 'H') { drawStrip(ctx, k, LINES[o.el] || LINES.Na, 20, c.h * 0.2, c.w - 40, 60, true); txtw(ctx, (BYS[o.el] || BYS.Na).name + ': bright lines in its emission spectrum', 20, c.h * 0.2 - 12, c.w - 40, { size: 12, bold: true, color: k.ink, up: true }); drawStrip(ctx, k, LINES[o.el] || LINES.Na, 20, c.h * 0.35 + 110, c.w - 40, 40, false); txtw(ctx, 'the same lines missing from white light (absorption)', 20, c.h * 0.35 + 98, c.w - 40, { size: 11, color: k.ink, bold: true, up: true }); return; }
      var lx0 = 60, lx1 = c.w < 560 ? c.w - 20 : c.w * 0.55, top = 36, bot = c.h - 96, Y = function (E) { return bot - (E - hLevel(1)) / (-hLevel(1)) * (bot - top); };
      var lastLab = 1e9; for (var n = 1; n <= 7; n++) { var y = Y(hLevel(n)), on = n === S.from || n === S.to, roomy = lastLab - y >= 12; line(ctx, [[lx0, y], [lx1, y]], on ? k.acc : k.ink, on ? 3 : 1.6); if (roomy || on) { txt(ctx, 'n = ' + n, lx0 - 6, y, { size: 11, align: 'right', color: k.ink, bold: on }); if (!quiet && c.w >= 560) txt(ctx, sci(hLevel(n), 3) + ' J', lx1 + 6, y, { size: 10 }); lastLab = y; } if (H.focused() && S.pick === n) focusBox(ctx, lx0 - 50, y - 8, lx1 - lx0 + 54, 16); }
      line(ctx, [[lx0, Y(0)], [lx1, Y(0)]], k.muted, 1, [4, 4]); txt(ctx, 'n = ∞ (electron free, 0 J)', lx1, Y(0) - 9, { size: 10, align: 'right', color: k.muted });
      if (S.from !== S.to) { var dn = S.from > S.to, nm = 1e9 * KP.h * KP.c / M.abs(hLevel(S.from) - hLevel(S.to)), col = nm >= 380 && nm <= 750 ? wlColor(nm) : k.muted, ax = lx0 + (lx1 - lx0) * (c.w < 560 ? 0.2 : 0.35); arrow(ctx, ax, Y(hLevel(S.from)), ax, Y(hLevel(S.to)), col === k.muted ? k.acc : col, 4, 11); var gapPx = M.abs(Y(hLevel(S.from)) - Y(hLevel(S.to))), wy = gapPx < (c.w < 560 ? 64 : 34) ? M.max(Y(hLevel(S.from)), Y(hLevel(S.to))) + 30 : (Y(hLevel(S.from)) + Y(hLevel(S.to))) / 2; ctx.save(); ctx.strokeStyle = col === k.muted ? k.acc : col; ctx.lineWidth = 2; ctx.beginPath(); for (var j = 0; j < 40; j++) { var xx = ax + 12 + j * 1.5, yy = wy + 5 * M.sin(j * 0.7 - S.t * 6); if (j) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); } ctx.stroke(); ctx.restore(); var ly = wy - (c.w < 560 ? 13 : 7); txt(ctx, dn ? 'photon given off' : 'photon absorbed', ax + 76, ly, { size: 11, bold: true, color: k.ink }); var ser = SERIES[M.min(S.from, S.to)] ? SERIES[M.min(S.from, S.to)] + ' series' : ''; if (c.w < 560) { if (!quiet) txt(ctx, fm(nm, 1) + ' nm', ax + 76, ly + 13, { size: 11, color: k.ink }); if (ser) txt(ctx, ser, ax + 76, ly + (quiet ? 13 : 26), { size: 11, color: k.ink }); } else txt(ctx, (quiet ? '' : fm(nm, 1) + ' nm' + (ser ? ' · ' : '')) + ser, ax + 76, ly + 13, { size: 11, color: k.ink }); }
      // the spectrum strip: Balmer (visible) lines of hydrogen, the current one highlighted
      var vis = []; for (var hi = 3; hi <= 7; hi++) vis.push(1e9 * KP.h * KP.c / (hLevel(hi) - hLevel(2)));
      drawStrip(ctx, k, vis, 20, c.h - 50, c.w - 40, 24, S.from > S.to); txt(ctx, S.from > S.to ? 'hydrogen emission: bright lines' : 'hydrogen absorption: dark lines', 20, c.h - 62, { size: 10, color: k.ink, bold: true });
    }
    function drawStrip(ctx, k, lines, x, y, w, h, emission) { var X = function (nm) { return x + (nm - 380) / 370 * w; }; if (emission) { ctx.fillStyle = '#0b0f0d'; ctx.fillRect(x, y, w, h); } else for (var i = 0; i < w; i++) { ctx.fillStyle = wlColor(380 + i / w * 370); ctx.fillRect(x + i, y, 1.5, h); } var lastX = -1e9; lines.slice().sort(function (p, q) { return p - q; }).forEach(function (nm) { if (nm < 380 || nm > 750) return; ctx.fillStyle = emission ? wlColor(nm) : '#0b0f0d'; ctx.fillRect(X(nm) - 1.5, y, 3, h); if (!quiet && w > 400 && X(nm) - lastX > 30) { txt(ctx, fm(nm, 1), X(nm), y + h + 9, { size: 9, align: 'center' }); lastX = X(nm); } }); ctx.strokeStyle = k.labLine; ctx.strokeRect(x, y, w, h); [400, 500, 600, 700].forEach(function (nm) { line(ctx, [[X(nm), y + h], [X(nm), y + h + 3]], k.muted, 1); txt(ctx, nm + ' nm', X(nm) + 3, y + h + 20, { size: 9, align: 'left', color: k.muted }); }); }
    function drawMolecule(ctx, k) { var reg = regionOf(S.nm * 1e-9), cx = c.w / 2, cy = c.h * 0.45, u = M.min(46, c.h * 0.16), rot = 0, stretch = 0, excite = false; if (reg === 'microwaves') rot = S.t * 2; else if (reg === 'infrared') stretch = 0.18 * M.sin(S.t * 14); else if (reg === 'visible' || reg === 'ultraviolet') excite = (S.t % 2) > 1;
      var sp = { atoms: [{ s: 'O', x: 0, y: 0 }, { s: 'H', x: -0.6 * (1 + stretch), y: 0.48 * (1 + stretch) }, { s: 'H', x: 0.6 * (1 - stretch), y: 0.48 * (1 - stretch) }], bonds: [[0, 1, 1], [0, 2, 1]], r: 1.2, charge: 0, f: 'H2O' }; drawMol(ctx, sp, cx, cy, u * 1.6, { rot: rot });
      if (excite) { ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(cx, cy, u * 2.2, 0, TAU); ctx.stroke(); ctx.restore(); ball(ctx, cx + u * 2.2, cy - 4, 5, 'e', { color: k.blue }); }
      txt(ctx, reg === 'microwaves' ? 'microwaves make the molecule turn' : reg === 'infrared' ? 'infrared makes the bonds stretch and bend' : reg === 'visible' || reg === 'ultraviolet' ? 'visible and UV light lift an electron to a higher level' : reg === 'radio waves' ? 'radio waves: too little energy to change the molecule much' : 'X-rays and gamma rays can knock electrons out entirely', cx, c.h - 24, { size: 12, bold: true, align: 'center', color: k.acc }); }
    function drawColor(ctx, k) { var cx = c.w * (c.w >= 560 ? 0.3 : 0.5), cy = c.h * 0.48, R0 = M.min(c.w * 0.22, c.h * 0.4), an = colorName(S.nm), comp = compColor(S.nm), order = ['red', 'orange', 'yellow', 'green', 'blue', 'violet'];
      order.forEach(function (nm2, i) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R0, -PI / 2 + i * TAU / 6 - TAU / 12, -PI / 2 + (i + 1) * TAU / 6 - TAU / 12); ctx.closePath(); ctx.fillStyle = NAMED[nm2]; ctx.globalAlpha = nm2 === an || nm2 === comp ? 1 : 0.3; ctx.fill(); ctx.globalAlpha = 1; if (nm2 === an || nm2 === comp) { ctx.strokeStyle = k.ink; ctx.lineWidth = 2.5; ctx.stroke(); } var a = -PI / 2 + i * TAU / 6, ca = M.cos(a); txt(ctx, nm2, cx + (R0 + 8) * ca, cy + (R0 + 14) * M.sin(a), { size: 11, align: ca > 0.3 ? 'left' : ca < -0.3 ? 'right' : 'center', color: k.ink, bold: nm2 === an || nm2 === comp }); });
      if (c.w >= 560 && comp) { var bx = c.w * 0.62; panel(ctx, bx, cy - 60, 120, 120, { r: 14, fill: NAMED[comp] }); txt(ctx, 'looks ' + comp, bx + 60, cy + 76, { size: 13, bold: true, align: 'center', color: k.ink }); txt(ctx, 'absorbs ' + an + (quiet ? '' : ' (' + fm(S.nm, 0) + ' nm)'), bx + 60, cy - 72, { size: 12, align: 'center', color: k.ink }); } }
    function report() {
      var s, P = photon(S.nm);
      if (mode === 'wave') s = quiet ? 'Move the marker along the spectrum.' : 'λ = ' + sf(S.nm, 3) + ' nm (' + regionOf(S.nm * 1e-9) + '): ν = c/λ = ' + sciH(P.nu, 3) + ' Hz; E = hν = ' + sciH(P.E, 3) + ' J per photon, ' + sciH(P.Emol, 3) + ' kJ per mole of photons. Longer wavelength, lower frequency, lower energy.';
      else if (mode === 'photo') { var KE = P.eV - phi, nu0 = phi * 1.602176634e-19 / KP.h; s = (quiet ? '' : 'Photon energy ' + fm(P.eV, 2) + ' eV, work function ' + fm(phi, 2) + ' eV, threshold ν₀ = φ/h = ' + sciH(nu0, 3) + ' Hz (λ = ' + fm(KP.h * KP.c / (phi * 1.602176634e-19) * 1e9, 0) + ' nm). ') + (KE > 0 ? (quiet ? 'Electrons leave the metal.' : 'Each electron leaves with up to ' + fm(KE, 2) + ' eV of kinetic energy.') : 'Below the threshold frequency no electrons leave, however bright the light.') + ' Brighter light makes more electrons leave, not faster ones; a higher frequency makes them faster.'; }
      else if (mode === 'levels') { if (o.el !== 'H') s = (BYS[o.el] || BYS.Na).name + ' gives off light only at certain wavelengths' + (quiet ? '' : ': ' + (LINES[o.el] || []).map(function (x) { return fm(x, 1); }).join(', ') + ' nm') + '. Each line is a jump between two fixed energy levels.'; else { var dE = M.abs(hLevel(S.from) - hLevel(S.to)), nm = 1e9 * KP.h * KP.c / dE; s = S.from === S.to ? 'Choose two different levels.' : quiet ? 'A jump from n = ' + S.from + ' to n = ' + S.to + '.' : 'n = ' + S.from + ' → n = ' + S.to + ': ΔE = 2.18 × 10<sup>−18</sup> J × |1/' + S.to + '² − 1/' + S.from + '²| = ' + sciH(dE, 3) + ' J, so λ = hc/ΔE = ' + fm(nm, 1) + ' nm (' + regionOf(nm * 1e-9) + (SERIES[M.min(S.from, S.to)] ? ', ' + SERIES[M.min(S.from, S.to)] + ' series' : '') + '). ' + (S.from > S.to ? 'Falling, the atom gives off this photon.' : 'Rising, the atom absorbs this photon.') + ' The levels crowd together as n grows, so bigger drops give shorter wavelengths.'; } }
      else if (mode === 'molecule') s = (quiet ? '' : sf(S.nm, 3) + ' nm, ' + regionOf(S.nm * 1e-9) + ' (' + sciH(P.Emol, 3) + ' kJ/mol). ') + 'Each region does something different: microwaves turn molecules, infrared makes bonds vibrate, and visible and ultraviolet light move electrons to higher levels.';
      else { var an = colorName(S.nm), comp = compColor(S.nm); s = comp ? 'Absorbing ' + an + ' light' + (quiet ? '' : ' (' + fm(S.nm, 0) + ' nm)') + ' leaves the rest of white light, which looks ' + comp + ', the color across the wheel.' : 'Light at ' + fm(S.nm, 0) + ' nm is not visible, so absorbing it does not change the color we see.'; }
      F.say(s); F.setAlt({ wave: 'The electromagnetic spectrum on a log scale with a marker and the wave at that wavelength.', photo: 'Light shining on a metal plate, with electrons leaving when the photons have enough energy.', levels: 'Hydrogen energy levels with a jump and its spectral line.', molecule: 'A water molecule responding to light of the chosen wavelength.', color: 'A color wheel showing the color absorbed and the color seen.' }[mode]);
    }
    // controls
    if (mode === 'levels' && o.el === 'H') {
      var Yn = function (n) { var top = 36, bot = c.h - 96; return bot - (hLevel(n) - hLevel(1)) / (-hLevel(1)) * (bot - top); };
      H = keyNav(c, { tap: function (px, py) { var best = 0, bd = 14; for (var n = 1; n <= 7; n++) { var d = M.abs(Yn(n) - py); if (d < bd) { bd = d; best = n; } } if (!best) return; if (S.stage === 'to') { S.to = best; S.stage = 'from'; } else { S.from = best; S.stage = 'to'; } draw(); report(); }, key: function (e) { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { S.pick = clamp((S.pick || 1) + (e.key === 'ArrowUp' ? 1 : -1), 1, 7); draw(); return true; } if (e.key === 'Enter' || e.key === ' ') { if (S.stage === 'to') { S.to = S.pick || 1; S.stage = 'from'; } else { S.from = S.pick || 1; S.stage = 'to'; } draw(); report(); return true; } return false; }, change: draw });
      F.html('chv-note').textContent = 'Tap the starting level, then the level it jumps to (or use the up and down arrows and Enter).';
      if (F.edit) { btn(F.ctl, 'Swap: emission ↔ absorption', function () { var t = S.from; S.from = S.to; S.to = t; draw(); report(); }); }
    }
    if ((mode === 'wave' || mode === 'photo' || mode === 'molecule' || mode === 'color') && F.edit) {
      var lo = mode === 'wave' || mode === 'molecule' ? -2 : log10(150), hi = mode === 'wave' || mode === 'molecule' ? 9 : log10(750); if (mode === 'color') { lo = log10(380); hi = log10(750); }
      sl(F.ctl, { label: 'Wavelength', min: lo, max: hi, step: 0.002, value: log10(S.nm), fmt: function (v) { var nm = M.pow(10, v); return nm >= 1e6 ? sf(nm / 1e9, 3) + ' m' : nm >= 1000 ? sf(nm / 1000, 3) + ' µm' : sf(nm, 3) + ' nm'; }, input: function (v) { S.nm = M.pow(10, v); draw(); report(); } });
      if (mode === 'wave' || mode === 'photo') sl(F.ctl, { label: 'Brightness', min: 0, max: 10, step: 1, value: S.I, input: function (v) { S.I = v; draw(); report(); } });
      if (mode === 'wave') { var x0 = 20; H = hand(c, [{ get: function () { return [x0 + (log10(S.nm * 1e-9) + 14) / 18 * (c.w - 40), c.h * 0.62 + 15]; }, set: function (px) { S.nm = clamp(M.pow(10, (px - x0) / (c.w - 40) * 18 - 14) * 1e9, 1e-5, 1e13); report(); }, key: function (dx) { S.nm = clamp(S.nm * M.pow(10, dx * 0.05), 1e-5, 1e13); report(); } }], { change: draw }); }
    }
    var A = anim(elx, function (dt) { S.t += dt; draw(); }, mode !== 'color' && mode !== 'levels' || (mode === 'levels' && o.el === 'H')); if (F.edit && mode !== 'color') playBtn(F.ctl, A);
    redraw(c, draw); draw(); report(); return { draw: draw };
  });
  CH.photon = photon; CH.hLevel = hLevel; CH.WF = WF; CH.LINES = LINES;

  // ---------- the model, shared with course builders and the node tests ----------
  CH.EL = EL; CH.el = el; CH.config = config; CH.cfgStr = cfgStr; CH.shells = shells; CH.valence = valence; CH.family = FAMN;
  CH.parseF = parseF; CH.molarMass = molarMass; CH.fH = fH; CH.fT = fT; CH.parseEq = parseEq; CH.eqH = eqH; CH.sci = sci; CH.K = K; CH.KP = KP;
  QUEUE.forEach(function (q) { V.register(q[0], q[1]); });
})(window, document);
