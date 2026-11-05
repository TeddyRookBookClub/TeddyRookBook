/* Inventors Ladder: generators for The Age of Electricity (course key invelec): history recall and the science and math of each topic.
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
  var KIDS = ['Ava', 'Ben', 'Cora', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana', 'Ira', 'Jo', 'Kai', 'Lena', 'Milo', 'Nia', 'Owen', 'Pia'];
  function sg(n) { return n > 0 ? '+' + n : n < 0 ? '−' + (-n) : '0'; }

  // ---------- invelec.franklin
  var FR_TL = [[1706, 'Franklin is born in Boston'], [1723, 'Franklin arrives in Philadelphia'], [1742, 'Franklin designs his fireplace (about this year)'], [1746, 'Franklin begins his electrical experiments'], [1751, 'his letters on electricity are printed in London'], [1752, 'the kite experiment in Philadelphia'], [1753, 'Franklin wins the Copley Medal'], [1785, 'Franklin describes his double spectacles'], [1790, 'Franklin dies in Philadelphia']];
  var FR_F = [
    ['What did Franklin call an object with extra electric fluid?', 'Positive, or plus', ['Negative, or minus', 'Neutral', 'Grounded', 'Magnetic'], 'A surplus was positive (plus); a shortage negative (minus).'],
    ['What does rubbing glass with silk do, in Franklin\'s one-fluid idea?', 'It moves electric fluid from one to the other', ['It creates new electricity', 'It destroys electricity', 'It makes both objects positive', 'It makes magnets'], 'Charge is moved, not made: what one gains the other loses.'],
    ['What did Franklin\'s kite experiment show?', 'Lightning is electricity', ['Kites can fly in any weather', 'Keys attract lightning', 'Clouds are made of iron', 'Rain carries magnetism'], 'The string picked up charge from a storm cloud, like a charged glass tube.'],
    ['Was Franklin\'s kite struck by lightning?', 'No: the string only picked up charge, and even that was dangerous', ['Yes, many times', 'Yes, once, which melted the key', 'Nobody flew a kite at all', 'Yes, and it lit a lamp'], 'A direct strike could have killed him. Never fly a kite in a storm.'],
    ['Why did Franklin refuse a patent for his stove?', 'He thought inventions should be shared freely, since we enjoy others\' inventions', ['Patents did not exist yet', 'The stove did not work', 'He sold it to the king', 'He forgot to apply'], 'His Autobiography explains the principle.'],
    ['What are Franklin\'s double spectacles called today?', 'Bifocals', ['Monocles', 'Contact lenses', 'Sunglasses', 'Microscopes'], 'Two half-lenses in one frame: reading below, distance above.'],
    ['Who first drew sparks from a tall rod during a storm, following Franklin\'s plan, in May 1752?', 'Dalibard and his helpers, at Marly in France', ['Franklin himself, in Boston', 'Volta, in Italy', 'Newton, in London', 'Faraday, in London'], 'They did it before Franklin\'s kite flight.'],
    ['What does a lightning rod do?', 'Leads a lightning strike safely into the ground', ['Makes lightning stronger', 'Stops storms from forming', 'Stores lightning for later', 'Attracts rain'], 'A grounded rod gives the strike an easy path that bypasses the building.']
  ];
  G('invelec.franklin', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'first', 'like']), R.pick(['cons', 'like', 'gap', 'fact']), R.pick(['cons2', 'gap', 'age', 'cons']));
    if (kind === 'fact') return fact(R, FR_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, FR_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, FR_TL, 'Franklin'); });
    if (kind === 'like') { var a = R.nz(-4, 4), b = R.nz(-4, 4), same = a * b > 0;
      return { q: 'Ball A has charge ' + sg(a) + ' and ball B has charge ' + sg(b) + '. What do they do when brought near each other?', a: MC(same ? 'Push apart' : 'Pull together', [same ? 'Pull together' : 'Push apart', 'Nothing', 'Spin around']), steps: [same ? 'Both have the same sign: like charges push apart.' : 'The signs differ: unlike charges pull together.'] }; }
    if (kind === 'age') { var e = R.pick(FR_TL.filter(function (x) { return x[0] > 1706; }));
      return { q: 'Franklin was born in January 1706. How old was he by the end of ' + e[0] + ', the year ' + e[1].replace(/ \(about this year\)/, '') + '?', a: AX(e[0] - 1706), unit: 'years', steps: ['$' + e[0] + ' - 1706 = ' + (e[0] - 1706) + '$.'] }; }
    var g = R.int(1, 9), who = R.pick(KIDS);
    if (kind === 'cons') return { q: who + ' rubs a glass rod with silk. Both started with charge 0. Now the glass has charge ' + sg(g) + ' units. What is the silk\'s charge?', a: AX(-g), unit: 'units', steps: ['Charge only moves, so the total stays 0.', '$' + g + ' + s = 0$, so $s = -' + g + '$.'] };
    var a0 = R.int(-5, 5), b0 = R.int(-5, 5), mv = R.int(1, 6);
    return { q: 'Object A has charge ' + sg(a0) + ' and object B has ' + sg(b0) + '. Rubbing moves ' + mv + ' units of positive charge from B to A. What is B\'s charge now?', a: AX(b0 - mv), unit: 'units', steps: ['B loses ' + mv + ' units: $' + b0 + ' - ' + mv + ' = ' + (b0 - mv) + '$.', 'A gains them, so the total, $' + (a0 + b0) + '$, stays the same.'], nolint: ['+ -', '--'] };
  });

  // ---------- invelec.volta
  var VO_TL = [[1745, 'Volta is born in Como'], [1775, 'Volta invents the electrophorus'], [1791, 'Galvani publishes on animal electricity'], [1798, 'Galvani dies in Bologna'], [1800, 'Volta describes the pile to the Royal Society'], [1801, 'Volta shows the pile to Napoleon'], [1827, 'Volta dies in Como'], [1881, 'the unit of voltage is named the volt']];
  var VO_F = [
    ['What made the frogs\' legs twitch in Galvani\'s experiments?', 'Electricity, from the metals and from the frog\'s own nerves', ['Heat from the hands', 'Magnetism in the table', 'Sound in the room', 'Nothing; it was a trick'], 'Both men held part of the truth: Volta\'s metals and Galvani\'s nerves.'],
    ['What was Volta\'s pile made of?', 'Zinc and copper (or silver) discs with brine-soaked card between pairs', ['Glass and silk', 'Iron and magnets', 'Wax and wool', 'Lead and gold only'], 'His 1800 letter gives the recipe.'],
    ['What was new about the current from Volta\'s pile?', 'It kept flowing steadily', ['It was one huge spark', 'It worked only in thunderstorms', 'It came from a magnet', 'It made light without wires'], 'Earlier devices gave only quick sparks.'],
    ['Who was Volta\'s great rival in the debate about animal electricity?', 'Luigi Galvani', ['Benjamin Franklin', 'Michael Faraday', 'Isaac Newton', 'Thomas Edison'], 'Galvani, a doctor in Bologna.'],
    ['Who did Volta write to about the pile in 1800?', 'Sir Joseph Banks, President of the Royal Society', ['Napoleon', 'The Pope', 'Benjamin Franklin', 'Galvani'], 'The letter was dated March 20, 1800.'],
    ['What did Nicholson and Carlisle do with a pile in 1800?', 'Split water into hydrogen and oxygen', ['Lit the first light bulb', 'Sent a telegraph message', 'Built a motor', 'Made a magnet float'], 'Within weeks of hearing about the pile.'],
    ['Why does a pile slowly run down?', 'The chemicals are used up as the zinc is eaten away', ['The electricity leaks into the air', 'The copper gets heavier', 'The brine freezes', 'It never runs down'], 'Chemistry is the real source of the energy.']
  ];
  G('invelec.volta', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'first', 'series']), R.pick(['series', 'need', 'gap', 'fact']), R.pick(['need', 'back', 'gap', 'series']));
    if (kind === 'fact') return fact(R, VO_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, VO_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, VO_TL, 'Volta'); });
    var v = R.pick([0.5, 0.75, 0.8, 1, 1.1, 1.5]), n = R.int(2, 30);
    if (kind === 'series') return { q: 'Each zinc–copper pair in a pile gives ' + v + ' V. What voltage do ' + n + ' pairs stacked in the same direction give?', a: AX(n * v), unit: 'V', steps: ['Cells in series add their voltages.', '$' + n + ' \\times ' + v + ' = ' + fx(n * v) + '$ V.'] };
    if (kind === 'need') { var tot = fx(n * v); return { q: 'Each pair gives ' + v + ' V. How many pairs does a pile need to give ' + tot + ' V?', a: AX(n), unit: 'pairs', steps: ['$n \\times ' + v + ' = ' + tot + '$.', '$n = ' + tot + ' \\div ' + v + ' = ' + n + '$.'] }; }
    var b = R.int(1, M.max(1, M.floor(n / 3)));
    return { q: 'A pile has ' + n + ' pairs at ' + v + ' V each, but ' + b + ' of them were stacked upside down. What voltage does it give?', a: AX((n - 2 * b) * v), unit: 'V', steps: ['Each backward pair subtracts instead of adding.', 'Useful pairs: $' + (n - b) + ' - ' + b + ' = ' + (n - 2 * b) + '$.', '$' + (n - 2 * b) + ' \\times ' + v + ' = ' + fx((n - 2 * b) * v) + '$ V.'], nolint: ['+ -', '--'] };
  });

  // ---------- invelec.faraday
  var FA_TL = [[1791, 'Faraday is born near London'], [1805, 'Faraday is apprenticed to a bookbinder'], [1812, 'Faraday hears Humphry Davy lecture'], [1813, 'Faraday becomes Davy\'s assistant'], [1820, 'Ørsted finds that a current moves a compass needle'], [1821, 'Faraday\'s first motor'], [1825, 'Faraday starts the Christmas Lectures'], [1831, 'Faraday discovers electromagnetic induction'], [1867, 'Faraday dies at Hampton Court']];
  var FA_F = [
    ['What was Faraday\'s first job?', 'Apprentice to a bookbinder', ['Telegraph operator', 'Printer', 'Professor at Cambridge', 'Ship\'s doctor'], 'He read the science books he bound.'],
    ['How did Faraday get a job with Humphry Davy?', 'He sent Davy bound notes of Davy\'s own lectures', ['He won a contest', 'His father knew Davy', 'He invented a motor first', 'He answered a newspaper ad'], 'Davy hired him as an assistant in 1813.'],
    ['In Faraday\'s 1831 ring experiment, when did the meter needle move?', 'Only when the battery was connected or disconnected', ['The whole time the current flowed', 'Never', 'Only at night', 'Only when the ring was heated'], 'A steady current did nothing; only a change did.'],
    ['What happens when a magnet sits still inside a coil?', 'No current flows', ['A steady current flows', 'The coil gets hot', 'The magnet loses its power', 'The coil spins'], 'Only a changing magnetic field makes a current.'],
    ['What did Faraday\'s 1821 device do?', 'Made a wire carrying current circle around a magnet', ['Made light from a wire', 'Sent a message', 'Split water', 'Recorded sound'], 'The first device to turn electricity into continuous motion.'],
    ['Which American found induction independently at about the same time?', 'Joseph Henry', ['Samuel Morse', 'Benjamin Franklin', 'Thomas Edison', 'Alexander Graham Bell'], 'Faraday published first.'],
    ['What lectures for young people did Faraday give at Christmas 1860–1861?', 'The Chemical History of a Candle', ['The Sidereal Messenger', 'A Brief History of Time', 'Cosmos', 'My Inventions'], 'Six lectures, printed and read ever since.'],
    ['Which machine did Faraday\'s spinning copper disc lead to?', 'The generator (dynamo)', ['The telescope', 'The printing press', 'The steam engine', 'The telephone'], 'Turning a conductor in a magnetic field makes a current.']
  ];
  G('invelec.faraday', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'first', 'time']), R.pick(['time', 'turns', 'gap', 'fact']), R.pick(['both', 'turns', 'gap', 'time']));
    if (kind === 'fact') return fact(R, FA_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, FA_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, FA_TL, 'Faraday'); });
    var e = R.pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]), t1 = R.pick([0.5, 1, 2]), f = R.pick([2, 4, 5, 10]);
    if (kind === 'time') return { q: 'Pushing a magnet into a coil in ' + t1 + ' s makes ' + e + ' V. What voltage do you get pushing it in the same way in ' + fx(t1 / f) + ' s?', a: AX(e * f), unit: 'V', steps: ['The same change happens ' + f + ' times faster.', 'Voltage goes with the rate of change: $' + f + ' \\times ' + e + ' = ' + fx(e * f) + '$ V.'] };
    var n1 = R.pick([10, 20, 50, 100]), n2 = n1 * R.pick([2, 3, 4, 5]);
    if (kind === 'turns') return { q: 'A coil of ' + n1 + ' turns gives ' + e + ' V when a magnet is pushed in. What does a coil of ' + n2 + ' turns give for the same push?', a: AX(e * n2 / n1), unit: 'V', steps: ['Each turn adds the same voltage, so voltage goes with the number of turns.', '$' + e + ' \\times \\dfrac{' + n2 + '}{' + n1 + '} = ' + fx(e * n2 / n1) + '$ V.'] };
    return { q: 'A coil of ' + n1 + ' turns gives ' + e + ' V when a magnet is pushed in over ' + t1 + ' s. What voltage does a coil of ' + n2 + ' turns give if the magnet is pushed in ' + f + ' times faster?', a: AX(e * (n2 / n1) * f), unit: 'V', steps: ['Turns: $\\times ' + (n2 / n1) + '$. Speed: $\\times ' + f + '$.', '$' + e + ' \\times ' + (n2 / n1) + ' \\times ' + f + ' = ' + fx(e * n2 / n1 * f) + '$ V.'] };
  });

  // ---------- invelec.morse
  var CODE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..' };
  function show(c) { return c.split('').map(function (x) { return x === '.' ? '·' : '−'; }).join(' '); }
  function units(c) { return c.split('').reduce(function (a, x) { return a + (x === '.' ? 1 : 3); }, 0) + (c.length - 1); }
  var MO_TL = [[1791, 'Morse is born in Charlestown, Massachusetts'], [1831, 'Joseph Henry rings a bell with an electromagnet over a long wire'], [1832, 'Morse gets the idea aboard the Sully'], [1837, 'Alfred Vail joins Morse'], [1840, 'Morse receives a U.S. patent'], [1844, '"What hath God wrought" is sent'], [1861, 'telegraph lines cross the United States'], [1866, 'a lasting cable crosses the Atlantic'], [1872, 'Morse dies in New York']];
  var MO_F = [
    ['What was Samuel Morse\'s first career?', 'Painter', ['Sailor', 'Blacksmith', 'Banker', 'Teacher of the deaf'], 'He studied art in London and painted portraits.'],
    ['Whose science of strong electromagnets made long telegraph lines work?', 'Joseph Henry\'s', ['Isaac Newton\'s', 'Benjamin Franklin\'s', 'Galileo\'s', 'Thomas Edison\'s'], 'Henry showed how to wind magnets with many turns and use many cells.'],
    ['Why is E a single dot in Morse code?', 'E is the most common letter, so it gets the shortest code', ['E comes first in the alphabet', 'E was Morse\'s initial', 'Dots are easier for E', 'It was chosen by lot'], 'Common letters got short codes so messages are faster.'],
    ['What was the first official message on the Washington–Baltimore line in 1844?', '"What hath God wrought"', ['"Mr. Watson, come here"', '"Success four flights"', '"Mary had a little lamb"', '"Eureka"'], 'Words from the Bible (Numbers 23:23), chosen by Annie Ellsworth.'],
    ['Who built much better instruments for Morse and helped shape the code?', 'Alfred Vail', ['Thomas Watson', 'Charlie Taylor', 'Peter Schöffer', 'William Cooke'], 'Historians still discuss how much of the code was Vail\'s.'],
    ['Who had a working needle telegraph in Britain by 1839?', 'William Cooke and Charles Wheatstone', ['Faraday and Davy', 'Bell and Watson', 'Edison and Tesla', 'Volta and Galvani'], 'Patented in 1837, used on a railway.'],
    ['What does the electromagnet at the far end of a telegraph do?', 'Clicks or marks paper when current flows', ['Turns sound into light', 'Stores the message', 'Charges the battery', 'Speeds up the current'], 'Pulses of current pull the armature down: clicks.']
  ];
  G('invelec.morse', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'enc', 'first', 'dec']), R.pick(['enc', 'dec', 'units', 'gap', 'fact']), R.pick(['word', 'units', 'gap', 'dec']));
    if (kind === 'fact') return fact(R, MO_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, MO_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, MO_TL, 'The telegraph'); });
    var L = Object.keys(CODE), ch = R.pick(L), others = R.sample(L.filter(function (x) { return x !== ch; }), 3);
    if (kind === 'enc') return { q: 'Which is the Morse code for the letter <b>' + ch + '</b>?', a: MC(show(CODE[ch]), others.map(function (o) { return show(CODE[o]); })), steps: [ch + ' = ' + show(CODE[ch]) + '.'] };
    if (kind === 'dec') return { q: 'Which letter is <b>' + show(CODE[ch]) + '</b> in Morse code?', a: MC(ch, others), steps: [show(CODE[ch]) + ' is ' + ch + '.'] };
    if (kind === 'units') return { q: 'In Morse timing, a dot lasts 1 unit, a dash 3 units, and the gap between parts of one letter 1 unit. How many units long is the letter ' + ch + ' (' + show(CODE[ch]) + ')?', a: AX(units(CODE[ch])), unit: 'units',
      steps: ['Dots: ' + CODE[ch].split('').filter(function (x) { return x === '.'; }).length + ' × 1; dashes: ' + CODE[ch].split('').filter(function (x) { return x === '-'; }).length + ' × 3; gaps inside the letter: ' + (CODE[ch].length - 1) + ' × 1.', 'Total: $' + units(CODE[ch]) + '$ units.'] };
    var w = R.pick(['SOS', 'HI', 'TEA', 'MOM', 'NET', 'SEA', 'TOE', 'AIM', 'OAT', 'ME', 'IT', 'ON', 'AT', 'TIN', 'HAT']), tot = w.split('').reduce(function (a, c) { return a + units(CODE[c]); }, 0) + 3 * (w.length - 1);
    return { q: 'How many units long is the word <b>' + w + '</b> in Morse code? (Dot 1, dash 3, gap inside a letter 1, gap between letters 3.)', a: AX(tot), unit: 'units',
      steps: [w.split('').map(function (c) { return c + ' (' + show(CODE[c]) + ') = ' + units(CODE[c]); }).join('; ') + '.', 'Gaps between letters: $' + (w.length - 1) + ' \\times 3 = ' + 3 * (w.length - 1) + '$.', 'Total: $' + tot + '$ units.'] };
  });

  // ---------- invelec.bell
  var BE_TL = [[1847, 'Bell is born in Edinburgh'], [1871, 'Bell moves to Boston to teach deaf students'], [1875, 'the stuck reed: Bell hears a twang through the wire'], [1876, 'Bell\'s telephone patent is granted'], [1877, 'the Bell Telephone Company is founded'], [1915, 'the first coast-to-coast telephone call'], [1922, 'Bell dies in Nova Scotia'], [1844, 'Morse\'s first official telegraph message']];
  var BE_F = [
    ['What was Bell\'s main work before the telephone?', 'Teaching deaf students to speak', ['Painting portraits', 'Running a bicycle shop', 'Binding books', 'Building steam engines'], 'His father invented Visible Speech; his mother and wife were deaf.'],
    ['How does a telephone current differ from a telegraph signal?', 'It rises and falls in the shape of the sound wave', ['It is always on', 'It is only on or off', 'It carries light instead', 'It has no current at all'], 'The receiver uses that shape to rebuild the sound.'],
    ['What were Bell\'s first words through the telephone, as his notebook records?', '"Mr. Watson—Come here—I want to see you"', ['"What hath God wrought"', '"Can you hear me now?"', '"Hello, world"', '"Eureka"'], 'March 10, 1876.'],
    ['Who filed a caveat on the same day as Bell\'s patent application?', 'Elisha Gray', ['Thomas Edison', 'Antonio Meucci', 'Samuel Morse', 'Nikola Tesla'], 'February 14, 1876. Historians still discuss what that means.'],
    ['Why did Antonio Meucci lose his caveat?', 'He could not afford to renew it after 1874', ['He moved to Italy', 'Bell bought it', 'It was stolen', 'He gave it to Gray'], 'Supporters call him the first inventor; others say his devices worked differently.'],
    ['What happened on June 2, 1875?', 'A stuck reed\'s twang came through Bell\'s receiver with its overtones', ['Bell received his patent', 'The first phone call crossed America', 'Bell met Edison', 'Watson invented the microphone'], 'It showed the wire could carry the shape of a sound.'],
    ['Who was Bell\'s assistant?', 'Thomas Watson', ['Alfred Vail', 'Charles Batchelor', 'Charlie Taylor', 'Leonard Gale'], 'A young machinist in Boston.']
  ];
  G('invelec.bell', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'first', 'wave']), R.pick(['wave', 'gap', 'fact', 'freq', 'echo']), R.pick(['wave', 'freq', 'gap', 'echo', 'line', 'line']));
    if (kind === 'fact') return fact(R, BE_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, BE_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, BE_TL, 'Bell'); });
    var f = R.pick([10, 17, 20, 34, 40, 50, 68, 80, 85, 100, 136, 160, 170, 200, 250, 272, 340, 400, 425, 500, 544, 680, 800, 850, 1000, 1360, 1700, 2000]), lam = 340 / f;
    if (kind === 'wave') return { q: 'Sound travels about 340 m/s in air. A voice makes a tone of ' + f + ' vibrations per second (hertz). What is its wavelength?', a: AR(lam, 0.01), unit: 'm', steps: ['Wavelength = speed ÷ frequency.', '$340 \\div ' + f + ' = ' + fx(lam) + '$ m.'] };
    if (kind === 'line') { var km = R.int(2, 60) * 100; return { q: 'A telephone signal travels along a wire at about 200,000 km per second. How many milliseconds does it take to cross ' + cm(km) + ' km? (1 second = 1,000 milliseconds.)', a: AR(km / 200, 0.01), unit: 'ms', steps: ['Time in seconds: $' + cm(km) + ' \\div 200{,}000$.', 'In milliseconds, multiply by 1,000: $' + cm(km) + ' \\div 200 = ' + fx(km / 200) + '$ ms. Far too short to notice in a conversation.'] }; }
    if (kind === 'echo') { var dd = R.pick([17, 34, 51, 68, 85, 102, 170, 255, 340, 510, 680]), who = R.pick(KIDS); return { q: who + ' shouts toward a cliff ' + dd + ' m away. Sound travels about 340 m/s. How long until the echo comes back?', a: AR(2 * dd / 340, 0.01), unit: 's', steps: ['The sound goes there and back: $2 \\times ' + dd + ' = ' + 2 * dd + '$ m.', '$' + 2 * dd + ' \\div 340 = ' + fx(2 * dd / 340) + '$ s.'] }; }
    var l2 = R.pick([0.25, 0.5, 0.8, 1, 1.25, 1.7, 2, 2.5, 3.4, 4, 5, 8.5, 10, 17, 20]);
    return { q: 'Sound travels about 340 m/s in air. A sound wave has a wavelength of ' + l2 + ' m. What is its frequency?', a: AR(340 / l2, 0.01), unit: 'Hz', steps: ['Frequency = speed ÷ wavelength.', '$340 \\div ' + l2 + ' = ' + fx(340 / l2) + '$ Hz.'] };
  });

  // ---------- invelec.edison
  var ED_TL = [[1847, 'Edison is born in Milan, Ohio'], [1869, 'Edison\'s first patent, the vote recorder'], [1876, 'the Menlo Park laboratory opens'], [1877, 'the phonograph plays "Mary had a little lamb"'], [1879, 'a carbonized cotton thread glows for over 13 hours'], [1880, 'carbonized bamboo lasts over 1,000 hours'], [1882, 'the Pearl Street Station lights homes in New York'], [1887, 'Edison moves to West Orange'], [1931, 'Edison dies in West Orange']];
  var ED_F = [
    ['What lesson did Edison take from his vote recorder?', 'Invent things people want to buy', ['Never patent anything', 'Work alone', 'Use only gold wires', 'Avoid electricity'], 'It worked, but lawmakers did not want faster voting.'],
    ['Why does a hot filament need a vacuum?', 'In air, oxygen makes it burn up', ['Vacuum makes it brighter by magic', 'Air is too heavy for the glass', 'Vacuum keeps it cold', 'Air blocks the light'], 'Pumping out the air lets the filament glow far longer.'],
    ['Why did Edison want a thin, high-resistance filament?', 'So many lamps in parallel need less current and thinner copper wires', ['So it would glow blue', 'So it would be cheaper to ship', 'So it would last one hour exactly', 'So it would make sound'], 'Less current means less copper in the wiring, a system idea.'],
    ['What did Edison record first on his phonograph?', '"Mary had a little lamb"', ['"What hath God wrought"', '"Mr. Watson, come here"', 'A symphony', 'A speech by the president'], 'On a tinfoil cylinder, late in 1877.'],
    ['Which filament material lasted over a thousand hours in 1880?', 'Carbonized bamboo', ['Platinum', 'Plain cotton', 'Gold', 'Copper'], 'After testing thousands of plant fibers.'],
    ['Who made a similar carbon-filament bulb in England at about the same time?', 'Joseph Swan', ['Michael Faraday', 'Isaac Newton', 'Charles Wheatstone', 'James Watt'], 'Edison and Swan later joined their British companies.'],
    ['What opened at Pearl Street in New York in 1882?', 'A power station sending direct current to customers', ['The first telephone exchange', 'A printing shop', 'A wind tunnel', 'A telegraph office'], 'Bulbs need a whole system: dynamos, wires, meters, fuses.'],
    ['What made Menlo Park new?', 'A team working full time on invention, with tools and a library', ['It was the first school', 'It made only light bulbs', 'It was in Europe', 'It had no workers'], 'Often called the first research laboratory of its kind.']
  ];
  G('invelec.edison', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'first', 'nights']), R.pick(['ohm', 'nights', 'gap', 'fact']), R.pick(['ohm', 'par', 'gap', 'nights']));
    if (kind === 'fact') return fact(R, ED_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, ED_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, ED_TL, 'Edison'); });
    if (kind === 'nights') { var h = R.pick([4, 5, 6, 8, 10]), nn = R.int(20, 300), life = h * nn; return { q: 'A lamp lasts ' + cm(life) + ' hours. It burns ' + h + ' hours every night. How many nights does it last?', a: AX(nn), unit: 'nights', steps: ['$' + cm(life) + ' \\div ' + h + ' = ' + nn + '$.'] }; }
    var V0 = R.pick([100, 110, 120]), Rr = R.pick([50, 100, 200, 250, 500]);
    if (kind === 'ohm') return { q: 'A lamp with a filament resistance of ' + Rr + ' ohms runs on ' + V0 + ' volts. What current does it draw? (Current = voltage ÷ resistance.)', a: AR(V0 / Rr, 0.01), unit: 'A', steps: ['$I = \\dfrac{V}{R} = \\dfrac{' + V0 + '}{' + Rr + '} = ' + fx(V0 / Rr) + '$ A.', 'A higher resistance would need less current, which is what Edison wanted.'] };
    var n = R.int(5, 40), I = V0 / Rr;
    return { q: n + ' lamps are wired side by side (in parallel) on ' + V0 + ' volts. Each has a resistance of ' + Rr + ' ohms. What total current does the supply wire carry?', a: AR(n * I, 0.01), unit: 'A', steps: ['Each lamp draws $\\dfrac{' + V0 + '}{' + Rr + '} = ' + fx(I) + '$ A.', 'In parallel the currents add: $' + n + ' \\times ' + fx(I) + ' = ' + fx(n * I) + '$ A.'] };
  });

  // ---------- invelec.tesla
  var TE_TL = [[1856, 'Tesla is born in Smiljan'], [1875, 'Tesla begins studies at the polytechnic in Graz'], [1882, 'the rotating field idea in a Budapest park'], [1884, 'Tesla arrives in New York'], [1887, 'Tesla opens his own laboratory'], [1888, 'Tesla lectures on AC motors'], [1891, 'Tesla patents the Tesla coil'], [1893, 'AC lights the World\'s Fair in Chicago'], [1896, 'Niagara Falls power reaches Buffalo'], [1919, 'My Inventions is published'], [1943, 'Tesla dies in New York']];
  var TE_F = [
    ['What problem in direct-current motors did Tesla want to get rid of?', 'The brushes and commutator, which sparked and wore out', ['The weight of the magnets', 'The color of the wires', 'The noise of the fan', 'The cost of iron'], 'He saw a Gramme machine sparking in Graz.'],
    ['Where did Tesla say the rotating field idea came to him?', 'In a park in Budapest, at sunset', ['In Edison\'s lab', 'On a ship to America', 'In a dream in Paris', 'At Niagara Falls'], 'He drew the diagrams in the sand with a stick.'],
    ['What makes an induction motor turn?', 'A magnetic field that rotates and drags the rotor around', ['A falling weight', 'Brushes sliding on a commutator', 'Steam jets', 'A hand crank'], 'Two or more coils with currents peaking one after another.'],
    ['Why did AC win for power grids?', 'Transformers can step it up for long wires and down for homes', ['It cannot shock anyone', 'Edison gave up', 'It needs no wires', 'DC was illegal'], 'High voltage wastes less power over long distances.'],
    ['Who bought Tesla\'s AC motor patents in 1888?', 'George Westinghouse', ['Thomas Edison', 'J. P. Morgan', 'Alexander Graham Bell', 'Joseph Henry'], 'Westinghouse built AC systems.'],
    ['Who in Italy found the rotating magnetic field at about the same time as Tesla?', 'Galileo Ferraris', ['Alessandro Volta', 'Guglielmo Marconi', 'Luigi Galvani', 'Galileo Galilei'], 'A reminder that big ideas often come to several people.'],
    ['What is still run on direct current today?', 'Batteries, phones and computers', ['Nothing at all', 'Only toasters', 'Only power grids', 'Only induction motors'], 'DC never disappeared.'],
    ['What lit the 1893 World\'s Fair in Chicago?', 'Westinghouse alternating current', ['Edison direct current', 'Gas lamps only', 'Candles', 'Arc lights powered by Volta piles'], 'A public win for AC.']
  ];
  G('invelec.tesla', function (R, ctx) {
    var kind = by(ctx, R.pick(['fact', 'fact', 'first', 'rpm']), R.pick(['rpm', 'trans', 'gap', 'fact']), R.pick(['rpm2', 'trans2', 'gap', 'trans']));
    if (kind === 'fact') return fact(R, TE_F);
    if (kind === 'first') return tryN(function () { return firstQ(R, TE_TL); });
    if (kind === 'gap') return tryN(function () { return gapQ(R, TE_TL, 'Tesla'); });
    var f = R.pick([25, 40, 50, 60, 100, 400]);
    if (kind === 'rpm') return { q: 'A two-pole rotating field turns once per cycle. With alternating current at ' + f + ' cycles per second, how many turns per minute does the field make?', a: AX(f * 60), unit: 'turns per minute', steps: ['$' + f + '$ turns each second.', '$' + f + ' \\times 60 = ' + cm(f * 60) + '$ turns per minute.'] };
    if (kind === 'rpm2') { var p = R.pick([2, 4, 6, 8]); return { q: 'An induction motor\'s field turns at $\\dfrac{120 f}{p}$ turns per minute, where $f$ is the frequency and $p$ the number of poles. What is that for $f = ' + f + '$ and $p = ' + p + '$?', a: AX(120 * f / p), unit: 'turns per minute', steps: ['$\\dfrac{120 \\times ' + f + '}{' + p + '} = ' + cm(120 * f / p) + '$.'] }; }
    var vin = R.pick([110, 120, 230, 240, 400, 1000, 2400, 4000, 11000]), r = R.pick([2, 3, 4, 5, 8, 10, 20, 25, 50, 100]);
    if (kind === 'trans') return { q: 'A transformer has ' + r + ' times as many turns on its output coil as on its input coil. The input is ' + cm(vin) + ' V AC. What is the output voltage?', a: AX(vin * r), unit: 'V', steps: ['Voltage scales with the turns ratio.', '$' + cm(vin) + ' \\times ' + r + ' = ' + cm(vin * r) + '$ V.'] };
    var vh = vin * r;
    return { q: 'A power line carries ' + cm(vh) + ' V AC. A transformer steps it down to ' + cm(vin) + ' V. What is the ratio of input turns to output turns?', a: AX(r), unit: '', steps: ['Turns ratio = voltage ratio.', '$' + cm(vh) + ' \\div ' + cm(vin) + ' = ' + r + '$.', 'This easy step down is what DC could not do in the 1880s.'] };
  });
})(window.MathLadder);
