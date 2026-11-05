/* Inventors Ladder: generators for Modern Explainers (course key invmodern): history recall and the science and math of each topic.
   Registered with MathLadder.gen(id, fn(R, ctx)). The shared helpers at the top are the same in every Inventors Ladder
   people-course gen file. */
(function (ML) {
  'use strict';
  if (!ML) return;
  var G = ML.gen, U = ML.util, by = ML.byLevel, T = ML.T;
  function fx(x) { return +(+x).toPrecision(12); }
  function AX(x) { return { t: 'num', v: String(fx(x)) }; }
  function AR(x, r) { return { t: 'num', v: String(+(+x).toPrecision(4)), rtol: r || 0.02 }; }
  function MC(c, w) { return U.mc(c, w.filter(function (x) { return x !== c; }), 4); }
  function cm(x) { return T.commas(fx(x)); }
  function yr(y) { return y < 0 ? (-y) + ' BC' : (y < 1000 ? 'AD ' + y : String(y)); }
  /* a fact question from a bank of [question, answer, [wrong answers], explanation] */
  function fact(R, bank) {
    var f = R.pick(bank);
    return { q: f[0], a: MC(f[1], R.sample(f[2], M.min(3, f[2].length))), steps: [f[3] || f[1] + '.'] };
  }
  var M = Math;
  /* years between two timeline events (negative years are BC; there is no year 0) */
  function gapQ(R, tl, who) {
    var p = R.sample(tl, 2).sort(function (a, b) { return a[0] - b[0]; }), a = p[0], b = p[1], d, steps;
    if (a[0] < 0 && b[0] > 0) { d = -a[0] + b[0] - 1; steps = ['From ' + yr(a[0]) + ' to AD 1 is $' + (-a[0]) + '$ years minus the year we start in, and there is no year 0.', 'So the gap is $' + (-a[0]) + ' + ' + b[0] + ' - 1 = ' + d + '$ years.']; }
    else if (a[0] < 0) { d = b[0] - a[0]; steps = ['Both years are BC, and BC years count down, so subtract the smaller number from the larger.', '$' + (-a[0]) + ' - ' + (-b[0]) + ' = ' + d + '$ years.']; }
    else { d = b[0] - a[0]; steps = ['Subtract the earlier year from the later one.', '$' + b[0] + ' - ' + a[0] + ' = ' + d + '$ years.']; }
    if (d <= 0) return null;
    return { q: (who ? who + ': ' : '') + 'How many years passed between these two events?<br>• ' + yr(a[0]) + ': ' + a[1] + '<br>• ' + yr(b[0]) + ': ' + b[1], a: AX(d), unit: 'years', steps: steps };
  }
  function firstQ(R, tl) {
    var p = R.sample(tl, 3).sort(function (a, b) { return a[0] - b[0]; });
    if (p[0][0] === p[1][0]) return null;
    return { q: 'Which of these happened <b>first</b>?', a: MC(p[0][1], [p[1][1], p[2][1]]), steps: [p.map(function (e) { return yr(e[0]) + ': ' + e[1]; }).join('; ') + '.'] };
  }
  function tryN(fn) { for (var i = 0; i < 12; i++) { var p = fn(); if (p) return p; } return fn(); }
  var BHT = [['Our Picture of the Universe', 'what makes a good scientific theory, from Aristotle to Newton'], ['Space and Time', 'Einstein\'s relativity and the fixed speed of light'], ['The Expanding Universe', 'galaxies moving apart and the big bang'], ['The Uncertainty Principle', 'why position and speed can\'t both be known exactly'], ['Elementary Particles and the Forces of Nature', 'quarks, electrons and the four forces'], ['Black Holes', 'collapsed stars and the event horizon'], ['Black Holes Ain\'t So Black', 'Hawking radiation: black holes glow faintly'], ['The Origin and Fate of the Universe', 'the early universe and the no-boundary idea'], ['The Arrow of Time', 'why disorder grows and we remember the past'], ['Wormholes and Time Travel', 'shortcuts through space and trips to the past'], ['The Unification of Physics', 'joining gravity with quantum theory']];
  var NUT = [['A Brief History of Relativity', 'how Einstein came to relativity'], ['The Shape of Time', 'time as a bendable dimension, and imaginary time'], ['The Universe in a Nutshell', 'how the universe may have grown from something tiny'], ['Predicting the Future', 'chaos, uncertainty and what black holes do to information'], ['Protecting the Past', 'whether physics forbids travel to the past'], ['Our Future? Star Trek or Not?', 'how knowledge and technology may change'], ['Brane New World', 'our universe as a surface in more dimensions']];
  var COS = [['The Shores of the Cosmic Ocean', 'a tour of the universe and Eratosthenes measuring the Earth'], ['One Voice in the Cosmic Fugue', 'evolution and the chemistry of life'], ['The Harmony of Worlds', 'astrology versus astronomy, and Kepler'], ['Heaven and Hell', 'comets, impacts and the greenhouse of Venus'], ['Blues for a Red Planet', 'Mars and the Viking landers'], ['Travelers\' Tales', 'the Voyager probes and the Dutch explorers'], ['The Backbone of Night', 'what stars are, and the Ionian thinkers'], ['Travels in Space and Time', 'light speed, relativity and star travel'], ['The Lives of the Stars', 'how stars are born and die, and made our atoms'], ['The Edge of Forever', 'galaxies and the big bang'], ['The Persistence of Memory', 'genes, brains and books as stores of information'], ['Encyclopaedia Galactica', 'the search for life beyond Earth'], ['Who Speaks for Earth?', 'the Library of Alexandria and humanity\'s future']];
  function chap(R, list, book) {
    var i = R.int(0, list.length - 1), c = list[i], others = R.sample(list.filter(function (_, j) { return j !== i; }), 3);
    if (R.coin()) return { q: 'In ' + book + ', which chapter is about ' + c[1] + '?', a: MC(c[0], others.map(function (o) { return o[0]; })), steps: ['"' + c[0] + '" is about ' + c[1] + '.'] };
    return { q: 'In ' + book + ', what is the chapter "' + c[0] + '" about?', a: MC(c[1], others.map(function (o) { return o[1]; })), steps: ['"' + c[0] + '": ' + c[1] + '.'] };
  }
  function light(R) {
    var objs = [['the Moon', 384000], ['the Sun', 150000000], ['Mars at its closest', 55000000], ['Jupiter at its closest', 588000000], ['a satellite 36,000 km up', 36000], ['Voyager 1 in 1990', 6000000000]];
    var o = R.pick(objs), t = o[1] / 300000;
    return { q: 'Light travels about 300,000 km each second. ' + o[0].charAt(0).toUpperCase() + o[0].slice(1) + ' is about ' + cm(o[1]) + ' km away. How many seconds does light take to cover that distance?', a: AR(t, 0.01), unit: 's', steps: ['Time = distance ÷ speed.', '$' + cm(o[1]) + ' \\div 300{,}000 ' + (t === M.round(t * 10) / 10 ? '= ' + cm(fx(t)) : '\\approx ' + cm(+t.toFixed(1))) + '$ s.'] };
  }

  // ---------- invmodern.hawking-brief-history
  var HW_F = [
    ['Which equation did Hawking keep in A Brief History of Time?', '$E = mc^2$', ['$F = ma$', '$a^2 + b^2 = c^2$', '$V = IR$', 'None at all'], 'He was told each equation would cut his sales.'],
    ['What did Hawking show about black holes in 1974?', 'They should give off faint radiation and slowly shrink', ['They do not exist', 'They are made of ice', 'They swallow whole galaxies quickly', 'They are holes in the ground'], 'Hawking radiation, joining gravity with quantum theory.'],
    ['Which chair did Hawking hold at Cambridge from 1979 to 2009?', 'The Lucasian chair of mathematics, once held by Newton', ['The chair of medicine', 'The chair of music', 'The presidency of the Royal Society', 'The chair of history'], 'Isaac Newton held the same chair.'],
    ['What is the edge of a black hole called?', 'The event horizon', ['The crust', 'The photon wall', 'The dark line', 'The big bang'], 'Inside it, not even light escapes.'],
    ['Far away from a black hole, how strong is its gravity?', 'The same as any object of the same mass', ['Infinitely strong', 'Zero', 'Twice as strong as a star', 'It pushes things away'], 'Black holes are not cosmic vacuum cleaners.'],
    ['What did Hubble find in the 1920s?', 'Galaxies are moving apart', ['The Sun goes around the Earth', 'Black holes glow', 'Light has no speed', 'Mars has canals'], 'The expanding universe, Hawking\'s chapter 3.']
  ];
  G('invmodern.hawking-brief-history', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'chap', 'chap']), R.pick(['chap', 'light', 'bh', 'fact']), R.pick(['light', 'bh', 'bh2', 'chap', 'bh', 'bh2']));
    if (kind === 'fact') return fact(R, HW_F);
    if (kind === 'chap') return chap(R, BHT, 'A Brief History of Time');
    if (kind === 'light') return light(R);
    var m = R.pick([R.int(1, 60), R.int(1, 60), R.pick([100, 1000, 4000000])]);
    if (kind === 'bh') return { q: 'A black hole\'s event horizon has a radius of about 3 km for each Sun\'s worth of mass. What is the radius for a black hole of ' + cm(m) + ' solar masses?', a: AX(3 * m), unit: 'km', steps: ['$3 \\times ' + cm(m) + ' = ' + cm(3 * m) + '$ km.'] };
    var r = 3 * m; return { q: 'A black hole\'s event horizon is about ' + cm(r) + ' km in radius. Using about 3 km per solar mass, what is its mass in solar masses?', a: AX(m), unit: 'solar masses', steps: ['$' + cm(r) + ' \\div 3 = ' + cm(m) + '$.'] };
  });

  // ---------- invmodern.hawking-nutshell
  var NU_F = [
    ['Where does the title The Universe in a Nutshell come from?', 'A line in Shakespeare\'s Hamlet', ['A Greek myth', 'A children\'s rhyme', 'Newton\'s Principia', 'A Star Trek episode'], '"I could be bounded in a nutshell, and count myself a king of infinite space."'],
    ['Which of these ideas in the book is well tested?', 'Relativity', ['Branes', 'Time travel to the past', 'Chronology protection', 'Imaginary time as real time'], 'Hawking himself labels branes and time travel as speculative.'],
    ['When was The Universe in a Nutshell published?', '2001', ['1988', '1974', '1965', '2015'], 'Thirteen years after A Brief History of Time.'],
    ['What is Hawking\'s chronology protection idea?', 'The laws of physics may prevent travel to the past', ['Clocks must be protected from damage', 'Time runs backward in black holes', 'History books must not be changed', 'Time stops at the speed of sound'], 'Chapter 5, Protecting the Past.']
  ];
  G('invmodern.hawking-nutshell', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'chap', 'chap']), R.pick(['chap', 'dil', 'ly', 'fact']), R.pick(['dil', 'dil2', 'ly', 'chap']));
    if (kind === 'fact') return fact(R, NU_F);
    if (kind === 'chap') return chap(R, NUT, 'The Universe in a Nutshell');
    var g = R.pick([[2, '87%'], [5, '98%'], [10, '99.5%']]), yrs = R.pick([4, 10, 20, 30, 40, 50, 100]);
    if (kind === 'dil') return { q: 'At ' + g[1] + ' of light speed, a moving clock ticks ' + g[0] + ' times slower than one at rest. If ' + yrs + ' years pass on Earth, how much time passes for the traveler?', a: AX(yrs / g[0]), unit: 'years', steps: ['$' + yrs + ' \\div ' + g[0] + ' = ' + fx(yrs / g[0]) + '$ years.'] };
    if (kind === 'dil2') return { q: 'A traveler at ' + g[1] + ' of light speed ages ' + fx(yrs / g[0]) + ' years on a trip. Their clock ticks ' + g[0] + ' times slower than Earth\'s. How many years pass on Earth?', a: AX(yrs), unit: 'years', steps: ['$' + fx(yrs / g[0]) + ' \\times ' + g[0] + ' = ' + yrs + '$ years.'] };
    var ly = R.pick([4.2, 8.6, 11.4, 25, 100, 2500]), kmly = 9.46;
    return { q: 'One light-year is about $9.46$ trillion km. A star is ' + ly + ' light-years away. About how many trillion km is that? (One decimal place.)', a: AR(ly * kmly, 0.01), unit: 'trillion km', steps: ['$' + ly + ' \\times 9.46 \\approx ' + fx(+(ly * kmly).toFixed(1)) + '$ trillion km.'] };
  });

  // ---------- invmodern.sagan-cosmos
  var AGE = 13.8e9, DAY = AGE / 365;
  var EVS = [['the dinosaurs died out', 66e6], ['the first dinosaurs appeared', 230e6], ['the first animals appeared', 600e6], ['the Sun and Earth formed', 4.6e9], ['the first life on Earth appeared', 3.8e9], ['the first flowering plants appeared', 130e6], ['the first fish appeared', 500e6]];
  var CO_F = [
    ['What does the Cosmic Calendar do?', 'Squeezes the whole history of the universe into one year', ['Shows the dates of eclipses', 'Lists holidays on other planets', 'Counts the days of the Voyager trip', 'Tracks the phases of the Moon'], 'A scale model in time.'],
    ['How many chapters does Cosmos have?', '13, one for each television episode', ['7', '10', '24', '52'], 'The book and the 1980 series share a plan.'],
    ['Which ancient Greek measured the size of the Earth with shadows, as told in Cosmos chapter 1?', 'Eratosthenes', ['Archimedes', 'Hero', 'Ptolemy', 'Homer'], 'Around 240 BC, in Egypt.'],
    ['Which missions did Sagan help with?', 'The Viking landers on Mars and the Voyager probes', ['The Apollo Moon landings only', 'The Wright Flyer', 'The Hubble Space Telescope\'s launch', 'The first satellite, Sputnik'], 'He also helped make the Golden Record.'],
    ['On the Cosmic Calendar, when do humans appear?', 'In the last minutes of December 31', ['In January', 'In July', 'On December 1', 'At noon on December 31'], 'Our species is about 300,000 years old.']
  ];
  G('invmodern.sagan-cosmos', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'chap', 'chap', 'day']), R.pick(['chap', 'cal', 'day', 'fact']), R.pick(['cal', 'sec', 'cal2', 'cal2', 'day', 'sec']));
    if (kind === 'fact') return fact(R, CO_F);
    if (kind === 'chap') return chap(R, COS, 'Cosmos');
    if (kind === 'day') { var d = R.int(2, 120); return { q: 'On the Cosmic Calendar, one day stands for about 38 million years. How many million years do ' + d + ' calendar days stand for?', a: AX(38 * d), unit: 'million years', steps: ['$' + d + ' \\times 38 = ' + cm(38 * d) + '$ million years.'] }; }
    if (kind === 'cal2') { var my = R.int(4, 300) * 10, dd = my / 37.8; return { q: 'On a Cosmic Calendar where one day stands for about 37.8 million years, how many days before midnight on December 31 is something that happened ' + cm(my) + ' million years ago? (One decimal place.)', a: AR(dd, 0.03), unit: 'days', steps: ['$' + cm(my) + ' \\div 37.8 \\approx ' + dd.toFixed(1) + '$ days.'] }; }
    if (kind === 'cal') { var e = R.pick(EVS), days = e[1] / DAY; return { q: 'The universe is about 13.8 billion years old, squeezed into 365 calendar days (about 37.8 million years per day). ' + e[0].charAt(0).toUpperCase() + e[0].slice(1) + ' about ' + (e[1] >= 1e9 ? fx(e[1] / 1e9) + ' billion' : cm(e[1] / 1e6) + ' million') + ' years ago. How many calendar days before the end of the year is that? (One decimal place.)', a: AR(days, 0.03), unit: 'days',
      steps: ['Days $= ' + cm(e[1] / 1e6) + ' \\div 37.8$ (in millions of years).', '$\\approx ' + days.toFixed(1) + '$ days before midnight on December 31.'] }; }
    var s = R.int(1, 700), y = s * 440;
    return { q: 'On the Cosmic Calendar, one second stands for about 440 years. How many calendar seconds before midnight is something that happened ' + cm(y) + ' years ago?', a: AX(s), unit: 's', steps: ['$' + cm(y) + ' \\div 440 = ' + cm(s) + '$ seconds.'] };
  });

  // ---------- invmodern.sagan-books
  var BOOKS = [['The Cosmic Connection', 1973], ['The Dragons of Eden', 1977], ['Broca\'s Brain', 1979], ['Cosmos', 1980], ['Contact', 1985], ['Pale Blue Dot', 1994], ['The Demon-Haunted World', 1995], ['Billions and Billions', 1997]];
  var SB_F = [
    ['Which Sagan book won the Pulitzer Prize in 1978?', 'The Dragons of Eden', ['Cosmos', 'Contact', 'Pale Blue Dot', 'Billions and Billions'], 'A book about how the human brain evolved.'],
    ['Which Sagan book is a novel about a message from the stars?', 'Contact', ['Broca\'s Brain', 'The Demon-Haunted World', 'Cosmos', 'The Cosmic Connection'], 'Published in 1985 and filmed in 1997.'],
    ['Which book includes the "baloney detection kit"?', 'The Demon-Haunted World', ['Pale Blue Dot', 'The Dragons of Eden', 'Contact', 'Cosmos'], 'Thinking tools for checking claims.'],
    ['What does "extraordinary claims require extraordinary evidence" mean?', 'A surprising claim needs strong evidence before we accept it', ['All claims are false', 'Only scientists may make claims', 'Evidence is never needed', 'Old claims are always true'], 'Sagan made the saying famous.'],
    ['What is the "pale blue dot"?', 'Earth, as a tiny speck in a 1990 Voyager 1 photo', ['A star near the Sun', 'A blue planet beyond Neptune', 'A spot on Jupiter', 'A logo for NASA'], 'Taken from about 6 billion km away.'],
    ['According to Sagan, what is good skepticism?', 'Asking for evidence and accepting new ideas when the evidence is good', ['Doubting everything forever', 'Believing whatever experts say', 'Refusing to look at evidence', 'Trusting only old books'], 'He supported the search for life beyond Earth while asking for proof.'],
    ['A friend says a new gadget cures everything. Which thinking tool from Sagan fits best?', 'Look for independent confirmation of the facts', ['Trust it because it is expensive', 'Believe it because a famous person said so', 'Accept the first explanation', 'Never ask questions'], 'Independent tests are the first check.']
  ];
  G('invmodern.sagan-books', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'year']), R.pick(['year', 'fact', 'light', 'gap']), R.pick(['light', 'gap', 'year', 'fact']));
    if (kind === 'fact') return fact(R, SB_F);
    if (kind === 'light') return light(R);
    var p = R.sample(BOOKS, 4);
    if (kind === 'year') { var b = p[0]; return { q: 'Which Sagan book came out in ' + b[1] + '?', a: MC(b[0], p.slice(1).map(function (x) { return x[0]; })), steps: [p.map(function (x) { return x[0] + ' (' + x[1] + ')'; }).join('; ') + '.'] }; }
    var a = p[0], c = p[1]; if (a[1] === c[1]) c = p[2]; var lo = a[1] < c[1] ? a : c, hi = a[1] < c[1] ? c : a;
    return { q: 'How many years after ' + lo[0] + ' (' + lo[1] + ') did Sagan publish ' + hi[0] + ' (' + hi[1] + ')?', a: AX(hi[1] - lo[1]), unit: 'years', steps: ['$' + hi[1] + ' - ' + lo[1] + ' = ' + (hi[1] - lo[1]) + '$.'] };
  });
})(window.MathLadder);
