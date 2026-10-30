/* Generators for ush1, merged from part files by /tmp/merge_parts.js (edit the parts, not this file). */
/* ---- part A ---- */
/* U.S. History I (History & Civics Ladder, course key ush1), part A: units 1-4 (Thinking Like a Historian; Native America
   and Contact; Colonial America; The American Revolution). Problem generators. Source: /tmp/work_ush1_A/gen_*.js, joined
   into /tmp/work_ush1_A/out/gen.js by /tmp/work_ush1_A/build_gen.sh, merged into static/civics/gen/ush1.js by
   /tmp/merge_parts.js (edit the parts, not the merged file).
   Problems check facts, dates, order, sources and reasoning skills, never opinions:
     level 1  one fact, three choices (or primary/secondary, true/false) with plainly wrong distractors
     level 2  four choices whose wrong ones match the topic's trouble note; ordering three or four events; years typed
     level 3  choose all that are true; order four or five events; apply a skill to a new source or case
   Each topic is a bank of items; choices are drawn from pools and shuffled (keep: true), so problems vary.
   Facts follow the lessons in data/civics/lessons/ush1.json and the sources listed there. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, M = Math;
  var LET = 'ABCDEFGH';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  // accepted spellings of a letter order such as "BDAC"
  function orderAns(s) { var a = s.split(''); return [s, a.join(' '), a.join(','), a.join(', '), a.join('-'), a.join(', ').toLowerCase()]; }
  // one problem from a bank of items:
  //   { L: [levels], q, a, w: [wrong pool], why, hint?, viz? }            multiple choice (3 choices at level 1, else 4)
  //   { L, q, tf: true | false, why }                                      true or false
  //   { L, q, all: [[text, true | false], …], why }                         choose all that are true
  //   { L, q, num: 1776, why }                                              a typed number (a year)
  //   { L, gen: function (R, lv) { return item or a finished problem (has .a) } }
  function bank(items, hint) {
    return function (R, ctx) {
      var lv = ctx.level || 1, pool = items.filter(function (it) { return it.L.indexOf(lv) >= 0; });
      if (!pool.length) pool = items;
      var it = R.pick(pool);
      if (it.gen) { var g = it.gen(R, lv); if (g.a && g.steps) return g; it = g; }
      return make(R, lv, it, hint);
    };
  }
  function make(R, lv, it, hint) {
    var p = { q: it.q, steps: [].concat(it.why), hint: it.hint || hint || 'Think back to the lesson.' };
    if (it.viz) p.viz = it.viz;
    if (it.tf != null) { p.q = it.q + ' <b>True or false?</b>'; p.a = { t: 'tf', v: it.tf }; return p; }
    if (it.num != null) { p.a = { t: 'num', v: String(it.num), form: 'int' }; return p; }
    if (it.all) {
      var opts = R.shuffle(it.all.slice()), v = [];
      opts.forEach(function (o, i) { if (o[1]) v.push(i); });
      p.q = it.q + ' <b>Choose all that are true.</b>';
      p.a = { t: 'mc', choices: opts.map(function (o) { return o[0]; }), v: v, keep: true };
      return p;
    }
    var n = lv === 1 ? 2 : 3, ch = R.shuffle([it.a].concat(R.sample(it.w, M.min(n, it.w.length))));
    if (it.sortNum) ch.sort(function (x, y) { return parseFloat(x) - parseFloat(y); });
    p.a = { t: 'mc', choices: ch, v: ch.indexOf(it.a), keep: true };
    return p;
  }
  // put events in order: list = [[label, year], …] with distinct years; k events are drawn; shown lettered and shuffled
  function orderQ(R, list, k, what) {
    var pick = R.sample(list, k).sort(function (x, y) { return x[1] - y[1]; });
    var start = R.shuffle(pick.map(function (x, i) { return i; }));
    if (start.every(function (v, i) { return v === i; })) start.reverse();
    var shown = start.map(function (i) { return pick[i]; }), ans = '';
    pick.forEach(function (e, i) { ans += LET.charAt(start.indexOf(i)); });
    return {
      q: 'Put these ' + (what || 'events') + ' in order, earliest first. Type the ' + k + ' letters in that order.',
      a: { t: 'text', v: orderAns(ans) },
      viz: { name: 'cv-order', opts: { items: pick.map(function (e) { return e[0]; }), start: start, quiet: true, interactive: false } },
      steps: pick.map(function (e) { return LET.charAt(start.indexOf(pick.indexOf(e))) + ': ' + e[0] + ' (' + (e[2] || e[1]) + ')'; }).concat(['So the order is <b>' + ans + '</b>.']),
      hint: 'Place the one you are surest of first, then fit the others around it.'
    };
  }
  // "Which year?" as four nearby years (level 2 and 3) or a typed year
  function yearQ(R, lv, q, year, why, near) {
    var d = near || [1, 2, 3, 5, 10];
    var w = []; while (w.length < 6) { var y = year + R.pick(d) * (R.coin() ? 1 : -1); if (y !== year && w.indexOf(String(y)) < 0) w.push(String(y)); }
    return { q: q, a: String(year), w: w, why: why, sortNum: true };
  }
  // "Which number marks …?" on the places map: target plus decoys, shuffled; pins are numbered in list order
  function mapPick(R, target, pool, names) {
    var keys = R.shuffle([target].concat(R.sample(pool.filter(function (k) { return k !== target; }), 3))), n = keys.indexOf(target) + 1;
    var CV = ML.civics, nm = names[target] || (CV && CV.PLACES[target] ? CV.PLACES[target].name : target);
    return { q: 'Which number on the map marks <b>' + nm.split(',')[0] + '</b>?', a: { t: 'mc', choices: ['1', '2', '3', '4'], v: n - 1, keep: true },
      viz: { name: 'cv-map', opts: { mode: 'places', places: keys, numbered: true, quiet: true, interactive: false } },
      steps: ['Number ' + n + ' is ' + nm + '.'], hint: 'East or west? Coast or inland?' };
  }

  /* ===================================================================== Unit 1: Thinking Like a Historian */
  // sources: [description, primary?, why]
  var SOURCES = [
    ['The Mayflower Compact, signed by Pilgrim men in 1620', true, 'It was written and signed by the people forming the government, at the time.'],
    ['A 1910 history book about the Jamestown colony', false, 'It is old, but it was written about 300 years after the events by someone studying them.'],
    ['A cooking pot dug up by archaeologists at Jamestown', true, 'Objects made and used at the time are primary sources.'],
    ['A diary kept by a soldier at Valley Forge in the winter of 1777 to 1778', true, 'The soldier wrote it at the time, as he lived through it.'],
    ['A 2019 textbook chapter on the American Revolution', false, 'It was written long afterward from other sources.'],
    ['A museum website explaining the Stamp Act', false, 'Its authors studied the Stamp Act; they did not live through it.'],
    ['The Declaration of Independence (1776)', true, 'It was written and adopted by the Continental Congress at the time.'],
    ['A 1765 newspaper report of a Stamp Act protest in Boston', true, 'It was printed at the time of the protest.'],
    ['A documentary film about the Pilgrims made in 2002', false, 'It was made long afterward by people studying the Pilgrims.'],
    ['Columbus\'s 1493 letter describing his first voyage', true, 'Columbus wrote it himself, on his way home.'],
    ['A map of the Ohio Country drawn by a surveyor in 1755', true, 'It was drawn at the time, by someone who was there.'],
    ['A historian\'s 1990 article comparing colonial farms', false, 'It interprets older evidence long after the fact.'],
    ['A biography of Benjamin Franklin published in 2003', false, 'It was written by a later author who studied Franklin\'s papers.'],
    ['Benjamin Franklin\'s own letters from the 1770s', true, 'Franklin wrote them at the time.'],
    ['A painting of the Boston Tea Party made in 1846', false, 'It was made more than 70 years after 1773 by an artist who was not there.'],
    ['A 1774 sermon preached in a Massachusetts church about the crisis with Britain', true, 'It was preached at the time by someone living through the crisis.']
  ];
  G('ush1.primary-secondary', bank([
    { L: [1, 2], gen: function (R) { var s = R.pick(SOURCES); return { q: 'Is this a primary or a secondary source?<br><b>' + s[0] + '</b>', a: s[1] ? 'Primary source' : 'Secondary source', w: [s[1] ? 'Secondary source' : 'Primary source'], why: (s[1] ? 'Primary: ' : 'Secondary: ') + s[2] }; } },
    { L: [2, 3], gen: function (R) {
      var pr = R.sample(SOURCES.filter(function (s) { return s[1]; }), 1)[0], se = R.sample(SOURCES.filter(function (s) { return !s[1]; }), 3);
      var ask = R.coin();
      return ask ? { q: 'Which of these is a <b>primary</b> source?', a: pr[0], w: se.map(function (s) { return s[0]; }), why: pr[0] + ': ' + pr[2] }
        : { q: 'Which of these is a <b>secondary</b> source?', a: se[0][0], w: R.sample(SOURCES.filter(function (s) { return s[1]; }), 3).map(function (s) { return s[0]; }), why: se[0][0] + ': ' + se[0][2] };
    } },
    { L: [3], gen: function (R) { var s = R.sample(SOURCES, 5); return { q: 'Which of these are primary sources?', all: s.map(function (x) { return [x[0], x[1]]; }), why: s.map(function (x) { return x[0] + ': ' + (x[1] ? 'primary. ' : 'secondary. ') + x[2]; }) }; } },
    { L: [1, 2], q: 'What makes a source <b>primary</b>?', a: 'It was made at the time by someone who saw or took part in the events.', w: ['It is very old.', 'It is always true.', 'It was written by a professional historian.', 'It is printed in a textbook.'], why: 'A primary source comes from the time and the people involved. Age alone does not make a source primary, and primary sources can be wrong.' },
    { L: [2, 3], q: 'A source is a primary source, so it must be accurate.', tf: false, why: 'False. A primary source shows one person\'s view at the time. It can be mistaken or one-sided, so historians check it against other sources.' },
    { L: [2, 3], q: 'A history of the Revolution written in 1900 is a primary source about the war, because it is more than a hundred years old.', tf: false, why: 'False. It was written more than a century after the war by someone studying it, so it is a secondary source about the war.' },
    { L: [1, 2], q: 'Objects such as tools, coins and buildings from the time can be primary sources.', tf: true, why: 'True. Anything made or used at the time, not only writing, is primary evidence.' },
    { L: [3], q: 'Columbus wrote in 1493 that the island people he met had "no kind of government." What is the best way for a historian to use this line?', a: 'As evidence of what Columbus believed, checked against other evidence about Taíno society', w: ['As proof that the Taíno had no government', 'As useless, because Columbus was biased', 'As a secondary source about the Taíno', 'As proof that Columbus never met the Taíno'], why: 'Columbus could not speak the language and stayed only briefly. His letter is strong evidence of his own view and weak evidence of Taíno life, so historians compare it with other sources such as archaeology and later accounts.' },
    { L: [3], q: 'Mercy Otis Warren lived through the Revolution and published a history of it in 1805. For a historian studying <b>how Patriot writers of the time saw the war</b>, her book is…', a: 'a primary source', w: ['a secondary source', 'not a source at all', 'a textbook'], why: 'Whether a source is primary depends on the question. For the views of a Patriot writer of the time, her book is a primary source; for the events of the war, it is a secondary history.' }
  ], 'Ask when the source was made and whether its maker was there.'));

  // HIPP: [statement about a source, category index, explanation]
  var HIPP = ['Historical situation', 'Intended audience', 'Purpose', 'Point of view'];
  var HIPPS = [
    ['Columbus wrote his letter on the voyage home in 1493, after his first crossing.', 0, 'This describes when and where the source was made: its historical situation.'],
    ['Columbus\'s letter was meant to be read by King Ferdinand and Queen Isabella.', 1, 'This says who the letter was for: its intended audience.'],
    ['Columbus wanted the monarchs to pay for another voyage.', 2, 'This is what he hoped the letter would achieve: its purpose.'],
    ['Columbus was a sailor in Spain\'s service who was sure he had reached Asia.', 3, 'This is about who the author was and how he saw things: his point of view.'],
    ['The Stamp Act Congress met in October 1765, months after Parliament passed the Stamp Act.', 0, 'This sets the scene: the historical situation.'],
    ['The Stamp Act Congress addressed its petitions to the King and both houses of Parliament.', 1, 'This tells who was meant to read them: the intended audience.'],
    ['The delegates wanted Parliament to repeal the stamp tax.', 2, 'This is the goal of the document: its purpose.'],
    ['The delegates were colonial leaders who thought of themselves as loyal British subjects.', 3, 'This describes the authors and their outlook: point of view.'],
    ['Thomas Paine wrote Common Sense in late 1775, months after fighting began at Lexington and Concord.', 0, 'This is the moment the pamphlet came from: historical situation.'],
    ['Common Sense was written for ordinary colonists, in plain language, and sold cheaply.', 1, 'This tells who Paine was writing for: intended audience.'],
    ['Paine wanted to persuade colonists to choose full independence.', 2, 'This is what Paine meant the pamphlet to do: purpose.'],
    ['Paine was a recent immigrant from England who disliked kings and hereditary rule.', 3, 'This is about the author\'s background and views: point of view.'],
    ['A Virginia planter wrote a letter in 1676, during Bacon\'s Rebellion.', 0, 'This places the letter in its moment: historical situation.'],
    ['A governor wrote a report to officials in London who would decide whether to send troops.', 1, 'This tells who would read the report: intended audience.'],
    ['A minister printed a sermon to win support for the revival in his town.', 2, 'This tells why the sermon was printed: purpose.'],
    ['A Loyalist merchant whose shop was attacked wrote about the Boston crowds.', 3, 'His losses and loyalty shape how he describes the crowds: point of view.']
  ];
  G('ush1.sourcing-hipp', bank([
    { L: [1, 2, 3], gen: function (R) { var s = R.pick(HIPPS); return { q: 'Which part of HIPP does this statement describe?<br><b>' + s[0] + '</b>', a: HIPP[s[1]], w: HIPP.filter(function (x, i) { return i !== s[1]; }), why: s[2] }; } },
    { L: [1, 2], q: 'In HIPP, what does the <b>I</b> stand for?', a: 'Intended audience', w: ['Interpretation', 'Importance', 'Information', 'Idea'], why: 'HIPP: Historical situation, Intended audience, Purpose, Point of view.' },
    { L: [1, 2], q: 'Which question asks about a source\'s <b>purpose</b>?', a: 'Why was it made, and what did the author want to happen?', w: ['When and where was it made?', 'Who was meant to read it?', 'What is the author\'s background?'], why: 'Purpose is the reason for making the source: what the author hoped it would do.' },
    { L: [2, 3], q: 'A general writes one letter to his commander and another to his wife about the same battle, and they differ. Which part of HIPP best explains the difference?', a: 'Intended audience', w: ['Historical situation', 'Point of view', 'Secondary source'], why: 'The author, the battle and the moment are the same; what changed is who would read each letter.' },
    { L: [2, 3], q: 'Because a source has a point of view, historians should not use it as evidence.', tf: false, why: 'False. Every source has a point of view. Historians use it, knowing what the author was in a position to know and what the author wanted readers to think.' },
    { L: [2, 3], q: 'A student writes: "Columbus says he found many islands full of people." What has the student done?', a: 'Summarized the source, but not sourced it', w: ['Analyzed its purpose', 'Explained its audience', 'Shown it is a secondary source'], why: 'That sentence restates what the source says. Sourcing asks why Columbus wrote it that way, and for whom.' },
    { L: [3], q: 'The Stamp Act Congress (1765) declared both loyalty to the crown and that colonists could be taxed only with their consent. About this document:', all: [['Its intended audience included the King and Parliament.', true], ['Its purpose included winning repeal of the Stamp Act.', true], ['It declared the colonies independent.', false], ['Its loyal tone made the protest harder to dismiss as rebellion.', true]], why: 'The Congress addressed the King and Parliament and sought repeal; it did not seek independence, which came eleven years later.' }
  ], 'Ask: when and where, for whom, why, and by whom?'));

  G('ush1.dates-and-periods', bank([
    { L: [1, 2, 3], gen: function (R) {
      var y; do { y = R.int(1405, 1895); } while (y % 100 === 0);
      var c = M.floor(y / 100) + 1;
      return { q: 'In which century is the year <b>' + y + '</b>? Type the number (for the 18th century, type 18).', num: c, why: ['The hundreds part of ' + y + ' is ' + M.floor(y / 100) + '.', 'Add one: ' + M.floor(y / 100) + ' + 1 = ' + c + ', so ' + y + ' is in the ' + c + 'th century (the ' + M.floor(y / 100) + '00s).'] };
    } },
    { L: [1, 2], gen: function (R) {
      var c = R.int(15, 19), h = c - 1;
      return { q: 'The <b>' + c + 'th century</b> is the same as…', a: 'the ' + h + '00s', w: ['the ' + c + '00s', 'the ' + (h - 1) + '00s', 'the ' + (c + 1) + '00s'], why: 'The century number is one more than the hundreds digits: the ' + c + 'th century is the ' + h + '00s (strictly ' + h + '01 to ' + c + '00).' };
    } },
    { L: [2, 3], gen: function (R) {
      var c = R.int(15, 19), h = c - 1;
      return { q: 'Which year is in the <b>' + c + 'th century</b>?', a: String(h * 100 + R.int(11, 89)), w: [String(c * 100 + R.int(11, 89)), String((h - 1) * 100 + R.int(11, 89)), String((c + 1) * 100 + R.int(11, 89))], why: 'The ' + c + 'th century is the ' + h + '00s, so its years begin with ' + h + '.', sortNum: true };
    } },
    { L: [2, 3], gen: function (R) {
      var d = R.pick([1520, 1540, 1560, 1620, 1630, 1640, 1670, 1680, 1730, 1740, 1750, 1760, 1770, 1780]); // never next to a round hundred, so "the 1600s" is never a decade
      var y = d + R.int(0, 9);
      return { q: 'The year ' + y + ' falls in which decade?', a: 'the ' + d + 's', w: ['the ' + (d + 10) + 's', 'the ' + (d - 10) + 's', 'the ' + M.floor(d / 100) + '00s'], why: 'A decade is ten years named by its first year: the ' + d + 's are ' + d + ' to ' + (d + 9) + '.' };
    } },
    { L: [2, 3], gen: function (R) {
      var y = R.pick([R.int(1492, 1606), R.int(1608, 1753), R.int(1755, 1799)]), n = y < 1607 ? 1 : y < 1754 ? 2 : 3;
      return { q: 'The AP U.S. History periods begin in 1491, 1607 and 1754 (and Period 4 in 1800). Which period includes the year <b>' + y + '</b>?', a: 'Period ' + n, w: ['Period ' + ((n % 3) + 1), 'Period ' + (((n + 1) % 3) + 1), 'Period 4'], why: 'Period 1: 1491 to 1607. Period 2: 1607 to 1754. Period 3: 1754 to 1800. ' + y + ' is in Period ' + n + '.' };
    } },
    { L: [1, 2], q: 'The 1800s are the 18th century.', tf: false, why: 'False. The 1800s are the 19th century. The 18th century is the 1700s.' },
    { L: [2, 3], q: 'In strict counting, the year 1800 is the last year of the 18th century.', tf: true, why: 'True. With no year zero, each century ends with a round year: the 18th century runs from 1701 to 1800.' },
    { L: [2, 3], gen: function (R) { return orderQ(R, [['St. Augustine founded', 1565], ['Columbus reaches the Caribbean', 1492], ['Jamestown founded', 1607], ['Pueblo Revolt', 1680], ['Stono Rebellion', 1739], ['Stamp Act', 1765], ['Treaty of Paris ends the Revolution', 1783], ['Mayflower Compact', 1620]], 3); } },
    { L: [3], gen: function (R) { return orderQ(R, [['St. Augustine founded', 1565], ['Columbus reaches the Caribbean', 1492], ['Jamestown founded', 1607], ['Pueblo Revolt', 1680], ['Stono Rebellion', 1739], ['Stamp Act', 1765], ['Treaty of Paris ends the Revolution', 1783], ['Mayflower Compact', 1620]], 4); } }
  ], 'Hundreds digits plus one gives the century.'));

  G('ush1.cause-and-effect', bank([
    { L: [1, 2, 3], gen: function (R) {
      var C = [['The colonial assemblies had governed local affairs for over a century', 0], ['Enlightenment ideas about natural rights spread in the colonies', 0], ['Britain had a large war debt after 1763 and began taxing the colonies', 1], ['The Coercive Acts closed the port of Boston (1774)', 1], ['British troops marched to seize supplies at Concord (April 1775)', 1], ['The Declaration of Independence (1776)', 2], ['The new states wrote their own constitutions', 2], ['Britain recognized American independence (1783)', 2]];
      var BINS = ['A long-term cause of the Revolution', 'A short-term cause or trigger of the Revolution', 'An effect of the Revolution'];
      var c = R.pick(C);
      return { q: 'Where does this belong?<br><b>' + c[0] + '</b>', a: BINS[c[1]], w: BINS.filter(function (x, i) { return i !== c[1]; }), why: c[1] === 0 ? 'A condition that built up over many years before 1775: a long-term cause.' : c[1] === 1 ? 'An event in the years or months just before the fighting: a short-term cause.' : 'It came out of the Revolution: an effect.' };
    } },
    { L: [1, 2], q: 'What is a <b>trigger</b> (a short-term cause)?', a: 'The spark just before an event that sets it off', w: ['A condition that built up over many years', 'Something that happened because of the event', 'A secondary source about the event'], why: 'A trigger is the immediate spark; long-term causes are the conditions that made the spark matter.' },
    { L: [2, 3], q: 'A student writes: "The Great Awakening came before the Revolution, so it caused the Revolution." What is wrong with this reasoning?', a: 'Coming before an event does not prove it caused the event; a link must be shown.', w: ['The Great Awakening came after the Revolution.', 'Religious movements never affect politics.', 'Nothing is wrong with it.'], why: 'This is the error "after this, therefore because of this." Many things came before 1775. A cause needs an explained link to the effect.' },
    { L: [2, 3], gen: function (R) {
      var S = [['After the Revolution, most states still let only men who owned property vote.', 'Continuity'], ['After the Revolution, Pennsylvania passed a law to end slavery gradually (1780).', 'Change'], ['Before and after the Revolution, most colonists and citizens lived on farms.', 'Continuity'], ['After the Revolution, the states wrote new written constitutions.', 'Change'], ['Virginia\'s Statute for Religious Freedom (1786) ended forced support for any church.', 'Change'], ['Slavery remained legal in the Southern states after the Revolution.', 'Continuity']];
      var s = R.pick(S);
      return { q: 'Is this an example of <b>change</b> or <b>continuity</b> over time?<br><b>' + s[0] + '</b>', a: s[1], w: [s[1] === 'Change' ? 'Continuity' : 'Change'], why: s[1] === 'Change' ? 'Something new replaced the old way: change.' : 'The old pattern lasted through the Revolution: continuity.' };
    } },
    { L: [2, 3], q: 'Big events in history usually have a single cause.', tf: false, why: 'False. Historians usually find several causes, long-term and short-term, working together.' },
    { L: [3], q: 'About the causes and effects of the Columbian Exchange after 1492:', all: [['Columbus\'s voyages were a cause of the exchange.', true], ['The deaths of many Native people from new diseases were an effect.', true], ['New crops such as potatoes reaching Europe were an effect.', true], ['The exchange happened before 1492.', false]], why: 'The voyages began the exchange; disease, new crops and new animals crossing the ocean were its effects. It began in 1492, not before.' },
    { L: [3], q: 'Which statement explains <b>why</b> the Revolution began <b>in 1775</b>, not just why it happened at all?', a: 'British troops marched on Concord, and colonial militia fought them.', w: ['Colonists had governed themselves for over a century.', 'Enlightenment ideas had spread for decades.', 'The colonies were far from Britain.'], why: 'Long-term causes explain why a conflict was possible; the trigger explains why it broke out at that moment.' }
  ], 'Long-term causes build up; triggers set things off; effects come after.'));
  /* ===================================================================== Unit 2: Native America and Contact */
  G('ush1.peopling-americas', bank([
    { L: [1, 2], q: 'From which part of the world did the first peoples of the Americas come?', a: 'Northeast Asia', w: ['Western Europe', 'West Africa', 'Australia', 'The Middle East'], why: 'Archaeology and DNA point to northeast Asia (Siberia), by way of Beringia or the Pacific coast.' },
    { L: [1, 2], q: 'What was <b>Beringia</b>?', a: 'Land that joined Siberia and Alaska when Ice Age sea levels were low', w: ['A Native city on the Mississippi River', 'A Spanish colony in Florida', 'An island in the Caribbean', 'A trade route across the Sahara'], why: 'With water locked in glaciers, the sea was lower and a wide land joined Asia and North America where the Bering Strait is now.' },
    { L: [1, 2, 3], q: 'People were in the Americas by at least how long ago, as most archaeologists agree?', a: '15,000 years ago', w: ['1,500 years ago', '500 years ago', '1 million years ago', '3,000 years ago'], why: 'Sites such as Monte Verde in Chile (at least 14,500 years old) show people here by at least about 15,000 years ago.' },
    { L: [2, 3], q: 'Monte Verde, a site in southern Chile, is at least 14,500 years old. Why is it important?', a: 'It shows people reached the far south of the Americas by then, so they arrived even earlier.', w: ['It proves the Clovis people were the first Americans.', 'It shows people arrived from Africa by boat.', 'It is the oldest European settlement in the Americas.'], why: 'People had to travel all the way from Beringia to Chile, so the first arrivals must be older than Monte Verde. It also showed that Clovis (about 13,000 years ago) was not first.' },
    { L: [2, 3], q: 'Which two routes into the Americas do scientists propose?', a: 'A land route across Beringia and inland, and a route along the Pacific coast', w: ['A route across the Atlantic from Europe, and one from Africa', 'A route through Greenland, and one through Mexico', 'Only a route across the Atlantic ice'], why: 'Both routes start in northeast Asia: inland through a gap between melting ice sheets, or south along the Pacific shore.' },
    { L: [2, 3], q: 'The earliest date and the route of the first Americans are fully settled.', tf: false, why: 'False. Scientists agree on northeast Asia and on "at least 15,000 years ago," but debate the earliest date and the routes as new sites are dated.' },
    { L: [2, 3], q: 'Why is the coastal route hard to prove?', a: 'The Ice Age coastline is now under the sea, so most sites would be drowned.', w: ['No one could have used boats then.', 'The coast was covered by ice all year.', 'Native peoples never lived near the ocean.'], why: 'As the ice melted the sea rose, covering the old shoreline. Missing evidence there is weak evidence.' },
    { L: [3], q: 'About the first peoples of the Americas:', all: [['They came from northeast Asia.', true], ['Sea levels were lower during the Ice Age.', true], ['Footprints at White Sands, New Mexico, may be 21,000 to 23,000 years old, a date some scientists still question.', true], ['They arrived about 1,000 years ago.', false], ['All scientists agree on one route.', false]], why: 'Origin in northeast Asia and low Ice Age seas are agreed; early dates such as White Sands and the routes are debated; people came many thousands of years ago.' },
    { L: [3], q: 'The Clovis culture, known for its spear points, dates to about 13,000 years ago. Older sites such as Monte Verde show that…', a: 'Clovis people were not the first Americans', w: ['Clovis people came from Europe', 'people arrived only after Clovis', 'Monte Verde was a Clovis town'], why: 'Sites older than Clovis, such as Monte Verde, overturned the older view that Clovis people were first.' }
  ], 'Think about the Ice Age and the land bridge.'));

  var REGION = ['Southwest', 'Great Plains', 'Pacific Northwest', 'Eastern Woodlands'];
  var WAYS = [
    ['Irrigation canals dug to water maize fields in the desert', 0], ['Multistory towns of adobe and stone', 0], ['Farming with very little rain, using river water', 0],
    ['Bison hunted on foot, with dogs pulling loads on a travois', 1], ['Earth-lodge farming villages along the Missouri River', 1], ['Grasslands with huge herds of bison', 1],
    ['Salmon caught and dried for the winter', 2], ['Cedar plank houses and large dugout canoes', 2], ['Gift-giving feasts called potlatches', 2],
    ['Maize, beans and squash (the "Three Sisters") planted together', 3], ['Longhouses or wigwams in forest villages', 3], ['Hunting deer and farming in forest clearings', 3]
  ];
  G('ush1.native-cultures-1491', bank([
    { L: [1, 2, 3], gen: function (R) { var w = R.pick(WAYS); return { q: 'In which region of North America would you have found this in 1491?<br><b>' + w[0] + '</b>', a: REGION[w[1]], w: REGION.filter(function (x, i) { return i !== w[1]; }), why: w[0] + ': the ' + REGION[w[1]] + '.' }; } },
    { L: [1, 2], q: 'In 1491, how did Plains peoples hunt bison?', a: 'On foot', w: ['On horseback', 'With guns', 'From wagons'], why: 'There were no horses in the Americas in 1491. The Spanish brought them; Plains horse cultures grew in the 1700s.' },
    { L: [2, 3], q: 'Plains peoples rode horses to hunt bison long before Columbus arrived.', tf: false, why: 'False. Horses came with the Spanish and spread north after the Pueblo Revolt of 1680; before that, Plains peoples hunted on foot.' },
    { L: [2, 3], q: 'Why did farmers in the Eastern Woodlands plant maize, beans and squash together?', a: 'Each helps the others: corn holds up the beans, beans enrich the soil, squash shades out weeds.', w: ['The Spanish required it.', 'Planting them together kept bison away.', 'They were the only plants that grew in the forest.'], why: 'The Three Sisters support each other: stalks for the beans to climb, nitrogen from the beans, and ground cover from the squash.' },
    { L: [2, 3], q: 'Why did peoples of the Pacific Northwest farm less than peoples of the Southwest?', a: 'Plentiful salmon, shellfish and forest foods gave them a rich food supply without much farming.', w: ['The Northwest had no rivers.', 'They had no tools.', 'Farming was forbidden by the Spanish.'], why: 'Each people adapted to its land: the Northwest coast was rich in fish and forest foods, while the dry Southwest needed irrigated farming.' },
    { L: [2, 3], q: 'Which people dug irrigation canals from the Salt and Gila Rivers in what is now Arizona?', a: 'The Hohokam', w: ['The Haudenosaunee', 'The Mandan', 'The Tlingit'], why: 'The Hohokam built hundreds of miles of canals in the desert to water their fields.' },
    { L: [3], q: 'About Native North America in 1491:', all: [['Many separate nations spoke hundreds of languages.', true], ['Ways of life fit the land and climate of each region.', true], ['Plains peoples hunted bison on horseback.', false], ['All Native peoples lived the same way.', false]], why: 'North America held many nations with different ways of life; horses came only after contact.' }
  ], 'Think about what each region\'s land and climate offered.'));

  G('ush1.native-societies', bank([
    {"L":[1,2,3],"q":"Which culture built the great earthen mounds at Cahokia?","a":"the Mississippian culture","w":["the Ancestral Puebloans","the Aztecs","the Inca","the Haudenosaunee"],"why":"Cahokia was the largest city of the Mississippian culture."},
    {"L":[1,2],"q":"The cliff dwellings of Mesa Verde are in which present-day state?","a":"Colorado","w":["New Mexico","Ohio","Illinois","Georgia"],"why":"Mesa Verde is in southwestern Colorado."},
    {"L":[1,2],"q":"Chaco Canyon, with its great houses, is in which present-day state?","a":"New Mexico","w":["Colorado","Ohio","Illinois","Georgia"],"why":"Chaco Canyon is in northwestern New Mexico."},
    {"L":[1,2,3],"q":"How many nations first formed the Haudenosaunee (Iroquois) Confederacy?","a":"five","w":["two","three","ten","twelve"],"why":"Five nations: the Mohawk, Oneida, Onondaga, Cayuga and Seneca."},
    {"L":[1,2,3],"q":"Which crops, called the \"Three Sisters,\" did many Eastern peoples grow together?","a":"corn, beans and squash","w":["wheat, rice and barley","potatoes, cotton and tobacco","apples, oats and rye"],"why":"Corn, beans and squash grown together helped each other and fed many people."},
    {"L":[2,3],"q":"Which nation joined the Haudenosaunee Confederacy in the 1700s as the sixth nation?","a":"the Tuscarora","w":["the Cherokee","the Lakota","the Wampanoag","the Powhatan"],"why":"The Tuscarora joined in the 1720s."},
    { L: [1, 2], q: 'Cahokia, the largest city of the Mississippian culture, stood near which present-day city?', a: 'St. Louis', w: ['Boston', 'Santa Fe', 'Seattle', 'Miami'], why: 'Cahokia lay in the Mississippi River valley, across the river from present-day St. Louis.' },
    { L: [2, 3], gen: function (R) { return mapPick(R, R.pick(['cahokia', 'mesaverde']), ['cahokia', 'mesaverde', 'staugustine', 'plymouth', 'santafe', 'jamestown'], { cahokia: 'Cahokia, the Mississippian city across the Mississippi from present-day St. Louis', mesaverde: 'Mesa Verde, the Ancestral Puebloan cliff dwellings in southwestern Colorado' }); } },
    { L: [1, 2], q: 'Who built the cliff dwellings at Mesa Verde and the great houses at Chaco Canyon?', a: 'The Ancestral Puebloans', w: ['The Haudenosaunee', 'The Spanish', 'The Mississippians of Cahokia'], why: 'The Ancestral Puebloans of the Four Corners region built them; today\'s Pueblo peoples are their descendants.' },
    { L: [1, 2, 3], q: 'The Haudenosaunee (Iroquois) Confederacy united nations under what?', a: 'The Great Law of Peace and a shared council', w: ['A written constitution signed in 1787', 'The rule of the Spanish king', 'A single emperor in a capital city'], why: 'The Great Law of Peace, kept in memory and recorded with wampum, set up a Grand Council of chiefs from the member nations.' },
    { L: [2, 3], q: 'Which nation was <b>not</b> one of the original Five Nations of the Haudenosaunee?', a: 'Tuscarora', w: ['Mohawk', 'Oneida', 'Onondaga', 'Cayuga', 'Seneca'], why: 'The original five were the Mohawk, Oneida, Onondaga, Cayuga and Seneca. The Tuscarora joined about 1722, making the Six Nations.' },
    { L: [2, 3], q: 'About how many people may have lived at Cahokia at its height, around 1100?', a: '10,000 to 20,000', w: ['About 100', 'About 500', 'About 1 million'], why: 'Estimates for Cahokia around 1100 run from about 10,000 to 20,000 people, larger than many European towns of the time.' },
    { L: [2, 3], gen: function (R) { return orderQ(R, [['Chaco Canyon great houses at their height', 1050, 'about 850 to 1150'], ['Cahokia at its height', 1100, 'about 1100'], ['Cliff dwellings built at Mesa Verde', 1235, 'about 1190 to 1280'], ['Columbus reaches the Caribbean', 1492], ['The Tuscarora join the Haudenosaunee', 1722, 'about 1722']], R.chance(0.5) ? 3 : 4); } },
    { L: [2, 3], q: 'Large towns and organized governments existed in North America only after Europeans arrived.', tf: false, why: 'False. Cahokia was a large city by about 1100, and the Haudenosaunee had a confederacy with a council long before Europeans came.' },
    { L: [3], q: 'When was the Haudenosaunee Confederacy founded?', a: 'The date is debated; proposals range from about 1142 to the 1400s.', w: ['Exactly 1607, when Jamestown was founded', 'Exactly 1776, with the Declaration', 'After the American Revolution'], why: 'The founding is preserved in oral tradition; scholars propose dates from about 1142 to the mid-1400s, and the tradition places it long before contact.' },
    { L: [3], q: 'How much did the Haudenosaunee Confederacy influence the U.S. Constitution?', a: 'Historians debate it; a 1988 congressional resolution praised the influence, while some historians think it was small.', w: ['The framers copied its law word for word.', 'It had no possible connection; the framers never met Haudenosaunee leaders.', 'The Constitution created the Confederacy.'], why: 'This is a debated question: some historians argue for a large influence, others that the framers drew mostly on English and colonial models.' }
  ], 'Remember Cahokia, the Ancestral Puebloans and the Haudenosaunee.'));

  G('ush1.european-exploration', bank([
    { L: [1, 2], q: 'What was Columbus trying to reach when he sailed west in 1492?', a: 'Asia (the Indies)', w: ['North America', 'Antarctica', 'Australia', 'West Africa'], why: 'Columbus wanted a western sea route to Asia. He died believing he had reached Asian islands.' },
    { L: [1, 2], gen: function (R, lv) { return lv === 1 ? { q: 'In what year did Columbus first reach the Caribbean?', a: '1492', w: ['1607', '1776', '1066'], why: 'Columbus landed in the Bahamas on October 12, 1492.' } : yearQ(R, lv, 'In what year did Columbus first reach the Caribbean?', 1492, 'Columbus landed in the Bahamas on October 12, 1492.', [2, 4, 8, 10, 20]); } },
    { L: [1, 2], q: 'Which country paid for Columbus\'s first voyage?', a: 'Spain', w: ['Portugal', 'England', 'France', 'The Netherlands'], why: 'King Ferdinand and Queen Isabella of Spain sponsored the voyage.' },
    { L: [1, 2, 3], q: 'What did the Treaty of Tordesillas (1494) do?', a: 'It divided the lands outside Europe between Spain and Portugal along a line in the Atlantic.', w: ['It ended a war between England and France.', 'It gave North America to England.', 'It made peace between Spain and the Aztecs.'], why: 'The treaty set a line 370 leagues west of the Cape Verde Islands: Spain to the west, Portugal to the east.' },
    { L: [2, 3], q: 'Because of the Treaty of Tordesillas line, which part of South America became Portuguese?', a: 'Brazil', w: ['Peru', 'Mexico', 'Argentina'], why: 'The eastern bulge of South America lay east of the line, and Cabral claimed it for Portugal in 1500.' },
    { L: [2, 3], gen: function (R) { var m = [['To reach Asian trade by sea and cut out middlemen', 'Wealth'], ['To convert people to Christianity', 'Religion'], ['To win fame and power for their kings and queens', 'Glory'], ['To find gold and silver', 'Wealth']]; var x = R.pick(m); return { q: 'Historians sum up Europe\'s motives as "God, gold and glory." Which one does this motive belong to?<br><b>' + x[0] + '</b>', a: x[1], w: ['Wealth', 'Religion', 'Glory'].filter(function (y) { return y !== x[1]; }), why: x[0] + ': ' + x[1].toLowerCase() + ' ("' + ({ Wealth: 'gold', Religion: 'God', Glory: 'glory' })[x[1]] + '").' }; } },
    { L: [2, 3], q: 'Columbus set out to find two new continents unknown to Europe.', tf: false, why: 'False. He was trying to reach Asia by sailing west, and believed to the end that he had.' },
    { L: [2, 3], q: 'Which Portuguese explorer was the first European to round the Cape of Good Hope, in 1488?', a: 'Bartolomeu Dias', w: ['Vasco da Gama', 'Christopher Columbus', 'Hernán Cortés'], why: 'Dias rounded the southern tip of Africa in 1488; da Gama reached India by that route in 1498.' },
    { L: [2, 3], gen: function (R) { return orderQ(R, [['Dias rounds the Cape of Good Hope', 1488], ['Columbus reaches the Caribbean', 1492], ['Treaty of Tordesillas', 1494], ['Da Gama reaches India by sea', 1498], ['Cabral reaches Brazil', 1500], ['Columbus dies, still believing he reached Asia', 1506]], R.chance(0.5) ? 3 : 4); } },
    { L: [3], q: 'About European exploration in the late 1400s:', all: [['New ships such as the caravel made long voyages possible.', true], ['Portugal sought a sea route to Asia around Africa.', true], ['Columbus called the island people "Indians" because he thought he was in the Indies.', true], ['Columbus knew he had reached a new continent.', false]], why: 'Technology, the search for Asian trade and royal competition drove exploration; Columbus believed he was near Asia.' }
  ], 'Think about trade routes to Asia.'));

  var TO_EUR = ['Potatoes', 'Maize (corn)', 'Tomatoes', 'Cacao (chocolate)', 'Tobacco', 'Chili peppers', 'Turkeys'];
  var TO_AM = ['Horses', 'Cattle', 'Pigs', 'Wheat', 'Sugarcane', 'Smallpox', 'Measles', 'Sheep'];
  G('ush1.columbian-exchange', bank([
    { L: [1, 2, 3], gen: function (R) { var e = R.coin(), x = R.pick(e ? TO_EUR : TO_AM); return { q: 'In the Columbian Exchange, which way did <b>' + x.toLowerCase() + '</b> travel?', a: e ? 'From the Americas to Europe, Africa and Asia' : 'From Europe, Africa and Asia to the Americas', w: [e ? 'From Europe, Africa and Asia to the Americas' : 'From the Americas to Europe, Africa and Asia'], why: x + (e ? ' came from the Americas and spread around the world after 1492.' : ' crossed from the Eastern Hemisphere to the Americas after 1492.') }; } },
    { L: [2, 3], gen: function (R) { var x = R.pick(TO_EUR); return { q: 'Which of these first came <b>from the Americas</b> to the rest of the world?', a: x, w: R.sample(TO_AM, 3), why: x + ' came from the Americas; the others crossed to the Americas from Europe, Africa or Asia.' }; } },
    { L: [2, 3], gen: function (R) { var x = R.pick(TO_AM); return { q: 'Which of these first came <b>to the Americas</b> from Europe, Africa or Asia?', a: x, w: R.sample(TO_EUR, 3), why: x + ' came to the Americas after 1492; the others went from the Americas to the rest of the world.' }; } },
    { L: [1, 2], q: 'What was the main cause of the collapse of Native populations after 1492?', a: 'Diseases such as smallpox, to which they had no immunity', w: ['Battles with Spanish soldiers alone', 'Earthquakes', 'Moving to Europe'], why: 'Epidemic disease killed most of those who died, made worse by war, forced labor and hunger.' },
    { L: [2, 3], q: 'The Columbian Exchange went only one way, from Europe to the Americas.', tf: false, why: 'False. Crops such as maize, potatoes and tomatoes from the Americas changed diets worldwide.' },
    { L: [2, 3], q: 'Who coined the term "Columbian Exchange," in a 1972 book?', a: 'Alfred Crosby', w: ['Christopher Columbus', 'Bartolomé de las Casas', 'Thomas Paine'], why: 'The historian Alfred Crosby named it in The Columbian Exchange (1972).' },
    { L: [2, 3], q: 'How did sugarcane brought to the Caribbean and Brazil help expand the Atlantic slave trade?', a: 'Sugar plantations demanded huge amounts of labor, and planters bought enslaved Africans to do it.', w: ['Sugar was traded for enslaved people in Europe.', 'Sugarcane grew only in Africa.', 'It did not affect the slave trade.'], why: 'Sugar plantations needed heavy labor; with Native populations collapsing, planters turned to enslaved Africans.' },
    { L: [3], q: 'Estimates of the share of Native people who died in the first century after contact range from about…', a: 'one half to about 90 percent', w: ['1 to 2 percent', 'about 10 percent', 'none: populations grew'], why: 'Estimates vary widely, from about half to about 90 percent in many regions, but all show a catastrophic collapse.' },
    { L: [3], q: 'About the Columbian Exchange:', all: [['Horses returned to the Americas with the Spanish.', true], ['The potato became an important food in Europe.', true], ['Smallpox traveled from the Americas to Europe.', false], ['Millions of Africans were carried to the Americas.', true]], why: 'Horses and smallpox came to the Americas; potatoes went to Europe; and the slave trade carried millions of Africans across the Atlantic.' }
  ], 'Which hemisphere did it come from?'));

  G('ush1.spanish-empire', bank([
    {"L":[1,2,3],"q":"In what year did Columbus first reach the Caribbean?","a":"1492","w":["1452","1513","1565","1607"],"why":"Columbus landed in the Bahamas in October 1492."},
    {"L":[1,2,3],"q":"Who claimed Florida for Spain in 1513?","a":"Juan Ponce de León","w":["Hernán Cortés","Francisco Pizarro","Hernando de Soto","Francisco Vásquez de Coronado"],"why":"Ponce de León reached and named Florida in 1513."},
    {"L":[1,2,3],"q":"Which Spanish explorer searched the Southwest for cities of gold from 1540 to 1542?","a":"Francisco Vásquez de Coronado","w":["Juan Ponce de León","Hernán Cortés","Francisco Pizarro","Bartolomé de las Casas"],"why":"Coronado led an expedition across the Southwest and the Great Plains."},
    {"L":[1,2,3],"q":"Which Spanish priest spoke out against cruelty to Native people?","a":"Bartolomé de las Casas","w":["Hernán Cortés","Francisco Pizarro","Juan Ponce de León"],"why":"Las Casas wrote about the abuses he saw in the Caribbean."},
    {"L":[1,2],"q":"What were Spanish missions?","a":"Religious settlements meant to convert Native people to Catholicism","w":["Forts built to keep the English out of Canada","Trading posts for fur","Schools for Spanish soldiers"],"why":"Missions spread across Florida, Texas, New Mexico and California."},
    {"L":[2,3],"q":"In what year was St. Augustine, Florida, founded?","a":"1565","w":["1492","1607","1620","1513"],"why":"Pedro Menéndez de Avilés founded St. Augustine in 1565."},
    {"L":[2,3],"q":"Which city in New Mexico, founded about 1610, is the oldest state capital in the United States?","a":"Santa Fe","w":["San Antonio","Los Angeles","St. Augustine","Tucson"],"why":"Santa Fe became the capital of Spanish New Mexico around 1610."},
    { L: [1, 2], q: 'Who led the Spanish conquest of the Aztec Empire?', a: 'Hernán Cortés', w: ['Francisco Pizarro', 'Christopher Columbus', 'John Smith', 'Juan de Oñate'], why: 'Cortés, with tens of thousands of Native allies, took the Aztec capital Tenochtitlan in 1521.' },
    { L: [1, 2], q: 'Who led the Spanish conquest of the Inca Empire?', a: 'Francisco Pizarro', w: ['Hernán Cortés', 'Bartolomé de las Casas', 'Pedro Menéndez de Avilés'], why: 'Pizarro captured the Inca ruler Atahualpa at Cajamarca in 1532.' },
    { L: [1, 2, 3], q: 'What was the oldest continuously occupied European-founded city in what is now the United States, founded by Spain in 1565?', a: 'St. Augustine, Florida', w: ['Jamestown, Virginia', 'Plymouth, Massachusetts', 'Santa Fe, New Mexico', 'New Amsterdam'], why: 'Pedro Menéndez de Avilés founded St. Augustine on September 8, 1565.' },
    { L: [2, 3], gen: function (R) { return mapPick(R, R.pick(['staugustine', 'santafe']), ['staugustine', 'santafe', 'jamestown', 'plymouth', 'cahokia', 'boston'], { staugustine: 'St. Augustine, on the Atlantic coast of Florida (1565)', santafe: 'Santa Fe, in New Mexico (1610)' }); } },
    { L: [1, 2], q: 'What was the encomienda?', a: 'A grant giving a colonist the labor and tribute of a group of Native people', w: ['A Spanish warship', 'A treaty with the Aztecs', 'A Native city in Mexico'], why: 'In exchange for "protection" and Christian teaching, the colonist could demand labor and tribute, which led to great abuse.' },
    { L: [2, 3], q: 'Which factors helped a small Spanish force conquer the Aztec capital in 1521?', all: [['Tens of thousands of Native allies such as the Tlaxcalans', true], ['A smallpox epidemic in 1520', true], ['Steel weapons, horses and guns', true], ['An Aztec army that had never fought a war', false]], why: 'Native allies, disease and Spanish weapons all mattered; the Aztecs were experienced warriors.' },
    { L: [2, 3], q: 'The Spanish conquered the Aztec and Inca empires with their own soldiers alone.', tf: false, why: 'False. Native allies, epidemics and divisions within the Aztec and Inca states were decisive.' },
    { L: [2, 3], q: 'Which priest spent decades protesting Spanish abuse of Native peoples and debated Sepúlveda at Valladolid (1550 to 1551)?', a: 'Bartolomé de las Casas', w: ['Hernán Cortés', 'Juan de Oñate', 'Francisco Pizarro'], why: 'Las Casas argued that Native peoples were fully rational people with rights.' },
    { L: [2, 3], q: 'What did Spain\'s New Laws of 1542 try to do?', a: 'Ban new encomiendas and the enslavement of Native people', w: ['Give all land in the Americas to Portugal', 'Start the Atlantic slave trade', 'Found Jamestown'], why: 'The New Laws limited the encomienda and banned Native slavery, though colonists resisted and abuses continued.' },
    { L: [2, 3], q: 'The Inca Empire was weakened just before Pizarro arrived by…', a: 'a civil war between the brothers Atahualpa and Huáscar', w: ['an invasion by the Aztecs', 'a war with Portugal', 'the Treaty of Tordesillas'], why: 'The civil war split the empire, and epidemics had already struck.' },
    { L: [2, 3], gen: function (R) { return orderQ(R, [['Columbus reaches the Caribbean', 1492], ['Tenochtitlan falls to Cortés and his allies', 1521], ['Pizarro captures Atahualpa', 1532], ['The New Laws limit the encomienda', 1542], ['St. Augustine founded', 1565], ['Oñate leads settlers into New Mexico', 1598], ['Santa Fe founded', 1610]], R.chance(0.5) ? 3 : 4); } }
  ], 'Think about allies, disease and division.'));
  /* ===================================================================== Unit 3: Colonial America */
  G('ush1.jamestown-virginia', bank([
    { L: [1, 2], gen: function (R, lv) { return lv === 1 ? { q: 'In what year was Jamestown, the first lasting English colony, founded?', a: '1607', w: ['1492', '1620', '1776'], why: 'Jamestown was founded in May 1607 on the James River in Virginia.' } : yearQ(R, lv, 'In what year was Jamestown founded?', 1607, 'Jamestown was founded in May 1607.', [1, 3, 5, 13]); } },
    { L: [1, 2], q: 'Which crop made Virginia profitable?', a: 'Tobacco', w: ['Cotton', 'Wheat', 'Rice', 'Sugarcane'], why: 'John Rolfe began growing a sweet tobacco about 1612; it sold well in England and made the colony last.' },
    { L: [1, 2, 3], q: 'What was the House of Burgesses, which first met in 1619?', a: 'The first elected assembly in English America', w: ['The governor\'s mansion', 'A fort built against the Spanish', 'A church court that tried dissenters'], why: 'The House of Burgesses, Virginia\'s elected assembly, first met at Jamestown on July 30, 1619.' },
    { L: [2, 3], q: 'Under Virginia\'s headright system, what did a person get for paying another person\'s passage to the colony?', a: '50 acres of land', w: ['A seat in the House of Burgesses', 'Freedom from taxes for life', 'An enslaved worker'], why: 'Each "head" brought over earned 50 acres, which drew thousands of indentured servants to Virginia.' },
    { L: [2, 3], q: 'What happened during the "starving time" of 1609 to 1610?', a: 'Most colonists died; only about 60 of some 500 survived the winter.', w: ['The colony grew rich on tobacco.', 'The House of Burgesses first met.', 'Jamestown was burned by Bacon\'s army.'], why: 'Hunger and disease nearly ended Jamestown; the survivors were about to leave when new supplies arrived in 1610.' },
    { L: [2, 3], q: 'Jamestown thrived from its first year.', tf: false, why: 'False. Most early settlers died of disease and hunger; tobacco, headrights and new settlers made it last.' },
    { L: [2, 3], q: 'Which two events both happened in Virginia in 1619?', a: 'The House of Burgesses first met, and the first recorded Africans arrived.', w: ['Jamestown was founded, and the Mayflower Compact was signed.', 'Tobacco was banned, and Virginia became a royal colony.', 'Bacon\'s Rebellion began, and Jamestown burned.'], why: 'In 1619 Virginia\'s assembly first met (July) and "20 and odd" captured Africans were brought to Point Comfort (August).' },
    { L: [2, 3], gen: function (R) { return orderQ(R, [['Jamestown founded', 1607], ['The starving time', 1609, '1609 to 1610'], ['Rolfe begins growing tobacco', 1612, 'about 1612'], ['House of Burgesses first meets', 1619], ['Powhatan attack under Opechancanough', 1622], ['Virginia becomes a royal colony', 1624]], R.chance(0.5) ? 3 : 4); } },
    { L: [3], q: 'About early Virginia:', all: [['It was founded by the Virginia Company of London, a joint-stock company.', true], ['It depended at first on corn traded from the Powhatan peoples.', true], ['Its settlers came mainly for religious freedom.', false], ['It became a royal colony in 1624.', true]], why: 'Investors sought profit; the colony traded with and fought the Powhatan; the king took it over in 1624. Religious freedom drew the Pilgrims to New England, not the Jamestown settlers.' }
  ], 'Think about tobacco and the year 1619.'));

  G('ush1.new-england', bank([
    { L: [1, 2], q: 'What did the Mayflower Compact (1620) do?', a: 'The signers agreed to form a government and obey its laws.', w: ['It declared independence from England.', 'It made peace with the Spanish.', 'It set up the House of Burgesses.'], why: 'Landing outside their charter\'s area, the Pilgrim men agreed to "combine ourselves together into a civil Body Politick" and obey its laws.' },
    { L: [1, 2], q: 'Who founded Plymouth colony in 1620?', a: 'The Pilgrims', w: ['The Puritans of Massachusetts Bay', 'The Quakers', 'The Dutch'], why: 'The Pilgrims, Separatists from the Church of England, sailed on the Mayflower and founded Plymouth.' },
    { L: [1, 2, 3], q: 'Who founded Rhode Island in 1636 after being banished from Massachusetts?', a: 'Roger Williams', w: ['John Winthrop', 'William Penn', 'John Smith', 'Anne Hutchinson'], why: 'Roger Williams was banished in 1635 and founded Providence in 1636, where no one was punished for religion.' },
    { L: [2, 3], q: 'Which Wampanoag leader made an alliance with the Pilgrims in 1621?', a: 'Massasoit (Ousamequin)', w: ['Metacom', 'Opechancanough', 'Popé'], why: 'Massasoit\'s alliance with Plymouth lasted for decades; Metacom, his son, later led King Philip\'s War.' },
    { L: [2, 3], q: 'The Puritans founded Massachusetts Bay to give religious freedom to people of every faith.', tf: false, why: 'False. They sought freedom for their own faith and expected others in the colony to conform; dissenters were banished.' },
    { L: [2, 3], q: 'John Winthrop told the Massachusetts Bay colonists in 1630 that they would be "as a city upon a hill." What did he mean?', a: 'The colony would be an example watched by the world.', w: ['The colony should be built on high ground for defense.', 'The colonists should break away from England.', 'The colony would trade with every nation.'], why: 'Winthrop meant that "the eyes of all people are upon us," so the colony must live up to its covenant.' },
    { L: [2, 3], q: 'Why was Anne Hutchinson banished from Massachusetts Bay?', a: 'She held meetings that questioned the colony\'s ministers.', w: ['She refused to pay the Stamp Act.', 'She founded a Catholic church.', 'She sided with the Dutch in New Amsterdam.'], why: 'She was tried in 1637 and banished in 1638 for challenging the ministers\' teaching; she moved to Rhode Island.' },
    { L: [2, 3], gen: function (R) { return orderQ(R, [['Pilgrims sign the Mayflower Compact', 1620], ['Puritans found Massachusetts Bay', 1630], ['Roger Williams founds Providence', 1636], ['Connecticut adopts the Fundamental Orders', 1639], ['Massachusetts requires towns to keep schools', 1647], ['King Philip\'s War begins', 1675]], R.chance(0.5) ? 3 : 4); } },
    { L: [3], q: 'About New England in the 1600s:', all: [['Town meetings ran local affairs.', true], ['About half the Pilgrims died their first winter.', true], ['The Great Migration of the 1630s brought about 20,000 Puritans, mostly in families.', true], ['Its economy was built on large rice plantations.', false]], why: 'New England had towns, families and small farms; rice plantations were in South Carolina.' }
  ], 'Pilgrims 1620, Puritans 1630.'));

  G('ush1.middle-colonies', bank([
    { L: [1, 2], q: 'Which colony began as the Dutch colony of New Netherland?', a: 'New York', w: ['Pennsylvania', 'Virginia', 'Georgia', 'Massachusetts'], why: 'New Netherland, with its town of New Amsterdam on Manhattan, became English New York in 1664.' },
    { L: [1, 2], q: 'Who founded Pennsylvania in 1681?', a: 'William Penn, a Quaker', w: ['John Winthrop, a Puritan', 'Lord Baltimore, a Catholic', 'James Oglethorpe'], why: 'King Charles II granted the land to William Penn, who made it a refuge for Quakers and others.' },
    { L: [1, 2, 3], q: 'Which region was the most diverse in its peoples and faiths?', a: 'The Middle colonies', w: ['New England', 'The Southern colonies', 'They were all alike'], why: 'The Middle colonies mixed Dutch, English, German, Scots-Irish and others, with many faiths side by side.' },
    { L: [2, 3], q: 'How did England gain New Netherland in 1664?', a: 'English warships arrived and the Dutch governor surrendered without a battle.', w: ['England bought it for 60 guilders.', 'The Lenape gave it to England.', 'It was traded for Pennsylvania.'], why: 'During a war with the Netherlands, an English fleet arrived and Peter Stuyvesant surrendered; the Dutch settlers stayed.' },
    { L: [2, 3], q: 'Why were the Middle colonies called the "breadbasket" colonies?', a: 'Their fertile land grew large wheat and grain harvests for export.', w: ['They grew most of the colonies\' tobacco.', 'They had the largest bakeries in the world.', 'They imported all their bread from England.'], why: 'Fertile valleys and a mild climate grew wheat that was shipped from ports such as Philadelphia and New York.' },
    { L: [2, 3], q: 'Why did the king grant Pennsylvania to William Penn?', a: 'To repay a debt the crown owed to Penn\'s late father', w: ['As a reward for defeating the Dutch', 'Because Penn was the king\'s son', 'To create a colony for Catholics'], why: 'The grant paid off a large royal debt to Admiral Sir William Penn.' },
    { L: [2, 3], q: 'All thirteen colonies were founded by England from the start.', tf: false, why: 'False. New York began as Dutch New Netherland, and Delaware as New Sweden.' },
    { L: [3], gen: function (R) { var C = [['New York', 'Began as Dutch New Netherland; English from 1664'], ['Pennsylvania', 'Founded by the Quaker William Penn in 1681'], ['Delaware', 'First settled as New Sweden in 1638'], ['New Jersey', 'Split off from the Duke of York\'s grant in 1664']]; var c = R.pick(C); return { q: 'Which Middle colony is this?<br><b>' + c[1] + '</b>', a: c[0], w: C.filter(function (x) { return x !== c; }).map(function (x) { return x[0]; }), why: c[1] + ': ' + c[0] + '.' }; } },
    { L: [3], q: 'About Pennsylvania:', all: [['Penn promised freedom of worship to those who believed in God.', true], ['Penn made treaties with the Lenape to buy land.', true], ['The Walking Purchase of 1737 cheated the Lenape of land.', true], ['Only Quakers were allowed to settle there.', false]], why: 'Penn welcomed many faiths; his early treaties were followed by later deals, like the Walking Purchase, that cheated the Lenape.' }
  ], 'Think Dutch New York and Quaker Pennsylvania.'));

  G('ush1.southern-colonies', bank([
    {"L":[1,2,3],"q":"What was the first permanent English settlement in North America, founded in 1607?","a":"Jamestown","w":["Plymouth","St. Augustine","Roanoke","Boston"],"why":"Jamestown, Virginia, was founded in 1607."},
    {"L":[1,2,3],"q":"Which crop became Virginia's great cash crop in the 1600s?","a":"tobacco","w":["cotton","rice","wheat","sugar"],"why":"John Rolfe grew a sweeter tobacco, and it became Virginia's chief export."},
    {"L":[1,2,3],"q":"Who founded the colony of Georgia?","a":"James Oglethorpe","w":["Lord Baltimore","William Penn","John Smith","Roger Williams"],"why":"Oglethorpe and his fellow trustees founded Georgia in 1732–1733."},
    {"L":[1,2,3],"q":"Who founded Maryland as a refuge for Catholics?","a":"Lord Baltimore (the Calvert family)","w":["William Penn","James Oglethorpe","Roger Williams","John Winthrop"],"why":"Cecil Calvert, Lord Baltimore, received the charter for Maryland."},
    {"L":[1,2,3],"q":"What was Virginia's House of Burgesses, first held in 1619?","a":"the first elected assembly in the English colonies","w":["a court for trying pirates","a church council","the royal governor's mansion"],"why":"Its members were elected by the colonists."},
    {"L":[1,2,3],"q":"What were indentured servants?","a":"Workers who agreed to labor for a set number of years in return for passage to America","w":["Enslaved people held for life","Royal officials sent from London","Soldiers paid by the colony"],"why":"Many early Virginia colonists came as indentured servants."},
    {"L":[2,3],"q":"Which city was the main port of colonial South Carolina?","a":"Charles Town (Charleston)","w":["Savannah","Baltimore","Jamestown","Philadelphia"],"why":"Charles Town shipped the colony's rice and indigo."},
    { L: [1, 2], q: 'Which colony was founded in 1634 as a refuge for English Catholics?', a: 'Maryland', w: ['Pennsylvania', 'Georgia', 'Rhode Island', 'Virginia'], why: 'The Calvert family (Lords Baltimore) founded Maryland as a haven for Catholics.' },
    { L: [1, 2], q: 'Which was the last of the thirteen colonies, chartered in 1732?', a: 'Georgia', w: ['Pennsylvania', 'Maryland', 'North Carolina', 'New York'], why: 'Georgia was chartered in 1732 for trustees led by James Oglethorpe; Savannah was founded in 1733.' },
    { L: [1, 2, 3], q: 'Which two crops made South Carolina\'s planters rich?', a: 'Rice and indigo', w: ['Wheat and corn', 'Cotton and tobacco', 'Sugar and coffee'], why: 'Rice, and indigo for blue dye, grew on lowcountry plantations worked by enslaved Africans.' },
    { L: [2, 3], q: 'Why was Georgia founded?', a: 'As a buffer against Spanish Florida and a fresh start for poor English families', w: ['As a refuge for Quakers', 'To grow wheat for England', 'As a Dutch trading post'], why: 'Oglethorpe and the trustees wanted to protect South Carolina from Spanish Florida and give the poor a new start.' },
    { L: [2, 3], q: 'Most white Southerners in the 1700s owned large plantations.', tf: false, why: 'False. Most were small farmers; a wealthy few owned large plantations and most of the enslaved people.' },
    { L: [2, 3], q: 'What did Maryland\'s Toleration Act of 1649 do?', a: 'It protected freedom of worship for Christians who believed in the Trinity.', w: ['It banned all religion.', 'It made Catholicism the only legal faith.', 'It ended slavery in Maryland.'], why: 'With Protestants outnumbering Catholics, the assembly protected Trinitarian Christians\' worship.' },
    { L: [2, 3], q: 'Where did many of the first settlers of Charles Town (1670) come from, bringing its slave laws with them?', a: 'Barbados, an English sugar island', w: ['Massachusetts', 'New Netherland', 'Spanish Florida'], why: 'Planters from Barbados brought the plantation system and its slave laws to Carolina.' },
    { L: [3], q: 'Georgia\'s trustees at first banned slavery, and the ban ended in 1751.', tf: true, why: 'True. Settlers pressed for slavery; after the ban ended, rice plantations spread.' },
    { L: [3], gen: function (R) { return orderQ(R, [['Maryland settled', 1634], ['Maryland Toleration Act', 1649], ['Carolina charter granted', 1663], ['Charles Town founded', 1670], ['Georgia chartered', 1732], ['Georgia lifts its ban on slavery', 1751]], R.chance(0.5) ? 4 : 5); } }
  ], 'Think about cash crops and why each colony began.'));

  var REGIONS3 = ['New England', 'Middle colonies', 'Southern colonies'];
  var TRAITS = [['Rocky soil and short summers', 0], ['Fishing and shipbuilding', 0], ['Town meetings', 0], ['Mostly English Puritan families', 0],
    ['Wheat shipped from busy ports', 1], ['The most diverse peoples and faiths', 1], ['Fertile valleys and a mild climate', 1], ['Quakers, Lutherans and Presbyterians as neighbors', 1],
    ['Long growing season and rich coastal lowlands', 2], ['Tobacco, rice and indigo plantations', 2], ['Few towns; spread-out farms and plantations', 2], ['Most of the colonies\' enslaved people', 2]];
  var COL = [['Massachusetts', 0], ['Connecticut', 0], ['Rhode Island', 0], ['New Hampshire', 0], ['New York', 1], ['New Jersey', 1], ['Pennsylvania', 1], ['Delaware', 1], ['Maryland', 2], ['Virginia', 2], ['North Carolina', 2], ['South Carolina', 2], ['Georgia', 2]];
  G('ush1.comparing-regions', bank([
    { L: [1, 2, 3], gen: function (R) { var t = R.pick(TRAITS); return { q: 'Which colonial region does this describe?<br><b>' + t[0] + '</b>', a: REGIONS3[t[1]], w: REGIONS3.filter(function (x, i) { return i !== t[1]; }), why: t[0] + ': ' + REGIONS3[t[1]] + '.' }; } },
    { L: [1, 2], gen: function (R) { var c = R.pick(COL); return { q: 'In which region was the colony of <b>' + c[0] + '</b>?', a: REGIONS3[c[1]], w: REGIONS3.filter(function (x, i) { return i !== c[1]; }), why: c[0] + ' was one of the ' + REGIONS3[c[1]] + '.' }; } },
    { L: [2, 3], q: 'Why did New England develop small farms, fishing and trade rather than plantations?', a: 'Rocky soil and short summers made large-scale farming hard, while harbors and fishing grounds were rich.', w: ['The king banned plantations in New England.', 'New England had the longest growing season.', 'Its settlers refused to farm.'], why: 'Geography explains much: poor soil and a short season limited farming; the sea offered fish, timber and trade.' },
    { L: [2, 3], q: 'Slavery was legal only in the Southern colonies.', tf: false, why: 'False. It was legal in all thirteen colonies; it was largest in the South because plantation crops demanded so much labor.' },
    { L: [2, 3], q: 'Why did slavery grow far larger in South Carolina than in Massachusetts?', a: 'Rice plantations needed many field workers all year; New England\'s small farms did not.', w: ['Massachusetts banned slavery in 1641.', 'South Carolina had no indentured servants.', 'The king ordered it.'], why: 'The crop and the land made the demand for labor very different. Massachusetts law in fact allowed slavery from 1641.' },
    { L: [3], gen: function (R) { var r = R.int(0, 2), cs = R.sample(COL.filter(function (c) { return c[1] === r; }), R.int(1, 3)).concat(R.sample(COL.filter(function (c) { return c[1] !== r; }), 2)); return { q: 'Which of these colonies were in the <b>' + REGIONS3[r] + '</b>?', all: cs.map(function (c) { return [c[0], c[1] === r]; }), why: cs.map(function (c) { return c[0] + ': ' + REGIONS3[c[1]] + '.'; }) }; } },
    { L: [3], q: 'A historian says: "The South\'s economy differed from New England\'s because of its land and climate." Which evidence best supports this claim?', a: 'The South\'s long growing season suited tobacco and rice, crops grown on large plantations.', w: ['Both regions had elected assemblies.', 'Both regions were mostly English at first.', 'Both regions traded with Britain.'], why: 'Evidence must show a difference and tie it to land or climate; the other choices describe things the regions shared.' }
  ], 'Tie each region to its land, climate and settlers.'));

  G('ush1.colonial-slavery', bank([
    {"L":[1,2,3],"q":"In what year did the first recorded Africans arrive in English Virginia?","a":"1619","w":["1492","1565","1700","1776"],"why":"In 1619 about twenty Africans were brought to Point Comfort, Virginia."},
    {"L":[1,2,3],"q":"What were slave codes?","a":"Laws that took away the rights of enslaved people and gave owners power over them","w":["Laws that freed enslaved people after seven years","Rules that set wages for enslaved workers","Laws that let enslaved people vote"],"why":"Colonies passed slave codes in the late 1600s and 1700s."},
    {"L":[1,2],"q":"Which crops did enslaved people grow on large plantations in the Southern colonies?","a":"tobacco, rice and indigo","w":["wheat, oats and rye","apples and maple syrup","potatoes and cranberries"],"why":"Tobacco in the Chesapeake; rice and indigo in South Carolina and Georgia."},
    {"L":[2,3],"q":"Which colony had a Black majority for much of the 1700s?","a":"South Carolina","w":["Massachusetts","Pennsylvania","New York","Connecticut"],"why":"South Carolina's rice plantations relied on large numbers of enslaved Africans."},
    { L: [1, 2], q: 'What was the Middle Passage?', a: 'The voyage that carried enslaved Africans across the Atlantic to the Americas', w: ['A road from Virginia to Pennsylvania', 'A river route through the Middle colonies', 'A treaty between England and Spain'], why: 'Captives were chained below deck for weeks; between one and two in every ten died on the way.' },
    { L: [1, 2], q: 'In how many of the thirteen colonies was slavery legal?', a: 'All thirteen', w: ['Only the five Southern colonies', 'Only Virginia', 'None before 1776'], why: 'Slavery was legal in every colony; it was largest in the South.' },
    { L: [1, 2, 3], q: 'What was the Stono Rebellion (1739)?', a: 'A revolt of enslaved people in South Carolina who marched toward Spanish Florida', w: ['A tax protest in Boston', 'A war between Virginia and the Powhatan', 'A strike by indentured servants in Maryland'], why: 'About twenty enslaved men seized guns near the Stono River and marched south, gathering others, before the militia defeated them.' },
    { L: [2, 3], q: 'Virginia\'s law of 1662 said a child would be "bond or free only according to the condition of the mother." What did it do?', a: 'Made the children of enslaved women enslaved from birth', w: ['Freed all children born in Virginia', 'Ended the slave trade to Virginia', 'Made slavery depend on the father'], why: 'Slavery became inherited through the mother, so it passed from generation to generation.' },
    { L: [2, 3], q: 'Slavery was fixed in Virginia law as lifelong and inherited from 1619 on.', tf: false, why: 'False. The laws came step by step: the 1662 law on the mother\'s status, then the slave code of 1705.' },
    { L: [2, 3], q: 'About what share of Africans carried in the Atlantic slave trade went to the mainland colonies that became the United States?', a: 'Under 5 percent', w: ['About half', 'About 90 percent', 'About a quarter'], why: 'Of about 10.7 million who survived the voyage, most went to Brazil and the Caribbean; under 5 percent came to the mainland colonies.' },
    { L: [2, 3], q: 'What did South Carolina do after the Stono Rebellion?', a: 'Passed the Negro Act of 1740, a harsher slave code', w: ['Ended slavery', 'Joined Spanish Florida', 'Allowed enslaved people to learn to read'], why: 'The Negro Act barred enslaved people from learning to read, gathering in groups or moving about freely.' },
    { L: [2, 3], q: 'Why did Chesapeake planters shift from indentured servants to enslaved Africans in the late 1600s?', a: 'Fewer English servants came, and freed servants wanted land of their own; enslaved people could be held for life.', w: ['Indentured servitude was banned by Parliament in 1620.', 'Enslaved people cost nothing.', 'Tobacco needed no workers after 1650.'], why: 'The supply of servants fell and freed servants competed for land, while slavery gave planters lifelong, inherited labor.' },
    { L: [3], gen: function (R) { return orderQ(R, [['First recorded Africans arrive in Virginia', 1619], ['Massachusetts law allows slavery', 1641], ['Virginia: a child\'s status follows the mother', 1662], ['Virginia slave code', 1705], ['Slave revolt in New York City', 1712], ['Stono Rebellion', 1739], ['Georgia lifts its ban on slavery', 1751]], R.chance(0.5) ? 4 : 5); } },
    { L: [3], q: 'About slavery in the colonies:', all: [['Enslaved people resisted by escape, revolt and keeping their own culture.', true], ['Spanish Florida offered freedom to some who escaped from the English colonies.', true], ['By 1775 about one in five people in the colonies was enslaved.', true], ['Slavery existed only on Southern plantations.', false]], why: 'About 500,000 people were enslaved by 1775, in every colony, and they resisted in many ways.' }
  ], 'Think about how the laws changed step by step.'));

  G('ush1.colonial-conflicts', bank([
    {"L":[1,2,3],"q":"What did the English call the Wampanoag leader Metacom?","a":"King Philip","w":["King George","Powhatan","Pontiac","Tecumseh"],"why":"The war of 1675 to 1676 is named King Philip's War after him."},
    {"L":[1,2,3],"q":"Who led the Pueblo Revolt of 1680?","a":"Popé","w":["Metacom","Pontiac","Tecumseh","Squanto"],"why":"Popé, a Tewa leader, organized the revolt."},
    {"L":[1,2,3],"q":"In which colony did Bacon's Rebellion take place in 1676?","a":"Virginia","w":["Massachusetts","New Mexico","Pennsylvania","Georgia"],"why":"Nathaniel Bacon led the uprising against Governor Berkeley."},
    {"L":[1,2,3],"q":"King Philip's War was fought mainly in which region?","a":"New England","w":["the Chesapeake","New Mexico","the Carolinas","the Ohio Valley"],"why":"It was fought across New England in 1675 and 1676."},
    {"L":[1,2],"q":"Who led the 1676 uprising against Virginia's governor?","a":"Nathaniel Bacon","w":["William Berkeley","John Smith","Metacom","John Rolfe"],"why":"Bacon's Rebellion is named for him."},
    { L: [1, 2], q: 'Who led the Native coalition in King Philip\'s War (1675 to 1676)?', a: 'Metacom, a Wampanoag leader', w: ['Massasoit', 'Popé', 'Nathaniel Bacon', 'Opechancanough'], why: 'Metacom, son of Massasoit, was called "King Philip" by the English.' },
    { L: [1, 2], q: 'What did the Pueblo Revolt of 1680 achieve?', a: 'It drove the Spanish out of New Mexico for twelve years.', w: ['It ended the encomienda in Mexico.', 'It forced England out of Virginia.', 'It created the Haudenosaunee Confederacy.'], why: 'Led by Popé, the Pueblo peoples drove the Spanish from Santa Fe; Spain returned in 1692.' },
    { L: [1, 2, 3], q: 'Bacon\'s Rebellion (1676) was an uprising against whom?', a: 'Virginia\'s governor, William Berkeley', w: ['The Spanish in Florida', 'The Pequot nation', 'King George III'], why: 'Frontier settlers led by Nathaniel Bacon rose against Berkeley, who would not wage war on Native peoples to open land; they burned Jamestown.' },
    { L: [2, 3], gen: function (R) { var E = [['Pequot War', 'English colonists with Mohegan and Narragansett allies against the Pequot'], ['King Philip\'s War', 'Metacom\'s coalition against the New England colonies'], ['Bacon\'s Rebellion', 'Virginia frontier settlers against their own governor'], ['Pueblo Revolt', 'Pueblo peoples against Spanish rule in New Mexico']]; var e = R.pick(E); return { q: 'Which conflict was this?<br><b>' + e[1] + '</b>', a: e[0], w: E.filter(function (x) { return x !== e; }).map(function (x) { return x[0]; }), why: e[0] + ': ' + e[1] + '.' }; } },
    { L: [2, 3], q: 'In the Pequot War, all Native nations fought together against the English.', tf: false, why: 'False. The Mohegan and Narragansett fought beside the English against the Pequot; Native nations made their own alliances.' },
    { L: [2, 3], q: 'Why did Pueblo peoples rise against the Spanish in 1680?', a: 'Forced labor and the suppression of their religion', w: ['The Spanish refused to trade horses', 'A dispute over tobacco prices', 'The English had invaded New Mexico'], why: 'Spanish demands for labor and tribute and attacks on Pueblo religious practice drove the revolt.' },
    { L: [2, 3], gen: function (R) { return orderQ(R, [['Pequot War begins', 1636], ['Mystic massacre', 1637], ['King Philip\'s War begins', 1675], ['Bacon\'s army burns Jamestown', 1676], ['Pueblo Revolt', 1680], ['Spanish return to New Mexico', 1692]], R.chance(0.5) ? 3 : 4); } },
    { L: [3], q: 'Many historians link Bacon\'s Rebellion to the growth of slavery in Virginia. What is their reasoning?', a: 'Planters feared poor, armed former servants and turned more to enslaved Africans.', w: ['Bacon freed all enslaved people in Virginia.', 'The rebellion was fought over the slave trade.', 'Bacon\'s army was made up only of enslaved Africans.'], why: 'Bacon\'s army joined poor freed servants and some enslaved Africans; afterward planters bought more enslaved workers. Historians also stress the falling supply of servants.' },
    { L: [3], q: 'About King Philip\'s War:', all: [['Measured against population, it was one of the deadliest wars in American history.', true], ['Many captured Native people were sold into slavery.', true], ['It took place in New England.', true], ['It ended with a Native victory that stopped English expansion.', false]], why: 'The war devastated both sides; Metacom was killed in 1676 and English expansion continued.' }
  ], 'Name who fought whom, and why.'));

  G('ush1.mercantilism', bank([
    {"L":[1,2,3],"q":"Under mercantilism, colonies supplied raw materials and bought…","a":"manufactured goods from the mother country","w":["goods only from other colonies","nothing at all from abroad","goods mainly from France and Spain"],"why":"Colonies were meant to supply raw materials and buy the home country's goods."},
    {"L":[1,2,3],"q":"Mercantilists measured a nation's wealth mainly by its…","a":"gold and silver","w":["number of farms","population","railroads","factories"],"why":"They believed a nation grew rich by piling up gold and silver through trade."},
    {"L":[1,2],"q":"How did many colonial merchants get around the Navigation Acts?","a":"By smuggling","w":["By building their own navy","By asking Parliament for a vote","By trading only with Britain"],"why":"Smuggling was common, especially of molasses from the French West Indies."},
    { L: [1, 2], q: 'Under mercantilism, what was the main purpose of colonies?', a: 'To make the mother country rich', w: ['To become independent nations', 'To trade freely with any country', 'To grow food only for themselves'], why: 'Colonies supplied raw materials and bought the mother country\'s goods, helping its balance of trade.' },
    { L: [1, 2, 3], q: 'What did the Navigation Acts (from 1651) require?', a: 'Colonial trade had to travel in English ships, and key goods could go only to England or its colonies.', w: ['Colonists could trade freely with any nation.', 'Colonists paid a tax on every newspaper.', 'All colonial ships had to be built in Spain.'], why: 'The acts kept trade and shipping profits inside the empire; "enumerated" goods such as tobacco could go only to England.' },
    { L: [1, 2], q: 'What is a favorable balance of trade?', a: 'Selling more to other countries than you buy from them', w: ['Buying more than you sell', 'Trading only with colonies', 'Charging no taxes on trade'], why: 'Mercantilists wanted exports to exceed imports, bringing gold and silver into the country.' },
    { L: [2, 3], q: 'What was "salutary neglect"?', a: 'Britain\'s loose enforcement of its trade laws before 1763', w: ['The colonists\' refusal to pay any taxes', 'A law ending the Navigation Acts', 'A plan to abandon the colonies'], why: 'For decades Britain enforced the trade laws loosely; Edmund Burke called it "wise and salutary neglect" in 1775.' },
    { L: [2, 3], q: 'Mercantilism is another name for free trade.', tf: false, why: 'False. Mercantilism used laws to steer trade to benefit the mother country; free trade lets merchants buy and sell where they like.' },
    { L: [2, 3], q: 'The Molasses Act of 1733 taxed molasses from French and Dutch islands. What did many colonial merchants do?', a: 'Smuggled molasses and avoided the tax', w: ['Stopped making rum', 'Moved to the French islands', 'Asked Parliament to raise the tax'], why: 'The act was widely evaded by smuggling, which Britain did little to stop before 1763.' },
    { L: [2, 3], gen: function (R) { var P = [['Tobacco may be shipped only to England', 'Mercantilism'], ['Only English ships may carry goods to the colonies', 'Mercantilism'], ['A high tax on molasses from French islands', 'Mercantilism'], ['Merchants sell wherever they get the best price', 'Free trade'], ['No taxes on imports from other countries', 'Free trade']]; var x = R.pick(P); return { q: 'Does this policy fit <b>mercantilism</b> or <b>free trade</b>?<br><b>' + x[0] + '</b>', a: x[1], w: [x[1] === 'Mercantilism' ? 'Free trade' : 'Mercantilism'], why: x[1] === 'Mercantilism' ? 'It steers trade to benefit the mother country: mercantilism.' : 'It leaves merchants free to trade: free trade.' }; } },
    { L: [3], q: 'How did salutary neglect help set the stage for the Revolution?', a: 'Colonists grew used to trading and governing themselves, so stricter rules after 1763 felt like an attack on their rights.', w: ['It made the colonies poor, so they rebelled.', 'It gave colonists seats in Parliament.', 'It ended the Navigation Acts in 1700.'], why: 'Decades of leniency built habits of self-rule and smuggling; new enforcement and taxes after 1763 broke those habits.' }
  ], 'Mercantilism: trade steered for the mother country\'s gain.'));

  G('ush1.awakening-enlightenment', bank([
    { L: [1, 2, 3], gen: function (R) { var I = [['Jonathan Edwards', 0], ['George Whitefield', 0], ['Revival preaching to huge outdoor crowds', 0], ['"New Lights" and "Old Lights"', 0], ['Heartfelt personal conversion', 0], ['John Locke', 1], ['Natural rights to life, liberty and property', 1], ['Reason and scientific experiment', 1], ['Franklin\'s lightning experiments', 1], ['The American Philosophical Society', 1]]; var x = R.pick(I), B = ['The Great Awakening', 'The Enlightenment']; return { q: 'Which movement does this belong to?<br><b>' + x[0] + '</b>', a: B[x[1]], w: [B[1 - x[1]]], why: x[0] + ': ' + B[x[1]] + '.' }; } },
    { L: [1, 2], q: 'Who preached the sermon "Sinners in the Hands of an Angry God" (1741)?', a: 'Jonathan Edwards', w: ['Benjamin Franklin', 'John Locke', 'John Winthrop'], why: 'Edwards, a Massachusetts minister, was a leading preacher of the Great Awakening.' },
    { L: [1, 2], q: 'Which thinker argued in 1689 that people have natural rights to life, liberty and property?', a: 'John Locke', w: ['George Whitefield', 'Jonathan Edwards', 'William Penn'], why: 'Locke\'s Two Treatises of Government argued that government rests on consent and exists to protect natural rights.' },
    { L: [2, 3], q: 'What did the Great Awakening and the Enlightenment have in common?', a: 'Both encouraged colonists to question established authority.', w: ['Both were led by John Locke.', 'Both rejected religion.', 'Both began after the Revolution.'], why: 'The Awakening let people judge their ministers; the Enlightenment taught them to test ideas by reason and to see government as resting on consent.' },
    { L: [2, 3], q: 'The Great Awakening and the Enlightenment were the same movement.', tf: false, why: 'False. The Awakening was religious revival based on personal faith; the Enlightenment stressed reason and science.' },
    { L: [2, 3], q: 'Which college grew out of the Great Awakening, founded in 1746 as the College of New Jersey?', a: 'Princeton', w: ['Harvard', 'Yale', 'William and Mary'], why: 'New Light Presbyterians founded the College of New Jersey in 1746; it later became Princeton University.' },
    { L: [3], q: 'How could colonists later use Locke\'s idea that government rests on the consent of the governed?', a: 'To argue that laws and taxes passed without their consent were not legitimate', w: ['To argue that kings rule by divine right', 'To support the Navigation Acts', 'To justify banishing religious dissenters'], why: 'If government rests on consent, taxation without consent is wrong; the Declaration of Independence echoes Locke.' },
    { L: [3], q: 'About the 1700s colonies:', all: [['Benjamin Franklin printed George Whitefield\'s sermons.', true], ['Churches split between New Lights and Old Lights.', true], ['Franklin\'s kite experiment of 1752 showed that lightning is electricity.', true], ['The Enlightenment taught that reason should never be used in religion or politics.', false]], why: 'Print carried both movements; the Enlightenment put reason at the center.' }
  ], 'Awakening: faith and feeling. Enlightenment: reason and rights.'));

  G('ush1.colonial-self-government', bank([
    { L: [1, 2], q: 'Which body held the "power of the purse" in most colonies?', a: 'The elected colonial assembly', w: ['The king alone', 'The colonial governor', 'The Church of England'], why: 'Assemblies voted taxes and often the governor\'s salary, which gave them power to bargain with the governor.' },
    { L: [1, 2, 3], q: 'What did the Zenger trial (1735) defend?', a: 'The right to print true criticism of government officials', w: ['The right to bear arms', 'The right to own land in the West', 'The king\'s right to tax colonists'], why: 'A jury acquitted the printer John Peter Zenger after his lawyer argued that his attacks on Governor Cosby were true.' },
    { L: [1, 2], q: 'Where did New England towns govern local affairs?', a: 'In town meetings', w: ['In Parliament', 'In the House of Burgesses', 'In the Continental Congress'], why: 'Town meetings let voters in each New England town decide local matters.' },
    { L: [2, 3], gen: function (R) { var T = [['Royal colony', 'The king chose the governor', 'Virginia after 1624'], ['Proprietary colony', 'An owner (proprietor) chose the governor', 'Pennsylvania'], ['Charter colony', 'The colonists elected their own governor', 'Connecticut']]; var t = R.pick(T); return { q: 'Which kind of colony was this?<br><b>' + t[1] + ' (for example, ' + t[2] + ')</b>', a: t[0], w: T.filter(function (x) { return x !== t; }).map(function (x) { return x[0]; }), why: t[0] + ': ' + t[1].toLowerCase() + '.' }; } },
    { L: [2, 3], q: 'Colonists had no voice in their own government before 1776.', tf: false, why: 'False. They had elected assemblies for over a century; their protest after 1763 was against Parliament taxing them without those assemblies\' consent.' },
    { L: [2, 3], q: 'What happened to the Dominion of New England, which ruled without an elected assembly?', a: 'It collapsed in 1689 when colonists overthrew Governor Andros after the Glorious Revolution.', w: ['It lasted until the Revolution.', 'It became the state of Massachusetts in 1776.', 'It was ended by the Treaty of Paris (1763).'], why: 'Bostonians arrested Andros in 1689 and restored their old governments.' },
    { L: [2, 3], gen: function (R) { return orderQ(R, [['House of Burgesses first meets', 1619], ['Mayflower Compact', 1620], ['Fundamental Orders of Connecticut', 1639], ['Dominion of New England created', 1686], ['English Bill of Rights', 1689], ['Zenger trial', 1735]], R.chance(0.5) ? 3 : 4); } },
    { L: [3], q: 'About colonial self-government:', all: [['Most colonies had a governor, a council and an elected assembly.', true], ['Only men who owned property could vote in most colonies.', true], ['Connecticut and Rhode Island elected their own governors.', true], ['Parliament included elected members from the colonies.', false]], why: 'Colonists governed themselves locally but had no members in Parliament, which became the heart of the later quarrel.' }
  ], 'Think about assemblies and who voted the taxes.'));
  /* ===================================================================== Unit 4: The American Revolution */
  G('ush1.french-and-indian-war', bank([
    {"L":[1,2,3],"q":"Which young Virginia officer fought in the first battles of the French and Indian War in 1754?","a":"George Washington","w":["Benjamin Franklin","Thomas Jefferson","Patrick Henry","John Adams"],"why":"Washington fought at Fort Necessity in 1754."},
    {"L":[1,2,3],"q":"Which treaty ended the French and Indian War?","a":"the Treaty of Paris (1763)","w":["the Treaty of Ghent","the Treaty of Paris (1783)","the Treaty of Versailles","the Treaty of Guadalupe Hidalgo"],"why":"The Treaty of Paris of 1763 gave Britain Canada and the land east of the Mississippi."},
    {"L":[1,2,3],"q":"Which side won the French and Indian War?","a":"Britain","w":["France","Spain","the Netherlands"],"why":"Britain won and took over France's lands in North America east of the Mississippi."},
    {"L":[1,2,3],"q":"Which plan, proposed by Benjamin Franklin in 1754, called for the colonies to unite?","a":"the Albany Plan of Union","w":["the Virginia Plan","the Anaconda Plan","the Northwest Ordinance","the Olive Branch Petition"],"why":"The colonies did not adopt it, but it was an early idea of union."},
    {"L":[1,2,3],"q":"Why did Britain start taxing the colonies after 1763?","a":"To help pay the large debt from the war","w":["To pay for a war with Mexico","To build railroads","To fund the Continental Army"],"why":"The war had doubled Britain's national debt."},
    {"L":[2,3],"q":"Which French city did the British capture in 1759 in a key battle of the war?","a":"Quebec","w":["Montreal","New Orleans","Boston","Pittsburgh"],"why":"British forces under James Wolfe took Quebec in 1759."},
    {"L":[2,3],"q":"Who led Native nations in a 1763 war against the British after the French and Indian War?","a":"Pontiac","w":["Metacom","Popé","Tecumseh","Sequoyah"],"why":"Pontiac, an Odawa leader, led the uprising known as Pontiac's War."},
    { L: [1, 2], q: 'Which two powers fought the French and Indian War (1754 to 1763) for control of North America?', a: 'Britain and France', w: ['Britain and Spain', 'France and the Haudenosaunee', 'The colonies and Britain', 'Spain and Portugal'], why: 'Britain and France, each with Native allies, fought for North America; in Europe it was part of the Seven Years\' War.' },
    { L: [1, 2, 3], q: 'What did the Proclamation of 1763 do?', a: 'It banned colonial settlement west of the Appalachian Mountains.', w: ['It taxed paper in the colonies.', 'It declared American independence.', 'It gave Canada back to France.'], why: 'King George III closed the western lands to settlers, partly to keep peace with Native nations after Pontiac\'s War.' },
    { L: [1, 2], q: 'Why is it called the "French and Indian War"?', a: 'British colonists named it for their enemies: the French and their Native allies.', w: ['It was fought between France and Native nations.', 'It was fought in India.', 'Only Native nations fought in it.'], why: 'The name comes from the British colonists\' enemies; many Native nations fought on both sides.' },
    { L: [2, 3], q: 'In the Treaty of Paris of 1763, what did Britain gain in North America?', a: 'Canada and the land east of the Mississippi, plus Florida from Spain', w: ['Louisiana west of the Mississippi', 'Mexico and Texas', 'Only the Ohio valley'], why: 'France gave up Canada and its land east of the Mississippi; Spain gave Britain Florida. Louisiana west of the Mississippi went to Spain.' },
    { L: [2, 3], q: 'How did the war lead to new conflict between Britain and its colonies?', a: 'Britain\'s war debt led Parliament to tax the colonies, and the Proclamation closed western lands.', w: ['France invaded the colonies again in 1764.', 'The colonies refused to fight in the war.', 'Britain lost the war and blamed the colonies.'], why: 'Britain\'s debt nearly doubled; Parliament looked to the colonies for revenue, and settlers resented the Proclamation line.' },
    { L: [2, 3], q: 'What was the Albany Plan of Union (1754)?', a: 'Benjamin Franklin\'s plan for a council of the colonies, which the colonial assemblies rejected', w: ['The treaty that ended the war', 'A British tax on the colonies', 'A plan to declare independence'], why: 'Franklin proposed a joint council to raise troops and taxes; the assemblies would not give up their powers.' },
    { L: [2, 3], q: 'Many Native nations fought only on the British side in the French and Indian War.', tf: false, why: 'False. Many fought with the French, others (most of the Haudenosaunee) with the British, and many tried to protect their own interests between the two.' },
    { L: [2, 3], gen: function (R) { return orderQ(R, [['Fighting at Fort Necessity; Albany Congress', 1754], ['Braddock defeated near Fort Duquesne', 1755], ['British take Quebec', 1759], ['Treaty of Paris ends the war', 1763, 'February 1763'], ['Proclamation of 1763', 1763.8, 'October 1763']], R.chance(0.5) ? 3 : 4); } },
    { L: [3], q: 'About the results of the French and Indian War:', all: [['France lost its mainland North American empire.', true], ['Britain\'s national debt nearly doubled.', true], ['Pontiac\'s War broke out in 1763.', true], ['Colonists were free to settle west of the Appalachians after 1763.', false]], why: 'France left the mainland; Britain\'s debt and the Proclamation line set the stage for conflict with the colonists.' }
  ], 'Think about the war\'s costs and the western lands.'));

  var ACTS = [['Sugar Act', 1764, 'cut the tax on foreign molasses but enforced it strictly'], ['Stamp Act', 1765, 'taxed newspapers, legal documents and other paper'], ['Declaratory Act', 1766, 'said Parliament could make laws for the colonies "in all cases whatsoever"'], ['Townshend Acts', 1767, 'put duties on glass, lead, paint, paper and tea']];
  G('ush1.taxes-and-protest', bank([
    { L: [1, 2, 3], gen: function (R) { var x = R.pick(ACTS); return { q: 'Which law ' + x[2] + '?', a: x[0], w: ACTS.filter(function (y) { return y !== x; }).map(function (y) { return y[0]; }).concat(['Tea Act']), why: 'The ' + x[0] + ' (' + x[1] + ') ' + x[2] + '.' }; } },
    { L: [1, 2], q: 'What did colonists mean by "no taxation without representation"?', a: 'Only their own elected representatives could tax them, and they elected no one to Parliament.', w: ['They wanted lower taxes.', 'They wanted to pay no taxes at all, ever.', 'They wanted Parliament to represent them virtually.'], why: 'Colonists held that taxes needed the consent of elected representatives; they had none in Parliament.' },
    { L: [2, 3], q: 'Colonists objected to the British taxes mainly because they were very high.', tf: false, why: 'False. Many were small; the Sugar Act actually lowered the molasses tax. They objected that Parliament had no right to tax them at all.' },
    { L: [2, 3], q: 'What was "virtual representation"?', a: 'The British idea that Parliament represented all British subjects, even those who could not vote for it', w: ['A plan to give colonists seats in Parliament', 'The colonial assemblies\' power to tax', 'Voting by mail'], why: 'British leaders said Parliament represented everyone in the empire; colonists rejected the idea.' },
    { L: [2, 3], q: 'What was the Stamp Act Congress (October 1765)?', a: 'A meeting of delegates from nine colonies who petitioned against the Stamp Act', w: ['The first meeting of the House of Burgesses', 'The meeting that declared independence', 'Parliament\'s debate on the Stamp Act'], why: 'Delegates from nine colonies met in New York, declared that only their own assemblies could tax them, and petitioned the King and Parliament.' },
    { L: [2, 3], q: 'How did colonists pressure Parliament to repeal the Stamp Act and the Townshend duties?', a: 'They boycotted British goods, hurting British merchants.', w: ['They sent an army to London.', 'They elected members to Parliament.', 'They paid the taxes twice.'], why: 'Nonimportation agreements and homespun cloth cut British sales; merchants pressed Parliament for repeal.' },
    { L: [2, 3], gen: function (R, lv) { var x = R.pick(ACTS); return lv === 3 ? { q: 'In what year did Parliament pass the <b>' + x[0] + '</b>?', num: x[1], why: 'The ' + x[0] + ' was passed in ' + x[1] + '.', hint: 'The Sugar Act came first, in 1764; each later law followed about a year apart.' } : yearQ(R, lv, 'In what year did Parliament pass the <b>' + x[0] + '</b>?', x[1], 'The ' + x[0] + ' was passed in ' + x[1] + '.', [1, 2, 3]); } },
    { L: [2, 3], gen: function (R) { return orderQ(R, [['Sugar Act', 1764], ['Stamp Act', 1765], ['Stamp Act repealed; Declaratory Act', 1766], ['Townshend Acts', 1767], ['Most Townshend duties repealed, except on tea', 1770]], R.chance(0.5) ? 3 : 4, 'laws and events'); } },
    { L: [3], q: 'When Parliament repealed the Stamp Act in 1766, it also passed the Declaratory Act. Why did this matter?', a: 'Parliament gave up the tax but not the principle that it could make laws for the colonies "in all cases whatsoever."', w: ['It ended all taxes in the colonies forever.', 'It gave the colonies seats in Parliament.', 'It declared war on the colonies.'], why: 'The repeal was practical; the Declaratory Act kept the claim of authority that the colonists denied.' }
  ], 'The quarrel was over the right to tax.'));

  var ROAD = [['Boston Massacre', 1770], ['Tea Act', 1773, 'May 1773'], ['Boston Tea Party', 1773.9, 'December 1773'], ['Coercive (Intolerable) Acts', 1774, 'spring 1774'], ['First Continental Congress', 1774.7, 'September 1774'], ['Lexington and Concord', 1775]];
  G('ush1.road-to-revolution', bank([
    {"L":[1,2,3],"q":"Which 1765 law taxed newspapers, legal papers and playing cards?","a":"the Stamp Act","w":["the Sugar Act","the Tea Act","the Townshend Acts","the Quartering Act"],"why":"The Stamp Act required stamps on printed papers."},
    {"L":[1,2,3],"q":"Which slogan summed up the colonists' complaint about British taxes?","a":"\"No taxation without representation\"","w":["\"Give me liberty or give me death\"","\"Remember the Alamo\"","\"Fifty-four forty or fight\""],"why":"Colonists had no members in Parliament, which taxed them."},
    {"L":[1,2,3],"q":"What happened at the Boston Massacre on March 5, 1770?","a":"British soldiers fired into a crowd, killing five colonists","w":["Colonists dumped tea into the harbor","The first battle of the Revolution was fought","The Declaration of Independence was read aloud"],"why":"Five colonists died, including Crispus Attucks."},
    {"L":[1,2,3],"q":"Which 1767 laws taxed glass, lead, paint, paper and tea?","a":"the Townshend Acts","w":["the Stamp Act","the Sugar Act","the Coercive Acts","the Navigation Acts"],"why":"The Townshend Acts taxed imported goods."},
    {"L":[1,2,3],"q":"Which meeting of colonial delegates gathered in Philadelphia in 1774?","a":"the First Continental Congress","w":["the Constitutional Convention","the Albany Congress","the Second Continental Congress"],"why":"It met in September 1774 in response to the Coercive Acts."},
    {"L":[2,3],"q":"Which secret group organized protests such as the Boston Tea Party?","a":"the Sons of Liberty","w":["the Minutemen","the Loyalists","the Federalists","the Committees of Safety"],"why":"The Sons of Liberty formed during the Stamp Act protests."},
    { L: [1, 2, 3], gen: function (R, lv) { return orderQ(R, lv === 1 ? ROAD.slice(0, 5) : ROAD, lv === 1 ? 3 : lv === 2 ? 4 : 5); } },
    { L: [1, 2], q: 'What happened at the Boston Tea Party (December 16, 1773)?', a: 'Colonists dumped 342 chests of East India Company tea into Boston Harbor.', w: ['British soldiers fired on a crowd.', 'Delegates from twelve colonies met in Philadelphia.', 'Colonists and British troops fought at Concord.'], why: 'Protesting the tea tax and the company\'s monopoly, colonists destroyed the tea.' },
    { L: [1, 2], q: 'What were the Coercive Acts of 1774, called the "Intolerable Acts" by colonists?', a: 'Laws punishing Massachusetts, including closing the port of Boston', w: ['Laws repealing all taxes', 'The first taxes on tea', 'Laws giving the colonies seats in Parliament'], why: 'Parliament closed Boston\'s port until the tea was paid for and tightened royal control of Massachusetts.' },
    { L: [2, 3], q: 'The Tea Act of 1773 raised the price of tea in the colonies.', tf: false, why: 'False. It made legal tea cheaper. Colonists objected that it kept the tax and gave the East India Company a monopoly.' },
    { L: [2, 3], q: 'Why did colonists destroy tea that had become cheaper?', a: 'Buying it meant accepting Parliament\'s tax, and the company had a monopoly.', w: ['The tea was spoiled.', 'They wanted Dutch tea to be cheaper.', 'The King ordered it destroyed.'], why: 'The principle of the tax, and the monopoly, mattered more than the price.' },
    { L: [2, 3], q: 'Which colony did <b>not</b> send delegates to the First Continental Congress in 1774?', a: 'Georgia', w: ['Massachusetts', 'Virginia', 'Pennsylvania', 'New York'], why: 'Twelve colonies sent delegates; Georgia did not.' },
    { L: [2, 3], q: 'Who defended the British soldiers in court after the Boston Massacre?', a: 'John Adams', w: ['Samuel Adams', 'Paul Revere', 'Thomas Paine'], why: 'John Adams believed the soldiers deserved a fair trial; most were acquitted.' },
    { L: [3], q: 'What did the First Continental Congress do in 1774?', all: [['Adopted the Continental Association, a boycott of British goods', true], ['Agreed to meet again if grievances were not addressed', true], ['Declared independence', false], ['Brought together delegates from twelve colonies', true]], why: 'The Congress organized a boycott enforced by local committees and planned to reconvene; independence came in 1776.' },
    { L: [3], q: 'Paul Revere\'s engraving of the Boston Massacre showed soldiers firing in a line into a calm crowd. How should a historian use it?', a: 'As evidence of how Patriots wanted the event seen, not as an exact record of what happened', w: ['As an exact photograph of the event', 'As proof the soldiers planned the shooting', 'As a secondary source written in 1900'], why: 'Revere made it to stir anger (its purpose); trial testimony shows a crowd throwing snowballs and sticks.' }
  ], 'Each step answered the one before.'));

  G('ush1.war-begins', bank([
    {"L":[1,2,3],"q":"Who rode out to warn that British troops were coming on the night of April 18, 1775?","a":"Paul Revere and William Dawes","w":["George Washington and John Adams","Thomas Paine and Patrick Henry","Benedict Arnold and Ethan Allen"],"why":"Revere and Dawes rode to warn Lexington."},
    {"L":[1,2,3],"q":"Which battle near Boston in June 1775 showed that colonists could stand against British regulars?","a":"Bunker Hill (Breed's Hill)","w":["Saratoga","Yorktown","Trenton","Brandywine"],"why":"The British took the hill but lost over a thousand men."},
    {"L":[1,2,3],"q":"Who wrote most of the Declaration of Independence?","a":"Thomas Jefferson","w":["John Adams","Benjamin Franklin","George Washington","Thomas Paine"],"why":"Jefferson drafted it for a committee of five."},
    {"L":[1,2,3],"q":"On what date did Congress approve the Declaration of Independence?","a":"July 4, 1776","w":["April 19, 1775","September 17, 1787","June 17, 1775","September 3, 1783"],"why":"Congress adopted the Declaration on July 4, 1776."},
    {"L":[2,3],"q":"What was the Olive Branch Petition of 1775?","a":"A last appeal by Congress to King George III for peace","w":["A declaration of war on Britain","A plan for a new constitution","A treaty with France"],"why":"The king refused to read it."},
    { L: [1, 2], q: 'Where did the fighting of the American Revolution begin, on April 19, 1775?', a: 'Lexington and Concord, Massachusetts', w: ['Yorktown, Virginia', 'Saratoga, New York', 'Philadelphia, Pennsylvania', 'Trenton, New Jersey'], why: 'British troops marched to seize militia supplies at Concord; shots were fired at Lexington and Concord.' },
    { L: [1, 2], q: 'Whom did the Second Continental Congress name commander of the Continental Army in June 1775?', a: 'George Washington', w: ['Benjamin Franklin', 'John Adams', 'Thomas Jefferson'], why: 'Congress chose Washington, a Virginian with experience from the French and Indian War.' },
    { L: [1, 2, 3], q: 'What did Thomas Paine argue in Common Sense (January 1776)?', a: 'That the colonies should declare full independence from Britain', w: ['That the colonies should reconcile with the King', 'That the Stamp Act should be repealed', 'That Britain should tax the colonies more'], why: 'Paine attacked monarchy itself and argued "\'tis time to part."' },
    { L: [2, 3], q: 'The Revolutionary War began after the Declaration of Independence was signed.', tf: false, why: 'False. Fighting began in April 1775, more than a year before July 1776.' },
    { L: [2, 3], q: 'What was the Olive Branch Petition (July 1775)?', a: 'Congress\'s appeal to the King for peace, which he rejected', w: ['A declaration of independence', 'A treaty with France', 'A British law closing Boston'], why: 'Congress asked George III to restore harmony; he refused and declared the colonies in rebellion.' },
    { L: [2, 3], gen: function (R) { return orderQ(R, [['Battles of Lexington and Concord', 1775.3, 'April 1775'], ['Second Continental Congress meets', 1775.4, 'May 1775'], ['Battle of Bunker Hill', 1775.5, 'June 1775'], ['Olive Branch Petition', 1775.55, 'July 1775'], ['King declares the colonies in rebellion', 1775.65, 'August 1775'], ['Common Sense published', 1776.05, 'January 1776'], ['Declaration of Independence', 1776.5, 'July 1776']], R.chance(0.5) ? 3 : 4); } },
    { L: [2, 3], q: 'Paine wrote that "there is something very absurd, in supposing a Continent to be perpetually governed by an island." What kind of argument is this?', a: 'An appeal to common sense and nature: a large continent should not be ruled by a small, distant island', w: ['A legal argument from the colonial charters', 'A religious argument from the Bible', 'An economic argument about tea prices'], why: 'Paine argued from nature and plain reason, in language ordinary readers could follow.' },
    { L: [3], q: 'Apply HIPP to Common Sense. Which statement describes its <b>intended audience</b>?', a: 'Ordinary colonists: it was written in plain language and sold cheaply.', w: ['It appeared in January 1776, nine months into the war.', 'Paine wanted colonists to choose independence.', 'Paine was an English immigrant who rejected kings.'], why: 'The other choices describe its historical situation, purpose and point of view.' },
    { L: [3], q: 'In 1775, what did most colonists who took up arms want at first?', a: 'To restore their rights within the British Empire', w: ['To make George Washington king', 'To join the French empire', 'To end all taxes'], why: 'Many hoped for reconciliation until 1776; the King\'s refusal and Common Sense helped move opinion toward independence.' }
  ], 'Remember: fighting came first, independence second.'));

  var DECL_PARTS = ['Introduction (why a people must explain a separation)', 'Statement of rights and the theory of government', 'List of grievances against the King', 'Declaration that the colonies are free and independent states'];
  G('ush1.declaration-of-independence', bank([
    { L: [1, 2], q: 'Who was the main author of the Declaration of Independence?', a: 'Thomas Jefferson', w: ['George Washington', 'Thomas Paine', 'Benjamin Franklin', 'John Adams'], why: 'Jefferson wrote the draft for the Committee of Five; Adams and Franklin suggested edits.' },
    { L: [1, 2], gen: function (R, lv) { return lv === 1 ? { q: 'On what date did Congress adopt the Declaration of Independence?', a: 'July 4, 1776', w: ['July 4, 1787', 'April 19, 1775', 'September 3, 1783'], why: 'Congress voted for independence on July 2 and adopted the Declaration on July 4, 1776.' } : { q: 'On what date did Congress <b>vote</b> for independence, approving the Lee Resolution?', a: 'July 2, 1776', w: ['July 4, 1776', 'August 2, 1776', 'June 7, 1776'], why: 'Lee proposed independence on June 7; Congress approved it on July 2, adopted the Declaration on July 4, and most delegates signed the engrossed copy on August 2.' }; } },
    { L: [1, 2, 3], q: 'What did the Declaration of Independence do?', a: 'It explained why the colonies were separating from Britain and declared them independent.', w: ['It set up the new national government.', 'It ended the Revolutionary War.', 'It created the Bill of Rights.'], why: 'The Declaration explains and announces the separation; the Articles of Confederation and the Constitution set up the government.' },
    { L: [2, 3], q: 'The Declaration of Independence set up the government of the United States.', tf: false, why: 'False. It explains why the colonies separated. The Articles of Confederation (1781) and the Constitution (1789) set up the government.' },
    { L: [2, 3], gen: function (R) { var phr = [['consent of the governed', 'Government\'s just power comes from the people\'s agreement.'], ['unalienable Rights', 'Rights that cannot be taken away or given up.'], ['alter or to abolish it', 'The people may change or end a government that destroys their rights.']]; var x = R.pick(phr); return { q: 'In the Declaration, what does the phrase <b>"' + x[0] + '"</b> mean?', a: x[1], w: phr.filter(function (y) { return y !== x; }).map(function (y) { return y[1]; }).concat(['The King\'s right to rule comes from God.']), why: '"' + x[0] + '": ' + x[1] }; } },
    { L: [2, 3], gen: function (R) { var i = R.int(0, 3); var ex = ['"When in the Course of human events, it becomes necessary for one people to dissolve the political bands…"', '"We hold these truths to be self-evident, that all men are created equal…"', '"For imposing taxes on us without our Consent"', '"…these United Colonies are, and of right ought to be Free and Independent States"']; return { q: 'Which part of the Declaration does this line come from?<br><b>' + ex[i] + '</b>', a: DECL_PARTS[i], w: DECL_PARTS.filter(function (x, j) { return j !== i; }), why: 'The Declaration runs: introduction, theory of government, grievances, declaration of independence. This line is from: ' + DECL_PARTS[i].toLowerCase() + '.' }; } },
    { L: [2, 3], q: 'Which grievance in the Declaration connects to the Stamp Act and the Townshend Acts?', a: '"For imposing taxes on us without our Consent"', w: ['"For quartering large bodies of armed troops among us"', '"For depriving us in many cases, of the benefits of Trial by Jury"', '"He has dissolved Representative Houses repeatedly"'], why: 'Taxes without consent were the colonists\' central complaint after 1763.' },
    { L: [3], q: 'About the making of the Declaration:', all: [['A Committee of Five, including Jefferson, Adams and Franklin, was named to draft it.', true], ['Congress removed a passage blaming the King for the slave trade.', true], ['It lists 27 grievances against the King.', true], ['It was written after the Constitution.', false]], why: 'The Declaration (1776) came eleven years before the Constitution (1787); Congress edited Jefferson\'s draft.' },
    { L: [3], q: 'The Declaration\'s argument follows Locke. Which is its main premise?', a: 'Governments exist to secure people\'s natural rights and get their power from the consent of the governed.', w: ['Kings rule by divine right and must always be obeyed.', 'Colonies exist to make the mother country rich.', 'Only property owners have rights.'], why: 'From that premise and the grievances, it concludes that the people may abolish the King\'s government over them.' }
  ], 'Theory, grievances, conclusion.'));

  G('ush1.loyalists-patriots', bank([
    {"L":[1,2,3],"q":"What was a Patriot?","a":"A colonist who supported independence","w":["A colonist who stayed loyal to Britain","A British soldier","A German soldier hired by Britain"],"why":"Patriots supported the Revolution."},
    {"L":[1,2,3],"q":"Where did many Loyalists go after the war?","a":"Canada and Britain","w":["Mexico","Spain","Louisiana"],"why":"Tens of thousands left, many for Canada."},
    {"L":[1,2,3],"q":"What did many Patriots call Loyalists?","a":"Tories","w":["Whigs","Minutemen","Redcoats","Hessians"],"why":"Loyalists were often called Tories; Patriots were sometimes called Whigs."},
    {"L":[2,3],"q":"Which Patriot leader's son, William, the royal governor of New Jersey, stayed a Loyalist?","a":"Benjamin Franklin","w":["John Adams","Samuel Adams","Patrick Henry","George Washington"],"why":"The war split even the Franklin family."},
    { L: [1, 2], q: 'What was a Loyalist?', a: 'A colonist who stayed loyal to Britain', w: ['A colonist who supported independence', 'A French soldier who fought for the Americans', 'A member of Parliament'], why: 'Loyalists (Tories) remained loyal to the King; Patriots supported independence.' },
    { L: [1, 2, 3], q: 'About what share of white colonists do historians estimate were Loyalists?', a: 'About 15 to 20 percent', w: ['Almost none', 'About 90 percent', 'Exactly half'], why: 'Historians estimate roughly 15 to 20 percent, with many others trying to stay neutral.' },
    { L: [1, 2], q: 'What did Dunmore\'s Proclamation (November 1775) offer?', a: 'Freedom to enslaved people of rebel owners who joined the British forces', w: ['Land to Patriots who left the army', 'An end to all taxes', 'Freedom to all enslaved people in America'], why: 'Lord Dunmore, Virginia\'s royal governor, offered freedom to those "appertaining to Rebels" who would bear arms for the King.' },
    { L: [2, 3], q: 'Nearly all colonists supported independence.', tf: false, why: 'False. Roughly 15 to 20 percent of white colonists were Loyalists, and many others tried to stay neutral.' },
    { L: [2, 3], q: 'Why did most Native nations side with Britain in the Revolution?', a: 'Patriot settlers were pressing onto their lands, and Britain had tried to limit settlement in 1763.', w: ['Britain promised them seats in Parliament.', 'They had all fought for the colonists in the French and Indian War.', 'The Continental Congress asked them to.'], why: 'Britain looked like the better protector of Native lands; still, some nations, such as the Oneida, aided the Patriots.' },
    { L: [2, 3], q: 'Which Haudenosaunee nation mostly aided the Patriots?', a: 'The Oneida', w: ['The Mohawk', 'The Seneca', 'The Cayuga'], why: 'The Oneida (and Tuscarora) mostly aided the Patriots, while the Mohawk under Joseph Brant and most others fought for Britain.' },
    { L: [2, 3], q: 'Read closely: Dunmore declared free those enslaved people "appertaining to Rebels" who would bear arms. Whom did the offer <b>not</b> include?', a: 'People enslaved by Loyalists', w: ['People enslaved by Patriots', 'Indentured servants of rebels', 'Men able to bear arms'], why: 'The offer covered only those owned by rebels; its aim was military, to weaken the rebellion.' },
    { L: [3], q: 'About people\'s choices in the Revolution:', all: [['About 5,000 Black men served on the Patriot side.', true], ['Thousands of enslaved people sought freedom with the British.', true], ['Some 60,000 to 80,000 Loyalists left the United States after the war.', true], ['Every Native nation stayed neutral.', false]], why: 'Black Americans served on both sides, Loyalists left in large numbers, and most Native nations fought, mostly for Britain.' }
  ], 'People chose sides for many reasons.'));

  var WAR = [['Battle of Trenton', 1776, 'December 1776'], ['Battle of Saratoga', 1777, 'October 1777'], ['Winter at Valley Forge', 1777.95, 'winter 1777 to 1778'], ['Treaty of Alliance with France', 1778.1, 'February 1778'], ['British capture Charleston', 1780], ['Battle of Cowpens', 1781.05, 'January 1781'], ['British surrender at Yorktown', 1781.8, 'October 1781']];
  G('ush1.revolutionary-war', bank([
    {"L":[1,2,3],"q":"Which country became the most important ally of the United States in the Revolution?","a":"France","w":["Spain","the Netherlands","Russia","Prussia"],"why":"France signed a treaty of alliance in 1778."},
    {"L":[1,2,3],"q":"Where did Washington win a surprise victory after crossing the Delaware River on December 26, 1776?","a":"Trenton, New Jersey","w":["Yorktown, Virginia","Saratoga, New York","Boston, Massachusetts","Charleston, South Carolina"],"why":"Washington attacked the Hessian garrison at Trenton."},
    {"L":[1,2,3],"q":"Who were the Hessians?","a":"German soldiers hired by Britain","w":["French soldiers sent to help America","Colonists loyal to Britain","Native allies of the Patriots"],"why":"Many came from Hesse-Kassel."},
    {"L":[1,2,3],"q":"Which French noble became a major general in the Continental Army?","a":"the Marquis de Lafayette","w":["Baron von Steuben","Lord Cornwallis","Count Rochambeau"],"why":"Lafayette joined the army in 1777 at age 19."},
    {"L":[2,3],"q":"Which Prussian officer drilled the Continental Army at Valley Forge?","a":"Baron von Steuben","w":["the Marquis de Lafayette","Lord Cornwallis","John Burgoyne"],"why":"Von Steuben trained the army in the winter of 1777–1778."},
    { L: [1, 2], q: 'Which American victory in 1777 convinced France to join the war?', a: 'Saratoga', w: ['Yorktown', 'Lexington', 'Bunker Hill', 'Trenton'], why: 'Burgoyne\'s surrender at Saratoga (October 17, 1777) led to the Treaty of Alliance with France in February 1778.' },
    { L: [1, 2, 3], q: 'Where did the British army under Cornwallis surrender in October 1781?', a: 'Yorktown, Virginia', w: ['Saratoga, New York', 'Boston, Massachusetts', 'Charleston, South Carolina'], why: 'American and French forces besieged Yorktown while a French fleet blocked the sea; Cornwallis surrendered on October 19, 1781.' },
    { L: [1, 2], q: 'Where did the Continental Army spend the hard winter of 1777 to 1778?', a: 'Valley Forge, Pennsylvania', w: ['Yorktown, Virginia', 'Lexington, Massachusetts', 'Trenton, New Jersey'], why: 'At Valley Forge many soldiers died of disease, and von Steuben drilled the army.' },
    { L: [2, 3], q: 'The Americans won mainly by defeating the British in many large battles.', tf: false, why: 'False. They lost many battles. They won by keeping the army alive, winning key fights and gaining French money, troops and ships.' },
    { L: [2, 3], q: 'Why could Cornwallis not escape from Yorktown by sea?', a: 'A French fleet under Admiral de Grasse controlled Chesapeake Bay.', w: ['The bay had frozen over.', 'The British navy had been sold to Spain.', 'Washington had sunk every British ship.'], why: 'The French naval victory of September 5, 1781, cut Cornwallis off; land and sea power together trapped him.' },
    { L: [2, 3], q: 'What did Washington\'s attack on Trenton (December 26, 1776) achieve?', a: 'A surprise victory over Hessian troops that revived Patriot spirits', w: ['The end of the war', 'An alliance with France', 'The capture of Cornwallis\'s army'], why: 'After a year of defeats, Washington crossed the Delaware and captured about 900 Hessians, keeping the cause alive.' },
    { L: [2, 3], gen: function (R, lv) { return orderQ(R, WAR, lv === 2 ? 4 : 5); } },
    { L: [3], q: 'About how the Americans won:', all: [['France provided money, soldiers and ships after 1778.', true], ['Spain joined the war in 1779 as an ally of France.', true], ['Britain had to supply its army across an ocean.', true], ['The British never captured an American city.', false]], why: 'Britain took New York, Philadelphia and Charleston; but French and Spanish entry and the cost of a long war wore Britain down.' },
    { L: [3], q: 'A historian argues that the French alliance was the single most important reason for the American victory. Which evidence supports this?', a: 'A French fleet and French troops were essential to trapping Cornwallis at Yorktown.', w: ['The battle of Lexington was fought before the alliance.', 'Valley Forge was in Pennsylvania.', 'Washington crossed the Delaware in 1776.'], why: 'Evidence must link France to the outcome; Yorktown depended on French ships and soldiers. Other historians stress Washington\'s leadership and the army\'s survival too.' }
  ], 'Survive, win key fights, and gain allies.'));

  G('ush1.treaty-of-paris-1783', bank([
    {"L":[1,2,3],"q":"Which three Americans negotiated the Treaty of Paris (1783)?","a":"Benjamin Franklin, John Adams and John Jay","w":["George Washington, Thomas Jefferson and James Madison","Patrick Henry, Samuel Adams and John Hancock","Alexander Hamilton, James Monroe and Aaron Burr"],"why":"Franklin, Adams and Jay negotiated with Britain."},
    {"L":[1,2],"q":"Which war did the Treaty of Paris of 1783 end?","a":"the American Revolutionary War","w":["the French and Indian War","the War of 1812","the Mexican-American War"],"why":"It ended the Revolution and recognized independence."},
    {"L":[1,2],"q":"In which city was the treaty that ended the Revolutionary War signed?","a":"Paris","w":["London","Philadelphia","Ghent","Madrid"],"why":"It was signed in Paris on September 3, 1783."},
    {"L":[2,3],"q":"Which country got Florida back from Britain in the treaties of 1783?","a":"Spain","w":["France","the United States","the Netherlands"],"why":"Britain returned Florida to Spain."},
    { L: [1, 2], gen: function (R, lv) { return lv === 1 ? { q: 'In what year did the Treaty of Paris end the Revolutionary War?', a: '1783', w: ['1776', '1781', '1763'], why: 'The treaty was signed on September 3, 1783.' } : yearQ(R, lv, 'In what year was the Treaty of Paris that ended the Revolutionary War signed?', 1783, 'It was signed on September 3, 1783, two years after Yorktown (1781).', [1, 2, 7, 20]); } },
    { L: [1, 2, 3], q: 'Which river became the western border of the United States in 1783?', a: 'The Mississippi River', w: ['The Ohio River', 'The Hudson River', 'The Rio Grande', 'The Missouri River'], why: 'Britain gave up the land as far west as the Mississippi.', viz: { name: 'cv-map', opts: { mode: 'territory', year: 1783, quiet: true, interactive: false } } },
    { L: [1, 2], q: 'What did Britain do in Article 1 of the Treaty of Paris (1783)?', a: 'Recognized the United States as free, sovereign and independent', w: ['Gave Canada to the United States', 'Kept control of the colonies\' trade', 'Returned Florida to France'], why: 'The King "acknowledges the said United States … to be free, sovereign and independent States."' },
    { L: [2, 3], q: 'The Revolutionary War formally ended with the British surrender at Yorktown in 1781.', tf: false, why: 'False. Fighting dwindled after Yorktown, but the war formally ended with the Treaty of Paris in 1783.' },
    { L: [2, 3], q: 'Who were the three main American negotiators of the Treaty of Paris?', a: 'Benjamin Franklin, John Adams and John Jay', w: ['George Washington, Thomas Jefferson and James Madison', 'Thomas Paine, Samuel Adams and Patrick Henry', 'John Hancock, Paul Revere and John Adams'], why: 'Franklin, Adams and Jay negotiated with Britain in Paris.' },
    { L: [2, 3], q: 'Which country got Florida back in the peace of 1783?', a: 'Spain', w: ['France', 'The United States', 'Britain kept it'], why: 'Britain returned Florida to Spain in a separate treaty, so the southern U.S. border met Spanish Florida at the 31st parallel.' },
    { L: [2, 3], q: 'Native nations helped negotiate the Treaty of Paris and had their land rights protected in it.', tf: false, why: 'False. They were left out; Britain transferred claims to land Native nations still held, which led to decades of conflict.' },
    { L: [3], q: 'What did the Treaty of Paris (1783) include?', all: [['Fishing rights off Newfoundland for Americans', true], ['A promise that debts owed to British merchants would be paid', true], ['That Congress would "earnestly recommend" returning Loyalists\' property', true], ['That Canada would join the United States', false]], why: 'The treaty covered fishing, debts and Loyalist property; Canada stayed British.' },
    { L: [3], gen: function (R) { return orderQ(R, [['Treaty of Paris ends the French and Indian War', 1763], ['Declaration of Independence', 1776], ['Treaty of Alliance with France', 1778], ['British surrender at Yorktown', 1781], ['Treaty of Paris ends the Revolutionary War', 1783]], 4); } }
  ], 'Yorktown was 1781; peace came two years later.'));

  G('ush1.revolution-changes', bank([
    {"L":[1,2,3],"q":"What did many of the new state constitutions after 1776 include?","a":"a declaration or bill of rights","w":["a king or queen","an official national church","rule by Parliament"],"why":"Virginia's Declaration of Rights (1776) was an early example."},
    {"L":[1,2,3],"q":"Who wrote to her husband asking Congress to \"remember the ladies\"?","a":"Abigail Adams","w":["Martha Washington","Dolley Madison","Elizabeth Cady Stanton","Mercy Otis Warren"],"why":"She wrote to John Adams in March 1776."},
    {"L":[2,3],"q":"Which state ended slavery through court rulings in the 1780s?","a":"Massachusetts","w":["Virginia","South Carolina","Georgia","Maryland"],"why":"Court cases under the 1780 state constitution ended slavery there."},
    {"L":[2,3],"q":"Which 1787 law banned slavery in the Northwest Territory?","a":"the Northwest Ordinance","w":["the Missouri Compromise","the Land Ordinance of 1785","the Articles of Confederation"],"why":"The ordinance barred slavery north of the Ohio River."},
    { L: [1, 2], q: 'Which state passed the first law to begin ending slavery, in 1780?', a: 'Pennsylvania', w: ['Virginia', 'South Carolina', 'Georgia', 'New York'], why: 'Pennsylvania\'s Gradual Abolition Act of March 1, 1780, was the first such law in the United States.' },
    { L: [1, 2, 3], q: 'What did Virginia\'s Statute for Religious Freedom (1786) do?', a: 'It ended forced support for any church and protected freedom of belief.', w: ['It made the Church of England Virginia\'s official church.', 'It banned all churches in Virginia.', 'It required everyone to attend church.'], why: 'Drafted by Jefferson and passed with Madison\'s help, it said no one could be forced to support or attend a church.' },
    { L: [1, 2], q: 'After the Revolution, could most American women vote?', a: 'No; voting stayed mostly limited to men who owned property.', w: ['Yes, in every state', 'Yes, but only in the South'], why: 'Voting remained mostly limited to men with property: an example of continuity.' },
    { L: [2, 3], gen: function (R) { var S = [['Pennsylvania begins gradual abolition (1780)', 'Change'], ['Voting mostly limited to men with property', 'Continuity'], ['Virginia\'s Statute for Religious Freedom (1786)', 'Change'], ['Slavery legal in the Southern states', 'Continuity'], ['New written state constitutions with bills of rights', 'Change'], ['Most Americans live and work on farms', 'Continuity'], ['Massachusetts courts end slavery in the 1780s', 'Change'], ['Married women cannot own property in their own names in most states', 'Continuity']]; var s = R.pick(S); return { q: 'After the Revolution, was this a <b>change</b> or <b>continuity</b>?<br><b>' + s[0] + '</b>', a: s[1], w: [s[1] === 'Change' ? 'Continuity' : 'Change'], why: s[1] === 'Change' ? 'Something new replaced the old way: change.' : 'The old pattern lasted: continuity.' }; } },
    { L: [2, 3], q: 'Pennsylvania\'s law of 1780 freed every enslaved person in the state at once.', tf: false, why: 'False. It was gradual: children born to enslaved mothers after the law served until age 28, and those already enslaved stayed enslaved.' },
    { L: [2, 3], q: 'How did slavery end in Massachusetts in the 1780s?', a: 'Enslaved people such as Elizabeth Freeman sued under the 1780 state constitution and won.', w: ['Congress passed a law ending it.', 'The King of Britain abolished it.', 'It was never legal in Massachusetts.'], why: 'The 1780 constitution said all men are "born free and equal"; lawsuits such as Freeman\'s (1781) and the Quock Walker cases ended slavery there.' },
    { L: [2, 3], q: 'What was "republican motherhood"?', a: 'The idea that women served the republic by raising virtuous, educated citizens', w: ['A law giving women the vote', 'A political party led by women', 'A rule that only mothers could teach school'], why: 'The ideal raised the value of girls\' education while keeping women\'s role mostly in the home; the historian Linda Kerber named it in 1976.' },
    { L: [3], q: 'About what the Revolution changed:', all: [['Northern states began to end slavery.', true], ['Southern states kept slavery.', true], ['Many states wrote new constitutions with bills of rights.', true], ['All adults gained the right to vote.', false]], why: 'Change was real but uneven: voting stayed mostly limited to men with property.' },
    { L: [3], q: 'Historians disagree about how radical the Revolution was. Which statement fairly describes the debate?', a: 'Some stress the radical new ideas of equality and rights; others stress how much stayed the same, such as slavery and limits on voting.', w: ['All historians agree it changed nothing.', 'All historians agree it changed everything.', 'Historians agree the Revolution ended slavery everywhere.'], why: 'This is an open question of interpretation; both sides point to real evidence.' }
  ], 'Look for both change and continuity.'));
})(window.MathLadder);

/* ---- part B ---- */
/* U.S. History I (ush1), part B: units 5 to 8 (From Confederation to Constitution; The Early Republic; Expansion and the
   Sectional Crisis; The Civil War and Reconstruction). Problem generators, written by the part B builder; merged with part A
   by /tmp/merge_parts.js. Sources for every fact: the lessons (data/civics/lessons/ush1.json) and their source lists.
     level 1  one fact, three choices with a plainly wrong one; or put three events in order
     level 2  four choices whose wrong ones match the topic's trouble note (the neighboring year, the right law for the wrong
              purpose); order four events; type a name or a year
     level 3  choose all that are true; true or false about a near miss; order five events; read a source
   Each topic is a bank of items. Wrong choices are drawn from a pool and every order is shuffled (keep: true), so problems
   vary. Order problems use cv-order in quiet mode (lettered cards, no years shown). */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, M = Math;
  var LET = 'ABCDEFGH';
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function lettersVariants(s) { var a = s.split(''); return [s, a.join(' '), a.join(','), a.join(', '), a.join('-')]; }
  // an order problem from [[label, sortKey, shownYear], …]: pick k with distinct keys, show them shuffled, answer the letters
  function orderProblem(R, list, k, q, intro) {
    var pool = list.slice(), pick = [], keys = {};
    pool = R.shuffle(pool);
    for (var i = 0; i < pool.length && pick.length < k; i++) { var kk = String(pool[i][1]); if (!keys[kk]) { keys[kk] = 1; pick.push(pool[i]); } }
    var sorted = pick.slice().sort(function (a, b) { return a[1] - b[1]; });
    var shown; do { shown = R.shuffle(sorted.slice()); } while (shown.every(function (x, i) { return x === sorted[i]; }));
    var ans = sorted.map(function (x) { return LET.charAt(shown.indexOf(x)); }).join('');
    var start = shown.map(function (x) { return sorted.indexOf(x); });
    return {
      q: (intro ? intro + ' ' : '') + (q || 'Put these events in order, earliest first. Type the letters, for example ' + LET.slice(0, k).split('').reverse().join('') + '.'),
      a: { t: 'text', v: lettersVariants(ans) },
      viz: { name: 'cv-order', opts: { items: sorted.map(function (x) { return x[0]; }), start: start, quiet: true, interactive: false } },
      steps: sorted.map(function (x) { var yr = String(x[2] || M.floor(x[1])); return LET.charAt(shown.indexOf(x)) + ': ' + x[0] + (x[0].indexOf(yr) >= 0 ? '' : ' (' + yr + ')'); }).concat(['So the order is ' + ans + '.']),
      hint: 'Find the earliest one first. Which of these had to happen before the others could?'
    };
  }
  // one problem from a bank. Items:
  //   { L: [levels], q, a, w: [wrong pool], why, viz?, hint? }          multiple choice
  //   { L, q, tf: true|false, why }                                     true or false
  //   { L, q, all: [[text, true|false], …], why }                       choose all that are true
  //   { L, q, text: ['answer', 'variant', …], why }                     type a name (case and spacing do not matter)
  //   { L, q, year: 1820, why }                                         type a year
  //   { L, order: LIST, k: 4, q?, intro? }                              put k events in order (see orderProblem)
  //   { L, gen: function (R) { return item; } }                         an item made on the spot
  function fromBank(bank, hint0) {
    return function (R, ctx) {
      var lv = ctx.level || 1, pool = bank.filter(function (it) { return it.L.indexOf(lv) >= 0; });
      if (!pool.length) pool = bank;
      var it = R.pick(pool); if (it.gen) it = Object.assign({ L: it.L }, it.gen(R, lv));
      if (it.order) return orderProblem(R, it.order, it.k || (lv === 1 ? 3 : lv === 2 ? 4 : 5), it.q, it.intro);
      var why = Array.isArray(it.why) ? it.why : [it.why];
      var p = { q: it.q, steps: why, hint: it.hint || hint0 || 'Think back to the lesson: what happened, and when?' };
      if (it.viz) p.viz = typeof it.viz === 'function' ? it.viz(R) : it.viz;
      if (it.tf != null) { p.a = { t: 'tf', v: it.tf }; p.q = it.q + ' True or false?'; return p; }
      if (it.text) { p.a = { t: 'text', v: it.text }; return p; }
      if (it.year != null) { p.a = { t: 'num', v: String(it.year), form: 'int' }; return p; }
      if (it.all) {
        var opts = R.shuffle(it.all.slice()), v = []; opts.forEach(function (o, i) { if (o[1]) v.push(i); });
        p.q = it.q + ' Choose all that are true.'; p.a = { t: 'mc', choices: opts.map(function (o) { return o[0]; }), v: v, keep: true }; return p;
      }
      var n = lv === 1 ? 2 : 3, wrong = R.sample(it.w, M.min(n, it.w.length)), ch = R.shuffle([it.a].concat(wrong));
      if (/^[A-Z]$/.test(it.a)) ch.sort();
      p.a = { t: 'mc', choices: ch, v: ch.indexOf(it.a), keep: true };
      return p;
    };
  }
  // a quiet time line of model events and custom ones, lettered
  function tlq(events) { return { name: 'cv-timeline', opts: { events: events, letters: true, quiet: true, interactive: false, eras: false } }; }
  // a short source excerpt as a quiet cv-doc
  function docq(title, source, text, marks) { var o = { doc: { title: title, source: source, paras: [text] }, quiet: true, interactive: false }; if (marks) o.marks = marks.map(function (m) { return { text: m }; }); return { name: 'cv-doc', opts: o }; }
  function caseq(id, hide) { return { name: 'cv-case', opts: { id: id, hide: hide || ['name'], quiet: true, interactive: false } }; }
  // "Which letter on the time line marks …?": events [{ year, label }] with distinct years; the letters run in time order
  function letterItem(events, targetIdx, q) {
    var ev = events.map(function (e, i) { return Object.assign({ id: 'x' + i }, e); });
    var sorted = ev.slice().sort(function (a, b) { return a.year - b.year; });
    var L = LET.charAt(sorted.indexOf(ev[targetIdx]));
    return { q: q || 'Which letter on the time line marks ' + ev[targetIdx].label + '?', a: L, w: LET.slice(0, ev.length).split('').filter(function (x) { return x !== L; }),
      why: [sorted.map(function (e, i) { return LET.charAt(i) + ': ' + e.label + ' (' + e.year + ')'; }).join('; ') + '.', 'So ' + ev[targetIdx].label + ' is ' + L + '.'],
      viz: { name: 'cv-timeline', opts: { events: sorted.map(function (e) { return { year: e.year, label: e.label, id: e.id }; }), letters: true, quiet: true, interactive: false, eras: false } } };
  }
  function letterGen(list, n) { // list: [[label, year]] with distinct years; n events shown
    return function (R) {
      var pick = R.sample(list, n), ev = pick.map(function (x) { return { label: x[0], year: x[1] }; });
      return letterItem(ev, R.int(0, n - 1));
    };
  }

  /* ======================================================== Unit 5: From Confederation to Constitution (1781 to 1800) */
  var U5 = [
    ['Articles of Confederation take effect', 1781], ['Treaty of Paris recognizes independence', 1783], ['Land Ordinance surveys the West', 1785],
    ['Shays\' Rebellion begins in Massachusetts', 1786], ['Constitution signed in Philadelphia', 1787.7, '1787'], ['New Hampshire becomes the ninth state to ratify', 1788.5, '1788'],
    ['Washington takes office as President', 1789.3, '1789'], ['Bill of Rights ratified', 1791.9, '1791'], ['Whiskey Rebellion', 1794], ['Washington\'s Farewell Address', 1796.7, '1796'],
    ['Alien and Sedition Acts', 1798], ['Jefferson elected in the election of 1800', 1800.9, '1800']
  ];
  var U5L = [['Articles of Confederation take effect', 1781], ['Treaty of Paris', 1783], ['Shays\' Rebellion begins', 1786], ['Constitution signed', 1787], ['Ninth state ratifies', 1788],
    ['Bill of Rights ratified', 1791], ['Whiskey Rebellion', 1794], ['Alien and Sedition Acts', 1798], ['Election of 1800', 1800], ['Twelfth Amendment', 1804]];

  G('ush1.articles-of-confederation', fromBank([
    { L: [1, 2], q: 'Under the Articles of Confederation, how many votes did each state have in Congress?', a: 'One', w: ['One for each 30,000 people', 'Two', 'As many as its population allowed'], why: 'Each state had one vote, whatever its size.' },
    { L: [1, 2], q: 'What could Congress NOT do under the Articles of Confederation?', a: 'Collect taxes from the people', w: ['Make treaties', 'Declare war', 'Make peace'], why: 'Congress could make war, peace and treaties, but it could not tax. It could only ask the states for money.' },
    { L: [1, 2], q: 'In what year did the Articles of Confederation take effect?', a: '1781', w: ['1776', '1787', '1789', '1791'], why: 'Drafted in 1777, they took effect on March 1, 1781, when Maryland ratified them.' },
    { L: [1, 2], q: 'What did changing (amending) the Articles of Confederation require?', a: 'The approval of all thirteen states', w: ['A majority of the states', 'Nine of the thirteen states', 'A vote of the President and Congress'], why: 'Every state legislature had to agree, so one state could block any change.' },
    { L: [1, 2], q: 'Which branch did the Articles of Confederation create?', a: 'Only a Congress', w: ['A Congress and a President', 'A Congress, a President and a Supreme Court', 'Only a President'], why: 'There was no executive and no national court system; Congress did everything.' },
    { L: [2, 3], q: 'Key laws under the Articles, such as declaring war or making treaties, needed the votes of how many states?', a: '9', w: ['7', '13', '10', '6'], why: 'Article IX required nine of thirteen states for war, treaties, coining or borrowing money and other key measures.' },
    { L: [2, 3], q: 'Which of these was an achievement of the Confederation Congress?', a: 'Organizing the western lands with the Northwest Ordinance', w: ['Collecting a national income tax', 'Creating the Supreme Court', 'Electing the first President'], why: 'The Confederation Congress won the war, made the peace of 1783 and passed the Land and Northwest Ordinances.' },
    { L: [2, 3], q: 'A historian says the Articles\' central weakness was that Congress could not raise money or enforce its laws. Which fact supports that?', a: 'Congress could only request money from the states, which often sent far less', w: ['Congress could make treaties with other nations', 'Each state kept its own militia', 'Congress met in several different cities'], why: 'Requisitions were requests, not taxes; the states paid only part of what was asked.' },
    { L: [2, 3], q: 'The Articles say each state "retains its sovereignty, freedom, and independence." What does that tell you about the Union they made?', a: 'It was a league of states, with power kept mostly in the states', w: ['It was one nation ruled from the capital', 'It gave the President most of the power', 'It abolished the state governments'], why: 'Sovereignty stayed with the states; Congress had only the powers "expressly delegated."', viz: docq('Articles of Confederation, Article II', '1781', 'Each state retains its sovereignty, freedom, and independence, and every power, jurisdiction, and right, which is not by this Confederation expressly delegated to the United States, in Congress assembled.') },
    { L: [3], q: 'The Articles of Confederation accomplished nothing.', tf: false, why: 'False: under them the country won the war, made the Treaty of Paris (1783) and organized the West. Their weakness was a Congress that could not tax or enforce its laws.' },
    { L: [3], q: 'Under the Articles, a single state could block an amendment.', tf: true, why: 'True: amendments needed every state. Rhode Island alone blocked the 1781 plan for a tax on imports.' },
    { L: [3], q: 'About the government under the Articles of Confederation:', all: [['Each state had one vote in Congress.', true], ['Congress could not tax the people.', true], ['There was no national court system.', true], ['A President led the executive branch.', false], ['Amendments needed only nine states.', false]], why: 'One vote per state, no tax power, no executive or national courts; amendments needed all thirteen.' },
    { L: [1, 2, 3], gen: function (R) { return R.pick([
      { q: 'Sort the power: under the Articles, could Congress coin money?', a: 'Yes', w: ['No', 'Only with the King\'s approval'], why: 'Yes: Congress could coin and borrow money (with nine states), but it could not tax.' },
      { q: 'Sort the power: under the Articles, could Congress regulate trade between the states?', a: 'No', w: ['Yes', 'Only in wartime'], why: 'No: states taxed one another\'s goods, and Congress could not stop them.' },
      { q: 'Sort the power: under the Articles, could Congress make war and peace?', a: 'Yes', w: ['No', 'Only the states could'], why: 'Yes: making war, peace and treaties belonged to Congress.' }]); } }
  ], 'Remember the big weakness: Congress could ask the states for money but could not tax.'));

  G('ush1.northwest-ordinance', fromBank([
    {"L":[1,2,3],"q":"Which present-day state was not formed from the Northwest Territory?","a":"Kentucky","w":["Ohio","Indiana","Illinois","Michigan","Wisconsin"],"why":"Ohio, Indiana, Illinois, Michigan, Wisconsin and part of Minnesota came from it; Kentucky lies south of the Ohio River."},
    {"L":[1,2,3],"q":"How many square miles was a township under the Land Ordinance of 1785?","a":"36","w":["1","6","100","640"],"why":"Six miles by six miles makes 36 square miles, in 36 sections."},
    {"L":[1,2,3],"q":"Under the Land Ordinance of 1785, one section of each township was set aside to support…","a":"public schools","w":["a church","an army fort","the governor","a railroad"],"why":"Section 16 of each township was reserved for schools."},
    {"L":[1,2,3],"q":"Which was the first state formed from the Northwest Territory?","a":"Ohio","w":["Indiana","Illinois","Michigan","Wisconsin"],"why":"Ohio became a state in 1803."},
    {"L":[1,2,3],"q":"Under which government were the Land Ordinance and the Northwest Ordinance passed?","a":"the Articles of Confederation","w":["the Constitution","the British Parliament","the State of Virginia"],"why":"Both were passed by the Confederation Congress."},
    {"L":[2,3],"q":"How many free inhabitants did a territory need before it could ask to become a state?","a":"60,000","w":["5,000","20,000","100,000","1,000,000"],"why":"The Northwest Ordinance set 60,000 free inhabitants."},
    { L: [1, 2], q: 'The Land Ordinance of 1785 divided western land into townships of what shape and size?', a: 'Squares six miles on a side', w: ['Circles around each town', 'Strips along the rivers', 'Squares one hundred miles on a side'], why: 'Townships were six miles square, each cut into 36 sections of one square mile.' },
    { L: [1, 2], q: 'How did the Northwest Ordinance say new states would join the Union?', a: 'On an equal footing with the original states', w: ['As colonies of the original states', 'With half as many votes as the original states', 'Only if every original state agreed'], why: 'Article 5: new states are admitted "on an equal footing with the original States in all respects whatever."' },
    { L: [1, 2], q: 'What did the Northwest Ordinance do about slavery in the Northwest Territory?', a: 'It banned slavery there', w: ['It allowed slavery everywhere there', 'It let each settler decide', 'It said nothing about slavery'], why: 'Article 6: "There shall be neither slavery nor involuntary servitude in the said territory."' },
    { L: [1, 2], q: 'In what year was the Northwest Ordinance passed?', a: '1787', w: ['1776', '1781', '1803', '1820'], why: 'July 13, 1787, while the Constitutional Convention was meeting in Philadelphia.' },
    { L: [2, 3], q: 'Under the Northwest Ordinance, a territory could ask to become a state when it had how many free inhabitants?', a: '60,000', w: ['5,000', '30,000', '100,000'], why: 'At 5,000 free adult men it could elect an assembly; at 60,000 free inhabitants it could become a state.' },
    { L: [2, 3], q: 'One section in each township of the Land Ordinance of 1785 was set aside to support what?', a: 'Public schools', w: ['A fort', 'A church chosen by Congress', 'The governor\'s house'], why: 'Section 16 of every township was reserved for public schools.' },
    { L: [2, 3], q: 'How many acres were in one section of the Land Ordinance survey?', a: '640', w: ['160', '6', '36', '23,040'], why: 'A section is one square mile, which is 640 acres. A township of 36 sections is 23,040 acres.' },
    { L: [2, 3], q: 'Which of these states was NOT made from the Northwest Territory?', a: 'Kentucky', w: ['Ohio', 'Indiana', 'Illinois', 'Michigan', 'Wisconsin'], why: 'Kentucky lies south of the Ohio River. The Northwest Territory became Ohio, Indiana, Illinois, Michigan, Wisconsin and part of Minnesota.', hint: 'The territory lay north and west of the Ohio River.' },
    { L: [2, 3], q: 'The Northwest Ordinance\'s ban on slavery covered which land?', a: 'Only the land north and west of the Ohio River', w: ['All land west of the Appalachians', 'Every state in the Union', 'Only the original thirteen states'], why: 'It covered the Northwest Territory only; land south of the Ohio River was left open to slavery.' },
    { L: [3], q: 'New states admitted under the Northwest Ordinance had fewer rights than the original thirteen.', tf: false, why: 'False: they joined "on an equal footing with the original States in all respects whatever."' },
    { L: [3], q: 'The Northwest Ordinance required people who escaped slavery into the territory to be returned.', tf: true, why: 'True: Article 6 banned slavery but provided that people escaping from the original states "may be lawfully reclaimed."' },
    { L: [3], q: 'About the Land Ordinance (1785) and Northwest Ordinance (1787):', all: [['Land was surveyed into six-mile-square townships.', true], ['Slavery was banned in the Northwest Territory.', true], ['New states would join equal to the original ones.', true], ['They were passed by Congress under the Constitution.', false], ['They covered the land south of the Ohio River.', false]], why: 'Both were passed by the Confederation Congress, under the Articles, for the land north and west of the Ohio River.' },
    { L: [2, 3], order: [['Congress appoints a governor and judges', 1], ['The territory elects an assembly', 2], ['A delegate to Congress may speak but not vote', 3], ['The people write a state constitution', 4], ['Congress admits the new state', 5]], k: 4, intro: 'The steps from territory to state under the Northwest Ordinance.', q: 'Put these steps in order, first step first. Type the letters.' },
    { L: [1], order: [['Treaty of Paris gives the U.S. the western land', 1783], ['Land Ordinance surveys it', 1785], ['Northwest Ordinance sets the path to statehood', 1787], ['Ohio becomes the first state from the territory', 1803]], k: 3 }
  ], 'Two laws: 1785 surveyed and sold the land; 1787 governed it and set the path to statehood.'));

  G('ush1.shays-rebellion', fromBank([
    { L: [1, 2], q: 'Who rose up in Shays\' Rebellion?', a: 'Indebted farmers in western Massachusetts', w: ['British soldiers', 'Merchants in Boston', 'Sailors in the navy'], why: 'Farmers, many of them veterans, rose against their own state over debts, taxes and court seizures.' },
    { L: [1, 2], q: 'Why did the farmers in Shays\' Rebellion close the courts?', a: 'To stop the courts from taking their farms for unpaid debts and taxes', w: ['To protest British taxes on tea', 'To demand a king', 'To stop the building of canals'], why: 'Courts were foreclosing on farms and jailing debtors; closing the courts halted that.' },
    { L: [1, 2], q: 'In what years did Shays\' Rebellion take place?', a: '1786 to 1787', w: ['1775 to 1776', '1794', '1812 to 1815'], why: 'It began in August 1786 and ended in early 1787, after the failed march on Springfield.' },
    { L: [1, 2, 3], q: 'What did Shays\' Rebellion convince many leaders?', a: 'The national government under the Articles was too weak', w: ['The country should rejoin Britain', 'The states should be abolished', 'Farmers should not be allowed to vote'], why: 'Congress could not help even at its own arsenal. Leaders such as Washington agreed to attend the Convention of 1787.' },
    { L: [2, 3], q: 'Who paid for the militia that put down Shays\' Rebellion?', a: 'Boston merchants, through loans to the state', w: ['The Continental Congress', 'The British government', 'The French government'], why: 'Congress had no money or army, so Governor Bowdoin raised a militia with private loans from merchants.' },
    { L: [2, 3], q: 'What did the rebels try to capture in January 1787?', a: 'The federal arsenal at Springfield', w: ['Fort Ticonderoga', 'The State House in Philadelphia', 'Fort McHenry'], why: 'They marched on the Springfield arsenal on January 25, 1787, and were driven off by the state militia under Benjamin Lincoln.' },
    { L: [2, 3], q: 'Daniel Shays was best known as a…', a: 'farmer and former Continental Army captain', w: ['British general', 'Massachusetts governor', 'delegate to the Constitutional Convention'], why: 'Shays was a farmer from Pelham who had been a captain in the Revolution.' },
    { L: [3], q: 'Shays\' Rebellion was a battle between Americans and the British army.', tf: false, why: 'False: the war was over. It was an uprising of Massachusetts farmers against their own state.' },
    { L: [3], q: 'Shays\' Rebellion came shortly before the Constitutional Convention.', tf: true, why: 'True: it ended in early 1787; the Convention met that May.' },
    { L: [3], q: 'About Shays\' Rebellion:', all: [['Many rebels were Revolutionary War veterans.', true], ['They closed courts to stop foreclosures.', true], ['Congress sent the national army to stop them.', false], ['It made many leaders want a stronger national government.', true]], why: 'Congress had no army to send; a state militia paid for by merchants ended the revolt.' },
    { L: [1, 2], order: [['Massachusetts demands taxes in hard money', 1], ['Courts seize farms of debtors', 2], ['Farmers close county courts', 3], ['Rebels march on Springfield', 4], ['Leaders call for a stronger union', 5]], k: 4, intro: 'The chain of causes.', q: 'Put these in order, first cause first. Type the letters.' },
    { L: [2, 3], order: U5.slice(0, 7) }
  ], 'Think about who was angry at whom, and why: debts, taxes and the courts.'));

  G('ush1.constitutional-convention', fromBank([
    { L: [1, 2], q: 'Where and when did the Constitutional Convention meet?', a: 'Philadelphia, 1787', w: ['Boston, 1776', 'New York, 1789', 'Washington, D.C., 1800'], why: 'Delegates met in Philadelphia from May 25 to September 17, 1787.' },
    { L: [1, 2], q: 'Who presided over the Constitutional Convention?', a: 'George Washington', w: ['Thomas Jefferson', 'John Adams', 'Patrick Henry'], why: 'Washington was chosen to preside. Jefferson and Adams were abroad as diplomats; Henry refused to attend.' },
    { L: [1, 2], q: 'The Virginia Plan wanted seats in Congress based on…', a: 'each state\'s population', w: ['one vote per state', 'each state\'s land area', 'the wealth of each state\'s voters'], why: 'Madison\'s Virginia Plan gave larger states more seats. The New Jersey Plan wanted equal votes.' },
    { L: [1, 2, 3], q: 'What did the Great (Connecticut) Compromise create?', a: 'A House by population and a Senate with two members per state', w: ['One house with one vote per state', 'A Senate by population and a House with equal seats', 'A Congress chosen by the President'], why: 'It blended the Virginia Plan (population) and the New Jersey Plan (equality).' },
    { L: [2, 3], q: 'What did the Three-Fifths Compromise decide?', a: 'Three of every five enslaved people were counted for House seats and direct taxes', w: ['Enslaved people could vote in three-fifths of the states', 'Three-fifths of the states had to ratify', 'Slavery would end in three-fifths of the states'], why: 'It was a counting rule. It gave slaveholding states more seats; enslaved people had no vote.' },
    { L: [2, 3], q: 'Which plan wanted one house of Congress with an equal vote for every state?', a: 'The New Jersey Plan', w: ['The Virginia Plan', 'The Great Compromise', 'The Albany Plan'], why: 'William Paterson\'s New Jersey Plan kept the Articles\' equal votes.' },
    { L: [2, 3], q: 'Until what year did the Constitution bar Congress from banning the slave trade into the country?', a: '1808', w: ['1787', '1800', '1820', '1865'], why: 'Article I, Section 9: not before 1808. Congress banned the trade effective January 1, 1808.' },
    { L: [2, 3], q: 'Which state sent no delegates to the Constitutional Convention?', a: 'Rhode Island', w: ['Virginia', 'Delaware', 'New York', 'Georgia'], why: 'Rhode Island refused to take part; it was also the last state to ratify (1790).' },
    { L: [2, 3], q: 'How many delegates signed the Constitution on September 17, 1787?', a: '39', w: ['13', '55', '56', '85'], why: '55 delegates attended at some point; 39 signed. (56 signed the Declaration.)' },
    { L: [2, 3], gen: function (R) { var f = R.pick([200, 300, 400, 500]) * 1000, s = R.pick([50, 100, 150, 200, 250]) * 1000, n = f + s * 3 / 5;
      return { q: 'A state has ' + fmt(f) + ' free people and ' + fmt(s) + ' enslaved people. Under the Three-Fifths Compromise, what population counted for its House seats?', year: n,
        why: ['Free people: ' + fmt(f) + '.', 'Three-fifths of enslaved people: ' + fmt(s) + ' × 3/5 = ' + fmt(s * 3 / 5) + '.', 'Total: ' + fmt(f) + ' + ' + fmt(s * 3 / 5) + ' = ' + fmt(n) + '.'], hint: 'Count all free people, then add three of every five enslaved people.' }; } },
    { L: [3], q: 'The Three-Fifths Compromise declared in law that an enslaved person was three-fifths of a person.', tf: false, why: 'False: it was a rule for counting population for House seats and direct taxes, which gave slaveholders more power.' },
    { L: [3], q: 'The Convention was called to revise the Articles but wrote a new constitution instead.', tf: true, why: 'True: Congress had asked for revisions; the delegates replaced the Articles.' },
    { L: [3], q: 'About the Constitutional Convention:', all: [['It met in Philadelphia in 1787.', true], ['The Great Compromise created two houses.', true], ['It barred Congress from banning the slave trade before 1808.', true], ['All thirteen states sent delegates.', false], ['The final plan gave every state one vote in both houses.', false]], why: 'Rhode Island sent no one; the House is by population and the Senate equal.' },
    { L: [3], q: 'Which clause of the Constitution held the three-fifths rule?', a: 'Article I, Section 2 (apportionment of the House)', w: ['Article II, Section 1 (the President)', 'Article III (the courts)', 'The First Amendment'], why: 'Article I, Section 2, Clause 3 apportioned House seats and direct taxes. The Fourteenth Amendment replaced the rule.', viz: { name: 'cv-clause', opts: { open: 'I', highlight: 'I.2.3', quiet: true, interactive: false } } }
  ], 'Big states wanted seats by population; small states wanted equal votes. What did the compromise do?'));

  var RAT = [['Delaware', 1], ['Pennsylvania', 2], ['New Jersey', 3], ['Georgia', 4], ['Connecticut', 5], ['Massachusetts', 6], ['Maryland', 7], ['South Carolina', 8], ['New Hampshire', 9], ['Virginia', 10], ['New York', 11], ['North Carolina', 12], ['Rhode Island', 13]];
  G('ush1.ratification-debate', fromBank([
    {"L":[1,2,3],"q":"Who were the Anti-Federalists?","a":"Opponents of ratifying the Constitution as written","w":["Supporters of the new Constitution","Loyalists who wanted British rule","Members of the Supreme Court"],"why":"They feared a strong central government and wanted a bill of rights."},
    {"L":[1,2,3],"q":"Which state was the first to ratify the Constitution?","a":"Delaware","w":["Virginia","Rhode Island","New York","Massachusetts"],"why":"Delaware ratified on December 7, 1787."},
    {"L":[1,2,3],"q":"Which state was the last of the original thirteen to ratify?","a":"Rhode Island","w":["Delaware","North Carolina","New York","Georgia"],"why":"Rhode Island ratified in May 1790."},
    {"L":[2,3],"q":"Which Virginian led the opposition to ratification at Virginia's convention?","a":"Patrick Henry","w":["James Madison","George Washington","John Marshall","Thomas Jefferson"],"why":"Patrick Henry argued against ratification in 1788."},
    { L: [1, 2], q: 'Who wrote The Federalist essays?', a: 'Alexander Hamilton, James Madison and John Jay', w: ['Thomas Jefferson and John Adams', 'Patrick Henry and George Mason', 'Benjamin Franklin alone'], why: 'They wrote 85 essays under the shared pen name "Publius."' },
    { L: [1, 2], q: 'What did the Anti-Federalists most want added to the Constitution?', a: 'A bill of rights', w: ['A king', 'A stronger President', 'An end to the Senate'], why: 'Mason\'s first objection: "There is no declaration of rights." Their push led to the Bill of Rights (1791).' },
    { L: [1, 2], q: 'What pen name did the authors of The Federalist share?', text: ['Publius'], why: 'All 85 essays were signed "Publius."' },
    { L: [1, 2], q: 'How many states had to ratify for the Constitution to take effect?', a: '9', w: ['13', '7', '10'], why: 'Article VII: the ratification of nine state conventions was enough among the states that ratified.' },
    { L: [2, 3], q: 'Which state was the ninth to ratify, in June 1788?', a: 'New Hampshire', w: ['Virginia', 'New York', 'Delaware', 'Rhode Island'], why: 'New Hampshire ratified on June 21, 1788. Virginia followed four days later.' },
    { L: [2, 3], q: 'Which state ratified the Constitution first?', a: 'Delaware', w: ['Pennsylvania', 'Virginia', 'Massachusetts', 'New Hampshire'], why: 'Delaware ratified unanimously on December 7, 1787.' },
    { L: [2, 3], q: '"Brutus" and the "Federal Farmer" were…', a: 'Anti-Federalist writers', w: ['Federalist writers', 'British officials', 'Supreme Court justices'], why: 'Both wrote against the Constitution as drafted. Brutus\'s essays began in October 1787.' },
    { L: [2, 3], q: 'In Federalist No. 10, Madison argued that a large republic…', a: 'controls factions better, because no one faction can easily become a majority', w: ['cannot work, because the people are too far apart', 'needs a king to keep order', 'should let each state leave when it likes'], why: '"Extend the sphere, and you take in a greater variety of parties and interests." Brutus argued the opposite.', viz: docq('From The Federalist No. 10', 'Madison, 1787', 'Extend the sphere, and you take in a greater variety of parties and interests; you make it less probable that a majority of the whole will have a common motive to invade the rights of other citizens.') },
    { L: [2, 3], q: 'Many states ratified with a promise or recommendation. What was it?', a: 'That amendments, such as a bill of rights, would be considered', w: ['That the capital would be in their state', 'That slavery would end by 1800', 'That the Senate would be abolished'], why: 'Massachusetts started the pattern: ratify now, recommend amendments. Madison kept the promise in 1789.' },
    { L: [2, 3], q: 'Which large state ratified by a vote of 89 to 79 in June 1788, after Patrick Henry led the opposition?', a: 'Virginia', w: ['New York', 'Massachusetts', 'Pennsylvania'], why: 'Virginia ratified on June 25, 1788, 89 to 79.' },
    { L: [3], q: 'Most Anti-Federalists wanted no national government at all.', tf: false, why: 'False: most wanted a union stronger than the Articles, but with firmer limits and a bill of rights.' },
    { L: [3], q: 'The Anti-Federalists lost every point in the ratification debate.', tf: false, why: 'False: their demand for a bill of rights succeeded in 1791.' },
    { L: [3], q: 'About the ratification debate:', all: [['The Federalist was written to win ratification in New York.', true], ['Anti-Federalists feared a distant, too-powerful government.', true], ['Rhode Island was the last of the thirteen to ratify.', true], ['All thirteen states ratified within a year.', false], ['George Mason was a leading Federalist.', false]], why: 'Ratification ran from December 1787 to May 1790. Mason refused to sign and opposed ratification.' },
    { L: [3], gen: function (R) { var p = R.sample(RAT, 2), first = p[0][1] < p[1][1] ? p[0] : p[1];
      return { q: 'Which ratified the Constitution first: ' + p[0][0] + ' or ' + p[1][0] + '?', a: first[0], w: [first === p[0] ? p[1][0] : p[0][0]], why: p.slice().sort(function (x, y) { return x[1] - y[1]; }).map(function (x) { return x[0] + ' was number ' + x[1]; }).join('; ') + ' of the thirteen.' }; } },
    { L: [2, 3], order: [['Constitution signed in Philadelphia', 1787.7, 'September 1787'], ['First Federalist essay published', 1787.82, 'October 27, 1787'], ['Delaware ratifies first', 1787.93, 'December 1787'], ['New Hampshire ratifies, the ninth state', 1788.47, 'June 21, 1788'], ['Washington takes office', 1789.33, 'April 1789'], ['Rhode Island ratifies last', 1790.4, 'May 1790']] }
  ], 'Federalists defended the Constitution; Anti-Federalists wanted firmer limits and a bill of rights.'));

  G('ush1.bill-of-rights-1791', fromBank([
    { L: [1, 2], q: 'Who drafted the amendments that became the Bill of Rights?', a: 'James Madison', w: ['George Washington', 'Thomas Jefferson', 'King George III'], why: 'Madison proposed them in the House on June 8, 1789.' },
    { L: [1, 2], q: 'In what year was the Bill of Rights ratified?', a: '1791', w: ['1776', '1787', '1789', '1865'], why: 'Ten amendments were ratified by December 15, 1791.' },
    { L: [1, 2], q: 'How many amendments make up the Bill of Rights?', a: '10', w: ['12', '27', '5'], why: 'The first ten amendments. Congress proposed twelve; ten were ratified in 1791.' },
    { L: [1, 2], q: 'Which amendment protects freedom of speech and of the press?', a: 'The First Amendment', w: ['The Fourth Amendment', 'The Tenth Amendment', 'The Second Amendment'], why: 'The First Amendment protects religion, speech, press, assembly and petition.' },
    { L: [2, 3], q: 'How many amendments did Congress send to the states in 1789?', a: '12', w: ['10', '27', '9'], why: 'Twelve; ten were ratified in 1791. One of the others became the Twenty-seventh Amendment in 1992.' },
    { L: [2, 3], q: 'At first, the Bill of Rights limited…', a: 'only the national government', w: ['only the state governments', 'both the national and state governments', 'only the President'], why: 'In Barron v. Baltimore (1833) the Court held it did not bind the states. Most of it was applied to the states after the Fourteenth Amendment.' },
    { L: [2, 3], q: 'Which amendment protects against unreasonable searches and seizures?', a: 'The Fourth', w: ['The First', 'The Sixth', 'The Eighth'], why: 'The Fourth Amendment requires warrants based on probable cause.' },
    { L: [2, 3], q: 'Which amendment says powers not given to the national government are reserved to the states or the people?', a: 'The Tenth', w: ['The Ninth', 'The First', 'The Fifth'], why: 'The Tenth reserves powers; the Ninth says rights not listed are still kept by the people.' },
    { L: [2, 3], q: 'Which amendment guarantees a speedy and public trial by jury in criminal cases?', a: 'The Sixth', w: ['The Fourth', 'The Seventh', 'The Eighth'], why: 'The Sixth covers criminal trials; the Seventh covers juries in civil cases.' },
    { L: [3], q: 'The Bill of Rights was part of the Constitution signed in 1787.', tf: false, why: 'False: it was added in 1791, after the Constitution took effect.' },
    { L: [3], q: 'Anti-Federalist demands helped produce the Bill of Rights.', tf: true, why: 'True: states ratified while recommending amendments, and Madison drafted them to keep that promise.' },
    { L: [3], q: 'About the Bill of Rights:', all: [['Madison proposed it in the First Congress.', true], ['It was ratified in 1791.', true], ['It at first limited only the national government.', true], ['It ended slavery.', false], ['It was written at the Constitutional Convention.', false]], why: 'It came from the First Congress (1789) and was ratified in 1791. Slavery ended with the Thirteenth Amendment (1865).' },
    { L: [2, 3], gen: function (R) { var CV = ML.civics; if (!CV) return { q: 'Which amendment protects freedom of religion?', a: 'The First', w: ['The Fourth', 'The Tenth'], why: 'The First Amendment.' };
      var n = R.int(1, 10), am = CV.AMENDMENTS[n - 1], wr = R.sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(function (x) { return x !== n; }), 3);
      function nm(k) { return 'The ' + ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'][k - 1]; }
      return { q: 'Which amendment is this? "' + esc(am.text) + '"', a: nm(n), w: wr.map(nm), why: nm(n) + ' Amendment: ' + am.title.toLowerCase() + '.' }; } }
  ], 'Think of the dates: the Constitution in 1787, the First Congress in 1789, the amendments in 1791.'));

  G('ush1.washington-presidency', fromBank([
    { L: [1, 2], q: 'Who was the first Secretary of the Treasury?', a: 'Alexander Hamilton', w: ['Thomas Jefferson', 'Henry Knox', 'John Adams'], why: 'Hamilton ran the Treasury; Jefferson was Secretary of State and Knox Secretary of War.' },
    { L: [1, 2], q: 'What was the Whiskey Rebellion (1794)?', a: 'An uprising of western Pennsylvania farmers against a federal tax on whiskey', w: ['A war with Britain over trade', 'A protest by Boston merchants against tea', 'A rebellion of soldiers in the army'], why: 'Washington called up about 13,000 militia, and the rebels scattered.' },
    { L: [1, 2], q: 'What did Washington do at the end of his second term?', a: 'He chose to step down', w: ['He ran for a third term and won', 'He was voted out of office', 'He was removed by Congress'], why: 'He retired in 1797, setting a two-term custom.' },
    { L: [1, 2], q: 'Washington\'s first Cabinet included Jefferson, Hamilton, Knox and…', a: 'Edmund Randolph', w: ['Benjamin Franklin', 'John Marshall', 'Patrick Henry'], why: 'Randolph was the first Attorney General.' },
    { L: [2, 3], q: 'Which was part of Hamilton\'s financial plan?', a: 'A national bank and paying the states\' war debts', w: ['Ending all tariffs', 'Paying debts only to the original holders, at half value', 'Printing paper money with no backing'], why: 'Hamilton proposed taking over state debts, paying debts in full, a national bank (1791) and taxes on imports and whiskey.' },
    { L: [2, 3], q: 'What did Washington\'s Proclamation of Neutrality (1793) do?', a: 'Kept the U.S. out of the war between Britain and France', w: ['Declared war on Britain', 'Joined France against Britain', 'Ended trade with all of Europe'], why: 'He kept the country neutral, though the treaty of 1778 with France was still in force.' },
    { L: [2, 3], q: 'When did the two-term limit for presidents become part of the Constitution?', a: '1951, with the Twenty-second Amendment', w: ['1787, in Article II', '1791, in the Bill of Rights', '1804, with the Twelfth Amendment'], why: 'Until 1951 it was a custom started by Washington. Franklin Roosevelt won four elections before the amendment.' },
    { L: [2, 3], q: 'In his Farewell Address (1796), Washington warned Americans against…', a: 'the spirit of party', w: ['the Bill of Rights', 'trade with other countries', 'electing a second President'], why: '"Warn you in the most solemn manner against the baneful effects of the spirit of party."', viz: docq('From Washington\'s Farewell Address', '1796', 'Let me now take a more comprehensive view, and warn you in the most solemn manner against the baneful effects of the spirit of party, generally.') },
    { L: [2, 3], q: 'Why did the Whiskey Rebellion end so differently from Shays\' Rebellion?', a: 'The new government could call out militia to enforce a national law', w: ['The rebels won and the tax was repealed at once', 'Britain sent troops to help', 'Washington refused to act'], why: 'Under the Articles there was no force to send; in 1794 about 13,000 militia ended the revolt with little fighting.' },
    { L: [3], q: 'The Constitution of 1787 limited presidents to two terms.', tf: false, why: 'False: Washington chose to step down; the Twenty-second Amendment (1951) made it law.' },
    { L: [3], q: 'The Compromise of 1790 traded Southern support for Hamilton\'s debt plan for a capital on the Potomac River.', tf: true, why: 'True: the deal led to the Residence Act and, later, Washington, D.C.' },
    { L: [3], q: 'About Washington\'s presidency:', all: [['He formed the first Cabinet.', true], ['He signed the bill for a national bank.', true], ['He put down the Whiskey Rebellion.', true], ['He led the country into war with France.', false], ['He served three terms.', false]], why: 'He kept the country neutral and served two terms (1789 to 1797).' },
    { L: [2, 3], order: [['Washington takes the oath in New York', 1789.3, '1789'], ['Hamilton\'s report on paying the debts', 1790, '1790'], ['First Bank of the United States chartered', 1791, '1791'], ['Neutrality Proclamation', 1793, '1793'], ['Whiskey Rebellion', 1794, '1794'], ['Farewell Address published', 1796.7, '1796']] }
  ], 'Almost everything Washington did became a precedent. Which did he choose, and which did the law require?'));

  G('ush1.first-parties', fromBank([
    { L: [1, 2], q: 'Which leader headed the Federalists?', a: 'Alexander Hamilton', w: ['Thomas Jefferson', 'James Madison', 'Andrew Jackson'], why: 'Hamilton and John Adams led the Federalists; Jefferson and Madison led the Democratic-Republicans.' },
    { L: [1, 2], q: 'Which leaders founded the Democratic-Republican Party?', a: 'Thomas Jefferson and James Madison', w: ['Alexander Hamilton and John Adams', 'George Washington and Henry Knox', 'Andrew Jackson and Henry Clay'], why: 'Jefferson and Madison organized opposition to Hamilton\'s program.' },
    { L: [1, 2], q: 'Which party favored a strict reading of the Constitution?', a: 'The Democratic-Republicans', w: ['The Federalists', 'The Whigs', 'Both equally'], why: 'Jefferson argued Congress had only the powers clearly granted; Hamilton read its powers broadly.' },
    { L: [1, 2], q: 'In the 1790s, which country did the Federalists favor in foreign affairs?', a: 'Britain', w: ['France', 'Spain', 'Russia'], why: 'Federalists valued trade with Britain; Democratic-Republicans sympathized with revolutionary France.' },
    { L: [2, 3], q: 'The dispute over the national bank (1791) was about…', a: 'how broadly to read the Necessary and Proper Clause', w: ['whether to declare war on France', 'whether to free enslaved people', 'where to put the capital'], why: 'Hamilton said a bank was a proper means for listed powers; Jefferson said it was not "necessary."' },
    { L: [2, 3], q: 'Which group was strongest among merchants and in New England?', a: 'The Federalists', w: ['The Democratic-Republicans', 'The Anti-Federalists', 'The Know-Nothings'], why: 'Federalists were strongest in commercial New England; Democratic-Republicans among Southern and Western farmers.' },
    { L: [2, 3], q: 'When was today\'s Republican Party founded?', a: '1854', w: ['1792', '1800', '1828'], why: 'It began in 1854, in opposition to slavery\'s spread. It is not Jefferson\'s Democratic-Republican Party.' },
    { L: [2, 3], q: 'Which treaty with Britain (1794) did Federalists defend and Democratic-Republicans attack?', a: 'The Jay Treaty', w: ['The Treaty of Paris', 'Pinckney\'s Treaty', 'The Treaty of Ghent'], why: 'Federalists said it kept the peace and trade; critics said it gave Britain too much.' },
    { L: [3], q: 'The Constitution set up a two-party system.', tf: false, why: 'False: the Constitution says nothing about parties. They grew out of disputes in the 1790s.' },
    { L: [3], q: 'Today\'s Republican Party is the same party Jefferson founded.', tf: false, why: 'False: today\'s Republican Party began in 1854. Today\'s Democrats trace their roots to coalitions of Jefferson and Jackson.' },
    { L: [3], q: 'About the first parties:', all: [['They grew out of disputes over Hamilton\'s plans.', true], ['The French Revolution deepened the split.', true], ['Washington warned against parties.', true], ['Jefferson led the Federalists.', false], ['The Federalists favored revolutionary France.', false]], why: 'Jefferson led the Democratic-Republicans, who sympathized with France.' },
    { L: [1, 2, 3], gen: function (R) { var cards = [['A national bank is constitutional', 'Federalists'], ['Read the Constitution strictly', 'Democratic-Republicans'], ['Support commerce and manufacturing', 'Federalists'], ['An economy of independent farmers', 'Democratic-Republicans'], ['Friendly ties with Britain', 'Federalists'], ['Sympathy for the French Revolution', 'Democratic-Republicans'], ['John Adams', 'Federalists'], ['James Madison', 'Democratic-Republicans']];
      var c = R.pick(cards); return { q: 'Which party fits: "' + c[0] + '"?', a: c[1], w: [c[1] === 'Federalists' ? 'Democratic-Republicans' : 'Federalists'], why: c[0] + ': the ' + c[1] + '.' }; } }
  ], 'Hamilton\'s side: broad powers, commerce, Britain. Jefferson\'s side: strict reading, farmers, France.'));

  G('ush1.adams-and-1800', fromBank([
    { L: [1, 2], q: 'What was the XYZ Affair?', a: 'French agents demanded a bribe before talks with American diplomats', w: ['A British attack on Washington, D.C.', 'A secret plan to make Adams king', 'A tie vote in the Senate'], why: 'In 1797 to 1798, agents of the French foreign minister asked for money before negotiating. Americans were outraged.' },
    { L: [1, 2], q: 'Which laws of 1798 made it a crime to publish false, scandalous and malicious writing against the government?', a: 'The Sedition Act', w: ['The Whiskey Act', 'The Northwest Ordinance', 'The Embargo Act'], why: 'The Sedition Act was one of the Alien and Sedition Acts passed by the Federalist Congress in 1798.' },
    { L: [1, 2], q: 'Who wrote the Kentucky and Virginia Resolutions against the Alien and Sedition Acts?', a: 'Jefferson and Madison', w: ['Hamilton and Adams', 'Washington and Jay', 'Burr and Pinckney'], why: 'Jefferson wrote Kentucky\'s and Madison Virginia\'s, at first without their names.' },
    { L: [1, 2], q: 'Who won the presidency in the election of 1800?', a: 'Thomas Jefferson', w: ['John Adams', 'Aaron Burr', 'Alexander Hamilton'], why: 'Jefferson and Burr tied in electoral votes; the House chose Jefferson.' },
    { L: [2, 3], q: 'Why did the House of Representatives choose the President in 1800?', a: 'Jefferson and Burr tied in electoral votes', w: ['No one ran against Adams', 'The Senate refused to count the votes', 'Adams died before the vote'], why: 'Electors cast two votes each with no separate vote for Vice President, so the running mates tied 73 to 73.' },
    { L: [2, 3], q: 'Which amendment (1804) had electors vote separately for President and Vice President?', a: 'The Twelfth', w: ['The Tenth', 'The Eleventh', 'The Thirteenth'], why: 'The Twelfth Amendment fixed the flaw the 1800 tie exposed.' },
    { L: [2, 3], q: 'Why is the election of 1800 a landmark?', a: 'Power passed peacefully from one party to another by an election', w: ['It was the first election with a President', 'It ended the Federalist Party that same year', 'Women voted in it for the first time'], why: 'The Federalists lost and handed power to the Democratic-Republicans without violence.' },
    { L: [2, 3], q: 'What was the Quasi-War?', a: 'An undeclared naval war with France (1798 to 1800)', w: ['A border war with Spain', 'A rebellion in Kentucky', 'A war with Britain on the Great Lakes'], why: 'American and French ships fought at sea; Adams made peace with the Convention of 1800.' },
    { L: [2, 3], q: 'The Kentucky and Virginia Resolutions argued that…', a: 'states could judge when the national government overstepped the Constitution', w: ['the President should have a third term', 'the Supreme Court must approve every law', 'the states should rejoin Britain'], why: 'They called the Alien and Sedition Acts unconstitutional and claimed a role for the states in saying so.' },
    { L: [2, 3], q: 'How many ballots did the House take before choosing Jefferson in February 1801?', a: '36', w: ['1', '12', '73'], why: 'The deadlock lasted from February 11 to 17, 1801; Jefferson won on the 36th ballot.' },
    { L: [3], q: 'In 1800, the Federalists refused to hand over power.', tf: false, why: 'False: they handed it over peacefully, the first such transfer between parties.' },
    { L: [3], q: 'Under the original Constitution, the runner-up in the electoral vote became Vice President.', tf: true, why: 'True: that is how Jefferson became Adams\'s Vice President in 1797.' },
    { L: [3], q: 'About the Adams years and 1800:', all: [['Adams was a Federalist.', true], ['The Sedition Act was used against Republican editors.', true], ['Adams made peace with France in 1800.', true], ['Burr became President after the tie.', false], ['The Alien and Sedition Acts were passed by Democratic-Republicans.', false]], why: 'The Federalist Congress passed the acts; the House chose Jefferson, and Burr became Vice President.' },
    { L: [2, 3], q: 'Look at the electoral votes of 1800. Why was there no winner?', a: 'The top two candidates had the same number', w: ['Adams had the most votes but lost', 'No one got any votes', 'There were more votes than electors'], why: 'Jefferson 73, Burr 73: a tie for first.', viz: { name: 'cv-ec', opts: { mode: 'results', election: 1800, interactive: false } } },
    { L: [1, 2, 3], gen: letterGen(U5L, 4) }
  ], 'Think about the two parties: which one held power in 1798, and which won in 1800?'));

  /* ======================================================== Unit 6: The Early Republic (1800 to 1848) */
  var U6 = [
    ['Marbury v. Madison', 1803.15, 'February 1803'], ['Louisiana Purchase', 1803.33, 'April 1803'], ['Lewis and Clark set out', 1804], ['Embargo Act', 1807], ['War of 1812 begins', 1812],
    ['Treaty of Ghent signed', 1814.98, 'December 1814'], ['Battle of New Orleans', 1815.02, 'January 1815'], ['McCulloch v. Maryland', 1819], ['Missouri Compromise', 1820],
    ['Monroe Doctrine', 1823], ['Erie Canal opens', 1825], ['Jackson becomes President', 1829], ['Indian Removal Act', 1830], ['The Liberator first published', 1831],
    ['Jackson vetoes the Bank recharter', 1832], ['Trail of Tears', 1838], ['Seneca Falls Convention', 1848]
  ];
  var U6L = [['Louisiana Purchase', 1803], ['War of 1812 begins', 1812], ['McCulloch v. Maryland', 1819], ['Monroe Doctrine', 1823], ['Erie Canal opens', 1825], ['Jackson becomes President', 1829],
    ['Indian Removal Act', 1830], ['Bank veto', 1832], ['Trail of Tears begins', 1838], ['Seneca Falls Convention', 1848]];

  G('ush1.jefferson-louisiana', fromBank([
    { L: [1, 2], q: 'From which country did the United States buy Louisiana in 1803?', a: 'France', w: ['Spain', 'Britain', 'Mexico'], why: 'Napoleon\'s France sold it for about \\$15 million.' },
    { L: [1, 2], q: 'About how much did the United States pay for the Louisiana Purchase?', a: '\\$15 million', w: ['\\$15 thousand', '\\$7.2 million', '\\$150 million'], why: 'About \\$15 million for some 828,000 square miles.' },
    { L: [1, 2], q: 'What did the Louisiana Purchase do to the size of the United States?', a: 'It roughly doubled it', w: ['It added one small state', 'It cut it in half', 'It added only the city of New Orleans'], why: 'About 828,000 square miles, roughly the size of the whole country before.' },
    { L: [1, 2], q: 'Who led the expedition that explored the Louisiana Purchase (1804 to 1806)?', a: 'Meriwether Lewis and William Clark', w: ['Daniel Boone and Davy Crockett', 'Zebulon Pike and John Frémont', 'Henry Hudson and John Cabot'], why: 'Jefferson sent Lewis and Clark up the Missouri River and on to the Pacific.' },
    { L: [1, 2, 3], q: 'In what year was the Louisiana Purchase made?', year: 1803, why: 'The treaty was signed in 1803 and approved by the Senate that October.' },
    { L: [2, 3], q: 'Why did Jefferson want New Orleans so badly?', a: 'Western farmers shipped their crops down the Mississippi through its port', w: ['It was the national capital', 'It had the country\'s richest gold mines', 'It controlled the Erie Canal'], why: 'Whoever held New Orleans held the West\'s trade route to the sea.' },
    { L: [2, 3], q: 'Why did the purchase trouble Jefferson\'s own view of the Constitution?', a: 'The Constitution did not list a power to buy territory', w: ['The Constitution banned all treaties with France', 'He thought only states could buy land', 'The Senate had already said no'], why: 'As a strict constructionist he doubted it was allowed; he drafted an amendment, then relied on the treaty power.' },
    { L: [2, 3], q: 'Why did Napoleon sell all of Louisiana?', a: 'He had lost an army in Haiti and expected war with Britain', w: ['The United States had defeated France in battle', 'Spain forced him to', 'He wanted to buy Florida from the U.S.'], why: 'The revolution in Saint-Domingue (Haiti) wrecked his plans for an American empire, and he needed money for war.' },
    { L: [2, 3], q: 'Which Shoshone woman traveled with Lewis and Clark and helped the expedition?', text: ['Sacagawea', 'Sacajawea', 'Sakakawea'], why: 'Sacagawea traveled with her husband and infant son and helped the party, above all with the Shoshone.' },
    { L: [3], q: 'The Louisiana Purchase was the land of the present state of Louisiana.', tf: false, why: 'False: it stretched from the Mississippi to the Rockies; all or part of fifteen states came from it.' },
    { L: [3], q: 'Which of these states came, at least in part, from the Louisiana Purchase?', all: [['Missouri', true], ['Nebraska', true], ['Montana', true], ['Ohio', false], ['California', false]], why: 'Missouri, Nebraska and Montana lie west of the Mississippi in the Missouri basin. Ohio came from the Northwest Territory; California from the Mexican Cession.' },
    { L: [3], q: 'The Senate approved the Louisiana Purchase treaty.', tf: true, why: 'True: 24 to 7, in October 1803.' },
    { L: [2, 3], q: 'On the map, which area is marked "?"', a: 'The Louisiana Purchase', w: ['The Mexican Cession', 'The Oregon Country', 'Florida'], why: 'The land west of the Mississippi to the Rockies, bought from France in 1803.', viz: { name: 'cv-map', opts: { mode: 'territory', year: 1803, show: ['treaty1783', 'louisiana'], ask: 'louisiana', quiet: true, interactive: false } } },
    { L: [1, 2], order: U6.slice(0, 6), k: 3 }
  ], 'Think about the Mississippi River and the port at its mouth.'));

  G('ush1.marshall-court', fromBank([
    {"L":[1,2,3],"q":"In what year was Marbury v. Madison decided?","a":"1803","w":["1787","1819","1824","1857"],"why":"Marbury v. Madison was decided in 1803."},
    {"L":[1,2,3],"q":"Which case held that a state may not tax the national bank?","a":"McCulloch v. Maryland","w":["Marbury v. Madison","Gibbons v. Ogden","Dred Scott v. Sandford"],"why":"McCulloch (1819): \"the power to tax involves the power to destroy.\""},
    {"L":[1,2,3],"q":"Marshall's major rulings mostly strengthened…","a":"the national government and the Supreme Court","w":["the power of the states over the nation","the power of the President over Congress","the British Crown"],"why":"Marbury, McCulloch and Gibbons all built up national and judicial power."},
    { L: [1, 2], q: 'Which case established judicial review, the Court\'s power to refuse to enforce a law that conflicts with the Constitution?', a: 'Marbury v. Madison', w: ['McCulloch v. Maryland', 'Gibbons v. Ogden', 'Dred Scott v. Sandford'], why: 'Marbury v. Madison (1803).' },
    { L: [1, 2], q: 'Who was Chief Justice from 1801 to 1835?', a: 'John Marshall', w: ['John Jay', 'Roger Taney', 'Thomas Jefferson'], why: 'John Marshall, the longest-serving Chief Justice. Roger Taney followed him.' },
    { L: [1, 2], q: 'McCulloch v. Maryland (1819) upheld what?', a: 'A national bank chartered by Congress', w: ['A state monopoly on steamboats', 'A state law banning the bank', 'The Sedition Act'], why: 'Congress could charter the bank under the Necessary and Proper Clause, and Maryland could not tax it.' },
    { L: [1, 2], q: 'Gibbons v. Ogden (1824) was about…', a: 'steamboats and the power to regulate interstate commerce', w: ['a national bank', 'a judge\'s commission', 'the removal of the Cherokee'], why: 'The Court held that commerce includes navigation, so a federal license beat New York\'s monopoly.' },
    { L: [2, 3], text: ['Marbury v. Madison', 'Marbury v Madison', 'Marbury'], q: 'Type the name of the case in which Marshall wrote, "It is emphatically the province and duty of the Judicial Department to say what the law is."', why: 'Marbury v. Madison (1803).' },
    { L: [2, 3], q: 'Which clause did McCulloch v. Maryland read broadly to uphold the bank?', a: 'The Necessary and Proper Clause', w: ['The Commerce Clause', 'The First Amendment', 'The Fugitive Slave Clause'], why: 'Congress may use reasonable means to carry out its listed powers, such as taxing and borrowing.' },
    { L: [2, 3], q: 'In McCulloch, Marshall wrote that "the power to tax involves the power to…"', a: 'destroy', w: ['govern', 'borrow', 'regulate'], why: 'If a state could tax a federal bank, it could tax it out of existence.' },
    { L: [2, 3], q: 'Why did Marshall rule that the Court could not order Madison to deliver Marbury\'s commission?', a: 'The law giving the Court that power conflicted with Article III, so it was void', w: ['Marbury had no right to the job', 'The President told the Court to stop', 'The commission had been delivered after all'], why: 'Part of the Judiciary Act of 1789 enlarged the Court\'s original jurisdiction beyond what Article III allows.' },
    { L: [2, 3], q: 'Which case is described? "A federal coasting license overrides a state-granted steamboat monopoly."', a: 'Gibbons v. Ogden', w: ['McCulloch v. Maryland', 'Marbury v. Madison', 'Worcester v. Georgia'], why: 'Gibbons v. Ogden (1824), the first great commerce clause case.', viz: caseq('gibbons', ['name']) },
    { L: [3], q: 'The Constitution says in so many words that courts may strike down laws.', tf: false, why: 'False: judicial review is not spelled out. Marshall reasoned it from the Constitution as supreme law and the judges\' duty to decide cases.' },
    { L: [3], q: 'Overall, the Marshall Court\'s great cases strengthened the national government.', tf: true, why: 'True: Marbury, McCulloch and Gibbons each expanded the reach of the Court or of Congress.' },
    { L: [3], q: 'About the Marshall Court:', all: [['Marbury v. Madison came in 1803.', true], ['McCulloch v. Maryland said a state could not tax the national bank.', true], ['Gibbons v. Ogden read the commerce power broadly.', true], ['Marshall was appointed by Thomas Jefferson.', false], ['Marbury ordered Madison to deliver the commission.', false]], why: 'John Adams appointed Marshall; Marbury ended with no order to Madison.' },
    { L: [2, 3], gen: function (R) { var C = [['Marbury v. Madison', 1803], ['McCulloch v. Maryland', 1819], ['Gibbons v. Ogden', 1824], ['Worcester v. Georgia', 1832]], c = R.pick(C);
      return { q: 'In what year was ' + c[0] + ' decided?', a: String(c[1]), w: C.filter(function (x) { return x !== c; }).map(function (x) { return String(x[1]); }), why: c[0] + ' was decided in ' + c[1] + '.' }; } },
    { L: [1, 2, 3], order: [['Marbury v. Madison', 1803], ['McCulloch v. Maryland', 1819], ['Gibbons v. Ogden', 1824], ['Worcester v. Georgia', 1832], ['Marshall dies; Taney becomes Chief Justice', 1835.5, '1835 to 1836']], intro: 'The Marshall Court.', q: 'Put these in order, earliest first. Type the letters.' }
  ], 'Match the case to its subject: a judge\'s commission, a bank, or steamboats.'));

  G('ush1.war-of-1812', fromBank([
    {"L":[1,2,3],"q":"Which American general won the Battle of New Orleans in January 1815?","a":"Andrew Jackson","w":["William Henry Harrison","Winfield Scott","Zachary Taylor","Ulysses S. Grant"],"why":"Jackson's victory came after the peace treaty was signed but before the news arrived."},
    {"L":[1,2,3],"q":"Which song did Francis Scott Key write during the bombardment of Fort McHenry in 1814?","a":"\"The Star-Spangled Banner\"","w":["\"Yankee Doodle\"","\"America the Beautiful\"","\"My Country, 'Tis of Thee\""],"why":"It became the national anthem in 1931."},
    {"L":[1,2,3],"q":"Who was President during the War of 1812?","a":"James Madison","w":["Thomas Jefferson","John Adams","James Monroe","Andrew Jackson"],"why":"Madison asked Congress to declare war in June 1812."},
    {"L":[1,2,3],"q":"Which Shawnee leader built a confederacy to resist American expansion and allied with Britain?","a":"Tecumseh","w":["Pontiac","Metacom","Sequoyah","Black Hawk"],"why":"Tecumseh was killed at the Battle of the Thames in 1813."},
    {"L":[2,3],"q":"Which American ship, nicknamed \"Old Ironsides,\" won fame in the war?","a":"the USS Constitution","w":["the USS Maine","the Monitor","the Mayflower"],"why":"The Constitution defeated several British ships."},
    { L: [1, 2], q: 'Which country did the United States fight in the War of 1812?', a: 'Britain', w: ['France', 'Spain', 'Mexico'], why: 'The U.S. declared war on Britain in June 1812.' },
    { L: [1, 2], q: 'What was impressment?', a: 'The British navy forcing sailors off American ships to serve', w: ['A tax on American tea', 'Paying soldiers with land', 'A ban on American cotton'], why: 'Impressment was one of the main causes of the war.' },
    { L: [1, 2], q: 'Which treaty ended the War of 1812?', a: 'The Treaty of Ghent', w: ['The Treaty of Paris', 'The Treaty of Guadalupe Hidalgo', 'The Jay Treaty'], why: 'Signed December 24, 1814, it restored the prewar borders.' },
    { L: [1, 2], q: 'What happened in Washington, D.C., in August 1814?', a: 'British troops burned public buildings, including the White House and the Capitol', w: ['The Treaty of Ghent was signed', 'Congress declared war', 'Jackson defeated the British'], why: 'The British burned the city on August 24, 1814.' },
    { L: [2, 3], q: 'Which was a cause of the War of 1812?', a: 'British support for Native resistance in the West', w: ['A dispute over the Mexican border', 'The Louisiana Purchase', 'A tax on whiskey'], why: 'War Hawks blamed Britain for aiding the confederacy led by Tecumseh.' },
    { L: [2, 3], q: 'Who led a confederacy of Native nations against American expansion and was killed at the Battle of the Thames (1813)?', a: 'Tecumseh', w: ['Sequoyah', 'Sitting Bull', 'Pontiac'], why: 'The Shawnee leader Tecumseh allied with Britain; his death broke the confederacy.' },
    { L: [2, 3], q: 'Why did the Battle of New Orleans (January 8, 1815) not change the peace terms?', a: 'The treaty had already been signed in December 1814', w: ['The British won it', 'It was fought in Canada', 'Congress ignored it'], why: 'News crossed the Atlantic slowly; the treaty had been signed two weeks before.' },
    { L: [2, 3], q: 'What did the Treaty of Ghent do to borders?', a: 'It restored the borders from before the war', w: ['It gave Canada to the U.S.', 'It gave Michigan to Britain', 'It split the Louisiana Purchase'], why: 'Neither side gained land.' },
    { L: [2, 3], q: 'Which region of the country mostly opposed the war?', a: 'New England', w: ['The West', 'The South', 'Kentucky and Tennessee'], why: 'Merchants lived by trade, and New England Federalists met at the Hartford Convention to protest.' },
    { L: [2, 3], q: 'Francis Scott Key wrote "The Star-Spangled Banner" after watching which fort hold?', a: 'Fort McHenry', w: ['Fort Sumter', 'Fort Ticonderoga', 'Fort Detroit'], why: 'Fort McHenry, in Baltimore, held in September 1814.' },
    { L: [3], q: 'The Battle of New Orleans was fought before the Treaty of Ghent was signed.', tf: false, why: 'False: the treaty was signed December 24, 1814; the battle came on January 8, 1815.' },
    { L: [3], q: 'The War of 1812 helped end the Federalist Party.', tf: true, why: 'True: the Hartford Convention made Federalists look disloyal just as peace was announced.' },
    { L: [3], q: 'About the War of 1812:', all: [['Impressment was a cause.', true], ['The British burned Washington.', true], ['The treaty restored prewar borders.', true], ['The U.S. gained Canada.', false], ['It began in 1815.', false]], why: 'It ran from 1812 to 1815 and changed no borders.' },
    { L: [2, 3], order: [['Embargo Act', 1807], ['War declared', 1812.46, 'June 1812'], ['Perry\'s victory on Lake Erie', 1813.7, 'September 1813'], ['Washington burned', 1814.65, 'August 1814'], ['Treaty of Ghent signed', 1814.98, 'December 24, 1814'], ['Battle of New Orleans', 1815.02, 'January 8, 1815']] }
  ], 'Remember the order at the end: the treaty in December 1814, the battle in January 1815.'));

  G('ush1.monroe-years', fromBank([
    { L: [1, 2], q: 'What did the Missouri Compromise (1820) do?', a: 'Admitted Missouri as a slave state and Maine as a free state', w: ['Ended slavery in Missouri', 'Admitted California as a free state', 'Let each territory vote on slavery'], why: 'It kept the Senate balanced and drew the 36°30′ line.' },
    { L: [1, 2], q: 'What did the Monroe Doctrine (1823) warn?', a: 'European powers should not start new colonies in the Americas', w: ['The U.S. would take over Canada', 'The U.S. would join Europe\'s wars', 'Mexico must sell California'], why: 'The American continents were "not to be considered as subjects for future colonization."' },
    { L: [1, 2], q: 'Which leader proposed the "American System" of a bank, tariffs and roads and canals?', a: 'Henry Clay', w: ['Andrew Jackson', 'John C. Calhoun', 'Thomas Jefferson'], why: 'Clay\'s plan aimed to tie the regions together in one national economy.' },
    { L: [1, 2], q: 'What line did the Missouri Compromise draw across the Louisiana Purchase?', a: '36°30′ north', w: ['49° north', 'The Ohio River', '54°40′ north'], why: 'North of 36°30′ (except Missouri), slavery was banned.' },
    { L: [2, 3], q: 'Why did Missouri\'s request to join as a slave state cause a crisis in 1819?', a: 'It would upset the even balance of free and slave states in the Senate', w: ['Missouri was outside the Louisiana Purchase', 'Missouri wanted to join Mexico', 'Missouri had too few people'], why: 'There were eleven free and eleven slave states.' },
    { L: [2, 3], q: 'Who drafted much of the Monroe Doctrine?', a: 'Secretary of State John Quincy Adams', w: ['Henry Clay', 'Andrew Jackson', 'John Marshall'], why: 'Adams wanted an American policy of its own rather than a joint statement with Britain.' },
    { L: [2, 3], q: 'Under the Missouri Compromise, was slavery allowed in the land that later became Kansas?', a: 'No, it lay north of 36°30′', w: ['Yes, it lay south of 36°30′', 'Yes, because it was part of Missouri', 'It was not part of the Louisiana Purchase'], why: 'Kansas lies north of the line, so slavery was banned there until the Kansas-Nebraska Act (1854).' },
    { L: [2, 3], q: 'Which act repealed the Missouri Compromise line?', a: 'The Kansas-Nebraska Act (1854)', w: ['The Compromise of 1850', 'The Indian Removal Act (1830)', 'The Homestead Act (1862)'], why: 'It let settlers vote on slavery, replacing the line with popular sovereignty.' },
    { L: [2, 3], q: 'Why was Monroe\'s time called the "Era of Good Feelings"?', a: 'One party dominated after the Federalists faded', w: ['There were no disputes at all', 'Slavery had ended', 'The country was at war and united'], why: 'A Boston newspaper used the phrase in 1817; under it, sectional and economic quarrels grew.' },
    { L: [3], q: 'The Missouri Compromise settled the question of slavery in the West for good.', tf: false, why: 'False: it postponed the conflict; the Kansas-Nebraska Act repealed it in 1854.' },
    { L: [3], q: 'Maine was admitted as a free state as part of the Missouri Compromise.', tf: true, why: 'True: Maine (1820) balanced Missouri (1821).' },
    { L: [3], q: 'About the Monroe years:', all: [['The Monroe Doctrine opposed new European colonies in the Americas.', true], ['The Missouri Compromise drew the 36°30′ line.', true], ['Henry Clay promoted the American System.', true], ['The Missouri Compromise banned slavery in Missouri.', false], ['The Monroe Doctrine started a war with Spain.', false]], why: 'Missouri entered as a slave state; the Doctrine was a warning, not a war.' },
    { L: [1, 2, 3], order: [['War of 1812 ends', 1815], ['Era of Good Feelings named', 1817], ['Missouri asks to join; crisis begins', 1819], ['Missouri Compromise', 1820], ['Monroe Doctrine', 1823]] }
  ], 'Three different things: an economic plan (Clay), a deal over slavery (Missouri), and a warning to Europe (Monroe).'));

  G('ush1.market-revolution', fromBank([
    { L: [1, 2], q: 'Which canal, opened in 1825, linked the Hudson River to Lake Erie?', a: 'The Erie Canal', w: ['The Panama Canal', 'The Suez Canal', 'The Chesapeake Canal'], why: 'The Erie Canal ran from Albany to Buffalo.' },
    { L: [1, 2], q: 'Who invented the cotton gin in 1793?', a: 'Eli Whitney', w: ['Robert Fulton', 'Samuel Morse', 'Francis Cabot Lowell'], why: 'Whitney\'s gin pulled seeds out of short-staple cotton.' },
    { L: [1, 2], q: 'At the first Lowell textile mills, most workers were…', a: 'young women from New England farm families', w: ['enslaved people', 'recent immigrants from China', 'retired soldiers'], why: 'The "mill girls" lived in boardinghouses; later, Irish immigrants took many of the jobs.' },
    { L: [1, 2], q: 'What did the cotton gin do?', a: 'Separated cotton seeds from the fibers quickly', w: ['Spun cotton into thread', 'Wove cloth', 'Planted cotton seeds'], why: 'One worker could clean about 50 pounds a day instead of about one by hand.' },
    { L: [2, 3], q: 'What happened to slavery after the cotton gin?', a: 'It grew rapidly, as cotton spread across the Deep South', w: ['It ended, because machines replaced workers', 'It stayed the same size', 'It moved to New England'], why: 'From about 700,000 enslaved people in 1790 to about 4 million in 1860.' },
    { L: [2, 3], q: 'How did the Erie Canal change the cost of shipping a ton of freight from Buffalo to New York City?', a: 'From about \\$100 by wagon to about \\$10 by canal', w: ['From about \\$10 to about \\$100', 'It did not change', 'From about \\$1,000 to about \\$900'], why: 'Cheap transport let western farmers sell in the East and made New York the largest port.' },
    { L: [2, 3], q: 'Which region specialized in factory-made cloth in the national market?', a: 'New England', w: ['The Deep South', 'The Old Northwest', 'Texas'], why: 'Mills at Waltham and Lowell, Massachusetts, led the way.' },
    { L: [2, 3], q: 'Whose steamboat began regular service on the Hudson River in 1807?', a: 'Robert Fulton\'s', w: ['Eli Whitney\'s', 'Samuel Morse\'s', 'Henry Clay\'s'], why: 'Fulton\'s steamboat made upriver travel fast and practical.' },
    { L: [2, 3], q: 'What message did Samuel Morse send on the first telegraph line, Washington to Baltimore, in 1844?', a: '"What hath God wrought"', w: ['"Mr. Watson, come here"', '"One small step"', '"Remember the Alamo"'], why: 'May 24, 1844. ("Mr. Watson, come here" was Bell\'s telephone, 1876.)' },
    { L: [3], q: 'The cotton gin reduced the number of enslaved people because it saved labor.', tf: false, why: 'False: it made cotton profitable across the South, so demand for enslaved field workers grew.' },
    { L: [3], q: 'The market revolution tied the economies of the North and the South together.', tf: true, why: 'True: Northern mills and banks depended on Southern cotton, and planters sold to Northern and British mills.' },
    { L: [3], q: 'About the market revolution:', all: [['Canals and railroads lowered shipping costs.', true], ['Textile mills grew in New England.', true], ['Cotton and slavery spread into the Deep South.', true], ['Most Americans already bought everything in stores in 1800.', false], ['The first railroads came after the Civil War.', false]], why: 'Railroads began about 1830; in 1800 most families made much of what they used.' },
    { L: [1, 2, 3], gen: function (R) { var c = R.pick([['Textile mills at Lowell', 'North'], ['Banking and shipping in New York City', 'North'], ['Cotton grown by enslaved workers', 'South'], ['Plantations spreading into Alabama and Mississippi', 'South'], ['Family farms growing wheat and corn for market', 'West (the Old Northwest)'], ['Hogs packed in Cincinnati and shipped east', 'West (the Old Northwest)']]);
      return { q: 'In the national market of the 1830s and 1840s, which region does this describe? "' + c[0] + '"', a: c[1], w: ['North', 'South', 'West (the Old Northwest)'].filter(function (x) { return x !== c[1]; }), why: c[0] + ': the ' + c[1] + '.' }; } },
    { L: [1, 2, 3], order: [['Cotton gin', 1793], ['Fulton\'s steamboat', 1807], ['Erie Canal opens', 1825], ['Baltimore and Ohio Railroad begins service', 1830], ['Morse\'s telegraph', 1844]] }
  ], 'Think about what each invention or route made cheaper or faster, and who benefited.'));

  G('ush1.jacksonian-democracy', fromBank([
    { L: [1, 2], q: 'What was the spoils system?', a: 'Giving government jobs to the winning party\'s supporters', w: ['Paying soldiers with captured goods', 'Taxing imports from Britain', 'Choosing judges by exam'], why: '"To the victor belong the spoils": Jackson defended rotating loyal supporters into office.' },
    { L: [1, 2], q: 'Which institution did Jackson fight in the "Bank War"?', a: 'The Second Bank of the United States', w: ['The Bank of England', 'The Federal Reserve', 'The New York Stock Exchange'], why: 'He vetoed its recharter in July 1832 and removed federal deposits from it.' },
    { L: [1, 2], q: 'Which state tried to nullify a federal tariff in 1832?', a: 'South Carolina', w: ['Massachusetts', 'Georgia', 'Pennsylvania'], why: 'A South Carolina convention declared the tariffs of 1828 and 1832 void in the state.' },
    { L: [1, 2], q: 'In the 1820s, many states dropped property requirements for voting. Who gained the vote?', a: 'White men without property', w: ['Women', 'Enslaved people', 'Everyone over 18'], why: 'Voting widened for white men; women and most Black Americans could not vote.' },
    { L: [2, 3], q: 'Who led the opposition party, the Whigs?', a: 'Henry Clay and Daniel Webster', w: ['Andrew Jackson and Martin Van Buren', 'Thomas Jefferson and James Madison', 'John Brown and Frederick Douglass'], why: 'The Whigs formed in the 1830s against "King Andrew."' },
    { L: [2, 3], q: 'Why did Jackson\'s supporters call the election of 1824 a "corrupt bargain"?', a: 'The House chose John Quincy Adams, who then made Henry Clay Secretary of State', w: ['Jackson won but was not allowed to serve', 'Adams bribed the electors with money', 'The Senate cancelled the election'], why: 'Jackson led in electoral and popular votes but lacked a majority; Clay backed Adams in the House.' },
    { L: [2, 3], q: 'How did the Nullification Crisis end (1833)?', a: 'A compromise tariff along with the Force Bill', w: ['South Carolina left the Union', 'The Supreme Court struck down all tariffs', 'Jackson resigned'], why: 'Clay\'s Compromise Tariff lowered rates; the Force Bill authorized enforcement. South Carolina backed down.' },
    { L: [2, 3], q: 'Who wrote the theory of nullification and was Jackson\'s Vice President?', a: 'John C. Calhoun', w: ['Henry Clay', 'Daniel Webster', 'Martin Van Buren'], why: 'Calhoun of South Carolina argued a state could declare a federal law void inside its borders.' },
    { L: [2, 3], q: 'What happened to free Black men\'s voting rights in several states in this era?', a: 'They were restricted or taken away', w: ['They were expanded everywhere', 'Black men gained the vote in the South', 'Nothing changed'], why: 'New York (1821) required \\$250 in property of Black men only; Pennsylvania (1838) limited voting to white men.' },
    { L: [3], q: 'Jacksonian democracy gave the vote to all adults.', tf: false, why: 'False: it widened voting for white men, while free Black men lost the vote in several states and women could not vote.' },
    { L: [3], q: 'Jackson used the veto on policy grounds, not only constitutional ones.', tf: true, why: 'True: earlier presidents vetoed mainly on constitutional grounds; critics saw Jackson\'s vetoes as executive overreach.' },
    { L: [3], q: 'About the Jackson years:', all: [['Jackson vetoed the recharter of the Second Bank.', true], ['The Whigs formed in opposition to Jackson.', true], ['Jackson threatened force against nullification.', true], ['Jackson supported South Carolina\'s nullification.', false], ['The House chose Jackson in 1824.', false]], why: 'Jackson called nullification treason; the House chose Adams in 1824, and Jackson won in 1828.' },
    { L: [2, 3], q: 'Look at the electoral votes of 1824. Why did the House choose the President?', a: 'No candidate had a majority', w: ['Jackson had a majority but refused', 'There was a tie between two candidates', 'The Senate rejected the results'], why: 'Jackson 99, Adams 84, Crawford 41, Clay 37: no one had a majority (131 of the 261).', viz: { name: 'cv-ec', opts: { mode: 'results', election: 1824, interactive: false } } },
    { L: [1, 2, 3], order: [['Election of 1824 goes to the House', 1824], ['Tariff of Abominations', 1828], ['Jackson takes office', 1829], ['Bank veto', 1832.5], ['Force Bill and Compromise Tariff', 1833]] }
  ], 'Ask "democracy for whom?" and think about Jackson\'s three big fights: the Bank, South Carolina and removal.'));

  G('ush1.indian-removal', fromBank([
    {"L":[1,2,3],"q":"In what year was the Indian Removal Act passed?","a":"1830","w":["1803","1819","1848","1865"],"why":"Congress passed it in 1830."},
    {"L":[1,2,3],"q":"Which five southeastern nations were forced west in the removals of the 1830s?","a":"the Cherokee, Chickasaw, Choctaw, Creek (Muscogee) and Seminole","w":["the Lakota, Cheyenne, Arapaho, Crow and Pawnee","the Mohawk, Oneida, Onondaga, Cayuga and Seneca","the Navajo, Apache, Hopi, Zuni and Ute"],"why":"All five were moved to Indian Territory."},
    {"L":[1,2,3],"q":"Which 1832 case held that Georgia's laws had no force on Cherokee land?","a":"Worcester v. Georgia","w":["Marbury v. Madison","McCulloch v. Maryland","Gibbons v. Ogden"],"why":"Georgia ignored the ruling, and removal went ahead."},
    {"L":[2,3],"q":"Which Cherokee leader fought removal in the courts and in Washington?","a":"John Ross","w":["Tecumseh","Osceola","Sequoyah","Black Hawk"],"why":"John Ross was principal chief of the Cherokee Nation."},
    {"L":[2,3],"q":"Which nation resisted removal from Florida in long wars?","a":"the Seminole","w":["the Cherokee","the Chickasaw","the Shawnee"],"why":"The Second Seminole War lasted from 1835 to 1842."},
    { L: [1, 2], q: 'What did the Indian Removal Act (1830) do?', a: 'Let the President trade western land for Native nations\' land in the East', w: ['Gave Native Americans U.S. citizenship', 'Protected Native land in Georgia forever', 'Ended all treaties with Native nations'], why: 'Signed May 28, 1830, it led to the forced removal of the southeastern nations.' },
    { L: [1, 2], q: 'What was the Trail of Tears?', a: 'The forced removal of the Cherokee to Indian Territory in 1838 and 1839', w: ['A trade route to Santa Fe', 'The path of Lewis and Clark', 'A route of the Underground Railroad'], why: 'About 16,000 Cherokee were forced west; thousands died.' },
    { L: [1, 2], q: 'Where were the southeastern nations forced to go?', a: 'Indian Territory, west of the Mississippi (later Oklahoma)', w: ['Canada', 'Florida', 'California'], why: 'Indian Territory later became most of Oklahoma.' },
    { L: [1, 2], q: 'Which President pressed for Indian removal?', a: 'Andrew Jackson', w: ['George Washington', 'Abraham Lincoln', 'John Adams'], why: 'Jackson signed the Removal Act and pressed for removal.' },
    { L: [2, 3], q: 'What did the Supreme Court decide in Worcester v. Georgia (1832)?', a: 'Georgia\'s laws had no force in the Cherokee Nation', w: ['Georgia could remove the Cherokee', 'The Cherokee must move west', 'Native nations could not sue'], why: 'Marshall held that relations with the Cherokee belonged to the federal government; the ruling was not enforced.', viz: caseq('worcester', ['name', 'holding']) },
    { L: [2, 3], q: 'Which of these nations was NOT one of the five southeastern nations removed in the 1830s?', a: 'Lakota', w: ['Cherokee', 'Choctaw', 'Seminole', 'Chickasaw', 'Muscogee (Creek)'], why: 'The Lakota lived on the northern plains. The five removed nations were the Cherokee, Choctaw, Chickasaw, Muscogee (Creek) and Seminole.' },
    { L: [2, 3], q: 'What was the Treaty of New Echota (1835)?', a: 'A removal treaty signed by a small group of Cherokee without their government\'s consent', w: ['A treaty that protected Cherokee land', 'The treaty ending the War of 1812', 'A Cherokee constitution'], why: 'The Senate approved it, and the army enforced it in 1838.' },
    { L: [2, 3], q: 'Which nation fought a long war in Florida (1835 to 1842) against removal?', a: 'The Seminole', w: ['The Cherokee', 'The Shawnee', 'The Osage'], why: 'The Second Seminole War was one of the costliest wars against a Native nation.' },
    { L: [2, 3], q: 'Before removal, the Cherokee had a written constitution and a newspaper. Who created the Cherokee writing system?', a: 'Sequoyah', w: ['Tecumseh', 'Sacagawea', 'Osceola'], why: 'Sequoyah\'s syllabary (1821) let thousands of Cherokee read and write their language.' },
    { L: [3], q: 'The Supreme Court approved the removal of the Cherokee.', tf: false, why: 'False: in Worcester v. Georgia it ruled for the Cherokee. The ruling was not enforced.' },
    { L: [3], q: 'Historians agree Jackson said, "John Marshall has made his decision; now let him enforce it."', tf: false, why: 'False: there is no record he said it, and historians treat the line as legend, though it fits his actions.' },
    { L: [3], q: 'About Indian removal:', all: [['The Indian Removal Act was passed in 1830.', true], ['Worcester v. Georgia ruled for the Cherokee.', true], ['Thousands of Cherokee died on the Trail of Tears.', true], ['The Cherokee fought removal only with weapons.', false], ['Removal took place in the 1890s.', false]], why: 'The Cherokee went to court; removal came in the 1830s.' },
    { L: [1, 2, 3], order: [['Cherokee constitution written', 1827], ['Indian Removal Act', 1830], ['Worcester v. Georgia', 1832], ['Treaty of New Echota', 1835], ['Trail of Tears', 1838]] }
  ], 'Separate what the Court said from what the government did.'));

  G('ush1.second-great-awakening', fromBank([
    { L: [1, 2], q: 'What was the Second Great Awakening?', a: 'A wave of religious revival in the early 1800s', w: ['A war with Britain', 'A new kind of steam engine', 'A movement to end the Union'], why: 'From about 1800 to the 1840s revival meetings swept the country and inspired reform.' },
    { L: [1, 2], q: 'The temperance movement worked to…', a: 'reduce or end the drinking of alcohol', w: ['build canals', 'end the national bank', 'make the sun brighter'], why: 'The American Temperance Society was founded in 1826.' },
    { L: [1, 2], q: 'Horace Mann is best known for promoting…', a: 'free public schools', w: ['better prisons', 'women\'s right to vote', 'the telegraph'], why: 'As the first secretary of the Massachusetts Board of Education (1837), he promoted common schools.' },
    { L: [1, 2], q: 'Dorothea Dix worked for…', a: 'better care for the mentally ill', w: ['the end of the national bank', 'lower tariffs', 'western expansion'], why: 'Her 1843 report showed the legislature how mentally ill people were caged and neglected.' },
    { L: [2, 3], q: 'How did the revival\'s teaching encourage reform?', a: 'It taught that people could choose to improve themselves, and so could improve society', w: ['It taught that nothing could change', 'It said only the government could do good', 'It opposed all reading and schooling'], why: 'Preachers such as Charles Finney stressed choice and effort, and many believers felt a duty to reform.' },
    { L: [2, 3], q: 'Which preacher led great revivals in New York\'s "burned-over district"?', a: 'Charles Grandison Finney', w: ['Jonathan Edwards', 'Horace Mann', 'William Lloyd Garrison'], why: 'Edwards led the First Great Awakening in the 1700s; Finney the Second.' },
    { L: [2, 3], q: 'Brook Farm, the Oneida Community and the Shakers were examples of…', a: 'utopian communities', w: ['textile mills', 'antislavery newspapers', 'prisons'], why: 'They tried to build a better society on a small scale.' },
    { L: [2, 3], q: 'Which reform movement is described? "Penitentiaries should reform people, not just punish them."', a: 'Prison reform', w: ['Temperance', 'Public schools', 'Utopian communities'], why: 'Reformers built penitentiaries meant to change people\'s character.' },
    { L: [2, 3], q: 'What was the Cane Ridge meeting of 1801?', a: 'A huge camp meeting in Kentucky, a model for later revivals', w: ['A convention on women\'s rights', 'A treaty with the Cherokee', 'The first meeting of the Whig Party'], why: 'Many thousands gathered for days of preaching and prayer.' },
    { L: [3], q: 'Religion and the reform movements of the early 1800s had little connection.', tf: false, why: 'False: many reformers were moved by the revival\'s belief that people and society could be improved.' },
    { L: [3], q: 'Women were active in many of the reform movements.', tf: true, why: 'True: women filled the churches and the reform societies, and many became leaders.' },
    { L: [3], q: 'Match the reformers:', all: [['Horace Mann: public schools.', true], ['Dorothea Dix: care of the mentally ill.', true], ['Charles Finney: revival preaching.', true], ['Horace Mann: the Erie Canal.', false], ['Dorothea Dix: the temperance society of 1826.', false]], why: 'Mann (schools), Dix (hospitals), Finney (revivals).' },
    { L: [1, 2, 3], gen: function (R) { var c = R.pick([['American Temperance Society (1826)', 'Temperance'], ['Pledges to give up hard liquor', 'Temperance'], ['Massachusetts Board of Education (1837)', 'Education'], ['Free, tax-supported common schools', 'Education'], ['Dix\'s report to the Massachusetts legislature (1843)', 'Care of the mentally ill'], ['Brook Farm', 'Utopian communities'], ['The Oneida Community', 'Utopian communities']]);
      return { q: 'Which reform does this belong to? "' + c[0] + '"', a: c[1], w: ['Temperance', 'Education', 'Care of the mentally ill', 'Utopian communities'].filter(function (x) { return x !== c[1]; }), why: c[0] + ': ' + c[1].toLowerCase() + '.' }; } }
  ], 'Link the belief (people can improve) to the action (a reform).'));

  G('ush1.abolition', fromBank([
    { L: [1, 2], q: 'Which abolitionist newspaper did William Lloyd Garrison start in 1831?', a: 'The Liberator', w: ['The North Star', 'The Federalist', 'Common Sense'], why: 'The Liberator began January 1, 1831. Douglass later published The North Star.' },
    { L: [1, 2], q: 'What did abolitionists want?', a: 'An end to slavery', w: ['An end to the national bank', 'Lower tariffs', 'The removal of Native nations'], why: 'Garrison and others demanded immediate abolition.' },
    { L: [1, 2], q: 'Which famous abolitionist escaped slavery in 1838 and wrote a Narrative of his life (1845)?', a: 'Frederick Douglass', w: ['William Lloyd Garrison', 'Horace Mann', 'Henry Clay'], why: 'Douglass escaped from Maryland and became one of the country\'s great speakers.' },
    { L: [1, 2], q: 'What was the Underground Railroad?', a: 'A network of people who helped enslaved people escape to freedom', w: ['A railroad built under New York City', 'A secret army in the South', 'A canal from Ohio to Canada'], why: 'Harriet Tubman, who escaped in 1849, guided many to freedom.' },
    { L: [2, 3], q: 'Who led a revolt of enslaved people in Southampton County, Virginia, in 1831?', a: 'Nat Turner', w: ['John Brown', 'Denmark Vesey', 'Frederick Douglass'], why: 'Nat Turner\'s revolt, August 1831.' },
    { L: [2, 3], q: 'How did Southern states respond to Nat Turner\'s revolt?', a: 'They passed harsher laws, such as bans on teaching enslaved people to read', w: ['They ended slavery', 'They freed all enslaved preachers', 'They joined the abolitionists'], why: 'Virginia debated gradual emancipation and rejected it; slave codes grew stricter.' },
    { L: [2, 3], q: 'Sojourner Truth was…', a: 'a formerly enslaved woman who preached against slavery and for women\'s rights', w: ['the founder of The Liberator', 'a senator from Massachusetts', 'the author of Uncle Tom\'s Cabin'], why: 'She was born into slavery in New York and became a famous speaker.' },
    { L: [2, 3], q: 'What was the House "gag rule" (1836 to 1844)?', a: 'A rule that tabled antislavery petitions without debate', w: ['A ban on newspapers in the South', 'A limit on speeches by Southern members', 'A law ending the slave trade'], why: 'It was finally repealed in 1844, after John Quincy Adams fought it for years.' },
    { L: [2, 3], q: 'The Grimké sisters were unusual abolitionists because they…', a: 'came from a slaveholding South Carolina family', w: ['were British officials', 'were members of Congress', 'owned a Northern textile mill'], why: 'Sarah and Angelina Grimké moved north and spoke against slavery from experience.' },
    { L: [2, 3], q: 'What did "colonization" mean in the debate over slavery?', a: 'Sending free Black Americans to Africa', w: ['Settling the Oregon Country', 'Founding new colonies in the Caribbean for planters', 'Ending slavery at once'], why: 'The American Colonization Society (1816) backed it; most Black leaders and abolitionists rejected it.' },
    { L: [3], q: 'Before the 1850s, most Northerners were abolitionists.', tf: false, why: 'False: abolitionists were a small and often unpopular minority; many more opposed only slavery\'s spread.' },
    { L: [3], q: 'Garrison wrote, "I will not retreat a single inch—AND I WILL BE HEARD."', tf: true, why: 'True: from his first issue of The Liberator, January 1, 1831.' },
    { L: [3], q: 'About the abolition movement:', all: [['Garrison founded The Liberator in 1831.', true], ['Frederick Douglass escaped slavery.', true], ['Abolitionists faced mob violence in the North.', true], ['Most Southern churches backed abolition.', false], ['Congress welcomed antislavery petitions in the 1830s.', false]], why: 'The gag rule blocked petitions, and Southern churches mostly defended slavery.' },
    { L: [2, 3], q: 'Read the source. Which phrase shows Garrison will not soften his words?', a: 'I will not equivocate', w: ['I am in earnest', 'a single inch', 'To the Public'], why: 'To equivocate is to speak vaguely to avoid offending. He refused.', viz: docq('The Liberator, first issue', 'Garrison, January 1, 1831', 'I am in earnest—I will not equivocate—I will not excuse—I will not retreat a single inch—AND I WILL BE HEARD.') },
    { L: [1, 2, 3], order: [['American Colonization Society founded', 1816], ['The Liberator first published', 1831], ['American Anti-Slavery Society founded', 1833], ['Douglass publishes his Narrative', 1845], ['Harriet Tubman escapes slavery', 1849]] }
  ], 'Separate those who wanted slavery ended now from those who wanted only to stop its spread.'));

  G('ush1.seneca-falls', fromBank([
    {"L":[1,2,3],"q":"In what year was the Seneca Falls Convention held?","a":"1848","w":["1776","1820","1865","1920"],"why":"It met on July 19 and 20, 1848."},
    {"L":[1,2,3],"q":"The Declaration of Sentiments was modeled on…","a":"the Declaration of Independence","w":["the Constitution","the Bill of Rights","the Mayflower Compact"],"why":"It begins, \"We hold these truths to be self-evident: that all men and women are created equal.\""},
    {"L":[1,2,3],"q":"Which demand at Seneca Falls was the most debated?","a":"the right to vote","w":["the right to own property","the right to attend college","the right to speak in public"],"why":"The voting resolution passed narrowly."},
    {"L":[1,2,3],"q":"Which reformer worked with Elizabeth Cady Stanton for decades for woman suffrage?","a":"Susan B. Anthony","w":["Lucretia Mott","Sojourner Truth","Dolley Madison","Abigail Adams"],"why":"Stanton and Anthony met in 1851."},
    { L: [1, 2], q: 'Where was the first women\'s rights convention held in 1848?', a: 'Seneca Falls, New York', w: ['Philadelphia, Pennsylvania', 'Boston, Massachusetts', 'Washington, D.C.'], why: 'July 19 and 20, 1848, at Seneca Falls.' },
    { L: [1, 2], q: 'Which document did the Seneca Falls Convention adopt?', a: 'The Declaration of Sentiments', w: ['The Declaration of Independence', 'The Bill of Rights', 'The Monroe Doctrine'], why: 'Written mainly by Elizabeth Cady Stanton, it was modeled on the Declaration of Independence.' },
    { L: [1, 2], q: 'Which two women organized the Seneca Falls Convention?', a: 'Elizabeth Cady Stanton and Lucretia Mott', w: ['Harriet Tubman and Sojourner Truth', 'Dorothea Dix and Clara Barton', 'Susan B. Anthony and Harriet Beecher Stowe'], why: 'Stanton and Mott, with other local women. Anthony joined the movement a few years later.' },
    { L: [1, 2, 3], q: 'In what year did the Nineteenth Amendment give women the vote nationwide?', year: 1920, why: 'It was ratified in August 1920, 72 years after Seneca Falls.' },
    { L: [2, 3], q: 'The Declaration of Sentiments changed one famous sentence to read "all men and women are created equal." Which document did it copy?', a: 'The Declaration of Independence', w: ['The Constitution', 'The Mayflower Compact', 'The Emancipation Proclamation'], why: 'Using Jefferson\'s words claimed the country\'s founding promise for women.', viz: docq('The Declaration of Sentiments', '1848', 'We hold these truths to be self-evident; that all men and women are created equal; that they are endowed by their Creator with certain inalienable rights.') },
    { L: [2, 3], q: 'Which resolution at Seneca Falls was the only one not passed unanimously?', a: 'The one demanding women\'s right to vote', w: ['The one demanding the right to own property', 'The one opposing slavery', 'The one praising the Constitution'], why: 'It passed narrowly after Frederick Douglass spoke for it.' },
    { L: [2, 3], q: 'Which abolitionist spoke in favor of women\'s right to vote at Seneca Falls?', a: 'Frederick Douglass', w: ['William Lloyd Garrison', 'John Brown', 'Henry Clay'], why: 'Douglass, an editor from nearby Rochester, helped carry the resolution.' },
    { L: [2, 3], q: 'What was the "elective franchise" that the Declaration of Sentiments demanded?', a: 'The right to vote', w: ['The right to own a business', 'A seat in the Senate', 'The right to divorce'], why: 'Franchise here means the right to vote.' },
    { L: [2, 3], q: 'How many years passed between Seneca Falls (1848) and the Nineteenth Amendment (1920)?', year: 72, why: '1920 − 1848 = 72 years.', hint: 'Subtract.' },
    { L: [3], q: 'Women won the vote nationwide soon after Seneca Falls.', tf: false, why: 'False: the Nineteenth Amendment came in 1920, 72 years later.' },
    { L: [3], q: 'About 100 people, women and men, signed the Declaration of Sentiments.', tf: true, why: 'True: 68 women and 32 men signed.' },
    { L: [3], q: 'About Seneca Falls:', all: [['It met in 1848.', true], ['Its declaration copied the Declaration of Independence.', true], ['Men took part as well as women.', true], ['It won women the vote that year.', false], ['It was held in London.', false]], why: 'Seneca Falls, New York, 1848; the vote came in 1920.' },
    { L: [1, 2, 3], order: [['Women barred at the London antislavery convention', 1840], ['Seneca Falls Convention', 1848], ['Wyoming Territory lets women vote', 1869], ['Nineteenth Amendment', 1920]], k: 3 },
    { L: [2, 3], gen: letterGen(U6L, 5) }
  ], 'Seneca Falls borrowed the most famous words in American history. Which ones?'));

  /* ======================================================== Unit 7: Expansion and the Sectional Crisis (1844 to 1861) */
  var U7 = [
    ['Texas wins independence from Mexico', 1836], ['Large wagon trains start on the Oregon Trail', 1843], ['Texas annexed', 1845], ['Oregon Treaty', 1846.45, '1846'],
    ['Treaty of Guadalupe Hidalgo', 1848.1, '1848'], ['California Gold Rush', 1849], ['Compromise of 1850', 1850], ['Uncle Tom\'s Cabin published', 1852], ['Gadsden Purchase', 1853],
    ['Kansas-Nebraska Act', 1854], ['Dred Scott decision', 1857], ['Lincoln-Douglas debates', 1858], ['John Brown\'s raid on Harpers Ferry', 1859], ['Lincoln elected', 1860.85, 'November 1860'],
    ['South Carolina secedes', 1860.97, 'December 1860'], ['Fort Sumter fired on', 1861.28, 'April 1861']
  ];
  var U7L = [['Texas independence', 1836], ['Texas annexed', 1845], ['Treaty of Guadalupe Hidalgo', 1848], ['Compromise of 1850', 1850], ['Gadsden Purchase', 1853], ['Kansas-Nebraska Act', 1854],
    ['Dred Scott decision', 1857], ['Lincoln-Douglas debates', 1858], ['Harpers Ferry raid', 1859], ['Lincoln elected', 1860], ['Fort Sumter', 1861]];
  var ACQS = [['Treaty of Paris lands', 1783, 'Great Britain', 'treaty'], ['Louisiana Purchase', 1803, 'France', 'purchase'], ['Florida', 1819, 'Spain', 'treaty'], ['Texas', 1845, 'the Republic of Texas', 'annexation'],
    ['Oregon Country', 1846, 'Great Britain', 'treaty'], ['Mexican Cession', 1848, 'Mexico', 'treaty after war'], ['Gadsden Purchase', 1853, 'Mexico', 'purchase'], ['Alaska', 1867, 'Russia', 'purchase'], ['Hawaii', 1898, 'the Republic of Hawaii', 'annexation']];
  var ACQK = { 'Treaty of Paris lands': 'treaty1783', 'Louisiana Purchase': 'louisiana', 'Florida': 'florida', 'Texas': 'texas', 'Oregon Country': 'oregon', 'Mexican Cession': 'mexican', 'Gadsden Purchase': 'gadsden' };

  G('ush1.manifest-destiny', fromBank([
    { L: [1, 2], q: 'What was Manifest Destiny?', a: 'The belief that the U.S. was destined to spread across the continent', w: ['A treaty with Britain over Oregon', 'A law that admitted Texas', 'A plan to end slavery'], why: 'A belief and a slogan, named in 1845 by John L. O\'Sullivan.' },
    { L: [1, 2], q: 'From which country did Texas win independence in 1836?', a: 'Mexico', w: ['Spain', 'France', 'Britain'], why: 'Texans defeated Mexico\'s army at San Jacinto in April 1836.' },
    { L: [1, 2], q: 'In what year was Texas annexed to the United States?', a: '1845', w: ['1836', '1848', '1803', '1861'], why: 'By a joint resolution in March 1845; Texas became a state that December.' },
    { L: [1, 2], q: 'The Oregon Treaty of 1846 divided the Oregon Country with Britain at…', a: 'the 49th parallel', w: ['54°40′', '36°30′', 'the Rio Grande'], why: 'The 49th parallel still forms most of the western border with Canada.' },
    { L: [2, 3], q: 'Who coined the phrase "manifest destiny" in 1845?', a: 'John L. O\'Sullivan', w: ['James K. Polk', 'Henry Clay', 'Sam Houston'], why: 'O\'Sullivan, a New York editor, in an essay titled "Annexation."', viz: docq('"Annexation"', 'The Democratic Review, 1845', '…our manifest destiny to overspread the continent allotted by Providence for the free development of our yearly multiplying millions.') },
    { L: [2, 3], q: 'Why did the U.S. wait until 1845 to annex Texas?', a: 'Fears of war with Mexico and of adding a slave state', w: ['Texas did not want to join', 'Texas was still part of Spain', 'The Constitution banned new states'], why: 'Texas asked in 1836, but the slavery question and Mexico\'s threats delayed it until Polk\'s election.' },
    { L: [2, 3], q: 'How was Texas annexed in 1845?', a: 'By a joint resolution of Congress, after the Senate rejected a treaty', w: ['By a treaty with Mexico', 'By purchase from Spain', 'By a vote of the Supreme Court'], why: 'A joint resolution needed only simple majorities, not two-thirds of the Senate.' },
    { L: [2, 3], q: '"Fifty-four forty or fight!" was a slogan about…', a: 'claiming all of the Oregon Country', w: ['the Texas border', 'the Missouri Compromise line', 'the price of Alaska'], why: '54°40′ was the southern edge of Russian Alaska. Polk accepted the 49th parallel.' },
    { L: [2, 3], q: 'Which President, elected in 1844, pushed for Texas, Oregon and California?', a: 'James K. Polk', w: ['Andrew Jackson', 'Zachary Taylor', 'Millard Fillmore'], why: 'Polk (1845 to 1849) was the great expansionist President.' },
    { L: [3], q: 'Manifest Destiny was a treaty signed by the United States and Mexico.', tf: false, why: 'False: it was a belief and a slogan. The land came by treaty, purchase, annexation and war.' },
    { L: [3], q: 'Texas was an independent republic for about nine years before joining the U.S.', tf: true, why: 'True: from 1836 to 1845.' },
    { L: [3], q: 'About Manifest Destiny and the 1840s:', all: [['Texas was annexed in 1845.', true], ['Oregon was divided with Britain at the 49th parallel.', true], ['Many Whigs warned that expansion would reopen the slavery fight.', true], ['Congress passed a law called Manifest Destiny.', false], ['Oregon was bought from Mexico.', false]], why: 'Manifest Destiny was a belief; Oregon was settled by treaty with Britain.' },
    { L: [1, 2, 3], order: U7.slice(0, 6) }
  ], 'A belief is not a law. How did each piece of land actually come?'));

  G('ush1.mexican-american-war', fromBank([
    { L: [1, 2], q: 'Which treaty ended the Mexican-American War?', a: 'The Treaty of Guadalupe Hidalgo', w: ['The Treaty of Ghent', 'The Oregon Treaty', 'The Treaty of Paris'], why: 'Signed February 2, 1848.' },
    { L: [1, 2], q: 'What land did Mexico give up in 1848?', a: 'California and most of the Southwest (the Mexican Cession)', w: ['Florida', 'The Oregon Country', 'The Louisiana Purchase'], why: 'California, Nevada, Utah and parts of Arizona, New Mexico, Colorado and Wyoming.' },
    { L: [1, 2], q: 'In what years was the Mexican-American War fought?', a: '1846 to 1848', w: ['1812 to 1815', '1836 to 1838', '1861 to 1865'], why: 'War was declared in May 1846; the treaty came in February 1848.' },
    { L: [1, 2], q: 'What did the Wilmot Proviso propose?', a: 'Banning slavery in any land taken from Mexico', w: ['Buying California for \\$15 million', 'Ending the war at once', 'Annexing all of Mexico'], why: 'It passed the House but failed in the Senate.' },
    { L: [2, 3], q: 'What was the border dispute that started the war?', a: 'Texas and the U.S. claimed the Rio Grande; Mexico said the Nueces River', w: ['Both claimed the Oregon Country', 'Mexico claimed Louisiana', 'The U.S. claimed the Gila River'], why: 'Polk sent troops into the land between the two rivers.' },
    { L: [2, 3], q: 'What happened to the Wilmot Proviso?', a: 'It passed the House but failed in the Senate', w: ['It became law in 1846', 'The President vetoed it', 'The Supreme Court struck it down'], why: 'The votes split by section, North against South, not by party.' },
    { L: [2, 3], q: 'Which first-term congressman challenged Polk to name the "spot" where American blood was shed?', a: 'Abraham Lincoln', w: ['Stephen A. Douglas', 'David Wilmot', 'Jefferson Davis'], why: 'Lincoln, a Whig, introduced his "spot" resolutions in December 1847.' },
    { L: [2, 3], q: 'Who went to jail for refusing to pay a tax in protest of the war and slavery, and later wrote "Resistance to Civil Government"?', a: 'Henry David Thoreau', w: ['Ralph Waldo Emerson', 'Frederick Douglass', 'Horace Mann'], why: 'Thoreau spent a night in jail in 1846; the essay appeared in 1849.' },
    { L: [2, 3], q: 'How much did the U.S. pay Mexico under the Treaty of Guadalupe Hidalgo?', a: '\\$15 million', w: ['\\$10 million', '\\$7.2 million', 'Nothing'], why: '\\$15 million, and it took over certain claims of Americans against Mexico.' },
    { L: [3], q: 'The Mexican-American War had the support of every American.', tf: false, why: 'False: many Whigs, abolitionists and others, including Lincoln and Thoreau, opposed it.' },
    { L: [3], q: 'The Wilmot Proviso showed that slavery could split the parties along sectional lines.', tf: true, why: 'True: Northern Democrats and Whigs voted for it; Southern members of both parties against it.' },
    { L: [3], q: 'About the Mexican-American War:', all: [['U.S. troops captured Mexico City.', true], ['Mexico accepted the Rio Grande border.', true], ['The Wilmot Proviso failed in the Senate.', true], ['The war was over Oregon.', false], ['The U.S. gave Texas back to Mexico.', false]], why: 'The war grew from the Texas border dispute; Mexico ceded the Southwest.' },
    { L: [2, 3], q: 'On the map, which region is marked "?"', a: 'The Mexican Cession', w: ['The Louisiana Purchase', 'The Gadsden Purchase', 'The Oregon Country'], why: 'The land ceded by Mexico in 1848.', viz: { name: 'cv-map', opts: { mode: 'territory', year: 1848, ask: 'mexican', quiet: true, interactive: false } } },
    { L: [1, 2, 3], order: [['Texas annexed', 1845], ['War declared', 1846.37, 'May 1846'], ['Wilmot Proviso', 1846.6, 'August 1846'], ['Mexico City captured', 1847.7, 'September 1847'], ['Treaty of Guadalupe Hidalgo', 1848.1, 'February 1848']] }
  ], 'Where was the border? And what did the new land mean for slavery?'));

  G('ush1.territorial-growth', fromBank([
    { L: [1, 2, 3], gen: function (R) { var x = R.pick(ACQS); return { q: 'In what year did the United States gain ' + x[0] + '?', a: String(x[1]), w: R.sample(ACQS.filter(function (y) { return y !== x; }), 3).map(function (y) { return String(y[1]); }), why: x[0] + ': ' + x[1] + ', from ' + x[2] + ', by ' + x[3] + '.' }; } },
    { L: [1, 2, 3], gen: function (R) { var x = R.pick(ACQS); return { q: 'From whom did the United States gain ' + x[0] + ' (' + x[1] + ')?', a: x[2].charAt(0).toUpperCase() + x[2].slice(1), w: ['Great Britain', 'France', 'Spain', 'Mexico', 'Russia', 'The Republic of Texas'].filter(function (y) { return y.toLowerCase() !== x[2].toLowerCase(); }), why: x[0] + ' came from ' + x[2] + ' by ' + x[3] + '.' }; } },
    { L: [2, 3], gen: function (R) { var x = R.pick(ACQS); return { q: 'How did the United States gain ' + x[0] + ' (' + x[1] + ')?', a: 'By ' + x[3], w: ['By purchase', 'By treaty', 'By annexation', 'By treaty after war'].filter(function (y) { return y !== 'By ' + x[3]; }), why: x[0] + ': ' + x[3] + ' (' + x[2] + ').' }; } },
    { L: [2, 3], gen: function (R) { var x = R.pick(ACQS.filter(function (y) { return ACQK[y[0]]; })); return { q: 'On the map, which addition is marked "?"', a: x[0], w: R.sample(ACQS.filter(function (y) { return y !== x && ACQK[y[0]]; }), 3).map(function (y) { return y[0]; }), why: 'The marked region is ' + x[0] + ' (' + x[1] + ').',
      viz: { name: 'cv-map', opts: { mode: 'territory', ask: ACQK[x[0]], quiet: true, interactive: false } } }; } },
    { L: [1, 2], q: 'Which addition was bought from Mexico in 1853 for a southern railroad route?', a: 'The Gadsden Purchase', w: ['The Mexican Cession', 'Texas', 'Florida'], why: 'A strip of land south of the Gila River, for \\$10 million.' },
    { L: [2, 3], q: 'Which addition came after a war fought partly over it?', a: 'The Mexican Cession (1848)', w: ['The Louisiana Purchase (1803)', 'Alaska (1867)', 'The Oregon Country (1846)'], why: 'The Mexican Cession followed the Mexican-American War.' },
    { L: [3], q: 'Most of the land the United States gained came by treaty or purchase.', tf: true, why: 'True: only the Mexican Cession followed a war, though Native land was taken by many treaties and removals.' },
    { L: [3], q: 'Florida was bought from France.', tf: false, why: 'False: Spain gave up Florida by treaty in 1819 (the Adams-Onís Treaty).' },
    { L: [3], q: 'Which additions came by purchase?', all: [['Louisiana (1803)', true], ['The Gadsden Purchase (1853)', true], ['Alaska (1867)', true], ['Texas (1845)', false], ['Oregon (1846)', false]], why: 'Texas was annexed; Oregon came by treaty with Britain.' },
    { L: [1, 2, 3], order: ACQS.slice(0, 7).map(function (x) { return [x[0], x[1]]; }) },
    { L: [3], order: ACQS.map(function (x) { return [x[0], x[1]]; }), k: 6 }
  ], 'For each addition, recall three things: the year, the country that gave it up, and how.'));

  G('ush1.gold-rush-immigration', fromBank([
    { L: [1, 2], q: 'Where was gold discovered in January 1848, starting the Gold Rush?', a: 'Sutter\'s Mill, California', w: ['Pikes Peak, Colorado', 'The Black Hills, Dakota', 'Klondike, Canada'], why: 'James Marshall found gold at Sutter\'s Mill on January 24, 1848.' },
    { L: [1, 2], q: 'What were the "forty-niners"?', a: 'People who rushed to California for gold in 1849', w: ['The 49 signers of the Constitution', 'Soldiers in the Mexican War', 'The first 49 states'], why: 'They were named for the peak year, 1849.' },
    { L: [1, 2], q: 'Why did so many Irish people come to America in the late 1840s?', a: 'A famine struck Ireland when the potato crop failed', w: ['Gold was found in Ireland', 'Britain forced them to fight in Mexico', 'Ireland banned farming'], why: 'The Great Famine began in 1845; about a million people died and about a million emigrated.' },
    { L: [1, 2], q: 'The "Know-Nothings" were…', a: 'a party opposed to immigrants and Catholics', w: ['a group of gold miners', 'an abolitionist society', 'a Native nation of California'], why: 'The American Party, a nativist party of the 1850s.' },
    { L: [2, 3], q: 'About how many immigrants arrived in the United States between 1845 and 1854?', a: 'About 2.9 million', w: ['About 29,000', 'About 290,000', 'About 29 million'], why: 'About 2.9 million, mostly Irish and German, when the population was about 20 to 23 million.' },
    { L: [2, 3], q: 'What did the Know-Nothings want?', a: 'A much longer wait before immigrants could become citizens', w: ['Free land for immigrants', 'An end to slavery at once', 'More Catholic schools'], why: 'They called for a 21-year wait for naturalization.' },
    { L: [2, 3], q: 'What did California\'s Foreign Miners\' Tax of 1850 do?', a: 'Charged non-citizens \\$20 a month to mine', w: ['Gave free land to foreign miners', 'Banned all mining', 'Paid miners to leave'], why: 'It fell hardest on Mexican, Latin American and Chinese miners.' },
    { L: [2, 3], q: 'Who suffered the greatest losses during the Gold Rush?', a: 'California\'s Native peoples', w: ['Boston merchants', 'Irish farmers in Ireland', 'Members of Congress'], why: 'Their numbers fell from roughly 150,000 to under 30,000 by 1870 through disease, starvation and violence.' },
    { L: [2, 3], q: 'Where did many German immigrants of the 1840s and 1850s settle?', a: 'Farms and towns of the Midwest, such as Wisconsin and Missouri', w: ['Mostly in the Deep South', 'Only in New England mill towns', 'Mostly in Oregon'], why: 'Many Germans bought farms in the Midwest; most Irish settled in Northeastern cities.' },
    { L: [3], q: 'Large-scale immigration to the U.S. began with Ellis Island.', tf: false, why: 'False: Ellis Island opened in 1892. The 1840s and 1850s brought one of the largest waves relative to the population.' },
    { L: [3], q: 'In 1856 the Know-Nothing candidate, Millard Fillmore, won about a fifth of the popular vote.', tf: true, why: 'True: about 22 percent.' },
    { L: [3], q: 'About the 1840s and 1850s:', all: [['Gold was found in California in 1848.', true], ['The Irish famine drove mass emigration.', true], ['Nativists formed the American Party.', true], ['Most Irish immigrants were Protestant farmers with land.', false], ['The Gold Rush began after the Civil War.', false]], why: 'Most Irish immigrants were poor and Catholic; the rush began in 1848 to 1849.' },
    { L: [1, 2, 3], gen: function (R) { var c = R.pick([['Forty-niners', 'Gold Rush'], ['Sutter\'s Mill', 'Gold Rush'], ['Chinese miners in California', 'Gold Rush'], ['The potato famine', 'Irish and German immigration'], ['German farm towns in the Midwest', 'Irish and German immigration'], ['The American Party', 'Nativism'], ['A 21-year wait for citizenship', 'Nativism']]);
      return { q: 'Which story does this belong to? "' + c[0] + '"', a: c[1], w: ['Gold Rush', 'Irish and German immigration', 'Nativism'].filter(function (x) { return x !== c[1]; }), why: c[0] + ': ' + c[1] + '.' }; } }
  ], 'Two waves at once: west to California, and across the Atlantic to the North.'));

  G('ush1.compromise-of-1850', fromBank([
    { L: [1, 2], q: 'Under the Compromise of 1850, California joined the Union as…', a: 'a free state', w: ['a slave state', 'a territory', 'part of Texas'], why: 'California\'s admission as a free state gave the free states a Senate majority.' },
    { L: [1, 2], q: 'What did the Fugitive Slave Act of 1850 require?', a: 'That people who escaped slavery be returned, with Northerners required to help', w: ['That slavery end in the North', 'That escaped people be given land', 'That California allow slavery'], why: 'It was much stronger than the 1793 law and angered many Northerners.' },
    { L: [1, 2], q: 'Who wrote Uncle Tom\'s Cabin (1852)?', a: 'Harriet Beecher Stowe', w: ['Harriet Tubman', 'Frederick Douglass', 'Elizabeth Cady Stanton'], why: 'Stowe wrote the novel partly in answer to the Fugitive Slave Act.' },
    { L: [1, 2], q: 'What was popular sovereignty?', a: 'Letting a territory\'s settlers vote on slavery', w: ['Letting Congress ban slavery everywhere', 'Letting the President decide', 'Letting the Supreme Court decide'], why: 'The Compromise applied it to New Mexico and Utah.' },
    { L: [2, 3], q: 'What did the Compromise of 1850 end in the District of Columbia?', a: 'The slave trade (the buying and selling of enslaved people)', w: ['Slavery itself', 'Voting by free Black men', 'The national bank'], why: 'Slavery in the District ended in 1862.' },
    { L: [2, 3], q: 'Which senator passed the Compromise as five separate bills after Clay\'s single bill failed?', a: 'Stephen A. Douglas', w: ['Daniel Webster', 'John C. Calhoun', 'Jefferson Davis'], why: 'Douglas built a different majority for each part.' },
    { L: [2, 3], q: 'Which President signed the Compromise of 1850?', a: 'Millard Fillmore', w: ['Zachary Taylor', 'James K. Polk', 'Franklin Pierce'], why: 'Taylor, who opposed parts of it, died in July 1850; Fillmore signed in September.' },
    { L: [2, 3], q: 'Why did the Fugitive Slave Act turn many Northerners against slavery?', a: 'It denied the accused a jury trial and made bystanders help with captures', w: ['It freed everyone in the North', 'It raised taxes on Northern farms', 'It banned Northern newspapers'], why: 'Commissioners decided cases without juries, and helping someone escape brought fines and jail.' },
    { L: [2, 3], q: 'Under the Fugitive Slave Act, a commissioner was paid \\$10 for ruling for the claimant. How much for ruling against?', a: '\\$5', w: ['\\$10', '\\$20', 'Nothing'], why: 'Critics said the fee gave commissioners a reason to rule for the claimant.' },
    { L: [3], q: 'The Compromise of 1850 abolished slavery in Washington, D.C.', tf: false, why: 'False: it ended the slave trade there; slavery in the District ended in 1862.' },
    { L: [3], q: 'Uncle Tom\'s Cabin sold about 300,000 copies in the United States in its first year.', tf: true, why: 'True: it was one of the best-selling books of the century.' },
    { L: [3], q: 'Which were parts of the Compromise of 1850?', all: [['California admitted as a free state', true], ['Popular sovereignty in New Mexico and Utah', true], ['A stronger Fugitive Slave Act', true], ['Repeal of the Missouri Compromise', false], ['Kansas admitted as a slave state', false]], why: 'The Missouri line was repealed in 1854; Kansas joined as a free state in 1861.' },
    { L: [1, 2, 3], gen: function (R) { var c = R.pick([['California admitted as a free state', 'Mainly for the North'], ['The slave trade ended in Washington, D.C.', 'Mainly for the North'], ['A stronger Fugitive Slave Act', 'Mainly for the South'], ['No federal ban on slavery in New Mexico and Utah', 'Mainly for the South']]);
      return { q: 'In the Compromise of 1850, which side mainly wanted this? "' + c[0] + '"', a: c[1], w: [c[1] === 'Mainly for the North' ? 'Mainly for the South' : 'Mainly for the North'], why: c[0] + ': ' + c[1].toLowerCase() + '.' }; } },
    { L: [1, 2, 3], order: [['Gold discovered in California', 1848], ['California asks to join as a free state', 1849], ['Compromise of 1850', 1850.7], ['Uncle Tom\'s Cabin published', 1852], ['Kansas-Nebraska Act', 1854]] }
  ], 'Each side got something and gave something. Who wanted each part?'));

  G('ush1.kansas-nebraska', fromBank([
    { L: [1, 2], q: 'What did the Kansas-Nebraska Act (1854) let settlers decide?', a: 'Whether to allow slavery', w: ['Which state to join', 'Who would be President', 'Whether to build a railroad'], why: 'It applied popular sovereignty to Kansas and Nebraska.' },
    { L: [1, 2], q: 'Which earlier compromise did the Kansas-Nebraska Act repeal?', a: 'The Missouri Compromise', w: ['The Compromise of 1850', 'The Great Compromise', 'The Three-Fifths Compromise'], why: 'Both territories lay north of 36°30′, where the Missouri Compromise had banned slavery.' },
    { L: [1, 2], q: 'Which party was founded in 1854 to stop slavery\'s spread into the territories?', a: 'The Republican Party', w: ['The Whig Party', 'The Democratic Party', 'The Federalist Party'], why: 'It drew former Whigs, Free Soilers and antislavery Democrats.' },
    { L: [1, 2], q: 'What was "Bleeding Kansas"?', a: 'Violence between proslavery and antislavery settlers in Kansas', w: ['A war with Mexico', 'A Native uprising in Kansas', 'A drought in the Great Plains'], why: 'From 1854 to 1861, rival governments and armed groups fought for control.' },
    { L: [2, 3], q: 'Who wrote the Kansas-Nebraska Act?', a: 'Stephen A. Douglas', w: ['Abraham Lincoln', 'Henry Clay', 'Charles Sumner'], why: 'Douglas of Illinois, partly to open the way for a railroad through the region.' },
    { L: [2, 3], q: 'Which senator was beaten with a cane in the Senate chamber in May 1856?', a: 'Charles Sumner', w: ['Stephen A. Douglas', 'Preston Brooks', 'Daniel Webster'], why: 'Representative Preston Brooks beat Sumner over his "Crime Against Kansas" speech.' },
    { L: [2, 3], q: 'Which abolitionist led the killing of five proslavery settlers at Pottawatomie Creek in 1856?', a: 'John Brown', w: ['William Lloyd Garrison', 'Frederick Douglass', 'Charles Sumner'], why: 'Brown later raided Harpers Ferry (1859).' },
    { L: [2, 3], q: 'What was the founding goal of the Republican Party?', a: 'To stop slavery from spreading into the territories', w: ['To abolish slavery in every state at once', 'To annex Canada', 'To defend the Second Bank'], why: '"Free soil": keep slavery out of the West.' },
    { L: [2, 3], q: 'In what year was Kansas admitted, and as what?', a: '1861, as a free state', w: ['1854, as a slave state', '1857, as a slave state', '1850, as a free state'], why: 'January 29, 1861, just before the war.' },
    { L: [2, 3], q: 'Which party broke apart over the Kansas-Nebraska Act?', a: 'The Whigs', w: ['The Democrats', 'The Republicans', 'The Federalists'], why: 'Northern and Southern Whigs could not agree; many Northern Whigs became Republicans.' },
    { L: [3], q: 'The Republican Party was founded to abolish slavery in the Southern states.', tf: false, why: 'False: its founding goal was to stop slavery from spreading into the territories.' },
    { L: [3], q: 'Under popular sovereignty, Kansas had two rival governments at one time.', tf: true, why: 'True: a proslavery legislature and a free-state government.' },
    { L: [3], q: 'About Kansas-Nebraska:', all: [['It repealed the Missouri Compromise line.', true], ['It led to violence in Kansas.', true], ['The Republican Party formed in reaction.', true], ['It banned slavery in Kansas.', false], ['It was written by Abraham Lincoln.', false]], why: 'It left slavery to a vote; Douglas wrote it.' },
    { L: [2, 3], order: [['Kansas-Nebraska Act', 1854.4, 'May 1854'], ['Missourians vote in Kansas; rival governments', 1855], ['Lawrence sacked', 1856.38, 'May 21, 1856'], ['Sumner beaten in the Senate', 1856.39, 'May 22, 1856'], ['Pottawatomie killings', 1856.4, 'May 24, 1856'], ['Kansas admitted as a free state', 1861.08, 'January 1861']] },
    { L: [1], order: U7.slice(6, 12), k: 3 }
  ], 'Popular sovereignty sounded simple: let the settlers vote. What happened when both sides sent settlers?'));

  G('ush1.dred-scott', fromBank([
    { L: [1, 2], q: 'In what year was Dred Scott v. Sandford decided?', a: '1857', w: ['1850', '1854', '1861', '1868'], why: 'March 6, 1857.' },
    { L: [1, 2], q: 'Who wrote the Court\'s opinion in Dred Scott v. Sandford?', a: 'Chief Justice Roger B. Taney', w: ['Chief Justice John Marshall', 'Justice Benjamin Curtis', 'Abraham Lincoln'], why: 'Taney succeeded Marshall in 1836.' },
    { L: [1, 2], q: 'What did the Court rule about Black Americans in Dred Scott?', a: 'They were not citizens who could sue in federal court', w: ['They were all free in the territories', 'They could vote in federal elections', 'They could serve in Congress'], why: 'The Fourteenth Amendment (1868) overturned this ruling.' },
    { L: [1, 2], q: 'What did the Court rule about Congress and slavery in the territories?', a: 'Congress could not ban it there', w: ['Congress had to ban it there', 'Each state could ban it there', 'Only the President could decide'], why: 'Taney said a ban violated slaveholders\' Fifth Amendment property rights.' },
    { L: [2, 3], q: 'What was the vote in Dred Scott v. Sandford?', a: '7 to 2', w: ['9 to 0', '5 to 4', '6 to 3'], why: 'Justices Curtis and McLean dissented.' },
    { L: [2, 3], q: 'Why did Dred Scott argue he was free?', a: 'He had lived in a free state and a free territory', w: ['He had bought his freedom', 'He had fought in the Mexican War', 'He was born in Canada'], why: 'He had lived in Illinois and in Wisconsin Territory, where the Missouri Compromise banned slavery.' },
    { L: [2, 3], q: 'Which earlier law did Dred Scott declare unconstitutional?', a: 'The Missouri Compromise\'s ban on slavery north of 36°30′', w: ['The Fugitive Slave Act', 'The Judiciary Act of 1789', 'The Kansas-Nebraska Act'], why: 'The Court said Congress had no power to ban slavery in a territory, so the 1820 ban was void.' },
    { L: [2, 3], q: 'Which amendment overturned the Dred Scott ruling on citizenship?', a: 'The Fourteenth', w: ['The Thirteenth', 'The Fifteenth', 'The Fifth'], why: 'The Fourteenth (1868): all persons born or naturalized in the U.S. are citizens.' },
    { L: [2, 3], q: 'Justice Curtis\'s dissent pointed out that…', a: 'free Black men had voted in five of the original states', w: ['the Missouri Compromise had already been repealed', 'Scott had never left Missouri', 'the Court had no justices from the North'], why: 'So they were among those who ratified the Constitution.' },
    { L: [2, 3], q: 'Which case is this?', a: 'Dred Scott v. Sandford', w: ['Marbury v. Madison', 'Worcester v. Georgia', 'McCulloch v. Maryland'], why: 'The 1857 case about citizenship and slavery in the territories.', viz: caseq('dredscott', ['name']) },
    { L: [3], q: 'The Dred Scott decision settled the dispute over slavery in the territories.', tf: false, why: 'False: it inflamed it, striking at the Republican platform and splitting the Democrats.' },
    { L: [3], q: 'Dred Scott and his family were freed by a private owner a few months after the ruling.', tf: true, why: 'True: Taylor Blow freed them in May 1857. Scott died in 1858.' },
    { L: [3], q: 'About Dred Scott v. Sandford:', all: [['Chief Justice Taney wrote the opinion.', true], ['It said Congress could not ban slavery in the territories.', true], ['Two justices dissented.', true], ['It was decided unanimously.', false], ['It upheld the Missouri Compromise.', false]], why: 'It was 7 to 2 and struck down the Missouri Compromise ban.' },
    { L: [1, 2, 3], order: [['Missouri Compromise', 1820], ['Scott sues for freedom in Missouri', 1846], ['Kansas-Nebraska Act', 1854], ['Dred Scott decision', 1857], ['Fourteenth Amendment ratified', 1868]] }
  ], 'The case answered two questions. What were they, and what did the Court say to each?'));

  G('ush1.lincoln-and-1860', fromBank([
    { L: [1, 2], q: 'Who debated Abraham Lincoln seven times in 1858?', a: 'Stephen A. Douglas', w: ['Jefferson Davis', 'John C. Calhoun', 'John Brown'], why: 'They were running for a U.S. Senate seat from Illinois.' },
    { L: [1, 2], q: 'What did John Brown raid in October 1859?', a: 'The federal arsenal at Harpers Ferry, Virginia', w: ['Fort Sumter', 'The Capitol', 'Fort McHenry'], why: 'He hoped to start an uprising of enslaved people; he was captured and hanged.' },
    { L: [1, 2], q: 'How many major candidates ran for President in 1860?', a: 'Four', w: ['Two', 'Three', 'Six'], why: 'Lincoln, Douglas, Breckinridge and Bell.' },
    { L: [1, 2], q: 'What did Lincoln promise about slavery in the states where it existed?', a: 'Not to interfere with it', w: ['To end it at once', 'To spread it west', 'To let each county vote on it'], why: 'He pledged not to interfere in the states but to stop slavery\'s spread.' },
    { L: [2, 3], q: 'About what share of the popular vote did Lincoln win in 1860?', a: 'About 40 percent', w: ['About 60 percent', 'About 25 percent', 'About 51 percent'], why: 'About 39.8 percent, but a clear majority of the electoral votes.' },
    { L: [2, 3], q: 'Who won the 1858 Senate race in Illinois?', a: 'Stephen A. Douglas', w: ['Abraham Lincoln', 'John Bell', 'William Seward'], why: 'Douglas kept his seat (the legislature chose senators then), but Lincoln became nationally known.' },
    { L: [2, 3], q: 'What was Douglas\'s "Freeport Doctrine"?', a: 'Settlers could keep slavery out by not passing laws to protect it', w: ['Congress must ban slavery in every territory', 'Slaves who reach Freeport are free', 'States may leave the Union'], why: 'It answered Lincoln\'s question about Dred Scott, but it cost Douglas support in the South.' },
    { L: [2, 3], q: 'In 1860 the Democratic Party split. Whom did Southern Democrats nominate?', a: 'John C. Breckinridge', w: ['Stephen A. Douglas', 'John Bell', 'Jefferson Davis'], why: 'Northern Democrats chose Douglas; the Constitutional Union Party chose Bell.' },
    { L: [2, 3], q: 'How many electoral votes did Lincoln win in 1860?', a: '180', w: ['152', '72', '303'], why: 'Lincoln 180, Breckinridge 72, Bell 39, Douglas 12; 152 of 303 was a majority.', viz: { name: 'cv-ec', opts: { mode: 'results', election: 1860, quiet: true, interactive: false } } },
    { L: [2, 3], gen: function (R) { var a = R.pick([['Breckinridge', 72], ['Bell', 39], ['Douglas', 12]]); return { q: 'In 1860 Lincoln won 180 electoral votes and ' + a[0] + ' won ' + a[1] + '. How many more did Lincoln win?', year: 180 - a[1], why: '180 − ' + a[1] + ' = ' + (180 - a[1]) + '.', hint: 'Subtract.' }; } },
    { L: [3], q: 'Lincoln ran for President promising to abolish slavery in the Southern states.', tf: false, why: 'False: he pledged not to interfere with slavery where it existed, only to stop its spread.' },
    { L: [3], q: 'Lincoln won the 1860 election without winning any electoral votes from the Deep South.', tf: true, why: 'True: he was not even on the ballot in most Southern states.' },
    { L: [3], q: 'About 1858 to 1860:', all: [['Lincoln and Douglas debated seven times.', true], ['John Brown raided Harpers Ferry.', true], ['The Democrats split in 1860.', true], ['Douglas won the 1860 election.', false], ['Lincoln won a majority of the popular vote.', false]], why: 'Lincoln won the election with about 40 percent of the popular vote.' },
    { L: [2, 3], q: 'Read the source. What did Lincoln say he had "no purpose" to do?', a: 'Interfere with slavery in the states where it existed', w: ['Keep slavery out of the territories', 'Enforce federal law', 'Defend the Union'], why: '"I have no purpose, directly or indirectly, to interfere with the institution of slavery in the States where it exists."', viz: docq('From Lincoln\'s First Inaugural Address', 'March 4, 1861', 'I have no purpose, directly or indirectly, to interfere with the institution of slavery in the States where it exists. I believe I have no lawful right to do so, and I have no inclination to do so.') },
    { L: [1, 2, 3], gen: letterGen(U7L, 5) }
  ], 'Stop the spread, or abolish now? Lincoln\'s platform was the first.'));

  G('ush1.secession', fromBank([
    { L: [1, 2], q: 'Which state seceded first, in December 1860?', a: 'South Carolina', w: ['Virginia', 'Texas', 'Georgia'], why: 'South Carolina seceded on December 20, 1860.' },
    { L: [1, 2], q: 'Who was president of the Confederate States of America?', a: 'Jefferson Davis', w: ['Robert E. Lee', 'John C. Calhoun', 'Stephen A. Douglas'], why: 'Davis was chosen in February 1861.' },
    { L: [1, 2], q: 'Where did the Civil War begin in April 1861?', a: 'Fort Sumter, South Carolina', w: ['Gettysburg, Pennsylvania', 'Harpers Ferry, Virginia', 'Fort McHenry, Maryland'], why: 'Confederates fired on Fort Sumter on April 12, 1861.' },
    { L: [1, 2], q: 'Which of these slave states stayed in the Union?', a: 'Kentucky', w: ['Virginia', 'Tennessee', 'Georgia'], why: 'Delaware, Maryland, Kentucky and Missouri stayed in the Union.' },
    { L: [2, 3], q: 'How many states seceded before Lincoln took office on March 4, 1861?', a: '7', w: ['11', '4', '13'], why: 'South Carolina, Mississippi, Florida, Alabama, Georgia, Louisiana and Texas.' },
    { L: [2, 3], q: 'What made Virginia, Arkansas, North Carolina and Tennessee secede?', a: 'Fort Sumter and Lincoln\'s call for 75,000 volunteers', w: ['The Dred Scott decision', 'The Emancipation Proclamation', 'Lincoln\'s election alone'], why: 'They refused to send troops against other Southern states.' },
    { L: [2, 3], q: 'Which reason did South Carolina\'s own declaration give first for seceding?', a: 'The free states\' hostility to slavery', w: ['A new federal income tax', 'A border dispute with Georgia', 'The Monroe Doctrine'], why: '"An increasing hostility on the part of the non-slaveholding States to the Institution of Slavery."', viz: docq('Declaration of the Immediate Causes', 'South Carolina, December 1860', '…an increasing hostility on the part of the non-slaveholding States to the Institution of Slavery has led to a disregard of their obligations…') },
    { L: [2, 3], q: 'How many states joined the Confederacy in all?', a: '11', w: ['7', '13', '15'], why: 'Seven in the first wave and four after Fort Sumter.' },
    { L: [2, 3], q: 'Which new state was formed from the part of Virginia that stayed loyal to the Union?', a: 'West Virginia', w: ['Kentucky', 'Maryland', 'Delaware'], why: 'West Virginia joined the Union in 1863.' },
    { L: [2, 3], gen: function (R) { var s = R.pick([['South Carolina', 'first wave'], ['Mississippi', 'first wave'], ['Alabama', 'first wave'], ['Texas', 'first wave'], ['Georgia', 'first wave'], ['Virginia', 'after Fort Sumter'], ['North Carolina', 'after Fort Sumter'], ['Tennessee', 'after Fort Sumter'], ['Arkansas', 'after Fort Sumter'], ['Kentucky', 'stayed in the Union'], ['Maryland', 'stayed in the Union'], ['Missouri', 'stayed in the Union'], ['Delaware', 'stayed in the Union']]);
      var lab = { 'first wave': 'Seceded before Lincoln took office', 'after Fort Sumter': 'Seceded after Fort Sumter', 'stayed in the Union': 'Stayed in the Union' };
      return { q: 'Which describes ' + s[0] + ' in 1860 and 1861?', a: lab[s[1]], w: ['Seceded before Lincoln took office', 'Seceded after Fort Sumter', 'Stayed in the Union'].filter(function (x) { return x !== lab[s[1]]; }), why: s[0] + ': ' + lab[s[1]].toLowerCase() + '.' }; } },
    { L: [3], q: 'All the slave states seceded at the same time.', tf: false, why: 'False: seven before Lincoln took office, four after Fort Sumter, and four stayed in the Union.' },
    { L: [3], q: 'Most historians agree that slavery was the root cause of secession.', tf: true, why: 'True: the seceding states\' own declarations named the threat to slavery; historians weigh other factors differently.' },
    { L: [3], q: 'Which states seceded after Fort Sumter?', all: [['Virginia', true], ['Arkansas', true], ['North Carolina', true], ['Tennessee', true], ['South Carolina', false], ['Kentucky', false]], why: 'South Carolina had seceded first, in 1860; Kentucky stayed in the Union.' },
    { L: [1, 2, 3], order: [['Lincoln elected', 1860.85, 'November 1860'], ['South Carolina secedes', 1860.97, 'December 20, 1860'], ['Confederacy formed in Montgomery', 1861.1, 'February 1861'], ['Lincoln inaugurated', 1861.17, 'March 4, 1861'], ['Fort Sumter fired on', 1861.28, 'April 12, 1861'], ['Virginia secedes', 1861.29, 'April 17, 1861']] }
  ], 'Two waves of secession, and four slave states that stayed.'));

  /* ======================================================== Unit 8: The Civil War and Reconstruction (1861 to 1877) */
  var BATTLES = [['Fort Sumter fired on', 1861.28, 'April 1861'], ['First Bull Run', 1861.55, 'July 1861'], ['Shiloh', 1862.27, 'April 1862'], ['Antietam', 1862.71, 'September 1862'],
    ['Emancipation Proclamation takes effect', 1863.0, 'January 1, 1863'], ['Gettysburg', 1863.5, 'July 1863'], ['Gettysburg Address', 1863.88, 'November 1863'], ['Atlanta falls', 1864.67, 'September 1864'],
    ['Sherman reaches Savannah', 1864.97, 'December 1864'], ['Lee surrenders at Appomattox', 1865.27, 'April 1865']];
  var RECON = [['Ten Percent Plan', 1863.93, 'December 1863'], ['Freedmen\'s Bureau created', 1865.17, 'March 1865'], ['Lincoln assassinated', 1865.28, 'April 1865'], ['Thirteenth Amendment ratified', 1865.93, 'December 1865'],
    ['Civil Rights Act of 1866', 1866.27, 'April 1866'], ['Reconstruction Acts', 1867.17, 'March 1867'], ['Johnson impeached', 1868.15, 'February 1868'], ['Fourteenth Amendment ratified', 1868.52, 'July 1868'],
    ['Fifteenth Amendment ratified', 1870.09, 'February 1870'], ['Panic of 1873', 1873.7, '1873'], ['Compromise of 1877', 1877.2, '1877']];
  var U8L = [['First Bull Run', 1861], ['Antietam', 1862], ['Gettysburg', 1863], ['Atlanta falls', 1864], ['Appomattox', 1865], ['Reconstruction Acts', 1867], ['Johnson impeached', 1868], ['Fifteenth Amendment', 1870], ['Panic of 1873', 1873], ['Compromise of 1877', 1877]];

  G('ush1.two-sides', fromBank([
    {"L":[1,2,3],"q":"Who was President of the Confederacy?","a":"Jefferson Davis","w":["Robert E. Lee","Abraham Lincoln","Stonewall Jackson","Alexander Stephens"],"why":"Jefferson Davis led the Confederate government."},
    {"L":[1,2,3],"q":"Who was President of the United States during the Civil War?","a":"Abraham Lincoln","w":["Jefferson Davis","Andrew Johnson","Ulysses S. Grant","James Buchanan"],"why":"Lincoln took office in March 1861."},
    {"L":[1,2,3],"q":"Where were the first shots of the Civil War fired, in April 1861?","a":"Fort Sumter, South Carolina","w":["Gettysburg, Pennsylvania","Bull Run, Virginia","Antietam, Maryland","Vicksburg, Mississippi"],"why":"Confederate guns fired on Fort Sumter on April 12, 1861."},
    {"L":[1,2,3],"q":"What was the capital of the Confederacy for most of the war?","a":"Richmond, Virginia","w":["Atlanta, Georgia","Charleston, South Carolina","Montgomery, Alabama","New Orleans, Louisiana"],"why":"The capital moved from Montgomery to Richmond in 1861."},
    {"L":[2,3],"q":"Which slave states stayed in the Union?","a":"Delaware, Maryland, Kentucky and Missouri","w":["Virginia, Georgia, Texas and Alabama","Ohio, Indiana, Illinois and Iowa","Tennessee, Arkansas, Florida and Louisiana"],"why":"These were the border states."},
    { L: [1, 2], q: 'Which side had more factories and railroads in 1861?', a: 'The Union', w: ['The Confederacy', 'They had about the same'], why: 'The North had about 90 percent of manufacturing and more than twice the railroad mileage.' },
    { L: [1, 2], q: 'What was the Anaconda Plan?', a: 'A Union plan to blockade the Southern coast and seize the Mississippi River', w: ['A Confederate plan to capture Washington', 'A plan to buy Cuba', 'A treaty with Britain'], why: 'General Winfield Scott\'s plan aimed to squeeze the South like a snake.' },
    { L: [1, 2], q: 'Who commanded the Confederacy\'s most famous army, the Army of Northern Virginia?', a: 'Robert E. Lee', w: ['Ulysses S. Grant', 'William T. Sherman', 'Winfield Scott'], why: 'Lee took command in 1862 and surrendered at Appomattox in 1865.' },
    { L: [1, 2], q: 'What did the Confederacy need to do to win?', a: 'Survive until the North gave up', w: ['Conquer the North', 'Capture New York City', 'Win every battle'], why: 'The Union had to conquer; the Confederacy had only to outlast Northern will.' },
    { L: [2, 3], q: 'About how many free people lived in the Confederate states in 1860?', a: 'About 5.5 million', w: ['About 22 million', 'About 55 million', 'About 1 million'], why: 'About 5.5 million free people and 3.5 million enslaved people; the loyal states had about 22 million.' },
    { L: [2, 3], q: 'Why did Confederate leaders hope Britain and France would help them?', a: 'Their textile mills depended on Southern cotton', w: ['They had signed treaties of alliance', 'Both countries allowed slavery at home', 'Both had promised to invade the North'], why: '"Cotton diplomacy" failed; neither recognized the Confederacy.' },
    { L: [2, 3], q: 'Which was an advantage of the Confederacy?', a: 'Fighting mostly on home ground, on the defensive', w: ['A larger population', 'More factories', 'A larger navy'], why: 'Defenders knew the land and had shorter supply lines.' },
    { L: [2, 3], q: 'Why did the Union want control of the Mississippi River?', a: 'To split the Confederacy and open the river to Northern trade', w: ['To reach the Pacific Ocean', 'To protect the Erie Canal', 'To attack Canada'], why: 'It would cut off Texas, Louisiana and Arkansas from the rest of the South.' },
    { L: [2, 3], q: 'About how many miles of railroad did the Union states have in 1860, compared with about 9,500 in the Confederacy?', a: 'About 22,000', w: ['About 5,000', 'About 9,500', 'About 100,000'], why: 'More than twice as much, which moved troops and supplies.' },
    { L: [3], q: 'The Union\'s larger population and industry made its victory certain from the start.', tf: false, why: 'False: the Confederacy only had to survive; victory took four years and depended on battles and Northern will.' },
    { L: [3], q: 'As late as August 1864, Lincoln expected he might lose reelection.', tf: true, why: 'True: he wrote a memorandum on August 23, 1864, predicting likely defeat. The fall of Atlanta changed the mood.' },
    { L: [3], q: 'Union advantages in 1861:', all: [['A larger population', true], ['Most of the factories', true], ['More railroads', true], ['Fighting on home ground', false], ['Needing only to survive', false]], why: 'Home ground and needing only to survive were Confederate advantages.' },
    { L: [1, 2, 3], gen: function (R) { var c = R.pick([['Larger population', 'Union'], ['Most of the factories', 'Union'], ['More railroads', 'Union'], ['A navy to blockade the coast', 'Union'], ['Fighting on home ground', 'Confederacy'], ['Only needed to survive', 'Confederacy'], ['Many experienced officers', 'Confederacy']]);
      return { q: 'Whose advantage was this at the start of the war? "' + c[0] + '"', a: 'The ' + c[1], w: [c[1] === 'Union' ? 'The Confederacy' : 'The Union'], why: c[0] + ': an advantage of the ' + c[1] + '.' }; } }
  ], 'Compare what each side had with what each side needed to do.'));

  G('ush1.civil-war-battles', fromBank([
    {"L":[1,2,3],"q":"Which general captured Vicksburg in July 1863?","a":"Ulysses S. Grant","w":["George McClellan","William T. Sherman","Robert E. Lee","George Meade"],"why":"Vicksburg surrendered to Grant on July 4, 1863."},
    {"L":[1,2,3],"q":"Which battle in July 1861 was the first major battle of the war?","a":"First Bull Run (First Manassas)","w":["Gettysburg","Antietam","Shiloh","Fredericksburg"],"why":"The Confederates won at Bull Run on July 21, 1861."},
    {"L":[1,2,3],"q":"Which Union general led the \"March to the Sea\" through Georgia in 1864?","a":"William T. Sherman","w":["Ulysses S. Grant","George McClellan","Ambrose Burnside","George Meade"],"why":"Sherman marched from Atlanta to Savannah."},
    {"L":[2,3],"q":"Which battle in Tennessee in April 1862 shocked both sides with its losses?","a":"Shiloh","w":["Antietam","Gettysburg","Chancellorsville","Bull Run"],"why":"More than 23,000 men were killed, wounded or missing at Shiloh."},
    {"L":[2,3],"q":"Which city did Sherman capture in September 1864?","a":"Atlanta","w":["Richmond","Vicksburg","Charleston","New Orleans"],"why":"The fall of Atlanta boosted Northern morale."},
    { L: [1, 2], q: 'Where did Lee surrender to Grant in April 1865?', a: 'Appomattox Court House, Virginia', w: ['Gettysburg, Pennsylvania', 'Fort Sumter, South Carolina', 'Vicksburg, Mississippi'], why: 'April 9, 1865, at Appomattox Court House.' },
    { L: [1, 2], q: 'Which battle, in July 1863, turned back Lee\'s invasion of the North?', a: 'Gettysburg', w: ['Bull Run', 'Antietam', 'Appomattox'], why: 'Gettysburg, Pennsylvania, July 1 to 3, 1863.' },
    { L: [1, 2], q: 'Which battle of September 17, 1862, was the bloodiest single day in American history?', a: 'Antietam', w: ['Gettysburg', 'Bull Run', 'Fort Sumter'], why: 'About 23,000 men were killed, wounded or missing in one day.' },
    { L: [1, 2], q: 'What did the fall of Vicksburg (July 4, 1863) give the Union?', a: 'Control of the Mississippi River', w: ['The Confederate capital', 'The city of Atlanta', 'Control of the Atlantic coast'], why: 'With Port Hudson five days later, the whole river was in Union hands.' },
    { L: [1, 2, 3], q: 'In what year did Lee surrender at Appomattox?', year: 1865, why: 'April 9, 1865.' },
    { L: [2, 3], q: 'Which Union general led the March to the Sea, from Atlanta to Savannah, in 1864?', a: 'William T. Sherman', w: ['Ulysses S. Grant', 'George McClellan', 'Robert E. Lee'], why: 'Sherman took Atlanta in September and reached Savannah in December 1864.' },
    { L: [2, 3], q: 'What did the first Battle of Bull Run (July 1861) show?', a: 'That the war would be long and hard', w: ['That the Union would win quickly', 'That Britain would join the war', 'That the Confederacy was about to surrender'], why: 'A Confederate victory near Washington ended hopes of a short war.' },
    { L: [2, 3], q: 'Why did the fall of Atlanta in September 1864 matter so much?', a: 'It came two months before the election and helped Lincoln win', w: ['It ended the war at once', 'It was the Confederate capital', 'It freed all enslaved people'], why: 'Northern voters saw the war could be won, and Lincoln was reelected in November.' },
    { L: [2, 3], q: 'After Antietam, Lincoln announced which policy?', a: 'The preliminary Emancipation Proclamation', w: ['The Homestead Act', 'The Ten Percent Plan', 'The draft'], why: 'He had waited for a victory; he issued it on September 22, 1862.' },
    { L: [2, 3], q: 'Which general won in the West at Vicksburg and later commanded all Union armies?', a: 'Ulysses S. Grant', w: ['William T. Sherman', 'George McClellan', 'Stonewall Jackson'], why: 'Grant took Vicksburg in 1863 and accepted Lee\'s surrender in 1865.' },
    { L: [3], q: 'The Battle of Gettysburg ended the Civil War.', tf: false, why: 'False: Gettysburg came in July 1863; the war went on until April 1865.' },
    { L: [3], q: 'More Civil War soldiers died of disease than in battle.', tf: true, why: 'True: about two of every three deaths were from disease.' },
    { L: [3], q: 'About the turning points:', all: [['Antietam came before Gettysburg.', true], ['Vicksburg fell the day after Gettysburg ended.', true], ['Atlanta fell before Lincoln\'s reelection.', true], ['Appomattox came in 1863.', false], ['Bull Run was a Union victory.', false]], why: 'Appomattox was in 1865; the Confederates won at Bull Run.' },
    { L: [1, 2, 3], order: BATTLES },
    { L: [2, 3], gen: letterGen([['First Bull Run', 1861], ['Antietam', 1862], ['Gettysburg', 1863], ['Atlanta falls', 1864], ['Appomattox', 1865]], 5) }
  ], 'One a year: 1861 Bull Run, 1862 Antietam, 1863 Gettysburg, 1864 Atlanta, 1865 Appomattox.'));

  G('ush1.emancipation', fromBank([
    { L: [1, 2], q: 'When did the Emancipation Proclamation take effect?', a: 'January 1, 1863', w: ['July 4, 1776', 'April 9, 1865', 'December 6, 1865'], why: 'Lincoln issued the final proclamation on January 1, 1863.' },
    { L: [1, 2], q: 'Which amendment abolished slavery everywhere in the United States?', a: 'The Thirteenth', w: ['The First', 'The Fourteenth', 'The Nineteenth'], why: 'Ratified December 6, 1865.' },
    { L: [1, 2], q: 'The Emancipation Proclamation declared freedom for enslaved people in…', a: 'areas in rebellion against the Union', w: ['every state in the country', 'only the border states', 'only Washington, D.C.'], why: 'It applied to areas still in rebellion, not the loyal border states.' },
    { L: [1, 2], q: 'About how many Black soldiers served in the Union army?', a: 'About 180,000', w: ['About 1,800', 'About 18,000', 'About 1.8 million'], why: 'About 180,000, roughly one in ten Union soldiers.' },
    { L: [2, 3], q: 'Why did Lincoln issue the preliminary proclamation in September 1862?', a: 'Antietam gave him the victory he wanted before announcing it', w: ['The war had just ended', 'Congress ordered him to', 'Britain had declared war'], why: 'He did not want it to look like a desperate act after defeats.' },
    { L: [2, 3], q: 'Why did the Proclamation not free enslaved people in Kentucky?', a: 'Kentucky was a loyal state, not in rebellion', w: ['Kentucky had already ended slavery', 'Kentucky was part of Canada', 'The Supreme Court forbade it'], why: 'As a war measure, it reached only areas in rebellion. Slavery in Kentucky ended with the Thirteenth Amendment.' },
    { L: [2, 3], q: 'Under what power did Lincoln issue the Proclamation?', a: 'His war powers as commander in chief', w: ['An act of the Supreme Court', 'A constitutional amendment', 'A vote of the Confederate Congress'], why: '"As a fit and necessary war measure for suppressing said rebellion."' },
    { L: [2, 3], q: 'What does Juneteenth (June 19, 1865) mark?', a: 'The announcement of freedom in Galveston, Texas', w: ['Lee\'s surrender', 'The Gettysburg Address', 'The ratification of the Fifteenth Amendment'], why: 'Union troops announced freedom in Galveston on June 19, 1865.' },
    { L: [2, 3], q: 'Read the source. Which phrase limits where the Proclamation applies?', a: 'within said designated States, and parts of States', w: ['henceforward shall be free', 'all persons held as slaves', 'the Executive government'], why: 'It freed people only in the places it listed, those in rebellion.', viz: docq('The Emancipation Proclamation', 'January 1, 1863', '…I do order and declare that all persons held as slaves within said designated States, and parts of States, are, and henceforward shall be free…') },
    { L: [2, 3], q: 'Which Black regiment led the assault on Fort Wagner in July 1863?', a: 'The 54th Massachusetts', w: ['The 7th New York', 'The 20th Maine', 'The 1st Virginia'], why: 'Its courage at Fort Wagner showed the North what Black soldiers would do.' },
    { L: [3], q: 'The Emancipation Proclamation freed every enslaved person in the country at once.', tf: false, why: 'False: it applied only to areas in rebellion; freedom came as Union armies advanced, and the Thirteenth Amendment made it nationwide.' },
    { L: [3], q: 'The Proclamation allowed Black men to serve in the Union army and navy.', tf: true, why: 'True: about 180,000 served in the army.' },
    { L: [3], q: 'About emancipation:', all: [['The preliminary proclamation came after Antietam.', true], ['The Thirteenth Amendment was ratified in 1865.', true], ['Freedom often came when Union troops arrived.', true], ['The Proclamation applied to the border states.', false], ['Congress passed the Proclamation as a law.', false]], why: 'It was a presidential war measure that left out the loyal border states.' },
    { L: [1, 2, 3], order: [['Slavery abolished in Washington, D.C.', 1862.3, 'April 1862'], ['Antietam', 1862.71, 'September 17, 1862'], ['Preliminary proclamation', 1862.72, 'September 22, 1862'], ['Emancipation Proclamation takes effect', 1863.0, 'January 1, 1863'], ['Congress passes the Thirteenth Amendment', 1865.08, 'January 1865'], ['Juneteenth in Galveston', 1865.46, 'June 19, 1865'], ['Thirteenth Amendment ratified', 1865.93, 'December 1865']] }
  ], 'Ask two questions: where did it apply, and when did the army get there?'));

  G('ush1.home-fronts', fromBank([
    { L: [1, 2], q: 'What did the Homestead Act (1862) offer?', a: '160 acres of public land to settlers who farmed it for five years', w: ['Free college to every soldier', 'A pension to every family', 'Free train tickets west'], why: 'Signed May 20, 1862.' },
    { L: [1, 2], q: 'What set off the New York City draft riots of July 1863?', a: 'Anger at the Union draft', w: ['The fall of Fort Sumter', 'A new tax on tea', 'The end of the war'], why: 'Many resented that a man could pay \\$300 to avoid service.' },
    { L: [1, 2], q: 'What does suspending habeas corpus allow?', a: 'Holding people in jail without bringing them before a judge', w: ['Drafting soldiers', 'Printing paper money', 'Closing newspapers by law'], why: 'Habeas corpus is a court order to bring a prisoner before a judge. Lincoln suspended it in some areas.' },
    { L: [1, 2], q: 'Which reformer became superintendent of Union army nurses?', a: 'Dorothea Dix', w: ['Harriet Beecher Stowe', 'Elizabeth Cady Stanton', 'Sojourner Truth'], why: 'Dix, known for her work for the mentally ill, organized army nurses.' },
    { L: [2, 3], q: 'What did the Morrill Land-Grant Act (1862) do?', a: 'Gave states federal land to fund colleges of agriculture and engineering', w: ['Gave land to the railroads', 'Gave land to freedpeople', 'Sold land to Britain'], why: 'Many state universities began as land-grant colleges.' },
    { L: [2, 3], q: 'What did the Pacific Railway Act (1862) support?', a: 'A railroad to the Pacific', w: ['A canal across Panama', 'A railroad to Canada', 'A navy for the Pacific'], why: 'It chartered the Union Pacific and Central Pacific railroads.' },
    { L: [2, 3], q: 'Which side drafted soldiers first?', a: 'The Confederacy (April 1862)', w: ['The Union (April 1861)', 'Neither side drafted soldiers', 'Both began on the same day'], why: 'The Confederacy\'s Conscription Act came in April 1862; the Union\'s Enrollment Act in March 1863.' },
    { L: [2, 3], q: 'Why could Congress pass the Homestead and Pacific Railway Acts in 1862?', a: 'Southern members, who had blocked them, had left Congress', w: ['The Supreme Court ordered it', 'The Confederacy asked for them', 'The war had ended'], why: 'With the South gone, Republicans had large majorities.' },
    { L: [2, 3], q: 'What were "greenbacks"?', a: 'Paper money issued by the Union government', w: ['Confederate soldiers', 'Land grants for colleges', 'A kind of cotton'], why: 'The Legal Tender Act of 1862 created them to help pay for the war.' },
    { L: [2, 3], q: 'What happened in Richmond in April 1863?', a: 'Hungry women led a bread riot', w: ['The Confederacy surrendered', 'Lincoln gave a speech', 'The first draft began'], why: 'Shortages and soaring prices hit Confederate cities hard.' },
    { L: [3], q: 'The Civil War affected only the soldiers who fought it.', tf: false, why: 'False: it brought an income tax, paper money, a draft, shortages and new federal laws for the West.' },
    { L: [3], q: 'The first federal income tax was passed during the Civil War.', tf: true, why: 'True: the Revenue Act of 1861.' },
    { L: [3], q: 'Which were passed by Congress in 1862?', all: [['The Homestead Act', true], ['The Morrill Land-Grant Act', true], ['The Pacific Railway Act', true], ['The Fifteenth Amendment', false], ['The Indian Removal Act', false]], why: 'The Fifteenth Amendment came in 1870; the Removal Act in 1830.' },
    { L: [1, 2, 3], gen: function (R) { var c = R.pick([['The Enrollment Act draft (1863)', 'Raising armies'], ['Confederate Conscription Act (1862)', 'Raising armies'], ['The first federal income tax (1861)', 'Paying for the war'], ['Greenbacks: paper money (1862)', 'Paying for the war'], ['Homestead Act (1862)', 'Laws for the West and the future'], ['Morrill Land-Grant Act (1862)', 'Laws for the West and the future'], ['Pacific Railway Act (1862)', 'Laws for the West and the future']]);
      return { q: 'Which kind of wartime measure was this? "' + c[0] + '"', a: c[1], w: ['Raising armies', 'Paying for the war', 'Laws for the West and the future'].filter(function (x) { return x !== c[1]; }), why: c[0] + ': ' + c[1].toLowerCase() + '.' }; } }
  ], 'Think of the war as a giant job: find soldiers, find money, keep the country going.'));

  G('ush1.gettysburg-address', fromBank([
    {"L":[1,2,3],"q":"In which state is Gettysburg?","a":"Pennsylvania","w":["Virginia","Maryland","Ohio","New York"],"why":"Gettysburg is in southern Pennsylvania."},
    {"L":[1,2,3],"q":"What are the first words of the Gettysburg Address?","a":"\"Four score and seven years ago\"","w":["\"We hold these truths to be self-evident\"","\"We the People\"","\"With malice toward none\""],"why":"Lincoln began, \"Four score and seven years ago our fathers brought forth on this continent, a new nation.\""},
    {"L":[1,2,3],"q":"Lincoln said the nation shall have \"a new birth of\"…","a":"freedom","w":["money","industry","land"],"why":"\"…that this nation, under God, shall have a new birth of freedom.\""},
    {"L":[1,2,3],"q":"Lincoln hoped that \"government of the people, by the people, for the people, shall not…\"","a":"\"perish from the earth\"","w":["\"be taxed again\"","\"meet in Washington\"","\"forget this day\""],"why":"Those are the closing words of the address."},
    {"L":[1,2,3],"q":"\"Four score and seven years\" before 1863 points back to which year and document?","a":"1776 and the Declaration of Independence","w":["1787 and the Constitution","1791 and the Bill of Rights","1803 and the Louisiana Purchase"],"why":"1863 minus 87 is 1776."},
    {"L":[2,3],"q":"Who gave the long main speech at Gettysburg before Lincoln spoke?","a":"Edward Everett","w":["Frederick Douglass","Daniel Webster","William Seward"],"why":"Everett spoke for about two hours."},
    { L: [1, 2], q: 'When did Lincoln give the Gettysburg Address?', a: 'November 19, 1863', w: ['July 4, 1863', 'January 1, 1863', 'April 14, 1865'], why: 'At the dedication of the cemetery, four and a half months after the battle.' },
    { L: [1, 2], q: 'About how long did the Gettysburg Address take to deliver?', a: 'About two minutes', w: ['About two hours', 'About twenty minutes', 'About a whole day'], why: 'About 272 words. Edward Everett, before him, spoke for about two hours.' },
    { L: [1, 2], q: 'Why was the Gettysburg Address given?', a: 'To dedicate a cemetery for Union soldiers', w: ['To announce the end of the war', 'To begin Lincoln\'s second term', 'To free enslaved people'], why: 'The Soldiers\' National Cemetery at Gettysburg was dedicated that day.' },
    { L: [1, 2, 3], q: '"Four score and seven years ago." A score is 20. How many years is four score and seven?', year: 87, why: '4 × 20 + 7 = 87.', hint: 'Multiply 4 by 20, then add 7.' },
    { L: [2, 3], q: 'Counting back "four score and seven years" from 1863 reaches which year?', year: 1776, why: '1863 − 87 = 1776, the year of the Declaration of Independence.', hint: '1863 minus 87.' },
    { L: [2, 3], q: 'By counting back to 1776, Lincoln dated the nation from…', a: 'the Declaration of Independence', w: ['the Constitution', 'the Treaty of Paris', 'Jamestown'], why: 'He tied the nation to the Declaration\'s promise that "all men are created equal."' },
    { L: [2, 3], q: 'Complete Lincoln\'s phrase: "government of the people, by the people, ___"', a: 'for the people', w: ['with the people', 'over the people', 'and the states'], why: '"…government of the people, by the people, for the people, shall not perish from the earth."' },
    { L: [2, 3], q: 'What did Lincoln hope the nation would have?', a: '"a new birth of freedom"', w: ['"a more perfect union"', '"life, liberty and the pursuit of happiness"', '"liberty and justice for all"'], why: '"That this nation, under God, shall have a new birth of freedom." The others come from the Constitution, the Declaration and the Pledge.' },
    { L: [2, 3], q: 'Read the source. Which phrase describes the war as a test?', a: 'testing whether that nation, or any nation so conceived and so dedicated, can long endure', w: ['Four score and seven years ago', 'a final resting place', 'It is altogether fitting and proper'], why: 'Lincoln framed the war as a test of whether a free nation can survive.', viz: { name: 'cv-doc', opts: { doc: 'gettysburg', quiet: true, interactive: false } } },
    { L: [2, 3], q: 'How many copies of the Gettysburg Address in Lincoln\'s own hand survive?', a: 'Five', w: ['None', 'One', 'Twelve'], why: 'The Nicolay, Hay, Everett, Bancroft and Bliss copies.' },
    { L: [3], q: 'Lincoln wrote the Gettysburg Address on the back of an envelope on the train.', tf: false, why: 'False: that story is a legend. He prepared drafts beforehand, and five copies in his hand survive.' },
    { L: [3], q: 'The Gettysburg Address was much shorter than the main speech that day.', tf: true, why: 'True: Everett spoke for about two hours; Lincoln for about two minutes.' },
    { L: [3], q: 'About the Gettysburg Address:', all: [['It was about 272 words long.', true], ['It quoted the idea that "all men are created equal."', true], ['It called for "a new birth of freedom."', true], ['It announced the end of slavery.', false], ['It was given on the day the battle ended.', false]], why: 'The Emancipation Proclamation was earlier that year; the speech came in November, months after the battle.' }
  ], 'Do the arithmetic: four score and seven years back from 1863.'));

  G('ush1.presidential-reconstruction', fromBank([
    { L: [1, 2], q: 'Who assassinated Abraham Lincoln in April 1865?', a: 'John Wilkes Booth', w: ['John Brown', 'Jefferson Davis', 'Andrew Johnson'], why: 'Booth shot Lincoln at Ford\'s Theatre on April 14, 1865.' },
    { L: [1, 2], q: 'Who became President after Lincoln\'s death?', a: 'Andrew Johnson', w: ['Ulysses S. Grant', 'Rutherford B. Hayes', 'Jefferson Davis'], why: 'Johnson, a Tennessee Democrat who stayed loyal to the Union, was Vice President.' },
    { L: [1, 2], q: 'What were the Black Codes?', a: 'Southern state laws that limited freedpeople\'s rights', w: ['Laws that gave freedpeople land', 'Union army rules', 'The Reconstruction Amendments'], why: 'Passed in 1865 and 1866, first in Mississippi and South Carolina.' },
    { L: [1, 2], q: 'How did Johnson treat most former Confederates?', a: 'Leniently: he pardoned most of them', w: ['He jailed all of them', 'He took away all their land', 'He banned them from voting forever'], why: 'His plan let Southern states rejoin quickly.' },
    { L: [2, 3], q: 'What was Lincoln\'s Ten Percent Plan (1863)?', a: 'A state could form a new government once 10 percent of its 1860 voters swore loyalty', w: ['Each freedperson would get 10 acres', 'Ten percent of the army would stay in the South', 'Southern states would pay a 10 percent tax'], why: 'It also required accepting emancipation.' },
    { L: [2, 3], q: 'Why did Lincoln pocket-veto the Wade-Davis Bill (1864)?', a: 'He thought its demand for a majority loyalty oath was too harsh', w: ['He wanted to free no one', 'It ended the war too soon', 'It gave the vote to women'], why: 'Wade-Davis required a majority of white men to swear loyalty, against Lincoln\'s 10 percent.' },
    { L: [2, 3], q: 'What did vagrancy laws in the Black Codes allow?', a: 'Arresting freedpeople without a labor contract and selling their labor to pay fines', w: ['Giving freedpeople free land', 'Letting freedpeople vote', 'Paying freedpeople a pension'], why: 'They forced freedpeople back to plantation labor on employers\' terms.' },
    { L: [2, 3], q: 'When was the Freedmen\'s Bureau created?', a: 'March 1865', w: ['January 1863', 'March 1867', 'April 1877'], why: 'Created March 3, 1865, to give relief, schools and help with labor contracts.' },
    { L: [2, 3], q: 'Why did many Northerners turn against Johnson\'s plan by 1866?', a: 'The South elected former Confederates and passed Black Codes', w: ['Johnson freed all prisoners of war', 'The South refused to end slavery after the Thirteenth Amendment was ratified', 'Johnson gave land to freedpeople'], why: 'It looked as if the South was rebuilding slavery under another name.' },
    { L: [3], q: 'Reconstruction began with harsh military rule over the South.', tf: false, why: 'False: the first phase under Johnson (1865 to 1866) was lenient; Congress took control in 1867.' },
    { L: [3], q: 'Lincoln was assassinated five days after Lee\'s surrender at Appomattox.', tf: true, why: 'True: Appomattox was April 9; Booth shot Lincoln on April 14, 1865.' },
    { L: [3], q: 'About presidential Reconstruction:', all: [['Johnson pardoned most former Confederates.', true], ['Black Codes limited freedpeople\'s rights.', true], ['Lincoln proposed the Ten Percent Plan.', true], ['Johnson required that Black men be allowed to vote.', false], ['Congress controlled Reconstruction in 1865.', false]], why: 'Johnson left voting to the states; Congress took control in 1867.' },
    { L: [1, 2, 3], order: RECON.slice(0, 6) }
  ], 'Lenient first (Lincoln and Johnson), then stricter (Congress, 1867).'));

  G('ush1.congressional-reconstruction', fromBank([
    { L: [1, 2], q: 'What did the Reconstruction Acts of 1867 do?', a: 'Put most of the South under military districts and required voting by Black men', w: ['Ended the Freedmen\'s Bureau', 'Pardoned all Confederates', 'Moved the capital to Richmond'], why: 'Five military districts; new state constitutions with Black men voting.' },
    { L: [1, 2], q: 'What happened when the House impeached Andrew Johnson in 1868?', a: 'The Senate acquitted him by one vote', w: ['He was removed from office', 'He resigned', 'The Supreme Court removed him'], why: '35 to 19, one short of the two-thirds needed.' },
    { L: [1, 2], q: 'Who was the first Black U.S. senator (1870)?', a: 'Hiram Revels', w: ['Frederick Douglass', 'Blanche K. Bruce', 'Booker T. Washington'], why: 'Revels of Mississippi took his seat in February 1870.' },
    { L: [1, 2], q: 'Who were the Radical Republicans?', a: 'Republicans in Congress who pushed hardest to protect freedpeople\'s rights', w: ['Southern Democrats', 'Confederate generals', 'Supreme Court justices'], why: 'Leaders included Thaddeus Stevens and Charles Sumner.' },
    { L: [2, 3], q: 'How did the Civil Rights Act of 1866 become law?', a: 'Congress passed it over Johnson\'s veto', w: ['Johnson signed it gladly', 'The Supreme Court wrote it', 'The states ratified it'], why: 'It took two-thirds of each house to override.' },
    { L: [2, 3], q: 'Why was Johnson impeached?', a: 'He fired the Secretary of War in defiance of the Tenure of Office Act', w: ['He was accused of planning Lincoln\'s murder', 'He refused to sign the Thirteenth Amendment', 'He lost the 1866 election'], why: 'Firing Edwin Stanton was the main charge; the deeper fight was over Reconstruction.' },
    { L: [2, 3], q: 'In 1868 there were 54 senators. How many votes were needed to convict Johnson (two-thirds)?', year: 36, why: 'Two-thirds of 54 is 36. The vote was 35 to 19, one short.', hint: 'Find two-thirds of 54.' },
    { L: [2, 3], q: 'About how many Black men held public office during Reconstruction?', a: 'About 1,500 to 2,000', w: ['About 15 to 20', 'About 150,000', 'None'], why: 'From sheriff to state legislator to member of Congress.' },
    { L: [2, 3], q: 'Which constitutional checks were used in the fight between Congress and Johnson?', a: 'Vetoes, veto overrides and impeachment', w: ['Judicial review only', 'A constitutional convention', 'A national referendum'], why: 'Johnson vetoed; Congress overrode; the House impeached.', viz: { name: 'cv-branches', opts: { checks: ['veto', 'override', 'impeach'], quiet: true, interactive: false } } },
    { L: [3], q: 'Black officeholders controlled most Southern state governments during Reconstruction.', tf: false, why: 'False: about 1,500 to 2,000 served, but white Republicans held most offices.' },
    { L: [3], q: 'Hiram Revels took the Senate seat once held by Jefferson Davis.', tf: true, why: 'True: the Mississippi seat Davis had left in 1861.' },
    { L: [3], q: 'About congressional Reconstruction:', all: [['Congress overrode Johnson\'s vetoes.', true], ['The Reconstruction Acts required Black men\'s voting.', true], ['The Senate acquitted Johnson.', true], ['Johnson was removed from office.', false], ['The Freedmen\'s Bureau was ended in 1866.', false]], why: 'Johnson finished his term; Congress extended the Bureau in 1866.' },
    { L: [1, 2, 3], order: RECON.slice(3, 9) },
    { L: [2, 3], gen: function (R) { var t = R.pick([['House', 'impeach the President'], ['Senate', 'try an impeachment and remove an official'], ['President', 'veto a bill'], ['Congress', 'override a veto by two-thirds of each house']]); return { q: 'Which holds this power: to ' + t[1] + '?', a: 'The ' + t[0], w: ['The House', 'The Senate', 'The President', 'Congress', 'The Supreme Court'].filter(function (x) { return x !== 'The ' + t[0]; }), why: 'The ' + t[0] + ' can ' + t[1] + '.' }; } }
  ], 'Use the checks: veto, override, impeachment. Who used which?'));

  G('ush1.reconstruction-amendments', fromBank([
    { L: [1, 2], q: 'Which amendment abolished slavery?', a: 'The Thirteenth', w: ['The Fourteenth', 'The Fifteenth', 'The Nineteenth'], why: 'The Thirteenth (1865).' },
    { L: [1, 2], q: 'Which amendment made all persons born in the United States citizens?', a: 'The Fourteenth', w: ['The Thirteenth', 'The Fifteenth', 'The First'], why: 'The Fourteenth (1868), which overturned Dred Scott on citizenship.' },
    { L: [1, 2], q: 'Which amendment barred denying the vote because of race?', a: 'The Fifteenth', w: ['The Thirteenth', 'The Fourteenth', 'The Nineteenth'], why: 'The Fifteenth (1870).' },
    { L: [1, 2], q: 'Free, citizen, vote: which three amendments, in order?', a: '13, 14, 15', w: ['14, 13, 15', '15, 14, 13', '1, 2, 3'], why: '13th free (1865), 14th citizen (1868), 15th vote (1870).' },
    { L: [2, 3], q: 'Which amendment promises "the equal protection of the laws"?', a: 'The Fourteenth', w: ['The Thirteenth', 'The Fifteenth', 'The Fifth'], why: 'Section 1 of the Fourteenth, a limit on the states.' },
    { L: [2, 3], q: 'In what year was the Fourteenth Amendment ratified?', a: '1868', w: ['1865', '1870', '1863', '1877'], why: 'July 1868.' },
    { L: [2, 3], q: 'In what year was the Fifteenth Amendment ratified?', a: '1870', w: ['1865', '1868', '1920', '1877'], why: 'February 1870.' },
    { L: [2, 3], q: 'What was new about the Fourteenth Amendment\'s "No State shall…"?', a: 'It limited what state governments could do to people\'s rights', w: ['It abolished the states', 'It gave states power over the national government', 'It applied only to Congress'], why: 'The Bill of Rights had limited only the national government.', viz: { name: 'cv-doc', opts: { doc: 'amend14', quiet: true, interactive: false, marks: [{ text: 'No State shall' }] } } },
    { L: [2, 3], q: 'Read the amendment: "The right of citizens of the United States to vote shall not be denied or abridged … on account of race, color, or previous condition of servitude." Which one is it?', a: 'The Fifteenth', w: ['The Thirteenth', 'The Fourteenth', 'The Nineteenth'], why: 'The Fifteenth (1870). The Nineteenth (1920) covers sex.' },
    { L: [2, 3], q: 'Which earlier Supreme Court decision did the Fourteenth Amendment\'s citizenship clause overturn?', a: 'Dred Scott v. Sandford', w: ['Marbury v. Madison', 'McCulloch v. Maryland', 'Worcester v. Georgia'], why: 'Dred Scott (1857) had said Black Americans could not be citizens.' },
    { L: [3], q: 'The Fifteenth Amendment gave women the right to vote.', tf: false, why: 'False: it barred discrimination by race, color or previous servitude. Women won the vote with the Nineteenth (1920).' },
    { L: [3], q: 'Each Reconstruction Amendment gave Congress power to enforce it by appropriate legislation.', tf: true, why: 'True: the 13th and 15th in Section 2, the 14th in Section 5.' },
    { L: [3], q: 'About the Reconstruction Amendments:', all: [['The 13th ended slavery.', true], ['The 14th includes due process and equal protection.', true], ['The 15th protects voting against racial discrimination.', true], ['The 14th gave women the vote.', false], ['All three were ratified in 1865.', false]], why: 'They were ratified in 1865, 1868 and 1870; women\'s vote came in 1920.' },
    { L: [1, 2, 3], gen: function (R) { var c = R.pick([['Abolished slavery', '13th'], ['Citizenship for all persons born here', '14th'], ['Equal protection of the laws', '14th'], ['Due process limits on the states', '14th'], ['No denying the vote because of race', '15th'], ['Ratified 1865', '13th'], ['Ratified 1868', '14th'], ['Ratified 1870', '15th']]);
      return { q: 'Which amendment: "' + c[0] + '"?', a: 'The ' + c[1], w: ['The 13th', 'The 14th', 'The 15th'].filter(function (x) { return x !== 'The ' + c[1]; }), why: c[0] + ': the ' + c[1] + ' Amendment.' }; } }
  ], 'Free (13th), citizen (14th), vote (15th).'));

  G('ush1.end-of-reconstruction', fromBank([
    { L: [1, 2], q: 'What did the Compromise of 1877 settle?', a: 'The disputed presidential election of 1876', w: ['The border with Mexico', 'Slavery in Kansas', 'The national bank'], why: 'Hayes became President, and federal troops stopped guarding the last Republican statehouses in the South.' },
    { L: [1, 2], q: 'Who became President after the disputed election of 1876?', a: 'Rutherford B. Hayes', w: ['Samuel J. Tilden', 'Ulysses S. Grant', 'Andrew Johnson'], why: 'A commission gave Hayes all 20 disputed electoral votes: 185 to 184.' },
    { L: [1, 2], q: 'What was sharecropping?', a: 'Farming someone else\'s land for a share of the crop', w: ['Selling crops to the government', 'Owning a large plantation', 'Working in a factory for wages'], why: 'Many freedpeople farmed this way, often falling into debt.' },
    { L: [1, 2], q: 'The Ku Klux Klan in the Reconstruction years used violence to…', a: 'keep Black Southerners from voting and drive out Republicans', w: ['enforce the Fifteenth Amendment', 'protect freedpeople', 'collect federal taxes'], why: 'Klan terror targeted Black voters and Republican officials.' },
    { L: [2, 3], q: 'Which economic crisis turned Northern attention away from Reconstruction?', a: 'The Panic of 1873', w: ['The Panic of 1819', 'The Great Depression', 'The Panic of 1907'], why: 'A long depression began in 1873.' },
    { L: [2, 3], q: 'What did the Enforcement Acts of 1870 and 1871 do?', a: 'Let federal courts and troops act against groups such as the Klan', w: ['Ended the Freedmen\'s Bureau', 'Required segregation', 'Repealed the Fifteenth Amendment'], why: 'They included the Ku Klux Klan Act of 1871.' },
    { L: [2, 3], q: 'In the 1876 election, how many electoral votes did Tilden have before the disputed votes were decided?', a: '184, one short of a majority', w: ['185, a majority', '20', '270'], why: 'Tilden had 184; the 20 disputed votes all went to Hayes, who won 185 to 184.', viz: { name: 'cv-ec', opts: { mode: 'results', election: 1876, interactive: false } } },
    { L: [2, 3], q: 'How did the Electoral Commission of 1877 vote on the disputed electoral votes?', a: '8 to 7, along party lines', w: ['15 to 0', '9 to 6, across party lines', 'It never voted'], why: 'Eight Republicans and seven Democrats; every disputed vote went to Hayes.' },
    { L: [2, 3], q: 'Which Supreme Court case of 1876 overturned convictions from the Colfax massacre and weakened federal enforcement?', a: 'United States v. Cruikshank', w: ['Plessy v. Ferguson', 'Dred Scott v. Sandford', 'Marbury v. Madison'], why: 'Cruikshank narrowed the federal government\'s power to punish private violence.' },
    { L: [2, 3], q: 'Which states had disputed electoral votes in 1876?', a: 'Florida, Louisiana, South Carolina and Oregon', w: ['New York, Ohio and Indiana', 'Texas and California', 'Virginia and Maryland'], why: 'Twenty votes in all.' },
    { L: [3], q: 'After 1877, the Fourteenth and Fifteenth Amendments were fully enforced across the South.', tf: false, why: 'False: they were widely ignored in practice for decades, until the civil rights movement.' },
    { L: [3], q: 'Most historians today see violence and the loss of Northern support as main reasons Reconstruction ended.', tf: true, why: 'True: an older view blamed corrupt Southern governments; most historians since the mid-1900s stress violence and the federal retreat.' },
    { L: [3], q: 'Reasons Reconstruction ended:', all: [['Violence by the Klan and similar groups', true], ['Northern fatigue', true], ['The Panic of 1873', true], ['Repeal of the Fifteenth Amendment', false], ['A Southern victory in the Civil War', false]], why: 'The amendments stayed in the Constitution but were not enforced; the Union won the war.' },
    { L: [1, 2, 3], order: RECON.slice(6) },
    { L: [2, 3], gen: letterGen(U8L, 5) }
  ], 'A right on paper is not the same as a right enforced. What wore down the enforcement?'));

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
  var TABS = [{"k":"ush1.dates-and-periods#3","h":["Years","Spoken as","Century"],"r":[["1401–1500","the 1400s","15th century"],["1501–1600","the 1500s","16th century"],["1601–1700","the 1600s","17th century"],["1701–1800","the 1700s","18th century"],["1801–1900","the 1800s","19th century"]],"cap":"Centuries in this course, with strict start and end years.","m":[[0,2,"Which century is {a}?",0,"years with their century"],[0,1,"How do we say the years {a}?",0],[2,0,"Which years make up the {a}?",0,0,2]]},
    {"k":"ush1.native-cultures-1491#3","h":["Region","Land","Ways of life (examples)"],"r":[["Southwest","Dry, hot; few rivers","Maize, beans and squash with irrigation canals (the Hohokam dug canals from the Salt and Gila Rivers); adobe and stone towns (Ancestral Puebloans)"],["Great Plains","Grassland","Bison hunted on foot, with dogs pulling loads on a travois; farming villages of earth lodges along the rivers"],["Pacific Northwest","Rainy coast, big forests","Salmon, shellfish and whales; cedar plank houses and canoes; wealth shown in gift-giving feasts (the potlatch)"],["Eastern Woodlands","Forests, rivers, rain","The \"Three Sisters\" (maize, beans, squash), hunting and fishing; villages of longhouses or wigwams"]],"cap":"Four regions in 1491. Each was home to many different nations.","m":[[1,0,"Which region of North America had this land: {a}?",0,"a region with its land"],[2,0,"In which region did people live this way around 1491: {a}?",0,0,2]]},
    {"k":"ush1.middle-colonies#7","h":["Colony","Began","Notes"],"r":[["New York","1624 (Dutch); English 1664","Fur trade, port of New York"],["New Jersey","1664","Given by the Duke of York to two proprietors"],["Pennsylvania","1681","Penn's Quaker colony; Philadelphia"],["Delaware","1638 (Swedish)","Later part of Penn's grant"]],"cap":"","m":[[0,1,"When did {a} begin as a colony?",0,"a colony with when it began"],[2,0,"Which middle colony is this: {a}?",0,0,2]]},
    {"k":"ush1.colonial-self-government#3","h":["Type of colony","Who chose the governor","Examples"],"r":[["Royal","The king","Virginia (after 1624), New York"],["Proprietary","The proprietor (owner)","Pennsylvania, Maryland"],["Charter","The colonists themselves","Connecticut, Rhode Island"]],"cap":"Three kinds of colonial government.","m":[[0,1,"In a {a:l} colony, who chose the governor?",0,"a type of colony with who chose its governor"],[2,0,"What type of colony were these: {a}?",0,0,2]]},
    {"k":"ush1.revolution-changes#3","h":["What changed","What stayed the same"],"r":[["Written state constitutions; Virginia's Declaration of Rights (June 1776)","Most states let only men who owned property vote"],["Pennsylvania's Gradual Abolition Act (1780); Massachusetts courts ended slavery in the 1780s","Slavery continued and grew in the Southern states"],["Virginia's Statute for Religious Freedom (1786) ended forced support for a church","Some New England states kept tax support for churches for decades"],["Women's role as \"republican mothers\" raised the value of girls' education","Married women still could not own property in their own names in most states"]],"cap":"Change and continuity after the Revolution.","one":"After the Revolution, did this change or stay the same?","all":"Which of these belong under \"{a}\"? Choose all that apply.","na":1},
    {"k":"ush1.two-sides#4","h":["","Union (loyal states)","Confederacy"],"r":[["Free population, 1860","about 22 million","about 5.5 million"],["Enslaved population","about 430,000 (border states)","about 3.5 million"],["Railroad mileage, 1860","about 22,000 miles","about 9,500 miles"],["Share of manufacturing","about 90 percent","about 10 percent"]],"cap":"Rounded figures from the 1860 census, as historians report them.","one":"Union or Confederacy: which does this describe, at the start of the Civil War?","all":"Which of these describe the {a}? Choose all that apply."}];
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
  var CFG = {"prefix":"ush1.","only":["primary-secondary","sourcing-hipp","dates-and-periods","cause-and-effect","peopling-americas","native-cultures-1491","native-societies","european-exploration","columbian-exchange","spanish-empire","jamestown-virginia","new-england","middle-colonies","southern-colonies","comparing-regions","colonial-slavery","colonial-conflicts","mercantilism","awakening-enlightenment","colonial-self-government","french-and-indian-war","taxes-and-protest","road-to-revolution","war-begins","declaration-of-independence","loyalists-patriots","revolutionary-war","treaty-of-paris-1783","revolution-changes","articles-of-confederation","northwest-ordinance","shays-rebellion","constitutional-convention","ratification-debate","bill-of-rights-1791","washington-presidency","first-parties","adams-and-1800","jefferson-louisiana","marshall-court","war-of-1812","monroe-years","market-revolution","jacksonian-democracy","indian-removal","second-great-awakening","abolition","seneca-falls","manifest-destiny","mexican-american-war","gold-rush-immigration","compromise-of-1850","kansas-nebraska","dred-scott","lincoln-and-1860","secession","two-sides","civil-war-battles","emancipation","home-fronts","gettysburg-address","presidential-reconstruction","congressional-reconstruction","reconstruction-amendments","end-of-reconstruction"]};
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
