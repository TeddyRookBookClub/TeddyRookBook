/* Composition (Writing & Grammar Ladder, course key comp): problem generators for all 43 topics.
   Source parts: /tmp/work_comp/gen/*.js, joined by /tmp/work_comp/build_gen.sh into static/writing/gen/comp.js (edit the parts).
   Conventions (/tmp/work_writing/overview.md): answers are choices (mc; keep: true when the order of the choices matters, as for
   numbered sentences, Yes/No and fixed category lists), level 1 a plain case with two or three choices, level 2 distractors from
   the topic's trouble note, level 3 the same idea in a harder shape (a passage, a numbered sentence, select all, an order).
   Every sentence, paragraph and source here is original; the sources are invented for practice (the kit's SOURCES and the
   EXTRA_SOURCES below) and the problems say so. Citations come from the kit's cite() (MLA 9, APA 7, Chicago 18), so the
   pictures and the answers agree. Argument topics are everyday and non-partisan; problems judge reasoning, not sides. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  // every generator's steps and hint are tidied: no “… .”. or “… .”, doubled marks after a quoted sentence
  function tidy(t) { return String(t).replace(/([.?!])”[.,]/g, '$1”'); }
  function G(id, fn) { ML.gen(id, function (R, ctx) { var p = fn(R, ctx); p.steps = p.steps.map(tidy); if (p.hint) p.hint = tidy(p.hint); return p; }); }
  function W() { return ML.writing; } // the kit's model (loaded on every Writing page and by check-gen)

  /* ---------------------------------------------------------------- shared helpers */
  function para(s) { return '<p>' + s + '</p>'; }
  function q(lines) { return lines.filter(Boolean).join(''); }
  // a passage or sentence to judge, set off with a slate rule (readable in both themes)
  function quote(s) { return '<p style="margin:.45rem 0;padding:.3rem .8rem;border-left:4px solid #8fa3b3;font-size:1.06em;line-height:1.55">' + s + '</p>'; }
  function cq(s) { return '“' + s + '”'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function low(s) { s = String(s); return s.charAt(0).toLowerCase() + s.slice(1); }
  // multiple choice: right first, then the wrong ones (shuffled at display)
  function mc(right, wrong) { return { t: 'mc', choices: [right].concat(wrong), v: 0 }; }
  // multiple choice in a fixed order (numbers, category lists, Yes/No)
  function mcK(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  // select all that apply: rights and wrongs, shuffled here so the right ones are not always first
  function mcAll(R, rights, wrongs) {
    var all = R.shuffle(rights.map(function (x) { return [x, 1]; }).concat(wrongs.map(function (x) { return [x, 0]; })));
    var v = []; all.forEach(function (x, i) { if (x[1]) v.push(i); });
    return { t: 'mc', choices: all.map(function (x) { return x[0]; }), v: v, keep: true };
  }
  var YN = ['Yes', 'No'];
  function letter(i) { return String.fromCharCode(65 + i); }
  function nums(n) { var a = []; for (var i = 1; i <= n; i++) a.push(String(i)); return a; }
  // a shuffled order of n items that is not the identity
  function derange(n, R) { var idx = []; for (var i = 0; i < n; i++) idx.push(i); for (var k = 0; k < 20; k++) { var s = R.shuffle(idx); if (s.join() !== idx.join()) return s; } return idx.slice(1).concat(0); }
  // "put these in order" as lettered cards (wr-order quiet): returns { viz, a, code } where code is the right order of letters
  function orderProblem(R, items, nWrong) {
    var perm = derange(items.length, R); // perm[pos] = item index shown at position pos (letter pos)
    var code = items.map(function (it, j) { return letter(perm.indexOf(j)); }).join(' ');
    var wrong = [], letters = code.split(' '), guard = 0;
    var shown = perm.map(function (j, pos) { return letter(pos); }).join(' '); // the order as shown (A B C …): a natural wrong guess
    if (shown !== code) wrong.push(shown);
    while (wrong.length < (nWrong || 3) && guard++ < 60) { var c = R.shuffle(letters).join(' '); if (c !== code && wrong.indexOf(c) < 0) wrong.push(c); }
    return { viz: { name: 'wr-order', opts: { items: items, start: perm, quiet: true, interactive: false } }, a: mc(code, wrong.slice(0, nWrong || 3)), code: code };
  }
  // choices that need italics (citations): the options are listed in the question as A, B, C … (real HTML), and the
  // learner picks a letter (choice buttons show plain text only)
  function lettered(R, right, wrongs) {
    var all = R.shuffle([right].concat(wrongs)), v = all.indexOf(right);
    var html = '<ol type="A" style="margin:.4rem 0 .4rem 1.6rem;padding:0">' + all.map(function (x) { return '<li style="margin:.3rem 0;padding-left:.2rem">' + x + '</li>'; }).join('') + '</ol>';
    return { html: html, a: mcK(all.map(function (x, i) { return letter(i); }), v), letter: letter(v) };
  }
  // numbered sentences in a quiet paragraph (wr-para): sentences [{ text, role }]
  function paraViz(sentences) { return { name: 'wr-para', opts: { sentences: sentences, quiet: true, interactive: false } }; }
  // insert x into a copy of arr at index i
  function insertAt(arr, i, x) { var c = arr.slice(); c.splice(i, 0, x); return c; }
  function pickOther(R, arr, not) { return R.pick(arr.filter(function (x) { return x !== not; })); }

  /* ================================================================ Unit 1: The Writing Process */
  var STAGES = ['Prewriting', 'Drafting', 'Revising', 'Editing', 'Publishing'];
  var ACTS = [
    ['brainstorms a list of possible topics', 0], ['makes a cluster web of ideas about dogs', 0], ['narrows “space” to “how astronauts sleep”', 0], ['writes an outline of her three main points', 0], ['freewrites for ten minutes to find an idea', 0],
    ['writes the whole essay from start to finish without stopping to fix commas', 1], ['gets his ideas down in a first draft', 1], ['writes a rough version of every paragraph', 1],
    ['moves her best reason to the end of the essay', 2], ['adds an example to a paragraph that had no support', 2], ['cuts a paragraph that wanders off the topic', 2], ['replaces a vague sentence with a specific one', 2], ['changes the order of two paragraphs so the background comes first', 2],
    ['changes “there dog” to “their dog”', 3], ['fixes a run-on sentence', 3], ['adds a missing comma after an introductory phrase', 3], ['corrects the spelling of “recieve”', 3], ['capitalizes the name of a city', 3],
    ['posts the final copy on the class website', 4], ['reads the finished story aloud to the class', 4], ['prints a clean copy and hands it in', 4]
  ];
  var NAMES = ['Lena', 'Omar', 'Priya', 'Jamal', 'Sofia', 'Ben', 'Mei', 'Diego', 'Hannah', 'Kofi', 'Rosa', 'Theo'];
  G('comp.writing-process', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'revedit', R.pick(['stage', 'revedit']), R.pick(['which', 'order', 'stage']));
    var nm = R.pick(NAMES);
    if (shape === 'revedit') {
      var act = R.pick(ACTS.filter(function (a) { return a[1] === 2 || a[1] === 3; }));
      return { q: q([para('Is this revising or editing?'), quote(nm + ' ' + act[0] + '.')]), a: mcK(['Revising', 'Editing'], act[1] === 2 ? 0 : 1),
        hint: 'Revising changes the ideas or their order. Editing fixes a sentence.',
        steps: act[1] === 2 ? ['This changes what the writing says or how it is organized.', 'Changing ideas, support or order is revising.'] : ['This fixes grammar, punctuation or spelling inside a sentence.', 'The ideas and their order stay the same, so it is editing.'] };
    }
    if (shape === 'stage') {
      var a = R.pick(ACTS);
      return { q: q([para('Which stage of the writing process is this?'), quote(nm + ' ' + a[0] + '.')]), a: mcK(STAGES, a[1]),
        hint: 'Is the writer planning, writing it down, changing the ideas, fixing sentences, or sharing?',
        steps: ['Prewriting plans, drafting writes, revising changes ideas and order, editing fixes sentences, publishing shares.', 'This is ' + low(STAGES[a[1]]) + '.'] };
    }
    if (shape === 'which') {
      var target = R.pick([2, 3]), right = R.pick(ACTS.filter(function (x) { return x[1] === target; }));
      var other = target === 2 ? 3 : 2, wrong = R.sample(ACTS.filter(function (x) { return x[1] === other; }), 2).concat(R.sample(ACTS.filter(function (x) { return x[1] === 0 || x[1] === 4; }), 1));
      return { q: q([para('Which of these is <b>' + (target === 2 ? 'revising' : 'editing') + '</b>?')]), a: mc('The writer ' + right[0] + '.', wrong.map(function (x) { return 'The writer ' + x[0] + '.'; })),
        hint: target === 2 ? 'Look for a change to the ideas, the support or the order.' : 'Look for a fix inside a sentence: grammar, punctuation or spelling.',
        steps: ['“The writer ' + right[0] + '” ' + (target === 2 ? 'changes the ideas or their order: revising.' : 'fixes a sentence: editing.'), 'The others are ' + wrong.map(function (x) { return low(STAGES[x[1]]); }).join(', ') + '.'] };
    }
    var items = STAGES.map(function (s, i) { return s; });
    var op = orderProblem(R, items, 3);
    return { q: q([para('Put the five stages of the writing process in their usual order. Which order of letters is right?')]), a: op.a, viz: op.viz,
      hint: 'Start with planning. End with sharing.',
      steps: ['Prewriting, drafting, revising, editing, publishing.', 'In letters: ' + op.code + '.', 'Writers loop back when they need to, but this is the usual order.'] };
  });

  var PURPOSES = ['To inform or explain', 'To persuade', 'To tell a story or entertain', 'To express feelings or connect'];
  var PIECES = [
    ['A flyer with the date, time and place of the spring book fair', 0], ['Directions for feeding the class hamster over the weekend', 0], ['A report on how volcanoes form', 0], ['A recipe card for banana bread', 0], ['A guide to the rules of a new board game', 0],
    ['A letter asking the city to put a crosswalk near the school', 1], ['A speech urging classmates to vote for a recycling club', 1], ['A review that tells readers to go see the new museum exhibit', 1], ['A poster asking students to bring their own water bottles', 1],
    ['A tale about a raccoon that sneaks into a campsite', 2], ['A funny story about the day the class goldfish escaped', 2], ['A mystery about a missing library book', 2], ['A comic strip about a robot that learns to bake', 2],
    ['A thank-you note to a grandparent', 3], ['A get-well card for a friend in the hospital', 3], ['A journal entry about a hard day', 3], ['A note telling a coach how much the season meant to you', 3]
  ];
  // audience fit: [situation, fits, [doesn't fit …], why]
  var AUD = [
    ['an email to the principal asking about a field trip', 'I am writing to ask whether our class could visit the science museum in May.', ['hey!! can we go on a trip?? pls', 'Yo, field trip time or what?'], 'A principal is a reader you don’t know well, so the tone is polite and clear.'],
    ['a text to your best friend about the game', 'We won!!! See you at practice tomorrow?', ['I am writing to inform you that our team was victorious in the contest.', 'Dear Friend: Please be advised of the final score.'], 'A best friend expects a casual, friendly tone.'],
    ['a newsletter article for families who don’t know the team', 'The seventh-grade team beat Riverside 2–1 in Saturday’s city final.', ['We totally crushed them, it was awesome, you should have seen Jo.', 'You know how we always play? Well, we did that again.'], 'Newsletter readers need the facts: who, what, when and the score.'],
    ['instructions for a babysitter who has never met your dog', 'Biscuit eats one cup of food at 6 p.m. and needs to go outside right after.', ['Feed Biscuit the usual way.', 'Just do what we always do with the dog.'], 'A new reader needs the details you already know.'],
    ['a letter to a city council member about a broken streetlight', 'The streetlight at Oak and Fifth has been out for three weeks, and the corner is very dark at night.', ['The light thing is broken again, as you know.', 'Ugh, fix the light already!!!'], 'A council member needs the exact place and problem, in a respectful tone.'],
    ['a note to a younger cousin explaining how to plant seeds', 'Push each seed into the dirt about as deep as your fingertip, then water it.', ['Sow the seeds at a depth of approximately one centimeter and irrigate thoroughly.', 'Do the standard germination procedure.'], 'A young reader needs simple words and a picture they can follow.']
  ];
  G('comp.purpose-audience', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'purpose', R.pick(['purpose', 'audience']), R.pick(['audience', 'need']));
    if (shape === 'purpose') {
      var p = R.pick(PIECES), L = ctx.level, choices = L === 1 ? null : PURPOSES;
      if (L === 1) { var other = R.pick([0, 1, 2, 3].filter(function (k) { return k !== p[1]; })), pair = [p[1], other].sort(); return { q: q([para('What is the main purpose of this piece?'), quote(p[0] + '.')]), a: mcK(pair.map(function (k) { return PURPOSES[k]; }), pair.indexOf(p[1])), hint: 'Why would someone write it: to inform, to persuade, to tell a story, or to express feelings?', steps: ['Ask why the writer wrote it.', 'Its main purpose: ' + low(PURPOSES[p[1]]) + '.'] }; }
      return { q: q([para('What is the main purpose of this piece?'), quote(p[0] + '.')]), a: mcK(choices, p[1]),
        hint: 'Why would someone write it: to inform, to persuade, to tell a story, or to express feelings?', steps: ['Ask why the writer wrote it.', 'Its main purpose: ' + low(PURPOSES[p[1]]) + '.'] };
    }
    var a = R.pick(AUD);
    if (shape === 'audience') {
      return { q: q([para('You are writing ' + a[0] + '. Which sentence fits that reader best?')]), a: mc(a[1], a[2]),
        hint: 'Who will read it? What do they know, and what tone do they expect?', steps: [a[3], 'So the best fit is “' + a[1] + '”'] };
    }
    // need: which draft leaves out what a reader needs (the trouble spot: writing only for someone who already knows)
    var vague = R.pick(a[2]);
    return { q: q([para('You are writing ' + a[0] + '. A classmate’s draft says:'), quote(vague), para('What is the main problem?')]),
      a: mc('It doesn’t fit the reader: the tone or the missing details assume the reader already knows the situation.', ['It is too short to be a sentence.', 'It needs more exclamation points to be friendly.', 'Nothing: every reader will understand it.']),
      hint: 'Picture the real reader. What would they need, and what tone would they expect?', steps: [a[3], 'A better sentence: “' + a[1] + '”'] };
  });

  // narrowing chains: broad → narrow (the last fits a one- or two-page paper)
  var CHAINS = [
    ['Sports', 'Basketball', 'Basketball rules', 'The three-point line', 'Why our school league added a three-point line'],
    ['Animals', 'Pets', 'Dogs', 'Training a puppy', 'Teaching a puppy to sit'],
    ['Space', 'The solar system', 'Mars', 'Rovers on Mars', 'How a Mars rover gets its power'],
    ['Food', 'Baking', 'Bread', 'Sourdough bread', 'Why sourdough bread rises without store-bought yeast'],
    ['Music', 'Musical instruments', 'String instruments', 'The violin', 'How a violin makes its sound'],
    ['Weather', 'Storms', 'Thunderstorms', 'Lightning', 'Why thunder comes after lightning'],
    ['Oceans', 'Ocean animals', 'Sea turtles', 'Sea turtle nests', 'Why sea turtles return to the beach where they hatched'],
    ['Transportation', 'Trains', 'Passenger trains', 'Subways', 'How our city’s subway map helps riders'],
    ['History', 'American history', 'Inventions of the 1800s', 'The telegraph', 'How the telegraph changed news reporting'],
    ['Plants', 'Trees', 'Maple trees', 'Maple sap', 'How maple sap becomes syrup']
  ];
  var TECH = [
    ['writes every idea that comes to mind, fast, as a list, without judging any of them', 'Brainstorming (listing)'],
    ['writes without stopping for ten minutes, then circles the best lines', 'Freewriting'],
    ['writes the topic in a circle in the middle of the page and connects related ideas around it', 'Clustering (a web)'],
    ['asks who, what, when, where, why and how about the topic', 'Asking questions']
  ];
  G('comp.prewriting', function (R, ctx) {
    var c = R.pick(CHAINS), shape = ML.byLevel(ctx, 'fits', R.pick(['fits', 'broad', 'tech']), R.pick(['order', 'fits4']));
    if (shape === 'fits' || shape === 'fits4') {
      var wrong = shape === 'fits' ? [c[R.int(0, 1)]] : [c[0], c[1], c[2]];
      return { q: q([para('Which topic fits a one-page paper best?')]), a: mc(c[4], wrong),
        hint: 'Choose a topic small enough to explain with real detail in one page.',
        steps: ['“' + c[0] + '” could fill many books.', 'Each step narrower leaves more room for detail.', '“' + c[4] + '” is one question you can answer well in a page.'] };
    }
    if (shape === 'broad') {
      var three = R.sample([0, 1, 2, 3, 4], 3).sort(), opts = three.map(function (k) { return c[k]; });
      return { q: q([para('Which of these topics is the broadest (the biggest)?')]), a: mc(opts[0], opts.slice(1)),
        hint: 'Which topic holds the others inside it?', steps: ['“' + opts[0] + '” contains ' + opts.slice(1).map(cq).join(' and ') + '.', 'So it is the broadest.'] };
    }
    if (shape === 'tech') {
      var t = R.pick(TECH), nm = R.pick(NAMES);
      return { q: q([para('Which prewriting method is ' + nm + ' using?'), quote(nm + ' ' + t[0] + '.')]), a: mcK(TECH.map(function (x) { return x[1]; }), TECH.indexOf(t)),
        hint: 'A list, nonstop writing, a web of circles, or questions?', steps: ['The description matches ' + low(t[1]) + '.'] };
    }
    var op = orderProblem(R, c, 3);
    return { q: q([para('Order these topics from the broadest to the narrowest. Which order of letters is right?')]), a: op.a, viz: op.viz,
      hint: 'Find the topic that holds all the others. Then the one inside it.',
      steps: ['Broadest to narrowest: ' + c.map(cq).join(' → ') + '.', 'In letters: ' + op.code + '.'] };
  });

  /* ================================================================ Unit 2: Paragraphs */
  // a paragraph bank: topic sentence, three supports, a concluding sentence, an off-topic (true but off the point) sentence,
  // a restatement of the topic, an announcement, a too-broad version, a new idea for the ending
  var PARAS = [
    { topic: 'Owls are built to hunt in the dark.', sup: ['Their large eyes gather what little light there is.', 'In many owls, one ear sits higher than the other, which helps them find prey by sound.', 'Soft edges on their feathers let them fly almost silently.'], conc: 'Few animals are as well made for the night.', off: 'Owls appear on many school mascots.', restate: 'Owls are very good at hunting at night.', announce: 'This paragraph is about owls.', broad: 'Birds are interesting.', newIdea: 'Also, some owls live for more than twenty years.', subject: 'owls' },
    { topic: 'Our school garden gives students a real science lab.', sup: ['Students measure how fast bean plants grow in sun and in shade.', 'They test the soil to see which beds need more water.', 'Each class keeps a chart of when the first tomatoes ripen.'], conc: 'Every harvest becomes a lesson in what worked and why.', off: 'The cafeteria serves tacos every Tuesday.', restate: 'The garden is a science lab for students.', announce: 'I am going to tell you about our garden.', broad: 'Science is everywhere.', newIdea: 'Also, the art club wants to paint the fence.', subject: 'the school garden' },
    { topic: 'Riding a bike to school has three big benefits.', sup: ['It gives riders exercise before the first bell.', 'It costs nothing once you own a bike.', 'It cuts down on the line of cars in front of the school.'], conc: 'For students who live close by, a bike is a smart way to get to school.', off: 'The first bicycles had no pedals at all.', restate: 'Biking to school is good in several ways.', announce: 'This paragraph will discuss bikes.', broad: 'There are many ways to travel.', newIdea: 'Also, skateboards are becoming popular.', subject: 'biking to school' },
    { topic: 'Penguins are excellent swimmers.', sup: ['Their wings work like stiff flippers.', 'Their bodies are shaped like torpedoes, so water slides past them.', 'Some can stay underwater for several minutes while they hunt.'], conc: 'In the water, the clumsy walkers become fast, graceful hunters.', off: 'Some penguins live on warm islands near the equator.', restate: 'Penguins swim very well.', announce: 'Now I will write about penguins.', broad: 'Many animals live near water.', newIdea: 'Also, penguins mate for life.', subject: 'penguins' },
    { topic: 'A good night’s sleep helps students in school.', sup: ['Rested students pay closer attention in class.', 'Sleep helps the brain store what it learned that day.', 'Students who sleep enough are less likely to feel cranky.'], conc: 'Getting to bed on time is one of the easiest ways to do well in school.', off: 'Some people like to sleep with a fan on.', restate: 'Sleeping well is helpful for students.', announce: 'This paragraph is about sleep.', broad: 'Health is important.', newIdea: 'Also, breakfast matters too.', subject: 'sleep' },
    { topic: 'Our town library is more than a place to borrow books.', sup: ['It lends tools, telescopes and board games.', 'It runs free homework help every afternoon.', 'Its meeting rooms host clubs, classes and town meetings.'], conc: 'For many families, the library is the center of town life.', off: 'The library building is made of red brick.', restate: 'The library does many things besides lend books.', announce: 'Let me tell you about the library.', broad: 'Towns have many buildings.', newIdea: 'Also, the bakery next door sells great muffins.', subject: 'the library' },
    { topic: 'Bees are important to farmers.', sup: ['Bees carry pollen from flower to flower as they feed.', 'Many fruit and nut crops need that pollen to grow.', 'Some farmers rent hives to make sure their orchards are pollinated.'], conc: 'Without bees, many farms would harvest far less.', off: 'Some people are afraid of bees.', restate: 'Farmers need bees a lot.', announce: 'My paragraph is about bees.', broad: 'Insects are everywhere.', newIdea: 'Also, wasps can sting more than once.', subject: 'bees' },
    { topic: 'Learning to cook teaches useful skills.', sup: ['Following a recipe takes careful reading.', 'Doubling a recipe takes math with fractions.', 'Cooking a meal on time takes planning.'], conc: 'A kitchen can be one of the best classrooms in the house.', off: 'My favorite food is pizza.', restate: 'Cooking teaches you skills that are useful.', announce: 'This paragraph is going to be about cooking.', broad: 'People learn many things.', newIdea: 'Also, restaurants are fun to visit.', subject: 'cooking' },
    { topic: 'Trees make city streets better places to be.', sup: ['Their shade keeps sidewalks cooler on hot days.', 'Their roots soak up rain that would flood the gutters.', 'Birds and squirrels nest in their branches.'], conc: 'A street with trees is cooler, drier and more alive.', off: 'Paper is made from wood pulp.', restate: 'Streets are better with trees on them.', announce: 'In this paragraph I will talk about trees.', broad: 'Nature is all around us.', newIdea: 'Also, some cities have too many cars.', subject: 'street trees' },
    { topic: 'Our class field trip to the aquarium taught us about ocean life.', sup: ['We watched divers feed the sharks in the big tank.', 'A guide explained how coral reefs grow.', 'We touched a sea star and felt its rough skin.'], conc: 'By the end of the day, the ocean felt a lot less mysterious.', off: 'The bus ride took almost an hour.', restate: 'We learned about ocean life on our trip to the aquarium.', announce: 'This is about our field trip.', broad: 'Field trips are fun.', newIdea: 'Also, next year we might visit the zoo.', subject: 'the aquarium trip' }
  ];
  function fullPara(P) { return [P.topic].concat(P.sup, [P.conc]); }

  G('comp.topic-sentences', function (R, ctx) {
    var P = R.pick(PARAS), L = ctx.level, shape = ML.byLevel(ctx, 'best', R.pick(['best', 'find']), R.pick(['wrong', 'find', 'best4']));
    if (shape === 'best' || shape === 'best4') {
      var wrong = L === 1 ? [P.announce, P.sup[0]] : [P.announce, R.pick(P.sup), P.broad];
      return { q: q([para('These sentences support one main idea:'), quote(P.sup.join(' ')), para('Which is the best topic sentence for them?')]), a: mc(P.topic, wrong),
        hint: 'A topic sentence makes a point about the topic, and covers every detail.',
        steps: ['“' + P.topic + '” makes a point that all three details support.', '“' + P.announce + '” only announces the topic.', L === 1 ? 'The other choice is one of the details, not the main idea.' : '“' + P.broad + '” is too broad to guide the paragraph, and the detail is too narrow.'] };
    }
    if (shape === 'find') {
      var sents = R.shuffle(fullPara(P).slice(0, 4)), k = sents.indexOf(P.topic);
      return { q: q([para('The sentences of a paragraph are mixed up. Which numbered sentence is the topic sentence?')]), a: mcK(nums(4), k), viz: paraViz(sents.map(function (s) { return { text: s }; })),
        hint: 'Find the sentence that states the main idea the others support.',
        steps: ['Sentence ' + (k + 1) + ', “' + P.topic + '”, states the main idea.', 'The other sentences are details that support it.'] };
    }
    var bad = R.pick([['announce', P.announce, 'It only announces the topic; it makes no point about it.'], ['detail', P.sup[R.int(0, 2)], 'It is one small detail, not the main idea.'], ['broad', P.broad, 'It is too broad: it could start a thousand different paragraphs.']]);
    var labels = ['It only announces the topic; it makes no point about it.', 'It is one small detail, not the main idea.', 'It is too broad: it could start a thousand different paragraphs.'];
    return { q: q([para('A writer uses this as the topic sentence of a paragraph about ' + P.subject + ':'), quote(bad[1]), para('What is the problem?')]), a: mcK(labels, labels.indexOf(bad[2])),
      hint: 'Does it make a point? Is it the right size for the whole paragraph?',
      steps: [bad[2], 'A stronger topic sentence: “' + P.topic + '”'] };
  });

  G('comp.supporting-details', function (R, ctx) {
    var P = R.pick(PARAS), shape = ML.byLevel(ctx, 'which', R.pick(['which', 'restate']), R.pick(['all', 'restate']));
    if (shape === 'which') {
      var right = R.pick(P.sup), wrong = ctx.level === 1 ? [P.off] : [P.off, P.restate];
      return { q: q([para('Topic sentence:'), quote(P.topic), para('Which sentence supports it?')]), a: mc(right, wrong),
        hint: 'Support adds new information that helps prove or explain the main idea.',
        steps: ['“' + right + '” gives a specific reason or fact for the main idea.', '“' + P.off + '” may be true, but it is off the point.'].concat(ctx.level === 1 ? [] : ['“' + P.restate + '” only repeats the topic sentence in other words.']) };
    }
    if (shape === 'restate') {
      var ch = R.sample(P.sup, 2);
      return { q: q([para('Topic sentence:'), quote(P.topic), para('Which sentence adds <b>nothing new</b>, because it only restates the topic sentence?')]), a: mc(P.restate, ch),
        hint: 'Look for the sentence that says the same thing as the topic sentence in different words.',
        steps: ['“' + P.restate + '” says what the topic sentence already said.', 'The others add specific details.'] };
    }
    var rights = R.sample(P.sup, 2), wrongs = [P.off, P.restate];
    return { q: q([para('Topic sentence:'), quote(P.topic), para('Which sentences support it with new information? Choose all that apply.')]), a: mcAll(R, rights, wrongs),
      hint: 'Two of these add support. One is off the point, and one only restates.',
      steps: ['Supporting: ' + rights.map(cq).join(' and ') + '.', '“' + P.off + '” is true but off the point.', '“' + P.restate + '” restates the topic sentence.'] };
  });

  G('comp.unity', function (R, ctx) {
    var P = R.pick(PARAS), L = ctx.level, shape = ML.byLevel(ctx, 'odd', R.pick(['odd', 'keep']), R.pick(['odd5', 'keep']));
    if (shape === 'odd' || shape === 'odd5') {
      var base = shape === 'odd' ? [P.topic].concat(R.sample(P.sup, 2)) : fullPara(P);
      var at = R.int(1, base.length - (shape === 'odd5' ? 1 : 0)), sents = insertAt(base, at, P.off);
      return { q: q([para('Which numbered sentence breaks the paragraph’s unity?')]), a: mcK(nums(sents.length), at), viz: paraViz(sents.map(function (s) { return { text: s }; })),
        hint: 'Read the topic sentence first. Which sentence is about something else?',
        steps: ['The main idea: “' + P.topic + '”', 'Sentence ' + (at + 1) + ', “' + P.off + '”, is about something else.', 'Cut it, or move it to a paragraph where it belongs.'] };
    }
    var stay = R.coin(), s = stay ? R.pick(P.sup) : P.off;
    return { q: q([para('Topic sentence:'), quote(P.topic), para('Should this sentence stay in the paragraph?'), quote(s)]), a: mcK(YN, stay ? 0 : 1),
      hint: 'Check it against the topic sentence, not just the sentence before it.',
      steps: stay ? ['It supports the main idea.', 'So it keeps the paragraph unified: yes, it stays.'] : ['It may be true, but it is not about the main idea.', 'It breaks the unity: no, it should go (or move to another paragraph).'] };
  });

  // transitions: [first sentence, second sentence (after the blank), relationship]
  var REL = { time: ['Then', 'Later', 'Afterward', 'Next'], addition: ['Also', 'In addition', 'Furthermore', 'Moreover'], contrast: ['However', 'On the other hand', 'Nevertheless', 'Still'], cause: ['As a result', 'Therefore', 'Consequently', 'Thus'], example: ['For example', 'For instance'] };
  var REL_NAMES = { time: 'time or sequence', addition: 'addition', contrast: 'contrast', cause: 'cause and effect', example: 'example' };
  var PAIRS = [
    ['The forecast called for sunshine.', 'it rained all afternoon.', 'contrast'], ['Hamsters are easy to feed.', 'they are awake and noisy all night.', 'contrast'], ['The museum is free on Sundays.', 'it is often too crowded to see much.', 'contrast'], ['Maya practiced the song every day.', 'she forgot the second verse at the concert.', 'contrast'],
    ['The library closes at six.', 'students who stay late at practice can’t check out books.', 'cause'], ['The bridge was closed for repairs.', 'the bus took a long detour.', 'cause'], ['Our team practiced passing all week.', 'we completed twice as many passes on Saturday.', 'cause'], ['The pond froze early this year.', 'the ducks left for the south in November.', 'cause'],
    ['Biking to school is good exercise.', 'it saves families the cost of gas.', 'addition'], ['The new park has a playground.', 'it has a walking path around the pond.', 'addition'], ['Owls have sharp eyesight.', 'they have very keen hearing.', 'addition'], ['Cooking teaches careful reading.', 'it gives you practice with fractions.', 'addition'],
    ['Some animals change color with the seasons.', 'the arctic fox turns from brown to white in winter.', 'example'], ['Many words in English come from French.', 'ballet, menu and garage all came from French.', 'example'], ['Recycling can save resources.', 'a recycled aluminum can may be back on a store shelf in a few weeks.', 'example'],
    ['We mixed the flour, sugar and eggs.', 'we poured the batter into the pan.', 'time'], ['The team warmed up for ten minutes.', 'the coach explained the first drill.', 'time'], ['Leo finished his homework.', 'he walked the dog around the block.', 'time']
  ];
  // wrong relationships that clearly don't fit each kind of pair (time and cause can overlap, so they are never each other's distractors)
  function relWrong(rel) { return { contrast: ['addition', 'cause', 'example'], cause: ['contrast', 'example'], addition: ['contrast', 'cause', 'example'], example: ['contrast', 'time'], time: ['contrast', 'example'] }[rel]; }
  G('comp.transitions', function (R, ctx) {
    var p = R.pick(PAIRS), rel = p[2], L = ctx.level, shape = ML.byLevel(ctx, 'blank', R.pick(['blank', 'rel']), R.pick(['check', 'blank4', 'rel']));
    var right = R.pick(REL[rel]), wrongRels = relWrong(rel);
    if (shape === 'blank' || shape === 'blank4') {
      var wr = (L === 1 ? wrongRels.slice(0, 1) : wrongRels).map(function (r) { return R.pick(REL[r]); });
      return { q: q([para('Which transition fits the blank?'), quote(p[0] + ' ___, ' + p[1])]), a: mc(right, wr),
        hint: 'How does the second idea relate to the first: time, addition, contrast, cause and effect, or example?',
        steps: ['The second sentence ' + { contrast: 'turns against the first: a contrast.', cause: 'is a result of the first: cause and effect.', addition: 'adds another point of the same kind: addition.', example: 'gives an example of the first: example.', time: 'comes next in time: sequence.' }[rel], '“' + right + '” signals ' + REL_NAMES[rel] + ': ' + p[0] + ' ' + right + ', ' + p[1]] };
    }
    if (shape === 'rel') {
      var keys = ['time', 'addition', 'contrast', 'cause', 'example'];
      return { q: q([para('What relationship does the transition show?'), quote(p[0] + ' <b>' + right + '</b>, ' + p[1])]), a: mcK(keys.map(function (k) { return cap(REL_NAMES[k]); }), keys.indexOf(rel)),
        hint: 'What does “' + right + '” tell the reader to expect?', steps: ['“' + right + '” is a ' + REL_NAMES[rel] + ' transition.', 'It fits: the second idea ' + { contrast: 'turns against the first.', cause: 'follows from the first.', addition: 'adds to the first.', example: 'is an example of the first.', time: 'comes next.' }[rel]] };
    }
    var ok = R.coin(), used = ok ? right : R.pick(REL[R.pick(wrongRels)]);
    return { q: q([para('Does the transition send the right signal?'), quote(p[0] + ' <b>' + used + '</b>, ' + p[1])]), a: mcK(YN, ok ? 0 : 1),
      hint: 'Spell out what the transition means (“however” means “but in contrast”). Does that fit the two ideas?',
      steps: ok ? ['The second idea shows ' + REL_NAMES[rel] + ', and “' + used + '” signals ' + REL_NAMES[rel] + '.', 'Yes, it fits.'] : ['The second idea shows ' + REL_NAMES[rel] + '.', '“' + used + '” signals something else, so the reader gets the wrong signal.', 'A better choice: “' + right + '.”'] };
  });

  // processes in time order (first item is the topic sentence)
  var PROCS = [
    ['Cooking rice takes only a few steps.', 'First, rinse the rice until the water runs clear.', 'Next, put the rice and twice as much water in a pot.', 'Then bring the water to a boil.', 'Finally, cover the pot and let it simmer until the water is gone.'],
    ['Planting a seed is easy.', 'First, fill a small pot with soil.', 'Next, push the seed in about as deep as your fingertip.', 'Then water the soil until it is damp.', 'Finally, set the pot in a sunny window.'],
    ['Washing a dog takes some planning.', 'First, brush out any knots.', 'Next, wet the dog with warm water.', 'Then work in the shampoo and rinse it all out.', 'Finally, dry the dog with a big towel.'],
    ['Making a paper airplane takes five folds.', 'First, fold a sheet of paper in half the long way and open it again.', 'Next, fold the top corners in to the center crease.', 'Then fold the new slanted edges in to the center.', 'Finally, fold the plane in half and fold down the wings.'],
    ['Checking a library book out online is simple.', 'First, log in with your library card number.', 'Next, search for the title.', 'Then click the button to place a hold.', 'Finally, pick the book up at the front desk when you get an email.'],
    ['Our class science fair project followed the scientific method.', 'First, we asked whether plants grow faster with music.', 'Next, we set up two groups of bean plants.', 'Then we played music to one group for two weeks.', 'Finally, we measured both groups and compared the results.'],
    ['Changing a bike tire takes patience.', 'First, take the wheel off the bike.', 'Next, pry the tire off the rim with tire levers.', 'Then put in the new tube and fit the tire back on.', 'Finally, pump the tire up and put the wheel back on.']
  ];
  var ORDERS = ['Time order', 'Place (spatial) order', 'Order of importance', 'Comparison'];
  var ORDER_TASKS = [
    ['the steps for making pancakes', 0], ['the story of your first day at a new school', 0], ['the history of your town from its founding to today', 0], ['how a caterpillar becomes a butterfly', 0],
    ['what your bedroom looks like', 1], ['the view from the top of a hill', 1], ['the layout of the school library', 1], ['a painting, from the foreground to the sky', 1],
    ['three reasons the school should keep recess', 2], ['why your town needs a new crosswalk, strongest reason last', 2], ['the most important things to pack for a camping trip', 2],
    ['how cats and dogs differ as pets', 3], ['two phones a family is choosing between', 3], ['how life in a city and on a farm are alike and different', 3]
  ];
  G('comp.paragraph-order', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'kind', R.pick(['kind', 'steps']), R.pick(['steps5', 'kind']));
    if (shape === 'kind') {
      var t = R.pick(ORDER_TASKS), L = ctx.level, choices = ORDERS;
      if (L === 1) { var other = R.pick([0, 1, 2, 3].filter(function (k) { return k !== t[1]; })), pair = [t[1], other].sort(); return { q: q([para('Which order fits a paragraph about ' + t[0] + '?')]), a: mcK(pair.map(function (k) { return ORDERS[k]; }), pair.indexOf(t[1])), hint: 'Steps and stories go by time; places by position; reasons by importance; two things side by side by comparison.', steps: ['A paragraph about ' + t[0] + ' fits ' + low(ORDERS[t[1]]) + '.'] }; }
      return { q: q([para('Which order fits a paragraph about ' + t[0] + '?')]), a: mcK(choices, t[1]),
        hint: 'Steps and stories go by time; places by position; reasons by importance; two things side by side by comparison.', steps: ['A paragraph about ' + t[0] + ' fits ' + low(ORDERS[t[1]]) + '.'] };
    }
    var P = R.pick(PROCS), items = shape === 'steps' ? P.slice(1) : P.slice(0);
    var op = orderProblem(R, items, 3);
    return { q: q([para(shape === 'steps' ? 'Topic sentence: <b>' + P[0] + '</b> Put the steps in time order. Which order of letters is right?' : 'Put the sentences of this paragraph in order: the topic sentence, then the steps in time order. Which order of letters is right?')]), a: op.a, viz: op.viz,
      hint: 'Look for the time words: first, next, then, finally. Do they match the steps?',
      steps: [shape === 'steps' ? 'First: “' + P[1] + '”' : 'The topic sentence comes first: “' + P[0] + '” Then “' + P[1] + '”', 'Last: “' + P[P.length - 1] + '”', 'In letters: ' + op.code + '.'] };
  });

  G('comp.concluding-sentences', function (R, ctx) {
    var P = R.pick(PARAS), L = ctx.level, shape = ML.byLevel(ctx, 'best', R.pick(['best', 'what']), R.pick(['what', 'best4']));
    if (shape === 'best' || shape === 'best4') {
      var wrong = L === 1 ? [P.newIdea, P.announce] : [P.topic, P.newIdea].concat(shape === 'best4' ? ['That is everything about ' + P.subject + '.'] : []);
      return { q: q([para('Here is a paragraph without its last sentence:'), quote([P.topic].concat(P.sup).join(' ')), para('Which is the best concluding sentence?')]), a: mc(P.conc, wrong),
        hint: 'A good ending returns to the main idea in new words. It doesn’t copy the topic sentence or start a new idea.',
        steps: ['“' + P.conc + '” returns to the main idea in new words.', '“' + P.newIdea + '” starts a new idea at the very end.'].concat(L === 1 ? ['“' + P.announce + '” only announces the subject.'] : ['“' + P.topic + '” copies the topic sentence word for word.']) };
    }
    var kinds = [['It copies the topic sentence word for word.', P.topic], ['It brings in a new idea at the very end.', P.newIdea], ['Nothing: it wraps up the main idea in new words.', P.conc]];
    var k = R.int(0, 2);
    return { q: q([para('Topic sentence: <b>' + P.topic + '</b>'), para('Concluding sentence:'), quote(kinds[k][1]), para('Is there a problem with the concluding sentence?')]), a: mcK(kinds.map(function (x) { return x[0]; }), k),
      hint: 'Compare it with the topic sentence. Is it the same words, a new idea, or the same idea in new words?',
      steps: [kinds[k][0], k === 2 ? 'It is a good ending.' : 'A better ending: “' + P.conc + '”'] };
  });

  /* ================================================================ Unit 3: Kinds of Writing */
  // short stories: characters, setting, conflict, climax, resolution, and events in order
  var STORIES = [
    { chars: 'Marcus and his little sister Ellie', setting: 'a crowded county fair on a hot August evening', conflict: 'Ellie lets go of Marcus’s hand and disappears into the crowd.', climax: 'Marcus hears Ellie’s laugh coming from the goat pen.', resolution: 'He finds her feeding a goat and holds her hand the rest of the night.',
      events: ['Marcus and Ellie walked through the gate of the fair.', 'Marcus let go of Ellie’s hand to count his tickets.', 'When he turned around, Ellie was gone.', 'He searched the rides and the food tents.', 'He heard a giggle from the goat pen.', 'Ellie was there, feeding a goat a handful of hay.'] },
    { chars: 'Priya and her grandfather', setting: 'a small fishing boat on a gray lake at dawn', conflict: 'A storm rolls in, and the boat’s motor won’t start.', climax: 'Priya remembers the oars under the bench and they row for shore.', resolution: 'They reach the dock just as the rain begins, soaked and laughing.',
      events: ['Priya and her grandfather pushed the boat out at dawn.', 'Dark clouds rolled over the hills.', 'The motor coughed and died.', 'Priya found the oars under the bench.', 'They rowed hard for the shore.', 'They reached the dock just as the rain began.'] },
    { chars: 'Jamal, the new kid in sixth grade', setting: 'a noisy school cafeteria on the first day of school', conflict: 'Jamal can’t find anyone to sit with.', climax: 'A girl at the end of a table notices his comic book and waves him over.', resolution: 'By the end of lunch, Jamal has a friend who loves the same comics.',
      events: ['Jamal carried his tray into the noisy cafeteria.', 'Every table seemed full.', 'He stood by the trash cans, pretending to read his comic book.', 'A girl at the end of a table spotted the comic and waved.', 'They talked about superheroes until the bell rang.'] },
    { chars: 'Sofia and her dog, Pepper', setting: 'a snowy backyard on a winter morning', conflict: 'Pepper slips out of the gate and runs toward the busy road.', climax: 'Sofia shakes Pepper’s favorite squeaky toy, and Pepper turns around.', resolution: 'Pepper trots back, and Sofia fixes the gate latch that afternoon.',
      events: ['Sofia let Pepper out into the snowy yard.', 'The gate swung open in the wind.', 'Pepper dashed out toward the road.', 'Sofia grabbed the squeaky toy and squeezed it hard.', 'Pepper skidded to a stop and ran back.', 'That afternoon, Sofia fixed the latch.'] },
    { chars: 'Ben and his science partner, Mei', setting: 'the school gym on the night of the science fair', conflict: 'Their volcano model cracks an hour before the judges arrive.', climax: 'They patch it with clay from the art room just as the judges walk up.', resolution: 'The volcano erupts on cue, and the judges ask how they fixed it.',
      events: ['Ben and Mei set up their volcano in the gym.', 'A long crack split the side of the model.', 'Mei ran to the art room for clay.', 'They smoothed the last patch as the judges arrived.', 'The volcano erupted right on cue.'] }
  ];
  var POV = [
    ['I grabbed my backpack and ran for the bus, but it was already pulling away.', 0], ['My hands shook as I walked onto the stage.', 0], ['We had never seen so much snow in one night, and I couldn’t wait to go outside.', 0], ['I pressed my ear to the door and held my breath.', 0],
    ['She grabbed her backpack and ran for the bus, but it was already pulling away.', 1], ['Theo’s hands shook as he walked onto the stage.', 1], ['They had never seen so much snow in one night.', 1], ['The old man pressed his ear to the door and held his breath.', 1]
  ];
  G('comp.narrative', function (R, ctx) {
    var S = R.pick(STORIES), shape = ML.byLevel(ctx, R.pick(['part', 'pov']), R.pick(['part', 'conflict', 'pov']), R.pick(['order', 'conflict']));
    var PARTS = [['the setting', S.setting], ['the conflict', S.conflict], ['the resolution', S.resolution]];
    if (shape === 'part') {
      var k = R.int(0, 2), names = ['Setting', 'Conflict', 'Resolution'];
      return { q: q([para('In a story about ' + S.chars + ', which part of the story is this?'), quote(cap(PARTS[k][1]).replace(/([^.])$/, '$1.'))]), a: mcK(names, k),
        hint: 'Setting is where and when. Conflict is the problem. Resolution is how it turns out.', steps: ['“' + cap(PARTS[k][1]) + '” tells ' + ['where and when the story happens', 'the problem the characters face', 'how the problem turns out'][k] + '.', 'So it is ' + PARTS[k][0] + '.'] };
    }
    if (shape === 'conflict') {
      var wrong = [cap(S.setting) + '.', S.resolution];
      if (ctx.level >= 3) wrong.push(S.climax);
      return { q: q([para('A story is about ' + S.chars + '. Which sentence states its <b>conflict</b>?')]), a: mc(S.conflict, wrong),
        hint: 'The conflict is the problem that drives the story.', steps: ['“' + S.conflict + '” is the problem the characters must face.', 'The others give the setting' + (ctx.level >= 3 ? ', the turning point' : '') + ' or the resolution.'] };
    }
    if (shape === 'pov') {
      var p = R.pick(POV);
      return { q: q([para('From which point of view is this sentence told?'), quote(p[0])]), a: mcK(['First person (I, we)', 'Third person (he, she, they)'], p[1]),
        hint: 'Who tells it? Look at the pronouns.', steps: p[1] === 0 ? ['The narrator says “I” or “we”: a character tells their own story.', 'First person.'] : ['The narrator uses names and he, she or they: someone outside tells it.', 'Third person.'] };
    }
    var op = orderProblem(R, S.events, 3);
    return { q: q([para('Put the events of the story in order. Which order of letters is right?')]), a: op.a, viz: op.viz,
      hint: 'Find the opening (characters and setting), then the problem, then how it is solved.',
      steps: ['It opens: “' + S.events[0] + '”', 'It ends: “' + S.events[S.events.length - 1] + '”', 'In letters: ' + op.code + '.'] };
  });

  // [the feeling told, sentences that show it]
  var FEEL = [
    ['nervous', ['Ana wiped her palms on her skirt for the third time and counted the people in the front row.', 'Leo tapped his pencil so fast it rattled on the desk.', 'Jun read the first line of the test four times without understanding it.']],
    ['angry', ['Theo dropped his backpack so hard the zipper cracked.', '“Fine,” Rosa said through her teeth, and she slammed the door.', 'Kofi crumpled the note and threw it at the trash can.']],
    ['happy', ['Mia spun in a circle in the rain, laughing, her arms wide open.', 'Diego grinned so hard his cheeks hurt as he held up the trophy.', 'Hannah skipped down the hall, humming her favorite song.']],
    ['sad', ['Grandpa sat by the window, holding the old photo, and didn’t speak for a long time.', 'Omar pushed his dinner around the plate and didn’t eat a bite.', 'Lena pulled her hood over her face and stared at the floor of the bus.']],
    ['tired', ['Ben’s head drooped onto his book, and he jerked awake when it slipped.', 'Sofia yawned three times before she reached the top of the stairs.', 'Jamal dragged his feet up the driveway and dropped onto the couch.']],
    ['scared', ['Priya froze, her heart pounding, as the floorboard creaked behind her.', 'Ellie grabbed her brother’s sleeve and didn’t let go.', 'Mei held her breath as the shadow slid across the tent wall.']],
    ['surprised', ['Ava’s mouth fell open when she saw the puppy in the box.', 'Jun blinked twice and read the letter again from the top.', 'Leo nearly dropped his tray when the whole class shouted his name.']]
  ];
  var SHOWTELL_WHEN = [
    ['The story jumps from the first day of summer to the first day of school, and nothing important happens in between.', 1],
    ['The main character finally opens the letter that will decide whether she made the team.', 0],
    ['The family drives for six quiet hours before they reach the campsite.', 1],
    ['Two friends argue, and the argument changes their friendship.', 0],
    ['A character eats breakfast, as on every other ordinary morning, before the real story starts at school.', 1],
    ['The hero sees the missing dog across the busy street.', 0]
  ];
  G('comp.show-dont-tell', function (R, ctx) {
    var f = R.pick(FEEL), shape = ML.byLevel(ctx, R.pick(['which', 'st']), R.pick(['which', 'feeling', 'st']), R.pick(['feeling', 'when']));
    var nm = function (s) { return s; };
    if (shape === 'which') {
      var right = R.pick(f[1]), other = pickOther(R, FEEL, f), wrong = ['The character was ' + f[0] + '.'];
      if (ctx.level >= 2) wrong.push(R.pick(other[1]));
      return { q: q([para('Which sentence <b>shows</b> that a character is ' + f[0] + ', without naming the feeling?')]), a: mc(right, wrong),
        hint: 'Showing uses actions, words and details. Telling names the feeling.',
        steps: ['“' + right + '” lets the reader see the feeling through actions and details.', '“The character was ' + f[0] + '.” names the feeling: that is telling.'].concat(ctx.level >= 2 ? ['The other sentence shows a different feeling: ' + other[0] + '.'] : []) };
    }
    if (shape === 'st') {
      var shows = R.coin(), s = shows ? R.pick(f[1]) : cap(R.pick(['the girl', 'the boy', 'Grandma', 'my friend', 'the coach'])) + ' was ' + R.pick(['very ', 'really ', '']) + f[0] + '.';
      return { q: q([para('Does this sentence show or tell?'), quote(s)]), a: mcK(['It shows.', 'It tells.'], shows ? 0 : 1),
        hint: 'Does it name the feeling, or let you figure it out from actions and details?',
        steps: shows ? ['It gives actions and details, and you figure out the feeling (' + f[0] + ') yourself.', 'It shows.'] : ['It names the feeling (' + f[0] + ') directly.', 'It tells.'] };
    }
    if (shape === 'feeling') {
      var s2 = R.pick(f[1]), wrongF = R.sample(FEEL.filter(function (x) { return x !== f && !(f[0] === 'nervous' && x[0] === 'scared') && !(f[0] === 'scared' && x[0] === 'nervous'); }), 2).map(function (x) { return x[0]; });
      return { q: q([para('Which feeling does this sentence show?'), quote(s2)]), a: mc(f[0], wrongF),
        hint: 'What would you feel if you acted like that?', steps: ['The actions and details point to one feeling.', 'The character is ' + f[0] + '.'] };
    }
    var w = R.pick(SHOWTELL_WHEN);
    return { q: q([para('Should the writer show this part in a detailed scene, or tell it quickly?'), quote(w[0])]), a: mcK(['Show it in a scene.', 'Tell it quickly.'], w[1]),
      hint: 'Show the moments that matter. Tell the stretches where nothing important happens.',
      steps: w[1] === 0 ? ['This moment matters to the story.', 'Slow it down and show it: actions, dialogue, details.'] : ['Nothing important to the story happens here.', 'A sentence of telling moves the reader on to the scenes that matter.'] };
  });

  // [plain sentence, precise revision, stacked-adjective version, still-vague version]
  var DESC = [
    ['The big tree made a noise in the wind.', 'The old oak groaned in the wind.', 'The big, huge, giant tree made a loud, noisy sound in the wind.', 'The tree made a sound in the wind.'],
    ['The dog ate the food fast.', 'The beagle wolfed down his kibble.', 'The furry, cute, little dog ate the good, tasty food fast.', 'The animal ate something quickly.'],
    ['A bird went across the sky.', 'A red-tailed hawk circled over the field.', 'A big, flying, feathered bird went across the big blue sky.', 'Something went across the sky.'],
    ['The man walked slowly down the street.', 'The old man shuffled down Maple Street.', 'The old, aged, elderly man walked very, very slowly down the street.', 'A person moved down the street.'],
    ['The flowers looked nice.', 'The tulips glowed red and yellow along the fence.', 'The pretty, nice, lovely flowers looked very nice and pretty.', 'The plants were there.'],
    ['The car went fast down the road.', 'The pickup truck roared down the gravel road.', 'The fast, speedy, quick car went fast down the road.', 'The vehicle moved along.'],
    ['The food smelled good.', 'The kitchen smelled of cinnamon rolls and fresh coffee.', 'The good, yummy, delicious food smelled really good.', 'Something smelled.']
  ];
  var SENSES = ['Sight', 'Sound', 'Smell', 'Taste', 'Touch'];
  var SENSE_BANK = [
    ['The sky turned orange and pink above the hills.', 0], ['A red kite dipped and rose over the beach.', 0], ['Snow covered every roof in a thick white blanket.', 0],
    ['The screen door creaked and slapped shut.', 1], ['Thunder rumbled far off over the lake.', 1], ['The crowd roared as the ball sailed over the fence.', 1],
    ['The bakery smelled of warm bread and cinnamon.', 2], ['Smoke from the campfire clung to our jackets.', 2], ['The air after the rain smelled like wet earth.', 2],
    ['The lemonade was so sour it made my eyes water.', 3], ['The soup tasted salty and rich.', 3], ['The berries were sweet, with a tart bite at the end.', 3],
    ['The puppy’s fur was as soft as a cotton ball.', 4], ['The metal slide burned the backs of my legs.', 4], ['Cold sand squished between my toes.', 4]
  ];
  G('comp.descriptive', function (R, ctx) {
    var d = R.pick(DESC), shape = ML.byLevel(ctx, R.pick(['best', 'sense']), R.pick(['best3', 'sense']), R.pick(['best3', 'stacked']));
    if (shape === 'best' || shape === 'best3') {
      var wrong = shape === 'best' ? [d[3]] : [d[2], d[3]];
      return { q: q([para('Which revision of this sentence is the most precise and vivid?'), quote(d[0])]), a: mc(d[1], wrong),
        hint: 'Look for a precise noun and a strong verb, not a pile of adjectives.',
        steps: ['“' + d[1] + '” uses a precise noun and a strong verb.', shape === 'best' ? '“' + d[3] + '” is even vaguer than the original.' : '“' + d[2] + '” stacks adjectives that mean the same thing; “' + d[3] + '” is vaguer than the original.'] };
    }
    if (shape === 'sense') {
      var s = R.pick(SENSE_BANK), L = ctx.level;
      if (L === 1) { var o = R.pick([0, 1, 2, 3, 4].filter(function (k) { return k !== s[1]; })), pr = [s[1], o].sort(); return { q: q([para('Which sense does this detail appeal to?'), quote(s[0])]), a: mcK(pr.map(function (k) { return SENSES[k]; }), pr.indexOf(s[1])), hint: 'Would you see it, hear it, smell it, taste it or feel it?', steps: ['You would ' + ['see', 'hear', 'smell', 'taste', 'feel'][s[1]] + ' this.', 'Sense: ' + low(SENSES[s[1]]) + '.'] }; }
      return { q: q([para('Which sense does this detail appeal to?'), quote(s[0])]), a: mcK(SENSES, s[1]),
        hint: 'Would you see it, hear it, smell it, taste it or feel it?', steps: ['You would ' + ['see', 'hear', 'smell', 'taste', 'feel'][s[1]] + ' this.', 'Sense: ' + low(SENSES[s[1]]) + '.'] };
    }
    return { q: q([para('What is the main problem with this sentence?'), quote(d[2])]),
      a: mc('It stacks adjectives that mean the same thing instead of choosing one precise word.', ['It has no verb.', 'It uses too few details.', 'It is written in the past tense.']),
      hint: 'Do the describing words add new information?', steps: ['Several of the adjectives repeat each other.', 'One precise noun and a strong verb do more: “' + d[1] + '”'] };
  });

  // expository: [neutral fact, opinionated version, loaded word]
  var EXPO = [
    ['Aluminum cans can be recycled and made into new cans.', 'Recycling cans is the smartest thing anyone can do.', 'smartest'],
    ['A volcano is an opening in Earth’s crust where melted rock, gas and ash escape.', 'Volcanoes are terrifying mountains of fire.', 'terrifying'],
    ['Honeybees live in colonies of thousands of bees.', 'Honeybees are the coolest insects in the world.', 'coolest'],
    ['The Moon takes about a month to go through its phases.', 'The Moon is the most beautiful thing in the night sky.', 'beautiful'],
    ['Leaves change color in autumn as trees stop making chlorophyll.', 'Autumn leaves are amazing to look at.', 'amazing'],
    ['A bicycle chain carries the force of the pedals to the back wheel.', 'Bicycles are way better than cars.', 'better'],
    ['Penguins use their wings as flippers when they swim.', 'Penguins are adorable little swimmers.', 'adorable'],
    ['The heart pumps blood through the body.', 'The heart is the most incredible organ of all.', 'incredible']
  ];
  G('comp.expository', function (R, ctx) {
    var e = R.pick(EXPO), shape = ML.byLevel(ctx, 'fits', R.pick(['fits', 'word']), R.pick(['word', 'all']));
    if (shape === 'fits') {
      var wrong = [e[1], pickOther(R, EXPO, e)[1]];
      return { q: q([para('Which sentence belongs in an expository report that informs the reader?')]), a: mc(e[0], wrong),
        hint: 'Expository writing explains with facts in a neutral voice.', steps: ['“' + e[0] + '” states information a reader can check.', 'The other choices give the writer’s feelings.'] };
    }
    if (shape === 'word') {
      var words = e[1].replace(/[.,]/g, '').split(' ').filter(function (w) { return w.length > 3 && w.toLowerCase() !== e[2] && !/^(the|and|with|that|this|than|anyone|everyone|most|them)$/i.test(w); });
      var wrongW = R.sample(words.filter(function (w, i, a) { return a.indexOf(w) === i; }), Math.min(2, words.length));
      return { q: q([para('This sentence slips an opinion into a report. Which word gives it away?'), quote(e[1])]), a: mc(e[2], wrongW),
        hint: 'Find the word that judges instead of describing.', steps: ['“' + e[2] + '” is the writer’s judgment, not information.', 'A neutral report would say: “' + e[0] + '”'] };
    }
    var other = R.sample(EXPO.filter(function (x) { return x !== e; }), 2);
    return { q: q([para('Which sentences fit a neutral, expository report? Choose all that apply.')]), a: mcAll(R, [e[0], other[0][0]], [e[1], other[1][1]]),
      hint: 'Keep the sentences that inform. Leave out the ones that judge.', steps: ['Neutral: “' + e[0] + '” and “' + other[0][0] + '”', 'Opinions: “' + e[1] + '” and “' + other[1][1] + '”'] };
  });

  var STRUCTS = ['Definition', 'Classification', 'Process', 'Compare and contrast', 'Cause and effect'];
  var STRUCT_BANK = [
    ['A glacier is a large mass of ice that moves slowly over land.', 0, 'is'], ['A haiku is a short poem of three lines, often about nature.', 0, 'is'], ['The word “biography” means a true story of a person’s life written by someone else.', 0, 'means'],
    ['Clouds come in three main types: cirrus, cumulus and stratus.', 1, 'types'], ['Rocks fall into three groups: igneous, sedimentary and metamorphic.', 1, 'groups'], ['There are two kinds of teeth in the front of your mouth: incisors and canines.', 1, 'kinds'],
    ['First, the caterpillar spins a chrysalis; then its body changes inside.', 2, 'First'], ['To make paper, workers mash wood into pulp, then press and dry it.', 2, 'then'], ['After the dough rises, the baker shapes it into loaves.', 2, 'After'],
    ['Unlike frogs, toads usually have dry, bumpy skin.', 3, 'Unlike'], ['Both cats and lions are hunters, but only lions live in groups.', 3, 'Both'], ['A canoe is paddled from a kneeling or sitting position; in contrast, a kayak is paddled from a seat low in the boat.', 3, 'in contrast'],
    ['A metaphor is a comparison that says one thing is another, without like or as.', 0, 'is'], ['The term “habitat” refers to the natural home of a plant or animal.', 0, 'refers to'],
    ['Instruments in an orchestra belong to four families: strings, woodwinds, brass and percussion.', 1, 'families'], ['Sentences can be grouped into four kinds by purpose: statements, questions, commands and exclamations.', 1, 'kinds'], ['Bridges fall into a few main categories, such as beam, arch and suspension.', 1, 'categories'],
    ['Next, the sap is boiled until most of the water is gone.', 2, 'Next'], ['Finally, the clay pot is fired in a hot kiln.', 2, 'Finally'],
    ['Similarly, both bats and birds can fly, but only bats are mammals.', 3, 'both'], ['A lake is usually larger and deeper than a pond.', 3, 'than'],
    ['The road was icy; as a result, school opened two hours late.', 4, 'as a result'], ['Since the bridge was closed, traffic backed up for miles.', 4, 'Since'],
    ['Because the pond froze, the ducks flew south early.', 4, 'Because'], ['Heavy rain washed soil into the river, so the water turned brown.', 4, 'so'], ['The drought led to smaller harvests across the valley.', 4, 'led to']
  ];
  var STRUCT_Q = [['What does the word “erosion” mean?', 0], ['What kinds of rocks are there?', 1], ['How does a bill become a law in our state?', 2], ['How is a violin different from a cello?', 3], ['What causes the seasons?', 4], ['What happened after the dam was built?', 4], ['What is a glacier?', 0], ['What kinds of clouds are there?', 1], ['How is maple syrup made?', 2], ['How are alligators and crocodiles alike and different?', 3], ['Why did the creek flood?', 4], ['What does “photosynthesis” mean?', 0], ['What are the main groups of musical instruments?', 1], ['How do you change a bike tire?', 2], ['How does living in a city compare with living on a farm?', 3], ['What happens when a volcano erupts?', 4]];
  G('comp.text-structures', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'name', R.pick(['name', 'question']), R.pick(['signal', 'question', 'name']));
    if (shape === 'name') {
      var s = R.pick(STRUCT_BANK);
      if (ctx.level === 1) { var oth = R.sample([0, 1, 2, 3, 4].filter(function (k) { return k !== s[1]; }), 2), set = [s[1]].concat(oth).sort(); return { q: q([para('Which way of explaining does this sentence use?'), quote(s[0])]), a: mcK(set.map(function (k) { return STRUCTS[k]; }), set.indexOf(s[1])), hint: 'Look for a signal word: is, types, first, unlike, because…', steps: ['The signal: “' + s[2] + '”.', 'The structure: ' + low(STRUCTS[s[1]]) + '.'] }; }
      return { q: q([para('Which way of explaining does this sentence use?'), quote(s[0])]), a: mcK(STRUCTS, s[1]),
        hint: 'Look for a signal word: is, types, first, unlike, because…', steps: ['The signal: “' + s[2] + '”.', 'The structure: ' + low(STRUCTS[s[1]]) + '.'] };
    }
    if (shape === 'question') {
      var qq = R.pick(STRUCT_Q);
      return { q: q([para('A reader asks the question below. Which structure answers it best?'), quote(qq[0])]), a: mcK(STRUCTS, qq[1]),
        hint: 'What? Which kinds? How is it done? How are they alike and different? Why, or what results?',
        steps: ['The question asks ' + ['what something is', 'what kinds there are', 'how something happens or is done', 'how two things are alike and different', 'why something happens or what it causes'][qq[1]] + '.', 'That calls for ' + low(STRUCTS[qq[1]]) + '.'] };
    }
    var sig = { 4: ['because', 'as a result', 'led to', 'so'], 3: ['unlike', 'both', 'similarly', 'however'], 2: ['first', 'next', 'then', 'finally'], 1: ['types', 'kinds', 'groups', 'categories'], 0: ['means', 'is called', 'refers to'] };
    var k = R.int(0, 4), right = R.pick(sig[k]), wrong = R.sample([0, 1, 2, 3, 4].filter(function (x) { return x !== k; }), 3).map(function (x) { return R.pick(sig[x]); });
    return { q: q([para('Which signal word or phrase belongs to <b>' + low(STRUCTS[k]) + '</b>?')]), a: mc(right, wrong),
      hint: 'Each structure has its own signal words.', steps: ['“' + right + '” signals ' + low(STRUCTS[k]) + '.', 'The others signal ' + wrong.map(function (w) { var kk = +Object.keys(sig).filter(function (z) { return sig[z].indexOf(w) >= 0; })[0]; return low(STRUCTS[kk]) + ' (' + w + ')'; }).join(', ') + '.'] };
  });

  // [statement, 0 fact | 1 opinion]; facts can be checked (some are false: still statements of fact)
  var FO = [
    ['Our school has 420 students.', 0], ['Water boils at 100 °C at sea level.', 0], ['The library is open until 6 p.m. on weekdays.', 0], ['Mount Everest is the tallest mountain above sea level.', 0], ['The Pacific is the largest ocean on Earth.', 0], ['Spiders have eight legs.', 0], ['The bus leaves at 7:15 each morning.', 0], ['A week has seven days.', 0],
    ['Blue is the prettiest color.', 1], ['Summer is the most enjoyable season.', 1], ['Homework is boring.', 1], ['Pizza is the greatest food ever made.', 1], ['Dogs are better pets than cats.', 1], ['That movie was too long.', 1], ['Soccer is more exciting than baseball.', 1], ['Our town should plant trees on Main Street.', 1]
  ];
  var FO_FALSE = ['Spiders have six legs.', 'The Sun goes around the Earth.', 'The Atlantic is the largest ocean on Earth.', 'A week has eight days.'];
  var CLAIMS = [
    ['Our school should add a bike rack, because more students now ride to school.', 'Our school has one bike rack.', 'Bikes are the coolest way to travel.'],
    ['The library should stay open until 8 p.m. so students can study after practice.', 'The library closes at 6 p.m.', 'The library is a cozy place.'],
    ['Our town should build a skate park, because skaters now use the parking lot.', 'Our town has no skate park.', 'Skateboarding is fun to watch.'],
    ['Students should get ten more minutes for lunch, because many can’t finish eating.', 'Lunch lasts twenty minutes.', 'Tacos are the best lunch.'],
    ['The city should add a crosswalk at Oak and Fifth, where cars rarely slow down.', 'There is no crosswalk at Oak and Fifth.', 'Oak Street is a pretty street.']
  ];
  G('comp.fact-opinion', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'fo', R.pick(['fo', 'which']), R.pick(['false', 'claim', 'which']));
    var FOC = ['Fact (it can be checked)', 'Opinion (a belief or judgment)'];
    if (shape === 'fo') {
      var s = R.pick(FO);
      return { q: q([para('Fact or opinion?'), quote(s[0])]), a: mcK(FOC, s[1]),
        hint: 'Ask: how could someone test this?', steps: s[1] === 0 ? ['It can be checked: counted, measured or looked up.', 'It is a fact.'] : ['It is a judgment or belief; people can disagree, and no measurement settles it.', 'It is an opinion.'] };
    }
    if (shape === 'false') {
      var f = R.pick(FO_FALSE);
      return { q: q([para('This statement is wrong. Is it a statement of fact or an opinion?'), quote(f)]), a: mcK(FOC, 0),
        hint: 'A statement of fact can be checked. What happens when you check this one?', steps: ['It can be checked, and when you check it, it turns out false.', 'A false statement of fact is still a statement of fact, not an opinion.'] };
    }
    if (shape === 'which') {
      var fact = R.pick(FO.filter(function (x) { return x[1] === 0; })), ops = R.sample(FO.filter(function (x) { return x[1] === 1; }), ctx.level >= 3 ? 3 : 2);
      return { q: q([para('Which statement is a <b>fact</b>?')]), a: mc(fact[0], ops.map(function (x) { return x[0]; })),
        hint: 'Which one could be checked by counting, measuring or looking it up?', steps: ['“' + fact[0] + '” can be checked.', 'The others are judgments.'] };
    }
    var c = R.pick(CLAIMS);
    return { q: q([para('Which statement would make the best claim for an argument essay?')]), a: mc(c[0], [c[1], c[2]]),
      hint: 'A claim takes a position someone could argue for or against, and it can be supported with reasons and evidence.',
      steps: ['“' + c[0] + '” takes a position and can be supported with reasons and evidence.', '“' + c[1] + '” is a plain fact: there is nothing to argue.', '“' + c[2] + '” is a matter of taste that evidence can’t settle.'] };
  });

  // persuasive: [claim, real reason, empty reason, attack, off-topic]
  var PERS = [
    ['Recess should be longer.', 'Students focus better after they move, and our teachers report calmer afternoons on days with a long recess.', 'Recess should be longer because recess is great.', 'People who want shorter recess don’t care about kids.', 'My favorite recess game is tag.'],
    ['The library should open on Sundays.', 'Many students have weekend projects and no quiet place to work at home.', 'The library should open on Sundays because I want it to.', 'Anyone who disagrees is just lazy.', 'The library has a new blue carpet.'],
    ['Our school should start a composting program.', 'Food scraps fill a large share of our cafeteria trash, and compost could feed the school garden.', 'Composting is good because it is good for the school.', 'Only people who hate the planet would say no.', 'Worms can live for several years.'],
    ['Students should be allowed to bring water bottles to class.', 'Students who drink water through the day are less likely to get headaches, and the fountains are far from many rooms.', 'Water bottles should be allowed because they should be allowed.', 'Teachers who ban water bottles are mean.', 'Some water bottles are made of steel.'],
    ['The town should add bike lanes on Main Street.', 'Bike lanes separate riders from cars, and more students ride on Main Street than on any other road.', 'Bike lanes are awesome, so we need them.', 'Drivers who complain about bike lanes are selfish.', 'Bicycles were invented in the 1800s.'],
    ['Our class should take its field trip to the science museum.', 'The museum’s space exhibit matches the unit we are studying this spring.', 'The museum is the best because it just is.', 'Kids who want the zoo instead are babies.', 'The museum has a gift shop.']
  ];
  G('comp.persuasive', function (R, ctx) {
    var p = R.pick(PERS), shape = ML.byLevel(ctx, 'reason', R.pick(['reason', 'attack']), R.pick(['reason4', 'role']));
    if (shape === 'reason' || shape === 'reason4') {
      var wrong = shape === 'reason' ? [p[2]] : [p[2], p[3], p[4]];
      return { q: q([para('Claim:'), quote(p[0]), para('Which sentence gives the strongest support?')]), a: mc(p[1], wrong),
        hint: 'Look for a real reason with evidence, not a restated opinion or an attack.',
        steps: ['“' + p[1] + '” gives a reason a reader can check.', '“' + p[2] + '” only repeats the opinion.'].concat(shape === 'reason4' ? ['“' + p[3] + '” attacks people instead of answering their reasons.', '“' + p[4] + '” is off the point.'] : []) };
    }
    if (shape === 'attack') {
      return { q: q([para('Claim: <b>' + p[0] + '</b> Which sentence attacks people instead of making a case?')]), a: mc(p[3], [p[1], p[2]]),
        hint: 'Which sentence is about the people who disagree, not about their reasons?',
        steps: ['“' + p[3] + '” attacks the people who disagree (an ad hominem fallacy).', 'Persuasive writing answers the other side’s reasons fairly instead.'] };
    }
    // role: a short persuasive paragraph; which numbered sentence answers the other side?
    var reb = 'Some say ' + low(p[0].replace(/should/, 'should not').replace(/\.$/, '')) + ', but ' + R.pick(['the benefits outweigh the costs.', 'the evidence points the other way.', 'that worry can be solved with a little planning.']);
    var sents = [p[0], p[1], reb, 'For these reasons, ' + low(p[0])];
    var order = R.coin() ? [0, 1, 2, 3] : [0, 2, 1, 3], shown = order.map(function (i) { return sents[i]; }), k = shown.indexOf(reb);
    return { q: q([para('Which numbered sentence answers the other side?')]), a: mcK(nums(4), k), viz: paraViz(shown.map(function (s) { return { text: s }; })),
      hint: 'Look for the sentence that states the opposing view and then responds to it.',
      steps: ['Sentence ' + (k + 1) + ' states what the other side says (“Some say …”) and answers it (“but …”).', 'Answering the strongest objection fairly makes an argument more convincing.'] };
  });

  /* ================================================================ Unit 4: The Essay */
  // thesis sets: [thesis, topic announcement, question, plain fact, three body points]
  var THESES = [
    ['School uniforms save families money and time.', 'This essay is about school uniforms.', 'Should schools have uniforms?', 'Some schools require uniforms.', ['Uniforms cost less than a closet of school clothes.', 'Uniforms end the morning “what to wear” rush.', 'Uniforms can be handed down to younger children.']],
    ['Middle schools should start at 8:30 or later so students get more sleep.', 'My essay is about school start times.', 'What time should school start?', 'Our middle school starts at 7:30.', ['Teens need eight to ten hours of sleep.', 'Rested students learn more in morning classes.', 'Later starts mean fewer students rushing to school in the dark.']],
    ['Railroads helped the Union win the Civil War by moving troops and supplies faster.', 'This essay is about the Civil War.', 'How did the North win the Civil War?', 'The Civil War began in 1861.', ['Railroads moved troops to battles quickly.', 'Trains carried food and ammunition to the front.', 'The North had far more miles of track than the South.']],
    ['Honeybees make honey in three stages: they gather nectar, pass it between workers, and fan it until it thickens.', 'I will tell you about honeybees.', 'How do bees make honey?', 'Honeybees make honey.', ['Bees gather nectar from flowers.', 'Worker bees pass the nectar from bee to bee.', 'Bees fan the nectar until most of the water dries off.']],
    ['Every student should learn to cook, because cooking saves money, builds healthy habits and teaches planning.', 'This paper is about cooking.', 'Should students learn to cook?', 'Many people cook dinner at home.', ['Cooking at home costs less than eating out.', 'People who cook tend to eat more vegetables.', 'Cooking a meal on time takes planning.']],
    ['Our town should build a skate park, because it would make skaters safer and give teens a place to meet.', 'This essay discusses skate parks.', 'Does our town need a skate park?', 'Our town does not have a skate park.', ['Skaters now ride in busy parking lots.', 'A park would give teens a safe place to meet friends.', 'A skate park would bring skaters from nearby towns.']],
    ['The Wright brothers succeeded because they tested every idea in their own wind tunnel.', 'My report is about the Wright brothers.', 'Why did the Wright brothers succeed?', 'The Wright brothers flew near Kitty Hawk, North Carolina, in 1903.', ['They built a wind tunnel to test wing shapes.', 'They used their test results to design new wings.', 'They practiced with gliders before adding a motor.']]
  ];
  var NOT_THESIS = ['It only names the topic.', 'It is a question, not a statement.', 'It is a plain fact: there is nothing to explain or prove.', 'Nothing: it is a thesis.'];
  G('comp.thesis', function (R, ctx) {
    var t = R.pick(THESES), shape = ML.byLevel(ctx, 'which', R.pick(['which', 'wrong']), R.pick(['wrong', 'covers']));
    if (shape === 'which') {
      var wrong = ctx.level === 1 ? [t[1], t[2]] : [t[1], t[2], t[3]];
      return { q: q([para('Which is a thesis statement?')]), a: mc(t[0], wrong),
        hint: 'A thesis is a statement that makes a point the essay will explain or prove.',
        steps: ['“' + t[0] + '” states a point the essay will support.', '“' + t[1] + '” only names the topic; “' + t[2] + '” is a question.'].concat(ctx.level === 1 ? [] : ['“' + t[3] + '” is a plain fact.']) };
    }
    if (shape === 'wrong') {
      var k = R.int(0, 3), s = [t[1], t[2], t[3], t[0]][k];
      return { q: q([para('A student offers this as a thesis. What is the problem?'), quote(s)]), a: mcK(NOT_THESIS, k),
        hint: 'Is it a statement? Does it make a point someone could explain, question or argue?',
        steps: [NOT_THESIS[k], k === 3 ? 'It makes a point the whole essay can support.' : 'A thesis on this topic: “' + t[0] + '”'] };
    }
    var others = R.sample(THESES.filter(function (x) { return x !== t; }), 2);
    return { q: q([para('An essay’s three body paragraphs make these points:'), '<ol>' + t[4].map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>', para('Which thesis fits the essay?')]), a: mc(t[0], [t[3], others[0][0], others[1][0]]),
      hint: 'The thesis must cover all three points.', steps: ['All three points support “' + t[0] + '”', '“' + t[3] + '” is a plain fact; the others are about different topics.'] };
  });

  // thesis strength: [strong, too broad, too obvious, too vague]
  var TSTR = [
    ['Our town should add a crosswalk at Oak and Fifth, where three accidents happened last year.', 'Roads can be dangerous.', 'Traffic safety is important.', 'There are good and bad things about crosswalks.'],
    ['A four-day school week would hurt families who rely on school meals.', 'School has changed a lot over time.', 'School is important for students.', 'A four-day week has advantages and disadvantages.'],
    ['Strategy games can improve planning skills, because players must think several moves ahead.', 'Technology has changed the world.', 'Games are fun to play.', 'Video games have good and bad effects.'],
    ['World War II opened factory jobs to many American women, changing what families expected women to do.', 'World War II changed everything.', 'World War II was a big war.', 'World War II was interesting in many ways.'],
    ['Planting trees on Main Street would cool the sidewalks and bring more shoppers downtown.', 'The environment matters to everyone.', 'Trees are plants.', 'Trees have pros and cons.'],
    ['Our school should replace paper hall passes with a sign-out sheet, because the passes keep getting lost.', 'Schools have many rules.', 'Rules help schools run.', 'Hall passes are a complicated topic.'],
    ['Reading aloud to young children builds their vocabulary, because they hear words they don’t yet use themselves.', 'Reading has been around for thousands of years.', 'Reading is good for you.', 'There are many interesting things about reading.']
  ];
  G('comp.thesis-strength', function (R, ctx) {
    var t = R.pick(TSTR), shape = ML.byLevel(ctx, 'best', R.pick(['best', 'label']), R.pick(['fix', 'best']));
    if (shape === 'fix') {
      var k0 = R.int(1, 3), others = [1, 2, 3].filter(function (x) { return x !== k0; });
      return { q: q([para('A student’s thesis:'), quote(t[k0]), para('Which revision makes it strongest?')]), a: mc(t[0], others.map(function (x) { return t[x]; })),
        hint: 'Choose the version that is specific, arguable and supportable in a short essay.',
        steps: ['The original is ' + ['', 'too broad', 'too obvious', 'too vague'][k0] + '.', '“' + t[0] + '” names exactly what the essay will show, and someone could disagree with it.', 'The other versions are still too broad, too obvious or too vague.'] };
    }
    if (shape === 'best') {
      var wrong = ctx.level === 1 ? [t[2], t[3]] : [t[1], t[2], t[3]];
      return { q: q([para('Which thesis is the strongest?')]), a: mc(t[0], wrong),
        hint: 'A strong thesis is specific, arguable and can be supported in a short essay.',
        steps: ['“' + t[0] + '” is specific, someone could disagree, and it can be supported with evidence.', '“' + t[2] + '” is too obvious to need an essay; “' + t[3] + '” is too vague to guide one.'].concat(ctx.level === 1 ? [] : ['“' + t[1] + '” is too broad to support in a few pages.']) };
    }
    // strong or weak? (the three weaknesses overlap, so the problem asks only strong or weak and the steps name the weakness)
    var k = R.coin() ? 0 : R.int(1, 3);
    return { q: q([para('Is this thesis strong enough to guide an essay?'), quote(t[k])]), a: mcK(['Yes: it is specific, arguable and supportable.', 'No: it is too broad, too obvious or too vague.'], k === 0 ? 0 : 1),
      hint: 'Is it specific? Could someone disagree? Could you support it in a few pages?',
      steps: [['It is specific, arguable and supportable.', 'It is too broad: no short essay could support it.', 'It is too obvious: no one would disagree, so there is nothing to show.', 'It is too vague: it doesn’t say what the essay will show.'][k], k === 0 ? 'It can guide a whole essay.' : 'A stronger thesis: “' + t[0] + '”'] };
  });

  // outlines: [thesis, [I, II, III], [support for each], intruder point, detail -> index]
  var OUTLINES = [
    ['Our school should start a composting program, because it cuts waste, teaches science and feeds the garden.', ['Composting cuts cafeteria waste.', 'Composting teaches science.', 'Compost feeds the school garden.'], 'Compost bins come in many colors.', [['Fewer bags of trash would go to the curb each week.', 0], ['Students could measure how fast scraps break down.', 1], ['Compost adds nutrients to the soil of the vegetable beds.', 2]]],
    ['Every student should learn to cook, because it saves money, builds healthy habits and teaches planning.', ['Cooking saves money.', 'Cooking builds healthy habits.', 'Cooking teaches planning.'], 'Many famous chefs have TV shows.', [['A homemade dinner costs much less than takeout.', 0], ['People who cook tend to eat more vegetables.', 1], ['A meal with three dishes has to be timed so all are ready at once.', 2]]],
    ['Our town should build a skate park, because it would keep skaters safe, give teens a place to meet and bring visitors.', ['A skate park would keep skaters safe.', 'A skate park would give teens a place to meet.', 'A skate park would bring visitors to town.'], 'Skateboards were first made from wooden boxes and roller-skate wheels.', [['Skaters now ride in busy parking lots.', 0], ['Friends could gather there after school.', 1], ['Skaters from nearby towns would come for competitions.', 2]]],
    ['The library should open on Sundays, because students need a place to study, families have free time, and it would serve more people.', ['Students need a place to study on weekends.', 'Families have free time on Sundays.', 'Sunday hours would serve more people.'], 'The library building is a hundred years old.', [['Many students have weekend projects and no quiet room at home.', 0], ['Parents who work on Saturdays could bring their children.', 1], ['More visits mean more people using the computers and books.', 2]]]
  ];
  G('comp.outlining', function (R, ctx) {
    var o = R.pick(OUTLINES), shape = ML.byLevel(ctx, 'where', R.pick(['where', 'intruder']), R.pick(['intruder', 'thesis']));
    var rn = ['I', 'II', 'III'];
    function outlineHTML(points) { return '<ol type="I">' + points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ol>'; }
    if (shape === 'where') {
      var d = R.pick(o[3]);
      return { q: q([para('Thesis: <b>' + o[0] + '</b>'), outlineHTML(o[1]), para('Under which main point does this detail belong?'), quote(d[0])]), a: mcK(rn, d[1]),
        hint: 'Which main point does the detail help prove?', steps: ['The detail supports “' + o[1][d[1]] + '”', 'So it goes under ' + rn[d[1]] + '.'] };
    }
    if (shape === 'intruder') {
      return { q: q([para('Thesis: <b>' + o[0] + '</b>'), para('Which main point does <b>not</b> support the thesis?')]), a: mc(o[2], o[1].slice()),
        hint: 'Read the thesis, then “because,” then each point. Which one doesn’t make sense?',
        steps: ['“' + o[2] + '” is true, but it doesn’t help prove the thesis.', 'Take it out of the outline.'] };
    }
    var others = OUTLINES.filter(function (x) { return x !== o; }).map(function (x) { return x[0]; });
    return { q: q([para('Which thesis fits this outline?'), outlineHTML(o[1])]), a: mc(o[0], R.sample(others, 3)),
      hint: 'The thesis must cover all three main points.', steps: ['“' + o[0] + '” names all three points.', 'The others cover a different topic or only one point.'] };
  });

  // introductions: hook kinds and weak openers
  var HOOKS = [
    ['What would you do with an extra hour of sleep every school day?', 0], ['Could a city save money by planting trees?', 0], ['Have you ever wondered why the creek floods every April?', 0],
    ['At 6:15 a.m., Maya’s alarm rings for the third time, and she still can’t open her eyes.', 1], ['The bus pulls away just as Leo reaches the corner, his shoelaces flapping.', 1], ['On the last day of school, the cafeteria trash bins overflow with untouched apples.', 1],
    ['A honeybee may visit dozens of flowers on a single trip out of the hive.', 2], ['An average American throws away more than four pounds of trash a day.', 2],
    ['“Vigorous writing is concise,” wrote William Strunk in 1918.', 3]
  ];
  var HOOK_KINDS = ['A question', 'A short scene', 'A surprising fact', 'A quotation'];
  var WEAK = ['Since the beginning of time, people have needed sleep.', 'Webster’s dictionary defines “sleep” as a natural state of rest.', 'In this essay, I will talk about sleep.', 'In today’s society, sleep is a very important thing.'];
  var INTRO_TOPICS = [
    { hook: 'At 6:15 a.m., Maya’s alarm rings for the third time, and she still can’t open her eyes.', ctx1: 'Like many teenagers, she falls asleep late and must be at school by 7:30.', ctx2: 'Sleep experts recommend eight to ten hours a night for teens, but many get far less.', thesis: 'Our district should move the high school start time to 8:30 a.m. so students can get the sleep they need.', weak: WEAK },
    { hook: 'Every afternoon, two dozen skaters weave between cars in the grocery store parking lot.', ctx1: 'Our town has no skate park, so skaters use whatever pavement they can find.', ctx2: 'Drivers and skaters both say they have had close calls.', thesis: 'Our town should build a skate park to keep skaters and drivers safe.', weak: ['Since the beginning of time, people have wanted to have fun.', 'The dictionary defines “skateboard” as a short board on wheels.', 'In this essay, I will talk about skate parks.', 'In today’s society, skating is a very popular thing.'] },
    { hook: 'What happens to the half-eaten sandwiches in our cafeteria trash?', ctx1: 'Each day, the cafeteria throws away bags of food scraps.', ctx2: 'Composting turns scraps like these into rich soil.', thesis: 'Our school should start a composting program to cut waste and feed the school garden.', weak: ['Since the beginning of time, people have thrown things away.', 'The dictionary defines “compost” as decayed plant matter.', 'In this essay, I will talk about composting.', 'In today’s society, trash is a very big problem.'] }
  ];
  G('comp.introductions', function (R, ctx) {
    var T = R.pick(INTRO_TOPICS), shape = ML.byLevel(ctx, 'hook', R.pick(['hook', 'kind']), R.pick(['order', 'kind']));
    if (shape === 'hook') {
      var wrong = ctx.level === 1 ? R.sample(T.weak, 1) : R.sample(T.weak, 3);
      return { q: q([para('Which first sentence makes the strongest hook for an essay whose thesis is:'), quote(T.thesis)]), a: mc(T.hook, wrong),
        hint: 'A good hook is specific to this essay. Weak openers could begin a hundred different essays.',
        steps: ['“' + T.hook + '” is specific and pulls the reader in.', 'The others are sweeping claims, dictionary definitions or announcements that could start any essay.'] };
    }
    if (shape === 'kind') {
      var h = R.pick(HOOKS);
      return { q: q([para('What kind of hook is this?'), quote(h[0])]), a: mcK(HOOK_KINDS, h[1]),
        hint: 'Does it ask, set a scene, give a fact, or quote someone?', steps: ['It ' + ['asks a question the essay will answer', 'drops the reader into a moment', 'gives a fact that surprises the reader', 'quotes someone else’s words'][h[1]] + '.', 'It is ' + low(HOOK_KINDS[h[1]]) + '.'] };
    }
    var op = orderProblem(R, [T.hook, T.ctx1, T.ctx2, T.thesis], 3);
    return { q: q([para('Put the sentences of this introduction in order: hook, context, thesis. Which order of letters is right?')]), a: op.a, viz: op.viz,
      hint: 'Start with the sentence that grabs attention. End with the main claim.',
      steps: ['Hook: “' + T.hook + '”', 'Then the context, from the general situation to the specific problem.', 'Thesis last: “' + T.thesis + '”', 'In letters: ' + op.code + '.'] };
  });

  // body paragraphs: [thesis, topic sentence, evidence, commentary, restated evidence, off-topic topic sentence]
  var BODIES = [
    ['Our school should start a composting program.', 'Composting would teach students real science.', 'In a pilot at Lakeview School, students measured how fast scraps broke down in three bins.', 'Measuring and comparing like this is the work scientists do, so the bins would turn lunch scraps into lab lessons.', 'Students at Lakeview measured scraps breaking down in three bins.', 'Worms are interesting animals.'],
    ['Our town should plant trees on Main Street.', 'Trees would bring more shoppers to Main Street.', 'In a survey of shoppers in a nearby town, most said they would stay longer on a shady street.', 'If shoppers stay longer on our street, they have more time to stop in and buy something from local stores.', 'Most shoppers in the survey said they would stay longer on a shady street.', 'Some trees live for hundreds of years.'],
    ['The library should open on Sundays.', 'Sunday hours would help students finish weekend projects.', 'At our school, 46 of 120 seventh graders said they have no quiet place to study at home.', 'For those students, a quiet library table on Sunday could be the difference between a rushed project and a finished one.', 'Almost half of the seventh graders surveyed have no quiet place to study.', 'The library has a new reading room.'],
    ['Students should learn to cook.', 'Cooking at home saves families money.', 'A family dinner made at home often costs a fraction of the same meal from a restaurant.', 'Teenagers who can cook a few simple meals help their families keep that money for other needs.', 'Home cooking costs much less than eating out.', 'Restaurants come in many styles.'],
    ['Our school should add a daily reading period.', 'A reading period would help students read more each year.', 'At Pine Hill Middle School, students who had twenty minutes of free reading each day finished an average of eleven more books a year.', 'Eleven extra books means hundreds of extra pages of practice, which is how readers grow faster and more confident.', 'Pine Hill students with a reading period finished about eleven more books a year.', 'Some books are made into movies.'],
    ['Our town should open a tool library.', 'A tool library would save neighbors money.', 'In a neighboring town, members borrowed ladders, drills and saws more than 3,000 times in its first year.', 'Each of those loans is a tool a family did not have to buy for a job that took one afternoon.', 'Members of the tool library made more than 3,000 loans in a year.', 'Hammers have been used for thousands of years.'],
    ['The school should add bike racks by the front doors.', 'More bike racks would get more students riding to school.', 'When Cedar School added twenty racks, the number of students biking on a typical morning rose from 15 to 41.', 'Students were ready to ride; they only needed a safe place to leave their bikes once they arrived.', 'Cedar School went from 15 to 41 bike riders after adding racks.', 'Bikes come in many colors.'],
    ['Our class should keep a class pet.', 'Caring for a pet would teach students responsibility.', 'In one fourth-grade class with a pet guinea pig, students took turns with a weekly chart for feeding, water and cleaning.', 'Having a living animal depend on them each day showed students that their jobs mattered, and they kept the chart without reminders.', 'The class used a weekly chart for feeding, water and cleaning.', 'Guinea pigs come from South America.']
  ];
  G('comp.body-paragraphs', function (R, ctx) {
    var b = R.pick(BODIES), shape = ML.byLevel(ctx, 'comment', R.pick(['comment', 'topic']), R.pick(['role', 'comment4']));
    if (shape === 'comment' || shape === 'comment4') {
      var wrong = shape === 'comment' ? [b[4], b[5]] : [b[4], b[5], 'That is a fact.'];
      return { q: q([para('Topic sentence: <b>' + b[1] + '</b>'), para('Evidence: <b>' + b[2] + '</b>'), para('Which sentence should come next, to explain the evidence?'), para('<small>(The evidence is invented for practice.)</small>')]), a: mc(b[3], wrong),
        hint: 'After evidence, answer the question “so what?” How does it support the point?',
        steps: ['“' + b[3] + '” explains how the evidence supports the topic sentence: that is commentary.', '“' + b[4] + '” only repeats the evidence.'].concat(shape === 'comment' ? ['“' + b[5] + '” changes the subject.'] : []).concat(shape === 'comment4' ? ['The other choices add nothing or change the subject.'] : []) };
    }
    if (shape === 'topic') {
      return { q: q([para('Thesis: <b>' + b[0] + '</b>'), para('Which topic sentence ties a body paragraph to the thesis?')]), a: mc(b[1], [b[5], R.pick(BODIES.filter(function (x) { return x !== b; }))[1]]),
        hint: 'The topic sentence should give a reason for the thesis.', steps: ['“' + b[1] + '” gives a reason for “' + b[0] + '”', 'The others are about something else.'] };
    }
    var order = R.shuffle([1, 2, 3]), sents = order.map(function (i) { return b[i]; }), want = R.pick([[2, 'evidence'], [3, 'commentary'], [1, 'topic sentence']]);
    var k = sents.indexOf(b[want[0]]);
    return { q: q([para('The sentences of a body paragraph are mixed up. Which numbered sentence is the <b>' + want[1] + '</b>?')]), a: mcK(nums(3), k), viz: paraViz(sents.map(function (s) { return { text: s }; })),
      hint: 'The topic sentence makes the point; the evidence gives facts; the commentary explains what the evidence shows.',
      steps: ['Topic sentence: “' + b[1] + '”', 'Evidence: “' + b[2] + '”', 'Commentary: “' + b[3] + '”', 'So the ' + want[1] + ' is sentence ' + (k + 1) + '.'] };
  });

  // conclusions: [thesis, restated in new words, new point, announcement]
  var CONCL = [
    ['Our district should move the high school start time to 8:30 a.m. so students can get the sleep they need.', 'An 8:30 start would give students the rest that their health and their schoolwork depend on.', 'Also, the cafeteria should serve better breakfasts.', 'In conclusion, this essay was about school start times.'],
    ['Our town should build a skate park to keep skaters and drivers safe.', 'A skate park would give skaters a safe place to ride and give drivers back their parking lots.', 'Also, the town should fix the potholes on Elm Street.', 'In conclusion, that is what I think about skate parks.'],
    ['Our school should start a composting program to cut waste and feed the school garden.', 'By turning scraps into soil, a compost program would shrink our trash and grow our garden.', 'Also, the school should buy new lunch tables.', 'In conclusion, this essay discussed composting.'],
    ['Every student should learn to cook, because cooking saves money, builds healthy habits and teaches planning.', 'Learning to cook pays off every day, in money saved, meals eaten well and plans carried out.', 'Also, students should learn to sew.', 'In conclusion, I have explained cooking.'],
    ['The library should open on Sundays so students have a quiet place to study.', 'A few Sunday hours would give students a calm place to finish the week’s work.', 'Also, the library should buy more comic books.', 'In conclusion, this essay was about the library.'],
    ['Our town should plant trees on Main Street to cool the sidewalks and bring in shoppers.', 'Shade trees would make Main Street a cooler, busier place to spend an afternoon.', 'Also, the town should paint the benches.', 'In conclusion, now you know about trees.'],
    ['Students should be allowed to carry water bottles in class, because water helps them stay alert.', 'A water bottle on every desk is a small change that keeps students alert all day.', 'Also, the school should have longer passing periods.', 'In conclusion, I have told you about water bottles.'],
    ['The city should add a crosswalk at Oak and Fifth, where cars rarely slow down.', 'A crosswalk at Oak and Fifth would make one of the town’s riskiest corners safe to cross.', 'Also, the city should repave the parking lot.', 'In conclusion, this essay discussed a crosswalk.']
  ];
  var CONCL_LAB = ['It repeats the thesis word for word.', 'It starts a new point.', 'It announces instead of concluding.', 'Nothing: it restates the thesis in new words.'];
  G('comp.conclusions', function (R, ctx) {
    var c = R.pick(CONCL), shape = ML.byLevel(ctx, 'best', R.pick(['best', 'label']), R.pick(['label', 'best4']));
    if (shape === 'best' || shape === 'best4') {
      var wrong = ctx.level === 1 ? [c[2]] : shape === 'best4' ? [c[0], c[2], c[3]] : [c[2], c[3]];
      return { q: q([para('Thesis:'), quote(c[0]), para('Which is the best first sentence for the conclusion?')]), a: mc(c[1], wrong),
        hint: 'Return to the thesis in new words. Don’t copy it, announce it or start something new.',
        steps: ['“' + c[1] + '” returns to the thesis in new words and pulls the points together.', '“' + c[2] + '” starts a new point at the end.'].concat(ctx.level === 1 ? [] : ['“' + c[3] + '” announces instead of concluding.']).concat(shape === 'best4' ? ['Repeating the thesis word for word wastes the ending.'] : []) };
    }
    var k = R.int(0, 3), s = [c[0], c[2], c[3], c[1]][k];
    return { q: q([para('Thesis: <b>' + c[0] + '</b>'), para('First sentence of the conclusion:'), quote(s), para('Is there a problem?')]), a: mcK(CONCL_LAB, k),
      hint: 'Compare it with the thesis. Same words? A new idea? An announcement?', steps: [CONCL_LAB[k], k === 3 ? 'It is a good start to the conclusion.' : 'A better sentence: “' + c[1] + '”'] };
  });

  // five-paragraph essays: [thesis, three distinct points, a repeat of point 1 in other words, an off-topic point]
  var FIVES = [
    ['Every student should learn to cook.', ['Cooking saves money.', 'Cooking builds healthy habits.', 'Cooking teaches planning.'], 'Cooking is cheaper than eating out.', 'Some kitchens have gas stoves.'],
    ['Our town should build a skate park.', ['A skate park would keep skaters safe.', 'A skate park would give teens a place to meet.', 'A skate park would bring visitors to town.'], 'A skate park would make skating less dangerous.', 'Skateboards come in many sizes.'],
    ['Students should read for fun every day.', ['Reading builds vocabulary.', 'Reading helps students relax.', 'Reading teaches about other places and people.'], 'Reading helps students learn new words.', 'Libraries have quiet rooms.'],
    ['Our school should have a garden.', ['A garden teaches science.', 'A garden provides fresh food.', 'A garden brings families together on weekends.'], 'A garden is a hands-on science lab.', 'Tomatoes are technically fruits.']
  ];
  var FIVE_PARTS = ['Introduction', 'Body paragraph 1', 'Body paragraph 2', 'Body paragraph 3', 'Conclusion'];
  G('comp.five-paragraph', function (R, ctx) {
    var f = R.pick(FIVES), shape = ML.byLevel(ctx, R.pick(['where', 'plan']), R.pick(['plan', 'problem']), R.pick(['problem', 'two']));
    if (shape === 'where') {
      var k = R.pick([0, 4]), what = k === 0 ? 'the thesis statement' : 'the thesis restated in new words, and why it matters';
      return { q: q([para('In a five-paragraph essay, which paragraph holds ' + what + '?')]), a: mcK(FIVE_PARTS, k),
        hint: 'The introduction leads to the thesis; the conclusion returns to it.', steps: [k === 0 ? 'The thesis usually ends the introduction.' : 'The conclusion restates the thesis in new words and shows why it matters.', 'So: the ' + low(FIVE_PARTS[k]) + '.'] };
    }
    if (shape === 'plan') {
      var good = f[1].join(' / '), bad1 = [f[1][0], f[2], f[1][1]].join(' / '), bad2 = [f[1][0], f[1][1], f[3]].join(' / ');
      return { q: q([para('Thesis: <b>' + f[0] + '</b> Which set of topic sentences makes the best three body paragraphs?')]), a: mc(good, [bad1, bad2]),
        hint: 'Each body paragraph needs its own reason, and every reason must support the thesis.',
        steps: ['“' + good + '”: three different reasons, each supporting the thesis.', 'One of the other sets repeats a reason in new words; the other includes a point that doesn’t support the thesis.'] };
    }
    if (shape === 'problem') {
      return { q: q([para('Thesis: <b>' + f[0] + '</b> The body paragraphs’ topic sentences are:'), '<ol>' + [f[1][0], f[2], f[1][1]].map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>', para('What is wrong with this plan?')]),
        a: mc('Two body paragraphs make the same point in different words.', ['The essay needs exactly five reasons.', 'The thesis should come in the conclusion.', 'Nothing is wrong.']),
        hint: 'Compare the points with each other.', steps: ['“' + f[1][0] + '” and “' + f[2] + '” are the same point.', 'Merge them, and find a real third reason or write two strong body paragraphs.'] };
    }
    return { q: q([para('A writer has only two strong reasons for a thesis. What is the best plan?')]),
      a: mc('Write two strong body paragraphs (or find a real third reason).', ['Repeat one reason in new words to make a third paragraph.', 'Add a third paragraph about something unrelated.', 'Leave out the conclusion to save space.']),
      hint: 'The form serves the ideas, not the other way around.', steps: ['Three is a habit, not a rule.', 'A padded or off-topic third paragraph weakens the essay.', 'Two strong paragraphs, or a real third reason, is better.'] };
  });

  // beyond five: scenarios
  var BEYOND = [
    ['A writer’s first reason has so much evidence that it fills two full pages.', 'Split it into two or three paragraphs under one section.', ['Cut most of the evidence so it fits one paragraph.', 'Move half of it to the conclusion.']],
    ['An argument has one strong objection that readers will surely raise.', 'Add a paragraph that states the objection fairly and answers it.', ['Leave it out so readers don’t think of it.', 'Mention it in the last sentence of the essay.']],
    ['Readers need to know what a “floodplain” is before the argument makes sense.', 'Add a short background paragraph before the reasons.', ['Define it in the conclusion.', 'Skip it; readers can look it up.']],
    ['A writer’s second point only makes sense after the reader knows the first.', 'Put the point the other depends on first.', ['Put the points in alphabetical order.', 'Put the shortest point first.']],
    ['The essay has four different, strong reasons.', 'Write four body sections: one for each reason.', ['Drop the weakest reason so there are exactly three.', 'Combine two unrelated reasons into one paragraph.']],
    ['A conclusion only repeats the thesis and the three reasons in the same order.', 'Have it show why the argument matters or what should happen next.', ['Add a new reason in the last paragraph.', 'Copy the introduction into the conclusion.']],
    ['Two of a writer’s three reasons are weak, and one is very strong.', 'Give the strong reason the most space, and cut or shorten the weak ones.', ['Give all three reasons exactly the same length.', 'Put the strong reason in the introduction only.']],
    ['An essay compares two plans, and readers need to see them side by side.', 'Organize it by points of comparison, discussing both plans under each point.', ['Write about only one plan.', 'Put the comparison in the conclusion only.']],
    ['A research essay draws on four sources that sometimes disagree.', 'Add a section that explains where the sources disagree and what the writer concludes.', ['Use only the sources that agree with you and ignore the rest.', 'List the four sources and stop.']],
    ['A writer’s strongest piece of evidence is a long story that needs room to explain.', 'Give the story its own paragraph, then explain what it shows.', ['Squeeze it into one sentence of the introduction.', 'Leave it out because it is long.']]
  ];
  // [the point another depends on, the point that depends on it]
  var DEPENDS = [
    ['The creek floods every spring.', 'Building houses on the floodplain would put families at risk.'],
    ['Most students in our survey walk to school.', 'A crosswalk near the school would protect the largest group of students.'],
    ['The library is the only quiet public place to study in town.', 'Closing the library on Sundays leaves students with nowhere to study that day.'],
    ['Bees carry the pollen many fruit crops need.', 'Losing bees would shrink the harvest at our local orchards.'],
    ['Our cafeteria throws away about ten bags of food scraps a day.', 'A compost program would turn that waste into soil for the garden.'],
    ['Skaters now ride in the grocery store parking lot.', 'A skate park would move skaters away from cars.']
  ];
  G('comp.beyond-five', function (R, ctx) {
    var b = R.pick(BEYOND), shape = ML.byLevel(ctx, R.pick(['tf', 'first']), R.pick(['plan', 'first']), R.pick(['plan', 'true', 'first']));
    if (shape === 'first') {
      var d = R.pick(DEPENDS), sw = R.coin(), A = sw ? d[1] : d[0], B = sw ? d[0] : d[1];
      return { q: q([para('Two points in an argument essay. Which should come first?'), quote('A. ' + A), quote('B. ' + B)]), a: mcK(['A', 'B'], sw ? 1 : 0),
        hint: 'Does one point only make sense after the reader knows the other?',
        steps: ['“' + d[1] + '” depends on “' + d[0] + '”', 'Put the point the other depends on first: ' + (sw ? 'B' : 'A') + '.'] };
    }
    if (shape === 'tf') {
      var claims = [['Every essay must have exactly five paragraphs.', false], ['The number of body paragraphs should depend on the argument.', true], ['A longer essay may give one reason several paragraphs.', true], ['An argument essay never mentions the other side.', false], ['A paragraph of background can come before the reasons.', true], ['Every body paragraph must be exactly the same length.', false], ['A conclusion can suggest a next step or show why the argument matters.', true], ['An essay must always have exactly three reasons.', false]];
      var c = R.pick(claims);
      return { q: q([para('True or false?'), quote(c[0])]), a: { t: 'tf', v: c[1] },
        hint: 'The five-paragraph form is a starting point, not a rule.', steps: [c[1] ? 'True: the argument decides the shape.' : 'False: the five-paragraph form is scaffolding; real essays grow beyond it.'] };
    }
    if (shape === 'plan') {
      return { q: q([para('What should the writer do?'), quote(b[0])]), a: mc(b[1], b[2]),
        hint: 'Let the argument, not a formula, decide the shape.', steps: ['The best plan: ' + low(b[1]), 'The other choices force the essay into a formula or weaken it.'] };
    }
    var right = 'The number and order of paragraphs depend on what the argument needs.';
    return { q: q([para('Which statement about essays that grow beyond five paragraphs is true?')]), a: mc(right, R.sample(['Every body paragraph must be the same length.', 'There must always be exactly three reasons.', 'The other side should be mocked to make your side look stronger.', 'The conclusion must repeat the introduction word for word.', 'Background never belongs in an argument essay.'], 3)),
      hint: 'Think about what changes as subjects get harder.', steps: ['The argument decides the shape: how many sections, in what order, how long.', 'The other statements are habits or mistakes.'] };
  });

  /* ================================================================ Unit 5: Evidence and Sources */
  var EV_KINDS = ['Fact', 'Statistic', 'Example', 'Expert testimony', 'Anecdote'];
  var EV = [
    ['Water expands when it freezes.', 0], ['The library lends tools and board games as well as books.', 0], ['Bees carry pollen from flower to flower as they feed.', 0], ['The town’s only public pool closed in 2019.', 0],
    ['In our class survey, 18 of 25 students said they read before bed.', 1], ['About 72% of the students surveyed walk or bike to school.', 1], ['Three out of four families in the poll said they would use a Sunday library.', 1], ['Bus ridership on Route 4 rose by a third in two years.', 1],
    ['Last winter, the north parking lot flooded twice.', 2], ['When Lakeview School added a garden, a science class used it to study soil every week.', 2], ['The bridge on Route 9 closed twice last spring for repairs.', 2],
    ['According to a park ranger, feeding bread to ducks can harm them.', 3], ['A pediatrician explains that teens need eight to ten hours of sleep.', 3], ['The National Weather Service warns that lightning can strike miles from a storm.', 3],
    ['My uncle says he never wears a seat belt and has always been fine.', 4], ['My cousin got a stomachache after swimming in the lake once.', 4], ['My neighbor’s dog learned to sit in one day, so training is easy.', 4]
  ];
  // [general claim, evidence about many cases, an anecdote]
  var EV_FIT = [
    ['Most students at our school want a later start time.', 'In a survey of 300 students at our school, 210 said they want school to start later.', 'My friend Ava says she would love to sleep in.'],
    ['Students at our school read less in summer than during the school year.', 'Library records show our students borrowed half as many books in July as in March.', 'My brother didn’t read a single book last summer.'],
    ['Drivers often speed on Oak Street.', 'A city speed check found that two of every three cars on Oak Street went over the limit.', 'Yesterday I saw one car zoom down Oak Street.'],
    ['Dogs in our town need a place to run off leash.', 'The town has 1,200 licensed dogs and no fenced dog park.', 'My dog loves to run.'],
    ['Many families in our school use the bus.', 'Bus records show 340 of our 600 students ride a school bus.', 'My cousin takes the bus every day.']
  ];
  G('comp.evidence-types', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'kind2', R.pick(['kind', 'enough']), R.pick(['best', 'enough', 'kind']));
    if (shape === 'kind2' || shape === 'kind') {
      var e = R.pick(EV), set = [0, 1, 2, 3, 4];
      if (shape === 'kind2') { var o = R.pick(set.filter(function (k) { return k !== e[1]; })); set = [e[1], o].sort(); }
      return { q: q([para('What kind of evidence is this?'), quote(e[0])]), a: mcK(set.map(function (k) { return EV_KINDS[k]; }), set.indexOf(e[1])),
        hint: 'A number from counting? An expert speaking? One person’s story? A specific case? A checkable fact?',
        steps: ['It is ' + ['a fact that can be checked', 'a number that shows how common something is', 'one specific case that makes a point concrete', 'what an expert or an expert source says', 'one person’s story'][e[1]] + '.', 'Kind: ' + low(EV_KINDS[e[1]]) + '.'] };
    }
    var f = R.pick(EV_FIT);
    if (shape === 'enough') {
      var useAnec = R.coin(), ev = useAnec ? f[2] : f[1];
      return { q: q([para('Claim: <b>' + f[0] + '</b>'), para('Evidence:'), quote(ev), para('Is this evidence enough to support the claim?')]), a: mcK(YN, useAnec ? 1 : 0),
        hint: 'The claim is about many cases. Does the evidence cover many cases?',
        steps: useAnec ? ['The claim is general; the evidence is one person’s story (an anecdote).', 'One case can’t show what is true of most: that would be a hasty generalization. No.'] : ['The claim is general, and the evidence covers many cases.', 'It fits the claim: yes.'] };
    }
    return { q: q([para('Which evidence best supports this claim?'), quote(f[0])]), a: mc(f[1], [f[2], R.pick(EV.filter(function (x) { return x[1] === 4; }))[0]]),
      hint: 'A claim about many people needs evidence about many people.', steps: ['“' + f[1] + '” covers many cases, so it can support a general claim.', 'The others are single stories.'] };
  });

  // quotations (all sources invented for practice): [who (signal phrase), last name, quote, page, claim it supports, a good explanation]
  var QUOTES = [
    ['the researcher Maria Delgado', 'Delgado', 'students who slept nine hours recalled more of the previous day’s lesson', 205, 'Sleep helps students learn.', 'Sleep, in other words, helps students keep what they study.'],
    ['the gardener Ellen Marsh', 'Marsh', 'a single pot of tomatoes on a sunny step can feed a family all summer', 42, 'Even a small space can grow food.', 'If one pot can do that much, a whole windowsill of pots could make a real difference to a family’s table.'],
    ['the biologists Thomas Reyes and Anna Brandt', 'Reyes and Brandt', 'the dance is a map, and every bee in the hive can read it', 22, 'Bees share information with each other.', 'A map that the whole hive can read lets one bee’s discovery feed thousands.'],
    ['the ecologist Oliver Grant', 'Grant', 'on the hottest afternoons, a shaded sidewalk can feel like a different season', 118, 'Street trees make summer streets more comfortable.', 'If shade can change how a street feels that much, trees are worth planting where people walk.'],
    ['the writer Ruth Abernathy', 'Abernathy', 'the best ideas in a small town often start at the kitchen table', 63, 'Neighbors can solve local problems together.', 'Ordinary conversations, in other words, can be where real change begins.']
  ];
  function mlaCite(Q) { return Q[3] ? '(' + Q[1] + ' ' + Q[3] + ')' : '(' + Q[1] + ')'; }
  // fair and unfair trimming: [original, fair, unfair]
  var TRIMS = [
    ['The new park is popular, but it is not safe after dark.', 'The new park is popular, but … not safe after dark.', 'The new park is … safe after dark.'],
    ['The plan saves money in the first year, though it costs more over ten years.', 'The plan saves money in the first year, though it costs more over ten years.', 'The plan saves money … over ten years.'],
    ['Most students liked the new schedule, except for the earlier lunch.', 'Most students liked the new schedule, except for the earlier lunch.', 'Most students liked … the earlier lunch.'],
    ['The museum, which is usually crowded, was almost empty on Tuesday.', 'The museum … was almost empty on Tuesday.', 'The museum … is usually crowded … on Tuesday.']
  ];
  G('comp.quotations', function (R, ctx) {
    var Q = R.pick(QUOTES), shape = ML.byLevel(ctx, 'intro', R.pick(['intro', 'after']), R.pick(['trim', 'intro4', 'after']));
    var good = cap(Q[0]) + (/ and /.test(Q[1]) ? ' write' : ' writes') + ' that “' + Q[2] + '” ' + (Q[3] ? '(' + Q[3] + ')' : '') + '.';
    good = good.replace(' .', '.').replace('” .', '”.');
    var dropped = Q[4] + ' “' + cap(Q[2]) + '” ' + mlaCite(Q) + '.';
    var nocite = cap(Q[0]) + (/ and /.test(Q[1]) ? ' write' : ' writes') + ' that “' + Q[2] + '.”';
    var noquote = cap(Q[0]) + (/ and /.test(Q[1]) ? ' write' : ' writes') + ' that ' + Q[2] + '.';
    var note = para('<small>(The sources here are invented for practice.)</small>');
    if (shape === 'intro' || shape === 'intro4') {
      var wrong = shape === 'intro' ? [dropped] : [dropped, nocite, noquote];
      return { q: q([para('Which sentence uses the quotation best (MLA style)?'), note]), a: mc(good, wrong),
        hint: 'Introduce it, quote it exactly in quotation marks, and cite it.',
        steps: ['The right choice introduces the speaker with a signal phrase (“' + cap(Q[0]) + '”), quotes the words exactly and cites the page.', 'Dropping the quotation in with no introduction leaves the reader asking who said it.'].concat(shape === 'intro4' ? ['A quotation needs a citation, and exact words need quotation marks.'] : []) };
    }
    if (shape === 'after') {
      var wrongA = ['“' + cap(Q[2]) + '.”', 'Quotations make essays longer.', R.pick(QUOTES.filter(function (x) { return x !== Q; }))[5]];
      return { q: q([para('A body paragraph reads:'), quote(Q[4] + ' ' + good), para('Which sentence should come next?'), note]), a: mc(Q[5], wrongA),
        hint: 'After a quotation, explain what it shows and how it supports the point.',
        steps: ['“' + Q[5] + '” explains what the quotation shows.', 'Repeating the quotation, saying nothing, or switching to another topic leaves the evidence unexplained.'] };
    }
    var t = R.pick(TRIMS), fairFirst = R.coin();
    return { q: q([para('Original:'), quote(t[0]), para('Which shortened quotation is fair to the original?')]), a: mc(t[1], [t[2]]),
      hint: 'An ellipsis (…) may leave words out, but it must never change the meaning.',
      steps: ['“' + t[1] + '” keeps the original meaning.', '“' + t[2] + '” leaves out words in a way that changes the meaning: that misquotes the source.'] };
  });

  // passages to summarize (original, invented for practice): passage, a good summary, an opinion summary, a too-detailed copy, a wrong main idea
  var PASSAGES = [
    ['City parks do more than give people a place to play. Trees in a park cool the air around them on hot days. Parks also soak up rainwater that would otherwise rush into storm drains, and they give birds and insects a place to live. For these reasons, many planners now treat parks as part of a city’s basic equipment, like roads and pipes.',
     'Parks help cities in practical ways: they cool the air, absorb rain and shelter wildlife, so planners now count them as basic equipment.',
     'Parks are great and every city should build more, because going to the park is fun.',
     'City parks do more than give people a place to play. Trees in a park cool the air around them on hot days. Parks also soak up rainwater.',
     'Parks are mainly places for children to play games.'],
    ['Octopuses are surprisingly good problem-solvers. In aquariums, they have learned to unscrew jar lids to reach food inside. Some have slipped out of their tanks at night and returned before morning. In the wild, a few kinds carry coconut shells to use as shelters.',
     'Octopuses solve problems in clever ways, from opening jars and escaping tanks to carrying shells for shelter.',
     'Octopuses are creepy, and I would never want one in an aquarium near me.',
     'Octopuses are surprisingly good problem-solvers. In aquariums, they have learned to unscrew jar lids to reach food inside.',
     'Octopuses live only in aquariums.'],
    ['Many towns have stopped recycling glass. Glass is heavy, so shipping it to a plant that can use it is expensive. Broken glass can also mix with paper and plastic and ruin them. Some towns now collect glass separately, while others send it to landfills.',
     'Because glass is heavy to ship and can spoil other recycling, many towns have stopped recycling it or now collect it separately.',
     'Towns that stop recycling glass are being lazy and should be ashamed.',
     'Many towns have stopped recycling glass. Glass is heavy, so shipping it to a plant that can use it is expensive.',
     'Glass is the easiest material to recycle.'],
    ['Honeybees tell each other where to find food by dancing. A bee that has found flowers returns to the hive and moves in a figure-eight pattern. The angle of the dance points toward the flowers, and its length shows how far away they are. Other bees follow the dance and fly straight to the food.',
     'A honeybee shares where to find flowers through a dance whose angle shows the direction and whose length shows the distance.',
     'Bee dances are the most amazing thing in nature, and everyone should see one.',
     'Honeybees tell each other where to find food by dancing. A bee that has found flowers returns to the hive and moves in a figure-eight pattern.',
     'Bees dance mainly to keep warm in the hive.'],
    ['A good night’s sleep does more than rest the body. While we sleep, the brain sorts the day’s experiences and stores what it learned. Students who sleep well often remember lessons better. That is one reason doctors recommend that teens get eight to ten hours of sleep.',
     'Sleep helps the brain store what it learned, so students who sleep enough tend to remember lessons better.',
     'Sleep is boring, and I wish I didn’t need it.',
     'A good night’s sleep does more than rest the body. While we sleep, the brain sorts the day’s experiences.',
     'Sleep matters mainly because it helps people grow taller.']
  ];
  var SUM_LAB = ['It adds the writer’s own opinion.', 'It copies the source’s sentences and details instead of the main idea.', 'It gets the main idea wrong.', 'Nothing: it is a good summary.'];
  G('comp.summarizing', function (R, ctx) {
    var P = R.pick(PASSAGES), shape = ML.byLevel(ctx, 'best', R.pick(['best', 'label']), R.pick(['label', 'best4']));
    if (shape === 'best' || shape === 'best4') {
      var wrong = ctx.level === 1 ? [P[2], P[4]] : shape === 'best4' ? [P[2], P[3], P[4]] : [P[2], P[3]];
      return { q: q([para('Read the passage (written for practice):'), quote(P[0]), para('Which is the best summary?')]), a: mc(P[1], wrong),
        hint: 'A summary gives the main idea in your own words, much shorter, with no opinion added.',
        steps: ['“' + P[1] + '” gives the main idea in new words and leaves out minor details.', 'A summary that adds an opinion reports the writer, not the source.'].concat(ctx.level === 1 ? ['A summary that gets the main idea wrong misleads the reader.'] : ['Copying the first sentences retells details instead of the main idea.']) };
    }
    var k = R.int(0, 3), s = [P[2], P[3], P[4], P[1]][k];
    return { q: q([para('Passage (written for practice):'), quote(P[0]), para('A student’s summary:'), quote(s), para('What is the problem with the summary?')]), a: mcK(SUM_LAB, k),
      hint: 'Check three things: own words, the main idea, and no opinions.', steps: [SUM_LAB[k], k === 3 ? 'It gives the main idea, in new words, without opinions.' : 'A better summary: “' + P[1] + '”'] };
  });

  // paraphrases: [original, fair paraphrase, patchwriting (synonyms swapped, same structure), changed meaning]
  var PARAS_P = [
    ['Honeybees tell each other where flowers are by dancing: the angle of the dance shows the direction, and its length shows the distance.',
     'A bee that finds food reports its location with a dance; the dance’s angle points the way, and how long it lasts signals how far to fly.',
     'Honeybees inform one another where blossoms are by dancing: the angle of the dance indicates the direction, and its length shows the distance.',
     'Honeybees dance to tell each other how many flowers there are.'],
    ['Students who slept nine hours recalled more of the previous day’s lesson than students who slept six hours.',
     'The longer students slept, the more they remembered of what they had learned the day before.',
     'Students who slept nine hours remembered more of the prior day’s lesson than pupils who slept six hours.',
     'Students who slept six hours remembered more than students who slept nine hours.'],
    ['Trees in a city park cool the air around them, which can make nearby streets several degrees cooler on hot days.',
     'On a hot day, the shade and moisture of park trees can lower the temperature of the streets close by.',
     'Trees in a town park chill the air near them, which can make close streets several degrees cooler on warm days.',
     'City parks make the streets around them warmer on hot days.'],
    ['Glass is heavy, so shipping it to a plant that can recycle it often costs more than the glass is worth.',
     'Because of its weight, recycled glass is expensive to move, and the trip can cost more than the glass will sell for.',
     'Glass is weighty, so transporting it to a facility that can recycle it often costs more than the glass is worth.',
     'Glass is light, so it is cheap to ship to recycling plants.'],
    ['Octopuses in aquariums have learned to unscrew the lids of jars to reach the food inside.',
     'Kept in tanks, some octopuses figured out how to twist a jar open when food was sealed in it.',
     'Octopuses in aquariums have figured out how to unscrew the tops of jars to get the food inside.',
     'Octopuses in aquariums can’t open jars, even with food inside.'],
    ['Broken glass can mix with paper and plastic in a recycling truck and ruin them.',
     'When glass shatters among other recyclables, the shards can spoil the paper and plastic around them.',
     'Shattered glass can mix with paper and plastic in a recycling truck and spoil them.',
     'Paper and plastic can ruin glass in a recycling truck.'],
    ['Most students liked the new schedule, except for the earlier lunch period.',
     'Apart from lunch coming sooner, the new timetable was popular with the majority of students.',
     'Most pupils liked the new timetable, except for the earlier lunch period.',
     'Most students disliked the new schedule because lunch came later.'],
    ['While we sleep, the brain sorts the day’s experiences and stores what it learned.',
     'Sleep is when the brain files away the events and lessons of the day.',
     'While we rest, the brain organizes the day’s experiences and stores what it learned.',
     'While we sleep, the brain forgets most of what happened that day.'],
    ['A single pot of tomatoes on a sunny step can feed a family all summer.',
     'Even one tomato plant, given sun, can keep a household supplied through the summer months.',
     'A lone pot of tomatoes on a bright step can feed a household all summer.',
     'A family needs a large garden to grow enough tomatoes for one meal.']
  ];
  var PARA_LAB = ['Fair paraphrase (it still needs a citation)', 'Too close: patchwriting', 'It changes the meaning'];
  G('comp.paraphrasing', function (R, ctx) {
    var P = R.pick(PARAS_P), shape = ML.byLevel(ctx, 'fair', R.pick(['fair', 'label']), R.pick(['label', 'cite']));
    var share = function (v) { return Math.round(W().sharedRuns(P[0], v, 3).share * 100); };
    var note = para('<small>(Practice sentences written for this course.)</small>');
    if (shape === 'fair') {
      var wrong = ctx.level === 1 ? [P[2]] : [P[2], P[3]];
      return { q: q([para('Original:'), quote(P[0]), para('Which is a fair paraphrase?'), note]), a: mc(P[1], wrong),
        hint: 'A fair paraphrase changes both the words and the sentence structure, and keeps the meaning.',
        steps: ['“' + P[1] + '” keeps the meaning in new words and a new structure (' + share(P[1]) + '% of its words are in copied runs of three or more).', '“' + P[2] + '” swaps a few words but keeps the source’s structure: patchwriting (' + share(P[2]) + '% copied runs).'].concat(ctx.level === 1 ? [] : ['“' + P[3] + '” changes what the source says.']) };
    }
    if (shape === 'label') {
      var k = R.int(0, 2), v = P[k + 1];
      return { q: q([para('Original:'), quote(P[0]), para('A student’s version:'), quote(v), para('How would you judge it?'), note]), a: mcK(PARA_LAB, k),
        hint: 'Compare the structure and the meaning, phrase by phrase.',
        steps: [['It uses new words and a new structure, and keeps the meaning.', 'It keeps the source’s sentence structure and swaps in synonyms: ' + share(v) + '% of its words sit in runs of three or more copied words.', 'It says something the source does not say.'][k], k === 0 ? 'It still needs a citation.' : 'A fair paraphrase: “' + P[1] + '”'] };
    }
    var nmP = R.pick(NAMES);
    return { q: q([para(nmP + ' writes a fair paraphrase of this sentence, in completely new words and structure:'), quote(P[0]), para('What else does the paraphrase need?')]),
      a: mc('A citation of the source.', R.sample(['Quotation marks around the whole paraphrase.', 'Nothing: new words make the ideas the writer’s own.', 'A longer length than the original.', 'A list of synonyms for the words it changed.'], 3)),
      hint: 'Whose idea is it?', steps: ['The words are the student’s, but the idea came from the source.', 'Every paraphrase needs a citation. Quotation marks are only for exact words.'] };
  });

  // plagiarism situations: [what the writer does, needs a citation?, why]
  var PLAG = [
    ['quotes a sentence from a scientist’s article', 1, 'Exact words from a source need quotation marks and a citation.'],
    ['writes that water freezes at 0 °C', 0, 'That is common knowledge, found in any science book.'],
    ['summarizes a magazine story about a new bridge', 1, 'A summary reports someone else’s work.'],
    ['copies a chart from a government report into the essay', 1, 'Charts, images and data need credit too.'],
    ['describes her own first day at a new school', 0, 'Your own experiences are yours.'],
    ['rewrites an argument from a blog post in his own words', 1, 'The idea came from someone else, so a paraphrase needs a citation.'],
    ['states that George Washington was the first U.S. president', 0, 'That is common knowledge.'],
    ['uses a statistic about teen sleep from a CDC report', 1, 'A specific finding from one source needs a citation.'],
    ['gives his own opinion about the school lunch menu', 0, 'Your own opinions don’t need a citation.'],
    ['uses a surprising fact she found on one website', 1, 'A fact you learned from a particular source, not common knowledge, needs a citation.']
  ];
  G('comp.plagiarism', function (R, ctx) {
    var p = R.pick(PLAG), nm = R.pick(NAMES), shape = ML.byLevel(ctx, 'yn', R.pick(['yn', 'marks']), R.pick(['all', 'marks']));
    if (shape === 'yn') {
      return { q: q([para('Does this need a citation?'), quote('In an essay, ' + nm + ' ' + p[0] + '.')]), a: mcK(YN, p[1] ? 0 : 1),
        hint: 'Did the words, idea or data come from a particular source? Is it common knowledge?', steps: [p[2], p[1] ? 'Yes, cite it.' : 'No citation needed.'] };
    }
    if (shape === 'marks') {
      return { q: q([para('When does a writer need <b>quotation marks</b> as well as a citation?')]),
        a: mc('When using the source’s exact words.', ['When paraphrasing a passage in new words.', 'When summarizing a whole article.', 'When stating common knowledge.']),
        hint: 'Quotation marks show which words are someone else’s.', steps: ['Quotation marks go around a source’s exact words.', 'Paraphrases and summaries need a citation, but not quotation marks.'] };
    }
    var yes = R.sample(PLAG.filter(function (x) { return x[1]; }), 2), no = R.sample(PLAG.filter(function (x) { return !x[1]; }), 2);
    return { q: q([para('Which of these need a citation? Choose all that apply.')]), a: mcAll(R, yes.map(function (x) { return cap(x[0]) + '.'; }), no.map(function (x) { return cap(x[0]) + '.'; })),
      hint: 'Quotations, paraphrases, summaries, data and specific facts from a source need credit. Common knowledge and your own ideas don’t.',
      steps: yes.map(function (x) { return 'Cite: “' + cap(x[0]) + '.” ' + x[2]; }).concat(no.map(function (x) { return 'No citation: “' + cap(x[0]) + '.” ' + x[2]; })) };
  });

  // source credibility: [topic, strongest source, weaker sources]
  var CRED = [
    ['how much sleep teens need', 'a CDC report that cites the American Academy of Sleep Medicine', ['a mattress company’s blog post', 'an anonymous post on a homework forum', 'a video by someone selling sleep supplements']],
    ['how lightning forms', 'the National Weather Service’s page on lightning', ['a comment on a social media post', 'a page with no author or date', 'a game website’s trivia quiz']],
    ['the history of your town', 'the town historical society’s archive of newspapers', ['a fan page with no sources', 'a real-estate ad for a house in town', 'a story a friend heard from a cousin']],
    ['whether a new medicine works', 'a study published in a medical journal, written by doctors who name their methods', ['an ad from the company that sells it', 'a review on a shopping site', 'a forum post that says “it worked for me”']],
    ['how volcanoes erupt', 'the U.S. Geological Survey’s volcano pages', ['a movie about a volcano disaster', 'a page that ends every paragraph with a “Buy now” button', 'a post with no author, no date and no sources']]
  ];
  var CRED_Q = [['Who wrote it, and what do they know?', 'author'], ['What evidence does it give?', 'evidence'], ['When was it written?', 'date'], ['Why was it written: to inform, or to sell or persuade?', 'purpose'], ['Do other good sources agree?', 'agreement']];
  var CRED_SIGN = [['The author is named, with their training or job.', 0], ['Facts link to the studies they came from.', 0], ['Two independent, reliable sources report the same numbers.', 0], ['The page gives a recent date and says when it was updated.', 0],
    ['The page has no author, no date and no sources.', 1], ['Every paragraph ends with a “Buy now” button.', 1], ['It looks professional and was the first search result, but names no sources.', 1], ['The headline uses all capitals and says “Doctors HATE this!”', 1]];
  G('comp.source-credibility', function (R, ctx) {
    var c = R.pick(CRED), shape = ML.byLevel(ctx, 'best', R.pick(['best', 'sign']), R.pick(['which', 'best4', 'sign']));
    if (shape === 'best' || shape === 'best4') {
      var wrong = shape === 'best' ? R.sample(c[2], ctx.level === 1 ? 1 : 2) : c[2];
      var dot = function (x) { return /”$/.test(x) ? x.replace(/”$/, '.”') : x + '.'; };
      return { q: q([para('For a report on ' + c[0] + ', which source is most reliable?')]), a: mc(dot(cap(c[1])), wrong.map(function (x) { return dot(cap(x)); })),
        hint: 'Who made it, what evidence it gives, and why it was made.', steps: ['“' + cap(c[1]) + '” comes from people with real knowledge of the subject and shows where its facts came from.', 'The others have no clear author or evidence, or exist to sell or entertain.'] };
    }
    if (shape === 'sign') {
      var s = R.pick(CRED_SIGN);
      return { q: q([para('Is this a sign of trust or a warning sign?'), quote(s[0])]), a: mcK(['A sign of trust', 'A warning sign'], s[1]),
        hint: 'Looks and search rank don’t show accuracy; named authors and sources do.', steps: [s[1] ? 'It is a warning sign: it gives no reason to trust the facts.' : 'It is a sign of trust: you can check who made it and where the facts came from.'] };
    }
    var k = R.int(0, 4), wants = ['whether the author knows the subject', 'whether the facts are backed up', 'whether the information is up to date', 'whether the source exists to sell or persuade', 'whether the facts hold up elsewhere'];
    return { q: q([para('Which question checks ' + wants[k] + '?')]), a: mcK(CRED_Q.map(function (x) { return x[0]; }), k),
      hint: 'Each question checks one thing about a source.', steps: ['“' + CRED_Q[k][0] + '” checks ' + wants[k] + '.'] };
  });

  // research questions: [topic, research question, one-fact question, too broad]
  var RQ = [
    ['ocean plastic', 'How does plastic in the ocean affect sea turtles?', 'How deep is the Pacific Ocean?', 'What about the ocean?'],
    ['sleep', 'How does screen time before bed affect how teens sleep?', 'How many hours do teens sleep on average?', 'What is sleep?'],
    ['bridges', 'Why are some bridges built as suspension bridges and others as arch bridges?', 'When was the Golden Gate Bridge built?', 'Bridges?'],
    ['recycling', 'Why do some towns stop recycling glass, and what happens to the glass instead?', 'What year did our town start recycling?', 'What about recycling?'],
    ['Mount Everest', 'How has climbing Mount Everest changed since the 1950s?', 'How tall is Mount Everest?', 'Tell me about mountains.'],
    ['email', 'How did email change the way offices work?', 'When was the first email sent?', 'What is technology?'],
    ['bees', 'Why are honeybee colonies important to fruit farmers?', 'How many legs does a bee have?', 'What are insects?'],
    ['school lunches', 'How do longer lunch periods affect how much students eat?', 'What time does lunch start at our school?', 'What about food?'],
    ['volcanoes', 'How do scientists predict when a volcano will erupt?', 'What is the tallest volcano on Earth?', 'Tell me about Earth.'],
    ['city trees', 'How do street trees change summer temperatures in cities?', 'How many trees are on Main Street?', 'What about nature?'],
    ['the telegraph', 'How did the telegraph change the way newspapers reported events?', 'Who invented the telegraph?', 'What is communication?']
  ];
  // research notes: [the useful note, weaker notes]
  var NOTES = [
    ['“Glass is heavy, so shipping it far costs more than it earns.” (Liu, “Glass,” p. 4)', ['Glass is heavy and costs a lot to ship.', 'Some website said glass is expensive.', 'Glass: important!']],
    ['Sleep helps students remember lessons (Delgado 203), in my own words.', ['Teens need a lot of sleep.', 'I read somewhere that sleep matters.', 'Sleep!!!']],
    ['“The dance is a map” (Reyes and Brandt 22): bees share directions by dancing.', ['Bees dance.', 'A bee article said something about maps.', 'Cool fact about bees.']],
    ['Street trees can cool sidewalks on hot days (Grant 118; paraphrase).', ['Trees are cool.', 'Got this from a journal, I think.', 'Shade = good.']]
  ];
  G('comp.research-questions', function (R, ctx) {
    var r = R.pick(RQ), shape = ML.byLevel(ctx, 'which', R.pick(['which', 'problem']), R.pick(['note', 'problem', 'which3']));
    if (shape === 'which' || shape === 'which3') {
      var wrong = [r[2], r[3]];
      if (ctx.level === 2) wrong = [r[2], r[3]];
      return { q: q([para('Which is the best research question?')]), a: mc(r[1], wrong),
        hint: 'A research question is focused, and it needs several sources to answer well.', steps: ['“' + r[1] + '” is focused and needs several sources.', '“' + r[2] + '” can be answered with one fact.'].concat(wrong.length > 1 ? ['“' + r[3] + '” is far too broad or vague.'] : []) };
    }
    if (shape === 'problem') {
      var k = R.int(0, 2), s = [r[2], r[3], r[1]][k], lab = ['It can be answered with one fact.', 'It is too broad or vague.', 'Nothing: it is a good research question.'];
      return { q: q([para('A student’s research question:'), quote(s), para('Is there a problem?')]), a: mcK(lab, k),
        hint: 'Could one search answer it? Is it focused?', steps: [lab[k], k === 2 ? 'It is focused and needs several sources.' : 'A better question: “' + r[1] + '”'] };
    }
    var nt = R.pick(NOTES);
    return { q: q([para('Which research note is the most useful?'), para('<small>(The sources are invented for practice.)</small>')]),
      a: mc(nt[0], nt[1]),
      hint: 'A good note records the idea and exactly where it came from.', steps: ['The best note gives the idea and the source and page, so you can cite it later and avoid accidental plagiarism.'] };
  });

  /* ================================================================ Unit 6: Citing Sources */
  function SRCS() { return W().SOURCES.concat(EXTRA_SOURCES); }
  // more invented sources for practice (all names, titles and publishers are made up; .example addresses)
  var EXTRA_SOURCES = [
    { type: 'book', authors: [{ first: 'Ruth', last: 'Abernathy' }], title: 'Small Towns, Big Ideas', sub: 'How Neighbors Solve Problems', sc: 'Small towns, big ideas: How neighbors solve problems', publisher: 'Fieldstone Press', year: 2018, page: 63, short: 'Small Towns' },
    { type: 'book', authors: [{ first: 'Hana', last: 'Kim' }, { first: 'Luis', last: 'Ortega' }, { first: 'Ada', last: 'Price' }], title: 'The Science of Snow', sc: 'The science of snow', publisher: 'Northlight Books', year: 2020, page: 88, short: 'Science of Snow' },
    { type: 'journal', authors: [{ first: 'Oliver', last: 'Grant' }], title: 'Shade Trees and Summer Heat on City Streets', sc: 'Shade trees and summer heat on city streets', container: 'Urban Ecology Letters', vol: 6, issue: 2, year: 2019, pages: '112–130', page: 118, short: 'Shade Trees' },
    { type: 'web', authors: [{ first: 'Nadia', last: 'Faris' }], title: 'Why Some Towns Stop Recycling Glass', sc: 'Why some towns stop recycling glass', site: 'Green Street Journal', year: 2022, month: 3, day: 14, url: 'https://greenstreet.example/glass', short: 'Recycling Glass' }
  ];
  var SHORT = ['Quiet Garden', 'Rivers of the Prairie', 'Sleep and Memory', 'Why Bees Dance', 'Neighborhood Library', 'Clouds That Warn'];
  function srcAt(i) { var s = SRCS()[i]; return s; }
  function shortTitle(s, i) { return s.short || SHORT[i]; }
  function fullT(s) { return s.sub ? s.title + ': ' + s.sub : s.title; }
  function lasts(s) { var A = s.authors; return A.length === 1 ? A[0].last : A.length === 2 ? A[0].last + ' and ' + A[1].last : A[0].last + ' et al.'; }
  function showPart(t) { t = String(t).replace(/[.,]+$/, ''); return /^“/.test(t) ? t.replace(/[.,]?”$/, '”') : '“' + t + '”'; }
  function partsHTML(P) { return P.map(function (p) { return p.i ? '<i>' + esc(p.t) + '</i>' : esc(p.t); }).join(''); }
  function clone(P) { return P.map(function (p) { return { k: p.k, t: p.t, i: p.i }; }); }
  function uniq(list, right) { var out = []; list.forEach(function (x) { if (x && x !== right && out.indexOf(x) < 0) out.push(x); }); return out; }
  var SRC_NOTE = para('<small>(An invented source, for practice.)</small>');
  function describe(s) {
    var nmz = s.authors.map(function (a) { return [a.first, a.middle, a.last].filter(Boolean).join(' '); }), who = nmz.length === 1 ? nmz[0] : nmz.slice(0, -1).join(', ') + ' and ' + nmz[nmz.length - 1];
    if (s.type === 'book') return 'A book by ' + who + ': <i>' + fullT(s) + '</i>' + (s.edition ? ', ' + s.edition + 'nd edition' : '') + ', published by ' + s.publisher + ' in ' + s.year + '.';
    if (s.type === 'journal') return 'An article by ' + who + ', “' + fullT(s) + ',” in the journal <i>' + s.container + '</i>, volume ' + s.vol + ', issue ' + s.issue + ', ' + s.year + ', pages ' + s.pages + '.';
    return 'A web page by ' + who + ', “' + fullT(s) + ',” on the website <i>' + s.site + '</i>, ' + ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][s.month - 1] + ' ' + s.day + ', ' + s.year + '.';
  }

  var FIELDS = [['an English paper on a novel', 0], ['a report for a literature class', 0], ['a paper on a poem for a French class', 0], ['an essay on a play for an English class', 0], ['a paper comparing two short stories', 0], ['a report on a Spanish novel for a language class', 0],
    ['a psychology report on memory', 1], ['an education paper on homework', 1], ['a social science study of how families use parks', 1], ['a sociology paper on how teens use phones', 1], ['a psychology lab report on reaction times', 1], ['an education study of reading programs', 1],
    ['a history paper on the Civil War', 2], ['an art history paper on a painter', 2], ['a book manuscript for a publisher', 2], ['a history paper on the transcontinental railroad', 2], ['a music history paper on jazz in the 1920s', 2], ['a history report on an old town newspaper', 2]];
  var STYLE3 = ['MLA', 'APA', 'Chicago'];
  G('comp.why-cite', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['field', 'edition', 'which']), R.pick(['field', 'edition', 'which']), R.pick(['which', 'edition', 'true']));
    if (shape === 'field') {
      var f = R.pick(FIELDS);
      return { q: q([para('Which citation style is most likely for ' + f[0] + '?')]), a: mcK(STYLE3, f[1]),
        hint: 'MLA: literature and languages. APA: psychology and the social sciences. Chicago: history, the arts and publishing.',
        steps: ['For ' + f[0] + ', the usual style is ' + STYLE3[f[1]] + '.'] };
    }
    if (shape === 'edition') {
      var e = R.pick([['MLA Handbook', '9th edition (2021)', ['8th edition (2016)', '7th edition (2009)', '6th edition (2003)']], ['APA Publication Manual', '7th edition (2020)', ['6th edition (2010)', '5th edition (2001)', '4th edition (1994)']], ['Chicago Manual of Style', '18th edition (2024)', ['17th edition (2017)', '16th edition (2010)', '15th edition (2003)']]]);
      return { q: q([para('Which is the current edition of the ' + e[0] + '?')]), a: mc(e[1], R.sample(e[2], ctx.level === 1 ? 2 : 3)),
        hint: 'MLA 9, APA 7, Chicago 18.', steps: ['The current ' + e[0] + ' is the ' + e[1] + '.', 'Older editions differ in some rules, so check which edition a guide follows.'] };
    }
    if (shape === 'which') {
      var i = R.int(0, 5), s = srcAt(i), k = R.int(0, 2), form = [W().citeText(s, 'mla', 'intext'), W().citeText(s, 'apa', 'intext'), 'a small raised number¹ in the text, with the source in a footnote'][k];
      return { q: q([para('Which style uses this kind of in-text citation?'), quote(form), SRC_NOTE]), a: mcK(STYLE3, k),
        hint: 'Author and page: MLA. Author and date: APA. Numbered notes: Chicago.',
        steps: [['Author and page, no comma: MLA.', 'Author, then the year (and a page with p.): APA.', 'A number pointing to a footnote: Chicago’s notes and bibliography.'][k]] };
    }
    var right = R.pick(['Use one citation style for a whole paper.', 'MLA in-text citations give the author and the page.', 'APA puts the year of publication near the front of each reference.', 'Chicago’s notes and bibliography system uses numbered footnotes or endnotes.']);
    return { q: q([para('Which statement is true?')]), a: mc(right, R.sample(['It is fine to mix MLA and APA in one paper.', 'The newest MLA Handbook is the 8th edition.', 'APA in-text citations give only a page number.', 'Chicago never uses footnotes.', 'Any edition of a style guide is as current as any other.'], 3)),
      hint: 'Think of each style’s current edition and what it puts in the text.', steps: ['True: “' + right + '”', 'The others are mistakes: mixing styles, out-of-date editions, or the wrong pattern.'] };
  });

  // MLA works-cited entries: the right one (from cite) and wrong ones made by changing one thing
  function mlaVariants(s) {
    var P = W().cite(s, 'mla'), right = partsHTML(P), out = [];
    var nm = clone(P); nm.forEach(function (p) { if (p.k === 'author') p.t = s.authors[0].first + ' ' + s.authors[0].last + (s.authors.length > 1 ? (s.authors.length === 2 ? ' and ' + s.authors[1].first + ' ' + s.authors[1].last : ' et al') : '') + '.'; }); out.push(['first name first', partsHTML(nm)]);
    if (s.type === 'book') {
      var b = clone(P); b.forEach(function (p) { if (p.k === 'title') { p.i = false; p.t = '“' + p.t + '.”'; } }); for (var j = 0; j < b.length; j++) if (b[j].k === 'title' && b[j + 1] && b[j + 1].k === 'sep') b[j + 1].t = ' ';
      out.push(['book title in quotation marks', partsHTML(b)]);
    } else {
      var sw = clone(P); sw.forEach(function (p, ix) { if (p.k === 'title') { p.i = true; p.t = fullT(s) + '.'; } else if (p.k === 'container') { p.i = false; p.t = '“' + p.t + ',”'; if (sw[ix + 1] && sw[ix + 1].t === ', ') sw[ix + 1].t = ' '; } }); out.push(['italics on the wrong title', partsHTML(sw)]);
      var nc = []; for (var k = 0; k < P.length; k++) { if (P[k].k === 'container') { k++; continue; } nc.push(P[k]); } out.push(['no container', partsHTML(nc)]);
    }
    return { right: right, wrong: out.filter(function (x) { return x[1] !== right; }) };
  }
  G('comp.mla-works-cited', function (R, ctx) {
    var i = R.int(0, SRCS().length - 1), s = srcAt(i), shape = ML.byLevel(ctx, R.pick(['italic', 'entry']), R.pick(['entry', 'container']), R.pick(['entry4', 'container', 'part']));
    if (shape === 'italic') {
      var nonBook = s.type !== 'book';
      if (!nonBook) return { q: q([para('In an MLA Works Cited entry for a whole book, how is the book’s title written?')]), a: mc('In italics', ['In quotation marks', 'In plain type, underlined', 'In capital letters']),
        hint: 'A whole book stands alone.', steps: ['A whole book is not inside a container, so its title is italicized.', 'Example: ' + W().citeHTML(s, 'mla')] };
      return { q: q([para('In an MLA entry for ' + (s.type === 'journal' ? 'a journal article' : 'a page on a website') + ', which title is italicized?')]), a: mc('The ' + (s.type === 'journal' ? 'journal’s' : 'website’s') + ' name (the container)', ['The ' + (s.type === 'journal' ? 'article’s' : 'page’s') + ' title', 'Both titles', 'Neither title']),
        hint: 'A piece inside a container goes in quotation marks; the container gets italics.', steps: ['The ' + (s.type === 'journal' ? 'article' : 'page') + ' is inside a container, so its title goes in quotation marks.', 'The container is italicized: ' + W().citeHTML(s, 'mla')] };
    }
    if (shape === 'entry' || shape === 'entry4') {
      var V = mlaVariants(s), wrong = R.sample(V.wrong, Math.min(shape === 'entry' && ctx.level === 1 ? 1 : 3, V.wrong.length)), LT = lettered(R, V.right, wrong.map(function (x) { return x[1]; }));
      return { q: q([para('Which is the correct MLA (9th edition) Works Cited entry?'), para(describe(s)), LT.html, SRC_NOTE]), a: LT.a,
        hint: 'Author (last name first), title of the source, container in italics, then the details in order.',
        steps: ['The correct entry is ' + LT.letter + ': ' + V.right, 'The others have a mistake: ' + wrong.map(function (x) { return x[0]; }).join('; ') + '.'] };
    }
    if (shape === 'container') {
      var nb = SRCS().filter(function (x) { return x.type !== 'book'; }), t = R.pick(nb), cont = t.container || t.site;
      return { q: q([para('In this MLA entry, what is the <b>container</b>?'), quote(W().citeHTML(t, 'mla')), SRC_NOTE]), a: mc(cont, ['“' + fullT(t) + '”', t.authors[0].last, String(t.year)]),
        hint: 'The container is the larger work that holds the source.', steps: ['The ' + (t.type === 'journal' ? 'article' : 'page') + ' “' + fullT(t) + '” is inside <i>' + cont + '</i>.', 'So the container is <i>' + cont + '</i>, in italics.'] };
    }
    var P = W().cite(s, 'mla'), keys = P.filter(function (p) { return p.k !== 'sep'; }).map(function (p) { return p.k; }), key = R.pick(keys);
    var names = W().PART_NAMES, wrongK = R.sample(keys.filter(function (k) { return k !== key; }), Math.min(3, keys.length - 1));
    ['container', 'publisher', 'date', 'title'].forEach(function (k) { if (wrongK.length < 3 && k !== key && wrongK.indexOf(k) < 0) wrongK.push(k); });
    return { q: q([para('What is the outlined part of this MLA entry?'), SRC_NOTE]), a: mc(cap(names[key]), wrongK.map(function (k) { return cap(names[k]); })),
      viz: { name: 'wr-cite', opts: { source: s, style: 'mla', mode: 'ask', ask: key, quiet: true } },
      hint: 'Use the order of MLA’s core elements: author, title of source, container, … publisher, date, location.',
      steps: ['The outlined part is ' + showPart(P.filter(function (p) { return p.k === key; })[0].t) + '.', 'It is the ' + names[key] + '.'] };
  });

  G('comp.mla-in-text', function (R, ctx) {
    var pool = SRCS().filter(function (x) { return x.page; }), s = R.pick(pool), shape = ML.byLevel(ctx, 'which', R.pick(['which', 'signal']), R.pick(['which4', 'signal', 'web']));
    var right = W().citeText(s, 'mla', 'intext'), L1 = s.authors[0].last, nm = lasts(s), pg = s.page;
    if (shape === 'which' || shape === 'which4') {
      var wrong = uniq(['(' + nm + ', ' + pg + ')', '(' + nm + ', p. ' + pg + ')', '(' + nm + ', ' + s.year + ', p. ' + pg + ')', '(' + s.authors[0].first + ' ' + L1 + ' ' + pg + ')'], right);
      wrong = ctx.level === 1 ? R.sample(wrong, 1) : shape === 'which4' ? wrong.slice(0, 3) : R.sample(wrong.slice(0, 3), 2);
      return { q: q([para('You quote page ' + pg + ' of this source. Which is the correct MLA in-text citation?'), para(describe(s)), SRC_NOTE]), a: mc(right, wrong),
        hint: 'MLA: the author’s last name and the page, with no comma and no “p.”', steps: ['Last name' + (s.authors.length > 1 ? 's' : '') + ': ' + nm + '. Page: ' + pg + '.', 'No comma, no “p.”: ' + right + '.'] };
    }
    if (shape === 'signal') {
      var lead = nm + (s.authors.length === 1 ? ' explains' : ' explain') + ' that this idea matters';
      return { q: q([para('The author is already named in the sentence. How should the MLA citation look?'), SRC_NOTE]), a: mc(lead + ' (' + pg + ').', [lead + ' (' + nm + ' ' + pg + ').', lead + ' (p. ' + pg + ').', lead + '. (' + pg + ')']),
        hint: 'When the sentence names the author, the parentheses hold only the page, before the period.', steps: ['The name is in the sentence, so give only the page: (' + pg + ').', 'It goes before the final period.'] };
    }
    var w = R.pick(SRCS().filter(function (x) { return x.type === 'web'; })), rw = W().citeText(w, 'mla', 'intext');
    return { q: q([para('A web page has no page numbers. Which MLA in-text citation is correct?'), para(describe(w)), SRC_NOTE]), a: mc(rw, ['(' + w.authors[0].last + ', n.p.)', '(' + w.authors[0].last + ' ' + w.year + ')', '(' + w.site + ')']),
      hint: 'Leave out what the source doesn’t have.', steps: ['With no page numbers, MLA gives just the author: ' + rw + '.'] };
  });

  function apaTitleCase(s) { return fullT(s); }
  G('comp.apa', function (R, ctx) {
    var s = R.pick(SRCS()), shape = ML.byLevel(ctx, 'intext', R.pick(['intext', 'case']), R.pick(['ref', 'case', 'two']));
    if (shape === 'intext') {
      var ps = s.page ? s : R.pick(SRCS().filter(function (x) { return x.page; }));
      var right = W().citeText(ps, 'apa', 'intext'), A = ps.authors, an = A.length === 1 ? A[0].last : A.length === 2 ? A[0].last + ' & ' + A[1].last : A[0].last + ' et al.';
      var wrong = uniq(['(' + an + ' ' + ps.page + ')', '(' + an + ', p. ' + ps.page + ', ' + ps.year + ')', '(' + A[0].first + ' ' + A[0].last + (A.length > 1 ? ' et al.' : '') + ', ' + ps.year + ', p. ' + ps.page + ')'], right);
      if (ctx.level === 1) wrong = wrong.slice(0, 2);
      return { q: q([para('You quote page ' + ps.page + '. Which is the correct APA (7th edition) in-text citation?'), para(describe(ps)), SRC_NOTE]), a: mc(right, wrong),
        hint: 'APA: author, year, page (with p.), separated by commas.', steps: ['Author: ' + an.replace(/\.$/, '') + '. Year: ' + ps.year + '. Page: p. ' + ps.page + '.', 'So: ' + right + '.'] };
    }
    if (shape === 'case') {
      var sc = W().sentenceCase(s), tc = apaTitleCase(s), lowAll = fullT(s).toLowerCase();
      return { q: q([para('How does the title of this ' + (s.type === 'journal' ? 'article' : s.type === 'web' ? 'web page' : 'book') + ' appear in an APA reference entry?'), quote(fullT(s)), SRC_NOTE]), a: mc(sc, uniq([tc, lowAll, fullT(s).toUpperCase()], sc).slice(0, ctx.level === 1 ? 1 : 2)),
        hint: 'APA uses sentence case: capitalize the first word, the first word after a colon, and proper nouns.', steps: ['Sentence case keeps only the first word' + (s.sub ? ', the first word after the colon' : '') + ' and any proper nouns capitalized.', 'So: ' + sc + '.'] };
    }
    if (shape === 'two') {
      var two = R.pick(SRCS().filter(function (x) { return x.authors.length === 2; })), a1 = two.authors[0].last, a2 = two.authors[1].last;
      var inParen = R.coin();
      return inParen
        ? { q: q([para('In APA, how do you cite a source by ' + a1 + ' and ' + a2 + ' (' + two.year + ') inside parentheses?'), SRC_NOTE]), a: mc('(' + a1 + ' & ' + a2 + ', ' + two.year + ')', ['(' + a1 + ' and ' + a2 + ', ' + two.year + ')', '(' + a1 + ' et al., ' + two.year + ')', '(' + a1 + ' & ' + a2 + ' ' + two.year + ')']),
            hint: 'Inside parentheses, APA joins two authors with &.', steps: ['In parentheses: an ampersand (&), then a comma before the year.'] }
        : { q: q([para('In APA, how do you name a source by ' + a1 + ' and ' + a2 + ' (' + two.year + ') in your own sentence?'), SRC_NOTE]), a: mc(a1 + ' and ' + a2 + ' (' + two.year + ') found that…', [a1 + ' & ' + a2 + ' (' + two.year + ') found that…', a1 + ' and ' + a2 + ', ' + two.year + ', found that…', a1 + ' et al. (' + two.year + ') found that…']),
            hint: 'In your own sentence, write “and”; the year follows in parentheses.', steps: ['In running text APA uses “and,” with the year in parentheses right after the names.'] };
    }
    var P = W().cite(s, 'apa'), right2 = partsHTML(P), bad = [];
    var t1 = clone(P); t1.forEach(function (p) { if (p.k === 'title') p.t = s.type === 'journal' ? fullT(s) + '.' : fullT(s); }); bad.push(partsHTML(t1));
    var t2 = clone(P); t2.forEach(function (p) { if (p.k === 'author') p.t = s.authors.map(function (a) { return a.last + ', ' + a.first; }).join(', & '); }); bad.push(partsHTML(t2));
    var t3 = clone(P); var d = null; t3 = t3.filter(function (p, ix) { if (p.k === 'date') { d = p.t; return false; } return true; }); t3.push({ k: 'date', t: ' ' + d, i: false }); bad.push(partsHTML(t3));
    var LA = lettered(R, right2, uniq(bad, right2));
    return { q: q([para('Which is the correct APA (7th edition) reference entry?'), para(describe(s)), LA.html, SRC_NOTE]), a: LA.a,
      hint: 'Last name and initials, the date in parentheses after the author, the title in sentence case.',
      steps: ['The correct entry is ' + LA.letter + ': ' + right2, 'APA gives initials, puts the date right after the author, and uses sentence case for the title.'] };
  });

  function chiShortNote(s, i, page) { var t = shortTitle(s, i), tt = s.type === 'book' ? '<i>' + t + '</i>' : '“' + t + ',”'; return lasts(s) + ', ' + tt + (s.type === 'book' ? ', ' : ' ') + page + '.'; }
  G('comp.chicago', function (R, ctx) {
    var cands = SRCS().map(function (s, i) { return [s, i]; }).filter(function (x) { return x[0].authors.length <= 2 && x[0].page; });
    var pick = R.pick(cands), s = pick[0], i = pick[1], shape = ML.byLevel(ctx, R.pick(['kind', 'ibid']), R.pick(['kind', 'short', 'ibid']), R.pick(['short4', 'ibid2', 'bib']));
    var note = W().citeHTML(s, 'chicago', 'note'), bib = W().citeHTML(s, 'chicago');
    if (shape === 'kind') {
      var isNote = R.coin();
      return { q: q([para('Is this a Chicago note or a bibliography entry?'), quote(isNote ? '1. ' + note : bib), SRC_NOTE]), a: mcK(['A note', 'A bibliography entry'], isNote ? 0 : 1),
        hint: 'Notes give the name in reading order, with commas; the bibliography inverts the first name and uses periods.',
        steps: isNote ? ['The name is in normal order (first name first), the parts are joined by commas, and it ends with a page number.', 'It is a note.'] : ['The first author’s name is inverted (last name first), and periods separate the main parts.', 'It is a bibliography entry.'] };
    }
    var later = s.page + R.int(3, 30), shortN = chiShortNote(s, i, later);
    if (shape === 'short' || shape === 'short4') {
      var wrong = ['Ibid., ' + later + '.', note.replace(/, (\d+)([.,])/, ', ' + later + '$2'), lasts(s) + ', ' + later + '.'];
      wrong = shape === 'short' ? wrong.slice(0, 2) : wrong;
      var LS = lettered(R, shortN, uniq(wrong, shortN));
      return { q: q([para('Note 1 cites this source in full. Note 4 (after notes about other sources) cites it again, page ' + later + '. Following Chicago 18, what should note 4 say?'), quote('1. ' + note), LS.html, SRC_NOTE]), a: LS.a,
        hint: 'After the first full note, use a shortened note: last name, short title, page.',
        steps: ['A shortened note gives the author’s last name, a short form of the title and the page.', 'So: ' + LS.letter + ', ' + shortN, 'Ibid. would point to note 3, a different source.'] };
    }
    if (shape === 'ibid' || shape === 'ibid2') {
      var between = shape === 'ibid2' || R.coin();
      if (between) return { q: q([para('Note 5 cites a book by ' + s.authors[0].last + '. Note 6 cites a different source. Note 7 cites ' + s.authors[0].last + ' again. Can note 7 say “Ibid.”?'), SRC_NOTE]), a: mcK(YN, 1),
        hint: 'Ibid. means “in the same place”: the source of the note just before.', steps: ['Ibid. always points to the note immediately before (note 6), a different source.', 'No. Use a shortened note, which Chicago 18 prefers anyway: ' + shortN] };
      return { q: q([para('Chicago 18 discourages one way of citing the same source again. Which does it prefer?'), SRC_NOTE]), a: mc('A shortened note: the author’s last name, a short title and the page', ['“Ibid.” in every later note', 'The full note again, every time', 'No note at all after the first one']),
        hint: 'The 18th edition recommends the form that names the source.', steps: ['Chicago 18 discourages Ibid. and prefers shortened notes, which name the author and title.', 'For example: ' + shortN] };
    }
    if (s.authors.length > 1) { s = srcAt(0); i = 0; note = W().citeHTML(s, 'chicago', 'note'); bib = W().citeHTML(s, 'chicago'); if (R.coin()) { s = EXTRA_SOURCES[0]; i = 6; note = W().citeHTML(s, 'chicago', 'note'); bib = W().citeHTML(s, 'chicago'); } }
    var wrongB = [note, bib.replace(/^([^,]+), ([^.]+)\./, '$2 $1.'), bib.replace(/\. /g, ', ')];
    var LB = lettered(R, bib, uniq(wrongB, bib));
    return { q: q([para('Which is the correct Chicago (18th edition) bibliography entry?'), para(describe(s)), LB.html, SRC_NOTE]), a: LB.a,
      hint: 'Bibliography: last name first, periods between the main parts, no page cited.', steps: ['The correct entry is ' + LB.letter + ': ' + bib, 'A note uses commas and the name in normal order; a bibliography entry inverts the first name and uses periods.'] };
  });

  G('comp.citation-parts', function (R, ctx) {
    var s = R.pick(SRCS()), style = R.pick(['mla', 'apa', 'chicago']), shape = ML.byLevel(ctx, 'ask', R.pick(['ask', 'name']), R.pick(['ask', 'vol', 'name']));
    var P = W().cite(s, style), names = W().PART_NAMES, keys = P.filter(function (p) { return p.k !== 'sep'; }).map(function (p) { return p.k; });
    var styleName = { mla: 'MLA', apa: 'APA', chicago: 'Chicago' }[style];
    if (shape === 'ask') {
      var key = R.pick(keys), wrongK = R.sample(keys.filter(function (k) { return k !== key; }), Math.min(ctx.level === 1 ? 2 : 3, keys.length - 1));
      return { q: q([para('What is the outlined part of this ' + styleName + ' citation?'), SRC_NOTE]), a: mc(cap(names[key]), wrongK.map(function (k) { return cap(names[k]); })),
        viz: { name: 'wr-cite', opts: { source: s, style: style, mode: 'ask', ask: key, quiet: true } },
        hint: 'Use the clues: quotation marks, italics, numbers, a date, a link.',
        steps: ['The outlined part is ' + showPart(P.filter(function (p) { return p.k === key; })[0].t) + '.', 'It is the ' + names[key] + '.'] };
    }
    if (shape === 'vol') {
      var j = R.pick(SRCS().filter(function (x) { return x.type === 'journal'; })), st = R.pick(['mla', 'apa', 'chicago']), which = R.pick(['volume', 'issue']);
      return { q: q([para('In this ' + { mla: 'MLA', apa: 'APA', chicago: 'Chicago' }[st] + ' citation, what is the ' + which + ' number?'), quote(W().citeHTML(j, st)), SRC_NOTE]), a: mc(String(which === 'volume' ? j.vol : j.issue), uniq([String(which === 'volume' ? j.issue : j.vol), String(j.year), j.pages.split(/[–-]/)[0]], String(which === 'volume' ? j.vol : j.issue))),
        hint: 'MLA: vol. and no. APA: the italic number after the journal, then the issue in parentheses. Chicago: the number after the journal, then no.',
        steps: ['The volume is ' + j.vol + ' and the issue is ' + j.issue + '.', 'So the ' + which + ' is ' + (which === 'volume' ? j.vol : j.issue) + '.'] };
    }
    var nb = R.pick(SRCS().filter(function (x) { return x.type !== 'book'; })), cont = nb.container || nb.site, st2 = R.pick(['mla', 'apa', 'chicago']);
    var askC = R.coin();
    return { q: q([para('In this citation, what is the <b>' + (askC ? 'name of the ' + (nb.type === 'journal' ? 'journal' : 'website') + ' (the container)' : 'title of the ' + (nb.type === 'journal' ? 'article' : 'web page')) + '</b>?'), quote(W().citeHTML(nb, st2)), SRC_NOTE]),
      a: mc(askC ? cont : (st2 === 'apa' ? W().sentenceCase(nb) : fullT(nb)), [askC ? (st2 === 'apa' ? W().sentenceCase(nb) : fullT(nb)) : cont, nb.authors[0].last]),
      hint: 'The article or page sits inside the container; the container is the one in italics' + (st2 === 'apa' && nb.type === 'web' ? ' (in APA, a web page’s own title is italic)' : '') + '.',
      steps: ['The ' + (nb.type === 'journal' ? 'article' : 'page') + ' is “' + fullT(nb) + '”.', 'It appears in ' + cont + ', the container.'] };
  });

  /* ================================================================ Unit 7: Revising and Editing */
  var MOVES = ['Add', 'Cut', 'Move', 'Replace'];
  // [before, after, move, why]
  var REVS = [
    ['Recess should be longer. Students focus better after they move.', 'Recess should be longer. Students focus better after they move; our teachers report calmer afternoons after long recesses.', 0, 'It adds evidence to support the point.'],
    ['Bike lanes make streets safer. Riders are separated from cars.', 'Bike lanes make streets safer. Riders are separated from cars, and drivers can see them more easily.', 0, 'It adds a second reason.'],
    ['Our garden teaches science. My favorite vegetable is corn. Students measure how fast beans grow.', 'Our garden teaches science. Students measure how fast beans grow.', 1, 'It cuts a sentence that drifts off the point.'],
    ['The library should open on Sundays. The library building is a hundred years old. Students need a quiet place to study.', 'The library should open on Sundays. Students need a quiet place to study.', 1, 'It cuts a detail that doesn’t support the claim.'],
    ['In the end, the team won. The game started in the rain. The coach called a time-out in the second half.', 'The game started in the rain. The coach called a time-out in the second half. In the end, the team won.', 2, 'It moves the ending to the end, so events are in time order.'],
    ['Finally, rinse the brush. First, dip the brush in paint. Next, paint the fence.', 'First, dip the brush in paint. Next, paint the fence. Finally, rinse the brush.', 2, 'It moves the steps into time order.'],
    ['Recess is fun. Students focus better after they move.', 'Students who move during the day pay attention better in class. Students focus better after they move.', 3, 'It replaces a feeling with a reason.'],
    ['The trip was nice.', 'On the trip, we watched divers feed the sharks and touched a sea star.', 3, 'It replaces a vague sentence with specific details.'],
    ['Parks are good for cities in many ways.', 'Parks cool the air, soak up rain and shelter wildlife.', 3, 'It replaces a vague claim with specific points.']
  ];
  // [thesis, paragraph points, the one that doesn't belong]
  var REV_CUT = [
    ['Our school should start a composting program.', ['Composting cuts cafeteria waste.', 'Compost feeds the school garden.', 'Composting teaches science.'], 'The cafeteria was painted last year.'],
    ['Students should learn to cook.', ['Cooking saves money.', 'Cooking builds healthy habits.', 'Cooking teaches planning.'], 'Some famous chefs have TV shows.'],
    ['The town should build a skate park.', ['A skate park would keep skaters out of parking lots.', 'Teens need a place to meet.', 'Skaters from nearby towns would visit.'], 'Skateboards were invented in California.'],
    ['The library should open on Sundays.', ['Students need weekend study space.', 'Working parents are free on Sundays.', 'More hours would serve more people.'], 'The library building has a red door.']
  ];
  G('comp.revision', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['move', 'revise']), R.pick(['move', 'cut', 'revise']), R.pick(['cut', 'first', 'move']));
    if (shape === 'move') {
      var r = R.pick(REVS), L = ctx.level, set = [0, 1, 2, 3];
      if (L === 1) { var o = R.pick(set.filter(function (k) { return k !== r[2]; })); set = [r[2], o].sort(); }
      return { q: q([para('Before:'), quote(r[0]), para('After:'), quote(r[1]), para('Which revision move did the writer make?')]), a: mcK(set.map(function (k) { return MOVES[k]; }), set.indexOf(r[2])),
        viz: { name: 'wr-revise', opts: { before: r[0], after: r[1], quiet: true, interactive: false } },
        hint: 'Did the writer add something new, cut something, move something, or swap one thing for a better one?', steps: [r[3], 'The move: ' + low(MOVES[r[2]]) + '.'] };
    }
    if (shape === 'revise') {
      var act = R.pick(ACTS.filter(function (a) { return a[1] === 2; })), wr = R.sample(ACTS.filter(function (a) { return a[1] === 3; }), ctx.level === 1 ? 1 : 2);
      return { q: q([para('Which change is <b>revising</b> (not editing)?')]), a: mc('The writer ' + act[0] + '.', wr.map(function (x) { return 'The writer ' + x[0] + '.'; })),
        hint: 'Revising changes ideas, support or order. Editing fixes sentences.', steps: ['“The writer ' + act[0] + '” changes the ideas or their order: revising.', 'The others fix sentences: editing.'] };
    }
    if (shape === 'cut') {
      var c = R.pick(REV_CUT);
      return { q: q([para('Thesis: <b>' + c[0] + '</b> The draft’s body paragraphs make these points. Which paragraph should the writer cut?')]), a: mc(c[2], c[1]),
        hint: 'Which point doesn’t help prove the thesis?', steps: ['“' + c[2] + '” doesn’t support the thesis.', 'Cutting it makes the essay stronger, even if the sentences in it are well written.'] };
    }
    var items = ['Check that the thesis is clear and specific.', 'Check that every paragraph supports the thesis.', 'Check the order of the paragraphs.', 'Check that each sentence is clear.', 'Edit spelling and punctuation.'];
    var op = orderProblem(R, items, 3);
    return { q: q([para('Work from big to small. In what order should a writer make these checks? Which order of letters is right?')]), a: op.a, viz: op.viz,
      hint: 'Start with the whole essay’s main point. End with commas and spelling.',
      steps: ['Thesis, then support, then order, then clarity, then editing.', 'In letters: ' + op.code + '.'] };
  });

  // feedback: [comment, 0 useful | 1 too vague, what's missing (index into FB_LAB) ]
  var FB_LAB = ['It is too vague: it says neither where nor what to try.', 'It says where, but gives nothing to try.', 'It attacks the writer instead of commenting on the writing.', 'Nothing: it is specific, kind and something to act on.'];
  var FB = [
    ['Nice!', 1, 0], ['Good job!', 1, 0], ['It needs work.', 1, 0], ['This is confusing.', 1, 0], ['I didn’t like it.', 1, 0],
    ['Paragraph 3 is confusing.', 1, 1], ['Your ending is weak.', 1, 1], ['The evidence in paragraph 2 doesn’t convince me.', 1, 1],
    ['You are a bad writer.', 1, 2], ['You obviously didn’t try.', 1, 2],
    ['In paragraph 3, I couldn’t tell whether “they” meant the students or the teachers. Could you name them?', 0, 3],
    ['Your opening question made me want to keep reading. Could the next sentence say who Maya is?', 0, 3],
    ['Your thesis promises three reasons, but I found only two. Is there a third, or should the thesis change?', 0, 3],
    ['The last paragraph adds a new reason. Could it return to your thesis instead?', 0, 3],
    ['The dialogue in the first scene sounds like real people. Could the second scene use some too?', 0, 3],
    ['In paragraph 2, the only support is one story. A survey or a fact from a reliable source would make it stronger.', 0, 3]
  ];
  G('comp.feedback', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['best', 'uv']), R.pick(['best', 'uv']), R.pick(['label', 'best']));
    if (shape === 'best') {
      var good = R.pick(FB.filter(function (f) { return f[1] === 0; })), bad = R.sample(FB.filter(function (f) { return f[1] === 1; }), ctx.level === 1 ? 2 : 3);
      return { q: q([para('Which comment on a classmate’s essay is most useful?')]), a: mc(good[0], bad.map(function (f) { return f[0]; })),
        hint: 'Useful feedback points to a place, says what the reader noticed, and suggests something to try.', steps: ['“' + good[0] + '” is specific, kind and something the writer can act on.', 'The others are vague, or about the writer instead of the writing.'] };
    }
    if (shape === 'uv') {
      var f = R.pick(FB);
      return { q: q([para('Is this comment useful, or too vague (or unkind) to help?'), quote(f[0])]), a: mcK(['Useful', 'Not useful as written'], f[1]),
        hint: 'Could the writer tell exactly where to look and what to try?', steps: [f[1] ? FB_LAB[f[2]] : 'It points to a place and suggests something to try.', f[1] ? 'Not useful as written.' : 'Useful.'] };
    }
    var g = R.pick(FB), keepL = [0, 1, 2, 3].filter(function (k) { return !(g[2] === 2 && k === 0) && !(g[2] === 0 && k === 2); }); // an attack is also vague: never offer both
    return { q: q([para('What is the main problem with this comment, if any?'), quote(g[0])]), a: mcK(keepL.map(function (k) { return FB_LAB[k]; }), keepL.indexOf(g[2])),
      hint: 'Useful feedback is specific (where?), kind (about the writing) and actionable (what to try?).', steps: [FB_LAB[g[2]]] };
  });

  // editing: [sentence with one error, the wrong word as written, the corrected sentence, the kind of error, a wrong fix]
  var EDITS = [
    ['On Saturday are class cleaned the park.', 'are', 'On Saturday our class cleaned the park.', 'a sound-alike word (our)', 'On Saturday hour class cleaned the park.'],
    ['We picked up alot of trash.', 'alot', 'We picked up a lot of trash.', 'spelling (a lot is two words)', 'We picked up allot of trash.'],
    ['We planted to trees by the fence.', 'to', 'We planted two trees by the fence.', 'a sound-alike word (two)', 'We planted too trees by the fence.'],
    ['Its time to feed the dog.', 'Its', 'It’s time to feed the dog.', 'its or it’s (it is)', 'Its’ time to feed the dog.'],
    ['The dog wagged it’s tail.', 'it’s', 'The dog wagged its tail.', 'its or it’s (belonging to it)', 'The dog wagged its’ tail.'],
    ['We went to the the library after school.', 'the', 'We went to the library after school.', 'a doubled word', 'We went to library after school.'],
    ['Their going to the museum on Friday.', 'Their', 'They’re going to the museum on Friday.', 'a sound-alike word (they’re = they are)', 'There going to the museum on Friday.'],
    ['Put your coats over their by the door.', 'their', 'Put your coats over there by the door.', 'a sound-alike word (there, a place)', 'Put your coats over they’re by the door.'],
    ['The team practiced hard, they won the game.', 'hard,', 'The team practiced hard, and they won the game.', 'a comma splice', 'The team practiced hard they won the game.'],
    ['Maya and me went to the fair.', 'me', 'Maya and I went to the fair.', 'pronoun case (I is a subject)', 'Maya and myself went to the fair.'],
    ['Each of the students have a locker.', 'have', 'Each of the students has a locker.', 'subject–verb agreement (each … has)', 'Each of the students are having a locker.'],
    ['I could of finished sooner.', 'of', 'I could have finished sooner.', 'could have, not could of', 'I could’of finished sooner.'],
    ['The weather effected our plans.', 'effected', 'The weather affected our plans.', 'affect (the verb) or effect', 'The weather affect our plans.'],
    ['Your going to love this book.', 'Your', 'You’re going to love this book.', 'your or you’re (you are)', 'Youre going to love this book.'],
    ['I recieved your letter yesterday.', 'recieved', 'I received your letter yesterday.', 'spelling (i before e, except after c)', 'I receeved your letter yesterday.']
  ];
  var EDIT_TIPS = [
    ['a doubled word, like “the the”', 'Read slowly and aloud, pointing at each word.', ['Run spell check.', 'Read it quickly one more time.']],
    ['a sound-alike word, like “there” for “their”', 'Check each sound-alike word, because spell check can’t catch real words used wrongly.', ['Trust spell check.', 'Read faster so it flows.']],
    ['a missing word', 'Print it or change the font, and read it aloud.', ['Skim the first sentence of each paragraph.', 'Count the paragraphs.']],
    ['a run-on sentence', 'Read each sentence on its own, starting from the last one.', ['Add more commas.', 'Make the essay longer.']]
  ];
  G('comp.editing', function (R, ctx) {
    var e = R.pick(EDITS), shape = ML.byLevel(ctx, 'fixed', R.pick(['word', 'fixed']), R.pick(['word', 'tip', 'kind']));
    if (shape === 'fixed') {
      var wrong = [e[0]]; if (ctx.level >= 2) wrong.push(e[4]);
      return { q: q([para('Which sentence is correctly edited?')]), a: mc(e[2], uniq(wrong, e[2])),
        hint: 'Read each one slowly, word by word.', steps: ['The error in the original: ' + e[3] + '.', 'Corrected: “' + e[2] + '”'] };
    }
    if (shape === 'word') {
      var words = e[0].replace(/[.]$/, '').split(' '), w = e[1], others = uniq(words.filter(function (x) { return x !== w && x.replace(/[,.]/g, '').length > 2; }), w);
      return { q: q([para('Spell check found nothing wrong, but this sentence has one error. Which word is wrong?'), quote(e[0])]), a: mc(w, R.sample(others, Math.min(3, others.length))),
        hint: 'Read it aloud, slowly. Which word doesn’t say what the writer meant?', steps: ['“' + w + '” is ' + e[3] + '.', 'Corrected: “' + e[2] + '”'] };
    }
    if (shape === 'kind') {
      var kinds = uniq(R.sample(EDITS.filter(function (x) { return x !== e; }), 4).map(function (x) { return x[3]; }), e[3]).slice(0, 3);
      return { q: q([para('What kind of error does this sentence have?'), quote(e[0])]), a: mc(e[3], kinds),
        hint: 'Find the wrong word first, then name the problem.', steps: ['The error is in “' + e[1] + '”: ' + e[3] + '.', 'Corrected: “' + e[2] + '”'] };
    }
    var t = R.pick(EDIT_TIPS);
    return { q: q([para('Which proofreading strategy best catches ' + t[0] + '?')]), a: mc(t[1], t[2]),
      hint: 'Your eyes fill in what you meant at reading speed.', steps: ['“' + t[1] + '” breaks the habit of reading what you meant instead of what you wrote.'] };
  });

  // concise: [wordy, concise, over-cut (meaning lost), still wordy]
  var WORDY = [
    ['Due to the fact that it was raining, we made the decision to stay inside.', 'Because it was raining, we decided to stay inside.', 'We stayed.', 'Due to the rain that was falling, we made a decision to stay inside.'],
    ['In my opinion, I think that the library should be open on Sundays.', 'I think the library should be open on Sundays.', 'The library is open.', 'In my own personal opinion, I think the library should be open on Sundays.'],
    ['At this point in time, the team is in the process of practicing.', 'The team is practicing now.', 'The team.', 'At this time, the team is in the process of practicing.'],
    ['The committee came to the conclusion that the park needs more benches.', 'The committee concluded that the park needs more benches.', 'The park needs.', 'The committee came to a conclusion that more benches are needed by the park.'],
    ['The reason why we were late is because the bus broke down.', 'We were late because the bus broke down.', 'We were late.', 'The reason we were late is because of the fact that the bus broke down.'],
    ['Each and every student should bring a pencil in order to take the test.', 'Every student should bring a pencil to the test.', 'Bring.', 'Each and every student should bring a pencil to take the test.'],
    ['The sky was blue in color and the clouds were white in color.', 'The sky was blue, and the clouds were white.', 'The sky was.', 'The sky was blue in color, and the clouds were white.'],
    ['In spite of the fact that it was cold, we went swimming in the lake.', 'Although it was cold, we swam in the lake.', 'It was cold.', 'In spite of the cold that it was, we went swimming in the lake.']
  ];
  var PHRASES = [['due to the fact that', 'because', ['in order to', 'regarding the fact']], ['in order to', 'to', ['so as to be able to', 'for the purpose of']], ['at this point in time', 'now', ['at this moment in time', 'presently at this time']],
    ['made a decision to', 'decided to', ['came to a decision to', 'reached a decision to']], ['in spite of the fact that', 'although', ['despite the fact that', 'regardless of the fact that']], ['blue in color', 'blue', ['blue-colored in color', 'of a blue color']],
    ['completely finished', 'finished', ['totally completed', 'fully and completely finished']], ['the question as to whether', 'whether', ['the question of whether or not', 'as to the question whether']]];
  G('comp.concise', function (R, ctx) {
    var w = R.pick(WORDY), shape = ML.byLevel(ctx, R.pick(['best', 'phrase']), R.pick(['best', 'phrase']), R.pick(['best4', 'overcut']));
    if (shape === 'best' || shape === 'best4') {
      var wrong = ctx.level === 1 ? [w[0]] : shape === 'best4' ? [w[0], w[2], w[3]] : [w[0], w[3]];
      return { q: q([para('Which version is the most concise while keeping the full meaning?')]), a: mc(w[1], wrong),
        hint: 'Cut empty phrases and repeats, but keep every word that tells the reader something.',
        steps: ['“' + w[1] + '” says everything the original says, in fewer words.', 'Wordy versions keep empty phrases.'].concat(shape === 'best4' ? ['“' + w[2] + '” is shorter, but it lost part of the meaning.'] : []) };
    }
    if (shape === 'phrase') {
      var p = R.pick(PHRASES);
      return { q: q([para('Which is the concise way to say this?'), quote(p[0])]), a: mc(p[1], p[2]),
        hint: 'Find the one word (or two) that does the same job.', steps: ['“' + p[0] + '” can be cut to “' + p[1] + '”.', 'Strunk’s rule 13: “Omit needless words.”'] };
    }
    return { q: q([para('A student cuts this sentence:'), quote(w[0]), para('to this:'), quote(w[2]), para('What went wrong?')]),
      a: mc('It cut words that carried meaning, so the sentence no longer says the same thing.', ['Nothing: shorter is always better.', 'It is still too wordy.', 'It needs more adjectives.']),
      hint: 'Concise means no unnecessary words, not as few words as possible.', steps: ['The cut version lost part of the meaning.', 'A concise version: “' + w[1] + '”'] };
  });

  /* ================================================================ Unit 8: Letters and Emails */
  var FORMAL_PARTS = ['sender', 'date', 'inside', 'salutation', 'body', 'closing', 'signature'];
  var PNAMES = { sender: 'Your address (heading)', date: 'Date', inside: 'Inside address', salutation: 'Salutation', body: 'Body', closing: 'Closing', signature: 'Signature', to: 'To', subject: 'Subject line', greeting: 'Greeting' };
  var FORMAL_CLOSE = ['Sincerely,', 'Respectfully,', 'Yours truly,', 'Thank you,'];
  var CASUAL_CLOSE = ['Love,', 'See ya!', 'XOXO,', 'Later,', 'Hugs,'];
  // [reader, a formal salutation, casual ones]
  var SALUT = [['Ms. Laura Bennett, the library director', 'Dear Ms. Bennett:', ['Hey Laura!', 'Hi there,', 'Yo Ms. B,']], ['Mr. David Grant, the city parks director', 'Dear Mr. Grant:', ['Hi Dave!', 'Hey you,', 'Sup Mr. G,']], ['Dr. Ana Ruiz, the principal', 'Dear Dr. Ruiz:', ['Hey Ana,', 'Hiya!', 'Dear Ana-banana,']], ['Mayor Kim Lee', 'Dear Mayor Lee:', ['Hey Mayor!', 'Hi Kim!', 'What’s up,']]];
  var LETTER_OPEN = [
    ['ask the library whether your club can use its meeting room', 'I am writing to ask whether our writing club could use the community room on Saturday, April 26.', ['My name is Maya and I like to read a lot.', 'How are you? The weather has been nice.']],
    ['ask the city to fix a broken streetlight', 'I am writing to report that the streetlight at Oak and Fifth has been out for three weeks.', ['I live on Oak Street and have a dog named Biscuit.', 'Streetlights are an important part of any town.']],
    ['ask a museum for a group tour', 'I am writing to request a guided tour for twenty-four seventh graders on Friday, May 9.', ['Our class has many students.', 'I visited a museum once when I was little.']],
    ['thank a local business for donating supplies', 'Thank you for donating twenty sketchbooks to our school art club this fall.', ['Our art club meets on Tuesdays.', 'I have always liked drawing.']]
  ];
  G('comp.business-letter', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['ask', 'close']), R.pick(['ask', 'salut', 'open', 'missing']), R.pick(['missing', 'order', 'open']));
    if (shape === 'ask') {
      var p = R.pick(FORMAL_PARTS), wrong = R.sample(FORMAL_PARTS.filter(function (x) { return x !== p; }), ctx.level === 1 ? 2 : 3);
      return { q: q([para('What is the outlined part of this formal letter?')]), a: mc(PNAMES[p], wrong.map(function (x) { return PNAMES[x]; })),
        viz: { name: 'wr-note', opts: { kind: 'formal', ask: p, quiet: true, interactive: false } },
        hint: 'Top to bottom: your address, date, inside address, salutation, body, closing, signature.', steps: ['The outlined part is the ' + low(PNAMES[p]) + '.'] };
    }
    if (shape === 'close') {
      var fc = R.pick(FORMAL_CLOSE);
      return { q: q([para('Which closing fits a formal letter to a library director?')]), a: mc(fc, R.sample(CASUAL_CLOSE, 2)),
        hint: 'A formal letter needs a formal closing, with only the first word capitalized.', steps: ['“' + fc + '” is a formal closing that fits a reader you don’t know well.', 'Closings like “Love,” belong in friendly letters.'] };
    }
    if (shape === 'salut') {
      var s = R.pick(SALUT);
      return { q: q([para('You are writing a formal letter to ' + s[0] + '. Which salutation fits?')]), a: mc(s[1], s[2]),
        hint: 'Use a title and last name, followed by a colon in a formal letter.', steps: ['“' + s[1] + '” uses a title and last name, with the traditional colon.'] };
    }
    if (shape === 'open') {
      var o = R.pick(LETTER_OPEN);
      return { q: q([para('You are writing a formal letter to ' + o[0] + '. Which first sentence is best?')]), a: mc(o[1], o[2]),
        hint: 'State your purpose in the first lines.', steps: ['“' + o[1] + '” tells the reader at once why you are writing.', 'The others delay the point.'] };
    }
    if (shape === 'missing') {
      var m = R.pick(['inside', 'date', 'salutation', 'closing', 'sender']);
      return { q: q([para('One part of this formal letter is missing (marked ?). Which part?')]), a: mcK(FORMAL_PARTS.map(function (x) { return PNAMES[x]; }), FORMAL_PARTS.indexOf(m)),
        viz: { name: 'wr-note', opts: { kind: 'formal', omit: m, quiet: true, interactive: false } },
        hint: 'Go top to bottom and name each part you see.', steps: ['Your address, date, inside address, salutation, body, closing, signature.', 'The missing part is the ' + low(PNAMES[m]) + '.'] };
    }
    var op = orderProblem(R, FORMAL_PARTS.map(function (x) { return PNAMES[x]; }), 3);
    return { q: q([para('Put the parts of a formal letter in order, top to bottom. Which order of letters is right?')]), a: op.a, viz: op.viz,
      hint: 'Both addresses and the date come before the salutation.', steps: ['Your address, date, inside address, salutation, body, closing, signature.', 'In letters: ' + op.code + '.'] };
  });

  // emails: [situation, good subject line, weak ones, main-point-first opening, buried opening]
  var EMAILS = [
    ['ask Ms. Ruiz for a one-day extension on your history essay because you were sick', 'Request: one-day extension on history essay', ['Question', 'Hi', '(no subject)'], 'Could I turn in my history essay on Thursday instead of Wednesday?', 'I hope you are having a good week. I wanted to tell you that I was sick on Monday and Tuesday.'],
    ['ask Coach Diaz what time Saturday’s game starts', 'Saturday game start time?', ['Hey', 'Soccer', 'Important!!!'], 'What time does Saturday’s game against Riverside start?', 'I have been really enjoying the season so far, and my parents like coming to games.'],
    ['tell Mr. Ortiz you will miss Friday’s quiz for a dentist appointment', 'Absent Friday: dentist appointment (science quiz)', ['FYI', 'Friday', 'Hello Mr. Ortiz'], 'I will miss Friday’s science quiz because of a dentist appointment. May I take it on Monday?', 'Science is my favorite class, and I studied a lot for the chapter on cells.'],
    ['ask the librarian whether a book you reserved has arrived', 'Has my reserved book arrived? (The Quiet Garden)', ['Book', 'Library', 'Quick thing'], 'Has my reserved copy of The Quiet Garden arrived yet?', 'I love reading, and the library is one of my favorite places in town.'],
    ['ask your club adviser to move Tuesday’s meeting to Wednesday', 'Request: move Tuesday’s club meeting to Wednesday', ['Meeting', 'Hi!', 'Club stuff'], 'Could we move Tuesday’s writing club meeting to Wednesday, since the gym is closed Tuesday?', 'The writing club has been a lot of fun this year, and everyone has great ideas.']
  ];
  var EMAIL_PARTS = ['to', 'subject', 'greeting', 'body', 'closing', 'signature'];
  G('comp.email', function (R, ctx) {
    var e = R.pick(EMAILS), shape = ML.byLevel(ctx, R.pick(['subject', 'ask']), R.pick(['subject', 'first', 'ask']), R.pick(['first', 'subject4', 'order']));
    if (shape === 'subject' || shape === 'subject4') {
      var wrong = shape === 'subject' ? R.sample(e[2], ctx.level === 1 ? 1 : 2) : e[2];
      return { q: q([para('You need to ' + e[0] + '. Which subject line is clearest?')]), a: mc(e[1], wrong),
        hint: 'A subject line should name the topic and the request in a few words.', steps: ['“' + e[1] + '” tells the reader what the email is about before they open it.', 'Vague or blank subject lines get skipped or missed.'] };
    }
    if (shape === 'first') {
      return { q: q([para('You need to ' + e[0] + '. Which opening puts the main point first?')]), a: mc(e[3], [e[4]]),
        hint: 'Put the request at the top, where it can’t be missed.', steps: ['“' + e[3] + '” states the request in the first line.', 'Details and thanks can follow.'] };
    }
    if (shape === 'ask') {
      var p = R.pick(EMAIL_PARTS), wrong2 = R.sample(EMAIL_PARTS.filter(function (x) { return x !== p; }), ctx.level === 1 ? 2 : 3);
      return { q: q([para('What is the outlined part of this email?')]), a: mc(PNAMES[p], wrong2.map(function (x) { return PNAMES[x]; })),
        viz: { name: 'wr-note', opts: { kind: 'email', ask: p, quiet: true, interactive: false } },
        hint: 'To, subject line, greeting, body, closing, your name.', steps: ['The outlined part is the ' + low(PNAMES[p]) + '.'] };
    }
    var items = ['Subject: ' + e[1], 'Dear …,', e[3], 'Thank you for your help.', 'Best regards,', 'Your name'];
    var op = orderProblem(R, items, 3);
    return { q: q([para('Put the parts of this email in order, top to bottom. Which order of letters is right?')]), a: op.a, viz: op.viz,
      hint: 'Subject line, greeting, the main point, thanks, closing, name.', steps: ['Subject line, greeting, the request first, thanks, closing, name.', 'In letters: ' + op.code + '.'] };
  });
})(window.MathLadder);

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
  var COURSE = 'comp', YOUNG = false, VAR = {};
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
