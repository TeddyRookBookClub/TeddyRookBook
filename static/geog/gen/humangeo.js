/* Generators for humangeo, merged from part files by /tmp/merge_parts.js (edit the parts, not this file). */
/* ---- part A ---- */
/* Human Geography (Geography Ladder, course key humangeo), part A: units 1-3 (Thinking Geographically, Population and
   Migration, Cultural Patterns). 37 generators. Source: /tmp/work_humangeo_A/out/gen.js (merged by /tmp/merge_parts.js).
   Problem kinds: classify a scenario (mc; level 1 two choices, level 2 all categories, level 3 the reverse question or
   "choose all"), true/false, computed rates (num, computed from the generated numbers: densities, natural increase, infant
   mortality, doubling time, dependency ratio, net migration), and pictures from the kit and the course visuals (quiet):
   gg-pyramid, gg-dtm, gg-map, gg-diffusion, humangeo-pattern, humangeo-density, humangeo-tree.
   Numbers in the course model come from MathLadder.geog (pyramid(), dtmStage(), dependency()) so pictures and answers agree.
   Contested questions (Malthus, policies, effects of migration) are asked only as "which side would say this" or as facts
   about who argued what, never as which side is right. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  function fixNum(a) { if (!a) return; if (a.t === 'num' && typeof a.v === 'number') a.v = String(Math.round(a.v * 1e6) / 1e6); if (a.parts) a.parts.forEach(function (q) { fixNum(q.a); }); }
  function G(id, fn) { ML.gen(id, function (R, ctx) { var p = fn(R, ctx); fixNum(p.a); return p; }); }
  var LET = ['A', 'B', 'C', 'D', 'E'];
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  function r1(x) { return Math.round(x * 10) / 10; }
  function mc(choices, right, keep) { var o = { t: 'mc', choices: choices, v: choices.indexOf(right) }; if (keep) o.keep = true; return o; }
  function lvl(ctx) { return ctx.level || 1; }
  function qt(t) { return /^"/.test(t) ? t : '"' + t + '"'; }
  function tfq(R, list, hint) { var it = R.pick(list); return { q: 'True or false? ' + it[0], a: { t: 'tf', v: it[1] }, hint: hint, steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] }; }

  /* Classify a scenario into one of several categories.
     o = { items: [[text, catIndex, why?]], cats: [names], desc: [one-line definition per category], ask: function (text) -> question,
           rev: function (catName) -> reverse question, allq: function (catName) -> choose-all question, hint, tf: [[stmt, bool, why]] } */
  function classify(R, ctx, o) {
    var L = lvl(ctx), n = o.cats.length;
    var shape = L === 1 ? 'one' : L === 2 ? (o.tf && R.chance(0.25) ? 'tf' : n === 2 && R.coin() ? 'pair' : 'all') : R.pick(o.tf ? ['rev', 'choose', 'all', 'tf'] : ['rev', 'choose', 'all']);
    if (shape === 'tf') { var t = tfq(R, o.tf, o.hint); return t; }
    if (shape === 'pair') {
      var c0 = R.int(0, 1), y0 = R.pick(o.items.filter(function (x) { return x[1] === c0; })), n0 = R.pick(o.items.filter(function (x) { return x[1] !== c0; }));
      return { q: o.rev(o.cats[c0]), a: mc(R.shuffle([y0[0], n0[0]]), y0[0]), hint: o.hint,
        steps: [o.desc[c0], 'Yes: ' + qt(y0[0]) + (y0[2] ? ': ' + y0[2] : '') + '.', 'No: ' + qt(n0[0]) + ' (' + o.cats[n0[1]] + ').'] };
    }
    if (shape === 'one' || shape === 'all') {
      var it = R.pick(o.items), right = o.cats[it[1]], others = o.cats.filter(function (c, i) { return i !== it[1]; });
      var ch = shape === 'one' ? [right, R.pick(others)] : [right].concat(R.sample(others, Math.min(3, others.length)));
      return { q: o.ask(it[0]), a: mc(R.shuffle(ch), right), hint: o.hint,
        steps: [o.desc[it[1]]].concat(it[2] ? [qt(it[0]) + ': ' + it[2] + '.'] : []).concat(['So the answer is <b>' + right + '</b>.']) };
    }
    var ci = R.int(0, n - 1), cname = o.cats[ci], yes = o.items.filter(function (x) { return x[1] === ci; }), no = o.items.filter(function (x) { return x[1] !== ci; });
    if (shape === 'rev' || yes.length < 2) {
      var pick = R.pick(yes), wr = R.sample(no, 3), list = R.shuffle([pick].concat(wr));
      return { q: o.rev(cname), a: mc(list.map(function (x) { return x[0]; }), pick[0]), hint: o.hint,
        steps: [o.desc[ci], 'Yes: ' + qt(pick[0]) + (pick[2] ? ': ' + pick[2] : '') + '.'].concat(wr.map(function (x) { return 'No: ' + qt(x[0]) + ' (' + o.cats[x[1]] + ').'; })) };
    }
    var ky = R.int(1, Math.min(3, yes.length)), set = R.shuffle(R.sample(yes, ky).concat(R.sample(no, 4 - ky)));
    return { q: o.allq(cname), a: { t: 'mc', choices: set.map(function (x) { return x[0]; }), v: set.map(function (x, i) { return x[1] === ci ? i : -1; }).filter(function (i) { return i >= 0; }) }, hint: o.hint,
      steps: [o.desc[ci]].concat(set.map(function (x) { return (x[1] === ci ? 'Yes: ' : 'No: ') + qt(x[0]) + ' (' + o.cats[x[1]] + ').'; })) };
  }

  /* =============================================================== UNIT 1: THINKING GEOGRAPHICALLY */
  var LOC = [['48.86° N, 2.35° E', 0, 'a pair of coordinates is an exact position'], ['350 Fifth Avenue, New York, NY', 0, 'a street address is an exact position in a shared system'], ['Just south of the Great Lakes, on the main rail lines', 1, 'it describes the place by what is around it'],
    ['Two blocks north of the train station', 1, 'you must know where the station is'], ['33.9° S, 18.4° E', 0, 'coordinates never depend on other places'], ['At the mouth of a large river, facing the sea', 1, 'it uses the river and the sea as reference points'],
    ['Halfway between two capital cities', 1, 'it depends on knowing where the capitals are'], ['Lot 22 on the county survey map', 0, 'a surveyed lot number names one exact spot'], ['A short ferry ride from the mainland', 1, 'it describes the place by its connection to the mainland'],
    ['40.7° N, 74.0° W', 0, 'coordinates name one exact point'], ['Apartment 4B, 12 Elm Street, Springfield', 0, 'a full address names one exact spot'], ['Next to the largest lake in the region', 1, 'it uses the lake as a reference point'],
    ['Downstream from the capital, where the river widens', 1, 'it depends on the capital and the river'], ['Grid square C-7 on the city planning map', 0, 'a grid reference is an exact position on a shared map'], ['At the crossroads of three old trade routes', 1, 'it locates the place by the routes'],
    ['22.3° N, 114.2° E', 0, 'a pair of coordinates'], ['Near the border, a day\'s walk from the coast', 1, 'it depends on the border and the coast'],
    ['Across the bay from the old port', 1, 'it needs the bay and the port as reference points'], ['0°, 0°', 0, 'coordinates give an exact position'], ['ZIP code 94103, 1 Market Street', 0, 'an address pins down one spot'], ['On the main highway, an hour east of the capital', 1, 'it locates the place by the highway and the capital']];
  var LOC_DESC = ['Absolute location is an exact position that does not depend on other places: coordinates or an address.', 'Relative location describes a place by its connections to other places.'];
  G('humangeo.location', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 3 && R.chance(0.35)) {
      var c = R.pick([['A historian wants to explain why a river town became a busy market', 'relative'], ['A pilot needs to enter the exact position of a landing strip into a navigation system', 'absolute'], ['A planner explains why a port city grew next to a busy strait', 'relative'], ['A rescue team must reach a hiker\'s exact position on a mountain', 'absolute'], ['A business owner explains why a store does well beside a highway exit', 'relative']]);
      var right = c[1] === 'relative' ? 'Relative location' : 'Absolute location';
      return { q: c[0] + '. Which kind of location is more useful here?', a: mc(R.shuffle(['Absolute location', 'Relative location']), right), hint: 'Do they need an exact spot, or an explanation of connections?',
        steps: [c[1] === 'relative' ? 'Explaining why a place grew needs its connections: routes, neighbors, resources.' : 'Finding an exact spot needs coordinates or an address.', 'So ' + right.toLowerCase() + ' is more useful.'] };
    }
    return classify(R, ctx, { items: LOC, cats: ['Absolute location', 'Relative location'], desc: LOC_DESC, hint: 'Does the description need another place to make sense?',
      ask: function (t) { return 'What kind of location is this description? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which description gives a ' + c.toLowerCase() + '?'; }, allq: function (c) { return 'Which descriptions give a ' + c.toLowerCase() + '? Choose all that apply.'; },
      tf: [['Relative location can change over time even though absolute location does not.', true, 'A new highway or railroad can change a place\'s connections, but not its coordinates.'], ['Relative location is less useful than absolute location because it is less exact.', false, 'Relative location is often more useful: it helps explain why a place grew.'], ['A street address is an absolute location.', true, 'It names one exact spot in a system everyone shares.']] });
  });

  var SITE = [['Built on a hill that was easy to defend', 0, 'the hill is a feature of the spot itself'], ['A deep, sheltered harbor', 0, 'the harbor is part of the physical place'], ['Fresh springs and flat land for building', 0, 'water and flat land are on the spot'],
    ['An island in the middle of a river', 0, 'the island is the physical setting'], ['Where two major trade routes cross', 1, 'it is about routes linking it to other places'], ['Halfway between two large cities', 1, 'it describes the place by what lies around it'],
    ['Near coal fields that supply nearby factories', 1, 'the coal fields are other places nearby'], ['On a railroad linking farms to eastern markets', 1, 'it is about connections to farms and markets'], ['Fertile soil and a mild climate', 0, 'soil and climate are physical traits of the place'],
    ['Close to the border with a large trading partner', 1, 'the neighbor is another place'], ['A spring that never runs dry', 0, 'a water source on the spot'], ['A flat terrace above the reach of floods', 0, 'the terrace is a physical feature of the spot'],
    ['A rocky point that shelters ships from storms', 0, 'it describes the physical shape of the coast at the spot'], ['A day\'s sail from three other busy ports', 1, 'it is about links to other ports'], ['At the end of the only pass through the mountains', 1, 'it is about the route linking regions'],
    ['Surrounded by rich farmland that sends its crops to the town market', 1, 'it is about the farms around the town'], ['Beside a waterfall that once powered mills', 0, 'the waterfall is on the spot'], ['Where a new interstate highway meets a railroad', 1, 'it is about transportation links'], ['A narrow river crossing that was easy to bridge', 0, 'the narrow crossing is a physical feature of the spot'], ['Beside a strait that ships between two oceans must pass', 1, 'it is about the sea route linking other places']];
  G('humangeo.site-situation', function (R, ctx) {
    return classify(R, ctx, { items: SITE, cats: ['Site', 'Situation'], desc: ['Site is the physical character of the place itself: landforms, water, soil, harbor, climate.', 'Situation is the place\'s location relative to other places: routes, neighbors, resources and markets.'],
      hint: 'Could you see it standing on the spot (site), or do you need a bigger map (situation)?',
      ask: function (t) { return 'A city began here. Is this fact about its site or its situation? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which fact describes a city\'s <b>' + c.toLowerCase() + '</b>?'; }, allq: function (c) { return 'Which facts describe a city\'s <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['A city\'s situation can change when a new canal or railroad is built.', true, 'Situation is about connections, and new routes change connections.'], ['Site describes how a place connects to trade routes.', false, 'That is situation. Site is the physical character of the spot itself.'], ['A sheltered harbor is part of a port city\'s site.', true, 'The harbor is a physical feature of the spot.']] });
  });

  var REG = [['The Corn Belt, where corn is the main crop', 0, 'every place inside shares one trait'], ['The countries where Spanish is an official language', 0, 'every country in it shares an official language'], ['A state, with one set of laws', 0, 'a legal border with the same laws everywhere inside'],
    ['A school district', 0, 'a legal border; everyone inside attends the same schools'], ['A TV station\'s viewing area', 1, 'it is defined by connection to the station'], ['The area served by one airport\'s flights', 1, 'it is tied to the airport, a central node'],
    ['A pizza shop\'s delivery zone', 1, 'it is defined by deliveries from one shop'], ['The area where a city\'s newspaper is delivered', 1, 'it is tied to the newspaper\'s office'], ['The commuting zone around a big city', 1, 'it is defined by trips to the central city'],
    ['"The Midwest"', 2, 'people agree it exists but draw its edges differently'], ['"Dixie"', 2, 'it exists in people\'s minds, with fuzzy borders'], ['"The Middle East"', 2, 'books and people draw its edges in many ways'], ['"Silicon Valley"', 2, 'its edges depend on whom you ask'],
    ['The area where most homes get water from one reservoir', 1, 'it is linked to one water source by pipes'], ['A climate zone with hot, dry summers', 0, 'every place inside shares a climate trait']];
  G('humangeo.regions', function (R, ctx) {
    return classify(R, ctx, { items: REG, cats: ['Formal region', 'Functional region', 'Perceptual region'],
      desc: ['A formal region shares one measurable trait everywhere inside it.', 'A functional region is tied to a central point by connections such as trips, deliveries or broadcasts.', 'A perceptual region exists in people\'s minds; its borders differ from person to person.'],
      hint: 'What defines the border: a shared trait, connections to a center, or people\'s ideas?',
      ask: function (t) { return 'What kind of region is this? <br><b>' + t + '</b>'; }, rev: function (c) { return 'Which is an example of a <b>' + c.toLowerCase() + '</b>?'; },
      allq: function (c) { return 'Which are examples of a <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['A functional region usually gets weaker toward its edges.', true, 'Ties to the center fade with distance.'], ['Every region with a big city at its center is a functional region.', false, 'Ask what defines the border. A state has a capital but is a formal region.'], ['People always agree on the borders of a perceptual region.', false, 'Perceptual regions have fuzzy borders that differ from person to person.']] });
  });

  var SCL = [['Comparing life expectancy in every country on Earth', 0], ['Tracking world trade in coffee', 0], ['Mapping how the world\'s forests changed since 1990', 0], ['Comparing average income in the 50 U.S. states', 1, 'the data covers one country, broken into its states'],
    ['A country\'s yearly birth rate', 1], ['Comparing unemployment in the provinces of Canada', 1, 'one country, broken into provinces'], ['Mapping traffic accidents at each intersection in one town', 2], ['Choosing where a new bus stop should go', 2],
    ['Finding which neighborhoods of a city lack a grocery store', 2], ['Studying who uses one city park', 2]];
  G('humangeo.scale-of-analysis', function (R, ctx) {
    var L = lvl(ctx);
    if (L >= 2 && R.chance(0.45)) { // averages hide differences: four regions of equal population
      var avg = R.int(30, 60), d = [R.int(5, 20), R.int(5, 20)], v = [avg + d[0], avg - d[0], avg + d[1], avg - d[1]].map(function (x) { return x; }), names = ['North', 'South', 'East', 'West'];
      v = R.shuffle(v); var lo = Math.min.apply(Math, v), hi = Math.max.apply(Math, v);
      if (L === 2 || R.coin()) return { q: 'A country has four regions with the same number of people. Average incomes (thousand dollars a year): ' + names.map(function (n, i) { return n + ' ' + v[i]; }).join(', ') + '. What is the average income at the <b>national</b> scale, in thousand dollars?', a: { t: 'num', v: avg }, hint: 'With equal populations, the national average is the average of the four regions.',
        steps: ['Add the four regions: ' + v.join(' + ') + ' = ' + (avg * 4) + '.', 'Divide by 4: ' + (avg * 4) + ' ÷ 4 = ' + avg + '.', 'At the national scale the country looks like one number, ' + avg + '; at the regional scale incomes range from ' + lo + ' to ' + hi + '.'] };
      return { q: 'A country has four regions with the same number of people. Average incomes (thousand dollars a year): ' + names.map(function (n, i) { return n + ' ' + v[i]; }).join(', ') + '. The national average is ' + avg + '. How many thousand dollars apart are the richest and poorest regions?', a: { t: 'num', v: hi - lo }, hint: 'Subtract the lowest regional income from the highest.',
        steps: ['Highest: ' + hi + '. Lowest: ' + lo + '.', hi + ' − ' + lo + ' = ' + (hi - lo) + '.', 'The national average of ' + avg + ' hides a gap of ' + (hi - lo) + ' thousand dollars: a pattern you see only at the regional scale.'] };
    }
    return classify(R, ctx, { items: SCL, cats: ['Global', 'National', 'Local'], desc: ['The global scale studies the whole world.', 'The national scale studies one country, often broken into its states or provinces.', 'The local scale studies a city, town or neighborhood.'],
      hint: 'How big is the area the study covers?', ask: function (t) { return 'Which scale of analysis does this study use? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which study works at the <b>' + c.toLowerCase() + '</b> scale of analysis?'; }, allq: function (c) { return 'Which studies work at the <b>' + c.toLowerCase() + '</b> scale? Choose all that apply.'; },
      tf: [['A world map is a large-scale map.', false, 'A world map is a small-scale map (a small ratio such as 1:50,000,000), even though it shows the global scale of analysis.'], ['A pattern seen at the national scale always holds at the local scale.', false, 'Averages hide differences; a rich country can have very poor regions.'], ['Scale of analysis is the size of the area you study.', true, 'Global, national, regional and local are scales of analysis.']] });
  });

  var DD = [['Most of a town\'s commuters live within 20 km', 0], ['A country trades most with its neighbors', 0], ['A small library\'s users mostly live in the same neighborhood', 0], ['Fewer and fewer fans come to a team\'s games from farther away', 0],
    ['Most people marry someone who grew up within a few hours of them', 0], ['A newspaper sells most copies close to the city where it is printed', 0], ['Phone calls between two cities fall as the distance between them grows', 0], ['A farmers\' market draws most buyers from nearby towns', 0],
    ['Video calls let a family talk across an ocean every day', 1], ['A trip that took months by wagon takes hours by jet', 1], ['A letter that took weeks now arrives as an email in seconds', 1], ['Overnight shipping lets a shop sell to buyers across the country', 1],
    ['A worker joins a meeting on another continent from home', 1], ['News from the far side of the world appears on phones within minutes', 1], ['A high-speed train cuts a four-hour trip to ninety minutes', 1]];
  G('humangeo.distance-decay', function (R, ctx) {
    var L = lvl(ctx);
    if (L >= 2 && R.chance(0.4)) {
      var a = R.int(40, 60), b = R.int(15, 25), c = R.int(5, 12), d = 100 - a - b - c, km = R.pick([5, 10, 20]);
      var ask = R.coin() ? 2 : 1, want = ask === 2 ? a + b : a;
      return { q: 'A survey of shoppers at a store: ' + a + '% live within ' + km + ' km, ' + b + '% live ' + km + '–' + 2 * km + ' km away, ' + c + '% live ' + 2 * km + '–' + 3 * km + ' km away, and ' + d + '% live farther. What percent live within ' + ask * km + ' km?', a: { t: 'num', v: want, pct: true }, hint: 'Add the shares of the bands closer than ' + ask * km + ' km.',
        steps: ask === 2 ? ['Within ' + 2 * km + ' km means the first two bands.', a + ' + ' + b + ' = ' + want + '.', 'Most shoppers come from nearby: distance decay.'] : ['The first band is within ' + km + ' km: ' + a + '%.', 'The share falls in each band farther out: distance decay.'] };
    }
    return classify(R, ctx, { items: DD, cats: ['Distance decay', 'Time-space compression'], desc: ['Distance decay: interaction falls off as distance grows.', 'Time-space compression: faster, cheaper travel and communication make far places feel closer.'],
      hint: 'Is the example about interaction falling off with distance, or about distance becoming easier to cross?', ask: function (t) { return 'Which idea does this example show? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which example shows <b>' + c.toLowerCase() + '</b>?'; }, allq: function (c) { return 'Which examples show <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['Because of the internet, distance no longer affects how often places interact.', false, 'Time-space compression weakens distance decay, but most trips, trade and migration are still fairly short.'], ['Time-space compression changes the distance in kilometers between two cities.', false, 'The distance stays the same; the time and cost of crossing it fall.'], ['Most of a typical person\'s trips are short.', true, 'That is distance decay in everyday life.']] });
  });

  var PAT = { clustered: 'clustered: bunched into groups with empty space between', dispersed: 'dispersed: spread out evenly, about the same space between each', random: 'random: scattered with no regular arrangement', linear: 'linear: lined up along a line, such as a road or river' };
  G('humangeo.spatial-patterns', function (R, ctx) {
    var L = lvl(ctx), shape = L === 1 ? R.pick(['density', 'pattern']) : L === 2 ? R.pick(['density', 'pattern', 'tf']) : R.pick(['reverse', 'same', 'pattern']);
    if (shape === 'density') {
      var area = R.pick([4, 5, 6, 8, 10, 12, 16, 20, 25, 36]), dens = R.int(3, 40), n = area * dens, what = R.pick([['houses', 'square miles'], ['farms', 'square miles'], ['wells', 'square kilometers'], ['stores', 'square kilometers']]);
      return { q: 'A district of ' + area + ' ' + what[1] + ' has ' + fmt(n) + ' ' + what[0] + '. What is the density of ' + what[0] + ' per ' + what[1].replace('miles', 'mile').replace('kilometers', 'kilometer') + '?', a: { t: 'num', v: dens }, hint: 'Density = number ÷ area.',
        steps: ['Density = number ÷ area.', fmt(n) + ' ÷ ' + area + ' = ' + dens + '.', 'So there are ' + dens + ' ' + what[0] + ' per ' + what[1].replace('miles', 'mile').replace('kilometers', 'kilometer') + '.'] };
    }
    if (shape === 'reverse') {
      var a2 = R.pick([5, 8, 10, 12, 15]), d2 = R.int(4, 30);
      return { q: 'A township has a density of ' + d2 + ' houses per square mile over ' + a2 + ' square miles. How many houses does it have?', a: { t: 'num', v: a2 * d2 }, hint: 'Number = density × area.', steps: ['Density = number ÷ area, so number = density × area.', d2 + ' × ' + a2 + ' = ' + a2 * d2 + '.'] };
    }
    if (shape === 'same') {
      var nn = R.pick([16, 20, 24]), ar = R.pick([2, 4, 8]), seed = R.int(1, 50);
      var kinds = R.shuffle(['clustered', 'dispersed']);
      var ch = ['They have the same density but different concentration', 'They have different densities', 'They have the same concentration but different density'];
      return { q: 'Squares A and B each show ' + nn + ' houses in ' + ar + ' square miles. Which statement is true?', viz: { name: 'humangeo-pattern', opts: { show: kinds, n: nn, areas: [ar, ar], seed: seed, quiet: true, interactive: false } },
        a: mc(ch, ch[0]), hint: 'Density is number ÷ area. Concentration is how bunched the houses are.',
        steps: ['Density: ' + nn + ' ÷ ' + ar + ' = ' + (nn / ar) + ' houses per square mile in both squares.', 'Concentration: square ' + (kinds[0] === 'clustered' ? 'A' : 'B') + ' is clustered and square ' + (kinds[0] === 'clustered' ? 'B' : 'A') + ' is dispersed.', 'Same density, different concentration.'] };
    }
    if (shape === 'tf') return tfq(R, [['Two areas with the same number of houses per square mile can have different concentrations.', true, 'Density counts per area; concentration describes how bunched they are.'], ['Density tells you whether houses are clustered or dispersed.', false, 'Density is one number per area; it says nothing about arrangement.'], ['Houses lined up along a road form a linear pattern.', true, 'A linear pattern follows a line such as a road or river.'], ['A dispersed pattern has houses bunched into tight groups.', false, 'That is clustered. Dispersed means spread out.']], 'Density is a count per area; concentration and pattern describe arrangement.');
    var opts = L === 1 ? ['clustered', 'dispersed', 'linear'] : ['clustered', 'dispersed', 'random', 'linear'], k = R.pick(opts);
    return { q: 'What pattern do the houses in this square form?', viz: { name: 'humangeo-pattern', opts: { show: [k], n: R.pick([18, 20, 24]), seed: R.int(1, 60), quiet: true, interactive: false } },
      a: mc(opts.map(cap), cap(k)), hint: 'Are they in groups, evenly spaced, scattered, or along a line?', steps: ['The houses are ' + PAT[k] + '.', 'So the pattern is ' + k + '.'] };
  });

  var DATA = [['Census count of people in each county', 0], ['Satellite measurement of forest area each year', 0], ['Average commute time by city', 0], ['A survey asking people to rate their town from 1 to 5', 0, 'the answers are recorded as numbers you can average'],
    ['Rainfall totals from weather stations', 0], ['Number of new homes built each year', 0], ['Interviews with farmers about why they changed crops', 1], ['Photographs of shop signs on a street', 1, 'pictures are data too'],
    ['A researcher\'s field notes from a market', 1], ['Open-ended answers to "What do you like about this town?"', 1, 'the answers are words, not numbers'], ['Sketch maps residents drew of their neighborhood', 1], ['Recorded stories of older residents about how the town changed', 1]];
  G('humangeo.geographic-data', function (R, ctx) {
    var L = lvl(ctx);
    if (L >= 2 && R.chance(0.35)) {
      var src = R.pick([['Images of the same farmland taken from space each summer', 'Remote sensing', 'data gathered from satellites, planes or drones'], ['A count of every person living in the country, taken every ten years', 'A census', 'a count of a whole population'],
        ['Questions asked of 1,000 people chosen at random', 'A survey', 'questions asked of a sample'], ['Walking a neighborhood to photograph and measure buildings', 'Fieldwork', 'observing and measuring on the spot'], ['Software that layers roads, rivers and census data on one map', 'GIS', 'a geographic information system: software that layers many kinds of data on one map']]);
      var all = ['Remote sensing', 'A census', 'A survey', 'Fieldwork', 'GIS'], ch = [src[1]].concat(R.sample(all.filter(function (x) { return x !== src[1]; }), 3));
      return { q: 'Which source or tool is this? <br><b>' + src[0] + '</b>', a: mc(R.shuffle(ch), src[1]), hint: 'Is it a count, a sample, a picture from above, a visit, or software?', steps: [src[1] + ' is ' + src[2] + '.', 'So the answer is ' + src[1] + '.'] };
    }
    return classify(R, ctx, { items: DATA, cats: ['Quantitative data', 'Qualitative data'], desc: ['Quantitative data are numbers: counts, measurements, rates.', 'Qualitative data are words, pictures and observations: interviews, photos, field notes.'],
      hint: 'Is it recorded as numbers, or as words and images?', ask: function (t) { return 'What kind of data is this? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which source gives <b>' + c.toLowerCase() + '</b>?'; }, allq: function (c) { return 'Which sources give <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['Only numbers count as geographic data.', false, 'Interviews, photos and field notes are data too.'], ['Interviews can help explain the reasons behind a pattern shown by census numbers.', true, 'Numbers show what and where; words help explain why.'], ['Satellite images are an example of remote sensing.', true, 'Remote sensing gathers data from a distance, from satellites, planes or drones.']] });
  });

  var TMAP = [['The percent of adults with a college degree in each state', 'Choropleth', 'a rate for each area'], ['People per square kilometer in each country', 'Choropleth', 'a rate for each area'], ['The share of homes with internet in each county', 'Choropleth', 'a percentage for each area'],
    ['The location of every school in a state, one dot each', 'Dot distribution', 'locations of individual things'], ['Where each farm is in a county', 'Dot distribution', 'locations of things'], ['Where each case of a disease was reported', 'Dot distribution', 'locations of individual cases'],
    ['The number of passengers at 30 airports', 'Graduated symbol', 'totals at points'], ['The population of the 20 largest cities', 'Graduated symbol', 'totals at points'], ['Tons of cargo at major ports', 'Graduated symbol', 'totals at points'],
    ['Average January temperature across a continent', 'Isoline', 'a value that changes smoothly across the land'], ['Elevation of the land', 'Isoline', 'a smooth surface'], ['Yearly rainfall across a country', 'Isoline', 'a value that changes smoothly'],
    ['Countries resized by their total population', 'Cartogram', 'places resized by a total'], ['Countries resized by the size of their economy', 'Cartogram', 'places resized by a value']];
  var TYPES = ['Choropleth', 'Dot distribution', 'Graduated symbol', 'Isoline', 'Cartogram'];
  G('humangeo.thematic-maps', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 3 && R.chance(0.4)) {
      var bad = R.pick([['total number of farms', 'farms per 1,000 km² (or the percent of land in farms)'], ['total number of people', 'people per km²'], ['total number of doctors', 'doctors per 10,000 people'], ['total number of cars', 'cars per 1,000 people']]);
      var ch = ['Shade by a rate such as ' + bad[1], 'Use darker colors for the largest states', 'Shade by the total, but use more colors', 'Leave out the smallest states'];
      return { q: 'A choropleth map shades each state by the <b>' + bad[0] + '</b>. The largest states look darkest. What is the best fix?', a: mc(ch, ch[0]), hint: 'Large areas get high totals just because they are large.',
        steps: ['Shading areas by totals makes big areas look important.', 'A rate divides by area or population, so places can be compared fairly.', 'Shade by ' + bad[1] + ' (or show the totals with graduated symbols).'] };
    }
    if (L === 2 && R.chance(0.3)) return tfq(R, [['A choropleth map should usually show rates or percentages, not raw totals.', true, 'Totals make big areas look important just because they are big.'], ['Isolines join places with equal values, such as equal temperature.', true, 'That is what an isoline is.'], ['A dot distribution map is best for showing a percentage for each state.', false, 'Percentages for areas belong on a choropleth map; dots show where things are.'], ['A cartogram keeps every country at its true area.', false, 'A cartogram resizes places by a value, such as population.']], 'Match the map to the kind of data: rates, locations, totals or smooth surfaces.');
    var it = R.pick(TMAP), wr = R.sample(TYPES.filter(function (x) { return x !== it[1]; }), L === 1 ? 2 : 3);
    return { q: 'Which kind of thematic map fits this data best? <br><b>' + it[0] + '</b>', a: mc(R.shuffle([it[1]].concat(wr)), it[1]), hint: 'Is it a rate for areas, locations, totals at points, a smooth surface, or a resizing?',
      steps: ['The data is ' + it[2] + '.', { 'Choropleth': 'Choropleth maps shade areas by rates or percentages.', 'Dot distribution': 'Dot maps show where things are.', 'Graduated symbol': 'Graduated symbols show totals at points.', 'Isoline': 'Isolines join places with equal values.', 'Cartogram': 'Cartograms resize places by a value.' }[it[1]], 'So the best choice is ' + (it[1] === 'Isoline' ? 'an ' : 'a ') + it[1].toLowerCase() + ' map.'] };
  });

  var HE = [['Climate decides how hard people work', 0, 'it says the environment decides behavior'], ['Mountain peoples are always independent because of the mountains', 0, 'it claims the land decides character'], ['Hot climates make countries poor', 0, 'it claims climate decides wealth'], ['People in cold places are naturally more inventive', 0, 'it claims climate decides abilities'],
    ['Desert farmers use irrigation to grow crops', 1, 'people chose a response to a dry environment'], ['Different cultures in the same valley farm in different ways', 1, 'same environment, different choices'], ['The Dutch drained shallow seas to make farmland', 1, 'the environment set limits; people chose how to respond'],
    ['A cold city builds heated walkways and keeps growing', 1, 'people used technology to live with the climate'], ['A river town can choose to build a port, a dam or a park', 1, 'the environment offers options'], ['Coastal farmers switch to salt-tolerant crops', 1, 'people adapt using their knowledge'], ['People in rainy lands must be gloomy', 0, 'it claims weather decides mood and character'], ['Island peoples can never be powerful', 0, 'it claims geography decides history'],
    ['A tropical climate prevents people from inventing new things', 0, 'it claims climate decides ability'], ['A desert city recycles water to keep growing', 1, 'people chose technology to work within limits'], ['Two neighboring countries with the same climate choose very different economies', 1, 'same environment, different choices'],
    ['Farmers build terraces so they can grow rice on steep hills', 1, 'people reshaped the land to fit their needs'], ['Herders move with the seasons to find grass', 1, 'people chose a way of life that fits the environment']];
  G('humangeo.human-environment', function (R, ctx) {
    return classify(R, ctx, { items: HE, cats: ['Environmental determinism', 'Possibilism'], desc: ['Environmental determinism said the environment decides how people live; geographers rejected it.', 'Possibilism says the environment sets limits and offers options, and people choose using culture and technology.'],
      hint: 'Does the statement say the environment decides, or that people choose among options?', ask: function (t) { return 'Which view does this statement reflect? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which statement reflects <b>' + c.toLowerCase() + '</b>?'; }, allq: function (c) { return 'Which statements reflect <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['Most geographers today accept environmental determinism.', false, 'Geographers set it aside long ago because it ignored culture and choice and was used to rank peoples unfairly.'], ['Possibilism says the environment sets limits but people choose among options.', true, 'That is the core of possibilism.'], ['Possibilism means the environment does not matter at all.', false, 'It says the environment sets limits and offers options; it still matters.'], ['The historian Lucien Febvre gave possibilism its name.', true, 'He named the idea in 1922, building on Paul Vidal de la Blache.']] });
  });

  /* =============================================================== UNIT 2: POPULATION AND MIGRATION */
  var CROWD = ['BGD', 'IND', 'CHN', 'JPN', 'NGA', 'PAK', 'IDN', 'PHL', 'VNM'], SPARSE = ['CAN', 'AUS', 'MNG', 'KAZ', 'LBY', 'NAM'];
  G('humangeo.population-distribution', function (R, ctx) {
    var L = lvl(ctx), GG = ML.geog, shape = L === 1 ? R.pick(['env', 'map']) : L === 2 ? R.pick(['env', 'map', 'tf']) : R.pick(['map', 'egypt', 'tf']);
    if (shape === 'map') {
      var c = R.pick(CROWD), others = R.sample(SPARSE, L === 1 ? 1 : 2);
      var ids = R.shuffle([c].concat(others)), mark = {}; ids.forEach(function (id, i) { mark[id] = LET[i]; });
      var big = others.slice().sort(function (a, b) { return GG.country(b).km2 - GG.country(a).km2; })[0];
      var nm = function (id) { return id === 'PHL' ? 'the Philippines' : GG.country(id).n; };
      return { q: 'Which lettered country has the <b>most people</b>?', viz: { name: 'gg-map', opts: { mark: mark, quiet: true, interactive: false, dots: true, label: 'A world map with lettered countries.' } },
        a: { t: 'mc', choices: ids.map(function (id, i) { return LET[i]; }), v: ids.indexOf(c), keep: true }, hint: 'Large land area does not mean many people. Think of warm, wet, fertile land.',
        steps: ['The lettered countries are ' + ids.map(function (id, i) { return LET[i] + ': ' + nm(id); }).join(', ') + '.', (GG.country(big).km2 >= 1.5 * GG.country(c).km2 ? cap(nm(big)) + ' is about ' + fmt(GG.country(big).km2 / GG.country(c).km2) + ' times the area of ' + nm(c) + ', but much of its land is too dry or too cold to farm.' : others.map(nm).join(' and ') + (others.length > 1 ? ' are mostly dry or cold land, with few people for their size.' : ' is mostly dry or cold land, with few people for its size.')), cap(nm(c)) + ' (' + mark[c] + ') has by far the most people, crowded onto warm, well-watered plains, valleys and deltas.'] };
    }
    if (shape === 'egypt') {
      var ch = ['Along the Nile valley and delta', 'Spread evenly across the country', 'In the Western Desert', 'Along the Red Sea mountains'];
      return { q: 'Egypt is about one million square kilometers, mostly desert. Where do almost all Egyptians live?', viz: { name: 'gg-map', opts: { region: ['EGY'], features: ['nile'], quiet: true, interactive: false, label: 'A map of Egypt with the Nile River.' } }, a: mc(ch, ch[0]), hint: 'In a desert, what do people need most?',
        steps: ['Water is the limiting factor in a desert.', 'The Nile brings water and fertile soil through the desert.', 'Over 95 percent of Egyptians live in the Nile valley and delta.'] };
    }
    if (shape === 'tf') return tfq(R, [['Most of the world\'s people live in Asia.', true, 'Nearly 60 percent of people live in Asia (UN, 2025).'], ['The largest countries by area always have the most people.', false, 'Canada, Australia and Russia are huge but have few people for their size.'], ['River valleys and deltas are often crowded.', true, 'They offer water, flat land and fertile soil.'], ['High mountains are usually densely populated.', false, 'Steep, cold land is hard to farm and build on, so few people live there.'], ['Europe is one of the world\'s large population clusters.', true, 'The big clusters are East Asia, South Asia, Southeast Asia and Europe.']], 'People crowd onto low, well-watered, fertile land.');
    var env = R.pick([['A fertile river delta', 'Many people', 'It has water, flat land and rich soil.'], ['A mild, well-watered coastal plain', 'Many people', 'It has flat land, water and a mild climate.'], ['A wide, well-watered river valley', 'Many people', 'It has water and good soil.'],
      ['A hot desert far from rivers', 'Few people', 'It has too little water to farm.'], ['Tundra near the Arctic', 'Few people', 'It is too cold, with a very short growing season.'], ['High, steep mountains', 'Few people', 'The land is cold and steep, hard to farm and build on.'], ['A dense rainforest far from rivers and roads', 'Few people', 'It is hard to clear and farm, and far from routes.']]);
    return { q: 'Would you expect many people or few people to live here? <br><b>' + env[0] + '</b>', a: mc(['Many people', 'Few people'], env[1]), hint: 'Could the land feed many people?', steps: [env[2], 'So expect ' + env[1].toLowerCase() + '.'] };
  });

  G('humangeo.density-types', function (R, ctx) {
    var L = lvl(ctx);
    var land = R.pick([50, 80, 100, 120, 150, 200, 250, 300, 400, 500]) * 1000, arPct = R.pick([5, 8, 10, 12, 15, 20, 25, 40, 50]), arable = land * arPct / 100;
    var phys = R.pick([200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000]), people = arable * phys, agri = Math.round(R.pick([0.05, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5]) * phys), farmers = agri * arable;
    var arith = people / land;
    var pic = { name: 'humangeo-density', opts: { land: land, arable: arPct / 100, people: people, farmers: farmers, quiet: true, interactive: false, seed: R.int(1, 40) } };
    var facts = 'A country has ' + fmt(land) + ' km² of land, of which ' + arPct + '% is arable. It has ' + fmt(people) + ' people, and ' + fmt(farmers) + ' of them are farmers.';
    var kind = L === 1 ? R.pick(['arith', 'phys']) : L === 2 ? R.pick(['arith', 'phys', 'agri']) : R.pick(['agri', 'reverse', 'which']);
    if (kind === 'reverse') {
      return { q: 'A country\'s arithmetic density is ' + fmt(arith) + ' people per km² and its physiological density is ' + fmt(phys) + ' people per km² of arable land. What percent of its land is arable?', a: { t: 'num', v: arPct, pct: true }, hint: 'Arithmetic ÷ physiological = arable land ÷ all land.',
        steps: ['Arithmetic = people ÷ land; physiological = people ÷ arable land.', 'Dividing: arithmetic ÷ physiological = arable land ÷ land.', fmt(arith) + ' ÷ ' + fmt(phys) + ' = ' + (arPct / 100) + ', which is ' + arPct + '%.'] };
    }
    if (kind === 'which') {
      var ch = ['Agricultural density', 'Arithmetic density', 'Physiological density'];
      var w = R.pick([['farmers per km² of arable land', 0], ['people per km² of all land', 1], ['people per km² of arable land', 2]]);
      return { q: 'Which density measures <b>' + w[0] + '</b>?', a: mc(ch, ch[w[1]]), hint: 'Which people (all or farmers) and which land (all or arable)?', steps: ['Arithmetic: all people ÷ all land. Physiological: all people ÷ arable land. Agricultural: farmers ÷ arable land.', 'So ' + w[0] + ' is ' + ch[w[1]].toLowerCase() + '.'] };
    }
    var sp = { arith: ['arithmetic density', arith, 'people per km²', ['Divide all the people by all the land.', fmt(people) + ' ÷ ' + fmt(land) + ' = ' + fmt(arith) + ' people per km².']],
      phys: ['physiological density', phys, 'people per km² of arable land', ['Arable land = ' + arPct + '% of ' + fmt(land) + ' = ' + fmt(arable) + ' km².', 'Divide all the people by the arable land: ' + fmt(people) + ' ÷ ' + fmt(arable) + ' = ' + fmt(phys) + ' people per km² of arable land.']],
      agri: ['agricultural density', agri, 'farmers per km² of arable land', ['Arable land = ' + arPct + '% of ' + fmt(land) + ' = ' + fmt(arable) + ' km².', 'Divide the farmers by the arable land: ' + fmt(farmers) + ' ÷ ' + fmt(arable) + ' = ' + fmt(agri) + ' farmers per km² of arable land.']] }[kind];
    return { q: facts + ' Find its <b>' + sp[0] + '</b>, in ' + sp[2] + '.', viz: pic, a: { t: 'num', v: sp[1] }, hint: kind === 'arith' ? 'Use all the people and all the land.' : kind === 'phys' ? 'Use all the people, but only the arable land.' : 'Use only the farmers and only the arable land.',
      steps: sp[3].concat(kind === 'arith' ? [] : ['Check: arable land is only part of the land, so this density is ' + (kind === 'phys' ? 'larger than the arithmetic density (' + fmt(arith) + ').' : 'about farmland, not all land.')]) };
  });

  function rniText(b, d) { var diff = b - d, pct = r1(diff / 10); return [b + ' − ' + d + ' = ' + diff + ' per 1,000.', diff + ' ÷ 10 = ' + pct + '%.']; }
  G('humangeo.birth-death-rates', function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? 'rni' : L === 2 ? R.pick(['rni', 'counts', 'neg']) : R.pick(['counts', 'reverse', 'neg']);
    if (kind === 'rni' || kind === 'neg') {
      var b = kind === 'neg' ? R.int(7, 10) : R.int(12, 45), d = kind === 'neg' ? R.int(b + 1, b + 5) : R.int(5, Math.min(b - 2, 20)), v = r1((b - d) / 10);
      return { q: 'A country\'s crude birth rate is ' + b + ' per 1,000 and its crude death rate is ' + d + ' per 1,000. What is its rate of natural increase, as a percent?', a: { t: 'num', v: v, pct: true }, hint: 'Subtract, then turn "per 1,000" into a percent by dividing by 10.',
        steps: rniText(b, d).concat(v < 0 ? ['Negative: more deaths than births, a natural decrease.'] : ['The population grows by ' + v + '% a year from births and deaths alone.']) };
    }
    if (kind === 'counts') {
      var pop = R.pick([2, 4, 5, 8, 10, 20, 25, 40]) * 1000000, cb = R.int(10, 40), cd = R.int(5, Math.min(cb - 1, 15)), births = pop / 1000 * cb, deaths = pop / 1000 * cd, ask = R.pick(['cbr', 'cdr', 'rni']);
      var q0 = 'A country of ' + fmt(pop) + ' people had ' + fmt(births) + ' births and ' + fmt(deaths) + ' deaths last year. ';
      if (ask === 'cbr') return { q: q0 + 'What is its crude birth rate, per 1,000 people?', a: { t: 'num', v: cb }, hint: 'Births ÷ population × 1,000.', steps: [fmt(births) + ' ÷ ' + fmt(pop) + ' = ' + (cb / 1000) + '.', (cb / 1000) + ' × 1,000 = ' + cb + ' births per 1,000 people.'] };
      if (ask === 'cdr') return { q: q0 + 'What is its crude death rate, per 1,000 people?', a: { t: 'num', v: cd }, hint: 'Deaths ÷ population × 1,000.', steps: [fmt(deaths) + ' ÷ ' + fmt(pop) + ' = ' + (cd / 1000) + '.', (cd / 1000) + ' × 1,000 = ' + cd + ' deaths per 1,000 people.'] };
      return { q: q0 + 'What is its rate of natural increase, as a percent?', a: { t: 'num', v: r1((cb - cd) / 10), pct: true }, hint: 'Find both rates per 1,000, subtract, then divide by 10.',
        steps: ['CBR = ' + fmt(births) + ' ÷ ' + fmt(pop) + ' × 1,000 = ' + cb + '.', 'CDR = ' + fmt(deaths) + ' ÷ ' + fmt(pop) + ' × 1,000 = ' + cd + '.'].concat(rniText(cb, cd)) };
    }
    var b3 = R.int(15, 42), rn = R.int(5, Math.min(30, b3 - 4)), d3 = b3 - rn;
    return { q: 'A country\'s rate of natural increase is ' + r1(rn / 10) + '% and its crude birth rate is ' + b3 + ' per 1,000. What is its crude death rate, per 1,000?', a: { t: 'num', v: d3 }, hint: 'Change the percent back to "per 1,000" first (multiply by 10).',
      steps: [r1(rn / 10) + '% = ' + rn + ' per 1,000.', 'CBR − CDR = ' + rn + ', so CDR = ' + b3 + ' − ' + rn + ' = ' + d3 + '.'] };
  });

  G('humangeo.fertility-mortality', function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.pick(['imr', 'tfr']) : L === 2 ? R.pick(['imr', 'tfr', 'tf']) : R.pick(['imr', 'tf', 'which']);
    if (kind === 'imr') {
      var births = R.pick([10, 20, 25, 40, 50, 80, 100, 200]) * 1000, imr = R.int(2, 60), deaths = births / 1000 * imr;
      return { q: 'A region had ' + fmt(births) + ' live births in a year, and ' + fmt(deaths) + ' babies died before their first birthday. What is the infant mortality rate, per 1,000 live births?', a: { t: 'num', v: imr }, hint: 'Divide infant deaths by live births (not by the whole population), then multiply by 1,000.',
        steps: [fmt(deaths) + ' ÷ ' + fmt(births) + ' = ' + (imr / 1000) + '.', (imr / 1000) + ' × 1,000 = ' + imr + ' infant deaths per 1,000 live births.'] };
    }
    if (kind === 'tfr') {
      var t = R.pick([1.1, 1.3, 1.4, 1.5, 1.6, 1.8, 2.6, 3.0, 3.5, 4.2, 5.1, 6.0]), up = t > 2.1, ch = ['It will tend to grow', 'It will tend to shrink'];
      return { q: 'Ignoring migration, a country\'s total fertility rate has stayed at ' + t + ' for decades. What will its population tend to do in the long run?', a: mc(ch, up ? ch[0] : ch[1]), hint: 'Compare with replacement level, about 2.1.',
        steps: ['Replacement level is about 2.1 children per woman.', t + (up ? ' is above' : ' is below') + ' 2.1, so each generation is ' + (up ? 'larger' : 'smaller') + ' than the one before.', 'In the long run the population tends to ' + (up ? 'grow' : 'shrink') + ' (age structure can delay the change for years).'] };
    }
    if (kind === 'which') {
      var m = R.pick([['the average number of children a woman would have in her lifetime at today\'s rates', 'Total fertility rate'], ['deaths of babies under one year old per 1,000 live births', 'Infant mortality rate'], ['the average number of years a newborn would live at today\'s death rates', 'Life expectancy'], ['births per 1,000 people in a year', 'Crude birth rate']]);
      var all = ['Total fertility rate', 'Infant mortality rate', 'Life expectancy', 'Crude birth rate'];
      return { q: 'Which measure is <b>' + m[0] + '</b>?', a: mc(R.shuffle(all), m[1]), hint: 'Look at what is counted and what it is divided by.', steps: [m[1] + ' is ' + m[0] + '.'] };
    }
    return tfq(R, [['A total fertility rate of exactly 2.0 keeps a population steady in the long run.', false, 'Replacement is about 2.1, because some children die young and slightly more boys than girls are born.'], ['Replacement level is higher where many children die young.', true, 'More births are needed for two children to reach adulthood.'],
      ['The infant mortality rate divides infant deaths by the whole population.', false, 'It divides by live births, per 1,000.'], ['World life expectancy at birth was about 73 years in 2024 (UN).', true, 'The UN reports 73.3 years for 2024.'], ['More than half of all countries had fertility below 2.1 in 2024 (UN).', true, 'The UN reports that more than half of countries and areas are below replacement.']], 'Replacement is about 2.1; IMR is per 1,000 live births.');
  });

  G('humangeo.doubling-time', function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? 'rate' : L === 2 ? R.pick(['rate', 'rates']) : R.pick(['reverse', 'rates', 'mistake']);
    if (kind === 'rate') {
      var r = R.pick([0.5, 0.7, 1, 1.2, 1.4, 1.5, 1.75, 2, 2.5, 2.8, 3, 3.5, 4, 5, 7, 10]), v = Math.round(70 / r * 1000) / 1000;
      var who = R.pick(['A population', 'A town\'s population', 'A city\'s population', 'A country\'s population', 'A region\'s population']);
      return { q: who + ' grows ' + r + '% a year. Using the rule of 70, about how many years will it take to double?', a: { t: 'num', v: v, tol: 0.5 }, unit: 'years', hint: 'Divide 70 by the rate written as a percent.',
        steps: ['Doubling time ≈ 70 ÷ rate (as a percent).', '70 ÷ ' + r + ' = ' + r1(v) + '.', 'About ' + Math.round(v) + ' years.'] };
    }
    if (kind === 'rates') {
      var b = R.int(20, 45), rn = R.pick([10, 14, 20, 25, 28, 35]); if (rn > b - 4) rn = 10; var d = b - rn, rate = rn / 10, v2 = 70 / rate;
      return { q: 'A country has a crude birth rate of ' + b + ' and a crude death rate of ' + d + ' per 1,000. About how many years will it take to double, using the rule of 70? (Round to the nearest year.)', a: { t: 'num', v: Math.round(v2), tol: 0.5 }, unit: 'years', hint: 'Find the rate of natural increase as a percent first.',
        steps: [b + ' − ' + d + ' = ' + rn + ' per 1,000 = ' + rate + '%.', '70 ÷ ' + rate + ' = ' + r1(v2) + '.', 'About ' + Math.round(v2) + ' years.'] };
    }
    if (kind === 'reverse') {
      var dt = R.pick([10, 14, 20, 28, 35, 50, 70, 140]), rr = 70 / dt;
      return { q: 'A city\'s population doubled in about ' + dt + ' years. Using the rule of 70, what was its yearly growth rate, as a percent?', a: { t: 'num', v: rr, pct: true, tol: 0.05 }, hint: 'Rate ≈ 70 ÷ doubling time.',
        steps: ['Rate ≈ 70 ÷ doubling time.', '70 ÷ ' + dt + ' = ' + rr + '.', 'About ' + rr + '% a year.'] };
    }
    var r3 = R.pick([2, 2.5, 3.5, 5]), wrong = 70 / (r3 / 100), right = 70 / r3;
    var ch = [fmt(right) + ' years', fmt(wrong) + ' years', fmt(70 * r3) + ' years', fmt(100 / r3) + ' years'];
    return { q: 'A student finds the doubling time for growth of ' + r3 + '% a year by computing 70 ÷ ' + (r3 / 100) + ' = ' + fmt(wrong) + ' years. What is the correct doubling time?', a: mc(ch, ch[0]), hint: 'The rule uses the percent, not the decimal.',
      steps: ['The rule of 70 divides by the rate written as a percent: ' + r3 + ', not ' + (r3 / 100) + '.', '70 ÷ ' + r3 + ' = ' + r1(right) + ', about ' + fmt(right) + ' years.', 'Check: ' + fmt(wrong) + ' years is far too long for growth of several percent a year.'] };
  });

  var SHAPES = ['expanding', 'young', 'stable', 'contracting'];
  function pyr(key) { return ML.geog.pyramid(ML.geog.PYRAMIDS[key]); }
  G('humangeo.population-pyramids', function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.pick(['under15', 'bar']) : L === 2 ? R.pick(['under15', 'over65', 'mean']) : R.pick(['over65', 'mean', 'work']);
    var key = R.pick(SHAPES.concat(['stage1', 'stage2', 'stage3'])), p = pyr(key), AG = ML.geog.AGES;
    var viz = { name: 'gg-pyramid', opts: { shape: key, quiet: true, interactive: false } };
    function grp(i) { return r1(p.m[i] + p.f[i]); }
    if (kind === 'bar') {
      var i = R.int(0, 12);
      return { q: 'On this pyramid, the ' + AG[i] + ' bars show ' + p.m[i] + '% (male) and ' + p.f[i] + '% (female). What percent of the whole population is aged ' + AG[i] + '?', viz: viz, a: { t: 'num', v: grp(i), pct: true, tol: 0.05 }, hint: 'Each side is a share of the whole population. Add them.',
        steps: [p.m[i] + ' + ' + p.f[i] + ' = ' + grp(i) + '.', 'So ' + grp(i) + '% of the population is ' + AG[i] + ' years old.'] };
    }
    if (kind === 'under15' || kind === 'over65' || kind === 'work') {
      var idx = kind === 'under15' ? [0, 1, 2] : kind === 'over65' ? [13, 14, 15, 16, 17, 18, 19, 20] : [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], tot = 0;
      if (kind === 'over65') { idx.forEach(function (j) { tot += p.m[j] + p.f[j]; }); tot = r1(tot); var w = r1(100 - tot - r1(p.m[0] + p.f[0] + p.m[1] + p.f[1] + p.m[2] + p.f[2]));
        var u15 = r1(p.m[0] + p.f[0] + p.m[1] + p.f[1] + p.m[2] + p.f[2]), work = r1(100 - u15 - tot);
        return { q: 'In this population, ' + u15 + '% are under 15 and ' + work + '% are aged 15 to 64. What percent are 65 or older?', viz: viz, a: { t: 'num', v: r1(100 - u15 - work), pct: true, tol: 0.05 }, hint: 'The three age groups make up 100% of the population.',
          steps: ['All the bars together make 100%.', '100 − ' + u15 + ' − ' + work + ' = ' + r1(100 - u15 - work) + '.', 'So ' + r1(100 - u15 - work) + '% are 65 or older; ' + (r1(100 - u15 - work) > 12 ? 'that is a large share, typical of an aging population.' : 'a small share, typical of a young population.')] };
      }
      var parts = idx.map(function (j) { return r1(p.m[j] + p.f[j]); }); tot = r1(parts.reduce(function (a, x) { return a + x; }, 0));
      var label = kind === 'under15' ? 'under 15' : 'aged 15 to 64';
      var listed = idx.map(function (j, k) { return AG[j] + ': ' + parts[k] + '%'; }).join(', ');
      return { q: 'This pyramid\'s age groups (males and females together) are ' + listed + (kind === 'work' ? '' : ', and so on') + '. What percent of the population is ' + label + '?', viz: viz, a: { t: 'num', v: tot, pct: true, tol: 0.15 }, hint: kind === 'under15' ? 'Under 15 means the groups 0–4, 5–9 and 10–14.' : 'Add the groups from 15–19 up to 60–64.',
        steps: ['Add the groups: ' + parts.join(' + ') + ' = ' + tot + '.', 'So about ' + tot + '% of the population is ' + label + '.'] };
    }
    // mean: what a bar means
    var ch = ['The share of the population that is that age today', 'The number of babies born each year', 'The number of people who died at that age', 'The share of people who will reach that age'];
    var ag = AG[R.int(2, 14)], side = R.pick(['female', 'male']);
    return { q: 'On a population pyramid, what does the length of the ' + ag + ' bar on the ' + side + ' side show?', viz: viz, a: mc(ch, ch[0]), hint: 'Each bar is a group of people alive now.',
      steps: ['Each bar is one age group of people alive now.', 'Its length is that group\'s share (or number) of the population.', 'So the ' + ag + ' ' + side + ' bar is the share of the population that is ' + side + ' and ' + ag.replace('–', ' to ') + ' years old.'] };
  });

  var SHDESC = { expanding: 'a wide base and a narrow top: many births and fast growth', young: 'a broad base that narrows steadily: a young, growing population', stable: 'nearly straight sides: births and deaths roughly balanced, slow or no growth', contracting: 'a base narrower than the middle: few births, an aging population that may shrink' };
  G('humangeo.pyramid-shapes', function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? 'pick' : L === 2 ? R.pick(['pick', 'name', 'tf']) : R.pick(['pick', 'name', 'tf', 'bulge']);
    if (kind === 'pick') {
      var set = L === 1 ? R.shuffle(['expanding', 'stable', 'contracting']) : R.shuffle(R.sample(['expanding', 'young', 'stable', 'contracting'], 3)), want = R.pick(set.filter(function (x) { return x !== 'young' || set.indexOf('expanding') < 0; }));
      var ask = R.pick({ expanding: ['fast population growth', 'high birth rates and many children', 'the widest base'], young: ['a young, growing population with falling death rates', 'many children and steady growth'], stable: ['slow or no growth, with births and deaths roughly balanced', 'nearly straight sides'], contracting: ['an aging population that may shrink', 'fewer young children than middle-aged adults'] }[want]);
      return { q: 'Which pyramid shows <b>' + ask + '</b>?', viz: { name: 'gg-pyramid', opts: { compare: set, quiet: true, interactive: false } }, a: { t: 'mc', choices: ['A', 'B', 'C'], v: set.indexOf(want), keep: true }, hint: 'Look at the base (recent births) and the sides.',
        steps: set.map(function (s, i) { return 'Pyramid ' + LET[i] + ' has ' + SHDESC[s] + '.'; }).concat(['So the answer is ' + LET[set.indexOf(want)] + '.']) };
    }
    if (kind === 'name') {
      var k = R.pick(['expanding', 'stable', 'contracting']), names = ['Expanding', 'Stable', 'Contracting'];
      return { q: 'What kind of pyramid is this?', viz: { name: 'gg-pyramid', opts: { shape: k, quiet: true, interactive: false } }, a: mc(names, cap(k)), hint: 'Compare the base with the middle.', steps: ['This pyramid has ' + SHDESC[k] + '.', 'That is ' + (k === 'expanding' ? 'an ' : 'a ') + k + ' pyramid.'] };
    }
    if (kind === 'bulge') {
      var ch = ['A baby boom about 60 to 70 years ago', 'A recent rise in births', 'A war that killed many older people', 'Fewer people moving in'];
      return { q: 'A pyramid has an unusually wide band of bars at ages 60 to 75, with narrower bars just above and below. What is the most likely cause?', a: mc(ch, ch[0]), hint: 'A wide band means many people were born in those years.',
        steps: ['Each band records a past group of births.', 'A wide band at 60–75 means many people were born 60 to 75 years ago.', 'That fits a past baby boom moving up the pyramid.'] };
    }
    return tfq(R, [['A pyramid with a narrow base always means the population is shrinking today.', false, 'Immigration and population momentum can keep it growing for years.'], ['Straight sides suggest that births and deaths are roughly balanced.', true, 'That is a stable pyramid.'], ['A wide base shows many young children.', true, 'The bottom bars are the youngest age groups.'], ['Migration can add a bulge in the working ages.', true, 'Migrants are often young adults.']], 'The base shows recent births; the sides show deaths and migration.');
  });

  G('humangeo.dependency-ratio', function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? 'counts' : L === 2 ? R.pick(['counts', 'pct']) : R.pick(['pct', 'pyr', 'mc']);
    if (kind === 'counts') {
      var W = R.pick([40, 50, 60, 80, 100, 120, 200]) * 100, ratio = R.pick([40, 45, 50, 55, 60, 65, 70, 75, 80, 90]), dep = W * ratio / 100, old = R.int(1, 9) * dep / 10, young = dep - old;
      return { q: 'A town has ' + fmt(young) + ' children under 15, ' + fmt(old) + ' people aged 65 and over, and ' + fmt(W) + ' people aged 15 to 64. What is its dependency ratio?', a: { t: 'num', v: ratio }, hint: '(Under 15 + 65 and over) ÷ (15 to 64) × 100.',
        steps: ['Dependents: ' + fmt(young) + ' + ' + fmt(old) + ' = ' + fmt(dep) + '.', fmt(dep) + ' ÷ ' + fmt(W) + ' × 100 = ' + ratio + '.', 'There are ' + ratio + ' dependents for every 100 people of working age.'] };
    }
    if (kind === 'pct') {
      var work = R.pick([50, 55, 60, 62, 64, 65, 68, 70]), dep2 = 100 - work, old2 = R.int(2, Math.min(25, dep2 - 5)), young2 = dep2 - old2, v = dep2 / work * 100;
      return { q: 'A country is ' + young2 + '% under 15, ' + old2 + '% aged 65 and over, and ' + work + '% aged 15 to 64. What is its dependency ratio? (Round to the nearest whole number.)', a: { t: 'num', v: Math.round(v), tol: 0.5 }, hint: 'Divide the dependents by the working-age group, not by the whole population.',
        steps: ['Dependents: ' + young2 + ' + ' + old2 + ' = ' + dep2 + '.', dep2 + ' ÷ ' + work + ' × 100 ≈ ' + r1(v) + '.', 'About ' + Math.round(v) + ' dependents per 100 people of working age.'] };
    }
    if (kind === 'pyr') {
      var key = R.pick(SHAPES), d = ML.geog.dependency(pyr(key)), y = Math.round(d.young * 10) / 10, o = Math.round(d.old * 10) / 10, w = r1(100 - y - o), v3 = (y + o) / w * 100;
      return { q: 'In the population shown, ' + y + '% are under 15 and ' + o + '% are 65 or older. What is the dependency ratio? (Round to the nearest whole number.)', viz: { name: 'gg-pyramid', opts: { shape: key, quiet: true, interactive: false } }, a: { t: 'num', v: Math.round(v3), tol: 0.5 }, hint: 'First find the share aged 15 to 64: 100 minus the other two groups.',
        steps: ['Working age: 100 − ' + y + ' − ' + o + ' = ' + w + '%.', 'Dependents: ' + y + ' + ' + o + ' = ' + r1(y + o) + '%.', r1(y + o) + ' ÷ ' + w + ' × 100 ≈ ' + r1(v3) + ', so about ' + Math.round(v3) + '.'] };
    }
    var ch = ['Children under 15 and people 65 and over', 'Only people 65 and over', 'Only children under 15', 'Everyone who is not working'];
    return { q: 'In the dependency ratio, who counts as dependents?', a: mc(ch, ch[0]), hint: 'Two age groups count, at both ends of the pyramid.', steps: ['The dependency ratio counts people under 15 and people 65 and over.', 'Countries with many children have high ratios too, not only aging countries.'] };
  });

  var STAGE_RATES = { 1: [[38, 45], [30, 37]], 2: [[37, 45], [9, 16]], 3: [[20, 27], [6, 9]], 4: [[10, 14], [7, 10]], 5: [[7, 9], [10, 13]] };
  G('humangeo.demographic-transition', function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.pick(['picture', 'fact']) : L === 2 ? R.pick(['rates', 'picture', 'fact']) : R.pick(['rates', 'fastest', 'rates']);
    var NAMES = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'];
    if (kind === 'rates') {
      var st = R.int(1, 5), b, d, k = 0;
      do { b = R.int(STAGE_RATES[st][0][0], STAGE_RATES[st][0][1]); d = R.int(STAGE_RATES[st][1][0], STAGE_RATES[st][1][1]); k++; } while (ML.geog.dtmStage(b, d) !== st && k < 50);
      if (ML.geog.dtmStage(b, d) !== st) { st = ML.geog.dtmStage(b, d); }
      var desc = ML.geog.DTM_STAGES[st - 1].desc;
      return { q: 'A country has a crude birth rate of ' + b + ' and a crude death rate of ' + d + ' per 1,000. Which stage of the demographic transition fits best?', a: { t: 'mc', choices: NAMES, v: st - 1, keep: true }, hint: 'Is each rate high or low? Is the gap wide or narrow?',
        steps: ['Birth rate ' + b + ' is ' + (b >= 30 ? 'high' : b >= 18 ? 'falling (middle)' : 'low') + '; death rate ' + d + ' is ' + (d >= 25 ? 'high' : d >= 15 ? 'falling' : 'low') + '.', 'Natural increase: (' + b + ' − ' + d + ') ÷ 10 = ' + r1((b - d) / 10) + '% a year.', 'Stage ' + st + ': ' + desc] };
    }
    if (kind === 'picture') {
      var s2 = R.int(1, L === 1 ? 4 : 5);
      return { q: 'Which stage is marked with the question mark?', viz: { name: 'gg-dtm', opts: { ask: s2, quiet: true, interactive: false, population: false } }, a: { t: 'mc', choices: L === 1 ? NAMES.slice(0, 4) : NAMES, v: s2 - 1, keep: true }, hint: 'Count the stages from the left.',
        steps: ['The stages are numbered from left to right.', 'The question mark is on stage ' + s2 + ': ' + ML.geog.DTM_STAGES[s2 - 1].desc] };
    }
    if (kind === 'fastest') {
      var ch = ['Stage 2', 'Stage 1', 'Stage 4', 'Stage 5'];
      return { q: 'In which stage of the demographic transition does the population grow fastest?', viz: { name: 'gg-dtm', opts: { quiet: true, interactive: false, population: false } }, a: mc(ch, 'Stage 2'), hint: 'Growth depends on the gap between the birth and death rates.',
        steps: ['Growth = birth rate − death rate.', 'In stage 1 both are high, so the gap is small.', 'In stage 2 death rates have fallen but birth rates are still high: the widest gap, so the fastest growth.'] };
    }
    var f = R.pick([['Which falls first as a country develops?', ['The death rate', 'The birth rate'], 'The death rate', 'Better food, clean water and medicine lower death rates first; birth rates fall later as family choices change.'],
      ['In stage 4, birth and death rates are both…', ['Low', 'High', 'Rising'], 'Low', 'Stage 4 has low birth and death rates and slow or no growth.'],
      ['Which stage, added by some demographers, has birth rates below death rates?', ['Stage 5', 'Stage 1', 'Stage 3'], 'Stage 5', 'In stage 5 the population shrinks.'],
      ['In stage 3, what is happening to the birth rate?', ['It is falling', 'It is rising', 'It stays high'], 'It is falling', 'Families choose to have fewer children, so growth slows.']]);
    return { q: f[0], a: mc(R.shuffle(f[1]), f[2]), hint: 'Picture the two lines on the DTM graph.', steps: [f[3]] };
  });

  var EPI = [['Cholera', 0], ['Measles', 0], ['Tuberculosis', 0], ['Malaria', 0], ['Typhoid fever', 0], ['Smallpox (before it was wiped out)', 0], ['Heart disease', 1], ['Stroke', 1], ['Most cancers', 1], ['Diabetes', 1], ['Alzheimer\'s disease', 1], ['Polio', 0], ['Bubonic plague', 0], ['Influenza during a pandemic', 0], ['Diarrhea from dirty water', 0], ['Chronic lung disease', 1], ['Kidney failure in old age', 1], ['High blood pressure leading to heart failure', 1]];
  G('humangeo.epidemiological-transition', function (R, ctx) {
    var L = lvl(ctx);
    if (L >= 2 && R.chance(0.45)) {
      var c = R.pick([['The top causes of death are infections and famine, and many children die young.', 'Stage 1'], ['Clean water and sewers are cutting deaths from epidemics, and life expectancy is rising fast.', 'Stage 2'],
        ['Heart disease, stroke and cancer have become the leading causes of death.', 'Stage 3'], ['Heart disease and cancer lead, but treatment lets people live with them into their 80s.', 'Stage 4']]);
      var ch = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'];
      return { q: 'Which stage of the epidemiological transition fits? <br><b>' + c[0] + '</b>', a: { t: 'mc', choices: ch, v: ch.indexOf(c[1]), keep: true }, hint: 'Infections and famine come first; diseases of old age later; delayed degenerative diseases last.',
        steps: ['Stage 1: pestilence and famine. Stage 2: receding pandemics. Stage 3: degenerative diseases. Stage 4: delayed degenerative diseases.', 'This description fits ' + c[1].toLowerCase() + '.'] };
    }
    return classify(R, ctx, { items: EPI, cats: ['Infectious disease', 'Chronic or degenerative disease'], desc: ['Infectious diseases are spread by germs, often through dirty water, insects or close contact; they lead in early stages.', 'Chronic and degenerative diseases develop over many years and strike mostly older people; they lead in later stages.'],
      hint: 'Is it caused by a germ that spreads, or does it build up over a long life?', ask: function (t) { return 'What kind of cause of death is this? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which is a <b>' + c.toLowerCase() + '</b>?'; }, allq: function (c) { return 'Which are examples of a <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['Chronic diseases lead in rich countries mainly because people live long enough to get them.', true, 'Diseases of old age are common where most people reach old age.'], ['Abdel Omran described the epidemiological transition in 1971.', true, 'That is when he published the model.'], ['Clean water and sewers mainly reduce deaths from heart disease.', false, 'They cut deaths from infectious diseases spread through water, such as cholera.']] });
  });

  var MAL = [['Population tends to grow faster than the food supply', 0, 'Malthus\'s central claim (1798)'], ['Hunger and disease will hold population down if births do not fall', 0, 'Malthus\'s "checks" on population'], ['Population grows geometrically while food grows arithmetically', 0, 'Malthus\'s assumption'],
    ['Growing populations push farmers to invent more intensive farming', 1, 'Ester Boserup\'s argument (1965)'], ['Food output has grown faster than population since 1950', 1, 'critics point to rising yields'], ['Birth rates fall as countries develop, so growth slows', 1, 'critics point to the demographic transition'],
    ['Groundwater, soil and energy may run short even if food keeps up for now', 2, 'a neo-Malthusian worry about environmental limits'], ['Today\'s high yields depend on resources that could be used up', 2, 'a neo-Malthusian argument'], ['Population growth puts pressure on land, water and the environment', 2, 'the neo-Malthusian view']];
  G('humangeo.malthus', function (R, ctx) {
    var L = lvl(ctx);
    if (L >= 2 && R.chance(0.35)) {
      var n = R.int(3, 6), start = R.pick([1, 2, 10]), pop = start * Math.pow(2, n), food = start * (1 + n);
      var ask = R.coin();
      return { q: 'Using Malthus\'s assumptions, a population starts at ' + start + ' unit' + (start > 1 ? 's' : '') + ' and doubles each period, while food starts at ' + start + ' and grows by ' + start + ' each period. After ' + n + ' periods, how many units ' + (ask ? 'of population are there' : 'of food are there') + '?', a: { t: 'num', v: ask ? pop : food }, hint: ask ? 'Doubling: multiply by 2 each period.' : 'Adding: add ' + start + ' each period.',
        steps: ['Population: ' + start + ' × 2^' + n + ' = ' + pop + '.', 'Food: ' + start + ' + ' + n + ' × ' + start + ' = ' + food + '.', 'Under these assumptions, population (' + pop + ') outruns food (' + food + '). Critics point out that real food output has grown much faster than this simple model.'] };
    }
    return classify(R, ctx, { items: MAL, cats: ['Malthus', 'His critics', 'Neo-Malthusians'], desc: ['Malthus (1798) argued that population tends to outgrow food.', 'Critics, such as Ester Boserup, point to rising food output and falling birth rates.', 'Neo-Malthusians warn about environmental limits: water, soil, land and energy.'],
      hint: 'Who would make this argument?', ask: function (t) { return 'Which position would make this argument? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which argument fits <b>' + c + '</b>?'; }, allq: function (c) { return 'Which arguments fit <b>' + c + '</b>? Choose all that apply.'; },
      tf: [['Malthus published An Essay on the Principle of Population in 1798.', true, 'The first edition appeared in 1798.'], ['Ester Boserup argued that population growth can push farmers to grow more food.', true, 'That was her argument (1965).'], ['Scholars all agree today about whether Malthus will be proven right.', false, 'They still debate whether environmental limits will matter; know each side\'s argument.'], ['Paul Ehrlich\'s The Population Bomb (1968) is a neo-Malthusian book.', true, 'It warned that population growth would outrun resources.']] });
  });

  var POL = [['Free contraception at public clinics', 0], ['A campaign urging families to stop at two children', 0], ['A legal limit on the number of children per couple', 0], ['Raising the minimum age for marriage to delay births', 0],
    ['A cash payment for each new baby', 1], ['Tax breaks for families with three or more children', 1], ['Paid parental leave and public child care', 1], ['Housing priority for large families', 1],
    ['A visa for workers with skills in short supply', 2], ['A yearly limit on new permanent residents', 2], ['A points system that scores applicants on skills and language', 2], ['A program that lets families sponsor relatives from abroad', 2]];
  G('humangeo.population-policies', function (R, ctx) {
    var L = lvl(ctx);
    if (L >= 2 && R.chance(0.4)) {
      var f = R.pick([['China\'s one-child policy (1980–2015)', 'Antinatalist'], ['Singapore\'s "Stop at Two" campaign (from 1972)', 'Antinatalist'], ['Singapore\'s "Have three or more, if you can afford it" (from 1987)', 'Pronatalist'], ['France\'s family allowances and public child care', 'Pronatalist'], ['Canada\'s points system for immigrants (from 1967)', 'Immigration']]);
      var ch = ['Antinatalist', 'Pronatalist', 'Immigration'];
      return { q: 'What kind of policy was this? <br><b>' + f[0] + '</b>', a: mc(ch, f[1]), hint: 'Did it aim to lower births, raise births, or decide who moves in?', steps: [f[0] + ' is ' + (f[1] === 'Immigration' ? 'an immigration policy: it decides who may move in.' : 'a' + (f[1] === 'Antinatalist' ? 'n antinatalist policy: it aimed to lower births.' : ' pronatalist policy: it aimed to raise births.'))] };
    }
    return classify(R, ctx, { items: POL, cats: ['Antinatalist', 'Pronatalist', 'Immigration'], desc: ['Antinatalist policies try to lower birth rates.', 'Pronatalist policies try to raise birth rates.', 'Immigration policies decide how many people may move in, and who.'],
      hint: 'Does it aim to lower births, raise births, or decide who may move in?', ask: function (t) { return 'What kind of population policy is this? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which is an example of an <b>' + c.toLowerCase() + '</b> policy?'.replace('an pronatalist', 'a pronatalist'); }, allq: function (c) { return 'Which are <b>' + c.toLowerCase() + '</b> policies? Choose all that apply.'; },
      tf: [['China replaced its one-child limit with a two-child limit in 2016.', true, 'The one-child policy ran from 1980 to 2015.'], ['Singapore reversed its population policy in 1987, from discouraging births to encouraging them.', true, 'It moved from "Stop at Two" to "Have three or more, if you can afford it."'], ['Pronatalist payments always raise birth rates a lot.', false, 'Results are mixed; education, jobs and the cost of raising children often matter more.']] });
  });

  var WF = [['More girls finishing secondary school', 0], ['More women working for pay', 0], ['Moving from villages to cities', 0], ['Easy access to health care and family planning', 0], ['Fewer babies dying in their first year', 0, 'families need fewer births to reach the size they want'], ['Later age at marriage', 0], ['Rising costs of housing and schooling for children', 0], ['More women going to college', 0], ['Pensions that support people in old age', 0, 'parents rely less on children to care for them'],
    ['Children needed to work on the family farm', 1], ['Many infants dying before age one', 1, 'families may have more births to make up for children who die'], ['Marriage at a very young age', 1], ['Little access to schooling for girls', 1], ['Parents counting on many children to care for them in old age', 1], ['Living far from any clinic', 1], ['Most families farming small plots by hand', 1]];
  G('humangeo.women-fertility', function (R, ctx) {
    return classify(R, ctx, { items: WF, cats: ['Tends to lower fertility', 'Tends to raise fertility'], desc: ['Schooling, paid work, cities, health care and later marriage tend to go with fewer, later births.', 'Farm work by children, high infant deaths, early marriage and little schooling tend to go with more births.'],
      hint: 'Does it make children cost more or survive more, or delay births?', ask: function (t) { return 'Which way does this factor tend to push fertility? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which factor <b>' + c.toLowerCase() + '</b>?'; }, allq: function (c) { return 'Which factors <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['A strong link between schooling and fertility proves that schooling is the only cause.', false, 'Schooling, health care, cities and jobs change together; researchers try to separate their effects.'], ['Where more girls finish school, families tend to have fewer children.', true, 'This is one of the strongest patterns in population geography.'], ['Staying in school tends to delay marriage and first births.', true, 'That is one way schooling lowers fertility.']] });
  });

  var MT = [['Moving from a farm to a city in the same country', 0, 'Internal'], ['Moving from Mexico to Canada for work', 1, 'International'], ['Moving from Ohio to Texas', 0, 'Internal'], ['Moving from Poland to Ireland', 1, 'International'], ['Moving from a village to the capital', 0, 'Internal'], ['Retiring from Britain to Spain', 1, 'International']];
  var MV = [['Moving to another state for a better job', 0], ['Retiring to a warmer region', 0], ['Joining a cousin who opened a shop abroad', 0], ['Moving to a city to attend college', 0],
    ['Fleeing a war across the border', 1], ['Leaving a town destroyed by a flood', 1, 'a disaster can force people out'], ['Being carried across the ocean in the Atlantic slave trade', 1, 'people were taken against their will'], ['Escaping persecution for one\'s religion', 1]];
  G('humangeo.migration-types', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(['iv', 'vf', 'cs']);
    if (kind === 'iv' && L < 3) { var it = R.pick(MT); return { q: 'Is this internal or international migration? <br><b>' + it[0] + '</b>', a: mc(['Internal', 'International'], it[2]), hint: 'Does the move cross a national border?', steps: [it[2] === 'Internal' ? 'The move stays inside one country.' : 'The move crosses a border between countries.', 'So it is ' + it[2].toLowerCase() + ' migration.'] }; }
    if (kind === 'cs') {
      var c = R.pick([['A man moves to the city where his brother already works, and later his sister follows him', 'Chain migration'], ['A family moves from a farm to a small town, then a few years later to the capital', 'Step migration'], ['Herders move their animals to mountain pastures each summer and back each winter', 'Transhumance'], ['Workers are allowed into a country to work for a limited time', 'Guest workers'],
        ['Neighbors from one village settle on the same street in a foreign city, one family after another', 'Chain migration'], ['A young woman moves from her village to a market town, then to a big city', 'Step migration']]);
      var ch = ['Chain migration', 'Step migration', 'Transhumance', 'Guest workers'];
      return { q: 'Which term fits? <br><b>' + c[0] + '</b>', a: mc(L === 1 ? R.shuffle([c[1], R.pick(ch.filter(function (x) { return x !== c[1]; }))]) : ch, c[1]), hint: 'Following family? Moving in stages? Seasonal herding? Temporary work?',
        steps: [{ 'Chain migration': 'Chain migration follows family and friends who moved earlier.', 'Step migration': 'Step migration happens in stages, often to bigger places each time.', 'Transhumance': 'Transhumance is the seasonal movement of herders and their animals.', 'Guest workers': 'Guest workers are allowed in to work for a limited time.' }[c[1]], 'So the answer is ' + c[1].toLowerCase() + '.'] };
    }
    return classify(R, ctx, { items: MV, cats: ['Voluntary', 'Forced'], desc: ['Voluntary migrants choose to move.', 'Forced migrants are made to move or must flee to stay safe.'], hint: 'Was staying a safe choice?',
      ask: function (t) { return 'Is this voluntary or forced migration? <br><b>' + t + '</b>'; }, rev: function (c) { return 'Which is an example of <b>' + c.toLowerCase() + '</b> migration?'; }, allq: function (c) { return 'Which are examples of <b>' + c.toLowerCase() + '</b> migration? Choose all that apply.'; },
      tf: [['Refugees fleeing war are voluntary migrants because they decided to leave.', false, 'Staying was not safe, so they are forced migrants.'], ['Internal migration is more common than international migration.', true, 'Far more people move within their own country.'], ['Moving from a farm to a city in the same country is migration.', true, 'Internal migration counts, even with no border crossed.']] });
  });

  var PP = [['Civil war in the home country', 0], ['A factory closing in the hometown', 0], ['Years of drought on the family farm', 0], ['Persecution for one\'s beliefs at home', 0], ['No jobs in the home region', 0, 'it is about the place being left'],
    ['A university abroad offers a scholarship', 1], ['Relatives already living in the new city', 1], ['Higher wages in the destination', 1], ['A safe country that accepts newcomers', 1], ['Jobs in another country', 1, 'it is about the place being chosen'],
    ['A visa that takes years to get', 2], ['A wide desert to cross', 2], ['The high cost of the journey', 2], ['Not speaking the destination\'s language', 2]];
  G('humangeo.push-pull', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 3 && R.chance(0.3)) {
      var ch = ['An intervening opportunity', 'A push factor', 'A pull factor at home', 'Chain migration'];
      return { q: 'A family sets out from a farm toward a distant capital for work, but finds good jobs in a nearer city on the way and settles there. What did the nearer city provide?', a: mc(ch, ch[0]), hint: 'A closer place offered the same pull.', steps: ['The nearer city offered the same pull (jobs) closer to home.', 'A closer place with the same pull is an intervening opportunity.'] };
    }
    return classify(R, ctx, { items: PP, cats: ['Push factor', 'Pull factor', 'Intervening obstacle'], desc: ['Push factors are reasons to leave the place of origin.', 'Pull factors are reasons to go to a destination.', 'Intervening obstacles stand between origin and destination.'],
      hint: 'Is it about the place being left, the place being chosen, or something in between?', ask: function (t) { return 'For someone thinking about moving, what is this? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which is a <b>' + c.toLowerCase() + '</b>?'; }, allq: function (c) { return 'Which are <b>' + c.toLowerCase() + 's</b>? Choose all that apply.'; },
      tf: [['"No jobs at home" is a pull factor.', false, 'It is about the place being left, so it is a push factor.'], ['Distance and the cost of travel can be intervening obstacles.', true, 'They stand between origin and destination.'], ['Everett Lee described migration as push and pull factors with intervening obstacles.', true, 'He did so in 1966.']] });
  });

  var RAV = [['Most people who move stay within their own region', 'Most migrants move only a short distance'], ['People moving across the country mostly head for the largest cities', 'Long-distance migrants usually go to big cities'],
    ['For every 10 people who move from a rural state to a coastal city, about 3 move the other way', 'Each flow produces a counterflow'], ['A family moves from a farm to a town, then later to a city', 'Migration often happens in steps'], ['Most migrants say they moved for work or wages', 'Most migration is for economic reasons']];
  var RAVL = ['Most migrants move only a short distance', 'Long-distance migrants usually go to big cities', 'Each flow produces a counterflow', 'Migration often happens in steps', 'Most migration is for economic reasons'];
  G('humangeo.ravenstein', function (R, ctx) {
    var L = lvl(ctx);
    if (L >= 2 && R.chance(0.4)) {
      var out = R.int(20, 90) * 100, back = R.int(2, Math.floor(out / 100) - 5) * 100, ask = R.coin();
      return { q: 'Last year ' + fmt(out) + ' people moved from region A to region B, and ' + fmt(back) + ' moved from B to A. ' + (ask ? 'What was B\'s net migration from A (the gain)?' : 'What was region A\'s net migration with B? (Use a negative number for a loss.)'), a: { t: 'num', v: ask ? out - back : back - out }, hint: 'Net migration = people arriving − people leaving.',
        steps: [ask ? 'B gained ' + fmt(out) + ' and lost ' + fmt(back) + ': ' + fmt(out) + ' − ' + fmt(back) + ' = ' + fmt(out - back) + '.' : 'A gained ' + fmt(back) + ' and lost ' + fmt(out) + ': ' + fmt(back) + ' − ' + fmt(out) + ' = −' + fmt(out - back) + '.', 'The smaller flow from B to A is the counterflow Ravenstein described.'] };
    }
    if (L === 3 && R.chance(0.3)) return tfq(R, [['Ravenstein found that most migrants travel long distances.', false, 'He found that most move only short distances.'], ['Ravenstein based his laws on British census records from the 1800s.', true, 'He published "The Laws of Migration" in 1885 and 1889.'], ['Every migration flow produces a counterflow.', true, 'Some people return, and connections draw a few the other way.']], 'Think about distance decay.');
    var it = R.pick(RAV), wr = R.sample(RAVL.filter(function (x) { return x !== it[1]; }), L === 1 ? 1 : 3);
    return { q: 'Which of Ravenstein\'s patterns does this show? <br><b>' + it[0] + '</b>', a: mc(R.shuffle([it[1]].concat(wr)), it[1]), hint: 'Look for distance, big cities, a return flow, stages, or reasons.', steps: ['This example shows: ' + it[1].toLowerCase() + '.'] };
  });

  var RF = [['Fled persecution to a neighboring country and was granted protection', 0], ['Is recognized by the UN refugee agency and lives in a camp abroad', 0], ['Crossed a border to escape a war and was granted protection there', 0],
    ['Applied for protection at a border; the case is still being heard', 1], ['Arrived at an airport and asked for asylum, and is waiting for a decision', 1],
    ['Fled fighting to a safer city in the same country', 2], ['Left a flooded region for relatives in another province', 2, 'still inside the country'], ['Fled violence in one state to a camp in another state of the same country', 2],
    ['Moved abroad because wages are higher there', 3, 'no persecution; the move is for work'], ['Moved to a neighboring country to study', 3]];
  G('humangeo.refugees', function (R, ctx) {
    return classify(R, ctx, { items: RF, cats: ['Refugee', 'Asylum seeker', 'Internally displaced person', 'Voluntary migrant'], desc: ['A refugee has fled their country and cannot safely return because of persecution or conflict, and has been recognized as such.', 'An asylum seeker has asked another country for protection, but the claim has not been decided.', 'An internally displaced person was forced from home but is still inside their own country.', 'A voluntary migrant chose to move, for example for work or study, and could return safely.'],
      hint: 'Did the person cross a border? Has the claim been decided?', ask: function (t) { return 'Which term fits this person best? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which person is best described as <b>' + (c === 'Asylum seeker' ? 'an asylum seeker' : c === 'Internally displaced person' ? 'an internally displaced person' : c === 'Refugee' ? 'a refugee' : 'a voluntary migrant') + '</b>?'; },
      allq: function (c) { return 'Which people are best described with the term <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['Someone who fled a war but stayed inside their own country is a refugee.', false, 'They are internally displaced; refugees have crossed an international border.'], ['The 1951 Refugee Convention defines who is a refugee.', true, 'It is the main international definition.'], ['Non-refoulement means a refugee should not be sent back to a place where they face serious danger.', true, 'That is the principle of non-refoulement.']] });
  });

  var ME = [['Money a nurse working abroad sends to her parents each month', 'Remittances', 'Sending place'], ['A village\'s new school paid for by workers abroad', 'Remittances', 'Sending place'],
    ['A poor country loses many of the doctors it trained', 'Brain drain', 'Sending place'], ['Engineers leave their home country for higher pay abroad', 'Brain drain', 'Sending place'],
    ['A country gains skilled engineers trained elsewhere', 'Brain gain', 'Receiving place'], ['Hospitals fill nursing jobs with nurses trained abroad', 'Brain gain', 'Receiving place']];
  G('humangeo.migration-effects', function (R, ctx) {
    var L = lvl(ctx), it = R.pick(ME);
    if (L === 1 || (L === 2 && R.coin())) {
      var ch = ['Remittances', 'Brain drain', 'Brain gain'];
      return { q: 'Which effect of migration is this? <br><b>' + it[0] + '</b>', a: mc(L === 1 ? R.shuffle([it[1], R.pick(ch.filter(function (x) { return x !== it[1]; }))]) : ch, it[1]), hint: 'Money sent home, skilled people lost, or skilled people gained?',
        steps: [{ Remittances: 'Remittances are money migrants send home.', 'Brain drain': 'Brain drain is the loss of educated, skilled people from a sending place.', 'Brain gain': 'Brain gain is the arrival of educated, skilled people in a receiving place.' }[it[1]], 'So this is ' + it[1].toLowerCase() + '.'] };
    }
    if (L === 2) return { q: 'Where is this effect felt most directly: the sending place or the receiving place? <br><b>' + it[0] + '</b>', a: mc(['Sending place', 'Receiving place'], it[2]), hint: 'Remittances and brain drain are felt where migrants come from.', steps: [it[1] + ' is felt most directly in the ' + it[2].toLowerCase() + '.'] };
    var q = R.pick([['A rural region\'s pyramid has unusually short bars for ages 20 to 39. What is the most likely cause?', ['Young adults moving away for work', 'A recent baby boom', 'Many older people moving in', 'A rise in infant mortality'], 'Young adults are the most likely to migrate.'],
      ['Which statement about the effects of migration is best supported?', ['Both sending and receiving places can see gains and costs', 'Only receiving places gain', 'Only sending places gain', 'Migration has no effect on age structure'], 'Researchers find gains and costs at both ends and debate how large some are.']]);
    return { q: q[0], a: mc(q[1], q[1][0]), hint: 'Think about who moves and the effects at both ends.', steps: [q[2]] };
  });

  /* =============================================================== UNIT 3: CULTURAL PATTERNS */
  var FP = [['A recipe handed down in one village', 0], ['Hand-built barns in a style found in one valley', 0], ['A local harvest festival with its own dances', 0], ['Quilt patterns passed down in one county', 0], ['Old Order Amish travel by horse and buggy', 0], ['A fishing village\'s own boat-building style', 0],
    ['A worldwide fast-food chain', 1], ['A song that tops music charts in 40 countries', 1], ['A sneaker brand sold in malls everywhere', 1], ['A dance that spreads worldwide through online videos', 1], ['A blockbuster movie released in 60 countries at once', 1], ['A professional sports league watched on TV around the world', 1], ['A video streaming series watched in dozens of countries', 1], ['A clothing chain with the same styles in every store worldwide', 1], ['A smartphone app used by people on every continent', 1],
    ['A style of wood carving taught by elders in one mountain region', 0], ['Folk songs sung at weddings in one group of villages', 0], ['A traditional cheese made only in one valley', 0]];
  G('humangeo.culture-traits', function (R, ctx) {
    return classify(R, ctx, { items: FP, cats: ['Folk culture', 'Popular culture'], desc: ['Folk culture is traditional, practiced by a small group and passed on by family and neighbors; it changes slowly.', 'Popular culture spreads widely and quickly through mass media and trade, and changes fast.'],
      hint: 'How does it spread, and over how large an area?', ask: function (t) { return 'Is this folk culture or popular culture? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which is an example of <b>' + c.toLowerCase() + '</b>?'; }, allq: function (c) { return 'Which are examples of <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['The difference between folk and popular culture is mainly how old a trait is.', false, 'The difference is how it spreads: local tradition or mass media and trade.'], ['Popular culture tends to make places look more alike.', true, 'The same chains and products appear in many places.'], ['A culture trait is one part of a culture, such as a food or a holiday.', true, 'That is the definition.']] });
  });

  var CL = [['Rice terraces cut into a hillside', 0], ['A bilingual street sign', 0], ['A cemetery with its headstones', 0], ['A row of wooden houses with steep roofs', 0], ['Fields laid out in a square grid', 0], ['A mosque\'s minaret above the rooftops', 0],
    ['A glacier high in the mountains', 1], ['A river canyon with no roads or buildings', 1], ['A volcano\'s cone', 1], ['A sand dune in an empty desert', 1]];
  G('humangeo.cultural-landscape', function (R, ctx) {
    var L = lvl(ctx);
    if (L >= 2 && R.chance(0.45)) {
      var it = R.pick([['A street lined with signs in two languages', 'Language in the landscape'], ['Place names such as San Antonio and Santa Fe', 'Language in the landscape'], ['A church, a temple and a mosque on one avenue', 'Sacred space'], ['A hilltop shrine visited by pilgrims', 'Sacred space'],
        ['Houses with flat roofs and thick adobe walls', 'Architecture'], ['Steep roofs that shed heavy snow', 'Architecture'], ['Long, narrow farm fields running back from a river', 'Land use'], ['A city laid out in a square street grid', 'Land use']]);
      var ch = ['Language in the landscape', 'Sacred space', 'Architecture', 'Land use'];
      return { q: 'Which part of the cultural landscape is this? <br><b>' + it[0] + '</b>', a: mc(L === 2 ? ch : R.shuffle(ch), it[1]), hint: 'Words and names? Places of worship? Buildings? Fields and streets?', steps: [it[0] + ' is an example of ' + it[1].toLowerCase() + '.', 'Everyday features like this are part of the cultural landscape.'] };
    }
    return classify(R, ctx, { items: CL, cats: ['Part of the cultural landscape', 'Mostly natural landscape'], desc: ['The cultural landscape is the visible mark people leave on the land.', 'A natural landscape shows features made by nature, with little human mark.'],
      hint: 'Did people make or shape it?', ask: function (t) { return 'Is this part of the cultural landscape? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which feature is <b>' + c.toLowerCase() + '</b>?'; }, allq: function (c) { return 'Which features are <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['Only famous buildings count as part of the cultural landscape.', false, 'Ordinary things like fences, signs and field shapes count too.'], ['Carl Sauer made the cultural landscape a central idea of geography in 1925.', true, 'In "The Morphology of Landscape."'], ['Sequent occupance means layers left by groups who lived in a place one after another.', true, 'That is the definition.']] });
  });

  var DF = [['Immigrants open restaurants serving their home food in a new country', 0], ['English spreads to Australia with British settlers', 0], ['A family carries its holiday traditions to a new continent', 0],
    ['A cold spreads through a family and then the neighbors', 1], ['A rumor moves from one friend group to the next, classroom by classroom', 1], ['A farming method spreads from each farm to the next farm over', 1],
    ['A fashion appears in the world\'s fashion capitals before small towns', 2], ['A new phone is sold first in the largest cities, then in small towns', 2], ['A music style moves from big city to big city before reaching rural areas', 2],
    ['A fast-food chain in India sells vegetarian burgers instead of beef', 3, 'the idea spread, but it changed to fit local diets'], ['A video game is remade with local characters for a new market', 3], ['A holiday is adopted but celebrated with local foods and customs', 3]];
  var DFN = ['Relocation diffusion', 'Contagious diffusion', 'Hierarchical diffusion', 'Stimulus diffusion'];
  G('humangeo.diffusion', function (R, ctx) {
    var L = lvl(ctx);
    if (L >= 2 && R.chance(0.35)) {
      var ty = R.pick(['contagious', 'hierarchical', 'relocation']), name = cap(ty) + ' diffusion';
      return { q: 'The three frames show a new idea spreading over time (bigger dots are bigger cities). Which kind of diffusion is it?', viz: { name: 'gg-diffusion', opts: { type: ty, quiet: true, interactive: false, seed: R.int(1, 30) } }, a: mc(['Contagious diffusion', 'Hierarchical diffusion', 'Relocation diffusion'], name), hint: 'Does it ripple outward, jump between big cities, or move with people to a new area?',
        steps: [{ contagious: 'The idea ripples outward to the nearest places first.', hierarchical: 'The biggest cities adopt it first, then smaller places.', relocation: 'People carry it to a new area far away; some of the first group leave the hearth.' }[ty], 'That is ' + name.toLowerCase() + '.'] };
    }
    return classify(R, ctx, { items: DF, cats: DFN, desc: ['Relocation diffusion: people carry the trait when they move.', 'Contagious diffusion: the trait spreads person to person, to the nearest places first.', 'Hierarchical diffusion: the trait spreads from big or powerful places to smaller ones.', 'Stimulus diffusion: the idea spreads, but people change it to fit their own culture.'],
      hint: 'Did people carry it? Did it ripple to neighbors? Jump between big places? Change as it spread?', ask: function (t) { return 'Which kind of diffusion is this? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which is an example of <b>' + c.toLowerCase() + '</b>?'; }, allq: function (c) { return 'Which are examples of <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['Every kind of spread is contagious diffusion.', false, 'Check the path: hierarchical skips to big places, relocation moves with people, stimulus changes the trait.'], ['A hearth is the place where a culture trait began.', true, 'Traits diffuse outward from their hearths.'], ['In expansion diffusion the trait stays strong at its hearth while it spreads.', true, 'In relocation diffusion it may not.']] });
  });

  var LANGF = [['English', 'Indo-European'], ['Spanish', 'Indo-European'], ['Hindi', 'Indo-European'], ['Russian', 'Indo-European'], ['Persian (Farsi)', 'Indo-European'], ['Bengali', 'Indo-European'],
    ['Mandarin Chinese', 'Sino-Tibetan'], ['Tibetan', 'Sino-Tibetan'], ['Burmese', 'Sino-Tibetan'], ['Arabic', 'Afro-Asiatic'], ['Hebrew', 'Afro-Asiatic'], ['Amharic', 'Afro-Asiatic'], ['Hausa', 'Afro-Asiatic'],
    ['Swahili', 'Niger-Congo'], ['Yoruba', 'Niger-Congo'], ['Zulu', 'Niger-Congo'], ['Igbo', 'Niger-Congo'], ['Malay', 'Austronesian'], ['Tagalog (Filipino)', 'Austronesian'], ['Malagasy', 'Austronesian'], ['Hawaiian', 'Austronesian'],
    ['Tamil', 'Dravidian'], ['Telugu', 'Dravidian'], ['Finnish', 'Uralic'], ['Hungarian', 'Uralic'], ['Estonian', 'Uralic'], ['Turkish', 'Turkic'], ['Uzbek', 'Turkic'], ['Vietnamese', 'Austroasiatic'], ['Khmer', 'Austroasiatic']];
  var FAMS = ['Indo-European', 'Sino-Tibetan', 'Afro-Asiatic', 'Niger-Congo', 'Austronesian', 'Dravidian', 'Uralic', 'Turkic', 'Austroasiatic'];
  var CONFUSE = { 'Finnish': ['Indo-European'], 'Hungarian': ['Indo-European'], 'Estonian': ['Indo-European'], 'Tamil': ['Indo-European'], 'Telugu': ['Indo-European'], 'Malagasy': ['Niger-Congo'], 'Hausa': ['Niger-Congo'], 'Persian (Farsi)': ['Afro-Asiatic', 'Turkic'], 'Turkish': ['Indo-European', 'Afro-Asiatic'], 'Vietnamese': ['Sino-Tibetan'], 'Hebrew': ['Indo-European'], 'Swahili': ['Afro-Asiatic'] };
  G('humangeo.language-families', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 3 && R.coin()) {
      var fam = R.pick(['Indo-European', 'Afro-Asiatic', 'Niger-Congo', 'Austronesian', 'Uralic']), ins = R.sample(LANGF.filter(function (x) { return x[1] === fam; }), 3), out = R.pick(LANGF.filter(function (x) { return x[1] !== fam && (fam !== 'Indo-European' || CONFUSE[x[0]]); }));
      var list = R.shuffle(ins.concat([out]));
      return { q: 'Which language is <b>not</b> in the ' + fam + ' family?', a: mc(list.map(function (x) { return x[0]; }), out[0]), hint: 'Neighbors are not always relatives.', steps: [ins.map(function (x) { return x[0]; }).join(', ') + ' are ' + fam + '.', out[0] + ' is ' + out[1] + '.'] };
    }
    if (L >= 2 && R.chance(0.25)) {
      var ids = R.shuffle([R.pick(['FIN', 'HUN'])].concat(R.sample(['POL', 'SWE', 'NOR', 'DEU', 'AUT', 'CZE'], 2)));
      var mark = {}; ids.forEach(function (id, i) { mark[id] = LET[i]; }); var ur = ids.filter(function (id) { return id === 'FIN' || id === 'HUN'; })[0];
      return { q: 'In which lettered country is the main language <b>not</b> Indo-European?', viz: { name: 'gg-map', opts: { region: ['FIN', 'HUN', 'POL', 'SWE', 'NOR', 'DEU', 'AUT', 'CZE'], mark: mark, quiet: true, interactive: false } }, a: { t: 'mc', choices: ids.map(function (x, i) { return LET[i]; }), v: ids.indexOf(ur), keep: true },
        hint: 'Two countries in this region speak Uralic languages.', steps: ['The lettered countries are ' + ids.map(function (id, i) { return LET[i] + ': ' + ML.geog.country(id).n; }).join(', ') + '.', ML.geog.country(ur).n + ' (' + mark[ur] + ') speaks ' + (ur === 'FIN' ? 'Finnish' : 'Hungarian') + ', a Uralic language.', 'The main languages of the other two are Indo-European (Germanic or Balto-Slavic).'] };
    }
    var it = R.pick(LANGF), conf = (CONFUSE[it[0]] || []).filter(function (x) { return x !== it[1]; });
    var wr = conf.concat(R.sample(FAMS.filter(function (x) { return x !== it[1] && conf.indexOf(x) < 0; }), 3)).slice(0, L === 1 ? 1 : 3);
    return { q: 'Which language family does <b>' + it[0] + '</b> belong to?', a: mc(R.shuffle([it[1]].concat(wr)), it[1]), hint: L === 1 ? 'Think of the region where it is spoken, then check the family.' : 'Family is about ancestry, not about neighbors.',
      steps: [it[0] + ' belongs to the ' + it[1] + ' family.'].concat(CONFUSE[it[0]] ? ['It is a common trap: ' + it[0] + ' is spoken near ' + CONFUSE[it[0]].join(' and ') + ' languages but is not related to them.'] : []) };
  });

  var BR = [['English', 'Germanic'], ['German', 'Germanic'], ['Dutch', 'Germanic'], ['Swedish', 'Germanic'], ['Norwegian', 'Germanic'], ['Danish', 'Germanic'],
    ['Spanish', 'Romance'], ['Portuguese', 'Romance'], ['French', 'Romance'], ['Italian', 'Romance'], ['Romanian', 'Romance'], ['Russian', 'Balto-Slavic'], ['Polish', 'Balto-Slavic'], ['Ukrainian', 'Balto-Slavic'], ['Czech', 'Balto-Slavic'], ['Lithuanian', 'Balto-Slavic'],
    ['Hindi', 'Indo-Iranian'], ['Bengali', 'Indo-Iranian'], ['Punjabi', 'Indo-Iranian'], ['Persian (Farsi)', 'Indo-Iranian'], ['Urdu', 'Indo-Iranian'], ['Irish', 'Celtic'], ['Welsh', 'Celtic'], ['Greek', 'Hellenic']];
  var BRN = ['Germanic', 'Romance', 'Balto-Slavic', 'Indo-Iranian', 'Celtic', 'Hellenic'];
  G('humangeo.language-branches', function (R, ctx) {
    var L = lvl(ctx);
    if (L >= 2 && R.chance(0.3)) {
      var b = R.pick(['Germanic', 'Romance (from Latin)', 'Balto-Slavic', 'Indo-Iranian']), short = b.split(' ')[0];
      return { q: 'Which branch of Indo-European is marked with the question mark?', viz: { name: 'humangeo-tree', opts: { tree: 'ie', ask: b, quiet: true, interactive: false } }, a: mc(['Germanic', 'Romance', 'Balto-Slavic', 'Indo-Iranian'], short), hint: 'Read the languages in that card.',
        steps: ['The card lists ' + { Germanic: 'English, German, Dutch, Swedish and others', Romance: 'Spanish, Portuguese, French, Italian and Romanian', 'Balto-Slavic': 'Russian, Polish, Ukrainian, Czech and others', 'Indo-Iranian': 'Hindi, Urdu, Bengali, Persian and others' }[short] + '.', 'Those are ' + short + ' languages.'] };
    }
    if (L === 3 && R.chance(0.3)) {
      var ch = ['Germanic: its basic words and grammar come from Germanic', 'Romance: most of its words come from French and Latin', 'Celtic: it began in Britain', 'Balto-Slavic: it is spoken in Europe'];
      return { q: 'To which branch does English belong, and why?', a: mc(ch, ch[0]), hint: 'Borrowed words do not change a language\'s family tree.', steps: ['English borrowed many words from French and Latin, especially after 1066.', 'But its basic words (I, you, mother, water) and grammar are Germanic.', 'So English is Germanic.'] };
    }
    var it = R.pick(BR), wr = (it[0] === 'English' ? ['Romance'] : []).concat(R.sample(BRN.filter(function (x) { return x !== it[1] && !(it[0] === 'English' && x === 'Romance'); }), 3)).slice(0, L === 1 ? 1 : 3);
    return { q: 'Which branch of Indo-European does <b>' + it[0] + '</b> belong to?', a: mc(R.shuffle([it[1]].concat(wr)), it[1]), hint: 'Romance languages come from Latin; Germanic from northern Europe; Balto-Slavic from eastern Europe; Indo-Iranian from South and Southwest Asia.',
      steps: [it[0] + ' is a ' + it[1] + ' language.'].concat(it[0] === 'English' ? ['English has many French and Latin words, but its basic words and grammar are Germanic.'] : it[0] === 'Romanian' ? ['Romanian comes from the Latin of the Roman Empire, even though its neighbors speak Slavic languages and Hungarian.'] : []) };
  });

  var LF = [['English used at an international science meeting', 0], ['Swahili used between speakers of different East African languages', 0], ['Latin used by scholars across medieval Europe', 0], ['A shared language two traders use when neither speaks the other\'s first language', 0],
    ['A simple trade language with no native speakers', 1], ['A contact language made of a few hundred words, used only at a port', 1], ['A simplified mix that workers from many places use on a plantation', 1],
    ['Haitian Creole, spoken at home by millions', 2], ['A contact language that children now learn as their first language', 2], ['Tok Pisin, now a first language for many in Papua New Guinea', 2]];
  G('humangeo.lingua-franca', function (R, ctx) {
    return classify(R, ctx, { items: LF, cats: ['Lingua franca', 'Pidgin', 'Creole'], desc: ['A lingua franca is a language used between people with different first languages.', 'A pidgin is a simplified contact language with no native speakers.', 'A creole is a pidgin that became a community\'s first language, with a full grammar.'],
      hint: 'Does it have native speakers? Is it a full language or a simple contact tool?', ask: function (t) { return 'Which term fits? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which is an example of a <b>' + c.toLowerCase() + '</b>?'; }, allq: function (c) { return 'Which are examples of a <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['A creole is a "broken" language without real grammar.', false, 'A creole is a full language with its own regular grammar.'], ['A pidgin has no native speakers.', true, 'It is a contact language; when children learn it first, it becomes a creole.'], ['Haitian Creole is an official language of Haiti, along with French.', true, 'Since the 1987 constitution.']] });
  });

  var RL = [['Christianity', 0], ['Islam', 0], ['Buddhism', 0], ['Sikhism', 0], ['The Bahá\'í Faith', 0], ['Hinduism', 1], ['Judaism', 1], ['Shinto', 1], ['Daoism', 1]];
  G('humangeo.religions', function (R, ctx) {
    var L = lvl(ctx);
    if (L >= 2 && R.chance(0.4)) {
      var f = R.pick([['A religion found in many unconnected regions on several continents, spread by missionaries', 'Universalizing'], ['A religion closely tied to one people\'s homeland, found elsewhere mainly where its people migrated', 'Ethnic'],
        ['A religion that grows mainly through birth into the community', 'Ethnic'], ['A religion that invites everyone and actively seeks converts', 'Universalizing'], ['A religion whose holy places are tied to the landscape of one homeland', 'Ethnic'],
        ['A religion with a known founder whose teachings are meant for all people', 'Universalizing'], ['A religion whose holidays follow the farming seasons of its homeland', 'Ethnic'], ['A religion that spread far beyond its hearth along trade routes and through missionaries', 'Universalizing']]);
      return { q: 'Which kind of religion does this describe? <br><b>' + f[0] + '</b>', a: mc(['Universalizing', 'Ethnic'], f[1]), hint: 'Open to all and spreading widely, or tied to one people and place?', steps: [f[1] === 'Universalizing' ? 'Universalizing religions aim to appeal to all people and spread widely.' : 'Ethnic religions are tied to one people and place and spread mainly by migration.', 'So it is ' + f[1].toLowerCase() + '.'] };
    }
    return classify(R, ctx, { items: RL, cats: ['Universalizing', 'Ethnic'], desc: ['Universalizing religions aim to appeal to all people everywhere and often seek converts.', 'Ethnic religions are closely tied to one people, culture and homeland.'],
      hint: 'Is it tied to one people and homeland, or does it seek members everywhere?', ask: function (t) { return 'How do human geography textbooks classify <b>' + t + '</b>?'; },
      rev: function (c) { return 'Which religion is usually classified as <b>' + c.toLowerCase() + '</b>?'; }, allq: function (c) { return 'Which religions are usually classified as <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['A religion with over a billion followers must be universalizing.', false, 'Size is not the test: Hinduism has about 1.2 billion followers and is an ethnic religion.'], ['Ethnic religions spread mainly when their people migrate.', true, 'That is relocation diffusion.'], ['Universalizing religions often seek converts.', true, 'They aim to appeal to all people.']] });
  });

  var HEARTH = [['Judaism', 'Southwest Asia'], ['Christianity', 'Southwest Asia'], ['Islam', 'Southwest Asia'], ['Hinduism', 'South Asia'], ['Buddhism', 'South Asia'], ['Sikhism', 'South Asia'], ['Shinto', 'East Asia']];
  G('humangeo.religion-hearths', function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? 'hearth' : L === 2 ? R.pick(['hearth', 'spread', 'tf']) : R.pick(['spread', 'now', 'tf']);
    if (kind === 'hearth') {
      var it = R.pick(HEARTH), regs = ['Southwest Asia', 'South Asia', 'East Asia', 'Europe'];
      return { q: 'Where is the hearth of <b>' + it[0] + '</b>?', a: mc(L === 1 ? R.shuffle([it[1], it[1] === 'Southwest Asia' ? 'South Asia' : 'Southwest Asia']) : regs, it[1]), hint: 'Two regions of Asia are the hearths of most large religions.', steps: [it[0] + ' began in ' + it[1] + '.', 'Judaism, Christianity and Islam began in Southwest Asia; Hinduism, Buddhism and Sikhism in South Asia.'] };
    }
    if (kind === 'spread') {
      var s = R.pick([['How did Islam reach Indonesia, today the country with the most Muslims?', 'By traders on Indian Ocean sea routes'], ['How did Buddhism reach China, Korea and Japan?', 'By missionaries and traders along the Silk Road and sea routes'], ['How did Christianity spread across the Roman Empire?', 'By missionaries along Roman roads, and as the empire\'s official religion from AD 380'], ['How has Hinduism spread outside South Asia?', 'Mainly as Indian families migrated']]);
      var all = ['By traders on Indian Ocean sea routes', 'By missionaries and traders along the Silk Road and sea routes', 'By missionaries along Roman roads, and as the empire\'s official religion from AD 380', 'Mainly as Indian families migrated'];
      return { q: s[0], a: mc(L === 2 ? R.shuffle([s[1]].concat(R.sample(all.filter(function (x) { return x !== s[1]; }), 2))) : all, s[1]), hint: 'Trade, missionaries, empires and migration each carried different religions.', steps: [s[1] + '.'] };
    }
    if (kind === 'now') {
      var n = R.pick([['Most Buddhists today live in…', 'East and Southeast Asia', 'Buddhism began in South Asia but spread east; China alone has about half of the world\'s Buddhists.'], ['Most Christians today live in…', 'The Americas, Europe and Africa', 'Christianity began in Southwest Asia but spread by missionaries, empires and migration.']]);
      var ch = n[1] === 'East and Southeast Asia' ? ['East and Southeast Asia', 'India, where it began', 'Southwest Asia', 'Europe'] : ['The Americas, Europe and Africa', 'Southwest Asia, where it began', 'East Asia', 'South Asia'];
      return { q: n[0], a: mc(ch, n[1]), hint: 'A religion is not always strongest where it began.', steps: [n[2]] };
    }
    return tfq(R, [['A religion is always strongest in the region where it began.', false, 'Buddhism began in India, but most Buddhists live in East and Southeast Asia.'], ['Judaism, Christianity and Islam all began in Southwest Asia.', true, 'They share a hearth region.'], ['Sikhism began in the Punjab region of South Asia around AD 1500.', true, 'Guru Nanak lived from 1469 to 1539.'], ['Emperor Ashoka sent Buddhist missionaries to other lands.', true, 'His missionaries went to Sri Lanka and beyond.']], 'Follow the paths of diffusion, not just the hearth.');
  });

  var CC = [['Immigrants learn the national language for work but speak their own language at home', 0], ['A family adds the new country\'s holidays to its own', 0], ['Newcomers adopt local clothing for work while keeping their own foods and faith', 0],
    ['Grandchildren of immigrants speak only the new language and keep no old customs', 1], ['A group gives up its own language and traditions over three generations', 1],
    ['A holiday that mixes Indigenous traditions with Catholic feast days', 2], ['A music style that fuses two traditions into a new sound', 2], ['Tex-Mex food, which blends Mexican and American cooking', 2], ['Mexico\'s Day of the Dead, blending Mesoamerican customs with All Saints\' and All Souls\' Days', 2]];
  G('humangeo.cultural-change', function (R, ctx) {
    return classify(R, ctx, { items: CC, cats: ['Acculturation', 'Assimilation', 'Syncretism'], desc: ['Acculturation: adopting some traits of another culture while keeping one\'s own.', 'Assimilation: taking on the larger culture so fully that the original culture fades.', 'Syncretism: two cultures blending into something new.'],
      hint: 'Is the old culture still there, gone, or blended into something new?', ask: function (t) { return 'Which process is this? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which is an example of <b>' + c.toLowerCase() + '</b>?'; }, allq: function (c) { return 'Which are examples of <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['Acculturation and assimilation mean the same thing.', false, 'In acculturation people keep their own culture; in assimilation it fades.'], ['Syncretism creates something new from two cultures.', true, 'That is the definition.'], ['Multiculturalism means several cultures living side by side, each keeping its identity.', true, 'That is the definition.']] });
  });

  var GC = [['The same coffee chain on main streets in many countries', 0], ['Teenagers in many countries following the same online trends', 0], ['Shopping malls that look alike from city to city', 0], ['A local language fading as young people switch to a global one', 0],
    ['A community opens schools taught in its traditional language', 1], ['A local craft festival revived to attract visitors and young people', 1], ['A town protects its old buildings from being replaced by chain stores', 1],
    ['A global restaurant chain adds local dishes to its menu in each country', 2], ['A global TV show is remade with local hosts and customs', 2], ['A fast-food chain sells vegetarian burgers in India', 2]];
  G('humangeo.globalization-culture', function (R, ctx) {
    return classify(R, ctx, { items: GC, cats: ['Cultural convergence', 'Cultural divergence or revival', 'Glocalization'], desc: ['Cultural convergence: places becoming more alike as popular culture spreads.', 'Cultural divergence or revival: places keeping, protecting or reviving what makes them different.', 'Glocalization: global products and ideas adapted to local cultures.'],
      hint: 'More alike, more distinct, or global adapted to local?', ask: function (t) { return 'Which idea does this example show? <br><b>' + t + '</b>'; },
      rev: function (c) { return 'Which example shows <b>' + c.toLowerCase() + '</b>?'; }, allq: function (c) { return 'Which examples show <b>' + c.toLowerCase() + '</b>? Choose all that apply.'; },
      tf: [['Globalization only makes places more alike.', false, 'It also spreads local cultures worldwide and can spark revivals.'], ['Hawaiian-language schools are an example of cultural revival.', true, 'They have raised a new generation of speakers since the 1980s.'], ['Scholars still debate how much globalization makes cultures alike.', true, 'It is an open question; know the arguments.']] });
  });
})(window.MathLadder);

/* ---- part B ---- */
/* Human Geography (humangeo), part B: units 4-7 (Political Geography, Agriculture and Rural Land Use, Cities and Urban Land
   Use, Industry and Development). Generators. Source: /tmp/work_humangeo_B/src/gen_*.js, joined by /tmp/work_humangeo_B/build.py
   into /tmp/work_humangeo_B/out/gen.js and merged by /tmp/merge_parts.js into static/geog/gen/humangeo.js.
   Each topic mixes a bank of facts and cases (made-up countries such as "Arland" wherever a real case would touch a live
   dispute) with problems computed from numbers (sea zones, district seats, von Thünen rent, township acres, market areas,
   rank-size, HDI, Weber transport costs, comparative advantage, urban shares).
     level 1  three choices (the right one and two plainly wrong), or one small computation
     level 2  four choices whose wrong ones come from the topic's trouble note; two-step computations
     level 3  choose all that are true; put items in order; apply the idea to a new case; reverse questions
   Bank items: { L: [levels], q, a, w: [wrong pool], why }        one answer (mc)
               { L, q, tf: true|false, why }                     true or false
               { L, q, all: [[text, true|false], ...], why }      choose all that are true
               { L, q, order: ['first', ..., 'last'], why }      put in order (a quiet, lettered gg-sort list)
               { L, gen: function (R, lv) { return item or problem; } }   made fresh from numbers (a full problem when it has .a)
   Optional on any item: viz, hint, steps. Choices are shuffled here (keep: true).
   Political rule: disputed borders, territories and capitals are never asked as one side's answer; real places in questions
   are only those whose status is not disputed, and the dispute topics use made-up countries. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, M = Math;
  var LET = 'ABCDEFGH';
  function GG() { return ML.geog; }
  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function r2(x) { return M.round(x * 100) / 100; }
  function r3(x) { return M.round(x * 1000) / 1000; }
  function fix(x) { return parseFloat(x.toPrecision(12)); }
  function lettered(items) { return { name: 'gg-sort', opts: { bins: ['Items'], cards: items.map(function (t) { return { text: t, bin: 0 }; }), shuffle: false, quiet: true, interactive: false } }; }
  function orderItem(R, it) {
    var n = it.order.length, start = R.shuffle(it.order.map(function (x, i) { return i; }));
    if (start.every(function (v, i) { return v === i; })) start.reverse();
    var ans = '';
    for (var k = 0; k < n; k++) ans += LET.charAt(start.indexOf(k));
    return {
      q: it.q + ' Type the letters in the right order (for example, ' + LET.slice(0, n).split('').reverse().join('') + ').',
      a: { t: 'text', v: [ans, ans.split('').join(' '), ans.split('').join(','), ans.split('').join(', '), ans.split('').join('-')], strict: true },
      viz: lettered(start.map(function (i) { return it.order[i]; })),
      steps: [it.why, 'In order: ' + it.order.map(function (t, k) { return LET.charAt(start.indexOf(k)) + ' (' + t + ')'; }).join(', then ') + '. So the answer is ' + ans + '.']
    };
  }
  function fromBank(bank, hint) {
    return function (R, ctx) {
      var lv = ctx.level || 1, pool = bank.filter(function (it) { return it.L.indexOf(lv) >= 0; });
      if (!pool.length) pool = bank;
      var it = R.pick(pool);
      if (it.gen) { var g = it.gen(R, lv); if (g.a && typeof g.a === 'object') { if (!g.hint) g.hint = hint || 'Think back to the key idea of the lesson.'; return g; } it = Object.assign({ L: it.L }, g); }
      var p = { q: it.q, steps: [it.why].concat(it.steps || []), hint: it.hint || hint || 'Think back to the key idea of the lesson.' };
      if (it.viz) p.viz = typeof it.viz === 'function' ? it.viz(R) : it.viz;
      if (it.order) { var o = orderItem(R, it); p.q = o.q; p.a = o.a; p.viz = o.viz; p.steps = o.steps; return p; }
      if (it.tf != null) { p.a = { t: 'tf', v: it.tf }; p.q = 'True or false? ' + it.q; return p; }
      if (it.num != null) { p.a = { t: 'num', v: String(it.num) }; if (it.rtol) p.a.rtol = it.rtol; if (it.unit) p.unit = it.unit; return p; }
      if (it.all) {
        var opts = R.shuffle(it.all.slice()), v = []; opts.forEach(function (o, i) { if (o[1]) v.push(i); });
        p.q = it.q + ' Choose all that are true.'; p.a = { t: 'mc', choices: opts.map(function (o) { return o[0]; }), v: v, keep: true }; return p;
      }
      var n = lv === 1 ? 2 : 3, wrong = R.sample(it.w, M.min(n, it.w.length)), ch = R.shuffle([it.a].concat(wrong));
      p.a = { t: 'mc', choices: ch, v: ch.indexOf(it.a), keep: true };
      return p;
    };
  }
  // an mc problem from a right answer and wrong ones (shuffled here, keep: true)
  function mcP(R, q, right, wrongs, steps, hint, viz) {
    var ch = R.shuffle([right].concat(wrongs)), p = { q: q, a: { t: 'mc', choices: ch, v: ch.indexOf(right), keep: true }, steps: steps, hint: hint };
    if (viz) p.viz = viz;
    return p;
  }
  // made-up countries and peoples for cases that must not touch a real dispute
  var FAKE = ['Arland', 'Bexia', 'Corvania', 'Dorvia', 'Estmark', 'Felland', 'Gorsa', 'Halvia', 'Istra', 'Jorvik', 'Kaldar', 'Lunea', 'Moravel', 'Norland', 'Ostria', 'Pellar'];
  var PEOPLE = ['Vashi', 'Tenori', 'Ulmar', 'Seraki', 'Quen', 'Dalvi', 'Rohani', 'Kessar'];

  /* ======================================================================== Unit 4: Political Geography */

  /* ------------------------------------------------------------------ humangeo.state-nation */
  G('humangeo.state-nation', fromBank([
    { L: [1, 2], q: 'In political geography, what is a <b>state</b>?', a: 'A sovereign country with its own government, territory and borders', w: ['A part of a federal country, like Ohio or Texas', 'A people who share a culture and see themselves as one group', 'Any city with its own mayor', 'A region with a shared climate'], why: 'In this unit a state is a sovereign country; Ohio is a "state" only in the U.S. sense.' },
    { L: [1, 2], q: 'In political geography, what is a <b>nation</b>?', a: 'A people who share a culture and see themselves as one group', w: ['A sovereign country with borders', 'Any territory with a government', 'A part of a federal country', 'A group of countries that trade together'], why: 'A nation is a people, which may or may not have a state of its own.' },
    { L: [1, 2], q: 'What is a <b>nation-state</b>?', a: 'A state whose people are mostly one nation', w: ['A nation with no state of its own', 'A state with several nations of equal size', 'A state that belongs to a larger union', 'A nation spread across many states'], why: 'In a nation-state, the state and the nation largely match, as in Iceland or Japan.' },
    { L: [2, 3], q: 'Which is <b>not</b> one of the four tests of statehood in the Montevideo Convention (1933)?', a: 'A single shared language', w: ['A permanent population', 'A defined territory', 'A government', 'The capacity to deal with other states'], why: 'The four tests are a permanent population, a defined territory, a government, and the capacity to deal with other states. A shared language is a mark of a nation, not a legal test of a state.' },
    { L: [2], q: 'By the count used in this course (UN members plus the two UN observer states), how many countries are there?', num: 195, why: 'There are 193 UN members plus the 2 observer states, the Holy See and the State of Palestine: 195.' },
    { L: [1, 2], q: 'In political geography, Ohio is a state in the same sense as France.', tf: false, why: 'France is a sovereign state. Ohio is a part of a federal country and does not deal with foreign countries on its own.' },
    { L: [1, 2], q: 'A nation can exist without a state of its own.', tf: true, why: 'A nation is a people. The Kurds, for example, are a nation without a state.' },
    { L: [2, 3], q: 'Every member of the United Nations is a nation-state.', tf: false, why: 'Most UN members hold several nations; few are nation-states in the strict sense.' },
    { L: [1, 2], q: 'Iceland, where almost everyone shares one language and history, is close to being a nation-state.', tf: true, why: 'Its state and its nation largely match.' },
    { L: [3], q: 'Which are among the Montevideo Convention\'s tests of statehood?', all: [['A permanent population', true], ['A defined territory', true], ['A government', true], ['A single official religion', false], ['At least one million people', false], ['The capacity to deal with other states', true]], why: 'The four tests: a permanent population, a defined territory, a government, and the capacity to deal with other states.' },
    { L: [1, 2, 3], gen: function (R, lv) {
      var X = R.pick(FAKE), P = R.pick(PEOPLE), k = R.int(0, 2);
      if (k === 0) return { q: 'The ' + P + ' people share a language, a history and a sense of being one people. They live in a region of ' + X + ' and have no government of their own. In political geography, the ' + P + ' are best called a…', a: 'nation', w: ['state', 'nation-state', 'supranational organization'], why: 'A people with a shared identity is a nation, whether or not it has a state.' };
      if (k === 1) return { q: X + ' has a permanent population, borders, a government and an embassy in many countries. Its people belong to several different peoples. ' + X + ' is best called a…', a: 'state', w: ['nation', 'nation-state', 'stateless nation'], why: 'It meets the tests of a state, but with several peoples it is not a nation-state.' };
      return { q: X + ' is a sovereign country, and ' + R.int(92, 98) + '% of its people share one language, history and identity. Which term fits best?', a: 'nation-state', w: ['stateless nation', 'multistate nation', 'colony'], why: 'A state whose people are mostly one nation is a nation-state.' };
    } }
  ], 'A state is a country (a legal unit); a nation is a people (a shared identity).'));

  /* ------------------------------------------------------------------ humangeo.multinational */
  var PATTERN = ['a multinational state', 'a multistate nation', 'a stateless nation', 'a nation-state'];
  G('humangeo.multinational', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) {
      var k = R.int(0, 3), X = R.sample(FAKE, 3), P = R.sample(PEOPLE, 3), q;
      if (k === 0) q = X[0] + ' has one national government. Within its borders live the ' + P[0] + ', the ' + P[1] + ' and the ' + P[2] + ', each with its own language and history. Which pattern is this?';
      else if (k === 1) q = 'The ' + P[0] + ' share one language and history, but they live in two neighboring states, ' + X[0] + ' and ' + X[1] + ', each with its own government. Which pattern describes the ' + P[0] + '?';
      else if (k === 2) q = 'The ' + P[0] + ' see themselves as one people, but their homeland is divided among ' + X[0] + ', ' + X[1] + ' and ' + X[2] + ', and none of those states is theirs. Which pattern describes the ' + P[0] + '?';
      else q = 'In ' + X[0] + ', nearly everyone is ' + P[0] + ', and nearly all ' + P[0] + ' live in ' + X[0] + '. Which pattern is this?';
      var w = PATTERN.filter(function (x, i) { return i !== k; });
      return { q: q, a: PATTERN[k], w: lv === 1 ? w.filter(function (x) { return x !== 'a nation-state' || k === 3; }) : w, why: ['One state with several nations is a multinational state.', 'One nation living in two or more states is a multistate nation.', 'A nation with no state of its own is a stateless nation.', 'One state whose people are one nation is a nation-state.'][k] };
    } },
    { L: [1, 2], q: 'The Kurds, whose homeland is divided among Türkiye, Iraq, Iran and Syria, are often called the largest…', a: 'stateless nation', w: ['multinational state', 'nation-state', 'supranational organization'], why: 'An estimated 30 to 40 million Kurds have no state of their own.' },
    { L: [1, 2], q: 'Since 1948, Koreans have lived in two states, North Korea and South Korea. The Koreans are an example of…', a: 'a multistate nation', w: ['a stateless nation', 'a multinational state', 'a supranational organization'], why: 'One nation in two or more states is a multistate nation.' },
    { L: [1, 2], q: 'Belgium, with Dutch-speaking Flemish people in the north and French-speaking Walloons in the south under one government, is an example of…', a: 'a multinational state', w: ['a nation-state', 'a stateless nation', 'a multistate nation'], why: 'One state with two or more nations is a multinational state.' },
    { L: [2, 3], q: 'The United Kingdom, made up of England, Scotland, Wales and Northern Ireland, is an example of…', a: 'a multinational state', w: ['a nation-state', 'a stateless nation', 'a multistate nation'], why: 'It is one state that holds several nations.' },
    { L: [2], q: 'About how many Kurds are there, by most estimates?', a: '30 to 40 million', w: ['3 to 4 million', '300 to 400 million', 'about 1 million'], why: 'Estimates range from about 30 to 40 million; they vary because several countries do not count people by ethnic group.' },
    { L: [1, 2], q: 'Most of the world\'s states are nation-states.', tf: false, why: 'Few states are made of a single nation; most hold several peoples.' },
    { L: [2, 3], q: 'A person can feel part of more than one nation at once, such as Scottish and British.', tf: true, why: 'Identities can be layered; geographers describe them without ranking them.' },
    { L: [3], q: 'In which countries do most Kurds live?', all: [['Türkiye', true], ['Iraq', true], ['Iran', true], ['Syria', true], ['Egypt', false], ['Pakistan', false]], why: 'The Kurdish homeland lies in the mountains where Türkiye, Iraq, Iran and Syria meet.', viz: { name: 'gg-map', opts: { region: ['TUR', 'IRQ', 'IRN', 'SYR', 'EGY'], labels: ['TUR', 'IRQ', 'IRN', 'SYR', 'EGY', 'SAU', 'JOR'], quiet: true, interactive: false, dots: false, label: 'A map of Southwest Asia with country names.' } } },
    { L: [3], q: 'Which statements are true?', all: [['A multinational state has more than one nation inside it', true], ['A stateless nation has no state of its own', true], ['A multistate nation lives in two or more states', true], ['A nation-state must have only one city', false], ['A stateless nation cannot have a shared language', false]], why: 'Ask two questions every time: how many states, and how many nations?' }
  ], 'Count the states and count the nations.'));

  /* ------------------------------------------------------------------ humangeo.sovereignty */
  G('humangeo.sovereignty', fromBank([
    { L: [1, 2], q: 'What is <b>sovereignty</b>?', a: 'A state\'s right to govern its own territory without outside control', w: ['A people\'s shared culture and identity', 'Membership in the United Nations', 'The urge to claim and defend space', 'The power of a city over its suburbs'], why: 'Sovereignty is the right to rule one\'s own territory, free of outside control.' },
    { L: [1, 2], q: 'What is <b>territoriality</b>?', a: 'The way people and states claim, mark and defend space as their own', w: ['A state\'s right to make its own laws', 'The total land area of a country', 'Rule by a foreign power', 'A treaty that sets a border'], why: 'Territoriality is claiming and defending space: fences, signs, border posts, patrols.' },
    { L: [1, 2], q: 'Which peace treaty of 1648 is often named as the start of the modern idea of state sovereignty?', a: 'The Peace of Westphalia', w: ['The Treaty of Paris', 'The Berlin Conference', 'The Charter of the United Nations', 'The Treaty of Versailles'], why: 'The Peace of Westphalia (1648) ended decades of war in Europe and set the principle that each ruler governs inside their own borders.' },
    { L: [1, 2], gen: function (R) {
      var right = R.pick(['A country builds posts and patrols along its border', 'A farmer puts up a fence and a "No trespassing" sign', 'A team marks its practice field as its own', 'A coast guard patrols the edge of its waters']);
      return { q: 'Which of these shows <b>territoriality</b>?', a: right, w: ['Two countries share weather data', 'Scientists from many countries study a glacier together', 'Neighbors share a garden hose', 'Students from two schools join a science fair'], why: 'Territoriality means claiming, marking and defending space as one\'s own.' };
    } },
    { L: [2, 3], gen: function (R) {
      var X = R.pick(FAKE);
      return { q: 'The government of ' + X + ' collects taxes, runs schools and courts, and controls its borders, but only a few countries formally recognize it as a state. Which part of sovereignty is in question?', a: 'Recognition by other states (external sovereignty)', w: ['Control at home (internal sovereignty)', 'Its territoriality', 'Its population'], why: 'It governs itself at home; what it lacks is wide recognition by other states, so its status is described as disputed.' };
    } },
    { L: [1, 2], q: 'Recognition by other states is part of sovereignty in practice.', tf: true, why: 'Sovereignty has an inside side (governing) and an outside side (being accepted by other states).' },
    { L: [1, 2], q: 'Antarctica is governed by seven countries that divide it among themselves.', tf: false, why: 'Antarctica has no countries. Under the Antarctic Treaty (1959), seven countries\' claims are set aside, and the continent is used for peace and science.' },
    { L: [2, 3], q: 'Every place that governs itself is fully sovereign.', tf: false, why: 'Some places run their own affairs but are recognized by only some countries, so their status is disputed.' },
    { L: [3], q: 'Which show territoriality?', all: [['A border post with flags', true], ['Passports checked at an airport', true], ['A "Private property" sign', true], ['Two nations sharing a weather satellite', false], ['A joint scientific base where all claims are set aside', false]], why: 'Territoriality is claiming and marking space; cooperation and shared use are not.' },
    { L: [3], q: 'Which statements about sovereignty are true?', all: [['A sovereign state makes and enforces its own laws', true], ['Other states\' recognition affects a state\'s standing', true], ['A U.S. state such as Iowa is sovereign in the political-geography sense', false], ['Sovereignty means a country can never join an international organization', false]], why: 'Sovereignty is self-rule plus recognition; sovereign states still join organizations and treaties by choice.' }
  ], 'Sovereignty is the right to rule; territoriality is the urge to claim space.'));

  /* ------------------------------------------------------------------ humangeo.boundary-types */
  var BT = {
    physical: ['physical', 'follows a natural feature such as a river, a lake or a mountain crest'],
    cultural: ['cultural', 'follows a line between languages, religions or ethnic groups'],
    geometric: ['geometric', 'is a straight line, often along a parallel or a meridian'],
    antecedent: ['antecedent', 'was drawn before most of today\'s settlement'],
    subsequent: ['subsequent', 'was drawn after people had settled, as groups settled their limits'],
    superimposed: ['superimposed', 'was imposed on an area by outside powers'],
    relict: ['relict', 'no longer works as a boundary but can still be seen on the land']
  };
  var BT_SHAPE = ['physical', 'cultural', 'geometric'], BT_TIME = ['antecedent', 'subsequent', 'superimposed', 'relict'];
  G('humangeo.boundary-types', fromBank([
    { L: [1, 2], gen: function (R, lv) {
      var fam = R.coin() ? BT_SHAPE : BT_TIME, k = R.pick(fam), wr = fam.filter(function (x) { return x !== k; });
      if (lv === 1) wr = R.sample(wr, 2);
      return { q: 'A boundary that ' + BT[k][1] + ' is called…', a: 'a ' + k + ' boundary', w: wr.map(function (x) { return 'a ' + x + ' boundary'; }), why: 'A ' + k + ' boundary ' + BT[k][1] + '.' };
    } },
    { L: [1, 2, 3], gen: function (R, lv) {
      var cases = [
        ['The border between the United States and Mexico along the Rio Grande', 'physical', ['geometric', 'cultural', 'relict']],
        ['The border between France and Spain along the crest of the Pyrenees', 'physical', ['geometric', 'cultural', 'superimposed']],
        ['The border between Chile and Argentina along the Andes', 'physical', ['geometric', 'cultural', 'relict']],
        ['The U.S.-Canada border along the 49th parallel', 'geometric', ['physical', 'cultural', 'relict']],
        ['Many straight borders across the Sahara, drawn by European powers', 'superimposed', ['antecedent', 'relict', 'subsequent']],
        ['The former border between East and West Germany, still visible on the land since 1990', 'relict', ['superimposed', 'antecedent', 'subsequent']],
        ['The Great Wall of China, which no longer marks a border', 'relict', ['antecedent', 'superimposed', 'subsequent']],
        ['The 49th parallel, agreed in 1818 and 1846 when few settlers lived there', 'antecedent', ['subsequent', 'relict', 'superimposed']]];
      var c = R.pick(cases), w = lv === 1 ? c[2].slice(0, 2) : c[2];
      return { q: c[0] + ' is best described as which type of boundary?', a: cap1(c[1]), w: w.map(cap1), why: 'A ' + c[1] + ' boundary ' + BT[c[1]][1] + '.' };
    } },
    { L: [2, 3], gen: function (R) {
      var r = R.pick(['AF', 'naf']);
      return { q: 'Look at the long straight segments of the borders on this map of ' + (r === 'AF' ? 'Africa' : 'North Africa') + '. By shape, what type of boundary are they?', a: 'Geometric', w: ['Physical', 'Cultural', 'Relict'], why: 'Straight lines along parallels and meridians are geometric boundaries; many were drawn by European powers, so they are also superimposed.',
        viz: { name: 'gg-map', opts: { region: r, quiet: true, interactive: false, dots: false, label: 'A political map of Africa with many straight borders.' } } };
    } },
    { L: [1, 2], q: 'Straight-line borders usually follow natural features.', tf: false, why: 'Straight lines usually mark borders drawn on maps by outsiders or by treaty. Natural borders follow rivers and mountain crests, and they wiggle.' },
    { L: [2, 3], q: 'A boundary can be geometric and antecedent at the same time.', tf: true, why: 'Shape and timing are two separate questions; the 49th parallel is both.' },
    { L: [2, 3], q: 'At the Berlin Conference (1884-1885), European powers set rules for dividing Africa. Borders drawn this way, with little regard for the peoples living there, are called…', a: 'superimposed boundaries', w: ['antecedent boundaries', 'relict boundaries', 'subsequent boundaries'], why: 'Boundaries imposed by outside powers are superimposed.' },
    { L: [3], gen: function (R) {
      var X = R.sample(FAKE, 2), k = R.int(0, 2);
      var q = [X[0] + ' and ' + X[1] + ' agreed on a straight border along a line of latitude in an empty desert, before anyone settled there. Which two labels fit?',
        'Long ago, outside powers drew a straight line between ' + X[0] + ' and ' + X[1] + ' that split a people in two. Which two labels fit?',
        'A river once divided ' + X[0] + ' from a neighbor that later joined it; the old river line no longer divides anything but still shows in local customs. Which two labels fit?'][k];
      var ans = [['Geometric and antecedent', ['Physical and relict', 'Cultural and subsequent', 'Geometric and relict']],
        ['Geometric and superimposed', ['Cultural and antecedent', 'Physical and subsequent', 'Physical and relict']],
        ['Physical and relict', ['Geometric and antecedent', 'Cultural and superimposed', 'Geometric and subsequent']]][k];
      return { q: q, a: ans[0], w: ans[1], why: ['A straight line of latitude is geometric; drawn before settlement, it is antecedent.', 'A straight line is geometric; imposed by outsiders, it is superimposed.', 'It followed a river (physical) and no longer works as a border (relict).'][k] };
    } },
    { L: [3], q: 'Put the boundary types in order of when they are drawn compared with settlement, from earliest to latest.', order: ['Antecedent', 'Subsequent', 'Relict'], why: 'Antecedent comes before settlement, subsequent after it, and a relict boundary is one that has already stopped working.' }
  ], 'Two questions: what does the line follow, and when was it drawn?'));
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ------------------------------------------------------------------ humangeo.boundary-disputes */
  var DISP = {
    definitional: ['The treaty between {A} and {B} says the border follows "the main channel" of a river, and the two countries read those words differently.',
      '{A} and {B} disagree about what a 100-year-old treaty means by "the highest ridge."',
      'A treaty sets the border at "the watershed," and {A} and {B} each say the word means something different.'],
    locational: ['A flood moves the river that forms the border between {A} and {B}, and both claim the land that ended up on the other bank.',
      'Two old surveys put the border between {A} and {B} in slightly different places, and both claim the strip between them.',
      '{A} and {B} accept the treaty\'s words but disagree about where its line falls on the ground.'],
    operational: ['{A} wants to open a new border crossing for trucks; {B} wants to keep it closed.',
      '{A} and {B} agree where the border is but argue about how to handle people crossing it to work.',
      '{A} and {B} disagree about inspections and customs checks at their shared border.'],
    allocational: ['An oil field lies under the border between {A} and {B}, and both want to pump from it.',
      '{A} and {B} both want to fish in rich waters close to their sea border.',
      'A river crosses from {A} into {B}, and the two disagree about how much water each may take from it.']
  };
  var DKEYS = ['definitional', 'locational', 'operational', 'allocational'];
  function dispCase(R, k) { var X = R.sample(FAKE, 2); return R.pick(DISP[k]).replace('{A}', X[0]).replace('{B}', X[1]); }
  G('humangeo.boundary-disputes', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) {
      var k = R.pick(DKEYS), w = DKEYS.filter(function (x) { return x !== k; });
      if (lv === 1) w = R.sample(w, 2);
      return { q: dispCase(R, k) + ' What kind of boundary dispute is this?', a: cap1(k), w: w.map(cap1), why: { definitional: 'The disagreement is about the treaty\'s wording: definitional.', locational: 'The disagreement is about where the line falls on the ground: locational.', operational: 'The disagreement is about how the border works: operational.', allocational: 'The disagreement is about a resource the border divides: allocational.' }[k] };
    } },
    { L: [1, 2], gen: function (R, lv) {
      var k = R.pick(DKEYS), d = { definitional: 'the wording of the treaty that defines the border', locational: 'where the line falls on the ground', operational: 'how the border works: crossings, trade and migration', allocational: 'resources the border divides, such as oil, water or fish' };
      var w = DKEYS.filter(function (x) { return x !== k; }).map(function (x) { return d[x]; });
      return { q: 'A <b>' + k + '</b> boundary dispute is about…', a: d[k], w: lv === 1 ? w.slice(0, 2) : w.concat(['how serious the conflict is']), why: 'Disputes are sorted by what they are about, not by how heated they are.' };
    } },
    { L: [2, 3], q: 'In 1864 a flood moved the Rio Grande, and land near El Paso and Ciudad Juárez ended up on the other bank. The United States and Mexico settled the Chamizal question in 1963. What kind of dispute was it?', a: 'Locational', w: ['Definitional', 'Operational', 'Allocational'], why: 'Both accepted that the river was the border; the question was where the line lay after the river moved.' },
    { L: [1, 2], q: 'Boundary disputes are sorted by how serious they are.', tf: false, why: 'They are sorted by what they are about: wording, location, operation or resources.' },
    { L: [2, 3], q: 'A definitional dispute can lead to a locational dispute.', tf: true, why: 'Vague treaty words can leave the line\'s position on the ground unclear.' },
    { L: [3], gen: function (R) {
      var ks = R.sample(DKEYS, 2), X = R.sample(FAKE, 2);
      var items = [[dispCase(R, ks[0]), true], [dispCase(R, ks[1]), false]];
      return { q: 'Which case is a <b>' + ks[0] + '</b> dispute?', a: items[0][0], w: [items[1][0]].concat(R.sample(DKEYS.filter(function (x) { return ks.indexOf(x) < 0; }), 1).map(function (x) { return dispCase(R, x); })), why: 'A ' + ks[0] + ' dispute is about ' + { definitional: 'the treaty\'s wording', locational: 'where the line falls on the ground', operational: 'how the border works', allocational: 'resources the border divides' }[ks[0]] + '.' };
    } }
  ], 'Ask what the two sides disagree about: words, the line\'s place, how it works, or what lies under it.'));

  /* ------------------------------------------------------------------ humangeo.law-of-the-sea */
  var ZONES = ['the territorial sea', 'the contiguous zone', 'the exclusive economic zone', 'the high seas'];
  function zoneOf(d) { return d <= 12 ? 0 : d <= 24 ? 1 : d <= 200 ? 2 : 3; }
  G('humangeo.law-of-the-sea', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) {
      var d = lv === 1 ? R.pick([R.int(2, 9), R.int(15, 21), R.int(40, 180), R.int(230, 600)]) : lv === 2 ? R.pick([R.int(11, 14), R.int(22, 27), R.int(190, 199), R.int(201, 215), R.int(25, 199)]) : R.int(1, 400);
      var z = zoneOf(d), w = ZONES.filter(function (x, i) { return i !== z; });
      return { q: 'A ship is ' + d + ' nautical miles from a country\'s coast (measured from the baseline). Under the UN Convention on the Law of the Sea, which zone is it in?', a: cap1(ZONES[z]), w: (lv === 1 ? R.sample(w, 2) : w).map(cap1),
        why: 'Territorial sea to 12 nautical miles, contiguous zone to 24, exclusive economic zone to 200, high seas beyond. ' + d + ' nautical miles is in ' + ZONES[z] + '.',
        viz: { name: 'gg-models', opts: { model: 'sea', quiet: true, interactive: false, hideNames: lv === 3 } } };
    } },
    { L: [2, 3], gen: function (R, lv) {
      var d = R.pick([R.int(30, 190), R.int(5, 11), R.int(210, 400)]), z = zoneOf(d), act = R.pick(['fish', 'sail through']);
      var ok = act === 'sail through' ? true : z === 3;
      var q = 'A foreign boat is ' + d + ' nautical miles off a country\'s coast. May it ' + act + ' there without the coastal country\'s permission?';
      var why = z === 0 ? 'At ' + d + ' nautical miles it is in the territorial sea. Foreign ships may pass through peacefully (innocent passage), but fishing needs permission.'
        : z === 2 ? 'At ' + d + ' nautical miles it is in the exclusive economic zone. Ships of every country may sail through, but the fish belong to the coastal country\'s rights.'
        : 'At ' + d + ' nautical miles it is on the high seas, open to all.';
      return { q: q, a: ok ? 'Yes' : 'No', w: [ok ? 'No' : 'Yes'], why: why };
    } },
    { L: [2, 3], gen: function (R) {
      var W = R.pick([120, 160, 180, 220, 250, 280, 300, 320, 350, 380]), half = W / 2;
      return { q: 'Two countries face each other across a sea ' + W + ' nautical miles wide. If they divide the overlapping exclusive economic zones along the line halfway between their coasts, how far does each country\'s zone reach, in nautical miles?', num: half,
        why: 'Each could claim 200 nautical miles, but 200 + 200 = 400 is more than ' + W + ', so the zones overlap. Halfway: ' + W + ' ÷ 2 = ' + half + ' nautical miles.' };
    } },
    { L: [1, 2], gen: function (R) {
      var nm = R.pick([12, 24, 200]), km = r2(nm * 1.852);
      return { q: 'One nautical mile is 1,852 meters (1.852 km). About how many kilometers is ' + nm + ' nautical miles, the outer edge of ' + ZONES[[12, 24, 200].indexOf(nm)] + '?', num: km, rtol: 0.02, unit: 'km',
        why: nm + ' × 1.852 = ' + km + ' km, about ' + M.round(km) + ' km.' };
    } },
    { L: [1, 2], q: 'How far out does a country\'s exclusive economic zone (EEZ) reach under the Law of the Sea?', a: '200 nautical miles', w: ['12 nautical miles', '24 nautical miles', '3 nautical miles', '350 nautical miles'], why: 'The EEZ reaches up to 200 nautical miles from the baseline.' },
    { L: [1, 2], q: 'How far out does a country\'s territorial sea reach under the Law of the Sea?', a: '12 nautical miles', w: ['200 nautical miles', '24 nautical miles', '100 nautical miles'], why: 'The territorial sea reaches up to 12 nautical miles; there the coastal country has sovereignty, with a right of innocent passage for foreign ships.' },
    { L: [2, 3], q: 'What does the exclusive economic zone give a coastal country?', a: 'Rights to the fish, oil, gas and other resources there', w: ['Full sovereignty, as on land', 'The right to stop all foreign ships from passing', 'Ownership of the airspace for all purposes', 'Only the right to enforce customs laws'], why: 'The EEZ is about resources; other countries may still sail and fly through it.' },
    { L: [1, 2], q: 'A country owns the sea out to 200 nautical miles, just as it owns its land.', tf: false, why: 'Full sovereignty reaches only 12 nautical miles. The EEZ out to 200 gives rights to resources, not full control.' },
    { L: [3], q: 'Put the zones in order from the coast outward.', order: ['Territorial sea', 'Contiguous zone', 'Exclusive economic zone', 'High seas'], why: 'Territorial sea to 12 nautical miles, contiguous zone to 24, exclusive economic zone to 200, then the high seas.' },
    { L: [3], q: 'Which statements about the Law of the Sea are true?', all: [['It was adopted in 1982', true], ['Distances are measured in nautical miles from the baseline', true], ['Foreign ships may pass peacefully through the territorial sea', true], ['The high seas belong to the nearest country', false], ['A country may stop foreign ships from sailing through its EEZ', false]], why: 'UNCLOS (1982) sets zones from the baseline; navigation stays open beyond the territorial sea, and the high seas belong to no one.' }
  ], 'Territorial sea 12, contiguous zone 24, exclusive economic zone 200 nautical miles.'));

  /* ------------------------------------------------------------------ humangeo.state-shapes */
  var SHAPE = { compact: ['POL', 'HUN', 'ZWE', 'KHM', 'URY'], elongated: ['CHL', 'MWI', 'VNM', 'PAN'], prorupted: ['THA', 'NAM', 'AFG'], perforated: ['ZAF'], fragmented: ['IDN', 'PHL', 'MYS'] };
  var SHAPE_WHOLE_OK = { compact: ['POL', 'HUN', 'ZWE'], elongated: ['MWI', 'PAN'], prorupted: ['NAM', 'AFG'], fragmented: ['IDN', 'PHL', 'MYS'] };
  var SHAPE_DEF = { compact: 'roughly round, with no part far from the center', elongated: 'long and thin', prorupted: 'compact with a long arm sticking out', perforated: 'surrounding another country, which sits inside it like a hole', fragmented: 'in several separate pieces' };
  var SKEYS = ['compact', 'elongated', 'prorupted', 'perforated', 'fragmented'];
  function cname(id) { return GG().country(id).n; }
  G('humangeo.state-shapes', fromBank([
    { L: [1, 2], gen: function (R, lv) { // one outline: name its shape
      var k = R.pick(SKEYS), id = R.pick(SHAPE[k]), w = SKEYS.filter(function (x) { return x !== k; });
      if (lv === 1) w = R.sample(w.filter(function (x) { return x !== 'perforated'; }), 2);
      else if (k === 'perforated') w = ['fragmented', 'compact', 'prorupted'];
      else if (k === 'fragmented') w = ['perforated', 'elongated', 'compact'];
      else w = R.sample(w, 3);
      return { q: 'This is the outline of ' + cname(id) + '. Which shape best describes it?', a: k, w: w,
        why: cname(id) + ' is ' + k + ': ' + SHAPE_DEF[k] + '.' + (k === 'perforated' ? ' The hole inside is Lesotho.' : ''),
        viz: { name: 'gg-outline', opts: { ids: [id], whole: k === 'fragmented', quiet: true, interactive: false, label: 'The outline of a country.' } } };
    } },
    { L: [2, 3], gen: function (R) { // four lettered outlines: which one has the asked shape?
      var withFrag = R.coin(), keys, ids;
      if (withFrag) { keys = ['fragmented'].concat(R.sample(['compact', 'elongated', 'prorupted'], 3)); ids = keys.map(function (k) { return R.pick(SHAPE_WHOLE_OK[k]); }); }
      else { keys = R.sample(['compact', 'elongated', 'prorupted', 'perforated'], 4); ids = keys.map(function (k) { return R.pick(SHAPE[k]); }); }
      var order = R.shuffle([0, 1, 2, 3]), shownIds = order.map(function (i) { return ids[i]; }), shownKeys = order.map(function (i) { return keys[i]; });
      var askK = R.pick(shownKeys), ai = shownKeys.indexOf(askK);
      return { q: 'Which lettered country is <b>' + askK + '</b> (' + SHAPE_DEF[askK] + ')?', a: { t: 'mc', choices: ['A', 'B', 'C', 'D'], v: ai, keep: true },
        steps: ['A ' + askK + ' state is ' + SHAPE_DEF[askK] + '.', shownIds.map(function (id, i) { return LET[i] + ' is ' + cname(id) + ' (' + shownKeys[i] + ')'; }).join('; ') + '.', 'So the answer is ' + LET[ai] + '.'],
        hint: 'Look for the shape that is ' + SHAPE_DEF[askK] + '.',
        viz: { name: 'gg-outline', opts: { ids: shownIds, whole: withFrag, quiet: true, interactive: false, label: 'Four country outlines, lettered A to D.' } } };
    } },
    { L: [1, 2], gen: function (R, lv) {
      var k = R.pick(SKEYS), w = SKEYS.filter(function (x) { return x !== k; });
      return { q: 'A state that is ' + SHAPE_DEF[k] + ' is called…', a: k, w: lv === 1 ? R.sample(w, 2) : (k === 'perforated' ? ['fragmented', 'prorupted', 'compact'] : k === 'fragmented' ? ['perforated', 'elongated', 'prorupted'] : R.sample(w, 3)), why: 'A ' + k + ' state is ' + SHAPE_DEF[k] + '.' };
    } },
    { L: [2, 3], q: 'South Africa completely surrounds Lesotho. South Africa is therefore…', a: 'perforated', w: ['fragmented', 'prorupted', 'elongated'], why: 'A state with another state inside it, like a hole, is perforated. Lesotho, inside it, is landlocked and enclaved.' },
    { L: [2, 3], q: 'Indonesia is made of thousands of islands. Its shape is…', a: 'fragmented', w: ['perforated', 'elongated', 'compact'], why: 'A state in separate pieces is fragmented.' },
    { L: [2, 3], q: 'A perforated state is one that is split into several separate pieces.', tf: false, why: 'That is a fragmented state. A perforated state surrounds another state.' },
    { L: [1, 2], q: 'In a compact state, no part is very far from the center.', tf: true, why: 'That is what makes a compact shape easy to connect and govern from the middle.' },
    { L: [3], q: 'Which are possible challenges for an elongated state such as Chile?', all: [['Its far ends are hard to reach from the capital', true], ['Its regions can have very different climates', true], ['It surrounds another country', false], ['It must be made of islands', false]], why: 'An elongated state is long and thin: distance between its ends is the main challenge, and its length spans many climates.' }
  ], 'Picture the outline: round, long, with an arm, with a hole, or in pieces?'));

  /* ------------------------------------------------------------------ humangeo.unitary-federal */
  var FED = ['USA', 'CAN', 'MEX', 'BRA', 'ARG', 'DEU', 'AUT', 'CHE', 'RUS', 'IND', 'AUS', 'NGA', 'MYS'], UNI = ['FRA', 'JPN', 'CHN', 'GHA', 'EGY', 'PER', 'POL', 'SWE'];
  G('humangeo.unitary-federal', fromBank([
    { L: [1, 2], gen: function (R) {
      var f = R.coin(), id = R.pick(f ? FED : UNI);
      return { q: 'Is ' + cname(id) + ' a unitary state or a federal state?', a: f ? 'Federal' : 'Unitary', w: [f ? 'Unitary' : 'Federal'], why: cname(id) + ' is ' + (f ? 'federal: its constitution divides power between the national government and its states or provinces.' : 'unitary: power is concentrated in the national government.') };
    } },
    { L: [1, 2], q: 'In which kind of state does the constitution divide power between the national government and states or provinces, each with authority of its own?', a: 'A federal state', w: ['A unitary state', 'A nation-state', 'A city-state'], why: 'That division of power is the mark of a federal state.' },
    { L: [1, 2], q: 'In which kind of state is power concentrated in the central government, with regions carrying out its decisions?', a: 'A unitary state', w: ['A federal state', 'A supranational organization', 'A multistate nation'], why: 'That is a unitary state, such as France or Japan.' },
    { L: [2, 3], gen: function (R) {
      var X = R.pick(FAKE), u = R.coin();
      return { q: u ? 'In ' + X + ', the national parliament can abolish a province\'s council by passing an ordinary law. Is ' + X + ' unitary or federal?' : 'In ' + X + ', the constitution lists the powers of the provinces, and only a constitutional amendment can change them. Is ' + X + ' unitary or federal?',
        a: u ? 'Unitary' : 'Federal', w: [u ? 'Federal' : 'Unitary', 'Neither: it is a supranational organization'], why: u ? 'Regional power on loan from the center, removable by ordinary law, means a unitary state.' : 'Regional power protected by the constitution means a federal state.' };
    } },
    { L: [2, 3], q: 'What is <b>devolution</b>?', a: 'The transfer of some power from the central government to regions', w: ['A region leaving to form a new country', 'Joining a supranational organization', 'Redrawing electoral districts', 'Moving the capital city'], why: 'Devolution hands power down to regions; since the late 1990s the United Kingdom has given Scotland, Wales and Northern Ireland their own elected bodies.' },
    { L: [1, 2], q: 'A federal state has a weak national government.', tf: false, why: 'Both levels have real authority. The U.S. national government runs the military, money and foreign policy.' },
    { L: [2, 3], q: 'The United Kingdom is a unitary state, even though Scotland and Wales have their own elected bodies.', tf: true, why: 'Their powers were devolved by acts of the UK Parliament; it remains a unitary state with devolution.' },
    { L: [3], gen: function (R) {
      var f = R.sample(FED, 2), u = R.sample(UNI, 2), all = R.shuffle(f.map(function (x) { return [cname(x), true]; }).concat(u.map(function (x) { return [cname(x), false]; })));
      return { q: 'Which of these countries are federal states?', all: all, why: f.map(cname).join(' and ') + ' are federal; ' + u.map(cname).join(' and ') + ' are unitary.' };
    } }
  ], 'Ask whether the regions\' powers are protected by the constitution.'));

  /* ------------------------------------------------------------------ humangeo.centripetal-centrifugal */
  var CP = ['A national holiday that people in every region celebrate', 'A rail and highway network linking every region to the capital', 'A national team that the whole country cheers for', 'A shared language spoken in every region', 'Respected national courts that treat all regions alike', 'A common outside threat that the whole country faces', 'A national anthem and flag honored across the country'];
  var CF = ['A region with its own language whose people feel ignored by the capital', 'A wealthy region that feels it pays for the rest of the country', 'A remote island region with few ferries and little investment', 'A mountain range that cuts one region off from the rest', 'A region whose people follow a different religion and feel treated unfairly', 'A poor region that feels left behind by the capital'];
  G('humangeo.centripetal-centrifugal', fromBank([
    { L: [1, 2], gen: function (R) {
      var cp = R.coin(), t = R.pick(cp ? CP : CF);
      return { q: t + '. Is this a centripetal or a centrifugal force?', a: cp ? 'Centripetal (it unites)' : 'Centrifugal (it divides)', w: [cp ? 'Centrifugal (it divides)' : 'Centripetal (it unites)'], why: cp ? 'It pulls people toward a shared identity and the center.' : 'It lines up a difference with a region and a grievance, which pulls the state apart.' };
    } },
    { L: [1, 2], q: 'Forces that pull a state together are called…', a: 'centripetal forces', w: ['centrifugal forces', 'devolution', 'gerrymandering'], why: 'Centripetal means "toward the center."' },
    { L: [1, 2], q: 'Forces that can pull a state apart are called…', a: 'centrifugal forces', w: ['centripetal forces', 'sovereignty', 'irredentism'], why: 'Centrifugal means "away from the center."' },
    { L: [2, 3], q: 'When does a cultural difference become a strong centrifugal force?', a: 'When it lines up with a region and a sense of grievance', w: ['Whenever a country has more than one language', 'Only when a country is federal', 'Whenever a country is large'], why: 'Switzerland has four national languages and is stable; difference alone does not divide.' },
    { L: [2, 3], q: 'A common response when centrifugal forces are strong is to transfer some power to the regions. This is called…', a: 'devolution', w: ['annexation', 'reapportionment', 'agglomeration'], why: 'Devolution, such as the Scottish Parliament and Welsh assembly opened in 1999.' },
    { L: [1, 2], q: 'Any difference among a country\'s people is a centrifugal force.', tf: false, why: 'A difference divides when it matches a region and a grievance. Many diverse countries are stable.' },
    { L: [2, 3], q: 'Poor transportation between a region and the capital can be a centrifugal force.', tf: true, why: 'Distance and weak links make it harder to feel part of the whole: a spatial force.' },
    { L: [3], gen: function (R) {
      var a = R.sample(CP, 2), b = R.sample(CF, 2), all = R.shuffle(a.map(function (x) { return [x, true]; }).concat(b.map(function (x) { return [x, false]; })));
      return { q: 'Which are centripetal (uniting) forces?', all: all, why: 'Shared symbols, links and institutions unite; regional grievances divide.' };
    } },
    { L: [3], gen: function (R) {
      var X = R.pick(FAKE), P = R.pick(PEOPLE);
      return { q: 'In ' + X + ', the ' + P + ' live mostly in one northern region, speak their own language, and say the capital spends little there. They ask for their own regional assembly. Which response would be devolution?', a: 'The national government creates an elected ' + P + ' regional assembly with some powers', w: ['The national government adds a national holiday', 'The region joins a supranational organization', 'The national government redraws its sea borders'], why: 'Devolution is handing some power from the center to a region.' };
    } }
  ], 'Uniting forces pull toward the center; dividing forces need a region and a grievance.'));

  /* ------------------------------------------------------------------ humangeo.supranational */
  G('humangeo.supranational', fromBank([
    { L: [1, 2], q: 'What is a supranational organization?', a: 'A group of three or more states that agree to cooperate and share some decisions', w: ['A government of a single large state', 'A company that works in many countries', 'A region inside a country', 'A nation without a state'], why: 'Supranational means above the state: states joined together.' },
    { L: [1, 2], gen: function (R, lv) {
      var O = [['The United Nations', 'peace, security and cooperation among almost all countries'], ['NATO', 'mutual defense: an attack on one member is treated as an attack on all'], ['The European Union', 'a single market and shared laws among 27 European countries'], ['The African Union', 'cooperation, peace and development among the countries of Africa'], ['ASEAN', 'trade and cooperation among the countries of Southeast Asia']];
      var o = R.pick(O), w = O.filter(function (x) { return x !== o; }).map(function (x) { return x[0]; });
      return { q: 'Which organization\'s main purpose is ' + o[1] + '?', a: o[0], w: lv === 1 ? R.sample(w, 2) : w, why: o[0] + ': ' + o[1] + '.' };
    } },
    { L: [1, 2], q: 'How many member states does the United Nations have?', num: 193, why: 'The UN has 193 members; the Holy See and the State of Palestine are observer states.' },
    { L: [2], q: 'How many member states does the European Union have?', num: 27, why: 'The EU has 27 members.', viz: { name: 'gg-map', opts: { region: 'EU', highlight: ['AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD', 'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE'], quiet: true, interactive: false, dots: true, label: 'A map of Europe with the European Union\'s members highlighted.' } } },
    { L: [2, 3], q: 'Put these organizations in order of founding, earliest first.', order: ['United Nations', 'NATO', 'ASEAN', 'African Union'], why: 'UN 1945, NATO 1949, ASEAN 1967, African Union 2002 (it followed the Organization of African Unity of 1963).' },
    { L: [2, 3], q: 'Which organization makes laws that apply directly in every member state?', a: 'The European Union', w: ['ASEAN', 'The African Union', 'NATO'], why: 'EU law applies in every member; the others work mostly by agreement or for defense.' },
    { L: [1, 2], q: 'Joining a supranational organization means a state gives up all of its sovereignty.', tf: false, why: 'Members share some decisions, and how much varies; they keep their own governments and can leave.' },
    { L: [3], gen: function (R) {
      var X = R.sample(FAKE, 8), n = R.int(3, 8);
      var opts = [['A trade bloc of ' + n + ' neighboring countries with a shared secretariat', true], ['A defense alliance of several countries that promise to help each other', true], ['The city council of ' + X[0] + '\'s capital', false], ['The national army of ' + X[1], false], ['A province of ' + X[2], false]];
      return { q: 'Which of these are supranational organizations?', all: opts, why: 'Supranational organizations join several states; a city council, an army or a province belongs to one state.' };
    } }
  ], 'Supranational means several states joined together, sharing some decisions.'));

  /* ------------------------------------------------------------------ humangeo.electoral-geography */
  G('humangeo.electoral-geography', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { // count the seats from voters per district
      var n = 5, size = 100, a;
      do { a = []; for (var i = 0; i < n; i++) a.push(R.pick([R.int(15, 45), R.int(55, 95)])); } while (a.some(function (x) { return x === 50; }));
      var won = a.filter(function (x) { return x > size / 2; }).length, tot = a.reduce(function (s, x) { return s + x; }, 0);
      if (lv < 3) return { q: 'A state has five districts of 100 voters each. Group A\'s voters in the five districts number ' + a.join(', ') + '. Each district elects whoever has more voters. How many districts does group A win?', a: { t: 'num', v: String(won) },
        steps: ['A wins a district when it has more than 50 of the 100 voters.', 'Districts A wins: ' + (a.filter(function (x) { return x > 50; }).join(', ') || 'none') + '.', 'So A wins ' + won + ' of 5 districts.'], hint: 'In each district, is A\'s number more than 50?' };
      var pct = tot / 5;
      return { q: 'Five districts of 100 voters each. Group A\'s voters: ' + a.join(', ') + '. What percent of all voters belong to group A, and how many districts does A win?',
        a: { t: 'multi', parts: [{ label: 'Percent of all voters (%)', a: { t: 'num', v: String(pct), pct: true } }, { label: 'Districts won', a: { t: 'num', v: String(won) } }] },
        steps: ['Total A voters: ' + a.join(' + ') + ' = ' + tot + ' of 500.', 'Share: ' + tot + ' ÷ 500 = ' + pct + '%.', 'Districts with more than 50 A voters: ' + won + '.', 'Seats won ' + (won / 5 * 100 > pct + 15 ? 'run well above' : won / 5 * 100 < pct - 15 ? 'fall well below' : 'are close to') + ' A\'s share of the votes (' + (won * 20) + '% of seats).'], hint: 'Add A\'s voters and divide by 500; then count the districts where A has more than 50.' };
    } },
    { L: [2, 3], gen: function (R) { // the kit's 5 x 5 example: compute seats from the picture's rule
      var plan = R.pick(['packing', 'cracking']);
      var isA = function (r, c) { return c < 2 || (c === 2 && r < 2) || (c === 3 && (r === 2 || r === 3)) || (c === 4 && r === 4); };
      var winsA = 0;
      for (var d = 0; d < 5; d++) { var na = 0; for (var q = 0; q < 5; q++) if (plan === 'packing' ? isA(q, d) : isA(d, q)) na++; if (na >= 3) winsA++; }
      return { q: 'In this picture, each ' + (plan === 'packing' ? 'column' : 'row') + ' of five voters is one district. Group A has 15 of the 25 voters. How many of the 5 districts does group A win?', a: { t: 'num', v: String(winsA) },
        steps: ['Count A voters in each ' + (plan === 'packing' ? 'column' : 'row') + '; A wins a district with 3 or more of its 5 voters.', 'A wins ' + winsA + ' of 5.', plan === 'packing' ? 'A\'s voters are packed into two districts, so A wins only 2 seats with 60% of the voters.' : 'B\'s voters are cracked across all five districts, so B wins none, though it has 40% of the voters.'],
        hint: 'Go district by district and count the A circles.', viz: { name: 'gg-models', opts: { model: 'districts', plan: plan, quiet: true, interactive: false } } };
    } },
    { L: [1, 2], q: 'Drawing district lines to give one group an advantage is called…', a: 'gerrymandering', w: ['reapportionment', 'devolution', 'redistricting by census'], why: 'The word comes from 1812, from Massachusetts Governor Elbridge Gerry and a salamander-shaped district.' },
    { L: [1, 2], gen: function (R) {
      var pk = R.coin();
      return { q: pk ? 'Putting many of the other side\'s voters into a few districts, so they win those by huge margins, is called…' : 'Spreading the other side\'s voters thinly across many districts, so they fall short in each, is called…', a: pk ? 'packing' : 'cracking', w: [pk ? 'cracking' : 'packing', 'reapportionment'], why: pk ? 'Packing wastes the other side\'s votes in a few lopsided districts.' : 'Cracking leaves the other side just short in many districts.' };
    } },
    { L: [1, 2], q: 'After each census, the 435 seats of the U.S. House of Representatives are divided among the states. This is called…', a: 'reapportionment', w: ['gerrymandering', 'devolution', 'secession'], why: 'Reapportionment divides the seats among states; then states redraw district lines (redistricting).' },
    { L: [2], q: 'How many seats are there in the U.S. House of Representatives?', num: 435, why: 'The House has had 435 seats since the Permanent Apportionment Act of 1929.' },
    { L: [1, 2, 3], q: 'A district with an odd, twisting shape must be gerrymandered.', tf: false, why: 'Districts also follow rivers, county lines and equal-population rules; the test is the effect on representation, not the shape alone.' },
    { L: [3], q: 'Which statements about districts and gerrymandering are true?', all: [['Districts are redrawn after each census', true], ['Packing and cracking are two gerrymandering techniques', true], ['A compact, neat map can still favor one side', true], ['Every odd-shaped district is illegal', false], ['Gerrymandering changes how many people vote', false]], why: 'Gerrymandering changes where votes are counted, not how many are cast; shape alone proves nothing.' }
  ], 'Count district by district: a vote beyond what wins a district, or in a lost district, adds no seat.'));

  /* ======================================================================== Unit 5: Agriculture and Rural Land Use */

  /* ------------------------------------------------------------------ humangeo.agricultural-hearths */
  var HEARTH = [
    { n: 'the Fertile Crescent', lon: 42, lat: 35, crops: ['wheat', 'barley', 'lentils', 'sheep and goats'] },
    { n: 'China', lon: 114, lat: 32, crops: ['rice', 'millet', 'pigs'] },
    { n: 'Mesoamerica', lon: -99, lat: 18, crops: ['maize (corn)', 'beans', 'squash'] },
    { n: 'the Andes', lon: -73, lat: -13, crops: ['potatoes', 'quinoa', 'llamas and alpacas'] },
    { n: 'New Guinea', lon: 144, lat: -6, crops: ['taro', 'bananas'] },
    { n: 'the Sahel of Africa', lon: 0, lat: 15, crops: ['sorghum', 'pearl millet', 'African rice'] },
    { n: 'eastern North America', lon: -86, lat: 37, crops: ['sunflower'] }];
  G('humangeo.agricultural-hearths', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) {
      var h = R.pick(HEARTH), c = R.pick(h.crops), w = HEARTH.filter(function (x) { return x !== h; }).map(function (x) { return x.n; });
      return { q: 'Early farmers first domesticated ' + c + ' in which hearth?', a: cap1(h.n), w: (lv === 1 ? R.sample(w, 2) : R.sample(w, 3)).map(cap1), why: cap1(h.n) + ' was the hearth of ' + h.crops.join(', ') + '.' };
    } },
    { L: [2, 3], gen: function (R) {
      var hs = R.sample(HEARTH.slice(0, 6), 4), ask = R.pick(hs), pts = hs.map(function (h, i) { return { lon: h.lon, lat: h.lat, mark: LET[i] }; });
      return mcP(R, 'Which letter marks the farming hearth of ' + ask.n + '?', LET[hs.indexOf(ask)], hs.filter(function (h) { return h !== ask; }).map(function (h) { return LET[hs.indexOf(h)]; }),
        [cap1(ask.n) + ' is at letter ' + LET[hs.indexOf(ask)] + '.', hs.map(function (h, i) { return LET[i] + ': ' + h.n; }).join('; ') + '.'], 'Think about which continent each hearth is on.',
        { name: 'gg-map', opts: { color: 'plain', points: pts, quiet: true, interactive: false, dots: false, disputedNote: false, label: 'A world map with four lettered points.' } });
    } },
    { L: [1, 2], q: 'About when did farming begin?', a: 'About 10,000 to 12,000 years ago', w: ['About 2,000 years ago', 'About 100,000 years ago', 'About 500 years ago', 'About 1 million years ago'], why: 'Farming began about 10,000 to 12,000 years ago, first in the Fertile Crescent.' },
    { L: [1, 2], q: 'Farming was invented once, in one place, and spread from there to the rest of the world.', tf: false, why: 'Farming began independently in several hearths, each with its own crops and animals.' },
    { L: [2, 3], q: 'What is the strongest evidence that farming began independently in the Americas?', a: 'Its crops, such as maize and potatoes, came from wild plants that grew only in the Americas', w: ['American farmers used the same crops as Southwest Asia', 'Farming began in the Americas before anywhere else', 'Wheat was carried across the Atlantic long ago'], why: 'Maize came from teosinte, a wild Mexican grass; potatoes came from wild Andean plants.' },
    { L: [3], q: 'Which crops were first domesticated in the Americas?', all: [['Maize (corn)', true], ['Potatoes', true], ['Squash', true], ['Wheat', false], ['Rice', false], ['Barley', false]], why: 'Maize, beans and squash came from Mesoamerica and potatoes from the Andes; wheat and barley came from the Fertile Crescent and rice from China.' },
    { L: [3], q: 'Put these farming beginnings in order, earliest first.', order: ['Wheat and barley in the Fertile Crescent', 'Maize in Mesoamerica', 'Sorghum and pearl millet in the Sahel'], why: 'Fertile Crescent about 10,000 BC; maize in Mexico about 7000 BC; Sahel crops about 3000-2000 BC.' }
  ], 'Each hearth farmed the wild plants and animals that lived there.'));

  /* ------------------------------------------------------------------ humangeo.agricultural-revolutions */
  var REV = ['the First Agricultural Revolution', 'the Second Agricultural Revolution', 'the Green Revolution'];
  var REVC = [['Wild wheat becomes a planted crop', 0], ['People begin to keep sheep and goats', 0], ['The first farming villages are built', 0],
    ['The Norfolk four-course rotation of wheat, turnips, barley and clover', 1], ['Jethro Tull\'s horse-drawn seed drill (1701)', 1], ['Enclosure of open fields in Britain', 1], ['Selective breeding of sheep and cattle in Britain in the 1700s', 1],
    ['High-yield, short-stemmed rice such as IR8 (1966)', 2], ['New wheat varieties bred in Mexico and planted in India and Pakistan', 2], ['More chemical fertilizer and irrigation in Asia in the 1960s', 2]];
  G('humangeo.agricultural-revolutions', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) {
      var c = R.pick(REVC), w = REV.filter(function (x, i) { return i !== c[1]; });
      return { q: c[0] + ': which agricultural revolution does this belong to?', a: cap1(REV[c[1]]), w: w.map(cap1).concat(lv > 1 ? ['The Industrial Revolution'] : []), why: 'It belongs to ' + REV[c[1]] + [', the start of farming about 10,000 to 12,000 years ago.', ', which began in Britain in the 1700s.', ' of the 1940s to 1970s.'][c[1]] };
    } },
    { L: [1, 2], q: 'In which country did the Second Agricultural Revolution begin, in the 1700s?', a: 'Britain', w: ['China', 'Mexico', 'India', 'Egypt'], why: 'New rotations, the seed drill, enclosure and selective breeding began in Britain.' },
    { L: [1, 2], q: 'When did the Green Revolution take place?', a: 'The 1940s to the 1970s', w: ['The 1700s', 'About 10,000 BC', 'The 1500s'], why: 'It began with wheat research in Mexico in the 1940s and spread through the 1960s and 1970s.' },
    { L: [2, 3], q: 'Why were Green Revolution wheat and rice bred to have short stems?', a: 'So the plants could take more fertilizer and hold heavy heads of grain without falling over', w: ['So they would need no fertilizer at all', 'So they could grow without water', 'So they could be farmed organically'], why: 'Tall plants with heavy heads fall over; short, sturdy stems hold the bigger harvest up.' },
    { L: [2, 3], q: 'How did clover in the Norfolk rotation help farmers?', a: 'It added nitrogen to the soil, so fields no longer had to lie empty (fallow)', w: ['It kept insects away from the wheat', 'It was sold to cities as a cash crop', 'It replaced the need for horses'], why: 'Clover adds nitrogen and feeds animals, so no year was wasted.' },
    { L: [1, 2], q: 'The Green Revolution meant a switch to organic farming.', tf: false, why: 'It meant high-yield seeds with more fertilizer and water.' },
    { L: [2, 3], q: 'The Green Revolution raised harvests and also raised debates about water use, fertilizer runoff and costs for small farmers.', tf: true, why: 'Both the larger harvests and the concerns are part of the record.' },
    { L: [3], q: 'Put these in order, earliest first.', order: ['The first planted barley', 'Jethro Tull\'s seed drill', 'High-yield rice IR8'], why: 'Barley: about 10,000 BC. The seed drill: 1701. IR8: 1966.' },
    { L: [3], q: 'Which describe the Green Revolution?', all: [['High-yield varieties of wheat and rice', true], ['More chemical fertilizer', true], ['More irrigation', true], ['The first domestication of animals', false], ['A ban on fertilizer', false]], why: 'High-yield seeds, fertilizer and water were its three parts.' }
  ], 'First: farming itself. Second: Britain in the 1700s. Green Revolution: high-yield seeds, 1940s-1970s.'));

  /* ------------------------------------------------------------------ humangeo.intensive-extensive */
  var INT = ['A family hand-weeds and floods a one-hectare rice paddy', 'A heated greenhouse grows tomatoes all year', 'A market garden near a city grows vegetables on a few acres', 'A dairy with milking machines keeps 200 cows on a small farm', 'A cattle feedlot fattens thousands of animals in pens'];
  var EXT = ['Cattle graze 20,000 hectares of dry range', 'Herders move goats and camels with the seasons', 'A farmer clears a forest plot, farms it two years, then moves on', 'Sheep graze a huge station in Australia\'s dry interior', 'Two workers with big machines grow wheat on 2,000 hectares'];
  G('humangeo.intensive-extensive', fromBank([
    { L: [1, 2], gen: function (R) {
      var i = R.coin(), t = R.pick(i ? INT : EXT);
      return { q: t + '. Is this intensive or extensive farming?', a: i ? 'Intensive' : 'Extensive', w: [i ? 'Extensive' : 'Intensive'], why: i ? 'Lots of labor or capital on a small area: intensive.' : 'A large area with little input per hectare: extensive.' };
    } },
    { L: [1, 2, 3], gen: function (R, lv) {
      var a1 = R.pick([1, 2, 4, 5]), h1 = a1 * R.pick([400, 600, 800, 1000, 1500]), a2 = R.pick([200, 250, 400, 500, 1000]), h2 = R.pick([2000, 4000, 5000, 6000, 8000]);
      var p1 = h1 / a1, p2 = h2 / a2, sw = R.coin(), F = sw ? ['B', 'A'] : ['A', 'B'];
      if (lv === 1) return { q: 'Farm ' + F[0] + ' works ' + a1 + ' hectare' + (a1 > 1 ? 's' : '') + ' with ' + commas(h1) + ' hours of labor a year. How many hours of labor does it use per hectare?', a: { t: 'num', v: String(p1) }, unit: 'hours',
        steps: ['Divide the hours by the hectares.', commas(h1) + ' ÷ ' + a1 + ' = ' + commas(p1) + ' hours per hectare.'] };
      return mcP(R, 'Farm ' + F[0] + ': ' + a1 + ' hectare' + (a1 > 1 ? 's' : '') + ', ' + commas(h1) + ' hours of labor a year. Farm ' + F[1] + ': ' + commas(a2) + ' hectares, ' + commas(h2) + ' hours a year. Which farm is more labor-intensive?', 'Farm ' + F[0], ['Farm ' + F[1], 'They are equally intensive'],
        ['Farm ' + F[0] + ': ' + commas(h1) + ' ÷ ' + a1 + ' = ' + commas(p1) + ' hours per hectare.', 'Farm ' + F[1] + ': ' + commas(h2) + ' ÷ ' + commas(a2) + ' = ' + fix(p2) + ' hours per hectare.', 'Farm ' + F[1] + ' uses ' + (h2 > h1 ? 'more' : 'fewer') + ' hours in total, but Farm ' + F[0] + ' uses far more per hectare.'], 'Divide each farm\'s hours by its hectares.');
    } },
    { L: [2, 3], q: 'A wheat farm on the Great Plains covers 2,000 hectares and is worked by two people with large machines. Is it intensive or extensive?', a: 'Extensive: the inputs per hectare are small', w: ['Intensive: it uses modern machines', 'Intensive: it is very large', 'Neither: only small farms can be classified'], why: 'Intensive and extensive are about input per unit of land, not size or modern equipment.' },
    { L: [1, 2], q: 'Intensive farming means a large, modern farm.', tf: false, why: 'Intensive means much labor or capital per unit of land: a small hand-worked rice paddy is intensive.' },
    { L: [2, 3], q: 'Why is farming near cities usually more intensive?', a: 'Land near cities costs more, so each acre must produce more', w: ['Soil is always better near cities', 'City people do not eat meat', 'The weather is warmer near cities'], why: 'High land prices push farmers to get more output from each acre.' },
    { L: [3], gen: function (R) {
      var a = R.sample(INT, 2), b = R.sample(EXT, 2), all = R.shuffle(a.map(function (x) { return [x, true]; }).concat(b.map(function (x) { return [x, false]; })));
      return { q: 'Which are examples of intensive farming?', all: all, why: 'Intensive farms put a lot of labor or capital on each unit of land.' };
    } }
  ], 'Divide by the land: input per hectare decides.'));

  /* ------------------------------------------------------------------ humangeo.subsistence-commercial */
  var SC = [ // [case, subsistence?, intensive?]
    ['A family in Bangladesh grows rice on one hectare, working long days and eating most of the harvest', true, true],
    ['A family in southern China grows rice on terraced paddies, mostly for its own meals', true, true],
    ['A farmer in a rainforest clears and burns a small plot, grows food for the family for two years, then moves on', true, false],
    ['Herders in Mongolia move their animals with the seasons and live on their milk and meat', true, false],
    ['A Dutch greenhouse grows peppers for supermarkets across Europe', false, true],
    ['A dairy farm in Wisconsin sells milk to a cheese factory', false, true],
    ['A ranch in Montana raises cattle on thousands of acres for sale', false, false],
    ['A wheat farm on the Canadian Prairies ships grain overseas', false, false]];
  function scLabel(s, i) { return (i ? 'Intensive ' : 'Extensive ') + (s ? 'subsistence' : 'commercial'); }
  G('humangeo.subsistence-commercial', fromBank([
    { L: [1], gen: function (R) {
      var c = R.pick(SC);
      return { q: c[0] + '. Is this subsistence or commercial farming?', a: c[1] ? 'Subsistence' : 'Commercial', w: [c[1] ? 'Commercial' : 'Subsistence'], why: c[1] ? 'The family eats most of what it grows: subsistence.' : 'The products are grown to sell: commercial.' };
    } },
    { L: [2, 3], gen: function (R) {
      var c = R.pick(SC), right = scLabel(c[1], c[2]);
      return { q: c[0] + '. Give it both labels.', a: right, w: [scLabel(!c[1], c[2]), scLabel(c[1], !c[2]), scLabel(!c[1], !c[2])], why: 'Who eats it? ' + (c[1] ? 'The family: subsistence.' : 'Buyers: commercial.') + ' Input per hectare? ' + (c[2] ? 'High: intensive.' : 'Low: extensive.') };
    } },
    { L: [1, 2], q: 'What is subsistence farming?', a: 'Growing food mainly to feed one\'s own family', w: ['Growing crops to sell in distant markets', 'Farming with no machines', 'Farming only in deserts'], why: 'Subsistence farmers eat most of what they grow.' },
    { L: [2, 3], q: 'What is agribusiness?', a: 'Farming linked with the companies that supply seed and machines and that process, ship and sell food', w: ['Farming only for one\'s family', 'Moving herds with the seasons', 'A government farm program'], why: 'Agribusiness ties commercial farms into a chain of businesses.' },
    { L: [2, 3], q: 'Subsistence farming is always extensive.', tf: false, why: 'Shifting cultivation and herding are extensive, but intensive rice farming in Asia is often subsistence too.' },
    { L: [2, 3], q: 'Growing one crop on a large scale is called…', a: 'monoculture', w: ['shifting cultivation', 'pastoral nomadism', 'subsistence farming'], why: 'Monoculture is efficient but can raise risks from pests and price swings.' },
    { L: [3], q: 'Which are kinds of subsistence farming?', all: [['Shifting cultivation (slash-and-burn)', true], ['Pastoral nomadism', true], ['Intensive wet-rice farming for the family', true], ['Plantation farming', false], ['Commercial dairy farming', false]], why: 'Plantations and commercial dairies grow for sale.' }
  ], 'Two questions: who eats it, and how much input per hectare?'));

  /* ------------------------------------------------------------------ humangeo.farming-regions */
  var FCLIM = [['Csa', 'Mediterranean farming (grapes, olives, citrus)'], ['Af', 'Plantations of cocoa, bananas and oil palm'], ['BWh', 'Pastoral nomadism (herding, with oasis farming)'], ['Cfb', 'Dairy farming on green pasture'], ['Dfa', 'Mixed crop and livestock (corn, soybeans, hogs)']];
  var FREG = [['Dry, hot summers and mild, rainy winters', 'Mediterranean farming (grapes, olives, citrus)'], ['Hot and wet all year, in the tropics', 'Plantations (coffee, cocoa, bananas, sugarcane)'],
    ['Cool, humid, good pasture, close to big cities', 'Dairy farming'], ['Wide, semi-arid to humid grassland plains', 'Commercial grain farming (wheat)'], ['Very dry land with scattered grass', 'Pastoral nomadism'], ['Semi-arid land with plenty of cheap space', 'Ranching'], ['Tropical rainforest with poor soils', 'Shifting cultivation']];
  G('humangeo.farming-regions', fromBank([
    { L: [1, 2], gen: function (R, lv) {
      var f = R.pick(FREG), w = FREG.filter(function (x) { return x[1] !== f[1]; }).map(function (x) { return x[1]; });
      return { q: 'Which kind of farming best fits this setting: ' + f[0].toLowerCase() + '?', a: f[1], w: R.sample(w, lv === 1 ? 2 : 3), why: f[0] + ' suits ' + f[1].toLowerCase() + '.' };
    } },
    { L: [2, 3], gen: function (R) {
      var f = R.pick(FCLIM), w = FCLIM.filter(function (x) { return x !== f; }).map(function (x) { return x[1]; });
      var d = GG().CLIMATES[f[0]];
      return { q: 'Read this climograph (temperature and rainfall by month). Which kind of farming fits it best?', a: f[1], w: R.sample(w, 3),
        why: 'This is a ' + d.n.toLowerCase() + ' climate (' + f[0] + '), which suits ' + f[1].charAt(0).toLowerCase() + f[1].slice(1) + '.',
        viz: { name: 'gg-climate', opts: { type: f[0], quiet: true, interactive: false } } };
    } },
    { L: [1, 2], gen: function (R) {
      var P = [['the U.S. Great Plains', 'Commercial grain (wheat)'], ['California\'s Central Valley and the coast of the Mediterranean Sea', 'Mediterranean (grapes, olives, citrus)'], ['Wisconsin and the northeastern United States', 'Dairy'], ['The U.S. Corn Belt (Iowa, Illinois)', 'Mixed crop and livestock'], ['The Sahel and Mongolia', 'Pastoral nomadism'], ['The Amazon Basin', 'Shifting cultivation']];
      var p = R.pick(P), w = P.filter(function (x) { return x !== p; }).map(function (x) { return x[1]; });
      return { q: 'Which farming type is typical of ' + p[0] + '?', a: p[1], w: R.sample(w, 3), why: p[0] + ': ' + p[1].toLowerCase() + '.' };
    } },
    { L: [2, 3], q: 'Two farms have the same cool, wet climate. One is 20 km from a big city; the other is 800 km away. Which is more likely to be a dairy farm, and why?', a: 'The near one: fresh milk is heavy, spoils fast and must reach buyers quickly', w: ['The far one: cows need open space far from people', 'Either one: climate alone decides', 'The far one: land is cheaper there, and milk keeps well'], why: 'Within what climate allows, transport cost and freshness decide.' },
    { L: [1, 2], q: 'With enough work, any crop can grow well anywhere.', tf: false, why: 'Climate and soil set what grows best; markets and transport decide what pays.' },
    { L: [3], q: 'Which crops are typical of Mediterranean farming?', all: [['Grapes', true], ['Olives', true], ['Citrus', true], ['Cocoa', false], ['Rice in flooded paddies', false]], why: 'Grapes, olives and citrus handle the dry summers; cocoa needs year-round tropical rain.' }
  ], 'Start with the climate; then ask what pays to ship to market.'));

  /* ------------------------------------------------------------------ humangeo.von-thunen */
  G('humangeo.von-thunen', fromBank([
    { L: [1, 2], gen: function (R, lv) { // name the ring
      var Z = GG().MODELS.vonthunen.zones, i = R.int(1, 4), w = Z.filter(function (z, j) { return j !== i; });
      return { q: 'In this von Thünen diagram, which land use belongs in the ring marked ?', a: Z[i], w: lv === 1 ? R.sample(w.filter(function (z) { return z !== Z[0]; }), 2) : w.filter(function (z) { return z !== Z[0]; }),
        why: 'From the market out: market gardening and dairy, then forest, then grains and field crops, then ranching. Ring ' + (i + 1) + ' is ' + Z[i].toLowerCase() + '.',
        viz: { name: 'gg-models', opts: { model: 'vonthunen', ask: i, quiet: true, interactive: false } } };
    } },
    { L: [1, 2, 3], gen: function (R, lv) { // rent at a distance
      var Y = R.pick([2, 3, 4, 5]), c = R.pick([80, 100, 120]), p = c + R.pick([40, 60, 80, 100]), f = R.pick([1, 2]), dmax = (p - c) / f, d = R.int(1, M.floor(dmax / 10)) * 10;
      if (d >= dmax) d = dmax - 10;
      var rent = Y * (p - c) - Y * f * d;
      if (lv === 3) return { q: 'A crop yields ' + Y + ' tons per hectare, sells for ' + p + ' and costs ' + c + ' per ton to grow. Hauling costs ' + f + ' per ton per km. In the von Thünen model, how far from market (in km) does the rent for this crop fall to zero?', a: { t: 'num', v: String(dmax) }, unit: 'km',
        steps: ['Rent is zero when $Y(p - c) = Y f d$, so $d = (p - c) / f$.', '$d = (' + p + ' - ' + c + ') / ' + f + ' = ' + dmax + '$ km.', 'Beyond ' + dmax + ' km, growing this crop for the market loses money.'] };
      return { q: 'A crop yields ' + Y + ' tons per hectare, sells for ' + p + ' and costs ' + c + ' per ton to grow. Hauling costs ' + f + ' per ton per km. What is the land rent per hectare at ' + d + ' km from market?', a: { t: 'num', v: String(rent) },
        steps: ['Rent per hectare $= Y(p - c) - Y f d$.', 'Profit before hauling: $' + Y + ' \\times (' + p + ' - ' + c + ') = ' + Y * (p - c) + '$.', 'Hauling: $' + Y + ' \\times ' + f + ' \\times ' + d + ' = ' + Y * f * d + '$.', 'Rent: $' + Y * (p - c) + ' - ' + Y * f * d + ' = ' + rent + '$.'] };
    } },
    { L: [3], gen: function (R) { // which crop wins at a distance
      var d = R.pick([5, 10, 40, 60]);
      var A = { n: 'vegetables', Y: 10, m: 50, f: 2 }, B = { n: 'wheat', Y: 3, m: 80, f: 1 };
      var rA = A.Y * A.m - A.Y * A.f * d, rB = B.Y * B.m - B.Y * B.f * d, win = rA > rB ? A : B;
      return mcP(R, 'At ' + d + ' km from market: vegetables yield 10 tons per hectare with a profit of 50 per ton before hauling, and cost 2 per ton per km to haul. Wheat yields 3 tons per hectare with a profit of 80 per ton before hauling, and costs 1 per ton per km to haul. Which use earns more rent per hectare here?', cap1(win.n), [cap1(win === A ? B.n : A.n), 'They earn exactly the same'],
        ['Vegetables: $10 \\times 50 - 10 \\times 2 \\times ' + d + ' = ' + rA + '$.', 'Wheat: $3 \\times 80 - 3 \\times 1 \\times ' + d + ' = ' + rB + '$.', cap1(win.n) + ' earns more at ' + d + ' km' + (win === A ? ': the costly-to-haul crop wins close to market.' : ': farther out, the cheaper-to-haul crop wins.')], 'Compute the rent for each with $Y(p - c) - Yfd$.');
    } },
    { L: [1, 2], q: 'In the von Thünen model, what makes the land uses form rings?', a: 'The cost of carrying goods to market rises with distance', w: ['Better soil near the town', 'Rainfall that falls in circles', 'Laws that set each ring'], why: 'In the model the land is the same everywhere; transport cost makes the rings.' },
    { L: [1, 2], q: 'Who published the model of farm rings around a market town, in 1826?', a: 'Johann Heinrich von Thünen', w: ['Walter Christaller', 'Alfred Weber', 'Ernest Burgess'], why: 'Von Thünen published The Isolated State in 1826.' },
    { L: [2, 3], q: 'In the von Thünen model, the rings form because soil is richest near the market.', tf: false, why: 'The model assumes the same soil everywhere; transport costs make the rings.' },
    { L: [3], q: 'Put the von Thünen rings in order from the market outward.', order: ['Market gardening and dairy', 'Forest', 'Grains and field crops', 'Ranching'], why: 'Perishable and heavy goods closest; ranching, whose animals walk to market, farthest.' }
  ], 'Rent per hectare = Y(p - c) - Yfd: hauling cost grows with distance.'));

  /* ------------------------------------------------------------------ humangeo.rural-settlement */
  G('humangeo.rural-settlement', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { // township-and-range arithmetic
      var k = lv === 1 ? R.int(0, 1) : R.int(0, 4), n, q, v, st;
      if (k === 0) { n = R.int(2, 9); q = 'One section of the township-and-range survey is 1 square mile, or 640 acres. How many acres are in ' + n + ' sections?'; v = 640 * n; st = [n + ' × 640 = ' + commas(v) + ' acres.']; }
      else if (k === 1) { q = 'A section is 640 acres. How many acres are in a quarter section?'; v = 160; st = ['640 ÷ 4 = 160 acres.']; }
      else if (k === 2) { q = 'A township is 6 miles by 6 miles. How many acres does it hold? (1 square mile = 640 acres)'; v = 23040; st = ['6 × 6 = 36 square miles (36 sections).', '36 × 640 = 23,040 acres.']; }
      else if (k === 3) { n = R.pick([2, 3, 5, 6]); q = 'A farm is ' + n + ' quarter sections. How many acres is it? (1 section = 640 acres)'; v = 160 * n; st = ['A quarter section is 640 ÷ 4 = 160 acres.', n + ' × 160 = ' + commas(v) + ' acres.']; }
      else { q = 'A "quarter-quarter" is one quarter of a quarter section. How many acres is it? (1 section = 640 acres)'; v = 40; st = ['A quarter section is 160 acres.', 'A quarter of that is 160 ÷ 4 = 40 acres.']; }
      return { q: q, a: { t: 'num', v: String(v) }, steps: st };
    } },
    { L: [1, 2], gen: function (R, lv) {
      var S = [['Homes grouped together in a village, with fields around it', 'Clustered'], ['Farmhouses spread far apart, each on its own land', 'Dispersed'], ['Homes strung out in a line along a road, river or canal', 'Linear']];
      var s = R.pick(S);
      return { q: s[0] + '. What is this settlement pattern called?', a: s[1], w: S.filter(function (x) { return x !== s; }).map(function (x) { return x[1]; }).concat(lv > 1 ? ['Perforated'] : []), why: 'Clustered: grouped; dispersed: spread out; linear: along a line.' };
    } },
    { L: [1, 2, 3], gen: function (R, lv) {
      var S = [['Boundaries follow natural features and distances, such as "from the oak tree to the creek"', 'Metes and bounds', 'the original thirteen colonies'],
        ['A grid of townships 6 miles square, each with 36 sections of 1 square mile', 'Township and range', 'most land west of the Appalachians'],
        ['Narrow lots that front a river and run far back from it', 'Long lots', 'French settlements along the St. Lawrence and in Louisiana']];
      var s = R.pick(S), w = S.filter(function (x) { return x !== s; }).map(function (x) { return x[1]; });
      if (lv === 3) return { q: 'Which land survey system shaped the farms of ' + s[2] + '?', a: s[1], w: w, why: s[1] + ': ' + s[0].charAt(0).toLowerCase() + s[0].slice(1) + '.' };
      var i = S.indexOf(s);
      return { q: lv === 1 ? s[0] + '. Which survey system is this?' : 'In this diagram, which survey system is the one marked ?', a: s[1], w: w, why: s[1] + ': ' + s[0].charAt(0).toLowerCase() + s[0].slice(1) + '.',
        viz: lv === 1 ? undefined : { name: 'gg-models', opts: { model: 'survey', ask: i, quiet: true, interactive: false } } };
    } },
    { L: [1, 2], q: 'Which 1785 law set up the township-and-range survey of U.S. western lands?', a: 'The Land Ordinance of 1785', w: ['The Homestead Act', 'The Constitution', 'The Louisiana Purchase'], why: 'The Land Ordinance of 1785 had the government survey western lands into squares before selling them.' },
    { L: [1, 2], q: 'Square farm fields in Iowa are a natural pattern of the land.', tf: false, why: 'The squares come from the township-and-range survey set up by the Land Ordinance of 1785.' },
    { L: [3], q: 'Which statements are true?', all: [['A township has 36 sections', true], ['A section is 640 acres', true], ['Long lots front a river', true], ['Metes and bounds uses a perfect square grid', false], ['Dispersed settlement means homes grouped in a village', false]], why: 'Metes and bounds follows natural features; dispersed homes are spread out.' }
  ], 'Section = 640 acres; township = 36 sections; quarter section = 160 acres.'));

  /* ------------------------------------------------------------------ humangeo.food-debates */
  var FACTS = ['Organic crop yields average lower than conventional yields', 'A census tract is more than 1 mile from the nearest supermarket', 'Herbicide-resistant weeds have spread in some regions', 'Some GM crops are bred to resist insects', 'Organic farms do not use synthetic fertilizer', 'The price of a food rose 10% this year'];
  var VALUES = ['Lower food prices matter more than farm jobs', 'Every food with GM ingredients should carry a label', 'Small family farms are a better way of life', 'Organic food is worth its higher price', 'Local food is always the better choice'];
  G('humangeo.food-debates', fromBank([
    { L: [1, 2], gen: function (R) {
      var f = R.coin(), t = R.pick(f ? FACTS : VALUES);
      return { q: '"' + t + '." Is this a fact that evidence can check, or a value judgment?', a: f ? 'A fact that evidence can check' : 'A value judgment', w: [f ? 'A value judgment' : 'A fact that evidence can check'], why: f ? 'It can be measured or checked against records.' : 'It depends on what a person values; careful people can disagree.' };
    } },
    { L: [2, 3], gen: function (R) { // apply the food-desert test
      var urban = R.coin(), pop = R.pick([1200, 1500, 2400, 3000, 4000, 6000]), far = R.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), n = M.round(pop * far);
      var meets = n >= 500 || n / pop >= 1 / 3;
      return { q: 'A low-income ' + (urban ? 'urban' : 'rural') + ' census tract has ' + commas(pop) + ' people, and ' + commas(n) + ' of them live more than ' + (urban ? '1 mile' : '10 miles') + ' from a supermarket. Does it meet the USDA food-desert test (at least 500 people or at least a third of the people living that far away)?', a: meets ? 'Yes' : 'No', w: [meets ? 'No' : 'Yes'],
        why: commas(n) + (n >= 500 ? ' is at least 500' : ' is less than 500') + ', and ' + commas(n) + ' ÷ ' + commas(pop) + ' = ' + M.round(n / pop * 100) + '%, ' + (n / pop >= 1 / 3 ? 'at least' : 'less than') + ' a third. ' + (meets ? 'It meets the test.' : 'It meets neither part of the test.') };
    } },
    { L: [1, 2], q: 'What did major science reviews, such as the U.S. National Academies\' 2016 report, find about eating approved GM foods?', a: 'They are no riskier to eat than conventional foods', w: ['They are much riskier to eat than conventional foods', 'They have never been studied', 'They are banned everywhere'], why: 'The reviews found no substantiated health risks from approved GM foods; debates continue about other issues, such as patents, resistant weeds and labeling.' },
    { L: [1, 2, 3], gen: function (R, lv) {
      var D = [['organic farming', 'No synthetic pesticides or fertilizers and attention to soil health', 'Lower yields, so more land is needed for the same food'],
        ['GM crops', 'Higher yields and less insecticide on some crops', 'Seed patents and the power of a few companies'],
        ['large farms', 'Lower cost per unit of food', 'Fewer farm jobs and effects on rural towns'],
        ['small, local farms', 'Local jobs and fresh food', 'Higher cost per unit of food']];
      var d = R.pick(D), forQ = R.coin(), right = forQ ? d[1] : d[2], w = D.filter(function (x) { return x !== d; }).map(function (x) { return forQ ? x[1] : x[2]; });
      if (lv > 1) w = w.concat([forQ ? d[2] : d[1]]);
      return { q: 'Which is an argument often made <b>' + (forQ ? 'for' : 'against') + '</b> ' + d[0] + '?', a: right, w: R.sample(w, lv === 1 ? 2 : 3), why: 'For ' + d[0] + ': ' + d[1].toLowerCase() + '. Against: ' + d[2].toLowerCase() + '.' };
    } },
    { L: [1, 2], q: 'Organic farms, on average, grow more food per acre than conventional farms.', tf: false, why: 'Studies find organic yields average roughly 20% lower.' },
    { L: [2, 3], q: 'On food questions, scientific findings, costs and values can point in different directions.', tf: true, why: 'That is why careful people end up on different sides of these debates.' },
    { L: [3], gen: function (R) {
      var a = R.sample(FACTS, 3), b = R.sample(VALUES, 2), all = R.shuffle(a.map(function (x) { return [x, true]; }).concat(b.map(function (x) { return [x, false]; })));
      return { q: 'Which of these are facts that evidence can check (not value judgments)?', all: all, why: 'Facts can be measured; value judgments depend on what people care about.' };
    } }
  ], 'Separate what evidence can check from what values decide.'));

  /* ======================================================================== Unit 6: Cities and Urban Land Use */

  /* ------------------------------------------------------------------ humangeo.urbanization */
  G('humangeo.urbanization', fromBank([
    { L: [1, 2], gen: function (R) { // urban share
      var tot = R.pick([10, 20, 25, 40, 50, 80]) * 1e6, share = R.pick([20, 30, 35, 45, 55, 60, 65, 70, 75, 80]), urb = tot * share / 100;
      return { q: 'A country has ' + commas(tot) + ' people, and ' + commas(urb) + ' of them live in urban areas. What percent of its people are urban?', a: { t: 'num', v: String(share), pct: true },
        steps: ['Urban share = urban population ÷ total population.', commas(urb) + ' ÷ ' + commas(tot) + ' = ' + share / 100 + ' = ' + share + '%.'] };
    } },
    { L: [2, 3], gen: function (R) { // did it urbanize?
      var u1 = R.pick([3, 4, 5, 6]), t1 = R.pick([10, 12, 15]), u2 = u1 + R.pick([1, 2, 3]), t2 = t1 + R.pick([2, 3, 5, 8]);
      var s1 = u1 / t1, s2 = u2 / t2; if (M.abs(s1 - s2) < 0.01) { t2 += 3; s2 = u2 / t2; }
      var up = s2 > s1;
      return mcP(R, 'A country\'s urban population grew from ' + u1 + ' million to ' + u2 + ' million, while its total population grew from ' + t1 + ' million to ' + t2 + ' million. Did it urbanize (did its urban share rise)?',
        up ? 'Yes: its urban share rose' : 'No: its urban share fell, even though cities grew', [up ? 'No: its urban share fell, even though cities grew' : 'Yes: its urban share rose', 'You cannot tell without the land area'],
        ['Before: ' + u1 + ' ÷ ' + t1 + ' = ' + M.round(s1 * 1000) / 10 + '% urban.', 'After: ' + u2 + ' ÷ ' + t2 + ' = ' + M.round(s2 * 1000) / 10 + '% urban.', up ? 'The share rose, so it urbanized.' : 'The share fell. Urbanization is about the share, not the size of cities.'], 'Compare the urban share before and after.');
    } },
    { L: [1, 2], q: 'What is urbanization?', a: 'Growth in the share of a population living in urban areas', w: ['Growth in the number of farms', 'The spread of one city\'s culture', 'Moving a capital city', 'The growth of a single neighborhood'], why: 'Urbanization is about the share of people in cities.' },
    { L: [1, 2], q: 'By countries\' own definitions, about what share of the world\'s people lived in urban areas in 2018 (UN World Urbanization Prospects 2018)?', a: 'About 55%', w: ['About 15%', 'About 30%', 'About 90%'], why: 'About 30% in 1950, about 55% in 2018, and about 68% projected for 2050.' },
    { L: [2, 3], q: 'About what share of the world\'s people did the UN (World Urbanization Prospects 2018) project would be urban by 2050?', a: 'About 68%', w: ['About 30%', 'About 55%', 'About 95%'], why: 'The 2018 revision projected about 68% urban by 2050.' },
    { L: [1, 2], q: 'In which world regions is urbanization fastest today?', a: 'Africa and Asia', w: ['Europe and North America', 'Australia and Antarctica', 'Europe and South America'], why: 'Most urban growth now is in Africa and Asia; many rich countries are already highly urbanized.' },
    { L: [2, 3], q: 'In the UN\'s World Urbanization Prospects 2025, which used a new uniform way of measuring cities, which urban area was the largest?', a: 'Jakarta (nearly 42 million)', w: ['Tokyo (about 33 million)', 'Dhaka (almost 40 million)', 'New York (about 20 million)'], why: 'By the 2025 method: Jakarta nearly 42 million, Dhaka almost 40 million, Tokyo about 33 million. Older lists, using each country\'s own boundaries, put Tokyo first.' },
    { L: [1, 2], q: 'Most of today\'s largest and fastest-growing cities are in rich countries.', tf: false, why: 'Most are in Asia and Africa.' },
    { L: [3], q: 'Which are ways cities grow?', all: [['People move in from the countryside', true], ['Natural increase (more births than deaths)', true], ['Nearby villages are counted as part of the city', true], ['The national population shrinks', false], ['Farms near the city get larger', false]], why: 'Migration, natural increase and reclassification make cities grow.' }
  ], 'Urbanization is a share: urban population ÷ total population.'));

  /* ------------------------------------------------------------------ humangeo.city-site-situation */
  var SITE = ['It stands on an island in a river, easy to defend', 'It has a deep, sheltered harbor', 'It was built on a hill above the plain', 'It grew up beside a spring of fresh water', 'It sits where the river is shallow enough to cross'];
  var SITU = ['It lies on one of the world\'s busiest shipping routes', 'Railroads from the east and the west meet there', 'A canal linked it to the farm country of the interior', 'It is halfway between two large markets', 'It is the hub of the country\'s highway network'];
  G('humangeo.city-site-situation', fromBank([
    { L: [1, 2], gen: function (R) {
      var s = R.coin(), t = R.pick(s ? SITE : SITU);
      return { q: '"' + t + '." Does this describe a city\'s site or its situation?', a: s ? 'Site' : 'Situation', w: [s ? 'Situation' : 'Site'], why: s ? 'It describes the land the city stands on: its site.' : 'It describes the city\'s location relative to other places: its situation.' };
    } },
    { L: [1, 2], q: 'What is a city\'s <b>situation</b>?', a: 'Its location relative to other places, such as trade routes and markets', w: ['The physical land it stands on', 'Its population', 'Its climate', 'The shape of its streets'], why: 'Situation is relative location; site is the land itself.' },
    { L: [2, 3], gen: function (R) {
      var C = [['Singapore', 'It lies on the Strait of Malacca, a main shipping route between the Indian and Pacific oceans', 'It is a small island with a good harbor'],
        ['New York', 'The Erie Canal (1825) linked it to the Great Lakes and the Midwest', 'It has a deep, sheltered harbor'],
        ['Paris', 'It is the center of France\'s roads and railroads', 'It began on an island in the Seine, easy to defend'],
        ['Chicago', 'Water routes and railroads met there, linking East and West', 'It stands on flat land by Lake Michigan']];
      var c = R.pick(C), askSitu = R.coin();
      return { q: 'Which statement describes the <b>' + (askSitu ? 'situation' : 'site') + '</b> of ' + c[0] + '?', a: askSitu ? c[1] : c[2], w: [askSitu ? c[2] : c[1], 'It has a large population'], why: 'Site is the land itself; situation is location relative to other places.' };
    } },
    { L: [2, 3], q: 'The Erie Canal (1825) linked New York City to the Great Lakes. What did it change?', a: 'The city\'s situation', w: ['The city\'s site', 'The city\'s climate', 'Neither'], why: 'The land under the city did not change; its connections to the interior did.' },
    { L: [1, 2, 3], q: 'A city stays important only because of the reason it was first built there.', tf: false, why: 'Many cities grew past their first reason for being; situation often matters more over time.' },
    { L: [3], gen: function (R) {
      var a = R.sample(SITU, 2), b = R.sample(SITE, 2), all = R.shuffle(a.map(function (x) { return [x, true]; }).concat(b.map(function (x) { return [x, false]; })));
      return { q: 'Which describe a city\'s situation (not its site)?', all: all, why: 'Situation is about connections to other places; site is the land itself.' };
    } }
  ], 'Site is the land; situation is the connections.'));

  /* ------------------------------------------------------------------ humangeo.central-place */
  var LOW = ['groceries', 'gasoline', 'a coffee shop', 'a hair salon', 'a convenience store'], HIGH = ['a heart surgeon', 'a major-league sports team', 'an international airport', 'a symphony orchestra', 'a luxury car dealer'];
  G('humangeo.central-place', fromBank([
    { L: [2, 3], gen: function (R, lv) { // threshold met within the range?
      var r = R.pick([3, 4, 5, 6, 8, 10]), dens = R.pick([20, 40, 50, 80, 100, 150]), people = M.PI * r * r * dens, thr = R.pick([0.7, 0.85, 1.15, 1.4]) * people;
      thr = M.round(thr / 500) * 500; var ok = people >= thr;
      if (lv === 3) return { q: 'People will travel up to ' + r + ' km to a shop (its range), and ' + dens + ' people live in each square km around the town. About how many people live within the range? (Use a circle; $\\pi \\approx 3.14$.)', a: { t: 'num', v: String(M.round(people)), rtol: 0.02 },
        steps: ['Area of the market: $\\pi r^2 \\approx 3.14 \\times ' + r + '^2 = ' + r2(3.14 * r * r) + '$ square km.', 'People: area × density $\\approx ' + r2(3.14 * r * r) + ' \\times ' + dens + ' \\approx ' + commas(M.round(3.14 * r * r * dens)) + '$.'] };
      return { q: 'A store needs ' + commas(thr) + ' customers to stay open (its threshold). People will travel up to ' + r + ' km to it (its range). The area around the town has ' + dens + ' people per square km. Is the threshold met? (Use a circle of radius ' + r + ' km.)', a: ok ? 'Yes' : 'No', w: [ok ? 'No' : 'Yes'],
        why: 'People within range: $\\pi \\times ' + r + '^2 \\times ' + dens + ' \\approx ' + commas(M.round(people)) + '$, which is ' + (ok ? 'more' : 'less') + ' than the threshold of ' + commas(thr) + '.' };
    } },
    { L: [1, 2], gen: function (R) {
      var th = R.coin();
      return { q: th ? 'In central place theory, the minimum number of customers a good or service needs to stay in business is its…' : 'In central place theory, the farthest distance people will travel to buy a good or service is its…', a: th ? 'threshold' : 'range', w: [th ? 'range' : 'threshold', 'hinterland', 'situation'], why: th ? 'Threshold counts customers.' : 'Range measures distance.' };
    } },
    { L: [1, 2], gen: function (R) {
      var hi = R.coin(), g = R.pick(hi ? HIGH : LOW);
      return { q: 'Is ' + g + ' a low-order or a high-order good or service?', a: hi ? 'High-order: large threshold and long range' : 'Low-order: small threshold and short range', w: [hi ? 'Low-order: small threshold and short range' : 'High-order: large threshold and long range'], why: hi ? 'It needs a very large market, so only big cities have it.' : 'It needs few customers and is found almost everywhere.' };
    } },
    { L: [2, 3], q: 'A new movie theater draws customers from 30 km away but closes because there are too few of them. What was the problem?', a: 'Its threshold was not met', w: ['Its range was too short', 'Its site was too hilly', 'It was a low-order service'], why: 'The range (30 km) was large; the number of customers was too small for the threshold.' },
    { L: [2, 3], q: 'Why did Christaller draw market areas as hexagons?', a: 'Hexagons cover a plain with no gaps and no overlaps', w: ['Real towns are built in hexagons', 'Circles were too hard to draw', 'Hexagons show the range of every good'], why: 'Circles either overlap or leave gaps; hexagons fit together exactly.' },
    { L: [1, 2], q: 'Who developed central place theory, in a 1933 study of towns in southern Germany?', a: 'Walter Christaller', w: ['Johann Heinrich von Thünen', 'Alfred Weber', 'Homer Hoyt'], why: 'Walter Christaller, 1933.' },
    { L: [3], q: 'Put these central places in order from the most numerous to the fewest.', order: ['Hamlets', 'Villages', 'Towns', 'Cities'], why: 'Central place theory predicts many small places with low-order goods and a few large ones with high-order goods.' }
  ], 'Threshold: how many customers. Range: how far they will go.'));

  /* ------------------------------------------------------------------ humangeo.rank-size */
  G('humangeo.rank-size', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) {
      var P1 = R.pick([12, 24, 36, 48, 60, 72, 120]) * 100000, n = R.int(2, 6);
      if (lv === 3 && R.coin()) { var Pn = P1 / n; return { q: 'If the rank-size rule holds and a country\'s city of rank ' + n + ' has ' + commas(Pn) + ' people, about how many people live in its largest city?', a: { t: 'num', v: String(P1) },
        steps: ['The city of rank $n$ has about $1/n$ of the largest city.', 'So the largest city has about $n$ times as many: $' + n + ' \\times ' + commas(Pn) + ' = ' + commas(P1) + '$.'] }; }
      return { q: 'A country\'s largest city has ' + commas(P1) + ' people. If the rank-size rule holds, about how many people live in its city of rank ' + n + '?', a: { t: 'num', v: String(P1 / n) },
        steps: ['The city of rank ' + n + ' has about $1/' + n + '$ the population of the largest.', '$' + commas(P1) + ' \\div ' + n + ' = ' + commas(P1 / n) + '$.'] };
    } },
    { L: [1, 2, 3], gen: function (R) {
      var a = R.pick([2, 3, 4, 5, 6, 8, 10]), b = R.pick([0.8, 1, 1.5, 2, 2.5, 3, 4]); if (M.abs(a - 2 * b) < 0.3) b = b + 0.5;
      var prim = a > 2 * b;
      return { q: 'A country\'s largest city has ' + a + ' million people and its second-largest has ' + b + ' million. Is the largest a primate city (more than twice the second)?', a: prim ? 'Yes' : 'No', w: [prim ? 'No' : 'Yes'], why: 'Twice the second city: $2 \\times ' + b + ' = ' + fix(2 * b) + '$ million. ' + a + ' million is ' + (prim ? 'more' : 'not more') + ' than that, so ' + (prim ? 'it is' : 'it is not') + ' a primate city.' };
    } },
    { L: [2, 3], gen: function (R) {
      var top = R.pick([600, 900, 1200]), k = R.int(2, 5);
      return { q: 'The chart shows a country that follows the rank-size rule, with ' + commas(top * 1000) + ' people in its largest city. About how many people live in the city of rank ' + k + '?', a: { t: 'num', v: String(top * 1000 / k) },
        steps: ['Rank ' + k + ' should have about $1/' + k + '$ of the largest.', '$' + commas(top * 1000) + ' \\div ' + k + ' = ' + commas(top * 1000 / k) + '$.'], viz: { name: 'gg-models', opts: { model: 'ranksize', top: top, quiet: true, interactive: false } } };
    } },
    { L: [1, 2], q: 'What is a primate city?', a: 'A city more than twice as large as the next largest city in its country', w: ['The oldest city in a country', 'The capital of a federal state', 'A city with exactly half the people of the largest', 'Any city of more than 10 million'], why: 'Mark Jefferson named the pattern in 1939.' },
    { L: [1, 2, 3], q: 'Every country follows the rank-size rule.', tf: false, why: 'Countries with a primate city, such as the United Kingdom (London) or Thailand (Bangkok), break it.' },
    { L: [2, 3], q: 'Which country is a classic example of a primate city pattern?', a: 'Thailand, with Bangkok', w: ['The United States, with New York', 'Germany, with Berlin', 'India, with Mumbai'], why: 'Bangkok is many times larger than any other Thai city; the U.S., Germany and India have several large cities.' }
  ], 'Rank n has about 1/n of the largest city.'));

  /* ------------------------------------------------------------------ humangeo.urban-models */
  var UM = [['concentric', 'The concentric zone model', 'rings of land use around the central business district', 'Ernest Burgess (1925)'], ['sector', 'The sector model', 'wedges of land use that follow transportation lines outward', 'Homer Hoyt (1939)'], ['nuclei', 'The multiple nuclei model', 'several centers, each with related land uses around it', 'Chauncy Harris and Edward Ullman (1945)']];
  G('humangeo.urban-models', fromBank([
    { L: [1, 2], gen: function (R) {
      var m = R.pick(UM), w = UM.filter(function (x) { return x !== m; }).map(function (x) { return x[1]; });
      return { q: 'Which model of the North American city shows ' + m[2] + '?', a: m[1], w: w.concat(['The von Thünen model']), why: m[1] + ', by ' + m[3] + ', shows ' + m[2] + '.' };
    } },
    { L: [1, 2], gen: function (R) {
      var m = R.pick(UM), w = UM.filter(function (x) { return x !== m; }).map(function (x) { return x[3]; });
      return { q: 'Who proposed ' + m[1].charAt(0).toLowerCase() + m[1].slice(1) + '?', a: m[3], w: w.concat(['Walter Christaller (1933)']), why: m[1] + ': ' + m[3] + '.' };
    } },
    { L: [2, 3], gen: function (R, lv) { // name a numbered zone of a model picture
      var key = R.pick(['concentric', 'sector']), Z = GG().MODELS[key].zones, i = R.int(1, Z.length - 1);
      return { q: 'In this diagram of the ' + (key === 'concentric' ? 'concentric zone' : 'sector') + ' model, what is the zone marked ?', a: Z[i], w: Z.filter(function (z, j) { return j !== i; }).slice(0, 4),
        why: 'In the ' + (key === 'concentric' ? 'concentric zone' : 'sector') + ' model, zone ' + (i + 1) + ' is ' + Z[i].toLowerCase() + '.', viz: { name: 'gg-models', opts: { model: key, ask: i, quiet: true, interactive: false } } };
    } },
    { L: [2, 3], gen: function (R) {
      var C = [['A city\'s wealthy neighborhoods form a long wedge from downtown along a lakeshore drive, and factories line the railroad on the other side.', 'The sector model'],
        ['A metro area has its old downtown, an office cluster by the airport, and a university district with its own shops.', 'The multiple nuclei model'],
        ['Around downtown lies an old, crowded zone of newcomers, then rings of working-class, middle-class and commuter homes.', 'The concentric zone model']];
      var c = R.pick(C);
      return { q: c[0] + ' Which model fits best?', a: c[1], w: C.filter(function (x) { return x !== c; }).map(function (x) { return x[1]; }), why: 'Rings: concentric. Wedges along routes: sector. Several centers: multiple nuclei.' };
    } },
    { L: [1, 2], q: 'A model of a city describes one real city exactly.', tf: false, why: 'Models are simplified patterns; each fits some cities and parts of cities better than others.' },
    { L: [2, 3], q: 'Large office and shopping centers that grow at highway interchanges far from downtown are called…', a: 'edge cities', w: ['central business districts', 'primate cities', 'zones in transition'], why: 'Joel Garreau named them edge cities in 1991.' },
    { L: [3], q: 'Put the three classic North American urban models in order of when they were published.', order: ['Concentric zone (Burgess)', 'Sector (Hoyt)', 'Multiple nuclei (Harris and Ullman)'], why: 'Burgess 1925, Hoyt 1939, Harris and Ullman 1945.' }
  ], 'Rings, wedges, or several centers?'));

  /* ------------------------------------------------------------------ humangeo.global-city-models */
  var GCM = [['the Latin American city model', 'a wealthy spine along a grand boulevard from the CBD and squatter settlements at the edge', 'Ernst Griffin and Larry Ford (1980)'],
    ['the sub-Saharan African city model', 'three CBDs: a colonial one, a traditional one and an open-air market', 'Harm de Blij'],
    ['the Southeast Asian city model', 'the old colonial port as its focus, with commercial, government and market-garden zones around it', 'T. G. McGee (1967)']];
  G('humangeo.global-city-models', fromBank([
    { L: [1, 2], gen: function (R) {
      var m = R.pick(GCM), w = GCM.filter(function (x) { return x !== m; }).map(function (x) { return cap1(x[0]); });
      return { q: 'Which model shows ' + m[1] + '?', a: cap1(m[0]), w: w.concat(['The concentric zone model']), why: cap1(m[0]) + ' (' + m[2] + ') shows ' + m[1] + '.' };
    } },
    { L: [2, 3], gen: function (R) {
      var Z = GG().MODELS.latin.zones, i = R.pick([1, 2, 3, 4]);
      return { q: 'In this Latin American city model, what is the zone marked ?', a: Z[i], w: Z.filter(function (z, j) { return j !== i && j < 5; }).slice(0, 3), why: 'The zone marked ? (number ' + (i + 1) + ' in the key) is the ' + Z[i].toLowerCase() + '.', viz: { name: 'gg-models', opts: { model: 'latin', ask: i, quiet: true, interactive: false } } };
    } },
    { L: [1, 2], q: 'In the Latin American city model, where are the newest and poorest settlements?', a: 'At the outer edge of the city', w: ['Beside the CBD, along the spine', 'In the zone of maturity', 'Downtown, in the market'], why: 'Peripheral squatter settlements form at the edge.' },
    { L: [1, 2], q: 'In the Latin American city model, where do many wealthy families live?', a: 'Near the center, along the elite spine', w: ['In outer suburbs, as in many U.S. cities', 'In squatter settlements', 'In the industrial sector'], why: 'The elite spine runs out from the CBD along a main boulevard.' },
    { L: [2, 3], q: 'What does "in situ accretion" mean in the Latin American city model?', a: 'Homes are improved bit by bit where they stand, as residents add rooms, water and power', w: ['Homes are torn down and replaced by towers', 'People move from the center to the suburbs', 'The city grows by annexing villages'], why: '"In situ" means in place; "accretion" means growing by additions.' },
    { L: [1, 2, 3], q: 'The U.S. pattern, with the wealthy moving to outer suburbs, fits cities everywhere.', tf: false, why: 'In many Latin American cities the wealthy live near the center along a main boulevard, and the poorest live at the edges.' },
    { L: [3], q: 'Which are features of the Latin American city model?', all: [['A spine with an elite residential sector', true], ['Peripheral squatter settlements', true], ['A zone of maturity', true], ['Three separate CBDs', false], ['An old colonial port as the focus', false]], why: 'Three CBDs belong to the African model; the colonial port to the Southeast Asian model.' }
  ], 'Read each city with the model built for its region.'));

  /* ------------------------------------------------------------------ humangeo.urban-challenges */
  var CH = ['Houses spreading over farmland far from jobs', 'Rents rising faster than wages', 'Homes built without permits on a hillside at the city\'s edge', 'Long traffic jams on the commute', 'Neighborhoods sharply divided by income'];
  var RS = ['A light-rail line with homes and shops around its stations', 'A neighborhood designed so shops and schools are a short walk away', 'A line around the city beyond which new subdivisions are limited', 'Turning old warehouses into apartments', 'Bringing water and electricity to an informal settlement'];
  G('humangeo.urban-challenges', fromBank([
    { L: [1, 2], gen: function (R) {
      var c = R.coin(), t = R.pick(c ? CH : RS);
      return { q: '"' + t + '." Is this an urban challenge or a response to one?', a: c ? 'A challenge' : 'A response', w: [c ? 'A response' : 'A challenge'], why: c ? 'It is a problem growing cities face.' : 'It is a way cities try to meet a challenge.' };
    } },
    { L: [1, 2, 3], gen: function (R, lv) {
      var T = [['an urban growth boundary', 'It protects farmland and encourages transit and infill', 'It limits land for building, which can raise housing prices'],
        ['new urbanism', 'It makes walkable streets with shops near homes', 'Some projects become high-priced enclaves'],
        ['public transit', 'It moves many people in little space and helps those without cars', 'It is expensive to build and works best at high density'],
        ['redevelopment of old neighborhoods', 'It brings new investment, jobs and housing', 'It can displace long-time residents']];
      var t = R.pick(T), forQ = R.coin(), right = forQ ? t[1] : t[2], w = T.filter(function (x) { return x !== t; }).map(function (x) { return forQ ? x[1] : x[2]; });
      if (lv > 1) w.push(forQ ? t[2] : t[1]);
      return { q: 'Which is a point often made by <b>' + (forQ ? 'supporters' : 'critics') + '</b> of ' + t[0] + '?', a: right, w: R.sample(w, lv === 1 ? 2 : 3), why: 'Supporters: ' + t[1].charAt(0).toLowerCase() + t[1].slice(1) + '. Critics: ' + t[2].charAt(0).toLowerCase() + t[2].slice(1) + '.' };
    } },
    { L: [1, 2], q: 'What is gentrification?', a: 'Higher-income residents and investment moving into an older, lower-income neighborhood', w: ['Low-density growth spreading outward', 'Building a new town on farmland', 'A city annexing its suburbs'], why: 'The sociologist Ruth Glass coined the word in 1964, describing London.' },
    { L: [1, 2], q: 'What is urban sprawl?', a: 'Low-density growth spreading outward from a city', w: ['Crowding in the central business district', 'The growth of informal settlements', 'Building taller towers downtown'], why: 'Sprawl is spread-out, low-density growth, usually built around cars.' },
    { L: [2, 3], q: 'Gentrification is simply good or simply bad.', tf: false, why: 'It can bring investment and also raise rents for long-time residents; people disagree about how to weigh the two.' },
    { L: [2], q: 'About how many people lived in slums or informal settlements worldwide in 2022, by UN-Habitat\'s estimate?', a: 'About 1.1 billion', w: ['About 11 million', 'About 110 million', 'About 5 billion'], why: 'About 1.1 billion, mostly in fast-growing cities of Africa and Asia.' },
    { L: [3], q: 'Which are responses that cities use for urban challenges?', all: [['Public transit', true], ['New urbanism', true], ['Smart growth', true], ['Urban sprawl', false], ['Traffic congestion', false]], why: 'Sprawl and congestion are challenges; transit, new urbanism and smart growth are responses.' }
  ], 'Each response trades one good against another: name both sides.'));

  /* ======================================================================== Unit 7: Industry and Development */

  /* ------------------------------------------------------------------ humangeo.economic-sectors */
  var SECT = ['Primary', 'Secondary', 'Tertiary', 'Quaternary', 'Quinary'];
  var JOBS = [['a wheat farmer', 0], ['a copper miner', 0], ['a logger', 0], ['a shrimp fisher', 0], ['an oil-well driller', 0],
    ['a worker on a car assembly line', 1], ['a steelworker', 1], ['a construction worker building houses', 1], ['a worker in a textile mill', 1], ['a worker in a cannery', 1],
    ['a nurse', 2], ['a truck driver', 2], ['a cashier at a grocery store', 2], ['a teacher', 2], ['a waiter', 2], ['an accountant at a car company', 2],
    ['a software developer', 3], ['a research scientist', 3], ['a financial analyst', 3], ['a designer of new car models', 3],
    ['the chief executive of a global company', 4], ['a senior government official who sets national policy', 4]];
  G('humangeo.economic-sectors', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) {
      var j = lv === 1 ? R.pick(JOBS.filter(function (x) { return x[1] < 3; })) : R.pick(JOBS), w = SECT.filter(function (x, i) { return i !== j[1]; });
      if (lv === 1) w = w.filter(function (x) { return x === 'Primary' || x === 'Secondary' || x === 'Tertiary'; });
      return { q: 'Which sector of the economy does ' + j[0] + ' work in?', a: SECT[j[1]], w: lv === 1 ? w : R.sample(w, 3), why: cap1(j[0]) + ' ' + ['takes resources from the earth: primary', 'makes things: secondary', 'provides a service: tertiary', 'creates and handles information: quaternary', 'makes top-level decisions: quinary'][j[1]] + '.' };
    } },
    { L: [2, 3], gen: function (R) {
      var A = [R.int(50, 70)], B = [R.int(1, 5)]; A.push(R.int(10, 20)); A.push(100 - A[0] - A[1]); B.push(R.int(15, 25)); B.push(100 - B[0] - B[1]);
      var X = R.sample(FAKE, 2);
      return { q: 'In ' + X[0] + ', ' + A[0] + '% of workers farm, ' + A[1] + '% work in industry and ' + A[2] + '% in services. In ' + X[1] + ', ' + B[0] + '% farm, ' + B[1] + '% work in industry and ' + B[2] + '% in services. By this measure, which is more developed?', a: X[1], w: [X[0], 'You cannot tell from sectors at all'], why: 'Development usually shifts workers out of farming into services; ' + X[1] + ' has few farmers and most workers in services.' };
    } },
    { L: [1, 2], q: 'Which sector takes resources directly from the earth?', a: 'Primary', w: ['Secondary', 'Tertiary', 'Quaternary'], why: 'Farming, fishing, forestry and mining are primary.' },
    { L: [1, 2], q: 'In rich countries today, most workers are in which sector?', a: 'Tertiary (services)', w: ['Primary (farming and mining)', 'Secondary (manufacturing)', 'Quinary (top decision makers)'], why: 'As incomes rise, people spend more on services, and most jobs become service jobs.' },
    { L: [2, 3], q: 'Every worker employed by a car company is in the secondary sector.', tf: false, why: 'Sort by the work itself: accountants and designers in a car company do service and information work.' },
    { L: [3], gen: function (R) {
      var pr = R.sample(JOBS.filter(function (x) { return x[1] === 0; }), 2), ot = R.sample(JOBS.filter(function (x) { return x[1] > 0; }), 3);
      var all = R.shuffle(pr.map(function (x) { return [cap1(x[0]), true]; }).concat(ot.map(function (x) { return [cap1(x[0]), false]; })));
      return { q: 'Which of these people work in the primary sector?', all: all, why: 'Primary work takes resources from nature: farming, fishing, forestry and mining.' };
    } }
  ], 'Sort by the work itself: take, make, serve, know, decide.'));

  /* ------------------------------------------------------------------ humangeo.industrialization */
  G('humangeo.industrialization', fromBank([
    { L: [1, 2], q: 'In which country did the Industrial Revolution begin, in the late 1700s?', a: 'Great Britain', w: ['China', 'The United States', 'Japan', 'Germany'], why: 'It began in Britain, with textile machines, coal, iron and steam power.' },
    { L: [1, 2], q: 'Which invention, patented by James Watt in 1769, gave factories and mines reliable power?', a: 'An improved steam engine', w: ['The telephone', 'The electric light bulb', 'The gasoline engine'], why: 'Watt\'s improved steam engine freed factories from rivers and wind.' },
    { L: [1, 2], q: 'Since about 2010, which country has had the world\'s largest manufacturing output?', a: 'China', w: ['The United States', 'Japan', 'Germany', 'The United Kingdom'], why: 'China overtook the United States around 2010.' },
    { L: [2, 3], gen: function (R) {
      var S = [['Great Britain', 'from about 1760'], ['Germany', 'in the 1800s'], ['Japan', 'in the late 1800s'], ['China', 'mainly after about 1980']];
      var s = R.sample(S, 3).sort(function (a, b) { return S.indexOf(a) - S.indexOf(b); });
      return { q: 'Put these in the order in which large-scale industry arrived.', order: s.map(function (x) { return x[0]; }), why: s.map(function (x) { return x[0] + ' ' + x[1]; }).join('; ') + '.' };
    } },
    { L: [2, 3], q: 'Why did the Industrial Revolution begin in Britain?', a: 'It had coal and iron close together, wide trade, capital to invest and rewards for inventors', w: ['It had the world\'s largest population', 'It had the warmest climate in Europe', 'It had no farms'], why: 'Coal, iron, trade, capital and invention came together there.' },
    { L: [2, 3], q: 'What is deindustrialization?', a: 'The decline of factory jobs in a region that once depended on them', w: ['The spread of factories into farm regions', 'A return to hand-made goods everywhere', 'The building of new steel mills'], why: 'Older industrial regions, such as the U.S. "Rust Belt," lost factory jobs in the late 1900s.' },
    { L: [1, 2, 3], q: 'Manufacturing is disappearing from the world.', tf: false, why: 'Manufacturing has moved around the world; today it is largest in China.' },
    { L: [3], gen: function (R) {
      var lab = R.coin();
      return { q: lab ? 'A company that sews shirts moves its factory to a country with much lower wages. Which factor most changed its best location?' : 'A steel mill is built beside a coal field and an iron-ore railway. Which factor most decided its location?', a: lab ? 'Labor cost' : 'Raw materials and transport', w: [lab ? 'Raw materials and transport' : 'Labor cost', 'Climate', 'Nearness to a capital city'], why: lab ? 'Sewing takes much labor and ships cheaply, so wages matter most.' : 'Steel uses heavy raw materials, so nearness to them cuts transport costs.' };
    } }
  ], 'Britain first, then Europe and North America, then Japan, then East Asia and beyond.'));

  /* ------------------------------------------------------------------ humangeo.weber */
  var BR = ['smelting copper ore into copper', 'sawing logs into lumber', 'pressing sugarcane into raw sugar', 'canning fish caught nearby', 'refining ore into aluminum'];
  var BG = ['bottling soft drinks', 'brewing beer', 'baking bread for local stores', 'mixing ready-made concrete', 'assembling furniture from flat parts near buyers'];
  G('humangeo.weber', fromBank([
    { L: [1, 2], gen: function (R) {
      var red = R.coin(), t = R.pick(red ? BR : BG);
      return { q: 'A factory is ' + t + '. In Weber\'s model, where should it locate?', a: red ? 'Near the raw materials (it is bulk-reducing)' : 'Near the market (it is bulk-gaining)', w: [red ? 'Near the market (it is bulk-gaining)' : 'Near the raw materials (it is bulk-reducing)', 'Anywhere: transport cost does not matter'], why: red ? 'The product weighs less than its inputs, so ship the lighter product the long way.' : 'The product gains weight or bulk (often by adding water), so make it near customers.' };
    } },
    { L: [1, 2, 3], gen: function (R, lv) {
      var win = R.pick([20, 30, 40, 50, 60]), wout = R.pick([5, 10, 15, 80, 90, 100]), D = R.pick([100, 150, 200, 300]), rate = R.pick([1, 2]);
      var cA = wout * D * rate, cB = win * D * rate, best = cA < cB ? 'Site A, at the raw material' : 'Site B, at the market';
      if (lv === 1) return { q: 'A plant makes ' + wout + ' tons of product from ' + win + ' tons of raw material. If it is built at the raw material, ' + D + ' km from the market, and shipping costs ' + rate + ' per ton per km, what does it cost to ship the product to market?', a: { t: 'num', v: String(cA) },
        steps: ['Ship the product: tons × km × rate.', '$' + wout + ' \\times ' + D + ' \\times ' + rate + ' = ' + commas(cA) + '$.'] };
      return mcP(R, 'A plant uses ' + win + ' tons of raw material to make ' + wout + ' tons of product. Site A is at the raw material, ' + D + ' km from the market. Site B is at the market, ' + D + ' km from the raw material. Shipping costs ' + rate + ' per ton per km. Which site has the lower transport cost?', best, [cA < cB ? 'Site B, at the market' : 'Site A, at the raw material', 'They cost the same'],
        ['Site A ships the product: $' + wout + ' \\times ' + D + ' \\times ' + rate + ' = ' + commas(cA) + '$.', 'Site B ships the raw material: $' + win + ' \\times ' + D + ' \\times ' + rate + ' = ' + commas(cB) + '$.', (cA < cB ? 'Site A' : 'Site B') + ' is cheaper: the product ' + (wout < win ? 'weighs less than' : 'weighs more than') + ' its inputs, so the industry is ' + (wout < win ? 'bulk-reducing' : 'bulk-gaining') + '.'], 'Multiply tons × km × rate for what each site must ship.');
    } },
    { L: [1, 2], q: 'In a bulk-reducing industry, the product…', a: 'weighs less than the inputs', w: ['weighs more than the inputs', 'weighs the same as the inputs', 'must be made near the market'], why: 'Bulk-reducing (weight-losing) industries locate near their raw materials.' },
    { L: [1, 2], q: 'Who proposed least cost theory for the location of industry, in 1909?', a: 'Alfred Weber', w: ['Walter Christaller', 'Johann Heinrich von Thünen', 'Walt Rostow'], why: 'Alfred Weber, Theory of the Location of Industries (1909).' },
    { L: [2, 3], q: 'Besides transport, which other costs did Weber say affect a factory\'s location?', a: 'Labor costs and agglomeration (the savings of clustering)', w: ['Climate and soil', 'The color of the land', 'Only taxes'], why: 'Transport, labor and agglomeration are Weber\'s three factors.' },
    { L: [2, 3], q: 'A soft-drink bottler is bulk-reducing, so it should locate near the raw materials.', tf: false, why: 'Bottling adds heavy water, which is available almost everywhere: it is bulk-gaining, so it locates near customers.' },
    { L: [3], gen: function (R) {
      var a = R.sample(BR, 2), b = R.sample(BG, 2), all = R.shuffle(a.map(function (x) { return [cap1(x), true]; }).concat(b.map(function (x) { return [cap1(x), false]; })));
      return { q: 'Which industries are bulk-reducing?', all: all, why: 'Bulk-reducing industries make a product lighter than their inputs.' };
    } }
  ], 'Ship the lighter end of the trip the long way.'));

  /* ------------------------------------------------------------------ humangeo.measuring-development */
  function hdiTier(h) { return h >= 0.8 ? 'Very high' : h >= 0.7 ? 'High' : h >= 0.55 ? 'Medium' : 'Low'; }
  var TIERS = ['Very high', 'High', 'Medium', 'Low'];
  G('humangeo.measuring-development', fromBank([
    { L: [1, 2], gen: function (R) { // health index
      var LE = R.pick([46, 59, 62, 66, 72, 75, 79, 82]), v = r3((LE - 20) / 65);
      return { q: 'The HDI\'s health index uses goalposts of 20 and 85 years of life expectancy. What is the health index for a life expectancy of ' + LE + ' years? (Round to two decimals.)', a: { t: 'num', v: String(r2((LE - 20) / 65)), tol: 0.006 },
        steps: ['Health index $= (\\text{life expectancy} - 20) \\div (85 - 20)$.', '$(' + LE + ' - 20) \\div 65 = ' + (LE - 20) + ' \\div 65 \\approx ' + v + '$.'] };
    } },
    { L: [2, 3], gen: function (R) { // education index
      var mys = R.pick([3, 6, 9, 12]), eys = R.pick([9, 12, 15, 18]), e = (mys / 15 + eys / 18) / 2;
      return { q: 'Adults in a country average ' + mys + ' years of schooling, and children can expect ' + eys + ' years. Using goalposts of 15 and 18 years, what is the HDI education index? (Round to two decimals.)', a: { t: 'num', v: String(r2(e)), tol: 0.006 },
        steps: ['Mean years index: $' + mys + ' \\div 15 = ' + r3(mys / 15) + '$.', 'Expected years index: $' + eys + ' \\div 18 \\approx ' + r3(eys / 18) + '$.', 'Education index: the average, $(' + r3(mys / 15) + ' + ' + r3(eys / 18) + ') \\div 2 \\approx ' + r3(e) + '$.'] };
    } },
    { L: [2, 3], gen: function (R, lv) { // HDI from three indices, and its tier
      var h, a, b, c;
      do { a = R.int(40, 95) / 100; b = R.int(35, 95) / 100; c = R.int(35, 95) / 100; h = M.cbrt(a * b * c); } while ([0.8, 0.7, 0.55].some(function (t) { return M.abs(h - t) < 0.008; }));
      var st = ['Multiply: $' + a + ' \\times ' + b + ' \\times ' + c + ' \\approx ' + r3(a * b * c) + '$.', 'Cube root: $\\sqrt[3]{' + r3(a * b * c) + '} \\approx ' + r3(h) + '$.'];
      if (lv === 2) return { q: 'A country\'s HDI health index is ' + a + ', its education index ' + b + ' and its income index ' + c + '. The HDI is the geometric mean of the three. What is its HDI? (Round to two decimals.)', a: { t: 'num', v: String(r2(h)), tol: 0.006 }, steps: st };
      return mcP(R, 'A country\'s HDI indices: health ' + a + ', education ' + b + ', income ' + c + '. Which human development group is it in? (Very high: 0.800 and up; high: 0.700-0.799; medium: 0.550-0.699; low: below 0.550.)', hdiTier(h), TIERS.filter(function (t) { return t !== hdiTier(h); }),
        st.concat([r3(h) + ' is in the ' + hdiTier(h).toLowerCase() + ' group.']), 'HDI = cube root of (health × education × income).');
    } },
    { L: [1, 2], gen: function (R) { // GNI per capita
      var pop = R.pick([5, 8, 10, 20, 25, 40, 50]) * 1e6, pc = R.pick([800, 1500, 4000, 6000, 12000, 30000, 45000]), gni = pop * pc;
      return { q: 'A country\'s gross national income is ' + commas(gni) + ' dollars, and its population is ' + commas(pop) + '. What is its GNI per capita, in dollars?', a: { t: 'num', v: String(pc) },
        steps: ['Per capita means per person: divide by the population.', commas(gni) + ' ÷ ' + commas(pop) + ' = ' + commas(pc) + ' dollars per person.'] };
    } },
    { L: [1, 2], q: 'Which three things does the Human Development Index combine?', a: 'A long and healthy life, knowledge, and a decent standard of living', w: ['Population, land area and GDP', 'Exports, imports and debt', 'Industry, farming and services', 'Literacy, religion and language'], why: 'Health (life expectancy), knowledge (schooling) and standard of living (GNI per capita).' },
    { L: [1, 2], q: 'Which organization publishes the Human Development Index, first published in 1990?', a: 'The UN Development Programme (UNDP)', w: ['The World Trade Organization', 'NATO', 'The European Union'], why: 'The UNDP has published the HDI since its first Human Development Report in 1990.' },
    { L: [2, 3], q: 'GDP per capita is a full measure of how well people live.', tf: false, why: 'It leaves out health, education and how income is shared, which is why the HDI adds health and schooling.' },
    { L: [3], q: 'Which statements about the HDI are true?', all: [['It uses life expectancy at birth', true], ['It uses years of schooling', true], ['It uses income per person on a log scale', true], ['A country can make up for very poor health with very high income without lowering its HDI', false], ['It counts each country\'s land area', false]], why: 'The geometric mean means a low score in any dimension pulls the whole index down.' }
  ], 'Each index: (actual - min) ÷ (max - min). HDI: cube root of the three multiplied.'));

  /* ------------------------------------------------------------------ humangeo.development-theories */
  var ROSTOW = ['Traditional society', 'Preconditions for take-off', 'Take-off', 'Drive to maturity', 'High mass consumption'];
  var RDESC = ['Most people farm for subsistence, with little new technology', 'New ideas, schools, banks and some trade begin to appear', 'A burst of investment builds the first major industries and railroads', 'Industry spreads to many sectors and the economy diversifies', 'Most people can buy cars, appliances and services'];
  var THEO = [['Rostow\'s stages of growth', 'every country can climb the same five stages, from traditional society to high mass consumption'], ['World-systems theory (Wallerstein)', 'one world economy has a core, a semi-periphery and a periphery, linked by trade'], ['Dependency theory', 'poorer countries were kept poor by unequal ties to richer ones, exporting raw materials and importing manufactured goods']];
  G('humangeo.development-theories', fromBank([
    { L: [1, 2], gen: function (R) {
      var t = R.pick(THEO);
      return { q: 'Which theory says that ' + t[1] + '?', a: t[0], w: THEO.filter(function (x) { return x !== t; }).map(function (x) { return x[0]; }).concat(['Central place theory']), why: t[0] + ': ' + t[1] + '.' };
    } },
    { L: [1, 2, 3], gen: function (R, lv) {
      var i = R.int(0, 4), w = ROSTOW.filter(function (x, j) { return j !== i; });
      return { q: 'In Rostow\'s model: "' + RDESC[i] + '." Which stage is this?', a: ROSTOW[i] + ' (stage ' + (i + 1) + ')', w: (lv === 1 ? R.sample(w, 2) : R.sample(w, 3)).map(function (x) { return x + ' (stage ' + (ROSTOW.indexOf(x) + 1) + ')'; }), why: 'Stage ' + (i + 1) + ' is ' + ROSTOW[i].toLowerCase() + ': ' + RDESC[i].charAt(0).toLowerCase() + RDESC[i].slice(1) + '.',
        viz: lv > 1 ? { name: 'gg-models', opts: { model: 'rostow', quiet: true, hideNames: true, interactive: false } } : undefined };
    } },
    { L: [2, 3], gen: function (R) {
      var T = [['Core', 'does high-skill, high-wage work and holds most capital'], ['Semi-periphery', 'has some industry and some raw-material exports, between the other two'], ['Periphery', 'supplies raw materials and cheap labor']];
      var t = R.pick(T);
      return { q: 'In world-systems theory, which tier ' + t[1] + '?', a: t[0], w: T.filter(function (x) { return x !== t; }).map(function (x) { return x[0]; }), why: 'Core, semi-periphery and periphery; countries can move between tiers.' };
    } },
    { L: [2, 3], q: 'A writer argues that a country stays poor because it exports coffee and copper and imports machinery, while its export prices fall relative to its import prices. Which theory is this?', a: 'Dependency theory', w: ['Rostow\'s stages of growth', 'Central place theory', 'Least cost theory'], why: 'Unequal trade ties and falling relative prices for raw-material exports were central to Prebisch and dependency theory.' },
    { L: [2, 3], q: 'Which is a common criticism of Rostow\'s model?', a: 'It assumes one path of development, modeled on Western countries', w: ['It ignores investment and savings', 'It says every country is already developed', 'It is about cities, not countries'], why: 'Critics say countries have developed by different paths, shaped by history and global ties.' },
    { L: [1, 2, 3], q: 'Scholars agree that one development theory explains every country.', tf: false, why: 'Each explains some cases; scholars debate them.' },
    { L: [3], q: 'Put Rostow\'s stages in order.', order: ['Traditional society', 'Preconditions for take-off', 'Take-off', 'Drive to maturity', 'High mass consumption'], why: 'Rostow (1960): five stages from traditional society to high mass consumption.' },
    { L: [3], q: 'Which statements about world-systems theory are true?', all: [['It was set out by Immanuel Wallerstein, beginning in 1974', true], ['It divides the world into core, semi-periphery and periphery', true], ['Countries can move between tiers', true], ['It says each country develops alone, apart from trade', false]], why: 'It looks at the whole world economy and how places are linked.' }
  ], 'Rostow looks inside a country; world-systems and dependency look at links between countries.'));

  /* ------------------------------------------------------------------ humangeo.trade-globalization */
  G('humangeo.trade-globalization', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) {
      var X = R.sample(FAKE, 2), g = R.pick([['cloth', 'rolls', 'grain', 'tons'], ['shoes', 'pairs', 'rice', 'tons'], ['phones', 'phones', 'wheat', 'tons']]);
      var a1, a2, b1, b2;
      do { a1 = R.int(2, 8) * 2; a2 = R.int(2, 6); b1 = R.int(2, 6); b2 = R.int(2, 6); } while (a1 * b2 === a2 * b1);
      var ocA = ML.Q(a2, a1), ocB = ML.Q(b2, b1), aCA = ocA.lt(ocB); // opportunity cost of 1 unit of good 1, in units of good 2
      var tbl = X[0] + ' makes ' + a1 + ' ' + g[1] + ' of ' + g[0] + ' or ' + a2 + ' ' + g[3] + ' of ' + g[2] + ' per worker-day; ' + X[1] + ' makes ' + b1 + ' ' + g[1] + ' of ' + g[0] + ' or ' + b2 + ' ' + g[3] + ' of ' + g[2] + '.';
      var st = ['Opportunity cost of 1 unit of ' + g[0] + ' in ' + X[0] + ': ' + a2 + ' ÷ ' + a1 + ' = $' + ocA.toTex() + '$ ' + g[3] + ' of ' + g[2] + '.', 'In ' + X[1] + ': ' + b2 + ' ÷ ' + b1 + ' = $' + ocB.toTex() + '$ ' + g[3] + ' of ' + g[2] + '.'];
      if (lv === 1) return { q: tbl + ' In ' + X[0] + ', what is the opportunity cost of 1 unit of ' + g[0] + ', in ' + g[3] + ' of ' + g[2] + '?', a: { t: 'num', v: ocA.toPlain() }, steps: [st[0], 'A worker who makes 1 unit of ' + g[0] + ' gives up that much ' + g[2] + '.'] };
      var who = aCA ? X[0] : X[1], other = aCA ? X[1] : X[0];
      if (lv === 2) return mcP(R, tbl + ' Which country has the comparative advantage in ' + g[0] + '?', who, [other, 'Neither: one country is better at both'], st.concat([who + ' gives up less ' + g[2] + ' per unit of ' + g[0] + ', so it has the comparative advantage in ' + g[0] + '.']), 'Compare what each country gives up to make one unit of ' + g[0] + '.');
      return mcP(R, tbl + ' If they trade, which pattern of specializing helps both?', who + ' makes ' + g[0] + '; ' + other + ' makes ' + g[2], [other + ' makes ' + g[0] + '; ' + who + ' makes ' + g[2], 'Both make only ' + g[0], 'Neither should trade'], st.concat([who + ' has the lower opportunity cost for ' + g[0] + ', so ' + other + ' has it for ' + g[2] + '. Each specializes in its comparative advantage.']), 'Find the lower opportunity cost of each good.');
    } },
    { L: [1, 2], q: 'Who first set out the idea of comparative advantage, in 1817?', a: 'David Ricardo', w: ['Adam Smith', 'Alfred Weber', 'Walt Rostow'], why: 'David Ricardo, On the Principles of Political Economy and Taxation (1817).' },
    { L: [1, 2], q: 'An area near a port with lower taxes and simpler rules, set up to attract foreign factories that export, is called…', a: 'a special economic zone', w: ['a primate city', 'an exclusive economic zone', 'a central business district'], why: 'China opened Shenzhen as a special economic zone in 1980.' },
    { L: [2, 3], q: 'Export factories in Mexico that assemble imported parts, many near the U.S. border, are called…', a: 'maquiladoras', w: ['favelas', 'long lots', 'edge cities'], why: 'Mexico began the maquiladora program in 1965.' },
    { L: [2, 3], q: 'What do economists broadly agree on about trade?', a: 'It raises total income, though some workers and places lose and need help adjusting', w: ['It always helps only the richer country', 'It helps every worker in every place', 'It never changes where jobs are'], why: 'They agree on the overall gains and debate how best to help those who lose.' },
    { L: [1, 2], q: 'A country should import a good only if it cannot make that good itself.', tf: false, why: 'Countries gain by specializing where their opportunity cost is lowest and trading for the rest, even goods they could make.' },
    { L: [3], q: 'Which are part of economic globalization?', all: [['Supply chains that spread production across countries', true], ['Outsourcing work to other firms or countries', true], ['Special economic zones', true], ['Every country making all of its own goods', false], ['Closing all ports to trade', false]], why: 'Globalization links production across the world.' }
  ], 'Comparative advantage: who gives up the least to make it?'));

  /* ------------------------------------------------------------------ humangeo.sustainable-development */
  var SDG = [[1, 'No poverty'], [2, 'Zero hunger'], [3, 'Good health and well-being'], [4, 'Quality education'], [5, 'Gender equality'], [6, 'Clean water and sanitation'], [7, 'Affordable and clean energy'], [8, 'Decent work and economic growth'], [9, 'Industry, innovation and infrastructure'], [10, 'Reduced inequalities'], [11, 'Sustainable cities and communities'], [12, 'Responsible consumption and production'], [13, 'Climate action'], [14, 'Life below water'], [15, 'Life on land'], [16, 'Peace, justice and strong institutions'], [17, 'Partnerships for the goals']];
  var SDGCASE = [['A city builds a bus rapid transit line and plants trees to cool hot neighborhoods', 11], ['A village gets a well and toilets', 6], ['A country trains more teachers and opens schools', 4], ['A region protects coral reefs and limits overfishing', 14], ['A country builds solar and wind farms', 7], ['A program provides school meals to end hunger', 2], ['A clinic program vaccinates children', 3], ['A country replants forests and protects wildlife habitat', 15]];
  G('humangeo.sustainable-development', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) {
      var c = R.pick(SDGCASE), g = SDG[c[1] - 1], w = R.sample(SDGCASE.filter(function (x) { return x[1] !== c[1]; }), lv === 1 ? 2 : 3).map(function (x) { return 'Goal ' + x[1] + ': ' + SDG[x[1] - 1][1]; });
      return { q: c[0] + '. Which Sustainable Development Goal does this serve most directly?', a: 'Goal ' + g[0] + ': ' + g[1], w: w, why: 'It serves Goal ' + g[0] + ', ' + g[1].toLowerCase() + '.' };
    } },
    { L: [1, 2], q: 'How many Sustainable Development Goals did the UN adopt in 2015?', num: 17, why: 'All UN members adopted 17 goals, with 169 targets, for 2030.' },
    { L: [2, 3], gen: function (R) {
      var k = R.int(0, 2);
      return [{ q: 'In what year did all UN members adopt the Sustainable Development Goals?', num: 2015, why: 'They were adopted in September 2015.' }, { q: 'The Sustainable Development Goals set targets to be met by what year?', num: 2030, why: 'They form the 2030 Agenda for Sustainable Development.' }, { q: 'How many targets do the 17 Sustainable Development Goals contain in all?', num: 169, why: 'The 17 goals have 169 targets.' }][k];
    } },
    { L: [1, 2], q: 'Which definition of sustainable development comes from the Brundtland Commission\'s report Our Common Future (1987)?', a: 'Development that meets the needs of the present without compromising the ability of future generations to meet their own needs', w: ['Development that protects nature by stopping all economic growth', 'Development measured only by GDP per capita', 'Development that moves industry to the periphery'], why: 'That definition is from Our Common Future (1987).' },
    { L: [1, 2], gen: function (R) {
      var P = [['Protecting fish stocks in the oceans', 'Environment'], ['Cleaner energy', 'Environment'], ['Decent jobs and growth', 'Economy'], ['Roads, ports and internet access', 'Economy'], ['Every child in school', 'Society'], ['Equal opportunity for women and girls', 'Society']];
      var p = R.pick(P);
      return { q: 'Which pillar of sustainable development does this goal mainly serve: ' + p[0].toLowerCase() + '?', a: p[1], w: ['Environment', 'Economy', 'Society'].filter(function (x) { return x !== p[1]; }), why: 'The three pillars are environment, economy and society; many goals touch more than one.' };
    } },
    { L: [1, 2, 3], q: 'Sustainable development is only about protecting the environment.', tf: false, why: 'The UN goals also cover poverty, health, education, equality and jobs.' },
    { L: [3], q: 'Which are among the 17 Sustainable Development Goals?', all: [['Quality education', true], ['Climate action', true], ['Gender equality', true], ['A single world currency', false], ['Ending all trade', false]], why: 'The goals cover people, prosperity, the planet, peace and partnership.' },
    { L: [3], q: 'Put these in order, earliest first.', order: ['Our Common Future (Brundtland Commission)', 'The Millennium Development Goals begin', 'The Sustainable Development Goals are adopted', 'The target year of the Sustainable Development Goals'], why: '1987, 2000, 2015, 2030.' }
  ], 'Three pillars: environment, economy, society. 17 goals, adopted 2015, for 2030.'));

})(typeof window !== 'undefined' ? window.MathLadder : null);

/* ---- More forms of the same questions (round 7, "widen"): every topic of this course keeps its own generator above and
   sometimes asks the same skill in another form, built only from problems that generator made, so every answer is the
   generator's own:
   - check an answer: the question, one of its choices as a classmate's answer, and "Is that right?" (Yes / No; not in
     placement, where a guess is too easy; only for single-answer questions with three or more choices);
   - two at once: two different questions of the topic, answered together (short questions only, at most one of them with
     a picture, which then comes first; not in the courses for young children, whose answer box for two parts would
     also show a keypad button they don't need).
   Placed after the generators and registered with the same ids, so lessons, ids and the engine are unchanged. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var COURSE = 'humangeo', YOUNG = false, VAR = {};
  // how often another form is used: a quarter of the time when the topic's own generator already varies a lot at this
  // level, up to half the time when it has few different questions
  // (counted once per topic and level from 40 fixed seeds, ignoring the order of the choices)
  function share(id, base, ctx) {
    var L = (ctx && ctx.level) || 1, key = id + '|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 40; s++) {
        try {
          var p = base(ML.rand(id + '#variety#' + s + '#' + L), { level: L, mode: 'learn' }), a = p.a || {};
          var k = p.q + '|' + JSON.stringify(a.choices ? a.choices.slice().sort() : a.v) + '|' + JSON.stringify(p.viz || null);
          if (!seen[k]) { seen[k] = 1; n++; }
        } catch (e) { }
      }
      VAR[key] = n;
    }
    return VAR[key] >= 36 ? 0.25 : VAR[key] >= 25 ? 0.4 : 0.5;
  }
  function txt(s) { return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  var YN = /^(yes|no|true|false|right|wrong|correct|incorrect|not sure)\b/i;
  function checkable(p) {
    var a = p.a;
    if (!a || a.t !== 'mc' || Array.isArray(a.v) || !Array.isArray(a.choices) || a.choices.length < 3) return false;
    if (a.choices.some(function (c) { var t = txt(c); return !t || YN.test(t) || t.length > 180; })) return false;
    if (!p.viz && a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })) return false; // letters name parts of a picture
    if (/\b(is|was) (that|this|it) (right|correct)\b|\btrue or false\b/i.test(txt(p.q))) return false;
    return !p.unit;
  }
  function pairable(p, vizOk) {
    if ((p.viz && !vizOk) || p.unit || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf')) return false;
    if (p.a.t === 'mc' && (!Array.isArray(p.a.choices) || (!p.viz && p.a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })))) return false;
    return txt(p.q).length <= (YOUNG ? 240 : 480) && !/<(table|svg|img|canvas|ol|ul)\b/i.test(p.q) && !(YOUNG && /<blockquote\b/i.test(p.q));
  }
  function sameQ(p, p2) { // the same question, even with its choices in another order
    function k(x) { var a = x.a; return txt(x.q) + '|' + (a.t === 'mc' ? a.choices.slice().sort().join('|') + '|' + (Array.isArray(a.v) ? a.v.map(function (i) { return a.choices[i]; }).sort().join('|') : a.choices[a.v]) : JSON.stringify(a.v)); }
    return k(p) === k(p2);
  }
  function end(s) { s = String(s).replace(/\s+$/, ''); return /[.!?…”’)]$/.test(txt(s)) ? s : s + '.'; }
  function listed(q) { return /\b(these|those|the following|below|the choices|the options|one of them)\b/i.test(txt(q)); }
  function checkForm(R, p) {
    var a = p.a, right = R.coin(), k = right ? a.v : R.pick(a.choices.map(function (_, i) { return i; }).filter(function (i) { return i !== a.v; }));
    var who = YOUNG ? 'A friend picked' : 'A classmate answered', shown = a.choices[k], good = a.choices[a.v];
    var letters = a.choices.every(function (c) { return /^[A-H]$/.test(txt(c)); });
    var q = p.q + (!letters && listed(p.q.replace(/<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, '')) ? '<p>The choices: ' + a.choices.join(' &middot; ') + '</p>' : '') + '<p>' + who + ': <b>' + shown + '</b></p><p>Is that right?</p>';
    var out = { q: q, a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: p.hint || 'Work it out yourself first, then compare.',
      steps: [(right ? 'Yes, that is right: ' : 'No. The right answer is: ') + end(good)].concat(p.steps) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function pairForm(R, id, ctx, p, base) {
    for (var t = 0; t < 6; t++) {
      var R2 = ML.rand(id + '#pair#' + R.int(0, 999999999)), p2;
      try { p2 = base(R2, ctx); } catch (e) { return null; }
      if (p2 && p2.a && p2.a.t === 'mc' && !p2.a.choices && Array.isArray(p2.choices)) p2.a.choices = p2.choices;
      if (!p2 || !pairable(p2, !p.viz) || sameQ(p, p2)) continue;
      if (p2.viz) { var t2 = p; p = p2; p2 = t2; } // the question with the picture comes first
      var RM = /<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, rm = (p.q.match(RM) || p2.q.match(RM) || [''])[0];
      var out = { q: rm + '<p>Answer both questions.</p><ol class="ml-two"><li>' + p.q.replace(RM, '') + '</li><li>' + p2.q.replace(RM, '') + '</li></ol>',
        a: { t: 'multi', parts: [{ label: '1.', a: p.a }, { label: '2.', a: p2.a }] },
        hint: 'Take them one at a time.',
        steps: ['Question 1: ' + p.steps[0]].concat(p.steps.slice(1), ['Question 2: ' + p2.steps[0]], p2.steps.slice(1)) };
      var nl = [].concat(p.nolint || [], p2.nolint || []); if (nl.length) out.nolint = nl;
      if (p.viz) out.viz = p.viz;
      return out;
    }
    return null;
  }
  ML.genIds().filter(function (id) { return id.indexOf(COURSE + '.') === 0; }).forEach(function (id) {
    var base = ML.getGen(id);
    if (!base || base._forms) return;
    var fn = function (R, ctx) {
      var p = base(R, ctx), L = (ctx && ctx.level) || 1, mode = ctx && ctx.mode;
      if (!p || !p.a || !R.chance(share(id, base, ctx))) return p;
      if (p.a.t === 'mc' && !p.a.choices && Array.isArray(p.choices)) p.a.choices = p.choices;
      var forms = [];
      if (mode !== 'place' && checkable(p)) forms.push('check');
      if (pairable(p, true) && !YOUNG) forms.push('pair');
      if (!forms.length) return p;
      var f = R.pick(forms), out = f === 'check' ? checkForm(R, p) : pairForm(R, id, ctx, p, base);
      return out || p;
    };
    fn._forms = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : null);
