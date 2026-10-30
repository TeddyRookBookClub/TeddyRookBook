/* U.S. History II: 1865 to 2000 (History & Civics Ladder, course key ush2): problem generators for all 54 topics.
   Source parts: /tmp/work_ush2/gen/*.js (concatenated by /tmp/work_ush2/build.sh). Lessons: data/civics/lessons/ush2.json.
   Each topic is a bank of items drawn at random; choices are shuffled here (keep: true), and wrong choices are sampled from a
   pool, so problems vary. Practice checks facts, dates, order, causes and effects, and who argued what; never opinions.
   Where historians disagree, items ask what each side argues, never which side is right.
     level 1  one fact, three choices with a plainly wrong one; years as a choice of three
     level 2  four choices whose wrong ones match the topic's trouble note; years typed; order three or four events
     level 3  choose all that are true; order four or five events; true or false about a near miss
   Item kinds (bank):
     { L, q, a, w: [wrong pool], why }            one right choice
     { L, q, tf: true|false, why }                true or false
     { L, q, all: [[text, true|false], …], why }  choose all that are true
     { L, q, year: 1869, why }                    a year: L1 a choice of three nearby years, L2 and L3 typed
     { L, ord: [[year, label], …], n, q? }        put n events (distinct years) in order: answer the letters
     { L, tl: [[year, label], …], n }             a time line with letters: which letter marks this event?
     { L, gen: function (R, lv) -> item }         an item built from random parts                                   */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, M = Math, LET = 'ABCDEFGHIJ';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function lettersSpec(s) {
    var a = s.split('');
    return { t: 'text', v: [s, a.join(' '), a.join(','), a.join(', '), a.join('-')], strict: true };
  }
  function nWrong(lv) { return lv === 1 ? 2 : 3; }
  function mcItem(R, lv, it) {
    var wrong = R.sample(it.w, M.min(nWrong(lv), it.w.length)), ch = R.shuffle([it.a].concat(wrong));
    if (/^[A-J]$/.test(it.a)) ch.sort();
    return { q: it.q, a: { t: 'mc', choices: ch, v: ch.indexOf(it.a), keep: true } };
  }
  function yearItem(R, lv, it) {
    if (lv === 1) {
      var offs = R.sample([-12, -8, -5, -3, 3, 5, 8, 12], 2), ch = R.shuffle([it.year, it.year + offs[0], it.year + offs[1]].map(String));
      return { q: it.q, a: { t: 'mc', choices: ch, v: ch.indexOf(String(it.year)), keep: true } };
    }
    return { q: it.q + ' Type the year.', a: { t: 'num', v: String(it.year), form: 'int' } };
  }
  function pickDistinctYears(R, pool, n) {
    for (var tries = 0; tries < 40; tries++) {
      var s = R.sample(pool, n), ys = s.map(function (e) { return e[0]; });
      if (ys.filter(function (y, i) { return ys.indexOf(y) === i; }).length === n) return s;
    }
    var seen = {}, out = [];
    R.shuffle(pool).forEach(function (e) { if (!seen[e[0]] && out.length < n) { seen[e[0]] = 1; out.push(e); } });
    return out;
  }
  function ordItem(R, lv, it) {
    var n = it.n || (lv === 1 ? 3 : lv === 2 ? 4 : 5);
    var evs = pickDistinctYears(R, it.ord, M.min(n, it.ord.length)).sort(function (a, b) { return a[0] - b[0]; });
    var start = R.shuffle(evs.map(function (e, i) { return i; }));
    if (start.every(function (x, i) { return x === i; })) start.reverse();
    var ans = evs.map(function (e, i) { return LET.charAt(start.indexOf(i)); }).join('');
    return {
      q: (it.q || 'Put these events in order, earliest first.') + ' Type the letters in order (for example ' + LET.slice(0, evs.length).split('').reverse().join('') + ').',
      a: lettersSpec(ans),
      viz: { name: 'cv-order', opts: { items: evs.map(function (e) { return e[1]; }), start: start, quiet: true, interactive: false } },
      steps: evs.map(function (e) { return (it.seq ? '' : e[0] + ': ') + e[1] + ' (' + LET.charAt(start.indexOf(evs.indexOf(e))) + ').'; }).concat(['So the order is ' + ans + '.']),
      hint: 'Find the earliest event first, then the next.'
    };
  }
  function tlItem(R, lv, it) {
    var n = it.n || (lv === 1 ? 3 : 4);
    var evs = pickDistinctYears(R, it.tl, M.min(n, it.tl.length)).sort(function (a, b) { return a[0] - b[0]; });
    var k = R.int(0, evs.length - 1), L = LET.charAt(k), ch = LET.slice(0, evs.length).split('');
    return {
      q: 'The time line shows ' + evs.length + ' events, lettered in time order. Which letter marks this one: <b>' + esc(evs[k][1]) + '</b>?',
      a: { t: 'mc', choices: ch, v: k, keep: true },
      viz: { name: 'cv-timeline', opts: { events: evs.map(function (e, i) { return { id: 'e' + i, year: e[0], label: e[1] }; }), letters: true, quiet: true, interactive: false, from: evs[0][0] - 2, to: evs[evs.length - 1][0] + 2 } },
      steps: evs.map(function (e, i) { return LET.charAt(i) + ': ' + e[0] + ', ' + e[1] + '.'; }).concat([esc(evs[k][1]) + ' is ' + L + '.']),
      hint: 'Recall the year of each event; the letters run from earliest to latest.'
    };
  }
  function bank(list) {
    return function (R, ctx) {
      var lv = ctx.level || 1, pool = list.filter(function (it) { return it.L.indexOf(lv) >= 0; });
      if (!pool.length) pool = list;
      var it = R.pick(pool); if (it.gen) it = Object.assign({ L: it.L }, it.gen(R, lv));
      var p;
      if (it.ord) p = ordItem(R, lv, it);
      else if (it.tl) p = tlItem(R, lv, it);
      else if (it.year != null) p = yearItem(R, lv, it);
      else if (it.tf != null) p = { q: it.q + ' True or false?', a: { t: 'tf', v: it.tf } };
      else if (it.all) {
        var opts = R.shuffle(it.all.slice()), v = [];
        opts.forEach(function (o, i) { if (o[1]) v.push(i); });
        p = { q: it.q + ' Choose all that are true.', a: { t: 'mc', choices: opts.map(function (o) { return o[0]; }), v: v, keep: true } };
      } else p = mcItem(R, lv, it);
      if (!p.steps) p.steps = [].concat(it.why);
      if (!p.hint) p.hint = it.hint || 'Think back to the lesson: who, what, when and why.';
      if (it.viz && !p.viz) p.viz = typeof it.viz === 'function' ? it.viz(R) : it.viz;
      return p;
    };
  }
  // a quiet case card with the name hidden
  function caseViz(id, extra) { return { name: 'cv-case', opts: Object.assign({ id: id, quiet: true, interactive: false, hide: ['name'] }, extra || {}) }; }
  // a short primary-source excerpt
  function docViz(title, source, para, marks) { return { name: 'cv-doc', opts: { doc: { title: title, source: source, paras: [para] }, marks: (marks || []).map(function (t) { return { text: t }; }), quiet: true, interactive: false } }; }
  // a sorting item from a list of [text, groupIndex] with group names: "Which group does X belong to?"
  function sortGen(groups, cards, stem) {
    return function (R) {
      var c = R.pick(cards);
      return { q: (stem || 'Which does this belong to?') + ' <b>' + esc(c[0]) + '</b>', a: groups[c[1]], w: groups.filter(function (g, i) { return i !== c[1]; }), why: c[2] || (c[0] + ': ' + groups[c[1]] + '.') };
    };
  }

  /* ================= Unit 1: The West and the Gilded Age ================= */
  var WEST_EVENTS = [[1862, 'Pacific Railway Act and Homestead Act'], [1864, 'Sand Creek Massacre'], [1868, 'Treaty of Fort Laramie'], [1869, 'Golden spike at Promontory Summit'],
    [1872, 'Crédit Mobilier scandal exposed'], [1874, 'Gold found in the Black Hills'], [1876, 'Battle of the Little Bighorn'], [1879, 'Carlisle Indian Industrial School opens'],
    [1883, 'Railroads adopt standard time zones'], [1886, 'Geronimo surrenders'], [1887, 'Dawes Act'], [1890, 'Wounded Knee'], [1934, 'Indian Reorganization Act']];
  var GILDED_EVENTS = [[1869, 'Knights of Labor founded'], [1877, 'Great Railroad Strike'], [1879, 'Edison\'s light bulb'], [1881, 'President Garfield assassinated'], [1882, 'Chinese Exclusion Act'],
    [1883, 'Pendleton Civil Service Act'], [1886, 'Haymarket affair; AFL founded'], [1887, 'Interstate Commerce Act'], [1889, 'Hull House opens'], [1890, 'Sherman Antitrust Act'],
    [1892, 'Ellis Island opens; Homestead strike'], [1894, 'Pullman strike'], [1895, 'Booker T. Washington\'s Atlanta speech'], [1896, 'Plessy v. Ferguson; McKinley defeats Bryan'], [1903, 'The Souls of Black Folk']];

  G('ush2.transcontinental-railroad', bank([
    { L: [1, 2], q: 'Where did the two lines of the first transcontinental railroad meet in 1869?', a: 'Promontory Summit, Utah', w: ['Omaha, Nebraska', 'Chicago, Illinois', 'Sacramento, California', 'Denver, Colorado'], why: 'The Central Pacific and the Union Pacific met at Promontory Summit, Utah Territory, on May 10, 1869.' },
    { L: [1, 2, 3], q: 'In what year was the first transcontinental railroad completed?', year: 1869, why: 'The golden spike was driven at Promontory Summit on May 10, 1869.' },
    { L: [1, 2], q: 'Which law gave the railroad companies land grants and government bonds to build the line?', a: 'the Pacific Railway Act (1862)', w: ['the Homestead Act (1862)', 'the Sherman Antitrust Act (1890)', 'the Interstate Commerce Act (1887)', 'the Dawes Act (1887)'], why: 'The Pacific Railway Act of 1862 gave alternate sections of land beside the track and loaned government bonds for each mile built.' },
    { L: [1, 2], q: 'Which company built eastward from Sacramento, with crews made up mostly of Chinese workers?', a: 'the Central Pacific', w: ['the Union Pacific', 'the Northern Pacific', 'Standard Oil', 'the Pennsylvania Railroad'], why: 'The Central Pacific built east from Sacramento over the Sierra Nevada; Chinese workers made up most of its crews at the peak.' },
    { L: [1, 2], q: 'The Union Pacific built westward from the Missouri River. Many of its workers were…', a: 'Irish immigrants and Civil War veterans', w: ['Chinese immigrants recruited in California', 'enslaved workers', 'soldiers of the regular Army only'], why: 'The Union Pacific relied heavily on Irish immigrants and Civil War veterans; the Central Pacific on Chinese workers.' },
    { L: [2, 3], q: 'How did Congress mainly pay for the transcontinental railroad?', a: 'land grants beside the track and loans of government bonds', w: ['a new income tax', 'selling Alaska', 'nothing: private investors paid for all of it', 'tariffs on Chinese goods'], why: 'Congress granted alternate sections of public land along the route and loaned government bonds per mile, more in the mountains.' },
    { L: [2, 3], q: 'Which scandal, exposed in 1872, showed Union Pacific insiders overcharging for construction and giving shares to members of Congress?', a: 'Crédit Mobilier', w: ['Teapot Dome', 'Watergate', 'the Whiskey Ring', 'Tammany Hall'], why: 'The Crédit Mobilier construction company let Union Pacific insiders overcharge; shares went to members of Congress. Teapot Dome (1920s) and Watergate (1970s) came later.' },
    { L: [2, 3], q: 'In 1883 the railroads changed how Americans kept time. What did they set up?', a: 'four standard time zones', w: ['daylight saving time', 'the 24-hour clock', 'a single national time'], why: 'On November 18, 1883, U.S. and Canadian railroads adopted four time zones: Eastern, Central, Mountain and Pacific.' },
    { L: [3], q: 'Private companies built the first transcontinental railroad without help from the federal government.', tf: false, why: 'False: Congress gave the companies millions of acres and tens of millions of dollars in government bonds.' },
    { L: [3], q: 'Chinese workers appeared prominently in the famous photographs of the golden spike ceremony.', tf: false, why: 'False: though they did much of the Central Pacific\'s hardest work, Chinese workers were left out of the famous photographs.' },
    { L: [3], q: 'About the first transcontinental railroad:', all: [['It was finished in 1869.', true], ['Congress gave land grants and loans.', true], ['The Central Pacific built from Sacramento.', true], ['It ran from New York to Los Angeles.', false]], why: 'Finished in 1869 at Promontory Summit; the Central Pacific built from Sacramento and the Union Pacific from Omaha, with federal land and loans.' },
    { L: [2, 3], q: 'Which effect did the transcontinental railroad have on the Great Plains?', a: 'It brought settlers, hunters and markets, speeding the loss of Native lands and the bison.', w: ['It kept settlers out of the Plains.', 'It ended farming on the Plains.', 'It had little effect until the 1920s.'], why: 'Cheap transport drew settlers and hunters, carried hides east and crops to market, and pressed Native nations off their lands.' },
    { L: [2, 3], ord: WEST_EVENTS.slice(0, 9) }
  ]));

  G('ush2.plains-wars', bank([
    { L: [1, 2], q: 'Which battle in 1876 was a victory for Lakota and Cheyenne warriors over Custer\'s Seventh Cavalry?', a: 'the Little Bighorn', w: ['Wounded Knee', 'Sand Creek', 'Gettysburg', 'San Juan Hill'], why: 'At the Little Bighorn (June 1876), warriors led by Sitting Bull and Crazy Horse defeated Custer\'s Seventh Cavalry.' },
    { L: [1, 2, 3], q: 'In what year did the Battle of the Little Bighorn take place?', year: 1876, why: 'June 25 and 26, 1876, in Montana Territory.' },
    { L: [1, 2, 3], q: 'In what year did soldiers kill about 250 or more Lakota people at Wounded Knee, South Dakota?', year: 1890, why: 'December 29, 1890, during an attempt to disarm a Lakota band.' },
    { L: [1, 2], q: 'Which animal\'s near-destruction cost the Plains nations their main source of food, clothing and shelter?', a: 'the bison', w: ['the horse', 'the wolf', 'the beaver'], why: 'Tens of millions of bison were shot for hides and sport until fewer than about 1,000 were left by 1889.' },
    { L: [2, 3], q: 'What broke the promise of the Treaty of Fort Laramie (1868) that the Black Hills belonged to the Lakota?', a: 'the discovery of gold there in 1874 and the rush of miners', w: ['the Louisiana Purchase', 'the Dawes Act', 'the building of the Panama Canal'], why: 'After gold was found in 1874, miners poured in and the government tried to buy or take the Black Hills, leading to the war of 1876.' },
    { L: [2, 3], q: 'At Sand Creek (1864), Colorado volunteer cavalry attacked a camp of which peoples?', a: 'Cheyenne and Arapaho', w: ['Nez Perce', 'Apache', 'Cherokee', 'Seminole'], why: 'Colonel John Chivington\'s troops attacked a Cheyenne and Arapaho camp that believed it was under the Army\'s protection.' },
    { L: [2, 3], q: 'Which leaders led the Lakota and Cheyenne at the Little Bighorn?', a: 'Sitting Bull and Crazy Horse', w: ['Geronimo and Cochise', 'Tecumseh and Sequoyah', 'Chief Joseph and Looking Glass'], why: 'Sitting Bull, a spiritual leader, and Crazy Horse, a war leader, led the camp that defeated Custer.' },
    { L: [2, 3], q: 'Which leader surrendered in 1886, ending the Apache wars in the Southwest?', a: 'Geronimo', w: ['Sitting Bull', 'Chief Joseph', 'Crazy Horse'], why: 'Geronimo surrendered in 1886. Chief Joseph of the Nez Perce surrendered in 1877.' },
    { L: [2, 3], q: 'What mainly decided the outcome of the wars on the Plains?', a: 'the loss of the bison, disease, and the Army\'s numbers and supplies', w: ['the Plains nations lost every battle', 'a single battle in 1876', 'a treaty that the nations asked for'], why: 'Native forces won some battles, but the destruction of the bison, disease, and the Army\'s railroads and reinforcements decided it.' },
    { L: [3], q: 'The Plains nations never defeated the U.S. Army in a major battle.', tf: false, why: 'False: the Little Bighorn (1876) was a major Lakota and Cheyenne victory.' },
    { L: [3], q: 'By 1890 most Plains nations had been confined to reservations.', tf: true, why: 'True: by the time of Wounded Knee, most nations lived on reservations.' },
    { L: [3], q: 'About the wars on the Plains:', all: [['Sand Creek came before the Little Bighorn.', true], ['Gold in the Black Hills raised the conflict with the Lakota.', true], ['Wounded Knee took place in 1890.', true], ['The bison herds grew larger in the 1880s.', false]], why: 'Sand Creek 1864, gold 1874, Little Bighorn 1876, Wounded Knee 1890; the bison were nearly wiped out by 1889.' },
    { L: [1, 2, 3], ord: WEST_EVENTS.slice(1, 12), q: 'Put these events of the West in order, earliest first.' },
    { L: [2, 3], tl: WEST_EVENTS.slice(1, 12) }
  ]));

  G('ush2.assimilation-dawes', bank([
    { L: [1, 2, 3], q: 'In what year did Congress pass the Dawes Act?', year: 1887, why: 'The Dawes (General Allotment) Act was approved February 8, 1887.' },
    { L: [1, 2], q: 'What did the Dawes Act do?', a: 'split land held in common by a tribe into family plots and allowed the "surplus" to be sold', w: ['gave each nation more land in the West', 'ended the reservation system and returned land', 'created the first national parks'], why: 'It allotted reservation land to individuals (160 acres to a head of family) and opened the rest to sale.' },
    { L: [1, 2], q: 'Which school, founded by Richard Henry Pratt in 1879, became the model for Indian boarding schools?', a: 'the Carlisle Indian Industrial School', w: ['Tuskegee Institute', 'Hull House', 'Harvard College'], why: 'Carlisle in Pennsylvania (1879) separated children from their families, languages and cultures; many schools copied it.' },
    { L: [2, 3], q: 'About how much land did Native nations hold in 1887 and in 1934?', a: 'about 138 million acres, then about 48 million', w: ['about 48 million acres, then about 138 million', 'about 138 million acres, then about 130 million', 'about 10 million acres, then none'], why: 'Allotment and sales cut Native landholding from about 138 million acres (1887) to about 48 million (1934): about two-thirds lost.' },
    { L: [2, 3], q: 'Which law ended allotment in 1934 and let nations rebuild their own governments?', a: 'the Indian Reorganization Act', w: ['the Dawes Act', 'the Indian Citizenship Act', 'the Indian Removal Act'], why: 'The Indian Reorganization Act (1934) ended allotment. The Indian Removal Act was 1830; the Citizenship Act 1924.' },
    { L: [2, 3], q: 'Under the Dawes Act, how many acres did a head of family receive (a quarter section)?', a: '160', w: ['80', '640', '40'], why: 'A section is 640 acres; a quarter section is 160 acres. A single adult got an eighth: 80 acres.' },
    { L: [2, 3], q: 'What was the stated aim of the boarding schools?', a: 'to make Native children give up their languages and cultures and live like white Americans', w: ['to teach Native languages', 'to train tribal leaders in their own traditions', 'to bring families together'], why: 'Pratt\'s phrase was "Kill the Indian in him, and save the man": the schools aimed at assimilation.' },
    { L: [1, 2], q: 'What does "assimilation" mean in this policy?', a: 'making a group give up its own culture and adopt the majority\'s', w: ['moving a group to a new territory', 'signing a treaty of peace', 'paying for land taken'], why: 'Assimilation policy tried to make Native people abandon their languages, religions and ways of holding land.' },
    { L: [3], q: 'The Dawes Act gave Native nations more land than they had before.', tf: false, why: 'False: most of the land left Native hands; holdings fell by about two-thirds by 1934.' },
    { L: [3], q: 'Under the Dawes Act, allottees could become U.S. citizens.', tf: true, why: 'True: Section 6 made allottees citizens. The Indian Citizenship Act of 1924 later covered all Native people born in the U.S.' },
    { L: [3], q: 'About assimilation policy:', all: [['Carlisle opened in 1879.', true], ['The Dawes Act was passed in 1887.', true], ['Allotment ended in 1934.', true], ['Boarding schools taught in Native languages.', false]], why: 'Carlisle 1879, Dawes 1887, the Indian Reorganization Act 1934; schools punished children for speaking their own languages.' },
    { L: [2, 3], gen: function (R) { var a = R.pick([[138, 48], [138, 48]]); return { q: 'Native landholding fell from about ' + a[0] + ' million acres to about ' + a[1] + ' million. How many million acres were lost?', a: String(a[0] - a[1]), w: [String(a[0] + a[1]), String(a[1]), '100', '60'], why: a[0] + ' − ' + a[1] + ' = ' + (a[0] - a[1]) + ' million acres, about two-thirds.' }; } },
    { L: [1, 2, 3], ord: [[1879, 'Carlisle Indian Industrial School opens'], [1887, 'Dawes Act'], [1890, 'Wounded Knee'], [1924, 'Indian Citizenship Act'], [1934, 'Indian Reorganization Act'], [1868, 'Treaty of Fort Laramie']] }
  ]));

  var INTEG = [['A steel company buys the iron mines that supply it.', 0], ['An oil refiner buys its rival refineries.', 1], ['A meatpacker buys ranches, rail cars and butcher shops.', 0], ['Forty oil companies put their stock in one trust.', 1],
    ['A steel maker buys the coal fields and ore ships it uses.', 0], ['A railroad buys the competing line on the same route.', 1], ['A sugar refiner buys most of the other sugar refiners.', 1], ['A lumber company buys forests, sawmills and lumber yards.', 0]];
  G('ush2.industrialization', bank([
    { L: [1, 2, 3], gen: sortGen(['vertical integration', 'horizontal integration'], INTEG, 'Which kind of growth is this?') },
    { L: [1, 2], q: 'Which industry did Andrew Carnegie lead?', a: 'steel', w: ['oil', 'banking', 'railroads only', 'meatpacking'], why: 'Carnegie built Carnegie Steel, sold to J. P. Morgan in 1901 to form U.S. Steel.' },
    { L: [1, 2], q: 'Which industry did John D. Rockefeller\'s Standard Oil dominate?', a: 'oil refining', w: ['steel', 'electric power', 'the telephone'], why: 'Standard Oil controlled most American oil refining, held together by a trust from 1882.' },
    { L: [1, 2, 3], q: 'In what year did Congress pass the Sherman Antitrust Act?', year: 1890, why: 'The Sherman Antitrust Act (July 2, 1890) outlawed combinations in restraint of trade.' },
    { L: [2, 3], q: 'What did the Sherman Antitrust Act outlaw?', a: 'contracts and combinations in restraint of trade, and monopolizing', w: ['labor unions only', 'all large companies', 'the income tax', 'railroad land grants'], why: 'Section 1 outlawed combinations in restraint of trade; Section 2 outlawed monopolizing.' },
    { L: [2, 3], q: 'Which process made steel cheap enough to build railroads and skyscrapers?', a: 'the Bessemer process', w: ['the assembly line', 'the cotton gin', 'vulcanization'], why: 'The Bessemer process blew air through molten iron to make steel in large amounts.' },
    { L: [2, 3], q: 'In United States v. E. C. Knight Co. (1895), the Supreme Court weakened the Sherman Act by holding that…', a: 'manufacturing was not commerce', w: ['unions were monopolies', 'the act was unconstitutional', 'railroads could not be regulated'], why: 'The Court held that a sugar refining combination was manufacturing, not interstate commerce.' },
    { L: [2, 3], q: 'Which banker bought Carnegie Steel in 1901 to form U.S. Steel?', a: 'J. P. Morgan', w: ['John D. Rockefeller', 'Cornelius Vanderbilt', 'Jay Gould'], why: 'J. P. Morgan organized U.S. Steel in 1901, the first company worth over a billion dollars.' },
    { L: [2, 3], q: 'A critic calls the industrial leaders "robber barons." What does a defender call them?', a: '"captains of industry"', w: ['"muckrakers"', '"Populists"', '"carpetbaggers"'], why: 'Critics stressed crushed rivals and workers; defenders stressed the economy they built and their gifts. Historians weigh both.' },
    { L: [3], q: 'Vertical integration means buying up your competitors.', tf: false, why: 'False: that is horizontal integration. Vertical means owning each stage of making one product.' },
    { L: [3], q: 'Thomas Edison\'s practical light bulb came in 1879, and Bell patented the telephone in 1876.', tf: true, why: 'True: Bell\'s patent was 1876; Edison\'s bulb 1879.' },
    { L: [3], q: 'About big business in the Gilded Age:', all: [['Standard Oil used a trust to control rival refineries.', true], ['Carnegie owned mines, ships and mills.', true], ['The Sherman Act was strongly enforced against business from the start.', false], ['Railroads created a national market.', true]], why: 'Trusts and integration built giant firms; the Sherman Act was weak at first (E. C. Knight, 1895).' }
  ]));

  G('ush2.labor-movement', bank([
    { L: [1, 2], q: 'Which union, led by Samuel Gompers from 1886, organized skilled workers in craft unions?', a: 'the American Federation of Labor', w: ['the Knights of Labor', 'the Grange', 'the American Railway Union'], why: 'The AFL (1886) was a federation of craft unions focused on wages, hours and conditions.' },
    { L: [1, 2], q: 'Which union welcomed skilled and unskilled workers, including women and Black workers?', a: 'the Knights of Labor', w: ['the American Federation of Labor', 'the Pinkertons', 'Tammany Hall'], why: 'The Knights of Labor (1869) was open to nearly all workers and grew fast in the 1880s.' },
    { L: [1, 2, 3], q: 'In what year did the Haymarket affair take place in Chicago?', year: 1886, why: 'May 4, 1886, at a rally for the eight-hour day.' },
    { L: [2, 3], q: 'At the Homestead strike (1892), Carnegie Steel\'s manager hired armed guards from which agency?', a: 'the Pinkerton agency', w: ['the FBI', 'the Texas Rangers', 'the Knights of Labor'], why: 'Henry Clay Frick hired Pinkerton guards; a gun battle followed, and the state militia took over the town.' },
    { L: [2, 3], q: 'Who led the American Railway Union in the Pullman strike of 1894?', a: 'Eugene V. Debs', w: ['Samuel Gompers', 'Terence Powderly', 'Henry Clay Frick'], why: 'Debs led the boycott of trains with Pullman cars; he was jailed after the federal injunction.' },
    { L: [2, 3], q: 'How did the federal government respond to the Pullman strike?', a: 'a court injunction against the strike and federal troops', w: ['a law giving workers the eight-hour day', 'a minimum wage', 'it stayed out of the strike'], why: 'A federal court issued an injunction (using the Sherman Act), and President Cleveland sent troops.' },
    { L: [2, 3], q: 'What effect did the Haymarket bombing have on the labor movement?', a: 'the public blamed unions, and the Knights of Labor declined', w: ['Congress passed the eight-hour day', 'the AFL was outlawed', 'unions grew rapidly'], why: 'Many Americans linked unions to the anarchists accused of the bombing; the Knights lost members.' },
    { L: [2, 3], q: 'What is an injunction?', a: 'a court order to stop doing something', w: ['a vote to go on strike', 'a tax on imports', 'a contract between union and company'], why: 'Courts issued injunctions ordering strikers to stop; breaking one meant jail.' },
    { L: [3], q: 'In the big strikes of the 1870s to 1890s, the government usually sided with the strikers.', tf: false, why: 'False: courts issued injunctions and troops were sent, mostly against strikers.' },
    { L: [3], q: 'About labor in the Gilded Age:', all: [['The AFL focused on skilled workers.', true], ['Workers often worked ten to twelve hours a day.', true], ['The Pullman strike was broken with federal troops.', true], ['The Wagner Act protected unions in the 1880s.', false]], why: 'The Wagner Act came in 1935; in the Gilded Age unions had little legal protection.' },
    { L: [1, 2, 3], ord: GILDED_EVENTS.filter(function (e) { return /Knights|Railroad Strike|Haymarket|Homestead|Pullman|Sherman|Garfield/.test(e[1]); }) },
    { L: [2, 3], tl: [[1869, 'Knights of Labor founded'], [1877, 'Great Railroad Strike'], [1886, 'Haymarket affair'], [1892, 'Homestead strike'], [1894, 'Pullman strike']] }
  ]));

  var PUSHPULL = [['poor harvests at home', 0], ['a relative\'s letter about jobs', 1], ['attacks on Jewish communities in Russia', 0], ['factory jobs in American cities', 1], ['high taxes and no land to farm', 0], ['religious freedom in the United States', 1], ['a shortage of work at home', 0], ['cheap land offered on the Plains', 1]];
  G('ush2.new-immigration', bank([
    { L: [1, 2, 3], gen: sortGen(['a push factor', 'a pull factor'], PUSHPULL, 'For an immigrant around 1900, is this a push factor or a pull factor?') },
    { L: [1, 2], q: 'From the 1880s, where did most new immigrants come from?', a: 'southern and eastern Europe', w: ['Ireland and Germany', 'China and Japan', 'Canada and Mexico'], why: 'Italy, Austria-Hungary, Russia and Greece sent most immigrants after 1880; earlier, Ireland and Germany led.' },
    { L: [1, 2, 3], q: 'In what year did Ellis Island open as an immigration station?', year: 1892, why: 'Ellis Island opened January 1, 1892, and processed over 12 million immigrants by 1954.' },
    { L: [1, 2], q: 'Who founded Hull House in Chicago in 1889?', a: 'Jane Addams and Ellen Gates Starr', w: ['Jacob Riis', 'Boss Tweed', 'Susan B. Anthony'], why: 'Hull House was a settlement house offering classes, child care and help to immigrant neighbors.' },
    { L: [2, 3], q: 'Which 1882 law was the first to bar a group of immigrants by nationality?', a: 'the Chinese Exclusion Act', w: ['the Immigration Act of 1924', 'the Pendleton Act', 'the Dawes Act'], why: 'The Chinese Exclusion Act (1882) barred most Chinese laborers; it was repealed in 1943.' },
    { L: [2, 3], q: 'What did a political machine such as Tammany Hall trade for votes?', a: 'jobs, favors and help for poor families', w: ['free land in the West', 'citizenship tests', 'nothing: machines did not seek votes'], why: 'Machines helped newcomers with jobs, coal and the law in return for votes; leaders like Boss Tweed also stole public money.' },
    { L: [2, 3], q: 'Who photographed New York\'s tenements in How the Other Half Lives (1890)?', a: 'Jacob Riis', w: ['Upton Sinclair', 'Ida Tarbell', 'Thomas Nast'], why: 'Jacob Riis\'s photographs showed crowded, dark tenements.' },
    { L: [2, 3], q: 'What is nativism?', a: 'hostility to immigrants and favoring native-born people', w: ['respect for Native nations\' treaties', 'a love of nature', 'support for more immigration'], why: 'Nativists feared newcomers would take jobs or change the culture.' },
    { L: [2, 3], q: 'Angel Island, opened in 1910, was the main immigration station for which coast?', a: 'the West Coast (San Francisco Bay)', w: ['the East Coast (New York)', 'the Gulf Coast (New Orleans)', 'the Great Lakes'], why: 'Angel Island in San Francisco Bay processed immigrants from Asia, where Chinese immigrants faced long detentions.' },
    { L: [3], q: 'Ellis Island officials routinely changed immigrants\' last names.', tf: false, why: 'False: inspectors used ships\' lists made at departure; most name changes came later, by the immigrants themselves.' },
    { L: [3], q: 'About cities and immigration around 1890:', all: [['Settlement houses offered English classes.', true], ['Tenements were crowded and often unsafe.', true], ['The Chinese Exclusion Act was repealed in 1882.', false], ['Most new immigrants came through New York.', true]], why: 'The Chinese Exclusion Act was passed in 1882 and repealed in 1943.' },
    { L: [1, 2, 3], ord: [[1882, 'Chinese Exclusion Act'], [1886, 'Statue of Liberty dedicated'], [1889, 'Hull House opens'], [1890, 'How the Other Half Lives'], [1892, 'Ellis Island opens'], [1910, 'Angel Island opens'], [1943, 'Chinese Exclusion Act repealed']] }
  ]));

  G('ush2.gilded-age-politics', bank([
    { L: [1, 2], q: 'Which 1883 law began hiring some federal workers by merit exams instead of the spoils system?', a: 'the Pendleton Act', w: ['the Interstate Commerce Act', 'the Sherman Antitrust Act', 'the Dawes Act'], why: 'After Garfield\'s assassination by a disappointed office seeker, the Pendleton Act (1883) created a merit-based civil service.' },
    { L: [1, 2], q: 'Who won the presidential election of 1896?', a: 'William McKinley', w: ['William Jennings Bryan', 'Grover Cleveland', 'James Weaver'], why: 'McKinley (gold standard) beat Bryan (free silver), 271 electoral votes to 176.' },
    { L: [1, 2, 3], q: 'In what year was the Interstate Commerce Act passed to regulate railroads?', year: 1887, why: 'Signed February 4, 1887; it created the Interstate Commerce Commission.' },
    { L: [2, 3], q: 'Why did indebted farmers want the free coinage of silver?', a: 'more money in circulation would raise prices and make debts easier to repay', w: ['silver coins were prettier than gold', 'it would lower crop prices', 'banks demanded it'], why: 'More money tends to raise prices; a fixed debt then takes fewer bushels to repay. Creditors favored gold.' },
    { L: [2, 3], q: 'Which of these was a demand of the Populists\' Omaha Platform (1892)?', a: 'a graduated income tax', w: ['the gold standard', 'higher tariffs on farm tools', 'ending the secret ballot'], why: 'The Omaha Platform called for free silver, a graduated income tax, direct election of senators and government ownership of railroads.' },
    { L: [2, 3], q: '"You shall not crucify mankind upon a cross of gold." Who said it, and what did he oppose?', a: 'William Jennings Bryan, opposing the gold standard', w: ['William McKinley, opposing free silver', 'Andrew Carnegie, opposing unions', 'Eugene Debs, opposing the railroads'], why: 'Bryan spoke at the Democratic convention in July 1896 against the gold standard.', viz: docViz('A speech, 1896', 'Democratic National Convention, Chicago (public domain)', 'You shall not press down upon the brow of labor this crown of thorns, you shall not crucify mankind upon a cross of gold.') },
    { L: [2, 3], q: 'What was the spoils system?', a: 'giving government jobs to the winning party\'s supporters', w: ['dividing land among settlers', 'taxing imported goods', 'selling public land to railroads'], why: '"To the victor belong the spoils": jobs as rewards for party work.' },
    { L: [2, 3], q: 'The Interstate Commerce Act created the first federal agency of what kind?', a: 'an independent regulatory commission', w: ['a central bank', 'a cabinet department', 'a federal police force'], why: 'The Interstate Commerce Commission (1887) was the first independent federal regulatory agency.' },
    { L: [2, 3], q: 'Which group formed the base of the People\'s (Populist) Party?', a: 'struggling farmers in the South and West', w: ['Northeastern bankers', 'factory owners', 'new immigrants in Boston'], why: 'Farmers hurt by falling prices, high rail rates and debt built the Grange, the Alliances and the Populist Party.' },
    { L: [3], q: 'Bryan won the election of 1896 because the South and West voted for him.', tf: false, why: 'False: Bryan carried the South and most of the West but lost; McKinley won 271 to 176.' },
    { L: [3], q: 'About Gilded Age politics:', all: [['Garfield was assassinated in 1881.', true], ['The Pendleton Act came in 1883.', true], ['The Populists formed a party in 1892.', true], ['Bryan stood for the gold standard.', false]], why: 'Bryan stood for free silver; McKinley for gold.' },
    { L: [2, 3], gen: function (R) { var t = R.pick([['McKinley', 271], ['Bryan', 176]]); return { q: 'In 1896 there were 447 electoral votes. ' + (t[0] === 'McKinley' ? 'Bryan won 176. How many did McKinley win?' : 'McKinley won 271. How many did Bryan win?'), a: String(t[1]), w: [String(447 - t[1] + 10), String(t[1] - 20), '270', '224'], why: '447 − ' + (447 - t[1]) + ' = ' + t[1] + '.' }; } },
    { L: [1, 2, 3], ord: GILDED_EVENTS.filter(function (e) { return /Garfield|Pendleton|Interstate|Sherman|McKinley|Ellis/.test(e[1]); }).concat([[1892, 'Omaha Platform']]).filter(function (e, i, a) { return a.map(function (x) { return x[0]; }).indexOf(e[0]) === i; }) }
  ]));

  G('ush2.jim-crow-plessy', bank([
    { L: [1, 2], q: 'In Plessy v. Ferguson (1896), what did the Supreme Court decide?', a: 'state-required "separate but equal" facilities were constitutional', w: ['segregated schools were unconstitutional', 'poll taxes were unconstitutional', 'the Fifteenth Amendment was repealed'], why: 'The Court upheld Louisiana\'s separate railway car law, 7 to 1.', viz: caseViz('plessy', { hide: ['name', 'holding'] }) },
    { L: [1, 2, 3], q: 'In what year was Plessy v. Ferguson decided?', year: 1896, why: 'May 18, 1896.' },
    { L: [1, 2], q: 'Which justice dissented in Plessy, writing "Our constitution is color-blind"?', a: 'John Marshall Harlan', w: ['Henry Billings Brown', 'Earl Warren', 'John Marshall'], why: 'Justice Harlan was the lone dissenter; Justice Brown wrote for the majority. John Marshall was Chief Justice decades earlier.' },
    { L: [2, 3], q: 'What was the vote in Plessy v. Ferguson?', a: '7 to 1', w: ['9 to 0', '5 to 4', '6 to 3'], why: 'Seven justices upheld the law; Harlan dissented; one justice did not take part.' },
    { L: [1, 2, 3], gen: sortGen(['a poll tax', 'a literacy test', 'a grandfather clause'], [['A voter must pay a fee before voting.', 0], ['A voter must read and explain part of the state constitution.', 1], ['Men whose grandfathers could vote before 1867 are excused from the new rules.', 2], ['A clerk decides who "understands" a passage well enough.', 1], ['A yearly charge, often owed for back years too.', 0]], 'Which voting barrier is described?') },
    { L: [2, 3], q: 'The poll tax, literacy test and grandfather clause were designed to get around which amendment?', a: 'the Fifteenth', w: ['the Thirteenth', 'the Nineteenth', 'the First'], why: 'The Fifteenth Amendment forbids denying the vote on account of race; the devices avoided naming race.' },
    { L: [2, 3], q: 'Which journalist investigated lynchings and published Southern Horrors (1892)?', a: 'Ida B. Wells', w: ['Ida Tarbell', 'Jane Addams', 'Harriet Beecher Stowe'], why: 'After three Black grocers were lynched in Memphis, Ida B. Wells documented lynchings across the South.' },
    { L: [2, 3], q: 'Which case overturned "separate but equal" for public schools?', a: 'Brown v. Board of Education (1954)', w: ['Dred Scott v. Sandford (1857)', 'Marbury v. Madison (1803)', 'Korematsu v. United States (1944)'], why: 'Brown (1954) held that separate educational facilities are inherently unequal.' },
    { L: [2, 3], q: 'What was the law challenged in Plessy?', a: 'a Louisiana law requiring separate railway cars', w: ['a Kansas law on segregated schools', 'a federal law on voting', 'a Mississippi poll tax'], why: 'Louisiana\'s Separate Car Act of 1890; Homer Plessy\'s arrest was a planned test case.' },
    { L: [3], q: 'Under Plessy, the facilities for Black citizens were in practice equal to those for white citizens.', tf: false, why: 'False: they were almost always worse, and courts rarely checked.' },
    { L: [3], q: 'The Supreme Court struck down grandfather clauses in 1915.', tf: true, why: 'True: Guinn v. United States (1915). Poll taxes and literacy tests lasted into the 1960s.' },
    { L: [3], q: 'About Jim Crow:', all: [['Plessy was decided 7 to 1.', true], ['Harlan dissented.', true], ['Literacy tests were applied unequally.', true], ['Plessy struck down segregation.', false]], why: 'Plessy upheld segregation; Harlan was the dissent.' },
    { L: [2, 3], ord: [[1868, 'Fourteenth Amendment ratified'], [1870, 'Fifteenth Amendment ratified'], [1877, 'Reconstruction ends'], [1892, 'Southern Horrors published'], [1896, 'Plessy v. Ferguson'], [1915, 'Grandfather clauses struck down'], [1954, 'Brown v. Board of Education']] }
  ]));

  G('ush2.gilded-age-ideas', bank([
    { L: [1, 2, 3], gen: sortGen(['the Gospel of Wealth', 'Social Darwinism', 'the Social Gospel'], [['The rich should give their fortunes away wisely in their lifetimes.', 0], ['Competition sorts the fit from the unfit, so government should not help the poor.', 1], ['Christians should reform slums, child labor and unsafe work.', 2], ['"The man who dies thus rich dies disgraced."', 0], ['Regulating business holds society back.', 1], ['Faith calls for fixing the causes of poverty.', 2]], 'Which idea does this statement express?') },
    { L: [1, 2], q: 'Who wrote "Wealth" (1889), later called "The Gospel of Wealth"?', a: 'Andrew Carnegie', w: ['John D. Rockefeller', 'Herbert Spencer', 'Upton Sinclair'], why: 'Carnegie argued the rich should give their fortunes to public goods; he funded thousands of libraries.' },
    { L: [1, 2], q: 'Which leader stressed vocational training and economic progress first, in his Atlanta speech of 1895?', a: 'Booker T. Washington', w: ['W. E. B. Du Bois', 'Ida B. Wells', 'Frederick Douglass'], why: 'Washington, head of Tuskegee Institute, urged skills and economic strength first.' },
    { L: [1, 2], q: 'Which leader demanded full civil and political rights and higher education now?', a: 'W. E. B. Du Bois', w: ['Booker T. Washington', 'Andrew Carnegie', 'William Graham Sumner'], why: 'Du Bois wrote The Souls of Black Folk (1903) and helped found the Niagara Movement and the NAACP.' },
    { L: [2, 3], q: '"The problem of the Twentieth Century is the problem of the color-line." Who wrote it?', a: 'W. E. B. Du Bois', w: ['Booker T. Washington', 'Justice Harlan', 'Jane Addams'], why: 'Du Bois, in "The Forethought" to The Souls of Black Folk (1903).', viz: docViz('A book, 1903', '"The Forethought" (public domain)', 'for the problem of the Twentieth Century is the problem of the color-line.') },
    { L: [2, 3], q: 'Which thinkers are linked with Social Darwinism?', a: 'Herbert Spencer and William Graham Sumner', w: ['Washington Gladden and Walter Rauschenbusch', 'Jane Addams and Ellen Gates Starr', 'Booker T. Washington and Du Bois'], why: 'Spencer and Sumner applied "survival of the fittest" to society. Gladden and Rauschenbusch led the Social Gospel.' },
    { L: [2, 3], q: 'What was the "Talented Tenth"?', a: 'Du Bois\'s idea of college-educated leaders who would lead Black Americans', w: ['Washington\'s plan for trade schools', 'a tax on the richest tenth', 'a Populist demand'], why: 'Du Bois argued that higher education for leaders was essential.' },
    { L: [2, 3], q: 'Which movement did Du Bois help found in 1905?', a: 'the Niagara Movement', w: ['the Social Gospel', 'the Grange', 'the Knights of Labor'], why: 'The Niagara Movement (1905) demanded full rights; many of its members joined the NAACP (1909).' },
    { L: [3], q: 'Washington and Du Bois agreed on how Black Americans should advance.', tf: false, why: 'False: they shared the goal but split on strategy: skills and economic progress first (Washington) versus full rights and higher education now (Du Bois).' },
    { L: [3], q: 'Social Darwinists generally opposed laws regulating business.', tf: true, why: 'True: they saw competition as natural and regulation as harmful.' },
    { L: [3], q: 'About ideas of the Gilded Age:', all: [['Carnegie wrote about the duties of wealth.', true], ['The Social Gospel called for reform.', true], ['Du Bois wrote The Souls of Black Folk.', true], ['Booker T. Washington founded the NAACP alone.', false]], why: 'The NAACP (1909) was founded by a group including Du Bois.' },
    { L: [2, 3], ord: [[1879, 'Henry George\'s Progress and Poverty'], [1881, 'Tuskegee Institute opens'], [1889, 'Carnegie\'s "Wealth"'], [1895, 'Washington\'s Atlanta speech'], [1903, 'The Souls of Black Folk'], [1905, 'The Niagara Movement'], [1909, 'NAACP founded']] }
  ]));

  /* ================= Unit 2: Empire and the Progressive Era ================= */
  var EMPIRE_EVENTS = [[1893, 'Hawaiian queen Liliuokalani overthrown'], [1898, 'Spanish-American War'], [1899, 'Open Door notes'], [1902, 'Philippine-American War ends'],
    [1903, 'Panama independence and canal treaty'], [1904, 'Roosevelt Corollary'], [1912, 'Marines sent to Nicaragua'], [1914, 'Panama Canal opens'], [1916, 'Expedition into northern Mexico'], [1959, 'Hawaii becomes a state']];
  var PROG_EVENTS = [[1890, 'How the Other Half Lives'], [1904, 'Tarbell\'s History of the Standard Oil Company'], [1906, 'The Jungle; Pure Food and Drug Act'], [1911, 'Triangle Shirtwaist fire; Standard Oil broken up'],
    [1912, 'Wilson wins a four-way election'], [1913, 'Federal Reserve Act'], [1914, 'Clayton Antitrust Act'], [1919, 'Eighteenth Amendment ratified'], [1920, 'Nineteenth Amendment ratified']];
  var WWI_EVENTS = [[1914, 'War begins in Europe'], [1915, 'Lusitania sunk'], [1916, 'Wilson reelected'], [1917, 'U.S. declares war on Germany'], [1918, 'Armistice ends the fighting'], [1919, 'Treaty of Versailles signed'], [1921, 'U.S. makes a separate peace with Germany']];

  G('ush2.american-empire', bank([
    { L: [1, 2], q: 'Which three places did the United States gain from Spain in the Treaty of Paris (1898)?', a: 'Puerto Rico, Guam and the Philippines', w: ['Cuba, Hawaii and Alaska', 'Hawaii, Samoa and Guam', 'Panama, Cuba and Puerto Rico'], why: 'Spain ceded Puerto Rico and Guam and sold the Philippines for \\$20 million; Cuba became independent. Hawaii was annexed separately.' },
    { L: [1, 2, 3], q: 'In what year was the Spanish-American War fought?', year: 1898, why: 'From April to August 1898; the Treaty of Paris was signed in December 1898.' },
    { L: [1, 2], q: 'Who was the Hawaiian queen overthrown in 1893 by American planters and businessmen backed by U.S. Marines?', a: 'Liliuokalani', w: ['Kaahumanu', 'Victoria', 'Isabella'], why: 'Queen Liliuokalani was overthrown January 17, 1893; the U.S. annexed Hawaii in 1898.' },
    { L: [2, 3], q: 'Where did Commodore Dewey destroy a Spanish fleet in May 1898?', a: 'Manila Bay, in the Philippines', w: ['Havana harbor, in Cuba', 'San Juan, Puerto Rico', 'Pearl Harbor, Hawaii'], why: 'The war began over Cuba, but the first big battle was at Manila Bay in the Philippines.' },
    { L: [2, 3], q: 'What was "yellow journalism"?', a: 'sensational newspaper stories that stirred up war fever', w: ['reporting on the Panama Canal', 'newspapers printed only in Hawaii', 'careful, balanced reporting'], why: 'Papers owned by Hearst and Pulitzer printed lurid stories of Spanish cruelty in Cuba.' },
    { L: [2, 3], q: 'Who led Filipino forces in the war for independence against the United States (1899 to 1902)?', a: 'Emilio Aguinaldo', w: ['José Martí', 'Pancho Villa', 'Sun Yat-sen'], why: 'Aguinaldo had fought Spain and expected independence; the war against the U.S. followed.' },
    { L: [2, 3], q: 'What did the Anti-Imperialist League argue?', a: 'ruling other peoples without their consent broke American principles', w: ['the U.S. needed more colonies to compete', 'Hawaii should become a state at once', 'the navy should be larger'], why: 'Members such as Mark Twain and Andrew Carnegie cited the Declaration\'s consent of the governed.' },
    { L: [2, 3], q: 'Which 1901 amendment let the U.S. intervene in Cuba and keep a naval base at Guantánamo Bay?', a: 'the Platt Amendment', w: ['the Teller Amendment', 'the Roosevelt Corollary', 'the Open Door'], why: 'The Teller Amendment (1898) promised not to annex Cuba; the Platt Amendment (1901) limited Cuba\'s independence.' },
    { L: [3], q: 'The Spanish-American War was fought only in Cuba.', tf: false, why: 'False: Americans also fought in the Philippines and took Puerto Rico and Guam.' },
    { L: [3], q: 'The war against Filipino independence fighters cost far more lives than the war with Spain.', tf: true, why: 'True: over 4,200 American soldiers, more than 20,000 Filipino fighters and as many as 200,000 Filipino civilians died.' },
    { L: [3], q: 'About the new empire:', all: [['Hawaii was annexed in 1898.', true], ['The Philippines were bought for \\$20 million.', true], ['Cuba became a U.S. state.', false], ['The USS Maine exploded in Havana harbor.', true]], why: 'Cuba became independent, under the limits of the Platt Amendment.' },
    { L: [1, 2, 3], ord: EMPIRE_EVENTS }
  ]));

  G('ush2.big-stick', bank([
    { L: [1, 2, 3], gen: sortGen(['Theodore Roosevelt', 'William Howard Taft', 'Woodrow Wilson'], [['"Speak softly and carry a big stick"', 0], ['Dollar diplomacy', 1], ['Moral diplomacy', 2], ['The Roosevelt Corollary (1904)', 0], ['Sending forces to Veracruz, Mexico (1914)', 2], ['American banks lending to Caribbean governments for influence', 1], ['Backing Panama\'s independence (1903)', 0], ['The expedition into northern Mexico (1916)', 2]], 'Which president is linked with this?') },
    { L: [1, 2], q: 'What did the Open Door notes (1899) ask of the powers in China?', a: 'equal trading rights for all nations', w: ['that China close its ports', 'that the U.S. annex part of China', 'an end to all trade with China'], why: 'Secretary of State John Hay asked equal commercial access and respect for China\'s territory.' },
    { L: [1, 2, 3], q: 'In what year did the Panama Canal open?', year: 1914, why: 'The first full transit was on August 15, 1914.' },
    { L: [2, 3], q: 'What did the Roosevelt Corollary (1904) add to the Monroe Doctrine?', a: 'the U.S. would act as a police power and intervene in Latin American countries', w: ['Europe may collect debts by force in the Americas', 'the U.S. would stay out of Latin America', 'the U.S. would give up the Panama Canal'], why: 'The Monroe Doctrine warned Europe away; the Corollary claimed a U.S. right to intervene.' },
    { L: [2, 3], q: 'How did the U.S. get the land for the Panama Canal?', a: 'it backed Panama\'s independence from Colombia in 1903 and signed a treaty with the new nation', w: ['it bought the land from Spain', 'it won it in the Spanish-American War', 'Colombia\'s senate approved the first treaty'], why: 'When Colombia refused, Panamanian rebels declared independence with U.S. warships nearby.' },
    { L: [2, 3], q: 'Which president sent an expedition into Mexico after Pancho Villa\'s raid on Columbus, New Mexico (1916)?', a: 'Woodrow Wilson', w: ['Theodore Roosevelt', 'William Howard Taft', 'William McKinley'], why: 'Wilson sent General Pershing into northern Mexico from March 1916 to February 1917.' },
    { L: [2, 3], q: 'What was dollar diplomacy?', a: 'using investment and loans to gain influence abroad', w: ['printing more dollars to pay debts', 'paying other nations to stay neutral', 'a tax on imports'], why: 'Taft encouraged American banks to invest in Latin America and Asia.' },
    { L: [3], q: 'Wilson\'s "moral diplomacy" meant he never sent troops to Latin America.', tf: false, why: 'False: Wilson sent forces to Veracruz, Haiti, the Dominican Republic and northern Mexico.' },
    { L: [3], q: 'About foreign policy from 1899 to 1916:', all: [['Roosevelt backed Panama\'s independence.', true], ['Taft favored dollar diplomacy.', true], ['The Panama Canal opened in 1914.', true], ['The Monroe Doctrine was written in 1904.', false]], why: 'The Monroe Doctrine dates to 1823; the Corollary to 1904.' },
    { L: [1, 2, 3], ord: EMPIRE_EVENTS.slice(2, 9) },
    { L: [2, 3], tl: EMPIRE_EVENTS.slice(0, 9) }
  ]));

  G('ush2.muckrakers', bank([
    { L: [1, 2, 3], gen: sortGen(['Jacob Riis', 'Ida Tarbell', 'Upton Sinclair', 'Lincoln Steffens'], [['How the Other Half Lives (1890): New York tenements', 0], ['The History of the Standard Oil Company (1904)', 1], ['The Jungle (1906): Chicago meatpacking', 2], ['The Shame of the Cities (1904): corrupt city governments', 3], ['Photographs of crowded slum rooms', 0], ['Rockefeller\'s methods of crushing rivals', 1]], 'Which muckraker is this?') },
    { L: [1, 2, 3], q: 'In what year did Congress pass the Pure Food and Drug Act and the Meat Inspection Act?', year: 1906, why: 'Both were signed on June 30, 1906, months after The Jungle appeared.' },
    { L: [1, 2], q: 'Which book led to the Meat Inspection Act of 1906?', a: 'The Jungle', w: ['How the Other Half Lives', 'Uncle Tom\'s Cabin', 'The Souls of Black Folk'], why: 'Upton Sinclair\'s The Jungle (1906) described the Chicago meatpacking plants.' },
    { L: [2, 3], q: 'What did Upton Sinclair mainly intend The Jungle to show?', a: 'the hard lives of immigrant workers (and the case for socialism)', w: ['how to make food safe at home', 'the benefits of big business', 'life on a Western ranch'], why: '"I aimed at the public\'s heart, and by accident I hit it in the stomach." Readers reacted most to the meat.' },
    { L: [2, 3], q: 'Who gave the muckrakers their name, in a 1906 speech?', a: 'Theodore Roosevelt', w: ['Upton Sinclair', 'Woodrow Wilson', 'William Randolph Hearst'], why: 'Roosevelt compared reporters who saw only filth to a man raking muck; the writers took the name with pride.' },
    { L: [2, 3], q: 'The Triangle Shirtwaist fire (1911) killed 146 workers in New York. What followed?', a: 'New York passed many new factory safety laws', w: ['Congress banned all factories in cities', 'nothing changed', 'the company was given a federal award'], why: 'One exit door had been locked; New York passed dozens of factory safety laws in the following years.' },
    { L: [2, 3], q: 'What did Progressive reformers generally believe?', a: 'facts, experts and government action could fix the problems of industrial life', w: ['government should never regulate business', 'cities should be abandoned', 'only private charity could help'], why: 'Progressives trusted investigation, expertise and laws to address slums, unsafe work and corruption.' },
    { L: [3], q: 'The muckrakers were elected officials who wrote laws.', tf: false, why: 'False: they were writers and journalists whose facts pushed officials to act.' },
    { L: [3], q: 'About the muckrakers:', all: [['Ida Tarbell investigated Standard Oil.', true], ['Jacob Riis photographed tenements.', true], ['The Jungle led to the Meat Inspection Act.', true], ['Sinclair wrote mainly to praise the meatpackers.', false]], why: 'Sinclair wrote to show workers\' lives; the public reacted to the food.' },
    { L: [1, 2, 3], ord: PROG_EVENTS.slice(0, 6) }
  ]));

  G('ush2.progressive-presidents', bank([
    { L: [1, 2, 3], gen: sortGen(['Theodore Roosevelt', 'William Howard Taft', 'Woodrow Wilson'], [['the Square Deal', 0], ['the Federal Reserve Act (1913)', 2], ['the breakup of Standard Oil (1911)', 1], ['the Clayton Antitrust Act (1914)', 2], ['the Northern Securities suit', 0], ['the New Freedom', 2], ['protecting about 230 million acres of public land', 0], ['about 90 antitrust suits in one term', 1], ['the Federal Trade Commission Act (1914)', 2]], 'Which president is linked with this?') },
    { L: [1, 2, 3], q: 'In what year did Wilson sign the Federal Reserve Act?', year: 1913, why: 'December 23, 1913.' },
    { L: [2, 3], q: 'Who won the election of 1912?', a: 'Woodrow Wilson', w: ['Theodore Roosevelt', 'William Howard Taft', 'Eugene Debs'], why: 'With Republicans split between Taft and Roosevelt\'s Progressive party, Wilson won 435 electoral votes.' },
    { L: [2, 3], q: 'What was Roosevelt\'s "New Nationalism" in 1912?', a: 'accept big business but regulate it with a strong federal government', w: ['break up all large firms', 'end all federal regulation', 'nationalize the railroads'], why: 'Wilson\'s New Freedom instead aimed to restore competition among smaller firms.' },
    { L: [2, 3], q: 'How did Roosevelt treat trusts?', a: 'he sorted "good" trusts from "bad" ones, regulating most and suing some', w: ['he broke up every large company', 'he never sued a trust', 'he made trusts illegal by executive order'], why: 'He judged trusts by conduct, not size, and preferred regulation; he sued Northern Securities.' },
    { L: [2, 3], gen: function (R) { var x = R.pick([['Wilson', 435], ['Roosevelt', 88], ['Taft', 8]]); return { q: 'In the election of 1912, how many electoral votes did ' + x[0] + ' win?', a: String(x[1]), w: ['435', '88', '8', '266', '0'].filter(function (v) { return v !== String(x[1]); }), why: 'Wilson 435, Roosevelt 88, Taft 8; Debs won no electoral votes but about 6 percent of the popular vote.' }; } },
    { L: [3], q: 'Taft filed more antitrust suits than Roosevelt did.', tf: true, why: 'True: about 90 under Taft in four years, 44 under Roosevelt in seven and a half.' },
    { L: [3], q: 'Theodore Roosevelt opposed all big business.', tf: false, why: 'False: he distinguished good trusts from bad and preferred regulating most.' },
    { L: [3], q: 'About the Progressive presidents:', all: [['Wilson signed the Clayton Act.', true], ['Roosevelt ran on a third-party ticket in 1912.', true], ['Taft created the Federal Reserve.', false], ['Wilson\'s administration segregated several federal departments.', true]], why: 'Wilson signed the Federal Reserve Act; his administration also segregated federal offices.' },
    { L: [1, 2, 3], ord: [[1901, 'Roosevelt becomes President'], [1904, 'Northern Securities decision'], [1906, 'Hepburn Act and food laws'], [1909, 'Taft becomes President'], [1911, 'Standard Oil broken up'], [1912, 'Four-way election won by Wilson'], [1913, 'Federal Reserve Act'], [1914, 'Clayton Act and FTC Act']] }
  ]));

  var DIRECT = [['Voters petition to put their own law on the ballot and pass it.', 0], ['Voters approve or reject a law the legislature passed.', 1], ['Voters petition and vote to remove a governor before the term ends.', 2], ['Party voters, not bosses, choose the party\'s nominee.', 3], ['A city puts a bond measure passed by the council to a public vote.', 1], ['Citizens collect signatures to propose a state constitutional amendment.', 0]];
  G('ush2.progressive-amendments', bank([
    { L: [1, 2, 3], gen: function (R) { var am = R.pick([['Sixteenth', 'a federal income tax'], ['Seventeenth', 'the election of senators by the voters'], ['Eighteenth', 'Prohibition of making, selling and transporting alcohol'], ['Nineteenth', 'women\'s right to vote']]); var all = ['a federal income tax', 'the election of senators by the voters', 'Prohibition of making, selling and transporting alcohol', 'women\'s right to vote', 'the repeal of Prohibition', 'two terms for Presidents']; return { q: 'What did the ' + am[0] + ' Amendment do?', a: am[1], w: all.filter(function (x) { return x !== am[1]; }), why: '16th: income tax (1913); 17th: senators elected by voters (1913); 18th: Prohibition (1919); 19th: women\'s suffrage (1920).' }; } },
    { L: [1, 2, 3], gen: function (R) { var am = R.pick([['Sixteenth', 1913], ['Seventeenth', 1913], ['Eighteenth', 1919], ['Nineteenth', 1920]]); return { q: 'In what year was the ' + am[0] + ' Amendment ratified?', year: am[1], why: '16th and 17th: 1913; 18th: 1919; 19th: 1920.' }; } },
    { L: [1, 2, 3], gen: sortGen(['the initiative', 'the referendum', 'the recall', 'the direct primary'], DIRECT, 'Which Progressive reform is this?') },
    { L: [2, 3], q: 'Before 1913, who chose U.S. senators?', a: 'state legislatures', w: ['the voters of each state', 'the House of Representatives', 'the President'], why: 'Article I, Section 3 gave the choice to state legislatures until the Seventeenth Amendment.' },
    { L: [2, 3], q: 'Which amendment repealed Prohibition in 1933?', a: 'the Twenty-first', w: ['the Nineteenth', 'the Twentieth', 'the Eighteenth'], why: 'The Twenty-first Amendment repealed the Eighteenth: the only amendment ever repealed.' },
    { L: [2, 3], q: 'Why was an amendment needed for a federal income tax?', a: 'the Supreme Court had struck down an income tax in 1895', w: ['Congress had no power to tax at all', 'the President had vetoed every tax', 'states had banned it'], why: 'The Court held the 1894 income tax was a direct tax that had to be apportioned by population; the Sixteenth Amendment removed that requirement.' },
    { L: [2, 3], q: 'Which Wisconsin governor led the way on the direct primary and the "Wisconsin Idea"?', a: 'Robert La Follette', w: ['William Jennings Bryan', 'Eugene Debs', 'Henry Cabot Lodge'], why: 'La Follette\'s Wisconsin adopted a direct primary law in 1903.' },
    { L: [3], q: 'Senators have been elected directly by voters since the Constitution was written.', tf: false, why: 'False: state legislatures chose them until the Seventeenth Amendment (1913).' },
    { L: [3], q: 'About the Progressive amendments:', all: [['Four were ratified between 1913 and 1920.', true], ['The Eighteenth banned making and selling alcohol.', true], ['The Sixteenth allowed a federal income tax.', true], ['The Nineteenth lowered the voting age to 18.', false]], why: 'The voting age of 18 came with the Twenty-sixth Amendment (1971).' },
    { L: [2, 3], ord: [[1870, 'Fifteenth Amendment ratified'], [1913, 'Seventeenth Amendment ratified'], [1919, 'Eighteenth Amendment ratified'], [1920, 'Nineteenth Amendment ratified'], [1933, 'Twenty-first Amendment ratified'], [1971, 'Twenty-sixth Amendment ratified']] }
  ]));

  G('ush2.womens-suffrage', bank([
    { L: [1, 2, 3], q: 'In what year was the Nineteenth Amendment ratified?', year: 1920, why: 'August 18, 1920, when Tennessee became the 36th state to ratify.' },
    { L: [1, 2], q: 'Which leader of NAWSA devised the "Winning Plan" of 1916?', a: 'Carrie Chapman Catt', w: ['Alice Paul', 'Elizabeth Cady Stanton', 'Jeannette Rankin'], why: 'Catt\'s plan: win more states while pressing Congress for a federal amendment.' },
    { L: [1, 2], q: 'Whose National Woman\'s Party picketed the White House from 1917?', a: 'Alice Paul', w: ['Carrie Chapman Catt', 'Susan B. Anthony', 'Jane Addams'], why: 'Paul\'s "Silent Sentinels" picketed; many were jailed and some went on hunger strikes.' },
    { L: [1, 2], q: 'Which was the first state or territory to let women vote, in 1869?', a: 'Wyoming', w: ['New York', 'Massachusetts', 'California', 'Tennessee'], why: 'Wyoming Territory, 1869; it kept women\'s suffrage at statehood in 1890.' },
    { L: [2, 3], q: 'Which state cast the deciding 36th ratification of the Nineteenth Amendment?', a: 'Tennessee', w: ['Wyoming', 'New York', 'Ohio'], why: 'Tennessee ratified August 18, 1920; Harry Burn changed his vote after a letter from his mother.' },
    { L: [2, 3], q: 'In 1920 there were 48 states. How many had to ratify an amendment?', a: '36', w: ['32', '25', '48', '40'], why: 'Three-fourths of 48 is 36.' },
    { L: [2, 3], q: 'In which region did most states grant women full voting rights before 1920?', a: 'the West', w: ['New England', 'the Deep South', 'the Mid-Atlantic'], why: 'Wyoming, Colorado, Utah, Idaho, Washington, California and other Western states led.' },
    { L: [2, 3], q: 'Who was the first woman elected to Congress, in 1916 (from Montana)?', a: 'Jeannette Rankin', w: ['Alice Paul', 'Carrie Chapman Catt', 'Ida B. Wells'], why: 'Rankin took her seat in 1917, before the Nineteenth Amendment; Montana women already voted.' },
    { L: [3], q: 'No woman voted anywhere in the United States before 1920.', tf: false, why: 'False: Wyoming from 1869, and by 1919 women had full voting rights in fifteen states.' },
    { L: [3], q: 'After 1920, many Black women in the South were still kept from voting by Jim Crow laws.', tf: true, why: 'True: poll taxes, literacy tests and intimidation still blocked many voters until the 1960s.' },
    { L: [3], q: 'About winning women\'s suffrage:', all: [['NAWSA worked state by state and lobbied Congress.', true], ['The National Woman\'s Party picketed the White House.', true], ['Congress passed the amendment in 1919.', true], ['Seneca Falls took place in 1920.', false]], why: 'Seneca Falls was 1848; Congress passed the amendment in June 1919; ratification came in August 1920.' },
    { L: [1, 2, 3], ord: [[1848, 'Seneca Falls Convention'], [1869, 'Wyoming Territory lets women vote'], [1890, 'NAWSA formed'], [1893, 'Colorado adopts women\'s suffrage'], [1913, 'Suffrage parade in Washington'], [1916, 'Catt\'s Winning Plan'], [1920, 'Nineteenth Amendment ratified']] }
  ]));

  G('ush2.great-migration-naacp', bank([
    { L: [1, 2, 3], q: 'In what year was the NAACP founded?', year: 1909, why: 'February 1909, after the 1908 race riot in Springfield, Illinois.' },
    { L: [1, 2], q: 'About how many Black Southerners moved north and west in the Great Migration (about 1910 to 1970)?', a: 'about six million', w: ['about sixty thousand', 'about six hundred thousand', 'about sixty million'], why: 'About 1.6 million from 1910 to 1940 and about five million more from 1940 to 1970: roughly six million.' },
    { L: [1, 2], q: 'Who edited the NAACP\'s magazine, The Crisis?', a: 'W. E. B. Du Bois', w: ['Booker T. Washington', 'Marcus Garvey', 'Langston Hughes'], why: 'Du Bois edited The Crisis from 1910.' },
    { L: [2, 3], q: 'Why did the first big wave of the Great Migration begin during World War I?', a: 'war factories needed workers while immigration from Europe fell', w: ['the South passed laws requiring Black families to leave', 'Northern cities had no segregation', 'the draft sent families north'], why: 'Jim Crow and violence were pushes; the new pull was war jobs as European immigration dropped.' },
    { L: [2, 3], q: 'The Great Migration came in how many big waves?', a: 'two, around the two World Wars', w: ['one, all in 1919', 'one, after 1970', 'five, one per decade'], why: 'About 1910 to 1940 and 1940 to 1970; the second was larger.' },
    { L: [1, 2, 3], gen: sortGen(['a push factor', 'a pull factor'], [['Jim Crow laws in the South', 0], ['factory jobs in Chicago and Detroit', 1], ['lynching and violence', 0], ['the boll weevil ruining cotton crops', 0], ['job ads and letters in the Chicago Defender', 1], ['the right to vote in Northern states', 1]], 'For a family leaving the South around 1917, is this a push or a pull?') },
    { L: [2, 3], q: 'Which 1915 case, argued with NAACP support, struck down grandfather clauses?', a: 'Guinn v. United States', w: ['Plessy v. Ferguson', 'Brown v. Board of Education', 'Schenck v. United States'], why: 'Guinn v. United States (1915) held grandfather clauses violated the Fifteenth Amendment.' },
    { L: [3], q: 'Black families who moved north found no segregation or discrimination there.', tf: false, why: 'False: they found higher wages and the vote, but also segregated neighborhoods and, in 1919, deadly riots.' },
    { L: [3], q: 'About the NAACP and the Great Migration:', all: [['The NAACP was founded in 1909.', true], ['Its founders included W. E. B. Du Bois and Ida B. Wells.', true], ['The migration lasted about six decades.', true], ['It all happened in the 1960s.', false]], why: 'The migration ran from about 1910 to 1970.' },
    { L: [1, 2, 3], ord: [[1896, 'Plessy v. Ferguson'], [1908, 'Springfield race riot'], [1909, 'NAACP founded'], [1915, 'Guinn v. United States'], [1917, 'U.S. enters World War I'], [1919, 'Red Summer'], [1941, 'U.S. enters World War II']] }
  ]));

  G('ush2.wwi-entry', bank([
    { L: [1, 2, 3], q: 'In what year did the United States declare war on Germany?', year: 1917, why: 'April 6, 1917, four days after Wilson\'s war message.' },
    { L: [1, 2], q: 'What was the Zimmermann Telegram?', a: 'a German offer of an alliance with Mexico against the United States', w: ['Wilson\'s message asking for war', 'a British peace offer', 'the armistice that ended the war'], why: 'Decoded by the British and published March 1, 1917, it offered Mexico an alliance if the U.S. entered the war.' },
    { L: [1, 2], q: 'What was the U.S. policy when the war began in 1914?', a: 'neutrality', w: ['an immediate declaration of war', 'an alliance with Germany', 'a blockade of Britain'], why: 'Wilson declared neutrality; trade and loans still flowed mostly to the Allies.' },
    { L: [2, 3], q: 'Which was an immediate cause of U.S. entry in 1917?', a: 'Germany\'s renewed unrestricted submarine warfare', w: ['the sinking of the Lusitania that same week', 'the assassination of a U.S. President', 'a German invasion of Texas'], why: 'Germany resumed sinking ships without warning in February 1917; with the Zimmermann Telegram, it brought war.' },
    { L: [2, 3], q: 'How long before U.S. entry was the Lusitania sunk?', a: 'almost two years (May 1915)', w: ['one week', 'one month', 'five years'], why: 'The Lusitania went down May 7, 1915; the U.S. declared war April 6, 1917.' },
    { L: [2, 3], q: 'About how many Americans died when the Lusitania was sunk?', a: '128', w: ['12', '1,198', '2,403'], why: '1,198 people died, including 128 Americans. (2,403 Americans died at Pearl Harbor in 1941.)' },
    { L: [2, 3], q: 'Wilson\'s 1916 campaign slogan was…', a: '"He kept us out of war"', w: ['"Make the world safe for democracy"', '"A chicken in every pot"', '"Speak softly and carry a big stick"'], why: 'Wilson won reelection in 1916 on neutrality; in April 1917 he asked for war to make the world "safe for democracy."' },
    { L: [2, 3], q: 'The telegram said Germany would begin unrestricted submarine warfare. What did that mean?', a: 'sinking ships without warning, including neutral ones', w: ['only attacking warships', 'stopping all submarine attacks', 'searching ships before sinking them'], why: 'Unrestricted warfare meant no warning and no safety for neutral shipping near Britain.', viz: docViz('A decoded telegram, 1917', 'The Zimmermann Telegram (public domain translation)', 'We intend to begin on the first of February unrestricted submarine warfare. We shall endeavor in spite of this to keep the United States of America neutral.', ['unrestricted submarine warfare']) },
    { L: [3], q: 'The sinking of the Lusitania brought the United States into the war the next month.', tf: false, why: 'False: it came almost two years before U.S. entry.' },
    { L: [3], q: 'About U.S. entry into the Great War:', all: [['The U.S. was neutral from 1914 to 1917.', true], ['The Zimmermann Telegram offered Mexico an alliance.', true], ['Jeannette Rankin voted against war.', true], ['The U.S. joined the Central Powers.', false]], why: 'The U.S. fought with the Allies against the Central Powers.' },
    { L: [1, 2, 3], ord: WWI_EVENTS.slice(0, 6) },
    { L: [2, 3], tl: WWI_EVENTS }
  ]));

  G('ush2.wwi-home-front-peace', bank([
    { L: [1, 2], q: 'On what date did the armistice end the fighting of World War I?', a: 'November 11, 1918', w: ['April 6, 1917', 'June 28, 1919', 'December 7, 1941'], why: 'The armistice took effect November 11, 1918, now Veterans Day. The treaty was signed June 28, 1919.' },
    { L: [1, 2], q: 'Why did the United States never join the League of Nations?', a: 'the Senate did not approve the Treaty of Versailles', w: ['Wilson opposed the League', 'the League refused to admit the U.S.', 'the House voted to leave it'], why: 'The Senate rejected the treaty in 1919 and 1920; a two-thirds vote was never reached.' },
    { L: [1, 2, 3], q: 'In what year did the Supreme Court decide Schenck v. United States?', year: 1919, why: 'March 3, 1919, 9 to 0.' },
    { L: [2, 3], q: 'What test did Justice Holmes state in Schenck v. United States?', a: '"clear and present danger"', w: ['"separate but equal"', '"all deliberate speed"', '"actual malice"'], why: '"The question in every case is whether the words used … create a clear and present danger…"', viz: docViz('A Supreme Court opinion, 1919', 'Justice Holmes, 249 U.S. 47 (public domain)', 'The question in every case is whether the words used are used in such circumstances and are of such a nature as to create a clear and present danger that they will bring about the substantive evils that Congress has a right to prevent.', ['clear and present danger']) },
    { L: [2, 3], q: 'Which senator led the Republicans who demanded reservations to the League of Nations?', a: 'Henry Cabot Lodge', w: ['Robert La Follette', 'William Jennings Bryan', 'Eugene Debs'], why: 'Lodge chaired the Foreign Relations Committee and objected especially to Article 10.' },
    { L: [2, 3], q: 'Which of these was Point 14 of Wilson\'s Fourteen Points?', a: 'a general association of nations', w: ['war reparations from Germany', 'a U.S. empire in Africa', 'an end to all trade'], why: 'Point 14 called for "a general association of nations": the League.' },
    { L: [1, 2, 3], gen: sortGen(['the War Industries Board', 'the Committee on Public Information', 'the Food Administration', 'the Selective Service Act'], [['directed factories to make war goods', 0], ['made posters and films to build support for the war', 1], ['urged "meatless" and "wheatless" days (Herbert Hoover)', 2], ['drafted 2.8 million men', 3]], 'Which wartime law or agency did this?') },
    { L: [2, 3], q: 'Why was Socialist leader Eugene Debs sent to prison in 1918?', a: 'for a speech against the war, under the Espionage Act', w: ['for leading the Pullman strike', 'for refusing to pay the income tax', 'for spying for Germany'], why: 'He was sentenced to ten years; he ran for President from prison in 1920.' },
    { L: [3], q: 'The United States joined the League of Nations in 1920.', tf: false, why: 'False: the Senate never approved the treaty; the U.S. made a separate peace with Germany in 1921.' },
    { L: [3], q: 'Schenck v. United States was decided 9 to 0 and upheld a conviction for urging resistance to the draft.', tf: true, why: 'True: the Court found the leaflets created a clear and present danger in wartime.' },
    { L: [3], q: 'About the home front and the peace:', all: [['The Espionage Act passed in 1917.', true], ['The armistice came on November 11, 1918.', true], ['Wilson suffered a stroke during the treaty fight.', true], ['The Senate approved the treaty with a large majority.', false]], why: 'The Senate rejected the treaty in 1919 and again in 1920.' },
    { L: [1, 2, 3], ord: [[1917, 'Selective Service and Espionage Acts'], [1918, 'Armistice ends the fighting'], [1919, 'Treaty of Versailles signed'], [1920, 'Senate rejects the treaty a second time'], [1921, 'U.S. makes a separate peace with Germany'], [1915, 'Lusitania sunk']] }
  ]));

  /* ================= Unit 3: The 1920s and the Great Depression ================= */
  var TWENTIES_EVENTS = [[1908, 'Ford introduces the Model T'], [1913, 'Ford\'s moving assembly line'], [1919, 'Red Scare; Eighteenth Amendment ratified'], [1920, 'Regular radio broadcasts begin (KDKA)'],
    [1921, 'Emergency Quota Act'], [1924, 'Immigration Act of 1924'], [1925, 'Scopes trial'], [1927, 'The Jazz Singer; Sacco and Vanzetti executed'], [1929, 'Stock market crash'], [1933, 'Twenty-first Amendment repeals Prohibition']];
  var DEPRESSION_EVENTS = [[1929, 'Black Tuesday'], [1930, 'Smoot-Hawley Tariff'], [1932, 'Reconstruction Finance Corporation; Bonus Army'], [1933, 'Roosevelt inaugurated; Hundred Days'], [1934, 'Securities and Exchange Commission'],
    [1935, 'Social Security Act and Wagner Act'], [1936, 'Roosevelt reelected in a landslide'], [1937, 'Court plan fails; West Coast Hotel'], [1938, 'Fair Labor Standards Act']];
  var ROAD_EVENTS = [[1931, 'Japan invades Manchuria'], [1935, 'First Neutrality Act'], [1937, 'Japan invades China'], [1939, 'Germany invades Poland'], [1940, 'France falls; first peacetime draft'], [1941, 'Lend-Lease and the Atlantic Charter'], [1945, 'World War II ends']];

  G('ush2.roaring-twenties', bank([
    { L: [1, 2], q: 'Which car, built on a moving assembly line from 1913, made car ownership common?', a: 'Ford\'s Model T', w: ['the Cadillac', 'the Volkswagen Beetle', 'the Model A only'], why: 'Over 15 million Model Ts were built from 1908 to 1927.' },
    { L: [1, 2], q: 'The Harlem Renaissance was…', a: 'a flowering of Black writing, art and music centered in Harlem, New York', w: ['a building program in Washington, D.C.', 'a revival of European painting', 'a farm movement in the Midwest'], why: 'Langston Hughes, Zora Neale Hurston, Duke Ellington and many others.' },
    { L: [1, 2, 3], gen: sortGen(['a writer', 'a musician'], [['Langston Hughes', 0], ['Zora Neale Hurston', 0], ['Duke Ellington', 1], ['Louis Armstrong', 1], ['Claude McKay', 0], ['Bessie Smith', 1]], 'In the Harlem Renaissance and the Jazz Age, was this person mainly a writer or a musician?') },
    { L: [2, 3], q: 'Which group did not share the prosperity of the 1920s?', a: 'farmers, whose crop prices stayed low', w: ['car makers', 'advertisers', 'radio stations'], why: 'Farm prices fell after the war and stayed low; many farmers lost their land.' },
    { L: [2, 3], q: 'What was installment buying?', a: 'buying now and paying in monthly payments, on credit', w: ['buying stock with borrowed money', 'paying cash only', 'trading goods without money'], why: 'Credit let families buy cars and appliances before they had the money; household debt rose.' },
    { L: [2, 3], q: 'What was the first feature film with spoken dialogue, in 1927?', a: 'The Jazz Singer', w: ['The Great Gatsby', 'Gone with the Wind', 'Steamboat Willie'], why: 'The Jazz Singer (1927) began the era of "talkies."' },
    { L: [1, 2, 3], q: 'In what year did the census first count more Americans in urban areas than in rural ones?', year: 1920, why: 'The 1920 census found a slight urban majority.' },
    { L: [2, 3], q: 'Whose movement, the Universal Negro Improvement Association, preached Black pride and self-reliance in the 1920s?', a: 'Marcus Garvey', w: ['W. E. B. Du Bois', 'Booker T. Washington', 'A. Philip Randolph'], why: 'Garvey drew hundreds of thousands of followers.' },
    { L: [3], q: 'Everyone in the United States prospered during the 1920s.', tf: false, why: 'False: farmers struggled all decade, and wealth grew most at the top.' },
    { L: [3], q: 'About the 1920s:', all: [['Radio broadcasts reached the whole country.', true], ['Jazz spread from New Orleans to Chicago and New York.', true], ['Installment credit grew.', true], ['Farm prices rose steadily all decade.', false]], why: 'Farm prices fell after the war and stayed low.' },
    { L: [1, 2, 3], ord: TWENTIES_EVENTS.slice(0, 9) }
  ]));

  G('ush2.twenties-conflicts', bank([
    { L: [1, 2], q: 'What did the Eighteenth Amendment ban?', a: 'making, selling and transporting alcohol', w: ['drinking alcohol', 'growing grapes', 'owning alcohol bought before 1920'], why: 'It banned the manufacture, sale and transportation of intoxicating liquors, not drinking.', viz: docViz('An amendment, 1919', 'U.S. Constitution, Amendment XVIII, Section 1 (public domain)', 'the manufacture, sale, or transportation of intoxicating liquors within, the importation thereof into, or the exportation thereof from the United States and all territory subject to the jurisdiction thereof for beverage purposes is hereby prohibited.') },
    { L: [1, 2, 3], q: 'In what year was the Scopes trial held in Dayton, Tennessee?', year: 1925, why: 'July 1925; Scopes was convicted and fined $100, a verdict later overturned on a technicality.'.replace('$', '\\$') },
    { L: [1, 2], q: 'What was John Scopes tried for?', a: 'teaching evolution in a public school', w: ['selling alcohol', 'leading a strike', 'refusing the draft'], why: 'Tennessee\'s Butler Act banned teaching human evolution in public schools.' },
    { L: [2, 3], q: 'Which lawyers faced each other at the Scopes trial?', a: 'William Jennings Bryan (prosecution) and Clarence Darrow (defense)', w: ['Clarence Darrow (prosecution) and William Jennings Bryan (defense)', 'A. Mitchell Palmer and Eugene Debs', 'Thurgood Marshall and John W. Davis'], why: 'Bryan helped prosecute; Darrow defended Scopes.' },
    { L: [2, 3], q: 'The Immigration Act of 1924 set quotas based on which census?', a: 'the 1890 census', w: ['the 1920 census', 'the 1790 census', 'the 1910 census'], why: 'Using 1890 favored northern and western Europe. The 1921 act had used the 1910 census.' },
    { L: [1, 2, 3], gen: sortGen(['the Red Scare', 'the Scopes trial', 'immigration quotas', 'Prohibition', 'the Sacco and Vanzetti case'], [['the Palmer Raids', 0], ['the Butler Act', 1], ['the Emergency Quota Act', 2], ['speakeasies and bootleggers', 3], ['two Italian-born anarchists executed in 1927', 4], ['the Volstead Act', 3], ['national-origins limits favoring northern Europe', 2], ['deportations of suspected radicals', 0]], 'Which conflict of the 1920s does this belong to?') },
    { L: [2, 3], q: 'Which amendment ended Prohibition in 1933?', a: 'the Twenty-first', w: ['the Nineteenth', 'the Eighteenth', 'the Sixteenth'], why: 'The Twenty-first Amendment repealed the Eighteenth.' },
    { L: [2, 3], q: 'Where did the revived Ku Klux Klan of the 1920s have members?', a: 'in the North and West as well as the South', w: ['only in the Deep South', 'only in New England', 'only in big Eastern cities'], why: 'Revived in 1915, it claimed millions of members in the mid-1920s across many states, until scandals shrank it.' },
    { L: [3], q: 'Under Prohibition, drinking alcohol itself was a federal crime.', tf: false, why: 'False: making, selling and transporting it were banned; drinking was not.' },
    { L: [3], q: 'Historians still debate whether Sacco and Vanzetti were guilty.', tf: true, why: 'True: many at the time believed the trial unfair; the evidence is still argued.' },
    { L: [3], q: 'About the conflicts of the 1920s:', all: [['Palmer Raids arrested thousands of suspected radicals.', true], ['The 1924 act barred most immigration from Asia.', true], ['Scopes was acquitted by the jury.', false], ['Prohibition was hard to enforce.', true]], why: 'Scopes was convicted; the conviction was overturned on a technicality.' },
    { L: [1, 2, 3], ord: TWENTIES_EVENTS.slice(2, 10) }
  ]));

  G('ush2.crash-1929', bank([
    { L: [1, 2], q: 'What was Black Tuesday?', a: 'October 29, 1929, the worst day of the stock market crash', w: ['the day the banks closed in 1933', 'a dust storm in 1935', 'the attack on Pearl Harbor'], why: 'Prices fell nearly 12 percent on October 29, 1929.' },
    { L: [1, 2, 3], q: 'In what year did the stock market crash that began the Great Depression?', year: 1929, why: 'October 1929.' },
    { L: [1, 2], q: 'What did buying stock "on margin" mean?', a: 'paying part of the price and borrowing the rest', w: ['buying only cheap stocks', 'buying stock from the government', 'paying the full price in gold'], why: 'Investors could put down as little as 10 percent; when prices fell, loans were called in.' },
    { L: [1, 2, 3], gen: function (R) { var own = R.pick([100, 200, 250]), price = 1000, drop = R.pick([10, 20, 25, 30]); var left = price * (100 - drop) / 100 - (price - own); return { q: 'An investor buys \\$' + price + ' of stock with \\$' + own + ' of her own money and borrows the rest. The stock falls ' + drop + ' percent. After repaying the loan, how many dollars of her own money are left (a negative number means she still owes)?', a: String(left), w: [String(own - own * drop / 100), String(own), String(price * (100 - drop) / 100), String(-left === left ? left + 50 : -left)].filter(function (x, i, a) { return a.indexOf(x) === i && x !== String(left); }), why: 'Value: ' + price + ' × ' + (100 - drop) / 100 + ' = ' + price * (100 - drop) / 100 + '. Minus the loan of ' + (price - own) + ' leaves ' + left + '. Margin magnifies losses.' }; } },
    { L: [2, 3], q: 'Which economists stress bank failures and a shrinking money supply as the main cause of the Depression?', a: 'monetarists such as Milton Friedman and Anna Schwartz', w: ['Keynesian economists', 'Populists', 'Social Darwinists'], why: 'Monetarists point to the one-third fall in the money supply and the Federal Reserve\'s failure to stop it; Keynesians stress collapsing demand.' },
    { L: [2, 3], q: 'Which 1930 law raised tariffs and is widely blamed for shrinking world trade?', a: 'the Smoot-Hawley Tariff', w: ['the Sherman Act', 'the Wagner Act', 'the Glass-Steagall Act'], why: 'Other nations retaliated; most economists count it as a cause, though they debate its size.' },
    { L: [2, 3], q: 'About how many banks failed from 1930 to 1933?', a: 'more than 9,000', w: ['about 90', 'about 900', 'none: banks were insured'], why: 'More than 9,000 banks failed; deposits were not insured until the FDIC (1933).' },
    { L: [2, 3], gen: function (R) { var c = R.pick([['speculation and buying on margin', 'a cause'], ['bank failures and a shrinking money supply', 'a cause'], ['unequal income and weak demand', 'a cause'], ['high tariffs and shrinking trade', 'a cause']]); return { q: 'Economists and historians weigh several causes of the Depression. Which of these is one of them?', a: c[0], w: ['the Social Security Act', 'the Federal Deposit Insurance Corporation', 'the Nineteenth Amendment', 'the Marshall Plan'], why: 'Causes weighed: speculation and margin, bank failures and the money supply, overproduction and unequal income, tariffs. The others came later.' }; } },
    { L: [3], q: 'Nearly all economists agree the Crash alone caused the Great Depression.', tf: false, why: 'False: most see the Crash as one cause among several and debate the weights.' },
    { L: [3], q: 'About the Crash and its causes:', all: [['The Dow peaked in September 1929.', true], ['Margin buying magnified losses.', true], ['The money supply fell by about a third.', true], ['Deposits were federally insured in 1929.', false]], why: 'Deposit insurance began with the FDIC in 1933–1934.' },
    { L: [1, 2, 3], ord: [[1921, 'Dow Jones average at 63'], [1929, 'Black Tuesday'], [1930, 'Smoot-Hawley Tariff'], [1933, 'Unemployment about 25 percent'], [1934, 'Securities and Exchange Commission'], [1927, 'Lindbergh flies across the Atlantic']] }
  ]));

  G('ush2.depression-life', bank([
    { L: [1, 2], q: 'About what share of workers were unemployed by 1933?', a: 'about one in four', w: ['about one in a hundred', 'about one in two', 'about one in ten'], why: 'Unemployment peaked at about 25 percent.' },
    { L: [1, 2], q: 'What was the Dust Bowl?', a: 'drought and dust storms on the southern Plains that drove many families away', w: ['a college football game', 'a stock market term', 'a New Deal dam'], why: 'Drought and the plowing of grasslands let the wind strip the soil; many families moved to California.' },
    { L: [1, 2], q: 'What were "Hoovervilles"?', a: 'shantytowns built by the homeless', w: ['new suburbs', 'army bases', 'government offices'], why: 'Named, bitterly, after President Hoover.' },
    { L: [1, 2, 3], q: 'In what year did Hoover\'s Reconstruction Finance Corporation begin lending to banks and businesses?', year: 1932, why: 'It was chartered January 22, 1932.' },
    { L: [2, 3], q: 'What did Hoover oppose during the Depression?', a: 'direct federal relief payments to individuals', w: ['any public works', 'loans to banks', 'any tariff'], why: 'He expanded public works and created the RFC but believed direct relief would weaken self-reliance.' },
    { L: [2, 3], q: 'Who was the Bonus Army?', a: 'World War I veterans who camped in Washington in 1932 to ask for early payment of a bonus', w: ['soldiers sent to Mexico in 1916', 'striking railroad workers in 1894', 'Civil War veterans in 1865'], why: 'On July 28, 1932, troops under General MacArthur drove them out and burned their camp.' },
    { L: [2, 3], q: 'What happened on "Black Sunday," April 14, 1935?', a: 'a huge dust storm swept the southern Plains', w: ['the stock market crashed', 'the banks closed', 'Pearl Harbor was attacked'], why: 'Winds raised a wall of dust that turned day into night.' },
    { L: [2, 3], q: 'During the Depression, between about 400,000 and a million people of Mexican descent left or were pushed out of the U.S. Many of them were…', a: 'U.S. citizens', w: ['soldiers', 'bankers', 'members of Congress'], why: 'Repatriation drives pressed many U.S.-born citizens to leave.' },
    { L: [3], q: 'President Hoover did nothing at all about the Depression.', tf: false, why: 'False: he backed public works and created the RFC, though he opposed direct federal relief.' },
    { L: [3], q: 'About life in the Depression:', all: [['Thousands of banks failed.', true], ['Families doubled up and stood in bread lines.', true], ['The Dust Bowl was caused by the stock market crash.', false], ['Many Plains families moved to California.', true]], why: 'The Dust Bowl came from drought and farming practices, not the Crash.' },
    { L: [1, 2, 3], ord: DEPRESSION_EVENTS.slice(0, 5).concat([[1935, 'Black Sunday dust storm']]) }
  ]));

  var THREE_R = [['WPA jobs building schools and roads', 0], ['the Civilian Conservation Corps', 0], ['the Securities and Exchange Commission', 2], ['the FDIC insuring bank deposits', 2], ['the Tennessee Valley Authority\'s dams and power', 1], ['Social Security pensions', 2], ['emergency payments to the jobless', 0], ['farm programs to raise crop prices', 1]];
  G('ush2.new-deal', bank([
    { L: [1, 2, 3], gen: sortGen(['relief', 'recovery', 'reform'], THREE_R, 'Was this New Deal measure mainly relief, recovery or reform?') },
    { L: [1, 2, 3], gen: function (R) { var p = R.pick([['the Social Security Act', 1935], ['the Wagner Act', 1935], ['the Fair Labor Standards Act', 1938], ['the Securities and Exchange Commission', 1934], ['the Tennessee Valley Authority', 1933], ['the Civilian Conservation Corps', 1933]]); return { q: 'In what year was ' + p[0] + ' created?', year: p[1], why: 'CCC and TVA 1933; SEC 1934; Social Security and the Wagner Act 1935; Fair Labor Standards Act 1938.' }; } },
    { L: [1, 2], q: '"The only thing we have to fear is fear itself." Who said it, and when?', a: 'Franklin Roosevelt, at his first inauguration in 1933', w: ['Herbert Hoover, in 1929', 'Woodrow Wilson, in 1917', 'Franklin Roosevelt, after Pearl Harbor in 1941'], why: 'FDR\'s First Inaugural Address, March 4, 1933.', viz: docViz('An address', 'Public domain', 'So, first of all, let me assert my firm belief that the only thing we have to fear is fear itself—nameless, unreasoning, unjustified terror which paralyzes needed efforts to convert retreat into advance.') },
    { L: [1, 2], gen: sortGen(['the FDIC', 'the SEC', 'Social Security', 'the Wagner Act', 'the Fair Labor Standards Act'], [['insured bank deposits', 0], ['regulated the stock market', 1], ['old-age pensions and unemployment insurance', 2], ['protected the right to form unions', 3], ['a minimum wage and limits on hours', 4]], 'Which New Deal law or agency did this?') },
    { L: [2, 3], q: 'Who was Roosevelt\'s labor secretary, the first woman in a cabinet?', a: 'Frances Perkins', w: ['Eleanor Roosevelt', 'Jeannette Rankin', 'Mary McLeod Bethune'], why: 'Perkins shaped Social Security and the labor laws.' },
    { L: [2, 3], q: 'What was the minimum wage set by the Fair Labor Standards Act of 1938?', a: '25 cents an hour', w: ['1 dollar an hour', '5 cents an hour', '2 dollars an hour'], why: '25 cents at first, rising to 40 cents by 1945.' },
    { L: [3], q: 'The FDIC was a relief program that gave jobs to the unemployed.', tf: false, why: 'False: it was a reform that insured bank deposits. Jobs programs were the CCC and WPA.' },
    { L: [3], q: 'About the New Deal:', all: [['The TVA built dams in a poor region.', true], ['Social Security began in 1935.', true], ['The SEC regulates the stock market.', true], ['The WPA insured bank deposits.', false]], why: 'The WPA gave jobs; the FDIC insured deposits.' },
    { L: [1, 2, 3], ord: DEPRESSION_EVENTS.slice(2, 9) }
  ]));

  G('ush2.new-deal-court', bank([
    {"L":[1,2,3],"q":"Who was President when the Supreme Court struck down early New Deal laws?","a":"Franklin D. Roosevelt","w":["Herbert Hoover","Harry S. Truman","Woodrow Wilson","Calvin Coolidge"],"why":"Roosevelt's New Deal laws were challenged in court from 1935 on."},
    {"L":[1,2,3],"q":"Critics gave Roosevelt's 1937 plan to add justices what nickname?","a":"court packing","w":["the Square Deal","the Fair Deal","the Hundred Days","the Good Neighbor policy"],"why":"Opponents called it \"court packing.\""},
    {"L":[1,2,3],"q":"Which 1937 case upheld a state minimum wage law?","a":"West Coast Hotel Co. v. Parrish","w":["Schechter Poultry Corp. v. United States","Lochner v. New York","Adkins v. Children's Hospital","Plessy v. Ferguson"],"why":"West Coast Hotel (1937) upheld Washington State's minimum wage for women."},
    {"L":[1,2],"q":"How many justices sit on the Supreme Court, as they did in 1937?","a":"nine","w":["six","twelve","fifteen"],"why":"The Court has had nine justices since 1869; the 1937 plan to add more failed."},
    { L: [1, 2], q: 'What happened to Roosevelt\'s 1937 plan to add justices to the Supreme Court?', a: 'Congress rejected it', w: ['it passed, and the Court grew to fifteen', 'the Court struck it down', 'the states ratified it as an amendment'], why: 'The Senate set it aside in the summer of 1937; the Court has had nine seats since 1869.' },
    { L: [1, 2], q: 'Which case, "the sick chicken case," struck down the National Industrial Recovery Act in 1935?', a: 'Schechter Poultry Corp. v. United States', w: ['West Coast Hotel v. Parrish', 'NLRB v. Jones & Laughlin', 'Plessy v. Ferguson'], why: 'Schechter (1935), 9 to 0: unlawful delegation and regulation of local business.', viz: caseViz('schechter') },
    { L: [1, 2, 3], q: 'In what year did Roosevelt propose adding justices to the Supreme Court?', year: 1937, why: 'February 5, 1937.' },
    { L: [2, 3], q: 'Under the 1937 plan, Roosevelt could add one justice for each justice over what age who did not retire?', a: '70', w: ['65', '80', '60'], why: 'Up to six new justices, one for each sitting justice over 70.' },
    { L: [2, 3], gen: function (R) { var c = R.pick([['West Coast Hotel Co. v. Parrish', 'in 1937, upheld a state minimum wage law'], ['NLRB v. Jones & Laughlin Steel', 'in 1937, upheld the Wagner Act'], ['Schechter Poultry Corp. v. United States', 'in 1935, struck down the National Industrial Recovery Act'], ['United States v. Butler', 'in 1936, struck down the first farm program']]); return { q: 'What did <i>' + c[0] + '</i> do?', a: c[1], w: ['in 1937, upheld a state minimum wage law', 'in 1937, upheld the Wagner Act', 'in 1935, struck down the National Industrial Recovery Act', 'in 1936, struck down the first farm program', 'in 1896, upheld segregation'].filter(function (x) { return x !== c[1]; }), why: 'Schechter 1935 and Butler 1936 struck New Deal laws down; West Coast Hotel and Jones & Laughlin (1937) upheld regulation.' }; } },
    { L: [2, 3], q: 'West Coast Hotel v. Parrish (1937) overruled which earlier case?', a: 'Adkins v. Children\'s Hospital (1923)', w: ['Plessy v. Ferguson (1896)', 'Marbury v. Madison (1803)', 'Schenck v. United States (1919)'], why: 'Adkins had struck down a minimum wage for women in Washington, D.C.', viz: caseViz('westcoast', { hide: ['name', 'later'] }) },
    { L: [2, 3], q: 'Why did critics, including many Democrats, oppose the court plan?', a: 'they saw it as an attack on the independence of the courts', w: ['they wanted fewer justices', 'the Constitution sets the number at nine', 'Roosevelt had lost the 1936 election'], why: 'Congress sets the number of justices by law, but critics saw "court packing" as a threat to judicial independence.' },
    { L: [3], q: 'The court-packing plan passed, and the Court grew to fifteen justices.', tf: false, why: 'False: Congress rejected it. The Court has had nine seats since 1869.' },
    { L: [3], q: 'The Constitution fixes the number of Supreme Court justices at nine.', tf: false, why: 'False: Congress sets the number by law; it has been nine since 1869.' },
    { L: [3], q: 'About the New Deal and the Court:', all: [['Schechter (1935) was unanimous.', true], ['In 1937 the Court upheld the Wagner Act.', true], ['The Court upheld Social Security in 1937.', true], ['Roosevelt never appointed a justice.', false]], why: 'Retirements soon let Roosevelt appoint several justices.' },
    { L: [2, 3], ord: [[1923, 'Adkins strikes down a minimum wage'], [1935, 'Schechter strikes down the NIRA'], [1936, 'Butler strikes down the first farm act'], [1937, 'Court plan proposed and rejected'], [1941, 'United States v. Darby upholds the wage law']] }
  ]));

  G('ush2.new-deal-debates', bank([
    { L: [1, 2, 3], gen: sortGen(['said it did too little', 'said it did too much'], [['Huey Long and "Share Our Wealth"', 0], ['the American Liberty League', 1], ['Francis Townsend and his pension plan', 0], ['business leaders who called it unconstitutional', 1], ['Father Coughlin after 1934', 0]], 'Did this critic say the New Deal did too little or too much?') },
    { L: [1, 2], q: 'Which senator from Louisiana proposed "Share Our Wealth" in 1934?', a: 'Huey Long', w: ['Robert La Follette', 'Henry Cabot Lodge', 'Joseph McCarthy'], why: 'Long called for heavy taxes on great fortunes and a guaranteed income for families.' },
    { L: [2, 3], q: 'What happened to unemployment in the recession of 1937 to 1938?', a: 'it rose again, from about 14 percent to nearly 20 percent', w: ['it fell to zero', 'it stayed at 25 percent all decade', 'it fell below 5 percent'], why: 'After spending was cut and the Federal Reserve tightened, unemployment climbed again.' },
    { L: [2, 3], q: 'Which statement do historians and economists broadly agree on?', a: 'the New Deal changed the federal government\'s role for good', w: ['the New Deal ended the Depression by 1935', 'the New Deal had no lasting programs', 'the New Deal was declared unconstitutional in full'], why: 'They debate how much it helped recovery, but agree it lasted: Social Security, the FDIC, the SEC, the minimum wage.' },
    { L: [2, 3], q: 'A Keynesian critic of the New Deal argues that…', a: 'spending was too small to end the Depression; only wartime spending did', w: ['the New Deal spent far too much', 'tariffs should have been higher', 'the gold standard should have been kept'], why: 'Keynesians stress weak demand; some other economists argue certain policies slowed recovery.' },
    { L: [2, 3], q: 'Which group did early Social Security leave out?', a: 'farm and household workers', w: ['factory workers', 'bank clerks', 'retail workers'], why: 'Farm and domestic workers were excluded at first, which left out many Black and Mexican American workers.' },
    { L: [3], q: 'Scholars all agree the New Deal ended the Great Depression.', tf: false, why: 'False: they debate how much it helped; unemployment stayed above 14 percent through 1940.' },
    { L: [3], q: 'About judging the New Deal:', all: [['Unemployment fell from 1933 to 1937.', true], ['Unemployment stayed high until the war.', true], ['Social Security still exists.', true], ['Critics came only from one side.', false]], why: 'Critics came from the left (Long, Townsend, Coughlin) and the right (the Liberty League).' },
    { L: [2, 3], ord: [[1933, 'Hundred Days'], [1934, 'Share Our Wealth and the American Liberty League'], [1935, 'Social Security Act'], [1937, 'Recession begins'], [1941, 'U.S. enters World War II']] }
  ]));

  G('ush2.road-to-wwii', bank([
    {"L":[1,2,3],"q":"Which country did Japan invade in 1937?","a":"China","w":["Australia","the Philippines","Ethiopia","Poland"],"why":"Japan had taken Manchuria in 1931 and invaded China in 1937."},
    {"L":[1,2,3],"q":"Which country did Italy invade in 1935?","a":"Ethiopia","w":["China","Poland","Austria","France"],"why":"Mussolini's Italy invaded Ethiopia in 1935."},
    {"L":[1,2,3],"q":"Most Americans in the 1930s wanted to…","a":"stay out of foreign wars","w":["join the war in Europe at once","annex Canada","send troops to China"],"why":"Memories of the Great War led many to favor staying out."},
    {"L":[1,2,3],"q":"In what year did Congress pass Lend-Lease?","a":"1941","w":["1935","1937","1939","1945"],"why":"Lend-Lease passed in March 1941."},
    {"L":[1,2,3],"q":"Which leaders issued the Atlantic Charter in August 1941?","a":"Franklin D. Roosevelt and Winston Churchill","w":["Roosevelt and Joseph Stalin","Harry Truman and Clement Attlee","Woodrow Wilson and David Lloyd George"],"why":"Roosevelt and Churchill met off Newfoundland."},
    {"L":[2,3],"q":"Which two countries did Nazi Germany seize in 1938 and 1939, before invading Poland?","a":"Austria and Czechoslovakia","w":["France and Belgium","Norway and Denmark","Spain and Portugal"],"why":"Germany annexed Austria in 1938 and took Czechoslovakia by March 1939."},
    { L: [1, 2], q: 'What was Lend-Lease (1941)?', a: 'lending or leasing weapons to nations whose defense was vital to the U.S.', w: ['a declaration of war on Germany', 'a ban on all arms sales', 'a loan program for farmers'], why: 'Signed March 11, 1941, after Britain ran short of cash.' },
    { L: [1, 2, 3], q: 'In what year did Germany invade Poland and begin World War II in Europe?', year: 1939, why: 'September 1, 1939.' },
    { L: [1, 2], q: 'What did the Neutrality Acts of 1935 to 1937 try to do?', a: 'keep the U.S. out of foreign wars, for example by banning arms sales to nations at war', w: ['bring the U.S. into the war at once', 'build a two-ocean navy', 'create the United Nations'], why: 'A Senate committee had argued bankers and arms makers pulled the U.S. into World War I.' },
    { L: [2, 3], q: 'Under "cash and carry," how did nations at war buy American goods?', a: 'they paid cash and carried the goods in their own ships', w: ['they borrowed from U.S. banks', 'U.S. ships delivered them', 'they traded land for them'], why: 'This favored Britain and France, who controlled the seas.' },
    { L: [2, 3], q: 'Which group, with Charles Lindbergh as a speaker, argued against aid that might lead to war?', a: 'the America First Committee', w: ['the Committee to Defend America by Aiding the Allies', 'the American Liberty League', 'the NAACP'], why: 'America First (1940) was the largest non-interventionist group.' },
    { L: [2, 3], q: 'What was the Atlantic Charter (August 1941)?', a: 'a joint statement of war aims by Roosevelt and Churchill', w: ['a declaration of war on Japan', 'a treaty creating NATO', 'a trade deal with Germany'], why: 'They met at sea and set out shared aims, months before the U.S. entered the war.' },
    { L: [2, 3], q: 'In September 1940, the U.S. traded fifty old destroyers to Britain for…', a: 'leases on bases', w: ['gold', 'oil', 'colonies in Africa'], why: 'The destroyers-for-bases deal gave the U.S. bases in British territories in the Atlantic.' },
    { L: [3], q: 'The United States entered World War II in 1939.', tf: false, why: 'False: it sent aid from 1939 but entered in December 1941, after Pearl Harbor.' },
    { L: [3], q: 'About the road to war:', all: [['The first Neutrality Act came in 1935.', true], ['Lend-Lease came before Pearl Harbor.', true], ['The first peacetime draft began in 1940.', true], ['The U.S. sold arms to Germany under Lend-Lease.', false]], why: 'Lend-Lease aided Britain, then the Soviet Union, China and others.' },
    { L: [1, 2, 3], ord: ROAD_EVENTS.slice(0, 6).concat([[1941, 'Pearl Harbor attacked']]).filter(function (e) { return e[1] !== 'Lend-Lease and the Atlantic Charter'; }).concat([[1936, 'Second Neutrality Act']]) },
    { L: [2, 3], tl: ROAD_EVENTS }
  ]));

  /* ================= Unit 4: World War II ================= */
  var EUROPE_EVENTS = [[1939, 'Germany invades Poland'], [1941, 'Germany invades the Soviet Union'], [1942, 'Operation Torch: landings in North Africa'], [1943, 'Allies invade Sicily'],
    [1944, 'D-Day: landings in Normandy'], [1945, 'V-E Day: Germany surrenders']];
  var PACIFIC_EVENTS = [[1937, 'Japan invades China'], [1941, 'Pearl Harbor attacked'], [1942, 'Battle of Midway'], [1944, 'Battle of Leyte Gulf'], [1945, 'Atomic bombs; Japan surrenders']];
  var PACIFIC_ORDER = [['Pearl Harbor attacked (December 1941)', 1], ['Bataan Death March (April 1942)', 2], ['Battle of Midway (June 1942)', 3], ['Guadalcanal campaign begins (August 1942)', 4], ['Battle of Leyte Gulf (October 1944)', 5],
    ['Iwo Jima (February 1945)', 6], ['Okinawa (April 1945)', 7], ['Hiroshima (August 6, 1945)', 8], ['Nagasaki (August 9, 1945)', 9], ['Japan signs the surrender (September 2, 1945)', 10]];
  // ordering by sequence number when several events share a year
  function seqOrd(list, n) { return { gen: function (R, lv) { return { ord: list.map(function (e) { return [e[1], e[0]]; }), seq: true, n: n || (lv === 1 ? 3 : lv === 2 ? 4 : 5) }; } }; }

  G('ush2.pearl-harbor', bank([
    { L: [1, 2, 3], q: 'On what date did Japan attack Pearl Harbor?', a: 'December 7, 1941', w: ['December 8, 1941', 'June 6, 1944', 'September 1, 1939', 'November 11, 1918'], why: 'Sunday, December 7, 1941. Congress declared war the next day.' },
    { L: [1, 2], q: 'Against which country did Congress declare war on December 8, 1941?', a: 'Japan', w: ['Germany', 'Italy', 'the Soviet Union'], why: 'Roosevelt asked for war on Japan; Germany and Italy declared war on the U.S. on December 11.' },
    { L: [1, 2], q: 'Where is Pearl Harbor?', a: 'on Oahu, in Hawaii', w: ['in the Philippines', 'in Alaska', 'in California'], why: 'Pearl Harbor is on the island of Oahu, then in the U.S. territory of Hawaii.' },
    { L: [2, 3], q: 'Which countries declared war on the United States on December 11, 1941?', a: 'Germany and Italy', w: ['Japan and China', 'Britain and France', 'the Soviet Union and Japan'], why: 'Germany and Italy, Japan\'s partners, declared war on the U.S.; Congress answered the same day.' },
    { L: [2, 3], q: '"Yesterday, December 7th, 1941—a date which will live in infamy…" Who said it?', a: 'Franklin D. Roosevelt', w: ['Harry Truman', 'Winston Churchill', 'Dwight Eisenhower'], why: 'Roosevelt\'s address to Congress on December 8, 1941.', viz: docViz('An address to Congress', 'December 8, 1941 (public domain)', 'Yesterday, December 7th, 1941—a date which will live in infamy—the United States of America was suddenly and deliberately attacked by naval and air forces of the Empire of Japan.') },
    { L: [2, 3], q: 'About how many Americans were killed in the attack on Pearl Harbor?', a: '2,403', w: ['128', '240', '24,000'], why: '2,403 killed, including 68 civilians. (128 Americans died on the Lusitania in 1915.)' },
    { L: [2, 3], q: 'Why did Japan\'s plan fall short of destroying the Pacific Fleet?', a: 'the U.S. aircraft carriers were at sea, and the fuel tanks and repair yards survived', w: ['the attack was called off', 'no battleships were hit', 'the U.S. had been warned a week ahead and moved the fleet'], why: 'Battleships were sunk or damaged, but the carriers and the base\'s fuel and repair yards remained.' },
    { L: [2, 3], q: 'What U.S. action in the summer of 1941 pushed Japan toward war?', a: 'freezing Japanese assets and cutting off oil sales', w: ['declaring war on Japan', 'invading Japan', 'joining the Axis'], why: 'Japan depended on imported oil; its leaders decided to strike and seize Southeast Asia\'s resources.' },
    { L: [3], q: 'The United States declared war on Germany before it declared war on Japan.', tf: false, why: 'False: war on Japan December 8; Germany declared war on the U.S. December 11.' },
    { L: [3], q: 'Pearl Harbor was the start of World War II.', tf: false, why: 'False: it brought the U.S. in. The war began in Europe in 1939, and in China earlier.' },
    { L: [3], q: 'About Pearl Harbor:', all: [['Japan also attacked the Philippines that day.', true], ['The Senate voted 82 to 0 for war.', true], ['Jeannette Rankin voted against war.', true], ['Germany attacked Pearl Harbor.', false]], why: 'Japan attacked; Germany declared war three days later.' },
    { L: [1, 2, 3], ord: [[1937, 'Japan invades China'], [1939, 'Germany invades Poland'], [1940, 'France falls'], [1941, 'Pearl Harbor attacked'], [1942, 'Battle of Midway'], [1931, 'Japan invades Manchuria']] }
  ]));

  G('ush2.wwii-home-front', bank([
    { L: [1, 2], q: 'Who was "Rosie the Riveter"?', a: 'a symbol of women working in war factories', w: ['a famous general', 'a radio star of the 1920s', 'a ship launched in 1942'], why: 'Over six million women took war jobs; Rosie stood for them.' },
    { L: [1, 2], q: 'What did Executive Order 8802 (1941) do?', a: 'banned discrimination in defense industries and federal agencies', w: ['desegregated the armed forces', 'ordered the removal of Japanese Americans', 'started rationing'], why: 'Roosevelt issued it after A. Philip Randolph threatened a march on Washington. Truman desegregated the military in 1948.' },
    { L: [1, 2, 3], q: 'In what year did the Pittsburgh Courier launch the "Double V" campaign?', year: 1942, why: 'February 1942: victory over the Axis abroad and over discrimination at home.' },
    { L: [2, 3], q: 'Who threatened a march on Washington in 1941 to win fair hiring in defense jobs?', a: 'A. Philip Randolph', w: ['Martin Luther King Jr.', 'W. E. B. Du Bois', 'Marcus Garvey'], why: 'Randolph led the Brotherhood of Sleeping Car Porters; he called off the march after Executive Order 8802.' },
    { L: [1, 2, 3], gen: sortGen(['rationing', 'war bonds', 'the Bracero Program', 'the Double V campaign', 'scrap drives'], [['ration books for sugar, coffee and gasoline', 0], ['citizens lending money to the government for the war', 1], ['Mexican farm workers recruited to fill labor shortages', 2], ['victory abroad and against discrimination at home', 3], ['collecting old metal and rubber to make weapons', 4]], 'Which part of the home front is this?') },
    { L: [2, 3], q: 'What happened to unemployment during the war?', a: 'it fell from about 14 percent in 1940 to under 2 percent', w: ['it rose to 25 percent', 'it stayed above 14 percent', 'it was not measured'], why: 'War production and the draft absorbed nearly every worker.' },
    { L: [2, 3], q: 'What happened to many women\'s factory jobs after the war?', a: 'many women were laid off or left as veterans returned', w: ['every woman kept her factory job', 'women were barred from all paid work by law', 'factories hired only women'], why: 'Many factory jobs ended, though women\'s paid work kept rising over the following decades.' },
    { L: [2, 3], q: 'Which unit of Black pilots flew fighter escorts in Europe?', a: 'the Tuskegee Airmen', w: ['the Rough Riders', 'the Buffalo Soldiers', 'the 442nd Regimental Combat Team'], why: 'The Tuskegee Airmen trained in Alabama. The 442nd was a Japanese American unit.' },
    { L: [3], q: 'The armed forces were racially integrated during World War II.', tf: false, why: 'False: Black Americans served in segregated units; Truman ordered desegregation in 1948.' },
    { L: [3], q: 'About the home front:', all: [['More than 16 million Americans served in the armed forces.', true], ['Women\'s share of the labor force rose.', true], ['Gasoline and sugar were rationed.', true], ['Factories kept making cars as usual.', false]], why: 'Car plants switched to tanks, trucks and bombers.' },
    { L: [2, 3], ord: [[1940, 'First peacetime draft'], [1941, 'Executive Order 8802'], [1942, 'Double V campaign; Bracero Program'], [1943, 'Detroit riot and Zoot Suit Riots'], [1945, 'War ends'], [1948, 'Truman orders the military desegregated']] }
  ]));

  G('ush2.japanese-american-incarceration', bank([
    { L: [1, 2, 3], q: 'In what year did Roosevelt sign Executive Order 9066?', year: 1942, why: 'February 19, 1942.' },
    { L: [1, 2], q: 'About how many people of Japanese ancestry were forced from their homes into camps?', a: 'about 120,000', w: ['about 1,200', 'about 12,000', 'about 1.2 million'], why: 'About 120,000, mostly from the West Coast.' },
    { L: [1, 2], q: 'About what share of those incarcerated were U.S. citizens?', a: 'about two-thirds', w: ['almost none', 'about one-tenth', 'about one-third'], why: 'About two-thirds were citizens born in the U.S.; most of the rest were immigrants barred by law from naturalizing.' },
    { L: [1, 2], q: 'In Korematsu v. United States (1944), what did the Supreme Court decide?', a: 'it upheld the exclusion of Japanese Americans from the West Coast', w: ['it struck down Executive Order 9066', 'it ordered redress payments', 'it ended all wartime powers'], why: 'The Court ruled 6 to 3 for the government, citing military necessity.', viz: caseViz('korematsu', { hide: ['name', 'holding'] }) },
    { L: [2, 3], q: 'Which 1988 law apologized and paid redress to survivors?', a: 'the Civil Liberties Act of 1988', w: ['the Civil Rights Act of 1964', 'the Immigration Act of 1924', 'the Voting Rights Act'], why: 'It paid $20,000 to each surviving person; Reagan signed it August 10, 1988.'.replace('$', '\\$') },
    { L: [2, 3], q: 'Which justice called the exclusion the "legalization of racism" in his dissent?', a: 'Frank Murphy', w: ['Hugo Black', 'Earl Warren', 'Oliver Wendell Holmes'], why: 'Justice Black wrote the majority; Murphy, Roberts and Jackson dissented.', viz: docViz('A dissent, 1944', 'Korematsu v. United States, 323 U.S. 214 (public domain)', 'I dissent, therefore, from this legalization of racism.') },
    { L: [2, 3], q: 'What did Ex parte Endo (decided the same day as Korematsu) hold?', a: 'the government could not keep a loyal citizen in a camp', w: ['the camps were required by the Constitution', 'Japanese immigrants could not become citizens', 'the exclusion orders were valid forever'], why: 'After Endo the camps began to close; the last closed in 1946.' },
    { L: [2, 3], q: 'Which Japanese American unit became the most decorated of its size in the war?', a: 'the 442nd Regimental Combat Team', w: ['the Tuskegee Airmen', 'the Seventh Cavalry', 'the Rough Riders'], why: 'Many of its soldiers had families in the camps.' },
    { L: [3], q: 'Most of the people incarcerated were foreign nationals.', tf: false, why: 'False: about two-thirds were U.S. citizens.' },
    { L: [3], q: 'In Hawaii, there was no mass removal of people of Japanese ancestry.', tf: true, why: 'True: they were a large share of Hawaii\'s population; a much smaller number were detained.' },
    { L: [3], q: 'About the incarceration:', all: [['Korematsu was decided 6 to 3.', true], ['Korematsu\'s conviction was vacated in 1983.', true], ['Congress paid redress in 1988.', true], ['Many Japanese Americans were convicted of spying.', false]], why: 'No Japanese American was convicted of spying or sabotage for Japan during the war.' },
    { L: [1, 2, 3], ord: [[1941, 'Pearl Harbor attacked'], [1942, 'Executive Order 9066'], [1944, 'Korematsu v. United States'], [1946, 'Last camp closes'], [1983, 'Korematsu\'s conviction vacated'], [1988, 'Civil Liberties Act']] }
  ]));

  var EUROPE_SEQ = [['Germany invades the Soviet Union (June 1941)', 1], ['Operation Torch: North Africa (November 1942)', 2], ['Soviet victory at Stalingrad (February 1943)', 3], ['Allies invade Sicily (July 1943)', 4], ['D-Day in Normandy (June 1944)', 5], ['Paris liberated (August 1944)', 6], ['Battle of the Bulge begins (December 1944)', 7], ['V-E Day (May 1945)', 8]];
  G('ush2.wwii-europe', bank([
    { L: [1, 2], q: 'What was D-Day (June 6, 1944)?', a: 'the Allied landings in Normandy, France', w: ['the attack on Pearl Harbor', 'Germany\'s surrender', 'the landings in North Africa'], why: 'About 156,000 Allied soldiers landed on five beaches under General Eisenhower.' },
    { L: [1, 2], q: 'On what date is V-E Day, when Germany surrendered?', a: 'May 8, 1945', w: ['June 6, 1944', 'August 15, 1945', 'November 11, 1918'], why: 'Victory in Europe: May 8, 1945.' },
    { L: [1, 2], q: 'About how many Jews did Nazi Germany and its collaborators murder in the Holocaust?', a: 'about six million', w: ['about six thousand', 'about sixty thousand', 'about six hundred thousand'], why: 'About six million Jews, along with millions of others.' },
    { L: [1, 2, 3], q: 'In what year did the D-Day landings take place?', year: 1944, why: 'June 6, 1944.' },
    { L: [2, 3], q: 'Where did American troops first fight Germany and Italy, in November 1942?', a: 'North Africa', w: ['Normandy', 'Sicily', 'the Ardennes'], why: 'Operation Torch landed in Morocco and Algeria in November 1942.' },
    { L: [2, 3], q: 'What was the Battle of the Bulge?', a: 'Germany\'s last big offensive, in the Ardennes, December 1944 to January 1945', w: ['the first landing in Italy', 'the Soviet defense of Stalingrad', 'the bombing of Berlin in 1941'], why: 'The German attack bulged the Allied line but failed.' },
    { L: [2, 3], q: 'Which Allied nation fought Germany on land in the East from 1941 and suffered the most deaths?', a: 'the Soviet Union', w: ['France', 'Canada', 'the United States'], why: 'Germany invaded the Soviet Union in June 1941; Stalingrad turned the tide in early 1943.' },
    { L: [2, 3], q: 'Who commanded the Allied forces on D-Day?', a: 'Dwight Eisenhower', w: ['Douglas MacArthur', 'John J. Pershing', 'George Washington'], why: 'Eisenhower was Supreme Allied Commander in Europe; MacArthur commanded in the Southwest Pacific.' },
    { L: [3], q: 'D-Day was the first time American soldiers fought in Europe or North Africa in World War II.', tf: false, why: 'False: they had fought in North Africa since 1942 and in Sicily and Italy since 1943.' },
    { L: [3], q: 'About the war in Europe:', all: [['The Allies invaded Sicily in 1943.', true], ['American troops liberated Dachau.', true], ['Roosevelt died before V-E Day.', true], ['D-Day came before the North Africa landings.', false]], why: 'North Africa (1942), Sicily (1943), Normandy (1944). Roosevelt died April 12, 1945.' },
    { L: [1, 2, 3], gen: seqOrd(EUROPE_SEQ).gen },
    { L: [2, 3], tl: EUROPE_EVENTS }
  ]));

  G('ush2.wwii-pacific', bank([
    { L: [1, 2], q: 'Which 1942 battle, where U.S. planes sank four Japanese carriers, was the turning point in the Pacific?', a: 'Midway', w: ['Pearl Harbor', 'Okinawa', 'Iwo Jima'], why: 'At Midway (June 4–7, 1942), code breakers helped the U.S. Navy ambush the Japanese fleet.' },
    { L: [1, 2], q: 'What was "island hopping"?', a: 'capturing key islands for bases while bypassing others on the way to Japan', w: ['moving the capital to Hawaii', 'evacuating civilians from islands', 'a trade policy with island nations'], why: 'Bypassed garrisons were cut off from supplies.' },
    { L: [1, 2], gen: function (R) { var c = R.pick([['Hiroshima', 'August 6, 1945'], ['Nagasaki', 'August 9, 1945']]); return { q: 'On what date was the atomic bomb dropped on ' + c[0] + '?', a: c[1], w: ['August 6, 1945', 'August 9, 1945', 'September 2, 1945', 'December 7, 1941', 'June 6, 1944'].filter(function (x) { return x !== c[1]; }), why: 'Hiroshima August 6, Nagasaki August 9, 1945; the surrender was signed September 2.' }; } },
    { L: [2, 3], q: 'Who approved the use of the atomic bomb?', a: 'President Harry Truman', w: ['President Franklin Roosevelt', 'General Eisenhower', 'Winston Churchill'], why: 'Truman, President since April 1945, approved it after Japan rejected the call for unconditional surrender.' },
    { L: [2, 3], q: 'What do critics of the decision to use the bomb argue?', a: 'Japan was weakening, and the Soviet entry or other options might have brought surrender', w: ['the bomb did not work', 'the U.S. had already invaded Japan', 'Japan had surrendered before August 6'], why: 'Historians debate it: critics cite Japan\'s position and alternatives; supporters cite the cost of an invasion.' },
    { L: [2, 3], q: 'What do supporters of the decision to use the bomb argue?', a: 'an invasion of Japan would have cost far more lives', w: ['Japan had already surrendered', 'no civilians lived in the cities', 'the Soviet Union asked for it'], why: 'They point to Okinawa and Iwo Jima and the planned invasion. The question is debated; know each side\'s evidence.' },
    { L: [2, 3], q: 'Where was Japan\'s formal surrender signed on September 2, 1945?', a: 'aboard the USS Missouri in Tokyo Bay', w: ['at Pearl Harbor', 'in Potsdam', 'at Yalta'], why: 'Japan announced surrender August 15 and signed on September 2.' },
    { L: [2, 3], q: 'What was the Manhattan Project?', a: 'the secret program that built the atomic bomb', w: ['a plan to rebuild New York', 'the invasion of Okinawa', 'a code-breaking unit'], why: 'The first test was in New Mexico on July 16, 1945.' },
    { L: [3], q: 'Historians agree completely about the decision to use the atomic bomb.', tf: false, why: 'False: they debate it; teach the evidence on each side.' },
    { L: [3], q: 'About the war in the Pacific:', all: [['Midway came in June 1942.', true], ['The Soviet Union declared war on Japan on August 8, 1945.', true], ['Iwo Jima and Okinawa were fought in 1945.', true], ['Japan signed the surrender before Hiroshima.', false]], why: 'Hiroshima August 6, Soviet entry August 8, Nagasaki August 9, surrender announced August 15, signed September 2.' },
    { L: [1, 2, 3], gen: seqOrd(PACIFIC_ORDER).gen },
    { L: [2, 3], tl: PACIFIC_EVENTS }
  ]));

  G('ush2.planning-peace', bank([
    { L: [1, 2, 3], q: 'In what year was the United Nations founded?', year: 1945, why: 'The Charter was signed June 26, 1945, and took effect October 24, 1945.' },
    { L: [1, 2], q: 'Which leaders met at Yalta in February 1945?', a: 'Roosevelt, Churchill and Stalin', w: ['Truman, Stalin and Attlee', 'Wilson, Lloyd George and Clemenceau', 'Roosevelt, Hitler and Mussolini'], why: 'Yalta: the "Big Three." At Potsdam (July 1945), Truman had replaced Roosevelt, and Attlee replaced Churchill partway through.' },
    { L: [1, 2], q: 'Which five nations are permanent members of the UN Security Council?', a: 'the U.S., the Soviet Union (now Russia), Britain, France and China', w: ['the U.S., Germany, Japan, Italy and Britain', 'the U.S., Canada, Mexico, Brazil and Britain', 'all members, in turn'], why: 'Each of the five has a veto.' },
    { L: [2, 3], q: 'What did Stalin promise at Yalta?', a: 'to enter the war against Japan within three months of Germany\'s defeat, and free elections in Poland', w: ['to leave Eastern Europe at once', 'to join NATO', 'to give up the atomic bomb'], why: 'He entered the war against Japan on August 8, 1945; the promise of free elections was broken.' },
    { L: [2, 3], q: 'How did the Senate vote on the UN Charter in July 1945?', a: '89 to 2 in favor', w: ['it rejected the Charter', '50 to 46 in favor', 'it never voted'], why: 'A broad, bipartisan majority, unlike the League fight of 1919–1920.' },
    { L: [2, 3], gen: sortGen(['Yalta', 'Potsdam', 'Bretton Woods', 'San Francisco'], [['Germany to be divided into occupation zones (February 1945)', 0], ['the call for Japan\'s unconditional surrender (July 1945)', 1], ['the International Monetary Fund and World Bank (1944)', 2], ['the United Nations Charter signed (June 1945)', 3], ['Truman meets Stalin for the first time', 1], ['Roosevelt\'s last meeting with Stalin', 0]], 'Which wartime conference is this?') },
    { L: [2, 3], q: 'What were the Nuremberg trials?', a: 'trials of Nazi leaders for war crimes, 1945 to 1946', w: ['trials of American strikers', 'a peace conference in 1919', 'the trial of Japanese Americans'], why: 'An international tribunal tried Nazi leaders.' },
    { L: [3], q: 'The United Nations was simply the League of Nations renamed.', tf: false, why: 'False: they were separate. The U.S. never joined the League; it helped found the UN in 1945.' },
    { L: [3], q: 'About planning the peace:', all: [['Yalta came before Potsdam.', true], ['The UN Charter was signed in San Francisco.', true], ['Permanent Security Council members have a veto.', true], ['The U.S. refused to join the UN.', false]], why: 'The Senate approved the Charter 89 to 2.' },
    { L: [1, 2, 3], gen: seqOrd([['Bretton Woods conference (July 1944)', 1], ['Yalta Conference (February 1945)', 2], ['Roosevelt dies (April 1945)', 3], ['UN Charter signed (June 1945)', 4], ['Potsdam Conference (July 1945)', 5], ['UN Charter takes effect (October 1945)', 6], ['Nuremberg trials begin (November 1945)', 7]]).gen }
  ]));

  /* ================= Unit 5: The Cold War ================= */
  var CW_EVENTS = [[1947, 'Truman Doctrine'], [1948, 'Marshall Plan begins; Berlin blockade'], [1949, 'NATO founded'], [1950, 'Korean War begins'], [1953, 'Korean armistice'], [1957, 'Sputnik launched'],
    [1961, 'Bay of Pigs; Berlin Wall built'], [1962, 'Cuban Missile Crisis'], [1964, 'Gulf of Tonkin Resolution'], [1968, 'Tet Offensive'], [1969, 'Apollo 11 lands on the Moon'], [1972, 'Nixon visits China; SALT I'],
    [1973, 'Paris Peace Accords'], [1974, 'Nixon resigns'], [1975, 'Fall of Saigon'], [1987, 'INF Treaty'], [1989, 'Berlin Wall falls'], [1991, 'Soviet Union dissolves']];

  G('ush2.containment', bank([
    { L: [1, 2, 3], gen: sortGen(['the Truman Doctrine', 'the Marshall Plan', 'the Berlin Airlift', 'NATO'], [['aid to Greece and Turkey against communist pressure (1947)', 0], ['about 13 billion dollars to rebuild Western Europe', 1], ['flying food and coal into a blockaded city (1948–1949)', 2], ['an alliance: an attack on one is an attack on all (1949)', 3], ['"support free peoples who are resisting attempted subjugation"', 0], ['sixteen countries receive grants and loans', 1]], 'Which containment policy is this?') },
    { L: [1, 2], q: 'What was the goal of containment?', a: 'to stop the spread of Soviet communism', w: ['to invade the Soviet Union', 'to bring U.S. troops home from Europe', 'to rebuild Japan as a colony'], why: 'George Kennan argued Soviet expansion could be held back by firm, patient resistance.' },
    { L: [1, 2, 3], q: 'In what year was NATO founded?', year: 1949, why: 'April 4, 1949, by twelve nations.' },
    { L: [2, 3], q: '"I believe that it must be the policy of the United States to support free peoples…" This sentence states which policy?', a: 'the Truman Doctrine', w: ['the Marshall Plan', 'the Monroe Doctrine', 'the Open Door'], why: 'Truman\'s address to Congress, March 12, 1947.', viz: docViz('An address to Congress, 1947', 'Harry S. Truman (public domain)', 'I believe that it must be the policy of the United States to support free peoples who are resisting attempted subjugation by armed minorities or by outside pressures.') },
    { L: [2, 3], q: 'How did the U.S. and Britain respond when the Soviets blockaded West Berlin in 1948?', a: 'an airlift of food and coal for almost a year', w: ['an invasion of East Germany', 'giving West Berlin to the Soviets', 'a nuclear strike'], why: 'The airlift ran until the Soviets lifted the blockade in May 1949.' },
    { L: [2, 3], q: 'Why did the Marshall Plan give money to rebuild Western Europe?', a: 'its planners believed poverty would make communism more appealing', w: ['to collect war debts', 'to buy European colonies', 'because Europe had won the war alone'], why: 'Recovery would strengthen democracies and trade partners.' },
    { L: [2, 3], q: 'Which Soviet event in 1949 shocked Americans?', a: 'its first atomic bomb test', w: ['the launch of Sputnik', 'the building of the Berlin Wall', 'the fall of the Soviet Union'], why: 'The Soviets tested an atomic bomb in August 1949. Sputnik came in 1957; the Wall in 1961.' },
    { L: [3], q: 'During the Cold War, U.S. and Soviet armies fought each other directly in Europe.', tf: false, why: 'False: they never fought each other directly; they competed through alliances, aid, arms and wars in other lands.' },
    { L: [3], q: 'About containment:', all: [['The Truman Doctrine came in 1947.', true], ['The Soviets refused Marshall Plan aid.', true], ['NATO was founded in 1949.', true], ['The Warsaw Pact was a U.S. alliance.', false]], why: 'The Warsaw Pact (1955) was the Soviet bloc\'s alliance.' },
    { L: [1, 2, 3], ord: [[1946, 'Churchill\'s "iron curtain" speech'], [1947, 'Truman Doctrine'], [1948, 'Berlin blockade begins'], [1949, 'NATO founded'], [1955, 'Warsaw Pact'], [1950, 'Korean War begins']] },
    { L: [2, 3], tl: CW_EVENTS.slice(0, 8) }
  ]));

  G('ush2.second-red-scare', bank([
    { L: [1, 2], q: 'Which senator made sweeping accusations of communists in government from 1950 to 1954?', a: 'Joseph McCarthy', w: ['Richard Nixon', 'Henry Cabot Lodge', 'Huey Long'], why: 'McCarthy began with his Wheeling speech in February 1950; the Senate censured him in 1954.' },
    { L: [1, 2, 3], q: 'In what year did the Senate censure Joseph McCarthy?', year: 1954, why: 'December 2, 1954, by 67 to 22, after the televised Army-McCarthy hearings.' },
    { L: [1, 2], q: 'Julius and Ethel Rosenberg were executed in 1953 for…', a: 'passing atomic secrets to the Soviet Union', w: ['leading a strike', 'refusing to testify about baseball', 'organizing the Montgomery boycott'], why: 'They were convicted of conspiracy to commit espionage in 1951.' },
    { L: [2, 3], q: 'What was HUAC?', a: 'the House Un-American Activities Committee', w: ['a Senate committee chaired by McCarthy', 'a Soviet spy agency', 'a labor union'], why: 'HUAC was a House committee; McCarthy was a senator and did not lead it.' },
    { L: [2, 3], q: 'What did the Venona decrypts, made public in 1995, show?', a: 'there was real Soviet espionage in the U.S. in the 1940s', w: ['there were no Soviet spies at all', 'McCarthy\'s lists were all accurate', 'the Rosenbergs were never involved'], why: 'They confirmed many agents; many other accusations of the era were baseless.' },
    { L: [2, 3], q: '"Have you no sense of decency, sir?" Who asked McCarthy this in 1954?', a: 'Joseph Welch, the Army\'s lawyer', w: ['President Eisenhower', 'Alger Hiss', 'Edward R. Murrow'], why: 'During the televised Army-McCarthy hearings; public support for McCarthy fell.' },
    { L: [2, 3], q: 'Alger Hiss, a former State Department official accused of spying, was convicted in 1950 of…', a: 'perjury (lying under oath)', w: ['treason', 'murder', 'tax evasion'], why: 'The statute of limitations had passed for espionage; he was convicted of perjury.' },
    { L: [2, 3], q: 'What was the blacklist?', a: 'a list of people in Hollywood and elsewhere denied work for suspected communist ties', w: ['a list of Soviet cities', 'a voting rule', 'a tax list'], why: 'Many lost jobs for past political ties rather than any crime.' },
    { L: [3], q: 'There was no Soviet spying in the United States; every accusation was false.', tf: false, why: 'False: real espionage existed, and many accusations against ordinary people were also baseless. Both are true.' },
    { L: [3], q: 'About the Second Red Scare:', all: [['The Soviet atomic bomb of 1949 raised fears.', true], ['McCarthy rarely proved his charges.', true], ['The Senate censured McCarthy.', true], ['McCarthy chaired HUAC in the House.', false]], why: 'McCarthy was a senator; HUAC was a House committee.' },
    { L: [1, 2, 3], ord: [[1947, 'Federal loyalty program begins'], [1949, 'Soviet atomic bomb'], [1950, 'McCarthy\'s Wheeling speech'], [1953, 'Rosenbergs executed'], [1954, 'McCarthy censured'], [1995, 'Venona decrypts made public']] }
  ]));

  G('ush2.korean-war', bank([
    { L: [1, 2, 3], q: 'In what year did North Korea invade South Korea?', year: 1950, why: 'June 25, 1950.' },
    { L: [1, 2], q: 'How did the Korean War end in 1953?', a: 'with an armistice; Korea stayed divided', w: ['with a peace treaty uniting Korea', 'with a U.S. victory over China', 'with North Korea joining the UN forces'], why: 'The armistice of July 27, 1953, left Korea divided near the 38th parallel. There is still no peace treaty.' },
    { L: [1, 2], q: 'Near which line was Korea divided, before and after the war?', a: 'the 38th parallel', w: ['the 17th parallel', 'the Mason-Dixon line', 'the equator'], why: 'Korea was divided at the 38th parallel in 1945; the 1953 line runs near it. The 17th parallel divided Vietnam.' },
    { L: [2, 3], q: 'Why did Truman relieve General MacArthur of command in 1951?', a: 'MacArthur publicly challenged the President\'s policy by calling for a wider war with China', w: ['MacArthur lost the Inchon landing', 'MacArthur refused to fight', 'Congress ordered it'], why: 'Truman upheld civilian control of the military.' },
    { L: [2, 3], q: 'Which country sent hundreds of thousands of troops to fight for North Korea from late 1950?', a: 'China', w: ['Japan', 'the Soviet Union, with its army', 'India'], why: 'Chinese forces entered as UN troops neared the Chinese border.' },
    { L: [2, 3], q: 'Did Congress declare war in Korea?', a: 'No. The U.S. fought as part of a UN action, without a declaration.', w: ['Yes, in June 1950.', 'Yes, after China entered.', 'No, because the U.S. did not take part.'], why: 'The UN Security Council, which the Soviets were boycotting, called for aid to South Korea.' },
    { L: [2, 3], q: 'MacArthur\'s landing that turned the war in September 1950 was at…', a: 'Inchon', w: ['Normandy', 'Okinawa', 'Pusan'], why: 'The Inchon landing behind enemy lines drove the North Koreans back.' },
    { L: [3], q: 'The Korean War ended with a peace treaty in 1953.', tf: false, why: 'False: it ended in an armistice. No peace treaty has been signed.' },
    { L: [3], q: 'About the Korean War:', all: [['It began in June 1950.', true], ['China entered the war.', true], ['Truman relieved MacArthur.', true], ['It ended with Korea united.', false]], why: 'Korea remains divided.' },
    { L: [1, 2, 3], gen: seqOrd([['North Korea invades (June 1950)', 1], ['Inchon landing (September 1950)', 2], ['China enters the war (October 1950)', 3], ['Truman relieves MacArthur (April 1951)', 4], ['Eisenhower elected (November 1952)', 5], ['Armistice signed (July 1953)', 6]]).gen }
  ]));

  G('ush2.fifties', bank([
    { L: [1, 2, 3], gen: sortGen(['the GI Bill', 'the Interstate Highway Act', 'Sputnik', 'Levittown'], [['college tuition and home loans for veterans (1944)', 0], ['a 41,000-mile system of highways (1956)', 1], ['the first artificial satellite, launched by the Soviets (1957)', 2], ['mass-produced suburban houses on Long Island (1947)', 3], ['the National Defense Education Act followed it', 2], ['justified partly for national defense', 1]], 'Which part of the 1950s is described?') },
    { L: [1, 2, 3], q: 'In what year did the Soviet Union launch Sputnik?', year: 1957, why: 'October 4, 1957. NASA and the National Defense Education Act followed in 1958.' },
    { L: [1, 2], q: 'What was the baby boom?', a: 'a sharp rise in births from 1946 to 1964', w: ['a fall in births during the war', 'a new kind of bomb', 'a toy craze of the 1950s'], why: 'Births rose sharply after the war and stayed high until the mid-1960s.' },
    { L: [2, 3], q: 'How were many Black families kept out of new suburbs such as Levittown?', a: 'restrictive covenants and lending practices such as redlining', w: ['a federal law banning them from suburbs', 'the GI Bill excluded all Black veterans by its text', 'high suburban taxes only'], why: 'Levittown\'s deeds barred non-white buyers; federal mortgage rules backed redlining.' },
    { L: [2, 3], q: 'In his 1961 farewell address, Eisenhower warned against…', a: 'the unchecked influence of a "military-industrial complex"', w: ['the danger of television', 'the space race', 'the GI Bill'], why: 'A former general, he warned that defense industries and the military could gain too much influence.' },
    { L: [2, 3], q: 'Which 1948 case held that courts could not enforce racial covenants in deeds?', a: 'Shelley v. Kraemer', w: ['Plessy v. Ferguson', 'Brown v. Board of Education', 'Korematsu v. United States'], why: 'Court enforcement is state action under the Fourteenth Amendment; discrimination in lending went on.' },
    { L: [2, 3], q: 'About what share of Americans lived in poverty in 1959?', a: 'about one in five', w: ['almost none', 'about one in a hundred', 'about half'], why: 'Poverty remained in rural areas, Appalachia and inner cities despite the boom.' },
    { L: [3], q: 'The prosperity of the 1950s reached every American family equally.', tf: false, why: 'False: suburbs excluded many Black families, and poverty remained widespread.' },
    { L: [3], q: 'About the 1950s:', all: [['Television spread to most homes.', true], ['The Interstate Highway Act passed in 1956.', true], ['Sputnik spurred science education.', true], ['The GI Bill was passed in 1959.', false]], why: 'The GI Bill was signed in June 1944.' },
    { L: [1, 2, 3], ord: [[1944, 'GI Bill'], [1947, 'Levittown begins'], [1948, 'Shelley v. Kraemer'], [1956, 'Interstate Highway Act'], [1957, 'Sputnik launched'], [1958, 'NASA created'], [1961, 'Eisenhower\'s farewell address']] }
  ]));

  G('ush2.kennedy-cuba', bank([
    { L: [1, 2], q: 'What was the Bay of Pigs (1961)?', a: 'a failed invasion of Cuba by CIA-trained Cuban exiles', w: ['a U.S. naval victory over the Soviets', 'the site of the Moon landing', 'a peace treaty with Cuba'], why: 'About 1,400 exiles landed in April 1961 and were defeated within days.' },
    { L: [1, 2, 3], q: 'In what year was the Cuban Missile Crisis?', year: 1962, why: 'October 16 to 28, 1962: thirteen days.' },
    { L: [1, 2], q: 'How did Kennedy respond when Soviet missiles were found in Cuba?', a: 'a naval "quarantine" of Cuba and a demand that the missiles be removed', w: ['an immediate invasion of Cuba', 'an air strike on Moscow', 'ignoring them'], why: 'He rejected an immediate air strike and chose a quarantine while negotiating.' },
    { L: [2, 3], q: 'What did the U.S. give in the deal that ended the Cuban Missile Crisis?', a: 'a pledge not to invade Cuba, and secretly, removal of U.S. missiles from Turkey', w: ['control of West Berlin', 'nothing at all', 'recognition of East Germany'], why: 'The Soviets removed their missiles; the Turkey part was kept secret for years.' },
    { L: [2, 3], q: 'Which President set the goal of landing a man on the Moon "before this decade is out"?', a: 'John F. Kennedy, in 1961', w: ['Richard Nixon, in 1969', 'Dwight Eisenhower, in 1957', 'Lyndon Johnson, in 1965'], why: 'Kennedy\'s message to Congress, May 25, 1961.', viz: docViz('A message to Congress, 1961', 'May 25, 1961 (public domain)', 'First, I believe that this nation should commit itself to achieving the goal, before this decade is out, of landing a man on the moon and returning him safely to the earth.') },
    { L: [1, 2, 3], q: 'In what year did Apollo 11 land on the Moon?', year: 1969, why: 'July 20, 1969, under President Nixon.' },
    { L: [2, 3], q: 'Who was President when Apollo 11 landed on the Moon?', a: 'Richard Nixon', w: ['John F. Kennedy', 'Lyndon Johnson', 'Dwight Eisenhower'], why: 'Kennedy set the goal in 1961 and was assassinated in 1963; the landing came in 1969.' },
    { L: [2, 3], q: 'Why did East Germany build the Berlin Wall in 1961?', a: 'to stop its people from escaping to the West', w: ['to keep West Germans out of a war zone', 'to protect against flooding', 'because the U.S. demanded it'], why: 'Millions had fled through West Berlin; the Wall went up August 13, 1961.' },
    { L: [3], q: 'President Kennedy watched the Moon landing as President.', tf: false, why: 'False: he was assassinated in November 1963; the landing was in July 1969.' },
    { L: [3], q: 'About the Kennedy years:', all: [['The Bay of Pigs failed in 1961.', true], ['The Berlin Wall went up in 1961.', true], ['A hotline and a test ban treaty followed the missile crisis.', true], ['The Soviets kept their missiles in Cuba.', false]], why: 'The Soviets removed the missiles.' },
    { L: [1, 2, 3], gen: seqOrd([['Castro takes power in Cuba (January 1959)', 1], ['Bay of Pigs (April 1961)', 2], ['Kennedy sets the Moon goal (May 1961)', 3], ['Berlin Wall built (August 1961)', 4], ['Cuban Missile Crisis (October 1962)', 5], ['Kennedy assassinated (November 1963)', 6], ['Apollo 11 lands on the Moon (July 1969)', 7]]).gen }
  ]));

  G('ush2.vietnam', bank([
    { L: [1, 2], q: 'Did Congress declare war in Vietnam?', a: 'No. The Gulf of Tonkin Resolution (1964) authorized the President to use force.', w: ['Yes, in 1964.', 'Yes, in 1968 after Tet.', 'No, because no U.S. troops went there.'], why: 'The resolution passed 416 to 0 and 88 to 2; no declaration of war was ever made.' },
    { L: [1, 2, 3], q: 'In what year was the Tet Offensive?', year: 1968, why: 'It began January 30, 1968.' },
    { L: [1, 2, 3], q: 'In what year did Saigon fall to North Vietnam?', year: 1975, why: 'April 30, 1975, two years after U.S. combat forces left.' },
    { L: [2, 3], q: 'Why was the Tet Offensive a turning point, even though it failed militarily?', a: 'it made many Americans doubt official claims of progress', w: ['it captured Washington', 'it ended the war in 1968', 'it brought China into the war'], why: 'Attackers were driven back with heavy losses, but public support fell; in March Johnson said he would not run again.' },
    { L: [2, 3], q: 'What did the War Powers Resolution (1973) require?', a: 'the President must report to Congress within 48 hours and withdraw forces after 60 days without its approval', w: ['a declaration of war before any troops are sent', 'the end of the draft', 'that only the Senate may approve treaties'], why: 'Passed over Nixon\'s veto; Presidents have since disputed parts of it.' },
    { L: [2, 3], q: 'What was "Vietnamization"?', a: 'Nixon\'s plan to withdraw U.S. troops while South Vietnam\'s forces took over the fighting', w: ['Johnson\'s first bombing campaign', 'the division of Vietnam in 1954', 'a French plan of the 1940s'], why: 'U.S. troops came home gradually from 1969, though the war widened into Cambodia in 1970.' },
    { L: [2, 3], q: 'What happened at Kent State University in May 1970?', a: 'National Guard troops fired on antiwar protesters, killing four students', w: ['the first draft lottery', 'a peace treaty was signed', 'Nixon resigned'], why: 'Protests had spread after the U.S. incursion into Cambodia.' },
    { L: [2, 3], q: 'What was the domino theory?', a: 'if one country fell to communism, its neighbors would follow', w: ['a plan to rebuild Europe', 'a theory of the stock market', 'the idea that bombing alone wins wars'], why: 'It explained why Presidents from Eisenhower on backed South Vietnam.' },
    { L: [3], q: 'Congress declared war on North Vietnam in 1964.', tf: false, why: 'False: the Gulf of Tonkin Resolution authorized force; there was no declaration.' },
    { L: [3], q: 'About the Vietnam War:', all: [['U.S. troops there grew to over 500,000.', true], ['The Paris Peace Accords were signed in 1973.', true], ['About 58,000 Americans died.', true], ['South Vietnam won the war in 1975.', false]], why: 'North Vietnam conquered the South in 1975.' },
    { L: [1, 2, 3], ord: [[1954, 'French defeated; Geneva Accords'], [1964, 'Gulf of Tonkin Resolution'], [1968, 'Tet Offensive'], [1970, 'Kent State shootings'], [1973, 'Paris Peace Accords'], [1975, 'Fall of Saigon']] },
    { L: [2, 3], tl: CW_EVENTS.slice(7, 15) }
  ]));

  G('ush2.great-society', bank([
    { L: [1, 2, 3], gen: sortGen(['Medicare', 'Medicaid'], [['health insurance for people 65 and older', 0], ['health care for people with low incomes', 1], ['run jointly with the states', 1], ['for a retired worker aged 70', 0], ['for a low-income family with young children', 1]], 'Medicare or Medicaid?') },
    { L: [1, 2, 3], q: 'In what year were Medicare and Medicaid created?', year: 1965, why: 'Johnson signed them on July 30, 1965.' },
    { L: [1, 2], q: 'Which President led the Great Society?', a: 'Lyndon Johnson', w: ['John F. Kennedy', 'Franklin Roosevelt', 'Richard Nixon'], why: 'Johnson (1963–1969) pushed his program through Congress from 1964 to 1966.' },
    { L: [2, 3], q: 'What did the Immigration and Nationality Act of 1965 end?', a: 'the national-origins quotas of the 1920s', w: ['all immigration', 'the Chinese Exclusion Act, for the first time', 'citizenship by birth'], why: 'It replaced quotas with preferences for family ties and skills. (Chinese exclusion had been repealed in 1943.)' },
    { L: [2, 3], gen: sortGen(['the War on Poverty', 'education', 'health care', 'immigration'], [['the Job Corps and VISTA', 0], ['Head Start for preschoolers', 0], ['the Elementary and Secondary Education Act', 1], ['Medicare', 2], ['ending national-origins quotas', 3], ['Medicaid', 2]], 'Which part of the Great Society is this?') },
    { L: [2, 3], q: 'What happened to the official poverty rate from 1964 to 1973?', a: 'it fell from about 19 percent to about 11 percent', w: ['it rose from 11 to 19 percent', 'it stayed the same', 'it fell to zero'], why: 'Supporters credit the programs; critics credit economic growth and question some programs. Both cite this record.' },
    { L: [2, 3], q: 'What do critics of the Great Society argue?', a: 'growth did much of the work, some programs did little or created dependence, and costs rose fast', w: ['it did not spend any money', 'it ended Medicare', 'it raised the voting age'], why: 'Describe each side\'s case: supporters point to lower poverty, especially among the elderly.' },
    { L: [3], q: 'Medicare covers people with low incomes of any age.', tf: false, why: 'False: Medicare covers people 65 and older; Medicaid covers people with low incomes.' },
    { L: [3], q: 'About the Great Society:', all: [['Johnson won the 1964 election in a landslide.', true], ['Head Start began in 1965.', true], ['The 1965 immigration law ended national-origins quotas.', true], ['The Great Society was Kennedy\'s 1961 program.', false]], why: 'Kennedy\'s program was the New Frontier; the Great Society was Johnson\'s.' },
    { L: [2, 3], ord: [[1962, 'The Other America published'], [1963, 'Kennedy assassinated'], [1964, 'Economic Opportunity Act'], [1965, 'Medicare and Medicaid'], [1968, 'Johnson declines to run again']] }
  ]));

  G('ush2.nixon-watergate', bank([
    { L: [1, 2], q: 'Was President Nixon impeached and removed from office?', a: 'No. He resigned before the full House voted on impeachment.', w: ['Yes, he was removed by the Senate.', 'Yes, he was impeached and acquitted.', 'No. He finished his second term.'], why: 'The House Judiciary Committee approved articles; Nixon resigned August 9, 1974.' },
    { L: [1, 2, 3], q: 'In what year did Nixon resign?', year: 1974, why: 'August 9, 1974.' },
    { L: [1, 2], q: 'Which country did Nixon visit in February 1972, opening relations?', a: 'China', w: ['Cuba', 'North Korea', 'Vietnam'], why: 'His visit to Beijing used the split between China and the Soviet Union.' },
    { L: [2, 3], q: 'What did the Supreme Court decide in United States v. Nixon (1974)?', a: 'Nixon had to turn over the subpoenaed tapes', w: ['executive privilege is absolute', 'the President cannot be investigated', 'the break-in was legal'], why: 'Executive privilege is real but yields to a criminal trial\'s specific need for evidence; the vote was 8 to 0.', viz: caseViz('nixon', { hide: ['name', 'holding'] }) },
    { L: [2, 3], gen: sortGen(['détente', 'domestic policy', 'Watergate'], [['SALT I arms limits with the Soviet Union', 0], ['creating the Environmental Protection Agency', 1], ['the break-in at the Democratic National Committee', 2], ['the visit to Beijing', 0], ['the Clean Air Act of 1970', 1], ['the Saturday Night Massacre', 2]], 'Which part of the Nixon years is this?') },
    { L: [2, 3], q: 'Who became President when Nixon resigned?', a: 'Gerald Ford', w: ['Spiro Agnew', 'Jimmy Carter', 'Henry Kissinger'], why: 'Ford had become Vice President under the Twenty-fifth Amendment after Agnew resigned; he pardoned Nixon in September 1974.' },
    { L: [2, 3], q: 'What does détente mean?', a: 'an easing of tension between rivals', w: ['a military buildup', 'a trade embargo', 'an alliance treaty'], why: 'Nixon and Kissinger sought détente with the Soviet Union and China.' },
    { L: [3], q: 'Nixon won the 1972 election in a landslide, months after the Watergate break-in.', tf: true, why: 'True: 520 electoral votes; the cover-up unraveled in 1973 and 1974.' },
    { L: [3], q: 'About Nixon and Watergate:', all: [['The break-in was in June 1972.', true], ['The Court ruled against Nixon on the tapes.', true], ['Ford pardoned Nixon.', true], ['The Senate removed Nixon from office.', false]], why: 'Nixon resigned; there was no Senate trial.' },
    { L: [1, 2, 3], gen: seqOrd([['EPA created (December 1970)', 1], ['Nixon visits China (February 1972)', 2], ['SALT I signed (May 1972)', 3], ['Watergate break-in (June 1972)', 4], ['Nixon reelected (November 1972)', 5], ['Saturday Night Massacre (October 1973)', 6], ['United States v. Nixon (July 1974)', 7], ['Nixon resigns (August 1974)', 8]]).gen }
  ]));

  G('ush2.end-of-cold-war', bank([
    { L: [1, 2, 3], q: 'In what year did the Berlin Wall fall?', year: 1989, why: 'November 9, 1989.' },
    { L: [1, 2, 3], q: 'In what year did the Soviet Union dissolve?', year: 1991, why: 'December 26, 1991.' },
    { L: [1, 2], q: 'Which Soviet leader launched glasnost and perestroika?', a: 'Mikhail Gorbachev', w: ['Joseph Stalin', 'Nikita Khrushchev', 'Leonid Brezhnev'], why: 'Gorbachev took power in 1985: glasnost (openness) and perestroika (restructuring).' },
    { L: [2, 3], q: 'What did the INF Treaty (1987) do?', a: 'eliminated a whole class of nuclear missiles', w: ['ended the Korean War', 'created NATO', 'divided Germany'], why: 'Reagan and Gorbachev signed it December 8, 1987.' },
    { L: [2, 3], q: '"Mr. Gorbachev, tear down this wall!" Who said it, and where?', a: 'Ronald Reagan, at the Brandenburg Gate in West Berlin (1987)', w: ['John F. Kennedy, in Berlin (1963)', 'George H. W. Bush, in Moscow (1991)', 'Harry Truman, to Congress (1947)'], why: 'June 12, 1987.' },
    { L: [2, 3], gen: sortGen(['U.S. pressure', 'Soviet economic weakness', 'Gorbachev\'s choices', 'the people of Eastern Europe'], [['Reagan\'s defense buildup and missile defense plans', 0], ['shortages, low growth and the cost of Afghanistan', 1], ['glasnost and refusing to use force in 1989', 2], ['Poland\'s Solidarity movement', 3], ['mass protests in East Germany', 3], ['falling oil prices hurting Soviet income', 1]], 'Historians weigh several explanations for the end of the Cold War. Which explanation does this evidence support?') },
    { L: [2, 3], q: 'How do historians explain the end of the Cold War?', a: 'they weigh several causes together and debate the balance', w: ['they agree it was one person alone', 'they agree nothing changed', 'they agree it ended in 1962'], why: 'U.S. pressure, Soviet weakness, Gorbachev\'s reforms and Eastern Europe\'s people all figure.' },
    { L: [3], q: 'Historians agree that a single cause ended the Cold War.', tf: false, why: 'False: they weigh several causes and debate the balance.' },
    { L: [3], q: 'About the end of the Cold War:', all: [['Gorbachev took power in 1985.', true], ['The INF Treaty was signed in 1987.', true], ['Germany reunified in 1990.', true], ['The Soviet Union dissolved in 1979.', false]], why: 'December 1991. 1979 was the Soviet invasion of Afghanistan.' },
    { L: [1, 2, 3], ord: [[1979, 'Soviet invasion of Afghanistan'], [1985, 'Gorbachev takes power'], [1987, 'INF Treaty'], [1989, 'Berlin Wall falls'], [1990, 'Germany reunified'], [1991, 'Soviet Union dissolves']] },
    { L: [2, 3], tl: CW_EVENTS.slice(10) }
  ]));

  /* ================= Unit 6: The Civil Rights Movement ================= */
  var CR_EVENTS = [[1944, 'Smith v. Allwright'], [1947, 'Jackie Robinson joins the Dodgers'], [1948, 'Executive Order 9981'], [1950, 'Sweatt v. Painter'], [1954, 'Brown v. Board of Education'], [1955, 'Montgomery Bus Boycott begins'],
    [1957, 'Little Rock Nine'], [1960, 'Greensboro sit-in'], [1961, 'Freedom Rides'], [1963, 'March on Washington'], [1964, 'Civil Rights Act of 1964'], [1965, 'Voting Rights Act'], [1966, 'Call for "Black Power"'], [1968, 'King assassinated; Fair Housing Act']];

  G('ush2.early-civil-rights', bank([
    { L: [1, 2, 3], q: 'In what year did Jackie Robinson join the Brooklyn Dodgers?', year: 1947, why: 'April 15, 1947, integrating major league baseball.' },
    { L: [1, 2], q: 'Which President ordered the armed forces desegregated in 1948?', a: 'Harry Truman', w: ['Franklin Roosevelt', 'Dwight Eisenhower', 'John F. Kennedy'], why: 'Executive Order 9981, July 26, 1948.' },
    { L: [1, 2], q: 'What did Mendez v. Westminster (1947) end?', a: 'the segregation of Mexican American children in California schools', w: ['segregated buses in Alabama', 'the white primary in Texas', 'segregation in the armed forces'], why: 'After the Ninth Circuit ruling, Governor Earl Warren signed a repeal of California\'s school segregation laws.' },
    { L: [1, 2, 3], gen: sortGen(['Smith v. Allwright (1944)', 'Mendez v. Westminster (1947)', 'Executive Order 9981 (1948)', 'Shelley v. Kraemer (1948)', 'Sweatt v. Painter (1950)'], [['struck down the "white primary"', 0], ['ended segregation of Mexican American schoolchildren in California', 1], ['equal treatment in the armed forces', 2], ['courts may not enforce racial covenants', 3], ['a separate law school in Texas was not equal', 4]], 'Which early victory is this?') },
    { L: [2, 3], q: 'Why could Truman desegregate the military without Congress?', a: 'as commander in chief he could change military policy by executive order', w: ['Congress had passed a civil rights act in 1947', 'the Supreme Court ordered it', 'the states voted for it'], why: 'Southern senators blocked civil rights bills by filibuster; the President could act alone on the military.' },
    { L: [2, 3], q: 'Who led the NAACP\'s legal campaign against segregation in the 1940s and 1950s?', a: 'Thurgood Marshall', w: ['Earl Warren', 'Jackie Robinson', 'A. Philip Randolph'], why: 'Marshall followed Charles Hamilton Houston; he later became the first Black Supreme Court justice (1967).' },
    { L: [2, 3], q: 'Why did the NAACP begin with graduate and law schools?', a: 'states could not credibly claim hastily built separate schools there were equal', w: ['the law did not cover elementary schools', 'no Black students wanted to attend elementary school', 'the Supreme Court refused school cases'], why: 'Wins such as Sweatt (1950) built precedent for attacking separation itself.' },
    { L: [3], q: 'The civil rights movement began with Rosa Parks in 1955.', tf: false, why: 'False: legal and political work went back decades, through NAACP lawsuits and wartime campaigns.' },
    { L: [3], q: 'About early victories:', all: [['Robinson integrated major league baseball in 1947.', true], ['Executive Order 9981 came in 1948.', true], ['Mendez v. Westminster concerned Mexican American children.', true], ['Congress passed a civil rights act in 1948.', false]], why: 'Major civil rights laws came in 1957, 1964 and 1965; Truman acted by executive order.' },
    { L: [1, 2, 3], ord: CR_EVENTS.slice(0, 7) }
  ]));

  G('ush2.brown-v-board', bank([
    { L: [1, 2, 3], q: 'In what year did the Supreme Court decide Brown v. Board of Education?', year: 1954, why: 'May 17, 1954.' },
    { L: [1, 2], q: 'What was the vote in Brown v. Board of Education?', a: '9 to 0', w: ['5 to 4', '7 to 1', '6 to 3'], why: 'Chief Justice Warren worked for a unanimous Court.' },
    { L: [1, 2], q: 'Which clause did school segregation violate, according to Brown?', a: 'the Equal Protection Clause of the Fourteenth Amendment', w: ['the free speech clause of the First Amendment', 'the Commerce Clause', 'the Second Amendment'], why: 'Brown held segregated public schools deny equal protection.', viz: caseViz('brown', { hide: ['name', 'clause'] }) },
    { L: [2, 3], q: '"Separate educational facilities are inherently unequal." What does "inherently" mean here?', a: 'by their very nature, even if buildings and teachers were equal', w: ['only when buildings were worse', 'only in Kansas', 'only until 1955'], why: 'Brown rejected "separate but equal" itself in public education.', viz: docViz('A Supreme Court opinion, 1954', 'Brown v. Board of Education, 347 U.S. 483 (public domain)', 'We conclude that, in the field of public education, the doctrine of "separate but equal" has no place. Separate educational facilities are inherently unequal.', ['inherently unequal']) },
    { L: [2, 3], q: 'What did Brown II (1955) order?', a: 'desegregation "with all deliberate speed"', w: ['desegregation within one week', 'no desegregation at all', 'separate but equal schools'], why: 'The vague timetable let many districts delay for more than a decade.' },
    { L: [2, 3], q: 'Why did Eisenhower send the 101st Airborne to Little Rock in 1957?', a: 'to protect nine Black students entering Central High School against the governor\'s resistance', w: ['to stop a war with Arkansas', 'to close the school', 'to enforce Plessy v. Ferguson'], why: 'Arkansas\'s governor had used the National Guard to block the students.' },
    { L: [2, 3], q: 'What was the Southern Manifesto (1956)?', a: 'a statement by 101 Southern members of Congress against Brown', w: ['a new civil rights law', 'a Supreme Court opinion', 'a call for the March on Washington'], why: '19 senators and 82 representatives signed it.' },
    { L: [2, 3], q: 'Which case did Brown overturn for public schools?', a: 'Plessy v. Ferguson (1896)', w: ['Dred Scott v. Sandford (1857)', 'Korematsu v. United States (1944)', 'Schenck v. United States (1919)'], why: 'Plessy had upheld "separate but equal."' },
    { L: [2, 3], q: 'Who argued the Brown case for the Black families?', a: 'Thurgood Marshall of the NAACP', w: ['Earl Warren', 'Martin Luther King Jr.', 'Robert Kennedy'], why: 'Warren was the Chief Justice who wrote the opinion.' },
    { L: [3], q: 'Most Southern schools were integrated within a year of Brown.', tf: false, why: 'False: many districts resisted for more than a decade; real change came after 1964 and court orders in the late 1960s.' },
    { L: [3], q: 'About Brown and its aftermath:', all: [['Brown was unanimous.', true], ['Brown II said "all deliberate speed."', true], ['Cooper v. Aaron (1958) said states are bound by the Court\'s rulings.', true], ['Brown was decided under the First Amendment.', false]], why: 'Brown rests on the Equal Protection Clause.' },
    { L: [1, 2, 3], ord: [[1896, 'Plessy v. Ferguson'], [1950, 'Sweatt v. Painter'], [1954, 'Brown v. Board of Education'], [1955, 'Brown II'], [1956, 'Southern Manifesto'], [1957, 'Little Rock Nine'], [1958, 'Cooper v. Aaron']] }
  ]));

  G('ush2.montgomery', bank([
    {"L":[1,2,3],"q":"In which state is Montgomery?","a":"Alabama","w":["Georgia","Mississippi","Tennessee","Louisiana"],"why":"Montgomery is the capital of Alabama."},
    {"L":[1,2,3],"q":"Whose arrest on December 1, 1955, sparked the Montgomery Bus Boycott?","a":"Rosa Parks","w":["Claudette Colvin","Jo Ann Robinson","Coretta Scott King","Ella Baker"],"why":"Parks refused to give up her seat to a white rider."},
    {"L":[1,2,3],"q":"Which 1956 case held that Montgomery's bus segregation was unconstitutional?","a":"Browder v. Gayle","w":["Brown v. Board of Education","Plessy v. Ferguson","Loving v. Virginia","Heart of Atlanta Motel v. United States"],"why":"A federal court ruled in Browder v. Gayle, and the Supreme Court affirmed."},
    {"L":[2,3],"q":"Which teenager refused to give up her bus seat in Montgomery nine months before Rosa Parks?","a":"Claudette Colvin","w":["Jo Ann Robinson","Ruby Bridges","Diane Nash","Fannie Lou Hamer"],"why":"Colvin, 15, was arrested in March 1955."},
    {"L":[2,3],"q":"What method did the boycott's leaders use?","a":"nonviolent protest","w":["armed resistance","a general strike of all workers","a lawsuit only, with no protest"],"why":"King and the boycotters held to nonviolence."},
    { L: [1, 2, 3], q: 'In what year did the Montgomery Bus Boycott begin?', year: 1955, why: 'December 5, 1955, four days after Rosa Parks\'s arrest.' },
    { L: [1, 2], q: 'How long did the Montgomery Bus Boycott last?', a: '381 days', w: ['38 days', '3 days', '3,810 days'], why: 'From December 5, 1955, to December 20, 1956.' },
    { L: [1, 2], q: 'Who was chosen to lead the Montgomery Improvement Association?', a: 'Martin Luther King Jr.', w: ['Rosa Parks', 'Thurgood Marshall', 'Malcolm X'], why: 'King was a 26-year-old pastor in Montgomery.' },
    { L: [1, 2], q: 'How did the boycott end?', a: 'the Supreme Court affirmed a ruling that bus segregation was unconstitutional', w: ['the city ran out of buses', 'Congress passed a law in 1955', 'the riders gave up'], why: 'Browder v. Gayle, affirmed November 13, 1956; the boycott ended December 20.' },
    { L: [2, 3], q: 'Which group had planned for a bus boycott and printed leaflets overnight?', a: 'the Women\'s Political Council, led by Jo Ann Robinson', w: ['SNCC', 'the Black Panther Party', 'the Southern Manifesto'], why: 'Local leaders were ready; Parks herself was an experienced NAACP officer.' },
    { L: [2, 3], q: 'What was Rosa Parks\'s role before her arrest?', a: 'secretary of the local NAACP chapter, trained in organizing', w: ['a stranger to activism', 'a city council member', 'a bus driver'], why: 'The idea that she was simply tired is a myth.' },
    { L: [2, 3], q: 'How did boycotters get to work for more than a year?', a: 'walking, carpools and church station wagons', w: ['new city buses for Black riders', 'federal troops drove them', 'they stayed home'], why: 'A carpool system kept the boycott going.' },
    { L: [3], q: 'The Montgomery Bus Boycott was a spontaneous protest with no planning.', tf: false, why: 'False: local groups had planned for it and organized carpools to keep it going.' },
    { L: [3], q: 'About the Montgomery Bus Boycott:', all: [['It began in December 1955.', true], ['Claudette Colvin had refused to give up her seat earlier in 1955.', true], ['It lasted 381 days.', true], ['It ended because Congress passed the Civil Rights Act.', false]], why: 'It ended after the courts struck down bus segregation in 1956.' },
    { L: [1, 2, 3], gen: seqOrd([['Rosa Parks arrested (December 1, 1955)', 1], ['Boycott begins (December 5, 1955)', 2], ['King\'s house bombed (January 30, 1956)', 3], ['Supreme Court affirms Browder v. Gayle (November 13, 1956)', 4], ['Boycott ends (December 20, 1956)', 5], ['SCLC founded (January 1957)', 6]]).gen }
  ]));

  G('ush2.sit-ins-freedom-rides', bank([
    { L: [1, 2, 3], q: 'In what year did the Greensboro sit-in begin?', year: 1960, why: 'February 1, 1960, at a Woolworth\'s lunch counter.' },
    { L: [1, 2, 3], gen: sortGen(['a sit-in', 'a Freedom Ride', 'a march'], [['students sit at a whites-only lunch counter and ask to be served', 0], ['an integrated group rides interstate buses through the South', 1], ['250,000 people gather at the Lincoln Memorial', 2], ['protesters walk from Selma toward Montgomery', 2], ['activists test segregated bus terminals', 1], ['students occupy seats at a store counter for days', 0]], 'Which kind of protest is this?') },
    { L: [1, 2], q: 'On what date was the March on Washington?', a: 'August 28, 1963', w: ['December 1, 1955', 'July 2, 1964', 'April 4, 1968'], why: 'About 250,000 people marched; King gave his "I Have a Dream" speech.' },
    { L: [2, 3], q: 'Which student group was founded at Shaw University in April 1960, with guidance from Ella Baker?', a: 'SNCC (the Student Nonviolent Coordinating Committee)', w: ['the NAACP', 'CORE', 'the SCLC'], why: 'The NAACP dates to 1909, CORE to 1942, the SCLC to 1957.' },
    { L: [2, 3], q: 'Which group organized the Freedom Rides of 1961?', a: 'CORE (the Congress of Racial Equality)', w: ['the American Federation of Labor', 'the NAACP Legal Defense Fund', 'the Black Panther Party'], why: 'CORE riders tested a Supreme Court ruling against segregated terminals.' },
    { L: [2, 3], q: 'In 1963 King wrote a famous letter from jail in which city?', a: 'Birmingham, Alabama', w: ['Montgomery, Alabama', 'Atlanta, Georgia', 'Memphis, Tennessee'], why: 'The Letter from Birmingham Jail is dated April 16, 1963.' },
    { L: [2, 3], q: 'What did nonviolence training prepare protesters to do?', a: 'stay disciplined and not strike back when attacked', w: ['avoid all arrests', 'fight back in self-defense', 'stay home'], why: 'Workshops such as James Lawson\'s in Nashville trained protesters; their discipline exposed segregation\'s violence.' },
    { L: [3], q: 'Nonviolent protest meant protesters took no risks and did nothing active.', tf: false, why: 'False: it was organized, trained and risky; protesters faced arrests, beatings and bombings.' },
    { L: [3], q: 'About the protests of 1960 to 1963:', all: [['The Greensboro sit-in began in 1960.', true], ['A Freedom Riders\' bus was burned near Anniston.', true], ['The March on Washington came in 1963.', true], ['The Freedom Rides took place in 1955.', false]], why: 'The Freedom Rides were in 1961.' },
    { L: [1, 2, 3], gen: seqOrd([['Greensboro sit-in (February 1960)', 1], ['SNCC founded (April 1960)', 2], ['Freedom Rides begin (May 1961)', 3], ['Birmingham campaign (April 1963)', 4], ['Letter from Birmingham Jail (April 16, 1963)', 5], ['March on Washington (August 1963)', 6], ['16th Street Baptist Church bombing (September 1963)', 7]]).gen }
  ]));

  G('ush2.civil-rights-laws', bank([
    { L: [1, 2, 3], gen: sortGen(['the Civil Rights Act of 1964', 'the Voting Rights Act of 1965', 'the Twenty-fourth Amendment', 'the Fair Housing Act of 1968'], [['banned discrimination in hotels and restaurants', 0], ['suspended literacy tests for voting', 1], ['banned poll taxes in federal elections', 2], ['banned discrimination in selling and renting homes', 3], ['banned job discrimination by race, color, religion, sex or national origin', 0], ['required preclearance of voting changes in covered states', 1]], 'Which law or amendment did this?') },
    { L: [1, 2, 3], gen: function (R) { var x = R.pick([['the Civil Rights Act', 1964], ['the Voting Rights Act', 1965], ['the Fair Housing Act', 1968], ['the Twenty-fourth Amendment', 1964]]); return { q: 'In what year was ' + x[0] + ' adopted?', year: x[1], why: 'Civil Rights Act and Twenty-fourth Amendment: 1964; Voting Rights Act: 1965; Fair Housing Act: 1968.' }; } },
    { L: [2, 3], q: 'What happened on "Bloody Sunday," March 7, 1965?', a: 'state troopers beat voting rights marchers on the Edmund Pettus Bridge in Selma', w: ['the Civil Rights Act was signed', 'the March on Washington took place', 'Rosa Parks was arrested'], why: 'The violence led Johnson to press Congress, and the Voting Rights Act passed that summer.' },
    { L: [2, 3], q: 'How was the Senate filibuster against the 1964 Civil Rights Act ended?', a: 'a cloture vote by a bipartisan coalition', w: ['a presidential veto', 'a Supreme Court order', 'the filibuster simply stopped'], why: 'After 60 working days, Republican leader Everett Dirksen helped win cloture in June 1964.' },
    { L: [2, 3], q: 'About what share of eligible Black citizens in Mississippi were registered to vote in 1964?', a: 'about 7 percent', w: ['about 70 percent', 'about 50 percent', 'about 95 percent'], why: 'About 6.7 percent; registration rose sharply after the Voting Rights Act.' },
    { L: [2, 3], q: 'Under which power did the Supreme Court uphold the 1964 act\'s ban on discrimination in motels (Heart of Atlanta Motel, 1964)?', a: 'the Commerce Clause', w: ['the Second Amendment', 'the Tenth Amendment', 'the Treaty Clause'], why: 'The motel served interstate travelers; Congress may regulate interstate commerce.' },
    { L: [3], q: 'The Voting Rights Act of 1965 banned discrimination in restaurants and hotels.', tf: false, why: 'False: that was the Civil Rights Act of 1964. The 1965 act covered voting.' },
    { L: [3], q: 'About the civil rights laws:', all: [['Johnson signed the Civil Rights Act on July 2, 1964.', true], ['The Voting Rights Act suspended literacy tests.', true], ['The Fair Housing Act followed King\'s assassination in 1968.', true], ['The Twenty-fourth Amendment gave women the vote.', false]], why: 'The Nineteenth Amendment gave women the vote; the Twenty-fourth banned poll taxes in federal elections.' },
    { L: [1, 2, 3], gen: seqOrd([['Kennedy proposes a civil rights bill (June 1963)', 1], ['Twenty-fourth Amendment ratified (January 1964)', 2], ['Civil Rights Act signed (July 1964)', 3], ['Freedom Summer (June 1964)', 2.5], ['Bloody Sunday in Selma (March 1965)', 4], ['Voting Rights Act signed (August 1965)', 5], ['Fair Housing Act (April 1968)', 6]]).gen }
  ]));

  G('ush2.movement-debates', bank([
    { L: [1, 2, 3], gen: sortGen(['Martin Luther King Jr.', 'Malcolm X', 'the Black Power movement'], [['nonviolent direct action for an integrated society', 0], ['minister of the Nation of Islam until 1964', 1], ['Stokely Carmichael\'s call in Mississippi in 1966', 2], ['the Poor People\'s Campaign', 0], ['pilgrimage to Mecca in 1964 that changed his views', 1], ['the Black Panther Party\'s Ten-Point Program', 2]], 'Which leader or movement is linked with this?') },
    { L: [1, 2, 3], q: 'In what year was Martin Luther King Jr. assassinated?', year: 1968, why: 'April 4, 1968, in Memphis, where he supported striking sanitation workers.' },
    { L: [2, 3], q: 'In what year did Stokely Carmichael call for "Black Power"?', year: 1966, why: 'June 1966, during the March Against Fear in Mississippi.' },
    { L: [1, 2], q: 'Where was the Black Panther Party founded in October 1966?', a: 'Oakland, California', w: ['Montgomery, Alabama', 'Harlem, New York', 'Selma, Alabama'], why: 'Huey Newton and Bobby Seale founded it; it ran community programs as well as armed patrols.' },
    { L: [2, 3], q: 'What did the Kerner Commission (1968) warn?', a: 'the nation was "moving toward two societies, one black, one white—separate and unequal"', w: ['the movement had already won full equality', 'segregation should continue', 'cities needed no change'], why: 'It studied the riots of 1967.' },
    { L: [2, 3], q: 'How did Malcolm X\'s views change late in his life?', a: 'after leaving the Nation of Islam and going to Mecca, he spoke of working with others for human rights', w: ['he joined the SCLC', 'he gave up all activism', 'he moved to Montgomery'], why: 'He left the Nation of Islam in March 1964 and was assassinated in February 1965.' },
    { L: [2, 3], q: 'Why did many young activists turn away from nonviolence by 1966?', a: 'years of beatings and slow change in Northern cities made them doubt it could win', w: ['the civil rights laws had been repealed', 'King told them to', 'the Supreme Court banned marches'], why: 'Describe the reasons on each side; the practice asks what each argued, not who was right.' },
    { L: [3], q: 'King, Malcolm X and the Black Power movement all wanted equal rights and dignity for Black Americans, though they disagreed on methods and goals.', tf: true, why: 'True: they differed over nonviolence, self-defense and integration as the goal.' },
    { L: [3], q: 'About the debates within the movement:', all: [['Malcolm X was assassinated in 1965.', true], ['King spoke against the Vietnam War.', true], ['The Black Panthers ran breakfast programs.', true], ['King and Malcolm X held the same views on nonviolence.', false]], why: 'King insisted on nonviolence; Malcolm X defended self-defense.' },
    { L: [1, 2, 3], ord: [[1964, 'Malcolm X leaves the Nation of Islam'], [1965, 'Malcolm X assassinated; Watts riot'], [1966, 'Call for "Black Power"; Black Panthers founded'], [1967, 'Riots in Newark and Detroit'], [1968, 'Kerner Report; King assassinated'], [1963, 'March on Washington']] }
  ]));

  G('ush2.other-movements', bank([
    { L: [1, 2, 3], gen: sortGen(['farmworkers', 'Native American rights', 'women\'s rights', 'disability rights'], [['Cesar Chavez and Dolores Huerta', 0], ['the Delano grape strike', 0], ['the American Indian Movement', 1], ['the occupation of Alcatraz', 1], ['Title IX', 2], ['the National Organization for Women', 2], ['the Americans with Disabilities Act', 3], ['the Rehabilitation Act of 1973', 3]], 'Which movement does this belong to?') },
    { L: [1, 2], q: 'Is the Equal Rights Amendment part of the Constitution?', a: 'No. It was not ratified by three-fourths of the states before its deadline, and its status is disputed.', w: ['Yes. It was ratified in 1972.', 'Yes. Congress alone made it law.', 'No. Congress never passed it.'], why: 'Congress passed it in 1972; 35 states ratified by the 1982 deadline, three short of 38.' },
    { L: [1, 2, 3], q: 'In what year was the Americans with Disabilities Act signed?', year: 1990, why: 'July 26, 1990, by President George H. W. Bush.' },
    { L: [1, 2, 3], q: 'In what year did Title IX become law?', year: 1972, why: 'June 23, 1972.' },
    { L: [2, 3], q: 'What does Title IX do?', a: 'bans sex discrimination in education programs that receive federal money', w: ['bans poll taxes', 'creates a minimum wage', 'ends the draft'], why: 'It covers far more than sports, though girls\' and women\'s sports grew enormously.' },
    { L: [2, 3], q: 'Which leader argued against the ERA, saying it would end protections such as women\'s exemption from the draft?', a: 'Phyllis Schlafly', w: ['Betty Friedan', 'Dolores Huerta', 'Alice Paul'], why: 'Supporters argued it would secure equality that ordinary laws could change; know both arguments.' },
    { L: [2, 3], q: 'How many states had ratified the ERA by the 1982 deadline?', a: '35', w: ['38', '50', '13'], why: '35, three short of the 38 needed.' },
    { L: [2, 3], q: 'Where was the American Indian Movement founded in 1968?', a: 'Minneapolis, Minnesota', w: ['Oakland, California', 'Delano, California', 'Selma, Alabama'], why: 'It pressed for treaty rights and sovereignty; members occupied Alcatraz and Wounded Knee.' },
    { L: [3], q: 'The Equal Rights Amendment was ratified and added to the Constitution in 1982.', tf: false, why: 'False: it fell three states short by the deadline; its status remains disputed.' },
    { L: [3], q: 'About other movements for equal rights:', all: [['The UFW organized farmworkers.', true], ['AIM was founded in 1968.', true], ['Title IX passed in 1972.', true], ['The ADA passed in 1964.', false]], why: 'The ADA passed in 1990.' },
    { L: [1, 2, 3], ord: [[1963, 'The Feminine Mystique; Equal Pay Act'], [1965, 'Delano grape strike begins'], [1966, 'NOW founded'], [1968, 'American Indian Movement founded'], [1969, 'Occupation of Alcatraz begins'], [1972, 'Title IX'], [1990, 'Americans with Disabilities Act']] }
  ]));

  /* ================= Unit 7: The Last Decades of the Century ================= */
  var RECENT_EVENTS = [[1973, 'Arab oil embargo'], [1974, 'Ford pardons Nixon'], [1976, 'Carter elected'], [1978, 'Camp David Accords'], [1979, 'Iran hostage crisis begins'], [1980, 'Reagan elected'],
    [1981, 'Economic Recovery Tax Act'], [1986, 'Tax Reform Act'], [1991, 'Gulf War; Soviet Union dissolves'], [1994, 'NAFTA takes effect'], [1995, 'Dayton Accords for Bosnia'], [1996, 'Welfare reform law'], [1998, 'House impeaches Clinton'], [1999, 'NATO air war over Kosovo'], [2000, 'Bush v. Gore']];

  G('ush2.seventies', bank([
    { L: [1, 2], q: 'What was "stagflation"?', a: 'high inflation and high unemployment at the same time', w: ['falling prices and full employment', 'a stock market crash', 'a ban on oil imports'], why: 'In the 1970s both were high at once, which puzzled policymakers.' },
    { L: [1, 2, 3], q: 'In what year did Arab oil producers impose the oil embargo on the United States?', year: 1973, why: 'October 1973, during a war between Israel and its neighbors; prices roughly quadrupled.' },
    { L: [1, 2], q: 'Which agreement did Jimmy Carter broker between Egypt and Israel in 1978?', a: 'the Camp David Accords', w: ['the Dayton Accords', 'the Paris Peace Accords', 'the Treaty of Versailles'], why: 'Anwar Sadat and Menachem Begin signed them September 17, 1978; a peace treaty followed in 1979.' },
    { L: [1, 2], q: 'How long were the American hostages held in Iran?', a: '444 days', w: ['44 days', '4 days', 'four years'], why: 'From November 4, 1979, to January 20, 1981, the day Reagan took office.' },
    { L: [2, 3], q: 'Why did Gerald Ford\'s pardon of Nixon hurt him politically?', a: 'many voters saw it as letting Nixon escape accountability', w: ['the pardon was ruled unconstitutional', 'Congress impeached Ford for it', 'Nixon refused it'], why: 'Ford said he wanted to put Watergate behind the country; he lost the 1976 election to Carter.' },
    { L: [2, 3], q: 'How many Americans were held hostage in Iran?', a: '52', w: ['5', '520', '444'], why: '52 Americans for 444 days.' },
    { L: [2, 3], q: 'Who led the Federal Reserve from 1979 and raised interest rates sharply to fight inflation?', a: 'Paul Volcker', w: ['Alan Greenspan', 'Henry Kissinger', 'Milton Friedman'], why: 'High rates brought inflation down in the early 1980s, at the cost of a deep recession.' },
    { L: [2, 3], gen: sortGen(['the Camp David Accords', 'the Panama Canal treaties', 'the Iran hostage crisis', 'the response to the Soviet invasion of Afghanistan'], [['Sadat and Begin agree to a framework for peace', 0], ['the canal to be handed to Panama at the end of 1999', 1], ['militants seize the U.S. embassy in Tehran', 2], ['a boycott of the 1980 Moscow Olympics', 3], ['a failed rescue mission in 1980', 2], ['a halt to grain sales to the Soviet Union', 3]], 'Which part of Carter\'s foreign policy is this?') },
    { L: [3], q: 'Inflation and unemployment always move in opposite directions.', tf: false, why: 'False: in the 1970s both were high at once (stagflation).' },
    { L: [3], q: 'About the 1970s:', all: [['Oil prices roughly quadrupled in 1973–1974.', true], ['Carter won the 1976 election.', true], ['The hostages were released in January 1981.', true], ['Ford was elected President in 1972.', false]], why: 'Ford became Vice President in 1973 and President in 1974 without being elected to either office.' },
    { L: [1, 2, 3], ord: [[1971, 'Twenty-sixth Amendment'], [1973, 'Arab oil embargo'], [1974, 'Ford pardons Nixon'], [1976, 'Carter elected'], [1978, 'Camp David Accords'], [1979, 'Iran hostage crisis begins'], [1981, 'Hostages released']] }
  ]));

  G('ush2.conservative-resurgence', bank([
    { L: [1, 2, 3], q: 'In what year was Ronald Reagan first elected President?', year: 1980, why: 'He defeated Jimmy Carter in November 1980 and was reelected in 1984.' },
    { L: [1, 2], q: 'Which three goals did Reagan campaign on?', a: 'lower taxes, less regulation and a stronger defense', w: ['higher taxes, more regulation and a smaller military', 'free silver, railroads and tariffs', 'Prohibition, quotas and isolation'], why: 'His program is often called "Reaganomics."' },
    { L: [2, 3], q: 'What happened to the federal deficit and the national debt in the 1980s?', a: 'deficits grew and the national debt roughly tripled', w: ['the budget ran a surplus every year', 'the debt was paid off', 'they did not change'], why: 'Spending, especially on defense and entitlements, rose while tax rates fell.' },
    { L: [2, 3], q: 'What happened to inflation in the early 1980s?', a: 'it fell from about 13.5 percent (1980) to under 4 percent by 1983', w: ['it rose above 20 percent', 'it stayed at 13 percent all decade', 'prices fell by half'], why: 'High interest rates set by the Federal Reserve, and a deep recession, brought it down.' },
    { L: [2, 3], gen: sortGen(['a fact about the record', 'a judgment from one side'], [['The top income tax rate fell from 70 to 50 percent in 1981.', 0], ['The tax cuts caused the long expansion.', 1], ['The national debt roughly tripled in the 1980s.', 0], ['The deficits were a dangerous burden on the future.', 1], ['Unemployment peaked at 10.8 percent in late 1982.', 0], ['The gains were unfairly shared.', 1]], 'Is this statement a fact about the record, or a judgment that one side makes?') },
    { L: [2, 3], q: 'Who was the first woman appointed to the Supreme Court, in 1981?', a: 'Sandra Day O\'Connor', w: ['Ruth Bader Ginsburg', 'Frances Perkins', 'Geraldine Ferraro'], why: 'Reagan appointed her in 1981.' },
    { L: [2, 3], gen: function (R) { var x = R.pick([['1980', 489], ['1984', 525]]); return { q: 'How many electoral votes did Reagan win in ' + x[0] + '?', a: String(x[1]), w: ['489', '525', '270', '370', '538'].filter(function (v) { return v !== String(x[1]); }), why: '1980: 489 of 538; 1984: 525 of 538, the most ever.' }; } },
    { L: [3], q: 'Historians and economists agree that Reagan\'s policies were a complete success.', tf: false, why: 'False: supporters credit the expansion; critics point to deficits and inequality. State the record, then each reading.' },
    { L: [3], q: 'About the 1980s:', all: [['Tax rates were cut in 1981 and 1986.', true], ['The Tax Reform Act of 1986 passed with bipartisan votes.', true], ['Inflation fell.', true], ['The federal budget ran surpluses every year.', false]], why: 'Deficits grew; surpluses came only in 1998 to 2001.' },
    { L: [1, 2, 3], ord: [[1964, 'Goldwater campaign'], [1979, 'Moral Majority founded'], [1980, 'Reagan elected'], [1981, 'Economic Recovery Tax Act'], [1984, 'Reagan reelected'], [1986, 'Tax Reform Act'], [1987, 'INF Treaty']] }
  ]));

  G('ush2.after-cold-war', bank([
    { L: [1, 2, 3], q: 'In what year was the Gulf War (Operation Desert Storm) fought?', year: 1991, why: 'January 17 to February 28, 1991, after Iraq invaded Kuwait in August 1990.' },
    { L: [1, 2], q: 'What did the Gulf War do?', a: 'a U.S.-led coalition drove Iraq\'s army out of Kuwait', w: ['the U.S. conquered Iran', 'NATO defended Bosnia', 'the U.S. left the UN'], why: 'About 35 nations joined the coalition under a UN Security Council resolution.' },
    { L: [1, 2], q: 'Which countries did NAFTA join in a free trade area?', a: 'the United States, Canada and Mexico', w: ['the United States, Britain and France', 'the United States, China and Japan', 'all of the Americas'], why: 'NAFTA took effect January 1, 1994.' },
    { L: [1, 2, 3], q: 'In what year did NAFTA take effect?', year: 1994, why: 'January 1, 1994; it had been signed in 1992 and approved by Congress in 1993.' },
    { L: [2, 3], gen: sortGen(['the Gulf War', 'Somalia', 'Bosnia', 'Kosovo'], [['Iraq\'s invasion of Kuwait', 0], ['a famine relief mission that turned into fighting in Mogadishu (1993)', 1], ['NATO air strikes and the Dayton Accords (1995)', 2], ['a 78-day NATO air campaign (1999)', 3], ['Operation Desert Storm', 0], ['NATO acted without a new UN Security Council resolution', 3]], 'Which 1990s intervention is this?') },
    { L: [2, 3], q: 'What did opponents of NAFTA, including many labor unions, warn about?', a: 'lost manufacturing jobs', w: ['higher tariffs on Mexican goods', 'a war with Canada', 'the end of the dollar'], why: 'Supporters pointed to cheaper goods and growing exports; know both sides.' },
    { L: [2, 3], q: 'How did the Kosovo campaign (1999) differ from the Gulf War (1991)?', a: 'it was a NATO air campaign without a new UN Security Council resolution', w: ['it was a ground war authorized by the UN', 'the U.S. did not take part', 'it was fought against the Soviet Union'], why: 'The Gulf War had UN authorization and a ground war; Kosovo was an air war by NATO.' },
    { L: [3], q: 'After the Cold War ended, the U.S. sent no troops abroad in the 1990s.', tf: false, why: 'False: the Gulf, Somalia, Haiti, Bosnia and Kosovo all saw U.S. deployments.' },
    { L: [3], q: 'About the 1990s abroad:', all: [['Iraq invaded Kuwait in 1990.', true], ['The Dayton Accords concerned Bosnia.', true], ['NAFTA took effect in 1994.', true], ['The U.S. intervened to stop the genocide in Rwanda.', false]], why: 'The world, including the U.S., did not intervene in Rwanda in 1994.' },
    { L: [1, 2, 3], ord: [[1990, 'Iraq invades Kuwait'], [1991, 'Operation Desert Storm'], [1993, 'Battle in Mogadishu'], [1994, 'NAFTA takes effect'], [1995, 'Dayton Accords'], [1999, 'NATO air war over Kosovo']] },
    { L: [2, 3], tl: RECENT_EVENTS.slice(8) }
  ]));

  G('ush2.tech-economy', bank([
    { L: [1, 2], q: 'Are the internet and the World Wide Web the same thing?', a: 'No. The Web is a system of linked pages that runs on the internet.', w: ['Yes, two names for one thing.', 'No. The internet runs on the Web.', 'Yes, and both began in 1995.'], why: 'The internet grew from 1960s and 1970s research networks; the Web was created in 1989 to 1991.' },
    { L: [1, 2, 3], q: 'In what year did Tim Berners-Lee propose the World Wide Web?', year: 1989, why: 'At CERN, in 1989; the first website went online in 1991.' },
    { L: [1, 2, 3], gen: sortGen(['the internet', 'the World Wide Web'], [['ARPANET, linked in 1969', 0], ['the TCP/IP protocols adopted in 1983', 0], ['pages linked to each other and read in a browser', 1], ['Tim Berners-Lee\'s invention at CERN', 1], ['email between research computers in the 1970s', 0], ['the first website, in 1991', 1]], 'Is this part of the history of the internet, or of the World Wide Web?') },
    { L: [2, 3], q: 'Which network, funded by the Defense Department, linked its first computers in 1969?', a: 'ARPANET', w: ['the World Wide Web', 'CERN', 'NAFTA'], why: 'ARPANET was a research network; it switched to TCP/IP on January 1, 1983.' },
    { L: [2, 3], q: 'What is globalization?', a: 'the growing flow of goods, money, people and ideas across borders', w: ['a ban on imports', 'the end of the Cold War', 'a computer language'], why: 'Supporters stress cheaper goods and growth; critics stress lost factory jobs. Both effects were real.' },
    { L: [2, 3], q: 'Which year did the IBM Personal Computer come out?', a: '1981', w: ['1969', '1991', '2001'], why: 'The Apple II (1977) and the IBM PC (1981) brought computers to homes and offices.' },
    { L: [3], q: 'The internet and the World Wide Web both began in the 1990s.', tf: false, why: 'False: the internet grew from research networks of the 1960s and 1970s; the Web came in 1989 to 1991.' },
    { L: [3], q: 'About technology and the economy:', all: [['ARPANET began in 1969.', true], ['The Web was invented at CERN.', true], ['A "dot-com" boom in technology stocks came in the 1990s.', true], ['Personal computers were common in homes in the 1950s.', false]], why: 'Personal computers spread in the late 1970s and 1980s.' },
    { L: [1, 2, 3], ord: [[1969, 'ARPANET\'s first link'], [1977, 'Apple II'], [1981, 'IBM Personal Computer'], [1983, 'ARPANET switches to TCP/IP'], [1989, 'Berners-Lee proposes the Web'], [1991, 'First website goes online']] }
  ]));

  G('ush2.nineties-politics', bank([
    { L: [1, 2], q: 'What does it mean that the House impeached President Clinton in 1998?', a: 'the House formally charged him; the Senate then held a trial', w: ['he was removed from office', 'he resigned', 'the Supreme Court convicted him'], why: 'The Senate acquitted him in February 1999.' },
    { L: [1, 2, 3], q: 'In what year did the Senate acquit President Clinton?', year: 1999, why: 'February 12, 1999. The House had impeached him in December 1998.' },
    { L: [1, 2], q: 'How many senators must vote to convict and remove a President?', a: 'two-thirds (67 of 100)', w: ['a simple majority (51)', 'all 100', 'three-fourths (75)'], why: 'Article I, Section 3. The votes on Clinton were 45 and 50.' },
    { L: [2, 3], q: 'Which earlier President, like Clinton, was impeached by the House and acquitted by the Senate?', a: 'Andrew Johnson (1868)', w: ['Richard Nixon (1974)', 'Abraham Lincoln (1865)', 'Theodore Roosevelt (1908)'], why: 'Nixon resigned before the full House voted.' },
    { L: [2, 3], q: 'What did the welfare reform law of 1996 do?', a: 'replaced a federal entitlement with block grants to states, with work requirements and time limits', w: ['created Social Security', 'ended all federal aid to the poor', 'created Medicare'], why: 'It created TANF, with a five-year lifetime limit on federal benefits; a Republican Congress passed it and Clinton signed it.' },
    { L: [2, 3], q: 'In which fiscal years did the federal budget run a surplus?', a: '1998 to 2001', w: ['1981 to 1984', '1990 to 1993', 'it has never run a surplus'], why: 'The first surpluses since 1969, with growth, the 1993 tax increases and spending limits.' },
    { L: [2, 3], q: 'What did the Supreme Court do in Bush v. Gore (December 12, 2000)?', a: 'it stopped the Florida recount', w: ['it ordered a new national election', 'it declared Gore the winner', 'it abolished the Electoral College'], why: 'Seven justices saw an equal protection problem; five held no fair recount could be finished in time.' },
    { L: [2, 3], gen: function (R) { var x = R.pick([['Bush', 271], ['Gore', 266]]); return { q: 'In the 2000 election, how many electoral votes did ' + x[0] + ' win?', a: String(x[1]), w: ['271', '266', '270', '537', '538'].filter(function (v) { return v !== String(x[1]); }), why: 'Bush 271, Gore 266. Bush won Florida by 537 votes; Gore won the national popular vote.' }; } },
    { L: [2, 3], q: 'In 1994, Republicans won control of the House for the first time since…', a: '1954', w: ['1994', '1932', '1968'], why: 'Campaigning on the "Contract with America," they ended 40 years of Democratic control.' },
    { L: [3], q: 'Impeachment means removal from office.', tf: false, why: 'False: the House impeaches (charges); removal needs a two-thirds Senate vote, which has never happened to a President.' },
    { L: [3], q: 'About the politics of the 1990s:', all: [['Clinton won in 1992 against Bush and Perot.', true], ['Clinton signed NAFTA.', true], ['The Senate acquitted Clinton.', true], ['Gore won the 2000 electoral vote.', false]], why: 'Bush won the electoral vote, 271 to 266.' },
    { L: [1, 2, 3], ord: [[1992, 'Clinton elected'], [1993, 'NAFTA approved by Congress'], [1994, 'Republicans win the House'], [1996, 'Welfare reform law'], [1998, 'House impeaches Clinton'], [1999, 'Senate acquits Clinton'], [2000, 'Bush v. Gore']] }
  ]));

  /* periods-review: events across the nine AP periods, kept out of the overlaps (1844–1848, 1865–1877, 1890–1898) and away
     from the boundary years, so each has one period. The period comes from MathLadder.civics.apushPeriod at run time. */
  var NINE = [[1492, 'Columbus reaches the Caribbean'], [1519, 'Cortés reaches the Aztec capital'], [1565, 'St. Augustine founded'], [1619, 'Enslaved Africans arrive in Virginia; House of Burgesses'],
    [1620, 'Pilgrims land at Plymouth'], [1676, 'Bacon\'s Rebellion'], [1739, 'Stono Rebellion'], [1765, 'Stamp Act'], [1776, 'Declaration of Independence'], [1787, 'Constitution written'],
    [1803, 'Louisiana Purchase'], [1812, 'War of 1812 begins'], [1830, 'Indian Removal Act'], [1857, 'Dred Scott decision'], [1861, 'Civil War begins'], [1863, 'Emancipation Proclamation'],
    [1882, 'Chinese Exclusion Act'], [1886, 'Haymarket affair'], [1887, 'Dawes Act'], [1906, 'Pure Food and Drug Act'], [1917, 'U.S. enters World War I'], [1929, 'Stock market crash'],
    [1935, 'Social Security Act'], [1941, 'Pearl Harbor attacked'], [1954, 'Brown v. Board of Education'], [1962, 'Cuban Missile Crisis'], [1964, 'Civil Rights Act'], [1973, 'Oil embargo'],
    [1986, 'Tax Reform Act'], [1989, 'Berlin Wall falls'], [1994, 'NAFTA takes effect'], [2000, 'Bush v. Gore']];
  function periodOf(y) { var CV = ML.civics; return CV && CV.apushPeriod ? CV.apushPeriod(y) : null; }
  var PRANGE = { 1: '1491–1607', 2: '1607–1754', 3: '1754–1800', 4: '1800–1848', 5: '1844–1877', 6: '1865–1898', 7: '1890–1945', 8: '1945–1980', 9: '1980–present' };
  function pLabel(n) { return 'Period ' + n + ' (' + PRANGE[n] + ')'; }
  G('ush2.periods-review', bank([
    { L: [1, 2, 3], gen: function (R, lv) {
      var e = R.pick(NINE), n = periodOf(e[0]), near = [n - 2, n - 1, n + 1, n + 2].filter(function (k) { return k >= 1 && k <= 9; });
      return { q: 'In which AP period does this event belong? <b>' + e[1] + ' (' + e[0] + ')</b>', a: pLabel(n), w: (lv === 1 ? [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(function (k) { return Math.abs(k - n) >= 3; }) : near).map(pLabel), why: e[0] + ' falls in ' + pLabel(n) + '.', hint: 'Find the period whose years include ' + e[0] + '.' };
    } },
    { L: [2, 3], gen: function (R) {
      var n = R.int(1, 9), mine = NINE.filter(function (e) { return periodOf(e[0]) === n; }), e = R.pick(mine);
      var others = NINE.filter(function (x) { return Math.abs(periodOf(x[0]) - n) >= 1 && periodOf(x[0]) !== n; });
      return { q: 'Which event belongs in ' + pLabel(n) + '?', a: e[1], w: R.sample(others, 4).map(function (x) { return x[1]; }), why: e[1] + ' (' + e[0] + ') is in Period ' + n + '. ' + 'Period ' + n + ' runs ' + PRANGE[n] + '.' };
    } },
    { L: [1, 2], gen: function (R) {
      var n = R.int(2, 9), y = +PRANGE[n].split('–')[0];
      return { q: 'Which year begins ' + 'Period ' + n + ' of AP U.S. History?', a: String(y), w: [1491, 1607, 1754, 1800, 1844, 1865, 1890, 1945, 1980].filter(function (k) { return k !== y; }).map(String), why: 'The periods begin in 1491, 1607, 1754, 1800, 1844, 1865, 1890, 1945 and 1980. Period ' + n + ' starts in ' + y + '.' };
    } },
    { L: [2, 3], gen: function (R) {
      var pair = R.pick([[1846, 'the Mexican-American War', [4, 5]], [1868, 'the Fourteenth Amendment', [5, 6]], [1893, 'the Panic of 1893', [6, 7]], [1870, 'the Fifteenth Amendment', [5, 6]], [1896, 'Plessy v. Ferguson', [6, 7]]]);
      return { q: pair[1] + ' (' + pair[0] + ') falls where two AP periods overlap. Which two?', a: 'Periods ' + pair[2][0] + ' and ' + pair[2][1], w: ['Periods ' + (pair[2][0] - 1) + ' and ' + pair[2][0], 'Periods ' + pair[2][1] + ' and ' + (pair[2][1] + 1), 'Periods 1 and 2', 'Periods 8 and 9'].filter(function (x, i, a) { return a.indexOf(x) === i && x !== 'Periods ' + pair[2][0] + ' and ' + pair[2][1]; }), why: 'The periods overlap at 1844–1848 (4 and 5), 1865–1877 (5 and 6) and 1890–1898 (6 and 7).' };
    } },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['the 1800s', '19th'], ['the 1700s', '18th'], ['the 1900s', '20th'], ['the 1600s', '17th']]);
      return { q: 'Which century is ' + c[0] + '?', a: 'the ' + c[1] + ' century', w: ['the 16th century', 'the 17th century', 'the 18th century', 'the 19th century', 'the 20th century', 'the 21st century'].filter(function (x) { return x !== 'the ' + c[1] + ' century'; }), why: 'Add one to the hundreds: ' + c[0] + ' are the ' + c[1] + ' century.' };
    } },
    { L: [2, 3], gen: function (R) {
      var link = R.pick([
        ['the Great Depression and the New Deal', 'a larger federal role, expanded by the Great Society'],
        ['the end of Reconstruction', 'Jim Crow laws and Plessy v. Ferguson'],
        ['the Transcontinental Railroad', 'settlement of the Plains and the wars with Plains nations'],
        ['World War II\'s alliance', 'the Cold War rivalry with the Soviet Union'],
        ['the stagflation of the 1970s', 'the conservative resurgence and Reagan\'s election']]);
      var effects = ['a larger federal role, expanded by the Great Society', 'Jim Crow laws and Plessy v. Ferguson', 'settlement of the Plains and the wars with Plains nations', 'the Cold War rivalry with the Soviet Union', 'the conservative resurgence and Reagan\'s election'];
      return { q: 'Which effect in a later period grew out of ' + link[0] + '?', a: link[1], w: effects.filter(function (x) { return x !== link[1]; }), why: link[0].charAt(0).toUpperCase() + link[0].slice(1) + ' led to ' + link[1] + '.' };
    } },
    { L: [1, 2, 3], ord: NINE },
    { L: [2, 3], tl: NINE.slice(10) }
  ]));
})(window.MathLadder);

/* ---- widen_hum: more questions from the lesson's own tables -----------------------------------------------------
   Each topic listed below also asks about the facts in its lesson's tables (copied here from the lesson, so the
   answers are the lesson's own). Forms, by level:
     match   "Which museum is in Turin?": the right cell and others from the same column (3 choices at level 1, 4 above)
     pairs   lines "A → B": which pairing is right (level 2), or which one is wrong (level 3)
     sort    a comparison table: which column does this cell describe (levels 1-2), or choose all for one column (level 3)
   How often: about a third to a half of the draws, more when the topic's own questions are few at that level.
   Generated by /tmp/work_widen_widen_hum/tabbuild.js from data/<ladder>/lessons/<course>.json. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var TABS = [{"k":"ush2.new-deal-debates#2","h":["Critic","Argument"],"r":[["Huey Long, senator from Louisiana","\"Share Our Wealth\" (1934): tax great fortunes heavily and guarantee every family a home and income"],["Father Charles Coughlin, radio priest","At first a supporter, then attacked Roosevelt and the banks; his broadcasts later turned openly anti-Jewish"],["Dr. Francis Townsend","A pension of 200 dollars a month for everyone over 60, to be spent at once; pressure for Social Security"],["American Liberty League (1934)","Business leaders and conservative Democrats: the New Deal violated the Constitution, property rights and individual liberty"]],"cap":"","m":[[1,0,"Which critic of the New Deal made this argument: {a}",0]]},
    {"k":"ush2.new-deal-debates#4","h":["View","Main argument"],"r":[["The New Deal saved the system","It stopped the panic, restored banks, gave relief to millions and built lasting protections, preserving both democracy and capitalism"],["It did too little","Spending was too small and too cautious to end the Depression; only wartime spending did (a Keynesian argument)"],["Some policies slowed recovery","Price-fixing codes and uncertainty for business held back investment; monetary policy, such as leaving the gold standard, did more for recovery (argued by some economists)"]],"cap":"Present each with its evidence; scholars still weigh them.","m":[[1,0,"Historians still debate the New Deal. Which view does this argument support: {a}",0]]},
    {"k":"ush2.road-to-wwii#4","h":["Interventionists","Isolationists (non-interventionists)"],"r":[["Roosevelt; the Committee to Defend America by Aiding the Allies","The America First Committee (1940); Charles Lindbergh; many in Congress"],["A Nazi victory in Europe would threaten the Americas; aid to Britain could keep the U.S. out of the fighting","Oceans protected the U.S.; aid would drag it into a war that was not its own, as in 1917"]],"cap":"Both sides claimed to want to keep Americans safe.","one":"Before Pearl Harbor, Americans argued about the war in Europe. Which side does this describe?","all":"Which of these belong with the {a}? Choose all that apply.","na":1},
    {"k":"ush2.movement-debates#2","h":["","Martin Luther King Jr","Malcolm X","Black Power (Stokely Carmichael, the Black Panthers)"],"r":[["Goal","An integrated society with equal rights; later, economic justice for the poor","At first, separation and Black self-reliance (Nation of Islam); later, human rights for Black people worldwide","Black political and economic control of Black communities; pride in Black culture and history"],["Method","Nonviolent direct action, voting, laws","The right to self-defense when attacked; rejected nonviolence as the only tactic","Community organizing, Black-led groups; the Panthers ran breakfast programs and armed patrols"],["Where strongest","Southern churches, national politics","Northern cities","SNCC after 1966; Oakland and other cities"]],"cap":"","one":"Civil rights leaders and groups differed. Whose view does this describe, as the lesson presents it?","all":"Which of these describe {a}, as the lesson presents it? Choose all that apply."},
    {"k":"ush2.tech-economy#2","h":["Year","Step"],"r":[["1969","ARPANET, a research network funded by the Defense Department, links its first computers"],["1977","The Apple II, one of the first popular personal computers"],["1981","The IBM Personal Computer"],["1983","ARPANET switches to TCP/IP, the protocols the internet still uses (January 1)"],["1989","Tim Berners-Lee proposes the World Wide Web at CERN, in Switzerland"],["1991","The first website goes online; the Web becomes available beyond CERN"],["1993 to 1995","Graphical web browsers; companies begin selling online"],["1990s","The \"dot-com\" boom in technology stocks"]],"cap":"","m":[[1,0,"In what year did this happen: {a}?",0,"a step with its year"],[0,1,"Which step in the history of computing came in {a}?",0,0,2]]}];
  var FUNS = {};
  function plain(s) { return String(s).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); }
  function txt(s) { return String(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function low(s) { return txt(s).toLowerCase().replace(/[.;:,]+$/, ''); }
  function big(x) { return String(x).replace(/<span class="(sc-b|eg-cop|eg-h)">/g, '<span class="$1" style="font-size:1.6em;line-height:1">'); }
  function fill(t, x) { x = big(x); return t.replace('{a:l}', String(x).replace(/^[A-Z](?=[a-z])/, function (c) { return c.toLowerCase(); })).replace('{a}', x); }
  function dot(s) { s = String(s); return /[.!?…"”’)]$/.test(txt(s)) ? s : s + '.'; }
  function sameRow(t, i, a) { return t.r.filter(function (r) { return low(r[a]) === low(t.r[i][a]); }); }
  function partnerSteps(t, tp, right, shown) { // what each wrong choice goes with
    var out = [];
    shown.forEach(function (c) {
      if (low(c) === low(right)) return;
      var rows = t.r.filter(function (r) { return low(r[tp[1]]) === low(c); });
      if (rows.length === 1 && txt(rows[0][tp[0]]).length <= 90) out.push(dot(c + ': that goes with ' + rows[0][tp[0]]));
    });
    return out.slice(0, 3);
  }
  // match: ask for column b from a cell of column a
  function match(R, t, tp, L) {
    var a = tp[0], b = tp[1], ok = t.r.map(function (_, i) { return i; }).filter(function (i) { return t.r[i][a] && t.r[i][b] && txt(t.r[i][b]).length <= 130; });
    if (!ok.length) return null;
    var i = R.pick(ok), right = t.r[i][b], seen = {};
    seen[low(right)] = 1;
    var bad = {}; sameRow(t, i, a).forEach(function (r) { bad[low(r[b])] = 1; }); // never a choice that is also right
    var pool = []; t.r.forEach(function (r) { var k = low(r[b]); if (r[b] && !seen[k] && !bad[k] && txt(r[b]).length <= 130) { seen[k] = 1; pool.push(r[b]); } });
    var k = Math.min(L === 1 ? 3 : 4, pool.length + 1); if (k < 3) return null;
    var wrongs = R.shuffle(pool).slice(0, k - 1), choices = [right].concat(wrongs);
    return { q: fill(tp[2], t.r[i][a]), a: { t: 'mc', choices: choices, v: 0 },
      steps: [dot(t.r[i][a] + ' → ' + right), ].concat(partnerSteps(t, tp, right, choices)),
      hint: tp[3] || 'Think back to the lesson’s table' + (t.cap ? ' (' + t.cap.replace(/\.$/, '') + ')' : '') + '.', wh: [t.k, 'm', a, b, i, txt(t.r[i][a])] };
  }
  // pairs: three or four lines "a → b"; one right (level 2) or one wrong (level 3)
  function pairs(R, t, tp, L) {
    var a = tp[0], b = tp[1], ok = t.r.map(function (_, i) { return i; }).filter(function (i) { return t.r[i][a] && t.r[i][b] && txt(t.r[i][a]).length <= 70 && txt(t.r[i][b]).length <= 70; });
    var uniq = {}; ok = ok.filter(function (i) { var k = low(t.r[i][a]); if (uniq[k]) return false; uniq[k] = 1; return true; });
    var n = Math.min(4, ok.length); if (n < 3) return null;
    var rows = R.shuffle(ok).slice(0, n), wrongOne = L >= 3, target = R.int(0, n - 1), lines = [], steps = [];
    for (var j = 0; j < n; j++) {
      var i = rows[j], right = wrongOne ? j !== target : j === target, ans = t.r[i][b];
      if (!right) {
        var good = {}; sameRow(t, i, a).forEach(function (r) { good[low(r[b])] = 1; });
        var ws = []; t.r.forEach(function (r) { if (r[b] && !good[low(r[b])] && txt(r[b]).length <= 70 && ws.map(low).indexOf(low(r[b])) < 0) ws.push(r[b]); });
        if (!ws.length) return null;
        ans = R.pick(ws);
      }
      lines.push(t.r[i][a] + ' → ' + ans);
      steps.push(dot(t.r[i][a] + ' → ' + t.r[i][b] + (right ? ': right' : ', not ' + ans)));
    }
    var what = tp[4] ? ' Each line pairs ' + tp[4] + '.' : '';
    return { q: (wrongOne ? 'Exactly one of these pairings is <b>wrong</b>. Which one?' : 'Exactly one of these pairings is right. Which one?') + what,
      a: { t: 'mc', choices: lines, v: target }, steps: steps, hint: 'Check each line on its own against what you learned.', wh: [t.k, wrongOne ? 'pw' : 'pr', a, b] };
  }
  // sort: which column of a comparison table does a cell belong to
  function sortQ(R, t, L) {
    var cols = t.h.map(function (_, j) { return j; }).filter(function (j) { return j >= (t.na ? 0 : 1) && txt(t.h[j]); });
    if (cols.length < 2) return null;
    var cells = [];
    t.r.forEach(function (r, i) { cols.forEach(function (j) {
      if (!r[j] || (!t.na && !txt(r[0]))) return;
      var dup = cols.some(function (j2) { return j2 !== j && r[j2] && (low(r[j2]) === low(r[j]) || low(r[j2]).indexOf(low(r[j])) >= 0 || low(r[j]).indexOf(low(r[j2])) >= 0); });
      if (!dup && txt(r[j]).length <= 140) cells.push([i, j]);
    }); });
    if (cells.length < 2) return null;
    var heads = cols.map(function (j) { return t.h[j]; });
    if (L >= 3 && cells.length >= 5) {
      var j0 = R.pick(cols), pick = R.shuffle(cells).slice(0, Math.min(5, cells.length));
      var hits = pick.filter(function (c) { return c[1] === j0; }).length;
      if (hits >= 1 && hits < pick.length) {
        var ch = pick.map(function (c) { return lab(t, c); });
        var v = pick.map(function (c, k) { return c[1] === j0 ? k : -1; }).filter(function (k) { return k >= 0; });
        return { q: fill(t.all, t.h[j0]), a: { t: 'mc', choices: ch, v: v },
          steps: pick.map(function (c) { return dot(lab(t, c) + ' (' + t.h[c[1]] + ')'); }),
          hint: 'Go through them one at a time.', wh: [t.k, 'sa', j0, pick] };
      }
    }
    var c = R.pick(cells);
    return { q: t.one + (t.na ? (/^["“]/.test(txt(t.r[c[0]][c[1]])) ? '<br>' + t.r[c[0]][c[1]] : '<br>“' + t.r[c[0]][c[1]] + '”') : '<br>' + asp(t.r[c[0]][0]) + t.r[c[0]][c[1]]), a: { t: 'mc', choices: heads.slice(), v: cols.indexOf(c[1]) },
      steps: t.na ? [dot('That is ' + t.h[c[1]].replace(/^./, function (x) { return x.toLowerCase(); }))] : [dot(txt(t.r[c[0]][0]) + ' for ' + t.h[c[1]] + ': ' + t.r[c[0]][c[1]])].concat(cols.filter(function (j) { return j !== c[1] && t.r[c[0]][j]; }).map(function (j) { return dot('For ' + t.h[j] + ': ' + t.r[c[0]][j]); })),
      hint: 'Think back to the lesson’s comparison' + (t.cap ? ' (' + t.cap.replace(/\.$/, '') + ')' : '') + '.', wh: [t.k, 's', c[0], c[1]] };
  }
  function asp(x) { return '<b>' + x + (/\?$/.test(txt(x)) ? '' : ':') + '</b> '; }
  function lab(t, c) { return t.na ? t.r[c[0]][c[1]] : asp(t.r[c[0]][0]) + t.r[c[0]][c[1]]; }
  // extra bank items: { q, a, w: [wrong answers, more than are shown], s: [steps], h: hint, lv } or { q, tf: true|false, s, lv }
  function extra(R, t, L) {
    var its = t.x.filter(function (it) { return (it.lv || 1) <= L; }); if (!its.length) return null;
    var it = R.pick(its), p;
    if (it.f) { it = FUNS[it.f](R, L); if (!it) return null; }
    if (it.num !== undefined) {
      p = { q: it.q, a: { t: 'num', v: String(it.num) }, steps: it.s.slice() };
      if (Number.isInteger(it.num) && !it.unit && !it.pct) p.a.form = 'int';
      if (it.pct) p.a.pct = true;
      if (it.tol != null) p.a.tol = it.tol;
      if (it.unit) p.unit = it.unit;
    }
    else if (it.tf !== undefined) p = { q: it.q, a: { t: 'tf', v: it.tf }, steps: it.s.slice() };
    else {
      var k = Math.min(L === 1 ? 3 : 4, it.w.length + 1);
      p = { q: it.q, a: { t: 'mc', choices: [it.a].concat(R.shuffle(it.w).slice(0, k - 1)), v: 0 }, steps: it.s.slice() };
    }
    p.hint = it.h || 'Think back to the lesson.';
    p.wh = [t.k, 'x', its.indexOf(it) >= 0 ? t.x.indexOf(it) : -1];
    return FUNS.__wrap ? FUNS.__wrap(p, L) : p;
  }
  function make(R, list, L) {
    for (var tries = 0; tries < 8; tries++) {
      var t = R.pick(list), p = null;
      if (t.x) p = extra(R, t, L);
      else if (t.one) p = sortQ(R, t, L);
      else {
        var tps = t.m.filter(function (tp) { return (tp[5] || 1) <= L; }); if (!tps.length) continue;
        var tp = R.pick(tps);
        p = L >= 2 && tp[4] && R.chance(0.35) ? pairs(R, t, tp, L) : match(R, t, tp, L);
      }
      if (p) {
        // ladder pages show choices as plain text (only $…$ math is rendered), so choices carry no tags
        if (p.a.t === 'mc') { p.a.choices = p.a.choices.map(plain); var seen = {}; if (p.a.choices.some(function (c) { var k = seen[c]; seen[c] = 1; return k; })) continue; }
        p.nowiden = true; return p;
      }
    }
    return null;
  }
  var BY = {}; TABS.forEach(function (t) { var id = t.k.split('#')[0].split('@')[0]; (BY[id] = BY[id] || []).push(t); });
  var VAR = {};
  function baseCount(id, base, L) { // different questions (ignoring the order of choices) from 40 fixed seeds
    var key = id + '|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 24; s++) {
        try { var p = base(ML.rand(id + '#whv#' + s + '#' + L), { level: L, mode: 'learn' }), a = p.a || {};
          var k = p.q + '|' + JSON.stringify(a.choices ? a.choices.slice().sort() : a.v) + '|' + JSON.stringify(p.viz || null);
          if (!seen[k]) { seen[k] = 1; n++; } } catch (e) { }
      }
      VAR[key] = n;
    }
    return VAR[key];
  }
  function extCount(id, L) { // different table questions from 40 fixed seeds
    var key = id + '|x|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 24; s++) {
        var p = make(ML.rand(id + '#whx#' + s + '#' + L), BY[id], L); if (!p) continue;
        var k = p.q + '|' + JSON.stringify(p.a.choices ? p.a.choices.slice().sort() : p.a.v);
        if (!seen[k]) { seen[k] = 1; n++; }
      }
      VAR[key] = n;
    }
    return VAR[key];
  }
  Object.keys(BY).forEach(function (id) {
    var base = ML.getGen(id); if (!base || base._wh) return;
    var fn = function (R, ctx) {
      var L = (ctx && ctx.level) || 1, n = baseCount(id, base, L), x = extCount(id, L), share = Math.max(0.15, Math.min(0.5, x / (x + n + 1)));
      if (R.chance(share)) { var p = make(R, BY[id], L); if (p) return p; }
      return base(R, ctx);
    };
    fn._wh = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : undefined);
/* ---- end widen_hum ---- */

/* ---- widen: more forms of the same questions (so practice repeats less) ----------------------------------------
   Every topic of this course keeps its own problems, and some draws are turned into other forms of the same skill,
   built only from the topic's own problems (so their answers stay the ones the topic already checks):
     check   "Ava chose X. Is Ava right?" (Yes or No) from a one-answer multiple-choice problem
     pairs   two or three lines "question → answer"; which line is right (or, at level 3, which one is wrong)
     tfpick  "Which sentence is true?" (or false) from three of the topic's true-or-false sentences
   Questions whose answer depends on the other choices (first, best, most, not …) show the choices in the check form
   and never go into pairs. Mix per level: CFG.mix[level] = [check, pairs, tfpick] shares; the rest stays as it was. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var CFG = {"prefix":"ush2.","only":["transcontinental-railroad","plains-wars","assimilation-dawes","industrialization","labor-movement","new-immigration","gilded-age-politics","jim-crow-plessy","gilded-age-ideas","american-empire","big-stick","muckrakers","progressive-presidents","progressive-amendments","womens-suffrage","great-migration-naacp","wwi-entry","wwi-home-front-peace","roaring-twenties","twenties-conflicts","crash-1929","depression-life","new-deal","new-deal-court","new-deal-debates","road-to-wwii","pearl-harbor","wwii-home-front","japanese-american-incarceration","wwii-europe","wwii-pacific","planning-peace","containment","second-red-scare","korean-war","fifties","kennedy-cuba","vietnam","great-society","nixon-watergate","end-of-cold-war","early-civil-rights","brown-v-board","montgomery","sit-ins-freedom-rides","civil-rights-laws","movement-debates","other-movements","seventies","conservative-resurgence","after-cold-war","tech-economy","nineties-politics"]};
  var NAMES = ['Ava', 'Ben', 'Cora', 'Dev', 'Eli', 'Finn', 'Gus', 'Hana', 'Ivy', 'Jude', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Pia',
    'Quinn', 'Rosa', 'Sam', 'Tess', 'Uma', 'Vic', 'Wren', 'Zoe', 'Ada', 'Leo', 'Mia', 'Theo', 'June', 'Max'];
  var REL = /\b(first|last|earliest|latest|earlier|later|before|after|older|oldest|newer|newest|most|least|largest|smallest|biggest|best|better|worse|worst|closest|nearest|farthest|longest|shortest|highest|lowest|odd|not|except|different|same|these|this|those|following|below|above|shown|picture|pictures|map|table|chart|graph|diagram|passage|scene|story|look|read|here|example|examples|likely|probably|mainly|main|usually|typically|other|another|which one|each|order|then|next)\b|n['’]t\b/i;
  // pairs judge each line on its own, so only questions whose answer depends on the other choices are left out
  var RELP = /\b(first|last|earliest|latest|oldest|newest|most|least|largest|smallest|biggest|best|better|worse|worst|closest|nearest|farthest|longest|shortest|highest|lowest|odd|not|except|different|same|these|this|those|following|below|above|shown|picture|pictures|map|table|chart|graph|diagram|passage|scene|story|which one|other|another|rank|order|more|less|fewer)\b|n['’]t\b|\w+est\b/i;
  var REF = /\b(this|these|those|shown|picture|map|table|chart|graph|diagram|passage|scene|story|above|below|here|following)\b/i;
  var BADCH = /\b(all|none|both|neither) of\b|\b(above|below)\b|^(both|neither|all|none)\b|\bchoice\b|\boption\b/i;
  function strip(s) { return String(s).replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function plainish(s) { return !/<(?!\/?(b|i|em|strong)\b)[^>]*>/.test(String(s).replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, '').replace(/<span class="[\w-]*big">([\s\S]*)<\/span>/, '$1')); }
  function add(q, html) { // inside a read-aloud big span when there is one
    var m = /<span class="[\w-]*big">/.exec(q);
    if (m) { var k = q.lastIndexOf('</span>'); if (k > m.index) return q.slice(0, k) + '<br>' + html.replace(/<\/p>\s*<p[^>]*>/g, '<br>').replace(/<\/?p[^>]*>/g, '') + q.slice(k); }
    return q + html;
  }
  function single(p) {
    return p && p.a && p.a.t === 'mc' && !Array.isArray(p.a.v) && Array.isArray(p.a.choices) && p.a.choices.length >= 2 &&
      !p.a.choices.some(function (c) { return BADCH.test(strip(c)); });
  }
  function hash(t) { var h = 7; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; }
  function nameFor(q, key) { // the same claim always gets the same name, so a name alone never makes a "new" problem
    var t = strip(q), ok = NAMES.filter(function (n) { return t.indexOf(n) < 0 && String(key).indexOf(n) < 0; });
    return (ok.length ? ok : NAMES)[hash(t + '|' + key) % (ok.length || NAMES.length)];
  }
  function dot(s) { s = String(s); return /[.!?…"”')\]]\s*(<\/b>)?$/.test(strip(s)) || /\$$/.test(s) ? s : s + '.'; }
  function optList(ch) { return '<p class="wd-opts">The choices were:<br>' + ch.map(function (c) { return '• ' + c; }).join('<br>') + '</p>'; }
  function copyP(p, q, a, steps) { var o = {}; for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) o[k] = p[k]; o.q = q; o.a = a; o.steps = steps; delete o.choices; return o; }

  // check: show one choice (the right one half the time) and ask whether it is right
  function check(p, R) {
    var ch = p.a.choices, v = p.a.v, idx = ch.map(function (_, i) { return i; }), others = idx.filter(function (i) { return i !== v; });
    var i = R.chance(0.5) ? v : R.pick(others), ok = i === v, nm = nameFor(p.q, ch[i]), letters = ch.every(function (c) { return /^[A-Z]$/.test(String(c)); });
    var stem = strip(p.q), html = '';
    if (!letters && (REL.test(stem) || ch.length > 4 || CFG.listAll)) {
      var shown = p.a.keep ? ch.slice() : R.shuffle(ch);
      html += optList(shown);
    }
    html += '<p class="wd-check">' + nm + ' chose: <b>' + ch[i] + '</b>' + (/[.!?…"”]$/.test(strip(ch[i])) ? '' : '.') + ' Is ' + nm + ' right?</p>';
    var first = ok ? 'Yes. ' + dot(ch[v]) + ' is the right answer.' : 'No. The right answer is: ' + dot(ch[v]);
    if (ok) first = 'Yes, that is the right answer.';
    return copyP(p, add(p.q, html), { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true }, [first].concat(p.steps || []));
  }
  // check for "choose all": the whole list is shown, and one learner's picks; right only if exactly the right ones
  function checkAll(p, R) {
    var ch = p.a.choices, v = p.a.v.slice().sort(), n = ch.length, pick;
    if (R.chance(0.45)) pick = v.slice();
    else {
      var t = 0; do { var j = R.int(0, n - 1), s = v.slice(), k = s.indexOf(j); if (k >= 0) s.splice(k, 1); else s.push(j); if (R.chance(0.3)) { var j2 = R.int(0, n - 1), k2 = s.indexOf(j2); if (k2 >= 0) s.splice(k2, 1); else s.push(j2); } pick = s.sort(); t++; }
      while (t < 20 && (!pick.length || pick.join() === v.join()));
      if (!pick.length || pick.join() === v.join()) return null;
    }
    var ok = pick.join() === v.join(), nm = nameFor(p.q, pick.join());
    var html = optList(ch) + '<p class="wd-check">' + nm + ' chose ' +
      (pick.length === 1 ? 'only: <b>' + ch[pick[0]] + '</b>' : 'these: <b>' + pick.map(function (i) { return ch[i]; }).join('</b>; <b>') + '</b>') + '. Is ' + nm + ' right?</p>';
    var first = ok ? 'Yes, those are exactly the right ones.' : 'No. The right ones are: ' + v.map(function (i) { return ch[i]; }).join('; ');
    return copyP(p, add(p.q.replace(/\s*(Choose|Select|Pick) (all|every)[^.?!<]*[.?!]?/i, ''), html), { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true }, [dot(first)].concat(p.steps || []));
  }

  // items for pairs: one-answer questions that stand on their own (no picture, no passage, no "first/best/…")
  function pairItem(p) {
    if (!single(p) || p.viz) return null;
    var max = CFG.maxStem || 120, maxA = CFG.maxAns || 70, a = strip(p.a.choices[p.a.v]), stem, group = '';
    // "prompt<br><b>thing</b>" or "prompt<blockquote>thing</blockquote>": a line is "thing → answer", lines share the prompt
    var q0 = p.q.replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, '').replace(/<span class="[\w-]*big">([\s\S]*)<\/span>/, '$1').trim();
    var m = /^([^<]{6,140}?)\s*(?:<br>\s*<b>([^<]{3,140})<\/b>|<blockquote>([^<]{3,140})<\/blockquote>)\s*$/.exec(q0);
    if (m) { group = m[1].trim(); stem = (m[2] || m[3]).trim(); if (RELP.test(group.replace(/\b(this|these)\b/gi, ''))) return null; }
    else {
      if (!plainish(p.q)) return null;
      stem = strip(p.q); if (RELP.test(stem)) return null;
    }
    if (stem.length > max || stem.length < 3 || a.length > maxA || /^[A-Z]$/.test(a) || /\$/.test(stem + a + group)) return null;
    var w = p.a.choices.filter(function (_, i) { return i !== p.a.v; }).map(strip).filter(function (x) { return x.length <= maxA && x !== a; });
    if (!w.length) return null;
    return { stem: stem.replace(/\s*(Choose one|Pick one)\.?$/i, ''), a: a, w: w, why: (p.steps || [])[0] || '', group: group };
  }
  function tfItem(p) {
    if (!p || !p.a || p.a.t !== 'tf' || p.viz || !plainish(p.q)) return null;
    var s = strip(p.q).replace(/^(True or false\?|True or false:)\s*/i, '').replace(/\s*(True or false\?|Is this true or false\?|Is it true or false\?)$/i, '').trim();
    if (s.length < 8 || s.length > (CFG.maxStem || 120) + 20 || REF.test(s) || /\?$/.test(s) || /\$/.test(s)) return null;
    return { s: s, v: p.a.v, why: (p.steps || [])[0] || '' };
  }
  function harvest(base, R, ctx, make, n, distinct) {
    var out = [], keys = {};
    for (var t = 0; t < 24 && out.length < n; t++) {
      // at level 3, lines may come from level 2 questions too: three lines with one wrong is the harder form
      var c2 = ctx && ctx.level >= 3 && (t % 2) ? Object.assign({}, ctx, { level: 2 }) : ctx;
      var p; try { p = base(ML.rand(R.int(1, 2e9)), c2); } catch (e) { continue; }
      var it = make(p); if (!it) continue;
      if (out.length && it.group !== undefined && it.group !== out[0].group) continue;
      var k = distinct(it); if (k.some(function (x) { return keys[x]; })) continue;
      k.forEach(function (x) { keys[x] = 1; }); out.push(it);
    }
    return out;
  }
  function pairs(base, R, ctx, n, wrongOne) {
    var its = harvest(base, R, ctx, pairItem, n, function (it) { return it.group ? ['s:' + it.stem] : ['s:' + it.stem, 'a:' + it.a]; });
    if (its.length < n) return null;
    var answers = its.map(function (it) { return it.a; }), used = {};
    var target = R.int(0, n - 1), lines = [], steps = [];
    for (var i = 0; i < n; i++) {
      var it = its[i], right = wrongOne ? i !== target : i === target, ans = it.a;
      if (!right) {
        var ws = it.w.filter(function (x) { return (its[0].group || answers.indexOf(x) < 0) && !used[x]; });
        if (!ws.length) return null;
        ans = R.pick(ws); if (!its[0].group) used[ans] = 1;
      }
      lines.push(it.stem + ' → ' + ans); // plain text: ladder pages show choices as text
      steps.push(it.group ? dot(it.stem) + ' Answer: ' + it.a + (right ? '.' : ', not ' + ans + '.') : it.stem + ' The answer is ' + it.a + (right ? '.' : ', not ' + ans + '.'));
    }
    var g = its[0].group, q = g ? '<p class="wd-group">The question for every line: <i>' + g + '</i></p>' + (wrongOne ? 'One line has the <b>wrong</b> answer. Which line is it?' : n === 2 ? 'Which line has the <b>right</b> answer?' : 'Only one line has the right answer. Which line is it?') : wrongOne ? 'Each line is a question and an answer. One answer is <b>wrong</b>. Which line is it?'
      : (n === 2 ? 'Each line is a question and an answer. Which line has the <b>right</b> answer?' : 'Each line is a question and an answer. Only one answer is right. Which line is it?');
    if (its[target].why) steps.push(its[target].why);
    return { q: q, a: { t: 'mc', choices: lines, v: target }, steps: steps, hint: 'Check each line on its own. Does the answer fit the question?' };
  }
  function tfpick(base, R, ctx, wantFalse) {
    var its = harvest(base, R, ctx, tfItem, 6, function (it) { return ['s:' + it.s]; });
    var T = its.filter(function (x) { return x.v; }), F = its.filter(function (x) { return !x.v; });
    var odd = wantFalse ? F : T, rest = wantFalse ? T : F;
    if (!odd.length || rest.length < 2) return null;
    var pick = [odd[0], rest[0], rest[1]], order = R.shuffle([0, 1, 2]), choices = order.map(function (i) { return pick[i].s; });
    var steps = pick.map(function (x) { return x.s + ' ' + (x.v ? 'True.' : 'False.'); });
    if (odd[0].why) steps.push(odd[0].why);
    return { q: wantFalse ? 'Which sentence is <b>false</b>?' : 'Which sentence is <b>true</b>?', a: { t: 'mc', choices: choices, v: order.indexOf(0) }, steps: steps,
      hint: 'Decide about each sentence on its own.' };
  }
  var MIX = CFG.mix || { 1: [0.38, 0.25, 0.04], 2: [0.27, 0.3, 0.1], 3: [0.17, 0.4, 0.15] };
  function wrap(id, base) {
    var fn = function (R, ctx) {
      var lv = ctx && ctx.level || 1, p = base(R, ctx), m = MIX[lv] || MIX[3], r = R.next();
      if (p.nowiden || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf') || (CFG.skip && CFG.skip.indexOf(id) >= 0)) return p; // typed answers stay as they are
      var form = r < m[0] ? 0 : r < m[0] + m[1] ? 1 : r < m[0] + m[1] + m[2] ? 2 : -1;
      if (form < 0) return p;
      var tries = [form, (form + 1) % 3, (form + 2) % 3].filter(function (f) { return m[f] > 0; });
      for (var t = 0; t < tries.length; t++) {
        var f = tries[t], alt = null;
        if (f === 0) alt = single(p) ? check(p, R) : (p.a && p.a.t === 'mc' && Array.isArray(p.a.v) && !p.viz ? checkAll(p, R) : null);
        else if (f === 1) alt = pairs(base, R, ctx, lv === 1 ? 2 : 3, lv >= 3 && R.chance(0.6));
        else alt = tfpick(base, R, ctx, R.chance(0.4));
        if (alt) return alt;
      }
      return p;
    };
    fn.widened = true;
    return fn;
  }
  ML.genIds().forEach(function (id) {
    if (id.indexOf(CFG.prefix) !== 0 || (CFG.only && CFG.only.indexOf(id.slice(CFG.prefix.length)) < 0)) return;
    var g = ML.getGen(id); if (g && !g.widened) ML.gen(id, wrap(id, g));
  });
})(typeof window !== 'undefined' ? window.MathLadder : undefined);
/* ---- end widen ---- */
