/* American History for Young Learners (History & Civics Ladder, course key usyoung): problem generators.
   All 44 topics. Unit 1 (Our Country's Symbols) is the designer's model; units 2 to 8 follow it (sources:
   /tmp/work_usyoung/gen/*.js, joined by /tmp/work_usyoung/build_gen.sh; see /tmp/work_civics/overview.md).
   Read-aloud problems for ages 5 to 9: one short question in large type, a "Read to me" note for the grown-up, a quiet picture
   from the kit (cv-picture, cv-flag, cv-doc), and two or three choices. No typing.
     level 1  two choices: the right one and a plainly wrong one
     level 2  three choices whose wrong ones match the topic's trouble note (the 50 states for the stripes, painted green…)
     level 3  "Choose all that are true" from four, or true or false about a near miss
   Each topic is a bank of facts; wrong choices are drawn from a pool and the order is shuffled, so problems vary.
   Facts follow the lessons in data/civics/lessons/usyoung.json and their sources. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;
  var READ = '<p class="cv-readme"><b>Read to me</b> Read the question and the choices aloud.</p>';
  function big(s) { return READ + '<span class="cv-big">' + s + '</span>'; }
  function pics(keys, extra) { return { name: 'cv-picture', opts: Object.assign({ items: keys, quiet: true, interactive: false, size: keys.length > 1 ? 'small' : undefined }, extra || {}) }; }
  // one problem from a bank. Item: { L: [levels], q, a, w: [wrong pool], why, viz } or { L, q, tf: true|false, why, viz }
  // or { L, q, all: [[text, true|false], …], why, viz } (choose all that are true)
  function fromBank(bank, hint) {
    return function (R, ctx) {
      var lv = ctx.level || 1, pool = bank.filter(function (it) { return it.L.indexOf(lv) >= 0; });
      if (!pool.length) pool = bank;
      var it = R.pick(pool); if (it.gen) it = Object.assign({ L: it.L }, it.gen(R, lv));
      var p = { q: big(it.q), steps: [it.why], hint: it.hint || hint || 'Think about what you learned in the lesson.' };
      if (it.viz) p.viz = typeof it.viz === 'function' ? it.viz(R) : it.viz;
      if (it.tf != null) { p.a = { t: 'tf', v: it.tf }; p.q = big(it.q + ' True or false?'); return p; }
      if (it.all) {
        var opts = R.shuffle(it.all.slice()), v = []; opts.forEach(function (o, i) { if (o[1]) v.push(i); });
        p.q = big(it.q + ' Choose all that are true.'); p.a = { t: 'mc', choices: opts.map(function (o) { return o[0]; }), v: v, keep: true }; return p;
      }
      var n = lv === 1 ? 1 : 2, wrong = R.sample(it.w, M.min(n, it.w.length)), ch = R.shuffle([it.a].concat(wrong));
      if (/^[A-Z]$/.test(it.a)) ch.sort(); // picture letters stay in order: A, B, C
      p.a = { t: 'mc', choices: ch, v: ch.indexOf(it.a), keep: true };
      return p;
    };
  }
  var M = Math;
  // "Which picture shows …?": the right picture in a random place among decoys drawn from a pool
  function picQ(target, decoys, q, name) {
    return function (R) {
      var keys = R.shuffle([target].concat(R.sample(decoys, 2))), at = keys.indexOf(target), L = 'ABC'.charAt(at);
      return { q: q, a: L, w: 'ABC'.split('').filter(function (x) { return x !== L; }), why: 'Picture ' + L + ' is ' + name + '.', viz: pics(keys) };
    };
  }

  G('usyoung.the-flag', fromBank([
    { L: [1, 2], gen: picQ('flag', ['eagle', 'bell', 'statue', 'capitol', 'star', 'fireworks'], 'Which picture shows the American flag?', 'the American flag, with its stripes and stars') },
    { L: [1, 2], q: 'How many stripes are on our flag?', a: '13', w: ['50', '12', '20'], why: 'Count them: there are 13 stripes, 7 red and 6 white, one for each of the first 13 colonies.', viz: { name: 'cv-flag', opts: { stars: 50, quiet: true, interactive: false } } },
    { L: [1, 2], q: 'How many stars are on our flag today?', a: '50', w: ['13', '48', '100'], why: 'Our flag has 50 stars, one for each of the 50 states.', viz: { name: 'cv-flag', opts: { stars: 50, quiet: true, interactive: false } } },
    { L: [1, 2], q: 'What do the 13 stripes stand for?', a: 'the first 13 colonies', w: ['the 50 states', '13 Presidents', '13 holidays'], why: 'The 13 stripes stand for the 13 colonies that became the first 13 states.' },
    { L: [1, 2], q: 'What do the 50 stars stand for?', a: 'the 50 states', w: ['the first 13 colonies', '50 big cities', '50 Presidents'], why: 'There is one star for each of the 50 states.' },
    { L: [1, 2], q: 'What colors are on the American flag?', a: 'red, white and blue', w: ['red, white and green', 'blue and yellow', 'black and orange'], why: 'Our flag is red, white and blue: red and white stripes, and white stars on a blue square.' },
    { L: [1, 2], q: 'Which picture shows the American flag?', a: 'A', w: ['B', 'C'], why: 'Picture A is the flag: red and white stripes and white stars on blue.', viz: pics(['flag', 'eagle', 'bell']) },
    { L: [1, 2], q: 'Which picture shows the American flag?', a: 'B', w: ['A', 'C'], why: 'Picture B is the flag: red and white stripes and white stars on blue.', viz: pics(['statue', 'flag', 'capitol']) },
    { L: [2, 3], q: 'This is a very old flag, from 1777. How many stars does it have?', a: '13', w: ['50', '15', '20'], why: 'The first flags had 13 stars, one for each of the 13 states then.', viz: { name: 'cv-flag', opts: { year: 1777, quiet: true, interactive: false } } },
    { L: [3], q: 'Our flag has one star for each state.', tf: true, why: 'True: 50 states, 50 stars.' },
    { L: [3], q: 'Our flag has one stripe for each state.', tf: false, why: 'False: the 13 stripes are for the first 13 colonies. The stars are for the states.' },
    { L: [3], q: 'When a new state joined, a new star was added to the flag.', tf: true, why: 'True: the stars grew from 13 to 50 as states joined. The 50-star flag came in 1960.' },
    { L: [3], q: 'About our flag:', all: [['It has 13 stripes.', true], ['It has 50 stars.', true], ['It has 50 stripes.', false], ['It is red, white and blue.', true]], why: '13 stripes for the colonies, 50 stars for the states, in red, white and blue.' }
  ]));

  G('usyoung.bald-eagle', fromBank([
    { L: [1, 2], gen: picQ('eagle', ['turkey', 'bison', 'bell', 'flag', 'statue'], 'Which picture shows the bald eagle?', 'the bald eagle, with its white head') },
    { L: [1, 2], q: 'What is our national bird?', a: 'the bald eagle', w: ['the robin', 'the owl', 'the parrot'], why: 'The bald eagle is the national bird of the United States.', viz: pics(['eagle']) },
    { L: [1, 2], q: 'What color are the feathers on a bald eagle\'s head?', a: 'white', w: ['red', 'green', 'none: it has no feathers there'], why: 'A grown bald eagle has a white head and a brown body. "Bald" does not mean it has no feathers.', viz: pics(['eagle']) },
    { L: [1, 2], q: 'Which picture shows the bald eagle?', a: 'A', w: ['B', 'C'], why: 'Picture A is the bald eagle, with its white head and big brown wings.', viz: pics(['eagle', 'turkey', 'bison']) },
    { L: [1, 2], q: 'Which picture shows the bald eagle?', a: 'C', w: ['A', 'B'], why: 'Picture C is the bald eagle, with its white head and big brown wings.', viz: pics(['bell', 'flag', 'eagle']) },
    { L: [1, 2], q: 'The bald eagle stands for…', a: 'strength and freedom', w: ['sleepy afternoons', 'rainy weather', 'snack time'], why: 'People chose the eagle because it is strong and free.' },
    { L: [1, 2], q: 'Where do bald eagles live in the wild?', a: 'in North America', w: ['in Antarctica', 'only in zoos', 'under the sea'], why: 'Bald eagles live only in North America, near lakes, rivers and coasts, where they catch fish.' },
    { L: [2, 3], q: 'The bald eagle is on the Great Seal of the United States. Since what year?', a: '1782', w: ['1960', '1492', '2020'], why: 'Congress put the eagle on the Great Seal in 1782. You can see the seal on the back of a one-dollar bill.' },
    { L: [3], q: 'A bald eagle has no feathers on its head.', tf: false, why: 'False: its head is covered with white feathers. Long ago "bald" also meant "white-headed."' },
    { L: [3], q: 'In 2024, Congress made the bald eagle our official national bird.', tf: true, why: 'True: the eagle had been on the Great Seal since 1782, and a law in 2024 made it the official national bird.' },
    { L: [3], q: 'About the bald eagle:', all: [['It has a white head.', true], ['It is on the Great Seal.', true], ['It has no feathers on its head.', false], ['It lives in North America.', true]], why: 'White feathers on its head, on the Great Seal since 1782, and found in North America.' }
  ]));

  G('usyoung.liberty-bell', fromBank([
    { L: [1, 2], gen: picQ('bell', ['statue', 'flag', 'drum', 'lantern', 'capitol'], 'Which picture shows the Liberty Bell?', 'the Liberty Bell, with its crack') },
    { L: [1, 2], q: 'What is the Liberty Bell a symbol of?', a: 'freedom', w: ['lunch time', 'the start of school', 'winter'], why: '"Liberty" means freedom. The bell is a symbol of freedom.', viz: pics(['bell']) },
    { L: [1, 2], q: 'The Liberty Bell has a famous…', a: 'crack', w: ['bow', 'window', 'flag'], why: 'The bell cracked long ago. You can see the big crack on its side.', viz: pics(['bell']) },
    { L: [1, 2], q: 'In which city is the Liberty Bell?', a: 'Philadelphia', w: ['Los Angeles', 'Washington, D.C.', 'Boston'], why: 'The Liberty Bell is in Philadelphia, Pennsylvania, near Independence Hall.' },
    { L: [1, 2], q: 'Which picture shows the Liberty Bell?', a: 'B', w: ['A', 'C'], why: 'Picture B is the Liberty Bell, with its crack.', viz: pics(['statue', 'bell', 'whitehouse']) },
    { L: [1, 2], q: 'What does the word "liberty" mean?', a: 'freedom', w: ['a library', 'a bell', 'a song'], why: 'Liberty means freedom.' },
    { L: [2, 3], q: 'Look at the words on the bell. Which word is in big capital letters?', a: 'LIBERTY', w: ['LAND', 'BELL', 'FREEDOM'], why: 'The bell says to "Proclaim LIBERTY Throughout all the Land."', viz: { name: 'cv-doc', opts: { doc: 'libertybell', interactive: false, big: true } } },
    { L: [3], q: 'The Liberty Bell is rung like a church bell every day.', tf: false, why: 'False: because of its crack, the bell is not rung. It has been silent for over 150 years.' },
    { L: [3], q: 'People visit the Liberty Bell in Philadelphia.', tf: true, why: 'True: it is kept where visitors can see it, near Independence Hall.' },
    { L: [3], q: 'About the Liberty Bell:', all: [['It has a crack.', true], ['It is in Philadelphia.', true], ['It stands for freedom.', true], ['It rings every hour.', false]], why: 'The cracked bell in Philadelphia stands for freedom; it is not rung like a working bell.' }
  ]));

  G('usyoung.statue-of-liberty', fromBank([
    { L: [1, 2], gen: picQ('statue', ['bell', 'capitol', 'whitehouse', 'flag', 'eagle'], 'Which picture shows the Statue of Liberty?', 'the Statue of Liberty, holding her torch') },
    { L: [1, 2], q: 'What does the Statue of Liberty hold up high?', a: 'a torch', w: ['a flag', 'a bell', 'an umbrella'], why: 'She holds a torch high in her right hand, like a light that welcomes people.', viz: pics(['statue']) },
    { L: [1, 2], q: 'Who gave the Statue of Liberty to the United States?', a: 'the people of France', w: ['the people of Japan', 'the people of Mexico', 'a toy company'], why: 'The people of France gave the statue as a gift of friendship. It was finished in 1886.' },
    { L: [1, 2], q: 'Where is the Statue of Liberty?', a: 'in New York Harbor', w: ['in Philadelphia', 'in California', 'in Washington, D.C.'], why: 'The statue stands on an island in New York Harbor.' },
    { L: [1, 2], q: 'Why is the Statue of Liberty green?', a: 'It is made of copper, which turned green in the weather.', w: ['Someone painted it green.', 'It is made of grass.', 'It is covered in leaves.'], why: 'The statue is copper. Copper was shiny brown at first and slowly turned green outside in the wind and rain.' },
    { L: [1, 2], q: 'Which picture shows the Statue of Liberty?', a: 'C', w: ['A', 'B'], why: 'Picture C is the Statue of Liberty with her torch and crown.', viz: pics(['bell', 'capitol', 'statue']) },
    { L: [2, 3], q: 'Long ago, the statue welcomed people who came to America by…', a: 'ship, across the sea', w: ['airplane', 'train from Canada', 'car'], why: 'Ships sailing into New York Harbor passed right by the statue.' },
    { L: [3], q: 'Someone painted the Statue of Liberty green.', tf: false, why: 'False: the copper turned green by itself over many years.' },
    { L: [3], q: 'The Statue of Liberty was a gift from the people of France.', tf: true, why: 'True: a gift of friendship, finished in 1886.' },
    { L: [3], q: 'About the Statue of Liberty:', all: [['She holds a torch.', true], ['She stands in New York Harbor.', true], ['She was painted green.', false], ['She was a gift from France.', true]], why: 'Torch, New York Harbor, a gift from France; green because of the copper.' }
  ]));

  G('usyoung.star-spangled-banner', fromBank([
    { L: [1, 2], gen: picQ('fort', ['mayflower', 'cabin', 'capitol', 'school', 'wagon'], 'Key saw the flag still flying over a fort. Which picture shows a fort with its flag?', 'the fort with its flag') },
    { L: [1, 2], q: 'What is the name of our national anthem?', a: '"The Star-Spangled Banner"', w: ['"Twinkle, Twinkle, Little Star"', '"Happy Birthday"', '"Row, Row, Row Your Boat"'], why: 'Our national anthem is "The Star-Spangled Banner."', viz: pics(['anthem']) },
    { L: [1, 2], q: 'Who wrote the words of "The Star-Spangled Banner"?', a: 'Francis Scott Key', w: ['George Washington', 'Abraham Lincoln', 'Betsy Ross'], why: 'Francis Scott Key wrote the words as a poem in 1814.' },
    { L: [1, 2], q: 'After the long battle, what did Francis Scott Key see?', a: 'the flag still flying over the fort', w: ['a rainbow', 'a big parade', 'snow falling'], why: 'When the sun came up, the flag was still there, so Key knew the fort had held.', viz: pics(['fort']) },
    { L: [2, 3], q: 'The battle was at which fort?', a: 'Fort McHenry', w: ['Fort Sumter', 'Fort Lincoln', 'Fort Liberty Bell'], why: 'Key watched the British attack Fort McHenry in Baltimore in 1814.' },
    { L: [1, 2], q: 'When we hear our national anthem, many people…', a: 'stand, face the flag and put a hand over their heart', w: ['keep running around', 'talk loudly', 'lie down for a nap'], why: 'Standing and facing the flag shows respect for our country.' },
    { L: [2, 3], q: 'Read the poem. What was "still there" in the night?', a: 'our flag', w: ['the moon', 'the ship', 'the sun'], why: '"Gave proof through the night that our flag was still there."', viz: { name: 'cv-doc', opts: { doc: 'anthem', interactive: false } } },
    { L: [3], q: 'Francis Scott Key wrote the words in 1814.', tf: true, why: 'True: he wrote them in September 1814, during the War of 1812.' },
    { L: [3], q: '"The Star-Spangled Banner" has always been our national anthem, since 1776.', tf: false, why: 'False: it was written in 1814 and became the national anthem in 1931.' },
    { L: [3], q: 'About our national anthem:', all: [['Francis Scott Key wrote the words.', true], ['It is about the flag over a fort.', true], ['It became the national anthem in 1931.', true], ['George Washington wrote it.', false]], why: 'Key wrote it in 1814 about the flag over Fort McHenry; it became the anthem in 1931.' }
  ]));

  G('usyoung.washington-dc', fromBank([
    { L: [1, 2, 3], gen: picQ('capitol', ['whitehouse', 'school', 'bell', 'statue'], 'Which picture shows the Capitol, where Congress meets?', 'the Capitol, with its big dome') },
    { L: [1, 2], gen: picQ('whitehouse', ['capitol', 'school', 'cabin', 'bell', 'statue'], 'Which picture shows the White House, where the President lives?', 'the White House') },
    { L: [1, 2], q: 'What is our country\'s capital city?', a: 'Washington, D.C.', w: ['Los Angeles', 'New York City', 'Chicago'], why: 'Washington, D.C., is the capital of the United States.' },
    { L: [1, 2], q: 'Where does the President live and work?', a: 'the White House', w: ['the Liberty Bell', 'the Capitol', 'a castle'], why: 'The President lives and works in the White House.', viz: pics(['whitehouse']) },
    { L: [1, 2], q: 'Where does Congress meet to make laws?', a: 'the Capitol', w: ['the White House', 'the Statue of Liberty', 'a school'], why: 'Congress meets in the Capitol, the building with the big dome.', viz: pics(['capitol']) },
    { L: [1, 2], q: 'Which picture shows the White House?', a: 'A', w: ['B', 'C'], why: 'Picture A is the White House. Picture B is the Capitol, with its dome.', viz: pics(['whitehouse', 'capitol', 'school']) },
    { L: [1, 2], q: 'Which picture shows the Capitol, where Congress meets?', a: 'B', w: ['A', 'C'], why: 'Picture B is the Capitol with its big dome. Picture A is the White House.', viz: pics(['whitehouse', 'capitol', 'bell']) },
    { L: [1, 2], q: 'Washington, D.C., is named after…', a: 'George Washington', w: ['Abraham Lincoln', 'Ben Franklin', 'the state of Washington'], why: 'The capital is named for George Washington, our first President.' },
    { L: [2, 3], q: 'Is Washington, D.C., the same place as the state of Washington?', a: 'No. They are far apart.', w: ['Yes. They are the same place.', 'Yes. D.C. is a city in that state.'], why: 'Washington, D.C., is on the East Coast. The state of Washington is far away on the West Coast.' },
    { L: [3], q: 'Washington, D.C., is one of the 50 states.', tf: false, why: 'False: it is a special district, the District of Columbia, not a state.' },
    { L: [3], q: 'The Capitol and the White House are both in Washington, D.C.', tf: true, why: 'True: both are in our capital city.' },
    { L: [3], q: 'About Washington, D.C.:', all: [['It is our capital.', true], ['The President works there.', true], ['Congress meets there.', true], ['It is on the West Coast.', false]], why: 'Our capital is on the East Coast; the President and Congress both work there.' }
  ]));

  /* ---------------------------------------------------------------- helpers for units 2 to 8 (bank items with gen) */
  // "Which came first?" (o.last: "Which came last?") from items [label, sort key, when (shown in the steps)]. Level 1 shows
  // two choices, levels 2 and 3 three; the keys of the chosen items always differ, so the answer is clear.
  function seqQ(items, o) {
    o = o || {};
    return function (R, lv) {
      var k = lv === 1 ? 2 : 3, pick, t = 0;
      do { pick = R.sample(items, k); t++; } while (t < 30 && !pick.every(function (x, i) { return pick.every(function (y, j) { return i === j || x[1] !== y[1]; }); }));
      var s = pick.slice().sort(function (a, b) { return a[1] - b[1]; }), ans = (o.last ? s[s.length - 1] : s[0])[0];
      return {
        q: o.q || (o.last ? 'Which came last?' : 'Which came first?'), a: ans,
        w: pick.map(function (x) { return x[0]; }).filter(function (x) { return x !== ans; }),
        why: (o.lead || 'In order: ') + s.map(function (x) { return x[0] + (x[2] ? ' (' + x[2] + ')' : ''); }).join(', then ') + '.',
        hint: o.hint || (o.last ? 'Find the one with the biggest year: it is the newest.' : 'Think about when each one happened. The smallest year is the oldest.'),
        viz: o.viz
      };
    };
  }
  // match a card to its group: cards [[text, group index, why?]]; q(text) builds the question
  function pairQ(cards, groups, q) {
    return function (R) {
      var c = R.pick(cards), a = groups[c[1]];
      return { q: q(c[0]), a: a, w: groups.filter(function (g) { return g !== a; }), why: c[2] || ('"' + c[0] + '": ' + a + '.') };
    };
  }

  /* ================================================================ Unit 2: Rules, Leaders and Helpers */
  G('usyoung.why-rules', fromBank([
    { L: [1, 2], gen: picQ('trafficlight', ['eagle', 'bell', 'corn', 'tipi', 'rocket', 'turkey'], 'Which picture shows a traffic light, a rule for cars and people?', 'the traffic light: red means stop, green means go') },
    { L: [1, 2], gen: picQ('stopsign', ['flag', 'drum', 'squash', 'canoe', 'crown', 'globe'], 'Which picture shows a sign that tells cars to stop?', 'the stop sign') },
    { L: [1, 2], q: 'Why do we have rules?', a: 'to keep us safe and help us be fair', w: ['to make everyone sad', 'so nobody can play', 'so games never end'], why: 'Rules keep us safe, help us be fair and help us get along.' },
    { L: [1, 2], q: 'What does a red traffic light tell cars to do?', a: 'stop', w: ['go faster', 'honk', 'turn around'], why: 'Red means stop. Green means go.', viz: pics(['trafficlight']) },
    { L: [1, 2], q: 'The rule "take turns" helps us be…', a: 'fair', w: ['loud', 'sleepy', 'late'], why: 'Taking turns gives everyone a chance. That is fair.' },
    { L: [1, 2], q: 'The rule "walk, do not run, in the hallway" helps keep us…', a: 'safe', w: ['hungry', 'cold', 'bored'], why: 'Walking keeps people from falling and bumping into each other.' },
    { L: [2, 3], q: 'What could happen if there were no rule to take turns on the slide?', a: 'Some children would never get a turn.', w: ['Everyone would get more turns.', 'The slide would get taller.'], why: 'Without "take turns," some children would never get a turn. The rule is fair to everyone.' },
    { L: [2, 3], q: 'Which one is a rule that keeps you safe?', a: 'Stop at a red light.', w: ['Wear your favorite color.', 'Sing a song at lunch.', 'Draw a picture.'], why: 'Stopping at a red light keeps cars and people from crashing.' },
    { L: [2, 3], gen: pairQ([['Stop at a red light', 0], ['Take turns on the swing', 1], ['Walk in the hallway', 0], ['Everyone gets one cookie', 1], ['Hold a grown-up\'s hand in a parking lot', 0], ['Let everyone have a turn to talk', 1]], ['keeps us safe', 'helps us be fair'], function (t) { return 'The rule "' + t + '" mostly…'; }) },
    { L: [3], q: 'Rules are only made to get children in trouble.', tf: false, why: 'False: rules protect everyone and help us be fair.' },
    { L: [3], q: 'Grown-ups have rules to follow, too.', tf: true, why: 'True: rules and laws are for grown-ups as well as children.' },
    { L: [3], q: 'About rules:', all: [['Rules help keep us safe.', true], ['Rules help us be fair.', true], ['Rules are only for grown-ups.', false], ['We have rules at home and at school.', true]], why: 'Rules keep us safe and fair, at home, at school and everywhere, for everyone.' }
  ], 'Ask: what would happen without this rule?'));

  G('usyoung.rules-and-laws', fromBank([
    { L: [1, 2], q: 'A rule for everyone in a town, a state or the whole country is called a…', a: 'law', w: ['game', 'wish', 'song'], why: 'A law is a rule for everyone who lives in a place.' },
    { L: [1, 2], q: 'Who must follow the laws?', a: 'everyone, even the President', w: ['only children', 'only teachers', 'nobody'], why: 'Laws are for everyone. Nobody is above the law.' },
    { L: [1, 2], q: 'Who makes the laws?', a: 'leaders the people choose', w: ['the children in one class', 'whoever is tallest', 'a pet'], why: 'The people choose leaders, and the leaders write the laws.' },
    { L: [1, 2], gen: picQ('stopsign', ['bell', 'tipi', 'corn', 'rocket', 'eagle'], 'Which picture shows a sign that is a law for drivers?', 'the stop sign') },
    { L: [1, 2], gen: picQ('gavel', ['bell', 'drum', 'turkey', 'kite', 'squash'], 'Which picture shows a judge\'s gavel?', 'the gavel, the little hammer a judge uses') },
    { L: [1, 2, 3], gen: pairQ([['Put your toys away', 0], ['Stop at a stop sign', 1], ['Raise your hand to talk in class', 0], ['Do not take things from a store without paying', 1], ['Bedtime is at eight', 0], ['Drive slowly near a school', 1]], ['a home or school rule', 'a law for everyone'], function (t) { return 'Is "' + t + '" a home or school rule, or a law for everyone?'; }) },
    { L: [2, 3], q: 'Who makes laws for the whole country?', a: 'Congress', w: ['a mayor', 'a teacher', 'a school principal'], why: 'Congress makes laws for the whole country. A town makes town laws, and a state makes state laws.', viz: pics(['capitol']) },
    { L: [2, 3], q: 'What makes a law different from a family rule?', a: 'A law is for everyone in a town, state or country.', w: ['A law is only for children.', 'A law is only for one family.'], why: 'A family rule is for one family. A law is for everyone who lives in a place.' },
    { L: [3], q: 'The President must follow the law.', tf: true, why: 'True: laws are for everyone, even the President.' },
    { L: [3], q: 'Laws are only for children.', tf: false, why: 'False: laws are for everyone, grown-ups too.' },
    { L: [3], q: 'About laws:', all: [['A law is a rule for everyone.', true], ['Leaders the people choose make laws.', true], ['Grown-ups do not have to follow laws.', false], ['A town can make its own laws.', true]], why: 'Laws are for everyone, made by leaders the people choose, in towns, states and the country.' }
  ], 'A law is a rule for everyone in a place.'));

  var HELP = [['a firefighter', 'puts out fires'], ['a doctor or nurse', 'helps sick people get well'], ['a mail carrier', 'brings letters and packages'], ['a teacher', 'helps children learn'], ['a police officer', 'helps keep people safe and helps enforce the laws'], ['a librarian', 'helps people find books']];
  G('usyoung.community-helpers', fromBank([
    { L: [1, 2], gen: picQ('firetruck', ['bell', 'tipi', 'kite', 'turkey', 'crown'], 'Which picture shows a fire truck, the truck firefighters ride?', 'the fire truck') },
    { L: [1, 2], gen: picQ('stethoscope', ['drum', 'lantern', 'compass', 'quill', 'corn'], 'Which picture shows a stethoscope, a tool a doctor uses?', 'the stethoscope, for listening to your heart') },
    { L: [1, 2], gen: picQ('mail', ['crown', 'tricorn', 'drum', 'squash', 'canoe'], 'Which picture shows a mail carrier\'s bag?', 'the mail bag') },
    { L: [1, 2], gen: picQ('badge', ['bell', 'corn', 'kite', 'wreath', 'globe'], 'Which picture shows a police officer\'s badge?', 'the police badge') },
    { L: [1, 2, 3], gen: function (R) { var h = R.pick(HELP); return { q: 'Who ' + h[1] + '?', a: h[0], w: HELP.filter(function (x) { return x !== h; }).map(function (x) { return x[0]; }), why: h[0].charAt(0).toUpperCase() + h[0].slice(1) + ' ' + h[1] + '.' }; } },
    { L: [2, 3], gen: function (R) { var h = R.pick(HELP); return { q: 'What does ' + h[0] + ' do for us?', a: h[1], w: HELP.filter(function (x) { return x !== h; }).map(function (x) { return x[1]; }), why: h[0].charAt(0).toUpperCase() + h[0].slice(1) + ' ' + h[1] + '.' }; } },
    { L: [3], q: 'Only people in uniforms help our community.', tf: false, why: 'False: many helpers, like librarians, farmers and volunteers, do not wear uniforms.' },
    { L: [3], q: 'A town works best when many people each do a job and share it.', tf: true, why: 'True: no one can do every job alone.' },
    { L: [3], q: 'About community helpers:', all: [['Firefighters keep homes safe from fire.', true], ['Teachers help us learn.', true], ['Mail carriers put out fires.', false], ['Doctors and nurses help sick people.', true]], why: 'Each helper has a special job: firefighters fight fires, mail carriers bring the mail.' }
  ], 'Ask: what does this helper do for us?'));

  var CHOICES = [['tag', 'kickball'], ['a fish', 'a hamster'], ['apples', 'oranges'], ['a red flag', 'a blue flag'], ['reading time', 'art time'], ['soup', 'tacos'], ['the park', 'the library']];
  G('usyoung.leaders-and-voting', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) {
        var c = R.pick(CHOICES), a = R.int(lv === 1 ? 4 : 6, lv === 1 ? 9 : 12), b = a + (lv === 3 ? R.pick([-1, 1]) : R.pick([-3, -2, 2, 3])); if (b < 1) b = a + 2;
        var win = a > b ? c[0] : c[1], lose = a > b ? c[1] : c[0], hi = M.max(a, b), lo = M.min(a, b);
        return { q: 'A class votes. ' + c[0].charAt(0).toUpperCase() + c[0].slice(1) + ' gets ' + a + ' votes. ' + c[1].charAt(0).toUpperCase() + c[1].slice(1) + ' gets ' + b + ' votes. Which one wins?', a: win, w: [lose], why: hi + ' is more than ' + lo + ', so ' + win + ' wins, ' + hi + ' to ' + lo + '.', hint: 'Count the votes. The most votes wins.' };
      } },
    { L: [1, 2], q: 'In a fair vote, how many votes does each person get?', a: 'one', w: ['as many as they want', 'none', 'ten'], why: 'Each person gets one vote, and every vote counts the same.' },
    { L: [1, 2], gen: picQ('ballot', ['bell', 'drum', 'corn', 'tipi', 'kite'], 'Which picture shows a ballot box, where people put their votes?', 'the ballot box') },
    { L: [1, 2, 3], q: 'Who leads a town or a city?', a: 'a mayor', w: ['a governor', 'the President'], why: 'A mayor leads a town or city. A governor leads a state. The President leads the country.' },
    { L: [1, 2, 3], q: 'Who leads a state?', a: 'a governor', w: ['a mayor', 'a king'], why: 'A governor leads a state.' },
    { L: [1, 2, 3], q: 'Who leads the whole country?', a: 'the President', w: ['a mayor', 'a governor'], why: 'The President leads the whole country.' },
    { L: [2, 3], q: 'How old must a citizen be to vote for President?', a: '18', w: ['5', '10', '100'], why: 'In the United States, citizens can vote when they are 18.' },
    { L: [2, 3], q: 'How do we find out who wins a vote?', a: 'We count all the votes.', w: ['We listen for the loudest shout.', 'The tallest person picks.'], why: 'A vote is decided by counting. The most votes wins.' },
    { L: [3], q: 'The side that shouts the loudest wins a vote.', tf: false, why: 'False: we count the votes, and the most votes wins.' },
    { L: [3], q: 'Every vote counts the same.', tf: true, why: 'True: that is what makes voting fair.' }
  ], 'Count the votes. The most votes wins.'));

  G('usyoung.good-citizens', fromBank([
    { L: [1, 2], q: 'Which one is a good citizen choice?', a: 'Throw trash in the trash can.', w: ['Leave a mess at the park.', 'Cut in front of the line.', 'Break a toy that is not yours.'], why: 'Good citizens take care of shared places like parks.' },
    { L: [1, 2], q: 'A good citizen…', a: 'tells the truth', w: ['tells lies', 'breaks the rules', 'takes things that are not theirs'], why: 'Good citizens tell the truth and follow the rules.' },
    { L: [1, 2], q: 'Your friend falls down. What does a good citizen do?', a: 'helps the friend up', w: ['laughs', 'walks away'], why: 'Good citizens help others.' },
    { L: [1, 2], gen: picQ('helping', ['bell', 'corn', 'drum', 'crown', 'kite'], 'Which picture shows helping hands?', 'helping hands') },
    { L: [1, 2, 3], q: 'Who can be a good citizen?', a: 'anyone, even children', w: ['only grown-ups', 'only famous people', 'only the President'], why: 'Anyone can practice good citizenship by helping, sharing and caring.' },
    { L: [2, 3], q: 'What is one thing grown-up citizens do that children cannot do yet?', a: 'vote for leaders', w: ['help a friend', 'pick up trash', 'tell the truth'], why: 'Citizens can vote when they are 18. Children can help, pick up trash and tell the truth right now.' },
    { L: [2, 3], gen: pairQ([['Throw trash in the trash can', 0], ['Leave a mess at the park', 1], ['Help a neighbor carry groceries', 0], ['Cut in front of the line', 1], ['Wait for your turn', 0], ['Write on the library\'s books', 1]], ['a good citizen choice', 'not a good choice'], function (t) { return '"' + t + '" is…'; }) },
    { L: [3], q: 'Only grown-ups can be good citizens.', tf: false, why: 'False: children can be good citizens by helping, sharing and caring for their community.' },
    { L: [3], q: 'Taking care of a park is a way to be a good citizen.', tf: true, why: 'True: a park is a shared place, and good citizens care for it.' },
    { L: [3], q: 'A good citizen:', all: [['follows the rules', true], ['tells the truth', true], ['helps others', true], ['leaves trash on the ground', false]], why: 'Good citizens follow the rules, tell the truth, help others and care for shared places.' }
  ], 'Ask: does this make the community better for everyone?'));

  /* ================================================================ Unit 3: Holidays and Why We Have Them */
  G('usyoung.independence-day', fromBank([
    { L: [1, 2], gen: picQ('fireworks', ['turkey', 'wreath', 'corn', 'tipi', 'bus'], 'Many people watch these on the Fourth of July. Which picture shows fireworks?', 'fireworks') },
    { L: [1, 2, 3], q: 'When is Independence Day?', a: 'July 4', w: ['December 25', 'January 1', 'November 11'], why: 'Independence Day is July 4, our country\'s birthday.' },
    { L: [1, 2], q: 'Independence Day is our country\'s…', a: 'birthday', w: ['bedtime', 'first day of school', 'snow day'], why: 'On July 4, 1776, the Declaration said we were a new, free country. July 4 is the country\'s birthday.' },
    { L: [1, 2, 3], q: 'What happened on July 4, 1776?', a: 'Leaders adopted the Declaration of Independence.', w: ['Astronauts landed on the Moon.', 'The Pilgrims had a harvest feast.', 'The war for independence ended.'], why: 'On July 4, 1776, leaders of the thirteen colonies adopted the Declaration of Independence.' },
    { L: [2, 3], q: 'In what year was the Declaration of Independence adopted?', a: '1776', w: ['1492', '1969', '1620'], why: 'The Declaration was adopted on July 4, 1776.', viz: pics(['scroll']) },
    { L: [2, 3], q: 'In 2026, how old did the United States turn?', a: '250 years old', w: ['50 years old', '1,000 years old', '10 years old'], why: 'From 1776 to 2026 is 250 years.' },
    { L: [3], q: 'The war for independence ended on July 4, 1776.', tf: false, why: 'False: July 4, 1776, is when the Declaration was adopted. The war went on until 1783.' },
    { L: [3], q: 'The fireworks are how we celebrate; the day remembers the Declaration of Independence.', tf: true, why: 'True: July 4 remembers the Declaration of 1776.' },
    { L: [3], q: 'About Independence Day:', all: [['It is on July 4.', true], ['It remembers the Declaration of Independence.', true], ['It is in the winter.', false], ['It is the country\'s birthday.', true]], why: 'July 4, in the summer, is the country\'s birthday: the Declaration was adopted on July 4, 1776.' }
  ], 'Think of the country\'s birthday.'));

  G('usyoung.thanksgiving-day', fromBank([
    { L: [1, 2], gen: picQ('turkey', ['fireworks', 'wreath', 'rocket', 'bell', 'bus'], 'Many families eat this on Thanksgiving. Which picture shows a turkey?', 'the turkey') },
    { L: [1, 2, 3], q: 'When is Thanksgiving Day?', a: 'the fourth Thursday in November', w: ['July 4', 'the first Monday in September', 'January 1'], why: 'Thanksgiving is on the fourth Thursday in November.' },
    { L: [1, 2], q: 'On Thanksgiving, many families…', a: 'give thanks and share a meal', w: ['watch fireworks at midnight', 'go back to school for the year'], why: 'Thanksgiving is a day to give thanks, often with a big family meal.' },
    { L: [1, 2, 3], q: 'Who shared the harvest feast of 1621?', a: 'the Pilgrims and the Wampanoag', w: ['Lewis and Clark', 'George Washington and his army', 'the astronauts'], why: 'In 1621 the Pilgrims and about 90 Wampanoag men shared a harvest feast.' },
    { L: [2, 3], q: 'Which President asked the whole country to keep a day of Thanksgiving in 1863?', a: 'Abraham Lincoln', w: ['George Washington', 'Thomas Jefferson'], why: 'In 1863, during the Civil War, President Lincoln called for a national day of Thanksgiving.' },
    { L: [2, 3], q: 'Thanksgiving remembers a harvest feast in which year?', a: '1621', w: ['1776', '1969', '1863'], why: 'The harvest feast of the Pilgrims and the Wampanoag was in 1621.' },
    { L: [3], q: 'The Pilgrims had a Thanksgiving holiday every year from 1621 on.', tf: false, why: 'False: the 1621 feast was a harvest celebration. Thanksgiving for the whole country began in 1863.' },
    { L: [3], q: 'The Wampanoag had helped the Pilgrims learn to grow corn.', tf: true, why: 'True: that help made the 1621 harvest possible.' },
    { L: [3], q: 'About Thanksgiving:', all: [['It is in November.', true], ['It remembers a harvest feast of 1621.', true], ['Lincoln made it a day for the whole country in 1863.', true], ['It is on July 4.', false]], why: 'Thanksgiving is the fourth Thursday in November; it remembers 1621; Lincoln called for it in 1863.' }
  ], 'Think of the harvest feast of 1621.'));

  G('usyoung.presidents-day', fromBank([
    { L: [1, 2], q: 'Washington\'s Birthday honors…', a: 'George Washington, the first President', w: ['Christopher Columbus', 'Francis Scott Key', 'Paul Revere'], why: 'The holiday honors George Washington, our first President. Many people honor all the Presidents.' },
    { L: [1, 2, 3], q: 'In which month is Washington\'s Birthday (Presidents\' Day)?', a: 'February', w: ['July', 'October', 'December'], why: 'The holiday is on the third Monday in February.', viz: pics(['calendar']) },
    { L: [2, 3], q: 'On which day is the holiday?', a: 'the third Monday in February', w: ['February 22 every year', 'July 4', 'the last Monday in May'], why: 'Since 1971 the holiday is the third Monday in February, so it never falls on February 22.' },
    { L: [1, 2], gen: picQ('tricorn', ['tophat', 'crown', 'rocket', 'corn', 'bus'], 'George Washington wore a hat like this. Which picture shows a three-cornered hat?', 'the three-cornered hat') },
    { L: [2, 3], q: 'George Washington was born on…', a: 'February 22, 1732', w: ['July 4, 1776', 'February 12, 1809', 'January 1, 1900'], why: 'Washington was born on February 22, 1732. (February 12, 1809, is Lincoln\'s birthday.)' },
    { L: [2, 3], q: 'Which other President was also born in February?', a: 'Abraham Lincoln', w: ['Thomas Jefferson', 'John Adams'], why: 'Lincoln was born on February 12, 1809, so many people honor him on this day, too.' },
    { L: [3], q: 'Washington\'s Birthday always falls on February 22.', tf: false, why: 'False: it is the third Monday in February, which is always between February 15 and 21.' },
    { L: [3], q: 'Many people call the holiday Presidents\' Day.', tf: true, why: 'True: its official name is Washington\'s Birthday, and many people call it Presidents\' Day.' },
    { L: [3], q: 'About Washington\'s Birthday:', all: [['It is in February.', true], ['It honors the first President.', true], ['It is on a Monday.', true], ['It is always on February 22.', false]], why: 'The third Monday in February honors Washington; it never lands on the 22nd.' }
  ], 'Washington was the first President.'));

  G('usyoung.mlk-day', fromBank([
    { L: [1, 2, 3], q: 'In which month is Martin Luther King Jr. Day?', a: 'January', w: ['July', 'November', 'June'], why: 'It is the third Monday in January, near Dr. King\'s birthday, January 15.', viz: pics(['calendar']) },
    { L: [1, 2], q: 'Dr. King worked so that…', a: 'all people would be treated fairly', w: ['everyone would have a pet', 'school would never end', 'there would be more holidays'], why: 'Dr. King worked for fair and equal treatment for all people.' },
    { L: [1, 2, 3], q: 'How did Dr. King work for change?', a: 'with peaceful speeches and marches', w: ['by fighting', 'by staying silent'], why: 'Dr. King led peaceful marches and gave speeches without fighting.' },
    { L: [1, 2], q: 'Many people spend Martin Luther King Jr. Day…', a: 'helping others', w: ['watching fireworks', 'hunting for eggs'], why: 'Many families make it a "day of service," helping others.', viz: pics(['helping']) },
    { L: [2, 3], q: 'Did Dr. King live at the same time as Abraham Lincoln?', a: 'No. He was born about a hundred years later.', w: ['Yes. They were friends.'], why: 'Lincoln was born in 1809; Dr. King was born in 1929, about a hundred years later.' },
    { L: [2, 3], q: 'In what year was Dr. King born?', a: '1929', w: ['1732', '1809', '1492'], why: 'Dr. King was born on January 15, 1929.' },
    { L: [1, 2], gen: picQ('bus', ['rocket', 'wagon', 'ship', 'train', 'canoe'], 'Dr. King helped lead a famous boycott of city buses. Which picture shows a bus?', 'the city bus') },
    { L: [2, 3], gen: seqQ([['Abraham Lincoln is born', 1809, '1809'], ['Dr. King is born', 1929, '1929'], ['The first national Martin Luther King Jr. Day', 1986, '1986'], ['George Washington is born', 1732, '1732']]) },
    { L: [1, 2], q: 'Martin Luther King Jr. Day is near Dr. King\'s…', a: 'birthday', w: ['first day of school', 'wedding'], why: 'Dr. King was born on January 15, 1929. His day is the third Monday in January.' },
    { L: [3], q: 'Dr. King worked alone.', tf: false, why: 'False: he was one of many, many people in the civil rights movement.' },
    { L: [3], q: 'The whole country first kept Martin Luther King Jr. Day in 1986.', tf: true, why: 'True: the law was signed in 1983, and the first national holiday was in 1986.' },
    { L: [3], q: 'About Dr. King:', all: [['He led peaceful marches.', true], ['He worked for fair treatment for all.', true], ['He lived in Lincoln\'s time.', false], ['His day is in January.', true]], why: 'Dr. King, born in 1929, led peaceful work for fairness; his day is the third Monday in January.' }
  ], 'Dr. King worked peacefully for fairness.'));

  G('usyoung.memorial-veterans-day', fromBank([
    { L: [1, 2, 3], gen: pairQ([['The last Monday in May', 0, 'Memorial Day is the last Monday in May.'], ['November 11', 1, 'Veterans Day is November 11.'], ['Remembers service members who died serving our country', 0, 'Memorial Day remembers those who died in service.'], ['Thanks everyone who has served', 1, 'Veterans Day thanks all veterans, living or not.'], ['Began after the Civil War, when families put flowers on soldiers\' graves', 0, 'Memorial Day began as Decoration Day after the Civil War.'], ['Began as the day World War I fighting stopped, in 1918', 1, 'Veterans Day began as Armistice Day, November 11, 1918.']], ['Memorial Day', 'Veterans Day'], function (t) { return 'Which day is it? "' + t + '"'; }) },
    { L: [1, 2], q: 'A veteran is…', a: 'a person who has served in the armed forces', w: ['a doctor for pets', 'a kind of car'], why: 'A veteran has served in the armed forces. (A doctor for pets is a veterinarian, a different word.)' },
    { L: [1, 2], gen: picQ('wreath', ['fireworks', 'turkey', 'kite', 'rocket', 'bus'], 'On Memorial Day, people place wreaths at graves. Which picture shows a wreath?', 'the wreath') },
    { L: [2, 3], q: 'Why do people put small flags on graves on Memorial Day?', a: 'to remember service members who died for our country', w: ['to mark a birthday', 'to start a parade race'], why: 'Memorial Day is a day of remembering.' },
    { L: [1, 2, 3], q: 'Which day thanks everyone who has served in the armed forces?', a: 'Veterans Day', w: ['Memorial Day', 'Labor Day', 'Flag Day'], why: 'Veterans Day, November 11, thanks all who have served.' },
    { L: [1, 2, 3], q: 'Which day remembers service members who died serving our country?', a: 'Memorial Day', w: ['Veterans Day', 'Labor Day', 'New Year\'s Day'], why: 'Memorial Day, the last Monday in May, remembers those who died in service.' },
    { L: [2, 3], q: 'In which month is Memorial Day?', a: 'May', w: ['November', 'July', 'February'], why: 'Memorial Day is the last Monday in May.', viz: pics(['calendar']) },
    { L: [2, 3], q: 'In which month is Veterans Day?', a: 'November', w: ['May', 'July', 'January'], why: 'Veterans Day is November 11.', viz: pics(['calendar']) },
    { L: [3], q: 'About these two days:', all: [['Memorial Day is in May.', true], ['Veterans Day is November 11.', true], ['They are the same day.', false], ['Both honor people who served.', true]], why: 'Memorial Day (May) remembers those who died in service; Veterans Day (November 11) thanks all who served.' },
    { L: [3], q: 'Veterans Day thanks only people who have died.', tf: false, why: 'False: Veterans Day thanks all who have served, and many veterans are living.' },
    { L: [3], q: 'Memorial Day remembers service members who died serving our country.', tf: true, why: 'True: that is the reason for Memorial Day.' }
  ], 'Memorial Day is for remembering; Veterans Day is for thanking all veterans.'));

  G('usyoung.juneteenth-and-more', fromBank([
    { L: [1, 2, 3], q: 'What does Juneteenth remember?', a: 'the end of slavery', w: ['the first airplane flight', 'the Moon landing', 'the first flag'], why: 'Juneteenth remembers June 19, 1865, when the news of freedom reached enslaved people in Galveston, Texas.', viz: pics(['chain']) },
    { L: [1, 2, 3], q: 'When is Juneteenth?', a: 'June 19', w: ['July 4', 'December 25', 'January 1'], why: '"Juneteenth" joins "June" and "nineteenth": June 19.' },
    { L: [1, 2, 3], q: 'Who does Labor Day honor?', a: 'workers', w: ['astronauts only', 'kings and queens', 'pets'], why: 'Labor Day honors the workers who build the country.' },
    { L: [2, 3], q: 'When is Labor Day?', a: 'the first Monday in September', w: ['the fourth Thursday in November', 'June 14', 'July 4'], why: 'Labor Day is the first Monday in September.' },
    { L: [2, 3], q: 'What does Flag Day (June 14) remember?', a: 'the first flag, chosen in 1777', w: ['the end of slavery', 'the first Thanksgiving'], why: 'Congress chose the first flag on June 14, 1777.', viz: pics(['flag']) },
    { L: [2, 3], q: 'What does Constitution Day (September 17) remember?', a: 'the signing of the Constitution in 1787', w: ['the Moon landing in 1969', 'the Pilgrims landing in 1620'], why: 'The Constitution was signed on September 17, 1787.' },
    { L: [2, 3], q: 'On the second Monday in October, many places mark Columbus Day and also…', a: 'Indigenous Peoples\' Day', w: ['Flag Day', 'Labor Day'], why: 'Many states and cities mark that day as Indigenous Peoples\' Day, to honor Native peoples.' },
    { L: [3], q: 'In what year did Juneteenth become a national holiday?', a: '2021', w: ['1865', '1776', '1492'], why: 'The news of freedom came on June 19, 1865; Juneteenth became a national holiday in 2021.' },
    { L: [3], q: 'Every holiday remembers the same thing.', tf: false, why: 'False: each holiday has its own reason.' },
    { L: [3], q: 'Match the days:', all: [['Juneteenth remembers the end of slavery.', true], ['Labor Day honors workers.', true], ['Flag Day remembers the first flag.', true], ['Labor Day remembers the Moon landing.', false]], why: 'Juneteenth: freedom. Labor Day: workers. Flag Day: the 1777 flag.' }
  ], 'Ask: what does this day remember?'));

  var HOL = [['New Year\'s Day', 1, 'January'], ['Martin Luther King Jr. Day', 1.5, 'January'], ['Washington\'s Birthday', 2, 'February'], ['Memorial Day', 5, 'May'], ['Juneteenth', 6, 'June'], ['Independence Day', 7, 'July'], ['Labor Day', 9, 'September'], ['Columbus Day', 10, 'October'], ['Veterans Day', 11, 'November 11'], ['Thanksgiving', 11.8, 'late November'], ['Christmas Day', 12, 'December']];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var HOL1 = HOL.filter(function (h) { return [1.5, 11.8, 11].indexOf(h[1]) < 0; }); // one holiday per month, for month questions
  G('usyoung.holiday-calendar', fromBank([
    { L: [1, 2, 3], gen: seqQ(HOL, { q: 'Which holiday comes first in the year?', hint: 'The year starts in January. Find each holiday\'s month.', viz: pics(['calendar']) }) },
    { L: [2, 3], gen: seqQ(HOL, { last: true, q: 'Which holiday comes last in the year?', hint: 'The year ends in December. Find each holiday\'s month.' }) },
    { L: [1, 2, 3], gen: function (R) { var h = R.pick(HOL1), mo = h[2]; return { q: 'In which month is ' + h[0] + '?', a: mo, w: R.sample(MONTHS.filter(function (m) { return m !== mo; }), 3), why: h[0] + ' is in ' + mo + '.' }; } },
    { L: [1, 2], q: 'Which month starts the year?', a: 'January', w: ['September', 'December', 'July'], why: 'The calendar year starts on January 1, New Year\'s Day.', viz: pics(['calendar']) },
    { L: [2, 3], q: 'Which month ends the year?', a: 'December', w: ['June', 'August', 'January'], why: 'December is the twelfth and last month.' },
    { L: [2, 3], q: 'Which holiday is in the summer?', a: 'Independence Day', w: ['Thanksgiving', 'New Year\'s Day', 'Martin Luther King Jr. Day'], why: 'Independence Day is July 4, in the summer.' },
    { L: [3], q: 'The calendar year starts in September, when school begins.', tf: false, why: 'False: the calendar year starts in January. The school year starts in the fall.' }
  ], 'The year starts in January and ends in December.'));

  /* ================================================================ Unit 4: The First Americans */
  var NATIONS = ['Wampanoag', 'Cherokee', 'Lakota', 'Navajo', 'Haudenosaunee', 'Shoshone', 'Powhatan', 'Hopi'];
  var NOTNATION = ['Mayflower', 'Liberty Bell', 'Jamestown', 'Philadelphia', 'Fort McHenry'];
  G('usyoung.first-peoples', fromBank([
    { L: [1, 2, 3], q: 'Who lived in America first, long before people from Europe came?', a: 'Native Americans', w: ['the Pilgrims', 'the astronauts', 'Lewis and Clark'], why: 'Native Americans lived here for thousands of years before people from Europe came.' },
    { L: [1, 2], q: 'How long did Native Americans live here before people from Europe came?', a: 'thousands of years', w: ['one week', 'ten years', 'one summer'], why: 'Native peoples lived across North America for thousands of years.' },
    { L: [1, 2, 3], q: 'Did all Native nations live the same way?', a: 'No. There were hundreds of different nations.', w: ['Yes. They were all the same.'], why: 'Hundreds of nations each had their own language, leaders and way of life.' },
    { L: [1, 2, 3], gen: function (R) { var n = R.pick(NATIONS); return { q: 'Which one is the name of a Native nation?', a: n, w: NOTNATION, why: 'The ' + n + ' are a Native nation. The other choices are not nations.' }; } },
    { L: [1, 2], gen: picQ('bison', ['turkey', 'eagle', 'bell', 'corn', 'wagon'], 'On the Great Plains, many nations hunted this big animal. Which picture shows a bison?', 'the bison') },
    { L: [1, 2], gen: picQ('canoe', ['wagon', 'train', 'rocket', 'bus', 'plane'], 'Many nations by rivers and the ocean traveled by boat. Which picture shows a canoe?', 'the canoe') },
    { L: [2, 3], q: 'Why were the Native nations so different from one another?', a: 'Each one learned to live well in its own kind of place.', w: ['They all lived in one small town.', 'They never met anyone.'], why: 'Forests, deserts, plains and coasts are different, so the ways of life were different.' },
    { L: [2, 3], q: 'Cahokia, near today\'s St. Louis, was…', a: 'a big Native city long ago', w: ['a ship', 'a kind of corn'], why: 'Cahokia was the largest Native city north of Mexico, at its height about the year 1100.', viz: { name: 'cv-map', opts: { mode: 'places', places: ['cahokia'], quiet: true, interactive: false } } },
    { L: [3], q: 'Native Americans lived only long ago.', tf: false, why: 'False: Native nations are still here today.' },
    { L: [3], q: 'Each Native nation had its own language and way of life.', tf: true, why: 'True: there were hundreds of nations and hundreds of languages.' }
  ], 'There were many different nations.'));

  var HOMES = [['longhouse', 'a longhouse', 'long homes of wood and bark, where many families lived; the Haudenosaunee built them'], ['wigwam', 'a wigwam', 'round homes of bent poles and bark, in the eastern woods'], ['tipi', 'a tipi', 'homes of poles and buffalo hides that could be packed up and moved, on the Great Plains'], ['pueblo', 'a pueblo', 'homes of adobe, sun-dried mud bricks, in the dry Southwest'], ['plankhouse', 'a plank house', 'big homes of cedar boards by the Pacific Ocean']];
  G('usyoung.native-homes', fromBank([
    { L: [1, 2, 3], gen: function (R) { var h = R.pick(HOMES); return picQ(h[0], HOMES.filter(function (x) { return x !== h; }).map(function (x) { return x[0]; }), 'Which picture shows ' + h[1] + '?', h[1] + ': ' + h[2])(R); } },
    { L: [1, 2, 3], q: 'Which home could be packed up and moved?', a: 'a tipi', w: ['a pueblo', 'a longhouse', 'a plank house'], why: 'A tipi of poles and hides could be packed up and moved, for peoples who followed the bison.', viz: pics(['tipi']) },
    { L: [1, 2], q: 'Pueblo homes are made of…', a: 'adobe, mud bricks dried in the sun', w: ['ice', 'glass', 'paper'], why: 'In the dry Southwest, Pueblo peoples built with adobe.', viz: pics(['pueblo']) },
    { L: [1, 2], q: 'Longhouses were made of…', a: 'wood and bark', w: ['adobe bricks', 'snow', 'glass'], why: 'Longhouses were built of wooden poles covered with bark.', viz: pics(['longhouse']) },
    { L: [2, 3], q: 'Which nation built longhouses where many families lived together?', a: 'the Haudenosaunee', w: ['the Lakota', 'the Hopi'], why: 'The Haudenosaunee built longhouses; the Lakota lived in tipis; the Hopi built pueblos.' },
    { L: [2, 3], q: 'Peoples who followed the bison on the Great Plains lived in…', a: 'tipis', w: ['pueblos', 'plank houses'], why: 'Tipis could move with the people as they followed the bison.' },
    { L: [2, 3], q: 'Big plank houses by the Pacific Ocean were made of…', a: 'cedar wood', w: ['adobe', 'buffalo hides'], why: 'Nations by the Pacific built plank houses of cedar.', viz: pics(['plankhouse']) },
    { L: [3], q: 'Every Native family lived in a tipi.', tf: false, why: 'False: tipis were homes for peoples who moved across the Great Plains. Others built longhouses, wigwams, pueblos or plank houses.' },
    { L: [3], q: 'Each kind of home was made from what the land gave.', tf: true, why: 'True: wood and bark in the forests, adobe in the desert, hides on the plains, cedar by the Pacific.' }
  ], 'Each home was made from what the land gave.'));

  var AMFOODS = ['corn', 'potatoes', 'tomatoes', 'pumpkins', 'peppers'], OLDFOODS = ['rice', 'wheat', 'apples', 'bananas'];
  G('usyoung.three-sisters', fromBank([
    { L: [1, 2, 3], q: 'What are the Three Sisters?', a: 'corn, beans and squash', w: ['apples, pears and plums', 'three girls in a story', 'wheat, rice and oats'], why: 'The Three Sisters are corn, beans and squash, planted together.', viz: pics(['corn', 'beans', 'squash']) },
    { L: [1, 2], gen: picQ('corn', ['beans', 'squash', 'turkey', 'bison'], 'Which picture shows corn?', 'the corn') },
    { L: [1, 2], gen: picQ('squash', ['corn', 'beans', 'drum', 'bell'], 'Which picture shows squash?', 'the squash') },
    { L: [1, 2], gen: picQ('beans', ['corn', 'squash', 'kite', 'lantern'], 'Which picture shows beans?', 'the beans') },
    { L: [1, 2, 3], q: 'Which sister grows tall and straight, like a pole?', a: 'corn', w: ['beans', 'squash'], why: 'The corn grows tall, and the beans climb up it.' },
    { L: [1, 2, 3], q: 'Which sister climbs up the corn stalk?', a: 'beans', w: ['corn', 'squash'], why: 'Beans climb the corn and help feed the soil.' },
    { L: [1, 2, 3], q: 'Which sister has big leaves that shade the ground?', a: 'squash', w: ['corn', 'beans'], why: 'Squash leaves shade the soil, keep it wet and keep weeds away.' },
    { L: [2, 3], gen: function (R) { var f = R.pick(AMFOODS); return { q: 'Which food was first grown in the Americas?', a: f, w: OLDFOODS, why: f.charAt(0).toUpperCase() + f.slice(1) + ' were first grown in the Americas. Rice, wheat, apples and bananas came from other parts of the world.' }; } },
    { L: [3], q: 'Native peoples only hunted and never farmed.', tf: false, why: 'False: many nations were skilled farmers.' },
    { L: [3], q: 'About the Three Sisters:', all: [['They are planted together.', true], ['Each one helps the others.', true], ['They are corn, beans and squash.', true], ['They are three kinds of trees.', false]], why: 'Corn, beans and squash grow together and help one another.' }
  ], 'Corn, beans and squash grow together.'));

  G('usyoung.native-nations-today', fromBank([
    { L: [1, 2, 3], q: 'Are Native nations still here today?', a: 'Yes. They live, govern themselves and keep their traditions.', w: ['No. They lived only long ago.'], why: 'Native nations are still here today.' },
    { L: [1, 2], q: 'Native nations today have their own…', a: 'governments and leaders', w: ['Moon base', 'king of England'], why: 'Native nations have their own councils, leaders, laws and courts.' },
    { L: [1, 2], q: 'Where do Native Americans live today?', a: 'in every state', w: ['only in one state', 'only in history books'], why: 'Native Americans live in every state, in cities, towns and on reservations.' },
    { L: [2, 3], q: 'About how many tribes are on the United States government\'s list in 2026?', a: '575', w: ['5', '15'], why: 'The government\'s 2026 list names 575 tribes.' },
    { L: [2, 3], q: 'A reservation is…', a: 'land that a Native nation holds', w: ['a table saved at a restaurant', 'a kind of boat'], why: 'A reservation is land that a Native nation holds. Many Native families live on reservations; many others live in towns and cities.' },
    { L: [2, 3], q: 'Many Native children today learn…', a: 'their nation\'s language and stories', w: ['only how to ride in tipis', 'nothing at all'], why: 'Many nations teach their languages and traditions to children today.' },
    { L: [1, 2], gen: picQ('drum', ['rocket', 'phone', 'bulb', 'plane'], 'Drums are part of many Native ceremonies and dances today. Which picture shows a drum?', 'the drum') },
    { L: [1, 2, 3], gen: function (R) { var n = R.pick(NATIONS.filter(function (x) { return x !== 'Powhatan'; })); return { q: 'The ' + n + ' are a Native nation. Are they still here today?', a: 'Yes, they are still here today.', w: ['No, they are gone.'], why: 'Native nations like the ' + n + ' live, govern themselves and keep their traditions today.' }; } },
    { L: [1, 2], gen: picQ('canoe', ['rocket', 'phone', 'bulb', 'bus'], 'Some nations still build canoes the old way. Which picture shows a canoe?', 'the canoe') },
    { L: [3], q: 'About Native nations today:', all: [['They have their own governments.', true], ['Many teach their languages to children.', true], ['They lived only long ago.', false], ['Native Americans live in every state.', true]], why: 'Native nations govern themselves, teach their languages and live in every state today.' },
    { L: [3], q: 'Native nations have their own governments today.', tf: true, why: 'True: they have their own councils, leaders, laws and flags.' },
    { L: [3], q: 'All Native Americans live on reservations.', tf: false, why: 'False: many live on reservations, and many others live in towns and cities.' }
  ], 'Native nations are still here today.'));

  /* ================================================================ Unit 5: Explorers and Early Colonies */
  var EARLY = [['Leif Erikson reaches North America', 1000, 'about 1000'], ['Columbus sails across the ocean', 1492, '1492'], ['Jamestown is founded', 1607, '1607'], ['The Pilgrims land at Plymouth', 1620, '1620'], ['The harvest feast', 1621, '1621'], ['Georgia, the thirteenth colony, begins', 1732, '1732']];
  G('usyoung.explorers', fromBank([
    { L: [1, 2, 3], q: 'In what year did Columbus sail across the ocean?', a: '1492', w: ['1776', '1969', '1620'], why: 'Columbus sailed in 1492.', viz: pics(['ship']) },
    { L: [1, 2, 3], q: 'Who reached North America about the year 1000?', a: 'Leif Erikson', w: ['Christopher Columbus', 'George Washington'], why: 'Leif Erikson came about the year 1000, almost 500 years before Columbus.' },
    { L: [1, 2], q: 'Which ocean did the explorers from Europe cross?', a: 'the Atlantic Ocean', w: ['the Pacific Ocean', 'a small lake'], why: 'Europe and America are on opposite sides of the Atlantic Ocean.', viz: pics(['ship', 'globe']) },
    { L: [1, 2], gen: picQ('compass', ['bell', 'drum', 'turkey', 'corn', 'bus'], 'Sailors used this to find their way. Which picture shows a compass?', 'the compass') },
    { L: [1, 2], gen: picQ('ship', ['wagon', 'train', 'rocket', 'bus', 'plane'], 'Which picture shows a sailing ship, like the ones explorers sailed?', 'the sailing ship') },
    { L: [1, 2, 3], q: 'Was the land empty when Columbus came?', a: 'No. Millions of people already lived here.', w: ['Yes. Nobody lived here.'], why: 'Native peoples had lived in the Americas for thousands of years.' },
    { L: [2, 3], q: 'Columbus sailed for…', a: 'the king and queen of Spain', w: ['the President', 'the Pilgrims'], why: 'Columbus sailed for the king and queen of Spain.' },
    { L: [2, 3], q: 'What was Columbus looking for?', a: 'a new way to Asia', w: ['the Moon', 'the North Pole'], why: 'He was looking for a sea route to Asia; instead he reached islands in the Caribbean.' },
    { L: [2, 3], q: 'Which was one of Columbus\'s ships?', a: 'the Santa María', w: ['the Mayflower', 'the Eagle'], why: 'Columbus had the Niña, the Pinta and the Santa María. The Mayflower carried the Pilgrims; the Eagle landed on the Moon.' },
    { L: [2, 3], gen: seqQ(EARLY.slice(0, 3)) },
    { L: [3], q: 'Columbus called the people he met "Indians" because he thought he had reached the Indies, near Asia.', tf: true, why: 'True: he thought he was near Asia.' },
    { L: [3], q: 'Columbus was the first person ever to live in America.', tf: false, why: 'False: millions of Native people already lived here.' }
  ], 'Explorers crossed the Atlantic Ocean in ships.'));

  G('usyoung.jamestown', fromBank([
    { L: [1, 2, 3], q: 'In what year was Jamestown founded?', a: '1607', w: ['1776', '1492', '1969'], why: 'Jamestown was founded in 1607.' },
    { L: [1, 2], q: 'Jamestown was in…', a: 'Virginia', w: ['California', 'Hawaii', 'Alaska'], why: 'Jamestown was in Virginia.', viz: { name: 'cv-map', opts: { mode: 'places', places: ['jamestown'], quiet: true, interactive: false } } },
    { L: [1, 2, 3], q: 'Which came first?', a: 'Jamestown (1607)', w: ['the Pilgrims at Plymouth (1620)'], why: 'Jamestown came first, in 1607, thirteen years before the Pilgrims (1620).' },
    { L: [1, 2], q: 'Jamestown was named after…', a: 'King James of England', w: ['George Washington', 'a famous ship'], why: 'The settlers named their town for their king, James.' },
    { L: [2, 3], q: 'Which Native people lived where Jamestown was built?', a: 'the Powhatan', w: ['the Wampanoag', 'the Shoshone'], why: 'The Powhatan lived there. The Wampanoag lived near Plymouth; the Shoshone, far west.' },
    { L: [1, 2], q: 'Many Jamestown settlers hoped to find…', a: 'gold', w: ['snow', 'the Moon'], why: 'Many hoped to find gold and get rich; instead they found hard times.' },
    { L: [2, 3], q: 'Later, Jamestown settlers grew which crop to sell?', a: 'tobacco', w: ['bananas', 'coffee'], why: 'Tobacco became the crop that helped the town grow.' },
    { L: [2, 3], q: 'At first, the Powhatan helped the settlers by…', a: 'trading food with them', w: ['building them a castle', 'sailing them home'], why: 'The Powhatan traded food, which helped the settlers live.' },
    { L: [1, 2], gen: picQ('ship', ['wagon', 'train', 'rocket', 'bus', 'plane'], 'The Jamestown settlers came in three small ships. Which picture shows a sailing ship?', 'the sailing ship') },
    { L: [2, 3], gen: seqQ(EARLY) },
    { L: [3], q: 'About Jamestown:', all: [['It was founded in 1607.', true], ['It was in Virginia.', true], ['The Powhatan lived there first.', true], ['The Pilgrims founded it.', false]], why: 'Jamestown, Virginia, 1607, on Powhatan land; the Pilgrims founded Plymouth in 1620.' },
    { L: [3], q: 'Jamestown was the first English settlement in America that lasted.', tf: true, why: 'True: it was founded in 1607 and lasted.' },
    { L: [3], q: 'Life was easy for the first Jamestown settlers.', tf: false, why: 'False: they had bad water, sickness and too little food.' }
  ], 'Jamestown came first, in 1607.'));

  G('usyoung.pilgrims', fromBank([
    { L: [1, 2, 3], q: 'In what year did the Pilgrims sail to America?', a: '1620', w: ['1607', '1776', '1492'], why: 'The Pilgrims sailed on the Mayflower in 1620.' },
    { L: [1, 2], q: 'What was the name of the Pilgrims\' ship?', a: 'the Mayflower', w: ['the Santa María', 'the Eagle', 'the Titanic'], why: 'The Pilgrims sailed on the Mayflower.', viz: pics(['mayflower']) },
    { L: [1, 2], gen: picQ('mayflower', ['wagon', 'canoe', 'train', 'rocket', 'bus'], 'Which picture shows the Mayflower?', 'the Mayflower, a sailing ship') },
    { L: [1, 2, 3], q: 'Why did the Pilgrims come to America?', a: 'to worship God in their own way', w: ['to find gold', 'to fly to the Moon'], why: 'They came mainly for their religion. Many Jamestown settlers had hoped to find gold.' },
    { L: [1, 2], q: 'The Pilgrims founded…', a: 'Plymouth Colony', w: ['Jamestown', 'Washington, D.C.'], why: 'The Pilgrims founded Plymouth Colony.' },
    { L: [2, 3], q: 'The Mayflower Compact was a promise to…', a: 'make fair laws together and obey them', w: ['find gold', 'go back to England'], why: 'Before landing, the men signed a promise to make fair laws for the colony and obey them.' },
    { L: [2, 3], q: 'How was the Pilgrims\' first winter?', a: 'very hard; about half of them died', w: ['warm and easy', 'spent on vacation'], why: 'The first winter was very hard, and about half of the Pilgrims died.' },
    { L: [2, 3], q: 'About how long did the trip across the ocean take?', a: 'about two months', w: ['one day', 'ten years'], why: 'The crowded trip took about two months.' },
    { L: [3], q: 'The Pilgrims came as families, with children.', tf: true, why: 'True: families and children sailed on the Mayflower.' },
    { L: [3], q: 'The Pilgrims came to America before Jamestown was founded.', tf: false, why: 'False: Jamestown was founded in 1607; the Pilgrims came in 1620.' }
  ], 'The Pilgrims came on the Mayflower in 1620.'));

  G('usyoung.harvest-1621', fromBank([
    { L: [1, 2, 3], q: 'Who showed the Pilgrims how to plant corn?', a: 'Squanto (Tisquantum)', w: ['Paul Revere', 'Lewis and Clark'], why: 'Squanto had learned English, and he showed the Pilgrims how to plant corn and where to fish.' },
    { L: [1, 2, 3], q: 'Which Wampanoag leader made peace with the Pilgrims?', a: 'Massasoit', w: ['Powhatan', 'Sacagawea'], why: 'Massasoit led the Wampanoag. Powhatan led a nation in Virginia; Sacagawea was Shoshone.' },
    { L: [1, 2], q: 'How long did the harvest feast last?', a: 'about three days', w: ['one hour', 'a whole year'], why: 'The feast lasted about three days.' },
    { L: [1, 2, 3], q: 'What did the Wampanoag bring to the feast?', a: 'five deer', w: ['a pizza', 'a birthday cake'], why: 'Massasoit\'s men went out and brought back five deer.' },
    { L: [2, 3], q: 'About how many Wampanoag men came to the feast?', a: 'about 90', w: ['about 2', 'about 1,000'], why: 'Edward Winslow wrote that Massasoit came with about 90 men.' },
    { L: [2, 3], q: 'How do we know about the 1621 feast?', a: 'from a letter by a Pilgrim, Edward Winslow', w: ['from a TV show made that day', 'from a photograph'], why: 'Edward Winslow described it in a letter in December 1621.' },
    { L: [1, 2], gen: picQ('corn', ['bell', 'rocket', 'kite', 'bus', 'drum'], 'The Pilgrims learned to plant this. Which picture shows corn?', 'the corn') },
    { L: [2, 3], gen: seqQ([['The Mayflower lands', 1, 'fall 1620'], ['A hard first winter', 2, 'winter 1620 to 1621'], ['Squanto shows how to plant corn', 3, 'spring 1621'], ['The harvest feast', 4, 'fall 1621']], { q: 'What happened first?', hint: 'Tell the story from the beginning: the ship, the winter, the planting, the harvest.' }) },
    { L: [3], q: 'The 1621 feast was a small dinner that lasted one hour.', tf: false, why: 'False: it lasted about three days, with about 90 Wampanoag guests.' },
    { L: [3], q: 'About the 1621 harvest feast:', all: [['The Wampanoag brought deer.', true], ['It lasted about three days.', true], ['Massasoit came.', true], ['It was in 1776.', false]], why: 'In the fall of 1621, Massasoit and about 90 men joined the Pilgrims for about three days and brought five deer.' }
  ], 'Think about the Wampanoag and the Pilgrims in 1621.'));

  var COL = ['New Hampshire', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New York', 'New Jersey', 'Pennsylvania', 'Delaware', 'Maryland', 'Virginia', 'North Carolina', 'South Carolina', 'Georgia'];
  var NOTCOL = ['California', 'Texas', 'Ohio', 'Florida', 'Alaska', 'Hawaii', 'Oregon'];
  G('usyoung.thirteen-colonies', fromBank([
    { L: [1, 2, 3], q: 'How many English colonies became the first states?', a: '13', w: ['50', '3', '7'], why: 'There were thirteen colonies.', viz: { name: 'cv-map', opts: { mode: 'colonies', quiet: true, interactive: false } } },
    { L: [1, 2], q: 'The thirteen colonies were along which ocean?', a: 'the Atlantic Ocean', w: ['the Pacific Ocean'], why: 'The colonies were a strip along the Atlantic coast.' },
    { L: [1, 2, 3], gen: function (R) { var c = R.pick(COL); return { q: 'Which one was one of the thirteen colonies?', a: c, w: NOTCOL, why: c + ' was one of the thirteen colonies. ' + 'States like California and Texas joined much later.' }; } },
    { L: [2, 3], q: 'Which was the last of the thirteen colonies?', a: 'Georgia', w: ['Virginia', 'Massachusetts'], why: 'Georgia began in 1732, the last of the thirteen. Virginia (Jamestown) came first.' },
    { L: [1, 2], q: 'What do the 13 stripes on the flag stand for?', a: 'the thirteen colonies', w: ['the 50 states', '13 Presidents'], why: 'The 13 stripes stand for the thirteen colonies.', viz: { name: 'cv-flag', opts: { stars: 50, quiet: true, interactive: false } } },
    { L: [2, 3], q: 'Who lived on most of the land west of the colonies?', a: 'Native nations', w: ['nobody', 'the king of England'], why: 'Most of the land to the west was home to Native nations.' },
    { L: [2, 3], q: 'Which group of colonies was in the north, with fishing and shipbuilding?', a: 'New England', w: ['the Southern colonies', 'the Middle colonies'], why: 'The New England colonies were in the north.' },
    { L: [3], q: 'The thirteen colonies covered the whole country, coast to coast.', tf: false, why: 'False: they were a strip along the Atlantic coast.' },
    { L: [3], q: 'The thirteen colonies later became the first thirteen states.', tf: true, why: 'True: and the flag\'s 13 stripes stand for them.' }
  ], 'The thirteen colonies were along the Atlantic coast.'));

  /* ================================================================ Unit 6: The Revolution and a New Nation */
  var REV = [['Parliament taxes paper', 1765, '1765'], ['The Boston Tea Party', 1773, '1773'], ['Fighting begins at Lexington and Concord', 1775, '1775'], ['The Declaration of Independence', 1776, '1776'], ['The victory at Yorktown', 1781, '1781'], ['The war ends', 1783, '1783']];
  G('usyoung.why-break-away', fromBank([
    { L: [1, 2, 3], q: 'Who ruled the thirteen colonies before the Revolution?', a: 'Britain and its king', w: ['the President', 'the Wampanoag'], why: 'The colonies were ruled by Britain and King George III.' },
    { L: [1, 2], q: 'The colonists said: "No taxation without…"', a: 'representation', w: ['vacation', 'celebration'], why: '"No taxation without representation": no taxes unless leaders we chose vote on them.' },
    { L: [1, 2, 3], q: 'At the Boston Tea Party, what did colonists dump into the harbor?', a: 'tea', w: ['gold', 'corn', 'snow'], why: 'In 1773, colonists dumped chests of tea from three ships into Boston Harbor.' },
    { L: [1, 2, 3], q: 'Why were many colonists angry about the taxes?', a: 'They had no vote in Parliament, which made the taxes.', w: ['They did not like tea.', 'They wanted more holidays.'], why: 'Parliament taxed the colonists, but the colonists had no vote there.' },
    { L: [2, 3], q: 'Who was the king of Britain then?', a: 'King George III', w: ['King James', 'George Washington'], why: 'King George III ruled Britain. George Washington led the American army.' },
    { L: [1, 2], q: 'A tax is…', a: 'money people pay to the government', w: ['a kind of hat', 'a game with a ball'], why: 'A tax is money people pay to the government.' },
    { L: [1, 2], gen: picQ('crown', ['tricorn', 'tophat', 'bell', 'corn', 'drum'], 'Which picture shows a king\'s crown?', 'the crown') },
    { L: [2, 3], gen: seqQ(REV.slice(0, 4)) },
    { L: [3], gen: seqQ(REV.slice(0, 4), { last: true }) },
    { L: [3], q: 'The colonists did not want to pay any taxes at all.', tf: false, why: 'False: their complaint was who decided the taxes. They wanted leaders they had chosen to vote on them.' },
    { L: [3], q: 'In 1775 fighting began, and the American Revolution started.', tf: true, why: 'True: fighting began at Lexington and Concord in 1775.' }
  ], 'Think of "no taxation without representation."'));

  G('usyoung.declaration-young', fromBank([
    { L: [1, 2, 3], q: 'Who wrote the Declaration of Independence?', a: 'Thomas Jefferson', w: ['Abraham Lincoln', 'Francis Scott Key', 'George Washington'], why: 'Thomas Jefferson wrote the Declaration.' },
    { L: [1, 2, 3], q: 'When was the Declaration of Independence adopted?', a: 'July 4, 1776', w: ['September 17, 1787', 'July 20, 1969', 'June 19, 1865'], why: 'It was adopted on July 4, 1776. (September 17, 1787, is when the Constitution was signed.)' },
    { L: [1, 2], q: 'The Declaration says that all men are created…', a: 'equal', w: ['kings', 'tall'], why: '"All men are created equal": every person matters the same.' },
    { L: [1, 2, 3], q: 'The Declaration names rights to…', a: 'life, liberty and the pursuit of happiness', w: ['cake, candy and ice cream', 'gold, ships and castles'], why: 'Life, liberty and the pursuit of happiness: to live, to be free and to try to find happiness.' },
    { L: [1, 2, 3], q: 'Did the colonies become free on the day of the Declaration?', a: 'No. They still had to win the war.', w: ['Yes. The war ended that day.'], why: 'The Declaration said they were free. The war went on until 1783.' },
    { L: [2, 3], q: 'Whose signature on the Declaration is very big?', a: 'John Hancock', w: ['Abraham Lincoln', 'Paul Revere'], why: 'John Hancock wrote his name very big.' },
    { L: [2, 3], q: 'In which city was the Declaration adopted?', a: 'Philadelphia', w: ['Boston', 'Washington, D.C.'], why: 'Leaders met in Philadelphia. Washington, D.C., did not exist yet.' },
    { L: [1, 2], gen: picQ('scroll', ['constitution', 'bell', 'corn', 'kite'], 'Which picture shows the Declaration of Independence?', 'the Declaration of Independence') },
    { L: [2, 3], q: 'Read the words. Which word finishes "all men are created ___"?', a: 'equal', w: ['free', 'happy'], why: '"We hold these truths to be self-evident, that all men are created equal."', viz: { name: 'cv-doc', opts: { doc: 'declaration', quiet: true, interactive: false } } },
    { L: [3], q: 'About 56 leaders signed the Declaration.', tf: true, why: 'True: fifty-six leaders signed it.' },
    { L: [3], q: 'The Declaration of Independence set up the three branches of government.', tf: false, why: 'False: the Constitution (1787) set up the government. The Declaration (1776) said we would be free.' }
  ], 'The Declaration said the colonies would be free.'));

  G('usyoung.george-washington', fromBank([
    { L: [1, 2, 3], q: 'Who was the first President?', a: 'George Washington', w: ['Abraham Lincoln', 'Thomas Jefferson', 'Ben Franklin'], why: 'George Washington became the first President in 1789.' },
    { L: [1, 2, 3], q: 'In the Revolution, Washington led…', a: 'the Continental Army', w: ['the Pilgrims', 'the Corps of Discovery'], why: 'Washington led the Continental Army.' },
    { L: [1, 2], q: 'Washington is called the…', a: 'Father of His Country', w: ['King of America', 'Inventor of the Light Bulb'], why: 'Washington is called the Father of His Country.' },
    { L: [1, 2, 3], q: 'Was George Washington a king?', a: 'No. He chose to give up power after two terms.', w: ['Yes. He ruled for life.'], why: 'Washington stepped down after two terms so a new leader could be chosen.' },
    { L: [2, 3], q: 'In what year did Washington become President?', a: '1789', w: ['1492', '1969', '1620'], why: 'Washington became the first President in 1789.' },
    { L: [2, 3], q: 'How many terms did Washington serve as President?', a: 'two', w: ['ten', 'one hundred'], why: 'He served two terms, eight years, and then stepped down.' },
    { L: [1, 2], q: 'Which city is named after George Washington?', a: 'Washington, D.C.', w: ['Philadelphia', 'Boston'], why: 'Our capital, Washington, D.C., is named for him.' },
    { L: [2, 3], q: 'Washington\'s army won a big victory in 1781 at…', a: 'Yorktown', w: ['Plymouth', 'Kitty Hawk'], why: 'The victory at Yorktown led to the end of the war.' },
    { L: [3], q: 'Where did Washington\'s army spend a cold, hungry winter?', a: 'Valley Forge', w: ['Fort McHenry', 'Jamestown'], why: 'At Valley Forge, Washington kept the cold, hungry army together.' },
    { L: [1, 2], gen: picQ('tricorn', ['tophat', 'crown', 'bell', 'corn', 'bus'], 'Soldiers in Washington\'s army wore hats like this. Which picture shows a three-cornered hat?', 'the three-cornered hat') },
    { L: [3], q: 'Washington was President during the whole war.', tf: false, why: 'False: he led the army in the war and became President later, in 1789.' }
  ], 'Washington led the army, then became the first President.'));

  var HEROES = [['Paul Revere', 'rode at night to warn that British soldiers were coming'], ['Ben Franklin', 'went to France and won its help'], ['the Marquis de Lafayette', 'came from France to fight beside Washington'], ['Deborah Sampson', 'dressed as a man to join the army'], ['Thomas Jefferson', 'wrote the Declaration of Independence']];
  G('usyoung.revolution-heroes', fromBank([
    { L: [1, 2, 3], gen: function (R) { var h = R.pick(HEROES); return { q: 'Who ' + h[1] + '?', a: h[0], w: HEROES.filter(function (x) { return x !== h; }).map(function (x) { return x[0]; }), why: h[0].charAt(0).toUpperCase() + h[0].slice(1) + ' ' + h[1] + '.' }; } },
    { L: [1, 2], q: 'Which country sent soldiers, ships and money to help the Americans?', a: 'France', w: ['Japan', 'Australia'], why: 'Ben Franklin won the help of France.' },
    { L: [1, 2], gen: picQ('lantern', ['bulb', 'phone', 'rocket', 'corn', 'bus'], 'Lanterns in a church tower were a signal on the night of Paul Revere\'s ride. Which picture shows a lantern?', 'the lantern') },
    { L: [2, 3], q: 'About how many Black soldiers served in the American army in the Revolution?', a: 'about 5,000', w: ['about 5', 'about 5 million'], why: 'About 5,000 Black soldiers served in the American army.' },
    { L: [2, 3], q: 'While many men were at war, many women…', a: 'ran farms and shops', w: ['went to the Moon', 'stopped working'], why: 'Women ran farms and shops, and a few, like Deborah Sampson, joined the army.' },
    { L: [3], q: 'Who helped win the Revolution?', all: [['farmers and soldiers', true], ['women at home and in the army', true], ['Black soldiers and sailors', true], ['astronauts', false]], why: 'People of every background helped. Astronauts came almost 200 years later!' },
    { L: [3], q: 'Only generals helped win the war.', tf: false, why: 'False: farmers, women, Black soldiers and sailors, Native allies and friends from France all played a part.' }
  ], 'Many different people helped win independence.'));

  G('usyoung.constitution-young', fromBank([
    { L: [1, 2], q: 'The Constitution is our country\'s…', a: 'rulebook', w: ['birthday song', 'favorite food'], why: 'The Constitution is the rulebook for our government.' },
    { L: [1, 2, 3], q: 'What are the first three words of the Constitution?', a: '"We the People"', w: ['"Once upon a time"', '"O say can you see"'], why: 'The Constitution begins "We the People." ("O say can you see" begins the national anthem.)' },
    { L: [1, 2, 3], q: 'In what year was the Constitution written?', a: '1787', w: ['1776', '1969', '1492'], why: 'Leaders wrote the Constitution in 1787. The Declaration was 1776.' },
    { L: [1, 2, 3], gen: pairQ([['Written in 1776', 0], ['Written in 1787', 1], ['Says the colonies will be free', 0], ['Sets up how our government works', 1], ['Begins with the words ‘We the People’', 1], ['Says ‘all men are created equal’', 0]], ['the Declaration of Independence', 'the Constitution'], function (t) { return 'Which paper is it? "' + t + '"'; }) },
    { L: [2, 3], q: 'Who led the meeting that wrote the Constitution?', a: 'George Washington', w: ['Abraham Lincoln', 'Paul Revere'], why: 'George Washington led the meeting in Philadelphia in 1787.' },
    { L: [2, 3], q: 'What are the first ten amendments called?', a: 'the Bill of Rights', w: ['the Mayflower Compact', 'the Declaration of Independence'], why: 'The first ten amendments are the Bill of Rights. They protect freedoms like speaking and worshiping freely.' },
    { L: [1, 2], gen: picQ('constitution', ['scroll', 'bell', 'flag', 'corn'], 'Which picture shows the Constitution, which begins "We the People"?', 'the Constitution') },
    { L: [2, 3], q: 'Read the first words. Who does the government belong to?', a: 'We the People', w: ['the king', 'one family'], why: '"We the People": the government belongs to the people.', viz: { name: 'cv-doc', opts: { doc: 'preamble', quiet: true, interactive: false, big: true } } },
    { L: [3], q: 'Constitution Day is…', a: 'September 17', w: ['July 4', 'December 25'], why: 'The Constitution was signed on September 17, 1787.' },
    { L: [3], q: 'The Constitution still guides our country today.', tf: true, why: 'True: it is still our rulebook, with 27 amendments.' }
  ], 'The Constitution (1787) is the rulebook; the Declaration (1776) said we would be free.'));

  var BRQ = [['Who makes the laws?', 'Congress', 'legislative'], ['Who carries out the laws?', 'the President', 'executive'], ['Who decides what the laws mean?', 'the courts', 'judicial']];
  G('usyoung.three-branches-young', fromBank([
    { L: [1, 2, 3], gen: function (R) { var b = R.pick(BRQ); return { q: b[0], a: b[1], w: BRQ.filter(function (x) { return x !== b; }).map(function (x) { return x[1]; }), why: 'Congress makes the laws, the President carries them out, and the courts decide what they mean.' }; } },
    { L: [2, 3], gen: function (R) { var b = R.pick(BRQ); return { q: 'Look at the three branches. Who goes in the box with the "?"', a: b[1], w: BRQ.filter(function (x) { return x !== b; }).map(function (x) { return x[1]; }), why: 'Congress makes the laws, the President carries them out, and the courts decide what they mean.', viz: { name: 'cv-branches', opts: { simple: true, ask: b[2], quiet: true, interactive: false } } }; } },
    { L: [1, 2], q: 'How many branches does our government have?', a: 'three', w: ['one', 'fifty'], why: 'Three branches: Congress, the President and the courts.' },
    { L: [1, 2, 3], q: 'Where does Congress meet?', a: 'the Capitol', w: ['the White House', 'the Liberty Bell'], why: 'Congress meets in the Capitol. The President works in the White House.', viz: pics(['capitol', 'whitehouse']) },
    { L: [1, 2], gen: picQ('gavel', ['bell', 'drum', 'corn', 'kite', 'crown'], 'A judge uses this in court. Which picture shows a gavel?', 'the gavel') },
    { L: [2, 3], q: 'Why did the Constitution make three branches?', a: 'so no one person has all the power', w: ['so there can be three kings', 'so nobody has to work'], why: 'Each branch has its own job and can check the others.' },
    { L: [2, 3], q: 'How many justices are on the Supreme Court?', a: 'nine', w: ['one', 'fifty'], why: 'The Supreme Court has nine justices.' },
    { L: [3], q: 'The President makes all the laws.', tf: false, why: 'False: Congress makes the laws. The President carries them out.' },
    { L: [3], q: 'About the three branches:', all: [['Congress makes the laws.', true], ['The President carries out the laws.', true], ['The courts decide what the laws mean.', true], ['The courts make all the laws.', false]], why: 'Congress makes, the President does, the courts decide.' }
  ], 'Congress makes, the President does, the courts decide.'));

  /* ================================================================ Unit 7: A Growing and Changing Country */
  var LCMAP = { name: 'cv-map', opts: { mode: 'places', places: ['stlouis'], trails: ['lewisclark'], quiet: true, interactive: false } };
  G('usyoung.lewis-and-clark', fromBank([
    { L: [1, 2, 3], q: 'In what year did Lewis and Clark set out?', a: '1804', w: ['1492', '1969', '1620'], why: 'Lewis and Clark set out in 1804 and reached the Pacific in 1805.' },
    { L: [1, 2, 3], q: 'Which ocean did Lewis and Clark reach?', a: 'the Pacific Ocean', w: ['the Atlantic Ocean', 'the Arctic Ocean'], why: 'They traveled west and reached the Pacific Ocean in 1805.', viz: LCMAP },
    { L: [1, 2, 3], q: 'Which young Shoshone woman helped Lewis and Clark?', a: 'Sacagawea', w: ['Pocahontas', 'Harriet Tubman'], why: 'Sacagawea, a Shoshone woman, helped them. Pocahontas lived at Jamestown, 200 years earlier.' },
    { L: [1, 2], q: 'Which President sent Lewis and Clark?', a: 'Thomas Jefferson', w: ['Abraham Lincoln', 'George Washington'], why: 'President Thomas Jefferson sent them to explore the West.' },
    { L: [2, 3], q: 'In 1803 the United States bought a huge piece of land from France. It was called…', a: 'the Louisiana Purchase', w: ['the Mayflower Compact', 'the Oregon Trail'], why: 'The Louisiana Purchase made the country about twice as big.' },
    { L: [2, 3], q: 'Lewis and Clark\'s group was called…', a: 'the Corps of Discovery', w: ['the Continental Army', 'the Pilgrims'], why: 'Their group was the Corps of Discovery.' },
    { L: [3], q: 'Lewis and Clark paddled up which river?', a: 'the Missouri River', w: ['the Thames River', 'the Nile River'], why: 'They went up the Missouri River and then crossed the Rocky Mountains.' },
    { L: [1, 2, 3], q: 'What did the Shoshone trade to Lewis and Clark so they could cross the mountains?', a: 'horses', w: ['cars', 'airplanes'], why: 'The Shoshone traded them horses for the Rocky Mountains.' },
    { L: [1, 2], q: 'Did Lewis and Clark find empty land?', a: 'No. They met many Native nations.', w: ['Yes. Nobody lived there.'], why: 'They met many Native nations, who helped with routes, food and horses.' },
    { L: [1, 2], gen: picQ('canoe', ['rocket', 'bus', 'train', 'plane'], 'Lewis and Clark traveled on rivers. Which picture shows a canoe?', 'the canoe') },
    { L: [3], q: 'Lewis and Clark came home in 1806 and kept journals of what they saw.', tf: true, why: 'True: their journals tell us what they saw.' },
    { L: [3], q: 'Sacagawea was an explorer from England.', tf: false, why: 'False: Sacagawea was a Shoshone woman who spoke Shoshone and helped the explorers.' }
  ], 'Lewis and Clark explored the West in 1804 to 1806.'));

  G('usyoung.pioneers', fromBank([
    { L: [1, 2, 3], q: 'Pioneers traveled west in…', a: 'covered wagons', w: ['airplanes', 'rockets'], why: 'Pioneer families packed covered wagons and traveled west.', viz: pics(['wagon']) },
    { L: [1, 2], gen: picQ('wagon', ['train', 'bus', 'rocket', 'ship', 'canoe'], 'Which picture shows a covered wagon?', 'the covered wagon') },
    { L: [1, 2, 3], q: 'What pulled most pioneer wagons?', a: 'oxen', w: ['cars', 'trains'], why: 'Oxen pulled the wagons slowly, mile after mile.' },
    { L: [1, 2, 3], q: 'Most pioneers…', a: 'walked beside the wagon', w: ['rode in the wagon the whole way', 'flew'], why: 'The wagon was packed full, so most pioneers walked beside it.' },
    { L: [1, 2], q: 'About how long did the trip on the Oregon Trail take?', a: 'five or six months', w: ['one day', 'ten years'], why: 'The trip took five or six months.' },
    { L: [2, 3], q: 'About how long was the Oregon Trail?', a: 'about 2,000 miles', w: ['about 20 miles', 'about 2 million miles'], why: 'The Oregon Trail ran about 2,000 miles.', viz: { name: 'cv-map', opts: { mode: 'places', places: ['independence', 'oregoncity'], trails: ['oregon'], quiet: true, interactive: false } } },
    { L: [1, 2], q: 'Why did pioneer families go west?', a: 'to find new land for farms and homes', w: ['to see the Moon', 'to go to school'], why: 'Many families wanted new land in the West.' },
    { L: [2, 3], q: 'In 1869, what made the trip west much faster?', a: 'a railroad across the country', w: ['the airplane', 'the telephone'], why: 'The railroad was finished in 1869. The airplane came in 1903.', viz: pics(['train']) },
    { L: [2, 3], q: 'When did many pioneer families start on the Oregon Trail?', a: 'in the 1840s', w: ['in the 1600s', 'in the 1960s'], why: 'Thousands set out in the 1840s.' },
    { L: [1, 2], gen: picQ('cabin', ['tipi', 'pueblo', 'capitol', 'whitehouse'], 'Many pioneers built a home of logs at the end of the trail. Which picture shows a log cabin?', 'the log cabin') },
    { L: [2, 3], gen: seqQ([['Lewis and Clark set out', 1804, '1804'], ['Big wagon trains start on the Oregon Trail', 1843, '1843'], ['The California Gold Rush', 1849, '1849'], ['The railroad across the country is finished', 1869, '1869']]) },
    { L: [3], q: 'About the pioneers:', all: [['They traveled in covered wagons.', true], ['Oxen pulled the wagons.', true], ['Most of them walked.', true], ['They flew in airplanes.', false]], why: 'Covered wagons, pulled by oxen, with most people walking beside them.' },
    { L: [3], q: 'Pioneers rode in the wagon the whole way.', tf: false, why: 'False: the wagon was packed full of food and tools, so most pioneers walked.' },
    { L: [3], q: 'Native nations lived along the trails the pioneers used.', tf: true, why: 'True: many traded food and helped travelers cross rivers.' }
  ], 'Pioneers went west in covered wagons pulled by oxen.'));

  G('usyoung.slavery-and-freedom', fromBank([
    { L: [1, 2, 3], q: 'People who were enslaved were…', a: 'not free', w: ['paid a lot of money', 'on vacation'], why: 'Enslaved people were not free. They were forced to work without pay.' },
    { L: [1, 2, 3], q: 'Enslaved people were forced to work…', a: 'without pay', w: ['only on weekends', 'for a lot of money'], why: 'They were forced to work without pay, and they could not choose where to live.' },
    { L: [1, 2, 3], q: 'In what year did slavery end in the United States?', a: '1865', w: ['1492', '1969', '1776'], why: 'Slavery ended in 1865, after the Civil War.' },
    { L: [1, 2], q: 'A broken chain stands for…', a: 'freedom', w: ['a party', 'a storm'], why: 'A broken chain stands for the end of slavery: freedom.', viz: pics(['chain']) },
    { L: [2, 3], q: 'Was slavery only in one place?', a: 'No. It was in all thirteen colonies.', w: ['Yes. It was only in one town.'], why: 'Slavery was in all thirteen colonies. After the Revolution, the Northern states began to end it, but in the South it grew.' },
    { L: [2, 3], q: 'How long did slavery last in America?', a: 'more than 200 years', w: ['one year', 'ten years'], why: 'From 1619 to 1865 is more than 200 years.' },
    { L: [2, 3], q: 'What did it take to end slavery everywhere in the country?', a: 'a long struggle and the Civil War', w: ['one short meeting', 'a single day of school'], why: 'It took a long struggle by many people and the Civil War.' },
    { L: [3], q: 'Which amendment to the Constitution ended slavery?', a: 'the Thirteenth Amendment', w: ['the First Amendment', 'the Nineteenth Amendment'], why: 'The Thirteenth Amendment, in 1865, ended slavery.' },
    { L: [2, 3], gen: seqQ([['The first recorded Africans arrive in Virginia', 1619, '1619'], ['The Declaration of Independence', 1776, '1776'], ['The Civil War begins', 1861, '1861'], ['Slavery ends', 1865, '1865']]) },
    { L: [1, 2], gen: picQ('chain', ['bell', 'corn', 'kite', 'drum'], 'Which picture shows a broken chain, a sign of freedom?', 'the broken chain') },
    { L: [3], q: 'About slavery:', all: [['Enslaved people were not free.', true], ['They were forced to work without pay.', true], ['Slavery ended in 1865.', true], ['Slavery was only in one town.', false]], why: 'Enslaved people were not free and were forced to work without pay, in all thirteen colonies; slavery ended in 1865.' },
    { L: [3], q: 'Many enslaved people tried to escape to freedom.', tf: true, why: 'True: many tried to escape, and many people, enslaved and free, worked to end slavery.' },
    { L: [3], q: 'Slavery ended as soon as people said it was wrong.', tf: false, why: 'False: it took a long struggle and a war. It ended in 1865.' }
  ], 'Enslaved people were not free. Slavery ended in 1865.'));

  G('usyoung.freedom-heroes', fromBank([
    { L: [1, 2, 3], q: 'Who escaped slavery and led others to freedom on the Underground Railroad?', a: 'Harriet Tubman', w: ['Frederick Douglass', 'Clara Barton', 'Betsy Ross'], why: 'Harriet Tubman led about 70 people to freedom.' },
    { L: [1, 2, 3], q: 'Who escaped slavery and became a great speaker and writer against it?', a: 'Frederick Douglass', w: ['Harriet Tubman', 'Paul Revere', 'Thomas Edison'], why: 'Frederick Douglass wrote books, started a newspaper and gave speeches.' },
    { L: [1, 2, 3], q: 'What was the Underground Railroad?', a: 'a secret network of people and hiding places', w: ['a real train under the ground', 'a subway in a big city'], why: 'It was not a real train. People and hiding places helped others escape.' },
    { L: [1, 2], q: 'People escaping at night often followed the…', a: 'North Star', w: ['Moon landing', 'traffic light'], why: 'The North Star showed the way north, toward freedom.', viz: pics(['star']) },
    { L: [2, 3], q: 'About how many people did Harriet Tubman lead to freedom?', a: 'about 70', w: ['about 7', 'about 7,000'], why: 'The National Park Service says about 70 people, in about 13 trips.' },
    { L: [2, 3], q: 'How did Frederick Douglass learn to read?', a: 'in secret, as a boy', w: ['at a big school', 'he never learned'], why: 'He learned to read in secret and later wrote books.' },
    { L: [2, 3], q: 'Helpers on the Underground Railroad were called…', a: 'conductors', w: ['pilots', 'astronauts'], why: 'Helpers were called "conductors," like on a train.' },
    { L: [1, 2], gen: picQ('star', ['bell', 'corn', 'bus', 'drum'], 'People escaping at night followed the North Star. Which picture shows a star?', 'the star') },
    { L: [1, 2], gen: picQ('quill', ['drum', 'corn', 'bus', 'kite'], 'Frederick Douglass wrote books. Which picture shows a pen for writing?', 'the quill pen') },
    { L: [2, 3], gen: seqQ([['Frederick Douglass escapes', 1838, '1838'], ['Harriet Tubman escapes', 1849, '1849'], ['The Civil War begins', 1861, '1861'], ['Slavery ends', 1865, '1865']]) },
    { L: [3], q: 'About Harriet Tubman and Frederick Douglass:', all: [['Both escaped from slavery.', true], ['Tubman led others to freedom.', true], ['Douglass gave speeches and wrote books.', true], ['They rode a real underground train.', false]], why: 'Both escaped; Tubman guided others; Douglass spoke and wrote. The Underground Railroad was a secret network.' },
    { L: [3], q: 'The Underground Railroad was a train under the ground.', tf: false, why: 'False: it was a secret network of people and hiding places.' },
    { L: [3], q: 'Harriet Tubman escaped from slavery in Maryland in 1849.', tf: true, why: 'True: she escaped in 1849 and then went back again and again.' }
  ], 'Tubman led people to freedom; Douglass spoke and wrote.'));

  var PRES = [['George Washington becomes President', 1789, '1789'], ['Abraham Lincoln becomes President', 1861, '1861'], ['The Civil War ends', 1865, '1865'], ['Lewis and Clark set out', 1804, '1804']];
  G('usyoung.abraham-lincoln', fromBank([
    { L: [1, 2, 3], q: 'Which President was Abraham Lincoln?', a: 'the 16th', w: ['the 1st', 'the 50th'], why: 'Lincoln was the 16th President. Washington was the 1st.' },
    { L: [1, 2], q: 'Lincoln was born in a…', a: 'log cabin', w: ['castle', 'rocket'], why: 'Lincoln was born in 1809 in a small log cabin in Kentucky.', viz: pics(['cabin']) },
    { L: [1, 2, 3], q: 'Lincoln led the country through…', a: 'the Civil War', w: ['the Revolution', 'the first Moon landing'], why: 'Lincoln led the country through the Civil War, 1861 to 1865.' },
    { L: [1, 2], q: 'People called Lincoln…', a: '"Honest Abe"', w: ['"Speedy Sam"', '"the King"'], why: 'Lincoln was known as "Honest Abe."' },
    { L: [1, 2], gen: picQ('tophat', ['tricorn', 'crown', 'bell', 'corn', 'bus'], 'Lincoln wore a tall hat. Which picture shows a tall stovepipe hat?', 'the tall stovepipe hat') },
    { L: [2, 3], q: 'In 1863 Lincoln signed the…', a: 'Emancipation Proclamation', w: ['Declaration of Independence', 'Mayflower Compact'], why: 'The Emancipation Proclamation said enslaved people in the rebelling states were free.' },
    { L: [1, 2, 3], gen: seqQ(PRES) },
    { L: [2, 3], q: 'Lincoln\'s face is on which bill?', a: 'the five-dollar bill', w: ['the one-dollar bill', 'the twenty-dollar bill'], why: 'Lincoln is on the five-dollar bill. Washington is on the one-dollar bill.' },
    { L: [3], q: 'Where did Lincoln give a short, famous speech in 1863?', a: 'Gettysburg', w: ['Jamestown', 'Kitty Hawk'], why: 'Lincoln gave the Gettysburg Address in 1863.' },
    { L: [3], q: 'Lincoln was the first President.', tf: false, why: 'False: Washington was the 1st (1789); Lincoln was the 16th (1861).' },
    { L: [3], q: 'Lincoln worked to end slavery and keep the country together.', tf: true, why: 'True: the North won in 1865, the country stayed one, and slavery ended.' }
  ], 'Lincoln was the 16th President, in the Civil War.'));

  var INV = [['Ben Franklin', 'showed that lightning is electricity', 1752, 'kite'], ['Alexander Graham Bell', 'made the telephone', 1876, 'phone'], ['Thomas Edison', 'made a light bulb that lasted', 1879, 'bulb'], ['the Wright brothers', 'flew the first airplane', 1903, 'plane']];
  G('usyoung.inventors', fromBank([
    { L: [1, 2, 3], gen: function (R) { var x = R.pick(INV); return { q: 'Who ' + x[1] + '?', a: x[0], w: INV.filter(function (y) { return y !== x; }).map(function (y) { return y[0]; }), why: x[0].charAt(0).toUpperCase() + x[0].slice(1) + ' ' + x[1] + ' (' + x[2] + ').', viz: pics([x[3]]) }; } },
    { L: [1, 2, 3], gen: function (R) { var x = R.pick(INV), others = INV.filter(function (y) { return y !== x; }); var keys = R.shuffle([x[3]].concat(R.sample(others, 2).map(function (y) { return y[3]; }))), L = 'ABC'.charAt(keys.indexOf(x[3])); return { q: 'Which picture shows what ' + x[0] + ' invented or used?', a: L, w: 'ABC'.split('').filter(function (c) { return c !== L; }), why: 'Picture ' + L + ' is ' + MathLadder.civics.PICTURES[x[3]] + '.', viz: pics(keys) }; } },
    { L: [2, 3], gen: seqQ(INV.map(function (x) { return [x[0].charAt(0).toUpperCase() + x[0].slice(1) + '\'s ' + (x[3] === 'kite' ? 'kite' : x[3] === 'phone' ? 'telephone' : x[3] === 'bulb' ? 'light bulb' : 'airplane'), x[2], String(x[2])]; }), { q: 'Which invention came first?' }) },
    { L: [2, 3], q: 'How did Thomas Edison work?', a: 'with a whole team in his laboratory', w: ['all alone, in secret', 'only at night on a boat'], why: 'Edison had a whole team in his laboratory at Menlo Park.' },
    { L: [3], q: 'Where did the Wright brothers make their first flight?', a: 'Kitty Hawk, North Carolina', w: ['Plymouth, Massachusetts', 'Philadelphia'], why: 'On December 17, 1903, they flew at Kitty Hawk, North Carolina.' },
    { L: [3], q: 'About how long was the first airplane flight?', a: '12 seconds', w: ['12 hours', '12 days'], why: 'Orville Wright\'s first flight lasted 12 seconds.' },
    { L: [2, 3], q: 'Ben Franklin\'s discovery about lightning led to…', a: 'the lightning rod, which protects buildings', w: ['the airplane', 'the telephone'], why: 'The lightning rod carries lightning safely into the ground.' },
    { L: [3], q: 'Inventors always work alone.', tf: false, why: 'False: Edison had a team, and the Wright brothers worked together.' }
  ], 'Match each invention to its inventor and year.'));

  var CAPS = [['TX', 'Houston'], ['CA', 'Los Angeles'], ['NY', 'New York City'], ['FL', 'Miami'], ['IL', 'Chicago'], ['PA', 'Philadelphia'], ['GA', null], ['CO', null], ['AZ', null], ['MA', null], ['OH', 'Cleveland'], ['HI', null]];
  G('usyoung.fifty-states', fromBank([
    { L: [1, 2, 3], q: 'How many states does our country have today?', a: '50', w: ['13', '100', '48'], why: 'There are 50 states, and 50 stars on the flag.', viz: { name: 'cv-flag', opts: { stars: 50, quiet: true, interactive: false } } },
    { L: [1, 2, 3], q: 'Which was the first state?', a: 'Delaware', w: ['Hawaii', 'Alaska', 'California'], why: 'Delaware was first, in 1787. Alaska and Hawaii were last, in 1959.' },
    { L: [1, 2, 3], q: 'Which were the last two states to join?', a: 'Alaska and Hawaii', w: ['Delaware and Pennsylvania', 'Virginia and New York'], why: 'Alaska and Hawaii joined in 1959.' },
    { L: [2, 3], q: 'In what year did Alaska and Hawaii become states?', a: '1959', w: ['1787', '1492', '1620'], why: 'Both became states in 1959.' },
    { L: [1, 2], q: 'Did all 50 states join at the same time?', a: 'No. They joined one at a time.', w: ['Yes. They all joined in one day.'], why: 'States joined one at a time, from 1787 to 1959.', viz: { name: 'cv-map', opts: { mode: 'states', color: 'admitted', quiet: true, interactive: false } } },
    { L: [1, 2], q: 'When a new state joined, what was added to the flag?', a: 'a star', w: ['a stripe', 'a picture of an eagle'], why: 'A new star was added for each new state.' },
    { L: [1, 2], q: 'Each state has its own…', a: 'capital city', w: ['king', 'ocean'], why: 'Each state has a capital city, where its leaders work.' },
    { L: [2, 3], gen: function (R) {
        var c = R.pick(CAPS), st = MathLadder.civics.state(c[0]), cap = st.capital, others = CAPS.filter(function (x) { return x !== c; }).map(function (x) { return MathLadder.civics.state(x[0]).capital; });
        var w = c[1] ? [c[1]].concat(R.sample(others, 2)) : R.sample(others, 3);
        return { q: 'What is the capital city of ' + st.name + '?', a: cap, w: w, why: 'The capital of ' + st.name + ' is ' + cap + '.' + (c[1] ? ' ' + c[1] + ' is a big city there, but it is not the capital.' : ''), hint: 'The capital is where the state\'s leaders work. It is not always the biggest city.' };
      } },
    { L: [3], q: 'Alaska and Hawaii were the first states.', tf: false, why: 'False: they were the last, in 1959. Delaware was first, in 1787.' },
    { L: [3], q: 'About the states:', all: [['There are 50 states.', true], ['Delaware was the first.', true], ['Hawaii is made of islands.', true], ['All 50 joined in 1787.', false]], why: '50 states, Delaware first (1787), Alaska and Hawaii last (1959).' }
  ], 'States joined one at a time, from 1787 to 1959.'));

  /* ================================================================ Unit 8: Heroes of Service */
  G('usyoung.clara-barton', fromBank([
    { L: [1, 2, 3], q: 'Clara Barton started…', a: 'the American Red Cross', w: ['the Underground Railroad', 'the first airplane company'], why: 'In 1881 Clara Barton started the American Red Cross.' },
    { L: [1, 2], gen: picQ('redcross', ['flag', 'school', 'bell', 'corn', 'kite'], 'Which picture shows the Red Cross?', 'the Red Cross') },
    { L: [1, 2, 3], q: 'In the Civil War, Clara Barton cared for…', a: 'wounded soldiers', w: ['the President\'s horses', 'ships at sea'], why: 'She brought food, bandages and comfort to wounded soldiers on the battlefields.' },
    { L: [2, 3], q: 'In what year did Clara Barton start the American Red Cross?', a: '1881', w: ['1492', '1776', '1969'], why: 'She started it in 1881, after the Civil War.' },
    { L: [1, 2, 3], q: 'Today the Red Cross helps people…', a: 'after disasters like floods, fires and storms', w: ['build rockets', 'win games'], why: 'Red Cross volunteers bring shelter, food and blankets after disasters.' },
    { L: [1, 2], q: 'A volunteer is a person who…', a: 'helps without being paid', w: ['only helps on birthdays', 'never helps'], why: 'Volunteers help without being paid. Clara Barton did much of her work as a volunteer.', viz: pics(['helping']) },
    { L: [2, 3], q: 'A doctor called Clara Barton an "angel of the…"', a: 'battlefield', w: ['bakery', 'playground'], why: 'She was called the angel of the battlefield, because she brought help right where soldiers needed it.' },
    { L: [2, 3], q: 'Before the war, Clara Barton worked as a…', a: 'teacher', w: ['pilot', 'astronaut'], why: 'Clara Barton began her work as a teacher.' },
    { L: [2, 3], gen: seqQ([['Clara Barton is born', 1821, '1821'], ['The Civil War begins', 1861, '1861'], ['The American Red Cross begins', 1881, '1881'], ['The first airplane flight', 1903, '1903']]) },
    { L: [3], q: 'About Clara Barton:', all: [['She cared for wounded soldiers.', true], ['She started the American Red Cross.', true], ['She was a teacher first.', true], ['She was an astronaut.', false]], why: 'A teacher, then a helper on the battlefields, then the founder of the American Red Cross in 1881.' },
    { L: [3], q: 'Clara Barton lived at the same time as Abraham Lincoln.', tf: true, why: 'True: she cared for soldiers in the Civil War, when Lincoln was President.' },
    { L: [3], q: 'Only people in uniforms can help others.', tf: false, why: 'False: volunteers like Clara Barton have helped all through history.' }
  ], 'Clara Barton cared for soldiers and started the Red Cross.'));

  G('usyoung.rosa-parks-and-mlk', fromBank([
    { L: [1, 2, 3], q: 'What would Rosa Parks not give up?', a: 'her seat on the bus', w: ['her lunch', 'her library book'], why: 'In 1955 Rosa Parks would not give up her bus seat.', viz: pics(['bus']) },
    { L: [1, 2], gen: picQ('bus', ['wagon', 'train', 'rocket', 'ship', 'canoe'], 'Which picture shows a city bus, like the one in Montgomery?', 'the city bus') },
    { L: [1, 2, 3], q: 'In which city did Rosa Parks keep her seat?', a: 'Montgomery, Alabama', w: ['Boston, Massachusetts', 'Plymouth, Massachusetts'], why: 'It happened in Montgomery, Alabama, on December 1, 1955.' },
    { L: [2, 3], q: 'In what year did Rosa Parks keep her seat?', a: '1955', w: ['1776', '1865', '1620'], why: 'It was December 1, 1955.' },
    { L: [1, 2, 3], q: 'In a boycott, people…', a: 'stop using something to protest', w: ['ride the bus more', 'play a ball game'], why: 'People stopped riding the buses to protest the unfair law. They walked or shared rides.' },
    { L: [1, 2, 3], q: 'How did Dr. King lead people?', a: 'with peaceful marches and speeches', w: ['by fighting', 'by staying home'], why: 'Dr. King led peaceful protests for equal treatment.' },
    { L: [2, 3], q: 'Was Rosa Parks just tired that day?', a: 'She said she was tired of giving in.', w: ['Yes, she was only sleepy.'], why: 'She said the only tired she was, was tired of giving in. She had worked for fair treatment for years.' },
    { L: [2, 3], q: 'How long did the Montgomery bus boycott last?', a: 'more than a year', w: ['one hour', 'one day'], why: 'People walked or shared rides for more than a year.' },
    { L: [3], q: 'In 1956 the Supreme Court said the Montgomery bus law…', a: 'was against the Constitution', w: ['must stay forever', 'was about the Moon'], why: 'The Supreme Court agreed the bus law was against the Constitution.' },
    { L: [3], gen: seqQ([['Lincoln becomes President', 1861, '1861'], ['Rosa Parks keeps her seat', 1955, '1955'], ['Dr. King speaks at the March on Washington', 1963, '1963'], ['The first Martin Luther King Jr. Day', 1986, '1986']]) },
    { L: [3], q: 'Rosa Parks had worked for fair treatment for years before 1955.', tf: true, why: 'True: she had worked with others in Montgomery for years.' }
  ], 'Rosa Parks kept her seat; Dr. King led peaceful protests.'));

  G('usyoung.moon-landing', fromBank([
    { L: [1, 2, 3], q: 'Who was the first person to walk on the Moon?', a: 'Neil Armstrong', w: ['Buzz Aldrin', 'Michael Collins', 'Thomas Edison'], why: 'Neil Armstrong stepped out first; Buzz Aldrin came next; Michael Collins flew around the Moon.' },
    { L: [1, 2, 3], q: 'In what year did astronauts first land on the Moon?', a: '1969', w: ['1776', '1903', '1492'], why: 'They landed on July 20, 1969.' },
    { L: [1, 2, 3], q: 'How did the astronauts get to the Moon?', a: 'on a giant rocket', w: ['in an airplane', 'in a hot air balloon'], why: 'Airplanes need air, and space has none. A giant rocket, the Saturn V, carried them.', viz: pics(['rocket']) },
    { L: [1, 2], gen: picQ('rocket', ['plane', 'train', 'bus', 'ship'], 'Which picture shows a rocket?', 'the rocket') },
    { L: [1, 2], gen: picQ('moon', ['globe', 'star', 'rocket', 'bell'], 'Which picture shows a flag on the Moon?', 'the flag on the Moon') },
    { L: [2, 3], q: 'What was the name of the small craft that landed on the Moon?', a: 'the Eagle', w: ['the Mayflower', 'the Santa María'], why: 'Armstrong and Aldrin landed in the Eagle. The Mayflower carried the Pilgrims.' },
    { L: [2, 3], q: 'What was the name of the trip to the Moon in 1969?', a: 'Apollo 11', w: ['Mayflower 1', 'Corps of Discovery'], why: 'The trip was Apollo 11.' },
    { L: [2, 3], q: 'How many astronauts flew on Apollo 11?', a: 'three', w: ['one', 'fifty'], why: 'Three: Armstrong, Aldrin and Collins.' },
    { L: [3], q: 'What was the name of the giant rocket?', a: 'the Saturn V', w: ['the Liberty Bell', 'the Wright Flyer'], why: 'The Saturn V carried Apollo 11 into space.' },
    { L: [3], q: 'Airplanes can fly all the way to the Moon.', tf: false, why: 'False: airplanes need air. The astronauts rode a rocket.' },
    { L: [3], q: 'About Apollo 11:', all: [['It landed on the Moon in 1969.', true], ['Neil Armstrong walked on the Moon first.', true], ['The astronauts came safely home.', true], ['It flew there in an airplane.', false]], why: 'Apollo 11 landed on July 20, 1969; Armstrong stepped out first; all three came home.' }
  ], 'Apollo 11 landed on the Moon in 1969.'));

  var BIG = [['Columbus sails', 1492, '1492', 'columbus'], ['Jamestown is founded', 1607, '1607', 'jamestown'], ['The Pilgrims land', 1620, '1620', 'mayflower'], ['The Declaration of Independence', 1776, '1776', 'declaration'], ['The Constitution is written', 1787, '1787', 'convention'], ['Lewis and Clark set out', 1804, '1804', 'lewisclark'], ['The Civil War begins', 1861, '1861', 'sumter'], ['The telephone', 1876, '1876', 'telephone'], ['The first airplane flight', 1903, '1903', 'wright'], ['The Montgomery bus boycott', 1955, '1955', 'montgomery'], ['The Moon landing', 1969, '1969', 'moon']];
  var PEOPLE = [['George Washington', 1789, 'President in 1789'], ['Abraham Lincoln', 1861, 'President in 1861'], ['Dr. King', 1963, 'his famous speech in 1963'], ['Christopher Columbus', 1492, 'sailed in 1492']];
  G('usyoung.then-and-now', fromBank([
    { L: [1, 2, 3], gen: seqQ(BIG) },
    { L: [2, 3], gen: seqQ(BIG, { last: true }) },
    { L: [1, 2, 3], gen: seqQ(PEOPLE, { q: 'Who lived first?' }) },
    { L: [3], gen: function (R) {
        var pick, t = 0; do { pick = R.sample(BIG, 4); t++; } while (t < 30 && pick.some(function (x, i) { return pick.some(function (y, j) { return i !== j && x[1] === y[1]; }); }));
        var s = pick.slice().sort(function (a, b) { return a[1] - b[1]; }), x = R.pick(s), L = 'ABCD'.charAt(s.indexOf(x));
        return { q: 'The letters are in time order, oldest first. Which letter marks "' + x[0] + '"?', a: L, w: 'ABCD'.split('').filter(function (c) { return c !== L; }), why: 'In order: ' + s.map(function (y, i) { return 'ABCD'.charAt(i) + ' ' + y[0] + ' (' + y[2] + ')'; }).join(', ') + '.', hint: 'Put the four events in order in your head, oldest first.', viz: { name: 'cv-timeline', opts: { events: s.map(function (y) { return y[3]; }), letters: true, quiet: true, interactive: false, big: true } } };
      } },
    { L: [1, 2], q: 'Before the light bulb, people lit the night with…', a: 'candles and lanterns', w: ['flashlights', 'phones'], why: 'People used candles and lanterns. Edison\'s light bulb came in 1879.', viz: pics(['lantern']) },
    { L: [1, 2], q: 'Before the telephone, how did people far away talk to each other?', a: 'They wrote letters.', w: ['They sent text messages.', 'They made video calls.'], why: 'People wrote letters. The telephone came in 1876.' },
    { L: [1, 2], q: 'Long ago, before cars and airplanes, people traveled by…', a: 'wagon, horse and sailing ship', w: ['rocket', 'jet airplane'], why: 'Wagons, horses and sailing ships came long before cars and airplanes.', viz: pics(['wagon', 'ship']) },
    { L: [2, 3], q: 'Did Washington, Lincoln and Dr. King live at the same time?', a: 'No. They lived far apart in time.', w: ['Yes. They were all friends.'], why: 'Washington became President in 1789, Lincoln in 1861, and Dr. King spoke in 1963.' },
    { L: [3], q: 'On a time line, a bigger year came later.', tf: true, why: 'True: 1969 came after 1776, because 1969 is the bigger number.' }
  ], 'A bigger year came later.'));
})(window.MathLadder);
