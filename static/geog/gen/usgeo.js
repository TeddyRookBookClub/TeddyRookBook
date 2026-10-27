/* U.S. Geography (Geography Ladder, course key usgeo, grades 3-8): problem generators for all 46 topics.
   Source: /tmp/work_usgeo/gen/*.js, joined by /tmp/work_usgeo/build_gen.sh into static/geog/gen/usgeo.js. Do not edit the joined file.
   Pattern: /tmp/work_geog/gen_maps.js; conventions: /tmp/work_geog/overview.md.
   - Pictures come from the kit (gg-map with map: 'us', gg-outline, gg-timezones, gg-climate, gg-globe), always quiet and still
     (quiet: true, interactive: false) so they never name the answer. Letters on a picture are mc answers with keep: true.
   - State facts come from the model (MathLadder.geog.S: names, capitals, Census regions and divisions, neighbors, statehood
     dates); facts the model does not hold (2020 Census counts, land areas, parks, landmarks, river lengths, lakes) are in the
     tables below, with their sources in /tmp/work_usgeo/sources.md.
   - Levels: 1 = one clear question with very different choices; 2 = choices from the topic's trouble note (look-alike
     states, the big-city trap, add vs subtract); 3 = reverse and two-step questions, typed names, "choose all".
   - Text answers accept every spelling the model knows (G.names, G.capNames). Rounded numbers use rtol.
   - Neighbors are land borders only. Pairs that touch only at a point (the Four Corners: AZ-CO, UT-NM) or only across
     water (MI-MN, MI-IL, NY-RI) are never offered as "does not border" choices, except in questions about that rule.
   - The Gulf of Mexico is named with its other federal name (Gulf of America, since 2025); Denali with Mount McKinley. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var Gen = ML.gen;
  function GG() { return ML.geog; }
  function S(id) { return GG().state(id); }
  function nm(id) { return S(id).n; }
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function mc(choices, right, keep) { var o = { t: 'mc', choices: choices, v: choices.indexOf(right) }; if (keep) o.keep = true; if (o.v < 0) throw new Error('mc: answer not in choices: ' + right); return o; }
  function mcAll(choices, rights) { return { t: 'mc', choices: choices, v: choices.map(function (c, i) { return rights.indexOf(c) >= 0 ? i : -1; }).filter(function (i) { return i >= 0; }) }; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function txt(list) { return { t: 'text', v: list }; }
  function num(v, extra) { var o = { t: 'num', v: String(v) }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  var LET = ['A', 'B', 'C', 'D', 'E'];
  function lettersFor(ids) { var m = {}; ids.forEach(function (id, i) { m[id] = LET[i]; }); return m; }
  function letterQ(ids) { return { t: 'mc', choices: LET.slice(0, ids.length), keep: true }; }
  function usmap(o) { var b = { map: 'us', quiet: true, interactive: false }; for (var k in o) b[k] = o[k]; return { name: 'gg-map', opts: b }; }
  function worldmap(o) { var b = { quiet: true, interactive: false, disputedNote: false }; for (var k in o) b[k] = o[k]; return { name: 'gg-map', opts: b }; }
  function outline(ids) { return { name: 'gg-outline', opts: { map: 'us', ids: ids, quiet: true, interactive: false } }; }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function others(pool, not) { return pool.filter(function (x) { return not.indexOf(x) < 0; }); }
  function uniq(a) { var o = []; a.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); }); return o; }
  var GULF = 'the Gulf of Mexico (Gulf of America)';
  // the land-border rule (see the header)
  var NOT_DISTRACT = { AZ: ['CO'], CO: ['AZ'], UT: ['NM'], NM: ['UT'], MI: ['MN', 'IL'], MN: ['MI'], IL: ['MI'], NY: ['RI'], RI: ['NY'] };
  function stateNb(id) { return S(id).nb.filter(function (x) { return x !== 'DC'; }); }
  function notNb(id, pool) { var nb = stateNb(id), bad = NOT_DISTRACT[id] || []; return pool.filter(function (x) { return x !== id && x !== 'DC' && nb.indexOf(x) < 0 && bad.indexOf(x) < 0; }); }

  /* ---- regions as this course teaches them (Census Bureau divisions, grouped as the skill map does) */
  var REGS = {
    ne: { name: 'the Northeast', ids: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'], pairs: [['VT', 'NH'], ['CT', 'RI'], ['MA', 'CT'], ['NY', 'PA'], ['NJ', 'CT'], ['ME', 'NH']] },
    mw: { name: 'the Midwest', ids: ['OH', 'IN', 'IL', 'MI', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'], pairs: [['IA', 'MO'], ['NE', 'KS'], ['ND', 'SD'], ['MI', 'WI'], ['IN', 'OH'], ['IL', 'IN'], ['MN', 'WI'], ['IA', 'NE']] },
    sat: { name: 'the South Atlantic', ids: ['DE', 'MD', 'VA', 'WV', 'NC', 'SC', 'GA', 'FL'], pairs: [['NC', 'SC'], ['VA', 'WV'], ['MD', 'DE'], ['GA', 'SC'], ['GA', 'FL'], ['VA', 'NC']] },
    scen: { name: 'the South Central states', ids: ['KY', 'TN', 'AL', 'MS', 'AR', 'LA', 'OK', 'TX'], pairs: [['AL', 'MS'], ['KY', 'TN'], ['AR', 'LA'], ['MS', 'LA'], ['OK', 'AR'], ['TN', 'AL']] },
    mtn: { name: 'the Mountain West', ids: ['MT', 'ID', 'WY', 'NV', 'UT', 'CO', 'AZ', 'NM'], pairs: [['WY', 'CO'], ['AZ', 'NM'], ['ID', 'MT'], ['UT', 'NV'], ['UT', 'CO'], ['MT', 'WY']] },
    pac: { name: 'the Pacific', ids: ['WA', 'OR', 'CA', 'AK', 'HI'], pairs: [['WA', 'OR'], ['OR', 'CA'], ['AK', 'HI']] }
  };
  function regOf(id) { for (var k in REGS) if (REGS[k].ids.indexOf(id) >= 0) return k; return null; }
  // one short clue per state, used in worked steps
  var CLUE = {
    ME: 'Maine is the far northeast corner of the country, touching only New Hampshire.', NH: 'New Hampshire is the eastern one of the two thin states between New York and Maine, with a short stretch of ocean coast.',
    VT: 'Vermont is the western one of the two thin states between New York and Maine; it has no ocean coast.', MA: 'Massachusetts stretches across southern New England, with the hook of Cape Cod sticking out into the ocean.',
    RI: 'Rhode Island is the smallest state, tucked between Connecticut and Massachusetts on the coast.', CT: 'Connecticut is the southwestern corner of New England, just east of New York.',
    NY: 'New York reaches from Lake Erie and Lake Ontario down to New York City and Long Island on the ocean.', NJ: 'New Jersey sits between New York City and Philadelphia, along the Atlantic Ocean.',
    PA: 'Pennsylvania is a wide state with almost no coast, west of New Jersey and south of New York.',
    OH: 'Ohio is south of Lake Erie and north of the Ohio River, between Pennsylvania and Indiana.', IN: 'Indiana is between Illinois and Ohio, touching the bottom tip of Lake Michigan.',
    IL: 'Illinois is long and thin, from Chicago on Lake Michigan down to the meeting of the Ohio and Mississippi rivers.', MI: 'Michigan is the mitten-shaped state with an upper peninsula, surrounded by four of the Great Lakes.',
    WI: 'Wisconsin is between Lake Michigan and Minnesota, just west of Michigan\'s mitten.', MN: 'Minnesota is the northern state on the Canadian border, west of Lake Superior.',
    IA: 'Iowa is between the Mississippi and Missouri rivers, north of Missouri.', MO: 'Missouri is south of Iowa, with St. Louis on the Mississippi River at its eastern edge.',
    ND: 'North Dakota is the rectangle on the Canadian border, north of South Dakota.', SD: 'South Dakota is the rectangle between North Dakota and Nebraska.',
    NE: 'Nebraska is north of Kansas, with a notch cut out of its southwest corner by Colorado.', KS: 'Kansas is the rectangle directly south of Nebraska, in the middle of the country.',
    DE: 'Delaware is the small state on the Atlantic coast, east of Maryland.', MD: 'Maryland wraps around Chesapeake Bay, north of Virginia.', VA: 'Virginia is south of Maryland, on the Atlantic coast, with Washington, D.C., at its northern tip.',
    WV: 'West Virginia is the mountain state west of Virginia, with no ocean coast.', NC: 'North Carolina is the long state below Virginia, with the Outer Banks along its coast.',
    SC: 'South Carolina is the smaller state below North Carolina, shaped like a triangle.', GA: 'Georgia is south of Tennessee and North Carolina, just north of Florida.',
    FL: 'Florida is the long peninsula in the southeast corner of the country.',
    KY: 'Kentucky is north of Tennessee, with the Ohio River along its northern edge.', TN: 'Tennessee is the long, thin state south of Kentucky, stretching from North Carolina to the Mississippi River.',
    AL: 'Alabama is east of Mississippi and west of Georgia, with a short coast on the Gulf.', MS: 'Mississippi is the western one of the pair, with the Mississippi River along its western edge.',
    AR: 'Arkansas is west of the Mississippi River, between Missouri and Louisiana.', LA: 'Louisiana is the boot-shaped state at the mouth of the Mississippi River.',
    OK: 'Oklahoma is shaped like a pan with a long handle, just north of Texas.', TX: 'Texas is the very large state in the south, along the border with Mexico.',
    MT: 'Montana is the big state along the Canadian border, east of Idaho.', ID: 'Idaho is the narrow state with a thin northern handle, between Washington and Montana.',
    WY: 'Wyoming is the near-rectangle north of Colorado.', NV: 'Nevada is east of California, shaped like a wedge.', UT: 'Utah is the state with a notch cut out of its northeast corner, west of Colorado.',
    CO: 'Colorado is the near-rectangle south of Wyoming and north of New Mexico.', AZ: 'Arizona is the southwestern one of the Four Corners states, west of New Mexico.', NM: 'New Mexico is the southeastern one of the Four Corners states, east of Arizona.',
    WA: 'Washington is the northwest corner of the 48 states, north of Oregon.', OR: 'Oregon is between Washington and California, on the Pacific coast.', CA: 'California is the long state on the Pacific coast, south of Oregon.',
    AK: 'Alaska is the huge state in the far northwest, next to Canada.', HI: 'Hawaii is the chain of islands in the middle of the Pacific Ocean.',
    DC: 'Washington, D.C., is the tiny district between Maryland and Virginia, on the Potomac River.'
  };
  // a region map that shows a few states clearly: small eastern states get a zoomed view
  var SMALL = ['RI', 'DE', 'CT', 'NJ', 'MD', 'MA', 'VT', 'NH', 'DC'];
  function viewFor(ids) {
    var small = ids.some(function (x) { return SMALL.indexOf(x) >= 0; });
    if (!small) return {};
    var reg = []; ids.forEach(function (x) { reg.push(x); stateNb(x).forEach(function (n) { reg.push(n); }); });
    return { region: uniq(reg) };
  }

  /* ================================================================== Unit 1: The United States on the Map */

  /* ---- usgeo.us-on-the-map */
  var WHERE_TRUE = [
    ['The United States is in North America.', 'It shares the continent with Canada, Mexico and the countries of Central America and the Caribbean.'],
    ['Canada is north of the 48 states that touch one another.', 'Canada is the country to the north.'],
    ['Mexico is south of the United States.', 'Mexico is the country to the south.'],
    ['The Atlantic Ocean is east of the United States.', 'The East Coast faces the Atlantic.'],
    ['The Pacific Ocean is west of the United States.', 'The West Coast faces the Pacific.'],
    ['Alaska shares a border with Canada.', 'Alaska is in the far northwest of North America, next to Canada\'s Yukon.'],
    ['Hawaii is in the Pacific Ocean.', 'Hawaii is a chain of islands far out in the Pacific.']];
  var WHERE_FALSE = [
    ['Alaska is an island near Mexico.', 'Alaska is attached to the continent in the far northwest, next to Canada. Small inset boxes on maps make it look like an island.'],
    ['Mexico is north of the United States.', 'Mexico is to the south; Canada is to the north.'],
    ['The United States is in South America.', 'The United States is in North America.'],
    ['The Atlantic Ocean is west of the United States.', 'The Atlantic is to the east; the Pacific is to the west.'],
    ['Hawaii is in the Atlantic Ocean.', 'Hawaii is in the Pacific Ocean.'],
    ['Alaska shares a border with Mexico.', 'Alaska touches only Canada.']];
  Gen('usgeo.us-on-the-map', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['country', 'ocean', 'neighbor'] : L === 2 ? ['alaska', 'continent', 'tf', 'ocean'] : ['alaskadir', 'all', 'hawaii', 'tf']);
    if (shape === 'country') {
      var ids = R.shuffle(['USA', 'CAN', 'MEX']), want = R.pick(ids);
      var names = { USA: 'the United States', CAN: 'Canada', MEX: 'Mexico' };
      return { q: 'Which letter marks ' + names[want] + '?', viz: worldmap({ region: 'nca', mark: lettersFor(ids), dots: false }), a: Object.assign(letterQ(ids), { v: ids.indexOf(want) }),
        hint: 'Canada is the big country to the north; Mexico is to the south.',
        steps: ['On this map of North America, Canada is the large country at the top and Mexico is at the bottom.', 'The United States is in the middle, between them.', names[want].charAt(0).toUpperCase() + names[want].slice(1) + ' is letter ' + LET[ids.indexOf(want)] + '.'] };
    }
    if (shape === 'ocean') {
      var east = R.coin(), right = east ? 'The Atlantic Ocean' : 'The Pacific Ocean';
      var ch = R.shuffle([right, east ? 'The Pacific Ocean' : 'The Atlantic Ocean', L === 1 ? 'The Indian Ocean' : 'The Arctic Ocean']);
      return { q: 'Which ocean lies along the ' + (east ? 'east' : 'west') + ' coast of the United States?', viz: worldmap({ region: 'nca', oceans: true, highlight: ['USA'], dots: false, ask: east ? 'atlantic' : 'pacific' }), a: mc(ch, right),
        hint: 'East is to the right on the map, west is to the left.',
        steps: ['On a map, east is to the right and west is to the left.', 'The ' + (east ? 'Atlantic Ocean is to the east' : 'Pacific Ocean is to the west') + ' of the United States.'] };
    }
    if (shape === 'neighbor') {
      var north = R.coin(), r2 = north ? 'Canada' : 'Mexico';
      return { q: 'Which country is ' + (north ? 'north' : 'south') + ' of the United States?', viz: worldmap({ region: 'nca', highlight: ['USA'], dots: false }), a: mc(R.shuffle(['Canada', 'Mexico', L === 1 ? 'Brazil' : 'Cuba']), r2),
        hint: 'North is up on this map.', steps: ['North is up and south is down.', (north ? 'Canada is the country to the north.' : 'Mexico is the country to the south.')] };
    }
    if (shape === 'alaska') {
      return { q: 'Alaska shares a land border with which country?', viz: worldmap({ region: 'nca', highlight: ['USA'], dots: false }), a: mc(R.shuffle(['Canada', 'Mexico', 'Russia']), 'Canada'),
        hint: 'Find Alaska in the far northwest corner of the map. What is right next to it?',
        steps: ['Many U.S. maps show Alaska in a small box near Mexico, but that box is only to save space.', 'On a real map, Alaska is in the far northwest of North America.', 'Its land border is with Canada. Russia is close, but across the sea.'] };
    }
    if (shape === 'continent') {
      return { q: 'On which continent is the United States?', viz: { name: 'gg-globe', opts: { focus: 'USA', highlight: ['USA'], quiet: true, interactive: false } }, a: mc(R.shuffle(['North America', 'South America', 'Europe']), 'North America'),
        hint: 'The country is between Canada and Mexico.', steps: ['The United States is between Canada and Mexico.', 'All three are in North America.'] };
    }
    if (shape === 'alaskadir') {
      return { q: 'In which direction is Alaska from the 48 states that touch one another?', viz: worldmap({ region: 'nca', highlight: ['USA'], dots: false }), a: mc(R.shuffle(['Northwest', 'Southwest', 'Northeast', 'Southeast']), 'Northwest'),
        hint: 'Find Alaska on the real map, not in an inset box.', steps: ['Alaska is up and to the left of the 48 states.', 'Up is north and left is west, so Alaska is to the northwest.', 'Canada lies in between.'] };
    }
    if (shape === 'hawaii') {
      return { q: 'Hawaii is a chain of islands in which ocean?', viz: { name: 'gg-globe', opts: { center: [-160, 20], quiet: true, interactive: false } }, a: mc(R.shuffle(['The Pacific Ocean', 'The Atlantic Ocean', 'The Indian Ocean', 'The Arctic Ocean']), 'The Pacific Ocean'),
        hint: 'Hawaii is far west of California.', steps: ['Hawaii is far out to the west of California.', 'That is the Pacific Ocean, the largest ocean.'] };
    }
    if (shape === 'all') {
      var t = R.sample(WHERE_TRUE, 2), f = R.sample(WHERE_FALSE, 2), list = R.shuffle(t.map(function (x) { return [x, true]; }).concat(f.map(function (x) { return [x, false]; })));
      return { q: 'Which statements are true? Choose all that are true.', a: mcAll(list.map(function (x) { return x[0][0]; }), t.map(function (x) { return x[0]; })),
        hint: 'Picture the map: Canada to the north, Mexico to the south, oceans on both sides.', steps: list.map(function (x) { return (x[1] ? 'True: ' : 'Not true: ') + x[0][0] + ' ' + x[0][1]; }) };
    }
    var isT = R.coin(), it = R.pick(isT ? WHERE_TRUE : WHERE_FALSE);
    return { q: 'True or false? ' + it[0], a: tf(isT), hint: 'Picture the map of North America.', steps: [(isT ? 'True. ' : 'False. ') + it[1]] };
  });

  /* ---- usgeo.fifty-states */
  var FIFTY_TF = [
    ['The United States has 50 states.', true, 'There are 50 states.'],
    ['Washington, D.C., is a state.', false, 'Washington, D.C., is the District of Columbia, a federal district. It is not part of any state.'],
    ['Washington, D.C., is in Washington State.', false, 'Washington, D.C., is on the East Coast, between Maryland and Virginia. Washington State is in the far northwest.'],
    ['Alaska and Hawaii do not touch any other state.', true, 'Alaska is next to Canada, and Hawaii is out in the Pacific.'],
    ['48 of the states touch one another.', true, 'All the states except Alaska and Hawaii form one block of land.'],
    ['Washington, D.C., is the nation\'s capital.', true, 'The national government meets in Washington, D.C.'],
    ['Hawaii touches California.', false, 'Hawaii is a chain of islands far out in the Pacific Ocean.']];
  Gen('usgeo.fifty-states', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['count', 'tf', 'apart'] : L === 2 ? ['dc', 'tf', 'between', 'apart'] : ['dcmap', 'between', 'touch', 'tf']);
    if (shape === 'count') {
      var c = R.pick([['How many states does the United States have?', 50, 'There are 50 states.'], ['How many states touch one another in one block of land (not counting Alaska and Hawaii)?', 48, '50 states minus Alaska and Hawaii leaves 48.']]);
      return { q: c[0], viz: usmap({}), a: num(c[1]), hint: 'Count the two states that stand apart, then subtract.', steps: [c[2]] };
    }
    if (shape === 'apart') {
      var right = 'Alaska and Hawaii', ch = R.shuffle([right].concat(R.sample(['Alaska and Maine', 'Hawaii and Florida', 'Texas and California'], L === 1 ? 2 : 3)));
      return { q: 'Which two states do not touch any other state?', viz: usmap({}), a: mc(ch, right),
        hint: 'Look for the states drawn in boxes.', steps: ['Alaska is in the far northwest, next to Canada.', 'Hawaii is a chain of islands in the Pacific Ocean.', 'Neither one touches another state, so maps often show them in boxes.'] };
    }
    if (shape === 'dc') {
      var r3 = 'A federal district, not part of any state', ch3 = R.shuffle([r3, 'A city in Washington State', 'The 51st state', 'A city in Virginia']);
      return { q: 'What is Washington, D.C.?', a: mc(ch3, r3), hint: 'D.C. stands for District of Columbia.',
        steps: ['D.C. stands for the District of Columbia.', 'It is a federal district: the home of the national government, set apart from every state.', 'It is on the East Coast, between Maryland and Virginia, far from Washington State.'] };
    }
    if (shape === 'between') {
      var r4 = 'Maryland and Virginia', ch4 = R.shuffle([r4, 'Washington and Oregon', 'New York and New Jersey', 'Ohio and Kentucky']);
      return { q: 'Washington, D.C., sits between which two states?', viz: usmap({ region: ['DC', 'MD', 'VA', 'DE', 'WV'], highlight: ['DC'] }), a: mc(ch4, r4),
        hint: 'It is on the Potomac River, near Chesapeake Bay.', steps: ['Washington, D.C., is on the Potomac River.', 'Maryland is on its north and east sides, and Virginia is across the river to the southwest.'] };
    }
    if (shape === 'dcmap') {
      var ids = R.shuffle(['WA', 'DC', R.pick(['TX', 'CO', 'MN'])]);
      return { q: 'Which letter marks Washington, D.C., the nation\'s capital?', viz: usmap({ mark: lettersFor(ids), dots: true }), a: Object.assign(letterQ(ids), { v: ids.indexOf('DC') }),
        hint: 'The capital is on the East Coast, not in Washington State.',
        steps: ['Washington State is in the far northwest, letter ' + LET[ids.indexOf('WA')] + '.', 'Washington, D.C., is on the East Coast between Maryland and Virginia: letter ' + LET[ids.indexOf('DC')] + '.'] };
    }
    if (shape === 'touch') {
      var pick = R.pick([['Alaska', 'Canada', 'Canada, a country, not another state'], ['Hawaii', 'none', 'nothing: it is surrounded by the Pacific Ocean']]);
      var r5 = pick[0] === 'Alaska' ? 'Only Canada' : 'Only the ocean';
      return { q: 'What does ' + pick[0] + ' touch along its edges?', a: mc(R.shuffle(['Only Canada', 'Only the ocean', 'Washington and Oregon', 'California']), r5),
        hint: 'Neither Alaska nor Hawaii touches another state.', steps: [pick[0] + ' touches ' + pick[2] + '.', 'That is why only 48 states form one block.'] };
    }
    var it = R.pick(FIFTY_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'Remember: 50 states, plus the District of Columbia.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ---- usgeo.territories */
  var TERR = [
    { id: 'PRI', n: 'Puerto Rico', sea: 'Caribbean', lon: -66.5, lat: 18.2 },
    { id: 'VIR', n: 'the U.S. Virgin Islands', sea: 'Caribbean', lon: -64.8, lat: 17.9 },
    { id: 'GUM', n: 'Guam', sea: 'Pacific', lon: 144.8, lat: 13.45 },
    { id: 'MNP', n: 'the Northern Mariana Islands', sea: 'Pacific', lon: 145.7, lat: 15.2 },
    { id: 'ASM', n: 'American Samoa', sea: 'Pacific', lon: -170.7, lat: -14.3 }];
  var NOT_TERR = ['Hawaii', 'Cuba', 'Jamaica', 'Alaska', 'the Bahamas', 'Florida'];
  var TERR_TF = [
    ['Puerto Rico is a U.S. territory, not a state.', true, 'Puerto Rico is a territory of the United States.'],
    ['People born in Puerto Rico are U.S. citizens.', true, 'People born in Puerto Rico, Guam, the U.S. Virgin Islands and the Northern Mariana Islands are U.S. citizens.'],
    ['Puerto Rico is the 51st state.', false, 'Puerto Rico is a territory. There are 50 states.'],
    ['Puerto Rico is a separate country.', false, 'Puerto Rico is a territory of the United States.'],
    ['Guam is in the Pacific Ocean.', true, 'Guam is in the western Pacific, far west of Hawaii.'],
    ['The U.S. Virgin Islands are in the Caribbean Sea.', true, 'They are east of Puerto Rico, in the Caribbean.'],
    ['Hawaii is a U.S. territory.', false, 'Hawaii has been a state since 1959.'],
    ['American Samoa is south of the equator.', true, 'American Samoa is in the South Pacific, the only one of the five south of the equator.']];
  Gen('usgeo.territories', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['which', 'tf', 'sea'] : L === 2 ? ['which', 'tf', 'sea', 'citizen'] : ['all', 'letter', 'tf', 'south']);
    if (shape === 'which') {
      var t = R.pick(TERR), w = R.sample(NOT_TERR, L === 1 ? 2 : 3), ch = R.shuffle([cap1(t.n)].concat(w.map(cap1)));
      return { q: 'Which of these is a U.S. territory?', a: mc(ch, cap1(t.n)), hint: 'A territory belongs to the United States but is not a state.',
        steps: [cap1(t.n) + ' is a U.S. territory.', w.map(cap1).join(', ').replace(/, ([^,]*)$/, ' and $1') + (w.length > 1 ? ' are' : ' is') + ' not: ' + w.map(function (x) { return /Hawaii|Alaska|Florida/.test(x) ? cap1(x) + ' is a state' : cap1(x) + ' is a separate country'; }).join('; ') + '.'] };
    }
    if (shape === 'sea') {
      var t2 = R.pick(TERR), r = t2.sea === 'Caribbean' ? 'The Caribbean Sea' : 'The Pacific Ocean';
      return { q: 'Where is ' + t2.n + '?', viz: worldmap({ wholeWorld: true, color: 'plain', points: [{ lon: t2.lon, lat: t2.lat, mark: '?' }], dots: false }), a: mc(R.shuffle(['The Caribbean Sea', 'The Pacific Ocean', 'The Indian Ocean']), r),
        hint: 'Look at the question mark on the map.', steps: [cap1(t2.n) + (t2.sea === 'Caribbean' ? ' is in the Caribbean Sea, southeast of Florida.' : ' is in the Pacific Ocean.'), 'Puerto Rico and the U.S. Virgin Islands are in the Caribbean; Guam, the Northern Mariana Islands and American Samoa are in the Pacific.'] };
    }
    if (shape === 'citizen') {
      var r2 = 'U.S. citizens', ch2 = R.shuffle([r2, 'Citizens of another country', 'Visitors who need a passport to enter the U.S.']);
      return { q: 'People born in Puerto Rico are…', a: mc(ch2, r2), hint: 'Puerto Rico is part of the United States, as a territory.',
        steps: ['Puerto Rico is a U.S. territory, not a separate country.', 'People born there are U.S. citizens, as are people born in Guam, the U.S. Virgin Islands and the Northern Mariana Islands.', 'People born in American Samoa are U.S. nationals, a related status.'] };
    }
    if (shape === 'letter') {
      var ts = R.sample(TERR.filter(function (x) { return x.id !== 'MNP' && x.id !== 'VIR'; }), 3), want = R.pick(ts);
      return { q: 'Which letter marks ' + want.n + '?', viz: worldmap({ wholeWorld: true, color: 'plain', points: ts.map(function (x, i) { return { lon: x.lon, lat: x.lat, mark: LET[i] }; }), dots: false }), a: Object.assign(letterQ(ts), { v: ts.indexOf(want) }),
        hint: 'Puerto Rico is in the Caribbean; Guam is in the far western Pacific; American Samoa is south of the equator.',
        steps: ts.map(function (x, i) { return 'Letter ' + LET[i] + ' is ' + x.n + (x.sea === 'Caribbean' ? ', in the Caribbean.' : x.id === 'ASM' ? ', in the South Pacific.' : ', in the western Pacific.'); }) };
    }
    if (shape === 'south') {
      return { q: 'Which U.S. territory is south of the equator?', viz: worldmap({ wholeWorld: true, color: 'plain', lines: ['equator'], dots: false }), a: mc(R.shuffle(['American Samoa', 'Guam', 'Puerto Rico', 'The U.S. Virgin Islands']), 'American Samoa'),
        hint: 'Four of the five are north of the equator.', steps: ['Puerto Rico, the U.S. Virgin Islands, Guam and the Northern Mariana Islands are all north of the equator.', 'American Samoa is in the South Pacific, south of the equator.'] };
    }
    if (shape === 'all') {
      var tr = R.sample(TERR, 2), wr = R.sample(NOT_TERR, 2), list = R.shuffle(tr.map(function (x) { return cap1(x.n); }).concat(wr.map(cap1)));
      return { q: 'Which of these are U.S. territories? Choose all that are.', a: mcAll(list, tr.map(function (x) { return cap1(x.n); })), hint: 'Territories belong to the U.S. but are not states.',
        steps: list.map(function (x) { var isT = tr.some(function (t) { return cap1(t.n) === x; }); return x + (isT ? ': a U.S. territory.' : /Hawaii|Alaska|Florida/.test(x) ? ': a state.' : ': a separate country.'); }) };
    }
    var it = R.pick(TERR_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'A territory belongs to the United States but is not a state.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ---- usgeo.regions */
  var TRICKY_REG = ['DE', 'MD', 'WV', 'KY', 'OK', 'TX', 'MO', 'OH', 'PA', 'NJ', 'MT', 'NM', 'AZ', 'VA'];
  function regName(r) { return { ne: 'Northeast', mw: 'Midwest', s: 'South', w: 'West' }[r]; }
  Gen('usgeo.regions', function (R, ctx) {
    var L = ctx.level || 1, all = GG().states(), shape = R.pick(L === 1 ? ['which', 'which', 'count'] : L === 2 ? ['which', 'not', 'count'] : ['not', 'which', 'division']);
    if (shape === 'which') {
      var st = L === 2 ? S(R.pick(TRICKY_REG)) : R.pick(all), right = regName(st.reg);
      return { q: 'In which Census region is the highlighted state, ' + st.n + '?', viz: usmap({ highlight: [st.id] }), a: mc(['Northeast', 'Midwest', 'South', 'West'], right, true),
        hint: 'Remember the four regions: Northeast, Midwest, South and West.',
        steps: [st.n + ' is in the ' + right + ' region (the ' + GG().DIV[st.div] + ' division).'].concat(['DE', 'MD', 'WV', 'KY', 'OK', 'TX'].indexOf(st.id) >= 0 ? ['Many people are surprised, but the Census Bureau counts ' + st.n + ' as part of the South.'] : st.id === 'MO' ? ['Missouri is in the Midwest, even though its southern edge touches Arkansas and Tennessee.'] : []) };
    }
    if (shape === 'count') {
      var c = R.pick([['How many regions does the Census Bureau divide the states into?', 4, 'Four regions: the Northeast, the Midwest, the South and the West.'], ['How many divisions does the Census Bureau use inside its four regions?', 9, 'Nine divisions, such as New England and the Pacific.']]);
      if (L === 1) c = R.pick([c, ['How many regions does the Census Bureau divide the states into?', 4, 'Four regions: the Northeast, the Midwest, the South and the West.']]);
      return { q: c[0], a: num(c[1]), hint: 'Think of the regions map: North-east, Mid-west, South, West.', steps: [c[2]] };
    }
    if (shape === 'not') {
      var reg = R.pick(['ne', 'mw', 's', 'w']), ins = R.sample(all.filter(function (x) { return x.reg === reg; }), 3), out = R.pick(all.filter(function (x) { return x.reg !== reg && (L === 3 ? TRICKY_REG.indexOf(x.id) >= 0 : true); }));
      var ch = R.shuffle(ins.concat([out]).map(function (x) { return x.n; }));
      return { q: 'Which state is NOT in the ' + regName(reg) + '?', a: mc(ch, out.n), hint: 'Picture each state on the map.',
        steps: [ins.map(function (x) { return x.n; }).join(', ').replace(/, ([^,]*)$/, ' and $1') + ' are in the ' + regName(reg) + '.', out.n + ' is in the ' + regName(out.reg) + '.'] };
    }
    var st2 = R.pick(all), d = st2.div, wrongD = R.sample(Object.keys(GG().DIV).filter(function (k) { return k !== d; }), 3);
    var ch2 = R.shuffle([d].concat(wrongD)).map(function (k) { return GG().DIV[k]; });
    return { q: 'In which Census division is ' + st2.n + '?', viz: usmap({ highlight: [st2.id] }), a: mc(ch2, GG().DIV[d]), hint: 'First think of its region, then which part of the region.',
      steps: [st2.n + ' is in the ' + regName(st2.reg) + ' region.', 'Inside that region, it is in the ' + GG().DIV[d] + ' division.'] };
  });

  /* ---- usgeo.postal-codes */
  var CONFUSE_CODE = [['AK', 'AL', 'AR', 'AZ'], ['MI', 'MN', 'MS', 'MO'], ['MA', 'ME', 'MD', 'MI'], ['IA', 'ID', 'IL', 'IN'], ['NE', 'NV', 'NH', 'NM'], ['NC', 'ND', 'NJ', 'NY'], ['CO', 'CT', 'CA', 'GA'], ['MT', 'MO', 'ME', 'MN'], ['TN', 'TX', 'VT', 'KY'], ['WA', 'WV', 'WI', 'WY'], ['PA', 'HI', 'OH', 'OK']];
  function codeGroup(id) { var gs = CONFUSE_CODE.filter(function (g) { return g.indexOf(id) >= 0; }); return gs.length ? gs[0] : null; }
  Gen('usgeo.postal-codes', function (R, ctx) {
    var L = ctx.level || 1, all = GG().states(), shape = R.pick(L === 1 ? ['code', 'state'] : L === 2 ? ['code', 'state', 'mapcode'] : ['type', 'mapcode', 'state']);
    var st;
    if (L === 1) st = R.pick(all.filter(function (x) { return x.id === x.n.slice(0, 2).toUpperCase() || /^(New|North|South|West|Rhode)/.test(x.n); }));
    else st = S(R.pick(R.pick(CONFUSE_CODE)));
    var grp = codeGroup(st.id) || [st.id], wrong;
    if (shape === 'code') {
      wrong = L === 1 ? R.sample(all.filter(function (x) { return x.id[0] !== st.id[0]; }), 2).map(function (x) { return x.id; }) : R.sample(grp.filter(function (x) { return x !== st.id; }), 3);
      if (L === 2 && wrong.length < 3) wrong = wrong.concat(R.sample(all.filter(function (x) { return x.id !== st.id && wrong.indexOf(x.id) < 0 && x.id[0] === st.id[0]; }), 3 - wrong.length).map(function (x) { return x.id; }));
      return { q: 'What is the two-letter postal code for ' + st.n + '?', a: mc(R.shuffle([st.id].concat(wrong)), st.id), hint: 'Codes are two capital letters. Several states starting with the same letter have look-alike codes.',
        steps: [st.n + '\'s code is ' + st.id + '.'].concat(wrong.map(function (w) { return w + ' is ' + nm(w) + '.'; })) };
    }
    if (shape === 'state') {
      var wr = L === 1 ? R.sample(all.filter(function (x) { return x.id[0] !== st.id[0]; }), 2) : grp.filter(function (x) { return x !== st.id; }).slice(0, 3).map(S);
      var ch = R.shuffle([st].concat(wr)).map(function (x) { return x.n; });
      return { q: 'Which state has the postal code ' + st.id + '?', a: mc(ch, st.n), hint: 'Do not guess from the first two letters of the name alone.',
        steps: [st.id + ' is ' + st.n + '.'].concat(wr.map(function (x) { return x.n + ' is ' + x.id + '.'; })) };
    }
    if (shape === 'mapcode') {
      var wr2 = grp.filter(function (x) { return x !== st.id; }).slice(0, 3);
      return { q: 'The map shows the postal codes of the states. What is the code of the orange state?', viz: usmap({ labels: 'postal', highlight: [st.id], ask: st.id }),
        a: L === 3 ? txt([st.id]) : mc(R.shuffle([st.id].concat(wr2)), st.id), hint: 'Name the state first, then its code.',
        steps: ['The orange state is ' + st.n + '.', 'Its postal code is ' + st.id + '.'] };
    }
    return { q: 'Type the two-letter postal code for ' + st.n + '.', a: txt([st.id]), hint: 'Two capital letters, no period.', steps: [st.n + '\'s postal code is ' + st.id + '.'].concat(grp.length > 1 ? ['Look-alikes: ' + grp.filter(function (x) { return x !== st.id; }).map(function (x) { return x + ' is ' + nm(x); }).join(', ') + '.'] : []) };
  });

  /* ================================================================== Unit 2: States and Capitals by Region */

  function pairOf(id, pairs) { var o = []; pairs.forEach(function (p) { if (p[0] === id) o.push(p[1]); else if (p[1] === id) o.push(p[0]); }); return o; }
  // choose the target and k-1 other states from ids; level 2+ includes a look-alike partner when there is one
  function pickSet(R, ids, pairs, k, lookalike) {
    var want = R.pick(ids), p = lookalike ? pairOf(want, pairs).filter(function (x) { return ids.indexOf(x) >= 0; }) : [];
    var set = [want];
    if (p.length) set.push(R.pick(p));
    var rest = others(ids, set.concat(lookalike ? [] : pairOf(want, pairs)));
    set = set.concat(R.sample(rest, k - set.length));
    return { want: want, set: R.shuffle(set) };
  }
  function regionView(regIds, set) { return regIds ? { region: regIds } : viewFor(set); }
  function makeStatesGen(regIds, pairs, regName) {
    return function (R, ctx) {
      var L = ctx.level || 1, ids = regIds || GG().states().map(function (s) { return s.id; });
      var shape = R.pick(L === 1 ? ['letter', 'name'] : L === 2 ? ['letter', 'name', 'outline'] : ['type', 'outline', 'letter', 'shape1']);
      if (!regIds && L === 1) ids = ids.filter(function (x) { return SMALL.indexOf(x) < 0 && x !== 'AK' && x !== 'HI'; });
      var k = L === 1 ? 3 : 4, ps = pickSet(R, ids, pairs, k, L >= 2), want = ps.want, set = ps.set;
      var clue = CLUE[want];
      if (shape === 'letter') {
        return { q: 'Which letter marks ' + nm(want) + '?', viz: usmap(Object.assign(regionView(regIds, set), { mark: lettersFor(set) })), a: Object.assign(letterQ(set), { v: set.indexOf(want) }),
          hint: 'Find a state you are sure of first, then work from there.',
          steps: [clue, nm(want) + ' is letter ' + LET[set.indexOf(want)] + '.'].concat(set.filter(function (x) { return x !== want; }).map(function (x) { return 'Letter ' + LET[set.indexOf(x)] + ' is ' + nm(x) + '.'; })) };
      }
      if (shape === 'name') {
        var ch = set.map(nm);
        return { q: 'Which state is shown in orange?', viz: usmap(Object.assign(regionView(regIds, [want]), { highlight: [want] })), a: mc(ch, nm(want)),
          hint: 'Look at its shape and at what is around it.', steps: [clue, 'So the orange state is ' + nm(want) + '.'] };
      }
      if (shape === 'outline') {
        var o4 = set.filter(function (x) { return x !== 'HI'; }); if (o4.indexOf(want) < 0) o4[0] = want;
        return { q: 'Which shape is ' + nm(want) + '? (The shapes are not drawn to the same scale.)', viz: outline(o4), a: Object.assign(letterQ(o4), { v: o4.indexOf(want) }),
          hint: 'Picture the state on the map. Is it tall or wide? Does it have a notch, a hook or a coastline?',
          steps: [clue, 'That matches shape ' + LET[o4.indexOf(want)] + '.'] };
      }
      if (shape === 'shape1') {
        var ch1 = set.map(nm);
        return { q: 'Which state has this shape?', viz: outline([want]), a: mc(ch1, nm(want)), hint: 'Is it tall or wide? Does it have a notch, a handle or a coast?', steps: [clue, 'So the shape is ' + nm(want) + '.'] };
      }
      return { q: 'Type the name of the state shown in orange.', viz: usmap(Object.assign(regionView(regIds, [want]), { highlight: [want] })), a: txt(GG().names(want)),
        hint: 'Look at its shape and its neighbors' + (regName ? ' in ' + regName : '') + '.', steps: [clue, 'The orange state is ' + nm(want) + '.'] };
    };
  }
  // capital distractors with similar names
  var SIMCAP = { Columbia: ['Columbus'], Columbus: ['Columbia'], Jackson: ['Jefferson City'], 'Jefferson City': ['Jackson'], Charleston: ['Columbia'], Concord: ['Salem'], Salem: ['Concord'], Lincoln: ['Springfield'], Springfield: ['Lincoln'], Augusta: ['Atlanta'], Richmond: ['Raleigh'], Raleigh: ['Richmond'], 'Carson City': ['Jefferson City'], 'Oklahoma City': ['Salt Lake City'], 'Salt Lake City': ['Oklahoma City'], Helena: ['Boise'], Pierre: ['Bismarck'], Bismarck: ['Pierre'] };
  function capChoices(R, id, pool, k, trap) {
    var st = S(id), ch = [st.cap];
    if (trap) { ch.push(st.city); (SIMCAP[st.cap] || []).forEach(function (c) { if (ch.length < k) ch.push(c); }); }
    var rest = R.shuffle(pool.filter(function (x) { return x !== id; }).map(function (x) { return S(x).cap; }));
    rest.forEach(function (c) { if (ch.length < k && ch.indexOf(c) < 0) ch.push(c); });
    return R.shuffle(uniq(ch).slice(0, k));
  }
  function makeCapitalsGen(regIds, regName) {
    return function (R, ctx) {
      var L = ctx.level || 1, ids = regIds || GG().states().map(function (s) { return s.id; });
      var shape = R.pick(L === 1 ? ['cap', 'cap', 'rev'] : L === 2 ? ['cap', 'rev', 'cap'] : ['type', 'rev', 'star', 'typestate']);
      var want = R.pick(ids), st = S(want), view = regIds ? { region: regIds } : viewFor([want]);
      if (shape === 'cap') {
        var ch = capChoices(R, want, ids, L === 1 ? 3 : 4, L >= 2);
        return { q: 'What is the capital of ' + st.n + '?', viz: usmap(Object.assign({}, view, { highlight: [want], capitals: [want], capLabels: false })), a: mc(ch, st.cap),
          hint: 'The capital is where the state government meets. It is often not the biggest city.',
          steps: ['The capital of ' + st.n + ' is ' + st.cap + ' (the star on the map).'].concat(ch.indexOf(st.city) >= 0 ? [st.city + ' is a well-known city in ' + st.n + ', but it is not the capital.'] : []).concat(ch.filter(function (c) { return c !== st.cap && c !== st.city; }).map(function (c) { var o = GG().S.filter(function (x) { return x.cap === c; })[0]; return o ? c + ' is the capital of ' + o.n + '.' : ''; }).filter(Boolean)) };
      }
      if (shape === 'rev') {
        var sts = R.sample(others(ids, [want]), L === 1 ? 2 : 3).concat([want]); sts = R.shuffle(sts);
        return { q: st.cap + ' is the capital of which state?', a: mc(sts.map(nm), st.n), hint: 'Picture each state\'s capital.',
          steps: [st.cap + ' is the capital of ' + st.n + '.'].concat(sts.filter(function (x) { return x !== want; }).map(function (x) { return 'The capital of ' + nm(x) + ' is ' + S(x).cap + '.'; })) };
      }
      if (shape === 'star') {
        var pool = regIds ? ids : others(ids, ['AK', 'HI']).filter(function (x) { return SMALL.indexOf(x) < 0; });
        if (pool.indexOf(want) < 0) { want = R.pick(pool); st = S(want); }
        var three = R.shuffle([want].concat(R.sample(others(pool, [want]), 2)));
        return { q: 'Each star is a state capital. Which letter marks the capital of ' + st.n + '?', viz: usmap(Object.assign(regIds ? { region: regIds } : {}, { points: three.map(function (x, i) { return { lon: S(x).cc[0], lat: S(x).cc[1], mark: LET[i], kind: 'star' }; }) })),
          a: Object.assign(letterQ(three), { v: three.indexOf(want) }), hint: 'First find ' + st.n + ' on the map. Its capital\'s star is inside it.',
          steps: [CLUE[want], 'The star inside ' + st.n + ' is its capital, ' + st.cap + ': letter ' + LET[three.indexOf(want)] + '.'] };
      }
      if (shape === 'typestate') {
        return { q: 'Type the name of the state whose capital is ' + st.cap + '.', a: txt(GG().names(want)), hint: 'Which state\'s government meets in ' + st.cap + '?', steps: [st.cap + ' is the capital of ' + st.n + '.'] };
      }
      return { q: 'Type the capital of ' + st.n + '.', viz: usmap(Object.assign({}, view, { highlight: [want], capitals: [want], capLabels: false })), a: txt(GG().capNames(want)),
        hint: 'It is often not the state\'s biggest or best-known city.', steps: ['The capital of ' + st.n + ' is ' + st.cap + '.', 'Do not mix it up with ' + st.city + ', a well-known city that is not the capital.'] };
    };
  }
  function SG(k) { return makeStatesGen(REGS[k].ids, REGS[k].pairs, REGS[k].name); }
  function CG(k) { return makeCapitalsGen(REGS[k].ids, REGS[k].name); }
  Gen('usgeo.northeast-states', SG('ne')); Gen('usgeo.northeast-capitals', CG('ne'));
  Gen('usgeo.midwest-states', SG('mw')); Gen('usgeo.midwest-capitals', CG('mw'));
  Gen('usgeo.south-atlantic-states', SG('sat')); Gen('usgeo.south-atlantic-capitals', CG('sat'));
  Gen('usgeo.south-central-states', SG('scen')); Gen('usgeo.south-central-capitals', CG('scen'));
  Gen('usgeo.mountain-states', SG('mtn')); Gen('usgeo.mountain-capitals', CG('mtn'));
  Gen('usgeo.pacific-states', SG('pac')); Gen('usgeo.pacific-capitals', CG('pac'));
  var ALL_PAIRS = []; Object.keys(REGS).forEach(function (k) { ALL_PAIRS = ALL_PAIRS.concat(REGS[k].pairs); });
  ALL_PAIRS = ALL_PAIRS.concat([['CO', 'WY'], ['ND', 'SD'], ['KS', 'OK'], ['MO', 'AR'], ['KY', 'WV'], ['IL', 'IN'], ['CO', 'KS'], ['UT', 'WY'], ['NE', 'SD'], ['IA', 'IL'], ['MN', 'ND'], ['ID', 'OR']]);
  Gen('usgeo.all-states', makeStatesGen(null, ALL_PAIRS, null));
  Gen('usgeo.all-capitals', makeCapitalsGen(null, null));

  /* ---- usgeo.neighbor-states */
  var NB_TF = [
    ['Arizona and Colorado share a border.', false, 'They meet only at one point, the Four Corners. A single point is not a border, so they do not share one.'],
    ['Utah and New Mexico share a border.', false, 'They touch only at the Four Corners point, so they do not share a border.'],
    ['Maine shares a border with only one state.', true, 'Maine touches only New Hampshire.'],
    ['Tennessee shares a border with eight states.', true, 'Tennessee touches Kentucky, Virginia, North Carolina, Georgia, Alabama, Mississippi, Arkansas and Missouri.'],
    ['Missouri shares a border with eight states.', true, 'Missouri touches Iowa, Illinois, Kentucky, Tennessee, Arkansas, Oklahoma, Kansas and Nebraska.'],
    ['Hawaii shares a border with California.', false, 'Hawaii is a chain of islands in the Pacific. It has no land border with any state.'],
    ['Utah and Colorado share a border.', true, 'Utah is directly west of Colorado.'],
    ['Arizona and New Mexico share a border.', true, 'Arizona is directly west of New Mexico.']];
  var NB_STATES = GG().states().filter(function (s) { return s.id !== 'AK' && s.id !== 'HI'; }).map(function (s) { return s.id; });
  function nearNot(id) { // states two steps away: close enough to be tempting, but not neighbors
    var nb = stateNb(id), two = []; nb.forEach(function (n) { stateNb(n).forEach(function (m) { two.push(m); }); });
    return notNb(id, uniq(two));
  }
  Gen('usgeo.neighbor-states', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['letter', 'letter', 'name'] : L === 2 ? ['name', 'count', 'letter'] : ['all', 'tf', 'count', 'most']);
    var x = R.pick(NB_STATES.filter(function (s) { return s !== 'ME' || L > 1; })), nb = stateNb(x), st = S(x);
    if (shape === 'letter') {
      var right = R.pick(nb), wrong = R.sample(L === 1 ? notNb(x, NB_STATES).filter(function (s) { return nearNot(x).indexOf(s) >= 0 || true; }).filter(function (s) { return GG().dist(S(s).cc, st.cc) < 1500; }) : nearNot(x), 2);
      if (wrong.length < 2) wrong = R.sample(notNb(x, NB_STATES), 2);
      var set = R.shuffle([right].concat(wrong));
      return { q: 'The orange state is ' + st.n + '. Which lettered state shares a border with it?', viz: usmap({ region: uniq([x].concat(nb, set)), highlight: [x], mark: lettersFor(set) }), a: Object.assign(letterQ(set), { v: set.indexOf(right) }),
        hint: 'A neighbor touches the orange state along a line, not just at a corner.', steps: [nm(right) + ' (letter ' + LET[set.indexOf(right)] + ') touches ' + st.n + ' along a border.', wrong.map(nm).join(' and ') + ' do not touch it.'] };
    }
    if (shape === 'name') {
      var r2 = R.pick(nb), w2 = R.sample(nearNot(x).length >= 3 ? nearNot(x) : notNb(x, NB_STATES), 3), ch = R.shuffle([r2].concat(w2)).map(nm);
      return { q: 'Which state shares a border with ' + st.n + '?', a: mc(ch, nm(r2)), hint: 'Picture ' + st.n + ' on the map and go around its edges.',
        steps: [st.n + '\'s neighbors are ' + nb.map(nm).join(', ').replace(/, ([^,]*)$/, ' and $1') + '.', 'So the answer is ' + nm(r2) + '.'] };
    }
    if (shape === 'count') {
      return { q: 'How many states share a border with ' + st.n + '?', viz: usmap({ region: uniq([x].concat(nb)), highlight: [x] }), a: num(nb.length),
        hint: 'Go around the edge of the orange state and count each state it touches along a line. Do not count countries, oceans or lakes.',
        steps: ['Going around ' + st.n + ': ' + nb.map(nm).join(', ') + '.', 'That is ' + nb.length + ' state' + (nb.length === 1 ? '' : 's') + '.'] };
    }
    if (shape === 'all') {
      var yes = nb.length > 3 ? R.sample(nb, R.int(2, 3)) : nb.slice(), no = R.sample(nearNot(x).length >= 2 ? nearNot(x) : notNb(x, NB_STATES), 2), list = R.shuffle(yes.concat(no)).map(nm);
      return { q: 'Which of these share a border with ' + st.n + '? Choose all that do.', a: mcAll(list, yes.map(nm)), hint: 'Picture ' + st.n + ' and trace around its edges.',
        steps: [st.n + ' shares borders with ' + nb.map(nm).join(', ').replace(/, ([^,]*)$/, ' and $1') + '.'].concat(no.map(function (n) { return nm(n) + ' does not touch ' + st.n + '.'; })) };
    }
    if (shape === 'most') {
      var top = R.pick(['TN', 'MO']), w3 = R.sample(['KY', 'PA', 'ID', 'CO', 'SD', 'NE', 'IA', 'TX', 'CA', 'FL'], 3), ch3 = R.shuffle([top].concat(w3)).map(nm);
      return { q: 'Which of these states shares a border with the most other states?', a: mc(ch3, nm(top)), hint: 'Count the neighbors of each one.',
        steps: [nm(top) + ' touches 8 states, tied with ' + nm(top === 'TN' ? 'MO' : 'TN') + ' for the most.'].concat(w3.map(function (w) { return nm(w) + ' touches ' + stateNb(w).length + '.'; })) };
    }
    var it = R.pick(NB_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'Touching at a single point is not sharing a border.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ================================================================== Unit 3: Land and Water */

  /* ---- usgeo.physical-regions */
  var PREG = [ // east to west
    { id: 'coastalplain', n: 'the Coastal Plain', d: 'low, flat land along the Atlantic and Gulf coasts' },
    { id: 'appalachians', n: 'the Appalachian Mountains', d: 'old, worn-down mountains in the East' },
    { id: 'centrallowland', n: 'the Central Lowland', d: 'low, rolling farmland around the Great Lakes and the upper Mississippi' },
    { id: 'greatplains', n: 'the Great Plains', d: 'high, flat grassland that rises slowly toward the west' },
    { id: 'rockies', n: 'the Rocky Mountains', d: 'tall, young mountains that rise suddenly at the western edge of the plains' },
    { id: 'greatbasin', n: 'the Great Basin', d: 'dry basins and short ranges between the Rockies and the Sierra Nevada' },
    { id: 'coloradoplateau', n: 'the Colorado Plateau', d: 'high, flat land cut by deep canyons, around the Four Corners' },
    { id: 'sierranevada', n: 'the Sierra Nevada', d: 'a tall range in eastern California' }];
  var PREG_ORDER = ['the Coastal Plain', 'the Appalachian Mountains', 'the Central Lowland', 'the Great Plains', 'the Rocky Mountains'];
  var PREG_TF = [
    ['The Appalachian Mountains are older and lower than the Rocky Mountains.', true, 'The Appalachians are very old mountains, worn down over a long time. The Rockies are younger and much higher.'],
    ['The land rises evenly all the way from the Atlantic coast to the Pacific coast.', false, 'It goes up and down: up into the Appalachians, down to the Central Lowland, slowly up across the Great Plains, then sharply up into the Rockies.'],
    ['The Great Plains lie just east of the Rocky Mountains.', true, 'The flat plains end where the Rockies rise.'],
    ['The Coastal Plain is low, flat land near the ocean.', true, 'It runs along the Atlantic and Gulf coasts.'],
    ['The Rocky Mountains are in the eastern United States.', false, 'The Rockies are in the West. The Appalachians are the big range in the East.']];
  Gen('usgeo.physical-regions', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['letter', 'east', 'tf'] : L === 2 ? ['letter', 'next', 'desc'] : ['order', 'letter', 'tf', 'next']);
    if (shape === 'letter') {
      var pool = L === 1 ? PREG.slice(0, 5) : PREG, set = R.sample(pool, L === 1 ? 3 : 4), want = R.pick(set);
      var marks = {}; set.forEach(function (x, i) { marks[x.id] = LET[i]; });
      return { q: 'Which letter marks ' + want.n + '?', viz: usmap({ features: set.map(function (x) { return x.id; }), mark: marks, color: 'plain', featureLabels: false }), a: Object.assign(letterQ(set), { v: set.indexOf(want) }),
        hint: 'Think from east to west: Coastal Plain, Appalachians, Central Lowland, Great Plains, Rockies.', steps: [cap1(want.n) + ' is ' + want.d + '.', 'That is letter ' + LET[set.indexOf(want)] + '.'] };
    }
    if (shape === 'east') {
      var e = R.coin(), right = e ? 'The Appalachian Mountains' : 'The Rocky Mountains';
      return { q: 'Which mountains are in the ' + (e ? 'eastern' : 'western') + ' United States?', viz: usmap({ features: ['appalachians', 'rockies'], color: 'plain', featureLabels: false }), a: mc(R.shuffle(['The Appalachian Mountains', 'The Rocky Mountains']), right),
        hint: 'The Appalachians are near the Atlantic coast.', steps: ['The Appalachians run near the East Coast.', 'The Rockies are in the West.'] };
    }
    if (shape === 'next') {
      var i = R.int(0, 3), west = R.coin(), a = west ? PREG_ORDER[i + 1] : PREG_ORDER[i], b = west ? PREG_ORDER[i] : PREG_ORDER[i + 1];
      var ch = R.shuffle([a].concat(R.sample(others(PREG_ORDER, [a, b]), 2))).map(cap1);
      return { q: 'Going ' + (west ? 'west' : 'east') + ' from ' + b + ', which landform region comes next?', a: mc(ch, cap1(a)), hint: 'East to west: Coastal Plain, Appalachians, Central Lowland, Great Plains, Rockies.',
        steps: ['From east to west the regions go: ' + PREG_ORDER.join(', ') + '.', 'So ' + (west ? 'west' : 'east') + ' of ' + b + ' comes ' + a + '.'] };
    }
    if (shape === 'desc') {
      var w = R.pick(PREG.slice(0, 7)), ch2 = R.shuffle([w].concat(R.sample(others(PREG.slice(0, 7), [w]), 3))).map(function (x) { return cap1(x.n); });
      return { q: 'Which landform region is ' + w.d + '?', a: mc(ch2, cap1(w.n)), hint: 'Picture the map from east to west.', steps: [cap1(w.n) + ' is ' + w.d + '.'] };
    }
    if (shape === 'order') {
      var three = R.sample([0, 1, 2, 3, 4], 3).sort(), right3 = three.map(function (k) { return PREG_ORDER[k]; }).join(', '), sh = R.shuffle(three.slice());
      var opts = uniq([right3, three.slice().reverse().map(function (k) { return PREG_ORDER[k]; }).join(', '), [three[1], three[0], three[2]].map(function (k) { return PREG_ORDER[k]; }).join(', '), [three[0], three[2], three[1]].map(function (k) { return PREG_ORDER[k]; }).join(', ')]).map(cap1);
      return { q: 'Which list goes in order from east to west?', a: mc(R.shuffle(opts), cap1(right3)), hint: 'Start at the Atlantic coast and travel west.', steps: ['From the Atlantic going west: ' + PREG_ORDER.join(', ') + '.', 'So the right order is: ' + right3 + '.'] };
    }
    var it = R.pick(PREG_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'Picture a trip from the Atlantic to the Pacific.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ---- usgeo.mountain-ranges */
  var RANGES = [
    { id: 'appalachians', n: 'the Appalachian Mountains', where: 'near the East Coast, from Alabama to Maine', st: ['PA', 'WV', 'TN', 'NC', 'VA'] },
    { id: 'rockies', n: 'the Rocky Mountains', where: 'from New Mexico north through Colorado, Wyoming and Montana into Canada', st: ['CO', 'WY', 'MT', 'NM', 'ID'] },
    { id: 'sierranevada', n: 'the Sierra Nevada', where: 'in eastern California', st: ['CA'] },
    { id: 'cascades', n: 'the Cascade Range', where: 'in Washington, Oregon and northern California, with tall volcanoes such as Mount Rainier', st: ['WA', 'OR'] },
    { id: 'alaskarange', n: 'the Alaska Range', where: 'in Alaska, with Denali, the tallest peak in North America', st: ['AK'] },
    { id: 'coastranges', n: 'the Coast Ranges', where: 'right along the Pacific coast', st: ['CA', 'OR'] }];
  function rangeStateQ(R, L) {
    var r = R.pick(RANGES.slice(0, 5)), right = S(R.pick(r.st)).n, far = GG().states().filter(function (s) { return RANGES.every(function (x) { return x !== r || x.st.indexOf(s.id) < 0; }) && s.id !== 'AK' && s.id !== 'HI'; });
    if (r.id === 'appalachians') far = far.filter(function (s) { return s.reg === 'w' || ['KS', 'NE', 'ND', 'SD', 'TX', 'OK'].indexOf(s.id) >= 0; });
    else far = far.filter(function (s) { return s.reg !== 'w'; });
    var ch = R.shuffle([right].concat(R.sample(far, L === 1 ? 2 : 3).map(function (s) { return s.n; })));
    return { q: 'In which of these states can you find ' + r.n + '?', a: mc(ch, right), hint: 'Is the range in the East or the West?', steps: [cap1(r.n) + ' run ' + r.where + '.', 'So the answer is ' + right + '.'] };
  }
  Gen('usgeo.mountain-ranges', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['letter', 'eastwest', 'state'] : L === 2 ? ['letter', 'state', 'sierra'] : ['letter', 'which', 'state']);
    if (shape === 'letter') {
      var set = R.sample(L === 1 ? RANGES.slice(0, 3) : RANGES.slice(0, 5), L === 1 ? 3 : 4), want = R.pick(set), marks = {}; set.forEach(function (x, i) { marks[x.id] = LET[i]; });
      return { q: 'Which letter marks ' + want.n + '?', viz: usmap({ features: set.map(function (x) { return x.id; }), mark: marks, color: 'plain', featureLabels: false }), a: Object.assign(letterQ(set), { v: set.indexOf(want) }),
        hint: 'Think about where each range is: East, Rocky Mountain West, or near the Pacific.', steps: [cap1(want.n) + ' run ' + want.where + '.', 'That is letter ' + LET[set.indexOf(want)] + '.'] };
    }
    if (shape === 'eastwest') {
      var e = R.coin();
      return { q: 'Which mountain range runs near the ' + (e ? 'East' : 'West') + ' Coast?', a: mc(R.shuffle(e ? ['The Appalachian Mountains', 'The Rocky Mountains', 'The Cascade Range'] : ['The Cascade Range', 'The Appalachian Mountains', 'The Ozark Mountains']), e ? 'The Appalachian Mountains' : 'The Cascade Range'),
        hint: 'The Appalachians are in the East; the Cascades and Sierra Nevada are near the Pacific.', steps: [e ? 'The Appalachian Mountains run near the East Coast.' : 'The Cascade Range runs near the Pacific coast in Washington and Oregon. (The Sierra Nevada is in eastern California, a bit farther from the coast.)'] };
    }
    if (shape === 'sierra') {
      var ch = R.shuffle(['California', 'Colorado', 'Montana', 'Wyoming']);
      return { q: 'The Sierra Nevada range is mostly in which state?', a: mc(ch, 'California'), hint: 'Mount Whitney and Yosemite are in this range.',
        steps: ['The Sierra Nevada runs down eastern California, with Yosemite and Mount Whitney.', 'It is a separate range from the Rocky Mountains, which run through Colorado, Wyoming and Montana.'] };
    }
    if (shape === 'which') {
      var r = R.pick(RANGES), ch2 = R.shuffle([r].concat(R.sample(others(RANGES, [r]), 3))).map(function (x) { return cap1(x.n); });
      return { q: 'Which range runs ' + r.where + '?', a: mc(ch2, cap1(r.n)), hint: 'Picture the map: East, middle West, or along the Pacific?', steps: [cap1(r.n) + ' run ' + r.where + '.'] };
    }
    return rangeStateQ(R, L);
  });

  /* ---- usgeo.high-low-points */
  var DENALI = 'Denali (Mount McKinley)';
  var PEAKS = [
    { n: DENALI, st: 'AK', ft: 20310, lon: -151.0, lat: 63.07, r: 'the Alaska Range' },
    { n: 'Mount Whitney', st: 'CA', ft: null, about: 14500, lon: -118.29, lat: 36.58, r: 'the Sierra Nevada' },
    { n: 'Mount Rainier', st: 'WA', ft: 14410, lon: -121.76, lat: 46.85, r: 'the Cascade Range' },
    { n: 'Mount Elbert', st: 'CO', ft: 14433, lon: -106.45, lat: 39.12, r: 'the Rocky Mountains' },
    { n: 'Mount Mitchell', st: 'NC', ft: 6684, lon: -82.27, lat: 35.76, r: 'the Appalachian Mountains' },
    { n: 'Mauna Kea', st: 'HI', ft: 13796, lon: -155.47, lat: 19.82, r: 'a volcano on the island of Hawaii' }];
  var BADWATER = { n: 'Badwater Basin', st: 'CA', ft: -282, lon: -116.83, lat: 36.23 };
  Gen('usgeo.high-low-points', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['highest', 'lowest', 'state'] : L === 2 ? ['forty8', 'letter', 'compare', 'below'] : ['diff', 'letter', 'forty8', 'diff2']);
    if (shape === 'highest') {
      return { q: 'Which is the highest mountain in North America?', a: mc(R.shuffle([DENALI, 'Mount Mitchell', 'Mount Elbert']), DENALI), hint: 'It is in Alaska.',
        steps: ['Denali, in Alaska\'s Alaska Range, is 20,310 feet high, the highest peak in North America.', 'Its federal name has been Mount McKinley since 2025; Alaska and many others call it Denali.'] };
    }
    if (shape === 'lowest') {
      return { q: 'The lowest point in North America, Badwater Basin, is in Death Valley. In which state is it?', a: mc(R.shuffle(['California', 'Florida', 'Louisiana']), 'California'), hint: 'Death Valley is a desert in the West.',
        steps: ['Badwater Basin in Death Valley, California, is 282 feet below sea level.', 'It is the lowest point in North America.'] };
    }
    if (shape === 'state') {
      var p = R.pick(PEAKS), right = nm(p.st), ch = R.shuffle([right].concat(R.sample(['Texas', 'Florida', 'Ohio', 'Kansas', 'Iowa'], 2)));
      return { q: 'In which state is ' + p.n + '?', a: mc(ch, right), hint: 'Which mountains is it in?', steps: [p.n + ' is in ' + p.r + ', in ' + right + '.'] };
    }
    if (shape === 'forty8') {
      var ch2 = R.shuffle(['Mount Whitney, California', 'Mount Elbert, Colorado', 'Mount Mitchell, North Carolina', DENALI + ', Alaska']);
      return { q: 'Which is the highest peak in the 48 states that touch one another (leaving out Alaska and Hawaii)?', a: mc(ch2, 'Mount Whitney, California'), hint: 'It is not in the Rockies.',
        steps: ['Denali is higher, but it is in Alaska, which is not one of the 48.', 'Mount Whitney in California\'s Sierra Nevada, about 14,500 feet, is the highest of the 48 states.', 'Mount Elbert, the highest of the Rockies, is about 14,400 feet, a little lower.'] };
    }
    if (shape === 'letter') {
      var set = R.shuffle([PEAKS[0], BADWATER, R.pick([PEAKS[1], PEAKS[4], PEAKS[3]])]), want = R.pick(set);
      var desc = want === BADWATER ? 'the lowest point in North America' : want === PEAKS[0] ? 'the highest peak in North America' : want.n;
      return { q: 'Which letter marks ' + desc + '?', viz: usmap({ points: set.map(function (x, i) { return { lon: x.lon, lat: x.lat, mark: LET[i] }; }) }), a: Object.assign(letterQ(set), { v: set.indexOf(want) }),
        hint: 'Denali is in Alaska; Badwater Basin is in Death Valley, California.', steps: [(want === BADWATER ? 'Badwater Basin, 282 feet below sea level, is in Death Valley in eastern California.' : want.n + ' is in ' + want.r + ', in ' + nm(want.st) + '.'), 'That is letter ' + LET[set.indexOf(want)] + '.'] };
    }
    if (shape === 'compare') {
      var two = R.sample(PEAKS.filter(function (x) { return x.ft; }), 2); if (Math.abs(two[0].ft - two[1].ft) < 1000) two = [PEAKS[4], PEAKS[0]];
      var hi = two[0].ft > two[1].ft ? two[0] : two[1];
      return { q: 'Which is higher: ' + two[0].n + ' (' + fmt(two[0].ft) + ' feet) or ' + two[1].n + ' (' + fmt(two[1].ft) + ' feet)?', a: mc([two[0].n, two[1].n], hi.n, true), hint: 'Compare the thousands first.',
        steps: ['Compare ' + fmt(two[0].ft) + ' and ' + fmt(two[1].ft) + '.', hi.n + ' is higher.'] };
    }
    if (shape === 'below') {
      return { q: 'Badwater Basin is 282 feet below sea level. How would you write its elevation as a number of feet?', a: mc(R.shuffle(['−282 feet', '282 feet', '0 feet']), '−282 feet'), hint: 'Below sea level is less than zero.',
        steps: ['Sea level is 0 feet.', 'Places below sea level have negative elevations.', 'So Badwater Basin is at −282 feet.'] };
    }
    if (shape === 'diff') {
      return { q: 'Denali is 20,310 feet above sea level. Badwater Basin is 282 feet below sea level. How many feet higher is the top of Denali than Badwater Basin?', a: num(20592, { unit: 'feet' }), hint: 'Go from −282 up to 0, then from 0 up to 20,310.',
        steps: ['From −282 up to sea level is 282 feet.', 'From sea level up to 20,310 is 20,310 feet.', '$282 + 20{,}310 = 20{,}592$ feet. (The same as $20{,}310 - (-282)$.)'] };
    }
    var p2 = R.pick(PEAKS.slice(2).filter(function (x) { return x.ft; })), d = 20310 - p2.ft;
    return { q: 'Denali is 20,310 feet high. ' + p2.n + ' in ' + nm(p2.st) + ' is ' + fmt(p2.ft) + ' feet high. How many feet higher is Denali?', a: num(d, { unit: 'feet' }), hint: 'Subtract the smaller height from the larger.',
      steps: ['$20{,}310 - ' + fmt(p2.ft).replace(',', '{,}') + ' = ' + fmt(d).replace(',', '{,}') + '$', 'Denali is ' + fmt(d) + ' feet higher.'] };
  });

  /* ---- usgeo.continental-divide */
  var DIVIDE_RIV = [
    { id: 'colorado', n: 'the Colorado River', to: 'P', end: 'the Gulf of California, an arm of the Pacific Ocean' },
    { id: 'columbia', n: 'the Columbia River', to: 'P', end: 'the Pacific Ocean' },
    { id: 'snake', n: 'the Snake River', to: 'P', end: 'the Columbia River and then the Pacific Ocean' },
    { id: 'missouri', n: 'the Missouri River', to: 'G', end: 'the Mississippi River and then ' + GULF },
    { id: 'arkansas', n: 'the Arkansas River', to: 'G', end: 'the Mississippi River and then ' + GULF },
    { id: 'riogrande', n: 'the Rio Grande', to: 'G', end: GULF }];
  var TOWARD = { P: 'Toward the Pacific Ocean', G: 'Toward ' + GULF + ' and the Atlantic' };
  var DIV_TF = [
    ['A river always flows to the ocean that is closest to where it starts.', false, 'A river flows downhill. Which side of the Divide it starts on decides where it goes.'],
    ['The Rio Grande starts in Colorado and flows to ' + GULF + '.', true, 'It starts on the east side of the Divide in the Colorado Rockies.'],
    ['The Continental Divide runs along the high Rocky Mountains.', true, 'In the United States, the Divide follows the crests of the Rockies.'],
    ['Rain that falls on the west side of the Continental Divide flows toward the Atlantic.', false, 'West-side water flows toward the Pacific.'],
    ['The Continental Divide runs along the Appalachian Mountains.', false, 'The Continental Divide follows the Rocky Mountains in the West.'],
    ['The Colorado River carries water from the west side of the Divide.', true, 'It starts in the Colorado Rockies and flows southwest toward the Gulf of California.'],
    ['The Missouri River carries water from the east side of the Divide.', true, 'It starts in the Montana Rockies and flows east to the Mississippi.'],
    ['Water always flows uphill to reach the nearest ocean.', false, 'Water flows downhill. It cannot cross the high ridge of the Divide.'],
    ['A continental divide is a high line of land that separates where water flows.', true, 'Water on each side flows away from it, toward different oceans.']];
  var DIV_CITY = [ // which side of the Divide each city is on, and the river that carries its rain away
    { n: 'Denver, Colorado', to: 'G', lon: -104.99, lat: 39.74, via: 'the South Platte, the Platte, the Missouri and the Mississippi' },
    { n: 'Billings, Montana', to: 'G', lon: -108.5, lat: 45.78, via: 'the Yellowstone, the Missouri and the Mississippi' },
    { n: 'Cheyenne, Wyoming', to: 'G', lon: -104.82, lat: 41.14, via: 'creeks that reach the South Platte, the Missouri and the Mississippi' },
    { n: 'Albuquerque, New Mexico', to: 'G', lon: -106.65, lat: 35.08, via: 'the Rio Grande' },
    { n: 'Boise, Idaho', to: 'P', lon: -116.2, lat: 43.62, via: 'the Boise River, the Snake and the Columbia' },
    { n: 'Missoula, Montana', to: 'P', lon: -114.0, lat: 46.87, via: 'the Clark Fork and the Columbia' },
    { n: 'Grand Junction, Colorado', to: 'P', lon: -108.55, lat: 39.06, via: 'the Colorado River' },
    { n: 'Tucson, Arizona', to: 'P', lon: -110.97, lat: 32.22, via: 'streams that reach the Gila River and the Colorado River' }];
  Gen('usgeo.continental-divide', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['side', 'where', 'tf', 'city'] : L === 2 ? ['river', 'side', 'tf', 'city', 'state'] : ['all', 'river', 'tf', 'city', 'state']);
    if (shape === 'state') {
      var yes = R.pick(['MT', 'WY', 'CO', 'NM']), no = R.sample(['KS', 'NE', 'UT', 'NV', 'OR', 'TX', 'SD', 'OK'], 3), ch9 = R.shuffle([yes].concat(no)).map(nm);
      return { q: 'The Continental Divide runs through which of these states?', viz: usmap({ features: ['rockies'], color: 'plain', featureLabels: false }), a: mc(ch9, nm(yes)), hint: 'It follows the high Rockies.',
        steps: ['In the United States the Divide follows the Rockies through New Mexico, Colorado, Wyoming and Montana (and along the Idaho-Montana border), then runs on through Alaska.', 'So the answer is ' + nm(yes) + '.'] };
    }
    if (shape === 'city') {
      var c = R.pick(DIV_CITY), right0 = TOWARD[c.to];
      return { q: 'A heavy rain falls on ' + c.n + ', marked on the map. Where will most of that water flow?', viz: usmap({ features: ['rockies'], color: 'plain', featureLabels: false, points: [{ lon: c.lon, lat: c.lat, mark: '?' }] }), a: mc([TOWARD.P, TOWARD.G], right0),
        hint: 'Is the city east or west of the high Rockies?', steps: [c.n + ' is on the ' + (c.to === 'P' ? 'west' : 'east') + ' side of the Continental Divide.', 'Its water flows by way of ' + c.via + ', ' + right0.toLowerCase() + '.'] };
    }
    if (shape === 'side') {
      var w = R.coin(), right = w ? TOWARD.P : TOWARD.G, where = R.pick(['Colorado', 'Wyoming', 'Montana', 'New Mexico']), what = R.pick(['Snow melts', 'Rain falls']);
      return { q: what + ' on the ' + (w ? 'west' : 'east') + ' side of the Continental Divide in ' + where + '. Which way does the water flow?', viz: usmap({ features: ['rockies'], color: 'plain', featureLabels: false }), a: mc([TOWARD.P, TOWARD.G], right),
        hint: 'The Divide splits the water: west to one ocean, east to the other.', steps: ['The Continental Divide runs along the high Rockies.', 'Water on its west side flows toward the Pacific; water on its east side flows toward ' + GULF + ' and the Atlantic.', 'So this water flows ' + right.toLowerCase() + '.'] };
    }
    if (shape === 'where') {
      return { q: 'Along which mountains does the Continental Divide run in the United States?', a: mc(R.shuffle(['The Rocky Mountains', 'The Appalachian Mountains', 'The Ozark Mountains']), 'The Rocky Mountains'), hint: 'It follows the highest mountains in the West.',
        steps: ['The Continental Divide follows the high crests of the Rocky Mountains.'] };
    }
    if (shape === 'river') {
      var r = R.pick(DIVIDE_RIV), right2 = TOWARD[r.to];
      return { q: 'The highlighted river is ' + r.n + '. Where does its water end up?', viz: usmap({ features: ['rockies', r.id], hiFeature: r.id, color: 'plain', featureLabels: false }), a: mc([TOWARD.P, TOWARD.G], right2),
        hint: 'Which side of the Rockies does it flow away from?', steps: [cap1(r.n) + ' starts on the ' + (r.to === 'P' ? 'west' : 'east') + ' side of the Continental Divide.', 'It flows to ' + r.end + '.'] };
    }
    if (shape === 'all') {
      var set = R.shuffle(R.sample(DIVIDE_RIV.filter(function (x) { return x.to === 'P'; }), 2).concat(R.sample(DIVIDE_RIV.filter(function (x) { return x.to === 'G'; }), 2)));
      return { q: 'Which of these rivers carry water toward the Pacific Ocean? Choose all that do.', viz: usmap({ features: ['rockies'].concat(set.map(function (x) { return x.id; })), color: 'plain' }),
        a: mcAll(set.map(function (x) { return cap1(x.n); }), set.filter(function (x) { return x.to === 'P'; }).map(function (x) { return cap1(x.n); })), hint: 'Rivers west of the Divide go to the Pacific.',
        steps: set.map(function (x) { return cap1(x.n) + ' flows to ' + x.end + '.'; }) };
    }
    var it = R.pick(DIV_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'Water flows downhill, away from the Divide on both sides.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ---- usgeo.major-rivers */
  var RIVERS = [
    { id: 'mississippi', n: 'the Mississippi River', st: ['MN', 'WI', 'IA', 'IL', 'MO', 'KY', 'TN', 'AR', 'MS', 'LA'] },
    { id: 'missouri', n: 'the Missouri River', st: ['MT', 'ND', 'SD', 'NE', 'IA', 'KS', 'MO'] },
    { id: 'ohio', n: 'the Ohio River', st: ['PA', 'OH', 'WV', 'KY', 'IN', 'IL'] },
    { id: 'colorado', n: 'the Colorado River', st: ['CO', 'UT', 'AZ', 'NV', 'CA'] },
    { id: 'columbia', n: 'the Columbia River', st: ['WA', 'OR'] },
    { id: 'riogrande', n: 'the Rio Grande', st: ['CO', 'NM', 'TX'] }];
  var RIV_FACTS = [
    ['forms much of the border between Texas and Mexico', 'riogrande'], ['carved the Grand Canyon', 'colorado'], ['forms much of the border between Washington and Oregon', 'columbia'],
    ['forms the northern border of Kentucky', 'ohio'], ['flows past New Orleans to ' + GULF, 'mississippi'], ['starts in the Rocky Mountains of Montana and joins the Mississippi near St. Louis', 'missouri'],
    ['begins at Pittsburgh, Pennsylvania, and joins the Mississippi at Cairo, Illinois', 'ohio'], ['starts at Lake Itasca in Minnesota', 'mississippi']];
  function rivN(id) { return RIVERS.filter(function (r) { return r.id === id; })[0].n; }
  Gen('usgeo.major-rivers', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['hi', 'fact'] : L === 2 ? ['fact', 'longest', 'letter'] : ['letter', 'state', 'diff', 'fact']);
    if (shape === 'hi') {
      var r = R.pick(RIVERS), ch = R.shuffle([r].concat(R.sample(others(RIVERS, [r]), 2))).map(function (x) { return cap1(x.n); });
      return { q: 'Which river is highlighted on the map?', viz: usmap({ features: [r.id], hiFeature: r.id, color: 'plain', featureLabels: false }), a: mc(ch, cap1(r.n)), hint: 'Where does it start, and where does it go?',
        steps: [cap1(r.n) + ' passes through ' + r.st.map(nm).join(', ').replace(/, ([^,]*)$/, ' and $1') + '.'] };
    }
    if (shape === 'fact') {
      var f = R.pick(RIV_FACTS), right = cap1(rivN(f[1])), ch2 = R.shuffle([right].concat(R.sample(others(RIVERS.map(function (x) { return cap1(x.n); }), [right]), L === 1 ? 2 : 3)));
      return { q: 'Which river ' + f[0] + '?', a: mc(ch2, right), hint: 'Picture the river on the map.', steps: [right + ' ' + f[0] + '.'] };
    }
    if (shape === 'longest') {
      return { q: 'By the U.S. Geological Survey\'s measure, which is the longest river in the United States?', a: mc(R.shuffle(['The Missouri River', 'The Mississippi River', 'The Ohio River', 'The Colorado River']), 'The Missouri River'), hint: 'It is not the most famous one.',
        steps: ['The U.S. Geological Survey lists the Missouri at about 2,540 miles and the Mississippi at about 2,340 miles.', 'So the Missouri is a little longer, and it flows into the Mississippi.'] };
    }
    if (shape === 'letter') {
      var set = R.sample(RIVERS, 3), want = R.pick(set), marks = {}; set.forEach(function (x, i) { marks[x.id] = LET[i]; });
      return { q: 'Which letter marks ' + want.n + '?', viz: usmap({ features: set.map(function (x) { return x.id; }), mark: marks, color: 'plain', featureLabels: false }), a: Object.assign(letterQ(set), { v: set.indexOf(want) }),
        hint: 'Is the river in the East, the middle or the West?', steps: [cap1(want.n) + ' passes through ' + want.st.map(nm).join(', ').replace(/, ([^,]*)$/, ' and $1') + '.', 'That is letter ' + LET[set.indexOf(want)] + '.'] };
    }
    if (shape === 'state') {
      var r3 = R.pick(RIVERS), right3 = nm(R.pick(r3.st)), far = GG().states().filter(function (s) { return RIVERS.every(function (x) { return x.st.indexOf(s.id) < 0; }) && s.id !== 'HI' && s.id !== 'AK'; });
      var ch3 = R.shuffle([right3].concat(R.sample(far, 3).map(function (s) { return s.n; })));
      return { q: 'Which state does ' + r3.n + ' pass through or along?', a: mc(ch3, right3), hint: 'Picture where the river flows.', steps: [cap1(r3.n) + ' passes through or along ' + r3.st.map(nm).join(', ').replace(/, ([^,]*)$/, ' and $1') + '.'] };
    }
    return { q: 'The U.S. Geological Survey lists the Missouri River as about 2,540 miles long and the Mississippi River as about 2,340 miles long. How many miles longer is the Missouri?', a: num(200, { unit: 'miles' }), hint: 'Subtract.',
      steps: ['$2{,}540 - 2{,}340 = 200$', 'The Missouri is about 200 miles longer.'] };
  });

  /* ---- usgeo.mississippi-system */
  var TRIBS = ['The Missouri River', 'The Ohio River', 'The Arkansas River', 'The Tennessee River'], NOT_TRIBS = ['The Colorado River', 'The Columbia River', 'The Rio Grande', 'The Hudson River'];
  var MS_TF = [
    ['A river\'s basin is all the land whose water drains into that river.', true, 'Rain anywhere in the basin can end up in the river.'],
    ['The Mississippi River\'s basin is just the land right next to the river.', false, 'The basin is all the land drained by the Mississippi and its tributaries: all or parts of 31 states and two Canadian provinces.'],
    ['The Tennessee River flows into the Ohio River, which flows into the Mississippi.', true, 'The Tennessee joins the Ohio in Kentucky, and the Ohio joins the Mississippi at Cairo, Illinois.'],
    ['The Rio Grande is part of the Mississippi River system.', false, 'The Rio Grande flows to ' + GULF + ' on its own, along the Texas-Mexico border.'],
    ['Snow that melts on the east side of the Divide in Montana can end up in ' + GULF + '.', true, 'It can flow into the Missouri, then the Mississippi, then the Gulf.']];
  Gen('usgeo.mississippi-system', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['trib', 'end', 'start'] : L === 2 ? ['not', 'join', 'trib', 'tf'] : ['all', 'basin', 'tf', 'join']);
    var sysMap = usmap({ features: ['mississippi', 'missouri', 'ohio', 'arkansas', 'tennessee'], color: 'plain', featureLabels: false });
    if (shape === 'trib') {
      var r = R.pick(TRIBS), ch = R.shuffle([r].concat(R.sample(NOT_TRIBS, L === 1 ? 2 : 3)));
      return { q: 'Which river is part of the Mississippi River system?', viz: sysMap, a: mc(ch, r), hint: 'Which one flows through the middle of the country?', steps: [r + ' carries its water into the Mississippi' + (r.indexOf('Tennessee') >= 0 ? ' by way of the Ohio River' : '') + '.', 'The others flow to the oceans on their own.'] };
    }
    if (shape === 'end') {
      var right = cap1(GULF);
      return { q: 'Where does the Mississippi River end?', viz: sysMap, a: mc(R.shuffle([right, 'The Great Lakes', 'The Pacific Ocean']), right),
        hint: 'It flows south.', steps: ['The Mississippi flows south through the middle of the country.', 'It ends at ' + GULF + ', south of New Orleans, Louisiana.'] };
    }
    if (shape === 'start') {
      return { q: 'In which state does the Mississippi River start?', a: mc(R.shuffle(['Minnesota', 'Louisiana', 'Ohio']), 'Minnesota'), hint: 'A river starts at its source, far from its mouth.', steps: ['The Mississippi starts at Lake Itasca in northern Minnesota.', 'It flows south to ' + GULF + '.'] };
    }
    if (shape === 'not') {
      var nt = R.pick(NOT_TRIBS), ch2 = R.shuffle([nt].concat(R.sample(TRIBS, 3)));
      return { q: 'Which river is NOT part of the Mississippi River system?', a: mc(ch2, nt), hint: 'Three of these drain the middle of the country.', steps: [nt + ' does not flow into the Mississippi.', 'The other three all carry their water into the Mississippi.'] };
    }
    if (shape === 'join') {
      var j = R.pick([['the Missouri River', 'Near St. Louis, Missouri', ['At Cairo, Illinois', 'At New Orleans, Louisiana']], ['the Ohio River', 'At Cairo, Illinois', ['Near St. Louis, Missouri', 'At Minneapolis, Minnesota']]]);
      return { q: 'Where does ' + j[0] + ' join the Mississippi?', viz: sysMap, a: mc(R.shuffle([j[1]].concat(j[2])), j[1]), hint: 'The Missouri comes from the west; the Ohio comes from the east.',
        steps: ['The Missouri River joins the Mississippi just north of St. Louis.', 'The Ohio River joins it farther south, at Cairo, Illinois.'] };
    }
    if (shape === 'all') {
      var yes = R.sample(TRIBS, 2), no = R.sample(NOT_TRIBS, 2), list = R.shuffle(yes.concat(no));
      return { q: 'Which rivers are part of the Mississippi River system? Choose all that are.', a: mcAll(list, yes), hint: 'Which ones are in the middle of the country?',
        steps: list.map(function (x) { return x + (yes.indexOf(x) >= 0 ? ' is part of the system.' : ' is not; it flows to the ocean on its own.'); }) };
    }
    if (shape === 'basin') {
      return { q: 'The National Park Service says the Mississippi River drains all or parts of how many U.S. states?', a: mc(['10', '31', '50'], '31', true), hint: 'Count every state whose rain can reach the river, not just the states it touches.',
        steps: ['The river itself touches 10 states.', 'But its basin, all the land drained by it and its tributaries, includes all or parts of 31 states and two Canadian provinces.'] };
    }
    var it = R.pick(MS_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'A basin is all the land that drains into a river.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ---- usgeo.great-lakes */
  var LAKES5 = [
    { n: 'Lake Superior', lon: -87.5, lat: 47.7, st: ['MN', 'WI', 'MI'] },
    { n: 'Lake Michigan', lon: -87.0, lat: 44.0, st: ['WI', 'IL', 'IN', 'MI'] },
    { n: 'Lake Huron', lon: -82.4, lat: 44.8, st: ['MI'] },
    { n: 'Lake Erie', lon: -81.2, lat: 42.2, st: ['MI', 'OH', 'PA', 'NY'] },
    { n: 'Lake Ontario', lon: -77.9, lat: 43.7, st: ['NY'] }];
  var GL_TF = [
    ['All five Great Lakes are entirely inside the United States.', false, 'Canada shares four of them. Only Lake Michigan lies wholly in the United States.'],
    ['Lake Michigan is the only Great Lake entirely inside the United States.', true, 'The other four are shared with Canada.'],
    ['Lake Superior is the largest of the Great Lakes.', true, 'Superior is the biggest by area.'],
    ['Michigan touches four of the five Great Lakes.', true, 'Michigan touches Superior, Michigan, Huron and Erie.'],
    ['Lake Ontario is the farthest west of the Great Lakes.', false, 'Lake Superior is the farthest west; Lake Ontario is the farthest east.']];
  function lakeMap(set) { return usmap({ region: ['MN', 'WI', 'MI', 'IL', 'IN', 'OH', 'PA', 'NY'], points: set.map(function (x, i) { return { lon: x.lon, lat: x.lat, mark: LET[i] }; }) }); }
  Gen('usgeo.great-lakes', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['letter', 'only', 'count'] : L === 2 ? ['letter', 'state', 'largest', 'tf'] : ['order', 'four', 'all', 'letter']);
    if (shape === 'letter') {
      var set = L === 1 ? R.sample(LAKES5, 3) : LAKES5.slice(), want = R.pick(set);
      return { q: 'Which letter marks ' + want.n + '?', viz: lakeMap(set), a: Object.assign(letterQ(set), { v: set.indexOf(want) }), hint: 'From west to east: Superior, Michigan, Huron, Erie, Ontario.',
        steps: ['From west to east the lakes are Superior, Michigan, Huron, Erie and Ontario.', want.n + ' is letter ' + LET[set.indexOf(want)] + '.'] };
    }
    if (shape === 'only') {
      return { q: 'Which Great Lake lies entirely inside the United States?', viz: lakeMap([]), a: mc(R.shuffle(['Lake Michigan', 'Lake Superior', 'Lake Erie']), 'Lake Michigan'), hint: 'It shares its name with a state.',
        steps: ['Canada shares Lakes Superior, Huron, Erie and Ontario.', 'Lake Michigan is the only one entirely inside the United States.'] };
    }
    if (shape === 'count') {
      return { q: 'How many Great Lakes are there?', a: num(5), hint: 'Remember HOMES.', steps: ['HOMES: Huron, Ontario, Michigan, Erie, Superior.', 'That is 5 lakes.'] };
    }
    if (shape === 'state') {
      var pick = R.pick([['Ohio', 'Lake Erie'], ['Pennsylvania', 'Lake Erie'], ['Illinois', 'Lake Michigan'], ['Indiana', 'Lake Michigan'], ['Minnesota', 'Lake Superior']]);
      var ch = R.shuffle([pick[1]].concat(R.sample(others(LAKES5.map(function (x) { return x.n; }), [pick[1]]), 2)));
      return { q: 'Which Great Lake does ' + pick[0] + ' touch?', viz: lakeMap([]), a: mc(ch, pick[1]), hint: 'Find ' + pick[0] + ' on the map and look at its northern edge.', steps: [pick[0] + ' touches ' + pick[1] + '.'] };
    }
    if (shape === 'largest') {
      return { q: 'Which is the largest of the Great Lakes?', a: mc(R.shuffle(['Lake Superior', 'Lake Michigan', 'Lake Ontario', 'Lake Erie']), 'Lake Superior'), hint: 'Its name means "above" or "upper".',
        steps: ['Lake Superior, the farthest north and west, is the largest Great Lake.'] };
    }
    if (shape === 'order') {
      var right = 'Superior, Michigan, Huron, Erie, Ontario', ch2 = R.shuffle([right, 'Ontario, Erie, Huron, Michigan, Superior', 'Michigan, Superior, Huron, Ontario, Erie', 'Superior, Huron, Michigan, Ontario, Erie']);
      return { q: 'Which list puts the Great Lakes in order from west to east?', viz: lakeMap([]), a: mc(ch2, right), hint: 'Start with the largest lake, in the northwest.',
        steps: ['Lake Superior is the farthest west, and Lake Ontario the farthest east.', 'In between are Michigan, then Huron, then Erie.'] };
    }
    if (shape === 'four') {
      return { q: 'Which state touches four of the five Great Lakes?', viz: lakeMap([]), a: mc(R.shuffle(['Michigan', 'New York', 'Ohio', 'Wisconsin']), 'Michigan'), hint: 'It is made of two peninsulas.',
        steps: ['Michigan touches Lake Superior, Lake Michigan, Lake Huron and Lake Erie.', 'New York touches two (Erie and Ontario); Ohio touches one (Erie); Wisconsin touches two (Superior and Michigan).'] };
    }
    if (shape === 'all') {
      var st = R.pick(['NY', 'WI', 'MI', 'PA']), yes = LAKES5.filter(function (x) { return x.st.indexOf(st) >= 0; }).map(function (x) { return x.n; });
      return { q: 'Which Great Lakes does ' + nm(st) + ' touch? Choose all that it touches.', viz: lakeMap([]), a: mcAll(LAKES5.map(function (x) { return x.n; }), yes), hint: 'Follow ' + nm(st) + '\'s shoreline on the map.',
        steps: [nm(st) + ' touches ' + yes.join(', ').replace(/, ([^,]*)$/, ' and $1') + '.'] };
    }
    var it = R.pick(GL_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'Remember HOMES, and that Canada is on the other side.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ---- usgeo.coasts-bays */
  var ATL = ['ME', 'NH', 'MA', 'RI', 'CT', 'NY', 'NJ', 'DE', 'MD', 'VA', 'NC', 'SC', 'GA'], GULFST = ['AL', 'MS', 'LA', 'TX'], PACST = ['WA', 'OR', 'CA', 'AK', 'HI'];
  var COASTF = [
    { n: 'Chesapeake Bay', st: 'MD', also: 'Maryland and Virginia', lon: -76.15, lat: 38.2, sea: 'the Atlantic Ocean' },
    { n: 'Cape Cod', st: 'MA', also: 'Massachusetts', lon: -70.05, lat: 41.8, sea: 'the Atlantic Ocean' },
    { n: 'Puget Sound', st: 'WA', also: 'Washington', lon: -122.45, lat: 47.6, sea: 'the Pacific Ocean' },
    { n: 'San Francisco Bay', st: 'CA', also: 'California', lon: -122.3, lat: 37.7, sea: 'the Pacific Ocean' },
    { n: 'the Florida Peninsula', st: 'FL', also: 'Florida', lon: -81.5, lat: 27.8, sea: 'the Atlantic Ocean and ' + GULF },
    { n: 'Galveston Bay', st: 'TX', also: 'Texas', lon: -94.85, lat: 29.55, sea: GULF }];
  var COAST_N = { A: 'The Atlantic coast', G: 'The Gulf coast', P: 'The Pacific coast' };
  function coastOf(id) { return ATL.indexOf(id) >= 0 ? 'A' : GULFST.indexOf(id) >= 0 ? 'G' : PACST.indexOf(id) >= 0 ? 'P' : null; }
  Gen('usgeo.coasts-bays', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['coast', 'coast', 'state'] : L === 2 ? ['coast', 'state', 'florida', 'letter'] : ['all', 'letter', 'state', 'florida']);
    if (shape === 'coast') {
      var st = R.pick(L === 1 ? ['TX', 'CA', 'NY', 'LA', 'WA', 'NC', 'OR', 'MS', 'SC', 'AL'] : ATL.concat(GULFST, PACST)), c = coastOf(st);
      return { q: 'On which coast is ' + nm(st) + '?', viz: usmap({ highlight: [st] }), a: mc([COAST_N.A, COAST_N.G, COAST_N.P], COAST_N[c], true),
        hint: 'The Gulf coast is the long southern shore from Florida to Texas.', steps: [nm(st) + ' is on ' + COAST_N[c].toLowerCase() + (c === 'G' ? ', along ' + GULF : c === 'A' ? ', along the Atlantic Ocean' : ', along the Pacific Ocean') + '.'] };
    }
    if (shape === 'state') {
      var f = R.pick(COASTF), right = nm(f.st), far = GG().states().filter(function (s) { return s.id !== f.st && coastOf(s.id) && coastOf(s.id) !== coastOf(f.st === 'FL' ? 'GA' : f.st); });
      var ch = R.shuffle([right].concat(R.sample(far, L === 1 ? 2 : 3).map(function (s) { return s.n; })));
      return { q: 'In which state is ' + f.n + '?', a: mc(ch, right), hint: 'Which ocean is it on?', steps: [cap1(f.n) + ' is in ' + f.also + ', on ' + f.sea + '.'] };
    }
    if (shape === 'florida') {
      return { q: 'Which state has coastline on both the Atlantic Ocean and ' + GULF + '?', a: mc(R.shuffle(['Florida', 'Texas', 'Georgia', 'Louisiana']), 'Florida'), hint: 'It is a peninsula.',
        steps: ['Florida is a peninsula: water on three sides.', 'Its east coast faces the Atlantic, and its west coast faces ' + GULF + '.'] };
    }
    if (shape === 'letter') {
      var set = R.sample(COASTF.filter(function (x) { return x.st !== 'FL'; }), 3), want = R.pick(set);
      return { q: 'Which letter marks ' + want.n + '?', viz: usmap({ points: set.map(function (x, i) { return { lon: x.lon, lat: x.lat, mark: LET[i] }; }) }), a: Object.assign(letterQ(set), { v: set.indexOf(want) }),
        hint: 'Is it on the Atlantic, the Gulf or the Pacific?', steps: [cap1(want.n) + ' is in ' + want.also + ', on ' + want.sea + '.', 'That is letter ' + LET[set.indexOf(want)] + '.'] };
    }
    var yes = R.sample(GULFST, 2), no = R.sample(ATL.concat(['WA', 'OR', 'CA']), 2), list = R.shuffle(yes.concat(no)).map(nm);
    return { q: 'Which of these states are on the Gulf coast? Choose all that are.', a: mcAll(list, yes.map(nm)), hint: 'The Gulf coast runs from Florida to Texas.',
      steps: ['The Gulf states are Florida, Alabama, Mississippi, Louisiana and Texas.'].concat(no.map(function (x) { return nm(x) + ' is on ' + COAST_N[coastOf(x)].toLowerCase() + '.'; })) };
  });

  /* ---- usgeo.deserts */
  var DESERTS = [
    { n: 'the Mojave Desert', id: null, lon: -116.0, lat: 35.2, d: 'the smallest of the four, home of Death Valley, Las Vegas and the Joshua tree', st: 'California and Nevada' },
    { n: 'the Sonoran Desert', id: 'sonoran', d: 'hot, home of the tall saguaro cactus, around Phoenix and Tucson', st: 'Arizona and California' },
    { n: 'the Chihuahuan Desert', id: 'chihuahuan', d: 'hot, mostly in Mexico, reaching into New Mexico and West Texas', st: 'New Mexico and Texas' },
    { n: 'the Great Basin Desert', id: 'greatbasin', d: 'a cold desert with snowy winters, covering most of Nevada and western Utah', st: 'Nevada and Utah' }];
  var DES_Q = [
    ['Which desert is a cold desert, with snowy winters?', 3], ['Joshua trees grow mainly in which desert?', 0], ['The tall saguaro cactus grows in which desert?', 1],
    ['Death Valley is in which desert?', 0], ['Which desert reaches into West Texas?', 2], ['Phoenix and Tucson, Arizona, are in which desert?', 1], ['Which desert covers most of Nevada?', 3], ['Las Vegas is in which desert?', 0]];
  var DES_TF = [
    ['Deserts are always hot.', false, 'A desert is a place with very little rain. The Great Basin Desert has cold, snowy winters.'],
    ['All four big U.S. deserts are in the West and Southwest.', true, 'They lie between the Rockies and the Pacific mountains, and in the Southwest.'],
    ['The Chihuahuan Desert is mostly in Mexico.', true, 'Most of it is in northern Mexico; it reaches into New Mexico and West Texas.'],
    ['A desert is a place that gets very little rain or snow.', true, 'Dry is what makes a desert, not heat.']];
  function desertMap(set) {
    var marks = {}, pts = []; set.forEach(function (d, i) { if (d.id) marks[d.id] = LET[i]; else pts.push({ lon: d.lon, lat: d.lat, mark: LET[i] }); });
    return usmap({ features: set.filter(function (d) { return d.id; }).map(function (d) { return d.id; }), mark: marks, points: pts, color: 'plain', featureLabels: false });
  }
  Gen('usgeo.deserts', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['q', 'cold', 'tf'] : L === 2 ? ['q', 'q', 'tf'] : ['letter', 'q', 'tf']);
    if (shape === 'cold') {
      return { q: 'Which desert is a cold desert, with snowy winters?', a: mc(R.shuffle(['The Great Basin Desert', 'The Sonoran Desert', 'The Mojave Desert']), 'The Great Basin Desert'), hint: 'It is the farthest north of the four.',
        steps: ['The Great Basin Desert is high and far north, so its winters are cold and snowy.', 'It is still a desert because it gets very little rain or snow.'] };
    }
    if (shape === 'q') {
      var it = R.pick(DES_Q), right = cap1(DESERTS[it[1]].n), ch = R.shuffle([right].concat(R.sample(others(DESERTS.map(function (d) { return cap1(d.n); }), [right]), L === 1 ? 2 : 3)));
      return { q: it[0], viz: L === 1 ? undefined : desertMap(DESERTS.slice()), a: mc(ch, right), hint: 'Mojave: Death Valley and Joshua trees. Sonoran: saguaros. Chihuahuan: Texas and Mexico. Great Basin: cold.',
        steps: [right + ' is ' + DESERTS[it[1]].d + '.'] };
    }
    if (shape === 'letter') {
      var set = R.shuffle(DESERTS.slice()), want = R.pick(set);
      return { q: 'Which letter marks ' + want.n + '?', viz: desertMap(set), a: Object.assign(letterQ(set), { v: set.indexOf(want) }), hint: 'The Great Basin is the farthest north; the Chihuahuan is the farthest east.',
        steps: [cap1(want.n) + ' is ' + want.d + '.', 'That is letter ' + LET[set.indexOf(want)] + '.'] };
    }
    var t = R.pick(DES_TF);
    return { q: 'True or false? ' + t[0], a: tf(t[1]), hint: 'What makes a place a desert?', steps: [(t[1] ? 'True. ' : 'False. ') + t[2]] };
  });

  /* ---- usgeo.alaska-hawaii */
  var AKHI_TF = [
    ['Alaska is the largest state.', true, 'Alaska is by far the largest state, more than twice the size of Texas.'],
    ['Alaska is smaller than Texas.', false, 'Small inset maps fool people. Alaska is more than twice as big as Texas.'],
    ['Hawaii is made of islands built by volcanoes.', true, 'Every Hawaiian island was built by volcanoes rising from the ocean floor.'],
    ['Anchorage is the capital of Alaska.', false, 'Anchorage is Alaska\'s biggest city, but the capital is Juneau.'],
    ['Honolulu, the capital of Hawaii, is on the island of Oahu.', true, 'Honolulu is on Oahu.'],
    ['Hawaii and Alaska both became states in 1959.', true, 'Alaska joined in January 1959 and Hawaii in August 1959.'],
    ['Denali, the highest peak in North America, is in Hawaii.', false, 'Denali is in Alaska.'],
    ['Hawaii is the only state made up entirely of islands.', true, 'All of Hawaii is islands in the Pacific.'],
    ['Alaska has a longer ocean coastline than any other state.', true, 'Alaska\'s coast on the Pacific and Arctic oceans is longer than all the other states\' coasts together.'],
    ['Part of Alaska is north of the Arctic Circle.', true, 'Northern Alaska, around the Brooks Range and the Arctic coast, is north of the Arctic Circle.'],
    ['Hawaii is in the Atlantic Ocean.', false, 'Hawaii is in the middle of the Pacific Ocean.'],
    ['Alaska has glaciers.', true, 'Alaska has thousands of glaciers in its mountains.'],
    ['Hawaii is the southernmost state.', true, 'Hawaii is farther south than Florida.'],
    ['Juneau, Alaska\'s capital, can be reached from the other states by road.', false, 'No roads connect Juneau to the rest of North America; people arrive by plane or boat.'],
    ['Much of northern Alaska is tundra, where the ground below stays frozen all year.', true, 'That frozen ground is called permafrost.']];
  var AKHI_MC = [
    ['Which ocean lies along Alaska\'s northern coast?', 'The Arctic Ocean', ['The Atlantic Ocean', 'The Indian Ocean'], 'Alaska\'s north coast faces the Arctic Ocean; its south coast faces the Pacific.'],
    ['Which country is just across the narrow Bering Strait from Alaska?', 'Russia', ['Mexico', 'Japan'], 'The Bering Strait separates Alaska from Russia.'],
    ['What is the largest city in Alaska?', 'Anchorage', ['Juneau', 'Honolulu'], 'Anchorage is the largest city; Juneau is the capital.'],
    ['Which is the largest of the Hawaiian Islands?', 'Hawaii (the Big Island)', ['Oahu', 'Maui'], 'The island of Hawaii, called the Big Island, is the largest; it still has active volcanoes.'],
    ['On which island is Honolulu, Hawaii\'s capital?', 'Oahu', ['Maui', 'Kauai'], 'Honolulu is on Oahu.']];
  Gen('usgeo.alaska-hawaii', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['largest', 'capital', 'volcano', 'fact'] : L === 2 ? ['times', 'capital', 'tf', 'fact'] : ['diff', 'ratio', 'ratio2', 'tf', 'second', 'fact']);
    if (shape === 'fact') {
      var f = R.pick(AKHI_MC);
      return { q: f[0], a: mc(R.shuffle([f[1]].concat(f[2])), f[1]), hint: 'Picture Alaska and Hawaii on a globe, not in the map\'s boxes.', steps: [f[3]] };
    }
    if (shape === 'ratio2') {
      var o = R.pick(['CA', 'MT', 'NM', 'AZ', 'NV', 'CO', 'WY', 'OR']), ak = 571000, ol = Math.round(LAND[o] / 1000) * 1000, rr = Math.round(ak / ol * 10) / 10;
      return { q: 'Alaska has about 571,000 square miles of land, and ' + nm(o) + ' has about ' + fmt(ol) + '. About how many times as much land does Alaska have? Round to one decimal place.', a: num(rr, { rtol: 0.03 }), hint: 'Divide Alaska\'s land area by ' + nm(o) + '\'s.',
        steps: ['$571{,}000 \\div ' + fmt(ol).replace(',', '{,}') + ' \\approx ' + (ak / ol).toFixed(2) + '$', 'Rounded: about ' + rr + ' times as much.'] };
    }
    if (shape === 'largest') {
      return { q: 'Which is the largest state?', a: mc(R.shuffle(['Alaska', 'Texas', 'California']), 'Alaska'), hint: 'Do not judge by the small box on many maps.', steps: ['Alaska is the largest state by far, more than twice the size of Texas.', 'Many maps shrink it into a small box to save room.'] };
    }
    if (shape === 'capital') {
      var a = R.coin();
      return { q: 'What is the capital of ' + (a ? 'Alaska' : 'Hawaii') + '?', viz: usmap({ highlight: [a ? 'AK' : 'HI'], capitals: [a ? 'AK' : 'HI'], capLabels: false }),
        a: mc(R.shuffle(a ? ['Juneau', 'Anchorage', 'Fairbanks'] : ['Honolulu', 'Hilo', 'Juneau']), a ? 'Juneau' : 'Honolulu'), hint: a ? 'It is not the biggest city.' : 'It is on the island of Oahu.',
        steps: [a ? 'Juneau is Alaska\'s capital, in the southeast panhandle. Anchorage is its biggest city.' : 'Honolulu, on the island of Oahu, is Hawaii\'s capital and biggest city.'] };
    }
    if (shape === 'volcano') {
      return { q: 'How were the Hawaiian Islands made?', a: mc(R.shuffle(['By volcanoes rising from the ocean floor', 'By glaciers dropping rocks', 'By sand piling up from rivers']), 'By volcanoes rising from the ocean floor'), hint: 'Some of them still erupt.',
        steps: ['Each island is the top of a huge volcano that grew up from the ocean floor.', 'Volcanoes on the island of Hawaii still erupt today.'] };
    }
    if (shape === 'times') {
      var r = 'More than twice as big', ch = R.shuffle([r, 'About the same size', 'About half as big']);
      return { q: 'Compared with Texas, how big is Alaska?', viz: usmap({ highlight: ['AK', 'TX'] }), a: mc(ch, r), hint: 'The map shrinks Alaska into a box. Its real size is much larger.',
        steps: ['Alaska covers about 665,000 square miles; Texas covers about 269,000.', 'That makes Alaska about two and a half times as big as Texas.'] };
    }
    if (shape === 'diff') {
      var o2 = R.pick(['TX', 'CA', 'MT', 'NM', 'AZ', 'NV']), ol2 = Math.round(LAND[o2] / 1000) * 1000;
      return { q: 'Alaska has about 571,000 square miles of land, and ' + nm(o2) + ' has about ' + fmt(ol2) + '. About how many more square miles of land does Alaska have?', a: num(571000 - ol2, { unit: 'square miles', rtol: 0.003 }), hint: 'Subtract.',
        steps: ['$571{,}000 - ' + fmt(ol2).replace(',', '{,}') + ' = ' + fmt(571000 - ol2).replace(',', '{,}') + '$', 'Alaska has about ' + fmt(571000 - ol2) + ' more square miles of land than ' + nm(o2) + '.'] };
    }
    if (shape === 'ratio') {
      return { q: 'Alaska covers about 665,000 square miles, and Texas covers about 269,000 square miles. About how many times as large as Texas is Alaska? Round to one decimal place.', a: num('2.5', { rtol: 0.02 }), hint: 'Divide the larger area by the smaller one.',
        steps: ['$665{,}000 \\div 269{,}000 \\approx 2.47$', 'Rounded to one decimal place, that is about 2.5 times as large.'] };
    }
    if (shape === 'second') {
      return { q: 'Alaska is the largest state by area. Which state is second largest?', a: mc(R.shuffle(['Texas', 'California', 'Montana', 'Hawaii']), 'Texas'), hint: 'It borders Mexico.', steps: ['Texas is the second-largest state, after Alaska.', 'California is third, and Montana fourth.'] };
    }
    var it = R.pick(AKHI_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'Picture the real map, not the inset boxes.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ================================================================== Unit 4: National Parks and Landmarks */

  /* ---- usgeo.national-parks */
  var NP_TF = [
    ['Yellowstone was the first national park.', true, 'Congress made Yellowstone a national park in 1872.'],
    ['The National Park Service was created in 1916.', true, 'A law signed on August 25, 1916, created the National Park Service.'],
    ['Every place the National Park Service cares for is a national park.', false, 'The Park Service also cares for hundreds of other places: monuments, memorials, historic sites, seashores and more.'],
    ['The Statue of Liberty is a national monument, cared for by the National Park Service.', true, 'It is Statue of Liberty National Monument, one of the hundreds of places the Park Service runs that are not national parks.'],
    ['National parks belong to one family and are closed to everyone else.', false, 'National parks are protected for everyone.'],
    ['There are more than 60 national parks.', true, 'The country has more than 60 national parks, and more than 400 places in the whole National Park System.'],
    ['Every state has at least one place cared for by the National Park Service.', true, 'The Park Service says there is at least one of its sites in every state.'],
    ['Yellowstone is mostly in Wyoming.', true, 'Most of Yellowstone is in northwestern Wyoming; small parts reach into Montana and Idaho.'],
    ['The first national park was in Florida.', false, 'The first was Yellowstone, in the Rocky Mountains, mostly in Wyoming.'],
    ['National parks protect land, water, plants and animals.', true, 'They protect whole landscapes and the living things in them.'],
    ['The National Park Service is part of the federal (national) government.', true, 'It is a bureau of the U.S. Department of the Interior.'],
    ['The Great Smoky Mountains is the most visited national park.', true, 'It had about 11.5 million visits in 2025, more than any other national park.'],
    ['All national parks are in the West.', false, 'Many are in the West, but there are national parks in the East too, such as Acadia, Shenandoah, the Everglades and the Great Smoky Mountains.'],
    ['Yosemite became a national park before Grand Canyon did.', true, 'Yosemite became a national park in 1890; Grand Canyon in 1919.']];
  Gen('usgeo.national-parks', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['first', 'what', 'tf', 'agency', 'firstyear'] : L === 2 ? ['years', 'count', 'tf', 'first', 'firstyear', 'agency'] : ['all', 'years', 'tf', 'years2']);
    if (shape === 'agency') {
      var r0 = 'The National Park Service', ch0 = R.shuffle([r0, 'The Census Bureau', 'The Postal Service']);
      return { q: 'Which part of the national government runs the national parks?', a: mc(ch0, r0), hint: 'Its name says what it does.', steps: ['The National Park Service, created in 1916, runs the national parks and hundreds of other places.'] };
    }
    if (shape === 'firstyear') {
      var ch1 = R.shuffle(['1872', '1776', '1916', '1959'].slice(0, L === 1 ? 3 : 4));
      if (ch1.indexOf('1872') < 0) ch1[0] = '1872';
      return { q: 'In what year did Yellowstone become the first national park?', a: mc(R.shuffle(ch1), '1872'), hint: 'It was a few years after the Civil War.', steps: ['Congress made Yellowstone the first national park in 1872.', '1916 is when the National Park Service was created to run the parks.'] };
    }
    if (shape === 'years2') {
      var p2 = R.pick([['Grand Canyon', 1919], ['Yosemite', 1890], ['Crater Lake', 1902], ['Glacier', 1910], ['Rocky Mountain', 1915], ['Zion', 1919], ['Great Smoky Mountains', 1934]]);
      return { q: 'Yellowstone became the first national park in 1872. ' + p2[0] + ' became a national park in ' + p2[1] + '. How many years later was that?', a: num(p2[1] - 1872, { unit: 'years' }), hint: 'Subtract 1872 from the later year.',
        steps: ['$' + p2[1] + ' - 1872 = ' + (p2[1] - 1872) + '$'] };
    }
    if (shape === 'first') {
      return { q: 'Which was the first national park?', a: mc(R.shuffle(['Yellowstone', 'Yosemite', 'Grand Canyon', 'Acadia'].slice(0, L === 1 ? 3 : 4)), 'Yellowstone'), hint: 'It is famous for geysers such as Old Faithful.',
        steps: ['Yellowstone became the first national park in 1872.', 'It is mostly in Wyoming, with small parts in Montana and Idaho.'] };
    }
    if (shape === 'what') {
      var r = 'A special place protected for everyone to enjoy', ch = R.shuffle([r, 'A park in the middle of a big city', 'A place where only rangers may go']);
      return { q: 'What is a national park?', a: mc(ch, r), hint: 'Who are national parks for?', steps: ['A national park protects special land, water, plants and animals.', 'It is kept for everyone, now and in the future.'] };
    }
    if (shape === 'years') {
      return { q: 'Yellowstone became the first national park in 1872. The National Park Service was created in 1916. How many years later was that?', a: num(44, { unit: 'years' }), hint: 'Subtract the earlier year from the later year.',
        steps: ['$1916 - 1872 = 44$', 'The Park Service came 44 years after the first national park.'] };
    }
    if (shape === 'count') {
      var r2 = 'More than 60', ch2 = R.shuffle([r2, 'About 10', 'About 5,000']);
      return { q: 'About how many national parks does the United States have?', a: mc(ch2, r2), hint: 'Many more than 10, but far fewer than thousands.', steps: ['There are more than 60 national parks.', 'The whole National Park System, with monuments, memorials and historic sites, has more than 400 places.'] };
    }
    if (shape === 'all') {
      var yes = R.sample(['Yellowstone National Park', 'Yosemite National Park', 'Acadia National Park', 'Everglades National Park', 'Grand Canyon National Park'], 2), no = R.sample(['Statue of Liberty National Monument', 'Lincoln Memorial', 'Mount Rushmore National Memorial', 'Devils Tower National Monument'], 2), list = R.shuffle(yes.concat(no));
      return { q: 'All four of these are cared for by the National Park Service. Which ones are national parks? Choose all that are.', a: mcAll(list, yes), hint: 'Read the full name of each place.',
        steps: list.map(function (x) { return x + (yes.indexOf(x) >= 0 ? ' is a national park.' : ' is not a national park; it is a ' + (/Monument/.test(x) ? 'national monument' : 'national memorial') + '.'); }) };
    }
    var it = R.pick(NP_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'The Park Service runs national parks and many other kinds of places.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ---- parks of the West and the middle and East */
  var PARKS_W = [
    { n: 'Yellowstone', st: 'WY', mostly: 1, lon: -110.55, lat: 44.6, f: 'geysers, such as Old Faithful, and hot springs' },
    { n: 'Yosemite', st: 'CA', lon: -119.55, lat: 37.85, f: 'tall granite cliffs, such as El Capitan, and high waterfalls' },
    { n: 'Grand Canyon', st: 'AZ', lon: -112.1, lat: 36.1, f: 'a mile-deep canyon carved by the Colorado River', trap: 'CO' },
    { n: 'Zion', st: 'UT', lon: -113.05, lat: 37.3, f: 'red and white sandstone cliffs and narrow canyons' },
    { n: 'Glacier', st: 'MT', lon: -113.8, lat: 48.7, f: 'glacier-carved mountains and lakes on the Canadian border' },
    { n: 'Rocky Mountain', st: 'CO', lon: -105.7, lat: 40.35, f: 'high peaks, alpine tundra and the Continental Divide' },
    { n: 'Olympic', st: 'WA', lon: -123.6, lat: 47.8, f: 'rain forests, mountains and wild Pacific beaches' },
    { n: 'Denali', st: 'AK', lon: -150.5, lat: 63.33, f: 'Denali (Mount McKinley), the highest peak in North America' },
    { n: 'Arches', st: 'UT', lon: -109.6, lat: 38.73, f: 'more than 2,000 natural stone arches' },
    { n: 'Mount Rainier', st: 'WA', lon: -121.75, lat: 46.85, f: 'a huge volcano covered with glaciers' },
    { n: 'Crater Lake', st: 'OR', lon: -122.1, lat: 42.94, f: 'a deep blue lake inside a collapsed volcano' },
    { n: 'Hawaiʻi Volcanoes', st: 'HI', lon: -155.25, lat: 19.4, f: 'active volcanoes and lava flows' },
    { n: 'Death Valley', st: 'CA', mostly: 1, lon: -117.1, lat: 36.5, f: 'Badwater Basin, the lowest point in North America' }];
  var PARKS_E = [
    { n: 'Great Smoky Mountains', st: 'TN', two: 'NC', lon: -83.5, lat: 35.6, f: 'misty, forested mountains; it is the most visited national park' },
    { n: 'Acadia', st: 'ME', lon: -68.21, lat: 44.35, f: 'a rocky Atlantic coastline on Mount Desert Island' },
    { n: 'Everglades', st: 'FL', lon: -80.9, lat: 25.3, f: 'a huge, slow-moving "river of grass" with alligators' },
    { n: 'Shenandoah', st: 'VA', lon: -78.35, lat: 38.53, f: 'the Blue Ridge Mountains and Skyline Drive' },
    { n: 'Mammoth Cave', st: 'KY', lon: -86.1, lat: 37.19, f: 'the longest known cave system in the world' },
    { n: 'Big Bend', st: 'TX', lon: -103.25, lat: 29.25, f: 'desert, mountains and canyons along a big bend of the Rio Grande' },
    { n: 'Hot Springs', st: 'AR', lon: -93.05, lat: 34.51, f: 'naturally hot spring water' },
    { n: 'Badlands', st: 'SD', lon: -102.5, lat: 43.75, f: 'steep, striped, worn-away hills and prairie' },
    { n: 'Gateway Arch', st: 'MO', lon: -90.19, lat: 38.62, f: 'the tall steel Gateway Arch in St. Louis' },
    { n: 'Cuyahoga Valley', st: 'OH', lon: -81.55, lat: 41.24, f: 'a river valley with waterfalls between Cleveland and Akron' },
    { n: 'Voyageurs', st: 'MN', lon: -92.88, lat: 48.5, f: 'lakes and waterways on the Canadian border' },
    { n: 'New River Gorge', st: 'WV', lon: -81.08, lat: 38.07, f: 'a deep river gorge in the Appalachians' },
    { n: 'Isle Royale', st: 'MI', lon: -88.9, lat: 48.0, f: 'a wild island in Lake Superior' }];
  function parkState(p) { return p.two ? nm(p.st) + ' and ' + nm(p.two) : nm(p.st); }
  function makeParksGen(P, OTHER, side) {
    return function (R, ctx) {
      var L = ctx.level || 1, shape = R.pick(L === 1 ? ['state', 'letter'] : L === 2 ? ['state', 'feature', 'letter'] : ['letter', 'rev', 'feature', 'side']);
      var p = R.pick(L === 1 ? P.slice(0, 8) : P), right = parkState(p);
      if (shape === 'state') {
        var pool = GG().states().filter(function (s) { return s.id !== p.st && s.id !== p.two && (side === 'W' ? s.reg === 'w' || ['TX', 'SD', 'ND', 'NE', 'KS', 'OK'].indexOf(s.id) >= 0 : s.reg !== 'w'); }).map(function (s) { return s.n; });
        var wrong = L >= 2 && p.trap ? [nm(p.trap)].concat(R.sample(others(pool, [nm(p.trap)]), 2)) : R.sample(pool, L === 1 ? 2 : 3);
        if (p.two) wrong = wrong.map(function (w, i) { return i === 0 ? w + ' and ' + R.pick(others(pool, [w])) : w; });
        var ch = R.shuffle([right].concat(wrong));
        return { q: p.n + ' National Park is ' + (p.mostly ? 'mostly ' : '') + 'in which state' + (p.two ? 's' : '') + '?', a: mc(ch, right), hint: 'What is the park famous for? That tells you which part of the country to look in.',
          steps: [p.n + ' National Park is known for ' + p.f + '.', 'It is ' + (p.mostly ? 'mostly ' : '') + 'in ' + right + '.'].concat(p.trap && L >= 2 ? ['The Colorado River carved the Grand Canyon, but the park is in Arizona, not Colorado.'] : []) };
      }
      if (shape === 'feature') {
        var ch2 = R.shuffle([p].concat(R.sample(others(P, [p]), L === 2 ? 2 : 3))).map(function (x) { return x.n; });
        return { q: 'Which national park is known for ' + p.f + '?', a: mc(ch2, p.n), hint: 'Think about the land in each park.', steps: [p.n + ' National Park (' + right + ') is known for ' + p.f + '.'] };
      }
      if (shape === 'letter') {
        var set = R.sample(P.filter(function (x) { return x.st !== 'HI' || L === 3; }), L === 1 ? 3 : 4), want = R.pick(set);
        for (var tries = 0; tries < 20; tries++) { var close = false; for (var i = 0; i < set.length; i++) for (var j = i + 1; j < set.length; j++) if (Math.abs(set[i].lon - set[j].lon) + Math.abs(set[i].lat - set[j].lat) < 4) close = true; if (!close) break; set = R.sample(P, set.length); want = R.pick(set); }
        return { q: 'Which letter marks ' + want.n + ' National Park?', viz: usmap({ points: set.map(function (x, i) { return { lon: x.lon, lat: x.lat, mark: LET[i] }; }) }), a: Object.assign(letterQ(set), { v: set.indexOf(want) }),
          hint: 'Find the state first.', steps: [want.n + ' National Park is in ' + parkState(want) + '.', 'That is letter ' + LET[set.indexOf(want)] + '.'] };
      }
      if (shape === 'rev') {
        var others2 = R.sample(P.filter(function (x) { return x.st !== p.st && x.two !== p.st; }), 3), ch3 = R.shuffle([p].concat(others2)).map(function (x) { return x.n; });
        return { q: 'Which of these national parks is in ' + nm(p.st) + '?', a: mc(ch3, p.n), hint: 'Picture each park\'s land.', steps: [p.n + ' is in ' + right + '.'].concat(others2.map(function (x) { return x.n + ' is in ' + parkState(x) + '.'; })) };
      }
      var o = R.pick(OTHER), ch4 = R.shuffle([p.n, o.n]);
      return { q: 'Which of these two national parks is ' + (side === 'W' ? 'in the West' : 'east of the Rocky Mountains') + '?', a: mc(ch4, p.n), hint: 'Find each park\'s state.',
        steps: [p.n + ' is in ' + right + '.', o.n + ' is in ' + parkState(o) + '.'] };
    };
  }
  Gen('usgeo.parks-west', makeParksGen(PARKS_W, PARKS_E, 'W'));
  Gen('usgeo.parks-east', makeParksGen(PARKS_E, PARKS_W, 'E'));

  /* ---- usgeo.landmarks */
  var MARKS = [
    { n: 'the Statue of Liberty', st: 'NY', made: 1, lon: -74.04, lat: 40.69 }, { n: 'Mount Rushmore', st: 'SD', made: 1, lon: -103.46, lat: 43.88, note: 'carved by people into a natural mountain' },
    { n: 'the Golden Gate Bridge', st: 'CA', made: 1, lon: -122.48, lat: 37.82 }, { n: 'the Gateway Arch', st: 'MO', made: 1, lon: -90.18, lat: 38.62 },
    { n: 'the Space Needle', st: 'WA', made: 1, lon: -122.35, lat: 47.62 }, { n: 'the Liberty Bell', st: 'PA', made: 1, lon: -75.15, lat: 39.95 },
    { n: 'the Alamo', st: 'TX', made: 1, lon: -98.49, lat: 29.43 }, { n: 'Old Faithful', st: 'WY', made: 0, lon: -110.83, lat: 44.46, note: 'a natural geyser in Yellowstone' },
    { n: 'Niagara Falls', st: 'NY', made: 0, lon: -79.07, lat: 43.08, note: 'natural waterfalls on the border with Canada' }, { n: 'Devils Tower', st: 'WY', made: 0, lon: -104.72, lat: 44.59, note: 'a natural tower of rock' },
    { n: 'the Grand Canyon', st: 'AZ', made: 0, lon: -112.11, lat: 36.06, note: 'a natural canyon carved by the Colorado River' }, { n: 'Pikes Peak', st: 'CO', made: 0, lon: -105.04, lat: 38.84, note: 'a natural mountain in the Rockies' },
    { n: 'the Kennedy Space Center', st: 'FL', made: 1, lon: -80.65, lat: 28.57 }, { n: 'the Wright Brothers National Memorial', st: 'NC', made: 1, lon: -75.67, lat: 36.01 }];
  Gen('usgeo.landmarks', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['state', 'kind'] : L === 2 ? ['state', 'letter', 'kind'] : ['all', 'rev', 'letter']);
    var m = R.pick(MARKS);
    if (shape === 'state') {
      var pool = GG().states().filter(function (s) { return s.id !== m.st && s.id !== 'DC'; }), w = R.sample(pool, L === 1 ? 2 : 3).map(function (s) { return s.n; }), ch = R.shuffle([nm(m.st)].concat(w));
      return { q: 'In which state is ' + m.n + '?', a: mc(ch, nm(m.st)), hint: 'Picture where it is: East, middle or West?', steps: [cap1(m.n) + ' is in ' + nm(m.st) + (m.note ? '; it is ' + m.note : '') + '.'] };
    }
    if (shape === 'kind') {
      var r = m.made ? 'Made by people' : 'Made by nature';
      return { q: 'Was ' + m.n + ' made by people or by nature?', a: mc(['Made by people', 'Made by nature'], r, true), hint: 'Could people have built it, or did rock, water or a volcano make it?',
        steps: [cap1(m.n) + (m.made ? ' was made by people' : ' was made by nature') + (m.note ? ': ' + m.note : '') + '.'] };
    }
    if (shape === 'letter') {
      var set = R.sample(MARKS, 3); for (var t = 0; t < 20 && set.some(function (a, i) { return set.some(function (b, j) { return j > i && Math.abs(a.lon - b.lon) + Math.abs(a.lat - b.lat) < 5; }); }); t++) set = R.sample(MARKS, 3);
      var want = R.pick(set);
      return { q: 'Which letter marks ' + want.n + '?', viz: usmap({ points: set.map(function (x, i) { return { lon: x.lon, lat: x.lat, mark: LET[i] }; }) }), a: Object.assign(letterQ(set), { v: set.indexOf(want) }),
        hint: 'Which state is it in?', steps: [cap1(want.n) + ' is in ' + nm(want.st) + '.', 'That is letter ' + LET[set.indexOf(want)] + '.'] };
    }
    if (shape === 'rev') {
      var o = R.sample(MARKS.filter(function (x) { return x.st !== m.st; }), 3), ch2 = R.shuffle([m].concat(o)).map(function (x) { return cap1(x.n); });
      return { q: 'Which of these landmarks is in ' + nm(m.st) + '?', a: mc(ch2, cap1(m.n)), hint: 'Picture each landmark on the map.', steps: [cap1(m.n) + ' is in ' + nm(m.st) + '.'].concat(o.map(function (x) { return cap1(x.n) + ' is in ' + nm(x.st) + '.'; })) };
    }
    var nat = R.sample(MARKS.filter(function (x) { return !x.made; }), 2), mad = R.sample(MARKS.filter(function (x) { return x.made; }), 2), list = R.shuffle(nat.concat(mad)).map(function (x) { return cap1(x.n); });
    return { q: 'Which of these landmarks were made by nature? Choose all that were.', a: mcAll(list, nat.map(function (x) { return cap1(x.n); })), hint: 'Mount Rushmore is a mountain, but who carved the faces?',
      steps: nat.concat(mad).map(function (x) { return cap1(x.n) + (x.made ? ' was made by people' : ' was made by nature') + (x.note ? ' (' + x.note + ')' : '') + '.'; }) };
  });

  /* ================================================================== Unit 5: Time Zones and Climate */

  var ZORDER = ['H', 'AK', 'P', 'M', 'C', 'E']; // west to east
  function zName(z) { return GG().US_TZ_NAME[z]; }
  // cities with their zone; std = hours from UTC in standard time; dst: false where clocks never change
  var TZC = [
    { n: 'New York', z: 'E', lon: -73.98, lat: 40.75 }, { n: 'Boston', z: 'E', lon: -71.06, lat: 42.36 }, { n: 'Miami', z: 'E', lon: -80.19, lat: 25.76 }, { n: 'Atlanta', z: 'E', lon: -84.39, lat: 33.75 },
    { n: 'Chicago', z: 'C', lon: -87.63, lat: 41.88 }, { n: 'Houston', z: 'C', lon: -95.37, lat: 29.76 }, { n: 'New Orleans', z: 'C', lon: -90.07, lat: 29.95 }, { n: 'Minneapolis', z: 'C', lon: -93.27, lat: 44.98 },
    { n: 'Denver', z: 'M', lon: -104.99, lat: 39.74 }, { n: 'Salt Lake City', z: 'M', lon: -111.89, lat: 40.76 }, { n: 'Phoenix', z: 'M', lon: -112.07, lat: 33.45, nodst: 1 },
    { n: 'Los Angeles', z: 'P', lon: -118.24, lat: 34.05 }, { n: 'Seattle', z: 'P', lon: -122.33, lat: 47.61 }, { n: 'Las Vegas', z: 'P', lon: -115.14, lat: 36.17 },
    { n: 'Anchorage', z: 'AK', lon: -149.9, lat: 61.22 }, { n: 'Honolulu', z: 'H', lon: -157.86, lat: 21.31, nodst: 1 }];
  function cityBy(n) { return TZC.filter(function (c) { return c.n === n; })[0]; }
  function off(c, summer) { return GG().US_TZ[c.z] + (summer && !c.nodst ? 1 : 0); }
  function tzCity(c, summer) { return { n: c.n, lon: c.lon, lat: c.lat, utc: off(c, summer) }; }
  function clock(m) { return GG().fmtClock(m); }
  // four clock-time choices: the right one, the wrong direction, and one hour off each way
  function timeChoices(R, right, wrongDir) {
    var c = uniq([right, wrongDir, right + 60, right - 60, right + 120].map(function (m) { return clock(m); })).slice(0, 4);
    return R.shuffle(c);
  }

  /* ---- usgeo.time-zones */
  var TZ_STATES = GG().states().filter(function (s) { return !GG().STATE_TZ_SPLIT[s.id]; }).map(function (s) { return s.id; });
  var TZ_TF = [
    ['When it is noon in New York, it is 9:00 a.m. in Los Angeles.', true, 'Los Angeles is three zones west, so its clocks are three hours earlier.'],
    ['Clocks in the West show a later time than clocks in the East.', false, 'The Sun rises first in the East, so Eastern clocks are ahead. Western clocks show an earlier time.'],
    ['Some states are split between two time zones.', true, 'For example, most of Texas uses Central Time, but its far western corner uses Mountain Time.'],
    ['The 50 states use six time zones.', true, 'Eastern, Central, Mountain, Pacific, Alaska and Hawaii-Aleutian.'],
    ['Each time zone is one hour different from the zone next to it.', true, 'Crossing into the next zone changes the clock by one hour.']];
  Gen('usgeo.time-zones', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['zone', 'earlier', 'count'] : L === 2 ? ['zone', 'city', 'noon', 'tf'] : ['order', 'all', 'city', 'tf']);
    if (shape === 'zone') {
      var st = R.pick(TZ_STATES.filter(function (x) { return L > 1 || ['AK', 'HI'].indexOf(x) < 0; })), z = GG().STATE_TZ[st];
      var zs = L === 1 ? R.sample(['E', 'C', 'M', 'P'].filter(function (x) { return x !== z; }), 2) : R.sample(ZORDER.filter(function (x) { return x !== z; }), 3);
      return { q: 'In which time zone is ' + nm(st) + '?', viz: { name: 'gg-timezones', opts: { us: true, quiet: true, interactive: false, zoneNames: true } }, a: mc(R.shuffle([z].concat(zs)).map(zName), zName(z)),
        hint: 'Find the state on the time-zone map. The zones run in bands from east to west.', steps: [nm(st) + ' is in the ' + zName(z) + ' Time Zone.'] };
    }
    if (shape === 'earlier') {
      var r = 'Earlier', ch = ['Earlier', 'Later', 'The same'];
      return { q: 'When you travel west across the United States, the clock time where you arrive is…', a: mc(ch, r, true), hint: 'The Sun rises in the east first.',
        steps: ['The Sun rises in the East first, so Eastern clocks are ahead.', 'Going west, each zone is one hour earlier.'] };
    }
    if (shape === 'count') {
      return { q: 'How many time zones do the 50 states use?', viz: { name: 'gg-timezones', opts: { us: true, quiet: true, interactive: false } }, a: num(6), hint: 'Count the colors on the map, including Alaska and Hawaii.',
        steps: ['Eastern, Central, Mountain and Pacific cover the 48 states.', 'Alaska and Hawaii-Aleutian make 6 in all.'] };
    }
    if (shape === 'city') {
      var c = R.pick(TZC), zs2 = R.sample(ZORDER.filter(function (x) { return x !== c.z; }), 3);
      return { q: 'In which time zone is the city marked on the map?', viz: { name: 'gg-timezones', opts: { us: true, quiet: true, interactive: false, cities: [tzCity(c, false)], clocks: false } },
        a: mc(R.shuffle([c.z].concat(zs2)).map(zName), zName(c.z)), hint: 'Look at which color band the dot is in.', steps: ['The dot is ' + c.n + '.', c.n + ' is in the ' + zName(c.z) + ' Time Zone.'] };
    }
    if (shape === 'noon') {
      var west = R.pick(['Los Angeles', 'Denver', 'Chicago']), cw = cityBy(west), diff = GG().US_TZ.E - GG().US_TZ[cw.z], right = clock(720 - diff * 60), wrong = clock(720 + diff * 60);
      return { q: 'When it is 12:00 noon in New York, what time is it in ' + west + '?', a: mc(R.shuffle(uniq([right, wrong, '12:00 noon'])), right), hint: 'West is earlier.',
        steps: [west + ' is ' + diff + ' zone' + (diff > 1 ? 's' : '') + ' west of New York.', 'West is earlier, so subtract ' + diff + ' hour' + (diff > 1 ? 's' : '') + ': ' + right + '.'] };
    }
    if (shape === 'order') {
      var right2 = 'Eastern, Central, Mountain, Pacific', ch2 = R.shuffle([right2, 'Pacific, Mountain, Central, Eastern', 'Eastern, Mountain, Central, Pacific', 'Central, Eastern, Mountain, Pacific']);
      return { q: 'Which list goes from east to west?', a: mc(ch2, right2), hint: 'Start on the Atlantic coast.', steps: ['From the Atlantic going west: Eastern, Central, Mountain, Pacific.', 'Then come Alaska and Hawaii-Aleutian.'] };
    }
    if (shape === 'all') {
      var z3 = R.pick(['C', 'M', 'P']), yes = R.sample(TZ_STATES.filter(function (x) { return GG().STATE_TZ[x] === z3; }), 2), no = R.sample(TZ_STATES.filter(function (x) { return GG().STATE_TZ[x] !== z3 && ['AK', 'HI'].indexOf(x) < 0; }), 2);
      var list = R.shuffle(yes.concat(no)).map(nm);
      return { q: 'Which of these states use ' + zName(z3) + ' Time? Choose all that do.', viz: { name: 'gg-timezones', opts: { us: true, quiet: true, interactive: false } }, a: mcAll(list, yes.map(nm)), hint: 'Find each state on the time-zone map.',
        steps: yes.concat(no).map(function (x) { return nm(x) + ': ' + zName(GG().STATE_TZ[x]) + ' Time.'; }) };
    }
    var it = R.pick(TZ_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'East is ahead; west is behind.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ---- usgeo.time-zone-math (standard time: January, so Arizona and Hawaii need no special rule) */
  Gen('usgeo.time-zone-math', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 3 ? R.pick(['convert', 'flight', 'convert']) : 'convert';
    var pool = L === 3 ? TZC : TZC.filter(function (c) { return c.z !== 'AK' && c.z !== 'H'; }), a, b, d;
    for (var t = 0; t < 50; t++) { a = R.pick(pool); b = R.pick(pool); d = GG().US_TZ[b.z] - GG().US_TZ[a.z]; if (d !== 0 && (L > 1 || Math.abs(d) === 1)) break; }
    var startH = R.int(7, 18), startM = L === 3 ? R.pick([0, 15, 30, 45]) : 0, tA = startH * 60 + startM;
    if (shape === 'convert') {
      var tB = tA + d * 60, wrong = tA - d * 60, dir = d > 0 ? 'east' : 'west', n = Math.abs(d);
      var utc = tA - GG().US_TZ[a.z] * 60;
      return { q: 'In January, it is ' + clock(tA) + ' in ' + a.n + '. What time is it in ' + b.n + '?', viz: { name: 'gg-timezones', opts: { us: true, quiet: true, interactive: false, cities: [tzCity(a, false), tzCity(b, false)], utc: utc, ask: b.n } },
        a: mc(timeChoices(R, tB, wrong), clock(tB)), hint: 'Is ' + b.n + ' east or west of ' + a.n + '? East is later; west is earlier.',
        steps: [a.n + ' uses ' + zName(a.z) + ' Time; ' + b.n + ' uses ' + zName(b.z) + ' Time.', b.n + ' is ' + n + ' zone' + (n > 1 ? 's' : '') + ' ' + dir + '.', (d > 0 ? 'Going east, add ' : 'Going west, subtract ') + n + ' hour' + (n > 1 ? 's' : '') + ': ' + clock(tA) + (d > 0 ? ' + ' : ' − ') + n + ' = ' + clock(tB) + '.'] };
    }
    var dur = R.int(2, 6), arr = tA + dur * 60 + d * 60, wrongF = tA + dur * 60 - d * 60, sameClock = tA + dur * 60;
    var ch = R.shuffle(uniq([clock(arr), clock(wrongF), clock(sameClock), clock(arr + 60)]).slice(0, 4));
    if (ch.indexOf(clock(arr)) < 0) ch[0] = clock(arr);
    return { q: 'A plane leaves ' + a.n + ' at ' + clock(tA) + ' local time and flies ' + dur + ' hours to ' + b.n + '. What time is it in ' + b.n + ' when it lands? (It is January.)', a: mc(ch, clock(arr)),
      hint: 'First add the flight time on ' + a.n + '\'s clock. Then change to ' + b.n + '\'s time zone.',
      steps: ['On ' + a.n + '\'s clock, the plane lands at ' + clock(tA) + ' + ' + dur + ' hours = ' + clock(sameClock) + '.', b.n + ' is ' + Math.abs(d) + ' zone' + (Math.abs(d) > 1 ? 's' : '') + ' ' + (d > 0 ? 'east, so add ' : 'west, so subtract ') + Math.abs(d) + ' hour' + (Math.abs(d) > 1 ? 's' : '') + '.', 'It lands at ' + clock(arr) + ' ' + b.n + ' time.'] };
  });

  /* ---- usgeo.daylight-saving */
  var DST_TF = [
    ['In most states, clocks move ahead one hour in the spring.', true, '"Spring forward": on the second Sunday in March, clocks jump from 2:00 a.m. to 3:00 a.m.'],
    ['Every state changes its clocks for daylight saving time.', false, 'Hawaii and most of Arizona stay on standard time all year.'],
    ['Daylight saving time ends on the first Sunday in November.', true, '"Fall back": clocks move back one hour.'],
    ['In summer, Phoenix and Los Angeles show the same clock time.', true, 'Phoenix stays on Mountain Standard Time, and Los Angeles moves ahead to Pacific Daylight Time; both are 7 hours behind UTC.'],
    ['The Navajo Nation in Arizona does use daylight saving time.', true, 'Most of Arizona does not, but the Navajo Nation, in its northeast, does.']];
  Gen('usgeo.daylight-saving', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['which', 'spring', 'tf'] : L === 2 ? ['summer', 'jump', 'which', 'tf'] : ['summer', 'summer', 'dates', 'tf']);
    if (shape === 'which') {
      var r = R.pick(['Hawaii', 'Arizona']), ch = R.shuffle([r].concat(R.sample(['Texas', 'Florida', 'Alaska', 'California', 'New York'], L === 1 ? 2 : 3)));
      return { q: r === 'Arizona' ? 'Which state does not change its clocks for daylight saving time, except in one part of the state?' : 'Which state never changes its clocks for daylight saving time?', a: mc(ch, r), hint: 'One is hot and sunny in the Southwest; one is in the tropics.',
        steps: ['Hawaii and most of Arizona stay on standard time all year.', r === 'Arizona' ? 'The Navajo Nation in northeastern Arizona does change its clocks.' : 'Near the tropics, the length of the day changes little, so Hawaii keeps the same time all year.'] };
    }
    if (shape === 'spring') {
      var s = R.coin();
      return { q: 'In the ' + (s ? 'spring' : 'fall') + ', when daylight saving time ' + (s ? 'starts' : 'ends') + ', clocks move…', a: mc(['Ahead one hour', 'Back one hour'], s ? 'Ahead one hour' : 'Back one hour', true), hint: 'Spring forward, fall back.',
        steps: ['Remember: "spring forward, fall back."', s ? 'In March, clocks move ahead one hour.' : 'In November, clocks move back one hour.'] };
    }
    if (shape === 'jump') {
      var s2 = R.coin(), right = s2 ? '3:00 a.m.' : '1:00 a.m.';
      return { q: 'Daylight saving time ' + (s2 ? 'starts' : 'ends') + ' at 2:00 a.m. What time do the clocks change to?', a: mc(['1:00 a.m.', '3:00 a.m.', '2:00 p.m.'], right, true), hint: s2 ? 'Spring forward.' : 'Fall back.',
        steps: [s2 ? 'In spring, clocks jump ahead one hour: 2:00 a.m. becomes 3:00 a.m.' : 'In fall, clocks go back one hour: 2:00 a.m. becomes 1:00 a.m.'] };
    }
    if (shape === 'dates') {
      var ch3 = R.shuffle(['The second Sunday in March', 'The first Sunday in March', 'The last Sunday in April', 'January 1']);
      return { q: 'On what day does daylight saving time start in the United States?', a: mc(ch3, 'The second Sunday in March'), hint: 'It is in early spring.', steps: ['Daylight saving time starts on the second Sunday in March and ends on the first Sunday in November.'] };
    }
    // summer and winter clocks for Phoenix and Honolulu against a city that changes
    var fixed = cityBy(R.pick(['Phoenix', 'Honolulu'])), other = cityBy(R.pick(fixed.n === 'Phoenix' ? ['Los Angeles', 'Denver', 'Chicago', 'New York'] : ['Los Angeles', 'Seattle', 'Denver']));
    var summer = L === 3 ? R.coin() : true, t0 = R.int(8, 16) * 60, dd = off(fixed, summer) - off(other, summer), tF = t0 + dd * 60, wrong2 = t0 + (off(fixed, !summer) - off(other, !summer)) * 60;
    var ch4 = uniq([clock(tF), clock(wrong2), clock(tF + 60), clock(tF - 60)]).slice(0, 4);
    return { q: 'In ' + (summer ? 'July' : 'January') + ', it is ' + clock(t0) + ' in ' + other.n + '. What time is it in ' + fixed.n + '?', a: mc(R.shuffle(ch4), clock(tF)),
      hint: fixed.n + ' does not change its clocks. Is it summer or winter?',
      steps: [other.n + ' is ' + Math.abs(GG().US_TZ[other.z]) + ' hours behind UTC in winter' + (summer ? ', and one hour less (' + Math.abs(off(other, true)) + ' hours) in summer, when its clocks move ahead.' : '.'), fixed.n + ' stays ' + Math.abs(off(fixed, false)) + ' hours behind UTC all year.', (dd === 0 ? 'So both cities show the same time: ' : 'The difference is ' + Math.abs(dd) + ' hour' + (Math.abs(dd) > 1 ? 's' : '') + ', so ' + fixed.n + ' shows ') + clock(tF) + '.'] };
  });

  /* ---- usgeo.climate-regions */
  var CREG = [
    { k: 'Cfa', reg: 'the Southeast', d: 'hot, humid summers and mild winters, with rain all year' },
    { k: 'BWh', reg: 'the Southwest deserts', d: 'very hot summers and very little rain' },
    { k: 'Cfb', reg: 'the Pacific Northwest coast', d: 'mild temperatures all year, cool summers and rainy winters' },
    { k: 'Csa', reg: 'coastal California', d: 'dry summers and mild, rainy winters' },
    { k: 'Dfb', reg: 'the northern Midwest and New England', d: 'cold, snowy winters and warm summers' },
    { k: 'BSk', reg: 'the western Great Plains', d: 'a semi-dry grassland with cold winters and hot summers' },
    { k: 'Dfc', reg: 'interior Alaska', d: 'very long, very cold winters and short, cool summers' }];
  var MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function argmaxUnique(a) { var m = Math.max.apply(null, a), i = a.indexOf(m); return a.lastIndexOf(m) === i ? i : -1; }
  var CL_TF = [
    ['The farther south you go, the hotter it always is.', false, 'Height and oceans matter too. Coastal San Francisco has cool summers, and high mountain towns are colder than low places at the same latitude.'],
    ['Hawaii has a tropical climate, warm all year.', true, 'Hawaii is near the tropics and surrounded by warm ocean.'],
    ['Places near the ocean usually have milder temperatures than places far inland.', true, 'Water warms and cools slowly, so coasts have milder summers and winters.'],
    ['Coastal California gets most of its rain in summer.', false, 'Coastal California has dry summers; its rain comes in winter.'],
    ['High places, like Denver in the Rockies, tend to be cooler than low places at the same latitude.', true, 'Air gets colder as you go higher.']];
  Gen('usgeo.climate-regions', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['desc', 'warm', 'tf'] : L === 2 ? ['graph', 'read', 'desc'] : ['graph', 'read', 'dry', 'tf']);
    if (shape === 'desc') {
      var c = R.pick(CREG), ch = R.shuffle([c].concat(R.sample(others(CREG, [c]), L === 1 ? 2 : 3))).map(function (x) { return cap1(x.reg); });
      return { q: 'Which part of the country has ' + c.d + '?', a: mc(ch, cap1(c.reg)), hint: 'Think about how far north it is, how high, and how close to an ocean.', steps: [cap1(c.reg) + ' has ' + c.d + '.'] };
    }
    if (shape === 'warm') {
      return { q: 'Which state is warm all year, with a tropical climate?', a: mc(R.shuffle(['Hawaii', 'Alaska', 'Minnesota']), 'Hawaii'), hint: 'It is an island state near the tropics.', steps: ['Hawaii is near the tropics, surrounded by warm ocean, so it is warm all year.'] };
    }
    if (shape === 'graph') {
      var c2 = R.pick(CREG.slice(0, 6)), ch2 = R.shuffle([c2].concat(R.sample(others(CREG.slice(0, 6), [c2]), 3))).map(function (x) { return cap1(x.reg); });
      return { q: 'The red line shows the temperature in each month, and the blue bars show the rain and snow. Which part of the country has a climate like this?', viz: { name: 'gg-climate', opts: { type: c2.k, units: 'us', quiet: true, interactive: false } },
        a: mc(ch2, cap1(c2.reg)), hint: 'Is it hot or cold in winter? Wet or dry? When does the rain come?', steps: ['This climate has ' + c2.d + '.', 'That fits ' + c2.reg + '.'] };
    }
    if (shape === 'read') {
      var cands = CREG.filter(function (x) { var cl = GG().CLIMATES[x.k]; return argmaxUnique(cl.t) >= 0 || argmaxUnique(cl.p) >= 0; }), c3, what, idx;
      for (var t = 0; t < 30; t++) { c3 = R.pick(cands); what = R.pick(['warmest', 'wettest']); idx = argmaxUnique(GG().CLIMATES[c3.k][what === 'warmest' ? 't' : 'p']); if (idx >= 0) break; }
      var right = MON[idx], wrong = R.sample(MON.filter(function (m) { return m !== right; }), 3);
      return { q: 'Look at this climograph. Which is the ' + what + ' month?', viz: { name: 'gg-climate', opts: { type: c3.k, units: 'us', quiet: true, interactive: false } }, a: mc(R.shuffle([right].concat(wrong)), right),
        hint: what === 'warmest' ? 'Find the highest point of the red line.' : 'Find the tallest blue bar.', steps: [(what === 'warmest' ? 'The red line is highest in ' : 'The tallest blue bar is in ') + right + '.'] };
    }
    if (shape === 'dry') {
      var two = R.shuffle(['Csa', 'Cfa']);
      return { q: 'One of these places has dry summers and wet winters. Which one, A or B?', viz: { name: 'gg-climate', opts: { compare: two, titles: ['A', 'B'], units: 'us', quiet: true, interactive: false } }, a: mc(['A', 'B'], LET[two.indexOf('Csa')], true),
        hint: 'Look at the blue bars in June, July and August.', steps: ['In climograph ' + LET[two.indexOf('Csa')] + ', the summer bars are almost empty and the winter bars are tall.', 'That is a Mediterranean climate, like coastal California\'s.'] };
    }
    var it = R.pick(CL_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'Latitude matters, but so do height and oceans.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ---- usgeo.storms-hazards (where hazards happen; no safety advice) */
  var HZ = [
    { h: 'Hurricanes', where: 'the Gulf and Atlantic coasts', st: ['FL', 'LA', 'TX', 'NC', 'SC', 'AL', 'MS', 'GA'] },
    { h: 'Earthquakes', where: 'Alaska, California and the rest of the West', st: ['AK', 'CA', 'NV', 'WA'] },
    { h: 'Tornadoes', where: 'the central and southern plains and the Southeast', st: ['OK', 'KS', 'NE', 'TX', 'AL', 'MS'] },
    { h: 'Blizzards', where: 'the northern plains and the Northeast', st: ['ND', 'SD', 'MN', 'ME'] },
    { h: 'Wildfires', where: 'the dry West', st: ['CA', 'OR', 'ID', 'MT'] }];
  var HZ_TF = [
    ['Tornadoes happen only in one place called Tornado Alley.', false, 'Tornadoes have been reported in every state. They are most frequent in the central and southern plains and the Southeast.'],
    ['Alaska is the most earthquake-prone state.', true, 'Alaska sits where two great plates of Earth\'s crust meet, so it has more earthquakes than any other state.'],
    ['Hurricanes form over warm ocean water.', true, 'That is why they strike coasts, mostly along the Gulf and the Atlantic.'],
    ['The Atlantic hurricane season runs from June 1 to November 30.', true, 'Most hurricanes come in late summer and early fall.'],
    ['Hurricanes often strike Kansas.', false, 'Hurricanes weaken quickly over land. Kansas is far from the ocean; it gets tornadoes instead.']];
  Gen('usgeo.storms-hazards', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['where', 'quake', 'tf'] : L === 2 ? ['state', 'where', 'tf'] : ['all', 'state', 'tf']);
    var pool = HZ.slice(0, L === 1 ? 3 : 5);
    if (shape === 'where') {
      var hz = R.pick(pool), ch = R.shuffle([hz].concat(R.sample(others(pool, [hz]), 2))).map(function (x) { return cap1(x.where); });
      return { q: hz.h + ' are most common in which part of the country?', a: mc(ch, cap1(hz.where)), hint: 'What does each hazard need: warm ocean, flat land, moving plates, or dry land?', steps: [hz.h + ' are most common in ' + hz.where + '.'] };
    }
    if (shape === 'quake') {
      return { q: 'Which state has the most earthquakes?', a: mc(R.shuffle(['Alaska', 'Florida', 'Kansas']), 'Alaska'), hint: 'Earthquakes happen where plates of Earth\'s crust meet, mostly in the West.', steps: ['The U.S. Geological Survey calls Alaska the most earthquake-prone state.', 'California has many earthquakes too; Florida and North Dakota have the fewest.'] };
    }
    if (shape === 'state') {
      var hz2 = R.pick(pool.slice(0, 3)), st = R.pick(hz2.st.filter(function (s) { return HZ.slice(0, 3).filter(function (h) { return h.st.indexOf(s) >= 0; }).length === 1; })), ch2 = R.shuffle(HZ.slice(0, 3).map(function (x) { return x.h; }));
      return { q: 'Which of these hazards is ' + nm(st) + ' best known for?', viz: usmap({ highlight: [st] }), a: mc(ch2, hz2.h), hint: 'Is the state on a warm coast, on the plains, or in the West?', steps: [nm(st) + ' is in ' + hz2.where + ', where ' + hz2.h.toLowerCase() + ' are common.'] };
    }
    if (shape === 'all') {
      var yes = R.sample(['FL', 'LA', 'TX', 'NC', 'SC'], 2), no = R.sample(['KS', 'NV', 'CO', 'ND', 'IA', 'UT'], 2), list = R.shuffle(yes.concat(no)).map(nm);
      return { q: 'Hurricanes strike coasts on warm oceans. Which of these states are often hit by hurricanes? Choose all that are.', a: mcAll(list, yes.map(nm)), hint: 'Which states are on the Gulf or Atlantic coast?',
        steps: yes.map(function (x) { return nm(x) + ' is on the coast, where hurricanes strike.'; }).concat(no.map(function (x) { return nm(x) + ' is far inland, with no ocean coast.'; })) };
    }
    var it = R.pick(HZ_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'Each hazard has its own kind of place.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ================================================================== Unit 6: People and Places */

  // 2020 Census resident population (Census Bureau 2020 apportionment table) and land area in square miles (Census Bureau state area table)
  var POP = { AL: 5024279, AK: 733391, AZ: 7151502, AR: 3011524, CA: 39538223, CO: 5773714, CT: 3605944, DE: 989948, FL: 21538187, GA: 10711908, HI: 1455271, ID: 1839106, IL: 12812508, IN: 6785528, IA: 3190369, KS: 2937880, KY: 4505836, LA: 4657757, ME: 1362359, MD: 6177224, MA: 7029917, MI: 10077331, MN: 5706494, MS: 2961279, MO: 6154913, MT: 1084225, NE: 1961504, NV: 3104614, NH: 1377529, NJ: 9288994, NM: 2117522, NY: 20201249, NC: 10439388, ND: 779094, OH: 11799448, OK: 3959353, OR: 4237256, PA: 13002700, RI: 1097379, SC: 5118425, SD: 886667, TN: 6910840, TX: 29145505, UT: 3271616, VT: 643077, VA: 8631393, WA: 7705281, WV: 1793716, WI: 5893718, WY: 576851 };
  var LAND = { AL: 50645, AK: 570641, AZ: 113594, AR: 52035, CA: 155779, CO: 103642, CT: 4842, DE: 1949, FL: 53625, GA: 57513, HI: 6423, ID: 82643, IL: 55519, IN: 35826, IA: 55857, KS: 81759, KY: 39486, LA: 43204, ME: 30843, MD: 9707, MA: 7800, MI: 56539, MN: 79627, MS: 46923, MO: 68742, MT: 145546, NE: 76824, NV: 109781, NH: 8953, NJ: 7354, NM: 121298, NY: 47126, NC: 48618, ND: 69001, OH: 40861, OK: 68595, OR: 95988, PA: 44743, RI: 1034, SC: 30061, SD: 75811, TN: 41235, TX: 261232, UT: 82170, VT: 9217, VA: 39490, WA: 66456, WV: 24038, WI: 54158, WY: 97093 };
  var CITY = [ // the largest cities, 2020 Census
    { n: 'New York', st: 'NY', p: 8804190, lon: -74.0, lat: 40.71 }, { n: 'Los Angeles', st: 'CA', p: 3898747, lon: -118.24, lat: 34.05 }, { n: 'Chicago', st: 'IL', p: 2746388, lon: -87.63, lat: 41.88 },
    { n: 'Houston', st: 'TX', p: 2304580, lon: -95.37, lat: 29.76 }, { n: 'Phoenix', st: 'AZ', p: 1608139, lon: -112.07, lat: 33.45, cap: 1 }, { n: 'Philadelphia', st: 'PA', p: 1603797, lon: -75.16, lat: 39.95 },
    { n: 'San Antonio', st: 'TX', p: 1434625, lon: -98.49, lat: 29.42 }, { n: 'San Diego', st: 'CA', p: 1386932, lon: -117.16, lat: 32.72 }, { n: 'Dallas', st: 'TX', p: 1304379, lon: -96.8, lat: 32.78 },
    { n: 'San Jose', st: 'CA', p: 1013240, lon: -121.89, lat: 37.34 }, { n: 'Austin', st: 'TX', p: 961855, lon: -97.74, lat: 30.27, cap: 1 }, { n: 'Jacksonville', st: 'FL', p: 949611, lon: -81.66, lat: 30.33 }];
  var IDS50 = Object.keys(POP);
  function popRank() { return IDS50.slice().sort(function (a, b) { return POP[b] - POP[a]; }); }
  function dens(id) { return POP[id] / LAND[id]; }

  /* ---- usgeo.largest-cities */
  Gen('usgeo.largest-cities', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['largest', 'state', 'state'] : L === 2 ? ['compare', 'capital', 'letter', 'state'] : ['order', 'compare', 'capital', 'letter']);
    if (shape === 'largest') {
      return { q: 'Which is the largest city in the United States?', a: mc(R.shuffle(['New York', 'Los Angeles', 'Chicago']), 'New York'), hint: 'It is on the East Coast.',
        steps: ['New York City had about 8.8 million people in the 2020 Census.', 'That is more than twice as many as Los Angeles, the second largest.'] };
    }
    if (shape === 'state') {
      var c = R.pick(CITY.slice(1)), pool = GG().states().filter(function (s) { return s.id !== c.st; }), w = R.sample(pool, L === 1 ? 2 : 3).map(function (s) { return s.n; });
      return { q: 'In which state is the city of ' + c.n + '?', a: mc(R.shuffle([nm(c.st)].concat(w)), nm(c.st)), hint: 'Picture the city on the map.', steps: [c.n + ' is in ' + nm(c.st) + '.'] };
    }
    if (shape === 'compare') {
      var a, b; for (var t = 0; t < 40; t++) { var two = R.sample(CITY, 2); a = two[0]; b = two[1]; if (Math.abs(a.p - b.p) / Math.max(a.p, b.p) > 0.06) break; }
      var big = a.p > b.p ? a : b, show = L === 3;
      return { q: 'In the 2020 Census, which city had more people: ' + a.n + (show ? ' (' + fmt(a.p) + ')' : '') + ' or ' + b.n + (show ? ' (' + fmt(b.p) + ')' : '') + '?', a: mc([a.n, b.n], big.n, true),
        hint: show ? 'Compare the millions place first, then the hundred thousands.' : 'Think of the list of largest cities: New York, Los Angeles, Chicago, Houston, Phoenix.',
        steps: [a.n + ' had ' + fmt(a.p) + ' people; ' + b.n + ' had ' + fmt(b.p) + '.', big.n + ' had more.'] };
    }
    if (shape === 'capital') {
      var cp = R.pick(CITY.filter(function (x) { return x.cap; })), w2 = R.sample(CITY.filter(function (x) { return !x.cap; }), 3), ch = R.shuffle([cp].concat(w2)).map(function (x) { return x.n; });
      return { q: 'Which of these large cities is also a state capital?', a: mc(ch, cp.n), hint: 'Most big cities are not capitals.',
        steps: [cp.n + ' is the capital of ' + nm(cp.st) + '.'].concat(w2.map(function (x) { return x.n + ' is not; the capital of ' + nm(x.st) + ' is ' + S(x.st).cap + '.'; })) };
    }
    if (shape === 'letter') {
      var set = R.sample(CITY.slice(0, 6), 3); for (var t2 = 0; t2 < 20 && set.some(function (p, i) { return set.some(function (q, j) { return j > i && Math.abs(p.lon - q.lon) + Math.abs(p.lat - q.lat) < 6; }); }); t2++) set = R.sample(CITY.slice(0, 6), 3);
      var want = R.pick(set);
      return { q: 'Which letter marks ' + want.n + '?', viz: usmap({ points: set.map(function (x, i) { return { lon: x.lon, lat: x.lat, mark: LET[i] }; }) }), a: Object.assign(letterQ(set), { v: set.indexOf(want) }),
        hint: 'Find the state first.', steps: [want.n + ' is in ' + nm(want.st) + '.', 'That is letter ' + LET[set.indexOf(want)] + '.'] };
    }
    var three; for (var t3 = 0; t3 < 40; t3++) { three = R.sample(CITY, 3).sort(function (x, y) { return y.p - x.p; }); if ((three[0].p - three[1].p) / three[0].p > 0.06 && (three[1].p - three[2].p) / three[1].p > 0.06) break; }
    var right = three.map(function (x) { return x.n; }).join(', '), opts = uniq([right, [three[2], three[1], three[0]].map(function (x) { return x.n; }).join(', '), [three[1], three[0], three[2]].map(function (x) { return x.n; }).join(', '), [three[0], three[2], three[1]].map(function (x) { return x.n; }).join(', ')]);
    return { q: 'Which list goes from the most people to the fewest (2020 Census)? ' + three.map(function (x) { return x.n + ': ' + fmt(x.p); }).sort().join('; ') + '.', a: mc(R.shuffle(opts), right), hint: 'Compare the largest place values first.',
      steps: three.map(function (x) { return x.n + ' had ' + fmt(x.p) + '.'; }).concat(['From most to fewest: ' + right + '.']) };
  });

  /* ---- usgeo.state-populations */
  Gen('usgeo.state-populations', function (R, ctx) {
    var L = ctx.level || 1, rank = popRank(), shape = R.pick(L === 1 ? ['most', 'fewest', 'alaska'] : L === 2 ? ['compare', 'round', 'alaska', 'most'] : ['top5', 'compare', 'round', 'map']);
    if (shape === 'most') {
      var ch = L === 1 ? R.shuffle(['CA', 'WY', 'VT']) : R.shuffle(['CA', 'TX', 'FL', 'AK']);
      return { q: 'Which of these states had the most people in the 2020 Census?', a: mc(ch.map(nm), 'California'), hint: 'It is on the Pacific coast.', steps: ['California had about 39.5 million people, the most of any state.', 'Texas (about 29.1 million) and Florida (about 21.5 million) came next.'] };
    }
    if (shape === 'fewest') {
      return { q: 'Which state had the fewest people in the 2020 Census?', a: mc(R.shuffle(['Wyoming', 'Texas', 'New York']), 'Wyoming'), hint: 'It is a big, square state in the Mountain West.', steps: ['Wyoming had about 577,000 people, the fewest of any state.'] };
    }
    if (shape === 'alaska') {
      var r = 'No. It has one of the smallest populations.', ch2 = R.shuffle([r, 'Yes. It has the most people.', 'Yes. It is in the top five.']);
      return { q: 'Alaska is the largest state by area. Does it also have one of the largest populations?', a: mc(ch2, r), hint: 'Is most of Alaska crowded or wild?', steps: ['Alaska had about 733,000 people in 2020; only Wyoming, Vermont and the District of Columbia had fewer.', 'A big area does not mean many people.'] };
    }
    if (shape === 'compare') {
      var a, b; for (var t = 0; t < 40; t++) { var two = R.sample(IDS50, 2); a = two[0]; b = two[1]; if (Math.abs(POP[a] - POP[b]) / Math.max(POP[a], POP[b]) > 0.05) break; }
      var more = POP[a] > POP[b] ? a : b;
      return { q: 'In the 2020 Census, ' + nm(a) + ' had ' + fmt(POP[a]) + ' people and ' + nm(b) + ' had ' + fmt(POP[b]) + '. Which state had more?', a: mc([nm(a), nm(b)], nm(more), true), hint: 'Count the digits first. If they match, compare from the left.',
        steps: ['Compare ' + fmt(POP[a]) + ' and ' + fmt(POP[b]) + ' from the left.', nm(more) + ' had more people.'] };
    }
    if (shape === 'round') {
      var s = R.pick(rank.slice(0, 15)), mil = Math.round(POP[s] / 1e6);
      return { q: 'In the 2020 Census, ' + nm(s) + ' had ' + fmt(POP[s]) + ' people. Round that to the nearest million.', a: num(mil * 1e6), hint: 'Look at the hundred-thousands digit.',
        steps: ['The hundred-thousands digit is ' + Math.floor((POP[s] % 1e6) / 1e5) + '.', (Math.floor((POP[s] % 1e6) / 1e5) >= 5 ? 'It is 5 or more, so round up' : 'It is less than 5, so round down') + ': ' + fmt(mil * 1e6) + '.'] };
    }
    if (shape === 'top5') {
      var yes = R.sample(rank.slice(0, 5), 2), no = R.sample(rank.slice(8, 50), 2), list = R.shuffle(yes.concat(no)).map(nm);
      return { q: 'Which of these were among the five states with the most people in 2020? Choose all that were.', a: mcAll(list, yes.map(nm)), hint: 'The top five: California, Texas, Florida, New York, Pennsylvania.',
        steps: ['The five most populous states in 2020 were California, Texas, Florida, New York and Pennsylvania.'] };
    }
    var data = {}; IDS50.forEach(function (id) { data[id] = Math.round(POP[id] / 1e5) / 10; });
    var trio; for (var t2 = 0; t2 < 40; t2++) { trio = R.sample(IDS50.filter(function (x) { return ['AK', 'HI', 'RI', 'DE', 'CT', 'NJ', 'MD', 'MA', 'VT', 'NH'].indexOf(x) < 0; }), 3); var cls = trio.map(function (x) { var v = data[x]; return v < 1 ? 0 : v < 5 ? 1 : v < 10 ? 2 : v < 20 ? 3 : 4; }); if (uniq(cls).length === 3) break; }
    var top = trio.slice().sort(function (x, y) { return POP[y] - POP[x]; })[0];
    return { q: 'This map shows how many people each state had in 2020; the key tells what each color means. Which lettered state had the most people?', viz: usmap({ data: data, breaks: [1, 5, 10, 20], legend: 'People (millions, 2020)', mark: lettersFor(trio) }),
      a: Object.assign(letterQ(trio), { v: trio.indexOf(top) }), hint: 'Match each lettered state\'s color to the key.', steps: trio.map(function (x) { return 'Letter ' + LET[trio.indexOf(x)] + ' is ' + nm(x) + ', with about ' + data[x] + ' million people.'; }).concat(['The one in the highest group of the key is ' + nm(top) + '.']) };
  });

  /* ---- usgeo.population-density-us */
  function round2sf(n) { var p = Math.pow(10, Math.floor(Math.log10(n)) - 1); return Math.round(n / p) * p; }
  Gen('usgeo.population-density-us', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['most', 'least', 'meaning'] : L === 2 ? ['compute', 'compute', 'most', 'meaning'] : ['compute', 'trap', 'compare']);
    if (shape === 'most') {
      return { q: 'Which state is the most crowded, with the most people per square mile?', a: mc(R.shuffle(L === 1 ? ['New Jersey', 'Alaska', 'Texas'] : ['New Jersey', 'California', 'Texas', 'Alaska']), 'New Jersey'), hint: 'A small state between New York City and Philadelphia.',
        steps: ['New Jersey had about 1,263 people per square mile in 2020, the most of any state.', 'California has more people in all, but it is much bigger, so it is less crowded.'] };
    }
    if (shape === 'least') {
      return { q: 'Which state is the least crowded, with the fewest people per square mile?', a: mc(R.shuffle(['Alaska', 'New Jersey', 'Ohio']), 'Alaska'), hint: 'The largest state.', steps: ['Alaska had about 1.3 people per square mile in 2020, the fewest of any state.'] };
    }
    if (shape === 'meaning') {
      var r = 'The number of people for each square mile of land', ch = R.shuffle([r, 'The total number of people in a state', 'The number of square miles in a state']);
      return { q: 'What does population density measure?', a: mc(ch, r), hint: 'Density compares people with land.', steps: ['Population density = people ÷ land area.', 'It tells how crowded a place is: how many people for each square mile.'] };
    }
    if (shape === 'compute') {
      var s = R.pick(IDS50.filter(function (x) { return x !== 'AK'; })), p = round2sf(POP[s]), A = round2sf(LAND[s]), d = p / A, dr = Math.round(d);
      return { q: nm(s) + ' had about ' + fmt(p) + ' people on about ' + fmt(A) + ' square miles of land. What was its population density? Round to the nearest whole number.', a: num(dr, { unit: 'people per square mile', rtol: 0.02 }),
        hint: 'Density = people ÷ square miles.', steps: ['Density = people ÷ land area.', '$' + fmt(p).replace(/,/g, '{,}') + ' \\div ' + fmt(A).replace(/,/g, '{,}') + ' \\approx ' + fmt(dr).replace(/,/g, '{,}') + '$', 'About ' + fmt(dr) + ' people per square mile.'] };
    }
    var a, b; for (var t = 0; t < 60; t++) { var two = R.sample(IDS50, 2); a = two[0]; b = two[1]; if ((POP[a] - POP[b]) * (dens(a) - dens(b)) < 0 && Math.abs(dens(a) - dens(b)) / Math.max(dens(a), dens(b)) > 0.15) break; }
    var crowd = dens(a) > dens(b) ? a : b, other = crowd === a ? b : a;
    if (shape === 'trap') {
      return { q: nm(other) + ' has more people than ' + nm(crowd) + '. Which state is more crowded (has the higher population density)?', a: mc([nm(a), nm(b)], nm(crowd), true), hint: 'Divide people by land area for each state.',
        steps: [nm(other) + ': about ' + fmt(round2sf(POP[other])) + ' people on ' + fmt(LAND[other]) + ' square miles, about ' + fmt(Math.round(dens(other))) + ' per square mile.', nm(crowd) + ': about ' + fmt(round2sf(POP[crowd])) + ' people on ' + fmt(LAND[crowd]) + ' square miles, about ' + fmt(Math.round(dens(crowd))) + ' per square mile.', nm(crowd) + ' has fewer people but much less land, so it is more crowded.'] };
    }
    return { q: 'Which is more crowded? ' + nm(a) + ': ' + fmt(round2sf(POP[a])) + ' people on ' + fmt(round2sf(LAND[a])) + ' square miles. ' + nm(b) + ': ' + fmt(round2sf(POP[b])) + ' people on ' + fmt(round2sf(LAND[b])) + ' square miles.', a: mc([nm(a), nm(b)], (round2sf(POP[a]) / round2sf(LAND[a]) > round2sf(POP[b]) / round2sf(LAND[b])) ? nm(a) : nm(b), true),
      hint: 'Divide people by square miles for each state, then compare.', steps: [nm(a) + ': ' + fmt(round2sf(POP[a])) + ' ÷ ' + fmt(round2sf(LAND[a])) + ' ≈ ' + fmt(Math.round(round2sf(POP[a]) / round2sf(LAND[a]))) + ' per square mile.', nm(b) + ': ' + fmt(round2sf(POP[b])) + ' ÷ ' + fmt(round2sf(LAND[b])) + ' ≈ ' + fmt(Math.round(round2sf(POP[b]) / round2sf(LAND[b]))) + ' per square mile.', 'The larger number is the more crowded state.'] };
  });

  /* ---- usgeo.farms-resources */
  var CROPS = [
    { c: 'Corn', st: ['IA', 'IL'], why: 'warm, wet summers and deep, rich soil in the Central Lowland' },
    { c: 'Wheat', st: ['KS', 'ND'], why: 'the drier Great Plains, where wheat grows better than corn' },
    { c: 'Cotton', st: ['TX'], why: 'long, hot summers' },
    { c: 'Potatoes', st: ['ID'], why: 'rich volcanic soil, cool nights and water from the Snake River' },
    { c: 'Fruits, nuts and vegetables', st: ['CA'], why: 'a long growing season and water brought to the Central Valley' },
    { c: 'Apples', st: ['WA'], why: 'sunny, dry valleys east of the Cascades, watered by rivers' },
    { c: 'Oranges and other citrus', st: ['FL'], why: 'mild winters without hard freezes' },
    { c: 'Peanuts', st: ['GA'], why: 'warm summers and sandy soil' },
    { c: 'Maple syrup', st: ['VT'], why: 'sugar maple forests and cold nights with warm days in early spring' },
    { c: 'Milk and cheese', st: ['WI'], why: 'grassy, rolling farmland good for dairy cows' }];
  var FARM_TF = [
    ['One state grows almost everything the country eats.', false, 'Crops follow climate and soil, so different states grow different things.'],
    ['Oranges need mild winters without hard freezes.', true, 'That is why citrus grows in Florida, California, Texas and Arizona.'],
    ['Wheat grows well on the drier Great Plains.', true, 'Wheat needs less rain than corn.'],
    ['Corn grows best where summers are cold and dry.', false, 'Corn needs warm, wet summers, like those of Iowa and Illinois.']];
  Gen('usgeo.farms-resources', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['leader', 'leader', 'tf'] : L === 2 ? ['crop', 'leader', 'why'] : ['all', 'crop', 'why', 'tf']);
    var cr = R.pick(CROPS);
    if (shape === 'leader') {
      var right = nm(R.pick(cr.st)), pool = CROPS.filter(function (x) { return x !== cr; }).map(function (x) { return x.st[0]; }), w = R.sample(pool, L === 1 ? 2 : 3).map(nm);
      return { q: 'Which state is a leader in growing or making ' + cr.c.toLowerCase() + '?', a: mc(R.shuffle([right].concat(w)), right), hint: 'What climate does it need?',
        steps: [cr.c + ' needs ' + cr.why + '.', cr.st.map(nm).join(' and ') + (cr.st.length > 1 ? ' are leaders.' : ' is a leader.')] };
    }
    if (shape === 'crop') {
      var st = cr.st[0], w2 = R.sample(CROPS.filter(function (x) { return x !== cr; }), 3).map(function (x) { return x.c; }), ch = R.shuffle([cr.c].concat(w2));
      return { q: 'The highlighted state is ' + nm(st) + '. It is a leader in which of these?', viz: usmap({ highlight: [st] }), a: mc(ch, cr.c), hint: 'Think about its climate and land.', steps: [nm(st) + ' has ' + cr.why + '.', 'It is a leader in ' + cr.c.toLowerCase() + '.'] };
    }
    if (shape === 'why') {
      var w3 = R.sample(CROPS.filter(function (x) { return x !== cr; }), 2).map(function (x) { return cap1(x.why); }), ch2 = R.shuffle([cap1(cr.why)].concat(w3));
      return { q: cr.st.map(nm).join(' and ') + (cr.st.length > 1 ? ' are' : ' is') + ' a leader in ' + cr.c.toLowerCase() + '. Which reason fits best?', a: mc(ch2, cap1(cr.why)), hint: 'Match the crop to the climate it needs.', steps: [cr.c + ': ' + cr.why + '.'] };
    }
    if (shape === 'all') {
      var two = R.pick([CROPS[0], CROPS[1]]), yes = two.st, no = R.sample(['FL', 'ME', 'NV', 'AZ', 'VT', 'HI'], 2), list = R.shuffle(yes.concat(no)).map(nm);
      return { q: 'Which states are leaders in ' + two.c.toLowerCase() + '? Choose all that are.', a: mcAll(list, yes.map(nm)), hint: two.c === 'Corn' ? 'The Corn Belt is in the Midwest.' : 'Wheat grows on the Great Plains.',
        steps: [yes.map(nm).join(' and ') + ' are leaders in ' + two.c.toLowerCase() + ' (which one is first can change from year to year).', two.c + ' needs ' + two.why + '.'] };
    }
    var it = R.pick(FARM_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'Crops follow climate and soil.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ================================================================== Unit 7: How the Country Grew */

  var ORIG = GG().states().filter(function (s) { return s.ord <= 13; }).map(function (s) { return s.id; });
  var NOT_ORIG = ['VT', 'ME', 'WV', 'KY', 'FL', 'OH', 'TN', 'AL'];
  function yr(id) { return +S(id).date.slice(0, 4); }
  /* ---- usgeo.first-thirteen */
  var F13_TF = [
    ['Delaware was the first state to approve the Constitution.', true, 'Delaware approved it on December 7, 1787.'],
    ['Vermont was one of the thirteen original states.', false, 'Vermont joined later, in 1791, as the 14th state.'],
    ['Maine was one of the thirteen original states.', false, 'Maine was part of Massachusetts until it became a state in 1820.'],
    ['All thirteen original states were along the Atlantic coast.', true, 'They grew from the colonies along the Atlantic.'],
    ['Rhode Island was the last of the thirteen to approve the Constitution.', true, 'Rhode Island approved it in 1790.'],
    ['West Virginia was one of the thirteen original states.', false, 'West Virginia split from Virginia and became a state in 1863.']];
  Gen('usgeo.first-thirteen', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['which', 'first', 'tf'] : L === 2 ? ['which', 'letter', 'tf'] : ['all', 'letter', 'count', 'tf']);
    if (shape === 'which') {
      var r = R.pick(ORIG), w = R.sample(L === 1 ? ['CA', 'TX', 'CO', 'OR', 'NE'] : NOT_ORIG, L === 1 ? 2 : 3), ch = R.shuffle([r].concat(w)).map(nm);
      return { q: 'Which of these was one of the thirteen original states?', a: mc(ch, nm(r)), hint: 'The first thirteen were all along the Atlantic coast.',
        steps: [nm(r) + ' was one of the thirteen; it approved the Constitution in ' + yr(r) + '.'].concat(w.map(function (x) { return nm(x) + ' became a state in ' + yr(x) + '.'; })) };
    }
    if (shape === 'first') {
      return { q: 'Which state was the first to approve the Constitution, in 1787?', a: mc(R.shuffle(['Delaware', 'Virginia', 'New York']), 'Delaware'), hint: 'It is called "the First State".', steps: ['Delaware approved the Constitution on December 7, 1787, so it is called "the First State".'] };
    }
    if (shape === 'letter') {
      var r2 = R.pick(ORIG.filter(function (x) { return SMALL.indexOf(x) < 0; })), w2 = R.sample(['VT', 'WV', 'KY', 'TN', 'OH', 'ME'].filter(function (x) { return SMALL.indexOf(x) < 0; }), 2), set = R.shuffle([r2].concat(w2));
      return { q: 'Which lettered state was one of the thirteen original states?', viz: usmap({ region: uniq(ORIG.concat(['VT', 'ME', 'WV', 'KY', 'TN', 'OH'])), mark: lettersFor(set) }), a: Object.assign(letterQ(set), { v: set.indexOf(r2) }),
        hint: 'The thirteen touched the Atlantic Ocean (or, for Pennsylvania, its bays and rivers).', steps: ['Letter ' + LET[set.indexOf(r2)] + ' is ' + nm(r2) + ', one of the thirteen.'].concat(w2.map(function (x) { return nm(x) + ' joined later, in ' + yr(x) + '.'; })) };
    }
    if (shape === 'all') {
      var yes = R.sample(ORIG, 2), no = R.sample(NOT_ORIG, 2), list = R.shuffle(yes.concat(no)).map(nm);
      return { q: 'Which of these were among the thirteen original states? Choose all that were.', a: mcAll(list, yes.map(nm)), hint: 'Vermont, Maine and West Virginia were once parts of other states or claims, and joined later.',
        steps: yes.map(function (x) { return nm(x) + ' was one of the thirteen (' + yr(x) + ').'; }).concat(no.map(function (x) { return nm(x) + ' joined later, in ' + yr(x) + '.'; })) };
    }
    if (shape === 'count') {
      var reg = R.pick(['ne', 's']), n = ORIG.filter(function (x) { return S(x).reg === reg; }).length;
      return { q: 'How many of the thirteen original states are in the Census Bureau\'s ' + regName(reg) + ' region today?', viz: usmap({ region: ORIG, highlight: ORIG }), a: num(n),
        hint: 'Northeast: New England, New York, New Jersey and Pennsylvania. The rest are in the South.', steps: ['In the ' + regName(reg) + ': ' + ORIG.filter(function (x) { return S(x).reg === reg; }).map(nm).join(', ') + '.', 'That is ' + n + ' states.'] };
    }
    var it = R.pick(F13_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'The thirteen grew from the colonies along the Atlantic.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ---- usgeo.growth-of-the-us */
  var ADDS = [
    { n: 'the Louisiana Purchase', y: 1803, from: 'France', how: 'bought from France', st: ['MO', 'IA', 'AR', 'NE', 'SD'] },
    { n: 'Florida', y: 1819, from: 'Spain', how: 'gained from Spain by treaty', st: ['FL'] },
    { n: 'Texas', y: 1845, from: 'the Republic of Texas', how: 'annexed (joined) when the Republic of Texas agreed to join', st: ['TX'] },
    { n: 'the Oregon Country', y: 1846, from: 'Britain', how: 'divided with Britain by treaty', st: ['WA', 'OR', 'ID'] },
    { n: 'the Mexican Cession', y: 1848, from: 'Mexico', how: 'given up by Mexico in the treaty that ended the U.S.-Mexican War', st: ['CA', 'NV', 'UT'] },
    { n: 'Alaska', y: 1867, from: 'Russia', how: 'bought from Russia', st: ['AK'] },
    { n: 'Hawaii', y: 1898, from: 'the Republic of Hawaii', how: 'annexed', st: ['HI'] }];
  var GROW_TF = [
    ['Alaska became part of the United States before Washington became a state.', true, 'The United States bought Alaska in 1867; Washington became a state in 1889.'],
    ['The country grew one thin strip at a time, always from east to west.', false, 'It grew in big pieces, by purchases, treaties, annexations and a war.'],
    ['The Louisiana Purchase about doubled the size of the country.', true, 'In 1803 it added a huge area west of the Mississippi River.'],
    ['The Gadsden Purchase (1853) added land in southern Arizona and New Mexico.', true, 'It was bought from Mexico for a railroad route.'],
    ['Alaska was bought from Canada.', false, 'Alaska was bought from Russia in 1867.']];
  Gen('usgeo.growth-of-the-us', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['year', 'from', 'tf'] : L === 2 ? ['state', 'from', 'year'] : ['order', 'state', 'tf', 'years']);
    var ad = R.pick(ADDS);
    if (shape === 'year') {
      var yrs = [ad.y]; ADDS.forEach(function (x) { if (Math.abs(x.y - ad.y) >= (L === 1 ? 20 : 5) && yrs.indexOf(x.y) < 0) yrs.push(x.y); });
      var ch = R.shuffle([ad.y].concat(R.sample(yrs.slice(1), 2))).map(String);
      return { q: 'In what year was ' + ad.n + ' added to the United States?', a: mc(ch, String(ad.y)), hint: 'The Louisiana Purchase came first (1803); Hawaii came last (1898).',
        steps: [cap1(ad.n) + ' was ' + ad.how + ' in ' + ad.y + '.'] };
    }
    if (shape === 'from') {
      var choose = ADDS.filter(function (x) { return ['France', 'Spain', 'Britain', 'Mexico', 'Russia'].indexOf(x.from) >= 0; }), a2 = R.pick(choose), ch2 = R.shuffle([a2.from].concat(R.sample(['France', 'Spain', 'Britain', 'Mexico', 'Russia'].filter(function (x) { return x !== a2.from; }), L === 1 ? 2 : 3)));
      return { q: 'From which country did the United States gain ' + a2.n + '?', a: mc(ch2, a2.from), hint: 'Think about who held the land before.', steps: [cap1(a2.n) + ' was ' + a2.how + ' in ' + a2.y + '.'] };
    }
    if (shape === 'state') {
      var a3 = R.pick(ADDS.filter(function (x) { return x.st.length > 1 || L === 3; })), right = nm(R.pick(a3.st));
      var pool = []; ADDS.forEach(function (x) { if (x !== a3) pool = pool.concat(x.st); }); pool = pool.concat(['VA', 'PA', 'GA', 'NY']); if (a3.y === 1803) pool = others(pool, ['TX']);
      var ch3 = R.shuffle([right].concat(R.sample(pool, 3).map(nm)));
      return { q: 'Which present-day state was made from land of ' + a3.n + ' (' + a3.y + ')?', a: mc(ch3, right), hint: a3.n === 'the Louisiana Purchase' ? 'It is in the middle of the country, west of the Mississippi.' : 'Where was this land?',
        steps: [cap1(a3.n) + ' became all or part of states such as ' + a3.st.map(nm).join(', ').replace(/, ([^,]*)$/, ' and $1') + '.'] };
    }
    if (shape === 'order') {
      var three = R.sample(ADDS, 3).sort(function (x, y) { return x.y - y.y; }), right4 = three.map(function (x) { return cap1(x.n); }).join(', ');
      var opts = uniq([right4, [three[2], three[1], three[0]].map(function (x) { return cap1(x.n); }).join(', '), [three[1], three[0], three[2]].map(function (x) { return cap1(x.n); }).join(', '), [three[0], three[2], three[1]].map(function (x) { return cap1(x.n); }).join(', ')]);
      return { q: 'Which list puts these additions in order, from earliest to latest?', a: mc(R.shuffle(opts), right4), hint: 'Louisiana Purchase 1803, Florida 1819, Texas 1845, Oregon 1846, Mexican Cession 1848, Alaska 1867, Hawaii 1898.',
        steps: three.map(function (x) { return cap1(x.n) + ': ' + x.y + '.'; }) };
    }
    if (shape === 'years') {
      var p = R.sample(ADDS, 2).sort(function (x, y) { return x.y - y.y; });
      return { q: cap1(p[0].n) + ' was added in ' + p[0].y + ', and ' + p[1].n + ' in ' + p[1].y + '. How many years apart were they?', a: num(p[1].y - p[0].y, { unit: 'years' }), hint: 'Subtract the earlier year from the later one.',
        steps: ['$' + p[1].y + ' - ' + p[0].y + ' = ' + (p[1].y - p[0].y) + '$', 'They were ' + (p[1].y - p[0].y) + ' years apart.'] };
    }
    var it = R.pick(GROW_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'The country grew in big pieces, in different ways.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });

  /* ---- usgeo.statehood-order */
  var ALLST = GG().states().map(function (s) { return s.id; });
  var Y1890 = ['ND', 'SD', 'MT', 'WA', 'ID', 'WY'];
  var SO_TF = [
    ['Hawaii was the last state to join.', true, 'Hawaii became the 50th state in August 1959.'],
    ['States joined in order from east to west, one after another.', false, 'Not quite: Texas (1845) and California (1850) joined decades before nearby states such as Arizona (1912), and Alaska and Hawaii came last.'],
    ['California became a state before Nevada, Utah and Arizona.', true, 'California joined in 1850; Nevada in 1864, Utah in 1896 and Arizona in 1912.'],
    ['Alaska and Hawaii both became states in 1959.', true, 'Alaska in January and Hawaii in August.'],
    ['Six states joined in 1889 and 1890.', true, 'North Dakota, South Dakota, Montana and Washington in 1889; Idaho and Wyoming in 1890.']];
  Gen('usgeo.statehood-order', function (R, ctx) {
    var L = ctx.level || 1, shape = R.pick(L === 1 ? ['firstlast', 'year', 'tf'] : L === 2 ? ['which', 'order', 'year'] : ['order', 'gap', 'all', 'tf']);
    if (shape === 'firstlast') {
      var f = R.coin();
      return { q: 'Which state was the ' + (f ? 'first' : 'last') + ' to join the Union?', a: mc(R.shuffle(['Delaware', 'Hawaii', 'Texas']), f ? 'Delaware' : 'Hawaii'), hint: f ? 'It approved the Constitution in 1787.' : 'It joined in 1959.',
        steps: [f ? 'Delaware was first, in 1787.' : 'Hawaii was last, the 50th state, in 1959.'] };
    }
    if (shape === 'year') {
      var s = R.pick(ALLST), y = yr(s), cand = uniq(ALLST.map(yr)).filter(function (x) { return Math.abs(x - y) >= (L === 1 ? 30 : 12); });
      var ch = R.shuffle([y].concat(R.sample(cand, 2))).map(String);
      return { q: 'In what year did ' + nm(s) + ' become a state?', viz: usmap({ highlight: [s] }), a: mc(ch, String(y)), hint: 'Eastern states mostly joined early; western states later.',
        steps: [nm(s) + ' became ' + (S(s).ord <= 13 ? 'one of the first thirteen states by approving the Constitution' : 'a state') + ' in ' + y + '.'] };
    }
    if (shape === 'which') {
      var a, b; for (var t = 0; t < 40; t++) { var two = R.sample(ALLST, 2); a = two[0]; b = two[1]; if (Math.abs(yr(a) - yr(b)) >= 25) break; }
      var first = yr(a) < yr(b) ? a : b;
      return { q: 'Which became a state first: ' + nm(a) + ' or ' + nm(b) + '?', a: mc([nm(a), nm(b)], nm(first), true), hint: 'Think about where each state is and how the country grew.',
        steps: [nm(a) + ' joined in ' + yr(a) + '; ' + nm(b) + ' in ' + yr(b) + '.', nm(first) + ' came first.'] };
    }
    if (shape === 'order') {
      var three; for (var t2 = 0; t2 < 40; t2++) { three = R.sample(ALLST, 3).sort(function (x, y) { return S(x).ord - S(y).ord; }); if (yr(three[1]) - yr(three[0]) >= 5 && yr(three[2]) - yr(three[1]) >= 5) break; }
      var right = three.map(nm).join(', '), opts = uniq([right, [three[2], three[1], three[0]].map(nm).join(', '), [three[1], three[0], three[2]].map(nm).join(', '), [three[0], three[2], three[1]].map(nm).join(', ')]);
      return { q: 'Put these states in the order they joined, earliest first: ' + three.slice().sort().map(function (x) { return nm(x) + ' (' + yr(x) + ')'; }).join(', ') + '.', a: mc(R.shuffle(opts), right),
        hint: 'Order the years from smallest to largest.', steps: ['Order the years: ' + three.map(yr).join(', ') + '.', 'So the order is ' + right + '.'] };
    }
    if (shape === 'gap') {
      var g = R.pick([['DE', 'HI'], ['PA', 'CA'], ['VA', 'TX'], ['OH', 'OK'], ['KY', 'AZ'], ['CA', 'AK']]);
      return { q: nm(g[0]) + ' became a state in ' + yr(g[0]) + ', and ' + nm(g[1]) + ' in ' + yr(g[1]) + '. How many years apart was that?', a: num(yr(g[1]) - yr(g[0]), { unit: 'years' }), hint: 'Subtract the earlier year from the later year.',
        steps: ['$' + yr(g[1]) + ' - ' + yr(g[0]) + ' = ' + (yr(g[1]) - yr(g[0])) + '$'] };
    }
    if (shape === 'all') {
      var yes = R.sample(Y1890, 2), no = R.sample(['TX', 'CA', 'OR', 'NV', 'UT', 'AZ', 'NM', 'CO', 'KS'], 2), list = R.shuffle(yes.concat(no)).map(nm);
      return { q: 'Which of these states joined in 1889 or 1890? Choose all that did.', a: mcAll(list, yes.map(nm)), hint: 'Six northern Western states joined in those two years.',
        steps: yes.concat(no).map(function (x) { return nm(x) + ': ' + yr(x) + '.'; }) };
    }
    var it = R.pick(SO_TF);
    return { q: 'True or false? ' + it[0], a: tf(it[1]), hint: 'The country did not grow neatly from east to west.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
  });
})(window.MathLadder);
