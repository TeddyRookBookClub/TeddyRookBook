// ---- 00_head.js
/* Earth & Space Ladder · Geology (geology): problem generators for all 62 topics.
   Built from /tmp/work_geology/gen/*.js by build_gen.js. Every answer is computed from the numbers each problem shows.
   Each problem also carries vf (the kind and the inputs it was built from) so an independent test can recompute it.
   Values follow the Earth & Space overview: g = 9.8 m/s²; crust 2.7 g/cm³, mantle 3.3 g/cm³, ice 0.917, seawater 1.025;
   geothermal gradient about 25 °C/km near the surface; vP about 6 km/s and vS about 3.5 km/s in the crust;
   Mw = (2/3)(log10 M0 − 9.1) with M0 = μAD and μ = 3 × 10^10 Pa; half-lives C-14 5,730 yr, K-40 1.25 billion,
   U-238 4.47 billion, U-235 704 million, Rb-87 48.8 billion. Problems state the typical values they use. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel, M = Math;

  // ---------- numbers ----------
  function rnd(x, n) { if (x === 0 || !isFinite(x)) return x; return Number(x.toPrecision(n || 3)); }
  function fix(x) { return Number(Number(x).toPrecision(12)); }
  function r2(x, d) { var f = M.pow(10, d == null ? 2 : d); return fix(M.round(x * f) / f); }
  /* ans(x, n): canonical answer string, n significant figures (default 3) */
  function ans(x, n) {
    n = n || 3; var a = M.abs(x);
    if (a !== 0 && (a >= 1e7 || a < 1e-3)) return x.toExponential(n - 1).replace(/\.?0+e/, 'e').replace('e+', 'e');
    return String(rnd(x, n));
  }
  /* fx(x, n): TeX for x to n significant figures; scientific notation outside 0.001 to 9,999,999 */
  function fx(x, n) {
    n = n || 3; var a = M.abs(x);
    if (a !== 0 && (a >= 1e7 || a < 1e-3)) {
      var e = M.floor(M.log10(a)), m = rnd(x / M.pow(10, e), n);
      if (M.abs(m) >= 10) { m = rnd(m / 10, n); e++; }
      return String(m) + ' \\times 10^{' + e + '}';
    }
    return T.commas(rnd(x, n));
  }
  /* fd(x, d): fixed decimals, float noise removed, trailing zeros dropped, thousands commas */
  function fd(x, d) { var s = fix(x).toFixed(d == null ? 2 : d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); if (s === '-0') s = '0'; return T.commas(Number(s)); }
  /* tx(x, n): a number for plain text (outside math), with thousands commas */
  function tx(x, n) { return Number(rnd(x, n || 3)).toLocaleString('en-US', { maximumFractionDigits: 6 }); }
  function un(s) { return '\\,\\text{' + s + '}'; }
  function q$(x, n, u) { return '$' + fx(x, n) + (u ? un(u) : '') + '$'; }
  function d$(x, d, u) { return '$' + fd(x, d) + (u ? un(u) : '') + '$'; }
  function deg(x, d) { return fd(x, d == null ? 1 : d) + '^\\circ'; }
  var RAD = M.PI / 180, DEG = 180 / M.PI;

  // ---------- answers ----------
  function num(x, n, rtol) { return { t: 'num', v: ans(x, n), rtol: rtol == null ? 0.02 : rtol }; }
  function pnum(x, n, rtol) { return { t: 'num', v: ans(x, n), rtol: rtol == null ? 0.02 : rtol, pct: true }; }
  function exact(x) { return { t: 'num', v: String(fix(x)) }; }
  function mc(correct, wrongs) { return U.mc(correct, wrongs, 4); }
  function mcK(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  /* an order of letters, accepted as "CADB", "C A D B", "C, A, D, B", "C,A,D,B", "C-A-D-B" */
  function order(arr) { var a = arr.map(String); return { t: 'text', v: [a.join(''), a.join(' '), a.join(', '), a.join(','), a.join('-'), a.join(' - '), a.join(', then ')] }; }
  function wrongs(R, pool, k, not) { return R.sample(pool.filter(function (w) { return w !== not; }), M.min(k || 3, pool.length)); }
  function P(q, a, steps, hint, extra) { var p = { q: q, a: a, steps: steps }; if (hint) p.hint = hint; if (extra) for (var k in extra) p[k] = extra[k]; if (p.unit === '%') delete p.unit; return p; }
  /* a multiple-choice concept question from a bank of [stem, right, [wrongs], [steps], hint] */
  function bankQ(R, bank, k) {
    var b = R.pick(bank);
    return P(b[0], mc(b[1], R.sample(b[2], M.min(3, b[2].length))), b[3], b[4], { vf: { k: k || 'mc' } });
  }
  function bankTF(R, bank, k) { // [statement, true/false, [steps], hint]
    var b = R.pick(bank);
    return P('True or false: ' + b[0], tf(b[1]), b[2], b[3], { vf: { k: k || 'tf' } });
  }
  var LET = 'ABCDEFGHIJ';

  // ---------- shared Earth values (overview) ----------
  var GRAV = 9.8, RHO_C = 2.7, RHO_M = 3.3, RHO_ICE = 0.917, RHO_SEA = 1.025, GRAD = 25, R_EARTH = 6371;
  var HALF = { 'C-14': 5730, 'K-40': 1.25e9, 'U-238': 4.47e9, 'U-235': 7.04e8, 'Rb-87': 4.88e10 };

// ---- 01_interior.js
  // =====================================================================================
  // Unit 1: Earth's Origin and Interior
  // =====================================================================================

  // rocky bodies: mass (kg) and mean radius (km), NASA planetary fact sheets (rounded)
  var BODIES = [
    { n: 'Earth', m: 5.97e24, r: 6371 }, { n: 'Mars', m: 6.42e23, r: 3390 }, { n: 'Mercury', m: 3.30e23, r: 2440 },
    { n: 'Venus', m: 4.87e24, r: 6052 }, { n: 'the Moon', m: 7.35e22, r: 1737 }
  ];
  // events in million years ago (rounded; ICS chart and the overview)
  var EVENTS = [
    { n: 'Earth formed', ma: 4540 }, { n: 'the oldest known mineral grains (zircons) formed', ma: 4400 },
    { n: 'the oldest known rocks formed', ma: 4000 }, { n: 'the oldest widely accepted fossils (stromatolites) formed', ma: 3500 },
    { n: 'oxygen began building up in the air', ma: 2400 }, { n: 'the Cambrian Period began', ma: 539 },
    { n: 'the dinosaurs (other than birds) died out', ma: 66 }
  ];

  G('geology.earth-formation', function (R, ctx) {
    var kind = by(ctx, R.pick(['density', 'gap', 'gap', 'why']), R.pick(['density', 'gap', 'pct', 'why']), R.pick(['density3', 'pct', 'cal', 'why']));
    if (kind === 'density' || kind === 'density3') {
      var b = R.pick(BODIES), V = 4 / 3 * M.PI * M.pow(b.r * 1000, 3), Vr = rnd(V, 3), rho = b.m / (kind === 'density3' ? V : Vr) / 1000;
      var q = kind === 'density3'
        ? 'The mass of ' + b.n + ' is ' + q$(b.m, 3, 'kg') + ' and its mean radius is ' + q$(b.r, 4, 'km') + '. What is its mean density in g/cm³? (Treat it as a sphere.)'
        : 'The mass of ' + b.n + ' is ' + q$(b.m, 3, 'kg') + ' and its volume is ' + q$(Vr, 3, 'm^3') + '. What is its mean density in g/cm³?';
      var steps = (kind === 'density3' ? ['Volume of a sphere: $V = \\tfrac{4}{3}\\pi r^3 = \\tfrac{4}{3}\\pi (' + fx(b.r * 1000, 4) + '\\,\\text{m})^3 = ' + fx(V, 3) + '\\,\\text{m}^3$.'] : [])
        .concat(['Density is mass per volume: $\\rho = \\dfrac{m}{V} = \\dfrac{' + fx(b.m, 3) + '\\,\\text{kg}}{' + fx(kind === 'density3' ? V : Vr, 3) + '\\,\\text{m}^3} = ' + fx(rho * 1000, 3) + '\\,\\text{kg/m}^3$.',
          'Divide by 1,000 to get g/cm³ (1 g/cm³ = 1,000 kg/m³): $\\rho \\approx ' + fd(rho, 2) + '\\,\\text{g/cm}^3$.',
          rho > 4.5 ? 'Surface rocks are only about 2.7 to 3.0 g/cm³, so the inside must be much denser: a heavy iron core that sank to the center while the planet was hot.' : b.n === 'Mars' ? 'That is denser than its surface rock (about 3 g/cm³), so Mars has a metal core too, smaller for its size than Earth\'s.' : 'That is close to the density of rock, so the Moon has only a small metal core.']);
      return P(q, num(rho, 3), steps, 'Divide the mass by the volume, then change kg/m³ to g/cm³.', { unit: 'g/cm³', vf: { k: 'density', m: b.m, V: kind === 'density3' ? null : Vr, r: b.r } });
    }
    if (kind === 'gap' || kind === 'pct' || kind === 'cal') {
      var ev = R.sample(EVENTS.slice(1), 2).sort(function (a, b2) { return b2.ma - a.ma; });
      if (kind === 'gap') {
        var a0 = R.coin() ? EVENTS[0] : ev[0], b0 = a0 === EVENTS[0] ? ev[R.int(0, 1)] : ev[1];
        var d = a0.ma - b0.ma;
        return P('About ' + T.commas(a0.ma) + ' million years ago, ' + a0.n + '. About ' + T.commas(b0.ma) + ' million years ago, ' + b0.n + '. How many million years passed between the two?', num(d, 4, 0.005),
          ['Ages count back from today, so the bigger number is the older event.', 'Time between them: $' + T.commas(a0.ma) + ' - ' + T.commas(b0.ma) + ' = ' + T.commas(d) + '$ million years.', d >= 1000 ? 'That is ' + fd(d / 1000, 2) + ' billion years.' : 'Deep time is big: even this gap is many times longer than humans have existed (about 0.3 million years).'],
          'Subtract the younger age from the older one.', { unit: 'million years', vf: { k: 'gap', a: a0.ma, b: b0.ma } });
      }
      var e = ev[R.int(0, 1)], f = (4540 - e.ma) / 4540;
      if (kind === 'pct') {
        return P('Earth formed about 4,540 million years ago. About ' + T.commas(e.ma) + ' million years ago, ' + e.n + '. What percent of Earth\'s history had already passed by then?', pnum(f * 100, 3, 0.01),
          ['Time already passed: $4,540 - ' + T.commas(e.ma) + ' = ' + T.commas(4540 - e.ma) + '$ million years.', 'As a fraction of all of Earth\'s history: $\\dfrac{' + T.commas(4540 - e.ma) + '}{4,540} = ' + fd(f, 4) + '$.', 'That is about $' + fd(f * 100, 1) + '\\%$.'],
          'Find how long after Earth formed it happened, then divide by 4,540.', { unit: '%', vf: { k: 'pct', ma: e.ma } });
      }
      var day = f * 365;
      return P('Squeeze Earth\'s 4,540 million years into one 365-day year, with Earth forming at the first moment of January 1. About ' + T.commas(e.ma) + ' million years ago, ' + e.n + '. On which day of that year does it happen? (Give the day number, 1 to 365.)', { t: 'num', v: String(M.ceil(day)), tol: 2 },
        ['Fraction of Earth\'s history already passed: $\\dfrac{4,540 - ' + T.commas(e.ma) + '}{4,540} = ' + fd(f, 4) + '$.', 'Days into the year: $' + fd(f, 4) + ' \\times 365 = ' + fd(day, 1) + '$.', 'That is during day ' + M.ceil(day) + ' (' + dateOfDay(M.ceil(day)) + ').'],
        'Find the fraction of Earth\'s history that had passed, then take that fraction of 365 days.', { vf: { k: 'cal', ma: e.ma } });
    }
    return bankQ(R, [
      ['Earth is about 4.54 billion years old, but its oldest known rocks are only about 4.0 billion years old. Why?', 'Earth\'s earliest crust was melted, worn away or recycled, so the age comes from meteorites and Moon rocks that formed at the same time',
        ['Rock takes about half a billion years to harden after it forms', 'Radiometric dating always gives ages about half a billion years too young', 'The oldest rocks lie on the deep seafloor, where no one has sampled them yet'],
        ['Early Earth was hot and violent, and plate tectonics keeps recycling crust, so very little of the first crust survives.', 'Meteorites formed with the rest of the solar system and were never recycled; radiometric dates of many meteorites (and of the oldest Moon rocks) cluster near 4.5 billion years.', 'The seafloor is actually young: almost no ocean floor is older than about 200 million years.'], 'Think about what plate tectonics does to old crust.'],
      ['Why is Earth\'s core made mostly of iron and nickel?', 'While early Earth was hot and partly molten, dense metal sank to the center and lighter rock rose',
        ['Iron arrived last, in meteorites that buried themselves deep', 'High pressure turns rock into iron over time', 'Earth\'s magnetic field pulled the iron inward'],
        ['When rock and metal are melted, they separate by density, like oil and water.', 'Iron (about 7.9 g/cm³ at the surface) sank; silicate rock (about 3 g/cm³) floated up. This sorting is called differentiation.', 'The result is layers by density: iron core, rocky mantle, light crust.'], 'Which is denser, iron or rock?'],
      ['Where does the age of 4.54 billion years for Earth come from?', 'Radiometric dating of meteorites and Moon rocks that formed with the rest of the solar system',
        ['Radiometric dating of the oldest rocks on Earth', 'Counting the yearly layers in the thickest stacks of sediment', 'How long it would take the oceans to become as salty as they are'],
        ['Meteorites are leftover pieces from when the planets formed; they have not been melted or recycled since.', 'Lead isotopes in meteorites give about 4.54 billion years, and the oldest Moon rocks and Earth minerals fit with it.', 'Sediment layers and ocean salt cannot work as clocks this long: layers are eroded and salt is removed as well as added.'], 'Which objects have stayed unchanged since the planets formed?'],
      ['After Earth sorted itself by density, which layer ended up made of the lightest material?', 'The crust', ['The inner core', 'The outer core', 'The mantle'],
        ['Differentiation put the densest material (iron) at the center and the lightest rock on top.', 'Continental crust is about 2.7 g/cm³, lighter than the mantle (about 3.3 near the top) and far lighter than the core.'], 'Light things float to the top.']
    ], 'why');
  });
  function dateOfDay(d) { var mo = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], nm = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], i = 0; while (d > mo[i]) { d -= mo[i]; i++; } return nm[i] + ' ' + d; }

  G('geology.seismic-interior', function (R, ctx) {
    var kind = by(ctx, R.pick(['shadow', 'hole', 'why']), R.pick(['shadow', 'hole', 'model', 'arc']), R.pick(['shadow', 'arc', 'model', 'why']));
    if (kind === 'shadow') {
      var zones = [R.int(4, 8) * 10, R.int(11, 13) * 10 + R.pick([0, 5]), R.int(15, 17) * 10 + R.pick([0, 5])], perm = R.shuffle([0, 1, 2]), angles = perm.map(function (i) { return zones[i]; });
      var ask = R.int(0, 2), target = perm.indexOf(ask), qs = ['records both P and S waves', 'records no direct P or S waves (it is in the P-wave shadow zone)', 'records P waves but no S waves'];
      var why = ['Up to about $103^\\circ$ from the quake, both waves arrive through the solid mantle.', 'From about $103^\\circ$ to $142^\\circ$, S waves are blocked by the liquid outer core and P waves are bent away by it, so neither arrives directly: the P-wave shadow zone.', 'Beyond about $142^\\circ$, P waves arrive after passing through the core, but S waves never do, because S waves cannot cross the liquid outer core.'];
      return P('Stations A, B and C stand ' + angles.map(function (a, i) { return '$' + a + '^\\circ$ (' + LET[i] + ')'; }).join(', ') + ' around Earth from an earthquake. Which station ' + qs[ask] + '?', mcK(['A', 'B', 'C'], target),
        [why[ask], 'Station ' + LET[target] + ' is at $' + angles[target] + '^\\circ$, so it ' + qs[ask].replace(/ \(.*\)/, '') + '.'],
        'S waves stop beyond about 103°; direct P waves are missing from about 103° to 142°.', { viz: { name: 'es-interior', opts: { mode: 'rays', rays: 'both', stations: angles, quiet: true, lock: true } }, vf: { k: 'shadow', angles: angles, ask: ask } });
    }
    if (kind === 'hole') {
      var dh = R.pick([12.3, 12.3, 9.1]), pct = dh / R_EARTH * 100, where = dh === 12.3 ? 'the deepest hole ever drilled (the Kola borehole in Russia) reached about 12.3 km' : 'a deep research borehole in Germany reached about 9.1 km';
      return P('Earth\'s radius is about 6,371 km, and ' + where + '. What percent of the way to Earth\'s center is that?', pnum(pct, 3, 0.02),
        ['Fraction of the way down: $\\dfrac{' + fd(dh, 1) + '\\,\\text{km}}{6,371\\,\\text{km}} = ' + fd(dh / R_EARTH, 5) + '$.', 'As a percent: about $' + fd(pct, 2) + '\\%$.', 'Drilling barely scratches the surface. Everything we know about the deep layers comes from how seismic waves travel through them.'],
        'Divide the depth by the radius and multiply by 100.', { unit: '%', vf: { k: 'hole', d: dh } });
    }
    if (kind === 'model') {
      var gr = R.pick([15, 20, 25, 30]), dh2 = 12.3, mm = dh2 / R_EARTH * gr * 10;
      return P('A classroom globe has a radius of ' + gr + ' cm. Earth\'s radius is about 6,371 km, and the deepest hole ever drilled reached about 12.3 km. How deep would that hole be on the globe, in millimeters?', num(mm, 2, 0.03),
        ['Scale factor: the globe is $' + gr + '\\,\\text{cm}$ for $6,371\\,\\text{km}$.', 'Depth on the globe: $12.3 \\times \\dfrac{' + gr + '\\,\\text{cm}}{6,371} = ' + fd(mm / 10, 4) + '\\,\\text{cm}$.', 'In millimeters: about $' + fd(mm, 2) + '\\,\\text{mm}$, the thickness of about ' + M.round(mm / 0.1) + ' sheets of paper. Drilling has barely scratched the surface.'],
        'Find what fraction of the radius the hole is, then take that fraction of the globe\'s radius.', { unit: 'mm', vf: { k: 'model', g: gr, d: dh2 } });
    }
    if (kind === 'arc') {
      var ang = R.pick([103, 142, 105, 140]), arc = ang / 360 * 2 * M.PI * R_EARTH, lab = ang <= 105 ? 'S waves stop arriving' : 'P waves start arriving again';
      return P('About $' + ang + '^\\circ$ around Earth from an earthquake, ' + lab + '. How far is that, measured along Earth\'s surface? (Earth\'s radius is 6,371 km.)', num(arc, 3, 0.01),
        ['The full circumference is $2\\pi r = 2\\pi(6,371) \\approx 40,030\\,\\text{km}$.', '$' + ang + '^\\circ$ is $\\dfrac{' + ang + '}{360}$ of a full circle.', 'Distance $= \\dfrac{' + ang + '}{360} \\times 40,030 \\approx ' + T.commas(M.round(arc)) + '\\,\\text{km}$.'],
        'An arc is a fraction of the circumference: angle ÷ 360°.', { unit: 'km', vf: { k: 'arc', a: ang } });
    }
    return bankQ(R, [
      ['How do scientists know the outer core is liquid?', 'S waves never arrive on the far side of Earth, and S waves cannot travel through liquid',
        ['Drill cores from the outer core contain molten iron', 'Volcanoes erupt liquid iron from the outer core', 'Earth\'s magnetic field would be stronger if the core were solid'],
        ['S waves shake rock side to side. A liquid does not spring back when sheared, so it cannot carry them.', 'Beyond about 103° from any earthquake, no direct S waves arrive: a huge shadow cast by a liquid layer.', 'No drill has gone deeper than about 12 km, and lava comes from the upper mantle and crust, not the core.'], 'Which kind of wave can\'t cross a liquid?'],
      ['Why do P waves leave a shadow zone from about 103° to 142°?', 'They slow down and bend sharply where they enter the liquid outer core',
        ['They are absorbed completely by the outer core', 'They bounce off a solid inner core and go back to the quake', 'They are too weak to reach that far'],
        ['Waves bend (refract) when their speed changes. P waves slow from about 13.7 to 8 km/s as they enter the outer core.', 'That sudden bend steers them away from the band between about 103° and 142°, leaving a shadow, and sends them to arrive beyond 142°.'], 'What happens to a wave when its speed changes suddenly?'],
      ['The deepest hole ever drilled is about 12 km deep. How do we know what Earth is like thousands of kilometers down?', 'From how seismic waves speed up, slow down, bend, reflect and disappear as they pass through',
        ['From samples brought up by drilling', 'From lava, which comes from the core', 'From photographs taken by deep-sea robots'],
        ['Thousands of seismometers record every large earthquake.', 'Arrival times show where waves speed up or slow down and where they bend or are blocked; that maps the crust, mantle, liquid outer core and solid inner core.'], 'What can pass all the way through Earth?'],
      ['How do scientists know the inner core is solid?', 'P waves speed up when they enter it, and weak waves reflect off its edge',
        ['S waves travel through it at the same speed as through the mantle', 'It is too hot to be liquid', 'Drilling reached it in 1936'],
        ['In 1936 Inge Lehmann noticed faint P waves arriving inside the shadow zone; they had bounced off a boundary deep inside the core.', 'P waves travel faster in the inner core (about 11 km/s) than in the outer core (about 8 to 10 km/s), as expected for a solid. Pressure there is so high that iron stays solid even at about 5,000 °C or more.'], 'Think about what changes in wave speed tell you.']
    ], 'why');
  });

  G('geology.geothermal-gradient', function (R, ctx) {
    var kind = by(ctx, R.pick(['temp', 'temp', 'depth', 'why']), R.pick(['temp', 'depth', 'grad', 'why']), R.pick(['depth', 'grad', 'flow', 'extra']));
    var T0 = R.int(10, 20), g = R.pick([20, 22, 25, 25, 28, 30]);
    if (kind === 'temp') {
      var z = R.pick([1.5, 2, 3, 4, 5, 6, 8]), Tz = T0 + g * z;
      return P('At the surface the rock is ' + T0 + ' °C, and the temperature rises ' + g + ' °C per kilometer. What is the temperature ' + fd(z, 1) + ' km down a mine shaft or well?', num(Tz, 3, 0.01),
        ['Temperature gained: $' + g + '\\,\\tfrac{^\\circ\\text{C}}{\\text{km}} \\times ' + fd(z, 1) + '\\,\\text{km} = ' + fd(g * z, 1) + '^\\circ\\text{C}$.', 'Add the surface temperature: $' + T0 + ' + ' + fd(g * z, 1) + ' = ' + fd(Tz, 1) + '^\\circ\\text{C}$.'],
        'Temperature = surface temperature + gradient × depth.', { unit: '°C', vf: { k: 'temp', T0: T0, g: g, z: z } });
    }
    if (kind === 'depth') {
      var Tw = R.pick([100, 120, 150, 180, 200]), zz = (Tw - T0) / g;
      return P('A geothermal power plant needs rock at ' + Tw + ' °C. The surface is ' + T0 + ' °C and the temperature rises about ' + g + ' °C per kilometer. About how deep must the wells go?', num(zz, 3, 0.02),
        ['Warming needed: $' + Tw + ' - ' + T0 + ' = ' + (Tw - T0) + '^\\circ\\text{C}$.', 'Depth: $\\dfrac{' + (Tw - T0) + '^\\circ\\text{C}}{' + g + '^\\circ\\text{C/km}} \\approx ' + fd(zz, 2) + '\\,\\text{km}$.'],
        'Find how many degrees warmer it must be, then divide by the gradient.', { unit: 'km', vf: { k: 'depth', T0: T0, g: g, T: Tw } });
    }
    if (kind === 'grad') {
      var z1 = R.pick([0.5, 1, 1.5]), z2 = z1 + R.pick([1, 1.5, 2, 2.5]), g2 = R.pick([18, 20, 24, 25, 26, 30, 32]), t1 = T0 + g2 * z1, t2 = T0 + g2 * z2;
      return P('In a deep borehole, the rock is ' + fd(t1, 1) + ' °C at ' + fd(z1, 1) + ' km and ' + fd(t2, 1) + ' °C at ' + fd(z2, 1) + ' km. What is the geothermal gradient in °C per km?', num(g2, 3, 0.01),
        ['Gradient = change in temperature ÷ change in depth.', '$\\dfrac{' + fd(t2, 1) + ' - ' + fd(t1, 1) + '}{' + fd(z2, 1) + ' - ' + fd(z1, 1) + '} = \\dfrac{' + fd(t2 - t1, 1) + '}{' + fd(z2 - z1, 1) + '} = ' + g2 + '^\\circ\\text{C/km}$.'],
        'Rise over run: temperature change divided by depth change.', { unit: '°C/km', vf: { k: 'grad', z1: z1, z2: z2, t1: t1, t2: t2 } });
    }
    if (kind === 'flow') {
      var kk = R.pick([2, 2.5, 3, 3.2, 2.4]), q = kk * g;
      return P('Heat flows up through rock by conduction: $q = k \\times \\dfrac{\\Delta T}{\\Delta z}$. A crust has a thermal conductivity of $k = ' + fd(kk, 1) + '\\,\\text{W/(m·K)}$ and a gradient of ' + g + ' °C per km. What is the heat flow in milliwatts per square meter?', num(q, 3, 0.02),
        ['Change the gradient to SI units: $' + g + '^\\circ\\text{C/km} = ' + fd(g / 1000, 3) + '\\,\\text{K/m}$ (a change of 1 °C equals a change of 1 K).', '$q = ' + fd(kk, 1) + ' \\times ' + fd(g / 1000, 3) + ' = ' + fd(q / 1000, 4) + '\\,\\text{W/m}^2$.', 'That is $' + fd(q, 1) + '\\,\\text{mW/m}^2$, close to the average for continents (about 65 mW/m²).'],
        'Write the gradient in kelvins per meter first.', { unit: 'mW/m²', vf: { k: 'flow', kk: kk, g: g } });
    }
    if (kind === 'extra') {
      var Tc = T0 + 25 * R_EARTH;
      return P('Near the surface, temperature rises about 25 °C per km. If it kept rising that fast all the way to Earth\'s center, 6,371 km down, what would the center\'s temperature be? (Start from ' + T0 + ' °C at the surface.)', num(Tc, 3, 0.01),
        ['$' + T0 + ' + 25 \\times 6,371 \\approx ' + T.commas(M.round(Tc)) + '^\\circ\\text{C}$.', 'The real center is about 5,000 to 6,000 °C, nearly 30 times cooler. The gradient is steep only in the crust, where heat must squeeze out by slow conduction and radioactive elements are concentrated; deeper down, the convecting mantle carries heat so well that temperature climbs only gently.'],
        'Multiply the gradient by the depth and add the surface temperature.', { unit: '°C', vf: { k: 'extra', T0: T0 } });
    }
    return bankQ(R, [
      ['What keeps Earth\'s interior hot after 4.5 billion years?', 'Heat left from Earth\'s formation plus heat from the radioactive decay of uranium, thorium and potassium',
        ['Sunlight soaking down through the rock', 'Friction from the Moon\'s tides alone', 'Burning of coal and oil deep underground'],
        ['Colliding pieces and sinking iron released huge heat as Earth formed, and rock is a poor conductor, so much of it is still there.', 'Radioactive elements in the rock keep adding heat. The two sources are thought to contribute roughly comparable amounts to the heat flowing out today.', 'Sunlight warms only the top few meters; it does not explain hot rock kilometers down.'], 'Think about where heat came from when Earth formed, and what keeps adding it.'],
      ['The temperature rises about 25 °C per km in the upper crust. Why can\'t you use that rate to find the temperature at the center?', 'The gradient is steep only near the surface; deeper, the mantle convects and temperature rises much more slowly',
        ['The gradient gets steeper with depth, so the center is even hotter than 160,000 °C', 'Temperature stops rising below the crust', 'The core is cold because it is made of metal'],
        ['A steady 25 °C/km would give about 160,000 °C at the center, hotter than the Sun\'s surface.', 'In the crust, heat moves by slow conduction, so a steep gradient builds up. The mantle flows slowly and carries heat by convection, so the temperature climbs gently. Estimates of the center are about 5,000 to 6,000 °C.'], 'Is the gradient the same at every depth?']
    ], 'why');
  });

  G('geology.isostasy', function (R, ctx) {
    var kind = by(ctx, R.pick(['float', 'root', 'why']), R.pick(['root', 'root', 'height', 'float']), R.pick(['root', 'height', 'ice', 'total']));
    if (kind === 'float') {
      var c = R.pick([['an iceberg (ice, 0.917 g/cm³) floating in seawater (1.025 g/cm³)', 0.917, 1.025], ['a block of continental crust (2.7 g/cm³) floating on the mantle (3.3 g/cm³)', 2.7, 3.3], ['a block of oceanic crust (2.9 g/cm³) floating on the mantle (3.3 g/cm³)', 2.9, 3.3], ['an ice cube (0.917 g/cm³) floating in fresh water (1.000 g/cm³)', 0.917, 1.0], ['a block of oak (0.75 g/cm³) floating in fresh water (1.00 g/cm³)', 0.75, 1.0], ['a block of basalt (3.0 g/cm³) floating on the mantle (3.3 g/cm³)', 3.0, 3.3], ['a block of granite (2.65 g/cm³) floating on the mantle (3.3 g/cm³)', 2.65, 3.3]]);
      var fr = c[1] / c[2] * 100;
      return P('A floating object sinks until it pushes aside its own weight of the fluid. What percent of ' + c[0] + ' lies below the fluid\'s surface?', pnum(fr, 3, 0.01),
        ['Floating balance: (weight of the object) = (weight of the fluid it pushes aside).', 'So $\\rho_{\\text{object}} \\times V_{\\text{total}} = \\rho_{\\text{fluid}} \\times V_{\\text{under}}$, and $\\dfrac{V_{\\text{under}}}{V_{\\text{total}}} = \\dfrac{\\rho_{\\text{object}}}{\\rho_{\\text{fluid}}} = \\dfrac{' + c[1] + '}{' + c[2] + '} = ' + fd(c[1] / c[2], 3) + '$.', 'About $' + fd(fr, 1) + '\\%$ lies below the surface.'],
        'The fraction under the surface is the ratio of the two densities.', { unit: '%', vf: { k: 'float', a: c[1], b: c[2] } });
    }
    var dens = kind === 'root' && ctx.level === 1 ? [RHO_C, RHO_M] : R.pick([[2.7, 3.3], [2.7, 3.3], [2.75, 3.3], [2.8, 3.3], [2.6, 3.25], [2.7, 3.24]]), rc = dens[0], rm = dens[1], fac = rc / (rm - rc);
    if (kind === 'root' || kind === 'height' || kind === 'total') {
      var h = R.int(2, 12) / 2, root = h * fac, base = R.pick([30, 35, 40]);
      var stp = ['Isostasy: columns of the same width press equally on the mantle below the deepest root, so the extra rock above sea level must be balanced by light crust pushing down into the dense mantle.',
        'The mountain\'s extra weight, $\\rho_c h$, equals the buoyancy lost in the root, $(\\rho_m - \\rho_c) r$: so $r = h \\dfrac{\\rho_c}{\\rho_m - \\rho_c}$.'];
      if (kind === 'root') return P('A mountain range stands ' + fd(h, 1) + ' km above the surrounding plains. The crust is ' + rc + ' g/cm³ and the mantle is ' + rm + ' g/cm³. If the range is in isostatic balance (Airy model), how deep a root of crust extends into the mantle below it?', num(root, 3, 0.01),
        stp.concat(['$r = ' + fd(h, 1) + ' \\times \\dfrac{' + rc + '}{' + rm + ' - ' + rc + '} = ' + fd(h, 1) + ' \\times ' + fd(fac, 2) + ' = ' + fd(root, 2) + '\\,\\text{km}$.', 'The root is ' + fd(fac, 1) + ' times the height: like an iceberg, most of a mountain range is out of sight.']),
        'Use $r = h\\,\\rho_c / (\\rho_m - \\rho_c)$.', { unit: 'km', vf: { k: 'root', h: h, rc: rc, rm: rm } });
      if (kind === 'height') return P('Seismic waves show that the crust under a plateau has a root reaching ' + fd(root, 2) + ' km into the mantle. The crust is ' + rc + ' g/cm³ and the mantle is ' + rm + ' g/cm³. If the plateau is in isostatic balance (Airy model), how high does it stand above the surrounding lowlands?', num(h, 3, 0.01),
        stp.concat(['Solve $r = h\\dfrac{\\rho_c}{\\rho_m - \\rho_c}$ for $h$: $h = r \\dfrac{\\rho_m - \\rho_c}{\\rho_c}$.', '$h = ' + fd(root, 2) + ' \\times \\dfrac{' + fd(rm - rc, 2) + '}{' + rc + '} = ' + fd(h, 2) + '\\,\\text{km}$.']),
        'Rearrange the root formula for the height.', { unit: 'km', vf: { k: 'height', r: root, rc: rc, rm: rm } });
      var tot = base + h + root;
      return P('Normal crust in a region is ' + base + ' km thick and stands near sea level. A mountain range there rises ' + fd(h, 1) + ' km higher and is in isostatic balance (Airy model; crust ' + rc + ' g/cm³, mantle ' + rm + ' g/cm³). How thick is the crust under the highest part of the range, from the peaks to the bottom of the root?', num(tot, 3, 0.01),
        stp.concat(['Root: $r = ' + fd(h, 1) + ' \\times \\dfrac{' + rc + '}{' + rm + ' - ' + rc + '} = ' + fd(root, 2) + '\\,\\text{km}$.', 'Total thickness = mountain height + normal crust + root $= ' + fd(h, 1) + ' + ' + base + ' + ' + fd(root, 2) + ' = ' + fd(tot, 2) + '\\,\\text{km}$.']),
        'Add the height above, the normal thickness and the root below.', { unit: 'km', vf: { k: 'total', h: h, base: base, rc: rc, rm: rm } });
    }
    if (kind === 'ice') {
      var H = R.int(4, 14) / 4, dep = H * RHO_ICE / RHO_M;
      return P('An ice sheet ' + fd(H, 2) + ' km thick (ice 0.917 g/cm³) rests on the land for thousands of years, until the land beneath sinks into the mantle (3.3 g/cm³) and balances it. How far has the land been pushed down? (After the ice melts, it slowly rises back by the same amount.)', num(dep, 3, 0.01),
        ['When balanced, the weight of the ice equals the weight of mantle pushed aside: $\\rho_{\\text{ice}} H = \\rho_m d$.', '$d = H\\dfrac{\\rho_{\\text{ice}}}{\\rho_m} = ' + fd(H, 2) + ' \\times \\dfrac{0.917}{3.3} = ' + fd(dep, 3) + '\\,\\text{km}$, about $' + T.commas(M.round(dep * 1000)) + '\\,\\text{m}$.', 'Parts of Canada and Scandinavia are still rising today, about a centimeter a year in places, because the ice from the last ice age melted only about 10,000 years ago.'],
        'Balance the ice\'s weight against the mantle it pushes aside.', { unit: 'km', vf: { k: 'ice', H: H } });
    }
    return bankQ(R, [
      ['Why do high mountain ranges have thick roots of crust beneath them?', 'Crust floats on the denser mantle, so extra height above must be balanced by light crust reaching down, like an iceberg',
        ['Mountains rest on a flat base of solid rock that holds them up', 'The roots are made of iron that anchors the mountains', 'Roots grow later as rain soaks into the mountains'],
        ['The crust (about 2.7 g/cm³) is lighter than the mantle (about 3.3 g/cm³), and over long times the mantle flows like a very thick fluid.', 'A column of crust that rises higher must also sink deeper, just as the bigger part of an iceberg sits under the water. Seismic waves confirm roots of 50 to 70 km under ranges like the Himalayas and the Andes.'], 'Think of an iceberg.'],
      ['As erosion wears a mountain range down, what happens to the land beneath it?', 'It rises, because the lighter load lets the root float back up',
        ['It sinks, because erosion weakens the crust', 'Nothing; the root stays where it is', 'It slides sideways into the lowlands'],
        ['Take weight off a floating object and it rides higher.', 'As the top wears away, the root slowly rises to keep the balance, which is why rocks that formed deep under old mountains now lie at the surface.'], 'What happens to a floating block when you remove some of its top?']
    ], 'why');
  });

  // polarity: normal intervals since 3.6 Ma (geomagnetic polarity time scale, rounded)
  var NORMAL_IV = [[0, 0.77, 'Brunhes'], [0.99, 1.07, 'Jaramillo'], [1.78, 1.93, 'Olduvai']];
  function polarityAt(ma) { for (var i = 0; i < NORMAL_IV.length; i++) if (ma >= NORMAL_IV[i][0] && ma < NORMAL_IV[i][1]) return 'normal'; return 'reversed'; }

  G('geology.paleomagnetism', function (R, ctx) {
    var kind = by(ctx, R.pick(['polarity', 'curie', 'why']), R.pick(['incl', 'polarity', 'curie', 'why']), R.pick(['lat', 'lat', 'incl', 'moved']));
    if (kind === 'polarity') {
      var cands = [0.2, 0.3, 0.5, 0.6, 0.9, 1.03, 1.2, 1.5, 1.6, 1.85, 2.2, 2.4], ma = R.pick(cands), pol = polarityAt(ma);
      var tbl = 'Between today and 2.58 million years ago, the field had normal polarity (like today) from 0 to 0.77, from 0.99 to 1.07 and from 1.78 to 1.93 million years ago, and reversed polarity the rest of the time.';
      return P('A lava flow cooled ' + fd(ma, 2) + ' million years ago. ' + tbl + ' Which way would the magnetic minerals in the lava point?', mc(pol === 'normal' ? 'Normal: toward today\'s north magnetic pole' : 'Reversed: toward today\'s south magnetic pole', [pol === 'normal' ? 'Reversed: toward today\'s south magnetic pole' : 'Normal: toward today\'s north magnetic pole', 'Straight down, because lava has no magnetism', 'In random directions, because the field was flipping']),
        ['As lava cools below about 580 °C, tiny grains of magnetite line up with Earth\'s field and are locked in place.', fd(ma, 2) + ' million years ago falls in a ' + pol + ' interval.', 'So the lava records ' + pol + ' polarity.'],
        'Find which interval the age falls in.', { vf: { k: 'polarity', ma: ma } });
    }
    if (kind === 'curie') {
      var T0 = R.int(10, 20), g = R.pick([20, 25, 30, 35]), z = (580 - T0) / g;
      return P('Magnetite, the main magnetic mineral in rock, loses its magnetism above its Curie temperature of about 580 °C. With a surface temperature of ' + T0 + ' °C and a gradient of ' + g + ' °C per km, below what depth is the rock too hot to stay magnetized?', num(z, 3, 0.02),
        ['Warming needed: $580 - ' + T0 + ' = ' + (580 - T0) + '^\\circ\\text{C}$.', 'Depth: $\\dfrac{' + (580 - T0) + '}{' + g + '} \\approx ' + fd(z, 1) + '\\,\\text{km}$.', 'Below a few tens of kilometers no rock can hold a magnet, and the core is thousands of degrees hotter. So Earth\'s field is not a buried bar magnet: it is made by moving liquid iron in the outer core.'],
        'Find the depth where the temperature reaches 580 °C.', { unit: 'km', vf: { k: 'curie', T0: T0, g: g } });
    }
    if (kind === 'incl') {
      var lat = R.pick([10, 15, 20, 25, 30, 35, 40, 45, 50, 60]), I = M.atan(2 * M.tan(lat * RAD)) * DEG;
      return P('In a field like a bar magnet\'s (a dipole), the magnetic inclination $I$ (the dip of the field lines below horizontal) and the latitude $\\lambda$ are related by $\\tan I = 2\\tan\\lambda$. What inclination would lava cooling at latitude $' + lat + '^\\circ$ record?', { t: 'num', v: ans(I, 3), tol: 0.5 },
        ['$\\tan I = 2\\tan ' + lat + '^\\circ = 2 \\times ' + fd(M.tan(lat * RAD), 4) + ' = ' + fd(2 * M.tan(lat * RAD), 4) + '$.', '$I = \\tan^{-1}(' + fd(2 * M.tan(lat * RAD), 4) + ') \\approx ' + fd(I, 1) + '^\\circ$.', 'Field lines are flat at the equator ($I = 0^\\circ$) and point straight down at the magnetic poles ($I = 90^\\circ$).'],
        'Find $2\\tan\\lambda$, then take the inverse tangent.', { unit: '°', vf: { k: 'incl', lat: lat } });
    }
    if (kind === 'why') return bankQ(R, [
      ['Why can\'t Earth\'s magnetic field come from a giant permanent magnet in the core?', 'The core is far hotter than the temperature at which magnetic minerals lose their magnetism; the field is made by moving liquid iron in the outer core',
        ['The core is made of rock, not metal', 'Permanent magnets cannot be round', 'The core is too cold for iron to be magnetic'],
        ['Iron-bearing minerals lose their permanent magnetism above the Curie temperature, about 580 °C for magnetite and 770 °C for iron.', 'The core is thousands of degrees hotter than that.', 'Instead, liquid iron flowing in the outer core acts like a dynamo, an electric generator that makes its own magnetic field. That is also why the field can drift and flip.'], 'Compare the core\'s temperature with 580 °C.'],
      ['How does a lava flow record the direction of Earth\'s magnetic field?', 'As it cools below about 580 °C, grains of magnetite line up with the field and are locked in place',
        ['Lightning magnetizes the lava in the direction of the field', 'Iron in the lava flows downhill toward the magnetic pole', 'The lava remembers the field only while it stays hot'],
        ['Above its Curie temperature, magnetite cannot hold a direction.', 'As the lava cools through about 580 °C, each grain\'s magnetism lines up with the field around it, and that direction is frozen in as the rock hardens.', 'Millions of years later, a lab can measure that direction: a compass needle frozen in stone.'], 'Think about what happens as the lava cools through 580 °C.'],
      ['What is a magnetic reversal?', 'A time when Earth\'s field flips, so a compass needle would point south instead of north',
        ['A time when Earth\'s spin reverses direction', 'A time when the continents turn halfway around', 'A time when the North Pole moves to the equator'],
        ['Lava flows of different ages point in two opposite directions: normal (like today) and reversed.', 'Dating them shows the whole field has flipped many times, at irregular intervals; the last flip was about 0.77 million years ago.', 'The planet itself does not turn over; only the field made in the outer core changes direction.'], 'Is it the planet or the field that flips?']
    ], 'why');
    var I2 = R.pick([20, 30, 36, 40, 45, 49, 55, 60, 64]), lat2 = M.atan(M.tan(I2 * RAD) / 2) * DEG;
    if (kind === 'lat') {
      return P('Old lava flows record a magnetic inclination of $' + I2 + '^\\circ$. Using $\\tan I = 2\\tan\\lambda$ for Earth\'s dipole field, at what latitude did the lava cool?', { t: 'num', v: ans(lat2, 3), tol: 0.5 },
        ['Solve for the latitude: $\\tan\\lambda = \\dfrac{\\tan I}{2} = \\dfrac{\\tan ' + I2 + '^\\circ}{2} = \\dfrac{' + fd(M.tan(I2 * RAD), 4) + '}{2} = ' + fd(M.tan(I2 * RAD) / 2, 4) + '$.', '$\\lambda = \\tan^{-1}(' + fd(M.tan(I2 * RAD) / 2, 4) + ') \\approx ' + fd(lat2, 1) + '^\\circ$.', 'This paleolatitude is where the rock was when it cooled, which may be far from where it is today.'],
        'Divide $\\tan I$ by 2, then take the inverse tangent.', { unit: '°', vf: { k: 'lat', I: I2 } });
    }
    var now = M.round(lat2) + R.pick([15, 20, 25, 30]), moved = (now - lat2) * 111;
    return P('Lava flows that are now at latitude $' + now + '^\\circ$ N record an inclination of $' + I2 + '^\\circ$ (pointing down, as in the Northern Hemisphere). Using $\\tan I = 2\\tan\\lambda$, about how many kilometers north has the land moved since the lava cooled? (One degree of latitude is about 111 km.)', num(moved, 2, 0.03),
      ['Paleolatitude: $\\tan\\lambda = \\dfrac{\\tan ' + I2 + '^\\circ}{2} = ' + fd(M.tan(I2 * RAD) / 2, 4) + '$, so $\\lambda \\approx ' + fd(lat2, 1) + '^\\circ$ N.', 'The land moved $' + now + ' - ' + fd(lat2, 1) + ' = ' + fd(now - lat2, 1) + '^\\circ$ north.', 'Distance: $' + fd(now - lat2, 1) + ' \\times 111 \\approx ' + T.commas(M.round(moved)) + '\\,\\text{km}$.'],
      'Find the paleolatitude first, then compare it with today\'s latitude.', { unit: 'km', vf: { k: 'moved', I: I2, now: now } });
  });

// ---- 02_minerals.js
  // =====================================================================================
  // Unit 2: Minerals
  // =====================================================================================

  // ions: [label (TeX), charge, radius in pm (six neighbors; Shannon 1976, rounded)]
  var IONS = { Mg: ['\\text{Mg}^{2+}', 2, 72], Fe: ['\\text{Fe}^{2+}', 2, 78], Ca: ['\\text{Ca}^{2+}', 2, 100], Na: ['\\text{Na}^{+}', 1, 102], K: ['\\text{K}^{+}', 1, 138], Al: ['\\text{Al}^{3+}', 3, 54], Mn: ['\\text{Mn}^{2+}', 2, 83], Ni: ['\\text{Ni}^{2+}', 2, 69] };
  // charge-balance minerals: [name, parts [[symbol TeX, charge, count]], formula text]
  var CB = [
    ['forsterite (olivine)', [['\\text{Mg}^{2+}', 2, 2], ['\\text{Si}^{4+}', 4, 1], ['\\text{O}^{2-}', -2, 4]], 'Mg₂SiO₄'],
    ['enstatite (pyroxene)', [['\\text{Mg}^{2+}', 2, 1], ['\\text{Si}^{4+}', 4, 1], ['\\text{O}^{2-}', -2, 3]], 'MgSiO₃'],
    ['pyrope (garnet)', [['\\text{Mg}^{2+}', 2, 3], ['\\text{Al}^{3+}', 3, 2], ['\\text{Si}^{4+}', 4, 3], ['\\text{O}^{2-}', -2, 12]], 'Mg₃Al₂Si₃O₁₂'],
    ['spinel', [['\\text{Mg}^{2+}', 2, 1], ['\\text{Al}^{3+}', 3, 2], ['\\text{O}^{2-}', -2, 4]], 'MgAl₂O₄'],
    ['hematite', [['\\text{Fe}^{3+}', 3, 2], ['\\text{O}^{2-}', -2, 3]], 'Fe₂O₃'],
    ['orthoclase (K-feldspar)', [['\\text{K}^{+}', 1, 1], ['\\text{Al}^{3+}', 3, 1], ['\\text{Si}^{4+}', 4, 3], ['\\text{O}^{2-}', -2, 8]], 'KAlSi₃O₈'],
    ['anorthite (Ca-feldspar)', [['\\text{Ca}^{2+}', 2, 1], ['\\text{Al}^{3+}', 3, 2], ['\\text{Si}^{4+}', 4, 2], ['\\text{O}^{2-}', -2, 8]], 'CaAl₂Si₂O₈'],
    ['albite (Na-feldspar)', [['\\text{Na}^{+}', 1, 1], ['\\text{Al}^{3+}', 3, 1], ['\\text{Si}^{4+}', 4, 3], ['\\text{O}^{2-}', -2, 8]], 'NaAlSi₃O₈'],
    ['zircon', [['\\text{Zr}^{4+}', 4, 1], ['\\text{Si}^{4+}', 4, 1], ['\\text{O}^{2-}', -2, 4]], 'ZrSiO₄'],
    ['corundum', [['\\text{Al}^{3+}', 3, 2], ['\\text{O}^{2-}', -2, 3]], 'Al₂O₃']
  ];
  // end-member swaps: [start name, start formula (spec), swapped ion, new formula (spec), new name]
  var SWAPS = [
    ['forsterite', 'Mg2SiO4', 'Fe^{2+}', 'Fe2SiO4', 'fayalite', 'Mg^{2+}'], ['forsterite', 'Mg2SiO4', 'Mn^{2+}', 'Mn2SiO4', 'tephroite', 'Mg^{2+}'],
    ['enstatite', 'MgSiO3', 'Fe^{2+}', 'FeSiO3', 'ferrosilite', 'Mg^{2+}'], ['calcite', 'CaCO3', 'Mg^{2+}', 'MgCO3', 'magnesite', 'Ca^{2+}'],
    ['calcite', 'CaCO3', 'Fe^{2+}', 'FeCO3', 'siderite', 'Ca^{2+}'], ['calcite', 'CaCO3', 'Mn^{2+}', 'MnCO3', 'rhodochrosite', 'Ca^{2+}'],
    ['halite', 'NaCl', 'K^{+}', 'KCl', 'sylvite', 'Na^{+}'], ['sphalerite', 'ZnS', 'Fe^{2+}', 'FeS', 'troilite', 'Zn^{2+}']
  ];

  G('geology.crystal-structure', function (R, ctx) {
    var kind = by(ctx, R.pick(['swap', 'fo', 'why']), R.pick(['swap', 'balance', 'fo', 'formula']), R.pick(['balance', 'formula', 'fo', 'coupled']));
    if (kind === 'swap') {
      var host = R.pick(['Mg', 'Mg', 'Ca', 'Fe']), cands = Object.keys(IONS).filter(function (k) { return k !== host; });
      var best = null, bs = 1e9; cands.forEach(function (k) { var d = (IONS[k][1] !== IONS[host][1] ? 1000 : 0) + M.abs(IONS[k][2] - IONS[host][2]); if (d < bs) { bs = d; best = k; } });
      var others = R.sample(cands.filter(function (k) { return k !== best && (IONS[k][1] !== IONS[host][1] || M.abs(IONS[k][2] - IONS[host][2]) >= bs + 15); }), 3);
      var list = R.shuffle([best].concat(others));
      var where = { Mg: 'olivine, $\\text{Mg}_2\\text{SiO}_4$', Ca: 'calcite, $\\text{CaCO}_3$', Fe: 'the iron olivine fayalite, $\\text{Fe}_2\\text{SiO}_4$' }[host];
      return P('Ions can swap places in a crystal when they have about the same size and the same charge. Which ion could most easily take the place of $' + IONS[host][0] + '$ (radius ' + IONS[host][2] + ' pm) in ' + where + '? Radii: ' + list.map(function (k) { return '$' + IONS[k][0] + '$ ' + IONS[k][2] + ' pm'; }).join(', ') + '.',
        mc('$' + IONS[best][0] + '$', others.map(function (k) { return '$' + IONS[k][0] + '$'; })),
        ['Look for the same charge first: a different charge would leave the crystal electrically unbalanced.', 'Among ions with charge ' + IONS[host][1] + '+, pick the closest in size to ' + IONS[host][2] + ' pm.', '$' + IONS[best][0] + '$ (' + IONS[best][2] + ' pm) is within ' + M.abs(IONS[best][2] - IONS[host][2]) + ' pm, so it fits the same spot.'],
        'Same charge first, then the closest size.', { vf: { k: 'swap', host: host, best: best } });
    }
    if (kind === 'fo') {
      var mg = R.pick([1.9, 1.8, 1.7, 1.6, 1.5, 1.4, 1.2, 1.0, 0.8]);
      if (R.coin()) {
        var fe = r2(2 - mg, 2);
        return P('Olivine is $(\\text{Mg},\\text{Fe})_2\\text{SiO}_4$: every formula unit has room for exactly two $2+$ ions, any mix of $\\text{Mg}^{2+}$ and $\\text{Fe}^{2+}$. An olivine crystal has ' + fd(mg, 1) + ' magnesium ions per formula unit. How many iron ions does it have per formula unit?', exact(fe),
          ['The two sites must hold $2$ ions in all, to balance $\\text{SiO}_4^{4-}$: $2 \\times (+2) = +4$.', '$\\text{Fe} = 2 - ' + fd(mg, 1) + ' = ' + fd(fe, 1) + '$.'], 'Magnesium plus iron must add to 2.', { vf: { k: 'fe', mg: mg } });
      }
      var fo = mg / 2 * 100;
      return P('Geologists name an olivine by its forsterite number, Fo = the percent of its $2+$ sites filled by magnesium. An olivine has ' + fd(mg, 1) + ' $\\text{Mg}^{2+}$ and ' + fd(2 - mg, 1) + ' $\\text{Fe}^{2+}$ per formula unit. What is its Fo number?', { t: 'num', v: String(fix(fo)) },
        ['There are $' + fd(mg, 1) + ' + ' + fd(2 - mg, 1) + ' = 2$ sites in all.', 'Fo $= \\dfrac{' + fd(mg, 1) + '}{2} \\times 100 = ' + fd(fo, 1) + '$.', fo >= 88 ? 'Olivine near Fo90 is typical of Earth\'s mantle.' : 'The same mineral, olivine, with a different mix: the formula can vary because the two ions are so alike.'],
        'Divide the magnesium count by the total of 2, then multiply by 100.', { vf: { k: 'fo', mg: mg } });
    }
    if (kind === 'balance') {
      var m = R.pick(CB), parts = m[1], hide = R.int(0, parts.length - 1), h = parts[hide];
      var known = parts.filter(function (_, i) { return i !== hide; }), sum = known.reduce(function (s, q) { return s + q[1] * q[2]; }, 0), n = -sum / h[1];
      return P('In ' + m[0] + ', each formula unit has ' + known.map(function (q) { return q[2] + ' $' + q[0] + '$'; }).join(', ') + ' and some $' + h[0] + '$. A crystal must be electrically neutral. How many $' + h[0] + '$ ions are in each formula unit?', exact(n),
        ['Add up the known charges: ' + known.map(function (q) { return '$' + q[2] + ' \\times (' + (q[1] > 0 ? '+' : '') + q[1] + ')$'; }).join(' + ') + ' $= ' + (sum > 0 ? '+' : '') + sum + '$.', 'The missing ions must bring $' + (-sum > 0 ? '+' : '') + (-sum) + '$, and each carries $' + (h[1] > 0 ? '+' : '') + h[1] + '$.', 'Number: $' + (-sum) + ' \\div ' + h[1] + ' = ' + n + '$. The formula is ' + m[2] + '.'],
        'Positive charges must cancel negative charges.', { vf: { k: 'balance', parts: parts, hide: hide } });
    }
    if (kind === 'formula') {
      var s = R.pick(SWAPS);
      return P('The mineral ' + s[0] + ' is $' + fTex(s[1]) + '$. In the related mineral ' + s[4] + ', every $' + ionTex(s[5]) + '$ is replaced by $' + ionTex(s[2]) + '$. Write the formula of ' + s[4] + '.', { t: 'formula', v: [s[3]] },
        ['The two ions have the same charge, so one simply takes the other\'s place, one for one.', 'Nothing else in the formula changes.', 'So ' + s[4] + ' is ' + s[3].replace(/(\d)/g, function (d) { return '₀₁₂₃₄₅₆₇₈₉'[+d]; }) + '.'],
        'Swap the one ion; keep the rest.', { vf: { k: 'formula', f: s[3] } });
    }
    if (kind === 'coupled') return bankQ(R, [
      ['In plagioclase feldspar, $\\text{Ca}^{2+}$ can replace $\\text{Na}^{+}$ (from albite, $\\text{NaAlSi}_3\\text{O}_8$, to anorthite, $\\text{CaAl}_2\\text{Si}_2\\text{O}_8$). Why does an $\\text{Al}^{3+}$ replace an $\\text{Si}^{4+}$ at the same time?', 'To keep the crystal neutral: the swap adds one positive charge and the other removes one',
        ['Because aluminum ions are the same size as calcium ions', 'Because silicon cannot stay in a crystal with calcium', 'It doesn\'t; the formula changes only by chance'],
        ['$\\text{Ca}^{2+}$ for $\\text{Na}^{+}$ adds $+1$.', '$\\text{Al}^{3+}$ for $\\text{Si}^{4+}$ takes away $+1$.', 'Together the charges still balance. This paired swap is called a coupled substitution, and it lets plagioclase range all the way from albite to anorthite.'], 'Count the change in charge for each swap.'],
      ['Why can olivine have any mix of magnesium and iron, from $\\text{Mg}_2\\text{SiO}_4$ to $\\text{Fe}_2\\text{SiO}_4$?', '$\\text{Mg}^{2+}$ and $\\text{Fe}^{2+}$ have the same charge and nearly the same size, so either fits the same spot',
        ['Olivine is a mixture of two different minerals', 'Iron and magnesium are the same element', 'Olivine has no fixed structure'],
        ['Both ions carry $+2$, and their radii are 72 and 78 pm.', 'The crystal\'s pattern stays the same while the ions in it vary: a solid solution.'], 'Compare their charge and size.']
    ], 'why');
    return bankQ(R, [
      ['Which statement about a mineral\'s chemical formula is true?', 'Many minerals have a formula that can vary within limits, because similar ions can trade places',
        ['Every mineral has one exact formula that never varies', 'A mineral\'s formula changes with its color', 'Only man-made crystals have formulas'],
        ['A mineral has a definite crystal structure and a composition that is fixed or varies within set limits.', 'Olivine, for example, ranges from $\\text{Mg}_2\\text{SiO}_4$ to $\\text{Fe}_2\\text{SiO}_4$.'], 'Think about olivine.'],
      ['What holds the ions of a crystal like halite (NaCl) together?', 'The attraction between positive and negative ions, stacked in a repeating pattern',
        ['Water trapped between the ions', 'Magnetism between the sodium ions', 'Gravity between the atoms'],
        ['Each $\\text{Na}^{+}$ is surrounded by six $\\text{Cl}^{-}$ ions, and each $\\text{Cl}^{-}$ by six $\\text{Na}^{+}$.', 'Opposite charges attract; the pattern repeats in all three directions, which is why halite breaks into cubes.'], 'Opposite charges attract.']
    ], 'why');
  });

  // silicate groups: [formula TeX, Si, O, name]
  var SIG = [['\\text{SiO}_4', 1, 4, 'one isolated tetrahedron'], ['\\text{Si}_2\\text{O}_7', 2, 7, 'a pair of tetrahedra sharing one oxygen'], ['\\text{Si}_3\\text{O}_9', 3, 9, 'a ring of three tetrahedra'],
    ['\\text{Si}_6\\text{O}_{18}', 6, 18, 'a ring of six tetrahedra (as in beryl)'], ['\\text{SiO}_3', 1, 3, 'one link of a single chain'], ['\\text{Si}_4\\text{O}_{11}', 4, 11, 'one repeat of a double chain'], ['\\text{Si}_2\\text{O}_5', 2, 5, 'one repeat of a sheet'], ['\\text{SiO}_2', 1, 2, 'a framework']];
  G('geology.silica-tetrahedron', function (R, ctx) {
    var kind = by(ctx, R.pick(['charge1', 'abund', 'why', 'ring']), R.pick(['charge', 'cations', 'ring', 'abund']), R.pick(['charge', 'shared', 'cations', 'ring']));
    if (kind === 'ring') {
      var nT = R.int(2, 10), ring = nT >= 3 && R.coin(), oN = ring ? 3 * nT : 3 * nT + 1, chg = 4 * nT - 2 * oN, askO = R.coin();
      var desc = ring ? nT + ' silica tetrahedra joined in a closed ring, each sharing two corner oxygens with its neighbors' : nT + ' silica tetrahedra joined end to end in a short open chain, each joined to the next by one shared oxygen';
      return P('Picture ' + desc + '. ' + (askO ? 'How many oxygen atoms does the group have in all?' : 'What is the total charge of the group? (Si is $+4$ and O is $-2$.)'), exact(askO ? oN : chg),
        ['Separate tetrahedra would have $4 \\times ' + nT + ' = ' + 4 * nT + '$ oxygens.', 'Each link shares one oxygen, so it removes one. A ' + (ring ? 'ring of ' + nT + ' has ' + nT + ' links' : 'chain of ' + nT + ' has ' + (nT - 1) + ' link' + (nT > 2 ? 's' : '')) + ': $' + 4 * nT + ' - ' + (ring ? nT : nT - 1) + ' = ' + oN + '$ oxygens.',
          askO ? 'So the group is $\\text{Si}_{' + nT + '}\\text{O}_{' + oN + '}$.' : 'Charge: $' + nT + ' \\times (+4) + ' + oN + ' \\times (-2) = ' + 4 * nT + ' - ' + 2 * oN + ' = ' + chg + '$.'],
        'Start with 4 oxygens per tetrahedron and take away one for each shared corner.', { vf: { k: askO ? 'ringO' : 'ringC', n: nT, ring: ring } });
    }
    if (kind === 'charge1') {
      return P('A silica tetrahedron is one $\\text{Si}^{4+}$ ion bonded to four $\\text{O}^{2-}$ ions. What is its total electric charge?', exact(-4),
        ['Silicon: $+4$.', 'Oxygen: $4 \\times (-2) = -8$.', 'Total: $+4 - 8 = -4$, so it is written $\\text{SiO}_4^{4-}$.'], 'Add the charges of all five ions.', { vf: { k: 'charge', si: 1, o: 4 } });
    }
    if (kind === 'abund') {
      var EL = [['oxygen', 46.6], ['silicon', 27.7], ['aluminum', 8.1], ['iron', 5.0], ['calcium', 3.6], ['sodium', 2.8], ['potassium', 2.6], ['magnesium', 2.1]];
      var pick = [EL[0], EL[1]].concat(R.sample(EL.slice(2), R.int(0, 2))), tot = pick.reduce(function (a, e) { return a + e[1]; }, 0), rest = R.coin();
      var lst = U.list(pick.map(function (e) { return e[1] + '% ' + e[0]; }));
      return P('By mass, Earth\'s crust is about ' + lst + '. What percent of the crust is ' + (rest ? 'made of all the other elements together' : 'made of these ' + pick.length + ' elements together') + '?', pnum(rest ? 100 - tot : tot, 3, 0.005),
        ['Add them: $' + pick.map(function (e) { return e[1]; }).join(' + ') + ' = ' + fd(tot, 1) + '\\%$.', rest ? 'Everything else: $100 - ' + fd(tot, 1) + ' = ' + fd(100 - tot, 1) + '\\%$.' : 'Oxygen and silicon alone are three quarters of the crust, which is why the silicon–oxygen tetrahedron builds most of its minerals.'],
        rest ? 'Add the listed percents and subtract from 100%.' : 'Add the percents.', { vf: { k: rest ? 'rest' : 'abund', vals: pick.map(function (e) { return e[1]; }) } });
    }
    if (kind === 'charge') {
      var g = R.pick(SIG.slice(1)), ch = 4 * g[1] - 2 * g[2];
      return P('Silicate groups carry charge: each $\\text{Si}^{4+}$ adds $+4$ and each $\\text{O}^{2-}$ adds $-2$. What is the charge of the group $' + g[0] + '$ (' + g[3] + ')?', exact(ch),
        ['Silicon: $' + g[1] + ' \\times (+4) = +' + 4 * g[1] + '$.', 'Oxygen: $' + g[2] + ' \\times (-2) = -' + 2 * g[2] + '$.', 'Total: $' + 4 * g[1] + ' - ' + 2 * g[2] + ' = ' + ch + '$.' + (ch === 0 ? ' A framework of shared oxygens is neutral: pure quartz needs no other ions.' : '')],
        'Add +4 for each silicon and −2 for each oxygen.', { vf: { k: 'charge', si: g[1], o: g[2] } });
    }
    if (kind === 'cations') {
      var opts = [['\\text{SiO}_4', 1, 4, 'Mg^{2+}', 2, 'forsterite, $\\text{Mg}_2\\text{SiO}_4$'], ['\\text{SiO}_4', 1, 4, 'Fe^{2+}', 2, 'fayalite, $\\text{Fe}_2\\text{SiO}_4$'], ['\\text{SiO}_3', 1, 3, 'Mg^{2+}', 2, 'enstatite, $\\text{MgSiO}_3$'],
        ['\\text{Si}_2\\text{O}_7', 2, 7, 'Ca^{2+}', 2, 'a calcium silicate, $\\text{Ca}_3\\text{Si}_2\\text{O}_7$'], ['\\text{SiO}_4', 1, 4, 'Zr^{4+}', 4, 'zircon, $\\text{ZrSiO}_4$'], ['\\text{Si}_6\\text{O}_{18}', 6, 18, 'Al^{3+}', 3, 'part of beryl (it also has beryllium)']];
      var c = R.pick(opts.slice(0, 5)), ch2 = 4 * c[1] - 2 * c[2], n = -ch2 / c[4];
      return P('How many $' + ionTex(c[3]) + '$ ions does it take to balance the charge of one $' + c[0] + '$ group?', exact(n),
        ['Charge of the group: $' + c[1] + ' \\times (+4) + ' + c[2] + ' \\times (-2) = ' + ch2 + '$.', 'Each ion brings $+' + c[4] + '$: $' + (-ch2) + ' \\div ' + c[4] + ' = ' + n + '$.', 'That is ' + c[5] + '.'], 'Find the group\'s charge first.', { vf: { k: 'cations', si: c[1], o: c[2], q: c[4] } });
    }
    if (kind === 'shared') {
      var s = R.pick([0, 1, 2, 3, 4]), oPer = 4 - s / 2, chPer = 4 - 2 * oPer;
      var nm = ['isolated tetrahedra (no shared oxygens)', 'pairs of tetrahedra', 'single chains', 'sheets', 'a 3-D framework'][s];
      return P('In silicate minerals, tetrahedra link by sharing oxygens; a shared oxygen belongs half to each tetrahedron. In ' + nm + ', each tetrahedron shares ' + s + ' of its 4 oxygens. What is the charge per silicon?', exact(chPer),
        [s === 0 ? 'Nothing is shared, so each tetrahedron keeps all 4 oxygens.' : 'Oxygens that belong to one tetrahedron: $4 - ' + s + ' \\times \\tfrac{1}{2} = ' + fd(oPer, 1) + '$.', 'Charge per silicon: $+4 + ' + fd(oPer, 1) + ' \\times (-2) = ' + chPer + '$.', 'Each shared oxygen raises the charge by 1, so sharing more oxygens leaves less charge for other ions to balance' + (chPer === 0 ? '; a full framework is neutral.' : '.')],
        'Count each shared oxygen as one half.', { vf: { k: 'shared', s: s } });
    }
    return bankQ(R, [
      ['Why are most minerals in Earth\'s crust silicates?', 'Oxygen and silicon are the two most abundant elements in the crust',
        ['Silicon is the only element that forms crystals', 'Silicates are the only minerals that survive heat', 'Living things make silicates'],
        ['By mass the crust is about 47% oxygen and 28% silicon.', 'Silicon and oxygen bond strongly into the $\\text{SiO}_4$ tetrahedron, so with that much of both, silicates make up over 90% of the crust.'], 'Which elements are most common in the crust?'],
      ['A silica tetrahedron has a charge of $-4$. What does that charge mean for the minerals it builds?', 'Other positive ions, or shared oxygens, must balance it',
        ['The mineral will always be magnetic', 'The tetrahedron must be surrounded by water', 'Silicate minerals carry an electric charge overall'],
        ['A crystal as a whole is neutral.', 'Isolated tetrahedra need positive ions such as $\\text{Mg}^{2+}$ or $\\text{Fe}^{2+}$ around them; sharing oxygens with neighboring tetrahedra lowers the charge, and a full framework (quartz) is neutral.'], 'A whole crystal must be neutral.']
    ], 'why');
  });

  // silicate families: [structure, O per Si, shared, examples, cleavage]
  var FAM = [['isolated tetrahedra', 4, '0', ['olivine', 'garnet'], 'no cleavage'], ['single chains', 3, '2', ['pyroxene (augite)'], 'two cleavages at about 90°'],
    ['double chains', 2.75, '2 or 3', ['amphibole (hornblende)'], 'two cleavages at about 60° and 120°'], ['sheets', 2.5, '3', ['mica (biotite, muscovite)', 'clay minerals'], 'one perfect cleavage into thin sheets'],
    ['3-D frameworks', 2, '4', ['quartz', 'feldspar'], 'quartz: none (it breaks with curved surfaces); feldspar: two cleavages near 90°']];
  var FORMS = [['\\text{Mg}_2\\text{SiO}_4', 'olivine', 1, 4, 0], ['\\text{MgSiO}_3', 'enstatite', 1, 3, 1], ['\\text{CaMgSi}_2\\text{O}_6', 'diopside', 2, 6, 1],
    ['\\text{Ca}_2\\text{Mg}_5\\text{Si}_8\\text{O}_{22}(\\text{OH})_2', 'tremolite', 8, 22, 2], ['\\text{Mg}_3\\text{Si}_4\\text{O}_{10}(\\text{OH})_2', 'talc', 4, 10, 3],
    ['\\text{SiO}_2', 'quartz', 1, 2, 4], ['\\text{KAlSi}_3\\text{O}_8', 'orthoclase', 4, 8, 4]];
  G('geology.silicate-families', function (R, ctx) {
    var kind = by(ctx, R.pick(['family', 'cleave', 'ratio']), R.pick(['family', 'ratio', 'cleave', 'formula']), R.pick(['ratio', 'formula', 'cleave', 'why']));
    if (kind === 'family') {
      var f = R.pick(FAM), ex = R.pick(f[3]);
      return P('Which way are the silica tetrahedra linked in ' + ex + '?', mc(f[0], FAM.filter(function (q) { return q !== f; }).map(function (q) { return q[0]; })),
        [ex.charAt(0).toUpperCase() + ex.slice(1) + ' is built of ' + f[0] + '.', 'Each tetrahedron shares ' + f[2] + ' of its oxygens; that gives ' + fd(f[1], 2) + ' oxygens per silicon.', 'Its cleavage: ' + f[4] + '.'],
        'Olivine: isolated; pyroxene: single chains; amphibole: double chains; mica: sheets; quartz and feldspar: frameworks.', { vf: { k: 'family', f: f[0] } });
    }
    if (kind === 'cleave') {
      var f2 = R.pick(FAM.slice(1, 4).concat([['3-D frameworks', 2, '4', ['quartz'], 'no cleavage at all; it breaks along curved surfaces']])), mn = f2[3][0].replace(/ \(.*\)/, '');
      var cl = f2[0] === '3-D frameworks' ? 'no cleavage at all; it breaks along curved surfaces' : f2[4];
      return P('A mineral sample shows ' + cl + '. Which silicate family most likely fits?', mc(f2[0] + ', such as ' + mn, ['single chains, such as pyroxene', 'double chains, such as amphibole', 'sheets, such as mica', '3-D frameworks, such as quartz'].filter(function (s) { return s.indexOf(f2[0]) !== 0; })),
        ['Cleavage happens along the weakest bonds.', f2[0] === 'sheets' ? 'In mica, strong bonds hold each sheet together, but only weak bonds join the sheets, so it peels apart in one direction.' : f2[0] === 'single chains' ? 'Single chains are strongly bonded along their length and weakly bonded to one another; breaks run between the chains, at about 90°.' : f2[0] === 'double chains' ? 'Double chains are wider, so the breaks between them meet at about 60° and 120°.' : 'In quartz every oxygen is shared, so bonds are equally strong in all directions and there is no weak plane to split along.'],
        'Where are the weak bonds?', { vf: { k: 'cleave', f: f2[0] } });
    }
    if (kind === 'ratio') {
      var f3 = R.pick(FAM);
      return P('How many oxygens are there for each silicon in silicates built of ' + f3[0] + '? (A shared oxygen counts half for each tetrahedron.)', exact(f3[1]),
        ['Each tetrahedron has 4 oxygens and shares ' + f3[2] + ' of them.', f3[0] === 'double chains' ? 'Half the tetrahedra share 2 and half share 3, so on average $2.5$ are shared.' : 'Shared oxygens count half.',
          'Oxygens per silicon $= 4 - \\tfrac{1}{2} \\times ' + (f3[0] === 'double chains' ? '2.5' : f3[2]) + ' = ' + fd(f3[1], 2) + '$.'],
        'Start from 4 and subtract half the number of shared oxygens.', { vf: { k: 'ratio', f: f3[0] } });
    }
    if (kind === 'formula') {
      var fm = R.pick(FORMS), fam = FAM[fm[4]];
      return P('From its formula, $' + fm[0] + '$ (' + fm[1] + '), find the number of oxygens per tetrahedral ion. Count Si, and Al too when it sits in the tetrahedra as in feldspar; count only the oxygens bonded to them, not the OH. Which silicate family is it?',
        mc(fam[0], FAM.filter(function (q) { return q !== fam; }).map(function (q) { return q[0]; })),
        ['Tetrahedral ions : oxygens $= ' + fm[2] + ' : ' + fm[3] + '$, so $' + fd(fm[3] / fm[2], 2) + '$ oxygens each.', 'Ratios: 4 isolated, 3 single chain, 2.75 double chain, 2.5 sheet, 2 framework.', 'So ' + fm[1] + ' is built of ' + fam[0] + '.'],
        'Divide the oxygens by the silicon (plus tetrahedral aluminum).', { vf: { k: 'formula', si: fm[2], o: fm[3], fam: fam[0] } });
    }
    return bankQ(R, [
      ['Mica peels into thin sheets, but quartz has no cleavage at all. Why?', 'Mica\'s tetrahedra are linked in sheets held together by weak bonds; in quartz every oxygen is shared, so bonds are strong in all directions',
        ['Mica is softer because it contains more water', 'Quartz grows too fast to form planes', 'Mica crystals are always larger than quartz crystals'],
        ['Cleavage follows the weakest bonds in a crystal.', 'In mica, the sheets are strong but the bonds between them (through potassium ions) are weak.', 'In quartz, a 3-D framework of shared oxygens leaves no weak direction, so it breaks along curved surfaces (conchoidal fracture).'], 'Where are the weak bonds in each?'],
      ['Why do pyroxene and amphibole have different cleavage angles?', 'Single chains (pyroxene) are narrower than double chains (amphibole), so the planes between them meet at about 90° in one and 60°/120° in the other',
        ['Amphibole contains iron and pyroxene does not', 'Pyroxene forms only underwater', 'Their cleavage depends on the crystal\'s color'],
        ['Both break between their chains, where the bonds are weakest.', 'The chains\' widths set the angles: about 90° for single chains, about 60° and 120° for double chains.'], 'Picture the chains end-on.']
    ], 'why');
  });

  // non-silicate groups: [name, formula TeX, group]
  var NONSIL = [['calcite', '\\text{CaCO}_3', 'carbonate'], ['dolomite', '\\text{CaMg(CO}_3)_2', 'carbonate'], ['malachite', '\\text{Cu}_2\\text{CO}_3(\\text{OH})_2', 'carbonate'],
    ['hematite', '\\text{Fe}_2\\text{O}_3', 'oxide'], ['magnetite', '\\text{Fe}_3\\text{O}_4', 'oxide'], ['corundum', '\\text{Al}_2\\text{O}_3', 'oxide'],
    ['pyrite', '\\text{FeS}_2', 'sulfide'], ['galena', '\\text{PbS}', 'sulfide'], ['sphalerite', '\\text{ZnS}', 'sulfide'], ['chalcopyrite', '\\text{CuFeS}_2', 'sulfide'],
    ['gypsum', '\\text{CaSO}_4 \\cdot 2\\text{H}_2\\text{O}', 'sulfate'], ['anhydrite', '\\text{CaSO}_4', 'sulfate'], ['barite', '\\text{BaSO}_4', 'sulfate'],
    ['halite', '\\text{NaCl}', 'halide'], ['fluorite', '\\text{CaF}_2', 'halide'], ['sylvite', '\\text{KCl}', 'halide'],
    ['gold', '\\text{Au}', 'native element'], ['copper', '\\text{Cu}', 'native element'], ['graphite', '\\text{C}', 'native element']];
  var GROUPS = ['carbonate', 'oxide', 'sulfide', 'sulfate', 'halide', 'native element'];
  var ANION = { carbonate: 'the carbonate ion, $\\text{CO}_3^{2-}$', oxide: 'oxygen alone, $\\text{O}^{2-}$ (no silicon)', sulfide: 'sulfur with no oxygen, $\\text{S}^{2-}$ or $\\text{S}_2^{2-}$', sulfate: 'the sulfate ion, $\\text{SO}_4^{2-}$ (sulfur plus oxygen)', halide: 'a halogen ion such as $\\text{Cl}^{-}$ or $\\text{F}^{-}$', 'native element': 'a single element, not a compound' };
  // ion pairs for writing formulas: [mineral, cation TeX, cation charge, anion TeX, anion charge, formula spec]
  var PAIRS = [['halite', 'Na^{+}', 1, 'Cl^{-}', 1, 'NaCl'], ['sylvite', 'K^{+}', 1, 'Cl^{-}', 1, 'KCl'], ['fluorite', 'Ca^{2+}', 2, 'F^{-}', 1, 'CaF2'], ['galena', 'Pb^{2+}', 2, 'S^{2-}', 2, 'PbS'],
    ['hematite', 'Fe^{3+}', 3, 'O^{2-}', 2, 'Fe2O3'], ['corundum', 'Al^{3+}', 3, 'O^{2-}', 2, 'Al2O3'], ['barite', 'Ba^{2+}', 2, 'SO_4^{2-}', 2, 'BaSO4'], ['calcite', 'Ca^{2+}', 2, 'CO_3^{2-}', 2, 'CaCO3'],
    ['anhydrite', 'Ca^{2+}', 2, 'SO_4^{2-}', 2, 'CaSO4'], ['periclase', 'Mg^{2+}', 2, 'O^{2-}', 2, 'MgO'], ['cuprite', 'Cu^{+}', 1, 'O^{2-}', 2, 'Cu2O'], ['acanthite', 'Ag^{+}', 1, 'S^{2-}', 2, 'Ag2S']];
  function ionTex(s) { var m = /^(.*?)(\^\{.*\})?$/.exec(s), t = '\\text{' + m[1].replace(/_(\d+)/g, '}_{$1}\\text{') + '}'; return t.replace(/\\text\{\}/g, '') + (m[2] || ''); }
  function fTex(f) { return ('\\text{' + f.replace(/(\d+)/g, '}_{$1}\\text{') + '}').replace(/\\text\{\}/g, ''); }
  G('geology.nonsilicates', function (R, ctx) {
    var kind = by(ctx, R.pick(['group', 'group', 'which']), R.pick(['group', 'which', 'formula']), R.pick(['which', 'formula', 'sulf']));
    if (kind === 'group') {
      var m = R.pick(NONSIL);
      return P('The mineral ' + m[0] + ' is $' + m[1] + '$. Which mineral group does it belong to?', mc(m[2], wrongs(R, GROUPS, 3, m[2])),
        ['Minerals are grouped by their negative ion (anion).', m[0].charAt(0).toUpperCase() + m[0].slice(1) + ' contains ' + ANION[m[2]] + '.', 'So it is a' + (/^[aeio]/.test(m[2]) ? 'n ' : ' ') + m[2] + (m[2] === 'native element' ? '' : ' mineral') + '.'],
        'Look at the negative part of the formula.', { vf: { k: 'group', m: m[0] } });
    }
    if (kind === 'which' || kind === 'sulf') {
      var grp = kind === 'sulf' ? R.pick(['sulfide', 'sulfate']) : R.pick(GROUPS), right = R.pick(NONSIL.filter(function (q) { return q[2] === grp; }));
      var pool = NONSIL.filter(function (q) { return q[2] !== grp; }); if (kind === 'sulf') pool = pool.filter(function (q) { return q[2] === (grp === 'sulfide' ? 'sulfate' : 'sulfide'); }).concat(R.sample(pool.filter(function (q) { return q[2] !== 'sulfide' && q[2] !== 'sulfate'; }), 2));
      var wr = R.sample(pool, 3);
      return P('Which of these minerals is a' + (/^[aeio]/.test(grp) ? 'n ' : ' ') + grp + '?', mc(right[0] + ', $' + right[1] + '$', wr.map(function (q) { return q[0] + ', $' + q[1] + '$'; })),
        ['A' + (/^[aeio]/.test(grp) ? 'n ' : ' ') + grp + ' contains ' + ANION[grp] + '.', right[0].charAt(0).toUpperCase() + right[0].slice(1) + ', $' + right[1] + '$, fits.', kind === 'sulf' ? 'Sulfides have sulfur and no oxygen; sulfates carry $\\text{SO}_4$, sulfur with four oxygens. The letters "-ide" mean the bare element, "-ate" mean it comes with oxygen.' : 'The others belong to the ' + U.list(wr.map(function (q) { return q[2] + ' group'; })) + '.'],
        'Look at each formula\'s negative ion.', { vf: { k: 'which', grp: grp } });
    }
    var pr = R.pick(PAIRS), g = U.gcd(pr[2], pr[4]), nc = pr[4] / g, na = pr[2] / g;
    return P('The mineral ' + pr[0] + ' is made of $' + ionTex(pr[1]) + '$ and $' + ionTex(pr[3]) + '$ ions. Write its formula.', { t: 'formula', v: [pr[5]] },
      ['The charges must cancel: ' + nc + ' × (+' + pr[2] + ') = ' + na + ' × (−' + pr[4] + ').', 'So the formula has ' + nc + ' of the positive ion for every ' + na + ' of the negative ion: ' + pr[5].replace(/(\d)/g, function (d) { return '₀₁₂₃₄₅₆₇₈₉'[+d]; }) + '.'],
      'Find the smallest numbers that make the charges cancel.', { vf: { k: 'formula', f: pr[5], c: pr[2], a: pr[4] } });
  });

// ---- 03_igneous.js
  // =====================================================================================
  // Unit 3: Igneous Rocks and Volcanoes
  // =====================================================================================

  G('geology.melting', function (R, ctx) {
    var kind = by(ctx, R.pick(['process', 'process', 'wet', 'why']), R.pick(['process', 'depth', 'wet', 'why']), R.pick(['depth', 'depth', 'wet', 'process']));
    if (kind === 'process') {
      var S = [['under a mid-ocean ridge, where plates pull apart and hot mantle rises to fill the gap', 'Pressure drops as the rock rises (decompression melting)'],
        ['under a hot spot such as Hawaiʻi, where a plume of hot mantle rises', 'Pressure drops as the rock rises (decompression melting)'],
        ['under a continental rift, where the plate is stretched thin', 'Pressure drops as the rock rises (decompression melting)'],
        ['in the mantle wedge above a sinking ocean plate at a subduction zone', 'Water released from the sinking plate lowers the melting point (flux melting)'],
        ['in the lower continental crust, next to a large body of hot basalt magma that has risen from below', 'Heat from the magma warms the crust past its melting point (heat transfer melting)']];
      var s = R.pick(S);
      return P('What mainly makes rock melt ' + s[0] + '?', mc(s[1], ['Pressure drops as the rock rises (decompression melting)', 'Water released from the sinking plate lowers the melting point (flux melting)', 'Heat from the magma warms the crust past its melting point (heat transfer melting)', 'Friction between the plates heats the rock until it melts'].filter(function (x) { return x !== s[1]; })),
        [s[1].indexOf('decompression') >= 0 ? 'Rising mantle stays nearly as hot as it was, but the pressure on it drops, and lower pressure means a lower melting point. Only a few percent of the rock melts.' : s[1].indexOf('flux') >= 0 ? 'The sinking plate carries water in its minerals. As it heats up, the water escapes into the hot mantle above, and wet rock melts at a much lower temperature than dry rock.' : 'Basalt magma at about 1,200 °C is hotter than the melting point of much continental crust (about 650 to 850 °C for granite with some water), so the crust around it partly melts.',
          'Friction is far too small to melt rock in bulk.'], 'Ask what changes for the rock: its pressure, its water, or the heat around it.', { vf: { k: 'process' } });
    }
    if (kind === 'depth') {
      var Tp = R.pick([1300, 1350, 1400, 1450]), a = R.pick([0.4, 0.5]), T0 = R.pick([1100, 1120, 1150]), b = R.pick([3, 3.5, 4]), z = (Tp - T0) / (b - a);
      var where = Tp >= 1450 ? 'in a hot mantle plume' : 'under a mid-ocean ridge';
      return P('Rock rising ' + where + ' cools only slightly as it rises: at depth $z$ (km) its temperature is about $T = ' + Tp + ' + ' + fd(a, 1) + 'z$ °C. Its melting point falls with the pressure: $T_m = ' + T0 + ' + ' + fd(b, 1) + 'z$ °C. At what depth does the rising rock start to melt?', num(z, 3, 0.01),
        ['Melting starts where the rock\'s temperature reaches its melting point: $' + Tp + ' + ' + fd(a, 1) + 'z = ' + T0 + ' + ' + fd(b, 1) + 'z$.', 'Collect terms: $' + (Tp - T0) + ' = ' + fd(b - a, 1) + 'z$.', '$z = ' + (Tp - T0) + ' \\div ' + fd(b - a, 1) + ' \\approx ' + fd(z, 1) + '\\,\\text{km}$. Above that depth the rock is hotter than its melting point and partly melts, with no heat added at all.'],
        'Set the two temperatures equal and solve for z.', { unit: 'km', vf: { k: 'depth', Tp: Tp, a: a, T0: T0, b: b } });
    }
    if (kind === 'wet') {
      var Tr = R.pick([950, 1000, 1050, 1100, 1150, 1250, 1300]), Td = R.pick([1200, 1250, 1300]), Tw = R.pick([800, 850, 900]);
      var dry = Tr >= Td, wet = Tr >= Tw, right = dry ? 'It melts whether it is dry or wet' : wet ? 'It melts only if water is added' : 'It does not melt, dry or wet';
      return P('Mantle rock at 100 km depth is at ' + T.commas(Tr) + ' °C. There, dry rock starts to melt at about ' + T.commas(Td) + ' °C, but rock with water in it starts to melt at about ' + Tw + ' °C. What happens?', mc(right, ['It melts whether it is dry or wet', 'It melts only if water is added', 'It does not melt, dry or wet', 'It melts only if it is dry'].filter(function (x) { return x !== right; })),
        ['Dry: ' + T.commas(Tr) + ' °C is ' + (dry ? 'at or above' : 'below') + ' ' + T.commas(Td) + ' °C, so dry rock ' + (dry ? 'melts' : 'stays solid') + '.', 'Wet: ' + T.commas(Tr) + ' °C is ' + (wet ? 'above' : 'below') + ' ' + Tw + ' °C, so wet rock ' + (wet ? 'melts' : 'stays solid') + '.', 'Water lowers the melting point by hundreds of degrees; that is how subduction zones make magma without extra heat.'],
        'Compare the rock\'s temperature with each melting point.', { vf: { k: 'wet', Tr: Tr, Td: Td, Tw: Tw } });
    }
    return bankQ(R, [
      ['Under a mid-ocean ridge the mantle melts, yet no extra heat is added. How?', 'The rock rises and the pressure on it drops, which lowers its melting point',
        ['Friction between the separating plates heats it', 'Seawater soaks down and boils the rock', 'The core sends extra heat to every ridge'],
        ['Pressure squeezes atoms together and makes melting harder.', 'As hot mantle rises to fill the gap between the plates, it keeps most of its heat but the pressure falls, so it crosses its melting point: decompression melting.'], 'What changes as rock rises?'],
      ['A student says, "Magma forms when rock gets hotter." What is missing?', 'Most magma forms when pressure drops or water is added, without the rock heating up',
        ['Nothing; heating is the only way', 'Magma forms only from melted ice', 'Magma comes from the liquid outer core'],
        ['Under ridges and hot spots, rock melts because it rises and the pressure drops.', 'At subduction zones, water from the sinking plate lowers the melting point of the mantle above.', 'Heating does melt crust next to hot magma, but it is not the main way magma forms.'], 'Think of ridges and subduction zones.']
    ], 'why');
  });

  var BOW = [['olivine', 1], ['pyroxene', 2], ['amphibole', 3], ['biotite mica', 4], ['potassium feldspar', 5], ['muscovite mica', 6], ['quartz', 7]];
  G('geology.bowen-series', function (R, ctx) {
    var kind = by(ctx, R.pick(['first', 'last', 'plag', 'why']), R.pick(['first', 'order', 'last', 'melt']), R.pick(['order', 'mass', 'mass', 'melt']));
    if (kind === 'first' || kind === 'last') {
      var set = R.sample(BOW, 4), sorted = set.slice().sort(function (a, b) { return a[1] - b[1]; }), pick = kind === 'first' ? sorted[0] : sorted[3];
      return P('A magma cools slowly. Of these minerals, which crystallizes ' + (kind === 'first' ? 'first, at the highest temperature' : 'last, at the lowest temperature') + '? ' + U.list(set.map(function (q) { return q[0]; })) + '.', mc(pick[0], set.filter(function (q) { return q !== pick; }).map(function (q) { return q[0]; })),
        ['Bowen\'s reaction series, from hot to cool: olivine, pyroxene, amphibole, biotite mica, then potassium feldspar, muscovite mica and quartz last (with plagioclase changing from calcium-rich to sodium-rich alongside).', 'Here the order is ' + sorted.map(function (q) { return q[0]; }).join(', ') + '.', 'So ' + pick[0] + ' crystallizes ' + (kind === 'first' ? 'first' : 'last') + '.'],
        'Dark, iron- and magnesium-rich minerals come first; quartz comes last.', { vf: { k: kind, set: set.map(function (q) { return q[0]; }), ans: pick[0] } });
    }
    if (kind === 'plag') return P('Plagioclase feldspar changes its makeup as a magma cools. Which kind of plagioclase crystallizes first, at the highest temperature?', mc('Calcium-rich plagioclase', ['Sodium-rich plagioclase', 'Potassium-rich feldspar', 'Both kinds at the same time']),
      ['Plagioclase forms a continuous series from calcium-rich (anorthite) to sodium-rich (albite).', 'Calcium-rich plagioclase crystallizes at the higher temperature; as the magma cools, crystals that keep reacting with the melt become richer in sodium.'], 'It is the branch that changes smoothly from one end member to the other.', { vf: { k: 'plag' } });
    if (kind === 'order') {
      var set2 = R.sample(BOW, 4), lets = R.shuffle(['A', 'B', 'C', 'D']).slice(0, 4), lab = set2.map(function (q, i) { return { L: LET[i], n: q[0], r: q[1] }; });
      var ord = lab.slice().sort(function (a, b) { return a.r - b.r; });
      return P('Put these minerals in the order they crystallize from a cooling magma, first to last. Type the letters (for example, B D A C). ' + lab.map(function (q) { return q.L + ': ' + q.n; }).join('; ') + '.', order(ord.map(function (q) { return q.L; })),
        ['Bowen\'s series from hot to cool: olivine, pyroxene, amphibole, biotite mica, potassium feldspar, muscovite mica, quartz.', 'So: ' + ord.map(function (q) { return q.n + ' (' + q.L + ')'; }).join(', ') + '.'],
        'Olivine is first and quartz is last.', { vf: { k: 'order', lab: lab } });
    }
    if (kind === 'mass') {
      var C0 = R.int(48, 54), f = R.pick([0.2, 0.3, 0.4, 0.5]), Cs = R.int(40, 45), Cl = (C0 - f * Cs) / (1 - f);
      return P('A magma is ' + C0 + '% silica (SiO₂) by mass. As it cools, ' + fd(f * 100, 0) + '% of it crystallizes as olivine and calcium-rich plagioclase, which together are ' + Cs + '% silica, and these crystals settle out. What percent silica is the melt that is left?', pnum(Cl, 3, 0.01),
        ['Take 100 g of magma: it holds $' + C0 + '\\,\\text{g}$ of silica.', 'The ' + fd(f * 100, 0) + ' g of crystals take $' + fd(f * 100, 0) + ' \\times ' + fd(Cs / 100, 2) + ' = ' + fd(f * Cs, 1) + '\\,\\text{g}$ of it.', 'Left: $' + C0 + ' - ' + fd(f * Cs, 1) + ' = ' + fd(C0 - f * Cs, 1) + '\\,\\text{g}$ of silica in $' + fd(100 - f * 100, 0) + '\\,\\text{g}$ of melt.', 'Silica in the melt: $\\dfrac{' + fd(C0 - f * Cs, 1) + '}{' + fd(100 - f * 100, 0) + '} = ' + fd(Cl, 1) + '\\%$. Removing silica-poor crystals leaves a melt richer in silica.'],
        'Use 100 g of magma and keep track of the grams of silica.', { vf: { k: 'mass', C0: C0, f: f, Cs: Cs } });
    }
    if (kind === 'melt') return bankQ(R, [
      ['As olivine and pyroxene crystallize from a magma and sink, how does the leftover melt change?', 'It becomes richer in silica and poorer in iron and magnesium',
        ['It becomes richer in iron and magnesium', 'It stays exactly the same', 'It turns into water'],
        ['Olivine and pyroxene are rich in iron and magnesium and poor in silica (about 40 to 50%).', 'Taking them out removes iron and magnesium and leaves the silica behind, so the remaining melt moves toward andesite and then rhyolite composition.'], 'What do the first minerals take out of the melt?'],
      ['Does a magma crystallize all its minerals at once?', 'No; different minerals crystallize over a range of temperatures as it cools',
        ['Yes, the moment it reaches its freezing point', 'Yes, but only if it cools slowly', 'No; it forms only one mineral'],
        ['A magma is a mixture, not a pure substance, so it freezes over a range of a few hundred degrees.', 'Olivine and calcium-rich plagioclase start first (about 1,200 °C), quartz last (about 700 °C or below).'], 'A mixture freezes over a range.']
    ], 'melt');
    return bankQ(R, [
      ['In Bowen\'s reaction series, which mineral is usually the last to crystallize?', 'Quartz', ['Olivine', 'Pyroxene', 'Calcium-rich plagioclase'],
        ['Quartz is pure silica. It forms from the last, coolest, silica-rich melt, after the other minerals have taken what they need.'], 'Think of the coolest, most silica-rich melt.'],
      ['Why do granites contain quartz but rarely olivine?', 'Granite forms from cool, silica-rich melt, which crystallizes the minerals at the cool end of Bowen\'s series',
        ['Olivine dissolves in granite after it forms', 'Quartz is heavier, so it sinks into granite', 'Granite forms only at the surface'],
        ['Olivine crystallizes from hot, silica-poor (mafic) melts.', 'Granite\'s melt is felsic and cool; it crystallizes feldspar, mica and quartz, from the bottom of the series.'], 'Which end of the series matches a felsic melt?']
    ], 'why');
  });

  var MCLASS = [['ultramafic', 38, 43], ['mafic', 46, 51], ['intermediate', 54, 61], ['felsic', 66, 76]];
  G('geology.magma-composition', function (R, ctx) {
    var kind = by(ctx, R.pick(['classify', 'props', 'why']), R.pick(['classify', 'mix', 'props', 'why']), R.pick(['mix', 'mix', 'props', 'classify']));
    if (kind === 'classify') {
      var c = R.pick(MCLASS), si = R.int(c[1], c[2]);
      return P('A magma is ' + si + '% silica (SiO₂) by mass. How do geologists classify it? (Ultramafic below 45%, mafic 45 to 52%, intermediate 52 to 63%, felsic above 63%.)', mc(c[0], MCLASS.filter(function (q) { return q !== c; }).map(function (q) { return q[0]; })),
        [si + '% falls in the ' + c[0] + ' range.', { ultramafic: 'Ultramafic rock (peridotite) makes up the mantle; it rarely melts completely.', mafic: 'Mafic magma makes basalt and gabbro: dark, rich in iron and magnesium, hot and runny.', intermediate: 'Intermediate magma makes andesite and diorite, common at subduction zones.', felsic: 'Felsic magma makes rhyolite and granite: light-colored, rich in silica, cooler and sticky.' }[c[0]]],
        'Compare the silica percent with the ranges.', { vf: { k: 'classify', si: si } });
    }
    if (kind === 'mix') {
      var b = R.int(48, 51), r = R.int(70, 75), p1 = R.int(1, 4), p2 = R.int(1, 3), avg = (p1 * b + p2 * r) / (p1 + p2);
      return P('Two magmas mix completely in a magma chamber: ' + p1 + ' part' + (p1 > 1 ? 's' : '') + ' of basalt magma (' + b + '% silica) and ' + p2 + ' part' + (p2 > 1 ? 's' : '') + ' of rhyolite magma (' + r + '% silica), by mass. What percent silica is the mixture?', pnum(avg, 3, 0.005),
        ['The mixture\'s silica is a weighted average: $\\dfrac{' + p1 + ' \\times ' + b + ' + ' + p2 + ' \\times ' + r + '}{' + p1 + ' + ' + p2 + '}$.', '$= \\dfrac{' + (p1 * b) + ' + ' + (p2 * r) + '}{' + (p1 + p2) + '} = ' + fd(avg, 1) + '\\%$.', 'That is ' + (avg < 52 ? 'mafic' : avg <= 63 ? 'intermediate' : 'felsic') + '. Mixing is one way intermediate magmas such as andesite can form.'],
        'Weight each magma\'s silica by how much of it there is.', { vf: { k: 'mix', b: b, r: r, p1: p1, p2: p2 } });
    }
    if (kind === 'props') return bankQ(R, [
      ['Compared with basalt magma, rhyolite magma is…', 'cooler, richer in silica and far more viscous', ['hotter, poorer in silica and runnier', 'hotter and more viscous', 'about the same in every way'],
        ['Rhyolite magma is about 70 to 77% silica and erupts at roughly 650 to 800 °C; basalt is about 45 to 52% silica at about 1,000 to 1,200 °C.', 'Silica links into chains and networks in the melt, so felsic magma is thousands of times stickier.'], 'More silica means more linked tetrahedra in the melt.'],
      ['Which magma erupts at the highest temperature?', 'Basalt (mafic)', ['Andesite (intermediate)', 'Rhyolite (felsic)', 'All magmas erupt at the same temperature'],
        ['Mafic magma erupts at about 1,000 to 1,200 °C, intermediate around 800 to 1,000 °C, felsic about 650 to 800 °C.', 'Mafic minerals crystallize at high temperatures, so a mafic melt must be hot to stay liquid.'], 'Look at the top of Bowen\'s series.'],
      ['Why is silica-rich magma so viscous (sticky)?', 'Silica tetrahedra link into chains and networks even in the melt, tying the liquid together',
        ['It contains more iron, which is heavy', 'It is hotter than other magmas', 'It contains no gas'],
        ['In a melt, tetrahedra can still share oxygens and link up.', 'The more silica, the more links, and the harder the liquid is to stir: rhyolite can be millions of times more viscous than basalt.'], 'Think of the tetrahedra in the melt.'],
      ['Which magma is darkest in color when it cools, and why?', 'Mafic, because it is rich in dark iron- and magnesium-bearing minerals',
        ['Felsic, because it has the most silica', 'Felsic, because it cools fastest', 'Intermediate, because it is a mixture'],
        ['Mafic rock (basalt, gabbro) is full of pyroxene, olivine and calcium-rich plagioclase: dark minerals.', 'Felsic rock (granite, rhyolite) is mostly light quartz and feldspar.'], 'Which minerals are dark?']
    ], 'props');
    return bankQ(R, [
      ['Basalt lava at Kīlauea is hotter than the rhyolite magma that fed some of the largest explosive eruptions. Which magma tends to erupt more explosively?', 'The cooler, silica-rich magma, because its stickiness traps gas until it bursts out',
        ['The hotter basalt, because hotter means more violent', 'Both equally; temperature and composition do not matter', 'Neither magma can explode'],
        ['Explosiveness depends mostly on viscosity and gas, not on temperature.', 'Runny basalt lets gas bubbles escape gently, so it pours out as lava.', 'Sticky, silica-rich magma traps the gas; when the pressure is released, the gas expands violently and shreds the magma into ash.'], 'Which can let its gas escape?']
    ], 'why');
  });

  // igneous rocks: [name, composition, texture]
  var IGN = [['granite', 'felsic', 'coarse'], ['rhyolite', 'felsic', 'fine'], ['obsidian', 'felsic', 'glassy'], ['pumice', 'felsic', 'frothy'],
    ['diorite', 'intermediate', 'coarse'], ['andesite', 'intermediate', 'fine'], ['gabbro', 'mafic', 'coarse'], ['basalt', 'mafic', 'fine'], ['scoria', 'mafic', 'vesicular'], ['peridotite', 'ultramafic', 'coarse']];
  var TEXD = { coarse: 'coarse-grained: interlocking crystals large enough to see', fine: 'fine-grained: crystals too small to see without a magnifier', glassy: 'glassy, with no crystals and curved, shell-like breaks', frothy: 'full of tiny gas holes, so light that it can float on water', vesicular: 'full of large gas holes (vesicles)' };
  var COMPD = { felsic: 'mostly light minerals: quartz and potassium feldspar, with a little mica', intermediate: 'about half light plagioclase and half dark amphibole, a salt-and-pepper look', mafic: 'mostly dark minerals: pyroxene and calcium-rich plagioclase', ultramafic: 'almost all green olivine, with some pyroxene' };
  G('geology.igneous-classification', function (R, ctx) {
    var kind = by(ctx, R.pick(['name', 'texture', 'pair']), R.pick(['name', 'sample', 'pair', 'texture']), R.pick(['sample', 'name', 'porph', 'pair']));
    if (kind === 'name' || kind === 'sample') {
      var pool = kind === 'sample' ? IGN : IGN.filter(function (q) { return q[2] === 'coarse' || q[2] === 'fine'; }), r = R.pick(pool);
      var same = IGN.filter(function (q) { return q !== r && (q[1] === r[1] || q[2] === r[2]); }).map(function (q) { return q[0]; });
      var desc = r[0] === 'obsidian' ? 'It is ' + TEXD[r[2]] + '. It looks black, yet its chemistry is felsic (rich in silica).' : r[0] === 'pumice' ? 'It is pale and ' + TEXD[r[2]] + '; its chemistry is felsic (rich in silica).' : 'It is ' + TEXD[r[2]] + ', made of ' + COMPD[r[1]] + '.';
      return P((kind === 'sample' ? 'Name this igneous rock. ' : 'An igneous rock is described. ') + desc + (kind === 'sample' ? '' : ' What is it?'), mc(r[0], R.sample(same, M.min(3, same.length)).concat(same.length < 3 ? R.sample(IGN.filter(function (q) { return q !== r && same.indexOf(q[0]) < 0; }).map(function (q) { return q[0]; }), 3 - same.length) : [])),
        ['Texture tells how it cooled: ' + { coarse: 'slowly, deep underground', fine: 'quickly, at or near the surface', glassy: 'so fast that no crystals formed', frothy: 'fast, while gas was frothing out', vesicular: 'quickly, with gas bubbles trapped' }[r[2]] + '.', 'Composition: ' + r[1] + '.', r[1] + ' + ' + r[2] + ' = ' + r[0] + '.'],
        'Use texture for where it cooled and composition for which magma.', kind === 'sample' ? { viz: { name: 'es-rock-key', opts: { sample: r[0], quiet: true, lock: true } }, vf: { k: 'name', r: r[0] } } : { vf: { k: 'name', r: r[0] } });
    }
    if (kind === 'texture') {
      var t = R.pick([['coarse-grained (large crystals)', 'Slowly, deep underground (intrusive)'], ['fine-grained (tiny crystals)', 'Quickly, at or near the surface (extrusive)'], ['glassy (no crystals)', 'Almost instantly, such as lava quenched in water or air'], ['porphyritic (large crystals in a fine-grained background)', 'Slowly at first underground, then quickly after erupting']]);
      return P('An igneous rock is ' + t[0] + '. How did its magma cool?', mc(t[1], ['Slowly, deep underground (intrusive)', 'Quickly, at or near the surface (extrusive)', 'Almost instantly, such as lava quenched in water or air', 'Slowly at first underground, then quickly after erupting'].filter(function (x) { return x !== t[1]; })),
        ['Crystals need time to grow: atoms must move through the melt to join them.', 'Slow cooling gives few, large crystals; fast cooling gives many tiny ones; very fast cooling freezes the liquid as glass.', 'So a rock that is ' + t[0] + ' cooled: ' + t[1].charAt(0).toLowerCase() + t[1].slice(1) + '.'],
        'Bigger crystals need more time.', { vf: { k: 'texture' } });
    }
    if (kind === 'porph') {
      var pc = R.pick([['felsic', 'rhyolite'], ['intermediate', 'andesite'], ['mafic', 'basalt']]);
      return P('A rock has large, well-formed crystals scattered in a fine-grained background. Its overall composition is ' + pc[0] + '. What is the best name?', mc('Porphyritic ' + pc[1], ['Porphyritic ' + ['rhyolite', 'andesite', 'basalt'].filter(function (x) { return x !== pc[1]; })[0], { rhyolite: 'Granite', andesite: 'Diorite', basalt: 'Gabbro' }[pc[1]], 'Obsidian']),
        ['Big crystals in a fine background is a porphyritic texture: the large crystals grew slowly underground, then the magma erupted and the rest cooled fast.', 'The background is fine-grained, so the rock is named for its volcanic (extrusive) cousin.', 'A ' + pc[0] + ' composition makes it porphyritic ' + pc[1] + '.'],
        'Name the fine-grained background, then add "porphyritic".', { viz: { name: 'es-rock-key', opts: { sample: 'porphyritic ' + pc[1], quiet: true, lock: true } }, vf: { k: 'porph' } });
    }
    var pr = R.pick([['granite', 'rhyolite', 'cooled quickly at the surface'], ['rhyolite', 'granite', 'cooled slowly deep underground'], ['gabbro', 'basalt', 'cooled quickly at the surface'], ['basalt', 'gabbro', 'cooled slowly deep underground'], ['diorite', 'andesite', 'cooled quickly at the surface'], ['andesite', 'diorite', 'cooled slowly deep underground']]);
    var others = IGN.filter(function (q) { return q[0] !== pr[1] && q[0] !== pr[0] && (q[2] === 'coarse' || q[2] === 'fine'); }).map(function (q) { return q[0]; });
    return P('Which rock has the same composition as ' + pr[0] + ' but ' + pr[2] + '?', mc(pr[1], R.sample(others, 3)),
      ['Same magma, different cooling: the composition stays, the crystal size changes.', pr[0].charAt(0).toUpperCase() + pr[0].slice(1) + ' and ' + pr[1] + ' are a pair: one coarse-grained (intrusive), one fine-grained (extrusive).'],
      'Granite–rhyolite, diorite–andesite, gabbro–basalt.', { vf: { k: 'pair', a: pr[0], b: pr[1] } });
  });

  G('geology.intrusions', function (R, ctx) {
    var kind = by(ctx, R.pick(['shape', 'shape', 'sill']), R.pick(['shape', 'sill', 'size']), R.pick(['sill', 'size', 'age']));
    if (kind === 'shape') {
      var S = [['a sheet of igneous rock that cuts straight across the sedimentary layers', 'Dike'], ['a sheet of igneous rock that slipped in between two sedimentary layers, parallel to them', 'Sill'],
        ['a body of granite exposed over more than 100 square kilometers, the root of an old mountain range', 'Batholith'], ['an intrusion that pushed the layers above it up into a dome, with a flat floor', 'Laccolith'],
        ['a steep column of hard igneous rock left standing after the softer volcano around it eroded away', 'Volcanic neck']];
      var s = R.pick(S);
      return P('What is the name for ' + s[0] + '?', mc(s[1], S.filter(function (q) { return q !== s; }).map(function (q) { return q[1]; })),
        [{ Dike: 'A dike is discordant: it cuts across the layers, filling a crack.', Sill: 'A sill is concordant: it runs parallel to the layers it squeezed between.', Batholith: 'Batholiths are the largest plutons; smaller ones (under about 100 km² exposed) are called stocks.', Laccolith: 'A laccolith is a sill-like body that bulged the layers above into a dome.', 'Volcanic neck': 'A volcanic neck is the magma that froze in a volcano\'s throat; Shiprock in New Mexico is a famous one.' }[s[1]]],
        'Does it cut across the layers, run along them, or swell them up?', { vf: { k: 'shape' } });
    }
    if (kind === 'sill') {
      var flow = R.coin();
      var clues = flow ? 'The rock below it is baked, but the rock above it is not; the top of the basalt is full of gas holes and is weathered, and the sandstone above contains pebbles of the basalt.'
        : 'The rock both above and below it is baked; the basalt has no gas holes, and its top and bottom both have finer crystals than its middle.';
      return P('A layer of basalt lies between two sandstone layers. ' + clues + ' Is the basalt a sill or a buried lava flow?', mc(flow ? 'A buried lava flow' : 'A sill', [flow ? 'A sill' : 'A buried lava flow', 'A dike', 'It cannot be told apart']),
        [flow ? 'A lava flow cooled at the surface: it baked the ground beneath it, gas bubbled out of its top, and its top weathered before the next layer buried it, so that layer can hold pieces of it.' : 'A sill is magma forced between layers that were already there, so it bakes the rock on both sides. It cooled underground, where gas could not escape as bubbles at the top.',
          flow ? 'So the basalt is older than the sandstone above it.' : 'So the sill is younger than the sandstone on both sides of it.'],
        'Which sides are baked?', { viz: { name: 'es-strata', opts: { events: flow ? [{ t: 'deposit', rock: 'sandstone' }, { t: 'deposit', rock: 'shale' }, { t: 'lava' }, { t: 'deposit', rock: 'sandstone' }, { t: 'deposit', rock: 'siltstone' }] : [{ t: 'deposit', rock: 'sandstone' }, { t: 'deposit', rock: 'shale' }, { t: 'deposit', rock: 'sandstone' }, { t: 'deposit', rock: 'siltstone' }, { t: 'intrude', kind: 'sill', z: 0.21, w: 0.04 }], quiet: true, lock: true } }, vf: { k: 'sill', flow: flow } });
    }
    if (kind === 'size') {
      var a = R.int(4, 15), b = R.int(5, 20), area = a * b, bath = area > 100;
      if (area === 100) b++; area = a * b; bath = area > 100;
      return P('A body of granite is exposed at the surface over a roughly rectangular area ' + a + ' km by ' + b + ' km. Geologists call a pluton exposed over more than 100 km² a batholith and a smaller one a stock. Which is this?', mc(bath ? 'A batholith' : 'A stock', [bath ? 'A stock' : 'A batholith', 'A dike', 'A sill']),
        ['Area: $' + a + ' \\times ' + b + ' = ' + area + '\\,\\text{km}^2$.', area + ' km² is ' + (bath ? 'more' : 'less') + ' than 100 km², so it is ' + (bath ? 'a batholith' : 'a stock') + '.', 'Both are plutons: large blobs of magma that cooled slowly deep underground and were exposed by erosion.'],
        'Find the area and compare it with 100 km².', { vf: { k: 'size', a: a, b: b } });
    }
    var dk = R.int(60, 140), rows = R.pick([['sandstone', 'shale'], ['limestone', 'shale'], ['siltstone', 'sandstone']]);
    return P('A dike dated ' + dk + ' million years old cuts through layers of ' + rows[0] + ' and ' + rows[1] + '. What can you say about the age of those layers?', mc('They are older than ' + dk + ' million years', ['They are younger than ' + dk + ' million years', 'They are exactly ' + dk + ' million years old', 'Nothing; a dike tells nothing about the layers it cuts']),
      ['Cross-cutting relationships: a feature that cuts across rock is younger than the rock it cuts.', 'The layers had to be there before the magma could cut through them.', 'So they are older than ' + dk + ' million years.'],
      'Which came first, the layers or the crack the magma filled?', { vf: { k: 'age' } });
  });

  // VEI: lower bound of erupted volume in cubic meters
  var VEIB = [0, 1e4, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12];
  G('geology.eruption-styles', function (R, ctx) {
    var kind = by(ctx, R.pick(['style', 'type', 'ratio']), R.pick(['ratio', 'vei', 'style', 'type']), R.pick(['vei', 'ratio', 'why', 'type']));
    if (kind === 'ratio') {
      var a = R.int(2, 6), b = a + R.int(1, 2);
      return P('From VEI 2 upward, each step on the Volcanic Explosivity Index means about ten times more erupted material. About how many times more material does a VEI ' + b + ' eruption throw out than a VEI ' + a + ' eruption?', exact(M.pow(10, b - a)),
        ['The steps are ' + (b - a) + ', and each one multiplies by 10.', '$10^{' + (b - a) + '} = ' + T.commas(M.pow(10, b - a)) + '$ times as much.'], 'Count the steps; each is a factor of 10.', { unit: 'times', vf: { k: 'ratio', a: a, b: b } });
    }
    if (kind === 'vei') {
      var v = R.int(2, 7), mant = R.pick([1.5, 2, 3, 4, 5, 6, 8]), vol = VEIB[v] * mant, km3 = vol / 1e9;
      var shown = vol >= 1e8 ? fd(km3, 3) + ' km³' : T.commas(vol) + ' m³';
      return P('An eruption throws out about ' + shown + ' of ash and rock. On the VEI, VEI 2 starts at 1,000,000 m³ (0.001 km³), and each step up starts at ten times more: VEI 3 at 0.01 km³, VEI 4 at 0.1 km³, VEI 5 at 1 km³, and so on. What is its VEI?', exact(v),
        ['Write the volume in km³: ' + (vol >= 1e8 ? shown : fd(km3, 4) + ' km³') + '.', 'It is at least the start of VEI ' + v + ' (' + (VEIB[v] >= 1e8 ? fd(VEIB[v] / 1e9, 3) + ' km³' : T.commas(VEIB[v]) + ' m³') + ') but less than the start of VEI ' + (v + 1) + '.', 'So it is VEI ' + v + '.'],
        'Find the step whose starting volume is just below this volume.', { vf: { k: 'vei', vol: vol } });
    }
    if (kind === 'type') {
      var t = R.pick([['a broad, gently sloping volcano built of thousands of runny basalt lava flows, such as Mauna Loa', 'Shield volcano'], ['a steep cone of alternating lava flows and ash layers, built by andesite eruptions, such as Mount Fuji or Mount Rainier', 'Composite volcano (stratovolcano)'],
        ['a small, steep cone of loose gas-filled lava fragments around a single vent, built in a few years', 'Cinder cone'], ['a rounded mound of very sticky lava that piles up over its vent instead of flowing away', 'Lava dome']]);
      return P('What kind of volcano is ' + t[0] + '?', mc(t[1], ['Shield volcano', 'Composite volcano (stratovolcano)', 'Cinder cone', 'Lava dome'].filter(function (x) { return x !== t[1]; })),
        [{ 'Shield volcano': 'Runny basalt spreads far before it freezes, so the slopes are gentle, like a warrior\'s shield lying down.', 'Composite volcano (stratovolcano)': 'Sticky andesite lava and explosive ash build steep, layered cones.', 'Cinder cone': 'Gas-rich blobs of lava (cinders) fly up and pile around the vent at their steepest stable angle.', 'Lava dome': 'Silica-rich lava is too sticky to flow far, so it heaps up like toothpaste.' }[t[1]]],
        'Runny lava spreads; sticky lava piles up.', { vf: { k: 'type' } });
    }
    if (kind === 'style') {
      var s = R.pick([['runny basalt magma with little gas', 'Gentle: lava flows and fountains'], ['sticky rhyolite magma full of dissolved gas', 'Explosive: ash columns and pyroclastic flows'], ['sticky andesite magma with plenty of gas', 'Explosive: ash columns and pyroclastic flows'], ['basalt magma that rises into shallow groundwater or the sea', 'Explosive steam blasts as water flashes to steam']]);
      return P('What eruption style would you expect from ' + s[0] + '?', mc(s[1], ['Gentle: lava flows and fountains', 'Explosive: ash columns and pyroclastic flows', 'Explosive steam blasts as water flashes to steam', 'No eruption at all'].filter(function (x) { return x !== s[1]; })),
        ['Two things decide the style: how sticky (viscous) the magma is, and how much gas it holds.', s[1].indexOf('Gentle') === 0 ? 'Runny magma lets bubbles rise and escape quietly.' : s[1].indexOf('steam') >= 0 ? 'Even runny magma can explode when it meets water, because water expands about 1,700 times when it turns to steam.' : 'Sticky magma traps the gas until the pressure drops near the surface; then the bubbles expand violently and blow the magma apart into ash.'],
        'Think of shaking a soda: can the gas escape gently?', { vf: { k: 'style' } });
    }
    return bankQ(R, [
      ['Kīlauea in Hawaiʻi has poured out huge volumes of lava, yet Mount St. Helens\' 1980 eruption was far more explosive. Why?', 'Mount St. Helens\' magma was sticky and gas-rich, so it blasted out; Kīlauea\'s runny basalt lets gas escape gently',
        ['Kīlauea is not a real volcano', 'Mount St. Helens had more lava', 'Explosiveness depends only on the size of the volcano'],
        ['Volume of lava and explosiveness are different things.', 'Kīlauea\'s basalt is runny, so it flows out as lava.', 'Mount St. Helens\' dacite was sticky and full of gas; when the north side collapsed, the pressure dropped at once and the gas exploded.'], 'Compare the magmas.']
    ], 'why');
  });

  G('geology.volcanic-hazards', function (R, ctx) {
    var kind = by(ctx, R.pick(['hazard', 'hazard', 'monitor']), R.pick(['lahar', 'hazard', 'monitor', 'swell']), R.pick(['lahar', 'swell', 'why', 'hazard']));
    if (kind === 'hazard') {
      var H = [['a fast avalanche of hot ash, rock and gas that races down a volcano\'s slopes, often faster than 80 km/h', 'Pyroclastic flow'], ['a flowing mix of water, mud and rock that rushes down river valleys, sometimes far from the volcano', 'Lahar (volcanic mudflow)'],
        ['fine bits of rock and glass that fall from an eruption cloud and can collapse roofs and damage airplane engines', 'Ash fall'], ['invisible carbon dioxide that can collect in low places and suffocate people and animals', 'Volcanic gas'], ['a stream of molten rock that usually moves slowly enough to walk away from but buries what it reaches', 'Lava flow']];
      var h = R.pick(H);
      return P('Which volcanic hazard is ' + h[0] + '?', mc(h[1], H.filter(function (q) { return q !== h; }).map(function (q) { return q[1]; })),
        [{ 'Pyroclastic flow': 'Pyroclastic flows are the deadliest volcanic hazard: they are too fast and too hot (hundreds of degrees) to outrun.', 'Lahar (volcanic mudflow)': 'Lahars follow valleys and can travel many tens of kilometers, so they threaten towns far from the volcano.', 'Ash fall': 'Ash is rock, not soot: it is heavy (especially when wet), abrasive and conducts electricity when wet.', 'Volcanic gas': 'Carbon dioxide is heavier than air, so it pools in hollows.', 'Lava flow': 'Most lava flows advance slowly, so they rarely kill people, but they destroy everything in their path.' }[h[1]]],
        'Think about what it is made of and how fast it moves.', { vf: { k: 'hazard' } });
    }
    if (kind === 'lahar') {
      var d = R.pick([20, 30, 40, 45, 60, 75, 90]), v = R.pick([20, 30, 40, 50, 60]), t = d / v * 60;
      return P('A lahar starts high on a volcano and races down a river valley at about ' + v + ' km/h. How many minutes until it reaches a town ' + d + ' km downstream?', num(t, 3, 0.01),
        ['Time = distance ÷ speed $= \\dfrac{' + d + '\\,\\text{km}}{' + v + '\\,\\text{km/h}} = ' + fd(d / v, 3) + '\\,\\text{h}$.', 'In minutes: $' + fd(d / v, 3) + ' \\times 60 = ' + fd(t, 1) + '\\,\\text{min}$.', 'Warning systems on volcanoes such as Mount Rainier are designed around times like this. In 1985, lahars from Nevado del Ruiz in Colombia took roughly two and a half hours to reach the town of Armero, about 74 km away, and killed more than 20,000 people.'],
        'Time = distance ÷ speed; then change hours to minutes.', { unit: 'min', vf: { k: 'lahar', d: d, v: v } });
    }
    if (kind === 'swell') {
      var cm = R.pick([6, 8, 9, 12, 15, 18, 24]), mo = R.pick([2, 3, 4, 6]), rate = cm / mo;
      return P('GPS stations show the ground on a volcano rising ' + cm + ' cm in ' + mo + ' months, as magma collects underneath. At that rate, how many centimeters will it rise in one year?', num(rate * 12, 3, 0.01),
        ['Rate: $' + cm + ' \\div ' + mo + ' = ' + fd(rate, 2) + '\\,\\text{cm per month}$.', 'In 12 months: $' + fd(rate, 2) + ' \\times 12 = ' + fd(rate * 12, 1) + '\\,\\text{cm}$.', 'Steady swelling, more small earthquakes and changes in gases are warning signs that magma is moving, but they do not give an exact date for an eruption.'],
        'Find the rise per month, then multiply by 12.', { unit: 'cm', vf: { k: 'swell', cm: cm, mo: mo } });
    }
    if (kind === 'monitor') {
      var sig = R.pick([['the ground on the volcano starts to swell, measured by GPS and tilt meters', 'Magma may be collecting beneath the volcano'], ['swarms of small earthquakes start under the volcano and grow shallower', 'Magma may be moving up and breaking rock'], ['the volcano starts giving off much more sulfur dioxide gas', 'Fresh magma may be rising and releasing gas']]);
      return P('Scientists watching a volcano notice that ' + sig[0] + '. What might it mean?', mc(sig[1], ['The volcano is dying out', 'Groundwater is freezing', 'Nothing; volcanoes give no warning signs'].concat(sig[1].indexOf('collecting') < 0 ? [] : [])),
        ['Volcano monitoring watches three things: ground shape, earthquakes and gases.', sig[1] + '. Together, these signs let scientists raise alert levels, though they cannot give an exact date for an eruption.'],
        'Magma pushes rock aside, breaks it and gives off gas.', { vf: { k: 'monitor' } });
    }
    return bankQ(R, [
      ['A volcano has been quiet for 500 years. What does that mean?', 'Nothing certain: many volcanoes rest for centuries between eruptions, so it must still be watched',
        ['It is extinct and safe forever', 'It will erupt exactly 500 years from now', 'Its magma has all turned to granite'],
        ['Many dangerous volcanoes erupt only every few hundred or thousand years.', 'Mount Pinatubo in the Philippines had been quiet for about 500 years before its huge 1991 eruption, which monitoring helped forecast in time for large evacuations.'], 'How long do volcanoes rest?'],
      ['Why can a lahar threaten a town that is 50 km from a volcano?', 'Lahars flow down river valleys like wet concrete and can keep going for tens of kilometers',
        ['Lahars are carried by the wind', 'Lahars only happen inside the crater', 'Lahars are a kind of earthquake'],
        ['Melting snow and ice, heavy rain or a crater lake can mix with loose ash and rock.', 'The mixture rushes down valleys and can travel very far, burying whatever is in its path.'], 'Where does water flow?']
    ], 'why');
  });

// ---- 04_sedimentary.js
  // =====================================================================================
  // Unit 4: Sediments and Sedimentary Rocks
  // =====================================================================================

  // balanced weathering reactions: [left [[coef, TeX]], right [[coef, TeX]], name]
  var RXN = [
    [[[1, '\\text{CaCO}_3'], [1, '\\text{H}_2\\text{O}'], [1, '\\text{CO}_2']], [[1, '\\text{Ca}^{2+}'], [2, '\\text{HCO}_3^{-}']], 'calcite dissolving in rainwater that carries carbon dioxide'],
    [[[1, '\\text{CaCO}_3'], [1, '\\text{H}_2\\text{CO}_3']], [[1, '\\text{Ca}^{2+}'], [2, '\\text{HCO}_3^{-}']], 'calcite dissolving in carbonic acid'],
    [[[2, '\\text{KAlSi}_3\\text{O}_8'], [2, '\\text{H}^{+}'], [9, '\\text{H}_2\\text{O}']], [[1, '\\text{Al}_2\\text{Si}_2\\text{O}_5(\\text{OH})_4'], [2, '\\text{K}^{+}'], [4, '\\text{H}_4\\text{SiO}_4']], 'potassium feldspar weathering to the clay mineral kaolinite'],
    [[[1, '\\text{Mg}_2\\text{SiO}_4'], [4, '\\text{CO}_2'], [4, '\\text{H}_2\\text{O}']], [[2, '\\text{Mg}^{2+}'], [4, '\\text{HCO}_3^{-}'], [1, '\\text{H}_4\\text{SiO}_4']], 'olivine (forsterite) dissolving in water that carries carbon dioxide']
  ];
  var GOLD = [['olivine', 1], ['pyroxene', 2], ['amphibole', 3], ['biotite mica', 4], ['potassium feldspar', 5], ['muscovite mica', 6], ['quartz', 7]];
  G('geology.chemical-weathering', function (R, ctx) {
    var kind = by(ctx, R.pick(['type', 'fastest', 'why']), R.pick(['type', 'fastest', 'rate', 'balance']), R.pick(['balance', 'balance', 'rate', 'fastest']));
    if (kind === 'type') {
      var t = R.pick([['Potassium feldspar reacts with slightly acidic water and slowly turns into soft clay.', 'Hydrolysis'], ['Iron in pyroxene combines with oxygen and the rock turns rusty red-brown.', 'Oxidation'],
        ['Rainwater carrying carbon dioxide dissolves limestone and carries away calcium and bicarbonate ions, leaving caves.', 'Dissolution (carbonation)'], ['Frost wedges a crack open and breaks a boulder into angular pieces.', 'Not chemical weathering: frost wedging is mechanical']]);
      return P('What kind of weathering is this? ' + t[0], mc(t[1], ['Hydrolysis', 'Oxidation', 'Dissolution (carbonation)', 'Not chemical weathering: frost wedging is mechanical'].filter(function (x) { return x !== t[1]; })),
        [{ Hydrolysis: 'Hydrolysis: water (with $\\text{H}^{+}$ ions) attacks the mineral\'s structure and builds a new mineral, clay, releasing ions such as $\\text{K}^{+}$.', Oxidation: 'Oxidation: $\\text{Fe}^{2+}$ in the mineral loses an electron to oxygen and becomes $\\text{Fe}^{3+}$, which forms rusty iron oxides such as hematite and goethite.', 'Dissolution (carbonation)': 'Dissolution: carbon dioxide in water makes weak carbonic acid, which dissolves calcite completely, ion by ion.', 'Not chemical weathering: frost wedging is mechanical': 'Frost wedging breaks rock into smaller pieces without changing its minerals, so it is mechanical weathering.' }[t[1]]],
        'Is a new mineral made, is iron rusting, or does the mineral dissolve away?', { vf: { k: 'type' } });
    }
    if (kind === 'fastest') {
      var set = R.sample(GOLD, 3), srt = set.slice().sort(function (a, b) { return a[1] - b[1]; }), slow = R.coin(), ans0 = slow ? srt[2] : srt[0];
      return P('A granite boulder and a basalt boulder sit side by side for thousands of years. Of the minerals ' + U.list(set.map(function (q) { return q[0]; })) + ', which weathers ' + (slow ? 'slowest' : 'fastest') + ' at Earth\'s surface?', mc(ans0[0], set.filter(function (q) { return q !== ans0; }).map(function (q) { return q[0]; }).concat(['They all weather at the same rate'])),
        ['Minerals that crystallize at the highest temperatures (top of Bowen\'s series) are the least stable at cool, wet surface conditions, so they weather fastest.', 'Order from fastest to slowest: olivine, pyroxene, amphibole, biotite, potassium feldspar, muscovite, quartz (the Goldich series).', 'So ' + ans0[0] + ' weathers ' + (slow ? 'slowest' : 'fastest') + ' of these.'],
        'Weathering runs in the same order as Bowen\'s series: first to crystallize, first to fall apart.', { vf: { k: 'fastest', set: set.map(function (q) { return q[0]; }), slow: slow } });
    }
    if (kind === 'rate') {
      if (R.coin()) {
        var r = R.pick([1, 1.5, 2, 2.5]), yrs = R.pick([80, 120, 150, 200, 250, 300]), loss = r * yrs / 100;
        return P('In a rainy city, the surface of a marble gravestone dissolves away at about ' + fd(r, 1) + ' mm per century. How many millimeters will be lost after ' + yrs + ' years?', num(loss, 3, 0.01),
          ['Rate: $' + fd(r, 1) + '\\,\\text{mm per 100 years} = ' + fd(r / 100, 3) + '\\,\\text{mm per year}$.', 'Loss: $' + fd(r / 100, 3) + ' \\times ' + yrs + ' = ' + fd(loss, 2) + '\\,\\text{mm}$.', 'Old carved letters on marble grow blurry for this reason: calcite dissolves in slightly acidic rain.'],
          'Change the rate to millimeters per year first.', { unit: 'mm', vf: { k: 'rate', r: r, yrs: yrs } });
      }
      var wr = R.pick([0.02, 0.04, 0.05, 0.1]), wid = R.pick([0.5, 1, 2, 3]), yr2 = wid * 1000 / wr;
      return P('Water flowing along a crack in limestone dissolves each wall at about ' + fd(wr, 2) + ' mm per year, so the crack widens by twice that each year. How many years until a hairline crack becomes a passage ' + fd(wid, 1) + ' m wide?', num(yr2 / 2, 3, 0.01),
        ['Widening per year: $2 \\times ' + fd(wr, 2) + ' = ' + fd(2 * wr, 2) + '\\,\\text{mm}$.', 'Width needed: $' + fd(wid, 1) + '\\,\\text{m} = ' + T.commas(wid * 1000) + '\\,\\text{mm}$.', 'Time: $' + T.commas(wid * 1000) + ' \\div ' + fd(2 * wr, 2) + ' = ' + T.commas(M.round(yr2 / 2)) + '$ years. Cave passages and sinkholes in karst country grow over thousands of years this way.'],
        'Both walls dissolve, so double the rate.', { unit: 'years', vf: { k: 'crack', wr: wr, wid: wid } });
    }
    if (kind === 'balance') {
      var x = R.pick(RXN), side = function (arr) { return arr.map(function (q) { return '\\square\\,' + q[1]; }).join(' + '); };
      var coefs = x[0].concat(x[1]).map(function (q) { return String(q[0]); });
      return P('Balance this reaction for ' + x[2] + ', using the smallest whole numbers. Give the coefficients in order, separated by commas (write 1 where needed): $$' + side(x[0]) + ' \\rightarrow ' + side(x[1]) + '$$', { t: 'tuple', v: coefs },
        ['Balanced: $' + x[0].map(function (q) { return (q[0] > 1 ? q[0] : '') + q[1]; }).join(' + ') + ' \\rightarrow ' + x[1].map(function (q) { return (q[0] > 1 ? q[0] : '') + q[1]; }).join(' + ') + '$.', 'Check each element: the counts of every atom match on both sides, and the total charge is the same on both sides.', 'Coefficients: ' + coefs.join(', ') + '.'],
        'Balance the metal atoms first, then silicon or carbon, then hydrogen and oxygen; check the charges last.', { vf: { k: 'balance', rx: x } });
    }
    return bankQ(R, [
      ['Why do beaches and deserts pile up with quartz sand, while feldspar and dark minerals become scarce?', 'Quartz resists chemical weathering, while feldspar turns to clay and dark minerals break down',
        ['Quartz forms new crystals in the sand', 'Feldspar is blown away because it is lighter', 'Quartz is the only mineral in most rocks'],
        ['Quartz is a framework of strong Si–O bonds with no iron to rust and no easy weak spots, so water barely attacks it.', 'Feldspar turns into clay (which washes away as fine mud), and olivine, pyroxene and amphibole dissolve or rust.', 'Over long journeys the quartz is what remains.'], 'Which mineral is the most stable at the surface?'],
      ['A student thinks the minerals that crystallize first from magma must be the toughest. What actually happens at Earth\'s surface?', 'It is the reverse: the first minerals to crystallize (like olivine) weather fastest, and quartz, the last, lasts longest',
        ['The student is right: olivine lasts longest', 'All minerals weather at the same rate', 'Only quartz weathers'],
        ['Minerals are most stable near the conditions where they formed.', 'Olivine forms at about 1,200 °C with no water; at the cool, wet surface it is far from home and breaks down fast.', 'Quartz forms at the coolest end, closest to surface conditions, so it is the most stable.'], 'Think about where each mineral formed.']
    ], 'why');
  });

  var WENT = [['clay', 0, 1 / 256], ['silt', 1 / 256, 1 / 16], ['sand', 1 / 16, 2], ['granules', 2, 4], ['pebbles', 4, 64], ['cobbles', 64, 256], ['boulders', 256, 1e9]];
  function wentOf(d) { for (var i = 0; i < WENT.length; i++) if (d < WENT[i][2]) return WENT[i][0]; return 'boulders'; }
  function fracMM(d) { if (d >= 1) return T.commas(d); var n = M.round(1 / d); return '\\tfrac{1}{' + n + '}'; }
  G('geology.grain-size', function (R, ctx) {
    var kind = by(ctx, R.pick(['class', 'phi', 'phi']), R.pick(['phi', 'diam', 'class', 'compare']), R.pick(['phi3', 'diam', 'compare', 'phi']));
    var pw = R.int(-8, 8), d = M.pow(2, pw), phi = -pw;
    if (kind === 'class') {
      var dd = R.pick([0.002, 0.01, 0.03, 0.1, 0.5, 1.5, 3, 10, 40, 100, 200, 500, 1000]), cl = wentOf(dd);
      return P('A grain is ' + T.commas(dd) + ' mm across. What is it called on the Wentworth scale? (Clay under 1/256 mm, silt to 1/16 mm, sand to 2 mm, granules to 4 mm, pebbles to 64 mm, cobbles to 256 mm, boulders larger.)', mc(cl, wrongs(R, WENT.map(function (q) { return q[0]; }), 3, cl)),
        ['Compare ' + T.commas(dd) + ' mm with the class limits (1/256 ≈ 0.004 mm and 1/16 ≈ 0.063 mm).', 'It falls in the ' + cl + ' range.'], 'Each class limit is a power of 2 in millimeters.', { vf: { k: 'class', d: dd } });
    }
    if (kind === 'phi') {
      return P('Sedimentologists use the phi scale, $\\varphi = -\\log_2 d$, with $d$ in millimeters. What is $\\varphi$ for a grain $' + fracMM(d) + '\\,\\text{mm}$ across?', exact(phi),
        ['Write the size as a power of 2: $' + fracMM(d) + ' = 2^{' + pw + '}$.', '$\\log_2 2^{' + pw + '} = ' + pw + '$, so $\\varphi = -(' + pw + ') = ' + phi + '$.', phi < 0 ? 'Coarse grains (bigger than 1 mm) have negative phi.' : phi === 0 ? 'A 1 mm grain has phi 0.' : 'Fine grains (smaller than 1 mm) have positive phi: the smaller the grain, the bigger its phi.'],
        'Write the size as a power of 2, then flip the sign of the exponent.', { vf: { k: 'phi', d: d } });
    }
    if (kind === 'diam') {
      return P('A sand sample sieves out at $\\varphi = ' + phi + '$ on the phi scale ($\\varphi = -\\log_2 d$). What is the grain diameter in millimeters?', { t: 'num', v: String(fix(d)) },
        ['$d = 2^{-\\varphi} = 2^{' + (-phi) + '}$.', '$d = ' + fracMM(d) + '\\,\\text{mm}' + (d < 1 ? ' = ' + fd(d, 6) + '\\,\\text{mm}' : '') + '$, which is ' + wentOf(d) + '.'],
        'Undo the log: $d = 2^{-\\varphi}$.', { unit: 'mm', vf: { k: 'diam', phi: phi } });
    }
    if (kind === 'compare') {
      var a = R.pick([0.05, 0.1, 0.25, 0.5, 1, 4, 16, 64]), b = R.pick([0.002, 0.01, 0.125, 2, 8, 32, 128].filter(function (x) { return x !== a; })), big = a > b ? a : b;
      return P('Grain A is ' + T.commas(a) + ' mm and grain B is ' + T.commas(b) + ' mm across. Which has the larger phi value ($\\varphi = -\\log_2 d$)?', mc(a < b ? 'Grain A, the smaller one' : 'Grain B, the smaller one', [a < b ? 'Grain B, the larger one' : 'Grain A, the larger one', 'They have the same phi', 'You can\'t tell without a calculator']),
        ['Because of the minus sign, phi goes down as size goes up.', 'So the smaller grain, ' + (a < b ? 'A' : 'B') + ', has the larger phi.'], 'Watch the minus sign.', { vf: { k: 'compare', a: a, b: b } });
    }
    var d3 = R.pick([0.3, 0.7, 1.5, 3, 6, 0.15, 0.04, 12]), p3 = -M.log(d3) / M.LN2;
    return P('What is $\\varphi = -\\log_2 d$ for a grain $' + fd(d3, 2) + '\\,\\text{mm}$ across? (Use $\\log_2 d = \\dfrac{\\ln d}{\\ln 2}$.)', { t: 'num', v: ans(p3, 3), tol: 0.02 },
      ['$\\log_2 ' + fd(d3, 2) + ' = \\dfrac{\\ln ' + fd(d3, 2) + '}{\\ln 2} = \\dfrac{' + fd(M.log(d3), 4) + '}{0.6931} = ' + fd(-p3, 3) + '$.', '$\\varphi = ' + fd(p3, 2) + '$: ' + wentOf(d3) + '.'],
      'Change of base: divide ln d by ln 2, then change the sign.', { vf: { k: 'phi', d: d3 } });
  });

  // Hjulström-style curves (the same shape as the kit's es-sediment, after Hjulström 1935), cm/s for grain size d in mm
  function hjErode(d) { var f = 20 * M.pow(0.2 / d, 0.45), c = 30 * M.sqrt(d); return M.sqrt(f * f + c * c); }
  function hjDep(d) { return M.min(0.7 * hjErode(d), 9 * M.pow(d, 0.9)); }
  G('geology.sediment-transport', function (R, ctx) {
    var kind = by(ctx, R.pick(['field', 'field', 'why']), R.pick(['field', 'easiest', 'why', 'field']), R.pick(['stokes', 'stokes', 'field', 'easiest']));
    if (kind === 'field') {
      var d = R.pick([0.005, 0.02, 0.1, 0.3, 1, 5, 20, 60]), e = hjErode(d), dp = hjDep(d), want = R.pick(['eroded', 'carried', 'deposited']), v;
      if (want === 'eroded') v = M.ceil(e * 1.5 / 5) * 5;
      else if (want === 'deposited') { v = M.floor(dp * 0.6); if (v < 1) want = 'carried'; }
      if (want === 'carried') { v = M.round(M.sqrt(dp * e)); if (v < dp * 1.25 || v > e / 1.25) { want = 'eroded'; v = M.ceil(e * 1.5 / 5) * 5; } }
      var nm = wentOf(d), lab = { eroded: 'Picked up (eroded) from the bed', carried: 'Kept moving if already moving, but not picked up from the bed', deposited: 'Settles out (deposited)' };
      return P('Water flows at ' + v + ' cm/s over loose ' + nm + ' grains ' + T.commas(d) + ' mm across. Using the Hjulström diagram, what happens to these grains?', mc(lab[want], ['eroded', 'carried', 'deposited'].filter(function (x) { return x !== want; }).map(function (x) { return lab[x]; })),
        ['On the diagram, grains of ' + T.commas(d) + ' mm need about ' + M.round(e) + ' cm/s to be lifted from the bed and drop out below about ' + M.max(1, M.round(dp)) + ' cm/s.', v + ' cm/s is ' + (want === 'eroded' ? 'above the erosion curve' : want === 'deposited' ? 'below the settling curve' : 'between the two curves') + ', so the grains are ' + { eroded: 'picked up', carried: 'carried along if they are already moving', deposited: 'deposited' }[want] + '.'],
        'Find the grain size on the bottom, the speed on the side, and see which field the point lands in.', { viz: { name: 'es-sediment', opts: { mode: 'hjulstrom', point: { d: d, v: v }, quiet: true, lock: true } }, vf: { k: 'field', d: d, v: v, want: want } });
    }
    if (kind === 'easiest') return P('On the Hjulström diagram, which grains can the slowest current pick up from a stream bed?', mc('Fine-to-medium sand, about 0.1 to 0.5 mm', ['Clay, the smallest grains', 'Silt', 'Pebbles']),
      ['The erosion curve dips lowest around fine-to-medium sand.', 'Bigger grains are heavier and need faster water.', 'Clay and silt are smaller, but they stick together and form a smooth bed, so it takes faster water to tear them loose.'], 'Look for the lowest point of the erosion curve.', { viz: { name: 'es-sediment', opts: { mode: 'hjulstrom', quiet: true } }, vf: { k: 'easiest' } });
    if (kind === 'stokes') {
      var dum = R.pick([2, 4, 5, 10, 20, 30, 40]), dm = dum * 1e-6, vs = (2650 - 1000) * 9.8 * dm * dm / (18 * 0.001), depth = R.pick([1, 2, 5]), ask = R.coin() && dum >= 10;
      if (ask) return P('Tiny grains settle at a speed given by Stokes\' law: $v = \\dfrac{(\\rho_s - \\rho_w) g d^2}{18\\mu}$. A quartz silt grain ($\\rho_s = 2,650\\,\\text{kg/m}^3$) is ' + dum + ' μm across ($d = ' + fx(dm, 2) + '\\,\\text{m}$), in water with $\\rho_w = 1,000\\,\\text{kg/m}^3$ and viscosity $\\mu = 0.001\\,\\text{Pa·s}$. What is its settling speed in mm/s? (Use $g = 9.8\\,\\text{m/s}^2$.)', num(vs * 1000, 3, 0.02),
        ['$v = \\dfrac{(2,650 - 1,000)(9.8)(' + fx(dm, 2) + ')^2}{18 \\times 0.001}$.', '$= \\dfrac{1,650 \\times 9.8 \\times ' + fx(dm * dm, 2) + '}{0.018} = ' + fx(vs, 3) + '\\,\\text{m/s}$.', 'That is about $' + fd(vs * 1000, 3) + '\\,\\text{mm/s}$. Halve the size and the speed drops four times, because it goes with $d^2$.'],
        'Plug in, square the diameter, and convert meters to millimeters.', { unit: 'mm/s', vf: { k: 'stokes', d: dum } });
      var tH = depth / vs / 3600;
      return P('A grain of quartz ' + dum + ' μm across settles through still water at about ' + fx(vs * 1000, 2) + ' mm/s (from Stokes\' law). How many hours does it take to sink ' + depth + ' m?', num(depth * 1000 / (rnd(vs * 1000, 2)) / 3600, 3, 0.02),
        ['Distance: $' + depth + '\\,\\text{m} = ' + T.commas(depth * 1000) + '\\,\\text{mm}$.', 'Time: $' + T.commas(depth * 1000) + ' \\div ' + fx(vs * 1000, 2) + ' = ' + T.commas(M.round(depth * 1000 / rnd(vs * 1000, 2))) + '\\,\\text{s}$.', 'In hours: $\\div 3,600 \\approx ' + fd(depth * 1000 / rnd(vs * 1000, 2) / 3600, 2) + '\\,\\text{h}$. Fine grains stay suspended so long that the slightest current keeps them moving.'],
        'Time = distance ÷ speed; watch the units.', { unit: 'h', vf: { k: 'settle', v: rnd(vs * 1000, 2), depth: depth } });
    }
    return bankQ(R, [
      ['On the Hjulström diagram, clay needs faster water to erode than sand does, yet once lifted, clay stays in the water even when it barely moves. Why both?', 'Clay particles stick together and form a smooth bed that resists lifting, but each lifted particle is so tiny it settles extremely slowly',
        ['Clay is heavier than sand', 'Clay dissolves in the water', 'The diagram is wrong for clay'],
        ['Clay flakes cling to one another and pack into a smooth surface the current slides over, so it takes fast water to tear them loose.', 'Once free, a tiny grain sinks very slowly (its settling speed goes with the square of its size), so even gentle currents keep it suspended.'], 'Think about sticking together, and about settling speed.'],
      ['A river slows down as it enters a lake. Which sediment settles out first, near the river mouth?', 'The coarsest grains (gravel and sand)',
        ['The finest clay', 'All sizes at the same place', 'Nothing settles in a lake'],
        ['As speed falls, the heaviest grains drop first: gravel, then sand.', 'Silt and clay are carried farther out and settle last, in the quiet middle of the lake.'], 'Which grains need the most speed to keep moving?']
    ], 'why');
  });

  G('geology.sorting-rounding', function (R, ctx) {
    var kind = by(ctx, R.pick(['sorted', 'travel', 'tf']), R.pick(['travel', 'quartz', 'sorted', 'tf']), R.pick(['quartz', 'travel', 'env', 'tf']));
    if (kind === 'sorted') {
      var w = R.pick([['beach sand with grains all between 0.2 and 0.3 mm', 'well sorted'], ['glacial till with clay, sand, pebbles and boulders mixed together', 'poorly sorted'], ['dune sand with nearly identical grains about 0.25 mm across', 'well sorted'], ['landslide debris of mud, sand and angular blocks of every size', 'poorly sorted'], ['wind-blown silt (loess) with nearly all grains between 0.02 and 0.05 mm', 'well sorted'], ['flash-flood deposits in a desert canyon, with sand, gravel and boulders jumbled together', 'poorly sorted'], ['sand from a long barrier island beach, nearly all medium sand', 'well sorted'], ['a debris flow deposit of mud holding scattered cobbles and boulders', 'poorly sorted']]);
      return P('How would you describe the sorting of ' + w[0] + '?', mc(w[1] === 'well sorted' ? 'Well sorted: the grains are about the same size' : 'Poorly sorted: many sizes are mixed together', [w[1] === 'well sorted' ? 'Poorly sorted: many sizes are mixed together' : 'Well sorted: the grains are about the same size', 'Well sorted, because it is arranged in layers', 'Sorting describes the grains\' shape, not their size']),
        ['Sorting describes how similar the grain sizes are within one sample.', w[1] === 'well sorted' ? 'Waves or wind keep moving grains of one size and carry the rest away, so the sample is well sorted.' : 'Ice and landslides dump everything at once, with no time for water or wind to separate sizes, so the sample is poorly sorted.'],
        'Sorting is about sizes in one sample.', { vf: { k: 'sorted' } });
    }
    if (kind === 'travel' || kind === 'env') {
      var A = 'angular, poorly sorted grains, about half of them feldspar and rock fragments', B = 'well-rounded, well-sorted grains, almost all quartz', aFirst = R.coin();
      return P('Sand sample ' + (aFirst ? 'X' : 'Y') + ' has ' + A + '. Sample ' + (aFirst ? 'Y' : 'X') + ' has ' + B + '. Which sample has most likely traveled farther and longer from its source rock?', mcK(['Sample X', 'Sample Y', 'They traveled the same distance', 'You cannot tell anything from grains'], aFirst ? 1 : 0),
        ['Transport grinds corners off grains (rounding), separates sizes (sorting) and lets weathering destroy feldspar and rock fragments, leaving quartz.', 'So the rounded, well-sorted, quartz-rich sample is the more mature one: sample ' + (aFirst ? 'Y' : 'X') + '.', 'The angular, feldspar-rich sand probably came from nearby granite with little time for weathering.'],
        'Distance makes sand rounder, better sorted and richer in quartz.', { vf: { k: 'travel', ans: aFirst ? 'Y' : 'X' } });
    }
    if (kind === 'quartz') {
      var n = R.pick([200, 250, 300, 400, 500]), q = M.round(n * R.pick([0.55, 0.62, 0.7, 0.78, 0.85, 0.92, 0.96])), pc = q / n * 100;
      return P('A geologist counts ' + n + ' sand grains under a microscope and finds ' + q + ' quartz grains; the rest are feldspar and rock fragments. What percent of the grains are quartz?', pnum(pc, 3, 0.005),
        ['Percent quartz $= \\dfrac{' + q + '}{' + n + '} \\times 100 = ' + fd(pc, 1) + '\\%$.', pc >= 90 ? 'Over 90% quartz: a mature sand that has been weathered and moved for a long time (a quartz sandstone).' : 'Less than 90% quartz: an immature sand that still holds much feldspar or rock fragments, likely not far from its source.'],
        'Divide the quartz count by the total count.', { vf: { k: 'quartz', n: n, q: q } });
    }
    return bankTF(R, [
      ['"Well sorted" means the sediment has been sorted into separate layers.', false, ['Sorting describes the range of grain sizes within one sample; a well-sorted sample has grains of about the same size.', 'Layering is a different feature.'], 'Sorting is about sizes in one sample.'],
      ['The farther sand is carried by rivers and waves, the rounder its grains tend to become.', true, ['Grains bump and rub against each other as they move, so their sharp corners wear off.', 'Rounding takes long distances or many cycles of transport.'], 'What happens to corners when grains collide?'],
      ['Sand that is nearly all quartz has usually been weathered and moved for a long time, or through several cycles of erosion.', true, ['Weathering destroys feldspar and dark minerals over time, while quartz survives.', 'So a quartz-rich sand is called mature: it has had a long history.'], 'Which mineral survives longest?'],
      ['Glaciers make well-sorted sediment because ice moves slowly.', false, ['Ice carries every size from clay to boulders and drops them together when it melts.', 'Glacial till is one of the most poorly sorted sediments there is.'], 'Does ice separate grains by size?'],
      ['Wind sorts sand very well, because it can only lift grains within a narrow size range.', true, ['Air is thin, so wind moves sand and silt but leaves gravel behind, and it carries fine dust far away.', 'Dune sand is among the best-sorted sediment on Earth.'], 'What can wind lift, and what can\'t it?'],
      ['A sample of very angular, poorly sorted gravel has probably traveled thousands of kilometers.', false, ['Long transport rounds and sorts grains.', 'Angular, poorly sorted gravel was probably dumped close to its source, for example by a landslide, a glacier or a flash flood.'], 'What would a long journey do to the corners?']
    ], 'tf');
  });

  var CLAST = [['conglomerate', 'rounded pebbles and cobbles, with sand filling the spaces'], ['breccia', 'sharp, angular pieces of gravel cemented together'], ['sandstone', 'sand-sized grains (1/16 to 2 mm) you can see and feel'],
    ['siltstone', 'grains too small to see but gritty between your teeth'], ['shale', 'clay-sized grains that split into thin, flat sheets']];
  var CHEMR = [['limestone', 'fizzes in dilute acid and holds broken shells and other skeletons made of calcite'], ['rock salt', 'tastes salty and breaks into cubes; it formed as seawater evaporated'],
    ['rock gypsum', 'is soft enough to scratch with a fingernail; it formed as seawater evaporated'], ['chert', 'is very hard, made of microscopic quartz, and breaks along smooth curved surfaces'],
    ['coal', 'is black, burns and is made of compressed plant remains'], ['coquina', 'is a loosely cemented mass of whole and broken shells'], ['chalk', 'is soft, white and made of the microscopic calcite plates of tiny marine algae']];
  G('geology.sedimentary-classification', function (R, ctx) {
    var kind = by(ctx, R.pick(['clastic', 'chem', 'sample']), R.pick(['clastic', 'chem', 'sample', 'size']), R.pick(['size', 'sample', 'kind', 'chem']));
    if (kind === 'clastic' || kind === 'chem') {
      var L2 = kind === 'clastic' ? CLAST : CHEMR, r = R.pick(L2);
      return P('A sedimentary rock ' + (kind === 'clastic' ? 'is made of ' : '') + r[1] + '. What is it?', mc(r[0], wrongs(R, L2.map(function (q) { return q[0]; }), 3, r[0])),
        [kind === 'clastic' ? 'Clastic rocks are named by grain size first, and gravel rocks by grain shape: rounded gravel makes conglomerate, angular gravel makes breccia.' : 'Chemical and biochemical rocks are named by what they are made of.', 'This description fits ' + r[0] + '.'],
        kind === 'clastic' ? 'Grain size first, then shape.' : 'What is it made of?', { vf: { k: kind, r: r[0] } });
    }
    if (kind === 'sample') {
      var S = [['conglomerate', 'rounded pebbles in a sandy matrix'], ['breccia', 'angular fragments cemented together'], ['quartz sandstone', 'sand grains of quartz you can see'], ['shale', 'very fine grains in thin sheets'], ['limestone', 'calcite with shell fragments; it fizzes in acid'], ['rock salt', 'clear cubes that taste salty'], ['coal', 'black, layered, made of plant remains'], ['coquina', 'a mass of cemented shells']];
      var s = R.pick(S);
      return P('Name this sedimentary rock: ' + s[1] + '.', mc(s[0], wrongs(R, S.map(function (q) { return q[0]; }), 3, s[0])),
        ['Look at the grains first: are they pieces of older rock (clastic), or crystals and remains (chemical or biochemical)?', 'This sample is ' + s[0] + '.'], 'Grains or crystals?', { viz: { name: 'es-rock-key', opts: { sample: s[0], quiet: true, lock: true } }, vf: { k: 'sample', r: s[0] } });
    }
    if (kind === 'size') {
      var d = R.pick([0.002, 0.03, 0.2, 0.8, 1.5, 8, 30]), shape = R.pick(['rounded', 'angular']), nm = d >= 2 ? (shape === 'rounded' ? 'conglomerate' : 'breccia') : d >= 1 / 16 ? 'sandstone' : d >= 1 / 256 ? 'siltstone' : 'shale';
      return P('A clastic rock is made of ' + shape + ' grains about ' + T.commas(d) + ' mm across, cemented together. What is it called?', mc(nm, wrongs(R, ['conglomerate', 'breccia', 'sandstone', 'siltstone', 'shale'], 3, nm)),
        [T.commas(d) + ' mm is ' + wentOf(d) + (d >= 2 ? ' (gravel)' : '') + '.', d >= 2 ? 'Gravel rocks are named by shape: ' + shape + ' gravel makes ' + nm + '.' : 'Grains that size make ' + nm + '; for sand and finer, shape doesn\'t change the name.'],
        'Use the Wentworth size limits.', { vf: { k: 'size', d: d, shape: shape } });
    }
    return bankQ(R, [
      ['A student says limestone is sand cemented together. What is most limestone really made of?', 'Calcite, mostly from shells, corals and other skeletons of sea life',
        ['Quartz sand cemented by calcite', 'Volcanic ash', 'Dried mud'],
        ['Most limestone forms in warm, shallow seas where corals, shellfish and microscopic algae build skeletons of calcite ($\\text{CaCO}_3$).', 'Their remains pile up and are cemented together. That is why limestone fizzes in acid and often holds fossils.'], 'Think of a coral reef.'],
      ['How are clastic sedimentary rocks different from chemical ones?', 'Clastic rocks are made of broken grains of older rock; chemical rocks form from minerals that crystallize out of water',
        ['Clastic rocks are always older', 'Chemical rocks are always made of salt', 'There is no difference'],
        ['Clastic means "broken": sandstone, shale and conglomerate are piles of grains carried and dropped by water, wind or ice.', 'Chemical rocks such as rock salt and gypsum crystallize as water evaporates; biochemical ones such as limestone and coal are built from the remains of living things.'], 'Broken grains or crystals from water?']
    ], 'kind');
  });

  G('geology.sedimentary-structures', function (R, ctx) {
    var kind = by(ctx, R.pick(['meaning', 'meaning', 'upright']), R.pick(['meaning', 'current', 'upright', 'ripples']), R.pick(['current', 'upright', 'ripples', 'meaning']));
    if (kind === 'meaning') {
      var M2 = [['mud cracks', 'The mud dried out in the air'], ['symmetric ripple marks', 'Waves sloshed back and forth in shallow water'], ['asymmetric ripple marks', 'A current flowed in one direction'],
        ['large cross-beds several meters high, in well-sorted sand', 'Wind built migrating sand dunes'], ['a graded bed, coarse at the bottom and fine at the top', 'A sudden flow dumped sediment that settled, coarse grains first']];
      var m = R.pick(M2);
      return P('A layer of sedimentary rock shows ' + m[0] + '. What does it tell you about where it formed?', mc(m[1], M2.filter(function (q) { return q !== m; }).map(function (q) { return q[1]; })),
        [{ 'mud cracks': 'Wet mud shrinks and cracks into polygons only when it dries in the air.', 'symmetric ripple marks': 'Back-and-forth wave motion builds ripples with matching slopes on both sides.', 'asymmetric ripple marks': 'A one-way current builds ripples with a gentle upstream side and a steep downstream side.', 'large cross-beds several meters high, in well-sorted sand': 'Sand avalanches down the steep front of a dune, leaving sloping layers; big sets of them in well-sorted sand mark wind-blown dunes.', 'a graded bed, coarse at the bottom and fine at the top': 'When a muddy flow (such as an underwater turbidity current) slows, the coarse grains settle first and the fine ones last.' }[m[0]]],
        'Picture the water, wind or air that made it.', { vf: { k: 'meaning' } });
    }
    if (kind === 'current') {
      var dirs = ['north', 'east', 'south', 'west'], i = R.int(0, 3), what = R.coin() ? 'rip' : 'cross';
      var q = what === 'rip' ? 'Asymmetric ripple marks in an old sandstone have their steep sides facing ' + dirs[i] + ' and their gentle sides facing ' + dirs[(i + 2) % 4] + '. Which way did the current flow?' : 'The sloping layers of cross-beds in an old sandstone dip down toward the ' + dirs[i] + '. Which way did the current or wind flow?';
      return P(q, mc('Toward the ' + dirs[i], ['Toward the ' + dirs[(i + 2) % 4], 'Toward the ' + dirs[(i + 1) % 4], 'It flowed back and forth']),
        [what === 'rip' ? 'Grains roll up the gentle upstream side and tumble down the steep downstream side.' : 'Sand avalanches down the front (lee) side of a moving ripple or dune, so the sloping layers dip in the direction the current moved.', 'So the flow went toward the ' + dirs[i] + '.'],
        'Sand tumbles down the downstream side.', { vf: { k: 'current', dir: dirs[i] } });
    }
    if (kind === 'upright') {
      var st = 'graded', flip = R.coin();
      return P('Rock layers can be turned upside down by folding. This picture shows a ' + (st === 'graded' ? 'graded bed' : 'layer with mud cracks') + ' as it appears in a cliff. Is the layer right side up or overturned?', mc(flip ? 'Overturned (upside down)' : 'Right side up', [flip ? 'Right side up' : 'Overturned (upside down)', 'You can\'t tell from sedimentary structures', 'It is lying on its side']),
        [st === 'graded' ? 'A graded bed settles coarse grains first, so its bottom is coarse and its top is fine.' : 'Mud cracks are widest at the top, where the mud dried, and narrow downward.', flip ? 'Here the coarse end (or the wide end of the cracks) is on top, so the layer is overturned.' : 'Here the pattern is the normal way up, so the layer is right side up.'],
        'Which end of the layer formed at the top?', { viz: { name: 'es-sediment', opts: { mode: 'structures', structure: st, flip: flip, quiet: true, lock: true } }, vf: { k: 'upright', flip: flip } });
    }
    return bankQ(R, [
      ['Two sets of ripple marks: set A has even, symmetric crests; set B is lopsided, with a steep side and a gentle side. What made each?', 'A: waves sloshing back and forth; B: a current flowing one way',
        ['A: a current; B: waves', 'Both: wind', 'Both: waves'],
        ['Waves move water back and forth, building ripples with matching slopes.', 'A one-way current builds lopsided ripples whose steep side faces downstream.'], 'One-way or back-and-forth?']
    ], 'ripples');
  });

  G('geology.depositional-environments', function (R, ctx) {
    var kind = by(ctx, R.pick(['env', 'env', 'why']), R.pick(['env', 'env', 'seq', 'why']), R.pick(['seq', 'env', 'seq', 'why']));
    var E = [['thick, well-sorted quartz sandstone with cross-beds several meters high and frosted, rounded grains', 'Desert sand dunes'], ['a jumble of clay, sand and scratched boulders with no layering or sorting', 'Glacier (glacial till)'],
      ['limestone full of fossil corals and shells in their growth positions', 'Warm, shallow sea reef'], ['thin layers of black shale with fossils of free-floating animals and no signs of currents', 'Deep, quiet ocean or lake floor'],
      ['lens-shaped channels of conglomerate and cross-bedded sandstone, between red mudstones with mud cracks', 'River channel and floodplain'], ['thick layers of gypsum and rock salt', 'Shallow sea or lake drying up in a hot, arid climate'],
      ['well-sorted, rounded quartz sand with gentle layers dipping seaward and shell fragments', 'Beach'], ['coal seams between layers of sandstone and shale with fossil plant roots', 'Coastal swamp']];
    if (kind === 'env') {
      var e = R.pick(E);
      return P('Which environment most likely deposited ' + e[0] + '?', mc(e[1], wrongs(R, E.map(function (q) { return q[1]; }), 3, e[1])),
        ['Match each clue to a process: grain size and sorting tell the energy of the water or wind, structures tell how it moved, and fossils tell who lived there.', 'These clues point to: ' + e[1].charAt(0).toLowerCase() + e[1].slice(1) + '.'],
        'Which clue is the most telling?', { vf: { k: 'env' } });
    }
    if (kind === 'seq') {
      var up = R.coin();
      var seq = up ? ['beach sandstone', 'offshore shale', 'limestone from deeper, clear water'] : ['limestone from deeper, clear water', 'offshore shale', 'beach sandstone'];
      return P('Going up through a stack of layers (from oldest to youngest), the rock changes from ' + U.list(seq) + '. What happened to sea level at this spot?', mc(up ? 'It rose: the shoreline moved inland (a transgression)' : 'It fell: the shoreline moved seaward (a regression)', [up ? 'It fell: the shoreline moved seaward (a regression)' : 'It rose: the shoreline moved inland (a transgression)', 'It stayed the same', 'You cannot tell from rock types']),
        ['At any moment, beach sand, offshore mud and deeper limestone form side by side, going out to sea.', up ? 'Finding deeper-water deposits on top of shallower ones means the deeper environments moved over this spot: the sea rose and spread inland.' : 'Finding shallower deposits on top of deeper ones means the shore built out over this spot: the sea fell or the land filled in.'],
        'Did the water get deeper or shallower over time?', { vf: { k: 'seq', up: up } });
    }
    return bankQ(R, [
      ['Limestone with fossil sea shells is found near the top of Mount Everest. What does that mean?', 'The rock formed on an ancient seafloor and was later pushed up by colliding plates',
        ['A flood once covered the whole mountain', 'Birds carried shells to the top', 'Shells form inside rocks at high altitude'],
        ['Fossil shells and limestone form in the sea.', 'When India collided with Asia, the old seafloor between them was squeezed, stacked and lifted more than 8 km. Rocks do not always stay where they formed.'], 'Where do sea shells live?']
    ], 'why');
  });

// ---- 05_metamorphic.js
  // =====================================================================================
  // Unit 5: Metamorphism
  // =====================================================================================

  G('geology.pressure-depth', function (R, ctx) {
    var kind = by(ctx, R.pick(['P', 'P', 'stress']), R.pick(['P', 'depth', 'kbar', 'stress']), R.pick(['depth', 'kbar', 'PT', 'PT']));
    var rho = R.pick([2.6, 2.7, 2.7, 2.8, 2.9]);
    if (kind === 'P') {
      var z = R.pick([1, 2, 3, 5, 8, 10, 15, 20]), Pm = rho * 1000 * GRAV * z * 1000 / 1e6;
      return P('Rock with a density of ' + fd(rho, 1) + ' g/cm³ (' + T.commas(rho * 1000) + ' kg/m³) lies ' + z + ' km deep. What is the pressure from the rock above it, in megapascals? (Use $P = \\rho g h$ with $g = 9.8\\,\\text{m/s}^2$.)', num(Pm, 3, 0.01),
        ['Depth in meters: $h = ' + T.commas(z * 1000) + '\\,\\text{m}$.', '$P = ' + T.commas(rho * 1000) + ' \\times 9.8 \\times ' + T.commas(z * 1000) + ' = ' + fx(Pm * 1e6, 3) + '\\,\\text{Pa}$.', 'That is $' + fd(Pm, 1) + '\\,\\text{MPa}$ (1 MPa = 1,000,000 Pa), about ' + T.commas(M.round(Pm * 1e6 / 101325)) + ' times the air pressure at sea level.'],
        'Use SI units: kg/m³, m/s² and m give pascals.', { unit: 'MPa', vf: { k: 'P', rho: rho, z: z } });
    }
    if (kind === 'depth' || kind === 'kbar') {
      var Pv = kind === 'kbar' ? R.pick([2, 3, 4, 5, 6, 8, 10]) : R.pick([100, 200, 300, 500, 800]), Pmpa = kind === 'kbar' ? Pv * 100 : Pv, zz = Pmpa * 1e6 / (rho * 1000 * GRAV) / 1000;
      return P((kind === 'kbar' ? 'Mineral pairs in a schist show it formed at about ' + Pv + ' kilobars (1 kbar = 100 MPa).' : 'A metamorphic rock formed at a pressure of about ' + Pv + ' MPa.') + ' If the rock above it averaged ' + fd(rho, 1) + ' g/cm³, how deep was it buried, in kilometers? (Use $g = 9.8\\,\\text{m/s}^2$.)', num(zz, 3, 0.01),
        [(kind === 'kbar' ? '$' + Pv + '\\,\\text{kbar} = ' + Pmpa + '\\,\\text{MPa} = ' + fx(Pmpa * 1e6, 3) + '\\,\\text{Pa}$.' : '$' + Pv + '\\,\\text{MPa} = ' + fx(Pmpa * 1e6, 3) + '\\,\\text{Pa}$.'), 'Solve $P = \\rho g h$ for $h$: $h = \\dfrac{P}{\\rho g} = \\dfrac{' + fx(Pmpa * 1e6, 3) + '}{' + T.commas(rho * 1000) + ' \\times 9.8} = ' + T.commas(M.round(zz * 1000)) + '\\,\\text{m}$.', 'About $' + fd(zz, 1) + '\\,\\text{km}$ deep. Rocks like this reached the surface again only after the mountains above them were worn away.'],
        'Rearrange $P = \\rho g h$ for $h$, in SI units.', { unit: 'km', vf: { k: 'depth', rho: rho, P: Pmpa } });
    }
    if (kind === 'PT') {
      var z2 = R.pick([5, 8, 10, 12, 15, 20]), T0 = R.int(10, 20), gr = R.pick([20, 25, 30]), Pm2 = rho * 1000 * GRAV * z2 * 1000 / 1e6, T2 = T0 + gr * z2;
      return P('A layer of shale is buried ' + z2 + ' km deep, under rock averaging ' + fd(rho, 1) + ' g/cm³. The surface is ' + T0 + ' °C and the temperature rises ' + gr + ' °C per km. Find the pressure (MPa) and the temperature (°C) there.', { t: 'multi', parts: [{ label: 'Pressure', a: num(Pm2, 3, 0.01), unit: 'MPa' }, { label: 'Temperature', a: num(T2, 3, 0.01), unit: '°C' }] },
        ['Pressure: $P = \\rho g h = ' + T.commas(rho * 1000) + ' \\times 9.8 \\times ' + T.commas(z2 * 1000) + ' \\approx ' + fd(Pm2, 0) + '\\,\\text{MPa}$.', 'Temperature: $T = ' + T0 + ' + ' + gr + ' \\times ' + z2 + ' = ' + T2 + '^\\circ\\text{C}$.', T2 > 300 ? 'At ' + T2 + ' °C the clay minerals in shale start turning into micas: metamorphism has begun.' : 'Below about 200 to 300 °C, shale changes little; this is still the realm of burial and cementing.'],
        'Pressure from $\\rho g h$; temperature from the gradient.', { vf: { k: 'PT', rho: rho, z: z2, T0: T0, g: gr } });
    }
    return bankQ(R, [
      ['Deep in the crust, rock is squeezed by the weight above it equally from all sides. Is that enough to line up its minerals into foliation?', 'No; equal pressure only compresses. Foliation needs stronger squeezing in one direction',
        ['Yes; any high pressure lines up minerals', 'Yes, but only if the rock is wet', 'No; foliation comes only from heat'],
        ['Pressure equal on all sides (like water pressure on a diver) shrinks a rock but has no direction to line anything up along.', 'In mountain belts, plates push harder from the sides than from above. That directed stress flattens grains and makes platy minerals like mica grow at right angles to the push: foliation.'], 'Does equal squeezing have a direction?'],
      ['Why does pressure increase by about 26 MPa for every kilometer of depth in the crust?', 'Each kilometer adds the weight of a 1-km column of rock (density about 2,700 kg/m³) pressing down',
        ['Because the core pulls rock downward harder at depth', 'Because temperature rises 25 °C per kilometer', 'Because air is trapped in the rock'],
        ['Pressure from overlying material is $P = \\rho g h$.', 'For one kilometer of rock: $2,700 \\times 9.8 \\times 1,000 \\approx 26,000,000\\,\\text{Pa} = 26\\,\\text{MPa}$.'], 'Think about the weight of the rock above.']
    ], 'stress');
  });

  var META_SEQ = ['slate', 'phyllite', 'schist', 'gneiss'];
  var IDX = [['chlorite', 300], ['biotite', 420], ['garnet', 480], ['staurolite', 560], ['kyanite', 620], ['sillimanite', 680]];
  G('geology.metamorphic-grade', function (R, ctx) {
    var kind = by(ctx, R.pick(['next', 'next', 'why']), R.pick(['next', 'index', 'order', 'why']), R.pick(['index', 'depth', 'order', 'depth']));
    if (kind === 'next') {
      var i = R.int(0, 2), up = R.coin() || i === 0;
      if (!up) i = R.int(1, 3);
      var from = META_SEQ[i], to = up ? META_SEQ[i + 1] : META_SEQ[i - 1];
      return P('Shale is heated and squeezed to higher and higher grade. Which rock comes ' + (up ? 'next after' : 'just before') + ' ' + from + '?', mc(to, R.sample(['granite', 'marble', 'quartzite'].concat(META_SEQ.filter(function (x) { return x !== to && x !== from; })), 3)),
        ['The sequence from shale is: slate, phyllite, schist, gneiss (and, if it starts to melt, migmatite).', 'Clay minerals grow into tiny micas (slate, dull; phyllite, silky sheen), then visible micas (schist, sparkly), and finally light and dark minerals separate into bands (gneiss).', 'So ' + (up ? 'after' : 'before') + ' ' + from + ' comes ' + to + '.'],
        'Slate, phyllite, schist, gneiss.', { vf: { k: 'next', ans: to } });
    }
    if (kind === 'index') {
      var j = R.int(0, IDX.length - 1), lo = IDX[j][1], hi = j < IDX.length - 1 ? IDX[j + 1][1] : 760, Tq = M.round((lo + 15 + R.real(0, 1, 2) * (hi - lo - 30)) / 5) * 5;
      return P('In a belt of regional metamorphism, index minerals first appear at about these temperatures: chlorite 300 °C, biotite 420 °C, garnet 480 °C, staurolite 560 °C, kyanite 620 °C, sillimanite 680 °C. A shale reached ' + Tq + ' °C. What is the highest-grade index mineral it would contain?', mc(IDX[j][0], wrongs(R, IDX.map(function (q) { return q[0]; }), 3, IDX[j][0])),
        [Tq + ' °C is above ' + lo + ' °C' + (j < IDX.length - 1 ? ' but below ' + hi + ' °C' : '') + '.', 'So ' + IDX[j][0] + ' has appeared, ' + (j < IDX.length - 1 ? 'but ' + IDX[j + 1][0] + ' has not.' : 'the highest-grade mineral on the list.'), 'Mapping where each index mineral first appears draws lines of equal grade across a mountain belt.'],
        'Find the last mineral whose temperature has been passed.', { viz: { name: 'es-interior', opts: { mode: 'geotherm', zones: true, index: true } }, vf: { k: 'index', T: Tq } });
    }
    if (kind === 'order') {
      var set = R.sample(IDX, 4), lab = set.map(function (q, k) { return { L: LET[k], n: q[0], t: q[1] }; }), ord = lab.slice().sort(function (a, b) { return a.t - b.t; });
      return P('Put these index minerals in the order they appear as metamorphic grade increases, lowest grade first. Type the letters (for example, C A D B). ' + lab.map(function (q) { return q.L + ': ' + q.n; }).join('; ') + '.', order(ord.map(function (q) { return q.L; })),
        ['The Barrovian sequence, from low to high grade: chlorite, biotite, garnet, staurolite, kyanite, sillimanite.', 'So: ' + ord.map(function (q) { return q.n + ' (' + q.L + ')'; }).join(', ') + '.'],
        'Chlorite is lowest; sillimanite is highest.', { vf: { k: 'order', lab: lab } });
    }
    if (kind === 'depth') {
      var m = R.pick(IDX.slice(1, 5)), T0 = R.int(10, 20), g = R.pick([25, 30, 35, 40]), z = (m[1] - T0) / g;
      return P(m[0].charAt(0).toUpperCase() + m[0].slice(1) + ' first appears at about ' + m[1] + ' °C. In a mountain belt where the surface is ' + T0 + ' °C and temperature rises ' + g + ' °C per km, about how deep must shale be buried for ' + m[0] + ' to grow?', num(z, 3, 0.02),
        ['Warming needed: $' + m[1] + ' - ' + T0 + ' = ' + (m[1] - T0) + '^\\circ\\text{C}$.', 'Depth: $' + (m[1] - T0) + ' \\div ' + g + ' \\approx ' + fd(z, 1) + '\\,\\text{km}$.'],
        'Find the temperature rise needed, then divide by the gradient.', { unit: 'km', vf: { k: 'depth', T: m[1], T0: T0, g: g } });
    }
    return bankQ(R, [
      ['Slate, phyllite, schist and gneiss are often found in bands across a mountain range. How are they related?', 'They can all be the same parent rock, shale, cooked to higher and higher grade',
        ['They are four unrelated rocks that happened to form together', 'Each one formed from a different kind of magma', 'Gneiss weathers into schist, which weathers into slate'],
        ['Metamorphic grade measures how much heat and pressure a rock has felt.', 'Mapped across a range, shale becomes slate at low grade, then phyllite, schist and gneiss toward the hottest core of the belt.'], 'Think of one rock cooked longer and hotter.'],
      ['As metamorphic grade increases, what happens to the mica crystals in a former shale?', 'They grow larger, from microscopic in slate to large and sparkly in schist',
        ['They shrink and disappear at once', 'They turn into quartz', 'They stay exactly the same size'],
        ['Higher temperature lets atoms move and crystals grow.', 'Slate\'s micas are too small to see; phyllite\'s give a silky sheen; schist\'s are big enough to see and glitter.'], 'Heat lets crystals grow.']
    ], 'why');
  });

  var MPAR = [['limestone', 'marble', 'nonfoliated'], ['quartz sandstone', 'quartzite', 'nonfoliated'], ['shale (at low grade)', 'slate', 'foliated'], ['granite', 'gneiss', 'foliated'], ['bituminous coal', 'anthracite', 'nonfoliated'], ['basalt (at medium grade)', 'amphibolite', 'weakly foliated']];
  G('geology.metamorphic-classification', function (R, ctx) {
    var kind = by(ctx, R.pick(['parent', 'parent', 'foli']), R.pick(['parent', 'reverse', 'test', 'sample']), R.pick(['reverse', 'test', 'sample', 'foli']));
    if (kind === 'parent') {
      var p = R.pick(MPAR.slice(0, 5));
      return P('What metamorphic rock forms from ' + p[0] + '?', mc(p[1], wrongs(R, ['marble', 'quartzite', 'slate', 'gneiss', 'anthracite', 'schist'], 3, p[1])),
        ['Metamorphic rocks keep their parent\'s chemistry while their crystals regrow.', { marble: 'Limestone\'s calcite recrystallizes into interlocking calcite crystals: marble.', quartzite: 'Quartz grains fuse into a hard, interlocking mass: quartzite.', slate: 'At low grade, shale\'s clay turns to tiny micas that line up: slate.', gneiss: 'Granite\'s minerals separate into light and dark bands: gneiss.', anthracite: 'Heat and pressure drive off gases, leaving hard, shiny anthracite, nearly pure carbon.' }[p[1]]],
        'What is the parent rock made of?', { vf: { k: 'parent', ans: p[1] } });
    }
    if (kind === 'reverse') {
      var q = R.pick(MPAR.slice(0, 5).concat([['shale', 'schist', 'foliated']]));
      return P('What was the most likely parent rock of ' + q[1] + '?', mc(q[0].replace(/ \(.*\)/, ''), wrongs(R, ['limestone', 'quartz sandstone', 'shale', 'granite', 'bituminous coal', 'basalt'], 3, q[0].replace(/ \(.*\)/, ''))),
        [{ marble: 'Marble is recrystallized calcite, so its parent was limestone (or dolostone).', quartzite: 'Quartzite is nearly pure quartz, so its parent was quartz sandstone.', slate: 'Slate is fine-grained mica-rich rock that splits into sheets, from shale.', gneiss: 'Gneiss is banded feldspar, quartz and dark minerals; granite (or shale at very high grade) is a common parent.', anthracite: 'Anthracite is the highest rank of coal, from bituminous coal.', schist: 'Schist is rich in visible mica, so its parent was a clay-rich rock: shale.' }[q[1]]],
        'Match the minerals in the metamorphic rock to a parent rock.', { vf: { k: 'reverse' } });
    }
    if (kind === 'test') {
      var t = R.pick([['A pale rock made of interlocking crystals fizzes when a drop of dilute acid touches it.', 'Marble'], ['A pale rock made of interlocking crystals scratches glass and does not fizz in acid; it breaks right through its grains.', 'Quartzite'],
        ['A sandy rock breaks around its grains, which rub off on your fingers.', 'Sandstone (not metamorphosed)'], ['A dark, fine-grained rock splits into thin, flat sheets with a dull surface.', 'Slate']]);
      return P('Which rock is this? ' + t[0], mc(t[1], ['Marble', 'Quartzite', 'Sandstone (not metamorphosed)', 'Slate'].filter(function (x) { return x !== t[1]; })),
        [{ Marble: 'Calcite fizzes in acid and is too soft to scratch glass.', Quartzite: 'Quartz is harder than glass and doesn\'t fizz. In quartzite the grains are welded so tightly that cracks run straight through them.', 'Sandstone (not metamorphosed)': 'In sandstone, cement between the grains is the weak part, so it breaks around the grains.', Slate: 'Slate\'s micas are lined up, so it splits into flat sheets (slaty cleavage).' }[t[1]]],
        'Acid test for calcite; glass test for quartz; how does it break?', { vf: { k: 'test' } });
    }
    if (kind === 'sample') {
      var s = R.pick([['slate', 'dark, fine-grained, splitting into thin flat sheets'], ['phyllite', 'fine-grained with a silky, wavy sheen'], ['schist', 'full of visible, sparkly mica flakes, with some red garnets'], ['gneiss', 'banded in light and dark stripes of coarse crystals'], ['marble', 'white, sugary interlocking crystals that fizz in acid'], ['quartzite', 'hard, glassy interlocking grains that scratch glass']]);
      return P('Name this metamorphic rock: ' + s[1] + '.', mc(s[0], wrongs(R, ['slate', 'phyllite', 'schist', 'gneiss', 'marble', 'quartzite'], 3, s[0])),
        [['slate', 'phyllite', 'schist', 'gneiss'].indexOf(s[0]) >= 0 ? 'It is foliated, and its grain size and sheen place it in the slate–phyllite–schist–gneiss sequence.' : 'It is nonfoliated; its mineral (calcite or quartz) gives the name.', 'This is ' + s[0] + '.'],
        'Foliated or not? Then look at grain size or mineral.', { viz: { name: 'es-rock-key', opts: { sample: s[0], quiet: true, lock: true } }, vf: { k: 'sample' } });
    }
    var f = R.pick([['marble', false], ['quartzite', false], ['hornfels', false], ['slate', true], ['schist', true], ['gneiss', true], ['phyllite', true]]);
    return P('Is ' + f[0] + ' foliated?', mc(f[1] ? 'Yes: its minerals are lined up in layers or bands' : 'No: its crystals are interlocked with no layering', [f[1] ? 'No: its crystals are interlocked with no layering' : 'Yes: its minerals are lined up in layers or bands', 'Only when it is wet', 'Only near the surface']),
      [f[1] ? f[0].charAt(0).toUpperCase() + f[0].slice(1) + ' grew from a clay-rich rock under directed stress, so its platy minerals lined up: it is foliated.' : f[0].charAt(0).toUpperCase() + f[0].slice(1) + ' is made mostly of minerals without a flat shape (calcite, quartz) or formed without strong directed stress, so it is nonfoliated.'],
      'Platy minerals plus directed stress make foliation.', { vf: { k: 'foli' } });
  });

  G('geology.metamorphic-settings', function (R, ctx) {
    var kind = by(ctx, R.pick(['setting', 'setting', 'why']), R.pick(['setting', 'class', 'why']), R.pick(['grad', 'class', 'setting']));
    var S = [['Limestone right next to a granite pluton, a few kilometers deep, has turned to marble with new minerals, but only within a few hundred meters of the contact.', 'Contact metamorphism'],
      ['Shale across a whole mountain belt, hundreds of kilometers long, has become slate, schist and gneiss.', 'Regional metamorphism'],
      ['Basalt of the ocean floor has become blueschist, a rock that forms at high pressure but low temperature.', 'Subduction-zone metamorphism'],
      ['Hot seawater circulating through new ocean crust at a mid-ocean ridge has changed its minerals.', 'Hydrothermal metamorphism'],
      ['Quartz grains at a meteorite crater are crisscrossed with microscopic shock lines.', 'Impact (shock) metamorphism']];
    if (kind === 'setting') {
      var s = R.pick(S);
      return P('What kind of metamorphism is this? ' + s[0], mc(s[1], S.filter(function (q) { return q !== s; }).map(function (q) { return q[1]; })),
        [{ 'Contact metamorphism': 'Heat from a nearby intrusion bakes the rock beside it; the effect fades within a zone (an aureole) around the contact. It can happen at shallow depth.', 'Regional metamorphism': 'When plates collide, huge volumes of crust are buried, heated and squeezed together, so whole regions are changed.', 'Subduction-zone metamorphism': 'A cold slab sinks fast: it reaches great depth (high pressure) before it can heat up (low temperature).', 'Hydrothermal metamorphism': 'Hot, chemically active water changes the minerals of the rock it flows through.', 'Impact (shock) metamorphism': 'A meteorite impact delivers enormous pressure for a split second.' }[s[1]]],
        'What supplied the heat, the pressure, or the fluids?', { vf: { k: 'setting' } });
    }
    var PT = R.pick([[300, 1.0], [350, 1.2], [400, 1.4], [250, 0.8], [500, 0.6], [600, 0.8], [650, 0.7], [550, 0.5], [450, 0.5], [500, 0.1], [600, 0.15], [450, 0.1], [650, 0.2]]);
    var T1 = PT[0], Pg = PT[1], z = Pg * 1e9 / (2800 * GRAV) / 1000, gr = T1 / z;
    var cls = gr <= 12 ? 'Subduction zone (high pressure, low temperature)' : gr < 40 ? 'Regional metamorphism in a mountain belt' : 'Contact metamorphism near an intrusion';
    if (kind === 'grad') {
      return P('A metamorphic rock formed at about ' + T1 + ' °C and ' + fd(Pg, 2) + ' GPa. Using rock density 2,800 kg/m³ and $g = 9.8\\,\\text{m/s}^2$, find its burial depth, then the average temperature rise per kilometer it implies (°C/km, counting from 0 °C at the surface).', num(gr, 3, 0.02),
        ['Depth: $h = \\dfrac{P}{\\rho g} = \\dfrac{' + fx(Pg * 1e9, 3) + '}{2,800 \\times 9.8} \\approx ' + fd(z, 1) + '\\,\\text{km}$.', 'Gradient: $\\dfrac{' + T1 + '}{' + fd(z, 1) + '} \\approx ' + fd(gr, 1) + '^\\circ\\text{C/km}$.', 'Low gradients (about 10 °C/km or less) mean subduction; about 20 to 35 °C/km fits regional metamorphism; much higher fits contact metamorphism near magma.'],
        'Find the depth from $P = \\rho g h$, then divide the temperature by the depth.', { unit: '°C/km', vf: { k: 'grad', T: T1, P: Pg } });
    }
    if (kind === 'class') {
      return P('A metamorphic rock formed at about ' + T1 + ' °C and ' + fd(Pg, 2) + ' GPa (a depth of about ' + fd(z, 0) + ' km). That means temperature rose about ' + fd(gr, 0) + ' °C per km on the way down. Which setting fits best?', mc(cls, ['Subduction zone (high pressure, low temperature)', 'Regional metamorphism in a mountain belt', 'Contact metamorphism near an intrusion'].filter(function (x) { return x !== cls; }).concat(['Weathering at the surface'])),
        ['Compare the gradient with the settings: about 10 °C/km or less is subduction, about 20 to 35 °C/km is regional, much higher is contact.', fd(gr, 0) + ' °C/km fits: ' + cls.charAt(0).toLowerCase() + cls.slice(1) + '.'],
        'Is the rock unusually cold or hot for its depth?', { vf: { k: 'class', gr: gr } });
    }
    return bankQ(R, [
      ['Does all metamorphism need deep burial?', 'No; a hot intrusion can bake the rock beside it close to the surface',
        ['Yes; rock must be at least 20 km down', 'Yes; only pressure can change minerals', 'No; metamorphism happens only at the surface'],
        ['Contact metamorphism needs heat, not great depth.', 'Magma at 700 to 1,200 °C can bake shale into hornfels and limestone into marble just a few kilometers down, within a zone around the intrusion.'], 'What can supply heat besides depth?'],
      ['Why does blueschist form only at subduction zones?', 'A sinking slab reaches high pressure quickly while staying cold, an unusual combination',
        ['Because seawater turns rocks blue', 'Because subduction zones are the hottest places in the crust', 'Because blueschist needs sunlight'],
        ['In most places, rock that goes deeper also gets hotter.', 'A cold ocean plate sinks faster than heat can warm it, so it meets high pressure at low temperature, the conditions for blue amphibole (glaucophane).'], 'Think about how fast a slab sinks compared with how fast it warms.']
    ], 'why');
  });

// ---- 06_deformation.js
  // =====================================================================================
  // Unit 6: Folds and Faults
  // =====================================================================================

  G('geology.stress-strain', function (R, ctx) {
    var kind = by(ctx, R.pick(['type', 'strain', 'brittle']), R.pick(['strain', 'newlen', 'type', 'brittle']), R.pick(['strain', 'bdt', 'bdt', 'newlen']));
    if (kind === 'strain') {
      var ext = R.coin(), L0 = R.pick([20, 40, 50, 60, 80, 100, 120]), f = R.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), L = ext ? L0 * (1 + f) : L0 * (1 - f);
      return P(ext ? 'A stretch of crust ' + L0 + ' km wide is pulled apart in a rift until it is ' + fd(L, 1) + ' km wide. By what percent was it extended?' : 'Folding and faulting squeeze a belt of rock layers that was ' + L0 + ' km wide down to ' + fd(L, 1) + ' km. By what percent was it shortened?', pnum(f * 100, 3, 0.005),
        ['Strain is the change in length divided by the original length.', (ext ? '$\\dfrac{' + fd(L, 1) + ' - ' + L0 + '}{' + L0 + '}' : '$\\dfrac{' + L0 + ' - ' + fd(L, 1) + '}{' + L0 + '}') + ' = \\dfrac{' + fd(M.abs(L - L0), 1) + '}{' + L0 + '} = ' + fd(f, 2) + '$, or $' + fd(f * 100, 0) + '\\%$.'],
        'Divide the change in length by the original length.', { unit: '%', vf: { k: 'strain', L0: L0, L: L } });
    }
    if (kind === 'newlen') {
      var L1 = R.pick([60, 100, 150, 200, 300]), pc = R.pick([20, 30, 40, 50, 60]), Ln = L1 * (1 - pc / 100);
      return P('A mountain belt shortened its crust by ' + pc + '%. If the rocks were ' + L1 + ' km wide before the collision, how wide are they now?', num(Ln, 3, 0.01),
        ['Shortening of ' + pc + '% leaves $' + (100 - pc) + '\\%$ of the width.', '$' + L1 + ' \\times ' + fd(1 - pc / 100, 2) + ' = ' + fd(Ln, 1) + '\\,\\text{km}$.', 'The rock did not vanish: the crust got thicker as it got narrower.'],
        'Find the fraction that remains.', { unit: 'km', vf: { k: 'newlen', L: L1, pc: pc } });
    }
    if (kind === 'type') {
      var t = R.pick([['Two plates push straight toward each other.', 'Compression: it shortens the crust, making folds and reverse faults'], ['A continent is pulled apart.', 'Tension: it stretches the crust, making normal faults'], ['Two plates slide sideways past each other.', 'Shear: it makes strike-slip faults']]);
      return P(t[0] + ' What kind of stress acts on the rock, and what does it tend to make?', mc(t[1], ['Compression: it shortens the crust, making folds and reverse faults', 'Tension: it stretches the crust, making normal faults', 'Shear: it makes strike-slip faults', 'No stress: rock is too strong to deform'].filter(function (x) { return x !== t[1]; })),
        ['Stress is force per area. Its direction decides how rock deforms (its strain).', t[1] + '.'], 'Squeezed, stretched or slid past?', { vf: { k: 'type' } });
    }
    if (kind === 'bdt') {
      var T0 = R.int(10, 20), g = R.pick([20, 25, 30, 35]), z = (300 - T0) / g;
      return P('Quartz-rich crust changes from brittle (it breaks, causing earthquakes) to ductile (it flows) at about 300 °C. With a surface temperature of ' + T0 + ' °C and a gradient of ' + g + ' °C per km, about how deep is that change?', num(z, 3, 0.02),
        ['Warming needed: $300 - ' + T0 + ' = ' + (300 - T0) + '^\\circ\\text{C}$.', 'Depth: $' + (300 - T0) + ' \\div ' + g + ' \\approx ' + fd(z, 1) + '\\,\\text{km}$.', 'That is why most continental earthquakes start in the top 10 to 20 km: below that, the rock flows instead of breaking.'],
        'Find the depth where the rock reaches 300 °C.', { unit: 'km', vf: { k: 'bdt', T0: T0, g: g } });
    }
    return bankQ(R, [
      ['Which conditions make rock more likely to bend (ductile) instead of break (brittle)?', 'High temperature, high confining pressure and slow deformation, as deep in the crust',
        ['Low temperature and fast deformation, as near the surface', 'Dry air and sunlight', 'Being made of quartz, at any depth'],
        ['Cold rock deformed quickly snaps, like a candy bar from the freezer.', 'Hot rock under high pressure, deformed over millions of years, flows like warm wax and folds without breaking.'], 'Think of warm wax versus cold wax.'],
      ['A student says solid rock can\'t bend. What do folded rock layers in mountains show?', 'Given heat, pressure and time, solid rock can deform slowly without breaking',
        ['The layers were laid down already folded', 'The rock was melted when it folded', 'Folds are an illusion of erosion'],
        ['Deep in the crust, rock is hot and squeezed on all sides.', 'Over millions of years, crystals slide and regrow, and whole layers fold like a rug pushed across the floor, while staying solid.'], 'Look at how slowly it happens.']
    ], 'brittle');
  });

  G('geology.folds', function (R, ctx) {
    var kind = by(ctx, R.pick(['pattern', 'dips', 'picture']), R.pick(['pattern', 'circle', 'picture', 'dips']), R.pick(['pattern', 'shorten', 'circle', 'why']));
    if (kind === 'pattern') {
      var anti = R.coin(), base = R.pick([250, 300, 350, 400, 420]), step = R.pick([10, 15, 20, 25]), n = R.int(2, 3), ages = [];
      for (var i = n; i >= 0; i--) ages.push(anti ? base - i * step : base + i * step);
      var seq = ages.concat(ages.slice(0, -1).reverse());
      return P('Walking from west to east across a flat plain, a geologist crosses rock layers with these ages (million years): ' + seq.join(', ') + '. The layers on each side are mirror images. What kind of fold lies under the plain?', mc(anti ? 'An anticline: oldest rocks in the middle' : 'A syncline: youngest rocks in the middle', [anti ? 'A syncline: youngest rocks in the middle' : 'An anticline: oldest rocks in the middle', 'A fault, because the ages repeat', 'No fold; the layers are flat']),
        ['The ages repeat in mirror image, so the layers bend down on both sides of a middle line (or up).', anti ? 'The oldest rock (' + ages[ages.length - 1] + ' million years) is in the middle: the layers arched up and the top was worn flat, exposing the core. That is an anticline.' : 'The youngest rock (' + ages[ages.length - 1] + ' million years) is in the middle: the layers sagged down, keeping the youngest in the trough. That is a syncline.', 'The land is flat, so you can\'t tell from hills and valleys; the pattern of ages tells you.'],
        'Is the oldest or the youngest rock in the middle?', { vf: { k: 'pattern', anti: anti } });
    }
    if (kind === 'dips') {
      var away = R.coin();
      return P('On both sides of a line through a field, the rock layers tilt ' + (away ? 'down away from the line' : 'down toward the line') + '. What kind of fold is it?', mc(away ? 'An anticline' : 'A syncline', [away ? 'A syncline' : 'An anticline', 'A monocline with one tilted side', 'A normal fault']),
        [away ? 'Layers that slope away from the middle on both sides form an arch: an anticline.' : 'Layers that slope toward the middle from both sides form a trough: a syncline.', 'Dip directions are measured in the field with a compass; they find folds even where erosion has flattened the land.'],
        'Sketch the layers on each side.', { vf: { k: 'dips', away: away } });
    }
    if (kind === 'picture') {
      var ty = R.pick(['anticline', 'syncline', 'dome', 'basin']);
      return P('This block of rock was folded and its top worn flat. Which kind of fold is it? (In the picture, darker or lower layers are older.)', mc({ anticline: 'Anticline', syncline: 'Syncline', dome: 'Dome', basin: 'Basin' }[ty], ['Anticline', 'Syncline', 'Dome', 'Basin'].filter(function (x) { return x.toLowerCase() !== ty; })),
        ['Look at the side of the block for the shape of the layers, and at the top for the pattern.', { anticline: 'The layers arch up into a ridge-shaped fold, with the oldest layer in a stripe down the middle: an anticline.', syncline: 'The layers sag down into a trough, with the youngest layer in the middle: a syncline.', dome: 'The layers arch up in every direction, leaving rings with the oldest in the center: a dome.', basin: 'The layers sag down in every direction, leaving rings with the youngest in the center: a basin.' }[ty]],
        'Stripes or rings? Oldest or youngest in the middle?', { viz: { name: 'es-structures', opts: { mode: 'fold', type: ty, erosion: 0.6, quiet: true, lock: true } }, vf: { k: 'picture', ty: ty } });
    }
    if (kind === 'circle') {
      var dome = R.coin();
      return P('On a geologic map, rock layers form rings around a point. The ' + (dome ? 'oldest' : 'youngest') + ' rocks are in the center, and the layers get ' + (dome ? 'younger' : 'older') + ' outward. What structure is this?', mc(dome ? 'A dome' : 'A basin', [dome ? 'A basin' : 'A dome', 'An anticline', 'A volcano']),
        ['Rings instead of stripes mean the fold bends the same way in every direction.', dome ? 'Oldest in the center means the layers bulge up: a dome. (The Black Hills of South Dakota are an eroded dome.)' : 'Youngest in the center means the layers sag down: a basin. (The Michigan Basin is one.)'],
        'An anticline in every direction is a dome.', { vf: { k: 'circle', dome: dome } });
    }
    if (kind === 'shorten') {
      var Lb = R.pick([12, 15, 18, 20, 24, 30]), fr = R.pick([0.5, 0.6, 0.7, 0.75, 0.8]), Lh = Lb * fr;
      return P('Measured along its curves, a folded sandstone bed is ' + Lb + ' km long. Today it spans only ' + fd(Lh, 1) + ' km across the map. By what percent was the crust shortened?', pnum((1 - fr) * 100, 3, 0.005),
        ['Before folding, the bed lay flat and spanned its full length, ' + Lb + ' km.', 'Shortening: $\\dfrac{' + Lb + ' - ' + fd(Lh, 1) + '}{' + Lb + '} = ' + fd(1 - fr, 2) + '$, or $' + fd((1 - fr) * 100, 0) + '\\%$.'],
        'The bed\'s length along the folds is its original width.', { unit: '%', vf: { k: 'shorten', Lb: Lb, Lh: Lh } });
    }
    return bankQ(R, [
      ['Is an anticline always a hill and a syncline always a valley?', 'No; erosion often wears the land flat, so folds are found from the pattern of rock ages, not the shape of the land',
        ['Yes; that is how they are defined', 'Yes, unless it has rained recently', 'No; anticlines are always valleys'],
        ['Folds are defined by how the layers bend, not by the landscape.', 'Erosion may plane them flat, or even carve a valley into an anticline\'s weak, broken crest.', 'Look for the oldest rocks in the middle (anticline) or the youngest (syncline).'], 'What defines a fold: the land or the layers?']
    ], 'why');
  });

  G('geology.faults', function (R, ctx) {
    var kind = by(ctx, R.pick(['desc', 'picture', 'stress']), R.pick(['picture', 'desc', 'lateral', 'stress']), R.pick(['throw', 'throw', 'picture', 'lateral']));
    if (kind === 'desc') {
      var t = R.pick([['the hanging wall moved down compared with the footwall', 'Normal fault'], ['the hanging wall moved up compared with the footwall, along a fault dipping about 60°', 'Reverse fault'], ['the hanging wall moved up compared with the footwall, along a fault dipping only about 20°', 'Thrust fault'], ['the two blocks slid sideways past each other along a vertical fault', 'Strike-slip fault']]);
      return P('Along a fault, ' + t[0] + '. What kind of fault is it?', mc(t[1], ['Normal fault', 'Reverse fault', 'Thrust fault', 'Strike-slip fault'].filter(function (x) { return x !== t[1]; })),
        ['The hanging wall is the block above a sloping fault; the footwall is below it (you could stand on the footwall and hang a lantern from the hanging wall).', { 'Normal fault': 'Hanging wall down: the crust was pulled apart, so it is a normal fault.', 'Reverse fault': 'Hanging wall up along a steep fault: the crust was squeezed, a reverse fault.', 'Thrust fault': 'Hanging wall up along a gently dipping fault: a thrust fault, a low-angle reverse fault that can push old rock over young rock.', 'Strike-slip fault': 'Sideways motion along a vertical fault: a strike-slip fault.' }[t[1]]],
        'Which way did the hanging wall move?', { vf: { k: 'desc' } });
    }
    if (kind === 'picture') {
      var ty = R.pick(['normal', 'reverse', 'right-lateral', 'left-lateral']);
      var nm = { normal: 'Normal fault', reverse: 'Reverse fault', 'right-lateral': 'Right-lateral strike-slip fault', 'left-lateral': 'Left-lateral strike-slip fault' };
      return P('The picture shows a block of layered rock after a fault slipped. What kind of fault is it? (For a strike-slip fault, imagine standing on one block looking across at the other.)', mc(nm[ty], Object.keys(nm).filter(function (k) { return k !== ty; }).map(function (k) { return nm[k]; })),
        [ty.indexOf('lateral') >= 0 ? 'The blocks slid sideways: the offset road shows it.' : 'Find the block above the sloping fault plane (the hanging wall) and see which way it moved compared with the footwall.',
          { normal: 'The hanging wall slid down: a normal fault, from tension.', reverse: 'The hanging wall was pushed up: a reverse fault, from compression.', 'right-lateral': 'Looking across the fault, the far block moved to the right: right-lateral.', 'left-lateral': 'Looking across the fault, the far block moved to the left: left-lateral.' }[ty]],
        'Hanging wall down: normal. Up: reverse. Sideways: strike-slip.', { viz: { name: 'es-structures', opts: { mode: 'fault', type: ty, slip: 40, quiet: true, lock: true } }, vf: { k: 'picture', ty: ty } });
    }
    if (kind === 'stress') {
      var s = R.pick([['pulled apart (tension)', 'Normal faults'], ['squeezed together (compression)', 'Reverse and thrust faults'], ['sheared sideways', 'Strike-slip faults']]);
      return P('Crust that is ' + s[0] + ' tends to break along which kind of faults?', mc(s[1], ['Normal faults', 'Reverse and thrust faults', 'Strike-slip faults', 'No faults; only folds'].filter(function (x) { return x !== s[1]; })),
        [{ 'Normal faults': 'Stretching lets the hanging wall slide down, lengthening the crust (as in the Basin and Range of Nevada).', 'Reverse and thrust faults': 'Squeezing pushes the hanging wall up and over, shortening and thickening the crust (as in the Himalayas and the Rockies).', 'Strike-slip faults': 'Shear moves the blocks sideways (as along the San Andreas Fault).' }[s[1]]],
        'Does the crust get longer, shorter, or just slide?', { vf: { k: 'stress' } });
    }
    if (kind === 'lateral') {
      var right = R.coin();
      return P('A fence was built straight across a strike-slip fault. After an earthquake, you stand on one side and see that the far part of the fence has moved ' + (right ? 'to your right' : 'to your left') + '. A friend on the other side looks back at your side. Which way does your part look to have moved to the friend, and what kind of fault is it?', mc((right ? 'To the friend\'s right; it is a right-lateral fault' : 'To the friend\'s left; it is a left-lateral fault'), [(right ? 'To the friend\'s left; it is a left-lateral fault' : 'To the friend\'s right; it is a right-lateral fault'), (right ? 'To the friend\'s left; it is a right-lateral fault' : 'To the friend\'s right; it is a left-lateral fault'), 'It depends on the friend\'s height']),
        ['The name doesn\'t depend on which side you stand on: from either side, the far block moves the same way.', 'So both see the far block move ' + (right ? 'right' : 'left') + ': a ' + (right ? 'right' : 'left') + '-lateral fault.' + (right ? ' The San Andreas Fault is right-lateral.' : '')],
        'Try it with two pencils on a table.', { vf: { k: 'lateral', right: right } });
    }
    var sl = R.pick([10, 20, 30, 40, 50, 80, 100]), dp = R.pick([30, 45, 50, 60, 70]), thr = sl * M.sin(dp * RAD), hv = sl * M.cos(dp * RAD), askT = R.coin();
    return P('A normal fault dips ' + dp + '°. The hanging wall slid ' + sl + ' m straight down the fault plane. How far did it move ' + (askT ? 'vertically (the throw)' : 'horizontally (the heave)') + '?', num(askT ? thr : hv, 3, 0.01),
      ['The slip is the hypotenuse of a right triangle; the fault\'s dip is the angle at the bottom.', askT ? 'Vertical part: $' + sl + ' \\sin ' + dp + '^\\circ = ' + sl + ' \\times ' + fd(M.sin(dp * RAD), 4) + ' = ' + fd(thr, 1) + '\\,\\text{m}$.' : 'Horizontal part: $' + sl + ' \\cos ' + dp + '^\\circ = ' + sl + ' \\times ' + fd(M.cos(dp * RAD), 4) + ' = ' + fd(hv, 1) + '\\,\\text{m}$.', askT ? 'The ground on the hanging wall dropped about ' + fd(thr, 0) + ' m.' : 'The crust was stretched about ' + fd(hv, 0) + ' m.'],
      'Vertical: slip × sin(dip). Horizontal: slip × cos(dip).', { unit: 'm', vf: { k: askT ? 'throw' : 'heave', s: sl, d: dp } });
  });

  var COMPASS = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
  function compass8(az) { return COMPASS[M.round(((az % 360) + 360) % 360 / 45) % 8]; }
  function quad(az) { az = ((az % 360) + 360) % 360; if (az <= 90) return 'N' + az + '°E'; if (az < 180) return 'S' + (180 - az) + '°E'; if (az <= 270) return 'S' + (az - 180) + '°W'; return 'N' + (360 - az) + '°W'; }
  G('geology.strike-dip', function (R, ctx) {
    var kind = by(ctx, R.pick(['depth', 'depth', 'concept']), R.pick(['depth', 'dipdir', 'thick', 'concept']), R.pick(['dipdir', 'thick', 'depth', 'depth3']));
    if (kind === 'depth' || kind === 'depth3') {
      var dip = R.pick([10, 15, 20, 25, 30, 35, 40, 45, 50]), dist = R.pick([100, 150, 200, 250, 300, 400, 500]), z = dist * M.tan(dip * RAD);
      var q = kind === 'depth3' ? 'A coal seam crops out at the surface, strikes N–S and dips ' + dip + '° to the east. A well is drilled straight down ' + dist + ' m east of the outcrop, on level ground. At what depth will it reach the seam?' : 'A layer of sandstone crops out on level ground and dips ' + dip + '°. How deep is the layer ' + dist + ' m away from the outcrop, measured straight down the dip direction (at a right angle to the strike)?';
      return P(q, num(z, 3, 0.01),
        ['Draw a right triangle in the vertical plane of the dip: the horizontal side is ' + dist + ' m, the angle at the outcrop is the dip, ' + dip + '°, and the depth is the side opposite that angle.', '$\\tan ' + dip + '^\\circ = \\dfrac{\\text{depth}}{' + dist + '}$, so depth $= ' + dist + ' \\tan ' + dip + '^\\circ = ' + dist + ' \\times ' + fd(M.tan(dip * RAD), 4) + ' = ' + fd(z, 1) + '\\,\\text{m}$.'],
        'Depth = horizontal distance × tan(dip).', kind === 'depth3' ? { unit: 'm', viz: { name: 'es-structures', opts: { mode: 'strikedip', strike: 0, dip: dip, distance: dist, quiet: true, lock: true } }, vf: { k: 'depth', dip: dip, d: dist } } : { unit: 'm', vf: { k: 'depth', dip: dip, d: dist } });
    }
    if (kind === 'dipdir') {
      var st = R.pick([10, 20, 30, 40, 50, 60, 70, 80, 100, 110, 120, 130, 140, 150, 160, 170]), side = R.coin() ? 90 : -90, dd = ((st + side) % 360 + 360) % 360;
      return P('A rock layer strikes ' + quad(st) + ' (azimuth ' + T.commas(st) + '°) and dips toward the ' + compass8(dd) + '. What is its dip direction as an azimuth (degrees clockwise from north, 0 to 360)?', { t: 'num', v: String(dd), tol: 0.5 },
        ['The dip direction is always at a right angle to the strike, so it is $' + st + '^\\circ + 90^\\circ = ' + ((st + 90) % 360) + '^\\circ$ or $' + st + '^\\circ - 90^\\circ = ' + (((st - 90) % 360) + 360) % 360 + '^\\circ$.', 'Of those two, the one toward the ' + compass8(dd) + ' is $' + dd + '^\\circ$ (' + quad(dd) + ').'],
        'Add or subtract 90° from the strike, then pick the side named.', { unit: '°', vf: { k: 'dipdir', st: st, dd: dd } });
    }
    if (kind === 'thick') {
      var dp = R.pick([20, 30, 40, 45, 60, 70]), w = R.pick([20, 30, 40, 50, 80, 100]), t = w * M.sin(dp * RAD);
      return P('On level ground, a tilted limestone layer crops out in a band ' + w + ' m wide, measured at a right angle to its strike. It dips ' + dp + '°. What is the layer\'s true thickness?', num(t, 3, 0.01),
        ['True thickness is measured at a right angle to the layer itself.', 'In the cross-section, the outcrop width is the hypotenuse and the thickness is the side opposite the dip angle: $t = w \\sin\\delta$.', '$t = ' + w + ' \\sin ' + dp + '^\\circ = ' + w + ' \\times ' + fd(M.sin(dp * RAD), 4) + ' = ' + fd(t, 1) + '\\,\\text{m}$. A gently dipping layer makes a wide outcrop band even when it is thin.'],
        'Thickness = outcrop width × sin(dip).', { unit: 'm', vf: { k: 'thick', dp: dp, w: w } });
    }
    return bankQ(R, [
      ['A layer strikes north–south. Which way can it dip?', 'East or west, at a right angle to the strike',
        ['North or south, along the strike', 'Any direction at all', 'Only straight down'],
        ['Strike is the direction of a level line on the tilted surface, like the shoreline where a sloping roof would meet a flood.', 'Water poured on the surface runs straight downhill, at a right angle to that line: that is the dip direction.'], 'Picture water running down the tilted layer.'],
      ['What is the strike of a tilted rock layer?', 'The compass direction of a horizontal line on the layer\'s surface',
        ['The direction the layer slopes downward', 'The steepness of the layer', 'The direction of the nearest fault'],
        ['Imagine the tilted layer meeting a perfectly flat lake surface: the shoreline is a horizontal line, and its compass direction is the strike.', 'The dip is the angle the layer slopes down from horizontal, measured at a right angle to the strike.'], 'Think of where a flat lake would meet the layer.']
    ], 'concept');
  });

// ---- 07_time.js
  // =====================================================================================
  // Unit 7: Geologic Time
  // =====================================================================================

  /* es-strata letters: the kit letters the features of a cross-section (deposits, lava, intrusions, faults and buried
     erosion surfaces) in a shuffled order, using its own seeded random numbers (mulberry32, seed × 31 + 5).
     We repeat the same steps here so the answer matches the picture (checked in the browser test). */
  function kitRng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = M.imul(t ^ t >>> 15, t | 1); t ^= t + M.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function strataLetters(ev, seed) {
    var feats = [];
    ev.forEach(function (e, i) { if (e.t === 'deposit' || e.t === 'lava' || e.t === 'intrude' || e.t === 'fault') feats.push(i); else if (e.t === 'erode' && ev.slice(i + 1).some(function (q) { return q.t === 'deposit' || q.t === 'lava'; })) feats.push(i); });
    var rs = kitRng(seed * 31 + 5), perm = feats.slice(), out = {};
    for (var p = perm.length - 1; p > 0; p--) { var q = M.floor(rs() * (p + 1)), tq = perm[p]; perm[p] = perm[q]; perm[q] = tq; }
    perm.forEach(function (fi, li) { out[fi] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[li]; });
    return { feats: feats, of: out };
  }
  var ROCKS = ['sandstone', 'shale', 'limestone', 'siltstone', 'conglomerate'];
  function rockSeq(R, n) { var out = [], last = ''; for (var i = 0; i < n; i++) { var r; do { r = R.pick(ROCKS); } while (r === last); out.push(r); last = r; } return out; }
  /* a random history whose order can be read without doubt from the picture */
  function history(R, opt) {
    opt = opt || {};
    var ev = [], nLow = opt.nLow || R.int(3, 4), nUp = opt.nUp || R.int(1, 2), low = rockSeq(R, nLow), up = rockSeq(R, nUp);
    low.forEach(function (r) { ev.push({ t: 'deposit', rock: r, thick: R.real(0.08, 0.11, 2) }); });
    var def = opt.def || R.pick(['tilt', 'tilt', 'fold', 'none']), deg = R.sign() * R.int(14, 24);
    if (def === 'tilt') ev.push({ t: 'tilt', deg: deg }); else if (def === 'fold') ev.push({ t: 'fold', amp: R.real(0.05, 0.08, 2), wave: R.real(1.3, 1.8, 2), phase: R.real(0, 6, 1) });
    // an early dike must cut every lower layer and be cut off by the erosion surface, so it goes where all the lower
    // layers survive erosion: on the side the tilt lowered (layers rise to the right for a positive tilt), never in a fold
    var early = def === 'fold' ? false : opt.early != null ? opt.early : R.chance(0.5);
    if (early) ev.push({ t: 'intrude', kind: 'dike', x: def === 'tilt' ? (deg > 0 ? R.real(0.35, 0.65, 2) : R.real(1.35, 1.65, 2)) : R.real(0.5, 1.5, 2), w: 0.1 });
    ev.push(def === 'none' ? { t: 'erode', depth: R.real(0.03, 0.04, 2), amp: 0.008, phase: R.real(0, 6, 1) } : { t: 'erode', depth: R.real(0.05, 0.07, 2), phase: R.real(0, 6, 1) });
    up.forEach(function (r) { ev.push({ t: 'deposit', rock: r, thick: R.real(0.07, 0.1, 2) }); });
    var last = opt.last || R.pick(['none', 'dike', 'fault', 'fault']);
    // the land surface after the last deposit (the kit starts at 0.08; an erosion surface leaves its level plus 0.012 of relief)
    var lev = 0.08; ev.forEach(function (e) { if (e.t === 'deposit') lev += e.thick; else if (e.t === 'erode') lev = lev - e.depth + (e.amp == null ? 0.012 : e.amp); });
    if (last === 'dike') ev.push({ t: 'intrude', kind: 'dike', x: R.real(0.4, 1.6, 2), w: 0.1, ztop: r2(lev, 4) });
    if (last === 'fault') ev.push({ t: 'fault', x: R.real(0.6, 1.4, 2), dip: 60, dipDir: R.coin() ? 'left' : 'right', kind: R.coin() ? 'normal' : 'reverse', slip: 0.06 });
    return { ev: ev, def: def, early: early, last: last };
  }
  function featName(e) { return e.t === 'deposit' ? 'a layer of ' + e.rock : e.t === 'lava' ? 'a lava flow' : e.t === 'intrude' ? 'a ' + e.kind : e.t === 'fault' ? 'a ' + e.kind + ' fault' : 'an erosion surface (unconformity)'; }

  var PRIN = [['Original horizontality', 'Sediment settles in flat, horizontal layers, so tilted or folded layers were disturbed after they formed.'],
    ['Superposition', 'In undisturbed layers, each layer is younger than the one below it and older than the one above.'],
    ['Lateral continuity', 'Layers spread out sideways until they thin out, so matching layers on both sides of a canyon were once connected.'],
    ['Cross-cutting relationships', 'A feature that cuts across rock, such as a dike or fault, is younger than the rock it cuts.'],
    ['Inclusions', 'Pieces of one rock inside another are older than the rock that holds them.'],
    ['Faunal succession', 'Fossils appear in a definite order through the layers, so a fossil assemblage marks a span of time.']];
  G('geology.steno-principles', function (R, ctx) {
    var kind = by(ctx, R.pick(['which', 'which', 'incl']), R.pick(['which', 'order', 'incl', 'tilted']), R.pick(['order', 'order', 'incl', 'which']));
    if (kind === 'which') {
      var S = [['Layers on both sides of a canyon match, so they were once one continuous sheet that the river cut through.', 'Lateral continuity'], ['A dike cuts through three sandstone layers, so it is younger than all three.', 'Cross-cutting relationships'],
        ['Rounded pieces of granite are found in the conglomerate above the granite, so the granite is older.', 'Inclusions'], ['Rock layers that now stand nearly vertical must have been tilted after they were deposited.', 'Original horizontality'],
        ['Trilobite fossils are always found below dinosaur fossils, never above them, wherever both occur.', 'Faunal succession'], ['In a flat stack of layers, the shale at the bottom is the oldest.', 'Superposition']];
      var s = R.pick(S);
      return P('Which principle is used here? ' + s[0], mc(s[1], wrongs(R, PRIN.map(function (q) { return q[0]; }), 3, s[1])),
        [PRIN.filter(function (q) { return q[0] === s[1]; })[0][1]], 'Match the reasoning to the principle.', { vf: { k: 'which' } });
    }
    if (kind === 'incl') {
      var gAbove = R.coin();
      return P('A body of granite is in contact with a sandstone layer. ' + (gAbove ? 'The granite holds broken chunks of the sandstone, and the sandstone next to it is baked.' : 'The sandstone holds rounded pebbles of the granite, and the sandstone at the contact is not baked.') + ' Which rock is older?', mc(gAbove ? 'The sandstone' : 'The granite', [gAbove ? 'The granite' : 'The sandstone', 'They formed at the same time', 'You can\'t tell without radiometric dating']),
        ['Principle of inclusions: pieces of a rock inside another rock are older than the rock that holds them.', gAbove ? 'The granite magma broke off pieces of sandstone and baked it, so the sandstone was there first: the granite intruded later.' : 'The granite was exposed and eroded into pebbles before the sand was laid on top, so the granite is older. The unbaked contact is a buried erosion surface.'],
        'Whatever is broken into pieces had to exist first.', { vf: { k: 'incl', gAbove: gAbove } });
    }
    if (kind === 'tilted') return P('Rock layers in a cliff tilt at 40°. A student says the sediment must have settled on a 40° slope. What does the principle of original horizontality say?', mc('The layers were laid down flat and tilted later', ['The student is right: sediment often settles on steep slopes', 'The layers were tilted while they were being deposited', 'Tilted layers must be igneous rock']),
      ['Loose sediment settles under gravity into nearly flat layers on the floor of a sea, lake or river.', 'So a steep tilt means something happened afterward: the crust was tilted or folded.'], 'How does sand settle in still water?', { vf: { k: 'tilted' } });
    var h = history(R, { last: R.pick(['none', 'dike']), early: false, def: R.pick(['none', 'tilt']), nUp: 1 }), seed = R.int(1, 999), L = strataLetters(h.ev, seed);
    var ord = L.feats.map(function (i) { return L.of[i]; }), all = ord.slice().sort();
    return P('The cross-section shows features ' + U.list(all) + '. List them from oldest to youngest. Type the letters (for example, ' + R.shuffle(all).join(' ') + ').', order(ord),
      ['Superposition: start at the bottom layer and work up.', h.def === 'tilt' ? 'Original horizontality: the lower layers were laid flat, then tilted before the erosion surface cut across them.' : 'The layers below the erosion surface came first, then the erosion surface, then the layers above it.', h.last === 'dike' ? 'Cross-cutting: the dike cuts every layer, so it is youngest.' : 'Nothing cuts the top layer, so it is youngest.', 'Order: ' + ord.join(', ') + ' (' + L.feats.map(function (i) { return featName(h.ev[i]); }).join('; ') + ').'],
      'Bottom to top, then anything that cuts across comes after what it cuts.', { viz: { name: 'es-strata', opts: { events: h.ev, seed: seed, letters: true, quiet: true, lock: true } }, vf: { k: 'order', ev: h.ev, seed: seed, ans: ord } });
  });

  G('geology.unconformities', function (R, ctx) {
    var kind = by(ctx, R.pick(['type', 'type', 'what']), R.pick(['type', 'gap', 'picture']), R.pick(['picture', 'gap', 'gap', 'type']));
    var TY = ['Angular unconformity', 'Nonconformity', 'Disconformity'];
    if (kind === 'type') {
      var t = R.pick([['Flat-lying sandstone sits on top of tilted shale layers that were cut off by erosion.', 'Angular unconformity'], ['Horizontal sandstone lies on an eroded surface of granite.', 'Nonconformity'], ['Two sets of flat, parallel layers are separated by an uneven erosion surface with pebbles along it.', 'Disconformity'], ['Layers of limestone sit on a worn-down surface of folded schist and gneiss.', 'Nonconformity']]);
      return P('What kind of unconformity is this? ' + t[0], mc(t[1], TY.filter(function (x) { return x !== t[1]; }).concat(['Not an unconformity; it is a normal layer boundary'])),
        [{ 'Angular unconformity': 'Layers below were tilted or folded and eroded before new layers were laid across them at an angle.', Nonconformity: 'Sedimentary rock sits on eroded igneous or metamorphic rock, which must have formed deep down and been uplifted and exposed first.', Disconformity: 'The layers above and below are parallel, so the gap shows only as an erosion surface; it is the hardest kind to spot.' }[t[1]], 'In every case, the surface marks missing time: rock was worn away or never deposited.'],
        'What is under the erosion surface, and is it tilted?', { vf: { k: 'type' } });
    }
    if (kind === 'picture') {
      var ty = R.pick(['angular', 'non', 'dis']), ev;
      if (ty === 'angular') ev = [{ t: 'deposit', rock: 'shale' }, { t: 'deposit', rock: 'sandstone' }, { t: 'deposit', rock: 'limestone' }, { t: 'deposit', rock: 'siltstone' }, { t: 'tilt', deg: R.sign() * R.int(18, 26) }, { t: 'erode', depth: 0.06 }, { t: 'deposit', rock: 'conglomerate' }, { t: 'deposit', rock: 'sandstone' }];
      else if (ty === 'non') ev = [{ t: 'erode', level: 0.05, amp: 0.015 }, { t: 'deposit', rock: 'sandstone' }, { t: 'deposit', rock: 'shale' }, { t: 'deposit', rock: 'limestone' }];
      else ev = [{ t: 'deposit', rock: 'limestone' }, { t: 'deposit', rock: 'shale' }, { t: 'deposit', rock: 'sandstone' }, { t: 'erode', depth: 0.04, amp: 0.015 }, { t: 'deposit', rock: 'conglomerate' }, { t: 'deposit', rock: 'shale' }];
      var nm = { angular: 'Angular unconformity', non: 'Nonconformity', dis: 'Disconformity' }[ty];
      return P('The dashed line in this cross-section is a buried erosion surface. ' + (ty === 'non' ? 'The wavy rock at the bottom is schist, a metamorphic rock.' : 'All the layers are sedimentary.') + ' What kind of unconformity is it?', mc(nm, TY.filter(function (x) { return x !== nm; }).concat(['A fault'])),
        [ty === 'angular' ? 'The layers below the surface are tilted and cut off; the layers above lie flat across them.' : ty === 'non' ? 'Sedimentary layers rest on eroded metamorphic rock.' : 'The layers above and below are parallel; only the erosion surface shows the gap.', 'So it is ' + (ty === 'angular' ? 'an angular unconformity' : ty === 'non' ? 'a nonconformity' : 'a disconformity') + '.'],
        'Look at what lies under the surface.', { viz: { name: 'es-strata', opts: { events: ev, quiet: true, lock: true } }, vf: { k: 'picture', ty: ty } });
    }
    if (kind === 'gap') {
      var below = R.int(30, 50) * 10, above = below - R.int(5, 30) * 10;
      return P('The youngest layer under an unconformity is ' + below + ' million years old, and the oldest layer above it is ' + above + ' million years old. How much time does the unconformity represent?', num(below - above, 3, 0.005),
        ['Time missing = age below − age above $= ' + below + ' - ' + above + ' = ' + (below - above) + '$ million years.', 'During that time, rock was worn away, or none was laid down here at all; the record has a gap.'],
        'Subtract the younger age from the older one.', { unit: 'million years', vf: { k: 'gap', a: below, b: above } });
    }
    return bankQ(R, [
      ['What is an unconformity?', 'A buried erosion surface: a gap in the rock record where rock was worn away or never deposited',
        ['A special kind of rock layer that forms during floods', 'A crack that fills with minerals', 'A layer of rock that has no fossils'],
        ['An unconformity is not a layer; it is a surface.', 'Above and below it are rocks of very different ages, because the time between is missing. At the Grand Canyon\'s Great Unconformity, more than a billion years are missing in places.'], 'Is it a thing, or a gap?']
    ], 'what');
  });

  G('geology.correlation', function (R, ctx) {
    var kind = by(ctx, R.pick(['index', 'key', 'why']), R.pick(['overlap', 'key', 'index']), R.pick(['overlap', 'overlap', 'key']));
    if (kind === 'overlap') {
      var a1 = R.int(40, 60) * 10, a2 = a1 - R.int(2, 6) * 10, b1 = a1 - R.int(1, (a1 - a2) / 10 - 1) * 10, b2 = b1 - R.int(2, 6) * 10;
      var old = M.min(a1, b1), young = M.max(a2, b2);
      return P('Fossil species X lived from ' + a1 + ' to ' + a2 + ' million years ago. Species Y lived from ' + b1 + ' to ' + b2 + ' million years ago. A shale layer holds both. Within what range of ages did the shale form? Give the oldest and the youngest possible ages.', { t: 'multi', parts: [{ label: 'Oldest possible (million years ago)', a: exact(old) }, { label: 'Youngest possible (million years ago)', a: exact(young) }] },
        ['Both species were alive only when their ranges overlap.', 'The overlap starts when the later species appeared: ' + old + ' million years ago.', 'It ends when the first species died out: ' + young + ' million years ago.', 'So the shale formed between ' + old + ' and ' + young + ' million years ago.'],
        'Find where the two ranges overlap.', { vf: { k: 'overlap', a1: a1, a2: a2, b1: b1, b2: b2 } });
    }
    if (kind === 'key') {
      var thick = R.coin();
      return P('At two sites 50 km apart, a geologist sees similar sandstone and shale layers. One thin layer of volcanic ash appears at both sites, and the same ammonite species is found just above it at both. Which is the strongest way to match the layers?', mc('Use the ash bed and the ammonite fossils as markers', ['Match layers with the same thickness', 'Match layers with the same color', 'Match layers with the same rock type']),
        ['The same kind of rock (sandstone, shale) can form at many different times, so rock type, color and thickness alone can mislead.', 'An ash bed falls over a wide area in days, so it marks one instant of time at both sites (a key bed).', 'An index fossil lived for a short time over a wide area, so it marks one span of time.'],
        'Which clues mark a single moment in time?', { vf: { k: 'key' } });
    }
    if (kind === 'index') {
      var opts = [['A species of ammonite that lived for about 1 million years, swam in oceans worldwide and is common', 'Good index fossil'], ['A species of clam that lived for 200 million years in many seas', 'Poor index fossil: it lived too long'], ['A rare insect known from a single lake', 'Poor index fossil: too rare and too local'], ['A trilobite species found in many seas, common, and lasting only about 2 million years', 'Good index fossil']];
      var o = R.pick(opts), good = o[1].indexOf('Good') === 0;
      return P('Would this make a good index fossil for matching layers? ' + o[0] + '.', mc(o[1], good ? ['Poor index fossil: it lived too long', 'Poor index fossil: too rare and too local', 'Poor index fossil: it lived in the sea'] : ['Good index fossil', o[1].indexOf('long') >= 0 ? 'Poor index fossil: too rare and too local' : 'Poor index fossil: it lived too long', 'Poor index fossil: it lived in the sea']),
        ['A good index fossil lived for a short time (so it pins down the age), was widespread (so it shows up in many places), and was common and easy to recognize.', good ? 'This one fits all three.' : 'This one fails at least one test.'],
        'Short-lived, widespread and common.', { vf: { k: 'index' } });
    }
    return bankQ(R, [
      ['Two sites each have a red sandstone layer of the same thickness. Must they be the same age?', 'No; similar rocks can form at different times, so fossils and key beds are better evidence',
        ['Yes; matching color and thickness prove it', 'Yes, if they are within 100 km', 'No; layers can never be matched between sites'],
        ['Red sandstone forms wherever iron-stained sand collects; that has happened many times in Earth\'s history.', 'Index fossils and key beds such as ash layers tie layers to the same moment in time.'], 'Can the same kind of rock form more than once?']
    ], 'why');
  });

  G('geology.geologic-history', function (R, ctx) {
    var kind = by(ctx, R.pick(['order', 'first']), R.pick(['order', 'order', 'first']), R.pick(['order', 'order', 'first']));
    var opt = by(ctx, { nLow: 3, nUp: 1 }, {}, { nLow: 4 });
    var h = history(R, opt), seed = R.int(1, 999), L = strataLetters(h.ev, seed), ord = L.feats.map(function (i) { return L.of[i]; });
    var why = ['Start with the oldest rock at the bottom of the lower layers and work up (superposition).'];
    if (h.def !== 'none') why.push('The lower layers were ' + (h.def === 'tilt' ? 'tilted' : 'folded') + ' after they formed (original horizontality), and the erosion surface cuts across them.');
    if (h.early) why.push('The early dike cuts the lower layers but stops at the erosion surface, so it came after them and before the erosion.');
    why.push('The erosion surface was buried by the upper layers, so it comes before them.');
    if (h.last === 'dike') why.push('The second dike cuts everything, so it is youngest.');
    if (h.last === 'fault') why.push('The fault offsets every layer, so it is youngest.');
    if (kind === 'first') {
      var i1 = L.feats[R.int(0, L.feats.length - 2)], later = L.feats.filter(function (j) { return j > i1; }), i2 = R.pick(later), sw = R.coin();
      var A = sw ? i2 : i1, B = sw ? i1 : i2;
      return P('In this cross-section, which came first: feature ' + L.of[A] + ' or feature ' + L.of[B] + '?', mcK(['Feature ' + L.of[A], 'Feature ' + L.of[B], 'They formed at the same time'], A < B ? 0 : 1),
        why.concat(['So ' + L.of[i1] + ' (' + featName(h.ev[i1]) + ') came before ' + L.of[i2] + ' (' + featName(h.ev[i2]) + ').']),
        'Superposition and cross-cutting.', { viz: { name: 'es-strata', opts: { events: h.ev, seed: seed, letters: true, quiet: true, lock: true } }, vf: { k: 'first', ev: h.ev, seed: seed, a: L.of[A], b: L.of[B], ans: L.of[i1] } });
    }
    return P('List the lettered features of this cross-section from oldest to youngest. Type the letters (for example, ' + R.shuffle(ord.slice()).join(' ') + ').', order(ord),
      why.concat(['Order: ' + ord.join(', ') + '.']),
      'Bottom layers first; then tilting and erosion; then the layers above; anything that cuts across comes after what it cuts.', { viz: { name: 'es-strata', opts: { events: h.ev, seed: seed, letters: true, quiet: true, lock: true } }, vf: { k: 'order', ev: h.ev, seed: seed, ans: ord } });
  });

  var CLOCKS = [['C-14', 'carbon-14', 'nitrogen-14', 5730, 'years'], ['K-40', 'potassium-40', 'argon-40', 1.25e9, 'billion'], ['U-235', 'uranium-235', 'lead-207', 7.04e8, 'million'], ['U-238', 'uranium-238', 'lead-206', 4.47e9, 'billion']];
  function ageTx(y, unit) { return unit === 'years' ? T.commas(M.round(y)) + ' years' : unit === 'million' ? fd(y / 1e6, 0) + ' million years' : fd(y / 1e9, 2) + ' billion years'; }
  G('geology.radiometric-dating', function (R, ctx) {
    var kind = by(ctx, R.pick(['ratio', 'atoms', 'frac']), R.pick(['frac', 'ratio', 'dp', 'c14', 'atoms']), R.pick(['log', 'log', 'c14', 'dp']));
    if (kind === 'atoms') {
      var N0 = R.pick([800, 1000, 1200, 1600, 2000, 2400, 3200, 4000, 6400, 8000]), nn = R.int(1, 4), left0 = N0 / M.pow(2, nn), askD = R.coin();
      return P('A crystal starts with ' + T.commas(N0) + ' atoms of uranium-235 and no lead-207. How many ' + (askD ? 'lead-207 (daughter) atoms' : 'uranium-235 atoms') + ' does it hold after ' + nn + ' half-li' + (nn > 1 ? 'ves' : 'fe') + '?', exact(askD ? N0 - left0 : left0),
        ['Each half-life halves the parent: $' + T.commas(N0) + ' \\times \\left(\\tfrac12\\right)^{' + nn + '} = ' + T.commas(left0) + '$ uranium-235 atoms left.', askD ? 'Every atom that decayed became lead-207: $' + T.commas(N0) + ' - ' + T.commas(left0) + ' = ' + T.commas(N0 - left0) + '$.' : 'The other $' + T.commas(N0 - left0) + '$ atoms have become lead-207.', 'Notice the parent never runs out in a fixed time: it halves again and again. After 2 half-lives a quarter is still left, not none.'],
        'Halve the parent once for each half-life.', { vf: { k: 'atoms', N0: N0, n: nn, d: askD } });
    }
    // daughter-to-parent ratios use uranium-235 -> lead-207 (zircon starts with no lead); potassium-40 is used only for the
    // fraction of parent left, because it decays to both argon-40 and calcium-40
    var c = kind === 'frac' ? R.pick([CLOCKS[0], CLOCKS[1], CLOCKS[2]]) : CLOCKS[2], hl = c[3], u = c[4], uDiv = u === 'years' ? 1 : u === 'million' ? 1e6 : 1e9, uName = u === 'years' ? 'years' : u + ' years';
    if (kind === 'ratio' || kind === 'frac' || kind === 'dp') {
      var n = R.int(1, c[0] === 'K-40' ? 3 : c[0] === 'C-14' ? 7 : 5), left = M.pow(0.5, n), DP = M.pow(2, n) - 1, age = n * hl / uDiv;
      if (kind === 'dp') return P('A mineral formed with ' + c[1] + ' and no ' + c[2] + '. Its half-life is ' + ageTx(hl, u) + '. After ' + n + ' half-li' + (n > 1 ? 'ves' : 'fe') + ', what is the ratio of daughter atoms (' + c[2] + ') to parent atoms (' + c[1] + ')?', exact(DP),
        ['Fraction of parent left: $\\left(\\tfrac{1}{2}\\right)^{' + n + '} = \\tfrac{1}{' + M.pow(2, n) + '}$.', 'Every atom that decayed became a daughter atom: $1 - \\tfrac{1}{' + M.pow(2, n) + '} = \\tfrac{' + DP + '}{' + M.pow(2, n) + '}$.', 'Daughter ÷ parent $= \\dfrac{' + DP + '/' + M.pow(2, n) + '}{1/' + M.pow(2, n) + '} = ' + DP + '$.'],
        'Find the fraction of parent left; the rest became daughter.', { vf: { k: 'dp', n: n } });
      var given = kind === 'ratio' ? 'a ratio of ' + c[2] + ' to ' + c[1] + ' atoms of ' + DP : 'only $\\tfrac{1}{' + M.pow(2, n) + '}$ of its original ' + c[1];
      var what = c[0] === 'C-14' ? 'piece of charcoal' : c[0] === 'K-40' ? 'crystal of feldspar in a lava flow' : 'zircon crystal in volcanic ash';
      return P('A ' + what + ' has ' + given + '. The half-life of ' + c[1] + ' is ' + ageTx(hl, u) + (c[0] === 'C-14' ? ', and its carbon-14 began decaying when the tree died.' : kind === 'ratio' ? ', and the crystal held no ' + c[2] + ' when it formed.' : ', and its clock started when the lava cooled.') + ' How old is it, in ' + uName + '?', num(age, 4, 0.005),
        [kind === 'ratio' ? 'A daughter-to-parent ratio of ' + DP + ' means $\\tfrac{1}{' + M.pow(2, n) + '}$ of the parent is left (' + DP + ' parts daughter for every 1 part parent).' : '$\\tfrac{1}{' + M.pow(2, n) + '} = \\left(\\tfrac{1}{2}\\right)^{' + n + '}$.', 'So ' + n + ' half-li' + (n > 1 ? 'ves have' : 'fe has') + ' passed.', 'Age = ' + n + ' × ' + ageTx(hl, u) + ' = ' + ageTx(n * hl, u) + '.'],
        'Ratios of 1, 3, 7 and 15 mean 1, 2, 3 and 4 half-lives.', { unit: uName, vf: { k: 'age', n: n, hl: hl, div: uDiv } });
    }
    if (kind === 'c14') {
      var yrs = R.pick([2000, 3000, 5000, 8000, 10000, 15000, 20000]), fr = M.pow(0.5, yrs / 5730);
      return P('Carbon-14 has a half-life of 5,730 years. What percent of the original carbon-14 is left in a bone that is ' + T.commas(yrs) + ' years old?', pnum(fr * 100, 3, 0.02),
        ['Half-lives passed: $' + T.commas(yrs) + ' \\div 5,730 = ' + fd(yrs / 5730, 3) + '$.', 'Fraction left: $\\left(\\tfrac{1}{2}\\right)^{' + fd(yrs / 5730, 3) + '} = ' + fd(fr, 4) + '$.', 'About $' + fd(fr * 100, 1) + '\\%$ is left.'],
        'Count the half-lives, then raise 1/2 to that power.', { unit: '%', vf: { k: 'c14', yrs: yrs } });
    }
    var c2 = R.pick([CLOCKS[2], CLOCKS[3], ['Rb-87', 'rubidium-87', 'strontium-87', 4.88e10, 'billion']]), dp = c2[0] === 'U-235' ? R.pick([0.25, 0.5, 0.8, 1.5, 2, 2.5, 4, 5, 6, 10, 12, 20]) : c2[0] === 'U-238' ? R.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6]) : R.pick([0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05]), t = c2[3] * M.log(1 + dp) / M.LN2 / 1e6;
    return P((c2[0] === 'Rb-87' ? 'A mica crystal from an old granite' : 'A zircon crystal') + ' has a daughter-to-parent ratio of ' + fd(dp, 2) + ' for ' + c2[1] + ' → ' + c2[2] + ' (half-life ' + ageTx(c2[3], c2[4]) + '), with no daughter at the start. Use $t = t_{1/2}\\,\\log_2(1 + D/P)$. How old is it, in million years?', num(t, 3, 0.01),
      ['Parent left as a fraction of the original: $\\dfrac{P}{P + D} = \\dfrac{1}{1 + ' + fd(dp, 2) + '} = \\left(\\tfrac{1}{2}\\right)^{n}$.', 'So $n = \\log_2(' + fd(1 + dp, 2) + ') = \\dfrac{\\ln ' + fd(1 + dp, 2) + '}{\\ln 2} = ' + fd(M.log(1 + dp) / M.LN2, 3) + '$ half-lives.', 'Age $= ' + fd(M.log(1 + dp) / M.LN2, 3) + ' \\times ' + T.commas(c2[3] / 1e6) + '\\,\\text{million} \\approx ' + T.commas(M.round(t)) + '$ million years.'],
      'Find the number of half-lives with log base 2, then multiply by the half-life.', { unit: 'million years', vf: { k: 'log', dp: dp, hl: c2[3] } });
  });

  G('geology.isotope-systems', function (R, ctx) {
    var kind = by(ctx, R.pick(['pick', 'pick', 'sand']), R.pick(['pick', 'hl', 'sand', 'left']), R.pick(['hl', 'left', 'pick', 'earth']));
    if (kind === 'pick') {
      var S = [['a 12,000-year-old wooden tool', 'Carbon-14 (half-life 5,730 years)'], ['charcoal from a campfire about 30,000 years old', 'Carbon-14 (half-life 5,730 years)'], ['a layer of volcanic ash about 2 million years old', 'Potassium–argon (half-life 1.25 billion years)'],
        ['zircon crystals in a granite about 1.8 billion years old', 'Uranium–lead (half-lives 704 million and 4.47 billion years)'], ['a lava flow about 500,000 years old', 'Potassium–argon (half-life 1.25 billion years)'], ['zircons in an ash bed about 250 million years old', 'Uranium–lead (half-lives 704 million and 4.47 billion years)']];
      var s = R.pick(S);
      return P('Which radioactive clock is best for dating ' + s[0] + '?', mc(s[1], ['Carbon-14 (half-life 5,730 years)', 'Potassium–argon (half-life 1.25 billion years)', 'Uranium–lead (half-lives 704 million and 4.47 billion years)', 'Rubidium–strontium on a single fossil shell'].filter(function (x) { return x !== s[1]; })),
        [s[1].indexOf('Carbon') === 0 ? 'Carbon-14 works for once-living things (wood, bone, charcoal, shell) up to about 50,000 years; after that too little is left to measure.' : s[1].indexOf('Potassium') === 0 ? 'Potassium-bearing minerals in volcanic rock start their clock when they cool and trap no argon gas; with a long half-life, the method works from about 100,000 years to billions.' : 'Zircon traps uranium but rejects lead when it crystallizes, so every lead atom inside came from decay; two uranium clocks in one crystal check each other.', 'Match the clock\'s range to the sample\'s age and to the material.'],
        'Is it once-living? How old roughly?', { vf: { k: 'pick' } });
    }
    if (kind === 'sand') return bankQ(R, [
      ['Why can\'t you get the age of a sandstone by dating its sand grains?', 'The grains are older than the rock; dating them gives the age of the rocks they eroded from',
        ['Sand has no radioactive atoms at all', 'Sandstone is always too young to date', 'Quartz grains melt during dating'],
        ['Each grain of sand is a piece of an older rock, eroded and carried far away.', 'A radioactive clock in a grain started when that grain\'s mineral crystallized, maybe a billion years before the sand was deposited.', 'So sedimentary layers are dated by the igneous rocks above, below or cutting them: ash beds, lava flows and dikes.'], 'When did each grain\'s clock start?']
    ], 'sand');
    if (kind === 'hl') {
      var limit = R.pick([40000, 50000, 60000]), n = limit / 5730;
      return P('Carbon-14 has a half-life of 5,730 years. How many half-lives pass in ' + T.commas(limit) + ' years, about the limit of carbon dating?', num(n, 3, 0.01),
        ['$' + T.commas(limit) + ' \\div 5,730 \\approx ' + fd(n, 2) + '$ half-lives.', 'Then only $\\left(\\tfrac12\\right)^{' + fd(n, 1) + '} \\approx ' + fd(M.pow(0.5, n) * 100, 2) + '\\%$ of the carbon-14 is left, too little to measure reliably. That is why carbon-14 can\'t date dinosaur bones (over 66 million years old).'],
        'Divide the time by the half-life.', { vf: { k: 'hl', t: limit } });
    }
    if (kind === 'left') {
      var c = R.pick(CLOCKS.slice(1)), tYr = R.pick([0.5e9, 1e9, 2e9, 3e9, 4.54e9]), f = M.pow(0.5, tYr / c[3]);
      return P('A crystal formed ' + fd(tYr / 1e9, 2) + ' billion years ago with some ' + c[1] + ' (half-life ' + ageTx(c[3], c[4]) + '). What percent of that ' + c[1] + ' is still there today?', pnum(f * 100, 3, 0.02),
        ['Half-lives passed: $' + fd(tYr / 1e9, 2) + ' \\div ' + fd(c[3] / 1e9, 3) + ' = ' + fd(tYr / c[3], 3) + '$.', 'Fraction left: $\\left(\\tfrac12\\right)^{' + fd(tYr / c[3], 3) + '} = ' + fd(f, 4) + '$, about $' + fd(f * 100, 1) + '\\%$.', c[0] === 'U-235' ? 'Uranium-235\'s shorter half-life makes it change fast enough to measure ages from about 1 million years up.' : 'A long half-life suits ages of millions to billions of years.'],
        'Count half-lives, then take that power of 1/2.', { unit: '%', vf: { k: 'left', t: tYr, hl: c[3] } });
    }
    var n2 = 4.54e9 / 4.47e9;
    return P('Earth is about 4.54 billion years old. Uranium-238 has a half-life of 4.47 billion years. How many half-lives of uranium-238 have passed since Earth formed?', num(n2, 3, 0.01),
      ['$4.54 \\div 4.47 \\approx ' + fd(n2, 3) + '$.', 'So about half of the uranium-238 that Earth started with is still here: enough to keep dating the oldest rocks and to keep warming Earth\'s interior.'],
      'Divide the age by the half-life.', { vf: { k: 'earth' } });
  });

  G('geology.bracketing-ages', function (R, ctx) {
    var kind = by(ctx, R.pick(['between', 'between', 'why']), R.pick(['between', 'cut', 'cut']), R.pick(['cut', 'between', 'cut']));
    var a1 = R.int(80, 140), a2 = a1 - R.int(3, 12), a3 = a2 - R.int(5, 20);
    var r1 = R.pick(['sandstone', 'siltstone']), r2 = R.pick(['shale', 'limestone']), r3 = R.pick(['sandstone', 'conglomerate']);
    if (kind === 'between' || kind === 'cut') {
      var ev = [{ t: 'deposit', rock: r1, thick: 0.1 }, { t: 'deposit', rock: 'ash', age: a1, thick: 0.045 }, { t: 'deposit', rock: r2, thick: 0.12 }];
      var target = 2;
      if (kind === 'between') ev.push({ t: 'deposit', rock: 'ash', age: a2, thick: 0.045 }, { t: 'deposit', rock: r3, thick: 0.1 });
      else ev.push({ t: 'deposit', rock: r3, thick: 0.1 }, { t: 'intrude', kind: 'dike', x: R.real(0.6, 1.4, 2), w: 0.1, age: a2 });
      var seed = R.int(1, 999), L = strataLetters(ev, seed), lt = L.of[target], hi = a1, lo = a2;
      var q = kind === 'between' ? 'In this cross-section, volcanic ash beds are dated ' + a1 + ' and ' + a2 + ' million years old. Between which ages did layer ' + lt + ' (the ' + r2 + ') form? Give the oldest and the youngest possible ages.'
        : 'In this cross-section, the ash bed under layer ' + lt + ' (the ' + r2 + ') is dated ' + a1 + ' million years old, and the dike that cuts layer ' + lt + ' is dated ' + a2 + ' million years old. Between which ages did layer ' + lt + ' form? Give the oldest and the youngest possible ages.';
      return P(q, { t: 'multi', parts: [{ label: 'Oldest possible (million years)', a: exact(hi) }, { label: 'Youngest possible (million years)', a: exact(lo) }] },
        ['Layer ' + lt + ' lies on top of the ash dated ' + a1 + ' million years, so it is younger than that: at most ' + a1 + ' million years old.', kind === 'between' ? 'The ash dated ' + a2 + ' million years lies on top of layer ' + lt + ', so layer ' + lt + ' is older than that.' : 'The dike cuts layer ' + lt + ', so layer ' + lt + ' was already there when the dike formed ' + a2 + ' million years ago.', 'So layer ' + lt + ' formed between ' + a1 + ' and ' + a2 + ' million years ago. Without more dated rocks, that range is the honest answer.'],
        'Younger than what lies below it; older than what lies on it or cuts it.', { viz: { name: 'es-strata', opts: { events: ev, seed: seed, letters: true, ages: true, quiet: true, lock: true } }, vf: { k: 'bracket', hi: hi, lo: lo, ev: ev, seed: seed, letter: lt } });
    }
    return bankQ(R, [
      ['A shale lies between two ash beds dated 95 and 92 million years old. A student says the shale is 93.5 million years old. What is wrong?', 'The evidence only brackets a range: the shale formed sometime between 95 and 92 million years ago',
        ['Nothing; the average is the exact age', 'The shale must be exactly 95 million years old', 'The shale must be older than 95 million years'],
        ['Sediment does not pile up at a steady, known rate, so the middle of the range is just a guess.', 'The honest answer is a range: younger than the ash below, older than the ash above.'], 'What do the two dated beds actually tell you?']
    ], 'why');
  });

  var HIST = [['Earth forms', 4540], ['the oldest known mineral grains form', 4400], ['the oldest known rocks form', 4000], ['the earliest widely accepted fossils (stromatolites) form', 3500], ['oxygen starts building up in the air (the Great Oxidation Event)', 2400],
    ['animals with shells and skeletons spread in the Cambrian explosion', 539], ['the end-Ordovician mass extinction', 445], ['the end-Permian mass extinction, the largest of all', 252], ['the dinosaurs (other than birds) die out', 66], ['our species, Homo sapiens, appears', 0.3]];
  G('geology.earth-history', function (R, ctx) {
    var kind = by(ctx, R.pick(['first', 'first', 'gap']), R.pick(['order', 'gap', 'clock', 'oxygen']), R.pick(['order', 'clock', 'clock', 'gap']));
    if (kind === 'first') {
      var two = R.sample(HIST, 2), older = two[0][1] > two[1][1] ? two[0] : two[1];
      return P('Which happened first: ' + two[0][0] + ', or ' + two[1][0] + '?', mc(older[0].charAt(0).toUpperCase() + older[0].slice(1), [(older === two[0] ? two[1][0] : two[0][0]).replace(/^./, function (c) { return c.toUpperCase(); }), 'They happened at about the same time']),
        ['About ' + T.commas(two[0][1]) + ' million years ago: ' + two[0][0] + '.', 'About ' + T.commas(two[1][1]) + ' million years ago: ' + two[1][0] + '.', 'The bigger number is longer ago, so ' + older[0] + ' came first.'],
        'Compare the ages: millions of years ago, so bigger is older.', { vf: { k: 'first', a: two[0][1], b: two[1][1] } });
    }
    if (kind === 'order') {
      var set = R.sample(HIST, 4), lab = set.map(function (q, i) { return { L: LET[i], n: q[0], ma: q[1] }; }), ord = lab.slice().sort(function (a, b) { return b.ma - a.ma; });
      return P('Put these events in order, oldest first. Type the letters (for example, D B A C). ' + lab.map(function (q) { return q.L + ': ' + q.n; }).join('; ') + '.', order(ord.map(function (q) { return q.L; })),
        ord.map(function (q) { return q.L + ': about ' + (q.ma >= 1 ? T.commas(q.ma) + ' million' : '300,000') + ' years ago, ' + q.n + '.'; }),
        'Place each on the time scale first.', { viz: { name: 'es-deep-time', opts: { analogy: 'none' } }, vf: { k: 'order', lab: lab } });
    }
    if (kind === 'gap') {
      var pr = R.sample(HIST.slice(0, 9), 2).sort(function (a, b) { return b[1] - a[1]; });
      return P('About how many million years passed between these two events? ' + pr[0][0].charAt(0).toUpperCase() + pr[0][0].slice(1) + ' (about ' + T.commas(pr[0][1]) + ' million years ago), and ' + pr[1][0] + ' (about ' + T.commas(pr[1][1]) + ' million years ago).', num(pr[0][1] - pr[1][1], 4, 0.005),
        ['$' + T.commas(pr[0][1]) + ' - ' + T.commas(pr[1][1]) + ' = ' + T.commas(pr[0][1] - pr[1][1]) + '$ million years.'], 'Subtract the two ages.', { unit: 'million years', vf: { k: 'gap', a: pr[0][1], b: pr[1][1] } });
    }
    if (kind === 'oxygen') return bankQ(R, [
      ['Has Earth\'s air always had plenty of oxygen?', 'No; there was almost none until photosynthesizing microbes built it up, starting about 2.4 billion years ago',
        ['Yes; oxygen came out of volcanoes from the start', 'Yes; oxygen formed with the planet', 'No; oxygen appeared only when dinosaurs lived'],
        ['Rocks older than about 2.4 billion years hold minerals such as pyrite grains in river sand that would rust away in oxygen-rich air.', 'Cyanobacteria release oxygen by photosynthesis. After the Great Oxidation Event, rusty red beds and other oxygen-loving minerals appear.'], 'What do the oldest river sands tell us?']
    ], 'oxygen');
    var ev = R.pick(HIST.slice(5)), minBefore = ev[1] / 4540 * 24 * 60;
    return P('Squeeze Earth\'s 4,540 million years into one 24-hour day, with Earth forming at midnight. About ' + (ev[1] >= 1 ? T.commas(ev[1]) + ' million' : '300,000') + ' years ago, ' + ev[0] + '. How many minutes before the next midnight is that?', num(minBefore, 3, 0.02),
      ['Fraction of Earth\'s history still to come after the event: $\\dfrac{' + (ev[1] >= 1 ? T.commas(ev[1]) : '0.3') + '}{4,540} = ' + fd(ev[1] / 4540, 5) + '$.', 'A day has $24 \\times 60 = 1,440$ minutes.', 'Minutes before midnight: $' + fd(ev[1] / 4540, 5) + ' \\times 1,440 \\approx ' + fd(minBefore, 2) + '$.', 'Everything people have ever done fits in the last few seconds of the day.'],
      'Find what fraction of Earth\'s history comes after the event, then take that fraction of 1,440 minutes.', { unit: 'min', viz: { name: 'es-deep-time', opts: { analogy: 'day', quiet: true } }, vf: { k: 'clock', ma: ev[1] } });
  });

// ---- 08_plates.js
  // =====================================================================================
  // Unit 8: Plate Tectonics in Depth
  // =====================================================================================

  var CHRON = [[0.77, 'the most recent reversal (normal to reversed, going back in time)'], [0.99, 'the start of the Jaramillo normal event'], [1.78, 'the end of the Olduvai normal event'], [2.58, 'the start of the Gauss normal period']];
  G('geology.magnetic-stripes', function (R, ctx) {
    var kind = by(ctx, R.pick(['half', 'full', 'why']), R.pick(['half', 'age', 'full', 'why']), R.pick(['half', 'age', 'ocean', 'full']));
    var rate = R.pick([10, 12, 15, 20, 25, 30, 40, 50, 60, 75]);
    if (kind === 'half') {
      var c = R.pick(CHRON), d = rate * c[0];
      return P('Across a mid-ocean ridge, the stripe boundary that marks ' + c[1] + ', ' + c[0] + ' million years ago, lies ' + fd(d, 2) + ' km from the ridge crest. What is the half spreading rate, in millimeters per year?', num(rate, 3, 0.01),
        ['The seafloor at that boundary formed at the crest ' + c[0] + ' million years ago and has moved ' + fd(d, 2) + ' km since.', 'Rate $= \\dfrac{' + fd(d, 2) + '\\,\\text{km}}{' + c[0] + '\\,\\text{million years}} = ' + fd(rate, 2) + '\\,\\text{km per million years}$.', '1 km per million years is $1,000,000\\,\\text{mm} \\div 1,000,000\\,\\text{yr} = 1\\,\\text{mm/yr}$, so the half rate is $' + rate + '\\,\\text{mm/yr}$.'],
        'Distance from the crest divided by the age; km per million years equals mm per year.', { unit: 'mm/yr', viz: { name: 'es-boundary', opts: { type: 'ridge', stripes: true, time: 3, speed: rate / 10, quiet: true, lock: true } }, vf: { k: 'half', d: d, t: c[0] } });
    }
    if (kind === 'full') {
      var ask = R.coin();
      return P(ask ? 'Each plate moves away from a mid-ocean ridge at ' + rate + ' mm per year (the half spreading rate). How fast do the two plates move apart from each other?' : 'Two plates separate at a mid-ocean ridge at a full spreading rate of ' + (2 * rate) + ' mm per year, and the ridge spreads evenly. How fast does each plate move away from the ridge crest?', num(ask ? 2 * rate : rate, 3, 0.005),
        ['New seafloor forms at the crest and moves off to both sides.', ask ? 'Each side moves ' + rate + ' mm/yr away from the crest, in opposite directions, so the gap grows by $2 \\times ' + rate + ' = ' + (2 * rate) + '\\,\\text{mm/yr}$ (the full rate).' : 'The full rate is split between the two sides: $' + (2 * rate) + ' \\div 2 = ' + rate + '\\,\\text{mm/yr}$ (the half rate).'],
        'Full rate = 2 × half rate.', { unit: 'mm/yr', vf: { k: ask ? 'full' : 'halfFromFull', r: rate } });
    }
    if (kind === 'age') {
      var x = R.pick([50, 100, 150, 200, 300, 400, 600]), t = x / rate;
      return P('A ridge spreads at a half rate of ' + rate + ' mm per year. How old is the seafloor ' + x + ' km from the crest, in million years?', num(t, 3, 0.01),
        [rate + ' mm/yr is ' + rate + ' km per million years.', 'Age $= \\dfrac{' + x + '\\,\\text{km}}{' + rate + '\\,\\text{km per million years}} = ' + fd(t, 2) + '$ million years.', 'Seafloor gets older, colder and deeper the farther it is from the ridge.'],
        'Time = distance ÷ half rate.', { unit: 'million years', vf: { k: 'age', x: x, r: rate } });
    }
    if (kind === 'ocean') {
      var full = R.pick([20, 25, 30, 40]), my = R.pick([100, 150, 180, 200]), w = full * my;
      return P('An ocean basin has been opening at a full spreading rate of ' + full + ' mm per year for ' + my + ' million years. About how wide is it now, in kilometers?', num(w, 3, 0.01),
        [full + ' mm/yr = ' + full + ' km per million years.', 'Width $= ' + full + ' \\times ' + my + ' = ' + T.commas(w) + '\\,\\text{km}$.', 'The Atlantic, opening at a few centimeters a year since roughly 180 to 200 million years ago, is several thousand kilometers wide.'],
        'Width = full rate × time.', { unit: 'km', vf: { k: 'ocean', full: full, my: my } });
    }
    return bankQ(R, [
      ['Why do the magnetic stripes on the seafloor form a mirror image on the two sides of a ridge?', 'New crust forms at the crest and records the field, then splits and moves away to both sides at the same rate',
        ['The magnetic field is always opposite on the two sides of a ridge', 'Ships towing magnetometers always go in circles', 'Lava flows from the ridge only during reversals'],
        ['Lava erupting at the crest records the field direction of the time.', 'As the plates separate, each new strip of crust is split in two and carried away on both sides, so each band has a twin on the other side.', 'The symmetric pattern was key evidence for seafloor spreading in the 1960s.'], 'Where does new seafloor form, and where does it go?'],
      ['A ridge has a half spreading rate of 20 mm/yr. A student says the plates move apart at 20 mm/yr. What is wrong?', 'Each plate moves 20 mm/yr away from the ridge, so they separate at 40 mm/yr (the full rate)',
        ['Nothing; the half rate is the separation rate', 'They separate at 10 mm/yr', 'The plates do not move; only the stripes do'],
        ['The half rate is measured from the crest to one side.', 'The two plates move in opposite directions, so their separation grows twice as fast.'], 'Picture both plates moving.']
    ], 'why');
  });

  var TRIPLE = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37], [28, 45, 53], [11, 60, 61], [33, 56, 65]];
  G('geology.gps-plate-motion', function (R, ctx) {
    var kind = by(ctx, R.pick(['speed', 'speed', 'open']), R.pick(['rel', 'speed', 'open', 'rel']), R.pick(['rel', 'open', 'years', 'rel']));
    if (kind === 'speed') {
      var tr = R.pick(TRIPLE), k = R.pick([1, 1, 2]), ve = R.sign() * tr[0] * k, vn = R.sign() * tr[1] * k; if (R.coin()) { var tmp = ve; ve = vn; vn = tmp; }
      if (M.abs(tr[2] * k) > 80) { ve = M.round(ve / k); vn = M.round(vn / k); k = 1; }
      var sp = M.sqrt(ve * ve + vn * vn);
      return P('A GPS station moves ' + M.abs(ve) + ' mm/yr ' + (ve >= 0 ? 'east' : 'west') + ' and ' + M.abs(vn) + ' mm/yr ' + (vn >= 0 ? 'north' : 'south') + '. What is its speed?', num(sp, 3, 0.005),
        ['The east and north parts are at right angles, so they are the legs of a right triangle.', 'Speed $= \\sqrt{' + M.abs(ve) + '^2 + ' + M.abs(vn) + '^2} = \\sqrt{' + (ve * ve + vn * vn) + '} = ' + fd(sp, 2) + '\\,\\text{mm/yr}$.'],
        'Use the Pythagorean theorem.', { unit: 'mm/yr', vf: { k: 'speed', ve: ve, vn: vn } });
    }
    var A = { name: 'A', x: -R.int(5, 9) * 10, y: R.int(-3, 3) * 10, ve: R.int(-30, 30), vn: R.int(-30, 30) }, tr2 = R.pick(TRIPLE.slice(0, 7)), sg = [R.sign(), R.sign()];
    var B = { name: 'B', x: R.int(5, 9) * 10, y: R.int(-3, 3) * 10, ve: A.ve + sg[0] * tr2[0], vn: A.vn + sg[1] * tr2[1] };
    var rx = B.ve - A.ve, ry = B.vn - A.vn, dx = B.x - A.x, dy = B.y - A.y, Ld = M.sqrt(dx * dx + dy * dy), along = (rx * dx + ry * dy) / Ld;
    var st = [A, B], vizO = { name: 'es-plates', opts: { mode: 'gps', stations: st, pair: [0, 1], quiet: true, lock: true } };
    var desc = 'Station A moves ' + fd(M.abs(A.ve), 0) + ' mm/yr ' + (A.ve >= 0 ? 'east' : 'west') + ' and ' + fd(M.abs(A.vn), 0) + ' mm/yr ' + (A.vn >= 0 ? 'north' : 'south') + '. Station B moves ' + fd(M.abs(B.ve), 0) + ' mm/yr ' + (B.ve >= 0 ? 'east' : 'west') + ' and ' + fd(M.abs(B.vn), 0) + ' mm/yr ' + (B.vn >= 0 ? 'north' : 'south') + '.';
    if (kind === 'rel') {
      var sp2 = M.sqrt(rx * rx + ry * ry);
      return P(desc + ' How fast is B moving relative to A?', num(sp2, 3, 0.005),
        ['Subtract A\'s velocity from B\'s, part by part (east positive, north positive).', 'East: $' + B.ve + ' - ' + T.p(A.ve) + ' = ' + rx + '$. North: $' + B.vn + ' - ' + T.p(A.vn) + ' = ' + ry + '$.', 'Relative speed $= \\sqrt{' + T.p(rx) + '^2 + ' + T.p(ry) + '^2} = ' + fd(sp2, 2) + '\\,\\text{mm/yr}$.', 'Each arrow alone shows motion in a fixed global frame; only the difference shows what the boundary between them is doing.'],
        'Subtract the velocities component by component, then use Pythagoras.', { unit: 'mm/yr', viz: vizO, vf: { k: 'rel', A: A, B: B } });
    }
    if (kind === 'open') {
      if (M.abs(along) < 3) { B.ve += (along >= 0 ? 6 : -6); rx = B.ve - A.ve; along = (rx * dx + ry * dy) / Ld; desc = desc.replace(/Station B moves [^.]*\./, 'Station B moves ' + fd(M.abs(B.ve), 0) + ' mm/yr ' + (B.ve >= 0 ? 'east' : 'west') + ' and ' + fd(M.abs(B.vn), 0) + ' mm/yr ' + (B.vn >= 0 ? 'north' : 'south') + '.'); }
      var opening = along > 0;
      return P('Station B is ' + (B.x - A.x) + ' km east' + (B.y !== A.y ? ' and ' + M.abs(B.y - A.y) + ' km ' + (B.y > A.y ? 'north' : 'south') : '') + ' of station A, across a plate boundary. ' + desc + ' Is the distance between them growing or shrinking?', mc(opening ? 'Growing: the boundary is pulling apart' : 'Shrinking: the boundary is closing', [opening ? 'Shrinking: the boundary is closing' : 'Growing: the boundary is pulling apart', 'Neither: both stations move, so nothing changes', 'You can\'t tell without knowing which station is faster']),
        ['Relative velocity of B from A: east $' + rx + '$, north $' + ry + '$ mm/yr.', 'The line from A to B points mostly east (' + (B.x - A.x) + ' km east, ' + (B.y - A.y) + ' km north). The part of the relative velocity along that line is $\\dfrac{' + T.p(rx) + ' \\times ' + T.p(dx) + ' + ' + T.p(ry) + ' \\times ' + T.p(dy) + '}{' + fd(Ld, 1) + '} \\approx ' + fd(along, 1) + '\\,\\text{mm/yr}$.', opening ? 'Positive: B moves away from A, so the gap grows.' : 'Negative: B moves toward A, so the gap shrinks.'],
        'Subtract A\'s velocity from B\'s, then see whether the difference points away from A or toward it.', { viz: vizO, vf: { k: 'open', A: A, B: B } });
    }
    var yrs = R.pick([10, 20, 50, 100]), ch = along * yrs / 1000;
    return P('Station B is ' + (B.x - A.x) + ' km east' + (B.y !== A.y ? ' and ' + M.abs(B.y - A.y) + ' km ' + (B.y > A.y ? 'north' : 'south') : '') + ' of station A. ' + desc + ' By how many meters will the distance between them change in ' + yrs + ' years? (Positive means it grows, negative means it shrinks.)', { t: 'num', v: ans(ch, 3), rtol: 0.03, tol: 0.01 },
      ['Relative velocity of B from A: east $' + rx + '$, north $' + ry + '$ mm/yr.', 'Unit vector from A to B: $(' + fd(dx / Ld, 3) + ', ' + fd(dy / Ld, 3) + ')$.', 'Rate of change of the distance: $' + T.p(rx) + ' \\times ' + T.p(fd(dx / Ld, 3)) + ' + ' + T.p(ry) + ' \\times ' + T.p(fd(dy / Ld, 3)) + ' \\approx ' + fd(along, 2) + '\\,\\text{mm/yr}$.', 'In ' + yrs + ' years: $' + fd(along, 2) + ' \\times ' + yrs + ' \\approx ' + fd(along * yrs, 0) + '\\,\\text{mm} = ' + fd(ch, 2) + '\\,\\text{m}$.'],
      'Project the relative velocity onto the line between the stations.', { unit: 'm', viz: vizO, vf: { k: 'years', A: A, B: B, yrs: yrs } });
  });

  G('geology.driving-forces', function (R, ctx) {
    var kind = by(ctx, R.pick(['force', 'drop', 'depth', 'why']), R.pick(['depth', 'force', 'evidence', 'drop']), R.pick(['depth', 'age', 'drop', 'evidence']));
    if (kind === 'depth' || kind === 'drop' || kind === 'age') {
      var t = ctx.level === 1 || kind === 'age' ? R.pick([1, 4, 9, 16, 25, 36, 49, 64]) : R.int(2, 70), d = 2500 + 350 * M.sqrt(t), sq = fd(M.sqrt(t), 3);
      if (kind === 'depth') return P('Seafloor sinks as it cools and ages. A well-tested rule for young ocean floor is $d \\approx 2,500 + 350\\sqrt{t}$, with depth $d$ in meters and age $t$ in million years. How deep is seafloor that is ' + t + ' million years old?', num(d, 3, 0.01),
        ['$\\sqrt{' + t + '} \\approx ' + sq + '$.', '$d = 2,500 + 350 \\times ' + sq + ' \\approx 2,500 + ' + fd(350 * M.sqrt(t), 0) + ' = ' + fd(d, 0) + '\\,\\text{m}$.', 'Cooling plates shrink and sink, so ridges stand high and the plate slopes downhill away from them; gravity sliding down that slope is ridge push.'],
        'Take the square root of the age first.', { unit: 'm', vf: { k: 'depth', t: t } });
      if (kind === 'drop') return P('Using $d \\approx 2,500 + 350\\sqrt{t}$ (meters; $t$ in million years), how much deeper is ' + t + '-million-year-old seafloor than the ridge crest (age 0)?', num(350 * M.sqrt(t), 3, 0.01),
        ['At the crest, $t = 0$: $d = 2,500\\,\\text{m}$.', 'At ' + t + ' million years: $d = 2,500 + 350 \\times ' + sq + ' \\approx ' + fd(d, 0) + '\\,\\text{m}$.', 'Difference: about $' + fd(350 * M.sqrt(t), 0) + '\\,\\text{m}$. The ridge stands kilometers above the old ocean floor: a gentle slope plates slide down.'],
        'Compare the depth at age t with the depth at age 0.', { unit: 'm', vf: { k: 'drop', t: t } });
      return P('Seafloor depth grows with age as $d \\approx 2,500 + 350\\sqrt{t}$ ($d$ in meters, $t$ in million years). A survey finds the seafloor ' + T.commas(d) + ' m deep. About how old is it?', num(t, 3, 0.01),
        ['$350\\sqrt{t} = ' + T.commas(d) + ' - 2,500 = ' + T.commas(d - 2500) + '$.', '$\\sqrt{t} = ' + T.commas(d - 2500) + ' \\div 350 = ' + M.sqrt(t) + '$.', '$t = ' + M.sqrt(t) + '^2 = ' + t + '$ million years.'],
        'Undo the steps: subtract, divide, then square.', { unit: 'million years', vf: { k: 'age', d: d } });
    }
    if (kind === 'force') return P('Which force is thought to do the most to move the plates?', mc('Slab pull: the cold, dense edge of a plate sinking into the mantle drags the rest behind it', ['Ridge push: the high ridge pushes the plates apart', 'Mantle currents carrying the plates like rafts on a river', 'The Moon\'s tides pulling the continents']),
      ['Old ocean lithosphere is cold and denser than the hot mantle below, so where it bends down at a trench it sinks and pulls.', 'Ridge push (plates sliding off the high, hot ridge) helps, but it is several times smaller.', 'The mantle does convect, and the sinking slabs are part of that flow; the plates are not simply rafts carried along.'],
      'Which part of a plate is densest?', { viz: { name: 'es-boundary', opts: { type: 'ocean-continent', forces: true, quiet: true } }, vf: { k: 'force' } });
    if (kind === 'evidence') return bankQ(R, [
      ['Plates with long subducting edges (like the Pacific plate) move about 5 to 10 cm per year, while plates with little or no sinking edge (like the Eurasian plate) move only 1 to 2 cm per year. What does this suggest?', 'Sinking slabs pull hardest: slab pull is the main driving force',
        ['Big plates move fastest because they are heavy', 'Plates near the equator move fastest', 'Ridge push is the only force'],
        ['If mantle currents simply dragged plates along, plate speed would not depend on whether a plate has a sinking edge.', 'Instead, speed tracks the length of subducting edge: the clearest sign that the sinking slab does most of the pulling.'], 'Which plates move fastest?']
    ], 'evidence');
    return bankQ(R, [
      ['Why does old ocean lithosphere sink into the mantle at a trench?', 'It has cooled and become denser than the hotter mantle beneath it',
        ['It is pushed down by the weight of seawater alone', 'It melts and drips downward', 'The core pulls it with magnetism'],
        ['A plate cools from above as it ages and grows thicker and denser.', 'After a few tens of millions of years its average density exceeds the hot asthenosphere\'s, so once it starts down at a trench, it keeps sinking.'], 'What happens to rock as it cools?'],
      ['How does ridge push work?', 'The ridge stands high because it is hot; cooled plates slide down the gentle slope away from it under gravity',
        ['Magma squeezes into the crack and shoves the plates apart like a wedge', 'Earthquakes at the ridge kick the plates', 'Winds over the ocean push the plates'],
        ['Hot rock expands, so the ridge sits about 2 to 3 km higher than old ocean floor.', 'Gravity makes the plates slide off that high ground. Magma only fills the gap the plates leave; it is not a wedge forcing them apart.'], 'Think about the shape of the seafloor.']
    ], 'why');
  });

  G('geology.subduction-zones', function (R, ctx) {
    var kind = by(ctx, R.pick(['magma', 'dense', 'arc']), R.pick(['dip', 'arc', 'magma', 'quake']), R.pick(['dip', 'arc', 'quake', 'time']));
    if (kind === 'dip') {
      var x = R.pick([100, 120, 150, 200, 250, 300]), z = R.pick([50, 80, 100, 150, 200, 250]), dip = M.atan(z / x) * DEG;
      return P('Earthquakes along a sinking slab (a Wadati–Benioff zone) are ' + z + ' km deep at a point ' + x + ' km from the trench, measured horizontally. Assuming the slab dips at a constant angle from the trench, what is its dip angle?', { t: 'num', v: ans(dip, 3), tol: 0.5 },
        ['Draw the slab as the hypotenuse of a right triangle: ' + x + ' km across and ' + z + ' km down.', '$\\tan(\\text{dip}) = \\dfrac{' + z + '}{' + x + '} = ' + fd(z / x, 4) + '$.', 'Dip $= \\tan^{-1}(' + fd(z / x, 4) + ') \\approx ' + fd(dip, 1) + '^\\circ$.'],
        'Depth over horizontal distance is the tangent of the dip.', { unit: '°', viz: { name: 'es-boundary', opts: { type: 'ocean-continent', quakes: true, dip: M.round(dip), quiet: true, lock: true } }, vf: { k: 'dip', x: x, z: z } });
    }
    if (kind === 'arc') {
      var dp = R.pick([20, 25, 30, 35, 40, 45, 50, 60]), dist = 100 / M.tan(dp * RAD);
      return P('Arc volcanoes sit above the place where the sinking slab reaches about 100 km deep, where water driven out of it melts the mantle above. If a slab dips ' + dp + '° from the trench, about how far from the trench (horizontally) will the volcanoes be?', num(dist, 3, 0.01),
        ['$\\tan ' + dp + '^\\circ = \\dfrac{100}{x}$, so $x = \\dfrac{100}{\\tan ' + dp + '^\\circ} = \\dfrac{100}{' + fd(M.tan(dp * RAD), 4) + '}$.', '$x \\approx ' + fd(dist, 0) + '\\,\\text{km}$.', 'Gently dipping slabs put their volcanoes far inland; steep slabs put them close to the trench.'],
        'Distance = depth ÷ tan(dip).', { unit: 'km', viz: { name: 'es-boundary', opts: { type: 'ocean-continent', melt: true, dip: dp, quiet: true, lock: true } }, vf: { k: 'arc', dip: dp } });
    }
    if (kind === 'quake') {
      var dp2 = R.pick([30, 40, 45, 50, 60]), x2 = R.pick([50, 100, 150, 200, 250]), z2 = x2 * M.tan(dp2 * RAD);
      return P('A slab dips ' + dp2 + '° from the trench. How deep below a point ' + x2 + ' km inland from the trench will earthquakes in the slab be?', num(z2, 3, 0.01),
        ['Depth $= x \\tan(\\text{dip}) = ' + x2 + ' \\times \\tan ' + dp2 + '^\\circ = ' + x2 + ' \\times ' + fd(M.tan(dp2 * RAD), 4) + ' \\approx ' + fd(z2, 0) + '\\,\\text{km}$.', 'Earthquakes trace the cold slab down to as deep as about 700 km; the hot mantle around it flows instead of breaking.'],
        'Depth = horizontal distance × tan(dip).', { unit: 'km', vf: { k: 'quake', dip: dp2, x: x2 } });
    }
    if (kind === 'time') {
      var len = R.pick([300, 500, 600, 800, 1000]), v = R.pick([30, 50, 60, 80, 100]), t = len / v;
      return P('A slab has slid ' + len + ' km down into the mantle at a subduction zone where the plates converge at ' + v + ' mm per year. How many million years has subduction been going on?', num(t, 3, 0.01),
        [v + ' mm/yr = ' + v + ' km per million years.', 'Time $= ' + len + ' \\div ' + v + ' = ' + fd(t, 1) + '$ million years.'],
        'Time = length ÷ rate (mm/yr = km per million years).', { unit: 'million years', vf: { k: 'time', len: len, v: v } });
    }
    if (kind === 'dense') return P('An ocean plate meets a continental plate. Which one sinks, and why?', mc('The ocean plate, because oceanic lithosphere is denser than continental lithosphere', ['The continental plate, because continents are heavier overall', 'Whichever plate is moving faster', 'Neither; they always crumple into mountains']),
      ['Oceanic crust is basalt and gabbro, about 3.0 g/cm³; continental crust averages about 2.7 g/cm³.', 'Old ocean lithosphere is also cold and thick, so it sinks beneath the buoyant continent at a trench.'], 'Compare their densities.', { vf: { k: 'dense' } });
    return bankQ(R, [
      ['Where does the magma for arc volcanoes such as the Cascades or the Andes come from?', 'Water released from the sinking slab lowers the melting point of the hot mantle above it',
        ['The sinking slab melts completely as it goes down', 'Friction between the plates melts the rock', 'Seawater boils into magma at the trench'],
        ['The slab is cold and mostly stays solid as it sinks.', 'Heat and pressure drive water out of its minerals at roughly 100 km depth. The water rises into the hot mantle wedge above, which then partly melts (flux melting).', 'That basalt magma rises, and on its way through the crust it can change toward andesite.'], 'What does the slab give off?']
    ], 'magma');
  });

  G('geology.collisions-and-rifts', function (R, ctx) {
    var kind = by(ctx, R.pick(['example', 'buoy', 'thick']), R.pick(['thick', 'example', 'rift', 'buoy']), R.pick(['uplift', 'thick', 'rift', 'uplift']));
    if (kind === 'thick') {
      var H0 = R.pick([30, 35, 40]), L0 = R.pick([300, 400, 500, 600]), f = R.pick([0.5, 0.6, 0.4, 0.75]), L = L0 * f, H = H0 / f;
      return P('In a continental collision, a belt of crust ' + L0 + ' km wide and ' + H0 + ' km thick is squeezed to ' + fd(L, 0) + ' km wide. If no rock is lost, how thick does the crust become?', num(H, 3, 0.01),
        ['In cross-section, area is conserved: width × thickness stays the same.', '$' + L0 + ' \\times ' + H0 + ' = ' + fd(L, 0) + ' \\times H$.', '$H = \\dfrac{' + T.commas(L0 * H0) + '}{' + fd(L, 0) + '} = ' + fd(H, 1) + '\\,\\text{km}$. Under Tibet the crust is about 70 km thick, about double normal.'],
        'Keep width × thickness the same.', { unit: 'km', vf: { k: 'thick', H0: H0, L0: L0, L: L } });
    }
    if (kind === 'uplift') {
      var dH = R.pick([10, 15, 20, 25, 30, 35]), h = dH * (RHO_M - RHO_C) / RHO_M;
      return P('Collision thickens a region\'s crust by ' + dH + ' km. In isostatic balance (crust 2.7 g/cm³, mantle 3.3 g/cm³), the extra crust splits into a part above the old surface ($h$) and a root below ($r = 4.5h$). How much higher does the surface stand?', num(h, 3, 0.01),
        ['The extra thickness is $h + r = h + 4.5h = 5.5h$.', '$5.5h = ' + dH + '$, so $h = ' + dH + ' \\div 5.5 = ' + fd(h, 2) + '\\,\\text{km}$.', 'Only about 18% of the thickening shows as height; the rest is root. That is how a doubled crust can hold up a plateau about 5 km high, like Tibet.'],
        'The extra thickness is the height plus the root, and the root is 4.5 times the height.', { unit: 'km', vf: { k: 'uplift', dH: dH } });
    }
    if (kind === 'rift') {
      var H1 = R.pick([30, 35, 40]), beta = R.pick([1.5, 2, 2.5, 3, 4]);
      return P('A continent is stretched in a rift until it is ' + fd(beta, 1) + ' times as wide as before (a stretching factor of ' + fd(beta, 1) + '). If the crust was ' + H1 + ' km thick and its volume stays the same, how thick is it now?', num(H1 / beta, 3, 0.01),
        ['Width × thickness stays the same in cross-section, so stretching by ' + fd(beta, 1) + ' thins by the same factor.', '$' + H1 + ' \\div ' + fd(beta, 1) + ' = ' + fd(H1 / beta, 1) + '\\,\\text{km}$.', 'Thinned crust sinks, so rifts become long valleys; stretch far enough and the continent splits and a new ocean floods in, as in the Red Sea.'],
        'Thickness × width stays the same.', { unit: 'km', vf: { k: 'rift', H: H1, b: beta } });
    }
    if (kind === 'example') {
      var E = [['the Himalayas and the Tibetan Plateau', 'A continent–continent collision'], ['the East African Rift', 'A continental rift, where a continent is pulling apart'], ['the Red Sea', 'A young, narrow ocean that opened from a rift'], ['the Andes', 'An ocean plate sinking beneath a continent']];
      var e = R.pick(E);
      return P('What kind of plate boundary built ' + e[0] + '?', mc(e[1], E.filter(function (q) { return q !== e; }).map(function (q) { return q[1]; })),
        [{ 'A continent–continent collision': 'India ran into Asia about 50 million years ago. Neither continent could sink far, so the crust crumpled and thickened into the highest mountains on Earth.', 'A continental rift, where a continent is pulling apart': 'East Africa is being stretched; the crust thins, faults drop long valleys, and volcanoes erupt.', 'A young, narrow ocean that opened from a rift': 'Arabia split from Africa and new ocean floor now forms along the middle of the Red Sea.', 'An ocean plate sinking beneath a continent': 'The Nazca plate sinks beneath South America, building the Andes and their volcanoes.' }[e[1]]],
        'Is it squeezing, stretching, or sinking?', { vf: { k: 'example' } });
    }
    return bankQ(R, [
      ['When two continents collide, why doesn\'t one of them sink into the mantle like ocean floor does?', 'Continental crust is too light (buoyant) to sink far, so it crumples and thickens into high mountains',
        ['Continents are too hot to sink', 'Continents are held up by the ocean', 'One always sinks completely within a few years'],
        ['Continental crust averages about 2.7 g/cm³, much lighter than the mantle (about 3.3).', 'It can be dragged down a little way, but it bobs back up; instead the crust stacks and thickens, as in the Himalayas.'], 'Compare densities.']
    ], 'buoy');
  });

  G('geology.transform-faults', function (R, ctx) {
    var kind = by(ctx, R.pick(['active', 'active', 'fz']), R.pick(['sense', 'active', 'rate']), R.pick(['sense', 'sense', 'rate', 'offset']));
    if (kind === 'sense') {
      var west = R.coin(), off = R.pick([40, 60, 80, 100, 150]);
      var right = west; // north segment offset to the west -> right-lateral (see the steps)
      return P('A mid-ocean ridge runs north–south and spreads east–west. Its northern segment is offset ' + off + ' km to the ' + (west ? 'west' : 'east') + ' of its southern segment, joined by an east–west transform fault. Standing on the south side of the transform, looking north across it, which way does the far side move?', mc(right ? 'To the right: right-lateral' : 'To the left: left-lateral', [right ? 'To the left: left-lateral' : 'To the right: right-lateral', 'It doesn\'t move; transform faults are inactive', 'Up and down: it is a normal fault']),
        ['On the active part of the transform, between the two ridge segments, the north side belongs to the plate on the ' + (west ? 'east' : 'west') + ' side of the northern segment, so it moves ' + (west ? 'east' : 'west') + '.', 'The south side belongs to the plate on the ' + (west ? 'west' : 'east') + ' side of the southern segment, so it moves ' + (west ? 'west' : 'east') + '.', 'Looking north from the south side, the far side moves ' + (west ? 'east, to your right: right-lateral' : 'west, to your left: left-lateral') + '.', 'Notice that the offset itself looks the opposite way: the slip comes from spreading, not from the ridge being dragged apart.'],
        'Ask which plate each side of the transform belongs to, and which way that plate spreads.', { vf: { k: 'sense', west: west } });
    }
    if (kind === 'active') return P('A transform fault joins two offset segments of a mid-ocean ridge, and fracture zones continue beyond them. Where do the plates actually slide past each other?', mc('Only on the part between the two ridge segments', ['Along the whole fracture zone, out to the edge of the ocean', 'Only beyond the ridge segments', 'Along the ridge crests, not the transform']),
      ['Between the segments, the two sides of the fault belong to different plates moving in opposite directions: that part is active, with earthquakes.', 'Beyond the segments, both sides belong to the same plate and move together. The fracture zone there is just a scar, with no slip and few earthquakes.'],
      'On which part do the two sides belong to different plates?', { vf: { k: 'active' } });
    if (kind === 'rate') {
      var h = R.pick([10, 15, 20, 25, 30, 40]);
      return P('A ridge spreads at a half rate of ' + h + ' mm/yr on each side. How fast do the two sides of the active transform fault that offsets it slide past each other?', num(2 * h, 3, 0.005),
        ['Each side moves away from its own ridge segment at ' + h + ' mm/yr, in opposite directions.', 'So they slide past each other at the full rate: $2 \\times ' + h + ' = ' + (2 * h) + '\\,\\text{mm/yr}$.'],
        'Each side moves at the half rate, in opposite directions.', { unit: 'mm/yr', vf: { k: 'rate', h: h } });
    }
    if (kind === 'offset') return P('A transform fault offsets two ridge segments by 80 km. As spreading continues for millions of years, what happens to the 80 km offset?', mc('It stays about the same, because both segments keep making new seafloor in place', ['It grows by the spreading rate every year', 'It shrinks to zero within a million years', 'It doubles every million years']),
      ['A transform fault does not drag the ridge segments apart: each segment stays put while plates spread away from it.', 'So the offset between segments can stay about the same for millions of years, even though the two sides of the active transform slide past each other the whole time.'], 'Do the ridge segments themselves move apart?', { vf: { k: 'offset' } });
    return bankTF(R, [
      ['The fracture zone beyond the ridge segments is just as active as the transform fault between them.', false, ['Beyond the segments both sides of the fracture zone are on the same plate, moving the same way, so there is no slip.', 'Earthquakes cluster on the active transform between the segments.'], 'Which plates are on each side?'],
      ['A transform fault is a strike-slip fault that forms a plate boundary.', true, ['At a transform boundary, plates slide sideways past each other, neither making nor destroying crust.', 'The San Andreas Fault is a transform fault on land.'], 'Which way do the plates move along it?']
    ], 'fz');
  });

  var WILSON = [['A continent starts to pull apart, with a long rift valley and volcanoes', 'the East African Rift'], ['A narrow new ocean opens between the two pieces', 'the Red Sea'], ['A wide ocean with quiet edges grows at a mid-ocean ridge', 'the Atlantic Ocean'],
    ['The ocean floor starts to sink at subduction zones around its edges', 'the Pacific Ocean'], ['The ocean shrinks as continents close in', 'the Mediterranean Sea'], ['The continents collide and build a great mountain belt', 'the Himalayas']];
  G('geology.wilson-cycle', function (R, ctx) {
    var kind = by(ctx, R.pick(['stage', 'stage', 'super']), R.pick(['stage', 'order', 'time']), R.pick(['order', 'time', 'stage', 'super']));
    if (kind === 'stage') {
      var i = R.int(0, 5), w = WILSON[i];
      return P('Which stage of the Wilson cycle does ' + w[1] + ' show today?', mc(w[0], R.sample(WILSON.filter(function (q, j) { return j !== i; }).map(function (q) { return q[0]; }), 3)),
        ['The Wilson cycle: rifting, a young narrow ocean, a wide ocean, subduction begins, the ocean closes, and continents collide.', w[1].charAt(0).toUpperCase() + w[1].slice(1) + ': ' + w[0].charAt(0).toLowerCase() + w[0].slice(1) + '.'],
        'Is the ocean opening, wide, or closing?', { vf: { k: 'stage', i: i } });
    }
    if (kind === 'order') {
      var set = R.sample([0, 1, 2, 3, 4, 5], 4), lab = set.map(function (j, n) { return { L: LET[n], j: j, s: WILSON[j][1] }; }), ord = lab.slice().sort(function (a, b) { return a.j - b.j; });
      return P('Each place below is at a different stage of the Wilson cycle. Put them in the order an ocean basin goes through, from the first stage to the last. Type the letters. ' + lab.map(function (q) { return q.L + ': ' + q.s; }).join('; ') + '.', order(ord.map(function (q) { return q.L; })),
        ['The cycle: rift (East African Rift), young ocean (Red Sea), wide ocean (Atlantic), subduction begins (Pacific), closing (Mediterranean), collision (Himalayas).', 'So: ' + ord.map(function (q) { return q.L + ' (' + q.s + ')'; }).join(', ') + '.'],
        'Opening first, then wide, then closing, then collision.', { vf: { k: 'order', lab: lab } });
    }
    if (kind === 'time') {
      var full = R.pick([20, 25, 30, 40, 50]), wkm = R.pick([3000, 4000, 4500, 5000, 6000]), t = wkm / full;
      return P('How long would it take to open an ocean ' + T.commas(wkm) + ' km wide at a full spreading rate of ' + full + ' mm per year, in million years?', num(t, 3, 0.01),
        [full + ' mm/yr = ' + full + ' km per million years.', 'Time $= ' + T.commas(wkm) + ' \\div ' + full + ' = ' + fd(t, 0) + '$ million years.', 'Opening and closing an ocean takes hundreds of millions of years; a full Wilson cycle lasts very roughly 300 to 500 million years.'],
        'Time = width ÷ full rate.', { unit: 'million years', vf: { k: 'time', w: wkm, f: full } });
    }
    return bankQ(R, [
      ['Was Pangaea the first and only supercontinent?', 'No; there were earlier ones, such as Rodinia about a billion years ago',
        ['Yes; the continents were all joined from Earth\'s start until Pangaea split', 'Yes; supercontinents can form only once', 'No; there is a supercontinent today'],
        ['Mountain belts and matching rocks on different continents record several rounds of assembly and breakup.', 'Rodinia came together about a billion years ago and broke apart starting around 750 million years ago; an older one (Columbia, or Nuna) may date to about 1.8 billion years ago. Pangaea formed only about 300 million years ago.'], 'What came before Pangaea?']
    ], 'super');
  });

// ---- 09_quakes.js
  // =====================================================================================
  // Unit 9: Earthquakes
  // =====================================================================================

  G('geology.elastic-rebound', function (R, ctx) {
    var kind = by(ctx, R.pick(['recur', 'recur', 'why']), R.pick(['recur', 'deficit', 'rate', 'count']), R.pick(['rate', 'count', 'deficit', 'recur']));
    if (kind === 'recur') {
      var v = R.pick([5, 10, 20, 25, 30, 35, 40]), s = R.pick([1, 1.5, 2, 3, 4, 5, 6]), Tr = s * 1000 / v;
      return P('The two sides of a locked fault are carried past each other at ' + v + ' mm per year. Each large earthquake on it slips about ' + fd(s, 1) + ' m. On average, how many years pass between large earthquakes?', num(Tr, 3, 0.01),
        ['Between quakes, the rock bends and stores up the motion until the fault slips by the same amount.', 'Slip per quake in millimeters: $' + fd(s, 1) + '\\,\\text{m} = ' + T.commas(s * 1000) + '\\,\\text{mm}$.', 'Time to store that much: $' + T.commas(s * 1000) + ' \\div ' + v + ' \\approx ' + T.commas(M.round(Tr)) + '$ years, on average. Real faults vary; this is an average, not a schedule.'],
        'Divide the slip per earthquake by the slip rate (in the same units).', { unit: 'years', viz: { name: 'es-structures', opts: { mode: 'rebound', rate: v, slipPerQuake: s, quiet: true } }, vf: { k: 'recur', v: v, s: s } });
    }
    if (kind === 'deficit') {
      var v2 = R.pick([10, 20, 25, 30, 35]), yrs = R.pick([80, 100, 120, 150, 200, 300]), d = v2 * yrs / 1000;
      return P('A fault segment slips at a long-term average of ' + v2 + ' mm per year, but it has been locked since its last big earthquake ' + yrs + ' years ago. How many meters of slip have built up, waiting to be released?', num(d, 3, 0.01),
        ['Slip stored $= ' + v2 + '\\,\\text{mm/yr} \\times ' + yrs + '\\,\\text{yr} = ' + T.commas(v2 * yrs) + '\\,\\text{mm}$.', 'That is $' + fd(d, 2) + '\\,\\text{m}$, enough for a large earthquake.'],
        'Multiply the rate by the time, then change millimeters to meters.', { unit: 'm', vf: { k: 'deficit', v: v2, yrs: yrs } });
    }
    if (kind === 'rate') {
      var off = R.pick([150, 240, 300, 400, 450, 600]), ky = R.pick([6, 10, 12, 15, 20]), rate = off * 1000 / (ky * 1000);
      return P('A stream channel that crossed a strike-slip fault has been offset ' + off + ' m. The channel formed about ' + T.commas(ky * 1000) + ' years ago. What is the fault\'s average slip rate in mm per year?', num(rate, 3, 0.01),
        ['Offset in millimeters: $' + off + '\\,\\text{m} = ' + T.commas(off * 1000) + '\\,\\text{mm}$.', 'Rate $= ' + T.commas(off * 1000) + ' \\div ' + T.commas(ky * 1000) + ' = ' + fd(rate, 1) + '\\,\\text{mm/yr}$.', 'Offset streams along the San Andreas Fault give rates of a few centimeters a year this way.'],
        'Rate = offset ÷ time, in millimeters and years.', { unit: 'mm/yr', vf: { k: 'rate', off: off, ky: ky } });
    }
    if (kind === 'count') {
      var m1 = R.int(4, 6), dM = R.int(1, 2), n = M.pow(10, 1.5 * dM);
      return P('Each step of 1 in magnitude means about 32 times more energy ($10^{1.5}$). About how many magnitude ' + m1 + ' earthquakes would it take to release the energy of one magnitude ' + (m1 + dM) + ' earthquake?', num(n, 2, 0.03),
        ['The difference is ' + dM + ' in magnitude.', 'Energy ratio $= 10^{1.5 \\times ' + dM + '} = 10^{' + fd(1.5 * dM, 1) + '} \\approx ' + T.commas(rnd(n, 2)) + '$.', 'So small earthquakes cannot "use up" the strain of a big one: there would have to be ' + (dM === 2 ? 'a thousand' : 'about thirty') + ' of them.'],
        'Energy grows by about 32 times per magnitude step.', { vf: { k: 'count', dM: dM } });
    }
    return bankQ(R, [
      ['A town feels many small earthquakes. A neighbor says they release the strain on the fault, so a big one is less likely. What is the problem with that idea?', 'Small quakes release very little energy: it takes about 1,000 magnitude 5 quakes to equal one magnitude 7',
        ['Nothing; small quakes always prevent big ones', 'Small quakes add strain instead of releasing it', 'Faults never have big earthquakes after small ones'],
        ['Energy grows about 32 times per magnitude step, so two steps is about $32 \\times 32 \\approx 1,000$.', 'A fault storing enough strain for a magnitude 7 cannot be emptied by a scattering of small quakes.'], 'Compare the energies.'],
      ['What happens to the rock on both sides of a locked fault between earthquakes?', 'It slowly bends and stores strain, like a bent stick, until the fault suddenly slips and the rock snaps back',
        ['It stays perfectly still until the earthquake', 'It melts slowly', 'It slides smoothly all the time'],
        ['The plates keep moving, but friction holds the fault shut.', 'The rock nearby bends elastically. When the stress overcomes the friction, the fault slips in seconds and the bent rock springs back: elastic rebound, first described after the 1906 San Francisco earthquake.'], 'Think of bending a stick until it snaps.']
    ], 'why');
  });

  G('geology.locating-earthquakes', function (R, ctx) {
    var kind = by(ctx, R.pick(['dist', 'dist', 'why']), R.pick(['dist', 'gap', 'travel', 'dist']), R.pick(['speeds', 'travel', 'gap', 'speeds']));
    var vp = 6, vs = 3.5;
    if (kind === 'speeds') { vp = R.pick([5.5, 6, 6.5, 7]); vs = R.pick([3.2, 3.5, 3.8, 4]); }
    var k = vp * vs / (vp - vs);
    if (kind === 'dist' || kind === 'speeds') {
      var lag = R.int(4, 60), d = lag * k;
      return P('At a seismograph station, the S waves arrive ' + lag + ' s after the P waves. P waves travel ' + fd(vp, 1) + ' km/s and S waves ' + fd(vs, 1) + ' km/s through the crust. How far away was the earthquake?', num(d, 3, 0.01),
        ['Both waves left at the same moment and covered the same distance $d$: $\\dfrac{d}{' + fd(vs, 1) + '} - \\dfrac{d}{' + fd(vp, 1) + '} = ' + lag + '$.', 'Factor out $d$: $d\\left(\\dfrac{1}{' + fd(vs, 1) + '} - \\dfrac{1}{' + fd(vp, 1) + '}\\right) = ' + lag + '$, so $d = ' + lag + ' \\times \\dfrac{' + fd(vp, 1) + ' \\times ' + fd(vs, 1) + '}{' + fd(vp, 1) + ' - ' + fd(vs, 1) + '} = ' + lag + ' \\times ' + fd(k, 2) + '$.', '$d \\approx ' + fd(d, 0) + '\\,\\text{km}$.'],
        'Each second of S−P gap stands for the same number of kilometers.', { unit: 'km', viz: { name: 'es-seismic', opts: { mode: 'seismograms', vp: vp, vs: vs, stations: [{ name: 'Station', distance: M.round(d) }], quiet: true } }, vf: { k: 'dist', lag: lag, vp: vp, vs: vs } });
    }
    if (kind === 'gap') {
      var d2 = 42 * R.int(1, 12), lag2 = d2 / k;
      return P('An earthquake happens ' + d2 + ' km from a station. With P waves at 6 km/s and S waves at 3.5 km/s, how many seconds after the P waves will the S waves arrive?', num(lag2, 3, 0.01),
        ['P travel time: $' + d2 + ' \\div 6 = ' + fd(d2 / 6, 2) + '\\,\\text{s}$. S travel time: $' + d2 + ' \\div 3.5 = ' + fd(d2 / 3.5, 2) + '\\,\\text{s}$.', 'Gap: $' + fd(d2 / 3.5, 2) + ' - ' + fd(d2 / 6, 2) + ' = ' + fd(lag2, 1) + '\\,\\text{s}$ (about 1 s for every 8.4 km).'],
        'Find each wave\'s travel time and subtract.', { unit: 's', vf: { k: 'gap', d: d2 } });
    }
    if (kind === 'travel') {
      var lag3 = R.int(6, 40), d3 = lag3 * k, tp = d3 / vp;
      return P('A station records the P wave and, ' + lag3 + ' s later, the S wave (P at 6 km/s, S at 3.5 km/s). How many seconds before the P wave arrived did the earthquake begin?', num(tp, 3, 0.01),
        ['Distance: $d = ' + lag3 + ' \\times 8.4 = ' + fd(d3, 0) + '\\,\\text{km}$.', 'P travel time: $' + fd(d3, 0) + ' \\div 6 = ' + fd(tp, 1) + '\\,\\text{s}$.', 'So the quake began ' + fd(tp, 1) + ' s before the P wave arrived. With one arrival alone you could not know this; the S−P gap gives the distance, and the distance gives the start time.'],
        'First find the distance from the S−P gap.', { unit: 's', vf: { k: 'travel', lag: lag3 } });
    }
    return bankQ(R, [
      ['Why can\'t a single P-wave arrival time tell you how far away an earthquake was?', 'You don\'t know exactly when the earthquake began, so the travel time is unknown',
        ['P waves travel at random speeds', 'P waves arrive at the same time everywhere', 'Seismographs can\'t record P waves'],
        ['Distance = speed × travel time, and travel time = arrival time − start time.', 'The start time is what you don\'t know. But P and S waves start together and travel at different speeds, so the gap between them grows with distance and gives the distance directly.'], 'What would you need besides the arrival time?']
    ], 'why');
  });

  var PYT = [[30, 40, 50], [60, 80, 100], [50, 120, 130], [90, 120, 150], [80, 150, 170], [120, 160, 200], [70, 240, 250], [150, 200, 250], [100, 240, 260], [120, 90, 150], [160, 120, 200], [40, 30, 50]];
  G('geology.epicenter', function (R, ctx) {
    var kind = by(ctx, R.pick(['pick', 'pick', 'why']), R.pick(['pick', 'point', 'why']), R.pick(['point', 'lag', 'point']));
    if (kind === 'why') return bankQ(R, [
      ['Why does locating an epicenter need at least three stations?', 'Each station gives only a distance (a circle); two circles usually cross at two points, and the third circle picks one',
        ['Two stations always agree exactly', 'Three stations are needed to measure the magnitude', 'The epicenter is the average of the three station positions'],
        ['From the S−P gap, a station knows how far away the quake was, but not in which direction: the epicenter is somewhere on a circle around it.', 'Two circles cross at two points; only one of them also lies on the third station\'s circle.'], 'What does one station tell you?']
    ], 'why');
    var st, E, M2, tries = 0;
    do {
      E = [R.int(-8, 8) * 10, R.int(-8, 8) * 10]; var offs = R.sample(PYT, 3); st = offs.map(function (o) { var sw = R.coin(), a = sw ? o[1] : o[0], b = sw ? o[0] : o[1]; return { x: E[0] + R.sign() * a, y: E[1] + R.sign() * b, r: o[2] }; });
      var ok = st.every(function (s) { return M.abs(s.x) <= 250 && M.abs(s.y) <= 250; }) && st[0].x !== st[1].x || st[0].y !== st[1].y;
      // mirror of E across the line through stations 1 and 2: the other place where their circles cross
      var dx = st[1].x - st[0].x, dy = st[1].y - st[0].y, L2 = dx * dx + dy * dy, t = ((E[0] - st[0].x) * dx + (E[1] - st[0].y) * dy) / L2, fx0 = st[0].x + t * dx, fy0 = st[0].y + t * dy;
      M2 = [2 * fx0 - E[0], 2 * fy0 - E[1]];
      var dE = M.abs(M.hypot(M2[0] - st[2].x, M2[1] - st[2].y) - st[2].r), far = M.hypot(M2[0] - E[0], M2[1] - E[1]);
      ok = ok && st.every(function (s) { return M.abs(s.x) <= 250 && M.abs(s.y) <= 250; }) && dE > 25 && far > 40 && M.abs(M2[0]) < 400 && M.abs(M2[1]) < 400;
      tries++;
    } while (!ok && tries < 60);
    var Mr = [M.round(M2[0]), M.round(M2[1])], first = R.coin(), P1 = first ? E : Mr, P2 = first ? Mr : E;
    var lag = kind === 'lag', lags = st.map(function (s) { return s.r / 8.4; });
    var stTxt = st.map(function (s, i) { return 'Station ' + (i + 1) + ' at $(' + s.x + ', ' + s.y + ')$ is ' + (lag ? 'reached with an S−P gap of ' + fd(lags[i], 2) + ' s' : s.r + ' km from the quake'); }).join('; ');
    var q = 'On a map grid in kilometers: ' + stTxt + '.' + (lag ? ' (Use 8.4 km per second of S−P gap.)' : '') + ' The circles around stations 1 and 2 cross at $P' + T.pt(P1) + '$ and $Q' + T.pt(P2) + '$. ';
    var steps = [lag ? 'Distances: ' + st.map(function (s, i) { return fd(lags[i], 2) + ' × 8.4 ≈ ' + s.r + ' km'; }).join(', ') + '.' : 'Each station knows only its distance, so the quake lies on a circle around each one.',
      'Distance from station 3 to $' + T.pt(E) + '$: $\\sqrt{' + T.p(E[0] - st[2].x) + '^2 + ' + T.p(E[1] - st[2].y) + '^2} = ' + st[2].r + '$ km, which matches.',
      'Distance from station 3 to $' + T.pt(Mr) + '$: about $' + fd(M.hypot(Mr[0] - st[2].x, Mr[1] - st[2].y), 0) + '$ km, which does not.', 'So the epicenter is $' + T.pt(E) + '$.'];
    var vz = { name: 'es-seismic', opts: { mode: 'locate', stations: st.map(function (s, i) { return { x: s.x, y: s.y, lag: r2(lags[i], 2), name: 'Station ' + (i + 1) }; }), circles: false, quiet: true, lock: true } };
    if (kind === 'pick') return P(q + 'Which one is the epicenter?', mcK(['$P' + T.pt(P1) + '$', '$Q' + T.pt(P2) + '$', 'Both of them', 'Neither of them'], first ? 0 : 1), steps, 'Check which point is the right distance from station 3.', { viz: vz, vf: { k: 'pick', st: st, E: E } });
    return P(q + 'Give the epicenter as a point $(x, y)$.', { t: 'tuple', v: [String(E[0]), String(E[1])] }, steps, 'Check which crossing point is the right distance from station 3.', { unit: 'km', viz: vz, vf: { k: 'point', st: st, E: E, P: P1, Q: P2 } });
  });

  G('geology.moment-magnitude', function (R, ctx) {
    var kind = by(ctx, R.pick(['amp', 'energy', 'why']), R.pick(['energy', 'count', 'M0', 'amp']), R.pick(['mw', 'mw', 'M0', 'energy']));
    if (kind === 'amp' || kind === 'energy') {
      var dM = kind === 'amp' ? R.int(1, 3) : R.pick([1, 2, 0.5, 3, 1.5]), m1 = R.int(3, 6), ratio = kind === 'amp' ? M.pow(10, dM) : M.pow(10, 1.5 * dM);
      return P('A magnitude ' + fd(m1 + dM, 1) + ' earthquake is compared with a magnitude ' + m1 + ' earthquake. About how many times ' + (kind === 'amp' ? 'larger are its seismic waves (on a seismogram at the same distance)' : 'more energy does it release') + '?', num(ratio, 3, 0.02),
        [kind === 'amp' ? 'Each step of 1 in magnitude means waves 10 times larger.' : 'Each step of 1 in magnitude means about $10^{1.5} \\approx 31.6$ times more energy.', 'Difference: ' + fd(dM, 1) + '.', 'Ratio $= 10^{' + (kind === 'amp' ? dM : fd(1.5 * dM, 2)) + '} \\approx ' + T.commas(rnd(ratio, 3)) + '$.'],
        kind === 'amp' ? 'Waves grow 10 times per magnitude step.' : 'Energy grows $10^{1.5}$ times per magnitude step.', { unit: 'times', vf: { k: kind, dM: dM } });
    }
    if (kind === 'count') {
      var a = R.int(3, 5), b = a + R.int(1, 3), n = M.pow(10, 1.5 * (b - a));
      return P('How many magnitude ' + a + ' earthquakes would release as much energy as one magnitude ' + b + '?', num(n, 3, 0.02),
        ['Energy ratio $= 10^{1.5(' + b + ' - ' + a + ')} = 10^{' + fd(1.5 * (b - a), 1) + '} \\approx ' + T.commas(rnd(n, 3)) + '$.', 'So about ' + T.commas(rnd(n, 3)) + ' of the smaller quakes.'],
        'Use $10^{1.5 \\Delta M}$.', { vf: { k: 'count', a: a, b: b } });
    }
    var Lk = R.pick([20, 40, 60, 100, 200, 400, 1000]), Wk = R.pick([10, 15, 20, 30, 50, 100]), D = R.pick([0.5, 1, 2, 3, 5, 8, 10]);
    if (Lk >= 400 && Wk < 50) Wk = 100; if (Lk <= 40 && D > 3) D = 1;
    var A = Lk * Wk, M0 = 3e10 * A * 1e6 * D, Mw = 2 / 3 * (M.log10(M0) - 9.1);
    var stepsM0 = ['Area: $A = ' + Lk + '\\,\\text{km} \\times ' + Wk + '\\,\\text{km} = ' + T.commas(A) + '\\,\\text{km}^2 = ' + fx(A * 1e6, 3) + '\\,\\text{m}^2$.', 'Seismic moment: $M_0 = \\mu A D = (3 \\times 10^{10})(' + fx(A * 1e6, 3) + ')(' + fd(D, 1) + ') = ' + fx(M0, 3) + '\\,\\text{N·m}$.'];
    if (kind === 'M0') return P('A fault ruptures over a patch ' + Lk + ' km long and ' + Wk + ' km deep, with an average slip of ' + fd(D, 1) + ' m. The rock\'s rigidity is $\\mu = 3 \\times 10^{10}\\,\\text{Pa}$. What is the seismic moment $M_0 = \\mu A D$, in newton-meters?', num(M0, 3, 0.02),
      stepsM0.concat(['Seismic moment measures how much rock broke and how far it moved; it keeps growing without any top value.']), 'Change the area to square meters first.', { unit: 'N·m', vf: { k: 'M0', L: Lk, W: Wk, D: D } });
    if (kind === 'mw') return P('A fault ruptures over a patch ' + Lk + ' km long and ' + Wk + ' km deep, with an average slip of ' + fd(D, 1) + ' m ($\\mu = 3 \\times 10^{10}\\,\\text{Pa}$). Using $M_w = \\tfrac{2}{3}(\\log_{10} M_0 - 9.1)$ with $M_0 = \\mu A D$ in N·m, what is the moment magnitude? (Give one decimal place.)', { t: 'num', v: fd(Mw, 1).replace(/,/g, ''), tol: 0.06 },
      stepsM0.concat(['$\\log_{10} M_0 = ' + fd(M.log10(M0), 3) + '$.', '$M_w = \\tfrac{2}{3}(' + fd(M.log10(M0), 3) + ' - 9.1) \\approx ' + fd(Mw, 2) + '$, so about $' + fd(Mw, 1) + '$.']),
      'Find $M_0$, take its log, then use the formula.', { vf: { k: 'mw', L: Lk, W: Wk, D: D } });
    return bankQ(R, [
      ['Is magnitude 10 the top of the earthquake scale?', 'No; the scale has no top, but no known fault is long enough to make a magnitude 10',
        ['Yes; the scale runs from 1 to 10', 'Yes; magnitude 10 would destroy Earth', 'No; magnitude 12 earthquakes happen about once a century'],
        ['Moment magnitude comes from the fault area times the slip, so it is open-ended.', 'The largest recorded quake, Chile 1960, was about magnitude 9.5 on a rupture roughly 1,000 km long. A magnitude 10 would need a rupture far longer than any known fault.'], 'What sets an earthquake\'s size?']
    ], 'why');
  });

  G('geology.intensity', function (R, ctx) {
    var kind = by(ctx, R.pick(['which', 'which', 'many']), R.pick(['which', 'mmi', 'many', 'soft']), R.pick(['mmi', 'soft', 'which', 'mmi']));
    if (kind === 'which') {
      var a = R.pick([10, 15, 20, 30]), b = a + R.pick([40, 60, 80, 120]), near = R.coin();
      return P('One magnitude 6.5 earthquake shakes two towns built on the same kind of solid rock. Town A is ' + (near ? a : b) + ' km from the epicenter and town B is ' + (near ? b : a) + ' km away. Which town most likely has the higher intensity?', mcK(['Town A', 'Town B', 'Both the same, because an earthquake has one intensity', 'Neither; intensity depends only on magnitude'], near ? 0 : 1),
        ['Magnitude is one number for the whole earthquake; intensity describes shaking at each place.', 'Shaking weakens with distance as the waves spread out and lose energy.', 'So the closer town, ' + (near ? 'A' : 'B') + ', has the higher intensity.'],
        'Intensity is about shaking at a place.', { vf: { k: 'which', near: near } });
    }
    if (kind === 'soft') {
      var soft = R.coin();
      return P('Two neighborhoods are the same distance from an earthquake. Neighborhood A sits on solid bedrock; neighborhood B sits on soft, water-soaked sediment filling an old lake bed. Which most likely has the higher intensity?', mcK(['Neighborhood A, on bedrock', 'Neighborhood B, on soft sediment', 'Both the same'], 1),
        ['Waves slow down and grow taller when they pass from stiff rock into soft sediment, and the sediment can slosh like jelly.', 'Wet sand and silt can also lose strength and flow (liquefaction).', 'In the 1985 Mexico City earthquake, the worst damage was on old lake-bed sediments about 350 km from the epicenter.'],
        'Think of jelly on a plate.', { vf: { k: 'soft' } });
    }
    if (kind === 'mmi') {
      var lv = R.pick([['II', 'Only a few people notice it, mostly those resting on upper floors.'], ['IV', 'Many people indoors notice it; dishes and windows rattle, and it feels as if a heavy truck hit the building.'], ['VI', 'Everyone feels it and many are frightened; some heavy furniture shifts and a little plaster falls, but damage is slight.'], ['VIII', 'Buildings designed for earthquakes are only slightly damaged, but ordinary buildings are badly damaged and some partly collapse; chimneys and walls fall.'], ['X', 'Even some well-built wooden buildings are destroyed, and most brick and frame buildings are wrecked down to their foundations.']]);
      return P('On the Modified Mercalli Intensity scale (I to XII), which level best fits this report? "' + lv[1] + '"', mc(lv[0], ['II', 'IV', 'VI', 'VIII', 'X'].filter(function (x) { return x !== lv[0]; }).slice(0, 3)),
        ['The Modified Mercalli scale rates what people feel and what happens to buildings at one place.', 'II: barely felt; IV: felt indoors by many; VI: felt by all, slight damage; VIII: considerable damage to ordinary buildings; X: most masonry structures destroyed.', 'This report fits ' + lv[0] + '.'],
        'Match the effects to the scale.', { vf: { k: 'mmi' } });
    }
    return bankQ(R, [
      ['How many magnitudes and how many intensities does one earthquake have?', 'One magnitude, but many intensities: one for each place it is felt',
        ['One of each', 'Many magnitudes and one intensity', 'Many of each'],
        ['Magnitude measures the energy released at the source, so there is one value (agencies may refine it as data arrive).', 'Intensity measures shaking where you are, so it changes from place to place: highest near the epicenter and on soft ground, lower far away.'], 'Which one depends on where you stand?']
    ], 'many');
  });

  G('geology.earthquake-odds', function (R, ctx) {
    var kind = by(ctx, R.pick(['easy', 'none', 'add']), R.pick(['atleast', 'T', 'add', 'atleast', 'none']), R.pick(['atleast', 'reverse', 'T', 'reverse']));
    if (kind === 'easy') {
      var p = R.pick([10, 20, 25, 30, 40, 50]), n = R.pick([2, 3]), pr = 1 - M.pow(1 - p / 100, n);
      return P('A fault has a ' + p + '% chance of a large earthquake in any one year, and each year is independent of the others. What is the chance of at least one large earthquake in ' + n + ' years? (Give a percent.)', pnum(pr * 100, 3, 0.005),
        ['Chance of none in one year: $1 - ' + fd(p / 100, 2) + ' = ' + fd(1 - p / 100, 2) + '$.', 'Chance of none in ' + n + ' years: $' + fd(1 - p / 100, 2) + '^{' + n + '} = ' + fd(M.pow(1 - p / 100, n), 4) + '$.', 'Chance of at least one: $1 - ' + fd(M.pow(1 - p / 100, n), 4) + ' = ' + fd(pr, 4) + '$, or $' + fd(pr * 100, 1) + '\\%$. (Adding gives ' + (p * n) + '%, which is too much.)'],
        'Find the chance of none, then subtract from 1.', { unit: '%', vf: { k: 'atleast', p: p / 100, n: n } });
    }
    if (kind === 'none') {
      var pN = R.pick([5, 10, 20, 25, 30, 40, 50]), nN = R.pick([2, 3, 4]), q0 = M.pow(1 - pN / 100, nN);
      return P('A volcano or fault has a ' + pN + '% chance of a major event in any one year, independent from year to year. What is the chance of no major event at all in ' + nN + ' years? (Give a percent.)', pnum(q0 * 100, 3, 0.005),
        ['Chance of no event in one year: $1 - ' + fd(pN / 100, 2) + ' = ' + fd(1 - pN / 100, 2) + '$.', 'For ' + nN + ' quiet years in a row, multiply: $' + fd(1 - pN / 100, 2) + '^{' + nN + '} = ' + fd(q0, 4) + '$, or $' + fd(q0 * 100, 2) + '\\%$.', 'So the chance of at least one is $' + fd(100 - q0 * 100, 2) + '\\%$.'],
        'Multiply the chance of a quiet year by itself once for each year.', { unit: '%', vf: { k: 'none', p: pN / 100, n: nN } });
    }
    if (kind === 'atleast' || kind === 'T') {
      var T0 = kind === 'T' ? R.pick([25, 50, 100, 150, 200]) : null, p2 = kind === 'T' ? 1 / T0 : R.pick([0.01, 0.02, 0.03, 0.04, 0.05]), n2 = R.pick([10, 20, 30, 50]), pr2 = 1 - M.pow(1 - p2, n2);
      return P((kind === 'T' ? 'Large earthquakes on a fault come on average once every ' + T0 + ' years, so the chance in any one year is about $\\tfrac{1}{' + T0 + '}$.' : 'A fault has a ' + fd(p2 * 100, 0) + '% chance of a large earthquake in any one year.') + ' Treating each year as independent, what is the chance of at least one in the next ' + n2 + ' years? (Give a percent.)', pnum(pr2 * 100, 3, 0.01),
        ['Chance of none in a year: $1 - ' + fd(p2, 4) + ' = ' + fd(1 - p2, 4) + '$.', 'None in ' + n2 + ' years: $' + fd(1 - p2, 4) + '^{' + n2 + '} \\approx ' + fd(M.pow(1 - p2, n2), 4) + '$.', 'At least one: $1 - ' + fd(M.pow(1 - p2, n2), 4) + ' \\approx ' + fd(pr2, 3) + '$, about $' + fd(pr2 * 100, 1) + '\\%$.'],
        'Use $1 - (1 - p)^n$.', { unit: '%', vf: { k: 'atleast', p: p2, n: n2 } });
    }
    if (kind === 'reverse') {
      var P30 = R.pick([20, 30, 50, 60, 72]), nn = 30, py = 1 - M.pow(1 - P30 / 100, 1 / nn);
      return P('A forecast gives a ' + P30 + '% chance of at least one large earthquake in the next 30 years. If each year has the same, independent chance, what is the chance in any one year? (Give a percent.)', pnum(py * 100, 3, 0.02),
        ['Chance of none in 30 years: $1 - ' + fd(P30 / 100, 2) + ' = ' + fd(1 - P30 / 100, 2) + '$.', 'That is $(1 - p)^{30}$, so $1 - p = ' + fd(1 - P30 / 100, 2) + '^{1/30} \\approx ' + fd(1 - py, 5) + '$.', '$p \\approx ' + fd(py, 5) + '$, about $' + fd(py * 100, 2) + '\\%$ per year. Dividing ' + P30 + '% by 30 gives ' + fd(P30 / 30, 2) + '%, ' + (P30 >= 50 ? 'noticeably too low' : 'a bit too low') + '.'],
        'Undo $1 - (1-p)^{30}$ step by step.', { unit: '%', vf: { k: 'reverse', P: P30 / 100 } });
    }
    return bankQ(R, [
      ['A fault has a 2% chance of a big earthquake each year. A student says that over 30 years the chance is 60%. What is wrong?', 'Chances can\'t simply be added; the chance of at least one is $1 - 0.98^{30}$, about 45%',
        ['Nothing; 2% × 30 = 60% is right', 'The chance over 30 years is still 2%', 'The chance over 30 years is 100%'],
        ['Adding would count some years twice: the cases with two or more quakes.', 'Work with the chance of none: $0.98^{30} \\approx 0.545$, so at least one is about $1 - 0.545 = 0.455$, about 45%. Added chances can even pass 100%, which is impossible.'], 'What is the chance of none?']
    ], 'add');
  });

  G('geology.tsunamis', function (R, ctx) {
    var kind = by(ctx, R.pick(['speed', 'speed', 'time', 'why']), R.pick(['speed', 'time', 'shallow', 'why']), R.pick(['time', 'lambda', 'shallow', 'time']));
    if (kind === 'speed') {
      var d = R.int(2, 12) * 500, v = M.sqrt(GRAV * d), kmh = R.coin();
      return P('In water much shallower than its wavelength, a tsunami travels at $v = \\sqrt{gd}$. How fast does it cross ocean ' + T.commas(d) + ' m deep' + (kmh ? ', in km/h' : ', in m/s') + '? (Use $g = 9.8\\,\\text{m/s}^2$.)', num(kmh ? v * 3.6 : v, 3, 0.01),
        ['$v = \\sqrt{9.8 \\times ' + T.commas(d) + '} = \\sqrt{' + T.commas(GRAV * d) + '} \\approx ' + fd(v, 0) + '\\,\\text{m/s}$.', (kmh ? 'In km/h: $' + fd(v, 1) + ' \\times 3.6 \\approx ' + fd(v * 3.6, 0) + '\\,\\text{km/h}$, ' : 'That is about $' + fd(v * 3.6, 0) + '\\,\\text{km/h}$, ') + (v * 3.6 > 600 ? 'about as fast as a jet airliner.' : 'faster than a high-speed train.')],
        'Multiply g by the depth and take the square root.', { unit: kmh ? 'km/h' : 'm/s', vf: { k: 'speed', d: d, kmh: kmh } });
    }
    if (kind === 'time') {
      var d2 = R.pick([3000, 4000, 4500, 5000]), Lk = R.pick([1000, 2000, 3000, 5000, 6000, 8000]), v2 = M.sqrt(GRAV * d2), h = Lk * 1000 / v2 / 3600;
      return P('A tsunami crosses ' + T.commas(Lk) + ' km of ocean that averages ' + T.commas(d2) + ' m deep. Using $v = \\sqrt{gd}$, about how many hours does the crossing take?', num(h, 3, 0.02),
        ['Speed: $\\sqrt{9.8 \\times ' + T.commas(d2) + '} \\approx ' + fd(v2, 1) + '\\,\\text{m/s}$.', 'Time: $\\dfrac{' + T.commas(Lk * 1000) + '\\,\\text{m}}{' + fd(v2, 1) + '\\,\\text{m/s}} \\approx ' + T.commas(M.round(Lk * 1000 / v2)) + '\\,\\text{s}$.', 'In hours: $\\div 3,600 \\approx ' + fd(h, 1) + '\\,\\text{h}$. Warning centers use these travel times to alert coasts far from the earthquake.'],
        'Find the speed, then time = distance ÷ speed.', { unit: 'h', vf: { k: 'time', d: d2, L: Lk } });
    }
    if (kind === 'shallow') {
      var dd = R.pick([4000, 5000]), ds = R.pick([10, 20, 40, 50]), r = M.sqrt(dd / ds);
      return P('A tsunami moves from the open ocean, ' + T.commas(dd) + ' m deep, onto a shelf only ' + ds + ' m deep. Using $v = \\sqrt{gd}$, by what factor does it slow down?', num(r, 3, 0.01),
        ['The ratio of speeds is $\\dfrac{\\sqrt{g \\times ' + T.commas(dd) + '}}{\\sqrt{g \\times ' + ds + '}} = \\sqrt{\\dfrac{' + T.commas(dd) + '}{' + ds + '}} = \\sqrt{' + T.commas(dd / ds) + '} \\approx ' + fd(r, 1) + '$.', 'As the front of the wave slows, the water behind it catches up and piles up, so the wave grows much taller near shore.'],
        'g cancels; take the square root of the depth ratio.', { unit: 'times', vf: { k: 'shallow', dd: dd, ds: ds } });
    }
    if (kind === 'lambda') {
      var d3 = R.pick([3000, 4000, 5000]), per = R.pick([10, 15, 20, 30]), v3 = M.sqrt(GRAV * d3), lam = v3 * per * 60 / 1000;
      return P('A tsunami in ocean ' + T.commas(d3) + ' m deep has a period of ' + per + ' minutes (the time between crests). Using $v = \\sqrt{gd}$ and wavelength = speed × period, how far apart are its crests, in km?', num(lam, 3, 0.02),
        ['Speed: $\\sqrt{9.8 \\times ' + T.commas(d3) + '} \\approx ' + fd(v3, 1) + '\\,\\text{m/s}$.', 'Period: $' + per + ' \\times 60 = ' + (per * 60) + '\\,\\text{s}$.', 'Wavelength: $' + fd(v3, 1) + ' \\times ' + (per * 60) + ' \\approx ' + T.commas(M.round(v3 * per * 60)) + '\\,\\text{m} \\approx ' + fd(lam, 0) + '\\,\\text{km}$.', 'With crests that far apart, a ship at sea hardly notices a tsunami passing. At the coast, each wave can flood inland for many minutes.'],
        'Find the speed, then multiply by the period in seconds.', { unit: 'km', vf: { k: 'lambda', d: d3, per: per } });
    }
    return bankQ(R, [
      ['How is a tsunami different from a large wind wave breaking on a beach?', 'It is a series of very long waves that can flood inland for many minutes each, and the first wave is often not the largest',
        ['It is a single tall breaking wave, like giant surf', 'It always arrives as one wall of water a few seconds long', 'It happens only during storms'],
        ['A sudden jolt of the seafloor lifts the whole column of water above it, from the bottom to the surface.', 'The waves are hundreds of kilometers long, so each one keeps flowing inland like a fast-rising tide for minutes.', 'Several waves arrive, often many minutes apart, and a later one can be the biggest.'], 'Think about how long the waves are.'],
      ['Why does a tsunami grow much taller as it reaches shallow water?', 'It slows down near shore, so the water behind catches up and piles up',
        ['The wind pushes it higher near land', 'Shallow water adds more water to the wave', 'Tsunamis never grow; they shrink near shore'],
        ['Tsunami speed depends on depth: $v = \\sqrt{gd}$.', 'As the front of the wave reaches shallow water and slows, the faster water behind it bunches up: the wave shortens and grows taller.'], 'How does speed depend on depth?']
    ], 'why');
  });

// ---- 10_landscapes.js
  // =====================================================================================
  // Unit 10: Landscapes
  // =====================================================================================

  G('geology.mass-wasting', function (R, ctx) {
    var kind = by(ctx, R.pick(['fs', 'stable', 'water']), R.pick(['fs', 'stable', 'forces', 'water']), R.pick(['wet', 'fs', 'forces', 'wet']));
    var phi = R.pick([28, 30, 32, 34, 35, 36, 38]), th = R.pick([15, 20, 25, 30, 33, 35, 40]);
    if (th === phi) th += 3;
    var fs = M.tan(phi * RAD) / M.tan(th * RAD);
    if (kind === 'fs' || kind === 'stable') {
      if (kind === 'stable') return P('A slope of dry, loose sand and gravel is ' + th + '° steep. The material\'s friction angle (the steepest angle at which it can rest) is ' + phi + '°. Is the slope stable?', mc(th < phi ? 'Yes: the slope is gentler than the friction angle, so friction wins' : 'No: the slope is steeper than the friction angle, so it will slide', [th < phi ? 'No: the slope is steeper than the friction angle, so it will slide' : 'Yes: the slope is gentler than the friction angle, so friction wins', 'Yes, because sand never moves', 'It depends only on how tall the slope is']),
        ['For dry, loose material on a long slope, the factor of safety is $FS = \\dfrac{\\tan\\varphi}{\\tan\\theta} = \\dfrac{\\tan ' + phi + '^\\circ}{\\tan ' + th + '^\\circ} \\approx ' + fd(fs, 2) + '$.', fs > 1 ? 'FS is above 1: the forces holding it are bigger than the downhill pull.' : 'FS is below 1: the downhill pull wins and the slope fails.'],
        'Compare the slope angle with the friction angle.', { vf: { k: 'stable', phi: phi, th: th } });
      return P('For a long slope of dry, loose material, the factor of safety is $FS = \\dfrac{\\tan\\varphi}{\\tan\\theta}$, where $\\varphi$ is the friction angle and $\\theta$ the slope angle. Find FS for $\\varphi = ' + phi + '^\\circ$ and $\\theta = ' + th + '^\\circ$.', num(fs, 3, 0.01),
        ['$\\tan ' + phi + '^\\circ \\approx ' + fd(M.tan(phi * RAD), 4) + '$ and $\\tan ' + th + '^\\circ \\approx ' + fd(M.tan(th * RAD), 4) + '$.', '$FS = ' + fd(M.tan(phi * RAD), 4) + ' \\div ' + fd(M.tan(th * RAD), 4) + ' \\approx ' + fd(fs, 2) + '$.', fs > 1 ? 'Above 1: the slope holds (for now).' : 'Below 1: the slope fails.'],
        'Divide the two tangents.', { vf: { k: 'fs', phi: phi, th: th } });
    }
    if (kind === 'forces') {
      var W = R.pick([100, 200, 500, 1000]), th2 = R.pick([20, 25, 30, 35]), drv = W * M.sin(th2 * RAD), nrm = W * M.cos(th2 * RAD), askN = R.coin();
      return P('A block of soil weighing ' + W + ' kN sits on a ' + th2 + '° slope. How large is the part of its weight ' + (askN ? 'pressing straight into the slope (the normal force)' : 'pulling it down the slope (the driving force)') + '?', num(askN ? nrm : drv, 3, 0.01),
        ['Split the weight into two parts: along the slope and at right angles to it. The slope angle sits between the weight and the line at right angles to the slope.', askN ? 'Into the slope: $W\\cos\\theta = ' + W + ' \\cos ' + th2 + '^\\circ = ' + W + ' \\times ' + fd(M.cos(th2 * RAD), 4) + ' \\approx ' + fd(nrm, 0) + '\\,\\text{kN}$. Friction grows with this force.' : 'Down the slope: $W\\sin\\theta = ' + W + ' \\sin ' + th2 + '^\\circ = ' + W + ' \\times ' + fd(M.sin(th2 * RAD), 4) + ' \\approx ' + fd(drv, 0) + '\\,\\text{kN}$.', 'Steeper slopes increase the pull down the slope and decrease the push into it, a double blow to stability.'],
        askN ? 'Normal force = W cos θ.' : 'Driving force = W sin θ.', { unit: 'kN', viz: { name: 'es-landscape', opts: { mode: 'slope', angle: th2, frictionAngle: 35, quiet: true } }, vf: { k: askN ? 'normal' : 'drive', W: W, th: th2 } });
    }
    if (kind === 'wet') {
      var fsDry = fs, fsWet = fs * (20 - 9.8) / 20;
      return P('A long slope of loose soil has friction angle $' + phi + '^\\circ$ and slope angle $' + th + '^\\circ$. After days of rain, it is soaked, with water seeping down parallel to the slope. Then $FS \\approx \\dfrac{\\gamma_{sat} - \\gamma_w}{\\gamma_{sat}} \\cdot \\dfrac{\\tan\\varphi}{\\tan\\theta}$, with soaked soil weighing $\\gamma_{sat} = 20\\,\\text{kN/m}^3$ and water $\\gamma_w = 9.8\\,\\text{kN/m}^3$. What is FS now?', num(fsWet, 3, 0.01),
        ['Dry: $\\dfrac{\\tan ' + phi + '^\\circ}{\\tan ' + th + '^\\circ} \\approx ' + fd(fsDry, 3) + '$.', 'Water pressure in the pores pushes the grains apart, so only $\\dfrac{20 - 9.8}{20} = 0.51$ of the friction is left.', '$FS \\approx 0.51 \\times ' + fd(fsDry, 3) + ' \\approx ' + fd(fsWet, 2) + '$' + (fsWet < 1 && fsDry > 1 ? ': a slope that was stable when dry now fails.' : '.')],
        'Find the dry FS, then multiply by 0.51.', { viz: { name: 'es-landscape', opts: { mode: 'slope', angle: th, frictionAngle: phi, wet: 1, quiet: true } }, vf: { k: 'wet', phi: phi, th: th } });
    }
    return bankQ(R, [
      ['Heavy rain often sets off landslides. What is the main reason?', 'Water filling the pores pushes the grains apart and lowers the friction between them',
        ['The extra weight of the water alone pulls the slope down', 'Rain makes the slope steeper', 'Water turns the rock into mud instantly'],
        ['Friction between grains depends on how hard they press together.', 'Water under pressure in the pores pushes back against that, so grains press together less and friction drops sharply.', 'The water\'s weight adds a little too, but the loss of friction matters far more.'], 'What does water do between the grains?']
    ], 'water');
  });

  G('geology.stream-flow', function (R, ctx) {
    var kind = by(ctx, R.pick(['grad', 'Q', 'Q']), R.pick(['Q', 'grad', 'v', 'why']), R.pick(['v', 'day', 'Q', 'why']));
    if (kind === 'grad') {
      var drop = R.pick([20, 40, 60, 90, 120, 150, 300]), dist = R.pick([2, 4, 5, 10, 15, 30, 60]), g = drop / dist;
      return P('A stream drops ' + drop + ' m in elevation over ' + dist + ' km of channel. What is its gradient, in meters per kilometer?', num(g, 3, 0.01),
        ['Gradient = drop ÷ distance.', '$' + drop + ' \\div ' + dist + ' = ' + fd(g, 2) + '\\,\\text{m/km}$.', g > 10 ? 'Steep: typical of mountain streams near their source.' : 'Gentle: typical of larger rivers downstream.'],
        'Divide the drop by the distance.', { unit: 'm/km', viz: { name: 'es-topo', opts: { terrain: 'valley', stream: true } }, vf: { k: 'grad', drop: drop, dist: dist } });
    }
    var w = R.pick([4, 8, 12, 20, 30, 50, 80]), d = R.pick([0.5, 0.8, 1, 1.5, 2, 3]), v = R.pick([0.4, 0.5, 0.8, 1, 1.2, 1.5, 2]), Q = w * d * v;
    if (kind === 'Q') return P('At a gauging station a river is ' + w + ' m wide and ' + fd(d, 1) + ' m deep on average, and the water flows ' + fd(v, 1) + ' m/s. What is its discharge?', num(Q, 3, 0.01),
      ['Discharge is the volume of water passing each second: cross-section area × speed.', 'Area $= ' + w + ' \\times ' + fd(d, 1) + ' = ' + fd(w * d, 1) + '\\,\\text{m}^2$.', '$Q = ' + fd(w * d, 1) + ' \\times ' + fd(v, 1) + ' = ' + fd(Q, 1) + '\\,\\text{m}^3/\\text{s}$.'],
      'Q = width × depth × speed.', { unit: 'm³/s', viz: { name: 'es-landscape', opts: { mode: 'river', station: { width: w, depth: d, speed: v }, quiet: true } }, vf: { k: 'Q', w: w, d: d, v: v } });
    if (kind === 'v') return P('A river carries ' + fd(Q, 1) + ' m³/s of water through a channel ' + w + ' m wide and ' + fd(d, 1) + ' m deep. What is its average speed?', num(v, 3, 0.01),
      ['$Q = w \\times d \\times v$, so $v = \\dfrac{Q}{w \\times d}$.', '$v = \\dfrac{' + fd(Q, 1) + '}{' + w + ' \\times ' + fd(d, 1) + '} = \\dfrac{' + fd(Q, 1) + '}{' + fd(w * d, 1) + '} = ' + fd(v, 2) + '\\,\\text{m/s}$.'],
      'Divide the discharge by the cross-section area.', { unit: 'm/s', vf: { k: 'v', w: w, d: d, Q: Q } });
    if (kind === 'day') return P('A river\'s discharge is ' + fd(Q, 1) + ' m³/s. How many cubic meters of water flow past in one day?', num(Q * 86400, 3, 0.01),
      ['One day has $24 \\times 3,600 = 86,400$ seconds.', '$' + fd(Q, 1) + ' \\times 86,400 \\approx ' + fx(Q * 86400, 3) + '\\,\\text{m}^3$.'], 'Multiply by the seconds in a day.', { unit: 'm³', vf: { k: 'day', Q: Q } });
    return bankQ(R, [
      ['A steep mountain stream looks fast and wild. The big river it flows into downstream looks calm. Which usually carries more water, and which flows faster on average?', 'The big river carries far more water and often flows as fast or faster on average',
        ['The mountain stream carries more water and flows faster', 'They carry the same amount of water', 'The big river barely moves'],
        ['Discharge grows downstream as tributaries join, so the river carries many times more water.', 'Mountain streams lose much of their energy to friction against boulders and a rough, shallow bed; the deep, smooth channel downstream lets water move efficiently, so its average speed is often as high or higher, even on a gentler slope.'], 'Think about friction in a shallow, rocky bed.']
    ], 'why');
  });

  G('geology.river-landforms', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'bank', 'oxbow']), R.pick(['bank', 'sinu', 'base', 'oxbow']), R.pick(['sinu', 'base', 'migrate', 'sinu']));
    if (kind === 'bank') {
      var out = R.coin();
      return P('Where does a river ' + (out ? 'wear away its bank (a cut bank)' : 'build a sandy, gently sloping bar (a point bar)') + ' in a meander bend?', mc(out ? 'On the outside of the bend, where the water flows fastest' : 'On the inside of the bend, where the water flows slowest', [out ? 'On the inside of the bend, where the water flows slowest' : 'On the outside of the bend, where the water flows fastest', 'In the straight parts between bends', 'Equally on both sides']),
        ['Water carries its momentum around the bend and is flung toward the outside, so the fastest, deepest flow hugs the outer bank.', out ? 'The fast water erodes the outer bank: a cut bank.' : 'On the inside, slow water drops sand and gravel: a point bar.', 'Erosion outside and deposition inside make the meander grow and creep sideways.'],
        'Where is the water fastest?', { vf: { k: 'bank', out: out } });
    }
    if (kind === 'sinu') {
      var valley = R.pick([10, 12, 15, 20, 25, 40]), s = R.pick([1.1, 1.2, 1.4, 1.6, 1.8, 2.2]), chan = valley * s;
      return P('A river\'s channel is ' + fd(chan, 1) + ' km long, but its valley runs only ' + valley + ' km between the same two points. What is its sinuosity (channel length ÷ valley length)?', num(s, 3, 0.01),
        ['$' + fd(chan, 1) + ' \\div ' + valley + ' = ' + fd(s, 2) + '$.', s >= 1.5 ? 'A sinuosity above about 1.5 is usually called meandering.' : 'Below about 1.5, the river is fairly straight or only gently winding.'],
        'Divide the channel length by the valley length.', { vf: { k: 'sinu', chan: chan, valley: valley } });
    }
    if (kind === 'base') {
      var b = R.pick([['A dam is built across a river, making a reservoir.', 'Upstream of the dam, the river slows and drops sediment, filling the reservoir'], ['Sea level falls by tens of meters during an ice age.', 'The river cuts down into its valley, trying to reach the new, lower sea level'], ['A block of land is uplifted by faulting across a river\'s path.', 'The river cuts down faster through the rising block']]);
      return P(b[0] + ' What happens to the river?', mc(b[1], ['Upstream of the dam, the river slows and drops sediment, filling the reservoir', 'The river cuts down into its valley, trying to reach the new, lower sea level', 'The river cuts down faster through the rising block', 'Nothing changes; rivers ignore base level'].filter(function (x) { return x !== b[1]; }).slice(0, 3)),
        ['Base level is the lowest level a river can erode down to: sea level overall, or a lake or reservoir locally.', 'Raise base level and the river slows and deposits; lower it (or raise the land) and the river cuts down.'],
        'Did base level rise or fall?', { vf: { k: 'base' } });
    }
    if (kind === 'migrate') {
      var r = R.pick([0.5, 1, 2, 2.5, 5]), dist = R.pick([50, 100, 200, 300]), y = dist / r;
      return P('The outer bank of a meander bend is wearing away at ' + fd(r, 1) + ' m per year. A road runs ' + dist + ' m from the bank. At that rate, how many years until the river reaches the road?', num(y, 3, 0.01),
        ['Time = distance ÷ rate.', '$' + dist + ' \\div ' + fd(r, 1) + ' = ' + T.commas(M.round(y)) + '$ years.', 'Meanders keep moving, so floodplains are restless places for roads and buildings.'],
        'Divide the distance by the yearly rate.', { unit: 'years', vf: { k: 'migrate', r: r, dist: dist } });
    }
    return bankQ(R, [
      ['How does an oxbow lake form?', 'A meander loop grows until the river cuts across its narrow neck, leaving the old loop behind as a curved lake',
        ['A glacier carves a curved hole', 'A beaver dam blocks a straight river', 'An earthquake splits the river in two'],
        ['Erosion on the outsides of two neighboring bends narrows the land between them.', 'During a flood, the river breaks through the neck and takes the shorter path; sediment seals off the old loop, which becomes an oxbow lake.'], 'Think about two bends eating toward each other.'],
      ['Many people think the water on the inside of a river bend flows fastest because that path is shorter. Where is the flow actually fastest?', 'On the outside of the bend, which is why the outer bank wears away',
        ['On the inside of the bend', 'Exactly in the middle', 'It is the same everywhere'],
        ['The water\'s momentum carries it toward the outside of the curve, where it piles up and runs deepest and fastest.', 'That is why the outer bank erodes and the inner side collects a point bar.'], 'Which bank erodes?']
    ], 'oxbow');
  });

  G('geology.flood-frequency', function (R, ctx) {
    var kind = by(ctx, R.pick(['T', 'p', 'myth']), R.pick(['rank', 'T', 'p', 'myth']), R.pick(['rank', 'atleast', 'atleast', 'rank']));
    if (kind === 'T' || kind === 'p') {
      var Tt = R.pick([2, 5, 10, 20, 25, 50, 100, 200, 500]);
      if (kind === 'T') return P('A flood of a certain size has a ' + fd(100 / Tt, 1) + '% chance of happening in any year. What is its recurrence interval?', num(Tt, 3, 0.005),
        ['Recurrence interval = 1 ÷ yearly chance $= 1 \\div ' + fd(1 / Tt, 3) + ' = ' + Tt + '$ years.', 'This is a "' + Tt + '-year flood": it happens on average once in ' + Tt + ' years over a long record, not on a schedule.'],
        'T = 1 / p.', { unit: 'years', vf: { k: 'T', T: Tt } });
      return P('What is the chance, in any given year, of a ' + Tt + '-year flood? (Give a percent.)', pnum(100 / Tt, 3, 0.005),
        ['Yearly chance $= \\dfrac{1}{' + Tt + '} = ' + fd(1 / Tt, 3) + '$.', 'As a percent: $' + fd(100 / Tt, 1) + '\\%$ every year, including the year right after one happens.'],
        'p = 1 / T.', { unit: '%', vf: { k: 'p', T: Tt } });
    }
    if (kind === 'rank') {
      var n = R.pick([9, 11, 14, 19, 24, 29, 39, 49]), m = R.int(1, 4), Tr = (n + 1) / m;
      var seed = R.int(1, 1000), peaks = [], base = R.pick([200, 400, 600, 900]);
      for (var i = 0; i < M.min(n, 12); i++) peaks.push(M.round(base * (0.5 + R.next() * 1.5) / 10) * 10);
      var showTable = n <= 11, ranked = peaks.slice().sort(function (a, b) { return b - a; }), uniq = ranked.filter(function (x, j) { return ranked.indexOf(x) === j; }).length === ranked.length;
      if (showTable && !uniq) { peaks = peaks.map(function (x, j) { return x + j; }); ranked = peaks.slice().sort(function (a, b) { return b - a; }); }
      var q = showTable ? 'A town\'s records give the highest flow of its river in each of ' + n + ' years (m³/s): ' + peaks.join(', ') + '. What is the recurrence interval of the year with a peak of ' + ranked[m - 1] + ' m³/s? (Rank the peaks from largest, $m = 1$, and use $T = \\dfrac{n + 1}{m}$.)'
        : 'A river has ' + n + ' years of yearly peak flows on record. Ranked from largest ($m = 1$), the year in question ranks ' + U.ordinal(m) + '. Using $T = \\dfrac{n + 1}{m}$, what is its recurrence interval?';
      return P(q, num(Tr, 3, 0.005),
        (showTable ? ['Ranked from largest: ' + ranked.join(', ') + '.', ranked[m - 1] + ' m³/s ranks $m = ' + m + '$.'] : []).concat(['$T = \\dfrac{' + n + ' + 1}{' + m + '} = ' + fd(Tr, 2) + '$ years.', 'Its yearly chance is about $1/T = ' + fd(100 / Tr, 1) + '\\%$. Short records give rough estimates; a 100-year flood needs a long record (or careful statistics) to estimate.']),
        'Rank the peaks, then use $T = (n+1)/m$.', showTable ? { unit: 'years', viz: { name: 'es-chance', opts: { mode: 'record', data: peaks.map(function (v, j) { return { year: 2001 + j, value: v }; }), quiet: true, lock: true } }, vf: { k: 'rank', n: n, m: m, peaks: peaks } } : { unit: 'years', vf: { k: 'rank', n: n, m: m, peaks: null } });
    }
    if (kind === 'atleast') {
      var T2 = R.pick([25, 50, 100, 200]), yrs = R.pick([10, 20, 30, 50]), pr = 1 - M.pow(1 - 1 / T2, yrs);
      return P('A house sits where the ' + T2 + '-year flood would reach. What is the chance it is flooded at least once during a ' + yrs + '-year mortgage, treating each year as independent? (Give a percent.)', pnum(pr * 100, 3, 0.01),
        ['Chance of no such flood in a year: $1 - \\tfrac{1}{' + T2 + '} = ' + fd(1 - 1 / T2, 3) + '$.', 'None in ' + yrs + ' years: $' + fd(1 - 1 / T2, 3) + '^{' + yrs + '} \\approx ' + fd(M.pow(1 - 1 / T2, yrs), 3) + '$.', 'At least one: $1 - ' + fd(M.pow(1 - 1 / T2, yrs), 3) + ' \\approx ' + fd(pr * 100, 1) + '\\%$.' + (T2 === 100 && yrs === 30 ? ' The USGS gives this example: about 26% over 30 years.' : '')],
        'Use $1 - (1 - 1/T)^n$.', { unit: '%', vf: { k: 'atleast', T: T2, n: yrs } });
    }
    return bankQ(R, [
      ['A 100-year flood hit a town last year. What is the chance of another one this year?', 'About 1%, the same as every year',
        ['Zero; the next one is 100 years away', 'About 99%', 'Exactly 50%'],
        ['"100-year flood" means a flood with a 1% chance in any year, based on the long record.', 'Floods don\'t keep a schedule: last year\'s flood does not change this year\'s chance. Two can happen in back-to-back years.'], 'Does the river remember last year?']
    ], 'myth');
  });

  G('geology.groundwater-flow', function (R, ctx) {
    var kind = by(ctx, R.pick(['grad', 'grad', 'why']), R.pick(['Q', 'grad', 'dir', 'Q']), R.pick(['v', 'time', 'Q', 'time']));
    var h1 = R.int(30, 60), dh = R.pick([1, 2, 3, 4, 5, 6, 8, 10]), h2 = h1 - dh, L = R.pick([100, 200, 250, 400, 500, 1000]), i = dh / L;
    if (kind === 'grad') return P('The water table is ' + h1 + ' m above sea level at well A and ' + h2 + ' m at well B, ' + L + ' m away. What is the hydraulic gradient (head drop ÷ distance)?', num(i, 3, 0.01),
      ['Head drop: $' + h1 + ' - ' + h2 + ' = ' + dh + '\\,\\text{m}$.', 'Gradient $= ' + dh + ' \\div ' + L + ' = ' + fd(i, 4) + '$ (meters per meter, so it has no units).', 'Groundwater flows from A toward B, from higher head to lower head.'],
      'Divide the head difference by the distance.', { viz: { name: 'es-water', opts: { mode: 'groundwater', quiet: true } }, vf: { k: 'grad', dh: dh, L: L } });
    var K = R.pick([0.5, 1, 2, 5, 10, 20, 50]), A = R.pick([50, 100, 200, 500, 1000]), Q = K * A * dh / L;
    if (kind === 'Q') return P('An aquifer of sand has hydraulic conductivity $K = ' + fd(K, 1) + '\\,\\text{m/day}$. Across a section ' + A + ' m² in area, the head drops ' + dh + ' m over ' + L + ' m. Using Darcy\'s law, $Q = K A \\dfrac{\\Delta h}{L}$, how much water flows through each day?', num(Q, 3, 0.01),
      ['Gradient: $\\dfrac{' + dh + '}{' + L + '} = ' + fd(i, 4) + '$.', '$Q = ' + fd(K, 1) + ' \\times ' + A + ' \\times ' + fd(i, 4) + ' = ' + fd(Q, 3) + '\\,\\text{m}^3/\\text{day}$.'],
      'Multiply K, the area and the gradient.', { unit: 'm³/day', vf: { k: 'Q', K: K, A: A, dh: dh, L: L } });
    var n = R.pick([0.2, 0.25, 0.3, 0.35]), q = K * i, v = q / n;
    if (kind === 'v') return P('In an aquifer with $K = ' + fd(K, 1) + '\\,\\text{m/day}$, the hydraulic gradient is ' + fd(i, 4) + ' and the porosity is ' + fd(n, 2) + '. Water moves only through the pores, at $v = \\dfrac{K i}{n}$. How fast does the groundwater actually move, in meters per day?', num(v, 3, 0.01),
      ['Darcy flux (flow per unit area): $K i = ' + fd(K, 1) + ' \\times ' + fd(i, 4) + ' = ' + fd(q, 4) + '\\,\\text{m/day}$.', 'The water squeezes through pores that are only ' + fd(n * 100, 0) + '% of the rock, so it moves faster: $' + fd(q, 4) + ' \\div ' + fd(n, 2) + ' = ' + fd(v, 4) + '\\,\\text{m/day}$.', v < 1 ? 'Less than a meter a day: groundwater creeps.' : 'Even this is slow compared with a stream.'],
      'Divide K × gradient by the porosity.', { unit: 'm/day', vf: { k: 'v', K: K, i: i, n: n } });
    if (kind === 'time') {
      var dist = R.pick([100, 200, 500, 1000]), Kt = R.pick([1, 2, 5, 10]), it = R.pick([0.002, 0.005, 0.01]), nt = R.pick([0.25, 0.3]), vt = Kt * it / nt, yrs = dist / vt / 365;
      return P('A chemical spill reaches the water table ' + dist + ' m upstream (up-gradient) of a well. The aquifer has $K = ' + Kt + '\\,\\text{m/day}$, gradient ' + fd(it, 3) + ' and porosity ' + fd(nt, 2) + '. About how many years will the groundwater take to carry it to the well?', num(yrs, 3, 0.02),
        ['Groundwater speed: $v = \\dfrac{K i}{n} = \\dfrac{' + Kt + ' \\times ' + fd(it, 3) + '}{' + fd(nt, 2) + '} = ' + fd(vt, 4) + '\\,\\text{m/day}$.', 'Time: $' + dist + ' \\div ' + fd(vt, 4) + ' \\approx ' + T.commas(M.round(dist / vt)) + '\\,\\text{days}$.', 'In years: $\\div 365 \\approx ' + fd(yrs, 1) + '$ years. Pollution can take years to arrive, and years more to flush out.'],
        'Find the speed $Ki/n$, then time = distance ÷ speed.', { unit: 'years', vf: { k: 'time', d: dist, K: Kt, i: it, n: nt } });
    }
    if (kind === 'dir') {
      var hA = R.int(40, 60), hB = hA + R.pick([-6, -4, -2, 2, 4, 6]);
      return P('Well A has a water level ' + hA + ' m above sea level; well B, nearby, has ' + hB + ' m. Which way does the groundwater between them flow?', mc(hA > hB ? 'From A toward B' : 'From B toward A', [hA > hB ? 'From B toward A' : 'From A toward B', 'It doesn\'t move between wells', 'Straight down to the deepest point']),
        ['Groundwater flows from higher hydraulic head to lower head, like water running downhill on a tilted surface.', 'The higher level is at ' + (hA > hB ? 'A (' + hA + ' m)' : 'B (' + hB + ' m)') + ', so it flows ' + (hA > hB ? 'from A toward B' : 'from B toward A') + '.'],
        'Higher head to lower head.', { vf: { k: 'dir', hA: hA, hB: hB } });
    }
    return bankQ(R, [
      ['Does groundwater flow through underground rivers as fast as a stream?', 'Usually no; it creeps through tiny pores between grains, often less than a meter a day',
        ['Yes; most groundwater flows in large underground rivers', 'Yes; it flows faster than streams because of pressure', 'No; groundwater never moves at all'],
        ['Most groundwater sits in the pore spaces of sand, gravel and cracked rock.', 'Pushing water through such narrow paths is slow: centimeters to meters per day in sand, far less in clay. Open caves with streams exist only in limestone karst.'], 'Think about how big the pores are.']
    ], 'why');
  });

  G('geology.glaciers', function (R, ctx) {
    var kind = by(ctx, R.pick(['balance', 'myth', 'term']), R.pick(['term', 'balance', 'myth', 'net']), R.pick(['net', 'term', 'net', 'balance']));
    if (kind === 'balance') {
      var acc = R.pick([1.2, 1.5, 2, 2.5, 3]), abl = R.pick([1, 1.4, 1.8, 2.2, 2.6, 3.2]), b = acc - abl;
      if (M.abs(b) < 0.05) abl += 0.3; b = acc - abl;
      return P('In one year, a glacier gains snow equal to ' + fd(acc, 1) + ' m of water spread over its whole surface and loses ' + fd(abl, 1) + ' m (melting and other losses). What is its net mass balance for the year, in meters of water? (Use a minus sign for a loss.)', exact(r2(b, 2)),
        ['Net balance = gains − losses $= ' + fd(acc, 1) + ' - ' + fd(abl, 1) + ' = ' + fd(b, 1) + '\\,\\text{m}$.', b > 0 ? 'Positive: the glacier gained mass. If that continues, its end will advance.' : 'Negative: the glacier lost mass. If that continues, its end will retreat, even though the ice keeps flowing downhill.'],
        'Gains minus losses.', { unit: 'm', viz: { name: 'es-landscape', opts: { mode: 'glacier', balance: r2(b, 1), quiet: true } }, vf: { k: 'balance', acc: acc, abl: abl } });
    }
    if (kind === 'term') {
      var flow = R.pick([20, 30, 40, 50, 60, 80]), melt = flow + R.pick([-20, -10, 10, 15, 25, 40]), chg = flow - melt;
      return P('At its lower end, a glacier\'s ice flows forward ' + flow + ' m per year, while melting removes ' + melt + ' m of ice length per year from the front. How far does the front move each year? (Positive = advance, negative = retreat.)', exact(chg),
        ['Change in the front = forward flow − melt-back $= ' + flow + ' - ' + melt + ' = ' + chg + '\\,\\text{m}$ per year.', chg < 0 ? 'The front retreats ' + (-chg) + ' m a year, yet the ice itself still moves forward ' + flow + ' m a year: it melts away faster than it arrives.' : 'The front advances ' + chg + ' m a year.'],
        'Ice delivered minus ice melted.', { unit: 'm', vf: { k: 'term', flow: flow, melt: melt } });
    }
    if (kind === 'net') {
      var Aa = R.pick([6, 8, 10, 12]), Ab = R.pick([4, 5, 6, 8]), ba = R.pick([0.8, 1, 1.2, 1.5]), bb = -R.pick([1.5, 2, 2.5, 3, 3.5]), net = (Aa * ba + Ab * bb) / (Aa + Ab);
      return P('A glacier\'s accumulation zone covers ' + Aa + ' km² and gains ' + fd(ba, 1) + ' m of water a year; its ablation zone covers ' + Ab + ' km² and loses ' + fd(-bb, 1) + ' m a year. What is the average net balance over the whole glacier, in meters of water per year?', num(net, 3, 0.01),
        ['Total change $= ' + Aa + ' \\times ' + fd(ba, 1) + ' + ' + Ab + ' \\times (' + fd(bb, 1) + ') = ' + fd(Aa * ba, 1) + ' - ' + fd(Ab * -bb, 1) + ' = ' + fd(Aa * ba + Ab * bb, 2) + '\\,\\text{km}^2 \\cdot \\text{m}$.', 'Average over $' + (Aa + Ab) + '\\,\\text{km}^2$: $' + fd(Aa * ba + Ab * bb, 2) + ' \\div ' + (Aa + Ab) + ' \\approx ' + fd(net, 3) + '\\,\\text{m}$.', net < 0 ? 'Negative: the glacier is shrinking overall.' : 'Positive: the glacier is growing overall.'],
        'Weight each zone\'s balance by its area.', { unit: 'm', vf: { k: 'net', Aa: Aa, Ab: Ab, ba: ba, bb: bb } });
    }
    return bankQ(R, [
      ['A glacier\'s front has retreated 500 m in 20 years. Has the ice been flowing backward, uphill?', 'No; the ice still flows forward and downhill, but its front melts away faster than new ice arrives',
        ['Yes; retreating glaciers flow uphill', 'Yes; the ice slides back into the mountains each summer', 'No; the ice has stopped moving entirely'],
        ['Gravity always moves glacier ice downhill, from where snow piles up to where it melts.', 'The position of the front is a balance: ice delivered minus ice melted. When melting wins, the front retreats while the ice keeps flowing forward, like walking forward on a backward-moving walkway.'], 'Think about a moving walkway.']
    ], 'myth');
  });

// ---- 11_resources.js
  // =====================================================================================
  // Unit 11: Earth Resources
  // =====================================================================================

  // [metal, crustal abundance (ppm, rounded; values vary by source and are stated in each problem), typical ore grade (%)]
  var METALS = [['copper', 60, [0.4, 0.5, 0.8, 1]], ['zinc', 70, [4, 5, 8]], ['lead', 14, [3, 5, 7]], ['nickel', 80, [1, 1.5, 2]], ['tin', 2, [0.5, 1]], ['gold', 0.004, null]];
  G('geology.ore-deposits', function (R, ctx) {
    var kind = by(ctx, R.pick(['process', 'process', 'why']), R.pick(['factor', 'metal', 'process']), R.pick(['factor', 'gold', 'metal', 'factor']));
    if (kind === 'factor') {
      var mt = R.pick(METALS.slice(0, 5)), g = R.pick(mt[2]), ppm = g * 10000, f = ppm / mt[1];
      return P('Average continental crust holds about ' + mt[1] + ' parts per million (ppm) of ' + mt[0] + '. A mine works ore that is ' + fd(g, 1) + '% ' + mt[0] + '. How many times more concentrated than average crust is the ore?', num(f, 3, 0.01),
        ['Change the percent to ppm: 1% is 10,000 ppm, so $' + fd(g, 1) + '\\% = ' + T.commas(ppm) + '\\,\\text{ppm}$.', 'Concentration factor $= ' + T.commas(ppm) + ' \\div ' + mt[1] + ' \\approx ' + T.commas(rnd(f, 3)) + '$.', 'Ordinary rock holds the metal too, but far too thinly to mine. Ore deposits are rare places where geology has concentrated it hundreds of times or more.'],
        'Write both amounts in ppm, then divide.', { unit: 'times', vf: { k: 'factor', ppm: ppm, ab: mt[1] } });
    }
    if (kind === 'gold') {
      var gpt = R.pick([1, 2, 3, 5, 8, 10]), f2 = gpt / 0.004;
      return P('Gold makes up only about 0.004 ppm of the crust (4 grams in every 1,000 tonnes). A gold mine works ore holding ' + gpt + ' grams per tonne. Since 1 gram per tonne is 1 ppm, how many times more concentrated than average crust is the ore?', num(f2, 3, 0.01),
        ['$' + gpt + '\\,\\text{g/t} = ' + gpt + '\\,\\text{ppm}$.', 'Factor $= ' + gpt + ' \\div 0.004 = ' + T.commas(f2) + '$.', 'Rare metals need the biggest concentration factors; hot water moving through cracks often does this, leaving gold in quartz veins.'],
        'Divide the ore\'s ppm by the crust\'s ppm.', { unit: 'times', vf: { k: 'factor', ppm: gpt, ab: 0.004 } });
    }
    if (kind === 'metal') {
      var tons = R.pick([1000, 5000, 10000, 50000, 100000]), mt2 = R.pick(METALS.slice(0, 4)), g2 = R.pick(mt2[2]), metal = tons * g2 / 100;
      return P('A mine processes ' + T.commas(tons) + ' tonnes of ore that is ' + fd(g2, 1) + '% ' + mt2[0] + '. If all the metal is recovered, how many tonnes of ' + mt2[0] + ' does it produce?', num(metal, 3, 0.01),
        ['$' + fd(g2, 1) + '\\% = ' + fd(g2 / 100, 4) + '$ of the ore.', '$' + T.commas(tons) + ' \\times ' + fd(g2 / 100, 4) + ' = ' + T.commas(metal) + '\\,\\text{t}$.', 'The other ' + T.commas(tons - metal) + ' tonnes are waste rock (tailings), which is why mines leave such large piles behind.'],
        'Multiply the ore by the grade as a decimal.', { unit: 't', vf: { k: 'metal', tons: tons, g: g2 } });
    }
    if (kind === 'process') {
      var S = [['Layers of chromite (chromium ore) settled to the floor of a huge, slowly cooling body of magma.', 'Magmatic: dense crystals sank and piled up as the magma cooled'], ['Copper and molybdenum sulfides fill networks of tiny cracks around a granite intrusion.', 'Hydrothermal: hot, mineral-rich water from the magma deposited ore in cracks as it cooled'],
        ['Bauxite (aluminum ore) forms a thick red layer at the surface in a hot, rainy tropical climate.', 'Weathering: rain dissolved and carried away almost everything except aluminum oxides'], ['Thick beds of halite and potash salts lie in an old basin.', 'Evaporation: seawater dried up and left its salts behind'],
        ['Grains of gold collect in the gravel on the bed of a stream, behind boulders and in bends.', 'Placer: running water sorted heavy grains from lighter sand and gravel']];
      var s = R.pick(S);
      return P('How did this ore deposit most likely form? ' + s[0], mc(s[1], S.filter(function (q) { return q !== s; }).map(function (q) { return q[1]; }).slice(0, 4).filter(function (x, j) { return j < 3; })),
        ['Each ore-forming process concentrates a metal in its own way: by crystals settling, hot water, deep weathering, evaporation or flowing water sorting grains.', 'This one: ' + s[1].charAt(0).toLowerCase() + s[1].slice(1) + '.'],
        'What did the concentrating: magma, hot water, rain, evaporation or a stream?', { vf: { k: 'process' } });
    }
    return bankQ(R, [
      ['Copper is found in almost every rock. Why can\'t it be mined just anywhere?', 'In ordinary rock it is far too dilute; mining pays only where geology has concentrated it about 100 times or more',
        ['Copper in ordinary rock is a different element', 'It is illegal to mine copper outside of mountains', 'Copper is only found in meteorites'],
        ['Average crust holds only about 60 parts per million of copper: 60 grams per tonne.', 'Ore is typically around 0.5% (5,000 ppm) or more. Getting the metal out of ordinary rock would cost far more energy and money than the copper is worth.'], 'Compare how much copper is in ordinary rock with ore.']
    ], 'why');
  });

  G('geology.fossil-fuels', function (R, ctx) {
    var kind = by(ctx, R.pick(['origin', 'trap', 'window']), R.pick(['window', 'trap', 'coal', 'origin']), R.pick(['window', 'window', 'coal', 'trap']));
    if (kind === 'window') {
      var T0 = R.int(10, 20), g = R.pick([20, 25, 30, 35, 40]), top = R.coin(), Tt = top ? 60 : 120, z = (Tt - T0) / g;
      return P('Buried organic matter turns into oil at about 60 to 120 °C (the "oil window"). In a basin with a surface temperature of ' + T0 + ' °C and a geothermal gradient of ' + g + ' °C per km, at what depth is the ' + (top ? 'top' : 'bottom') + ' of the oil window?', num(z, 3, 0.01),
        ['Warming needed: $' + Tt + ' - ' + T0 + ' = ' + (Tt - T0) + '^\\circ\\text{C}$.', 'Depth: $' + (Tt - T0) + ' \\div ' + g + ' \\approx ' + fd(z, 2) + '\\,\\text{km}$.', top ? 'Shallower than this, the organic matter is not yet cooked into oil.' : 'Deeper and hotter than this, oil breaks down into natural gas.'],
        'Find the depth where the rock reaches ' + Tt + ' °C.', { unit: 'km', vf: { k: 'window', T0: T0, g: g, T: Tt } });
    }
    if (kind === 'trap') {
      var t = R.pick([['A layer of shale rich in dead plankton, buried and heated', 'The source rock'], ['A porous, permeable sandstone that oil can move into and fill', 'The reservoir rock'], ['A layer of tight shale or salt above the sandstone that oil cannot pass through', 'The seal (cap rock)'], ['An anticline that arches the layers so oil collects at its crest', 'The trap']]);
      return P('An oil field needs four things. Which one is this: ' + t[0].charAt(0).toLowerCase() + t[0].slice(1) + '?', mc(t[1], ['The source rock', 'The reservoir rock', 'The seal (cap rock)', 'The trap'].filter(function (x) { return x !== t[1]; })),
        ['Source rock makes the oil; it then moves up through the rock (oil is lighter than water) into a porous reservoir rock.', 'A seal stops it from escaping to the surface, and a trap (such as the top of an anticline, or a fault) gathers it in one place.'],
        'Make, move, hold, stop.', { viz: { name: 'es-structures', opts: { mode: 'fold', type: 'anticline', erosion: 0, quiet: true } }, vf: { k: 'trap' } });
    }
    if (kind === 'coal') {
      var r = R.pick([['peat', 'lignite'], ['lignite', 'bituminous coal'], ['bituminous coal', 'anthracite']]);
      return P('As buried plant material is heated and squeezed over time, it changes through a series of ranks. What comes after ' + r[0] + '?', mc(r[1], ['peat', 'lignite', 'bituminous coal', 'anthracite', 'oil shale'].filter(function (x) { return x !== r[1] && x !== r[0]; }).slice(0, 3)),
        ['Coal rank: peat, lignite, bituminous coal, anthracite.', 'With each step, water and gases are driven off and the carbon content rises, so the coal holds more energy per kilogram.'],
        'Peat, lignite, bituminous, anthracite.', { vf: { k: 'coal' } });
    }
    return bankQ(R, [
      ['What is most oil made from?', 'Tiny algae and plankton buried in seafloor mud and slowly cooked by Earth\'s heat',
        ['Dinosaur bones and bodies', 'Coal that melted underground', 'Rock melted by volcanoes'],
        ['When microscopic sea life dies, it settles into fine mud on the seafloor where oxygen is low, so it does not fully rot.', 'Buried kilometers deep and heated to about 60 to 120 °C over millions of years, it turns into oil and gas.', 'Dinosaurs were far too few to matter, and most coal comes from land plants in swamps, not from oil.'], 'Think of the most abundant living things in the sea.'],
      ['Where does most coal come from?', 'Plants that grew in swamps and were buried before they could rot',
        ['Tiny plankton on the seafloor', 'Dinosaur remains', 'Volcanic ash'],
        ['Swamp water is low in oxygen, so dead plants pile up as peat instead of rotting away.', 'Buried and heated, peat becomes lignite, then bituminous coal, then anthracite.'], 'Think of a swamp.']
    ], 'origin');
  });

  G('geology.resource-reserves', function (R, ctx) {
    var kind = by(ctx, R.pick(['rp', 'rp', 'def']), R.pick(['rp', 'change', 'def', 'myth']), R.pick(['grow', 'grow', 'change', 'rp']));
    var Rv = R.pick([200, 300, 400, 500, 600, 800, 1000, 1200]), Pv = R.pick([10, 20, 25, 30, 40, 50]);
    if (kind === 'rp') return P('A country has reserves of ' + T.commas(Rv) + ' million tonnes of a mineral and produces ' + Pv + ' million tonnes a year. What is its reserves-to-production ratio, in years?', num(Rv / Pv, 3, 0.01),
      ['R/P $= ' + T.commas(Rv) + ' \\div ' + Pv + ' = ' + fd(Rv / Pv, 1) + '$ years.', 'This is a snapshot: how long today\'s reserves would last at today\'s rate. It is not the date the resource runs out, because reserves grow with new discoveries, better technology and higher prices, and shrink if prices fall.'],
      'Divide the reserves by the yearly production.', { unit: 'years', vf: { k: 'rp', R: Rv, P: Pv } });
    if (kind === 'change') {
      var add = R.pick([100, 200, 300, 400]);
      return P('Reserves of a metal are ' + T.commas(Rv) + ' million tonnes, used at ' + Pv + ' million tonnes a year. A rise in price makes ' + add + ' million tonnes of lower-grade deposits worth mining, so they become reserves too. What is the new reserves-to-production ratio, in years?', num((Rv + add) / Pv, 3, 0.01),
        ['New reserves: $' + T.commas(Rv) + ' + ' + add + ' = ' + T.commas(Rv + add) + '$ million tonnes.', 'R/P $= ' + T.commas(Rv + add) + ' \\div ' + Pv + ' = ' + fd((Rv + add) / Pv, 1) + '$ years, up from ' + fd(Rv / Pv, 1) + '. The rock in the ground did not change; what counts as a reserve did.'],
        'Add the new reserves, then divide by the production.', { unit: 'years', vf: { k: 'change', R: Rv + add, P: Pv } });
    }
    if (kind === 'grow') {
      var r = R.pick([0.01, 0.02, 0.03, 0.04]), RP = R.pick([30, 40, 50, 60, 100]), n = M.log(1 + r * RP) / M.log(1 + r);
      return P('A resource has reserves equal to ' + RP + ' years of this year\'s production (R/P = ' + RP + '). If use grows ' + fd(r * 100, 0) + '% a year and no reserves are added, how many years would they last? Use $n = \\dfrac{\\ln(1 + r \\cdot R/P)}{\\ln(1 + r)}$, which comes from adding up the growing yearly use.', num(n, 3, 0.01),
        ['Total use over $n$ years grows like a savings account: $P(1 + (1+r) + (1+r)^2 + \\dots) = P\\dfrac{(1+r)^n - 1}{r}$.', 'Set it equal to the reserves $R$: $(1 + r)^n = 1 + r\\dfrac{R}{P} = 1 + ' + fd(r, 2) + ' \\times ' + RP + ' = ' + fd(1 + r * RP, 2) + '$.', '$n = \\dfrac{\\ln ' + fd(1 + r * RP, 2) + '}{\\ln ' + fd(1 + r, 2) + '} \\approx ' + fd(n, 1) + '$ years, less than the ' + RP + ' years the plain ratio suggests.', 'Growth in use shortens the time; new discoveries, recycling and substitutes lengthen it. Both matter.'],
        'Compute $1 + r \\cdot R/P$, take its natural log, and divide by $\\ln(1 + r)$.', { unit: 'years', vf: { k: 'grow', r: r, RP: RP } });
    }
    if (kind === 'myth') return bankQ(R, [
      ['A news story says a country\'s oil reserves "will last 40 years" because reserves ÷ yearly use = 40. What is the main problem with reading it as a run-out date?', 'Reserves change over time with prices, technology and new discoveries, and use can rise or fall',
        ['The math is wrong; it should be reserves × use', 'Reserves can only go down, so it will run out sooner', 'Nothing; the oil will run out in exactly 40 years'],
        ['Reserves are only the part of a resource that can be produced at a profit with today\'s prices and technology.', 'For decades, reserves of many minerals and fuels have grown as fast as they were used, because exploration and technology added more. Use can also grow or shrink. So R/P is a snapshot, not a countdown.'], 'Is the amount of reserves fixed?']
    ], 'myth');
    return bankQ(R, [
      ['What is the difference between a resource and a reserve?', 'A reserve is the part of a resource that is known and can be produced at a profit today; a resource includes everything that may someday be usable',
        ['They mean the same thing', 'A reserve is a resource that has already been used', 'A resource is renewable and a reserve is not'],
        ['Resources include deposits that are undiscovered, too low in grade or too costly to produce at today\'s prices.', 'As prices rise or technology improves, some resources become reserves; if prices fall, some reserves go back to being resources.'], 'Think about what is profitable today.']
    ], 'def');
  });

// ---- 99_tail.js
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : undefined));
