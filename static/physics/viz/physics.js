/* =====================================================================================================
   Physics Ladder visual kit: 36 visuals named ph-…, registered with window.MathLadder.viz.register.
   Loaded after static/math/viz/core.js. Vanilla JavaScript, no libraries, no network requests.

   USE
     <div class="ml-viz" data-viz="ph-orbit" data-opts='{"mode":"kepler","e":0.5}'></div>
     In generator problems: viz: { name: 'ph-orbit', opts: { … } }.

   OPTIONS EVERY VISUAL TAKES
     interactive: false   problem mode: the picture is frozen exactly as the options describe it (no controls, no
                          animation, no randomness; seeded scenes always draw the same picture).
     quiet: true          hides every number or overlay that would give the answer away: the live-number grid, the
                          readout text and computed arrows or values drawn on the canvas. Given quantities, labels,
                          axes and scales stay. readout: false does the same.
     show: [names]        turns overlays on; hide: [names] turns them off. 'values' (numbers drawn on the canvas) is an
                          overlay in every visual. In quiet mode computed overlays are off unless listed in show.
     tags: {id: 'A', …}   puts letter tags on named elements so a question can ask "Which arrow is …?". Ids are listed
                          per visual below; an id written like f0… means f0, f1, f2, … in drawing order.
     panel: [{…} × 4]     four small frozen variants in a 2 × 2 grid labeled A–D, for "Which one matches?". Each entry
                          is merged over the other options.
     t                    the moment to show (seconds unless a visual says otherwise); in problem mode, the frozen frame.
     play: true|false     start playing or paused. Default: plays, except that nothing autoplays when the viewer prefers
                          reduced motion. Every animation has Play, Step and a time slider.
     task: 'text'         a short instruction above the canvas (lesson mode only).
     label: 'text'        replaces the group's aria-label.
     lab: '/path/'        "Open in the Science Lab" link (lesson mode only; never in problems or panels).
     height: px           fixes the canvas height.
     g                    gravitational field strength where it applies (default 9.8 m/s²).
   Every canvas has an aria-label that describes its current state in words, and the readout under it gives the
   explanation as text. Keyboard: Tab to the canvas; arrow keys move the selected point (Shift for bigger steps);
   Enter or N selects the next point. Units are SI unless a visual says otherwise.

   THE VISUALS: options (defaults), overlays for show/hide, element ids for tags

   ph-motion   A cart on a track (vertical: true, a ball thrown straight up) with x–t, v–t and a–t graphs.
               x0 (0), v0 (2; vertical 14.7), a (0; vertical −g), tmax (6), segments: [{dur, a}] (piecewise constant
               acceleration; overrides a and tmax), graphs: ['x','v','a'], units: {x: 'm', t: 's'}, xmin/xmax (track),
               cursor (time of the cursor), drag: 'v' (drag the corners of the v–t graph).
               Overlays: track, dots, vArrow, aArrow, tangent, area, odometer. Ids: cart, vArrow, aArrow, tangent,
               p0…, seg0….
   ph-graph    A graph with slope and area tools. fn: 'expression in x' or pts: [[x, y], …] (straight segments),
               domain [a, b], range [lo, hi], xlab, ylab, xunit, yunit, slopeUnit/areaUnit (default: from the units),
               tool: 'slope'|'area'|'both'|'none', at (slope point), a, b (area limits), snap, drag: false, grid: false.
               Overlays: triangle, shade, net. Ids: p, tangent, shade.
   ph-vectors  mode: 'components'|'add'|'subtract'|'relative'. vecs: [{x, y, label} or {mag, ang, label}] (up to six;
               angles from +x counterclockwise), axesAngle (tilted axes, degrees), units, snap (0.5), drag: false;
               relative: {vMedium (1.5), vObject (3), heading (0°), width (60)} for a boat crossing a river.
               Overlays: components, resultant, magnitudes, angles. Ids: v0…, vx0…, vy0…, angle0…, resultant.
   ph-projectile  v0 (20), angle (40), h (0, launch height), yLand (0), drag (0; a drag constant adds air resistance),
               targetX, t (fraction 0–1 of the flight). Overlays: strobe, v, vx, vy, apex, range, ghost (a dropped
               ball), twin (the complementary angle), grid. Ids: s0…, apex, landing, ghost.
   ph-fbd      mode: 'show'|'build'|'pairs'; scene: 'block'|'hanging'|'incline'|'elevator'|'car'|'ball-air'|
               'two-blocks'|'person'|'satellite'; angle (30, incline); forces: [{type, mag, angle, by, on}] with type
               gravity, normal, tension, friction, applied, spring, drag, buoyant or contact; pairs: [[i, j], …];
               motion: {v, vAng, a, aAng}; palette (force types offered in build mode); expect: true (build mode
               checks the learner's diagram); axesAngle; unit ('N'); scaleMax; drag: true (drag arrow tips).
               Overlays: net, components. Ids: obj, f0…, net.
   ph-dynamics scene: 'cart'|'incline'|'atwood'|'table'|'push-two'|'train'|'elevator'|'heavy-pulley'|'movable-pulley';
               m1, m2, m3, F, angle (20), mus, muk, pulleyM (4), pulleyR (0.1), elevatorA (number or [{dur, a}]),
               push: false (the cart coasts). Overlays: fbd, graph. Ids: m1, pulley.
   ph-circular mode: 'uniform'|'cut' (the string is cut)|'flat-curve'|'banked'|'vertical'|'nonuniform'; r, v, m,
               bank (20°), mu (0.6), dvdt (1), at ('top'|'bottom'|degrees around a vertical loop), dip: true.
               Overlays: v, a, forces, components, path. Ids: obj, v, a, ac, at, f0….
   ph-energy   mode: 'scene'|'bars'|'ucurve'|'chart'.
               scene: 'track'|'ramp'|'pendulum'|'spring'|'slide'|'drop' with m, h0, v0, k, mu, x0, L, theta0,
               track: [[x, y], …] (smoothed unless smooth: false), system: ['object','earth','spring'] (what is inside
               the system; work from outside shows as W), ref (height where U = 0), bars: ['K','Ug','Us','Eth'].
               ucurve: U: 'expression in x', E, m, x0, domain, range, xunit, unit.
               chart: chart: {before: {K, Ug, Us, Eth}, W, after: {…}} ('?' marks the unknown bar), unit.
               Overlays: bars, turning, equilibria, force, kgap. Ids: bK, bUg, bUs, bEth, bW, eq0…, turn0…, p0….
   ph-collision mode: '1d'|'2d'|'explode'|'rocket'|'impulse'; m1 (2), m2 (1), v1 (3), v2 (0), e (1 elastic … 0 they
               stick), angle (35°, line of centers in 2-D), m0 (1000), mf (400), ve (2000), packets (10) for the
               rocket, bumper: 'hard'|'soft'. Overlays: p, K, vectors, cm, Ft, both. Ids: pBefore, pAfter, cm, ft.
   ph-torque   scene: 'seesaw'|'beam'|'wrench'|'door'|'rod'|'sign'|'ladder'|'lever1'|'lever2'|'lever3'|'pulley-block'|
               'ramp'; beamLength, beamMass, pivot (its x), forces: [{x, mag, angle (−90 = down), label}], masses:
               [{x, m}], cableAngle (35°), pivotChoice (where torques are taken), drag: false; ladder: angle (60),
               beamMass (15), m (70), d (2.5), mu (0.4); machines: load (400), strands (4), rampLength, rampHeight.
               Overlays: leverArm, torques, net, components, hinge, work. Ids: pivot, f0…, arm0…, m0….
   ph-rotation mode: 'wheel'|'inertia'|'slices'|'race'|'skater'|'skid'|'gyro'|'pulley'; omega0, angle (15°, race),
               masses and radii (inertia), shapes: ['hoop','disk','sphere','shell'], density ('expression in x'),
               rIn/rOut (skater's arms), v0 and mu (skid), m, M, R, L. Ids: pt0…, cm, hoop, disk, sphere, shell.
   ph-oscillator type: 'spring'|'vertical-spring'|'pendulum'|'physical'; m (1), k (16), L (1), A (0.2), theta0 (15°),
               b (0, damping), drive: {F0, w}, compare: {m, k, L, A, theta0} (a second oscillator beside it),
               traces: ['x','v','a']. Overlays: energy, period, curve. Ids: mass, eq, turnL, turnR, tx, tv, ta.
   ph-wave     mode: 'travel'|'pulse'|'superpose'|'standing-string'|'standing-pipe'|'beats'|'em'|'digital';
               A, lambda (2), f (0.5), v (or tension and mu), n (harmonic), L (10), long: true (longitudinal),
               boundary: 'fixed'|'free'|'junction' (mu2 = 4 beyond the junction), pipe: 'open'|'closed',
               view: 'displacement'|'pressure', graphs: ['snapshot','history'], mark (x of a marked point),
               waves: [{A, lambda or w (pulse width), x0, dir, phase}], f1/f2 (beats), polarizers: [angles] (em),
               bits (3) and noise (0.25) (digital). Overlays: lam, period. Ids: p0…, mark, node0…, anti0…, lam, amp.
   ph-doppler  mode: 'sound'|'shock'|'light'; vs (source speed), vwave (343), f (440), observers: [{x, y}];
               light: v (km/s, + away), lines: [nm] or lineNm. Overlays: cone. Ids: source, obsA, obsB, cone, line.
   ph-fluids   mode: 'pressure-area'|'depth'|'manometer'|'hydraulic'|'buoyancy'|'float'|'flow'|'drain'; rho (1000),
               depth, F, A, A1, A2, areas, shapes: ['narrow','wide','flared','tapered'], objRho, objV,
               objects: [{label, rho, w}], v1, h1, h2, gauge, h0, Ahole, Atank, t. Ids: p, p1, p2, obj, cup.
   ph-gas      Hard-sphere atoms in a 2-D box with a piston. N (80), T (300 K), V (1), masses: [1] or [1, 4] (a mix),
               fixed: 'T'|'P'|'V', seed. Overlays: histogram, readouts, trails, celsius. Ids: piston, thermo, hist.
   ph-thermal  mode: 'heating-curve'|'mix'|'slab'|'transfer'|'entropy'; m (1 kg of water), T0 (−20), T1 (120),
               q (fraction 0–1 of the heat added), objects: [{m, c, T, label}], k or material ('copper', 'aluminum',
               'steel', 'glass', 'brick', 'water', 'wood', 'foam', 'air'), A, d, dT, Th, Tc, Q. Overlays: labels.
               Ids: seg0…, obj0…, slab.
   ph-pv       P in kPa and V in liters (1 kPa·L = 1 J). mode: 'process'|'cycle'|'engine'|'fridge'; states: [[P, V], …],
               path: ['isobaric'|'isochoric'|'isothermal'|'adiabatic', …] (one per leg), n (0.1 mol), gamma (5/3),
               convention: 'on'|'by' (the sign of W), reverse: false (a fridge keeps the given direction), t,
               drag: false. Overlays: area, table, piston, flow, isotherms. Ids: s0…, leg0…, area.
   ph-efield   mode: 'points'|'polarize'|'plates'|'capacitor'|'conductor'|'gauss'|'distribution'; charges: [{q, x, y}]
               (nC, or μC with qUnit: 'μC'; positions in m), view (0.3 m across), R, test: {x, y, q}, surface:
               {x, y, r}; plates: V, d, L, v0, particle: 'electron'|'proton'; capacitor: A, d, kappa, inserted,
               battery: false (isolated), V; polarize: d; distribution: dist: {type: 'rod'|'ring'|'disk'|'line'|
               'sheet'|'ball'|'shell', Q, R, L}, dP. Overlays: lines, vectors, equipotentials, test, components, flux,
               pieces. Ids: q0…, test, surface, P0.
   ph-circuit  mode: 'dc'|'transient'|'ac'|'lc'. circuit: shorthand or a netlist.
               Shorthand: 'V(12, r=0.5) series(R1:4, par(R2:6, B1:6), S1/open)'. Source V(volts) or AC(volts, f=50).
               Parts by first letter: R resistor (Ω), B bulb (Ω), C capacitor (μF when the value is above 0.01,
               otherwise farads), L inductor (H), S switch (S1/open), A ammeter, Vm voltmeter, LED or D1 diode.
               Netlist: [{type: 'V'|'AC'|'R'|'bulb'|'C'|'L'|'S'|'LED'|'A'|'Vm', a: node, b: node, value, r, label,
               closed, f}] with layout: {node: [x, y]} (grid units) to place the nodes.
               switchAt (s), tmax (s), V0 (starting voltage, LC), t, edit: true (DC lesson editing: click a part to
               change its value, open a switch or remove a bulb). Overlays: current (moving dots), meters, voltage,
               phasors. Ids: the part labels (R1, B2, S1, …).
   ph-magnetism mode: 'magnets'|'electromagnet'|'wire'|'loop'|'solenoid'|'toroid'|'charge'|'selector'|'spectrometer'|
               'wire-force'|'two-wires'|'motor'|'biot'|'ampere'|'hall'; I, currents: [{x, y, I}], P: {x, y} (probe),
               loopPath: {x, y, r}, magnet: 'bar'|'earth', q, m, v, B, E, angle (90 = v perpendicular to B), view3d,
               masses: [u] (spectrometer), I2, L, d, N, A, carriers: 'electrons'|'positive', displacement: true.
               Overlays: lines, compass, vectors, rhr, enclosed, path. Ids: N, S, N2, S2, w0…, P0…, path, F, v.
   ph-induction mode: 'magnet-coil'|'changing-B'|'rotate'|'rails'|'generator'|'brake'|'inductor'|'transformer'|'flux';
               B, A, N, v, L, R, omega, Np, Ns, Vp, P (W), m, angle, Lh (henries), eps (EMF), Bt: 'expression in t'.
               Overlays: flux, induced-field, current, meter, graphs. Ids: magnet, loop, rod, emf, phi, Bind.
   ph-rays     element: 'plane'|'concave'|'convex'|'converging'|'diverging'|'two-lens'|'eye'|'magnifier'|'microscope'|
               'telescope'|'lensmaker'; f (cm; its sign follows the element), f2, sep, dObj, hObj, n, R1, R2,
               rays: [1, 2, 3] (principal rays), block: 'top'|'bottom', eye: {near, far}, correct: true, drag: false.
               Overlays: rays, image, focal, virtual. Ids: obj, img, F1, F2, C, ray1….
   ph-refraction mode: 'ray'|'wavefront'|'prism'|'fiber'|'brewster'|'filters'|'materials'; n1, n2, angle (from the
               normal), lambda (nm), nClad, light: 'white'|'red'|…, filter: ['red', …], objectColor, drag: false.
               Overlays: normal, angles, critical, intensity. Ids: inc, refl, refr, normal, th1, th2.
   ph-interference mode: 'two-source'|'double'|'single'|'grating'|'thin-film'|'michelson'|'rayleigh'|'bragg'|
               'electrons'; lambda (nm; bragg 0.154 nm), d (μm), a (μm), lpmm (grating), N, L (m), t (film, nm),
               nFilm, nAbove, nBelow, D, sep, planeD, theta, seed. Overlays: pattern, waves, envelope, path.
               Ids: m0…, min1, ray1, ray2.
   ph-spectrum mode: 'ruler'|'lines'|'kirchhoff'|'levels'|'bohr'|'shift'|'classes'|'populations'; lambda (nm),
               elements: ['H','He','Na','Hg','Ne'], absorb: true, levels: [eV, …], transitions: [[3, 2], …], T (K),
               v (km/s). Ids: band-gamma … band-radio, line0…, n1…, t0…, c0….
   ph-photon   mode: 'photoelectric'|'graph'|'compton'; metal ('cesium','potassium','sodium','calcium','zinc','copper')
               or phi (eV), lambda (nm), intensity (0–1), Vstop, theta (°), lambda0 (pm). Ids: beam, plate, e0,
               threshold, graphLine.
   ph-blackbody T: [K, …] or presets: ['Sun','Betelgeuse','Rigel','Sirius','stove element','person','CMB'],
               scale: 'lin'|'log', xrange [nm, nm]. Overlays: peak, visible, area, rj, swatch. Ids: peak0…, c0…, visible.
   ph-nucleus  mode: 'decay'|'chart'|'binding'|'reaction'|'ppchain'; N0 (400), halfLife (2), seed, t; nuclide: {Z, A},
               decays: ['alpha','beta-','beta+']; select (A on the binding curve); reaction: 'U-235 + n -> Ba-141 +
               Kr-92 + 3n' (atomic masses from the 2020 evaluation). Overlays: curve, halflives, arrows.
               Ids: parent, arrow0…, fe56, fusion, fission.
   ph-relativity mode: 'clock'|'contraction'|'simultaneity'|'spacetime'|'addition'|'doppler'|'gravity'; beta (0.6),
               events: [[ct, x], …], u (0.8), rs (1), r (3, in units of r_s). Overlays: lightcone, simultaneity,
               hyperbola. Ids: clockA, clockB, E0…, x', ct'.
   ph-quantum  mode: 'box'|'finite'|'barrier'|'oscillator'|'packet'|'shells'|'bands'|'coulomb'|'degenerate'; n, L (nm),
               U0 (eV), E (eV), width (nm), m (electron masses), levels, hw, Z, N, T, dk,
               material: 'metal'|'semiconductor'|'insulator'. Overlays: psi, prob. Ids: E0…, psi0…, barrier, gap.
   ph-orbit    Orbits in AU, years and solar masses; the cannon in km/s. mode: 'kepler'|'areas'|'cannon'|'energy'|
               'transfer'|'comet'|'binary'|'transit'|'shell'|'rotation-curve'|'tides'|'blackhole'|'field'; a, e, M,
               m2 (binary), v0 (cannon, km/s), r0 (cannon start radius, m), r1/r2 (transfer, AU), rp (transit: planet
               radius ÷ star radius). Overlays: foci, areas, velocity, energy, pa (P against a for the planets), rv,
               lightcurve, hollow. Ids: star, planet, F1, F2, peri, apo, A0, bK, bU, bE, cm.
   ph-sky      mode: 'sphere'|'coords'|'seasons'|'moon'|'eclipse'|'day'; lat (40), date (day of the year, 172),
               time (hours, 12), moonAge (days, 7). Overlays: horizon, equator, sunpath, solstices, ecliptic, shadow.
               Ids: zenith, ncp, horizon, sunNoon, earth, beam, moon0…moon7, moon, sun, node, umbra, marker.
   ph-hr       mode: 'diagram'|'radius'|'tracks'|'cluster'|'mass-luminosity'; highlight: ['Sun','Sirius A','Sirius B',
               'Betelgeuse','Rigel','Proxima Centauri','Vega','Aldebaran'], age (billion years, cluster).
               Overlays: regions, radii, labels. Ids: ms, giants, wd, turnoff, and each named star by its name.
   ph-cosmic   mode: 'scale'|'parallax'|'inverse-square'|'magnitudes'|'cepheids'|'hubble'|'expansion'|'scale-factor'|
               'ladder'; view: 'distances'|'planets' (scale); d (parallax: pc; inverse-square: units) or p (arcsec);
               period (days) and m (apparent magnitude) for Cepheids; H0 (70 km/s/Mpc); galaxies: [{d (Mpc),
               v (km/s)}]; omegaM (0.3), omegaL (0.7), z (1). Overlays: times, fit. Ids: star0…, rung0…, you.
   ph-star     mode: 'layers'|'profiles'|'balance'|'randomwalk'|'virial'|'sunspots'|'eddington'; stepLength (m, 0.001),
               steps (start the random walk with this many steps), M (solar masses, Eddington). Ids: core, radiative,
               convective, photosphere, chromosphere, corona, shell.

   MODELS. The physics behind every number lives in MathLadder.physModels: closed forms where they exist, otherwise
   fixed-step integrators checked against an energy or momentum balance. They are tested in node.
   ===================================================================================================== */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('physics/viz/physics.js: load math/viz/core.js first'); return; }
  var M = Math, PI = M.PI, TAU = 2 * PI, DEG = PI / 180, fm = V.fmt, mk = V.el;

  // ---------- numbers ----------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function num(v, d) { // a number from a number or a string such as "3e8", "3.0×10^8", "-2"
    if (isNum(v)) return v;
    if (typeof v === 'string' && v.trim() !== '') { var s = v.replace(/\s/g, '').replace(/−/g, '-').replace(/[×x*]10\^?\(?([-+]?\d+)\)?$/, 'e$1'); var x = +s; if (isFinite(x)) return x; }
    return d;
  }
  function arr(v) { return Array.isArray(v) ? v : v == null ? [] : [v]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺' };
  var SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  function sup(n) { return String(n).split('').map(function (ch) { return SUP[ch] || ch; }).join(''); }
  function sub(n) { return String(n).split('').map(function (ch) { return SUB[ch] || ch; }).join(''); }
  /* nf(v, sig): v to sig significant figures (default 3), trailing zeros dropped, scientific form for very large or
     small values ("3.00 × 10⁸"), real minus sign. */
  function nf(v, sig) {
    if (!isFinite(v)) return v > 0 ? '∞' : v < 0 ? '−∞' : '—';
    sig = sig || 3; if (v === 0) return '0';
    var a = M.abs(v), e = M.floor(M.log10(a) + 1e-12);
    if (e >= 5 || e <= -4) {
      var ms = (v / M.pow(10, e)).toFixed(sig - 1); if (M.abs(+ms) >= 10) { e++; ms = (v / M.pow(10, e)).toFixed(sig - 1); }
      return ms.replace('-', '−') + ' × 10' + sup(e);
    }
    var s = v.toFixed(M.max(0, sig - 1 - e)); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '-0') s = '0'; return s.replace('-', '−');
  }
  function un(v, unit, sig) { return nf(v, sig) + (unit ? ' ' + unit : ''); }
  function fd(v, d, unit) { return fm(v, d == null ? 2 : d) + (unit ? ' ' + unit : ''); }
  function niceStep(span, n) { var raw = M.abs(span) / M.max(1, n), m = M.pow(10, M.floor(M.log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m; }
  function tickLabel(v, step) { var d = 0; while (d < 6 && M.abs(M.round(step * M.pow(10, d)) - step * M.pow(10, d)) > 1e-6 * M.max(1, step * M.pow(10, d))) d++; if (M.abs(v) >= 1e5 || (M.abs(v) < 1e-3 && v !== 0)) return nf(v, 2); var s = v.toFixed(d); if (/^-0(\.0*)?$/.test(s)) s = s.slice(1); return s.replace('-', '−'); }
  function rk4(F, t, y, h) { var k1 = F(t, y), a = y.map(function (v, i) { return v + h / 2 * k1[i]; }), k2 = F(t + h / 2, a), b = y.map(function (v, i) { return v + h / 2 * k2[i]; }), k3 = F(t + h / 2, b), c = y.map(function (v, i) { return v + h * k3[i]; }), k4 = F(t + h, c); return y.map(function (v, i) { return v + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]); }); }
  function rng(seed) { var a = (seed >>> 0) || 1; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = M.imul(t ^ t >>> 15, t | 1); t ^= t + M.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ---------- expressions: the CAS when the page has it, otherwise a small parser of the same plain syntax ----------
  var FNS = { sin: M.sin, cos: M.cos, tan: M.tan, asin: M.asin, acos: M.acos, atan: M.atan, sinh: M.sinh, cosh: M.cosh, tanh: M.tanh, exp: M.exp, ln: M.log, log: M.log10, log10: M.log10, sqrt: M.sqrt, abs: M.abs, sign: M.sign, floor: M.floor, ceil: M.ceil, cbrt: M.cbrt, min: M.min, max: M.max, pow: M.pow, sec: function (x) { return 1 / M.cos(x); }, csc: function (x) { return 1 / M.sin(x); }, cot: function (x) { return 1 / M.tan(x); } };
  function mini(src, vars) {
    var s = String(src).replace(/\*\*/g, '^').replace(/−/g, '-').replace(/·|×/g, '*').replace(/π/g, 'pi'), i = 0, toks = [];
    while (i < s.length) {
      var ch = s[i];
      if (/\s/.test(ch)) { i++; continue; }
      var mN = /^(\d+\.?\d*|\.\d+)(e[-+]?\d+)?/i.exec(s.slice(i)); if (mN) { toks.push({ n: +mN[0] }); i += mN[0].length; continue; }
      var mI = /^[A-Za-z_θ][A-Za-z_0-9θ]*/.exec(s.slice(i)); if (mI) { toks.push({ id: mI[0] }); i += mI[0].length; continue; }
      if ('+-*/^(),'.indexOf(ch) >= 0) { toks.push({ op: ch }); i++; continue; }
      throw new Error('bad character ' + ch);
    }
    var p = 0;
    function peek() { return toks[p]; }
    function isOp(t, c) { return t && t.op === c; }
    function startsAtom(t) { return t && (t.n != null || t.id || isOp(t, '(')); }
    function expr() { var a = term(); while (isOp(peek(), '+') || isOp(peek(), '-')) { var o = toks[p++].op, b = term(); a = o === '+' ? bin(a, b, function (x, y) { return x + y; }) : bin(a, b, function (x, y) { return x - y; }); } return a; }
    function bin(a, b, f) { return function (E) { return f(a(E), b(E)); }; }
    function term() { var a = unary(); for (;;) { var t = peek(); if (isOp(t, '*') || isOp(t, '/')) { p++; var b = unary(); a = t.op === '*' ? bin(a, b, function (x, y) { return x * y; }) : bin(a, b, function (x, y) { return x / y; }); } else if (startsAtom(t)) { var c = power(); a = bin(a, c, function (x, y) { return x * y; }); } else return a; } }
    function unary() { if (isOp(peek(), '-')) { p++; var a = unary(); return function (E) { return -a(E); }; } if (isOp(peek(), '+')) { p++; return unary(); } return power(); }
    function power() { var a = atom(); if (isOp(peek(), '^')) { p++; var b = unary(); return bin(a, b, M.pow); } return a; }
    function atom() {
      var t = toks[p++]; if (!t) throw new Error('unexpected end');
      if (t.n != null) { var v = t.n; return function () { return v; }; }
      if (isOp(t, '(')) { var e = expr(); if (!isOp(toks[p++], ')')) throw new Error('missing )'); return e; }
      if (t.id) {
        var id = t.id === 'θ' ? 'theta' : t.id, vi = vars.indexOf(id);
        if (vi >= 0) return function (E) { return E[vi]; };
        if (FNS[id] && isOp(peek(), '(')) { p++; var args = [expr()]; while (isOp(peek(), ',')) { p++; args.push(expr()); } if (!isOp(toks[p++], ')')) throw new Error('missing )'); var f = FNS[id]; return function (E) { return f.apply(null, args.map(function (g) { return g(E); })); }; }
        if (id === 'pi') return function () { return PI; };
        if (id === 'e') return function () { return M.E; };
        throw new Error('unknown name ' + id);
      }
      throw new Error('unexpected ' + (t.op || ''));
    }
    var root = expr(); if (p < toks.length) throw new Error('extra input');
    return function () { try { return +root(arguments); } catch (e) { return NaN; } };
  }
  /* cx(src, vars, P): a fast function of vars from a number, a function or an expression string ("4 - x^2", "k*x^2/2");
     names in P (an object of numbers) are constants. */
  function cx(src, vars, P) {
    if (typeof src === 'function') return src;
    if (isNum(src)) return function () { return src; };
    vars = vars || ['x']; P = P || {};
    var pk = Object.keys(P), all = vars.concat(pk), pv = pk.map(function (k) { return P[k]; }), C = W.CAS, g = null;
    if (C && C.parse && C.compile) { try { var t = C.parse(String(src).replace(/θ/g, 'theta')); var h = C.compile(t, all); h.apply(null, all.map(function () { return 0.5; })); g = h; } catch (e) { g = null; } }
    if (!g) g = mini(src, all);
    return function () { var a = []; for (var i = 0; i < vars.length; i++) a.push(arguments[i]); try { return +g.apply(null, a.concat(pv)); } catch (e) { return NaN; } };
  }

  // ---------- colors (one language across the kit) ----------
  function isDark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  var KC = {};
  function K() {
    var d = isDark(); if (KC[d]) return KC[d];
    var k = V.colors(); k.isDark = d;
    k.acc = d ? '#8fb1ea' : '#2d5596'; k.accSoft = d ? 'rgba(143,177,234,0.22)' : 'rgba(45,85,150,0.12)';
    k.vel = k.green; k.accel = k.orange; k.force = k.blue; k.net = d ? '#d0b4ff' : '#4b2a8c'; k.mom = k.teal; k.disp = d ? '#a3aea8' : '#6b7570';
    k.efield = k.red; k.bfield = d ? '#91a7ff' : '#3b4fc4'; k.cur = k.gold;
    k.eK = k.green; k.eUg = k.blue; k.eUs = k.purple; k.eTh = d ? '#ff922b' : '#d9480f'; k.eW = d ? '#adb5bd' : '#6c757d';
    k.obj = d ? '#2a3d57' : '#e3eaf5'; k.objLine = d ? '#8fb1ea' : '#2d5596'; k.obj2 = d ? '#4a3b22' : '#f6ecd6'; k.obj2Line = d ? '#ffd479' : '#8a6a1f';
    k.skin = '#ffcc4d'; k.skinLine = '#e8a93a'; // every drawn person: one cartoon skin color, the same in both themes
    k.ground = d ? '#5b6b62' : '#9aa5a0'; k.metal = d ? '#8b9bab' : '#7b8794';
    k.water = d ? 'rgba(77,171,247,0.30)' : 'rgba(28,111,214,0.17)'; k.waterLine = d ? '#74c0fc' : '#1c6fd6';
    k.panelBg = d ? '#17281f' : '#f5f8fb'; k.halo = d ? 'rgba(20,33,26,0.85)' : 'rgba(255,255,255,0.88)';
    k.tagBg = d ? '#ffd479' : '#7a5c12'; k.tagInk = d ? '#1d2320' : '#ffffff';
    k.space = '#07121c'; k.space2 = '#0d1d2a'; k.sInk = '#dbe7ef'; k.sMuted = '#8fb3c6'; k.sLine = 'rgba(120,170,200,0.28)'; k.sGrid = 'rgba(120,170,200,0.13)'; k.sAcc = '#63e6be'; k.sGold = '#ffd479'; k.sBlue = '#74c0fc'; k.sRed = '#ff8787'; k.sPink = '#f9a8d4'; k.sViolet = '#b197fc';
    k.pos = k.red; k.neg = k.blue;
    return (KC[d] = k);
  }
  function rgb(hex) { var v = parseInt(hex.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
  function rgba(hex, a) { if (hex[0] !== '#') return hex; var c = rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function mixc(h1, h2, t) { var a = rgb(h1), b = rgb(h2); return 'rgb(' + M.round(lerp(a[0], b[0], t)) + ',' + M.round(lerp(a[1], b[1], t)) + ',' + M.round(lerp(a[2], b[2], t)) + ')'; }
  /* wavelength (nm) to an sRGB color for drawing spectra (visible 380 to 750 nm; dims toward the ends) */
  function wl2rgb(nm, a) {
    var r = 0, g = 0, b = 0;
    if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; } else if (nm < 490) { g = (nm - 440) / 50; b = 1; } else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
    else if (nm < 580) { r = (nm - 510) / 70; g = 1; } else if (nm < 645) { r = 1; g = -(nm - 645) / 65; } else if (nm <= 750) { r = 1; }
    var f = nm < 380 || nm > 750 ? 0 : nm < 420 ? 0.3 + 0.7 * (nm - 380) / 40 : nm > 700 ? 0.3 + 0.7 * (750 - nm) / 50 : 1;
    function c(v) { return M.round(255 * M.pow(v * f, 0.8)); }
    return a == null ? 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')' : 'rgba(' + c(r) + ',' + c(g) + ',' + c(b) + ',' + a + ')';
  }
  /* CIE 1931 color matching functions (Wyman, Sloan and Shirley 2013 multi-lobe fit) */
  function cie(l) {
    function g(x, m, s1, s2) { var t = (x - m) / (x < m ? s1 : s2); return M.exp(-0.5 * t * t); }
    return [1.056 * g(l, 599.8, 37.9, 31) + 0.362 * g(l, 442, 16, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
      0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1),
      1.217 * g(l, 437, 11.8, 36) + 0.681 * g(l, 459, 26, 13.8)];
  }
  /* the color of a blackbody at temperature T (K) as an sRGB string, normalized to full brightness */
  function bbColor(T) {
    var X = 0, Y = 0, Z = 0;
    for (var l = 380; l <= 780; l += 5) { var B = planckL(l * 1e-9, T), c = cie(l); X += B * c[0]; Y += B * c[1]; Z += B * c[2]; }
    var r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z, g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z, b = 0.0557 * X - 0.2040 * Y + 1.0570 * Z;
    var mn = M.min(r, g, b); if (mn < 0) { r -= mn; g -= mn; b -= mn; }
    var mx = M.max(r, g, b) || 1; function gam(v) { v /= mx; v = v <= 0.0031308 ? 12.92 * v : 1.055 * M.pow(v, 1 / 2.4) - 0.055; return M.round(255 * clamp(v, 0, 1)); }
    return 'rgb(' + gam(r) + ',' + gam(g) + ',' + gam(b) + ')';
  }

  // ---------- physical constants (SI; exact where SI defines them, CODATA otherwise, as in the ladder overview) ----------
  var C0 = 2.99792458e8, H = 6.62607015e-34, QE = 1.602176634e-19, KB = 1.380649e-23, NA = 6.02214076e23, GN = 6.6743e-11, KE = 8.98755e9, EPS0 = 8.85419e-12, MU0 = 1.25664e-6;
  var ME = 9.10938e-31, MP = 1.67262e-27, MN = 1.67493e-27, AMU = 1.66054e-27, SIGMA = 5.67037e-8, WIEN = 2.89777e-3, HC_EVNM = 1239.84;
  var AU = 1.495978707e11, LY = 9.4607e15, PC = 3.0857e16, MSUN = 1.989e30, RSUN = 6.957e8, LSUN = 3.828e26, TSUN = 5772, MEARTH = 5.972e24, REARTH = 6.371e6;
  function planckL(lam, T) { var x = H * C0 / (lam * KB * T); if (x > 700) return 0; return 2 * H * C0 * C0 / M.pow(lam, 5) / (M.expm1(x)); }

  // ---------- drawing (pixel coordinates) ----------
  function font(sz, w, it, serif) { return (it ? 'italic ' : '') + (w || 600) + ' ' + (sz || 12) + 'px ' + (serif ? 'Georgia,"Times New Roman",serif' : 'system-ui,-apple-system,"Segoe UI",sans-serif'); }
  function txt(ctx, s, x, y, o) {
    o = o || {}; var k = K(); ctx.save(); ctx.font = o.font || font(o.size, o.weight, o.italic, o.serif);
    ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle';
    if (o.clamp !== false && ctx.getTransform) { // keep the label inside the canvas (unrotated drawing only)
      var tr = ctx.getTransform(), wd0 = ctx.measureText(s).width;
      if (!tr.b && !tr.c && tr.a > 0) { var cwU = ctx.canvas.width / tr.a, ex = tr.e / tr.a, al = ctx.textAlign, lft = (al === 'right' || al === 'end' ? x - wd0 : al === 'center' ? x - wd0 / 2 : x) + ex;
        if (wd0 < cwU - 4) { if (lft < 2) x += 2 - lft; else if (lft + wd0 > cwU - 2) x -= lft + wd0 - (cwU - 2); } }
    }
    if (o.halo) { ctx.strokeStyle = o.haloColor || k.halo; ctx.lineWidth = o.haloW || 3.5; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    ctx.fillStyle = o.color || k.ink; ctx.fillText(s, x, y); var w = ctx.measureText(s).width; ctx.restore(); return w;
  }
  /* wrapLines(ctx, s, maxW, size, weight): split a label into lines no wider than maxW */
  function wrapLines(ctx, s, maxW, sz, w) { var words = String(s).split(' '), out = [], cur = ''; words.forEach(function (wd) { var t = cur ? cur + ' ' + wd : wd; if (cur && tw(ctx, t, sz, w) > maxW) { out.push(cur); cur = wd; } else cur = t; }); if (cur) out.push(cur); return out; }
  function tw(ctx, s, sz, w) { ctx.save(); ctx.font = font(sz, w); var v = ctx.measureText(s).width; ctx.restore(); return v; }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
  function pill(ctx, s, x, y, o) { // text on a soft rounded background; o.align: center|left|right, o.W: clamp inside width
    o = o || {}; var k = K(), sz = o.size || 12;
    ctx.save(); ctx.font = font(sz, o.weight || 600); var w = ctx.measureText(s).width, h = sz + 7, al = o.align || 'center';
    var bx = al === 'center' ? x - w / 2 - 5 : al === 'right' ? x - w - 10 : x; if (o.W) bx = clamp(bx, 2, o.W - w - 12);
    var by = y - h / 2; if (o.H) by = clamp(by, 2, o.H - h - 2);
    ctx.fillStyle = o.bg || k.halo; rrect(ctx, bx, by, w + 10, h, 6); ctx.fill();
    if (o.border) { ctx.strokeStyle = o.border; ctx.lineWidth = 1.2; ctx.stroke(); }
    ctx.fillStyle = o.color || k.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, bx + 5, by + h / 2 + 0.5); ctx.restore();
    return { x: bx, y: by, w: w + 10, h: h };
  }
  function line(ctx, x1, y1, x2, y2, col, w, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 1.5; ctx.setLineDash(dash || []); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
  function poly(ctx, pts, o) { o = o || {}; if (!pts.length) return; ctx.save(); ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); if (o.close) ctx.closePath(); if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); } if (o.color) { ctx.strokeStyle = o.color; ctx.lineWidth = o.w || 2; ctx.setLineDash(o.dash || []); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); } ctx.restore(); }
  function circ(ctx, x, y, r, o) { o = o || {}; ctx.save(); ctx.beginPath(); ctx.arc(x, y, M.max(0.1, r), o.a0 || 0, o.a1 == null ? TAU : o.a1, !!o.ccw); if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); } if (o.color) { ctx.strokeStyle = o.color; ctx.lineWidth = o.w || 1.5; ctx.setLineDash(o.dash || []); ctx.stroke(); } ctx.restore(); }
  /* arrow(ctx, x1, y1, x2, y2, o): o = {color, w, head, dash, label, lcolor, lsize, loff, double} */
  function arrow(ctx, x1, y1, x2, y2, o) {
    o = o || {}; var L = M.hypot(x2 - x1, y2 - y1); if (!(L > 0.5)) return;
    var ang = M.atan2(y2 - y1, x2 - x1), w = o.w || 2.5, hs = M.min(o.head || (6 + w * 2), L * 0.6), col = o.color || K().ink;
    ctx.save(); ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash(o.dash || []);
    var sx = x1, sy = y1; if (o.double) { sx = x1 + hs * 0.6 * M.cos(ang); sy = y1 + hs * 0.6 * M.sin(ang); }
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(x2 - hs * 0.6 * M.cos(ang), y2 - hs * 0.6 * M.sin(ang)); ctx.stroke(); ctx.setLineDash([]);
    function head(x, y, a) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - hs * M.cos(a - 0.42), y - hs * M.sin(a - 0.42)); ctx.lineTo(x - hs * M.cos(a + 0.42), y - hs * M.sin(a + 0.42)); ctx.closePath(); ctx.fill(); }
    head(x2, y2, ang); if (o.double) head(x1, y1, ang + PI); ctx.restore();
    if (o.label) { var off = o.loff == null ? 11 : o.loff, ux = M.cos(ang), uy = M.sin(ang), lx = x2 + ux * off, ly = y2 + uy * off; txt(ctx, o.label, lx, ly, { color: o.lcolor || col, size: o.lsize || 13, weight: 700, align: ux > 0.35 ? 'left' : ux < -0.35 ? 'right' : 'center', base: uy > 0.35 ? 'top' : uy < -0.35 ? 'bottom' : 'middle', halo: true }); }
  }
  function tagDot(ctx, s, x, y) { if (!s) return; var k = K(); ctx.save(); circ(ctx, x, y, 11, { fill: k.bg }); circ(ctx, x, y, 9.5, { fill: k.tagBg }); txt(ctx, s, x, y + 0.5, { color: k.tagInk, size: 12, weight: 800, align: 'center' }); ctx.restore(); }
  function knob(ctx, x, y, col, r) { var k = K(); r = r || 7; circ(ctx, x, y, r, { fill: k.bg, color: col, w: 3 }); circ(ctx, x, y, r * 0.42, { fill: col }); }
  function hatch(ctx, x, y, w, h, col, gap) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.strokeStyle = col || K().ground; ctx.lineWidth = 1.2; ctx.beginPath(); gap = gap || 8; for (var i = -h; i < w + h; i += gap) { ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h, y); } ctx.stroke(); ctx.restore(); }
  function ground(ctx, x, y, w, k, depth) { k = k || K(); hatch(ctx, x, y, w, depth || 9, k.ground, 8); line(ctx, x, y, x + w, y, k.ground, 2); }
  function spring(ctx, x1, y1, x2, y2, o) { // a zigzag spring with straight leads
    o = o || {}; var L = M.hypot(x2 - x1, y2 - y1); if (L < 1) return; var n = o.n || 10, amp = o.amp || 7, lead = M.min(o.lead == null ? 8 : o.lead, L * 0.2), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux;
    ctx.save(); ctx.strokeStyle = o.color || K().metal; ctx.lineWidth = o.w || 2; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + ux * lead, y1 + uy * lead);
    var span = L - 2 * lead; for (var i = 0; i < n; i++) { var s = lead + span * (i + 0.5) / n, sg = i % 2 ? -1 : 1; ctx.lineTo(x1 + ux * s + px * amp * sg, y1 + uy * s + py * amp * sg); }
    ctx.lineTo(x2 - ux * lead, y2 - uy * lead); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
  }
  function block(ctx, x, y, w, h, o) { o = o || {}; var k = K(); ctx.save(); rrect(ctx, x, y, w, h, o.r == null ? 5 : o.r); ctx.fillStyle = o.fill || k.obj; ctx.fill(); ctx.strokeStyle = o.color || k.objLine; ctx.lineWidth = o.w || 2; ctx.stroke(); ctx.restore(); if (o.label) txt(ctx, o.label, x + w / 2, y + h / 2, { align: 'center', size: o.size || 13, weight: 700, color: o.lcolor || k.ink }); }
  function ball(ctx, x, y, r, col) { var k = K(); ctx.save(); var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r); g.addColorStop(0, k.isDark ? '#ffffff' : '#ffffff'); g.addColorStop(0.35, col || k.acc); g.addColorStop(1, mixc(col && col[0] === '#' ? col : (k.isDark ? '#8fb1ea' : '#2d5596'), '#000000', 0.35)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); }
  function dotsAlong(ctx, pts, phase, gap, col, r) { // moving dots along a polyline (current, flow)
    var segs = [], tot = 0; for (var i = 1; i < pts.length; i++) { var L = M.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(L); tot += L; }
    if (!tot) return; ctx.save(); ctx.fillStyle = col; var s0 = ((phase % gap) + gap) % gap;
    for (var s = s0; s < tot; s += gap) { var acc = 0; for (var j = 0; j < segs.length; j++) { if (s <= acc + segs[j]) { var f = (s - acc) / (segs[j] || 1), a = pts[j], b = pts[j + 1]; ctx.beginPath(); ctx.arc(lerp(a[0], b[0], f), lerp(a[1], b[1], f), r || 2.6, 0, TAU); ctx.fill(); break; } acc += segs[j]; } }
    ctx.restore();
  }
  function arc(ctx, x, y, r, a0, a1, col, w) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 1.5; ctx.beginPath(); ctx.arc(x, y, r, a0, a1, a1 < a0); ctx.stroke(); ctx.restore(); }
  function dotOut(ctx, x, y, r, col) { circ(ctx, x, y, r, { color: col, w: 1.8, fill: K().bg }); circ(ctx, x, y, r * 0.28, { fill: col }); } // ⊙ out of the page
  function dotIn(ctx, x, y, r, col) { circ(ctx, x, y, r, { color: col, w: 1.8, fill: K().bg }); var d = r * 0.62; line(ctx, x - d, y - d, x + d, y + d, col, 1.8); line(ctx, x - d, y + d, x + d, y - d, col, 1.8); } // ⊗ into the page

  /* GP(ctx, r, o): a graph panel in the pixel rectangle r = {x, y, w, h}.
     o = {xmin, xmax, ymin, ymax, xlab, ylab, xstep, ystep, ticks (default true), xticks, yticks, bg, grid}.
     Tick labels sit outside the rectangle (below and to the left); leave about 34 px on the left and 16 px below. */
  function GP(ctx, r, o) {
    var k = K(), G = { r: r, o: o };
    G.X = function (x) { return r.x + (x - o.xmin) / (o.xmax - o.xmin) * r.w; };
    G.Y = function (y) { return r.y + r.h - (y - o.ymin) / (o.ymax - o.ymin) * r.h; };
    G.ix = function (px) { return o.xmin + (px - r.x) / r.w * (o.xmax - o.xmin); };
    G.iy = function (py) { return o.ymin + (r.y + r.h - py) / r.h * (o.ymax - o.ymin); };
    G.inside = function (px, py) { return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; };
    G.frame = function () {
      var sx = o.xstep || niceStep(o.xmax - o.xmin, M.max(2, r.w / 64)), sy = o.ystep || niceStep(o.ymax - o.ymin, M.max(2, r.h / 34)), x, y, xlo = M.min(o.xmin, o.xmax), xhi = M.max(o.xmin, o.xmax), XS = [];
      for (x = M.ceil(xlo / sx - 1e-9) * sx; x <= xhi + 1e-9; x += sx) XS.push(x); if (o.xmin > o.xmax) XS.reverse(); var ylo = M.min(o.ymin, o.ymax), yhi = M.max(o.ymin, o.ymax), YS = []; for (y = M.ceil(ylo / sy - 1e-9) * sy; y <= yhi + 1e-9; y += sy) YS.push(y);
      ctx.save();
      if (o.bg !== false) { ctx.fillStyle = o.bgColor || k.panelBg; rrect(ctx, r.x, r.y, r.w, r.h, 5); ctx.fill(); }
      if (o.grid !== false) {
        ctx.strokeStyle = o.gridColor || k.grid; ctx.lineWidth = 1; ctx.beginPath();
        XS.forEach(function (x) { var px = M.round(G.X(x)) + 0.5; ctx.moveTo(px, r.y); ctx.lineTo(px, r.y + r.h); });
        YS.forEach(function (y) { var py = M.round(G.Y(y)) + 0.5; ctx.moveTo(r.x, py); ctx.lineTo(r.x + r.w, py); });
        ctx.stroke();
      }
      ctx.strokeStyle = o.axisColor || k.axis; ctx.lineWidth = 1.4; ctx.beginPath();
      var y0 = o.ymin <= 0 && o.ymax >= 0 && o.ymin < o.ymax ? G.Y(0) : r.y + r.h, x0 = xlo <= 0 && xhi >= 0 && o.xmin < o.xmax ? G.X(0) : r.x;
      ctx.moveTo(r.x, y0); ctx.lineTo(r.x + r.w, y0); ctx.moveTo(x0, r.y); ctx.lineTo(x0, r.y + r.h); ctx.stroke();
      if (o.ticks !== false) {
        ctx.fillStyle = o.tickColor || k.muted; ctx.font = font(o.compact ? 10 : 11, 500);
        if (o.xticks !== false) { ctx.textAlign = 'center'; ctx.textBaseline = 'top'; var lastR = -1e9; XS.forEach(function (x) { var s = tickLabel(x, sx), ww = ctx.measureText(s).width, cx0 = G.X(x); if (cx0 - ww / 2 < lastR + 4) return; ctx.fillText(s, cx0, r.y + r.h + 3); lastR = cx0 + ww / 2; }); }
        if (o.yticks !== false) { ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; YS.forEach(function (y) { ctx.fillText(tickLabel(y, sy), r.x - 4, G.Y(y)); }); }
      }
      if (o.xlab) txt(ctx, o.xlab, r.x + r.w - 4, (o.xlabTop ? r.y + 9 : y0 - r.y < 18 ? y0 + 10 : y0 - 9), { align: 'right', size: o.compact ? 11 : 12, color: o.labColor || k.ink, halo: true, haloColor: o.bgColor || k.panelBg });
      if (o.ylab) txt(ctx, o.ylab, x0 + 5, r.y + 9, { align: 'left', size: o.compact ? 11 : 12, color: o.labColor || k.ink, halo: true, haloColor: o.bgColor || k.panelBg });
      ctx.restore(); return G;
    };
    G.clip = function () { ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip(); };
    G.plot = function (f, col, w, dash, a, b) {
      var lo = M.min(o.xmin, o.xmax), hi = M.max(o.xmin, o.xmax); a = a == null ? lo : M.max(a, lo); b = b == null ? hi : M.min(b, hi); if (b <= a) return G;
      var n = M.max(60, M.round(M.abs(G.X(b) - G.X(a)) * 1.5)), pen = false; G.clip(); ctx.strokeStyle = col; ctx.lineWidth = w || 2.2; ctx.setLineDash(dash || []); ctx.lineJoin = 'round'; ctx.beginPath();
      for (var i = 0; i <= n; i++) { var x = a + (b - a) * i / n, y = f(x); if (!isFinite(y)) { pen = false; continue; } var py = clamp(G.Y(y), r.y - 2000, r.y + r.h + 2000); if (pen) ctx.lineTo(G.X(x), py); else { ctx.moveTo(G.X(x), py); pen = true; } }
      ctx.stroke(); ctx.restore(); return G;
    };
    G.line = function (pts, col, w, dash) { G.clip(); poly(ctx, pts.map(function (p) { return [G.X(p[0]), G.Y(p[1])]; }), { color: col, w: w || 2.2, dash: dash }); ctx.restore(); return G; };
    G.fill = function (f, a, b, col, base) { a = M.max(a, o.xmin); b = M.min(b, o.xmax); if (b <= a) return G; var n = 160, pts = [], bs = base || 0; for (var i = 0; i <= n; i++) { var x = a + (b - a) * i / n; pts.push([G.X(x), G.Y(f(x))]); } pts.push([G.X(b), G.Y(bs)]); pts.push([G.X(a), G.Y(bs)]); G.clip(); poly(ctx, pts, { fill: col, close: true }); ctx.restore(); return G; };
    G.dot = function (x, y, col, rad) { if (x < M.min(o.xmin, o.xmax) - 1e-9 || x > M.max(o.xmin, o.xmax) + 1e-9) return G; circ(ctx, G.X(x), G.Y(y), rad || 4.5, { fill: col }); return G; };
    G.vline = function (x, col, dash, w) { if (x < M.min(o.xmin, o.xmax) || x > M.max(o.xmin, o.xmax)) return G; line(ctx, G.X(x), r.y, G.X(x), r.y + r.h, col, w || 1.4, dash); return G; };
    G.hline = function (y, col, dash, w) { if (y < M.min(o.ymin, o.ymax) || y > M.max(o.ymin, o.ymax)) return G; line(ctx, r.x, G.Y(y), r.x + r.w, G.Y(y), col, w || 1.4, dash); return G; };
    return G;
  }

  // ---------- the frame every visual is built in ----------
  /* frame(el, o, label, fo): task line, a box for the canvas, a control row, the live-numbers grid and a readout.
     Handles the shared options: interactive, quiet / readout, show, hide, tags, task, label, lab, compact (panel cells). */
  function frame(el, o, label, fo) {
    fo = fo || {};
    el.classList.add('phv'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { o: o, el: el, quiet: !!(o.quiet || o.readout === false), live: o.interactive !== false, compact: !!o.compact };
    if (!F.live) el.classList.add('phv-static'); if (F.compact) el.classList.add('phv-compact');
    var show = arr(o.show), hide = arr(o.hide), tags = o.tags || {};
    /* on(name, default, computed): an overlay is on if listed in show, off if listed in hide; otherwise the default,
       except that computed overlays are off in quiet mode */
    F.on = function (name, def, computed) { if (hide.indexOf(name) >= 0) return false; if (show.indexOf(name) >= 0) return true; if (computed && F.quiet) return false; return !!def; };
    F.vals = F.on('values', true, true);
    F.tag = function (id) { return tags[id] != null ? String(tags[id]) : null; };
    F.tagAt = function (ctx, id, x, y) { var s = F.tag(id); if (s) tagDot(ctx, s, x, y); return !!s; };
    if (o.task && F.live) { F.task = mk('p', 'phv-task', '<span>' + o.task + '</span>'); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = mk('div', 'phv-box'); el.appendChild(F.box);
    F.ctl = mk('div', 'ml-ctl phv-ctl'); el.appendChild(F.ctl); if (!F.live) F.ctl.hidden = true;
    F.statEl = mk('div', 'phv-stat'); el.appendChild(F.statEl); F.statEl.hidden = true;
    F.out = V.readout(el); F.out.el.classList.add('phv-read');
    if ((F.quiet && !fo.quietSay) || F.compact) F.out.el.hidden = true;
    F.sr = mk('p', 'phv-sr'); F.sr.setAttribute('aria-live', 'polite'); el.appendChild(F.sr);
    if (o.lab && F.live && !F.quiet && !F.compact && /^\/[a-z0-9\-\/#]*$/i.test(String(o.lab))) {
      var a = mk('a', 'phv-lab', '🔬 Open in the Science Lab'); a.href = o.lab; el.appendChild(a);
    }
    F.row = function (cls) { var r = mk('div', 'ml-ctl phv-ctl' + (cls ? ' ' + cls : '')); el.insertBefore(r, F.statEl); if (!F.live) r.hidden = true; return r; };
    F.canvas = function (q) {
      q = q || {}; var asp = q.aspect || 1.6, qq = { aspect: asp, min: q.min || (F.compact ? 140 : 250), max: q.max || (F.compact ? 240 : 470), height: o.height || q.height };
      if (F.compact) qq.aspect = q.caspect || asp; if (qq.height) qq.max = M.max(qq.max, qq.height);
      var c = V.canvas(F.box, qq); c.q = qq; F.c = c;
      if (!o.height && !q.height && q.narrow !== false && !F.compact) { var adj = function () { var w = F.box.clientWidth || 300, nh = w < 520 ? M.round(w / M.min(asp, q.narrow || 1.15)) : 0; if (nh && q.nmax) nh = M.min(nh, q.nmax); if (nh !== (qq.height || 0)) { qq.height = nh || undefined; c.fit(); } }; c.onResize(adj); adj(); }
      c.cv.setAttribute('role', 'img'); c.cv.style.touchAction = 'pan-y';
      c.onResize(function () { F.now(); }); V.onTheme(function () { F.now(); });
      return c;
    };
    F.draw = null; var pend = 0;
    F.now = function () { if (pend) { W.cancelAnimationFrame(pend); pend = 0; } if (F.draw) F.draw(); };
    F.redraw = function () { if (pend) return; pend = W.requestAnimationFrame(function () { pend = 0; if (F.draw) F.draw(); }); };
    F.desc = function (s) { if (!F.c || s === F._d) return; F._d = s; F.c.cv.setAttribute('aria-label', s); F.c.cv.textContent = s; };
    var rt = 0, rq = null;
    function flushRead() { rt = 0; if (rq == null) return; var h = rq; rq = null; if (h !== F._r) { F._r = h; F.out.set(h); } }
    F.read = function (h) { rq = h; if (!rt) { flushRead(); rt = W.setTimeout(flushRead, 160); } };
    var sk = '', sv = [], st = 0, sq = null;
    function flushStats() { st = 0; if (!sq) return; var items = sq; sq = null; var key = items.map(function (it) { return it[0]; }).join('|');
      if (key !== sk) { sk = key; F.statEl.innerHTML = ''; sv = items.map(function (it) { var d = mk('div', '', '<span>' + it[0] + '</span>'), b = mk('b'); d.appendChild(b); F.statEl.appendChild(d); return b; }); }
      items.forEach(function (it, i) { if (sv[i].innerHTML !== it[1]) sv[i].innerHTML = it[1]; }); F.statEl.hidden = !items.length; }
    /* stats([[label, valueHTML], …]): the live-numbers grid (lesson mode only; hidden when quiet) */
    F.stats = function (items) { if (F.quiet || !F.live || F.compact) { if (!F.on('readouts', false)) { F.statEl.hidden = true; return; } } sq = items; if (!st) { flushStats(); st = W.setTimeout(flushStats, 160); } };
    F.say = function (s) { F.sr.textContent = s; };
    F.slider = function (parent, q) { var s = V.slider(parent || F.ctl, { label: q.label, min: q.min, max: q.max, step: q.step, value: q.value, fmt: q.fmt || function (v) { return fd(v, q.d == null ? 2 : q.d, q.unit); }, input: function (v) { q.input(v); F.redraw(); } }); return s; };
    F.seg = function (parent, q) { return V.seg(parent || F.ctl, { label: q.label, items: q.items, value: q.value, change: function (v) { q.change(v); F.redraw(); } }); };
    F.check = function (parent, text, on, fn) { var l = mk('label', 'phv-chk'), i = D.createElement('input'); i.type = 'checkbox'; i.checked = !!on; l.appendChild(i); l.appendChild(D.createTextNode(' ' + text)); i.addEventListener('change', function () { fn(i.checked); F.redraw(); }); (parent || F.ctl).appendChild(l); return i; };
    F.button = function (parent, text, fn, cls) { return V.button(parent || F.ctl, text, function () { fn(); F.redraw(); }, cls); };
    /* anim(q): play / pause, step and a time slider. q = {tmax, t0, loop, rate (sim seconds per real second), dt (step size),
       tick(h) for visuals that integrate, seek(t) to jump, reset(), autoplay (default true), scrub (time slider, default true),
       tlabel, tfmt}. Frozen in problem mode at o.t (or q.tStatic). Starts paused when the viewer prefers less motion. */
    F.anim = function (q) {
      var A = { t: q.t0 || 0, playing: false };
      var ot = num(o.t, null); if (ot != null) A.t = q.tconv ? q.tconv(ot) : ot; else if (!F.live && q.tStatic != null) A.t = q.tStatic;
      if (!F.live) { if (q.seek) q.seek(A.t); return A; }
      var row = F.row('phv-anim');
      var bp = V.button(row, '▶ Play', function () { if (A.playing) A.pause(); else A.play(); }, 'pri phv-play');
      var bs = V.button(row, 'Step ›', function () { A.pause(); adv(q.dt || (q.tmax ? q.tmax / 60 : 0.05)); }); bs.setAttribute('aria-label', 'Step forward');
      var br = V.button(row, '↺', function () { A.pause(); A.reset(); }); br.setAttribute('aria-label', 'Start again'); br.title = 'Start again';
      if (q.scrub !== false && q.tmax) A.sl = V.slider(row, { label: q.tlabel || 'Time', min: 0, max: q.tmax, step: q.tmax / 500, value: A.t, fmt: q.tfmt || function (v) { return fd(v, 2, 's'); }, input: function (v) { A.pause(); A.t = v; if (q.seek) q.seek(v); F.now(); } });
      var lp = V.loop(F.box, function (dt) { if (A.playing) adv(dt * (q.rate || 1)); }); lp.stop();
      function adv(h) {
        if (q.tick) { var r = q.tick(h); if (r === false) { A.pause(); } }
        A.t += h;
        if (q.tmax) { if (A.t >= q.tmax) { if (q.loop) { A.t = A.t % q.tmax; if (q.wrap) q.wrap(); } else { A.t = q.tmax; A.pause(); } } }
        if (A.sl) A.sl.set(A.t); F.now();
      }
      function paint() { bp.textContent = A.playing ? '❚❚ Pause' : '▶ Play'; bp.setAttribute('aria-pressed', String(A.playing)); F.out.el.setAttribute('aria-live', A.playing ? 'off' : 'polite'); }
      A.play = function () { if (q.tmax && !q.loop && A.t >= q.tmax - 1e-9) A.reset(); A.playing = true; lp.start(); paint(); };
      A.pause = function () { A.playing = false; lp.stop(); paint(); };
      A.reset = function () { A.t = q.t0 || 0; if (q.reset) q.reset(); if (q.seek) q.seek(A.t); if (A.sl) A.sl.set(A.t); F.now(); };
      A.set = function (t) { A.t = t; if (q.seek) q.seek(t); if (A.sl) A.sl.set(t); F.now(); };
      A.step = adv; A.row = row;
      paint();
      var auto = o.play != null ? !!o.play : q.autoplay !== false;
      if (auto && !V.reduced) A.play();
      return A;
    };
    /* handles(list, q): draggable, keyboard-movable things. list: [{pos() -> [px, py], drag(px, py), key(dx, dy, big), name, off()}]
       q = {r (hit radius), free(px, py) -> handle for a drag that starts elsewhere, freeMove, change(i)}.
       Arrow keys move the selected handle (Shift for bigger steps); Enter or N picks the next one. */
    F.handles = function (list, q) {
      q = q || {}; var c = F.c, cur = 0, focus = false, Hh = { list: list, draw: function () { } };
      if (!F.live || !c) return Hh;
      el._phvHandles = list; // read by the kit's interaction tests
      V.drag(c.cv, {
        hit: function (px, py) { var best = null, bd = q.r || 26; list.forEach(function (h, i) { if (h.off && h.off()) return; var p = h.pos(); if (!p) return; var d = M.hypot(p[0] - px, p[1] - py); if (d < (h.r || bd) && (best == null || d < bd)) { bd = d; best = i; } }); if (best == null && q.free) { var f = q.free(px, py); if (f != null) return f; } return best; },
        start: function (i, px, py) { if (typeof i === 'number') { cur = i; if (list[i].start) list[i].start(px, py); } else if (q.freeStart) q.freeStart(i, px, py); },
        move: function (i, px, py) { if (typeof i === 'number') list[i].drag(px, py); else if (q.freeMove) q.freeMove(i, px, py); if (q.change) q.change(i); F.now(); },
        end: function (i) { if (typeof i === 'number' && list[i].end) list[i].end(); if (q.end) q.end(i); F.now(); }
      });
      c.cv.tabIndex = 0;
      c.cv.addEventListener('focus', function () { focus = true; F.now(); });
      c.cv.addEventListener('blur', function () { focus = false; F.now(); });
      c.cv.addEventListener('keydown', function (e) {
        var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
        if (d && list.length) { var h = list[cur]; if (h.off && h.off()) return; h.key(d[0], d[1], e.shiftKey); if (q.change) q.change(cur); F.now(); e.preventDefault(); }
        else if ((e.key === 'Enter' || e.key === 'n' || e.key === 'N') && list.length > 1) { var n = 0; do { cur = (cur + 1) % list.length; n++; } while (list[cur].off && list[cur].off() && n < list.length); F.say('Selected: ' + (list[cur].name || 'handle ' + (cur + 1))); F.now(); e.preventDefault(); }
        else if (q.keys && q.keys(e)) { F.now(); e.preventDefault(); }
      });
      Hh.draw = function (ctx) { if (!focus || !list.length) return; var h = list[cur]; if (h.off && h.off()) return; var p = h.pos(); if (!p) return; ctx.save(); ctx.strokeStyle = K().gold; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(p[0], p[1], 15, 0, TAU); ctx.stroke(); ctx.restore(); };
      Hh.cur = function () { return cur; }; Hh.sel = function (i) { cur = i; };
      return Hh;
    };
    return F;
  }

  /* panel: four small, frozen variants of one visual in a 2 × 2 grid labeled A to D (opts.panel = [{…}, {…}, {…}, {…}]) */
  function panel(f, el, o) {
    el.classList.add('phv', 'phv-panel'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || 'Four choices, A to D');
    if (o.task) el.appendChild(mk('p', 'phv-task', '<span>' + o.task + '</span>'));
    var g = mk('div', 'phv-grid'); el.appendChild(g);
    var base = {}; Object.keys(o).forEach(function (k) { if (['panel', 'task', 'label', 'tags', 'lab', 'height'].indexOf(k) < 0) base[k] = o[k]; });
    o.panel.slice(0, 4).forEach(function (sub, i) {
      var L = 'ABCD'[i], cell = mk('div', 'phv-cell'); cell.appendChild(mk('div', 'phv-cell-h', L)); var inner = mk('div', ''); cell.appendChild(inner); g.appendChild(cell);
      var so = Object.assign({}, base, sub || {}, { interactive: false, compact: true, label: (sub && sub.label) || ('Choice ' + L) });
      try { f(inner, so, V); } catch (e) { if (W.console) W.console.error('ph panel', e); }
    });
    return {};
  }
  var QUEUE = []; // registrations wait until the whole file has run (so every model below is defined), see the tail
  function R(name, f) { QUEUE.push([name, f]); }
  function R0(name, f) {
    V.register(name, function (el, o, V2) {
      o = o || {};
      if (Array.isArray(o.panel) && o.panel.length) return panel(f, el, o);
      return f(el, o, V2) || {};
    });
  }
  function pick(v, list, d) { return list.indexOf(v) >= 0 ? v : d; }

  // ---------- pure physics models (no drawing); each visual adds its own below, node tests call them through ML.physModels ----------
  var PM = {};

  // ---------- shared scene helpers ----------
  /* fitMap(r, xmin, xmax, ymin, ymax, equal): world to pixel inside rect r (y up). */
  function fitMap(r, xmin, xmax, ymin, ymax, equal) {
    var sx = r.w / (xmax - xmin), sy = r.h / (ymax - ymin); if (equal) { var s = M.min(sx, sy); sx = sy = s; }
    var ox = r.x + (r.w - (xmax - xmin) * sx) / 2 - xmin * sx, oy = r.y + r.h - (r.h - (ymax - ymin) * sy) / 2 + ymin * sy;
    return { X: function (x) { return ox + x * sx; }, Y: function (y) { return oy - y * sy; }, x: function (px) { return (px - ox) / sx; }, y: function (py) { return (oy - py) / sy; }, sx: sx, sy: sy };
  }
  function niceRange(lo, hi, minSpan, pad) {
    if (!(hi > lo)) { hi = lo + (minSpan || 1); }
    if (minSpan && hi - lo < minSpan) { var c = (lo + hi) / 2; lo = c - minSpan / 2; hi = c + minSpan / 2; }
    var p = (hi - lo) * (pad == null ? 0.08 : pad), st = niceStep(hi - lo + 2 * p, 5);
    var a = M.floor((lo - p) / st + 1e-9) * st, b = M.ceil((hi + p) / st - 1e-9) * st;
    if (lo >= 0 && a < 0) a = 0; if (hi <= 0 && b > 0) b = 0; if (a === b) b = a + st;
    return [a, b];
  }
  function bg(c, col) { var ctx = c.ctx; ctx.save(); ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); ctx.fillStyle = col || K().bg; ctx.fillRect(0, 0, c.w, c.h); ctx.restore(); }
  function sgnWord(v, pos, neg, zero) { return M.abs(v) < 1e-9 ? zero : v > 0 ? pos : neg; }

  // ===================================================================================================
  // ph-motion: a cart (or a ball on a vertical track) with motion map, arrows and linked x–t, v–t, a–t graphs
  /* Model: piecewise-constant acceleration. Knots K[i] = {t, x, v}; K[i+1].a is the acceleration during segment i. */
  PM.motion = function (x0, v0, segs) {
    var K0 = [{ t: 0, x: x0, v: v0 }];
    segs.forEach(function (s) { var p = K0[K0.length - 1]; K0.push({ t: p.t + s.dur, x: p.x + p.v * s.dur + 0.5 * s.a * s.dur * s.dur, v: p.v + s.a * s.dur, a: s.a }); });
    var T = K0[K0.length - 1].t;
    function at(t) {
      t = clamp(t, 0, T);
      for (var i = 1; i < K0.length; i++) if (t <= K0[i].t + 1e-12 || i === K0.length - 1) { var p = K0[i - 1], a = K0[i].a, d = t - p.t; return { x: p.x + p.v * d + 0.5 * a * d * d, v: p.v + a * d, a: a, i: i - 1 }; }
      return { x: x0, v: v0, a: 0, i: 0 };
    }
    function dist(t) { // distance traveled from 0 to t (exact for piecewise-linear v)
      var s = 0; for (var i = 1; i < K0.length; i++) { var p = K0[i - 1]; if (t <= p.t) break; var d = M.min(t, K0[i].t) - p.t, a = K0[i].a, v1 = p.v, v2 = p.v + a * d;
        if (v1 * v2 >= 0) s += M.abs(v1 + v2) / 2 * d; else { var tz = -v1 / a; s += M.abs(v1) * tz / 2 + M.abs(v2) * (d - tz) / 2; } }
      return s;
    }
    return { K: K0, T: T, at: at, dist: dist };
  };

  R('ph-motion', function (el, o) {
    var vert = !!o.vertical, F = frame(el, o, vert ? 'A ball moving straight up and down, with its motion graphs' : 'A cart on a track, with its motion graphs');
    var g = num(o.g, 9.8), U = o.units || {}, xu = U.x || 'm', tu = U.t || 's', vu = xu + '/' + tu, au = xu + '/' + tu + '²', xn = vert ? 'y' : 'x';
    var graphs = arr(o.graphs || ['x', 'v', 'a']).filter(function (q) { return ['x', 'v', 'a'].indexOf(q) >= 0; });
    var showTrack = F.on('track', true), dots = F.on('dots', true), vA = F.on('vArrow', true), aA = F.on('aArrow', true);
    var tang = F.on('tangent', false, true), area = F.on('area', false, true), odo = F.on('odometer', false);
    var x0 = num(o.x0, 0), v0 = num(o.v0, vert ? 14.7 : 2), segs;
    if (Array.isArray(o.segments) && o.segments.length) segs = o.segments.map(function (s) { return { dur: M.max(0.05, num(s.dur, 1)), a: num(s.a, 0) }; });
    else { var a0 = o.a != null ? num(o.a, 0) : (vert ? -g : 0); segs = [{ dur: num(o.tmax, vert && v0 > 0 && a0 < 0 ? -2 * v0 / a0 : 6), a: a0 }]; }
    var mod = PM.motion(x0, v0, segs), vs = mod.K.map(function (q) { return q.v; }), durs = segs.map(function (s) { return s.dur; });
    var dragV = o.drag === 'v' && F.live && graphs.indexOf('v') >= 0;
    var RX, RV, RA, TX;
    function ranges() {
      var xs = [x0, 0], v_ = [0], a_ = [0];
      for (var i = 0; i <= 240; i++) { var s = mod.at(mod.T * i / 240); xs.push(s.x); v_.push(s.v); a_.push(s.a); }
      RX = niceRange(M.min.apply(null, xs), M.max.apply(null, xs), 2);
      var vm = M.max.apply(null, v_.map(M.abs)); if (dragV) vm = M.max(vm, 6);
      RV = niceRange(M.min.apply(null, v_), M.max.apply(null, v_), 2); if (dragV) RV = [-M.ceil(vm), M.ceil(vm)];
      RA = niceRange(M.min.apply(null, a_), M.max.apply(null, a_), 2);
      TX = o.xmin != null && o.xmax != null ? [num(o.xmin, RX[0]), num(o.xmax, RX[1])] : RX;
    }
    function rebuild() { mod = PM.motion(x0, vs[0], durs.map(function (d, j) { return { dur: d, a: (vs[j + 1] - vs[j]) / d }; })); ranges(); }
    ranges();
    var n = graphs.length, gh = F.compact ? 92 : 116, top = showTrack && !vert ? 112 : 8;
    var Hc = vert ? M.max(F.compact ? 220 : 300, n * (gh + 28) + 12) : top + n * (gh + 28) + 2;
    var c = F.canvas({ height: Hc }), Gv = null, Gs = {};
    var dtm = niceStep(mod.T, 11);
    var A = F.anim({ tmax: mod.T, rate: mod.T > 12 ? mod.T / 8 : 1, dt: dtm, tStatic: o.cursor != null ? num(o.cursor, mod.T) : mod.T, autoplay: !dragV && o.cursor == null });
    if (o.cursor != null && o.t == null && F.live) A.set(clamp(num(o.cursor, 0), 0, mod.T));
    var hd = F.handles(dragV ? vs.map(function (_, i) {
      return { name: 'velocity at t = ' + fm(mod.K[i].t, 2) + ' ' + tu, pos: function () { return Gv ? [Gv.X(mod.K[i].t), Gv.Y(vs[i])] : null; },
        drag: function (px, py) { if (!Gv) return; vs[i] = clamp(M.round(Gv.iy(py) * 2) / 2, RV[0], RV[1]); rebuild(); },
        key: function (dx, dy, big) { vs[i] = clamp(vs[i] + dy * (big ? 2 : 0.5), RV[0], RV[1]); rebuild(); } };
    }) : [], { r: 22 });
    var colOf = { x: K().acc, v: K().vel, a: K().accel };
    function fOf(q) { return q === 'x' ? function (t) { return mod.at(t).x; } : q === 'v' ? function (t) { return mod.at(t).v; } : function (t) { return mod.at(t).a; }; }
    function drawTrack(ctx, k, s, t) {
      var W0 = c.w, L = 22, Rr = W0 - 22, ty = 62, span = TX[1] - TX[0];
      var mx = function (x) { return L + 16 + (x - TX[0]) / span * (Rr - L - 32); };
      rrect(ctx, L, ty, Rr - L, 5, 3); ctx.fillStyle = k.grid; ctx.fill();
      var st = niceStep(span, M.max(2, (Rr - L) / 58));
      for (var x = M.ceil(TX[0] / st - 1e-9) * st; x <= TX[1] + 1e-9; x += st) { var px = mx(x); line(ctx, px, ty + 6, px, ty + 11, k.axis, 1.2); txt(ctx, tickLabel(x, st), px, ty + 13, { align: 'center', base: 'top', size: 11, weight: M.abs(x) < 1e-9 ? 800 : 500, color: M.abs(x) < 1e-9 ? k.ink : k.muted }); }
      arrow(ctx, Rr - 40, ty + 36, Rr - 2, ty + 36, { color: k.muted, w: 1.5, head: 8 }); txt(ctx, '+' + xn, Rr - 44, ty + 36, { align: 'right', size: 12, italic: true, serif: true, color: k.muted });
      if (dots) { // motion map
        for (var tt = 0, i = 0; tt <= mod.T + 1e-9; tt += dtm, i++) { var sx = mod.at(tt).x, on = tt <= t + 1e-9; circ(ctx, mx(sx), ty + 36, on ? 3.6 : 2.6, { fill: on ? k.acc : k.grid }); }
        if (!F.compact) txt(ctx, 'motion map, every ' + fm(dtm, 2) + ' ' + tu, L, ty + 50, { size: 10.5, color: k.muted, weight: 500 });
      }
      var cxp = mx(s.x); ctx.save(); block(ctx, cxp - 19, ty - 24, 38, 19, { r: 5 }); circ(ctx, cxp - 10, ty - 3, 4.2, { fill: k.ink }); circ(ctx, cxp + 10, ty - 3, 4.2, { fill: k.ink }); ctx.restore();
      poly(ctx, [[cxp, ty + 7], [cxp - 4, ty + 1], [cxp + 4, ty + 1]], { fill: k.accel, close: true });
      F.tagAt(ctx, 'cart', cxp, ty - 36);
      var vmax = M.max(1e-6, M.abs(RV[0]), M.abs(RV[1])), amax = M.max(1e-6, M.abs(RA[0]), M.abs(RA[1]));
      if (vA && M.abs(s.v) > 1e-6) { var vl = s.v / vmax * 70; arrow(ctx, cxp, ty - 32, cxp + vl, ty - 32, { color: k.vel, w: 3, label: 'v' }); F.tagAt(ctx, 'vArrow', cxp + vl + (vl > 0 ? 24 : -24), ty - 32); }
      if (aA && M.abs(s.a) > 1e-6) { var al = s.a / amax * 52; arrow(ctx, cxp, ty - 47, cxp + al, ty - 47, { color: k.accel, w: 2.5, label: 'a' }); F.tagAt(ctx, 'aArrow', cxp + al + (al > 0 ? 24 : -24), ty - 47); }
      if (odo) txt(ctx, 'distance ' + (F.vals ? un(mod.dist(t), xu) : '?') + ' · displacement ' + (F.vals ? un(s.x - x0, xu) : '?'), L, 10, { size: 11.5, color: k.ink });
    }
    function drawPole(ctx, k, s, t, r) {
      var cxp = r.x + 34, y0 = r.y + 14, y1 = r.y + r.h - 14, span = RX[1] - RX[0], my = function (y) { return y1 - (y - RX[0]) / span * (y1 - y0); };
      rrect(ctx, cxp - 2, y0, 4, y1 - y0, 2); ctx.fillStyle = k.grid; ctx.fill();
      var st = niceStep(span, M.max(2, (y1 - y0) / 40));
      for (var y = M.ceil(RX[0] / st - 1e-9) * st; y <= RX[1] + 1e-9; y += st) { line(ctx, cxp - 8, my(y), cxp - 3, my(y), k.axis, 1.2); txt(ctx, tickLabel(y, st), cxp - 11, my(y), { align: 'right', size: 10.5, weight: M.abs(y) < 1e-9 ? 800 : 500, color: M.abs(y) < 1e-9 ? k.ink : k.muted }); }
      if (RX[0] <= 0 && RX[1] >= 0) ground(ctx, r.x, my(0) + 9, r.w - 4, k);
      arrow(ctx, r.x + r.w - 10, y0 + 30, r.x + r.w - 10, y0, { color: k.muted, w: 1.5, head: 8 }); txt(ctx, '+y', r.x + r.w - 14, y0 + 6, { align: 'right', italic: true, serif: true, color: k.muted });
      if (dots) for (var tt = 0; tt <= mod.T + 1e-9; tt += dtm) { var on = tt <= t + 1e-9; circ(ctx, cxp + 12, my(mod.at(tt).x), on ? 3.2 : 2.4, { fill: on ? k.acc : k.grid }); }
      var by = my(s.x); ball(ctx, cxp, by, 9, k.acc); F.tagAt(ctx, 'cart', cxp - 22, by);
      var vmax = M.max(1e-6, M.abs(RV[0]), M.abs(RV[1])), amax = M.max(1e-6, M.abs(RA[0]), M.abs(RA[1]));
      if (vA && M.abs(s.v) > 1e-6) { var vl = s.v / vmax * 56; arrow(ctx, cxp + 26, by, cxp + 26, by - vl, { color: k.vel, w: 3, label: 'v' }); F.tagAt(ctx, 'vArrow', cxp + 26, by - vl - (vl > 0 ? 26 : -26)); }
      if (aA && M.abs(s.a) > 1e-6) { var al = s.a / amax * 44; arrow(ctx, cxp + 44, by, cxp + 44, by - al, { color: k.accel, w: 2.5, label: 'a' }); F.tagAt(ctx, 'aArrow', cxp + 44, by - al - (al > 0 ? 26 : -26)); }
    }
    function drawGraph(ctx, k, q, gi, r, t) {
      var rr = q === 'x' ? RX : q === 'v' ? RV : RA, nm = q === 'x' ? xn : q, unit = q === 'x' ? xu : q === 'v' ? vu : au, col = colOf[q] = q === 'x' ? k.acc : q === 'v' ? k.vel : k.accel;
      var G = GP(ctx, r, { xmin: 0, xmax: mod.T, ymin: rr[0], ymax: rr[1], xlab: 't (' + tu + ')', ylab: nm + ' (' + unit + ')', compact: F.compact }).frame();
      Gs[q] = G; if (q === 'v') Gv = G;
      var f = fOf(q), KK = mod.K;
      if (area && q === 'v') { G.fill(function (x) { return M.max(0, f(x)); }, 0, t, rgba(k.vel, 0.28)); G.fill(function (x) { return M.min(0, f(x)); }, 0, t, rgba(k.red, 0.25)); }
      function curve(t1, w, alpha) {
        ctx.save(); ctx.globalAlpha = alpha;
        if (q === 'a') { for (var i = 1; i < KK.length; i++) { var a = KK[i - 1].t, b = M.min(KK[i].t, t1); if (b <= a) break; G.line([[a, KK[i].a], [b, KK[i].a]], col, w); if (i < KK.length - 1 && KK[i].t <= t1) G.line([[KK[i].t, KK[i].a], [KK[i].t, KK[i + 1].a]], col, 1.2, [3, 3]); } }
        else G.plot(f, col, w, null, 0, t1);
        ctx.restore();
      }
      curve(mod.T, 2, F.live && !dragV ? 0.3 : 1); if (F.live && !dragV) curve(t, 2.8, 1);
      if (tang && q === 'x') { var s = mod.at(t), d = mod.T * 0.2; G.line([[t - d, s.x - s.v * d], [t + d, s.x + s.v * d]], k.gold, 2, [6, 4]); pill(ctx, 'slope = v' + (F.vals ? ' = ' + un(s.v, vu, 2) : ''), r.x + r.w - 6, r.y + 12, { align: 'right', W: c.w, size: 11, color: k.ink, border: k.gold }); F.tagAt(ctx, 'tangent', G.X(M.min(mod.T, t + d * 0.8)), G.Y(s.x + s.v * d * 0.8) - 14); }
      if (area && q === 'v' && F.vals) { var dx = mod.at(t).x - x0; pill(ctx, 'area = Δ' + xn + ' = ' + un(dx, xu, 2), r.x + r.w - 6, r.y + 12, { align: 'right', W: c.w, size: 11, border: k.vel }); }
      if (F.live || o.cursor != null) { G.vline(t, k.gold, [4, 3], 1.5); var yv = f(t); G.dot(t, yv, col, 4.5); if (F.vals) { var py = G.Y(yv) - 14; if (py < r.y + 22) py = G.Y(yv) + 16; pill(ctx, nm + ' = ' + un(yv, unit, 2), M.min(G.X(t) + 8, r.x + r.w - 6), py, { align: 'left', W: c.w, size: 11, color: col }); } }
      if (gi === 0) {
        KK.forEach(function (kn, i) { var yy = q === 'x' ? kn.x : q === 'v' ? kn.v : (i < KK.length - 1 ? KK[i + 1].a : kn.a); if (F.tag('p' + i)) { G.dot(kn.t, yy, col, 4); F.tagAt(ctx, 'p' + i, G.X(kn.t) + (i === KK.length - 1 ? -14 : 14), G.Y(yy) - 14); } });
        for (var i = 1; i < KK.length; i++) { var tm = (KK[i - 1].t + KK[i].t) / 2; F.tagAt(ctx, 'seg' + (i - 1), G.X(tm), G.Y(f(tm)) - 16); }
      }
      if (dragV && q === 'v') KK.forEach(function (kn, i) { knob(ctx, G.X(kn.t), G.Y(vs[i]), col, 7); });
    }
    F.draw = function () {
      var ctx = c.ctx, k = K(), t = A.t, s = mod.at(t); bg(c);
      if (showTrack && !vert) drawTrack(ctx, k, s, t);
      var gx = vert ? (showTrack ? 132 : 46) : 46, gw = c.w - gx - 14, y = top;
      if (vert && showTrack) drawPole(ctx, k, s, t, { x: 6, y: 6, w: 92, h: c.h - 12 });
      graphs.forEach(function (q, gi) { drawGraph(ctx, k, q, gi, { x: gx, y: y + 2, w: gw, h: gh }, t); y += gh + 28; });
      hd.draw(ctx);
      var dir = vert ? sgnWord(s.v, 'moving up', 'moving down', 'momentarily at rest') : sgnWord(s.v, 'moving right', 'moving left', 'momentarily at rest');
      var how = M.abs(s.a) < 1e-9 ? 'at a steady velocity' : M.abs(s.v) < 1e-9 ? 'about to move ' + (vert ? (s.a > 0 ? 'up' : 'down') : (s.a > 0 ? 'right' : 'left')) : s.v * s.a > 0 ? 'speeding up (v and a point the same way)' : 'slowing down (v and a point opposite ways)';
      var what = vert ? 'Ball' : 'Cart';
      if (F.quiet) F.desc(what + ' on a ' + (vert ? 'vertical' : 'horizontal') + ' track with ' + (graphs.length ? 'its ' + graphs.join(', ') + ' graph' + (graphs.length > 1 ? 's' : '') : 'a motion map'));
      else F.desc(what + ' at ' + xn + ' = ' + un(s.x, xu, 2) + ' ' + dir + (M.abs(s.v) > 1e-9 ? ' at ' + un(M.abs(s.v), vu, 2) : '') + ', ' + how + ', at t = ' + fd(t, 2, tu) + '.');
      var top0 = vert && M.abs(s.v) < 0.05 && s.a < 0 ? ' At the top, v = 0 but a is still ' + un(s.a, au, 2) + ': gravity never switches off.' : '';
      F.read('At <b>t = ' + fd(t, 2, tu) + '</b>: ' + xn + ' = <b>' + un(s.x, xu, 2) + '</b>, v = <b>' + un(s.v, vu, 2) + '</b>, a = <b>' + un(s.a, au, 2) + '</b>. ' + (M.abs(s.v) < 1e-9 ? 'At rest for an instant' : (dir.charAt(0).toUpperCase() + dir.slice(1)) + ', ' + how) + '.' + top0 + (odo ? ' Distance traveled ' + un(mod.dist(t), xu, 2) + '; displacement ' + un(s.x - x0, xu, 2) + '.' : ''));
      F.stats([['time', fd(t, 2, tu)], ['position ' + xn, un(s.x, xu, 3)], ['velocity v', un(s.v, vu, 3)], ['acceleration a', un(s.a, au, 3)], ['displacement', un(s.x - x0, xu, 3)], ['distance traveled', un(mod.dist(t), xu, 3)]]);
    };
    F.now();
    return {};
  });

  // ===================================================================================================
  // ph-graph: slope and area on a physical graph
  var UNIT_MUL = { 'm/s*s': 'm', 'm/s²*s': 'm/s', 'N*s': 'N·s', 'N*m': 'J', 'W*s': 'J', 'A*s': 'C', 'V*C': 'J', 'Pa*m³': 'J', 'kN*m': 'kJ', 'N*cm': 'N·cm', 'V*A': 'W', 'kg*m/s²': 'N' };
  var UNIT_DIV = { 'm/s': 'm/s', 'm/s/s': 'm/s²', 'J/s': 'W', 'C/s': 'A', 'V/A': 'Ω', 'N/m': 'N/m', 'N/s': 'N/s', 'kg·m/s/s': 'N', 'J/m': 'N', 'C/V': 'F', 'm/s²/s': 'm/s³', 'V/s': 'V/s', 'Wb/s': 'V', 'J/C': 'V' };
  function unitMul(a, b) { if (!a && !b) return ''; if (!a) return b; if (!b) return a; return UNIT_MUL[a + '*' + b] || UNIT_MUL[b + '*' + a] || a + '·' + b; }
  function unitDiv(a, b) { if (!b) return a || ''; if (!a) return '1/' + b; if (a === b) return ''; return UNIT_DIV[a + '/' + b] || (a.indexOf('/') >= 0 ? '(' + a + ')/' + b : a + '/' + b); }
  PM.unitMul = unitMul; PM.unitDiv = unitDiv;
  PM.pwArea = function (pts, a, b) { // signed area under a piecewise-linear graph from a to b: {net, pos, neg}
    var pos = 0, neg = 0;
    for (var i = 1; i < pts.length; i++) {
      var x1 = M.max(a, pts[i - 1][0]), x2 = M.min(b, pts[i][0]); if (x2 <= x1) continue;
      var f = function (x) { var p = pts[i - 1], q = pts[i]; return p[1] + (q[1] - p[1]) * (x - p[0]) / (q[0] - p[0]); }, y1 = f(x1), y2 = f(x2);
      if (y1 * y2 >= 0) { var ar = (y1 + y2) / 2 * (x2 - x1); if (ar >= 0) pos += ar; else neg += ar; }
      else { var xz = x1 + (x2 - x1) * y1 / (y1 - y2), a1 = y1 * (xz - x1) / 2, a2 = y2 * (x2 - xz) / 2; [a1, a2].forEach(function (v) { if (v >= 0) pos += v; else neg += v; }); }
    }
    return { net: pos + neg, pos: pos, neg: neg };
  };
  R('ph-graph', function (el, o) {
    var F = frame(el, o, 'A physics graph with slope and area tools');
    var xu = o.xunit || '', yu = o.yunit || '', xl = o.xlab || 'x', yl = o.ylab || 'y', pts = null, f;
    if (Array.isArray(o.pts) && o.pts.length >= 2) {
      pts = o.pts.map(function (p) { return [num(p[0], 0), num(p[1], 0)]; }).sort(function (a, b) { return a[0] - b[0]; });
      f = function (x) { if (x < pts[0][0] - 1e-12 || x > pts[pts.length - 1][0] + 1e-12) return NaN; for (var i = 1; i < pts.length; i++) if (x <= pts[i][0] + 1e-12) { var p = pts[i - 1], q = pts[i]; return q[0] === p[0] ? q[1] : p[1] + (q[1] - p[1]) * (x - p[0]) / (q[0] - p[0]); } return NaN; };
    } else f = cx(o.fn || 'x', ['x']);
    var dom = Array.isArray(o.domain) ? [num(o.domain[0], 0), num(o.domain[1], 10)] : pts ? [pts[0][0], pts[pts.length - 1][0]] : [0, 10];
    var ys = [0]; for (var i = 0; i <= 300; i++) { var yv = f(dom[0] + (dom[1] - dom[0]) * i / 300); if (isFinite(yv)) ys.push(yv); }
    var ry = Array.isArray(o.range) ? [num(o.range[0], 0), num(o.range[1], 10)] : niceRange(M.min.apply(null, ys), M.max.apply(null, ys), 1, 0.1);
    var rx = [M.min(0, dom[0]), dom[1]];
    var tool = pick(o.tool, ['slope', 'area', 'both', 'none'], pts ? 'area' : 'slope'), doSlope = tool === 'slope' || tool === 'both', doArea = tool === 'area' || tool === 'both';
    var at = clamp(num(o.at, (dom[0] + dom[1]) / 2), dom[0], dom[1]), a = clamp(num(o.a, dom[0]), dom[0], dom[1]), b = clamp(num(o.b, dom[1]), dom[0], dom[1]);
    var tri = F.on('triangle', true), shade = F.on('shade', true), net = F.on('net', false), sU = o.slopeUnit || unitDiv(yu, xu), aU = o.areaUnit || unitMul(yu, xu);
    var span = dom[1] - dom[0], snapX = o.snap ? num(o.snap, 0) : niceStep(span, 40);
    function slope(x) { if (pts) { for (var i = 1; i < pts.length; i++) if (x < pts[i][0] - 1e-9 || i === pts.length - 1) return (pts[i][1] - pts[i - 1][1]) / (pts[i][0] - pts[i - 1][0]); } var h = span * 1e-5; return (f(x + h) - f(x - h)) / (2 * h); }
    function areaOf(lo, hi) { if (lo > hi) { var t = lo; lo = hi; hi = t; } if (pts) return PM.pwArea(pts, lo, hi); var n = 2000, hh = (hi - lo) / n, p = 0, q = 0; for (var i = 0; i < n; i++) { var y1 = f(lo + (i + 0.5) * hh); if (!isFinite(y1)) continue; if (y1 >= 0) p += y1 * hh; else q += y1 * hh; } return { net: p + q, pos: p, neg: q }; }
    var c = F.canvas({ aspect: 1.75 }), G = null;
    var list = [];
    if (doSlope) list.push({ name: 'slope point', pos: function () { return G ? [G.X(at), G.Y(f(at))] : null; }, drag: function (px) { at = clamp(M.round(G.ix(px) / snapX) * snapX, dom[0], dom[1]); }, key: function (dx, dy, big) { at = clamp(at + (dx || dy) * snapX * (big ? 5 : 1), dom[0], dom[1]); } });
    if (doArea) { [0, 1].forEach(function (j) { list.push({ name: j ? 'right edge of the area' : 'left edge of the area', pos: function () { return G ? [G.X(j ? b : a), G.r.y + G.r.h - 8] : null; }, drag: function (px) { var v = clamp(M.round(G.ix(px) / snapX) * snapX, dom[0], dom[1]); if (j) b = v; else a = v; }, key: function (dx, dy, big) { var v = (j ? b : a) + (dx || dy) * snapX * (big ? 5 : 1); v = clamp(v, dom[0], dom[1]); if (j) b = v; else a = v; } }); }); }
    var hd = F.handles(o.drag === false ? [] : list, { r: 24 });
    F.draw = function () {
      var ctx = c.ctx, k = K(); bg(c);
      var r = { x: 50, y: 12, w: c.w - 64, h: c.h - 34 };
      G = GP(ctx, r, { xmin: rx[0], xmax: rx[1], ymin: ry[0], ymax: ry[1], xlab: xl + (xu ? ' (' + xu + ')' : ''), ylab: yl + (yu ? ' (' + yu + ')' : ''), grid: o.grid !== false, compact: F.compact }).frame();
      var lo = M.min(a, b), hi = M.max(a, b), ar = areaOf(lo, hi);
      if (doArea && shade) { G.fill(function (x) { var y = f(x); return isFinite(y) ? M.max(0, y) : 0; }, lo, hi, rgba(k.green, 0.3)); G.fill(function (x) { var y = f(x); return isFinite(y) ? M.min(0, y) : 0; }, lo, hi, rgba(k.red, 0.28)); G.vline(lo, k.muted, [3, 3]); G.vline(hi, k.muted, [3, 3]); }
      G.plot(f, k.acc, 2.8, null, dom[0], dom[1]);
      if (pts) pts.forEach(function (p, i) { G.dot(p[0], p[1], k.acc, 3.5); F.tagAt(ctx, 'p' + i, G.X(p[0]) + (i === pts.length - 1 ? -14 : 14), G.Y(p[1]) - 15); });
      if (doArea) {
        if (F.live) { knob(ctx, G.X(a), r.y + r.h - 8, k.muted, 6); knob(ctx, G.X(b), r.y + r.h - 8, k.muted, 6); }
        var mid = (lo + hi) / 2, my = f(mid); F.tagAt(ctx, 'shade', G.X(mid), G.Y(isFinite(my) ? my / 2 : 0));
        if (F.vals) { var s = net ? 'above +' + nf(ar.pos, 3) + ', below ' + nf(ar.neg, 3) + ', net ' + un(ar.net, aU, 3) : 'area = ' + un(ar.net, aU, 3); pill(ctx, s, G.X(mid), r.y + 12, { W: c.w, size: 12, border: k.grid }); }
      }
      if (doSlope) {
        var y0 = f(at), m = slope(at), d = span * 0.22;
        if (isFinite(y0) && isFinite(m)) {
          G.line([[at - d, y0 - m * d], [at + d, y0 + m * d]], k.gold, 2.2, [7, 4]);
          if (tri) { var run = niceStep(span, 5), x2, rise; for (var it = 0; it < 6; it++) { x2 = at + run <= dom[1] ? at + run : at - run; rise = m * (x2 - at); if (y0 + rise <= ry[1] && y0 + rise >= ry[0]) break; run /= 2; } G.line([[at, y0], [x2, y0], [x2, y0 + rise]], k.purple, 2);
            txt(ctx, 'run ' + (F.vals ? un(M.abs(x2 - at), xu, 3) : ''), G.X((at + x2) / 2), G.Y(y0) + (rise >= 0 ? 12 : -12), { align: 'center', size: 11.5, color: k.purple, halo: true });
            txt(ctx, 'rise ' + (F.vals ? un(rise * M.sign(x2 - at), yu, 3) : ''), G.X(x2) + (x2 > at ? 6 : -6), G.Y(y0 + rise / 2), { align: x2 > at ? 'left' : 'right', size: 11.5, color: k.purple, halo: true }); }
          circ(ctx, G.X(at), G.Y(y0), 5.5, { fill: k.gold }); if (F.live && o.drag !== false) knob(ctx, G.X(at), G.Y(y0), k.gold, 7);
          F.tagAt(ctx, 'tangent', G.X(M.min(dom[1], at + d * 0.85)), G.Y(y0 + m * d * 0.85) - 15);
          if (F.vals) pill(ctx, 'slope = ' + un(m, sU, 3), G.X(at), G.Y(y0) + (m > 0 ? 22 : -22), { W: c.w, H: c.h, size: 12, color: k.ink, border: k.gold });
        }
      }
      hd.draw(ctx);
      var parts = [];
      if (doSlope) parts.push('the slope at ' + xl + ' = ' + nf(at, 3) + ' ' + xu + (F.quiet ? '' : ' is ' + un(slope(at), sU, 3)));
      if (doArea) parts.push('the area from ' + xl + ' = ' + nf(lo, 3) + ' to ' + nf(hi, 3) + ' ' + xu + (F.quiet ? '' : ' is ' + un(ar.net, aU, 3) + (ar.neg < 0 && ar.pos > 0 ? ' (+' + nf(ar.pos, 3) + ' above the axis and ' + nf(ar.neg, 3) + ' below)' : '')));
      F.desc('Graph of ' + yl + ' against ' + xl + (parts.length ? ': ' + parts.join('; ') : '') + '.');
      F.read(parts.length ? parts.map(function (p) { return p.charAt(0).toUpperCase() + p.slice(1); }).join('. ') + '.' + (doArea ? ' Area counts as positive above the axis and negative below.' : '') : '');
      var st = []; if (doSlope) st.push(['slope', un(slope(at), sU, 3)]); if (doArea) { st.push(['area (net)', un(ar.net, aU, 3)]); if (ar.neg < 0) st.push(['above / below', nf(ar.pos, 3) + ' / ' + nf(ar.neg, 3)]); } F.stats(st);
    };
    F.now();
    return {};
  });

  // ===================================================================================================
  // ph-vectors: components on chosen axes, head-to-tail addition and subtraction, relative velocity (a boat crossing a river)
  R('ph-vectors', function (el, o) {
    var mode = pick(o.mode, ['components', 'add', 'subtract', 'relative'], 'components');
    var F = frame(el, o, mode === 'relative' ? 'A boat crossing a river: velocities in two frames' : 'Vectors on a grid');
    var u = o.units || '', k0 = K(), PAL = ['force', 'vel', 'accel', 'mom', 'purple', 'pink'];
    var vecs = arr(o.vecs && o.vecs.length ? o.vecs : mode === 'components' ? [{ mag: 5, ang: 37, label: 'A' }] : [{ x: 3, y: 1, label: 'A' }, { x: 1, y: 3, label: 'B' }]).map(function (v, i) {
      var x = v.x != null ? num(v.x, 0) : num(v.mag, 1) * M.cos(num(v.ang, 0) * DEG), y = v.y != null ? num(v.y, 0) : num(v.mag, 1) * M.sin(num(v.ang, 0) * DEG);
      return { x: x, y: y, label: v.label || 'ABCDEF'[i], color: v.color };
    }).slice(0, 6);
    var axA = num(o.axesAngle, 0) * DEG, snap = o.snap != null ? num(o.snap, 0) : 0.5;
    var showC = F.on('components', mode === 'components'), showR = F.on('resultant', mode !== 'components', true), showAng = F.on('angles', mode === 'components'), showMag = F.on('magnitudes', mode !== 'components');
    function colOf(v, i, k) { return v.color ? (k[v.color] || v.color) : k[PAL[i % PAL.length]]; }
    if (mode === 'relative') return relative(F, o);
    var c = F.canvas({ aspect: 1.45, narrow: 1.05 }), mp = null;
    function tails() { var t = [], x = 0, y = 0; vecs.forEach(function (v, i) { if (mode === 'components') t.push([0, 0]); else if (mode === 'subtract') t.push(i === 0 ? [0, 0] : [vecs[0].x, vecs[0].y]); else { t.push([x, y]); x += v.x; y += v.y; } }); return t; }
    function res() { if (mode === 'subtract') return vecs.length > 1 ? [vecs[0].x - vecs[1].x, vecs[0].y - vecs[1].y] : [vecs[0].x, vecs[0].y]; var x = 0, y = 0; vecs.forEach(function (v) { x += v.x; y += v.y; }); return [x, y]; }
    function extent() {
      var T = tails(), xs = [0], ys = [0]; vecs.forEach(function (v, i) { var tx = T[i][0], ty = T[i][1], sg = mode === 'subtract' && i === 1 ? -1 : 1; xs.push(tx, tx + sg * v.x, v.x); ys.push(ty, ty + sg * v.y, v.y); }); var r = res(); xs.push(r[0]); ys.push(r[1]);
      var m = M.max(4, M.max.apply(null, xs.map(M.abs)), M.max.apply(null, ys.map(M.abs))) * 1.15; return m;
    }
    var ext0 = extent(), drag = o.drag !== false && F.live, BB = null;
    function bbox() { // the region to show: every tail, head and the resultant, padded; it only grows while dragging
      var T = tails(), xs = [0], ys = [0]; vecs.forEach(function (v, i) { var sg = mode === 'subtract' && i === 1 ? -1 : 1; xs.push(T[i][0], T[i][0] + sg * v.x); ys.push(T[i][1], T[i][1] + sg * v.y); if (mode === 'subtract') { xs.push(v.x); ys.push(v.y); } }); var R1 = res(); xs.push(R1[0]); ys.push(R1[1]);
      var a = M.min.apply(null, xs), b = M.max.apply(null, xs), c2 = M.min.apply(null, ys), d = M.max.apply(null, ys), sp = M.max(b - a, d - c2, 4), p = sp * 0.16, pr = mode === 'components' ? sp * 0.32 : p;
      var nb = [a - p, b + pr, c2 - p, d + p]; if (BB) nb = [M.min(nb[0], BB[0]), M.max(nb[1], BB[1]), M.min(nb[2], BB[2]), M.max(nb[3], BB[3])]; BB = nb; return nb;
    }
    var hd = F.handles(drag ? vecs.map(function (v, i) {
      return { name: 'head of ' + v.label, pos: function () { if (!mp) return null; var T = tails()[i], sg = mode === 'subtract' && i === 1 ? -1 : 1; return [mp.X(T[0] + sg * v.x), mp.Y(T[1] + sg * v.y)]; },
        drag: function (px, py) { var T = tails()[i], sg = mode === 'subtract' && i === 1 ? -1 : 1, x = mp.x(px) - T[0], y = mp.y(py) - T[1]; if (snap) { x = M.round(x / snap) * snap; y = M.round(y / snap) * snap; } v.x = sg * clamp(x, -ext0 * 2, ext0 * 2); v.y = sg * clamp(y, -ext0 * 2, ext0 * 2); },
        key: function (dx, dy, big) { var st = (snap || 0.5) * (big ? 4 : 1), sg = mode === 'subtract' && i === 1 ? -1 : 1; v.x += sg * dx * st; v.y += sg * dy * st; } };
    }) : [], { r: 24 });
    F.draw = function () {
      var ctx = c.ctx, k = K(); bg(c);
      var r = { x: 30, y: 10, w: c.w - 40, h: c.h - 28 }, bb = bbox(), xmin = bb[0], xmax = bb[1], ymin = bb[2], ymax = bb[3], sc = M.min(r.w / (xmax - xmin), r.h / (ymax - ymin));
      var cxm = (xmin + xmax) / 2, cym = (ymin + ymax) / 2; xmin = cxm - r.w / sc / 2; xmax = cxm + r.w / sc / 2; ymin = cym - r.h / sc / 2; ymax = cym + r.h / sc / 2; var ext = M.max(xmax - xmin, ymax - ymin) / 2;
      mp = fitMap(r, xmin, xmax, ymin, ymax, true);
      var G = GP(ctx, { x: mp.X(xmin), y: mp.Y(ymax), w: mp.X(xmax) - mp.X(xmin), h: mp.Y(ymin) - mp.Y(ymax) }, { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax, xlab: u ? 'x (' + u + ')' : 'x', ylab: u ? 'y (' + u + ')' : 'y', compact: F.compact, xstep: niceStep(xmax - xmin, 8), ystep: niceStep(xmax - xmin, 8) }).frame();
      var e1 = [M.cos(axA), M.sin(axA)], e2 = [-M.sin(axA), M.cos(axA)], T = tails(), X = mp.X, Y = mp.Y;
      if (M.abs(axA) > 1e-9) { var L = ext * 1.3; ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip(); line(ctx, X(-e1[0] * L), Y(-e1[1] * L), X(e1[0] * L), Y(e1[1] * L), k.acc, 1.6, [8, 4]); line(ctx, X(-e2[0] * L), Y(-e2[1] * L), X(e2[0] * L), Y(e2[1] * L), k.acc, 1.6, [8, 4]); txt(ctx, "x′", X(e1[0] * ext * 0.95) + 6, Y(e1[1] * ext * 0.95) - 8, { italic: true, serif: true, color: k.acc, size: 14, halo: true }); txt(ctx, "y′", X(e2[0] * ext * 0.8) + 8, Y(e2[1] * ext * 0.8), { italic: true, serif: true, color: k.acc, size: 14, halo: true }); ctx.restore(); }
      var sumMag = 0;
      vecs.forEach(function (v, i) {
        var col = colOf(v, i, k), sg = mode === 'subtract' && i === 1 ? -1 : 1, tx = T[i][0], ty = T[i][1], hx = tx + sg * v.x, hy = ty + sg * v.y, mag = M.hypot(v.x, v.y); sumMag += mag;
        if (mode === 'subtract' && i === 1) { arrow(ctx, X(0), Y(0), X(v.x), Y(v.y), { color: rgba(col, 0.45), w: 2, dash: [5, 4], label: v.label }); }
        if (showC) {
          var c1 = v.x * e1[0] + v.y * e1[1], c2 = v.x * e2[0] + v.y * e2[1], px = tx + c1 * e1[0], py = ty + c1 * e1[1];
          arrow(ctx, X(tx), Y(ty), X(px), Y(py), { color: col, w: 2, dash: [6, 4] }); arrow(ctx, X(px), Y(py), X(px + c2 * e2[0]), Y(py + c2 * e2[1]), { color: col, w: 2, dash: [6, 4] });
          var nmx = v.label + (M.abs(axA) > 1e-9 ? 'x′' : 'x'), nmy = v.label + (M.abs(axA) > 1e-9 ? 'y′' : 'y');
          txt(ctx, nmx + (F.vals ? ' = ' + nf(c1, 3) : ''), X(tx + c1 * e1[0] / 2) + e2[0] * (c2 >= 0 ? -16 : 16), Y(ty + c1 * e1[1] / 2) + (c2 >= 0 ? 14 : -14), { align: 'center', size: 12, color: col, halo: true });
          txt(ctx, nmy + (F.vals ? ' = ' + nf(c2, 3) : ''), X(px + c2 * e2[0] / 2) + (c1 >= 0 ? 8 : -8), Y(py + c2 * e2[1] / 2), { align: c1 >= 0 ? 'left' : 'right', size: 12, color: col, halo: true });
          F.tagAt(ctx, 'vx' + i, X(tx + c1 * e1[0] / 2), Y(ty + c1 * e1[1] / 2) + (c2 >= 0 ? 30 : -30)); F.tagAt(ctx, 'vy' + i, X(px + c2 * e2[0] / 2) + (c1 >= 0 ? 26 : -26), Y(py + c2 * e2[1] / 2) - 20);
        }
        arrow(ctx, X(tx), Y(ty), X(hx), Y(hy), { color: col, w: 3.2, label: (mode === 'subtract' && i === 1 ? '−' : '') + v.label });
        if (showAng && mag > 1e-9) { var a1 = -M.atan2(e1[1], e1[0]), a2 = -M.atan2(sg * v.y, sg * v.x), rr = M.min(36, mag * mp.sx * 0.4); var da = a2 - a1; while (da > PI) da -= TAU; while (da < -PI) da += TAU; arc(ctx, X(tx), Y(ty), rr, a1, a1 + da, k.gold, 2); var am = a1 + da / 2; txt(ctx, 'θ' + (vecs.length > 1 ? sub(i + 1) : '') + ' = ' + fm(M.abs(da) / DEG, 1) + '°', X(tx) + (rr + 10) * M.cos(am), Y(ty) + (rr + 10) * M.sin(am), { size: 11.5, color: k.gold, halo: true, align: M.cos(am) >= 0 ? 'left' : 'right' }); F.tagAt(ctx, 'angle' + i, X(tx) + (rr + 4) * M.cos(am) - 16, Y(ty) + (rr + 4) * M.sin(am) + 14); }
        if (showMag) txt(ctx, '|' + v.label + '| = ' + un(mag, u, 3), (X(tx) + X(hx)) / 2 + (hy - ty >= 0 ? 10 : -10) * (hx - tx >= 0 ? 1 : -1), (Y(ty) + Y(hy)) / 2 - 12, { size: 11.5, color: col, halo: true, align: 'center' });
        F.tagAt(ctx, 'v' + i, (X(tx) + X(hx)) / 2 - (Y(hy) - Y(ty)) * 0.12 - 14, (Y(ty) + Y(hy)) / 2 + (X(hx) - X(tx)) * 0.12 + 14);
      });
      var R0 = res(), rm = M.hypot(R0[0], R0[1]);
      if (showR && vecs.length > 1) { arrow(ctx, X(0), Y(0), X(R0[0]), Y(R0[1]), { color: k.net, w: 4.2 }); var nx = -R0[1], ny = R0[0], nl = M.hypot(nx, ny) || 1, side = (vecs[0].x * R0[1] - vecs[0].y * R0[0]) > 0 ? -1 : 1; pill(ctx, 'R' + (F.vals ? ': ' + un(rm, u, 3) : ''), X(R0[0] / 2) + side * 26 * nx / nl, Y(R0[1] / 2) - side * 26 * ny / nl, { color: k.net, size: 12, W: c.w, weight: 700 }); F.tagAt(ctx, 'resultant', X(R0[0] * 0.5) - 18, Y(R0[1] * 0.5) - 16); }
      circ(ctx, X(0), Y(0), 3.5, { fill: k.ink });
      if (drag) vecs.forEach(function (v, i) { var T2 = tails()[i], sg = mode === 'subtract' && i === 1 ? -1 : 1; knob(ctx, X(T2[0] + sg * v.x), Y(T2[1] + sg * v.y), colOf(v, i, k), 6); });
      hd.draw(ctx);
      var ds = vecs.map(function (v) { var m = M.hypot(v.x, v.y); return v.label + ' = ' + un(m, u, 3) + ' at ' + fm(M.atan2(v.y, v.x) / DEG, 1) + '°'; });
      var rs = mode === 'components' ? '' : (F.quiet && !F.on('resultant', false) ? '' : ' Resultant R = ' + (mode === 'subtract' ? 'A − B' : vecs.map(function (v) { return v.label; }).join(' + ')) + ': ' + un(rm, u, 3) + ' at ' + fm(M.atan2(R0[1], R0[0]) / DEG, 1) + '°.');
      F.desc((mode === 'components' ? 'Vector ' : mode === 'subtract' ? 'Subtracting vectors: ' : 'Adding vectors head to tail: ') + ds.join('; ') + '.' + rs);
      var v0 = vecs[0], c1 = v0.x * e1[0] + v0.y * e1[1], c2 = v0.x * e2[0] + v0.y * e2[1], th = M.atan2(c2, c1) / DEG;
      if (mode === 'components') F.read(v0.label + ' = <b>' + un(M.hypot(v0.x, v0.y), u, 3) + '</b> at θ = <b>' + fm(th, 1) + '°</b> from the ' + (M.abs(axA) > 1e-9 ? 'x′' : 'x') + ' axis. Adjacent side: ' + v0.label + ' cos θ = <b>' + nf(c1, 3) + '</b>; opposite side: ' + v0.label + ' sin θ = <b>' + nf(c2, 3) + '</b>.');
      else F.read('|R| = <b>' + un(rm, u, 3) + '</b> at <b>' + fm(M.atan2(R0[1], R0[0]) / DEG, 1) + '°</b>. Adding the magnitudes would give ' + un(sumMag, u, 3) + (M.abs(sumMag - rm) > 1e-6 ? ', which is not the same: directions matter.' : ' only because the vectors point the same way.'));
      F.stats(vecs.map(function (v) { return [v.label + ' (x, y)', '(' + nf(v.x, 3) + ', ' + nf(v.y, 3) + ')']; }).concat(mode !== 'components' ? [['R (x, y)', '(' + nf(R0[0], 3) + ', ' + nf(R0[1], 3) + ')'], ['|R|', un(rm, u, 3)]] : []));
    };
    F.now();
    return {};
  });
  PM.riverCross = function (vw_, vb_, h_, W_) { var h = h_ * DEG, vx = vw_ - vb_ * M.sin(h), vy = vb_ * M.cos(h), T = W_ / vy; return { vx: vx, vy: vy, T: T, drift: vx * T }; };
  function relative(F, o) {
    var q = o.relative || {}, vw = num(q.vMedium, 1.5), vb = num(q.vObject, 3), hd0 = num(q.heading, 0), Wd = num(q.width, 60), A, c = F.canvas({ aspect: 1.5, narrow: 1.0 });
    if (F.live) { F.slider(null, { label: 'Boat heading (from straight across, + upstream)', min: -60, max: 75, step: 1, value: hd0, unit: '°', d: 0, input: function (v) { hd0 = v; } }); F.slider(null, { label: 'River current', min: 0, max: 4, step: 0.1, value: vw, unit: 'm/s', d: 1, input: function (v) { vw = v; } }); }
    function model() { var h = hd0 * DEG, vx = vw - vb * M.sin(h), vy = vb * M.cos(h), T = vy > 0 ? Wd / vy : Infinity; return { vx: vx, vy: vy, T: T, drift: vx * T, speed: M.hypot(vx, vy) }; }
    A = F.anim({ tmax: 1, loop: true, rate: 0.18, scrub: false, autoplay: true, tStatic: 0.5 });
    F.draw = function () {
      var ctx = c.ctx, k = K(), m = model(), W0 = c.w, H0 = c.h; bg(c);
      var bank = 26, ry0 = bank, ry1 = H0 - bank, mx0 = 40;
      ctx.fillStyle = k.water; ctx.fillRect(0, ry0, W0, ry1 - ry0); hatch(ctx, 0, 0, W0, bank - 2, k.ground, 10); hatch(ctx, 0, ry1 + 2, W0, bank, k.ground, 10); line(ctx, 0, ry0, W0, ry0, k.waterLine, 1.5); line(ctx, 0, ry1, W0, ry1, k.waterLine, 1.5);
      var s = (ry1 - ry0) / Wd, flowPh = (A.t * 3) % 1;
      for (var j = 0; j < 3; j++) for (var i = -1; i < 6; i++) { var x = (i + flowPh) * W0 / 5, y = ry0 + (ry1 - ry0) * (0.25 + 0.25 * j); if (vw > 0.01) arrow(ctx, x, y, x + 24, y, { color: rgba(k.waterLine, 0.5), w: 1.5, head: 6 }); }
      var sx = mx0 + (M.min(0, m.drift) < 0 ? -m.drift * s : 0); sx = clamp(sx, 30, W0 - 30);
      var endX = sx + m.drift * s, fr = clamp(A.t, 0, 1), bx = sx + m.vx * s * m.T * fr, by = ry1 - m.vy * s * m.T * fr;
      if (isFinite(m.T)) { line(ctx, sx, ry1, endX, ry0, k.vel, 2, [6, 4]); circ(ctx, endX, ry0, 4, { fill: k.vel }); }
      line(ctx, sx, ry1, sx, ry0, k.muted, 1.2, [2, 4]);
      ctx.save(); ctx.translate(bx, by); ctx.rotate(-hd0 * DEG); poly(ctx, [[0, -14], [7, -3], [7, 12], [-7, 12], [-7, -3]], { fill: k.obj, color: k.objLine, w: 2, close: true }); ctx.restore();
      var h = hd0 * DEG, vs = M.min(42, (ry1 - ry0 - 40) / M.max(vb, 0.5)), bwx = -vb * M.sin(h) * vs, bwy = -vb * M.cos(h) * vs, gx = bwx + vw * vs;
      var bx0 = M.min(0, bwx, gx), bx1 = M.max(0, bwx, gx), ox = W0 - 16 - bx1 - 96, oy = ry1 - 16;
      ctx.save(); ctx.fillStyle = k.halo; rrect(ctx, ox + bx0 - 98, oy + bwy - 24, bx1 - bx0 + 196, -bwy + 34, 10); ctx.fill(); ctx.restore();
      arrow(ctx, ox, oy, ox + bwx, oy + bwy, { color: k.force, w: 3 }); arrow(ctx, ox + bwx, oy + bwy, ox + gx, oy + bwy, { color: k.waterLine, w: 3 }); arrow(ctx, ox, oy, ox + gx, oy + bwy, { color: k.vel, w: 3.6 });
      txt(ctx, 'boat rel. water', ox + bwx / 2 - 8, oy + bwy / 2, { align: 'right', size: 11.5, color: k.force, weight: 700 });
      txt(ctx, 'current', ox + bwx + vw * vs / 2, oy + bwy - 12, { align: 'center', size: 11.5, color: k.waterLine, weight: 700 });
      txt(ctx, 'boat rel. ground', ox + gx / 2 + 10, oy + bwy / 2 + 6, { align: 'left', size: 11.5, color: k.vel, weight: 700 });
      F.tagAt(ctx, 'v0', ox + bwx / 2 - 16, oy + bwy / 2 + 18); F.tagAt(ctx, 'v1', ox + bwx + vw * vs / 2, oy + bwy - 16); F.tagAt(ctx, 'resultant', ox + (bwx + vw * vs) / 2 + 16, oy + bwy / 2 + 8);
      if (F.vals && isFinite(m.T)) pill(ctx, 'crossing time ' + un(m.T, 's', 3) + ' · lands ' + un(M.abs(m.drift), 'm', 3) + (m.drift >= 0 ? ' downstream' : ' upstream'), W0 / 2, ry1 + bank / 2, { W: W0, size: 11.5 });
      txt(ctx, 'river ' + nf(Wd, 3) + ' m wide', 8, 12, { size: 11.5, color: k.muted });
      F.desc('A boat heads ' + (hd0 === 0 ? 'straight across' : M.abs(hd0) + '° ' + (hd0 > 0 ? 'upstream' : 'downstream') + ' of straight across') + ' at ' + un(vb, 'm/s') + ' relative to the water, in a current of ' + un(vw, 'm/s') + (F.quiet ? '.' : '; relative to the ground it moves at ' + un(m.speed, 'm/s') + ' and lands ' + un(M.abs(m.drift), 'm') + (m.drift >= 0 ? ' downstream.' : ' upstream.')));
      F.read('Relative to the ground, v = v<sub>boat/water</sub> + v<sub>water</sub> = <b>' + un(m.speed, 'm/s', 3) + '</b>. Crossing time = width ÷ (the across part of the boat\'s velocity) = <b>' + (isFinite(m.T) ? un(m.T, 's', 3) : 'never') + '</b>; the current does not change it.');
      F.stats([['across speed', un(m.vy, 'm/s', 3)], ['downstream speed', un(m.vx, 'm/s', 3)], ['ground speed', un(m.speed, 'm/s', 3)], ['crossing time', isFinite(m.T) ? un(m.T, 's', 3) : '—'], ['drift', un(m.drift, 'm', 3)]]);
    };
    F.now(); return {};
  }

  // ===================================================================================================
  // ph-projectile
  /* PM.projectile(p): p = {v0, angle (deg), h, g, drag (k in 1/m: a = −k|v|v), yLand}. Returns {pts: [[t,x,y,vx,vy]…], T (flight
     time, or the last time if it never reaches yLand), range, apex: [t,x,y], lands}. Closed form without drag, RK4 with it. */
  PM.projectile = function (p) {
    var v0 = p.v0, th = p.angle * DEG, h = p.h || 0, g = p.g == null ? 9.8 : p.g, k = p.drag || 0, yl = p.yLand || 0, vx0 = v0 * M.cos(th), vy0 = v0 * M.sin(th);
    if (!k) {
      var disc = vy0 * vy0 + 2 * g * (h - yl), lands = disc >= 0, T = lands ? (vy0 + M.sqrt(disc)) / g : M.max(0.5, 2 * M.max(vy0, 0) / g + 0.5);
      var ta = M.max(0, vy0 / g), pts = [], n = 300;
      for (var i = 0; i <= n; i++) { var t = T * i / n; pts.push([t, vx0 * t, h + vy0 * t - g * t * t / 2, vx0, vy0 - g * t]); }
      return { pts: pts, T: T, range: lands ? vx0 * T : NaN, apex: [ta, vx0 * ta, h + vy0 * ta - g * ta * ta / 2], lands: lands, at: function (t) { t = clamp(t, 0, T); return [t, vx0 * t, h + vy0 * t - g * t * t / 2, vx0, vy0 - g * t]; } };
    }
    var Fn = function (t, y) { var sp = M.hypot(y[2], y[3]); return [y[2], y[3], -k * sp * y[2], -g - k * sp * y[3]]; };
    var dt = M.max(0.0005, (2 * M.abs(vy0) / g + M.sqrt(2 * M.abs(h) / g) + 0.2) / 3000), y = [0, h, vx0, vy0], t = 0, out = [[0, 0, h, vx0, vy0]], apex = [0, 0, h], landed = false;
    for (var s = 0; s < 200000; s++) {
      var y2 = rk4(Fn, t, y, dt), t2 = t + dt;
      if (y2[1] > apex[2]) apex = [t2, y2[0], y2[1]];
      if (y2[3] < 0 && y2[1] <= yl && y[1] > yl) { var f = (y[1] - yl) / (y[1] - y2[1]); t = t + dt * f; y = y.map(function (v, i) { return v + (y2[i] - v) * f; }); out.push([t, y[0], yl, y[2], y[3]]); landed = true; break; }
      t = t2; y = y2; if (s % 10 === 0) out.push([t, y[0], y[1], y[2], y[3]]);
      if (y[1] < M.min(yl, 0) - 50 || t > 120) break;
    }
    var at = function (tt) { tt = clamp(tt, 0, out[out.length - 1][0]); var lo = 0, hi = out.length - 1; while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (out[mid][0] <= tt) lo = mid; else hi = mid; } var a = out[lo], b = out[hi], f = b[0] > a[0] ? (tt - a[0]) / (b[0] - a[0]) : 0; return a.map(function (v, i) { return v + (b[i] - v) * f; }); };
    return { pts: out, T: out[out.length - 1][0], range: landed ? out[out.length - 1][1] : NaN, apex: apex, lands: landed, at: at };
  };
  R('ph-projectile', function (el, o) {
    var F = frame(el, o, 'Projectile motion with strobe positions');
    var P = { v0: num(o.v0, 20), angle: num(o.angle, 40), h: num(o.h, 0), g: num(o.g, 9.8), drag: num(o.drag, 0), yLand: num(o.yLand, 0) };
    var dragK = P.drag || 0.012, tgt = o.targetX != null ? num(o.targetX, null) : null;
    var sh = { strobe: F.on('strobe', true), vx: F.on('vx', false), vy: F.on('vy', false), v: F.on('v', true), ghost: F.on('ghost', false), apex: F.on('apex', true, true), range: F.on('range', true, true), grid: F.on('grid', true), twin: F.on('twin', false) };
    var mod, ghostM, twin, ext = [1, 1];
    function solve() {
      mod = PM.projectile(P);
      ghostM = PM.projectile({ v0: 0, angle: -90, h: P.h, g: P.g, drag: P.drag, yLand: P.yLand });
      twin = sh.twin ? PM.projectile({ v0: P.v0, angle: 90 - P.angle, h: P.h, g: P.g, drag: P.drag, yLand: P.yLand }) : null;
      var xs = [0, 1], ys = [0, P.h, P.yLand, 1]; mod.pts.forEach(function (q) { xs.push(q[1]); ys.push(q[2]); }); if (twin) twin.pts.forEach(function (q) { xs.push(q[1]); ys.push(q[2]); }); if (tgt != null) xs.push(tgt);
      ext = [M.max(ext[0], M.max.apply(null, xs) * 1.08), M.max(ext[1], M.max.apply(null, ys) * 1.12)];
      if (typeof aq !== 'undefined' && aq) aq.rate = 1 / clamp(mod.T, 0.8, 5);
    }
    solve(); var ext0 = ext.slice();
    var c = F.canvas({ aspect: 1.75, narrow: 1.2 });
    var aq = { tmax: 1, rate: 1 / clamp(mod.T, 0.8, 5), dt: 1 / 12, autoplay: !!o.play, tStatic: 0, tconv: function (v) { return clamp(v / mod.T, 0, 1); }, tfmt: function (v) { return fd(v * mod.T, 2, 's'); } };
    var A = F.anim(aq);
    function T() { return mod.T; }
    if (F.live) {
      var row = F.row();
      F.slider(row, { label: 'Launch speed v₀', min: 1, max: 40, step: 0.5, value: P.v0, unit: 'm/s', d: 1, input: function (v) { P.v0 = v; solve(); A.reset(); } });
      F.slider(row, { label: 'Launch angle θ', min: -30, max: 90, step: 1, value: P.angle, unit: '°', d: 0, input: function (v) { P.angle = v; solve(); A.reset(); } });
      F.slider(row, { label: 'Launch height h', min: 0, max: 50, step: 1, value: P.h, unit: 'm', d: 0, input: function (v) { P.h = v; ext = ext0.slice(); solve(); A.reset(); } });
      var r2 = F.row();
      F.check(r2, 'Air drag', !!P.drag, function (on) { P.drag = on ? dragK : 0; solve(); A.reset(); });
      F.check(r2, 'Dropped ball', sh.ghost, function (on) { sh.ghost = on; });
      F.check(r2, 'Velocity parts', sh.vx, function (on) { sh.vx = sh.vy = on; });
      F.check(r2, 'Complementary angle', sh.twin, function (on) { sh.twin = on; solve(); });
    }
    // the time slider runs over the flight time: anim's tmax is 1 (a fraction of the flight)
    F.draw = function () {
      var ctx = c.ctx, k = K(), fr = clamp(A.t, 0, 1), t = fr * T(); bg(c);
      var r = { x: 40, y: 12, w: c.w - 52, h: c.h - 34 }, ymin = M.min(0, P.yLand) - ext[1] * 0.02, xmin = -ext[0] * (P.h > P.yLand ? 0.07 : 0.03), sc = M.min(r.w / (ext[0] - xmin), r.h / (ext[1] - ymin));
      var xmax = xmin + r.w / sc, ymax = ymin + r.h / sc, mp = fitMap(r, xmin, xmax, ymin, ymax, true), X = mp.X, Y = mp.Y;
      var gr = { x: X(xmin), y: Y(ymax), w: X(xmax) - X(xmin), h: Y(ymin) - Y(ymax) };
      if (sh.grid) GP(ctx, gr, { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax, xlab: 'x (m)', ylab: 'y (m)', compact: F.compact, bg: false }).frame();
      ground(ctx, X(xmin), Y(M.min(0, P.yLand)), gr.w, k);
      if (P.h > 0) { block(ctx, X(xmin), Y(P.h), X(0) - X(xmin) - 7, Y(M.min(0, P.yLand)) - Y(P.h), { fill: k.obj2, color: k.obj2Line, r: 2 }); line(ctx, X(xmin), Y(P.h), X(0), Y(P.h), k.obj2Line, 2); }
      if (P.yLand > 0 && mod.lands) { var lx0 = X(tgt != null ? M.min(mod.range, tgt) : mod.range) - 22; block(ctx, lx0, Y(P.yLand), X(xmax) - lx0, Y(0) - Y(P.yLand), { fill: k.obj2, color: k.obj2Line, r: 2 }); }
      var ghostOn = sh.ghost && P.h > P.yLand;
      if (tgt != null) { var tx = X(tgt), ty = Y(P.yLand); [14, 9, 4].forEach(function (rr, i) { ctx.save(); ctx.beginPath(); ctx.ellipse(tx, ty - 2, rr * 1.4, rr * 0.45, 0, 0, TAU); ctx.fillStyle = i % 2 ? k.bg : k.red; ctx.fill(); ctx.restore(); }); txt(ctx, 'target', tx, ty + 12, { align: 'center', size: 11, color: k.red, halo: true }); }
      if (twin) { poly(ctx, twin.pts.map(function (q) { return [X(q[1]), Y(q[2])]; }), { color: k.purple, w: 1.8, dash: [6, 5] }); var ap = twin.apex; txt(ctx, (90 - P.angle) + '°', X(ap[1]), Y(ap[2]) - 10, { align: 'center', size: 11.5, color: k.purple, halo: true }); }
      poly(ctx, mod.pts.map(function (q) { return [X(q[1]), Y(q[2])]; }), { color: rgba(k.acc, 0.35), w: 2 });
      var past = mod.pts.filter(function (q) { return q[0] <= t; }).map(function (q) { return [X(q[1]), Y(q[2])]; }); past.push([X(mod.at(t)[1]), Y(mod.at(t)[2])]); if (F.live) poly(ctx, past, { color: k.acc, w: 2.6 });
      var vsc = M.min(2.2, 46 / M.max(1, P.v0)) ;
      if (sh.strobe) for (var i = 0; i <= 12; i++) {
        var ts = T() * i / 12, s = mod.at(ts), px = X(s[1]), py = Y(s[2]);
        if (ghostOn) { var gq = ghostM.at(ts); circ(ctx, X(0), Y(gq[2]), 4, { fill: rgba(k.muted, 0.6) }); if (i) line(ctx, X(0) + 5, Y(gq[2]), px - 5, py, rgba(k.muted, 0.4), 1, [2, 3]); }
        circ(ctx, px, py, 4.2, { fill: k.bg, color: k.acc, w: 2 });
        if (sh.vx) arrow(ctx, px, py, px + s[3] * vsc, py, { color: k.vel, w: 1.8, head: 7 });
        if (sh.vy) arrow(ctx, px, py, px, py - s[4] * vsc, { color: k.vel, w: 1.8, head: 7, dash: [4, 3] });
        F.tagAt(ctx, 's' + i, px + 12, py - 14);
      }
      if (ghostOn) F.tagAt(ctx, 'ghost', X(0) - 18, Y(ghostM.at(T() * 0.5)[2]));
      if (sh.apex && mod.apex[0] > 0) { var ap2 = mod.apex, ax = X(ap2[1]), ay = Y(ap2[2]); line(ctx, ax, ay, ax, Y(M.min(0, P.yLand)), k.muted, 1.2, [3, 4]); var vt = mod.at(ap2[0]); arrow(ctx, ax, ay, ax + vt[3] * vsc * 1.4, ay, { color: k.vel, w: 2.5, label: 'v' }); pill(ctx, 'top: v = vₓ' + (F.vals ? ' = ' + un(vt[3], 'm/s', 3) : '') + ', not 0' + (F.vals ? ' · height ' + un(ap2[2], 'm', 3) : ''), ax, ay - 20, { W: c.w, size: 11 }); }
      F.tagAt(ctx, 'apex', X(mod.apex[1]) - 18, Y(mod.apex[2]) - 6);
      if (mod.lands) { var lx = X(mod.range), ly = Y(P.yLand); F.tagAt(ctx, 'landing', lx + 16, ly - 14); if (sh.range) { var yy = Y(M.min(0, P.yLand)) + 4; arrow(ctx, X(0), yy - 12, lx, yy - 12, { color: k.disp, w: 1.4, double: true, head: 7 }); if (F.vals) txt(ctx, 'range ' + un(mod.range, 'm', 3), (X(0) + lx) / 2, yy - 22, { align: 'center', size: 11.5, color: k.ink, halo: true }); } }
      var s0 = mod.at(t), bx = X(s0[1]), by = Y(s0[2]);
      if (F.live || o.t != null) { ball(ctx, bx, by, 6.5, k.acc); if (sh.v) arrow(ctx, bx, by, bx + s0[3] * vsc, by - s0[4] * vsc, { color: k.vel, w: 2.8, label: 'v' }); if (ghostOn) ball(ctx, X(0), Y(ghostM.at(t)[2]), 6, k.muted); }
      var desc = 'Launched at ' + un(P.v0, 'm/s') + ' and ' + fm(P.angle, 1) + '°' + (P.h ? ' from ' + un(P.h, 'm') + ' up' : ' from the ground') + (P.drag ? ', with air drag' : '');
      if (!F.quiet) desc += mod.lands ? '; lands ' + un(mod.range, 'm') + ' away after ' + un(mod.T, 's') + '; top height ' + un(mod.apex[2], 'm') : '; it never comes down to the landing height';
      F.desc(desc + '.');
      F.read('At t = <b>' + fd(t, 2, 's') + '</b>: vₓ = <b>' + un(s0[3], 'm/s', 3) + '</b>' + (P.drag ? ' (drag slows it)' : ' (steady: no horizontal force)') + ', v<sub>y</sub> = <b>' + un(s0[4], 'm/s', 3) + '</b>.' + (mod.lands ? ' Range <b>' + un(mod.range, 'm', 3) + '</b>, time of flight <b>' + un(mod.T, 's', 3) + '</b>.' : ''));
      F.stats([['time', fd(t, 2, 's')], ['x', un(s0[1], 'm', 3)], ['y', un(s0[2], 'm', 3)], ['vₓ', un(s0[3], 'm/s', 3)], ['v_y', un(s0[4], 'm/s', 3)], ['range', mod.lands ? un(mod.range, 'm', 3) : '—'], ['top height', un(mod.apex[2], 'm', 3)], ['flight time', un(mod.T, 's', 3)]]);
    };
    F.now();
    return {};
  });

  // ===================================================================================================
  // shared: force names and symbols
  var FT = {
    gravity: { n: 'gravitational force', s: ['F', 'g'], by: 'Earth', ang: -90 },
    normal: { n: 'normal force', s: ['F', 'N'], by: 'the floor', ang: 90 },
    tension: { n: 'tension', s: ['F', 'T'], by: 'the rope', ang: 90 },
    friction: { n: 'friction', s: ['f', ''], by: 'the floor', ang: 180 },
    applied: { n: 'applied force', s: ['F', 'A'], by: 'a hand', ang: 0 },
    spring: { n: 'spring force', s: ['F', 'sp'], by: 'the spring', ang: 180 },
    drag: { n: 'air drag', s: ['F', 'D'], by: 'the air', ang: 180 },
    buoyant: { n: 'buoyant force', s: ['F', 'B'], by: 'the water', ang: 90 },
    electric: { n: 'electric force', s: ['F', 'E'], by: 'a charge', ang: 0 },
    magnetic: { n: 'magnetic force', s: ['F', 'M'], by: 'a magnet', ang: 0 },
    contact: { n: 'contact force', s: ['F', ''], by: 'the other block', ang: 180 },
    motion: { n: '"force of motion"', s: ['F', 'mot'], by: 'nothing', ang: 0 }
  };
  function symParts(label, type) { if (label) { var m = /^([^_]+)_?\{?([^}]*)\}?$/.exec(String(label)); return m ? [m[1], m[2] || ''] : [String(label), '']; } return (FT[type] || FT.applied).s; }
  /* symTxt: a symbol with a subscript, e.g. F with N below, at (x, y); align as in txt. Returns the width. */
  function symTxt(ctx, parts, x, y, o) {
    o = o || {}; var k = K(), b = parts[0], s = parts[1] || '', sz = o.size || 14, extra = o.extra || '';
    ctx.save(); ctx.font = 'italic 700 ' + sz + 'px Georgia,serif'; var wb = ctx.measureText(b).width; ctx.font = '600 ' + M.round(sz * 0.72) + 'px system-ui,sans-serif'; var ws = s ? ctx.measureText(s).width + 1 : 0; ctx.font = '600 ' + M.round(sz * 0.85) + 'px system-ui,sans-serif'; var we = extra ? ctx.measureText(extra).width + 3 : 0;
    we = extra ? ctx.measureText(extra).width + 1 : 0; var W0 = wb + ws + we, al = o.align || 'left', x0 = al === 'center' ? x - W0 / 2 : al === 'right' ? x - W0 : x, bs = o.base || 'middle', yy = bs === 'top' ? y + sz * 0.5 : bs === 'bottom' ? y - sz * 0.5 : y;
    function put(t, f, px, py) { ctx.font = f; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; if (o.halo !== false) { ctx.strokeStyle = k.halo; ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.strokeText(t, px, py); } ctx.fillStyle = o.color || k.ink; ctx.fillText(t, px, py); }
    put(b, 'italic 700 ' + sz + 'px Georgia,serif', x0, yy); if (s) put(s, '600 ' + M.round(sz * 0.72) + 'px system-ui,sans-serif', x0 + wb + 0.5, yy + sz * 0.32); if (extra) put(extra, '600 ' + M.round(sz * 0.85) + 'px system-ui,sans-serif', x0 + wb + ws + 1, yy);
    ctx.restore(); return W0;
  }
  function labelAtTip(ctx, parts, x1, y1, x2, y2, col, extra, sz) { var ang = M.atan2(y2 - y1, x2 - x1), ux = M.cos(ang), uy = M.sin(ang); return symTxt(ctx, parts, x2 + ux * 12, y2 + uy * 12, { color: col, align: ux > 0.35 ? 'left' : ux < -0.35 ? 'right' : 'center', base: uy > 0.4 ? 'top' : uy < -0.4 ? 'bottom' : 'middle', extra: extra, size: sz }); }

  // ===================================================================================================
  // ph-fbd: free-body diagrams, a build mode and third-law pairs
  var FBD_DEF = {
    block: { m: 5, f: [['gravity', 49], ['normal', 49]] },
    hanging: { m: 5, f: [['gravity', 49], ['tension', 49]] },
    incline: { m: 5, f: [['gravity', 49], ['normal', 42.4, 120, 'the ramp'], ['friction', 24.5, 30, 'the ramp']] },
    elevator: { m: 60, f: [['gravity', 588], ['normal', 708]], motion: { a: 2 } },
    car: { m: 1000, f: [['gravity', 9800], ['normal', 9800, 90, 'the road'], ['friction', 3000, 0, 'the road'], ['drag', 3000]], motion: { v: 20 } },
    'ball-air': { m: 0.5, f: [['gravity', 4.9]], motion: { v: 6, vAng: 70 } },
    person: { m: 70, f: [['gravity', 686], ['normal', 686]] },
    satellite: { m: 500, f: [['gravity', 4400, -90, 'Earth']], motion: { v: 7.6, vAng: 0 } },
    'two-blocks': { m: 5, f: [['gravity', 49, -90, 'Earth', 0], ['normal', 49, 90, 'the floor', 0], ['applied', 30, 0, 'a hand', 0], ['contact', 11.25, 180, 'block B', 0], ['gravity', 29.4, -90, 'Earth', 1], ['normal', 29.4, 90, 'the floor', 1], ['contact', 11.25, 0, 'block A', 1]], pairs: [[3, 6]] }
  };
  R('ph-fbd', function (el, o) {
    var mode = pick(o.mode, ['show', 'build', 'pairs'], 'show'), scene = pick(o.scene, ['block', 'hanging', 'incline', 'elevator', 'car', 'ball-air', 'two-blocks', 'person', 'satellite'], mode === 'pairs' ? 'two-blocks' : 'block');
    var F = frame(el, o, mode === 'build' ? 'Build a free-body diagram' : mode === 'pairs' ? 'Third-law force pairs between two objects' : 'A free-body diagram');
    var def = FBD_DEF[scene], th = num(o.angle, 30), two = scene === 'two-blocks';
    var forces = (Array.isArray(o.forces) ? o.forces : mode === 'build' ? [] : def.f.map(function (q) { return { type: q[0], mag: q[1], angle: q[2], by: q[3], on: q[4] }; })).map(function (q) {
      var t = FT[q.type] ? q.type : 'applied', a = q.angle != null ? num(q.angle, 0) : (scene === 'incline' ? { normal: 90 + th, friction: th }[t] : null);
      if (a == null) a = t === 'friction' && scene === 'car' ? 0 : FT[t].ang;
      var by = q.by || (scene === 'incline' && (t === 'normal' || t === 'friction') ? 'the ramp' : scene === 'car' && (t === 'normal' || t === 'friction') ? 'the road' : FT[t].by);
      return { type: t, mag: M.max(0, num(q.mag, 10)), angle: a, label: q.label, by: by, on: q.on ? 1 : 0 };
    });
    var pairs = o.pairs || (mode === 'pairs' ? def.pairs || [] : []), axA = o.axesAngle != null ? num(o.axesAngle, 0) : (scene === 'incline' && F.on('components', false) ? th : 0);
    var showNet = o.net ? F.on('net', true, true) : F.on('net', mode === 'build', true), showComp = F.on('components', false), unit = o.unit || 'N';
    var motion = o.motion || def.motion || null, sel = 0, PAIRC = ['red', 'teal', 'orange', 'purple'];
    var c = F.canvas({ aspect: { hanging: 1.5, elevator: 1.5, satellite: 1.6, 'ball-air': 1.6, incline: 1.6 }[scene] || 1.9, narrow: two ? 1.2 : 1.05 });
    var keyEl = mk('div', 'phv-key'); if (!F.compact) el.insertBefore(keyEl, F.ctl);
    function scale() { var mx = 1; forces.forEach(function (f) { mx = M.max(mx, f.mag); }); return mx; }
    var mx0 = M.max(scale(), num(o.scaleMax, 0)), centers = [];
    function lenPx() { return M.min(c.w * (two ? 0.2 : 0.34), c.h * 0.36); }
    function tip(f) { var C0 = centers[f.on] || [c.w / 2, c.h / 2], L = f.mag / mx0 * lenPx(); return [C0[0] + L * M.cos(f.angle * DEG), C0[1] - L * M.sin(f.angle * DEG)]; }
    function pairOf(i) { for (var j = 0; j < pairs.length; j++) if (pairs[j][0] === i || pairs[j][1] === i) return j; return -1; }
    function netOf(on) { var x = 0, y = 0; forces.forEach(function (f) { if (f.on === on) { x += f.mag * M.cos(f.angle * DEG); y += f.mag * M.sin(f.angle * DEG); } }); return [x, y]; }
    // build mode controls
    if (mode === 'build' && F.live) {
      var pal = mk('div', 'ml-seg'); pal.setAttribute('role', 'group'); pal.setAttribute('aria-label', 'Add a force'); F.ctl.appendChild(pal);
      var types = arr(o.palette || ['gravity', 'normal', 'tension', 'friction', 'applied', 'drag']).concat(o.expect ? ['motion'] : []);
      types.forEach(function (t) { if (!FT[t]) return; var b = mk('button', '', '+ ' + FT[t].n); b.type = 'button'; b.addEventListener('click', function () { var a = scene === 'incline' ? { normal: 90 + th, friction: th }[t] : null; forces.push({ type: t, mag: mx0 * 0.6, angle: a != null ? a : FT[t].ang, by: FT[t].by, on: 0 }); sel = forces.length - 1; hd.sel(sel); F.now(); F.say(FT[t].n + ' added; drag its head or use the arrow keys'); }); pal.appendChild(b); });
      var r2 = F.row();
      F.button(r2, 'Remove selected', function () { if (forces.length) { forces.splice(M.min(sel, forces.length - 1), 1); sel = 0; hd.sel(0); } });
      if (o.expect) F.button(r2, 'Check my diagram', function () { check(); }, 'pri');
    }
    var chk = '';
    function check() {
      var want = arr(o.expect).slice(), have = forces.map(function (f) { return f.type; }), miss = [], extra = [];
      want.forEach(function (t) { var i = have.indexOf(t); if (i >= 0) have.splice(i, 1); else miss.push(FT[t] ? FT[t].n : t); });
      have.forEach(function (t) { extra.push(t); });
      if (extra.indexOf('motion') >= 0) chk = 'There is no “force of motion.” A moving object keeps moving on its own; only pushes and pulls by other objects belong on the diagram.';
      else if (!miss.length && !extra.length) chk = 'Every force is there, and nothing extra. Each one is exerted by another object.';
      else chk = (miss.length ? 'Missing: ' + miss.join(', ') + '. ' : '') + (extra.length ? 'Not needed here: ' + extra.map(function (t) { return FT[t].n; }).join(', ') + '. Ask: what object exerts it?' : '');
      F.say(chk); F.now();
    }
    var hd = F.handles((mode === 'build' || o.drag) && F.live ? [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) {
      return { name: 'force ' + (i + 1), off: function () { return i >= forces.length; }, pos: function () { return forces[i] ? tip(forces[i]) : null; },
        start: function () { sel = i; },
        drag: function (px, py) { var f = forces[i], C0 = centers[f.on]; var dx = px - C0[0], dy = C0[1] - py; f.angle = M.round(M.atan2(dy, dx) / DEG / 5) * 5; f.mag = M.round(M.min(1.6, M.hypot(dx, dy) / lenPx()) * mx0 * 20) / 20; },
        key: function (dx, dy, big) { var f = forces[i]; sel = i; if (dx) f.angle = (f.angle - dx * (big ? 15 : 5) + 360) % 360; if (dy) f.mag = M.max(0, f.mag + dy * mx0 * (big ? 0.2 : 0.05)); } };
    }) : [], { r: 24 });
    function drawScene(ctx, k, C0, w, h) {
      var x = C0[0], y = C0[1];
      if (scene === 'block' || scene === 'two-blocks' || scene === 'person') ground(ctx, 10, y + h / 2, c.w - 20, k);
      if (scene === 'block' || scene === 'two-blocks') block(ctx, x - w / 2, y - h / 2, w, h, { label: two ? (C0 === centers[0] ? 'A' : 'B') : '' });
      else if (scene === 'person') { ctx.save(); ctx.strokeStyle = k.objLine; ctx.lineWidth = 3; ctx.lineCap = 'round'; circ(ctx, x, y - h * 0.38, h * 0.12, { fill: k.skin, color: k.objLine, w: 2.5 }); ctx.beginPath(); ctx.moveTo(x, y - h * 0.26); ctx.lineTo(x, y + h * 0.12); ctx.moveTo(x - h * 0.2, y - h * 0.12); ctx.lineTo(x, y - h * 0.2); ctx.lineTo(x + h * 0.2, y - h * 0.12); ctx.moveTo(x - h * 0.13, y + h * 0.5); ctx.lineTo(x, y + h * 0.12); ctx.lineTo(x + h * 0.13, y + h * 0.5); ctx.stroke(); ctx.restore(); }
      else if (scene === 'hanging') { hatch(ctx, x - 60, 4, 120, 10, k.ground); line(ctx, x - 60, 14, x + 60, 14, k.ground, 2); line(ctx, x, 14, x, y - h / 2, k.metal, 2.5); block(ctx, x - w / 2, y - h / 2, w, h); }
      else if (scene === 'incline') { var a = th * DEG, L = c.w * 0.9, bx = x + (h / 2) * M.sin(a), by = y + (h / 2) * M.cos(a); var p0 = [bx - L / 2 * M.cos(a), by + L / 2 * M.sin(a)], p1 = [bx + L / 2 * M.cos(a), by - L / 2 * M.sin(a)]; poly(ctx, [p0, p1, [p1[0], p0[1]]], { fill: k.obj2, color: k.obj2Line, w: 2, close: true }); arc(ctx, p0[0], p0[1], 34, -a, 0, k.obj2Line, 1.5); txt(ctx, fm(th, 0) + '°', p0[0] + 40, p0[1] - 9, { size: 11.5, color: k.obj2Line }); ctx.save(); ctx.translate(x, y); ctx.rotate(-a); block(ctx, -w / 2, -h / 2, w, h); ctx.restore(); }
      else if (scene === 'elevator') { ctx.save(); ctx.strokeStyle = k.metal; ctx.lineWidth = 2.5; rrect(ctx, x - w * 1.4, y - h * 1.5, w * 2.8, h * 2, 6); ctx.stroke(); ctx.restore(); line(ctx, x, y - h * 1.5, x, 0, k.metal, 2); hatch(ctx, x - w * 1.4, y + h / 2, w * 2.8, 8, k.ground); block(ctx, x - w / 2, y - h / 2, w, h); }
      else if (scene === 'car') { ground(ctx, 10, y + h / 2 + 2, c.w - 20, k); ctx.save(); rrect(ctx, x - w * 0.75, y - h * 0.15, w * 1.5, h * 0.55, 8); ctx.fillStyle = k.obj; ctx.fill(); ctx.strokeStyle = k.objLine; ctx.lineWidth = 2; ctx.stroke(); rrect(ctx, x - w * 0.4, y - h * 0.5, w * 0.8, h * 0.4, 8); ctx.fill(); ctx.stroke(); ctx.restore(); circ(ctx, x - w * 0.45, y + h * 0.4, h * 0.16, { fill: k.ink }); circ(ctx, x + w * 0.45, y + h * 0.4, h * 0.16, { fill: k.ink }); }
      else if (scene === 'ball-air') { ground(ctx, 10, c.h - 14, c.w - 20, k); ball(ctx, x, y, 16, k.acc); }
      else if (scene === 'satellite') { circ(ctx, x, y + c.h * 1.3, c.h * 1.05, { fill: k.isDark ? '#1d4a6b' : '#cfe3f5', color: k.waterLine, w: 2 }); circ(ctx, x, y + c.h * 1.3, c.h * 1.3, { color: k.muted, w: 1.2, dash: [4, 5] }); txt(ctx, 'Earth', x, c.h - 12, { align: 'center', color: k.muted, size: 12 }); block(ctx, x - 9, y - 9, 18, 18, { r: 3 }); line(ctx, x - 24, y, x + 24, y, k.objLine, 4); }
      if (!two) circ(ctx, x, y, 4, { fill: k.ink });
    }
    F.draw = function () {
      var ctx = c.ctx, k = K(); bg(c);
      var w = M.min(84, c.w * 0.16), h = w * 0.7, cy = scene === 'hanging' ? c.h * 0.58 : scene === 'satellite' ? c.h * 0.4 : scene === 'ball-air' ? c.h * 0.45 : c.h * 0.52;
      if (scene === 'person') { w = 30; h = M.min(110, c.h * 0.42); }
      if (two) { centers = [[c.w * 0.3, cy], [c.w * 0.68, cy + h * 0.15]]; drawScene(ctx, k, centers[0], w, h); drawScene(ctx, k, centers[1], w * 0.84, h * 0.7); }
      else { centers = [[c.w / 2, cy]]; drawScene(ctx, k, centers[0], w, h); }
      if (showComp && (axA || scene === 'incline')) { var a = axA * DEG, C0 = centers[0], L = lenPx() * 1.1; [[M.cos(a), M.sin(a)], [-M.sin(a), M.cos(a)]].forEach(function (e, i) { line(ctx, C0[0] - e[0] * L, C0[1] + e[1] * L, C0[0] + e[0] * L, C0[1] - e[1] * L, k.acc, 1.2, [6, 4]); txt(ctx, i ? 'y′' : 'x′', C0[0] + e[0] * L + 4, C0[1] - e[1] * L - 8, { italic: true, serif: true, color: k.acc, size: 13, halo: true }); });
        forces.forEach(function (f) { var C1 = centers[f.on], t1 = tip(f), d = [t1[0] - C1[0], C1[1] - t1[1]], e1 = [M.cos(a), M.sin(a)], p1 = d[0] * e1[0] + d[1] * e1[1]; var q = [C1[0] + p1 * e1[0], C1[1] - p1 * e1[1]]; line(ctx, t1[0], t1[1], q[0], q[1], rgba(k.force, 0.6), 1.2, [3, 3]); var e2 = [-e1[1], e1[0]], p2 = d[0] * e2[0] + d[1] * e2[1], q2 = [C1[0] + p2 * e2[0], C1[1] - p2 * e2[1]]; line(ctx, t1[0], t1[1], q2[0], q2[1], rgba(k.force, 0.6), 1.2, [3, 3]); if (M.abs(p1) > 3) arrow(ctx, C1[0], C1[1], q[0], q[1], { color: rgba(k.force, 0.75), w: 2, dash: [5, 3] }); if (M.abs(p2) > 3) arrow(ctx, C1[0], C1[1], q2[0], q2[1], { color: rgba(k.force, 0.75), w: 2, dash: [5, 3] }); }); }
      var labs = [];
      forces.forEach(function (f, i) {
        var C1 = centers[f.on], t1 = tip(f), pj = pairOf(i), col = pj >= 0 ? k[PAIRC[pj % PAIRC.length]] : f.type === 'motion' ? k.muted : k.force;
        if (f.mag <= 0) return;
        arrow(ctx, C1[0], C1[1], t1[0], t1[1], { color: col, w: mode === 'build' && i === sel && F.live ? 4 : 3, dash: f.type === 'motion' ? [6, 4] : null });
        var ex = F.vals && f.type !== 'motion' ? ' = ' + un(f.mag, unit, 3) : '', sp = symParts(f.label, f.type); if (f.type === 'contact') sp = ['F', f.by === 'block B' ? 'BA' : f.by === 'block A' ? 'AB' : 'c'];
        labelAtTip(ctx, sp, C1[0], C1[1], t1[0], t1[1], col, ex, F.compact ? 12 : 14);
        if (pj >= 0) txt(ctx, 'pair ' + (pj + 1), (C1[0] + t1[0]) / 2, (C1[1] + t1[1]) / 2 - 12, { align: 'center', size: 10.5, color: col, halo: true });
        var ang = M.atan2(t1[1] - C1[1], t1[0] - C1[0]); F.tagAt(ctx, 'f' + i, C1[0] + (t1[0] - C1[0]) * 0.55 - M.sin(ang) * 16, C1[1] + (t1[1] - C1[1]) * 0.55 + M.cos(ang) * 16);
        if (mode === 'build' && F.live) knob(ctx, t1[0], t1[1], col, 6);
        labs.push({ f: f, i: i, col: col, sp: sp });
      });
      centers.forEach(function (C1, on) { if (!showNet) return; var n = netOf(on), L = M.hypot(n[0], n[1]); if (L < mx0 * 0.01) { if (forces.length) txt(ctx, 'ΣF = 0', C1[0] + 14, C1[1] + 18, { size: 12.5, weight: 700, color: k.net, halo: true }); return; } var s = L / mx0 * lenPx(), ex = [C1[0] + n[0] / L * s, C1[1] - n[1] / L * s]; arrow(ctx, C1[0], C1[1], ex[0], ex[1], { color: k.net, w: 5.5 }); labelAtTip(ctx, ['ΣF', ''], C1[0], C1[1], ex[0], ex[1], k.net, F.vals ? ' = ' + un(L, unit, 3) : '', 14); F.tagAt(ctx, 'net', (C1[0] + ex[0]) / 2 + 16, (C1[1] + ex[1]) / 2 + 16); });
      F.tagAt(ctx, 'obj', centers[0][0] - 30, centers[0][1] - 30);
      if (motion && !two) { var mxp = c.w - 70, myp = 28; if (motion.v) { var va = num(motion.vAng, 0) * DEG; arrow(ctx, mxp, myp + 8, mxp + 34 * M.cos(va), myp + 8 - 34 * M.sin(va), { color: k.vel, w: 2.5 }); txt(ctx, 'v', mxp - 8, myp + 8, { italic: true, serif: true, color: k.vel, size: 14, align: 'right', weight: 700 }); } var am = num(motion.a, 0); if (motion.a != null) { if (M.abs(am) > 1e-9) { var aa = motion.aAng != null ? num(motion.aAng, 0) * DEG : (scene === 'elevator' ? (am > 0 ? PI / 2 : -PI / 2) : (am > 0 ? 0 : PI)); arrow(ctx, mxp, myp + 40, mxp + 30 * M.cos(aa), myp + 40 - 30 * M.sin(aa), { color: k.accel, w: 2.5 }); txt(ctx, 'a', mxp - 8, myp + 40, { italic: true, serif: true, color: k.accel, size: 14, align: 'right', weight: 700 }); } else txt(ctx, 'a = 0', mxp - 8, myp + 40, { color: k.accel, size: 12.5, weight: 700 }); } }
      if (chk && F.live) pill(ctx, chk.length > 70 ? chk.slice(0, chk.indexOf('.') + 1) : chk, c.w / 2, c.h - 16, { W: c.w, size: 11.5, border: k.gold });
      hd.draw(ctx);
      // key: full names and what exerts each force
      if (!F.compact) { keyEl.innerHTML = labs.map(function (L) { var f = L.f; return '<span><i style="--c:' + L.col + '"></i>' + esc(L.sp[0] + (L.sp[1] ? '_' + L.sp[1] : '')) .replace(/_(\w+)/, '<sub>$1</sub>') + ': ' + esc(FT[f.type].n) + ' on ' + (two ? (f.on ? 'B' : 'A') : 'the object') + ' by ' + esc(f.by) + (F.vals && f.type !== 'motion' ? ', ' + un(f.mag, unit, 3) : '') + '</span>'; }).join(''); }
      var n0 = netOf(0), nl = M.hypot(n0[0], n0[1]);
      F.desc((mode === 'pairs' ? 'Two objects with the forces on each. ' : 'Free-body diagram' + (scene !== 'block' ? ' (' + scene.replace('-', ' ') + ')' : '') + ': ') + labs.map(function (L) { return FT[L.f.type].n + ' by ' + L.f.by + (F.vals ? ' ' + un(L.f.mag, unit, 3) : '') + ' at ' + fm(L.f.angle, 0) + '°' + (two ? ' on ' + (L.f.on ? 'B' : 'A') : ''); }).join('; ') + '.' + (showNet ? ' Net force ' + (nl < 1e-9 ? 'zero.' : un(nl, unit, 3) + ' at ' + fm(M.atan2(n0[1], n0[0]) / DEG, 0) + '°.') : ''));
      var rd = mode === 'pairs' ? 'Third-law pairs act on <b>different</b> objects, are the same size and point opposite ways. Gravity and the normal force on one block are <b>not</b> a pair: both act on the same block. Gravity on A pairs with A pulling up on Earth; the normal force on A pairs with A pressing down on the floor.' : (showNet ? 'Net force ΣF = <b>' + (nl < 1e-9 ? '0' : un(nl, unit, 3) + '</b> at <b>' + fm(M.atan2(n0[1], n0[0]) / DEG, 0) + '°') + '</b>.' + (nl < 1e-9 ? ' Balanced forces: the object stays at rest or keeps moving at a steady velocity.' : ' The object accelerates in the direction of the net force.') : '');
      F.read(rd + (chk ? ' ' + chk : ''));
    };
    F.now();
    return {};
  });

  // ===================================================================================================
  // ph-dynamics: animated scenes that obey Newton's laws exactly
  /* PM.dyn(scene, p): closed-form accelerations, tensions, normal and friction forces for the constant-force scenes.
     Signs: a > 0 in the scene's positive direction (cart: right; incline: down the slope; atwood: m2 down; table: m2 down;
     push-two and train: right; movable-pulley: m1 up). */
  PM.dyn = function (sc, p) {
    var g = p.g == null ? 9.8 : p.g, m1 = p.m1, m2 = p.m2, m3 = p.m3 || 0, mus = p.mus || 0, muk = p.muk || 0, r = {};
    if (sc === 'atwood' || sc === 'heavy-pulley') { var I = sc === 'heavy-pulley' ? (p.pulleyM || 0) / 2 : 0; r.a = (m2 - m1) * g / (m1 + m2 + I); r.T1 = m1 * (g + r.a); r.T2 = m2 * (g - r.a); }
    else if (sc === 'table') { var drive = m2 * g; if (drive <= mus * m1 * g + 1e-12) { r.a = 0; r.f = drive; r.T1 = r.T2 = drive; r.stuck = true; } else { r.a = (drive - muk * m1 * g) / (m1 + m2); r.f = muk * m1 * g; r.T1 = r.T2 = m2 * (g - r.a); } r.N = m1 * g; }
    else if (sc === 'push-two') { var Fa = p.F, fr = muk * (m1 + m2) * g; r.a = Fa > mus * (m1 + m2) * g ? (Fa - fr) / (m1 + m2) : 0; r.contact = r.a > 0 ? m2 * r.a + muk * m2 * g : Fa * m2 / (m1 + m2); r.N1 = m1 * g; r.N2 = m2 * g; }
    else if (sc === 'train') { var mt = m1 + m2 + m3; r.a = M.max(0, (p.F - muk * mt * g) / mt); r.T12 = (m2 + m3) * (r.a + muk * g); r.T23 = m3 * (r.a + muk * g); if (r.a === 0) { r.T12 = p.F * (m2 + m3) / mt; r.T23 = p.F * m3 / mt; } }
    else if (sc === 'movable-pulley') { r.a1 = (2 * m2 - m1) * g / (m1 + 4 * m2); r.a2 = -2 * r.a1; r.T = m2 * (g + r.a2); r.a = r.a1; }
    else if (sc === 'incline') { var th = p.angle * DEG, N = m1 * g * M.cos(th), down = m1 * g * M.sin(th); r.N = N; r.down = down; r.slips = M.tan(th) > mus + 1e-12; r.fsNeeded = down; r.fsMax = mus * N; r.aSlide = g * (M.sin(th) - muk * M.cos(th)); }
    return r;
  };
  function hand(ctx, x, y, k) { // a pusher's hand and arm touching (x, y) from the left
    ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 46, y + 6); ctx.lineTo(x - 14, y); ctx.strokeStyle = k.skinLine; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = k.skin; ctx.lineWidth = 5.5; ctx.stroke(); rrect(ctx, x - 16, y - 9, 15, 18, 6); ctx.fillStyle = k.skin; ctx.fill(); ctx.strokeStyle = k.skinLine; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  }
  R('ph-dynamics', function (el, o) {
    var sc = pick(o.scene, ['cart', 'incline', 'atwood', 'table', 'push-two', 'train', 'elevator', 'heavy-pulley', 'movable-pulley'], 'cart');
    var F = frame(el, o, { cart: 'A cart pushed along a track', incline: 'A block on a tilting ramp', atwood: 'An Atwood machine', table: 'A block on a table pulled by a hanging mass', 'push-two': 'Two blocks pushed together', train: 'A train of three carts', elevator: 'A person on a scale in an elevator', 'heavy-pulley': 'An Atwood machine with a heavy pulley', 'movable-pulley': 'A movable pulley' }[sc]);
    var g = num(o.g, 9.8), P = { g: g, m1: num(o.m1, sc === 'elevator' ? 60 : sc === 'atwood' || sc === 'heavy-pulley' ? 3 : sc === 'movable-pulley' ? 4 : 2), m2: num(o.m2, sc === 'atwood' || sc === 'heavy-pulley' ? 5 : sc === 'movable-pulley' ? 3 : 1), m3: num(o.m3, 1), mus: num(o.mus, sc === 'incline' ? 0.5 : sc === 'table' ? 0.3 : 0), muk: num(o.muk, sc === 'incline' ? 0.35 : sc === 'table' ? 0.2 : 0), F: num(o.F, sc === 'train' ? 12 : sc === 'push-two' ? 18 : 6), angle: num(o.angle, 20), pulleyM: num(o.pulleyM, 4), pulleyR: num(o.pulleyR, 0.1) };
    var showFbd = F.on('fbd', true), showGraph = F.on('graph', sc === 'cart' || sc === 'elevator'), vals = F.vals;
    var phases = Array.isArray(o.elevatorA) ? o.elevatorA.map(function (q) { return { dur: num(q.dur, 1), a: num(q.a, 0) }; }) : [{ dur: 1.5, a: o.elevatorA != null ? num(o.elevatorA, 2) : 2 }, { dur: 2, a: 0 }, { dur: 1.5, a: -(o.elevatorA != null ? num(o.elevatorA, 2) : 2) }];
    var S = { t: 0, s: 0, v: 0, push: sc === 'cart' ? o.push !== false : true, sliding: false, hist: [] }, limit = 1;
    var c = F.canvas({ aspect: showGraph ? (sc === 'elevator' ? 1.2 : 1.5) : ({ incline: 1.75, atwood: 1.45, 'heavy-pulley': 1.45, table: 1.6, 'push-two': 2.5, train: 2.5, 'movable-pulley': 1.4 }[sc] || 1.7), narrow: showGraph ? 0.9 : sc === 'push-two' || sc === 'train' ? 1.5 : 1.0 });
    function elevA(t) { var acc = 0; for (var i = 0; i < phases.length; i++) { if (t < acc + phases[i].dur) return phases[i].a; acc += phases[i].dur; } return 0; }
    var Tel = phases.reduce(function (s, q) { return s + q.dur; }, 0);
    function accel() {
      var r = PM.dyn(sc, P);
      if (sc === 'cart') { var Fp = S.push ? P.F : 0, fk = P.muk * P.m1 * g, fs = P.mus * P.m1 * g; if (M.abs(S.v) < 1e-6) { if (Fp > fs + 1e-12 && Fp > fk) return { a: (Fp - fk) / P.m1, f: -fk, kin: true }; return { a: 0, f: -Fp, kin: false }; } var fdir = S.v > 0 ? -1 : 1; return { a: (Fp + fdir * fk) / P.m1, f: fk * fdir, kin: true }; }
      if (sc === 'incline') { if (!S.sliding && r.slips) S.sliding = true; if (S.sliding) { var a = r.aSlide; if (S.v <= 0 && a <= 0) { S.sliding = r.slips; return { a: 0, f: r.down, kin: false, r: r }; } return { a: a, f: P.muk * r.N, kin: true, r: r }; } return { a: 0, f: r.down, kin: false, r: r }; }
      if (sc === 'elevator') return { a: elevA(S.t) };
      return { a: r.a, r: r };
    }
    function stepSim(h) {
      var n = M.max(1, M.ceil(h / 0.004)), dt = h / n;
      for (var i = 0; i < n; i++) {
        var A0 = accel(), a = A0.a; S.v += a * dt; if (sc === 'cart' && !S.push && A0.kin && P.muk > 0 && S.v * (S.v - a * dt) < 0) S.v = 0; if (sc === 'incline' && S.sliding && S.v < 0) { S.v = 0; }
        S.s += S.v * dt; S.t += dt;
        if (sc !== 'cart' && sc !== 'elevator' && M.abs(S.s) >= limit) { S.s = M.sign(S.s) * limit; S.v = 0; return false; }
        if (sc === 'elevator' && S.t >= Tel) { return false; }
      }
      if (showGraph) { S.hist.push([S.t, S.v]); if (S.hist.length > 2000) S.hist.shift(); }
      return true;
    }
    function reset() { S.t = 0; S.s = 0; S.v = 0; S.sliding = false; S.hist = [[0, 0]]; }
    reset();
    var tmax = sc === 'elevator' ? Tel : 0;
    var A = F.anim({ tmax: tmax || undefined, scrub: false, autoplay: o.play != null ? !!o.play : sc !== 'cart' && sc !== 'incline', tick: function (h) { if (sc === 'cart' && M.abs(S.s) > 1e4) return false; return stepSim(h); }, reset: reset, dt: 0.1 });
    if (!F.live && num(o.t, 0) > 0) stepSim(num(o.t, 0));
    if (F.live) {
      var row = F.row();
      if (sc === 'cart') {
        var pb = F.button(row, S.push ? 'Stop pushing' : 'Push', function () { S.push = !S.push; pb.textContent = S.push ? 'Stop pushing' : 'Push'; pb.setAttribute('aria-pressed', String(S.push)); if (!A.playing) A.play(); }); pb.setAttribute('aria-pressed', String(S.push));
        F.slider(row, { label: 'Push F', min: 0, max: 20, step: 0.5, value: P.F, unit: 'N', d: 1, input: function (v) { P.F = v; } });
        F.slider(row, { label: 'Kinetic friction μₖ', min: 0, max: 0.6, step: 0.01, value: P.muk, d: 2, input: function (v) { P.muk = v; P.mus = M.max(P.mus, v); } });
        F.slider(row, { label: 'Mass m', min: 0.5, max: 10, step: 0.5, value: P.m1, unit: 'kg', d: 1, input: function (v) { P.m1 = v; } });
      } else if (sc === 'incline') {
        F.slider(row, { label: 'Ramp angle θ', min: 0, max: 60, step: 0.5, value: P.angle, unit: '°', d: 1, input: function (v) { P.angle = v; if (!A.playing) A.play(); } });
        F.slider(row, { label: 'μₛ (static)', min: 0, max: 1, step: 0.01, value: P.mus, d: 2, input: function (v) { P.mus = v; P.muk = M.min(P.muk, v); } });
        F.slider(row, { label: 'μₖ (kinetic)', min: 0, max: 1, step: 0.01, value: P.muk, d: 2, input: function (v) { P.muk = M.min(v, P.mus); } });
      } else if (sc === 'elevator') {
        F.slider(row, { label: 'Person’s mass', min: 20, max: 120, step: 1, value: P.m1, unit: 'kg', d: 0, input: function (v) { P.m1 = v; } });
      } else {
        F.slider(row, { label: sc === 'push-two' || sc === 'train' ? 'Mass m₁' : 'Mass m₁', min: 0.5, max: 10, step: 0.5, value: P.m1, unit: 'kg', d: 1, input: function (v) { P.m1 = v; A.pause(); A.reset(); } });
        F.slider(row, { label: 'Mass m₂', min: 0.5, max: 10, step: 0.5, value: P.m2, unit: 'kg', d: 1, input: function (v) { P.m2 = v; A.pause(); A.reset(); } });
        if (sc === 'push-two' || sc === 'train') F.slider(row, { label: 'Applied force F', min: 0, max: 40, step: 0.5, value: P.F, unit: 'N', d: 1, input: function (v) { P.F = v; A.pause(); A.reset(); } });
        if (sc === 'heavy-pulley') F.slider(row, { label: 'Pulley mass M', min: 0, max: 10, step: 0.5, value: P.pulleyM, unit: 'kg', d: 1, input: function (v) { P.pulleyM = v; A.pause(); A.reset(); } });
        if (sc === 'table') F.slider(row, { label: 'μₖ (table)', min: 0, max: 0.8, step: 0.01, value: P.muk, d: 2, input: function (v) { P.muk = v; P.mus = M.max(P.mus, v); A.pause(); A.reset(); } });
      }
    }
    function fbdArrows(ctx, k, x, y, list, scl) { // list: [[mag, angleDeg, parts, extra]]
      list.forEach(function (q) { if (!(q[0] > 1e-9)) return; var L = q[0] * scl, a = q[1] * DEG, ex = x + L * M.cos(a), ey = y - L * M.sin(a); arrow(ctx, x, y, ex, ey, { color: q[4] || k.force, w: 2.6 }); labelAtTip(ctx, q[2], x, y, ex, ey, q[4] || k.force, vals && q[3] != null ? ' = ' + un(q[3], 'N', 3) : '', 12.5); });
    }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = showGraph ? c.h * (sc === 'elevator' ? 0.64 : 0.46) : c.h, A0 = accel(), r = PM.dyn(sc, P), mg = P.m1 * g; bg(c);
      var desc = '', read = '', st = [], sclF;
      if (sc === 'cart') {
        var ty = H0 * 0.74, span = 10, x0 = 40, ppm = (W0 - 80) / span, xp = x0 + (((S.s % span) + span) % span) * ppm;
        ground(ctx, 10, ty, W0 - 20, k); for (var i = 0; i <= span; i++) { line(ctx, x0 + i * ppm, ty + 1, x0 + i * ppm, ty + 7, k.axis, 1); txt(ctx, String(i), x0 + i * ppm, ty + 16, { size: 10, align: 'center', color: k.muted, weight: 500 }); }
        txt(ctx, 'm', W0 - 14, ty + 16, { size: 10, color: k.muted, align: 'right' });
        block(ctx, xp - 34, ty - 44, 68, 34, { label: fm(P.m1, 1) + ' kg', size: 12 }); circ(ctx, xp - 20, ty - 6, 6, { fill: k.ink }); circ(ctx, xp + 20, ty - 6, 6, { fill: k.ink });
        if (S.push && P.F > 0) hand(ctx, xp - 34, ty - 27, k);
        if (showFbd) fbdArrows(ctx, k, xp, ty - 27, [[S.push ? P.F : 0, 0, ['F', 'A'], P.F], [M.abs(A0.f || 0), (A0.f || 0) > 0 ? 0 : 180, ['f', A0.kin ? 'k' : 's'], M.abs(A0.f || 0)]], 5);
        if (M.abs(S.v) > 1e-3) arrow(ctx, xp, ty - 62, xp + clamp(S.v * 14, -90, 90), ty - 62, { color: k.vel, w: 3, label: 'v' });
        desc = 'A ' + fm(P.m1, 1) + ' kg cart ' + (S.push ? 'pushed with ' + un(P.F, 'N') : 'with no push') + ', moving at ' + un(S.v, 'm/s', 2) + '.';
        read = S.push ? 'Push ' + un(P.F, 'N', 3) + (P.muk > 0 ? ', friction ' + un(M.abs(A0.f || 0), 'N', 3) : '') + ': net force ' + un(P.m1 * A0.a, 'N', 3) + ', so a = F<sub>net</sub>/m = <b>' + un(A0.a, 'm/s²', 3) + '</b>.' : (P.muk > 0 ? 'No push: friction alone acts, so the cart slows down at <b>' + un(M.abs(A0.a), 'm/s²', 3) + '</b> until it stops.' : 'No push and no friction: the net force is zero, so the cart <b>keeps moving at a steady ' + un(S.v, 'm/s', 3) + '</b>. Motion does not need a force; a change in motion does.');
        st = [['push F', un(S.push ? P.F : 0, 'N', 3)], ['friction', un(M.abs(A0.f || 0), 'N', 3)], ['acceleration', un(A0.a, 'm/s²', 3)], ['velocity', un(S.v, 'm/s', 3)]];
      } else if (sc === 'incline') {
        var th = P.angle * DEG, L = M.min(W0 * 0.8, H0 * 0.78 / M.sin(60 * DEG)), bx0 = W0 * 0.08, by0 = H0 * 0.9, topx = bx0 + L * M.cos(th), topy = by0 - L * M.sin(th);
        limit = 0.8 * L / 60; // metres of ramp shown: 1 m = 60 px
        poly(ctx, [[bx0, by0], [bx0 + L * M.cos(th), by0], [topx, topy]], { fill: k.obj2, color: k.obj2Line, close: true, w: 2 }); arc(ctx, bx0, by0, 40, -th, 0, k.obj2Line, 1.5); txt(ctx, fm(P.angle, 1) + '°', bx0 + 46, by0 - 10, { size: 12, color: k.obj2Line });
        var d = 0.88 * L - M.min(S.s * 60, 0.8 * L), bxx = bx0 + d * M.cos(th), byy = by0 - d * M.sin(th);
        ctx.save(); ctx.translate(bxx, byy); ctx.rotate(-th); block(ctx, -24, -32, 48, 32, { label: fm(P.m1, 1) + ' kg', size: 11 }); ctx.restore();
        var cx0 = bxx - 16 * M.sin(th), cy0 = byy - 16 * M.cos(th), fsc = 70 / M.max(1e-6, mg);
        if (showFbd) fbdArrows(ctx, k, cx0, cy0, [[mg, -90, ['F', 'g'], mg], [r.N, 90 + P.angle, ['F', 'N'], r.N], [A0.f, P.angle, ['f', A0.kin ? 'k' : 's'], A0.f]], fsc);
        desc = 'A ' + fm(P.m1, 1) + ' kg block on a ' + fm(P.angle, 1) + '° ramp with μs = ' + fm(P.mus, 2) + ' and μk = ' + fm(P.muk, 2) + (S.sliding ? ', sliding down.' : ', at rest.');
        read = S.sliding ? 'tan θ = ' + fm(M.tan(th), 3) + ' is more than μₛ, so the block slides: a = g(sin θ − μₖ cos θ) = <b>' + un(A0.a, 'm/s²', 3) + '</b>.' : 'At rest: static friction is exactly what is needed, f<sub>s</sub> = mg sin θ = <b>' + un(r.down, 'N', 3) + '</b>, less than its limit μₛN = ' + un(r.fsMax, 'N', 3) + '. It slips when tan θ passes μₛ (θ = ' + fm(M.atan(P.mus) / DEG, 1) + '°).';
        st = [['normal N', un(r.N, 'N', 3)], ['friction', un(A0.f, 'N', 3)], ['μₛN (max static)', un(r.fsMax, 'N', 3)], ['acceleration', un(A0.a, 'm/s²', 3)]];
      } else if (sc === 'elevator') {
        var a = elevA(S.t), N = P.m1 * (g + a), shaftX = W0 * (showGraph ? 0.25 : 0.5), carH = M.min(150, H0 * 0.62), cy1 = H0 * 0.5 - clamp(S.s, -6, 6) * 6;
        line(ctx, shaftX - 70, 0, shaftX - 70, H0, k.grid, 2); line(ctx, shaftX + 70, 0, shaftX + 70, H0, k.grid, 2); line(ctx, shaftX, 0, shaftX, cy1 - carH / 2, k.metal, 2);
        ctx.save(); rrect(ctx, shaftX - 60, cy1 - carH / 2, 120, carH, 6); ctx.fillStyle = k.obj; ctx.fill(); ctx.strokeStyle = k.objLine; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        var fy = cy1 + carH / 2 - 8; block(ctx, shaftX - 26, fy - 8, 52, 8, { fill: k.obj2, color: k.obj2Line, r: 2 }); txt(ctx, vals ? un(N / g, 'kg', 3) : '?', shaftX, fy - 4, { align: 'center', size: 9.5, weight: 700, color: k.obj2Line });
        var ph = carH * 0.62; ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 3; ctx.lineCap = 'round'; circ(ctx, shaftX, fy - 8 - ph + 9, 8, { fill: k.skin, color: k.ink, w: 2.5 }); ctx.beginPath(); ctx.moveTo(shaftX, fy - 8 - ph + 17); ctx.lineTo(shaftX, fy - 8 - ph * 0.4); ctx.moveTo(shaftX - 12, fy - 8); ctx.lineTo(shaftX, fy - 8 - ph * 0.4); ctx.lineTo(shaftX + 12, fy - 8); ctx.moveTo(shaftX - 14, fy - 8 - ph * 0.62); ctx.lineTo(shaftX + 14, fy - 8 - ph * 0.62); ctx.stroke(); ctx.restore();
        if (showFbd) fbdArrows(ctx, k, shaftX + 40, cy1, [[P.m1 * g, -90, ['F', 'g'], P.m1 * g], [N, 90, ['F', 'N'], N]], 50 / (P.m1 * g));
        if (M.abs(a) > 1e-9) arrow(ctx, shaftX - 86, cy1, shaftX - 86, cy1 - M.sign(a) * 34, { color: k.accel, w: 3, label: 'a' }); else txt(ctx, 'a = 0', shaftX - 84, cy1, { color: k.accel, size: 12, align: 'right', weight: 700 });
        desc = 'A ' + fm(P.m1, 0) + ' kg person on a scale in an elevator accelerating at ' + un(a, 'm/s²', 2) + (vals ? '; the scale reads ' + un(N, 'N', 3) : '') + '.';
        read = 'The scale reads the normal force: N = m(g + a) = <b>' + un(N, 'N', 3) + '</b>' + (M.abs(a) < 1e-9 ? ', equal to mg because a = 0 (moving or not).' : a > 0 ? ', more than mg = ' + un(P.m1 * g, 'N', 3) + ' because the acceleration is up.' : ', less than mg = ' + un(P.m1 * g, 'N', 3) + ' because the acceleration is down.');
        st = [['elevator a', un(a, 'm/s²', 3)], ['velocity', un(S.v, 'm/s', 3)], ['scale reads', un(N, 'N', 3)], ['weight mg', un(P.m1 * g, 'N', 3)]];
      } else if (sc === 'push-two' || sc === 'train') {
        var ty2 = H0 * 0.74, ms = sc === 'train' ? [P.m1, P.m2, P.m3] : [P.m1, P.m2], ws = ms.map(function (m) { return 46 + m * 6; }), gap = sc === 'train' ? 30 : 0, tot = ws.reduce(function (s0, w) { return s0 + w; }, 0) + gap * (ms.length - 1);
        ground(ctx, 10, ty2, W0 - 20, k); var lim = (W0 - tot - 80) / 40; limit = lim; var xs = 40 + M.min(S.s, lim) * 40;
        var xa = sc === 'train' ? xs : xs + 30, pos = [];
        ms.forEach(function (m, i) { var w = ws[i], hh = 30 + m * 4; block(ctx, xa, ty2 - hh, w, hh, { label: fm(m, 1) + ' kg', size: 11 }); pos.push([xa, w, hh]); xa += w + gap; });
        if (sc === 'push-two') { hand(ctx, xs + 30, ty2 - 18, k); arrow(ctx, xs - 6, ty2 - 52, xs + 26, ty2 - 40, { color: k.force, w: 3, label: vals ? 'F = ' + un(P.F, 'N') : 'F' }); var cf = r.contact, xm = pos[1][0]; arrow(ctx, xm, ty2 - 12, xm + 34 * M.min(1, cf / M.max(1e-9, P.F)) + 6, ty2 - 12, { color: k.red, w: 2.6 }); arrow(ctx, xm, ty2 - 12, xm - 34 * M.min(1, cf / M.max(1e-9, P.F)) - 6, ty2 - 12, { color: k.red, w: 2.6 }); txt(ctx, vals ? 'contact ' + un(cf, 'N', 3) + ' each way' : 'contact force pair', xm, ty2 + 14, { align: 'center', size: 11.5, color: k.red, halo: true });
          desc = 'A ' + un(P.F, 'N') + ' push on a ' + fm(P.m1, 1) + ' kg block that pushes a ' + fm(P.m2, 1) + ' kg block.'; read = 'Both blocks share a = F/(m₁ + m₂) = <b>' + un(r.a, 'm/s²', 3) + '</b>. The front block needs only m₂a = <b>' + un(r.contact, 'N', 3) + '</b>, so the contact force is less than F; the blocks push on each other equally (third law).'; st = [['a', un(r.a, 'm/s²', 3)], ['contact force', un(r.contact, 'N', 3)], ['applied F', un(P.F, 'N', 3)]]; }
        else { var last = pos[2]; arrow(ctx, last[0] + last[1], ty2 - 16, last[0] + last[1] + 44, ty2 - 16, { color: k.force, w: 3, label: vals ? 'F = ' + un(P.F, 'N') : 'F' }); [[0, r.T23], [1, r.T12]].forEach(function (q, j) { var pL = pos[q[0]], pR = pos[q[0] + 1]; line(ctx, pL[0] + pL[1], ty2 - 14, pR[0], ty2 - 14, k.metal, 2.5); txt(ctx, vals ? 'T = ' + un(q[1], 'N', 3) : 'T' + sub(j + 1), (pL[0] + pL[1] + pR[0]) / 2, ty2 - 30 - j * 0, { align: 'center', size: 11, color: k.force, halo: true }); });
          desc = 'Three carts of ' + ms.map(function (m) { return fm(m, 1); }).join(', ') + ' kg pulled from the front by ' + un(P.F, 'N') + '.'; read = 'All three share a = F/(m₁ + m₂ + m₃) = <b>' + un(r.a, 'm/s²', 3) + '</b>. Each rope pulls only the carts behind it, so the rope nearest the back has the least tension.'; st = [['a', un(r.a, 'm/s²', 3)], ['rope 1 (back)', un(r.T23, 'N', 3)], ['rope 2', un(r.T12, 'N', 3)]]; }
        void sclF;
      } else {
        // pulley scenes: atwood, heavy-pulley, table, movable-pulley
        var pr = 26, px, py = 40, ls = H0 * 0.42; limit = M.max(0.4, (H0 - 120) / 80); var sp = S.s * 80;
        hatch(ctx, 0, 0, W0, 10, k.ground); line(ctx, 0, 10, W0, 10, k.ground, 2);
        if (sc === 'table') {
          var tx0 = 20, tx1 = W0 * 0.62, tyy = H0 * 0.42; px = tx1 + 6; py = tyy - 14; limit = M.max(0.5, M.min((tx1 - tx0 - 80) / 80, (H0 - tyy - 70) / 80));
          rrect(ctx, tx0, tyy, tx1 - tx0, 12, 3); ctx.fillStyle = k.obj2; ctx.fill(); line(ctx, tx0 + 10, tyy + 12, tx0 + 10, H0 - 4, k.obj2Line, 3); line(ctx, tx1 - 10, tyy + 12, tx1 - 10, H0 - 4, k.obj2Line, 3);
          var bx = tx1 - 120 + sp, by1 = tyy - 34; block(ctx, bx - 30, by1, 60, 34, { label: 'm₁ ' + fm(P.m1, 1) + ' kg', size: 11 }); circ(ctx, px, py, 14, { fill: k.bg, color: k.metal, w: 2.5 }); line(ctx, bx + 30, py - 14, px, py - 14, k.metal, 2);
          var hy = py + 50 + sp; line(ctx, px + 14, py, px + 14, hy, k.metal, 2); block(ctx, px + 14 - 22, hy, 44, 36, { label: 'm₂', size: 11 }); txt(ctx, fm(P.m2, 1) + ' kg', px + 46, hy + 18, { size: 11, color: k.muted });
          if (showFbd) { fbdArrows(ctx, k, bx, by1 + 17, [[r.T1, 0, ['F', 'T'], r.T1], [r.f, 180, ['f', r.stuck ? 's' : 'k'], r.f]], 50 / M.max(1, P.m2 * g)); fbdArrows(ctx, k, px + 14, hy + 18, [[P.m2 * g, -90, ['F', 'g'], P.m2 * g], [r.T2, 90, ['F', 'T'], r.T2]], 50 / M.max(1, P.m2 * g)); }
          desc = 'A ' + fm(P.m1, 1) + ' kg block on a table (μk = ' + fm(P.muk, 2) + ') tied over a pulley to a hanging ' + fm(P.m2, 1) + ' kg block.';
          read = r.stuck ? 'Static friction holds the block: the hanging weight ' + un(P.m2 * g, 'N', 3) + ' is less than μₛN.' : 'a = (m₂g − μₖm₁g)/(m₁ + m₂) = <b>' + un(r.a, 'm/s²', 3) + '</b>. The tension is <b>' + un(r.T1, 'N', 3) + '</b>, less than the hanging weight ' + un(P.m2 * g, 'N', 3) + ', because the hanging block accelerates downward.';
          st = [['a', un(r.a, 'm/s²', 3)], ['tension T', un(r.T1, 'N', 3)], ['friction', un(r.f, 'N', 3)], ['m₂g', un(P.m2 * g, 'N', 3)]];
        } else if (sc === 'movable-pulley') {
          var fxp = W0 * 0.62, mxp = W0 * 0.36, a1 = r.a1; px = fxp; limit = 1.0;
          var d1 = clamp(-S.s * 80, -60, 60) , y1 = H0 * 0.48 + d1, y2 = H0 * 0.5 - 2 * d1;
          circ(ctx, fxp, 44, 16, { fill: k.bg, color: k.metal, w: 2.5 }); line(ctx, fxp, 10, fxp, 28, k.metal, 2);
          circ(ctx, mxp, y1 - 30, 16, { fill: k.bg, color: k.metal, w: 2.5 }); line(ctx, mxp - 16, y1 - 30, mxp - 16, 10, k.metal, 2); line(ctx, mxp + 16, y1 - 30, fxp - 16, 44, k.metal, 2); line(ctx, fxp + 16, 44, fxp + 16, y2, k.metal, 2);
          line(ctx, mxp, y1 - 14, mxp, y1, k.metal, 2); block(ctx, mxp - 26, y1, 52, 40, { label: 'm₁ ' + fm(P.m1, 1) + ' kg', size: 10.5 }); block(ctx, fxp + 16 - 20, y2, 40, 34, { label: 'm₂', size: 11 }); txt(ctx, fm(P.m2, 1) + ' kg', fxp + 40, y2 + 17, { size: 11, color: k.muted });
          if (showFbd) { fbdArrows(ctx, k, mxp, y1 - 30, [[2 * r.T, 90, ['2F', 'T'], 2 * r.T]], 40 / M.max(1, P.m1 * g)); }
          desc = 'A ' + fm(P.m1, 1) + ' kg block hangs from a movable pulley; the rope runs over a fixed pulley to a hanging ' + fm(P.m2, 1) + ' kg block.';
          read = 'When m₁ rises 1 cm, m₂ falls 2 cm, so a₂ = −2a₁. Solving: a₁ = (2m₂ − m₁)g/(m₁ + 4m₂) = <b>' + un(a1, 'm/s²', 3) + '</b> (up), a₂ = <b>' + un(r.a2, 'm/s²', 3) + '</b>, T = <b>' + un(r.T, 'N', 3) + '</b>.';
          st = [['a₁ (block 1, up +)', un(a1, 'm/s²', 3)], ['a₂ (block 2, up +)', un(r.a2, 'm/s²', 3)], ['tension T', un(r.T, 'N', 3)]];
        } else {
          px = W0 / 2; var R0 = sc === 'heavy-pulley' ? 30 + P.pulleyM * 2.5 : 32; py = 30 + R0; line(ctx, px, 10, px, py, k.metal, 2.5);
          ctx.save(); ctx.translate(px, py); ctx.rotate(S.s * 80 / R0); circ(ctx, 0, 0, R0, { fill: sc === 'heavy-pulley' ? k.obj2 : k.bg, color: k.metal, w: 2.5 }); line(ctx, -R0 * 0.8, 0, R0 * 0.8, 0, k.metal, 1.5); line(ctx, 0, -R0 * 0.8, 0, R0 * 0.8, k.metal, 1.5); ctx.restore(); circ(ctx, px, py, 3, { fill: k.ink });
          var base = py + ls * 0.55, y1a = base - sp, y2a = base + sp; limit = M.max(0.3, (H0 - base - 50) / 80);
          line(ctx, px - R0, py, px - R0, y1a, k.metal, 2); line(ctx, px + R0, py, px + R0, y2a, k.metal, 2);
          var h1 = 26 + P.m1 * 3, h2 = 26 + P.m2 * 3; block(ctx, px - R0 - 20, y1a, 40, h1, { label: 'm₁', size: 11.5 }); block(ctx, px + R0 - 20, y2a, 40, h2, { label: 'm₂', size: 11.5 }); txt(ctx, fm(P.m1, 1) + ' kg', px - R0 - 26, y1a + h1 / 2, { align: 'right', size: 11, color: k.muted }); txt(ctx, fm(P.m2, 1) + ' kg', px + R0 + 26, y2a + h2 / 2, { size: 11, color: k.muted });
          var fs2 = 46 / M.max(1, M.max(P.m1, P.m2) * g);
          if (showFbd) { fbdArrows(ctx, k, px - R0 - M.min(110, W0 * 0.2), y1a + h1 / 2, [[P.m1 * g, -90, ['F', 'g'], P.m1 * g], [r.T1, 90, ['F', 'T1'], r.T1]], fs2); fbdArrows(ctx, k, px + R0 + M.min(110, W0 * 0.2), y2a + h2 / 2, [[P.m2 * g, -90, ['F', 'g'], P.m2 * g], [r.T2, 90, ['F', 'T2'], r.T2]], fs2); }
          desc = 'An Atwood machine with ' + fm(P.m1, 1) + ' kg and ' + fm(P.m2, 1) + ' kg' + (sc === 'heavy-pulley' ? ' on a ' + fm(P.pulleyM, 1) + ' kg pulley (a uniform disk).' : ' on a light pulley.');
          read = 'a = (m₂ − m₁)g/(m₁ + m₂' + (sc === 'heavy-pulley' ? ' + M/2' : '') + ') = <b>' + un(r.a, 'm/s²', 3) + '</b>. ' + (sc === 'heavy-pulley' ? 'The two tensions differ (T₁ = <b>' + un(r.T1, 'N', 3) + '</b>, T₂ = <b>' + un(r.T2, 'N', 3) + '</b>): their difference turns the pulley.' : 'The tension, <b>' + un(r.T1, 'N', 3) + '</b>, is between the two weights (' + un(P.m1 * g, 'N', 3) + ' and ' + un(P.m2 * g, 'N', 3) + '): not equal to either.');
          st = [['a', un(r.a, 'm/s²', 3)], ['T₁', un(r.T1, 'N', 3)], ['T₂', un(r.T2, 'N', 3)], ['m₁g / m₂g', nf(P.m1 * g, 3) + ' / ' + nf(P.m2 * g, 3) + ' N']];
        }
        F.tagAt(ctx, 'pulley', px + 24, 24);
      }
      if (showGraph) { // v–t strip
        var gr = { x: 46, y: H0 + 14, w: W0 - 60, h: c.h - H0 - 34 }, tm = M.max(5, M.ceil(S.t / 5) * 5), vm = 2; S.hist.forEach(function (q) { vm = M.max(vm, M.abs(q[1])); }); vm = niceStep(vm * 1.2, 1) * M.ceil(vm * 1.2 / niceStep(vm * 1.2, 1));
        var G = GP(ctx, gr, { xmin: 0, xmax: tm, ymin: sc === 'elevator' ? -vm : M.min(0, -vm * 0.2), ymax: vm, xlab: 't (s)', ylab: 'v (m/s)', compact: true }).frame(); G.line(S.hist, k.vel, 2.4);
      }
      F.tagAt(ctx, 'm1', 26, 26);
      F.desc(desc + (F.quiet ? '' : ' ' + read.replace(/<[^>]+>/g, '')));
      F.read(read); F.stats(st);
    };
    F.now();
    return {};
  });

  // ===================================================================================================
  // ph-circular
  /* PM.banked(v, r, theta, g): normal force and the friction needed (per kg of car) on a banked curve; friction > 0 points
     down the slope (needed above the design speed). PM.loopN(vb, r, phi, g): normal force per kg inside a vertical loop at
     angle phi from the bottom, from energy conservation with speed vb at the bottom. */
  PM.banked = function (v, r, th, g) { g = g || 9.8; var a = th * DEG; return { N: g * M.cos(a) + v * v / r * M.sin(a), f: v * v / r * M.cos(a) - g * M.sin(a), vDesign: M.sqrt(r * g * M.tan(a)) }; };
  PM.loopN = function (vb, r, phi, g) { g = g || 9.8; var v2 = vb * vb - 2 * g * r * (1 - M.cos(phi)); return { v2: v2, N: v2 / r + g * M.cos(phi) }; };
  R('ph-circular', function (el, o) {
    var mode = pick(o.mode, ['uniform', 'cut', 'flat-curve', 'banked', 'vertical', 'nonuniform'], 'uniform');
    var F = frame(el, o, { uniform: 'An object moving in a circle at steady speed', cut: 'A ball on a string: cut the string', 'flat-curve': 'A car on a flat curve', banked: 'A car on a banked curve', vertical: 'Forces at the top and bottom of a vertical loop', nonuniform: 'Circular motion with changing speed' }[mode]);
    var g = num(o.g, 9.8), P = { r: num(o.r, mode === 'flat-curve' || mode === 'banked' ? 50 : mode === 'vertical' ? 10 : 2), v: num(o.v, mode === 'flat-curve' || mode === 'banked' ? 15 : mode === 'vertical' ? 14 : 4), m: num(o.m, mode === 'flat-curve' || mode === 'banked' ? 1000 : mode === 'vertical' ? 60 : 0.5), bank: num(o.bank, 20), mu: num(o.mu, 0.6), dvdt: num(o.dvdt, 1) };
    var sh = { v: F.on('v', true), a: F.on('a', true, true), forces: F.on('forces', mode !== 'uniform' && mode !== 'cut' && mode !== 'nonuniform'), comp: F.on('components', mode === 'banked'), path: F.on('path', true) };
    var at = o.at === 'top' ? PI : o.at === 'bottom' || o.at == null ? 0 : num(o.at, 0) * DEG;
    var V0 = P.v, AC0 = P.v * P.v / P.r, S = { th: mode === 'vertical' ? at : PI / 2, cut: false, cx: 0, cy: 0, cvx: 0, cvy: 0, v: P.v, skid: false };
    var c = F.canvas({ aspect: mode === 'flat-curve' || mode === 'banked' ? 1.75 : 1.5, narrow: 1.1 });
    var A = F.anim({ tmax: undefined, scrub: false, autoplay: mode !== 'vertical' && mode !== 'banked', tick: function (h) { return step(h); }, reset: function () { S.th = mode === 'vertical' ? at : PI / 2; S.cut = false; S.v = P.v; S.skid = false; }, dt: 0.05 });
    function step(h) {
      if (mode === 'vertical') { var L = PM.loopN(P.v, P.r, S.th, g); if (L.v2 <= 0 || L.N < 0) return false; S.th += M.sqrt(L.v2) / P.r * h; if (S.th > TAU) S.th -= TAU; return true; }
      if (S.cut) { S.cx += S.cvx * h; S.cy += S.cvy * h; return M.hypot(S.cx, S.cy) < P.r * 3; }
      if (mode === 'nonuniform') { S.v += P.dvdt * h; if (S.v > P.v * 2.5) S.v = P.v * 0.5; }
      if (mode === 'flat-curve' && P.v > M.sqrt(P.mu * g * P.r) + 1e-9 && !S.skid && S.th > PI * 0.9) { S.skid = true; cutNow(); }
      S.th += (mode === 'nonuniform' ? S.v : P.v) / P.r * h * (mode === 'flat-curve' ? 1 : 1); return true;
    }
    function cutNow() { var v = mode === 'nonuniform' ? S.v : P.v; S.cut = true; S.cx = P.r * M.cos(S.th); S.cy = P.r * M.sin(S.th); S.cvx = -v * M.sin(S.th); S.cvy = v * M.cos(S.th); }
    if (F.live) {
      var row = F.row();
      if (mode === 'cut' || mode === 'flat-curve') { if (mode === 'cut') F.button(row, '✂ Cut the string', function () { if (!S.cut) { cutNow(); if (!A.playing) A.play(); } }, 'pri'); }
      if (mode === 'vertical') F.slider(row, { label: 'Speed at the bottom', min: 2, max: 25, step: 0.5, value: P.v, unit: 'm/s', d: 1, input: function (v) { P.v = v; } });
      else F.slider(row, { label: 'Speed v', min: 0.5, max: mode === 'flat-curve' || mode === 'banked' ? 40 : 10, step: 0.5, value: P.v, unit: 'm/s', d: 1, input: function (v) { P.v = v; S.v = v; if (S.skid) { S.skid = false; S.cut = false; } } });
      if (mode === 'banked') F.slider(row, { label: 'Bank angle', min: 0, max: 45, step: 1, value: P.bank, unit: '°', d: 0, input: function (v) { P.bank = v; } });
      if (mode === 'flat-curve') F.slider(row, { label: 'Friction coefficient μₛ', min: 0.05, max: 1, step: 0.05, value: P.mu, d: 2, input: function (v) { P.mu = v; } });
      if (mode === 'uniform' || mode === 'cut' || mode === 'nonuniform') F.slider(row, { label: 'Radius r', min: 0.5, max: 4, step: 0.1, value: P.r, unit: 'm', d: 1, input: function (v) { P.r = v; } });
    }
    function topView(ctx, k, cx0, cy0, R0, car) {
      if (sh.path) circ(ctx, cx0, cy0, R0, { color: k.grid, w: car ? 18 : 1.5, dash: car ? null : [5, 5] }); if (car) circ(ctx, cx0, cy0, R0, { color: k.muted, w: 1, dash: [8, 8] });
      circ(ctx, cx0, cy0, 3.5, { fill: k.ink }); var v = mode === 'nonuniform' ? S.v : P.v, ps = R0 / P.r;
      var ox, oy, vx, vy;
      if (S.cut) { ox = cx0 + S.cx * ps; oy = cy0 - S.cy * ps; vx = S.cvx; vy = S.cvy; var x1 = S.cx - S.cvx * 10, y1 = S.cy - S.cvy * 10; line(ctx, cx0 + x1 * ps, cy0 - y1 * ps, ox, oy, rgba(k.vel, 0.5), 1.6, [6, 5]); }
      else { ox = cx0 + R0 * M.cos(S.th); oy = cy0 - R0 * M.sin(S.th); vx = -v * M.sin(S.th); vy = v * M.cos(S.th); if (mode === 'uniform' || mode === 'cut' || mode === 'nonuniform') line(ctx, cx0, cy0, ox, oy, k.metal, 1.6); }
      if (car) { ctx.save(); ctx.translate(ox, oy); ctx.rotate(-M.atan2(vy, vx)); rrect(ctx, -12, -7, 24, 14, 4); ctx.fillStyle = k.obj; ctx.fill(); ctx.strokeStyle = k.objLine; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); } else ball(ctx, ox, oy, 9, k.acc);
      F.tagAt(ctx, 'obj', ox + 16, oy - 16);
      var vs = (car ? 46 : 64) / M.max(0.5, V0), vl = M.hypot(vx, vy);
      if (sh.v && vl > 1e-6) { arrow(ctx, ox, oy, ox + vx * vs, oy - vy * vs, { color: k.vel, w: 3, label: 'v' }); F.tagAt(ctx, 'v', ox + vx * vs * 0.6 + 14, oy - vy * vs * 0.6 - 14); }
      if (sh.a && !S.cut) { var ac = v * v / P.r, as = (car ? 40 : 54) / M.max(1e-6, AC0), ux = -M.cos(S.th), uy = M.sin(S.th);
        if (mode === 'nonuniform') { var at2 = P.dvdt, ts = as * 3; arrow(ctx, ox, oy, ox + ux * ac * as, oy + uy * ac * as, { color: k.accel, w: 2, dash: [5, 3], label: 'a꜀' }); arrow(ctx, ox, oy, ox - M.sin(S.th) * at2 * ts, oy - M.cos(S.th) * at2 * ts, { color: k.accel, w: 2, dash: [5, 3], label: 'aₜ' }); arrow(ctx, ox, oy, ox + ux * ac * as - M.sin(S.th) * at2 * ts, oy + uy * ac * as - M.cos(S.th) * at2 * ts, { color: k.accel, w: 3.2, label: 'a' }); F.tagAt(ctx, 'ac', ox + ux * ac * as * 0.5 + 12, oy + uy * ac * as * 0.5 + 12); F.tagAt(ctx, 'at', ox - M.sin(S.th) * at2 * ts * 0.5 - 12, oy - M.cos(S.th) * at2 * ts * 0.5 + 12); }
        else arrow(ctx, ox, oy, ox + ux * ac * as, oy + uy * ac * as, { color: k.accel, w: 3, label: 'a' }); F.tagAt(ctx, 'a', ox + ux * ac * as * 0.6 + 14, oy + uy * ac * as * 0.6 + 14); }
    }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, v = mode === 'nonuniform' ? S.v : P.v, ac = v * v / P.r; bg(c);
      var desc = '', read = '', st = [];
      if (mode === 'uniform' || mode === 'cut' || mode === 'nonuniform') {
        var R0 = M.min(W0, H0) * 0.38; topView(ctx, k, W0 / 2, H0 / 2, R0, false); txt(ctx, 'top view', 10, 14, { size: 11, color: k.muted });
        desc = 'Top view: a ' + fm(P.m, 2) + ' kg ball on a string moving in a circle of radius ' + un(P.r, 'm') + ' at ' + un(v, 'm/s', 2) + (S.cut ? '; the string is cut and the ball moves off in a straight line along the tangent.' : '.');
        read = S.cut ? 'With the string cut, nothing pulls the ball sideways: it keeps the velocity it had and goes straight along the tangent, not outward.' : mode === 'nonuniform' ? 'Speeding up: a<sub>t</sub> = dv/dt = <b>' + un(P.dvdt, 'm/s²', 3) + '</b> along the path; a<sub>c</sub> = v²/r = <b>' + un(ac, 'm/s²', 3) + '</b> toward the center; together a = <b>' + un(M.hypot(ac, P.dvdt), 'm/s²', 3) + '</b>.' : 'Steady speed, changing direction: a = v²/r = <b>' + un(ac, 'm/s²', 3) + '</b> toward the center. The string pulls inward with F = mv²/r = <b>' + un(P.m * ac, 'N', 3) + '</b>; nothing pushes outward.';
        st = [['speed', un(v, 'm/s', 3)], ['a꜀ = v²/r', un(ac, 'm/s²', 3)], ['inward force', un(P.m * ac, 'N', 3)], ['period', un(TAU * P.r / v, 's', 3)]];
      } else if (mode === 'flat-curve' || mode === 'banked') {
        var split = W0 > 520, tw0 = split ? W0 * 0.45 : W0, R1 = M.min(tw0, H0 * (split ? 1 : 0.5)) * 0.36;
        topView(ctx, k, tw0 / 2, split ? H0 / 2 : H0 * 0.27, R1, true); txt(ctx, 'top view', 10, 14, { size: 11, color: k.muted });
        var rx = split ? tw0 : 0, ry = split ? 0 : H0 * 0.52, rw = split ? W0 - tw0 : W0, rh = split ? H0 : H0 * 0.48, th = mode === 'banked' ? P.bank * DEG : 0;
        txt(ctx, 'rear view (center of the curve to the left)', rx + 10, ry + 14, { size: 11, color: k.muted });
        var gx = rx + rw / 2, gy = ry + rh * 0.62, L = rw * 0.8, tt = M.tan(th) * L / 2; poly(ctx, [[gx - L / 2, gy + tt], [gx + L / 2, gy - tt], [gx + L / 2, gy + tt + 14], [gx - L / 2, gy + tt + 14]], { fill: k.obj2, color: k.obj2Line, close: true, w: 2 });
        if (th > 0) { arc(ctx, gx - L / 2, gy + tt, 36, -th, 0, k.obj2Line, 1.5); txt(ctx, fm(P.bank, 0) + '°', gx - L / 2 + 42, gy + tt - 8, { size: 11, color: k.obj2Line }); line(ctx, gx - L / 2, gy + tt, gx - L / 2 + 50, gy + tt, k.obj2Line, 1, [3, 3]); }
        var mid = [gx, gy]; ctx.save(); ctx.translate(mid[0], mid[1]); ctx.rotate(-th); rrect(ctx, -26, -30, 52, 24, 6); ctx.fillStyle = k.obj; ctx.fill(); ctx.strokeStyle = k.objLine; ctx.lineWidth = 2; ctx.stroke(); circ(ctx, -16, -5, 5, { fill: k.ink }); circ(ctx, 16, -5, 5, { fill: k.ink }); ctx.restore();
        var cxp = mid[0] - 18 * M.sin(th), cyp = mid[1] - 18 * M.cos(th);
        var N, f, need = P.m * ac, mg = P.m * g, fmax;
        if (mode === 'flat-curve') { N = mg; f = need; fmax = P.mu * N; } else { var bk = PM.banked(v, P.r, P.bank, g); N = P.m * bk.N; f = P.m * bk.f; }
        var sc0 = 60 / mg;
        if (sh.forces) {
          arrow(ctx, cxp, cyp, cxp, cyp + mg * sc0, { color: k.force, w: 2.8 }); symTxt(ctx, ['F', 'g'], cxp + 8, cyp + mg * sc0, { color: k.force, extra: F.vals ? '= ' + un(mg, 'N', 3) : '', size: 13 });
          var nx = -M.sin(th), ny = M.cos(th); arrow(ctx, cxp, cyp, cxp + nx * N * sc0, cyp - ny * N * sc0, { color: k.force, w: 2.8 }); symTxt(ctx, ['F', 'N'], cxp + nx * N * sc0 + 6, cyp - ny * N * sc0 - 6, { color: k.force, extra: F.vals ? '= ' + un(N, 'N', 3) : '', size: 13, base: 'bottom' });
          if (M.abs(f) > mg * 0.01) { var fx = -M.cos(th) * M.sign(f), fy = -M.sin(th) * M.sign(f); var fl = M.min(M.abs(f), mode === 'flat-curve' ? fmax : 1e12); var gx0 = mid[0], gy0 = mid[1] - 2; arrow(ctx, gx0, gy0, gx0 + fx * fl * sc0, gy0 - fy * fl * sc0, { color: k.red, w: 2.8 }); symTxt(ctx, ['f', 's'], gx0 + fx * fl * sc0 - 4, gy0 - fy * fl * sc0 - 10, { color: k.red, align: 'right', base: 'bottom', extra: F.vals ? '= ' + un(fl, 'N', 3) : '', size: 13 }); }
          if (sh.comp && th > 0) { line(ctx, cxp + nx * N * sc0, cyp - ny * N * sc0, cxp, cyp - ny * N * sc0, rgba(k.force, 0.6), 1.2, [3, 3]); arrow(ctx, cxp, cyp, cxp + nx * N * sc0, cyp, { color: rgba(k.force, 0.7), w: 2, dash: [5, 3] }); txt(ctx, 'N sin θ', cxp + nx * N * sc0 / 2, cyp + 12, { align: 'center', size: 11, color: k.force, halo: true }); }
          if (F.on('a', true, true)) arrow(ctx, cxp - 40, cyp - 50, cxp - 40 - 40, cyp - 50, { color: k.accel, w: 3, label: 'a (to center)' });
        }
        var vmax = mode === 'flat-curve' ? M.sqrt(P.mu * g * P.r) : null, vd = mode === 'banked' ? PM.banked(v, P.r, P.bank, g).vDesign : null;
        desc = 'A ' + fm(P.m, 0) + ' kg car rounds a ' + (mode === 'banked' ? fm(P.bank, 0) + '° banked' : 'flat') + ' curve of radius ' + un(P.r, 'm') + ' at ' + un(v, 'm/s', 2) + '.';
        read = mode === 'flat-curve' ? (S.skid ? 'Too fast: the car needs ' + un(need, 'N', 3) + ' toward the center but friction can give at most ' + un(fmax, 'N', 3) + ', so it slides off toward the outside of the curve, roughly along its tangent.' : 'Static friction from the road points <b>toward the center</b>: it supplies the whole mv²/r = <b>' + un(need, 'N', 3) + '</b>. Top speed before skidding: √(μgr) = <b>' + un(vmax, 'm/s', 3) + '</b>.') : 'The normal force tilts toward the center, so N sin θ helps turn the car. At the design speed √(rg tan θ) = <b>' + un(vd, 'm/s', 3) + '</b> no friction is needed; ' + (M.abs(f) < 1 ? 'that is this speed.' : f > 0 ? 'faster than that, friction must point down the slope (<b>' + un(f, 'N', 3) + '</b>).' : 'slower than that, friction must point up the slope (<b>' + un(-f, 'N', 3) + '</b>).');
        st = mode === 'flat-curve' ? [['needed mv²/r', un(need, 'N', 3)], ['max friction μN', un(fmax, 'N', 3)], ['top speed', un(vmax, 'm/s', 3)]] : [['normal N', un(N, 'N', 3)], ['friction needed', un(f, 'N', 3)], ['design speed', un(vd, 'm/s', 3)]];
        if (mode === 'flat-curve' && F.live && !S.skid && v > vmax && !A.playing) { /* will skid when played */ }
      } else { // vertical loop
        var R2 = M.min(W0 * 0.3, H0 * 0.38), cx2 = W0 * (W0 > 520 ? 0.36 : 0.5), cy2 = H0 * 0.5, dip = !!o.dip;
        if (dip) { poly(ctx, Array.from({ length: 61 }, function (_, i) { var a = PI + PI * i / 60; return [cx2 + R2 * M.cos(a) * 1.2, cy2 - R2 * M.sin(a)]; }), { color: k.obj2Line, w: 3 }); }
        else { circ(ctx, cx2, cy2, R2 + 6, { color: k.obj2Line, w: 4 }); }
        circ(ctx, cx2, cy2, 3, { fill: k.ink });
        var phi = S.th, L2 = PM.loopN(P.v, P.r, phi, g), ox2 = cx2 + R2 * M.sin(phi), oy2 = cy2 + R2 * M.cos(phi), vv = M.sqrt(M.max(0, L2.v2)), Nn = P.m * L2.N;
        ball(ctx, ox2, oy2, 10, k.acc); F.tagAt(ctx, 'obj', ox2 + 18, oy2 - 18);
        var fsc = 44 / (P.m * g), ux2 = (cx2 - ox2) / R2, uy2 = (cy2 - oy2) / R2;
        if (sh.forces) { arrow(ctx, ox2, oy2, ox2, oy2 + P.m * g * fsc, { color: k.force, w: 2.8 }); symTxt(ctx, ['F', 'g'], ox2 + 8, oy2 + P.m * g * fsc + 4, { color: k.force, extra: F.vals ? '= ' + un(P.m * g, 'N', 3) : '', size: 13 }); F.tagAt(ctx, 'f0', ox2 - 16, oy2 + P.m * g * fsc * 0.6);
          if (Nn > 0) { arrow(ctx, ox2, oy2, ox2 + ux2 * Nn * fsc, oy2 + uy2 * Nn * fsc, { color: k.force, w: 2.8 }); symTxt(ctx, ['F', 'N'], ox2 + ux2 * Nn * fsc + 8, oy2 + uy2 * Nn * fsc, { color: k.force, extra: F.vals ? '= ' + un(Nn, 'N', 3) : '', size: 13 }); F.tagAt(ctx, 'f1', ox2 + ux2 * Nn * fsc * 0.6 + 16, oy2 + uy2 * Nn * fsc * 0.6); } }
        if (sh.v && vv > 0) { var vs2 = 40 / M.max(1, P.v); arrow(ctx, ox2, oy2, ox2 + M.cos(phi) * vv * vs2, oy2 - M.sin(phi) * vv * vs2, { color: k.vel, w: 2.6, label: 'v' }); F.tagAt(ctx, 'v', ox2 + M.cos(phi) * vv * vs2 * 0.6, oy2 - M.sin(phi) * vv * vs2 * 0.6 - 16); }
        if (sh.a) { var acn = L2.v2 / P.r; if (acn > 0) arrow(ctx, ox2 - 14 * uy2, oy2 + 14 * ux2, ox2 - 14 * uy2 + ux2 * acn * fsc * P.m, oy2 + 14 * ux2 + uy2 * acn * fsc * P.m, { color: k.accel, w: 2, dash: [5, 3], label: 'a' }); }
        var where = M.abs(phi) < 0.05 || M.abs(phi - TAU) < 0.05 ? 'bottom' : M.abs(phi - PI) < 0.05 ? 'top' : fm(phi / DEG, 0) + '° around from the bottom';
        desc = 'A ' + fm(P.m, 0) + ' kg rider ' + (dip ? 'in a dip' : 'inside a vertical loop') + ' of radius ' + un(P.r, 'm') + ', at the ' + where + '.';
        read = (L2.v2 <= 0 || L2.N < 0) ? 'Too slow: the track stops pushing (N would be negative) and the rider leaves the track. At the top, v must be at least √(gr) = ' + un(M.sqrt(g * P.r), 'm/s', 3) + '.' : (where === 'bottom' ? 'At the bottom: N − mg = mv²/r, so N = <b>' + un(Nn, 'N', 3) + '</b>, more than mg = ' + un(P.m * g, 'N', 3) + '. You feel heavier.' : where === 'top' ? 'At the top: N + mg = mv²/r, so N = <b>' + un(Nn, 'N', 3) + '</b>; gravity and the track both point down, toward the center.' : 'N = m(v²/r + g cos φ) = <b>' + un(Nn, 'N', 3) + '</b>; speed <b>' + un(vv, 'm/s', 3) + '</b> (energy conservation).');
        st = [['speed', un(vv, 'm/s', 3)], ['normal force', un(Nn, 'N', 3)], ['weight mg', un(P.m * g, 'N', 3)], ['v²/r', un(L2.v2 / P.r, 'm/s²', 3)]];
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now();
    return {};
  });

  // ===================================================================================================
  // shared: energy bar charts
  var EB = { K: ['K', 'eK', 'kinetic'], Ug: ['U', 'eUg', 'gravitational'], Us: ['U', 'eUs', 'spring'], Eth: ['E', 'eTh', 'thermal'], W: ['W', 'eW', 'work'] };
  function ebSym(key) { return key === 'K' ? ['K', ''] : key === 'Ug' ? ['U', 'g'] : key === 'Us' ? ['U', 's'] : key === 'Eth' ? ['E', 'th'] : ['W', '']; }
  /* energyBars(ctx, r, items, o): vertical bars in rect r. items: [{key, v (number or '?'), label}]; o = {max, unit, vals, total, F}.
     Negative values hang below the zero line; '?' draws a dashed empty bar. Returns the bar centers by key. */
  function energyBars(ctx, r, items, o) {
    var k = K(), n = items.length, mx = o.max || 1, gap = M.min(14, r.w / n * 0.25), bw = M.min(46, (r.w - gap * (n + 1)) / n), hasNeg = items.some(function (it) { return isNum(it.v) && it.v < -1e-9; }) || o.neg;
    var zeroY = hasNeg ? r.y + r.h * 0.62 : r.y + r.h, sc = (zeroY - r.y - 16) / mx, out = {};
    ctx.save(); ctx.fillStyle = k.panelBg; rrect(ctx, r.x, r.y, r.w, r.h + 28, 8); ctx.fill(); ctx.restore();
    if (o.grid !== false) { var st = niceStep(mx, 4); for (var g = st; g <= mx * 1.05; g += st) { line(ctx, r.x + 4, zeroY - g * sc, r.x + r.w - 4, zeroY - g * sc, k.grid, 1); if (hasNeg && zeroY + g * sc < r.y + r.h) line(ctx, r.x + 4, zeroY + g * sc, r.x + r.w - 4, zeroY + g * sc, k.grid, 1); } }
    line(ctx, r.x + 2, zeroY, r.x + r.w - 2, zeroY, k.axis, 1.5);
    var tw0 = n * bw + (n - 1) * gap, x = r.x + (r.w - tw0) / 2, vlab = [];
    items.forEach(function (it) {
      var col = k[EB[it.key] ? EB[it.key][1] : 'eW'] || k.muted, cx0 = x + bw / 2; out[it.key] = cx0;
      if (it.v === '?' || it.v == null) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]); rrect(ctx, x, zeroY - mx * sc * 0.5, bw, mx * sc * 0.5, 3); ctx.stroke(); ctx.restore(); txt(ctx, '?', cx0, zeroY - mx * sc * 0.25, { align: 'center', size: 18, weight: 800, color: col }); }
      else {
        var h = it.v * sc; ctx.save(); rrect(ctx, x, h >= 0 ? zeroY - h : zeroY, bw, M.abs(h), 3); ctx.fillStyle = it.key === 'W' ? rgba(col, 0.25) : col; ctx.fill(); if (it.key === 'W') { ctx.clip(); hatch(ctx, x, h >= 0 ? zeroY - h : zeroY, bw, M.abs(h), col, 6); } ctx.restore();
        if (it.key === 'W') { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1.5; rrect(ctx, x, h >= 0 ? zeroY - h : zeroY, bw, M.abs(h), 3); ctx.stroke(); ctx.restore(); }
        if (o.vals) { vlab.push([cx0, h >= 0 ? zeroY - h - 8 : zeroY - h + 9]); } if (o.vals) txt(ctx, nf(it.v, 3), cx0, h >= 0 ? zeroY - h - 8 : zeroY - h + 9, { align: 'center', size: 10.5, color: k.ink, halo: true, haloColor: k.panelBg });
      }
      symTxt(ctx, it.sym || ebSym(it.key), cx0, r.y + r.h + 14, { align: 'center', size: 13, color: col, halo: false });
      if (o.F) o.F.tagAt(ctx, 'b' + it.key, cx0, zeroY - (isNum(it.v) ? M.max(0, it.v) * sc : mx * sc * 0.5) - 22);
      x += bw + gap;
    });
    if (o.total != null && isNum(o.total)) { var ty = zeroY - o.total * sc; line(ctx, r.x + 4, ty, r.x + r.w - 4, ty, k.ink, 1.3, [6, 4]); var tl = 'total' + (o.vals ? ' ' + nf(o.total, 3) : ''); ctx.save(); ctx.font = font(10.5, 600); var tlw = ctx.measureText(tl).width; ctx.restore(); var tly = vlab.some(function (q) { return q[0] - 22 < r.x + 10 + tlw && M.abs(q[1] - (ty - 8)) < 13; }) ? ty + 9 : ty - 8; txt(ctx, tl, r.x + 6, tly, { align: 'left', size: 10.5, color: k.ink, halo: true, haloColor: k.panelBg }); }
    if (o.unit) txt(ctx, o.unit, r.x + 6, r.y + 9, { size: 10.5, color: k.muted });
    return out;
  }
  /* PM.track(pts, smooth): a track through the points (Catmull–Rom when smooth), resampled by arc length.
     Returns {L, at(s) -> {x, y, tx, ty}} where (tx, ty) is the unit tangent. */
  PM.track = function (pts, smooth) {
    var P = [];
    if (smooth && pts.length > 2) { for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[M.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[M.min(pts.length - 1, i + 2)]; for (var j = 0; j < 24; j++) { var t = j / 24, t2 = t * t, t3 = t2 * t; P.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3), 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); } } P.push(pts[pts.length - 1]); }
    else P = pts.slice();
    var S = [0]; for (i = 1; i < P.length; i++) S.push(S[i - 1] + M.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    var L = S[S.length - 1];
    function at(s) { s = clamp(s, 0, L); var lo = 0, hi = S.length - 1; while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (S[mid] <= s) lo = mid; else hi = mid; } var d = S[hi] - S[lo] || 1, f = (s - S[lo]) / d, a = P[lo], b = P[hi]; return { x: lerp(a[0], b[0], f), y: lerp(a[1], b[1], f), tx: (b[0] - a[0]) / d, ty: (b[1] - a[1]) / d }; }
    return { L: L, at: at, P: P };
  };

  // ===================================================================================================
  // ph-energy
  R('ph-energy', function (el, o) {
    var mode = pick(o.mode, ['scene', 'bars', 'ucurve', 'chart'], 'scene');
    if (mode === 'chart') return energyChart(el, o);
    if (mode === 'ucurve') return uCurve(el, o);
    var scene = pick(o.scene, ['track', 'ramp', 'pendulum', 'spring', 'slide', 'drop'], 'track');
    var F = frame(el, o, { track: 'A cart on a track with energy bars', ramp: 'A block sliding down a ramp with energy bars', pendulum: 'A pendulum with energy bars', spring: 'A spring launcher with energy bars', slide: 'A box sliding to a stop with energy bars', drop: 'A dropped ball with energy bars' }[scene]);
    var g = num(o.g, 9.8), P = { m: num(o.m, scene === 'pendulum' ? 1 : 2), h0: num(o.h0, scene === 'drop' ? 5 : 4), v0: num(o.v0, scene === 'slide' ? 6 : 0), k: num(o.k, 400), mu: num(o.mu, scene === 'slide' ? 0.3 : 0), x0: num(o.x0, 0.4), L: num(o.L, 2), th0: num(o.theta0, 40) };
    var sys = arr(o.system || ['object', 'earth', 'spring']), ref = num(o.ref, 0), showBars = F.on('bars', true);
    var bars = arr(o.bars || (scene === 'spring' ? ['K', 'Ug', 'Us', 'Eth'] : scene === 'slide' ? ['K', 'Eth'] : scene === 'pendulum' ? ['K', 'Ug'] : ['K', 'Ug', 'Eth']));
    var tr = null, sp0 = 0;
    function buildTrack() {
      if (Array.isArray(o.track) && o.track.length > 1) tr = PM.track(o.track.map(function (q) { return [num(q[0], 0), num(q[1], 0)]; }), o.smooth !== false);
      else if (scene === 'track') tr = PM.track([[0, P.h0], [2, P.h0 * 0.55], [4, 0.3], [6, P.h0 * 0.6], [8, P.h0 * 0.3], [10, 0.6], [12, P.h0 * 0.9]], true);
      else if (scene === 'ramp') tr = PM.track([[0, P.h0], [P.h0 * 1.6, 0], [P.h0 * 1.6 + 6, 0]], false);
      else if (scene === 'spring') { sp0 = 1.2; tr = PM.track([[0, 0], [5, 0], [5 + 3, P.h0 * 0.8], [5 + 4.2, P.h0 * 0.8 + 0.6]], true); }
      else if (scene === 'slide') tr = PM.track([[0, 0], [12, 0]], false);
    }
    buildTrack();
    var S;
    function reset() {
      S = { t: 0, s: scene === 'spring' ? sp0 - P.x0 : 0.001, v: P.v0, th: P.th0 * DEG, w: 0, y: P.h0, vy: 0, Eth: 0, landed: false, stopped: false };
      S.E0 = energies().tot;
    }
    function Us() { return scene === 'spring' && S.s < sp0 ? 0.5 * P.k * (sp0 - S.s) * (sp0 - S.s) : 0; }
    function pos() { if (scene === 'pendulum') return { x: P.L * M.sin(S.th), y: P.L * (1 - M.cos(S.th)) }; if (scene === 'drop') return { x: 0, y: S.y }; var q = tr.at(S.s); return { x: q.x, y: q.y }; }
    function energies() {
      var p = pos(), v2 = scene === 'pendulum' ? M.pow(S.w * P.L, 2) : scene === 'drop' ? S.vy * S.vy : S.v * S.v;
      var e = { K: 0.5 * P.m * v2, Ug: P.m * g * (p.y - ref), Us: Us(), Eth: S.Eth };
      e.tot = e.K + e.Ug + e.Us + e.Eth; return e;
    }
    function step(h) {
      var n = M.max(1, M.ceil(h / 0.002)), dt = h / n;
      for (var i = 0; i < n; i++) {
        if (scene === 'pendulum') { var f = function (t, y) { return [y[1], -g / P.L * M.sin(y[0])]; }, y = rk4(f, 0, [S.th, S.w], dt); S.th = y[0]; S.w = y[1]; }
        else if (scene === 'drop') { if (S.landed) return false; S.vy -= g * dt; S.y += S.vy * dt; if (S.y <= 0) { S.Eth += 0.5 * P.m * S.vy * S.vy + P.m * g * S.y; S.y = 0; S.vy = 0; S.landed = true; } }
        else {
          if (S.stopped) return false;
          var q = tr.at(S.s), a = -g * q.ty; if (scene === 'spring' && S.s < sp0) a += P.k * (sp0 - S.s) / P.m;
          var fr = P.mu * g * M.abs(q.tx);
          if (M.abs(S.v) < 1e-4) { if (M.abs(a) <= fr) { S.v = 0; if (P.mu > 0) { S.stopped = true; return false; } } }
          var vOld = S.v; S.v += (a - fr * (S.v !== 0 ? M.sign(S.v) : M.sign(a))) * dt;
          if (P.mu > 0 && vOld !== 0 && S.v * vOld < 0) S.v = 0;
          var sOld = S.s; S.s += S.v * dt;
          if (S.s < 0) { S.s = 0; S.v = M.abs(S.v) * 0; }
          if (S.s > tr.L) { S.s = tr.L; S.v = 0; }
          S.Eth += P.mu * P.m * g * M.abs(tr.at(S.s).x - tr.at(sOld).x);
          // keep the total exact: set the speed from the energy left over
          var e = energies(), Kw = S.E0 - e.Ug - e.Us - e.Eth; if (Kw > 0 && M.abs(S.v) > 0.05) S.v = M.sign(S.v) * M.sqrt(2 * Kw / P.m);
        }
        S.t += dt;
      }
      return true;
    }
    reset();
    var c = F.canvas({ aspect: showBars ? 1.55 : 1.8, narrow: showBars ? 0.85 : 1.2 });
    var A = F.anim({ tmax: undefined, scrub: false, autoplay: true, tick: step, reset: reset, dt: 0.05 });
    if (!F.live && num(o.t, 0) > 0) step(num(o.t, 0));
    if (F.live) {
      var row = F.row();
      F.slider(row, { label: 'Mass m', min: 0.5, max: 10, step: 0.5, value: P.m, unit: 'kg', d: 1, input: function (v) { P.m = v; A.pause(); reset(); } });
      if (scene !== 'pendulum' && scene !== 'slide') F.slider(row, { label: scene === 'spring' ? 'Compression x' : 'Starting height h', min: scene === 'spring' ? 0.1 : 1, max: scene === 'spring' ? 0.8 : 8, step: scene === 'spring' ? 0.05 : 0.5, value: scene === 'spring' ? P.x0 : P.h0, unit: 'm', d: 2, input: function (v) { if (scene === 'spring') P.x0 = v; else { P.h0 = v; buildTrack(); } A.pause(); reset(); } });
      if (scene === 'pendulum') F.slider(row, { label: 'Release angle', min: 5, max: 90, step: 1, value: P.th0, unit: '°', d: 0, input: function (v) { P.th0 = v; A.pause(); reset(); } });
      if (scene !== 'pendulum' && scene !== 'drop') F.slider(row, { label: 'Friction μₖ', min: 0, max: 0.5, step: 0.01, value: P.mu, d: 2, input: function (v) { P.mu = v; A.pause(); reset(); } });
      if (mode === 'bars') { var r2 = F.row(); F.check(r2, 'Earth is in the system', sys.indexOf('earth') >= 0, function (on) { sys = sys.filter(function (q) { return q !== 'earth'; }); if (on) sys.push('earth'); }); if (scene === 'spring') F.check(r2, 'Spring is in the system', sys.indexOf('spring') >= 0, function (on) { sys = sys.filter(function (q) { return q !== 'spring'; }); if (on) sys.push('spring'); }); }
    }
    var Emax = 1;
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, e = energies(), p = pos(); bg(c);
      var wide = W0 > 560, br = showBars ? (wide ? { x: W0 - 210, y: 16, w: 196, h: H0 - 52 } : { x: 12, y: H0 * 0.6 + 4, w: W0 - 24, h: H0 * 0.4 - 38 }) : null;
      var sr = showBars ? (wide ? { x: 12, y: 12, w: W0 - 236, h: H0 - 24 } : { x: 12, y: 8, w: W0 - 24, h: H0 * 0.58 - 12 }) : { x: 12, y: 10, w: W0 - 24, h: H0 - 20 };
      var mp, X, Y;
      if (scene === 'pendulum') {
        mp = fitMap(sr, -P.L * 1.15, P.L * 1.15, -0.1 * P.L, P.L * 1.12, true); X = mp.X; Y = mp.Y;
        var px0 = X(0), py0 = Y(P.L); hatch(ctx, px0 - 40, py0 - 10, 80, 10, k.ground); line(ctx, px0 - 40, py0, px0 + 40, py0, k.ground, 2);
        arc(ctx, px0, py0, P.L * mp.sx, PI / 2 - P.th0 * DEG, PI / 2 + P.th0 * DEG, k.grid, 1.5); line(ctx, px0, py0, px0, Y(0) + 8, k.grid, 1, [3, 4]);
        line(ctx, px0, py0, X(p.x), Y(p.y), k.metal, 2); ball(ctx, X(p.x), Y(p.y), 11, k.acc);
        line(ctx, X(-P.L), Y(ref), X(P.L), Y(ref), k.muted, 1, [6, 4]); txt(ctx, 'U = 0 here', X(P.L) + 4, Y(ref) - 8, { size: 10.5, color: k.muted, align: 'right' });
      } else if (scene === 'drop') {
        mp = fitMap(sr, -2, 2, -0.3, P.h0 * 1.1 + 0.3, true); X = mp.X; Y = mp.Y; ground(ctx, X(-2), Y(0), X(2) - X(-2), k);
        for (var hh = 0; hh <= P.h0; hh += niceStep(P.h0, 5)) { line(ctx, X(-1.2), Y(hh), X(-1), Y(hh), k.axis, 1); txt(ctx, fm(hh, 1) + ' m', X(-1.25), Y(hh), { align: 'right', size: 10.5, color: k.muted }); }
        ball(ctx, X(0), Y(p.y) - 9, 9, k.acc); if (S.landed) txt(ctx, 'thump: kinetic energy → thermal energy and sound', X(0), Y(0) + 16, { align: 'center', size: 11, color: k.eTh, halo: true });
      } else {
        var xs = tr.P.map(function (q) { return q[0]; }), ys = tr.P.map(function (q) { return q[1]; }), x0 = M.min.apply(null, xs), x1 = M.max.apply(null, xs), y1 = M.max(M.max.apply(null, ys), 1) * 1.15;
        mp = fitMap(sr, x0 - (scene === 'spring' ? 0.2 : 0.3), x1 + 0.3, M.min(0, M.min.apply(null, ys)) - 0.4, y1, scene !== 'slide'); X = mp.X; Y = mp.Y;
        var pts = tr.P.map(function (q) { return [X(q[0]), Y(q[1])]; }); poly(ctx, pts.concat([[pts[pts.length - 1][0], Y(M.min(0, M.min.apply(null, ys)) - 0.4)], [pts[0][0], Y(M.min(0, M.min.apply(null, ys)) - 0.4)]]), { fill: k.obj2, close: true }); poly(ctx, pts, { color: k.obj2Line, w: 3 });
        if (P.mu > 0) { ctx.save(); ctx.setLineDash([2, 5]); poly(ctx, pts, { color: k.eTh, w: 1.5, dash: [2, 5] }); ctx.restore(); }
        if (scene === 'spring') { var wallX = X(0), sy = Y(0); block(ctx, wallX - 10, sy - 30, 10, 30, { fill: k.obj2Line, color: k.obj2Line, r: 1 }); spring(ctx, wallX, sy - 12, X(M.min(S.s, sp0)), sy - 12, { n: 12, amp: 7, color: k.eUs, w: 2.2 }); }
        var q = tr.at(S.s), ang = M.atan2(q.ty, q.tx), nx = -M.sin(ang), ny = M.cos(ang);
        if (scene === 'track') ball(ctx, X(p.x) + nx * 9, Y(p.y) - 9 * ny, 9, k.acc);
        else { ctx.save(); ctx.translate(X(p.x), Y(p.y)); ctx.rotate(-ang); block(ctx, scene === 'spring' ? 0 : -16, -22, 32, 22, { r: 4 }); ctx.restore(); }
        line(ctx, sr.x, Y(ref), sr.x + sr.w, Y(ref), k.muted, 1, [6, 4]); txt(ctx, 'height zero (U = 0)', sr.x + 4, Y(ref) + 10, { size: 10.5, color: k.muted });
        if (scene === 'track') tr.P.forEach(function (q2, i) { if (i % 24 === 0) F.tagAt(ctx, 'p' + (i / 24), X(q2[0]), Y(q2[1]) - 20); });
      }
      if (showBars) {
        var inE = sys.indexOf('earth') >= 0, inS = sys.indexOf('spring') >= 0 || scene !== 'spring', E0 = energies0, items = [];
        Emax = M.max(Emax, S.E0 * 1.05, 1);
        bars.forEach(function (b) { if (b === 'Ug' && !inE) return; if (b === 'Us' && !inS) return; if (b === 'W') return; items.push({ key: b, v: e[b] }); });
        var W = 0; if (!inE) W += P.m * g * (E0().y - p.y); if (!inS && scene === 'spring') W += E0().Us - e.Us;
        if (!inE || (!inS && scene === 'spring') || bars.indexOf('W') >= 0) items.push({ key: 'W', v: W });
        var tot = (inE ? e.Ug : 0) + (inS ? e.Us : 0) + e.K + e.Eth;
        energyBars(ctx, br, items, { max: Emax, unit: 'J', vals: F.vals, total: tot, F: F, neg: !inE });
      }
      hd.draw(ctx);
      var tot2 = e.K + e.Ug + e.Us + e.Eth;
      F.desc((scene === 'pendulum' ? 'A pendulum' : scene === 'drop' ? 'A dropped ball' : 'A ' + fm(P.m, 1) + ' kg object on a ' + scene) + (F.quiet ? '' : ' with K = ' + un(e.K, 'J') + ', U = ' + un(e.Ug + e.Us, 'J') + ', thermal ' + un(e.Eth, 'J') + '; total ' + un(tot2, 'J')) + '.');
      var v = M.sqrt(2 * e.K / P.m);
      F.read('Speed <b>' + un(v, 'm/s', 3) + '</b>. K = <b>' + un(e.K, 'J', 3) + '</b>, U<sub>g</sub> = <b>' + un(e.Ug, 'J', 3) + '</b>' + (scene === 'spring' ? ', U<sub>s</sub> = <b>' + un(e.Us, 'J', 3) + '</b>' : '') + ', thermal <b>' + un(e.Eth, 'J', 3) + '</b>; total <b>' + un(tot2, 'J', 3) + '</b> (it stays the same: energy changes form, it is not used up).' + (scene === 'ramp' || scene === 'track' ? ' Mass cancels from mgh = ½mv², so a heavier object reaches the same speed.' : ''));
      F.stats([['speed', un(v, 'm/s', 3)], ['K', un(e.K, 'J', 3)], ['U grav', un(e.Ug, 'J', 3)]].concat(scene === 'spring' ? [['U spring', un(e.Us, 'J', 3)]] : []).concat([['thermal', un(e.Eth, 'J', 3)], ['total', un(tot2, 'J', 3)]]));
    };
    function energies0() { return { y: scene === 'pendulum' ? P.L * (1 - M.cos(P.th0 * DEG)) : scene === 'drop' ? P.h0 : tr.at(scene === 'spring' ? sp0 - P.x0 : 0).y, Us: scene === 'spring' ? 0.5 * P.k * P.x0 * P.x0 : 0 }; }
    var hd = { draw: function () { } };
    F.now();
    return {};
  });
  function energyChart(el, o) {
    var F = frame(el, o, 'An energy bar chart: before, transfer and after');
    var ch = o.chart || { before: { K: 0, Ug: 3 }, W: 0, after: { K: '?', Ug: 0, Eth: 1 } }, keys = arr(o.bars || ['K', 'Ug', 'Us', 'Eth']).filter(function (q) { return q !== 'W'; });
    var used = keys.filter(function (q) { return (ch.before && ch.before[q] != null) || (ch.after && ch.after[q] != null); });
    if (!used.length) used = ['K', 'Ug'];
    var vals = []; [ch.before || {}, ch.after || {}].forEach(function (s) { used.forEach(function (q) { if (isNum(num(s[q], null))) vals.push(M.abs(num(s[q], 0))); }); }); if (isNum(num(ch.W, null))) vals.push(M.abs(num(ch.W, 0)));
    var mx = M.max(1, M.max.apply(null, vals.concat([1])));
    var c = F.canvas({ aspect: 2.1, narrow: 1.3 });
    F.draw = function () {
      var ctx = c.ctx, k = K(); bg(c);
      var W0 = c.w, colW = (W0 - 24) / (used.length * 2 + 1.6), y0 = 14, h = c.h - 60;
      var bW = { x: 12, y: y0, w: colW * used.length, h: h }, wW = { x: 12 + colW * used.length + 6, y: y0, w: colW * 1.6 - 12, h: h }, aW = { x: 12 + colW * (used.length + 1.6), y: y0, w: colW * used.length, h: h };
      function items(s) { return used.map(function (q) { var v = s[q]; return { key: q, v: v === '?' ? '?' : v == null ? 0 : num(v, 0) }; }); }
      var wv = ch.W === '?' ? '?' : num(ch.W, 0), neg = (isNum(wv) && wv < 0);
      energyBars(ctx, bW, items(ch.before || {}), { max: mx, vals: F.vals || true, unit: o.unit === undefined ? '' : o.unit, neg: neg, F: F });
      energyBars(ctx, wW, [{ key: 'W', v: wv }], { max: mx, vals: true, neg: neg, grid: false });
      energyBars(ctx, aW, items(ch.after || {}), { max: mx, vals: true, neg: neg });
      [['Before', bW], ['Work in (+) or out (−)', wW], ['After', aW]].forEach(function (q) { txt(ctx, q[0], q[1].x + q[1].w / 2, c.h - 10, { align: 'center', size: 12, weight: 700, color: k.ink }); });
      var sb = 0, sa = 0; used.forEach(function (q) { sb += isNum(num((ch.before || {})[q], null)) ? num(ch.before[q], 0) : 0; sa += isNum(num((ch.after || {})[q], null)) ? num(ch.after[q], 0) : 0; });
      F.desc('Energy bar chart. Before: ' + used.map(function (q) { return q + ' ' + ((ch.before || {})[q] == null ? 0 : ch.before[q]); }).join(', ') + '. Work: ' + (ch.W == null ? 0 : ch.W) + '. After: ' + used.map(function (q) { return q + ' ' + ((ch.after || {})[q] == null ? 0 : ch.after[q]); }).join(', ') + '.');
      F.read('Energy before + work in = energy after: the bars on the left plus the middle bar must add up to the bars on the right.');
    };
    F.now(); return {};
  }
  /* PM.uTurning(U, E, x0, a, b): the turning points around x0 where U = E (null if none on that side) */
  PM.uTurning = function (U, E, x0, a, b) {
    function find(dir) { var h = (b - a) / 2000, x = x0; if (U(x) > E) return null; while (x > a && x < b) { var x2 = x + dir * h; if (U(x2) > E) { var lo = x, hi = x2; for (var i = 0; i < 50; i++) { var m = (lo + hi) / 2; if (U(m) > E) hi = m; else lo = m; } return (lo + hi) / 2; } x = x2; } return null; }
    return [find(-1), find(1)];
  };
  function uCurve(el, o) {
    var F = frame(el, o, 'A potential-energy curve with the total energy line');
    var U = cx(o.U || '0.5*x^4 - 2*x^2 + 0.5*x', ['x']), dom = Array.isArray(o.domain) ? [num(o.domain[0], -2.5), num(o.domain[1], 2.5)] : [num(o.xmin, -2.5), num(o.xmax, 2.5)];
    var E = num(o.E, 1), m = num(o.m, 1), S = { x: num(o.x0, (dom[0] + dom[1]) / 2 + 0.3), v: 0 }, xu = o.xunit || 'm', eu = o.unit || 'J';
    var ys = []; for (var i = 0; i <= 400; i++) { var y = U(dom[0] + (dom[1] - dom[0]) * i / 400); if (isFinite(y)) ys.push(y); }
    var ry = Array.isArray(o.range) ? [num(o.range[0], -3), num(o.range[1], 3)] : niceRange(M.min.apply(null, ys), M.min(M.max.apply(null, ys), M.max(E * 1.6, M.min.apply(null, ys) + 3)), 2, 0.1);
    var dU = function (x) { var h = 1e-4 * (dom[1] - dom[0]); return (U(x + h) - U(x - h)) / (2 * h); };
    if (U(S.x) > E) { var bx = S.x, bu = U(S.x); for (i = 0; i <= 400; i++) { var xx = dom[0] + (dom[1] - dom[0]) * i / 400; if (U(xx) < bu) { bu = U(xx); bx = xx; } } S.x = bx; }
    var eqs = []; for (i = 1; i < 800; i++) { var x1 = dom[0] + (dom[1] - dom[0]) * i / 800, x2 = dom[0] + (dom[1] - dom[0]) * (i + 1) / 800; if (dU(x1) * dU(x2) < 0) { var lo = x1, hi = x2; for (var j = 0; j < 50; j++) { var md = (lo + hi) / 2; if (dU(lo) * dU(md) <= 0) hi = md; else lo = md; } var xe = (lo + hi) / 2; eqs.push({ x: xe, stable: dU(xe + 1e-3) > dU(xe - 1e-3) }); } }
    function reset() { S.x = num(o.x0, S.x); if (U(S.x) > E) S.x = eqs.filter(function (q) { return q.stable; }).map(function (q) { return q.x; })[0] || S.x; S.v = M.sqrt(M.max(0, 2 * (E - U(S.x)) / m)); }
    reset();
    var c = F.canvas({ aspect: 1.75 }), G = null;
    var A = F.anim({ tmax: undefined, scrub: false, autoplay: true, reset: reset, tick: function (h) { var n = M.ceil(h / 0.002), dt = h / n; for (var q = 0; q < n; q++) { var y = rk4(function (t, s) { return [s[1], -dU(s[0]) / m]; }, 0, [S.x, S.v], dt); S.x = y[0]; S.v = y[1]; if (S.x < dom[0] || S.x > dom[1]) { S.x = clamp(S.x, dom[0], dom[1]); S.v = -S.v; } } var K0 = E - U(S.x); if (K0 > 0 && M.abs(S.v) > 0.05) S.v = M.sign(S.v) * M.sqrt(2 * K0 / m); return true; }, dt: 0.05 });
    var hd = F.handles(F.live ? [{ name: 'total energy line', pos: function () { return G ? [G.r.x + G.r.w - 18, G.Y(E)] : null; }, drag: function (px, py) { E = clamp(G.iy(py), ry[0], ry[1]); if (U(S.x) > E) reset(); }, key: function (dx, dy, big) { E = clamp(E + dy * (ry[1] - ry[0]) * (big ? 0.05 : 0.01), ry[0], ry[1]); if (U(S.x) > E) reset(); } },
      { name: 'the ball', pos: function () { return G ? [G.X(S.x), G.Y(U(S.x))] : null; }, drag: function (px) { var x = clamp(G.ix(px), dom[0], dom[1]); if (U(x) <= E) { S.x = x; S.v = M.sqrt(M.max(0, 2 * (E - U(x)) / m)); } }, key: function (dx, dy, big) { var x = clamp(S.x + dx * (dom[1] - dom[0]) * (big ? 0.05 : 0.01), dom[0], dom[1]); if (U(x) <= E) { S.x = x; S.v = M.sqrt(M.max(0, 2 * (E - U(x)) / m)) * (S.v < 0 ? -1 : 1); } } }] : [], { r: 22 });
    F.draw = function () {
      var ctx = c.ctx, k = K(); bg(c);
      var r = { x: 48, y: 12, w: c.w - 62, h: c.h - 34 };
      G = GP(ctx, r, { xmin: dom[0], xmax: dom[1], ymin: ry[0], ymax: ry[1], xlab: 'x (' + xu + ')', ylab: 'U (' + eu + ')', compact: F.compact }).frame();
      G.fill(function (x) { return M.min(U(x), ry[1]); }, dom[0], dom[1], rgba(k.red, 0.0)); // placeholder keeps clip order simple
      G.clip(); for (var px = r.x; px < r.x + r.w; px += 2) { var x = G.ix(px); if (U(x) > E) { ctx.fillStyle = rgba(k.red, k.isDark ? 0.16 : 0.08); ctx.fillRect(px, r.y, 2, r.h); } } ctx.restore();
      G.plot(U, k.eUg, 2.8);
      var tp = PM.uTurning(U, E, S.x, dom[0], dom[1]);
      G.hline(E, k.ink, [7, 4], 1.8); txt(ctx, 'E' + (F.vals ? ' = ' + nf(E, 3) + ' ' + eu : ''), r.x + r.w - 6, G.Y(E) - 10, { align: 'right', size: 12, weight: 700, color: k.ink, halo: true, haloColor: k.panelBg });
      if (F.live) knob(ctx, r.x + r.w - 18, G.Y(E), k.ink, 6);
      var Ux = U(S.x), bxp = G.X(S.x), byp = G.Y(Ux);
      if (F.on('kgap', true)) { line(ctx, bxp, G.Y(E), bxp, byp, k.eK, 4); txt(ctx, 'K', bxp + 6, (G.Y(E) + byp) / 2, { size: 12, weight: 700, color: k.eK, halo: true, haloColor: k.panelBg }); }
      ball(ctx, bxp, byp - 8, 8, k.acc);
      var Fx = -dU(S.x), fs = 40 / M.max(0.5, M.max.apply(null, eqs.map(function () { return 1; }).concat([M.abs(Fx), 1]))); if (F.on('force', true) && M.abs(Fx) > 1e-6) arrow(ctx, bxp, byp - 26, bxp + clamp(Fx * 18, -70, 70), byp - 26, { color: k.force, w: 2.6, label: 'F = −dU/dx' });
      void fs;
      if (F.on('turning', true, true)) tp.forEach(function (x, i) { if (x == null) return; G.vline(x, k.gold, [3, 3], 1.4); circ(ctx, G.X(x), G.Y(E), 5, { fill: k.gold }); txt(ctx, 'turning point', G.X(x), G.Y(E) + 14, { align: 'center', size: 10.5, color: k.gold, halo: true, haloColor: k.panelBg }); F.tagAt(ctx, 'turn' + i, G.X(x), G.Y(E) - 18); });
      if (F.on('equilibria', true)) eqs.forEach(function (q, i) { var py = G.Y(U(q.x)); circ(ctx, G.X(q.x), py, 5.5, q.stable ? { fill: k.green } : { fill: k.bg, color: k.red, w: 2 }); txt(ctx, q.stable ? 'stable' : 'unstable', G.X(q.x), py + (q.stable ? 16 : -16), { align: 'center', size: 10.5, color: q.stable ? k.green : k.red, halo: true, haloColor: k.panelBg }); F.tagAt(ctx, 'eq' + i, G.X(q.x) + 16, py - 14); });
      hd.draw(ctx);
      F.desc('Potential energy U(x) with total energy E' + (F.quiet ? '' : ' = ' + nf(E, 3) + ' ' + eu) + '. The ball moves only where U is below E' + (tp[0] != null && tp[1] != null && !F.quiet ? ', between x = ' + nf(tp[0], 3) + ' and ' + nf(tp[1], 3) + ' ' + xu : '') + '.');
      F.read('At x = <b>' + nf(S.x, 3) + ' ' + xu + '</b>: U = <b>' + nf(Ux, 3) + ' ' + eu + '</b>, K = E − U = <b>' + nf(E - Ux, 3) + ' ' + eu + '</b>, force F = −dU/dx = <b>' + nf(Fx, 3) + '</b> (it points downhill on the U curve). Shaded regions have U > E: the ball can never go there.');
    };
    F.now(); return {};
  }

  // ===================================================================================================
  // ph-collision
  /* PM.collide1d(m1, m2, v1, v2, e): velocities after a 1-D collision with coefficient of restitution e */
  PM.collide1d = function (m1, m2, v1, v2, e) { var P0 = m1 * v1 + m2 * v2, M0 = m1 + m2; return [(P0 - m2 * e * (v1 - v2)) / M0, (P0 + m1 * e * (v1 - v2)) / M0]; };
  /* PM.collide2d(m1, m2, v1 [x, y], v2, e, phi): 2-D collision; phi = direction (deg) of the line of centers from 1 to 2 */
  PM.collide2d = function (m1, m2, v1, v2, e, phi) { var n = [M.cos(phi * DEG), M.sin(phi * DEG)], t = [-n[1], n[0]], a1 = v1[0] * n[0] + v1[1] * n[1], a2 = v2[0] * n[0] + v2[1] * n[1], b1 = v1[0] * t[0] + v1[1] * t[1], b2 = v2[0] * t[0] + v2[1] * t[1], r = PM.collide1d(m1, m2, a1, a2, e); return [[r[0] * n[0] + b1 * t[0], r[0] * n[1] + b1 * t[1]], [r[1] * n[0] + b2 * t[0], r[1] * n[1] + b2 * t[1]]]; };
  R('ph-collision', function (el, o) {
    var mode = pick(o.mode, ['1d', '2d', 'explode', 'rocket', 'impulse'], '1d');
    var F = frame(el, o, { '1d': 'Two gliders colliding on an air track', '2d': 'Two pucks colliding on a table', explode: 'An explosion from rest', rocket: 'A rocket throwing out mass', impulse: 'Force against time during a collision' }[mode]);
    var P = { m1: num(o.m1, 2), m2: num(o.m2, mode === 'explode' ? 1 : 1), v1: num(o.v1, mode === 'explode' ? -1 : 3), v2: num(o.v2, 0), e: clamp(num(o.e, 1), 0, 1), angle: num(o.angle, 35), ve: num(o.ve, 2000), m0: num(o.m0, 1000), mf: num(o.mf, 400), bumper: o.bumper === 'soft' ? 'soft' : 'hard' };
    var sh = { p: F.on('p', true), K: F.on('K', mode !== 'explode' && mode !== 'rocket'), cm: F.on('cm', mode === '1d' || mode === 'explode'), Ft: F.on('Ft', mode === 'impulse'), vec: F.on('vectors', mode === '2d') };
    if (mode === 'rocket') return rocket(F, o, P);
    if (mode === 'impulse') return impulse(F, o, P);
    var c = F.canvas({ aspect: mode === '2d' ? 1.5 : 1.55, narrow: mode === '2d' ? 1.0 : 0.85 }), T = 4, S = {};
    function after() { if (mode === 'explode') return [P.v1, -P.m1 * P.v1 / P.m2]; return PM.collide1d(P.m1, P.m2, P.v1, P.v2, P.e); }
    // 1-D: positions in metres on a 2 m track; the collision time tc is when the gap closes
    var w1, w2, x10 = 0.35, x20 = 1.25;
    function setup() { w1 = 0.14 + 0.03 * P.m1; w2 = 0.14 + 0.03 * P.m2; if (mode === 'explode') { x10 = 1 - w1 / 2; x20 = 1 + w2 / 2; } var rel = P.v1 - P.v2; S.tc = mode === 'explode' ? 0 : rel > 1e-9 ? ((x20 - w2 / 2) - (x10 + w1 / 2)) / rel : Infinity; T = isFinite(S.tc) ? M.min(8, S.tc * 2 + 0.5) : 3; var u0 = after(), tcc = isFinite(S.tc) ? S.tc : 0, xs0 = [x10 + P.v1 * tcc, x20 + P.v2 * tcc];
      [[u0[0], w1, xs0[0]], [u0[1], w2, xs0[1]]].forEach(function (q) { if (q[0] > 1e-9) T = M.min(T, tcc + (2 - q[1] / 2 - q[2]) / q[0]); else if (q[0] < -1e-9) T = M.min(T, tcc + (q[2] - q[1] / 2) / -q[0]); }); T = M.max(T, tcc + 0.05); if (A) { aq.tmax = T; if (A.sl) A.sl.input.max = T; } }
    function state(t) { var u = after(); if (t <= S.tc) return [x10 + P.v1 * t, x20 + P.v2 * t, P.v1, P.v2]; var d = t - S.tc, a1 = x10 + P.v1 * S.tc, a2 = x20 + P.v2 * S.tc; return [a1 + u[0] * d, a2 + u[1] * d, u[0], u[1]]; }
    var aq = { tmax: T, autoplay: true, loop: false, dt: 0.1, tStatic: 0 }, A = null; setup(); A = F.anim(aq); aq.tmax = T;
    if (F.live && mode !== '2d') {
      var row = F.row();
      F.slider(row, { label: 'm₁', min: 0.5, max: 6, step: 0.5, value: P.m1, unit: 'kg', d: 1, input: function (v) { P.m1 = v; setup(); A.reset(); } });
      F.slider(row, { label: 'm₂', min: 0.5, max: 6, step: 0.5, value: P.m2, unit: 'kg', d: 1, input: function (v) { P.m2 = v; setup(); A.reset(); } });
      F.slider(row, { label: mode === 'explode' ? 'v₁ after' : 'v₁', min: -3, max: 3, step: 0.1, value: P.v1, unit: 'm/s', d: 1, input: function (v) { P.v1 = v; setup(); A.reset(); } });
      if (mode === '1d') { F.slider(row, { label: 'v₂', min: -3, max: 3, step: 0.1, value: P.v2, unit: 'm/s', d: 1, input: function (v) { P.v2 = v; setup(); A.reset(); } });
        F.slider(row, { label: 'Bounciness e (0 = stick, 1 = elastic)', min: 0, max: 1, step: 0.05, value: P.e, d: 2, input: function (v) { P.e = v; setup(); A.reset(); } }); }
    }
    if (F.live && mode === '2d') { var r2 = F.row(); F.slider(r2, { label: 'Line of centers', min: -70, max: 70, step: 1, value: P.angle, unit: '°', d: 0, input: function (v) { P.angle = v; A.reset(); } }); F.slider(r2, { label: 'Bounciness e', min: 0, max: 1, step: 0.05, value: P.e, d: 2, input: function (v) { P.e = v; A.reset(); } }); F.slider(r2, { label: 'm₂', min: 0.5, max: 6, step: 0.5, value: P.m2, unit: 'kg', d: 1, input: function (v) { P.m2 = v; A.reset(); } }); }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, t = A.t; bg(c);
      var u = after(), pB = P.m1 * P.v1 + P.m2 * P.v2, pA = P.m1 * u[0] + P.m2 * u[1], KB = 0.5 * P.m1 * P.v1 * P.v1 + 0.5 * P.m2 * P.v2 * P.v2, KA = 0.5 * P.m1 * u[0] * u[0] + 0.5 * P.m2 * u[1] * u[1];
      if (mode === 'explode') { pB = 0; KB = 0; }
      var desc, read;
      if (mode === '2d') {
        var v1 = [P.v1, 0], v2 = [P.v2, 0], res = PM.collide2d(P.m1, P.m2, v1, v2, P.e, P.angle), tc = 1, R0 = 0.1, n = [M.cos(P.angle * DEG), M.sin(P.angle * DEG)];
        var c2 = [0, 0], c1c = [c2[0] - 2 * R0 * n[0], c2[1] - 2 * R0 * n[1]], q1 = t <= tc ? [c1c[0] - P.v1 * 0.3 * (tc - t), c1c[1]] : [c1c[0] + res[0][0] * 0.3 * (t - tc), c1c[1] + res[0][1] * 0.3 * (t - tc)], q2 = t <= tc ? c2 : [c2[0] + res[1][0] * 0.3 * (t - tc), c2[1] + res[1][1] * 0.3 * (t - tc)];
        var sr = W0 > 560 ? { x: 10, y: 10, w: W0 * 0.58, h: H0 - 20 } : { x: 10, y: 10, w: W0 - 20, h: H0 * 0.6 }, mp = fitMap(sr, -1.25, 1.1, -0.85, 0.85, true);
        ctx.save(); ctx.fillStyle = k.panelBg; rrect(ctx, sr.x, sr.y, sr.w, sr.h, 8); ctx.fill(); ctx.restore();
        line(ctx, mp.X(c1c[0] - 2), mp.Y(c1c[1]), mp.X(c1c[0]), mp.Y(c1c[1]), rgba(k.muted, 0.5), 1, [4, 4]); line(ctx, mp.X(c2[0] - n[0] * 0.5), mp.Y(c2[1] - n[1] * 0.5), mp.X(c2[0] + n[0] * 0.5), mp.Y(c2[1] + n[1] * 0.5), k.gold, 1.2, [3, 3]);
        [[q1, P.m1, 'g1', k.acc], [q2, P.m2, 'g2', k.purple]].forEach(function (q, i) { var rr = R0 * mp.sx * (0.8 + 0.1 * q[1]); circ(ctx, mp.X(q[0][0]), mp.Y(q[0][1]), rr, { fill: rgba(q[3], 0.25), color: q[3], w: 2.5 }); txt(ctx, (i ? 'm₂' : 'm₁'), mp.X(q[0][0]), mp.Y(q[0][1]), { align: 'center', size: 11, weight: 700, color: q[3] }); F.tagAt(ctx, q[2], mp.X(q[0][0]) + rr + 8, mp.Y(q[0][1]) - rr); });
        if (sh.vec) { var vr = W0 > 560 ? { x: W0 * 0.62, y: 20, w: W0 * 0.36, h: H0 - 40 } : { x: 10, y: H0 * 0.62 + 8, w: W0 - 20, h: H0 * 0.38 - 16 }, pmax = M.max(1e-9, M.abs(pB)), s = M.min(vr.w * 0.8, vr.h * 1.4) / pmax, ox = vr.x + vr.w * 0.1, oy = vr.y + vr.h * 0.5;
          txt(ctx, 'momentum (kg·m/s)', vr.x, vr.y, { size: 11, color: k.muted });
          var a1 = [P.m1 * res[0][0], P.m1 * res[0][1]], a2 = [P.m2 * res[1][0], P.m2 * res[1][1]];
          arrow(ctx, ox, oy, ox + pB * s, oy, { color: k.mom, w: 3.5, label: 'p before' }); arrow(ctx, ox, oy, ox + a1[0] * s, oy - a1[1] * s, { color: k.acc, w: 2.6, label: "p₁′" }); arrow(ctx, ox + a1[0] * s, oy - a1[1] * s, ox + (a1[0] + a2[0]) * s, oy - (a1[1] + a2[1]) * s, { color: k.purple, w: 2.6, label: "p₂′" }); F.tagAt(ctx, 'pBefore', ox + pB * s * 0.5, oy + 16); F.tagAt(ctx, 'pAfter', ox + a1[0] * s * 0.5 - 14, oy - a1[1] * s * 0.5 - 12); }
        var ang = M.atan2(res[1][1], res[1][0]) - M.atan2(res[0][1], res[0][0]);
        desc = 'Puck 1 (' + fm(P.m1, 1) + ' kg) moving at ' + un(P.v1, 'm/s') + ' strikes puck 2 (' + fm(P.m2, 1) + ' kg) at rest; the line of centers is at ' + fm(P.angle, 0) + '°.';
        read = 'After: v₁′ = <b>' + un(M.hypot(res[0][0], res[0][1]), 'm/s', 3) + '</b>, v₂′ = <b>' + un(M.hypot(res[1][0], res[1][1]), 'm/s', 3) + '</b>, <b>' + fm(M.abs(ang) / DEG, 1) + '°</b> apart. The momentum vectors after add head to tail to the momentum before' + (P.e === 1 && P.m1 === P.m2 ? '; equal masses in an elastic collision leave at 90°.' : '.');
        F.stats([['p before', un(pB, 'kg·m/s', 3)], ['p after (x, y)', '(' + nf(P.m1 * res[0][0] + P.m2 * res[1][0], 3) + ', ' + nf(P.m1 * res[0][1] + P.m2 * res[1][1], 3) + ')'], ['K before', un(KB, 'J', 3)], ['K after', un(0.5 * P.m1 * (res[0][0] * res[0][0] + res[0][1] * res[0][1]) + 0.5 * P.m2 * (res[1][0] * res[1][0] + res[1][1] * res[1][1]), 'J', 3)]]);
      } else {
        var st0 = state(t), wide = W0 > 560, tr = { x: 16, y: 14, w: W0 - 32, h: wide ? H0 * 0.4 : H0 * 0.34 }, ppm = tr.w / 2, ty = tr.y + tr.h * 0.7;
        rrect(ctx, tr.x, ty, tr.w, 8, 4); ctx.fillStyle = k.grid; ctx.fill(); for (var hx = tr.x + 10; hx < tr.x + tr.w; hx += 14) circ(ctx, hx, ty + 4, 1.4, { fill: k.muted });
        txt(ctx, 'air track (no friction)', tr.x + 4, ty + 20, { size: 10.5, color: k.muted });
        [[st0[0], w1, P.m1, 'g1', k.acc, st0[2], 'm₁'], [st0[1], w2, P.m2, 'g2', k.purple, st0[3], 'm₂']].forEach(function (q) { var xp = tr.x + q[0] * ppm, wp = q[1] * ppm, hp = 16 + q[2] * 4; block(ctx, xp - wp / 2, ty - hp, wp, hp, { fill: rgba(q[4], 0.22), color: q[4], label: q[6] + ' ' + fm(q[2], 1) + ' kg', size: 10.5 }); if (M.abs(q[5]) > 1e-3) arrow(ctx, xp, ty - hp - 12, xp + q[5] * 26, ty - hp - 12, { color: k.vel, w: 2.6, label: F.vals ? un(q[5], 'm/s', 2) : 'v' }); F.tagAt(ctx, q[3], xp, ty - hp - 30); });
        if (sh.cm) { var xc = (P.m1 * st0[0] + P.m2 * st0[1]) / (P.m1 + P.m2), xcp = tr.x + xc * ppm; poly(ctx, [[xcp, ty + 10], [xcp - 6, ty + 20], [xcp + 6, ty + 20]], { fill: k.ink, close: true }); txt(ctx, 'center of mass', xcp, ty + 30, { align: 'center', size: 10.5, color: k.ink, halo: true }); F.tagAt(ctx, 'cm', xcp + 18, ty + 18); }
        // bars: momentum and kinetic energy, before and after
        var by = tr.y + tr.h + 34, bh = H0 - by - 30, cols = (sh.p ? 1 : 0) + (sh.K ? 1 : 0), cw = (W0 - 32 - (cols - 1) * 14) / M.max(1, cols), bx = 16;
        var pm = M.max(1e-9, M.abs(P.m1 * P.v1), M.abs(P.m2 * P.v2), M.abs(P.m1 * u[0]), M.abs(P.m2 * u[1]), M.abs(pB)), km = M.max(1e-9, KB, KA);
        function grp(r, title, items, mx, unit, tagB, tagA) {
          ctx.save(); ctx.fillStyle = k.panelBg; rrect(ctx, r.x, r.y - 18, r.w, r.h + 40, 8); ctx.fill(); ctx.restore(); txt(ctx, title, r.x + 8, r.y - 6, { size: 11.5, weight: 700, color: k.ink });
          var hasNeg = items.some(function (q) { return q[1] < -1e-9; }), zy = hasNeg ? r.y + r.h * 0.55 : r.y + r.h, sc = (zy - r.y - 14) / mx, n = items.length, bw = M.min(30, r.w / (n + 2) * 0.7), gx = (r.w - n * bw) / (n + 1);
          line(ctx, r.x + 4, zy, r.x + r.w - 4, zy, k.axis, 1.4);
          items.forEach(function (q, i) { var x = r.x + gx + i * (bw + gx) + (i >= n / 2 ? gx * 0.3 : -gx * 0.3), h = q[1] * sc; ctx.save(); rrect(ctx, x, h >= 0 ? zy - h : zy, bw, M.abs(h), 3); ctx.fillStyle = q[2]; ctx.fill(); ctx.restore(); if (F.vals) txt(ctx, nf(q[1], 3), x + bw / 2, h >= 0 ? zy - h - 7 : zy - h + 8, { align: 'center', size: 10, color: k.ink, halo: true, haloColor: k.panelBg }); txt(ctx, q[0], x + bw / 2, r.y + r.h + 12, { align: 'center', size: 10.5, color: k.muted }); });
          line(ctx, r.x + r.w / 2, r.y - 4, r.x + r.w / 2, r.y + r.h + 4, k.grid, 1, [3, 3]); txt(ctx, 'before', r.x + r.w * 0.25, r.y + r.h + 26, { align: 'center', size: 11, color: k.ink }); txt(ctx, 'after', r.x + r.w * 0.75, r.y + r.h + 26, { align: 'center', size: 11, color: k.ink });
          F.tagAt(ctx, tagB, r.x + r.w * 0.25, r.y + 6); F.tagAt(ctx, tagA, r.x + r.w * 0.75, r.y + 6); txt(ctx, unit, r.x + r.w - 6, r.y - 6, { align: 'right', size: 10.5, color: k.muted });
        }
        var aft = t > S.tc || mode === 'explode';
        if (sh.p) { grp({ x: bx, y: by, w: cw, h: bh - 26 }, 'Momentum', [['p₁', P.m1 * (mode === 'explode' ? 0 : P.v1), k.acc], ['p₂', P.m2 * (mode === 'explode' ? 0 : P.v2), k.purple], ['total', pB, k.mom], ['p₁′', P.m1 * u[0], k.acc], ['p₂′', P.m2 * u[1], k.purple], ['total', pA, k.mom]], pm * 1.1, 'kg·m/s', 'pBefore', 'pAfter'); bx += cw + 14; }
        if (sh.K) grp({ x: bx, y: by, w: cw, h: bh - 26 }, 'Kinetic energy', [['K₁', 0.5 * P.m1 * P.v1 * P.v1, k.eK], ['K₂', 0.5 * P.m2 * P.v2 * P.v2, k.eK], ['total', KB, k.eK], ['K₁′', 0.5 * P.m1 * u[0] * u[0], k.eK], ['K₂′', 0.5 * P.m2 * u[1] * u[1], k.eK], ['total', KA, k.eK]], km * 1.1, 'J', 'kBefore', 'kAfter');
        void aft;
        desc = mode === 'explode' ? 'Two carts (' + fm(P.m1, 1) + ' and ' + fm(P.m2, 1) + ' kg) at rest push apart: ' + (F.quiet ? '' : 'they move off at ' + un(u[0], 'm/s', 2) + ' and ' + un(u[1], 'm/s', 2) + '.') : 'Glider 1 (' + fm(P.m1, 1) + ' kg) at ' + un(P.v1, 'm/s') + ' and glider 2 (' + fm(P.m2, 1) + ' kg) at ' + un(P.v2, 'm/s') + ', e = ' + fm(P.e, 2) + (F.quiet ? '.' : '; after: ' + un(u[0], 'm/s', 2) + ' and ' + un(u[1], 'm/s', 2) + '.');
        read = mode === 'explode' ? 'Total momentum stays <b>0</b>: m₁v₁ = −m₂v₂, so the lighter cart moves faster. The center of mass stays put. Kinetic energy comes from the spring (stored energy).' : 'Total momentum before <b>' + un(pB, 'kg·m/s', 3) + '</b>, after <b>' + un(pA, 'kg·m/s', 3) + '</b>: conserved in every collision. Kinetic energy: <b>' + un(KB, 'J', 3) + '</b> → <b>' + un(KA, 'J', 3) + '</b>' + (P.e >= 0.999 ? ' (elastic: conserved too).' : P.e < 1e-6 ? ' (they stick: the most kinetic energy becomes thermal energy and sound).' : ' (some becomes thermal energy and sound).') + ' The two gliders push on each other equally hard (third law) even if one is heavier.';
        F.stats([['v₁ → v₁′', nf(P.v1, 3) + ' → ' + nf(u[0], 3) + ' m/s'], ['v₂ → v₂′', nf(P.v2, 3) + ' → ' + nf(u[1], 3) + ' m/s'], ['total p', un(pB, 'kg·m/s', 3)], ['K lost', un(KB - KA, 'J', 3)]]);
      }
      F.desc(desc); F.read(read);
    };
    F.now(); return {};
  });
  PM.impulsePeak = function (dp, dt) { return dp * PI / (2 * dt); }; // half-sine force pulse with area dp and duration dt
  function impulse(F, o, P) {
    var m = num(o.m1, 0.5), v = num(o.v1, 4), e = P.e, dts = { hard: 0.01, soft: 0.05 }, cur = P.bumper;
    var c = F.canvas({ aspect: 1.7, narrow: 1.0 });
    if (F.live) { F.seg(null, { label: 'Bumper', items: [['hard', 'Hard bumper'], ['soft', 'Soft bumper']], value: cur, change: function (v2) { cur = v2; } }); F.seg(null, { label: 'Outcome', items: [['0', 'Stops'], ['1', 'Bounces back']], value: e > 0.5 ? '1' : '0', change: function (v2) { e = +v2; } }); }
    F.draw = function () {
      var ctx = c.ctx, k = K(); bg(c);
      var dp = m * v * (1 + e), r = { x: 50, y: 14, w: c.w - 64, h: c.h - 40 }, tmax = 0.07, fmax = PM.impulsePeak(m * v * 2, dts.hard) * 1.08;
      var G = GP(ctx, r, { xmin: 0, xmax: tmax * 1000, ymin: 0, ymax: fmax, xlab: 't (ms)', ylab: 'F (N)', compact: F.compact }).frame();
      ['hard', 'soft'].forEach(function (b) { var dt = dts[b], pk = PM.impulsePeak(dp, dt), f = function (x) { var t = x / 1000 - 0.005; return t >= 0 && t <= dt ? pk * M.sin(PI * t / dt) : 0; }; var on = b === cur || F.on('both', true); if (!on) return; if (b === cur) G.fill(f, 0, tmax * 1000, rgba(k.mom, 0.28)); G.plot(f, b === cur ? k.mom : rgba(k.muted, 0.7), b === cur ? 2.8 : 1.6, b === cur ? null : [5, 4]); txt(ctx, b + ' bumper' + (F.vals ? ': peak ' + un(pk, 'N', 3) + ', ' + fm(dt * 1000, 0) + ' ms' : ''), G.X((0.005 + dt / 2) * 1000) + (b === 'hard' ? 12 : 0), G.Y(pk) - 10, { size: 11.5, color: b === cur ? k.mom : k.muted, halo: true, haloColor: k.panelBg, align: b === 'hard' ? 'left' : 'center' }); });
      F.tagAt(ctx, 'ft', G.X(30), G.Y(fmax * 0.6));
      F.desc('Force against time for a ' + fm(m, 2) + ' kg cart at ' + un(v, 'm/s') + ' that ' + (e > 0.5 ? 'bounces back' : 'stops') + ' against a ' + cur + ' bumper.' + (F.quiet ? '' : ' The area (impulse) is ' + un(dp, 'N·s', 3) + ' either way.'));
      F.read('Impulse = area under F–t = Δp = <b>' + un(dp, 'N·s', 3) + '</b> for both bumpers. The soft bumper stretches the time, so the peak force is smaller' + (F.vals ? ' (' + un(PM.impulsePeak(dp, dts.soft), 'N', 3) + ' instead of ' + un(PM.impulsePeak(dp, dts.hard), 'N', 3) + ')' : '') + '. A bounce changes the momentum more than a stop: Δp = m(v + ev).');
    };
    F.now(); return {};
  }
  /* PM.rocket(m0, mf, ve, n): speed gained by throwing out (m0 − mf) in n equal packets at ve relative to the rocket */
  PM.rocket = function (m0, mf, ve, n) { var dm = (m0 - mf) / n, v = 0, m = m0; for (var i = 0; i < n; i++) { v += ve * dm / m; m -= dm; } return v; };
  function rocket(F, o, P) {
    var n = num(o.packets, 10), c = F.canvas({ aspect: 1.7, narrow: 0.95 });
    var aq = { tmax: 1, rate: 0.25, dt: 1 / n, autoplay: true, tfmt: function (v) { return M.floor(v * n + 1e-9) + ' of ' + n + ' packets'; }, tlabel: 'Packets thrown', tStatic: 1 }, A = F.anim(aq);
    if (F.live) F.slider(F.row(), { label: 'Number of packets', min: 1, max: 50, step: 1, value: n, d: 0, input: function (v) { n = v; aq.dt = 1 / n; } });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c, k.isDark ? k.space : '#0d1d2a');
      var thrown = clamp(M.floor(A.t * n + 1e-9), 0, n), dm = (P.m0 - P.mf) / n, m = P.m0 - thrown * dm, vd = PM.rocket(P.m0, P.m0 - thrown * dm, P.ve, M.max(1, thrown)) * (thrown ? 1 : 0), vc = P.ve * M.log(P.m0 / m);
      for (var i = 0; i < 60; i++) circ(ctx, (i * 97.3) % W0, (i * 53.7) % (H0 * 0.5), 1, { fill: 'rgba(219,231,239,0.5)' });
      var sy = H0 * 0.28, rx = W0 * 0.55; ctx.save(); ctx.translate(rx, sy); poly(ctx, [[46, 0], [26, -12], [-30, -12], [-40, -20], [-40, 20], [-30, 12], [26, 12]], { fill: '#dbe7ef', color: '#8fb3c6', close: true, w: 2 }); ctx.restore();
      for (i = 0; i < thrown; i++) { var px = rx - 50 - (thrown - i) * 14; if (px > 6) circ(ctx, px, sy, 4, { fill: '#ffd479' }); }
      arrow(ctx, rx + 54, sy, rx + 54 + 30 + vd * 0.02, sy, { color: '#63e6be', w: 3, label: 'v' });
      var r = { x: 52, y: H0 * 0.5 + 6, w: W0 - 66, h: H0 * 0.5 - 30 }, mr = P.m0 / P.mf, G = GP(ctx, r, { xmin: 1, xmax: mr, ymin: 0, ymax: P.ve * M.log(mr) * 1.15, xlab: 'm₀/m', ylab: 'Δv (m/s)', compact: true, bgColor: '#0f2230', gridColor: 'rgba(120,170,200,0.18)', axisColor: '#8fb3c6', tickColor: '#8fb3c6', labColor: '#dbe7ef' }).frame();
      G.plot(function (x) { return P.ve * M.log(x); }, '#63e6be', 2.4); var pts = []; for (i = 0; i <= n; i++) { var mm = P.m0 - i * dm; pts.push([P.m0 / mm, PM.rocket(P.m0, mm, P.ve, M.max(1, i)) * (i ? 1 : 0)]); } G.line(pts, '#ffd479', 1.6, [4, 3]); pts.forEach(function (q, i2) { if (i2 <= thrown) G.dot(q[0], q[1], '#ffd479', 3); });
      F.desc('A rocket of ' + un(P.m0, 'kg') + ' throws out ' + un(P.m0 - P.mf, 'kg') + ' in ' + n + ' packets at ' + un(P.ve, 'm/s') + ' relative to itself.');
      F.read('After ' + thrown + ' packets: m = ' + un(m, 'kg', 3) + ', Δv = <b>' + un(vd, 'm/s', 3) + '</b> (packets); the smooth limit v<sub>e</sub> ln(m₀/m) = <b>' + un(vc, 'm/s', 3) + '</b>. Each packet adds a little more speed than the one before, because the same push acts on less mass. More, smaller packets approach the smooth limit.');
      F.stats([['mass now', un(m, 'kg', 3)], ['Δv (packets)', un(vd, 'm/s', 3)], ['vₑ ln(m₀/m)', un(vc, 'm/s', 3)]]);
    };
    F.now(); return {};
  }

  // ===================================================================================================
  // ph-torque
  /* PM.torques(pivot, forces): torque of each force about a pivot on a horizontal beam. forces: [{x, mag, angle}] (angle from +x,
     counterclockwise). τ = (x − pivot)·F sin θ, counterclockwise positive; lever arm = |x − pivot|·|sin θ|. */
  PM.torques = function (xp, fs) { return fs.map(function (f) { var a = f.angle * DEG; return { tau: (f.x - xp) * f.mag * M.sin(a), arm: M.abs((f.x - xp) * M.sin(a)) }; }); };
  /* PM.ladder(L, theta, M, m, d, mu, g): ladder of length L at angle theta (deg) from the floor against a frictionless wall, mass M,
     person m at distance d along it. Returns wall force Nw, floor normal Nf, friction needed f and whether it slips. */
  PM.ladder = function (L, th, Mm, m, d, mu, g) { g = g || 9.8; var a = th * DEG, Nf = (Mm + m) * g, Nw = (Mm * g * L / 2 + m * g * d) * M.cos(a) / (L * M.sin(a)); return { Nf: Nf, Nw: Nw, f: Nw, slips: Nw > mu * Nf + 1e-12 }; };
  R('ph-torque', function (el, o) {
    var scene = pick(o.scene, ['seesaw', 'beam', 'wrench', 'door', 'rod', 'sign', 'ladder', 'lever1', 'lever2', 'lever3', 'pulley-block', 'ramp'], 'seesaw');
    var F = frame(el, o, { seesaw: 'A seesaw with weights', beam: 'A beam on a pivot with forces', wrench: 'A wrench turning a bolt', door: 'A door seen from above', rod: 'A hinged rod', sign: 'A hanging sign held by a cable', ladder: 'A ladder leaning on a wall', lever1: 'A first-class lever', lever2: 'A second-class lever', lever3: 'A third-class lever', 'pulley-block': 'A block and tackle', ramp: 'A ramp as a simple machine' }[scene]);
    var g = num(o.g, 9.8), sh = { arm: F.on('leverArm', true), tq: F.on('torques', true, true), net: F.on('net', true, true), comp: F.on('components', false), work: F.on('work', scene === 'ramp' || scene === 'pulley-block' || /^lever/.test(scene)) };
    if (scene === 'ladder') return ladderScene(F, o, g);
    if (scene === 'pulley-block' || scene === 'ramp') return machineScene(F, o, g, scene, sh);
    var Lb = num(o.beamLength, scene === 'wrench' ? 0.3 : scene === 'door' ? 0.9 : 4), Mb = num(o.beamMass, scene === 'rod' || scene === 'sign' ? 10 : 0);
    var xp = num(o.pivot, scene === 'seesaw' || scene === 'beam' || scene === 'lever1' ? Lb / 2 : (scene === 'lever2' || scene === 'lever3' || scene === 'wrench' || scene === 'door' || scene === 'rod' || scene === 'sign' ? 0 : Lb / 2));
    var forces = arr(o.forces).map(function (f) { return { x: num(f.x, 0), mag: num(f.mag, 10), angle: num(f.angle, -90), label: f.label }; });
    var masses = arr(o.masses).map(function (q) { return { x: num(q.x, 0), m: num(q.m, 1) }; });
    if (!o.forces && !o.masses) {
      if (scene === 'seesaw') masses = [{ x: 0.5, m: 30 }, { x: 3.0, m: 20 }];
      else if (scene === 'beam') { forces = [{ x: 0.5, mag: 60, angle: -90 }, { x: 3.5, mag: 30, angle: -90 }]; }
      else if (scene === 'wrench') forces = [{ x: 0.25, mag: 50, angle: 70 }];
      else if (scene === 'door') forces = [{ x: 0.8, mag: 20, angle: 60 }];
      else if (scene === 'rod') forces = [{ x: Lb, mag: Mb * g / 2, angle: 90, label: 'F' }];
      else if (scene === 'sign') masses = [{ x: Lb * 0.75, m: 20 }];
      else if (scene === 'lever1') { masses = [{ x: 0.4, m: 60 }]; forces = [{ x: 4, mag: 60 * g * (Lb / 2 - 0.4) / (4 - Lb / 2), angle: -90, label: 'effort' }]; }
      else if (scene === 'lever2') { masses = [{ x: 1, m: 60 }]; forces = [{ x: Lb, mag: 60 * g * 1 / Lb, angle: 90, label: 'effort' }]; }
      else if (scene === 'lever3') { masses = [{ x: Lb, m: 5 }]; forces = [{ x: 1, mag: 5 * g * Lb / 1, angle: 90, label: 'effort' }]; }
    }
    var cableAng = num(o.cableAngle, 35);
    var pc = o.pivotChoice != null ? num(o.pivotChoice, Lb / 2) : null, tilt = 0;
    var c = F.canvas({ aspect: scene === 'door' || scene === 'wrench' ? 1.6 : 1.9, narrow: 1.15 }), mp = null;
    function allForces() { // every force on the beam except the support at the pivot: [{x, mag, angle, kind, label}]
      var L0 = forces.map(function (f, i) { return { x: f.x, mag: f.mag, angle: f.angle, kind: 'f', i: i, label: f.label || 'F' + sub(i + 1) }; });
      masses.forEach(function (q, i) { L0.push({ x: q.x, mag: q.m * g, angle: -90, kind: 'm', i: i, label: (scene === 'sign' ? 'sign' : fm(q.m, 0) + ' kg') }); });
      if (Mb > 0) L0.push({ x: Lb / 2, mag: Mb * g, angle: -90, kind: 'b', label: 'beam weight' });
      if (scene === 'sign') { var other = L0.reduce(function (s, f) { return s + (f.x - xp) * f.mag * M.sin(f.angle * DEG); }, 0), T = -other / (Lb * M.sin((180 - cableAng) * DEG)); L0.push({ x: Lb, mag: T, angle: 180 - cableAng, kind: 'cable', label: 'tension' }); }
      return L0;
    }
    function hinge(L0) { var sx = 0, sy = 0; L0.forEach(function (f) { sx += f.mag * M.cos(f.angle * DEG); sy += f.mag * M.sin(f.angle * DEG); }); return [-sx, -sy]; }
    var list = [];
    if (F.live && o.drag !== false) {
      masses.forEach(function (q, i) { list.push({ name: 'weight ' + (i + 1), pos: function () { return mp ? [mp.X(q.x), mp.Y(0) - 14] : null; }, drag: function (px) { q.x = clamp(M.round(mp.x(px) * 10) / 10, 0, Lb); }, key: function (dx, dy, big) { q.x = clamp(M.round((q.x + (dx || dy) * (big ? 0.5 : 0.1)) * 10) / 10, 0, Lb); } }); });
      forces.forEach(function (f, i) { list.push({ name: 'force ' + (i + 1), pos: function () { return mp ? [mp.X(f.x), mp.Y(0)] : null; }, drag: function (px) { f.x = clamp(M.round(mp.x(px) / (Lb / 40)) * (Lb / 40), 0, Lb); }, key: function (dx, dy, big) { if (dx) f.x = clamp(f.x + dx * Lb / 40 * (big ? 4 : 1), 0, Lb); if (dy) f.angle = f.angle + dy * (big ? 15 : 5); } }); });
      if (pc != null) list.push({ name: 'chosen pivot', pos: function () { return mp ? [mp.X(pc), mp.Y(0) + 26] : null; }, drag: function (px) { pc = clamp(M.round(mp.x(px) / (Lb / 40)) * (Lb / 40), 0, Lb); }, key: function (dx, dy, big) { pc = clamp(pc + (dx || dy) * Lb / 40 * (big ? 4 : 1), 0, Lb); } });
    }
    var hd = F.handles(list, { r: 22 });
    if (F.live && (scene === 'wrench' || scene === 'door') && forces[0]) { F.slider(null, { label: 'Push angle', min: 0, max: 180, step: 1, value: forces[0].angle, unit: '°', d: 0, input: function (v) { forces[0].angle = v; } }); F.slider(null, { label: 'Push strength', min: 0, max: 100, step: 1, value: forces[0].mag, unit: 'N', d: 0, input: function (v) { forces[0].mag = v; } }); }
    if (F.live && scene === 'sign') F.slider(null, { label: 'Cable angle', min: 15, max: 75, step: 1, value: cableAng, unit: '°', d: 0, input: function (v) { cableAng = v; } });
    var A = F.anim({ tmax: undefined, scrub: false, autoplay: true, tick: function (h) { var L0 = allForces(), net = PM.torques(xp, L0).reduce(function (s, q) { return s + q.tau; }, 0), want = (scene === 'seesaw' || scene === 'beam' || scene === 'lever1') && M.abs(net) > 1e-6 ? clamp(net / 400, -1, 1) * 7 : 0; tilt += (want - tilt) * M.min(1, h * 4); return true; }, dt: 0.1 });
    void A;
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c);
      var L0 = allForces(), tq = PM.torques(xp, L0), net = tq.reduce(function (s, q) { return s + q.tau; }, 0), top = scene === 'door' || scene === 'wrench'; if (M.abs(net) < 1e-9 * M.max(1, Lb * L0.reduce(function (s, f) { return s + M.abs(f.mag); }, 0))) net = 0;
      var by = top ? H0 * 0.5 : H0 * (scene === 'sign' ? 0.42 : 0.5), padL = scene === 'sign' || scene === 'rod' ? 40 : 30;
      var wpx = W0 - padL - 74; if (scene === 'sign') wpx = M.min(wpx, (by - 18) / M.tan(cableAng * DEG)); mp = fitMap({ x: padL, y: by - 10, w: wpx, h: 20 }, -Lb * 0.04, Lb * 1.04, -0.1, 0.1, false); var X = mp.X, Y = function () { return by; };
      mp.Y = Y;
      var fmax = M.max.apply(null, L0.map(function (f) { return M.abs(f.mag); }).concat([1])), fl = M.min(H0 * 0.34, 90) / fmax;
      ctx.save(); ctx.translate(X(xp), by); ctx.rotate(-tilt * DEG); ctx.translate(-X(xp), -by);
      if (top) { if (scene === 'door') { hatch(ctx, X(0) - 14, by - 60, 12, 120, k.ground); line(ctx, X(0) - 2, by - 60, X(0) - 2, by + 60, k.ground, 2); block(ctx, X(0), by - 6, X(Lb) - X(0), 12, { fill: k.obj2, color: k.obj2Line, r: 3 }); txt(ctx, 'door (top view)', X(Lb * 0.5), by + 22, { align: 'center', size: 11, color: k.muted }); } else { ctx.save(); rrect(ctx, X(0) - 6, by - 9, X(Lb) - X(0) + 14, 18, 9); ctx.fillStyle = k.metal; ctx.fill(); ctx.restore(); circ(ctx, X(0), by, 20, { color: k.metal, w: 6 }); poly(ctx, [0, 1, 2, 3, 4, 5].map(function (i) { return [X(0) + 9 * M.cos(i * PI / 3), by + 9 * M.sin(i * PI / 3)]; }), { fill: k.ink, close: true }); } }
      else { block(ctx, X(0), by - 7, X(Lb) - X(0), 14, { fill: k.obj2, color: k.obj2Line, r: 3 }); var mstep = Lb <= 5 ? 0.5 : 1; for (var xm = 0; xm <= Lb + 1e-9; xm += mstep) line(ctx, X(xm), by - 7, X(xm), by - 2, k.obj2Line, 1); }
      // masses
      masses.forEach(function (q, i) { var w = 18 + M.sqrt(q.m) * 2.5; if (scene === 'sign') { line(ctx, X(q.x) - 30, by, X(q.x) - 30, by + 20, k.metal, 1.5); line(ctx, X(q.x) + 30, by, X(q.x) + 30, by + 20, k.metal, 1.5); block(ctx, X(q.x) - 44, by + 20, 88, 34, { label: 'OPEN', fill: k.obj, size: 13 }); } else block(ctx, X(q.x) - w / 2, by - 7 - w, w, w, { label: fm(q.m, 0), size: 10.5, r: 4 }); F.tagAt(ctx, 'm' + i, X(q.x), by - 7 - w - 16); });
      ctx.restore();
      // support
      if (!top) { if (scene === 'sign' || scene === 'rod') { hatch(ctx, X(0) - 18, by - 70, 12, 140, k.ground); line(ctx, X(0) - 6, by - 70, X(0) - 6, by + 70, k.ground, 2); circ(ctx, X(0), by, 5, { fill: k.bg, color: k.ink, w: 2 }); } else { poly(ctx, [[X(xp), by + 8], [X(xp) - 16, by + 36], [X(xp) + 16, by + 36]], { fill: k.obj, color: k.objLine, close: true, w: 2 }); ground(ctx, X(xp) - 40, by + 36, 80, k); } }
      if (scene === 'sign') { var hw = X(0) - 6, hy = by - (X(Lb) - X(0)) * M.tan(cableAng * DEG); line(ctx, hw, hy, X(Lb), by, k.metal, 2); arc(ctx, X(Lb), by, 40, PI, PI + cableAng * DEG, k.gold, 1.5); txt(ctx, fm(cableAng, 0) + '°', X(Lb) - 46, by - 14, { size: 11, color: k.gold, align: 'right' }); }
      F.tagAt(ctx, 'pivot', X(xp) + 22, by + 26);
      // forces, lever arms and torques
      L0.forEach(function (f, i) {
        if (f.kind === 'b' && Mb <= 0) return; var a = f.angle * DEG, tl = tilt * DEG, px0 = X(xp) + (X(f.x) - X(xp)) * M.cos(tl), py0 = by - (X(f.x) - X(xp)) * M.sin(tl), ex = px0 + f.mag * fl * M.cos(a), ey = py0 - f.mag * fl * M.sin(a), down = M.sin(a) < 0, col = f.kind === 'cable' ? k.red : f.kind === 'm' || f.kind === 'b' ? k.force : k.accel;
        var sx = down ? px0 : px0, sy = down ? py0 - (f.kind === 'm' ? 0 : 0) : py0; if (f.kind === 'f' && down) { sx = px0 - f.mag * fl * M.cos(a); sy = py0 + f.mag * fl * M.sin(a); ex = px0; ey = py0; }
        if (f.kind === 'f' && !down) { sx = px0; sy = py0; }
        arrow(ctx, sx, sy, ex, ey, { color: col, w: 2.8 });
        var lab = f.kind === 'f' ? f.label : f.kind === 'cable' ? 'T' : f.kind === 'b' ? 'Mg' : 'mg'; txt(ctx, lab + (F.vals ? ' = ' + un(f.mag, 'N', 3) : ''), (sx + ex) / 2 + 8, (sy + ey) / 2 + (down ? 0 : 0), { size: 11.5, color: col, halo: true, weight: 700 });
        if (f.kind === 'f') F.tagAt(ctx, 'f' + f.i, (sx + ex) / 2 - 16, (sy + ey) / 2);
        if (sh.arm && M.abs(M.sin(a)) > 1e-3 && M.abs(f.x - xp) > 1e-6) { // line of action and the lever arm from the pivot
          var ux = M.cos(a), uy = -M.sin(a), Lx = 3000; line(ctx, px0 - ux * Lx, py0 - uy * Lx, px0 + ux * Lx, py0 + uy * Lx, rgba(col, 0.35), 1, [5, 5]);
          var qx = X(xp) - px0, qy = by - py0, t0 = qx * ux + qy * uy, fx = px0 + ux * t0, fy = py0 + uy * t0; line(ctx, X(xp), by, fx, fy, k.gold, 2.2); if (M.abs(M.cos(a)) > 0.05) { var rr = 7; poly(ctx, [[fx - ux * rr, fy - uy * rr], [fx - ux * rr + (X(xp) - fx) / M.hypot(X(xp) - fx, by - fy) * rr, fy - uy * rr + (by - fy) / M.hypot(X(xp) - fx, by - fy) * rr], [fx + (X(xp) - fx) / M.hypot(X(xp) - fx, by - fy) * rr, fy + (by - fy) / M.hypot(X(xp) - fx, by - fy) * rr]], { color: k.gold, w: 1.2 }); }
            if (F.vals) txt(ctx, 'r⊥ = ' + un(tq[i].arm, 'm', 3), (X(xp) + fx) / 2, (by + fy) / 2 + (M.abs(M.cos(a)) > 0.05 ? -10 : 14), { align: 'center', size: 10.5, color: k.gold, halo: true }); F.tagAt(ctx, 'arm' + i, (X(xp) + fx) / 2, (by + fy) / 2 - 22); }
      });
      if (scene === 'rod' || scene === 'sign') { var hgf = hinge(L0), hm = M.hypot(hgf[0], hgf[1]); if (F.on('hinge', true, true) && hm > 1e-6) { arrow(ctx, X(0), by, X(0) + hgf[0] * fl, by - hgf[1] * fl, { color: k.net, w: 3, label: 'hinge' + (F.vals ? ' ' + un(hm, 'N', 3) : '') }); } }
      if (pc != null) { var tqc = PM.torques(pc, L0).reduce(function (s, q) { return s + q.tau; }, 0), Ns = -L0.reduce(function (s, f) { return s + f.mag * M.sin(f.angle * DEG); }, 0); if (scene !== 'sign' && scene !== 'rod') tqc += (xp - pc) * Ns; else { var hg2 = hinge(L0); tqc += (0 - pc) * hg2[1]; } knob(ctx, X(pc), by + 26, k.purple, 7); txt(ctx, 'τ about here = ' + (F.vals ? un(tqc, 'N·m', 3) : '?'), X(pc), by + 46, { align: 'center', size: 11, color: k.purple, halo: true }); }
      if (sh.net) { var gx = W0 - 70, gy = 34; circ(ctx, gx, gy, 24, { color: k.grid, w: 6 }); var sweep = clamp(net / M.max(1, fmax * Lb) * PI, -PI * 0.95, PI * 0.95); if (M.abs(net) > 1e-6) arc(ctx, gx, gy, 24, -PI / 2, -PI / 2 - sweep, M.abs(net) < 1e-6 ? k.green : k.net, 6); txt(ctx, 'net τ', gx, gy - 4, { align: 'center', size: 10.5, color: k.muted }); txt(ctx, F.vals ? nf(net, 3) : '?', gx, gy + 9, { align: 'center', size: 11.5, weight: 800, color: k.ink }); txt(ctx, 'N·m', gx, gy + 34, { align: 'center', size: 10, color: k.muted }); }
      hd.draw(ctx);
      var bal = M.abs(net) < 1e-6 * M.max(1, fmax);
      F.desc(F.o.label || ((scene === 'seesaw' ? 'A seesaw' : 'A beam') + ' with ' + L0.length + ' forces' + (F.quiet ? '.' : '; net torque about the pivot ' + un(net, 'N·m', 3) + (bal ? ' (balanced).' : '.'))));
      var rows = L0.map(function (f, i) { return (f.kind === 'f' ? f.label : f.kind === 'm' ? fm(masses[f.i].m, 0) + ' kg' : f.kind === 'cable' ? 'cable' : 'beam') + ': ' + un(f.mag, 'N', 3) + ' × ' + un(tq[i].arm, 'm', 3) + ' = ' + un(M.abs(tq[i].tau), 'N·m', 3) + (tq[i].tau > 1e-9 ? ' ⟲' : tq[i].tau < -1e-9 ? ' ⟳' : ''); });
      F.read('Torque = force × lever arm (the perpendicular distance from the pivot to the line of the force). ' + rows.join('; ') + '. Net: <b>' + un(net, 'N·m', 3) + '</b>' + (bal ? ', balanced: no turning.' : net > 0 ? ', counterclockwise.' : ', clockwise.') + (scene === 'sign' ? ' The hinge pushes at an angle, not along the beam.' : ''));
      F.stats(tq.map(function (q, i) { return [L0[i].kind === 'f' ? L0[i].label : L0[i].kind === 'm' ? 'weight ' + (L0[i].i + 1) : L0[i].label, un(q.tau, 'N·m', 3)]; }).concat([['net torque', un(net, 'N·m', 3)]]));
    };
    F.now(); return {};
  });
  function ladderScene(F, o, g) {
    var P = { L: num(o.beamLength, 5), th: num(o.angle, 60), M: num(o.beamMass, 15), m: num(o.m, 70), d: num(o.d, 2.5), mu: num(o.mu, 0.4) };
    var c = F.canvas({ aspect: 1.4, narrow: 1.0 });
    if (F.live) { F.slider(null, { label: 'Ladder angle', min: 30, max: 85, step: 1, value: P.th, unit: '°', d: 0, input: function (v) { P.th = v; } }); F.slider(null, { label: 'Person’s distance up the ladder', min: 0, max: P.L, step: 0.1, value: P.d, unit: 'm', d: 1, input: function (v) { P.d = v; } }); }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, a = P.th * DEG, r = PM.ladder(P.L, P.th, P.M, P.m, P.d, P.mu, g); bg(c);
      var s = M.min((W0 - 140) / (P.L * M.cos(a) + 0.5), (H0 - 60) / (P.L * M.sin(a) + 0.4)), wx = W0 * 0.72, gy = H0 - 30, fx = wx - P.L * M.cos(a) * s, ty = gy - P.L * M.sin(a) * s;
      hatch(ctx, wx, 8, 14, gy - 8, k.ground); line(ctx, wx, 8, wx, gy, k.ground, 2); ground(ctx, 10, gy, W0 - 20, k);
      line(ctx, fx, gy, wx, ty, k.obj2Line, 8); line(ctx, fx, gy, wx, ty, k.obj2, 4); arc(ctx, fx, gy, 34, -a, 0, k.gold, 1.5); txt(ctx, fm(P.th, 0) + '°', fx + 40, gy - 10, { size: 11, color: k.gold });
      var px = fx + P.d * M.cos(a) * s, py = gy - P.d * M.sin(a) * s; ball(ctx, px, py - 14, 9, k.acc);
      var fs = 70 / ((P.M + P.m) * g);
      [[fx + P.L / 2 * M.cos(a) * s, gy - P.L / 2 * M.sin(a) * s, 0, P.M * g, 'Mg'], [px, py, 0, P.m * g, 'mg']].forEach(function (q) { arrow(ctx, q[0], q[1], q[0], q[1] + q[3] * fs, { color: k.force, w: 2.6 }); txt(ctx, q[4] + (F.vals ? ' ' + un(q[3], 'N', 3) : ''), q[0] + 6, q[1] + q[3] * fs - 6, { size: 11, color: k.force, halo: true }); });
      arrow(ctx, fx, gy, fx, gy - r.Nf * fs, { color: k.force, w: 2.8 }); symTxt(ctx, ['F', 'N,floor'], fx - 6, gy - r.Nf * fs - 8, { align: 'right', color: k.force, size: 12.5, extra: F.vals ? ' ' + un(r.Nf, 'N', 3) : '' });
      arrow(ctx, wx, ty, wx - r.Nw * fs, ty, { color: k.force, w: 2.8 }); symTxt(ctx, ['F', 'N,wall'], wx - r.Nw * fs - 6, ty - 12, { align: 'right', color: k.force, size: 12.5, extra: F.vals ? ' ' + un(r.Nw, 'N', 3) : '' });
      arrow(ctx, fx, gy - 4, fx + r.f * fs, gy - 4, { color: r.slips ? k.red : k.green, w: 2.8 }); symTxt(ctx, ['f', 's'], fx + r.f * fs + 4, gy + 12, { color: r.slips ? k.red : k.green, size: 12.5, extra: F.vals ? ' needed ' + un(r.f, 'N', 3) : '' });
      F.desc('A ' + fm(P.L, 1) + ' m ladder at ' + fm(P.th, 0) + '° against a frictionless wall with a person ' + fm(P.d, 1) + ' m up.' + (F.quiet ? '' : ' Friction needed at the floor: ' + un(r.f, 'N', 3) + (r.slips ? '; more than the floor can give, so it slips.' : '.')));
      F.read('Torques about the foot: the wall force balances the weights\' torques, so N<sub>wall</sub> = <b>' + un(r.Nw, 'N', 3) + '</b>. Floor friction must equal it: <b>' + un(r.f, 'N', 3) + '</b>; the most static friction can give is μN = ' + un(P.mu * r.Nf, 'N', 3) + (r.slips ? ' — <b>it slips</b>. Climbing higher or a shallower angle makes this worse.' : ' — it holds.'));
      F.stats([['wall force', un(r.Nw, 'N', 3)], ['floor normal', un(r.Nf, 'N', 3)], ['friction needed', un(r.f, 'N', 3)], ['max friction μN', un(P.mu * r.Nf, 'N', 3)]]);
    };
    F.now(); return {};
  }
  function machineScene(F, o, g, scene, sh) {
    var load = num(o.load, 400), n = M.round(num(o.strands, 4)), Lr = num(o.rampLength, 5), hr = num(o.rampHeight, 1), u = 0;
    var c = F.canvas({ aspect: 1.6, narrow: 1.0 });
    if (F.live) { if (scene === 'pulley-block') F.slider(null, { label: 'Strands holding the load', min: 1, max: 6, step: 1, value: n, d: 0, input: function (v) { n = v; } }); else F.slider(null, { label: 'Ramp length', min: 1.5, max: 10, step: 0.5, value: Lr, unit: 'm', d: 1, input: function (v) { Lr = v; } }); }
    var A = F.anim({ tmax: 1, loop: true, rate: 0.25, autoplay: true, dt: 0.05, tStatic: 0.5 });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c); u = 0.5 - 0.5 * M.cos(A.t * TAU);
      var effort, din, dout;
      if (scene === 'pulley-block') {
        effort = load / n; dout = 0.5; din = dout * n; var cx0 = W0 * 0.4, top = 30, ly = H0 - 60 - u * 40;
        hatch(ctx, cx0 - 90, 4, 180, 10, k.ground); line(ctx, cx0 - 90, 14, cx0 + 90, 14, k.ground, 2);
        var sp2 = M.min(16, 120 / n); for (var i = 0; i < n; i++) { var x = cx0 - (n - 1) * sp2 / 2 + i * sp2; line(ctx, x, top, x, ly - 22, k.metal, 2); }
        rrect(ctx, cx0 - (n * sp2) / 2 - 8, top - 8, n * sp2 + 16, 18, 6); ctx.fillStyle = k.obj2; ctx.fill(); rrect(ctx, cx0 - (n * sp2) / 2 - 8, ly - 30, n * sp2 + 16, 16, 6); ctx.fill();
        line(ctx, cx0 + (n * sp2) / 2 + 8, top, W0 * 0.78, top, k.metal, 2); line(ctx, W0 * 0.78, top, W0 * 0.78, H0 * 0.55 + u * 40 * n * 0.3, k.metal, 2);
        block(ctx, cx0 - 34, ly - 14, 68, 46, { label: un(load, 'N'), size: 12 }); for (i = 0; i < n; i++) F.tagAt(ctx, 'f' + i, -100, -100);
        arrow(ctx, W0 * 0.78, H0 * 0.55 + u * 12 * n, W0 * 0.78, H0 * 0.55 + u * 12 * n + 50, { color: k.accel, w: 3, label: 'effort' + (F.vals ? ' ' + un(effort, 'N', 3) : '') });
        txt(ctx, n + ' strands hold the load', cx0, H0 - 10, { align: 'center', size: 11.5, color: k.muted });
      } else {
        effort = load * hr / Lr; din = Lr; dout = hr; var s = M.min((W0 - 80) / Lr, (H0 - 70) / M.max(hr, 0.5) * 0.8, 120), x0 = 40, y0 = H0 - 30, a = M.atan2(hr, Math.sqrt(M.max(0.01, Lr * Lr - hr * hr)));
        var run = M.sqrt(M.max(0.01, Lr * Lr - hr * hr)) * s; poly(ctx, [[x0, y0], [x0 + run, y0], [x0 + run, y0 - hr * s]], { fill: k.obj2, color: k.obj2Line, close: true, w: 2 }); ground(ctx, 10, y0, W0 - 20, k);
        var bx = x0 + run * u, byy = y0 - hr * s * u; ctx.save(); ctx.translate(bx, byy); ctx.rotate(-a); block(ctx, -16, -26, 32, 26, { r: 4 }); ctx.restore();
        arrow(ctx, bx - 20 * M.cos(a) - 30, byy + 20 * M.sin(a) - 13, bx - 30 + 26, byy - 13, { color: k.accel, w: 3, label: F.vals ? un(effort, 'N', 3) : 'effort' });
        txt(ctx, 'length ' + un(Lr, 'm', 2), x0 + run / 2 - 20, y0 - hr * s / 2 - 14, { size: 11.5, color: k.obj2Line, align: 'right' }); txt(ctx, 'height ' + un(hr, 'm', 2), x0 + run + 8, y0 - hr * s / 2, { size: 11.5, color: k.obj2Line });
      }
      var Win = effort * din, Wout = load * dout;
      F.desc((scene === 'ramp' ? 'Pushing a ' + un(load, 'N') + ' box up a ' + un(Lr, 'm') + ' ramp to ' + un(hr, 'm') : 'Lifting ' + un(load, 'N') + ' with ' + n + ' strands') + (F.quiet ? '.' : ': effort ' + un(effort, 'N', 3) + ', mechanical advantage ' + nf(load / effort, 3) + '.'));
      F.read('Mechanical advantage = load ÷ effort = <b>' + nf(load / effort, 3) + '</b>. But the effort moves ' + un(din, 'm', 3) + ' while the load rises ' + un(dout, 'm', 3) + ': work in ' + un(Win, 'J', 3) + ' = work out ' + un(Wout, 'J', 3) + '. A machine trades force for distance; it never reduces the work.');
      F.stats([['effort', un(effort, 'N', 3)], ['load', un(load, 'N', 3)], ['work in', un(Win, 'J', 3)], ['work out', un(Wout, 'J', 3)]]);
      void sh;
    };
    F.now(); return {};
  }

  // ===================================================================================================
  // ph-rotation
  var SHAPES = { hoop: { c: 1, n: 'hoop' }, disk: { c: 0.5, n: 'solid disk' }, sphere: { c: 0.4, n: 'solid sphere' }, shell: { c: 2 / 3, n: 'hollow sphere' } };
  /* PM.rollA(shape, theta, g): acceleration of a shape rolling without slipping down a ramp: g sin θ / (1 + I/(mR²)) */
  PM.rollA = function (shape, th, g) { return (g || 9.8) * M.sin(th * DEG) / (1 + SHAPES[shape].c); };
  /* PM.skid(v0, mu, g): a solid ball launched sliding with no spin: time to pure rolling, final speed (5/7 v0) and energy lost per kg */
  PM.skid = function (v0, mu, g) { g = g || 9.8; var t = 2 * v0 / (7 * mu * g), vf = v0 - mu * g * t; return { t: t, vf: vf, lostPerKg: 0.5 * v0 * v0 - (0.5 * vf * vf + 0.5 * 0.4 * vf * vf) }; };
  R('ph-rotation', function (el, o) {
    var mode = pick(o.mode, ['wheel', 'inertia', 'slices', 'race', 'skater', 'skid', 'gyro', 'pulley'], 'wheel');
    var F = frame(el, o, { wheel: 'A spinning wheel', inertia: 'Rotational inertia of beads on a rod', slices: 'Slicing a rod to find its center of mass and rotational inertia', race: 'A rolling race down a ramp', skater: 'A spinning skater pulling in her arms', skid: 'A bowling ball that skids, then rolls', gyro: 'A precessing gyroscope', pulley: 'A heavy pulley turned by a hanging mass' }[mode]);
    var g = num(o.g, 9.8), P = { omega: num(o.omega0, 1.5), angle: num(o.angle, 15), L: num(o.L, 1), m: num(o.m, 1), R: num(o.R, 0.2), M: num(o.M, 2), v0: num(o.v0, 6), mu: num(o.mu, 0.2), rIn: num(o.rIn, 0.2), rOut: num(o.rOut, 0.8) };
    var c = F.canvas({ aspect: mode === 'race' ? 1.55 : mode === 'slices' ? 1.9 : 1.6, narrow: mode === 'race' ? 0.85 : 1.05 });
    var S = { th: 0, t: 0, rr: P.rOut, w: 0 }, desc = '', read = '', st = [];
    var masses = arr(o.masses || [1, 1]).map(num), radii = arr(o.radii || [0.6, 0.6]).map(num);
    var shapes = arr(o.shapes || ['hoop', 'disk', 'sphere', 'shell']).filter(function (q) { return SHAPES[q]; });
    var dens = cx(o.density || '1', ['x']);
    var tmax = mode === 'race' ? M.sqrt(2 * 2 / PM.rollA('hoop', P.angle, g)) * 1.05 : mode === 'skid' ? PM.skid(P.v0, P.mu, g).t * 2.2 : undefined;
    var A = mode === 'slices' || mode === 'inertia' ? { t: 0 } : F.anim({ tmax: tmax, scrub: !!tmax, autoplay: mode !== 'race' && mode !== 'skid' ? true : !!o.play, loop: false, dt: 0.05, tick: tmax ? null : function (h) { S.t += h; if (mode === 'skater') { S.w = Lsk() / Isk(); } S.th += (mode === 'skater' ? S.w : mode === 'gyro' ? 0.6 : mode === 'pulley' ? 1 : P.omega) * h; return true; } });
    function Isk() { return 1.0 + 2 * 3 * S.rr * S.rr; } var L0sk = (1.0 + 2 * 3 * P.rOut * P.rOut) * P.omega; function Lsk() { return L0sk; }
    var list = [];
    if (mode === 'inertia' && F.live) masses.forEach(function (m, i) { list.push({ name: 'bead ' + (i + 1), pos: function () { return S.map ? [S.map(radii[i] * (i % 2 ? 1 : -1)), S.cy] : null; }, drag: function (px) { radii[i] = clamp(M.round(M.abs(S.inv(px)) * 20) / 20, 0, P.L / 2); }, key: function (dx, dy, big) { radii[i] = clamp(radii[i] + (dx || dy) * (i % 2 ? 1 : -1) * (big ? 0.1 : 0.05), 0, P.L / 2); } }); });
    var hd = F.handles(list, { r: 22 });
    if (F.live) {
      if (mode === 'wheel') F.slider(null, { label: 'Angular speed ω', min: 0, max: 4, step: 0.1, value: P.omega, unit: 'rad/s', d: 1, input: function (v) { P.omega = v; } });
      if (mode === 'skater') F.slider(null, { label: 'Arms (weights) out to', min: P.rIn, max: P.rOut, step: 0.01, value: S.rr, unit: 'm', d: 2, input: function (v) { S.rr = v; } });
      if (mode === 'race') F.slider(null, { label: 'Ramp angle', min: 5, max: 40, step: 1, value: P.angle, unit: '°', d: 0, input: function (v) { P.angle = v; } });
    }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, t = A.t; bg(c);
      if (mode === 'wheel') {
        var R0 = M.min(W0 * 0.32, H0 * 0.4), cx0 = W0 * (W0 > 520 ? 0.36 : 0.5), cy0 = H0 * 0.5, th = S.th, rs = [0.25, 0.5, 0.75, 1];
        circ(ctx, cx0, cy0, R0, { fill: k.obj, color: k.objLine, w: 3 }); for (var i = 0; i < 6; i++) { var a = th + i * PI / 3; line(ctx, cx0, cy0, cx0 + R0 * M.cos(a), cy0 - R0 * M.sin(a), rgba(k.objLine, 0.5), 1.5); }
        arc(ctx, cx0, cy0, R0 + 10, 0, -(th % TAU), k.gold, 3); circ(ctx, cx0, cy0, 4, { fill: k.ink });
        rs.forEach(function (fr, j) { var px = cx0 + R0 * fr * M.cos(th), py = cy0 - R0 * fr * M.sin(th), v = fr * P.omega; circ(ctx, px, py, 5.5, { fill: [k.red, k.purple, k.teal, k.orange][j] }); if (v > 1e-6) arrow(ctx, px, py, px - M.sin(th) * v * R0 * 0.45, py - M.cos(th) * v * R0 * 0.45, { color: k.vel, w: 2.4 }); F.tagAt(ctx, 'pt' + j, px + 12, py + 12); });
        var rr = W0 > 520 ? { x: W0 * 0.68, y: 30, w: W0 * 0.28, h: H0 - 70 } : null;
        if (rr) { var G = GP(ctx, rr, { xmin: 0, xmax: 1, ymin: 0, ymax: M.max(1, 4) * 1, xlab: 'r (m)', ylab: 'v (m/s)', compact: true }).frame(); G.plot(function (x) { return x * P.omega; }, k.vel, 2.4); rs.forEach(function (fr, j) { G.dot(fr, fr * P.omega, [k.red, k.purple, k.teal, k.orange][j], 4.5); }); }
        var thw = th % TAU;
        desc = 'A wheel of radius 1 m spinning at ' + un(P.omega, 'rad/s', 2) + '; points at 0.25, 0.5, 0.75 and 1 m from the center.';
        read = 'Every point turns through the same angle (θ = <b>' + fm(thw, 2) + ' rad</b>, same ω = <b>' + un(P.omega, 'rad/s', 2) + '</b>), but v = rω: the rim point moves <b>' + un(P.omega, 'm/s', 2) + '</b>, four times as fast as the point at 0.25 m. Arc length s = rθ.';
        st = [['ω (all points)', un(P.omega, 'rad/s', 3)], ['v at r = 1 m', un(P.omega, 'm/s', 3)], ['v at r = 0.25 m', un(P.omega * 0.25, 'm/s', 3)], ['angle θ', fd(thw, 2, 'rad')]];
      } else if (mode === 'inertia') {
        var cy = H0 * 0.42, half = M.min(W0 * 0.42, 300), sc = half / (P.L / 2), cx1 = W0 / 2; S.cy = cy; S.map = function (x) { return cx1 + x * sc; }; S.inv = function (px) { return (px - cx1) / sc; };
        ctx.save(); ctx.translate(cx1, cy); ctx.scale(1, 1); rrect(ctx, -half, -4, half * 2, 8, 4); ctx.fillStyle = k.metal; ctx.fill(); ctx.restore(); line(ctx, cx1, cy - 60, cx1, cy + 60, k.gold, 1.5, [6, 4]); txt(ctx, 'axis', cx1 + 6, cy - 56, { size: 11, color: k.gold });
        var I = 0; masses.forEach(function (m, i) { var x = radii[i] * (i % 2 ? 1 : -1); I += m * radii[i] * radii[i]; circ(ctx, S.map(x), cy, 10 + m * 3, { fill: k.obj, color: k.objLine, w: 2.5 }); txt(ctx, fm(m, 1), S.map(x), cy, { align: 'center', size: 10.5, weight: 700 }); if (F.vals) txt(ctx, 'r = ' + un(radii[i], 'm', 2), S.map(x), cy + 28, { align: 'center', size: 11, color: k.muted }); F.tagAt(ctx, 'pt' + i, S.map(x), cy - 30); });
        var bw = (W0 - 60) * clamp(I / (masses.reduce(function (s, m) { return s + m; }, 0) * P.L * P.L / 4), 0, 1); rrect(ctx, 30, H0 - 50, W0 - 60, 14, 7); ctx.fillStyle = k.grid; ctx.fill(); rrect(ctx, 30, H0 - 50, M.max(4, bw), 14, 7); ctx.fillStyle = k.purple; ctx.fill(); txt(ctx, 'I = Σmr²' + (F.vals ? ' = ' + un(I, 'kg·m²', 3) : ''), 30, H0 - 62, { size: 12, weight: 700, color: k.purple });
        hd.draw(ctx);
        desc = 'Beads of ' + masses.map(function (m) { return fm(m, 1) + ' kg'; }).join(' and ') + ' on a light rod at ' + radii.map(function (r) { return fm(r, 2) + ' m'; }).join(' and ') + ' from the axis.';
        read = 'I = Σmr² = <b>' + un(I, 'kg·m²', 3) + '</b>. The same mass counts four times as much at twice the distance: where the mass sits matters, not only how much there is.';
        st = [['I', un(I, 'kg·m²', 3)], ['total mass', un(masses.reduce(function (s, m) { return s + m; }, 0), 'kg', 3)]];
      } else if (mode === 'slices') {
        var L = P.L, n = 12, r0 = { x: 40, y: 50, w: W0 - 80, h: 36 }, mx = 0, tot = 0, xm = 0, Ic = 0, Ie = 0, N2 = 2000;
        for (var j2 = 0; j2 < N2; j2++) { var x2 = (j2 + 0.5) / N2 * L, dm = dens(x2) * L / N2; tot += dm; xm += x2 * dm; Ie += x2 * x2 * dm; } var xc = xm / tot; Ic = Ie - tot * xc * xc;
        for (var j3 = 0; j3 <= 40; j3++) mx = M.max(mx, dens(j3 / 40 * L));
        for (j2 = 0; j2 < n; j2++) { var xa = j2 / n * L, d0 = dens((j2 + 0.5) / n * L); rrect(ctx, r0.x + j2 / n * r0.w + 1, r0.y, r0.w / n - 2, r0.h, 3); ctx.fillStyle = rgba(k.acc, 0.15 + 0.75 * d0 / M.max(1e-9, mx)); ctx.fill(); void xa; }
        txt(ctx, 'darker = denser; each slice has mass dm = λ(x) dx', r0.x, r0.y - 14, { size: 11.5, color: k.muted });
        var cxp = r0.x + xc / L * r0.w; poly(ctx, [[cxp, r0.y + r0.h + 4], [cxp - 7, r0.y + r0.h + 16], [cxp + 7, r0.y + r0.h + 16]], { fill: k.red, close: true }); txt(ctx, 'center of mass' + (F.vals ? ' x = ' + un(xc, 'm', 3) : ''), cxp, r0.y + r0.h + 28, { align: 'center', size: 11.5, color: k.red, halo: true }); F.tagAt(ctx, 'cm', cxp + 16, r0.y - 10);
        var gr = { x: 50, y: r0.y + r0.h + 48, w: W0 - 70, h: H0 - r0.y - r0.h - 70 }, G2 = GP(ctx, gr, { xmin: 0, xmax: L, ymin: 0, ymax: mx * 1.2 || 1, xlab: 'x (m)', ylab: 'λ (kg/m)', compact: true }).frame(); G2.fill(dens, 0, L, rgba(k.acc, 0.25)); G2.plot(dens, k.acc, 2.4);
        desc = 'A rod of length ' + un(L, 'm') + ' with linear density λ(x) = ' + (o.density || '1') + ' kg/m, cut into slices.';
        read = 'M = ∫λ dx = <b>' + un(tot, 'kg', 3) + '</b>; x<sub>cm</sub> = ∫xλ dx / M = <b>' + un(xc, 'm', 3) + '</b>; I about the left end = ∫x²λ dx = <b>' + un(Ie, 'kg·m²', 3) + '</b>; about the center of mass = <b>' + un(Ic, 'kg·m²', 3) + '</b> (parallel axis: I<sub>end</sub> = I<sub>cm</sub> + Md²).';
        st = [['mass', un(tot, 'kg', 3)], ['x cm', un(xc, 'm', 3)], ['I (end)', un(Ie, 'kg·m²', 3)], ['I (cm)', un(Ic, 'kg·m²', 3)]];
      } else if (mode === 'race') {
        var a0 = P.angle * DEG, Lr = 2, lanes = shapes.length, lg = 40, cols = { hoop: k.red, disk: k.blue, sphere: k.green, shell: k.purple }, xL = 120, xR = W0 - 30, drop = M.min((xR - xL) * M.tan(a0), H0 - 30 - lanes * lg), run = drop / M.tan(a0), sPx = run / M.cos(a0) / Lr; xR = xL + run;
        shapes.forEach(function (sp, i) {
          var y0 = 22 + i * lg, acc = PM.rollA(sp, P.angle, g), d = M.min(Lr, 0.5 * acc * t * t), R1 = 11;
          line(ctx, xL, y0 + R1, xR, y0 + R1 + drop, cols[sp], 2); line(ctx, xR, y0 + R1 + drop - 8, xR, y0 + R1 + drop + 8, k.ink, 2);
          var bx = xL + d * sPx * M.cos(a0) + R1 * M.sin(a0), ccy = y0 + R1 + d * sPx * M.sin(a0) - R1 * M.cos(a0);
          var ang = d * sPx / R1; if (sp === 'hoop' || sp === 'shell') circ(ctx, bx, ccy, R1, { color: cols[sp], w: 3.5, fill: sp === 'shell' ? rgba(cols[sp], 0.18) : null }); else circ(ctx, bx, ccy, R1, { fill: cols[sp] }); line(ctx, bx, ccy, bx + R1 * M.cos(ang), ccy + R1 * M.sin(ang), sp === 'hoop' ? cols[sp] : k.bg, 2);
          txt(ctx, SHAPES[sp].n, xL - 8, y0 + R1, { align: 'right', size: 11.5, weight: 700, color: cols[sp] }); F.tagAt(ctx, sp, bx, ccy - 22);
          if (d >= Lr - 1e-9) txt(ctx, F.vals ? fm(M.sqrt(2 * Lr / acc), 2) + ' s' : 'done', xR - 8, y0 + R1 + drop - 16, { align: 'right', size: 11, color: cols[sp], weight: 700, halo: true });
        });
        txt(ctx, 'each ramp ' + un(Lr, 'm') + ' long, ' + fm(P.angle, 0) + '°', xL, H0 - 10, { size: 11, color: k.muted });
        desc = 'A race down a ' + fm(P.angle, 0) + '° ramp between a ' + shapes.map(function (q) { return SHAPES[q].n; }).join(', ') + '.';
        var order = shapes.slice().sort(function (a, b) { return SHAPES[a].c - SHAPES[b].c; });
        read = 'a = g sin θ / (1 + I/mR²). The winner is the shape with the least I/mR²: ' + order.map(function (q) { return SHAPES[q].n + ' (' + fm(SHAPES[q].c, 3) + ')'; }).join(', ') + '. Mass and radius cancel: a big heavy disk ties a small light one. Share of kinetic energy in spinning: ' + order.map(function (q) { return SHAPES[q].n + ' ' + fm(100 * SHAPES[q].c / (1 + SHAPES[q].c), 0) + '%'; }).join(', ') + '.';
        st = shapes.map(function (q) { return [SHAPES[q].n, un(PM.rollA(q, P.angle, g), 'm/s²', 3)]; });
      } else if (mode === 'skater') {
        var cx2 = W0 * 0.38, cy2 = H0 * 0.55, I2 = Isk(), w2 = Lsk() / I2, K2 = 0.5 * I2 * w2 * w2, rpx = 40 + S.rr * 140;
        ctx.save(); ctx.translate(cx2, cy2); ctx.scale(1, 0.35); circ(ctx, 0, 0, 170, { color: k.grid, w: 4 }); ctx.restore();
        circ(ctx, cx2, cy2 - 92, 13, { fill: k.obj, color: k.objLine, w: 2.5 }); line(ctx, cx2, cy2 - 78, cx2, cy2 - 10, k.objLine, 5); line(ctx, cx2, cy2 - 10, cx2 - 10, cy2 + 40, k.objLine, 4); line(ctx, cx2, cy2 - 10, cx2 + 10, cy2 + 40, k.objLine, 4);
        var ca = M.cos(S.th); line(ctx, cx2 - rpx * ca, cy2 - 60, cx2 + rpx * ca, cy2 - 60, k.objLine, 4); circ(ctx, cx2 - rpx * ca, cy2 - 60, 8, { fill: k.gold }); circ(ctx, cx2 + rpx * ca, cy2 - 60, 8, { fill: k.gold });
        var bx2 = W0 > 520 ? W0 * 0.7 : W0 * 0.6, bw2 = W0 > 520 ? W0 * 0.25 : W0 * 0.36; [['I', I2, Isk.max || (1 + 6 * P.rOut * P.rOut), k.purple, 'kg·m²'], ['ω', w2, L0sk / (1 + 6 * P.rIn * P.rIn), k.vel, 'rad/s'], ['L = Iω', Lsk(), Lsk() * 1.2, k.mom, 'kg·m²/s'], ['K = ½Iω²', K2, 0.5 * L0sk * L0sk / (1 + 6 * P.rIn * P.rIn), k.eK, 'J']].forEach(function (q, i) { var y = 30 + i * 46; txt(ctx, q[0] + (F.vals && W0 > 520 ? ' = ' + un(q[1], q[4], 3) : ''), bx2, y, { size: 12, weight: 700, color: q[3] }); rrect(ctx, bx2, y + 9, bw2, 10, 5); ctx.fillStyle = k.grid; ctx.fill(); rrect(ctx, bx2, y + 9, bw2 * clamp(q[1] / q[2], 0, 1), 10, 5); ctx.fillStyle = q[3]; ctx.fill(); });
        desc = 'A skater spinning with weights held ' + fm(S.rr, 2) + ' m from the axis.';
        read = 'No outside torque, so L = Iω stays <b>' + un(Lsk(), 'kg·m²/s', 3) + '</b>. Pulling the weights in lowers I, so ω rises. Kinetic energy ½Iω² = L²/2I <b>goes up</b> (' + un(K2, 'J', 3) + ' now): her arms do work pulling the weights inward.';
        st = [['I', un(I2, 'kg·m²', 3)], ['ω', un(w2, 'rad/s', 3)], ['L', un(Lsk(), 'kg·m²/s', 3)], ['K', un(K2, 'J', 3)]];
      } else if (mode === 'skid') {
        var sk = PM.skid(P.v0, P.mu, g), tt = M.min(t, sk.t), v = P.v0 - P.mu * g * tt, w3 = 2.5 * P.mu * g * tt / P.R, xpos = P.v0 * tt - 0.5 * P.mu * g * tt * tt + (t > sk.t ? sk.vf * (t - sk.t) : 0), Rp = 16;
        var span = P.v0 * sk.t * 2.2, gy3 = H0 * 0.34, sx3 = (W0 - 60) / span; ground(ctx, 10, gy3, W0 - 20, k); var bx3 = 30 + xpos * sx3;
        var rot = (t > sk.t ? 2.5 * P.mu * g * sk.t * sk.t / 2 / P.R + sk.vf / P.R * (t - sk.t) : 2.5 * P.mu * g * tt * tt / 2 / P.R); ball(ctx, bx3, gy3 - Rp, Rp, k.acc); line(ctx, bx3, gy3 - Rp, bx3 + Rp * M.cos(rot), gy3 - Rp + Rp * M.sin(rot), '#ffffff', 2.5);
        if (t < sk.t) arrow(ctx, bx3, gy3, bx3 - 30, gy3, { color: k.red, w: 2.6, label: 'kinetic friction' });
        var gr3 = { x: 50, y: gy3 + 34, w: W0 - 70, h: H0 - gy3 - 58 }, G3 = GP(ctx, gr3, { xmin: 0, xmax: sk.t * 2.2, ymin: 0, ymax: P.v0 * 1.1, xlab: 't (s)', ylab: 'speed (m/s)', compact: true }).frame();
        G3.plot(function (x) { return x < sk.t ? P.v0 - P.mu * g * x : sk.vf; }, k.vel, 2.4); G3.plot(function (x) { return x < sk.t ? 2.5 * P.mu * g * x : sk.vf; }, k.purple, 2.2, [6, 4]); G3.vline(t, k.gold, [4, 3]); txt(ctx, 'v', G3.X(sk.t * 0.3), G3.Y(P.v0 * 0.92), { size: 12, color: k.vel, weight: 700 }); txt(ctx, 'Rω', G3.X(sk.t * 0.3), G3.Y(2.5 * P.mu * g * sk.t * 0.3) + 12, { size: 12, color: k.purple, weight: 700 });
        desc = 'A solid ball launched at ' + un(P.v0, 'm/s') + ' with no spin on a lane with μk = ' + fm(P.mu, 2) + '.';
        read = 'While it skids, kinetic friction slows the center and spins the ball up. When v = Rω (after <b>' + un(sk.t, 's', 3) + '</b>) it rolls at <b>' + un(sk.vf, 'm/s', 3) + '</b> = 5/7 of v₀, and friction stops doing work: a rolling ball loses no energy to friction. Energy lost while skidding: ' + un(sk.lostPerKg * P.m, 'J', 3) + ' for a ' + fm(P.m, 1) + ' kg ball.';
        st = [['v', un(t < sk.t ? v : sk.vf, 'm/s', 3)], ['Rω', un(t < sk.t ? w3 * P.R : sk.vf, 'm/s', 3)], ['rolling after', un(sk.t, 's', 3)]];
      } else if (mode === 'gyro') {
        var cx4 = W0 * 0.45, cy4 = H0 * 0.55, ph = S.th, armL = M.min(W0, H0) * 0.32, ex = cx4 + armL * M.cos(ph), ey = cy4 + armL * 0.35 * M.sin(ph);
        line(ctx, cx4, cy4, cx4, H0 - 20, k.metal, 4); poly(ctx, [[cx4 - 30, H0 - 16], [cx4 + 30, H0 - 16], [cx4, H0 - 30]], { fill: k.metal, close: true });
        line(ctx, cx4, cy4, ex, ey, k.objLine, 3); ctx.save(); ctx.translate(ex, ey); ctx.rotate(ph * 0.0); ctx.scale(M.abs(M.sin(ph)) * 0.35 + 0.08, 1); circ(ctx, 0, 0, 34, { fill: rgba(k.acc, 0.25), color: k.acc, w: 4 }); ctx.restore();
        arrow(ctx, cx4, cy4, cx4 + (armL + 50) * M.cos(ph), cy4 + (armL + 50) * 0.35 * M.sin(ph), { color: k.mom, w: 3, label: 'L' }); arrow(ctx, cx4, cy4, cx4 - 60 * M.sin(ph), cy4 + 60 * 0.35 * M.cos(ph), { color: k.force, w: 3, label: 'τ' }); arrow(ctx, ex, ey + 8, ex, ey + 60, { color: k.force, w: 2.4, label: 'mg' });
        var Ig = 0.5 * P.M * P.R * P.R, wsp = 60, Om = P.M * g * 0.15 / (Ig * wsp);
        desc = 'A spinning wheel on the end of an axle supported at one end; it swings around (precesses) instead of falling.';
        read = 'Gravity\'s torque τ = mgr points sideways, so it changes the direction of L, not its size: the axle sweeps around at Ω = τ/L = <b>' + un(Om, 'rad/s', 3) + '</b> (for a ' + fm(P.M, 1) + ' kg wheel spinning at ' + wsp + ' rad/s). The faster the spin, the slower the precession.';
        st = [['spin L', un(Ig * wsp, 'kg·m²/s', 3)], ['torque', un(P.M * g * 0.15, 'N·m', 3)], ['precession Ω', un(Om, 'rad/s', 3)]];
      } else { // pulley
        var Mp = P.M, mh = P.m, Rp2 = P.R, Ip = 0.5 * Mp * Rp2 * Rp2, a5 = mh * g / (mh + Ip / (Rp2 * Rp2)), T5 = mh * (g - a5), cx5 = W0 * 0.4, cy5 = 70, Rpx = 46;
        hatch(ctx, cx5 - 60, 4, 120, 10, k.ground); line(ctx, cx5, 14, cx5, cy5, k.metal, 3); ctx.save(); ctx.translate(cx5, cy5); ctx.rotate(S.th); circ(ctx, 0, 0, Rpx, { fill: k.obj2, color: k.obj2Line, w: 3 }); line(ctx, -Rpx, 0, Rpx, 0, k.obj2Line, 2); line(ctx, 0, -Rpx, 0, Rpx, k.obj2Line, 2); ctx.restore();
        var drop = ((0.5 * a5 * (S.t % 2) * (S.t % 2)) * 40) % (H0 - 160); line(ctx, cx5 + Rpx, cy5, cx5 + Rpx, cy5 + 60 + drop, k.metal, 2); block(ctx, cx5 + Rpx - 20, cy5 + 60 + drop, 40, 34, { label: fm(mh, 1) + ' kg', size: 10.5 });
        arrow(ctx, cx5 + Rpx + 30, cy5 + 77 + drop, cx5 + Rpx + 30, cy5 + 77 + drop - 40 * T5 / (mh * g), { color: k.force, w: 2.6, label: 'T' }); arrow(ctx, cx5 + Rpx + 30, cy5 + 77 + drop, cx5 + Rpx + 30, cy5 + 77 + drop + 40, { color: k.force, w: 2.6, label: 'mg' });
        desc = 'A ' + fm(mh, 1) + ' kg mass hangs from a cord wrapped around a ' + fm(Mp, 1) + ' kg pulley (a uniform disk) of radius ' + un(Rp2, 'm') + '.';
        read = 'The pulley needs a torque to spin up, so the tension is less than mg: a = mg/(m + I/R²) = <b>' + un(a5, 'm/s²', 3) + '</b>, α = a/R = <b>' + un(a5 / Rp2, 'rad/s²', 3) + '</b>, T = <b>' + un(T5, 'N', 3) + '</b>.';
        st = [['a', un(a5, 'm/s²', 3)], ['α', un(a5 / Rp2, 'rad/s²', 3)], ['T', un(T5, 'N', 3)], ['mg', un(mh * g, 'N', 3)]];
        S.th = S.t * 0 + S.th;
      }
      F.desc(desc + (F.quiet ? '' : ' ' + read.replace(/<[^>]+>/g, ''))); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-oscillator
  /* PM.pendulumPeriod(L, theta0, g): the exact period, 4√(L/g)·K(sin(θ₀/2)), by the arithmetic–geometric mean */
  PM.pendulumPeriod = function (L, th0, g) { g = g || 9.8; var kk = M.sin(th0 * DEG / 2), a = 1, b = M.sqrt(1 - kk * kk); for (var i = 0; i < 30; i++) { var a2 = (a + b) / 2; b = M.sqrt(a * b); a = a2; } return 2 * PI * M.sqrt(L / g) / a; };
  /* PM.drivenAmp(F0, m, k, b, w): steady-state amplitude of a driven, damped oscillator */
  PM.drivenAmp = function (F0, m, k, b, w) { var w0 = M.sqrt(k / m); return F0 / m / M.sqrt(M.pow(w0 * w0 - w * w, 2) + M.pow(b * w / m, 2)); };
  R('ph-oscillator', function (el, o) {
    var type = pick(o.type, ['spring', 'vertical-spring', 'pendulum', 'physical'], 'spring');
    var F = frame(el, o, { spring: 'A mass on a spring', 'vertical-spring': 'A mass hanging on a spring', pendulum: 'A simple pendulum', physical: 'A swinging rod (physical pendulum)' }[type]);
    var g = num(o.g, 9.8), P = { m: num(o.m, 1), k: num(o.k, 16), L: num(o.L, 1), A: num(o.A, 0.2), th0: num(o.theta0, 15), b: num(o.b, 0) }, drive = o.drive ? { F0: num(o.drive.F0, 2), w: num(o.drive.w, 3) } : null;
    var cmp = o.compare ? Object.assign({}, P, { m: num(o.compare.m, P.m), k: num(o.compare.k, P.k), L: num(o.compare.L, P.L), A: num(o.compare.A, P.A), th0: num(o.compare.theta0, P.th0) }) : null;
    var traces = arr(o.traces || ['x', 'v', 'a']).filter(function (q) { return ['x', 'v', 'a'].indexOf(q) >= 0; });
    var sh = { energy: F.on('energy', true), period: F.on('period', true, true), curve: F.on('curve', !!drive) };
    var ang = type === 'pendulum' || type === 'physical';
    function w0(p) { return type === 'pendulum' ? M.sqrt(g / p.L) : type === 'physical' ? M.sqrt(1.5 * g / p.L) : M.sqrt(p.k / p.m); }
    function Texact(p) { return type === 'pendulum' ? PM.pendulumPeriod(p.L, p.th0, g) : type === 'physical' ? PM.pendulumPeriod(2 * p.L / 3, p.th0, g) : TAU / w0(p); }
    // state integrated with RK4: y = [q, q'] (q = x in m, or θ in rad)
    function deriv(p, t, y) {
      var acc;
      if (type === 'pendulum') acc = -g / p.L * M.sin(y[0]); else if (type === 'physical') acc = -1.5 * g / p.L * M.sin(y[0]); else acc = -p.k / p.m * y[0];
      acc -= p.b / p.m * y[1]; if (drive) acc += drive.F0 / p.m * M.cos(drive.w * t); return [y[1], acc];
    }
    var S = { t: 0, y: [ang ? P.th0 * DEG : P.A, 0], y2: cmp ? [ang ? cmp.th0 * DEG : cmp.A, 0] : null, hist: [] };
    function reset() { S.t = 0; S.y = [ang ? P.th0 * DEG : P.A, 0]; if (cmp) S.y2 = [ang ? cmp.th0 * DEG : cmp.A, 0]; S.hist = []; }
    function step(h) { var n = M.max(1, M.ceil(h / 0.004)), dt = h / n; for (var i = 0; i < n; i++) { var t0 = S.t; S.y = rk4(function (t, y) { return deriv(P, t, y); }, t0, S.y, dt); if (cmp) S.y2 = rk4(function (t, y) { return deriv(cmp, t, y); }, t0, S.y2, dt); S.t += dt; } S.hist.push([S.t, S.y[0], S.y[1], deriv(P, S.t, S.y)[1]]); while (S.hist.length && S.hist[0][0] < S.t - win()) S.hist.shift(); return true; }
    function win() { return M.max(2 * Texact(P), drive ? 6 * TAU / drive.w : 0); }
    S.hist.push([0, S.y[0], S.y[1], deriv(P, 0, S.y)[1]]);
    var c = F.canvas({ height: (F.compact ? 150 : 200) + traces.length * (F.compact ? 70 : 104) });
    var A = F.anim({ tmax: undefined, scrub: false, autoplay: true, tick: step, reset: reset, dt: 0.05 });
    var ft = num(o.t, null); if (ft != null && ft > 0) step(ft); else if (!F.live) { /* frozen at t = 0 */ }
    if (F.live) {
      var row = F.row();
      if (ang) { F.slider(row, { label: 'Length L', min: 0.2, max: 3, step: 0.05, value: P.L, unit: 'm', d: 2, input: function (v) { P.L = v; reset(); } }); F.slider(row, { label: 'Release angle', min: 2, max: 90, step: 1, value: P.th0, unit: '°', d: 0, input: function (v) { P.th0 = v; reset(); } }); F.slider(row, { label: 'Bob mass', min: 0.1, max: 5, step: 0.1, value: P.m, unit: 'kg', d: 1, input: function (v) { P.m = v; reset(); } }); }
      else { F.slider(row, { label: 'Mass m', min: 0.2, max: 5, step: 0.1, value: P.m, unit: 'kg', d: 1, input: function (v) { P.m = v; reset(); } }); F.slider(row, { label: 'Spring constant k', min: 2, max: 60, step: 1, value: P.k, unit: 'N/m', d: 0, input: function (v) { P.k = v; reset(); } }); F.slider(row, { label: 'Amplitude A', min: 0.02, max: 0.4, step: 0.01, value: P.A, unit: 'm', d: 2, input: function (v) { P.A = v; reset(); } }); }
      if (drive) { var r2 = F.row(); F.slider(r2, { label: 'Driving frequency ω', min: 0.2, max: w0(P) * 2.5, step: 0.05, value: drive.w, unit: 'rad/s', d: 2, input: function (v) { drive.w = v; } }); F.slider(r2, { label: 'Damping b', min: 0.05, max: 4, step: 0.05, value: P.b || 0.3, unit: 'kg/s', d: 2, input: function (v) { P.b = v; } }); if (!P.b) P.b = 0.3; }
    }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, q = S.y[0], qd = S.y[1], qdd = deriv(P, S.t, S.y)[1]; bg(c);
      var sceneH = traces.length ? (F.compact ? 140 : 190) : H0 - 10, wide = W0 > 560, sceneW = cmp ? W0 / 2 : (sh.energy && wide ? W0 - 150 : W0);
      function drawOne(p, y, x0, w) {
        if (ang) { var Lp = M.min(sceneH - 30, w * 0.55) * (p.L / M.max(P.L, cmp ? cmp.L : 0, 0.01)), px = x0 + w / 2, py = 16, bx = px + Lp * M.sin(y[0]), byy = py + Lp * M.cos(y[0]); hatch(ctx, px - 40, 4, 80, 10, k.ground); line(ctx, px - 40, 14, px + 40, 14, k.ground, 2); line(ctx, px, py, px, py + Lp + 14, k.grid, 1, [3, 4]);
          if (type === 'physical') { ctx.save(); ctx.translate(px, py); ctx.rotate(-y[0]); rrect(ctx, -6, 0, 12, Lp, 6); ctx.fillStyle = k.obj; ctx.fill(); ctx.strokeStyle = k.objLine; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); circ(ctx, px, py, 4, { fill: k.ink }); }
          else { line(ctx, px, py, bx, byy, k.metal, 2); ball(ctx, bx, byy, 8 + M.sqrt(p.m) * 4, k.acc); }
          var tA = p.th0 * DEG; F.tagAt(ctx, 'turnL', px - Lp * M.sin(tA) - 14, py + Lp * M.cos(tA)); F.tagAt(ctx, 'turnR', px + Lp * M.sin(tA) + 14, py + Lp * M.cos(tA)); F.tagAt(ctx, 'eq', px + 14, py + Lp + 10); F.tagAt(ctx, 'mass', bx + 22, byy - 12);
          return; }
        var vert = type === 'vertical-spring', sp = (w - 60) / 2 / 0.45, eq;
        if (!vert) { var wx = x0 + 20, cyy = sceneH * 0.6; eq = x0 + w / 2; hatch(ctx, wx - 12, cyy - 40, 12, 60, k.ground); line(ctx, wx, cyy - 40, wx, cyy + 20, k.ground, 2); ground(ctx, wx, cyy + 20, w - 30, k); var mxp = eq + y[0] * sp; spring(ctx, wx, cyy, mxp - 18, cyy, { n: 14, amp: 8, color: k.eUs, w: 2 }); block(ctx, mxp - 18, cyy - 18, 36, 36, { label: fm(p.m, 1) + ' kg', size: 9.5 }); line(ctx, eq, cyy + 22, eq, cyy + 32, k.ink, 2); txt(ctx, 'x = 0', eq, cyy + 40, { align: 'center', size: 10.5, color: k.muted }); [-1, 1].forEach(function (s0) { line(ctx, eq + s0 * p.A * sp, cyy + 22, eq + s0 * p.A * sp, cyy + 30, k.gold, 2); }); F.tagAt(ctx, 'eq', eq, cyy + 52); F.tagAt(ctx, 'turnL', eq - p.A * sp, cyy + 46); F.tagAt(ctx, 'turnR', eq + p.A * sp, cyy + 46); F.tagAt(ctx, 'mass', mxp, cyy - 30); }
        else { var cxx = x0 + w / 2, sag = p.m * g / p.k, s2 = M.min(sp, (sceneH - 50) / (0.45 + sag)); eq = 14 + 30 + sag * s2; var myy = eq - y[0] * s2; hatch(ctx, cxx - 40, 4, 80, 10, k.ground); line(ctx, cxx - 40, 14, cxx + 40, 14, k.ground, 2); spring(ctx, cxx, 14, cxx, myy - 16, { n: 14, amp: 8, color: k.eUs }); block(ctx, cxx - 18, myy - 16, 36, 32, { label: fm(p.m, 1), size: 10 }); line(ctx, cxx + 26, eq, cxx + 40, eq, k.ink, 2); txt(ctx, W0 > 520 ? 'equilibrium (stretched mg/k)' : 'equilibrium', cxx + 44, eq, { size: 10.5, color: k.muted }); F.tagAt(ctx, 'mass', cxx - 30, myy); }
      }
      drawOne(P, S.y, 0, sceneW); if (cmp) { line(ctx, W0 / 2, 6, W0 / 2, sceneH, k.grid, 1); drawOne(cmp, S.y2, W0 / 2, W0 / 2); }
      if (sh.energy && !cmp && wide) { var Utot = ang ? P.m * g * P.L * (1 - M.cos(P.th0 * DEG)) * (type === 'physical' ? 0.5 * 1 : 1) : 0.5 * P.k * P.A * P.A, Kk = ang ? 0.5 * P.m * (type === 'physical' ? P.L * P.L / 3 : P.L * P.L) * qd * qd : 0.5 * P.m * qd * qd, Uu = ang ? P.m * g * (type === 'physical' ? P.L / 2 : P.L) * (1 - M.cos(q)) : 0.5 * P.k * q * q; energyBars(ctx, { x: W0 - 140, y: 14, w: 128, h: sceneH - 46 }, [{ key: 'K', v: Kk }, { key: ang ? 'Ug' : 'Us', v: Uu }], { max: M.max(Utot, Kk + Uu, 1e-9) * 1.05, vals: F.vals, grid: false }); }
      var y = sceneH + 8, gh = (H0 - y - 6) / M.max(1, traces.length) - 22, T0 = Texact(P), wn = win(), t0 = M.max(0, S.t - wn);
      traces.forEach(function (tq, i) {
        var idx = tq === 'x' ? 1 : tq === 'v' ? 2 : 3, col = tq === 'x' ? k.acc : tq === 'v' ? k.vel : k.accel, w0v = w0(P), amp0 = ang ? P.th0 * DEG : P.A, mx = idx === 1 ? amp0 : idx === 2 ? amp0 * w0v : amp0 * w0v * w0v;
        if (drive) mx = M.max(mx, PM.drivenAmp(drive.F0, P.m, P.k, P.b || 0.3, drive.w) * (idx === 1 ? 1 : idx === 2 ? drive.w : drive.w * drive.w));
        var unit = ang ? (idx === 1 ? 'rad' : idx === 2 ? 'rad/s' : 'rad/s²') : (idx === 1 ? 'm' : idx === 2 ? 'm/s' : 'm/s²'), nm = ang ? (idx === 1 ? 'θ' : idx === 2 ? 'ω' : 'α') : tq;
        var G = GP(ctx, { x: 50, y: y + 4, w: W0 - 64, h: gh }, { xmin: t0, xmax: t0 + wn, ymin: -mx * 1.15, ymax: mx * 1.15, xlab: 't (s)', ylab: nm + ' (' + unit + ')', compact: true, ystep: niceStep(mx * 2.3, 3) }).frame();
        G.line(S.hist.map(function (hq) { return [hq[0], hq[idx]]; }), col, 2.2); G.vline(S.t, k.gold, [4, 3]); G.dot(S.t, idx === 1 ? q : idx === 2 ? qd : qdd, col, 4);
        F.tagAt(ctx, 't' + tq, 50 + W0 - 64 - 14, y + 18);
        y += gh + 22;
      });
      if (sh.curve && drive) { var cr = { x: W0 - 190, y: 12, w: 176, h: sceneH - 40 }, wmax = w0(P) * 2.5, amax = PM.drivenAmp(drive.F0, P.m, P.k, P.b || 0.3, w0(P) * M.sqrt(M.max(0.01, 1 - 0.5 * M.pow((P.b || 0.3) / (P.m * w0(P)), 2)))) * 1.1, G2 = GP(ctx, cr, { xmin: 0, xmax: wmax, ymin: 0, ymax: amax, xlab: 'ω', ylab: 'amplitude', compact: true, yticks: false }).frame(); G2.plot(function (w) { return PM.drivenAmp(drive.F0, P.m, P.k, P.b || 0.3, w); }, k.purple, 2.2); G2.vline(w0(P), k.muted, [3, 3]); G2.dot(drive.w, PM.drivenAmp(drive.F0, P.m, P.k, P.b || 0.3, drive.w), k.gold, 5); }
      var Tsm = TAU / w0(P);
      F.desc((ang ? 'A ' + (type === 'physical' ? 'rod' : 'pendulum') + ' of length ' + un(P.L, 'm') + ' released from ' + fm(P.th0, 0) + '°' : 'A ' + fm(P.m, 2) + ' kg mass on a ' + fm(P.k, 0) + ' N/m spring with amplitude ' + un(P.A, 'm')) + (sh.period ? '; period ' + un(T0, 's', 3) : '') + '.');
      var where = M.abs(q) < 0.08 * (ang ? P.th0 * DEG : P.A) ? ' Passing equilibrium: speed is greatest and acceleration is zero.' : M.abs(qd) < 0.08 * (ang ? P.th0 * DEG : P.A) * w0(P) ? ' At a turning point: speed is zero and acceleration is greatest.' : '';
      F.read((sh.period ? 'Period T = ' + (ang ? (type === 'pendulum' ? '2π√(L/g)' : '2π√(2L/3g)') : '2π√(m/k)') + ' = <b>' + un(Tsm, 's', 3) + '</b>' + (ang && P.th0 > 20 ? ' (small swings); at ' + fm(P.th0, 0) + '° it is <b>' + un(T0, 's', 3) + '</b>' : '') + (ang ? '. The bob\'s mass does not appear.' : '. The amplitude does not appear.') : '') + where + (drive ? ' Driven at ω = ' + un(drive.w, 'rad/s', 3) + ' (natural ω₀ = ' + un(w0(P), 'rad/s', 3) + '): steady amplitude ' + un(PM.drivenAmp(drive.F0, P.m, P.k, P.b || 0.3, drive.w), 'm', 3) + '. Damping keeps the amplitude finite even at resonance.' : '') + (cmp ? ' Compare: periods ' + un(Texact(P), 's', 3) + ' and ' + un(Texact(cmp), 's', 3) + '.' : ''));
      F.stats([['period', un(T0, 's', 3)], [ang ? 'θ' : 'x', ang ? fd(q / DEG, 1, '°') : un(q, 'm', 3)], [ang ? 'ω' : 'v', un(qd, ang ? 'rad/s' : 'm/s', 3)], [ang ? 'α' : 'a', un(qdd, ang ? 'rad/s²' : 'm/s²', 3)]]);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-wave
  /* PM.stringReflect(mu1, mu2): displacement reflection and transmission coefficients at a junction of two strings with the same
     tension (r = (Z1 − Z2)/(Z1 + Z2), t = 2Z1/(Z1 + Z2), Z = √(Tμ)); fixed end r = −1, free end r = +1. */
  PM.stringReflect = function (mu1, mu2) { var z1 = M.sqrt(mu1), z2 = M.sqrt(mu2); return { r: (z1 - z2) / (z1 + z2), t: 2 * z1 / (z1 + z2), v2v1: z1 / z2 }; };
  /* PM.pipeF(n, L, v, closed): frequency of harmonic n (closed pipes have odd n only) */
  PM.pipeF = function (n, L, v, closed) { return closed ? n * v / (4 * L) : n * v / (2 * L); };
  /* PM.malus(I0, angles): intensity after a stack of ideal polarizers for unpolarized light: I0/2 then cos² of each angle change */
  PM.malus = function (I0, angs) { if (!angs.length) return [I0]; var out = [I0 / 2]; for (var i = 1; i < angs.length; i++) out.push(out[i - 1] * M.pow(M.cos((angs[i] - angs[i - 1]) * DEG), 2)); return out; };
  R('ph-wave', function (el, o) {
    var mode = pick(o.mode, ['travel', 'pulse', 'superpose', 'standing-string', 'standing-pipe', 'beats', 'em', 'digital'], 'travel');
    var F = frame(el, o, { travel: 'A traveling wave on a row of particles', pulse: 'A pulse reaching the end of a string', superpose: 'Two waves adding (superposition)', 'standing-string': 'A standing wave on a string', 'standing-pipe': 'A standing sound wave in a pipe', beats: 'Beats from two close frequencies', em: 'An electromagnetic wave and polarizing filters', digital: 'An analog signal sent as digital bits' }[mode]);
    if (mode === 'em') return emWave(F, o);
    if (mode === 'digital') return digital(F, o);
    var P = { A: num(o.A, mode === 'travel' ? 0.5 : 1), lam: num(o.lambda, 2), f: num(o.f, 0.5), n: M.max(1, M.round(num(o.n, mode === 'standing-pipe' ? 1 : 3))), L: num(o.L, 10), mu2: num(o.mu2, 4), long: !!o.long };
    var v = o.v != null ? num(o.v, 1) : o.tension != null ? M.sqrt(num(o.tension, 1) / num(o.mu, 1)) : P.lam * P.f, boundary = pick(o.boundary, ['fixed', 'free', 'junction'], 'fixed'), pipe = o.pipe === 'closed' ? 'closed' : 'open', view = o.view === 'pressure' ? 'pressure' : 'displacement';
    if (mode === 'travel') P.lam = v / P.f;
    var graphs = arr(o.graphs || (mode === 'travel' ? ['snapshot', 'history'] : [])), mark = o.mark != null ? num(o.mark, 0) : null;
    var c = F.canvas({ height: (F.compact ? 120 : mode === 'beats' ? 220 : 190) + graphs.length * (F.compact ? 90 : 130) });
    var tmaxL = mode === 'pulse' ? (P.L * (boundary === 'junction' ? 1.6 : 1.5)) / v : mode === 'superpose' ? 10 / v : undefined;
    var A = F.anim({ tmax: tmaxL, loop: !!tmaxL, rate: 1, autoplay: true, dt: 0.1, tStatic: num(o.t, 0) });
    var waves = arr(o.waves || (mode === 'superpose' ? [{ A: 1, w: 0.7, x0: 2, dir: 1 }, { A: 0.7, w: 0.7, x0: 8, dir: -1 }] : [])).map(function (q) { return { A: num(q.A, 1), lambda: q.lambda != null ? num(q.lambda, 2) : null, w: num(q.w, 0.7), x0: num(q.x0, 2), dir: num(q.dir, 1), phase: num(q.phase, 0) }; });
    if (F.live) {
      var row = F.row();
      if (mode === 'travel') { F.slider(row, { label: 'Frequency f', min: 0.1, max: 1.5, step: 0.05, value: P.f, unit: 'Hz', d: 2, input: function (x) { P.f = x; P.lam = v / P.f; } }); F.slider(row, { label: 'Amplitude A', min: 0.1, max: 1, step: 0.05, value: P.A, unit: 'm', d: 2, input: function (x) { P.A = x; } }); F.check(row, 'Longitudinal', P.long, function (on) { P.long = on; }); }
      if (mode === 'pulse') F.seg(row, { label: 'Boundary', items: [['fixed', 'Fixed end'], ['free', 'Free end'], ['junction', 'Joined to another string']], value: boundary, change: function (x) { boundary = x; A.reset(); } });
      if (mode === 'pulse') F.slider(row, { label: 'Second string: mass per length × ', min: 0.25, max: 9, step: 0.25, value: P.mu2, d: 2, input: function (x) { P.mu2 = x; } });
      if (mode === 'standing-string' || mode === 'standing-pipe') F.slider(row, { label: 'Harmonic n', min: 1, max: mode === 'standing-pipe' && pipe === 'closed' ? 9 : 6, step: mode === 'standing-pipe' && pipe === 'closed' ? 2 : 1, value: P.n, d: 0, input: function (x) { P.n = M.round(x); } });
      if (mode === 'standing-pipe') { F.seg(row, { label: 'Pipe', items: [['open', 'Open both ends'], ['closed', 'Closed at one end']], value: pipe, change: function (x) { pipe = x; if (pipe === 'closed' && P.n % 2 === 0) P.n += 1; } }); F.seg(row, { label: 'View', items: [['displacement', 'Air displacement'], ['pressure', 'Pressure']], value: view, change: function (x) { view = x; } }); }
      if (mode === 'beats') { F.slider(row, { label: 'f₁', min: 4, max: 12, step: 0.1, value: num(o.f1, 8), unit: 'Hz', d: 1, input: function (x) { o.f1 = x; } }); F.slider(row, { label: 'f₂', min: 4, max: 12, step: 0.1, value: num(o.f2, 9), unit: 'Hz', d: 1, input: function (x) { o.f2 = x; } }); }
    }
    function yAt(x, t) {
      if (mode === 'travel') return P.A * M.sin(TAU * (x / P.lam - P.f * t));
      if (mode === 'pulse') { var xb = boundary === 'junction' ? P.L / 2 : P.L, g = function (s) { return P.A * M.exp(-s * s / 0.36); }, x0 = 1.2, R0 = boundary === 'fixed' ? { r: -1, t: 0, v2v1: 1 } : boundary === 'free' ? { r: 1, t: 0, v2v1: 1 } : PM.stringReflect(1, P.mu2);
        if (x <= xb) return g(x - x0 - v * t) + R0.r * g(2 * xb - x - x0 - v * t); return R0.t * g(xb + (x - xb) / R0.v2v1 - x0 - v * t); }
      if (mode === 'superpose') return waves.reduce(function (s, w) { return s + wv(w, x, t); }, 0);
      if (mode === 'standing-string') return 2 * P.A * 0.5 * M.sin(P.n * PI * x / P.L) * M.cos(TAU * 0.4 * t);
      return 0;
    }
    function wv(w, x, t) { if (w.lambda) return w.A * M.sin(TAU * (x - w.dir * v * t) / w.lambda + w.phase * DEG); var s = x - w.x0 - w.dir * v * t; return w.A * M.exp(-s * s / (w.w * w.w)); }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, t = A.t; bg(c);
      var sceneH = (mode === 'beats' ? H0 - 10 : (F.compact ? 110 : 180)), xs = { x: 30, w: W0 - 60 }, Lx = mode === 'travel' ? M.max(8, 4 * P.lam) : mode === 'pulse' ? P.L : mode === 'superpose' ? 10 : P.L, X = function (x) { return xs.x + x / Lx * xs.w; }, mid = sceneH * 0.54, ys = (sceneH * 0.3) / M.max(P.A, 1e-9) / (mode === 'standing-string' ? 1 : 1);
      var desc = '', read = '';
      if (mode === 'travel' || mode === 'pulse' || mode === 'superpose' || mode === 'standing-string') {
        if (mode === 'superpose') ys = sceneH * 0.36 / M.max(1e-9, waves.reduce(function (s, w) { return s + M.abs(w.A); }, 0));
        line(ctx, xs.x, mid, xs.x + xs.w, mid, k.grid, 1, [4, 4]);
        if (mode === 'pulse') { var xb = boundary === 'junction' ? P.L / 2 : P.L; if (boundary === 'fixed') { hatch(ctx, X(xb), mid - 50, 12, 100, k.ground); line(ctx, X(xb), mid - 50, X(xb), mid + 50, k.ground, 2); } else if (boundary === 'free') { line(ctx, X(xb) + 4, mid - 60, X(xb) + 4, mid + 60, k.metal, 3); txt(ctx, 'ring slides on a pole', X(xb) - 4, mid + 66, { align: 'right', size: 10.5, color: k.muted }); } else { line(ctx, X(xb), mid - 50, X(xb), mid + 50, k.gold, 1.2, [3, 3]); txt(ctx, P.mu2 > 1 ? 'heavier string' : P.mu2 < 1 ? 'lighter string' : 'same string', X(xb) + 8, mid - 46, { size: 11, color: k.gold }); } }
        if (mode === 'superpose') waves.forEach(function (w, i) { var pts = []; for (var px = 0; px <= xs.w; px += 2) { var x = px / xs.w * Lx; pts.push([xs.x + px, mid - wv(w, x, t) * ys]); } poly(ctx, pts, { color: [k.blue, k.red, k.green][i % 3], w: 1.6, dash: [6, 4] }); });
        if (mode === 'standing-string') { var env = []; for (var px2 = 0; px2 <= xs.w; px2 += 3) env.push([xs.x + px2, mid - P.A * M.abs(M.sin(P.n * PI * (px2 / xs.w))) * ys]); poly(ctx, env, { color: rgba(k.muted, 0.5), w: 1, dash: [3, 3] }); poly(ctx, env.map(function (q) { return [q[0], 2 * mid - q[1]]; }), { color: rgba(k.muted, 0.5), w: 1, dash: [3, 3] }); }
        if (P.long && mode === 'travel') { // longitudinal: particles move along x
          for (var i = 0; i <= 60; i++) { var x0 = i / 60 * Lx, dx = P.A * 0.35 * M.sin(TAU * (x0 / P.lam - P.f * t)) * (Lx / 10); for (var j = 0; j < 5; j++) circ(ctx, X(x0 + dx), mid - 36 + j * 18, 2.6, { fill: i === M.round((mark != null ? mark : 0.25) * 60) ? k.red : k.acc }); }
          txt(ctx, 'compressions: crowded; rarefactions: spread out', xs.x, sceneH - 10, { size: 11, color: k.muted });
        } else {
          var pts2 = []; for (var px3 = 0; px3 <= xs.w; px3 += 2) pts2.push([xs.x + px3, mid - yAt(px3 / xs.w * Lx, t) * ys]); poly(ctx, pts2, { color: k.acc, w: 2.8 });
          if (mode === 'travel') for (var i2 = 0; i2 <= 40; i2++) { var xx = i2 / 40 * Lx; circ(ctx, X(xx), mid - yAt(xx, t) * ys, 3, { fill: k.acc }); }
        }
        if (mode === 'travel') {
          var mk0 = (mark != null ? mark : 0.25) * Lx, my = mid - yAt(mk0, t) * ys; if (!P.long) { line(ctx, X(mk0), mid - P.A * ys - 6, X(mk0), mid + P.A * ys + 6, rgba(k.red, 0.4), 1.2, [2, 3]); circ(ctx, X(mk0), my, 6, { fill: k.red }); } F.tagAt(ctx, 'mark', X(mk0) + 14, my - 14);
          if (!P.long && F.on('lam', true)) { var cx0 = (0.25 + P.f * t % 1) * P.lam; cx0 = ((P.lam * 0.25 + P.f * t * P.lam) % P.lam); var c1 = cx0 + P.lam; if (c1 <= Lx) { var yl = mid - P.A * ys - 14; arrow(ctx, X(cx0), yl, X(c1), yl, { color: k.gold, w: 1.6, double: true, head: 7 }); txt(ctx, 'λ' + (F.vals ? ' = ' + un(P.lam, 'm', 3) : ''), (X(cx0) + X(c1)) / 2, yl - 10, { align: 'center', size: 12, weight: 700, color: k.gold, halo: true }); F.tagAt(ctx, 'lam', (X(cx0) + X(c1)) / 2 + 40, yl - 10); }
            var ax = X(cx0); line(ctx, ax, mid, ax, mid - P.A * ys, k.purple, 2); txt(ctx, 'A', ax + 5, mid - P.A * ys / 2, { size: 12, weight: 700, color: k.purple, halo: true }); F.tagAt(ctx, 'amp', ax - 16, mid - P.A * ys / 2); }
          arrow(ctx, W0 - 90, sceneH - 12, W0 - 40, sceneH - 12, { color: k.vel, w: 2.4, label: '' }); txt(ctx, 'wave travels at v = ' + un(v, 'm/s', 3), W0 - 94, sceneH - 12, { align: 'right', size: 11, color: k.vel });
          desc = 'A ' + (P.long ? 'longitudinal' : 'transverse') + ' wave with frequency ' + un(P.f, 'Hz') + ' traveling at ' + un(v, 'm/s') + (F.quiet ? '.' : ', wavelength ' + un(P.lam, 'm') + '.');
          read = 'v = fλ: the medium sets v = <b>' + un(v, 'm/s', 3) + '</b>, so a higher frequency gives a <b>shorter wavelength</b> (λ = <b>' + un(P.lam, 'm', 3) + '</b>), not a faster wave. The red particle only moves ' + (P.long ? 'back and forth' : 'up and down') + ' about its own spot: the wave carries energy, not the medium. Period T = 1/f = <b>' + un(1 / P.f, 's', 3) + '</b>.';
          F.stats([['frequency', un(P.f, 'Hz', 3)], ['wavelength', un(P.lam, 'm', 3)], ['speed', un(v, 'm/s', 3)], ['period', un(1 / P.f, 's', 3)]]);
        } else if (mode === 'pulse') {
          var R1 = boundary === 'fixed' ? -1 : boundary === 'free' ? 1 : PM.stringReflect(1, P.mu2).r;
          desc = 'A pulse travels toward ' + (boundary === 'fixed' ? 'a fixed end' : boundary === 'free' ? 'a free end' : 'a joint with a string ' + fm(P.mu2, 2) + ' times as heavy per meter') + '.';
          read = boundary === 'fixed' ? 'At a fixed end the wall pulls the string the other way: the reflected pulse comes back <b>upside down</b>.' : boundary === 'free' ? 'At a free end the string can swing up: the reflection comes back <b>right side up</b>.' : 'Part goes on (always upright) and part reflects: reflection ' + (R1 < 0 ? '<b>upside down</b> (into a heavier string)' : R1 > 0 ? '<b>right side up</b> (into a lighter string)' : 'none') + ', with ' + fm(M.abs(R1) * 100, 0) + '% of the height. The transmitted pulse is ' + (P.mu2 > 1 ? 'slower and narrower.' : 'faster and wider.');
        } else if (mode === 'superpose') {
          desc = 'Two pulses moving toward each other, each dashed, with their sum solid.'; read = 'Where the waves overlap, the displacements add (superposition). Afterward each pulse moves on unchanged: waves pass through each other.';
        } else {
          for (var nn = 0; nn <= P.n; nn++) { var xn = nn / P.n * P.L; circ(ctx, X(xn), mid, 5, { fill: k.red }); F.tagAt(ctx, 'node' + nn, X(xn), mid + 18); if (nn < P.n) { var xa = (nn + 0.5) / P.n * P.L; circ(ctx, X(xa), mid, 4, { color: k.green, w: 2, fill: k.bg }); F.tagAt(ctx, 'anti' + nn, X(xa), mid - P.A * ys - 18); } }
          hatch(ctx, X(0) - 12, mid - 40, 12, 80, k.ground); hatch(ctx, X(P.L), mid - 40, 12, 80, k.ground);
          txt(ctx, 'N = node (never moves)   A = antinode (moves most)', xs.x, sceneH - 10, { size: 11, color: k.muted });
          desc = 'Harmonic ' + P.n + ' on a string fixed at both ends: ' + (P.n + 1) + ' nodes and ' + P.n + ' antinodes.';
          read = 'Harmonic n = <b>' + P.n + '</b>: λ = 2L/n = <b>' + un(2 * P.L / P.n, 'm', 3) + '</b>, f = nv/2L = <b>' + un(P.n * v / (2 * P.L), 'Hz', 3) + '</b>. Nodes (red) never move; antinodes (green) swing the most.';
        }
      } else if (mode === 'standing-pipe') {
        var closed = pipe === 'closed', n = closed && P.n % 2 === 0 ? P.n + 1 : P.n, py0 = mid - 36, ph = 72, x1 = xs.x + 10, x2 = xs.x + xs.w - 10, Lp = x2 - x1, ct = M.cos(TAU * 0.5 * t);
        ctx.save(); ctx.fillStyle = k.water; ctx.fillRect(x1, py0, Lp, ph); ctx.restore(); line(ctx, x1, py0, x2, py0, k.ink, 3); line(ctx, x1, py0 + ph, x2, py0 + ph, k.ink, 3); if (closed) line(ctx, x2, py0 - 2, x2, py0 + ph + 2, k.ink, 5);
        var kx = closed ? n * PI / (2 * Lp) : n * PI / Lp; // displacement ∝ cos(kx) with an antinode at the open end x = 0
        for (var col = 0; col < 48; col++) for (var r = 0; r < 4; r++) { var xr = (col + 0.5) / 48 * Lp, dsp = M.cos(kx * xr) * ct * Lp / 48 * 1.6; circ(ctx, x1 + xr + dsp, py0 + 12 + r * 16, 2.3, { fill: k.acc }); }
        var curve = []; for (var px4 = 0; px4 <= Lp; px4 += 3) curve.push([x1 + px4, mid + 0.85 * (ph / 2) * (view === 'pressure' ? M.sin(kx * px4) : M.cos(kx * px4)) * ct]); poly(ctx, curve, { color: view === 'pressure' ? k.red : k.purple, w: 2.4 });
        var envU = [], envD = []; for (px4 = 0; px4 <= Lp; px4 += 3) { var e0 = 0.85 * (ph / 2) * M.abs(view === 'pressure' ? M.sin(kx * px4) : M.cos(kx * px4)); envU.push([x1 + px4, mid - e0]); envD.push([x1 + px4, mid + e0]); } poly(ctx, envU, { color: rgba(k.muted, 0.6), w: 1, dash: [3, 3] }); poly(ctx, envD, { color: rgba(k.muted, 0.6), w: 1, dash: [3, 3] });
        var nNodes = 0; for (var q = 0; q <= 2 * n; q++) { var xq = (q * PI / 2) / kx; if (xq > Lp + 0.5) break; var isNodeD = q % 2 === 1; var isNode = view === 'pressure' ? !isNodeD : isNodeD; if (isNode) { circ(ctx, x1 + xq, py0 + ph + 12, 4.5, { fill: k.red }); F.tagAt(ctx, 'node' + nNodes, x1 + xq, py0 + ph + 28); nNodes++; } }
        var fq = PM.pipeF(n, 1, 343, closed);
        txt(ctx, (view === 'pressure' ? 'pressure' : 'air displacement') + ' · red dots: ' + (view === 'pressure' ? 'pressure' : 'displacement') + ' nodes', xs.x, sceneH - 8, { size: 11, color: k.muted });
        desc = (closed ? 'A pipe closed at one end' : 'A pipe open at both ends') + ', harmonic ' + n + ', ' + view + ' view.';
        read = (closed ? 'Closed end: a displacement node (air can\'t move) and a pressure antinode. Only odd harmonics fit: f = nv/4L, n = 1, 3, 5…' : 'Open ends: displacement antinodes and pressure nodes. Every harmonic fits: f = nv/2L, n = 1, 2, 3…') + ' For a 1.00 m pipe with v = 343 m/s, harmonic ' + n + ' is <b>' + un(fq, 'Hz', 3) + '</b>.';
      } else if (mode === 'beats') {
        var f1 = num(o.f1, 8), f2 = num(o.f2, 9), gr = { x: 46, y: 14, w: W0 - 60, h: H0 - 40 }, tw0 = 3, t0 = t % 30, G = GP(ctx, gr, { xmin: t0, xmax: t0 + tw0, ymin: -2.3, ymax: 2.3, xlab: 't (s)', ylab: 'y', compact: true }).frame();
        G.plot(function (x) { return M.sin(TAU * f1 * x); }, rgba(k.blue, 0.35), 1.2); G.plot(function (x) { return M.sin(TAU * f2 * x); }, rgba(k.red, 0.35), 1.2);
        G.plot(function (x) { return M.sin(TAU * f1 * x) + M.sin(TAU * f2 * x); }, k.acc, 2.2); G.plot(function (x) { return 2 * M.abs(M.cos(PI * (f1 - f2) * x)); }, k.gold, 1.6, [5, 4]); G.plot(function (x) { return -2 * M.abs(M.cos(PI * (f1 - f2) * x)); }, k.gold, 1.6, [5, 4]);
        desc = 'Two tones of ' + un(f1, 'Hz') + ' and ' + un(f2, 'Hz') + ' added together.'; read = 'The sum swells and fades: the beat frequency is |f₁ − f₂| = <b>' + un(M.abs(f1 - f2), 'Hz', 3) + '</b>. (Slowed down here; real tones are hundreds of hertz.)';
      }
      // graphs: snapshot (y against x) and history (y against t at the marked particle)
      var gy = sceneH + 8; graphs.forEach(function (gq) {
        var r = { x: 50, y: gy + 4, w: W0 - 64, h: (F.compact ? 90 : 130) - 34 }; gy += F.compact ? 90 : 130;
        if (gq === 'snapshot') { var G1 = GP(ctx, r, { xmin: 0, xmax: Lx, ymin: -P.A * 1.25, ymax: P.A * 1.25, xlab: 'x (m)', ylab: 'y (m) at t = ' + fm(t, 2) + ' s', compact: true, ystep: niceStep(P.A * 2.5, 3) }).frame(); G1.plot(function (x) { return yAt(x, t); }, k.acc, 2.2); if (mode === 'travel') G1.dot((mark != null ? mark : 0.25) * Lx, yAt((mark != null ? mark : 0.25) * Lx, t), k.red, 4.5); }
        else { var mk1 = (mark != null ? mark : 0.25) * Lx, T0 = mode === 'travel' ? 1 / P.f : 4, tw = 3 * T0, ts = M.max(0, t - tw), G2 = GP(ctx, r, { xmin: ts, xmax: ts + tw, ymin: -P.A * 1.25, ymax: P.A * 1.25, xlab: 't (s)', ylab: 'y (m) of the red particle', compact: true, ystep: niceStep(P.A * 2.5, 3) }).frame(); G2.plot(function (tt) { return yAt(mk1, tt); }, k.red, 2.2, null, ts, t); G2.dot(t, yAt(mk1, t), k.red, 4.5);
          if (mode === 'travel' && F.on('period', true)) { var tp = ts + ((0.25 - (mk1 / P.lam)) / P.f % T0 + T0) % T0; if (tp + T0 <= ts + tw) { var yy = G2.Y(P.A * 1.12); arrow(ctx, G2.X(tp), yy, G2.X(tp + T0), yy, { color: k.gold, w: 1.5, double: true, head: 6 }); txt(ctx, 'T' + (F.vals ? ' = ' + un(T0, 's', 3) : ''), (G2.X(tp) + G2.X(tp + T0)) / 2, yy + 9, { align: 'center', size: 11, color: k.gold, halo: true, haloColor: k.panelBg, weight: 700 }); } } }
      });
      F.desc(desc); F.read(read);
    };
    F.now(); return {};
  });
  function emWave(F, o) {
    var pol = arr(o.polarizers || []).map(function (q) { return num(q, 0); }), c = F.canvas({ aspect: pol.length ? 1.9 : 2.0, narrow: 1.2 });
    var A = F.anim({ tmax: undefined, scrub: false, autoplay: true, tick: function () { return true; }, dt: 0.05 });
    if (F.live && pol.length) pol.forEach(function (a, i) { F.slider(null, { label: 'Filter ' + (i + 1) + ' axis', min: 0, max: 180, step: 5, value: a, unit: '°', d: 0, input: function (v) { pol[i] = v; } }); });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, t = A.t; bg(c);
      var oy = H0 / 2, ox = 30, Lx = W0 - 60, amp = H0 * 0.32, sk = 0.45, lam = Lx / 3.2;
      function P3(x, y, z) { return [ox + x + z * sk * 0.6, oy - y + z * sk * 0.6 * 0.5]; } // simple oblique projection: x along the beam, y up, z out
      if (!pol.length) {
        line(ctx, ox, oy, ox + Lx, oy, k.axis, 1.4);
        var ptsE = [], ptsB = []; for (var x = 0; x <= Lx; x += 3) { var ph = TAU * (x / lam - 0.6 * t); ptsE.push(P3(x, amp * M.sin(ph), 0)); ptsB.push(P3(x, 0, amp * 1.1 * M.sin(ph))); if (x % 18 === 0) { line(ctx, P3(x, 0, 0)[0], P3(x, 0, 0)[1], ptsE[ptsE.length - 1][0], ptsE[ptsE.length - 1][1], rgba(k.efield, 0.45), 1.2); line(ctx, P3(x, 0, 0)[0], P3(x, 0, 0)[1], ptsB[ptsB.length - 1][0], ptsB[ptsB.length - 1][1], rgba(k.bfield, 0.45), 1.2); } }
        poly(ctx, ptsE, { color: k.efield, w: 2.6 }); poly(ctx, ptsB, { color: k.bfield, w: 2.6 }); txt(ctx, 'E (electric field)', ox + 6, oy - amp - 6, { size: 12, weight: 700, color: k.efield }); txt(ctx, 'B (magnetic field)', ox + 6 + 0.6 * sk * amp, oy + amp * 0.55 + 18, { size: 12, weight: 700, color: k.bfield });
        arrow(ctx, ox + Lx - 40, oy + amp * 0.9, ox + Lx, oy + amp * 0.9, { color: k.ink, w: 2, label: 'c' });
        F.desc('An electromagnetic wave: the electric field oscillates up and down, the magnetic field side to side, at right angles, in step, moving at the speed of light.');
        F.read('E and B peak together (in phase) and are at right angles to each other and to the direction of travel. In vacuum E = cB and the speed is c = <b>3.00 × 10⁸ m/s</b>.');
        return;
      }
      var I = PM.malus(1, pol), n = pol.length, seg = Lx / (n + 1);
      for (var i = 0; i <= n; i++) { var xa = ox + i * seg, xb = xa + seg, inten = i === 0 ? 1 : I[i - 1], aw = 8 + 30 * inten; ctx.save(); ctx.fillStyle = rgba(k.gold, 0.12 + 0.5 * inten); ctx.fillRect(xa + (i ? 14 : 0), oy - aw / 2, seg - (i ? 14 : 0), aw); ctx.restore();
        if (i === 0) for (var j = 0; j < 6; j++) { var a = j * PI / 6 + t * 0.3; line(ctx, xa + seg * 0.5 - 18 * M.cos(a), oy - 18 * M.sin(a), xa + seg * 0.5 + 18 * M.cos(a), oy + 18 * M.sin(a), rgba(k.efield, 0.6), 1.5); }
        else if (inten > 1e-4) { var a2 = pol[i - 1] * DEG, L2 = 18 * M.sqrt(inten / 0.5); arrow(ctx, xa + seg * 0.6, oy, xa + seg * 0.6 + L2 * M.cos(a2), oy - L2 * M.sin(a2), { color: k.efield, w: 2.2, double: true, head: 6 }); }
        txt(ctx, i === 0 ? 'unpolarized' : F.vals ? fm(inten * 100, 1) + '%' : '', xa + seg * 0.5, oy + 48, { align: 'center', size: 11.5, color: k.ink, weight: 700 }); }
      pol.forEach(function (ang, i) { var x = ox + (i + 1) * seg; ctx.save(); ctx.translate(x, oy); ctx.scale(0.35, 1); circ(ctx, 0, 0, 44, { fill: rgba(k.muted, 0.18), color: k.ink, w: 3 }); ctx.restore(); var a3 = ang * DEG; line(ctx, x - 0.35 * 36 * M.cos(a3), oy + 36 * M.sin(a3), x + 0.35 * 36 * M.cos(a3), oy - 36 * M.sin(a3), k.ink, 2); txt(ctx, fm(ang, 0) + '°', x, oy - 56, { align: 'center', size: 11.5, color: k.ink, weight: 700 }); F.tagAt(ctx, 'p' + i, x, oy + 66); });
      F.desc('Unpolarized light through ' + n + ' polarizing filters at ' + pol.map(function (a) { return fm(a, 0) + '°'; }).join(', ') + (F.quiet ? '.' : '; ' + fm(I[I.length - 1] * 100, 1) + '% gets through.'));
      F.read('The first filter passes half (I₀/2). Each later filter passes cos² of the angle between its axis and the one before (Malus\'s law). ' + (n >= 3 ? 'A filter placed between crossed filters lets light through: it turns the polarization in two smaller steps.' : '') + ' Transmitted: <b>' + fm(I[I.length - 1] * 100, 1) + '%</b>.');
    };
    F.now(); return {};
  }
  function digital(F, o) {
    var bits = clamp(M.round(num(o.bits, 3)), 1, 6), noise = num(o.noise, 0.25), c = F.canvas({ aspect: 1.5, narrow: 0.9 }), R = rng(7);
    var nz = []; for (var i = 0; i < 400; i++) nz.push(R() * 2 - 1);
    if (F.live) { F.slider(null, { label: 'Bits per sample', min: 1, max: 6, step: 1, value: bits, d: 0, input: function (v) { bits = v; } }); F.slider(null, { label: 'Noise', min: 0, max: 0.6, step: 0.02, value: noise, d: 2, input: function (v) { noise = v; } }); }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c);
      var levels = M.pow(2, bits), sig = function (t) { return 0.5 + 0.4 * M.sin(TAU * t) * M.cos(PI * 0.7 * t); }, ns = 16;
      var r1 = { x: 46, y: 14, w: W0 - 60, h: H0 * 0.28 }, r2 = { x: 46, y: H0 * 0.36 + 14, w: W0 - 60, h: H0 * 0.24 }, r3 = { x: 46, y: H0 * 0.68 + 10, w: W0 - 60, h: H0 * 0.24 };
      var G1 = GP(ctx, r1, { xmin: 0, xmax: 2, ymin: 0, ymax: 1, xlab: 't', ylab: 'analog signal and samples', compact: true, xticks: false }).frame(); G1.plot(sig, k.acc, 2.2);
      var q = [], codes = []; for (var i = 0; i < ns; i++) { var t = (i + 0.5) / ns * 2, lv = M.min(levels - 1, M.floor(sig(t) * levels)); q.push([t, (lv + 0.5) / levels]); codes.push(lv); G1.dot(t, (lv + 0.5) / levels, k.red, 3.5); }
      var G2 = GP(ctx, r2, { xmin: 0, xmax: ns * bits, ymin: -0.8, ymax: 1.8, xlab: 'bit', ylab: 'bits sent, with noise added', compact: true, xticks: false, yticks: false }).frame(), stream = [];
      codes.forEach(function (cd) { for (var b = bits - 1; b >= 0; b--) stream.push((cd >> b) & 1); });
      var pts = [], errs = 0; stream.forEach(function (b, i) { var nv0 = b + noise * 1.6 * nz[i % nz.length]; pts.push([i, nv0], [i + 1, nv0]); if ((nv0 > 0.5 ? 1 : 0) !== b) errs++; }); G2.line(pts, k.purple, 1.6); G2.hline(0.5, k.gold, [4, 3]); txt(ctx, 'threshold', r2.x + r2.w - 4, G2.Y(0.5) - 8, { align: 'right', size: 10, color: k.gold, halo: true, haloColor: k.panelBg });
      var G3 = GP(ctx, r3, { xmin: 0, xmax: 2, ymin: 0, ymax: 1, xlab: 't', ylab: 'rebuilt from the bits', compact: true, xticks: false }).frame(); var rb = []; q.forEach(function (p, i) { var t0 = i / ns * 2, t1 = (i + 1) / ns * 2; rb.push([t0, p[1]], [t1, p[1]]); }); G3.line(rb, k.green, 2.2); G3.plot(sig, rgba(k.acc, 0.35), 1.4, [4, 3]);
      F.desc('An analog signal sampled ' + ns + ' times and sent as ' + bits + '-bit numbers through a noisy channel, then rebuilt.');
      F.read('Each sample is rounded to one of <b>' + levels + '</b> levels and sent as ' + bits + ' bits. The receiver only asks “above or below the threshold?”, so ' + (errs ? '<b>' + errs + '</b> bit(s) flipped: the noise is too big.' : 'small noise is ignored and the bits come back <b>exactly</b>.') + ' More bits per sample follow the signal more closely.');
    };
    F.now(); return {};
  }

  // ===================================================================================================
  // ph-doppler
  /* PM.doppler(f, v, vs, vo): heard frequency with source and observer speeds toward each other positive: f(v + vo)/(v − vs) */
  PM.doppler = function (f, v, vs, vo) { return f * (v + (vo || 0)) / (v - vs); };
  PM.redshift = function (lam0, vkms) { var b = vkms / 299792.458; return lam0 * M.sqrt((1 + b) / (1 - b)); };
  R('ph-doppler', function (el, o) {
    var mode = pick(o.mode, ['sound', 'shock', 'light'], o.vs != null && num(o.vs, 0) > num(o.vwave, 343) ? 'shock' : 'sound');
    var F = frame(el, o, mode === 'light' ? 'Spectral lines shifted by motion' : 'Wavefronts from a moving source');
    var vw = num(o.vwave, 343), vs = num(o.vs, mode === 'shock' ? 500 : 100), f = num(o.f, 440), c = F.canvas({ aspect: mode === 'light' ? 2.2 : 1.6, narrow: mode === 'light' ? 1.4 : 1.0 });
    if (mode === 'light') {
      var vkm = num(o.v, 3000), lines = arr(o.lines || [num(o.lineNm, 656.3), 486.1, 434.0, 410.2]);
      if (F.live) F.slider(null, { label: 'Speed (+ away, − toward)', min: -30000, max: 30000, step: 500, value: vkm, unit: 'km/s', d: 0, input: function (v) { vkm = v; } });
      F.draw = function () {
        var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c);
        var lo = 380, hi = 720, X = function (l) { return 20 + (l - lo) / (hi - lo) * (W0 - 40); }, sy = H0 * 0.22, sh = H0 * 0.32;
        for (var l = lo; l <= hi; l += 1) { ctx.fillStyle = wl2rgb(l); ctx.fillRect(X(l), sy, X(l + 1) - X(l) + 0.5, sh); }
        lines.forEach(function (l0, i) { var l1 = PM.redshift(l0, vkm); line(ctx, X(l0), sy - 10, X(l0), sy + sh + 10, k.muted, 1.2, [3, 3]); ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(X(l1) - 1.5, sy, 3, sh); ctx.restore(); if (i === 0) F.tagAt(ctx, 'line', X(l1), sy - 18); if (i === 0 && F.vals) { arrow(ctx, X(l0), sy + sh + 18, X(l1), sy + sh + 18, { color: vkm >= 0 ? k.red : k.blue, w: 2 }); } });
        for (var t = 400; t <= 700; t += 50) { line(ctx, X(t), sy + sh, X(t), sy + sh + 5, k.axis, 1); txt(ctx, String(t), X(t), sy + sh + 32, { align: 'center', size: 10.5, color: k.muted }); } txt(ctx, 'wavelength (nm)', W0 - 20, sy + sh + 46, { align: 'right', size: 11, color: k.muted });
        txt(ctx, 'dashed: lines at rest (hydrogen); black: observed', 20, sy - 22, { size: 11, color: k.muted });
        var z = PM.redshift(lines[0], vkm) / lines[0] - 1;
        F.desc('Hydrogen absorption lines from an object ' + (vkm >= 0 ? 'moving away' : 'approaching') + (F.quiet ? '.' : ' at ' + un(M.abs(vkm), 'km/s') + '; every line shifts by ' + fm(z * 100, 2) + '% of its wavelength.'));
        F.read('Δλ/λ = v/c (for v much less than c): <b>' + (vkm >= 0 ? 'redshift' : 'blueshift') + '</b> of ' + fm(M.abs(z) * 100, 2) + '%. Every line moves by the same fraction, so astronomers measure the speed from the pattern. The object does not turn red: its overall color barely changes.');
        F.stats([['speed', un(vkm, 'km/s', 3)], ['Δλ/λ', nf(z, 3)], ['Hα observed', un(PM.redshift(lines[0], vkm), 'nm', 4)]]);
      };
      F.now(); return {};
    }
    var obs = arr(o.observers || [{ x: 1, y: 0 }, { x: -1, y: 0 }]), A = F.anim({ tmax: undefined, scrub: false, autoplay: true, tick: function () { return true; }, dt: 0.05 });
    if (F.live) F.slider(null, { label: 'Source speed', min: 0, max: 700, step: 5, value: vs, unit: 'm/s', d: 0, input: function (v) { vs = v; } });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, t = A.t; bg(c);
      var sc = M.min(W0, H0) * 0.42 / vw, Tdisp = 0.32, per = Tdisp, span = 3.2, cx0 = W0 / 2, cy0 = H0 / 2, tt = t % span, mach = vs / vw;
      var sx = function (tm) { return cx0 + (tm - span / 2) * vs * sc * 0.5; };
      for (var n = 0; n * per <= tt; n++) { var te = n * per, r = (tt - te) * vw * sc * 0.5; if (r > M.max(W0, H0)) continue; circ(ctx, sx(te), cy0, r, { color: rgba(k.acc, 0.85 - 0.6 * (tt - te) / span), w: 1.6 }); }
      var sxp = sx(tt); ball(ctx, sxp, cy0, 8, k.red); if (vs > 0) arrow(ctx, sxp + 10, cy0, sxp + 10 + 30, cy0, { color: k.vel, w: 2.4 }); F.tagAt(ctx, 'source', sxp, cy0 - 22);
      if (mach > 1 && F.on('cone', true)) { var ha = M.asin(1 / mach), Lc = W0; [1, -1].forEach(function (s) { line(ctx, sxp, cy0, sxp - Lc * M.cos(ha), cy0 + s * Lc * M.sin(ha), k.red, 2.2); }); txt(ctx, 'Mach cone' + (F.vals ? ', half-angle ' + fm(ha / DEG, 1) + '°' : ''), sxp - 60, cy0 - 60 * M.tan(ha) - 14, { align: 'right', size: 11.5, color: k.red, halo: true, weight: 700 }); F.tagAt(ctx, 'cone', sxp - 80, cy0 + 80 * M.tan(ha)); }
      obs.forEach(function (ob, i) { var ox = cx0 + num(ob.x, 1) * W0 * 0.42, oy = cy0 + num(ob.y, 0) * H0 * 0.4, ahead = ox > sxp, fh = mach < 1 ? PM.doppler(f, vw, ahead ? vs : -vs, 0) : null; circ(ctx, ox, oy, 7, { fill: k.purple }); txt(ctx, (ahead ? 'ahead' : 'behind') + (F.vals && fh ? ': ' + un(fh, 'Hz', 3) : ''), ox, oy + 20, { align: 'center', size: 11.5, color: k.purple, halo: true, weight: 700 }); F.tagAt(ctx, i ? 'obsB' : 'obsA', ox, oy - 20); });
      var fa = PM.doppler(f, vw, vs, 0), fb = PM.doppler(f, vw, -vs, 0);
      F.desc('A source of ' + un(f, 'Hz') + ' moving at ' + un(vs, 'm/s') + ' through air (sound at ' + un(vw, 'm/s') + ').' + (mach > 1 ? ' It outruns its own waves, which pile up into a cone.' : ''));
      F.read(mach < 1 ? 'Wavefronts bunch up ahead and spread out behind. Ahead: f′ = f·v/(v − v<sub>s</sub>) = <b>' + un(fa, 'Hz', 3) + '</b>; behind: f·v/(v + v<sub>s</sub>) = <b>' + un(fb, 'Hz', 3) + '</b>. The pitch is steady while it approaches, then drops as it passes; it does not keep rising.' : 'Faster than sound (Mach ' + fm(mach, 2) + '): the wavefronts overlap along a cone with sin θ = v/v<sub>s</sub>. The boom is heard by each listener as the cone sweeps past them, for as long as the source stays supersonic, not only when it "breaks the barrier".');
      F.stats([['Mach number', fm(mach, 2)], ['ahead', mach < 1 ? un(fa, 'Hz', 3) : '—'], ['behind', un(fb, 'Hz', 3)]]);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-fluids
  /* PM.bernoulli(p): continuity and Bernoulli along a pipe: p = {P1 (Pa), v1, A1, A2, h1, h2, rho}. Returns {v2, P2}. */
  PM.bernoulli = function (p) { var g = 9.8, v2 = p.v1 * p.A1 / p.A2; return { v2: v2, P2: p.P1 + 0.5 * p.rho * (p.v1 * p.v1 - v2 * v2) + p.rho * g * (p.h1 - p.h2) }; };
  /* PM.drain(h0, Ahole, Atank, t): water height in a draining tank (Torricelli: v = √(2gh)) */
  PM.drain = function (h0, a, Atk, t) { var s = M.sqrt(h0) - (a / Atk) * M.sqrt(9.8 / 2) * t; return s > 0 ? s * s : 0; };
  R('ph-fluids', function (el, o) {
    var mode = pick(o.mode, ['pressure-area', 'depth', 'manometer', 'hydraulic', 'buoyancy', 'float', 'flow', 'drain'], 'depth');
    var F = frame(el, o, { 'pressure-area': 'The same weight on different areas', depth: 'Pressure at depth in containers of different shapes', manometer: 'A U-tube manometer', hydraulic: 'A hydraulic lift', buoyancy: 'An object on a spring scale lowered into water', float: 'Floating and sinking', flow: 'Water flowing through a pipe that narrows and rises', drain: 'A tank draining through a hole' }[mode]);
    var g = num(o.g, 9.8), rho = num(o.rho, 1000), P = { depth: num(o.depth, 1.0), F: num(o.F, mode === 'hydraulic' ? 200 : 600), A: num(o.A, 0.03), A1: num(o.A1, mode === 'hydraulic' ? 0.01 : 0.02), A2: num(o.A2, mode === 'hydraulic' ? 0.5 : 0.008), h1: num(o.h1, 0), h2: num(o.h2, 1), v1: num(o.v1, 1.5), objRho: num(o.objRho, 2700), objV: num(o.objV, 0.001), dip: 0, gp: num(o.gauge, 2000), gd: 0.5 };
    var c = F.canvas({ aspect: mode === 'flow' ? 1.9 : 1.6, narrow: 1.05 }), A = null;
    var Tdrain = M.sqrt(num(o.h0, 2)) / (num(o.Ahole, 0.002) / num(o.Atank, 0.5) * M.sqrt(9.8 / 2));
    if (mode === 'drain' || mode === 'flow' || mode === 'buoyancy') A = F.anim({ tmax: mode === 'buoyancy' ? 1 : mode === 'drain' ? Tdrain : undefined, scrub: mode !== 'flow', loop: false, rate: mode === 'drain' ? Tdrain / 10 : mode === 'buoyancy' ? 0.25 : 1, autoplay: mode !== 'buoyancy', tick: mode === 'flow' ? function () { return true; } : null, dt: mode === 'drain' ? Tdrain / 40 : 0.05, tStatic: num(o.t, mode === 'buoyancy' ? 0.6 : 0), tlabel: mode === 'buoyancy' ? 'Lowered' : 'Time', tfmt: mode === 'buoyancy' ? function (v) { return fm(v * 100, 0) + '%'; } : null });
    if (F.live) {
      var row = F.row();
      if (mode === 'pressure-area') F.slider(row, { label: 'Contact area A', min: 0.001, max: 0.3, step: 0.001, value: P.A, unit: 'm²', d: 3, input: function (v) { P.A = v; } });
      if (mode === 'depth') F.slider(row, { label: 'Gauge depth', min: 0, max: P.depth, step: 0.05, value: P.gd, unit: 'm', d: 2, input: function (v) { P.gd = v; } });
      if (mode === 'manometer') F.slider(row, { label: 'Gas gauge pressure', min: -3000, max: 6000, step: 100, value: P.gp, unit: 'Pa', d: 0, input: function (v) { P.gp = v; } });
      if (mode === 'hydraulic') { F.slider(row, { label: 'Force on small piston', min: 0, max: 400, step: 10, value: P.F, unit: 'N', d: 0, input: function (v) { P.F = v; } }); F.slider(row, { label: 'Large piston area', min: 0.05, max: 1, step: 0.01, value: P.A2, unit: 'm²', d: 2, input: function (v) { P.A2 = v; } }); }
      if (mode === 'buoyancy') F.slider(row, { label: 'Object density', min: 200, max: 8000, step: 100, value: P.objRho, unit: 'kg/m³', d: 0, input: function (v) { P.objRho = v; } });
      if (mode === 'flow') { F.slider(row, { label: 'Narrow section area', min: 0.002, max: 0.02, step: 0.001, value: P.A2, unit: 'm²', d: 3, input: function (v) { P.A2 = v; } }); F.slider(row, { label: 'Rise h₂', min: 0, max: 2, step: 0.1, value: P.h2, unit: 'm', d: 1, input: function (v) { P.h2 = v; } }); }
    }
    function gauge(ctx, k, x, y, val, mx, lab, id) { circ(ctx, x, y, 17, { fill: k.bg, color: k.ink, w: 2 }); var a = PI * 0.75 + clamp(val / mx, 0, 1) * PI * 1.5; line(ctx, x, y, x + 13 * M.cos(a), y + 13 * M.sin(a), k.red, 2); circ(ctx, x, y, 2.5, { fill: k.ink }); if (lab) txt(ctx, lab, x, y + 28, { align: 'center', size: 11, color: k.ink, weight: 700, halo: true }); if (id) F.tagAt(ctx, id, x + 22, y - 18); }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, t = A ? A.t : 0, desc = '', read = '', st = []; bg(c);
      if (mode === 'pressure-area') {
        var areas = arr(o.areas || [P.A, 0.2]).map(num); if (F.live) areas[0] = P.A; var n = areas.length, cw = W0 / n, snowY = H0 * 0.62;
        ctx.save(); ctx.fillStyle = k.isDark ? '#2c3a44' : '#eef3f8'; ctx.fillRect(0, snowY, W0, H0 - snowY); ctx.restore(); line(ctx, 0, snowY, W0, snowY, k.muted, 1.5);
        areas.forEach(function (Ar, i) { var pr = P.F / Ar, sink = clamp(M.log10(pr / 1000) * 18, 0, 70), x = cw * (i + 0.5), w = clamp(M.sqrt(Ar) * 300, 6, cw * 0.8); block(ctx, x - 26, snowY + sink - 90, 52, 70, { label: un(P.F, 'N'), size: 11 }); block(ctx, x - w / 2, snowY + sink - 20, w, 20, { fill: k.obj2, color: k.obj2Line, r: 3 }); txt(ctx, 'A = ' + un(Ar, 'm²', 3), x, snowY + sink + 16, { align: 'center', size: 11.5, color: k.ink, halo: true }); if (F.vals) txt(ctx, 'P = ' + un(pr, 'Pa', 3), x, snowY + sink + 34, { align: 'center', size: 12, weight: 700, color: k.red, halo: true }); F.tagAt(ctx, 'p' + (i + 1), x + 34, snowY + sink - 80); });
        desc = 'The same ' + un(P.F, 'N') + ' weight resting on ' + areas.map(function (a) { return un(a, 'm²'); }).join(' and ') + '.'; read = 'P = F/A: the same force spread over a bigger area makes a <b>smaller pressure</b>, so snowshoes sink less. ' + areas.map(function (a) { return un(a, 'm²', 3) + ' → ' + un(P.F / a, 'Pa', 3); }).join('; ') + '.';
      } else if (mode === 'depth') {
        var shapes = arr(o.shapes || ['narrow', 'wide', 'flared', 'tapered']), n2 = shapes.length, cw2 = W0 / n2, top = 30, bot = H0 - 40, dpx = (bot - top) * 0.9, wy = bot - dpx;
        shapes.forEach(function (sp, i) { var cx0 = cw2 * (i + 0.5), wb = sp === 'narrow' ? cw2 * 0.22 : sp === 'tapered' ? cw2 * 0.7 : sp === 'flared' ? cw2 * 0.22 : cw2 * 0.7, wt = sp === 'flared' ? cw2 * 0.8 : sp === 'tapered' ? cw2 * 0.22 : wb; poly(ctx, [[cx0 - wt / 2, wy], [cx0 + wt / 2, wy], [cx0 + wb / 2, bot], [cx0 - wb / 2, bot]], { fill: k.water, close: true }); poly(ctx, [[cx0 - wt / 2 - 4, wy - 14], [cx0 - wb / 2, bot], [cx0 + wb / 2, bot], [cx0 + wt / 2 + 4, wy - 14]], { color: k.ink, w: 2.5 });
          var gy0 = wy + P.gd / P.depth * dpx, ww = wt + (wb - wt) * (P.gd / P.depth); circ(ctx, cx0, gy0, 4, { fill: k.red }); var pg = rho * g * P.gd; gauge(ctx, k, cx0 + M.max(ww / 2, 10) + 24, gy0, pg, rho * g * P.depth, F.vals ? un(pg, 'Pa', 3) : '', 'g' + i); line(ctx, cx0, gy0, cx0 + M.max(ww / 2, 10) + 7, gy0, k.red, 1.2, [3, 2]); });
        line(ctx, 4, wy, W0 - 4, wy, k.waterLine, 1, [6, 4]); txt(ctx, 'same water level, depth ' + un(P.depth, 'm', 3), 8, wy - 22, { size: 11, color: k.muted });
        desc = n2 + ' containers of different shapes filled to the same depth, with a gauge ' + un(P.gd, 'm', 2) + ' down in each.'; read = 'Gauge pressure = ρgh = <b>' + un(rho * g * P.gd, 'Pa', 3) + '</b> at ' + un(P.gd, 'm', 2) + ' in every container. Pressure depends on depth only, not on the container\'s shape or how much water it holds.';
        st = [['depth', un(P.gd, 'm', 3)], ['gauge pressure ρgh', un(rho * g * P.gd, 'Pa', 3)], ['absolute (+101 kPa)', un(101325 + rho * g * P.gd, 'Pa', 4)]];
      } else if (mode === 'manometer') {
        var h = P.gp / (rho * g), sc = M.min(H0 * 0.32 / 0.6, 260), base = H0 * 0.62, lx = W0 * 0.45, rx = W0 * 0.62, tw = 18, dy = h * sc / 2;
        ctx.save(); ctx.fillStyle = k.water; ctx.fillRect(lx - tw / 2, base + dy, tw, H0 - 30 - base - dy); ctx.fillRect(rx - tw / 2, base - dy, tw, H0 - 30 - base + dy); ctx.fillRect(lx - tw / 2, H0 - 40, rx - lx + tw, 14); ctx.restore();
        poly(ctx, [[lx - tw / 2, 40], [lx - tw / 2, H0 - 26], [rx + tw / 2, H0 - 26], [rx + tw / 2, 20]], { color: k.ink, w: 2 }); poly(ctx, [[lx + tw / 2, 60], [lx + tw / 2, H0 - 40], [rx - tw / 2, H0 - 40], [rx - tw / 2, 20]], { color: k.ink, w: 2 });
        rrect(ctx, lx - 120, 20, 120 - tw / 2 + 9, 46, 8); ctx.fillStyle = rgba(k.gold, 0.25); ctx.fill(); ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.stroke(); txt(ctx, 'gas', lx - 70, 43, { align: 'center', size: 12, weight: 700 });
        line(ctx, rx + 30, base - dy, rx + 30, base + dy, k.red, 2); line(ctx, lx - 14, base + dy, rx + 36, base + dy, k.red, 1, [3, 3]); line(ctx, rx - 14, base - dy, rx + 36, base - dy, k.red, 1, [3, 3]); txt(ctx, 'h' + (F.vals ? ' = ' + un(M.abs(h) * 100, 'cm', 3) : ''), rx + 36, base, { size: 12, color: k.red, weight: 700 }); txt(ctx, 'open to the air', rx, 12, { align: 'center', size: 11, color: k.muted });
        desc = 'A water manometer connected to a gas at gauge pressure ' + un(P.gp, 'Pa') + '.'; read = 'The gas pushes the water down on its side until the extra column balances it: P<sub>gas</sub> − P<sub>atm</sub> = ρgh, so h = <b>' + un(h * 100, 'cm', 3) + '</b>' + (h < 0 ? ' (the gas is below atmospheric pressure, so its side rises).' : '.');
      } else if (mode === 'hydraulic') {
        var F2 = P.F * P.A2 / P.A1, d1 = 0.3, d2 = d1 * P.A1 / P.A2, w1 = 30, w2 = clamp(30 * M.sqrt(P.A2 / P.A1), 60, W0 * 0.45), bot2 = H0 - 30, lx2 = W0 * 0.2, rx2 = W0 * 0.66, lvl = H0 * 0.45;
        ctx.save(); ctx.fillStyle = rgba(k.gold, 0.35); ctx.fillRect(lx2 - w1 / 2, lvl, w1, bot2 - lvl); ctx.fillRect(rx2 - w2 / 2, lvl, w2, bot2 - lvl); ctx.fillRect(lx2, bot2 - 26, rx2 - lx2, 26); ctx.restore();
        block(ctx, lx2 - w1 / 2, lvl - 12, w1, 12, { fill: k.metal, color: k.ink, r: 2 }); block(ctx, rx2 - w2 / 2, lvl - 12, w2, 12, { fill: k.metal, color: k.ink, r: 2 }); block(ctx, rx2 - 40, lvl - 64, 80, 52, { label: 'car', size: 12 });
        arrow(ctx, lx2, lvl - 70, lx2, lvl - 14, { color: k.accel, w: 3 }); txt(ctx, 'F₁' + (F.vals ? ' = ' + un(P.F, 'N', 3) : ''), lx2 + 12, lvl - 60, { size: 12, color: k.accel, weight: 700, halo: true }); arrow(ctx, rx2 + w2 / 2 + 20, lvl - 6, rx2 + w2 / 2 + 20, lvl - 60, { color: k.force, w: 3 }); txt(ctx, 'F₂' + (F.vals ? ' = ' + un(F2, 'N', 3) : ''), rx2 + w2 / 2 + 28, lvl - 40, { size: 12, color: k.force, weight: 700, halo: true });
        txt(ctx, 'A₁ = ' + un(P.A1, 'm²', 3), lx2, bot2 + 14, { align: 'center', size: 11, color: k.muted }); txt(ctx, 'A₂ = ' + un(P.A2, 'm²', 3), rx2, bot2 + 14, { align: 'center', size: 11, color: k.muted }); F.tagAt(ctx, 'p1', lx2 - 28, lvl - 20); F.tagAt(ctx, 'p2', rx2 - w2 / 2 - 16, lvl - 20);
        desc = 'A hydraulic lift: ' + un(P.F, 'N') + ' on a ' + un(P.A1, 'm²') + ' piston connected to a ' + un(P.A2, 'm²') + ' piston.'; read = 'Pascal\'s principle: the pressure F₁/A₁ = <b>' + un(P.F / P.A1, 'Pa', 3) + '</b> is the same everywhere, so F₂ = <b>' + un(F2, 'N', 3) + '</b>. But pushing the small piston down ' + un(d1 * 100, 'cm', 3) + ' lifts the big one only <b>' + un(d2 * 100, 'cm', 3) + '</b>: work in = work out = ' + un(P.F * d1, 'J', 3) + '. No free energy.';
        st = [['pressure', un(P.F / P.A1, 'Pa', 3)], ['F₂', un(F2, 'N', 3)], ['work in', un(P.F * d1, 'J', 3)], ['work out', un(F2 * d2, 'J', 3)]];
      } else if (mode === 'buoyancy') {
        var Vo = P.objV, mo = P.objRho * Vo, Wt = mo * g, side = M.cbrt(Vo), spx = 70, frac = clamp(t, 0, 1), sub0 = clamp((frac - 0.3) / 0.6, 0, 1), sinkF = P.objRho > rho, sub1 = sub0, Fb = rho * Vo * sub1 * g, rdg = M.max(0, Wt - Fb);
        var tankX = W0 * 0.3, tankW = W0 * 0.34, wl = H0 * 0.48, tb = H0 - 24, oy0 = 60 + frac * (wl - 60 + spx * 0.6) - 0;
        ctx.save(); ctx.fillStyle = k.water; ctx.fillRect(tankX, wl, tankW, tb - wl); ctx.restore(); poly(ctx, [[tankX, wl - 30], [tankX, tb], [tankX + tankW, tb], [tankX + tankW, wl]], { color: k.ink, w: 2.5 }); line(ctx, tankX + tankW, wl, tankX + tankW + 26, wl + 8, k.ink, 2.5);
        var cupX = tankX + tankW + 20, cupH = 60, spill = Vo * sub1 / 0.001 * 30; ctx.save(); ctx.fillStyle = k.water; ctx.fillRect(cupX, tb - M.min(cupH, spill), 50, M.min(cupH, spill)); ctx.restore(); poly(ctx, [[cupX, tb - cupH], [cupX, tb], [cupX + 50, tb], [cupX + 50, tb - cupH]], { color: k.ink, w: 2 }); txt(ctx, 'spilled water', cupX + 25, tb - cupH - 10, { align: 'center', size: 10.5, color: k.muted }); F.tagAt(ctx, 'cup', cupX + 64, tb - cupH);
        var oy = wl - spx * (1 - sub1) - (frac < 0.3 ? (0.3 - frac) * 300 : 0), ox = tankX + tankW / 2 - spx / 2; block(ctx, ox, oy, spx, spx * 0.9, { fill: k.obj2, color: k.obj2Line, r: 4 }); F.tagAt(ctx, 'obj', ox - 14, oy + 10);
        line(ctx, ox + spx / 2, 30, ox + spx / 2, oy, k.metal, 1.5); block(ctx, ox + spx / 2 - 18, 6, 36, 26, { fill: k.bg, color: k.ink, r: 4 }); txt(ctx, F.vals ? nf(rdg, 3) + ' N' : 'scale', ox + spx / 2, 19, { align: 'center', size: 10.5, weight: 700, color: k.ink });
        var fs = 50 / Wt; arrow(ctx, ox + spx + 18, oy + spx * 0.45, ox + spx + 18, oy + spx * 0.45 + Wt * fs, { color: k.force, w: 2.6, label: 'weight' }); if (Fb > 1e-6) arrow(ctx, ox - 18, oy + spx * 0.45, ox - 18, oy + spx * 0.45 - Fb * fs, { color: k.teal, w: 2.6, label: 'buoyant' });
        desc = 'A ' + fm(P.objRho, 0) + ' kg/m³ block of volume ' + un(Vo * 1000, 'L', 3) + ' hanging from a spring scale, ' + fm(sub1 * 100, 0) + '% under water.' + (F.quiet ? '' : ' The scale reads ' + un(rdg, 'N', 3) + '.');
        read = 'Buoyant force = weight of the water pushed aside = ρ<sub>water</sub>V<sub>sub</sub>g = <b>' + un(Fb, 'N', 3) + '</b>. The scale reading drops by exactly that: <b>' + un(rdg, 'N', 3) + '</b> (out of the water: ' + un(Wt, 'N', 3) + '). It depends on the volume under water, not on the object\'s weight.' + (sinkF ? '' : ' This block is less dense than water: let go and it would float.');
        st = [['weight', un(Wt, 'N', 3)], ['buoyant force', un(Fb, 'N', 3)], ['scale reads', un(rdg, 'N', 3)], ['submerged', fm(sub1 * 100, 0) + '%']];
      } else if (mode === 'float') {
        var objs = arr(o.objects || [{ label: 'pine log', rho: 500, w: 1.6 }, { label: 'ice', rho: 917, w: 0.8 }, { label: 'pebble', rho: 2600, w: 0.25 }, { label: 'oak', rho: 750, w: 0.9 }]), wl2 = H0 * 0.38, scale = M.min(70, W0 / 9);
        ctx.save(); ctx.fillStyle = k.water; ctx.fillRect(0, wl2, W0, H0 - wl2); ctx.restore(); line(ctx, 0, wl2, W0, wl2, k.waterLine, 2);
        objs.forEach(function (ob, i) { var r0 = num(ob.rho, 500), w0 = num(ob.w, 1) * scale, h0 = M.min(w0, scale * 0.8), x = W0 * (i + 0.5) / objs.length, f0 = r0 / rho; var y = f0 < 1 ? wl2 - h0 * (1 - f0) : H0 - 10 - h0; block(ctx, x - w0 / 2, y, w0, h0, { fill: k.obj2, color: k.obj2Line, r: 3 }); txt(ctx, ob.label || 'object', x, y - 12, { align: 'center', size: 11.5, weight: 700, halo: true }); txt(ctx, fm(r0, 0) + ' kg/m³' + (F.vals ? (f0 < 1 ? ' · ' + fm(f0 * 100, 0) + '% under' : ' · sinks') : ''), x, M.min(H0 - 6, y + h0 + 14), { align: 'center', size: 10.5, color: k.ink, halo: true }); F.tagAt(ctx, 'obj' + i, x + w0 / 2 + 12, y); });
        desc = 'Objects in water: ' + objs.map(function (ob) { return (ob.label || 'object') + ' (' + fm(num(ob.rho, 500), 0) + ' kg/m³)'; }).join(', ') + '.'; read = 'Whether a thing floats depends on its <b>density</b>, not its weight: a heavy log floats and a small pebble sinks. A floating object sinks until the water it pushes aside weighs as much as it does, so the fraction under water = ρ<sub>object</sub>/ρ<sub>water</sub>.';
      } else if (mode === 'flow') {
        var bern = PM.bernoulli({ P1: 150000, v1: P.v1, A1: P.A1, A2: P.A2, h1: P.h1, h2: P.h2, rho: rho }), x0 = 20, x1 = W0 * 0.38, x2 = W0 * 0.58, x3 = W0 - 20, hs = 50, yb = H0 * 0.78, rise = P.h2 * 50, d1 = M.sqrt(P.A1) * 260, d2 = M.sqrt(P.A2) * 260;
        var top1 = yb - d1, top2 = yb - rise - d2; poly(ctx, [[x0, top1], [x1, top1], [x2, top2], [x3, top2], [x3, yb - rise], [x2, yb - rise], [x1, yb], [x0, yb]], { fill: k.water, close: true, color: k.waterLine, w: 2 });
        var ph = (t * 60) % 1000; for (var r = 0; r < 3; r++) { var f1 = (r + 0.5) / 3; dotsAlong(ctx, [[x0, yb - d1 * f1], [x1, yb - d1 * f1], [x2, yb - rise - d2 * f1], [x3, yb - rise - d2 * f1]], ph * (1 + r * 0.01), 26, k.acc, 2.4); }
        var pmax = 160000; [[x0 + 40, top1, 150000, 'g0', 'p1'], [(x2 + x3) / 2, top2, bern.P2, 'g1', 'p2']].forEach(function (q) { var colH = (q[2] - 100000) / rho / g * 30; line(ctx, q[0] - 6, q[1], q[0] - 6, q[1] - colH, k.ink, 1.5); line(ctx, q[0] + 6, q[1], q[0] + 6, q[1] - colH, k.ink, 1.5); ctx.save(); ctx.fillStyle = k.water; ctx.fillRect(q[0] - 6, q[1] - colH, 12, colH); ctx.restore(); if (F.vals) txt(ctx, un(q[2] / 1000, 'kPa', 3), q[0] + 12, q[1] - colH + 6, { size: 11, weight: 700, color: k.ink, halo: true }); F.tagAt(ctx, q[3], q[0] - 22, q[1] - colH); F.tagAt(ctx, q[4], q[0], yb + 14); });
        void pmax;
        arrow(ctx, x0 + 60, (top1 + yb) / 2, x0 + 60 + P.v1 * 16, (top1 + yb) / 2, { color: k.vel, w: 3, label: F.vals ? un(P.v1, 'm/s', 2) : 'v₁' }); arrow(ctx, x2 + 20, (top2 + yb - rise) / 2, x2 + 20 + bern.v2 * 16, (top2 + yb - rise) / 2, { color: k.vel, w: 3, label: F.vals ? un(bern.v2, 'm/s', 2) : 'v₂' });
        desc = 'Water flowing at ' + un(P.v1, 'm/s') + ' through a pipe that narrows from ' + un(P.A1, 'm²') + ' to ' + un(P.A2, 'm²') + ' and rises ' + un(P.h2, 'm') + '.'; read = 'Continuity: A₁v₁ = A₂v₂, so the water <b>speeds up</b> in the narrow part (v₂ = <b>' + un(bern.v2, 'm/s', 3) + '</b>). Bernoulli: faster flow and higher ground both mean <b>lower pressure</b>: P₂ = <b>' + un(bern.P2 / 1000, 'kPa', 3) + '</b> (from ' + un(150, 'kPa') + ').';
        st = [['v₁', un(P.v1, 'm/s', 3)], ['v₂', un(bern.v2, 'm/s', 3)], ['P₁', un(150, 'kPa', 3)], ['P₂', un(bern.P2 / 1000, 'kPa', 3)]];
      } else {
        var h0 = num(o.h0, 2), Atk = num(o.Atank, 0.5), ah = num(o.Ahole, 0.002), hh = PM.drain(h0, ah, Atk, t), vout = M.sqrt(2 * g * hh), tx2 = W0 * 0.25, tw2 = W0 * 0.3, tb2 = H0 * 0.72, s2 = (tb2 - 30) / h0;
        ctx.save(); ctx.fillStyle = k.water; ctx.fillRect(tx2, tb2 - hh * s2, tw2, hh * s2); ctx.restore(); poly(ctx, [[tx2, 20], [tx2, tb2], [tx2 + tw2, tb2], [tx2 + tw2, 20]], { color: k.ink, w: 2.5 }); ground(ctx, 10, H0 - 12, W0 - 20, k);
        if (hh > 0) { var pts = []; for (var q2 = 0; q2 < 40; q2++) { var tt2 = q2 * 0.012, xx = tx2 + tw2 + vout * tt2 * 60, yy = tb2 - 6 + 0.5 * g * tt2 * tt2 * 60; if (yy > H0 - 12) break; pts.push([xx, yy]); } poly(ctx, pts, { color: k.waterLine, w: 4 }); arrow(ctx, tx2 + tw2 + 2, tb2 - 6, tx2 + tw2 + 2 + vout * 10, tb2 - 6, { color: k.vel, w: 2.4 }); }
        if (F.vals) txt(ctx, 'h = ' + un(hh, 'm', 3), tx2 + tw2 / 2, tb2 - hh * s2 - 10, { align: 'center', size: 12, weight: 700, halo: true });
        desc = 'A tank with water ' + un(hh, 'm', 2) + ' deep draining through a hole at the bottom.'; read = 'Torricelli: water leaves at v = √(2gh) = <b>' + un(vout, 'm/s', 3) + '</b>, as fast as if it had fallen from the surface. As the level drops the flow slows, so the tank empties more and more slowly.';
        st = [['depth h', un(hh, 'm', 3)], ['exit speed', un(vout, 'm/s', 3)]];
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-gas: a 2-D box of hard-sphere atoms. Simulation units: k_B = 1, light atom mass 1; T_display (K) = 300 × kT_sim.
  /* PM.mb2d(v, m, kT): the 2-D Maxwell–Boltzmann speed distribution (m v / kT) exp(−m v² / 2kT) */
  PM.mb2d = function (v, m, kT) { return m * v / kT * M.exp(-m * v * v / (2 * kT)); };
  R('ph-gas', function (el, o) {
    var F = frame(el, o, 'A box of gas atoms with a piston');
    var masses = arr(o.masses || [1]).map(function (m) { return num(m, 1); }).slice(0, 2), N = clamp(M.round(num(o.N, 80)), 4, 200), T0 = num(o.T, 300), fixed = pick(o.fixed, ['V', 'P', 'T'], 'T');
    var sh = { hist: F.on('histogram', true), read: F.on('readouts', true), trails: F.on('trails', false), celsius: F.on('celsius', true) };
    var S = { W: 1, H: num(o.V, 1), Ttarget: T0 / 300, atoms: [], imp: 0, Pavg: 0, tavg: 0, R: rng(num(o.seed, 11)), Ptarget: null };
    var rad = 0.012;
    function seed() { S.atoms = []; for (var i = 0; i < N; i++) { var m = masses[i % masses.length], sp = M.sqrt(-2 * S.Ttarget / m * M.log(1 - S.R() * 0.999)), a = S.R() * TAU; S.atoms.push({ x: rad + S.R() * (S.W - 2 * rad), y: rad + S.R() * (S.H - 2 * rad), vx: sp * M.cos(a), vy: sp * M.sin(a), m: m }); } S.Pavg = 0; S.tavg = 0; S.imp = 0; }
    seed();
    function kT() { var s = 0; S.atoms.forEach(function (a) { s += 0.5 * a.m * (a.vx * a.vx + a.vy * a.vy); }); return s / S.atoms.length; } // 2-D: <KE> = kT
    function step(h) {
      var n = M.max(1, M.ceil(h / 0.002)), dt = h / n * 0.5;
      for (var s = 0; s < n; s++) {
        S.atoms.forEach(function (a) { a.x += a.vx * dt; a.y += a.vy * dt;
          // thermal walls: the outgoing normal speed is flux-weighted (Rayleigh), the sideways speed Gaussian, both at the wall temperature
          function wn() { return M.sqrt(-2 * S.Ttarget / a.m * M.log(1 - S.R() * 0.9999)); }
          function gs() { return M.sqrt(-2 * M.log(1 - S.R() * 0.9999)) * M.cos(TAU * S.R()) * M.sqrt(S.Ttarget / a.m); }
          var v1;
          if (a.x < rad) { a.x = rad; v1 = wn(); S.imp += a.m * (M.abs(a.vx) + v1); a.vx = v1; a.vy = gs(); } else if (a.x > S.W - rad) { a.x = S.W - rad; v1 = wn(); S.imp += a.m * (M.abs(a.vx) + v1); a.vx = -v1; a.vy = gs(); }
          if (a.y < rad) { a.y = rad; v1 = wn(); S.imp += a.m * (M.abs(a.vy) + v1); a.vy = v1; a.vx = gs(); } else if (a.y > S.H - rad) { a.y = S.H - rad; v1 = wn(); S.imp += a.m * (M.abs(a.vy) + v1); a.vy = -v1; a.vx = gs(); } });
        for (var i = 0; i < S.atoms.length; i++) for (var j = i + 1; j < S.atoms.length; j++) { var a = S.atoms[i], b = S.atoms[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy; if (d2 < 4 * rad * rad && d2 > 0) { var d = M.sqrt(d2), nx = dx / d, ny = dy / d, rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny; if (rv < 0) { var J = 2 * rv / (1 / a.m + 1 / b.m); a.vx += J / a.m * nx; a.vy += J / a.m * ny; b.vx -= J / b.m * nx; b.vy -= J / b.m * ny; } var ov = 2 * rad - d; a.x -= nx * ov / 2; a.y -= ny * ov / 2; b.x += nx * ov / 2; b.y += ny * ov / 2; } }
        S.tavg += dt;
      }
      var per = 2 * (S.W + S.H), Pinst = S.imp / (per * S.tavg); if (S.tavg > 0.25) { S.Pavg = S.Pavg ? S.Pavg + (Pinst - S.Pavg) * 0.2 : Pinst; S.imp = 0; S.tavg = 0; }
      if (fixed === 'P' && S.Pavg > 0) { if (S.Ptarget == null) S.Ptarget = S.Pavg; S.H = clamp(S.H * M.pow(S.Pavg / S.Ptarget, 0.05), 0.3, 1.4); }
      return true;
    }
    var c = F.canvas({ aspect: 1.55, narrow: 0.75 });
    var A = F.anim({ tmax: undefined, scrub: false, autoplay: true, tick: step, dt: 0.05 });
    if (!F.live) step(1.0);
    if (F.live) {
      var row = F.row();
      F.slider(row, { label: fixed === 'V' ? 'Wall temperature (fixed volume)' : 'Wall temperature', min: 100, max: 900, step: 10, value: T0, unit: 'K', d: 0, input: function (v) { S.Ttarget = v / 300; } });
      if (fixed !== 'P') F.slider(row, { label: 'Volume (piston)', min: 0.3, max: 1.4, step: 0.02, value: S.H, d: 2, input: function (v) { S.H = v; S.atoms.forEach(function (a) { a.y = M.min(a.y, S.H - rad); }); S.Pavg = 0; } });
      F.slider(row, { label: 'Number of atoms', min: 10, max: 200, step: 10, value: N, d: 0, input: function (v) { N = v; seed(); } });
    }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, wide = W0 > 560; bg(c);
      var bw = wide ? W0 * 0.5 : W0 - 30, bh = wide ? H0 - 50 : H0 * 0.55, s = M.min(bw, bh / 1.4), bx = 15, by = H0 - (wide ? 20 : H0 * 0.42) - S.H * s;
      ctx.save(); ctx.fillStyle = k.space2; rrect(ctx, bx, by, S.W * s, S.H * s, 4); ctx.fill(); ctx.restore(); poly(ctx, [[bx, by], [bx, by + S.H * s], [bx + S.W * s, by + S.H * s], [bx + S.W * s, by]], { color: k.ink, w: 3 });
      block(ctx, bx - 4, by - 12, S.W * s + 8, 12, { fill: k.metal, color: k.ink, r: 2 }); line(ctx, bx + S.W * s / 2, by - 12, bx + S.W * s / 2, by - 40, k.ink, 4); F.tagAt(ctx, 'piston', bx + S.W * s + 16, by - 6);
      var kt = kT(); S.atoms.forEach(function (a) { var col = a.m > masses[0] + 1e-9 ? '#74c0fc' : '#ffd479'; circ(ctx, bx + a.x * s, by + (S.H - a.y) * s, M.max(2, rad * s * (a.m > 1 ? 1.25 : 1)), { fill: col }); });
      var Tk = kt * 300, area = S.W * S.H, Pv = S.Pavg, ratio = Pv > 0 ? Pv * area / (S.atoms.length * kt) : NaN;
      var px = wide ? bx + S.W * s + 30 : 15, py = wide ? 14 : H0 * 0.6 + 10, pw = wide ? W0 - px - 14 : W0 - 30;
      if (sh.hist) { var hr = { x: px + 30, y: py + 8, w: pw - 34, h: (wide ? H0 * 0.55 : H0 * 0.3) - 20 }, vmax = 3.2 * M.sqrt(S.Ttarget / masses[0]), nb = 16, bins = masses.map(function () { return new Array(nb).fill(0); }); S.atoms.forEach(function (a) { var v = M.hypot(a.vx, a.vy), bi = M.min(nb - 1, M.floor(v / vmax * nb)); bins[masses.indexOf(a.m)][bi]++; });
        var ymx = 0; bins.forEach(function (b) { b.forEach(function (q) { ymx = M.max(ymx, q); }); }); ymx = M.max(ymx, 4);
        var G = GP(ctx, hr, { xmin: 0, xmax: vmax, ymin: 0, ymax: ymx * 1.15, xlab: 'speed', ylab: 'number of atoms', compact: true, xticks: false }).frame();
        bins.forEach(function (b, mi) { b.forEach(function (q, i) { var x0 = i / nb * vmax, x1 = (i + 1) / nb * vmax; ctx.save(); ctx.fillStyle = mi ? 'rgba(116,192,252,0.55)' : 'rgba(255,212,121,0.75)'; ctx.fillRect(G.X(x0) + 1, G.Y(q), G.X(x1) - G.X(x0) - 2, G.Y(0) - G.Y(q)); ctx.restore(); }); var cnt = S.atoms.filter(function (a) { return a.m === masses[mi]; }).length; G.plot(function (v) { return cnt * vmax / nb * PM.mb2d(v, masses[mi], kt); }, mi ? k.blue : k.gold, 2); });
        F.tagAt(ctx, 'hist', hr.x + hr.w - 12, hr.y + 12); }
      if (sh.celsius && wide) { var ty = H0 * 0.62 + 10, tx = px + 10; [['K', Tk, 0, 1000], ['°C', Tk - 273.15, -273.15, 726.85]].forEach(function (q, i) { var x = tx + i * 90, h = H0 - ty - 30, fr = (q[1] - q[2]) / (q[3] - q[2]); rrect(ctx, x, ty, 14, h, 7); ctx.fillStyle = k.grid; ctx.fill(); rrect(ctx, x + 3, ty + h * (1 - fr), 8, h * fr, 4); ctx.fillStyle = k.red; ctx.fill(); circ(ctx, x + 7, ty + h + 6, 9, { fill: k.red }); txt(ctx, F.vals ? fm(q[1], 0) + ' ' + q[0] : q[0], x + 22, ty + h * (1 - fr), { size: 12, weight: 700 }); txt(ctx, i ? '0 °C = 273 K' : '0 K = −273 °C', x + 22, ty + h - 4, { size: 10, color: k.muted }); }); F.tagAt(ctx, 'thermo', tx - 6, ty - 4); }
      var spd = masses.map(function (m) { var arr2 = S.atoms.filter(function (a) { return a.m === m; }); return arr2.reduce(function (s0, a) { return s0 + M.hypot(a.vx, a.vy); }, 0) / M.max(1, arr2.length); });
      F.desc('A 2-D box of ' + S.atoms.length + ' atoms' + (masses.length > 1 ? ' of two kinds' : '') + ' at about ' + un(Tk, 'K', 3) + '.');
      F.read('Temperature is the atoms\' average kinetic energy (≈ <b>' + un(Tk, 'K', 3) + '</b>, ' + un(Tk - 273.15, '°C', 3) + '); pressure is their pushes on the walls. PV ÷ NkT = <b>' + (isFinite(ratio) ? fm(ratio, 2) : '…') + '</b> (it hovers near 1). The speeds spread out along the curve; no two atoms share one speed.' + (masses.length > 1 ? ' Heavy atoms move slower on average (' + fm(spd[1] / spd[0], 2) + ' times) but have the same average kinetic energy: same temperature.' : '') + ' Use kelvins in gas-law math: 0 °C is not "no motion".');
      F.stats([['temperature', un(Tk, 'K', 3)], ['volume (area)', fm(area, 2)], ['pressure (2-D units)', isFinite(Pv) && Pv > 0 ? nf(Pv, 3) : '…'], ['PV ÷ NkT', isFinite(ratio) ? fm(ratio, 2) : '…']]);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-thermal
  var WATER = { cIce: 2100, cWater: 4186, cSteam: 2010, Lf: 334000, Lv: 2256000 };
  /* PM.heatingCurve(m, T0, T1): segments of water's heating curve from T0 to T1 (°C): [{Q0, Q1, Ta, Tb, kind}] */
  PM.heatingCurve = function (m, T0, T1) {
    var segs = [], Q = 0;
    function add(Ta, Tb, cc, kind) { if (Tb <= Ta) return; var dq = m * cc * (Tb - Ta); segs.push({ Q0: Q, Q1: Q + dq, Ta: Ta, Tb: Tb, kind: kind }); Q += dq; }
    function phase(L, Tp, kind) { segs.push({ Q0: Q, Q1: Q + m * L, Ta: Tp, Tb: Tp, kind: kind }); Q += m * L; }
    if (T0 < 0) add(T0, M.min(0, T1), WATER.cIce, 'ice'); if (T1 > 0 && T0 <= 0) phase(WATER.Lf, 0, 'melting'); if (T1 > 0) add(M.max(0, T0), M.min(100, T1), WATER.cWater, 'water'); if (T1 > 100 && T0 <= 100) phase(WATER.Lv, 100, 'boiling'); if (T1 > 100) add(M.max(100, T0), T1, WATER.cSteam, 'steam');
    return segs;
  };
  PM.mixT = function (objs) { var a = 0, b = 0; objs.forEach(function (q) { a += q.m * q.c * q.T; b += q.m * q.c; }); return a / b; };
  var CONDUCT = { copper: 401, aluminum: 237, steel: 50, glass: 0.8, brick: 0.7, water: 0.6, wood: 0.12, 'foam': 0.03, air: 0.026 };
  R('ph-thermal', function (el, o) {
    var mode = pick(o.mode, ['heating-curve', 'mix', 'slab', 'transfer', 'entropy'], 'heating-curve');
    var F = frame(el, o, { 'heating-curve': 'The heating curve of water', mix: 'Mixing a hot and a cold object', slab: 'Heat conducted through a slab', transfer: 'Conduction, convection and radiation', entropy: 'Entropy when heat flows from hot to cold' }[mode]);
    var c = F.canvas({ aspect: mode === 'transfer' ? 2.2 : 1.7, narrow: mode === 'transfer' ? 0.8 : 1.0 }), A = null;
    var m = num(o.m, 1), T0 = num(o.T0, -20), T1 = num(o.T1, 120);
    var objs = arr(o.objects || [{ m: 0.5, c: 4186, T: 80, label: 'hot water' }, { m: 0.2, c: 900, T: 20, label: 'aluminum cup' }]).map(function (q) { return { m: num(q.m, 1), c: num(q.c, 4186), T: num(q.T, 20), label: q.label || 'object' }; });
    var P = { k: o.k != null ? num(o.k, 1) : CONDUCT[o.material] || 0.8, mat: o.material || 'glass', A: num(o.A, 1), d: num(o.d, 0.005), dT: num(o.dT, 20), Th: num(o.Th, 600), Tc: num(o.Tc, 300), Q: num(o.Q, 1000), q: 0 };
    var segs = PM.heatingCurve(m, T0, T1), Qtot = segs.length ? segs[segs.length - 1].Q1 : 1;
    if (mode === 'heating-curve') A = F.anim({ tmax: 1, rate: 0.1, autoplay: false, dt: 0.02, tStatic: num(o.q, 1), tlabel: 'Heat added', tfmt: function (v) { return un(v * Qtot / 1000, 'kJ', 3); } });
    if (mode === 'mix' || mode === 'transfer') A = F.anim({ tmax: mode === 'mix' ? 1 : undefined, scrub: mode === 'mix', rate: 0.2, autoplay: true, tick: mode === 'transfer' ? function () { return true; } : null, dt: 0.05, tStatic: 1, tlabel: 'Time' });
    if (F.live && mode === 'slab') { F.seg(null, { label: 'Material', items: [['copper', 'Copper'], ['steel', 'Steel'], ['glass', 'Glass'], ['wood', 'Wood'], ['foam', 'Foam']], value: P.mat in CONDUCT ? P.mat : 'glass', change: function (v) { P.mat = v; P.k = CONDUCT[v]; } }); F.slider(null, { label: 'Thickness d', min: 0.001, max: 0.1, step: 0.001, value: P.d, unit: 'm', d: 3, input: function (v) { P.d = v; } }); F.slider(null, { label: 'Temperature difference ΔT', min: 1, max: 60, step: 1, value: P.dT, unit: 'K', d: 0, input: function (v) { P.dT = v; } }); }
    if (F.live && mode === 'entropy') { F.slider(null, { label: 'Hot reservoir', min: 300, max: 1200, step: 10, value: P.Th, unit: 'K', d: 0, input: function (v) { P.Th = M.max(v, P.Tc + 10); } }); F.slider(null, { label: 'Cold reservoir', min: 100, max: 600, step: 10, value: P.Tc, unit: 'K', d: 0, input: function (v) { P.Tc = M.min(v, P.Th - 10); } }); }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, desc = '', read = '', st = []; bg(c);
      if (mode === 'heating-curve') {
        var q = clamp(A.t, 0, 1) * Qtot, wide = W0 > 560, r = { x: 50, y: 14, w: (wide ? W0 * 0.72 : W0) - 64, h: H0 - 40 }, G = GP(ctx, r, { xmin: 0, xmax: Qtot / 1000, ymin: M.min(T0, 0) - 10, ymax: T1 + 10, xlab: 'heat added Q (kJ)', ylab: 'T (°C)', compact: F.compact }).frame();
        var cur = null; segs.forEach(function (s0, i) { var col = s0.kind === 'ice' ? k.blue : s0.kind === 'water' ? k.teal : s0.kind === 'steam' ? k.red : k.purple; G.line([[s0.Q0 / 1000, s0.Ta], [s0.Q1 / 1000, s0.Tb]], rgba(col, 0.35), 2.6); var q1 = M.min(q, s0.Q1); if (q1 > s0.Q0) G.line([[s0.Q0 / 1000, s0.Ta], [q1 / 1000, s0.Ta + (s0.Tb - s0.Ta) * (q1 - s0.Q0) / (s0.Q1 - s0.Q0)]], col, 3); if (q >= s0.Q0 && q <= s0.Q1 + 1e-9) cur = s0;
          if (F.on('labels', true)) { var xm = G.X((s0.Q0 + s0.Q1) / 2000), ym = G.Y((s0.Ta + s0.Tb) / 2); var lab = s0.Ta === s0.Tb ? (s0.kind === 'melting' ? 'melting: Q = mL' + sub('f') : 'boiling: Q = mL' + sub('v')) : s0.kind + ': Q = mcΔT'; txt(ctx, lab, xm, ym + (s0.Ta === s0.Tb ? -12 : 14), { align: s0.Ta === s0.Tb ? 'center' : 'left', size: 11, color: col, halo: true, haloColor: k.panelBg, weight: 700 }); if (F.vals) txt(ctx, un((s0.Q1 - s0.Q0) / 1000, 'kJ', 3), xm, ym + (s0.Ta === s0.Tb ? 10 : 28), { align: s0.Ta === s0.Tb ? 'center' : 'left', size: 10.5, color: col, halo: true, haloColor: k.panelBg }); }
          F.tagAt(ctx, 'seg' + i, G.X((s0.Q0 + s0.Q1) / 2000), G.Y((s0.Ta + s0.Tb) / 2) + 26); });
        var Tn = cur ? cur.Ta + (cur.Tb - cur.Ta) * (cur.Q1 > cur.Q0 ? (q - cur.Q0) / (cur.Q1 - cur.Q0) : 0) : T1; G.dot(q / 1000, Tn, k.gold, 5.5); G.vline(q / 1000, k.gold, [4, 3]);
        if (wide) { var bx = W0 * 0.75, by = H0 * 0.25, frac = cur && cur.Ta === cur.Tb ? (q - cur.Q0) / (cur.Q1 - cur.Q0) : 0, kind = cur ? cur.kind : 'steam'; rrect(ctx, bx, by, W0 * 0.2, H0 * 0.5, 8); ctx.fillStyle = k.panelBg; ctx.fill(); var cx0 = bx + W0 * 0.1, cy0 = by + H0 * 0.32;
          if (kind === 'ice' || kind === 'melting') { block(ctx, cx0 - 22, cy0 - 30, 44 * (1 - frac * 0.6), 40, { fill: 'rgba(160,210,255,0.8)', color: '#74c0fc', r: 6 }); if (frac > 0) { ctx.save(); ctx.fillStyle = k.water; ctx.fillRect(cx0 - 34, cy0 + 10, 68, 8 + frac * 14); ctx.restore(); } }
          if (kind === 'water' || kind === 'boiling') { ctx.save(); ctx.fillStyle = k.water; ctx.fillRect(cx0 - 34, cy0 - 20 + frac * 20, 68, 48 - frac * 20); ctx.restore(); if (kind === 'boiling') for (var b = 0; b < 6; b++) circ(ctx, cx0 - 28 + b * 11, cy0 - 30 - (b % 3) * 12 - frac * 10, 4, { color: k.muted, w: 1.2 }); }
          if (kind === 'steam') for (var b2 = 0; b2 < 10; b2++) circ(ctx, cx0 - 30 + (b2 * 37) % 60, cy0 - 40 + (b2 * 23) % 60, 4, { color: k.muted, w: 1.2 });
          txt(ctx, kind, cx0, by + H0 * 0.5 - 16, { align: 'center', size: 12, weight: 700, color: k.ink }); txt(ctx, F.vals ? fm(Tn, 1) + ' °C' : '', cx0, by + 16, { align: 'center', size: 13, weight: 800, color: k.red }); }
        desc = 'Heating curve of ' + un(m, 'kg') + ' of water from ' + fm(T0, 0) + ' °C to ' + fm(T1, 0) + ' °C.'; read = 'While ice melts or water boils, the temperature <b>stays flat</b>: the heat (Q = mL) breaks bonds instead of speeding molecules up. Boiling takes about ' + fm(WATER.Lv / WATER.Lf, 1) + ' times the heat of melting. Now: ' + un(q / 1000, 'kJ', 3) + ' added, <b>' + fm(Tn, 1) + ' °C</b>' + (cur ? ' (' + cur.kind + ')' : '') + '.';
        st = [['heat added', un(q / 1000, 'kJ', 3)], ['temperature', fd(Tn, 1, '°C')]];
      } else if (mode === 'mix') {
        var Tf = PM.mixT(objs), fr = clamp(A.t, 0, 1), e = 1 - M.exp(-4 * fr), Ts = objs.map(function (q2) { return q2.T + (Tf - q2.T) * e; }), Tmin = M.min.apply(null, objs.map(function (q2) { return q2.T; })), Tmax = M.max.apply(null, objs.map(function (q2) { return q2.T; }));
        objs.forEach(function (q2, i) { var x = W0 * (0.25 + 0.5 * i), y = H0 * 0.45, hot = (Ts[i] - Tmin) / M.max(1, Tmax - Tmin); block(ctx, x - 60, y - 50, 120, 100, { fill: mixc(k.isDark ? '#1d4a6b' : '#d0e4f7', k.isDark ? '#7a2e2e' : '#f8c9c9', hot), color: k.ink, label: '' }); txt(ctx, q2.label, x, y - 30, { align: 'center', size: 12, weight: 700 }); txt(ctx, fm(q2.m, 2) + ' kg, c = ' + fm(q2.c, 0), x, y - 12, { align: 'center', size: 10.5, color: k.muted }); txt(ctx, F.vals || i < 0 ? fm(Ts[i], 1) + ' °C' : fm(q2.T, 1) + ' °C →', x, y + 16, { align: 'center', size: 16, weight: 800, color: k.red }); F.tagAt(ctx, 'obj' + i, x + 70, y - 50); });
        if (objs.length === 2) { var hotI = objs[0].T > objs[1].T ? 0 : 1, x1 = W0 * (0.25 + 0.5 * hotI) + (hotI ? -64 : 64), x2 = W0 * (0.25 + 0.5 * (1 - hotI)) + (hotI ? 64 : -64); if (e < 0.98) arrow(ctx, x1, H0 * 0.45, x2, H0 * 0.45, { color: k.eTh, w: 4 * (1 - e) + 1.5, label: 'heat' }); }
        var avg = objs.reduce(function (s0, q2) { return s0 + q2.T; }, 0) / objs.length;
        desc = 'Mixing ' + objs.map(function (q2) { return q2.label + ' at ' + fm(q2.T, 0) + ' °C'; }).join(' and ') + '.' + (F.quiet ? '' : ' They end at ' + fm(Tf, 1) + ' °C.');
        read = 'Heat lost by the hot one = heat gained by the cold one: Σmc(T<sub>f</sub> − T) = 0, so T<sub>f</sub> = Σ mcT / Σ mc = <b>' + fd(Tf, 1, '°C') + '</b>, not the plain average (' + fd(avg, 1, '°C') + '): the object with more mc changes less.';
        st = [['final T', fd(Tf, 1, '°C')], ['plain average', fd(avg, 1, '°C')]];
      } else if (mode === 'slab') {
        var rate = P.k * P.A * P.dT / P.d, sx = W0 * 0.35, swd = clamp(P.d * 2000, 14, W0 * 0.25), sy = 30, sh2 = H0 - 70, grd = ctx.createLinearGradient(sx, 0, sx + swd, 0); grd.addColorStop(0, k.isDark ? '#a33' : '#f4a3a3'); grd.addColorStop(1, k.isDark ? '#335b8a' : '#a9c8ee'); ctx.save(); ctx.fillStyle = grd; ctx.fillRect(sx, sy, swd, sh2); ctx.restore(); poly(ctx, [[sx, sy], [sx + swd, sy], [sx + swd, sy + sh2], [sx, sy + sh2]], { color: k.ink, w: 2, close: true });
        txt(ctx, 'hot side', sx - 14, sy + sh2 / 2, { align: 'right', size: 12, weight: 700, color: k.red }); txt(ctx, 'cold side', sx + swd + 14, sy + sh2 / 2, { size: 12, weight: 700, color: k.blue }); txt(ctx, P.mat + ' (k = ' + nf(P.k, 3) + ' W/m·K)', sx + swd / 2, sy - 12, { align: 'center', size: 11.5, color: k.ink }); F.tagAt(ctx, 'slab', sx + swd + 16, sy + 10);
        var aw = clamp(M.log10(rate + 1) * 2.2, 1.5, 14); for (var i2 = 0; i2 < 3; i2++) arrow(ctx, sx - 60, sy + sh2 * (0.3 + 0.2 * i2), sx + swd + 70, sy + sh2 * (0.3 + 0.2 * i2), { color: rgba(k.eTh, 0.8), w: aw });
        txt(ctx, 'd = ' + un(P.d * 1000, 'mm', 3), sx + swd / 2, sy + sh2 + 16, { align: 'center', size: 11.5, color: k.muted });
        desc = 'Heat conducting through a ' + P.mat + ' slab ' + un(P.d * 1000, 'mm') + ' thick with a ' + un(P.dT, 'K') + ' temperature difference.'; read = 'Rate P = kAΔT/d = <b>' + un(rate, 'W', 3) + '</b> per square meter. A good conductor is not "hot": it moves heat quickly. Touch metal and wood at the same room temperature and the metal feels colder because it pulls heat out of your hand faster.';
        st = [['conductivity k', un(P.k, 'W/m·K', 3)], ['rate per m²', un(rate, 'W', 3)]];
      } else if (mode === 'transfer') {
        var t = A.t, cw = W0 / 3, kinds = [['Conduction', 'touching particles pass on energy'], ['Convection', 'warm fluid rises and carries energy'], ['Radiation', 'light (infrared) carries energy, even through empty space']];
        kinds.forEach(function (q2, i) { var x0 = i * cw, cxm = x0 + cw / 2; txt(ctx, q2[0], cxm, 16, { align: 'center', size: 13, weight: 800, color: k.ink }); var wl = wrapLines(ctx, q2[1], W0 / 3 - 10, W0 > 560 ? 11 : 9.5, 600); wl.forEach(function (ln, li) { txt(ctx, ln, cxm, H0 - 12 - (wl.length - 1 - li) * 12, { align: 'center', size: W0 > 560 ? 11 : 9.5, color: k.muted }); });
          if (i === 0) { for (var j = 0; j < 9; j++) { var amp = 5 * (1 - j / 9) + 1, jx = x0 + 20 + j * (cw - 40) / 8; circ(ctx, jx + amp * M.sin(t * 20 + j), H0 / 2 + amp * M.cos(t * 17 + j * 2), 6, { fill: mixc('#e8590c', '#1c6fd6', j / 8) }); } txt(ctx, 'flame', x0 + 20, H0 / 2 + 30, { size: 10, color: k.red }); }
          else if (i === 1) { var px0 = cxm - 46, py0 = 40, pw = 92, ph = H0 - 90; poly(ctx, [[px0, py0], [px0, py0 + ph], [px0 + pw, py0 + ph], [px0 + pw, py0]], { color: k.ink, w: 2 }); ctx.save(); ctx.fillStyle = k.water; ctx.fillRect(px0, py0 + 10, pw, ph - 10); ctx.restore(); for (var j2 = 0; j2 < 14; j2++) { var u = (t * 0.25 + j2 / 14) % 1, ang = u * TAU, ex = cxm + 30 * M.cos(ang) * (j2 % 2 ? 1 : -1), ey = py0 + ph / 2 + (ph * 0.35) * M.sin(ang); circ(ctx, ex, ey, 3, { fill: M.sin(ang) > 0 ? '#ff8787' : '#74c0fc' }); } txt(ctx, 'heat', cxm, py0 + ph + 14, { align: 'center', size: 10, color: k.red }); }
          else { circ(ctx, x0 + 30, H0 / 2, 18, { fill: '#ffd479' }); for (var j3 = 0; j3 < 3; j3++) { var yy = H0 / 2 - 24 + j3 * 24, pts = []; for (var xx = x0 + 52; xx < x0 + cw - 30; xx += 2) pts.push([xx, yy + 5 * M.sin((xx - t * 120) / 7)]); poly(ctx, pts, { color: '#e8590c', w: 1.8 }); } block(ctx, x0 + cw - 28, H0 / 2 - 30, 14, 60, { fill: k.obj2, color: k.obj2Line }); }
          if (i) line(ctx, x0, 26, x0, H0 - 26, k.grid, 1); });
        desc = 'Three ways heat moves: conduction, convection and radiation.'; read = 'Conduction needs contact, convection needs a moving fluid, and radiation needs neither: sunlight crosses empty space. Everything above absolute zero radiates; hotter things radiate much more, and at shorter wavelengths.';
      } else {
        var dSh = -P.Q / P.Th, dSc = P.Q / P.Tc, tot = dSh + dSc, mxv = M.max(M.abs(dSh), M.abs(dSc), 0.01), r2 = { x: 30, y: 20, w: W0 - 60, h: H0 - 70 }, bw = M.min(80, r2.w / 5), zy = r2.y + r2.h * 0.55, scv = (r2.h * 0.45 - 10) / mxv;
        [['hot reservoir', dSh, k.red], ['cold reservoir', dSc, k.blue], ['total', tot, k.purple]].forEach(function (q2, i) { var x = r2.x + r2.w * (i + 0.5) / 3 - bw / 2, h = q2[1] * scv; rrect(ctx, x, h >= 0 ? zy - h : zy, bw, M.abs(h), 4); ctx.fillStyle = q2[2]; ctx.fill(); txt(ctx, q2[0], x + bw / 2, H0 - 18, { align: 'center', size: 12, weight: 700, color: q2[2] }); if (F.vals) txt(ctx, (q2[1] > 0 ? '+' : '') + un(q2[1], 'J/K', 3), x + bw / 2, h >= 0 ? zy - h - 10 : zy - h + 12, { align: 'center', size: 11.5, weight: 700, halo: true }); });
        line(ctx, r2.x, zy, r2.x + r2.w, zy, k.axis, 1.5);
        desc = un(P.Q, 'J') + ' of heat flowing from a ' + un(P.Th, 'K') + ' reservoir to a ' + un(P.Tc, 'K') + ' reservoir.'; read = 'ΔS = Q/T for each reservoir: the hot one <b>loses</b> ' + un(-dSh, 'J/K', 3) + ' and the cold one <b>gains</b> ' + un(dSc, 'J/K', 3) + '. One entropy goes down, but the total rises by <b>' + un(tot, 'J/K', 3) + '</b>: the second law is about the total.';
        st = [['ΔS hot', un(dSh, 'J/K', 3)], ['ΔS cold', un(dSc, 'J/K', 3)], ['ΔS total', un(tot, 'J/K', 3)]];
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-pv: P in kPa, V in liters, so P·V is in joules (1 kPa·L = 1 J); T = PV/(nR).
  var RGAS = 8.314;
  /* PM.legs(states, paths, n, gamma): walk the legs of a process or cycle. Isobaric and isochoric legs force P or V to match;
     isothermal and adiabatic legs recompute the end pressure from the end volume. Returns {states, legs: [{type, from, to, Wby, Q, dU, pts}]}. */
  PM.legs = function (states, paths, n, gam, cycle) {
    var Cv = RGAS / (gam - 1), st = states.map(function (s) { return [s[0], s[1]]; }), legs = [], N = cycle ? st.length : st.length - 1;
    for (var i = 0; i < N; i++) {
      var a = st[i], j = (i + 1) % st.length, b = st[j], type = paths[i] || 'line', last = cycle && j === 0;
      if (!last) { if (type === 'isobaric') b[0] = a[0]; else if (type === 'isochoric') b[1] = a[1]; else if (type === 'isothermal') b[0] = a[0] * a[1] / b[1]; else if (type === 'adiabatic') b[0] = a[0] * M.pow(a[1] / b[1], gam); }
      else { var ok = type === 'isobaric' ? M.abs(b[0] - a[0]) < 1e-6 * a[0] : type === 'isochoric' ? M.abs(b[1] - a[1]) < 1e-6 * a[1] : type === 'isothermal' ? M.abs(b[0] * b[1] - a[0] * a[1]) < 1e-3 * a[0] * a[1] : type === 'adiabatic' ? M.abs(b[0] * M.pow(b[1], gam) - a[0] * M.pow(a[1], gam)) < 1e-3 * a[0] * M.pow(a[1], gam) : true; if (!ok) type = 'line'; }
      var Ta = a[0] * a[1] / (n * RGAS), Tb = b[0] * b[1] / (n * RGAS), dU = n * Cv * (Tb - Ta), W, pts = [];
      for (var q = 0; q <= 60; q++) { var f = q / 60, V = a[1] + (b[1] - a[1]) * f, Pp; if (type === 'isothermal') Pp = a[0] * a[1] / V; else if (type === 'adiabatic') Pp = a[0] * M.pow(a[1] / V, gam); else if (type === 'isochoric') { V = a[1]; Pp = a[0] + (b[0] - a[0]) * f; } else Pp = a[0] + (b[0] - a[0]) * f; pts.push([V, Pp]); }
      if (type === 'isochoric') W = 0; else if (type === 'isobaric') W = a[0] * (b[1] - a[1]); else if (type === 'isothermal') W = a[0] * a[1] * M.log(b[1] / a[1]); else if (type === 'adiabatic') W = (a[0] * a[1] - b[0] * b[1]) / (gam - 1); else W = (a[0] + b[0]) / 2 * (b[1] - a[1]);
      if (type === 'adiabatic') dU = -W;
      legs.push({ type: type, from: i, to: j, Wby: W, dU: dU, Q: dU + W, pts: pts, Ta: Ta, Tb: Tb });
    }
    return { states: st, legs: legs };
  };
  R('ph-pv', function (el, o) {
    var mode = pick(o.mode, ['process', 'cycle', 'engine', 'fridge'], o.cycle ? 'cycle' : 'process'), cyc = mode !== 'process';
    var F = frame(el, o, mode === 'process' ? 'A process on a pressure–volume diagram' : mode === 'fridge' ? 'A refrigerator cycle' : 'A heat-engine cycle on a pressure–volume diagram');
    var n = num(o.n, 0.1), gam = num(o.gamma, 5 / 3), conv = o.convention === 'by' ? 'by' : 'on';
    var states = arr(o.states || (cyc ? [[200, 2], [200, 5], [80, 5], [80, 2]] : [[200, 2], [200, 6]])).map(function (s) { return [num(s[0], 100), num(s[1], 1)]; });
    var paths = arr(o.path || (cyc ? ['isobaric', 'isochoric', 'isobaric', 'isochoric'] : ['isobaric']));
    if (mode === 'fridge' && o.reverse !== false && states.length > 2) { states = [states[0]].concat(states.slice(1).reverse()); paths = paths.slice(0, states.length).reverse(); } // a refrigerator runs the cycle backward (counterclockwise)
    var sh = { area: F.on('area', true), table: F.on('table', true), piston: F.on('piston', mode === 'process' || mode === 'cycle'), flow: F.on('flow', mode === 'engine' || mode === 'fridge'), iso: F.on('isotherms', true) };
    var res = null, c = F.canvas({ aspect: sh.piston || sh.flow ? 1.65 : 1.6, narrow: 0.85 }), G = null;
    var tbl = mk('div', 'phv-tbl'); if (sh.table && !F.compact) el.insertBefore(tbl, F.statEl);
    function solve() { res = PM.legs(states, paths, n, gam, cyc); states = res.states; }
    solve();
    var A = F.anim({ tmax: 1, loop: true, rate: 0.12, autoplay: true, dt: 0.02, tStatic: num(o.t, 0) });
    var hd = F.handles(F.live && o.drag !== false ? states.map(function (s, i) { return { name: 'state ' + (i + 1), pos: function () { return G ? [G.X(states[i][1]), G.Y(states[i][0])] : null; }, drag: function (px, py) { states[i] = [clamp(M.round(G.iy(py) / 5) * 5, 10, G.o.ymax), clamp(M.round(G.ix(px) * 10) / 10, 0.2, G.o.xmax)]; solve(); }, key: function (dx, dy, big) { states[i] = [clamp(states[i][0] + dy * (big ? 25 : 5), 10, 1e4), clamp(states[i][1] + dx * (big ? 0.5 : 0.1), 0.2, 1e3)]; solve(); } }; }) : [], { r: 22 });
    function sgnW(W) { return conv === 'on' ? -W : W; }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, wide = W0 > 560; bg(c);
      var Vs = [], Ps = []; res.legs.forEach(function (L) { L.pts.forEach(function (p) { Vs.push(p[0]); Ps.push(p[1]); }); }); states.forEach(function (s) { Vs.push(s[1]); Ps.push(s[0]); });
      var gr = { x: 52, y: 14, w: (wide && (sh.piston || sh.flow) ? W0 * 0.62 : W0) - 66, h: (wide || !(sh.piston || sh.flow) ? H0 : H0 * 0.62) - 40 };
      G = GP(ctx, gr, { xmin: 0, xmax: niceRange(0, M.max.apply(null, Vs) * 1.15, 1, 0)[1], ymin: 0, ymax: niceRange(0, M.max.apply(null, Ps) * 1.15, 10, 0)[1], xlab: 'V (L)', ylab: 'P (kPa)', compact: F.compact }).frame();
      if (sh.iso) { var Ts = states.map(function (s) { return s[0] * s[1]; }); [M.min.apply(null, Ts), M.max.apply(null, Ts)].forEach(function (pv) { G.plot(function (V) { return pv / V; }, rgba(k.muted, 0.45), 1.2, [3, 4]); }); }
      if (sh.area) { if (cyc) { var poly0 = []; res.legs.forEach(function (L) { L.pts.forEach(function (p) { poly0.push([G.X(p[0]), G.Y(p[1])]); }); }); var net = res.legs.reduce(function (s0, L) { return s0 + L.Wby; }, 0); G.clip(); poly(ctx, poly0, { fill: rgba(net >= 0 ? k.green : k.red, 0.22), close: true }); ctx.restore(); F.tagAt(ctx, 'area', G.X((M.min.apply(null, Vs) + M.max.apply(null, Vs)) / 2), G.Y((M.min.apply(null, Ps) + M.max.apply(null, Ps)) / 2)); }
        else res.legs.forEach(function (L) { var pts = L.pts.map(function (p) { return [G.X(p[0]), G.Y(p[1])]; }); pts.push([G.X(L.pts[L.pts.length - 1][0]), G.Y(0)], [G.X(L.pts[0][0]), G.Y(0)]); G.clip(); poly(ctx, pts, { fill: rgba(L.Wby >= 0 ? k.green : k.red, 0.22), close: true }); ctx.restore(); F.tagAt(ctx, 'area', (pts[0][0] + pts[pts.length - 3][0]) / 2, G.Y(0) - 20); }); }
      res.legs.forEach(function (L, i) { G.line(L.pts, k.acc, 2.8); var mid = L.pts[30], nx = L.pts[34]; arrow(ctx, G.X(mid[0]), G.Y(mid[1]), G.X(nx[0]), G.Y(nx[1]), { color: k.acc, w: 2.8, head: 11 }); if (!F.compact) txt(ctx, L.type === 'line' ? '' : L.type, G.X(mid[0]) + 8, G.Y(mid[1]) - 12, { size: 10.5, color: k.muted, halo: true, haloColor: k.panelBg }); F.tagAt(ctx, 'leg' + i, G.X(mid[0]) - 18, G.Y(mid[1]) + 16); });
      states.forEach(function (s, i) { circ(ctx, G.X(s[1]), G.Y(s[0]), 6, { fill: k.gold, color: k.bg, w: 2 }); txt(ctx, String.fromCharCode(65 + i), G.X(s[1]) - 10, G.Y(s[0]) - 12, { size: 13, weight: 800, color: k.ink, halo: true, haloColor: k.panelBg }); F.tagAt(ctx, 's' + i, G.X(s[1]) + 16, G.Y(s[0]) + 14); });
      // the moving state along the path
      var nl = res.legs.length, u = cyc ? A.t * nl : A.t * nl, li = M.min(nl - 1, M.floor(u)), L0 = res.legs[li], fr = u - li, p0 = L0.pts[M.round(fr * 60)];
      if (F.live) circ(ctx, G.X(p0[0]), G.Y(p0[1]), 7, { fill: k.red, color: k.bg, w: 2 });
      var Tnow = p0[0] * p0[1] / (n * RGAS), Tall = []; res.legs.forEach(function (L) { L.pts.forEach(function (p) { Tall.push(p[0] * p[1] / (n * RGAS)); }); }); var Tmin = M.min.apply(null, Tall), Tmax = M.max.apply(null, Tall);
      if (sh.piston && !(sh.flow && !wide)) { var px = wide ? W0 * 0.66 : 20, pw = wide ? W0 * 0.12 : W0 * 0.2, py = wide ? 30 : H0 * 0.66, ph = wide ? H0 * 0.6 : H0 * 0.3, vmax = G.o.xmax, gh = ph * p0[0] / vmax, hot = (Tnow - Tmin) / M.max(1e-9, Tmax - Tmin); if (!wide) { gh = ph * p0[0] / vmax; }
        gh = ph * (p0[0] / vmax); var top0 = py + ph - gh; ctx.save(); ctx.fillStyle = mixc(k.isDark ? '#1d4a6b' : '#d0e4f7', k.isDark ? '#7a2e2e' : '#f8c9c9', hot); ctx.fillRect(px, top0, pw, gh); ctx.restore(); poly(ctx, [[px, py - 10], [px, py + ph], [px + pw, py + ph], [px + pw, py - 10]], { color: k.ink, w: 2.5 }); block(ctx, px - 2, top0 - 10, pw + 4, 10, { fill: k.metal, color: k.ink, r: 2 }); line(ctx, px + pw / 2, top0 - 10, px + pw / 2, M.max(py - 30, top0 - 40), k.ink, 3);
        var dV = L0.pts[M.min(60, M.round(fr * 60) + 1)][0] - L0.pts[M.max(0, M.round(fr * 60) - 1)][0], q0 = L0.Q; if (M.abs(q0) > 1e-6 && F.live) arrow(ctx, q0 > 0 ? px - 34 : px - 6, py + ph * 0.6, q0 > 0 ? px - 6 : px - 34, py + ph * 0.6, { color: q0 > 0 ? k.red : k.blue, w: 3, label: q0 > 0 ? 'Q in' : 'Q out' });
        if (M.abs(dV) > 1e-9 && F.live) arrow(ctx, px + pw + 14, top0 + (dV > 0 ? 26 : 0), px + pw + 14, top0 + (dV > 0 ? 0 : 26), { color: k.eW, w: 2.6 }); txt(ctx, dV > 0 ? 'gas does work' : 'work done on gas', px + pw + 22, top0 + 13, { size: 10.5, color: k.eW, halo: true });
        txt(ctx, F.vals ? fm(Tnow, 0) + ' K' : '', px + pw / 2, py + ph + 14, { align: 'center', size: 11.5, weight: 700, color: k.ink }); }
      var Qh = 0, Qc = 0, Wn = 0; res.legs.forEach(function (L) { if (L.Q > 0) Qh += L.Q; else Qc -= L.Q; Wn += L.Wby; });
      if (sh.flow && cyc) { var fx = wide ? W0 * 0.8 : W0 / 2, fw = wide ? W0 * 0.18 : W0 * 0.6, fy = wide ? 20 : H0 * 0.64, fh = wide ? H0 - 50 : H0 * 0.33, fridge = mode === 'fridge', sc0 = (fw * 0.35) / M.max(Qh, Qc, 1e-9);
        block(ctx, fx - fw / 2, fy, fw, 26, { fill: rgba(k.red, 0.25), color: k.red, label: 'hot ' + (F.vals ? fm(Tmax, 0) + ' K' : ''), size: 11 }); block(ctx, fx - fw / 2, fy + fh - 26, fw, 26, { fill: rgba(k.blue, 0.25), color: k.blue, label: 'cold ' + (F.vals ? fm(Tmin, 0) + ' K' : ''), size: 11 }); circ(ctx, fx, fy + fh / 2, 22, { fill: k.obj, color: k.objLine, w: 2 }); txt(ctx, fridge ? 'fridge' : 'engine', fx, fy + fh / 2, { align: 'center', size: 10, weight: 700 });
        arrow(ctx, fx, fridge ? fy + fh / 2 - 22 : fy + 26, fx, fridge ? fy + 26 : fy + fh / 2 - 22, { color: k.red, w: M.max(2, Qh * sc0 * 0.25), label: '' }); arrow(ctx, fx, fridge ? fy + fh - 26 : fy + fh / 2 + 22, fx, fridge ? fy + fh / 2 + 22 : fy + fh - 26, { color: k.blue, w: M.max(2, Qc * sc0 * 0.25) }); arrow(ctx, fridge ? fx + fw / 2 + 2 : fx + 22, fy + fh / 2, fridge ? fx + 22 : fx + fw / 2 + 2, fy + fh / 2, { color: k.eW, w: M.max(2, M.abs(Wn) * sc0 * 0.25) });
        symTxt(ctx, ['Q', 'H'], fx + 8, fy + 44, { size: 12, color: k.red, extra: F.vals ? un(Qh, 'J', 3) : '' }); symTxt(ctx, ['Q', 'C'], fx + 8, fy + fh - 44, { size: 12, color: k.blue, extra: F.vals ? un(Qc, 'J', 3) : '' }); symTxt(ctx, ['W', ''], fx + 26, fy + fh / 2 - 16, { size: 12, color: k.eW, extra: F.vals ? un(M.abs(Wn), 'J', 3) : '' }); }
      hd.draw(ctx);
      // table of legs
      if (sh.table && !F.compact) { var wl = conv === 'on' ? 'W (on gas)' : 'W (by gas)', hq = F.quiet; tbl.innerHTML = '<table><thead><tr><th>leg</th><th>process</th><th>Q (J)</th><th>' + wl + ' (J)</th><th>ΔU (J)</th></tr></thead><tbody>' + res.legs.map(function (L) { return '<tr><td>' + String.fromCharCode(65 + L.from) + '→' + String.fromCharCode(65 + L.to) + '</td><td>' + L.type + '</td><td>' + (hq ? '?' : nf(L.Q, 3)) + '</td><td>' + (hq ? '?' : nf(sgnW(L.Wby), 3)) + '</td><td>' + (hq ? '?' : nf(L.dU, 3)) + '</td></tr>'; }).join('') + (cyc ? '<tr class="tot"><td>cycle</td><td></td><td>' + (hq ? '?' : nf(Qh - Qc, 3)) + '</td><td>' + (hq ? '?' : nf(sgnW(Wn), 3)) + '</td><td>0</td></tr>' : '') + '</tbody></table>'; }
      var eff = Qh > 0 ? Wn / Qh : 0, carnot = 1 - Tmin / Tmax;
      F.desc((cyc ? 'A ' + res.legs.length + '-leg cycle' : 'A process') + ' on a P–V diagram: ' + res.legs.map(function (L) { return L.type; }).join(', ') + '.' + (F.quiet ? '' : ' Net work by the gas ' + un(Wn, 'J', 3) + '.'));
      var law = conv === 'on' ? 'ΔU = Q + W, with W the work done <b>on</b> the gas (W = −PΔV)' : 'ΔU = Q − W, with W the work done <b>by</b> the gas (W = PΔV)';
      F.read(law + '. ' + (cyc ? (mode === 'fridge' ? 'Run backward, the cycle takes ' + un(Qc, 'J', 3) + ' from the cold side and dumps ' + un(Qh, 'J', 3) + ' to the hot side, using ' + un(M.abs(Wn), 'J', 3) + ' of work: COP = <b>' + fm(Qc / M.max(1e-9, M.abs(Wn)), 2) + '</b>. Energy is conserved: Q_H = Q_C + W.' : 'Net work by the gas = enclosed area = <b>' + un(Wn, 'J', 3) + '</b> per cycle (clockwise: positive). Efficiency W/Q_H = <b>' + fm(eff * 100, 1) + '%</b>; the Carnot limit between ' + fm(Tmax, 0) + ' K and ' + fm(Tmin, 0) + ' K is ' + fm(carnot * 100, 1) + '% (kelvins!). No engine reaches 100%.') : 'Area under the path = work by the gas = <b>' + un(res.legs[0].Wby, 'J', 3) + '</b>; it is positive when the gas expands, negative when it is compressed.'));
      F.stats(cyc ? [['Q_H', un(Qh, 'J', 3)], ['Q_C', un(Qc, 'J', 3)], ['net W by gas', un(Wn, 'J', 3)], [mode === 'fridge' ? 'COP' : 'efficiency', mode === 'fridge' ? fm(Qc / M.max(1e-9, M.abs(Wn)), 2) : fm(eff * 100, 1) + '%'], ['Carnot limit', fm(carnot * 100, 1) + '%']] : [['T now', un(Tnow, 'K', 3)], ['W by gas', un(res.legs[0].Wby, 'J', 3)], ['Q', un(res.legs[0].Q, 'J', 3)], ['ΔU', un(res.legs[0].dU, 'J', 3)]]);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-efield. World units: meters. Charges in nC (or μC with qUnit: 'μC'). E in N/C, V in volts.
  /* PM.efield(charges, x, y): field and potential of point charges (q in coulombs, positions in m) at (x, y) */
  PM.efield = function (qs, x, y) { var Ex = 0, Ey = 0, Vv = 0; qs.forEach(function (q) { var dx = x - q.x, dy = y - q.y, r2 = dx * dx + dy * dy, r = M.sqrt(r2); if (r < 1e-9) return; var e = KE * q.q / r2; Ex += e * dx / r; Ey += e * dy / r; Vv += KE * q.q / r; }); return { Ex: Ex, Ey: Ey, E: M.hypot(Ex, Ey), V: Vv }; };
  /* PM.distE(type, Q, R, L, d): field of a continuous distribution at distance d (on the axis for ring and disk, on the perpendicular
     bisector for a rod, radial for line, ball and shell). Q is the total charge in C (λ in C/m for line, σ in C/m² for sheet). */
  PM.distE = function (type, Q, R, L, d) {
    if (type === 'ring') return KE * Q * d / M.pow(d * d + R * R, 1.5);
    if (type === 'disk') { var sg = Q / (PI * R * R); return sg / (2 * EPS0) * (1 - d / M.sqrt(d * d + R * R)); }
    if (type === 'rod') return KE * Q / (d * M.sqrt(d * d + L * L / 4));
    if (type === 'line') return 2 * KE * Q / d;
    if (type === 'sheet') return Q / (2 * EPS0);
    if (type === 'ball') return d < R ? KE * Q * d / (R * R * R) : KE * Q / (d * d);
    if (type === 'shell') return d < R ? 0 : KE * Q / (d * d);
    return 0;
  };
  R('ph-efield', function (el, o) {
    var mode = pick(o.mode, ['points', 'polarize', 'plates', 'capacitor', 'conductor', 'gauss', 'distribution'], 'points');
    var F = frame(el, o, { points: 'Electric charges with their field', polarize: 'A charged rod near a neutral metal sphere', plates: 'A charge moving between charged plates', capacitor: 'A parallel-plate capacitor', conductor: 'A charged conductor', gauss: 'A Gaussian surface around charges', distribution: 'The field of a charge distribution' }[mode]);
    if (mode === 'polarize') return polarize(F, o);
    if (mode === 'plates') return plates(F, o);
    if (mode === 'capacitor') return capacitor(F, o);
    if (mode === 'distribution') return distribution(F, o);
    var uq = o.qUnit === 'μC' || o.qUnit === 'uC' ? 1e-6 : 1e-9, uqs = uq === 1e-6 ? 'μC' : 'nC';
    var qs = arr(o.charges || (mode === 'gauss' ? [{ q: 3, x: -0.05, y: 0.02 }, { q: -1, x: 0.06, y: -0.04 }, { q: 2, x: 0.22, y: 0.1 }] : mode === 'conductor' ? [{ q: 4, x: 0, y: 0 }] : [{ q: 2, x: -0.1, y: 0 }, { q: -2, x: 0.1, y: 0 }])).map(function (q) { return { q: num(q.q, 1), x: num(q.x, 0), y: num(q.y, 0) }; });
    var view = num(o.view, 0.3), Rc = num(o.R, 0.06);
    var defShow = mode === 'gauss' ? ['vectors', 'flux'] : mode === 'conductor' ? ['lines'] : ['lines', 'test'];
    var sh = {}; ['vectors', 'lines', 'equipotentials', 'test', 'components', 'flux'].forEach(function (n2) { sh[n2] = F.on(n2, defShow.indexOf(n2) >= 0, n2 === 'components'); });
    var test = { x: num((o.test || {}).x, 0), y: num((o.test || {}).y, 0.12), q: num((o.test || {}).q, 1) };
    var surf = { x: num((o.surface || {}).x, 0), y: num((o.surface || {}).y, 0), r: num((o.surface || {}).r, 0.12) };
    var c = F.canvas({ aspect: mode === 'conductor' ? 1.9 : 1.55, narrow: 1.0 }), mp = null;
    function SI() { return mode === 'conductor' ? [] : qs.map(function (q) { return { q: q.q * uq, x: q.x, y: q.y }; }); }
    function field(x, y) { if (mode === 'conductor') { var r = M.hypot(x, y), Q = qs[0].q * uq; if (r < Rc) return { Ex: 0, Ey: 0, E: 0, V: KE * Q / Rc }; var e = KE * Q / (r * r); return { Ex: e * x / r, Ey: e * y / r, E: M.abs(e), V: KE * Q / r }; } return PM.efield(SI(), x, y); }
    var list = [];
    if (F.live && o.drag !== false && mode !== 'conductor') { qs.forEach(function (q, i) { list.push({ name: 'charge ' + (i + 1), pos: function () { return mp ? [mp.X(q.x), mp.Y(q.y)] : null; }, drag: function (px, py) { q.x = M.round(mp.x(px) * 100) / 100; q.y = M.round(mp.y(py) * 100) / 100; }, key: function (dx, dy, big) { q.x += dx * (big ? 0.05 : 0.01); q.y += dy * (big ? 0.05 : 0.01); } }); }); }
    if (F.live && sh.test && mode === 'points') list.push({ name: 'test charge', pos: function () { return mp ? [mp.X(test.x), mp.Y(test.y)] : null; }, drag: function (px, py) { test.x = mp.x(px); test.y = mp.y(py); }, key: function (dx, dy, big) { test.x += dx * (big ? 0.05 : 0.01); test.y += dy * (big ? 0.05 : 0.01); } });
    if (F.live && mode === 'gauss') { list.push({ name: 'Gaussian surface (move)', pos: function () { return mp ? [mp.X(surf.x), mp.Y(surf.y)] : null; }, drag: function (px, py) { surf.x = mp.x(px); surf.y = mp.y(py); }, key: function (dx, dy, big) { surf.x += dx * (big ? 0.05 : 0.01); surf.y += dy * (big ? 0.05 : 0.01); } }); list.push({ name: 'Gaussian surface (size)', pos: function () { return mp ? [mp.X(surf.x + surf.r), mp.Y(surf.y)] : null; }, drag: function (px, py) { surf.r = M.max(0.02, M.hypot(mp.x(px) - surf.x, mp.y(py) - surf.y)); }, key: function (dx, dy, big) { surf.r = M.max(0.02, surf.r + (dx || dy) * (big ? 0.03 : 0.01)); } }); }
    var hd = F.handles(list, { r: 20 });
    if (F.live && mode === 'conductor') F.slider(null, { label: 'Charge on the sphere', min: -8, max: 8, step: 0.5, value: qs[0].q, unit: uqs, d: 1, input: function (v) { qs[0].q = v; } });
    function traceLines(ctx, k, v) {
      var src = SI(), pos = src.filter(function (q) { return q.q > 0; }), start = pos.length ? pos : src, sgn = pos.length ? 1 : -1, h = (v.xmax - v.xmin) / 220;
      if (mode === 'conductor') { var Q0 = qs[0].q; for (var a = 0; a < 16; a++) { var an = a / 16 * TAU, x1 = Rc * M.cos(an), y1 = Rc * M.sin(an); line(ctx, mp.X(x1), mp.Y(y1), mp.X(4 * view * M.cos(an)), mp.Y(4 * view * M.sin(an)), rgba(k.efield, 0.8), 1.4); var mx2 = 2 * Rc; arrow(ctx, mp.X(mx2 * M.cos(an)), mp.Y(mx2 * M.sin(an)), mp.X((mx2 + 0.012 * (Q0 > 0 ? 1 : -1)) * M.cos(an)), mp.Y((mx2 + 0.012 * (Q0 > 0 ? 1 : -1)) * M.sin(an)), { color: k.efield, w: 1.4, head: 7 }); } return; }
      start.forEach(function (q) {
        var nl = M.max(10, M.round(M.abs(q.q / uq) * 6)); nl = M.min(nl, 28);
        for (var a = 0; a < nl; a++) {
          var an = (a + 0.5) / nl * TAU, x = q.x + 0.008 * M.cos(an), y = q.y + 0.008 * M.sin(an), pts = [[mp.X(x), mp.Y(y)]];
          for (var s = 0; s < 900; s++) { var e1 = field(x, y); if (!(e1.E > 0)) break; var mx = x + sgn * h / 2 * e1.Ex / e1.E, my = y + sgn * h / 2 * e1.Ey / e1.E, e2 = field(mx, my); if (!(e2.E > 0)) break; x += sgn * h * e2.Ex / e2.E; y += sgn * h * e2.Ey / e2.E; pts.push([mp.X(x), mp.Y(y)]); if (x < v.xmin - 0.1 || x > v.xmax + 0.1 || y < v.ymin - 0.1 || y > v.ymax + 0.1) break; var hit = src.some(function (q2) { return q2 !== q && M.hypot(x - q2.x, y - q2.y) < 0.006; }); if (hit) break; }
          poly(ctx, pts, { color: rgba(k.efield, 0.75), w: 1.4 }); var mi = M.floor(pts.length * 0.35); if (pts.length > 12) { var p1 = pts[mi], p2 = pts[mi + (sgn > 0 ? 2 : -2)] || pts[mi]; if (p2) arrow(ctx, p1[0], p1[1], p1[0] + (p2[0] - p1[0]) * 2, p1[1] + (p2[1] - p1[1]) * 2, { color: k.efield, w: 1.4, head: 7 }); }
        }
      });
    }
    function equip(ctx, k, v) {
      var nx = 90, ny = M.round(90 * (v.ymax - v.ymin) / (v.xmax - v.xmin)), gx = [], V0 = KE * M.max.apply(null, qs.map(function (q) { return M.abs(q.q); })) * uq / (0.1 * (v.xmax - v.xmin));
      for (var j = 0; j <= ny; j++) { var row = []; for (var i = 0; i <= nx; i++) row.push(field(v.xmin + (v.xmax - v.xmin) * i / nx, v.ymin + (v.ymax - v.ymin) * j / ny).V); gx.push(row); }
      var levels = [0.25, 0.5, 1, 2, 4].map(function (f) { return f * V0; }); levels = levels.concat(levels.map(function (x) { return -x; })); if (qs.some(function (q) { return q.q > 0; }) && qs.some(function (q) { return q.q < 0; })) levels.push(0);
      levels.forEach(function (L, li) {
        ctx.save(); ctx.strokeStyle = L === 0 ? k.ink : L > 0 ? rgba(k.red, 0.6) : rgba(k.blue, 0.6); ctx.lineWidth = L === 0 ? 1.8 : 1.2; ctx.setLineDash([4, 3]); ctx.beginPath();
        for (var j = 0; j < ny; j++) for (var i = 0; i < nx; i++) {
          var c0 = gx[j][i] - L, c1 = gx[j][i + 1] - L, c2 = gx[j + 1][i + 1] - L, c3 = gx[j + 1][i] - L, pts = [];
          function ed(a, b, xa, ya, xb, yb) { if ((a > 0) !== (b > 0) && isFinite(a) && isFinite(b)) { var f = a / (a - b); pts.push([xa + (xb - xa) * f, ya + (yb - ya) * f]); } }
          var x0 = v.xmin + (v.xmax - v.xmin) * i / nx, x1 = v.xmin + (v.xmax - v.xmin) * (i + 1) / nx, y0 = v.ymin + (v.ymax - v.ymin) * j / ny, y1 = v.ymin + (v.ymax - v.ymin) * (j + 1) / ny;
          ed(c0, c1, x0, y0, x1, y0); ed(c1, c2, x1, y0, x1, y1); ed(c2, c3, x1, y1, x0, y1); ed(c3, c0, x0, y1, x0, y0);
          if (pts.length >= 2) { ctx.moveTo(mp.X(pts[0][0]), mp.Y(pts[0][1])); ctx.lineTo(mp.X(pts[1][0]), mp.Y(pts[1][1])); }
        }
        ctx.stroke(); ctx.restore(); void li;
      });
      if (F.vals) txt(ctx, 'dashed: equipotentials (red +V, blue −V' + (levels.indexOf(0) >= 0 ? ', black V = 0' : '') + ')', 8, c.h - 10, { size: 10.5, color: k.muted });
    }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c);
      var gw = mode === 'conductor' && W0 > 560 ? W0 * 0.55 : W0;
      mp = fitMap({ x: 6, y: 6, w: gw - 12, h: H0 - 12 }, -view, view, -view * 0.66, view * 0.66, true); var v = { xmin: mp.x(6), xmax: mp.x(gw - 6), ymin: mp.y(H0 - 6), ymax: mp.y(6) };
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, gw, H0); ctx.clip();
      if (sh.equipotentials) equip(ctx, k, v);
      if (sh.vectors) { var st = (v.xmax - v.xmin) / 18; for (var x = v.xmin + st / 2; x < v.xmax; x += st) for (var y = v.ymin + st / 2; y < v.ymax; y += st) { if (qs.some(function (q) { return M.hypot(x - q.x, y - q.y) < st * 0.6; }) && mode !== 'conductor') continue; var e = field(x, y); if (!(e.E > 0)) { circ(ctx, mp.X(x), mp.Y(y), 1.5, { fill: k.muted }); continue; } var L = clamp(M.log10(e.E) - 1, 0.3, 4) * st * mp.sx * 0.16; arrow(ctx, mp.X(x) - L / 2 * e.Ex / e.E, mp.Y(y) + L / 2 * e.Ey / e.E, mp.X(x) + L / 2 * e.Ex / e.E, mp.Y(y) - L / 2 * e.Ey / e.E, { color: rgba(k.efield, 0.35 + 0.15 * clamp(M.log10(e.E) - 2, 0, 4)), w: 1.5, head: 6 }); } }
      if (sh.lines) traceLines(ctx, k, v);
      if (mode === 'conductor') { var Q0 = qs[0].q; circ(ctx, mp.X(0), mp.Y(0), Rc * mp.sx, { fill: k.isDark ? '#3b4650' : '#dfe4ea', color: k.metal, w: 3 }); for (var a = 0; a < 20; a++) { var an = a / 20 * TAU; if (Q0 !== 0) txt(ctx, Q0 > 0 ? '+' : '−', mp.X(Rc * 0.86 * M.cos(an)), mp.Y(Rc * 0.86 * M.sin(an)), { align: 'center', size: 12, weight: 800, color: Q0 > 0 ? k.red : k.blue }); } txt(ctx, 'E = 0 inside', mp.X(0), mp.Y(0), { align: 'center', size: 11.5, weight: 700, color: k.ink }); }
      if (mode === 'gauss') { var inside = qs.filter(function (q) { return M.hypot(q.x - surf.x, q.y - surf.y) < surf.r; }), qin = inside.reduce(function (s, q) { return s + q.q; }, 0);
        circ(ctx, mp.X(surf.x), mp.Y(surf.y), surf.r * mp.sx, { color: k.gold, w: 2.6, dash: [8, 5], fill: rgba(k.gold, 0.06) }); F.tagAt(ctx, 'surface', mp.X(surf.x + surf.r * 0.7), mp.Y(surf.y + surf.r * 0.7) - 14);
        if (sh.flux) for (var b = 0; b < 32; b++) { var an2 = b / 32 * TAU, px = surf.x + surf.r * M.cos(an2), py = surf.y + surf.r * M.sin(an2), e2 = field(px, py), en = (e2.Ex * M.cos(an2) + e2.Ey * M.sin(an2)), L2 = clamp(M.abs(en) / 3000, 0, 1) * 18 + 3; arrow(ctx, mp.X(px), mp.Y(py), mp.X(px) + M.sign(en) * L2 * M.cos(an2), mp.Y(py) - M.sign(en) * L2 * M.sin(an2), { color: en >= 0 ? k.red : k.blue, w: 2, head: 6 }); }
        if (F.live) knob(ctx, mp.X(surf.x + surf.r), mp.Y(surf.y), k.gold, 6); }
      if (mode !== 'conductor') qs.forEach(function (q, i) { var r = 9 + M.min(8, M.abs(q.q) * 1.2); circ(ctx, mp.X(q.x), mp.Y(q.y), r, { fill: q.q >= 0 ? k.red : k.blue, color: k.bg, w: 2 }); txt(ctx, (q.q >= 0 ? '+' : '−'), mp.X(q.x), mp.Y(q.y) + 0.5, { align: 'center', size: 14, weight: 800, color: '#fff' }); txt(ctx, (q.q > 0 ? '+' : q.q < 0 ? '−' : '') + fm(M.abs(q.q), 2) + ' ' + uqs, mp.X(q.x), mp.Y(q.y) + r + 10, { align: 'center', size: 11, weight: 700, color: q.q >= 0 ? k.red : k.blue, halo: true }); F.tagAt(ctx, 'q' + i, mp.X(q.x) + r + 10, mp.Y(q.y) - r - 4); });
      var e0 = null;
      if (sh.test && mode === 'points') { e0 = field(test.x, test.y); var tx = mp.X(test.x), ty = mp.Y(test.y); if (sh.components) qs.forEach(function (q) { var ei = PM.efield([{ q: q.q * uq, x: q.x, y: q.y }], test.x, test.y), Li = clamp(M.log10(ei.E + 1) * 14, 0, 90); arrow(ctx, tx, ty, tx + Li * ei.Ex / ei.E, ty - Li * ei.Ey / ei.E, { color: q.q >= 0 ? k.red : k.blue, w: 1.8, dash: [5, 3] }); });
        if (e0.E > 0) { var L0 = clamp(M.log10(e0.E + 1) * 14, 6, 100); arrow(ctx, tx, ty, tx + L0 * e0.Ex / e0.E, ty - L0 * e0.Ey / e0.E, { color: k.efield, w: 3.2, label: 'E' + (F.vals ? ' = ' + un(e0.E, 'N/C', 3) : '') }); }
        circ(ctx, tx, ty, 6, { fill: k.gold, color: k.bg, w: 2 }); txt(ctx, 'P', tx - 10, ty - 10, { size: 12, weight: 800, color: k.ink, halo: true }); F.tagAt(ctx, 'test', tx - 18, ty + 16); F.tagAt(ctx, 'P0', tx + 16, ty + 16); }
      ctx.restore();
      if (mode === 'conductor' && W0 > 560) { var Q1 = qs[0].q * uq, G = GP(ctx, { x: gw + 40, y: 20, w: W0 - gw - 54, h: H0 - 48 }, { xmin: 0, xmax: view, ymin: 0, ymax: M.abs(KE * Q1 / (Rc * Rc)) * 1.15 || 1, xlab: 'r (m)', ylab: 'E (N/C)', compact: true }).frame(); G.plot(function (r) { return r < Rc ? 0 : M.abs(KE * Q1 / (r * r)); }, k.efield, 2.4); G.vline(Rc, k.muted, [3, 3]); txt(ctx, 'surface', G.X(Rc) + 4, G.r.y + G.r.h - 10, { size: 10.5, color: k.muted }); }
      hd.draw(ctx);
      var desc, read = '', st = [];
      if (mode === 'gauss') { var ins = qs.filter(function (q) { return M.hypot(q.x - surf.x, q.y - surf.y) < surf.r; }), qe = ins.reduce(function (s, q) { return s + q.q; }, 0) * uq; desc = 'A Gaussian surface enclosing ' + ins.length + ' of ' + qs.length + ' charges.'; read = 'Gauss\'s law: Φ = Q<sub>enc</sub>/ε₀. Enclosed charge <b>' + un(qe / uq, uqs, 3) + '</b>, so Φ = <b>' + un(qe / EPS0, 'N·m²/C', 3) + '</b>. Charges outside send field lines in and back out: they change the field on the surface but add nothing to the net flux.'; st = [['enclosed charge', un(qe / uq, uqs, 3)], ['flux Φ', un(qe / EPS0, 'N·m²/C', 3)]]; }
      else if (mode === 'conductor') { desc = 'A metal sphere of radius ' + un(Rc, 'm') + ' carrying ' + un(qs[0].q, uqs) + '.'; read = 'The charge spreads over the <b>surface</b>; inside the metal E = 0 (otherwise the free electrons would keep moving). Outside, the field is as if all the charge sat at the center: E = kQ/r². Field lines leave the surface at right angles.'; }
      else { desc = 'Point charges ' + qs.map(function (q) { return un(q.q, uqs) + ' at (' + fm(q.x, 2) + ', ' + fm(q.y, 2) + ') m'; }).join(', ') + '.' + (e0 && !F.quiet ? ' At P the field is ' + un(e0.E, 'N/C', 3) + '.' : '');
        if (e0) { read = 'At P (' + fm(test.x, 2) + ', ' + fm(test.y, 2) + ') m: E = <b>' + un(e0.E, 'N/C', 3) + '</b> at <b>' + fm(M.atan2(e0.Ey, e0.Ex) / DEG, 0) + '°</b> (the vector sum of each charge\'s field), V = <b>' + un(e0.V, 'V', 3) + '</b>. A ' + un(test.q, 'nC') + ' test charge feels F = qE = <b>' + un(test.q * 1e-9 * e0.E, 'N', 3) + '</b>; the field itself does not depend on the test charge.' + (M.abs(e0.V) < 0.02 * e0.E * 0.1 ? ' Here V ≈ 0 but E is not zero.' : ''); st = [['E at P', un(e0.E, 'N/C', 3)], ['direction', fm(M.atan2(e0.Ey, e0.Ex) / DEG, 0) + '°'], ['V at P', un(e0.V, 'V', 3)], ['force on test', un(test.q * 1e-9 * e0.E, 'N', 3)]]; }
        else read = 'Field lines start on positive charges and end on negative ones. Where they crowd together the field is strong. They never cross: the field has one direction at each point.'; }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });
  function polarize(F, o) {
    var d = num(o.d, 0.08), c = F.canvas({ aspect: 2, narrow: 1.3 });
    if (F.live) F.slider(null, { label: 'Distance from the rod', min: 0.03, max: 0.2, step: 0.005, value: d, unit: 'm', d: 3, input: function (v) { d = v; } });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c);
      var s = (W0 - 80) / 0.4, rx = 40, ry = H0 / 2, R0 = 0.035 * s, cx0 = rx + 0.06 * s + d * s + R0, sep = M.min(1, 0.02 / d) * R0 * 0.6;
      block(ctx, rx - 14, ry - 70, 28, 140, { fill: rgba(k.red, 0.2), color: k.red, r: 12 }); for (var i = 0; i < 7; i++) txt(ctx, '+', rx, ry - 54 + i * 18, { align: 'center', size: 14, weight: 800, color: k.red }); txt(ctx, 'charged rod', rx, ry + 84, { align: 'center', size: 11, color: k.muted });
      circ(ctx, cx0, ry, R0, { fill: k.isDark ? '#3b4650' : '#dfe4ea', color: k.metal, w: 3 });
      for (var j = 0; j < 5; j++) { var a = PI - 0.9 + j * 0.45; txt(ctx, '−', cx0 + (R0 - 9) * M.cos(a), ry + (R0 - 9) * M.sin(a), { align: 'center', size: 15, weight: 800, color: k.blue }); txt(ctx, '+', cx0 - (R0 - 9) * M.cos(a), ry + (R0 - 9) * M.sin(a), { align: 'center', size: 14, weight: 800, color: k.red }); }
      var fNear = 1 / M.pow(d, 2), fFar = 1 / M.pow(d + 2 * 0.035, 2), sc = 60 / fNear;
      arrow(ctx, cx0 - R0, ry + R0 + 20, cx0 - R0 - fNear * sc, ry + R0 + 20, { color: k.blue, w: 2.4, label: 'pull on the near −' }); arrow(ctx, cx0 + R0, ry + R0 + 20, cx0 + R0 + fFar * sc, ry + R0 + 20, { color: k.red, w: 2.4, label: 'push on the far +' }); arrow(ctx, cx0, ry - R0 - 18, cx0 - (fNear - fFar) * sc, ry - R0 - 18, { color: k.net, w: 4, label: 'net: toward the rod' });
      void sep;
      F.desc('A positively charged rod beside a neutral metal sphere ' + un(d, 'm') + ' away; the sphere\'s electrons shift toward the rod.');
      F.read('The sphere has no net charge, but its electrons move toward the rod, leaving the far side positive. The near charges are closer, so the pull beats the push (force falls off as 1/r²): a neutral object <b>is attracted</b>.');
    };
    F.now(); return {};
  }
  /* PM.platesDeflect(V, d, L, v0, q, m): vertical deflection of a charge crossing uniform plates of length L */
  PM.platesDeflect = function (V, d, L, v0, q, m) { var E = V / d, a = q * E / m, t = L / v0; return { E: E, a: a, t: t, y: 0.5 * a * t * t, vy: a * t }; };
  function plates(F, o) {
    var P = { V: num(o.V, 100), d: num(o.d, 0.02), L: num(o.L, 0.05), v0: num(o.v0, 2e7), part: o.particle === 'proton' ? 'proton' : 'electron' };
    var c = F.canvas({ aspect: 2, narrow: 1.3 }), A = F.anim({ tmax: 1, rate: 0.5, dt: 1 / 20, autoplay: true, loop: true, tStatic: 1 });
    if (F.live) { F.slider(null, { label: 'Plate voltage', min: 0, max: 300, step: 5, value: P.V, unit: 'V', d: 0, input: function (v) { P.V = v; } }); F.slider(null, { label: 'Entry speed', min: 0.5e7, max: 5e7, step: 0.1e7, value: P.v0, d: 0, fmt: function (v) { return un(v, 'm/s', 2); }, input: function (v) { P.v0 = v; } }); }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c);
      var q = P.part === 'electron' ? -QE : QE, m = P.part === 'electron' ? ME : MP, r = PM.platesDeflect(P.V, P.d, P.L, P.v0, q, m), x0 = 40, x1 = W0 * 0.72, ytop = H0 * 0.2, ybot = H0 * 0.8, sy = (ybot - ytop) / P.d, sx = (x1 - x0) / P.L, ymid = (ytop + ybot) / 2;
      block(ctx, x0, ytop - 12, x1 - x0, 12, { fill: rgba(k.red, 0.25), color: k.red, r: 2 }); block(ctx, x0, ybot, x1 - x0, 12, { fill: rgba(k.blue, 0.25), color: k.blue, r: 2 }); for (var i = 0; i < 10; i++) { var xx = x0 + 15 + i * (x1 - x0 - 30) / 9; txt(ctx, '+', xx, ytop - 6, { align: 'center', size: 12, weight: 800, color: k.red }); txt(ctx, '−', xx, ybot + 6, { align: 'center', size: 12, weight: 800, color: k.blue }); if (i % 2 === 0) arrow(ctx, xx, ytop + 8, xx, ybot - 8, { color: rgba(k.efield, 0.35), w: 1.4, head: 7 }); }
      txt(ctx, 'E = V/d' + (F.vals ? ' = ' + un(r.E, 'V/m', 3) : ''), x1 + 10, ytop + 10, { size: 11.5, color: k.efield, weight: 700 });
      var pts = [], frac = clamp(A.t, 0, 1), xe = 0; for (var j = 0; j <= 60; j++) { var t = j / 60 * r.t, y = -0.5 * r.a * t * t; var yp = ymid + y * sy; if (yp < ytop || yp > ybot) { break; } pts.push([x0 + P.v0 * t * sx, yp]); xe = j; }
      var hit = xe < 60, last = pts[pts.length - 1]; if (!hit) { var tex = 1.4 * r.t; for (j = 1; j <= 20; j++) { var t2 = r.t + j / 20 * (tex - r.t); pts.push([x0 + P.v0 * t2 * sx, ymid + (-0.5 * r.a * r.t * r.t - r.vy * (t2 - r.t)) * sy]); } }
      poly(ctx, pts.slice(0, M.max(2, M.round(pts.length * frac))), { color: k.acc, w: 2.4 }); var pc = pts[M.max(0, M.min(pts.length - 1, M.round(pts.length * frac) - 1))]; circ(ctx, pc[0], pc[1], 5, { fill: P.part === 'electron' ? k.blue : k.red });
      void last;
      F.desc('A' + (P.part === 'electron' ? 'n electron' : ' proton') + ' enters the gap between plates ' + un(P.d, 'm') + ' apart at ' + un(P.V, 'V') + ' moving at ' + un(P.v0, 'm/s') + '.');
      F.read('The field is uniform, so the force qE is constant: the path is a <b>parabola</b>, like a ball thrown sideways. ' + (hit ? 'It hits the plate.' : 'Sideways shift on leaving: <b>' + un(M.abs(r.y) * 1000, 'mm', 3) + '</b>.') + ' The ' + P.part + ' bends toward the ' + (P.part === 'electron' ? 'positive' : 'negative') + ' plate; its speed along the plates never changes.');
      F.stats([['field E', un(r.E, 'V/m', 3)], ['acceleration', un(M.abs(r.a), 'm/s²', 3)], ['time between plates', un(r.t, 's', 3)], ['deflection', hit ? 'hits' : un(M.abs(r.y) * 1000, 'mm', 3)]]);
    };
    F.now(); return {};
  }
  /* PM.capacitor(A, d, kappa, batteryV or Q): parallel-plate capacitor */
  PM.capacitor = function (Ar, d, kap) { return kap * EPS0 * Ar / d; };
  function capacitor(F, o) {
    var P = { A: num(o.A, 0.01), d: num(o.d, 0.001), kap: num(o.kappa, 3), ins: !!o.inserted, bat: o.battery !== false, V0: num(o.V, 12) };
    var Q0 = PM.capacitor(P.A, P.d, 1) * P.V0, c = F.canvas({ aspect: 1.9, narrow: 1.2 });
    if (F.live) { var row = F.row(); F.check(row, 'Battery connected', P.bat, function (on) { if (!on) Q0 = PM.capacitor(P.A, P.d, P.ins ? P.kap : 1) * P.V0; P.bat = on; }); F.check(row, 'Dielectric inserted (κ = ' + fm(P.kap, 1) + ')', P.ins, function (on) { if (!P.bat && !on && P.ins) { /* Q stays */ } P.ins = on; }); F.slider(row, { label: 'Plate gap d', min: 0.0005, max: 0.004, step: 0.0001, value: P.d, unit: 'm', d: 4, input: function (v) { P.d = v; } }); }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c);
      var C = PM.capacitor(P.A, P.d, P.ins ? P.kap : 1), Q = P.bat ? C * P.V0 : Q0, V = Q / C, E = V / P.d, U = 0.5 * Q * V;
      var cx0 = W0 * 0.32, gap = clamp(P.d / 0.004, 0.12, 1) * 120, ph = H0 * 0.6, y0 = (H0 - ph) / 2;
      block(ctx, cx0 - gap / 2 - 10, y0, 10, ph, { fill: rgba(k.red, 0.3), color: k.red, r: 2 }); block(ctx, cx0 + gap / 2, y0, 10, ph, { fill: rgba(k.blue, 0.3), color: k.blue, r: 2 });
      if (P.ins) { ctx.save(); ctx.fillStyle = rgba(k.gold, 0.3); ctx.fillRect(cx0 - gap / 2 + 2, y0 + 4, gap - 4, ph - 8); ctx.restore(); txt(ctx, 'κ', cx0, y0 + ph - 14, { align: 'center', size: 14, italic: true, serif: true, color: k.gold }); }
      var nq = clamp(M.round(Q / (PM.capacitor(P.A, P.d, 1) * P.V0) * 6), 1, 24); for (var i = 0; i < nq; i++) { var yy = y0 + (i + 0.5) / nq * ph; txt(ctx, '+', cx0 - gap / 2 - 18, yy, { align: 'center', size: 11, weight: 800, color: k.red }); txt(ctx, '−', cx0 + gap / 2 + 18, yy, { align: 'center', size: 11, weight: 800, color: k.blue }); }
      var nE = clamp(M.round(E / (P.V0 / 0.001) * 6), 1, 20); for (i = 0; i < nE; i++) { var ye = y0 + (i + 0.5) / nE * ph; arrow(ctx, cx0 - gap / 2 + 3, ye, cx0 + gap / 2 - 3, ye, { color: rgba(k.efield, 0.7), w: 1.3, head: 6 }); }
      if (P.bat) { line(ctx, cx0 - gap / 2 - 10, y0 + ph / 2, cx0 - gap / 2 - 50, y0 + ph / 2, k.ink, 2); line(ctx, cx0 - gap / 2 - 50, y0 + ph / 2, cx0 - gap / 2 - 50, H0 - 14, k.ink, 2); line(ctx, cx0 + gap / 2 + 10, y0 + ph / 2, cx0 + gap / 2 + 50, y0 + ph / 2, k.ink, 2); line(ctx, cx0 + gap / 2 + 50, y0 + ph / 2, cx0 + gap / 2 + 50, H0 - 14, k.ink, 2); line(ctx, cx0 - gap / 2 - 50, H0 - 14, cx0 - 10, H0 - 14, k.ink, 2); line(ctx, cx0 + 10, H0 - 14, cx0 + gap / 2 + 50, H0 - 14, k.ink, 2); line(ctx, cx0 - 8, H0 - 26, cx0 - 8, H0 - 2, k.ink, 3); line(ctx, cx0 + 4, H0 - 20, cx0 + 4, H0 - 8, k.ink, 3); txt(ctx, un(P.V0, 'V'), cx0 + 14, H0 - 26, { size: 11, color: k.ink }); }
      var tx = W0 * 0.62; [['C', un(C * 1e12, 'pF', 3)], ['Q', un(Q * 1e9, 'nC', 3)], ['V', un(V, 'V', 3)], ['E', un(E, 'V/m', 3)], ['U = ½QV', un(U * 1e9, 'nJ', 3)]].forEach(function (q, i) { txt(ctx, q[0], tx, 30 + i * 30, { size: 13, weight: 700, color: k.muted }); txt(ctx, F.vals ? q[1] : '?', tx + 80, 30 + i * 30, { size: 13, weight: 700, color: k.ink }); });
      F.desc('A parallel-plate capacitor (' + un(P.A, 'm²') + ', gap ' + un(P.d * 1000, 'mm') + ')' + (P.ins ? ' with a dielectric' : '') + (P.bat ? ', connected to a ' + un(P.V0, 'V') + ' battery.' : ', disconnected (its charge is trapped).'));
      F.read('C = κε₀A/d. ' + (P.bat ? 'With the battery connected, <b>V stays ' + un(P.V0, 'V') + '</b>: a dielectric or a smaller gap raises C, so more charge flows on (Q = CV).' : 'Disconnected, <b>Q stays fixed</b>: raising C lowers V = Q/C and the field between the plates.') + ' Stored energy U = ½CV² = <b>' + un(U * 1e9, 'nJ', 3) + '</b>.');
      F.stats([['C', un(C * 1e12, 'pF', 3)], ['Q', un(Q * 1e9, 'nC', 3)], ['V', un(V, 'V', 3)], ['U', un(U * 1e9, 'nJ', 3)]]);
    };
    F.now(); return {};
  }
  function distribution(F, o) {
    var ds = o.dist || {}, type = pick(ds.type, ['rod', 'ring', 'disk', 'line', 'sheet', 'ball', 'shell'], 'ring'), Qn = num(ds.Q, 5), R0 = num(ds.R, 0.1), L0 = num(ds.L, 0.3), dP = num(o.dP, type === 'ball' || type === 'shell' ? 0.16 : 0.1), c = F.canvas({ aspect: 1.9, narrow: 1.0 });
    var Q = Qn * 1e-9, mp = null;
    var hd = F.handles(F.live ? [{ name: 'field point P', pos: function () { return mp ? mp.P() : null; }, drag: function (px, py) { dP = clamp(mp.d(px, py), 0.005, 0.4); }, key: function (dx, dy, big) { dP = clamp(dP + (dx || dy) * (big ? 0.02 : 0.005), 0.005, 0.4); } }] : [], { r: 20 });
    var unitQ = type === 'line' ? 'nC/m' : type === 'sheet' ? 'nC/m²' : 'nC';
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, wide = W0 > 560, sw = wide ? W0 * 0.55 : W0, sh2 = wide ? H0 : H0 * 0.55; bg(c);
      var s = M.min(sw / 0.7, sh2 / 0.5), ox = sw * 0.35, oy = sh2 / 2, n = 12, E = PM.distE(type, Q, R0, L0, dP), pieces = [];
      if (type === 'ring' || type === 'disk') { // side view: ring in the y–z plane seen edge-on, axis along x
        ctx.save(); ctx.translate(ox, oy); ctx.scale(0.3, 1); circ(ctx, 0, 0, R0 * s, { color: k.red, w: 6, fill: type === 'disk' ? rgba(k.red, 0.25) : null }); ctx.restore();
        for (var i = 0; i < n; i++) { var a = i / n * TAU; pieces.push([ox + 0.3 * R0 * s * M.cos(a), oy - R0 * s * M.sin(a), 0, R0 * M.sin(a)]); }
        mp = { P: function () { return [ox + dP * s, oy]; }, d: function (px) { return (px - ox) / s; } };
        line(ctx, ox - 20, oy, sw - 10, oy, k.axis, 1, [4, 4]);
      } else if (type === 'rod' || type === 'line') { var Lh = type === 'line' ? 0.6 : L0 / 2; block(ctx, ox - Lh * s, oy - 4, 2 * Lh * s, 8, { fill: rgba(k.red, 0.35), color: k.red, r: 4 }); if (type === 'line') { txt(ctx, '…', ox - Lh * s + 6, oy - 14, { size: 14, color: k.red }); } for (i = 0; i < n; i++) { var xx = -Lh + (i + 0.5) / n * 2 * Lh; pieces.push([ox + xx * s, oy, xx, 0]); } mp = { P: function () { return [ox, oy - dP * s]; }, d: function (px, py) { return (oy - py) / s; } }; }
      else if (type === 'sheet') { ctx.save(); ctx.fillStyle = rgba(k.red, 0.2); ctx.fillRect(ox - 6, 10, 12, sh2 - 20); ctx.restore(); line(ctx, ox, 10, ox, sh2 - 10, k.red, 2); for (i = 0; i < 8; i++) txt(ctx, '+', ox, 20 + i * (sh2 - 40) / 7, { align: 'center', size: 12, weight: 800, color: k.red }); mp = { P: function () { return [ox + dP * s, oy]; }, d: function (px) { return (px - ox) / s; } }; }
      else { circ(ctx, ox, oy, R0 * s, type === 'ball' ? { fill: rgba(k.red, 0.25), color: k.red, w: 2 } : { color: k.red, w: 5 }); mp = { P: function () { return [ox + dP * s, oy]; }, d: function (px) { return (px - ox) / s; } }; if (dP < R0) circ(ctx, ox, oy, dP * s, { color: k.gold, w: 1.5, dash: [5, 4] }); }
      var P0 = mp.P(), sc = 60 / M.max(1, E);
      if (F.on('pieces', true) && pieces.length) pieces.forEach(function (pc, i) { if (i % 2) return; var dx = P0[0] - pc[0], dy = P0[1] - pc[1], r = M.hypot(dx, dy), e = 1 / (r * r), L = clamp(e * 900, 10, 50); circ(ctx, pc[0], pc[1], 3.5, { fill: k.red }); arrow(ctx, P0[0], P0[1], P0[0] + L * dx / r, P0[1] + L * dy / r, { color: rgba(k.efield, 0.45), w: 1.4, head: 6 }); line(ctx, pc[0], pc[1], P0[0], P0[1], rgba(k.muted, 0.25), 1, [2, 3]); });
      var dir = type === 'rod' || type === 'line' ? [0, -1] : [1, 0], Le = clamp(M.log10(E + 1) * 18, 8, 90); if (E > 0) arrow(ctx, P0[0], P0[1], P0[0] + dir[0] * Le, P0[1] + dir[1] * Le, { color: k.efield, w: 3.2, label: 'E' });
      circ(ctx, P0[0], P0[1], 6, { fill: k.gold, color: k.bg, w: 2 }); txt(ctx, 'P', P0[0] + 8, P0[1] + 12, { size: 12, weight: 800, halo: true }); F.tagAt(ctx, 'P0', P0[0] - 16, P0[1] + 16);
      if (wide || true) { var gr = wide ? { x: sw + 40, y: 18, w: W0 - sw - 54, h: H0 - 46 } : { x: 50, y: sh2 + 14, w: W0 - 64, h: H0 - sh2 - 38 }, emax = 0; for (var q = 1; q <= 60; q++) emax = M.max(emax, PM.distE(type, Q, R0, L0, 0.4 * q / 60)); var G = GP(ctx, gr, { xmin: 0, xmax: 0.4, ymin: 0, ymax: (type === 'rod' || type === 'line' ? PM.distE(type, Q, R0, L0, 0.03) * 1.2 : emax * 1.15) || 1, xlab: (type === 'rod' || type === 'line' ? 'distance' : type === 'ring' || type === 'disk' ? 'z on axis' : 'r') + ' (m)', ylab: 'E (N/C)', compact: true }).frame(); G.plot(function (x) { return PM.distE(type, Q, R0, L0, x); }, k.efield, 2.4); G.dot(dP, E, k.gold, 5); if (type === 'ball' || type === 'shell' || type === 'ring' || type === 'disk') G.vline(R0, k.muted, [3, 3]); }
      hd.draw(ctx);
      var formula = { ring: 'E = kQz/(z² + R²)^{3/2}', disk: 'E = (σ/2ε₀)(1 − z/√(z² + R²))', rod: 'E = kQ/(d√(d² + L²/4))', line: 'E = 2kλ/r', sheet: 'E = σ/2ε₀ (the same at every distance)', ball: 'E = kQr/R³ inside, kQ/r² outside', shell: 'E = 0 inside, kQ/r² outside' }[type];
      F.desc('A charged ' + type + ' (' + un(Qn, unitQ) + ') and a field point P ' + un(dP, 'm') + ' away' + (F.quiet ? '.' : '; E = ' + un(E, 'N/C', 3) + '.'));
      F.read('Add up the fields of small pieces dq: parts that point sideways cancel by symmetry, leaving ' + formula.replace('^{3/2}', '<sup>3/2</sup>') + '. At P: E = <b>' + un(E, 'N/C', 3) + '</b>.' + (type === 'ball' && dP < R0 ? ' Inside the ball only the charge closer to the center than P counts, so E grows with r.' : type === 'shell' && dP < R0 ? ' Inside the shell the pulls from all sides cancel exactly.' : ''));
      F.stats([['distance', un(dP, 'm', 3)], ['E', un(E, 'N/C', 3)]]);
    };
    F.now(); return {};
  }

  // ===================================================================================================
  // ph-circuit: modified nodal analysis for DC, companion models for transients, phasors for series AC.
  /* PM.solve(comps, opt): comps [{type: 'V'|'R'|'bulb'|'C'|'L'|'S'|'A'|'Vm'|'LED'|'AC', a, b, value, r, closed, off}] with a = + terminal
     for sources. opt = {dt, prev} for a transient step (capacitor voltages and inductor currents from the step before).
     Returns {V: {node: volts}, I: [current from a to b through each part]}. Ground is the − terminal of the first source. */
  PM.solve = function (comps, opt) {
    opt = opt || {}; var nodes = {}, nn = 0, gnd = null;
    comps.forEach(function (c0) { if (!gnd && (c0.type === 'V' || c0.type === 'AC')) gnd = c0.b; });
    if (!gnd && comps.length) gnd = comps[0].b;
    function id(n) { if (n === gnd) return -1; if (!(n in nodes)) nodes[n] = nn++; return nodes[n]; }
    comps.forEach(function (c0) { id(c0.a); id(c0.b); if ((c0.type === 'V' || c0.type === 'AC') && c0.r > 0) id(c0.a + '#r'); if (c0.type === 'LED') id(c0.a + '#d'); });
    var ledOn = comps.map(function (c0) { return c0.type === 'LED' ? !!c0._on : false; }), res;
    for (var iter = 0; iter < 6; iter++) {
      var vs = [], G = [], rhs = [];
      comps.forEach(function (c0, i) { if (c0.off) return; var t = c0.type; if (t === 'V' || t === 'AC' || t === 'A' || (t === 'S' && c0.closed !== false) || (t === 'L' && !opt.dt) || (t === 'LED' && ledOn[i])) vs.push(i); });
      var N = nn + vs.length; for (var r = 0; r < N; r++) { G.push(new Array(N).fill(0)); rhs.push(0); }
      function addG(a, b, g) { var i1 = id(a), j1 = id(b); if (i1 >= 0) G[i1][i1] += g; if (j1 >= 0) G[j1][j1] += g; if (i1 >= 0 && j1 >= 0) { G[i1][j1] -= g; G[j1][i1] -= g; } }
      function addI(a, b, cur) { var i1 = id(a), j1 = id(b); if (i1 >= 0) rhs[i1] -= cur; if (j1 >= 0) rhs[j1] += cur; } // a current source pushing cur from a to b through itself
      for (var q = 0; q < nn; q++) G[q][q] += 1e-12;
      comps.forEach(function (c0, i) {
        if (c0.off) return; var t = c0.type;
        if (t === 'R' || t === 'bulb') addG(c0.a, c0.b, 1 / M.max(1e-9, c0.value));
        else if ((t === 'V' || t === 'AC') && c0.r > 0) addG(c0.a, c0.a + '#r', 1 / c0.r);
        else if (t === 'C' && opt.dt) { var tr = opt.method === 'trap', gC = (tr ? 2 : 1) * c0.value / opt.dt, vp = (opt.prev && opt.prev.vc[i]) || 0, icp = tr ? ((opt.prev && opt.prev.ic && opt.prev.ic[i]) || 0) : 0; addG(c0.a, c0.b, gC); addI(c0.b, c0.a, gC * vp + icp); }
        else if (t === 'L' && opt.dt) { var tr2 = opt.method === 'trap', gL = opt.dt / ((tr2 ? 2 : 1) * c0.value), ip = (opt.prev && opt.prev.il[i]) || 0, vlp = tr2 ? ((opt.prev && opt.prev.vl && opt.prev.vl[i]) || 0) : 0; addG(c0.a, c0.b, gL); addI(c0.a, c0.b, ip + gL * vlp); }
        else if (t === 'LED' && ledOn[i]) addG(c0.a + '#d', c0.b, 1 / 10);
      });
      vs.forEach(function (ci, j) {
        var c0 = comps[ci], t = c0.type, row = nn + j, pa = (t === 'V' || t === 'AC') && c0.r > 0 ? c0.a + '#r' : t === 'LED' ? c0.a : c0.a, pb = t === 'LED' ? c0.a + '#d' : c0.b, ia = id(pa), ib = id(pb);
        if (ia >= 0) { G[ia][row] += 1; G[row][ia] += 1; } if (ib >= 0) { G[ib][row] -= 1; G[row][ib] -= 1; }
        rhs[row] = t === 'V' ? c0.value : t === 'AC' ? (opt.acV != null ? opt.acV : 0) : t === 'LED' ? 2.0 : 0;
      });
      var x = gaussSolve(G, rhs), V = {}; V[gnd] = 0; Object.keys(nodes).forEach(function (n) { V[n] = x[nodes[n]]; });
      var I = comps.map(function (c0, i) {
        if (c0.off) return 0; var t = c0.type, j = vs.indexOf(i);
        if (j >= 0) return x[nn + j];
        if (t === 'R' || t === 'bulb') return (V[c0.a] - V[c0.b]) / c0.value;
        if ((t === 'V' || t === 'AC') && c0.r > 0) return (V[c0.a] - V[c0.a + '#r']) / c0.r;
        if (t === 'C' && opt.dt) { var trc = opt.method === 'trap', g1 = (trc ? 2 : 1) * c0.value / opt.dt; return g1 * ((V[c0.a] - V[c0.b]) - ((opt.prev && opt.prev.vc[i]) || 0)) - (trc ? ((opt.prev && opt.prev.ic && opt.prev.ic[i]) || 0) : 0); }
        if (t === 'L' && opt.dt) { var trl = opt.method === 'trap', g2 = opt.dt / ((trl ? 2 : 1) * c0.value); return ((opt.prev && opt.prev.il[i]) || 0) + g2 * ((V[c0.a] - V[c0.b]) + (trl ? ((opt.prev && opt.prev.vl && opt.prev.vl[i]) || 0) : 0)); }
        return 0;
      });
      res = { V: V, I: I };
      var changed = false; comps.forEach(function (c0, i) { if (c0.type !== 'LED' || c0.off) return; var dv = V[c0.a] - V[c0.b]; if (!ledOn[i] && dv > 2.0 + 1e-6) { ledOn[i] = true; changed = true; } else if (ledOn[i] && I[i] < -1e-9) { ledOn[i] = false; changed = true; } });
      if (!changed) break;
    }
    comps.forEach(function (c0, i) { if (c0.type === 'LED') c0._on = ledOn[i]; });
    return res;
  };
  function gaussSolve(A, b) { var n = b.length, M2 = A.map(function (r, i) { return r.concat([b[i]]); }); for (var c0 = 0; c0 < n; c0++) { var p = c0; for (var r = c0 + 1; r < n; r++) if (M.abs(M2[r][c0]) > M.abs(M2[p][c0])) p = r; var t = M2[c0]; M2[c0] = M2[p]; M2[p] = t; var d = M2[c0][c0]; if (M.abs(d) < 1e-15) continue; for (r = 0; r < n; r++) { if (r === c0) continue; var f = M2[r][c0] / d; if (!f) continue; for (var k = c0; k <= n; k++) M2[r][k] -= f * M2[c0][k]; } } return M2.map(function (r, i) { return M.abs(r[i]) < 1e-15 ? 0 : r[n] / r[i]; }); }
  /* shorthand: 'V(12) series(R1:4, par(R2:6, R3:3))' -> a tree {kind: 'series'|'par'|'leaf', kids, comp} plus the source */
  function parseShort(src) {
    var s = String(src).replace(/\s+/g, ' ').trim(), p = 0, src0 = null;
    function ws() { while (s[p] === ' ') p++; }
    function word() { ws(); var m = /^[A-Za-z][A-Za-z0-9]*/.exec(s.slice(p)); if (!m) throw new Error('circuit: name expected at ' + p); p += m[0].length; return m[0]; }
    function args() { ws(); if (s[p] !== '(') return []; var d = 0, st = p; for (; p < s.length; p++) { if (s[p] === '(') d++; else if (s[p] === ')') { d--; if (!d) break; } } var inner = s.slice(st + 1, p); p++; return inner; }
    function elem() {
      var w = word(); ws();
      if (w === 'series' || w === 'par') { var inner = args(), kids = [], d = 0, cur = ''; for (var i = 0; i < inner.length; i++) { var ch = inner[i]; if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && !d) { kids.push(cur); cur = ''; } else cur += ch; } if (cur.trim()) kids.push(cur); return { kind: w, kids: kids.map(function (q) { var sub2 = parseShort.inner(q); return sub2; }) }; }
      var val = null, st = 'closed'; if (s[p] === ':') { p++; ws(); var m = /^[-+0-9.eE]+/.exec(s.slice(p)); if (m) { val = +m[0]; p += m[0].length; } if (s[p] === '/') { p++; st = word(); } }
      return { kind: 'leaf', comp: leafComp(w, val, st) };
    }
    parseShort.inner = function (q) { var save = [s, p]; s = q.trim(); p = 0; var e = elem(); s = save[0]; p = save[1]; return e; };
    ws(); var m0 = /^(V|AC)\(([^)]*)\)/.exec(s.slice(p));
    if (m0) { p += m0[0].length; var parts = m0[2].split(','), o2 = { type: m0[1], value: +parts[0], r: 0, label: m0[1] === 'AC' ? 'AC' : 'ε' }; parts.slice(1).forEach(function (q) { var kv = q.split('='); if (kv[0].trim() === 'r') o2.r = +kv[1]; if (kv[0].trim() === 'f') o2.f = +kv[1]; }); src0 = o2; }
    var items = []; ws(); while (p < s.length) { items.push(elem()); ws(); if (s[p] === ',') p++; ws(); }
    return { source: src0 || { type: 'V', value: 12, r: 0, label: 'ε' }, load: items.length === 1 ? items[0] : { kind: 'series', kids: items } };
  }
  function leafComp(w, val, st) {
    var t = /^LED|^D\d/.test(w) ? 'LED' : /^Vm/.test(w) ? 'Vm' : w[0] === 'R' ? 'R' : w[0] === 'B' ? 'bulb' : w[0] === 'C' ? 'C' : w[0] === 'L' ? 'L' : w[0] === 'S' ? 'S' : w[0] === 'A' ? 'A' : 'R';
    var c0 = { type: t, label: w, value: val != null ? val : t === 'bulb' ? 6 : t === 'R' ? 10 : t === 'C' ? 1e-3 : t === 'L' ? 1 : 0 };
    if (t === 'C' && val != null && val > 1e-2) c0.value = val * 1e-6; // C given in μF
    if (t === 'S') c0.closed = st !== 'open' && val !== 0;
    return c0;
  }
  /* lay out a shorthand tree: series left to right, parallel branches stacked; each part 2 units long */
  function layoutTree(tree) {
    var comps = [], segs = [], nid = 0;
    function size(n) { if (n.kind === 'leaf') { n.w = 2; n.h = 1; } else if (n.kind === 'series') { n.w = 0; n.h = 0; n.kids.forEach(function (k0) { size(k0); n.w += k0.w; n.h = M.max(n.h, k0.h); }); } else { n.w = 0; n.h = 0; n.kids.forEach(function (k0) { size(k0); n.w = M.max(n.w, k0.w); n.h += k0.h; }); n.w += 1; } }
    function place(n, x, y, na, nb) {
      n.x = x; n.y = y; n.na = na; n.nb = nb;
      if (n.kind === 'leaf') { n.comp.a = na; n.comp.b = nb; n.comp.x0 = x; n.comp.x1 = x + 2; n.comp.y = y; comps.push(n.comp); return; }
      if (n.kind === 'series') { var cx0 = x, names = [na]; for (var i = 1; i < n.kids.length; i++) names.push('m' + (nid++)); names.push(nb); n.kids.forEach(function (k0, i) { place(k0, cx0, y, names[i], names[i + 1]); cx0 += k0.w; }); return; }
      var yy = y, xl = x + 0.5, xr = x + n.w - 0.5; n.kids.forEach(function (k0, i) { place(k0, xl, yy, na, nb); if (k0.w < n.w - 1) segs.push({ pts: [[xl + k0.w, yy], [xr, yy]], cur: function () { return treeI(k0); } }); n.kids[i].yb = yy; yy += k0.h; });
      segs.push({ pts: [[x, y], [xl, y]], cur: function () { return treeI(n); } }); segs.push({ pts: [[xr, y], [x + n.w, y]], cur: function () { return treeI(n); } });
      for (var i = 0; i < n.kids.length - 1; i++) (function (i) { var below = n.kids.slice(i + 1); segs.push({ pts: [[xl, n.kids[i].yb], [xl, n.kids[i + 1].yb]], cur: function () { return below.reduce(function (s0, k1) { return s0 + treeI(k1); }, 0); } }); segs.push({ pts: [[xr, n.kids[i + 1].yb], [xr, n.kids[i].yb]], cur: function () { return below.reduce(function (s0, k1) { return s0 + treeI(k1); }, 0); } }); })(i);
    }
    var T = tree.load; size(T); place(T, 1, 0, 'top', 'ret');
    return { comps: comps, segs: segs, w: T.w, h: T.h, tree: T };
  }
  var LAST_I = null; // currents of the last solve, read by the layout's wire segments
  function treeI(n) { if (n.kind === 'leaf') return LAST_I ? LAST_I(n.comp) : 0; if (n.kind === 'series') return treeI(n.kids[0]); return n.kids.reduce(function (s0, k0) { return s0 + treeI(k0); }, 0); }
  PM.short = function (s) { var t = parseShort(s), L = layoutTree(t), src = Object.assign({}, t.source, { a: 'top', b: 'ret' }); return [src].concat(L.comps); };
  R('ph-circuit', function (el, o) {
    var mode = pick(o.mode, ['dc', 'transient', 'ac', 'lc'], 'dc');
    var F = frame(el, o, { dc: 'A circuit', transient: 'A circuit changing with time after a switch', ac: 'An AC circuit with phasors', lc: 'An LC circuit: energy sloshing between capacitor and inductor' }[mode]);
    var sh = { cur: F.on('current', true, true), volt: F.on('voltage', false, true), meters: F.on('meters', true, true), dots: F.on('dots', true), ph: F.on('phasors', mode === 'ac') };
    var def = mode === 'transient' ? 'V(9) series(S1:1, R1:1000, C1:1000)' : mode === 'ac' ? 'AC(10, f=50) series(R1:20, L1:0.1, C1:100)' : mode === 'lc' ? 'V(0) series(L1:0.1, C1:100)' : 'V(12) series(R1:4, par(R2:6, R3:3))';
    var src = o.circuit || def, tree = null, comps, segs = [], Lw = 0, Lh = 1, srcComp = null, layout = null;
    if (typeof src === 'string') { tree = parseShort(src); var L0 = layoutTree(tree); comps = L0.comps; segs = L0.segs; Lw = L0.w; Lh = L0.h; srcComp = Object.assign({}, tree.source, { a: 'top', b: 'ret' }); comps.unshift(srcComp); }
    else { comps = arr(src).map(function (q) { var t = q.type === 'battery' ? 'V' : q.type; return { type: t, a: String(q.a), b: String(q.b), value: num(q.value, t === 'bulb' ? 6 : t === 'R' ? 10 : 0), r: num(q.r, 0), label: q.label || t, closed: q.closed !== false, f: num(q.f, 50) }; }); srcComp = comps.filter(function (q) { return q.type === 'V' || q.type === 'AC'; })[0] || null; layout = o.layout || null; }
    comps.forEach(function (q, i) { q.i = i; if (q.type === 'C' && q.value > 0.05) q.value *= 1e-6; });
    var c = F.canvas({ aspect: mode === 'dc' ? (Lh > 2 ? 1.5 : 1.85) : 1.35, narrow: mode === 'dc' ? (Lh > 2 ? 1.3 : 1.6) : 0.75 }), sol = null, sel = -1, phase = 0, A = null, hist = [], tS = 0;
    // transient / lc state
    var tau = 1, tmax = num(o.tmax, 0), swAt = num(o.switchAt, 0);
    function series(type) { return comps.filter(function (q) { return q.type === type && !q.off; }); }
    function Rtot() { return comps.reduce(function (s0, q) { return s0 + ((q.type === 'R' || q.type === 'bulb') && !q.off ? q.value : 0) + (q.r || 0); }, 0); }
    if (mode === 'transient' || mode === 'lc') {
      var Cs = series('C'), Ls = series('L'); tau = mode === 'lc' ? TAU * M.sqrt((Ls[0] ? Ls[0].value : 1) * (Cs[0] ? Cs[0].value : 1e-3)) : Cs.length ? Rtot() * Cs[0].value : Ls.length ? Ls[0].value / M.max(1e-9, Rtot()) : 1; if (!tmax) tmax = mode === 'lc' ? 2 * tau : 5 * tau;
      if (mode === 'lc' && Cs[0]) Cs[0].v0 = num(o.V0, 5);
    }
    function simulate() { // the whole transient, recorded
      hist = []; var n = 400, dt = tmax / n, prev = { vc: comps.map(function (q) { return q.type === 'C' ? (q.v0 || 0) : 0; }), il: comps.map(function (q) { return q.type === 'L' ? (q.i0 || 0) : 0; }) };
      var sw0 = comps.map(function (q) { return q.closed; });
      for (var j = 0; j <= n; j++) { var t = j * dt; comps.forEach(function (q, i) { if (q.type === 'S') q.closed = swAt > 0 ? (t >= swAt ? !sw0[i] : sw0[i]) : sw0[i]; }); var r = j === 0 && mode === 'lc' ? null : PM.solve(comps, { dt: dt, prev: prev, method: j > 1 || mode === 'lc' ? 'trap' : 'be' }); if (!r) { hist.push({ t: 0, vc: prev.vc.slice(), il: prev.il.slice(), I: comps.map(function () { return 0; }), V: {} }); continue; } var vc = comps.map(function (q, i) { return q.type === 'C' ? r.V[q.a] - r.V[q.b] : 0; }), il = comps.map(function (q, i) { return q.type === 'L' ? r.I[i] : 0; }); var ic = comps.map(function (q, i) { return q.type === 'C' ? r.I[i] : 0; }), vl = comps.map(function (q) { return q.type === 'L' ? r.V[q.a] - r.V[q.b] : 0; }); hist.push({ t: t, vc: vc, il: il, I: r.I, V: r.V }); prev = { vc: vc, il: il, ic: ic, vl: vl }; }
      comps.forEach(function (q, i) { if (q.type === 'S') q.closed = sw0[i]; });
    }
    function solveNow() {
      if (mode === 'transient' || mode === 'lc') { var j = M.min(hist.length - 1, M.max(0, M.round(tS / tmax * (hist.length - 1)))); sol = hist[j] ? { V: hist[j].V, I: hist[j].I } : { V: {}, I: comps.map(function () { return 0; }) }; }
      else if (mode === 'ac') sol = { V: {}, I: comps.map(function () { return 0; }) };
      else sol = PM.solve(comps);
      LAST_I = function (cp) { return sol.I[cp.i] || 0; };
    }
    if (mode === 'transient' || mode === 'lc') simulate();
    A = F.anim({ tmax: mode === 'transient' || mode === 'lc' ? tmax : undefined, scrub: mode === 'transient' || mode === 'lc', rate: mode === 'transient' || mode === 'lc' ? tmax / 6 : 1, loop: mode === 'lc', autoplay: true, tick: mode === 'dc' || mode === 'ac' ? function (h) { phase += h; return true; } : null, dt: tmax ? tmax / 60 : 0.05, tfmt: function (v) { return un(v, 's', 3); }, tStatic: num(o.t, tmax || 0) });
    // DC lesson editing: click a part to select it, change its value, open a switch, remove a bulb
    var edit = !!o.edit && F.live && mode === 'dc', valSl = null, rmBtn = null;
    if (edit) { var row = F.row(); valSl = F.slider(row, { label: 'Selected part', min: 1, max: 30, step: 1, value: 6, unit: 'Ω', d: 0, input: function (v) { if (sel >= 0) { if (comps[sel].type === 'V') comps[sel].value = v; else comps[sel].value = v; } } }); rmBtn = F.button(row, 'Remove it', function () { if (sel > 0) { var q = comps[sel]; if (q.type === 'S') q.closed = !q.closed; else q.off = !q.off; paintSel(); } }); paintSel(); }
    function paintSel() { if (!edit) return; var q = comps[sel]; valSl.el.querySelector('.ml-sl-lab').textContent = q ? (q.label + (q.type === 'V' ? ' (battery, V)' : q.type === 'S' ? ' (switch)' : ' (Ω)')) : 'Click a part to select it'; valSl.input.disabled = !q || q.type === 'S' || q.type === 'A' || q.type === 'Vm'; if (q && !valSl.input.disabled) { valSl.input.max = q.type === 'V' ? 24 : 30; valSl.set(q.value); } rmBtn.textContent = q && q.type === 'S' ? (q.closed ? 'Open the switch' : 'Close the switch') : q && q.off ? 'Put it back' : 'Remove it'; rmBtn.disabled = !q || sel === 0; }
    if (mode === 'ac' && F.live) { F.slider(null, { label: 'Frequency f', min: 5, max: 200, step: 1, value: srcComp ? (srcComp.f || 50) : 50, unit: 'Hz', d: 0, input: function (v) { if (srcComp) srcComp.f = v; } }); }
    // geometry: shorthand trees use grid units; netlists use their layout hints or a circle of nodes
    var G0 = null;
    function geom() {
      var W0 = c.w, H0 = mode === 'dc' ? c.h : c.h * 0.5, padL = 50, padR = 30, padT = 34, padB = 24;
      if (tree) { if (W0 < 560) { padL = 40; padR = 20; } var gw = Lw + 1.5, gh = Lh + 1, sYmax = (H0 - padT - padB) / M.max(1.6, gh), s = M.min((W0 - padL - padR) / gw, sYmax), sy = M.min(sYmax, s * 1.7), ox = padL + ((W0 - padL - padR) - gw * s) / 2, oy = padT; G0 = { s: s, X: function (x) { return ox + (x + 0.25) * s; }, Y: function (y) { return oy + y * sy; }, bot: Lh }; return; }
      var pos = {}, keys = []; comps.forEach(function (q) { [q.a, q.b].forEach(function (n) { if (keys.indexOf(n) < 0) keys.push(n); }); });
      keys.forEach(function (n, i) { pos[n] = layout && layout[n] ? [num(layout[n][0], 0), num(layout[n][1], 0)] : [M.cos(i / keys.length * TAU + PI) * 2 + 2, M.sin(i / keys.length * TAU + PI) * 1.2 + 1.2]; });
      var xs = keys.map(function (n) { return pos[n][0]; }), ys = keys.map(function (n) { return pos[n][1]; }), x0 = M.min.apply(null, xs), y0 = M.min.apply(null, ys), sw = M.max(1, M.max.apply(null, xs) - x0), sh2 = M.max(1, M.max.apply(null, ys) - y0), s2 = M.min((W0 - padL - padR) / sw, (H0 - padT - padB) / sh2);
      G0 = { s: M.min(s2, 120), pos: pos, X: function (x) { return padL + (x - x0) * M.min(s2, 120) + ((W0 - padL - padR) - sw * M.min(s2, 120)) / 2; }, Y: function (y) { return padT + (y - y0) * M.min(s2, 120); } };
    }
    function compPath(q) { // pixel polyline for a component: [start, end] of its symbol plus lead wires
      if (tree) { if (q === srcComp) { var xs0 = G0.X(-0.25), yt = G0.Y(0), yb = G0.Y(G0.bot); return { p: [[xs0, yb], [xs0, yt]], sym: [[xs0, (yt + yb) / 2 + 0.5 * G0.s], [xs0, (yt + yb) / 2 - 0.5 * G0.s]] }; } var y = G0.Y(q.y), a = G0.X(q.x0), b = G0.X(q.x1); return { p: [[a, y], [b, y]], sym: [[a + (b - a) * 0.2, y], [a + (b - a) * 0.8, y]] }; }
      var pa = G0.pos[q.a], pb = G0.pos[q.b], A0 = [G0.X(pa[0]), G0.Y(pa[1])], B0 = [G0.X(pb[0]), G0.Y(pb[1])], pts = M.abs(A0[0] - B0[0]) < 1 || M.abs(A0[1] - B0[1]) < 1 ? [A0, B0] : [A0, [B0[0], A0[1]], B0], L1 = pts.length === 2 ? [A0, B0] : (M.abs(A0[0] - B0[0]) > M.abs(A0[1] - B0[1]) ? [A0, pts[1]] : [pts[1], B0]);
      var mid = [(L1[0][0] + L1[1][0]) / 2, (L1[0][1] + L1[1][1]) / 2], len = M.min(70, M.hypot(L1[1][0] - L1[0][0], L1[1][1] - L1[0][1]) * 0.7), ux = (L1[1][0] - L1[0][0]) / (M.hypot(L1[1][0] - L1[0][0], L1[1][1] - L1[0][1]) || 1), uy = (L1[1][1] - L1[0][1]) / (M.hypot(L1[1][0] - L1[0][0], L1[1][1] - L1[0][1]) || 1);
      return { p: pts, sym: [[mid[0] - ux * len / 2, mid[1] - uy * len / 2], [mid[0] + ux * len / 2, mid[1] + uy * len / 2]] };
    }
    if (F.live && (edit || comps.some(function (q) { return q.type === 'S'; }))) {
      V.drag(c.cv, { hit: function (px, py) { var best = -1, bd = 26; comps.forEach(function (q, i) { var cp = compPath(q), m = [(cp.sym[0][0] + cp.sym[1][0]) / 2, (cp.sym[0][1] + cp.sym[1][1]) / 2], d = M.hypot(m[0] - px, m[1] - py); if (d < bd) { bd = d; best = i; } }); return best >= 0 ? best : null; }, start: function (i) { if (comps[i].type === 'S' && !edit) { comps[i].closed = !comps[i].closed; if (mode === 'transient') { simulate(); A.reset(); } } sel = i; paintSel(); F.now(); }, move: function () { }, end: function () { } });
      c.cv.tabIndex = 0; c.cv.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === 'n' || e.key === 'N') { sel = (sel + 1) % comps.length; paintSel(); F.say('Selected ' + comps[sel].label); F.now(); e.preventDefault(); } else if (e.key === ' ' && sel >= 0) { var q = comps[sel]; if (q.type === 'S') q.closed = !q.closed; else if (edit && sel > 0) q.off = !q.off; paintSel(); F.now(); e.preventDefault(); } else if ((e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft') && edit && sel >= 0 && valSl && !valSl.input.disabled) { var d = e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 1 : -1; comps[sel].value = M.max(1, comps[sel].value + d); valSl.set(comps[sel].value); F.now(); e.preventDefault(); } });
    }
    function sym(ctx, k, q, cp, I, Vab, bright) {
      var a = cp.sym[0], b = cp.sym[1], L = M.hypot(b[0] - a[0], b[1] - a[1]), ang = M.atan2(b[1] - a[1], b[0] - a[0]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, t = q.type, col = q.off ? rgba(k.muted, 0.4) : k.ink;
      ctx.save(); ctx.translate(mx, my); ctx.rotate(ang); var h = L / 2;
      ctx.fillStyle = k.bg; ctx.fillRect(-h - 1, -14, L + 2, 28);
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineJoin = 'round';
      if (t === 'R') { ctx.beginPath(); ctx.moveTo(-h, 0); for (var i = 0; i < 6; i++) ctx.lineTo(-h + (i + 0.5) / 6 * L, i % 2 ? 7 : -7); ctx.lineTo(h, 0); ctx.stroke(); }
      else if (t === 'bulb') { line(ctx, -h, 0, -10, 0, col, 2); line(ctx, 10, 0, h, 0, col, 2); if (bright > 0.01 && !q.off) { var gg = ctx.createRadialGradient(0, 0, 2, 0, 0, 12 + 22 * bright); gg.addColorStop(0, 'rgba(255,214,90,' + (0.35 + 0.6 * M.min(1, bright)) + ')'); gg.addColorStop(1, 'rgba(255,214,90,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 0, 12 + 22 * bright, 0, TAU); ctx.fill(); } circ(ctx, 0, 0, 11, { color: col, w: 2, fill: q.off ? null : rgba('#ffd479', 0.15 + 0.6 * M.min(1, bright)) }); ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(-4, -8, 0, 0); ctx.quadraticCurveTo(4, 8, 10, 0); ctx.stroke(); if (q.off) { line(ctx, -8, -8, 8, 8, k.red, 2); line(ctx, -8, 8, 8, -8, k.red, 2); } }
      else if (t === 'V' || t === 'AC') { if (t === 'AC') { line(ctx, -h, 0, -12, 0, col, 2); line(ctx, 12, 0, h, 0, col, 2); circ(ctx, 0, 0, 12, { color: col, w: 2, fill: k.bg }); ctx.beginPath(); ctx.moveTo(-7, 0); ctx.quadraticCurveTo(-3.5, -8, 0, 0); ctx.quadraticCurveTo(3.5, 8, 7, 0); ctx.stroke(); } else { line(ctx, -h, 0, -4, 0, col, 2); line(ctx, 4, 0, h, 0, col, 2); line(ctx, 4, -13, 4, 13, col, 2.5); line(ctx, -4, -7, -4, 7, col, 4); txt(ctx, '+', 10, -12, { size: 12, weight: 800, color: k.red, align: 'center' }); txt(ctx, '−', -10, -12, { size: 12, weight: 800, color: k.blue, align: 'center' }); } }
      else if (t === 'C') { line(ctx, -h, 0, -4, 0, col, 2); line(ctx, 4, 0, h, 0, col, 2); line(ctx, -4, -12, -4, 12, col, 3); line(ctx, 4, -12, 4, 12, col, 3); }
      else if (t === 'L') { line(ctx, -h, 0, -h * 0.7, 0, col, 2); line(ctx, h * 0.7, 0, h, 0, col, 2); ctx.beginPath(); for (i = 0; i < 4; i++) { var cx1 = -h * 0.7 + (i + 0.5) * (1.4 * h / 4); ctx.moveTo(cx1 - 1.4 * h / 8, 0); ctx.arc(cx1, 0, 1.4 * h / 8, PI, 0); } ctx.stroke(); }
      else if (t === 'S') { line(ctx, -h, 0, -h * 0.4, 0, col, 2); line(ctx, h * 0.4, 0, h, 0, col, 2); circ(ctx, -h * 0.4, 0, 3, { fill: col }); circ(ctx, h * 0.4, 0, 3, { fill: col }); var op = q.closed === false; line(ctx, -h * 0.4, 0, h * 0.4 * (op ? 0.6 : 1), op ? -h * 0.45 : 0, col, 2.5); }
      else if (t === 'A' || t === 'Vm') { line(ctx, -h, 0, -12, 0, col, 2); line(ctx, 12, 0, h, 0, col, 2); circ(ctx, 0, 0, 12, { color: col, w: 2, fill: k.bg }); ctx.rotate(-ang); txt(ctx, t === 'A' ? 'A' : 'V', 0, 0.5, { align: 'center', size: 12, weight: 800, color: col }); }
      else if (t === 'LED') { line(ctx, -h, 0, -8, 0, col, 2); line(ctx, 8, 0, h, 0, col, 2); poly(ctx, [[-8, -9], [-8, 9], [8, 0]], { fill: q._on ? '#ff6b6b' : k.bg, color: col, w: 2, close: true }); line(ctx, 8, -9, 8, 9, col, 2.5); if (q._on) { arrow(ctx, 2, -10, 10, -20, { color: '#ff6b6b', w: 1.5, head: 5 }); arrow(ctx, 8, -8, 16, -18, { color: '#ff6b6b', w: 1.5, head: 5 }); } }
      ctx.restore();
      if (sel === q.i && F.live && (edit || q.type === 'S')) circ(ctx, mx, my, 20, { color: k.gold, w: 2.5, dash: [4, 3] });
    }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c); tS = A.t; solveNow(); geom();
      var Vs = srcComp ? srcComp.value : 0, Imax = 1e-9, Rbmin = M.min.apply(null, comps.filter(function (q) { return q.type === 'bulb'; }).map(function (q) { return q.value; }).concat([1e9])); sol.I.forEach(function (x) { Imax = M.max(Imax, M.abs(x)); });
      var vmin = 0, vmax = 0; Object.keys(sol.V).forEach(function (n) { vmin = M.min(vmin, sol.V[n]); vmax = M.max(vmax, sol.V[n]); });
      function vcol(v) { return sh.volt && vmax > vmin ? mixc(k.isDark ? '#74c0fc' : '#1c6fd6', k.isDark ? '#ff8787' : '#d6336c', (v - vmin) / (vmax - vmin)) : k.ink; }
      var dotPh = phase * 60, dotGap = 22;
      function wire(pts, cur, v) { poly(ctx, pts, { color: vcol(v), w: 2.4 }); if (sh.dots && M.abs(cur) > Imax * 1e-3 && mode !== 'ac') { var sp = cur / Imax; dotsAlong(ctx, cur >= 0 ? pts : pts.slice().reverse(), dotPh * M.abs(sp), dotGap, k.cur, 2.6); } }
      if (tree) { // the main loop wires
        var It = treeI(tree.load || layoutTreeRoot()), xs0 = G0.X(-0.25), yt = G0.Y(0), yb = G0.Y(G0.bot), xe = G0.X(1 + Lw);
        wire([[xs0, yt], [G0.X(1), yt]], It, sol.V.top || 0); wire([[xe, yt], [xe + 0.25 * G0.s, yt], [xe + 0.25 * G0.s, yb], [xs0, yb]], It, sol.V.ret || 0);
        segs.forEach(function (sg) { wire(sg.pts.map(function (p) { return [G0.X(p[0]), G0.Y(p[1])]; }), sg.cur(), 0); });
      }
      comps.forEach(function (q, i) {
        var cp = compPath(q), I = sol.I[i] || 0, Vab = (sol.V[q.a] || 0) - (sol.V[q.b] || 0), P = M.abs(I * Vab), bright = q.type === 'bulb' ? clamp(M.sqrt(P / M.max(1e-9, Vs * Vs / Rbmin)), 0, 1.2) : 0; // one scale for every bulb: brightness grows with power
        var lead = cp.p; if (!tree || q === srcComp) wire(lead, q.type === 'V' || q.type === 'AC' ? -I : I, sol.V[q.a] || 0); else wire(lead, I, sol.V[q.a] || 0);
        sym(ctx, k, q, cp, I, Vab, bright);
        var m = [(cp.sym[0][0] + cp.sym[1][0]) / 2, (cp.sym[0][1] + cp.sym[1][1]) / 2], vert = M.abs(cp.sym[1][0] - cp.sym[0][0]) < 2;
        var lab = q.type === 'V' ? q.label + ' = ' + fm(q.value, 2) + ' V' + (q.r ? ', r = ' + fm(q.r, 2) + ' Ω' : '') : q.type === 'AC' ? 'AC ' + fm(q.value, 2) + ' V' : q.type === 'C' ? q.label + ' ' + un(q.value * 1e6, 'μF', 3) : q.type === 'L' ? q.label + ' ' + un(q.value, 'H', 3) : q.type === 'S' || q.type === 'A' || q.type === 'Vm' || q.type === 'LED' ? q.label : q.label + ' ' + fm(q.value, 2) + ' Ω';
        var inside = tree && q === srcComp; txt(ctx, lab, vert ? (inside ? m[0] + 18 : m[0] - 18) : m[0], vert ? m[1] : m[1] - 22, { align: vert ? (inside ? 'left' : 'right') : 'center', size: 12, weight: 700, color: k.ink, halo: true });
        if (F.tag(q.label)) F.tagAt(ctx, q.label, vert ? m[0] + 22 : m[0] + 26, vert ? m[1] - 22 : m[1] - 24);
        var shown = (q.type === 'A' || q.type === 'Vm') ? sh.meters : sh.cur && q.type !== 'V' && q.type !== 'AC' && q.type !== 'S';
        if (q.type === 'A' && shown) pill(ctx, F.vals ? un(M.abs(I), 'A', 3) : '? A', m[0], m[1] + 26, { size: 11.5, color: k.ink, border: k.gold });
        else if (q.type === 'Vm' && shown) pill(ctx, F.vals ? un(M.abs(Vab), 'V', 3) : '? V', m[0], m[1] + 26, { size: 11.5, color: k.ink, border: k.gold });
        else if (shown && mode !== 'ac' && F.vals && !q.off) { var sgn = I >= 0 ? 1 : -1; txt(ctx, un(M.abs(I), 'A', 3) + (sh.volt ? ' · ' + un(M.abs(Vab), 'V', 3) : ''), vert ? m[0] + 18 : m[0], vert ? m[1] : m[1] + 22, { align: vert ? 'left' : 'center', size: 11, color: k.cur, weight: 700, halo: true }); void sgn; }
      });
      if (tree && F.vals && sh.cur && mode === 'dc') { var Itot = -(sol.I[0] || 0); txt(ctx, 'I = ' + un(Itot, 'A', 3), G0.X(-0.25) + 18, (G0.Y(0) + G0.Y(G0.bot)) / 2 + 22, { align: 'left', size: 11.5, weight: 700, color: k.cur, halo: true }); }
      var desc = '', read = '', st = [];
      if (mode === 'dc') {
        var Itot2 = srcComp ? -(sol.I[srcComp.i] || 0) : 0, Req = Itot2 ? (Vs - Itot2 * (srcComp.r || 0)) / Itot2 : Infinity;
        desc = 'A circuit with ' + comps.length + ' parts: ' + comps.map(function (q) { return q.label + (q.type === 'R' || q.type === 'bulb' ? ' ' + fm(q.value, 2) + ' Ω' : q.type === 'V' ? ' ' + fm(q.value, 2) + ' V' : q.type === 'S' ? (q.closed === false ? ' (open)' : ' (closed)') : ''); }).join(', ') + '.' + (F.quiet ? '' : ' Source current ' + un(Itot2, 'A', 3) + '.');
        read = 'Current from the battery <b>' + un(Itot2, 'A', 3) + '</b>' + (isFinite(Req) ? ', so the outside circuit acts like <b>' + un(Req, 'Ω', 3) + '</b>' : '') + '. ' + comps.filter(function (q) { return (q.type === 'R' || q.type === 'bulb') && !q.off; }).map(function (q) { var I = sol.I[q.i], Vab = (sol.V[q.a] || 0) - (sol.V[q.b] || 0); return q.label + ': ' + un(M.abs(I), 'A', 3) + ', ' + un(M.abs(Vab), 'V', 3) + ', ' + un(M.abs(I * Vab), 'W', 3); }).join('; ') + '. Current is not used up: what flows into a junction flows out.';
        var nsrc = comps.filter(function (q) { return q.type === 'V'; }).length; st = [['source current', un(Itot2, 'A', 3)]].concat(nsrc === 1 ? [['equivalent R', isFinite(Req) ? un(Req, 'Ω', 3) : '∞'], ['power delivered', un(Itot2 * Vs, 'W', 3)]] : []); if (nsrc > 1) read = read.replace(/, so the outside circuit acts like <b>[^<]*<\/b>/, '');
      } else if (mode === 'transient' || mode === 'lc') {
        var gr = { x: 54, y: H0 * 0.5 + 16, w: W0 - 70, h: H0 * 0.5 - 42 }, ci = comps.findIndex(function (q) { return q.type === 'C'; }), li = comps.findIndex(function (q) { return q.type === 'L'; }), qi = ci >= 0 ? ci : li;
        var vals2 = hist.map(function (hq) { return ci >= 0 ? hq.vc[ci] : hq.I[li]; }), iv2 = hist.map(function (hq) { return hq.I[qi]; }), mx2 = M.max.apply(null, vals2.map(M.abs).concat([1e-9])), mi2 = M.max.apply(null, iv2.map(M.abs).concat([1e-12]));
        var G = GP(ctx, gr, { xmin: 0, xmax: tmax, ymin: mode === 'lc' ? -1.15 : -0.05, ymax: 1.15, xlab: 't (s)', ylab: ci >= 0 ? 'V_C (green) and I (gold), scaled' : 'I (green)', compact: true, yticks: false }).frame();
        G.line(hist.map(function (hq, j) { return [hq.t, vals2[j] / mx2]; }), k.green, 2.4); if (ci >= 0) G.line(hist.map(function (hq, j) { return [hq.t, iv2[j] / mi2]; }), k.gold, 2, [6, 3]); G.vline(tS, k.red, [4, 3]);
        if (mode === 'transient') { G.vline(tau + swAt, k.muted, [2, 3]); txt(ctx, 'τ = ' + (ci >= 0 ? 'RC' : 'L/R') + (F.vals ? ' = ' + un(tau, 's', 3) : ''), G.X(tau + swAt) + 4, gr.y + 28, { size: 11, color: k.muted, weight: 700, halo: true, haloColor: k.panelBg }); }
        var j0 = M.min(hist.length - 1, M.round(tS / tmax * (hist.length - 1))), hq0 = hist[j0] || hist[0];
        if (mode === 'lc' && ci >= 0 && li >= 0) { var Cv = comps[ci].value, Lv = comps[li].value, UC = 0.5 * Cv * M.pow(hq0.vc[ci], 2), UL = 0.5 * Lv * M.pow(hq0.il[li], 2); energyBars(ctx, { x: W0 - 120, y: 14, w: 108, h: H0 * 0.5 - 60 }, [{ key: 'Us', v: UC, sym: ['U', 'C'] }, { key: 'K', v: UL, sym: ['U', 'L'] }], { max: (UC + UL) * 1.05 || 1, vals: F.vals, grid: false });
          desc = 'An LC circuit: a ' + un(Cv * 1e6, 'μF', 3) + ' capacitor and a ' + un(Lv, 'H', 3) + ' inductor.'; read = 'Energy moves back and forth between the capacitor\'s electric field (½CV²) and the inductor\'s magnetic field (½LI²); the total stays the same. Period T = 2π√(LC) = <b>' + un(tau, 's', 3) + '</b>.'; }
        else { desc = 'A' + (ci >= 0 ? 'n RC' : 'n RL') + ' circuit after the switch closes.'; read = ci >= 0 ? 'At t = 0 the empty capacitor acts like a plain wire: the current starts at its largest value, ε/R. As charge builds, V<sub>C</sub> rises toward ε and the current dies away: 63% of the way in one time constant τ = RC = <b>' + un(tau, 's', 3) + '</b>.' : 'The inductor fights the change: the current starts at zero and climbs toward ε/R with τ = L/R = <b>' + un(tau, 's', 3) + '</b>.'; st = [['t', un(tS, 's', 3)], [ci >= 0 ? 'V_C' : 'I', ci >= 0 ? un(hq0.vc[ci], 'V', 3) : un(hq0.I[li], 'A', 3)], ['current', un(M.abs(hq0.I[qi]), 'A', 3)], ['τ', un(tau, 's', 3)]]; }
      } else if (mode === 'ac') {
        var Rs = comps.reduce(function (s0, q) { return s0 + (q.type === 'R' || q.type === 'bulb' ? q.value : 0) + (q.r || 0); }, 0), Ls2 = comps.reduce(function (s0, q) { return s0 + (q.type === 'L' ? q.value : 0); }, 0), invC = comps.reduce(function (s0, q) { return s0 + (q.type === 'C' ? 1 / q.value : 0); }, 0), f = srcComp ? (srcComp.f || 50) : 50, w = TAU * f, XL = w * Ls2, XC = invC ? invC / w : 0, Z = M.hypot(Rs, XL - XC), V0 = Vs, I0 = V0 / Z, phi = M.atan2(XL - XC, Rs), f0 = invC && Ls2 ? M.sqrt(invC / Ls2) / TAU : null;
        var pr = { cx: W0 * 0.25, cy: H0 * 0.74, R: M.min(W0 * 0.2, H0 * 0.2) }, th = w * phase * 0.02, scv = pr.R / M.max(V0, I0 * Rs, I0 * XL, I0 * XC);
        if (sh.ph) { circ(ctx, pr.cx, pr.cy, pr.R, { color: k.grid, w: 1 }); var ph0 = th; [[I0 * Rs, 0, k.green, 'V_R'], [I0 * XL, PI / 2, k.purple, 'V_L'], [I0 * XC, -PI / 2, k.blue, 'V_C'], [V0, phi, k.ink, 'V']].forEach(function (q) { if (q[0] <= 0) return; var a = ph0 + q[1]; arrow(ctx, pr.cx, pr.cy, pr.cx + q[0] * scv * M.cos(a), pr.cy - q[0] * scv * M.sin(a), { color: q[2], w: q[3] === 'V' ? 3.2 : 2.4 }); symTxt(ctx, [q[3].split('_')[0], q[3].split('_')[1] || ''], pr.cx + (q[0] * scv + 12) * M.cos(a), pr.cy - (q[0] * scv + 12) * M.sin(a), { align: 'center', size: 12, color: q[2] }); }); txt(ctx, 'phasors (rotating)', pr.cx, H0 - 8, { align: 'center', size: 10.5, color: k.muted }); }
        var g2 = { x: W0 * 0.55, y: H0 * 0.5 + 14, w: W0 * 0.42, h: H0 * 0.5 - 40 }, fmax = f0 ? f0 * 2.5 : 200, G2 = GP(ctx, g2, { xmin: 0, xmax: fmax, ymin: 0, ymax: Rs > 0 ? V0 / Rs * 1.1 : 1, xlab: 'f (Hz)', ylab: 'peak current (A)', compact: true }).frame(); G2.plot(function (x) { var ww = TAU * x; return V0 / M.hypot(Rs, ww * Ls2 - (invC ? invC / ww : 0)); }, k.cur, 2.2); G2.dot(f, I0, k.red, 5); if (f0) G2.vline(f0, k.muted, [3, 3]);
        desc = 'A series circuit with R = ' + un(Rs, 'Ω', 3) + ', L = ' + un(Ls2, 'H', 3) + ' and C driven by ' + fm(V0, 2) + ' V (peak) at ' + un(f, 'Hz', 3) + '.';
        read = 'X<sub>L</sub> = ωL = <b>' + un(XL, 'Ω', 3) + '</b>, X<sub>C</sub> = 1/ωC = <b>' + un(XC, 'Ω', 3) + '</b>, Z = √(R² + (X<sub>L</sub> − X<sub>C</sub>)²) = <b>' + un(Z, 'Ω', 3) + '</b>, peak current <b>' + un(I0, 'A', 3) + '</b>, phase angle <b>' + fm(phi / DEG, 1) + '°</b>. Average power = I<sub>rms</sub>V<sub>rms</sub> cos φ = <b>' + un(0.5 * V0 * I0 * M.cos(phi), 'W', 3) + '</b>, not just I<sub>rms</sub>V<sub>rms</sub>.' + (f0 ? ' Resonance at f₀ = 1/(2π√(LC)) = <b>' + un(f0, 'Hz', 3) + '</b>.' : '');
        st = [['X_L', un(XL, 'Ω', 3)], ['X_C', un(XC, 'Ω', 3)], ['Z', un(Z, 'Ω', 3)], ['I peak', un(I0, 'A', 3)], ['phase', fm(phi / DEG, 1) + '°']];
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    function layoutTreeRoot() { return { kind: 'leaf', comp: { i: -1 } }; }
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-magnetism. Cross-section views use ⊙ (current out of the page, I > 0) and ⊗ (into the page, I < 0).
  /* PM.bWires(ws, x, y): magnetic field (T) of long straight wires perpendicular to the page; ws = [{x, y, I}] in m and A */
  PM.bWires = function (ws, x, y) { var Bx = 0, By = 0; ws.forEach(function (w) { var dx = x - w.x, dy = y - w.y, r2 = dx * dx + dy * dy; if (r2 < 1e-10) return; var f = MU0 * w.I / (TAU * r2); Bx += -dy * f; By += dx * f; }); return { Bx: Bx, By: By, B: M.hypot(Bx, By) }; };
  PM.radius = function (m, v, q, B) { return m * v / (M.abs(q) * B); };
  R('ph-magnetism', function (el, o) {
    var mode = pick(o.mode, ['magnets', 'electromagnet', 'wire', 'loop', 'solenoid', 'toroid', 'charge', 'selector', 'spectrometer', 'wire-force', 'two-wires', 'motor', 'biot', 'ampere', 'hall'], 'magnets');
    var F = frame(el, o, { magnets: 'A bar magnet with field lines and compasses', electromagnet: 'An electromagnet', wire: 'The magnetic field around a straight wire', loop: 'The field of a current loop (cross-section)', solenoid: 'The field of a solenoid (cross-section)', toroid: 'The field of a toroid', charge: 'A charge moving through a magnetic field', selector: 'A velocity selector', spectrometer: 'A mass spectrometer', 'wire-force': 'The force on a current-carrying wire', 'two-wires': 'Two parallel currents', motor: 'A current loop in a magnetic field (a motor)', biot: 'Biot–Savart: adding up current elements', ampere: 'An Amperian loop around currents', hall: 'The Hall effect' }[mode]);
    var sh = { lines: F.on('lines', true), compass: F.on('compass', mode === 'magnets' || mode === 'wire' || mode === 'electromagnet'), vec: F.on('vectors', true), rhr: F.on('rhr', false), path: F.on('path', true), enc: F.on('enclosed', true) };
    if (['charge', 'selector', 'spectrometer'].indexOf(mode) >= 0) return chargeMotion(F, o, mode, sh);
    if (['wire-force', 'two-wires', 'motor', 'hall'].indexOf(mode) >= 0) return forces(F, o, mode, sh);
    var I = num(o.I, mode === 'toroid' || mode === 'solenoid' ? 2 : 5), c = F.canvas({ aspect: 1.6, narrow: 1.0 }), mp = null, broken = false, polarity = 1, cur = I;
    var ws = arr(o.currents).map(function (w) { return { x: num(w.x, 0), y: num(w.y, 0), I: num(w.I, 5) }; });
    var loopP = { x: num((o.loopPath || {}).x, 0), y: num((o.loopPath || {}).y, 0), r: num((o.loopPath || {}).r, 0.06) }, gap = !!o.displacement;
    function wires() {
      if (mode === 'wire') return ws.length ? ws : [{ x: 0, y: 0, I: cur }];
      if (mode === 'loop') return [{ x: -0.05, y: 0, I: cur }, { x: 0.05, y: 0, I: -cur }];
      if (mode === 'solenoid') { var out = []; for (var i = 0; i < 9; i++) { var x = -0.12 + i * 0.03; out.push({ x: x, y: 0.04, I: cur }, { x: x, y: -0.04, I: -cur }); } return out; }
      if (mode === 'toroid') { var t = []; for (i = 0; i < 16; i++) { var a = i / 16 * TAU; t.push({ x: 0.06 * M.cos(a), y: 0.06 * M.sin(a), I: cur }, { x: 0.12 * M.cos(a), y: 0.12 * M.sin(a), I: -cur }); } return t; }
      if (mode === 'ampere') return ws.length ? ws : [{ x: -0.03, y: 0.01, I: 4 }, { x: 0.035, y: -0.02, I: -2 }, { x: 0.11, y: 0.05, I: 3 }];
      return [];
    }
    function magnetField(x, y) { // Gilbert model: poles ±1 at the magnet's ends (good for drawing field-line shapes)
      var poles = broken ? [[-0.1, 1], [-0.025, -1], [0.025, 1], [0.1, -1]] : [[-0.1 * polarity, 1], [0.1 * polarity, -1]], Bx = 0, By = 0;
      if (mode === 'magnets' && o.magnet === 'earth') poles = [[0, 0.03, -1], [0, -0.03, 1]].map(function (p) { return p; });
      poles.forEach(function (p) { var px = p.length === 3 ? p[0] : p[0], py = p.length === 3 ? p[1] : 0, s = p.length === 3 ? p[2] : p[1], dx = x - px, dy = y - py, r = M.hypot(dx, dy); if (r < 1e-6) return; Bx += s * dx / (r * r * r); By += s * dy / (r * r * r); });
      return { Bx: Bx, By: By, B: M.hypot(Bx, By) };
    }
    function field(x, y) { return mode === 'magnets' || mode === 'electromagnet' ? magnetField(x, y) : PM.bWires(wires(), x, y); }
    if (F.live) {
      var row = F.row();
      if (mode === 'magnets' && o.magnet !== 'earth') { var bb = F.button(row, '✂ Break the magnet in half', function () { broken = !broken; bb.textContent = broken ? 'Put the magnet back together' : '✂ Break the magnet in half'; }); }
      if (mode === 'electromagnet') { F.button(row, 'Reverse the current', function () { polarity = -polarity; }); }
      if (mode === 'wire' || mode === 'loop' || mode === 'solenoid' || mode === 'toroid' || mode === 'biot') F.slider(row, { label: 'Current I', min: -10, max: 10, step: 0.5, value: cur, unit: 'A', d: 1, input: function (v) { cur = v; } });
      if (mode === 'ampere') F.check(row, 'Show a charging capacitor (displacement current)', gap, function (on) { gap = on; });
    }
    var list = [];
    if (F.live && mode === 'ampere') { list.push({ name: 'Amperian loop (move)', pos: function () { return mp ? [mp.X(loopP.x), mp.Y(loopP.y)] : null; }, drag: function (px, py) { loopP.x = mp.x(px); loopP.y = mp.y(py); }, key: function (dx, dy, big) { loopP.x += dx * (big ? 0.03 : 0.01); loopP.y += dy * (big ? 0.03 : 0.01); } }, { name: 'Amperian loop (size)', pos: function () { return mp ? [mp.X(loopP.x + loopP.r), mp.Y(loopP.y)] : null; }, drag: function (px, py) { loopP.r = M.max(0.01, M.hypot(mp.x(px) - loopP.x, mp.y(py) - loopP.y)); }, key: function (dx, dy, big) { loopP.r = M.max(0.01, loopP.r + (dx || dy) * (big ? 0.03 : 0.01)); } }); }
    var probe = { x: num((o.P || {}).x, 0.05), y: num((o.P || {}).y, 0.04) };
    if (F.live && (mode === 'wire' || mode === 'biot')) list.push({ name: 'field point P', pos: function () { return mp ? [mp.X(probe.x), mp.Y(probe.y)] : null; }, drag: function (px, py) { probe.x = mp.x(px); probe.y = mp.y(py); }, key: function (dx, dy, big) { probe.x += dx * (big ? 0.03 : 0.01); probe.y += dy * (big ? 0.03 : 0.01); } });
    var hd = F.handles(list, { r: 20 });
    var A = { t: 0 }; // field pictures are static: they redraw only when something changes
    var SC = { key: '', map: {} }; // traced field lines, reused until something that changes the field changes
    function stream(ctx, k, x0, y0, v, dir, maxN) { var ck = x0.toFixed(6) + ',' + y0.toFixed(6) + ',' + dir + ',' + (maxN || 0); if (SC.map[ck]) return SC.map[ck]; var r0 = stream0(ctx, k, x0, y0, v, dir, maxN); r0.dec = r0.filter(function (q, i) { return i % 3 === 0 || i === r0.length - 1; }); return (SC.map[ck] = r0); }
    function stream0(ctx, k, x0, y0, v, dir, maxN) { var pts = [[mp.X(x0), mp.Y(y0)]], x = x0, y = y0, h = (v.xmax - v.xmin) / 260; for (var s = 0; s < (maxN || 1400); s++) { var b1 = field(x, y); if (!(b1.B > 0)) break; var mx = x + dir * h / 2 * b1.Bx / b1.B, my = y + dir * h / 2 * b1.By / b1.B, b2 = field(mx, my); if (!(b2.B > 0)) break; x += dir * h * b2.Bx / b2.B; y += dir * h * b2.By / b2.B; pts.push([mp.X(x), mp.Y(y)]); if (x < v.xmin || x > v.xmax || y < v.ymin || y > v.ymax) break; if (s > 30 && M.hypot(x - x0, y - y0) < h * 0.8) break; } return pts; }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, t = A.t; bg(c);
      var vw = 0.2; mp = fitMap({ x: 6, y: 6, w: W0 - 12, h: H0 - 12 }, -vw, vw, -vw * 0.62, vw * 0.62, true); var v = { xmin: mp.x(6), xmax: mp.x(W0 - 6), ymin: mp.y(H0 - 6), ymax: mp.y(6) };
      var desc = '', read = '', st = [], wl = wires(), skey = JSON.stringify([mode, polarity, broken, cur, wl, W0, H0, loopP, gap, o.magnet, k.isDark]); if (skey !== SC.key) { SC.key = skey; SC.map = {}; }
      if (sh.lines) {
        if (mode === 'magnets' || mode === 'electromagnet') {
          var poleXs = o.magnet === 'earth' ? [] : broken ? [-0.1, 0.025] : [-0.1 * polarity];
          if (o.magnet === 'earth') { var RE = 0.045; [1.25, 1.6, 2.2, 3.2, 5].forEach(function (Lr) { [1, -1].forEach(function (side) { var pts = []; for (var a = 0; a <= 120; a++) { var th0 = M.asin(M.min(1, M.sqrt(1 / Lr))), th = th0 + (PI - 2 * th0) * a / 120, r = Lr * RE * M.pow(M.sin(th), 2); pts.push([mp.X(side * r * M.sin(th)), mp.Y(r * M.cos(th))]); } poly(ctx, pts, { color: rgba(k.bfield, 0.75), w: 1.4 }); var mpt = pts[60], nx2 = pts[58]; arrow(ctx, nx2[0], nx2[1], mpt[0] + (mpt[0] - nx2[0]) * 2, mpt[1] + (mpt[1] - nx2[1]) * 2, { color: k.bfield, w: 1.4, head: 7 }); }); }); } // dipole field lines r = L sin²θ outside Earth
          poleXs.forEach(function (px) { for (var a2 = 0; a2 < 16; a2++) { var an2 = (a2 + 0.5) / 16 * TAU, pts = stream(ctx, k, px + 0.004 * M.cos(an2), 0.004 * M.sin(an2), v, 1); poly(ctx, pts.dec || pts, { color: rgba(k.bfield, 0.7), w: 1.4 }); if (pts.length > 40) { var p1 = pts[M.floor(pts.length / 2)], p2 = pts[M.floor(pts.length / 2) + 2]; arrow(ctx, p1[0], p1[1], p1[0] + (p2[0] - p1[0]) * 3, p1[1] + (p2[1] - p1[1]) * 3, { color: k.bfield, w: 1.4, head: 7 }); } } });
        } else { var seeds = []; if (mode === 'wire') { wl.forEach(function (w) { for (var q = 1; q <= 6; q++) seeds.push([w.x + q * 0.025, w.y]); }); } else if (mode === 'solenoid') { for (var q2 = -6; q2 <= 6; q2++) seeds.push([0, q2 * 0.006]); } else if (mode === 'loop') { [0.012, 0.024, 0.036, 0.046, 0.062, 0.08, 0.11].forEach(function (d0) { seeds.push([-0.05 + d0, 0]); }); } else if (mode === 'toroid') { for (var q3 = 0; q3 < 4; q3++) seeds.push([0.07 + q3 * 0.012, 0]); } else if (mode === 'ampere') { wl.forEach(function (w) { for (var q4 = 1; q4 <= 3; q4++) seeds.push([w.x + q4 * 0.02, w.y]); }); }
          seeds.forEach(function (sd) { var pts = stream(ctx, k, sd[0], sd[1], v, 1); poly(ctx, pts.dec || pts, { color: rgba(k.bfield, 0.65), w: 1.4 }); var pts2 = stream(ctx, k, sd[0], sd[1], v, -1); poly(ctx, pts2.dec || pts2, { color: rgba(k.bfield, 0.65), w: 1.4 }); if (pts.length > 12) { var p1 = pts[6], p2 = pts[8]; arrow(ctx, p1[0], p1[1], p1[0] + (p2[0] - p1[0]) * 3, p1[1] + (p2[1] - p1[1]) * 3, { color: k.bfield, w: 1.4, head: 7 }); } }); }
      }
      if (sh.compass) { var st2 = (v.xmax - v.xmin) / 9; for (var x = v.xmin + st2 / 2; x < v.xmax; x += st2) for (var y = v.ymin + st2 / 2; y < v.ymax; y += st2) { if (mode === 'magnets' && M.abs(y) < 0.03 && M.abs(x) < 0.13) continue; var b = field(x, y); if (!(b.B > 0)) continue; var ux = b.Bx / b.B, uy = b.By / b.B, cx0 = mp.X(x), cy0 = mp.Y(y); circ(ctx, cx0, cy0, 10, { fill: k.bg, color: k.grid, w: 1 }); poly(ctx, [[cx0 + ux * 8, cy0 - uy * 8], [cx0 - uy * 2.5, cy0 - ux * 2.5], [cx0 + uy * 2.5, cy0 + ux * 2.5]], { fill: k.red, close: true }); poly(ctx, [[cx0 - ux * 8, cy0 + uy * 8], [cx0 - uy * 2.5, cy0 - ux * 2.5], [cx0 + uy * 2.5, cy0 + ux * 2.5]], { fill: k.muted, close: true }); } }
      if (mode === 'magnets' || mode === 'electromagnet') {
        if (o.magnet === 'earth') { circ(ctx, mp.X(0), mp.Y(0), 0.045 * mp.sx, { fill: k.isDark ? '#1d4a6b' : '#cfe3f5', color: k.waterLine, w: 2 }); txt(ctx, 'geographic north', mp.X(0), mp.Y(0.045) - 12, { align: 'center', size: 11, color: k.ink, halo: true }); txt(ctx, '(a magnetic south pole lies under it)', mp.X(0), mp.Y(0.045) - 26, { align: 'center', size: 10.5, color: k.muted, halo: true }); desc = 'Earth\'s magnetic field, shaped like a bar magnet\'s.'; read = 'A compass\'s north end points to Earth\'s geographic north, so the magnet inside Earth has its <b>south</b> pole up there. Field lines leave near the south geographic pole and return near the north.'; }
        else {
          var mags = broken ? [[-0.1, -0.025], [0.025, 0.1]] : [[-0.1, 0.1]];
          if (mode === 'electromagnet') { block(ctx, mp.X(-0.11), mp.Y(0.012), (0.22) * mp.sx, 0.024 * mp.sx, { fill: k.metal, color: k.ink, r: 3 }); for (var w2 = 0; w2 < 12; w2++) { var xx = -0.095 + w2 * 0.017; line(ctx, mp.X(xx), mp.Y(0.02), mp.X(xx + 0.006), mp.Y(-0.02), k.cur, 2.5); } txt(ctx, polarity > 0 ? 'S' : 'N', mp.X(0.12), mp.Y(0), { size: 14, weight: 800, color: polarity > 0 ? k.blue : k.red }); txt(ctx, polarity > 0 ? 'N' : 'S', mp.X(-0.13), mp.Y(0), { size: 14, weight: 800, color: polarity > 0 ? k.red : k.blue, align: 'right' }); desc = 'An iron nail wrapped with a current-carrying coil: an electromagnet.'; read = 'Current in the coil magnetizes the iron; the ends become poles. Reverse the current and the poles swap. More turns or more current make a stronger magnet; switch it off and it stops being a magnet.'; }
          else { mags.forEach(function (m0, i) { var x0 = mp.X(m0[0]), x1 = mp.X(m0[1]), yy = mp.Y(0.02), hh = 0.04 * mp.sx; ctx.save(); rrect(ctx, x0, yy, (x1 - x0) / 2, hh, 3); ctx.fillStyle = '#d6336c'; ctx.fill(); rrect(ctx, (x0 + x1) / 2, yy, (x1 - x0) / 2, hh, 3); ctx.fillStyle = '#1c6fd6'; ctx.fill(); ctx.restore(); txt(ctx, 'N', x0 + 8, yy + hh / 2, { size: 13, weight: 800, color: '#fff' }); txt(ctx, 'S', x1 - 8, yy + hh / 2, { size: 13, weight: 800, color: '#fff', align: 'right' }); F.tagAt(ctx, i ? 'N2' : 'N', x0 + 4, yy - 12); F.tagAt(ctx, i ? 'S2' : 'S', x1 - 4, yy - 12); }); desc = broken ? 'A bar magnet broken in two: each piece has its own north and south pole.' : 'A bar magnet with field lines from N around to S and compass needles.'; read = broken ? 'Breaking a magnet never gives a lone north or south pole: each piece is a whole magnet with both poles.' : 'Field lines leave the north pole, curve around and enter the south pole, then continue <b>inside</b> the magnet back to north: they are closed loops with no beginning or end. Compass needles line up along the lines.'; }
        }
      } else {
        wl.forEach(function (w, i) { var px = mp.X(w.x), py = mp.Y(w.y); if (w.I >= 0) dotOut(ctx, px, py, 8, k.cur); else dotIn(ctx, px, py, 8, k.cur); F.tagAt(ctx, 'w' + i, px + 14, py - 14); if (mode === 'ampere' || mode === 'wire') txt(ctx, fm(M.abs(w.I), 1) + ' A', px, py + 18, { align: 'center', size: 10.5, color: k.cur, halo: true, weight: 700 }); });
        if (mode === 'biot') { var yw = -0.06, dP = probe.y - yw, nEl = 15, Lw2 = 0.36, bsum = 0; line(ctx, mp.X(-0.19), mp.Y(yw), mp.X(0.19), mp.Y(yw), k.cur, 4); arrow(ctx, mp.X(0.12), mp.Y(yw) + 14, mp.X(0.17), mp.Y(yw) + 14, { color: k.cur, w: 2.4, label: 'I' });
          for (var e1 = 0; e1 < nEl; e1++) { var xe = -Lw2 / 2 + (e1 + 0.5) * Lw2 / nEl, rx = probe.x - xe, rr = M.hypot(rx, dP), sinT = dP / rr, dB = MU0 / (4 * PI) * M.abs(cur) * (Lw2 / nEl) * sinT / (rr * rr); bsum += dB; line(ctx, mp.X(xe), mp.Y(yw), mp.X(probe.x), mp.Y(probe.y), rgba(k.muted, 0.25), 1, [2, 3]); circ(ctx, mp.X(xe), mp.Y(yw), 3, { fill: k.cur }); var hb = clamp(dB / (MU0 * M.abs(cur) / (TAU * dP)) * 160, 1, 60); block(ctx, mp.X(xe) - 4, mp.Y(yw) + 18, 8, hb, { fill: rgba(k.bfield, 0.55), color: k.bfield, w: 1, r: 1 }); }
          circ(ctx, mp.X(probe.x), mp.Y(probe.y), 6, { fill: k.gold }); dotOut(ctx, mp.X(probe.x) + 20, mp.Y(probe.y), 9, k.bfield); txt(ctx, 'P: every dB points out of the page', mp.X(probe.x) + 34, mp.Y(probe.y), { size: 11.5, weight: 700, color: k.bfield, halo: true }); txt(ctx, 'bars: the size of each piece\'s dB', mp.X(-0.19), mp.Y(yw) + 90, { size: 10.5, color: k.muted });
          desc = 'A straight wire in the page cut into ' + nEl + ' short pieces, and a point P ' + un(dP * 100, 'cm', 3) + ' above it.'; read = 'Biot–Savart: each piece adds dB = (μ₀/4π) I dl sin θ / r², all pointing out of the page at P. The nearest pieces add the most. These ' + nEl + ' pieces (' + un(Lw2 * 100, 'cm') + ' of wire) give <b>' + un(bsum * 1e6, 'μT', 3) + '</b>; an endless wire would give μ₀I/(2πd) = <b>' + un(MU0 * M.abs(cur) / (TAU * dP) * 1e6, 'μT', 3) + '</b>.'; st = [['sum of pieces', un(bsum * 1e6, 'μT', 3)], ['infinite wire', un(MU0 * M.abs(cur) / (TAU * dP) * 1e6, 'μT', 3)]]; }
        if (mode === 'wire') { var b0 = field(probe.x, probe.y), Lb = clamp(M.log10(b0.B * 1e6 + 1) * 30, 8, 80); circ(ctx, mp.X(probe.x), mp.Y(probe.y), 5, { fill: k.gold }); if (b0.B > 0) arrow(ctx, mp.X(probe.x), mp.Y(probe.y), mp.X(probe.x) + Lb * b0.Bx / b0.B, mp.Y(probe.y) - Lb * b0.By / b0.B, { color: k.bfield, w: 3, label: 'B' + (F.vals ? ' = ' + un(b0.B * 1e6, 'μT', 3) : '') }); txt(ctx, 'P', mp.X(probe.x) - 8, mp.Y(probe.y) + 12, { size: 12, weight: 800, halo: true }); F.tagAt(ctx, 'P0', mp.X(probe.x) + 14, mp.Y(probe.y) + 14);
          var r0 = M.hypot(probe.x - wl[0].x, probe.y - wl[0].y); desc = 'A long straight wire carrying ' + un(M.abs(wl[0].I), 'A') + (wl[0].I >= 0 ? ' out of the page' : ' into the page') + '; P is ' + un(r0 * 100, 'cm', 3) + ' away.'; read = 'Field lines are circles around the wire (none start or end). Right-hand rule: thumb along the current, fingers curl the way B goes' + (wl[0].I >= 0 ? ' (counterclockwise here)' : ' (clockwise here)') + '. B = μ₀I/(2πr) = <b>' + un(b0.B * 1e6, 'μT', 3) + '</b> at P: half as strong at twice the distance.'; st = [['r', un(r0, 'm', 3)], ['B at P', un(b0.B * 1e6, 'μT', 3)]];
        }
        if (mode === 'loop') { var bc = MU0 * M.abs(cur) / (2 * 0.05); desc = 'A circular loop seen edge-on: current comes out of the page on the left and goes in on the right.'; read = 'Inside the loop the fields of all the pieces point the same way, so the field is strong; at the center B = μ₀I/(2R) = <b>' + un(bc * 1e6, 'μT', 3) + '</b> (R = 5 cm). The loop acts like a small bar magnet.'; st = [['B at center', un(bc * 1e6, 'μT', 3)]]; }
        if (mode === 'solenoid') { var nPer = 1 / 0.03, bs = MU0 * nPer * M.abs(cur); desc = 'A solenoid in cross-section: rows of wires carrying current out of the page on top and into it on the bottom.'; read = 'Inside, the field is strong and nearly uniform: B = μ₀nI = <b>' + un(bs * 1e6, 'μT', 3) + '</b> (n = ' + fm(nPer, 0) + ' turns per meter). Outside it is weak, like a bar magnet\'s.'; st = [['B inside', un(bs * 1e6, 'μT', 3)]]; }
        if (mode === 'toroid') { desc = 'A toroid (a solenoid bent into a ring) seen from above, with 16 turns.'; read = 'The field stays inside the ring: B = μ₀NI/(2πr), and it is zero outside and in the hole (the Amperian loop there encloses no net current).'; }
        if (mode === 'ampere') { var Ienc = wl.filter(function (w) { return M.hypot(w.x - loopP.x, w.y - loopP.y) < loopP.r; }).reduce(function (s0, w) { return s0 + w.I; }, 0); circ(ctx, mp.X(loopP.x), mp.Y(loopP.y), loopP.r * mp.sx, { color: k.gold, w: 2.6, dash: [8, 5] }); if (F.live) knob(ctx, mp.X(loopP.x + loopP.r), mp.Y(loopP.y), k.gold, 6);
          if (gap) { block(ctx, mp.X(-0.17), mp.Y(-0.06) - 30, 8, 60, { fill: k.metal, color: k.ink }); block(ctx, mp.X(-0.17) + 22, mp.Y(-0.06) - 30, 8, 60, { fill: k.metal, color: k.ink }); line(ctx, mp.X(-0.2), mp.Y(-0.06), mp.X(-0.17), mp.Y(-0.06), k.cur, 2.5); txt(ctx, 'capacitor gap: no charge crosses, but E changes', mp.X(-0.17) + 15, mp.Y(-0.06) + 42, { align: 'center', size: 10.5, color: k.muted, halo: true }); }
          desc = 'An Amperian loop of radius ' + un(loopP.r * 100, 'cm', 3) + ' around some currents.'; read = 'Ampère\'s law: ∮B·dl = μ₀I<sub>enc</sub>. Enclosed current (out of the page +): <b>' + un(Ienc, 'A', 3) + '</b>, so ∮B·dl = <b>' + un(MU0 * Ienc * 1e6, 'μT·m', 3) + '</b>. Currents outside the loop change B along it but add nothing to the total.' + (gap ? ' In a charging capacitor\'s gap, the changing electric field acts as a "displacement current" ε₀dΦ<sub>E</sub>/dt, so the law still holds.' : ''); st = [['I enclosed', un(Ienc, 'A', 3)], ['∮B·dl', un(MU0 * Ienc * 1e6, 'μT·m', 3)]]; F.tagAt(ctx, 'path', mp.X(loopP.x), mp.Y(loopP.y + loopP.r) - 16); }
      }
      hd.draw(ctx);
      F.desc(desc); F.read(read); F.stats(st); void t;
    };
    F.now(); return {};
  });
  function chargeMotion(F, o, mode, sh) {
    var P = { q: num(o.q, 1), m: num(o.m, 1), v: num(o.v, 2), B: num(o.B, 1), angle: num(o.angle, 90), E: num(o.E, 2) }, c = F.canvas({ aspect: 1.6, narrow: 1.0 }), view3d = !!o.view3d || (mode === 'charge' && P.angle !== 90);
    var A = F.anim({ tmax: mode === 'charge' ? TAU * P.m / (M.abs(P.q) * P.B) * (view3d ? 3 : 1.2) : 6, rate: 1, loop: true, autoplay: true, dt: 0.05 });
    if (F.live && mode === 'charge') { F.seg(null, { label: 'Charge', items: [['1', 'Positive'], ['-1', 'Negative']], value: String(M.sign(P.q)), change: function (v) { P.q = +v * M.abs(P.q); } }); F.slider(null, { label: 'Speed v', min: 0.5, max: 4, step: 0.1, value: P.v, d: 1, input: function (v) { P.v = v; } }); F.slider(null, { label: 'Angle between v and B', min: 0, max: 90, step: 5, value: P.angle, unit: '°', d: 0, input: function (v) { P.angle = v; view3d = v !== 90 || !!o.view3d; } }); }
    if (F.live && mode === 'selector') F.slider(null, { label: 'Electric field E (B fixed)', min: 0.5, max: 4, step: 0.1, value: P.E, d: 1, input: function (v) { P.E = v; } });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, t = A.t; bg(c);
      var desc = '', read = '';
      for (var gx = 30; gx < W0; gx += 44) for (var gy = 26; gy < H0; gy += 44) dotIn(ctx, gx, gy, 5, rgba(k.bfield, 0.55));
      txt(ctx, 'B into the page', W0 - 8, 12, { align: 'right', size: 11, color: k.bfield, weight: 700, halo: true });
      if (mode === 'charge') {
        var w = P.q * P.B / P.m, r = P.m * P.v * M.sin(P.angle * DEG) / (M.abs(P.q) * P.B), vpar = P.v * M.cos(P.angle * DEG), s = M.min(W0, H0) * 0.3 / M.max(0.3, r), cx0 = W0 * 0.45, cy0 = H0 * 0.5;
        // B points into the page; v starts along +x. F = qv × B turns a positive charge counterclockwise (center at +r on y).
        var sg = P.q > 0 ? 1 : -1, wa = M.abs(w), pts = [], Npt = 240;
        function at(tt) { return { x: r * M.sin(wa * tt), y: sg * r * (1 - M.cos(wa * tt)), z: vpar * tt }; }
        function toPx(p) { return [cx0 + s * (p.x + (view3d ? p.z * 0.6 : 0)), cy0 - s * (p.y - (view3d ? p.z * 0.3 : 0))]; }
        for (var i = 0; i <= Npt; i++) pts.push(toPx(at(t * i / Npt)));
        if (sh.path) poly(ctx, pts, { color: k.acc, w: 2.2 }); F.tagAt(ctx, 'path', pts[M.floor(Npt / 2)][0] + 14, pts[M.floor(Npt / 2)][1]);
        var vperp = P.v * M.sin(P.angle * DEG), vx = vperp * M.cos(wa * t), vy = sg * vperp * M.sin(wa * t), bp = pts[pts.length - 1], bx = bp[0], by = bp[1];
        circ(ctx, bx, by, 8, { fill: P.q > 0 ? k.red : k.blue }); txt(ctx, P.q > 0 ? '+' : '−', bx, by + 0.5, { align: 'center', size: 13, weight: 800, color: '#fff' });
        if (sh.vec) { arrow(ctx, bx, by, bx + vx * 22, by - vy * 22, { color: k.vel, w: 2.6, label: 'v' }); F.tagAt(ctx, 'v', bx + vx * 22 + 14, by - vy * 22 - 12); if (!view3d) { var cyc = cy0 - s * sg * r, dl = M.hypot(cx0 - bx, cyc - by) || 1; arrow(ctx, bx, by, bx + (cx0 - bx) / dl * 34, by + (cyc - by) / dl * 34, { color: k.force, w: 2.6, label: 'F' }); F.tagAt(ctx, 'F', bx + (cx0 - bx) / dl * 34 + 12, by + (cyc - by) / dl * 34 + 12); } }
        desc = 'A ' + (P.q > 0 ? 'positive' : 'negative') + ' charge moving at ' + fm(P.v, 1) + ' units in a magnetic field into the page' + (view3d ? ', at ' + fm(P.angle, 0) + '° to the field: a helix.' : ': a circle.');
        read = 'F = qv × B is always at right angles to v, so it bends the path but <b>never changes the speed</b> (no work is done). Radius r = mv/(|q|B); ' + (P.q > 0 ? 'positive charges circle counterclockwise here' : 'negative charges circle the other way') + '.' + (view3d ? ' The part of v along B is untouched, so the charge drifts along the field: a helix.' : '');
      } else if (mode === 'selector') {
        var vSel = P.E / P.B, x0 = 30, x1 = W0 - 30, yc = H0 / 2, plateT = H0 * 0.2, plateB = H0 * 0.8; block(ctx, x0, plateT - 10, x1 - x0, 10, { fill: rgba(k.red, 0.25), color: k.red, r: 2 }); block(ctx, x0, plateB, x1 - x0, 10, { fill: rgba(k.blue, 0.25), color: k.blue, r: 2 });
        [[0.6, k.green], [1, k.gold], [1.6, k.purple]].forEach(function (q) { var v0 = vSel * q[0], ay = (v0 * P.B - P.E) * 0.6, pts2 = []; for (var j = 0; j <= 60; j++) { var tx = j / 60 * 1.2, y = 0.5 * ay * tx * tx; var py = yc - y * 100; if (py < plateT || py > plateB) break; pts2.push([x0 + j / 60 * (x1 - x0), py]); } poly(ctx, pts2, { color: q[1], w: 2.2 }); var e0 = pts2[pts2.length - 1]; txt(ctx, q[0] === 1 ? 'v = E/B: straight through' : q[0] < 1 ? 'slower: the electric force wins' : 'faster: the magnetic force wins', M.min(e0[0], x1 - 4), e0[1] + (q[0] === 1 ? -12 : q[0] < 1 ? 14 : -14), { align: 'right', size: 11, color: q[1], weight: 700, halo: true }); });
        desc = 'A velocity selector: an electric field pushes positive charges down, the magnetic field pushes them up.'; read = 'qE = qvB only for v = E/B (= <b>' + fm(vSel, 2) + '</b> here), so only charges at that speed go straight; faster ones curve one way and slower ones the other, whatever their charge or mass.';
      } else {
        var ions = arr(o.masses || [12, 13, 14]), ox = W0 * 0.2, oy = H0 * 0.12; line(ctx, 0, oy, ox, oy, k.muted, 2, [5, 4]); txt(ctx, 'ions at one speed (from a selector)', 8, oy - 10, { size: 11, color: k.muted }); line(ctx, ox - 10, oy, ox + W0 * 0.75, oy, k.ink, 2);
        ions.forEach(function (mi, i) { var r = mi / ions[ions.length - 1] * M.min(W0 * 0.36, H0 * 0.42), col = [k.red, k.green, k.purple, k.orange][i % 4]; arc(ctx, ox + r, oy, r, PI, 0, col, 2.2); circ(ctx, ox + 2 * r, oy, 5, { fill: col }); txt(ctx, fm(num(mi, 12), 0) + ' u', ox + 2 * r, oy - 12, { align: 'center', size: 11, weight: 700, color: col, halo: true }); F.tagAt(ctx, 'P' + i, ox + 2 * r, oy + 18); });
        desc = 'A mass spectrometer: ions of masses ' + ions.join(', ') + ' u with the same charge and speed curve in a magnetic field.'; read = 'r = mv/(qB): with the same charge and speed, the radius is proportional to the mass, so heavier ions land farther away. Measuring where they land weighs them.';
      }
      F.desc(desc); F.read(read);
    };
    F.now(); return {};
  }
  /* PM.loopTorque(N, I, A, B, theta): torque on a coil; theta = angle between the coil's normal and B */
  PM.loopTorque = function (N, I, Ar, B, th) { return N * I * Ar * B * M.sin(th * DEG); };
  PM.wireForce = function (I1, I2, d) { return MU0 * I1 * I2 / (TAU * d); };
  function forces(F, o, mode, sh) {
    var P = { I: num(o.I, 5), I2: num(o.I2, 5), B: num(o.B, 0.2), L: num(o.L, 0.5), angle: num(o.angle, 90), d: num(o.d, 0.05), N: num(o.N, 1), A: num(o.A, 0.01), carriers: o.carriers === 'positive' ? 'positive' : 'electrons' };
    var c = F.canvas({ aspect: mode === 'motor' ? 1.6 : 1.8, narrow: 1.1 }), A = F.anim({ tmax: undefined, scrub: false, autoplay: true, tick: function () { return true; }, dt: 0.05 });
    if (F.live) { if (mode === 'wire-force') F.slider(null, { label: 'Angle between wire and B', min: 0, max: 180, step: 5, value: P.angle, unit: '°', d: 0, input: function (v) { P.angle = v; } }); if (mode === 'two-wires') F.seg(null, { label: 'Second current', items: [['same', 'Same direction'], ['opp', 'Opposite']], value: P.I2 >= 0 ? 'same' : 'opp', change: function (v) { P.I2 = (v === 'same' ? 1 : -1) * M.abs(P.I2); } }); if (mode === 'hall') F.seg(null, { label: 'Charge carriers', items: [['electrons', 'Electrons (−)'], ['positive', 'Positive carriers']], value: P.carriers, change: function (v) { P.carriers = v; } }); }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, t = A.t; bg(c);
      var desc = '', read = '', st = [];
      if (mode === 'wire-force') {
        for (var gx = 24; gx < W0; gx += 40) for (var gy = 30; gy < H0 - 10; gy += 40) arrow(ctx, gx - 10, gy, gx + 10, gy, { color: rgba(k.bfield, 0.45), w: 1.4, head: 6 }); txt(ctx, 'B →', W0 - 10, 14, { align: 'right', size: 12, weight: 700, color: k.bfield });
        var a = P.angle * DEG, cx0 = W0 / 2, cy0 = H0 / 2, L = M.min(W0, H0) * 0.36; line(ctx, cx0 - L * M.cos(a), cy0 + L * M.sin(a), cx0 + L * M.cos(a), cy0 - L * M.sin(a), k.cur, 5); arrow(ctx, cx0, cy0, cx0 + 40 * M.cos(a), cy0 - 40 * M.sin(a), { color: k.cur, w: 3, label: 'I' });
        var Fm = P.I * P.L * P.B * M.sin(a); if (M.abs(Fm) > 1e-9) { dotOut(ctx, cx0 + 60, cy0 + 50, 14, k.force); txt(ctx, 'F out of the page' + (F.vals ? ': ' + un(M.abs(Fm), 'N', 3) : ''), cx0 + 82, cy0 + 50, { size: 12, weight: 700, color: k.force, halo: true }); } else txt(ctx, 'F = 0 (wire along B)', cx0 + 20, cy0 + 50, { size: 12, weight: 700, color: k.force, halo: true });
        desc = 'A wire carrying ' + un(P.I, 'A') + ' at ' + fm(P.angle, 0) + '° to a ' + un(P.B, 'T') + ' field.'; read = 'F = ILB sin θ = <b>' + un(M.abs(Fm), 'N', 3) + '</b> for ' + un(P.L, 'm') + ' of wire. The force is perpendicular to both the wire and the field (here out of the page), never along the field lines.'; st = [['force', un(M.abs(Fm), 'N', 3)]];
      } else if (mode === 'two-wires') {
        var f = PM.wireForce(P.I, P.I2, P.d), x1 = W0 * 0.35, x2 = W0 * 0.65; [[x1, P.I], [x2, P.I2]].forEach(function (q, i) { line(ctx, q[0], 20, q[0], H0 - 20, k.cur, 5); arrow(ctx, q[0] + 12, H0 / 2 + (q[1] > 0 ? 30 : -30), q[0] + 12, H0 / 2 + (q[1] > 0 ? -30 : 30), { color: k.cur, w: 2.6, label: 'I' + sub(i + 1) }); F.tagAt(ctx, 'w' + i, q[0] - 18, 30); });
        var att = P.I * P.I2 > 0; arrow(ctx, x1, H0 * 0.75, x1 + (att ? 40 : -40), H0 * 0.75, { color: k.force, w: 3, label: 'F' }); arrow(ctx, x2, H0 * 0.75, x2 + (att ? -40 : 40), H0 * 0.75, { color: k.force, w: 3, label: 'F' });
        desc = 'Two long parallel wires ' + un(P.d * 100, 'cm') + ' apart carrying currents in ' + (att ? 'the same direction' : 'opposite directions') + '.'; read = (att ? 'Parallel currents <b>attract</b>' : 'Opposite currents <b>repel</b>') + ' (the reverse of charges). Each wire sits in the other\'s field: F/L = μ₀I₁I₂/(2πd) = <b>' + un(M.abs(f), 'N/m', 3) + '</b>, equal and opposite on the two wires.'; st = [['force per meter', un(M.abs(f), 'N/m', 3)]];
      } else if (mode === 'motor') {
        var th = (t * 1.2) % TAU, tau = PM.loopTorque(P.N, P.I, P.A, P.B, th / DEG), cx2 = W0 * 0.38, cy2 = H0 / 2, R0 = M.min(W0, H0) * 0.3;
        for (var q = -3; q <= 3; q++) arrow(ctx, 20, cy2 + q * 36, W0 * 0.75, cy2 + q * 36, { color: rgba(k.bfield, 0.3), w: 1.4, head: 7 }); txt(ctx, 'B', W0 * 0.75 + 6, cy2 - 3 * 36, { size: 12, weight: 700, color: k.bfield });
        var hx = R0 * M.cos(th), hz = R0 * M.sin(th) * 0.35; line(ctx, cx2 - hx, cy2 - R0 * 0.8 + hz, cx2 - hx, cy2 + R0 * 0.8 + hz, k.cur, 4); line(ctx, cx2 + hx, cy2 - R0 * 0.8 - hz, cx2 + hx, cy2 + R0 * 0.8 - hz, k.cur, 4); line(ctx, cx2 - hx, cy2 - R0 * 0.8 + hz, cx2 + hx, cy2 - R0 * 0.8 - hz, k.cur, 4); line(ctx, cx2 - hx, cy2 + R0 * 0.8 + hz, cx2 + hx, cy2 + R0 * 0.8 - hz, k.cur, 4);
        arrow(ctx, cx2, cy2, cx2 + 50 * M.sin(th), cy2 + 50 * M.cos(th) * 0.35, { color: k.purple, w: 2.4, label: 'normal' });
        var gr = { x: W0 * 0.68, y: 20, w: W0 * 0.3, h: H0 - 50 }, G = GP(ctx, gr, { xmin: 0, xmax: 360, ymin: -1.2, ymax: 1.2, xlab: 'θ (°)', ylab: 'torque', compact: true, yticks: false, xstep: 90 }).frame(); G.plot(function (x) { return M.sin(x * DEG); }, k.force, 2.2); G.dot(th / DEG, M.sin(th), k.red, 5);
        desc = 'A rectangular coil in a uniform magnetic field, turning.'; read = 'τ = NIAB sin θ, with θ between the coil\'s normal and B. The torque is <b>largest when the plane of the coil lies along the field</b> (θ = 90°) and zero when the field passes straight through it. A motor\'s commutator reverses the current every half turn so it keeps turning one way.'; st = [['torque now', un(tau, 'N·m', 3)], ['maximum', un(P.N * P.I * P.A * P.B, 'N·m', 3)]];
      } else { // hall
        var x0 = W0 * 0.15, x1 = W0 * 0.85, y0 = H0 * 0.3, y1 = H0 * 0.7, neg = P.carriers === 'electrons'; block(ctx, x0, y0, x1 - x0, y1 - y0, { fill: k.obj, color: k.objLine, r: 4 }); for (var gx2 = x0 + 20; gx2 < x1; gx2 += 46) for (var gy2 = y0 + 20; gy2 < y1; gy2 += 40) dotIn(ctx, gx2, gy2, 5, rgba(k.bfield, 0.5));
        arrow(ctx, x0 - 30, (y0 + y1) / 2, x0 - 4, (y0 + y1) / 2, { color: k.cur, w: 3, label: '' }); txt(ctx, 'I →', x0, y0 - 12, { size: 12, weight: 700, color: k.cur }); txt(ctx, 'B into the page', x1, y0 - 12, { size: 11, align: 'right', color: k.bfield, weight: 700 });
        for (var i = 0; i < 10; i++) { var u = ((t * 0.15 + i / 10) % 1), px = x0 + u * (x1 - x0), drift = M.min(1, 0.45 + t * 0.3); var py = (y0 + y1) / 2 + (neg ? 1 : 1) * -1 * drift * (y1 - y0) * 0.3 * (neg ? 1 : 1) * (neg ? 1 : 1); py = (y0 + y1) / 2 - drift * (y1 - y0) * 0.32; circ(ctx, neg ? x1 - (px - x0) : px, py + (i % 3 - 1) * 8, 4, { fill: neg ? k.blue : k.red }); }
        txt(ctx, neg ? '− − − − −' : '+ + + + +', (x0 + x1) / 2, y0 + 10, { align: 'center', size: 14, weight: 800, color: neg ? k.blue : k.red }); txt(ctx, neg ? '+ + + + +' : '− − − − −', (x0 + x1) / 2, y1 - 10, { align: 'center', size: 14, weight: 800, color: neg ? k.red : k.blue });
        txt(ctx, 'Hall voltage: top is ' + (neg ? 'negative' : 'positive'), (x0 + x1) / 2, y1 + 22, { align: 'center', size: 12, weight: 700, color: k.ink });
        desc = 'A conducting strip carrying current to the right in a field into the page, with ' + (neg ? 'electrons' : 'positive carriers') + ' as the charge carriers.'; read = 'Whatever their sign, the carriers are pushed toward the <b>top</b> edge (for electrons moving left, qv × B also points up). So the sign of the Hall voltage tells you the carriers\' sign: with electrons the top edge is negative.';
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  }

  // ===================================================================================================
  // ph-induction
  PM.railsV = function (v0, B, L, m, R, t) { return v0 * M.exp(-B * B * L * L * t / (m * R)); };
  PM.terminalV = function (m, g, R, B, L) { return m * g * R / (B * B * L * L); };
  R('ph-induction', function (el, o) {
    var mode = pick(o.mode, ['magnet-coil', 'changing-B', 'rotate', 'rails', 'generator', 'brake', 'inductor', 'transformer', 'flux'], 'magnet-coil');
    var F = frame(el, o, { 'magnet-coil': 'A magnet moving in and out of a coil', 'changing-B': 'A loop in a changing magnetic field', rotate: 'A loop turning in a magnetic field', rails: 'A rod sliding on rails in a magnetic field', generator: 'A generator', brake: 'Magnetic braking: a rod falling through a field', inductor: 'An inductor: current rising against a back emf', transformer: 'A transformer', flux: 'Magnetic flux through a tilted loop' }[mode]);
    var rb = mode === 'rails' || mode === 'brake', P = { B: num(o.B, rb ? 1 : 0.5), A: num(o.A, 0.01), N: num(o.N, 50), v: num(o.v, 2), L: num(o.L, 0.5), R: num(o.R, mode === 'brake' ? 0.5 : rb ? 1 : 2), w: num(o.omega, TAU), Np: num(o.Np, 100), Ns: num(o.Ns, 20), Vp: num(o.Vp, 120), m: num(o.m, 0.2), th: num(o.angle, 30), Lind: num(o.Lh, 2), eps: num(o.eps, 12) };
    var Bt = o.Bt ? cx(o.Bt, ['t']) : function (t) { return t < 1 ? 0.1 : t < 3 ? 0.1 + 0.2 * (t - 1) : 0.5; };
    var sh = { flux: F.on('flux', true), graphs: F.on('graphs', mode !== 'flux' && mode !== 'transformer'), cur: F.on('current', true), ind: F.on('induced-field', mode === 'magnet-coil'), meter: F.on('meter', mode === 'magnet-coil' || mode === 'changing-B') };
    var tmax = mode === 'magnet-coil' ? 8 : mode === 'changing-B' ? 5 : mode === 'rails' ? 4 : mode === 'brake' ? 3 : mode === 'inductor' ? 5 * P.Lind / P.R : 2 * TAU / P.w * 2;
    var c = F.canvas({ height: (F.compact ? 160 : 220) + (sh.graphs ? (F.compact ? 140 : 200) : 0) }), A = F.anim({ tmax: tmax, loop: mode !== 'rails' && mode !== 'brake' && mode !== 'inductor', rate: 1, autoplay: true, dt: tmax / 60, tStatic: num(o.t, tmax / 3) });
    if (F.live && mode === 'flux') F.slider(null, { label: 'Angle between the loop\'s normal and B', min: 0, max: 90, step: 1, value: P.th, unit: '°', d: 0, input: function (v) { P.th = v; } });
    if (F.live && mode === 'transformer') { F.slider(null, { label: 'Primary turns', min: 10, max: 200, step: 10, value: P.Np, d: 0, input: function (v) { P.Np = v; } }); F.slider(null, { label: 'Secondary turns', min: 10, max: 400, step: 10, value: P.Ns, d: 0, input: function (v) { P.Ns = v; } }); }
    // magnet position for the magnet-coil scene: in (0–2 s), rest (2–4), out (4–6), rest
    function magX(t) { return t < 2 ? 1 - 0.5 * (1 - M.cos(PI * t / 2)) : t < 4 ? 0 : t < 6 ? 0.5 * (1 - M.cos(PI * (t - 4) / 2)) : 1; }
    function phi(t) { if (mode === 'magnet-coil') { var x = magX(t); return P.N * 0.002 / (1 + 25 * x * x); } if (mode === 'changing-B') return P.N * P.A * Bt(t); if (mode === 'rotate' || mode === 'generator') return P.N * P.B * P.A * M.cos(P.w * t); if (mode === 'rails') { var xpos = (P.m * P.R / (P.B * P.B * P.L * P.L)) * P.v * (1 - M.exp(-P.B * P.B * P.L * P.L * t / (P.m * P.R))); return P.B * P.L * (0.2 + xpos); } if (mode === 'brake') return 0; return 0; }
    function emf(t) { var h = 1e-4; return -(phi(t + h) - phi(t - h)) / (2 * h); }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, t = A.t, sceneH = sh.graphs ? H0 - (F.compact ? 140 : 200) : H0; bg(c);
      var desc = '', read = '', st = [], e = emf(t), Iind = e / P.R;
      if (mode === 'magnet-coil' || mode === 'changing-B') {
        var cx0 = W0 * 0.42, cy0 = sceneH * 0.5, cw = 80, ch = sceneH * 0.55;
        for (var i = 0; i < 8; i++) { var xx = cx0 - cw / 2 + i * cw / 7; ctx.save(); ctx.strokeStyle = k.cur; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(xx, cy0, 10, ch / 2, 0, -PI / 2, PI / 2); ctx.stroke(); ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.ellipse(xx, cy0, 10, ch / 2, 0, PI / 2, PI * 1.5); ctx.stroke(); ctx.restore(); }
        F.tagAt(ctx, 'loop', cx0, cy0 - ch / 2 - 16);
        if (mode === 'magnet-coil') { var mx = cx0 + cw / 2 + 10 + magX(t) * (W0 * 0.3), mw = 90; ctx.save(); rrect(ctx, mx - mw * 0.0, cy0 - 16, mw / 2, 32, 3); ctx.fillStyle = '#d6336c'; ctx.fill(); rrect(ctx, mx + mw / 2, cy0 - 16, mw / 2, 32, 3); ctx.fillStyle = '#1c6fd6'; ctx.fill(); ctx.restore(); txt(ctx, 'N', mx + 8, cy0, { size: 13, weight: 800, color: '#fff' }); txt(ctx, 'S', mx + mw - 8, cy0, { size: 13, weight: 800, color: '#fff', align: 'right' }); F.tagAt(ctx, 'magnet', mx + mw / 2, cy0 - 30);
          var vmag = (magX(t + 0.01) - magX(t - 0.01)); if (M.abs(vmag) > 1e-4) arrow(ctx, mx + mw / 2, cy0 + 26, mx + mw / 2 + (vmag < 0 ? -30 : 30), cy0 + 26, { color: k.vel, w: 2.4, label: vmag < 0 ? 'pushed in' : 'pulled out' });
          if (sh.ind && M.abs(e) > 1e-4) { arrow(ctx, cx0 + (vmag < 0 ? -30 : 30), cy0, cx0 + (vmag < 0 ? 34 : -34), cy0, { color: k.bfield, w: 3.5, dash: [6, 4], label: 'induced B' }); var indS = vmag < 0 ? 'induced field pushes back (opposes the incoming N)' : 'induced field pulls back (opposes the leaving N)'; wrapLines(ctx, indS, W0 - 20, 11, 700).forEach(function (ln, li) { txt(ctx, ln, cx0, cy0 + ch / 2 + 16 + li * 13, { align: 'center', size: 11, color: k.bfield, weight: 700, halo: true }); }); F.tagAt(ctx, 'Bind', cx0, cy0 - 22); } }
        else { var Bn = Bt(t); for (var gx = cx0 - cw / 2 - 30; gx < cx0 + cw / 2 + 40; gx += 26) arrow(ctx, gx - 10, cy0 - ch * 0.3, gx + 10, cy0 - ch * 0.3, { color: rgba(k.bfield, clamp(Bn / 0.5, 0.15, 1)), w: 1 + 3 * clamp(Bn / 0.5, 0, 1), head: 6 }); txt(ctx, 'B = ' + un(Bn, 'T', 3), cx0, cy0 - ch / 2 - 12, { align: 'center', size: 12, weight: 700, color: k.bfield }); }
        if (sh.meter) { var gx0 = W0 * 0.85, gy0 = sceneH * 0.55; circ(ctx, gx0, gy0, 34, { fill: k.bg, color: k.ink, w: 2 }); var na = clamp(Iind / 0.02, -1, 1) * 1.1; line(ctx, gx0, gy0 + 18, gx0 + 30 * M.sin(na), gy0 + 18 - 30 * M.cos(na), k.red, 2.5); txt(ctx, 'meter', gx0, gy0 + 46, { align: 'center', size: 11, color: k.muted }); line(ctx, cx0 + cw / 2, cy0 + ch / 2, gx0, gy0 + 34, k.cur, 1.5); line(ctx, cx0 - cw / 2, cy0 + ch / 2, gx0 - 20, gy0 + 28, k.cur, 1.5); }
        desc = mode === 'magnet-coil' ? 'A bar magnet is pushed into a coil, held still, then pulled out, with a meter on the coil.' : 'A loop in a magnetic field that changes with time.';
        read = M.abs(e) < 1e-4 ? 'The flux is not changing right now, so there is <b>no emf and no current</b>, even with a strong field' + (mode === 'magnet-coil' && magX(t) < 0.05 ? ' and the magnet sitting inside the coil' : '') + '.' : 'The flux is changing, so there is an emf ε = −N dΦ/dt = <b>' + un(e * (mode === 'magnet-coil' ? 1 : 1), 'V', 3) + '</b>. Lenz: the induced current makes a field that <b>opposes the change</b>, not the magnet itself.';
      } else if (mode === 'rotate' || mode === 'generator') {
        var th = P.w * t, cx1 = W0 * 0.4, cy1 = sceneH / 2, R1 = M.min(W0 * 0.2, sceneH * 0.36);
        for (var q = -2; q <= 2; q++) arrow(ctx, 20, cy1 + q * 30, W0 * 0.75, cy1 + q * 30, { color: rgba(k.bfield, 0.3), w: 1.3, head: 6 }); txt(ctx, 'B', W0 * 0.75 + 6, cy1 - 60, { size: 12, weight: 700, color: k.bfield });
        ctx.save(); ctx.translate(cx1, cy1); ctx.scale(M.cos(th), 1); rrect(ctx, -R1, -R1 * 0.8, 2 * R1, 1.6 * R1, 4); ctx.strokeStyle = k.cur; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = rgba(k.bfield, 0.08 + 0.2 * M.abs(M.cos(th))); ctx.fill(); ctx.restore(); F.tagAt(ctx, 'loop', cx1, cy1 - R1 - 10);
        if (mode === 'generator') { var bulbB = clamp(M.abs(e) / (P.N * P.B * P.A * P.w), 0, 1); var gg = ctx.createRadialGradient(W0 * 0.88, cy1, 2, W0 * 0.88, cy1, 10 + 24 * bulbB); gg.addColorStop(0, 'rgba(255,214,90,' + (0.2 + 0.7 * bulbB) + ')'); gg.addColorStop(1, 'rgba(255,214,90,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(W0 * 0.88, cy1, 34, 0, TAU); ctx.fill(); circ(ctx, W0 * 0.88, cy1, 11, { color: k.ink, w: 2 }); txt(ctx, 'lamp', W0 * 0.88, cy1 + 24, { align: 'center', size: 11, color: k.muted }); }
        desc = 'A coil of ' + P.N + ' turns turning in a ' + un(P.B, 'T') + ' field.'; read = 'Φ = NBA cos ωt and ε = NBAω sin ωt: the emf is <b>largest when the flux is zero</b> (coil edge-on to the field, flux changing fastest) and zero when the flux is largest. Peak emf ' + un(P.N * P.B * P.A * P.w, 'V', 3) + '.'; st = [['peak emf', un(P.N * P.B * P.A * P.w, 'V', 3)], ['emf now', un(e, 'V', 3)]];
      } else if (mode === 'rails') {
        var v = PM.railsV(P.v, P.B, P.L, P.m, P.R, t), xpos = (P.m * P.R / (P.B * P.B * P.L * P.L)) * P.v * (1 - M.exp(-P.B * P.B * P.L * P.L * t / (P.m * P.R))), x0 = 40, y0 = sceneH * 0.2, y1 = sceneH * 0.8, sx = (W0 - 120) / ((P.m * P.R / (P.B * P.B * P.L * P.L)) * P.v + 0.3), rx = x0 + (0.2 + xpos) * sx;
        for (var gx2 = 50; gx2 < W0 - 20; gx2 += 36) for (var gy2 = y0 + 14; gy2 < y1; gy2 += 34) dotIn(ctx, gx2, gy2, 4.5, rgba(k.bfield, 0.45));
        line(ctx, x0, y0, W0 - 20, y0, k.metal, 4); line(ctx, x0, y1, W0 - 20, y1, k.metal, 4); spring(ctx, x0, y0, x0, y1, { n: 8, amp: 6, color: k.ink }); txt(ctx, 'R', x0 - 10, (y0 + y1) / 2, { align: 'right', size: 12, weight: 700 });
        line(ctx, rx, y0 - 8, rx, y1 + 8, k.obj2Line, 6); F.tagAt(ctx, 'rod', rx + 16, y0 - 10); arrow(ctx, rx, (y0 + y1) / 2 - 20, rx + 20 + v * 14, (y0 + y1) / 2 - 20, { color: k.vel, w: 2.6, label: 'v' }); var Fm = P.B * P.L * P.B * P.L * v / P.R; arrow(ctx, rx, (y0 + y1) / 2 + 20, rx - 10 - Fm * 20, (y0 + y1) / 2 + 20, { color: k.force, w: 2.6 }); txt(ctx, 'magnetic force', rx + 8, (y0 + y1) / 2 + 34, { size: 11, color: k.force, weight: 700, halo: true });
        if (sh.cur && v > 0.01) dotsAlong(ctx, [[rx, y1], [rx, y0], [x0, y0], [x0, y1], [rx, y1]], t * 80 * v, 24, k.cur, 2.6);
        e = P.B * P.L * v; Iind = e / P.R;
        desc = 'A rod on rails in a field into the page, given a push to ' + un(P.v, 'm/s') + ' and then released.'; read = 'Motional emf ε = BLv = <b>' + un(e, 'V', 3) + '</b>, current I = ε/R = <b>' + un(Iind, 'A', 3) + '</b>. The force on the current, ILB, points <b>against</b> the motion, so the rod slows down: the induced current never pushes it along (that would make energy from nothing).'; st = [['v', un(v, 'm/s', 3)], ['emf', un(e, 'V', 3)], ['current', un(Iind, 'A', 3)], ['force', un(Fm, 'N', 3)]];
      } else if (mode === 'brake') {
        var vt = PM.terminalV(P.m, 9.8, P.R, P.B, P.L), tc = vt / 9.8, vv = vt * (1 - M.exp(-t / tc)), x2 = W0 * 0.3, yy0 = 20, yy1 = sceneH - 10, drop = vt * (t - tc * (1 - M.exp(-t / tc))), sy = (yy1 - yy0) / (vt * 3 + 0.01), ry = yy0 + 20 + (drop * sy) % (yy1 - yy0 - 30);
        line(ctx, x2 - 50, yy0, x2 - 50, yy1, k.metal, 4); line(ctx, x2 + 50, yy0, x2 + 50, yy1, k.metal, 4); for (var gy3 = yy0 + 10; gy3 < yy1; gy3 += 30) for (var gx3 = x2 - 40; gx3 < x2 + 50; gx3 += 30) dotIn(ctx, gx3, gy3, 4, rgba(k.bfield, 0.45)); line(ctx, x2 - 56, ry, x2 + 56, ry, k.obj2Line, 6); arrow(ctx, x2 + 64, ry, x2 + 64, ry + 10 + vv * 8, { color: k.vel, w: 2.4, label: 'v' });
        e = P.B * P.L * vv; desc = 'A rod falling on vertical rails through a magnetic field.'; read = 'As it speeds up, the induced current grows and the magnetic force (B²L²v/R, upward) grows until it equals the weight: terminal speed v = mgR/(B²L²) = <b>' + un(vt, 'm/s', 3) + '</b>. The rod\'s lost potential energy becomes heat in the resistor.'; st = [['speed', un(vv, 'm/s', 3)], ['terminal speed', un(vt, 'm/s', 3)]];
        phi = function (tt) { return 0; };
      } else if (mode === 'inductor') {
        var tau = P.Lind / P.R, Ii = P.eps / P.R * (1 - M.exp(-t / tau)), back = P.eps * M.exp(-t / tau); txt(ctx, 'ε = ' + un(P.eps, 'V') + ', R = ' + un(P.R, 'Ω') + ', L = ' + un(P.Lind, 'H'), 20, 20, { size: 12, weight: 700 }); var bw = W0 - 60; [['current I', Ii / (P.eps / P.R), k.cur, un(Ii, 'A', 3)], ['back emf', back / P.eps, k.purple, un(back, 'V', 3)]].forEach(function (q, i) { var y = 50 + i * 50; txt(ctx, q[0] + (F.vals ? ' = ' + q[3] : ''), 20, y, { size: 12, weight: 700, color: q[2] }); rrect(ctx, 20, y + 10, bw, 12, 6); ctx.fillStyle = k.grid; ctx.fill(); rrect(ctx, 20, y + 10, bw * q[1], 12, 6); ctx.fillStyle = q[2]; ctx.fill(); });
        desc = 'An inductor in series with a resistor, just after a switch connects a battery.'; read = 'The inductor\'s back emf (L dI/dt) starts equal to ε and stops the current from jumping; the current climbs toward ε/R with τ = L/R = <b>' + un(tau, 's', 3) + '</b>, storing energy ½LI² in the magnetic field.'; st = [['I', un(Ii, 'A', 3)], ['back emf', un(back, 'V', 3)], ['τ', un(tau, 's', 3)]];
        phi = function (tt) { return P.Lind * P.eps / P.R * (1 - M.exp(-tt / tau)); }; e = back;
      } else if (mode === 'transformer') {
        var Vs = P.Vp * P.Ns / P.Np, cx3 = W0 / 2, cy3 = sceneH / 2, cw3 = M.min(W0 * 0.36, 220), ch3 = sceneH * 0.7; ctx.save(); ctx.strokeStyle = k.metal; ctx.lineWidth = 16; rrect(ctx, cx3 - cw3 / 2, cy3 - ch3 / 2, cw3, ch3, 6); ctx.stroke(); ctx.restore();
        var np = clamp(M.round(P.Np / 20), 2, 12), ns = clamp(M.round(P.Ns / 20), 2, 20); for (var i2 = 0; i2 < np; i2++) { var yy = cy3 - ch3 * 0.3 + i2 * ch3 * 0.6 / np; line(ctx, cx3 - cw3 / 2 - 14, yy, cx3 - cw3 / 2 + 14, yy + 4, k.cur, 3); } for (i2 = 0; i2 < ns; i2++) { var y2 = cy3 - ch3 * 0.3 + i2 * ch3 * 0.6 / ns; line(ctx, cx3 + cw3 / 2 - 14, y2, cx3 + cw3 / 2 + 14, y2 + 4, k.red, 3); }
        txt(ctx, 'primary ' + fm(P.Np, 0) + ' turns', cx3 - cw3 / 2 - 20, cy3 + ch3 / 2 + 14, { align: 'center', size: 11.5, weight: 700, color: k.cur }); txt(ctx, 'secondary ' + fm(P.Ns, 0) + ' turns', cx3 + cw3 / 2 + 20, cy3 + ch3 / 2 + 14, { align: 'center', size: 11.5, weight: 700, color: k.red }); txt(ctx, un(P.Vp, 'V') + ' AC in', cx3 - cw3 / 2 - 24, cy3 - ch3 / 2 - 6, { align: 'right', size: 12, weight: 700 }); txt(ctx, F.vals ? un(Vs, 'V', 3) + ' out' : '? V out', cx3 + cw3 / 2 + 24, cy3 - ch3 / 2 - 6, { size: 12, weight: 700 });
        var Pw = num(o.P, 60); desc = 'A transformer with ' + P.Np + ' primary turns and ' + P.Ns + ' secondary turns on an iron core, fed ' + un(P.Vp, 'V') + ' AC.'; read = 'The same changing flux threads both coils, so V<sub>s</sub>/V<sub>p</sub> = N<sub>s</sub>/N<sub>p</sub>: V<sub>s</sub> = <b>' + un(Vs, 'V', 3) + '</b>. An ideal transformer keeps the <b>power</b> the same: for ' + un(Pw, 'W') + ', I<sub>p</sub> = ' + un(Pw / P.Vp, 'A', 3) + ' and I<sub>s</sub> = ' + un(Pw / Vs, 'A', 3) + '. It only works with AC: a steady current makes no changing flux.'; st = [['V secondary', un(Vs, 'V', 3)], ['I primary', un(Pw / P.Vp, 'A', 3)], ['I secondary', un(Pw / Vs, 'A', 3)]];
      } else { // flux through a tilted loop
        var a = P.th * DEG, cx4 = W0 * 0.45, cy4 = sceneH / 2, R4 = M.min(W0 * 0.22, sceneH * 0.4); for (var q2 = -3; q2 <= 3; q2++) arrow(ctx, cx4 + q2 * 26 - 4, sceneH - 10, cx4 + q2 * 26 - 4, 10, { color: rgba(k.bfield, 0.35), w: 1.5, head: 6 }); ctx.save(); ctx.translate(cx4, cy4); ctx.scale(1, M.max(0.08, M.sin(a) * 0 + M.cos(a) * 0.35 + 0.05)); circ(ctx, 0, 0, R4, { fill: rgba(k.gold, 0.18), color: k.cur, w: 4 }); ctx.restore(); arrow(ctx, cx4, cy4, cx4 + 60 * M.sin(a), cy4 - 60 * M.cos(a), { color: k.purple, w: 2.6, label: 'normal' }); arc(ctx, cx4, cy4, 30, -PI / 2, -PI / 2 + a, k.gold, 1.5); txt(ctx, 'θ', cx4 + 34 * M.sin(a / 2), cy4 - 34 * M.cos(a / 2), { size: 13, italic: true, serif: true, color: k.gold });
        var Fl = P.B * P.A * M.cos(a); desc = 'A loop of area ' + un(P.A, 'm²') + ' tilted so its normal is ' + fm(P.th, 0) + '° from a ' + un(P.B, 'T') + ' field.'; read = 'Φ = BA cos θ = <b>' + un(Fl, 'Wb', 3) + '</b>, with θ measured from the loop\'s normal. It is largest when the field passes straight through (θ = 0) and zero when the loop lies along the field.'; st = [['flux Φ', un(Fl, 'Wb', 3)]];
      }
      if (sh.graphs && mode !== 'transformer' && mode !== 'flux') {
        var gh = (H0 - sceneH) / 2 - 8, xs = 50, wg = W0 - 64, Np = 200, ph = [], em = []; for (var j = 0; j <= Np; j++) { var tj = tmax * j / Np; ph.push([tj, mode === 'brake' ? PM.terminalV(P.m, 9.8, P.R, P.B, P.L) * (1 - M.exp(-tj / (PM.terminalV(P.m, 9.8, P.R, P.B, P.L) / 9.8))) : phi(tj)]); em.push([tj, mode === 'brake' ? 0 : mode === 'rails' ? P.B * P.L * PM.railsV(P.v, P.B, P.L, P.m, P.R, tj) : mode === 'inductor' ? P.eps * M.exp(-tj / (P.Lind / P.R)) : emf(tj)]); }
        var r1 = M.max(1e-9, M.max.apply(null, ph.map(function (q3) { return M.abs(q3[1]); }))), r2 = M.max(1e-9, M.max.apply(null, em.map(function (q3) { return M.abs(q3[1]); })));
        var G1 = GP(ctx, { x: xs, y: sceneH + 6, w: wg, h: gh - 14 }, { xmin: 0, xmax: tmax, ymin: mode === 'rotate' || mode === 'generator' ? -r1 * 1.15 : 0, ymax: r1 * 1.15, xlab: 't (s)', ylab: mode === 'brake' ? 'speed (m/s)' : mode === 'inductor' ? 'flux linkage LI (Wb)' : 'flux Φ (Wb)', compact: true, ystep: niceStep(r1 * 1.15, 2) }).frame(); G1.line(ph, k.bfield, 2.2); G1.vline(t, k.gold, [4, 3]); F.tagAt(ctx, 'phi', xs + wg - 12, sceneH + 18);
        if (mode !== 'brake') { var lo = M.min.apply(null, em.map(function (q3) { return q3[1]; })), G2 = GP(ctx, { x: xs, y: sceneH + gh + 14, w: wg, h: gh - 14 }, { xmin: 0, xmax: tmax, ymin: lo < -1e-9 ? -r2 * 1.15 : 0, ymax: r2 * 1.15, xlab: 't (s)', ylab: mode === 'inductor' ? 'back emf (V)' : 'emf ε (V)', compact: true, ystep: niceStep(r2 * 1.15, 2) }).frame(); G2.line(em, k.red, 2.2); G2.vline(t, k.gold, [4, 3]); F.tagAt(ctx, 'emf', xs + wg - 12, sceneH + gh + 26); }
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-rays. "Real is positive": d_o > 0, d_i > 0 for real images, f > 0 for concave mirrors and converging lenses; m = −d_i/d_o.
  /* PM.thinLens(f, dObj): image distance and magnification (works for mirrors with f = R/2) */
  PM.thinLens = function (f, d0) { var di = 1 / (1 / f - 1 / d0); return { di: di, m: -di / d0 }; };
  /* PM.lensmaker(n, R1, R2): 1/f = (n − 1)(1/R1 − 1/R2), R > 0 when the surface's center of curvature is on the outgoing side */
  PM.lensmaker = function (n, R1, R2) { return 1 / ((n - 1) * (1 / R1 - 1 / R2)); };
  /* PM.paraxial(lenses, y, u, x0): trace a ray (height y, slope u at x0) through thin lenses [{x, f}]; returns [[x, y]...] and the final slope */
  PM.paraxial = function (lenses, y, u, x0) { var pts = [[x0, y]], x = x0; lenses.forEach(function (L) { y = y + u * (L.x - x); x = L.x; pts.push([x, y]); u = u - y / L.f; }); return { pts: pts, u: u, y: y, x: x }; };
  R('ph-rays', function (el, o) {
    var elem = pick(o.element, ['plane', 'concave', 'convex', 'converging', 'diverging', 'two-lens', 'eye', 'magnifier', 'microscope', 'telescope', 'lensmaker'], 'converging');
    var F = frame(el, o, { plane: 'A plane mirror and your reflection', concave: 'A concave mirror with principal rays', convex: 'A convex mirror with principal rays', converging: 'A converging lens with principal rays', diverging: 'A diverging lens with principal rays', 'two-lens': 'Two lenses in a row', eye: 'The eye and corrective lenses', magnifier: 'A magnifying glass', microscope: 'A compound microscope', telescope: 'A refracting telescope', lensmaker: 'The lensmaker\'s equation' }[elem]);
    var mirror = elem === 'concave' || elem === 'convex', P = { f: num(o.f, elem === 'convex' || elem === 'diverging' ? -10 : elem === 'magnifier' ? 10 : 10), f2: num(o.f2, 8), sep: num(o.sep, 30), dObj: num(o.dObj, elem === 'magnifier' ? 6 : 25), hObj: num(o.hObj, 5), n: num(o.n, 1.5), R1: num(o.R1, 15), R2: num(o.R2, -15) };
    if (elem === 'convex' || elem === 'diverging') P.f = -M.abs(P.f); else if (elem === 'concave' || elem === 'converging' || elem === 'magnifier') P.f = M.abs(P.f);
    if (elem === 'plane') return planeMirror(F, o);
    if (elem === 'eye') return eyeScene(F, o);
    if (elem === 'telescope') return telescope(F, o);
    if (elem === 'lensmaker') P.f = PM.lensmaker(P.n, P.R1, P.R2);
    var rays = arr(o.rays || [1, 2, 3]), block = o.block === 'top' || o.block === 'bottom' ? o.block : null;
    var sh = { image: F.on('image', true, true), focal: F.on('focal', true), virt: F.on('virtual', true), rays: F.on('rays', true) };
    var c = F.canvas({ aspect: 2.0, narrow: 1.25 }), mp = null;
    var hd = F.handles(F.live && o.drag !== false ? [{ name: 'object', pos: function () { return mp ? [mp.X(-P.dObj), mp.Y(P.hObj)] : null; }, drag: function (px) { P.dObj = clamp(M.round(-mp.x(px) * 2) / 2, 1, 80); }, key: function (dx, dy, big) { P.dObj = clamp(P.dObj - dx * (big ? 5 : 1), 1, 80); } }] : [], { r: 26 });
    if (F.live && (elem === 'converging' || elem === 'diverging' || mirror || elem === 'magnifier')) F.slider(null, { label: 'Focal length f', min: -40, max: 40, step: 1, value: P.f, unit: 'cm', d: 0, input: function (v) { if (M.abs(v) < 1) v = v < 0 ? -1 : 1; P.f = (elem === 'converging' || elem === 'concave' || elem === 'magnifier') ? M.abs(v) : -M.abs(v); } });
    if (F.live && elem === 'lensmaker') { F.slider(null, { label: 'Index n', min: 1.2, max: 2.4, step: 0.01, value: P.n, d: 2, input: function (v) { P.n = v; } }); F.slider(null, { label: 'R₁', min: -40, max: 40, step: 1, value: P.R1, unit: 'cm', d: 0, input: function (v) { if (M.abs(v) < 2) v = 2 * (v < 0 ? -1 : 1); P.R1 = v; } }); F.slider(null, { label: 'R₂', min: -40, max: 40, step: 1, value: P.R2, unit: 'cm', d: 0, input: function (v) { if (M.abs(v) < 2) v = 2 * (v < 0 ? -1 : 1); P.R2 = v; } }); }
    if (F.live && (elem === 'converging' || elem === 'concave')) F.seg(null, { label: 'Cover half', items: [['none', 'Uncovered'], ['top', 'Cover top half']], value: block || 'none', change: function (v) { block = v === 'none' ? null : v; } });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c);
      if (elem === 'lensmaker') P.f = PM.lensmaker(P.n, P.R1, P.R2);
      var lenses = elem === 'two-lens' || elem === 'microscope' ? [{ x: 0, f: elem === 'microscope' ? num(o.f, 1.6) : P.f }, { x: elem === 'microscope' ? num(o.sep, 20) : P.sep, f: elem === 'microscope' ? num(o.f2, 2.5) : P.f2 }] : [{ x: 0, f: P.f }];
      if (elem === 'microscope' && o.dObj == null) P.dObj = 1.8;
      var last = lenses[lenses.length - 1], d0 = P.dObj, img = null;
      // the image through the system (paraxial): trace two rays from the tip and intersect them after the last lens
      var r1 = PM.paraxial(lenses, P.hObj, 0, -d0), r2 = PM.paraxial(lenses, P.hObj, -P.hObj / d0, -d0);
      if (M.abs(r1.u - r2.u) > 1e-12) { var xi = last.x + (r2.y - r1.y) / (r1.u - r2.u), yi = r1.y + r1.u * (xi - last.x); img = { x: xi, y: yi, real: xi > last.x }; }
      if (mirror) { var mi = PM.thinLens(P.f, d0); img = { x: -mi.di, y: mi.m * P.hObj, real: mi.di > 0 }; }
      var xs = [-d0, 0, last.x, M.abs(P.f) * 1.5, -M.abs(P.f) * 1.5], ys = [P.hObj, -P.hObj]; if (img && isFinite(img.x) && M.abs(img.x) < 200) { xs.push(img.x); ys.push(img.y); }
      var xmin = M.min.apply(null, xs) - 6, xmax = M.max.apply(null, xs) + 6, ymax = M.max(M.max.apply(null, ys.map(M.abs)) * 1.3, 8);
      mp = fitMap({ x: 10, y: 10, w: W0 - 20, h: H0 - 20 }, xmin, xmax, -ymax, ymax, false); var X = mp.X, Y = mp.Y;
      line(ctx, 0, Y(0), W0, Y(0), k.axis, 1.2);
      // optics
      lenses.forEach(function (L, i) { var lx = X(L.x), lh = (ymax * 0.85) * mp.sy;
        if (mirror) { var bulge = (P.f > 0 ? -1 : 1) * 14; /* a concave mirror cups toward the light */ ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx + bulge, Y(0) - lh); ctx.quadraticCurveTo(lx - bulge, Y(0), lx + bulge, Y(0) + lh); ctx.stroke(); ctx.restore(); hatch(ctx, lx + 16, Y(0) - lh, 10, 2 * lh, k.ground, 6); }
        else if (elem === 'lensmaker') { ctx.save(); ctx.fillStyle = rgba(k.waterLine, 0.25); ctx.strokeStyle = k.waterLine; ctx.lineWidth = 2; ctx.beginPath(); var b1 = clamp(30 / P.R1, -1.5, 1.5) * 18, b2 = clamp(30 / P.R2, -1.5, 1.5) * 18; ctx.moveTo(lx - 6, Y(0) - lh); ctx.quadraticCurveTo(lx - 6 - b1 * 2, Y(0), lx - 6, Y(0) + lh); ctx.lineTo(lx + 6, Y(0) + lh); ctx.quadraticCurveTo(lx + 6 - b2 * 2, Y(0), lx + 6, Y(0) - lh); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
        else { line(ctx, lx, Y(0) - lh, lx, Y(0) + lh, k.waterLine, 3); var conv = L.f > 0; [[-1, Y(0) - lh], [1, Y(0) + lh]].forEach(function (q) { var dy = q[0] * (conv ? 1 : -1) * 9; poly(ctx, [[lx - 8, q[1] - dy], [lx, q[1]], [lx + 8, q[1] - dy]], { color: k.waterLine, w: 3 }); }); }
        if (sh.focal) { [-1, 1].forEach(function (sg) { if (mirror && sg > 0) return; var fx = L.x + sg * M.abs(L.f); circ(ctx, X(fx), Y(0), 4, { fill: k.gold }); txt(ctx, 'F' + (lenses.length > 1 ? sub(i + 1) : ''), X(fx), Y(0) + 14, { align: 'center', size: 11, weight: 700, color: k.gold }); F.tagAt(ctx, sg < 0 ? 'F1' : 'F2', X(fx), Y(0) + 32); }); if (mirror) { var cx2 = -2 * M.abs(P.f); circ(ctx, X(cx2), Y(0), 4, { fill: k.purple }); txt(ctx, 'C', X(cx2), Y(0) + 14, { align: 'center', size: 11, weight: 700, color: k.purple }); F.tagAt(ctx, 'C', X(cx2), Y(0) + 32); } }
        if (block && i === 0) { ctx.save(); ctx.fillStyle = k.ink; ctx.fillRect(lx - 5, block === 'top' ? Y(0) - lh - 4 : Y(0), 10, lh + 4); ctx.restore(); } });
      // object arrow
      arrow(ctx, X(-d0), Y(0), X(-d0), Y(P.hObj), { color: k.red, w: 3.2 }); txt(ctx, 'object', X(-d0), Y(0) + 14, { align: 'center', size: 11, color: k.red }); F.tagAt(ctx, 'obj', X(-d0) - 16, Y(P.hObj));
      // rays from the tip
      var tip = [-d0, P.hObj], cols = { 1: k.green, 2: k.blue, 3: k.purple }, xr = xmax;
      function seg2(a, b, col, dash, w) { line(ctx, X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), col, w || 1.8, dash); }
      function ext(p, u, x) { return [x, p[1] + u * (x - p[0])]; }
      if (sh.rays) {
        if (mirror) {
          rays.forEach(function (rn) { // paraxial mirror rays: the mirror is the plane x = 0; F at x = −f, C at x = −2f
            var col = cols[rn], f = P.f, h = P.hObj, y0, out;
            if (rn === 1) { y0 = h; out = function (x) { return h + h / f * x; }; }
            else if (rn === 2) { y0 = -h * f / (d0 - f); out = function () { return y0; }; }
            else { y0 = -2 * h * f / (d0 - 2 * f); var sl = (y0 - h) / d0; out = function (x) { return y0 + sl * x; }; }
            if (!isFinite(y0)) return;
            if (block === 'top' && y0 > 0) { seg2(tip, [0, y0], rgba(col, 0.3), [3, 3]); return; }
            seg2(tip, [0, y0], col); seg2([0, y0], [xmin, out(xmin)], col);
            if (img && !img.real && sh.virt) seg2([0, y0], [M.min(xmax, img.x + 4), out(M.min(xmax, img.x + 4))], rgba(col, 0.6), [5, 4], 1.4);
            F.tagAt(ctx, 'ray' + rn, X((tip[0]) / 2), Y((tip[1] + y0) / 2) - 14); });
        } else {
          var f0 = lenses[0].f, starts = { 1: 0, 2: -P.hObj / d0, 3: -P.hObj / (d0 - f0) }, fan = block ? [0.6, 0.3, -0.1, -0.4, -0.7] : [];
          rays.concat(fan.map(function (q) { return 'fan' + q; })).forEach(function (rn) {
            var u0 = typeof rn === 'number' ? starts[rn] : (lenses[0].f * 0 + (parseFloat(String(rn).slice(3)) * P.hObj * 1.4 - P.hObj) / d0), col = typeof rn === 'number' ? cols[rn] : rgba(k.gold, 0.7);
            if (!isFinite(u0)) return; var tr = PM.paraxial(lenses, P.hObj, u0, -d0), y1 = tr.pts[1][1];
            if (block && (block === 'top' ? y1 > 0 : y1 < 0)) { seg2(tr.pts[0], tr.pts[1], rgba(col, 0.25), [3, 3]); return; }
            for (var i = 0; i < tr.pts.length - 1; i++) seg2(tr.pts[i], tr.pts[i + 1], col); seg2(tr.pts[tr.pts.length - 1], ext(tr.pts[tr.pts.length - 1], tr.u, xr), col);
            if (img && !img.real && sh.virt && typeof rn === 'number') seg2(tr.pts[tr.pts.length - 1], ext(tr.pts[tr.pts.length - 1], tr.u, M.max(img.x - 4, xmin)), rgba(col, 0.6), [5, 4], 1.4);
            if (typeof rn === 'number') F.tagAt(ctx, 'ray' + rn, X((tr.pts[0][0] + tr.pts[1][0]) / 2), Y((tr.pts[0][1] + tr.pts[1][1]) / 2) - 14); });
        }
      }
      if (img && sh.image && isFinite(img.x) && M.abs(img.x) < 1e3) { arrow(ctx, X(img.x), Y(0), X(img.x), Y(img.y), { color: rgba(k.red, block ? 0.5 : 1), w: 3.2, dash: img.real ? null : [6, 4] }); txt(ctx, (img.real ? 'real' : 'virtual') + ' image', X(img.x), Y(0) + (img.y > 0 ? 14 : -14), { align: 'center', size: 11, color: k.red, halo: true }); F.tagAt(ctx, 'img', X(img.x) + 16, Y(img.y)); }
      hd.draw(ctx);
      var di = mirror ? -img.x : img ? img.x - last.x : Infinity, m = img ? img.y / P.hObj : NaN;
      var dsc = (mirror ? (elem === 'concave' ? 'Concave' : 'Convex') + ' mirror' : elem === 'two-lens' ? 'Two lenses' : elem === 'microscope' ? 'A microscope' : (lenses[0].f > 0 ? 'Converging' : 'Diverging') + ' lens') + ' with f = ' + un(lenses[0].f, 'cm', 3) + '; object ' + un(d0, 'cm', 3) + ' away, ' + un(P.hObj, 'cm', 2) + ' tall.';
      F.desc(dsc + (F.quiet || !img ? '' : ' Image: ' + (img.real ? 'real, ' : 'virtual, ') + (m < 0 ? 'inverted, ' : 'upright, ') + un(M.abs(di), 'cm', 3) + (mirror ? (img.real ? ' in front of the mirror' : ' behind the mirror') : img.real ? ' past the lens' : ' on the object\'s side') + ', magnification ' + nf(m, 3) + '.'));
      var rd = '1/d<sub>o</sub> + 1/d<sub>i</sub> = 1/f: d<sub>o</sub> = <b>' + un(d0, 'cm', 3) + '</b>, f = <b>' + un(lenses[lenses.length > 1 ? 1 : 0].f, 'cm', 3) + '</b>' + (lenses.length > 1 ? ' (second lens)' : '') + ', d<sub>i</sub> = <b>' + un(di, 'cm', 3) + '</b>, m = −d<sub>i</sub>/d<sub>o</sub> = <b>' + nf(m, 3) + '</b>. ' + (img && img.real ? 'Real image (rays really meet there): it could be caught on a screen, and it is upside down.' : 'Virtual image: the rays only seem to come from there (dashed), so no screen can catch it.');
      if (block) rd += ' Covering half the ' + (mirror ? 'mirror' : 'lens') + ' blocks half the light, but every point of the object still sends rays through the other half: the image is <b>whole, only dimmer</b>.';
      if (elem === 'magnifier') rd = 'With the object inside the focal length, the lens makes a virtual, upright, enlarged image. Angular magnification about 25 cm / f = <b>' + fm(25 / P.f, 2) + '×</b> (relaxed eye).';
      if (elem === 'microscope') { var fo = lenses[0].f, fe = lenses[1].f, Lt = lenses[1].x - fo - fe; rd = 'The objective makes a real, enlarged image; the eyepiece magnifies that image like a magnifier. Overall M ≈ −(L/f<sub>o</sub>)(25 cm/f<sub>e</sub>) = <b>' + fm(-(Lt / fo) * (25 / fe), 1) + '</b> (tube length L = ' + un(Lt, 'cm', 3) + ').'; }
      if (elem === 'lensmaker') rd = '1/f = (n − 1)(1/R₁ − 1/R₂) = (' + fm(P.n, 2) + ' − 1)(1/' + fm(P.R1, 0) + ' − 1/' + fm(P.R2, 0) + ') → f = <b>' + un(P.f, 'cm', 3) + '</b>. R is positive when the surface\'s center of curvature is on the side the light leaves from.';
      F.read(rd); F.stats([['d_o', un(d0, 'cm', 3)], ['d_i', un(di, 'cm', 3)], ['f', un(lenses[0].f, 'cm', 3)], ['m', nf(m, 3)]]);
    };
    F.now(); return {};
  });
  function planeMirror(F, o) {
    var P = { d: num(o.dObj, 1.5), H: num(o.hObj, 1.8) }, c = F.canvas({ aspect: 1.9, narrow: 1.2 }), mp = null;
    var hd = F.handles(F.live ? [{ name: 'you', pos: function () { return mp ? [mp.X(-P.d), mp.Y(P.H * 0.5)] : null; }, drag: function (px) { P.d = clamp(-mp.x(px), 0.3, 4); }, key: function (dx, dy, big) { P.d = clamp(P.d - dx * (big ? 0.5 : 0.1), 0.3, 4); } }] : [], { r: 30 });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c);
      mp = fitMap({ x: 10, y: 10, w: W0 - 20, h: H0 - 20 }, -4.3, 4.3, -0.15, 2.2, true); var X = mp.X, Y = mp.Y;
      ground(ctx, X(-4.3), Y(0), X(4.3) - X(-4.3), k); line(ctx, X(0), Y(0), X(0), Y(2.1), k.waterLine, 2, [4, 4]);
      var eye = P.H * 0.94, mTop = (P.H + eye) / 2, mBot = eye / 2; line(ctx, X(0), Y(mBot), X(0), Y(mTop), k.waterLine, 6); txt(ctx, 'mirror you need: ' + (F.vals ? un(mTop - mBot, 'm', 3) : '?') + ' (half your height)', X(0) + 8, Y(mTop) - 10, { size: 11, weight: 700, color: k.waterLine, halo: true });
      function person(x, alpha) { ctx.save(); ctx.globalAlpha = alpha; var hx = X(x), s = mp.sy; circ(ctx, hx, Y(P.H - 0.12), 0.11 * s, { fill: k.skin, color: k.objLine, w: 2 }); line(ctx, hx, Y(P.H - 0.24), hx, Y(0.85), k.objLine, 4); line(ctx, hx, Y(0.85), hx - 0.12 * s, Y(0), k.objLine, 4); line(ctx, hx, Y(0.85), hx + 0.12 * s, Y(0), k.objLine, 4); line(ctx, hx - 0.2 * s, Y(1.25), hx + 0.2 * s, Y(1.25), k.objLine, 4); ctx.restore(); }
      person(-P.d, 1); person(P.d, 0.4); txt(ctx, 'image (virtual)', X(P.d), Y(0) + 14, { align: 'center', size: 11, color: k.muted });
      [[P.H, k.green], [0, k.purple]].forEach(function (q) { var hy = (q[0] + eye) / 2; line(ctx, X(-P.d), Y(q[0]), X(0), Y(hy), q[1], 1.8); line(ctx, X(0), Y(hy), X(-P.d), Y(eye), q[1], 1.8); line(ctx, X(0), Y(hy), X(P.d), Y(q[0]), rgba(q[1], 0.5), 1.4, [5, 4]); });
      hd.draw(ctx);
      F.desc('A person ' + un(P.d, 'm') + ' from a plane mirror seeing their whole body.');
      F.read('Light from your feet and head reflects at equal angles to reach your eye. The mirror only needs to be <b>half your height</b> (' + un(mTop - mBot, 'm', 3) + '), and stepping back does not change that: you see the same amount of yourself. Your image is as far behind the mirror as you are in front.');
    };
    F.now(); return {};
  }
  function eyeScene(F, o) {
    var e = o.eye || {}, near = num(e.near, 25), far = e.far == null ? Infinity : num(e.far, 200), correct = !!o.correct, c = F.canvas({ aspect: 2.1, narrow: 1.3 });
    var kind = isFinite(far) ? 'nearsighted' : near > 25 ? 'farsighted' : 'normal', fLens = kind === 'nearsighted' ? -far : kind === 'farsighted' ? 1 / (1 / 25 - 1 / near) : null;
    if (F.live && kind !== 'normal') F.check(null, 'Glasses on', correct, function (on) { correct = on; });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c);
      var ex = W0 * 0.7, ey = H0 / 2, R0 = M.min(H0 * 0.32, 80); circ(ctx, ex + R0 * 0.6, ey, R0, { fill: rgba(k.waterLine, 0.08), color: k.ink, w: 2.5 }); ctx.save(); ctx.translate(ex - R0 * 0.38, ey); ctx.scale(0.35, 1); circ(ctx, 0, 0, R0 * 0.55, { fill: rgba(k.waterLine, 0.3), color: k.waterLine, w: 3 }); ctx.restore(); var retX = ex + R0 * 1.58; arc(ctx, ex + R0 * 0.6, ey, R0 - 3, -0.7, 0.7, k.red, 4); txt(ctx, 'retina', retX + 6, ey - R0 * 0.6, { size: 11, color: k.red });
      var lensX = ex - R0 * 0.38, focusX = kind === 'nearsighted' && !correct ? retX - R0 * 0.35 : kind === 'farsighted' && !correct ? retX + R0 * 0.4 : retX;
      var srcFar = kind !== 'farsighted', glassX = lensX - 46;
      if (correct && fLens) { ctx.save(); ctx.strokeStyle = k.purple; ctx.lineWidth = 3; line(ctx, glassX, ey - R0 * 0.8, glassX, ey + R0 * 0.8, k.purple, 3); ctx.restore(); txt(ctx, (fLens < 0 ? 'diverging' : 'converging') + ' lens', glassX, ey + R0 * 0.8 + 14, { align: 'center', size: 11, color: k.purple, weight: 700 }); }
      [-0.5, -0.25, 0, 0.25, 0.5].forEach(function (h) { // schematic rays: parallel light from far away, or a fan from a near point
        var yl = ey + h * R0 * 0.9, pts = [[20, srcFar ? yl : ey]], glasses = correct && fLens;
        if (glasses) { var yg = srcFar ? yl : ey + (yl - ey) * (glassX - 20) / (lensX - 20); pts.push([glassX, yg]); yl = ey + (yl - ey) * (fLens < 0 ? 1.12 : 0.9); }
        pts.push([lensX, yl]); pts.push([focusX, ey]); if (focusX < retX) pts.push([retX, ey - (yl - ey) * (retX - focusX) / (focusX - lensX)]); else if (focusX > retX) pts[pts.length - 1] = [retX, ey + (yl - ey) * (focusX - retX) / (focusX - lensX)];
        poly(ctx, pts, { color: k.gold, w: 1.6 }); });
      txt(ctx, srcFar ? 'light from a distant object' : 'light from a book 25 cm away', 20, 16, { size: 11.5, color: k.muted });
      F.desc('An eye that is ' + kind + (kind === 'nearsighted' ? ' (far point ' + un(far, 'cm') + ')' : kind === 'farsighted' ? ' (near point ' + un(near, 'cm') + ')' : '') + (correct ? ', wearing glasses.' : '.'));
      F.read(kind === 'nearsighted' ? 'A nearsighted eye focuses distant light <b>in front of</b> the retina. A <b>diverging</b> lens (f = −far point = <b>' + un(fLens, 'cm', 3) + '</b>, power ' + fm(100 / fLens, 2) + ' D) spreads the light first so it focuses on the retina.' : kind === 'farsighted' ? 'A farsighted eye cannot focus close objects: the light would focus <b>behind</b> the retina. A <b>converging</b> lens (f = <b>' + un(fLens, 'cm', 3) + '</b>) makes a book at 25 cm look as if it were at the near point.' : 'A normal eye focuses from about 25 cm out to very far away by changing the shape of its lens.');
    };
    F.now(); return {};
  }
  function telescope(F, o) {
    var fo = num(o.f, 100), fe = num(o.f2, 5), c = F.canvas({ aspect: 2.2, narrow: 1.3 }), ang = 2;
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c);
      var s = (W0 - 80) / (fo + fe + fe * 2), x0 = 30, xo = x0 + 20, xe = xo + (fo + fe) * s, y0 = H0 / 2, hL = H0 * 0.35;
      line(ctx, 0, y0, W0, y0, k.axis, 1); line(ctx, xo, y0 - hL, xo, y0 + hL, k.waterLine, 3); line(ctx, xe, y0 - hL * 0.4, xe, y0 + hL * 0.4, k.waterLine, 3); circ(ctx, xo + fo * s, y0, 4, { fill: k.gold }); txt(ctx, 'shared focal point', xo + fo * s, y0 + 16, { align: 'center', size: 10.5, color: k.gold });
      var a = ang * DEG, yi = -fo * M.tan(a) * s; [-0.7, 0, 0.7].forEach(function (h) { var yl = y0 + h * hL * 0.8, pts = [[x0 - 20, yl - (xo - x0 + 20) * M.tan(a) * -1 * 0 + 20 * M.tan(a) * 0], [xo, yl], [xo + fo * s, y0 - yi * -1]]; pts[0][1] = yl - (xo - (x0 - 20)) * M.tan(a) * -1; pts[2] = [xo + fo * s, y0 + fo * M.tan(a) * s]; var u2 = (pts[2][1] - yl) / (fo * s), yE = pts[2][1] + u2 * fe * s; pts.push([xe, yE]); var out = M.tan(a) * fo / fe; pts.push([W0, yE + out * (W0 - xe)]); poly(ctx, pts, { color: k.gold, w: 1.6 }); });
      var Mang = fo / fe;
      F.desc('A refracting telescope with a ' + un(fo, 'cm') + ' objective and a ' + un(fe, 'cm') + ' eyepiece.');
      F.read('Light from a distant star arrives in parallel rays. The objective focuses it; the eyepiece, one focal length farther on, sends it out parallel again but <b>tilted more steeply</b>. Angular magnification = f<sub>o</sub>/f<sub>e</sub> = <b>' + fm(Mang, 1) + '×</b>. A telescope\'s main job is to <b>gather light</b> with a big objective; magnification comes second.');
    };
    F.now(); return {};
  }

  // ===================================================================================================
  // ph-refraction
  /* PM.snell(n1, n2, th1): refraction angle (deg) or null for total internal reflection; PM.fresnel: unpolarized reflectance */
  PM.snell = function (n1, n2, th) { var s = n1 / n2 * M.sin(th * DEG); return M.abs(s) > 1 ? null : M.asin(s) / DEG; };
  PM.fresnel = function (n1, n2, th) { var t1 = th * DEG, s = n1 / n2 * M.sin(t1); if (M.abs(s) > 1) return { R: 1, Rs: 1, Rp: 1 }; var t2 = M.asin(s), c1 = M.cos(t1), c2 = M.cos(t2), rs = (n1 * c1 - n2 * c2) / (n1 * c1 + n2 * c2), rp = (n2 * c1 - n1 * c2) / (n2 * c1 + n1 * c2); return { R: (rs * rs + rp * rp) / 2, Rs: rs * rs, Rp: rp * rp }; };
  PM.critical = function (n1, n2) { return n1 > n2 ? M.asin(n2 / n1) / DEG : null; };
  PM.cauchy = function (nm) { return 1.5046 + 4200 / (nm * nm); }; // crown glass (BK7-like): n(589 nm) ≈ 1.517
  PM.cauchyFlint = function (nm) { return 1.6 + 12000 / (nm * nm); }; // dense flint glass: n(589 nm) ≈ 1.635, n_F − n_C ≈ 0.023
  var NPRE = { air: 1.0, water: 1.33, glass: 1.5, diamond: 2.42 };
  R('ph-refraction', function (el, o) {
    var mode = pick(o.mode, ['ray', 'wavefront', 'prism', 'fiber', 'brewster', 'filters', 'materials'], 'ray');
    var F = frame(el, o, { ray: 'Light crossing a boundary: reflection and refraction', wavefront: 'Wavefronts crossing into a slower material', prism: 'A prism spreading white light into colors', fiber: 'Light trapped in a glass fiber', brewster: 'Brewster\'s angle', filters: 'Colored light and filters', materials: 'Reflection, absorption and transmission' }[mode]);
    var P = { n1: num(o.n1, mode === 'fiber' ? 1.0 : 1.0), n2: num(o.n2, mode === 'fiber' ? 1.5 : 1.5), th: num(o.angle, mode === 'brewster' ? 56.3 : 40), lam: num(o.lambda, 550) };
    if (mode === 'filters') return filters(F, o);
    if (mode === 'materials') return materials(F, o);
    var sh = { normal: F.on('normal', true), angles: F.on('angles', true), inten: F.on('intensity', mode === 'ray' || mode === 'brewster'), crit: F.on('critical', true, true) };
    var c = F.canvas({ aspect: mode === 'prism' || mode === 'fiber' ? 1.9 : 1.6, narrow: 1.05 }), A = mode === 'wavefront' ? F.anim({ tmax: undefined, scrub: false, autoplay: true, tick: function () { return true; }, dt: 0.05 }) : { t: 0 };
    if (F.live && (mode === 'ray' || mode === 'wavefront' || mode === 'brewster')) {
      var row = F.row(); F.slider(row, { label: 'Angle of incidence (from the normal)', min: 0, max: 89, step: 0.5, value: P.th, unit: '°', d: 1, input: function (v) { P.th = v; } });
      ['n1', 'n2'].forEach(function (key) { F.seg(row, { label: key === 'n1' ? 'Top material' : 'Bottom material', items: Object.keys(NPRE).map(function (q) { return [q, (key === 'n1' ? 'top: ' : 'bottom: ') + q]; }), value: Object.keys(NPRE).filter(function (q) { return NPRE[q] === P[key]; })[0] || 'glass', change: function (v) { P[key] = NPRE[v]; } }); });
    }
    if (F.live && mode === 'fiber') F.slider(null, { label: 'Entry angle', min: 0, max: 80, step: 1, value: P.th, unit: '°', d: 0, input: function (v) { P.th = v; } });
    var mp = null, hd = F.handles(F.live && (mode === 'ray' || mode === 'brewster') && o.drag !== false ? [{ name: 'light source', pos: function () { if (!mp) return null; var a = P.th * DEG; return [mp.cx - mp.L * M.sin(a), mp.cy - mp.L * M.cos(a)]; }, drag: function (px, py) { var a = M.atan2(mp.cx - px, mp.cy - py); P.th = clamp(M.round(a / DEG * 2) / 2, 0, 89); }, key: function (dx, dy, big) { P.th = clamp(P.th - dx * (big ? 5 : 1), 0, 89); } }] : [], { r: 26 });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c); var desc = '', read = '', st = [];
      if (mode === 'ray' || mode === 'brewster' || mode === 'wavefront') {
        var cx0 = W0 / 2, cy0 = H0 / 2, L = M.min(W0, H0) * 0.44; mp = { cx: cx0, cy: cy0, L: L };
        ctx.save(); ctx.fillStyle = P.n1 > 1.01 ? rgba(k.waterLine, 0.1 * P.n1) : k.bg; ctx.fillRect(0, 0, W0, cy0); ctx.fillStyle = rgba(k.waterLine, 0.1 + 0.1 * (P.n2 - 1)); ctx.fillRect(0, cy0, W0, H0 - cy0); ctx.restore(); line(ctx, 0, cy0, W0, cy0, k.ink, 1.5);
        txt(ctx, 'n₁ = ' + fm(P.n1, 2), 10, 16, { size: 12, weight: 700 }); txt(ctx, 'n₂ = ' + fm(P.n2, 2), 10, H0 - 14, { size: 12, weight: 700 });
        if (sh.normal) { line(ctx, cx0, 8, cx0, H0 - 8, k.muted, 1.2, [5, 4]); txt(ctx, 'normal', cx0 + 4, 12, { size: 10.5, color: k.muted }); F.tagAt(ctx, 'normal', cx0 - 16, 20); }
        var a1 = P.th * DEG, t2 = PM.snell(P.n1, P.n2, P.th), fr = PM.fresnel(P.n1, P.n2, P.th), tir = t2 == null, sx = cx0 - L * M.sin(a1), sy = cy0 - L * M.cos(a1);
        if (mode === 'wavefront') {
          // wavefronts are lines (x − cx0) sin θ + (y − cy0) cos θ = (n + ph) λ in each material; phases match along the boundary (Snell)
          var lam1 = 30, lam2 = lam1 * P.n1 / P.n2, ph = (A.t * 0.8) % 1, sA = M.sin(a1), cA = M.cos(a1);
          ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = rgba(k.acc, 0.75);
          for (var n = -40; n <= 40; n++) {
            ctx.beginPath(); var pen = false; for (var xx = 0; xx <= W0; xx += 3) { var yT = cy0 + ((n + ph) * lam1 - (xx - cx0) * sA) / cA; if (yT <= cy0 && yT >= 0) { if (pen) ctx.lineTo(xx, yT); else { ctx.moveTo(xx, yT); pen = true; } } else pen = false; } ctx.stroke();
            if (!tir) { var a2w = t2 * DEG, s2w = M.sin(a2w), c2w = M.cos(a2w); ctx.beginPath(); pen = false; for (xx = 0; xx <= W0; xx += 3) { var yB = cy0 + ((n + ph) * lam2 - (xx - cx0) * s2w) / c2w; if (yB >= cy0 && yB <= H0) { if (pen) ctx.lineTo(xx, yB); else { ctx.moveTo(xx, yB); pen = true; } } else pen = false; } ctx.stroke(); }
          }
          ctx.restore();
          arrow(ctx, cx0 - 60 * sA, cy0 - 60 * cA, cx0, cy0, { color: k.gold, w: 2.4 }); if (!tir) arrow(ctx, cx0, cy0, cx0 + 60 * M.sin(t2 * DEG), cy0 + 60 * M.cos(t2 * DEG), { color: k.gold, w: 2.4 });
          desc = 'Plane wavefronts crossing from n = ' + fm(P.n1, 2) + ' into n = ' + fm(P.n2, 2) + '.'; read = 'In the slower material the waves bunch up: λ₂ = λ₁·n₁/n₂ (' + fm(P.n1 / P.n2 * 100, 0) + '% as long), but the <b>frequency does not change</b>, because each wavefront that arrives makes exactly one wavefront that leaves. The fronts turn because one end slows down first.';
        }
        if (mode !== 'wavefront') {
          var rI = tir ? 1 : fr.R, tI = 1 - rI;
          arrow(ctx, sx, sy, cx0, cy0, { color: k.gold, w: 3.4 }); circ(ctx, sx, sy, 7, { fill: k.gold }); F.tagAt(ctx, 'inc', (sx + cx0) / 2 - 14, (sy + cy0) / 2 - 10);
          var rx = cx0 + L * M.sin(a1), ry = sy; arrow(ctx, cx0, cy0, rx, ry, { color: rgba(k.gold, sh.inten ? clamp(0.15 + rI, 0.15, 1) : 1), w: sh.inten ? 1 + 4 * rI : 2.6 }); F.tagAt(ctx, 'refl', (rx + cx0) / 2 + 14, (ry + cy0) / 2 - 10);
          if (!tir) { var a2 = t2 * DEG, tx = cx0 + L * M.sin(a2), ty = cy0 + L * M.cos(a2); arrow(ctx, cx0, cy0, tx, ty, { color: rgba(k.gold, sh.inten ? clamp(0.25 + tI, 0.25, 1) : 1), w: sh.inten ? 1 + 3.4 * tI : 2.6 }); F.tagAt(ctx, 'refr', (tx + cx0) / 2 + 14, (ty + cy0) / 2); }
          if (sh.angles) { arc(ctx, cx0, cy0, 44, -PI / 2 - a1, -PI / 2, k.red, 2); txt(ctx, 'θ₁ = ' + fm(P.th, 1) + '°', cx0 - 50 * M.sin(a1 / 2) - 6, cy0 - 50 * M.cos(a1 / 2) - 6, { align: 'right', size: 12, weight: 700, color: k.red, halo: true }); F.tagAt(ctx, 'th1', cx0 - 70 * M.sin(a1 / 2) - 40, cy0 - 70 * M.cos(a1 / 2)); if (!tir) { arc(ctx, cx0, cy0, 44, PI / 2, PI / 2 - t2 * DEG, k.blue, 2); txt(ctx, 'θ₂ = ' + (F.vals ? fm(t2, 1) + '°' : '?'), cx0 + 50 * M.sin(t2 * DEG / 2) + 6, cy0 + 50 * M.cos(t2 * DEG / 2) + 8, { size: 12, weight: 700, color: k.blue, halo: true }); F.tagAt(ctx, 'th2', cx0 + 70 * M.sin(t2 * DEG / 2) + 40, cy0 + 70 * M.cos(t2 * DEG / 2)); } }
          var thc = PM.critical(P.n1, P.n2); if (thc != null && sh.crit) { var ac = thc * DEG; line(ctx, cx0, cy0, cx0 - L * 0.8 * M.sin(ac), cy0 - L * 0.8 * M.cos(ac), k.purple, 1.2, [3, 4]); txt(ctx, 'critical ' + fm(thc, 1) + '°', cx0 - L * 0.8 * M.sin(ac) - 4, cy0 - L * 0.8 * M.cos(ac), { align: 'right', size: 11, color: k.purple, halo: true }); }
          if (mode === 'brewster') { var thB = M.atan(P.n2 / P.n1) / DEG; txt(ctx, 'Brewster angle ' + fm(thB, 1) + '°', W0 - 10, 16, { align: 'right', size: 12, weight: 700, color: k.purple }); for (var j = 1; j <= 3; j++) { var fx = cx0 + (rx - cx0) * j / 4, fy = cy0 + (ry - cy0) * j / 4; circ(ctx, fx, fy, 3, { fill: k.ink }); if (M.abs(P.th - thB) > 2) { var ang2 = M.atan2(ry - cy0, rx - cx0) + PI / 2; line(ctx, fx - 7 * M.cos(ang2), fy - 7 * M.sin(ang2), fx + 7 * M.cos(ang2), fy + 7 * M.sin(ang2), k.ink, 1.6); } }
            desc = 'Light reflecting from n = ' + fm(P.n2, 2) + ' at ' + fm(P.th, 1) + '°; Brewster\'s angle is ' + fm(thB, 1) + '°.'; read = 'At Brewster\'s angle, tan θ<sub>B</sub> = n₂/n₁, the reflected and refracted rays are at 90° and the reflection loses its in-plane (p) part completely: reflected light is fully polarized (dots only). R<sub>p</sub> = <b>' + fm(fr.Rp * 100, 2) + '%</b>, R<sub>s</sub> = <b>' + fm(fr.Rs * 100, 1) + '%</b>.'; st = [['R_p', fm(fr.Rp * 100, 2) + '%'], ['R_s', fm(fr.Rs * 100, 1) + '%']]; }
          else { desc = 'Light going from n = ' + fm(P.n1, 2) + ' to n = ' + fm(P.n2, 2) + ' at ' + fm(P.th, 1) + '° from the normal' + (F.quiet ? '.' : tir ? ': total internal reflection.' : '; it refracts to ' + fm(t2, 1) + '°.');
            read = tir ? '<b>Total internal reflection</b>: going into a material with a lower index, past the critical angle (sin θ<sub>c</sub> = n₂/n₁, θ<sub>c</sub> = <b>' + fm(thc, 1) + '°</b>), no light gets out.' : 'Snell\'s law n₁ sin θ₁ = n₂ sin θ₂ gives θ₂ = <b>' + fm(t2, 1) + '°</b>, with angles measured from the <b>normal</b>, not the surface. Light bends ' + (P.n2 > P.n1 ? 'toward' : P.n2 < P.n1 ? 'away from' : 'neither toward nor away from') + ' the normal. Reflected: <b>' + fm(fr.R * 100, 1) + '%</b>.' + (P.th < 0.5 ? ' Head-on (θ = 0), it goes straight through without bending.' : '');
            st = [['θ₁', fm(P.th, 1) + '°'], ['θ₂', tir ? 'none' : fm(t2, 1) + '°'], ['reflected', fm(rI * 100, 1) + '%'], ['critical', thc != null ? fm(thc, 1) + '°' : '—']]; }
        }
        hd.draw(ctx);
      } else if (mode === 'prism') {
        var px = W0 * 0.45, py = H0 * 0.52, s2 = M.min(W0, H0) * 0.32, apex = 60 * DEG, verts = [[px, py - s2], [px - s2 * M.sin(apex / 2) * 1.15, py + s2 * 0.75], [px + s2 * M.sin(apex / 2) * 1.15, py + s2 * 0.75]];
        poly(ctx, verts, { fill: rgba(k.waterLine, 0.15), color: k.waterLine, w: 2, close: true });
        // trace in 2-D: an entering ray hits the left face, refracts, crosses, refracts out of the right face
        function face(a, b) { return { a: a, b: b, n: (function () { var dx = b[0] - a[0], dy = b[1] - a[1], L2 = M.hypot(dx, dy); return [dy / L2, -dx / L2]; })() }; }
        var fL = face(verts[1], verts[0]), fR = face(verts[0], verts[2]);
        function hit(p, d, f) { var ex = f.b[0] - f.a[0], ey = f.b[1] - f.a[1], den = d[0] * ey - d[1] * ex; if (M.abs(den) < 1e-9) return null; var t = ((f.a[0] - p[0]) * ey - (f.a[1] - p[1]) * ex) / den; return [p[0] + d[0] * t, p[1] + d[1] * t]; }
        function refr(d, nrm, n1, n2) { var cosi = -(d[0] * nrm[0] + d[1] * nrm[1]); if (cosi < 0) { nrm = [-nrm[0], -nrm[1]]; cosi = -cosi; } var r = n1 / n2, k2 = 1 - r * r * (1 - cosi * cosi); if (k2 < 0) return null; var cs = M.sqrt(k2); return [r * d[0] + (r * cosi - cs) * nrm[0], r * d[1] + (r * cosi - cs) * nrm[1]]; }
        var src = [10, py + s2 * 0.32], dir0 = [M.cos(-0.22), M.sin(-0.22)], p1 = hit(src, dir0, fL);
        line(ctx, src[0], src[1], p1[0], p1[1], k.isDark ? '#ffffff' : '#555555', 3); txt(ctx, 'white light', 12, src[1] - 12, { size: 11, color: k.muted });
        [400, 430, 460, 490, 520, 550, 580, 610, 640, 670, 700].forEach(function (nm) { var n = PM.cauchyFlint(nm), d1 = refr(dir0, fL.n, 1, n); if (!d1) return; var p2 = hit(p1, d1, fR); if (!p2) return; line(ctx, p1[0], p1[1], p2[0], p2[1], wl2rgb(nm, 0.6), 1.5); var d2 = refr(d1, fR.n, n, 1); if (!d2) return; line(ctx, p2[0], p2[1], p2[0] + d2[0] * W0, p2[1] + d2[1] * W0, wl2rgb(nm), 2.2); });
        desc = 'White light entering a glass prism and leaving as a spread of colors.'; read = 'Flint glass has a slightly higher index for violet (n ≈ ' + fm(PM.cauchyFlint(400), 3) + ') than for red (n ≈ ' + fm(PM.cauchyFlint(700), 3) + '), so violet bends the most. The prism does not add color; it sorts the colors that were already in white light.';
      } else { // fiber
        var x0 = 40, x1 = W0 - 20, yc = H0 / 2, hw = H0 * 0.16, ncore = P.n2, nclad = num(o.nClad, 1.0), a3 = P.th * DEG, d0 = PM.snell(1, ncore, P.th), thc2 = PM.critical(ncore, nclad);
        ctx.save(); ctx.fillStyle = rgba(k.waterLine, 0.18); ctx.fillRect(x0, yc - hw, x1 - x0, 2 * hw); ctx.restore(); line(ctx, x0, yc - hw, x1, yc - hw, k.waterLine, 2); line(ctx, x0, yc + hw, x1, yc + hw, k.waterLine, 2);
        var ins = d0 * DEG, inner = 90 - d0, trapped = thc2 == null || inner > thc2, pts = [[x0 - 30 * M.cos(a3), yc - 30 * M.sin(a3) * -1 - 0], [x0, yc]], x = x0, y = yc, dy = M.tan(ins), up = -1;
        pts[0] = [x0 - 34, yc + 34 * M.tan(a3)];
        for (var b = 0; b < 40 && x < x1; b++) { var ny = up < 0 ? yc - hw : yc + hw, nx = x + M.abs(ny - y) / M.max(1e-6, dy); if (nx > x1) { pts.push([x1, y + up * (x1 - x) * dy]); break; } pts.push([nx, ny]); x = nx; y = ny; up = -up; if (!trapped) { pts.push([nx + 40, ny + (ny < yc ? -40 : 40) * 1.2]); break; } }
        poly(ctx, pts, { color: k.gold, w: 2.4 });
        desc = 'Light entering a glass fiber at ' + fm(P.th, 0) + '°.'; read = trapped ? 'Inside, the light meets the wall at ' + fm(inner, 1) + '° from the normal, more than the critical angle (' + (thc2 != null ? fm(thc2, 1) + '°' : '—') + '), so it is totally reflected again and again: the fiber guides it.' : 'At this steep entry angle the light hits the wall at less than the critical angle and leaks out.';
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });
  function filters(F, o) {
    var light = o.light || 'white', filt = arr(o.filter || ['red']), objCol = o.objectColor || 'red', c = F.canvas({ aspect: 2.3, narrow: 1.4 });
    var RGB = { white: [1, 1, 1], red: [1, 0, 0], green: [0, 1, 0], blue: [0, 0, 1], yellow: [1, 1, 0], cyan: [0, 1, 1], magenta: [1, 0, 1], black: [0, 0, 0] };
    if (F.live) { F.seg(null, { label: 'Light', items: [['white', 'White light'], ['red', 'Red light'], ['blue', 'Blue light']], value: light, change: function (v) { light = v; } }); F.seg(null, { label: 'Filter', items: [['none', 'No filter'], ['red', 'Red filter'], ['green', 'Green filter'], ['red,green', 'Red + green']], value: filt.join(','), change: function (v) { filt = v === 'none' ? [] : v.split(','); } }); }
    function css(v) { return 'rgb(' + v.map(function (q) { return M.round(255 * q); }).join(',') + ')'; }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c);
      var beam = RGB[light] || [1, 1, 1], y0 = H0 / 2, x = 20, seg = (W0 - 60) / (filt.length + 2);
      txt(ctx, light + ' light', x, y0 - 30, { size: 12, weight: 700 }); block(ctx, x, y0 - 12, seg - 10, 24, { fill: css(beam), color: k.grid, r: 4 }); x += seg;
      filt.forEach(function (fc) { var fv = RGB[fc] || [1, 1, 1]; block(ctx, x - 6, y0 - 40, 12, 80, { fill: css(fv), color: k.ink, r: 3 }); txt(ctx, fc + ' filter', x, y0 - 50, { align: 'center', size: 11 }); beam = beam.map(function (q, i) { return q * fv[i]; }); block(ctx, x + 10, y0 - 12, seg - 20, 24, { fill: beam.some(function (q) { return q > 0; }) ? css(beam) : (k.isDark ? '#000' : '#222'), color: k.grid, r: 4 }); x += seg; });
      var ob = RGB[objCol] || [1, 0, 0], seen = beam.map(function (q, i) { return q * ob[i]; }); circ(ctx, x + 30, y0, 30, { fill: seen.some(function (q) { return q > 0; }) ? css(seen) : '#111', color: k.ink, w: 2 }); txt(ctx, 'a ' + objCol + ' object looks ' + (seen.every(function (q) { return q === 0; }) ? 'black' : Object.keys(RGB).filter(function (n) { return RGB[n].join() === seen.join(); })[0] || 'colored'), x + 30, y0 + 44, { align: 'center', size: 11.5, weight: 700 });
      F.desc((light) + ' light through ' + (filt.length ? filt.join(' and ') + ' filter(s)' : 'no filter') + ' onto a ' + objCol + ' object.');
      F.read('A filter only <b>removes</b> colors: a red filter passes red and absorbs the rest; it adds nothing. Red then green passes nothing. A colored object reflects its own color and absorbs others, so under light without that color it looks dark.');
    };
    F.now(); return {};
  }
  function materials(F, o) {
    var c = F.canvas({ aspect: 2.4, narrow: 1.2 });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c);
      var items = [['mirror', 'reflects in one direction'], ['white paper', 'reflects in every direction'], ['black cloth', 'absorbs most light'], ['clear glass', 'transmits most light']], cw = W0 / 4, sy = H0 * 0.62;
      items.forEach(function (it, i) { var x = cw * (i + 0.5); block(ctx, x - cw * 0.35, sy, cw * 0.7, 12, { fill: i === 0 ? k.metal : i === 1 ? '#f8f8f4' : i === 2 ? '#1a1a1a' : rgba(k.waterLine, 0.3), color: k.ink, r: 2 }); arrow(ctx, x - 40, sy - 70, x, sy, { color: k.gold, w: 2.6 });
        if (i === 0) arrow(ctx, x, sy, x + 40, sy - 70, { color: k.gold, w: 2.6 }); else if (i === 1) [-60, -30, 0, 30, 60].forEach(function (a) { var r = a * DEG; arrow(ctx, x, sy, x + 34 * M.sin(r), sy - 34 * M.cos(r), { color: rgba(k.gold, 0.7), w: 1.6, head: 6 }); }); else if (i === 2) { arrow(ctx, x, sy, x + 12, sy - 20, { color: rgba(k.gold, 0.3), w: 1.2, head: 5 }); txt(ctx, 'warms up', x, sy + 26, { align: 'center', size: 10.5, color: k.eTh }); } else { arrow(ctx, x, sy + 12, x + 30, sy + 64, { color: k.gold, w: 2.4 }); arrow(ctx, x, sy, x + 14, sy - 26, { color: rgba(k.gold, 0.35), w: 1.2, head: 5 }); }
        txt(ctx, it[0], x, 16, { align: 'center', size: 12, weight: 800 }); wrapLines(ctx, it[1], cw - 8, W0 > 560 ? 10.5 : 9.5, 600).forEach(function (ln, li) { txt(ctx, ln, x, 32 + li * 12, { align: 'center', size: W0 > 560 ? 10.5 : 9.5, color: k.muted }); }); });
      F.desc('Light hitting a mirror, white paper, black cloth and clear glass.');
      F.read('Everything you can see reflects some light. A mirror reflects it in one direction (an image); white paper scatters it every which way, which is why you can see the paper from anywhere. Black cloth absorbs most of it and warms up; glass lets most through and reflects a little.');
    };
    F.now(); return {};
  }

  // ===================================================================================================
  // ph-interference. λ in nm; slit widths and spacings in μm; screen distance L in m.
  function sinc(x) { return M.abs(x) < 1e-9 ? 1 : M.sin(x) / x; }
  /* PM.slits(sinTh, p): relative intensity for N slits of spacing d and width a (N = 1: single slit; N = 2: double slit) */
  PM.slits = function (s, p) { var lam = p.lambda * 1e-9, b = PI * p.a * 1e-6 * s / lam, env = p.a > 0 ? M.pow(sinc(b), 2) : 1; if (p.N <= 1) return env; var ph = PI * p.d * 1e-6 * s / lam, den = M.sin(ph), arrF = M.abs(den) < 1e-9 ? 1 : M.pow(M.sin(p.N * ph) / (p.N * den), 2); return env * arrF; };
  /* PM.thinFilm(lam, t, nf, na, nb): reflectance at normal incidence (two-beam): flips come from the amplitude signs of r */
  PM.thinFilm = function (lam, t, nf, na, nb) { var r1 = (na - nf) / (na + nf), r2 = (nf - nb) / (nf + nb), d = 4 * PI * nf * t / lam, t1 = 1 - r1 * r1; return r1 * r1 + t1 * t1 * r2 * r2 + 2 * r1 * t1 * r2 * M.cos(d); };
  /* PM.J1(x): Bessel function of the first kind, order 1 (series) */
  PM.J1 = function (x) { var s = 0, term = x / 2; for (var m = 0; m < 40; m++) { if (m) term *= -(x * x / 4) / (m * (m + 1)); s += term; if (M.abs(term) < 1e-16 * M.abs(s)) break; } return s; };
  PM.airy = function (u) { return M.abs(u) < 1e-9 ? 1 : M.pow(2 * PM.J1(u) / u, 2); };
  function filmColor(t, nf, na, nb) { var X = 0, Y = 0, Z = 0, Y0 = 0; for (var l = 380; l <= 780; l += 5) { var R0 = PM.thinFilm(l, t, nf, na, nb), c0 = cie(l); X += R0 * c0[0]; Y += R0 * c0[1]; Z += R0 * c0[2]; Y0 += c0[1]; } X /= Y0; Y /= Y0; Z /= Y0; var r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z, g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z, b = 0.0557 * X - 0.2040 * Y + 1.0570 * Z, mx = M.max(r, g, b, 1e-6), sc = M.min(1, 0.9 / mx) * 3.5; function gm(v) { v = clamp(v * sc, 0, 1); v = v <= 0.0031308 ? 12.92 * v : 1.055 * M.pow(v, 1 / 2.4) - 0.055; return M.round(255 * clamp(v, 0, 1)); } return 'rgb(' + gm(r) + ',' + gm(g) + ',' + gm(b) + ')'; }
  R('ph-interference', function (el, o) {
    var mode = pick(o.mode, ['two-source', 'double', 'single', 'grating', 'thin-film', 'michelson', 'rayleigh', 'bragg', 'electrons'], 'double');
    var F = frame(el, o, { 'two-source': 'Two sources making interference', double: 'A double slit and its pattern', single: 'A single slit and its pattern', grating: 'A diffraction grating', 'thin-film': 'Thin-film interference', michelson: 'A Michelson interferometer', rayleigh: 'Two point sources at the resolution limit', bragg: 'Bragg reflection from crystal planes', electrons: 'Electrons through a double slit, one at a time' }[mode]);
    var P = { lambda: num(o.lambda, mode === 'bragg' ? 0.154 : 550), d: num(o.d, mode === 'grating' ? (o.lpmm ? 1000 / num(o.lpmm, 600) : 1.667) : 100), a: num(o.a, mode === 'single' ? 40 : mode === 'grating' ? 0.8 : 20), N: M.round(num(o.N, mode === 'grating' ? 12 : mode === 'single' ? 1 : 2)), L: num(o.L, 1), t: num(o.t, 300), nf: num(o.nFilm, 1.33), na: num(o.nAbove, 1), nb: num(o.nBelow, mode === 'thin-film' ? 1.0 : 1.5), D: num(o.D, 0.1), sep: num(o.sep, 1), pd: num(o.planeD, 0.28), shift: 0 };
    if (mode === 'single') P.N = 1; if (mode === 'double' || mode === 'electrons') P.N = 2;
    var sh = { waves: F.on('waves', true), path: F.on('path', true), pattern: F.on('pattern', true), env: F.on('envelope', mode === 'double' || mode === 'grating') };
    var c = F.canvas({ aspect: mode === 'two-source' ? 1.5 : 1.55, narrow: mode === 'two-source' ? 1.0 : 0.8 }), A = null, img = null, hits = [], R0 = rng(num(o.seed, 5));
    if (mode === 'two-source' || mode === 'electrons') A = F.anim({ tmax: undefined, scrub: false, autoplay: true, tick: function (h) { if (mode === 'electrons') { var n = M.max(1, M.round(h * 40)); for (var i = 0; i < n && hits.length < 4000; i++) fire(); } return true; }, dt: 0.05 });
    else A = { t: 0 };
    function fire() { var w = 2.5 * P.lambda * 1e-9 * P.L / (P.a * 1e-6); for (var tries = 0; tries < 200; tries++) { var y = (R0() * 2 - 1) * w, s = y / M.hypot(y, P.L); if (R0() < PM.slits(s, P)) { hits.push([y / w, R0()]); return; } } }
    if (F.live) {
      var row = F.row();
      if (['double', 'single', 'grating', 'two-source', 'thin-film', 'michelson', 'rayleigh', 'electrons'].indexOf(mode) >= 0 && mode !== 'thin-film') F.slider(row, { label: 'Wavelength λ', min: 400, max: 700, step: 5, value: P.lambda, unit: 'nm', d: 0, input: function (v) { P.lambda = v; hits = []; } });
      if (mode === 'double' || mode === 'two-source') F.slider(row, { label: mode === 'two-source' ? 'Source spacing (in λ)' : 'Slit spacing d', min: mode === 'two-source' ? 1 : 20, max: mode === 'two-source' ? 6 : 300, step: mode === 'two-source' ? 0.5 : 5, value: mode === 'two-source' ? num(o.d, 3) : P.d, unit: mode === 'two-source' ? '' : 'μm', d: 1, input: function (v) { if (mode === 'two-source') o.d = v; else P.d = v; } });
      if (mode === 'single' || mode === 'double') F.slider(row, { label: 'Slit width a', min: 5, max: 120, step: 1, value: P.a, unit: 'μm', d: 0, input: function (v) { P.a = v; } });
      if (mode === 'grating') { F.slider(row, { label: 'Lines per mm', min: 100, max: 1200, step: 50, value: 1000 / P.d, d: 0, input: function (v) { P.d = 1000 / v; } }); F.slider(row, { label: 'Slits lit', min: 2, max: 40, step: 1, value: P.N, d: 0, input: function (v) { P.N = v; } }); }
      if (mode === 'thin-film') { F.slider(row, { label: 'Film thickness t', min: 0, max: 1000, step: 5, value: P.t, unit: 'nm', d: 0, input: function (v) { P.t = v; } }); F.seg(row, { label: 'Below the film', items: [['1', 'air (soap film)'], ['1.5', 'glass (coating)']], value: String(P.nb), change: function (v) { P.nb = +v; } }); }
      if (mode === 'michelson') F.slider(row, { label: 'Mirror moved', min: 0, max: 2, step: 0.005, value: 0, unit: 'μm', d: 3, input: function (v) { P.shift = v; } });
      if (mode === 'rayleigh') F.slider(row, { label: 'Separation (in Rayleigh limits)', min: 0.3, max: 2.5, step: 0.05, value: P.sep, d: 2, input: function (v) { P.sep = v; } });
      if (mode === 'bragg') F.slider(row, { label: 'Glancing angle θ (from the planes)', min: 5, max: 60, step: 0.25, value: num(o.theta, 16), unit: '°', d: 2, input: function (v) { o.theta = v; } });
      if (mode === 'electrons') F.button(row, 'Start over', function () { hits = []; });
    }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, desc = '', read = '', st = []; bg(c);
      var col = wl2rgb(P.lambda), lamM = P.lambda * 1e-9;
      if (mode === 'two-source') {
        var sp = num(o.d, 3), lamPx = M.min(W0, H0) / 9, s1 = [W0 * 0.12, H0 / 2 - sp * lamPx / 2], s2 = [W0 * 0.12, H0 / 2 + sp * lamPx / 2], sc = 3, iw = M.ceil(W0 / sc), ih = M.ceil(H0 / sc);
        if (sh.waves) { if (!img || img.width !== iw || img.height !== ih) img = ctx.createImageData(iw, ih); var d = img.data, kw = TAU / lamPx, ph = A.t * 4, base = k.isDark ? [12, 24, 36] : [235, 243, 250], hi = k.isDark ? [116, 192, 252] : [28, 111, 214];
          for (var j = 0; j < ih; j++) for (var i = 0; i < iw; i++) { var x = i * sc, y = j * sc, r1 = M.hypot(x - s1[0], y - s1[1]), r2 = M.hypot(x - s2[0], y - s2[1]), v = (M.cos(kw * r1 - ph) + M.cos(kw * r2 - ph)) / 2, aa = (v + 1) / 2, q = (j * iw + i) * 4; d[q] = base[0] + (hi[0] - base[0]) * aa; d[q + 1] = base[1] + (hi[1] - base[1]) * aa; d[q + 2] = base[2] + (hi[2] - base[2]) * aa; d[q + 3] = 255; }
          var tmp = D.createElement('canvas'); tmp.width = iw; tmp.height = ih; tmp.getContext('2d').putImageData(img, 0, 0); ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(tmp, 0, 0, iw * sc, ih * sc); ctx.restore(); }
        [s1, s2].forEach(function (s0) { circ(ctx, s0[0], s0[1], 6, { fill: k.red, color: k.bg, w: 2 }); });
        var Pp = [W0 * 0.78, H0 * 0.3], r1p = M.hypot(Pp[0] - s1[0], Pp[1] - s1[1]) / lamPx, r2p = M.hypot(Pp[0] - s2[0], Pp[1] - s2[1]) / lamPx, dl = M.abs(r1p - r2p);
        if (sh.path) { line(ctx, s1[0], s1[1], Pp[0], Pp[1], k.gold, 1.8); line(ctx, s2[0], s2[1], Pp[0], Pp[1], k.gold, 1.8); circ(ctx, Pp[0], Pp[1], 6, { fill: k.gold }); pill(ctx, 'path difference ' + (F.vals ? fm(dl, 2) + ' λ' : '?'), Pp[0], Pp[1] - 20, { W: W0, size: 11.5 }); }
        desc = 'Two sources ' + fm(sp, 1) + ' wavelengths apart sending out waves in step.'; read = 'Where crests meet crests (path difference 0, λ, 2λ…) the waves add: bright bands. Where crests meet troughs (λ/2, 3λ/2…) they cancel: the still nodal lines. At P the path difference is <b>' + fm(dl, 2) + ' λ</b>: ' + (M.abs(dl - M.round(dl)) < 0.15 ? 'nearly whole, so bright.' : M.abs(dl - M.round(dl)) > 0.35 ? 'nearly a half, so dark.' : 'in between.');
      } else if (['double', 'single', 'grating', 'electrons'].indexOf(mode) >= 0) {
        var grat = mode === 'grating', sMax = grat ? 1 : M.min(0.99, 2.5 * lamM / (P.a * 1e-6)), yMax = grat ? 0 : P.L * M.tan(M.asin(sMax)), schemH = H0 * 0.42, gr = { x: 50, y: schemH + 18, w: W0 - 64, h: H0 - schemH - 44 };
        // schematic: light, slits, screen with the pattern
        var bx = W0 * 0.22, scrX = W0 - 70, cy0 = schemH / 2 + 6; ctx.save(); ctx.fillStyle = wl2rgb(P.lambda, 0.25); ctx.fillRect(10, cy0 - 26, bx - 10, 52); ctx.restore(); txt(ctx, fm(P.lambda, 0) + ' nm light', 14, cy0 - 34, { size: 11, color: k.muted });
        block(ctx, bx - 4, 6, 8, schemH - 6, { fill: k.ink, color: k.ink, r: 1 }); var nsl = grat ? 7 : P.N; for (var q = 0; q < nsl; q++) { var yy = cy0 + (q - (nsl - 1) / 2) * (grat ? 8 : 22); ctx.save(); ctx.fillStyle = k.bg; ctx.fillRect(bx - 5, yy - (grat ? 2 : 5), 10, grat ? 4 : 10); ctx.restore(); }
        var strip = { x: scrX, y: 6, w: 22, h: schemH - 6 }; for (var py = 0; py < strip.h; py++) { var yS = (py / strip.h - 0.5) * 2, s0 = grat ? yS * 0.99 : (yS * yMax) / M.hypot(yS * yMax, P.L), I0 = mode === 'electrons' ? 0 : PM.slits(s0, P); ctx.fillStyle = 'rgba(' + (function () { var m0 = /rgb\((\d+),(\d+),(\d+)\)/.exec(col); return m0 ? [m0[1], m0[2], m0[3]].join(',') : '255,255,255'; })() + ',' + M.pow(I0, 0.6) + ')'; ctx.fillRect(strip.x, strip.y + py, strip.w, 1); }
        ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 1.5; ctx.strokeRect(strip.x, strip.y, strip.w, strip.h); ctx.restore(); txt(ctx, 'screen', strip.x + 11, schemH + 6, { align: 'center', size: 10.5, color: k.muted });
        for (q = 0; q < 6; q++) line(ctx, bx + 6, cy0, scrX, 10 + q * (schemH - 20) / 5, wl2rgb(P.lambda, 0.18), 1);
        if (mode === 'electrons') { hits.forEach(function (hq) { ctx.fillStyle = k.isDark ? '#8ce99a' : '#2b8a3e'; ctx.fillRect(strip.x + hq[1] * strip.w, strip.y + (hq[0] + 1) / 2 * strip.h, 1.6, 1.6); }); }
        var xlab = grat ? 'θ (°)' : 'position on the screen (mm)', xr = grat ? 90 : yMax * 1000;
        var G = GP(ctx, gr, { xmin: -xr, xmax: xr, ymin: 0, ymax: 1.1, xlab: xlab, ylab: mode === 'electrons' ? 'electrons counted' : 'intensity', compact: true, yticks: false });
        G.frame();
        var fI = function (x) { var s0 = grat ? M.sin(x * DEG) : (x / 1000) / M.hypot(x / 1000, P.L); return PM.slits(s0, P); };
        if (mode === 'electrons') { var nb = 80, bins = new Array(nb).fill(0); hits.forEach(function (hq) { bins[M.min(nb - 1, M.floor((hq[0] + 1) / 2 * nb))]++; }); var bm = M.max(1, M.max.apply(null, bins)); bins.forEach(function (bq, i) { var x0 = -xr + 2 * xr * i / nb, x1 = x0 + 2 * xr / nb; ctx.save(); ctx.fillStyle = rgba(k.green, 0.6); ctx.fillRect(G.X(x0), G.Y(bq / bm), G.X(x1) - G.X(x0) - 0.5, G.Y(0) - G.Y(bq / bm)); ctx.restore(); }); if (hits.length > 300) G.plot(fI, k.ink, 1.4, [4, 3]); }
        else { G.fill(fI, -xr, xr, wl2rgb(P.lambda, 0.25)); G.plot(fI, k.acc, 2); if (sh.env && P.a > 0) G.plot(function (x) { var s0 = grat ? M.sin(x * DEG) : (x / 1000) / M.hypot(x / 1000, P.L); return M.pow(sinc(PI * P.a * 1e-6 * s0 / lamM), 2); }, k.gold, 1.4, [5, 4]); }
        // order labels
        if (P.N > 1 && mode !== 'electrons') { var lastX = -1e9, lab0 = []; for (var m = -6; m <= 6; m++) { var sm = m * lamM / (P.d * 1e-6); if (M.abs(sm) >= 1) continue; var xm = grat ? M.asin(sm) / DEG : P.L * M.tan(M.asin(sm)) * 1000; if (M.abs(xm) > xr) continue; var missing = P.a > 0 && M.abs(M.sin(PI * P.a * 1e-6 * sm / lamM)) < 0.02 && m !== 0; if (G.X(xm) - lastX < 40) continue; lastX = G.X(xm); txt(ctx, (missing ? '(' : '') + 'm = ' + m + (missing ? ')' : ''), G.X(xm), gr.y + 9, { align: 'center', size: 10, color: missing ? k.muted : k.ink, halo: true, haloColor: k.panelBg }); F.tagAt(ctx, 'm' + m, G.X(xm), gr.y + 26); } }
        else if (mode === 'single') { [-1, 1].forEach(function (m) { var sm = m * lamM / (P.a * 1e-6); if (M.abs(sm) < 1) { var xm = P.L * M.tan(M.asin(sm)) * 1000; G.vline(xm, k.red, [3, 3]); F.tagAt(ctx, 'min' + (m > 0 ? 1 : '-1'), G.X(xm), gr.y + 12); } }); }
        if (mode === 'double') { var fs = lamM * P.L / (P.d * 1e-6) * 1000, cw = 2 * lamM * P.L / (P.a * 1e-6) * 1000; desc = 'Light of ' + fm(P.lambda, 0) + ' nm through two slits ' + fm(P.d, 0) + ' μm apart, each ' + fm(P.a, 0) + ' μm wide, onto a screen ' + un(P.L, 'm') + ' away.'; read = 'Bright fringes where d sin θ = mλ, about <b>' + un(fs, 'mm', 3) + '</b> apart on the screen (λL/d). The single-slit envelope (dashed) sets how bright they are; where its zeros land on a bright fringe, that order is missing.'; st = [['fringe spacing', un(fs, 'mm', 3)], ['central envelope width', un(cw, 'mm', 3)]]; }
        else if (mode === 'single') { var cw2 = 2 * lamM * P.L / (P.a * 1e-6) * 1000; desc = 'Light of ' + fm(P.lambda, 0) + ' nm through one slit ' + fm(P.a, 0) + ' μm wide.'; read = 'Dark where a sin θ = mλ (m = ±1, ±2…). The central bright band is <b>' + un(cw2, 'mm', 3) + '</b> wide: a <b>narrower slit makes it wider</b>, since the light spreads more.'; st = [['central band width', un(cw2, 'mm', 3)]]; }
        else if (mode === 'grating') { var ords = []; for (var m2 = 1; m2 <= 6; m2++) { var s3 = m2 * lamM / (P.d * 1e-6); if (s3 < 1) ords.push('m = ' + m2 + ': ' + fm(M.asin(s3) / DEG, 1) + '°'); } desc = 'A grating with ' + fm(1000 / P.d, 0) + ' lines per mm lit by ' + fm(P.lambda, 0) + ' nm light.'; read = 'd is the spacing between lines: d = 1/(' + fm(1000 / P.d, 0) + ' per mm) = <b>' + un(P.d, 'μm', 3) + '</b>. Maxima where d sin θ = mλ: ' + ords.join(', ') + '. More slits make the maxima sharper, not more spread out.'; st = [['spacing d', un(P.d, 'μm', 3)]]; }
        else { desc = 'Electrons sent one at a time through two slits.'; read = 'Each electron lands at one spot, seemingly at random. After many (' + hits.length + ' so far) the spots build the same interference pattern as light: each electron is guided by a wave that went through both slits.'; st = [['electrons', String(hits.length)]]; }
      } else if (mode === 'thin-film') {
        var fy0 = H0 * 0.32, fh = M.max(14, clamp(P.t / 1000, 0.05, 1) * H0 * 0.3), x0 = W0 * 0.08, xw = W0 * 0.5;
        ctx.save(); ctx.fillStyle = rgba(k.waterLine, 0.2); ctx.fillRect(x0, fy0, xw, fh); ctx.fillStyle = P.nb > 1.2 ? rgba(k.muted, 0.25) : k.bg; ctx.fillRect(x0, fy0 + fh, xw, H0 * 0.25); ctx.restore(); line(ctx, x0, fy0, x0 + xw, fy0, k.ink, 1.5); line(ctx, x0, fy0 + fh, x0 + xw, fy0 + fh, k.ink, 1.5);
        txt(ctx, 'n = ' + fm(P.na, 2) + ' (air)', x0 + 4, fy0 - 50, { size: 11, color: k.muted }); txt(ctx, 'film n = ' + fm(P.nf, 2), x0 + xw - 6, fy0 + fh / 2, { size: 11, color: k.ink, weight: 700, align: 'right' }); txt(ctx, 'n = ' + fm(P.nb, 2) + (P.nb > 1.2 ? ' (glass)' : ' (air)'), x0 + xw - 6, fy0 + fh + 16, { size: 11, color: k.muted, align: 'right' });
        var ax = x0 + xw * 0.25, ang = 0.35; line(ctx, ax - 70 * M.sin(ang), fy0 - 70 * M.cos(ang), ax, fy0, k.gold, 2.2); line(ctx, ax, fy0, ax + 70 * M.sin(ang), fy0 - 70 * M.cos(ang), k.gold, 2.2); txt(ctx, 'ray 1', ax + 70 * M.sin(ang) + 4, fy0 - 70 * M.cos(ang), { size: 11, color: k.gold, weight: 700 }); F.tagAt(ctx, 'ray1', ax + 70 * M.sin(ang) + 40, fy0 - 70 * M.cos(ang));
        var ang2 = M.asin(M.sin(ang) / P.nf), bxx = ax + fh * M.tan(ang2), cxx = bxx + fh * M.tan(ang2); line(ctx, ax, fy0, bxx, fy0 + fh, k.gold, 1.6); line(ctx, bxx, fy0 + fh, cxx, fy0, k.gold, 1.6); line(ctx, cxx, fy0, cxx + 70 * M.sin(ang), fy0 - 70 * M.cos(ang), k.orange, 2.2); txt(ctx, 'ray 2', cxx + 70 * M.sin(ang) + 4, fy0 - 70 * M.cos(ang) + 14, { size: 11, color: k.orange, weight: 700 }); F.tagAt(ctx, 'ray2', cxx + 70 * M.sin(ang) + 40, fy0 - 70 * M.cos(ang) + 14);
        var flip1 = P.nf > P.na, flip2 = P.nb > P.nf; txt(ctx, flip1 ? 'half-wave flip' : 'no flip', ax - 6, fy0 + 12, { align: 'right', size: 10.5, color: k.red, weight: 700, halo: true }); txt(ctx, flip2 ? 'half-wave flip' : 'no flip', bxx, fy0 + fh + 12, { align: 'center', size: 10.5, color: k.red, weight: 700, halo: true });
        var gr2 = { x: W0 * 0.66, y: 22, w: W0 * 0.31, h: H0 * 0.52 }, G2 = GP(ctx, gr2, { xmin: 380, xmax: 750, ymin: 0, ymax: M.max(0.16, PM.thinFilm(550, 0, P.nf, P.na, P.nb) * 3), xlab: 'λ (nm)', ylab: 'reflected', compact: true, yticks: false, xstep: 100 }).frame(); for (var l = 380; l < 750; l += 2) { ctx.fillStyle = wl2rgb(l, 0.35); ctx.fillRect(G2.X(l), G2.Y(0) - 4, G2.X(l + 2) - G2.X(l), 4); } G2.plot(function (l2) { return PM.thinFilm(l2, P.t, P.nf, P.na, P.nb); }, k.acc, 2.2);
        var sw = filmColor(P.t, P.nf, P.na, P.nb); rrect(ctx, gr2.x, gr2.y + gr2.h + 30, gr2.w, H0 - gr2.y - gr2.h - 40, 8); ctx.fillStyle = sw; ctx.fill(); ctx.strokeStyle = k.grid; ctx.stroke(); txt(ctx, 'color seen in reflection', gr2.x + gr2.w / 2, gr2.y + gr2.h + 22, { align: 'center', size: 10.5, color: k.muted });
        var lamIn = P.lambda / P.nf; desc = 'A film ' + fm(P.t, 0) + ' nm thick (n = ' + fm(P.nf, 2) + ') on ' + (P.nb > 1.2 ? 'glass' : 'air') + '.'; read = 'Ray 2 travels an extra 2t = ' + un(2 * P.t, 'nm', 3) + ' inside the film, where the wavelength is shorter (λ/n). ' + (flip1 !== flip2 ? 'Only one reflection flips, so they add when 2nt = (m + ½)λ.' : 'Both or neither reflection flips, so they add when 2nt = mλ.') + ' Colors that add up are what you see.';
        void lamIn;
      } else if (mode === 'michelson') {
        var cx1 = W0 * 0.3, cy1 = H0 * 0.55, arm = M.min(W0 * 0.22, H0 * 0.38); line(ctx, 20, cy1, cx1, cy1, wl2rgb(P.lambda), 3); line(ctx, cx1 - 18, cy1 + 18, cx1 + 18, cy1 - 18, k.ink, 3); line(ctx, cx1, cy1, cx1 + arm + P.shift * 8, cy1, wl2rgb(P.lambda, 0.7), 2); line(ctx, cx1, cy1, cx1, cy1 - arm, wl2rgb(P.lambda, 0.7), 2); line(ctx, cx1, cy1, cx1, cy1 + arm * 0.8, wl2rgb(P.lambda, 0.7), 2);
        block(ctx, cx1 + arm + P.shift * 8, cy1 - 22, 8, 44, { fill: k.metal, color: k.ink, r: 1 }); block(ctx, cx1 - 22, cy1 - arm - 8, 44, 8, { fill: k.metal, color: k.ink, r: 1 }); txt(ctx, 'movable mirror', cx1 + arm + 14, cy1 - 30, { size: 11, color: k.muted }); txt(ctx, 'detector', cx1, cy1 + arm * 0.8 + 14, { align: 'center', size: 11, color: k.muted });
        var fx = W0 * 0.75, fyc = H0 * 0.48, fr = M.min(W0 * 0.2, H0 * 0.4), phase0 = 4 * PI * P.shift * 1e-6 / lamM; for (var rr = fr; rr > 0; rr -= 1.5) { var Ir = M.pow(M.cos(phase0 / 2 + 0.0006 * rr * rr), 2); circ(ctx, fx, fyc, rr, { color: wl2rgb(P.lambda, Ir), w: 1.6 }); }
        var nFr = 2 * P.shift * 1e-6 / lamM; desc = 'A Michelson interferometer with one mirror moved ' + un(P.shift, 'μm', 3) + '.'; read = 'Moving the mirror by d changes that arm\'s round trip by 2d, so one fringe passes for every <b>λ/2</b> of mirror motion: ' + (F.vals ? '<b>' + fm(nFr, 2) + '</b> fringes so far.' : 'count them.') + ' This measures distances smaller than a wavelength.'; st = [['fringes passed', fm(nFr, 2)]];
      } else if (mode === 'rayleigh') {
        var thR = 1.22 * lamM / P.D, gr3 = { x: 50, y: H0 * 0.45, w: W0 - 64, h: H0 * 0.55 - 30 }, half = P.sep / 2, uS = 3.8317 / 1.22;
        var G3 = GP(ctx, gr3, { xmin: -2.5, xmax: 2.5, ymin: 0, ymax: 1.4, xlab: 'angle (in units of 1.22 λ/D)', ylab: 'intensity', compact: true, yticks: false }).frame();
        var f1 = function (x) { return PM.airy((x + half) * 1.22 * uS); }, f2 = function (x) { return PM.airy((x - half) * 1.22 * uS); }; G3.plot(f1, rgba(k.blue, 0.6), 1.6, [5, 4]); G3.plot(f2, rgba(k.red, 0.6), 1.6, [5, 4]); G3.plot(function (x) { return f1(x) + f2(x); }, k.acc, 2.4);
        var bx2 = W0 / 2, by2 = H0 * 0.22, sc2 = M.min(W0, H0) * 0.12; [[-half, k.blue], [half, k.red]].forEach(function (q2) { var gg = ctx.createRadialGradient(bx2 + q2[0] * sc2, by2, 0, bx2 + q2[0] * sc2, by2, sc2 * 0.9); gg.addColorStop(0, 'rgba(255,255,255,0.95)'); gg.addColorStop(0.35, 'rgba(255,255,255,0.35)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.save(); ctx.globalCompositeOperation = k.isDark ? 'lighter' : 'source-over'; ctx.fillStyle = k.isDark ? gg : 'rgba(0,0,0,0)'; ctx.fillRect(bx2 - 2 * sc2, by2 - sc2, 4 * sc2, 2 * sc2); ctx.restore(); circ(ctx, bx2 + q2[0] * sc2, by2, sc2 * 0.45, { fill: rgba(q2[1], 0.35), color: q2[1], w: 1.5 }); });
        desc = 'Two point sources ' + fm(P.sep, 2) + ' Rayleigh limits apart, seen through an aperture of ' + un(P.D * 100, 'cm', 3) + '.'; read = 'Each point makes a blurred spot (an Airy pattern) because the light diffracts through the opening. They are just resolved when one\'s center sits on the other\'s first dark ring: θ = 1.22 λ/D = <b>' + un(thR / DEG * 3600, 'arcsec', 3) + '</b>. ' + (P.sep < 1 ? 'Closer than that, they blur into one: more magnification cannot separate them.' : 'Here they can be told apart.'); st = [['Rayleigh limit', un(thR / DEG * 3600, '″', 3)]];
      } else { // bragg
        var th = num(o.theta, 16), d0 = P.pd, lam = P.lambda, rows = 5, rx0 = 30, ry0 = H0 * 0.3, dsp = M.min(34, H0 * 0.08), cols2 = 14, dx2 = (W0 * 0.6 - rx0) / cols2;
        for (var rI = 0; rI < rows; rI++) for (var cI = 0; cI < cols2; cI++) circ(ctx, rx0 + cI * dx2 + (rI % 2) * 0, ry0 + rI * dsp, 4, { fill: k.muted });
        var tr = th * DEG, hx = rx0 + cols2 * dx2 / 2; [0, 1].forEach(function (rI2) { var py2 = ry0 + rI2 * dsp, sx = hx + (rI2 ? dsp / M.tan(tr) * 0 : 0); line(ctx, sx - 140 * M.cos(tr), py2 - 140 * M.sin(tr), sx, py2, wl2rgb(550), 2); line(ctx, sx, py2, sx + 140 * M.cos(tr), py2 - 140 * M.sin(tr), wl2rgb(550), 2); F.tagAt(ctx, 'ray' + (rI2 + 1), sx + 150 * M.cos(tr), py2 - 150 * M.sin(tr)); });
        arc(ctx, hx, ry0, 40, PI, PI + tr, k.gold, 1.6); txt(ctx, 'θ', hx - 48, ry0 - 10, { size: 13, italic: true, serif: true, color: k.gold }); txt(ctx, 'd', rx0 - 12, ry0 + dsp / 2, { size: 13, italic: true, serif: true, color: k.ink, align: 'right' });
        var gr4 = { x: W0 * 0.66, y: 20, w: W0 * 0.31, h: H0 - 50 }, G4 = GP(ctx, gr4, { xmin: 0, xmax: 90, ymin: 0, ymax: 1.1, xlab: 'θ (°)', ylab: 'reflected', compact: true, yticks: false, xstep: 30 }).frame(); G4.plot(function (x) { var ph = 2 * PI * 2 * d0 * M.sin(x * DEG) / lam, Np = 12, s0 = M.sin(ph / 2); return M.abs(s0) < 1e-9 ? 1 : M.pow(M.sin(Np * ph / 2) / (Np * s0), 2); }, k.acc, 2); G4.vline(th, k.gold, [4, 3]);
        var ords = []; for (var m3 = 1; m3 <= 4; m3++) { var s4 = m3 * lam / (2 * d0); if (s4 < 1) ords.push(fm(M.asin(s4) / DEG, 1) + '°'); }
        desc = 'X-rays (' + un(lam, 'nm', 3) + ') reflecting from crystal planes ' + un(d0, 'nm', 3) + ' apart at ' + fm(th, 1) + '°.'; read = 'The ray from the lower plane travels 2d sin θ farther, with θ measured <b>from the planes</b> (not the normal). Strong reflection when 2d sin θ = mλ: at ' + ords.join(', ') + '.'; st = [['2d sin θ', un(2 * d0 * M.sin(th * DEG), 'nm', 3)], ['in wavelengths', fm(2 * d0 * M.sin(th * DEG) / lam, 2)]];
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-spectrum. Line lists (nm, air wavelengths of the strong visible lines, NIST Atomic Spectra Database).
  var LINES = {
    H: [656.28, 486.13, 434.05, 410.17], He: [447.15, 471.31, 492.19, 501.57, 587.56, 667.82, 706.52], Na: [588.995, 589.592],
    Hg: [404.66, 435.83, 546.07, 576.96, 579.07], Ne: [585.25, 588.19, 594.48, 597.55, 603.0, 607.43, 609.62, 614.31, 616.36, 621.73, 626.65, 633.44, 638.3, 640.22, 650.65, 659.9, 692.95, 703.24]
  };
  /* PM.hLevel(n): hydrogen level in eV (Bohr); PM.photonNm(dE): wavelength (nm) of a photon of energy dE (eV), hc = 1239.84 eV·nm */
  PM.hLevel = function (n) { return -13.6057 / (n * n); };
  PM.photonNm = function (dE) { return HC_EVNM / M.abs(dE); };
  /* PM.saha(T, Pe): hydrogen ionization (fraction ionized) and the fraction in n = 2, with electron pressure Pe (N/m²) */
  PM.hydrogenPop = function (T, Pe) { var kT = KB * T, ne = (Pe || 20) / kT, chi = 13.6057 * QE, S = (2 * 1 / (ne * 2)) * M.pow(TAU * ME * kT / (H * H), 1.5) * M.exp(-chi / kT), fion = S / (1 + S), Z = 0, g; for (var n = 1; n <= 6; n++) { g = 2 * n * n; Z += g * M.exp(-(13.6057 - 13.6057 / (n * n)) * QE / kT); } var f2 = 8 * M.exp(-10.2043 * QE / kT) / Z; return { ion: fion, n2: (1 - fion) * f2 }; };
  var BANDS = [['gamma', 1e-15, 1e-11], ['X-ray', 1e-11, 1e-8], ['ultraviolet', 1e-8, 4e-7], ['visible', 4e-7, 7e-7], ['infrared', 7e-7, 1e-3], ['microwave', 1e-3, 0.3], ['radio', 0.3, 1e4]];
  var CLASSES = [['O', 30000, 50000, 'ionized He'], ['B', 10000, 30000, 'neutral He'], ['A', 7500, 10000, 'H strongest'], ['F', 6000, 7500, 'H, Ca⁺'], ['G', 5200, 6000, 'Ca⁺, metals'], ['K', 3700, 5200, 'metals'], ['M', 2400, 3700, 'TiO molecules']];
  R('ph-spectrum', function (el, o) {
    var mode = pick(o.mode, ['ruler', 'lines', 'kirchhoff', 'levels', 'bohr', 'shift', 'classes', 'populations'], 'ruler');
    var F = frame(el, o, { ruler: 'The electromagnetic spectrum', lines: 'Emission and absorption line spectra', kirchhoff: 'Kirchhoff\'s three kinds of spectra', levels: 'Energy levels and the photons from jumps between them', bohr: 'The Bohr model of hydrogen', shift: 'Spectral lines shifted by motion', classes: 'Spectral classes O to M', populations: 'Hydrogen\'s level populations against temperature' }[mode]);
    var c = F.canvas({ aspect: mode === 'ruler' ? 2.2 : mode === 'lines' || mode === 'shift' ? 2.0 : 1.6, narrow: mode === 'ruler' ? 1.1 : 1.0 }), mp = null;
    var lam = num(o.lambda, 550) * 1e-9, els = arr(o.elements || ['H', 'He', 'Na', 'Hg', 'Ne']).filter(function (e) { return LINES[e]; }), lv = o.levels ? arr(o.levels).map(num) : null, trans = arr(o.transitions || [[3, 2], [4, 2], [5, 2]]).map(function (q) { return [num(q[0], 3), num(q[1], 2)]; }), T = num(o.T, 9500), vks = num(o.v, 3000);
    var A = mode === 'bohr' ? F.anim({ tmax: 3, loop: true, rate: 1, autoplay: true, dt: 0.1 }) : { t: 0 };
    if (F.live && mode === 'shift') F.slider(null, { label: 'Speed (+ away)', min: -30000, max: 30000, step: 500, value: vks, unit: 'km/s', d: 0, input: function (v) { vks = v; } });
    if (F.live && mode === 'populations') F.slider(null, { label: 'Temperature', min: 3000, max: 30000, step: 100, value: T, unit: 'K', d: 0, input: function (v) { T = v; } });
    var lsel = null, lfoc = null;
    if (F.live && mode === 'ruler') F.handles([{ name: 'wavelength marker', pos: function () { return mp ? [mp.X(lam), mp.y0] : null; }, drag: function (px) { lam = mp.inv(px); }, key: function (dx, dy, big) { lam *= M.pow(10, (dx || dy) * (big ? 0.5 : 0.05)); lam = clamp(lam, 1e-14, 1e3); } }], { r: 24 });
    if (F.live && mode === 'levels') { c.cv.tabIndex = 0; V.drag(c.cv, { hit: function (px, py) { if (!mp) return null; var best = null, bd = 14; mp.lv.forEach(function (L, i) { var d = M.abs(mp.Y(L) - py); if (d < bd && px > mp.x0 && px < mp.x1) { bd = d; best = i; } }); return best; }, start: pickLevel, move: function () { }, end: function () { } });
      var kf = 1; c.cv.addEventListener('keydown', function (e) { var n = mp ? mp.lv.length : 6; if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { kf = clamp(kf + (e.key === 'ArrowUp' ? 1 : -1), 0, n - 1); lfoc = kf; F.say('Level n = ' + (kf + 1) + (lsel != null ? ', first level n = ' + (lsel + 1) : '')); F.now(); e.preventDefault(); } else if (e.key === 'Enter' || e.key === ' ') { pickLevel(kf); F.say(lsel != null ? 'Picked n = ' + (kf + 1) + '; pick a second level' : 'Added a jump; ' + trans.length + ' jumps shown'); e.preventDefault(); } }); }
    function pickLevel(i) { if (lsel == null) { lsel = i; } else if (lsel !== i) { trans.push([M.max(lsel, i) + 1, M.min(lsel, i) + 1]); if (trans.length > 8) trans.shift(); lsel = null; } else lsel = null; F.now(); }
    function strip(ctx, k, x, y, w, h, lines, absorb, lo, hi) { for (var px = 0; px < w; px++) { var l = lo + (hi - lo) * px / w; ctx.fillStyle = absorb ? wl2rgb(l) : '#05070a'; ctx.fillRect(x + px, y, 1.2, h); } ctx.strokeStyle = k.grid; ctx.strokeRect(x, y, w, h); lines.forEach(function (l, i) { if (l < lo || l > hi) return; var px = x + (l - lo) / (hi - lo) * w; ctx.fillStyle = absorb ? '#000' : wl2rgb(l); ctx.fillRect(px - 1, y, 2.4, h); void i; }); }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, desc = '', read = '', st = []; bg(c);
      if (mode === 'ruler') {
        var x0 = 20, x1 = W0 - 20, lmin = 1e-13, lmax = 1e3, X = function (l) { return x0 + (M.log10(l) - M.log10(lmin)) / (M.log10(lmax) - M.log10(lmin)) * (x1 - x0); }, y0 = H0 * 0.42; mp = { X: X, y0: y0, inv: function (px) { return M.pow(10, M.log10(lmin) + (px - x0) / (x1 - x0) * (M.log10(lmax) - M.log10(lmin))); } };
        BANDS.forEach(function (b, i) { var a = X(M.max(lmin, b[1])), bb = X(M.min(lmax, b[2])); if (b[0] === 'visible') { for (var px = a; px < bb; px++) { ctx.fillStyle = wl2rgb(400 + 300 * (px - a) / (bb - a)); ctx.fillRect(px, y0 - 24, 1.5, 48); } } else { ctx.fillStyle = rgba(i % 2 ? k.acc : k.purple, 0.16); ctx.fillRect(a, y0 - 24, bb - a, 48); } txt(ctx, W0 > 560 ? b[0] : ({ gamma: 'γ', 'X-ray': 'X', ultraviolet: 'UV', infrared: 'IR', microwave: 'μwave' })[b[0]] || b[0], (a + bb) / 2, b[0] === 'visible' ? y0 - 34 : y0, { align: 'center', size: W0 > 560 ? 11.5 : 10, weight: 700, color: k.ink, halo: true }); F.tagAt(ctx, 'band-' + (b[0] === 'X-ray' ? 'xray' : b[0]), (a + bb) / 2, y0 + 36); });
        for (var e = -12; e <= 3; e += W0 > 560 ? 1 : 3) { var px2 = X(M.pow(10, e)); line(ctx, px2, y0 + 24, px2, y0 + 30, k.axis, 1); txt(ctx, '10' + sup(e), px2, y0 + 40, { align: 'center', size: 10, color: k.muted }); }
        txt(ctx, 'wavelength (m) →', x1, y0 + (W0 > 560 ? 56 : 72), { align: 'right', size: 11, color: k.muted }); txt(ctx, '← higher frequency and photon energy', x0, y0 + 56, { size: 11, color: k.muted });
        var ex = [['FM radio', 3], ['microwave oven', 0.122], ['body heat', 1e-5], ['sunburn UV', 3e-7], ['dental X-ray', 3e-11]]; ex.forEach(function (q, i) { var px = X(q[1]); line(ctx, px, y0 - 24, px, y0 - 50 - (i % 2) * 14, k.muted, 1); txt(ctx, q[0], px, y0 - 56 - (i % 2) * 14, { align: 'center', size: 10, color: k.muted, halo: true }); });
        var mx = X(lam); line(ctx, mx, y0 - 30, mx, y0 + 30, k.red, 2.5); knob(ctx, mx, y0, k.red, 7);
        var f = C0 / lam, Eev = HC_EVNM / (lam * 1e9), band = BANDS.filter(function (b) { return lam >= b[1] && lam < b[2]; })[0];
        txt(ctx, 'λ = ' + un(lam, 'm', 3) + '   f = ' + un(f, 'Hz', 3) + '   E = ' + un(Eev, 'eV', 3), W0 / 2, H0 - 12, { align: 'center', size: 12, weight: 700, color: k.ink });
        desc = 'The electromagnetic spectrum on a log scale from gamma rays to radio, with a marker at ' + un(lam, 'm', 3) + ' (' + (band ? band[0] : '') + ').'; read = 'All of these are light, moving at c: only the wavelength differs. f = c/λ and E = hf, so shorter wavelengths mean higher frequency and more energetic photons. Radio waves are light, not sound. (Band edges are approximate.)'; st = [['λ', un(lam, 'm', 3)], ['f', un(f, 'Hz', 3)], ['photon energy', un(Eev, 'eV', 3)], ['band', band ? band[0] : '—']];
      } else if (mode === 'lines' || mode === 'shift') {
        var lo = 380, hi = 720, sx = 70, sw = W0 - sx - 14, rows = mode === 'shift' ? ['rest', 'shift'] : ['continuous'].concat(els), rh = M.min(34, (H0 - 40) / rows.length - 8);
        rows.forEach(function (r, i) { var y = 10 + i * (rh + 8); txt(ctx, r === 'continuous' ? 'hot solid' : r === 'rest' ? 'H at rest' : r === 'shift' ? 'H moving' : r, sx - 6, y + rh / 2, { align: 'right', size: 11.5, weight: 700 }); if (r === 'continuous') strip(ctx, k, sx, y, sw, rh, [], true, lo, hi); else if (r === 'shift') strip(ctx, k, sx, y, sw, rh, LINES.H.map(function (l) { return PM.redshift(l, vks); }), true, lo, hi); else if (r === 'rest') strip(ctx, k, sx, y, sw, rh, LINES.H, true, lo, hi); else strip(ctx, k, sx, y, sw, rh, LINES[r], o.absorb === true, lo, hi); F.tagAt(ctx, 'line' + i, sx + sw + 4, y + rh / 2); });
        for (var t = 400; t <= 700; t += 50) txt(ctx, String(t), sx + (t - lo) / (hi - lo) * sw, H0 - 12, { align: 'center', size: 10, color: k.muted }); txt(ctx, 'nm', W0 - 10, H0 - 12, { align: 'right', size: 10, color: k.muted });
        desc = mode === 'shift' ? 'Hydrogen absorption lines at rest and from a source moving at ' + un(vks, 'km/s') + '.' : 'Emission line spectra of ' + els.join(', ') + ' under a continuous spectrum.'; read = mode === 'shift' ? 'All the lines move by the same fraction Δλ/λ = v/c, so the pattern still identifies hydrogen.' : 'Each element emits its own set of wavelengths, a fingerprint fixed by its energy levels. A cool gas of that element in front of a hot source absorbs <b>the same</b> wavelengths, leaving dark lines.';
      } else if (mode === 'kirchhoff') {
        var cx0 = W0 * 0.32, cy0 = H0 * 0.5; var gg = ctx.createRadialGradient(cx0, cy0, 2, cx0, cy0, 40); gg.addColorStop(0, '#fff8d6'); gg.addColorStop(1, 'rgba(255,200,80,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx0, cy0, 40, 0, TAU); ctx.fill(); circ(ctx, cx0, cy0, 16, { fill: '#ffd479', color: '#e8590c', w: 2 }); txt(ctx, 'hot, dense source', cx0, cy0 + 50, { align: 'center', size: 11 });
        ctx.save(); ctx.fillStyle = rgba(k.teal, 0.2); ctx.beginPath(); ctx.ellipse(cx0 + W0 * 0.2, cy0, 40, 60, 0, 0, TAU); ctx.fill(); ctx.restore(); txt(ctx, 'cool thin gas', cx0 + W0 * 0.2, cy0 + 72, { align: 'center', size: 11 });
        var sx2 = W0 * 0.7, sw2 = W0 * 0.28, sh2 = 22; [['1. straight at the source', H0 * 0.12, [], true], ['2. through the gas', H0 * 0.47, LINES.H, true], ['3. at the gas from the side', H0 * 0.82, LINES.H, false]].forEach(function (q, i) { strip(ctx, k, sx2, q[1] - sh2 / 2, sw2, sh2, q[2], q[3], 380, 720); var kl = wrapLines(ctx, q[0], W0 - sx2 - 6, 11, 700); kl.forEach(function (ln, li) { txt(ctx, ln, sx2, q[1] - sh2 / 2 - 8 - (kl.length - 1 - li) * 13, { size: 11, weight: 700 }); }); line(ctx, i === 0 ? cx0 + 20 : i === 1 ? cx0 + W0 * 0.2 + 40 : cx0 + W0 * 0.2, i === 2 ? cy0 + 40 : cy0, sx2 - 6, q[1], rgba(k.muted, 0.5), 1.2, [4, 4]); });
        desc = 'Kirchhoff\'s three kinds of spectra: a hot dense source, the same light through a cool gas, and the gas seen from the side.'; read = 'A hot, dense object gives a <b>continuous</b> spectrum. Seen through a cooler gas, the gas removes its own wavelengths: an <b>absorption</b> spectrum. The gas seen from the side glows at those same wavelengths: an <b>emission</b> spectrum. Dark lines do not mean the element is missing; they show it is there.';
      } else if (mode === 'levels' || mode === 'bohr') {
        var levels = lv || [1, 2, 3, 4, 5, 6].map(PM.hLevel), Emin = M.min.apply(null, levels), gx = 60, gw = mode === 'bohr' ? W0 * 0.42 : W0 - 140;
        mp = { x0: gx, x1: gx + gw, lv: levels, Y: function (E) { return 20 + (E - 0.5) / (Emin - 0.5) * (H0 - 50); } };
        if (mode === 'bohr') { var bx = W0 * 0.74, by = H0 / 2, sr = M.min(W0 * 0.24, H0 * 0.44) / 36; for (var n = 1; n <= 6; n++) circ(ctx, bx, by, n * n * sr, { color: k.grid, w: 1.2 }); circ(ctx, bx, by, 5, { fill: k.red }); var tr = trans[0] || [3, 2], ph = A.t % 3, rn = ph < 1.5 ? tr[0] : tr[1], ang = A.t * 2; circ(ctx, bx + rn * rn * sr * M.cos(ang), by + rn * rn * sr * M.sin(ang), 5, { fill: k.blue }); if (ph > 1.4 && ph < 2.4) { var wl = PM.photonNm(PM.hLevel(tr[0]) - PM.hLevel(tr[1])), px0 = bx + tr[1] * tr[1] * sr, pts = []; for (var q = 0; q < 50; q++) pts.push([px0 + q * 3 + (ph - 1.4) * 120, by - 40 + 6 * M.sin(q * 0.8)]); poly(ctx, pts, { color: wl > 380 && wl < 750 ? wl2rgb(wl) : k.purple, w: 2 }); } txt(ctx, 'orbit radius r = n²a₀', bx, H0 - 10, { align: 'center', size: 11, color: k.muted }); }
        levels.forEach(function (E, i) { var y = mp.Y(E); if (lfoc === i) line(ctx, gx - 4, y, gx + gw + 4, y, rgba(k.gold, 0.35), 8); line(ctx, gx, y, gx + gw, y, lsel === i ? k.gold : k.ink, lsel === i ? 3 : 2); txt(ctx, 'n = ' + (i + 1), gx - 6, y, { align: 'right', size: 11, weight: 700 }); txt(ctx, fm(E, 2) + ' eV', gx + gw + 4, y, { size: 10.5, color: k.muted }); F.tagAt(ctx, 'n' + (i + 1), gx + gw - 14, y - 12); });
        line(ctx, gx, mp.Y(0), gx + gw, mp.Y(0), k.muted, 1, [4, 4]); txt(ctx, 'ionized (E = 0)', gx + gw / 2, mp.Y(0) - 8, { align: 'center', size: 10.5, color: k.muted });
        trans.forEach(function (tq, i) { var Eu = levels[tq[0] - 1], El = levels[tq[1] - 1]; if (Eu == null || El == null) return; var wl = PM.photonNm(Eu - El), x = gx + gw * (0.12 + 0.11 * i), col = wl >= 380 && wl <= 750 ? wl2rgb(wl) : tq[1] === 1 ? k.purple : k.red; arrow(ctx, x, mp.Y(Eu), x, mp.Y(El), { color: col, w: 3 }); txt(ctx, F.vals ? fm(wl, 0) + ' nm' : '? nm', x + 4, (mp.Y(Eu) + mp.Y(El)) / 2, { size: 10.5, weight: 700, color: col === k.purple || col === k.red ? col : k.ink, halo: true }); F.tagAt(ctx, 't' + i, x, mp.Y(Eu) - 14); });
        var t0 = trans[0] ? [levels[trans[0][0] - 1], levels[trans[0][1] - 1]] : null;
        desc = 'Hydrogen\'s energy levels (−13.6 eV/n²) with ' + trans.length + ' downward jumps.'; read = 'A jump down emits one photon with E = E<sub>upper</sub> − E<sub>lower</sub> and λ = hc/E (hc = 1240 eV·nm)' + (t0 ? ': n = ' + trans[0][0] + ' → ' + trans[0][1] + ' gives <b>' + un(t0[0] - t0[1], 'eV', 3) + '</b>, <b>' + un(PM.photonNm(t0[0] - t0[1]), 'nm', 4) + '</b>' : '') + '. n = 1 is the <b>lowest</b> energy (most negative). Jumps to n = 1 (Lyman) are ultraviolet, to n = 2 (Balmer) visible, to n = 3 (Paschen) infrared.' + (mode === 'levels' && F.live ? ' Click two levels to add a jump.' : '');
      } else if (mode === 'classes') {
        var cw = (W0 - 20) / 7; CLASSES.forEach(function (q, i) { var x = 10 + i * cw, Tm = M.sqrt(q[1] * q[2]); circ(ctx, x + cw / 2, 50, M.min(26, cw * 0.32), { fill: bbColor(Tm) }); txt(ctx, q[0], x + cw / 2, 50, { align: 'center', size: 16, weight: 800, color: '#333' }); var stg = W0 > 560 ? 0 : (i % 2) * 11; txt(ctx, fm(q[1] / 1000, 1) + '–' + fm(q[2] / 1000, 1) + ' kK', x + cw / 2, 88 + stg, { align: 'center', size: W0 > 560 ? 10.5 : 9, color: k.muted }); txt(ctx, q[3], x + cw / 2, (W0 > 560 ? 108 : 114) + stg, { align: 'center', size: W0 > 560 ? 10 : 8.5, color: k.ink }); F.tagAt(ctx, 'line' + i, x + cw / 2, 20); });
        var gr = { x: 50, y: W0 > 560 ? 130 : 142, w: W0 - 64, h: H0 - (W0 > 560 ? 160 : 172) }, G = GP(ctx, gr, { xmin: 0, xmax: 7, ymin: 0, ymax: 1.1, xlab: 'class (hotter →  cooler)', ylab: 'line strength (schematic)', compact: true, xticks: false, yticks: false }).frame(); [['hydrogen', function (x) { return M.exp(-M.pow((x - 2.5) / 1.2, 2)); }, k.red], ['helium', function (x) { return M.exp(-M.pow((x - 0.8) / 0.8, 2)); }, k.purple], ['metals', function (x) { return M.exp(-M.pow((x - 4.8) / 1.1, 2)); }, k.gold], ['molecules', function (x) { return x > 5.2 ? M.min(1, (x - 5.2) / 1.2) : 0; }, k.green]].forEach(function (q, i) { G.plot(q[1], q[2], 2.2); txt(ctx, q[0], G.X([2.5, 0.8, 4.8, 6.6][i]), G.Y(1.02), { align: 'center', size: 11, weight: 700, color: q[2], halo: true, haloColor: k.panelBg }); });
        desc = 'The spectral classes O, B, A, F, G, K, M from hottest to coolest, with the lines that dominate each.'; read = 'The order is by <b>temperature</b>, not the alphabet (it was reshuffled when temperature was understood). Hydrogen lines are strongest in A stars near 10,000 K; hotter stars ionize hydrogen, cooler ones leave it in its ground state. The Sun is a G star.';
      } else { // populations
        var gr2 = { x: 54, y: 16, w: W0 - 70, h: H0 - 44 }, G2 = GP(ctx, gr2, { xmin: 3000, xmax: 30000, ymin: 0, ymax: 1.05, xlab: 'T (K)', ylab: 'fraction', compact: true, xstep: 5000 }).frame(), mx2 = 0; for (var tt = 3000; tt <= 30000; tt += 200) mx2 = M.max(mx2, PM.hydrogenPop(tt).n2);
        G2.plot(function (x) { return PM.hydrogenPop(x).ion; }, k.purple, 2.2); G2.plot(function (x) { return PM.hydrogenPop(x).n2 / mx2; }, k.red, 2.4); G2.vline(T, k.gold, [4, 3]); var pnow = PM.hydrogenPop(T); G2.dot(T, pnow.ion, k.purple, 4.5); G2.dot(T, pnow.n2 / mx2, k.red, 4.5);
        txt(ctx, 'ionized fraction', G2.X(20000), G2.Y(0.92), { size: 11.5, weight: 700, color: k.purple, halo: true, haloColor: k.panelBg }); txt(ctx, 'atoms in n = 2 (scaled): Balmer line strength', G2.X(10500), G2.Y(1.0) - 4, { size: 11.5, weight: 700, color: k.red, halo: true, haloColor: k.panelBg });
        desc = 'Hydrogen in a stellar atmosphere: the share of atoms in level 2 and the share ionized, against temperature.'; read = 'Balmer lines need atoms sitting in n = 2 (Boltzmann: more as T rises) that are not yet ionized (Saha: ionization takes over above about 10,000 K). The product peaks near <b>' + fm(10000, 0) + ' K</b>, so A stars show the strongest hydrogen lines. (Model: electron pressure 20 N/m².)'; st = [['ionized', fm(pnow.ion * 100, 1) + '%'], ['in n = 2 (of all H)', nf(pnow.n2, 2)]];
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-photon
  var METALS = { cesium: 2.14, potassium: 2.29, sodium: 2.36, calcium: 2.87, zinc: 4.3, copper: 4.7 }; // work functions in eV (typical values)
  PM.kmax = function (lamNm, phi) { return HC_EVNM / lamNm - phi; };
  PM.compton = function (lam0pm, th) { return lam0pm + 2.426310 * (1 - M.cos(th * DEG)); }; // Compton wavelength of the electron h/(m_e c) = 2.42631 pm
  R('ph-photon', function (el, o) {
    var mode = pick(o.mode, ['photoelectric', 'graph', 'compton'], 'photoelectric');
    var F = frame(el, o, { photoelectric: 'Light knocking electrons out of a metal', graph: 'Maximum kinetic energy against frequency', compton: 'A photon scattering from an electron (Compton)' }[mode]);
    var metal = METALS[o.metal] ? o.metal : 'sodium', P = { phi: o.phi != null ? num(o.phi, 2.3) : METALS[metal], lam: num(o.lambda, 400), I: num(o.intensity, 0.5), Vs: num(o.Vstop, 0), th: num(o.theta, 90), l0: num(o.lambda0, 71) };
    var c = F.canvas({ aspect: 1.75, narrow: 1.0 }), ph = [], els = [], R0 = rng(3);
    var A = mode === 'photoelectric' ? F.anim({ tmax: undefined, scrub: false, autoplay: true, tick: function (h) { var rate = P.I * 30; if (R0() < rate * h * 3) ph.push({ x: 0, y: 0.15 + R0() * 0.7 }); ph.forEach(function (p) { p.x += h * 1.4; }); var K0 = PM.kmax(P.lam, P.phi); ph = ph.filter(function (p) { if (p.x >= 0.5) { if (K0 > 0) els.push({ x: 0.5, y: p.y, v: M.sqrt(K0 * (0.2 + 0.8 * R0())), a: -P.Vs }); return false; } return true; }); els.forEach(function (e) { e.v += e.a * 0.8 * h; e.x += e.v * h * 0.35; }); els = els.filter(function (e) { return e.x > 0.48 && e.x < 0.95; }); return true; }, dt: 0.05 }) : { t: 0 };
    if (F.live && mode !== 'compton') { F.slider(null, { label: 'Wavelength λ', min: 150, max: 750, step: 5, value: P.lam, unit: 'nm', d: 0, input: function (v) { P.lam = v; } }); if (mode === 'photoelectric') { F.slider(null, { label: 'Brightness', min: 0, max: 1, step: 0.05, value: P.I, d: 2, input: function (v) { P.I = v; } }); F.slider(null, { label: 'Stopping voltage', min: 0, max: 5, step: 0.05, value: P.Vs, unit: 'V', d: 2, input: function (v) { P.Vs = v; } }); } F.seg(null, { label: 'Metal', items: Object.keys(METALS).map(function (m) { return [m, m]; }), value: metal, change: function (v) { metal = v; P.phi = METALS[v]; } }); }
    if (F.live && mode === 'compton') F.slider(null, { label: 'Scattering angle θ', min: 0, max: 180, step: 1, value: P.th, unit: '°', d: 0, input: function (v) { P.th = v; } });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, desc = '', read = '', st = []; bg(c);
      var f = C0 / (P.lam * 1e-9), K0 = PM.kmax(P.lam, P.phi), f0 = P.phi * QE / H;
      if (mode === 'photoelectric') {
        var pw = W0 * (W0 > 560 ? 0.55 : 1), sh = W0 > 560 ? H0 : H0 * 0.6, X = function (x) { return x * pw; }, Y = function (y) { return 20 + y * (sh - 40); };
        block(ctx, X(0.5) - 6, Y(0), 12, sh - 40, { fill: k.metal, color: k.ink, r: 2 }); txt(ctx, metal + ' (φ = ' + fm(P.phi, 2) + ' eV)', X(0.5), Y(1) + 14, { align: 'center', size: 11, weight: 700 }); block(ctx, X(0.95) - 4, Y(0), 8, sh - 40, { fill: k.metal, color: k.ink, r: 2 }); F.tagAt(ctx, 'plate', X(0.5) - 20, Y(0) + 10);
        var lc = P.lam >= 380 && P.lam <= 750 ? wl2rgb(P.lam) : P.lam < 380 ? '#b197fc' : '#ff8787'; ctx.save(); ctx.fillStyle = (P.lam >= 380 && P.lam <= 750 ? wl2rgb(P.lam, 0.12 + 0.3 * P.I) : rgba(k.purple, 0.12 + 0.2 * P.I)); ctx.fillRect(0, Y(0.1), X(0.5) - 6, Y(0.9) - Y(0.1)); ctx.restore(); F.tagAt(ctx, 'beam', X(0.2), Y(0.05));
        ph.forEach(function (p) { var pts = []; for (var q = 0; q < 8; q++) pts.push([X(p.x) - q * 2.4, Y(p.y) + 3 * M.sin(q * 1.6)]); poly(ctx, pts, { color: lc, w: 1.8 }); });
        els.forEach(function (e) { circ(ctx, X(e.x), Y(e.y), 3, { fill: k.blue }); });
        if (P.Vs > 0) txt(ctx, 'stopping voltage ' + fm(P.Vs, 2) + ' V pushes electrons back', X(0.72), Y(1) + 14, { align: 'center', size: 10.5, color: k.muted });
        var cur = K0 > P.Vs ? P.I * (1 - P.Vs / K0) : 0, mx = W0 > 560 ? W0 * 0.72 : W0 * 0.2, my = W0 > 560 ? H0 * 0.25 : H0 * 0.78; circ(ctx, mx, my, 30, { fill: k.bg, color: k.ink, w: 2 }); var na = -1.1 + 2.2 * clamp(cur, 0, 1); line(ctx, mx, my + 16, mx + 26 * M.sin(na), my + 16 - 26 * M.cos(na), k.red, 2.5); txt(ctx, 'current', mx, my + 42, { align: 'center', size: 11, color: k.muted }); F.tagAt(ctx, 'e0', mx + 40, my - 20);
        if (W0 > 560) { var gr = { x: W0 * 0.62, y: H0 * 0.5, w: W0 * 0.35, h: H0 * 0.42 }, G = GP(ctx, gr, { xmin: 0, xmax: 2e15, ymin: 0, ymax: 6, xlab: 'f (Hz)', ylab: 'K max (eV)', compact: true, xstep: 5e14 }).frame(); G.plot(function (x) { return M.max(0, H * x / QE - P.phi); }, k.acc, 2.2); G.dot(f, M.max(0, K0), k.red, 5); G.vline(f0, k.muted, [3, 3]); F.tagAt(ctx, 'threshold', G.X(f0), gr.y + 14); }
        desc = (P.lam) + ' nm light on ' + metal + ' (work function ' + fm(P.phi, 2) + ' eV).' + (F.quiet ? '' : K0 > 0 ? ' Electrons leave with up to ' + un(K0, 'eV', 3) + '.' : ' No electrons leave.');
        read = 'Each photon carries E = hf = <b>' + un(HC_EVNM / P.lam, 'eV', 3) + '</b> and gives it all to one electron. ' + (K0 > 0 ? 'K<sub>max</sub> = hf − φ = <b>' + un(K0, 'eV', 3) + '</b>, so a stopping voltage of ' + un(K0, 'V', 3) + ' halts even the fastest. Brighter light sends more photons, so <b>more</b> electrons, not faster ones.' : 'That is less than φ, so <b>no electrons</b> leave, however bright the light or however long you wait. The threshold is f₀ = φ/h = ' + un(f0, 'Hz', 3) + ' (' + un(HC_EVNM / P.phi, 'nm', 3) + ').');
        st = [['photon energy', un(HC_EVNM / P.lam, 'eV', 3)], ['K max', K0 > 0 ? un(K0, 'eV', 3) : 'none'], ['threshold λ', un(HC_EVNM / P.phi, 'nm', 3)]];
      } else if (mode === 'graph') {
        var gr2 = { x: 54, y: 16, w: W0 - 70, h: H0 - 44 }, G2 = GP(ctx, gr2, { xmin: 0, xmax: 2e15, ymin: -P.phi - 0.5, ymax: 6, xlab: 'f (Hz)', ylab: 'K max (eV)', compact: F.compact, xstep: 5e14 }).frame();
        G2.plot(function (x) { return H * x / QE - P.phi; }, rgba(k.acc, 0.35), 1.6, [5, 4]); G2.plot(function (x) { var y = H * x / QE - P.phi; return y >= 0 ? y : NaN; }, k.acc, 2.6); G2.dot(f0, 0, k.red, 5); G2.dot(0, -P.phi, k.purple, 5); F.tagAt(ctx, 'graphLine', G2.X(1.6e15), G2.Y(H * 1.6e15 / QE - P.phi) - 16); F.tagAt(ctx, 'threshold', G2.X(f0) + 16, G2.Y(0) + 16);
        if (F.vals) { txt(ctx, 'slope = h = 4.14 × 10⁻¹⁵ eV·s', G2.X(1.2e15), G2.Y(H * 1.2e15 / QE - P.phi) + 18, { size: 11, color: k.acc, weight: 700, halo: true, haloColor: k.panelBg }); txt(ctx, 'intercept −φ', G2.X(0) + 8, G2.Y(-P.phi), { size: 11, color: k.purple, weight: 700, halo: true, haloColor: k.panelBg }); }
        desc = 'K max against frequency for ' + metal + '.'; read = 'K<sub>max</sub> = hf − φ is a straight line. Its slope is Planck\'s constant h for every metal; only the threshold f₀ (where it crosses zero) and the intercept −φ change from metal to metal.';
      } else {
        var l1 = PM.compton(P.l0, P.th), cx0 = W0 * 0.38, cy0 = H0 * 0.55, L = M.min(W0, H0) * 0.32, a = P.th * DEG; var pts = []; for (var q2 = 0; q2 < 60; q2++) pts.push([cx0 - L + q2 * L / 60, cy0 + 5 * M.sin(q2 * 0.9)]); poly(ctx, pts, { color: k.purple, w: 2 }); circ(ctx, cx0, cy0, 7, { fill: k.blue }); txt(ctx, 'e⁻ at rest', cx0, cy0 + 20, { align: 'center', size: 11 });
        var pts2 = []; for (q2 = 0; q2 < 60; q2++) { var s2 = q2 * L / 60; pts2.push([cx0 + s2 * M.cos(a) - 5 * M.sin(q2 * 0.9 * P.l0 / l1) * M.sin(a), cy0 - s2 * M.sin(a) - 5 * M.sin(q2 * 0.9 * P.l0 / l1) * M.cos(a)]); } poly(ctx, pts2, { color: k.red, w: 2 });
        var pe = [1 / P.l0 - M.cos(a) / l1, M.sin(a) / l1], pa = M.atan2(-pe[1], pe[0]); arrow(ctx, cx0, cy0, cx0 + 70 * M.cos(pa), cy0 - 70 * M.sin(pa), { color: k.blue, w: 2.6, label: 'recoil electron' }); arc(ctx, cx0, cy0, 30, -a, 0, k.gold, 1.5); txt(ctx, 'θ', cx0 + 36 * M.cos(a / 2), cy0 - 36 * M.sin(a / 2), { size: 13, italic: true, serif: true, color: k.gold });
        var Ee = HC_EVNM / (P.l0 / 1000) - HC_EVNM / (l1 / 1000);
        desc = 'A ' + un(P.l0, 'pm') + ' X-ray photon scattering from an electron at rest through ' + fm(P.th, 0) + '°.'; read = 'Δλ = (h/m<sub>e</sub>c)(1 − cos θ) = 2.43 pm × (1 − cos θ) = <b>' + un(l1 - P.l0, 'pm', 3) + '</b>: the scattered photon has a <b>longer wavelength</b> (less energy) but still moves at c; the electron carries off the difference (' + un(Ee / 1000, 'keV', 3) + ').'; st = [['λ before', un(P.l0, 'pm', 4)], ['λ after', un(l1, 'pm', 4)], ['electron gets', un(Ee / 1000, 'keV', 3)]];
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-blackbody
  var BB = { Sun: 5772, Betelgeuse: 3600, Rigel: 12100, Sirius: 9940, 'stove element': 1000, person: 310, CMB: 2.725 };
  PM.wienPeak = function (T) { return WIEN / T; };
  PM.planck = planckL;
  R('ph-blackbody', function (el, o) {
    var F = frame(el, o, 'Blackbody (Planck) curves');
    var list = o.presets ? arr(o.presets).filter(function (p) { return BB[p]; }).map(function (p) { return { T: BB[p], name: p }; }) : arr(o.T || [5772, 3600]).map(function (t) { return { T: num(t, 5772), name: '' }; });
    var cold = list.some(function (q) { return q.T < 1500; }), scale = o.scale === 'log' || o.scale === 'lin' ? o.scale : cold ? 'log' : 'lin';
    var sh = { peak: F.on('peak', true, true), area: F.on('area', false), vis: F.on('visible', true), sw: F.on('swatch', true), rj: F.on('rj', false) }, c = F.canvas({ aspect: 1.7, narrow: 1.0 });
    if (F.live && !o.presets && list.length) F.slider(null, { label: 'Temperature of the first body', min: 1000, max: 30000, step: 100, value: list[0].T, unit: 'K', d: 0, input: function (v) { list[0].T = v; } });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h; bg(c);
      var cols = [k.red, k.blue, k.gold, k.green, k.purple, k.teal], r = { x: 56, y: 16, w: W0 - 70, h: H0 - 44 };
      if (scale === 'lin') {
        var xr = Array.isArray(o.xrange) ? [num(o.xrange[0], 0), num(o.xrange[1], 3000)] : [0, M.min(4000, M.max.apply(null, list.map(function (q) { return PM.wienPeak(q.T) * 1e9 * 4; })))], ymx = M.max.apply(null, list.map(function (q) { return planckL(PM.wienPeak(q.T), q.T); })) * 1.12;
        var G = GP(ctx, r, { xmin: xr[0], xmax: xr[1], ymin: 0, ymax: ymx / 1e13, xlab: 'λ (nm)', ylab: 'spectral radiance (10¹³ W/m³/sr)', compact: F.compact }).frame();
        if (sh.vis) { for (var l = 380; l < 750; l += 4) { if (l < xr[0] || l > xr[1]) continue; ctx.fillStyle = wl2rgb(l, 0.22); ctx.fillRect(G.X(l), r.y, G.X(l + 4) - G.X(l) + 0.5, r.h); } F.tagAt(ctx, 'visible', G.X(560), r.y + 14); }
        var swPos = function (i) { return W0 > 560 ? [r.x + r.w - 24 - i * 34, r.y + 24] : [r.x + r.w - 20, r.y + r.h * 0.35 + i * 32]; }, PLACED = sh.sw ? list.map(function (q, i) { var sp = swPos(i); return [sp[0] - 14, sp[1], 28]; }) : []; list.forEach(function (q, i) { var f = function (x) { return planckL(x * 1e-9, q.T) / 1e13; }; if (sh.area) G.fill(f, xr[0] + 1, xr[1], rgba(cols[i % 6], 0.12)); G.plot(f, cols[i % 6], 2.6, null, M.max(1, xr[0])); if (sh.rj) G.plot(function (x) { var lm = x * 1e-9; return 2 * C0 * KB * q.T / M.pow(lm, 4) / 1e13; }, rgba(cols[i % 6], 0.6), 1.4, [5, 4], M.max(1, xr[0])); var pk = PM.wienPeak(q.T) * 1e9; if (sh.peak && pk < xr[1]) { G.dot(pk, f(pk), cols[i % 6], 5); var bl = (q.name ? q.name + ' ' : '') + fm(q.T, 0) + ' K' + (F.vals ? ', peak ' + fm(pk, 0) + ' nm' : ''), blw = tw(ctx, bl, 11.5, 700), blx = M.min(G.X(pk) + 8, W0 - blw - 4), bly = M.min(M.max(G.Y(f(pk)) - 10, 22), r.y + r.h - 24), bdir = bly > r.y + r.h / 2 ? -15 : 15; for (var tries = 0; tries < 12 && PLACED.some(function (b) { return blx < b[0] + b[2] + 4 && b[0] < blx + blw + 4 && M.abs(b[1] - bly) < 14; }); tries++) bly += bdir; PLACED.push([blx, bly, blw]); txt(ctx, bl, blx, bly, { size: 11.5, weight: 700, color: cols[i % 6], halo: true, haloColor: k.panelBg }); F.tagAt(ctx, 'peak' + i, G.X(pk) - 16, G.Y(f(pk)) - 14); } F.tagAt(ctx, 'c' + i, G.X(M.min(xr[1] * 0.9, pk * 2.2)), G.Y(f(M.min(xr[1] * 0.9, pk * 2.2))) - 12); if (sh.sw) { var swp = swPos(i); circ(ctx, swp[0], swp[1], 13, { fill: bbColor(q.T), color: k.grid, w: 1 }); } });
      } else {
        var lmin = -7.5, lmax = -2, G2 = GP(ctx, r, { xmin: lmin, xmax: lmax, ymin: -12, ymax: 16, xlab: 'log₁₀ λ (m)', ylab: 'log₁₀ radiance', compact: F.compact }).frame();
        if (sh.vis) { ctx.fillStyle = rgba(k.gold, 0.18); ctx.fillRect(G2.X(M.log10(380e-9)), r.y, G2.X(M.log10(750e-9)) - G2.X(M.log10(380e-9)), r.h); txt(ctx, 'visible', G2.X(M.log10(550e-9)), r.y + 12, { align: 'center', size: 10.5, color: k.muted }); }
        list.forEach(function (q, i) { G2.plot(function (x) { var v = planckL(M.pow(10, x), q.T); return v > 0 ? M.log10(v) : NaN; }, cols[i % 6], 2.4); var pk = PM.wienPeak(q.T); if (sh.peak) { var yy = M.log10(planckL(pk, q.T)); G2.dot(M.log10(pk), yy, cols[i % 6], 5); txt(ctx, (q.name ? q.name + ' ' : '') + fm(q.T, q.T < 10 ? 3 : 0) + ' K', G2.X(M.log10(pk)) + 6, G2.Y(yy) - 10, { size: 11, weight: 700, color: cols[i % 6], halo: true, haloColor: k.panelBg }); } });
      }
      var q0 = list[0] || { T: 5772 };
      F.desc('Planck curves for ' + list.map(function (q) { return (q.name ? q.name + ' ' : '') + fm(q.T, 0) + ' K'; }).join(', ') + '.');
      F.read('Hotter bodies give off more at <b>every</b> wavelength, and their peak moves to shorter wavelengths: λ<sub>peak</sub> = b/T (Wien), so blue-white stars are the hottest and red ones the coolest. Total power per area σT⁴ grows as the <b>fourth power</b> of T. ' + fm(q0.T, 0) + ' K: peak <b>' + un(PM.wienPeak(q0.T) * 1e9, 'nm', 3) + '</b>, σT⁴ = <b>' + un(SIGMA * M.pow(q0.T, 4), 'W/m²', 3) + '</b>. Everything warm radiates, mostly in infrared you cannot see.' + (sh.rj ? ' The classical (Rayleigh–Jeans) curve grows without limit at short wavelengths: the "ultraviolet catastrophe" that Planck\'s photons fixed.' : ''));
      F.stats(list.map(function (q) { return [(q.name || fm(q.T, 0) + ' K') + ' peak', un(PM.wienPeak(q.T) * 1e9, 'nm', 3)]; }));
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-nucleus. Binding energy per nucleon (MeV) from the Atomic Mass Evaluation; atomic masses in u (AME 2020, rounded).
  var BPN = [[2, 1.112, 'H-2'], [3, 2.827, 'H-3'], [4, 7.074, 'He-4'], [6, 5.332, 'Li-6'], [7, 5.606, 'Li-7'], [9, 6.463, 'Be-9'], [11, 6.928, 'B-11'], [12, 7.680, 'C-12'], [14, 7.476, 'N-14'], [16, 7.976, 'O-16'], [19, 7.779, 'F-19'], [20, 8.032, 'Ne-20'], [24, 8.261, 'Mg-24'], [28, 8.448, 'Si-28'], [32, 8.493, 'S-32'], [40, 8.551, 'Ca-40'], [48, 8.723, 'Ti-48'], [52, 8.776, 'Cr-52'], [56, 8.790, 'Fe-56'], [59, 8.768, 'Co-59'], [62, 8.795, 'Ni-62'], [64, 8.736, 'Zn-64'], [84, 8.717, 'Kr-84'], [90, 8.710, 'Zr-90'], [98, 8.635, 'Mo-98'], [120, 8.505, 'Sn-120'], [138, 8.393, 'Ba-138'], [158, 8.202, 'Gd-158'], [184, 8.005, 'W-184'], [197, 7.916, 'Au-197'], [208, 7.868, 'Pb-208'], [232, 7.615, 'Th-232'], [235, 7.591, 'U-235'], [238, 7.570, 'U-238']];
  var MASS = { n: [1.008665, 0, 1], p: [1.007825, 1, 1], 'H-1': [1.007825, 1, 1], 'H-2': [2.014102, 1, 2], 'H-3': [3.016049, 1, 3], 'He-3': [3.016029, 2, 3], 'He-4': [4.002603, 2, 4], 'Li-6': [6.015123, 3, 6], 'Li-7': [7.016003, 3, 7], 'Be-8': [8.005305, 4, 8], 'C-12': [12, 6, 12], 'C-13': [13.003355, 6, 13], 'C-14': [14.003242, 6, 14], 'N-13': [13.005739, 7, 13], 'N-14': [14.003074, 7, 14], 'N-15': [15.000109, 7, 15], 'O-15': [15.003066, 8, 15], 'O-16': [15.994915, 8, 16], 'Kr-92': [91.926173, 36, 92], 'Ba-141': [140.914403, 56, 141], 'Rn-222': [222.017578, 86, 222], 'Ra-226': [226.025410, 88, 226], 'Th-234': [234.043601, 90, 234], 'U-235': [235.043928, 92, 235], 'U-238': [238.050787, 92, 238], 'e+': [0, 1, 0], 'e-': [0, -1, 0] };
  /* PM.reaction('H-2 + H-3 -> He-4 + n'): checks A and Z and computes Q (MeV) from atomic masses (electron bookkeeping as in textbooks) */
  PM.reaction = function (s) {
    var sides = String(s).split(/->|→/); if (sides.length !== 2) return null;
    function parse(side) { return side.split('+').map(function (t) { t = t.trim(); var m = /^(\d*)\s*(.+)$/.exec(t), n = m[1] ? +m[1] : 1, sym = m[2].replace(/\s+/g, ''); return { n: n, sym: sym, d: MASS[sym] }; }); }
    var L = parse(sides[0]), Rr = parse(sides[1]), ok = L.concat(Rr).every(function (q) { return q.d; }); if (!ok) return { error: 'unknown nuclide' };
    function sum(arr2, i) { return arr2.reduce(function (s0, q) { return s0 + q.n * q.d[i]; }, 0); }
    return { A: [sum(L, 2), sum(Rr, 2)], Z: [sum(L, 1), sum(Rr, 1)], Q: (sum(L, 0) - sum(Rr, 0)) * 931.494, L: L, R: Rr };
  };
  /* PM.semf(A, Z): binding energy per nucleon (MeV) from the semi-empirical mass formula (a smooth guide, not data) */
  PM.semf = function (A, Z) { var N = A - Z, B = 15.75 * A - 17.8 * M.pow(A, 2 / 3) - 0.711 * Z * (Z - 1) / M.cbrt(A) - 23.7 * (N - Z) * (N - Z) / A; return B / A; };
  function zStable(A) { return A / (1.98 + 0.0155 * M.pow(A, 2 / 3)); }
  R('ph-nucleus', function (el, o) {
    var mode = pick(o.mode, ['decay', 'chart', 'binding', 'reaction', 'ppchain'], 'decay');
    var F = frame(el, o, { decay: 'Radioactive decay of a sample', chart: 'The chart of nuclides with decay moves', binding: 'Binding energy per nucleon', reaction: 'A nuclear reaction: balancing and Q', ppchain: 'The proton–proton chain' }[mode]);
    var c = F.canvas({ aspect: 1.7, narrow: 1.0 }), N0 = clamp(M.round(num(o.N0, 400)), 10, 2000), th = num(o.halfLife, 2), seed = num(o.seed, 7), sh = { curve: F.on('curve', true, true), hl: F.on('halflives', true), arrows: F.on('arrows', true) };
    var S = { t: 0, alive: [], hist: [], step: 0 }, R0;
    function reset() { R0 = rng(seed); S.t = 0; S.alive = []; for (var i = 0; i < N0; i++) S.alive.push(true); S.hist = [[0, N0]]; S.step = 0; }
    reset();
    var A = mode === 'decay' ? F.anim({ tmax: th * 5, rate: th, autoplay: true, dt: th / 10, scrub: false, tick: function (h) { var p = 1 - M.pow(0.5, h / th); for (var i = 0; i < S.alive.length; i++) if (S.alive[i] && R0() < p) S.alive[i] = false; S.t += h; S.hist.push([S.t, S.alive.filter(Boolean).length]); return S.t < th * 5; }, reset: reset }) : mode === 'ppchain' ? F.anim({ tmax: 3, rate: 0.35, autoplay: true, loop: true, dt: 1 / 3 }) : { t: 0 };
    if (!F.live && mode === 'decay' && num(o.t, 0) > 0) { var steps = M.round(num(o.t, 0) / (th / 20)); for (var j = 0; j < steps; j++) { var pp = 1 - M.pow(0.5, 1 / 20); for (var i2 = 0; i2 < S.alive.length; i2++) if (S.alive[i2] && R0() < pp) S.alive[i2] = false; S.t += th / 20; S.hist.push([S.t, S.alive.filter(Boolean).length]); } }
    var nuc = o.nuclide ? { Z: num(o.nuclide.Z, 92), A: num(o.nuclide.A, 238) } : { Z: 92, A: 238 }, decs = arr(o.decays || ['alpha', 'beta-', 'beta+']), rxn = o.reaction || 'H-2 + H-3 -> He-4 + n', sel = num(o.select, 56);
    if (F.live && mode === 'chart') F.seg(null, { label: 'Decay', items: [['alpha', 'α'], ['beta-', 'β⁻'], ['beta+', 'β⁺'], ['gamma', 'γ']], value: '', change: function (v) { if (v === 'alpha') { nuc.Z -= 2; nuc.A -= 4; } else if (v === 'beta-') nuc.Z += 1; else if (v === 'beta+') nuc.Z -= 1; } });
    if (F.live && mode === 'binding') F.slider(null, { label: 'Pick a nucleus (mass number A)', min: 2, max: 238, step: 1, value: sel, d: 0, input: function (v) { sel = v; } });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, desc = '', read = '', st = []; bg(c);
      if (mode === 'decay') {
        var gw = W0 > 560 ? W0 * 0.38 : W0, cols2 = M.ceil(M.sqrt(N0 * 1.4)), rows = M.ceil(N0 / cols2), cs = M.min((gw - 20) / cols2, (W0 > 560 ? H0 - 20 : H0 * 0.45) / rows);
        S.alive.forEach(function (a, i) { var x = 10 + (i % cols2) * cs + cs / 2, y = 10 + M.floor(i / cols2) * cs + cs / 2; circ(ctx, x, y, cs * 0.38, { fill: a ? k.red : rgba(k.muted, 0.35) }); });
        var gr = W0 > 560 ? { x: gw + 50, y: 16, w: W0 - gw - 64, h: H0 - 44 } : { x: 50, y: H0 * 0.5 + 10, w: W0 - 64, h: H0 * 0.5 - 36 }, G = GP(ctx, gr, { xmin: 0, xmax: th * 5, ymin: 0, ymax: N0 * 1.05, xlab: 't (half-lives: ' + fm(th, 2) + ' s each)', ylab: 'undecayed nuclei', compact: true, xstep: th }).frame();
        if (sh.curve) G.plot(function (x) { return N0 * M.pow(0.5, x / th); }, k.acc, 2, [6, 4]); G.line(S.hist, k.red, 2.2);
        if (sh.hl) for (var h2 = 1; h2 <= 4; h2++) { G.dot(h2 * th, N0 * M.pow(0.5, h2), k.gold, 4); txt(ctx, '1/' + M.pow(2, h2), G.X(h2 * th) + 4, G.Y(N0 * M.pow(0.5, h2)) - 10, { size: 10.5, color: k.gold, weight: 700, halo: true, haloColor: k.panelBg }); }
        var left = S.alive.filter(Boolean).length; desc = N0 + ' nuclei with a half-life of ' + un(th, 's') + '; ' + left + ' remain after ' + un(S.t, 's', 2) + '.'; read = 'Each nucleus has the same chance of decaying in each moment, no matter how long it has waited, so you cannot say which will go next. Every half-life, about half of those <b>left</b> decay: after two half-lives a quarter remain, not none. Each run differs a little; the average follows N = N₀(½)<sup>t/T½</sup>.'; st = [['remaining', String(left)], ['expected', fm(N0 * M.pow(0.5, S.t / th), 0)], ['half-lives', fm(S.t / th, 2)]];
      } else if (mode === 'chart') {
        var r = { x: 50, y: 14, w: W0 - 64, h: H0 - 42 }, Zc = nuc.Z, Nc = nuc.A - nuc.Z, span = 14, G2 = GP(ctx, r, { xmin: Nc - span, xmax: Nc + span * 0.6, ymin: Zc - span * 0.7, ymax: Zc + span * 0.5, xlab: 'N (neutrons)', ylab: 'Z (protons)', compact: true, xstep: 4, ystep: 2 }).frame();
        G2.clip(); for (var A2 = 1; A2 <= 300; A2++) { var zs = zStable(A2), ns = A2 - zs; ctx.fillStyle = rgba(k.green, 0.35); ctx.beginPath(); ctx.arc(G2.X(ns), G2.Y(zs), 5, 0, TAU); ctx.fill(); } ctx.restore(); txt(ctx, 'band of stable nuclei', r.x + 8, r.y + r.h - 12, { size: 11, color: k.green, weight: 700 });
        circ(ctx, G2.X(Nc), G2.Y(Zc), 9, { fill: k.red }); F.tagAt(ctx, 'parent', G2.X(Nc) + 16, G2.Y(Zc) - 14); txt(ctx, 'Z = ' + Zc + ', N = ' + Nc + ', A = ' + nuc.A, G2.X(Nc) + 14, G2.Y(Zc) + 14, { size: 11.5, weight: 700, halo: true, haloColor: k.panelBg });
        if (sh.arrows) decs.forEach(function (d, i) { var dz = d === 'alpha' ? -2 : d === 'beta-' ? 1 : d === 'beta+' ? -1 : 0, dn = d === 'alpha' ? -2 : d === 'beta-' ? -1 : d === 'beta+' ? 1 : 0; if (!dz && !dn) return; arrow(ctx, G2.X(Nc), G2.Y(Zc), G2.X(Nc + dn), G2.Y(Zc + dz), { color: [k.blue, k.purple, k.orange][i % 3], w: 2.6, label: d === 'alpha' ? 'α' : d === 'beta-' ? 'β⁻' : 'β⁺' }); F.tagAt(ctx, 'arrow' + i, G2.X(Nc + dn) + 14, G2.Y(Zc + dz) + 12); });
        desc = 'A nuclide with Z = ' + Zc + ' and N = ' + Nc + ' on the chart of nuclides.'; read = 'α decay: Z − 2 and N − 2 (A − 4). β⁻: a neutron becomes a proton (Z + 1, N − 1); the electron comes from the <b>nucleus</b>, not the electron cloud. β⁺: a proton becomes a neutron (Z − 1, N + 1). γ: same nucleus, less energy. Unstable nuclei decay toward the stable band.';
      } else if (mode === 'binding') {
        var r3 = { x: 50, y: 14, w: W0 - 64, h: H0 - 42 }, G3 = GP(ctx, r3, { xmin: 0, xmax: 240, ymin: 0, ymax: 9.5, xlab: 'mass number A', ylab: 'binding energy per nucleon (MeV)', compact: true, xstep: 40 }).frame();
        G3.plot(function (a) { return a >= 12 ? PM.semf(a, M.round(zStable(a))) : NaN; }, rgba(k.muted, 0.6), 1.4, [5, 4]);
        G3.line(BPN.map(function (q) { return [q[0], q[1]]; }), rgba(k.acc, 0.5), 1.4); BPN.forEach(function (q) { G3.dot(q[0], q[1], q[2] === 'Fe-56' || q[2] === 'Ni-62' ? k.red : k.acc, 3.5); if (['He-4', 'C-12', 'O-16', 'Fe-56', 'U-235', 'H-2'].indexOf(q[2]) >= 0) txt(ctx, q[2], G3.X(q[0]) + (q[0] > 200 ? -40 : 5), G3.Y(q[1]) + (q[2] === 'H-2' ? -10 : 12), { size: 10.5, weight: 700, color: q[2] === 'Fe-56' ? k.red : k.ink, halo: true, haloColor: k.panelBg }); if (q[2] === 'Fe-56') F.tagAt(ctx, 'fe56', G3.X(56), G3.Y(8.79) - 18); });
        if (F.on('arrows', true)) { arrow(ctx, G3.X(5), G3.Y(3.2), G3.X(40), G3.Y(7.4), { color: k.green, w: 2.4, label: 'fusion' }); arrow(ctx, G3.X(230), G3.Y(6.9), G3.X(120), G3.Y(8.1), { color: k.orange, w: 2.4, label: 'fission' }); F.tagAt(ctx, 'fusion', G3.X(22), G3.Y(5.8)); F.tagAt(ctx, 'fission', G3.X(180), G3.Y(7.2)); }
        var near = BPN.reduce(function (b, q) { return M.abs(q[0] - sel) < M.abs(b[0] - sel) ? q : b; }, BPN[0]), Btot = near[1] * near[0], dm = Btot / 931.494; G3.vline(near[0], k.gold, [4, 3]);
        desc = 'Binding energy per nucleon against mass number, peaking near iron and nickel.'; read = 'Nuclei near A ≈ 56–62 (iron, nickel) are the most tightly bound. Fusing light nuclei and splitting heavy ones both move toward the peak and release energy; fusing beyond iron costs energy. A nucleus weighs <b>less</b> than its separate protons and neutrons: for ' + near[2] + ', B = ' + fm(near[1], 3) + ' × ' + near[0] + ' = <b>' + un(Btot, 'MeV', 4) + '</b>, a mass defect of <b>' + un(dm, 'u', 3) + '</b>.'; st = [['nucleus', near[2]], ['B per nucleon', un(near[1], 'MeV', 4)], ['total B', un(Btot, 'MeV', 4)], ['mass defect', un(dm, 'u', 3)]];
      } else if (mode === 'reaction') {
        var rx = PM.reaction(rxn) || { error: 'bad equation' }; if (rx.error) { txt(ctx, 'Could not read: ' + rxn, 20, 30, { size: 12, color: k.red }); return; }
        var y0 = H0 * 0.35, xx = 20; function term(q, i, last) { /* nuclear notation: mass number up, charge down, both to the left of the symbol */ xx += 8; if (q.n > 1) xx += txt(ctx, q.n + ' ', xx, y0, { size: 18, weight: 800 }); var el2 = q.sym.replace(/-\d+$/, '').replace(/^e[+-]$/, 'e'); var wA = txt(ctx, String(q.d[2]), xx, y0 - 9, { size: 11, weight: 700, color: k.muted }), wZ = txt(ctx, String(q.d[1]), xx, y0 + 10, { size: 11, weight: 700, color: k.muted }); xx += M.max(wA, wZ) + 1; xx += txt(ctx, el2 === 'p' ? 'H' : el2, xx, y0, { size: 18, weight: 800 }) + 8; if (!last) { txt(ctx, '+', xx, y0, { size: 18, weight: 700, color: k.muted }); xx += 12; } void i; }
        rx.L.forEach(function (q, i) { term(q, i, i === rx.L.length - 1); }); xx += 8; txt(ctx, '→', xx, y0, { size: 20, weight: 700 }); xx += 24; rx.R.forEach(function (q, i) { term(q, i, i === rx.R.length - 1); });
        var bal = rx.A[0] === rx.A[1] && rx.Z[0] === rx.Z[1]; txt(ctx, 'A: ' + rx.A[0] + ' → ' + rx.A[1] + '   Z: ' + rx.Z[0] + ' → ' + rx.Z[1] + (bal ? '   balanced' : '   not balanced'), 20, y0 + 56, { size: 12.5, weight: 700, color: bal ? k.green : k.red });
        if (F.vals) wrapLines(ctx, 'Q = (mass before − mass after) × 931.5 MeV/u = ' + un(rx.Q, 'MeV', 4), W0 - 30, 12.5, 700).forEach(function (ln, li) { txt(ctx, ln, 20, y0 + 84 + li * 16, { size: 12.5, weight: 700, color: rx.Q > 0 ? k.green : k.red }); }); F.tagAt(ctx, 'parent', 30, y0 - 26);
        desc = 'The reaction ' + rxn + '.'; read = 'Nucleon number A and charge Z must balance. Q is the mass lost × c²' + (F.vals ? ': <b>' + un(rx.Q, 'MeV', 4) + '</b>' : '') + (rx.Q > 0 ? ' (released, mostly as kinetic energy of the products).' : ' (energy must be supplied).'); st = [['Q', un(rx.Q, 'MeV', 4)]];
      } else { // proton–proton chain, three steps
        var stepN = M.floor(A.t) % 3, steps = [['p + p → ²H + e⁺ + ν', 'twice', '1.44 MeV each (with annihilation)'], ['²H + p → ³He + γ', 'twice', '5.49 MeV each'], ['³He + ³He → ⁴He + 2p', 'once', '12.86 MeV']];
        steps.forEach(function (q, i) { var y = 40 + i * (H0 - 80) / 3, on = i <= stepN; rrect(ctx, 20, y - 20, W0 - 40, 46, 10); ctx.fillStyle = on ? rgba(k.gold, 0.18) : k.panelBg; ctx.fill(); txt(ctx, (i + 1) + '. ' + q[0], 36, y, { size: 15, weight: 800, color: on ? k.ink : k.muted }); txt(ctx, q[1] + ' · ' + q[2], 36, y + 18, { size: 11, color: k.muted }); F.tagAt(ctx, 'arrow' + i, W0 - 44, y); });
        txt(ctx, 'Net: 4 ¹H → ⁴He + 2e⁺ + 2ν, releasing 26.7 MeV', W0 / 2, H0 - 14, { align: 'center', size: 12.5, weight: 800, color: k.green });
        desc = 'The proton–proton chain in the Sun\'s core, step by step.'; read = 'Four protons become one helium-4 nucleus. The mass lost, about 0.7%, becomes 26.7 MeV (a little leaves with the neutrinos). Two of the protons turn into neutrons along the way, giving off positrons and neutrinos. Hotter, more massive stars use the CNO cycle, where carbon, nitrogen and oxygen nuclei help but are not used up.';
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-relativity
  PM.gamma = function (b) { return 1 / M.sqrt(1 - b * b); };
  PM.vAdd = function (u, v) { return (u + v) / (1 + u * v); }; // in units of c
  PM.lorentz = function (ct, x, b) { var g = PM.gamma(b); return [g * (ct - b * x), g * (x - b * ct)]; };
  R('ph-relativity', function (el, o) {
    var mode = pick(o.mode, ['clock', 'contraction', 'simultaneity', 'spacetime', 'addition', 'doppler', 'gravity'], 'clock');
    var F = frame(el, o, { clock: 'A moving light clock', contraction: 'Length contraction', simultaneity: 'Lightning and a moving train: simultaneity', spacetime: 'A spacetime (Minkowski) diagram', addition: 'Adding velocities near the speed of light', doppler: 'The relativistic Doppler effect', gravity: 'Clocks near a massive body' }[mode]);
    var b = clamp(num(o.beta, 0.6), 0, 0.995), c = F.canvas({ aspect: mode === 'spacetime' ? 1.2 : 1.8, narrow: mode === 'spacetime' ? 0.9 : 1.1 }), mp = null;
    var events = arr(o.events || [[2, 1], [3, -1]]).map(function (q) { return [num(q[0], 0), num(q[1], 0)]; }), up = num(o.u, 0.8), rs = num(o.rs, 1), rr = num(o.r, 3);
    var A = ['clock', 'simultaneity', 'gravity', 'doppler'].indexOf(mode) >= 0 ? F.anim({ tmax: mode === 'simultaneity' ? 4 : undefined, loop: true, scrub: mode === 'simultaneity', rate: 1, autoplay: true, tick: mode === 'simultaneity' ? null : function () { return true; }, dt: 0.05 }) : { t: 0 };
    if (F.live) { if (mode !== 'gravity') F.slider(null, { label: mode === 'addition' ? 'Frame speed v (in c)' : 'Speed β = v/c', min: 0, max: 0.99, step: 0.01, value: b, d: 2, input: function (v) { b = v; } }); if (mode === 'addition') F.slider(null, { label: 'Object speed in that frame u′ (in c)', min: 0, max: 0.99, step: 0.01, value: up, d: 2, input: function (v) { up = v; } }); if (mode === 'gravity') F.slider(null, { label: 'Lower clock radius (in r_s)', min: 1.05, max: 6, step: 0.05, value: rr, d: 2, input: function (v) { rr = v; } }); }
    if (F.live && mode === 'spacetime') F.handles(events.map(function (e, i) { return { name: 'event ' + (i + 1), pos: function () { return mp ? [mp.X(e[1]), mp.Y(e[0])] : null; }, drag: function (px, py) { e[1] = M.round(mp.x(px) * 4) / 4; e[0] = M.round(mp.y(py) * 4) / 4; }, key: function (dx, dy, big) { e[1] += dx * (big ? 1 : 0.25); e[0] += dy * (big ? 1 : 0.25); } }; }), { r: 20 });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, g = PM.gamma(b), t = A.t, desc = '', read = '', st = []; bg(c);
      if (mode === 'clock') {
        var hh = H0 * 0.6, y0 = H0 * 0.8, x1 = W0 * 0.18, period = 1.2, ph = (t % period) / period, py = ph < 0.5 ? y0 - hh * ph * 2 : y0 - hh * (2 - ph * 2);
        [[x1, 1, W0 > 560 ? 'clock at rest with you' : 'at rest'], [W0 * 0.55, g, (W0 > 560 ? 'clock moving at ' : 'moving at ') + fm(b, 2) + 'c']].forEach(function (q, i) {
          var per = period * q[1], ph2 = (t % per) / per, yy = ph2 < 0.5 ? y0 - hh * ph2 * 2 : y0 - hh * (2 - ph2 * 2), xs = i ? q[0] + ((t * 40 * b) % (W0 * 0.4)) : q[0], dx = i ? 40 * b * per / 2 : 0;
          line(ctx, xs - 20, y0 + 4, xs + 20, y0 + 4, k.metal, 4); line(ctx, xs - 20, y0 - hh - 4, xs + 20, y0 - hh - 4, k.metal, 4);
          if (i) poly(ctx, [[xs - dx * 2 * ph2, y0], [xs - dx * 2 * ph2 + dx, y0 - hh], [xs - dx * 2 * ph2 + 2 * dx, y0]], { color: rgba(k.gold, 0.4), w: 1.2, dash: [3, 3] });
          circ(ctx, xs, yy, 6, { fill: k.gold }); var ly2 = y0 + 22 + (i && W0 <= 560 ? 34 : 0); txt(ctx, q[2], xs, ly2, { align: 'center', size: 11.5, weight: 700 }); txt(ctx, 'ticks: ' + M.floor(t / per), xs, ly2 + 16, { align: 'center', size: 11, color: k.muted }); F.tagAt(ctx, i ? 'clockB' : 'clockA', xs + 30, y0 - hh / 2); });
        desc = 'Two light clocks: one at rest and one moving at ' + fm(b, 2) + 'c.'; read = 'In the moving clock the light must travel a longer, slanted path at the same speed c, so each tick takes γ = 1/√(1 − β²) = <b>' + fm(g, 3) + '</b> times longer as you measure it. Moving clocks run slow (time dilation). Δt = γΔτ, where τ is the proper time of the clock that is present at both events.'; st = [['γ', fm(g, 4)], ['β', fm(b, 2)]];
      } else if (mode === 'contraction') {
        var L0 = W0 * 0.6, y1 = H0 * 0.35, y2 = H0 * 0.72; [[1, y1, 'at rest: proper length L₀'], [1 / g, y2, 'moving at ' + fm(b, 2) + 'c: L = L₀/γ']].forEach(function (q) { var L = L0 * q[0], x0 = (W0 - L0) / 2; ctx.save(); rrect(ctx, x0, q[1] - 22, L, 44, 22); ctx.fillStyle = k.obj; ctx.fill(); ctx.strokeStyle = k.objLine; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); txt(ctx, q[2] + (F.vals ? ' = ' + fm(100 * q[0], 1) + '% of L₀' : ''), W0 / 2, q[1] - 32, { align: 'center', size: 12, weight: 700 }); line(ctx, x0, q[1] + 30, x0 + L, q[1] + 30, k.disp, 1.5); });
        arrow(ctx, W0 / 2 + L0 / 2 / g + 10, y2, W0 / 2 + L0 / 2 / g + 50, y2, { color: k.vel, w: 2.6, label: 'v' });
        desc = 'A ship of proper length L₀ shown at rest and moving at ' + fm(b, 2) + 'c.'; read = 'Measured from a frame where it moves, the ship is shorter along its motion by γ = <b>' + fm(g, 3) + '</b>: L = <b>' + fm(100 / g, 1) + '%</b> of L₀. Its height is unchanged: only lengths along the motion contract.'; st = [['γ', fm(g, 4)], ['L/L₀', fm(1 / g, 4)]];
      } else if (mode === 'simultaneity') {
        var gy = H0 * 0.62, tw = W0 * 0.6, tx = W0 * 0.2 + b * t * 30, cxg = W0 / 2, sp = (W0 * 0.3) / 4;
        ground(ctx, 10, gy + 20, W0 - 20, k); block(ctx, tx, gy - 30, tw, 46, { fill: k.obj, color: k.objLine, r: 8 }); circ(ctx, tx + tw / 2, gy - 8, 6, { fill: k.purple }); txt(ctx, 'train observer', tx + tw / 2, gy - 42, { align: 'center', size: 11, color: k.purple, weight: 700 }); circ(ctx, cxg, gy + 30, 6, { fill: k.green }); txt(ctx, 'ground observer', cxg, gy + 48, { align: 'center', size: 11, color: k.green, weight: 700 });
        var xa = W0 * 0.2, xb = W0 * 0.8; if (t < 0.3) { [xa, xb].forEach(function (x) { poly(ctx, [[x, 10], [x - 8, gy * 0.4], [x + 6, gy * 0.45], [x - 4, gy - 30]], { color: k.gold, w: 3 }); }); }
        var rad = t * sp; [xa, xb].forEach(function (x) { if (rad > 0) { circ(ctx, x, gy - 8, rad, { color: rgba(k.gold, 0.7), w: 2 }); } });
        var trainHitFront = (xb - (W0 * 0.2 + tw / 2)) / (sp + b * 30), trainHitBack = ((W0 * 0.2 + tw / 2) - xa) / (sp - b * 30);
        desc = 'Lightning strikes both ends of a train at the same moment in the ground frame; the train moves right at ' + fm(b, 2) + 'c.'; read = 'The ground observer, halfway between, gets both flashes together: simultaneous for her. The train observer moves toward the front flash and away from the back one, so the front flash reaches him first; light moves at c in his frame too, so he concludes the front strike happened <b>first</b>. Simultaneity depends on the frame.';
        void trainHitFront; void trainHitBack;
      } else if (mode === 'spacetime') {
        var r = { x: 30, y: 10, w: W0 - 40, h: H0 - 30 }; mp = fitMap(r, -4, 4, 0, 5, true); var X = mp.X, Y = mp.Y; mp.x = mp.x; mp.y = mp.y;
        for (var gx = -4; gx <= 4; gx++) line(ctx, X(gx), Y(0), X(gx), Y(5), k.grid, 1); for (var gy2 = 0; gy2 <= 5; gy2++) line(ctx, X(-4), Y(gy2), X(4), Y(gy2), k.grid, 1);
        line(ctx, X(-4), Y(0), X(4), Y(0), k.axis, 1.6); line(ctx, X(0), Y(0), X(0), Y(5), k.axis, 1.6); txt(ctx, 'x', X(4) - 4, Y(0) - 10, { size: 13, italic: true, serif: true, align: 'right' }); txt(ctx, 'ct', X(0) + 6, Y(5) + 10, { size: 13, italic: true, serif: true });
        if (F.on('lightcone', true)) { line(ctx, X(0), Y(0), X(4), Y(4), k.gold, 2, [6, 4]); line(ctx, X(0), Y(0), X(-4), Y(4), k.gold, 2, [6, 4]); txt(ctx, 'light', X(3.6), Y(3.9), { size: 11, color: k.gold, align: 'right' }); }
        if (F.on('hyperbola', false)) [1, 2, 3].forEach(function (s0) { var pts = []; for (var u = -2; u <= 2; u += 0.05) pts.push([X(s0 * M.sinh(u)), Y(s0 * M.cosh(u))]); poly(ctx, pts, { color: rgba(k.purple, 0.5), w: 1.2 }); });
        line(ctx, X(0), Y(0), X(5 * b), Y(5), k.red, 2.4); txt(ctx, "ct′", X(5 * b) + 6, Y(5) + 12, { size: 13, italic: true, serif: true, color: k.red }); line(ctx, X(0), Y(0), X(4), Y(4 * b), k.red, 2.4); txt(ctx, "x′", X(4) - 6, Y(4 * b) - 10, { size: 13, italic: true, serif: true, color: k.red, align: 'right' }); F.tagAt(ctx, "ct'", X(5 * b) - 16, Y(5) + 16); F.tagAt(ctx, "x'", X(4) - 16, Y(4 * b) + 16);
        events.forEach(function (e, i) { if (F.on('simultaneity', true)) { var x0 = e[1] - e[0] / b * 0; line(ctx, X(e[1] - 4), Y(e[0] - 4 * b), X(e[1] + 4), Y(e[0] + 4 * b), rgba(k.red, 0.35), 1.2, [4, 4]); void x0; } circ(ctx, X(e[1]), Y(e[0]), 6, { fill: [k.blue, k.green, k.purple][i % 3] }); var lt = PM.lorentz(e[0], e[1], b); txt(ctx, 'E' + i + (F.vals ? ' (' + fm(e[1], 2) + ', ' + fm(e[0], 2) + ') → (' + fm(lt[1], 2) + ', ' + fm(lt[0], 2) + ')′' : ''), X(e[1]) + 8, Y(e[0]) - 10, { size: 11, weight: 700, color: [k.blue, k.green, k.purple][i % 3], halo: true }); F.tagAt(ctx, 'E' + i, X(e[1]) - 16, Y(e[0]) + 14); });
        var e0 = events[0], e1 = events[1], l0 = e0 && PM.lorentz(e0[0], e0[1], b), l1 = e1 && PM.lorentz(e1[0], e1[1], b);
        desc = 'A spacetime diagram (x across, ct up) with the axes of a frame moving at ' + fm(b, 2) + 'c and ' + events.length + ' events.'; read = 'The moving frame\'s axes tilt toward the light line. Its lines of equal time (dashed red) are tilted, so events at equal ct in one frame are not simultaneous in the other.' + (l0 && l1 ? ' Here E0 and E1 happen at ct′ = ' + fm(l0[0], 2) + ' and ' + fm(l1[0], 2) + '. The interval (ct)² − x² is the same in both frames: ' + fm(e0[0] * e0[0] - e0[1] * e0[1], 2) + ' for E0.' : '');
      } else if (mode === 'addition') {
        var u = PM.vAdd(up, b), gr = { x: 50, y: 16, w: W0 - 64, h: H0 - 44 }, G = GP(ctx, gr, { xmin: 0, xmax: 1, ymin: 0, ymax: 2, xlab: "u′ (in c)", ylab: 'speed seen from the ground (in c)', compact: true }).frame();
        G.plot(function (x) { return x + b; }, k.muted, 1.6, [5, 4]); G.plot(function (x) { return PM.vAdd(x, b); }, k.acc, 2.6); G.hline(1, k.gold, [3, 3], 1.6); G.dot(up, u, k.red, 5); txt(ctx, 'everyday rule u′ + v', G.X(0.6), G.Y(0.6 + b) - 10, { size: 11, color: k.muted, halo: true, haloColor: k.panelBg }); txt(ctx, 'speed of light', G.X(0.02), G.Y(1) - 10, { size: 11, color: k.gold, weight: 700 });
        desc = 'An object moving at ' + fm(up, 2) + 'c inside a frame that moves at ' + fm(b, 2) + 'c.'; read = 'u = (u′ + v)/(1 + u′v/c²) = <b>' + fm(u, 4) + 'c</b>, not ' + fm(up + b, 2) + 'c. However the speeds combine, the result stays below c; light itself (u′ = c) is c in every frame.'; st = [['relativistic', fm(u, 4) + 'c'], ['everyday rule', fm(up + b, 3) + 'c']];
      } else if (mode === 'doppler') {
        var fr = M.sqrt((1 - b) / (1 + b)), fa = 1 / fr; [['approaching', fa, H0 * 0.32], ['receding', fr, H0 * 0.72]].forEach(function (q) { var pts = []; for (var x = 20; x < W0 - 20; x += 2) pts.push([x, q[2] + 18 * M.sin((x - t * 60) / 18 * q[1])]); poly(ctx, pts, { color: q[1] > 1 ? k.blue : k.red, w: 2 }); txt(ctx, q[0] + ': f × ' + fm(q[1], 3), 20, q[2] - 30, { size: 12, weight: 700, color: q[1] > 1 ? k.blue : k.red }); });
        desc = 'Light from a source moving at ' + fm(b, 2) + 'c, approaching and receding.'; read = 'Receding: f<sub>obs</sub> = f√((1 − β)/(1 + β)) = <b>' + fm(fr, 3) + 'f</b>; approaching: <b>' + fm(fa, 3) + 'f</b>. It includes time dilation, so even sideways motion shifts the frequency a little.'; st = [['receding factor', fm(fr, 4)], ['approaching factor', fm(fa, 4)]];
      } else {
        var rate = M.sqrt(1 - rs / rr), rate2 = M.sqrt(1 - rs / (rr * 3)), cx0 = W0 * 0.2, cy0 = H0 / 2; circ(ctx, cx0, cy0, 26, { fill: '#000', color: k.purple, w: 2 }); txt(ctx, 'mass', cx0, cy0 + 44, { align: 'center', size: 11, color: k.muted });
        [[W0 * 0.45, rate, 'r = ' + fm(rr, 2) + ' r_s'], [W0 * 0.78, rate2, 'r = ' + fm(rr * 3, 2) + ' r_s']].forEach(function (q, i) { circ(ctx, q[0], cy0, 34, { fill: k.bg, color: k.ink, w: 2.5 }); var a = t * q[1] * 2; line(ctx, q[0], cy0, q[0] + 26 * M.sin(a), cy0 - 26 * M.cos(a), k.red, 2.5); txt(ctx, q[2], q[0], cy0 + 50, { align: 'center', size: 11.5, weight: 700 }); txt(ctx, 'rate ' + fm(q[1], 3), q[0], cy0 + 66, { align: 'center', size: 11, color: k.muted }); F.tagAt(ctx, i ? 'clockB' : 'clockA', q[0] + 40, cy0 - 30); });
        desc = 'Two clocks at different distances from a massive body.'; read = 'A clock deeper in gravity runs slow compared with one far away: rate = √(1 − r<sub>s</sub>/r). At ' + fm(rr, 2) + ' r<sub>s</sub> it ticks <b>' + fm(rate, 3) + '</b> times as fast as a distant clock, so its light arrives redshifted by z = <b>' + fm(1 / rate - 1, 3) + '</b>.'; st = [['clock rate', fm(rate, 4)], ['redshift z', fm(1 / rate - 1, 4)]];
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-quantum. Energies in eV, lengths in nm; m in electron masses. ħ²/(2m_e) = 0.0380998 eV·nm².
  var HB2M = 0.0380998;
  PM.boxE = function (n, L, m) { return n * n * PI * PI * HB2M / ((m || 1) * L * L); };
  PM.tunnel = function (E, U0, w, m) { if (E >= U0) return 1; var kap = M.sqrt((m || 1) * (U0 - E) / HB2M), sh = M.sinh(kap * w); return 1 / (1 + U0 * U0 * sh * sh / (4 * E * (U0 - E))); };
  /* PM.finiteWell(U0, L, m): bound-state energies of a finite square well of depth U0 (eV) and width L (nm) */
  PM.finiteWell = function (U0, L, m) {
    var out = [], z0 = L / 2 * M.sqrt((m || 1) * U0 / HB2M);
    function f(z, even) { var q = M.sqrt(M.max(0, z0 * z0 - z * z)); return even ? z * M.tan(z) - q : -z / M.tan(z) - q; }
    for (var n = 0; n * PI / 2 < z0; n++) { var lo = n * PI / 2 + 1e-9, hi = M.min((n + 1) * PI / 2 - 1e-9, z0), even = n % 2 === 0; if (hi <= lo) break; var flo = f(lo, even), fhi = f(hi, even); if (flo * fhi > 0) continue; for (var i = 0; i < 80; i++) { var mid = (lo + hi) / 2, fm2 = f(mid, even); if (flo * fm2 <= 0) { hi = mid; } else { lo = mid; flo = fm2; } } var z = (lo + hi) / 2; out.push(z * z * HB2M / ((m || 1) * (L / 2) * (L / 2))); }
    return out;
  };
  function hermite(n, x) { var h0 = 1, h1 = 2 * x; if (n === 0) return h0; for (var i = 1; i < n; i++) { var h2 = 2 * x * h1 - 2 * i * h0; h0 = h1; h1 = h2; } return h1; }
  var SHELLS = [['1s', 1, 0], ['2s', 2, 0], ['2p', 2, 1], ['3s', 3, 0], ['3p', 3, 1], ['4s', 4, 0], ['3d', 3, 2], ['4p', 4, 1], ['5s', 5, 0], ['4d', 4, 2], ['5p', 5, 1]];
  R('ph-quantum', function (el, o) {
    var mode = pick(o.mode, ['box', 'finite', 'barrier', 'oscillator', 'packet', 'shells', 'bands', 'coulomb', 'degenerate'], 'box');
    var F = frame(el, o, { box: 'A particle in a box', finite: 'A finite potential well', barrier: 'Tunneling through a barrier', oscillator: 'The quantum harmonic oscillator', packet: 'A wave packet and its spread of momenta', shells: 'Filling electron shells', bands: 'Energy bands in solids', coulomb: 'The Coulomb barrier between two protons', degenerate: 'Electrons filling the lowest states' }[mode]);
    var P = { n: M.round(num(o.n, 1)), L: num(o.L, 1), U0: num(o.U0, mode === 'barrier' ? 5 : 2), E: num(o.E, 3), w: num(o.width, 0.3), m: num(o.m, 1), lv: M.round(num(o.levels, 4)), Z: M.round(num(o.Z, 11)), T: num(o.T, 300), dk: num(o.dk, 5), mat: pick(o.material, ['metal', 'semiconductor', 'insulator'], 'semiconductor') };
    var sh = { psi: F.on('psi', true), prob: F.on('prob', false) }, c = F.canvas({ aspect: 1.6, narrow: 1.0 });
    if (F.live) { var row = F.row();
      if (mode === 'box' || mode === 'finite' || mode === 'oscillator') { F.slider(row, { label: 'Highlight level n', min: 1, max: mode === 'finite' ? 6 : 6, step: 1, value: P.n, d: 0, input: function (v) { P.n = v; } }); F.check(row, 'Show |ψ|² (probability)', sh.prob, function (on) { sh.prob = on; }); }
      if (mode === 'box' || mode === 'finite') F.slider(row, { label: 'Width L', min: 0.2, max: 2, step: 0.05, value: P.L, unit: 'nm', d: 2, input: function (v) { P.L = v; } });
      if (mode === 'barrier') { F.slider(row, { label: 'Barrier width', min: 0.05, max: 1, step: 0.01, value: P.w, unit: 'nm', d: 2, input: function (v) { P.w = v; } }); F.slider(row, { label: 'Particle energy E', min: 0.2, max: 4.9, step: 0.1, value: P.E, unit: 'eV', d: 1, input: function (v) { P.E = v; } }); }
      if (mode === 'packet') F.slider(row, { label: 'Spread of wave numbers Δk', min: 1, max: 20, step: 0.5, value: P.dk, unit: '/nm', d: 1, input: function (v) { P.dk = v; } });
      if (mode === 'shells') F.slider(row, { label: 'Atomic number Z', min: 1, max: 36, step: 1, value: P.Z, d: 0, input: function (v) { P.Z = v; } });
      if (mode === 'bands') { F.seg(row, { label: 'Material', items: [['metal', 'Metal'], ['semiconductor', 'Semiconductor'], ['insulator', 'Insulator']], value: P.mat, change: function (v) { P.mat = v; } }); F.slider(row, { label: 'Temperature', min: 50, max: 600, step: 10, value: P.T, unit: 'K', d: 0, input: function (v) { P.T = v; } }); }
    }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, desc = '', read = '', st = []; bg(c);
      var r = { x: 56, y: 14, w: W0 - 70, h: H0 - 40 };
      if (mode === 'box' || mode === 'finite' || mode === 'oscillator') {
        var Es, U, xr, Emax;
        if (mode === 'box') { Es = []; for (var n = 1; n <= P.lv + 2; n++) Es.push(PM.boxE(n, P.L, P.m)); Es = Es.slice(0, M.max(P.lv, P.n)); xr = [-0.15 * P.L, 1.15 * P.L]; Emax = Es[Es.length - 1] * 1.25; U = function (x) { return x < 0 || x > P.L ? 1e9 : 0; }; }
        else if (mode === 'finite') { Es = PM.finiteWell(P.U0, P.L, P.m); xr = [-P.L, 2 * P.L]; Emax = P.U0 * 1.3; U = function (x) { return x < 0 || x > P.L ? P.U0 : 0; }; }
        else { var hw = num(o.hw, 0.5); Es = []; for (n = 0; n < M.max(P.lv, P.n); n++) Es.push((n + 0.5) * hw); var x0s = M.sqrt(HB2M * 2 / hw); xr = [-4 * x0s, 4 * x0s]; Emax = Es[Es.length - 1] * 1.35; U = function (x) { return 0.5 * hw * (x / x0s) * (x / x0s) * 2 / 2; }; U = function (x) { return hw / 2 * (x * x) / (x0s * x0s); }; }
        var G = GP(ctx, r, { xmin: xr[0], xmax: xr[1], ymin: mode === 'oscillator' ? 0 : -Emax * 0.05, ymax: Emax, xlab: 'x (nm)', ylab: 'E (eV)', compact: F.compact }).frame();
        G.clip(); if (mode === 'box') { ctx.fillStyle = rgba(k.ink, 0.15); ctx.fillRect(G.X(xr[0]), r.y, G.X(0) - G.X(xr[0]), r.h); ctx.fillRect(G.X(P.L), r.y, G.X(xr[1]) - G.X(P.L), r.h); line(ctx, G.X(0), r.y, G.X(0), r.y + r.h, k.ink, 3); line(ctx, G.X(P.L), r.y, G.X(P.L), r.y + r.h, k.ink, 3); } else G.plot(function (x) { return M.min(U(x), Emax * 2); }, k.ink, 2.4); ctx.restore();
        var sp = Es.length > 1 ? (Es[1] - Es[0]) : Es[0] || 1;
        Es.forEach(function (E, i) {
          var nq = i + 1, on = nq === P.n, col = on ? k.acc : rgba(k.acc, 0.45);
          var xa = mode === 'box' ? 0 : xr[0], xb = mode === 'box' ? P.L : xr[1]; if (mode === 'oscillator') { var turn = M.sqrt(2 * E / (Es[0] * 2) ) ; void turn; }
          G.line([[mode === 'box' ? 0 : xr[0], E], [mode === 'box' ? P.L : xr[1], E]], on ? k.ink : rgba(k.ink, 0.35), on ? 1.6 : 1, [4, 3]);
          txt(ctx, 'E' + sub(mode === 'oscillator' ? i : nq) + (F.vals ? ' = ' + nf(E, 3) + ' eV' : ''), r.x + r.w - 4, G.Y(E) - 8, { align: 'right', size: 10.5, weight: on ? 800 : 500, color: k.ink, halo: true, haloColor: k.panelBg }); F.tagAt(ctx, 'E' + nq, r.x + 16, G.Y(E) - 10);
          if (!sh.psi && !sh.prob) return; var amp = sp * 0.42, psi;
          if (mode === 'box') psi = function (x) { return x < 0 || x > P.L ? 0 : M.sin(nq * PI * x / P.L); };
          else if (mode === 'finite') { var kk = M.sqrt(P.m * E / HB2M), kap = M.sqrt(P.m * (P.U0 - E) / HB2M), even = i % 2 === 0, cx0 = P.L / 2; psi = function (x) { var u = x - cx0; if (M.abs(u) <= P.L / 2) return even ? M.cos(kk * u) : M.sin(kk * u); var edge = even ? M.cos(kk * P.L / 2) : M.sin(kk * P.L / 2) * M.sign(u); return edge * M.exp(-kap * (M.abs(u) - P.L / 2)); }; var mxp = 0; for (var q = 0; q <= 100; q++) mxp = M.max(mxp, M.abs(psi(xr[0] + (xr[1] - xr[0]) * q / 100))); var p0 = psi; psi = function (x) { return p0(x) / mxp; }; }
          else { var x0s2 = M.sqrt(HB2M * 2 / num(o.hw, 0.5)), ii = i; psi = function (x) { var z = x / x0s2; return hermite(ii, z) * M.exp(-z * z / 2); }; var mx3 = 0; for (q = 0; q <= 200; q++) mx3 = M.max(mx3, M.abs(psi(xr[0] + (xr[1] - xr[0]) * q / 200))); var p1 = psi; psi = function (x) { return p1(x) / mx3; }; }
          if (sh.prob) G.fill(function (x) { var p = psi(x); return E + amp * p * p; }, xa, xb, rgba(k.acc, on ? 0.35 : 0.12), E);
          if (sh.psi && !sh.prob) G.plot(function (x) { return E + amp * psi(x); }, col, on ? 2.4 : 1.4, null, xa, xb);
          if (on && sh.prob) G.plot(function (x) { var p = psi(x); return E + amp * p * p; }, k.acc, 2.2, null, xa, xb);
          F.tagAt(ctx, 'psi' + nq, G.X(xa + (xb - xa) * 0.25), G.Y(E + amp * 0.8));
        });
        var Ehi = Es[P.n - 1];
        if (mode === 'box') { desc = 'An electron in a box ' + un(P.L, 'nm') + ' wide with its first ' + Es.length + ' energy levels.'; read = 'Only standing waves fit, so E<sub>n</sub> = n²h²/(8mL²): E₁ = <b>' + un(Es[0], 'eV', 3) + '</b>. The lowest energy is <b>not zero</b>: a confined particle always moves. ψ is not a probability; |ψ|² is the probability density, and its area is 1.' + (sh.prob ? ' For n = ' + P.n + ' there are ' + (P.n - 1) + ' points where the electron is never found.' : ''); st = [['E₁', un(Es[0], 'eV', 3)], ['E' + sub(P.n), Ehi != null ? un(Ehi, 'eV', 3) : '—']]; }
        else if (mode === 'finite') { desc = 'A finite well ' + un(P.L, 'nm') + ' wide and ' + un(P.U0, 'eV') + ' deep with ' + Es.length + ' bound states.'; read = 'Only ' + Es.length + ' states fit below the rim. The wave leaks into the walls and dies off there: the particle can be found where E < U, which classical physics forbids. Each level sits a little lower than in an infinite box of the same width.'; st = [['bound states', String(Es.length)], ['E₁', Es[0] != null ? un(Es[0], 'eV', 3) : '—']]; }
        else { desc = 'The quantum harmonic oscillator with evenly spaced levels.'; read = 'E<sub>n</sub> = (n + ½)ħω: the levels are <b>evenly spaced</b> and the lowest, ½ħω, is not zero. The wave extends a little past the classical turning points.'; }
      } else if (mode === 'barrier') {
        var Tt = PM.tunnel(P.E, P.U0, P.w, P.m), kap2 = M.sqrt(P.m * M.max(0, P.U0 - P.E) / HB2M), kk2 = M.sqrt(P.m * P.E / HB2M), xs = [-1.5, 1.5 + P.w], G2 = GP(ctx, r, { xmin: xs[0], xmax: xs[1], ymin: 0, ymax: P.U0 * 1.5, xlab: 'x (nm)', ylab: 'E (eV)', compact: true }).frame();
        G2.clip(); ctx.fillStyle = rgba(k.ink, 0.15); ctx.fillRect(G2.X(0), G2.Y(P.U0), G2.X(P.w) - G2.X(0), G2.Y(0) - G2.Y(P.U0)); ctx.restore(); G2.line([[xs[0], 0], [0, 0], [0, P.U0], [P.w, P.U0], [P.w, 0], [xs[1], 0]], k.ink, 2.2); F.tagAt(ctx, 'barrier', G2.X(P.w / 2), G2.Y(P.U0) - 14);
        G2.hline(P.E, k.gold, [5, 4]); var amp2 = P.U0 * 0.22; G2.plot(function (x) { if (x < 0) return P.E + amp2 * M.cos(kk2 * x * TAU / TAU); if (x <= P.w) return P.E + amp2 * M.exp(-kap2 * x); return P.E + amp2 * M.sqrt(Tt) * M.cos(kk2 * (x - P.w)); }, k.acc, 2.2);
        desc = 'A particle with ' + un(P.E, 'eV') + ' meeting a ' + un(P.U0, 'eV') + ' barrier ' + un(P.w, 'nm') + ' wide.'; read = 'Classically it must bounce back (E < U). Quantum mechanically the wave decays inside the barrier but is not zero at the far side, so a fraction gets through: T ≈ <b>' + nf(Tt, 3) + '</b>. Thinner or lower barriers let far more through; this is how alpha decay and the Sun\'s fusion happen.'; st = [['transmission', nf(Tt, 3)], ['decay length 1/κ', un(1 / M.max(kap2, 1e-9), 'nm', 3)]];
      } else if (mode === 'packet') {
        var k0 = 25, dk = P.dk, dx = 1 / (2 * dk), half = r.h / 2 - 6, r1 = { x: r.x, y: r.y, w: r.w, h: half }, r2 = { x: r.x, y: r.y + half + 22, w: r.w, h: half - 10 };
        var G3 = GP(ctx, r1, { xmin: -2, xmax: 2, ymin: -1.1, ymax: 1.1, xlab: 'x (nm)', ylab: 'ψ (real part) and |ψ|²', compact: true, yticks: false }).frame(); G3.plot(function (x) { return M.exp(-x * x / (4 * dx * dx)) * M.cos(k0 * x); }, rgba(k.acc, 0.6), 1.4); G3.plot(function (x) { return M.exp(-x * x / (2 * dx * dx)); }, k.acc, 2.4);
        var G4 = GP(ctx, r2, { xmin: 0, xmax: 50, ymin: 0, ymax: 1.1, xlab: 'k (1/nm)', ylab: 'spread of k (momentum)', compact: true, yticks: false }).frame(); G4.plot(function (kx) { return M.exp(-(kx - k0) * (kx - k0) / (2 * dk * dk)); }, k.purple, 2.4);
        desc = 'A wave packet made from wave numbers spread by Δk = ' + fm(dk, 1) + ' /nm.'; read = 'Adding waves with a spread of wavelengths makes a lump: a <b>wide</b> spread of k (momentum) gives a <b>narrow</b> packet in x, and the reverse. Δx·Δk = <b>' + fm(dx * dk, 2) + '</b> (the minimum, ½), so Δx·Δp ≥ ħ/2. The uncertainty is part of what a wave is, not a flaw in our tools.'; st = [['Δx', un(dx, 'nm', 3)], ['Δk', un(dk, '/nm', 3)], ['Δx·Δk', fm(dx * dk, 3)]];
      } else if (mode === 'shells') {
        var left = P.Z, y = 20, colW = M.min(W0 - 120, 300); SHELLS.forEach(function (s0) { if (y > H0 - 30) return; var l = s0[2], nOrb = 2 * l + 1, cap = 2 * nOrb, put = M.min(left, cap); left -= put; var bw = 26, x0 = 80; txt(ctx, s0[0], x0 - 12, y + 12, { align: 'right', size: 13, weight: 800, color: put ? k.ink : k.muted }); for (var b = 0; b < nOrb; b++) { rrect(ctx, x0 + b * (bw + 4), y, bw, 24, 4); ctx.strokeStyle = k.ink; ctx.lineWidth = 1.5; ctx.stroke(); var ups = put > b ? 1 : 0, downs = put > nOrb + b ? 1 : 0; if (ups) arrow(ctx, x0 + b * (bw + 4) + 9, y + 20, x0 + b * (bw + 4) + 9, y + 4, { color: k.red, w: 2, head: 6 }); if (downs) arrow(ctx, x0 + b * (bw + 4) + 18, y + 4, x0 + b * (bw + 4) + 18, y + 20, { color: k.blue, w: 2, head: 6 }); } txt(ctx, 'n = ' + s0[1] + ', l = ' + l + (W0 <= 560 ? '' : l ? ' (m_l = −' + l + ' … ' + l + ')' : ' (m_l = 0)'), x0 + nOrb * (bw + 4) + 8, y + 12, { size: 10.5, color: k.muted }); y += 32; void colW; });
        desc = 'Electron configuration for Z = ' + P.Z + ', filling subshells from the lowest energy.'; read = 'Each box is one orbital (n, l, m<sub>l</sub>) and holds at most two electrons with opposite spins (m<sub>s</sub> = +½, −½): the exclusion principle. l runs from 0 to n − 1, so there is no 1p or 2d. Electrons spread out over a subshell\'s boxes before pairing up. "Spin" is a built-in property, not a spinning ball.';
      } else if (mode === 'bands') {
        var gap = P.mat === 'metal' ? -0.5 : P.mat === 'semiconductor' ? 1.12 : 5.5, kT = 8.617e-5 * P.T, frac = P.mat === 'metal' ? 1 : M.exp(-gap / (2 * kT)), cx0 = W0 * 0.3, bw2 = W0 * 0.3, vTop = H0 * 0.58, cBot = P.mat === 'metal' ? vTop - 20 : vTop - clamp(gap, 0, 6) * 30 - 10;
        rrect(ctx, cx0, vTop, bw2, H0 - vTop - 20, 6); ctx.fillStyle = rgba(k.blue, 0.4); ctx.fill(); rrect(ctx, cx0, 20, bw2, cBot - 20, 6); ctx.fillStyle = rgba(k.blue, P.mat === 'metal' ? 0.25 : 0.08); ctx.fill(); ctx.strokeStyle = k.ink; ctx.stroke();
        txt(ctx, 'valence band (full)', cx0 + bw2 + 8, (vTop + H0 - 20) / 2, { size: 11.5, weight: 700 }); txt(ctx, 'conduction band', cx0 + bw2 + 8, (20 + cBot) / 2, { size: 11.5, weight: 700 }); if (gap > 0) { arrow(ctx, cx0 - 14, vTop, cx0 - 14, cBot, { color: k.gold, w: 1.6, double: true, head: 6 }); txt(ctx, 'gap ' + fm(gap, 2) + ' eV', cx0 - 20, (vTop + cBot) / 2, { align: 'right', size: 11, weight: 700, color: k.gold }); F.tagAt(ctx, 'gap', cx0 - 60, (vTop + cBot) / 2 - 18); }
        var nE = P.mat === 'metal' ? 18 : M.min(18, M.round(frac * 4e9)); var R1 = rng(4); for (var e = 0; e < nE; e++) circ(ctx, cx0 + 10 + R1() * (bw2 - 20), cBot - 10 - R1() * M.min(40, cBot - 40), 3.5, { fill: k.red });
        desc = 'Energy bands of a ' + P.mat + ' at ' + un(P.T, 'K') + '.'; read = P.mat === 'metal' ? 'In a metal the bands overlap: many electrons have empty states just above them, so they move freely. Metals conduct a little <b>worse</b> when hot (the atoms vibrate more and scatter electrons).' : P.mat === 'semiconductor' ? 'A small gap (' + fm(gap, 2) + ' eV, like silicon): heat lifts a few electrons across, and their number grows steeply with temperature (∝ e<sup>−E<sub>g</sub>/2kT</sup>). So a semiconductor conducts <b>better</b> when warm.' : 'A wide gap: almost no electrons can cross at ordinary temperatures, so it does not conduct.';
      } else if (mode === 'coulomb') {
        var rn = 1.5, Ebar = 1.44 / rn, kT2 = 8.617e-5 * 1.57e7 / 1e6, G5 = GP(ctx, r, { xmin: 0, xmax: 10, ymin: -1.2, ymax: 1.3, xlab: 'separation (fm)', ylab: 'potential energy (MeV)', compact: true }).frame();
        G5.plot(function (x) { return x < rn ? -1 : 1.44 / x; }, k.ink, 2.4); G5.hline(kT2, k.red, [4, 3]); txt(ctx, 'typical thermal energy in the Sun\'s core: ' + fm(kT2 * 1000, 2) + ' keV', G5.X(3), G5.Y(kT2) - 10, { size: 11, color: k.red, weight: 700, halo: true, haloColor: k.panelBg }); txt(ctx, 'Coulomb barrier ≈ ' + fm(Ebar, 2) + ' MeV', G5.X(rn) + 8, G5.Y(Ebar), { size: 11, weight: 700, halo: true, haloColor: k.panelBg }); F.tagAt(ctx, 'barrier', G5.X(rn) + 10, G5.Y(Ebar) - 20);
        desc = 'The electric repulsion between two protons with the short-range nuclear attraction inside about 1.5 fm.'; read = 'To fuse, two protons must get within about a femtometer, past a barrier near ' + fm(Ebar, 2) + ' MeV. In the Sun\'s core (15.7 million K) a typical proton has only about 1.4 keV, hundreds of times too little. Protons do not climb over; a rare few <b>tunnel through</b>, which is why the Sun burns slowly and steadily.';
      } else { // degenerate
        var nLev = 10, nEl2 = M.round(num(o.N, 14)), dE = (H0 - 60) / nLev; for (var i3 = 0; i3 < nLev; i3++) { var yy = H0 - 30 - i3 * dE; line(ctx, W0 * 0.3, yy, W0 * 0.6, yy, k.ink, 1.6); for (var s = 0; s < 2; s++) { if (i3 * 2 + s < nEl2) arrow(ctx, W0 * 0.42 + s * 22, yy + (s ? -14 : -2), W0 * 0.42 + s * 22, yy + (s ? -2 : -14), { color: s ? k.blue : k.red, w: 2, head: 5 }); } }
        var fl = H0 - 30 - (M.ceil(nEl2 / 2) - 1) * dE; line(ctx, W0 * 0.25, fl - 8, W0 * 0.65, fl - 8, k.gold, 1.5, [5, 4]); txt(ctx, 'Fermi energy', W0 * 0.66, fl - 8, { size: 11.5, weight: 700, color: k.gold });
        desc = nEl2 + ' electrons filling the lowest energy levels, two per level.'; read = 'Even at absolute zero, electrons cannot all sit in the lowest level: the exclusion principle allows two per state (spin up and down), so they stack up to the Fermi energy. Those fast electrons push back when squeezed: <b>degeneracy pressure</b>, which holds up white dwarfs without any heat.';
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // shared: a dark "space" canvas (as in the Science Lab), the same in both site themes
  function spaceBg(c, seed) { var ctx = c.ctx, k = K(); bg(c, k.space); var R0 = rng(seed || 9); for (var i = 0; i < 90; i++) { var x = R0() * c.w, y = R0() * c.h, s = R0(); ctx.fillStyle = 'rgba(219,231,239,' + (0.15 + 0.5 * s * s) + ')'; ctx.fillRect(x, y, s > 0.9 ? 1.6 : 1, s > 0.9 ? 1.6 : 1); } }
  function sTxt(ctx, s, x, y, o) { o = o || {}; var k = K(); return txt(ctx, s, x, y, Object.assign({ color: k.sInk, halo: true, haloColor: 'rgba(7,18,28,0.85)' }, o)); }
  function sGP(ctx, r, o) { var k = K(); return GP(ctx, r, Object.assign({ bgColor: k.space2, gridColor: k.sGrid, axisColor: k.sMuted, tickColor: k.sMuted, labColor: k.sInk, compact: true }, o)).frame(); }

  // ===================================================================================================
  // ph-orbit. Kepler orbits use AU, years and solar masses (G M = 4π² AU³/yr² for the Sun) unless a mode says otherwise.
  /* PM.kepler(a, e, P, t): position on an ellipse with the central body at a focus (the origin), perihelion on +x */
  PM.kepler = function (a, e, P, t) { var Mn = TAU * (((t / P) % 1) + 1) % TAU, E = Mn; for (var i = 0; i < 30; i++) E -= (E - e * M.sin(E) - Mn) / (1 - e * M.cos(E)); var x = a * (M.cos(E) - e), y = a * M.sqrt(1 - e * e) * M.sin(E); return { x: x, y: y, r: M.hypot(x, y), E: E }; };
  PM.visviva = function (GM, r, a) { return M.sqrt(GM * (2 / r - 1 / a)); };
  PM.hohmann = function (GM, r1, r2) { var at = (r1 + r2) / 2; return { dv1: M.sqrt(GM / r1) * (M.sqrt(2 * r2 / (r1 + r2)) - 1), dv2: M.sqrt(GM / r2) * (1 - M.sqrt(2 * r1 / (r1 + r2))), t: PI * M.sqrt(at * at * at / GM) }; };
  var PLANETS = [['Mercury', 0.387, 0.206], ['Venus', 0.723, 0.007], ['Earth', 1.0, 0.017], ['Mars', 1.524, 0.093], ['Jupiter', 5.203, 0.048], ['Saturn', 9.537, 0.054], ['Uranus', 19.19, 0.047], ['Neptune', 30.07, 0.009]];
  R('ph-orbit', function (el, o) {
    var mode = pick(o.mode, ['kepler', 'areas', 'cannon', 'energy', 'transfer', 'comet', 'binary', 'transit', 'shell', 'rotation-curve', 'tides', 'blackhole', 'field'], 'kepler');
    var F = frame(el, o, { kepler: 'A planet on an elliptical orbit', areas: 'Equal areas in equal times', cannon: 'Newton\'s cannon', energy: 'Energy of an orbit', transfer: 'A transfer orbit between two circular orbits', comet: 'A comet and its tail', binary: 'Two stars orbiting their center of mass', transit: 'A planet passing in front of its star', shell: 'Gravity inside and outside a planet', 'rotation-curve': 'A galaxy\'s rotation curve', tides: 'Tidal stretching by the Moon', blackhole: 'A black hole and its event horizon', field: 'The gravitational field around a mass' }[mode]);
    var P = { a: num(o.a, mode === 'comet' ? 17.8 : 1), e: clamp(num(o.e, mode === 'comet' ? 0.967 : mode === 'areas' ? 0.6 : mode === 'kepler' ? 0.5 : 0.4), 0, 0.99), M: num(o.M, 1), m2: num(o.m2, mode === 'binary' ? 0.5 : 0.001), v0: num(o.v0, 7.5), r0: num(o.r0, 6.371e6 + 1.5e6) };
    var sh = { foci: F.on('foci', true), areas: F.on('areas', mode === 'areas'), vel: F.on('velocity', true), en: F.on('energy', mode === 'energy'), pa: F.on('pa', mode === 'kepler') && mode !== 'energy', rv: F.on('rv', mode === 'binary'), lc: F.on('lightcurve', mode === 'transit'), vals: F.vals };
    var GMs = 4 * PI * PI * P.M, Pyr = M.sqrt(P.a * P.a * P.a / P.M), c = F.canvas({ aspect: mode === 'comet' ? 2.2 : 1.6, narrow: mode === 'comet' ? 1.6 : mode === 'energy' || mode === 'kepler' ? 0.72 : 1.0 });
    var tmax = mode === 'kepler' || mode === 'areas' || mode === 'energy' || mode === 'comet' ? Pyr : mode === 'binary' ? 1 : mode === 'transit' ? 1 : mode === 'transfer' ? 3 : mode === 'cannon' ? 1 : 1;
    var S = { cannonPath: null };
    var A = /^(kepler|areas|energy|comet|cannon|transfer|binary|transit)$/.test(mode) ? F.anim({ tmax: tmax, loop: true, rate: mode === 'comet' ? Pyr / 10 : mode === 'transfer' ? 0.4 : mode === 'cannon' ? 0.12 : mode === 'kepler' || mode === 'areas' || mode === 'energy' ? Pyr / 6 : 0.2, autoplay: true, dt: tmax / 60, tfmt: function (v) { return mode === 'kepler' || mode === 'areas' || mode === 'energy' || mode === 'comet' ? fd(v, 2, 'yr') : fd(v * 100, 0, '%'); } }) : { t: 0 };
    if (F.live) {
      var row = F.row();
      if (mode === 'kepler' || mode === 'areas' || mode === 'energy') { F.slider(row, { label: 'Eccentricity e', min: 0, max: 0.9, step: 0.01, value: P.e, d: 2, input: function (v) { P.e = v; } }); F.slider(row, { label: 'Semi-major axis a', min: 0.3, max: 5, step: 0.1, value: P.a, unit: 'AU', d: 1, input: function (v) { P.a = v; Pyr = M.sqrt(v * v * v / P.M); } }); }
      if (mode === 'cannon') F.slider(row, { label: 'Launch speed', min: 2, max: 12, step: 0.1, value: P.v0, unit: 'km/s', d: 1, input: function (v) { P.v0 = v; S.cannonPath = null; } });
      if (mode === 'binary') F.slider(row, { label: 'Mass of star 2 (star 1 = 1)', min: 0.1, max: 1, step: 0.05, value: P.m2, unit: 'M☉', d: 2, input: function (v) { P.m2 = v; } });
      if (mode === 'transfer') { F.slider(row, { label: 'Outer orbit radius', min: 1.2, max: 5, step: 0.1, value: num(o.r2, 1.52), unit: 'AU', d: 2, input: function (v) { o.r2 = v; } }); }
    }
    function cannonPath() { // integrate from a mountain top at r0 with horizontal speed v0 (km/s); Earth GM = 3.986e14
      var GM = 3.986004e14, x = 0, y = P.r0, vx = P.v0 * 1000, vy = 0, pts = [[x, y]], dt = 2, crashed = false, escaped = false;
      for (var i = 0; i < 40000; i++) { var r = M.hypot(x, y), a = -GM / (r * r * r); var ax = a * x, ay = a * y; vx += ax * dt; vy += ay * dt; x += vx * dt; y += vy * dt; if (i % 8 === 0) pts.push([x, y]); if (M.hypot(x, y) < 6.371e6) { crashed = true; break; } if (M.hypot(x, y) > 6e7) { escaped = true; break; } if (i > 200 && M.hypot(x - 0, y - P.r0) < 2e5 && x > -1) { pts.push([0, P.r0]); break; } }
      return { pts: pts, crashed: crashed, escaped: escaped, vc: M.sqrt(GM / P.r0) / 1000, ve: M.sqrt(2 * GM / P.r0) / 1000 };
    }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, t = A.t, desc = '', read = '', st = []; spaceBg(c, 3);
      if (mode === 'kepler' || mode === 'areas' || mode === 'energy' || mode === 'comet') {
        var a = P.a, e = P.e, b = a * M.sqrt(1 - e * e), side = (sh.en || sh.pa) && mode !== 'comet', wide = W0 > 560, sw = wide && side ? W0 * 0.64 : W0, nb = side && !wide, mp = fitMap({ x: 14, y: 14, w: sw - 28, h: nb ? H0 * 0.56 : H0 - 28 }, -a * (1 + e) - 0.05 * a, a * (1 - e) + 0.05 * a + (mode === 'comet' ? a * 0.02 : 0), -b * 1.1, b * 1.1, true), X = mp.X, Y = mp.Y, Pr = M.sqrt(a * a * a / P.M);
        ctx.save(); ctx.strokeStyle = k.sLine; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(X(-a * e), Y(0), a * mp.sx, b * mp.sx, 0, 0, TAU); ctx.stroke(); ctx.restore();
        var sunR = mode === 'comet' ? 6 : 12; var gg = ctx.createRadialGradient(X(0), Y(0), 1, X(0), Y(0), sunR * 2.4); gg.addColorStop(0, '#fff6d5'); gg.addColorStop(0.5, '#ffd479'); gg.addColorStop(1, 'rgba(255,212,121,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(X(0), Y(0), sunR * 2.4, 0, TAU); ctx.fill(); F.tagAt(ctx, 'star', X(0) + 18, Y(0) - 18);
        if (sh.foci) { circ(ctx, X(-2 * a * e), Y(0), 3.5, { color: k.sMuted, w: 1.5 }); sTxt(ctx, 'empty focus', X(-2 * a * e), Y(0) + 14, { align: 'center', size: 10.5, color: k.sMuted }); F.tagAt(ctx, 'F1', X(0) - 16, Y(0) + 18); F.tagAt(ctx, 'F2', X(-2 * a * e) - 16, Y(0) + 18); line(ctx, X(-a * e - a), Y(0), X(-a * e + a), Y(0), k.sLine, 1, [4, 4]); var pX = X(a * (1 - e)), aX = X(-a * (1 + e)), pOut = pX + 70 < sw, aOut = aX - 64 > 0; sTxt(ctx, 'perihelion', pOut ? pX + 6 : pX - 6, Y(0) + (pOut ? -12 : 14), { size: 10.5, color: k.sMuted, align: pOut ? 'left' : 'right' }); sTxt(ctx, 'aphelion', aOut ? aX - 4 : aX + 6, Y(0) + (aOut ? -12 : -14), { size: 10.5, color: k.sMuted, align: aOut ? 'right' : 'left' }); F.tagAt(ctx, 'peri', X(a * (1 - e)) + 10, Y(0) + 14); F.tagAt(ctx, 'apo', X(-a * (1 + e)) - 10, Y(0) + 14); }
        if (sh.areas) { var nA = 8; for (var i = 0; i < nA; i++) { if (i % 2) continue; var t0 = i / nA * Pr, t1 = (i + 1) / nA * Pr, pts = [[X(0), Y(0)]]; for (var j = 0; j <= 20; j++) { var q = PM.kepler(a, e, Pr, t0 + (t1 - t0) * j / 20); pts.push([X(q.x), Y(q.y)]); } poly(ctx, pts, { fill: rgba(k.sGold, 0.22), color: rgba(k.sGold, 0.6), w: 1, close: true }); } sTxt(ctx, 'each shaded wedge takes the same time', 14, H0 - 14, { size: 11, color: k.sGold }); F.tagAt(ctx, 'A0', X(PM.kepler(a, e, Pr, Pr / 16).x), Y(PM.kepler(a, e, Pr, Pr / 16).y)); }
        var pos = PM.kepler(a, e, Pr, t), v = PM.visviva(GMs, pos.r, a), ang = M.atan2(pos.y, pos.x), fpa;
        var Ec = pos.E, vxv = -M.sin(Ec), vyv = M.sqrt(1 - e * e) * M.cos(Ec), vl = M.hypot(vxv, vyv); vxv /= vl; vyv /= vl; void ang; void fpa;
        if (mode === 'comet') { var tl = clamp(0.6 / pos.r, 0.05, 1.5) * a * 0.25; ctx.save(); var tx = pos.x / pos.r, ty = pos.y / pos.r, gt = ctx.createLinearGradient(X(pos.x), Y(pos.y), X(pos.x + tx * tl), Y(pos.y + ty * tl)); gt.addColorStop(0, 'rgba(180,220,255,0.8)'); gt.addColorStop(1, 'rgba(180,220,255,0)'); ctx.strokeStyle = gt; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X(pos.x), Y(pos.y)); ctx.lineTo(X(pos.x + tx * tl), Y(pos.y + ty * tl)); ctx.stroke(); ctx.restore(); circ(ctx, X(pos.x), Y(pos.y), 4, { fill: '#e7f5ff' }); sTxt(ctx, 'tail points away from the Sun', X(pos.x + tx * tl) + 6, Y(pos.y + ty * tl), { size: 11, color: k.sBlue }); }
        else { circ(ctx, X(pos.x), Y(pos.y), 7, { fill: k.sBlue }); F.tagAt(ctx, 'planet', X(pos.x) + 14, Y(pos.y) - 14); }
        if (sh.vel && mode !== 'comet') { var vlen = clamp(42 * v / (TAU * M.sqrt(P.M / a)), 8, 120), tipX = X(pos.x) + vxv * vlen, tipY = Y(pos.y) - vyv * vlen; arrow(ctx, X(pos.x), Y(pos.y), tipX, tipY, { color: k.sAcc, w: 2.6 }); sTxt(ctx, sh.vals ? un(v * 4.74, 'km/s', 3) : 'v', tipX + (vxv >= 0 ? 6 : -6), tipY + (vyv >= 0 ? -8 : 10), { size: 11, weight: 700, color: k.sAcc, align: vxv >= 0 ? 'left' : 'right' }); }
        if (sh.pa && !sh.en && side) { var gR = nb ? { x: 48, y: H0 * 0.56 + 30, w: W0 - 62, h: H0 * 0.44 - 64 } : { x: sw + 44, y: 18, w: W0 - sw - 56, h: H0 - 52 }, GPa = sGP(ctx, gR, { xmin: -0.5, xmax: 1.6, ymin: -0.8, ymax: 2.4, xlab: 'log₁₀ a (AU)', ylab: 'log₁₀ P (yr)', xstep: 0.5, ystep: 1 }); GPa.plot(function (x) { return 1.5 * x - 0.5 * M.log10(P.M); }, rgba('#8fb3c6', 0.8), 1.4, [4, 3]); PLANETS.forEach(function (q) { GPa.dot(M.log10(q[1]), 1.5 * M.log10(q[1]), '#dbe7ef', 3.2); if (q[1] > 1.3 || q[0] === 'Mercury') sTxt(ctx, q[0], GPa.X(M.log10(q[1])) + 5, GPa.Y(1.5 * M.log10(q[1])) + 9, { size: 9.5, color: k.sMuted }); }); GPa.dot(M.log10(a), M.log10(Pr), k.sBlue, 5.5); sTxt(ctx, 'P² = a³: slope 3/2', gR.x + 6, gR.y + gR.h - 10, { size: 10.5, color: k.sMuted }); }
        if (sh.en) { var Kp = 0.5 * v * v, Up = -GMs / pos.r, Ep = -GMs / (2 * a), mxE = GMs / (a * (1 - e)); var bR = nb ? { x: 14, y: H0 * 0.56 + 24, w: W0 - 28, h: H0 * 0.44 - 66 } : { x: sw + 10, y: 16, w: W0 - sw - 24, h: H0 - 56 }, z0 = bR.y + bR.h / 2, bs = (bR.h / 2 - 8), bwd = M.min(44, bR.w / 4); rrect(ctx, bR.x, bR.y, bR.w, bR.h + 30, 8); ctx.fillStyle = k.space2; ctx.fill(); line(ctx, bR.x + 6, z0, bR.x + bR.w - 6, z0, k.sMuted, 1.4);
        [['K', Kp / mxE, '#63e6be'], ['U', Up / mxE, '#74c0fc'], ['E = K + U', Ep / mxE, '#ffd479']].forEach(function (q, i) { var bx0 = bR.x + bR.w * (i + 0.5) / 3 - bwd / 2, hh = q[1] * bs; ctx.fillStyle = i === 2 ? rgba(q[2], 0.35) : q[2]; ctx.fillRect(bx0, hh >= 0 ? z0 - hh : z0, bwd, M.abs(hh)); if (i === 2) { ctx.strokeStyle = q[2]; ctx.lineWidth = 1.5; ctx.strokeRect(bx0, hh >= 0 ? z0 - hh : z0, bwd, M.abs(hh)); } sTxt(ctx, q[0], bx0 + bwd / 2, bR.y + bR.h + 14, { align: 'center', size: 12, weight: 800, color: q[2] }); F.tagAt(ctx, 'b' + (i === 2 ? 'E' : q[0]), bx0 + bwd + 12, z0 - 12); }); }
        var pl = PLANETS.reduce(function (bst, q) { return M.abs(q[1] - a) < M.abs(bst[1] - a) ? q : bst; }, PLANETS[0]);
        desc = mode === 'comet' ? 'A comet on a long ellipse (a = ' + un(a, 'AU') + ', e = ' + fm(e, 3) + ') with its tail.' : 'A planet on an ellipse with a = ' + un(a, 'AU', 3) + ' and e = ' + fm(e, 2) + ' around a ' + fm(P.M, 2) + ' solar-mass star.';
        read = mode === 'areas' ? 'Kepler\'s second law: the line from the Sun to the planet sweeps out <b>equal areas in equal times</b>, so the planet moves fastest at perihelion and slowest at aphelion (angular momentum is conserved).' : mode === 'comet' ? 'Sunlight and the solar wind push the gas and dust away from the Sun, so a comet\'s tail always points <b>away from the Sun</b>, even when the comet is heading outward, and grows near perihelion.' : mode === 'energy' ? 'K and U trade places around the orbit, but E = K + U = −GMm/2a stays fixed. Closer in, the planet is lower in the well and faster.' : 'Period P = √(a³/M) = <b>' + un(Pr, 'yr', 3) + '</b> (Kepler\'s third law, a in AU, M in solar masses): twice as far takes 2√2 ≈ 2.8 times as long. Speed now <b>' + un(v * 4.74, 'km/s', 3) + '</b> (vis-viva). Most planets\' orbits are nearly circles: ' + pl[0] + '\'s e = ' + fm(pl[2], 3) + '.';
        st = mode === 'comet' ? [['period', un(Pr, 'yr', 3)], ['perihelion', un(a * (1 - e), 'AU', 3)], ['aphelion', un(a * (1 + e), 'AU', 3)]] : [['period', un(Pr, 'yr', 3)], ['distance now', un(pos.r, 'AU', 3)], ['speed now', un(v * 4.74, 'km/s', 3)]];
      } else if (mode === 'cannon') {
        if (!S.cannonPath) S.cannonPath = cannonPath(); var cp = S.cannonPath, mp2 = fitMap({ x: 10, y: 10, w: W0 - 20, h: H0 - 20 }, -2.4e7, 2.4e7, -2e7, 1.4e7, true), X2 = mp2.X, Y2 = mp2.Y;
        circ(ctx, X2(0), Y2(0), 6.371e6 * mp2.sx, { fill: '#1d4a6b', color: '#74c0fc', w: 2 }); poly(ctx, [[X2(-4e5), Y2(6.371e6)], [X2(0), Y2(P.r0) - 4], [X2(4e5), Y2(6.371e6)]], { fill: '#8b7355', close: true });
        var n = M.max(2, M.round(cp.pts.length * clamp(A.t, 0, 1))); poly(ctx, cp.pts.slice(0, n).map(function (p) { return [X2(p[0]), Y2(p[1])]; }), { color: k.sGold, w: 2.4 }); var pc = cp.pts[n - 1]; circ(ctx, X2(pc[0]), Y2(pc[1]), 4.5, { fill: '#fff' });
        desc = 'A cannonball fired sideways at ' + un(P.v0, 'km/s') + ' from a very tall mountain.'; read = P.v0 < cp.vc - 0.05 ? 'Too slow to stay up: it curves down and hits Earth. Faster shots land farther away.' : P.v0 < cp.vc + 0.05 ? 'At about <b>' + un(cp.vc, 'km/s', 3) + '</b> the ground curves away as fast as the ball falls: a circular orbit. It is still falling the whole time; there is plenty of gravity up there.' : P.v0 < cp.ve ? 'Faster than circular: the orbit stretches into an ellipse, coming back to the mountain top.' : 'At escape speed √(2GM/r) ≈ <b>' + un(cp.ve, 'km/s', 3) + '</b> or more it never comes back.'; st = [['circular speed', un(cp.vc, 'km/s', 3)], ['escape speed', un(cp.ve, 'km/s', 3)]];
      } else if (mode === 'transfer') {
        var r1 = num(o.r1, 1), r2 = num(o.r2, 1.52), ho = PM.hohmann(GMs, r1, r2), at = (r1 + r2) / 2, et = (r2 - r1) / (r2 + r1), mp3 = fitMap({ x: 10, y: 10, w: W0 - 20, h: H0 - 20 }, -r2 * 1.15, r2 * 1.15, -r2 * 1.1, r2 * 1.1, true), X3 = mp3.X, Y3 = mp3.Y;
        circ(ctx, X3(0), Y3(0), 9, { fill: '#ffd479' }); circ(ctx, X3(0), Y3(0), r1 * mp3.sx, { color: k.sLine, w: 1.4 }); circ(ctx, X3(0), Y3(0), r2 * mp3.sx, { color: k.sLine, w: 1.4 }); ctx.save(); ctx.strokeStyle = rgba(k.sGold, 0.7); ctx.setLineDash([6, 5]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(X3(-at * et), Y3(0), at * mp3.sx, at * M.sqrt(1 - et * et) * mp3.sx, 0, 0, PI, true); ctx.stroke(); ctx.restore();
        var ph = A.t / 3, pos2; if (ph < 0.25) { var a1 = ph / 0.25 * PI; pos2 = [r1 * M.cos(PI + a1), r1 * M.sin(PI + a1)]; } else if (ph < 0.75) { var tt = (ph - 0.25) / 0.5 * PI, q2 = PM.kepler(at, et, 1, tt / TAU); pos2 = [q2.x, q2.y]; } else { var a2 = (ph - 0.75) / 0.25 * PI; pos2 = [r2 * M.cos(PI + a2), r2 * M.sin(PI + a2)]; }
        circ(ctx, X3(pos2[0]), Y3(pos2[1]), 5, { fill: '#fff' }); arrow(ctx, X3(r1) + 6, Y3(0), X3(r1) + 6, Y3(0) - 34, { color: k.sRed, w: 2.6 }); sTxt(ctx, 'burn 1' + (sh.vals ? ': +' + un(ho.dv1 * 4.74, 'km/s', 3) : ''), X3(r1) + 12, Y3(0) - 20, { size: 11, color: k.sRed }); arrow(ctx, X3(-r2) - 6, Y3(0), X3(-r2) - 6, Y3(0) + 34, { color: k.sRed, w: 2.6 }); sTxt(ctx, 'burn 2' + (sh.vals ? ': +' + un(ho.dv2 * 4.74, 'km/s', 3) : ''), X3(-r2) - 12, Y3(0) + 22, { size: 11, color: k.sRed, align: 'right' });
        desc = 'A transfer orbit from a circular orbit at ' + un(r1, 'AU') + ' to one at ' + un(r2, 'AU') + '.'; read = 'Burn 1 speeds the craft up at the inner orbit; that raises the <b>opposite side</b> of its orbit, not the place where it fired. It coasts half an ellipse (' + un(ho.t * 365.25, 'days', 3) + ') and burns again at the far point to circularize. The final orbit is slower than the first: higher orbits are slower.'; st = [['burn 1', un(ho.dv1 * 4.74, 'km/s', 3)], ['burn 2', un(ho.dv2 * 4.74, 'km/s', 3)], ['transfer time', un(ho.t * 365.25, 'days', 3)]];
      } else if (mode === 'binary' || mode === 'transit') {
        var wideB = W0 > 560, sw2 = wideB ? W0 * 0.5 : W0, sh2 = wideB ? H0 : H0 * 0.5, cx0 = sw2 / 2, cy0 = sh2 / 2, ph2 = A.t * TAU;
        if (mode === 'binary') { var m1 = 1, m2 = P.m2, R1 = M.min(sw2, sh2) * 0.38 * m2 / (m1 + m2), R2 = M.min(sw2, sh2) * 0.38 * m1 / (m1 + m2); circ(ctx, cx0, cy0, R1, { color: k.sLine, w: 1 }); circ(ctx, cx0, cy0, R2, { color: k.sLine, w: 1 }); circ(ctx, cx0 + R1 * M.cos(ph2), cy0 + R1 * M.sin(ph2), 11, { fill: '#ffd479' }); circ(ctx, cx0 - R2 * M.cos(ph2), cy0 - R2 * M.sin(ph2), 7 + 5 * m2, { fill: '#ff8787' }); line(ctx, cx0 - 6, cy0, cx0 + 6, cy0, '#fff', 1.5); line(ctx, cx0, cy0 - 6, cx0, cy0 + 6, '#fff', 1.5); sTxt(ctx, 'center of mass', cx0 + 8, cy0 + 12, { size: 10.5, color: k.sMuted }); F.tagAt(ctx, 'cm', cx0 - 14, cy0 - 14); sTxt(ctx, 'to Earth ↓', cx0, sh2 - 10, { align: 'center', size: 10.5, color: k.sMuted }); }
        else { var Rs2 = M.min(sw2, sh2) * 0.3; var gg2 = ctx.createRadialGradient(cx0, cy0, 2, cx0, cy0, Rs2); gg2.addColorStop(0, '#fff6d5'); gg2.addColorStop(1, '#ffb347'); circ(ctx, cx0, cy0, Rs2, { fill: gg2 }); var px = cx0 + (A.t * 2 - 1) * Rs2 * 1.6, rp = Rs2 * num(o.rp, 0.1); circ(ctx, px, cy0 + Rs2 * 0.2, rp, { fill: '#05070a' }); F.tagAt(ctx, 'planet', px, cy0 + Rs2 * 0.2 - rp - 14); }
        var gr = wideB ? { x: sw2 + 46, y: 20, w: W0 - sw2 - 60, h: H0 - 50 } : { x: 46, y: sh2 + 14, w: W0 - 60, h: H0 - sh2 - 38 };
        if (mode === 'binary' && sh.rv) { var K1 = 30 * P.m2, Gb = sGP(ctx, gr, { xmin: 0, xmax: 2, ymin: -40, ymax: 40, xlab: 'orbits', ylab: 'radial velocity (km/s)', xstep: 0.5, ystep: 20 }); Gb.plot(function (x) { return -K1 * M.cos(x * TAU); }, '#ffd479', 2.2); Gb.plot(function (x) { return K1 / P.m2 * M.cos(x * TAU); }, '#ff8787', 2.2); Gb.vline(A.t, k.sAcc, [4, 3]); F.tagAt(ctx, 'A0', gr.x + gr.w - 14, gr.y + 14); }
        if (mode === 'transit' && sh.lc) { var rp2 = num(o.rp, 0.1), depth = rp2 * rp2, Gt = sGP(ctx, gr, { xmin: 0, xmax: 1, ymin: 1 - depth * 2.5, ymax: 1 + depth * 0.6, xlab: 'time', ylab: 'brightness', xticks: false, ystep: niceStep(depth * 3, 3) }); Gt.plot(function (x) { var dx = M.hypot((x * 2 - 1) * 1.6, 0.2), r0 = 1, rr = rp2; if (dx >= r0 + rr) return 1; if (dx <= r0 - rr) return 1 - depth; var f = (r0 + rr - dx) / (2 * rr); return 1 - depth * clamp(f, 0, 1); }, '#ffd479', 2.2); Gt.vline(A.t, k.sAcc, [4, 3]); }
        desc = mode === 'binary' ? 'Two stars (1 and ' + fm(P.m2, 2) + ' solar masses) orbiting their common center of mass.' : 'A planet ' + fm(num(o.rp, 0.1) * 100, 0) + '% of its star\'s radius crossing the star\'s face.';
        read = mode === 'binary' ? 'Both stars circle the center of mass, the heavier one on the smaller circle (m₁r₁ = m₂r₂). Their Doppler shifts rise and fall opposite each other, and the size of each swing gives the mass ratio. A star with a planet wobbles the same way, just much less.' : 'While the planet crosses, the star dims by (R<sub>planet</sub>/R<sub>star</sub>)² = <b>' + fm(num(o.rp, 0.1) * num(o.rp, 0.1) * 100, 2) + '%</b>. Repeating dips give the orbital period; the depth gives the planet\'s size.';
      } else if (mode === 'shell') {
        var gr2 = { x: 50, y: 16, w: W0 - 64, h: H0 - 44 }, G2 = sGP(ctx, gr2, { xmin: 0, xmax: 4, ymin: 0, ymax: 1.15, xlab: 'r (Earth radii)', ylab: 'g (fraction of surface value)' });
        G2.plot(function (r) { return r < 1 ? r : 1 / (r * r); }, '#ffd479', 2.6); if (F.on('hollow', true)) G2.plot(function (r) { return r < 1 ? 0 : 1 / (r * r); }, rgba('#74c0fc', 0.8), 1.6, [5, 4]); G2.vline(1, k.sMuted, [3, 3]); sTxt(ctx, 'surface', G2.X(1) + 4, gr2.y + 34, { size: 10.5, color: k.sMuted }); sTxt(ctx, 'uniform solid planet', G2.X(1.6), G2.Y(0.6), { size: 11, color: '#ffd479' }); sTxt(ctx, 'hollow shell: zero inside', G2.X(0.05), G2.Y(0.06), { size: 11, color: '#74c0fc' });
        desc = 'Gravity against distance from the center of a planet, inside and outside.'; read = 'Outside, a sphere pulls as if all its mass were at the center (g ∝ 1/r²). Inside a uniform planet only the mass closer to the center than you counts, so g falls in a straight line to <b>zero at the center</b>; the outer shell\'s pulls cancel. Gravity is strongest at the surface.';
      } else if (mode === 'rotation-curve') {
        var gr3 = { x: 50, y: 16, w: W0 - 64, h: H0 - 44 }, G3 = sGP(ctx, gr3, { xmin: 0, xmax: 50, ymin: 0, ymax: 300, xlab: 'distance from center (thousand light-years)', ylab: 'orbital speed (km/s)', xstep: 10, ystep: 50 });
        var vis = function (r) { var rd = 9, x = r / rd; return 250 * M.sqrt(M.max(0, (1 - M.exp(-x) * (1 + x)))) * M.sqrt(rd * 1.2 / M.max(r, 0.5)) * 1.0; };
        G3.plot(function (r) { return M.min(260, vis(r) * 1.25); }, rgba('#74c0fc', 0.9), 2, [6, 4]); G3.plot(function (r) { return 230 * (1 - M.exp(-r / 3)); }, '#ffd479', 2.6); sTxt(ctx, 'measured: stays flat', G3.X(30), G3.Y(240), { size: 11.5, color: '#ffd479' }); sTxt(ctx, 'expected from the stars and gas we see', G3.X(22), G3.Y(95), { size: 11.5, color: '#74c0fc' });
        desc = 'A spiral galaxy\'s rotation curve: measured speeds against the speeds expected from its visible matter (schematic).'; read = 'If the visible stars and gas were all the mass, speeds far out would drop like a planet\'s around the Sun. Instead they stay <b>flat</b> far beyond the visible disk, so there must be much more unseen mass: dark matter.';
      } else if (mode === 'tides') {
        var cx2 = W0 * 0.38, cy2 = H0 / 2, RE = M.min(W0, H0) * 0.22; ctx.save(); ctx.fillStyle = rgba('#74c0fc', 0.25); ctx.beginPath(); ctx.ellipse(cx2, cy2, RE * 1.12, RE * 0.94, 0, 0, TAU); ctx.fill(); ctx.restore(); circ(ctx, cx2, cy2, RE, { fill: '#1d4a6b', color: '#74c0fc', w: 2 });
        circ(ctx, W0 - 40, cy2, 14, { fill: '#c9d1d9' }); sTxt(ctx, W0 > 560 ? 'Moon (far away, not to scale)' : 'Moon', W0 - 14, cy2 + 26, { align: 'right', size: 10.5, color: k.sMuted });
        for (var q3 = 0; q3 < 12; q3++) { var a3 = q3 / 12 * TAU, px2 = cx2 + RE * M.cos(a3), py2 = cy2 - RE * M.sin(a3), ax2 = 2 * M.cos(a3), ay2 = -M.sin(a3); arrow(ctx, px2, py2, px2 + ax2 * 16, py2 - ay2 * 16, { color: k.sAcc, w: 2, head: 6 }); } sTxt(ctx, 'bulges exaggerated', 14, H0 - 12, { size: 10.5, color: k.sMuted });
        desc = 'Earth with the Moon\'s tidal stretch shown as arrows and two water bulges.'; read = 'The Moon pulls the near side a little harder than Earth\'s center, and the far side a little less. Relative to the center, the near side is pulled toward the Moon and the far side is left behind: <b>two bulges</b>, so many coasts get two high tides a day. The stretch falls off as 1/d³.';
      } else if (mode === 'blackhole') {
        var Msun = P.M > 1 ? P.M : 10, rsKm = 2 * GN * Msun * MSUN / (C0 * C0) / 1000, cx3 = W0 / 2, cy3 = H0 / 2, s3 = M.min(W0, H0) * 0.4 / (3 * rsKm), sb = M.pow(10, M.floor(M.log10(rsKm))); circ(ctx, cx3, cy3, rsKm * s3 * 3, { color: rgba('#ffd479', 0.4), w: 1, dash: [4, 4] }); circ(ctx, cx3, cy3, rsKm * s3, { fill: '#000', color: '#b197fc', w: 2 }); sTxt(ctx, 'event horizon r_s = ' + un(rsKm, 'km', 3), cx3, cy3 + rsKm * s3 + 16, { align: 'center', size: 11.5, color: '#b197fc' }); sTxt(ctx, 'innermost stable orbit (3 r_s)', cx3, cy3 - rsKm * s3 * 3 - 10, { align: 'center', size: 10.5, color: k.sMuted }); line(ctx, 20, H0 - 18, 20 + sb * s3, H0 - 18, '#fff', 2); sTxt(ctx, fm(sb, 0) + ' km', 24 + sb * s3, H0 - 18, { size: 10.5 });
        desc = 'A ' + fm(Msun, 1) + ' solar-mass black hole with its event horizon drawn to scale (' + un(rsKm, 'km', 3) + ' radius).'; read = 'r<sub>s</sub> = 2GM/c² = <b>' + un(rsKm, 'km', 3) + '</b>. Nothing that crosses it comes back out. Far away, its gravity is the same as any star of the same mass: Earth would orbit a 1-solar-mass black hole exactly as it orbits the Sun. Black holes do not suck things in from afar.'; st = [['Schwarzschild radius', un(rsKm, 'km', 3)]];
      } else { // field
        var cx4 = W0 / 2, cy4 = H0 / 2; circ(ctx, cx4, cy4, 18, { fill: '#1d4a6b', color: '#74c0fc', w: 2 }); for (var gx = 20; gx < W0; gx += 34) for (var gy = 20; gy < H0; gy += 34) { var dx = cx4 - gx, dy = cy4 - gy, r = M.hypot(dx, dy); if (r < 30) continue; var gl = clamp(4000 / (r * r) * 40, 2, 26); arrow(ctx, gx, gy, gx + dx / r * gl, gy + dy / r * gl, { color: rgba('#63e6be', 0.4 + 0.6 * clamp(gl / 26, 0, 1)), w: 1.6, head: 5 }); }
        desc = 'The gravitational field around a planet: arrows point toward its center and shrink with distance.'; read = 'g = GM/r² points toward the center everywhere; twice as far, a quarter as strong. In orbit the field is still strong: astronauts float because they are falling around Earth, not because gravity is gone.';
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-sky
  /* PM.solarDec(day): the Sun's declination (deg) on a day of the year (simple cosine model, ±0.5°) */
  PM.solarDec = function (day) { return -23.44 * M.cos(TAU / 365 * (day + 10)); };
  PM.noonAlt = function (lat, dec) { return 90 - M.abs(lat - dec); };
  PM.daylight = function (lat, dec) { var x = -M.tan(lat * DEG) * M.tan(dec * DEG); if (x <= -1) return 24; if (x >= 1) return 0; return 2 * M.acos(x) / DEG / 15; };
  R('ph-sky', function (el, o) {
    var mode = pick(o.mode, ['sphere', 'coords', 'seasons', 'moon', 'eclipse', 'day'], 'sphere');
    var F = frame(el, o, { sphere: 'The sky for an observer at a chosen latitude', coords: 'Right ascension and declination', seasons: 'Earth\'s orbit, its tilt and the seasons', moon: 'The Moon\'s phases', eclipse: 'Why eclipses do not happen every month', day: 'Solar day and sidereal day' }[mode]);
    var P = { lat: num(o.lat, 40), day: num(o.date, 172), time: num(o.time, 12), age: num(o.moonAge, 7) }, c = F.canvas({ aspect: mode === 'coords' ? 2 : 1.6, narrow: mode === 'eclipse' ? 0.75 : 1.0 });
    var A = mode === 'coords' ? { t: 0 } : F.anim({ tmax: mode === 'moon' ? 29.53 : mode === 'sphere' ? 24 : mode === 'seasons' || mode === 'eclipse' ? 365 : mode === 'day' ? 2 : 1, loop: true, rate: mode === 'moon' ? 3 : mode === 'sphere' ? 2 : mode === 'seasons' ? 40 : mode === 'eclipse' ? 12 : 0.3, autoplay: mode !== 'coords', dt: mode === 'moon' ? 1 : mode === 'sphere' ? 0.5 : 5, t0: mode === 'moon' ? P.age : mode === 'sphere' ? P.time : mode === 'seasons' ? P.day : 0, tfmt: function (v) { return mode === 'moon' ? fd(v, 1, 'days') : mode === 'sphere' ? fd(v, 1, 'h') : mode === 'seasons' || mode === 'eclipse' ? 'day ' + M.round(v) : fd(v, 2); }, tlabel: mode === 'moon' ? 'Moon\'s age' : mode === 'sphere' ? 'Time of day' : mode === 'seasons' || mode === 'eclipse' ? 'Day of the year' : 'Time' });
    if (F.live && (mode === 'sphere' || mode === 'seasons')) { var row = F.row(); if (mode === 'sphere') { F.slider(row, { label: 'Latitude', min: -90, max: 90, step: 1, value: P.lat, unit: '°', d: 0, input: function (v) { P.lat = v; } }); F.slider(row, { label: 'Day of the year', min: 1, max: 365, step: 1, value: P.day, d: 0, input: function (v) { P.day = v; } }); } else F.slider(row, { label: 'Latitude for the sunlight panel', min: -66, max: 66, step: 1, value: P.lat, unit: '°', d: 0, input: function (v) { P.lat = v; } }); }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, t = A.t, desc = '', read = '', st = []; spaceBg(c, 5);
      if (mode === 'sphere') {
        var lat = P.lat * DEG, dec = PM.solarDec(P.day), cx0 = W0 / 2, cy0 = H0 * 0.6, R0 = M.min(W0 * 0.36, H0 * 0.46), tilt = 0.42; circ(ctx, cx0, cy0, R0, { color: rgba('#8fb3c6', 0.25), w: 1 });
        var av = 215 * DEG, proj = function (alt, az) { var x = -M.cos(alt) * M.sin(az - av), d = M.cos(alt) * M.cos(az - av), z = M.sin(alt); return [cx0 + R0 * x, cy0 - R0 * (z * M.cos(tilt) - d * M.sin(tilt)), d]; }; // az from north toward east; seen from the south-southwest, a little above: north at the back left, south at the front rightbove (north is the far side)
        var eq2hor = function (d, h) { var sd = M.sin(d), cd = M.cos(d), sl = M.sin(lat), cl = M.cos(lat), alt = M.asin(sl * sd + cl * cd * M.cos(h)), az = M.atan2(-cd * M.sin(h), sd * cl - cd * sl * M.cos(h)); return [alt, az]; };
        if (F.on('horizon', true)) {         ctx.save(); ctx.fillStyle = 'rgba(40,70,50,0.6)'; ctx.beginPath(); ctx.ellipse(cx0, cy0, R0, R0 * M.sin(tilt), 0, 0, TAU); ctx.fill(); ctx.restore(); ctx.save(); ctx.strokeStyle = k.sLine; ctx.beginPath(); ctx.ellipse(cx0, cy0, R0, R0 * M.sin(tilt), 0, 0, TAU); ctx.stroke(); ctx.restore(); }
        [['N', 0], ['E', PI / 2], ['S', PI], ['W', 1.5 * PI]].forEach(function (q) { var p = proj(0, q[1]), dx = p[0] - cx0, dy = p[1] - cy0, dl = M.hypot(dx, dy) || 1; sTxt(ctx, q[0], p[0] + dx / dl * 12, p[1] + dy / dl * 12, { align: 'center', size: 12, weight: 800 }); });
        F.tagAt(ctx, 'horizon', proj(0, PI * 0.8)[0], proj(0, PI * 0.8)[1] + 16);
        var z = proj(PI / 2, 0); circ(ctx, z[0], z[1], 3, { fill: '#fff' }); sTxt(ctx, 'zenith', z[0] + 6, z[1] - 8, { size: 11 }); F.tagAt(ctx, 'zenith', z[0] - 18, z[1]);
        var meridian = []; for (var a = 0; a <= 180; a += 3) meridian.push(proj(a * DEG, 0).slice(0, 2)); poly(ctx, meridian, { color: rgba('#8fb3c6', 0.4), w: 1, dash: [3, 4] });
        var ncp = P.lat >= 0 ? proj(lat, 0) : proj(-lat, PI); line(ctx, cx0, cy0, ncp[0], ncp[1], rgba('#e0c47a', 0.7), 1.2, [4, 3]); circ(ctx, ncp[0], ncp[1], 4, { fill: k.sGold }); sTxt(ctx, (P.lat >= 0 ? 'north celestial pole (near Polaris)' : 'south celestial pole') + (F.vals ? ', ' + fm(M.abs(P.lat), 0) + '° up' : ''), ncp[0] + (P.lat >= 0 ? 8 : -8), ncp[1] + 14, { size: 11, color: k.sGold, align: P.lat >= 0 ? 'left' : 'right' }); F.tagAt(ctx, 'ncp', ncp[0] - 16, ncp[1] + 10);
        function circle(d, col, w, dash) { var pts = [], up = []; for (var h = 0; h <= 360; h += 3) { var hz = eq2hor(d, h * DEG), p = proj(hz[0], hz[1]); pts.push([p[0], p[1], hz[0]]); } ctx.save(); ctx.lineWidth = w; ctx.setLineDash(dash || []); for (var i = 1; i < pts.length; i++) { ctx.strokeStyle = pts[i][2] >= 0 ? col : rgba(col[0] === '#' ? col : '#888888', 0.18); ctx.beginPath(); ctx.moveTo(pts[i - 1][0], pts[i - 1][1]); ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); } ctx.restore(); }
        if (F.on('equator', true)) circle(0, '#63e6be', 1.6, [6, 4]); if (F.on('solstices', true)) { circle(23.44 * DEG, rgba('#ffd479', 0.45), 1, [2, 4]); circle(-23.44 * DEG, rgba('#ffd479', 0.45), 1, [2, 4]); }
        [60, 75].forEach(function (d) { circle(d * DEG, rgba('#dbe7ef', 0.35), 1); });
        if (F.on('sunpath', true)) { circle(dec * DEG, '#ffd479', 2.4); var H = (t - 12) * 15 * DEG, hz = eq2hor(dec * DEG, H), sp = proj(hz[0], hz[1]); circ(ctx, sp[0], sp[1], hz[0] > 0 ? 9 : 6, { fill: hz[0] > 0 ? '#ffd479' : rgba('#ffd479', 0.3) }); var nz = eq2hor(dec * DEG, 0), npx = proj(nz[0], nz[1]); F.tagAt(ctx, 'sunNoon', npx[0] + 14, npx[1] - 14); }
        var na = PM.noonAlt(P.lat, dec), dl = PM.daylight(P.lat, dec);
        desc = 'The sky seen from latitude ' + fm(P.lat, 0) + '° on day ' + P.day + ': the Sun\'s path, the celestial equator and the pole.'; read = 'The celestial pole sits at an altitude equal to your latitude (' + fm(M.abs(P.lat), 0) + '°), not overhead (Polaris marks it in the north). Stars circle the pole once a day; those close enough never set (circumpolar). Today the Sun\'s declination is ' + fm(dec, 1) + '°: noon altitude 90° − |latitude − declination| = <b>' + fm(na, 1) + '°</b> and about <b>' + fm(dl, 1) + ' hours</b> of daylight.'; st = [['Sun\'s declination', fm(dec, 1) + '°'], ['noon altitude', fm(na, 1) + '°'], ['daylight', fd(dl, 1, 'h')]];
      } else if (mode === 'coords') {
        var r = { x: 50, y: 20, w: W0 - 64, h: H0 - 50 }, G = sGP(ctx, r, { xmin: 24, xmax: 0, ymin: -90, ymax: 90, xlab: '', ylab: 'declination (°)', xstep: 6, ystep: 30 }); sTxt(ctx, W0 > 560 ? '← right ascension (hours) increases to the left, as on a sky map' : '← right ascension (h)', r.x + r.w, H0 - 8, { align: 'right', size: 10.5, color: k.sMuted });
        if (F.on('ecliptic', true)) { G.plot(function (ra) { return M.atan(M.tan(23.44 * DEG) * M.sin(ra / 24 * TAU)) / DEG; }, '#ffd479', 2); sTxt(ctx, 'ecliptic (the Sun\'s yearly path)', G.X(17), G.Y(26), { size: 11, color: '#ffd479' }); } G.hline(0, '#63e6be', [5, 4], 1.6); sTxt(ctx, 'celestial equator', G.X(23), G.Y(0) - 8, { size: 11, color: '#63e6be' });
        [['Sirius', 6.75, -16.7], ['Vega', 18.62, 38.8], ['Polaris', 2.53, 89.3], ['Betelgeuse', 5.92, 7.4], ['Rigel', 5.24, -8.2]].forEach(function (s0) { G.dot(s0[1], s0[2], '#fff', 3.5); sTxt(ctx, s0[0], G.X(s0[1]) + 6, G.Y(s0[2]) - 8, { size: 10.5 }); });
        desc = 'A map of the sky in right ascension and declination.'; read = 'Declination is like latitude on the sky (−90° to +90°); right ascension is like longitude, measured eastward in hours (24 h = 360°). Stars keep these coordinates as the sky turns; the Sun moves along the ecliptic through the year.';
      } else if (mode === 'seasons') {
        var wideS = W0 > 560, cx1 = wideS ? W0 * 0.33 : W0 / 2, cy1 = wideS ? H0 * 0.5 : H0 * 0.3, Ro = wideS ? M.min(W0 * 0.25, H0 * 0.6) : W0 * 0.36, day = t, ang = PI + TAU * (day - 172) / 365, ex = cx1 + Ro * M.cos(ang), ey = cy1 - Ro * M.sin(ang) * 0.45, dec2 = PM.solarDec(day);
        ctx.save(); ctx.strokeStyle = k.sLine; ctx.beginPath(); ctx.ellipse(cx1, cy1, Ro, Ro * 0.45, 0, 0, TAU); ctx.stroke(); ctx.restore(); var gs = ctx.createRadialGradient(cx1, cy1, 1, cx1, cy1, 26); gs.addColorStop(0, '#fff6d5'); gs.addColorStop(0.45, '#ffd479'); gs.addColorStop(1, 'rgba(255,212,121,0)'); ctx.fillStyle = gs; ctx.beginPath(); ctx.arc(cx1, cy1, 26, 0, TAU); ctx.fill();
        [['June', 172], ['September', 265], ['December', 355], ['March', 79]].forEach(function (q) { var a0 = PI + TAU * (q[1] - 172) / 365, side = M.abs(M.cos(a0)) > 0.5, lx = cx1 + Ro * M.cos(a0), ly = cy1 - Ro * 0.45 * M.sin(a0); sTxt(ctx, q[0], lx, side ? ly - 24 : ly + (M.sin(a0) > 0 ? -12 : 14), { align: 'center', size: 10.5, color: k.sMuted }); });
        circ(ctx, ex, ey, 11, { fill: '#1d4a6b', color: '#74c0fc', w: 1.5 }); ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, 11, 0, TAU); ctx.clip(); var sd = M.atan2(cy1 - ey, cx1 - ex); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.arc(ex, ey, 11, sd + PI / 2, sd + 1.5 * PI); ctx.fill(); ctx.restore();
        var tdx = 19 * M.sin(23.44 * DEG), tdy = 19 * M.cos(23.44 * DEG); line(ctx, ex - tdx, ey + tdy, ex + tdx, ey - tdy, '#fff', 1.8); sTxt(ctx, 'N', ex + tdx + 4, ey - tdy - 4, { size: 10, weight: 800 }); F.tagAt(ctx, 'earth', ex - 18, ey + 18);
        sTxt(ctx, 'the axis always tilts the same way in space', cx1, wideS ? H0 - 12 : cy1 + Ro * 0.45 + 30, { align: 'center', size: 10.5, color: k.sMuted });
        var bx = wideS ? W0 * 0.68 : 16, by = wideS ? 24 : H0 * 0.58, bw = wideS ? W0 * 0.3 : W0 - 32, bh = wideS ? H0 - 48 : H0 * 0.4 - 12, alt2 = PM.noonAlt(P.lat, dec2), sa = M.sin(M.max(2, alt2) * DEG), ca = M.cos(M.max(2, alt2) * DEG), wb = 26, gL = wb / sa, gy0 = by + bh - 24, gx0 = bx + bw / 2, D = (gy0 - by - 24) / sa;
        rrect(ctx, bx, by, bw, bh, 8); ctx.fillStyle = k.space2; ctx.fill(); ctx.save(); rrect(ctx, bx, by, bw, bh, 8); ctx.clip(); var sgn = P.lat >= dec2 ? 1 : -1; // the noon Sun is to the south (beam from the left) when lat > dec
        ctx.fillStyle = 'rgba(255,212,121,0.38)'; ctx.beginPath(); ctx.moveTo(gx0 - gL / 2, gy0); ctx.lineTo(gx0 + gL / 2, gy0); ctx.lineTo(gx0 + gL / 2 - sgn * D * ca, gy0 - D * sa); ctx.lineTo(gx0 - gL / 2 - sgn * D * ca, gy0 - D * sa); ctx.closePath(); ctx.fill(); ctx.restore();
        line(ctx, bx + 10, gy0, bx + bw - 10, gy0, '#8fb3c6', 2); sTxt(ctx, 'south', bx + 10, gy0 + 14, { size: 10, color: k.sMuted }); sTxt(ctx, 'north', bx + bw - 10, gy0 + 14, { size: 10, color: k.sMuted, align: 'right' }); line(ctx, gx0 - gL / 2, gy0 + 4, gx0 + gL / 2, gy0 + 4, '#ffd479', 3); F.tagAt(ctx, 'beam', gx0 + gL / 2 + 14, gy0 - 14);
        sTxt(ctx, 'noon Sun at latitude ' + fm(P.lat, 0) + '°' + (F.vals ? ': ' + fm(alt2, 0) + '° up' : ''), gx0, by + 14, { align: 'center', size: 11 }); if (F.vals) sTxt(ctx, 'same beam covers ' + fm(1 / sa, 2) + '× the ground', gx0, by + 32, { align: 'center', size: 10.5, color: k.sGold });
        desc = 'Earth on its orbit on day ' + M.round(day) + ' with its tilted axis, and the noon sunlight at latitude ' + fm(P.lat, 0) + '°.'; read = 'Seasons come from the <b>tilt</b> (23.4°), not the distance: Earth is closest to the Sun in early January, during northern winter, and the distance changes only about 3%. When your hemisphere tilts toward the Sun, the noon Sun is higher, so each beam lands on less ground (stronger heating) and days are longer.'; st = [['Sun\'s declination', fm(dec2, 1) + '°'], ['noon altitude', fm(alt2, 1) + '°']];
      } else if (mode === 'moon') {
        var age = t, ph2 = age / 29.53 * TAU, cx2 = W0 * (W0 > 560 ? 0.36 : 0.5), cy2 = H0 * (W0 > 560 ? 0.5 : 0.38), Rm = M.min(W0 * 0.26, H0 * 0.3);
        sTxt(ctx, 'sunlight from the Sun (far to the left) →', 14, 14, { size: 11.5, color: k.sGold }); for (var q = 0; q < 5; q++) arrow(ctx, 14, 40 + q * (H0 - 80) / 4, 54, 40 + q * (H0 - 80) / 4, { color: rgba('#ffd479', 0.45), w: 1.4, head: 6 });
        circ(ctx, cx2, cy2, 14, { fill: '#1d4a6b', color: '#74c0fc', w: 1.5 }); circ(ctx, cx2, cy2, Rm, { color: k.sLine, w: 1, dash: [3, 4] });
        for (var i = 0; i < 8; i++) { var a2 = i / 8 * TAU, mx = cx2 + Rm * M.cos(a2 + PI), my = cy2 - Rm * M.sin(a2 + PI); circ(ctx, mx, my, 7, { fill: '#3a3f44' }); ctx.save(); ctx.beginPath(); ctx.arc(mx, my, 7, -PI / 2, PI / 2, true); ctx.fillStyle = '#e6ecf2'; ctx.fill(); ctx.restore(); F.tagAt(ctx, 'moon' + i, mx + 14, my - 12); }
        var mxp = cx2 + Rm * M.cos(ph2 + PI), myp = cy2 - Rm * M.sin(ph2 + PI); circ(ctx, mxp, myp, 11, { fill: '#3a3f44', color: k.sAcc, w: 2 }); ctx.save(); ctx.beginPath(); ctx.arc(mxp, myp, 11, -PI / 2, PI / 2, true); ctx.fillStyle = '#e6ecf2'; ctx.fill(); ctx.restore();
        var vx2 = W0 > 560 ? W0 * 0.8 : W0 / 2, vy2 = W0 > 560 ? H0 / 2 : H0 * 0.84, vr = M.min(W0 > 560 ? W0 * 0.12 : H0 * 0.13, 60), illum = (1 - M.cos(ph2)) / 2; circ(ctx, vx2, vy2, vr, { fill: '#3a3f44' }); ctx.save(); ctx.beginPath(); var waxing = ph2 % TAU < PI; ctx.arc(vx2, vy2, vr, -PI / 2, PI / 2, !waxing); ctx.ellipse(vx2, vy2, vr * M.abs(M.cos(ph2)), vr, 0, PI / 2, -PI / 2, (illum > 0.5) === waxing ? false : true); ctx.closePath(); ctx.fillStyle = '#e6ecf2'; ctx.fill(); ctx.restore(); sTxt(ctx, 'seen from Earth', vx2, vy2 + vr + 14, { align: 'center', size: 11, color: k.sMuted });
        var names = ['new moon', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full moon', 'waning gibbous', 'third quarter', 'waning crescent'], nm = names[M.round(age / 29.53 * 8) % 8];
        desc = 'The Moon ' + fm(age, 1) + ' days after new moon (' + nm + '), with the Sun to the left.'; read = 'Half the Moon is always lit by the Sun; the phase is how much of that lit half faces us as the Moon circles Earth. Earth\'s shadow has nothing to do with it (that would be a lunar eclipse). New moon to new moon takes 29.5 days (synodic month); one trip around relative to the stars takes 27.3 days, shorter because Earth moves along its orbit meanwhile.'; st = [['phase', nm], ['lit (as seen)', fm(illum * 100, 0) + '%']];
      } else if (mode === 'eclipse') {
        var cx3 = W0 / 2, cy3 = H0 * 0.52, Re = M.min(W0 * 0.34, H0 * 0.9), fl = 0.42, thE = TAU * t / 365.25, ex3 = cx3 + Re * M.cos(thE), ey3 = cy3 - Re * fl * M.sin(thE), rm = M.min(W0 * 0.11, 64), phN = 0.6, thM = TAU * t / 27.32 + PI + 0.9;
        var wrap = function (a) { a = (a + PI) % TAU; if (a < 0) a += TAU; return a - PI; }, sunDir = thE + PI, dN = M.min(M.abs(wrap(sunDir - phN)), M.abs(wrap(sunDir - phN - PI))), season = dN < 17 * DEG, psi = wrap(thM - sunDir);
        ctx.save(); ctx.strokeStyle = k.sLine; ctx.beginPath(); ctx.ellipse(cx3, cy3, Re, Re * fl, 0, 0, TAU); ctx.stroke(); ctx.restore(); var gs2 = ctx.createRadialGradient(cx3, cy3, 1, cx3, cy3, 24); gs2.addColorStop(0, '#fff6d5'); gs2.addColorStop(0.45, '#ffd479'); gs2.addColorStop(1, 'rgba(255,212,121,0)'); ctx.fillStyle = gs2; ctx.beginPath(); ctx.arc(cx3, cy3, 24, 0, TAU); ctx.fill(); F.tagAt(ctx, 'sun', cx3 + 18, cy3 - 18);
        [0, PI].forEach(function (f) { var a = phN + f; circ(ctx, cx3 + Re * M.cos(a), cy3 - Re * fl * M.sin(a), 3, { fill: rgba('#ffd479', 0.6) }); }); // where Earth is during the two eclipse seasons
        var lift = function (a) { return M.sin(a - phN) * 7; }, ptM = function (a) { return [ex3 + rm * M.cos(a), ey3 - rm * fl * M.sin(a) - lift(a)]; };
        ctx.save(); ctx.lineWidth = 1.4; for (var q = 0; q < 72; q++) { var a1 = q / 72 * TAU, a2 = (q + 1) / 72 * TAU, p1 = ptM(a1), p2 = ptM(a2); ctx.strokeStyle = M.sin((a1 + a2) / 2 - phN) >= 0 ? '#b197fc' : rgba('#b197fc', 0.4); ctx.setLineDash(M.sin((a1 + a2) / 2 - phN) >= 0 ? [] : [3, 3]); ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke(); } ctx.restore();
        var n1 = ptM(phN), n2 = ptM(phN + PI); line(ctx, n1[0] + (n1[0] - ex3) * 0.5, n1[1] + (n1[1] - ey3) * 0.5, n2[0] + (n2[0] - ex3) * 0.5, n2[1] + (n2[1] - ey3) * 0.5, season ? '#ffd479' : rgba('#ffd479', 0.55), 1.4, [5, 4]); F.tagAt(ctx, 'node', n1[0] + 10, n1[1] - 10);
        line(ctx, ex3, ey3, cx3, cy3, rgba('#ffd479', 0.25), 1, [2, 4]); circ(ctx, ex3, ey3, 8, { fill: '#1d4a6b', color: '#74c0fc', w: 1.5 }); var mp4 = ptM(thM); circ(ctx, mp4[0], mp4[1], 4.5, { fill: '#e6ecf2' }); F.tagAt(ctx, 'moon', mp4[0] + 12, mp4[1] - 12);
        var ev = M.abs(psi) < 14 * DEG ? (season ? ['solar eclipse: new moon right on the Sun–Earth line', '#ff8787'] : ['new moon passes ' + (lift(thM) > 0 ? 'above' : 'below') + ' the Sun: no eclipse', k.sInk]) : M.abs(M.abs(psi) - PI) < 14 * DEG ? (season ? ['lunar eclipse: full moon in Earth\'s shadow', '#ff8787'] : ['full moon passes ' + (lift(thM) > 0 ? 'above' : 'below') + ' Earth\'s shadow: no eclipse', k.sInk]) : null;
        sTxt(ctx, season ? 'eclipse season: the line of nodes points at the Sun' : 'line of nodes does not point at the Sun', 14, 16, { size: 11.5, weight: 700, color: season ? '#ffd479' : k.sMuted }); if (ev) sTxt(ctx, ev[0], 14, 36, { size: 11.5, weight: 700, color: ev[1] });
        sTxt(ctx, W0 > 560 ? 'Moon\'s orbit (solid half above Earth\'s orbital plane; tilt exaggerated)' : 'Moon\'s orbit (solid half above; tilt exaggerated)', 14, H0 - 12, { size: 10.5, color: '#b197fc' });
        if (F.on('shadow', true)) { var iw = M.min(220, W0 * 0.6), ih = 78, ix = W0 - iw - 10, iy = W0 > 560 ? 10 : H0 - ih - 40, sxx = ix + 14, mx2 = ix + iw * 0.56, rS = 26, rM = 7, ex4 = ix + iw - 16; rrect(ctx, ix, iy, iw, ih, 8); ctx.fillStyle = 'rgba(7,18,28,0.85)'; ctx.fill(); ctx.save(); rrect(ctx, ix, iy, iw, ih, 8); ctx.clip(); var cyI = iy + ih / 2;
          circ(ctx, sxx, cyI, rS, { fill: '#ffd479' }); var tip = mx2 + (ex4 - mx2) * 1.04, pen = function (s1) { var k1 = (rS + s1 * rM) / (mx2 - sxx); return k1; }; ctx.fillStyle = 'rgba(160,170,190,0.28)'; ctx.beginPath(); ctx.moveTo(mx2, cyI - rM); ctx.lineTo(ex4 + 12, cyI - rM - (ex4 + 12 - mx2) * pen(1)); ctx.lineTo(ex4 + 12, cyI + rM + (ex4 + 12 - mx2) * pen(1)); ctx.lineTo(mx2, cyI + rM); ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.beginPath(); ctx.moveTo(mx2, cyI - rM); ctx.lineTo(tip, cyI); ctx.lineTo(mx2, cyI + rM); ctx.closePath(); ctx.fill(); circ(ctx, mx2, cyI, rM, { fill: '#c9d1d9' }); ctx.save(); ctx.beginPath(); ctx.arc(ex4 + 30, cyI, 32, 0, TAU); ctx.fillStyle = '#1d4a6b'; ctx.fill(); ctx.restore(); ctx.restore();
          sTxt(ctx, 'umbra', (mx2 + tip) / 2, cyI + 20, { align: 'center', size: 9.5, color: '#dbe7ef' }); sTxt(ctx, 'penumbra', ex4 - 26, iy + 10, { align: 'center', size: 9.5, color: k.sMuted }); sTxt(ctx, 'solar eclipse, side view (not to scale)', ix + iw / 2, iy + ih + 10, { align: 'center', size: 9.5, color: k.sMuted }); F.tagAt(ctx, 'umbra', (mx2 + tip) / 2, cyI - 16); }
        desc = 'Earth circling the Sun with the Moon\'s tilted orbit, whose line of nodes keeps its direction in space.'; read = 'The Moon\'s orbit is tilted about 5° to Earth\'s, so most months the new or full moon passes a little above or below the Sun–Earth line and there is no eclipse. The tilted orbit keeps its direction as Earth goes around the Sun, so about twice a year the line of nodes points at the Sun: during those <b>eclipse seasons</b> a new moon gives a solar eclipse and a full moon a lunar eclipse.';
      } else { // day
        var cx4 = W0 * 0.42, cy4 = H0 * 0.62, Ro3 = M.min(W0 * 0.4, H0 * 0.5), fr = t / 2, oa = fr * 0.45, ex2 = cx4 + Ro3 * M.cos(oa), ey2 = cy4 - Ro3 * M.sin(oa), spin = PI + fr * (TAU + 0.45), sid = TAU / (TAU + 0.45);
        circ(ctx, cx4, cy4, 14, { fill: '#ffd479' }); arc(ctx, cx4, cy4, Ro3, 0.08, -0.6, k.sLine, 1.2); circ(ctx, cx4 + Ro3, cy4, 4, { fill: rgba('#74c0fc', 0.5) }); sTxt(ctx, 'start', cx4 + Ro3, cy4 + 30, { size: 10.5, color: k.sMuted });
        line(ctx, ex2, ey2, ex2 - 70, ey2, rgba('#dbe7ef', 0.55), 1.2, [3, 3]); sTxt(ctx, '← to a distant star', ex2 - 72, ey2, { align: 'right', size: 10.5, color: k.sMuted }); line(ctx, ex2, ey2, cx4, cy4, rgba('#ffd479', 0.45), 1, [3, 3]);
        circ(ctx, ex2, ey2, 16, { fill: '#1d4a6b', color: '#74c0fc', w: 1.5 }); arrow(ctx, ex2, ey2, ex2 + 30 * M.cos(spin), ey2 - 30 * M.sin(spin), { color: '#fff', w: 2.2, head: 6 }); F.tagAt(ctx, 'marker', ex2 + 22, ey2 + 22);
        var msg = fr < 0.02 ? 'noon: the marker faces the Sun and the star' : fr < sid - 0.01 ? 'turning…' : fr < sid + 0.02 ? 'one sidereal day: facing the star again' : fr < 0.98 ? 'still turning to face the Sun' : 'one solar day: facing the Sun again';
        sTxt(ctx, msg, 14, 18, { size: 11.5, weight: 700, color: k.sAcc }); sTxt(ctx, 'orbital motion exaggerated about 26 times', 14, H0 - 12, { size: 10.5, color: k.sMuted });
        desc = 'Earth spinning while it moves along its orbit (motion exaggerated).'; read = 'One turn relative to the stars (a sidereal day) takes <b>23 h 56 min</b>. Meanwhile Earth moves about 1° along its orbit, so it must turn about 1° more to bring the Sun back overhead: a solar day of <b>24 h</b>.';
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-hr. Main-sequence relations (approximate, standard textbook fits): L/L☉ = 0.23M^2.3 (M < 0.43), M^4 (0.43–2), 1.4M^3.5 (2–55), 32000M (above 55);
  // R/R☉ ≈ M^0.8 (M < 1), M^0.57 (M ≥ 1); T from L = 4πR²σT⁴ with the Sun's 5772 K; lifetime ≈ 10 Gyr × M/L.
  PM.msL = function (m) { return m < 0.43 ? 0.23 * M.pow(m, 2.3) : m < 2 ? M.pow(m, 4) : m < 55 ? 1.4 * M.pow(m, 3.5) : 32000 * m; };
  function sig(v, n) { return Number(v.toPrecision(n || 2)).toLocaleString('en-US'); }
  PM.msR = function (m) { return m < 1 ? M.pow(m, 0.8) : M.pow(m, 0.57); };
  PM.teff = function (L, R) { return TSUN * M.pow(L / (R * R), 0.25); };
  PM.radiusFrom = function (L, T) { return M.sqrt(L) * M.pow(TSUN / T, 2); };
  PM.lifetime = function (m) { return 10 * m / PM.msL(m); }; // Gyr
  /* PM.turnoffMass(ageGyr): the main-sequence mass whose lifetime equals the age (bisection on log mass) */
  PM.turnoffMass = function (age) { var lo = M.log(0.08), hi = M.log(100); for (var i = 0; i < 60; i++) { var mid = (lo + hi) / 2; if (PM.lifetime(M.exp(mid)) > age) lo = mid; else hi = mid; } return M.exp((lo + hi) / 2); };
  var NAMED = [['Sun', 5772, 1, 1], ['Sirius A', 9940, 25.4, 2.06], ['Sirius B', 25000, 0.056, 1.02], ['Betelgeuse', 3600, 1e5, 17], ['Rigel', 12100, 1.2e5, 21], ['Proxima Centauri', 3040, 0.0017, 0.12], ['Vega', 9600, 40, 2.1], ['Aldebaran', 3900, 440, 1.2]];
  function hrPop(seed) { var R0 = rng(seed || 21), out = []; for (var i = 0; i < 260; i++) { var m = M.pow(10, -0.9 + 2.1 * M.pow(R0(), 1.6)), L = PM.msL(m) * M.pow(10, (R0() - 0.5) * 0.25), R1 = PM.msR(m); out.push([PM.teff(L, R1), L, 'ms', m]); }
    for (i = 0; i < 40; i++) { var T = 3700 + R0() * 1500, L2 = M.pow(10, 1 + R0() * 2.3 * (1 - (T - 3700) / 3000)); out.push([T, L2, 'giant']); }
    for (i = 0; i < 10; i++) out.push([3500 + R0() * 25000, M.pow(10, 4.3 + R0() * 1.2), 'super']);
    for (i = 0; i < 18; i++) { var T2 = 6000 + R0() * 22000; out.push([T2, 0.0001 * M.pow(T2 / 5772, 4) * (0.6 + R0() * 0.8), 'wd']); } return out; }
  var HRPOP = null;
  R('ph-hr', function (el, o) {
    var mode = pick(o.mode, ['diagram', 'radius', 'tracks', 'cluster', 'mass-luminosity'], 'diagram');
    var F = frame(el, o, { diagram: 'The Hertzsprung–Russell diagram', radius: 'The H–R diagram with lines of constant radius', tracks: 'Evolutionary tracks on the H–R diagram', cluster: 'A star cluster\'s main-sequence turnoff', 'mass-luminosity': 'Main-sequence mass against luminosity' }[mode]);
    var c = F.canvas({ aspect: 1.35, narrow: 0.9 }), hl = arr(o.highlight || (mode === 'cluster' ? [] : mode === 'tracks' ? ['Sun'] : ['Sun', 'Sirius A', 'Sirius B', 'Betelgeuse', 'Rigel', 'Proxima Centauri'])), age = num(o.age, 1), sel = null, G = null;
    var sh = { regions: F.on('regions', true), radii: F.on('radii', mode === 'radius'), labels: F.on('labels', true) };
    if (!HRPOP) HRPOP = hrPop(21);
    if (F.live && mode === 'cluster') F.slider(null, { label: 'Cluster age', min: 0.01, max: 13, step: 0.01, value: age, unit: 'billion years', d: 2, input: function (v) { age = v; } });
    if (F.live && mode !== 'mass-luminosity') { c.cv.tabIndex = 0; V.drag(c.cv, { hit: function (px, py) { if (!G) return null; var best = null, bd = 14; NAMED.forEach(function (s0, i) { var d = M.hypot(G.X(M.log10(s0[1])) - px, G.Y(M.log10(s0[2])) - py); if (d < bd) { bd = d; best = i; } }); return best; }, start: function (i) { sel = i; F.now(); }, move: function () { }, end: function () { } }); c.cv.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === 'n' || e.key === 'N') { sel = sel == null ? 0 : (sel + 1) % NAMED.length; F.say(NAMED[sel][0]); F.now(); e.preventDefault(); } }); }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, desc = '', read = '', st = []; spaceBg(c, 8);
      var r = { x: 52, y: 30, w: W0 - 64, h: H0 - 58 };
      if (mode === 'mass-luminosity') {
        var G2 = sGP(ctx, r, { xmin: -1.1, xmax: 1.7, ymin: -3.5, ymax: 6, xlab: 'log₁₀ mass (M☉)', ylab: 'log₁₀ luminosity (L☉)', xstep: 0.5, ystep: 1 }); G2.plot(function (x) { return M.log10(PM.msL(M.pow(10, x))); }, '#ffd479', 2.6); [0.1, 0.5, 1, 2, 5, 10, 30].forEach(function (m) { G2.dot(M.log10(m), M.log10(PM.msL(m)), bbColor(PM.teff(PM.msL(m), PM.msR(m))), 5); sTxt(ctx, fm(m, 1) + ' M☉', G2.X(M.log10(m)) + 6, G2.Y(M.log10(PM.msL(m))) + 12, { size: 10 }); });
        desc = 'Luminosity against mass for main-sequence stars (log scales).'; read = 'L grows roughly as M<sup>3.5</sup>: a 10 M☉ star is thousands of times as luminous as the Sun. Lifetime ≈ fuel ÷ burn rate ∝ M/L ∝ M<sup>−2.5</sup>, so <b>big stars die young</b>: about 10 billion years for the Sun, ' + fm(PM.lifetime(10) * 1000, 0) + ' million for 10 M☉.'; st = [['lifetime 1 M☉', un(PM.lifetime(1), 'Gyr', 2)], ['lifetime 10 M☉', un(PM.lifetime(10) * 1000, 'Myr', 2)]];
        F.desc(desc); F.read(read); F.stats(st); return;
      }
      G = sGP(ctx, r, { xmin: M.log10(40000), xmax: M.log10(2400), ymin: -4.5, ymax: 6.5, xlab: '', ylab: 'luminosity (L☉, log scale)', xticks: false, yticks: false });
      [40000, 20000, 10000, 5000, 3000].forEach(function (T) { txt(ctx, fm(T, 0) + ' K', G.X(M.log10(T)), r.y + r.h + 10, { align: 'center', size: 10.5, color: k.sMuted }); }); sTxt(ctx, '← hotter    surface temperature    cooler →', r.x + r.w / 2, r.y + r.h + 24, { align: 'center', size: 10.5, color: k.sMuted });
      [-4, -2, 0, 2, 4, 6].forEach(function (e) { txt(ctx, e === 0 ? '1' : '10' + sup(e), r.x - 4, G.Y(e), { align: 'right', size: 10.5, color: k.sMuted }); });
      [['O', 40000, 30000], ['B', 30000, 10000], ['A', 10000, 7500], ['F', 7500, 6000], ['G', 6000, 5200], ['K', 5200, 3700], ['M', 3700, 2400]].forEach(function (q) { var x = (G.X(M.log10(q[1])) + G.X(M.log10(q[2]))) / 2; sTxt(ctx, q[0], x, r.y - 12, { align: 'center', size: 12, weight: 800, color: bbColor(M.sqrt(q[1] * q[2])) }); });
      if (sh.radii) [0.01, 0.1, 1, 10, 100, 1000].forEach(function (R1) { G.plot(function (lt) { return M.log10(R1 * R1 * M.pow(M.pow(10, lt) / TSUN, 4)); }, rgba('#8fb3c6', 0.45), 1.2, [4, 4]); var lt0 = M.log10(4500), ly = M.log10(R1 * R1 * M.pow(4500 / TSUN, 4)); if (ly > -4 && ly < 6.3) sTxt(ctx, R1 + ' R☉', G.X(lt0), G.Y(ly) - 6, { size: 10, color: k.sMuted }); });
      var turnM = mode === 'cluster' ? PM.turnoffMass(age) : null;
      ctx.save(); if (mode === 'tracks') ctx.globalAlpha = 0.35;
      HRPOP.forEach(function (s0) { if (mode === 'cluster') { if (s0[2] === 'super') return; if (s0[2] === 'ms' && s0[3] > turnM) return; if (s0[2] === 'giant' && age < 0.3) return; if (s0[2] === 'wd' && age < 0.5) return; } circ(ctx, G.X(M.log10(s0[0])), G.Y(M.log10(s0[1])), s0[2] === 'super' ? 3.2 : 2.2, { fill: bbColor(s0[0]) }); });
      ctx.restore();
      if (sh.regions && mode !== 'cluster') { sTxt(ctx, 'main sequence', G.X(M.log10(12000)), G.Y(1.2), { size: 11.5, weight: 700, color: '#ffd479' }); sTxt(ctx, 'giants', G.X(M.log10(4300)), G.Y(2.6), { size: 11.5, weight: 700, color: '#ffa94d' }); sTxt(ctx, 'supergiants', G.X(M.log10(9000)), G.Y(5.6), { size: 11.5, weight: 700, color: '#ff8787' }); sTxt(ctx, 'white dwarfs', G.X(M.log10(14000)), G.Y(-3.4), { size: 11.5, weight: 700, color: '#dbe7ef' }); F.tagAt(ctx, 'ms', G.X(M.log10(9000)), G.Y(0.6)); F.tagAt(ctx, 'giants', G.X(M.log10(4000)), G.Y(2)); F.tagAt(ctx, 'wd', G.X(M.log10(12000)), G.Y(-2.6)); }
      if (mode === 'tracks') { var tracks = [[[5772, 1], [5000, 2.5], [4600, 10], [4000, 100], [3100, 2500]], [[17000, 600], [15500, 900], [5000, 1300], [4200, 2000], [6500, 2500], [3600, 4000]], [[31000, 20000], [28000, 30000], [8000, 60000], [3600, 70000]]], late = [[3100, 2500], [36000, 3000], [25000, 0.03], [9000, 0.0012]], TC = ['#ffd479', '#74c0fc', '#ff8787'];
        var tp = function (p) { return [G.X(M.log10(p[0])), G.Y(M.log10(p[1]))]; }; G.clip(); tracks.forEach(function (tk, i) { var pts = tk.map(tp); poly(ctx, pts, { color: TC[i], w: 2.4 }); var m0 = pts[M.floor(pts.length / 2) - 1], m1 = pts[M.floor(pts.length / 2)]; arrow(ctx, m0[0], m0[1], (m0[0] + m1[0]) / 2, (m0[1] + m1[1]) / 2, { color: TC[i], w: 2.4, head: 8 }); }); poly(ctx, late.map(tp), { color: TC[0], w: 1.8, dash: [6, 5] }); ctx.restore();
        [['1 M☉ (like the Sun)', 5772, 1, 10, 22], ['5 M☉', 17000, 600, -40, 16], ['15 M☉', 31000, 20000, -8, -14]].forEach(function (q, i) { var p = tp([q[1], q[2]]); sTxt(ctx, q[0], p[0] + q[3], p[1] + q[4], { size: 11.5, weight: 800, color: TC[i] }); }); var pn = tp([30000, 3000]); sTxt(ctx, W0 > 560 ? 'Sun-like star later: planetary nebula, then white dwarf' : 'then planetary nebula, white dwarf', pn[0], pn[1] + 14, { size: 10.5, color: TC[0] }); sTxt(ctx, 'tracks simplified', r.x + 6, r.y + r.h - 10, { size: 10, color: k.sMuted }); }
      if (mode === 'cluster') { var Lto = PM.msL(turnM), Tto = PM.teff(Lto, PM.msR(turnM)); circ(ctx, G.X(M.log10(Tto)), G.Y(M.log10(Lto)), 9, { color: '#63e6be', w: 2 }); sTxt(ctx, F.vals ? 'turnoff: ' + fm(turnM, 2) + ' M☉' : 'turnoff', G.X(M.log10(Tto)) + 12, G.Y(M.log10(Lto)), { size: 11.5, weight: 700, color: '#63e6be' }); F.tagAt(ctx, 'turnoff', G.X(M.log10(Tto)) - 16, G.Y(M.log10(Lto)) - 14); }
      NAMED.forEach(function (s0, i) { if (hl.indexOf(s0[0]) < 0 && sel !== i) return; var x = G.X(M.log10(s0[1])), y = G.Y(M.log10(s0[2])); circ(ctx, x, y, sel === i ? 7 : 5, { fill: bbColor(s0[1]), color: '#fff', w: 1.5 }); if (sh.labels) { var rgt = x + 110 > W0; sTxt(ctx, s0[0], rgt ? x - 8 : x + 8, y - 8, { size: 11, weight: 700, align: rgt ? 'right' : 'left' }); } F.tagAt(ctx, s0[0], x - 14, y + 12); });
      if (sel != null) { var s1 = NAMED[sel], Rr = PM.radiusFrom(s1[2], s1[1]); pill(ctx, s1[0] + ': ' + fm(s1[1], 0) + ' K, ' + nf(s1[2], 2) + ' L☉, ' + nf(Rr, 2) + ' R☉, about ' + nf(s1[3], 2) + ' M☉', W0 / 2, H0 - 46, { W: W0, size: 11.5, bg: 'rgba(13,29,42,0.9)', color: k.sInk }); }
      desc = mode === 'cluster' ? 'The H–R diagram of a ' + fm(age, 2) + '-billion-year-old cluster.' : 'The H–R diagram: luminosity against surface temperature, hot stars on the left.'; if (sel != null) desc += ' Selected: ' + NAMED[sel][0] + ', ' + fm(NAMED[sel][1], 0) + ' K, ' + nf(NAMED[sel][2], 2) + ' times the Sun\'s luminosity.';
      read = mode === 'cluster' ? 'All the stars formed together. The most massive burn out first, so the main sequence is eaten away from the top: the turnoff (now near <b>' + fm(turnM, 2) + ' M☉</b>, lifetime ' + un(PM.lifetime(turnM), 'Gyr', 3) + ') tells the cluster\'s age.' : mode === 'tracks' ? 'A star stays near one spot on the main sequence for most of its life, then leaves it: the Sun will swell into a red giant and end as a white dwarf; massive stars cross to the red-supergiant region. Stars do not slide along the main sequence as they age.' : 'Temperature <b>increases to the left</b>. Most stars sit on the main sequence, where a star\'s place is set by its <b>mass</b>, not its age. L = 4πR²σT⁴, so cool but very luminous stars must be huge (giants) and hot but faint ones tiny (white dwarfs). Click a star for its numbers.';
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-cosmic
  /* PM.cepheidM(P): absolute visual magnitude from the period in days (Benedict et al. 2007, HST parallaxes) */
  PM.cepheidM = function (P) { return -2.43 * (M.log10(P) - 1) - 4.05; };
  PM.distMod = function (m, Mabs) { return M.pow(10, (m - Mabs + 5) / 5); }; // parsecs
  /* PM.scaleFactor(t, H0, Om, OL): a(t) for a flat universe with radiation, matter and Λ (t in Gyr); also the age */
  PM.friedmann = function (H0, Om, OL) { var Or = 9e-5, H = H0 / 3.0857e19 * 3.15576e16, pts = [], a = 1e-6, t = 0; while (a < 2.5) { var Ha = H * M.sqrt(Or / (a * a * a * a) + Om / (a * a * a) + OL + (1 - Or - Om - OL) / (a * a)), da = a * 0.002; t += da / (a * Ha); a += da; pts.push([t, a]); } var age = 0; for (var i = 0; i < pts.length; i++) if (pts[i][1] >= 1) { age = pts[i][0]; break; } return { pts: pts, age: age }; };
  var MAGS = [['Sun', -26.74], ['full Moon', -12.74], ['Venus at its brightest', -4.6], ['Sirius', -1.46], ['Vega', 0.03], ['Polaris', 1.98], ['faintest seen in a dark sky', 6.5]];
  var SCALE = [['Moon', 3.844e8], ['Sun', AU], ['Neptune', 30.07 * AU], ['Proxima Centauri', 4.0175e16], ['center of the Milky Way', 2.6e4 * LY], ['Andromeda Galaxy', 2.5e6 * LY]];
  var PDIAM = [['Mercury', 4879], ['Venus', 12104], ['Earth', 12756], ['Mars', 6792], ['Jupiter', 142984], ['Saturn', 120536], ['Uranus', 51118], ['Neptune', 49528]];
  R('ph-cosmic', function (el, o) {
    var mode = pick(o.mode, ['scale', 'parallax', 'inverse-square', 'magnitudes', 'cepheids', 'hubble', 'expansion', 'scale-factor', 'ladder'], 'scale');
    var F = frame(el, o, { scale: 'Distances in space and how long light takes', parallax: 'Parallax: measuring a star\'s distance', 'inverse-square': 'Light spreading out: the inverse-square law', magnitudes: 'The magnitude scale', cepheids: 'Cepheid variables as standard candles', hubble: 'The Hubble diagram', expansion: 'An expanding universe with no center', 'scale-factor': 'The scale factor of the universe over time', ladder: 'The cosmic distance ladder' }[mode]);
    var c = F.canvas({ aspect: mode === 'scale' ? 2.4 : mode === 'ladder' ? 2 : mode === 'magnitudes' ? 1.25 : 1.6, narrow: mode === 'scale' ? 1.25 : mode === 'magnitudes' ? 0.8 : 1.0 }), P = { d: o.p != null && num(o.p, 0) > 0 ? 1 / num(o.p, 1) : num(o.d, 2), H0: num(o.H0, 70), Om: num(o.omegaM, 0.3), OL: num(o.omegaL, 0.7), z: num(o.z, 1), view: o.view === 'planets' ? 'planets' : 'distances' };
    P.per = num(o.period, 10); P.mApp = num(o.m, 20); var A = mode === 'expansion' || mode === 'cepheids' ? F.anim({ tmax: 3, loop: true, rate: 0.5, autoplay: true, dt: 0.1, tfmt: mode === 'cepheids' ? function (v) { return fd(v, 2, 'periods'); } : null }) : { t: 0 }, you = 12;
    if (F.live) { var row = F.row(); if (mode === 'parallax') F.slider(row, { label: 'Star distance', min: 1, max: 10, step: 0.1, value: clamp(P.d, 1, 10), unit: 'pc', d: 1, input: function (v) { P.d = v; } }); if (mode === 'hubble') F.slider(row, { label: 'Hubble constant H₀', min: 50, max: 90, step: 1, value: P.H0, unit: 'km/s/Mpc', d: 0, input: function (v) { P.H0 = v; } }); if (mode === 'inverse-square') F.slider(row, { label: 'Distance', min: 1, max: 4, step: 0.05, value: P.d, unit: 'units', d: 2, input: function (v) { P.d = v; } }); if (mode === 'scale') F.seg(row, { label: 'View', items: [['distances', 'Distances'], ['planets', 'Planet sizes']], value: P.view, change: function (v) { P.view = v; } }); if (mode === 'cepheids') { F.slider(row, { label: 'Period', min: 1, max: 60, step: 0.5, value: P.per, unit: 'days', d: 1, input: function (v) { P.per = v; } }); F.slider(row, { label: 'Apparent magnitude m', min: 5, max: 26, step: 0.1, value: P.mApp, d: 1, input: function (v) { P.mApp = v; } }); } if (mode === 'scale-factor') F.slider(row, { label: 'Redshift z of a distant galaxy', min: 0, max: 5, step: 0.1, value: P.z, d: 1, input: function (v) { P.z = v; } }); if (mode === 'scale-factor') F.slider(row, { label: 'Dark energy Ω_Λ (flat universe)', min: 0, max: 0.9, step: 0.05, value: P.OL, d: 2, input: function (v) { P.OL = v; P.Om = 1 - v; } }); }
    if (F.live && mode === 'expansion') { c.cv.tabIndex = 0; V.drag(c.cv, { hit: function () { return 1; }, start: function (h, px, py) { var best = 0, bd = 1e9; gal().forEach(function (g, i) { var d = M.hypot(g.px - px, g.py - py); if (d < bd) { bd = d; best = i; } }); you = best; F.now(); }, move: function () { }, end: function () { } }); }
    var GAL = null; function gal() { if (!GAL) { var R0 = rng(14); GAL = []; for (var i = 0; i < 26; i++) GAL.push({ x: (R0() - 0.5) * 2, y: (R0() - 0.5) * 2, px: 0, py: 0 }); } return GAL; }
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, t = A.t, desc = '', read = '', st = []; spaceBg(c, 11);
      if (mode === 'scale') {
        if (P.view === 'planets') { var sunD = 1392700, s = (W0 - 40) / (PDIAM.reduce(function (s0, q) { return s0 + q[1]; }, 0) * 1.6), x = 20; PDIAM.forEach(function (q) { var rp = q[1] / 2 * s; x += rp + 6; var gg = ['#b0a090', '#e8cda2', '#4dabf7', '#e07050', '#d9b38c', '#e8d5a0', '#9be7f0', '#5c7cfa'][PDIAM.indexOf(q)]; circ(ctx, x, H0 * 0.45, rp, { fill: gg }); sTxt(ctx, q[0], x, H0 * 0.45 + M.max(rp, 8) + 14 + (rp < 12 && PDIAM.indexOf(q) % 2 ? 16 : 0), { align: 'center', size: 10.5 }); x += rp + 6; }); sTxt(ctx, 'Diameters to scale. The Sun (' + fm(sunD / 12756, 0) + ' Earths across) would be ' + fm(sunD * s, 0) + ' px wide here.', 20, H0 - 14, { size: 11, color: k.sMuted }); desc = 'The eight planets drawn to scale: Jupiter is about 11 Earths across.'; read = 'Earth is 12,756 km across; Jupiter 142,984 km; the Sun about 1.39 million km, 109 Earths. The distances between them are far larger still: to scale, they would be specks.'; }
        else { var x0 = 30, x1 = W0 - 30, lmin = 8, lmax = 23, X = function (d) { return x0 + (M.log10(d) - lmin) / (lmax - lmin) * (x1 - x0); }, y0 = H0 * 0.42; line(ctx, x0, y0, x1, y0, k.sLine, 2); for (var e = lmin; e <= lmax; e += W0 > 560 ? 1 : 3) { line(ctx, X(M.pow(10, e)), y0 - 4, X(M.pow(10, e)), y0 + 4, k.sMuted, 1); sTxt(ctx, '10' + sup(e), X(M.pow(10, e)), y0 + 16, { align: 'center', size: 10, color: k.sMuted }); } sTxt(ctx, 'meters (each step 10× farther)', x1, narrowS ? H0 - 10 : y0 + 32, { align: 'right', size: 10.5, color: k.sMuted });
          var narrowS = W0 <= 560; SCALE.forEach(function (q, i) { var px = X(q[1]), ly = q[1] / C0, lyr = q[1] / LY, tl = ly < 60 ? fm(ly, 1) + ' light-seconds' : ly < 3600 ? fm(ly / 60, 1) + ' light-minutes' : ly < 86400 * 2 ? fm(ly / 3600, 1) + ' light-hours' : lyr >= 1e6 ? fm(lyr / 1e6, 1) + ' million light-years' : lyr >= 1000 ? M.round(lyr).toLocaleString('en-US') + ' light-years' : fm(lyr, 2) + ' light-years'; circ(ctx, px, y0, 5, { fill: '#ffd479' }); var up = i % 2 ? -1 : 1, dd = narrowS && (i === 2 || i === 3) ? 82 : 46; line(ctx, px, y0, px, y0 - up * dd, k.sLine, 1); var al = px > W0 - 80 ? 'right' : px < 80 ? 'left' : 'center', lx = al === 'right' ? px + 6 : al === 'left' ? px - 6 : px; sTxt(ctx, q[0], lx, y0 - up * (dd + 8), { align: al, size: 11, weight: 700 }); if (F.on('times', true, true)) sTxt(ctx, tl, lx, y0 - up * (dd + 8) + (up > 0 ? -14 : 14), { align: al, size: 10, color: k.sAcc }); F.tagAt(ctx, 'star' + i, px + 12, y0 + 10); });
          desc = 'Distances from Earth on a scale where each step is ten times farther.'; read = 'A light-year is a <b>distance</b>: how far light goes in a year, 9.46 trillion km. Light from the Sun takes 8.3 minutes; from the nearest star, 4.2 years; from the Andromeda Galaxy, about 2.5 million years, so we see it as it was then.'; }
      } else if (mode === 'parallax') {
        var p = 1 / P.d, cx0 = W0 * 0.3, cy0 = H0 * 0.7, Ro = M.min(W0, H0) * 0.14, sy = cy0 - M.min(H0 * 0.55, 60 * P.d + 40); ctx.save(); ctx.strokeStyle = k.sLine; ctx.beginPath(); ctx.ellipse(cx0, cy0, Ro, Ro * 0.35, 0, 0, TAU); ctx.stroke(); ctx.restore(); circ(ctx, cx0, cy0, 8, { fill: '#ffd479' }); var e1 = [cx0 - Ro, cy0], e2 = [cx0 + Ro, cy0]; [e1, e2].forEach(function (q, i) { circ(ctx, q[0], q[1], 5, { fill: '#4dabf7' }); sTxt(ctx, i ? 'July' : 'January', q[0], q[1] + 16, { align: 'center', size: 10.5 }); line(ctx, q[0], q[1], cx0, sy, rgba('#dbe7ef', 0.5), 1.2); });
        circ(ctx, cx0, sy, 5, { fill: '#fff' }); F.tagAt(ctx, 'star0', cx0 + 14, sy); var bandY = 24; for (var q = 0; q < 14; q++) circ(ctx, 20 + q * (W0 - 40) / 13, bandY + (q % 3) * 6, 1.6, { fill: '#8fb3c6' }); sTxt(ctx, 'distant background stars', W0 - 20, bandY + 26, { align: 'right', size: 10.5, color: k.sMuted });
        var shift = clamp(40 / P.d, 4, 60); circ(ctx, W0 * 0.72 - shift, H0 * 0.5, 4, { fill: rgba('#fff', 0.5) }); circ(ctx, W0 * 0.72 + shift, H0 * 0.5, 4, { fill: '#fff' }); arrow(ctx, W0 * 0.72 - shift, H0 * 0.5 + 12, W0 * 0.72 + shift, H0 * 0.5 + 12, { color: k.sAcc, w: 1.6, double: true, head: 6 }); sTxt(ctx, 'apparent shift = 2p', W0 * 0.72, H0 * 0.5 + 28, { align: 'center', size: 10.5, color: k.sAcc }); sTxt(ctx, 'the star against the background, January and July', W0 * 0.72, H0 * 0.5 - 16, { align: 'center', size: 10.5, color: k.sMuted });
        desc = 'A star ' + un(P.d, 'pc') + ' away seen from opposite sides of Earth\'s orbit.'; read = 'The parallax angle p is half the star\'s yearly shift against far background stars. d (parsecs) = 1/p (arcseconds): here p = <b>' + fm(p, 3) + '″</b> for <b>' + un(P.d, 'pc', 3) + '</b> (' + un(P.d * 3.26, 'ly', 3) + '). A <b>bigger</b> parallax means a <b>closer</b> star; even the nearest star\'s is under 1″.'; st = [['parallax p', fm(p, 3) + '″'], ['distance', un(P.d, 'pc', 3)]];
      } else if (mode === 'inverse-square') {
        var cx1 = 40, cy1 = H0 / 2, unitPx = (W0 - 80) / 4.2; var gg = ctx.createRadialGradient(cx1, cy1, 1, cx1, cy1, 20); gg.addColorStop(0, '#fff'); gg.addColorStop(1, 'rgba(255,212,121,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx1, cy1, 20, 0, TAU); ctx.fill();
        [1, 2, 3].forEach(function (d) { var x = cx1 + d * unitPx, h = d * 40; ctx.save(); ctx.strokeStyle = k.sLine; ctx.strokeRect(x - 2, cy1 - h / 2, 4, h); for (var j = 1; j < d; j++) line(ctx, x - 6, cy1 - h / 2 + j * 40, x + 6, cy1 - h / 2 + j * 40, k.sLine, 1); ctx.restore(); sTxt(ctx, d === 1 ? '1× distance: 1 square' : d + '× distance: ' + d * d + ' squares, 1/' + d * d + ' each', x, cy1 + h / 2 + 16, { align: 'center', size: 10.5 }); line(ctx, cx1, cy1, x, cy1 - h / 2, rgba('#ffd479', 0.35), 1); line(ctx, cx1, cy1, x, cy1 + h / 2, rgba('#ffd479', 0.35), 1); });
        var fl = 1 / (P.d * P.d); circ(ctx, cx1 + P.d * unitPx, cy1, 7, { fill: '#63e6be' }); if (F.vals) sTxt(ctx, 'here: ' + fm(fl * 100, 1) + '% of the brightness at 1 unit', cx1 + P.d * unitPx, 24, { align: 'center', size: 11.5, weight: 700, color: '#63e6be' });
        desc = 'Light from a point spreading over larger and larger areas.'; read = 'The same light spreads over an area that grows as distance squared, so brightness falls as <b>1/d²</b>: twice as far gives a quarter as bright, not half. At ' + fm(P.d, 2) + ' units: <b>' + fm(fl * 100, 1) + '%</b>.'; st = [['relative brightness', fm(fl * 100, 1) + '%']];
      } else if (mode === 'magnitudes') {
        var r = { x: 60, y: 16, w: W0 - 80, h: H0 - 30 }, Y = function (m) { return r.y + (m + 28) / 36 * r.h; }; line(ctx, r.x, Y(-28), r.x, Y(8), k.sLine, 2); for (var m = -25; m <= 5; m += 5) { line(ctx, r.x - 5, Y(m), r.x, Y(m), k.sMuted, 1); sTxt(ctx, String(m), r.x - 8, Y(m), { align: 'right', size: 10.5, color: k.sMuted }); }
        MAGS.forEach(function (q, i) { var y = Y(q[1]); circ(ctx, r.x + 26, y, clamp(6 - q[1] * 0.3, 2, 14), { fill: '#ffd479' }); sTxt(ctx, q[0] + ' (' + fm(q[1], 2) + ')', r.x + 46, y, { size: 11.5 }); F.tagAt(ctx, 'star' + i, r.x - 30, y); }); sTxt(ctx, 'brighter ↑', r.x + r.w, r.y + 10, { align: 'right', size: 11, color: k.sMuted }); sTxt(ctx, 'fainter ↓', r.x + r.w, r.y + r.h - 6, { align: 'right', size: 11, color: k.sMuted });
        desc = 'Apparent magnitudes of the Sun, Moon, Venus and some stars.'; read = '<b>Smaller (and negative) magnitudes are brighter.</b> Each step of 1 magnitude is a factor of 2.512 in brightness, so 5 magnitudes is exactly 100 times. A magnitude-1 star is 100 times brighter than a magnitude-6 star.';
      } else if (mode === 'cepheids') {
        var Pd = P.per, Mv = PM.cepheidM(Pd), mApp = P.mApp, dpc = PM.distMod(mApp, Mv), half = H0 / 2 - 10, G1 = sGP(ctx, { x: 50, y: 14, w: W0 - 64, h: half - 30 }, { xmin: 0, xmax: 3, ymin: -0.6, ymax: 0.6, xlab: 'time (periods)', ylab: 'brightness', yticks: false }); G1.plot(function (x) { var ph = x % 1; return ph < 0.15 ? -0.5 + ph / 0.15 : 0.5 - (ph - 0.15) / 0.85; }, '#ffd479', 2.2); G1.vline(t, k.sAcc, [4, 3]);
        var G2 = sGP(ctx, { x: 50, y: half + 18, w: W0 - 64, h: half - 34 }, { xmin: 0, xmax: 2, ymin: -1, ymax: -7, xlab: 'log₁₀ period (days)', ylab: 'absolute magnitude (brighter ↑)', ystep: 1, xstep: 0.5 }); G2.plot(function (x) { return PM.cepheidM(M.pow(10, x)); }, '#63e6be', 2.4); G2.dot(M.log10(Pd), Mv, '#ffd479', 5);
        desc = 'A Cepheid variable with a ' + un(Pd, 'day') + ' period and the period–luminosity relation.'; read = 'Longer-period Cepheids are more luminous (Leavitt\'s law). Measure the period (' + un(Pd, 'days', 3) + ') → absolute magnitude M = <b>' + fm(Mv, 2) + '</b>; compare with how bright it looks (m = ' + fm(mApp, 1) + ') → distance d = 10<sup>(m − M + 5)/5</sup> = <b>' + un(dpc / 1e6, 'Mpc', 3) + '</b>.'; st = [['absolute magnitude', fm(Mv, 2)], ['distance', un(dpc / 1e6, 'Mpc', 3)]];
      } else if (mode === 'hubble') {
        var gals = arr(o.galaxies), R1 = rng(17); if (!gals.length) for (var i = 0; i < 18; i++) { var d = 5 + R1() * 395; gals.push({ d: d, v: 70 * d + (R1() - 0.5) * 3000 }); }
        var G3 = sGP(ctx, { x: 56, y: 16, w: W0 - 70, h: H0 - 44 }, { xmin: 0, xmax: 420, ymin: 0, ymax: 32000, xlab: 'distance (Mpc)', ylab: 'recession speed (km/s)', xstep: 100, ystep: 5000 }); gals.forEach(function (g, i) { G3.dot(num(g.d, 0), num(g.v, 0), '#dbe7ef', 4); }); if (F.on('fit', true)) G3.plot(function (x) { return P.H0 * x; }, '#ffd479', 2.4);
        var tH = 977.8 / P.H0; desc = 'Galaxies\' recession speeds against their distances, with v = H₀d.'; read = 'Farther galaxies recede faster, in proportion: v = H₀d with H₀ = <b>' + fm(P.H0, 0) + ' km/s/Mpc</b> (measurements range from about 67 to 73). 1/H₀ = <b>' + un(tH, 'billion years', 3) + '</b>, close to the age of the universe.'; st = [['H₀', un(P.H0, 'km/s/Mpc', 3)], ['1/H₀', un(tH, 'Gyr', 3)]];
      } else if (mode === 'expansion') {
        var sc = 1 + 0.25 * (t % 3), G4 = gal(), cx2 = W0 / 2, cy2 = H0 / 2, Lp = M.min(W0, H0) * 0.32, me = G4[you]; G4.forEach(function (g, i) { var gx = cx2 + (g.x - me.x) * Lp * sc, gy = cy2 + (g.y - me.y) * Lp * sc; g.px = gx; g.py = gy; ctx.save(); ctx.fillStyle = i === you ? '#63e6be' : 'rgba(219,231,239,0.85)'; ctx.beginPath(); ctx.ellipse(gx, gy, i === you ? 6 : 4, i === you ? 3.5 : 2.5, i, 0, TAU); ctx.fill(); ctx.restore(); if (i !== you) arrow(ctx, gx, gy, gx + (g.x - me.x) * 18, gy + (g.y - me.y) * 18, { color: rgba('#ffd479', 0.6), w: 1.2, head: 5 }); }); sTxt(ctx, 'you', me.px + 8, me.py - 8, { size: 11, weight: 700, color: '#63e6be' }); F.tagAt(ctx, 'you', me.px - 14, me.py + 12);
        desc = 'Galaxies in an expanding universe seen from one of them.'; read = 'Space stretches everywhere at once, so from <b>any</b> galaxy all the others move away, faster in proportion to distance. Click another galaxy to stand there: the picture looks the same. There is no center.';
      } else if (mode === 'scale-factor') {
        var fr = PM.friedmann(P.H0, P.Om, P.OL), tmx = 30, sH = 64, G5 = sGP(ctx, { x: 50, y: 16, w: W0 - 64, h: H0 - 44 - sH }, { xmin: 0, xmax: tmx, ymin: 0, ymax: 2.5, xlab: 't (billion years)', ylab: 'scale factor a (now = 1)', xstep: 5, ystep: 0.5 }); G5.line(fr.pts.filter(function (q, i) { return i % 4 === 0 && q[0] <= tmx; }), '#ffd479', 2.6); G5.vline(fr.age, '#63e6be', [4, 3]); G5.hline(1, k.sMuted, [3, 4]); sTxt(ctx, 'now', G5.X(fr.age) + 4, G5.Y(2.3), { size: 11, color: '#63e6be' });
        var aE = 1 / (1 + P.z), tE = 0; for (var qi = 0; qi < fr.pts.length; qi++) if (fr.pts[qi][1] >= aE) { tE = fr.pts[qi][0]; break; } if (P.z > 0) { G5.vline(tE, '#ff8787', [4, 3]); G5.dot(tE, aE, '#ff8787', 4.5); sTxt(ctx, 'light leaves', G5.X(tE) + 4, G5.Y(2.05), { size: 10.5, color: '#ff8787' }); }
        var wy0 = H0 - sH + 2, l0 = 18, wv = function (y, lam, col, lab) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); for (var xx = 0; xx <= W0 - 150; xx += 2) { var yy = y + 7 * M.sin(TAU * xx / lam); if (xx) ctx.lineTo(70 + xx, yy); else ctx.moveTo(70, yy); } ctx.stroke(); ctx.restore(); sTxt(ctx, lab, 64, y, { align: 'right', size: 10.5, color: col }); };
        wv(wy0 + 12, l0, '#74c0fc', 'emitted'); wv(wy0 + 40, l0 * (1 + P.z), '#ff8787', 'received');
        if (F.vals) sTxt(ctx, '1 + z = ' + fm(1 + P.z, 1) + ': wavelength ' + fm(1 + P.z, 1) + '× longer', W0 - 12, wy0 + 54, { align: 'right', size: 10.5, color: k.sMuted });
        desc = 'How the scale factor of the universe grows with time for Ω_m = ' + fm(P.Om, 2) + ', Ω_Λ = ' + fm(P.OL, 2) + ', with light emitted at redshift ' + fm(P.z, 1) + ' stretching on its way.'; read = 'Distances between galaxies scale with a(t). Early on matter slowed the growth; later dark energy speeds it up (the curve bends upward). Light\'s wavelength stretches along with space: 1 + z = a<sub>now</sub>/a<sub>then</sub>. Age in this model: <b>' + un(fr.age, 'billion years', 3) + '</b>.' + (P.z > 0 ? ' Light from a galaxy at z = ' + fm(P.z, 1) + ' set out when the universe was 1/' + fm(1 + P.z, 1) + ' of its present size, about ' + un(fr.age - tE, 'billion years', 2) + ' ago.' : ''); st = [['age', un(fr.age, 'Gyr', 3)], ['light travel time', un(fr.age - tE, 'Gyr', 3)]];
      } else { // ladder
        var rungs = [['radar', 'Moon and planets', 3e8, 1.5e12], ['parallax', 'stars to a few thousand parsecs', 1e15, 1e20], ['Cepheids', 'galaxies to about 40 Mpc', 3e19, 1.2e24], ['Type Ia supernovae', 'to billions of light-years', 3e22, 3e26], ['Hubble law', 'the farthest galaxies', 1e24, 4.4e26]], X2 = function (d) { return 24 + (M.log10(d) - 8) / 19 * (W0 - 48); }, RC = ['#74c0fc', '#63e6be', '#ffd479', '#ffa94d', '#ff8787'], gap = (H0 - 50) / 5;
        rungs.forEach(function (q, i) { var y = 16 + i * gap + gap * 0.45, x0 = X2(q[2]), x1 = X2(q[3]); rrect(ctx, x0, y, x1 - x0, 12, 6); ctx.fillStyle = rgba(RC[i], 0.7); ctx.fill(); var lab = q[0] + ': ' + q[1], rt = x0 + 220 > W0; sTxt(ctx, lab, rt ? x1 : x0, y - 9, { size: 11.5, weight: 700, color: RC[i], align: rt ? 'right' : 'left' }); F.tagAt(ctx, 'rung' + i, x0 - 12, y + 6); });
        for (var e2 = 8; e2 <= 26; e2 += W0 > 560 ? 2 : 6) sTxt(ctx, '10' + sup(e2) + ' m', X2(M.pow(10, e2)), H0 - 12, { align: 'center', size: 10, color: k.sMuted });

        desc = 'The rungs of the cosmic distance ladder and the distances each covers.'; read = 'No single method works at every distance. Each rung is calibrated with the one below where they overlap: parallax calibrates Cepheids, Cepheids calibrate Type Ia supernovae, and those extend to the Hubble flow.';
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  // ===================================================================================================
  // ph-star. Solar values rounded from standard solar models and NASA: core 15.7 MK, base of the convection zone ≈ 2 MK at 0.71 R☉.
  var SUNPROF = [[0, 15.7e6, 150], [0.25, 7e6, 20], [0.7, 2e6, 0.2], [1, 5772, 2e-7]]; // anchor values from NASA's solar-interior summaries; the photosphere's density is about 2 × 10⁻⁷ g/cm³
  function profAt(x, i) { /* smooth log-space curve through the anchors 0, 0.25 and 0.7 R☉ (quadratic), used only inside 0.7 R☉ */ var y0 = M.log(SUNPROF[0][i]), y1 = M.log(SUNPROF[1][i]), y2 = M.log(SUNPROF[2][i]), x1 = 0.25, x2 = 0.7, c2 = ((y2 - y0) / x2 - (y1 - y0) / x1) / (x2 - x1), c1 = (y1 - y0) / x1 - c2 * x1; return M.exp(y0 + c1 * x + c2 * x * x); }
  PM.eddington = function (Msun) { return 4 * PI * GN * Msun * MSUN * C0 / 0.04 / LSUN; }; // in L☉, electron scattering in ionized hydrogen, κ = 0.04 m²/kg
  PM.kelvinHelmholtz = function () { return GN * MSUN * MSUN / (RSUN * LSUN) / 3.156e7; }; // years
  PM.randomWalkYears = function (ell) { return RSUN * RSUN / (ell * C0) / 3.156e7; };
  R('ph-star', function (el, o) {
    var mode = pick(o.mode, ['layers', 'profiles', 'balance', 'randomwalk', 'virial', 'sunspots', 'eddington'], 'layers');
    var F = frame(el, o, { layers: 'Inside the Sun', profiles: 'Temperature and density inside the Sun', balance: 'Hydrostatic equilibrium', randomwalk: 'A photon\'s random walk out of the Sun', virial: 'A contracting cloud heats up', sunspots: 'Sunspots and the 11-year cycle', eddington: 'Radiation pressure against gravity (Eddington limit)' }[mode]);
    var c = F.canvas({ aspect: 1.6, narrow: 1.0 }), ell = num(o.stepLength, 0.001), Ms = num(o.M, 1), walk = [], R0 = rng(5);
    if (mode === 'randomwalk' && o.steps) for (var s0 = 0; s0 < clamp(M.round(num(o.steps, 0)), 0, 3000); s0++) { var a0 = R0() * TAU, p0 = walk.length ? walk[walk.length - 1] : [0, 0]; walk.push([p0[0] + M.cos(a0), p0[1] + M.sin(a0)]); }
    var A = mode === 'randomwalk' || mode === 'virial' || mode === 'sunspots' ? F.anim({ tmax: mode === 'virial' ? 1 : mode === 'sunspots' ? 22 : undefined, loop: mode !== 'randomwalk', scrub: mode !== 'randomwalk', rate: mode === 'sunspots' ? 2 : 0.2, autoplay: true, tick: mode === 'randomwalk' ? function (h) { for (var i = 0; i < 6; i++) { var a = R0() * TAU, p = walk.length ? walk[walk.length - 1] : [0, 0]; walk.push([p[0] + M.cos(a), p[1] + M.sin(a)]); } if (walk.length > 3000) walk = []; return true; } : null, dt: 0.05, tlabel: mode === 'sunspots' ? 'Years' : mode === 'virial' ? 'Contraction' : 'Time', tfmt: mode === 'sunspots' ? function (v) { return fd(v, 1, 'yr'); } : mode === 'virial' ? function (v) { return fd(v * 100, 0, '%'); } : null }) : { t: 0 };
    if (F.live && mode === 'eddington') F.slider(null, { label: 'Star mass', min: 1, max: 300, step: 1, value: Ms, unit: 'M☉', d: 0, input: function (v) { Ms = v; } });
    if (F.live && mode === 'randomwalk') F.slider(null, { label: 'Step length (mean free path)', min: 0.0001, max: 0.01, step: 0.0001, value: ell, unit: 'm', d: 4, input: function (v) { ell = v; } });
    F.draw = function () {
      var ctx = c.ctx, k = K(), W0 = c.w, H0 = c.h, t = A.t, desc = '', read = '', st = []; spaceBg(c, 13);
      if (mode === 'layers') {
        var wide = W0 > 560, cx0 = wide ? W0 * 0.26 : W0 / 2, cy0 = wide ? H0 / 2 : H0 * 0.36, R1 = wide ? M.min(W0 * 0.24, H0 * 0.4) : M.min(W0 * 0.34, H0 * 0.27);
        var gc = ctx.createRadialGradient(cx0, cy0, R1, cx0, cy0, R1 * 1.45); gc.addColorStop(0, 'rgba(230,240,255,0.32)'); gc.addColorStop(1, 'rgba(230,240,255,0)'); ctx.fillStyle = gc; ctx.beginPath(); ctx.arc(cx0, cy0, R1 * 1.45, 0, TAU); ctx.fill();
        circ(ctx, cx0, cy0, R1 * 1.025, { fill: '#e8590c' }); circ(ctx, cx0, cy0, R1, { fill: '#f08c00' }); circ(ctx, cx0, cy0, R1 * 0.7, { fill: '#ffa94d' }); circ(ctx, cx0, cy0, R1 * 0.25, { fill: '#fff3bf' }); circ(ctx, cx0, cy0, R1, { color: '#ffd479', w: 2.5 });
        var Rz = rng(3), zz = [[cx0 + R1 * 0.25, cy0]]; for (var q = 1; q < 26; q++) { var rr = 0.25 + 0.45 * q / 25; zz.push([cx0 + R1 * rr, cy0 + (Rz() - 0.5) * R1 * 0.14]); } poly(ctx, zz.map(function (p) { var a = -0.55, dx = p[0] - cx0, dy = p[1] - cy0; return [cx0 + dx * M.cos(a) - dy * M.sin(a), cy0 + dx * M.sin(a) + dy * M.cos(a)]; }), { color: 'rgba(120,50,0,0.75)', w: 1.2 });
        for (var j = 0; j < 9; j++) { var aa = j / 9 * TAU + 0.3, rc = R1 * 0.85, ccx = cx0 + rc * M.cos(aa), ccy = cy0 + rc * M.sin(aa), rl = R1 * 0.11; ctx.save(); ctx.strokeStyle = 'rgba(120,50,0,0.7)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.ellipse(ccx, ccy, rl * 1.25, rl, aa, 0.3, TAU - 0.3); ctx.stroke(); ctx.restore(); }
        var LAB = [['corona (over 1 million K, very thin)', 1.3, 'corona', '#dbe7ef'], ['chromosphere (thin, reddish layer)', 1.012, 'chromosphere', '#ff8787'], ['photosphere (visible surface, 5772 K)', 1.0, 'photosphere', '#ffd479'], ['convective zone (0.7–1 R☉)', 0.85, 'convective', '#f08c00'], ['radiative zone (0.25–0.7 R☉)', 0.5, 'radiative', '#ffa94d'], ['core: fusion, 15.7 million K', 0.12, 'core', '#fff3bf']];
        LAB.forEach(function (q, i) { var lx, ly, px, py; if (wide) { lx = cx0 + R1 * 1.45 + 16; ly = cy0 - R1 * 0.9 + i * R1 * 1.8 / 5; var sa = clamp((ly - cy0) / (q[1] * R1), -0.94, 0.94), a = M.asin(sa); px = cx0 + q[1] * R1 * M.cos(a); py = cy0 + q[1] * R1 * sa; line(ctx, px, py, lx - 6, ly, rgba('#dbe7ef', 0.55), 1); circ(ctx, px, py, 2.4, { fill: '#fff' }); sTxt(ctx, q[0], lx, ly, { size: 11.5, weight: 700, color: q[3] }); F.tagAt(ctx, q[2], px, py - 12); }
          else { lx = 30; ly = cy0 + R1 * 1.45 + 14 + i * 18; circ(ctx, 18, ly, 5, { fill: q[3] }); sTxt(ctx, q[0], lx, ly, { size: 11.5, weight: 700 }); F.tagAt(ctx, q[2], cx0 + q[1] * R1 * M.cos(-0.9 + i * 0.35), cy0 + q[1] * R1 * M.sin(-0.9 + i * 0.35)); } });
        desc = 'A cutaway of the Sun: core, radiative zone, convective zone, photosphere, chromosphere and corona.'; read = 'The Sun is hot gas (plasma) all the way through, with no solid surface: the photosphere is just the layer light escapes from. Energy is made by <b>nuclear fusion</b> in the core, not by burning, carried outward by radiation, then by rising and sinking gas. The thin corona is over a million kelvins.';
      } else if (mode === 'profiles') {
        var hh = (H0 - 60) / 2, rT = { x: 62, y: 22, w: W0 - 76, h: hh - 6 }, rD = { x: 62, y: 40 + hh, w: W0 - 76, h: hh - 14 }, GT = sGP(ctx, rT, { xmin: 0, xmax: 1, ymin: 3.5, ymax: 7.5, xlab: '', ylab: '', yticks: false, xticks: false, ystep: 1, xstep: 0.25 }), GD = sGP(ctx, rD, { xmin: 0, xmax: 1, ymin: -7, ymax: 3, xlab: '', ylab: '', yticks: false, ystep: 2, xstep: 0.25 });
        [4, 5, 6, 7].forEach(function (e) { txt(ctx, '10' + sup(e), rT.x - 4, GT.Y(e), { align: 'right', size: 10.5, color: k.sMuted }); }); [-6, -4, -2, 0, 2].forEach(function (e) { txt(ctx, e === 0 ? '1' : '10' + sup(e), rD.x - 4, GD.Y(e), { align: 'right', size: 10.5, color: k.sMuted }); });
        [[GT, 1, '#ff8787'], [GD, 2, '#74c0fc']].forEach(function (q) { var Gq = q[0]; Gq.plot(function (x) { return M.log10(profAt(x, q[1])); }, q[2], 2.6, null, 0, 0.7); line(ctx, Gq.X(0.7), Gq.Y(M.log10(SUNPROF[2][q[1]])), Gq.X(1), Gq.Y(M.log10(SUNPROF[3][q[1]])), q[2], 1.6, [2, 4]); SUNPROF.forEach(function (a, n) { var px = Gq.X(a[0]), py = Gq.Y(M.log10(a[q[1]])); circ(ctx, px, py, 4, { fill: q[2] }); if (F.vals) sTxt(ctx, q[1] === 1 ? (a[1] >= 1e6 ? fm(a[1] / 1e6, 1) + ' million K' : fm(a[1], 0) + ' K') : (a[2] >= 0.1 ? fm(a[2], 1) + ' g/cm³' : 'about 2 × 10⁻⁷ g/cm³'), px + (n === 3 ? -6 : 8), py + (n === 0 ? 14 : -10), { size: 10.5, weight: 700, color: q[2], align: n === 3 ? 'right' : 'left' }); }); Gq.vline(0.25, k.sMuted, [3, 4], 1); Gq.vline(0.7, k.sMuted, [3, 4], 1); });
        [['core', 0.125], ['radiative zone', 0.475], ['convective zone', 0.85]].forEach(function (q) { sTxt(ctx, q[0], GT.X(q[1]), 12, { align: 'center', size: 10.5, color: k.sMuted }); }); sTxt(ctx, 'temperature (K, log scale)', rT.x + rT.w - 6, rT.y + 12, { align: 'right', size: 11, weight: 700, color: '#ff8787' }); sTxt(ctx, 'density (g/cm³, log scale)', rD.x + rD.w - 6, rD.y + 12, { align: 'right', size: 11, weight: 700, color: '#74c0fc' }); sTxt(ctx, 'distance from the center (r / R☉)', rD.x + rD.w, rD.y + rD.h + 28, { align: 'right', size: 10.5, color: k.sMuted });
        desc = 'Temperature and density against distance from the Sun\'s center, on log scales.'; read = 'The center reaches about 15.7 million K and 150 g/cm³ (over ten times the density of lead). Across the radiative zone the temperature drops from about 7 million to 2 million K and the density from about 20 to 0.2 g/cm³. The visible surface is only 5772 K and its gas is extremely thin. (The dotted lines just join the end points: the real fall is steepest close to the surface.)';
      } else if (mode === 'balance') {
        var Rb = H0 * 1.05, cxb = W0 / 2, cyb = H0 * 1.3, gb = ctx.createRadialGradient(cxb, cyb, Rb * 0.2, cxb, cyb, Rb); gb.addColorStop(0, '#fff3bf'); gb.addColorStop(0.7, '#ffa94d'); gb.addColorStop(1, '#e8590c'); ctx.fillStyle = gb; ctx.beginPath(); ctx.arc(cxb, cyb, Rb, 0, TAU); ctx.fill();
        var sx = cxb, sy = cyb - Rb * 0.62, bw2 = M.min(120, W0 * 0.3); ctx.save(); ctx.fillStyle = 'rgba(7,18,28,0.35)'; ctx.fillRect(sx - bw2 / 2, sy - 14, bw2, 28); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(sx - bw2 / 2, sy - 14, bw2, 28); ctx.restore(); F.tagAt(ctx, 'shell', sx + bw2 / 2 + 14, sy);
        var bt = function (str, x, y, col, al) { txt(ctx, str, x, y, { size: 11.5, weight: 700, color: col, align: al || 'left', halo: true, haloColor: 'rgba(255,236,210,0.85)' }); };
        arrow(ctx, sx - bw2 * 0.25, sy + 70, sx - bw2 * 0.25, sy + 16, { color: '#0b7285', w: 3.4, head: 10 }); bt('pressure from below (larger)', sx - bw2 * 0.25 - 10, sy + 56, '#0b5563', 'right');
        arrow(ctx, sx - bw2 * 0.25, sy - 58, sx - bw2 * 0.25, sy - 16, { color: '#c92a2a', w: 2.4, head: 8 }); bt('pressure from above', sx - bw2 * 0.25 - 10, sy - 48, '#a61e1e', 'right');
        arrow(ctx, sx + bw2 * 0.25, sy, sx + bw2 * 0.25, sy + 46, { color: '#5c3d00', w: 2.4, head: 8 }); bt('weight (gravity toward the center)', sx + bw2 * 0.25 + 10, sy + 40, '#4a2f00'); bt('a thin layer of gas', sx + bw2 / 2 + 8, sy - 22, '#2b1400');
        txt(ctx, '↓ toward the star\'s center', W0 / 2, H0 - 12, { align: 'center', size: 10.5, color: '#3b1d00' });
        desc = 'A thin layer of gas inside a star, pushed up by pressure from below and down by pressure from above and its own weight.'; read = 'In a stable star each layer is balanced: the pressure underneath exceeds the pressure above by just enough to hold up the layer\'s weight (dP/dr = −GM(r)ρ/r²). So pressure, and with it temperature and density, rises toward the center. Hot gas pressure, not a solid core, holds the star up.';
      } else if (mode === 'randomwalk') {
        var cx2 = W0 / 2, cy2 = H0 / 2, sp = M.min(W0, H0) / 80; circ(ctx, cx2, cy2, M.min(W0, H0) * 0.45, { color: k.sLine, w: 1 }); poly(ctx, walk.map(function (p) { return [cx2 + p[0] * sp, cy2 + p[1] * sp]; }), { color: rgba('#ffd479', 0.7), w: 1 }); var last = walk[walk.length - 1] || [0, 0]; circ(ctx, cx2 + last[0] * sp, cy2 + last[1] * sp, 4, { fill: '#fff' }); var dN = M.hypot(last[0], last[1]);
        var yrs = PM.randomWalkYears(ell); desc = 'A photon\'s random walk: each step goes a random way.'; read = 'After N steps the photon is typically only √N steps from where it began (here ' + walk.length + ' steps, ' + fm(dN, 1) + ' steps away). To get out of the Sun it needs (R/ℓ)² steps: with ℓ = ' + un(ell * 1000, 'mm', 2) + ', about <b>' + sig(yrs, 2) + ' years</b>, against 2.3 seconds in a straight line. (The real step length changes with depth, so estimates range widely.)'; st = [['steps', String(walk.length)], ['distance (steps)', fm(dN, 1)], ['√N', fm(M.sqrt(walk.length), 1)]];
      } else if (mode === 'virial') {
        var fr = clamp(t, 0, 1), Rr = 1 - 0.7 * fr, cx3 = W0 * 0.32, cy3 = H0 / 2, Rp = M.min(W0 * 0.26, H0 * 0.4) * Rr, Tm = 1 / Rr; circ(ctx, cx3, cy3, Rp, { fill: bbColor(1400 * Tm), color: k.sLine, w: 1 }); sTxt(ctx, fr < 0.5 ? 'cool, large cloud' : 'smaller and hotter', cx3, cy3 + Rp + 40 > H0 - 8 ? H0 - 10 : cy3 + Rp + 40, { align: 'center', size: 11, color: k.sMuted }); for (var q = 0; q < 8; q++) { var a2 = q / 8 * TAU; arrow(ctx, cx3 + (Rp + 6) * M.cos(a2), cy3 + (Rp + 6) * M.sin(a2), cx3 + (Rp + 26) * M.cos(a2), cy3 + (Rp + 26) * M.sin(a2), { color: rgba('#ffd479', 0.6), w: 1.6, head: 6 }); }
        var G6 = sGP(ctx, { x: W0 * 0.58, y: 18, w: W0 * 0.4 - 8, h: H0 - 46 }, { xmin: 0, xmax: 1, ymin: -3.5, ymax: 2, xlab: 'shrinking →', ylab: 'energy', yticks: false, xticks: false }); var Uf = function (x) { return -1 / (1 - 0.7 * x); }; G6.plot(Uf, '#74c0fc', 2.2); G6.plot(function (x) { return -Uf(x) / 2; }, '#ff8787', 2.2); G6.plot(function (x) { return Uf(x) / 2; }, '#dbe7ef', 2.2, [6, 4]); G6.plot(function (x) { return -Uf(x) / 2 - 0.5; }, '#ffd479', 2.2); G6.vline(fr, k.sAcc, [4, 3]);
        [['gravitational U', Uf(1) , '#74c0fc'], ['thermal K = −U/2', -Uf(1) / 2, '#ff8787'], ['total E = U/2', Uf(1) / 2, '#dbe7ef'], ['radiated away', -Uf(1) / 2 - 0.5, '#ffd479']].forEach(function (q, i) { sTxt(ctx, q[0], G6.X(1) - 4, clamp(G6.Y(q[1]) + (i === 3 ? 14 : -10), 30, H0 - 40), { align: 'right', size: 10.5, weight: 700, color: q[2] }); });
        desc = 'A gas cloud shrinking as it radiates energy away.'; read = 'As the cloud shrinks, gravity releases energy: by the virial theorem about half heats the gas and half is radiated away. So a contracting star <b>gets hotter</b> while losing energy. For the Sun this alone could last only about ' + nf(PM.kelvinHelmholtz() / 1e6, 2) + ' million years (Kelvin–Helmholtz), far too short: fusion powers it.';
      } else if (mode === 'sunspots') {
        var cx4 = W0 * 0.3, cy4 = H0 / 2, R4 = M.min(W0 * 0.22, H0 * 0.38), cyc = 0.5 - 0.5 * M.cos(TAU * t / 11); var gg = ctx.createRadialGradient(cx4, cy4, 0, cx4, cy4, R4); gg.addColorStop(0, '#fff3bf'); gg.addColorStop(0.85, '#ffc078'); gg.addColorStop(1, '#f08c00'); circ(ctx, cx4, cy4, R4, { fill: gg }); var R5 = rng(31); for (var s2 = 0; s2 < M.round(cyc * 14); s2++) { var la = (R5() - 0.5) * 0.9, lo = (R5() - 0.5) * 1.6, sxp = cx4 + R4 * M.sin(lo) * M.cos(la), syp = cy4 - R4 * M.sin(la); circ(ctx, sxp, syp, 3 + R5() * 4, { fill: '#5c3d1e' }); circ(ctx, sxp, syp, 1.5 + R5() * 2, { fill: '#2b1a0c' }); }
        var G3 = sGP(ctx, { x: W0 * 0.58, y: 20, w: W0 * 0.38, h: H0 - 50 }, { xmin: 0, xmax: 22, ymin: 0, ymax: 1.1, xlab: 'years', ylab: 'sunspot number (schematic)', yticks: false, xstep: 11 }); G3.plot(function (x) { return 0.5 - 0.5 * M.cos(TAU * x / 11); }, '#ffd479', 2.2); G3.vline(t, k.sAcc, [4, 3]);
        desc = 'The Sun with sunspots, and the rise and fall of their number over about 11 years.'; read = 'Sunspots look dark because they are <b>cooler</b> than the surface around them (roughly 3,800–4,500 K against 5,772 K): strong magnetic fields hold back the heat flowing up from below. Their number rises and falls over about 11 years.';
      } else {
        var Ledd = PM.eddington(Ms), Lstar = PM.msL(Ms), G4 = sGP(ctx, { x: 56, y: 16, w: W0 - 70, h: H0 - 44 }, { xmin: 0, xmax: M.log10(300), ymin: 0, ymax: 8, xlab: 'log₁₀ mass (M☉)', ylab: 'log₁₀ luminosity (L☉)', ystep: 1, xstep: 0.5 }); G4.plot(function (x) { return M.log10(PM.eddington(M.pow(10, x))); }, '#ff8787', 2.4); G4.plot(function (x) { return M.log10(PM.msL(M.pow(10, x))); }, '#ffd479', 2.2, [6, 4]); G4.dot(M.log10(Ms), M.log10(Lstar), '#ffd479', 5); sTxt(ctx, 'Eddington limit', G4.X(0.2), G4.Y(M.log10(PM.eddington(1.6))) - 10, { size: 11.5, color: '#ff8787', weight: 700 }); sTxt(ctx, 'main-sequence luminosity (approximate)', G4.X(0.6), G4.Y(M.log10(PM.msL(4))) + 14, { size: 11, color: '#ffd479' });
        desc = 'The Eddington luminosity against mass, with main-sequence luminosities.'; read = 'Light pushes on the gas it passes through. Above L<sub>Edd</sub> = 4πGMc/κ (about 33,000 L☉ per solar mass for ionized hydrogen) radiation pressure beats gravity and blows the outer layers away. This caps how massive a stable star can be. For ' + un(Ms, 'M☉') + ': L<sub>Edd</sub> ≈ <b>' + nf(Ledd, 3) + ' L☉</b>.'; st = [['Eddington luminosity', un(Ledd, 'L☉', 3)]];
      }
      F.desc(desc); F.read(read); F.stats(st);
    };
    F.now(); return {};
  });

  QUEUE.forEach(function (q) { R0(q[0], q[1]); });

  // test hook: the pure physics models, so node can check them
  ML.physModels = PM;
  ML.physKit = { nf: nf, cx: cx, mini: mini, bbColor: bbColor, wl2rgb: wl2rgb, planckL: planckL, niceStep: niceStep, tickLabel: tickLabel };
})(window, document);
