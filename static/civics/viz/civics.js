/* American History & Civics Ladder: the shared visual kit (names prefixed cv-) and a model (MathLadder.civics), on window.MathLadder.
   Load order: math/viz/core.js (+ viz.css), then this file (+ civics/viz/civics.css). History & Civics topic pages always load
   this file, and practice pages load it with the course (MathLadder.loadCourse), so generators may call MathLadder.civics.
   The model also runs in node: global.window = global; require('…/civics.js').
   Vanilla JS, no libraries, no network. Every drawing is original SVG made here. The map outlines are simplified from
   well-known coordinates (coasts, rivers, parallels) and drawn on an Albers equal-area projection; boundaries are approximate
   and the pictures say so. Source parts: /tmp/work_civics/src/*.js (build: /tmp/work_civics/build.sh). Conventions and the
   content rules for course builders: /tmp/work_civics/overview.md.

   Embed:  <div class="ml-viz" data-viz="cv-timeline" data-opts='{"tags":["revolution"]}'></div>

   COMMON OPTIONS (every visual)
     quiet: true (alias readout: false)  hide everything that could give a problem's answer away: names that are asked about,
                  verdicts, notes, Check buttons. Asked-about items show "?" or letters (A, B, C…).
     interactive: false   a still picture.   task: a line above the visual.   caption: HTML under it.   label: aria-label.
     big: true    large text for young learners.   readme: 'a note for the grown-up' (shown above with a "Read to me" tag).

   THE VISUALS AND THEIR OPTIONS
   cv-timeline   events on a time line. events: [model event ids or { year, end?, label, id? }]; or pick from the model with
                 tags: ['revolution', …] and/or from, to (years); eras: 'apush' | 'young' | false (colored bands); highlight:
                 [ids]; ask: id (that event's label shows "?") ; askYear: id (its year shows "?"); letters: true (labels become
                 A, B, C… in time order: "Which letter marks…?"); mode: 'show' | 'place' (cards to drop on numbered marks, Check);
                 zoom: true (+ / − and drag to pan on wide screens). Wide screens draw a horizontal line with stacked labels;
                 narrow screens draw a vertical list with a spine. quiet: no Check, no notes.
   cv-map        mode: 'states' (tile map, one square per state) | 'colonies' (the thirteen, by region) | 'growth' (states by
                 year: slider, or year: 1850) | 'territory' (how the land was acquired, a simplified geographic map) |
                 'places' (markers and trails on the geographic map) | 'circuits' (federal judicial circuits, tile map).
                 color: 'region' | 'admitted' | 'ev' | 'none' (tile modes); highlight: ['TX', …]; ask: 'TX' (that tile shows
                 "?") ; values: { TX: '40' } (text on tiles); labels: false; pick: true with target: 'TX' (tap a state, Check).
                 territory: show: [acquisition keys] (default all), ask: key ("?" label), year: 1850 (only what was acquired by
                 then). places: places: [place keys], trails: ['oregon' | 'lewisclark' | 'tears'], numbered: true (markers
                 numbered instead of named), ask: key. quiet: no names on asked items, no Check.
   cv-flag       the U.S. flag. year: 1777 … 2026 (the flag in use on July 5 of that year) or stars: n with stripes: 13;
                 count: 'stripes' | 'stars' (numbers the stripes or highlights the stars); labels: true (what they stand for);
                 compare: [1777, 1960] (two or three flags side by side). quiet: no counts or labels.
   cv-picture    original pictures for young learners. items: ['flag', 'eagle', …] (MathLadder.civics.PICTURES lists the
                 keys and their captions) or [{ key, caption }]; mode: 'show' | 'pick' (tap the right one: answer: key; Check)
                 ; size: 'big' | 'small'. quiet: no captions (letters A, B, C instead).
   cv-branches   the three branches and the checks between them. checks: 'all' | [check ids] (MathLadder.civics.CHECKS);
                 simple: true (young learners: three boxes in plain words); highlight: check id; ask: 'legislative' |
                 'executive' | 'judicial' (that box shows "?"); mode: 'show' (tap a check) | 'which' (power: text; learners tap
                 the branch that holds it; answer: branch key; Check). quiet: no notes, no names on the asked box.
   cv-bill       how a bill becomes a law. start: 'house' | 'senate'; path: 'sign' | 'override' | 'sustained' | 'unsigned' |
                 'pocket'; mode: 'steps' (Back / Next) | 'show' (the whole flow) | 'choose' (learners pick at each fork);
                 ask: step key ("?"); letters: true (steps lettered, shuffled order shown in quiet mode for ordering questions).
   cv-court      the court system. show: 'both' | 'federal' | 'state'; path: ['district', 'appeals', 'supreme'] (a case's route,
                 drawn as arrows); highlight: [court keys]; ask: court key; mode: 'show' | 'binding' (from: court key: which
                 courts must follow its decisions) | 'circuits' (the thirteen courts of appeals on a tile map; ask: 'TX').
   cv-amend      amending the Constitution. mode: 'process' (the two ways to propose and to ratify, with vote counts: 290 of
                 435, 67 of 100, 34 and 38 states; pick a route) | 'ratify' (a tile map and a slider: how many states have
                 ratified) | 'list' (the 27 amendments by year; highlight: [numbers]; ask: number). quiet: no counts on asked items.
   cv-ec         the Electoral College. mode: 'calc' (tap states to give them to A or B; totals and the 270 line) | 'show'
                 (electoral votes on the tile map) | 'seats' (House seats) | 'results' (election: 1800 | 1824 | 1860 | 1876 |
                 2000: the totals as bars). assign: { CA: 'A', TX: 'B' }; names: ['Candidate A', 'Candidate B'].
                 quiet: no totals.
   cv-doc        a primary-source reader. doc: model document key (MathLadder.civics.DOCS) or { title, source, paras: [] };
                 marks: [{ text: 'exact phrase', note: 'what it means' }] (tap to read the note); mode: 'show' | 'find'
                 (learners tap the phrase that answers task; answer: index into marks; Check). quiet: marks lettered A, B, C…
                 without notes.
   cv-case       a case brief card. id: model case key (MathLadder.civics.CASES) or fields { name, year, cite, vote, facts,
                 q, holding, reasoning, dissent, later }; mode: 'card' | 'brief' (reveal Facts, Issue, Holding, Reasoning in
                 turn) | 'irac'; hide: ['name', 'holding', 'year', 'vote'] (those show "?"). quiet: hide defaults to name.
   cv-scrutiny   the levels of scrutiny. mode: 'tree' (choose what the law classifies or burdens; see the tier) | 'tiers'
                 (the three tiers side by side); pick: classification key (MathLadder.civics.SCRUTINY.classes); ask: tier
                 key ("?"). quiet: no answer for the asked item.
   cv-clause     a Constitution navigator. open: 'I' | 'II' | … | 'amend'; highlight: 'I.8.3' (article.section.clause);
                 search: true. quiet: the highlighted clause's name and summary are hidden.
   cv-sort       sort cards into groups. bins: ['National', 'Shared', 'State']; cards: [{ text, bin, why }] or strings with
                 bin given by index list answer; shuffle: true; reveal: true (Show me). Tap a card, then a group; keyboard:
                 focus a card and press the group's number. quiet: no Check.
   cv-order      put items in order. items: ['…'] in the right order; start: [indexes] (the order shown first). Tap two to
                 swap, or use ▲ ▼; Check. quiet: lettered A, B, C… with no controls.

   THE MODEL: MathLadder.civics (pure data and functions; no DOM; works in node)
     STATES [{ ab, name, capital, admitted: 'YYYY-MM-DD', order, ev, seats, region, r, c }] and state(ab); EV_TOTAL 538;
     COLONIES [{ ab, name, region, founded }]; ACQ [{ key, name, year, from, how }]; PLACES { key: { name, lon, lat } };
     TRAILS; PRESIDENTS [{ n, name, from, to, party }]; ARTICLES (sections and clauses); clause('I.8.3'); AMENDMENTS
     [{ n, year, proposed, title, text }]; CASES { key: { name, year, cite?, vote?, clause, area, q, holding, later? } };
     EVENTS [{ id, year, end?, label, tags, kid? }]; ERAS { apush: [...], young: [...] }; HOLIDAYS; PICTURES; CHECKS;
     BRANCHES; BILL; COURTS; CIRCUITS; SCRUTINY; DOCS; ELECTIONS; flagStars(year); century(year); ordinal(n).          */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  /* =====================================================================================================================
     THE MODEL: MathLadder.civics — places, states and the land
     ===================================================================================================================== */
  var CV = ML.civics = ML.civics || {};
  // ab, name, capital, admitted (ratified the Constitution, for the 13), electoral votes 2024-2028 (2020 census), census
  // region, tile row, tile column (the tile map: one square per state, roughly in place)
  var S = [
    ['DE', 'Delaware', 'Dover', '1787-12-07', 3, 'South', 4, 9], ['PA', 'Pennsylvania', 'Harrisburg', '1787-12-12', 19, 'Northeast', 3, 7],
    ['NJ', 'New Jersey', 'Trenton', '1787-12-18', 14, 'Northeast', 3, 8], ['GA', 'Georgia', 'Atlanta', '1788-01-02', 16, 'South', 6, 7],
    ['CT', 'Connecticut', 'Hartford', '1788-01-09', 7, 'Northeast', 3, 9], ['MA', 'Massachusetts', 'Boston', '1788-02-06', 11, 'Northeast', 2, 9],
    ['MD', 'Maryland', 'Annapolis', '1788-04-28', 10, 'South', 4, 8], ['SC', 'South Carolina', 'Columbia', '1788-05-23', 9, 'South', 5, 7],
    ['NH', 'New Hampshire', 'Concord', '1788-06-21', 4, 'Northeast', 1, 10], ['VA', 'Virginia', 'Richmond', '1788-06-25', 13, 'South', 4, 7],
    ['NY', 'New York', 'Albany', '1788-07-26', 28, 'Northeast', 2, 8], ['NC', 'North Carolina', 'Raleigh', '1789-11-21', 16, 'South', 5, 6],
    ['RI', 'Rhode Island', 'Providence', '1790-05-29', 4, 'Northeast', 3, 10], ['VT', 'Vermont', 'Montpelier', '1791-03-04', 3, 'Northeast', 1, 9],
    ['KY', 'Kentucky', 'Frankfort', '1792-06-01', 8, 'South', 4, 5], ['TN', 'Tennessee', 'Nashville', '1796-06-01', 11, 'South', 5, 5],
    ['OH', 'Ohio', 'Columbus', '1803-03-01', 17, 'Midwest', 3, 6], ['LA', 'Louisiana', 'Baton Rouge', '1812-04-30', 8, 'South', 6, 4],
    ['IN', 'Indiana', 'Indianapolis', '1816-12-11', 11, 'Midwest', 3, 5], ['MS', 'Mississippi', 'Jackson', '1817-12-10', 6, 'South', 6, 5],
    ['IL', 'Illinois', 'Springfield', '1818-12-03', 19, 'Midwest', 2, 5], ['AL', 'Alabama', 'Montgomery', '1819-12-14', 9, 'South', 6, 6],
    ['ME', 'Maine', 'Augusta', '1820-03-15', 4, 'Northeast', 0, 10], ['MO', 'Missouri', 'Jefferson City', '1821-08-10', 10, 'Midwest', 4, 4],
    ['AR', 'Arkansas', 'Little Rock', '1836-06-15', 6, 'South', 5, 4], ['MI', 'Michigan', 'Lansing', '1837-01-26', 15, 'Midwest', 2, 6],
    ['FL', 'Florida', 'Tallahassee', '1845-03-03', 30, 'South', 7, 8], ['TX', 'Texas', 'Austin', '1845-12-29', 40, 'South', 7, 3],
    ['IA', 'Iowa', 'Des Moines', '1846-12-28', 6, 'Midwest', 3, 4], ['WI', 'Wisconsin', 'Madison', '1848-05-29', 10, 'Midwest', 1, 5],
    ['CA', 'California', 'Sacramento', '1850-09-09', 54, 'West', 4, 0], ['MN', 'Minnesota', 'Saint Paul', '1858-05-11', 10, 'Midwest', 2, 4],
    ['OR', 'Oregon', 'Salem', '1859-02-14', 8, 'West', 3, 0], ['KS', 'Kansas', 'Topeka', '1861-01-29', 6, 'Midwest', 5, 3],
    ['WV', 'West Virginia', 'Charleston', '1863-06-20', 4, 'South', 4, 6], ['NV', 'Nevada', 'Carson City', '1864-10-31', 6, 'West', 3, 1],
    ['NE', 'Nebraska', 'Lincoln', '1867-03-01', 5, 'Midwest', 4, 3], ['CO', 'Colorado', 'Denver', '1876-08-01', 10, 'West', 4, 2],
    ['ND', 'North Dakota', 'Bismarck', '1889-11-02', 3, 'Midwest', 2, 3], ['SD', 'South Dakota', 'Pierre', '1889-11-02', 3, 'Midwest', 3, 3],
    ['MT', 'Montana', 'Helena', '1889-11-08', 4, 'West', 2, 2], ['WA', 'Washington', 'Olympia', '1889-11-11', 12, 'West', 2, 0],
    ['ID', 'Idaho', 'Boise', '1890-07-03', 4, 'West', 2, 1], ['WY', 'Wyoming', 'Cheyenne', '1890-07-10', 3, 'West', 3, 2],
    ['UT', 'Utah', 'Salt Lake City', '1896-01-04', 6, 'West', 4, 1], ['OK', 'Oklahoma', 'Oklahoma City', '1907-11-16', 7, 'South', 6, 3],
    ['NM', 'New Mexico', 'Santa Fe', '1912-01-06', 5, 'West', 5, 2], ['AZ', 'Arizona', 'Phoenix', '1912-02-14', 11, 'West', 5, 1],
    ['AK', 'Alaska', 'Juneau', '1959-01-03', 3, 'West', 0, 0], ['HI', 'Hawaii', 'Honolulu', '1959-08-21', 4, 'West', 7, 0]
  ];
  CV.STATES = S.map(function (a, i) { return { ab: a[0], name: a[1], capital: a[2], admitted: a[3], year: +a[3].slice(0, 4), order: i + 1, ev: a[4], seats: a[4] - 2, region: a[5], r: a[6], c: a[7] }; });
  // the District of Columbia: 3 electors (Twenty-third Amendment, 1961), no House seat with a vote, not a state
  CV.DC = { ab: 'DC', name: 'District of Columbia', capital: 'Washington', ev: 3, seats: 0, region: 'South', r: 5, c: 8, dc: true };
  var SBY = {}; CV.STATES.forEach(function (s) { SBY[s.ab] = s; }); SBY.DC = CV.DC;
  CV.state = function (ab) { return SBY[String(ab).toUpperCase()] || null; };
  CV.EV_TOTAL = 538; CV.EV_WIN = 270; CV.HOUSE = 435;
  CV.REGIONS = ['Northeast', 'Midwest', 'South', 'West'];
  CV.statesBy = function (year) { return CV.STATES.filter(function (s) { return s.year <= year; }); };
  // stars on the flag in use on July 5 of a year (13 stars 1777 to 1795, 15 to 1818, then one star for each state on the July 4
  // after it joins: Flag Acts of 1777, 1794 and 1818)
  CV.flagStars = function (year) {
    if (year < 1795) return 13; if (year < 1818) return 15;
    return CV.STATES.filter(function (s) { return s.admitted < year + '-07-04'; }).length;
  };
  CV.flagStripes = function (year) { return year >= 1795 && year < 1818 ? 15 : 13; };
  CV.COLONIES = [
    { ab: 'NH', name: 'New Hampshire', region: 'New England', founded: 1623 }, { ab: 'MA', name: 'Massachusetts', region: 'New England', founded: 1620 },
    { ab: 'RI', name: 'Rhode Island', region: 'New England', founded: 1636 }, { ab: 'CT', name: 'Connecticut', region: 'New England', founded: 1636 },
    { ab: 'NY', name: 'New York', region: 'Middle', founded: 1624 }, { ab: 'NJ', name: 'New Jersey', region: 'Middle', founded: 1664 },
    { ab: 'PA', name: 'Pennsylvania', region: 'Middle', founded: 1681 }, { ab: 'DE', name: 'Delaware', region: 'Middle', founded: 1638 },
    { ab: 'MD', name: 'Maryland', region: 'Southern', founded: 1634 }, { ab: 'VA', name: 'Virginia', region: 'Southern', founded: 1607 },
    { ab: 'NC', name: 'North Carolina', region: 'Southern', founded: 1663 }, { ab: 'SC', name: 'South Carolina', region: 'Southern', founded: 1663 },
    { ab: 'GA', name: 'Georgia', region: 'Southern', founded: 1732 }
  ];
  // founded: the first lasting European settlement or charter commonly given in textbooks (New York as New Netherland,
  // Delaware as New Sweden; the Carolinas share the 1663 charter). Maine was part of Massachusetts and Vermont was claimed by
  // New York and New Hampshire, so neither was one of the thirteen.
  CV.CIRCUITS = {
    '1st': ['ME', 'NH', 'MA', 'RI'], '2nd': ['NY', 'VT', 'CT'], '3rd': ['PA', 'NJ', 'DE'], '4th': ['MD', 'VA', 'WV', 'NC', 'SC'],
    '5th': ['TX', 'LA', 'MS'], '6th': ['OH', 'MI', 'KY', 'TN'], '7th': ['IL', 'IN', 'WI'], '8th': ['MN', 'IA', 'MO', 'AR', 'NE', 'ND', 'SD'],
    '9th': ['CA', 'OR', 'WA', 'AZ', 'NV', 'ID', 'MT', 'AK', 'HI'], '10th': ['CO', 'WY', 'UT', 'KS', 'OK', 'NM'], '11th': ['AL', 'GA', 'FL'], 'D.C.': ['DC']
  };
  // also: the 1st Circuit hears Puerto Rico, the 3rd the Virgin Islands, the 9th Guam and the Northern Mariana Islands; the
  // Federal Circuit hears appeals nationwide in subjects such as patents and claims against the United States.
  CV.circuitOf = function (ab) { for (var k in CV.CIRCUITS) if (CV.CIRCUITS[k].indexOf(ab) >= 0) return k; return null; };

  // ---------------------------------------------------------------- the land: acquisitions, places and trails (lon, lat)
  CV.ACQ = [
    { key: 'treaty1783', name: 'Treaty of Paris lands', year: 1783, from: 'Great Britain', how: 'treaty ending the Revolution' },
    { key: 'louisiana', name: 'Louisiana Purchase', year: 1803, from: 'France', how: 'purchase (about $15 million)' },
    { key: 'redriver', name: 'Red River Basin', year: 1818, from: 'Great Britain', how: 'treaty (the Convention of 1818)' },
    { key: 'florida', name: 'Florida', year: 1819, from: 'Spain', how: 'treaty (Adams-Onís Treaty; West Florida taken 1810 to 1813)' },
    { key: 'texas', name: 'Texas Annexation', year: 1845, from: 'the Republic of Texas', how: 'annexation (with the land Texas claimed)' },
    { key: 'oregon', name: 'Oregon Country', year: 1846, from: 'Great Britain', how: 'treaty (the Oregon Treaty)' },
    { key: 'mexican', name: 'Mexican Cession', year: 1848, from: 'Mexico', how: 'treaty after war (Treaty of Guadalupe Hidalgo)' },
    { key: 'gadsden', name: 'Gadsden Purchase', year: 1853, from: 'Mexico', how: 'purchase ($10 million)' },
    { key: 'alaska', name: 'Alaska', year: 1867, from: 'Russia', how: 'purchase ($7.2 million)' },
    { key: 'hawaii', name: 'Hawaii', year: 1898, from: 'the Republic of Hawaii', how: 'annexation, after the 1893 overthrow of its queen' }
  ];
  CV.acq = function (k) { for (var i = 0; i < CV.ACQ.length; i++) if (CV.ACQ[i].key === k) return CV.ACQ[i]; return null; };
  CV.PLACES = {
    jamestown: { name: 'Jamestown', lon: -76.78, lat: 37.21 }, plymouth: { name: 'Plymouth', lon: -70.67, lat: 41.96 },
    boston: { name: 'Boston', lon: -71.06, lat: 42.36 }, philadelphia: { name: 'Philadelphia', lon: -75.16, lat: 39.95 },
    newyork: { name: 'New York City', lon: -74.0, lat: 40.71 }, washington: { name: 'Washington, D.C.', lon: -77.04, lat: 38.9 },
    lexington: { name: 'Lexington and Concord', lon: -71.3, lat: 42.45 }, saratoga: { name: 'Saratoga', lon: -73.6, lat: 43.0 },
    yorktown: { name: 'Yorktown', lon: -76.51, lat: 37.24 }, staugustine: { name: 'St. Augustine', lon: -81.31, lat: 29.9 },
    santafe: { name: 'Santa Fe', lon: -105.94, lat: 35.69 }, cahokia: { name: 'Cahokia', lon: -90.06, lat: 38.66 },
    mesaverde: { name: 'Mesa Verde', lon: -108.46, lat: 37.18 }, stlouis: { name: 'St. Louis', lon: -90.2, lat: 38.63 },
    neworleans: { name: 'New Orleans', lon: -90.07, lat: 29.95 }, fortmchenry: { name: 'Fort McHenry (Baltimore)', lon: -76.58, lat: 39.26 },
    senecafalls: { name: 'Seneca Falls', lon: -76.8, lat: 42.91 }, sutter: { name: "Sutter's Mill (the Gold Rush)", lon: -120.89, lat: 38.8 },
    sumter: { name: 'Fort Sumter', lon: -79.87, lat: 32.75 }, harpersferry: { name: 'Harpers Ferry', lon: -77.73, lat: 39.32 },
    antietam: { name: 'Antietam', lon: -77.74, lat: 39.47 }, gettysburg: { name: 'Gettysburg', lon: -77.23, lat: 39.83 },
    vicksburg: { name: 'Vicksburg', lon: -90.88, lat: 32.35 }, atlanta: { name: 'Atlanta', lon: -84.39, lat: 33.75 },
    appomattox: { name: 'Appomattox', lon: -78.8, lat: 37.38 }, promontory: { name: 'Promontory Summit', lon: -112.55, lat: 41.62 },
    littlebighorn: { name: 'Little Bighorn', lon: -107.43, lat: 45.57 }, woundedknee: { name: 'Wounded Knee', lon: -102.36, lat: 43.14 },
    kittyhawk: { name: 'Kitty Hawk', lon: -75.7, lat: 36.02 }, menlopark: { name: 'Menlo Park', lon: -74.33, lat: 40.56 },
    montgomery: { name: 'Montgomery', lon: -86.3, lat: 32.38 }, selma: { name: 'Selma', lon: -87.02, lat: 32.41 },
    birmingham: { name: 'Birmingham', lon: -86.8, lat: 33.52 }, littlerock: { name: 'Little Rock', lon: -92.29, lat: 34.75 },
    greensboro: { name: 'Greensboro', lon: -79.79, lat: 36.07 }, independence: { name: 'Independence, Missouri', lon: -94.42, lat: 39.09 },
    oregoncity: { name: 'Oregon City', lon: -122.6, lat: 45.36 }, chicago: { name: 'Chicago', lon: -87.63, lat: 41.88 },
    detroit: { name: 'Detroit', lon: -83.05, lat: 42.33 }, sanfrancisco: { name: 'San Francisco', lon: -122.42, lat: 37.77 },
    losangeles: { name: 'Los Angeles', lon: -118.24, lat: 34.05 }, dallas: { name: 'Dallas', lon: -96.8, lat: 32.78 },
    pearlharbor: { name: 'Pearl Harbor', lon: -157.95, lat: 21.36 }, rushmore: { name: 'Mount Rushmore', lon: -103.46, lat: 43.88 }
  };
  CV.TRAILS = {
    oregon: { name: 'Oregon Trail', pts: [[-94.42, 39.09], [-95.7, 39.05], [-96.7, 40.0], [-98.95, 40.64], [-101.7, 41.1], [-103.35, 41.7], [-104.56, 42.2], [-106.3, 42.85], [-108.9, 42.35], [-110.6, 42.1], [-112.45, 43.03], [-114.5, 42.65], [-116.2, 43.6], [-117.0, 44.4], [-118.3, 45.65], [-120.3, 45.65], [-121.2, 45.6], [-122.6, 45.36]] },
    lewisclark: { name: 'Lewis and Clark', pts: [[-90.2, 38.63], [-92.2, 38.6], [-94.6, 39.1], [-95.9, 41.25], [-96.4, 42.5], [-98.3, 42.85], [-100.35, 44.37], [-100.8, 46.8], [-101.3, 47.3], [-104.0, 48.0], [-107.0, 47.7], [-109.5, 47.8], [-111.3, 47.5], [-111.55, 45.9], [-112.7, 45.0], [-113.45, 44.97], [-114.0, 45.7], [-114.3, 46.75], [-115.6, 46.5], [-116.9, 46.4], [-119.0, 46.2], [-121.2, 45.6], [-122.8, 46.1], [-123.88, 46.13]] },
    tears: { name: 'Trail of Tears (northern route)', pts: [[-84.9, 34.9], [-85.3, 35.05], [-86.8, 36.16], [-87.5, 36.87], [-88.6, 37.2], [-89.5, 37.3], [-90.6, 37.6], [-92.3, 37.7], [-93.3, 37.2], [-94.16, 36.06], [-94.97, 35.91]] }
  };
  // simplified outlines (lon, lat). Boundaries of acquisitions follow rivers and parallels named in the treaties; they are drawn
  // in this order, each over the last, and clipped to the outline of the country, so each one may overrun the coast.
  var MISS = [[-95.2, 47.24], [-94.88, 47.47], [-93.53, 47.24], [-93.7, 46.53], [-94.2, 46.35], [-94.15, 45.56], [-93.27, 44.98], [-92.53, 44.56], [-91.64, 44.05], [-91.25, 43.8], [-91.1, 43.2], [-90.66, 42.5], [-90.19, 41.84], [-90.58, 41.52], [-91.1, 40.8], [-91.4, 40.4], [-91.36, 39.7], [-90.6, 39.0], [-90.18, 38.63], [-89.52, 37.3], [-89.18, 37.0], [-89.53, 36.6], [-89.7, 36.0], [-90.07, 35.14], [-90.6, 34.5], [-91.06, 33.4], [-90.9, 32.35], [-91.42, 31.56], [-91.6, 31.0], [-91.19, 30.45], [-90.07, 29.95], [-89.6, 29.4], [-89.4, 28.93]];
  var DIVIDE = [[-114.07, 49.0], [-113.6, 48.4], [-113.0, 47.7], [-112.5, 47.2], [-112.3, 46.6], [-112.6, 45.95], [-113.8, 45.6], [-113.5, 45.1], [-112.8, 44.4], [-112.0, 44.55], [-111.1, 44.5], [-110.6, 44.3], [-110.3, 43.9], [-109.7, 43.2], [-108.9, 42.35], [-107.9, 42.0]];
  var ARK = [[-106.3, 39.25], [-106.0, 38.53], [-105.24, 38.44], [-104.6, 38.27], [-103.5, 37.98], [-102.6, 38.1], [-100.87, 37.97], [-100.0, 37.75]];
  var RED = [[-100.0, 34.56], [-99.2, 34.35], [-98.6, 34.15], [-97.9, 34.0], [-96.9, 33.9], [-96.0, 33.85], [-95.0, 33.85], [-94.04, 33.55]];
  var RIO = [[-97.15, 25.95], [-98.2, 26.06], [-99.1, 26.45], [-99.5, 27.5], [-100.3, 28.3], [-100.9, 29.37], [-101.4, 29.77], [-102.3, 29.88], [-102.7, 29.7], [-103.3, 28.98], [-104.37, 29.56], [-104.5, 29.8], [-105.0, 30.65], [-106.2, 31.45], [-106.53, 31.78], [-106.8, 32.3], [-106.9, 33.5], [-106.85, 34.05], [-106.65, 35.1], [-106.2, 35.7], [-106.05, 36.2], [-105.7, 36.9], [-106.4, 37.6], [-107.3, 37.75]];
  var GILA = [[-114.6, 32.72], [-113.3, 32.95], [-112.7, 32.95], [-112.0, 33.25], [-111.4, 33.03], [-110.6, 32.95], [-109.7, 32.83], [-108.6, 32.6], [-107.3, 32.4], [-106.65, 32.3]];
  function rev(a) { return a.slice().reverse(); }
  CV.GEO = {
    outline: [[-124.7, 48.4], [-124.1, 46.9], [-124.0, 46.25], [-123.95, 45.5], [-124.1, 44.6], [-124.56, 42.84], [-124.2, 42.0], [-124.1, 41.0], [-124.4, 40.44], [-123.8, 39.8], [-123.7, 38.9], [-122.9, 38.0], [-122.5, 37.8], [-122.4, 37.2], [-121.9, 36.6], [-121.5, 36.0], [-120.9, 35.4], [-120.6, 34.6], [-120.47, 34.45], [-119.2, 34.15], [-118.5, 34.0], [-118.4, 33.75], [-117.9, 33.6], [-117.3, 33.0], [-117.12, 32.53],
      [-114.72, 32.72], [-114.81, 32.49], [-111.07, 31.33], [-108.21, 31.33], [-108.21, 31.78], [-106.53, 31.78]].concat(RIO.slice(0, 15).reverse().slice(1), [
      [-97.2, 26.8], [-97.4, 27.8], [-96.8, 28.4], [-95.6, 28.75], [-94.8, 29.3], [-93.84, 29.7], [-92.3, 29.55], [-91.3, 29.25], [-90.2, 29.1], [-89.4, 28.93], [-89.2, 29.3], [-89.7, 30.05], [-89.4, 30.2], [-88.6, 30.35], [-88.1, 30.3], [-87.5, 30.3], [-86.5, 30.4], [-85.7, 30.1], [-85.0, 29.65], [-84.3, 30.0], [-83.7, 29.9], [-83.05, 29.15], [-82.75, 28.2], [-82.65, 27.6], [-82.2, 26.9], [-81.85, 26.4], [-81.3, 25.8], [-81.1, 25.15], [-80.4, 25.2], [-80.15, 25.8], [-80.05, 26.8], [-80.6, 28.4], [-80.55, 28.6], [-81.25, 29.8], [-81.4, 30.7], [-81.2, 31.5], [-80.9, 32.1], [-79.9, 32.75], [-79.1, 33.4], [-78.55, 33.85], [-77.95, 33.9], [-77.3, 34.5], [-76.5, 34.65], [-75.5, 35.25], [-75.75, 36.2], [-75.95, 36.9], [-76.3, 37.0], [-76.0, 37.9], [-75.6, 37.6], [-75.05, 38.45], [-74.95, 38.93], [-74.4, 39.35], [-74.0, 40.0], [-74.0, 40.45], [-73.95, 40.75], [-73.4, 41.05], [-72.9, 41.25], [-71.85, 41.32], [-71.4, 41.45], [-70.95, 41.5], [-70.0, 41.65], [-69.95, 41.95], [-70.1, 42.05], [-70.6, 41.95], [-70.95, 42.35], [-70.6, 42.65], [-70.7, 43.05], [-70.2, 43.65], [-69.4, 43.95], [-68.6, 44.25], [-67.6, 44.5], [-66.95, 44.8],
      [-67.8, 45.7], [-67.8, 47.07], [-68.3, 47.35], [-69.05, 47.45], [-69.25, 47.45], [-70.0, 46.7], [-70.3, 45.9], [-70.85, 45.25], [-71.08, 45.3], [-71.5, 45.0], [-74.7, 45.0], [-75.3, 44.85], [-76.3, 44.2], [-76.6, 43.6], [-79.0, 43.45], [-79.05, 43.07], [-79.0, 42.85], [-80.5, 42.4], [-82.0, 41.85], [-83.1, 42.0], [-82.5, 42.6], [-82.4, 43.0], [-82.2, 43.6], [-82.5, 45.3], [-83.6, 45.85], [-84.1, 46.25], [-84.6, 46.45], [-86.0, 47.5], [-88.4, 48.3], [-89.6, 48.0], [-90.8, 48.2], [-91.5, 48.05], [-92.6, 48.45], [-93.4, 48.6], [-94.6, 48.7], [-95.15, 49.38], [-95.15, 49.0], [-123.3, 49.0], [-123.0, 48.8], [-123.25, 48.4]]),
    islands: [[[-74.0, 40.6], [-73.2, 40.65], [-71.86, 41.07], [-72.4, 41.0], [-73.0, 40.95], [-73.7, 40.87]]],
    lakes: [
      [[-92.1, 46.75], [-90.9, 46.6], [-89.3, 46.9], [-87.9, 47.45], [-87.4, 46.55], [-86.6, 46.45], [-84.95, 46.75], [-84.6, 46.5], [-84.8, 47.5], [-84.8, 48.0], [-86.4, 48.7], [-88.2, 48.9], [-89.2, 48.4], [-89.6, 47.95], [-91.3, 47.3]],
      [[-87.8, 41.65], [-87.1, 41.65], [-86.6, 41.9], [-86.2, 43.0], [-86.5, 44.0], [-86.25, 44.8], [-85.6, 45.2], [-85.0, 45.75], [-86.0, 45.95], [-86.6, 45.9], [-87.6, 45.1], [-87.6, 44.2], [-87.9, 43.0], [-87.8, 42.3]],
      [[-84.7, 45.85], [-83.4, 45.05], [-83.3, 44.3], [-83.9, 43.6], [-83.4, 43.9], [-82.6, 43.9], [-82.5, 43.0], [-81.7, 43.3], [-81.7, 44.9], [-80.9, 44.65], [-80.0, 44.6], [-80.6, 45.9], [-82.0, 46.0], [-83.6, 46.1]],
      [[-83.45, 41.7], [-82.7, 41.45], [-81.7, 41.5], [-80.1, 42.15], [-78.9, 42.85], [-79.6, 42.85], [-80.5, 42.6], [-81.8, 42.3], [-83.0, 42.05]],
      [[-79.8, 43.25], [-79.0, 43.25], [-77.6, 43.25], [-76.5, 43.45], [-76.2, 44.0], [-76.4, 44.2], [-77.6, 43.95], [-79.4, 43.65]]
    ],
    alaska: [[-141, 69.65], [-148, 70.3], [-156.8, 71.3], [-162, 70.2], [-166.2, 68.9], [-164, 67.6], [-168, 65.6], [-164.5, 64.5], [-161, 64.5], [-161, 63.5], [-165, 62.6], [-166.1, 61.5], [-164.5, 60.5], [-162, 59.9], [-158, 58.7], [-157.5, 57.6], [-159.5, 56.5], [-162, 55.4], [-164.7, 54.4], [-162.5, 55.0], [-159, 55.8], [-156.5, 56.9], [-154.3, 58.0], [-153, 59.0], [-151.8, 59.2], [-150, 59.6], [-148, 60.0], [-146, 60.6], [-144, 60.0], [-141.4, 60.0], [-139.5, 59.6], [-137.5, 58.6], [-136, 58.0], [-134.5, 56.5], [-133, 55.0], [-130, 54.7], [-130, 56.0], [-131.5, 57.0], [-133.4, 58.4], [-135.5, 59.8], [-137.5, 59.2], [-139, 60.3], [-141, 60.3]],
    alaskaIslands: [[[-153.5, 57.9], [-152.2, 57.6], [-153.2, 56.9], [-154.7, 57.4]], [[-166.8, 53.9], [-165.9, 53.5], [-167.6, 53.3]], [[-172.5, 52.4], [-171.5, 52.3], [-173.2, 52.2]], [[-176.8, 51.9], [-175.8, 51.8], [-177.6, 51.7]]],
    hawaii: [[[-155.9, 20.25], [-155.0, 19.7], [-154.8, 19.5], [-155.6, 18.9], [-156.05, 19.7]], [[-156.7, 20.95], [-156.0, 20.8], [-156.4, 20.55], [-156.7, 20.75]], [[-157.3, 21.2], [-156.75, 21.15], [-156.9, 21.05]], [[-158.3, 21.6], [-157.65, 21.3], [-158.1, 21.25]], [[-159.8, 22.2], [-159.3, 22.2], [-159.4, 21.9], [-159.75, 21.95]], [[-160.25, 22.0], [-160.05, 21.9], [-160.2, 21.8]]],
    acq: {
      louisiana: MISS.concat([[-89.4, 26.5], [-93.84, 26.5], [-93.84, 29.7], [-93.7, 30.4], [-93.7, 31.2], [-94.04, 32.0]], rev(RED), rev(ARK), [[-106.3, 42.0]], rev(DIVIDE), [[-114.07, 50], [-95.2, 50]]),
      redriver: [[-98.6, 50], [-95.15, 50], [-95.15, 49.38], [-95.2, 48.6], [-95.6, 47.9], [-96.0, 46.6], [-96.6, 45.8], [-97.2, 45.9], [-97.9, 46.4], [-98.4, 47.4], [-98.6, 48.4]],
      florida: [[-91.6, 31.0], [-85.0, 31.0], [-84.86, 30.7], [-82.2, 30.57], [-81.45, 30.72], [-78.5, 30.72], [-78.5, 24.0], [-89.4, 24.0], [-89.4, 28.93], [-89.6, 29.4], [-90.07, 29.95], [-91.19, 30.45]],
      oregon: [[-130, 42], [-107.9, 42.0]].concat(rev(DIVIDE).slice(1), [[-114.07, 50], [-130, 50]]),
      mexican: [[-130, 42], [-106.3, 42.0], [-106.3, 39.25], [-104.0, 37.0], [-104.0, 30.5], [-130, 30.5]],
      texas: RIO.concat([[-107.3, 42.0], [-106.3, 42.0]], ARK, [[-100.0, 34.56]], RED.slice(1), [[-94.04, 32.0], [-93.7, 31.2], [-93.7, 30.4], [-93.84, 29.7], [-93.84, 25.0], [-97.15, 25.0]]),
      gadsden: GILA.concat([[-106.53, 31.78], [-106.3, 30.0], [-114.81, 30.0], [-114.81, 32.49], [-114.72, 32.72]])
    },
    labels: { treaty1783: [-84.5, 38.3], louisiana: [-99.5, 43.3], redriver: [-97.2, 48.3], florida: [-82.4, 28.6], texas: [-99.2, 31.4], oregon: [-119.5, 45.4], mexican: [-115.5, 38.6], gadsden: [-111.2, 32.1], alaska: [-152, 64], hawaii: [-157.5, 20.4] },
    rivers: { mississippi: MISS, rio: RIO }
  };
  // Albers equal-area conic projection (the USGS parameters for the lower 48, Alaska and Hawaii); returns [x, y] in km
  function albers(p1, p2, lat0, lon0) {
    var r = Math.PI / 180, R = 6371, n = (Math.sin(p1 * r) + Math.sin(p2 * r)) / 2, C = Math.cos(p1 * r) * Math.cos(p1 * r) + 2 * n * Math.sin(p1 * r);
    var rho0 = R * Math.sqrt(C - 2 * n * Math.sin(lat0 * r)) / n;
    return function (lon, lat) { var rho = R * Math.sqrt(C - 2 * n * Math.sin(lat * r)) / n, th = n * (lon - lon0) * r; return [rho * Math.sin(th), rho0 - rho * Math.cos(th)]; };
  }
  CV.proj = { lower48: albers(29.5, 45.5, 23, -96), alaska: albers(55, 65, 50, -154), hawaii: albers(8, 18, 3, -157) };

  // ---------------------------------------------------------------- presidents (party as listed by the White House history)
  var P = [
    ['George Washington', 1789, 1797, 'None'], ['John Adams', 1797, 1801, 'Federalist'], ['Thomas Jefferson', 1801, 1809, 'Democratic-Republican'],
    ['James Madison', 1809, 1817, 'Democratic-Republican'], ['James Monroe', 1817, 1825, 'Democratic-Republican'], ['John Quincy Adams', 1825, 1829, 'Democratic-Republican'],
    ['Andrew Jackson', 1829, 1837, 'Democratic'], ['Martin Van Buren', 1837, 1841, 'Democratic'], ['William Henry Harrison', 1841, 1841, 'Whig'],
    ['John Tyler', 1841, 1845, 'Whig'], ['James K. Polk', 1845, 1849, 'Democratic'], ['Zachary Taylor', 1849, 1850, 'Whig'],
    ['Millard Fillmore', 1850, 1853, 'Whig'], ['Franklin Pierce', 1853, 1857, 'Democratic'], ['James Buchanan', 1857, 1861, 'Democratic'],
    ['Abraham Lincoln', 1861, 1865, 'Republican'], ['Andrew Johnson', 1865, 1869, 'Democratic'], ['Ulysses S. Grant', 1869, 1877, 'Republican'],
    ['Rutherford B. Hayes', 1877, 1881, 'Republican'], ['James A. Garfield', 1881, 1881, 'Republican'], ['Chester A. Arthur', 1881, 1885, 'Republican'],
    ['Grover Cleveland', 1885, 1889, 'Democratic'], ['Benjamin Harrison', 1889, 1893, 'Republican'], ['Grover Cleveland', 1893, 1897, 'Democratic'],
    ['William McKinley', 1897, 1901, 'Republican'], ['Theodore Roosevelt', 1901, 1909, 'Republican'], ['William Howard Taft', 1909, 1913, 'Republican'],
    ['Woodrow Wilson', 1913, 1921, 'Democratic'], ['Warren G. Harding', 1921, 1923, 'Republican'], ['Calvin Coolidge', 1923, 1929, 'Republican'],
    ['Herbert Hoover', 1929, 1933, 'Republican'], ['Franklin D. Roosevelt', 1933, 1945, 'Democratic'], ['Harry S. Truman', 1945, 1953, 'Democratic'],
    ['Dwight D. Eisenhower', 1953, 1961, 'Republican'], ['John F. Kennedy', 1961, 1963, 'Democratic'], ['Lyndon B. Johnson', 1963, 1969, 'Democratic'],
    ['Richard Nixon', 1969, 1974, 'Republican'], ['Gerald Ford', 1974, 1977, 'Republican'], ['Jimmy Carter', 1977, 1981, 'Democratic'],
    ['Ronald Reagan', 1981, 1989, 'Republican'], ['George H. W. Bush', 1989, 1993, 'Republican'], ['Bill Clinton', 1993, 2001, 'Democratic'],
    ['George W. Bush', 2001, 2009, 'Republican'], ['Barack Obama', 2009, 2017, 'Democratic'], ['Donald Trump', 2017, 2021, 'Republican']
  ];  // the list stops in 2021 by design: the course leaves out officeholders after 2020
  CV.PRESIDENTS = P.map(function (a, i) { return { n: i + 1, name: a[0], from: a[1], to: a[2], party: a[3] }; });
  CV.ordinal = function (n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  // the century a year AD falls in: 1776 -> 18 (years 1701 to 1800 are the 18th century)
  CV.century = function (y) { return Math.floor((y - 1) / 100) + 1; };
  /* ---------------------------------------------------------------- the Constitution: articles, sections, clauses
     Each clause: [number, common name or '' , short summary in plain words]. Ids: 'I.8.3' = Article I, Section 8, Clause 3.
     Summaries are our own words; the text is at archives.gov and constitution.congress.gov. */
  CV.ARTICLES = [
    { n: 'I', title: 'The Legislative Branch', sections: [
      { n: 1, title: 'Congress', clauses: [[1, 'Vesting Clause', 'All legislative powers granted here belong to a Congress of a Senate and a House of Representatives.']] },
      { n: 2, title: 'The House of Representatives', clauses: [[1, '', 'Members are elected every two years by the people.'], [2, 'Qualifications', 'A Representative must be at least 25, a citizen for seven years and live in the state.'], [3, 'Apportionment', 'Seats (and, before the Sixteenth Amendment, direct taxes) are divided by population, counted in a census every ten years; this clause held the Three-Fifths Compromise, changed by the Fourteenth Amendment.'], [4, '', 'The governor calls an election to fill a vacancy.'], [5, 'Impeachment', 'The House chooses its Speaker and has the sole power of impeachment.']] },
      { n: 3, title: 'The Senate', clauses: [[1, '', 'Two senators from each state, six-year terms (chosen by state legislatures until the Seventeenth Amendment).'], [2, '', 'One-third of the Senate is elected every two years.'], [3, 'Qualifications', 'A senator must be at least 30, a citizen for nine years and live in the state.'], [4, '', 'The Vice President is President of the Senate and votes only to break a tie.'], [5, '', 'The Senate chooses its other officers, including a President pro tempore.'], [6, 'Impeachment Trials', 'The Senate tries impeachments; conviction needs two-thirds of the members present; the Chief Justice presides when the President is tried.'], [7, '', 'Punishment on conviction is limited to removal and disqualification from office; criminal prosecution may still follow.']] },
      { n: 4, title: 'Elections and Meetings', clauses: [[1, 'Elections Clause', 'States set the times, places and manner of congressional elections, but Congress may change those rules.'], [2, '', 'Congress meets at least once a year (date changed by the Twentieth Amendment).']] },
      { n: 5, title: 'Rules of Each House', clauses: [[1, '', 'Each house judges its members\' elections; a majority is a quorum.'], [2, 'Rules and Expulsion', 'Each house makes its own rules, may punish members and may expel one by a two-thirds vote.'], [3, 'Journal Clause', 'Each house keeps and publishes a journal of its proceedings.'], [4, '', 'Neither house may adjourn for more than three days without the other\'s consent.']] },
      { n: 6, title: 'Pay and Privileges', clauses: [[1, 'Speech or Debate Clause', 'Members are paid from the Treasury and may not be questioned elsewhere for speech or debate in Congress.'], [2, 'Incompatibility Clause', 'No member may hold another federal office at the same time.']] },
      { n: 7, title: 'Making Laws', clauses: [[1, 'Origination Clause', 'Bills for raising revenue must start in the House.'], [2, 'Presentment Clause', 'Bills passed by both houses go to the President, who signs or vetoes them; two-thirds of each house can override a veto; a bill not returned in ten days (Sundays excepted) becomes law unless Congress has adjourned.'], [3, '', 'Orders and resolutions needing both houses also go to the President.']] },
      { n: 8, title: 'Powers of Congress', clauses: [[1, 'Taxing and Spending Clause', 'To lay and collect taxes, duties, imposts and excises, to pay the debts and provide for the common defense and general welfare; duties must be uniform.'], [2, 'Borrowing Clause', 'To borrow money on the credit of the United States.'], [3, 'Commerce Clause', 'To regulate commerce with foreign nations, among the several states and with the Indian tribes.'], [4, 'Naturalization and Bankruptcy', 'To set uniform rules of naturalization and laws on bankruptcies.'], [5, 'Coinage Clause', 'To coin money and regulate its value, and fix standard weights and measures.'], [6, '', 'To punish counterfeiting.'], [7, 'Postal Clause', 'To establish post offices and post roads.'], [8, 'Copyright and Patent Clause', 'To promote science and useful arts by securing for limited times to authors and inventors the exclusive right to their writings and discoveries.'], [9, '', 'To create courts below the Supreme Court.'], [10, '', 'To define and punish piracies and offenses against the law of nations.'], [11, 'War Powers Clause', 'To declare war, grant letters of marque and reprisal, and make rules on captures.'], [12, 'Army Clause', 'To raise and support armies; no appropriation for this may be for longer than two years.'], [13, 'Navy Clause', 'To provide and maintain a navy.'], [14, '', 'To make rules for the land and naval forces.'], [15, 'Militia Clause', 'To call forth the militia to execute the laws, suppress insurrections and repel invasions.'], [16, '', 'To organize, arm and discipline the militia; states appoint officers and train it.'], [17, 'Enclave Clause', 'To govern the seat of government (the District of Columbia) and federal forts and other places.'], [18, 'Necessary and Proper Clause', 'To make all laws necessary and proper for carrying out these powers and all others vested in the government.']] },
      { n: 9, title: 'Limits on Congress', clauses: [[1, 'Slave Trade Clause', 'Congress could not ban the importation of enslaved people before 1808 (it did so effective 1808).'], [2, 'Suspension Clause', 'The writ of habeas corpus may not be suspended unless public safety requires it in rebellion or invasion.'], [3, '', 'No bill of attainder or ex post facto law.'], [4, 'Direct Tax Clause', 'Direct taxes must be apportioned by population (changed for income taxes by the Sixteenth Amendment).'], [5, '', 'No tax on exports from any state.'], [6, '', 'No preference to the ports of one state over another.'], [7, 'Appropriations Clause', 'No money may be drawn from the Treasury except by law, and accounts must be published.'], [8, 'Title of Nobility and Emoluments Clause', 'No titles of nobility; officials may not accept gifts or offices from foreign states without Congress\'s consent.']] },
      { n: 10, title: 'Limits on the States', clauses: [[1, 'Contract Clause', 'No state may make treaties, coin money, pass bills of attainder or ex post facto laws, impair the obligation of contracts or grant titles of nobility.'], [2, 'Import-Export Clause', 'No state may tax imports or exports without Congress\'s consent, except for inspection costs.'], [3, 'Compact Clause', 'No state may keep troops in peacetime, make compacts with other states or foreign powers, or engage in war unless invaded, without Congress\'s consent.']] }
    ] },
    { n: 'II', title: 'The Executive Branch', sections: [
      { n: 1, title: 'The President', clauses: [[1, 'Vesting Clause', 'The executive power is vested in a President, who serves a four-year term with a Vice President.'], [2, 'Electors', 'Each state appoints electors, as its legislature directs, equal to its senators plus representatives.'], [3, '', 'The original way electors voted (replaced by the Twelfth Amendment).'], [4, '', 'Congress sets the day electors are chosen and vote.'], [5, 'Qualifications', 'The President must be a natural-born citizen, at least 35 and a resident for 14 years.'], [6, 'Succession', 'The Vice President takes over on removal, death, resignation or inability; Congress provides for further succession (see the Twenty-fifth Amendment).'], [7, '', 'The President\'s pay may not be raised or cut during the term.'], [8, 'Oath of Office', 'The President swears to "preserve, protect and defend the Constitution of the United States."']] },
      { n: 2, title: 'Powers of the President', clauses: [[1, 'Commander in Chief Clause', 'The President commands the armed forces, may require written opinions from department heads, and may grant reprieves and pardons for federal offenses except in impeachment.'], [2, 'Treaty and Appointments Clause', 'The President makes treaties with two-thirds of the senators present agreeing, and appoints ambassadors, judges and other officers with the Senate\'s advice and consent; Congress may vest inferior officers\' appointment elsewhere.'], [3, 'Recess Appointments Clause', 'The President may fill vacancies during a Senate recess with commissions that expire at the end of the next session.']] },
      { n: 3, title: 'Duties of the President', clauses: [[1, 'Take Care Clause', 'The President reports on the State of the Union, may call Congress into session, receives ambassadors, takes care that the laws be faithfully executed and commissions officers.']] },
      { n: 4, title: 'Impeachment', clauses: [[1, 'Impeachment Clause', 'The President, Vice President and all civil officers are removed on impeachment and conviction for treason, bribery, or other high crimes and misdemeanors.']] }
    ] },
    { n: 'III', title: 'The Judicial Branch', sections: [
      { n: 1, title: 'Federal Courts', clauses: [[1, 'Vesting Clause; Good Behaviour', 'The judicial power is vested in one Supreme Court and lower courts Congress creates; judges hold office during good behavior, and their pay may not be cut.']] },
      { n: 2, title: 'Jurisdiction', clauses: [[1, 'Cases and Controversies', 'The judicial power covers cases under the Constitution, federal laws and treaties, and listed controversies, such as those between states or between citizens of different states.'], [2, 'Original and Appellate Jurisdiction', 'The Supreme Court hears cases involving ambassadors and those where a state is a party first (original jurisdiction); all others on appeal, with such exceptions and regulations as Congress makes.'], [3, 'Jury Trial', 'Trials of all crimes, except impeachment, are by jury, in the state where the crime was committed.']] },
      { n: 3, title: 'Treason', clauses: [[1, 'Treason Clause', 'Treason is only levying war against the United States or adhering to its enemies; conviction needs two witnesses to the same overt act or a confession in open court.'], [2, '', 'Congress sets the punishment, but no "corruption of blood" (punishing the family).']] }
    ] },
    { n: 'IV', title: 'The States', sections: [
      { n: 1, title: 'Full Faith and Credit', clauses: [[1, 'Full Faith and Credit Clause', 'Each state gives full faith and credit to the public acts, records and court judgments of every other state.']] },
      { n: 2, title: 'Citizens of the States', clauses: [[1, 'Privileges and Immunities Clause', 'Citizens of each state are entitled to the privileges and immunities of citizens in the several states.'], [2, 'Extradition Clause', 'A person charged with a crime who flees to another state is returned on demand.'], [3, 'Fugitive Slave Clause', 'Required the return of people escaping enslavement; made void by the Thirteenth Amendment.']] },
      { n: 3, title: 'New States and Territories', clauses: [[1, 'Admissions Clause', 'Congress may admit new states, but no state may be formed from another state\'s land without the consent of the legislatures concerned and Congress.'], [2, 'Property Clause', 'Congress governs the territory and other property of the United States.']] },
      { n: 4, title: 'Republican Government', clauses: [[1, 'Guarantee Clause', 'The United States guarantees every state a republican form of government and protects each against invasion and, on request, domestic violence.']] }
    ] },
    { n: 'V', title: 'Amendments', sections: [
      { n: 1, title: 'The Amendment Process', clauses: [[1, 'Article V', 'Two-thirds of both houses, or a convention called on the application of two-thirds of the state legislatures, propose amendments; three-fourths of the states ratify them, by legislatures or conventions as Congress chooses; no state may lose its equal vote in the Senate without its consent.']] }
    ] },
    { n: 'VI', title: 'Debts, Supremacy, Oaths', sections: [
      { n: 1, title: 'Supreme Law', clauses: [[1, 'Debts', 'Debts of the Confederation remain valid.'], [2, 'Supremacy Clause', 'The Constitution, federal laws made under it and treaties are the supreme law of the land, binding judges in every state.'], [3, 'Oaths; No Religious Test', 'Federal and state officials take an oath to support the Constitution; no religious test may ever be required for federal office.']] }
    ] },
    { n: 'VII', title: 'Ratification', sections: [
      { n: 1, title: 'Ratification', clauses: [[1, 'Article VII', 'Ratification by conventions of nine states establishes the Constitution among those states.']] }
    ] }
  ];
  CV.clause = function (id) { // 'I.8.3' -> { id, article, section, n, name, text, articleTitle, sectionTitle }
    var p = String(id).split('.');
    for (var i = 0; i < CV.ARTICLES.length; i++) if (CV.ARTICLES[i].n === p[0]) {
      var A = CV.ARTICLES[i], sec = A.sections.filter(function (s) { return String(s.n) === (p[1] || '1'); })[0]; if (!sec) return null;
      var c = sec.clauses.filter(function (c) { return String(c[0]) === (p[2] || '1'); })[0]; if (!c) return null;
      return { id: A.n + '.' + sec.n + '.' + c[0], article: A.n, section: sec.n, n: c[0], name: c[1], text: c[2], articleTitle: A.title, sectionTitle: sec.title };
    }
    return null;
  };
  CV.namedClauses = function () { var out = []; CV.ARTICLES.forEach(function (A) { A.sections.forEach(function (s) { s.clauses.forEach(function (c) { if (c[1]) out.push(CV.clause(A.n + '.' + s.n + '.' + c[0])); }); }); }); return out; };

  // ---------------------------------------------------------------- the amendments (ratified year; proposed by Congress)
  var AM = [
    [1789, 1791, 'Religion, speech, press, assembly, petition', 'Congress may not establish a religion or prohibit its free exercise, or abridge freedom of speech or the press, the right to assemble peaceably or to petition the government.'],
    [1789, 1791, 'Right to keep and bear arms', 'A well-regulated militia being necessary to a free state, the right of the people to keep and bear arms shall not be infringed.'],
    [1789, 1791, 'Quartering of soldiers', 'No soldier may be quartered in a house in peacetime without the owner\'s consent.'],
    [1789, 1791, 'Searches and seizures', 'No unreasonable searches and seizures; warrants need probable cause and must describe the place and the things or persons.'],
    [1789, 1791, 'Rights of persons', 'Grand jury indictment for serious federal crimes; no double jeopardy; no compelled self-incrimination; due process of law; just compensation when property is taken for public use.'],
    [1789, 1791, 'Rights in criminal trials', 'A speedy and public trial by an impartial jury; to be told the charges; to confront witnesses; to call witnesses; the assistance of counsel.'],
    [1789, 1791, 'Civil jury trials', 'A jury in federal civil suits at common law over twenty dollars.'],
    [1789, 1791, 'Bail, fines, punishment', 'No excessive bail or fines, and no cruel and unusual punishments.'],
    [1789, 1791, 'Rights kept by the people', 'Listing certain rights does not deny or disparage others kept by the people.'],
    [1789, 1791, 'Powers reserved to the states', 'Powers not delegated to the United States nor prohibited to the states are reserved to the states or to the people.'],
    [1794, 1795, 'Suits against states', 'Federal courts may not hear suits against a state by citizens of another state or of a foreign country.'],
    [1803, 1804, 'Election of President and Vice President', 'Electors cast separate votes for President and Vice President.'],
    [1865, 1865, 'Abolition of slavery', 'Slavery and involuntary servitude, except as punishment for a crime, are abolished.'],
    [1866, 1868, 'Citizenship, due process, equal protection', 'All persons born or naturalized in the United States are citizens; no state may deny due process or the equal protection of the laws; it also replaced the three-fifths rule and dealt with Confederate debts and officials.'],
    [1869, 1870, 'Race and voting', 'The right to vote may not be denied because of race, color or previous condition of servitude.'],
    [1909, 1913, 'Income tax', 'Congress may tax incomes without dividing the tax among the states by population.'],
    [1912, 1913, 'Direct election of senators', 'Senators are elected by the people of each state.'],
    [1917, 1919, 'Prohibition', 'Banned making, selling and transporting alcoholic drinks (repealed by the Twenty-first Amendment).'],
    [1919, 1920, 'Women\'s suffrage', 'The right to vote may not be denied because of sex.'],
    [1932, 1933, 'Terms and succession', 'Terms of the President and Vice President begin January 20 and of Congress January 3; rules if a President-elect dies.'],
    [1933, 1933, 'Repeal of Prohibition', 'Repealed the Eighteenth Amendment; the only amendment ratified by state conventions.'],
    [1947, 1951, 'Presidential term limits', 'No one may be elected President more than twice.'],
    [1960, 1961, 'Electors for D.C.', 'The District of Columbia gets electors, no more than the least populous state (three).'],
    [1962, 1964, 'No poll taxes', 'No poll tax or other tax may be required to vote in federal elections.'],
    [1965, 1967, 'Presidential disability and succession', 'The Vice President becomes President if the President dies, resigns or is removed; filling a vice-presidential vacancy; acting President when the President is unable to serve.'],
    [1971, 1971, 'Voting age of 18', 'The right of citizens 18 or older to vote may not be denied because of age.'],
    [1789, 1992, 'Congressional pay', 'A change in Congress\'s pay takes effect only after the next House election.']
  ];
  CV.AMENDMENTS = AM.map(function (a, i) { return { n: i + 1, proposed: a[0], year: a[1], title: a[2], text: a[3] }; });
  CV.BILL_OF_RIGHTS = CV.AMENDMENTS.slice(0, 10);
  CV.AMEND_COUNTS = { house: 290, houseOf: 435, senate: 67, senateOf: 100, apply: 34, ratify: 38, states: 50 }; // two-thirds and three-fourths, with all seats filled

  // ---------------------------------------------------------------- public-domain texts for cv-doc (wording of the official texts)
  CV.DOCS = {
    preamble: { title: 'The Preamble to the Constitution', source: 'U.S. Constitution, 1787 (National Archives)', paras: ['We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.'] },
    declaration: { title: 'The Declaration of Independence (from the second paragraph)', source: 'Declaration of Independence, July 4, 1776 (National Archives)', paras: ['We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.—That to secure these rights, Governments are instituted among Men, deriving their just powers from the consent of the governed,—That whenever any Form of Government becomes destructive of these ends, it is the Right of the People to alter or to abolish it, and to institute new Government, laying its foundation on such principles and organizing its powers in such form, as to them shall seem most likely to effect their Safety and Happiness.'] },
    amend1: { title: 'The First Amendment', source: 'U.S. Constitution, Amendment I, ratified 1791 (National Archives)', paras: ['Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances.'] },
    amend2: { title: 'The Second Amendment', source: 'U.S. Constitution, Amendment II, ratified 1791 (National Archives)', paras: ['A well regulated Militia, being necessary to the security of a free State, the right of the people to keep and bear Arms, shall not be infringed.'] },
    amend4: { title: 'The Fourth Amendment', source: 'U.S. Constitution, Amendment IV, ratified 1791 (National Archives)', paras: ['The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized.'] },
    amend10: { title: 'The Tenth Amendment', source: 'U.S. Constitution, Amendment X, ratified 1791 (National Archives)', paras: ['The powers not delegated to the United States by the Constitution, nor prohibited by it to the States, are reserved to the States respectively, or to the people.'] },
    amend14: { title: 'The Fourteenth Amendment, Section 1', source: 'U.S. Constitution, Amendment XIV, ratified 1868 (National Archives)', paras: ['All persons born or naturalized in the United States, and subject to the jurisdiction thereof, are citizens of the United States and of the State wherein they reside. No State shall make or enforce any law which shall abridge the privileges or immunities of citizens of the United States; nor shall any State deprive any person of life, liberty, or property, without due process of law; nor deny to any person within its jurisdiction the equal protection of the laws.'] },
    commerce: { title: 'Article I, Section 8, Clauses 3 and 18', source: 'U.S. Constitution, 1787 (National Archives)', paras: ['The Congress shall have Power … To regulate Commerce with foreign Nations, and among the several States, and with the Indian Tribes; …', 'To make all Laws which shall be necessary and proper for carrying into Execution the foregoing Powers, and all other Powers vested by this Constitution in the Government of the United States, or in any Department or Officer thereof.'] },
    supremacy: { title: 'Article VI, Clause 2: The Supremacy Clause', source: 'U.S. Constitution, 1787 (National Archives)', paras: ['This Constitution, and the Laws of the United States which shall be made in Pursuance thereof; and all Treaties made, or which shall be made, under the Authority of the United States, shall be the supreme Law of the Land; and the Judges in every State shall be bound thereby, any Thing in the Constitution or Laws of any State to the Contrary notwithstanding.'] },
    gettysburg: { title: 'The Gettysburg Address', source: 'Abraham Lincoln, November 19, 1863 (the Bliss copy, Library of Congress)', paras: ['Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.', 'Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this.', 'But, in a larger sense, we can not dedicate—we can not consecrate—we can not hallow—this ground. The brave men, living and dead, who struggled here, have consecrated it, far above our poor power to add or detract. The world will little note, nor long remember what we say here, but it can never forget what they did here. It is for us the living, rather, to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced. It is rather for us to be here dedicated to the great task remaining before us—that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion—that we here highly resolve that these dead shall not have died in vain—that this nation, under God, shall have a new birth of freedom—and that government of the people, by the people, for the people, shall not perish from the earth.'] },
    libertybell: { title: 'The words on the Liberty Bell', source: 'Liberty Bell, cast 1752–1753 (the words come from Leviticus 25:10)', paras: ['Proclaim LIBERTY Throughout all the Land unto all the Inhabitants Thereof'] },
    newcolossus: { title: 'From "The New Colossus"', source: 'Emma Lazarus, 1883; on a plaque at the Statue of Liberty since 1903', paras: ['"Give me your tired, your poor, / Your huddled masses yearning to breathe free, / The wretched refuse of your teeming shore. / Send these, the homeless, tempest-tost to me, / I lift my lamp beside the golden door!"'] },
    anthem: { title: 'The Star-Spangled Banner (first verse)', source: 'Francis Scott Key, 1814; the national anthem since 1931', paras: ['O say can you see, by the dawn\'s early light, / What so proudly we hailed at the twilight\'s last gleaming, / Whose broad stripes and bright stars through the perilous fight, / O\'er the ramparts we watched, were so gallantly streaming? / And the rocket\'s red glare, the bombs bursting in air, / Gave proof through the night that our flag was still there; / O say does that star-spangled banner yet wave / O\'er the land of the free and the home of the brave?'] },
    pledge: { title: 'The Pledge of Allegiance', source: '4 U.S.C. § 4 (the words since 1954)', paras: ['I pledge allegiance to the Flag of the United States of America, and to the Republic for which it stands, one Nation under God, indivisible, with liberty and justice for all.'] },
    fed51: { title: 'From The Federalist No. 51', source: '"Publius" (James Madison), 1788', paras: ['Ambition must be made to counteract ambition. … If men were angels, no government would be necessary. If angels were to govern men, neither external nor internal controls on government would be necessary. In framing a government which is to be administered by men over men, the great difficulty lies in this: you must first enable the government to control the governed; and in the next place oblige it to control itself.'] }
  };
  /* ---------------------------------------------------------------- Supreme Court cases
     key: [name, year, cite (U.S. Reports, where checked) or '', vote (majority–dissent, or '' where the count is complicated),
           clause or source of law, area, question presented (our words), holding (our words), later history or '',
           optional note on the vote (voteNote)]
     Facts and reasoning for a case card are written by the lesson that shows it (cv-case takes facts, reasoning, dissent).
     Areas: review, standing, commerce, federalism, spending, separation, executive, speech, press, religion, arms, process,
     liberty, equal, race, sex, crim, takings, voting, statutory. */
  var CS = {
    chisholm: ['Chisholm v. Georgia', 1793, '2 U.S. 419', '4–1', 'Article III', 'federalism', 'May a citizen of one state sue another state in federal court?', 'Yes; Georgia could be sued by a citizen of South Carolina.', 'Reversed by the Eleventh Amendment (1795).'],
    marbury: ['Marbury v. Madison', 1803, '5 U.S. 137', '4–0', 'Article III; Article VI', 'review', 'May the Supreme Court refuse to enforce a federal law that conflicts with the Constitution?', 'Yes; part of the Judiciary Act of 1789 that enlarged the Court\'s original jurisdiction was unconstitutional, so the Court could not order Madison to deliver Marbury\'s commission.', ''],
    martin: ['Martin v. Hunter\'s Lessee', 1816, '14 U.S. 304', '6–0', 'Article III; Supremacy Clause', 'review', 'May the U.S. Supreme Court review state court decisions on federal law?', 'Yes; its appellate power reaches state courts\' rulings on federal questions.', ''],
    mcculloch: ['McCulloch v. Maryland', 1819, '17 U.S. 316', '7–0', 'Necessary and Proper Clause; Supremacy Clause', 'federalism', 'May Congress charter a national bank, and may a state tax it?', 'Congress may charter the bank as a means of carrying out its enumerated powers; a state may not tax it.', ''],
    gibbons: ['Gibbons v. Ogden', 1824, '22 U.S. 1', '6–0', 'Commerce Clause', 'commerce', 'Does a federal coasting license override a New York steamboat monopoly?', 'Yes; commerce includes navigation, and a valid federal law overrides a conflicting state grant.', ''],
    barron: ['Barron v. Baltimore', 1833, '32 U.S. 243', '7–0', 'Fifth Amendment (Takings Clause)', 'process', 'Does the Bill of Rights limit state and city governments?', 'No; it limits only the federal government.', 'Largely changed by incorporation through the Fourteenth Amendment.'],
    worcester: ['Worcester v. Georgia', 1832, '31 U.S. 515', '5–1', 'Treaties; Indian Commerce Clause', 'federalism', 'May Georgia apply its laws inside the Cherokee Nation?', 'No; the Cherokee Nation is a distinct community where Georgia law has no force; relations are with the federal government.', 'Not enforced; the Cherokee were removed in 1838.'],
    dredscott: ['Dred Scott v. Sandford', 1857, '60 U.S. 393', '7–2', 'Article III; Fifth Amendment', 'race', 'Could a Black man whose ancestors were enslaved be a citizen able to sue in federal court, and could Congress ban slavery in the territories?', 'No and no: Black Americans were not citizens, and the Missouri Compromise\'s ban was unconstitutional.', 'Overturned by the Thirteenth and Fourteenth Amendments.'],
    mccardle: ['Ex parte McCardle', 1869, '74 U.S. 506', '8–0', 'Exceptions Clause', 'review', 'May Congress take away the Court\'s appellate jurisdiction over a pending case?', 'Yes; the Court dismissed the appeal after Congress repealed its jurisdiction.', ''],
    slaughterhouse: ['Slaughter-House Cases', 1873, '83 U.S. 36', '5–4', 'Fourteenth Amendment (Privileges or Immunities)', 'process', 'Does a state-granted slaughterhouse monopoly violate the Fourteenth Amendment?', 'No; the Privileges or Immunities Clause protects only rights of national citizenship.', ''],
    civilrightscases: ['Civil Rights Cases', 1883, '109 U.S. 3', '8–1', 'Fourteenth Amendment, Section 5', 'race', 'Could Congress ban racial discrimination by private inns, theaters and railroads under the Fourteenth Amendment?', 'No; the amendment reaches state action, not private conduct.', 'Congress later reached private businesses under the Commerce Clause (1964).'],
    yickwo: ['Yick Wo v. Hopkins', 1886, '118 U.S. 356', '9–0', 'Equal Protection', 'equal', 'Does a law fair on its face violate equal protection if officials apply it to discriminate?', 'Yes; San Francisco\'s permit rule was enforced against Chinese laundry owners.', ''],
    hans: ['Hans v. Louisiana', 1890, '134 U.S. 1', '9–0', 'Eleventh Amendment', 'federalism', 'May a citizen sue his own state in federal court?', 'No; states have sovereign immunity from such suits.', ''],
    plessy: ['Plessy v. Ferguson', 1896, '163 U.S. 537', '7–1', 'Equal Protection', 'race', 'Does a state law requiring separate railway cars for Black and white passengers violate equal protection?', 'No; "separate but equal" facilities were held constitutional.', 'Overruled for public schools by Brown v. Board of Education (1954).'],
    knight: ['United States v. E. C. Knight Co.', 1895, '156 U.S. 1', '8–1', 'Commerce Clause', 'commerce', 'Does the Sherman Act reach a monopoly of sugar refining?', 'No; manufacturing is not commerce, and its effect on commerce was indirect.', 'Abandoned after 1937.'],
    lochner: ['Lochner v. New York', 1905, '198 U.S. 45', '5–4', 'Due Process (Fourteenth Amendment)', 'process', 'Does a maximum-hours law for bakers violate liberty of contract?', 'Yes; the law was not a valid health measure and interfered with liberty of contract.', 'Repudiated after 1937 (West Coast Hotel v. Parrish).'],
    young: ['Ex parte Young', 1908, '209 U.S. 123', '8–1', 'Eleventh Amendment', 'federalism', 'May a federal court stop a state officer from enforcing an unconstitutional state law?', 'Yes; a suit for an injunction against the officer is not barred by state sovereign immunity.', ''],
    muller: ['Muller v. Oregon', 1908, '208 U.S. 412', '9–0', 'Due Process', 'process', 'May a state limit working hours for women in factories and laundries?', 'Yes; the Court upheld the law.', ''],
    hammer: ['Hammer v. Dagenhart', 1918, '247 U.S. 251', '5–4', 'Commerce Clause', 'commerce', 'May Congress ban interstate shipment of goods made with child labor?', 'No; the law regulated manufacturing, a matter for the states.', 'Overruled by United States v. Darby (1941).'],
    schenck: ['Schenck v. United States', 1919, '249 U.S. 47', '9–0', 'First Amendment', 'speech', 'Did convictions for leaflets urging resistance to the draft violate free speech?', 'No; speech creating a "clear and present danger" of evils Congress may prevent can be punished.', 'Its test was replaced by Brandenburg v. Ohio (1969).'],
    bailey: ['Bailey v. Drexel Furniture Co.', 1922, '259 U.S. 20', '8–1', 'Taxing power', 'spending', 'Was the federal "tax" on employers of child labor a valid tax?', 'No; it was a penalty meant to regulate, not a tax.', ''],
    meyer: ['Meyer v. Nebraska', 1923, '262 U.S. 390', '7–2', 'Due Process', 'liberty', 'May a state ban teaching foreign languages to young children?', 'No; the liberty protected by due process includes parents\' right to have children taught.', ''],
    gitlow: ['Gitlow v. New York', 1925, '268 U.S. 652', '7–2', 'First and Fourteenth Amendments', 'speech', 'Do the freedoms of speech and press limit the states?', 'The Court assumed they do (beginning incorporation), but upheld Gitlow\'s conviction.', ''],
    pierce: ['Pierce v. Society of Sisters', 1925, '268 U.S. 510', '9–0', 'Due Process', 'liberty', 'May a state require all children to attend public schools?', 'No; parents may choose private schools.', ''],
    myers: ['Myers v. United States', 1926, '272 U.S. 52', '6–3', 'Article II', 'executive', 'May Congress require Senate consent before the President removes a postmaster?', 'No; the President may remove executive officers he appoints.', 'Limited by Humphrey\'s Executor (1935).'],
    near: ['Near v. Minnesota', 1931, '283 U.S. 697', '5–4', 'First Amendment', 'press', 'May a state shut down a newspaper as a "public nuisance" for what it prints?', 'No; this is a prior restraint, presumed unconstitutional.', ''],
    powell: ['Powell v. Alabama', 1932, '287 U.S. 45', '7–2', 'Due Process', 'crim', 'Did denying effective counsel to the "Scottsboro boys" in a capital trial violate due process?', 'Yes; in a capital case like this, due process required effective counsel.', ''],
    schechter: ['Schechter Poultry Corp. v. United States', 1935, '295 U.S. 495', '9–0', 'Commerce Clause; nondelegation', 'commerce', 'Could Congress authorize codes of fair competition for a local poultry business?', 'No; the codes were an unlawful delegation and regulated local business beyond the commerce power.', ''],
    humphreys: ['Humphrey\'s Executor v. United States', 1935, '295 U.S. 602', '9–0', 'Article II', 'executive', 'May Congress limit the President\'s power to remove a Federal Trade Commissioner?', 'Yes; for an independent, multi-member body, removal may be limited to good cause.', 'The Court overruled this precedent in 2026.'],
    butler: ['United States v. Butler', 1936, '297 U.S. 1', '6–3', 'Spending Clause; Tenth Amendment', 'spending', 'Was the Agricultural Adjustment Act\'s tax and payment program valid?', 'No, under the Tenth Amendment; but the spending power is not limited to the other enumerated powers.', ''],
    curtisswright: ['United States v. Curtiss-Wright Export Corp.', 1936, '299 U.S. 304', '7–1', 'Article II; foreign affairs', 'executive', 'Could Congress let the President decide whether to ban arms sales to countries at war?', 'Yes; in foreign affairs delegation is broader, and the President has a special role.', ''],
    westcoast: ['West Coast Hotel Co. v. Parrish', 1937, '300 U.S. 379', '5–4', 'Due Process', 'process', 'Is a state minimum wage law for women valid?', 'Yes; Adkins v. Children\'s Hospital (1923) was overruled.', 'Ended the Lochner era.'],
    joneslaughlin: ['NLRB v. Jones & Laughlin Steel Corp.', 1937, '301 U.S. 1', '5–4', 'Commerce Clause', 'commerce', 'Could the Wagner Act reach labor relations at a steel company?', 'Yes; labor disputes there would have a close and substantial effect on interstate commerce.', ''],
    helvering: ['Helvering v. Davis', 1937, '301 U.S. 619', '7–2', 'Spending Clause', 'spending', 'Are Social Security\'s old-age benefits within the spending power?', 'Yes; Congress may spend for the general welfare.', ''],
    carolene: ['United States v. Carolene Products Co.', 1938, '304 U.S. 144', '6–1', 'Due Process', 'process', 'Is a ban on shipping "filled milk" valid?', 'Yes; economic laws are presumed valid if they rest on a rational basis; footnote four suggested closer review for some laws.', ''],
    darby: ['United States v. Darby', 1941, '312 U.S. 100', '9–0', 'Commerce Clause', 'commerce', 'May Congress set wages and hours for workers making goods for interstate commerce?', 'Yes; Hammer v. Dagenhart was overruled.', ''],
    wickard: ['Wickard v. Filburn', 1942, '317 U.S. 111', '', 'Commerce Clause', 'commerce', 'May Congress limit wheat grown for use on a farmer\'s own farm?', 'Yes; taken together, such activity substantially affects interstate commerce.', ''],
    chaplinsky: ['Chaplinsky v. New Hampshire', 1942, '315 U.S. 568', '9–0', 'First Amendment', 'speech', 'Are face-to-face "fighting words" protected?', 'No; fighting words are a narrow unprotected category.', ''],
    barnette: ['West Virginia State Board of Education v. Barnette', 1943, '319 U.S. 624', '6–3', 'First Amendment', 'speech', 'May a public school require students to salute the flag?', 'No; the government may not compel such expression.', 'Overruled Minersville School District v. Gobitis (1940).'],
    korematsu: ['Korematsu v. United States', 1944, '323 U.S. 214', '6–3', 'Due Process; war powers', 'race', 'Was the wartime order excluding people of Japanese ancestry from the West Coast constitutional?', 'Yes; the Court upheld it while saying racial restrictions are subject to the most rigid scrutiny.', 'Repudiated in Trump v. Hawaii (2018); Congress apologized in 1988.'],
    marsh: ['Marsh v. Alabama', 1946, '326 U.S. 501', '5–3', 'First Amendment; state action', 'speech', 'May a company town ban distributing religious literature on its streets?', 'No; a company town performing public functions is bound by the First Amendment.', ''],
    everson: ['Everson v. Board of Education', 1947, '330 U.S. 1', '5–4', 'Establishment Clause', 'religion', 'May a township repay parents for bus fares to religious schools?', 'Yes; the Establishment Clause applies to the states, but this general benefit was allowed.', ''],
    shelley: ['Shelley v. Kraemer', 1948, '334 U.S. 1', '6–0', 'Equal Protection; state action', 'race', 'May state courts enforce racially restrictive covenants?', 'No; court enforcement is state action that violates equal protection.', ''],
    railwayexpress: ['Railway Express Agency v. New York', 1949, '336 U.S. 106', '9–0', 'Equal Protection', 'equal', 'May a city ban advertising on vehicles except for the owner\'s own business?', 'Yes; the classification was rational.', ''],
    sweatt: ['Sweatt v. Painter', 1950, '339 U.S. 629', '9–0', 'Equal Protection', 'race', 'Was a separate law school for Black students equal to the University of Texas Law School?', 'No; Sweatt had to be admitted to the University of Texas.', ''],
    dennis: ['Dennis v. United States', 1951, '341 U.S. 494', '6–2', 'First Amendment', 'speech', 'Did convicting Communist Party leaders for conspiring to advocate overthrow violate free speech?', 'No; the Court upheld the convictions.', 'Effectively limited by later cases and Brandenburg.'],
    youngstown: ['Youngstown Sheet & Tube Co. v. Sawyer', 1952, '343 U.S. 579', '6–3', 'Article II', 'executive', 'Could President Truman seize the steel mills during the Korean War without authority from Congress?', 'No; the seizure was lawmaking the Constitution gives to Congress.', 'Justice Jackson\'s three-zone concurrence is the leading framework.'],
    brown: ['Brown v. Board of Education', 1954, '347 U.S. 483', '9–0', 'Equal Protection', 'race', 'Does segregation of children in public schools by race violate equal protection?', 'Yes; "separate educational facilities are inherently unequal."', 'Brown II (1955) ordered desegregation "with all deliberate speed."'],
    bolling: ['Bolling v. Sharpe', 1954, '347 U.S. 497', '9–0', 'Fifth Amendment Due Process', 'race', 'Is school segregation in the District of Columbia unconstitutional?', 'Yes; the Fifth Amendment\'s due process clause forbids it.', ''],
    leeoptical: ['Williamson v. Lee Optical', 1955, '348 U.S. 483', '8–0', 'Due Process; Equal Protection', 'process', 'May a state bar opticians from fitting lenses without a prescription?', 'Yes; the legislature might have had a rational reason.', ''],
    naacpalabama: ['NAACP v. Alabama ex rel. Patterson', 1958, '357 U.S. 449', '9–0', 'First and Fourteenth Amendments', 'speech', 'Must the NAACP give Alabama its membership lists?', 'No; forced disclosure would burden members\' freedom of association.', ''],
    cooper: ['Cooper v. Aaron', 1958, '358 U.S. 1', '9–0', 'Supremacy Clause', 'review', 'May Arkansas officials delay desegregation by refusing to follow Brown?', 'No; state officials are bound by the Court\'s interpretation of the Constitution.', ''],
    mapp: ['Mapp v. Ohio', 1961, '367 U.S. 643', '6–3', 'Fourth Amendment', 'crim', 'Must state courts exclude evidence from an unconstitutional search?', 'Yes; the exclusionary rule applies to the states.', ''],
    baker: ['Baker v. Carr', 1962, '369 U.S. 186', '6–2', 'Equal Protection; political question', 'voting', 'Can federal courts hear a challenge to unequal legislative districts?', 'Yes; the claim was justiciable, not a political question.', 'Led to "one person, one vote" (Reynolds v. Sims, 1964).'],
    engel: ['Engel v. Vitale', 1962, '370 U.S. 421', '6–1', 'Establishment Clause', 'religion', 'May public schools open the day with a state-written prayer?', 'No; even a voluntary, nondenominational official prayer violates the Establishment Clause.', ''],
    gideon: ['Gideon v. Wainwright', 1963, '372 U.S. 335', '9–0', 'Sixth Amendment', 'crim', 'Must states provide a lawyer to defendants charged with felonies who cannot afford one?', 'Yes; the right to counsel applies to the states.', 'Overruled Betts v. Brady (1942).'],
    sherbert: ['Sherbert v. Verner', 1963, '374 U.S. 398', '7–2', 'Free Exercise Clause', 'religion', 'May a state deny unemployment benefits to a worker who would not work on her Sabbath?', 'No; the burden on religion was not justified by a compelling interest.', 'Narrowed by Employment Division v. Smith (1990).'],
    abington: ['Abington School District v. Schempp', 1963, '374 U.S. 203', '8–1', 'Establishment Clause', 'religion', 'May public schools begin the day with Bible reading?', 'No; school-sponsored devotional reading violates the Establishment Clause.', ''],
    sullivan: ['New York Times Co. v. Sullivan', 1964, '376 U.S. 254', '9–0', 'First Amendment', 'press', 'What must a public official prove to win a libel suit about his official conduct?', 'Actual malice: that the statement was made knowing it was false or with reckless disregard of whether it was false.', ''],
    reynolds: ['Reynolds v. Sims', 1964, '377 U.S. 533', '8–1', 'Equal Protection', 'voting', 'Must both houses of a state legislature have districts of equal population?', 'Yes: "one person, one vote."', ''],
    heartofatlanta: ['Heart of Atlanta Motel v. United States', 1964, '379 U.S. 241', '9–0', 'Commerce Clause', 'commerce', 'Could Congress forbid a motel serving interstate travelers to refuse Black guests?', 'Yes; under the Commerce Clause.', ''],
    mcclung: ['Katzenbach v. McClung', 1964, '379 U.S. 294', '9–0', 'Commerce Clause', 'commerce', 'Could the Civil Rights Act reach a local restaurant (Ollie\'s Barbecue) that bought food shipped across state lines?', 'Yes; the aggregate effect on commerce was substantial.', ''],
    griswold: ['Griswold v. Connecticut', 1965, '381 U.S. 479', '7–2', 'Due Process; several amendments', 'liberty', 'May a state ban married couples\' use of contraceptives?', 'No; the law violated a right of marital privacy.', ''],
    harper: ['Harper v. Virginia Board of Elections', 1966, '383 U.S. 663', '6–3', 'Equal Protection', 'voting', 'May a state charge a poll tax in state elections?', 'No; wealth has nothing to do with voting qualifications.', ''],
    miranda: ['Miranda v. Arizona', 1966, '384 U.S. 436', '5–4', 'Fifth Amendment', 'crim', 'Must police warn suspects in custody of their rights before questioning them?', 'Yes; without the warnings, statements from custodial interrogation are generally inadmissible.', 'Reaffirmed in Dickerson v. United States (2000).'],
    loving: ['Loving v. Virginia', 1967, '388 U.S. 1', '9–0', 'Equal Protection; Due Process', 'race', 'May a state ban marriage between people of different races?', 'No; the ban violated equal protection and the freedom to marry.', ''],
    katz: ['Katz v. United States', 1967, '389 U.S. 347', '7–1', 'Fourth Amendment', 'crim', 'Was recording a call from a public phone booth a search?', 'Yes; the Fourth Amendment protects people, not places, and reasonable expectations of privacy.', ''],
    terry: ['Terry v. Ohio', 1968, '392 U.S. 1', '8–1', 'Fourth Amendment', 'crim', 'May police briefly stop and frisk someone without probable cause?', 'Yes, with reasonable suspicion of crime and that the person is armed and dangerous.', ''],
    duncan: ['Duncan v. Louisiana', 1968, '391 U.S. 145', '7–2', 'Sixth Amendment', 'crim', 'Must states provide jury trials for serious crimes?', 'Yes; the jury right is fundamental and applies to the states.', ''],
    obrien: ['United States v. O\'Brien', 1968, '391 U.S. 367', '7–1', 'First Amendment', 'speech', 'Was burning a draft card protected symbolic speech?', 'No; the law served an important interest unrelated to suppressing expression, with no greater restriction than essential.', ''],
    tinker: ['Tinker v. Des Moines Independent Community School District', 1969, '393 U.S. 503', '7–2', 'First Amendment', 'speech', 'May a school punish students for wearing black armbands protesting the Vietnam War?', 'No; students keep free speech rights unless the speech would materially and substantially disrupt school.', ''],
    brandenburg: ['Brandenburg v. Ohio', 1969, '395 U.S. 444', '8–0', 'First Amendment', 'speech', 'May a state punish advocacy of violence at a rally?', 'Only if it is directed to inciting imminent lawless action and likely to produce it.', 'Overruled Whitney v. California (1927).'],
    goldberg: ['Goldberg v. Kelly', 1970, '397 U.S. 254', '5–3', 'Due Process', 'process', 'Must a state hold a hearing before ending welfare benefits?', 'Yes; an evidentiary hearing is required before termination.', ''],
    pike: ['Pike v. Bruce Church, Inc.', 1970, '397 U.S. 137', '9–0', 'Dormant Commerce Clause', 'commerce', 'May Arizona require cantaloupes grown there to be packed there?', 'No; the burden on commerce was clearly excessive compared with the local benefit.', ''],
    reed: ['Reed v. Reed', 1971, '404 U.S. 71', '7–0', 'Equal Protection', 'sex', 'May a state prefer men over women as estate administrators?', 'No; the preference was arbitrary.', ''],
    lemon: ['Lemon v. Kurtzman', 1971, '403 U.S. 602', '', 'Establishment Clause', 'religion', 'May states pay part of teachers\' salaries at religious schools?', 'No; the programs fostered excessive entanglement (the three-part Lemon test).', 'The Court said in 2022 that it no longer applies this test.'],
    pentagonpapers: ['New York Times Co. v. United States', 1971, '403 U.S. 713', '6–3', 'First Amendment', 'press', 'Could the government stop newspapers from publishing the Pentagon Papers?', 'No; the government did not meet the heavy burden needed for a prior restraint.', ''],
    yoder: ['Wisconsin v. Yoder', 1972, '406 U.S. 205', '', 'Free Exercise Clause', 'religion', 'Must Amish parents send their children to school after eighth grade?', 'No; the state\'s interest did not outweigh the burden on their religious practice.', ''],
    furman: ['Furman v. Georgia', 1972, '408 U.S. 238', '5–4', 'Eighth Amendment', 'crim', 'Was the death penalty, as then imposed, cruel and unusual?', 'Yes, as then administered; each justice in the majority wrote separately.', 'Revised statutes were upheld in Gregg v. Georgia (1976).'],
    roe: ['Roe v. Wade', 1973, '410 U.S. 113', '7–2', 'Due Process (Fourteenth Amendment)', 'liberty', 'Does the Constitution protect a right to choose abortion?', 'Yes, as part of a right of privacy, under a trimester framework.', 'Modified by Casey (1992); the Court overruled it in 2022.'],
    miller: ['Miller v. California', 1973, '413 U.S. 15', '5–4', 'First Amendment', 'speech', 'What test defines obscenity, which is not protected?', 'A three-part test using contemporary community standards.', ''],
    rodriguez: ['San Antonio Independent School District v. Rodriguez', 1973, '411 U.S. 1', '5–4', 'Equal Protection', 'equal', 'Does school funding by local property taxes violate equal protection?', 'No; wealth is not a suspect class, education is not a fundamental right under the Constitution, and the system was rational.', ''],
    frontiero: ['Frontiero v. Richardson', 1973, '411 U.S. 677', '8–1', 'Fifth Amendment Due Process', 'sex', 'May the military give male service members\' wives benefits automatically but require female service members\' husbands to prove dependency?', 'No; four justices would apply strict scrutiny to sex classifications, but there was no majority for that test.', ''],
    nixon: ['United States v. Nixon', 1974, '418 U.S. 683', '8–0', 'Article II; executive privilege', 'executive', 'Must President Nixon give subpoenaed tapes to a criminal trial?', 'Yes; executive privilege is real but qualified and yields to a criminal trial\'s specific need for evidence.', 'Nixon resigned two weeks later.'],
    buckley: ['Buckley v. Valeo', 1976, '424 U.S. 1', '', 'First Amendment', 'speech', 'Do federal limits on campaign contributions and spending violate free speech?', 'Contribution limits are valid; limits on independent expenditures and candidates\' spending are not.', ''],
    mathews: ['Mathews v. Eldridge', 1976, '424 U.S. 319', '6–2', 'Due Process', 'process', 'Must a hearing come before ending disability benefits?', 'No; under a three-factor balance, the existing procedures were enough.', ''],
    craig: ['Craig v. Boren', 1976, '429 U.S. 190', '7–2', 'Equal Protection', 'sex', 'May a state set different ages for buying 3.2% beer for men and women?', 'No; sex classifications must serve important objectives and be substantially related to them.', 'Set intermediate scrutiny.'],
    gregg: ['Gregg v. Georgia', 1976, '428 U.S. 153', '7–2', 'Eighth Amendment', 'crim', 'Is the death penalty always cruel and unusual?', 'No; Georgia\'s revised procedures were upheld.', ''],
    washingtondavis: ['Washington v. Davis', 1976, '426 U.S. 229', '7–2', 'Equal Protection', 'equal', 'Does a test that more Black applicants failed violate equal protection without proof of discriminatory purpose?', 'No; a disparate impact alone is not enough under the Constitution.', ''],
    nationalleague: ['National League of Cities v. Usery', 1976, '426 U.S. 833', '5–4', 'Tenth Amendment', 'federalism', 'May Congress set wages and hours for state employees?', 'No, in areas of traditional governmental functions.', 'Overruled by Garcia (1985).'],
    philadelphianj: ['City of Philadelphia v. New Jersey', 1978, '437 U.S. 617', '7–2', 'Dormant Commerce Clause', 'commerce', 'May New Jersey ban garbage from other states?', 'No; the law discriminated against interstate commerce.', ''],
    bakke: ['Regents of the University of California v. Bakke', 1978, '438 U.S. 265', '5–4', 'Equal Protection; Title VI', 'race', 'May a medical school reserve seats for minority applicants?', 'No quotas; but race may be considered as one factor (Justice Powell\'s controlling opinion).', ''],
    penncentral: ['Penn Central Transportation Co. v. New York City', 1978, '438 U.S. 104', '6–3', 'Takings Clause', 'takings', 'Did landmark rules that blocked a tower over Grand Central Terminal take property?', 'No, under a balancing of economic impact, investment expectations and the character of the action.', ''],
    reeves: ['Reeves, Inc. v. Stake', 1980, '447 U.S. 429', '5–4', 'Dormant Commerce Clause', 'commerce', 'May South Dakota prefer its residents when selling cement from its own plant?', 'Yes; as a market participant, a state may choose its customers.', ''],
    chadha: ['INS v. Chadha', 1983, '462 U.S. 919', '7–2', 'Article I, Section 7', 'separation', 'May one house of Congress veto an executive decision?', 'No; legislative action requires bicameral passage and presentment.', ''],
    chevron: ['Chevron U.S.A. v. Natural Resources Defense Council', 1984, '467 U.S. 837', '6–0', 'Statutory interpretation', 'statutory', 'How should courts treat an agency\'s reading of a statute it administers?', 'If the statute is ambiguous, courts defer to a reasonable agency interpretation.', 'The Court overruled this precedent in 2024.'],
    strickland: ['Strickland v. Washington', 1984, '466 U.S. 668', '8–1', 'Sixth Amendment', 'crim', 'When is a lawyer\'s help so poor that a conviction must be set aside?', 'When performance was deficient and the deficiency prejudiced the defense.', ''],
    leon: ['United States v. Leon', 1984, '468 U.S. 897', '6–3', 'Fourth Amendment', 'crim', 'Must evidence be excluded when police reasonably relied on a warrant later found invalid?', 'No; there is a good-faith exception.', ''],
    garcia: ['Garcia v. San Antonio Metropolitan Transit Authority', 1985, '469 U.S. 528', '5–4', 'Tenth Amendment; Commerce Clause', 'federalism', 'May federal wage and hour laws apply to a city transit system?', 'Yes; National League of Cities was overruled, leaving states\' protection mainly to the political process.', ''],
    cleburne: ['City of Cleburne v. Cleburne Living Center', 1985, '473 U.S. 432', '', 'Equal Protection', 'equal', 'Did a city violate equal protection by denying a permit for a group home for people with intellectual disabilities?', 'Yes; under rational basis, the denial rested on irrational prejudice.', ''],
    batson: ['Batson v. Kentucky', 1986, '476 U.S. 79', '7–2', 'Equal Protection', 'crim', 'May a prosecutor strike jurors because of their race?', 'No.', ''],
    dole: ['South Dakota v. Dole', 1987, '483 U.S. 203', '7–2', 'Spending Clause', 'spending', 'May Congress withhold some highway money from states with a drinking age under 21?', 'Yes; the condition met the limits on conditional spending.', ''],
    morrisonolson: ['Morrison v. Olson', 1988, '487 U.S. 654', '7–1', 'Appointments Clause; Article II', 'executive', 'Was the independent counsel law valid?', 'Yes; the counsel was an inferior officer, and the removal limit did not unduly interfere with the President.', 'Justice Scalia\'s dissent is often cited in later removal cases.'],
    johnson: ['Texas v. Johnson', 1989, '491 U.S. 397', '5–4', 'First Amendment', 'speech', 'May a state punish burning the American flag as political protest?', 'No; it is expressive conduct protected by the First Amendment.', ''],
    ward: ['Ward v. Rock Against Racism', 1989, '491 U.S. 781', '6–3', 'First Amendment', 'speech', 'May a city require concerts in a park to use its sound system and technician?', 'Yes; a content-neutral time, place and manner rule need not be the least restrictive means.', ''],
    croson: ['City of Richmond v. J. A. Croson Co.', 1989, '488 U.S. 469', '6–3', 'Equal Protection', 'race', 'Is a city\'s set-aside of contracts for minority-owned businesses valid?', 'No; state and local racial classifications get strict scrutiny, which the plan failed.', ''],
    smith: ['Employment Division v. Smith', 1990, '494 U.S. 872', '6–3', 'Free Exercise Clause', 'religion', 'Must a state exempt sacramental peyote use from its drug laws?', 'No; neutral, generally applicable laws need no religious exemption.', 'Congress responded with RFRA (1993).'],
    cruzan: ['Cruzan v. Director, Missouri Department of Health', 1990, '497 U.S. 261', '5–4', 'Due Process', 'liberty', 'May a state require clear and convincing evidence of a patient\'s wishes before ending life support?', 'Yes, assuming a competent person has a right to refuse treatment.', ''],
    lujan: ['Lujan v. Defenders of Wildlife', 1992, '504 U.S. 555', '', 'Article III', 'standing', 'Did plaintiffs who might someday visit habitats abroad have standing?', 'No; they showed no concrete, imminent injury.', 'States the three-part test for standing.'],
    casey: ['Planned Parenthood of Southeastern Pennsylvania v. Casey', 1992, '505 U.S. 833', '5–4', 'Due Process', 'liberty', 'Should Roe v. Wade be overruled, and what test applies?', 'Roe\'s central holding was kept and the trimester framework replaced with an "undue burden" test.', 'The Court overruled this precedent in 2022.'],
    newyorkus: ['New York v. United States', 1992, '505 U.S. 144', '6–3', 'Tenth Amendment', 'federalism', 'May Congress order states to take title to radioactive waste or regulate as Congress directs?', 'No; Congress may not commandeer state legislatures.', ''],
    lucas: ['Lucas v. South Carolina Coastal Council', 1992, '505 U.S. 1003', '6–3', 'Takings Clause', 'takings', 'Is a rule that leaves land with no economic use a taking?', 'Yes, unless background principles of property law already forbade the use.', ''],
    lukumi: ['Church of the Lukumi Babalu Aye v. City of Hialeah', 1993, '508 U.S. 520', '9–0', 'Free Exercise Clause', 'religion', 'May a city ban a faith\'s ritual practices through laws aimed at them?', 'No; laws targeting religion get strict scrutiny and failed it.', ''],
    shaw: ['Shaw v. Reno', 1993, '509 U.S. 630', '5–4', 'Equal Protection', 'voting', 'Can a district drawn mainly by race be challenged under equal protection?', 'Yes; such districts are subject to strict scrutiny.', ''],
    nixonus: ['Nixon v. United States', 1993, '506 U.S. 224', '9–0', 'Article I, Section 3', 'review', 'May courts review how the Senate tries an impeachment?', 'No; it is a political question committed to the Senate.', ''],
    lopez: ['United States v. Lopez', 1995, '514 U.S. 549', '5–4', 'Commerce Clause', 'commerce', 'May Congress ban guns near schools under the commerce power?', 'No; possessing a gun near a school is not economic activity that substantially affects interstate commerce.', ''],
    adarand: ['Adarand Constructors, Inc. v. Peña', 1995, '515 U.S. 200', '5–4', 'Fifth Amendment Due Process', 'race', 'Do federal racial classifications get strict scrutiny?', 'Yes, like state ones.', ''],
    seminole: ['Seminole Tribe of Florida v. Florida', 1996, '517 U.S. 44', '5–4', 'Eleventh Amendment', 'federalism', 'May Congress, using its Article I powers, let tribes sue states in federal court?', 'No; Congress cannot abrogate state immunity under Article I.', ''],
    vmi: ['United States v. Virginia', 1996, '518 U.S. 515', '7–1', 'Equal Protection', 'sex', 'May the Virginia Military Institute admit only men?', 'No; Virginia showed no "exceedingly persuasive justification."', ''],
    romer: ['Romer v. Evans', 1996, '517 U.S. 620', '6–3', 'Equal Protection', 'equal', 'Was a state constitutional amendment barring local laws protecting gay people valid?', 'No; it lacked a rational relation to a legitimate purpose.', ''],
    boerne: ['City of Boerne v. Flores', 1997, '521 U.S. 507', '6–3', 'Fourteenth Amendment, Section 5', 'federalism', 'Could Congress apply RFRA to the states under Section 5?', 'No; Section 5 laws need congruence and proportionality to constitutional violations.', ''],
    printz: ['Printz v. United States', 1997, '521 U.S. 898', '5–4', 'Tenth Amendment', 'federalism', 'May Congress require local sheriffs to run background checks for gun purchases?', 'No; Congress may not command state officers.', ''],
    glucksberg: ['Washington v. Glucksberg', 1997, '521 U.S. 702', '9–0', 'Due Process', 'liberty', 'Does due process protect a right to assisted suicide?', 'No; the asserted right is not deeply rooted in history and tradition.', ''],
    clintonjones: ['Clinton v. Jones', 1997, '520 U.S. 681', '9–0', 'Article II', 'executive', 'Must a civil suit about a President\'s unofficial acts before taking office wait until the term ends?', 'No.', ''],
    clintonny: ['Clinton v. City of New York', 1998, '524 U.S. 417', '6–3', 'Presentment Clause', 'separation', 'Is the Line Item Veto Act valid?', 'No; canceling parts of signed laws bypasses Article I\'s process.', ''],
    dickerson: ['Dickerson v. United States', 2000, '530 U.S. 428', '7–2', 'Fifth Amendment', 'crim', 'Could Congress replace Miranda\'s warnings by statute?', 'No; Miranda is a constitutional rule.', ''],
    morrison: ['United States v. Morrison', 2000, '529 U.S. 598', '5–4', 'Commerce Clause; Fourteenth Amendment, Section 5', 'commerce', 'Was the Violence Against Women Act\'s civil remedy valid?', 'No, under either power.', ''],
    bushgore: ['Bush v. Gore', 2000, '531 U.S. 98', '', 'Equal Protection', 'voting', 'Could Florida\'s recount continue under varying standards?', 'No; seven justices found an equal protection problem, and five held no remedy was possible in time.', ''],
    zelman: ['Zelman v. Simmons-Harris', 2002, '536 U.S. 639', '5–4', 'Establishment Clause', 'religion', 'Is a voucher program that parents can use at religious schools valid?', 'Yes; aid reached religious schools only through parents\' independent choices.', ''],
    grutter: ['Grutter v. Bollinger', 2003, '539 U.S. 306', '5–4', 'Equal Protection', 'race', 'May a law school consider race in a holistic admissions process?', 'Yes; diversity was a compelling interest and the program was narrowly tailored.', 'The Court rejected race-conscious admissions programs in 2023.'],
    lawrence: ['Lawrence v. Texas', 2003, '539 U.S. 558', '6–3', 'Due Process', 'liberty', 'May a state make private conduct between consenting adults of the same sex a crime?', 'No; the law violated due process liberty.', 'Overruled Bowers v. Hardwick (1986).'],
    crawford: ['Crawford v. Washington', 2004, '541 U.S. 36', '9–0', 'Sixth Amendment', 'crim', 'May a recorded statement be used at trial if the defendant could not cross-examine the speaker?', 'Not if it is testimonial, unless the witness is unavailable and was cross-examined before.', ''],
    hamdi: ['Hamdi v. Rumsfeld', 2004, '542 U.S. 507', '', 'Due Process', 'executive', 'What process is due a U.S. citizen held as an enemy combatant?', 'Notice of the grounds and a fair chance to rebut them before a neutral decisionmaker (plurality).', ''],
    raich: ['Gonzales v. Raich', 2005, '545 U.S. 1', '6–3', 'Commerce Clause', 'commerce', 'May federal drug law reach marijuana grown at home for medical use under state law?', 'Yes; Congress may regulate it as part of a national market.', ''],
    kelo: ['Kelo v. City of New London', 2005, '545 U.S. 469', '5–4', 'Takings Clause', 'takings', 'Is taking homes for an economic development plan a "public use"?', 'Yes, with just compensation.', 'Many states then limited eminent domain by law.'],
    roper: ['Roper v. Simmons', 2005, '543 U.S. 551', '5–4', 'Eighth Amendment', 'crim', 'May a person be executed for a crime committed under 18?', 'No.', ''],
    hamdan: ['Hamdan v. Rumsfeld', 2006, '548 U.S. 557', '5–3', 'Statutes; Geneva Conventions', 'executive', 'Were the military commissions set up for Guantanamo detainees lawful?', 'No; they were not authorized by Congress and violated the laws of war.', ''],
    morse: ['Morse v. Frederick', 2007, '551 U.S. 393', '5–4', 'First Amendment', 'speech', 'May a school punish a student\'s banner reasonably read as promoting illegal drug use at a school event?', 'Yes.', ''],
    heller: ['District of Columbia v. Heller', 2008, '554 U.S. 570', '5–4', 'Second Amendment', 'arms', 'Does the Second Amendment protect an individual right to keep a handgun at home?', 'Yes; the District\'s handgun ban was unconstitutional.', ''],
    boumediene: ['Boumediene v. Bush', 2008, '553 U.S. 723', '5–4', 'Suspension Clause', 'executive', 'Do detainees at Guantanamo Bay have a right to habeas corpus?', 'Yes; Congress had not provided an adequate substitute.', ''],
    citizensunited: ['Citizens United v. Federal Election Commission', 2010, '558 U.S. 310', '5–4', 'First Amendment', 'speech', 'May the government ban independent election spending by corporations and unions?', 'No; such spending is protected political speech.', ''],
    mcdonald: ['McDonald v. City of Chicago', 2010, '561 U.S. 742', '5–4', 'Second and Fourteenth Amendments', 'arms', 'Does the Second Amendment apply to states and cities?', 'Yes; the right is incorporated.', ''],
    comstock: ['United States v. Comstock', 2010, '560 U.S. 126', '7–2', 'Necessary and Proper Clause', 'federalism', 'May Congress allow civil commitment of dangerous federal prisoners after their sentences?', 'Yes; it is a reasonable means connected to Congress\'s powers.', ''],
    nfib: ['National Federation of Independent Business v. Sebelius', 2012, '567 U.S. 519', '5–4', 'Commerce Clause; Taxing power; Spending Clause', 'commerce', 'Is the Affordable Care Act\'s individual mandate constitutional, and may Congress threaten states\' existing Medicaid funds?', 'The mandate is valid as a tax, not under the commerce power; the Medicaid threat was coercive.', ''],
    shelby: ['Shelby County v. Holder', 2013, '570 U.S. 529', '5–4', 'Fifteenth Amendment; Tenth Amendment', 'voting', 'Is the Voting Rights Act\'s coverage formula for preclearance still valid?', 'No; it rested on decades-old data.', ''],
    canning: ['NLRB v. Noel Canning', 2014, '573 U.S. 513', '9–0', 'Recess Appointments Clause', 'executive', 'Were recess appointments made during a three-day Senate break valid?', 'No; a recess of fewer than ten days is presumptively too short.', ''],
    hobbylobby: ['Burwell v. Hobby Lobby Stores', 2014, '573 U.S. 682', '5–4', 'RFRA', 'religion', 'Does RFRA protect closely held companies from a federal contraceptive-coverage rule?', 'Yes; the rule was not the least restrictive means.', ''],
    reedgilbert: ['Reed v. Town of Gilbert', 2015, '576 U.S. 155', '9–0', 'First Amendment', 'speech', 'Is a sign code that treats signs differently by their subject content-based?', 'Yes; it gets strict scrutiny, which it failed.', ''],
    obergefell: ['Obergefell v. Hodges', 2015, '576 U.S. 644', '5–4', 'Due Process; Equal Protection', 'liberty', 'Must states license and recognize marriages between two people of the same sex?', 'Yes.', ''],
    zivotofsky: ['Zivotofsky v. Kerry', 2015, '576 U.S. 1', '6–3', 'Article II (recognition)', 'executive', 'May Congress require passports to list "Israel" as the birthplace of citizens born in Jerusalem?', 'No; the power to recognize foreign states belongs to the President alone.', ''],
    trumphawaii: ['Trump v. Hawaii', 2018, '585 U.S. 667', '5–4', 'Immigration statute; Establishment Clause', 'executive', 'Was the presidential proclamation restricting entry from several countries valid?', 'Yes; it was within the President\'s statutory authority and survived rational basis review.', 'The majority said Korematsu "was gravely wrong the day it was decided."'],
    carpenter: ['Carpenter v. United States', 2018, '585 U.S. 296', '5–4', 'Fourth Amendment', 'crim', 'Do police need a warrant for a person\'s historical cell-site location records?', 'Yes, generally.', ''],
    murphy: ['Murphy v. National Collegiate Athletic Association', 2018, '584 U.S. 453', '', 'Tenth Amendment', 'federalism', 'May Congress forbid states to authorize sports betting?', 'No; that commands state legislatures.', ''],
    gamble: ['Gamble v. United States', 2019, '', '7–2', 'Fifth Amendment', 'crim', 'May a state and the federal government each prosecute the same conduct?', 'Yes; the separate-sovereigns doctrine stands.', ''],
    timbs: ['Timbs v. Indiana', 2019, '586 U.S. 146', '9–0', 'Eighth and Fourteenth Amendments', 'crim', 'Does the Excessive Fines Clause apply to the states?', 'Yes.', ''],
    rucho: ['Rucho v. Common Cause', 2019, '', '5–4', 'Article III; political question', 'voting', 'Can federal courts decide partisan gerrymandering claims?', 'No; they are political questions beyond federal courts.', ''],
    ramos: ['Ramos v. Louisiana', 2020, '590 U.S. 83', '6–3', 'Sixth Amendment', 'crim', 'Must state juries be unanimous to convict of a serious crime?', 'Yes.', ''],
    seila: ['Seila Law LLC v. Consumer Financial Protection Bureau', 2020, '591 U.S. 197', '5–4', 'Article II', 'executive', 'May Congress protect a single agency director from removal at will?', 'No.', '']
  };
  CV.CASES = {};
  Object.keys(CS).forEach(function (k) { var a = CS[k]; CV.CASES[k] = { key: k, name: a[0], year: a[1], cite: a[2], vote: a[3], clause: a[4], area: a[5], q: a[6], holding: a[7], later: a[8] }; if (a[9]) CV.CASES[k].voteNote = a[9]; });
  CV.caseList = function (area) { return Object.keys(CV.CASES).map(function (k) { return CV.CASES[k]; }).filter(function (c) { return !area || c.area === area || (Array.isArray(area) && area.indexOf(c.area) >= 0); }); };
  // a short name for a case: the part before " v. " (or the whole name when there is no " v. ")
  CV.shortName = function (c) { c = typeof c === 'string' ? CV.CASES[c] : c; var m = /^(.*?) v\. /.exec(c.name); return m ? m[1] : c.name; };
  /* ---------------------------------------------------------------- events for time lines
     [id, year, label, tags (space-separated), kid (true: suits the young learners' course), end year (spans)]
     Tags: native colonial revolution constitution early expansion civilwar gilded progressive twenties depression wwii coldwar
     civilrights recent symbols inventions holidays amend law. Dates are AD. */
  var EV = [
    ['leif', 1000, 'Leif Erikson reaches North America (about AD 1000)', 'native', 1],
    ['cahokia', 1100, 'Cahokia at its height (about 1100)', 'native', 0],
    ['haudenosaunee', 1450, 'Haudenosaunee Confederacy (founded by 1500; dates debated)', 'native', 0],
    ['columbus', 1492, 'Columbus reaches the Caribbean', 'native colonial', 1],
    ['tordesillas', 1494, 'Treaty of Tordesillas', 'colonial', 0],
    ['cortes', 1521, 'Spanish conquer the Aztec capital', 'colonial', 0],
    ['staugustine', 1565, 'St. Augustine founded', 'colonial', 0],
    ['jamestown', 1607, 'Jamestown founded', 'colonial', 1],
    ['burgesses', 1619, 'House of Burgesses meets; first recorded Africans in Virginia', 'colonial', 0],
    ['mayflower', 1620, 'Pilgrims arrive on the Mayflower; Mayflower Compact', 'colonial', 1],
    ['harvest', 1621, 'Harvest feast of the Pilgrims and the Wampanoag', 'colonial holidays', 1],
    ['massbay', 1630, 'Massachusetts Bay Colony founded', 'colonial', 0],
    ['rhodeisland', 1636, 'Roger Williams founds Rhode Island', 'colonial', 0],
    ['newyork1664', 1664, 'New Netherland becomes New York', 'colonial', 0],
    ['kingphilip', 1675, 'King Philip\'s (Metacom\'s) War begins', 'colonial native', 0],
    ['bacon', 1676, 'Bacon\'s Rebellion', 'colonial', 0],
    ['pueblorevolt', 1680, 'Pueblo Revolt', 'colonial native', 0],
    ['penn', 1681, 'William Penn founds Pennsylvania', 'colonial', 0],
    ['georgia', 1732, 'Georgia founded, the thirteenth colony', 'colonial', 1],
    ['awakening', 1740, 'First Great Awakening at its height (1730s and 1740s)', 'colonial', 0],
    ['stono', 1739, 'Stono Rebellion', 'colonial', 0],
    ['frenchindian', 1754, 'French and Indian War begins', 'revolution', 0, 1763],
    ['proclamation', 1763, 'Proclamation of 1763', 'revolution', 0],
    ['stampact', 1765, 'Stamp Act', 'revolution', 0],
    ['townshend', 1767, 'Townshend Acts', 'revolution', 0],
    ['massacre', 1770, 'Boston Massacre', 'revolution', 0],
    ['teaparty', 1773, 'Boston Tea Party', 'revolution', 1],
    ['intolerable', 1774, 'Coercive (Intolerable) Acts; First Continental Congress', 'revolution', 0],
    ['lexington', 1775, 'Battles of Lexington and Concord', 'revolution', 1],
    ['commonsense', 1776, 'Common Sense published (January)', 'revolution', 0],
    ['declaration', 1776, 'Declaration of Independence (July 4)', 'revolution holidays', 1],
    ['flag1777', 1777, 'First Flag Act: 13 stars and 13 stripes', 'symbols revolution', 1],
    ['saratoga', 1777, 'Battle of Saratoga', 'revolution', 0],
    ['frenchalliance', 1778, 'Alliance with France', 'revolution', 0],
    ['articles', 1781, 'Articles of Confederation in force', 'constitution', 0],
    ['yorktown', 1781, 'British surrender at Yorktown', 'revolution', 1],
    ['paris1783', 1783, 'Treaty of Paris ends the war', 'revolution', 1],
    ['shays', 1786, 'Shays\' Rebellion begins', 'constitution', 0],
    ['nwordinance', 1787, 'Northwest Ordinance', 'constitution expansion', 0],
    ['convention', 1787, 'Constitution signed in Philadelphia (September 17)', 'constitution', 1],
    ['ratified', 1788, 'Ninth state ratifies the Constitution (New Hampshire)', 'constitution', 0],
    ['washington1789', 1789, 'George Washington becomes the first President', 'constitution', 1],
    ['billofrights', 1791, 'Bill of Rights ratified', 'constitution amend', 1],
    ['cottongin', 1793, 'Cotton gin invented', 'early inventions', 0],
    ['whiskey', 1794, 'Whiskey Rebellion', 'constitution', 0],
    ['alien', 1798, 'Alien and Sedition Acts', 'constitution', 0],
    ['election1800', 1800, 'Election of 1800: power changes parties peacefully', 'constitution', 0],
    ['marbury', 1803, 'Marbury v. Madison', 'early law', 0],
    ['louisiana', 1803, 'Louisiana Purchase', 'early expansion', 1],
    ['lewisclark', 1804, 'Lewis and Clark set out', 'early expansion', 1, 1806],
    ['war1812', 1812, 'War of 1812 begins', 'early', 0, 1815],
    ['anthem', 1814, 'Francis Scott Key writes "The Star-Spangled Banner"', 'early symbols', 1],
    ['mcculloch', 1819, 'McCulloch v. Maryland', 'early law', 0],
    ['missouri', 1820, 'Missouri Compromise', 'early', 0],
    ['monroedoctrine', 1823, 'Monroe Doctrine', 'early', 0],
    ['eriecanal', 1825, 'Erie Canal opens', 'early', 0],
    ['jackson', 1829, 'Andrew Jackson becomes President', 'early', 0],
    ['removalact', 1830, 'Indian Removal Act', 'early native', 0],
    ['liberator', 1831, 'The Liberator first published; Nat Turner\'s revolt', 'early', 0],
    ['texasindependence', 1836, 'Texas wins independence from Mexico', 'expansion', 0],
    ['trailoftears', 1838, 'Trail of Tears (Cherokee removal)', 'early native', 0, 1839],
    ['oregontrail', 1843, 'Large wagon trains start on the Oregon Trail', 'expansion', 1],
    ['texasannex', 1845, 'Texas annexed', 'expansion', 0],
    ['mexicanwar', 1846, 'Mexican-American War begins', 'expansion', 0, 1848],
    ['senecafalls', 1848, 'Seneca Falls Convention', 'expansion', 0],
    ['goldrush', 1849, 'California Gold Rush', 'expansion', 1],
    ['compromise1850', 1850, 'Compromise of 1850', 'expansion', 0],
    ['uncletom', 1852, 'Uncle Tom\'s Cabin published', 'expansion', 0],
    ['kansasnebraska', 1854, 'Kansas-Nebraska Act; Republican Party founded', 'expansion', 0],
    ['dredscott', 1857, 'Dred Scott v. Sandford', 'expansion law', 0],
    ['lincolndouglas', 1858, 'Lincoln-Douglas debates', 'expansion', 0],
    ['harpersferry', 1859, 'John Brown\'s raid on Harpers Ferry', 'expansion', 0],
    ['lincoln1860', 1860, 'Lincoln elected President', 'civilwar', 1],
    ['sumter', 1861, 'Fort Sumter: the Civil War begins', 'civilwar', 1, 1865],
    ['homestead', 1862, 'Homestead Act', 'civilwar', 0],
    ['antietam', 1862, 'Battle of Antietam', 'civilwar', 0],
    ['emancipation', 1863, 'Emancipation Proclamation (January 1)', 'civilwar', 1],
    ['gettysburg', 1863, 'Battle of Gettysburg; Gettysburg Address', 'civilwar', 1],
    ['appomattox', 1865, 'Lee surrenders at Appomattox; Lincoln assassinated', 'civilwar', 1],
    ['juneteenth', 1865, 'Freedom announced in Galveston, Texas (June 19)', 'civilwar holidays', 1],
    ['thirteenth', 1865, 'Thirteenth Amendment ends slavery', 'civilwar amend', 1],
    ['alaska', 1867, 'Alaska purchased from Russia', 'gilded expansion', 0],
    ['fourteenth', 1868, 'Fourteenth Amendment ratified', 'civilwar amend', 0],
    ['impeachjohnson', 1868, 'Andrew Johnson impeached and acquitted', 'civilwar', 0],
    ['railroad', 1869, 'Transcontinental railroad completed', 'gilded', 1],
    ['fifteenth', 1870, 'Fifteenth Amendment ratified', 'civilwar amend', 0],
    ['littlebighorn', 1876, 'Battle of the Little Bighorn', 'gilded native', 0],
    ['telephone', 1876, 'Alexander Graham Bell\'s telephone', 'gilded inventions', 1],
    ['compromise1877', 1877, 'Compromise of 1877 ends Reconstruction', 'civilwar', 0],
    ['bulb', 1879, 'Edison\'s light bulb', 'gilded inventions', 1],
    ['redcross', 1881, 'Clara Barton founds the American Red Cross', 'gilded', 1],
    ['exclusion', 1882, 'Chinese Exclusion Act', 'gilded', 0],
    ['statue', 1886, 'Statue of Liberty dedicated', 'gilded symbols', 1],
    ['afl', 1886, 'American Federation of Labor founded; Haymarket affair', 'gilded', 0],
    ['dawes', 1887, 'Dawes Act', 'gilded native', 0],
    ['woundedknee', 1890, 'Wounded Knee', 'gilded native', 0],
    ['sherman', 1890, 'Sherman Antitrust Act', 'gilded', 0],
    ['ellisisland', 1892, 'Ellis Island opens', 'gilded', 1],
    ['plessy', 1896, 'Plessy v. Ferguson', 'gilded law', 0],
    ['spanishwar', 1898, 'Spanish-American War; Hawaii annexed', 'progressive', 0],
    ['wright', 1903, 'Wright brothers\' first powered flight', 'progressive inventions', 1],
    ['jungle', 1906, 'The Jungle; Pure Food and Drug Act', 'progressive', 0],
    ['naacp', 1909, 'NAACP founded', 'progressive', 0],
    ['amend16', 1913, 'Income tax and direct election of senators (16th and 17th Amendments)', 'progressive amend', 0],
    ['panama', 1914, 'Panama Canal opens', 'progressive', 0],
    ['wwientry', 1917, 'United States enters World War I', 'progressive', 0],
    ['armistice', 1918, 'World War I armistice (November 11)', 'progressive holidays', 0],
    ['suffrage', 1920, 'Nineteenth Amendment: women\'s suffrage', 'progressive amend', 1],
    ['scopes', 1925, 'Scopes trial', 'twenties', 0],
    ['lindbergh', 1927, 'Lindbergh flies across the Atlantic alone', 'twenties inventions', 0],
    ['crash', 1929, 'Stock market crash; the Great Depression begins', 'depression', 1],
    ['anthemlaw', 1931, '"The Star-Spangled Banner" becomes the national anthem', 'depression symbols', 1],
    ['newdeal', 1933, 'Franklin Roosevelt\'s New Deal begins', 'depression', 0],
    ['socialsecurity', 1935, 'Social Security Act', 'depression', 0],
    ['pearlharbor', 1941, 'Pearl Harbor attacked (December 7)', 'wwii', 1],
    ['eo9066', 1942, 'Executive Order 9066', 'wwii', 0],
    ['dday', 1944, 'D-Day', 'wwii', 0],
    ['vday', 1945, 'World War II ends; United Nations founded', 'wwii', 1],
    ['robinson', 1947, 'Jackie Robinson joins the Brooklyn Dodgers', 'civilrights', 1],
    ['marshallplan', 1948, 'Marshall Plan', 'coldwar', 0],
    ['nato', 1949, 'NATO founded', 'coldwar', 0],
    ['korea', 1950, 'Korean War begins', 'coldwar', 0, 1953],
    ['brown', 1954, 'Brown v. Board of Education', 'civilrights law', 1],
    ['montgomery', 1955, 'Montgomery Bus Boycott begins', 'civilrights', 1],
    ['sputnik', 1957, 'Sputnik launched; Little Rock Nine', 'coldwar civilrights', 0],
    ['statehood59', 1959, 'Alaska and Hawaii become states', 'coldwar', 1],
    ['flag50', 1960, 'The 50-star flag (July 4)', 'symbols', 1],
    ['sitins', 1960, 'Greensboro sit-ins', 'civilrights', 0],
    ['cubancrisis', 1962, 'Cuban Missile Crisis', 'coldwar', 0],
    ['march', 1963, 'March on Washington; "I Have a Dream"', 'civilrights', 1],
    ['jfk', 1963, 'President Kennedy assassinated', 'coldwar', 0],
    ['cra1964', 1964, 'Civil Rights Act of 1964', 'civilrights law', 0],
    ['vra1965', 1965, 'Voting Rights Act; Medicare and Medicaid', 'civilrights law', 0],
    ['mlk1968', 1968, 'Martin Luther King Jr. assassinated', 'civilrights', 0],
    ['moon', 1969, 'Apollo 11 lands on the Moon', 'coldwar inventions', 1],
    ['amend26', 1971, 'Twenty-sixth Amendment: voting age 18', 'recent amend', 0],
    ['watergate', 1974, 'President Nixon resigns', 'coldwar', 0],
    ['saigon', 1975, 'Fall of Saigon ends the Vietnam War', 'coldwar', 0],
    ['bicentennial', 1976, 'The country\'s 200th birthday', 'recent holidays', 1],
    ['reagan', 1981, 'Ronald Reagan becomes President', 'recent', 0],
    ['mlkday', 1986, 'Martin Luther King Jr. Day first observed', 'recent holidays', 1],
    ['berlinwall', 1989, 'Berlin Wall falls', 'coldwar', 1],
    ['ada', 1990, 'Americans with Disabilities Act', 'recent', 0],
    ['ussr', 1991, 'Soviet Union dissolves; Gulf War', 'coldwar recent', 0],
    ['web', 1991, 'World Wide Web opens to the public', 'recent inventions', 0],
    ['clintonimpeach', 1998, 'President Clinton impeached (acquitted 1999)', 'recent', 0],
    ['bushgore', 2000, 'Bush v. Gore decides the 2000 election', 'recent law', 0],
    ['juneteenthholiday', 2021, 'Juneteenth becomes a federal holiday', 'holidays', 1]
  ];
  CV.EVENTS = EV.map(function (a) { var e = { id: a[0], year: a[1], label: a[2], tags: a[3].split(' '), kid: !!a[4] }; if (a[5]) e.end = a[5]; return e; });
  CV.event = function (id) { for (var i = 0; i < CV.EVENTS.length; i++) if (CV.EVENTS[i].id === id) return CV.EVENTS[i]; return null; };
  CV.events = function (o) { // { tags: [...], from, to, kid } -> events sorted by year
    o = o || {};
    return CV.EVENTS.filter(function (e) {
      if (o.kid && !e.kid) return false; if (o.from != null && e.year < o.from) return false; if (o.to != null && e.year > o.to) return false;
      return !o.tags || o.tags.some(function (t) { return e.tags.indexOf(t) >= 0; });
    }).sort(function (a, b) { return a.year - b.year; });
  };
  CV.ERAS = {
    apush: [{ n: 1, from: 1491, to: 1607, name: 'Period 1' }, { n: 2, from: 1607, to: 1754, name: 'Period 2' }, { n: 3, from: 1754, to: 1800, name: 'Period 3' }, { n: 4, from: 1800, to: 1848, name: 'Period 4' }, { n: 5, from: 1844, to: 1877, name: 'Period 5' }, { n: 6, from: 1865, to: 1898, name: 'Period 6' }, { n: 7, from: 1890, to: 1945, name: 'Period 7' }, { n: 8, from: 1945, to: 1980, name: 'Period 8' }, { n: 9, from: 1980, to: 2025, name: 'Period 9' }],
    young: [{ from: 1000, to: 1607, name: 'Explorers' }, { from: 1607, to: 1775, name: 'Colonies' }, { from: 1775, to: 1800, name: 'A New Nation' }, { from: 1800, to: 1900, name: 'Growing West' }, { from: 1900, to: 2000, name: 'Modern Times' }]
  };
  // AP periods overlap at their edges (1844–1848, 1865–1877, 1890–1898), as the College Board draws them; apushPeriod gives the
  // later period for an overlap year only when asked (late: true)
  CV.apushPeriod = function (y, late) { var P = CV.ERAS.apush, hit = P.filter(function (p) { return y >= p.from && y < p.to || (p.n === 9 && y >= p.from); }); return hit.length ? (late ? hit[hit.length - 1] : hit[0]).n : null; };

  // ---------------------------------------------------------------- national holidays (5 U.S.C. § 6103) and two observances
  CV.HOLIDAYS = [
    { key: 'newyear', name: 'New Year\'s Day', when: 'January 1', month: 1, why: 'the start of the new year' },
    { key: 'mlk', name: 'Birthday of Martin Luther King Jr.', when: 'third Monday in January', month: 1, why: 'honors Dr. King and the civil rights movement' },
    { key: 'washington', name: 'Washington\'s Birthday (Presidents\' Day)', when: 'third Monday in February', month: 2, why: 'honors George Washington, the first President' },
    { key: 'memorial', name: 'Memorial Day', when: 'last Monday in May', month: 5, why: 'remembers service members who died serving the country' },
    { key: 'juneteenth', name: 'Juneteenth National Independence Day', when: 'June 19', month: 6, why: 'remembers the end of slavery, announced in Galveston, Texas, on June 19, 1865' },
    { key: 'independence', name: 'Independence Day', when: 'July 4', month: 7, why: 'remembers the Declaration of Independence, adopted July 4, 1776' },
    { key: 'labor', name: 'Labor Day', when: 'first Monday in September', month: 9, why: 'honors American workers' },
    { key: 'columbus', name: 'Columbus Day', when: 'second Monday in October', month: 10, why: 'the federal holiday remembers Columbus\'s 1492 voyage; many states and cities mark the day as Indigenous Peoples\' Day, honoring Native peoples' },
    { key: 'veterans', name: 'Veterans Day', when: 'November 11', month: 11, why: 'thanks all who have served in the armed forces; World War I fighting ended on November 11, 1918' },
    { key: 'thanksgiving', name: 'Thanksgiving Day', when: 'fourth Thursday in November', month: 11, why: 'a day of giving thanks, remembering the 1621 harvest feast; a national holiday since 1863' },
    { key: 'christmas', name: 'Christmas Day', when: 'December 25', month: 12, why: 'a Christian holiday celebrating the birth of Jesus, and a federal holiday since 1870' }
  ];
  CV.OBSERVANCES = [
    { key: 'flagday', name: 'Flag Day', when: 'June 14', month: 6, why: 'remembers the first Flag Act, June 14, 1777' },
    { key: 'constitutionday', name: 'Constitution Day and Citizenship Day', when: 'September 17', month: 9, why: 'the Constitution was signed on September 17, 1787' }
  ];

  // ---------------------------------------------------------------- pictures for young learners (cv-picture), with captions
  CV.PICTURES = {
    flag: 'the American flag', eagle: 'the bald eagle', bell: 'the Liberty Bell', statue: 'the Statue of Liberty', capitol: 'the U.S. Capitol',
    whitehouse: 'the White House', fort: 'Fort McHenry and its flag', anthem: 'the national anthem', mayflower: 'the Mayflower', longhouse: 'a longhouse',
    tipi: 'a tipi', pueblo: 'a pueblo', wigwam: 'a wigwam', plankhouse: 'a plank house', corn: 'corn', beans: 'beans', squash: 'squash',
    wagon: 'a covered wagon', cabin: 'a log cabin', scroll: 'the Declaration of Independence', constitution: 'the Constitution', quill: 'a quill pen',
    gavel: 'a judge\'s gavel', ballot: 'a ballot box', bus: 'a city bus', bulb: 'a light bulb', phone: 'an early telephone', plane: 'the Wright brothers\' airplane',
    kite: 'Ben Franklin\'s kite', rocket: 'a rocket', moon: 'a flag on the Moon', redcross: 'the Red Cross', firetruck: 'a fire truck', badge: 'a police badge',
    stethoscope: 'a doctor\'s stethoscope', mail: 'a mail carrier\'s bag', school: 'a school', turkey: 'a turkey', fireworks: 'fireworks', calendar: 'a calendar',
    wreath: 'a wreath', tophat: 'a tall stovepipe hat', tricorn: 'a three-cornered hat', lantern: 'a lantern', drum: 'a drum', chain: 'a broken chain',
    train: 'a steam train', compass: 'a compass', ship: 'a sailing ship', canoe: 'a canoe', bison: 'a bison', crown: 'a king\'s crown', trafficlight: 'a traffic light',
    stopsign: 'a stop sign', helping: 'helping hands', globe: 'a globe', star: 'a star'
  };

  // ---------------------------------------------------------------- branches and checks
  CV.BRANCHES = {
    legislative: { name: 'Legislative', who: 'Congress (the Senate and the House of Representatives)', job: 'makes the laws', kid: 'makes the laws', brief: 'Congress: the Senate and the House', article: 'I' },
    executive: { name: 'Executive', who: 'the President, the Vice President and the departments', job: 'carries out the laws', kid: 'carries out the laws', brief: 'the President and the departments', article: 'II' },
    judicial: { name: 'Judicial', who: 'the Supreme Court and the other federal courts', job: 'decides what laws mean and whether they follow the Constitution', kid: 'decides what the laws mean', brief: 'the Supreme Court and other courts', article: 'III' }
  };
  CV.CHECKS = [
    { id: 'veto', by: 'executive', on: 'legislative', text: 'The President can veto a bill passed by Congress.' },
    { id: 'override', by: 'legislative', on: 'executive', text: 'Congress can override a veto by a two-thirds vote in each house.' },
    { id: 'impeach', by: 'legislative', on: 'executive', text: 'The House can impeach, and the Senate can remove, the President and other officers.' },
    { id: 'confirm', by: 'legislative', on: 'executive', text: 'The Senate confirms or rejects the President\'s appointments.' },
    { id: 'treaty', by: 'legislative', on: 'executive', text: 'The Senate must approve treaties by a two-thirds vote.' },
    { id: 'purse', by: 'legislative', on: 'executive', text: 'Congress controls spending and can refuse to fund programs.' },
    { id: 'war', by: 'legislative', on: 'executive', text: 'Congress declares war and funds the armed forces.' },
    { id: 'nominate', by: 'executive', on: 'judicial', text: 'The President nominates federal judges.' },
    { id: 'pardon', by: 'executive', on: 'judicial', text: 'The President can pardon people convicted of federal crimes.' },
    { id: 'confirmjudges', by: 'legislative', on: 'judicial', text: 'The Senate confirms or rejects federal judges.' },
    { id: 'impeachjudges', by: 'legislative', on: 'judicial', text: 'Congress can impeach and remove federal judges.' },
    { id: 'courts', by: 'legislative', on: 'judicial', text: 'Congress sets up the lower courts and can propose amendments to overturn a ruling.' },
    { id: 'reviewlaws', by: 'judicial', on: 'legislative', text: 'The courts can declare laws unconstitutional (judicial review).' },
    { id: 'reviewacts', by: 'judicial', on: 'executive', text: 'The courts can rule that actions of the President or agencies are unconstitutional or unlawful.' },
    { id: 'presideimpeach', by: 'judicial', on: 'executive', text: 'The Chief Justice presides over the Senate trial of an impeached President.' }
  ];
  CV.check = function (id) { for (var i = 0; i < CV.CHECKS.length; i++) if (CV.CHECKS[i].id === id) return CV.CHECKS[i]; return null; };

  // ---------------------------------------------------------------- how a bill becomes a law
  CV.BILL = [
    { key: 'introduce', name: 'Introduced', text: 'A member introduces the bill in the House or the Senate (revenue bills must start in the House).' },
    { key: 'committee', name: 'Committee', text: 'The bill goes to a committee, which may hold hearings, change it ("mark it up") and vote to send it on. Most bills stop here.' },
    { key: 'floor', name: 'Floor vote', text: 'The full chamber debates the bill and votes; a simple majority passes it (in the Senate, ending a filibuster takes 60 votes).' },
    { key: 'other', name: 'Other chamber', text: 'The other chamber goes through its own committee and floor steps.' },
    { key: 'resolve', name: 'Agree on one text', text: 'Both chambers must pass the same words; differences are worked out by a conference committee or by passing amendments back and forth.' },
    { key: 'president', name: 'To the President', text: 'The President has ten days (Sundays excepted) to act.' },
    { key: 'sign', name: 'Signed', text: 'The President signs the bill and it becomes law.' },
    { key: 'veto', name: 'Vetoed', text: 'The President returns the bill to Congress with objections.' },
    { key: 'override', name: 'Override', text: 'Two-thirds of each house vote to override, and the bill becomes law without the President\'s signature.' },
    { key: 'sustained', name: 'Veto stands', text: 'If either house falls short of two-thirds, the bill dies.' },
    { key: 'unsigned', name: 'Ten days, Congress in session', text: 'If the President does nothing for ten days while Congress is in session, the bill becomes law without a signature.' },
    { key: 'pocket', name: 'Pocket veto', text: 'If Congress adjourns during the ten days and the President has not signed, the bill dies.' },
    { key: 'law', name: 'Law', text: 'The bill is now a law of the United States.' },
    { key: 'dies', name: 'The bill dies', text: 'The bill does not become law.' }
  ];
  CV.billStep = function (k) { for (var i = 0; i < CV.BILL.length; i++) if (CV.BILL[i].key === k) return CV.BILL[i]; return null; };
  CV.billPath = function (path) {
    var base = ['introduce', 'committee', 'floor', 'other', 'resolve', 'president'];
    return base.concat({ sign: ['sign', 'law'], override: ['veto', 'override', 'law'], sustained: ['veto', 'sustained', 'dies'], unsigned: ['unsigned', 'law'], pocket: ['pocket', 'dies'] }[path || 'sign']);
  };

  // ---------------------------------------------------------------- courts
  CV.COURTS = {
    supreme: { name: 'Supreme Court of the United States', short: 'U.S. Supreme Court', system: 'federal', level: 3, note: 'nine justices; hears about 60 cases a year, chosen by certiorari' },
    appeals: { name: 'U.S. Courts of Appeals', short: 'Courts of Appeals', system: 'federal', level: 2, note: '13 courts: 12 regional circuits and the Federal Circuit; panels of three judges' },
    district: { name: 'U.S. District Courts', short: 'District Courts', system: 'federal', level: 1, note: '94 trial courts, at least one in every state' },
    special: { name: 'Specialized federal courts', short: 'Special courts', system: 'federal', level: 1, note: 'such as the Court of International Trade and the Court of Federal Claims' },
    statesupreme: { name: 'State supreme court', short: 'State high court', system: 'state', level: 3, note: 'the last word on its state\'s own law' },
    stateappeals: { name: 'State intermediate appellate court', short: 'State appeals court', system: 'state', level: 2, note: 'most states have one' },
    statetrial: { name: 'State trial courts', short: 'State trial courts', system: 'state', level: 1, note: 'hear most cases in the country: criminal, family, traffic, contracts and more' }
  };
  // which courts must follow a court's decisions (vertical stare decisis; on federal law, state courts follow the U.S. Supreme Court)
  CV.BINDS = { supreme: ['appeals', 'district', 'special', 'statesupreme', 'stateappeals', 'statetrial'], appeals: ['district'], district: [], statesupreme: ['stateappeals', 'statetrial'], stateappeals: ['statetrial'], statetrial: [], special: [] };

  // ---------------------------------------------------------------- levels of scrutiny
  CV.SCRUTINY = {
    tiers: {
      strict: { name: 'Strict scrutiny', interest: 'compelling', fit: 'narrowly tailored (often: the least restrictive means)', burden: 'the government', result: 'laws usually fall' },
      intermediate: { name: 'Intermediate scrutiny', interest: 'important', fit: 'substantially related', burden: 'the government', result: 'laws often fall; sex classifications need an "exceedingly persuasive justification"' },
      rational: { name: 'Rational basis', interest: 'legitimate', fit: 'rationally related', burden: 'the challenger', result: 'laws almost always stand' }
    },
    classes: {
      race: { name: 'Race or national origin', tier: 'strict', cases: ['brown', 'loving', 'adarand'] },
      alienage: { name: 'Alienage (state laws about lawfully present noncitizens)', tier: 'strict', cases: [] },
      fundamental: { name: 'A fundamental right (voting, travel, marriage, speech based on content…)', tier: 'strict', cases: ['reynolds', 'harper', 'reedgilbert'] },
      sex: { name: 'Sex', tier: 'intermediate', cases: ['craig', 'vmi'] },
      legitimacy: { name: 'Birth outside marriage (legitimacy)', tier: 'intermediate', cases: [] },
      neutral: { name: 'Content-neutral rules on speech (time, place, manner)', tier: 'intermediate', cases: ['ward', 'obrien'] },
      age: { name: 'Age', tier: 'rational', cases: [] },
      wealth: { name: 'Wealth or income', tier: 'rational', cases: ['rodriguez'] },
      disability: { name: 'Disability', tier: 'rational', cases: ['cleburne'] },
      economic: { name: 'Economic and social regulation', tier: 'rational', cases: ['leeoptical', 'railwayexpress', 'carolene'] }
    }
  };

  // ---------------------------------------------------------------- notable elections (electoral votes; the official counts)
  CV.ELECTIONS = {
    1800: { note: 'Jefferson and Burr tied; the House chose Jefferson. The Twelfth Amendment (1804) followed.', rows: [['Thomas Jefferson', 73], ['Aaron Burr', 73], ['John Adams', 65], ['Charles C. Pinckney', 64], ['John Jay', 1]] },
    1824: { note: 'No one had a majority; the House chose John Quincy Adams, though Jackson led in electoral and popular votes.', rows: [['Andrew Jackson', 99], ['John Quincy Adams', 84], ['William H. Crawford', 41], ['Henry Clay', 37]] },
    1860: { note: 'Lincoln won a majority of electoral votes with about 40 percent of the popular vote.', rows: [['Abraham Lincoln', 180], ['John C. Breckinridge', 72], ['John Bell', 39], ['Stephen A. Douglas', 12]] },
    1876: { note: 'Disputed returns were settled by a commission and the Compromise of 1877; Tilden led the popular vote.', rows: [['Rutherford B. Hayes', 185], ['Samuel J. Tilden', 184]] },
    2000: { note: 'Decided after Bush v. Gore; Gore led the popular vote; one elector from D.C. cast a blank ballot.', rows: [['George W. Bush', 271], ['Al Gore', 266]] }
  };
  /* =====================================================================================================================
     THE VISUALS (browser only)
     ===================================================================================================================== */
  if (!ML.viz || !D) return;
  var V = ML.viz, M = Math, NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, at, parent) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function btn(parent, text, fn, cls) { var b = h('button', 'ml-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; if (fn) b.addEventListener('click', fn); if (parent) parent.appendChild(b); return b; }
  var uidN = 0; function uid(p) { return 'cvv-' + (p || 'x') + '-' + (++uidN); }
  function okMark(good) { return '<span class="' + (good ? 'cvv-ok' : 'cvv-bad') + '">' + (good ? '✓' : '✗') + '</span> '; }
  function seeded(str) { var x = 0; for (var i = 0; i < str.length; i++) x = (x * 31 + str.charCodeAt(i)) >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
  function shuffle(a, key) { var r = seeded(key), b = a.slice(); for (var i = b.length - 1; i > 0; i--) { var j = M.floor(r() * (i + 1)), t = b[i]; b[i] = b[j]; b[j] = t; } return b; }
  function derange(n, key) { var idx = []; for (var i = 0; i < n; i++) idx.push(i); for (var t = 0; t < 20; t++) { var s = shuffle(idx, key + '#' + t); if (n < 2 || s.some(function (v, j) { return v !== j; })) return s; } return idx.slice(1).concat([0]); }
  function svgRoot(w, hh, label, cls) { return sv('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'cvv-svg' + (cls ? ' ' + cls : ''), role: 'img', 'aria-label': label || '', focusable: 'false' }); }
  function txt(parent, x, y, s, at) { var t = sv('text', Object.assign({ x: x, y: y }, at || {}), parent); t.textContent = s; return t; }
  function letter(i) { return String.fromCharCode(65 + i); }
  function onResize(e, fn) { if ('ResizeObserver' in W) { var last = -1; new ResizeObserver(function () { var w = e.clientWidth; if (w !== last) { last = w; fn(w); } }).observe(e); } else W.addEventListener('resize', function () { fn(e.clientWidth); }); }
  function arr(x) { return x == null ? [] : Array.isArray(x) ? x : [x]; }
  function wrapText(s, max) { var words = String(s).split(/\s+/), lines = [], cur = ''; words.forEach(function (w) { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }); if (cur) lines.push(cur); return lines; }
  function tspans(t, lines, x, dy) { lines.forEach(function (L, i) { var s = sv('tspan', { x: x, dy: i ? dy : 0 }, t); s.textContent = L; }); return t; }

  // the frame every visual shares: class, aria-label, read-to-me note, task line, body, controls, readout, caption
  function frame(el, o, name, label) {
    el.classList.add('cvv', 'cvv-' + name); if (o.big) el.classList.add('cvv-big');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), interactive: o.interactive !== false };
    if (o.readme) el.appendChild(h('p', 'cvv-readme', '<span class="cvv-readme-tag">Read to me</span> ' + o.readme));
    if (o.task) el.appendChild(h('p', 'cvv-task', o.task));
    F.body = h('div', 'cvv-body'); el.appendChild(F.body);
    F.ctl = h('div', 'ml-ctl cvv-ctl'); el.appendChild(F.ctl);
    F.out = h('p', 'ml-readout cvv-out'); F.out.setAttribute('aria-live', 'polite'); el.appendChild(F.out);
    F.say = function (html) { F.out.innerHTML = html || ''; F.out.hidden = !html; };
    F.say('');
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    F.live = F.interactive && !F.quiet; // learners may act and get verdicts
    var nar = function () { el.classList.toggle('cvv-narrow', (el.clientWidth || 600) < 500); }; nar(); onResize(el, nar);
    return F;
  }
  // a Check / Show me pair; check() returns { ok, html }
  function checkButtons(F, check, show) {
    if (!F.live) return;
    btn(F.ctl, 'Check', function () { var r = check(); F.say(okMark(r.ok) + r.html); }, 'pri');
    if (show) btn(F.ctl, 'Show me', function () { show(); });
  }
  // eight category fills that read in both themes (classes cvf-0 … cvf-9 in civics.css), and the theme test
  function fillClass(i) { return 'cvf-' + (((i % 10) + 10) % 10); }
  function dark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  /* ---------------------------------------------------------------- cv-sort: cards into groups */
  V.register('cv-sort', function (el, o) {
    var F = frame(el, o, 'sort', 'Sort the cards into groups');
    var bins = arr(o.bins).length ? arr(o.bins) : ['Yes', 'No'];
    var cards = arr(o.cards).map(function (c, i) { return typeof c === 'string' ? { text: c, bin: arr(o.answer)[i] } : c; });
    var key = JSON.stringify(o.cards || []), order = o.shuffle === false ? cards.map(function (c, i) { return i; }) : shuffle(cards.map(function (c, i) { return i; }), key);
    var place = cards.map(function () { return -1; }), sel = -1;
    if (o.solved) place = cards.map(function (c) { return c.bin; });
    var pool = h('div', 'cvs-pool'), grid = h('div', 'cvs-bins');
    grid.style.setProperty('--cols', String(M.min(bins.length, o.columns || 3)));
    F.body.appendChild(pool); F.body.appendChild(grid);
    if (F.live) F.body.insertBefore(h('p', 'cvv-hint', 'Tap a card, then tap the group it belongs in. With a keyboard, focus a card and press the group\'s number.'), pool);
    var binEls = bins.map(function (b, i) {
      var box = h('div', 'cvs-bin ' + fillClass(i)), head = h(F.live ? 'button' : 'div', 'cvs-binhead', '<span class="cvs-num">' + (i + 1) + '</span> ' + esc(b));
      if (F.live) { head.type = 'button'; head.addEventListener('click', function () { if (sel >= 0) { place[sel] = i; sel = -1; draw(); } }); }
      box.appendChild(head); var list = h('ul', 'cvs-list'); box.appendChild(list); grid.appendChild(box); return list;
    });
    function cardEl(ci, pos) {
      var c = cards[ci], lab = F.quiet ? '<b class="cvs-let">' + letter(pos) + '</b> ' : '';
      var li = h('li', 'cvs-card'), b = h(F.live ? 'button' : 'span', 'cvs-cbtn', lab + esc(c.text));
      if (F.live) {
        b.type = 'button'; b.setAttribute('aria-pressed', sel === ci ? 'true' : 'false');
        b.addEventListener('click', function () { sel = sel === ci ? -1 : ci; draw(); });
        b.addEventListener('keydown', function (e) { var n = parseInt(e.key, 10); if (n >= 1 && n <= bins.length) { place[ci] = n - 1; sel = -1; draw(true, ci); e.preventDefault(); } else if (e.key === '0') { place[ci] = -1; draw(true, ci); } });
      }
      b.setAttribute('data-ci', ci); li.appendChild(b); return li;
    }
    function draw(keepFocus, ci) {
      pool.innerHTML = ''; binEls.forEach(function (l) { l.innerHTML = ''; });
      var left = 0;
      order.forEach(function (idx, pos) { if (place[idx] < 0) { pool.appendChild(cardEl(idx, pos)); left++; } else binEls[place[idx]].appendChild(cardEl(idx, pos)); });
      pool.hidden = !left; F.say('');
      if (keepFocus) { var f = el.querySelector('[data-ci="' + ci + '"]'); if (f) f.focus(); }
    }
    draw();
    checkButtons(F, function () {
      var right = 0, todo = 0;
      cards.forEach(function (c, i) { if (place[i] < 0) todo++; else if (place[i] === c.bin) right++; });
      el.querySelectorAll('.cvs-card').forEach(function (li) { var i = +li.firstChild.getAttribute('data-ci'); li.classList.toggle('ok', place[i] === cards[i].bin); li.classList.toggle('no', place[i] >= 0 && place[i] !== cards[i].bin); });
      var why = cards.filter(function (c, i) { return place[i] >= 0 && place[i] !== c.bin && c.why; }).map(function (c) { return '<br>• ' + esc(c.text) + ': ' + c.why; }).join('');
      return { ok: !todo && right === cards.length, html: right + ' of ' + cards.length + ' in the right group' + (todo ? '; ' + todo + ' still to sort.' : '.') + why };
    }, o.reveal === false ? null : function () { place = cards.map(function (c) { return c.bin; }); sel = -1; draw(); el.querySelectorAll('.cvs-card').forEach(function (li) { li.classList.add('ok'); }); });
    if (F.live) btn(F.ctl, 'Start over', function () { place = cards.map(function () { return -1; }); sel = -1; draw(); });
  });

  /* ---------------------------------------------------------------- cv-order: put items in order */
  V.register('cv-order', function (el, o) {
    var F = frame(el, o, 'order', 'Put the items in order');
    var items = arr(o.items).map(function (t) { return typeof t === 'string' ? { text: t } : t; });
    var cur = o.start ? arr(o.start).slice() : derange(items.length, JSON.stringify(o.items || []));
    var sel = -1, ol = h('ol', 'cvo-list' + (F.quiet ? ' quiet' : '')); F.body.appendChild(ol);
    if (F.live) F.body.insertBefore(h('p', 'cvv-hint', 'Tap one item, then another, to swap them, or use the arrows. Then Check.'), ol);
    function draw(focusPos) {
      ol.innerHTML = '';
      cur.forEach(function (idx, pos) {
        var li = h('li', 'cvo-item'), lab = F.quiet || !F.interactive ? letter(pos) : String(pos + 1), body = '<span class="cvo-num">' + lab + '</span><span class="cvo-text">' + esc(items[idx].text) + '</span>';
        if (!F.live) { li.innerHTML = body; ol.appendChild(li); return; }
        var b = h('button', 'cvo-btn', body); b.type = 'button'; b.setAttribute('aria-pressed', sel === pos ? 'true' : 'false');
        b.addEventListener('click', function () { if (sel < 0) sel = pos; else { var t = cur[sel]; cur[sel] = cur[pos]; cur[pos] = t; sel = -1; } F.say(''); draw(); });
        li.appendChild(b);
        var up = btn(li, '▲', function () { if (pos > 0) { var t = cur[pos - 1]; cur[pos - 1] = cur[pos]; cur[pos] = t; sel = -1; F.say(''); draw(pos - 1); } }, 'cvo-mv'); up.setAttribute('aria-label', 'Move up');
        var dn = btn(li, '▼', function () { if (pos < cur.length - 1) { var t = cur[pos + 1]; cur[pos + 1] = cur[pos]; cur[pos] = t; sel = -1; F.say(''); draw(pos + 1); } }, 'cvo-mv'); dn.setAttribute('aria-label', 'Move down');
        up.disabled = pos === 0; dn.disabled = pos === cur.length - 1;
        ol.appendChild(li);
      });
      if (focusPos != null) { var b = ol.children[focusPos] && ol.children[focusPos].querySelector('.cvo-btn'); if (b) b.focus(); }
    }
    draw();
    checkButtons(F, function () {
      var right = 0; [].forEach.call(ol.children, function (li, pos) { var ok = cur[pos] === pos; if (ok) right++; li.classList.toggle('ok', ok); li.classList.toggle('no', !ok); });
      return { ok: right === items.length, html: right === items.length ? 'All in order.' + (o.why ? ' ' + o.why : '') : right + ' of ' + items.length + ' in the right place.' };
    }, function () { cur = items.map(function (x, i) { return i; }); sel = -1; draw(); });
  });
  /* ---------------------------------------------------------------- cv-timeline */
  function resolveEvents(o) {
    var list = o.events ? arr(o.events).map(function (e, i) { if (typeof e === 'string') { var m = CV.event(e); return m ? Object.assign({}, m) : { id: e, year: 0, label: e }; } return Object.assign({ id: 'e' + i }, e); })
      : CV.events({ tags: o.tags, from: o.from, to: o.to, kid: o.kid });
    return list.filter(function (e) { return isFinite(e.year); }).sort(function (a, b) { return a.year - b.year || (a.id < b.id ? -1 : 1); });
  }
  var mctx = null;
  function measure(s, fs, bold) { try { if (!mctx) mctx = D.createElement('canvas').getContext('2d'); mctx.font = (bold ? '700 ' : '') + fs + 'px system-ui,-apple-system,"Segoe UI",sans-serif'; return mctx.measureText(s).width * 1.04; } catch (e) { return s.length * fs * 0.6; } }
  function niceStep(span, px) { var raw = span / M.max(2, px / 70), m = M.pow(10, M.floor(M.log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * m; }
  V.register('cv-timeline', function (el, o) {
    var F = frame(el, o, 'timeline', 'A time line');
    var evs = resolveEvents(o), mode = o.mode || 'show', hl = arr(o.highlight);
    if (!evs.length) { F.body.appendChild(h('p', 'cvv-hint', 'No events to show.')); return; }
    var y0 = o.from != null ? o.from : evs[0].year, y1 = o.to != null ? o.to : M.max.apply(null, evs.map(function (e) { return e.end || e.year; }));
    if (y1 - y0 < 4) { y0 -= 2; y1 += 2; } var pad = (y1 - y0) * 0.04; y0 = M.floor(y0 - pad); y1 = M.ceil(y1 + pad);
    var view = [y0, y1], eras = o.eras ? (CV.ERAS[o.eras] || CV.ERAS.apush) : null;
    var lettersOn = !!o.letters || mode === 'place';
    var place = {}, sel = null; // place mode: card id -> marker index
    var wrap = h('div', 'cvt-wrap'); F.body.appendChild(wrap);
    var cardsBox = h('div', 'cvt-cards'); if (mode === 'place') F.body.appendChild(cardsBox);
    function labelOf(e, i) {
      if (o.ask === e.id) return '?';
      if (lettersOn) return letter(i);
      return e.label;
    }
    function yearOf(e) { if (o.askYear === e.id || mode === 'place' || (lettersOn && o.hideYears !== false)) return o.askYear === e.id ? '?' : ''; return e.end ? e.year + '–' + e.end : String(e.year); }
    function aria() { return 'A time line from ' + view[0] + ' to ' + view[1] + (F.quiet || lettersOn ? '' : ': ' + evs.map(function (e) { return e.year + ', ' + e.label; }).join('; ')); }
    function drawWide(w) {
      var big = !!o.big, fs = big ? 16 : 13, lh = fs + 3, maxc = big ? 18 : 24, a = view[0], b = view[1], L = 16, R = w - 16;
      var X = function (y) { return L + (y - a) / (b - a) * (R - L); };
      var shown = evs.filter(function (e) { return e.year >= a && e.year <= b; });
      // label boxes: wrap, measure, assign alternating sides and stacking levels
      var boxes = shown.map(function (e, k) {
        var idx = evs.indexOf(e), lab = labelOf(e, idx), lines = lab.length <= 2 ? [lab] : wrapText(lab, maxc).slice(0, 3), yr = yearOf(e);
        if (yr) lines = [yr].concat(lines);
        var bw = M.max.apply(null, lines.map(function (s, j) { return measure(s, fs, j === 0 && !!yr); })) + 16; bw = M.min(bw, (R - L) * 0.6);
        return { e: e, idx: idx, lines: lines, yr: !!yr, w: lab.length <= 2 && !yr ? fs * 1.9 : bw, h: lines.length * lh + 8, x: X(e.year) };
      });
      var sides = [[], []];
      boxes.forEach(function (bx, k) {
        var left = M.max(L, M.min(R - bx.w, bx.x - bx.w / 2)); bx.left = left;
        function free(side) { var lv = 0; while (sides[side].some(function (o2) { return o2.lv === lv && !(left > o2.left + o2.w + 6 || left + bx.w + 6 < o2.left); })) lv++; return lv; }
        var l0 = free(0), l1 = free(1), side = l0 < l1 ? 0 : l1 < l0 ? 1 : k % 2;
        bx.side = side; bx.lv = side ? l1 : l0; sides[side].push(bx);
      });
      var lvH = function (side) { var hs = sides[side].map(function (bx) { return bx.lv; }); return hs.length ? M.max.apply(null, hs) + 1 : 0; };
      if (lvH(0) > 5 || lvH(1) > 5) return null; // too crowded for one line: the caller draws the list instead
      var rowH = M.max.apply(null, boxes.map(function (bx) { return bx.h; }).concat([30])) + 10;
      var top = lvH(0) * rowH + 14, axisY = top + (eras ? 30 : 12), H = axisY + 30 + lvH(1) * rowH + 6;
      var svg = svgRoot(w, H, aria(), 'cvt-svg'); svg.style.height = H + 'px';
      // eras
      if (eras) eras.forEach(function (er, i) {
        var xa = M.max(L, X(er.from)), xb = M.min(R, X(er.to)); if (xb <= xa) return;
        sv('rect', { x: xa, y: axisY - 26, width: xb - xa, height: 22, rx: 5, class: fillClass(i) + ' cvt-era' }, svg);
        if (xb - xa > 46) txt(svg, (xa + xb) / 2, axisY - 11, er.name.replace('Period ', xb - xa < 80 ? 'P' : 'Period '), { 'text-anchor': 'middle', class: 'cvt-eratext' });
      });
      // axis and ticks
      sv('line', { x1: L, x2: R, y1: axisY, y2: axisY, class: 'cvt-axis' }, svg);
      var st = niceStep(b - a, R - L);
      for (var t = M.ceil(a / st) * st; t <= b; t += st) { var x = X(t); sv('line', { x1: x, x2: x, y1: axisY - 4, y2: axisY + 4, class: 'cvt-tick' }, svg); txt(svg, x, axisY + 18, String(t), { 'text-anchor': 'middle', class: 'cvt-ticktext' }); }
      // events
      var leads = sv('g', null, svg);
      boxes.forEach(function (bx) {
        var e = bx.e, g = sv('g', { class: 'cvt-ev' + (hl.indexOf(e.id) >= 0 && !F.quiet ? ' hl' : '') + (o.ask === e.id || o.askYear === e.id ? ' ask' : '') }, svg), x = bx.x;
        if (e.end) sv('rect', { x: x, y: axisY - 3, width: M.max(3, X(M.min(e.end, b)) - x), height: 6, rx: 3, class: 'cvt-span' }, g);
        var by = bx.side === 0 ? top - (bx.lv + 1) * rowH + 4 : axisY + 30 + bx.lv * rowH;
        var bxY = bx.side === 0 ? by + rowH - 10 - bx.h : by;
        sv('line', { x1: x, x2: x, y1: axisY, y2: bx.side === 0 ? bxY + bx.h : bxY, class: 'cvt-lead' }, leads);
        sv('circle', { cx: x, cy: axisY, r: 5, class: 'cvt-dot' }, g);
        sv('rect', { x: bx.left, y: bxY, width: bx.w, height: bx.h, rx: 7, class: 'cvt-box' }, g);
        var tx = txt(g, bx.left + 7, bxY + 4 + fs, '', { class: 'cvt-label', 'font-size': fs });
        bx.lines.forEach(function (Ln, i) { var s = sv('tspan', { x: bx.left + 7, dy: i ? lh : 0, class: i === 0 && bx.yr ? 'cvt-yr' : '' }, tx); s.textContent = Ln; });
        if (mode === 'place') { g.setAttribute('data-mark', bx.idx); if (F.live) { g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'Mark ' + letter(bx.idx)); g.style.cursor = 'pointer'; } }
      });
      wrap.appendChild(svg);
      return svg;
    }
    function drawNarrow() {
      var ul = h('ol', 'cvt-vlist' + (o.big ? ' big' : '')), lastEra = null;
      evs.filter(function (e) { return e.year >= view[0] && e.year <= view[1]; }).forEach(function (e) {
        var idx = evs.indexOf(e);
        if (eras) { var er = eras.filter(function (p) { return e.year >= p.from && e.year < p.to || (p === eras[eras.length - 1] && e.year >= p.from); })[0]; if (er && er !== lastEra) { ul.appendChild(h('li', 'cvt-vera ' + fillClass(eras.indexOf(er)), esc(er.name) + ' <small>' + er.from + '–' + er.to + '</small>')); lastEra = er; } }
        var yr = yearOf(e), li = h('li', 'cvt-vrow' + (hl.indexOf(e.id) >= 0 && !F.quiet ? ' hl' : '') + (o.ask === e.id || o.askYear === e.id ? ' ask' : ''));
        li.innerHTML = '<span class="cvt-vyr">' + esc(yr || (lettersOn ? '' : '')) + '</span><span class="cvt-vdot" aria-hidden="true"></span><span class="cvt-vtext">' + esc(labelOf(e, idx)) + (e.end && yr ? '' : '') + '</span>';
        if (mode === 'place') { li.setAttribute('data-mark', idx); if (F.live) { li.tabIndex = 0; li.setAttribute('role', 'button'); } }
        ul.appendChild(li);
      });
      ul.setAttribute('aria-label', aria());
      wrap.appendChild(ul); return ul;
    }
    var cards = mode === 'place' ? shuffle(evs.map(function (e, i) { return i; }), 'tl' + evs.map(function (e) { return e.id; }).join()) : [];
    function drawCards() {
      cardsBox.innerHTML = '';
      if (mode !== 'place') return;
      if (F.live) cardsBox.appendChild(h('p', 'cvv-hint', 'Tap an event, then tap the letter on the time line where it belongs.'));
      var ul = h('ul', 'cvt-cardlist'); cardsBox.appendChild(ul);
      cards.forEach(function (ci) {
        var e = evs[ci], li = h('li', 'cvt-card'), at = place[e.id];
        var b = h(F.live ? 'button' : 'span', 'cvt-cbtn', (at != null ? '<b>' + letter(at) + '</b> ' : '') + esc(e.label));
        if (F.live) { b.type = 'button'; b.setAttribute('aria-pressed', sel === e.id ? 'true' : 'false'); b.addEventListener('click', function () { sel = sel === e.id ? null : e.id; drawCards(); }); }
        li.appendChild(b); ul.appendChild(li);
      });
    }
    function hookMarks() {
      if (mode !== 'place' || !F.live) return;
      wrap.querySelectorAll('[data-mark]').forEach(function (m) {
        function go() { if (sel == null) return; var k = +m.getAttribute('data-mark'); Object.keys(place).forEach(function (id) { if (place[id] === k) delete place[id]; }); place[sel] = k; sel = null; F.say(''); drawCards(); }
        m.addEventListener('click', go); m.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
    }
    var narrowAt = o.big ? 600 : 560, cw = 0;
    function render() { wrap.innerHTML = ''; var w = el.clientWidth - 24 || 600; cw = w; if (w < narrowAt || o.layout === 'vertical' || !drawWide(w)) { wrap.innerHTML = ''; drawNarrow(); } hookMarks(); }
    render(); drawCards();
    onResize(el, function () { var w = el.clientWidth - 24; if (M.abs(w - cw) > 4) render(); });
    // zoom and pan (wide screens)
    if (o.zoom && F.interactive) {
      var full = view.slice();
      function zoom(f) { var c = (view[0] + view[1]) / 2, half = M.max(3, (view[1] - view[0]) * f / 2); view = [M.max(full[0], M.round(c - half)), M.min(full[1], M.round(c + half))]; render(); }
      btn(F.ctl, '＋ Zoom in', function () { zoom(0.5); }); btn(F.ctl, '− Zoom out', function () { zoom(2); }); btn(F.ctl, 'All', function () { view = full.slice(); render(); });
      if (eras) { var sg = h('div', 'ml-seg cvt-eras'); eras.filter(function (er) { return er.to > full[0] && er.from < full[1]; }).forEach(function (er) { btn(sg, er.name, function () { view = [er.from - 2, er.to + 2]; render(); }); }); F.ctl.appendChild(sg); }
      var dragX = null;
      wrap.addEventListener('pointerdown', function (e) { if (cw >= narrowAt) { dragX = e.clientX; wrap.setPointerCapture && wrap.setPointerCapture(e.pointerId); } });
      wrap.addEventListener('pointermove', function (e) {
        if (dragX == null) return; var dx = e.clientX - dragX, span = view[1] - view[0], dy = -dx / cw * span;
        if (M.abs(dy) >= 1) { var nv = [view[0] + dy, view[1] + dy]; if (nv[0] < full[0]) nv = [full[0], full[0] + span]; if (nv[1] > full[1]) nv = [full[1] - span, full[1]]; view = [M.round(nv[0]), M.round(nv[1])]; dragX = e.clientX; render(); }
      });
      wrap.addEventListener('pointerup', function () { dragX = null; });
    }
    if (mode === 'place') checkButtons(F, function () {
      var right = evs.filter(function (e, i) { return place[e.id] === i; }).length, todo = evs.filter(function (e) { return place[e.id] == null; }).length;
      return { ok: right === evs.length, html: right + ' of ' + evs.length + ' placed correctly' + (todo ? '; ' + todo + ' not placed yet.' : '.') };
    }, function () { evs.forEach(function (e, i) { place[e.id] = i; }); drawCards(); });
  });
  /* ---------------------------------------------------------------- tile maps (one square per state) */
  var TILE = 56;
  // draws the tile grid into a new svg; o: { only: [abs] (others are ghosts), fill(st) -> class, text(st) -> second line,
  // label(st) -> main label, cls(st) -> extra class, onPick(ab) }
  function tileSvg(o) {
    var states = CV.STATES.concat(o.dc ? [CV.DC] : []), cols = 11, rows = 8, gap = 4;
    var svg = svgRoot(cols * TILE, rows * TILE, o.aria || 'A tile map of the United States', 'cvm-tiles');
    var groups = {};
    states.forEach(function (st) {
      var ghost = o.only && o.only.indexOf(st.ab) < 0;
      var g = sv('g', { class: 'cvm-tile' + (ghost ? ' ghost' : '') + (o.cls ? ' ' + (o.cls(st) || '') : ''), transform: 'translate(' + (st.c * TILE + gap / 2) + ',' + (st.r * TILE + gap / 2) + ')' }, svg);
      var s = TILE - gap;
      sv('rect', { width: s, height: s, rx: 6, class: ghost ? 'cvm-ghost' : (o.fill ? o.fill(st) : 'cvm-plain') }, g);
      if (!ghost || o.ghostLabels) {
        var lab = o.label ? o.label(st) : st.ab, two = o.text ? o.text(st) : '';
        txt(g, s / 2, two ? s / 2 - 3 : s / 2 + 5, lab, { 'text-anchor': 'middle', class: 'cvm-ab' + (ghost ? ' g' : '') });
        if (two) txt(g, s / 2, s / 2 + 15, two, { 'text-anchor': 'middle', class: 'cvm-val' });
      }
      if (o.onPick && !ghost) {
        g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', o.pickLabel ? o.pickLabel(st) : st.name); g.style.cursor = 'pointer';
        g.addEventListener('click', function () { o.onPick(st.ab); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); o.onPick(st.ab); } });
      }
      groups[st.ab] = g;
    });
    return { svg: svg, g: groups };
  }
  function legend(parent, items) { // items: [[class, html]]
    var ul = h('ul', 'cvv-legend'); items.forEach(function (it) { var li = h('li', '', '<i class="cvv-sw ' + it[0] + '" aria-hidden="true"></i><span>' + it[1] + '</span>'); ul.appendChild(li); }); parent.appendChild(ul); return ul;
  }
  var ADM_BINS = [[1787, 1790, 'The original 13 (1787–1790)'], [1791, 1820, '1791–1820'], [1821, 1860, '1821–1860'], [1861, 1900, '1861–1900'], [1901, 1959, '1901–1959']];
  var EV_BINS = [[3, 3, '3'], [4, 6, '4–6'], [7, 10, '7–10'], [11, 19, '11–19'], [20, 99, '20 or more']];
  function binOf(bins, v) { for (var i = 0; i < bins.length; i++) if (v >= bins[i][0] && v <= bins[i][1]) return i; return -1; }

  /* ---------------------------------------------------------------- the geographic map (simplified outlines, Albers projection) */
  var GEO = null;
  function geo() {
    if (GEO) return GEO;
    var P = CV.proj, G = CV.GEO, pts = G.outline.map(function (p) { return P.lower48(p[0], p[1]); });
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var x0 = M.min.apply(null, xs), x1 = M.max.apply(null, xs), yA = M.min.apply(null, ys), yB = M.max.apply(null, ys);
    var Wd = 960, padL = 20, padT = 30, k = (Wd - 2 * padL) / (x1 - x0), Hd = (yB - yA) * k + padT + 40;
    function L48(lon, lat) { var p = P.lower48(lon, lat); return [padL + (p[0] - x0) * k, Hd - 40 - (p[1] - yA) * k]; }
    // insets: Alaska at 35% scale, Hawaii at full scale, in the lower left
    var ak = G.alaska.map(function (p) { return P.alaska(p[0], p[1]); }), akx = ak.map(function (p) { return p[0]; }), aky = ak.map(function (p) { return p[1]; });
    var akx0 = M.min.apply(null, akx), aky0 = M.min.apply(null, aky), aky1 = M.max.apply(null, aky), ka = k * 0.35;
    function AK(lon, lat) { var p = P.alaska(lon, lat); return [24 + (p[0] - akx0) * ka, Hd - 12 - (p[1] - aky0) * ka]; }
    var hiAll = [].concat.apply([], G.hawaii).map(function (p) { return P.hawaii(p[0], p[1]); });
    var hx0 = M.min.apply(null, hiAll.map(function (p) { return p[0]; })), hy0 = M.min.apply(null, hiAll.map(function (p) { return p[1]; }));
    function HI(lon, lat) { var p = P.hawaii(lon, lat); return [250 + (p[0] - hx0) * k, Hd - 22 - (p[1] - hy0) * k]; }
    GEO = { W: Wd, H: Hd, L48: L48, AK: AK, HI: HI, akH: (aky1 - aky0) * ka };
    return GEO;
  }
  function densify(pts, close) { // long straight runs in longitude and latitude (borders on parallels) curve on the projection
    var out = [], n = pts.length;
    for (var i = 0; i < n; i++) {
      var a = pts[i], b = pts[i + 1] || (close === false ? null : pts[0]); out.push(a); if (!b) continue;
      var k = M.ceil(M.max(M.abs(b[0] - a[0]), M.abs(b[1] - a[1])) / 1.5);
      for (var j = 1; j < k; j++) out.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]);
    }
    return out;
  }
  function pathOf(pts, f, close) { return densify(pts, close).map(function (p, i) { var q = f(p[0], p[1]); return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('') + (close === false ? '' : 'Z'); }
  function project(lon, lat) { var g = geo(); if (lat > 51 && lon < -129) return g.AK(lon, lat); if (lat < 23 && lon < -150) return g.HI(lon, lat); return g.L48(lon, lat); }
  // draws the base map: returns { svg, g (inside the clip), top (labels layer) }
  function geoSvg(aria, fillBase) {
    var g = geo(), G = CV.GEO, svg = svgRoot(g.W, g.H, aria, 'cvm-geo'), id = uid('clip');
    var defs = sv('defs', null, svg), cp = sv('clipPath', { id: id }, defs);
    sv('path', { d: pathOf(G.outline, g.L48) }, cp); G.islands.forEach(function (isl) { sv('path', { d: pathOf(isl, g.L48) }, cp); });
    sv('rect', { x: 0, y: 0, width: g.W, height: g.H, class: 'cvm-sea' }, svg);
    var base = sv('g', null, svg);
    sv('path', { d: pathOf(G.outline, g.L48), class: fillBase || 'cvm-land' }, base); G.islands.forEach(function (isl) { sv('path', { d: pathOf(isl, g.L48), class: fillBase || 'cvm-land' }, base); });
    var clip = sv('g', { 'clip-path': 'url(#' + id + ')' }, svg);
    var akG = sv('g', { class: 'cvm-inset' }, svg), hiG = sv('g', { class: 'cvm-inset' }, svg);
    var akP = sv('path', { d: pathOf(G.alaska, g.AK), class: fillBase || 'cvm-land' }, akG); var akI = G.alaskaIslands.map(function (isl) { return sv('path', { d: pathOf(isl, g.AK), class: fillBase || 'cvm-land' }, akG); });
    var hiP = G.hawaii.map(function (isl) { return sv('path', { d: pathOf(isl, g.HI), class: fillBase || 'cvm-land' }, hiG); });
    sv('rect', { x: 8, y: g.H - g.akH - 30, width: 210, height: g.akH + 26, rx: 6, class: 'cvm-insetbox' }, svg);
    sv('rect', { x: 236, y: g.H - 96, width: 140, height: 90, rx: 6, class: 'cvm-insetbox' }, svg);
    var over = sv('g', null, svg);
    return { svg: svg, clip: clip, over: over, base: base, ak: [akP].concat(akI), hi: hiP, finish: function () {
      G.lakes.forEach(function (lk) { sv('path', { d: pathOf(lk, g.L48), class: 'cvm-lake' }, over); });
      sv('path', { d: pathOf(G.outline, g.L48), class: 'cvm-coast' }, over);
    } };
  }

  V.register('cv-map', function (el, o) {
    var mode = o.mode || 'states', F = frame(el, o, 'map', 'A map of the United States'), hl = arr(o.highlight), box = h('div', 'cvm-box'); F.body.appendChild(box);
    var leg = h('div', 'cvm-leg'); F.body.appendChild(leg);
    if (mode === 'territory') return territory();
    if (mode === 'places') return places();
    // ---- tile modes
    var color = o.color || (mode === 'colonies' ? 'colony' : mode === 'circuits' ? 'circuit' : mode === 'growth' ? 'admitted' : 'region'), picked = null;
    var year = o.year || 1850, only = null;
    var circuitKeys = Object.keys(CV.CIRCUITS);
    function fill(st) {
      if (hl.indexOf(st.ab) >= 0 && !(F.quiet && o.ask === st.ab)) return 'cvm-hl';
      if (color === 'none') return 'cvm-plain';
      if (color === 'region') return fillClass(CV.REGIONS.indexOf(st.region));
      if (color === 'admitted') return st.dc ? 'cvm-plain' : fillClass(binOf(ADM_BINS, st.year));
      if (color === 'ev') return fillClass(binOf(EV_BINS, st.ev));
      if (color === 'colony') { var c = CV.COLONIES.filter(function (x) { return x.ab === st.ab; })[0]; return c ? fillClass(['New England', 'Middle', 'Southern'].indexOf(c.region)) : 'cvm-plain'; }
      if (color === 'circuit') return fillClass(circuitKeys.indexOf(CV.circuitOf(st.ab)));
      return 'cvm-plain';
    }
    function label(st) { return o.ask === st.ab ? '?' : st.ab; }
    function text(st) {
      if (o.ask === st.ab) return '';
      if (o.values && o.values[st.ab] != null) return String(o.values[st.ab]);
      if (color === 'circuit' && o.labels !== false) return CV.circuitOf(st.ab) || '';
      if (mode === 'colonies' && o.labels !== false && !F.quiet) { var c = CV.COLONIES.filter(function (x) { return x.ab === st.ab; })[0]; return c ? String(c.founded) : ''; }
      return '';
    }
    function draw() {
      box.innerHTML = '';
      if (mode === 'colonies') only = CV.COLONIES.map(function (c) { return c.ab; });
      else if (mode === 'growth') only = CV.statesBy(year).map(function (s) { return s.ab; });
      var T = tileSvg({ only: only, fill: fill, label: label, text: text, dc: mode === 'circuits' || o.dc, aria: aria(), cls: function (st) { return st.ab === picked ? 'picked' : ''; },
        onPick: F.live && o.pick ? function (ab) { picked = ab; F.say(''); draw(); } : null, pickLabel: function (st) { return o.ask === st.ab ? 'A state' : st.name; } });
      box.appendChild(T.svg);
    }
    function aria() {
      if (mode === 'colonies') return 'A tile map of the thirteen colonies' + (F.quiet ? '' : ': New England, Middle and Southern colonies') + '.';
      if (mode === 'growth') return 'A tile map of the states in the Union in ' + year + (F.quiet ? '.' : ': ' + CV.statesBy(year).length + ' states.');
      if (mode === 'circuits') return 'A tile map of the federal judicial circuits.';
      return 'A tile map of the 50 states' + (o.ask ? ', with one state marked with a question mark.' : '.');
    }
    function drawLegend() {
      leg.innerHTML = '';
      if (o.legend === false) return;
      if (color === 'region') legend(leg, CV.REGIONS.map(function (r, i) { return [fillClass(i), r]; }));
      if (color === 'admitted') legend(leg, ADM_BINS.map(function (b, i) { return [fillClass(i), b[2]]; }));
      if (color === 'ev') legend(leg, EV_BINS.map(function (b, i) { return [fillClass(i), b[2] + ' electoral votes']; }));
      if (color === 'colony') legend(leg, [[fillClass(0), 'New England colonies'], [fillClass(1), 'Middle colonies'], [fillClass(2), 'Southern colonies']]);
      if (color === 'circuit') legend(leg, [['cvm-plain', 'Circuits are numbered 1st to 11th, plus the D.C. Circuit; the Federal Circuit hears certain subjects from everywhere.']]);
    }
    draw(); drawLegend();
    if (mode === 'growth') {
      var out = function () { if (!F.quiet) F.say('<b>' + year + '</b>: ' + CV.statesBy(year).length + ' states'); };
      if (F.interactive && o.slider !== false) V.slider(F.ctl, { label: 'Year', min: 1787, max: 1960, step: 1, value: year, fmt: function (v) { return String(v); }, input: function (v) { year = v; draw(); out(); } });
      out();
    }
    if (o.pick && F.live) checkButtons(F, function () {
      var t = CV.state(o.target), p = CV.state(picked);
      if (!p) return { ok: false, html: 'Tap a state first.' };
      return { ok: picked === o.target, html: picked === o.target ? p.name + '.' : 'That is ' + p.name + '.' };
    }, null);
    // ---- the geographic modes
    function territory() {
      var yr = o.year || 9999, show = o.show ? arr(o.show) : CV.ACQ.map(function (a) { return a.key; }), g = geo(), G = CV.GEO;
      var wide = function () { return el.clientWidth > 600; };
      var B = geoSvg('A simplified map of how the United States acquired its land' + (yr < 9999 ? ' by ' + yr : '') + (F.quiet ? '' : ': ' + CV.ACQ.filter(function (a) { return a.year <= yr; }).map(function (a) { return a.name + ' ' + a.year; }).join(', ')) + '. Boundaries are approximate.', fillClass(0));
      function cls(key, i) { var a = CV.acq(key); return a.year > yr ? 'cvm-later' : show.indexOf(key) < 0 ? 'cvm-land' : fillClass(i); }
      // the 1783 lands are the base fill
      var base0 = cls('treaty1783', 0); [].forEach.call(B.base.children, function (p) { p.setAttribute('class', base0); });
      ['louisiana', 'redriver', 'florida', 'oregon', 'mexican', 'texas', 'gadsden'].forEach(function (k) { var i = CV.ACQ.indexOf(CV.acq(k)); sv('path', { d: pathOf(G.acq[k], g.L48), class: cls(k, i) + ' cvm-acq' }, B.clip); });
      B.ak.forEach(function (p) { p.setAttribute('class', cls('alaska', 8)); }); B.hi.forEach(function (p) { p.setAttribute('class', cls('hawaii', 9)); });
      B.finish();
      var labs = sv('g', { class: 'cvm-labels' }, B.svg);
      function drawLabels() {
        labs.innerHTML = '';
        CV.ACQ.forEach(function (a, i) {
          if (show.indexOf(a.key) < 0 || a.year > yr) return;
          var p = G.labels[a.key] || [-84.5, 38.3], q = project(p[0], p[1]), asked = o.ask === a.key;
          if (wide() && !asked && !o.numbered) {
            var t = txt(labs, q[0], q[1], '', { 'text-anchor': 'middle', class: 'cvm-maplab' });
            tspans(t, (a.key === 'gadsden' || a.key === 'redriver' ? [a.name.replace(' Purchase', '').replace(' Basin', ''), String(a.year)] : [a.name, String(a.year)]), q[0], 22);
          } else {
            sv('circle', { cx: q[0], cy: q[1], r: 17, class: 'cvm-pin' + (asked ? ' ask' : '') }, labs);
            txt(labs, q[0], q[1] + 7, asked ? '?' : String(i + 1), { 'text-anchor': 'middle', class: 'cvm-pinnum' });
          }
        });
      }
      drawLabels(); box.appendChild(B.svg);
      if (o.legend !== false) {
        var items = CV.ACQ.filter(function (a) { return show.indexOf(a.key) >= 0 && a.year <= yr; }).map(function (a) { // only what the map shows by its year
          var i = CV.ACQ.indexOf(a), asked = o.ask === a.key && F.quiet;
          return [a.year > yr ? 'cvm-later' : fillClass(i), '<b>' + (i + 1) + '</b> ' + (asked ? '?' : esc(a.name) + ', ' + a.year + (F.quiet ? '' : ' <small>from ' + esc(a.from) + ' (' + esc(a.how) + ')</small>'))];
        });
        if (yr < 9999) items.push(['cvm-later', 'Not yet part of the United States in ' + yr]);
        legend(leg, items);
      }
      leg.appendChild(h('p', 'cvv-note', 'A simplified map: boundaries are approximate. Native nations lived on all of this land; most of it passed to the United States through many later treaties, purchases and removals.'));
      onResize(el, drawLabels);
    }
    function places() {
      var keys = o.places ? arr(o.places) : Object.keys(CV.PLACES).slice(0, 8), B = geoSvg('A map of the United States with ' + keys.length + ' places marked' + (o.numbered || F.quiet ? '.' : ': ' + keys.map(function (k) { return (CV.PLACES[k] || {}).name; }).join(', ') + '.'));
      B.finish();
      arr(o.trails).forEach(function (t, i) { var tr = CV.TRAILS[t]; if (!tr) return; sv('path', { d: pathOf(tr.pts, geo().L48, false), class: 'cvm-trail cvm-trail' + i }, B.svg); });
      var labs = sv('g', { class: 'cvm-labels' }, B.svg);
      function drawLabels() {
        labs.innerHTML = ''; var wide = el.clientWidth > 600, taken = [];
        // name labels where they fit (right, left, above, below the dot); otherwise a numbered pin, named in the legend
        var pts = keys.map(function (k) { var p = CV.PLACES[k]; return p ? project(p.lon, p.lat) : null; });
        pts.forEach(function (q) { if (q) taken.push([q[0] - 8, q[1] - 8, 16, 16]); });
        function hits(b) { return taken.some(function (t) { return b[0] < t[0] + t[2] && b[0] + b[2] > t[0] && b[1] < t[1] + t[3] && b[1] + b[3] > t[1]; }); }
        keys.forEach(function (k, i) {
          var p = CV.PLACES[k]; if (!p) return; var q = pts[i], asked = o.ask === k, numbered = o.numbered || !wide || asked, spot = null;
          if (!numbered) {
            var w = measure(p.name, 15, true) + 4, cands = [[q[0] + 11, q[1] - 10, 'start'], [q[0] - 11 - w, q[1] - 10, 'end'], [q[0] - w / 2, q[1] - 30, 'mid'], [q[0] - w / 2, q[1] + 10, 'mid']];
            for (var c = 0; c < cands.length && !spot; c++) { var b = [cands[c][0], cands[c][1], w, 20]; if (b[0] > 2 && b[0] + w < geo().W - 2 && !hits(b)) spot = b; }
            if (!spot) numbered = true; else taken.push(spot);
          }
          sv('circle', { cx: q[0], cy: q[1], r: numbered ? 15 : 7, class: 'cvm-pin' + (asked ? ' ask' : '') + (hl.indexOf(k) >= 0 ? ' hl' : '') }, labs);
          if (numbered) txt(labs, q[0], q[1] + 6, asked ? '?' : String(i + 1), { 'text-anchor': 'middle', class: 'cvm-pinnum' });
          else txt(labs, spot[0], spot[1] + 15, p.name, { class: 'cvm-placelab' });
        });
      }
      drawLabels(); box.appendChild(B.svg);
      if (o.legend !== false && !(F.quiet && o.numbered)) legend(leg, keys.map(function (k, i) { return ['cvm-pinsw', '<b>' + (i + 1) + '</b> ' + (o.ask === k && F.quiet ? '?' : esc((CV.PLACES[k] || {}).name || k))]; }).concat(arr(o.trails).map(function (t, i) { return ['cvm-trailsw cvm-trail' + i, esc((CV.TRAILS[t] || {}).name || t)]; })));
      leg.appendChild(h('p', 'cvv-note', 'A simplified map: coasts and borders are approximate.'));
      onResize(el, drawLabels);
    }
  });
  /* ---------------------------------------------------------------- cv-flag */
  var FRED = '#b22234', FWHITE = '#ffffff', FBLUE = '#3c3b6e';
  function starPath(cx, cy, r) { var d = ''; for (var i = 0; i < 10; i++) { var a = -M.PI / 2 + i * M.PI / 5, rr = i % 2 ? r * 0.382 : r; d += (i ? 'L' : 'M') + (cx + rr * M.cos(a)).toFixed(2) + ' ' + (cy + rr * M.sin(a)).toFixed(2); } return d + 'Z'; }
  function starRows(n) {
    if (n === 50) return [6, 5, 6, 5, 6, 5, 6, 5, 6];
    if (n === 48) return [8, 8, 8, 8, 8, 8];
    if (n === 49) return [7, 7, 7, 7, 7, 7, 7];
    if (n === 15) return [3, 3, 3, 3, 3];
    if (n === 20) return [5, 5, 5, 5];
    var r = M.max(2, M.round(M.sqrt(n * 0.55))), rows = []; for (var i = 0; i < r; i++) rows.push(M.floor(n / r) + (i < n % r ? 1 : 0)); return rows;
  }
  // draws a flag of width w into g at x, y; returns { h, stripes: [rects], stars: [paths] }
  function drawFlag(g, x, y, w, stars, stripes, o) {
    o = o || {}; var hgt = w / 1.9, sh = hgt / stripes, out = { h: hgt, stripes: [], stars: [] };
    for (var i = 0; i < stripes; i++) out.stripes.push(sv('rect', { x: x, y: y + i * sh, width: w, height: sh + 0.3, fill: i % 2 ? FWHITE : FRED, class: 'cvf-stripe' }, g));
    var cw = w * 0.4, ch = sh * M.ceil(stripes / 2 + 0.5) - (stripes === 13 ? 0 : 0); if (stripes === 13) ch = sh * 7; if (stripes === 15) ch = sh * 8;
    sv('rect', { x: x, y: y, width: cw, height: ch, fill: FBLUE }, g);
    var sr = M.min(cw, ch) * (stars <= 15 ? 0.075 : 0.05);
    if (o.circle || (stars === 13 && o.circle !== false)) {
      for (var k = 0; k < 13; k++) { var a = -M.PI / 2 + k * 2 * M.PI / 13, R = M.min(cw, ch) * 0.34; out.stars.push(sv('path', { d: starPath(x + cw / 2 + R * M.cos(a), y + ch / 2 + R * M.sin(a), sr * 1.2), fill: FWHITE, class: 'cvf-star' }, g)); }
    } else {
      var rows = starRows(stars), nr = rows.length, maxr = M.max.apply(null, rows), alt = rows.some(function (n) { return n !== maxr; });
      rows.forEach(function (n, ri) {
        var yy = y + ch * (ri + 1) / (nr + 1), cols = alt ? maxr * 2 : maxr;
        for (var c = 0; c < n; c++) {
          var xx = alt ? x + cw * ((n === maxr ? 2 * c + 1 : 2 * c + 2)) / (cols + 1) : x + cw * (c + 1) / (n + 1);
          out.stars.push(sv('path', { d: starPath(xx, yy, sr * (stars <= 20 ? 1.3 : 1)), fill: FWHITE, class: 'cvf-star' }, g));
        }
      });
    }
    sv('rect', { x: x, y: y, width: w, height: hgt, fill: 'none', class: 'cvf-edge' }, g);
    return out;
  }
  V.register('cv-flag', function (el, o) {
    var F = frame(el, o, 'flag', 'The flag of the United States');
    var years = o.compare ? arr(o.compare) : [o.year || null], n = years.length;
    var W = 380, gap = 30, fw = n > 1 ? (W * 2 - gap * (n - 1)) / n : W, fh = fw / 1.9, H = fh + (n > 1 ? 40 : 14) + (o.count === 'stripes' ? 0 : 0);
    var totalW = n > 1 ? W * 2 : W + (o.count === 'stripes' ? 40 : 0);
    var svg = svgRoot(totalW, H, ''); F.body.appendChild(svg); svg.classList.add('cvf-svg');
    var desc = [];
    years.forEach(function (yr, i) {
      var stars = yr ? CV.flagStars(yr) : (o.stars || 50), stripes = yr ? CV.flagStripes(yr) : (o.stripes || 13);
      var x = i * (fw + gap) + 2, f = drawFlag(svg, x, 4, fw - 4, stars, stripes, { circle: o.circle });
      if (n > 1 || o.showYear) txt(svg, x + fw / 2, fh + 30, F.quiet && o.ask === yr ? '?' : (yr ? String(yr) : ''), { 'text-anchor': 'middle', class: 'cvf-year' });
      if (o.count === 'stripes' && !F.quiet) f.stripes.forEach(function (r, k) { txt(svg, x + fw + 8, 4 + (k + 0.5) * f.h / stripes + 5, String(k + 1), { class: 'cvf-num' }); });
      if (o.count === 'stars' && !F.quiet) f.stars.forEach(function (s) { s.setAttribute('class', 'cvf-star hl'); });
      desc.push((yr ? 'The flag of ' + yr + ': ' : 'A flag with ') + (F.quiet ? '' : stars + ' stars and ' + stripes + ' stripes'));
    });
    svg.setAttribute('aria-label', desc.join('. ') + (F.quiet ? 'A U.S. flag.' : '.'));
    if (o.labels && !F.quiet) {
      var y1 = years[0], st = y1 ? CV.flagStars(y1) : (o.stars || 50), sp = y1 ? CV.flagStripes(y1) : (o.stripes || 13);
      legend(F.body, [['cvf-sw-red', '<b>' + sp + ' stripes</b>, red and white' + (sp === 13 ? ', for the 13 original colonies' : ', for the states in 1795')], ['cvf-sw-blue', '<b>' + st + ' white stars</b> on blue' + (st === 50 ? ', one for each of the 50 states' : ', one for each state then')]]);
    }
    if (o.count && !F.quiet) F.say(o.count === 'stripes' ? 'Count the stripes: ' + (years[0] ? CV.flagStripes(years[0]) : (o.stripes || 13)) + '.' : 'Count the stars: ' + (years[0] ? CV.flagStars(years[0]) : (o.stars || 50)) + '.');
  });

  /* ---------------------------------------------------------------- cv-picture: original pictures for young learners
     Each draws in a 100 x 100 box. People are not drawn; hats, tools and objects stand for them. */
  var INK = '#2b2b33';
  function R(g, x, y, w, hh, f, at) { return sv('rect', Object.assign({ x: x, y: y, width: w, height: hh, fill: f }, at || {}), g); }
  function C(g, x, y, r, f, at) { return sv('circle', Object.assign({ cx: x, cy: y, r: r, fill: f }, at || {}), g); }
  function E(g, x, y, rx, ry, f, at) { return sv('ellipse', Object.assign({ cx: x, cy: y, rx: rx, ry: ry, fill: f }, at || {}), g); }
  function Pth(g, d, f, at) { return sv('path', Object.assign({ d: d, fill: f || 'none' }, at || {}), g); }
  function Ln(g, d, w, col) { return sv('path', { d: d, fill: 'none', stroke: col || INK, 'stroke-width': w || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); }
  var ink = { stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' };
  var PIC = {
    flag: function (g) { R(g, 18, 14, 4, 80, '#8a6a46'); drawFlag(g, 22, 16, 62, 50, 13); },
    eagle: function (g) { Pth(g, 'M50 46 C30 30 12 34 4 26 C10 48 28 52 40 56 Z', '#5b3a21', ink); Pth(g, 'M50 46 C70 30 88 34 96 26 C90 48 72 52 60 56 Z', '#5b3a21', ink); E(g, 50, 58, 13, 20, '#5b3a21', ink); C(g, 50, 32, 11, '#fff', ink); Pth(g, 'M55 32 L66 35 L56 39 Z', '#f2b632', ink); C(g, 51, 30, 1.8, INK); Pth(g, 'M42 76 L50 92 L58 76 Z', '#fff', ink); Ln(g, 'M44 78 L40 86 M56 78 L60 86', 3, '#f2b632'); },
    bell: function (g) { R(g, 14, 10, 72, 7, '#8a6a46', ink); R(g, 46, 16, 8, 8, '#6d5a3c'); Pth(g, 'M34 26 Q50 18 66 26 L70 70 Q78 74 80 82 L20 82 Q22 74 30 70 Z', '#9a7b4f', ink); Ln(g, 'M52 40 L48 52 L54 60 L50 74', 2.5, INK); R(g, 30, 64, 40, 3, '#7a6040'); C(g, 50, 88, 5, '#6d5a3c', ink); },
    statue: function (g) { R(g, 30, 78, 40, 18, '#b9b2a2', ink); Pth(g, 'M38 78 L42 44 Q50 38 58 44 L62 78 Z', '#5fae96', ink); C(g, 50, 34, 8, '#5fae96', ink); Pth(g, 'M42 28 L39 20 M46 26 L45 17 M50 26 L50 15 M54 26 L55 17 M58 28 L61 20', 'none', { stroke: '#5fae96', 'stroke-width': 3, 'stroke-linecap': 'round' }); Pth(g, 'M58 46 L66 18', 'none', { stroke: '#5fae96', 'stroke-width': 6, 'stroke-linecap': 'round' }); Pth(g, 'M62 16 L70 16 L68 22 L64 22 Z', '#5fae96', ink); Pth(g, 'M66 4 Q72 10 66 15 Q60 10 66 4 Z', '#f6b73c', { stroke: '#e07b1c', 'stroke-width': 1.5 }); R(g, 40, 50, 9, 12, '#4f9a84', ink); },
    capitol: function (g) { R(g, 10, 62, 80, 26, '#f1efe8', ink); R(g, 30, 50, 40, 14, '#f1efe8', ink); Pth(g, 'M32 50 Q50 18 68 50 Z', '#f1efe8', ink); R(g, 47, 14, 6, 10, '#f1efe8', ink); for (var i = 0; i < 7; i++) R(g, 16 + i * 10, 66, 4, 20, '#d6d2c6'); R(g, 6, 88, 88, 5, '#c9c4b5', ink); },
    whitehouse: function (g) { R(g, 10, 44, 80, 42, '#fbfaf6', ink); Pth(g, 'M34 44 L50 30 L66 44 Z', '#fbfaf6', ink); for (var i = 0; i < 4; i++) R(g, 38 + i * 7, 46, 3, 36, '#dcd8cc'); for (var j = 0; j < 2; j++) { R(g, 16 + j * 8, 52, 5, 8, '#9db3c8'); R(g, 70 + j * 8, 52, 5, 8, '#9db3c8'); R(g, 16 + j * 8, 68, 5, 8, '#9db3c8'); R(g, 70 + j * 8, 68, 5, 8, '#9db3c8'); } R(g, 46, 70, 8, 16, '#7a6a55'); R(g, 4, 86, 92, 6, '#7dbb6b'); },
    fort: function (g) { Pth(g, 'M8 90 L18 66 L82 66 L92 90 Z', '#c4a77d', ink); R(g, 48, 18, 3, 50, '#6d5a3c'); drawFlag(g, 51, 18, 34, 15, 15); C(g, 20, 30, 3, '#f6b73c'); C(g, 28, 22, 2, '#f6b73c'); C(g, 86, 46, 2.5, '#f6b73c'); },
    anthem: function (g) { drawFlag(g, 8, 52, 42, 50, 13); Ln(g, 'M64 70 L64 24 L88 18 L88 62', 3); E(g, 59, 72, 7, 5, INK); E(g, 83, 64, 7, 5, INK); Ln(g, 'M64 32 L88 26', 3); },
    mayflower: function (g) { Pth(g, 'M10 64 L90 64 L80 82 L20 82 Z', '#8a5a33', ink); R(g, 49, 14, 3, 52, '#6d4a2c'); R(g, 28, 24, 3, 42, '#6d4a2c'); R(g, 70, 28, 3, 38, '#6d4a2c'); [[29.5, 26, 12, 14], [29.5, 44, 14, 14], [50.5, 18, 15, 17], [50.5, 39, 17, 18], [71.5, 32, 11, 13], [71.5, 48, 12, 12]].forEach(function (q) { var x = q[0], y = q[1], w = q[2], hh = q[3]; Pth(g, 'M' + (x - w) + ' ' + y + ' L' + (x + w) + ' ' + y + ' Q' + (x + w + 4) + ' ' + (y + hh / 2) + ' ' + (x + w) + ' ' + (y + hh) + ' L' + (x - w) + ' ' + (y + hh) + ' Q' + (x - w + 4) + ' ' + (y + hh / 2) + ' ' + (x - w) + ' ' + y + ' Z', '#f4efe1', ink); }); Pth(g, 'M51 8 L62 12 L51 15 Z', '#b22234'); Pth(g, 'M0 86 Q12 80 25 86 T50 86 T75 86 T100 86 L100 100 L0 100 Z', '#7fb3d5'); },
    ship: function (g) { PIC.mayflower(g); },
    longhouse: function (g) { Pth(g, 'M8 86 L8 52 Q50 20 92 52 L92 86 Z', '#a98457', ink); for (var i = 0; i < 5; i++) Ln(g, 'M' + (20 + i * 15) + ' 40 L' + (20 + i * 15) + ' 86', 1.5, '#7a5d3a'); Pth(g, 'M8 64 Q50 44 92 64', 'none', { stroke: '#7a5d3a', 'stroke-width': 1.5 }); Pth(g, 'M42 86 L42 66 Q50 60 58 66 L58 86 Z', '#3d2b1c'); R(g, 0, 86, 100, 8, '#7dbb6b'); },
    tipi: function (g) { Pth(g, 'M50 16 L82 86 L18 86 Z', '#e7d3a8', ink); Ln(g, 'M50 16 L42 4 M50 16 L58 4 M50 16 L50 2', 2.5, '#6d4a2c'); Pth(g, 'M50 60 L42 86 L58 86 Z', '#7a5d3a'); Ln(g, 'M30 62 L70 62', 3, '#b85c38'); Ln(g, 'M26 72 L74 72', 3, '#3f7f9e'); R(g, 0, 86, 100, 8, '#c9b37a'); },
    pueblo: function (g) { R(g, 6, 58, 56, 30, '#d9a46e', ink); R(g, 22, 36, 44, 24, '#d9a46e', ink); R(g, 56, 52, 38, 36, '#c99560', ink); R(g, 14, 70, 8, 10, '#5a3d27'); R(g, 34, 44, 8, 10, '#5a3d27'); R(g, 70, 64, 8, 10, '#5a3d27'); Ln(g, 'M74 30 L74 56 M82 30 L82 56 M74 38 L82 38 M74 46 L82 46', 2.5, '#6d4a2c'); R(g, 0, 88, 100, 6, '#c9b37a'); },
    wigwam: function (g) { Pth(g, 'M12 86 Q12 32 50 30 Q88 32 88 86 Z', '#b9925f', ink); Ln(g, 'M22 50 Q50 40 78 50 M16 66 Q50 56 84 66', 2, '#7a5d3a'); Pth(g, 'M42 86 L42 68 Q50 60 58 68 L58 86 Z', '#3d2b1c'); R(g, 0, 86, 100, 8, '#7dbb6b'); },
    plankhouse: function (g) { Pth(g, 'M8 86 L8 46 L50 26 L92 46 L92 86 Z', '#9b6a43', ink); for (var i = 0; i < 6; i++) Ln(g, 'M' + (16 + i * 14) + ' 44 L' + (16 + i * 14) + ' 86', 1.5, '#6d4a2c'); R(g, 44, 56, 12, 30, '#3d2b1c'); C(g, 50, 44, 6, '#c0392b'); R(g, 0, 86, 100, 8, '#5b8fb0'); },
    corn: function (g) { Pth(g, 'M50 92 Q30 60 34 30 Q50 52 50 92 Z M50 92 Q70 60 66 30 Q50 52 50 92 Z', '#6aa84f', ink); E(g, 50, 46, 11, 30, '#f4c542', ink); for (var i = 0; i < 5; i++) Ln(g, 'M41 ' + (28 + i * 9) + ' L59 ' + (28 + i * 9), 1.2, '#c99a1c'); },
    beans: function (g) { Ln(g, 'M20 90 Q30 50 50 40 Q70 30 80 10', 3, '#4d8a3a'); [[34, 60], [56, 38], [44, 72], [70, 22]].forEach(function (p) { E(g, p[0], p[1], 6, 13, '#6aa84f', Object.assign({ transform: 'rotate(30 ' + p[0] + ' ' + p[1] + ')' }, ink)); }); },
    squash: function (g) { E(g, 50, 62, 34, 24, '#e08a2e', ink); Ln(g, 'M36 42 Q34 62 38 84 M64 42 Q66 62 62 84 M50 38 L50 86', 1.5, '#b4651c'); R(g, 47, 28, 6, 12, '#4d8a3a'); },
    wagon: function (g) { Pth(g, 'M16 60 Q16 22 34 22 L66 22 Q84 22 84 60 Z', '#f4efe1', ink); Ln(g, 'M30 22 L30 60 M50 22 L50 60 M70 22 L70 60', 1.5, '#cfc6ae'); R(g, 10, 58, 80, 12, '#8a5a33', ink); [26, 74].forEach(function (x) { C(g, x, 80, 12, 'none', { stroke: '#5a3d27', 'stroke-width': 4 }); Ln(g, 'M' + (x - 12) + ' 80 L' + (x + 12) + ' 80 M' + x + ' 68 L' + x + ' 92', 2, '#5a3d27'); }); },
    cabin: function (g) { Pth(g, 'M10 46 L50 18 L90 46 Z', '#7a4a2a', ink); R(g, 16, 46, 68, 40, '#a8743f', ink); for (var i = 0; i < 5; i++) Ln(g, 'M16 ' + (52 + i * 8) + ' L84 ' + (52 + i * 8), 1.5, '#7a5230'); R(g, 44, 60, 12, 26, '#5a3d27'); R(g, 64, 56, 12, 10, '#9db3c8', ink); R(g, 66, 20, 8, 18, '#8c8c8c'); },
    scroll: function (g) { R(g, 20, 14, 60, 72, '#f2e3bd', ink); E(g, 50, 14, 32, 5, '#e6d2a2', ink); E(g, 50, 86, 32, 5, '#e6d2a2', ink); for (var i = 0; i < 7; i++) Ln(g, 'M28 ' + (28 + i * 7) + ' L' + (i === 0 ? 72 : 68 - (i % 3) * 4) + ' ' + (28 + i * 7), 1.5, '#8a7a5a'); Ln(g, 'M30 76 Q40 70 46 76 T62 74', 2, INK); },
    constitution: function (g) { R(g, 18, 12, 64, 78, '#f2e3bd', ink); txt(g, 50, 32, 'We the', { 'text-anchor': 'middle', 'font-family': 'Georgia,serif', 'font-style': 'italic', 'font-size': 13, fill: INK }); txt(g, 50, 48, 'People', { 'text-anchor': 'middle', 'font-family': 'Georgia,serif', 'font-style': 'italic', 'font-size': 15, fill: INK, 'font-weight': 700 }); for (var i = 0; i < 4; i++) Ln(g, 'M26 ' + (60 + i * 7) + ' L74 ' + (60 + i * 7), 1.5, '#8a7a5a'); },
    quill: function (g) { Pth(g, 'M78 8 Q50 20 34 66 L40 68 Q60 30 78 8 Z', '#f4f1ea', ink); Ln(g, 'M34 66 L26 88', 3); R(g, 18, 80, 22, 12, '#2b3a55', ink); },
    gavel: function (g) { R(g, 26, 22, 34, 18, '#8a5a33', Object.assign({ rx: 4, transform: 'rotate(-30 43 31)' }, ink)); Ln(g, 'M46 38 L76 82', 6, '#6d4a2c'); R(g, 14, 80, 40, 10, '#6d4a2c', Object.assign({ rx: 3 }, ink)); },
    ballot: function (g) { R(g, 18, 40, 64, 48, '#2f5d8a', ink); R(g, 34, 44, 32, 4, '#16304a'); R(g, 38, 12, 24, 34, '#fff', ink); Ln(g, 'M44 26 L49 31 L57 20', 3, '#00703c'); txt(g, 50, 74, 'VOTE', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff', 'font-family': 'system-ui,sans-serif' }); },
    bus: function (g) { R(g, 8, 30, 84, 46, '#f2b632', Object.assign({ rx: 8 }, ink)); for (var i = 0; i < 4; i++) R(g, 14 + i * 18, 38, 14, 14, '#cfe2f3', ink); R(g, 82, 38, 6, 30, '#cfe2f3'); [26, 74].forEach(function (x) { C(g, x, 78, 8, INK); C(g, x, 78, 3, '#bbb'); }); },
    bulb: function (g) { C(g, 50, 40, 26, '#fff3a6', ink); R(g, 40, 64, 20, 16, '#9a9a9a', ink); Ln(g, 'M40 70 L60 70 M40 75 L60 75', 1.5, '#666'); Ln(g, 'M44 50 L46 34 L50 44 L54 34 L56 50', 2, '#c99a1c'); Ln(g, 'M50 6 L50 0 M20 16 L15 11 M80 16 L85 11', 2.5, '#f2b632'); },
    phone: function (g) { R(g, 30, 50, 40, 36, '#6d4a2c', Object.assign({ rx: 4 }, ink)); R(g, 46, 20, 8, 32, '#3d2b1c'); Pth(g, 'M40 14 L60 14 L56 22 L44 22 Z', '#3d2b1c', ink); Ln(g, 'M70 60 Q86 56 82 30', 2.5); E(g, 82, 24, 6, 8, '#3d2b1c', ink); },
    plane: function (g) { R(g, 10, 36, 80, 6, '#e8dcc0', ink); R(g, 10, 54, 80, 6, '#e8dcc0', ink); for (var i = 0; i < 4; i++) Ln(g, 'M' + (16 + i * 22) + ' 42 L' + (16 + i * 22) + ' 54', 2, '#8a6a46'); Ln(g, 'M46 48 L46 76 L62 76', 2.5, '#8a6a46'); R(g, 60, 70, 18, 10, '#e8dcc0', ink); Ln(g, 'M8 40 L4 56', 2.5); },
    kite: function (g) { Pth(g, 'M50 8 L76 34 L50 66 L24 34 Z', '#f4efe1', ink); Ln(g, 'M50 8 L50 66 M24 34 L76 34', 1.5, '#8a7a5a'); Ln(g, 'M50 66 Q40 80 52 90 T46 98', 2); R(g, 44, 82, 8, 6, '#b8b8b8', ink); Ln(g, 'M70 6 L64 18 L72 18 L66 30', 2.5, '#f2b632'); },
    rocket: function (g) { Pth(g, 'M50 6 Q66 22 64 66 L36 66 Q34 22 50 6 Z', '#eef1f5', ink); C(g, 50, 32, 6, '#7fb3d5', ink); Pth(g, 'M36 50 L24 72 L36 66 Z M64 50 L76 72 L64 66 Z', '#b22234', ink); Pth(g, 'M42 66 L50 92 L58 66 Z', '#f6b73c'); },
    moon: function (g) { R(g, 0, 0, 100, 70, '#1d2440'); C(g, 80, 16, 8, '#cfe2f3'); Pth(g, 'M0 70 Q30 60 60 68 T100 64 L100 100 L0 100 Z', '#c9c9c9'); E(g, 30, 84, 8, 3, '#aaa'); R(g, 50, 26, 3, 46, '#ddd'); drawFlag(g, 53, 26, 30, 50, 13); },
    redcross: function (g) { R(g, 14, 14, 72, 72, '#fff', ink); R(g, 40, 22, 20, 56, '#d42a2a'); R(g, 22, 40, 56, 20, '#d42a2a'); },
    firetruck: function (g) { R(g, 6, 40, 70, 34, '#d42a2a', ink); R(g, 76, 50, 18, 24, '#d42a2a', ink); R(g, 80, 54, 10, 10, '#cfe2f3'); Ln(g, 'M10 34 L70 34 M14 30 L14 40 M26 30 L26 40 M38 30 L38 40 M50 30 L50 40 M62 30 L62 40', 2.5, '#bbb'); [22, 62, 84].forEach(function (x) { C(g, x, 78, 8, INK); C(g, x, 78, 3, '#bbb'); }); },
    badge: function (g) { Pth(g, 'M50 8 L60 22 L78 20 L76 38 L90 50 L76 62 L78 80 L60 78 L50 92 L40 78 L22 80 L24 62 L10 50 L24 38 L22 20 L40 22 Z', '#f2c94c', ink); C(g, 50, 50, 16, '#e0b232', ink); Pth(g, starPath(50, 50, 10), '#fff7d6'); },
    stethoscope: function (g) { Ln(g, 'M30 12 L30 40 Q30 62 50 62 Q70 62 70 40 L70 12', 4); Ln(g, 'M50 62 L50 74 Q50 88 64 88', 4); C(g, 70, 84, 9, '#9a9a9a', ink); C(g, 30, 12, 4, INK); C(g, 70, 12, 4, INK); },
    mail: function (g) { Pth(g, 'M20 34 Q20 26 28 26 L72 26 Q80 26 80 34 L80 82 L20 82 Z', '#5b7fa6', ink); Ln(g, 'M30 26 Q50 6 70 26', 4, '#3d5675'); R(g, 32, 40, 36, 22, '#fff', ink); Ln(g, 'M32 40 L50 54 L68 40', 2); },
    school: function (g) { Pth(g, 'M10 46 L50 20 L90 46 Z', '#9b2335', ink); R(g, 16, 46, 68, 40, '#c0563f', ink); R(g, 44, 62, 12, 24, '#5a3d27'); R(g, 22, 54, 12, 12, '#cfe2f3', ink); R(g, 66, 54, 12, 12, '#cfe2f3', ink); R(g, 46, 6, 8, 16, '#c0563f', ink); C(g, 50, 36, 5, '#fff', ink); },
    turkey: function (g) { ['#b8402a', '#e08a2e', '#f2b632', '#e08a2e', '#b8402a'].forEach(function (c, i) { var a = -M.PI * 0.9 + i * M.PI * 0.2; E(g, 50 + 26 * M.cos(a), 54 + 26 * M.sin(a), 9, 18, c, Object.assign({ transform: 'rotate(' + (a * 180 / M.PI + 90) + ' ' + (50 + 26 * M.cos(a)) + ' ' + (54 + 26 * M.sin(a)) + ')' }, ink)); }); E(g, 50, 62, 18, 20, '#7a4a2a', ink); C(g, 50, 40, 9, '#8a5a33', ink); Pth(g, 'M58 40 L64 42 L58 44 Z', '#f2b632'); Pth(g, 'M52 44 Q54 52 50 52', '#d42a2a'); C(g, 53, 38, 1.5, INK); Ln(g, 'M44 82 L42 92 M56 82 L58 92', 2.5, '#e08a2e'); },
    fireworks: function (g) { R(g, 0, 0, 100, 100, '#1d2440'); [[34, 34, '#f6b73c'], [70, 44, '#ff7a7a'], [48, 70, '#8fd3ff']].forEach(function (p) { for (var i = 0; i < 10; i++) { var a = i * M.PI / 5; Ln(g, 'M' + (p[0] + 5 * M.cos(a)) + ' ' + (p[1] + 5 * M.sin(a)) + ' L' + (p[0] + 15 * M.cos(a)) + ' ' + (p[1] + 15 * M.sin(a)), 2.5, p[2]); } }); },
    calendar: function (g) { R(g, 14, 18, 72, 70, '#fff', Object.assign({ rx: 6 }, ink)); R(g, 14, 18, 72, 16, '#b22234', Object.assign({ rx: 6 }, ink)); for (var r = 0; r < 4; r++) for (var c = 0; c < 5; c++) R(g, 20 + c * 13, 40 + r * 11, 9, 7, r === 1 && c === 3 ? '#f2b632' : '#dde3ea'); Ln(g, 'M30 12 L30 24 M70 12 L70 24', 4); },
    wreath: function (g) { for (var i = 0; i < 16; i++) { var a = i * M.PI / 8; E(g, 50 + 28 * M.cos(a), 50 + 28 * M.sin(a), 6, 11, '#3f7f3a', { transform: 'rotate(' + (a * 180 / M.PI) + ' ' + (50 + 28 * M.cos(a)) + ' ' + (50 + 28 * M.sin(a)) + ')' }); } Pth(g, 'M44 74 L50 84 L56 74 L62 92 L50 86 L38 92 Z', '#b22234', ink); },
    tophat: function (g) { R(g, 30, 16, 40, 56, '#222', ink); R(g, 30, 60, 40, 8, '#555'); E(g, 50, 74, 34, 7, '#222', ink); },
    tricorn: function (g) { Pth(g, 'M8 64 Q50 20 92 64 Q72 54 50 70 Q28 54 8 64 Z', '#222', ink); Pth(g, 'M30 60 Q50 46 70 60', 'none', { stroke: '#c9a646', 'stroke-width': 3 }); C(g, 50, 56, 5, '#b22234'); },
    lantern: function (g) { Ln(g, 'M50 6 L50 16', 3); Pth(g, 'M36 22 L64 22 L60 18 L40 18 Z', '#555', ink); R(g, 36, 22, 28, 48, '#ffe08a', ink); Ln(g, 'M45 22 L45 70 M55 22 L55 70', 2, '#555'); E(g, 50, 48, 5, 9, '#f6b73c'); R(g, 32, 70, 36, 8, '#555', ink); },
    drum: function (g) { E(g, 50, 32, 32, 10, '#f4efe1', ink); Pth(g, 'M18 32 L18 72 Q50 86 82 72 L82 32 Q50 42 18 32 Z', '#b22234', ink); Ln(g, 'M18 34 L40 76 L60 42 L82 72', 2, '#f2c94c'); Ln(g, 'M60 4 L44 24 M80 8 L56 24', 3.5, '#8a5a33'); },
    chain: function (g) { [[18, 40], [36, 46]].forEach(function (p) { E(g, p[0], p[1], 11, 7, 'none', { stroke: '#7a7a85', 'stroke-width': 5, transform: 'rotate(15 ' + p[0] + ' ' + p[1] + ')' }); }); [[64, 54], [82, 60]].forEach(function (p) { E(g, p[0], p[1], 11, 7, 'none', { stroke: '#7a7a85', 'stroke-width': 5, transform: 'rotate(15 ' + p[0] + ' ' + p[1] + ')' }); }); Ln(g, 'M48 38 L44 28 M52 62 L56 72', 3, '#f2b632'); },
    train: function (g) { R(g, 40, 34, 34, 36, '#2f3640', ink); R(g, 12, 46, 30, 24, '#2f3640', ink); R(g, 16, 30, 8, 16, '#2f3640', ink); R(g, 46, 40, 20, 14, '#cfe2f3'); R(g, 74, 60, 12, 10, '#b22234', ink); C(g, 20, 76, 8, '#b22234', ink); C(g, 40, 76, 8, '#b22234', ink); C(g, 64, 74, 12, '#b22234', ink); E(g, 20, 20, 8, 5, '#ddd'); E(g, 30, 12, 9, 6, '#ddd'); },
    compass: function (g) { C(g, 50, 50, 38, '#e9dcc0', ink); C(g, 50, 50, 31, '#fff9ea', ink); Pth(g, 'M50 22 L56 50 L50 54 L44 50 Z', '#b22234'); Pth(g, 'M50 78 L56 50 L50 46 L44 50 Z', '#555'); txt(g, 50, 18, 'N', { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: INK, 'font-family': 'system-ui,sans-serif' }); },
    canoe: function (g) { Pth(g, 'M6 56 Q50 80 94 56 Q90 66 84 70 Q50 82 16 70 Q10 66 6 56 Z', '#b9925f', ink); Ln(g, 'M60 20 L40 74', 3.5, '#6d4a2c'); E(g, 38, 78, 5, 9, '#8a5a33', { transform: 'rotate(20 38 78)' }); Pth(g, 'M0 82 Q25 76 50 82 T100 82 L100 100 L0 100 Z', '#7fb3d5'); },
    bison: function (g) { E(g, 54, 54, 32, 22, '#5b3a21', ink); E(g, 30, 46, 18, 22, '#3d2716', ink); E(g, 20, 58, 9, 10, '#3d2716'); Pth(g, 'M16 34 Q10 30 12 24 M30 30 Q34 24 30 20', 'none', { stroke: '#e6dcc6', 'stroke-width': 3, 'stroke-linecap': 'round' }); C(g, 20, 48, 2, '#fff'); [36, 46, 68, 78].forEach(function (x) { R(g, x, 70, 6, 18, '#3d2716'); }); },
    crown: function (g) { Pth(g, 'M16 70 L12 30 L32 48 L50 22 L68 48 L88 30 L84 70 Z', '#f2c94c', ink); R(g, 16, 70, 68, 12, '#e0b232', ink); [32, 50, 68].forEach(function (x, i) { C(g, x, 76, 4, ['#b22234', '#3c3b6e', '#00703c'][i]); }); },
    trafficlight: function (g) { R(g, 36, 8, 28, 72, '#333', Object.assign({ rx: 6 }, ink)); C(g, 50, 22, 8, '#e74c3c'); C(g, 50, 44, 8, '#f1c40f'); C(g, 50, 66, 8, '#2ecc71'); R(g, 47, 80, 6, 16, '#555'); },
    stopsign: function (g) { var d = ''; for (var i = 0; i < 8; i++) { var a = M.PI / 8 + i * M.PI / 4; d += (i ? 'L' : 'M') + (50 + 38 * M.cos(a)).toFixed(1) + ' ' + (44 + 38 * M.sin(a)).toFixed(1); } Pth(g, d + 'Z', '#c0392b', { stroke: '#fff', 'stroke-width': 3 }); txt(g, 50, 51, 'STOP', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: '#fff', 'font-family': 'system-ui,sans-serif' }); R(g, 47, 82, 6, 16, '#777'); },
    helping: function (g) { Pth(g, 'M8 60 Q20 46 40 50 L58 52 Q64 54 60 60 L42 62', '#ffcc4d', { stroke: '#e8a93a', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }); Pth(g, 'M92 40 Q80 54 60 50 L42 48 Q36 46 40 40 L58 38', '#ffcc4d', { stroke: '#e8a93a', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }); Pth(g, 'M50 30 C44 22 34 26 38 34 L50 44 L62 34 C66 26 56 22 50 30 Z', '#e0628a'); },
    globe: function (g) { C(g, 50, 46, 34, '#7fb3d5', ink); Pth(g, 'M30 26 Q40 22 46 30 Q44 40 36 42 Q28 40 30 26 Z M56 38 Q70 34 76 46 Q72 62 60 64 Q54 52 56 38 Z M38 54 Q46 56 44 70 Q36 70 34 60 Z', '#7dbb6b'); R(g, 46, 80, 8, 10, '#8a6a46'); R(g, 34, 88, 32, 6, '#8a6a46'); },
    star: function (g) { Pth(g, starPath(50, 52, 40), '#f2c94c', ink); }
  };
  V.register('cv-picture', function (el, o) {
    var F = frame(el, o, 'picture', 'Pictures');
    var items = arr(o.items).map(function (it) { return typeof it === 'string' ? { key: it } : it; }).filter(function (it) { return PIC[it.key]; });
    var mode = o.mode || 'show', picked = null, grid = h('div', 'cvp-grid' + (o.size === 'small' ? ' small' : items.length === 1 ? ' one' : '')); F.body.appendChild(grid);
    items.forEach(function (it, i) {
      var cap = it.caption || CV.PICTURES[it.key] || it.key, quietCap = F.quiet || o.captions === false;
      var card = h(mode === 'pick' && F.live ? 'button' : 'figure', 'cvp-card');
      var svg = svgRoot(100, 100, quietCap ? 'Picture ' + letter(i) : cap, 'cvp-svg'); PIC[it.key](svg);
      card.appendChild(svg);
      if (!(quietCap && items.length === 1)) { // a lone quiet picture needs no letter
        var fc = h(mode === 'pick' && F.live ? 'span' : 'figcaption', 'cvp-cap', quietCap ? '<b>' + letter(i) + '</b>' : esc(cap.charAt(0).toUpperCase() + cap.slice(1)));
        card.appendChild(fc);
      }
      if (mode === 'pick' && F.live) { card.type = 'button'; card.setAttribute('aria-pressed', 'false'); card.addEventListener('click', function () { picked = it.key; grid.querySelectorAll('.cvp-card').forEach(function (c) { c.setAttribute('aria-pressed', c === card ? 'true' : 'false'); }); F.say(''); }); }
      grid.appendChild(card);
    });
    if (mode === 'pick') checkButtons(F, function () {
      if (!picked) return { ok: false, html: 'Tap a picture first.' };
      return { ok: picked === o.answer, html: picked === o.answer ? 'Yes! ' + (o.why || '') : 'Not that one. Try again.' };
    }, null);
  });
  CV.pictureKeys = function () { return Object.keys(PIC); };
  /* ---------------------------------------------------------------- cv-branches */
  var BKEYS = ['legislative', 'executive', 'judicial'];
  V.register('cv-branches', function (el, o) {
    var F = frame(el, o, 'branches', 'The three branches of government');
    var mode = o.mode || 'show', simple = !!o.simple, checks = o.checks === 'all' || !o.checks ? CV.CHECKS.slice() : arr(o.checks).map(CV.check).filter(Boolean);
    if (simple) checks = [];
    var sel = o.highlight || null, picked = null;
    var Wd = 600, Hd = simple ? 190 : 300, svg = svgRoot(Wd, Hd, '', 'cvb-svg'); F.body.appendChild(svg);
    var pos = { legislative: [20, simple ? 60 : 30], executive: [410, simple ? 60 : 30], judicial: [215, simple ? 60 : 200] };
    if (simple) pos = { legislative: [10, 20], executive: [210, 20], judicial: [410, 20] };
    var BW = 180, BH = simple ? 150 : 76;
    var icons = { legislative: 'capitol', executive: 'whitehouse', judicial: 'gavel' };
    function center(k) { return [pos[k][0] + BW / 2, pos[k][1] + BH / 2]; }
    function draw() {
      svg.innerHTML = '';
      if (simple) { // the simple boxes sit side by side, or stacked in a narrow space so their words stay readable
        var stack = (el.clientWidth || 600) < 500;
        Wd = stack ? 320 : 600; Hd = stack ? 304 : 190; svg.setAttribute('viewBox', '0 0 ' + Wd + ' ' + Hd); svg.classList.toggle('cvb-stack', stack);
        BW = stack ? 300 : 180; BH = stack ? 96 : 150;
        pos = stack ? { legislative: [10, 2], executive: [10, 104], judicial: [10, 206] } : { legislative: [10, 20], executive: [210, 20], judicial: [410, 20] };
      }
      var defs = sv('defs', null, svg), mk = uid('arrow');
      [['', 'cvb-arrowhead'], ['on', 'cvb-arrowhead on']].forEach(function (q) { var m = sv('marker', { id: mk + q[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 11, markerHeight: 11, markerUnits: 'userSpaceOnUse', orient: 'auto' }, defs); sv('path', { d: 'M0 0 L10 5 L0 10 Z', class: q[1] }, m); });
      // arrows between branches: one per direction, highlighted when the selected check runs that way
      if (!simple) {
        var pairs = [['legislative', 'executive'], ['legislative', 'judicial'], ['executive', 'judicial']];
        pairs.forEach(function (pr) {
          var a = center(pr[0]), b = center(pr[1]), dx = b[0] - a[0], dy = b[1] - a[1], L = M.hypot(dx, dy), nx = -dy / L, ny = dx / L;
          [[pr[0], pr[1], 9], [pr[1], pr[0], -9]].forEach(function (d) {
            var has = checks.some(function (c) { return c.by === d[0] && c.on === d[1]; }); if (!has) return;
            var on = sel && CV.check(sel) && CV.check(sel).by === d[0] && CV.check(sel).on === d[1], off = d[2];
            var t0 = pr[1] === 'judicial' ? 0.36 : 0.4, t1 = 1 - t0;
            var p0 = [a[0] + dx * t0 + nx * off, a[1] + dy * t0 + ny * off], p1 = [a[0] + dx * t1 + nx * off, a[1] + dy * t1 + ny * off];
            if (pr[1] !== 'judicial') { p0 = [pos[pr[0]][0] + BW + 8, a[1] + off]; p1 = [pos[pr[1]][0] - 8, a[1] + off]; }
            var from = d[0] === pr[0] ? p0 : p1, to = d[0] === pr[0] ? p1 : p0;
            sv('line', { x1: from[0], y1: from[1], x2: to[0], y2: to[1], class: 'cvb-arrow' + (on ? ' on' : ''), 'marker-end': 'url(#' + (on ? mk + 'on' : mk) + ')' }, svg);
          });
        });
      }
      BKEYS.forEach(function (k, i) {
        var B = CV.BRANCHES[k], p = pos[k], asked = o.ask === k, g = sv('g', { class: 'cvb-box ' + fillClass(i) + (picked === k ? ' picked' : '') }, svg);
        sv('rect', { x: p[0], y: p[1], width: BW, height: BH, rx: 12, class: 'cvb-rect' }, g);
        var sName = k === 'legislative' ? 'Congress' : k === 'executive' ? 'President' : 'Courts';
        if (simple && stack) { // icon on the left, words on the right
          var ic2 = sv('g', { transform: 'translate(' + (p[0] + 10) + ',' + (p[1] + 14) + ') scale(0.68)' }, g); PIC[icons[k]](ic2);
          txt(g, p[0] + 92, p[1] + 34, asked ? '?' : sName, { class: 'cvb-name' });
          if (!(asked && F.quiet)) { var t2 = txt(g, p[0] + 92, p[1] + 58, '', { class: 'cvb-job' }); tspans(t2, wrapText(B.kid, 24).slice(0, 2), p[0] + 92, 19); }
        } else {
          if (simple) { var ic = sv('g', { transform: 'translate(' + (p[0] + BW / 2 - 30) + ',' + (p[1] + 8) + ') scale(0.6)' }, g); PIC[icons[k]](ic); }
          txt(g, p[0] + BW / 2, p[1] + (simple ? 88 : (el.clientWidth >= 500 ? 28 : 46)), asked ? '?' : (simple ? sName : B.name), { 'text-anchor': 'middle', class: 'cvb-name' });
          if (!(asked && F.quiet) && (simple || el.clientWidth >= 500)) { var t = txt(g, p[0] + BW / 2, p[1] + (simple ? 110 : 50), '', { 'text-anchor': 'middle', class: 'cvb-job' }); tspans(t, wrapText(simple ? B.kid : B.brief, 24).slice(0, 2), p[0] + BW / 2, 15); }
        }
        if (mode === 'which' && F.live) {
          g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', asked ? 'Branch ' + letter(i) : B.name + ' branch'); g.style.cursor = 'pointer';
          var go = function () { picked = k; F.say(''); draw(); }; g.addEventListener('click', go); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        }
      });
      svg.setAttribute('aria-label', simple ? 'Three branches: Congress makes the laws, the President carries out the laws, the courts decide what the laws mean.' : 'The legislative, executive and judicial branches, with arrows for the checks each has on the others.' + (sel && CV.check(sel) && !F.quiet ? ' Selected: ' + CV.check(sel).text : ''));
    }
    draw(); var lastW = el.clientWidth; onResize(el, function (w) { if ((w < 500) !== (lastW < 500)) { lastW = w; draw(); } });
    if (mode === 'which') {
      F.body.insertBefore(h('p', 'cvb-power', '<b>' + esc(o.power || 'Which branch?') + '</b>'), svg);
      checkButtons(F, function () { if (!picked) return { ok: false, html: 'Tap a branch first.' }; return { ok: picked === o.answer, html: picked === o.answer ? 'Yes: the ' + CV.BRANCHES[picked].name.toLowerCase() + ' branch.' + (o.why ? ' ' + o.why : '') : 'Not that branch. Think about who ' + (CV.BRANCHES[o.answer] ? CV.BRANCHES[o.answer].job : 'holds this power') + '.' }; }, null);
    } else if (!simple && checks.length && !F.quiet) {
      var list = h('ul', 'cvb-checks'); F.body.appendChild(list);
      checks.forEach(function (c) {
        var li = h('li'), b = h(F.interactive ? 'button' : 'span', 'cvb-chip' + (sel === c.id ? ' on' : ''), '<i class="cvv-sw ' + fillClass(BKEYS.indexOf(c.by)) + '" aria-hidden="true"></i>' + esc(c.text));
        if (F.interactive) { b.type = 'button'; b.setAttribute('aria-pressed', sel === c.id ? 'true' : 'false'); b.addEventListener('click', function () { sel = sel === c.id ? null : c.id; draw(); list.querySelectorAll('.cvb-chip').forEach(function (x) { var on = x === b && sel; x.classList.toggle('on', !!on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); }); F.say(sel ? '<b>' + CV.BRANCHES[c.by].name + '</b> checks <b>' + CV.BRANCHES[c.on].name.toLowerCase() + '</b>: ' + esc(c.text) : ''); }); }
        li.appendChild(b); list.appendChild(li);
      });
    }
  });

  /* ---------------------------------------------------------------- cv-bill: how a bill becomes a law */
  V.register('cv-bill', function (el, o) {
    var F = frame(el, o, 'bill', 'How a bill becomes a law');
    var mode = o.mode || 'steps', start = o.start === 'senate' ? 'Senate' : 'House', other = start === 'House' ? 'Senate' : 'House';
    var path = o.path || 'sign', keys = CV.billPath(path), step = o.step != null ? o.step : (mode === 'steps' ? 0 : keys.length - 1);
    function text(k) {
      var s = CV.billStep(k);
      if (k === 'introduce') return { name: 'Introduced in the ' + start, text: s.text };
      if (k === 'committee') return { name: start + ' committee', text: s.text };
      if (k === 'floor') return { name: start + ' floor vote', text: s.text };
      if (k === 'other') return { name: other + ' committee and vote', text: s.text };
      return s;
    }
    if (o.letters || F.quiet && mode === 'order') {
      var ord = derange(keys.length, 'bill' + path), ol = h('ol', 'cvo-list quiet'); F.body.appendChild(ol);
      ord.forEach(function (ix, pos) { ol.appendChild(h('li', 'cvo-item', '<span class="cvo-num">' + letter(pos) + '</span><span class="cvo-text">' + esc(text(keys[ix]).name) + '</span>')); });
      return;
    }
    var flow = h('ol', 'cvbl-flow'); F.body.appendChild(flow);
    function draw() {
      flow.innerHTML = '';
      keys.forEach(function (k, i) {
        if (i > step) return;
        var t = text(k), asked = o.ask === k, end = k === 'law' || k === 'dies';
        var li = h('li', 'cvbl-step' + (end ? ' end ' + (k === 'law' ? 'law' : 'dies') : '') + (i === step && mode === 'steps' ? ' cur' : '') + (asked ? ' ask' : ''));
        li.innerHTML = '<span class="cvbl-n">' + (i + 1) + '</span><span class="cvbl-body"><b>' + (asked ? '?' : esc(t.name)) + '</b>' + (asked && F.quiet || o.brief ? '' : '<br><span>' + esc(t.text) + '</span>') + '</span>';
        flow.appendChild(li);
      });
      flow.setAttribute('aria-label', 'Steps: ' + keys.slice(0, step + 1).map(function (k) { return o.ask === k ? 'a missing step' : text(k).name; }).join(', then '));
    }
    draw();
    if (F.interactive && mode === 'steps') {
      var back = btn(F.ctl, '◀ Back', function () { if (step > 0) { step--; draw(); upd(); } }), next = btn(F.ctl, 'Next ▶', function () { if (step < keys.length - 1) { step++; draw(); upd(); } }, 'pri');
      var upd = function () { back.disabled = step === 0; next.disabled = step === keys.length - 1; };
      upd();
      if (o.choose !== false) {
        var seg = V.seg(F.ctl, { label: 'What does the President do?', items: [['sign', 'Signs'], ['override', 'Vetoes; overridden'], ['sustained', 'Vetoes; veto stands'], ['unsigned', 'Waits 10 days'], ['pocket', 'Pocket veto']], value: path, change: function (v) { path = v; keys = CV.billPath(v); step = M.min(step, keys.length - 1); if (step >= 6) step = keys.length - 1; draw(); upd(); } });
        seg.el.classList.add('cvbl-seg');
      }
    }
  });
  /* ---------------------------------------------------------------- cv-court: the court system */
  V.register('cv-court', function (el, o) {
    var F = frame(el, o, 'court', 'The court system');
    var mode = o.mode || 'show';
    if (mode === 'circuits') {
      var T = tileSvg({ dc: true, fill: function (st) { return fillClass(Object.keys(CV.CIRCUITS).indexOf(CV.circuitOf(st.ab))); }, label: function (st) { return o.ask === st.ab ? '?' : st.ab; }, text: function (st) { return F.quiet && o.ask === st.ab ? '' : (CV.circuitOf(st.ab) || ''); }, aria: 'A tile map of the federal judicial circuits' + (F.quiet ? '.' : ': each state is labeled with its circuit.') });
      F.body.appendChild(T.svg);
      F.body.appendChild(h('p', 'cvv-note', 'Twelve regional circuits (1st to 11th and the D.C. Circuit) and the Federal Circuit, which hears appeals in certain subjects, such as patents, from the whole country. Puerto Rico is in the 1st Circuit, the Virgin Islands in the 3rd, and Guam and the Northern Mariana Islands in the 9th.'));
      return;
    }
    var show = o.show || 'both', path = arr(o.path), hl = arr(o.highlight), from = o.from || null, binds = from ? (CV.BINDS[from] || []) : [];
    var cols = show === 'both' ? ['federal', 'state'] : [show], grid = h('div', 'cvc-grid' + (cols.length === 1 ? ' one' : '')); F.body.appendChild(grid);
    var stacks = { federal: ['supreme', 'appeals', 'district'], state: ['statesupreme', 'stateappeals', 'statetrial'] };
    cols.forEach(function (sys) {
      var col = h('div', 'cvc-col'); grid.appendChild(col);
      col.appendChild(h('h5', 'cvc-colhead', sys === 'federal' ? 'Federal courts' : 'State courts (most states)'));
      stacks[sys].forEach(function (k, i) {
        if (i > 0) { var up = path.indexOf(k) >= 0 && path.indexOf(stacks[sys][i - 1]) >= 0; col.appendChild(h('div', 'cvc-up' + (up ? ' on' : ''), '<span aria-hidden="true">▲</span> appeal')); }
        var C0 = CV.COURTS[k], asked = o.ask === k;
        var cls = 'cvc-court ' + fillClass(sys === 'federal' ? 3 : 1) + (hl.indexOf(k) >= 0 || path.indexOf(k) >= 0 ? ' hl' : '') + (from === k ? ' from' : '') + (binds.indexOf(k) >= 0 ? ' bound' : '') + (asked ? ' ask' : '');
        col.appendChild(h('div', cls, '<b>' + (asked ? '?' : esc(C0.short)) + '</b>' + (asked && F.quiet ? '' : '<span>' + esc(C0.note) + '</span>') + (binds.indexOf(k) >= 0 && !F.quiet ? '<em>bound</em>' : '') + (from === k && !F.quiet ? '<em>decides</em>' : '')));
      });
    });
    if (cols.length === 2) { var on = path.indexOf('statesupreme') >= 0 && path.indexOf('supreme') >= 0; grid.appendChild(h('p', 'cvc-cert' + (on ? ' on' : ''), '<span aria-hidden="true">◀</span> From a state high court, a case that turns on federal law may go to the U.S. Supreme Court (by certiorari).')); }
    grid.setAttribute('role', 'img');
    grid.setAttribute('aria-label', (cols.length === 2 ? 'Federal and state courts side by side' : cols[0] + ' courts') + ': trial courts at the bottom, appeals courts in the middle, the highest court at the top.' + (path.length && !F.quiet ? ' Highlighted path: ' + path.map(function (k) { return CV.COURTS[k].short; }).join(', then ') + '.' : ''));
    if (mode === 'binding' && from && !F.quiet) F.say('<b>' + CV.COURTS[from].short + '</b>: its decisions bind ' + (binds.length ? binds.map(function (k) { return CV.COURTS[k].short; }).join(', ') : 'no other court (trial court rulings are not binding precedent)') + (from === 'supreme' ? ' (state courts, on questions of federal law)' : '') + '.');
  });

  /* ---------------------------------------------------------------- cv-amend: amending the Constitution */
  V.register('cv-amend', function (el, o) {
    var F = frame(el, o, 'amend', 'How the Constitution is amended');
    var mode = o.mode || 'process', K = CV.AMEND_COUNTS;
    if (mode === 'list') {
      var hl = arr(o.highlight), ul = h('ol', 'cva-list'); F.body.appendChild(ul);
      CV.AMENDMENTS.forEach(function (a) {
        if (o.only && arr(o.only).indexOf(a.n) < 0) return;
        var asked = o.ask === a.n, li = h('li', 'cva-row' + (hl.indexOf(a.n) >= 0 ? ' hl' : '') + (asked ? ' ask' : '') + (a.n <= 10 ? ' bor' : ''));
        li.innerHTML = '<span class="cva-n">' + (asked && F.quiet ? '?' : CV.ordinal(a.n)) + '</span><span class="cva-y">' + a.year + '</span><span class="cva-t"><b>' + esc(a.title) + '</b>' + (o.details ? '<br><small>' + esc(a.text) + '</small>' : '') + '</span>';
        ul.appendChild(li);
      });
      ul.setAttribute('aria-label', 'The amendments to the Constitution with the year each was ratified');
      return;
    }
    if (mode === 'ratify') {
      var n = o.states != null ? o.states : 30, box = h('div', 'cvm-box'); F.body.appendChild(box);
      var orderStates = shuffle(CV.STATES.map(function (s) { return s.ab; }), 'ratify');
      var draw = function () { box.innerHTML = ''; var yes = orderStates.slice(0, n); box.appendChild(tileSvg({ fill: function (st) { return yes.indexOf(st.ab) >= 0 ? 'cvm-hl' : 'cvm-plain'; }, aria: n + ' of 50 states have ratified.' }).svg); if (!F.quiet) F.say('<b>' + n + '</b> of 50 states have ratified. ' + (n >= K.ratify ? 'That is three-fourths: the amendment is part of the Constitution.' : 'It needs ' + K.ratify + ' (three-fourths), so ' + (K.ratify - n) + ' more.')); };
      draw();
      if (F.interactive) V.slider(F.ctl, { label: 'States that have ratified', min: 0, max: 50, step: 1, value: n, input: function (v) { n = v; draw(); } });
      return;
    }
    // the process: two ways to propose, two ways to ratify (tap an option to choose the route)
    var route = arr(o.route).length ? arr(o.route).slice() : ['congress', 'legislatures'];
    var props = [['congress', 'Two-thirds of both houses of Congress', K.house + ' of ' + K.houseOf + ' representatives and ' + K.senate + ' of ' + K.senateOf + ' senators, if all vote. Used for all 27 amendments.'],
      ['convention', 'A national convention called by two-thirds of the state legislatures', K.apply + ' of 50 states must apply. Never used.']];
    var rats = [['legislatures', 'Three-fourths of the state legislatures', K.ratify + ' of 50 states. Used for 26 amendments.'], ['conventions', 'Ratifying conventions in three-fourths of the states', K.ratify + ' of 50 states. Used once, for the 21st.']];
    var grid2 = h('div', 'cva-grid'); F.body.appendChild(grid2);
    function col(title, list, idx, cls) {
      var c = h('div', 'cva-col'); c.appendChild(h('h5', 'cvc-colhead', title));
      list.forEach(function (it) {
        var on = route[idx] === it[0], b = h(F.interactive ? 'button' : 'div', 'cva-opt ' + cls + (on ? ' on' : ''), '<b>' + esc(it[1]) + '</b>' + (F.quiet ? '' : '<span>' + esc(it[2]) + '</span>'));
        if (F.interactive) { b.type = 'button'; b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.addEventListener('click', function () { route[idx] = it[0]; draw2(); }); }
        c.appendChild(b);
      });
      return c;
    }
    function draw2() {
      grid2.innerHTML = '';
      grid2.appendChild(col('1. Proposed by…', props, 0, fillClass(3)));
      grid2.appendChild(h('div', 'cva-arrow', '<span aria-hidden="true">➜</span>'));
      grid2.appendChild(col('2. Ratified by…', rats, 1, fillClass(2)));
      if (!F.quiet) F.say('Route: <b>' + props.filter(function (p) { return p[0] === route[0]; })[0][1] + '</b>, then <b>' + rats.filter(function (p) { return p[0] === route[1]; })[0][1].toLowerCase() + '</b>. The President has no formal role: amendments are not signed or vetoed.');
    }
    draw2();
  });

  /* ---------------------------------------------------------------- cv-ec: the Electoral College */
  V.register('cv-ec', function (el, o) {
    var F = frame(el, o, 'ec', 'The Electoral College');
    var mode = o.mode || 'calc', names = arr(o.names).length ? arr(o.names) : ['Candidate A', 'Candidate B'];
    if (mode === 'results') {
      var E0 = CV.ELECTIONS[o.election || 1860]; if (!E0) return;
      var max = M.max.apply(null, E0.rows.map(function (r) { return r[1]; })), tot = E0.rows.reduce(function (s, r) { return s + r[1]; }, 0), need = M.floor(tot / 2) + 1;
      var ul = h('ul', 'cve-bars'); F.body.appendChild(ul);
      E0.rows.forEach(function (r, i) { var li = h('li', 'cve-bar'); li.innerHTML = '<span class="cve-name">' + esc(r[0]) + '</span><span class="cve-track"><i class="' + fillClass(i) + '" style="width:' + (r[1] / max * 100).toFixed(1) + '%"></i></span><span class="cve-num">' + (F.quiet ? '' : r[1]) + '</span>'; ul.appendChild(li); });
      F.body.appendChild(h('p', 'cvv-note', '<b>' + (o.election || 1860) + '</b>: ' + (F.quiet ? '' : tot + ' electoral votes; ' + need + ' needed for a majority. ') + esc(E0.note)));
      return;
    }
    var assign = Object.assign({}, o.assign || {}), box = h('div', 'cvm-box'); F.body.appendChild(box);
    var totals = h('div', 'cve-totals'); if (mode === 'calc') F.body.insertBefore(totals, box);
    function sum(side) { return Object.keys(assign).reduce(function (s, ab) { var st = CV.state(ab); return s + (assign[ab] === side && st ? st.ev : 0); }, 0); }
    function draw() {
      box.innerHTML = '';
      var T = tileSvg({ dc: true, fill: function (st) { return assign[st.ab] === 'A' ? 'cve-a' : assign[st.ab] === 'B' ? 'cve-b' : mode === 'show' && o.color === 'ev' ? fillClass(binOf(EV_BINS, st.ev)) : 'cvm-plain'; },
        label: function (st) { return o.ask === st.ab ? '?' : st.ab; },
        text: function (st) { if (F.quiet && o.ask === st.ab) return ''; return String(mode === 'seats' ? st.seats : st.ev); },
        aria: mode === 'seats' ? 'House seats by state after the 2020 census (435 in all).' : 'Electoral votes by state (538 in all)' + (F.quiet ? '.' : '.'),
        onPick: mode === 'calc' && F.interactive ? function (ab) { assign[ab] = assign[ab] === 'A' ? 'B' : assign[ab] === 'B' ? undefined : 'A'; if (!assign[ab]) delete assign[ab]; draw(); } : null,
        pickLabel: function (st) { return st.name + ', ' + st.ev + ' electoral votes' + (assign[st.ab] ? ', ' + names[assign[st.ab] === 'A' ? 0 : 1] : ''); } });
      box.appendChild(T.svg);
      if (mode === 'calc') {
        var a = sum('A'), b = sum('B'), left = CV.EV_TOTAL - a - b;
        totals.innerHTML = '<div class="cve-meter" role="img" aria-label="' + names[0] + ' ' + a + ', ' + names[1] + ' ' + b + ', ' + left + ' not assigned; 270 to win"><i class="cve-a" style="width:' + (a / 5.38).toFixed(2) + '%"></i><i class="cve-none" style="width:' + (left / 5.38).toFixed(2) + '%"></i><i class="cve-b" style="width:' + (b / 5.38).toFixed(2) + '%"></i><span class="cve-270" style="left:' + (270 / 5.38).toFixed(2) + '%"></span></div>' +
          (F.quiet ? '' : '<p class="cve-nums"><span><i class="cvv-sw cve-a"></i>' + esc(names[0]) + ' <b>' + a + '</b></span><span>Not assigned <b>' + left + '</b></span><span><i class="cvv-sw cve-b"></i>' + esc(names[1]) + ' <b>' + b + '</b></span></p>');
        if (!F.quiet) F.say(a >= 270 ? esc(names[0]) + ' has a majority: ' + a + ' of 538.' : b >= 270 ? esc(names[1]) + ' has a majority: ' + b + ' of 538.' : a === 269 && b === 269 ? 'A 269–269 tie: the House would choose the President, one vote per state delegation.' : 'Tap states to give them to ' + esc(names[0]) + ' or ' + esc(names[1]) + ' (tap again to switch or clear). 270 wins.');
      }
    }
    draw();
    F.body.appendChild(h('p', 'cvv-note', mode === 'seats' ? 'House seats from the 2020 census, used for the 2022 to 2030 elections. Each state has at least one.' : 'Electoral votes for the 2024 and 2028 elections (from the 2020 census): each state\'s House seats plus two, and three for D.C. Maine and Nebraska may split theirs by congressional district.'));
    if (mode === 'calc' && F.interactive) btn(F.ctl, 'Clear', function () { assign = {}; draw(); });
  });
  /* ---------------------------------------------------------------- cv-doc: a primary-source reader */
  V.register('cv-doc', function (el, o) {
    var F = frame(el, o, 'doc', 'A primary source');
    var d = typeof o.doc === 'string' ? CV.DOCS[o.doc] : o.doc; if (!d) { F.body.appendChild(h('p', 'cvv-hint', 'Document not found.')); return; }
    var marks = arr(o.marks), mode = o.mode || 'show', picked = -1;
    var art = h('article', 'cvd-doc' + (o.big ? ' big' : '')); F.body.appendChild(art);
    if (o.title !== false) art.appendChild(h('h4', 'cvd-title', esc(d.title)));
    (d.paras || []).forEach(function (para) {
      var p = h('p', 'cvd-p'), htmlS = esc(para).replace(/ \/ /g, '<br>');
      // wrap each mark's phrase (first match) in a button or span
      marks.forEach(function (mk, i) {
        var needle = esc(mk.text), at = htmlS.indexOf(needle); if (at < 0) return;
        var tag = '<' + (F.interactive ? 'button type="button"' : 'span') + ' class="cvd-mark ' + fillClass(i) + '" data-i="' + i + '">' + (F.quiet || mode === 'find' ? '<sup>' + letter(i) + '</sup>' : '') + needle + '</' + (F.interactive ? 'button' : 'span') + '>';
        htmlS = htmlS.slice(0, at) + tag + htmlS.slice(at + needle.length);
      });
      p.innerHTML = htmlS; art.appendChild(p);
    });
    art.appendChild(h('p', 'cvd-src', 'Source: ' + esc(d.source)));
    var note = h('div', 'cvd-note'); note.setAttribute('aria-live', 'polite'); F.body.appendChild(note); note.hidden = true;
    art.querySelectorAll('.cvd-mark').forEach(function (b) {
      if (!F.interactive) return;
      b.addEventListener('click', function () {
        var i = +b.getAttribute('data-i');
        art.querySelectorAll('.cvd-mark').forEach(function (x) { x.classList.toggle('on', x === b); });
        if (mode === 'find') { picked = i; F.say(''); return; }
        if (F.quiet) return;
        note.hidden = false; note.innerHTML = '<b>“' + esc(marks[i].text) + '”</b> ' + (marks[i].note || '');
      });
    });
    if (mode === 'find') checkButtons(F, function () {
      if (picked < 0) return { ok: false, html: 'Tap a highlighted phrase first.' };
      var ok = picked === o.answer; return { ok: ok, html: ok ? (marks[picked].note || 'Yes.') : 'Not that phrase. Read the task again.' };
    }, null);
  });

  /* ---------------------------------------------------------------- cv-case: a case brief card */
  function voteBar(vote) {
    var m = /^(\d+)–(\d+)$/.exec(vote || ''); if (!m) return '';
    var a = +m[1], b = +m[2], s = '';
    for (var i = 0; i < a; i++) s += '<i class="cvk-v maj"></i>'; for (i = 0; i < b; i++) s += '<i class="cvk-v dis"></i>';
    return '<span class="cvk-votes" role="img" aria-label="' + a + ' to ' + b + '">' + s + '</span>';
  }
  V.register('cv-case', function (el, o) {
    var F = frame(el, o, 'case', 'A case brief');
    var base = typeof o.id === 'string' && CV.CASES[o.id] ? CV.CASES[o.id] : {}, c = Object.assign({}, base, o.fields || {});
    ['name', 'year', 'cite', 'vote', 'facts', 'q', 'holding', 'reasoning', 'dissent', 'later', 'test', 'clause'].forEach(function (k) { if (o[k] != null) c[k] = o[k]; });
    var hide = arr(o.hide); if (F.quiet && !o.hide) hide = ['name'];
    var mode = o.mode || 'card', H = function (k) { return hide.indexOf(k) >= 0; };
    var card = h('article', 'cvk-card'); F.body.appendChild(card);
    var head = h('header', 'cvk-head');
    head.innerHTML = '<h4 class="cvk-name">' + (H('name') ? '?' : '<i>' + esc(c.name || '') + '</i>') + '</h4>' +
      '<p class="cvk-meta">' + (c.cite && !H('name') && !H('cite') ? esc(c.cite) + ' ' : '') + '(' + (H('year') ? '?' : esc(c.year || '')) + ')' + (c.clause && !H('clause') ? ' · ' + esc(c.clause) : '') + '</p>' +
      (c.vote ? '<p class="cvk-vote">' + (H('vote') ? 'Vote: ?' : 'Vote ' + esc(c.vote) + ' ' + voteBar(c.vote) + (c.voteNote && !H('name') && (!o.vote || o.vote === base.vote) ? ' <small class="cvk-vnote">' + esc(c.voteNote) + '</small>' : '')) + '</p>' : '');
    card.appendChild(head);
    var labels = o.mode === 'irac' ? { q: 'Issue', test: 'Rule', reasoning: 'Application', holding: 'Conclusion' } : { facts: 'Facts', q: 'Question', holding: 'Holding', test: 'Rule or test', reasoning: 'Reasoning', dissent: 'Dissent', later: 'Later' };
    var order = o.mode === 'irac' ? ['facts', 'q', 'test', 'reasoning', 'holding'] : ['facts', 'q', 'holding', 'test', 'reasoning', 'dissent', 'later'];
    if (o.mode === 'irac') labels.facts = 'Facts';
    var parts = order.filter(function (k) { return c[k]; });
    var dl = h('dl', 'cvk-parts'); card.appendChild(dl);
    var shown = mode === 'card' ? parts.length : 1;
    function draw() {
      dl.innerHTML = '';
      parts.forEach(function (k, i) {
        if (i >= shown) return;
        var dt = h('dt', 'cvk-' + k, esc(labels[k] || k)), dd = h('dd', 'cvk-' + k, H(k) ? '?' : c[k]);
        dl.appendChild(dt); dl.appendChild(dd);
      });
    }
    draw();
    if (mode !== 'card' && F.interactive && parts.length > 1) {
      var nb = btn(F.ctl, 'Show next part ▶', function () { if (shown < parts.length) { shown++; draw(); } if (shown >= parts.length) nb.disabled = true; }, 'pri');
      btn(F.ctl, 'Show all', function () { shown = parts.length; draw(); nb.disabled = true; });
    }
    card.setAttribute('aria-label', (H('name') ? 'A case' : c.name) + ', ' + (H('year') ? '' : c.year));
  });

  /* ---------------------------------------------------------------- cv-scrutiny: the levels of scrutiny */
  var TIER_ORDER = ['strict', 'intermediate', 'rational'];
  V.register('cv-scrutiny', function (el, o) {
    var F = frame(el, o, 'scrutiny', 'The levels of scrutiny');
    var S = CV.SCRUTINY, mode = o.mode || 'tree', pick = o.pick || null;
    function tierCard(k, on) {
      var t = S.tiers[k], asked = o.ask === k, div = h('div', 'cvz-tier ' + fillClass(TIER_ORDER.indexOf(k) + 4) + (on ? ' on' : ''));
      div.innerHTML = '<h5>' + (asked && F.quiet ? '?' : esc(t.name)) + '</h5>' + (asked && F.quiet ? '' : '<p><b>Interest:</b> ' + esc(t.interest) + '</p><p><b>Fit:</b> ' + esc(t.fit) + '</p><p><b>Burden:</b> ' + esc(t.burden) + '</p><p class="cvz-res">' + esc(t.result) + '</p>');
      return div;
    }
    if (mode === 'tiers') { var row = h('div', 'cvz-row'); TIER_ORDER.forEach(function (k) { row.appendChild(tierCard(k, false)); }); F.body.appendChild(row); return; }
    F.body.appendChild(h('p', 'cvz-q', '<b>Step 1.</b> What does the law classify people by, or what right does it burden?'));
    var chips = h('div', 'cvz-chips'), result = h('div', 'cvz-result'); F.body.appendChild(chips); F.body.appendChild(result);
    function draw() {
      chips.innerHTML = ''; result.innerHTML = '';
      Object.keys(S.classes).forEach(function (k) {
        var cl = S.classes[k], b = h(F.interactive ? 'button' : 'span', 'cvz-chip' + (pick === k ? ' on' : ''), esc(cl.name));
        if (F.interactive) { b.type = 'button'; b.setAttribute('aria-pressed', pick === k ? 'true' : 'false'); b.addEventListener('click', function () { pick = k; draw(); }); }
        chips.appendChild(b);
      });
      if (!pick) { result.appendChild(h('p', 'cvv-hint', 'Choose one to see the tier and its test.')); return; }
      var cl = S.classes[pick];
      result.appendChild(h('p', 'cvz-q', '<b>Step 2.</b> That calls for:'));
      if (o.ask === cl.tier && F.quiet) { result.appendChild(h('div', 'cvz-tier ask', '<h5>?</h5>')); return; }
      result.appendChild(tierCard(cl.tier, true));
      if (cl.cases.length && !F.quiet) result.appendChild(h('p', 'cvz-cases', 'Cases: ' + cl.cases.map(function (k) { var c0 = CV.CASES[k]; return c0 ? '<i>' + esc(c0.name) + '</i> (' + c0.year + ')' : ''; }).join('; ')));
    }
    draw();
    F.body.appendChild(h('p', 'cvv-note', 'Some areas use other tests: history and tradition for the Second Amendment and the Establishment Clause, the Mathews balance for procedural due process, and Pike balancing for the dormant commerce clause.'));
  });

  /* ---------------------------------------------------------------- cv-clause: a Constitution navigator */
  V.register('cv-clause', function (el, o) {
    var F = frame(el, o, 'clause', 'The Constitution, article by article');
    var hlId = o.highlight || null, hlArt = hlId ? String(hlId).split('.')[0] : null, open = o.open || hlArt || 'I';
    var nav = h('div', 'cvc-nav'), tabs = h('div', 'ml-seg cvc-tabs'), pane = h('div', 'cvc-pane'); F.body.appendChild(nav); nav.appendChild(tabs); nav.appendChild(pane);
    var search = null;
    if (o.search && F.interactive) { search = h('input', 'cvc-search'); search.type = 'search'; search.placeholder = 'Search: commerce, veto, treason…'; search.setAttribute('aria-label', 'Search the Constitution summaries'); F.body.insertBefore(search, nav); search.addEventListener('input', function () { draw(); }); }
    var keys = CV.ARTICLES.map(function (A) { return A.n; }).concat(['amend']);
    function tab() {
      tabs.innerHTML = '';
      keys.forEach(function (k) { var b = btn(tabs, k === 'amend' ? 'Amendments' : 'Art. ' + k, function () { open = k; if (search) search.value = ''; tab(); draw(); }); b.setAttribute('aria-pressed', open === k ? 'true' : 'false'); });
    }
    function clauseRow(A, s, c) {
      var id = A.n + '.' + s.n + '.' + c[0], on = id === hlId, hidden = on && F.quiet;
      var li = h('li', 'cvc-clause' + (on ? ' hl' : ''));
      li.innerHTML = '<span class="cvc-id">' + (A.n === 'V' || A.n === 'VII' ? 'Art. ' + A.n : A.n + '.' + s.n + '.' + c[0]) + '</span><span class="cvc-body">' + (hidden ? '<b>?</b>' : (c[1] ? '<b>' + esc(c[1]) + '.</b> ' : '') + esc(c[2])) + '</span>';
      return li;
    }
    function draw() {
      pane.innerHTML = '';
      var q = search && search.value.trim().toLowerCase();
      if (q) {
        var ul = h('ul', 'cvc-list'), n = 0;
        CV.ARTICLES.forEach(function (A) { A.sections.forEach(function (s) { s.clauses.forEach(function (c) { if ((c[1] + ' ' + c[2]).toLowerCase().indexOf(q) >= 0) { ul.appendChild(clauseRow(A, s, c)); n++; } }); }); });
        CV.AMENDMENTS.forEach(function (a) { if ((a.title + ' ' + a.text).toLowerCase().indexOf(q) >= 0) { ul.appendChild(h('li', 'cvc-clause', '<span class="cvc-id">Amend. ' + a.n + '</span><span class="cvc-body"><b>' + esc(a.title) + ' (' + a.year + ').</b> ' + esc(a.text) + '</span>')); n++; } });
        pane.appendChild(h('p', 'cvv-hint', n + ' match' + (n === 1 ? '' : 'es') + '.')); pane.appendChild(ul); return;
      }
      if (open === 'amend') {
        var ol = h('ul', 'cvc-list');
        CV.AMENDMENTS.forEach(function (a) { var on = hlId === 'A' + a.n; ol.appendChild(h('li', 'cvc-clause' + (on ? ' hl' : ''), '<span class="cvc-id">' + CV.ordinal(a.n) + '</span><span class="cvc-body">' + (on && F.quiet ? '<b>?</b>' : '<b>' + esc(a.title) + ' (' + a.year + ').</b> ' + esc(a.text)) + '</span>')); });
        pane.appendChild(ol); return;
      }
      var A = CV.ARTICLES.filter(function (x) { return x.n === open; })[0]; if (!A) return;
      pane.appendChild(h('h4', 'cvc-arttitle', 'Article ' + A.n + ': ' + esc(A.title)));
      A.sections.forEach(function (s) {
        if (A.sections.length > 1) pane.appendChild(h('h5', 'cvc-sectitle', 'Section ' + s.n + '. ' + esc(s.title)));
        var ul = h('ul', 'cvc-list'); s.clauses.forEach(function (c) { ul.appendChild(clauseRow(A, s, c)); }); pane.appendChild(ul);
      });
      var hl = pane.querySelector('.hl'); if (hl && o.scroll !== false && F.interactive) setTimeout(function () { try { pane.scrollTop = hl.offsetTop - pane.offsetTop - 70; } catch (e) { } }, 0);
    }
    tab(); draw();
    F.body.appendChild(h('p', 'cvv-note', 'Summaries in our own words. Read the full text at the National Archives (archives.gov) or the Constitution Annotated (constitution.congress.gov).'));
  });
})(typeof window !== 'undefined' ? window : globalThis, typeof document !== 'undefined' ? document : null);
