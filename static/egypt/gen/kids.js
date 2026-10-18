/* Ancient Egypt for Young Explorers (Egyptology Ladder, course key kids): problem generators for all 40 topics.
   Built from /tmp/work_egypt/kids/gen/*.js by build_gen.js (do not edit the shipped file by hand).
   Every hieroglyph, spelling, date, place and god comes from the kit's model, MathLadder.egypt (SIGNS, WORDS, NAMES,
   KINGS, SITES, GODS, PYRAMIDS, ROSETTA, numberSigns, nameSigns), so pictures and answers agree. Facts in the banks are
   well established and written for ages 8 to 12 (read-aloud friendly). Shapes: fact questions (mc, with wrong choices taken
   from the topic's trouble note), true or false, and model-built problems: the sound of a sign, what a hint sign tells
   you, which way to read, a modern name in sound signs (labeled as a game), whose cartouche, reading and writing
   numbers, which lettered dot on the map, which ruler came first, gods by their heads and jobs, which pyramid, the
   Rosetta Stone's three texts. Answers are mc, tf, num or translit (single sounds). */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;
  function EG() { return ML.egypt; }

  // ---------------------------------------------------------------- small helpers
  function letter(i) { return String.fromCharCode(65 + i); }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function uniq(a) { var seen = {}, out = []; a.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } }); return out; }
  function mcOf(right, wrongs, k) { var ch = uniq([right].concat(wrongs.filter(function (w) { return w !== right; }))); if (k) ch = ch.slice(0, k); return { t: 'mc', choices: ch, v: 0 }; }
  function glyph(code, size) { var S = EG().SIGNS[code]; return '<span class="eg-h" style="font-size:' + (size || '1.9em') + '">' + S.u + '</span>'; }
  function glyphs(codes, size) { return '<span class="eg-h" style="font-size:' + (size || '1.6em') + ';letter-spacing:.08em">' + codes.map(function (c) { return EG().SIGNS[c].u; }).join('') + '</span>'; }
  function nWrong(ctx) { return ctx.level === 1 ? 2 : 3; }
  function finish(p, hint) { if (hint && !p.hint) p.hint = hint; if (!p.viz) delete p.viz; return p; }
  // a still, quiet picture for a problem
  function pic(name, opts) { var o = { quiet: true, interactive: false }; for (var k in opts) o[k] = opts[k]; return { name: name, opts: o }; }
  function showPic(name, opts) { var o = { interactive: false }; for (var k in opts) o[k] = opts[k]; return { name: name, opts: o }; }

  // choices that are signs: the signs are drawn numbered in a still picture and the choices are "Sign 1", "Sign 2"…
  // (mc choices are plain text, so hieroglyphs go in the picture). right: the right code; wrongs: other codes
  function signChoice(R, right, wrongs) {
    var cs = R.shuffle([right].concat(wrongs)), v = cs.indexOf(right);
    return { a: { t: 'mc', choices: cs.map(function (c, i) { return 'Sign ' + (i + 1); }), v: v, keep: true }, v: v, viz: pic('eg-glyphs', { sp: cs.join(' '), number: true, size: 84 }) };
  }
  // ---------------------------------------------------------------- bank shapes
  // fact: [question, right answer, [wrong answers: real misconceptions first], why, levels?, viz?]
  function factQ(R, ctx, it, hint) {
    var wr = it[2].slice(), k = nWrong(ctx);
    // level 1 keeps the first-listed (most common) mistake and one other; later levels use more
    var pickW = ctx.level === 1 ? [wr[0]].concat(R.sample(wr.slice(1), Math.min(k - 1, wr.length - 1))) : R.sample(wr, Math.min(k, wr.length));
    return finish({ q: it[0], a: mcOf(it[1], pickW), steps: ['The answer: ' + it[1] + '.', it[3]], viz: it[5] }, hint);
  }
  // tf: [statement, true|false, explanation, levels?, viz?]
  function tfQ(R, ctx, it, hint) {
    return finish({ q: '<b>True or false?</b> ' + it[0], a: { t: 'tf', v: it[1] }, steps: [(it[1] ? 'True. ' : 'False. ') + it[2]], viz: it[4] }, hint);
  }
  // order: [title, [items in the right order], why, levels?]: choose the right order among shuffled sequences
  function orderQ(R, ctx, it, hint) {
    var items = it[1], right = items.join(' → '), wrongs = [], tries = 0;
    while (wrongs.length < nWrong(ctx) && tries++ < 60) { var s = R.shuffle(items).join(' → '); if (s !== right && wrongs.indexOf(s) < 0) wrongs.push(s); }
    return finish({ q: it[0] + ' <b>Which order is right, first to last?</b>', a: mcOf(right, wrongs), steps: items.map(function (x, i) { return (i + 1) + '. ' + x; }).concat([it[2]]) }, hint);
  }
  var SHAPES = { fact: factQ, tf: tfQ, order: orderQ };
  var DEFAULT_LEVELS = { 1: ['fact', 'fact', 'tf'], 2: ['fact', 'fact', 'tf', 'order'], 3: ['fact', 'order', 'tf', 'fact'] };
  function levelsOf(it, shape) { var i = shape === 'fact' ? 4 : shape === 'tf' ? 3 : 3; return Array.isArray(it[i]) ? it[i] : null; }

  /* T(id, spec): spec.fact, spec.tf, spec.order are banks; spec.custom = { name: fn(R, ctx) -> problem } for model-built
     shapes; spec.levels = { 1: [shape names], 2: [...], 3: [...] } (a shape is picked at random from the list; repeats
     weight it); spec.hint is the default hint. */
  function T(id, spec) {
    if (ML.__collectSpecs) ML.__collectSpecs[id] = spec;
    G(id, function (R, ctx) {
      var lv = (spec.levels && spec.levels[ctx.level]) || DEFAULT_LEVELS[ctx.level] || DEFAULT_LEVELS[2];
      var avail = lv.filter(function (k) { return (spec[k] && spec[k].length) || (spec.custom && spec.custom[k]); });
      if (!avail.length) avail = ['fact'];
      var kind = R.pick(avail), p;
      if (spec.custom && spec.custom[kind]) p = spec.custom[kind](R, ctx);
      else {
        var bank = spec[kind], pool = bank.filter(function (it) { var L = levelsOf(it, kind); return !L || L.indexOf(ctx.level) >= 0; });
        p = SHAPES[kind](R, ctx, R.pick(pool.length ? pool : bank), spec.hint);
      }
      p.kind = kind;
      return finish(p, spec.hint);
    });
  }

  // ---------------------------------------------------------------- model helpers
  // the sound of a one-sound sign, as these lessons teach it to young readers (Egyptologists' way of saying it)
  var KID_SOUND = { 'ꜣ': 'a', 'j': 'i', 'y': 'y', 'ꜥ': 'a', 'w': 'w', 'b': 'b', 'p': 'p', 'f': 'f', 'm': 'm', 'n': 'n', 'r': 'r', 'h': 'h', 'ḥ': 'h', 'ḫ': 'kh', 'ẖ': 'kh',
    'z': 's', 's': 's', 'š': 'sh', 'q': 'k', 'k': 'k', 'g': 'g', 't': 't', 'ṯ': 'tj', 'd': 'd', 'ḏ': 'dj' };
  function kidSound(code) { return KID_SOUND[EG().SIGNS[code].v[0]]; }
  // easy sound signs (each has one plain sound), the ones the lessons teach
  var EASY = ['G17', 'N35', 'D21', 'X1', 'D58', 'I9', 'Q3', 'D46', 'S29', 'V31', 'W11', 'O4', 'N37', 'G43'];
  var EASY1 = ['G17', 'N35', 'D21', 'X1', 'D58', 'I9', 'Q3', 'D46'];
  function signName(code) { return EG().SIGNS[code].n; }
  // what a hint sign (determinative) tells you, in kids' words; checked against SIGNS[c].use by the tests
  var DET_IDEA = { A1: 'a man or a person', B1: 'a woman or a girl', A40: 'a god', H8: 'a goddess', N1: 'the sky', N5: 'the sun, light or time', O49: 'a town or city', Y1: 'writing or an idea', D54: 'walking or moving', A2: 'eating, drinking or speaking', N25: 'a foreign land or the desert', K1: 'a fish', M2: 'a plant', E1: 'cattle', W22: 'beer or a jar' };
  // words whose last sign is a hint sign (WORDS keys) and where it is
  function detWords() {
    var W = EG().WORDS, out = [];
    Object.keys(W).forEach(function (k) { var parts = W[k].parts, codes = EG().codes(W[k].sp), i = codes.length - 1; if (codes.length === parts.length && parts[i][1] === 'det' && DET_IDEA[codes[i]]) out.push({ key: k, i: i, c: codes[i] }); });
    return out;
  }
  // names for the modern name game: every letter is sounded, so one sign per sound (a double letter is one sound)
  var KIDNAMES = ['Sam', 'Mia', 'Ben', 'Leo', 'Omar', 'Ruby', 'Nina', 'Tom', 'Dan', 'Kim', 'Pam', 'Ted', 'Ava', 'Eli', 'Ivan', 'Rosa', 'Hana', 'Amir', 'Zara', 'Lola', 'Owen', 'Maya', 'Noah', 'Abel', 'Otis', 'Iris', 'Hugo', 'Lena'];
  var DOUBLES = ['Anna', 'Bella', 'Ella', 'Emma', 'Otto', 'Finn', 'Matt', 'Molly', 'Hanna'];
  function nameCodes(n) { return [].concat.apply([], EG().nameSigns(n).map(function (m) { return m.signs; })); }
  // Nile-side sites from south to north (for upstream / downstream problems)
  var NILE_SITES = ['philae', 'elephantine', 'kom-ombo', 'edfu', 'hierakonpolis', 'karnak', 'dendera', 'abydos', 'amarna', 'hermopolis', 'beni-hasan', 'meidum', 'memphis', 'giza'];
  // a pick-the-dot map problem: target plus others at least minKm away from it and from each other
  function mapPick(R, ctx, target, pool, o) {
    o = o || {}; var E = EG(), T0 = E.site(target), minKm = o.minKm || 120, n = ctx.level === 1 ? 3 : 4, others = [];
    R.shuffle(pool.filter(function (k) { return k !== target; })).forEach(function (k) {
      if (others.length >= n - 1) return; var s = E.site(k);
      if (E.km(s, T0) < minKm) return; if (others.some(function (x) { return E.km(E.site(x), s) < minKm; })) return; others.push(k);
    });
    var sites = R.shuffle([target].concat(others)), v = sites.indexOf(target);
    var opts = { mode: 'pick', target: target, choices: sites, sites: 'none', cities: !!o.cities, view: o.view || 'egypt', layerChips: false, height: o.height || 340 };
    if (o.regions === false) opts.regions = false;
    return { q: (o.q || 'Which lettered dot on the map is <b>' + T0.name + '</b>?'), a: { t: 'mc', choices: sites.map(function (s, i) { return letter(i); }), v: v, keep: true },
      steps: [letter(v) + ' is ' + T0.name + '. ' + (o.why || T0.note)].concat(sites.filter(function (s) { return s !== target; }).map(function (s) { return letter(sites.indexOf(s)) + ' is ' + E.site(s).name + '.'; })),
      viz: pic('eg-map', opts) };
  }
  // kings young explorers meet, in the order they ruled (dates from KINGS)
  var KID_KINGS = ['narmer', 'djoser', 'khufu', 'hatshepsut', 'tutankhamun', 'ramesses2', 'alexander', 'cleopatra7'];
  function kname(k) { return EG().king(k).name; }
  function earliestQ(R, ctx, keys, why) { // which ruler came first (reigns at least 100 years apart)
    var E = EG(), n = ctx.level === 1 ? 2 : 3, ks;
    for (var t = 0; t < 50; t++) { ks = R.sample(keys, n); var ys = ks.map(function (k) { return E.king(k).from; }).sort(function (a, b) { return a - b; }); if (ys.every(function (y, i) { return !i || y - ys[i - 1] >= 100; })) break; }
    var first = ks.slice().sort(function (a, b) { return E.king(a).from - E.king(b).from; });
    return { q: 'Which of these rulers lived <b>first</b>, longest ago?', a: mcOf(kname(first[0]), first.slice(1).map(kname)),
      steps: first.map(function (k) { var K = E.king(k); return K.name + ': ' + E.span(K.from, K.to, true) + '.'; }).concat([why || 'Bigger numbers BC are longer ago.']) };
  }


  // ================================================================ Unit 1: The Gift of the Nile
  var DESERT_SITES = ['siwa', 'kharga', 'berenike', 'serabit'];
  T('kids.nile-river', {
    hint: 'Think about water. Where could people drink, farm and grow food in a land with almost no rain?',
    fact: [
      ['Where did most ancient Egyptians live?', 'On the green strip of land beside the Nile', ['Spread out across the desert', 'In a thick jungle', 'High in the mountains'], 'The river gave water and rich soil, so people lived close to it, with desert all around.'],
      ['What was on both sides of Egypt\'s green river valley?', 'Dry desert', ['Thick forest', 'The ocean', 'Snowy mountains'], 'The farmland was a thin ribbon; past it, the desert began.'],
      ['Why was the Nile so important to Egypt?', 'It almost never rains there, so the river gave the water for people and crops', ['It was the only place to swim', 'It kept enemies away with its waves', 'It made the desert cooler'], 'Without the Nile, there would have been no farms, and no Egypt.'],
      ['Egyptians called the dark soil by the river Kemet. What does Kemet mean?', 'The black land', ['The red land', 'The sandy land', 'The land of the gods'], 'Kemet, "the black land," was the rich farmland; Deshret, "the red land," was the desert.'],
      ['What did the Egyptians call the desert?', 'Deshret, "the red land"', ['Kemet, "the black land"', 'Punt, "the far land"', 'Nubia, "the gold land"'], 'Red for the desert, black for the farmland.'],
      ['A Greek visitor called Egypt "the gift of the river." What did he mean?', 'Egypt\'s soil and farms came from the Nile', ['The Nile was given to Egypt by the Greeks', 'Egyptians gave gifts to the river every day', 'The river was full of gold'], 'The river\'s water and mud made the land rich.', [2, 3]]
    ],
    tf: [
      ['Most of ancient Egypt was green jungle.', false, 'Most of it was desert. People lived on the narrow green strip beside the Nile.'],
      ['Almost all Egyptians lived close to the Nile.', true, 'The river gave water for drinking and farming.'],
      ['It rains a lot in Egypt, so farmers did not need the river.', false, 'It almost never rains there. The river brought the water.'],
      ['Egyptians called the desert "the red land."', true, 'Deshret means "the red land." The farmland was Kemet, "the black land."']
    ],
    custom: {
      map: function (R, ctx) {
        var E = EG(), target = R.pick(['giza', 'karnak', 'memphis', 'abydos', 'edfu', 'amarna', 'beni-hasan']);
        var p = mapPick(R, ctx, target, DESERT_SITES, { minKm: 100, q: 'Egyptians built their towns and temples beside the Nile. <b>Which lettered dot is on the river?</b>', why: 'It sits right beside the Nile. The other dots are out in the desert.' });
        return p;
      }
    },
    levels: { 1: ['fact', 'tf', 'map'], 2: ['fact', 'fact', 'tf', 'map'], 3: ['fact', 'map', 'tf'] }
  });

  T('kids.river-north', {
    hint: 'Water runs downhill, from the high land in the south to the sea in the north.',
    fact: [
      ['Which way does the Nile flow?', 'From south to north', ['From north to south', 'From east to west', 'In a big circle'], 'It starts deep in Africa and flows north into the Mediterranean Sea.'],
      ['Into which sea does the Nile flow?', 'The Mediterranean Sea', ['The Red Sea', 'The Indian Ocean', 'The Dead Sea'], 'Its mouths are on the Mediterranean coast, in the north.'],
      ['Near the sea, the Nile splits into branches that spread out in a triangle. What is that area called?', 'The Delta', ['The Oasis', 'The Cataract', 'The Valley of the Kings'], 'It is named for the Greek letter delta, Δ, a triangle.'],
      ['On a map with north at the top, which way does the Nile flow?', 'Up the map, toward the top', ['Down the map, toward the bottom', 'Left, toward the west', 'It does not flow at all'], 'North is at the top, and the Nile flows north, so it flows up the map.'],
      ['Why does the Nile flow north?', 'The land in the south is higher, and water runs downhill to the sea', ['The wind pushes it north', 'All rivers flow north', 'The Egyptians dug it that way'], 'Water always runs downhill, and the Mediterranean coast is low.', [2, 3]],
      ['Where do the White Nile and the Blue Nile meet?', 'At Khartoum, in Sudan', ['At Giza, in Egypt', 'At the Mediterranean Sea', 'At Alexandria'], 'The two rivers join far to the south and flow north together.', [2, 3]]
    ],
    tf: [
      ['The Nile flows from south to north.', true, 'It flows north into the Mediterranean Sea.'],
      ['Rivers always flow toward the bottom of the map.', false, 'Rivers flow downhill. The Nile flows north, up the map.'],
      ['The Delta is in the north of Egypt, near the sea.', true, 'The river spreads out into branches just before the Mediterranean.'],
      ['The Nile flows into the Red Sea.', false, 'It flows into the Mediterranean Sea.']
    ],
    custom: {
      drift: function (R, ctx) { // a boat drifting with the current reaches the place downstream (north)
        var E = EG(), list = NILE_SITES, i, a, nb, sb;
        for (var t = 0; t < 50; t++) {
          i = R.int(1, list.length - 2); a = E.site(list[i]);
          var north = list.slice(i + 1).filter(function (k) { return E.site(k).lat > a.lat + 0.4; }), south = list.slice(0, i).filter(function (k) { return E.site(k).lat < a.lat - 0.4; });
          if (north.length && south.length) { nb = R.pick(north); sb = R.pick(south); break; }
        }
        var N = E.site(nb), S = E.site(sb);
        return { q: 'A boat drifts down the Nile from <b>' + a.name + '</b>, with no sail up and nobody rowing. <b>Which place does the current carry it toward?</b>', a: mcOf(N.name, [S.name]),
          steps: ['The current flows north.', N.name + ' is north of ' + a.name + '; ' + S.name + ' is south of it.', 'So the boat drifts toward ' + N.name + '.'],
          viz: showPic('eg-map', { view: 'egypt', sites: [a.key, N.key, S.key], layerChips: false, cities: false, height: 340 }) };
      }
    },
    levels: { 1: ['fact', 'tf', 'drift'], 2: ['fact', 'tf', 'drift', 'drift'], 3: ['fact', 'drift', 'tf'] }
  });

  var UL_SITES = ['giza', 'saqqara', 'memphis', 'heliopolis', 'bubastis', 'tanis', 'sais', 'alexandria', 'buto', 'abydos', 'dendera', 'karnak', 'luxor', 'edfu', 'kom-ombo', 'elephantine', 'philae', 'hierakonpolis', 'naqada'];
  T('kids.upper-lower', {
    hint: 'Upper means up the river, and up the river is south.',
    fact: [
      ['Where is Upper Egypt?', 'In the south, up the river', ['In the north, near the sea', 'At the top of the map', 'Across the Red Sea'], 'The names come from the river: upstream is south.'],
      ['Where is Lower Egypt?', 'In the north, where the Delta spreads out', ['In the south, near Nubia', 'At the bottom of the map', 'In the Western Desert'], 'Lower Egypt is downstream, near the Mediterranean.'],
      ['Why is the south called "Upper" Egypt?', 'It is up the river, closer to where the Nile comes from', ['It is at the top of the map', 'It has taller mountains than anywhere on Earth', 'The kings lived upstairs there'], 'Going south on the Nile means going upstream.'],
      ['Which part of Egypt is a wide, flat land of marshes and river branches?', 'Lower Egypt (the Delta)', ['Upper Egypt (the valley)', 'Nubia', 'The Western Desert'], 'The Delta spreads out before the river reaches the sea.'],
      ['Which part of Egypt is a long, narrow valley between cliffs?', 'Upper Egypt', ['Lower Egypt', 'The Delta', 'The Mediterranean coast'], 'In the south, the river runs through a narrow valley.']
    ],
    tf: [
      ['Upper Egypt is in the south.', true, 'Upper means upstream, and the Nile flows from the south.'],
      ['Upper Egypt is at the top of a map with north at the top.', false, 'Upper Egypt is in the south, at the bottom of such a map.'],
      ['The Delta is part of Lower Egypt.', true, 'Lower Egypt is the north, where the Delta is.'],
      ['Lower Egypt is up the river from Upper Egypt.', false, 'Lower Egypt is down the river (north) from Upper Egypt.']
    ],
    custom: {
      region: function (R, ctx) {
        var E = EG(), s = E.site(R.pick(UL_SITES)), up = s.region === 'upper', ans = up ? 'Upper Egypt' : 'Lower Egypt';
        return { q: 'Here is <b>' + s.name + '</b> on the map. <b>Is it in Upper Egypt or Lower Egypt?</b>', a: { t: 'mc', choices: ['Upper Egypt', 'Lower Egypt'], v: up ? 0 : 1, keep: true },
          steps: [s.name + ' is ' + (up ? 'in the south, up the river' : 'in the north, down the river, near the Delta') + '.', (up ? 'Up the river' : 'Down the river') + ' is ' + ans + '.'],
          viz: showPic('eg-map', { view: 'egypt', sites: [s.key], regions: false, layerChips: false, cities: false, height: 340 }) };
      }
    },
    levels: { 1: ['fact', 'region', 'tf'], 2: ['region', 'fact', 'tf', 'region'], 3: ['region', 'fact', 'tf'] }
  });

  T('kids.flood', {
    hint: 'The flood came every summer and left something behind on the fields.',
    fact: [
      ['What did the Nile leave on the fields when the flood went down?', 'A layer of rich, dark mud', ['A layer of sand', 'Salt and stones', 'Nothing at all'], 'The mud (silt) made the fields fertile for the next crop.'],
      ['How did Egyptians feel about the yearly flood?', 'They welcomed it, because a good flood meant a good harvest', ['They feared it as a disaster', 'They did not notice it', 'They tried to stop it every year'], 'The flood watered the fields and brought new soil.'],
      ['What happened in a year when the flood was very low?', 'Fewer crops grew, and people could go hungry', ['Farmers had the best harvest ever', 'The desert turned green', 'Nothing changed'], 'Without enough water and mud, many fields stayed dry.'],
      ['Where did the flood water come from?', 'Heavy summer rains on the mountains of Ethiopia, far to the south', ['Rain falling in Egypt', 'The Mediterranean Sea pushing water upriver', 'Melting snow on the pyramids'], 'The rain far away swelled the river, which flowed north into Egypt.', [2, 3]],
      ['When did the flood come each year?', 'In summer', ['In winter', 'Only every ten years', 'At night'], 'The Nile rose every summer.'],
      ['Which god did Egyptians link with the flood?', 'Hapi', ['Anubis', 'Seth', 'Thoth'], 'Hapi was pictured as a plump, well-fed man, a sign of plenty.', [2, 3]],
      ['Why does the Nile not flood every year today?', 'The Aswan High Dam, finished in 1970, holds the water back', ['It stopped raining in Ethiopia', 'The river dried up', 'The Delta blocks it'], 'The dam made a huge lake, Lake Nasser, that stores the flood water.', [2, 3]]
    ],
    tf: [
      ['The yearly flood was a disaster that Egyptians feared.', false, 'They welcomed it: a good flood meant a good harvest.'],
      ['A flood that was too high could wash away houses.', true, 'Too much water could be as bad as too little.'],
      ['The flood left rich mud on the fields.', true, 'The mud made the soil fertile.'],
      ['The flood water came from rain that fell in Egypt.', false, 'It came from rain far to the south, on the mountains of Ethiopia.']
    ],
    order: [
      ['What happened each year with the flood?', ['Summer rains fall far to the south', 'The Nile rises and covers the fields', 'The water goes down and leaves mud', 'Farmers plant seeds in the mud'], 'The rain far away swells the river; the water goes down and leaves mud to plant in.']
    ],
    levels: { 1: ['fact', 'tf'], 2: ['fact', 'fact', 'tf', 'order'], 3: ['fact', 'order', 'tf'] }
  });

  var SEASONS = [['Akhet', 'the flood', 'The fields are under water.'], ['Peret', 'growing', 'The water goes down and farmers plant seeds that sprout and grow.'], ['Shemu', 'harvest', 'Farmers cut the ripe grain, and the river is low.']];
  T('kids.seasons', {
    hint: 'The seasons followed the river: first the flood, then the growing, then the harvest.',
    fact: [
      ['How many seasons did the Egyptian year have?', 'Three', ['Four', 'Two', 'Twelve'], 'Akhet (flood), Peret (growing) and Shemu (harvest).'],
      ['What were the Egyptian seasons named after?', 'What the river and the fields were doing', ['The weather, like hot and cold', 'The names of kings', 'The stars'], 'Egypt\'s weather changes little; the river changed a lot.'],
      ['How many months were in each Egyptian season?', 'Four', ['Three', 'Six', 'Ten'], 'Three seasons of four months make twelve months.'],
      ['How many days were in each Egyptian month?', '30', ['28', '31', '10'], 'Every month had 30 days, and 5 extra days came at the end of the year.'],
      ['Which season came first in the year?', 'Akhet, the flood', ['Shemu, the harvest', 'Peret, the growing time', 'Winter'], 'The year started with the flood.']
    ],
    tf: [
      ['The Egyptian year had four seasons: spring, summer, fall and winter.', false, 'It had three: Akhet, Peret and Shemu.'],
      ['Shemu was the harvest season.', true, 'In Shemu farmers cut the ripe grain.'],
      ['Akhet was the season of the flood.', true, 'In Akhet the fields were under water.'],
      ['Egyptians added 5 extra days to make 365.', true, '12 months × 30 days = 360, plus 5 feast days = 365.', [2, 3]]
    ],
    order: [['Put the three Egyptian seasons in order.', ['Akhet (flood)', 'Peret (growing)', 'Shemu (harvest)'], 'First the flood, then the growing, then the harvest.']],
    custom: {
      season: function (R, ctx) {
        var i = R.int(0, 2), s = SEASONS[i];
        return { q: s[2] + ' <b>Which season is it?</b>', a: mcOf(s[0] + ' (' + s[1] + ')', SEASONS.filter(function (x, j) { return j !== i; }).map(function (x) { return x[0] + ' (' + x[1] + ')'; })),
          steps: [s[2], 'That is ' + s[0] + ', the season of ' + s[1] + '.'] };
      },
      days: function (R, ctx) {
        var kind = ctx.level === 1 ? 'season' : R.pick(['season', 'year', 'months', 'two']);
        if (kind === 'season') return { q: 'An Egyptian season had 4 months, and each month had 30 days. <b>How many days were in one season?</b>', a: { t: 'num', v: '120' }, unit: 'days', steps: ['4 months × 30 days = 120 days.'] };
        if (kind === 'two') return { q: 'Each season had 4 months of 30 days. <b>How many days were in two seasons, Akhet and Peret together?</b>', a: { t: 'num', v: '240' }, unit: 'days', steps: ['One season: 4 × 30 = 120 days.', 'Two seasons: 2 × 120 = 240 days.'] };
        if (kind === 'months') return { q: 'The Egyptian year had 3 seasons, each with 4 months. <b>How many months were in the year?</b>', a: { t: 'num', v: '12' }, unit: 'months', steps: ['3 seasons × 4 months = 12 months.'] };
        return { q: 'The year had 12 months of 30 days, plus 5 extra feast days. <b>How many days were in the Egyptian year?</b>', a: { t: 'num', v: '365' }, unit: 'days', steps: ['12 × 30 = 360 days.', '360 + 5 = 365 days.'] };
      }
    },
    levels: { 1: ['season', 'fact', 'tf', 'days'], 2: ['season', 'fact', 'days', 'order', 'tf'], 3: ['days', 'order', 'season', 'fact'] }
  });

  T('kids.boats', {
    hint: 'The current flows north. The wind usually blows from the north, toward the south.',
    fact: [
      ['Why was the Nile like a road for Egypt?', 'Boats could carry people and goods up and down the long country', ['It was paved with stones', 'Chariots drove along the riverbed', 'It was frozen in winter'], 'Egypt was a long strip beside the river, so boats reached almost every town.'],
      ['Which way does the wind usually blow in Egypt?', 'From the north, toward the south', ['From the south, toward the north', 'From the east', 'It never blows'], 'That wind filled the sails of boats going south.'],
      ['What did small boats in Egypt often have as their main material?', 'Bundles of papyrus reeds', ['Steel', 'Plastic', 'Glass'], 'Big boats were built of wood, often cedar from Lebanon.'],
      ['What did Egyptians bring from Lebanon to build big boats?', 'Cedar wood', ['Gold', 'Papyrus', 'Granite'], 'Egypt had few big trees, so cedar came by sea from ports like Byblos.', [2, 3]],
      ['What was found buried beside the Great Pyramid in 1954?', 'A full-size wooden boat of King Khufu', ['A papyrus boat made of gold', 'A boat full of mummies', 'A stone ship that could float'], 'It is about 43 meters long, made mostly of cedar.', [2, 3]]
    ],
    tf: [
      ['Boats going north on the Nile could float with the current.', true, 'The current flows north.'],
      ['Boats needed their sails up to go north.', false, 'Going north, the current carried them; the sail was for going south.'],
      ['Boats going south used sails to catch the north wind.', true, 'The wind usually blows from the north toward the south.']
    ],
    custom: {
      trip: function (R, ctx) {
        var E = EG(), a, b;
        for (var t = 0; t < 50; t++) { var two = R.sample(NILE_SITES, 2); a = E.site(two[0]); b = E.site(two[1]); if (Math.abs(a.lat - b.lat) > 0.6) break; }
        var north = b.lat > a.lat;
        var right = north ? 'The current (the sail can come down)' : 'The wind, filling the sail';
        var wrong = north ? ['The wind, filling the sail', 'Nothing: boats could not go that way'] : ['The current (the sail can come down)', 'Nothing: boats could not go that way'];
        if (ctx.level > 1) wrong.push('Oxen pulling it along the bank');
        return { q: 'A boat travels on the Nile from <b>' + a.name + '</b> to <b>' + b.name + '</b>. <b>What moves it best?</b>', a: mcOf(right, wrong),
          steps: [b.name + ' is ' + (north ? 'north' : 'south') + ' of ' + a.name + ', so the boat goes ' + (north ? 'downstream, with' : 'upstream, against') + ' the current.', north ? 'The current flows north and carries it.' : 'The north wind blows south, so a sail carries it upstream.'],
          viz: showPic('eg-map', { view: 'egypt', sites: [a.key, b.key], layerChips: false, cities: false, height: 340 }) };
      }
    },
    levels: { 1: ['trip', 'fact', 'tf'], 2: ['trip', 'trip', 'fact', 'tf'], 3: ['trip', 'fact', 'tf'] }
  });

  T('kids.farming', {
    hint: 'Crops grew only where the water reached: in the black mud by the river.',
    fact: [
      ['Where did Egyptian farmers grow their crops?', 'In the black mud the flood left by the river', ['Out in the desert sand', 'On the tops of the cliffs', 'On boats'], 'Farms were only where the water reached.'],
      ['Which plant did farmers grow to make linen cloth?', 'Flax', ['Wheat', 'Papyrus', 'Cotton'], 'Flax fibers were spun into thread and woven into linen.'],
      ['Which crops did farmers grow for bread and beer?', 'Wheat and barley', ['Corn and potatoes', 'Rice and tea', 'Flax and papyrus'], 'Bread and beer were made from grain.'],
      ['What was a shaduf?', 'A bucket on a long pole, used to lift water', ['A kind of boat', 'A type of bread', 'A tool for writing'], 'A heavy weight on the other end of the pole made lifting easy.'],
      ['What tool did farmers use to cut ripe grain?', 'A sickle', ['A shaduf', 'A reed pen', 'A sledge'], 'Sickles had sharp teeth of flint set in wood.'],
      ['Why did farmers dig canals?', 'To carry river water to fields farther from the banks', ['To keep crocodiles away', 'To race their boats', 'To drain the sea'], 'Plants needed water while they grew, not just during the flood.', [2, 3]],
      ['Which animals pulled the plows?', 'Oxen', ['Camels', 'Horses', 'Cats'], 'Oxen were strong enough to pull wooden plows through the mud.', [2, 3]]
    ],
    tf: [
      ['Egyptian farmers grew crops in the desert sand.', false, 'Farms were only on the green strip the flood reached.'],
      ['Most Egyptians were farmers.', true, 'Their crops fed the whole country.'],
      ['Linen cloth was made from the flax plant.', true, 'Flax fibers were spun and woven into linen.']
    ],
    order: [
      ['A farmer\'s year:', ['Wait for the flood to go down', 'Plow and plant the seeds', 'Harvest the grain'], 'Flood (Akhet), then planting and growing (Peret), then harvest (Shemu).'],
      ['From field to bread:', ['Harvest the wheat', 'Grind the grain into flour', 'Bake the bread'], 'You must cut the grain before you can grind it, and grind it before you bake.', [2, 3]]
    ],
    levels: { 1: ['fact', 'fact', 'tf', 'order'], 2: ['fact', 'order', 'tf', 'fact'], 3: ['fact', 'order', 'tf'] }
  });


  // ================================================================ Unit 2: Pharaohs
  var FAR_SITES = ['giza', 'alexandria', 'tanis', 'amarna', 'abydos', 'karnak', 'abu-simbel', 'elephantine', 'siwa', 'kharga', 'meroe', 'serabit', 'byblos', 'kerma'];
  T('kids.pharaoh', {
    hint: 'A title is used for every person who holds the job, like "king" or "president."',
    fact: [
      ['What was a pharaoh?', 'The king (or sometimes queen) of all Egypt', ['The name of one famous king', 'A priest who looked after mummies', 'A kind of pyramid'], 'Pharaoh is a title, like "king."'],
      ['The word "pharaoh" comes from the Egyptian per-aa. What does per-aa mean?', '"Great House"', ['"Son of the Sun"', '"Lord of the Nile"', '"Strong Bull"'], 'Per-aa first meant the royal palace; later it came to mean the king who lived there.', null, pic('eg-glyphs', { word: 'pharaoh' })],
      ['Which word did Egyptians use most often for their king?', 'Nesu', ['Pharaoh', 'Cartouche', 'Shabti'], 'Nesu means "king." Calling the king "pharaoh" began later, in the New Kingdom.', [2, 3]],
      ['Was "Pharaoh" the personal name of one man?', 'No, it was a title used for many kings', ['Yes, it was the name of the first king', 'Yes, it was the name of the last king', 'No, it was the name of a god'], 'Each pharaoh had his or her own names too, written in cartouches.'],
      ['Which of these was a pharaoh\'s job?', 'Leading the army and making offerings in the temples', ['Teaching every child to read', 'Building every house in Egypt himself', 'Catching all the fish in the Nile'], 'Egyptians believed the king kept the world in order, with help from officials and priests.'],
      ['The house sign in per-aa shows a house from which view?', 'From above, like a plan', ['From the front', 'From underground', 'From far away'], 'It is a plan: the walls of a house with a doorway.', [2, 3], pic('eg-glyphs', { word: 'per' })]
    ],
    tf: [
      ['"Pharaoh" was the name of just one Egyptian king.', false, 'It was a title for every king, like the word "king."'],
      ['A few women ruled Egypt as pharaoh.', true, 'Hatshepsut is the most famous.'],
      ['Per-aa, the word behind "pharaoh," first meant the royal palace.', true, 'It means "Great House."'],
      ['Egyptians believed the king stood between the people and the gods.', true, 'He made offerings so the world stayed in order.']
    ],
    levels: { 1: ['fact', 'fact', 'tf'], 2: ['fact', 'tf', 'fact'], 3: ['fact', 'tf'] }
  });

  var CROWNS = [['the white crown', 'tall and white, shaped like a bowling pin', 'Upper Egypt (the south)'], ['the red crown', 'red, flat on top, with a tall back and a curl', 'Lower Egypt (the north)'], ['the double crown', 'the white crown set inside the red crown', 'both Upper and Lower Egypt']];
  T('kids.crowns', {
    hint: 'White and tall points up: Upper Egypt. Red with a curl: Lower Egypt. Both together: both lands.',
    fact: [
      ['What did the crook a king held stand for?', 'The king caring for his people as a shepherd cares for sheep', ['The king\'s love of fishing', 'The king\'s walking stick in old age', 'A weapon for battle'], 'The crook is a shepherd\'s staff; its sign writes heqa, "ruler."', null, pic('eg-glyphs', { word: 'heqa' })],
      ['What two things did kings often hold in their hands?', 'A crook and a flail', ['A sword and a shield', 'A pen and papyrus', 'A sickle and a shaduf'], 'You can see them on Tutankhamun\'s coffins.'],
      ['Why did kings put the two crowns together into one?', 'To show they ruled both Upper and Lower Egypt', ['Because one crown was too small', 'To make it easier to carry', 'Because the red crown was broken'], 'The double crown said "ruler of the Two Lands."']
    ],
    tf: [
      ['The white crown stood for Upper Egypt.', true, 'The tall white crown is Upper Egypt, the south.'],
      ['The red crown stood for Upper Egypt.', false, 'The red crown stood for Lower Egypt, the north.'],
      ['The double crown meant the king ruled both lands.', true, 'It is the white crown set inside the red crown.']
    ],
    custom: {
      crown: function (R, ctx) {
        var i = R.int(0, 2), c = CROWNS[i];
        if (R.coin()) return { q: 'A king wears <b>' + c[0] + '</b>: ' + c[1] + '. <b>Which land does it stand for?</b>', a: mcOf(c[2], CROWNS.filter(function (x, j) { return j !== i; }).map(function (x) { return x[2]; }).concat(ctx.level > 1 ? ['Nubia (far to the south)'] : [])), steps: [cap(c[0]) + ' stands for ' + c[2] + '.'] };
        return { q: 'Which crown stood for <b>' + c[2] + '</b>?', a: mcOf(cap(c[0]), CROWNS.filter(function (x, j) { return j !== i; }).map(function (x) { return cap(x[0]); })), steps: [cap(c[0]) + ' (' + c[1] + ') stands for ' + c[2] + '.'] };
      }
    },
    levels: { 1: ['crown', 'crown', 'fact', 'tf'], 2: ['crown', 'fact', 'tf'], 3: ['crown', 'fact', 'tf'] }
  });

  T('kids.one-kingdom', {
    hint: 'Egypt began as two lands, the south and the north, that were joined into one.',
    fact: [
      ['About when were Upper and Lower Egypt joined into one kingdom?', 'Around 3000 BC', ['Around 1300 BC', 'Around 30 BC', 'Around AD 1000'], 'That was hundreds of years before the first pyramid.'],
      ['Which king is shown on a carved palette wearing the white crown on one side and the red crown on the other?', 'Narmer', ['Khufu', 'Ramesses II', 'Tutankhamun'], 'The Narmer Palette shows him as ruler of both lands.'],
      ['What did Egyptians call their country after it was joined?', '"The Two Lands"', ['"The Red Land"', '"The Great Sea"', '"The Land of Punt"'], 'The name remembered the two halves, north and south.'],
      ['Before there were kings of all Egypt, how did people along the Nile live?', 'In villages and small kingdoms', ['In one big city', 'Only on boats', 'In pyramids'], 'Over many years, the small lands were joined together.'],
      ['Which came first?', 'Egypt becoming one kingdom', ['The Great Pyramid being built', 'Tutankhamun becoming king', 'Cleopatra becoming queen'], 'Egypt was joined around 3000 BC, long before the others.', [2, 3]],
      ['Later Egyptians remembered a first king named Menes. What do experts think?', 'Many think he was Narmer, but nobody is sure', ['He was Cleopatra\'s father', 'He built the Great Pyramid', 'He was a Greek general'], 'The evidence is not clear enough to be sure.', [2, 3]]
    ],
    tf: [
      ['Egypt was always one country.', false, 'It began as smaller lands that were joined together around 3000 BC.'],
      ['The Narmer Palette shows the king wearing the white crown and, on its other side, the red crown.', true, 'It shows him as king of both lands.'],
      ['Egypt became one kingdom before the pyramids were built.', true, 'It was joined around 3000 BC; the first pyramid came about 300 years later.']
    ],
    order: [['Put these in order, oldest first.', ['Egypt becomes one kingdom', 'The Great Pyramid is built', 'Tutankhamun is king', 'Cleopatra is queen'], 'About 3000 BC, about 2560 BC, about 1330 BC, and 51–30 BC.']],
    custom: { first: function (R, ctx) { return earliestQ(R, ctx, ['narmer', 'djoser', 'khufu', 'hatshepsut', 'ramesses2', 'cleopatra7'], 'Narmer, the king of the Narmer Palette, came first of all.'); } },
    levels: { 1: ['fact', 'tf', 'fact'], 2: ['fact', 'first', 'tf', 'order'], 3: ['order', 'first', 'fact'] }
  });

  T('kids.hatshepsut', {
    hint: 'Hatshepsut was a woman who ruled as king in the New Kingdom.',
    fact: [
      ['Who was Hatshepsut?', 'A woman who ruled Egypt as king', ['A goddess of the sky', 'The wife of Ramesses II', 'A scribe who found the Rosetta Stone'], 'She ruled for about 15 years in the New Kingdom.'],
      ['Where did Hatshepsut build her great temple?', 'At Deir el-Bahari, near Thebes', ['At Giza, beside the pyramids', 'At Alexandria, by the sea', 'At Abu Simbel, in Nubia'], 'It stands in terraces under the cliffs on the west bank at Thebes.'],
      ['Hatshepsut sent ships to a faraway land to bring back incense trees. What was it called?', 'Punt', ['Rome', 'Kemet', 'Babylon'], 'Where exactly Punt was is still debated; probably on the Red Sea coast of Africa.'],
      ['How do statues often show Hatshepsut?', 'Dressed as a king, sometimes even with the king\'s false beard', ['As a cat', 'Always as a small child', 'Wearing armor from Rome'], 'That was how a king was supposed to look.'],
      ['For whom did Hatshepsut rule at first, before she became king herself?', 'For the young boy Thutmose III', ['For Ramesses II', 'For Cleopatra', 'For the gods of Punt'], 'Thutmose III was a small child when his father died.', [2, 3]],
      ['How do we know about the trip to Punt?', 'It is carved on the walls of her temple', ['From a letter by Cleopatra', 'From a photograph', 'From the Rosetta Stone'], 'The carvings show the ships, the people of Punt and the trees.', [2, 3]]
    ],
    tf: [
      ['Only men could be pharaoh.', false, 'A few women ruled, and Hatshepsut is the most famous.'],
      ['Hatshepsut ruled side by side with the young Thutmose III.', true, 'She ruled for him at first, then took the title of king.'],
      ['Everyone knows exactly where the land of Punt was.', false, 'Its location is still debated.'],
      ['Hatshepsut lived after Ramesses II.', false, 'She ruled about 200 years before him.', [2, 3]]
    ],
    custom: { map: function (R, ctx) { return mapPick(R, ctx, 'deir-el-bahari', FAR_SITES, { minKm: 150, q: 'Hatshepsut\'s temple is at Deir el-Bahari, near Thebes in Upper Egypt. <b>Which lettered dot is Deir el-Bahari?</b>', why: 'It is on the west bank at Thebes, in Upper Egypt.' }); },
      first: function (R, ctx) { return earliestQ(R, ctx, ['khufu', 'hatshepsut', 'ramesses2', 'cleopatra7'], 'Hatshepsut ruled in the New Kingdom, before Ramesses II.'); } },
    levels: { 1: ['fact', 'tf', 'map'], 2: ['fact', 'map', 'tf', 'first'], 3: ['fact', 'first', 'map'] }
  });

  T('kids.ramesses', {
    hint: 'Ramesses II ruled for 66 years and built giant temples in Nubia.',
    fact: [
      ['How long did Ramesses II rule?', 'About 66 years', ['About 6 years', 'About 600 years', 'About 3,000 years'], 'One of the longest reigns in Egyptian history.'],
      ['Which famous temples did Ramesses II cut into a cliff in Nubia?', 'The temples of Abu Simbel', ['The pyramids of Giza', 'The Step Pyramid', 'The Valley of the Kings'], 'Four giant seated statues of him guard the entrance.'],
      ['Against whom did Ramesses II fight the battle of Kadesh?', 'The Hittites', ['The Romans', 'The Greeks of Alexandria', 'The people of Punt'], 'Later the two sides made a peace treaty.'],
      ['What did Ramesses II and the Hittites do years after the battle of Kadesh?', 'They made a peace treaty', ['They fought every year forever', 'They built a pyramid together', 'They moved to Rome'], 'Copies of the treaty survive in both Egyptian and Hittite.', [2, 3]],
      ['Why were the temples of Abu Simbel moved in the 1960s?', 'A new dam made a lake that would have covered them', ['They were sinking into the sand', 'Tourists wanted them closer to Cairo', 'Ramesses asked for it in his will'], 'Engineers cut them into blocks and rebuilt them on higher ground (1964–68).', [2, 3]],
      ['About how tall is each giant statue of Ramesses at Abu Simbel?', 'About 20 meters', ['About 2 meters', 'About 200 meters', 'About 2,000 meters'], 'Each is as tall as a building of six or seven floors.', [3]]
    ],
    tf: [
      ['One pharaoh, Ramesses II, ruled for almost all of Egyptian history.', false, 'There were hundreds of kings over about three thousand years; Ramesses ruled 66 of them.'],
      ['Ramesses II built the temples of Abu Simbel.', true, 'They were cut into a cliff in Nubia.'],
      ['The Abu Simbel temples were moved to save them from a new lake.', true, 'They were moved block by block in 1964–68.']
    ],
    custom: { map: function (R, ctx) { return mapPick(R, ctx, 'abu-simbel', FAR_SITES.concat(['philae', 'luxor']), { view: 'nile', minKm: 200, q: 'Abu Simbel is far to the south, in Nubia. <b>Which lettered dot is Abu Simbel?</b>', why: 'It lies far up the Nile, beyond the First Cataract, in Nubia.' }); },
      first: function (R, ctx) { return earliestQ(R, ctx, ['djoser', 'khufu', 'hatshepsut', 'ramesses2', 'cleopatra7'], 'Bigger numbers BC are longer ago.'); } },
    levels: { 1: ['fact', 'tf', 'map'], 2: ['fact', 'map', 'first', 'tf'], 3: ['fact', 'first', 'map'] }
  });

  T('kids.tutankhamun', {
    hint: 'Tutankhamun was a young king; he is famous because of what was found in his tomb.',
    fact: [
      ['About how old was Tutankhamun when he became king?', 'About eight or nine', ['About forty', 'About eighty', 'He was a baby, one day old'], 'He was a boy king, and he died at about eighteen.'],
      ['Why is Tutankhamun so famous today?', 'His tomb was found nearly untouched, full of treasure', ['He ruled longer than any other king', 'He built the Great Pyramid', 'He was the first king of Egypt'], 'Robbers emptied almost every other royal tomb long ago.'],
      ['When was Tutankhamun\'s tomb found?', 'In 1922', ['In 1799', 'In 30 BC', 'In 2020'], 'Howard Carter found the steps in November 1922.'],
      ['Where was Tutankhamun\'s tomb?', 'In the Valley of the Kings', ['Inside the Great Pyramid', 'Under the Sphinx', 'In Alexandria'], 'The Valley is behind the cliffs on the west bank at Thebes.'],
      ['Tutankhamun was born Tutankhaten. Why did he change his name?', 'To honor the god Amun, whose worship he brought back', ['Because he did not like how it sounded', 'To sound more Greek', 'Because a scribe spelled it wrong'], 'The name means "living image of Amun."', [2, 3]],
      ['Was Tutankhamun the greatest and most powerful pharaoh?', 'No, he was a young king who ruled only about nine years', ['Yes, he conquered the whole world', 'Yes, he built more temples than anyone', 'No, he was never a king'], 'His fame comes from his tomb, not his deeds.', [2, 3]]
    ],
    tf: [
      ['Tutankhamun ruled for about 66 years.', false, 'He ruled only about nine years and died young. Ramesses II ruled 66 years.'],
      ['Tutankhamun\'s tomb was found nearly complete.', true, 'That is why we know so much about it.'],
      ['Experts know for sure why Tutankhamun died young.', false, 'Nobody knows for sure.'],
      ['Tutankhamun ruled after Akhenaten and before Ramesses II.', true, 'He ruled about 1336–1327 BC.', [2, 3]]
    ],
    custom: { first: function (R, ctx) { return earliestQ(R, ctx, ['khufu', 'hatshepsut', 'tutankhamun', 'cleopatra7', 'alexander'], 'Bigger numbers BC are longer ago.'); } },
    levels: { 1: ['fact', 'tf', 'fact'], 2: ['fact', 'tf', 'first'], 3: ['fact', 'first', 'tf'] }
  });

  T('kids.cleopatra', {
    hint: 'Cleopatra VII lived very late in Egyptian history, about 2,000 years ago.',
    fact: [
      ['Who was Cleopatra VII?', 'The last ruler of the Ptolemies, a Greek family that ruled Egypt', ['The builder of the Great Pyramid', 'The first queen of Egypt', 'A goddess of the Nile'], 'After her death, Egypt became part of the Roman Empire.'],
      ['What happened to Egypt after Cleopatra died in 30 BC?', 'It became part of the Roman Empire', ['The pyramids were built', 'It split into Upper and Lower Egypt again', 'Tutankhamun became king'], 'Rome won the war, and Egypt became a Roman province.'],
      ['Which language did most of Cleopatra\'s family speak?', 'Greek', ['Latin', 'English', 'Only Egyptian'], 'They came from Macedonia, in Greece. Cleopatra was the first of them known to learn Egyptian.'],
      ['From which city did the Ptolemies rule Egypt?', 'Alexandria', ['Thebes', 'Memphis', 'Rome'], 'Alexandria, on the Mediterranean coast, was founded by Alexander the Great.', [2, 3]],
      ['Who conquered Egypt in 332 BC, before the Ptolemies?', 'Alexander the Great', ['Ramesses II', 'Julius Caesar', 'Narmer'], 'When Alexander died, his general Ptolemy became king of Egypt.', [2, 3]]
    ],
    tf: [
      ['Cleopatra lived when the pyramids of Giza were built.', false, 'She lived more than 2,000 years after the Great Pyramid.'],
      ['Cleopatra lived closer in time to us than to the building of the Great Pyramid.', true, 'From c. 2560 BC to 30 BC is about 2,530 years; from 30 BC to today is about 2,050 years.'],
      ['Cleopatra was the first in her family known to learn the Egyptian language.', true, 'Her family mostly spoke Greek.']
    ],
    custom: {
      gap: function (R, ctx) {
        var a = R.pick([[2560, 'the Great Pyramid was built'], [3000, 'Egypt became one kingdom'], [1330, 'Tutankhamun was king'], [1270, 'Ramesses II was king']]);
        var d = a[0] - 30;
        return { q: 'About ' + a[0] + ' BC, ' + a[1] + '. Cleopatra died in 30 BC. <b>About how many years apart are they?</b>', a: { t: 'num', v: String(d) }, unit: 'years',
          steps: ['Both years are BC, so subtract: ' + a[0] + ' − 30 = ' + d + '.', 'About ' + d.toLocaleString('en-US') + ' years apart.'] };
      },
      first: function (R, ctx) { return earliestQ(R, ctx, ['khufu', 'hatshepsut', 'ramesses2', 'alexander', 'cleopatra7'], 'Cleopatra ruled last of all of these, from 51 to 30 BC.'); }
    },
    levels: { 1: ['fact', 'tf', 'fact'], 2: ['fact', 'first', 'tf', 'gap'], 3: ['gap', 'first', 'fact'] }
  });


  // ================================================================ Unit 3: Pyramids
  var PYR_LOOK = { step: ['Djoser\'s Step Pyramid', 'six big steps'], bent: ['Sneferu\'s Bent Pyramid', 'a slope that changes partway up'], red: ['Sneferu\'s Red Pyramid', 'smooth sides at a gentle slope'], great: ['Khufu\'s Great Pyramid', 'smooth sides, the biggest of all'] };
  T('kids.why-pyramids', {
    hint: 'Pyramids were built for kings who had died.',
    fact: [
      ['What were the pyramids?', 'Tombs for kings', ['Palaces where kings lived', 'Storehouses for grain', 'Lookout towers'], 'They protected the king\'s body and helped him live forever, Egyptians believed.'],
      ['What stood beside each pyramid?', 'Temples where priests brought offerings', ['Shops and markets', 'Houses for the king\'s pets', 'Nothing at all'], 'The offerings were meant to keep the king fed in the afterlife.'],
      ['Why were pyramids made of solid stone?', 'To keep the king\'s burial safe and last forever', ['To keep the inside warm', 'Because stone was the cheapest material', 'So people could live inside'], 'A mountain of stone was meant to protect the burial for all time.'],
      ['Many experts think the pyramid shape had a meaning. Which idea do they suggest?', 'The first mound of land at creation, or the slanting rays of the sun', ['A mountain where the king went skiing', 'A giant arrow pointing to Rome', 'A stack of bread loaves'], 'These are ideas experts suggest; the Egyptians did not leave a clear explanation.', [2, 3]],
      ['Where was the king buried in the Great Pyramid?', 'In a stone room deep inside, the King\'s Chamber', ['On the very top, in the open', 'In a house next door', 'In a boat on the Nile'], 'Narrow passages lead to the rooms inside.', [2, 3], pic('eg-pyramid', { view: 'section' })],
      ['In which period were the great pyramids built?', 'The Old Kingdom', ['The time of Cleopatra', 'The Roman period', 'The time of Tutankhamun'], 'The Old Kingdom is often called the age of the pyramids.', [2, 3]]
    ],
    tf: [
      ['Pyramids were palaces where kings lived.', false, 'They were tombs, with temples beside them.'],
      ['Robbers broke into almost all of the pyramids long ago.', true, 'Hidden passages and blocking stones did not stop them.'],
      ['Egypt has more than one hundred pyramids.', true, 'The three at Giza are the most famous.', [2, 3]],
      ['Every Egyptian was buried in a pyramid.', false, 'Pyramids were for kings (and some queens).']
    ],
    levels: { 1: ['fact', 'tf'], 2: ['fact', 'fact', 'tf'], 3: ['fact', 'tf'] }
  });

  T('kids.steps-to-smooth', {
    hint: 'First came steps, then a bent slope, then smooth sides.',
    fact: [
      ['Which king had the first pyramid, the one with six big steps?', 'Djoser', ['Khufu', 'Tutankhamun', 'Cleopatra'], 'His builder Imhotep stacked six layers of stone.'],
      ['Who is said to have designed Djoser\'s Step Pyramid?', 'Imhotep', ['Howard Carter', 'Champollion', 'Narmer'], 'Imhotep was Djoser\'s high official and builder.'],
      ['What is odd about the Bent Pyramid\'s shape?', 'Its slope changes partway up', ['It is round', 'It is upside down', 'It has no top'], 'The builders switched to a gentler slope halfway, probably because the steep slope was not safe.'],
      ['Which was the first smooth-sided pyramid to be finished?', 'The Red Pyramid', ['The Step Pyramid', 'The Bent Pyramid', 'Menkaure\'s pyramid'], 'Sneferu built it at Dahshur with a gentle slope.'],
      ['Which king built both the Bent Pyramid and the Red Pyramid?', 'Sneferu', ['Djoser', 'Ramesses II', 'Hatshepsut'], 'Sneferu was Khufu\'s father.', [2, 3]],
      ['Before Djoser, what were kings buried under?', 'Low, flat tombs of mud brick', ['Glass domes', 'Tall towers of wood', 'Giant statues'], 'Djoser\'s builder stacked stone layers on top of one another.', [2, 3]]
    ],
    tf: [
      ['All Egyptian pyramids look the same.', false, 'Builders tried steps, a bent slope, and then smooth sides.'],
      ['Djoser\'s pyramid came before Khufu\'s Great Pyramid.', true, 'Djoser\'s was the first; Khufu\'s came less than a hundred years later.'],
      ['The Bent Pyramid was built after the Great Pyramid.', false, 'Sneferu built it before his son Khufu built the Great Pyramid.']
    ],
    order: [['Put these pyramids in order, oldest first.', ['Djoser\'s Step Pyramid', 'Sneferu\'s Bent Pyramid', 'Sneferu\'s Red Pyramid', 'Khufu\'s Great Pyramid'], 'Steps, then a bent slope, then the first smooth sides, then the biggest of all.']],
    custom: {
      which: function (R, ctx) {
        var keys = ctx.level === 1 ? ['step', 'bent'] : ['step', 'bent', 'great'], k = R.pick(keys), L = PYR_LOOK[k];
        var others = Object.keys(PYR_LOOK).filter(function (x) { return x !== k && (k !== 'great' || x !== 'red') && (k !== 'red' || x !== 'great'); }).map(function (x) { return PYR_LOOK[x][0]; });
        return { q: 'Look at the shape of this pyramid. <b>Which pyramid is it?</b>', a: mcOf(L[0], R.sample(others, Math.min(others.length, nWrong(ctx)))), steps: ['It has ' + L[1] + '.', 'That is ' + L[0] + '.'],
          viz: pic('eg-pyramid', { which: k, view: 'profile', hide: ['h', 'base', 'slope'], dims: false }) };
      }
    },
    levels: { 1: ['which', 'fact', 'tf'], 2: ['which', 'fact', 'order', 'tf'], 3: ['order', 'which', 'fact'] }
  });

  var GIZA = [['great', 'Khufu'], ['khafre', 'Khafre'], ['menkaure', 'Menkaure']];
  T('kids.giza', {
    hint: 'Khufu\'s is the biggest, Khafre\'s is nearly as big, and Menkaure\'s is the smallest. The Sphinx is by Khafre\'s.',
    fact: [
      ['Which king built the biggest pyramid at Giza?', 'Khufu', ['Menkaure', 'Djoser', 'Tutankhamun'], 'Khufu\'s Great Pyramid was about 147 m tall when new.'],
      ['Which of the three Giza pyramids is the smallest?', 'Menkaure\'s', ['Khufu\'s', 'Khafre\'s', 'They are all the same size'], 'Menkaure\'s was about 66 m tall.'],
      ['What is the Great Sphinx?', 'A huge lion with a king\'s head, carved from the rock', ['A pyramid with steps', 'A statue of a cat goddess', 'A boat for the king'], 'It lies at Giza, beside the stone road to Khafre\'s pyramid.'],
      ['Where is the Great Sphinx?', 'At Giza, beside the path to Khafre\'s pyramid', ['Far out in the desert, days away', 'In the Valley of the Kings', 'At Abu Simbel'], 'It is part of the Giza pyramid site.'],
      ['Why does Khafre\'s pyramid look almost as tall as Khufu\'s?', 'It stands on higher ground', ['It is made of gold', 'It was built later and taller', 'It has a tower on top'], 'Khufu\'s is a little taller, but Khafre\'s sits higher up.', [2, 3]],
      ['For about how long was the Great Pyramid the tallest building in the world?', 'More than 3,700 years', ['About 10 years', 'About 100 years', 'It never was'], 'No building was taller until about 700 years ago.', [2, 3]],
      ['How were Khufu, Khafre and Menkaure related?', 'Khafre was Khufu\'s son, and Menkaure was Khafre\'s son', ['They were strangers', 'They were three brothers born on the same day', 'Menkaure was Khufu\'s father'], 'Each king built near his family.', [3]]
    ],
    tf: [
      ['The Great Sphinx is far away from the pyramids.', false, 'It is at Giza, beside Khafre\'s causeway.'],
      ['Khufu\'s pyramid is the biggest at Giza.', true, 'It was about 147 m tall.'],
      ['Writing from Khafre\'s own time says that the Sphinx is his.', false, 'Many experts think its face is Khafre\'s, but no writing from his time says so.', [2, 3]]
    ],
    custom: {
      map: function (R, ctx) { return mapPick(R, ctx, 'giza', FAR_SITES.filter(function (k) { return k !== 'giza'; }), { minKm: 150, q: 'The pyramids of Giza are beside modern Cairo, near the point where the Delta begins. <b>Which lettered dot is Giza?</b>', why: 'Giza is at the south tip of the Delta, by Cairo.' }); },
      height: function (R, ctx) {
        var two = R.sample(GIZA, 2), E = EG(), h0 = Math.round(E.PYRAMIDS[two[0][0]].h), h1 = Math.round(E.PYRAMIDS[two[1][0]].h);
        var hi = h0 > h1 ? two[0] : two[1], lo = h0 > h1 ? two[1] : two[0], H = Math.max(h0, h1), Lw = Math.min(h0, h1);
        return { q: 'When they were new, ' + two[0][1] + '\'s pyramid was about ' + h0 + ' m tall and ' + two[1][1] + '\'s about ' + h1 + ' m. <b>How many meters taller was ' + hi[1] + '\'s?</b>', a: { t: 'num', v: String(H - Lw) }, unit: 'm',
          steps: ['Subtract the smaller height from the bigger one.', H + ' − ' + Lw + ' = ' + (H - Lw) + ' m.'], viz: showPic('eg-pyramid', { compare: [two[0][0], two[1][0]], ref: false }) };
      }
    },
    levels: { 1: ['fact', 'tf', 'map'], 2: ['fact', 'map', 'height', 'tf'], 3: ['height', 'fact', 'map'] }
  });

  T('kids.building', {
    hint: 'Skilled Egyptian teams did the work with copper tools, sledges and ramps.',
    fact: [
      ['Who built the pyramids?', 'Teams of skilled Egyptian workers', ['Slaves from faraway lands', 'Visitors from another world', 'Giants'], 'Archaeologists found the workers\' town, their bakeries and their tombs.'],
      ['How did workers move heavy blocks across the sand?', 'They dragged them on wooden sledges', ['They rolled them on rubber wheels', 'They used cranes with engines', 'They carried them on camels'], 'A painting shows water poured on the sand in front of a sledge to make it slide.'],
      ['What tools did workers use to cut the stone?', 'Copper chisels and hard stone hammers', ['Steel saws', 'Lasers', 'Wooden spoons'], 'Copper was the metal they had.'],
      ['How did workers raise blocks up the pyramid?', 'On ramps, though just how the ramps ran is still unknown', ['With engines and cranes', 'They floated them up', 'They threw them'], 'Experts suggest straight, zigzag or wrapped ramps; nobody knows for sure.'],
      ['What did a papyrus diary found in 2013 describe?', 'An official named Merer\'s team carrying stone by boat for Khufu\'s pyramid', ['How slaves were captured', 'A recipe for cake', 'Cleopatra\'s travels'], 'It is one of the oldest written papyri ever found.', [2, 3]],
      ['Where did the fine white stone for the outside of the Great Pyramid come from?', 'Tura, across the Nile, by boat', ['From the sea floor', 'From Rome', 'From under the Sphinx'], 'Most other stone was cut right at Giza; granite came from Aswan.', [2, 3]],
      ['What did archaeologists find near the pyramids that tells us who the builders were?', 'A town with bakeries and the workers\' own tombs', ['A spaceship', 'A modern factory', 'A Roman fort'], 'The workers were Egyptians, and they were fed and buried with honor.', [2, 3]],
      ['About how many stone blocks are in the Great Pyramid?', 'About 2.3 million', ['About 230', 'About 23,000', 'About 2.3 billion'], 'It took many years and thousands of workers.', [3]]
    ],
    tf: [
      ['Slaves built the pyramids.', false, 'The evidence shows teams of Egyptian workers, with their own town, bakeries and tombs.'],
      ['We know exactly how the ramps were laid out at the Great Pyramid.', false, 'Remains of ramps exist elsewhere, but how they ran at the Great Pyramid is still unknown.'],
      ['Wet sand made it easier to drag a sledge.', true, 'Wet sand is firmer, so the sledge slides better.'],
      ['Workers wrote their team names on some of the stones.', true, 'Team names written on the stones are part of the evidence.', [2, 3]]
    ],
    order: [['How a block reached the pyramid:', ['Cut the block in the quarry', 'Drag it on a sledge', 'Haul it up a ramp', 'Set it in its place'], 'Cut, drag, raise, place.']],
    levels: { 1: ['fact', 'tf', 'fact'], 2: ['fact', 'tf', 'order', 'fact'], 3: ['fact', 'order', 'tf'] }
  });


  // ================================================================ Unit 4: Gods and the Afterlife
  // how gods were pictured and what they cared for, in kids' words; each is checked against GODS.look / GODS.role by the tests
  var KID_HEAD = { horus: 'falcon', anubis: 'jackal', thoth: 'ibis', bastet: 'cat', hathor: 'cow', sobek: 'crocodile', sekhmet: 'lioness', khnum: 'ram' };
  var HEAD_TELL = { falcon: 'a hunting bird with a short hooked beak', jackal: 'a wild dog with a long snout and tall pointed ears', ibis: 'a wading bird with a long, thin, curved beak', cat: 'a cat', cow: 'a cow, or cow horns', crocodile: 'a crocodile', lioness: 'a lioness', ram: 'a ram with curling horns' };
  var KID_ROLE = { ra: 'the sun', nut: 'the sky', geb: 'the earth', hapi: 'the Nile flood', thoth: 'writing and wisdom', bes: 'homes, mothers and children', taweret: 'mothers and babies being born', hathor: 'love, music and joy', osiris: 'the land of the dead', anubis: 'embalming and graveyards', ptah: 'craftsmen and making things', maat: 'truth and right order' };
  function godName(k) { return EG().god(k).name; }
  T('kids.many-gods', {
    hint: 'Each god cared for one part of the world, like the sun, the sky or the flood.',
    fact: [
      ['How many gods did the ancient Egyptians believe in?', 'Many gods', ['Just one god', 'No gods at all', 'Exactly two gods'], 'More than a thousand gods are known by name.'],
      ['What did Egyptians believe a temple was?', 'A house for a god, where priests cared for the god\'s statue', ['A school for children', 'A market for selling bread', 'A palace for the king\'s family'], 'Priests brought food, clothes and incense to the statue every day.'],
      ['How did Egyptians picture many of their gods?', 'As people, animals, or people with animal heads', ['Only as stars', 'Only as trees', 'They never made pictures of gods'], 'The picture showed what a god was like.'],
      ['Egyptians said one god sailed across the sky in a boat every day. Who?', 'Ra, the sun god', ['Hapi, the flood', 'Geb, the earth', 'Bes, the household god'], 'That is what the sun seems to do each day.'],
      ['Which god did families keep at home to protect mothers and children?', 'Bes', ['Seth', 'Ra', 'Sobek'], 'Bes was a small god with a lion-like face; he had no big temples of his own.', [2, 3]]
    ],
    tf: [
      ['Egyptians believed in only one god.', false, 'They believed in many gods.'],
      ['Some gods belonged to just one town.', true, 'Others were worshipped all over Egypt.'],
      ['Egyptians believed the gods were only animals.', false, 'They pictured many gods as people with animal heads, to show what each was like.']
    ],
    custom: {
      role: function (R, ctx) {
        var keys = ctx.level === 1 ? ['ra', 'nut', 'geb', 'hapi', 'thoth', 'bes', 'osiris'] : Object.keys(KID_ROLE), k = R.pick(keys);
        var wr = R.sample(keys.filter(function (x) { return x !== k; }), nWrong(ctx));
        if (R.coin()) return { q: 'Which god did Egyptians believe cared for <b>' + KID_ROLE[k] + '</b>?', a: mcOf(godName(k), wr.map(godName)), steps: [godName(k) + ' cared for ' + KID_ROLE[k] + ', Egyptians believed.'] };
        return { q: 'What did Egyptians believe the god <b>' + godName(k) + '</b> cared for?', a: mcOf(cap(KID_ROLE[k]), wr.map(function (x) { return cap(KID_ROLE[x]); })), steps: ['Egyptians believed ' + godName(k) + ' cared for ' + KID_ROLE[k] + '.'] };
      }
    },
    levels: { 1: ['role', 'fact', 'tf'], 2: ['role', 'fact', 'role', 'tf'], 3: ['role', 'fact', 'tf'] }
  });

  var NAME_GODS1 = ['horus', 'thoth', 'anubis'], NAME_GODS2 = ['horus', 'thoth', 'anubis', 'osiris', 'isis', 'amun', 'ptah', 'geb'];
  T('kids.god-animals', {
    hint: 'Falcon: Horus. Jackal: Anubis. Ibis: Thoth. Cat: Bastet. Cow: Hathor. Crocodile: Sobek.',
    fact: [
      ['Why did Egyptians give gods animal heads?', 'The animal showed what the god was like or did', ['They thought gods really looked like that every day', 'Artists could not draw human heads', 'To scare children'], 'A falcon flies high, like Horus, god of the sky.'],
      ['Why was the jackal linked with the dead?', 'Jackals roamed near graveyards at the edge of the desert', ['Jackals were the pets of kings', 'Jackals lived in the Nile', 'Jackals could read'], 'So the jackal Anubis became the guardian of the dead.', [2, 3]],
      ['Which god watched over tombs and the dead: Anubis the jackal, or Bastet the cat?', 'Anubis, the jackal', ['Bastet, the cat', 'Both of them', 'Neither of them'], 'Bastet protected homes; Anubis watched over the dead.', [2, 3]]
    ],
    tf: [
      ['Anubis had the head of a cat.', false, 'Anubis had a jackal\'s head; Bastet was the cat.'],
      ['Thoth had the head of an ibis, a bird with a long curved beak.', true, 'Horus is the falcon, with a short hooked beak.'],
      ['Hathor could be shown as a cow, or as a woman with cow horns.', true, 'She was a goddess of love, music and joy.']
    ],
    custom: {
      head: function (R, ctx) {
        var keys = Object.keys(KID_HEAD), k = R.pick(ctx.level === 1 ? ['horus', 'anubis', 'thoth', 'bastet', 'sobek', 'hathor'] : keys), an = KID_HEAD[k];
        var wr = R.sample(keys.filter(function (x) { return x !== k; }), nWrong(ctx));
        if (R.coin()) return { q: 'A painting shows a god with the head of <b>' + HEAD_TELL[an] + '</b>. <b>Which god is it?</b>', a: mcOf(godName(k), wr.map(godName)), steps: [godName(k) + ' was shown with the head of a ' + an + '.'] };
        return { q: 'What animal\'s head did Egyptians give the god <b>' + godName(k) + '</b>?', a: mcOf(cap(an), wr.map(function (x) { return cap(KID_HEAD[x]); })), steps: [godName(k) + ' was shown with the head of a ' + an + ' (' + HEAD_TELL[an] + ').'] };
      },
      sign: function (R, ctx) {
        var W = EG().WORDS, keys = ctx.level === 1 ? NAME_GODS1 : NAME_GODS1.concat(['osiris', 'isis']), k = R.pick(keys);
        var wr = R.sample(NAME_GODS2.filter(function (x) { return x !== k; }), nWrong(ctx));
        var tell = { horus: 'The falcon is Horus.', thoth: 'The ibis on a stand is Thoth.', anubis: 'The jackal lying at the end is Anubis\'s hint sign.', osiris: 'The throne (seat) and the eye spell Osiris.', isis: 'The throne (seat), the loaf and the egg spell Isis.' }[k];
        return { q: 'These hieroglyphs write the name of a god. <b>Which god?</b>', a: mcOf(W[k].en, wr.map(function (x) { return W[x].en; })), steps: [tell, 'The name is ' + W[k].en + '.'], viz: pic('eg-glyphs', { word: k, size: 96 }) };
      }
    },
    levels: { 1: ['head', 'head', 'sign', 'tf'], 2: ['head', 'sign', 'fact', 'tf'], 3: ['head', 'sign', 'fact', 'tf'] }
  });

  T('kids.osiris-isis', {
    hint: 'Osiris: the good king who rules the dead. Isis: his wife, great in magic. Horus: their son. Seth: the jealous brother.',
    fact: [
      ['In the story, who killed Osiris?', 'His jealous brother Seth', ['His son Horus', 'His wife Isis', 'The sun god Ra'], 'Then Isis searched for Osiris and brought him back.'],
      ['Who used her magic to bring Osiris back?', 'Isis, his wife', ['Hathor', 'Bastet', 'Sekhmet'], 'Isis was known for her great magic.'],
      ['After he was brought back, where did Osiris rule?', 'The land of the dead', ['The sky', 'The sea', 'Rome'], 'He became king of the afterlife.'],
      ['Who was the son of Osiris and Isis?', 'Horus', ['Seth', 'Anubis', 'Thoth'], 'Horus grew up and won back the throne.'],
      ['How did Egyptians see Osiris?', 'As a kind king who gave new life', ['As the god of evil', 'As a trickster', 'As a monster'], 'Paintings show him with green skin, the color of growing plants.'],
      ['Which god was each living king linked with?', 'Horus', ['Seth', 'Osiris', 'Geb'], 'A king who died was linked with Osiris.', [2, 3]],
      ['What sign do both the names Osiris and Isis begin with?', 'A throne, or seat', ['A loaf of bread', 'An owl', 'A walking pair of legs'], 'Isis often wore the throne sign on her head.', [2, 3], pic('eg-glyphs', { words: ['osiris', 'isis'] })]
    ],
    tf: [
      ['Osiris was the god of evil because he ruled the dead.', false, 'Egyptians saw him as a kind king who gave new life.'],
      ['Horus fought Seth to win back the throne.', true, 'Horus won and became king.'],
      ['Egyptians told the story of Osiris in just one way.', false, 'They told it in many ways; no one Egyptian text tells all of it.', [2, 3]]
    ],
    order: [['The story of Osiris:', ['Seth kills Osiris', 'Isis brings Osiris back with her magic', 'Osiris rules the land of the dead', 'Horus grows up and wins the throne'], 'The good king dies and lives again, and his son takes the throne.']],
    levels: { 1: ['fact', 'fact', 'tf'], 2: ['fact', 'order', 'tf'], 3: ['order', 'fact', 'tf'] }
  });

  T('kids.mummies', {
    hint: 'Families wanted the body to last, so it was dried and then wrapped.',
    fact: [
      ['Why did Egyptians make mummies?', 'They believed the body was needed in the life after death', ['To scare away robbers', 'To make statues for temples', 'Because it was a game'], 'Families cared for the bodies of people they loved.'],
      ['What did embalmers use to dry the body?', 'Natron, a natural salt', ['Sugar', 'Water from the Nile', 'Hot sand from the oven'], 'Salt soaks up water, and a dry body does not spoil.'],
      ['What were mummies wrapped in?', 'Many layers of linen bandages', ['Paper from trees', 'Plastic wrap', 'Gold sheets only'], 'Linen was made from the flax plant.'],
      ['About how long did the whole careful work of mummification take?', 'About 70 days', ['About 7 minutes', 'About 7 years', 'About 700 days'], 'Drying and wrapping took many weeks.'],
      ['What small lucky charms were tucked between the bandages?', 'Amulets', ['Coins', 'Shabtis', 'Cartouches'], 'Egyptians believed amulets protected the dead.', [2, 3]],
      ['Which god was linked with embalming?', 'Anubis', ['Hapi', 'Bastet', 'Ra'], 'Anubis, the jackal, watched over the dead.', [2, 3]],
      ['How can scientists today see inside a mummy without unwrapping it?', 'With scanners, like those in hospitals', ['By shaking it', 'By reading its cartouche', 'They cannot'], 'Scans show the bones and the amulets inside.', [2, 3]]
    ],
    tf: [
      ['Mummies are monsters.', false, 'A mummy is a real person whose body was kept with care by their family.'],
      ['Egyptians also mummified animals, such as cats.', true, 'Animal mummies were often gifts for the gods.'],
      ['Embalmers wrapped the body before drying it.', false, 'First they dried it with natron, then they wrapped it.']
    ],
    order: [['The main steps of mummification:', ['Dry the body with natron', 'Wrap it in linen with amulets', 'Place it in a coffin'], 'Dry first, so it lasts; then wrap; then lay it in the coffin.']],
    levels: { 1: ['fact', 'tf', 'fact'], 2: ['fact', 'order', 'tf'], 3: ['order', 'fact', 'tf'] }
  });

  T('kids.tombs-treasure', {
    hint: 'Egyptians imagined the next life as much like this one, so they packed what a person would need.',
    fact: [
      ['What were shabtis?', 'Little figures meant to do work for the dead person in the afterlife', ['Toy boats', 'Kinds of bread', 'Guards who watched the tomb at night'], 'Many hold tiny hoes and baskets for farm work.'],
      ['Why did Egyptians put food and furniture in tombs?', 'They believed the dead would need them in the next life', ['To store them safely for later', 'To sell them to robbers', 'Because houses were too full'], 'The next life was pictured as a better version of life by the Nile.'],
      ['Who had tombs in ancient Egypt?', 'Many families, rich and poor, not only kings', ['Only kings', 'Only priests', 'Nobody'], 'Tombs ranged from simple graves to painted rooms in the rock.'],
      ['Why might a tomb hold a board game?', 'So the dead person could enjoy playing in the afterlife', ['To keep robbers busy', 'To teach the gods to count', 'It was a mistake'], 'Tutankhamun\'s tomb held several game boards.'],
      ['What did families bring to tombs after the burial?', 'Fresh offerings of food and drink', ['Nothing ever again', 'Their pets to live there', 'New furniture every day'], 'The sign hetep, "offering," shows a loaf on a mat.', [2, 3], pic('eg-glyphs', { word: 'hetep' })]
    ],
    tf: [
      ['Only kings had tombs.', false, 'Many families had tombs too.'],
      ['Shabtis were meant to work for the dead in the afterlife.', true, 'They would answer if the dead person was called to work.'],
      ['Some tombs held hundreds of shabtis.', true, 'Some burials had one for every day of the year.', [2, 3]]
    ],
    levels: { 1: ['fact', 'tf'], 2: ['fact', 'fact', 'tf'], 3: ['fact', 'tf'] }
  });

  T('kids.weighing-heart', {
    hint: 'The heart went on one side of the scale and the feather of Maat on the other.',
    fact: [
      ['In the weighing of the heart, what was the heart weighed against?', 'The feather of Maat, truth and right', ['A heavy gold bar', 'A loaf of bread', 'The king\'s crown'], 'If the scale balanced, the person had lived a good life.'],
      ['To pass the test, what did the heart have to do?', 'Balance the feather: as light as it, free of wrongdoing', ['Be much heavier than the feather', 'Be made of gold', 'Beat very fast'], 'Wrongdoing made a heart heavy, Egyptians believed.'],
      ['Which god is often shown checking the scale?', 'Anubis, the jackal', ['Bastet, the cat', 'Sobek, the crocodile', 'Hapi, the flood'], 'Thoth, the ibis, writes down the result.'],
      ['Which god writes down the result of the weighing?', 'Thoth, the ibis', ['Anubis, the jackal', 'Seth', 'Ra'], 'Thoth was the god of writing.'],
      ['Before which god was the weighing held?', 'Osiris, ruler of the dead', ['Horus as a child', 'Bes', 'Hathor'], 'Osiris was the judge of the dead.', [2, 3]],
      ['Why did Egyptians think the heart was the right thing to weigh?', 'They believed it held a person\'s thoughts and deeds', ['It was the heaviest part of the body', 'It was made of stone', 'It could talk to the gods'], 'The heart "remembered" everything you did.', [2, 3]],
      ['Where did Egyptians write spells to help with the test?', 'In the Book of the Dead', ['On the Rosetta Stone', 'In a cartouche', 'On a senet board'], 'In it, the dead person declares, "I have not stolen, I have not lied."', [2, 3]]
    ],
    tf: [
      ['The heart had to be heavy to pass the test.', false, 'It had to balance the feather: as light as it.'],
      ['The feather stood for Maat: truth and right order.', true, 'Maat was also a goddess with a feather on her head.'],
      ['The test taught that how you treat others matters.', true, 'A good, honest life kept the heart light.']
    ],
    levels: { 1: ['fact', 'tf', 'fact'], 2: ['fact', 'tf'], 3: ['fact', 'tf'] }
  });


  // ================================================================ Unit 5: Daily Life
  // signs of everyday things, named in kids' words (checked against SIGNS[c].n by the tests)
  var THING_SIGNS = { O1: 'a house', X1: 'a loaf of bread', W22: 'a beer jug', Y5: 'a game board', U1: 'a sickle', K1: 'a fish', E1: 'a bull', M2: 'a plant', S12: 'a bead collar', Y1: 'a papyrus roll', N35A: 'water', V30: 'a basket' };
  function signPick(R, ctx, keys) {
    var k = R.pick(keys), wr = R.sample(Object.keys(THING_SIGNS).filter(function (x) { return x !== k; }), nWrong(ctx)), sc = signChoice(R, k, wr);
    return { q: 'The signs are numbered. <b>Which hieroglyph shows ' + THING_SIGNS[k] + '?</b>', a: sc.a, viz: sc.viz,
      steps: ['Sign ' + (sc.v + 1) + ', ' + glyph(k) + ', shows ' + signName(k) + '.'] };
  }
  T('kids.homes', {
    hint: 'Mud from the river was free; stone was saved for gods and tombs.',
    fact: [
      ['What were most Egyptian houses made of?', 'Mud brick', ['Stone blocks', 'Wood and glass', 'Ice'], 'River mud mixed with straw was dried in the sun to make bricks.'],
      ['What did families use the flat roof for?', 'Working, storing things and sleeping on hot nights', ['Landing boats', 'Burying the dead', 'Nothing: nobody went up there'], 'Stairs led up to the roof.'],
      ['Why were windows small and high up?', 'To keep out the hot sun', ['Because glass was cheap', 'So children could not see out', 'To let in the rain'], 'Small high windows kept houses cool.'],
      ['What was stone saved for?', 'Temples and tombs, meant to last forever', ['Houses for farmers', 'Boats', 'Bread ovens only'], 'Stone was hard to cut and carry.'],
      ['How were mud bricks made?', 'Mud mixed with straw, shaped and dried in the sun', ['Baked in a factory oven', 'Carved out of rock', 'Grown on trees'], 'The bricks were cheap and easy to make.', [2, 3]],
      ['Why have few ancient houses survived?', 'Mud brick crumbles over time, while stone lasts', ['People took them all to museums', 'They were made of ice', 'There were never any houses'], 'Temples and tombs survived because they were stone.', [2, 3]],
      ['The village of Deir el-Medina is famous for whose houses?', 'The workers who cut the royal tombs', ['The pharaohs', 'Roman soldiers', 'Fishermen of the Delta'], 'Whole streets of their houses survive.', [3]]
    ],
    tf: [
      ['Most Egyptians lived in stone houses like temples.', false, 'Houses were mud brick; stone was for gods and tombs.'],
      ['Thick mud-brick walls helped keep houses cool.', true, 'They heat up slowly.'],
      ['Families sometimes slept on the roof on hot nights.', true, 'The roof was flat and cooler at night.']
    ],
    custom: { sign: function (R, ctx) { var p = signPick(R, ctx, ['O1']); p.steps.push('Per, "house," shows a house from above with a doorway.'); return p; } },
    levels: { 1: ['fact', 'tf', 'sign'], 2: ['fact', 'fact', 'tf'], 3: ['fact', 'tf'] }
  });

  T('kids.food', {
    hint: 'Bread and beer were eaten every day; meat was a treat.',
    fact: [
      ['What was the most common everyday food in ancient Egypt?', 'Bread', ['Beef', 'Chocolate', 'Rice'], 'Bread was eaten at every meal, along with thick beer.'],
      ['When did most people eat meat?', 'Mostly on feast days', ['At every meal', 'Never', 'Only for breakfast'], 'Cattle took a lot of land and food to raise.'],
      ['What did Egyptians use to make food sweet?', 'Honey', ['Sugar', 'Salt', 'Chocolate'], 'There was no sugar in ancient Egypt.'],
      ['Which of these was everyday food in Egypt?', 'Onions and lentils', ['Potatoes and corn', 'Tomatoes and pasta', 'Bananas and peanuts'], 'Onions, garlic, beans and lentils grew well by the Nile. Potatoes, corn and tomatoes came from the Americas much later.', [2, 3]],
      ['How were pyramid workers paid?', 'Partly in bread and beer', ['With paper money', 'With credit cards', 'They were not paid'], 'There were no coins yet, and everyone needed food.', [2, 3]],
      ['Why were many mummies\' teeth worn down?', 'Bread often had bits of sand and grit in it', ['They chewed stones for fun', 'They ate too much sugar', 'They never ate'], 'Grit got in while the grain was ground.', [3]]
    ],
    tf: [
      ['Most Egyptians ate meat every day.', false, 'Most people ate bread and vegetables, and meat on feast days.'],
      ['Egyptian beer was thick, almost like a soup.', true, 'It was made from grain and gave energy.'],
      ['Fish from the Nile was part of the Egyptian diet.', true, 'The river was full of fish.']
    ],
    custom: { sign: function (R, ctx) { return signPick(R, ctx, ['X1', 'W22']); } },
    levels: { 1: ['fact', 'tf', 'sign'], 2: ['fact', 'sign', 'tf'], 3: ['fact', 'tf', 'sign'] }
  });

  T('kids.clothes', {
    hint: 'Clothes were made to keep people cool, and eye paint was for everyone.',
    fact: [
      ['What were most Egyptian clothes made of?', 'Linen, from the flax plant', ['Wool, from sheep', 'Leather', 'Silk'], 'Linen is thin and lets air through.'],
      ['Who wore dark eye paint in ancient Egypt?', 'Both men and women', ['Only women', 'Only kings', 'Only children'], 'You can see it on almost everyone in Egyptian paintings.'],
      ['What did many Egyptians wear on special days?', 'Wigs', ['Hats with feathers', 'Sunglasses', 'Fur coats'], 'Many people kept their hair short and wore wigs.'],
      ['What did men usually wear?', 'A wrapped linen kilt', ['Long trousers', 'A suit of armor', 'Wool sweaters'], 'Women usually wore a long, close-fitting dress.'],
      ['What was eye paint (kohl) made from?', 'Crushed minerals', ['Squashed berries', 'Chocolate', 'Ink from squid'], 'It may also have helped shade the eyes from the sun\'s glare.', [2, 3]],
      ['Why were Egyptian clothes light and white?', 'To keep cool in the hot sun', ['To stay warm in the snow', 'Because dye did not exist', 'To hide in the desert'], 'Thin linen lets air through.', [2, 3]]
    ],
    tf: [
      ['Only women wore eye paint in Egypt.', false, 'Men and women both did.'],
      ['Linen is made from the flax plant.', true, 'Flax fibers are spun and woven into linen.'],
      ['Rich Egyptians loved jewelry, such as bead collars.', true, 'The sign for "gold" is a bead collar.', [2, 3], pic('eg-glyphs', { word: 'nebu' })]
    ],
    order: [['From plant to clothes:', ['Grow the flax', 'Spin and weave it into linen', 'Sew the clothes'], 'The plant comes first, then the cloth, then the clothes.']],
    levels: { 1: ['fact', 'tf'], 2: ['fact', 'order', 'tf'], 3: ['fact', 'order', 'tf'] }
  });

  T('kids.games', {
    hint: 'Archaeologists have found balls, dolls, tops and board games like senet.',
    fact: [
      ['What was senet?', 'A board game', ['A kind of bread', 'A god', 'A boat'], 'It had 30 squares in three rows of ten.'],
      ['Which of these toys have archaeologists found from ancient Egypt?', 'Balls, dolls and spinning tops', ['Video games', 'Plastic blocks', 'Bicycles'], 'Toys of wood, clay and leather last in the dry sand.'],
      ['Why have so many Egyptian toys survived?', 'The dry sand kept them from rotting', ['They were made of gold', 'They were never played with', 'Kings kept them in museums'], 'Dry places keep wood and leather for thousands of years.'],
      ['How did senet players know how far to move?', 'They threw sticks, a bit like dice', ['They spun a wheel', 'They asked a priest', 'They moved one square every turn'], 'The goal was to get all your pieces off the board first.', [2, 3]],
      ['Which game was played on a round board shaped like a coiled snake?', 'Mehen', ['Senet', 'Chess', 'Soccer'], 'Mehen was another popular board game.', [2, 3]],
      ['The hieroglyph shown here is a senet board with pieces. Scribes used it for which sounds?', 'mn', ['ꜥnḫ', 'pr', 'nfr'], 'The game board sign stands for the sounds m and n.', [3], pic('eg-glyphs', { sp: 'Y5' })]
    ],
    tf: [
      ['Children in ancient Egypt had no toys.', false, 'Archaeologists have found balls, dolls, tops and toy animals.'],
      ['Some games were put in tombs so their owners could play in the afterlife.', true, 'Tutankhamun\'s tomb held game boards.'],
      ['Senet was played on a board of 30 squares.', true, 'Three rows of ten.']
    ],
    custom: {
      squares: function (R, ctx) {
        var kind = ctx.level === 1 ? 'all' : R.pick(['all', 'left', 'two']);
        if (kind === 'all') return { q: 'A senet board has <b>3 rows</b> with <b>10 squares</b> in each row. <b>How many squares in all?</b>', a: { t: 'num', v: '30' }, unit: 'squares', steps: ['3 rows × 10 squares = 30 squares.'], viz: showPic('eg-glyphs', { sp: 'Y5', en: 'a game board with its pieces', say: false }) };
        if (kind === 'two') return { q: 'A senet board has 3 rows of 10 squares. <b>How many squares are in two of the rows?</b>', a: { t: 'num', v: '20' }, unit: 'squares', steps: ['2 rows × 10 squares = 20 squares.'] };
        var at = R.int(4, 26);
        return { q: 'A senet board has 30 squares. Your piece is on square ' + at + '. <b>How many more squares until the end of the board, square 30?</b>', a: { t: 'num', v: String(30 - at) }, unit: 'squares', steps: ['30 − ' + at + ' = ' + (30 - at) + '.'] };
      },
      sign: function (R, ctx) { return signPick(R, ctx, ['Y5']); }
    },
    levels: { 1: ['fact', 'tf', 'squares', 'sign'], 2: ['fact', 'squares', 'tf'], 3: ['fact', 'squares', 'tf'] }
  });

  var JOBS = [['bakes bread', 'A baker'], ['makes clay pots on a turning wheel', 'A potter'], ['weaves linen cloth', 'A weaver'], ['makes chairs and boxes of wood', 'A carpenter'], ['catches fish in the Nile with nets', 'A fisherman'], ['reads and writes records', 'A scribe'], ['cares for a god\'s statue in a temple', 'A priest'], ['plows fields and harvests grain', 'A farmer'], ['paints pictures on tomb walls', 'A painter'], ['brews beer from grain', 'A brewer']];
  T('kids.jobs', {
    hint: 'Think about what the person makes or does every day.',
    fact: [
      ['What job did most Egyptians do?', 'Farming', ['Being a pharaoh', 'Being a priest', 'Building pyramids'], 'Farmers grew the food for everyone.'],
      ['Why could some Egyptians do jobs other than farming?', 'Farmers grew more food than their families needed, so the extra fed others', ['Nobody needed to eat', 'Food fell from the sky', 'The king did all the farming'], 'Extra grain fed bakers, builders, priests and scribes.'],
      ['Who cut and painted the royal tombs in the Valley of the Kings?', 'Skilled workers from the village of Deir el-Medina', ['Slaves from Rome', 'The pharaoh by himself', 'Priests of Bastet'], 'They were paid in grain and other goods.', [2, 3]],
      ['Which job needed years of school?', 'Scribe', ['Fisherman', 'Brick maker', 'Water carrier'], 'Scribes had to learn hundreds of signs.', [2, 3]]
    ],
    tf: [
      ['Everyone in Egypt was either a pharaoh or a slave.', false, 'Most people were farmers and craftspeople.'],
      ['Sons often learned the same job as their fathers.', true, 'Skills were passed down in families.'],
      ['Most Egyptians were farmers.', true, 'Their crops fed the whole country.']
    ],
    custom: {
      job: function (R, ctx) {
        var i = R.int(0, JOBS.length - 1), j = JOBS[i], wr = R.sample(JOBS.filter(function (x, k) { return k !== i; }), nWrong(ctx));
        return { q: 'Who ' + j[0] + '?', a: mcOf(j[1], wr.map(function (x) { return x[1]; })), steps: [j[1] + ' ' + j[0] + '.'] };
      }
    },
    levels: { 1: ['job', 'fact', 'tf'], 2: ['job', 'fact', 'tf'], 3: ['job', 'fact', 'tf'] }
  });


  // ================================================================ Unit 6: Scribes and Hieroglyphs
  T('kids.scribes', {
    hint: 'Scribes were the people trained to read and write.',
    fact: [
      ['What was a scribe?', 'A person trained to read and write', ['A king\'s bodyguard', 'A boat builder', 'A kind of priestess who made mummies'], 'Scribes kept the records that ran the country.'],
      ['What did scribes write on?', 'Papyrus, a paper made from a river plant', ['Plastic sheets', 'Paper made from trees', 'Glass tablets'], 'They also practiced on flakes of stone and broken pottery.'],
      ['What did scribes write with?', 'A thin reed pen and ink', ['A pencil', 'A feather and berry juice', 'A computer'], 'They carried black and red ink on a palette.'],
      ['What was the red ink used for?', 'Headings and important words', ['Every single word', 'Drawing maps of the stars only', 'Nothing; it was for decoration'], 'Black ink, made from soot, was used for most writing.'],
      ['Why did Egypt need scribes?', 'To record grain, taxes, workers and the king\'s orders', ['To build the pyramids by hand', 'To catch fish', 'To fight battles'], 'A big kingdom needs good records.'],
      ['Why did students practice on broken pottery and stone flakes?', 'They were cheaper than papyrus', ['They were softer', 'Papyrus had not been invented', 'The teacher liked the sound'], 'Papyrus took work to make, so it was saved for important writing.', [2, 3]],
      ['Could most Egyptians read?', 'No, only a small share of people could', ['Yes, everyone could', 'Yes, but only on Sundays', 'No, nobody could, not even scribes'], 'Reading and writing took years of school.', [2, 3]]
    ],
    tf: [
      ['Everyone in ancient Egypt could read and write.', false, 'Only a small share of people, mostly scribes, could.'],
      ['Papyrus is made from a plant that grows in marshes.', true, 'Strips of its stem were pressed into sheets.'],
      ['An Egyptian school text says that a scribe\'s life is better than other jobs.', true, 'It told students to study hard!', [2, 3]]
    ],
    order: [['How a sheet of papyrus was made:', ['Cut the stems into thin strips', 'Lay the strips in two layers, crosswise', 'Press and dry the sheet'], 'Strips, then layers, then pressing and drying.']],
    levels: { 1: ['fact', 'tf', 'fact'], 2: ['fact', 'tf', 'order'], 3: ['fact', 'order', 'tf'] }
  });

  function soundChoices(R, ctx, code, pool) {
    var right = kidSound(code), wr = uniq(R.shuffle(pool.filter(function (c) { return c !== code; })).map(kidSound).filter(function (s) { return s !== right; })).slice(0, nWrong(ctx));
    return mcOf(right, wr);
  }
  T('kids.sound-signs', {
    hint: 'Each sound sign stands for one sound: the owl is m, the water is n, the mouth is r.',
    fact: [
      ['Many hieroglyphs stand for sounds. What are they like?', 'Like the letters of our alphabet', ['Like emoji with no sound', 'Like numbers', 'Like musical notes only'], 'The owl, for example, writes the sound m.'],
      ['Did Egyptians write the vowels (a, e, i, o, u) in their words?', 'No, mostly they wrote only the consonants', ['Yes, every vowel', 'Only the letter o', 'They wrote only vowels'], 'That is why we have to guess how words sounded.'],
      ['A word has an owl in it. What does the owl most likely mean there?', 'The sound m', ['An owl', 'Night time', 'Wisdom'], 'Sound signs are used for their sound, not their picture.', [2, 3]]
    ],
    tf: [
      ['Every hieroglyph is a picture of the word it writes.', false, 'Many signs just stand for sounds, like letters.'],
      ['The mouth sign stands for the sound r.', true, 'It writes r even in words that have nothing to do with mouths.'],
      ['The water sign stands for the sound m.', false, 'Water is n; the owl is m.']
    ],
    custom: {
      sound: function (R, ctx) {
        var pool = ctx.level === 1 ? EASY1 : EASY, c = R.pick(pool);
        return { q: 'What <b>sound</b> does this sign stand for?', a: soundChoices(R, ctx, c, pool), steps: ['The sign shows ' + signName(c) + '.', 'It stands for the sound ' + kidSound(c) + '.'], viz: pic('eg-glyphs', { sp: c, size: 110 }) };
      },
      type: function (R, ctx) {
        var pool = EASY.filter(function (c) { return /^[a-z]$/.test(EG().SIGNS[c].v[0]); }), c = R.pick(pool);
        return { q: 'Type the <b>sound</b> this sign stands for (one letter).', a: { t: 'text', v: [EG().SIGNS[c].v[0]] }, steps: ['The sign shows ' + signName(c) + '.', 'It stands for ' + EG().SIGNS[c].v[0] + '.'], viz: pic('eg-glyphs', { sp: c, size: 110 }) };
      },
      which: function (R, ctx) {
        var pool = ctx.level === 1 ? EASY1 : EASY, c = R.pick(pool), s = kidSound(c);
        var wr = R.sample(pool.filter(function (x) { return kidSound(x) !== s; }), nWrong(ctx)), sc = signChoice(R, c, wr);
        return { q: 'The signs are numbered. Which sign stands for the sound <b>' + s + '</b>?', a: sc.a, viz: sc.viz, steps: ['Sign ' + (sc.v + 1) + ', ' + glyph(c) + ' (' + signName(c) + '), stands for ' + s + '.'] };
      },
      word: function (R, ctx) {
        var W = EG().WORDS, k = R.pick(['ren', 'djed']), w = W[k], parts = w.parts.map(function (p) { return KID_SOUND[p[2]] || p[2]; });
        var right = parts.join(', '), rev = parts.slice().reverse().join(', ');
        var wr = k === 'ren' ? [rev, 'm, n', 'r, t'] : [rev, 'd, j', 't, d'];
        return { q: 'These two sound signs spell a word. Read the top sign first. <b>Which sounds do they spell?</b>', a: mcOf(right, wr.slice(0, nWrong(ctx))), steps: w.parts.map(function (p) { return glyph(p[0], '1.4em') + ' = ' + (KID_SOUND[p[2]] || p[2]); }).concat(['The word is ' + w.tl + ', "' + w.en + '."']), viz: pic('eg-glyphs', { word: k, size: 110 }) };
      }
    },
    levels: { 1: ['sound', 'sound', 'which', 'tf'], 2: ['sound', 'which', 'type', 'word', 'fact'], 3: ['type', 'which', 'word', 'sound', 'tf'] }
  });

  var HINT_POOL = ['B1', 'A1', 'D54', 'A40', 'A2', 'Y1', 'N25'];
  function silentWords() { // words with only sound signs (and endings) plus one hint sign at the end
    var W = EG().WORDS, out = [];
    Object.keys(W).forEach(function (k) { var ps = W[k].parts, n = ps.length; if (n >= 2 && n === EG().codes(W[k].sp).length && ps[n - 1][1] === 'det' && ps.slice(0, -1).every(function (p) { return p[1] === 'phon' || p[1] === 'end'; })) out.push(k); });
    return out;
  }
  T('kids.idea-signs', {
    hint: 'A hint sign at the end of a word shows what kind of thing the word is about. It is not said out loud.',
    fact: [
      ['What does a hint sign at the end of a word do?', 'Shows what kind of thing the word is about', ['Tells you how loud to say it', 'Means the word is a king\'s name', 'Shows the number of letters'], 'Experts call hint signs determinatives.'],
      ['Are hint signs said out loud?', 'No, they are silent', ['Yes, always', 'Only on Tuesdays', 'Only in cartouches'], 'They only help you guess the meaning.'],
      ['What is a word sign?', 'A sign that means just what it shows, like the house sign for "house"', ['A sign that is always silent', 'A sign for a number', 'A sign that ends a sentence'], 'A little stroke under it often says "this means what it shows."'],
      ['Why were hint signs useful?', 'Egyptians did not write vowels, so many words looked alike', ['They made words prettier', 'They told the reader to stop', 'They were the vowels'], 'A hint sign tells words with the same consonants apart.', [2, 3]]
    ],
    tf: [
      ['You should say every sign in a word out loud.', false, 'Hint signs at the end are silent.'],
      ['Walking legs at the end of a word show it is about moving.', true, 'Words like "go" and "come" end with walking legs.'],
      ['A seated woman at the end of a word shows it is about a woman or girl.', true, 'That is how "daughter" ends.']
    ],
    custom: {
      det: function (R, ctx) {
        var list = detWords(), d = R.pick(list), right = DET_IDEA[d.c];
        var wr = R.sample(uniq(Object.keys(DET_IDEA).filter(function (c) { return DET_IDEA[c] !== right && !(right === DET_IDEA.A40 && c === 'H8') && !(right === DET_IDEA.H8 && c === 'A40'); }).map(function (c) { return DET_IDEA[c]; })), nWrong(ctx));
        return { q: 'The sign marked <b>?</b> is a hint sign at the end of a word. <b>What is the word about?</b>', a: mcOf(cap(right), wr.map(cap)), steps: ['The hint sign shows ' + signName(d.c) + '.', 'So the word is about ' + right + '.', 'The word is ' + EG().WORDS[d.key].tl + ', "' + EG().WORDS[d.key].en + '."'], viz: pic('eg-glyphs', { word: d.key, ask: d.i, size: 96 }) };
      },
      pick: function (R, ctx) {
        var c = R.pick(HINT_POOL), idea = DET_IDEA[c], wr = R.sample(HINT_POOL.filter(function (x) { return x !== c; }), nWrong(ctx)), sc = signChoice(R, c, wr);
        return { q: 'The signs are numbered. Which hint sign would go at the end of a word about <b>' + idea + '</b>?', a: sc.a, viz: sc.viz, steps: ['Sign ' + (sc.v + 1) + ', ' + glyph(c) + ' (' + signName(c) + '), is the hint sign for ' + idea + '.'] };
      },
      kind: function (R, ctx) {
        var hint = R.coin(), c = R.pick(hint ? HINT_POOL : EASY1);
        return { q: 'Is this sign usually a <b>sound sign</b> or a <b>hint sign</b>?', a: { t: 'mc', choices: ['A sound sign', 'A hint sign'], v: hint ? 1 : 0, keep: true },
          steps: hint ? [cap(signName(c)) + ' is a hint sign: it shows ' + DET_IDEA[c] + ', and it is not said.'] : [cap(signName(c)) + ' is a sound sign: it stands for ' + kidSound(c) + '.'], viz: pic('eg-glyphs', { sp: c, size: 110 }) };
      },
      silent: function (R, ctx) {
        var k = R.pick(silentWords()), W = EG().WORDS[k], n = W.parts.length;
        return { q: 'The signs are numbered in reading order. <b>Which sign is not said out loud?</b>', a: { t: 'mc', choices: W.parts.map(function (p, i) { return 'Sign ' + (i + 1); }), v: n - 1, keep: true },
          steps: ['Sign ' + n + ' (' + signName(W.parts[n - 1][0]) + ') is the hint sign at the end, so it is silent.', 'The word is ' + W.tl + ', "' + W.en + '."'], viz: pic('eg-glyphs', { word: k, number: true, size: 96 }) };
      }
    },
    levels: { 1: ['kind', 'pick', 'fact', 'tf'], 2: ['det', 'pick', 'silent', 'kind', 'fact'], 3: ['det', 'silent', 'pick', 'tf'] }
  });

  var DIR_WORDS = ['remetj', 'anubis', 'zat', 'heqa', 'it', 'osiris', 'ptah', 'zi', 'amun'];
  T('kids.which-way', {
    hint: 'People and animals face the start of the line. Start reading from the side they face.',
    fact: [
      ['How do you know where to start reading hieroglyphs?', 'Start from the side the people and animals face', ['Always start on the left', 'Always start at the bottom', 'Start in the middle'], 'Signs face the start of the line.'],
      ['Which ways could Egyptians write hieroglyphs?', 'Left to right, right to left, or in columns', ['Only left to right', 'Only right to left', 'Only in circles'], 'They chose the direction to fit the place.'],
      ['In a column of hieroglyphs, where do you start?', 'At the top', ['At the bottom', 'In the middle', 'Anywhere you like'], 'Columns are read from the top down.'],
      ['Which direction did Egyptians write most often?', 'Right to left', ['Left to right', 'Bottom to top', 'In a spiral'], 'But you should always check which way the signs face.', [2, 3]]
    ],
    tf: [
      ['Hieroglyphs are always read from left to right, like English.', false, 'They can go either way; check which way the signs face.'],
      ['If the birds face right, you start reading at the right.', true, 'Signs face the start of the line.'],
      ['Columns of hieroglyphs are read from the top down.', true, 'Start at the top of a column.']
    ],
    custom: {
      start: function (R, ctx) {
        var k = R.pick(DIR_WORDS), rtl = R.coin();
        return { q: 'Look at which way the people and animals face. <b>Where do you start reading?</b>', a: { t: 'mc', choices: ['At the left end', 'At the right end'], v: rtl ? 1 : 0, keep: true },
          steps: ['The signs face ' + (rtl ? 'right' : 'left') + '.', 'Signs face the start of the line, so start at the ' + (rtl ? 'right' : 'left') + ' end.'], viz: pic('eg-glyphs', { word: k, dir: rtl ? 'rtl' : 'ltr', size: 90 }) };
      },
      mark: function (R, ctx) {
        var k = R.pick(DIR_WORDS), rtl = R.coin(), n = EG().codes(EG().WORDS[k].sp).length, first = R.coin(), ask = first ? 0 : n - 1;
        var side = (first !== rtl) ? 'left' : 'right';
        return { q: 'The signs face ' + (rtl ? 'right' : 'left') + '. <b>Is the sign marked ? the first sign you read, or the last?</b>', a: { t: 'mc', choices: ['The first sign', 'The last sign'], v: first ? 0 : 1, keep: true },
          steps: ['The signs face ' + (rtl ? 'right' : 'left') + ', so you start at the ' + (rtl ? 'right' : 'left') + ' end.', 'The marked sign is at the ' + side + ' end, so it is the ' + (first ? 'first' : 'last') + ' sign you read.'], viz: pic('eg-glyphs', { word: k, dir: rtl ? 'rtl' : 'ltr', ask: ask, size: 90 }) };
      }
    },
    levels: { 1: ['start', 'start', 'fact', 'tf'], 2: ['start', 'mark', 'fact', 'tf'], 3: ['mark', 'start', 'mark', 'fact'] }
  });

  var GAME = ' <small>(This is a modern game: Egyptians did not write our names.)</small>';
  T('kids.your-name', {
    hint: 'One sound sign for each sound you hear. A double letter makes one sound, so it gets one sign.',
    fact: [
      ['How do you write your name in hieroglyphs, in this game?', 'One sound sign for each sound you hear', ['One picture of yourself', 'A number for each letter', 'Draw the letters of the English alphabet'], 'Egyptians spelled foreign names with sound signs.'],
      ['Which sign do we borrow for the sound l?', 'The lion', ['The owl', 'The cobra', 'The hand'], 'Scribes used the lion for l in Greek names like Ptolemy and Cleopatra.'],
      ['The name Anna has two n\'s in a row. How many signs does that double n get?', 'One', ['Two', 'Three', 'None'], 'Two n\'s together make one sound.', [2, 3]],
      ['Kate ends with a silent e. What should you do with it?', 'Leave it out: write only the sounds you hear', ['Write it twice', 'Write the sign for o', 'Put it first'], 'Silent letters make no sound, so they get no sign.', [2, 3]]
    ],
    tf: [
      ['Egyptians wrote most vowels in their own words.', false, 'They left out most vowels; we borrow signs for vowels in this game.'],
      ['The owl stands for the sound m.', true, 'So the owl is the first sign of a name like Mia.']
    ],
    custom: {
      whose: function (R, ctx) {
        var pool = ctx.level === 1 ? KIDNAMES.filter(function (n) { return n.length === 3; }) : KIDNAMES.concat(DOUBLES), n = R.pick(pool);
        var wr = R.sample(pool.filter(function (x) { return x !== n && nameCodes(x).join() !== nameCodes(n).join() && Math.abs(x.length - n.length) <= 1; }), nWrong(ctx));
        return { q: 'Here is a modern name written with sound signs. <b>Which name is it?</b>' + GAME, a: mcOf(n, wr),
          steps: EG().nameSigns(n).map(function (m) { return glyphs(m.signs, '1.4em') + ' = ' + m.letters; }).concat(['Together: ' + n + '.']), viz: pic('eg-cartouche', { text: n, size: 60 }) };
      },
      spell: function (R, ctx) {
        var pool = ctx.level === 1 ? KIDNAMES.filter(function (n) { return n.length === 3; }) : KIDNAMES.concat(DOUBLES), n = R.pick(pool), m = EG().nameSigns(n).filter(function (x) { return x.signs.length === 1; });
        var codes = nameCodes(n), at = R.int(0, codes.length - 1), lett = EG().nameSigns(n)[at].letters;
        if (EG().nameSigns(n).length !== codes.length) { at = 0; lett = EG().nameSigns(n)[0].letters; }
        var shown = lett.charAt(0).toUpperCase(), others = uniq(n.toUpperCase().split('').filter(function (L) { return L !== shown; }).concat(R.shuffle(['B', 'D', 'F', 'K', 'P', 'R', 'S', 'T']))).filter(function (L) { var sg = EG().NAME_MAP[L.toLowerCase()]; return L !== shown && !(sg && sg.length === 1 && sg[0] === codes[at]); });
        return { q: 'Here is the name <b>' + n + '</b> in sound signs, numbered in order. <b>Which letter does sign ' + (at + 1) + ' stand for?</b>' + GAME, a: mcOf(shown, others.slice(0, nWrong(ctx))),
          steps: EG().nameSigns(n).map(function (x, i) { return 'Sign ' + (i + 1) + ': ' + glyphs(x.signs, '1.4em') + ' = ' + x.letters.toUpperCase() + (x.letters.length === 2 && x.letters[0] === x.letters[1] ? ' (a double letter is one sound, so one sign)' : ''); }),
          viz: pic('eg-glyphs', { sp: codes.join(' '), number: true, size: 76 }) };
      },
      count: function (R, ctx) {
        var n = R.pick(ctx.level === 1 ? KIDNAMES : DOUBLES.concat(KIDNAMES.slice(0, 8))), m = EG().nameSigns(n), k = nameCodes(n).length;
        return { q: 'How many sound signs do you need to write the name <b>' + n + '</b>?' + GAME, a: { t: 'num', v: String(k) }, unit: 'signs',
          steps: m.map(function (x) { return x.letters.toUpperCase() + ': ' + x.signs.length + ' sign' + (x.signs.length > 1 ? 's' : '') + (x.letters.length === 2 && x.letters[0] === x.letters[1] ? ' (a double letter makes one sound)' : ''); }).concat([k + ' signs in all.']) };
      }
    },
    levels: { 1: ['whose', 'spell', 'count', 'fact'], 2: ['whose', 'spell', 'count', 'fact', 'tf'], 3: ['spell', 'count', 'whose', 'fact'] }
  });

  var CART1 = ['khufu', 'ptolemy', 'cleopatra', 'ramesses', 'tutankhamun'];
  T('kids.cartouche', {
    hint: 'A cartouche is an oval rope loop around a royal name. Read the sound signs in order.',
    fact: [
      ['What is a cartouche?', 'An oval loop around a king\'s or queen\'s name', ['A kind of crown', 'A boat for the dead', 'A paper cartridge for a gun'], 'When you see one, it is a royal name.'],
      ['Whose names were written in cartouches?', 'Kings and queens', ['Every Egyptian', 'Scribes', 'Gods of animals only'], 'Cartouches hold only royal names.'],
      ['Where does the word "cartouche" come from?', 'French soldiers thought the oval looked like a paper cartridge for their guns', ['It is the Egyptian word for king', 'It is the name of a pharaoh', 'It means "rope" in Greek'], 'The name stuck around 1800.', [2, 3]],
      ['What did Egyptians believe the rope loop of a cartouche did for the name?', 'Surrounded and protected it', ['Made it invisible', 'Made it sound louder', 'Turned it into a number'], 'The loop goes all the way around, tied at one end.', [2, 3]],
      ['Which of these would be written inside a cartouche?', 'The name of King Khufu', ['The word for "bread"', 'The name of a farmer', 'The number 30'], 'Only royal names go in cartouches.']
    ],
    tf: [
      ['Every word inside a loop is a king\'s name.', false, 'Only royal names go in cartouches; other words are not written that way.'],
      ['A cartouche is drawn like a loop of rope tied at one end.', true, 'You can see the tie bar at the end.'],
      ['Kings had several names, and the two most important went in cartouches.', true, 'That is why some kings have two cartouches side by side.', [2, 3]]
    ],
    custom: {
      whose: function (R, ctx) {
        var N = EG().NAMES, keys = ctx.level === 1 ? CART1 : Object.keys(N), k = R.pick(keys), wr = R.sample(Object.keys(N).filter(function (x) { return x !== k; }), nWrong(ctx));
        var steps = ['The signs read ' + N[k].tl + '.', 'That is ' + N[k].en + '.'];
        if (N[k].note) steps.splice(1, 0, N[k].note);
        return { q: 'This is a royal name in a cartouche. <b>Whose name is it?</b>', a: mcOf(N[k].en, wr.map(function (x) { return N[x].en; })), steps: steps, viz: pic('eg-cartouche', { name: k, size: 56 }) };
      }
    },
    levels: { 1: ['whose', 'whose', 'fact', 'tf'], 2: ['whose', 'fact', 'whose', 'tf'], 3: ['whose', 'fact', 'tf'] }
  });

  function numRange(R, lv) {
    if (lv === 1) return R.int(1, 5) * 10 + R.int(1, 9);
    if (lv === 2) return R.int(1, 9) * 100 + R.int(0, 9) * 10 + R.int(1, 9);
    return R.int(1, 4) * 1000 + R.int(0, 9) * 100 + R.int(1, 9) * 10 + R.int(0, 9);
  }
  var NUM_SIGN_NAME = { M12: 'lotus', V1: 'coil', V20: 'hobble', Z1: 'stroke' }, NUM_VAL = { M12: 1000, V1: 100, V20: 10, Z1: 1 };
  function numSteps(n) {
    var s = EG().numberSigns(n), cnt = {}, out = [];
    s.forEach(function (c) { cnt[c] = (cnt[c] || 0) + 1; });
    ['M12', 'V1', 'V20', 'Z1'].forEach(function (c) { if (cnt[c]) out.push(cnt[c] + ' ' + NUM_SIGN_NAME[c] + (cnt[c] > 1 ? 's' : '') + ' × ' + NUM_VAL[c].toLocaleString('en-US') + ' = ' + (cnt[c] * NUM_VAL[c]).toLocaleString('en-US')); });
    out.push('Add them up: ' + n.toLocaleString('en-US') + '.');
    return out;
  }
  T('kids.numbers', {
    hint: 'Stroke 1, hobble 10, coil 100, lotus 1,000. Count each kind and add.',
    fact: [
      ['Which sign stands for 10?', 'A hobble for cattle', ['A stroke', 'A coil of rope', 'A lotus'], 'Stroke 1, hobble 10, coil 100, lotus 1,000.'],
      ['Which sign stands for 100?', 'A coil of rope', ['A hobble for cattle', 'A finger', 'A tadpole'], 'Stroke 1, hobble 10, coil 100, lotus 1,000.'],
      ['Which sign stands for 1,000?', 'A lotus plant', ['A coil of rope', 'A stroke', 'A frog'], 'Stroke 1, hobble 10, coil 100, lotus 1,000.'],
      ['How do Egyptian numbers work?', 'You add up the values of all the signs', ['Each sign\'s place tells its value, like our digits', 'You multiply all the signs', 'Only the first sign counts'], 'Three coils and two hobbles is 320, in any order.'],
      ['Did Egyptian numbers need a sign for zero?', 'No, they just left that sign out', ['Yes, a circle', 'Yes, a small bird', 'Yes, an empty box'], 'If there are no tens, you draw no hobbles.', [2, 3]],
      ['Which sign stands for 100,000?', 'A tadpole', ['A finger', 'A lotus', 'A coil of rope'], 'The finger is 10,000, and a kneeling god with raised arms is 1,000,000.', [3]]
    ],
    tf: [
      ['In Egyptian numbers, three coils and two hobbles make 320.', true, '300 + 20 = 320.'],
      ['Egyptian numbers work by place, like our digits.', false, 'They just add up: count each kind of sign.'],
      ['A stroke stands for 1.', true, 'Five strokes are 5.']
    ],
    custom: {
      read: function (R, ctx) {
        var n = numRange(R, ctx.level);
        return { q: '<b>What number is this?</b>', a: { t: 'num', v: String(n) }, steps: numSteps(n), viz: pic('eg-glyphs', { num: n, size: ctx.level === 3 ? 70 : 84 }) };
      },
      count: function (R, ctx) {
        var n = numRange(R, Math.max(2, ctx.level)), c = R.pick(n >= 1000 ? ['M12', 'V1', 'V20'] : ['V1', 'V20', 'Z1']);
        var k = EG().numberSigns(n).filter(function (x) { return x === c; }).length;
        if (!k) { n += NUM_VAL[c]; k = 1; }
        k = EG().numberSigns(n).filter(function (x) { return x === c; }).length;
        return { q: 'To write <b>' + n.toLocaleString('en-US') + '</b> in hieroglyphs, how many <b>' + NUM_SIGN_NAME[c] + 's</b> ' + glyph(c, '1.4em') + ' (each worth ' + NUM_VAL[c].toLocaleString('en-US') + ') do you need?', a: { t: 'num', v: String(k) }, unit: NUM_SIGN_NAME[c] + 's', steps: numSteps(n) };
      },
      write: function (R, ctx) {
        var n = numRange(R, ctx.level === 3 ? 2 : 1), h = Math.floor(n / 100) % 10, t = Math.floor(n / 10) % 10, o = n % 10, ws = [];
        var val = function (hh, tt, oo) { return hh * 100 + tt * 10 + oo; };
        if (t !== o) ws.push(val(h, o, t)); // tens and ones swapped
        if (h && h !== t) ws.push(val(t, h, o));
        ws.push(n + 10); ws.push(n - 1 > 0 ? n - 1 : n + 1); ws.push(h + t + o);
        ws = uniq(ws.filter(function (x) { return x !== n && x > 0; }).map(String));
        return { q: '<b>Which number do these hieroglyphs write?</b>', a: mcOf(n.toLocaleString('en-US'), R.shuffle(ws).slice(0, nWrong(ctx)).map(function (x) { return (+x).toLocaleString('en-US'); })), steps: numSteps(n), viz: pic('eg-glyphs', { num: n, size: 80 }) };
      }
    },
    levels: { 1: ['read', 'read', 'write', 'fact'], 2: ['read', 'count', 'write', 'fact', 'tf'], 3: ['read', 'count', 'write', 'fact'] }
  });


  // ================================================================ Unit 7: Discovering Egypt
  var ROS_NAMES = { hieroglyphic: 'hieroglyphs', demotic: 'Demotic', greek: 'Greek' };
  T('kids.rosetta-stone', {
    hint: 'Top: hieroglyphs. Middle: Demotic. Bottom: Greek. All three say the same thing.',
    fact: [
      ['What is written on the Rosetta Stone?', 'The same message in three scripts', ['A dictionary of every hieroglyph', 'A map of Egypt', 'A story about Cleopatra'], 'It is one decree, copied in hieroglyphs, Demotic and Greek.'],
      ['Which three scripts are on the Rosetta Stone?', 'Hieroglyphs, Demotic and Greek', ['Hieroglyphs, Latin and English', 'Greek, Arabic and Chinese', 'Demotic, Coptic and French'], 'Hieroglyphs on top, Demotic in the middle, Greek at the bottom.'],
      ['Why was the Greek part so important?', 'Scholars could still read Greek, so it told them what the hieroglyphs said', ['It was the longest part', 'It was written in gold', 'It had pictures'], 'Knowing the meaning, they could start matching up the signs.'],
      ['Who found the Rosetta Stone in 1799?', 'French soldiers, near the town of Rosetta', ['Howard Carter', 'Cleopatra', 'Roman tourists'], 'It was found during the French campaign in Egypt.'],
      ['For which king did the priests make the decree on the Rosetta Stone?', 'King Ptolemy V', ['King Khufu', 'King Tutankhamun', 'King Narmer'], 'It was made in 196 BC.', [2, 3]],
      ['Where is the Rosetta Stone today?', 'In the British Museum in London', ['Under the Great Sphinx', 'At the bottom of the Nile', 'In Tutankhamun\'s tomb'], 'It has been there since 1802.', [2, 3]],
      ['Which text is at the top of the Rosetta Stone?', 'Hieroglyphs', ['Greek', 'Demotic', 'Latin'], 'Hieroglyphs are at the top, Demotic in the middle and Greek at the bottom.'],
      ['How many times is the message written on the Rosetta Stone?', 'Three times', ['Once', 'Ten times', 'Twice'], 'Once in each of three scripts.'],
      ['Why did the priests carve the decree in three scripts?', 'So priests, ordinary Egyptians and the Greek-speaking rulers could all read it', ['To fill up the stone', 'Because they could not decide', 'To confuse robbers'], 'Egypt then had Greek-speaking rulers.', [2, 3]],
      ['What is Demotic?', 'A fast, everyday script for writing Egyptian', ['A kind of Greek', 'A god of writing', 'A type of stone'], 'It grew out of the hieroglyphs over many centuries.', [2, 3]]
    ],
    tf: [
      ['The Rosetta Stone is a dictionary of hieroglyphs.', false, 'It is one priestly decree from 196 BC, copied in three scripts.'],
      ['All three texts on the stone say the same thing.', true, 'That is what made it a key to the code.'],
      ['The top of the stone, with the hieroglyphs, is broken.', true, 'Only 14 lines of hieroglyphs survive.']
    ],
    custom: {
      band: function (R, ctx) {
        var E = EG(), order = R.shuffle([0, 1, 2]), b = R.int(0, 2), key = E.ROSETTA.texts[b][0];
        if (R.coin()) return { q: 'This drawing of the Rosetta Stone has its three texts marked with letters. <b>Which script is the text marked ' + letter(order.indexOf(b)) + '?</b>', a: mcOf(cap(ROS_NAMES[key]), E.ROSETTA.texts.filter(function (x, i) { return i !== b; }).map(function (x) { return cap(ROS_NAMES[x[0]]); }).concat(ctx.level > 1 ? ['Latin'] : [])),
          steps: ['From top to bottom the texts are hieroglyphs, Demotic and Greek.', 'Text ' + letter(order.indexOf(b)) + ' is the ' + E.ROSETTA.texts[b][2].replace(/, broken/, '') + ' one: ' + ROS_NAMES[key] + '.'], viz: pic('eg-scripts', { mode: 'rosetta', order: order }) };
        return { q: 'This drawing of the Rosetta Stone has its three texts marked with letters. <b>Which letter marks the ' + ROS_NAMES[key] + ' text?</b>', a: { t: 'mc', choices: ['A', 'B', 'C'], v: order.indexOf(b), keep: true },
          steps: ['From top to bottom the texts are hieroglyphs, Demotic and Greek.', 'The ' + ROS_NAMES[key] + ' text is the ' + E.ROSETTA.texts[b][2].replace(/, broken/, '') + ' one, marked ' + letter(order.indexOf(b)) + '.'], viz: pic('eg-scripts', { mode: 'rosetta', order: order }) };
      },
      lines: function (R, ctx) {
        var E = EG(), t = E.ROSETTA.texts, sum = t.reduce(function (a, x) { return a + x[1]; }, 0);
        if (R.coin()) return { q: 'On the Rosetta Stone, ' + t[0][1] + ' lines of hieroglyphs, ' + t[1][1] + ' lines of Demotic and ' + t[2][1] + ' lines of Greek survive. <b>How many lines survive in all?</b>', a: { t: 'num', v: String(sum) }, unit: 'lines', steps: [t[0][1] + ' + ' + t[1][1] + ' + ' + t[2][1] + ' = ' + sum + ' lines.'] };
        return { q: 'On the Rosetta Stone, ' + t[2][1] + ' lines of Greek and ' + t[0][1] + ' lines of hieroglyphs survive. <b>How many more lines of Greek are there?</b>', a: { t: 'num', v: String(t[2][1] - t[0][1]) }, unit: 'lines', steps: [t[2][1] + ' − ' + t[0][1] + ' = ' + (t[2][1] - t[0][1]) + ' lines.', 'The top of the stone, with the hieroglyphs, is broken off.'] };
      }
    },
    levels: { 1: ['fact', 'band', 'tf'], 2: ['fact', 'band', 'tf', 'lines'], 3: ['band', 'lines', 'fact', 'tf'] }
  });

  // the sound each sign of Ptolemy's cartouche stands for in the name (p, t, o, l, m, y, s)
  function ptolSound(c) { var M = EG().NAME_MAP, hit = Object.keys(M).filter(function (L) { return L.length === 1 && M[L].length === 1 && M[L][0] === c && !/[aei]/.test(L); }); return hit.length === 1 ? hit[0] : kidSound(c); }
  T('kids.champollion', {
    hint: 'Champollion started with royal names in cartouches and sounded them out, helped by the Coptic language.',
    fact: [
      ['In which year did Champollion show how hieroglyphs work?', '1822', ['1799', '1922', '196 BC'], 'He wrote it up in a famous letter in September 1822.'],
      ['Where did Champollion start cracking the code?', 'With royal names in cartouches', ['With the numbers', 'With pictures of gods', 'With the longest word'], 'A name sounds about the same in every language.'],
      ['Which language helped Champollion, because it was the last stage of Egyptian?', 'Coptic', ['Latin', 'English', 'Chinese'], 'He could recognize Egyptian words once he sounded them out.'],
      ['What did Champollion discover about hieroglyphs?', 'Many signs stand for sounds, mixed with word signs and hint signs', ['Every sign is a picture of the word', 'They are only decorations', 'They are a secret code for numbers'], 'It is a mixed system.'],
      ['Who made early steps before Champollion, showing that cartouches hold royal names?', 'Thomas Young', ['Howard Carter', 'Napoleon', 'Ptolemy V'], 'Young was an English scientist; Champollion cracked the system.', [2, 3]],
      ['Which two names did Champollion compare to find shared sound signs?', 'Ptolemy and Cleopatra', ['Khufu and Khafre', 'Narmer and Djoser', 'Isis and Osiris'], 'The shared sounds p, t, o and l matched the shared signs.', [2, 3]]
    ],
    tf: [
      ['One person read the whole Rosetta Stone in a single day.', false, 'It took many scholars many years; Champollion cracked it in 1822.'],
      ['Thomas Young made early steps in reading hieroglyphs.', true, 'He saw that cartouches held royal names.'],
      ['Champollion found that hieroglyphs mix sound signs with other kinds of signs.', true, 'Sound signs, word signs and hint signs work together.']
    ],
    custom: {
      shared: function (R, ctx) {
        var E = EG(), P = E.NAMES.ptolemy.signs, C = E.NAMES.cleopatra.signs;
        var both = P.filter(function (c) { return C.indexOf(c) >= 0 && ['p', 'o', 'l'].indexOf(ptolSound(c)) >= 0; }), c = R.pick(both), s = ptolSound(c);
        var wr = R.sample(['G17', 'N35', 'D21', 'D58', 'I9', 'D46', 'S29'].filter(function (x) { return x !== c; }), nWrong(ctx)), sc = signChoice(R, c, wr);
        return { q: 'The names <b>Ptolemy</b> and <b>Cleopatra</b> both have the sound <b>' + s + '</b>. The signs below are numbered. <b>Which one is in both cartouches for that sound?</b>', a: sc.a, viz: sc.viz,
          steps: ['Ptolemy: p, t, o, l, m, y, s. Cleopatra: k, l, e, o, p, a, t, r, a.', 'The sign for ' + s + ' in both is sign ' + (sc.v + 1) + ', ' + glyph(c) + ' (' + signName(c) + ').'] };
      },
      numbered: function (R, ctx) {
        var P = EG().NAMES.ptolemy.signs, idx = R.pick([0, 1, 2, 3, 6]), s = ptolSound(P[idx]);
        return { q: 'This is Ptolemy\'s name, P-T-O-L-M-Y-S, with the signs numbered in reading order. <b>Which numbered sign stands for ' + s + '?</b>', a: { t: 'mc', choices: P.map(function (c, i) { return 'Sign ' + (i + 1); }), v: idx, keep: true },
          steps: P.map(function (c, i) { return (i + 1) + ': ' + ptolSound(c); }).concat(['So ' + s + ' is sign ' + (idx + 1) + '.']), viz: pic('eg-glyphs', { name: 'ptolemy', number: true, size: 80 }) };
      }
    },
    levels: { 1: ['fact', 'tf', 'shared'], 2: ['fact', 'shared', 'numbered', 'tf'], 3: ['numbered', 'shared', 'fact'] }
  });

  T('kids.carter', {
    hint: 'Howard Carter found Tutankhamun\'s tomb in the Valley of the Kings in 1922.',
    fact: [
      ['Who found Tutankhamun\'s tomb?', 'Howard Carter', ['Champollion', 'Napoleon', 'Cleopatra'], 'He had searched the Valley of the Kings for years.'],
      ['In which year was Tutankhamun\'s tomb found?', '1922', ['1822', '1799', '2022'], 'The first step was uncovered on 4 November 1922.'],
      ['What did Carter say when asked if he could see anything inside?', '"Yes, wonderful things"', ['"Nothing at all"', '"I see a mummy monster"', '"It is empty"'], 'The tomb was full of golden treasures.'],
      ['Who paid for Carter\'s search?', 'Lord Carnarvon, an English lord', ['The pharaoh', 'Cleopatra', 'The Roman emperor'], 'Carnarvon was with Carter when the tomb was opened.'],
      ['About how long did it take to empty the tomb?', 'About ten years', ['One afternoon', 'One week', 'Two hundred years'], 'Every object was photographed, drawn and protected first.', [2, 3]],
      ['Why did a story about a "curse" start?', 'Newspapers made it up when Lord Carnarvon died of an infection in 1923', ['A sign on the door said so', 'Carter wrote it in his diary', 'Tutankhamun ordered it'], 'Most people who entered the tomb lived long lives.', [2, 3]],
      ['About how many objects were in the tomb?', 'More than five thousand', ['About ten', 'About fifty', 'None; it was empty'], 'Shrines, furniture, chariots, jewelry and the gold mask.', [3]]
    ],
    tf: [
      ['There was a curse on Tutankhamun\'s tomb that harmed the people who opened it.', false, 'Most of them lived long lives; Carter lived until 1939.'],
      ['Tutankhamun\'s tomb was found nearly untouched.', true, 'That is why it was full of treasure.'],
      ['The tomb is in the Valley of the Kings, near Thebes.', true, 'It is behind the cliffs on the west bank.']
    ],
    custom: { map: function (R, ctx) { return mapPick(R, ctx, 'kings', FAR_SITES.filter(function (k) { return k !== 'karnak'; }), { minKm: 150, q: 'Tutankhamun\'s tomb is in the Valley of the Kings, near Thebes in Upper Egypt. <b>Which lettered dot is the Valley of the Kings?</b>', why: 'It is on the west bank at Thebes (modern Luxor), in Upper Egypt.' }); } },
    levels: { 1: ['fact', 'tf', 'map'], 2: ['fact', 'map', 'tf'], 3: ['fact', 'map', 'tf'] }
  });

  T('kids.archaeologists', {
    hint: 'Archaeologists care most about where each thing was found, so they record it before they move it.',
    fact: [
      ['What do archaeologists do?', 'Dig carefully, record where everything was found, and study it', ['Hunt for gold to sell', 'Build new pyramids', 'Write hieroglyphs on old walls'], 'They are detectives of the past.'],
      ['Why do archaeologists write down exactly where each thing was found?', 'Where a thing was found is a clue about how people lived', ['So they can find it again to sell', 'Because it is the law to count everything twice', 'It does not matter where things were found'], 'Once an object is moved, that clue is gone unless it was recorded.'],
      ['You find a broken pot in the ground. What should you do first?', 'Photograph it and record exactly where it is', ['Pull it out as fast as you can', 'Throw it away because it is broken', 'Glue it back together right there'], 'Record first, then lift it carefully.'],
      ['Which can teach an archaeologist a lot, even though it is not treasure?', 'A plain broken pot or a seed', ['Only gold', 'Only jewels', 'Nothing but statues'], 'Everyday things tell us how people lived.'],
      ['In a dig, which layers of earth are usually older?', 'The deeper layers', ['The top layers', 'All layers are the same age', 'The layers on the left'], 'New layers pile up on top of old ones.', [2, 3]],
      ['How can scientists see inside a mummy today without unwrapping it?', 'With scanners', ['By shaking it', 'With a magnifying glass only', 'They cannot'], 'Scanners show bones and amulets inside.', [2, 3]],
      ['Who do Egypt\'s laws say ancient objects found in Egypt belong to?', 'Egypt', ['Whoever finds them', 'The richest museum', 'Nobody'], 'Many digs today are led by Egyptian archaeologists.', [2, 3]]
    ],
    tf: [
      ['Archaeologists are mostly treasure hunters.', false, 'They care most about where things were found and what they teach us.'],
      ['A broken pot can be an important find.', true, 'Everyday things tell us how people lived.'],
      ['Deeper layers of earth are usually older than the layers above them.', true, 'Layers pile up over time.']
    ],
    order: [['The steps for a find on a dig:', ['Uncover it carefully', 'Photograph and record where it lies', 'Lift it out and label it', 'Study it and share what you learn'], 'Record before you move anything.']],
    levels: { 1: ['fact', 'tf', 'fact'], 2: ['fact', 'order', 'tf'], 3: ['order', 'fact', 'tf'] }
  });

})(typeof window !== 'undefined' ? window.MathLadder : global.MathLadder);
