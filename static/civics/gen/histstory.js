/* American History & Civics Ladder, Stories from History (histstory, ages 9 and 10): problem generators for every topic.
   Each topic has banks of facts written from its lesson (data/civics/lessons/histstory.json) and problems made from a
   model: time lines (which came first, put in order, how many years between, across BC and AD), maps (which place is
   marked), and a few number puzzles from the lessons (Roman numerals, Maya numbers).
     level 1  three choices; the wrong ones include the topic's most common mistake
     level 2  four choices, putting events in order, years between two dates
     level 3  four choices, longer orders, "choose all that are true", years across BC and AD
   Built from /tmp/work_kids910/tools/histstory_gen.tpl.js (the shared helpers are the same as Science Explorers'). */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var M = Math;

  // ---------------------------------------------------------------- shared helpers
  function letter(i) { return String.fromCharCode(65 + i); }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function uniq(a) { var seen = {}, out = []; a.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } }); return out; }
  function mcOf(right, wrongs) { return { t: 'mc', choices: uniq([right].concat(wrongs.filter(function (w) { return w !== right; }))), v: 0 }; }
  function pic(name, opts) { var o = { quiet: true, interactive: false }; for (var k in opts) o[k] = opts[k]; return { name: name, opts: o }; }
  function still(name, opts) { var o = { interactive: false }; for (var k in opts) o[k] = opts[k]; return { name: name, opts: o }; }
  function nWrong(ctx) { return (ctx.level || 1) === 1 ? 2 : 3; }
  function num(v, unit) { return { t: 'num', v: String(v), unit: unit }; }
  function fin(p, hint) { if (hint && !p.hint) p.hint = hint; if (!p.viz) delete p.viz; if (p.a && p.a.unit) { p.unit = p.a.unit; delete p.a.unit; } return p; }
  function nmr(R) { return R.pick(['Maya', 'Leo', 'Ana', 'Sam', 'Priya', 'Jamal', 'Kenji', 'Rosa', 'Omar', 'Lily', 'Diego', 'Nora', 'Eli', 'Zara', 'Ben', 'Mei']); }
  // fact: [question, right, [wrongs, the most common mistake first], why, viz?]
  function factQ(R, ctx, it) {
    var wr = it[2].slice(), k = M.min(nWrong(ctx), wr.length);
    var pickW = (ctx.level || 1) === 1 ? [wr[0]].concat(R.sample(wr.slice(1), M.min(k - 1, wr.length - 1))) : R.sample(wr, k);
    return { q: it[0], a: mcOf(it[1], pickW), steps: ['The answer: ' + it[1] + '.', it[3]], viz: it[4] };
  }
  // tf: [statement, true|false, why]
  function tfQ(R, ctx, it) { return { q: '<b>True or false?</b> ' + it[0], a: { t: 'tf', v: it[1] }, steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] }; }
  // all: four statements from the tf bank, at least one true and one false: choose all that are true
  function allQ(R, ctx, bank) {
    var T = bank.filter(function (x) { return x[1]; }), F = bank.filter(function (x) { return !x[1]; });
    if (!T.length || !F.length || bank.length < 4) return tfQ(R, ctx, R.pick(bank));
    var nT = R.int(1, M.min(3, T.length)), nF = M.min(4 - nT, F.length), pick = R.shuffle(R.sample(T, nT).concat(R.sample(F, nF)));
    var v = []; pick.forEach(function (x, i) { if (x[1]) v.push(i); });
    return { q: '<b>Choose all that are true.</b>', a: { t: 'mc', choices: pick.map(function (x) { return x[0]; }), v: v, keep: true },
      steps: pick.map(function (x) { return (x[1] ? 'True: ' : 'False: ') + x[0] + ' ' + x[2]; }) };
  }
  // order: [prompt, [items, first to last], why]
  function orderQ(R, ctx, it) {
    var items = it[1], L = ctx.level || 1, n = L === 1 ? M.min(3, items.length) : L === 2 ? M.min(4, items.length) : items.length;
    var start = R.int(0, items.length - n), sub = items.slice(start, start + n), right = sub.join(' → '), wrongs = [], tries = 0;
    while (wrongs.length < nWrong(ctx) && tries++ < 80) { var s = R.shuffle(sub).join(' → '); if (s !== right && wrongs.indexOf(s) < 0) wrongs.push(s); }
    return { q: it[0] + ' <b>Which order is right, first to last?</b>', a: mcOf(right, wrongs), steps: sub.map(function (x, i) { return (i + 1) + '. ' + x; }).concat(it[2] ? [it[2]] : []) };
  }
  // sort: [question with {x}, [[thing, group], ...], [group names], why]
  function sortQ(R, ctx, it) {
    var pair = R.pick(it[1]), groups = it[2];
    return { q: it[0].replace('{x}', pair[0]), a: mcOf(pair[1], groups.filter(function (g) { return g !== pair[1]; })), steps: [cap(pair[0]) + ': ' + pair[1] + '.', it[3]] };
  }
  // pick: [question, [right things], [wrong things], why]
  function pickQ(R, ctx, it) {
    var right = R.pick(it[1]), wr = R.sample(it[2], M.min(nWrong(ctx), it[2].length));
    return { q: it[0], a: mcOf(right, wr), steps: ['The answer: ' + right + '.', it[3]] };
  }
  var DEF = {
    1: ['fact', 'fact', 'tf', 'sort', 'pick', 'c1', 'c1'],
    2: ['fact', 'tf', 'order', 'sort', 'pick', 'c2', 'c1', 'c2'],
    3: ['fact', 'order', 'sort', 'pick', 'all', 'c3', 'c2', 'c3']
  };
  // T(id, spec): spec.fact / tf / order / sort / pick are banks; c1, c2, c3 make problems from a model (c1 at levels 1 and 2,
  // c2 at 2 and 3, c3 at 3; a missing one is skipped); spec.hint
  function T(id, spec) {
    ML.gen(id, function (R, ctx) {
      var L = ctx.level || 1, plan = DEF[L], tries = 0;
      while (tries++ < 30) {
        var kind = R.pick(plan), fn = null;
        if (kind === 'c1' || kind === 'c2' || kind === 'c3') fn = spec[kind];
        else if (kind === 'all') fn = spec.tf && spec.tf.length >= 4 ? function () { return allQ(R, ctx, spec.tf); } : null;
        else if (spec[kind] && spec[kind].length) { var bank = spec[kind]; fn = function () { return ({ fact: factQ, tf: tfQ, order: orderQ, sort: sortQ, pick: pickQ })[kind](R, ctx, R.pick(bank)); }; }
        if (fn) return fin(fn(R, ctx), spec.hint);
      }
      return fin(factQ(R, ctx, R.pick(spec.fact)), spec.hint);
    });
  }
  // ---------------------------------------------------------------- dates and the time line
  // a year as words: -753 "753 BC", 476 "AD 476", 1492 "1492"
  function yr(y) { return y < 0 ? (-y).toLocaleString('en-US') + ' BC' : y < 1000 ? 'AD ' + y : String(y); }
  function yrsBetween(a, b) { var lo = M.min(a, b), hi = M.max(a, b); return lo < 0 && hi > 0 ? hi - lo - 1 : hi - lo; }
  function betweenSteps(a, b) {
    var lo = M.min(a, b), hi = M.max(a, b);
    if (lo < 0 && hi > 0) return ['One date is BC and one is AD, so add: ' + (-lo).toLocaleString('en-US') + ' + ' + hi.toLocaleString('en-US') + ' = ' + (hi - lo).toLocaleString('en-US') + '.', 'There is no year 0, so take away 1: ' + (hi - lo - 1).toLocaleString('en-US') + ' years.'];
    if (hi < 0) return ['Both dates are BC: subtract the smaller number from the bigger one.', (-lo).toLocaleString('en-US') + ' − ' + (-hi).toLocaleString('en-US') + ' = ' + (hi - lo).toLocaleString('en-US') + ' years.'];
    return ['Both dates are AD: subtract.', hi.toLocaleString('en-US') + ' − ' + lo.toLocaleString('en-US') + ' = ' + (hi - lo).toLocaleString('en-US') + ' years.'];
  }
  // events: [year, what happened]
  function firstQ(R, ctx, ev, last) {
    var pick = R.sample(ev, (ctx.level || 1) === 1 ? 3 : 4), sorted = pick.slice().sort(function (a, b) { return a[0] - b[0]; }), right = last ? sorted[sorted.length - 1] : sorted[0];
    return { q: 'Which of these happened <b>' + (last ? 'last' : 'first') + '</b>?', a: mcOf(right[1], pick.filter(function (e) { return e !== right; }).map(function (e) { return e[1]; })), steps: sorted.map(function (e) { return yr(e[0]) + ': ' + e[1] + '.'; }) };
  }
  function orderEv(R, ctx, ev) {
    var n = (ctx.level || 1) === 1 ? 3 : (ctx.level === 2 ? 3 : 4), pick = R.sample(ev, M.min(n, ev.length)), sorted = pick.slice().sort(function (a, b) { return a[0] - b[0]; });
    var right = sorted.map(function (e) { return e[1]; }).join(' → '), wr = [], t = 0;
    while (wr.length < nWrong(ctx) && t++ < 60) { var s = R.shuffle(sorted).map(function (e) { return e[1]; }).join(' → '); if (s !== right && wr.indexOf(s) < 0) wr.push(s); }
    return { q: 'Put these in time order. <b>Which order is right, earliest first?</b>', a: mcOf(right, wr), steps: sorted.map(function (e) { return yr(e[0]) + ': ' + e[1] + '.'; }) };
  }
  function betweenQ(R, ctx, ev) {
    var p = R.sample(ev, 2), a = p[0], b = p[1], n = yrsBetween(a[0], b[0]);
    if (!n) return firstQ(R, ctx, ev);
    var e1 = a[0] < b[0] ? a : b, e2 = a[0] < b[0] ? b : a;
    return { q: e1[1] + ' in ' + yr(e1[0]) + '. ' + e2[1] + ' in ' + yr(e2[0]) + '. How many years apart are these two events?', a: num(n, 'years'), steps: betweenSteps(e1[0], e2[0]) };
  }
  function yearOfQ(R, ctx, ev) {
    var e = R.pick(ev), y = e[0], wr = uniq([y < 0 ? yr(-y) : yr(-y), yr(y + (R.coin() ? 100 : -100)), yr(y + (R.coin() ? 1000 : -1000)), yr(y + 50)].filter(function (x) { return x !== yr(y) && !/^0|AD 0$/.test(x); }));
    return { q: 'When did this happen: <b>' + e[1] + '</b>?', a: mcOf(yr(y), R.sample(wr, M.min(nWrong(ctx), wr.length))), steps: [e[1] + ': ' + yr(y) + '.'] };
  }
  function tl(ev, o) { var x = { events: ev, interactive: false }; for (var k in o) x[k] = o[k]; return { name: 'histstory-timeline', opts: x }; }
  // the place marked "?" on a map. places: [[key, name], …]
  function mapQ(R, ctx, places, view, what) {
    var pick = R.sample(places, M.min(places.length, 4)), i = R.int(0, pick.length - 1);
    return { q: 'Which ' + (what || 'place') + ' is marked "?" on the map?', a: mcOf(pick[i][1], R.sample(places.filter(function (p) { return p !== pick[i]; }).map(function (p) { return p[1]; }), nWrong(ctx))), steps: ['The "?" marks ' + pick[i][1] + '.'],
      viz: { name: 'histstory-map', opts: { places: pick.map(function (p) { return p[0]; }), ask: i, view: view, interactive: false, quiet: true, note: ' ' } } };
  }
  // events of the whole course, for comparisons across topics
  var ALL = [[-10000, 'Farming begins in the Fertile Crescent'], [-3200, 'Cuneiform writing begins in Sumer'], [-3100, 'Upper and Lower Egypt are joined'], [-2560, 'The Great Pyramid is built'], [-2600, 'Indus cities are at their height'], [-1754, 'Hammurabi\'s laws are carved'], [-1250, 'Shang priests write on oracle bones'], [-776, 'The first Olympic Games'], [-753, 'Rome is founded (in legend)'], [-509, 'Rome becomes a republic'], [-490, 'The Battle of Marathon'], [-399, 'Socrates dies'], [-323, 'Alexander the Great dies'], [-221, 'The First Emperor unites China'], [-218, 'Hannibal crosses the Alps'], [-44, 'Julius Caesar is killed'], [-27, 'Augustus becomes the first emperor'], [79, 'Vesuvius buries Pompeii'], [313, 'Constantine allows Christian worship'], [476, 'The Western Roman Empire ends'], [537, 'Hagia Sophia is finished'], [622, 'The Hijra: Muhammad moves to Medina'], [800, 'Charlemagne is crowned emperor'], [868, 'The Diamond Sutra is printed'], [1000, 'Leif Erikson reaches North America'], [1215, 'Magna Carta'], [1324, 'Mansa Musa travels to Mecca'], [1455, 'Gutenberg prints his Bible'], [1492, 'Columbus crosses the Atlantic'], [1517, 'Luther writes the 95 Theses'], [1543, 'Copernicus says the Earth goes around the Sun'], [1687, 'Newton explains gravity'], [1776, 'The Declaration of Independence'], [1789, 'The French Revolution begins'], [1807, 'Britain bans the slave trade'], [1865, 'Slavery ends in the United States'], [1903, 'The Wright brothers fly'], [1914, 'World War I begins'], [1945, 'World War II ends'], [1969, 'People walk on the Moon'], [1989, 'The Berlin Wall opens']];

  // ================================================================ Unit 1: How We Know the Past
  var SRCS = [['a letter written by a soldier during the Revolutionary War', 'primary'], ['a coin found in the ruins of Pompeii', 'primary'], ['a photograph taken in 1925', 'primary'], ['a diary kept by a pioneer girl', 'primary'], ['a clay tablet from Sumer', 'primary'], ['a newspaper printed the day after the Moon landing', 'primary'], ['a tool found by archaeologists in a Viking camp', 'primary'], ['a speech given by Frederick Douglass', 'primary'],
    ['a children\'s book about Pompeii written in 2015', 'secondary'], ['an encyclopedia article about the Vikings', 'secondary'], ['a history textbook', 'secondary'], ['a documentary film made today about ancient Egypt', 'secondary'], ['this lesson about history detectives', 'secondary'], ['a biography of George Washington written in 1990', 'secondary']];
  T('histstory.how-we-know', {
    hint: 'A primary source comes from the time itself. A secondary source is written later by someone studying the past.',
    fact: [
      ['Who digs carefully for things people left behind long ago?', 'an archaeologist', ['a historian who only reads books', 'an astronaut', 'a librarian'], 'Archaeologists dig and record where each thing was found.'],
      ['When archaeologists dig, the deeper layers are usually…', 'older', ['newer', 'the same age as the top', 'empty'], 'Layers pile up over time, so deeper usually means older.'],
      ['Who found the tomb of Tutankhamun in 1922?', 'Howard Carter', ['Christopher Columbus', 'Julius Caesar', 'Marco Polo'], 'He said he saw "wonderful things."'],
      ['What helped scholars read Egyptian hieroglyphs again?', 'the Rosetta Stone, with one message in three scripts', ['a map of the Nile', 'a dictionary from 1922', 'the Great Pyramid'], 'It was found in 1799.'],
      ['Why do historians compare several sources?', 'different people can see the same event differently', ['to make the book longer', 'one source is always enough', 'because old sources are all false'], 'Comparing sources gets closer to what really happened.'],
      ['Which question should a historian ask about a source?', 'Who wrote this, and why?', ['How heavy is it?', 'Is it my favorite?', 'What color is the cover?'], 'Who, when and why help you judge a source.']
    ],
    tf: [
      ['A letter written during a war is a primary source about that war.', true, 'It comes from the time itself.'],
      ['A history textbook is a primary source.', false, 'It is written later: a secondary source.'],
      ['Some of the best clues to the past were found by accident.', true, 'Like the Rosetta Stone, found by soldiers digging in 1799.'],
      ['One source always tells the whole truth.', false, 'Historians compare several sources.'],
      ['Archaeologists write down exactly where each thing was found.', true, 'The place and the layer are clues to its age.']
    ],
    sort: [['Is {x} a primary source or a secondary source?', SRCS, ['primary', 'secondary'], 'Primary sources come from the time itself; secondary sources are made later by people studying it.']],
    c1: function (R, ctx) {
      var it = R.pick(SRCS.filter(function (s) { return s[1] === 'primary'; })), wr = R.sample(SRCS.filter(function (s) { return s[1] === 'secondary'; }), nWrong(ctx));
      return { q: 'Which of these is a <b>primary</b> source?', a: mcOf(it[0], wr.map(function (s) { return s[0]; })), steps: [cap(it[0]) + ' comes from the time itself.', 'The others were made later.'] };
    },
    c2: function (R, ctx) {
      var it = R.pick(SRCS.filter(function (s) { return s[1] === 'secondary'; })), wr = R.sample(SRCS.filter(function (s) { return s[1] === 'primary'; }), nWrong(ctx));
      return { q: 'Which of these is a <b>secondary</b> source?', a: mcOf(it[0], wr.map(function (s) { return s[0]; })), steps: [cap(it[0]) + ' was made later by someone studying the past.'] };
    }
  });

  T('histstory.bc-and-ad', {
    hint: 'BC years count down toward AD 1; AD years count up. With BC, a bigger number is longer ago. There is no year 0.',
    fact: [
      ['What does AD stand for?', 'anno Domini, Latin for "in the year of the Lord"', ['After Death', 'Ancient Days', 'After Dinosaurs'], 'AD years are counted from the birth of Jesus.'],
      ['What does BC stand for?', 'before Christ', ['before calendars', 'born counting', 'before cities'], 'BC years come before the birth of Jesus.'],
      ['What year comes right after 1 BC?', 'AD 1', ['0', '2 BC', 'AD 0'], 'There is no year 0.'],
      ['Which is longer ago, 500 BC or 300 BC?', '500 BC', ['300 BC', 'they are the same', 'it depends on the month'], 'With BC, a bigger number is longer ago.'],
      ['Who worked out the count of years from the birth of Jesus, about AD 525?', 'the monk Dionysius Exiguus', ['Julius Caesar', 'Augustus', 'Charlemagne'], 'His count spread through Europe and the world.'],
      ['Which years make up the 19th century?', '1801 to 1900', ['1900 to 1999', '1901 to 2000', '1800 to 1899'], 'A century is 100 years; the 19th ends with 1900.'],
      ['How many years are in a century?', '100', ['10', '1,000', '50'], 'Century comes from the Latin for a hundred.']
    ],
    tf: [
      ['There was a year 0 between 1 BC and AD 1.', false, '1 BC is followed right away by AD 1.'],
      ['BCE and CE use the same numbers as BC and AD.', true, 'Only the letters are different.'],
      ['776 BC is earlier than 753 BC.', true, '776 is bigger, so it is longer ago.'],
      ['We live in the 20th century.', false, 'The 2000s are the 21st century.'],
      ['AD years are counted forward: AD 1, AD 2, AD 3…', true, 'And BC years are counted backward.']
    ],
    c1: function (R, ctx) {
      var a = R.int(2, 20) * 50, b = R.intNot(1, 20, a / 50) * 50, bc = R.coin(), A2 = bc ? -a : a, B2 = bc ? -b : b, early = A2 < B2 ? A2 : B2;
      return { q: 'Which year is <b>earlier</b>: ' + yr(A2) + ' or ' + yr(B2) + '?', a: mcOf(yr(early), [yr(early === A2 ? B2 : A2), 'they are the same year'].slice(0, nWrong(ctx))), steps: [bc ? 'With BC dates, the bigger number is longer ago.' : 'With AD dates, the smaller number is earlier.', yr(early) + ' is earlier.'] };
    },
    c2: function (R, ctx) {
      var k = R.int(0, 2), a, b;
      if (k === 0) { a = R.int(10, 99) * 10 + 1000; b = a + R.int(2, 60) * 5; }
      else if (k === 1) { a = -R.int(20, 90) * 10; b = a + R.int(2, 15) * 10; }
      else { a = -R.int(1, 40) * 10; b = R.int(1, 40) * 10; }
      return { q: 'How many years are there from ' + yr(a) + ' to ' + yr(b) + '?', a: num(yrsBetween(a, b), 'years'), steps: betweenSteps(a, b) };
    },
    c3: function (R, ctx) {
      if (R.coin()) { var y = R.int(1, 20) * 100 + R.int(1, 99), c = M.floor((y - 1) / 100) + 1, sfx = c % 10 === 1 && c !== 11 ? 'st' : c % 10 === 2 && c !== 12 ? 'nd' : c % 10 === 3 && c !== 13 ? 'rd' : 'th';
        return { q: 'Which century is the year ' + yr(y) + ' in?', a: mcOf(c + sfx, [(c - 1) + ((c - 1) % 10 === 1 && c - 1 !== 11 ? 'st' : (c - 1) % 10 === 2 && c - 1 !== 12 ? 'nd' : (c - 1) % 10 === 3 && c - 1 !== 13 ? 'rd' : 'th'), (c + 1) + ((c + 1) % 10 === 1 && c + 1 !== 11 ? 'st' : (c + 1) % 10 === 2 && c + 1 !== 12 ? 'nd' : (c + 1) % 10 === 3 && c + 1 !== 13 ? 'rd' : 'th')].filter(function (x) { return x !== c + sfx && !/^0/.test(x); })), steps: ['The ' + c + sfx + ' century runs from ' + yr((c - 1) * 100 + 1) + ' to ' + yr(c * 100) + '.', yr(y) + ' falls inside it.'] }; }
      var a2 = -R.int(1, 60) * 10 - R.int(0, 9), b2 = R.int(1, 60) * 10 + R.int(0, 9);
      return { q: 'How many years are there from ' + yr(a2) + ' to ' + yr(b2) + '?', a: num(yrsBetween(a2, b2), 'years'), steps: betweenSteps(a2, b2), viz: tl([[a2, 'Start'], [b2, 'End']], { quiet: true }) };
    }
  });

  // ================================================================ Unit 2: First Farmers and First Cities
  T('histstory.first-farmers', {
    hint: 'Hunter-gatherers moved with the seasons; farmers stayed near their fields and built villages. Farming began about 12,000 years ago in the Fertile Crescent.',
    fact: [
      ['How did people live for most of the human story?', 'as hunter-gatherers', ['as farmers in big cities', 'as factory workers', 'as knights'], 'They hunted animals and gathered wild plants.'],
      ['Where did farming first begin, about 12,000 years ago?', 'the Fertile Crescent in the Middle East', ['England', 'Australia', 'Antarctica'], 'People there planted wild wheat and barley.'],
      ['Why did farmers build lasting houses?', 'they had to stay near their fields', ['they were afraid of rain', 'they liked bricks', 'they had no legs for walking'], 'Crops need care for months.'],
      ['Which animals did early farmers tame first?', 'sheep, goats and cattle', ['horses and camels only', 'lions and bears', 'cats and parrots'], 'Tame herds gave meat, milk, wool and hides.'],
      ['How did extra stored food change villages?', 'some people could become potters, weavers and toolmakers', ['everyone had to hunt more', 'villages got smaller', 'nobody needed houses'], 'Not everyone had to farm.'],
      ['Which is one of the oldest towns we know?', 'Jericho', ['New York', 'Paris', 'Rome'], 'People lived at Jericho more than 10,000 years ago.'],
      ['Where did corn, beans and squash farming begin?', 'Mexico', ['China', 'Egypt', 'Britain'], 'Farming began on its own in several places.']
    ],
    tf: [
      ['Early people lived at the same time as the big dinosaurs.', false, 'The big dinosaurs died out about 66 million years before the first people.'],
      ['Farming began on its own in more than one place.', true, 'In the Middle East, China, Mexico, the Andes and more.'],
      ['Hunter-gatherers usually moved with the seasons.', true, 'They followed animals and ripe plants.'],
      ['Farming made the number of people grow.', true, 'Fields could feed more people than wild land.'],
      ['Rice farming began in Egypt.', false, 'Rice farming began in Asia, in China.']
    ],
    sort: [['Is this more like hunter-gatherer life or farming life? {x}', [['following herds of deer', 'hunter-gatherers'], ['gathering wild berries', 'hunter-gatherers'], ['moving camp each season', 'hunter-gatherers'], ['carrying everything on your back', 'hunter-gatherers'], ['planting wheat seeds', 'farmers'], ['storing grain in pots', 'farmers'], ['building a mud-brick house', 'farmers'], ['milking goats', 'farmers']], ['hunter-gatherers', 'farmers'], 'Farmers stayed in one place and grew food; hunter-gatherers moved and found it.']],
    order: [['How people\'s lives changed.', ['hunting and gathering', 'planting the first crops', 'farming villages', 'the first cities'], 'Farming came before villages, and villages before cities.']],
    c1: function (R, ctx) { return mapQ(R, ctx, [['jericho', 'Jericho'], ['catal', 'Çatalhöyük'], ['nile', 'the Nile River'], ['tigris', 'the Tigris and Euphrates']], 'mideast'); }
  });

  var MESO = [[-3500, 'The first cities grow in Sumer'], [-3200, 'Sumerians begin cuneiform writing'], [-2100, 'The Great Ziggurat of Ur is built'], [-1754, 'Hammurabi\'s laws are carved']];
  T('histstory.mesopotamia', {
    hint: 'Mesopotamia means "the land between the rivers," the Tigris and Euphrates. The Sumerians built the first cities and wrote in cuneiform.',
    fact: [
      ['What does "Mesopotamia" mean?', 'the land between the rivers', ['the land of pyramids', 'the middle of the sea', 'the land of ice'], 'It lay between the Tigris and Euphrates, in today\'s Iraq.'],
      ['What was cuneiform?', 'wedge-shaped writing pressed into clay', ['picture writing on papyrus', 'an alphabet like ours', 'knotted strings'], 'Scribes used a reed cut to a wedge.'],
      ['What were the first Sumerian writings mostly about?', 'counting grain, animals and goods', ['adventure stories', 'letters to friends', 'maps of the stars'], 'Writing began as record keeping.'],
      ['What was a ziggurat?', 'a giant stepped temple', ['a kind of boat', 'a clay tablet', 'a wheel'], 'Each Sumerian city had one.'],
      ['Who had nearly 300 laws carved on a tall stone?', 'Hammurabi, king of Babylon', ['the pharaoh Khufu', 'Julius Caesar', 'Confucius'], 'Written laws meant everyone could know the rules.'],
      ['Why do we have 60 minutes in an hour?', 'the Sumerians counted in sixties', ['the Romans liked 60', 'clocks were invented with 60 gears', 'there are 60 days in a season'], 'We still use their sixties for time and circles.'],
      ['Which invention were Sumerians among the first to use?', 'the wheel', ['the printing press', 'the telephone', 'the compass'], 'Wheels were used in Mesopotamia about 3500 BC.']
    ],
    tf: [
      ['The first writing used letters like ours.', false, 'It used hundreds of wedge-shaped signs.'],
      ['Mesopotamia was in today\'s Iraq.', true, 'Between the Tigris and Euphrates Rivers.'],
      ['Hammurabi\'s laws were written down for all to see.', true, 'That was the big new idea.'],
      ['Ur and Uruk were cities in Sumer.', true, 'Among the first cities in the world.'],
      ['Scribes learned to write in a week.', false, 'They went to school for years.']
    ],
    c1: function (R, ctx) { return mapQ(R, ctx, [['ur', 'Ur'], ['babylon', 'Babylon'], ['uruk', 'Uruk'], ['giza', 'Giza'], ['jericho', 'Jericho']], 'mideast', 'city'); },
    c2: function (R, ctx) { return R.coin() ? orderEv(R, ctx, MESO) : firstQ(R, ctx, MESO); },
    c3: function (R, ctx) { return betweenQ(R, ctx, MESO.concat([[-3100, 'Upper and Lower Egypt are joined'], [-2560, 'The Great Pyramid is built']])); }
  });

  // ================================================================ Unit 3: River Kingdoms
  var EGY = [[-3100, 'Upper and Lower Egypt are joined'], [-2560, 'The Great Pyramid is built'], [-1473, 'Hatshepsut rules'], [-1336, 'Tutankhamun becomes pharaoh'], [-30, 'Cleopatra dies']];
  T('histstory.ancient-egypt', {
    hint: 'The Nile\'s yearly flood left rich soil. Pharaohs ruled for about 3,000 years; Egyptians wrote hieroglyphs and built pyramids.',
    fact: [
      ['Why could Egypt grow so much food in a desert?', 'the Nile flooded each year and left rich black mud', ['it rained every day', 'they had great forests', 'they imported all their food'], 'Herodotus called Egypt "the gift of the river."'],
      ['What were the kings of Egypt called?', 'pharaohs', ['emperors of Rome', 'shoguns', 'consuls'], 'Pharaohs ruled for about 3,000 years.'],
      ['What was Egyptian picture writing called?', 'hieroglyphs', ['cuneiform', 'the alphabet', 'quipu'], 'The Rosetta Stone helped us read them again.'],
      ['Who was the Great Pyramid built for?', 'the pharaoh Khufu', ['Cleopatra', 'Alexander the Great', 'Tutankhamun'], 'It was built about 2560 BC.'],
      ['Why did Egyptians make mummies?', 'they hoped the person\'s spirit would live on after death', ['to scare robbers', 'to make the body lighter', 'as a game'], 'They believed in a life after death.'],
      ['About how long did pharaohs rule Egypt?', 'about 3,000 years', ['about 30 years', 'about 300 years', 'about 30,000 years'], 'From about 3100 BC to 30 BC.']
    ],
    tf: [
      ['Cleopatra lived closer in time to us than to the builders of the Great Pyramid.', true, 'The pyramid was about 2,500 years old in her day.'],
      ['The Great Pyramid was the tallest building in the world for almost 4,000 years.', true, 'Nothing taller was built until the Middle Ages.'],
      ['Most Egyptians lived far from the Nile.', false, 'Almost everyone lived close to the river.'],
      ['Egyptians believed in many gods.', true, 'And in a life after death.'],
      ['Tutankhamun built the Great Pyramid.', false, 'It was built for Khufu, more than 1,000 years before Tutankhamun.']
    ],
    c1: function (R, ctx) { return mapQ(R, ctx, [['giza', 'Giza'], ['thebes', 'Thebes'], ['alexandria', 'Alexandria'], ['jerusalem', 'Jerusalem'], ['babylon', 'Babylon']], 'mideast'); },
    c2: function (R, ctx) { return R.coin() ? orderEv(R, ctx, EGY) : yearOfQ(R, ctx, EGY); },
    c3: function (R, ctx) { return betweenQ(R, ctx, EGY); }
  });

  T('histstory.ancient-india', {
    hint: 'The Indus Valley cities, like Mohenjo-daro, had grid streets and drains. Nobody can read their script yet. Ashoka spread messages of kindness on pillars.',
    fact: [
      ['What was special about the streets of Mohenjo-daro?', 'they ran straight, in a grid, with covered drains', ['they were made of gold', 'they were all canals', 'they had no houses'], 'The city was carefully planned.'],
      ['Can we read the Indus script today?', 'no, not yet', ['yes, easily', 'yes, with the Rosetta Stone', 'only on Tuesdays'], 'We learn about the Indus cities from what archaeologists dig up.'],
      ['Which emperor carved messages of kindness on stone pillars?', 'Ashoka', ['Augustus', 'Hammurabi', 'Napoleon'], 'He became a follower of the Buddha after a terrible war.'],
      ['What changed Ashoka\'s mind about war?', 'the suffering he saw after a terrible war he won', ['losing every battle', 'a dream about elephants', 'a letter from Rome'], 'He turned to kindness and respect.'],
      ['Which great gift to mathematics came from ancient India?', 'our numerals with zero and place value', ['Roman numerals', 'the abacus', 'the ruler'], 'Brahmagupta wrote rules for zero in AD 628.'],
      ['Which river gave the Indus Valley civilization its name?', 'the Indus', ['the Nile', 'the Yellow River', 'the Tiber'], 'It flows through today\'s Pakistan.']
    ],
    tf: [
      ['Many houses in Mohenjo-daro had a bathroom with a drain.', true, 'Drains ran into covered sewers.'],
      ['The Indus people traded with Mesopotamia.', true, 'Their seals have been found there.'],
      ['Ashoka asked people to respect other faiths.', true, 'His pillars said so.'],
      ['The Indus cities were built by the Romans.', false, 'They are more than 2,000 years older than Rome.']
    ],
    c1: function (R, ctx) { return mapQ(R, ctx, [['mohenjo', 'Mohenjo-daro'], ['harappa', 'Harappa'], ['varanasi', 'Varanasi'], ['anyang', 'Anyang'], ['xian', "Chang'an"]], 'asia', 'city'); },
    c2: function (R, ctx) { return firstQ(R, ctx, [[-2600, 'Indus cities are at their height'], [-268, 'Ashoka begins to rule'], [628, 'Brahmagupta writes about zero'], [-3200, 'Cuneiform writing begins'], [-776, 'The first Olympic Games']], R.coin()); }
  });

  var CHINA = [[-1600, 'The Shang dynasty begins'], [-551, 'Confucius is born'], [-221, 'The First Emperor unites China'], [-206, 'The Han dynasty begins'], [105, 'Cai Lun improves paper (tradition)']];
  T('histstory.ancient-china', {
    hint: 'Dynasties are ruling families. Shang: oracle bones. Confucius: respect and good government. Qin: the First Emperor. Han: silk and paper.',
    fact: [
      ['What is a dynasty?', 'a ruling family that passes power from parent to child', ['a kind of wall', 'a Chinese boat', 'a holiday'], 'China\'s history is counted in dynasties.'],
      ['What did Shang priests write on?', 'turtle shells and animal bones', ['paper', 'clay tablets', 'papyrus'], 'Oracle bones hold the oldest Chinese writing we know.'],
      ['What did Confucius teach?', 'respect for parents, fair rulers and lifelong learning', ['how to build pyramids', 'how to sail to America', 'how to make gunpowder'], 'His students collected his sayings in the Analects.'],
      ['Who was buried with about 8,000 clay soldiers?', 'the First Emperor of China', ['Confucius', 'Khufu', 'Augustus'], 'The Terracotta Army was found in 1974.'],
      ['Which dynasty traded silk along the Silk Road and made paper?', 'the Han', ['the Shang', 'the Ming', 'the Qin'], 'The Han ruled from 206 BC to AD 220.'],
      ['What did the First Emperor make everyone use?', 'the same writing, money and weights', ['the same clothes', 'the same name', 'Latin'], 'It helped unite China.'],
      ['Along which river did Chinese civilization grow?', 'the Yellow River', ['the Nile', 'the Amazon', 'the Thames'], 'Its yellow mud gives it the name.']
    ],
    tf: [
      ['The Great Wall was built all at once.', false, 'It was built and rebuilt over about 2,000 years.'],
      ['Most of the Great Wall visitors see today was built by the Ming dynasty.', true, 'After AD 1368.'],
      ['Many oracle-bone signs are ancestors of Chinese characters today.', true, 'The writing has a very long history.'],
      ['The Terracotta Army was found by farmers digging a well.', true, 'In 1974.'],
      ['Paper was first made in Europe.', false, 'It was first made in China.']
    ],
    c1: function (R, ctx) { return R.coin() ? mapQ(R, ctx, [['anyang', 'Anyang'], ['xian', "Chang'an (Xi'an)"], ['yellow', 'the Yellow River'], ['beijing', 'Beijing'], ['mohenjo', 'Mohenjo-daro']], 'asia') : yearOfQ(R, ctx, CHINA); },
    c2: function (R, ctx) { return R.coin() ? orderEv(R, ctx, CHINA) : firstQ(R, ctx, CHINA, R.coin()); },
    c3: function (R, ctx) { return betweenQ(R, ctx, CHINA); }
  });

  // ================================================================ Unit 4: Greece and Rome
  var GREECE = [[-776, 'The first Olympic Games'], [-508, 'Democracy begins in Athens'], [-490, 'The Battle of Marathon'], [-480, 'Thermopylae and Salamis'], [-431, 'The Peloponnesian War begins']];
  T('histstory.athens-and-sparta', {
    hint: 'Athens: a democracy where citizens voted on laws. Sparta: two kings, and boys trained as soldiers. Together they turned back Persia.',
    fact: [
      ['What was ancient Greece made of?', 'hundreds of city-states', ['one big country with one king', 'three empires', 'a single city'], 'Each city-state had its own laws and army.'],
      ['What does "democracy" mean?', 'rule by the people', ['rule by one king', 'rule by soldiers', 'rule by priests'], 'In Athens, citizens voted on laws themselves.'],
      ['At what age did Spartan boys begin army training?', 'seven', ['twenty', 'one', 'forty'], 'Sparta prized discipline and courage.'],
      ['Who won the Battle of Marathon in 490 BC?', 'the Athenians', ['the Persians', 'the Romans', 'the Egyptians'], 'It was a surprise victory.'],
      ['Who held the pass at Thermopylae for three days?', 'King Leonidas and his Spartans', ['Alexander the Great', 'Julius Caesar', 'Pericles alone'], 'Then the Athenian navy won at Salamis.'],
      ['Who could vote in the Athenian assembly?', 'free men whose parents were Athenian citizens', ['everyone living in Athens', 'only the king', 'women only'], 'Women, enslaved people and foreigners could not vote.'],
      ['Where were the ancient Olympic Games held?', 'Olympia', ['Athens', 'Rome', 'Sparta'], 'Wars stopped so athletes could travel safely.']
    ],
    tf: [
      ['Athens and Sparta fought together against Persia.', true, 'Then later fought each other.'],
      ['Everyone in Athens could vote.', false, 'Only free male citizens could.'],
      ['Sparta was ruled by two kings and a council.', true, 'An unusual government.'],
      ['The first Olympic Games were held in 776 BC.', true, 'More than 2,700 years ago.'],
      ['Athens loved plays, temples and learning.', true, 'Sparta prized a strong army.']
    ],
    sort: [['Does this describe Athens or Sparta? {x}', [['citizens voted on laws themselves', 'Athens'], ['famous for plays and thinkers', 'Athens'], ['built the Parthenon', 'Athens'], ['boys trained as soldiers from age 7', 'Sparta'], ['ruled by two kings', 'Sparta'], ['Leonidas was its king', 'Sparta']], ['Athens', 'Sparta'], 'Athens: democracy and learning. Sparta: kings and soldiers.']],
    c1: function (R, ctx) { return mapQ(R, ctx, [['athens', 'Athens'], ['sparta', 'Sparta'], ['olympia', 'Olympia'], ['rome', 'Rome'], ['carthage', 'Carthage']], 'med'); },
    c2: function (R, ctx) { return R.coin() ? orderEv(R, ctx, GREECE) : firstQ(R, ctx, GREECE, R.coin()); },
    c3: function (R, ctx) { return betweenQ(R, ctx, GREECE); }
  });

  var CHAIN = ['Socrates', 'Plato', 'Aristotle', 'Alexander'];
  T('histstory.greek-thinkers', {
    hint: 'Teacher to student: Socrates → Plato → Aristotle → Alexander.',
    fact: [
      ['What does "philosopher" mean?', 'lover of wisdom', ['king of Greece', 'teacher of soldiers', 'maker of maps'], 'Philosophers ask big questions about life.'],
      ['Which philosopher wrote nothing down himself?', 'Socrates', ['Plato', 'Aristotle', 'Archimedes'], 'We know him from Plato\'s books.'],
      ['Who started a school in Athens called the Academy?', 'Plato', ['Socrates', 'Alexander', 'Leonidas'], 'Aristotle studied there.'],
      ['Who studied animals, plants, stars, poetry and government?', 'Aristotle', ['Socrates', 'Leonidas', 'Romulus'], 'He wrote books on almost everything.'],
      ['How far east did Alexander the Great march?', 'as far as India', ['only to Sparta', 'to China', 'to Britain'], 'He conquered the Persian Empire.'],
      ['Which city founded by Alexander became a great center of learning?', 'Alexandria in Egypt', ['Athens', 'Rome', 'Sparta'], 'It had a famous library.'],
      ['Who worked out how levers and floating things work?', 'Archimedes', ['Socrates', 'Hannibal', 'Alexander'], 'He lived in Syracuse.']
    ],
    tf: [
      ['Socrates taught Plato.', true, 'Plato wrote down his conversations.'],
      ['Aristotle was Alexander\'s teacher.', true, 'He taught the young prince of Macedonia.'],
      ['Alexander lived to be very old.', false, 'He died at 32.'],
      ['Socrates said wisdom begins with knowing what you don\'t know.', true, 'He asked questions to show it.'],
      ['Plato taught Socrates.', false, 'Socrates taught Plato.']
    ],
    c1: function (R, ctx) {
      var i = R.int(0, 2), before = R.coin() && i > 0;
      var who = before ? CHAIN[i] : CHAIN[i], right = before ? CHAIN[i - 1] : CHAIN[i + 1];
      return { q: before ? 'Who was ' + who + '\'s teacher?' : 'Who was ' + who + '\'s most famous student?', a: mcOf(right, CHAIN.filter(function (x) { return x !== right && x !== who; }).concat(['Leonidas']).slice(0, nWrong(ctx))), steps: ['Socrates → Plato → Aristotle → Alexander.'] };
    },
    c2: function (R, ctx) {
      var right = CHAIN.join(' → '), wr = [], t = 0; while (wr.length < nWrong(ctx) && t++ < 50) { var s = R.shuffle(CHAIN).join(' → '); if (s !== right && wr.indexOf(s) < 0) wr.push(s); }
      return { q: 'Put the teachers and students in order, <b>first teacher first</b>.', a: mcOf(right, wr), steps: ['Socrates taught Plato, Plato taught Aristotle, Aristotle taught Alexander.'] };
    },
    c3: function (R, ctx) {
      var age = R.int(20, 32), y = -356 + age;
      return { q: 'Alexander was born in 356 BC. In what year did he turn ' + age + '?', a: mcOf(yr(y), [yr(-356 - age), yr(y - 1 < 0 ? y - 1 : y), yr(y + 10)].filter(function (x) { return x !== yr(y); }).slice(0, nWrong(ctx))), steps: ['BC years count down as time goes on.', '356 − ' + age + ' = ' + (356 - age) + ', so ' + yr(y) + '.'] };
    }
  });

  var ROMEREP = [[-753, 'Rome is founded (in legend)'], [-509, 'Rome becomes a republic'], [-458, 'Cincinnatus saves Rome'], [-218, 'Hannibal crosses the Alps'], [-44, 'Julius Caesar is killed']];
  T('histstory.roman-republic', {
    hint: 'In a republic, citizens elect leaders. Rome had two consuls, elected for one year, and a Senate. It became a republic in 509 BC.',
    fact: [
      ['According to legend, who founded Rome?', 'Romulus', ['Julius Caesar', 'Hannibal', 'Augustus'], 'He and his twin Remus were cared for by a she-wolf.'],
      ['What is a republic?', 'a government where citizens elect leaders to govern for them', ['a government by one king for life', 'a city with no laws', 'a kind of temple'], 'Rome became a republic in 509 BC.'],
      ['How many consuls led Rome each year?', 'two', ['one', 'ten', 'a hundred'], 'Two, so that no one person held all the power.'],
      ['What was the Senate?', 'a council of experienced men who advised the leaders', ['the army', 'the king\'s family', 'a temple'], 'Senators were often from rich families.'],
      ['Which general marched war elephants over the Alps?', 'Hannibal of Carthage', ['Alexander', 'Leonidas', 'Cincinnatus'], 'In 218 BC.'],
      ['Why did Romans admire Cincinnatus?', 'he gave up power and went back to his farm', ['he became king', 'he built the Colosseum', 'he sailed to Britain'], 'Later Americans admired him too.'],
      ['On which river was Rome built?', 'the Tiber', ['the Nile', 'the Thames', 'the Indus'], 'On seven hills by the Tiber.']
    ],
    tf: [
      ['A republic and a direct democracy are exactly the same.', false, 'In a republic people elect leaders; in Athens citizens voted on laws themselves.'],
      ['Consuls served for one year.', true, 'So no one held power for long.'],
      ['Rome won its long wars with Carthage.', true, 'Even after Hannibal\'s victories.'],
      ['In the Roman Republic, rich and poor families had equal power.', false, 'Rich families had much more power.'],
      ['Romans dated the founding of their city to 753 BC.', true, 'From the legend of Romulus.']
    ],
    c1: function (R, ctx) { return mapQ(R, ctx, [['rome', 'Rome'], ['carthage', 'Carthage'], ['athens', 'Athens'], ['spain', 'Spain'], ['alexandria', 'Alexandria']], 'med'); },
    c2: function (R, ctx) { return R.coin() ? orderEv(R, ctx, ROMEREP) : firstQ(R, ctx, ROMEREP, R.coin()); },
    c3: function (R, ctx) { return betweenQ(R, ctx, ROMEREP); }
  });

  var RN = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  function roman(n) { var s = ''; RN.forEach(function (p) { while (n >= p[0]) { s += p[1]; n -= p[0]; } }); return s; }
  var EMPIRE = [[-44, 'Julius Caesar is killed'], [-27, 'Augustus becomes the first emperor'], [79, 'Vesuvius buries Pompeii'], [80, 'The Colosseum opens'], [-58, 'Caesar begins to conquer Gaul']];
  T('histstory.roman-empire', {
    hint: 'Augustus became the first emperor in 27 BC. Romans built roads, aqueducts and arches, and spoke Latin.',
    fact: [
      ['Who was the first Roman emperor?', 'Augustus', ['Julius Caesar', 'Romulus', 'Hannibal'], 'Caesar\'s adopted son, from 27 BC.'],
      ['What happened on the Ides of March, 44 BC?', 'Julius Caesar was killed', ['Rome was founded', 'Pompeii was buried', 'Augustus was born'], 'Senators feared he would end the republic.'],
      ['What did aqueducts do?', 'carried fresh water into cities', ['carried soldiers', 'kept out enemies', 'measured time'], 'They sloped gently downhill all the way.'],
      ['What language did the Romans speak?', 'Latin', ['Italian', 'Greek only', 'English'], 'Italian, Spanish and French grew out of Latin.'],
      ['What was the Pax Romana?', 'about 200 years of Roman peace', ['a Roman road', 'a war with Carthage', 'a temple'], 'Most of the empire was at peace.'],
      ['What buried Pompeii in AD 79?', 'the eruption of Vesuvius', ['a flood', 'an army', 'a snowstorm'], 'Ash preserved houses, shops and bakeries.'],
      ['Which English word comes from Latin aqua, "water"?', 'aquarium', ['portable', 'annual', 'scribble'], 'Also aqueduct.']
    ],
    tf: [
      ['Julius Caesar was the first Roman emperor.', false, 'Augustus was.'],
      ['Romans built about 50,000 miles of paved roads.', true, '"All roads lead to Rome."'],
      ['Romans spoke Italian.', false, 'They spoke Latin.'],
      ['The Colosseum could hold about 50,000 people.', true, 'Built with Roman concrete.'],
      ['More than half of English words come from Latin, many through French.', true, 'Words like portable and annual.']
    ],
    sort: [['Which Latin word does {x} come from?', [['aquarium', 'aqua (water)'], ['aqueduct', 'aqua (water)'], ['portable', 'portare (to carry)'], ['transport', 'portare (to carry)'], ['describe', 'scribere (to write)'], ['scribble', 'scribere (to write)'], ['annual', 'annus (year)'], ['anniversary', 'annus (year)']], ['aqua (water)', 'portare (to carry)', 'scribere (to write)', 'annus (year)'], 'Many English words grew from Latin roots.']],
    c1: function (R, ctx) {
      var n = R.coin() ? R.int(1, 39) : R.pick([40, 49, 50, 64, 76, 79, 90, 99, 100, 476, 500, 1000, 1492, 1776, 2000]), right = roman(n);
      if (R.coin()) return { q: 'What number is the Roman numeral <b>' + right + '</b>?', a: num(n, ''), steps: ['I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1,000. A smaller numeral before a bigger one is taken away.', right + ' = ' + n + '.'] };
      return { q: 'How do Romans write ' + n + '?', a: mcOf(right, uniq([roman(n + 1), roman(M.max(1, n - 1)), roman(n + 10), roman(n + 5)]).filter(function (x) { return x !== right; }).slice(0, nWrong(ctx))), steps: [n + ' = ' + right + '.'] };
    },
    c2: function (R, ctx) { return R.coin() ? mapQ(R, ctx, [['rome', 'Rome'], ['london', 'London'], ['alexandria', 'Alexandria'], ['jerusalem', 'Jerusalem'], ['constantinople', 'Constantinople'], ['pompeii', 'Pompeii']], 'med', 'city') : orderEv(R, ctx, EMPIRE); },
    c3: function (R, ctx) { return betweenQ(R, ctx, EMPIRE.concat([[14, 'Augustus dies']])); }
  });

  // ================================================================ Unit 5: Faiths of the Ancient World
  var FAITH = [['Jews', 'Judaism'], ['Hindus', 'Hinduism'], ['Buddhists', 'Buddhism']];
  var FAITHQ = [['the Torah', 'Judaism'], ['the Ten Commandments given to Moses', 'Judaism'], ['Passover', 'Judaism'], ['Abraham', 'Judaism'], ['the Vedas', 'Hinduism'], ['Diwali, the festival of lights', 'Hinduism'], ['dharma and karma', 'Hinduism'], ['the Bhagavad Gita', 'Hinduism'], ['the Four Noble Truths', 'Buddhism'], ['the Eightfold Path', 'Buddhism'], ['Siddhartha Gautama', 'Buddhism'], ['Vesak', 'Buddhism']];
  T('histstory.world-faiths', {
    hint: 'Jews worship one God and follow the Torah; Hindus follow the Vedas; Buddhists follow the Buddha\'s teachings about ending suffering.',
    fact: [
      ['Who do Jews believe made a covenant with Abraham?', 'God', ['the pharaoh', 'the Buddha', 'a Roman emperor'], 'A covenant is a solemn promise.'],
      ['Who, according to the Jewish scriptures, led the Israelites out of slavery in Egypt?', 'Moses', ['Abraham', 'Ashoka', 'Siddhartha'], 'And received the Ten Commandments.'],
      ['Where did Hinduism begin?', 'in India', ['in Greece', 'in Egypt', 'in Rome'], 'More than 3,000 years ago, with no single founder.'],
      ['What does "Buddha" mean?', 'the awakened one', ['the king', 'the teacher of Rome', 'the farmer'], 'Siddhartha Gautama was called the Buddha.'],
      ['Where was Siddhartha Gautama born?', 'Lumbini, in today\'s Nepal', ['Jerusalem', 'Athens', 'Mecca'], 'He was a prince.'],
      ['How should we talk about other people\'s faiths?', 'with respect, describing what their followers believe', ['as silly stories', 'by making fun of them', 'not at all'], 'We say "Hindus believe…" and listen kindly.'],
      ['Which festival remembers the escape from slavery in Egypt?', 'Passover', ['Diwali', 'Vesak', 'Ramadan'], 'It is a Jewish festival.']
    ],
    tf: [
      ['Judaism\'s belief in one God was shared by Christianity and Islam.', true, 'They began later.'],
      ['Hinduism had a single founder.', false, 'It grew over a long time, with no single founder.'],
      ['Buddhists follow the Eightfold Path.', true, 'It is part of the Buddha\'s teaching.'],
      ['The Buddha lived about 2,500 years ago.', true, 'In northern India.'],
      ['Diwali is the festival of lights.', true, 'A Hindu festival.']
    ],
    sort: [['Which faith is {x} part of?', FAITHQ, ['Judaism', 'Hinduism', 'Buddhism'], 'Each faith has its own holy writings, teachers and festivals.']],
    c1: function (R, ctx) { var f = R.pick(FAITHQ); return { q: 'Followers of which faith keep or honor <b>' + f[0] + '</b>?', a: mcOf(f[1], ['Judaism', 'Hinduism', 'Buddhism'].filter(function (x) { return x !== f[1]; })), steps: [cap(f[0]) + ': ' + f[1] + '.'] }; },
    c2: function (R, ctx) { return mapQ(R, ctx, [['jerusalem', 'Jerusalem'], ['varanasi', 'Varanasi'], ['lumbini', 'Lumbini'], ['mecca', 'Mecca'], ['rome', 'Rome']], 'world'); }
  });

  var XN = [[30, 'Jesus dies (about AD 30)'], [313, 'Constantine allows Christians to worship freely'], [380, 'Christianity becomes the empire\'s official religion'], [525, 'Dionysius counts years from the birth of Jesus'], [50, 'Paul travels and writes letters (about AD 50)']];
  T('histstory.christianity-spreads', {
    hint: 'Christians believe Jesus is the Son of God, who died and rose again. The apostles, like Paul, spread the faith around the Roman Empire.',
    fact: [
      ['In which land did Jesus teach?', 'Judea, ruled by the Roman Empire', ['Egypt, ruled by pharaohs', 'China', 'Greece, ruled by Sparta'], 'He was from the town of Nazareth.'],
      ['What do Christians believe about Jesus?', 'that he is the Son of God, who died and rose again', ['that he was a Roman emperor', 'that he founded Rome', 'that he wrote the Vedas'], 'This belief is at the heart of Christianity.'],
      ['What are the Gospels?', 'four books about the life and teaching of Jesus', ['Roman laws', 'Greek plays', 'maps of Judea'], 'They are part of the New Testament.'],
      ['Which apostle traveled thousands of miles and wrote letters to early Christians?', 'Paul', ['Augustus', 'Constantine', 'Moses'], 'He started communities around the Mediterranean.'],
      ['Which emperor allowed Christians to worship freely in AD 313?', 'Constantine', ['Augustus', 'Nero', 'Justinian'], 'Before that, Christians were often mistreated.'],
      ['What helped the Christian message travel?', 'Roman roads and the shared Greek language', ['airplanes', 'printed books', 'the telephone'], 'The empire tied many lands together.'],
      ['What stories did Jesus tell to teach?', 'parables', ['myths of Zeus', 'sagas', 'fables of Aesop'], 'Like the Good Samaritan.']
    ],
    tf: [
      ['People at the time of Jesus wrote their dates in AD.', false, 'The AD count was worked out about 500 years later.'],
      ['Christianity became the official religion of the Roman Empire in AD 380.', true, 'Under the emperor Theodosius.'],
      ['Jesus was Jewish.', true, 'He was a Jewish teacher from Nazareth.'],
      ['The New Testament is part of the Christian Bible.', true, 'With the Gospels and other early writings.'],
      ['Christians were always welcome in the early Roman Empire.', false, 'For almost 300 years they were often mistreated.']
    ],
    c1: function (R, ctx) { return mapQ(R, ctx, [['jerusalem', 'Jerusalem'], ['rome', 'Rome'], ['athens', 'Athens'], ['constantinople', 'Constantinople'], ['alexandria', 'Alexandria']], 'med', 'city'); },
    c2: function (R, ctx) { return R.coin() ? orderEv(R, ctx, XN) : firstQ(R, ctx, XN, R.coin()); },
    c3: function (R, ctx) { return betweenQ(R, ctx, XN.concat([[-27, 'Augustus becomes emperor']])); }
  });

  // ================================================================ Unit 6: The Middle Ages Around the World
  var BYZ = [[395, 'The empire is divided for good'], [410, 'The Visigoths capture Rome'], [476, 'The last western emperor is removed'], [537, 'Hagia Sophia is finished'], [1453, 'Constantinople falls']];
  T('histstory.rome-falls', {
    hint: 'The Western Roman Empire ended in AD 476; the eastern half, the Byzantine Empire, lasted until AD 1453.',
    fact: [
      ['When did the Western Roman Empire end?', 'AD 476', ['44 BC', 'AD 1453', '753 BC'], 'The last western emperor, a boy, was removed.'],
      ['What was the capital of the Byzantine Empire?', 'Constantinople', ['Rome', 'Athens', 'Paris'], 'Built by Constantine where Europe meets Asia.'],
      ['How long did the Byzantine Empire last after the West fell?', 'almost 1,000 years', ['about 10 years', 'about 100 years', 'it fell the same year'], 'Until AD 1453.'],
      ['Which emperor collected all the Roman laws into one great book?', 'Justinian', ['Augustus', 'Charlemagne', 'Nero'], 'Many countries\' laws still build on it.'],
      ['What is the Hagia Sophia?', 'a great church with a huge dome in Constantinople', ['a Roman road', 'a Viking ship', 'a castle in England'], 'Its name means "Holy Wisdom."'],
      ['What are mosaics?', 'pictures made from tiny pieces of colored glass and stone', ['paintings on canvas', 'stone statues', 'maps'], 'Byzantine artists made glittering ones.'],
      ['Who captured Rome in AD 410?', 'the Visigoths', ['the Vikings', 'the Persians', 'the Mongols'], 'A Germanic people.']
    ],
    tf: [
      ['All of the Roman Empire fell in AD 476.', false, 'Only the western half did.'],
      ['The Byzantines called themselves Romans.', true, 'They saw themselves as the Roman Empire.'],
      ['Constantinople stood where Europe meets Asia.', true, 'On the Bosporus strait.'],
      ['Justinian built the Hagia Sophia.', true, 'It was finished in AD 537.'],
      ['The Byzantine Empire ended in AD 476.', false, 'It lasted until AD 1453.']
    ],
    c1: function (R, ctx) { return mapQ(R, ctx, [['rome', 'Rome'], ['constantinople', 'Constantinople'], ['carthage', 'Carthage'], ['alexandria', 'Alexandria'], ['athens', 'Athens']], 'med', 'city'); },
    c2: function (R, ctx) { return R.coin() ? orderEv(R, ctx, BYZ) : firstQ(R, ctx, BYZ, R.coin()); },
    c3: function (R, ctx) { return R.coin() ? betweenQ(R, ctx, BYZ.concat([[-27, 'Augustus becomes the first emperor'], [800, 'Charlemagne is crowned emperor']])) : orderEv(R, ctx, BYZ.concat([[313, 'Constantine allows Christian worship'], [622, 'The Hijra']])); }
  });

  var ISL = [[610, 'Muhammad receives his first message, Muslims believe'], [622, 'The Hijra to Medina'], [632, 'Muhammad dies'], [830, 'The House of Wisdom flourishes in Baghdad'], [1011, 'Ibn al-Haytham studies light']];
  T('histstory.rise-of-islam', {
    hint: 'Muslims believe God sent messages to Muhammad, collected in the Quran. The Hijra (622) begins the Islamic calendar. Baghdad and Córdoba were centers of learning.',
    fact: [
      ['In which city was Muhammad born?', 'Mecca', ['Baghdad', 'Rome', 'Jerusalem'], 'A trading city in Arabia.'],
      ['What is the holy book of Islam?', 'the Quran', ['the Torah', 'the Vedas', 'the Analects'], 'Muslims believe it holds God\'s messages to Muhammad.'],
      ['What was the Hijra?', 'Muhammad\'s move from Mecca to Medina in AD 622', ['a pyramid', 'a Viking voyage', 'a Roman law'], 'It is the first year of the Islamic calendar.'],
      ['Which of these is one of the Five Pillars of Islam?', 'praying five times a day', ['building a castle', 'sailing to India', 'carving oracle bones'], 'Also faith, giving, fasting and pilgrimage.'],
      ['What was the House of Wisdom?', 'a center of learning in Baghdad', ['a palace in Rome', 'a temple in Egypt', 'a ship'], 'Scholars translated and wrote books there.'],
      ['Which word comes from the title of al-Khwarizmi\'s book?', 'algebra', ['geometry', 'calendar', 'alphabet'], 'His book was about solving equations.'],
      ['Where did our numerals 0 to 9 first come from?', 'India, by way of the Arab world', ['Rome', 'Egypt', 'England'], 'We call them Hindu-Arabic numerals.']
    ],
    tf: [
      ['Muslims fast during the month of Ramadan.', true, 'It is one of the Five Pillars.'],
      ['Roman numerals had a zero.', false, 'Romans had no zero.'],
      ['Ibn al-Haytham did experiments on light and seeing.', true, 'In the early 1000s.'],
      ['Within 100 years of Muhammad\'s death, Muslim rulers governed lands from Spain to India.', true, 'Islam spread quickly.'],
      ['Scholars in Baghdad only burned old books.', false, 'They translated and kept Greek, Persian and Indian books.']
    ],
    sort: [['Which of the Five Pillars is this? {x}', [['declaring that there is one God and Muhammad is his prophet', 'faith'], ['praying five times a day', 'prayer'], ['giving to the poor', 'giving'], ['not eating from dawn to sunset in Ramadan', 'fasting'], ['the journey to Mecca', 'pilgrimage']], ['faith', 'prayer', 'giving', 'fasting', 'pilgrimage'], 'The Five Pillars are faith, prayer, giving, fasting and pilgrimage.']],
    c1: function (R, ctx) { return mapQ(R, ctx, [['mecca', 'Mecca'], ['medina', 'Medina'], ['baghdad', 'Baghdad'], ['cordoba', 'Córdoba'], ['cairo', 'Cairo'], ['jerusalem', 'Jerusalem']], 'mideast', 'city'); },
    c2: function (R, ctx) { return R.coin() ? orderEv(R, ctx, ISL) : firstQ(R, ctx, ISL, R.coin()); },
    c3: function (R, ctx) { return betweenQ(R, ctx, ISL); }
  });

  var MA = [[800, 'Charlemagne is crowned emperor'], [1066, 'The Normans conquer England'], [1215, 'Magna Carta is sealed'], [1347, 'The Black Death begins']];
  var ROLES = [['gave land to lords and ruled the kingdom', 'the king'], ['held land from the king and built castles', 'a lord'], ['fought on horseback for a lord', 'a knight'], ['farmed the land and gave a share of the crops', 'a peasant'], ['prayed and copied books in a monastery', 'a monk']];
  T('histstory.castles-and-knights', {
    hint: 'Feudalism: kings gave land to lords, lords to knights, and peasants farmed. Monks copied books by hand. Most people were peasants.',
    fact: [
      ['Who was crowned emperor in Rome on Christmas Day, AD 800?', 'Charlemagne', ['Augustus', 'Justinian', 'King John'], 'He encouraged schools in monasteries.'],
      ['About when were the Middle Ages?', 'about AD 500 to 1500', ['about 3000 to 2000 BC', 'about 1800 to 1900', 'about 50 BC to AD 50'], 'Between ancient times and modern times.'],
      ['Who were most people in the Middle Ages?', 'peasants who farmed', ['knights', 'kings and queens', 'monks'], 'About nine out of ten people.'],
      ['What was chivalry?', 'the code knights were expected to follow', ['a kind of castle', 'a sickness', 'a coin'], 'To be brave and loyal, and to protect the weak.'],
      ['Why were monks important for books?', 'they copied old books by hand so they were not lost', ['they printed millions of books', 'they burned old books', 'they wrote only on bones'], 'A Bible could take years to copy.'],
      ['What did the Magna Carta say?', 'even the king had to obey the law', ['knights could not ride horses', 'castles must have moats', 'everyone must be a monk'], 'King John agreed to it in 1215.'],
      ['About how many people in Europe did the Black Death kill?', 'about one in three', ['about one in a thousand', 'nobody', 'everyone'], 'It spread from 1347.']
    ],
    tf: [
      ['Most people in the Middle Ages lived in castles.', false, 'Most were peasants living in villages.'],
      ['Knights trained as pages and squires.', true, 'From boyhood.'],
      ['The Middle Ages come between ancient times and modern times.', true, 'That is why they are "middle."'],
      ['Magna Carta was agreed to in 1215.', true, 'By King John of England.'],
      ['Charlemagne could not read at all.', false, 'He could read, but found writing hard.']
    ],
    sort: [['In feudal times, who {x}?', ROLES, ROLES.map(function (r) { return r[1]; }), 'Each person had a place: king, lord, knight, peasant, and the monks who prayed.']],
    c1: function (R, ctx) { var r = R.pick(ROLES); return { q: 'In a medieval kingdom, who ' + r[0] + '?', a: mcOf(r[1], R.sample(ROLES.filter(function (x) { return x !== r; }).map(function (x) { return x[1]; }), nWrong(ctx))), steps: [cap(r[1]) + ' ' + r[0] + '.'] }; },
    c2: function (R, ctx) { return R.coin() ? orderEv(R, ctx, MA) : yearOfQ(R, ctx, MA); },
    c3: function (R, ctx) { return betweenQ(R, ctx, MA); }
  });

  var VIK = [[793, 'Vikings raid Lindisfarne'], [874, 'Vikings settle Iceland'], [930, 'The Althing first meets in Iceland'], [1000, 'Leif Erikson reaches North America'], [1492, 'Columbus crosses the Atlantic']];
  T('histstory.vikings', {
    hint: 'Vikings came from Scandinavia in longships. Many were farmers, traders and settlers. Leif Erikson reached North America about AD 1000.',
    fact: [
      ['Where did the Vikings come from?', 'Scandinavia: Norway, Denmark and Sweden', ['Italy', 'Egypt', 'China'], 'They sailed out in longships.'],
      ['What were Viking ships called?', 'longships', ['galleons', 'junks', 'triremes'], 'Fast and shallow, for oceans and rivers.'],
      ['Who reached North America about AD 1000?', 'Leif Erikson', ['Columbus', 'Magellan', 'Marco Polo'], 'The Vikings called it Vinland.'],
      ['Where was a Viking camp found in North America?', 'L\'Anse aux Meadows in Newfoundland, Canada', ['in Florida', 'in Mexico', 'in Brazil'], 'Found in 1960.'],
      ['What were Viking sagas?', 'long stories', ['ships', 'helmets', 'coins'], 'Iceland kept many of them.'],
      ['Which island did Vikings settle about AD 874?', 'Iceland', ['Australia', 'Hawaii', 'Japan'], 'Its parliament, the Althing, met from AD 930.'],
      ['Which city did Vikings found in Ireland?', 'Dublin', ['Paris', 'Rome', 'Cairo'], 'Vikings settled in Britain, Ireland and France.']
    ],
    tf: [
      ['Viking helmets had horns.', false, 'No horned Viking helmet has been found; the horns come from 1870s costumes.'],
      ['Many Vikings were farmers and traders.', true, 'Raiders were only some of them.'],
      ['Vikings rowed east along rivers to trade with Constantinople.', true, 'And with Baghdad.'],
      ['Leif Erikson reached North America after Columbus.', false, 'About 490 years before.'],
      ['Longships could row up rivers.', true, 'They were shallow.']
    ],
    c1: function (R, ctx) { return mapQ(R, ctx, [['scandinavia', 'Scandinavia'], ['iceland', 'Iceland'], ['vinland', "L'Anse aux Meadows"], ['london', 'London'], ['constantinople', 'Constantinople']], 'world'); },
    c2: function (R, ctx) { return R.coin() ? orderEv(R, ctx, VIK) : firstQ(R, ctx, VIK, R.coin()); },
    c3: function (R, ctx) { return betweenQ(R, ctx, VIK); }
  });

  var INV = [['woodblock printing', 'China'], ['the magnetic compass', 'China'], ['paper money', 'China'], ['gunpowder', 'China'], ['paper', 'China'], ['the samurai', 'Japan'], ['the shogun', 'Japan'], ['The Tale of Genji', 'Japan'], ['the tea ceremony with samurai poets', 'Japan']];
  T('histstory.china-and-japan', {
    hint: 'Tang and Song China: printing, gunpowder, the compass and paper money. Japan: an emperor, then shoguns and samurai from 1192.',
    fact: [
      ['What is the oldest printed book with a date that we know of?', 'the Diamond Sutra, printed in AD 868', ['the Gutenberg Bible', 'the Magna Carta', 'the Quran'], 'It was printed from carved wooden blocks.'],
      ['Which of these did China invent?', 'the magnetic compass', ['the telephone', 'the steam engine', 'the airplane'], 'Also woodblock printing, gunpowder and paper money.'],
      ['Who held real power in Japan from 1192?', 'the shogun', ['the pope', 'the pharaoh', 'the Senate'], 'The emperor reigned, but shoguns ruled.'],
      ['What were samurai?', 'warriors who served the great lords of Japan', ['Chinese farmers', 'Viking sailors', 'Roman senators'], 'They followed a code of loyalty and self-control.'],
      ['Who wrote The Tale of Genji, often called the first novel?', 'Murasaki Shikibu', ['Marco Polo', 'Confucius', 'Leif Erikson'], 'A lady of the Japanese court, about AD 1000.'],
      ['Which Italian merchant stayed in China about 17 years?', 'Marco Polo', ['Columbus', 'Magellan', 'Galileo'], 'He set out in 1271.'],
      ['What was gunpowder first used for?', 'fireworks', ['cooking', 'farming', 'writing'], 'Later it was used in weapons.']
    ],
    tf: [
      ['Printing, paper and the compass were invented in Europe.', false, 'They came from China first.'],
      ['The Tang and Song dynasties were times of many inventions in China.', true, 'China was one of the richest lands on Earth.'],
      ['In Japan the emperor reigned from Kyoto.', true, 'While shoguns held real power.'],
      ['Many samurai also studied poetry and calligraphy.', true, 'Not only fighting.'],
      ['Marco Polo was amazed by paper money in China.', true, 'Europe did not have it.']
    ],
    sort: [['Does {x} belong to the story of medieval China or Japan?', INV, ['China', 'Japan'], 'China: inventions. Japan: emperor, shoguns, samurai and the court.']],
    c1: function (R, ctx) { return mapQ(R, ctx, [['xian', "Chang'an (Xi'an)"], ['beijing', 'Beijing'], ['kyoto', 'Kyoto'], ['tokyo', 'Tokyo'], ['delhi', 'Delhi']], 'asia', 'city'); },
    c2: function (R, ctx) { return R.coin() ? firstQ(R, ctx, [[868, 'The Diamond Sutra is printed'], [1000, 'The Tale of Genji is written'], [1192, 'The first shogun takes power'], [1271, 'Marco Polo sets out for China'], [1455, 'Gutenberg prints his Bible']], R.coin()) : betweenQ(R, ctx, [[868, 'The Diamond Sutra is printed'], [1455, 'Gutenberg prints his Bible'], [1271, 'Marco Polo sets out for China'], [1192, 'The first shogun takes power']]); }
  });

  var AFR = [['Aksum', 'traded across the Red Sea and became Christian in the 300s'], ['Ghana', 'grew rich trading gold for salt in West Africa'], ['Mali', 'was ruled by Mansa Musa'], ['Great Zimbabwe', 'raised huge stone walls without mortar'], ['Timbuktu', 'was a city of scholars and libraries in Mali']];
  T('histstory.african-kingdoms', {
    hint: 'Aksum (east), Ghana and Mali (west, gold for salt), Great Zimbabwe (south). Mansa Musa of Mali traveled to Mecca in 1324.',
    fact: [
      ['Who traveled to Mecca in 1324 with so much gold that its price fell in Cairo?', 'Mansa Musa of Mali', ['Hannibal', 'Charlemagne', 'Ashoka'], 'He is called one of the richest people who ever lived.'],
      ['What did West African traders get in exchange for gold?', 'salt', ['silk', 'potatoes', 'iron ships'], 'Salt was scarce in the south and needed to stay healthy and keep food.'],
      ['Which city in Mali was famous for scholars and libraries?', 'Timbuktu', ['Carthage', 'Athens', 'Kyoto'], 'Families there still keep old manuscripts.'],
      ['What is special about the walls of Great Zimbabwe?', 'they are huge stone walls built without mortar', ['they are made of gold', 'they are made of ice', 'they were built by Romans'], 'They stand in southern Africa.'],
      ['Which kingdom in today\'s Ethiopia and Eritrea became Christian in the 300s?', 'Aksum', ['Mali', 'Ghana', 'Great Zimbabwe'], 'It traded across the Red Sea.'],
      ['How did goods cross the Sahara?', 'by camel caravans', ['by train', 'by riverboat', 'by airplane'], 'Camels can go a long time without water.']
    ],
    tf: [
      ['Africa had no great kingdoms before Europeans arrived.', false, 'Aksum, Ghana, Mali, Great Zimbabwe and many more were rich and powerful.'],
      ['The Sahara had great salt mines.', true, 'Slabs of salt went south by camel.'],
      ['Mansa Musa ruled Mali.', true, 'In the 1300s.'],
      ['Sundiata founded the Mali Empire.', true, 'About 1235.'],
      ['Salt was cheap everywhere in West Africa.', false, 'In the south it was scarce, so it was traded for gold.']
    ],
    sort: [['Which kingdom or city {x}?', AFR.map(function (a) { return [a[1], a[0]]; }), AFR.map(function (a) { return a[0]; }), 'Each kingdom had its own story.']],
    c1: function (R, ctx) { return mapQ(R, ctx, [['aksum', 'Aksum'], ['timbuktu', 'Timbuktu'], ['zimbabwe', 'Great Zimbabwe'], ['cairo', 'Cairo'], ['meroe', 'Meroë']], 'africa'); },
    c2: function (R, ctx) { return firstQ(R, ctx, [[340, 'Aksum becomes Christian'], [1235, 'Sundiata founds Mali'], [1324, 'Mansa Musa travels to Mecca'], [800, 'Charlemagne is crowned'], [1492, 'Columbus crosses the Atlantic']], R.coin()); }
  });

  var AMER = [['Tikal', 'Maya'], ['writing in glyphs and a symbol for zero', 'Maya'], ['great cities about AD 250 to 900', 'Maya'], ['Tenochtitlan, built on a lake', 'Aztecs'], ['chinampas, garden beds in the water', 'Aztecs'], ['central Mexico in the 1400s', 'Aztecs'], ['Cusco', 'Incas'], ['quipu, knotted strings for records', 'Incas'], ['about 25,000 miles of mountain roads', 'Incas'], ['Machu Picchu', 'Incas']];
  function maya(n) { var b = M.floor(n / 5), d = n % 5; return (b ? b + ' bar' + (b > 1 ? 's' : '') : '') + (b && d ? ' and ' : '') + (d ? d + ' dot' + (d > 1 ? 's' : '') : '') || 'a shell'; }
  T('histstory.maya-aztec-inca', {
    hint: 'Maya: Central America, glyphs, zero, about AD 250 to 900. Aztecs: Tenochtitlan in Mexico. Incas: the Andes, roads and quipu.',
    fact: [
      ['Where did the Incas build their empire?', 'in the Andes mountains of South America', ['in Egypt', 'in China', 'in Scandinavia'], 'Their capital was Cusco.'],
      ['Where did the Aztecs build Tenochtitlan?', 'on an island in a lake', ['on a mountaintop in Peru', 'in a desert', 'on the Nile'], 'They built causeways to the shore.'],
      ['What were quipu?', 'knotted strings the Incas used to keep records', ['Maya pyramids', 'Aztec gardens', 'Spanish ships'], 'Different knots meant different numbers.'],
      ['Which people wrote in glyphs and had a symbol for zero?', 'the Maya', ['the Incas', 'the Vikings', 'the Romans'], 'Scholars can now read most Maya writing.'],
      ['What killed far more people in the Americas than the fighting with the Spanish?', 'sicknesses such as smallpox', ['earthquakes', 'wild animals', 'cold winters'], 'People there had never met these diseases.'],
      ['Which food first came from the Americas?', 'potatoes', ['wheat', 'rice', 'apples'], 'Also corn, tomatoes and chocolate.'],
      ['Who led the Spanish soldiers who conquered the Aztecs?', 'Hernán Cortés', ['Christopher Columbus', 'Leif Erikson', 'Marco Polo'], 'Tenochtitlan fell in 1521.']
    ],
    tf: [
      ['The Maya, Aztecs and Incas all lived at the same time in the same place.', false, 'Different places, and the great Maya cities came centuries earlier.'],
      ['The Incas joined their empire with roads and rope bridges.', true, 'Runners carried messages along them.'],
      ['Chocolate comes from the cacao of the Americas.', true, 'The Maya and Aztecs drank it.'],
      ['Tenochtitlan was founded in 1325.', true, 'On an island in a lake.'],
      ['The Maya wrote a bar for 1 and a dot for 5.', false, 'A dot for 1 and a bar for 5.']
    ],
    sort: [['Which people are known for {x}?', AMER, ['Maya', 'Aztecs', 'Incas'], 'Maya: glyphs and Tikal. Aztecs: Tenochtitlan. Incas: Cusco, roads and quipu.']],
    c1: function (R, ctx) {
      var n = R.int(1, 19);
      if (R.coin()) return { q: 'The Maya wrote a dot for 1 and a bar for 5. How would they write ' + n + '?', a: mcOf(maya(n), uniq([maya(n + 1), maya(M.max(1, n - 1)), maya((n + 5) % 20 || 1), maya(n === 5 ? 1 : 5)]).filter(function (x) { return x !== maya(n); }).slice(0, nWrong(ctx))), steps: [n + ' = ' + (M.floor(n / 5) ? M.floor(n / 5) + (M.floor(n / 5) > 1 ? ' fives' : ' five') : '') + (M.floor(n / 5) && n % 5 ? ' and ' : '') + (n % 5 ? (n % 5) + (n % 5 > 1 ? ' ones' : ' one') : '') + '.', 'So: ' + maya(n) + '.'] };
      return { q: 'A Maya number has ' + maya(n) + '. What number is it? (A dot is 1, a bar is 5.)', a: num(n, ''), steps: ['Bars are 5 each, dots are 1 each.', 'Total: ' + n + '.'] };
    },
    c2: function (R, ctx) { return mapQ(R, ctx, [['tikal', 'Tikal'], ['tenochtitlan', 'Tenochtitlan'], ['cusco', 'Cusco'], ['machu', 'Machu Picchu']], 'americas', 'city'); }
  });

  // ================================================================ Unit 7: Renaissance and Exploration
  var REN = [[1436, 'The dome of Florence Cathedral is finished'], [1452, 'Leonardo da Vinci is born'], [1504, 'Michelangelo finishes his David'], [1508, 'Michelangelo begins the Sistine Chapel ceiling'], [1564, 'Shakespeare is born']];
  T('histstory.renaissance', {
    hint: 'Renaissance means rebirth. It began in Italian cities like Florence. Leonardo da Vinci and Michelangelo were its great artists.',
    fact: [
      ['What does "Renaissance" mean?', 'rebirth', ['middle age', 'revolution', 'empire'], 'A rebirth of interest in Greek and Roman learning and art.'],
      ['In which country did the Renaissance begin?', 'Italy', ['England', 'Japan', 'Mexico'], 'In cities such as Florence.'],
      ['Who painted the Mona Lisa?', 'Leonardo da Vinci', ['Michelangelo', 'Galileo', 'Gutenberg'], 'He also filled notebooks with studies of nature and machines.'],
      ['Who painted the ceiling of the Sistine Chapel?', 'Michelangelo', ['Leonardo da Vinci', 'Charlemagne', 'Columbus'], 'From 1508 to 1512.'],
      ['Which rich family of Florence paid artists and scholars?', 'the Medici', ['the Tudors', 'the Han', 'the Incas'], 'Their money helped the Renaissance grow.'],
      ['In perspective drawing, far-away things are drawn…', 'smaller', ['bigger', 'the same size', 'upside down'], 'Lines like road edges meet on the horizon.'],
      ['How did Leonardo write in his notebooks?', 'in mirror writing, from right to left', ['in cuneiform', 'in Chinese', 'he never wrote'], 'You need a mirror to read it easily.']
    ],
    tf: [
      ['Leonardo da Vinci was only a painter.', false, 'He was also an inventor, engineer and student of nature.'],
      ['Michelangelo carved the statue of David.', true, 'From a single block of marble.'],
      ['Renaissance scholars studied old Greek and Latin books.', true, 'That was part of the rebirth.'],
      ['The Renaissance began in Japan.', false, 'It began in Italy.'],
      ['Renaissance paintings used perspective to look deep, like windows.', true, 'Far things smaller, lines meeting on the horizon.']
    ],
    sort: [['Leonardo or Michelangelo? {x}', [['painted the Mona Lisa', 'Leonardo da Vinci'], ['painted The Last Supper', 'Leonardo da Vinci'], ['wrote notebooks in mirror writing', 'Leonardo da Vinci'], ['carved the statue of David', 'Michelangelo'], ['painted the Sistine Chapel ceiling', 'Michelangelo']], ['Leonardo da Vinci', 'Michelangelo'], 'Two great artists of the Renaissance.']],
    c1: function (R, ctx) { return R.coin() ? orderEv(R, ctx, REN) : firstQ(R, ctx, REN, R.coin()); },
    c2: function (R, ctx) { var b = R.int(1440, 1480), d = b + R.int(40, 80); return { q: 'An artist was born in ' + b + ' and died in ' + d + ', after his birthday that year. How old was he?', a: num(d - b, 'years'), steps: [d + ' − ' + b + ' = ' + (d - b) + '.'] }; }
  });

  var PRN = [[868, 'The Diamond Sutra is printed in China'], [1455, 'Gutenberg prints his Bible'], [1517, 'Luther writes the 95 Theses'], [1545, 'The Council of Trent begins']];
  T('histstory.printing-press', {
    hint: 'Gutenberg\'s movable metal type press (about 1450) made books cheaper. Luther\'s 95 Theses (1517) began the Reformation: Catholics and Protestants.',
    fact: [
      ['Who built a printing press with movable metal type about 1450?', 'Johannes Gutenberg', ['Martin Luther', 'Leonardo da Vinci', 'Marco Polo'], 'In the German city of Mainz.'],
      ['How were books made in Europe before printing?', 'copied by hand', ['typed on computers', 'carved on stone only', 'printed in factories'], 'A Bible could take a scribe a year or more.'],
      ['What did printing do to books?', 'made them cheaper and more common', ['made them rarer', 'made them all the same story', 'made them heavier'], 'More people learned to read.'],
      ['What did Martin Luther write in 1517?', 'the 95 Theses', ['the Magna Carta', 'the Declaration of Independence', 'the Quran'], 'They called for changes in the Church.'],
      ['What were Christians who followed reformers like Luther and Calvin called?', 'Protestants', ['Catholics', 'Byzantines', 'Stoics'], 'Those who stayed with the pope are Catholics.'],
      ['Why did Luther\'s ideas spread so fast?', 'printers copied them, and within weeks they were read across Germany', ['he sent them by telephone', 'he spoke on the radio', 'monks copied them by hand for years'], 'The printing press made the difference.']
    ],
    tf: [
      ['Gutenberg invented the very first printing of any kind.', false, 'Woodblock printing began in China, and movable type was used in China and Korea first.'],
      ['The Catholic Church made reforms at the Council of Trent.', true, 'It began in 1545.'],
      ['Within 50 years of Gutenberg, millions of books had been printed.', true, 'Presses opened in hundreds of towns.'],
      ['Printing letters must be set backward to print the right way.', true, 'Like a rubber stamp.'],
      ['Gutenberg printed about 180 copies of his Bible.', true, 'Around 1455.'],
      ['Martin Luther lived in the town of Wittenberg.', true, 'He taught there.'],
      ['Before printing, a Bible could take a scribe a year or more to copy.', true, 'Every letter by hand.']
    ],
    sort: [['Is this about the printing press or the Reformation? {x}', [['movable metal type', 'the printing press'], ['Gutenberg in Mainz', 'the printing press'], ['books becoming cheaper', 'the printing press'], ['the 95 Theses', 'the Reformation'], ['Catholics and Protestants', 'the Reformation'], ['the Council of Trent', 'the Reformation']], ['the printing press', 'the Reformation'], 'The press spread ideas fast, and that helped the Reformation spread.']],
    c1: function (R, ctx) { var y = R.int(2, 9), b = R.int(2, 12) * 10; return { q: 'A scribe copies 1 book a year. A printing press makes ' + b + ' books a year. How many books does the press make in ' + y + ' years?', a: num(b * y, 'books'), steps: [b + ' × ' + y + ' = ' + (b * y) + '.', 'The scribe would make only ' + y + '.'] }; },
    c2: function (R, ctx) { return R.coin() ? orderEv(R, ctx, PRN) : firstQ(R, ctx, PRN, R.coin()); },
    c3: function (R, ctx) { return betweenQ(R, ctx, PRN); }
  });

  var EXP = [[1405, 'Zheng He\'s first voyage'], [1488, 'Dias sails around the tip of Africa'], [1492, 'Columbus crosses the Atlantic'], [1498, 'Vasco da Gama reaches India'], [1519, 'Magellan\'s fleet sets out'], [1522, 'Magellan\'s ship returns after sailing around the world']];
  var CX = [['corn', 'from the Americas'], ['potatoes', 'from the Americas'], ['tomatoes', 'from the Americas'], ['chocolate', 'from the Americas'], ['peanuts', 'from the Americas'], ['turkeys', 'from the Americas'], ['horses', 'to the Americas'], ['cattle', 'to the Americas'], ['wheat', 'to the Americas'], ['sugarcane', 'to the Americas'], ['pigs', 'to the Americas'], ['smallpox', 'to the Americas']];
  T('histstory.age-of-exploration', {
    hint: 'Zheng He (1405 to 1433), Dias (1488), Columbus (1492), da Gama (1498), Magellan\'s crew around the world (1519 to 1522). The Columbian Exchange carried plants, animals and diseases both ways.',
    fact: [
      ['Which Chinese admiral led seven great voyages across the Indian Ocean?', 'Zheng He', ['Marco Polo', 'Confucius', 'Kublai Khan'], 'Between 1405 and 1433.'],
      ['What were European sailors searching for?', 'sea routes to the spices and silks of Asia', ['the North Pole', 'dinosaur bones', 'new planets'], 'Spices were worth a fortune in Europe.'],
      ['Who reached India by sailing around Africa in 1498?', 'Vasco da Gama', ['Columbus', 'Magellan', 'Zheng He'], 'He sailed from Portugal.'],
      ['Whose crew first sailed all the way around the world?', 'Ferdinand Magellan\'s', ['Columbus\'s', 'Leif Erikson\'s', 'Hannibal\'s'], 'Magellan died on the way; Elcano led the ship home.'],
      ['What is the Columbian Exchange?', 'plants, animals and diseases crossing the ocean both ways', ['a bank in Spain', 'a treaty', 'a ship'], 'It joined the two halves of the world.'],
      ['Where did Columbus land in 1492?', 'on islands in the Caribbean', ['in India', 'in China', 'in England'], 'He thought he had reached Asia.']
    ],
    tf: [
      ['Columbus proved the Earth was round.', false, 'Educated people already knew; he thought the Earth was smaller than it is.'],
      ['Magellan finished the voyage around the world himself.', false, 'He was killed in 1521; his crew finished in 1522.'],
      ['Potatoes and corn came from the Americas.', true, 'Part of the Columbian Exchange.'],
      ['Horses came to the Americas with Europeans.', true, 'Part of the Columbian Exchange.'],
      ['Zheng He sailed to the east coast of Africa.', true, 'With huge wooden ships.']
    ],
    sort: [['In the Columbian Exchange, did {x} go from the Americas or to the Americas?', CX, ['from the Americas', 'to the Americas'], 'Corn, potatoes, tomatoes and chocolate came from the Americas; horses, cattle, wheat and diseases went to them.']],
    c1: function (R, ctx) { return R.coin() ? orderEv(R, ctx, EXP) : firstQ(R, ctx, EXP, R.coin()); },
    c2: function (R, ctx) { return mapQ(R, ctx, [['lisbon', 'Lisbon'], ['sansalvador', 'San Salvador island'], ['calicut', 'Calicut, India'], ['nanjing', 'Nanjing'], ['seville', 'Seville']], 'world'); },
    c3: function (R, ctx) { return betweenQ(R, ctx, EXP); }
  });

  // ================================================================ Unit 8: Revolutions
  var SCI = [[1543, 'Copernicus says the Earth goes around the Sun'], [1608, 'The first telescopes are made in the Netherlands'], [1610, 'Galileo sees moons around Jupiter'], [1628, 'Harvey shows the blood circulates'], [1687, 'Newton explains gravity']];
  T('histstory.scientific-revolution', {
    hint: 'Copernicus (1543): the Earth goes around the Sun. Galileo (1610): moons of Jupiter. Newton (1687): gravity. Test ideas with experiments.',
    fact: [
      ['What did Copernicus say in 1543?', 'the Earth spins and travels around the Sun', ['the Sun goes around the Earth', 'the Earth is flat', 'the Moon is a star'], 'It was the opposite of what most people believed.'],
      ['What did Galileo see around Jupiter?', 'four moons', ['rings of gold', 'nothing at all', 'a second Sun'], 'They showed not everything circles the Earth.'],
      ['Who explained that gravity makes apples fall and keeps the Moon in orbit?', 'Isaac Newton', ['Galileo', 'Copernicus', 'Leonardo'], 'In 1687.'],
      ['How did scientists in the Scientific Revolution test ideas?', 'with careful observations, measurements and experiments', ['by voting', 'by guessing', 'by reading only old books'], 'And with mathematics.'],
      ['Where were the first telescopes made?', 'the Netherlands, in 1608', ['Italy, by Galileo, in 1543', 'China, in 868', 'Egypt'], 'Galileo built better ones.'],
      ['What did Galileo see on the Moon?', 'mountains', ['oceans of water', 'cities', 'trees'], 'The Moon was not a perfect smooth ball.']
    ],
    tf: [
      ['Galileo invented the telescope.', false, 'Dutch spectacle makers did, in 1608.'],
      ['Newton\'s laws still help engineers today.', true, 'Bridges and spacecraft use them.'],
      ['For more than 1,000 years most people thought the Earth was at the center.', true, 'It looks that way.'],
      ['Galileo was put on trial in 1633.', true, 'His ideas brought him into conflict with Church authorities.'],
      ['Heavy and light balls of the same size, dropped together, land at almost the same time.', true, 'Unless air slows one a lot.'],
      ['Copernicus was from Poland.', true, 'He published his book in 1543.'],
      ['Newton lived before Copernicus.', false, 'Copernicus came first (1543); Newton\'s great book was 1687.']
    ],
    sort: [['Who did this: {x}?', [['put the Sun at the center', 'Copernicus'], ['wrote a book in 1543 about the Earth going around the Sun', 'Copernicus'], ['saw moons around Jupiter', 'Galileo'], ['saw mountains on the Moon', 'Galileo'], ['explained gravity', 'Newton'], ['wrote laws of motion', 'Newton']], ['Copernicus', 'Galileo', 'Newton'], 'Three great scientists, one after another.']],
    c1: function (R, ctx) { return R.coin() ? orderEv(R, ctx, SCI) : firstQ(R, ctx, SCI, R.coin()); },
    c2: function (R, ctx) { return R.coin() ? betweenQ(R, ctx, SCI) : yearOfQ(R, ctx, SCI); }
  });

  var AMR = [[1765, 'The Stamp Act tax'], [1775, 'Fighting begins at Lexington and Concord'], [1776, 'The Declaration of Independence'], [1783, 'The Treaty of Paris ends the war'], [1787, 'The Constitution is written'], [1789, 'Washington becomes president']];
  T('histstory.american-revolution', {
    hint: 'July 4, 1776: the Declaration of Independence. The war lasted from 1775 to 1783. The Constitution was written in 1787; Washington became president in 1789.',
    fact: [
      ['Who wrote most of the Declaration of Independence?', 'Thomas Jefferson', ['George Washington', 'King George III', 'Benjamin Franklin alone'], 'It was approved on July 4, 1776.'],
      ['What did "no taxation without representation" mean?', 'no taxes without a vote in making them', ['no taxes ever', 'only the king pays taxes', 'no paintings without a frame'], 'Colonists had no votes in Parliament.'],
      ['Who led the American army?', 'George Washington', ['Thomas Jefferson', 'Napoleon', 'Lafayette alone'], 'He later became the first president.'],
      ['Which country helped the Americans win?', 'France', ['China', 'Egypt', 'Russia'], 'French soldiers and ships helped.'],
      ['When was the Constitution written?', '1787', ['1776', '1492', '1865'], 'Washington became president in 1789.'],
      ['What were colonists who stayed loyal to the king called?', 'Loyalists', ['Patriots', 'Federalists', 'Senators'], 'Patriots wanted independence.']
    ],
    tf: [
      ['The war ended in 1776.', false, 'The Declaration was in 1776; the war ended in 1783.'],
      ['The Declaration says "all men are created equal."', true, 'One of its most famous lines.'],
      ['Every colonist wanted independence.', false, 'Patriots did; Loyalists did not; many hoped to stay out of it.'],
      ['There were thirteen colonies.', true, 'They became the first thirteen states.'],
      ['George Washington was the first president.', true, 'From 1789.']
    ],
    c1: function (R, ctx) { return R.coin() ? orderEv(R, ctx, AMR) : yearOfQ(R, ctx, AMR); },
    c2: function (R, ctx) { return R.coin() ? firstQ(R, ctx, AMR, R.coin()) : betweenQ(R, ctx, AMR); },
    c3: function (R, ctx) { return betweenQ(R, ctx, AMR.concat([[1492, 'Columbus crosses the Atlantic'], [1607, 'Jamestown is founded']])); }
  });

  var FR = [[1789, 'The storming of the Bastille'], [1792, 'France becomes a republic'], [1799, 'Napoleon takes power'], [1804, 'Napoleon crowns himself emperor'], [1812, 'Napoleon marches to Moscow'], [1815, 'The Battle of Waterloo']];
  T('histstory.french-revolution', {
    hint: 'The French Revolution began in 1789 with the Bastille. "Liberty, equality, fraternity." Napoleon became emperor in 1804 and was defeated at Waterloo in 1815.',
    fact: [
      ['What happened in Paris on July 14, 1789?', 'crowds stormed the Bastille', ['Napoleon was crowned', 'the king was crowned', 'the Eiffel Tower was built'], 'It is now France\'s national holiday.'],
      ['What was the motto of the French Revolution?', '"Liberty, equality, fraternity"', ['"No taxation without representation"', '"All roads lead to Rome"', '"Veni, vidi, vici"'], 'Fraternity means brotherhood.'],
      ['What was the Reign of Terror?', 'a time when thousands accused of being enemies of the revolution were put to death', ['a famous play', 'a castle', 'a storm'], 'The revolution brought fear as well as rights.'],
      ['Who made himself emperor of France in 1804?', 'Napoleon Bonaparte', ['Louis XVI', 'Charlemagne', 'Lafayette'], 'He was a young general.'],
      ['Where was Napoleon finally defeated in 1815?', 'Waterloo', ['Marathon', 'Moscow', 'Paris'], 'In today\'s Belgium.'],
      ['What did the Napoleonic Code spread across Europe?', 'ideas like equality before the law', ['the Latin language', 'the printing press', 'the Olympic Games'], 'It was Napoleon\'s law code.']
    ],
    tf: [
      ['Napoleon was very short.', false, 'He was about average height for his time.'],
      ['France became a republic in 1792.', true, 'After ending the king\'s rule.'],
      ['The French Declaration of the Rights of Man came after the American Declaration of Independence.', true, '1789, thirteen years after 1776.'],
      ['Lafayette fought in the American war.', true, 'He was a French officer.'],
      ['Napoleon won at Waterloo.', false, 'He was defeated there.']
    ],
    c1: function (R, ctx) { return R.coin() ? orderEv(R, ctx, FR) : firstQ(R, ctx, FR, R.coin()); },
    c2: function (R, ctx) { return R.coin() ? mapQ(R, ctx, [['paris', 'Paris'], ['london', 'London'], ['berlin', 'Berlin'], ['moscow', 'Moscow']], 'europe', 'city') : betweenQ(R, ctx, FR); }
  });

  // ================================================================ Unit 9: Inventions and the Modern Age
  var IND = [[1712, 'Newcomen\'s steam engine pumps a mine'], [1769, 'James Watt patents his steam engine'], [1830, 'The Liverpool and Manchester Railway opens'], [1833, 'The Factory Act limits child labor']];
  T('histstory.industrial-revolution', {
    hint: 'The Industrial Revolution began in Britain in the 1700s: water and steam power, factories, railways and cities.',
    fact: [
      ['Where did the Industrial Revolution begin?', 'Britain', ['China', 'Egypt', 'Peru'], 'In the 1700s.'],
      ['What did steam engines burn to boil water?', 'coal', ['salt', 'sand', 'gold'], 'The steam pushed a piston.'],
      ['Who made a much better steam engine in the 1770s?', 'James Watt', ['Thomas Newcomen', 'Gutenberg', 'Napoleon'], 'It used much less coal.'],
      ['What did the Factory Act of 1833 do?', 'limited how many hours children could work', ['built the first railway', 'ended slavery in America', 'invented the light bulb'], 'Later laws required school.'],
      ['Where did many people move during the Industrial Revolution?', 'from farms to cities', ['from cities to farms', 'to the Moon', 'to castles'], 'To work in factories.'],
      ['Which railway between two big cities opened in 1830?', 'the Liverpool and Manchester Railway', ['the Silk Road', 'the Appian Way', 'the Underground Railroad'], 'With steam locomotives like the Rocket.']
    ],
    tf: [
      ['James Watt invented the very first steam engine.', false, 'Newcomen\'s engines came first; Watt made a better one.'],
      ['Early factory work was often hard and dangerous.', true, 'Long hours, even for children.'],
      ['Before factories, much cloth was spun and woven at home.', true, 'By hand.'],
      ['Factories made goods more expensive.', false, 'They made many goods cheaper.'],
      ['Railways carried goods and people faster than ever.', true, 'Steam changed travel.']
    ],
    sort: [['Before or after the Industrial Revolution? {x}', [['cloth spun by hand at home', 'before'], ['most people living on farms', 'before'], ['travel only by horse, foot or sail', 'before'], ['big mills full of machines', 'after'], ['steam trains between cities', 'after'], ['many people working in factories', 'after']], ['before', 'after'], 'Machines and steam changed how people worked and lived.']],
    c1: function (R, ctx) { var a = R.int(2, 9) * 10, h = R.int(1, 5); return { q: 'A machine run by one worker makes ' + a + ' spools of thread a day; a hand spinner makes ' + h + '. How many more spools does the machine make each day?', a: num(a - h, 'spools'), steps: [a + ' − ' + h + ' = ' + (a - h) + '.'] }; },
    c2: function (R, ctx) { return R.coin() ? orderEv(R, ctx, IND) : betweenQ(R, ctx, IND); }
  });

  var SLV = [[1789, 'Olaudah Equiano publishes his life story'], [1807, 'Britain bans the slave trade'], [1834, 'Slavery ends in most of the British Empire'], [1863, 'The Emancipation Proclamation'], [1865, 'The 13th Amendment ends U.S. slavery'], [1888, 'Brazil ends slavery']];
  var HEROES = [['wrote the story of his life after being kidnapped in West Africa and enslaved', 'Olaudah Equiano'], ['spoke against the slave trade in Britain\'s Parliament year after year', 'William Wilberforce'], ['escaped slavery and became a great speaker and writer for freedom', 'Frederick Douglass'], ['escaped, then went back again and again to lead others to freedom', 'Harriet Tubman'], ['issued the Emancipation Proclamation in 1863', 'Abraham Lincoln']];
  T('histstory.ending-slavery', {
    hint: 'Britain banned its slave trade in 1807 and ended slavery in most of its empire from 1834; the U.S. ended slavery in 1865; Brazil in 1888.',
    fact: [
      ['What was the movement to end slavery called?', 'abolition', ['the Renaissance', 'the Reformation', 'feudalism'], 'It began in the late 1700s.'],
      ['About how many Africans were carried across the Atlantic and enslaved in the Americas?', 'about 12 million', ['about 12 thousand', 'about 100', 'about 1 billion'], 'From the 1500s to the 1800s.'],
      ['When did Britain ban its slave trade?', '1807', ['1776', '1865', '1492'], 'After years of campaigning.'],
      ['Which amendment ended slavery in the whole United States in 1865?', 'the Thirteenth', ['the First', 'the Nineteenth', 'the Second'], 'After the Civil War.'],
      ['What was the Underground Railroad?', 'secret routes and helpers leading people from slavery to freedom', ['a subway in New York', 'a train under the ocean', 'a mine railway'], 'Harriet Tubman led many along it.'],
      ['Which star did people escaping slavery follow north?', 'the North Star', ['the Sun', 'the Moon', 'Venus'], 'The Big Dipper points to it.']
    ],
    tf: [
      ['Slavery ended everywhere at the same time.', false, 'Each country ended it in its own year.'],
      ['Frederick Douglass escaped slavery.', true, 'And became a great speaker and writer.'],
      ['Brazil was the last country in the Americas to end slavery.', true, 'In 1888.'],
      ['Harriet Tubman led people to freedom only once.', false, 'She went back again and again.'],
      ['Equiano\'s book helped turn many people in Britain against the slave trade.', true, 'It was published in 1789.']
    ],
    sort: [['Who {x}?', HEROES, HEROES.map(function (h) { return h[1]; }), 'Many people fought to end slavery.']],
    c1: function (R, ctx) { var h = R.pick(HEROES); return { q: 'Who ' + h[0] + '?', a: mcOf(h[1], R.sample(HEROES.filter(function (x) { return x !== h; }).map(function (x) { return x[1]; }), nWrong(ctx))), steps: [h[1] + ' ' + h[0] + '.'] }; },
    c2: function (R, ctx) { return R.coin() ? orderEv(R, ctx, SLV) : firstQ(R, ctx, SLV, R.coin()); },
    c3: function (R, ctx) { return betweenQ(R, ctx, SLV); }
  });

  var INVS = [[1844, 'the telegraph', 'Samuel Morse'], [1876, 'the telephone', 'Alexander Graham Bell'], [1879, 'a long-lasting electric light bulb', 'Thomas Edison'], [1886, 'the gasoline automobile', 'Karl Benz'], [1903, 'the first powered airplane flight', 'the Wright brothers']];
  T('histstory.age-of-invention', {
    hint: 'Telegraph (Morse, 1844), telephone (Bell, 1876), light bulb (Edison, 1879), automobile (Benz, 1886), airplane (the Wrights, 1903).',
    fact: [
      ['Where did the Wright brothers first fly, in 1903?', 'Kitty Hawk, North Carolina', ['Paris', 'London', 'Rome'], 'On December 17, 1903.'],
      ['How long was the Wrights\' very first flight?', '12 seconds', ['12 hours', '12 days', '12 minutes'], 'It covered 120 feet.'],
      ['What shop did the Wright brothers own?', 'a bicycle shop', ['a bakery', 'a bookshop', 'a car factory'], 'They used their skill with machines.'],
      ['Who discovered polonium and radium?', 'Marie Curie (with Pierre Curie)', ['Thomas Edison', 'Isaac Newton', 'Galileo'], 'She won two Nobel Prizes.'],
      ['What was special about Marie Curie\'s Nobel Prizes?', 'she was the first person to win two', ['she won one for painting', 'she refused them', 'she won ten'], 'Physics (1903) and chemistry (1911).'],
      ['Which car of 1908 made cars affordable for many families?', 'the Model T Ford', ['the Rocket', 'the Mayflower', 'Sputnik'], 'Built on an assembly line.']
    ],
    tf: [
      ['Edison invented the light bulb all alone, from nothing.', false, 'Others made lamps first; Edison\'s team made a long-lasting one and a power system.'],
      ['The telephone came before the airplane.', true, '1876 and 1903.'],
      ['Marie Curie was born in Poland.', true, 'She studied and worked in Paris.'],
      ['The Wright brothers flew four times on their first day.', true, 'The longest flight lasted 59 seconds.'],
      ['The telegraph came after the airplane.', false, 'The telegraph came in 1844, the airplane in 1903.']
    ],
    c1: function (R, ctx) { var it = R.pick(INVS); return R.coin() ? { q: 'Who is known for ' + it[1] + ' (' + it[0] + ')?', a: mcOf(it[2], R.sample(INVS.filter(function (x) { return x !== it; }).map(function (x) { return x[2]; }), nWrong(ctx))), steps: [it[2] + ': ' + it[1] + ', ' + it[0] + '.'] } : { q: 'What is ' + it[2] + ' known for?', a: mcOf(it[1], R.sample(INVS.filter(function (x) { return x !== it; }).map(function (x) { return x[1]; }), nWrong(ctx))), steps: [it[2] + ': ' + it[1] + ', ' + it[0] + '.'] }; },
    c2: function (R, ctx) { var ev = INVS.map(function (x) { return [x[0], cap(x[1]) + ' (' + x[2] + ')']; }); return R.coin() ? orderEv(R, ctx, ev) : firstQ(R, ctx, ev, R.coin()); },
    c3: function (R, ctx) { var f = R.int(10, 60) * 2, s = R.pick([2, 4, 5, 10]); return { q: 'A model airplane flies ' + (f * s) + ' feet in ' + s + ' seconds. How many feet does it go each second?', a: num(f, 'feet'), steps: [(f * s) + ' ÷ ' + s + ' = ' + f + '.'] }; }
  });

  var WW = [[1914, 'World War I begins'], [1917, 'The United States enters World War I'], [1918, 'The armistice ends World War I'], [1939, 'World War II begins'], [1941, 'Japan attacks Pearl Harbor'], [1944, 'D-Day'], [1945, 'World War II ends; the United Nations is founded']];
  T('histstory.world-wars', {
    hint: 'World War I: 1914 to 1918. World War II: 1939 to 1945. The United Nations was founded in 1945.',
    fact: [
      ['What happened at the eleventh hour of the eleventh day of the eleventh month of 1918?', 'the guns stopped at the end of World War I', ['World War II began', 'the Berlin Wall fell', 'the first airplane flew'], 'Many countries keep a moment of silence on November 11.'],
      ['When was World War I fought?', '1914 to 1918', ['1939 to 1945', '1861 to 1865', '1775 to 1783'], 'Mostly in Europe.'],
      ['When was World War II fought?', '1939 to 1945', ['1914 to 1918', '1776 to 1783', '1950 to 1953'], 'It was even bigger than World War I.'],
      ['What was D-Day?', 'June 6, 1944, when Allied soldiers landed in France', ['the day World War I began', 'the day the Moon was reached', 'a holiday in Rome'], 'It helped free Western Europe.'],
      ['What was the Holocaust?', 'the murder of about six million Jewish people and millions of others by the Nazis', ['a battle at sea', 'a peace treaty', 'a new invention'], 'We remember so that it never happens again.'],
      ['What did countries form in 1945 to try to keep the peace?', 'the United Nations', ['the Roman Senate', 'the Hanseatic League', 'the Olympic Games'], 'A place for nations to talk out disagreements.'],
      ['Why did the United States enter World War II in 1941?', 'Japan attacked Pearl Harbor', ['Germany invaded Mexico', 'Britain asked them to stop', 'to reach the Moon'], 'On December 7, 1941.']
    ],
    tf: [
      ['World War II came before World War I.', false, 'World War I came first.'],
      ['Many brave people risked their lives to hide those in danger during the Holocaust.', true, 'We honor them.'],
      ['Americans call November 11 Veterans Day.', true, 'Many countries call it Remembrance Day.'],
      ['Soldiers in World War I often fought from long lines of trenches.', true, 'For years, over small pieces of land.'],
      ['The United Nations was founded after World War I.', false, 'It was founded in 1945, after World War II.']
    ],
    c1: function (R, ctx) { return R.coin() ? orderEv(R, ctx, WW) : firstQ(R, ctx, WW, R.coin()); },
    c2: function (R, ctx) { return betweenQ(R, ctx, WW); }
  });

  var MOD = [[1945, 'The United Nations is founded'], [1957, 'Sputnik, the first satellite'], [1961, 'Yuri Gagarin, the first person in space'], [1969, 'People walk on the Moon'], [1989, 'The Berlin Wall opens'], [1991, 'The Soviet Union breaks up']];
  T('histstory.modern-world', {
    hint: 'The Cold War (about 1947 to 1991) between the United States and the Soviet Union; Sputnik 1957; the Moon 1969; the Berlin Wall opened 1989.',
    fact: [
      ['Who first walked on the Moon?', 'Neil Armstrong', ['Yuri Gagarin', 'Galileo', 'the Wright brothers'], 'On July 20, 1969, joined by Buzz Aldrin.'],
      ['What was the Cold War?', 'a long rivalry between the United States and the Soviet Union', ['a war fought in the snow', 'World War I', 'a war between Vikings'], 'They never fought each other directly.'],
      ['What was Sputnik?', 'the first satellite, launched by the Soviet Union in 1957', ['the first airplane', 'a Viking ship', 'a computer'], 'It started the space race.'],
      ['Who was the first person in space?', 'Yuri Gagarin', ['Neil Armstrong', 'Isaac Newton', 'Marie Curie'], 'In 1961.'],
      ['When was the Berlin Wall opened?', '1989', ['1945', '1961', '2001'], 'On November 9, 1989.'],
      ['Who created the World Wide Web?', 'Tim Berners-Lee', ['Thomas Edison', 'Alexander Graham Bell', 'Gutenberg'], 'From 1989 to 1991.'],
      ['Who led the civil rights movement in the United States with peaceful protest?', 'Dr. Martin Luther King Jr.', ['Napoleon', 'Julius Caesar', 'Hammurabi'], 'He worked to end unfair laws.']
    ],
    tf: [
      ['The United States and the Soviet Union fought big battles against each other in the Cold War.', false, 'They never fought each other directly.'],
      ['The Soviet Union broke up in 1991.', true, 'Into 15 countries.'],
      ['Germany was reunited in 1990.', true, 'The year after the Wall opened.'],
      ['The first Moon landing was watched by about 600 million people.', true, 'On television.'],
      ['Sputnik was launched by the United States.', false, 'By the Soviet Union.']
    ],
    c1: function (R, ctx) { return R.coin() ? orderEv(R, ctx, MOD) : firstQ(R, ctx, MOD, R.coin()); },
    c2: function (R, ctx) { return betweenQ(R, ctx, MOD); },
    c3: function (R, ctx) { return R.coin() ? betweenQ(R, ctx, ALL) : orderEv(R, ctx, ALL); }
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
