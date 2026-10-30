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
  var TABS = [{"k":"usyoung.the-flag#x","x":[{"q":"How many red and white stripes does our flag have in all?","a":"13","w":["50","7","6"],"s":["There are 13 stripes: 7 red and 6 white."]},{"q":"How many of the flag's stripes are red?","a":"7","w":["6","13","50"],"s":["7 red and 6 white make 13 stripes."]},{"q":"How many of the flag's stripes are white?","a":"6","w":["7","13","50"],"s":["6 white and 7 red make 13 stripes."]},{"q":"What color is the square behind the stars?","a":"blue","w":["red","green","yellow"],"s":["The white stars are on a blue square."]},{"q":"What color are the stars on our flag?","a":"white","w":["red","blue","gold"],"s":["Our flag has 50 white stars."]},{"lv":2,"q":"Flag Day is June 14. What happened on that day in 1777?","a":"Congress chose the first flag","w":["The first President was chosen","Alaska became a state","The Liberty Bell cracked"],"s":["On June 14, 1777, Congress chose the first flag."]},{"lv":2,"q":"When a new state joined the country, what was added to the flag?","a":"a star","w":["a stripe","a new color","a picture of the state"],"s":["Each state has a star. The stripes stayed 13."]},{"lv":3,"tf":false,"q":"Our flag has 50 stripes, one for each state.","s":["False: the flag has 13 stripes for the first 13 colonies.","The 50 stars are for the states."]}]},
    {"k":"usyoung.bald-eagle#x","x":[{"q":"What color is a grown bald eagle's body?","a":"brown","w":["white","green","red"],"s":["A grown bald eagle has a white head and a brown body."]},{"q":"What does the bald eagle catch to eat?","a":"fish","w":["pizza","leaves","ice cream"],"s":["Bald eagles live near lakes, rivers and coasts, where they catch fish."]},{"q":"Where do bald eagles like to live?","a":"near lakes, rivers and coasts","w":["in the middle of the ocean","under the ground","only in cities"],"s":["They live near water, where they catch fish."]},{"q":"Is the bald eagle a big bird or a tiny bird?","a":"a big bird","w":["a tiny bird"],"s":["The bald eagle is a big bird with large wings."]},{"lv":2,"q":"On the Great Seal, what does the eagle hold in its feet?","a":"an olive branch and arrows","w":["a flag and a drum","a bell and a book","nothing at all"],"s":["The eagle holds an olive branch in one foot and arrows in the other."]},{"lv":2,"q":"Where can you see the Great Seal with its eagle?","a":"on the back of a one-dollar bill","w":["on a cereal box","on the moon","on every car"],"s":["The Great Seal is on the back of a one-dollar bill."]},{"lv":2,"q":"Long ago, the word \"bald\" could mean…","a":"white-headed","w":["without feathers","very fast","very old"],"s":["Long ago, \"bald\" could mean \"white-headed.\""]},{"lv":3,"tf":true,"q":"The bald eagle lives only in North America.","s":["True: bald eagles live only in North America."]}]},
    {"k":"usyoung.liberty-bell#x","x":[{"q":"In what year was the Liberty Bell made?","a":"1753","w":["1953","2001","1492"],"s":["The bell was made in 1753."]},{"q":"Is the Liberty Bell new or very old?","a":"very old","w":["brand new"],"s":["The Liberty Bell was made in 1753, a very long time ago."]},{"q":"Why is the Liberty Bell not rung anymore?","a":"It has a crack","w":["It is too small","It has no top","It is made of paper"],"s":["The bell cracked long ago, so it is not rung."]},{"q":"What does \"proclaim liberty\" mean?","a":"tell everyone about freedom","w":["ring a bell at lunch","build a new house","sing a lullaby"],"s":["To proclaim liberty is to tell everyone about freedom."]},{"lv":2,"q":"Who named it the Liberty Bell?","a":"people who worked to end slavery","w":["the king of England","Christopher Columbus","the first Pilgrims"],"s":["People who worked to end slavery named it the Liberty Bell.","It became a symbol of freedom for everyone."]},{"lv":2,"q":"The bell was made for a building where leaders later signed which paper?","a":"the Declaration of Independence","w":["a birthday card","the Mayflower Compact","a grocery list"],"s":["Leaders signed the Declaration of Independence in that building, years later."]},{"lv":3,"tf":false,"q":"The Liberty Bell is in Washington, D.C.","s":["False: the Liberty Bell is in Philadelphia."]}]},
    {"k":"usyoung.star-spangled-banner#x","x":[{"q":"What does the word \"banner\" mean?","a":"flag","w":["song","boat","fort"],"s":["\"Banner\" means flag."]},{"q":"In what year did Francis Scott Key write the words?","a":"1814","w":["1492","2014","1776"],"s":["Key wrote the words in 1814."]},{"q":"In which city was Fort McHenry?","a":"Baltimore","w":["Philadelphia","Los Angeles","Plymouth"],"s":["Fort McHenry is in Baltimore."]},{"q":"Where was Francis Scott Key when he watched the battle?","a":"on a ship","w":["on a train","in an airplane","in a school"],"s":["Key watched the battle from a ship."]},{"lv":2,"q":"In what year did Congress make \"The Star-Spangled Banner\" our national anthem?","a":"1931","w":["1814","1776","1620"],"s":["It became the national anthem in 1931, more than 100 years after Key wrote it."]},{"lv":2,"q":"Who were the United States fighting in 1814?","a":"Britain","w":["France","Canada","Mexico"],"s":["In 1814 the United States and Britain were at war."]},{"lv":2,"q":"Where is the flag that Key saw kept today?","a":"at the Smithsonian in Washington, D.C.","w":["in a closet in Baltimore","on the moon","at the North Pole"],"s":["The flag Key saw is kept at the Smithsonian."]},{"lv":3,"tf":false,"q":"Key's words first began as a song, not a poem.","s":["False: Key wrote a poem.","The poem became a song."]}]},
    {"k":"usyoung.washington-dc#x","x":[{"q":"Which building has the big dome?","a":"the Capitol","w":["the White House","the Liberty Bell","a log cabin"],"s":["The Capitol has the big dome. Congress meets there."]},{"q":"Who meets in the Capitol?","a":"Congress","w":["the President's pets","the Pilgrims","school children"],"s":["Congress meets in the Capitol."]},{"q":"Washington, D.C., is named after whom?","a":"George Washington","w":["Abraham Lincoln","Christopher Columbus","Martin Luther King Jr."],"s":["The city is named after George Washington, our first President."]},{"q":"What does \"D.C.\" stand for?","a":"District of Columbia","w":["Dog and Cat","Down Center","Dear Country"],"s":["D.C. stands for District of Columbia."]},{"lv":2,"q":"Is Washington, D.C., part of a state?","a":"No: it belongs to the whole country","w":["Yes: it is in the state of Washington","Yes: it is in California","Yes: it is in Texas"],"s":["D.C. is not part of any state.","It belongs to the whole country."]},{"lv":2,"q":"On which coast is Washington, D.C.?","a":"the East Coast","w":["the West Coast","the Gulf Coast only","the Pacific coast"],"s":["The capital is on the East Coast.","The state of Washington is on the West Coast."]},{"lv":2,"q":"The capital is full of monuments. What do monuments do?","a":"honor great Americans","w":["sell toys","grow food","carry mail"],"s":["Monuments honor great Americans."]},{"lv":3,"tf":false,"q":"Washington, D.C., and the state of Washington are the same place.","s":["False: they are two different places, far apart."]}]},
    {"k":"usyoung.thanksgiving-day#x","x":[{"q":"On which day of the week is Thanksgiving?","a":"Thursday","w":["Monday","Saturday","Sunday"],"s":["Thanksgiving is on the fourth Thursday in November."]},{"q":"In which month is Thanksgiving?","a":"November","w":["July","February","May"],"s":["Thanksgiving comes in November."]},{"q":"What do families do on Thanksgiving?","a":"share a meal and give thanks","w":["go to school","open birthday presents","shovel snow off the beach"],"s":["Families and friends share a meal and give thanks."]},{"q":"Who shared the harvest feast of 1621 with the Pilgrims?","a":"the Wampanoag","w":["the Vikings","the Romans","the Egyptians"],"s":["The Pilgrims and the Wampanoag feasted together in 1621."]},{"lv":2,"q":"How many days did the 1621 harvest feast last?","a":"three days","w":["one hour","one year","ten days"],"s":["They feasted together for three days."]},{"lv":2,"q":"The Wampanoag helped the Pilgrims learn to grow which food?","a":"corn","w":["rice","bananas","coffee"],"s":["The Wampanoag helped them learn to grow corn."]},{"lv":2,"q":"Which President asked the whole country to keep a day of thanks, in 1863?","a":"Abraham Lincoln","w":["George Washington","Christopher Columbus","Francis Scott Key"],"s":["In 1863 Lincoln called for a national day of Thanksgiving."]},{"lv":3,"tf":false,"q":"The Pilgrims held Thanksgiving as a national holiday every year from 1621 on.","s":["False: 1621 was a harvest feast.","The national holiday began in 1863."]}]},
    {"k":"usyoung.presidents-day#x","x":[{"q":"Who was our first President?","a":"George Washington","w":["Abraham Lincoln","Francis Scott Key","Christopher Columbus"],"s":["George Washington was our first President."]},{"q":"In which month is Presidents' Day?","a":"February","w":["July","October","December"],"s":["It is the third Monday in February."]},{"q":"On which day of the week is Presidents' Day?","a":"Monday","w":["Friday","Wednesday","Sunday"],"s":["It is always on a Monday: the third Monday in February."]},{"q":"What is the holiday's official name?","a":"Washington's Birthday","w":["Lincoln's Day","Flag Day","Snow Day"],"s":["The official name is Washington's Birthday."]},{"lv":2,"q":"On what date was George Washington born?","a":"February 22","w":["February 12","July 4","January 1"],"s":["Washington was born on February 22, 1732."]},{"lv":2,"q":"Which other President was born in February, on February 12?","a":"Abraham Lincoln","w":["George Washington","Martin Luther King Jr.","Christopher Columbus"],"s":["Lincoln was born on February 12, so many people honor both."]},{"lv":2,"f":"thirdMonday"},{"lv":3,"tf":false,"q":"Presidents' Day is always on February 22.","s":["False: it is the third Monday in February.","That always lands between February 15 and 21."]}]},
    {"k":"usyoung.mlk-day#x","x":[{"q":"In which month is Martin Luther King Jr. Day?","a":"January","w":["July","June","October"],"s":["It is the third Monday in January."]},{"q":"How did Dr. King work for fair treatment?","a":"by peaceful means, with speeches and marches","w":["by fighting","by hiding","by doing nothing"],"s":["Dr. King gave speeches and led marches without fighting."]},{"q":"Dr. King said people should be judged by…","a":"who they are inside","w":["how tall they are","what car they drive","what they eat for lunch"],"s":["He said people should be judged by who they are inside."]},{"q":"What was Dr. King's job?","a":"a minister and a leader","w":["an astronaut","a pilot","a sailor"],"s":["Dr. King was a minister and a leader."]},{"lv":2,"q":"In what year was Dr. King born?","a":"1929","w":["1809","1732","1492"],"s":["Dr. King was born in 1929."]},{"lv":2,"q":"Many families spend Martin Luther King Jr. Day as a…","a":"day of service, helping others","w":["day of sleeping late","day of shopping only","day with no talking"],"s":["Many families help others on this day."]},{"lv":2,"q":"In what year was the holiday first kept across the country?","a":"1986","w":["1776","1865","1929"],"s":["It was first kept across the country in 1986."]},{"lv":3,"tf":false,"q":"Dr. King worked alone.","s":["False: he was one of many, many people who worked together for fair treatment."]}]},
    {"k":"usyoung.juneteenth-and-more#x","x":[{"q":"What does Juneteenth remember?","a":"the end of slavery","w":["the first flag","the first Thanksgiving","the moon landing"],"s":["Juneteenth (June 19) remembers the end of slavery."]},{"q":"What does Labor Day honor?","a":"workers","w":["pets","the Pilgrims","birthdays"],"s":["Labor Day honors workers."]},{"q":"On what date is Juneteenth?","a":"June 19","w":["July 4","December 25","January 1"],"s":["Juneteenth is June 19."]},{"q":"When is Labor Day?","a":"the first Monday in September","w":["the fourth Thursday in November","June 19","July 4"],"s":["Labor Day is the first Monday in September."]},{"q":"How many national holidays does our country have?","a":"eleven","w":["two","fifty","one hundred"],"s":["Our country has eleven national holidays."]},{"lv":2,"q":"On June 19, 1865, where did soldiers bring the news of freedom?","a":"Galveston, Texas","w":["Boston, Massachusetts","Plymouth","Alaska"],"s":["Soldiers brought the news to Galveston, Texas."]},{"lv":2,"q":"In what year did Labor Day become a national holiday?","a":"1894","w":["1776","1620","1492"],"s":["Labor Day became a national holiday in 1894."]},{"lv":2,"q":"Which of these is one of our national holidays?","a":"Veterans Day","w":["Pizza Day","Pajama Day","Kite Day"],"s":["Veterans Day is one of the eleven national holidays."]},{"lv":3,"tf":false,"q":"Every holiday remembers the same thing.","s":["False: each holiday has its own reason.","Ask: \"What does this day remember?\""]}]},
    {"k":"usyoung.native-homes#x","x":[{"q":"What could be packed up and moved?","a":"a tipi","w":["a longhouse","a pueblo","a plank house"],"s":["A tipi could be packed up and moved."]},{"q":"What were tipis made of?","a":"poles and buffalo hides","w":["bricks and glass","ice and snow","paper and glue"],"s":["Tipis were made of poles and buffalo hides."]},{"q":"Who built long longhouses of wood and bark?","a":"the Haudenosaunee","w":["the Pilgrims","the Vikings","the Pueblo peoples"],"s":["The Haudenosaunee built longhouses.","Many families lived together in one."]},{"q":"What is adobe?","a":"mud bricks dried in the sun","w":["a kind of tree","a boat","a kind of fur"],"s":["Pueblo peoples built homes of adobe, mud bricks dried in the sun."]},{"lv":2,"q":"Which peoples built homes of adobe with ladders to the upper floors?","a":"Pueblo peoples in the dry Southwest","w":["peoples of the Great Plains","peoples by the Pacific","the Pilgrims"],"s":["In the dry Southwest, Pueblo peoples built adobe homes."]},{"lv":2,"q":"By the Pacific, what did nations build big plank houses from?","a":"cedar wood","w":["adobe","buffalo hides","snow"],"s":["Nations by the Pacific built big plank houses of cedar."]},{"lv":2,"q":"What did peoples such as the Wampanoag build in the eastern woods?","a":"round wigwams of bent poles and bark","w":["tall stone towers","adobe pueblos","igloos"],"s":["In the eastern woods, peoples such as the Wampanoag made wigwams."]},{"lv":3,"tf":false,"q":"Every Native family lived in a tipi.","s":["False: tipis were homes for peoples who moved across the Great Plains.","Most other nations built homes that stayed in one place."]}]},
    {"k":"usyoung.explorers#x","x":[{"q":"What is an explorer?","a":"a person who travels to learn about new places","w":["a person who bakes bread","a person who stays home","a person who fixes cars"],"s":["An explorer travels to learn about places new to them."]},{"q":"In what year did Christopher Columbus sail?","a":"1492","w":["1620","1776","2000"],"s":["Columbus sailed in 1492."]},{"q":"Who reached North America about the year 1000?","a":"Leif Erikson","w":["Christopher Columbus","George Washington","Abraham Lincoln"],"s":["Leif Erikson reached North America about the year 1000."]},{"q":"Which ocean did explorers from Europe sail across?","a":"the Atlantic Ocean","w":["the Pacific Ocean","the Arctic Ocean","no ocean at all"],"s":["They sailed across the big Atlantic Ocean."]},{"lv":2,"q":"Which of these was one of Columbus's three ships?","a":"the Santa María","w":["the Mayflower","the Titanic","the Liberty"],"s":["His ships were the Niña, the Pinta and the Santa María."]},{"lv":2,"q":"Who sent Columbus on his trip?","a":"the king and queen of Spain","w":["the king of England","the people of France","the Pilgrims"],"s":["Columbus sailed for the king and queen of Spain."]},{"lv":2,"q":"What was Columbus looking for?","a":"a new way to Asia","w":["the North Pole","gold in California","the Moon"],"s":["He was looking for a new way to Asia.","He reached islands in the Caribbean Sea."]},{"lv":3,"tf":false,"q":"No one lived in the Americas before Columbus came.","s":["False: millions of people already lived here: the first peoples."]}]},
    {"k":"usyoung.pilgrims#x","x":[{"q":"What was the name of the Pilgrims' ship?","a":"the Mayflower","w":["the Santa María","the Titanic","the Niña"],"s":["The Pilgrims crossed the ocean on the Mayflower."]},{"q":"From which country did the Mayflower sail?","a":"England","w":["Spain","France","Mexico"],"s":["The Mayflower left England in 1620."]},{"q":"In what year did the Mayflower cross the ocean?","a":"1620","w":["1492","1776","1865"],"s":["The Mayflower crossed in 1620."]},{"q":"Why did the Pilgrims come?","a":"to worship God in their own way","w":["to find gold","to see the Grand Canyon","to go to school"],"s":["The Pilgrims came mainly for their religion."]},{"lv":2,"q":"What colony did the Pilgrims found?","a":"Plymouth Colony","w":["Jamestown","New York","Georgia"],"s":["The Pilgrims founded Plymouth Colony."]},{"lv":2,"q":"What did the men on the ship sign before going ashore?","a":"the Mayflower Compact","w":["the Declaration of Independence","a birthday card","the Constitution"],"s":["The Mayflower Compact was a promise to make fair laws and obey them."]},{"lv":2,"q":"About how many people were on the Mayflower?","a":"about 100","w":["about 10","about 1,000","about 5"],"s":["About 100 people were on board: 102 passengers."]},{"lv":3,"tf":true,"q":"The Pilgrims' first winter was very hard, and about half of them died.","s":["True: their first winter was very hard."]}]},
    {"k":"usyoung.thirteen-colonies#x","x":[{"q":"What is a colony?","a":"a place ruled by a faraway country","w":["a kind of boat","a big party","a type of tree"],"s":["A colony is a place ruled by a faraway country."]},{"q":"How many English colonies were there along the Atlantic coast by 1732?","a":"thirteen","w":["fifty","three","one hundred"],"s":["By 1732 there were thirteen English colonies."]},{"q":"Which was the last of the thirteen colonies?","a":"Georgia","w":["Virginia","Massachusetts","New York"],"s":["Georgia was the last of the thirteen."]},{"q":"What did the thirteen colonies later become?","a":"the first thirteen states","w":["islands","mountains","countries in Europe"],"s":["The thirteen colonies became the first thirteen states."]},{"lv":2,"q":"Which group of colonies had rocky soil, fishing and shipbuilding?","a":"New England","w":["the Middle colonies","the Southern colonies"],"s":["New England, in the north, had rocky soil, fishing and shipbuilding."]},{"lv":2,"q":"Which group of colonies had warm weather and big farms?","a":"the Southern colonies","w":["New England","the Middle colonies"],"s":["The Southern colonies had warm weather and big farms."]},{"lv":2,"q":"Which group of colonies grew wheat and had busy port cities?","a":"the Middle colonies","w":["New England","the Southern colonies"],"s":["The Middle colonies grew wheat and had busy ports."]},{"lv":2,"q":"Which of these was one of the thirteen colonies?","a":"Pennsylvania","w":["Texas","California","Alaska"],"s":["Pennsylvania was one of the thirteen."]},{"lv":3,"tf":false,"q":"The thirteen colonies covered the whole country.","s":["False: they were a narrow strip along the ocean."]}]},
    {"k":"usyoung.first-peoples#x","x":[{"q":"Who lived in America long before there was a United States?","a":"the first peoples, Native Americans","w":["the Pilgrims","the Vikings","nobody"],"s":["Native Americans lived here for thousands of years."]},{"q":"Were there many Native nations, or just one?","a":"many: hundreds of nations","w":["just one"],"s":["There were hundreds of nations, each with its own language and leaders."]},{"q":"People on the plains followed which animal?","a":"the bison","w":["the penguin","the camel","the kangaroo"],"s":["People on the plains followed the bison."]},{"lv":2,"q":"Which of these is a Native nation?","a":"the Cherokee","w":["the Pilgrims","the Romans","the Vikings"],"s":["The Cherokee, the Lakota and the Navajo are Native nations."]},{"lv":2,"q":"What was Cahokia, near today's St. Louis?","a":"the largest Native city north of Mexico","w":["a ship","a fort","a kind of food"],"s":["Cahokia was at its height about 1100."]},{"lv":3,"tf":true,"q":"Native nations are still here today.","s":["True: Native nations are still here today."]}]},
    {"k":"usyoung.three-sisters#x","x":[{"q":"Which plants are the Three Sisters?","a":"corn, beans and squash","w":["apples, pears and plums","rice, wheat and oats","roses, tulips and daisies"],"s":["The Three Sisters are corn, beans and squash."]},{"q":"Which sister grows tall like a pole?","a":"corn","w":["beans","squash"],"s":["The corn grows tall and straight."]},{"q":"Which sister climbs up the corn stalk?","a":"beans","w":["corn","squash"],"s":["The beans climb up the corn."]},{"q":"Which sister spreads big leaves over the ground?","a":"squash","w":["corn","beans"],"s":["Squash leaves shade the soil and keep weeds away."]},{"lv":2,"q":"Which of these foods was first grown in the Americas?","a":"tomatoes","w":["wheat","rice","apples"],"s":["Corn, potatoes, tomatoes, pumpkins and peppers were first grown in the Americas."]},{"lv":2,"q":"Which nation calls corn, beans and squash the Three Sisters?","a":"the Haudenosaunee","w":["the Pilgrims","the Vikings","the Spanish"],"s":["The Haudenosaunee call them the Three Sisters."]},{"lv":3,"tf":false,"q":"Native peoples only hunted and never farmed.","s":["False: many nations were skilled farmers."]}]},
    {"k":"usyoung.pioneers#x","x":[{"q":"What pulled the pioneers' covered wagons?","a":"oxen","w":["cars","trains","elephants"],"s":["Oxen pulled the wagons slowly, mile after mile."]},{"q":"Which trail did thousands of pioneers take in the 1840s?","a":"the Oregon Trail","w":["the Silk Road","the Mayflower Trail","the Moon Trail"],"s":["In the 1840s, thousands set out on the Oregon Trail."]},{"q":"How long did the trip west take?","a":"five or six months","w":["one day","one week","ten years"],"s":["The trip took five or six months."]},{"q":"Did most pioneers ride in the wagon or walk beside it?","a":"walk beside it","w":["ride in it the whole way"],"s":["The wagon was packed full.","Most pioneers walked beside it."]},{"lv":2,"q":"In what year did a railroad make the trip west much faster?","a":"1869","w":["1492","1620","1776"],"s":["In 1869 a railroad made the trip much faster."]},{"lv":2,"q":"What did pioneers do with their wagons at night?","a":"circled the wagons","w":["sold them","painted them","left them behind"],"s":["At night they circled the wagons and cooked over a fire."]},{"lv":2,"q":"Later, people rushed to California to look for…","a":"gold","w":["snow","penguins","oil paint"],"s":["People rushed to California to look for gold."]},{"lv":3,"tf":true,"q":"Children on the trail walked too, and helped with chores.","s":["True: children walked and helped with chores."]}]},
    {"k":"usyoung.slavery-and-freedom#x","x":[{"q":"In what year did slavery in the United States end?","a":"1865","w":["1492","1620","1776"],"s":["Slavery in the United States ended in 1865."]},{"q":"Were enslaved people paid for their work?","a":"No, they were forced to work without pay","w":["Yes, they were paid well"],"s":["Enslaved people were forced to work without pay."]},{"q":"From which continent were people taken and brought across the ocean?","a":"Africa","w":["Europe","Australia","Antarctica"],"s":["People were taken from their homes in Africa."]},{"lv":2,"q":"Which amendment ended slavery in the United States?","a":"the Thirteenth Amendment","w":["the First Amendment","the Nineteenth Amendment","the Tenth Amendment"],"s":["The Thirteenth Amendment (1865) ended slavery."]},{"lv":2,"q":"For about how long did slavery last in America?","a":"more than 200 years","w":["about 2 years","about 20 years","one summer"],"s":["It lasted more than 200 years."]},{"lv":2,"q":"What did enslaved people keep as best they could?","a":"their families, songs and faith","w":["their own land","their pay","their freedom"],"s":["Enslaved people kept their families, songs and faith as best they could."]},{"lv":3,"tf":false,"q":"Slavery ended as soon as people said it was wrong.","s":["False: it took a long struggle and the Civil War."]}]},
    {"k":"usyoung.abraham-lincoln#x","x":[{"q":"Where was Abraham Lincoln born?","a":"in a small log cabin in Kentucky","w":["in a castle in England","in the White House","on a ship"],"s":["Lincoln was born in 1809 in a log cabin in Kentucky."]},{"q":"What did people call Lincoln?","a":"\"Honest Abe\"","w":["\"Big George\"","\"Captain Abe\"","\"Silly Sam\""],"s":["People called him \"Honest Abe.\""]},{"q":"Which President was Lincoln?","a":"the 16th","w":["the 1st","the 50th","the 2nd"],"s":["Lincoln was the 16th President."]},{"q":"Whose face is on the five-dollar bill?","a":"Abraham Lincoln","w":["George Washington","Clara Barton","Francis Scott Key"],"s":["Lincoln's face is on the five-dollar bill."]},{"lv":2,"q":"What did Lincoln sign in 1863?","a":"the Emancipation Proclamation","w":["the Mayflower Compact","the Declaration of Independence","a pizza order"],"s":["It said enslaved people in the rebelling states were free."]},{"lv":2,"q":"Where did Lincoln give a short, famous speech in 1863?","a":"Gettysburg","w":["Plymouth","Philadelphia","Galveston"],"s":["Lincoln spoke at Gettysburg in 1863."]},{"lv":2,"q":"What job did Lincoln have before he was President?","a":"a lawyer","w":["a pilot","an astronaut","a sailor"],"s":["Lincoln grew up to be a lawyer."]},{"lv":3,"tf":false,"q":"Lincoln and Washington were Presidents at the same time.","s":["False: Washington was 1st (1789); Lincoln was 16th (1861), more than 70 years later."]}]},
    {"k":"usyoung.fifty-states#x","x":[{"q":"How many states are there today?","a":"50","w":["13","100","48"],"s":["Today there are 50 states."]},{"q":"Which was the first state?","a":"Delaware","w":["Hawaii","Alaska","California"],"s":["Delaware was first, in 1787."]},{"q":"Which is the largest state?","a":"Alaska","w":["Delaware","Rhode Island","Hawaii"],"s":["Alaska is the largest state."]},{"q":"Which state is made of islands in the Pacific Ocean?","a":"Hawaii","w":["Alaska","Texas","Delaware"],"s":["Hawaii is made of islands in the Pacific Ocean."]},{"lv":2,"q":"What is the capital of Texas?","a":"Austin","w":["Sacramento","Boston","Galveston"],"s":["Texas's capital is Austin."]},{"lv":2,"q":"What is the capital of California?","a":"Sacramento","w":["Austin","Los Angeles","Philadelphia"],"s":["California's capital is Sacramento."]},{"lv":2,"q":"In what year did Alaska and Hawaii join?","a":"1959","w":["1787","1492","1620"],"s":["Alaska and Hawaii joined in 1959."]},{"lv":3,"tf":false,"q":"All 50 states joined at the same time.","s":["False: states joined one at a time, from 1787 to 1959."]}]},
    {"k":"usyoung.clara-barton#x","x":[{"q":"What did Clara Barton start in 1881?","a":"the American Red Cross","w":["the first school","a toy store","the Liberty Bell"],"s":["Clara Barton started the American Red Cross in 1881."]},{"q":"Whom did Clara Barton care for in the Civil War?","a":"wounded soldiers","w":["zoo animals","kings and queens","astronauts"],"s":["She cared for wounded soldiers."]},{"q":"What was Clara Barton's first job?","a":"teacher","w":["pilot","sailor","farmer"],"s":["She began her work as a teacher."]},{"q":"A doctor called Clara Barton an \"angel of the…\"","a":"battlefield","w":["kitchen","playground","ocean"],"s":["A doctor called her an \"angel of the battlefield.\""]},{"lv":2,"q":"What is a volunteer?","a":"a person who helps without being paid","w":["a person who only plays","a soldier in a battle","a person who sells things"],"s":["Volunteers help without being paid."]},{"lv":2,"q":"What do Red Cross volunteers bring after a flood or storm?","a":"shelter, food and blankets","w":["toys and candy only","nothing","homework"],"s":["Red Cross volunteers bring shelter, food and blankets."]},{"lv":2,"q":"In which state was Clara Barton born?","a":"Massachusetts","w":["Texas","Hawaii","Alaska"],"s":["Clara Barton was born in Massachusetts in 1821."]},{"lv":3,"tf":true,"q":"After the war, Clara Barton helped families find missing soldiers.","s":["True: she helped families find soldiers who were missing."]}]},
    {"k":"usyoung.rosa-parks-and-mlk#x","x":[{"q":"What would Rosa Parks not give up on December 1, 1955?","a":"her bus seat","w":["her lunch","her book","her hat"],"s":["Rosa Parks would not give up her bus seat."]},{"q":"In which city did Rosa Parks keep her seat?","a":"Montgomery, Alabama","w":["Boston, Massachusetts","Plymouth","Philadelphia"],"s":["It happened in Montgomery, Alabama."]},{"q":"What is a boycott?","a":"when people stop using something to protest","w":["a kind of boat","a bus driver","a holiday"],"s":["People stopped riding the buses to protest. That is a boycott."]},{"lv":2,"q":"For how long did people stop riding the buses?","a":"more than a year","w":["one hour","one day","one week"],"s":["They walked or shared rides for more than a year."]},{"lv":2,"q":"In 1956, what did the Supreme Court say about the bus law?","a":"It was unfair and against the Constitution","w":["It was a good law","It did not matter","It should be longer"],"s":["In 1956 the Supreme Court said the bus law was against the Constitution."]},{"lv":2,"q":"In 1963, where did Dr. King speak to about 250,000 people?","a":"at the Lincoln Memorial","w":["at the Liberty Bell","in Plymouth","on a ship"],"s":["He spoke at the March on Washington, at the Lincoln Memorial."]},{"lv":3,"tf":false,"q":"Rosa Parks kept her seat only because she was tired.","s":["False: she said she was tired of giving in.","She had worked for fair treatment for years."]}]},
    {"k":"usyoung.then-and-now#x","x":[{"q":"Long ago, what did people use to light the night?","a":"candles and lanterns","w":["light bulbs","phones","TVs"],"s":["Long ago people used candles and lanterns. Now we have light bulbs."]},{"q":"Long ago, how did people travel?","a":"by wagon and sailing ship","w":["by airplane","by car","by rocket"],"s":["People traveled by wagon and sailing ship."]},{"q":"Long ago, how did people talk to someone far away?","a":"they wrote letters","w":["they used a phone","they sent a text","they made a video call"],"s":["People wrote letters. Now we can call on a phone."]},{"f":"order2"},{"lv":2,"f":"order2"},{"lv":3,"tf":false,"q":"Washington, Lincoln and Dr. King all lived at the same time.","s":["False: they lived far apart.","Washington and Dr. King lived almost 200 years apart."]}]}];
  var FUNS = {
    __wrap: function (p, L) { // the course's read-aloud style: big type, two choices at level 1, three above
      var READ = '<p class="cv-readme"><b>Read to me</b> Read the question and the choices aloud.</p>';
      p.q = READ + '<span class="cv-big">' + p.q + (p.a.t === 'tf' ? ' True or false?' : '') + '</span>';
      if (p.a.t === 'mc') { var n = L === 1 ? 2 : 3; p.a.choices = p.a.choices.slice(0, n); p.a.keep = false; }
      if (p.a.t === 'num') { p.a = { t: 'mc', choices: [String(p.a.v)].concat((p.wr || []).slice(0, L === 1 ? 1 : 2)), v: 0 }; }
      return p;
    },
    thirdMonday: function (R) { // the third Monday of February falls on the 15th to the 21st
      var first = R.int(1, 7), third = first + 14;
      return { q: 'This year, the first Monday in February is February ' + first + '. On what date is Presidents\' Day, the third Monday?', a: 'February ' + third, w: ['February ' + (first + 7), 'February 22', 'February ' + (first + 21)].filter(function (x, i, all) { return x !== 'February ' + third && all.indexOf(x) === i; }),
        s: ['Mondays come every 7 days: February ' + first + ', ' + (first + 7) + ', ' + third + '.', 'The third Monday is February ' + third + '.'] };
    },
    order2: function (R) { // which came first (years from the course's lessons)
      var E = [['the Pilgrims sailed on the Mayflower', 1620], ['Columbus sailed', 1492], ['Francis Scott Key wrote the words of our anthem', 1814], ['the Liberty Bell was made', 1753], ['Lincoln signed the Emancipation Proclamation', 1863], ['Alaska and Hawaii became states', 1959], ['Clara Barton started the American Red Cross', 1881], ['Rosa Parks kept her bus seat', 1955], ['Congress chose the first flag', 1777]];
      var two = R.sample(E, 2); if (two[0][1] === two[1][1]) return null;
      var first = two[0][1] < two[1][1] ? two[0] : two[1], other = first === two[0] ? two[1] : two[0];
      return { q: 'Which came first: ' + two[0][0] + ' (' + two[0][1] + '), or ' + two[1][0] + ' (' + two[1][1] + ')?', a: first[0].charAt(0).toUpperCase() + first[0].slice(1), w: [other[0].charAt(0).toUpperCase() + other[0].slice(1)],
        s: [first[1] + ' is a smaller number than ' + other[1] + ', so it came first.'] };
    }
  };
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
  var CFG = {"prefix":"usyoung.","only":["the-flag","bald-eagle","liberty-bell","statue-of-liberty","star-spangled-banner","washington-dc","why-rules","rules-and-laws","community-helpers","leaders-and-voting","good-citizens","independence-day","thanksgiving-day","presidents-day","mlk-day","memorial-veterans-day","juneteenth-and-more","holiday-calendar","first-peoples","native-homes","three-sisters","native-nations-today","explorers","jamestown","pilgrims","harvest-1621","thirteen-colonies","why-break-away","declaration-young","george-washington","revolution-heroes","constitution-young","three-branches-young","lewis-and-clark","pioneers","slavery-and-freedom","freedom-heroes","abraham-lincoln","inventors","fifty-states","clara-barton","rosa-parks-and-mlk","moon-landing","then-and-now"]};
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
