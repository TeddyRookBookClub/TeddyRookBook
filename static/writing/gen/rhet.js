/* Rhetoric and Advanced Writing (Writing & Grammar Ladder, course key rhet): problem generators for all 41 topics.
   Built from /tmp/work_rhet/gen/*.js by /tmp/work_rhet/build_gen.sh (edit the parts, not this file).
   Conventions: /tmp/work_writing/overview.md. Answers are choices (mc, one or several right; keep: true when the order of
   the choices carries meaning, as for labels and numbers), except one typed number (minutes in timed writing).
   Passages are original, or short quotations from public-domain texts named in the question (Lincoln, Douglass, the
   Federalist, Strunk 1918). Argument topics are everyday and non-partisan; problems judge reasoning, never which side is
   right. Fallacy names are the Logic Ladder's (/logic/informal-logic/). Level 1: one plain case, two or three choices;
   level 2: distractors from the topic's trouble note; level 3: a harder shape (a numbered passage, select all, a
   near-miss choice). Pictures come from the kit in quiet mode, so the picture and the answer agree. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  // register through a wrapper that shuffles the choices of an unordered mc answer (the runner shuffles them again for
  // display); the topic id stays a literal string in each call, as pages and check-gen look for it
  function G(id, fn) { ML.gen(id, function (R, ctx) { return mix(R, fn(R, ctx)); }); }
  function mix(R, p) {
    var a = p && p.a;
    if (a && a.t === 'mc' && !a.keep && a.choices && a.choices.length > 1) {
      var idx = R.shuffle(a.choices.map(function (c, i) { return i; }));
      var v = Array.isArray(a.v) ? a.v.map(function (x) { return idx.indexOf(x); }).sort(function (x, y) { return x - y; }) : idx.indexOf(a.v);
      p.a = { t: 'mc', choices: idx.map(function (i) { return a.choices[i]; }), v: v };
    }
    return p;
  }

  /* ---------------------------------------------------------------- shared helpers */
  function P(s) { return '<p>' + s + '</p>'; }
  function Q(s) { return '“' + s + '”'; }
  function BQ(s, src) { return '<blockquote>' + s + (src ? '<br><small>— ' + src + '</small>' : '') + '</blockquote>'; }
  function q() { return Array.prototype.slice.call(arguments).filter(Boolean).join(''); }
  // multiple choice: right first, then the wrong ones (the runner shuffles unless keep)
  function mc(right, wrong) { return { t: 'mc', choices: [right].concat(wrong), v: 0 }; }
  function mcKeep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function mcAll(choices, rightIdx) { return { t: 'mc', choices: choices, v: rightIdx, keep: true }; }
  function nums(n) { var a = []; for (var i = 1; i <= n; i++) a.push(String(i)); return a; }
  function letters(n) { var a = []; for (var i = 0; i < n; i++) a.push(String.fromCharCode(65 + i)); return a; }
  function lc(s) { s = String(s); return s.charAt(0).toLowerCase() + s.slice(1); }
  function uc(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function idxOf(arr, f) { for (var i = 0; i < arr.length; i++) if (f(arr[i], i)) return i; return -1; }
  // a numbered passage in the kit's wr-mark, quiet (numbers only, no labels)
  function markViz(sentences, source) {
    var o = { sentences: sentences.map(function (s) { return { text: typeof s === 'string' ? s : s.text }; }), quiet: true, interactive: false };
    if (source) o.source = source;
    return { name: 'wr-mark', opts: o };
  }
  // n distinct items from arr that pass f
  function some(R, arr, n, f) { return R.sample(f ? arr.filter(f) : arr, n); }
  // pick wrong choices from a pool, never equal to the right one
  function wrongs(R, pool, right, n) { return R.sample(pool.filter(function (x) { return x !== right; }), n); }
  // a short ordinal: 1 -> first
  var ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'];
  var NAMES = ['Ana', 'Marcus', 'Priya', 'Jonah', 'Leila', 'Sam', 'Mei', 'Diego', 'Nora', 'Eli', 'Grace', 'Omar', 'Tessa', 'Ben', 'Rosa', 'Kai'];

  /* sources of the public-domain quotations (named in the questions) */
  var GETTY = 'Abraham Lincoln, Gettysburg Address (1863)';
  var LINC2 = 'Abraham Lincoln, Second Inaugural Address (1865)';
  var DOUG = 'Frederick Douglass, Fourth of July oration, Rochester (1852)';
  var FED51 = 'The Federalist No. 51 (1788)';
  var FED10 = 'The Federalist No. 10 (1787)';
  var FED1 = 'The Federalist No. 1 (1787)';
  var STRUNK = 'William Strunk Jr., The Elements of Style (1918)';

  /* ================================================================ Unit 1: The Rhetorical Situation */

  /* ---------------------------------------------------------------- rhet.rhetoric */
  var KINDS = ['Deliberative (future)', 'Judicial (past)', 'Ceremonial (present)'];
  var KIND_WHY = ['It asks the audience to decide what to do next: a deliberative speech looks to the future.',
    'It asks the audience to judge what happened and whether it was just: a judicial speech looks to the past.',
    'It praises or blames someone or something on an occasion: a ceremonial speech looks to the present.'];
  var SPEECHES = [
    ['A town council member argues for a new crosswalk near the school.', 0], ['An editorial urges the library to open on Sundays.', 0],
    ['A student asks the school board to add a robotics club next year.', 0], ['A neighbor urges the park district to plant shade trees along the path.', 0],
    ['A coach asks parents to vote for a new practice schedule.', 0], ['A club president argues that the club should hold a bake sale in March.', 0],
    ['A lawyer argues that a contract was broken last May.', 1], ['A student appeals a late penalty by explaining what happened on the due date.', 1],
    ['A referee explains to a review panel why a goal was disallowed in last week’s game.', 1], ['A tenant tells a hearing officer the landlord failed to fix the heat last winter.', 1],
    ['A player defends her teammate against a claim that he broke the rules in yesterday’s match.', 1],
    ['A granddaughter’s eulogy praises her grandmother’s kindness.', 2], ['A graduation speaker honors the class’s hard work.', 2],
    ['A principal’s speech at a retirement party celebrates a teacher’s forty years of service.', 2], ['A mayor’s speech at a ribbon cutting praises the volunteers who built the playground.', 2],
    ['A toast at a wedding celebrates the couple.', 2], ['A speaker at an awards dinner honors the town’s firefighters.', 2]];
  var RH_DEF = 'The art of choosing words to inform, persuade or move an audience';
  var RH_DEF_WRONG = ['Words that are empty or misleading', 'The rules of grammar and spelling', 'Fancy language full of long words', 'The study of political speeches only'];
  var RH_SENSE = [ // [sentence, true when it means the art or study of persuasion]
    ['In rhetoric class, Ana studied how Lincoln won over a tired crowd.', true], ['The museum guide’s rhetoric was simple: short sentences, vivid details and a joke at the end.', true],
    ['A good cover letter shows careful rhetoric: it fits its words to one employer.', true], ['Aristotle’s book on rhetoric describes three ways a speech can persuade.', true],
    ['The poster’s rhetoric works because it speaks to students’ worries before giving the facts.', true],
    ['The promises in the ad were just rhetoric; nothing changed.', false], ['‘That’s empty rhetoric,’ Sam said, rolling his eyes at the slogan.', false],
    ['Critics dismissed the speech as mere rhetoric with no plan behind it.', false]];
  G('rhet.rhetoric', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['def', 'kind']), R.pick(['kind', 'time', 'which']), R.pick(['sense', 'which', 'time']));
    if (shape === 'which') {
      var kk = R.int(0, 2), pickK = function (k) { return R.pick(SPEECHES.filter(function (x) { return x[1] === k; }))[0]; };
      var wr = [0, 1, 2].filter(function (k) { return k !== kk; }).map(pickK), nm = ['deliberative', 'judicial', 'ceremonial'][kk];
      return { q: P('Which of these is a <b>' + nm + '</b> speech?'), a: mc(pickK(kk), wr),
        hint: 'Deliberative = deciding the future; judicial = judging the past; ceremonial = honoring in the present.',
        steps: ['Ask what each audience is asked to judge.', KIND_WHY[kk], 'Only one choice fits that; the others ask the audience to ' + (kk === 0 ? 'judge the past or honor someone' : kk === 1 ? 'decide what to do or honor someone' : 'decide what to do or judge what happened') + '.'] };
    }
    if (shape === 'def') {
      return { q: P('Which is the best description of <b>rhetoric</b>, as this course uses the word?'), a: mc(RH_DEF, R.sample(RH_DEF_WRONG, 2)),
        hint: 'Think of Aristotle: seeing the available means of persuasion.',
        steps: ['Aristotle defined rhetoric as seeing, in any case, the available means of persuasion.', 'So rhetoric is the art of choosing words for an audience and a purpose: to inform, persuade or move.', '“Empty words” is one everyday insult, not the subject; grammar and fancy words are not what rhetoric means.'] };
    }
    if (shape === 'time') {
      var k = R.int(0, 2), forms = [['looks to the future and asks the audience what to do', 0], ['looks to the past and asks whether something happened and was just', 1], ['praises or blames on an occasion, in the present', 2]];
      var f = forms[k];
      return { q: P('Aristotle sorted speeches into three kinds. Which kind ' + f[0] + '?'), a: mcKeep(['Deliberative', 'Judicial (forensic)', 'Ceremonial (epideictic)'], f[1]),
        hint: 'Deliberative = deciding; judicial = judging; ceremonial = honoring.',
        steps: ['Deliberative speeches (council meetings, editorials) ask what we should do: the future.', 'Judicial speeches (courtrooms, appeals) ask what happened and whether it was just: the past.', 'Ceremonial speeches (eulogies, toasts) praise or blame: the present.', 'So the answer is ' + ['deliberative', 'judicial', 'ceremonial'][k] + '.'] };
    }
    if (shape === 'sense') {
      var art = R.coin(), s = R.pick(RH_SENSE.filter(function (x) { return x[1] === art; }));
      return { q: P('In which sense is the word <b>rhetoric</b> used here?') + P(Q(s[0])), a: mcKeep(['The art or study of persuasion', 'An insult: empty or misleading words'], art ? 0 : 1),
        hint: 'Is the writer studying how words work, or dismissing them?',
        steps: [art ? 'The sentence describes how words are chosen to work on an audience.' : 'The sentence dismisses the words as empty, an everyday insult.', art ? 'That is rhetoric as an art and a subject of study, the sense this course uses.' : 'That is a common use of the word, but the study of rhetoric is broader: it covers honest persuasion and helps you spot the tricks.'] };
    }
    var sp = R.pick(SPEECHES);
    return { q: P('What kind of speech is this, in Aristotle’s terms?') + P(sp[0]), a: mcKeep(KINDS, sp[1]),
      hint: 'Is the audience asked to decide what to do, to judge what happened, or to honor someone?',
      steps: ['Ask what the audience is asked to judge.', KIND_WHY[sp[1]], 'So it is ' + KINDS[sp[1]].toLowerCase() + '.'] };
  });

  /* ---------------------------------------------------------------- rhet.rhetorical-situation */
  // each: the scenario, its parts, and two audiences with an opening that fits each
  var SIT = [
    { s: 'Two weeks before finals, Priya, a junior who studies after practice, writes to the principal asking to keep the library open until 6:00 during exam weeks; it now closes at 4:00.',
      writer: 'Priya, a junior who studies after practice', audience: 'the principal', purpose: 'to get the library kept open until 6:00 in exam weeks', context: 'finals are two weeks away and the library closes at 4:00' },
    { s: 'After a near miss at Elm and Fifth, a crossing guard writes a letter to the town council asking for a flashing light at the corner.',
      writer: 'a crossing guard', audience: 'the town council', purpose: 'to get a flashing light installed at the corner', context: 'a near miss just happened at Elm and Fifth' },
    { s: 'The week the animal shelter runs out of space, its director posts on the town website asking families to foster cats for a month.',
      writer: 'the shelter’s director', audience: 'families in town', purpose: 'to find foster homes for cats for a month', context: 'the shelter has run out of space this week' },
    { s: 'Before the spring vote on the school calendar, a parent emails the school board asking for a later start time for the high school.',
      writer: 'a parent', audience: 'the school board', purpose: 'to win a later high school start time', context: 'the board votes on next year’s calendar this spring' },
    { s: 'After the soccer team’s bus broke down twice this season, the captain writes to the athletic director asking for a rented bus for the playoffs.',
      writer: 'the soccer team’s captain', audience: 'the athletic director', purpose: 'to get a rented bus for the playoffs', context: 'the team bus broke down twice this season' },
    { s: 'On the first warm Saturday of spring, Diego, a sixth grader, writes a flyer asking neighbors to help clean up the creek trail.',
      writer: 'Diego, a sixth grader', audience: 'his neighbors', purpose: 'to get neighbors to help clean the creek trail', context: 'the first warm Saturday of spring' },
    { s: 'Because the town is redoing the park this year, a retired teacher writes to the parks department asking for benches along the walking path.',
      writer: 'a retired teacher', audience: 'the parks department', purpose: 'to get benches placed along the walking path', context: 'the town is redoing the park this year' },
    { s: 'Just after the town library lost its grant, its director gives a speech at the Rotary Club asking members to fund a summer reading program.',
      writer: 'the library director', audience: 'Rotary Club members', purpose: 'to raise money for a summer reading program', context: 'the library just lost its grant' },
    { s: 'The day the new cafeteria menu comes out, Mei writes to the student council asking for a vegetarian option every day.',
      writer: 'Mei, a student', audience: 'the student council', purpose: 'to win a daily vegetarian option', context: 'the new cafeteria menu came out today' },
    { s: 'After three bikes were stolen from the rack in one week, the school’s resource officer writes to parents urging them to buy sturdy U-locks.',
      writer: 'the school’s resource officer', audience: 'parents', purpose: 'to get parents to buy sturdy bike locks', context: 'three bikes were stolen in one week' }];
  var PARTS = ['writer', 'audience', 'purpose', 'context'];
  var PART_Q = { writer: 'Who is the <b>writer</b>?', audience: 'Who is the <b>audience</b>?', purpose: 'What is the <b>purpose</b>?', context: 'What is the <b>context</b> (the occasion that calls for the text)?' };
  var OPEN = [ // the same request opened for two audiences; [audience, fitting opening, openings that fit the other audience or neither]
    { req: 'asking for a later school start time', a: [['the school board', 'At its spring meeting, the board can adopt a start time that research links to better attendance at no extra busing cost.', 'Hey, wouldn’t it be awesome to sleep in a little?'], ['fellow students', 'Ever fallen asleep in first period? Here is how we can ask the board for a later start.', 'The board can adopt a start time that research links to better attendance at no extra busing cost.']] },
    { req: 'asking for a flashing light at a dangerous corner', a: [['the town council', 'Since January, the corner of Elm and Fifth has had four reported near misses; a flashing light costs about the same as one month of crossing-guard overtime.', 'Kids, always look both ways before you cross!'], ['students at the elementary school', 'Do you cross at Elm and Fifth? Here are three ways to stay safe until the new light comes.', 'Since January, the corner has had four reported near misses, and a light costs about the same as a month of overtime.']] },
    { req: 'asking for help cleaning the creek trail', a: [['neighbors', 'Our creek trail is where many of us walk our dogs; with twenty helpers, we can clear it in one Saturday morning.', 'Per the parks department’s cleanup policy, Section 4, volunteers must register in advance.'], ['the parks department', 'Twenty neighbors are ready to clear the creek trail on May 3; could the department lend gloves and pick up the bags?', 'Our creek trail is where many of us walk our dogs!']] },
    { req: 'asking for a daily vegetarian lunch', a: [['the student council', 'A survey of 150 students found that 40 would choose a vegetarian lunch most days; the council can bring this to the cafeteria committee.', 'Dear Sir or Madam: I am writing to file a formal complaint.'], ['the cafeteria manager', 'Our student survey found steady interest in a vegetarian lunch; would a bean or vegetable option fit within the current menu budget?', 'Vote for me and I’ll fight for veggie lunches!']] }];
  G('rhet.rhetorical-situation', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'part', R.pick(['part', 'part2']), R.pick(['open', 'part2']));
    if (shape === 'open') {
      var o = R.pick(OPEN), w = R.int(0, 1), aud = o.a[w], other = o.a[1 - w];
      return { q: P('A writer is ' + o.req + '. The audience is <b>' + aud[0] + '</b>. Which opening fits this audience best?'), a: mc(aud[1], [aud[2], other[1]]),
        hint: 'What does this audience care about, and what can it do?',
        steps: ['Ask what ' + aud[0] + ' care about and can act on.', 'The best opening speaks to that: ' + Q(aud[1]), 'The others fit a different reader, or no reader, so they would fall flat with ' + aud[0] + '.'] };
    }
    var sit = R.pick(SIT), part = R.pick(ctx.level === 1 ? ['audience', 'purpose'] : PARTS);
    var others = PARTS.filter(function (p) { return p !== part; }).map(function (p) { return sit[p]; });
    var nW = ctx.level === 1 ? 2 : 3;
    var wr = R.sample(others, nW);
    return { q: P(sit.s) + P(PART_Q[part]), a: mc(uc(sit[part]), wr.map(uc)),
      hint: { writer: 'Who is doing the writing or speaking?', audience: 'Who will read or hear it, and can act on it?', purpose: 'What should change because of the text?', context: 'What happened, or what time is it, that calls for the text now?' }[part],
      steps: ['Writer: ' + sit.writer + '.', 'Audience: ' + sit.audience + '.', 'Purpose: ' + sit.purpose + '.', 'Context: ' + sit.context + '.', 'So the ' + part + ' is: ' + sit[part] + '.'] };
  });

  /* ---------------------------------------------------------------- rhet.ethos */
  var ETHOS_Q = ['Good sense', 'Good character', 'Goodwill'];
  var ETHOS_S = [ // [sentence, quality index]
    ['I have run the school’s recycling club for two years, so I have seen what fills our bins.', 0], ['As a lifeguard for three summers, I have pulled six swimmers out of the deep end.', 0],
    ['The plan costs \\$400, and I have attached three price quotes so you can check my numbers.', 0], ['I checked the bus schedule for every route before proposing this change.', 0],
    ['I’ve read the district’s budget for the last three years, line by line.', 0],
    ['I’ll admit my first plan, a ban on plastic bottles, would have been unfair to students without reusable ones.', 1], ['My own team would lose its practice slot under this plan, but I still think it is the fair schedule.', 1],
    ['People who oppose the change make a fair point about cost, and I want to answer it directly.', 1], ['I made a mistake in last week’s letter: the survey had 150 answers, not 200.', 1],
    ['I won’t pretend this is a perfect solution; it trades some convenience for safety.', 1],
    ['I know the custodians already work hard, so this plan adds no work for them.', 2], ['Whatever you decide, thank you for reading every letter from students this year.', 2],
    ['I wrote this proposal with the younger students in mind, since they wait longest for the bus.', 2], ['If the board needs more information, I am glad to come to any meeting to answer questions.', 2],
    ['Parents worry about safety on field trips, and they are right to; this plan keeps every group with an adult.', 2]];
  var ETHOS_HURT = ['Anyone who disagrees with me just hasn’t thought about it.', 'Everybody knows I’m right, so I won’t bother with the details.', 'The board members are clearly too lazy to fix this.',
    'Trust me, the numbers are somewhere, I just didn’t write them down.', 'Only a fool would vote against a new gym.', 'I don’t really know much about this, but I’m sure it’s a disaster.',
    'People on the other side don’t care about kids at all.'];
  var ETHOS_PASS = [ // a short proposal: one sentence hurts ethos
    ['I have helped organize the spring book fair for three years.', 'Last year we raised \\$900, all of it spent on classroom libraries.', 'Some teachers said the fair takes too much class time, and that is a fair concern.', 'This year we will hold it after school, so no class time is lost.'],
    ['As captain of the cross-country team, I run the park trail five days a week.', 'The trail has two broken lights near the bridge.', 'Runners and walkers both use that stretch after dark in winter.', 'Fixing the lights would cost about the same as one new trash can.'],
    ['I have volunteered at the animal shelter every Saturday since last June.', 'On most weekends, every cage is full by noon.', 'The shelter’s budget is tight, and I know the council has many requests.', 'A foster program costs almost nothing and frees up cages right away.']];
  G('rhet.ethos', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'build', R.pick(['quality', 'hurt', 'build']), R.pick(['passage', 'aristotle', 'quality']));
    if (shape === 'build') {
      var s = R.pick(ETHOS_S);
      return { q: P('Which sentence would most help readers <b>trust the writer</b>?'), a: mc(s[0], R.sample(ETHOS_HURT, ctx.level === 1 ? 1 : 2)),
        hint: 'Look for good sense, fairness or respect for the reader.',
        steps: ['Ethos is the trust a writer earns on the page: good sense, good character, goodwill.', Q(s[0]) + ' shows ' + ETHOS_Q[s[1]].toLowerCase() + '.', 'The other choices insult readers, claim to be right without reasons, or admit to sloppiness. They make readers trust the writer less.'] };
    }
    if (shape === 'hurt') {
      var h = R.pick(ETHOS_HURT), good = R.sample(ETHOS_S, 2).map(function (x) { return x[0]; });
      return { q: P('Which sentence would <b>hurt</b> the writer’s ethos?'), a: mc(h, good),
        hint: 'Which one makes the writer seem unfair, arrogant or careless?',
        steps: [Q(h) + ' attacks people or claims to be right without reasons.', 'Readers stop trusting a writer who is unfair to them or to the other side.', 'The other sentences show knowledge, fairness or goodwill, so they build ethos.'] };
    }
    if (shape === 'quality') {
      var x = R.pick(ETHOS_S);
      return { q: P('Aristotle said audiences trust a speaker who shows good sense, good character and goodwill. Which does this sentence mainly show?') + P(Q(x[0])), a: mcKeep(ETHOS_Q, x[1]),
        hint: 'Knowledge and sound judgment? Honesty and fairness? Care for the audience?',
        steps: ['Good sense: knowledge, accurate facts, sound plans. Good character: honesty and fairness, owning mistakes. Goodwill: care for the audience’s interests.', ['The sentence shows knowledge and careful judgment: good sense.', 'The sentence is honest and fair, even against the writer’s own interest: good character.', 'The sentence shows care for the audience and the people affected: goodwill.'][x[1]]] };
    }
    if (shape === 'aristotle') {
      return { q: P('A classmate says, “Ethos just means quoting an expert.” What would Aristotle add?'),
        a: mc('Ethos is the trust the speech itself earns, through the speaker’s good sense, character and goodwill.', ['Ethos is the speaker’s fame before the speech begins, so only famous people have it.', 'Ethos means stirring the audience’s feelings with a story.', 'Ethos means using numbers and statistics.']),
        hint: 'Where did Aristotle say the trust comes from?',
        steps: ['Quoting an expert can help, but it is not the whole of ethos.', 'Aristotle meant the character shown in the speech: good sense, good character and goodwill.', 'Feelings are pathos; numbers and reasoning are logos.'] };
    }
    var ps = R.pick(ETHOS_PASS), bad = R.pick(ETHOS_HURT), at = R.int(1, 3), sents = ps.slice(); sents.splice(at, 0, bad);
    return { q: P('Which numbered sentence <b>weakens</b> the writer’s ethos?'), a: mcKeep(nums(sents.length), at), viz: markViz(sents),
      hint: 'Find the sentence that is unfair, arrogant or careless.',
      steps: ['The other sentences show experience, fair concessions or care about cost.', 'Sentence ' + (at + 1) + ', ' + Q(bad) + ', attacks people or claims to be right without reasons.', 'One unfair sentence can undo the trust the rest of the letter earned.'] };
  });

  /* ---------------------------------------------------------------- rhet.pathos */
  var PATH_FAIR = [ // [sentence, feeling]
    ['Our shelter’s oldest dog, Pepper, has waited more than a year for a home, watching families walk past her cage.', 'compassion'], ['Picture a first grader waiting alone in the dark for a bus that is late again.', 'concern'],
    ['Last winter my neighbor slipped on the unshoveled steps of the post office and broke her wrist.', 'concern'], ['When the new playground opened, kids who had never met were laughing together on the rope bridge within an hour.', 'hope'],
    ['This team practiced in a parking lot all fall, and still made the state finals.', 'pride'], ['Every Saturday, Mr. Ortiz walks two miles to the library because it is the only place he can use a computer.', 'compassion'],
    ['Imagine the creek trail lined with blooming dogwoods, where your grandchildren can walk safely.', 'hope'], ['Our grandparents built this library with bake sales and borrowed hammers.', 'pride']];
  var PATH_UNFAIR = ['Anyone with a heart will vote for the new adoption room.', 'If you don’t fix this light, you don’t care whether children live or die.', 'Please give me an A; I worked so hard and I’ll be crushed if I don’t.',
    'Only a monster would cut the music program.', 'You’ll regret it forever if you don’t sign up today!', 'Think of the poor team; how can you say no to their sad faces?'];
  var LOGOS_S = ['A survey of 300 patrons found that 62 percent would use the library on Sundays.', 'Opening four hours on Sunday would cost less than one part-time salary.',
    'The neighboring town added evening swim lessons, and sign-ups tripled in one season.', 'The bus route takes 55 minutes now; the new route would take 35.', 'Bike helmets are required in our state for riders under 16.',
    'The old boiler uses twice as much fuel as a new one, so it would pay for itself in about six years.', 'Students who joined the tutoring program raised their math grades by about half a letter grade on average.'];
  var ETHOS_PLAIN = ['I have coached the middle school swim team for nine years.', 'As a nurse, I have treated many bike injuries.', 'I have worked at the library’s front desk since it opened.', 'I have driven a school bus in this district for twelve years.'];
  var FEELINGS = ['compassion', 'concern', 'hope', 'pride'];
  G('rhet.pathos', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'which', R.pick(['fair', 'feeling', 'which']), R.pick(['fair3', 'feeling', 'fair']));
    if (shape === 'which') {
      var f = R.pick(PATH_FAIR), w = [R.pick(LOGOS_S)]; if (ctx.level > 1) w.push(R.pick(ETHOS_PLAIN));
      return { q: P('Which sentence appeals mainly to the reader’s <b>emotions</b> (pathos)?'), a: mc(f[0], w),
        hint: 'Look for a story or a picture the reader can feel.',
        steps: [Q(f[0]) + ' gives a person or a scene the reader can picture, which stirs ' + f[1] + '.', 'The other choices give facts or numbers (logos) or the writer’s experience (ethos).'] };
    }
    if (shape === 'feeling') {
      var g = R.pick(PATH_FAIR);
      return { q: P('Which feeling does this sentence mainly try to stir?') + P(Q(g[0])), a: mcKeep(FEELINGS, FEELINGS.indexOf(g[1])),
        hint: 'How would a reader feel picturing this?',
        steps: ['Picture the scene the sentence paints.', { compassion: 'It shows someone in need, so readers feel compassion.', concern: 'It shows a danger to someone, so readers feel concern.', hope: 'It shows a good future the reader could help bring about: hope.', pride: 'It celebrates what people achieved, so readers feel pride.' }[g[1]]] };
    }
    if (shape === 'fair') {
      var fair = R.coin(), s = fair ? R.pick(PATH_FAIR)[0] : R.pick(PATH_UNFAIR);
      return { q: P('Is this a fair use of emotion, or feeling in place of reasons?') + P(Q(s)), a: mcKeep(['Fair: the feeling fits real facts', 'Unfair: feeling replaces the reasons'], fair ? 0 : 1),
        hint: 'Take out the emotional words. Is there a fact or reason left?',
        steps: fair ? ['The sentence describes something real that bears on the issue.', 'The feeling it stirs fits the facts, so it is a fair appeal.'] : ['The sentence pressures, shames or begs, but gives no reason.', 'Take the emotion out and nothing is left: feeling has replaced the argument (for example, an appeal to pity).'] };
    }
    var ok = R.pick(PATH_FAIR)[0];
    return { q: P('Two of these sentences use emotion in place of reasons. Which one uses emotion <b>fairly</b>?'), a: mc(ok, R.sample(PATH_UNFAIR, 2)),
      hint: 'Which one would still say something true if you removed the emotional words?',
      steps: [Q(ok) + ' tells something real that bears on the issue; the feeling fits the facts.', 'The others shame, threaten or beg. Remove the feeling and no reason is left.'] };
  });

  /* ---------------------------------------------------------------- rhet.logos */
  var STATS = [
    { s: 'Bike crashes on Oak Street doubled this year!', r: 'From how many to how many, and did the number of riders change?', w: ['Who painted the bike lanes?', 'How scary is Oak Street at night?', 'Is the writer a cyclist?'], why: 'A doubling from 1 to 2 means little; and if twice as many people ride there, the risk per rider may not have changed.' },
    { s: 'Nine out of ten students we asked love the new lunch menu.', r: 'How many students were asked, and how were they chosen?', w: ['What is on the new menu?', 'Does the writer like the menu?', 'Is ninety percent a big number?'], why: 'Ten friends at one table are not a fair sample of the school.' },
    { s: 'Students who eat breakfast get better grades, so breakfast raises grades.', r: 'Could something else explain both, like more sleep or calmer mornings?', w: ['What do they eat for breakfast?', 'Who serves the breakfast?', 'How many grades are there?'], why: 'Two things found together may share a cause; the number alone does not show that one causes the other.' },
    { s: 'Our team scored 40 points last night, the most in school history!', r: 'How many points did the other team score, and was it a normal game?', w: ['Who scored the most?', 'Was the crowd loud?', 'What color are the uniforms?'], why: 'A record score proves little about the team without the game’s context.' },
    { s: 'The library had 500 fewer visitors this March than last March.', r: 'Was the library closed for some days, or was the weather unusual?', w: ['Who counted the visitors?', 'Do people like books?', 'How big is the library?'], why: 'A drop means something only if the two months are comparable.' },
    { s: 'Reading scores rose 12 points after the school bought new tablets.', r: 'Did anything else change that year, and did schools without tablets rise too?', w: ['What brand are the tablets?', 'How much did the tablets cost?', 'Do students enjoy the tablets?'], why: 'Without a comparison group, we can’t tell whether the tablets caused the rise.' }];
  var ENTH = [
    { a: 'Students need sleep, and a 7:15 start cuts their sleep, so school should start later.', r: 'Schools should protect what students need.', w: ['School should start later.', 'A 7:15 start cuts students’ sleep.', 'Students like to sleep in.'] },
    { a: 'This dog is a beagle, so it will need lots of exercise.', r: 'Beagles generally need lots of exercise.', w: ['This dog is a beagle.', 'This dog will need lots of exercise.', 'All dogs are the same.'] },
    { a: 'The bridge is closed, so we will be late.', r: 'The way around the bridge takes longer.', w: ['The bridge is closed.', 'We will be late.', 'Bridges are important.'] },
    { a: 'Maya practiced every day, so she will play well at the recital.', r: 'Daily practice usually leads to playing well.', w: ['Maya will play well at the recital.', 'Maya practiced every day.', 'Recitals are stressful.'] },
    { a: 'The forecast calls for heavy rain, so the picnic should move indoors.', r: 'A picnic shouldn’t be held outside in heavy rain.', w: ['The forecast calls for heavy rain.', 'The picnic should move indoors.', 'Forecasts are never wrong.'] },
    { a: 'The town’s population has grown by a third, so the library needs more space.', r: 'A library should have room for the people it serves.', w: ['The town’s population has grown by a third.', 'The library needs more space.', 'Libraries are popular.'] }];
  G('rhet.logos', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'which', R.pick(['stat', 'which', 'enth']), R.pick(['enth', 'stat']));
    if (shape === 'which') {
      var l = R.pick(LOGOS_S), w = [R.pick(PATH_FAIR)[0]]; if (ctx.level > 1) w.push(R.pick(ETHOS_PLAIN));
      return { q: P('Which sentence appeals mainly to <b>reasoning and evidence</b> (logos)?'), a: mc(l, w),
        hint: 'Look for facts, numbers or a because/so step.',
        steps: [Q(l) + ' gives a checkable fact that supports a claim: logos.', 'The others stir feeling with a scene (pathos) or build trust in the writer (ethos).'] };
    }
    if (shape === 'stat') {
      var st = R.pick(STATS);
      return { q: P('A flyer says:') + P(Q(st.s)) + P('Before you count this as strong evidence, which question matters most?'), a: mc(st.r, ctx.level === 3 ? st.w : R.sample(st.w, 2)),
        hint: 'Ask what the number measures and what it is compared with.',
        steps: ['A number is logos only when readers can see what it measures and what it is compared with.', st.why, 'So ask: ' + st.r] };
    }
    var e = R.pick(ENTH);
    return { q: P('This short argument leaves a step unsaid. Which unstated premise does it rely on?') + P(Q(e.a)), a: mc(e.r, R.sample(e.w, ctx.level === 3 ? 3 : 2)),
      hint: 'The unstated premise links the reason to the conclusion. It isn’t the reason or the conclusion itself.',
      steps: ['Find the reason and the conclusion: the conclusion follows “so.”', 'Ask what general idea makes the reason support the conclusion.', 'That idea is ' + Q(e.r) + '. The other choices repeat the reason or the conclusion, or add something the argument doesn’t need.'] };
  });

  /* ---------------------------------------------------------------- rhet.identify-appeals */
  var AP_NAMES = ['ethos', 'pathos', 'logos'];
  var AP_PASS = [ // passages: [sentence, appeal]
    [['I have coached the middle school swim team for nine years.', 'ethos'], ['Every summer I watch kids who never had lessons cling to the pool wall, afraid to let go.', 'pathos'], ['The pool offers free lessons only on weekday mornings, when most parents are at work.', 'logos'], ['When the next town added evening lessons, sign-ups tripled in one season.', 'logos']],
    [['I have worked at the library’s front desk since it opened in 2009.', 'ethos'], ['On Sunday afternoons I see students sitting on the steps outside, using our wifi in the cold.', 'pathos'], ['A survey of 300 patrons found that 62 percent would use the library on Sundays.', 'logos'], ['Opening four hours on Sunday would cost less than one part-time salary.', 'logos']],
    [['As a crossing guard at Elm and Fifth for six years, I know this corner well.', 'ethos'], ['Last month a second grader froze in the middle of the street as a truck rolled through the red light.', 'pathos'], ['Since January, the corner has had four reported near misses.', 'logos'], ['A flashing light costs about as much as one month of crossing-guard overtime.', 'logos']],
    [['I have volunteered at the shelter every Saturday for two years.', 'ethos'], ['Pepper, a gray-muzzled beagle, has waited more than a year for a home, watching families walk past her cage.', 'pathos'], ['The shelter turned away 60 animals last year for lack of space.', 'logos'], ['Each foster family frees one cage for a month at no cost to the town.', 'logos']],
    [['I have taught art at Lincoln Elementary for fifteen years.', 'ethos'], ['Last week a fourth grader showed me a drawing she had hidden in her backpack for a month, afraid it wasn’t good enough.', 'pathos'], ['Our school has had no art teacher on Fridays since 2019.', 'logos'], ['A part-time teacher for Fridays would cost about \\$9,000 a year.', 'logos']],
    [['I have kept bees in this town for twenty years.', 'ethos'], ['Last spring I opened a hive and found it silent: the whole colony was gone.', 'pathos'], ['The county lost about a third of its hives last year.', 'logos'], ['Planting clover in the park’s unused strip would feed bees from May to September.', 'logos']],
    [['As the parent of three bike riders, I have spent many afternoons at this rack.', 'ethos'], ['My youngest cried the whole walk home the day his bike was stolen.', 'pathos'], ['Three bikes were stolen from the school rack in one week.', 'logos'], ['A camera over the rack would cost less than two new bikes.', 'logos']],
    [['I have driven a school bus in this district for twelve years.', 'ethos'], ['On dark winter mornings, I see little kids standing in the snow at stops with no shelter.', 'pathos'], ['Three of our stops are on roads with a 50 mph limit.', 'logos'], ['Moving those stops to side streets would add only four minutes to the route.', 'logos']]];
  var AP_ONE = [];
  AP_PASS.forEach(function (p) { p.forEach(function (s) { AP_ONE.push(s); }); });
  [['Fondly do we hope—fervently do we pray—that this mighty scourge of war may speedily pass away.', 'pathos', LINC2], ['My arguments will be open to all, and may be judged of by all.', 'ethos', FED1],
    ['If men were angels, no government would be necessary.', 'logos', FED51]].forEach(function (x) { AP_ONE.push(x); });
  var AP_WHY = { ethos: 'It builds trust in the writer: experience, fairness or goodwill.', pathos: 'It stirs feeling with a scene, a story or vivid words.', logos: 'It offers a fact, a number or a reason that supports the claim.' };
  G('rhet.identify-appeals', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['one', 'pick']), R.pick(['find', 'one', 'pick']), R.pick(['all', 'find']));
    if (shape === 'pick') {
      var wantP = R.pick(AP_NAMES), opts = AP_NAMES.map(function (k) { return R.pick(AP_ONE.filter(function (x) { return x[1] === k && !x[2]; })); });
      var rightS = opts[AP_NAMES.indexOf(wantP)][0], wrongS = opts.filter(function (x) { return x[1] !== wantP; }).map(function (x) { return x[0]; });
      return { q: P('Which sentence leans most on <b>' + wantP + '</b>?'), a: mc(rightS, wrongS),
        hint: { ethos: 'Which sentence makes you trust the writer?', pathos: 'Which sentence paints a scene you can feel?', logos: 'Which sentence gives a fact or a reason?' }[wantP],
        steps: opts.map(function (x) { return Q(x[0]) + ': ' + x[1] + '.'; }).concat([AP_WHY[wantP]]) };
    }
    if (shape === 'one') {
      var s = R.pick(AP_ONE);
      return { q: P('Which appeal does this sentence lean on most?') + (s[2] ? BQ(s[0], s[2]) : P(Q(s[0]))), a: mcKeep(AP_NAMES, AP_NAMES.indexOf(s[1])),
        hint: 'Trust in the writer? Feeling? Reasons and evidence?',
        steps: ['Ask the three questions: why trust the writer, how should I feel, what reasons are given?', AP_WHY[s[1]], 'So it leans most on ' + s[1] + '.'] };
    }
    var ps = R.pick(AP_PASS), sents = R.shuffle(ps.slice(1)); sents.unshift(ps[0]);
    if (shape === 'find') {
      var want = R.pick(['ethos', 'pathos']), at = idxOf(sents, function (x) { return x[1] === want; });
      return { q: P('Which numbered sentence leans most on <b>' + want + '</b>?'), a: mcKeep(nums(sents.length), at), viz: markViz(sents.map(function (x) { return x[0]; })),
        hint: want === 'ethos' ? 'Which sentence makes you trust the writer?' : 'Which sentence paints a scene you can feel?',
        steps: sents.map(function (x, i) { return 'Sentence ' + (i + 1) + ': ' + x[1] + '.'; }).concat(['So sentence ' + (at + 1) + ' leans most on ' + want + '.']) };
    }
    var right = []; sents.forEach(function (x, i) { if (x[1] === 'logos') right.push(i); });
    return { q: P('Select <b>every</b> sentence that leans mainly on logos.'), a: mcAll(nums(sents.length), right), viz: markViz(sents.map(function (x) { return x[0]; })),
      hint: 'Logos sentences give facts, numbers or reasons.',
      steps: sents.map(function (x, i) { return 'Sentence ' + (i + 1) + ': ' + x[1] + '.'; }).concat(['The logos sentences are ' + right.map(function (i) { return i + 1; }).join(' and ') + '. Together with the writer’s experience and the vivid scene, they make the case.']) };
  });

  /* ---------------------------------------------------------------- rhet.kairos */
  var KAIROS_CARDS = [
    ['Proposing a later start time at the board meeting where next year’s calendar is voted on.', true], ['Writing to the paper about a dangerous corner the week after a near miss there.', true],
    ['Asking neighbors to join a park cleanup on Earth Day weekend.', true], ['Asking the PTA to fund a field trip at the meeting where it sets next year’s budget.', true],
    ['Inviting families to a flu-shot clinic just before flu season begins.', true], ['Asking the coach about new uniforms right after the season’s budget is announced.', true],
    ['Asking for a bigger field-trip budget the day after the budget was approved.', false], ['Telling a funny story to open a speech at a memorial service.', false],
    ['Proposing a snow-day policy in June, after the last snow day has been forgotten.', false], ['Asking the principal for a new club during the fire drill.', false],
    ['Giving a two-hour speech at the end of a long graduation ceremony.', false], ['Advertising a summer reading contest in August, after school has started.', false]];
  var KAIROS_WHEN = [
    { goal: 'Mei wants the cafeteria to add a salad bar next year.', r: 'In May, when the menu committee plans next year’s food', w: ['In October, after next year’s menu is set', 'Whenever she finishes writing it', 'During the last week of school, when no one is meeting'] },
    { goal: 'Omar wants the town to put a crosswalk by the park.', r: 'At the council meeting where next year’s road projects are chosen', w: ['Right after the road budget is approved', 'In a text message to a friend', 'Once the park closes for the winter'] },
    { goal: 'A club wants volunteers to plant trees on Main Street.', r: 'In early spring, when the planting season is about to start', w: ['In late August, during a heat wave', 'In January, when the ground is frozen', 'The day after the planting deadline'] },
    { goal: 'Nora wants the school to start a bike-to-school day.', r: 'In April, as the weather warms and the spring calendar is set', w: ['In December, during the first snow', 'The week after school lets out', 'During final exams'] },
    { goal: 'The shelter wants families to foster kittens.', r: 'In spring, right before kitten season fills the shelter', w: ['In winter, when few kittens are born', 'After the shelter is already overflowing for months', 'Whenever the staff has time'] }];
  var KAIROS_OPEN = [
    { r: 'After last Tuesday’s near miss at Elm and Fifth, I am asking the council to add a flashing light there.', w: ['Crosswalks are an important part of every town.', 'I have always loved our town’s streets.', 'Many corners in many towns could use a light.'] },
    { r: 'With finals two weeks away, I am asking that the library stay open until 6:00 during exam weeks.', w: ['Libraries have been important for centuries.', 'Studying is something every student does.', 'Books are wonderful, and I love reading them.'] },
    { r: 'Since the shelter ran out of space this week, we are asking ten families to foster a cat for one month.', w: ['Cats make wonderful pets.', 'Animals deserve our kindness.', 'Many shelters exist across the country.'] },
    { r: 'Because the board votes on next year’s calendar on March 3, now is the time to consider an 8:30 start.', w: ['Sleep is important for everyone.', 'School has started early for a long time.', 'Some schools start late and some start early.'] }];
  G('rhet.kairos', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'card', R.pick(['when', 'card']), R.pick(['open', 'when']));
    if (shape === 'card') {
      var c = R.pick(KAIROS_CARDS);
      return { q: P('Is the timing fitting?') + P(c[0]), a: mcKeep(['Good timing', 'Poor timing'], c[1] ? 0 : 1),
        hint: 'Can the audience act on it now, and does it suit the occasion?',
        steps: c[1] ? ['The audience is deciding this question now, or the moment gives people a reason to act.', 'That is kairos: the fitting moment.'] : ['Either the decision has already been made, nobody can act on it now, or the occasion calls for something else.', 'The same words would land better at another moment.'] };
    }
    if (shape === 'when') {
      var k = R.pick(KAIROS_WHEN);
      return { q: P(k.goal + ' When is the best moment to make the request?'), a: mc(k.r, R.sample(k.w, ctx.level === 1 ? 1 : 2)),
        hint: 'When is the audience making this decision?',
        steps: ['Kairos asks: when can this audience act on the request?', 'The best moment is: ' + lc(k.r) + '.', 'At the other times the decision is already made, the season is wrong, or no one is listening.'] };
    }
    var o = R.pick(KAIROS_OPEN);
    return { q: P('Which opening sentence uses <b>kairos</b>: it ties the request to the moment?'), a: mc(o.r, R.sample(o.w, 3)),
      hint: 'Look for a reason why now.',
      steps: [Q(o.r) + ' names what just happened or what is about to be decided.', 'That tells readers why the request matters now.', 'The other openings could be written any time, so they give no reason to act now.'] };
  });

  /* ================================================================ Unit 2: Building an Argument */

  // shared: put items in order. items are given in the right order; the picture shows them shuffled and lettered (quiet
  // wr-order); the answer is the letters in the right order, with wrong orders as distractors.
  function scramble(R, n) { var idx = []; for (var i = 0; i < n; i++) idx.push(i); for (var t = 0; t < 20; t++) { var s = R.shuffle(idx); if (s.join() !== idx.join()) return s; } return idx.slice(1).concat([0]); }
  function orderProblem(R, items, nWrong) {
    var perm = scramble(R, items.length); // display position k shows item perm[k]
    var code = function (order) { return order.map(function (j) { return String.fromCharCode(65 + perm.indexOf(j)); }).join(' '); };
    var rightOrder = items.map(function (x, j) { return j; }), right = code(rightOrder), wrong = [];
    for (var t = 0; t < 60 && wrong.length < nWrong; t++) { var c = code(R.shuffle(rightOrder)); if (c !== right && wrong.indexOf(c) < 0) wrong.push(c); }
    return { viz: { name: 'wr-order', opts: { items: items, start: perm, quiet: true, interactive: false } }, right: right, wrong: wrong, perm: perm };
  }

  /* ---------------------------------------------------------------- rhet.claims */
  var CK = ['Fact', 'Value', 'Policy'];
  var CLAIMS = [
    ['The library closes at 4:00 on weekdays.', 0], ['Our school ended recess for fifth graders in 2022.', 0], ['Most students at our school sleep less than eight hours on school nights.', 0],
    ['Streets with trees are cooler in summer than bare streets.', 0], ['The town pool lost money in each of the last three summers.', 0], ['More students bike to school in May than in January.', 0],
    ['The new bus route will take about twenty minutes longer.', 0], ['Fewer people visited the museum this year than last year.', 0], ['The creek floods at least once every spring.', 0],
    ['Recess is the most important part of the school day.', 1], ['The library’s new reading room is the best place in town to study.', 1], ['Homework is useless.', 1],
    ['The 7:15 start is unfair to students who ride the bus.', 1], ['The new playground is a big improvement over the old one.', 1], ['Our town’s parade is too long to enjoy.', 1],
    ['The school’s dress code is reasonable.', 1], ['The mural on Main Street is beautiful.', 1], ['Volunteering at the shelter is a worthwhile way to spend a Saturday.', 1],
    ['The library should stay open until 8:00.', 2], ['Every elementary student ought to have at least twenty minutes of recess.', 2], ['The district should start high school at 8:30.', 2],
    ['The town should plant trees on Main Street.', 2], ['Our club must hold its meetings after school instead of at lunch.', 2], ['The park district should add benches along the walking path.', 2],
    ['Students should be allowed to retake one test each term.', 2], ['The cafeteria ought to offer a vegetarian lunch every day.', 2], ['The council needs to put a crosswalk at Elm and Fifth.', 2]];
  var CK_WHY = ['It says what is (or was, or will be) so, and it could be checked with records, surveys or measurements.', 'It judges something as good or bad, better or worse; arguing it needs criteria for judging.', 'It says what should be done (should, ought to, must, needs to).'];
  var CK_NEED = ['Evidence that it is true, such as records, a survey or measurements', 'Criteria for judging, and evidence that the thing meets them', 'A problem, a solution, and reasons the solution will work and is worth its costs'];
  // value claims that use "is" (the trouble spot)
  var IS_VALUE = CLAIMS.filter(function (c) { return c[1] === 1 && / (is|are) /.test(c[0]); });
  G('rhet.claims', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['kind', 'which']), R.pick(['kind', 'which', 'need']), R.pick(['isval', 'need', 'which']));
    if (shape === 'which') {
      var k = R.int(0, 2), opts = [0, 1, 2].map(function (j) { return R.pick(CLAIMS.filter(function (c) { return c[1] === j; }))[0]; });
      return { q: P('Which is a claim of <b>' + CK[k].toLowerCase() + '</b>?'), a: mc(opts[k], opts.filter(function (o, j) { return j !== k; })),
        hint: 'Fact: is it so? Value: is it good or bad? Policy: what should we do?',
        steps: opts.map(function (o, j) { return Q(o) + ': ' + CK[j].toLowerCase() + '.'; }).concat([CK_WHY[k]]) };
    }
    if (shape === 'need') {
      var c2 = R.pick(CLAIMS);
      return { q: P('What does this claim need most to be convincing?') + P(Q(c2[0])), a: mcKeep(CK_NEED, c2[1]),
        hint: 'First decide what kind of claim it is.',
        steps: ['Decide the kind: ' + CK[c2[1]].toLowerCase() + '. ' + CK_WHY[c2[1]], 'So it needs: ' + lc(CK_NEED[c2[1]]) + '.'] };
    }
    var c = shape === 'isval' && R.chance(0.6) ? R.pick(IS_VALUE) : R.pick(CLAIMS);
    return { q: P('What kind of claim is this?') + P(Q(c[0])), a: mcKeep(CK, c[1]),
      hint: c[1] === 1 ? 'Could a ruler or a survey settle it, or does it judge?' : 'Fact: is it so? Value: is it good or bad? Policy: what should we do?',
      steps: [CK_WHY[c[1]], c[1] === 1 && / (is|are) /.test(c[0]) ? 'The word is makes it look like a fact, but the claim is a judgment.' : 'Look at the key word: ' + (c[1] === 2 ? 'should, ought or must marks an action.' : c[1] === 0 ? 'nothing here is a judgment; it can be checked.' : 'a judging word like best, unfair or worthwhile.'), 'So it is a claim of ' + CK[c[1]].toLowerCase() + '.'] };
  });

  /* ---------------------------------------------------------------- rhet.reasoning-patterns */
  var PAT = ['Examples', 'Principle', 'Cause and effect', 'Comparison', 'Analogy'];
  var PAT_TEST = ['Are there enough cases, and are they typical?', 'Is the general rule true, and does this case fall under it?', 'Could something else have caused it?', 'Are the two cases alike in the ways that matter?', 'Does the shared feature matter for the claim?'];
  var PAT_WHY = ['It reasons from several cases to a general claim (induction).', 'It applies a general rule to this case (deduction).', 'It says one thing produces another.', 'It reasons from a similar case of the same kind.', 'It reasons from a different kind of thing that shares a feature.'];
  var PATS = [
    ['Our last three bake sales each raised over \\$300, so bake sales are a reliable fundraiser for us.', 0], ['Every student I asked in four different classes wants a longer lunch, so most students probably do.', 0],
    ['The last five times the creek rose this high, the trail flooded, so it will probably flood again.', 0], ['Three schools that added a later start saw attendance rise, so later starts tend to help attendance.', 0],
    ['All library books are due in three weeks, so this one is due on the 14th.', 1], ['Every club must have a faculty sponsor; the chess club has none, so it can’t be approved yet.', 1],
    ['Members must pay dues to vote, and Kai hasn’t paid, so he can’t vote yet.', 1], ['The park closes at dusk, and it is past dusk, so the park is closed.', 1],
    ['The creek floods because the storm drains upstream are clogged with leaves.', 2], ['The broken streetlight leaves the corner dark, so drivers can’t see people crossing there.', 2],
    ['Players who skip warm-ups pull muscles more often, so skipping warm-ups leads to injuries.', 2], ['The new bell schedule cut passing time to three minutes, so students now arrive late to class.', 2],
    ['The next town’s evening swim lessons filled up within a week, so ours would fill up too.', 3], ['Westfield High’s lunch-time tutoring raised grades, so ours, with the same schedule and size, could do the same.', 3],
    ['The east branch library doubled its visitors after adding Sunday hours; the west branch, in a similar neighborhood, could too.', 3], ['Last year’s spring concert sold out in the same gym, so this year’s should draw a full crowd.', 3],
    ['A school without a library is like a kitchen without a pantry.', 4], ['Learning to write without revising is like learning to cook without tasting.', 4],
    ['Liberty is to faction what air is to fire. (Madison, Federalist No. 10)', 4], ['A team without practice is like a garden without water: it withers.', 4], ['Skipping sleep before a test is like draining the gas tank before a road trip.', 4]];
  G('rhet.reasoning-patterns', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['which', 'kind']), R.pick(['kind', 'which', 'test']), R.pick(['test', 'kind']));
    var nP = ctx.level === 1 ? 3 : 5;
    if (shape === 'which') {
      var k = R.int(0, 4), others = R.sample([0, 1, 2, 3, 4].filter(function (j) { return j !== k; }), ctx.level === 1 ? 2 : 3);
      var right = R.pick(PATS.filter(function (x) { return x[1] === k; })), wr = others.map(function (j) { return R.pick(PATS.filter(function (x) { return x[1] === j; })); });
      return { q: P('Which argument reasons by <b>' + PAT[k].toLowerCase() + '</b>?'), a: mc(right[0], wr.map(function (x) { return x[0]; })),
        hint: PAT_WHY[k],
        steps: [right[0], PAT_WHY[k]].concat(wr.map(function (x) { return 'The others use other patterns: ' + Q(x[0]) + ' is ' + PAT[x[1]].toLowerCase() + '.'; }).slice(0, 2)) };
    }
    var a = R.pick(nP === 3 ? PATS.filter(function (x) { return x[1] === 0 || x[1] === 2 || x[1] === 4; }) : PATS);
    if (shape === 'test') {
      return { q: P('Which question best tests this argument?') + P(Q(a[0])), a: mcKeep(PAT_TEST, a[1]),
        hint: 'First name the pattern; each pattern has its own test.',
        steps: ['Pattern: ' + PAT[a[1]].toLowerCase() + '. ' + PAT_WHY[a[1]], 'So the key question is: ' + PAT_TEST[a[1]]] };
    }
    var labels = nP === 3 ? ['Examples', 'Cause and effect', 'Analogy'] : PAT;
    return { q: P('Which pattern of reasoning does this argument use?') + P(Q(a[0])), a: mcKeep(labels, labels.indexOf(PAT[a[1]])),
      hint: 'Several cases? A general rule? A cause? A similar case? A different kind of thing?',
      steps: [PAT_WHY[a[1]], 'So the pattern is ' + PAT[a[1]].toLowerCase() + '. Its test: ' + PAT_TEST[a[1]]] };
  });

  /* ---------------------------------------------------------------- rhet.toulmin */
  var TOUL = [
    { topic: 'a later school start', claim: 'Our school should start at 8:30 instead of 7:15.', grounds: 'Students who start later sleep more and do better in morning classes.', warrant: 'A school should set its hours to help students learn.', backing: 'Helping students learn is the purpose of a school.', qualifier: 'probably', rebuttal: 'unless the buses can’t run on the later schedule' },
    { topic: 'moving the picnic', claim: 'We should move the picnic indoors.', grounds: 'The forecast says heavy rain tomorrow.', warrant: 'Forecasts of heavy rain are usually right, and picnics need dry weather.', backing: 'This season’s rain forecasts have nearly all come true.', qualifier: 'probably', rebuttal: 'unless the storm passes by morning' },
    { topic: 'trees on Main Street', claim: 'The town should plant trees on Main Street.', grounds: 'Streets with trees are cooler in summer than bare streets.', warrant: 'A town should make its streets comfortable for the people who use them.', backing: 'Comfortable streets bring walkers and shoppers downtown.', qualifier: 'in time', rebuttal: 'unless the roots would damage pipes under the street' },
    { topic: 'Sunday library hours', claim: 'The library should open on Sundays.', grounds: 'In a survey of 300 patrons, 62 percent said they would come on Sundays.', warrant: 'A library should be open when many of its patrons can use it.', backing: 'A public library exists to serve the public.', qualifier: 'at least in the afternoon', rebuttal: 'unless the budget can’t cover the extra hours' },
    { topic: 'Kai’s vote in the club election', claim: 'Kai can’t vote in the club election yet.', grounds: 'Kai hasn’t paid his dues.', warrant: 'Members must pay dues before they can vote.', backing: 'The club’s bylaws say so in Article 2.', qualifier: 'almost certainly', rebuttal: 'unless the treasurer grants him extra time' },
    { topic: 'benches in the park', claim: 'The park should add benches along the walking path.', grounds: 'Many older walkers stop to rest on the low wall by the pond.', warrant: 'A park should meet the needs of the people who use it.', backing: 'The park district’s mission is to serve all residents.', qualifier: 'probably', rebuttal: 'unless benches would block the path for strollers' },
    { topic: 'Maya’s recital', claim: 'Maya will likely play well at the recital.', grounds: 'Maya practiced every day for two months.', warrant: 'Steady practice usually leads to a good performance.', backing: 'Music teachers find that daily practice builds skill and calm.', qualifier: 'likely', rebuttal: 'unless she is sick on the day' },
    { topic: 'the creek trail', claim: 'The creek trail will flood this spring.', grounds: 'The snowpack is the deepest in ten years.', warrant: 'Deep snowpack melts into high spring water.', backing: 'Past records show high water after every deep-snow winter.', qualifier: 'very likely', rebuttal: 'unless the snow melts slowly over many weeks' }];
  var TPARTS = ['claim', 'grounds', 'warrant', 'backing', 'qualifier', 'rebuttal'];
  var TLABEL = { claim: 'Claim', grounds: 'Grounds', warrant: 'Warrant', backing: 'Backing', qualifier: 'Qualifier', rebuttal: 'Rebuttal' };
  var TWHY = { claim: 'the claim is what is being argued.', grounds: 'the grounds are the specific evidence offered.', warrant: 'the warrant is the general principle that links the grounds to the claim.', backing: 'the backing supports the warrant itself.', qualifier: 'the qualifier says how sure or how general the claim is.', rebuttal: 'the rebuttal names when the claim would not hold.' };
  var TOUL_ORDER = ['grounds', 'qualifier', 'claim', 'warrant', 'backing', 'rebuttal']; // the kit's layout order (letters A, B, … in quiet mode)
  G('rhet.toulmin', function (R, ctx) {
    var t = R.pick(TOUL), shape = ML.byLevel(ctx, 'basic', R.pick(['label', 'diagram']), R.pick(['label6', 'diagram']));
    if (shape === 'basic') {
      var ask = R.pick(['claim', 'grounds']);
      return { q: P('Here is an argument:') + P(Q(t.grounds + ' So ' + (/^(Kai|Maya)\b/.test(t.claim) ? t.claim : lc(t.claim)))) + P('Which part is the <b>' + (ask === 'claim' ? 'claim' : 'grounds (the evidence)') + '</b>?'),
        a: mc(ask === 'claim' ? t.claim : t.grounds, [ask === 'claim' ? t.grounds : t.claim]),
        hint: 'The claim follows “so.” The grounds come before it.',
        steps: ['Grounds (the evidence): ' + Q(t.grounds), 'Claim (what is argued): ' + Q(t.claim), 'So the ' + ask + ' is the ' + (ask === 'claim' ? 'second' : 'first') + ' sentence.'] };
    }
    if (shape === 'label' || shape === 'label6') {
      var pool = shape === 'label' ? ['claim', 'grounds', 'warrant'] : TPARTS, part = R.pick(pool);
      return { q: P('In an argument about ' + t.topic + ', which part is this?') + P(Q(uc(t[part]))),
        a: mcKeep(pool.map(function (p) { return TLABEL[p]; }), pool.indexOf(part)),
        hint: 'Specific evidence = grounds. A general principle = warrant. What is argued = claim.',
        steps: ['The claim: ' + Q(t.claim), 'The grounds: ' + Q(t.grounds), 'The warrant: ' + Q(t.warrant), 'In Toulmin’s model, ' + TWHY[part], 'So this is the ' + part + '.'] };
    }
    var present = TOUL_ORDER.filter(function (k) { return t[k]; }), want = R.pick(['warrant', 'grounds', 'claim', 'backing']);
    var others = R.sample(present.filter(function (k) { return k !== want && k !== 'qualifier'; }), 3);
    return { q: P('The diagram shows a full argument, with the part names hidden. Which box holds the <b>' + want + '</b>?'), a: mc(uc(t[want]), others.map(function (k) { return uc(t[k]); })),
      viz: { name: 'wr-toulmin', opts: { claim: t.claim, grounds: t.grounds, warrant: t.warrant, backing: t.backing, qualifier: t.qualifier, rebuttal: t.rebuttal, quiet: true, interactive: false } },
      hint: { warrant: 'Look for the general principle.', grounds: 'Look for the specific evidence.', claim: 'Look for what is being argued.', backing: 'Look for what supports the general principle.', rebuttal: 'Look for “unless.”' }[want],
      steps: present.filter(function (k) { return k !== 'qualifier'; }).map(function (k) { return uc(k) + ': ' + Q(uc(t[k])); }).concat(['In Toulmin’s model, ' + TWHY[want]]) };
  });

  /* ---------------------------------------------------------------- rhet.warrants */
  var WARR = [
    { arg: 'Ms. Lee has taught for thirty years, so her advice about study habits is worth following.', w: 'Long experience teaching gives insight into how students learn.', c: 'Ms. Lee’s advice about study habits is worth following.', g: 'Ms. Lee has taught for thirty years.' },
    { arg: 'The park needs more benches because older walkers have nowhere to rest.', w: 'A park should meet the needs of the people who use it.', c: 'The park needs more benches.', g: 'Older walkers have nowhere to rest.' },
    { arg: 'The bridge is icy this morning, so drivers should slow down.', w: 'Drivers should slow down on icy roads, where stopping takes longer.', c: 'Drivers should slow down on the bridge.', g: 'The bridge is icy this morning.' },
    { arg: 'Our team won every game when Sam played goalie, so Sam should start in the final.', w: 'The player who has done best in a position should start there.', c: 'Sam should start in the final.', g: 'Our team won every game when Sam played goalie.' },
    { arg: 'The museum is free on Tuesdays, so the class trip should be on a Tuesday.', w: 'A class trip should be planned to keep costs low for families.', c: 'The class trip should be on a Tuesday.', g: 'The museum is free on Tuesdays.' },
    { arg: 'The recipe calls for fresh basil, and we only have dried, so the sauce may taste different.', w: 'Changing an ingredient can change how a dish tastes.', c: 'The sauce may taste different.', g: 'We only have dried basil, not fresh.' },
    { arg: 'The new crosswalk has a countdown timer, so it will help slow walkers cross safely.', w: 'Knowing how much time is left helps people decide when to start crossing.', c: 'The crosswalk will help slow walkers cross safely.', g: 'The new crosswalk has a countdown timer.' },
    { arg: 'Lena edits the school paper, so she should proofread our club’s newsletter.', w: 'People with editing experience are good at catching errors.', c: 'Lena should proofread our club’s newsletter.', g: 'Lena edits the school paper.' }];
  var WEAK_W = [ // arguments whose warrant a careful reader would reject, and the warrant
    ['Three towns near us built splash pads, so our town should build one too.', 'What neighboring towns build, we should build.'],
    ['Everyone on my street has a trampoline, so trampolines must be safe.', 'If many people own something, it must be safe.'],
    ['The team started losing after we got new uniforms, so the uniforms are bad luck.', 'Whatever comes before a change must have caused it.'],
    ['The mayor is a great dancer, so her budget plan must be good.', 'Someone skilled in one thing is right about everything.'],
    ['This phone is the most expensive, so it must be the best.', 'The most expensive thing is always the best.']];
  var GOOD_W = WARR.map(function (x) { return [x.arg, x.w]; });
  G('rhet.warrants', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['find', 'gw']), R.pick(['find', 'gw']), R.pick(['weak', 'find']));
    if (shape === 'gw') {
      var x = R.pick(WARR), isW = R.coin();
      return { q: P('Argument: ' + Q(x.arg)) + P('Is this sentence the <b>grounds</b> or the <b>warrant</b>?') + P(Q(isW ? x.w : x.g)), a: mcKeep(['Grounds', 'Warrant'], isW ? 1 : 0),
        hint: 'Does it name one particular fact, or a general principle?',
        steps: isW ? ['The sentence states a general principle that would apply to many cases.', 'It connects the specific fact to the claim, so it is the warrant.'] : ['The sentence names one particular fact about this case.', 'Specific evidence is the grounds.'] };
    }
    if (shape === 'weak') {
      var bad = R.pick(WEAK_W), good = R.sample(GOOD_W, 2);
      return { q: P('Which argument rests on the <b>weakest warrant</b>?'), a: mc(bad[0], good.map(function (g) { return g[0]; })),
        hint: 'State each warrant as a general rule. Which rule would a careful reader reject?',
        steps: ['Warrant of ' + Q(bad[0]) + ': ' + Q(bad[1]), 'Stated plainly, that rule is clearly too broad; a careful reader would reject it.', 'The other arguments rest on reasonable principles, such as ' + Q(good[0][1])] };
    }
    var w = R.pick(WARR), wr = ctx.level === 1 ? [w.c] : [w.c, w.g];
    if (ctx.level === 3) wr.push(R.pick(WARR.filter(function (y) { return y !== w; })).w);
    return { q: P('This argument leaves its warrant unstated. Which is the warrant?') + P(Q(w.arg)), a: mc(w.w, wr),
      hint: 'A warrant is a general principle; it would apply to other cases too.',
      steps: ['Claim: ' + Q(w.c), 'Grounds: ' + Q(w.g), 'The warrant is the general principle that makes the grounds count as a reason: ' + Q(w.w), 'Restating the claim or the grounds is not a warrant.'] };
  });

  /* ---------------------------------------------------------------- rhet.qualifiers */
  var QUAL = [
    { ev: 'A survey of 40 students at our school found that 31 want a later start.', r: 'Most students we surveyed want a later start.', o: ['All teenagers hate early starts.', 'Every student in the country wants a later start.'], m: 'It might perhaps be possible that some students could maybe want a later start.', q: 'Most' },
    { ev: 'Bikes left unlocked at our school’s rack were stolen twice this fall.', r: 'Unlocked bikes at our school have been stolen.', o: ['Every bike left at school will be stolen.', 'No bike is ever safe anywhere.'], m: 'Bikes may or may not possibly be at some risk, perhaps.', q: 'Unlocked' },
    { ev: 'Several studies found that students who sleep more tend to earn higher grades.', r: 'Students who sleep more tend to do better in school.', o: ['Sleep guarantees good grades.', 'Every tired student fails.'], m: 'Sleep could conceivably have some possible link to something about school.', q: 'tend to' },
    { ev: 'At our school, the three clubs that met at lunch lost half their members after lunch was shortened.', r: 'Shorter lunches may hurt clubs that meet at lunch.', o: ['Shorter lunches destroy every club.', 'Clubs never survive schedule changes.'], m: 'Maybe some things might possibly happen to some clubs sometimes.', q: 'may' },
    { ev: 'In our class, 20 of 24 students said phone alerts broke their focus during homework.', r: 'In our class, most students said phone alerts broke their focus during homework.', o: ['Phones ruin every student’s ability to focus.', 'No one can focus with a phone nearby.'], m: 'Phones might perhaps sometimes possibly affect some focus somewhat.', q: 'most' },
    { ev: 'The forecast gives an 80 percent chance of rain on Saturday.', r: 'It will probably rain on Saturday.', o: ['It will definitely rain on Saturday.', 'Saturday will be a total washout everywhere.'], m: 'There may or may not be some kind of weather of some sort on Saturday.', q: 'probably' },
    { ev: 'Two of the four oak trees on our street lost large branches in the last storm.', r: 'Some of the oaks on our street are vulnerable to storm damage.', o: ['All oak trees are dangerous.', 'Every tree will fall in the next storm.'], m: 'Trees might possibly have some issues, perhaps, maybe.', q: 'Some' }];
  var QWORDS = ['most', 'usually', 'probably', 'often', 'some', 'may', 'tend to', 'in many cases', 'likely'];
  G('rhet.qualifiers', function (R, ctx) {
    var x = R.pick(QUAL), shape = ML.byLevel(ctx, 'match', R.pick(['match', 'over']), R.pick(['hedge', 'over']));
    if (shape === 'over') {
      var o = R.pick(x.o);
      return { q: P('Evidence: ' + Q(x.ev)) + P('A writer claims: ' + Q(o) + ' What is wrong with the claim?'),
        a: mc('It claims far more than the evidence shows; it needs a qualifier.', ['Nothing: absolute claims are stronger.', 'It needs more emotional language.', 'It should not mention the evidence.']),
        hint: 'Compare the size of the claim with the size of the evidence.',
        steps: ['The evidence covers a limited group or a likelihood.', Q(o) + ' says all, every, never or definitely: far beyond the evidence.', 'One counterexample would knock it down. A matched claim: ' + Q(x.r)] };
    }
    if (shape === 'hedge') {
      var ov = R.pick(x.o);
      return { q: P('Evidence: ' + Q(x.ev)) + P('Which claim is qualified <b>just enough</b>: not overstated, and not hedged into nothing?'), a: mc(x.r, [ov, x.m]),
        hint: 'Match the claim to the evidence, then say it firmly.',
        steps: ['An overstated claim (' + Q(ov) + ') goes beyond the evidence.', 'A claim buried in maybes (' + Q(x.m) + ') says nothing a reader can use; Strunk called this hesitating, non-committal language.', Q(x.r) + ' claims exactly what the evidence shows, and says it plainly.'] };
    }
    var wr = ctx.level === 1 ? [x.o[0]] : x.o;
    return { q: P('Evidence: ' + Q(x.ev)) + P('Which claim matches the evidence?'), a: mc(x.r, wr),
      hint: 'How much does the evidence cover? Look for all, every, never.',
      steps: ['The evidence covers a limited group or a likelihood, not everyone everywhere.', Q(x.r) + ' is limited to what the evidence shows (note the qualifying words).', 'The other claims say all, every or never, so one counterexample would refute them.'] };
  });

  /* ---------------------------------------------------------------- rhet.evidence-quality */
  var EQ_TESTS = ['Relevant', 'Sufficient', 'Accurate', 'Current', 'Fairly represented'];
  var EQ_WHY = ['It doesn’t bear on this claim, however true it is.', 'There is too little of it (one case, a tiny sample) to support a general claim.', 'It is unsourced, wrong or copied incorrectly.', 'It is too old for a claim about now.', 'It changes what the source said, for example by cutting a quotation.'];
  var EQ = [ // [claim, evidence, failed test index]
    ['Students are too tired for a 7:15 start.', 'The bus contract costs \\$2 million a year.', 0], ['The crosswalk at Elm and Fifth is dangerous.', 'Elm Street was named after the trees that once lined it.', 0],
    ['The library should open on Sundays.', 'The library’s carpet was replaced in 2019.', 0], ['Our team needs a new practice field.', 'The team’s colors are blue and gold.', 0],
    ['Teenagers in our state want later school start times.', 'My best friend told me she wants a later start.', 1], ['Students at our school don’t eat breakfast.', 'Two students in my homeroom skipped breakfast today.', 1],
    ['The new playground is unsafe.', 'One child scraped a knee there last week.', 1], ['The lunch menu is unpopular.', 'Three people at my table complained on Monday.', 1],
    ['Most of our students walk to school.', 'A number on a flyer with no source says 90 percent walk.', 2], ['The pool lost money last summer.', 'A post online, from an unknown account, says the pool lost a million dollars.', 2],
    ['Phone use at lunch has grown at our school.', 'A survey of our students from 2001.', 3], ['Bus fares in our town are too high today.', 'A newspaper article listing fares from 1995.', 3],
    ['Most students now study with laptops.', 'A school report from 2004 on computer labs.', 3],
    ['The review praised the new park.', 'The review said “beautiful, but the parking lot is far too small,” quoted only as “beautiful.”', 4], ['The coach supports the new schedule.', 'The coach said, “I support the schedule only if we keep weekend practice,” quoted as “I support the schedule.”', 4],
    ['The principal says phones help learning.', 'The principal said phones help learning “only when teachers plan for them,” quoted without that part.', 4]];
  var EQ_STRONG = [
    ['The crosswalk at Elm and Fifth is dangerous.', 'Police records show 4 crashes there in 2 years, the most of any corner in town.'], ['Students want a later start.', 'A 2024 survey of 600 of our school’s 800 students found that 71 percent want a later start.'],
    ['The late bus is too crowded.', 'The transportation office’s sign-in sheets show 30 to 40 students turned away each week this fall.'], ['The library should open on Sundays.', 'During a four-weekend trial this fall, 900 people visited on Sundays.'],
    ['The creek trail floods every spring.', 'The parks department has closed the trail for flooding every April for the past eight years.']];
  G('rhet.evidence-quality', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['sw', 'strongest']), R.pick(['test', 'sw', 'strongest']), R.pick(['strongest', 'test']));
    if (shape === 'sw') {
      var strong = R.coin(), it = strong ? R.pick(EQ_STRONG) : R.pick(EQ);
      return { q: P('Claim: ' + Q(it[0])) + P('Evidence: ' + it[1]) + P('Is this strong or weak evidence for the claim?'), a: mcKeep(['Strong', 'Weak'], strong ? 0 : 1),
        hint: 'Is it relevant, sufficient, accurate, current and fair?',
        steps: strong ? ['It bears directly on the claim, comes from records or a large sample, and is recent.', 'So it is strong evidence.'] : ['It fails a test: ' + EQ_TESTS[it[2]].toLowerCase() + '.', EQ_WHY[it[2]], 'So it is weak evidence for this claim.'] };
    }
    if (shape === 'strongest') {
      var s = R.pick(EQ_STRONG), weak = R.sample(EQ, ctx.level === 1 ? 1 : 2);
      if (weak.length === 1) weak.push(weak[0]);
      return { q: P('A writer argues: ' + Q(s[0]) + ' Which piece of evidence would support <b>this</b> claim best?'),
        a: mc(s[1], ctx.level === 1 ? [weak[0][1]] : [weak[0][1], weak[1][1]]),
        hint: 'Weigh each one: does it bear on this claim, and is there enough of it?',
        steps: [Q(s[1]) + ' bears directly on the claim and comes from records or a large, recent sample.', 'The others are about different claims or fail a test (' + EQ_TESTS[weak[0][2]].toLowerCase() + ', ' + EQ_TESTS[weak[1][2]].toLowerCase() + ').'] };
    }
    var e = R.pick(EQ);
    return { q: P('Claim: ' + Q(e[0])) + P('Evidence: ' + e[1]) + P('Which test does this evidence fail?'), a: mcKeep(EQ_TESTS, e[2]),
      hint: 'Relevant? Enough? Correct? Recent? True to the source?',
      steps: [EQ_WHY[e[2]], 'So it fails the test: ' + EQ_TESTS[e[2]].toLowerCase() + '.'] };
  });

  /* ---------------------------------------------------------------- rhet.counterargument */
  var COUNTER = [
    { c: 'The high school should start at 8:30.', s: 'A later start would push sports and after-school jobs later into the evening, and the buses are shared with the elementary schools.', w: ['Opponents just like making teenagers suffer.', 'Teenagers would only waste the extra time sleeping.', 'People who want early starts never went to high school.'] },
    { c: 'The town should plant trees on Main Street.', s: 'Tree roots can crack sidewalks and pipes, and young trees need years of watering and trimming.', w: ['People against the trees just hate nature.', 'Opponents want the town to be an ugly parking lot.', 'Anyone who disagrees has never seen a tree.'] },
    { c: 'The library should open on Sundays.', s: 'Sunday hours would cost money for staff, and the budget is already stretched.', w: ['People who oppose it don’t care about reading.', 'Opponents want everyone to stay home and do nothing.', 'Only lazy librarians would object.'] },
    { c: 'The town should add a bike lane on Oak Street.', s: 'A bike lane would remove parking spaces that the shops on Oak Street depend on.', w: ['Opponents of the bike lane want everyone stuck in traffic forever.', 'People who object are just afraid of bikes.', 'Anyone against it has never ridden a bike.'] },
    { c: 'Our school should have a four-day week.', s: 'A four-day week can leave working parents without child care on the fifth day.', w: ['Opponents just want kids to be miserable five days a week.', 'People against it love long school days.', 'Critics only care about their own schedules.'] },
    { c: 'The park should add benches along the walking path.', s: 'Benches cost money to maintain and could crowd a narrow path.', w: ['People against benches want older walkers to suffer.', 'Opponents hate comfort.', 'Only grumpy people would object to benches.'] },
    { c: 'The cafeteria should offer a vegetarian lunch every day.', s: 'A daily second option could raise costs and waste food if few students choose it.', w: ['People against it just hate vegetables.', 'Opponents want everyone to eat the same boring food.', 'Critics don’t care what students eat.'] }];
  G('rhet.counterargument', function (R, ctx) {
    var x = R.pick(COUNTER), shape = ML.byLevel(ctx, 'fair', 'strongest', R.pick(['strongest', 'fair']));
    if (shape === 'fair') {
      var isFair = R.coin(), st = isFair ? x.s : R.pick(x.w);
      return { q: P('Claim: ' + Q(x.c)) + P('Is this a fair statement of the other side, or a straw man?') + P(Q(st)), a: mcKeep(['Fair statement', 'Straw man'], isFair ? 0 : 1),
        hint: 'Would people who hold that view say, “Yes, that’s what I think”?',
        steps: isFair ? ['It states a real concern that thoughtful opponents raise, in terms they would accept.', 'That is a fair statement of the counterargument.'] : ['It invents a bad motive or exaggerates the other side’s view.', 'No supporter of that view would accept it, so it is a straw man.'] };
    }
    return { q: P('Claim: ' + Q(x.c)) + P('Which counterargument is the <b>strongest</b> one to state and answer?'), a: mc(x.s, R.sample(x.w, ctx.level === 3 ? 3 : 2)),
      hint: 'Pick the objection thoughtful opponents would make.',
      steps: [Q(x.s) + ' is what thoughtful opponents say: a real cost or risk.', 'The others attack motives or exaggerate the other side: straw men.', 'Answering a straw man persuades no one who holds the real view.'] };
  });

  /* ---------------------------------------------------------------- rhet.concession-rebuttal */
  var CONC = [
    { obj: 'Trees on Main Street would cost money to water and trim.', good: 'Granted, young trees need care for a few years; but the garden club has offered to water them, and shade brings shoppers back to Main Street in summer.', much: 'They’re right that trees cost money, and money is tight, so maybe we shouldn’t plant them, though I still like trees.', attack: 'Only cheap, selfish people worry about the cost of trees.', none: 'That’s wrong, and everyone knows it.' },
    { obj: 'A later start would push practices into the evening.', good: 'It is true that practices would end later; but districts that moved to 8:30 shifted practices by only half an hour, and students gained an hour of sleep each morning.', much: 'Practices would end later, and that is a serious problem with no answer, so a later start may not be worth it after all.', attack: 'Coaches only care about winning, not students.', none: 'That objection makes no sense.' },
    { obj: 'Sunday library hours would cost money.', good: 'Yes, Sunday hours would add staff costs; but four hours on Sunday cost less than one part-time salary, and the trial drew 900 visitors.', much: 'Sunday hours would cost money, which we don’t have, so I suppose the library should stay closed, even though I wish it wouldn’t.', attack: 'The people raising costs just don’t read.', none: 'Money shouldn’t matter at all.' },
    { obj: 'A bike lane would remove parking spaces.', good: 'Admittedly, the lane would remove twelve spaces; but the town lot one block away is rarely more than half full.', much: 'The lane would remove parking, and shops need parking, so the lane is probably a bad idea, but I want it anyway.', attack: 'Store owners are just greedy.', none: 'Parking doesn’t matter.' },
    { obj: 'Benches cost money to maintain.', good: 'Benches do need upkeep; but metal benches last twenty years with little care, and the senior center has offered to raise the money.', much: 'Benches cost money, and the parks budget is small, so we probably can’t afford them and shouldn’t ask.', attack: 'Only people who never walk would worry about benches.', none: 'There is no real cost.' }];
  var REB = ['Dispute the evidence', 'Dispute the reasoning', 'Outweigh'];
  var REB_S = [
    ['The cost figure leaves out the state grant that would pay half.', 0], ['That survey asked only ten people, all from one street.', 0], ['The crash numbers they cite are from before the light was installed.', 0],
    ['Fewer riders in January doesn’t mean the bike lane is unused the rest of the year.', 1], ['A pool losing money in one rainy summer doesn’t show it will lose money every year.', 1], ['That one school failed with a later start doesn’t mean every school will.', 1],
    ['Practices would end later, but students would gain an hour of sleep every school day.', 2], ['The benches cost money, but they would let hundreds of older residents use the park each week.', 2], ['Yes, the lane removes parking, but safer streets bring more customers on foot.', 2]];
  G('rhet.concession-rebuttal', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['best', 'part']), R.pick(['best', 'kind', 'part']), R.pick(['kind', 'best']));
    if (shape === 'part') {
      var cc = R.pick(CONC), halves = cc.good.split('; but '), askC = R.coin();
      var conc = halves[0] + ';', reb = 'but ' + halves[1];
      return { q: P('Objection: ' + Q(cc.obj)) + P('Response: ' + Q(cc.good)) + P('Which part is the <b>' + (askC ? 'concession' : 'rebuttal') + '</b>?'), a: mc(askC ? conc : reb, [askC ? reb : conc]),
        hint: 'The concession grants what is true; the rebuttal answers it.',
        steps: ['Concession (grants what is true): ' + Q(conc), 'Rebuttal (answers with a reason): ' + Q(reb), '“Granted …; but …” is the classic shape.'] };
    }
    if (shape === 'kind') {
      var r = R.pick(REB_S);
      return { q: P('What kind of rebuttal is this?') + P(Q(r[0])), a: mcKeep(REB, r[1]),
        hint: 'Does it say the facts are wrong, the facts don’t lead there, or the other side matters less?',
        steps: [['It says the other side’s facts are wrong or incomplete.', 'It accepts the facts but says they don’t lead to the conclusion.', 'It accepts the point but shows that something on the writer’s side matters more.'][r[1]], 'So it is: ' + REB[r[1]].toLowerCase() + '.'] };
    }
    var c = R.pick(CONC), wr = ctx.level === 1 ? [c.attack] : [c.attack, c.much, c.none].slice(0, ctx.level === 2 ? 2 : 3);
    return { q: P('Objection: ' + Q(c.obj)) + P('Which response concedes and rebuts best?'), a: mc(c.good, wr),
      hint: 'Grant what is true, answer with a reason, and keep your claim standing.',
      steps: ['The best response grants what is true (“Granted …”) and then answers with a reason or evidence (“but …”).', Q(c.good), 'Attacking the people is not an answer; conceding everything gives up the claim; flat denial answers nothing.'] };
  });

  /* ---------------------------------------------------------------- rhet.arrangement */
  var ARR = ['Exordium', 'Narratio', 'Partitio', 'Confirmatio', 'Refutatio', 'Peroratio'];
  var ARR_JOB = ['wins the audience’s attention and goodwill', 'tells the background the audience needs', 'states the claim and the points to come', 'gives the reasons and evidence', 'answers the opposing views', 'sums up and moves the audience'];
  var ARR_EN = ['introduction', 'statement of facts', 'division', 'proof', 'refutation', 'conclusion'];
  var ARR_S = [
    ['Every one of us has waited at a corner, hoping the driver sees us.', 0], ['I am grateful to the council for hearing from students tonight.', 0], ['Picture Main Street on a July afternoon: bare pavement and empty benches.', 0],
    ['For thirty years, the library has closed at 4:00 on weekdays.', 1], ['Last spring, the district surveyed families about the start time, and the board tabled the question.', 1], ['Main Street lost its last trees in the 1970s, when the road was widened.', 1],
    ['There are two reasons to add Sunday hours: demand is high, and the cost is low.', 2], ['I will show that a later start helps attendance, grades and safety.', 2], ['The town should plant trees on Main Street, for comfort, for business, and for the street’s future.', 2],
    ['The four-weekend trial drew 900 visitors, more than most weekday afternoons.', 3], ['Districts that moved to 8:30 saw first-period absences fall.', 3], ['Shaded streets can be many degrees cooler in summer than bare ones.', 3],
    ['Some say the trees would crack the sidewalks; but root barriers prevent that at little cost.', 4], ['Critics worry about evening practices; yet most teams shifted by only half an hour.', 4], ['It is true that Sunday staff cost money, but the trial was paid for by a small grant.', 4],
    ['Let us give the next generation a Main Street worth walking.', 5], ['Vote for the later start, and give every student an hour they can’t get back any other way.', 5], ['Open the doors on Sunday, and the library will be what it was built to be: a place for everyone.', 5]];
  G('rhet.arrangement', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['job', 'fits']), R.pick(['sentence', 'fits']), R.pick(['order', 'sentence']));
    if (shape === 'fits') {
      var kf = R.int(0, 5), rightF = R.pick(ARR_S.filter(function (x) { return x[1] === kf; }));
      var wrongF = R.sample(ARR_S.filter(function (x) { return x[1] !== kf; }), 2);
      return { q: P('Which sentence would fit the <b>' + lc(ARR[kf]) + '</b> (' + ARR_EN[kf] + '), the part that ' + ARR_JOB[kf] + '?'), a: mc(rightF[0], wrongF.map(function (x) { return x[0]; })),
        hint: 'Match the sentence to the job.',
        steps: ['The ' + lc(ARR[kf]) + ' ' + ARR_JOB[kf] + '.', Q(rightF[0]) + ' does that job.'].concat(wrongF.map(function (x) { return Q(x[0]) + ' belongs in the ' + lc(ARR[x[1]]) + ' (' + ARR_EN[x[1]] + ').'; })) };
    }
    if (shape === 'job') {
      var k = R.int(0, 5);
      return { q: P('In the classical arrangement, which part ' + ARR_JOB[k] + '?'), a: mcKeep(ARR, k),
        hint: 'Exordium, narratio, partitio, confirmatio, refutatio, peroratio: introduction, facts, division, proof, refutation, conclusion.',
        steps: ARR.map(function (n, i) { return n + ' (' + ARR_EN[i] + '): ' + ARR_JOB[i] + '.'; }).concat(['So the answer is the ' + lc(ARR[k]) + '.']) };
    }
    if (shape === 'sentence') {
      var s = R.pick(ARR_S);
      return { q: P('Which part of a classical argument does this sentence most likely come from?') + P(Q(s[0])), a: mcKeep(ARR.map(function (n, i) { return n + ' (' + ARR_EN[i] + ')'; }), s[1]),
        hint: 'What job does the sentence do: attention, background, preview, proof, answer, or close?',
        steps: ['The sentence ' + ARR_JOB[s[1]] + '.', 'That is the job of the ' + lc(ARR[s[1]]) + ' (' + ARR_EN[s[1]] + ').'] };
    }
    var items = ARR.map(function (n, i) { return n + ': ' + ARR_JOB[i]; }), op = orderProblem(R, items, 3);
    return { q: P('The cards show the six parts of the classical arrangement, mixed up. Which order is the usual one?'), a: mc(op.right, op.wrong), viz: op.viz,
      hint: 'Attention first, then background, then the claim, proof, answers to objections, and a close.',
      steps: ['The usual order: exordium, narratio, partitio, confirmatio, refutatio, peroratio.', 'In card letters: ' + op.right + '.', 'Writers may move the refutation earlier for a skeptical audience, but this is the usual order.'] };
  });

  /* ---------------------------------------------------------------- rhet.fallacies-in-writing */
  var FN = ['Attacking the Person', 'Straw Man', 'False Dilemma', 'Hasty Generalization', 'Slippery Slope', 'Red Herring', 'Appeal to the People', 'False Cause'];
  var NOF = 'No fallacy: a reasonable argument';
  var FWHY = ['It rejects a claim by attacking the person who made it, not the reasons.', 'It replaces the other side’s real view with a weaker, exaggerated one.', 'It offers only two options when there are others.', 'It draws a conclusion about a whole group from too few cases.', 'It predicts a chain of bad results with no reason to think each step would follow.', 'It changes the subject and treats the original question as settled.', 'It says a claim is true or good because many people believe or do it.', 'It says one thing caused another just because it came first.'];
  var FALL = [
    ['Of course she wants a skate park; she’s a teenager.', 0], ['Why listen to his ideas about the budget? He failed math in high school.', 0], ['The new coach’s plan can’t be any good; she’s from out of town.', 0], ['You can’t trust the librarian’s survey; she just wants to keep her job.', 0],
    ['Supporters of the bike lane want to ban cars from town completely.', 1], ['People who want a later start just want teenagers to sleep all day.', 1], ['Those who want new library hours think the library should never close.', 1],
    ['Either we close the pool or we raise everyone’s taxes.', 2], ['You’re either with the team on this or you don’t care about the school.', 2], ['We can cancel the field trip or let students run wild; there is no other choice.', 2],
    ['Two kids skipped class, so students here don’t care about school.', 3], ['I tried the new cafeteria pizza once and it was cold, so all the food there is bad.', 3], ['My cousin got lost in that park, so the park is impossible to navigate.', 3],
    ['Allow phones at lunch, and soon no one will learn anything at all.', 4], ['If we let students pick one elective, next they’ll want to skip math, and then school will mean nothing.', 4], ['If we repaint one classroom, every teacher will demand a remodel, and the district will go broke.', 4],
    ['Why worry about the library’s hours when the roads are full of potholes?', 5], ['Some say the parade route is unsafe, but our town has always had a lot of spirit.', 5], ['The lunch line is slow, but have you seen how nice the new gym floor is?', 5],
    ['Everyone in town already supports the new stadium, so it must be a good idea.', 6], ['Most kids in my class have this phone, so it must be the best one.', 6], ['Thousands of people signed up for the diet, so it must work.', 6],
    ['The team lost after the new coach arrived, so she is the problem.', 7], ['I wore my lucky socks and passed the test, so the socks helped.', 7], ['Crime fell the year the new mayor took office, so she must have caused it.', 7]];
  var FALL_OK = ['The pool lost about \\$20,000 a year for three years, according to the parks report, so its hours should be reviewed.', 'Nearly all the veterinarians in the state survey recommend yearly checkups, so you should probably take your dog in.',
    'A survey of 600 of our 800 students found most want a later start, so the board should consider one.', 'The bridge is icy this morning, so drivers should slow down.', 'Three nearby districts that moved to 8:30 kept every sports team, so a later start need not end our teams.',
    'The forecast calls for heavy rain, so the picnic should probably move indoors.'];
  G('rhet.fallacies-in-writing', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'name', R.pick(['name', 'ornot']), R.pick(['passage', 'ornot', 'name']));
    if (shape === 'ornot') {
      var ok = R.chance(0.4);
      if (ok) { var good = R.pick(FALL_OK); return { q: P('Does this argument contain a fallacy? If so, which?') + P(Q(good)), a: mc(NOF, R.sample(FN, 3)),
        hint: 'A fallacy is a flaw in the reasoning, not a conclusion you might disagree with.',
        steps: ['Check the step from reasons to claim.', 'The evidence is relevant and from a fair source, and the claim is qualified to match it.', 'So there is no fallacy. Disagreeing with a conclusion doesn’t make the reasoning faulty.'] }; }
      var f0 = R.pick(FALL);
      return { q: P('Does this argument contain a fallacy? If so, which?') + P(Q(f0[0])), a: mc(FN[f0[1]], [NOF].concat(R.sample(FN.filter(function (n, i) { return i !== f0[1]; }), 2))),
        hint: 'Find the step that goes wrong, then name what it does.',
        steps: [FWHY[f0[1]], 'So it is ' + FN[f0[1]].toLowerCase() + '.'] };
    }
    if (shape === 'passage') {
      var f = R.pick(FALL), oks = R.sample(FALL_OK, 3), at = R.int(0, 3), sents = oks.slice(); sents.splice(at, 0, f[0]);
      return { q: P('A letter to the editor. Which numbered sentence contains a fallacy?'), a: mcKeep(nums(4), at), viz: markViz(sents),
        hint: 'Look for an attack on people, a distorted view, only two options, too few cases, a chain of results, a change of subject, popularity, or “it came first.”',
        steps: ['The other sentences give relevant reasons with fair evidence.', 'Sentence ' + (at + 1) + ': ' + FWHY[f[1]], 'It is ' + FN[f[1]].toLowerCase() + '.'] };
    }
    var g = R.pick(FALL), nw = ctx.level === 1 ? 2 : 3;
    return { q: P('Which fallacy does this sentence commit?') + P(Q(g[0])), a: mc(FN[g[1]], R.sample(FN.filter(function (n, i) { return i !== g[1]; }), nw)),
      hint: 'Ask what the faulty step does.',
      steps: [FWHY[g[1]], 'The Logic Ladder calls this ' + FN[g[1]].toLowerCase() + '.'] };
  });

  /* ---------------------------------------------------------------- rhet.defensible-thesis */
  var DT_FLAW = ['It is a fact no one disputes.', 'It is a pure preference no evidence could settle.', 'It only announces the topic.', 'It is too broad or vague to argue.', 'Nothing: it is defensible.'];
  var THESES = [
    { d: 'The library should stay open until 6:00 during exam weeks.', f: 'The library is open until 4:00.', p: 'I like the library’s blue chairs best.', a: 'This essay is about library hours.', v: 'Libraries are important in many ways.' },
    { d: 'Elementary schools should not take away recess as a punishment.', f: 'Recess is part of the school day.', p: 'Tag is the most fun recess game.', a: 'In this essay I will discuss recess.', v: 'Recess affects kids in lots of ways.' },
    { d: 'The town should add a crosswalk at Elm and Fifth before school starts in the fall.', f: 'Elm and Fifth is a corner in our town.', p: 'Elm Street has the prettiest houses.', a: 'This paper will talk about crosswalks.', v: 'Traffic is a big issue in society today.' },
    { d: 'A four-day school week would cost families more in child care than it would save the district.', f: 'Some districts have four-day weeks.', p: 'Fridays are my favorite day.', a: 'I am going to write about the four-day week.', v: 'The school week has many effects.' },
    { d: 'Our school should let students retake one test each term, because a second try rewards learning over luck.', f: 'Our school gives tests.', p: 'I like essay tests more than quizzes.', a: 'This essay will look at test retakes.', v: 'Testing is a complicated subject.' },
    { d: 'Planting trees on Main Street would bring more shoppers downtown in summer.', f: 'Main Street has a bakery and a hardware store.', p: 'Maples are prettier than oaks.', a: 'My topic is trees on Main Street.', v: 'Trees are good for the world in many ways.' },
    { d: 'The cafeteria should offer a vegetarian lunch every day, since a survey found steady demand for one.', f: 'The cafeteria serves lunch at noon.', p: 'Pizza is the best lunch.', a: 'This essay discusses the cafeteria.', v: 'Food matters to everyone.' }];
  var DT_KEYS = ['f', 'p', 'a', 'v'];
  G('rhet.defensible-thesis', function (R, ctx) {
    var t = R.pick(THESES), shape = ML.byLevel(ctx, 'pick', 'pick', R.pick(['flaw', 'pick']));
    if (shape === 'flaw') {
      var k = R.int(0, 4), text = k === 4 ? t.d : t[DT_KEYS[k]];
      return { q: P('What, if anything, is wrong with this thesis for an argument essay?') + P(Q(text)), a: mcKeep(DT_FLAW, k),
        hint: 'Could a thoughtful person disagree? Could evidence move them?',
        steps: [['No one would dispute it, so there is nothing to argue.', 'It is a matter of taste; no evidence could change anyone’s mind.', 'It names a topic but takes no position.', 'It is too broad to defend in one essay; it takes no clear side.', 'It takes a position reasonable people could dispute, and evidence could support it.'][k], 'So: ' + lc(DT_FLAW[k])] };
    }
    var wr = R.sample(DT_KEYS, ctx.level === 1 ? 2 : 3).map(function (k) { return t[k]; });
    return { q: P('Which is a <b>defensible</b> thesis for an argument essay?'), a: mc(t.d, wr),
      hint: 'It must take a side someone could dispute, and be supportable with evidence.',
      steps: [Q(t.d) + ' takes a position reasonable people could dispute, and evidence could support it.', 'The others are a fact, a preference, an announcement or a vague statement.'] };
  });

  /* ---------------------------------------------------------------- rhet.argument-essay */
  var ROLE3 = ['Claim', 'Evidence', 'Commentary'];
  var BODY = [
    [['A later start would cut first-period absences.', 0], ['When one district moved its start from 7:30 to 8:30, first-period absences dropped by about a quarter.', 1], ['Students who can’t wake for a 7:30 bell often skip the first class rather than arrive late.', 2], ['A start that fits their sleep keeps them in the room for the lessons they now miss.', 2]],
    [['Bike lanes make streets safer.', 0], ['A city study found fewer crashes on streets after lanes were added.', 1], ['Lanes give riders a predictable space, so drivers expect them.', 2], ['That predictability is what would make Oak Street safe enough for students to ride to school.', 2]],
    [['Sunday hours would serve people the library now misses.', 0], ['During a four-weekend trial, 900 people visited on Sundays.', 1], ['That is more than the library sees on most weekday afternoons.', 2], ['Many of those visitors work on weekdays, so Sunday is their only chance to come.', 2]],
    [['A footbridge would make the walk to school safe.', 0], ['About forty children walk along the road shoulder each morning, where the speed limit is 45.', 1], ['At that speed, a driver has little time to react to a child near the edge.', 2], ['A bridge would take those children off the road entirely.', 2]]];
  var ESSAY_PARTS = ['Introduction: hook, context and a defensible thesis', 'First reason: claim, evidence, commentary', 'Second reason: claim, evidence, commentary', 'The other side: counterargument, concession and rebuttal', 'Conclusion: what the argument shows and why it matters'];
  G('rhet.argument-essay', function (R, ctx) {
    var b = R.pick(BODY), shape = ML.byLevel(ctx, 'role', R.pick(['missing', 'role']), R.pick(['order', 'missing']));
    if (shape === 'role') {
      var s = R.pick(b);
      return { q: P('In a body paragraph of an argument essay, what job does this sentence do?') + P(Q(s[0])), a: mcKeep(ROLE3, s[1]),
        hint: 'Claim = the point. Evidence = facts or sources. Commentary = your explanation of what the evidence shows.',
        steps: [['It states the point the paragraph argues.', 'It gives a fact, number or finding from outside the writer’s own reasoning.', 'It explains what the evidence means and how it supports the point.'][s[1]], 'So it is ' + ROLE3[s[1]].toLowerCase() + '.'] };
    }
    if (shape === 'missing') {
      return { q: P('A draft paragraph:') + P(Q(b[0][0] + ' ' + b[1][0])) + P('What does it need most?'),
        a: mc('Commentary that explains how the evidence supports the claim', ['Another claim', 'A second quotation with no explanation', 'A summary of the whole essay']),
        hint: 'It has a claim and evidence. What connects them?',
        steps: ['The paragraph states a claim and gives evidence, then stops.', 'Readers must guess how the evidence supports the claim.', 'It needs commentary, for example: ' + Q(b[2][0] + ' ' + b[3][0])] };
    }
    var op = orderProblem(R, ESSAY_PARTS, 3);
    return { q: P('The cards show the parts of an argument essay, mixed up. Which is a sensible order?'), a: mc(op.right, op.wrong), viz: op.viz,
      hint: 'Thesis first, reasons next, the other side before the close.',
      steps: ['Introduction with the thesis; the reasons; the other side (it may also come earlier for a skeptical audience); the conclusion.', 'In card letters: ' + op.right + '.'] };
  });

  /* ---------------------------------------------------------------- rhet.line-of-reasoning */
  var LOR = [
    { ev: 'The library’s Sunday trial drew 900 visitors in four weekends.', claim: 'The library should open on Sundays.', good: 'That is more than the library sees on most weekday afternoons, so Sunday hours would serve people the current schedule leaves out.', weak: ['That is a lot of visitors.', 'The library had 900 visitors on Sundays during the trial.', 'Libraries have a long and interesting history.'] },
    { ev: 'Police records show four crashes at Elm and Fifth in two years, the most of any corner in town.', claim: 'The town should put a light at Elm and Fifth.', good: 'Since no other corner comes close, a light there would prevent more crashes per dollar than one anywhere else.', weak: ['Four crashes happened there in two years.', 'Crashes are bad.', 'Elm and Fifth is near the bakery.'] },
    { ev: 'A survey of 600 of our 800 students found that 71 percent want a later start.', claim: 'The board should consider a later start.', good: 'With most students surveyed asking for it, a later start would answer a wish shared across the school, not just a few loud voices.', weak: ['Seventy-one percent of 600 students want a later start.', 'Surveys are interesting.', 'Some students like mornings.'] },
    { ev: 'Each foster family frees one shelter cage for a month at no cost to the town.', claim: 'The town should start a foster program.', good: 'Ten families would free ten cages without a new building, which is the cheapest way to end the shelter’s overcrowding.', weak: ['Foster families free up cages.', 'Cats are cute.', 'The shelter has a blue door.'] },
    { ev: 'Districts that moved to 8:30 shifted sports practices by only half an hour.', claim: 'A later start need not hurt our teams.', good: 'A half-hour shift leaves time for full practices before dark for most of the season, so the main objection to a later start loses most of its force.', weak: ['Practices moved by half an hour.', 'Sports are popular.', 'Teams practice after school.'] }];
  var REASONS = [
    { t: 'The town should build a footbridge over the creek.', r: ['The road shoulder has no sidewalk and fast traffic.', 'About forty children walk on that shoulder each morning.', 'A state grant would pay most of the cost.'] },
    { t: 'The library should open on Sundays.', r: ['Many patrons work on weekdays and can’t visit then.', 'A four-weekend trial drew 900 Sunday visitors.', 'Four Sunday hours would cost less than one part-time salary.'] },
    { t: 'The park should add benches along the walking path.', r: ['Many older residents walk the path daily.', 'Some stop to rest on the low wall by the pond, which is unsafe.', 'The senior center has offered to raise money for benches.'] },
    { t: 'The school should start a bike-to-school day.', r: ['Many students live within two miles of school.', 'The new bike lane on Oak Street makes the main route safer.', 'A monthly event costs little and builds the habit.'] }];
  G('rhet.line-of-reasoning', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'comm', R.pick(['comm', 'mark']), R.pick(['order', 'comm', 'mark']));
    if (shape === 'order') {
      var x = R.pick(REASONS), op = orderProblem(R, x.r, 3);
      return { q: P('Thesis: ' + Q(x.t)) + P('The cards show three reasons, mixed up. Which order builds best: the problem first, then who it affects or how big it is, then why the fix is practical?'), a: mc(op.right, op.wrong), viz: op.viz,
        hint: 'A reader must accept the problem before caring about the cost of the fix.',
        steps: ['First the problem: ' + Q(x.r[0]), 'Then its size or who it affects: ' + Q(x.r[1]), 'Then the answer to “Can we do it?”: ' + Q(x.r[2]), 'In card letters: ' + op.right + '.'] };
    }
    var l = R.pick(LOR);
    if (shape === 'mark') {
      var sents = [l.claim, l.ev, l.good], at = 2;
      return { q: P('Which numbered sentence is <b>commentary</b>: the writer’s explanation of what the evidence shows?'), a: mcKeep(nums(3), at), viz: markViz(sents),
        hint: 'Commentary explains; it doesn’t just state the point or the fact.',
        steps: ['Sentence 1 states the claim.', 'Sentence 2 gives the evidence.', 'Sentence 3 explains what the evidence means for the claim: commentary.'] };
    }
    return { q: P('Claim: ' + Q(l.claim)) + P('Evidence: ' + Q(l.ev)) + P('Which sentence of commentary is strongest?'), a: mc(l.good, R.sample(l.weak, ctx.level === 1 ? 2 : 3)),
      hint: 'Strong commentary says what the evidence shows and why it matters for the claim.',
      steps: [Q(l.good) + ' explains what the evidence means and ties it to the claim.', 'The others repeat the evidence, make a vague judgment, or change the subject.'] };
  });

  /* ================================================================ Unit 3: Rhetorical Analysis */

  /* ---------------------------------------------------------------- rhet.analysis-intro */
  var AKIND = ['Summary', 'Analysis', 'Argument about the topic'];
  var AKIND_WHY = ['It retells what the text says, without explaining how it works.', 'It names a choice and explains its effect on the audience or how it serves the purpose.', 'It argues whether the writer is right, instead of explaining how the text works.'];
  var ANS = [
    ['Lincoln says the soldiers gave their lives so that the nation might live.', 0], ['Douglass says he is nervous to speak to the audience.', 0], ['The Federalist says people are not angels, so government needs controls.', 0],
    ['Strunk tells writers to omit needless words.', 0], ['Lincoln says both sides read the same Bible and pray to the same God.', 0], ['Douglass asks what the Fourth of July means to a slave.', 0],
    ['By repeating “we can not” three times, Lincoln shifts the duty of honoring the dead from the speakers to the listeners.', 1], ['Douglass opens with modesty to win the goodwill of an audience he will soon challenge.', 1],
    ['The paired “if” sentences about angels let readers reach the conclusion themselves, so the need for checks feels like common sense.', 1], ['Strunk states each rule as a short command, which makes his advice sound as firm as the concision it demands.', 1],
    ['Lincoln’s four-word sentence “And the war came” makes the war seem to arrive on its own, inviting both sides to share the blame.', 1], ['By calling it “your 4th of July,” Douglass shuts himself out of the holiday and forces his hosts to ask why.', 1],
    ['Lincoln was right that the war was worth fighting.', 2], ['Checks and balances are the best way to run any government.', 2], ['Strunk’s rules are too strict for modern writers.', 2],
    ['Everyone should read the Gettysburg Address every year.', 2], ['Short speeches are always better than long ones.', 2]];
  G('rhet.analysis-intro', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['kind', 'which']), R.pick(['kind', 'which']), R.pick(['passage', 'which']));
    if (shape === 'which') {
      var opts = [0, 1, 2].map(function (k) { return R.pick(ANS.filter(function (x) { return x[1] === k; })); });
      return { q: P('Which sentence is <b>rhetorical analysis</b>?'), a: mc(opts[1][0], [opts[0][0], opts[2][0]]),
        hint: 'Analysis names a choice and explains how it works on the audience.',
        steps: [Q(opts[1][0]) + ': ' + lc(AKIND_WHY[1]), Q(opts[0][0]) + ' only summarizes.', Q(opts[2][0]) + ' argues about the topic.'] };
    }
    if (shape === 'passage') {
      var s3 = [R.pick(ANS.filter(function (x) { return x[1] === 0; })), R.pick(ANS.filter(function (x) { return x[1] === 2; }))];
      var an = R.pick(ANS.filter(function (x) { return x[1] === 1; })), at = R.int(0, 2); s3.splice(at, 0, an);
      return { q: P('A student’s notes. Which numbered sentence is analysis?'), a: mcKeep(nums(3), at), viz: markViz(s3.map(function (x) { return x[0]; })),
        hint: 'Look for a choice and its effect.',
        steps: s3.map(function (x, i) { return 'Sentence ' + (i + 1) + ': ' + AKIND[x[1]].toLowerCase() + '.'; }).concat(['Only sentence ' + (at + 1) + ' explains how a choice works on the audience.']) };
    }
    var s = R.pick(ANS);
    return { q: P('What kind of sentence is this?') + P(Q(s[0])), a: mcKeep(AKIND, s[1]),
      hint: 'What it says? How it works? Whether it’s right?',
      steps: [AKIND_WHY[s[1]], 'So it is ' + AKIND[s[1]].toLowerCase() + '.'] };
  });

  /* ---------------------------------------------------------------- rhet.choices-effects */
  var CE = [
    { quote: '“we can not dedicate—we can not consecrate—we can not hallow—this ground”', src: GETTY, good: 'Each verb is holier than the last, so the admission that words fall short grows stronger and turns the duty to the living.', spot: 'Lincoln uses repetition here.', mis: 'Lincoln is saying the ground is not important.' },
    { quote: '“And the war came.”', src: LINC2, good: 'The short sentence lands like a blow after long ones and makes the war seem to arrive on its own, a tragedy both sides failed to stop.', spot: 'This is a short sentence.', mis: 'Lincoln is blaming only one side for the war.' },
    { quote: '“your 4th of July”', src: DOUG, good: 'The word your, not our, sets Douglass apart from the holiday and makes his hosts feel the gap between their celebration and the lives of the enslaved.', spot: 'Douglass uses a pronoun.', mis: 'Douglass is saying the Fourth of July should be cancelled.' },
    { quote: '“He who could address this audience without a quailing sensation, has stronger nerves than I have.”', src: DOUG, good: 'The modest opening wins goodwill, so listeners trust him before the speech turns fierce.', spot: 'Douglass talks about nerves.', mis: 'Douglass was too nervous to give the speech.' },
    { quote: '“If men were angels, no government would be necessary.”', src: FED51, good: 'The playful “if” lets readers supply the obvious premise themselves, so the need for government feels like their own conclusion.', spot: 'The writer uses the word angels.', mis: 'The writer believes people are angels.' },
    { quote: '“Omit needless words.”', src: STRUNK, good: 'Three words, no wasted ones: the command practices the concision it demands, which makes the rule hard to argue with.', spot: 'Strunk writes a short rule.', mis: 'Strunk thinks all long sentences are wrong.' },
    { quote: '“with malice toward none; with charity for all”', src: LINC2, good: 'The repeated “with” and the balanced opposites make forgiveness sound like a rule for the whole nation, preparing listeners for reconciliation.', spot: 'Lincoln repeats the word with.', mis: 'Lincoln is threatening the defeated side.' },
    { quote: '“It is altogether fitting and proper that we should do this.”', src: GETTY, good: 'The calm approval of the ceremony comes just before Lincoln’s turn (“But, in a larger sense …”), so the turn surprises the listeners.', spot: 'The sentence uses the words fitting and proper.', mis: 'Lincoln thinks the ceremony is a mistake.' }];
  G('rhet.choices-effects', function (R, ctx) {
    var c = R.pick(CE), shape = ML.byLevel(ctx, 'spot', R.pick(['best', 'spot']), R.pick(['best', 'effect']));
    var head = BQ(c.quote, c.src);
    if (shape === 'spot') {
      var isA = R.coin();
      return { q: head + P('A student comments:') + P(Q(isA ? c.good : c.spot)) + P('Is this feature spotting or analysis?'), a: mcKeep(['Feature spotting', 'Analysis'], isA ? 1 : 0),
        hint: 'Does it say what the choice does for the audience?',
        steps: isA ? ['The comment names the choice and explains its effect and purpose.', 'That is analysis.'] : ['The comment names a feature but never says what it does.', 'That is feature spotting. Analysis would add an effect: ' + Q(c.good)] };
    }
    if (shape === 'best') {
      return { q: head + P('Which comment is the strongest analysis?'), a: mc(c.good, [c.spot, c.mis]),
        hint: 'Choice, effect, purpose.',
        steps: [Q(c.good) + ' names the choice, its effect on the audience and its purpose.', Q(c.spot) + ' only spots a feature.', Q(c.mis) + ' misreads the text.'] };
    }
    var other = R.sample(CE.filter(function (x) { return x !== c; }), 2).map(function (x) { return x.good; });
    return { q: head + P('Which effect fits <b>this</b> choice?'), a: mc(c.good, other.concat([c.mis])),
      hint: 'Read the quotation closely. Which comment is about these words?',
      steps: [Q(c.good), 'The other comments describe different passages or misread this one.'] };
  });

  /* ---------------------------------------------------------------- rhet.rhetorical-devices */
  var DEVN = ['Anaphora', 'Epistrophe', 'Parallelism', 'Antithesis', 'Chiasmus', 'Rhetorical question', 'Analogy', 'Understatement'];
  var DEVD = ['the same words at the start of several phrases or sentences', 'the same words at the end of several phrases', 'phrases with the same grammatical shape', 'opposed ideas set side by side in balanced form', 'terms repeated in reverse order', 'a question asked for effect, not for an answer', 'a comparison that explains or argues', 'saying less than the truth, for effect'];
  // [text, device index, source or '', other devices that also fit (never offered as wrong choices)]
  var DEVS = [
    ['with malice toward none; with charity for all; with firmness in the right', 0, LINC2, [2]],
    ['we can not dedicate—we can not consecrate—we can not hallow—this ground', 0, GETTY, [2]],
    ['We will practice in the rain. We will practice in the heat. We will practice until the whistle blows.', 0, '', [2]],
    ['Every day we planned for this. Every day we trained for this. Every day we hoped for this.', 0, '', [1, 2]],
    ['government of the people, by the people, for the people', 1, GETTY, [2]],
    ['What we plant, we keep; what we build, we keep; what we love, we keep.', 1, '', [0, 2]],
    ['The feeling of the nation must be quickened; the conscience of the nation must be roused; the propriety of the nation must be startled', 2, DOUG, []],
    ['She came to the meeting prepared, spoke to the council calmly, and left with a promise.', 2, '', []],
    ['The world will little note, nor long remember what we say here, but it can never forget what they did here.', 3, GETTY, [2]],
    ['For it is not light that is needed, but fire; it is not the gentle shower, but thunder.', 3, DOUG, [0, 2]],
    ['Our goal is not to win every game but to play every game well.', 3, '', [2]],
    ['Pick up your trash, not because a sign says so, but because it is your park.', 3, '', [2]],
    ['If men were angels, no government would be necessary. If angels were to govern men, neither external nor internal controls on government would be necessary.', 4, FED51, [0, 2]],
    ['Some students study to live; others live to study.', 4, '', [2, 3]],
    ['But what is government itself, but the greatest of all reflections on human nature?', 5, FED51, []],
    ['What, to the American slave, is your 4th of July?', 5, DOUG, []],
    ['Is there anyone here who wants the creek to flood again?', 5, '', []],
    ['Liberty is to faction what air is to fire', 6, FED10, []],
    ['A town without a library is like a body without a memory.', 6, '', []],
    ['Learning to write without revising is like learning to cook without tasting.', 6, '', []],
    ['The flood that closed the school for a week was a bit of an inconvenience.', 7, '', []],
    ['Running the marathon on a sprained ankle was not the easiest thing I have ever done.', 7, '', []],
    ['The coach called the 104-degree practice “a little warm.”', 7, '', []]];
  var DEV_ART = ['anaphora', 'epistrophe', 'parallelism', 'antithesis', 'chiasmus', 'a rhetorical question', 'an analogy', 'understatement'];
  function devQ(d) { return d[2] ? BQ(Q(d[0]), d[2]) : P(Q(d[0])); }
  G('rhet.rhetorical-devices', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'name', R.pick(['name', 'which']), R.pick(['which', 'name']));
    if (shape === 'which') {
      var k = R.int(0, 7), right = R.pick(DEVS.filter(function (d) { return d[1] === k; }));
      var wr = R.sample(DEVS.filter(function (d) { return d[1] !== k && d[3].indexOf(k) < 0; }), ctx.level === 3 ? 3 : 2);
      return { q: P('Which line uses <b>' + DEV_ART[k] + '</b> (' + DEVD[k] + ')?'), a: mc(right[0], wr.map(function (d) { return d[0]; })),
        hint: DEVD[k] + '.',
        steps: [Q(right[0]) + (right[2] ? ' (' + right[2] + ')' : '') + ' uses ' + DEVN[k].toLowerCase() + ': ' + DEVD[k] + '.'].concat(wr.map(function (d) { return Q(d[0]) + ' uses ' + DEVN[d[1]].toLowerCase() + '.'; })) };
    }
    var d = R.pick(DEVS), pool = DEVN.map(function (n, i) { return i; }).filter(function (i) { return i !== d[1] && d[3].indexOf(i) < 0; });
    var wrong = R.sample(pool, ctx.level === 1 ? 2 : 3);
    return { q: P('Which device does this line use most clearly?') + devQ(d), a: mc(DEVN[d[1]], wrong.map(function (i) { return DEVN[i]; })),
      hint: 'Look at where words repeat, what is set against what, or what is compared.',
      steps: [DEVN[d[1]] + ' is ' + DEVD[d[1]] + '.', 'Here: ' + Q(d[0]) + '.', d[3].length ? 'It also has ' + d[3].map(function (i) { return DEVN[i].toLowerCase(); }).join(' and ') + ', but ' + DEVN[d[1]].toLowerCase() + ' is the clearest pattern.' : 'Name the device, then ask what it does for the audience.'] };
  });

  /* ---------------------------------------------------------------- rhet.tone */
  var TONES = [
    { t: 'We did it! After three years of bake sales and car washes, the new playground opens Saturday, and every family is invited.', r: 'celebratory', w: ['mournful', 'indignant'], v: 'positive' },
    { t: 'The old oak that shaded the library steps for a century came down this morning. Benches sat empty under the gray sky.', r: 'mournful', w: ['celebratory', 'playful'], v: 'negative' },
    { t: 'Three times the council has promised a crosswalk. Three times it has broken that promise. How many near misses will it take?', r: 'indignant', w: ['grateful', 'wistful'], v: 'negative' },
    { t: 'Sure, the bus was only forty minutes late. That gave us plenty of time to admire the parking lot.', r: 'wry', w: ['reverent', 'urgent'], v: 'funny' },
    { t: 'The creek is rising an inch an hour. Families on Mill Road should leave their homes now.', r: 'urgent', w: ['wry', 'nostalgic'], v: 'serious' },
    { t: 'I still remember the creak of the gym floor and the smell of popcorn at Friday games, long before the new arena.', r: 'nostalgic', w: ['indignant', 'urgent'], v: 'positive' },
    { t: 'To the volunteers who stacked sandbags through the night: our town owes you more than words can say.', r: 'grateful', w: ['scornful', 'wry'], v: 'positive' },
    { t: 'We gather in silence to honor those who served, and whose names are carved on this stone.', r: 'reverent', w: ['playful', 'indignant'], v: 'serious' },
    { t: 'Oh, wonderful. Another meeting about scheduling the next meeting.', r: 'sarcastic', w: ['reverent', 'grateful'], v: 'funny' },
    { t: 'You can do this. You have trained all season, and every step you take tomorrow is one you have already practiced.', r: 'encouraging', w: ['scornful', 'mournful'], v: 'positive' },
    { t: 'The committee has reviewed both proposals carefully and will share its findings at the next meeting.', r: 'measured', w: ['playful', 'indignant'], v: 'serious' },
    { t: 'Every spring I walk past the empty lot where our old school stood, and I can almost hear the bell.', r: 'wistful', w: ['urgent', 'sarcastic'], v: 'emotional' },
    { t: 'Fondly do we hope—fervently do we pray—that this mighty scourge of war may speedily pass away.', r: 'solemn', w: ['triumphant', 'playful'], v: 'serious', src: LINC2 },
    { t: 'At a time like this, scorching irony, not convincing argument, is needed.', r: 'indignant', w: ['grateful', 'nostalgic'], v: 'emotional', src: DOUG }];
  var SHIFTS = [
    { s: ['The new library opened in 2015 with high hopes.', 'Its reading room filled with students every afternoon.', 'But this year the budget cut its hours in half.', 'Now the doors close at 3:00, and the students wait outside in the cold.'], at: 2, from: 'hopeful', to: 'disappointed' },
    { s: ['He who could address this audience without a quailing sensation, has stronger nerves than I have.', 'The task before me is one which requires much previous thought and study for its proper performance.', 'At a time like this, scorching irony, not convincing argument, is needed.', 'We need the storm, the whirlwind, and the earthquake.'], at: 2, from: 'humble', to: 'indignant', src: DOUG + ': two sentences from the opening, then two from later in the speech' },
    { s: ['The team lost every game last fall.', 'Practices were quiet, and some players stopped coming.', 'Then, in March, a new coach arrived with a whistle and a plan.', 'By June, the gym rang with laughter again.'], at: 2, from: 'gloomy', to: 'hopeful' },
    { s: ['Our town fair has always been a joy.', 'Kids win goldfish, grandparents dance, and the pie contest is fierce.', 'This year, though, the fair left the park covered in trash for a week.', 'Volunteers are tired of cleaning up after everyone else.'], at: 2, from: 'cheerful', to: 'frustrated' },
    { s: ['The storm took the roof off the community center.', 'For a month, the building sat dark and dripping.', 'Then neighbors showed up with ladders, lumber and lunch.', 'By spring, the center was brighter than before.'], at: 2, from: 'bleak', to: 'grateful' }];
  G('rhet.tone', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'tone', R.pick(['precise', 'tone']), R.pick(['shift', 'precise']));
    if (shape === 'shift') {
      var sh = R.pick(SHIFTS);
      return { q: P('At which numbered sentence does the tone shift?'), a: mcKeep(nums(sh.s.length), sh.at), viz: markViz(sh.s, sh.src ? sh.src : ''),
        hint: 'Look for a turn word (but, then, though, at a time like this) and a change in the feeling of the words.',
        steps: ['Before sentence ' + (sh.at + 1) + ', the tone is ' + sh.from + '.', 'Sentence ' + (sh.at + 1) + ' turns, and the tone becomes ' + sh.to + '.', 'A shift in tone often marks a turn in the writer’s purpose.'] };
    }
    var x = R.pick(TONES), head = x.src ? BQ(Q(x.t), x.src) : P(Q(x.t));
    if (shape === 'precise') {
      return { q: head + P('Which word names the tone <b>most precisely</b>?'), a: mc(x.r, [x.v, x.w[0]]),
        hint: 'Positive, negative, serious and emotional fit almost anything. Look for a sharper word.',
        steps: ['Look at the word choice and the sentence shapes.', Q(x.r) + ' names the attitude precisely.', Q(x.v) + ' is too vague; ' + Q(x.w[0]) + ' doesn’t fit the words.'] };
    }
    return { q: head + P('What is the tone?'), a: mc(x.r, x.w),
      hint: 'How would this sound read aloud? Which words create that sound?',
      steps: ['Listen to the words and how the sentences move.', 'The tone is ' + x.r + '.', 'The other words describe a different attitude.'] };
  });

  /* ---------------------------------------------------------------- rhet.analysis-thesis */
  var AT_FLAW = ['It only lists devices.', 'It only summarizes the text.', 'It argues about the topic instead of analyzing.', 'Nothing: it names the purpose and how the strategies serve it.'];
  var ATH = [
    { good: 'Lincoln turns a cemetery dedication into a call to finish the war, moving from the nation’s founding to the dead to the living so that his listeners feel the soldiers’ sacrifice as a debt.', list: 'Lincoln uses ethos, pathos and logos in the Gettysburg Address.', sum: 'In the Gettysburg Address, Lincoln talks about the soldiers who died at Gettysburg.', arg: 'Lincoln was right that the soldiers died for a good cause.' },
    { good: 'Douglass wins his audience’s goodwill with modesty, then turns their own holiday against them, so that celebrating liberty feels impossible while slavery lasts.', list: 'Douglass uses rhetorical questions, irony and repetition.', sum: 'Douglass gives a speech about the Fourth of July in 1852.', arg: 'The Fourth of July should be celebrated differently.' },
    { good: 'Federalist No. 51 makes checks and balances feel like common sense by grounding them in a view of human nature its readers already share.', list: 'Federalist No. 51 uses analogy, logic and a rhetorical question.', sum: 'Federalist No. 51 explains checks and balances.', arg: 'Checks and balances are the best system of government.' },
    { good: 'In his Second Inaugural, Lincoln prepares a divided nation for reconciliation by spreading the blame for the war and closing with a call to act “with malice toward none.”', list: 'Lincoln’s Second Inaugural uses anaphora, religious language and short sentences.', sum: 'Lincoln gave his Second Inaugural Address in March 1865.', arg: 'The country should have been more forgiving after the war.' },
    { good: 'Strunk makes his rules feel urgent by stating them as short commands and proving each one with a weak sentence revised.', list: 'Strunk uses imperatives, examples and lists.', sum: 'Strunk wrote a book of rules about writing.', arg: 'Everyone should follow Strunk’s rules.' }];
  G('rhet.analysis-thesis', function (R, ctx) {
    var t = R.pick(ATH), shape = ML.byLevel(ctx, 'pick', 'pick', R.pick(['flaw', 'pick']));
    if (shape === 'flaw') {
      var k = R.int(0, 3), text = [t.list, t.sum, t.arg, t.good][k];
      return { q: P('What, if anything, is wrong with this thesis for a rhetorical analysis?') + P(Q(text)), a: mcKeep(AT_FLAW, k),
        hint: 'Look for a purpose and a how (by, through, so that).',
        steps: [['It names devices but no purpose; every text uses devices.', 'It retells what the text is about; it makes no claim about how it works.', 'It takes a side on the subject instead of explaining the writer’s choices.', 'It names the writer’s purpose and how the strategies serve it.'][k], 'So: ' + lc(AT_FLAW[k])] };
    }
    var wr = ctx.level === 1 ? [t.list] : [t.list, t.sum, t.arg];
    return { q: P('Which is the strongest thesis for a rhetorical analysis?'), a: mc(t.good, wr),
      hint: 'It should name the purpose and say how the strategies serve it.',
      steps: [Q(t.good) + ' names the writer, the purpose and the main strategies, and says how they work.', 'A list of devices, a summary or an argument about the topic is not an analysis thesis.'] };
  });

  /* ---------------------------------------------------------------- rhet.analysis-essay */
  var AE = [
    { text: 'Douglass’s Fourth of July oration', good: 'Follow his moves in order: the modest opening, the refusal to argue what is obvious, the turn to “your 4th of July,” and the indictment that follows.', appeal: 'One paragraph on ethos, one on pathos, one on logos.', sum: 'Retell the speech from beginning to end, a paragraph per page.' },
    { text: 'the Gettysburg Address', good: 'Follow its movement in time: the founding (“Four score and seven years ago”), the present war and dedication, then the task for the future.', appeal: 'A paragraph on each appeal: ethos, pathos, logos.', sum: 'Summarize each sentence of the speech in order.' },
    { text: 'Lincoln’s Second Inaugural', good: 'Take his strategies in order: shared blame for the war, the appeal to a common faith, and the closing call to charity.', appeal: 'Three paragraphs: ethos, then pathos, then logos.', sum: 'Explain the history of the Civil War in three paragraphs.' },
    { text: 'Federalist No. 51', good: 'Follow the reasoning: each branch must check the others (“Ambition must be made to counteract ambition”), the reason (people are not angels), and the double security of federalism.', appeal: 'A paragraph on each of the three appeals.', sum: 'List what each paragraph of the paper says.' }];
  var AE_TOP = [
    { good: 'Douglass then separates himself from the holiday, calling it “your 4th of July” to force his hosts to ask why he cannot share it.', sum: 'Next, Douglass talks about the Fourth of July.', lab: 'This paragraph is about pathos.' },
    { good: 'Lincoln first anchors the war in the nation’s founding, so the soldiers’ deaths become part of a story that began in 1776.', sum: 'Lincoln starts by talking about 87 years ago.', lab: 'Lincoln uses logos at the start.' },
    { good: 'Madison makes the need for government feel obvious by letting readers supply the premise that people are not angels.', sum: 'The paper talks about angels and government.', lab: 'Here the writer uses a rhetorical question.' },
    { good: 'Lincoln closes by turning shared blame into shared duty, with a call to act “with malice toward none.”', sum: 'At the end, Lincoln says some things about malice and charity.', lab: 'The conclusion uses anaphora.' }];
  var AE_PARTS = ['Introduction: the situation and the thesis', 'Body: the writer’s first move, with a short quotation and commentary', 'Body: the writer’s next move, with a short quotation and commentary', 'Conclusion: how the moves work together'];
  G('rhet.analysis-essay', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'plan', R.pick(['topic', 'plan']), R.pick(['topic', 'order']));
    if (shape === 'plan') {
      var a = R.pick(AE);
      return { q: P('You are writing a rhetorical analysis of ' + a.text + '. Which plan for the body paragraphs is best?'), a: mc(a.good, ctx.level === 1 ? [a.appeal] : [a.appeal, a.sum]),
        hint: 'Follow the writer’s moves, not the three appeals.',
        steps: [Q(a.good) + ' follows the writer’s moves, so the essay can show how they build.', 'Organizing by appeal breaks the text apart; retelling is summary, not analysis.'] };
    }
    if (shape === 'topic') {
      var t = R.pick(AE_TOP);
      return { q: P('Which is the strongest topic sentence for a body paragraph of a rhetorical analysis?'), a: mc(t.good, [t.sum, t.lab]),
        hint: 'It should name a move and say what it does.',
        steps: [Q(t.good) + ' names the writer’s move and its effect.', Q(t.sum) + ' only summarizes; ' + Q(t.lab) + ' only labels.'] };
    }
    var op = orderProblem(R, AE_PARTS, 3);
    return { q: P('The cards show the parts of a rhetorical analysis essay, mixed up. Which order is right?'), a: mc(op.right, op.wrong), viz: op.viz,
      hint: 'Situation and thesis first; the moves in the writer’s order; then how they work together.',
      steps: ['Introduction, the first move, the next move, the conclusion.', 'In card letters: ' + op.right + '.'] };
  });

  /* ================================================================ Unit 4: Synthesis */

  /* ---------------------------------------------------------------- rhet.reading-sources */
  var REL = ['Agree', 'Disagree', 'Qualify', 'Answer different questions'];
  var REL_WHY = ['They support the same point.', 'They reach opposite conclusions on the same question.', 'One accepts the other’s point, but only with a limit.', 'They don’t conflict; each covers a different part of the issue.'];
  var PAIRS = [ // practice sources (made up), [A, B, relationship]
    ['A sleep researcher: early school starts cut teenagers’ sleep.', 'A student survey: most students say they are tired in first period.', 0],
    ['A city study: crashes fell on streets after bike lanes were added.', 'A police report: bike crashes on Oak Street dropped after its lane opened.', 0],
    ['A librarian: Sunday hours would draw many visitors.', 'A trial report: 900 people visited during four Sunday trials.', 0],
    ['A study at one school: students slept more after a later start.', 'A study at another school: students slept about the same after a later start.', 1],
    ['A shop owner: the bike lane has hurt business on Oak Street.', 'A sales survey: Oak Street shops sold more after the lane opened.', 1],
    ['A parks report: the pool loses money every summer.', 'A pool manager: the pool broke even this summer after new fees.', 1],
    ['A sleep researcher: later starts help teenagers sleep more.', 'A second researcher: later starts help, but only if students don’t stay up later.', 2],
    ['A city planner: trees cool city streets.', 'A forester: trees cool streets, though young trees give little shade for several years.', 2],
    ['A coach: practice every day builds skill.', 'A trainer: daily practice builds skill, as long as players rest one day a week.', 2],
    ['A sleep researcher: later starts help teenagers sleep more.', 'A transportation memo: a later start would require more buses.', 3],
    ['A historian: Main Street lost its trees when the road was widened in the 1970s.', 'A planner: replanting would cost about \\$400 a tree.', 3],
    ['A survey: most students want a vegetarian lunch option.', 'A budget memo: the cafeteria’s food budget rises 3 percent next year.', 3],
    ['A nurse: helmets prevent many head injuries in bike crashes.', 'A safety council: riders who wear helmets suffer fewer serious head injuries.', 0],
    ['A teacher: recess helps children focus in afternoon lessons.', 'A principal: since recess was shortened, afternoon lessons have gone no worse.', 1],
    ['A parks report: the trail floods every April.', 'A ranger: the trail floods in April, except in years with little snow.', 2],
    ['A shelter director: foster homes free up cages quickly.', 'A vet: foster homes help, provided families are trained to spot illness.', 2],
    ['A town engineer: the bridge needs new railings.', 'A historian: the bridge was built in 1911 by local stonemasons.', 3],
    ['A coach: later practices would end near dark in November.', 'A sleep researcher: teenagers who sleep more are less often injured in sports.', 3]];
  var SYN_GOOD = ['While the transportation memo shows that a later start would need more buses, the sleep research suggests the benefit reaches every student, every morning.',
    'Both the city study and the police report find fewer crashes after bike lanes, which suggests Oak Street’s drop is part of a pattern, not luck.',
    'The forester agrees that trees cool streets but adds that young trees take years to help, so a planting plan should start now.',
    'The two school studies disagree about sleep, which suggests that a later start helps only when families keep bedtimes steady.'];
  SYN_GOOD.push('The nurse and the safety council agree that helmets prevent head injuries, so a helmet rule rests on more than one expert’s view.', 'The ranger’s exception for low-snow years explains why the parks report’s April closings are not quite every year.');
  var SYN_SUM = ['Source A is about sleep. Source B is about buses.', 'The city study says crashes fell. The police report says crashes fell.', 'The planner wrote about trees. The forester also wrote about trees.', 'One study says one thing, and another study says something else.', 'The nurse talks about helmets. The safety council also talks about helmets.', 'The ranger wrote about the trail.'];
  G('rhet.reading-sources', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'rel', R.pick(['rel', 'pair']), R.pick(['synth', 'rel', 'pair']));
    if (shape === 'pair') {
      var kk = R.int(0, 3), fmt = function (x) { return 'A: ' + x[0] + ' / B: ' + x[1]; };
      var rp = R.pick(PAIRS.filter(function (x) { return x[2] === kk; })), wp = R.sample(PAIRS.filter(function (x) { return x[2] !== kk; }), 2);
      return { q: P(['In which pair do the sources <b>agree</b>?', 'In which pair do the sources <b>disagree</b>?', 'In which pair does source B <b>qualify</b> source A?', 'In which pair do the sources <b>answer different questions</b>?'][kk] + ' (The sources are made up for practice.)'), a: mc(fmt(rp), wp.map(fmt)),
        hint: 'Same question or different? If the same, do they agree, disagree, or agree with a limit?',
        steps: [fmt(rp), REL_WHY[kk]].concat(wp.map(function (x) { return 'The pair about “' + x[0].split(':')[0] + '” and “' + x[1].split(':')[0] + '”: ' + lc(REL[x[2]]) + '.'; })) };
    }
    if (shape === 'synth') {
      var k = R.int(0, SYN_GOOD.length - 1), w = R.sample(SYN_SUM, 2);
      return { q: P('Which sentence puts sources <b>in conversation</b>?'), a: mc(SYN_GOOD[k], w),
        hint: 'Look for two sources in one sentence, with their relationship named.',
        steps: [Q(SYN_GOOD[k]) + ' names two sources, says how they relate, and draws a conclusion.', 'The others summarize sources one at a time.'] };
    }
    var p = R.pick(ctx.level === 1 ? PAIRS.filter(function (x) { return x[2] !== 2; }) : PAIRS), labels = ctx.level === 1 ? [REL[0], REL[1], REL[3]] : REL;
    return { q: P('Two practice sources (made up for this question):') + P('<b>A.</b> ' + p[0]) + P('<b>B.</b> ' + p[1]) + P('How do they relate?'), a: mcKeep(labels, labels.indexOf(REL[p[2]])),
      hint: 'Do they answer the same question? If so, do they agree, disagree, or agree with a limit?',
      steps: ['First ask whether they answer the same question.', REL_WHY[p[2]], 'So they ' + lc(REL[p[2]]) + '.'] };
  });

  /* ---------------------------------------------------------------- rhet.integrating-sources */
  var INT_FLAW = ['A changed word needs brackets.', 'Cut words need an ellipsis.', 'The cut changes the meaning.', 'Nothing: it is quoted correctly.'];
  var INT = [
    { o: 'The world will little note, nor long remember what we say here', src: GETTY, ok: 'Lincoln predicted that “the world [would] little note, nor long remember” what was said that day.', chg: 'Lincoln predicted that “the world would little note, nor long remember” what was said that day.', cut: 'Lincoln predicted that “the world will … remember what we say here.”', gap: 'Lincoln said that “the world will little note what we say here.”' },
    { o: 'For it is not light that is needed, but fire; it is not the gentle shower, but thunder.', src: DOUG, ok: 'Douglass declares that “it is not light that is needed, but fire.”', chg: 'Douglass declares that “it was not light that was needed, but fire.”', cut: 'Douglass declares that “it is … light that is needed.”', gap: 'Douglass declares that “it is not light that is needed, but thunder.”' },
    { o: 'To him, your celebration is a sham', src: DOUG, ok: 'Douglass argues that “[t]o him [the enslaved person], your celebration is a sham.”', chg: 'Douglass argues that “to the slave, your celebration is a sham.”', cut: 'Douglass argues that “… your celebration is a sham.”', gap: 'Douglass argues that “[t]o him, celebration is a sham.”' },
    { o: 'In framing a government which is to be administered by men over men, the great difficulty lies in this: you must first enable the government to control the governed; and in the next place oblige it to control itself.', src: FED51, ok: 'The writer explains that “[i]n framing a government … the great difficulty lies in this: you must first enable the government to control the governed.”', chg: 'The writer explains that “[i]n framing a government which is to be run by men over men, the great difficulty lies in this.”', cut: null, gap: 'The writer explains that “[i]n framing a government the great difficulty lies in this: you must first enable the government to control the governed.”' },
    { o: 'Vigorous writing is concise. A sentence should contain no unnecessary words, a paragraph no unnecessary sentences', src: STRUNK, ok: 'Strunk insists that “[a] sentence should contain no unnecessary words, a paragraph no unnecessary sentences.”', chg: 'Strunk insists that “a sentence must contain no extra words.”', cut: 'Strunk insists that “a sentence should contain … unnecessary words.”', gap: null },
    { o: 'Fondly do we hope—fervently do we pray—that this mighty scourge of war may speedily pass away.', src: LINC2, ok: 'Lincoln hoped the war would “speedily pass away.”', chg: 'Lincoln hoped the war would “quickly pass away.”', cut: null, gap: 'Lincoln said, “Fondly do we hope that this mighty scourge of war may speedily pass away.”' }];
  var SIG = [
    ['The coach admits that later practices would be hard on players with jobs.', 'concedes', ['insists', 'denies']],
    ['The researcher strongly repeats that sleep matters more than any schedule.', 'insists', ['concedes', 'questions']],
    ['The memo cautions that more buses could strain the budget.', 'warns', ['celebrates', 'concedes']],
    ['The survey report simply mentions that 40 students skipped the question.', 'notes', ['insists', 'warns']],
    ['The forester doubts whether young trees will help soon.', 'questions', ['insists', 'celebrates']],
    ['The librarian makes the case that Sunday hours are worth the cost.', 'argues', ['concedes', 'denies']]];
  G('rhet.integrating-sources', function (R, ctx) {
    var x = R.pick(INT), head = P('The original:') + BQ(Q(x.o), x.src), shape = ML.byLevel(ctx, 'pick', R.pick(['flaw', 'pick']), R.pick(['flaw', 'sig']));
    if (shape === 'sig') {
      var s = R.pick(SIG);
      return { q: P('A source does this:') + P(Q(s[0])) + P('Which signal verb fits best? “The source ___ that …”'), a: mc(s[1], s[2]),
        hint: 'Is the source admitting, pressing, warning, mentioning, doubting or making a case?',
        steps: ['The verb should match what the source does.', Q(s[0]) + ' → ' + s[1] + '.'] };
    }
    if (shape === 'flaw') {
      var avail = [0, 1, 2, 3].filter(function (j) { return [x.chg, x.gap, x.cut, x.ok][j]; }), k = R.pick(avail), text = [x.chg, x.gap, x.cut, x.ok][k];
      return { q: head + P('A student quotes it like this:') + P(text) + P('What, if anything, is wrong?'), a: mcKeep(INT_FLAW, k),
        hint: 'Compare the quoted words with the original, word for word.',
        steps: [['A word inside the quotation marks differs from the original, with no brackets to show the change.', 'Words were left out of the middle of the quotation with no ellipsis.', 'The ellipsis removes words that change what the source meant.', 'Every change is marked, and the meaning is kept.'][k], 'A correct version: ' + x.ok] };
    }
    return { q: head + P('Which version quotes the source correctly?'), a: mc(x.ok, ctx.level === 1 ? [x.chg] : [x.chg, x.cut || x.gap]),
      hint: 'Changed words in brackets; cuts marked with an ellipsis; the meaning kept.',
      steps: [x.ok, 'Its changes are in brackets or marked with an ellipsis, and the meaning is the same as the original’s.', 'The others change words silently or cut so the meaning changes.'] };
  });

  /* ---------------------------------------------------------------- rhet.synthesis-essay */
  var SE_TOP = [
    { good: 'A later start would help students learn, as the sleep research (Source A) and the student survey (Source C) both suggest.', bad: ['Source A is a sleep researcher’s article.', 'Source C is a survey of students.'] },
    { good: 'The bus cost of a later start is real but manageable, despite the transportation memo’s warning (Source B).', bad: ['Source B is a memo about buses.', 'The next source I will discuss is Source B.'] },
    { good: 'Planting now matters, because young trees take years to shade a street (Source D), even though their cooling effect is well established (Source A).', bad: ['Source D is from a forester.', 'This paragraph is about Source A.'] },
    { good: 'Sunday hours would serve people the library now misses, as the trial numbers (Source B) and the librarian’s account (Source A) agree.', bad: ['Source B reports trial numbers.', 'Source A was written by a librarian.'] }];
  SE_TOP.push(
    { good: 'Helmet rules protect riders, as the nurse’s account and the safety council’s figures agree (Sources A and B).', bad: ['Source A is from a nurse.', 'Next I will talk about Source B.'] },
    { good: 'Fostering is the fastest way to free shelter space, though the vet’s warning about training (Source C) shows it needs care to work.', bad: ['Source C was written by a vet.', 'This paragraph summarizes Source C.'] },
    { good: 'Recess deserves protection, even if the principal’s report (Source B) suggests shorter recess has not hurt lessons yet.', bad: ['Source B is a principal’s report.', 'The principal wrote Source B in the spring.'] });
  var SE_OPP = { r: 'State its point fairly, concede what is true, and answer it with your reasons and other sources.', w: ['Leave it out, since it doesn’t support your position.', 'Quote it and move on without comment.', 'Say the source is biased, without explaining why.'] };
  G('rhet.synthesis-essay', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['topic', 'synth']), R.pick(['topic', 'opp', 'synth']), R.pick(['opp', 'topic', 'plan', 'synth']));
    if (shape === 'opp') {
      return { q: P('In your synthesis essay, one source disagrees with your position. What should you do with it?'), a: mc(SE_OPP.r, R.sample(SE_OPP.w, ctx.level === 3 ? 3 : 2)),
        hint: 'Think of counterarguments: steelman, concede, rebut.',
        steps: ['A source that disagrees is the strongest counterargument you have.', 'State it fairly, concede what is true, and answer it.', 'Leaving it out, or dismissing it without reasons, weakens your ethos.'] };
    }
    if (shape === 'synth') {
      var kg = R.int(0, SYN_GOOD.length - 1);
      return { q: P('Which sentence would do the most work in a synthesis essay?'), a: mc(SYN_GOOD[kg], R.sample(SYN_SUM, 2)),
        hint: 'Look for two sources in conversation and a point of the writer’s own.',
        steps: [Q(SYN_GOOD[kg]) + ' puts two sources in conversation and draws the writer’s own conclusion.', 'The others report sources one at a time, leaving the thinking to the reader.'] };
    }
    if (shape === 'plan') {
      return { q: P('Which plan is best for a synthesis essay arguing that the school should start at 8:30, using four practice sources?'),
        a: mc('One paragraph for each of your reasons, each drawing on the sources that bear on it', ['One paragraph for each source, in the order A, B, C, D', 'A summary of all four sources, then your opinion at the end', 'Only the two sources that agree with you, one paragraph each']),
        hint: 'Who organizes the essay: you or the sources?',
        steps: ['Your reasons should organize the essay; the sources serve them.', 'One paragraph per source turns the essay into a set of summaries.', 'Dropping the sources that disagree leaves the strongest objection unanswered.'] };
    }
    var t = R.pick(SE_TOP);
    return { q: P('Which topic sentence is best for a body paragraph of a synthesis essay?'), a: mc(t.good, t.bad),
      hint: 'A topic sentence should state your claim, not introduce a source.',
      steps: [Q(t.good) + ' states the writer’s own claim and brings in the sources as support.', 'The others start from a source, which lets the sources organize the essay.'] };
  });

  /* ================================================================ Unit 5: Style */

  /* ---------------------------------------------------------------- rhet.diction */
  // [praise, neutral, criticism, sentence frame with ___ for a person or thing]
  var CONN = [
    ['thrifty', 'careful with money', 'stingy', 'My aunt is ___: she buys everything on sale.'], ['confident', 'sure of herself', 'arrogant', 'The new captain is ___ when she speaks to the team.'],
    ['curious', 'interested', 'nosy', 'Our neighbor is ___ about everyone’s garden.'], ['determined', 'persistent', 'pigheaded', 'The coach is ___ about running drills every day.'],
    ['firm', 'unwilling to change', 'stubborn', 'The principal was ___ about the new rule.'], ['slender', 'thin', 'skinny', 'The young tree is still ___.'],
    ['aroma', 'smell', 'stench', 'The ___ from the bakery filled the street.'], ['concise', 'short', 'curt', 'His reply to my email was ___.'],
    ['historic', 'old', 'decrepit', 'The ___ mill stands by the river.'], ['easygoing', 'relaxed', 'lazy', 'Our dog is ___ about his walks.'],
    ['youthful', 'young', 'childish', 'Grandpa has a ___ way of joking.'], ['frank', 'direct', 'blunt', 'Her review of the play was ___.'],
    ['cautious', 'careful', 'timid', 'Sam is ___ on the high diving board.'], ['bold', 'daring', 'reckless', 'The plan to finish the mural in a week was ___.']];
  var VAGUE = [
    { v: 'The new park is really nice and has a lot of good stuff.', r: 'The new park has a splash pad, shaded benches and a quarter-mile walking loop.', w: ['The new park is very extremely nice and has lots of good things.', 'The new park is notorious for its amenities.'] },
    { v: 'The bus was really late.', r: 'The bus was 25 minutes late.', w: ['The bus was super duper late.', 'The bus was tardy in a big way.'] },
    { v: 'The speech was good.', r: 'The speech was brief, warm and easy to follow.', w: ['The speech was really very good.', 'The speech was infamous for its warmth.'] },
    { v: 'A lot of people came to the fair.', r: 'About 2,000 people came to the fair.', w: ['A whole lot of people came to the fair.', 'A plethora of people came to the fair.'] },
    { v: 'The weather was bad for the game.', r: 'Sleet and a cold wind cut the game short in the third quarter.', w: ['The weather was very bad for the game.', 'The weather was nefarious for the game.'] },
    { v: 'The cafeteria food has gotten better.', r: 'The cafeteria now serves fresh fruit and a hot soup every day.', w: ['The cafeteria food has gotten much better.', 'The cafeteria food has gotten more egregious.'] }];
  G('rhet.diction', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['feel', 'fill']), R.pick(['fill', 'feel', 'precise']), R.pick(['precise', 'fill']));
    if (shape === 'feel') {
      var c = R.pick(CONN), side = R.coin() ? 0 : 2, sent = c[3].replace('___', c[side]);
      return { q: P('Does this sentence praise or criticize?') + P(Q(sent)), a: mcKeep(['Praise', 'Criticism'], side === 0 ? 0 : 1),
        hint: 'Look at the feeling the key word carries (its connotation).',
        steps: ['The key word is ' + Q(c[side]) + '.', 'A neutral word would be ' + Q(c[1]) + '; ' + Q(c[side]) + ' adds ' + (side === 0 ? 'approval' : 'disapproval') + '.', 'So the sentence ' + (side === 0 ? 'praises' : 'criticizes') + '.'] };
    }
    if (shape === 'fill') {
      var d = R.pick(CONN), want = R.pick(['praise', 'criticize']), right = want === 'praise' ? d[0] : d[2], wrong = want === 'praise' ? d[2] : d[0];
      return { q: P('A writer wants to <b>' + want + '</b>. Which word fits the blank?') + P(Q(d[3])), a: mc(right, ctx.level === 1 ? [wrong] : [wrong, d[1]]),
        hint: 'All three mean about the same thing. Which one carries the right feeling?',
        steps: [Q(d[0]) + ', ' + Q(d[1]) + ' and ' + Q(d[2]) + ' have similar meanings (denotation).', 'Their connotations differ: praise, neutral, criticism.', 'To ' + want + ', choose ' + Q(right) + '.'] };
    }
    var v = R.pick(VAGUE);
    return { q: P('Which revision is most precise?') + P('Original: ' + Q(v.v)), a: mc(v.r, v.w),
      hint: 'Precise words name exactly what, how much or which.',
      steps: [Q(v.r) + ' replaces vague words with specific ones the reader can picture or check.', 'Adding intensifiers (very, really, super) doesn’t add precision, and a fancy word with the wrong meaning or connotation (notorious, infamous, nefarious, egregious mean bad things) makes it worse.'] };
  });

  /* ---------------------------------------------------------------- rhet.concision */
  var WORDY = [ // [wordy, concise, wordy alternatives]
    ['the question as to whether', 'whether', ['the question of whether or not', 'the matter as to whether']], ['owing to the fact that', 'because', ['due to the fact that', 'for the reason that']],
    ['in spite of the fact that', 'although', ['despite the fact that', 'regardless of the fact that']], ['in a hasty manner', 'hastily', ['in a manner that is hasty', 'in a hurried kind of way']],
    ['used for fuel purposes', 'used for fuel', ['used for the purposes of fuel', 'utilized for fuel purposes']], ['there is no doubt but that', 'doubtless', ['there is no question but that', 'it is beyond doubt that']],
    ['at this point in time', 'now', ['at the present point in time', 'at this moment in time']], ['in order to', 'to', ['in order for to', 'so as to be able to']],
    ['each and every', 'every', ['each and every single', 'every single one of each']], ['the end result', 'the result', ['the final end result', 'the ultimate end result']],
    ['past history', 'history', ['past historical record', 'previous past history']], ['completely finished', 'finished', ['totally and completely finished', 'fully completely finished']],
    ['I was unaware of the fact that', 'I did not know that', ['I was not aware of the fact that', 'I was unaware as to the fact that']], ['his story is a strange one', 'his story is strange', ['his story is a strange kind of one', 'his story is one that is strange']]];
  var CSENT = [
    { w: 'In my opinion, I think that the end result of the new schedule is that each and every student has more time to eat lunch.', r: 'The new schedule gives every student more time for lunch.', over: 'Schedule. Lunch.' },
    { w: 'There are many students who say that the late bus is in fact too crowded at this point in time.', r: 'Many students say the late bus is too crowded.', over: 'The bus is crowded.' },
    { w: 'Owing to the fact that it was raining, we made the decision to stay inside.', r: 'Because it was raining, we decided to stay inside.', over: 'We stayed.' },
    { w: 'It is important to note that the library will be closed on Monday due to the fact that it is a holiday.', r: 'The library will be closed on Monday for the holiday.', over: 'Library closed.' },
    { w: 'The park is a place that is used by many people for the purpose of walking their dogs.', r: 'Many people walk their dogs in the park.', over: 'People walk.' },
    { w: 'What I am trying to say is that the bake sale was a success in terms of money raised.', r: 'The bake sale raised a lot of money.', over: 'Bake sale.' }];
  var NEEDLESS = ['Redundancy', 'Empty phrase', 'Weak opening', 'Throat-clearing'];
  var NEED_S = [
    ['The final end result was a tie.', 0], ['We returned back to the start.', 0], ['Each and every player got a medal.', 0], ['The two twins arrived together at the same time.', 0],
    ['Owing to the fact that it snowed, school closed.', 1], ['At this point in time, the pool is closed.', 1], ['We left early in order to beat the traffic.', 1], ['The meeting was held for the purpose of choosing a date.', 1],
    ['There are three students who want to join.', 2], ['It is the coach who decides the lineup.', 2], ['There is a bench that sits by the pond.', 2],
    ['In my opinion, I think the mural is beautiful.', 3], ['It is important to note that the bridge is closed.', 3], ['What I want to say is that the plan works.', 3]];
  var NEED_WHY = ['It says the same thing twice.', 'A long phrase stands in for one short word.', '“There is” or “It is” delays the real subject and verb.', 'It announces that the writer is about to say something instead of saying it.'];
  G('rhet.concision', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'phrase', R.pick(['sentence', 'phrase']), R.pick(['kind', 'sentence']));
    if (shape === 'phrase') {
      var w = R.pick(WORDY);
      return { q: P('Which is the concise way to say this?') + P(Q(w[0])), a: mc(w[1], ctx.level === 1 ? [w[2][0]] : w[2]),
        hint: 'Find the shortest form that keeps the meaning.',
        steps: [Q(w[0]) + ' uses several words where fewer will do.', 'Concise: ' + Q(w[1]) + '.', 'The other choices are just as wordy, or wordier.'] };
    }
    if (shape === 'kind') {
      var n = R.pick(NEED_S);
      return { q: P('What kind of needless words does this sentence contain?') + P(Q(n[0])), a: mcKeep(NEEDLESS, n[1]),
        hint: 'Said twice? A long phrase for a short word? There is / It is? An announcement?',
        steps: [NEED_WHY[n[1]], 'So it is: ' + NEEDLESS[n[1]].toLowerCase() + '.'] };
    }
    var c = R.pick(CSENT);
    return { q: P('Which revision is concise <b>and keeps the meaning</b>?') + P('Original: ' + Q(c.w)), a: mc(c.r, [c.w, c.over]),
      hint: 'Cut the words that do no work, but keep every idea.',
      steps: [Q(c.r) + ' keeps the full meaning in fewer words.', 'The original is padded; ' + Q(c.over) + ' cuts so much that the meaning is lost. Concise is not the same as short.'] };
  });

  /* ---------------------------------------------------------------- rhet.active-passive-style */
  var VOICE = [ // [sentence, isPassive]
    ['The committee approved the budget.', false], ['The budget was approved by the committee.', true], ['My bike was stolen last night.', true], ['Someone stole my bike last night.', false],
    ['Volunteers planted forty trees.', false], ['Forty trees were planted by volunteers.', true], ['The library was built in 1902.', true], ['Ana kicked the ball into the goal.', false],
    ['The cake was eaten by the twins.', true], ['The twins ate the cake.', false], ['The game was canceled because of lightning.', true], ['Lightning canceled the game.', false]];
  var PJUDGE = [ // [sentence, passive works well?, why]
    ['My bike was stolen last night.', true, 'The thief is unknown, so the passive is natural.'], ['The library was built in 1902.', true, 'Who built it doesn’t matter in this sentence.'],
    ['The winners will be announced on Friday.', true, 'The announcer is unimportant; the winners are the point.'], ['The road was closed after the storm.', true, 'The focus is the road; who closed it is obvious or unimportant.'],
    ['The ball was kicked by Ana into the goal.', false, 'Ana is the point. Active: “Ana kicked the ball into the goal.”'], ['The cake was eaten by the twins before the party.', false, 'Active is livelier: “The twins ate the cake before the party.”'],
    ['The election results were certified on Tuesday.', true, 'Who certified them is routine; the results are the point.'], ['The patient was treated in the emergency room.', true, 'The focus is the patient; the staff are understood.'],
    ['The window was broken sometime over the weekend.', true, 'No one knows who broke it.'], ['The homework was forgotten by me at home.', false, 'Active is clearer: “I forgot my homework at home.”'],
    ['The speech was given by the mayor with great energy.', false, 'The mayor is the point: “The mayor gave the speech with great energy.”'],
    ['A decision was made by me to quit the team.', false, 'The doer is known and central. Active: “I decided to quit the team.”'], ['The song was sung beautifully by the choir.', false, 'The choir is the point. Active: “The choir sang the song beautifully.”']];
  var FOCUS = [
    { topic: 'the old stone bridge', pas: 'The bridge was built in 1911 by local stonemasons.', act: 'Local stonemasons built the bridge in 1911.', want: 'pas' },
    { topic: 'the local stonemasons and their work', pas: 'The bridge was built in 1911 by local stonemasons.', act: 'Local stonemasons built the bridge in 1911.', want: 'act' },
    { topic: 'the town’s new mural', pas: 'The mural was painted last spring by students from the high school.', act: 'Students from the high school painted the mural last spring.', want: 'pas' },
    { topic: 'what the high school art students did this year', pas: 'The mural was painted last spring by students from the high school.', act: 'Students from the high school painted the mural last spring.', want: 'act' },
    { topic: 'the history of the library building', pas: 'The library was designed in 1902 by a young architect.', act: 'A young architect designed the library in 1902.', want: 'pas' },
    { topic: 'the career of a young architect', pas: 'The library was designed in 1902 by a young architect.', act: 'A young architect designed the library in 1902.', want: 'act' }];
  G('rhet.active-passive-style', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['voice', 'judge', 'which']), R.pick(['judge', 'focus', 'which']), R.pick(['focus', 'judge', 'hide', 'which']));
    if (shape === 'which') {
      var good = R.pick(PJUDGE.filter(function (x) { return x[1]; })), bad = R.sample(PJUDGE.filter(function (x) { return !x[1]; }), ctx.level === 1 ? 1 : 2);
      return { q: P('In which sentence is the passive voice a <b>good</b> choice?'), a: mc(good[0], bad.map(function (x) { return x[0]; })),
        hint: 'The passive works when the doer is unknown or unimportant.',
        steps: [Q(good[0]) + ': ' + good[2]].concat(bad.map(function (x) { return Q(x[0]) + ': ' + x[2]; })) };
    }
    if (shape === 'voice') {
      var v = R.pick(VOICE);
      return { q: P('Is this sentence in the active or the passive voice?') + P(Q(v[0])), a: mcKeep(['Active', 'Passive'], v[1] ? 1 : 0),
        hint: 'Is the subject doing the action, or receiving it?',
        steps: v[1] ? ['The subject receives the action, with a form of be plus a past participle.', 'So it is passive.'] : ['The subject does the action.', 'So it is active.'] };
    }
    if (shape === 'judge') {
      var j = R.pick(PJUDGE);
      return { q: P('Is the passive a good choice here?') + P(Q(j[0])), a: mcKeep(['Passive works well', 'Active would be better'], j[1] ? 0 : 1),
        hint: 'Is the doer unknown or unimportant? Or is the doer the point?',
        steps: [j[2]] };
    }
    if (shape === 'hide') {
      return { q: P('A company’s note says: ' + Q('Mistakes were made in your bill.') + ' Why might a reader object to this passive sentence?'),
        a: mc('It hides who made the mistakes, when the reader wants to know who is responsible.', ['It is too short.', 'The passive voice is always grammatically wrong.', 'It uses too many adjectives.']),
        hint: 'Who made the mistakes?',
        steps: ['The passive with no by-phrase leaves out the doer.', 'When the reader wants to know who is responsible, that can look like dodging.', 'Active: “We made mistakes in your bill, and we are fixing them.” The passive itself is not an error.'] };
    }
    var f = R.pick(FOCUS), right = f[f.want], wrong = f.want === 'pas' ? f.act : f.pas;
    return { q: P('In a paragraph about <b>' + f.topic + '</b>, which sentence fits better?'), a: mc(right, [wrong]),
      hint: 'A sentence’s subject is what it is about. Which version makes the paragraph’s topic the subject?',
      steps: ['The paragraph is about ' + f.topic + '.', Q(right) + ' puts that topic in the subject position' + (f.want === 'pas' ? ', which here takes the passive voice.' : ', in the active voice.'), 'Strunk’s own example makes the same point: the topic of the paragraph decides the voice.'] };
  });

  /* ---------------------------------------------------------------- rhet.sentence-variety */
  var CHOPPY = [
    { c: 'The storm hit at noon. The power went out. The school closed early. The buses came at one.', r: 'When the storm hit at noon, the power went out, and the school closed early. The buses came at one.', s: 'The storm hit at noon, the power went out, the school closed early, the buses came at one.' },
    { c: 'The creek rose. It rose fast. Volunteers came. They stacked sandbags. The water stopped at the wall.', r: 'As the creek rose fast, volunteers came and stacked sandbags. The water stopped at the wall.', s: 'The creek rose, it rose fast, volunteers came, they stacked sandbags, the water stopped at the wall.' },
    { c: 'Mei trained all summer. She ran every morning. She swam in the afternoons. She won the race.', r: 'All summer, Mei ran every morning and swam every afternoon. She won the race.', s: 'Mei trained all summer, she ran every morning, she swam in the afternoons, she won the race.' },
    { c: 'The library opened on Sunday. Many people came. Some were students. Some were parents. The trial was a success.', r: 'When the library opened on Sunday, students and parents filled it. The trial was a success.', s: 'The library opened on Sunday, many people came, some were students, some were parents, the trial was a success.' }];
  CHOPPY.push(
    { c: 'The bake sale started at nine. The brownies sold out first. The cookies sold out next. We raised \\$400.', r: 'The bake sale started at nine, and the brownies sold out first, then the cookies. We raised \\$400.', s: 'The bake sale started at nine, the brownies sold out first, the cookies sold out next, we raised \\$400.' },
    { c: 'The trail was muddy. We wore boots. We reached the falls. They were loud. We stayed an hour.', r: 'Because the trail was muddy, we wore boots to the falls. They were so loud that we stayed an hour.', s: 'The trail was muddy, we wore boots, we reached the falls, they were loud, we stayed an hour.' });
  var OPENS = ['With the subject', 'With a phrase', 'With a dependent clause', 'With a participle phrase'];
  var OPEN_S = [
    ['The volunteers stacked sandbags all night.', 0], ['Our team practiced in the rain.', 0], ['Grandma planted tomatoes along the fence.', 0],
    ['Through the night, volunteers stacked sandbags.', 1], ['In the rain, our team practiced anyway.', 1], ['Along the fence, Grandma planted tomatoes.', 1],
    ['As the creek rose, volunteers stacked sandbags.', 2], ['Because the field was flooded, our team practiced in the gym.', 2], ['When spring came, Grandma planted tomatoes.', 2],
    ['After the game, the team walked home.', 1], ['If the bus is late, call the office.', 2], ['Laughing at the joke, Omar dropped his tray.', 3], ['Rosa finished the mural on Friday.', 0],
    ['Working through the night, volunteers stacked sandbags.', 3], ['Soaked to the skin, our team kept practicing.', 3], ['Kneeling by the fence, Grandma planted tomatoes.', 3]];
  var OPEN_WHY = ['The sentence begins with its subject.', 'It begins with a prepositional phrase before the subject.', 'It begins with a clause (subordinator, subject and verb) that can’t stand alone.', 'It begins with a participle phrase (an -ing or -ed verb form) describing the subject.'];
  G('rhet.sentence-variety', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['combine', 'whichopen']), R.pick(['open', 'combine', 'whichopen']), R.pick(['open', 'short', 'combine', 'whichopen']));
    if (shape === 'whichopen') {
      var ko = R.int(1, 3), ro = R.pick(OPEN_S.filter(function (x) { return x[1] === ko; })), wo = R.sample(OPEN_S.filter(function (x) { return x[1] !== ko; }), 2);
      return { q: P('Which sentence opens <b>' + lc(OPENS[ko]) + '</b>?'), a: mc(ro[0], wo.map(function (x) { return x[0]; })),
        hint: OPEN_WHY[ko],
        steps: [Q(ro[0]) + ': ' + lc(OPEN_WHY[ko])].concat(wo.map(function (x) { return Q(x[0]) + ' opens ' + lc(OPENS[x[1]]) + '.'; })) };
    }
    if (shape === 'open') {
      var o = R.pick(OPEN_S);
      return { q: P('How does this sentence open?') + P(Q(o[0])), a: mcKeep(OPENS, o[1]),
        hint: 'What comes before the subject, if anything?',
        steps: [OPEN_WHY[o[1]], 'So it opens ' + lc(OPENS[o[1]]) + '.'] };
    }
    if (shape === 'short') {
      return { q: P('Lincoln, 1865: ' + Q('Both parties deprecated war; but one of them would make war rather than let the nation survive; and the other would accept war rather than let it perish. And the war came.')) + P('Why does the passage end with a four-word sentence?'),
        a: mc('The short sentence after a long one lands with force and gives the war’s arrival weight.', ['Lincoln ran out of time.', 'Short sentences are always better than long ones.', 'It fixes a grammar error in the long sentence.']),
        hint: 'What happens when a short sentence follows a long one?',
        steps: ['The long sentence weighs the two sides with balanced clauses.', '“And the war came.” then lands like a blow.', 'Variety in length is a tool for emphasis, not a rule that short is better.'] };
    }
    var ch = R.pick(CHOPPY);
    return { q: P('Which revision varies the sentences best?') + P('Original: ' + Q(ch.c)), a: mc(ch.r, ctx.level === 1 ? [ch.c] : [ch.c, ch.s]),
      hint: 'Join related ideas to show how they connect, but keep sentences correct.',
      steps: [Q(ch.r) + ' joins related ideas with words that show their logic (when, as, and), then ends with a short sentence.', 'The original is choppy; stringing sentences together with only commas creates comma splices.'] };
  });

  /* ---------------------------------------------------------------- rhet.emphasis */
  var EMPH = [
    { key: 'the danger', r: 'According to the town’s report, children at Elm and Fifth cross six lanes of traffic with no light.', w: ['Children at Elm and Fifth cross six lanes of traffic with no light, according to the town’s report.', 'Six lanes of traffic with no light, according to the town’s report, are crossed by children at Elm and Fifth.'] },
    { key: 'the lost sleep', r: 'Because of the early start, students lose an hour of sleep every school day.', w: ['Students lose an hour of sleep every school day because of the early start, which is something to think about in today’s society.', 'An hour of sleep, because of the early start, is lost by students every school day, in my opinion.'] },
    { key: 'fortitude (Strunk’s example)', r: 'Humanity, since that time, has advanced in many other ways, but it has hardly advanced in fortitude.', w: ['Humanity has hardly advanced in fortitude since that time, though it has advanced in many other ways.', 'Since that time, in fortitude humanity has hardly advanced, though in many other ways it has.'] },
    { key: 'the volunteers', r: 'The creek stayed in its banks because of one group: the volunteers.', w: ['The volunteers kept the creek in its banks, more or less, as things turned out.', 'Because of the volunteers, the creek stayed in its banks in the end, all things considered.'] },
    { key: 'the cost', r: 'The plan would help every student, but it would cost \\$2 million.', w: ['The plan would cost \\$2 million, but it would help every student.', 'It would cost \\$2 million, the plan, which would help every student, I think.'] }];
  var FILLERS = [', to be honest about it.', ', all things considered.', ', if you think about it.', ', more or less.', ', in the end.'];
  var WEAK_END = [
    ['The library needs Sunday hours, at the end of the day.', 'The library needs Sunday hours.'], ['The flood damaged forty homes, and things like that.', 'The flood damaged forty homes.'],
    ['Students need more sleep, I guess.', 'Students need more sleep.'], ['The team earned its win, basically.', 'The team earned its win.'],
    ['Recycling matters more than ever in today’s society.', 'Recycling matters more than ever.'], ['The mural brightens the whole block, in my opinion.', 'The mural brightens the whole block.'],
    ['The garden gave us tomatoes, peppers and things like that.', 'The garden gave us tomatoes, peppers and squash.'], ['Our team won the title, which was pretty cool and stuff.', 'Our team won the title.'],
    ['The bridge must be repaired soon, as far as I can tell.', 'The bridge must be repaired soon.']];
  G('rhet.emphasis', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'end', R.pick(['end', 'weak']), R.pick(['end', 'weak']));
    if (shape === 'weak') {
      var we = R.pick(WEAK_END);
      return { q: P('Which revision fixes the weak ending?') + P('Original: ' + Q(we[0])), a: mc(we[1], [we[1].replace(/\.$/, '') + R.pick(FILLERS), R.pick(['In today’s society, ', 'In my opinion, ', 'At the end of the day, ']) + lc(we[1])]),
        hint: 'End on the words that matter.',
        steps: ['The original ends on filler, the quietest possible ending.', Q(we[1]) + ' ends on the point.', 'Moving the filler to the front still wastes words; cut it.'] };
    }
    var e = R.pick(EMPH);
    return { q: P('Which version puts the most emphasis on <b>' + e.key + '</b>?'), a: mc(e.r, ctx.level === 1 ? [e.w[0]] : e.w),
      hint: 'The end of a sentence is its most emphatic position.',
      steps: ['Strunk’s Rule 18: place the emphatic words of a sentence at the end.', Q(e.r) + ' ends on ' + e.key.replace(/ \(.*\)$/, '') + '.', 'The other versions end on something less important.'] };
  });

  /* ---------------------------------------------------------------- rhet.cohesion */
  // chains: each sentence begins with what the last one ended on; bad: the same sentence with the new information first
  var CHAINS = [
    { s: ['Our town’s creek floods every April.', 'The flooding comes from storm drains clogged upstream.', 'Those drains fill each fall with leaves from the park’s maples.', 'Those leaves could be cleared by a volunteer raking day in November.'], bad: [null, 'Clogged storm drains upstream are the cause of the flooding.', 'Leaves from the park’s maples fill those drains each fall.', 'A volunteer raking day in November could clear those leaves.'] },
    { s: ['The library is adding Sunday hours this fall.', 'The new hours grew out of a trial last spring.', 'That trial drew 900 visitors in four weekends.', 'Most of those visitors said they work on weekdays.'], bad: [null, 'A trial last spring is where the new hours came from.', '900 visitors in four weekends came to that trial.', 'Working on weekdays is what most of those visitors said they do.'] },
    { s: ['Our school garden began with a single raised bed.', 'That bed grew enough tomatoes to share with the cafeteria.', 'The cafeteria’s cooks asked for more, so the science club built four new beds.', 'Those beds now feed students every September.'], bad: [null, 'Enough tomatoes to share with the cafeteria grew in that bed.', 'Four new beds were built by the science club when the cafeteria’s cooks asked for more.', 'Students are fed every September by those beds.'] },
    { s: ['The town plans to replace the footbridge over Mill Creek.', 'That footbridge has rotten planks and a loose railing.', 'That railing gave way last spring when a jogger leaned on it.', 'The jogger was not hurt, but the town closed the bridge the next day.'], bad: [null, 'Rotten planks and a loose railing are on that footbridge.', 'A jogger leaned on it last spring and the railing gave way.', 'The next day the town closed the bridge, though the jogger was not hurt.'] },
    { s: ['Bees need flowers from early spring to late fall.', 'Flowers in our park bloom only in May and June.', 'Those two months leave the bees hungry for the rest of the season.', 'To feed them into October, the park could plant clover and asters.'], bad: [null, 'Only in May and June do flowers bloom in our park.', 'The bees are left hungry for the rest of the season by those two months.', 'Clover and asters could be planted by the park to feed them into October.'] }];
  G('rhet.cohesion', function (R, ctx) {
    var ch = R.pick(CHAINS), shape = ML.byLevel(ctx, 'next', 'next', R.pick(['order', 'next']));
    if (shape === 'order') {
      var op = orderProblem(R, ch.s, 3);
      return { q: P('The cards show a paragraph’s sentences, mixed up. In which order does each sentence begin with what the last one ended on?'), a: mc(op.right, op.wrong), viz: op.viz,
        hint: 'Find the sentence that starts the topic; then look for the one that begins with its last idea.',
        steps: ch.s.map(function (x, i) { return (i + 1) + '. ' + x; }).concat(['In card letters: ' + op.right + '.']) };
    }
    var i = R.int(1, 3), wr = [ch.bad[i]];
    if (ctx.level > 1) wr.push(R.pick(CHAINS.filter(function (c) { return c !== ch; })).s[R.int(1, 3)]);
    return { q: P('Which sentence should come next?') + P(Q(ch.s[i - 1])), a: mc(ch.s[i], wr),
      hint: 'Which choice begins with something the first sentence ended on?',
      steps: ['The first sentence ends on new information.', Q(ch.s[i]) + ' begins with that information (old) and ends with something new.', 'The other choice starts with information the reader hasn’t met yet, or changes the subject.'] };
  });

  /* ---------------------------------------------------------------- rhet.register */
  var REG = [
    ['The crosswalk at Elm and Fifth needs a flashing light.', true], ['Four near misses have been reported there since January.', true], ['I hope the board will consider opening the library on Sundays.', true],
    ['The late bus has been full most days this month.', true], ['Could the school add a second late bus?', true], ['Thank you for considering this request.', true],
    ['That crosswalk is seriously sketchy.', false], ['Pls fix it asap!!', false], ['The late bus is like super packed lol.', false], ['Sundays at the library would be so chill.', false],
    ['The council totally needs to get on this.', false], ['The park’s benches are falling apart, no cap.', false], ['Can u guys add more trash cans??', false],
    ['The park’s benches have broken slats and rusted legs.', true], ['We ask the council to add two trash cans near the playground.', true]];
  var REG3 = [
    { plain: 'I hope the board will consider opening the library on Sundays.', stuffy: 'It is to be hoped that consideration will be given by the board to the utilization of the facility on Sundays.', casual: 'Yo, can the library maybe be open Sundays? That’d be awesome.' },
    { plain: 'Could the school add a second late bus? The first one is full most days.', stuffy: 'It is respectfully submitted that the augmentation of late-bus capacity be undertaken forthwith.', casual: 'The late bus is packed lol, can u add another?' },
    { plain: 'Please add a flashing light at Elm and Fifth, where four near misses have been reported.', stuffy: 'The installation of illumination devices at said intersection is hereby requested in light of incidents.', casual: 'That corner is super sketchy, you guys need a light there!!' },
    { plain: 'Thank you for reading our proposal. We would be glad to answer any questions.', stuffy: 'Gratitude is hereby expressed for the perusal of the aforementioned proposal.', casual: 'Thx for reading! Hit us up with questions.' }];
  G('rhet.register', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['fits', 'which']), R.pick(['fits', 'best', 'which']), R.pick(['best', 'stuffy', 'which']));
    if (shape === 'which') {
      var f1 = R.pick(REG.filter(function (x) { return x[1]; })), c2 = R.sample(REG.filter(function (x) { return !x[1]; }), ctx.level === 1 ? 1 : 2);
      return { q: P('Which sentence fits a formal letter to a school or town official?'), a: mc(f1[0], c2.map(function (x) { return x[0]; })),
        hint: 'Complete sentences, plain words, no slang or texting spellings.',
        steps: [Q(f1[0]) + ' is complete, clear and respectful.', 'The others use slang, texting spellings or extra exclamation marks.'] };
    }
    if (shape === 'fits') {
      var r = R.pick(REG);
      return { q: P('Does this sentence fit a letter to the city council or school board?') + P(Q(r[0])), a: mcKeep(['Fits', 'Too casual'], r[1] ? 0 : 1),
        hint: 'Look for slang, texting spellings and exclamation marks.',
        steps: r[1] ? ['Complete sentence, plain words, respectful tone.', 'It fits a formal letter.'] : ['It uses slang, a texting spelling or extra exclamation marks.', 'It is too casual for a letter to an official body.'] };
    }
    var x = R.pick(REG3);
    if (shape === 'stuffy') {
      return { q: P('Which version is formal enough for a letter to the principal, <b>and</b> easy to read?'), a: mc(x.plain, [x.stuffy, x.casual]),
        hint: 'Formal doesn’t mean fancy.',
        steps: [Q(x.plain) + ' is respectful, complete and plain.', 'The stuffy version piles up abstract nouns and passive verbs; the casual one uses slang.'] };
    }
    return { q: P('Which version fits an email to a principal?'), a: mc(x.plain, [x.casual]),
      hint: 'A respectful, complete sentence in plain words.',
      steps: [Q(x.plain) + ' is formal enough and clear.', Q(x.casual) + ' is too casual for the audience.'] };
  });

  /* ---------------------------------------------------------------- rhet.figures-of-speech */
  var FIG = ['Metaphor', 'Simile', 'Personification', 'Hyperbole', 'Understatement'];
  var FIG_WHY = ['It says one thing is another, without like or as.', 'It compares two things using like or as.', 'It gives human qualities or actions to a thing or idea.', 'It exaggerates far beyond the truth for effect.', 'It says much less than the truth, for effect.'];
  var FIGS = [
    ['The classroom was a beehive before the bell.', 0], ['Hope is a lantern on a dark road.', 0], ['For it is not light that is needed, but fire. (Douglass, 1852)', 0], ['The hallway was a river of backpacks.', 0], ['Her laugh was sunshine on a gray day.', 0],
    ['Her voice was as steady as a metronome.', 1], ['The empty gym was as quiet as a library on Sunday.', 1], ['He ran like a deer down the field.', 1], ['The lake lay flat as a mirror.', 1], ['The old car coughed like a tired bear.', 1],
    ['The old furnace groaned and complained all winter.', 2], ['The wind whispered through the pines.', 2], ['The town’s clock watched over the square.', 2], ['The rain drummed its fingers on the roof.', 2], ['… to bind up the nation’s wounds … (Lincoln, 1865)', 2],
    ['This backpack weighs a ton.', 3], ['I have told you a million times.', 3], ['We waited forever for the bus.', 3], ['My little brother eats enough for an army.', 3], ['The line at the fair stretched for miles.', 3],
    ['The flood that closed the school for a week was a bit of an inconvenience.', 4], ['After the marathon, my legs were slightly tired.', 4], ['Winning by forty points wasn’t a bad night.', 4], ['The hurricane did a little damage to the pier.', 4]];
  var MIXED = ['We need to nip this problem in the bud before it snowballs out of control.', 'The new coach is a breath of fresh air who hit the ground running.', 'Let’s not rock the boat by throwing a wrench in the works.', 'The plan is a ticking time bomb that will sink like a stone.'];
  var CLEAR_FIG = ['The plan is a seed; with water and time, it will grow.', 'The new coach is a lighthouse: steady, bright, and always in the same place.', 'The rumor spread like a grass fire in August.', 'Our budget is a tight belt, and every notch counts.'];
  G('rhet.figures-of-speech', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'name', 'name', R.pick(['mixed', 'which', 'name']));
    if (shape === 'mixed') {
      return { q: P('Which sentence <b>mixes</b> its metaphors?'), a: mc(R.pick(MIXED), R.sample(CLEAR_FIG, 2)),
        hint: 'Picture each figure literally. Does the picture hold together?',
        steps: ['A mixed metaphor jumps between pictures that don’t fit together (a plant that snowballs, a bomb that sinks).', 'The other sentences keep one picture from start to finish.'] };
    }
    if (shape === 'which') {
      var k = R.int(0, 4), right = R.pick(FIGS.filter(function (f) { return f[1] === k; })), wr = R.sample(FIGS.filter(function (f) { return f[1] !== k && !(k === 0 && f[1] === 2); }), 3);
      return { q: P('Which sentence uses <b>' + FIG[k].toLowerCase() + '</b>?'), a: mc(right[0], wr.map(function (f) { return f[0]; })),
        hint: FIG_WHY[k],
        steps: [Q(right[0]) + ': ' + lc(FIG_WHY[k])].concat(wr.map(function (f) { return Q(f[0]) + ' is ' + FIG[f[1]].toLowerCase() + '.'; })) };
    }
    var f = R.pick(ctx.level === 1 ? FIGS.filter(function (x) { return x[1] < 4; }) : FIGS), pool = [0, 1, 2, 3, 4].filter(function (i) { return i !== f[1] && (ctx.level > 1 || i < 4) && !(f[1] === 2 && i === 0); });
    return { q: P('Which figure of speech is this?') + P(Q(f[0])), a: mc(FIG[f[1]], R.sample(pool, ctx.level === 1 ? 2 : 3).map(function (i) { return FIG[i]; })),
      hint: 'Like or as? Is it a thing acting human? An exaggeration? Less than the truth?',
      steps: [FIG_WHY[f[1]], 'So it is ' + FIG[f[1]].toLowerCase() + '.'] };
  });

  /* ---------------------------------------------------------------- rhet.classic-advice */
  var SRULES = ['Use the active voice.', 'Put statements in positive form.', 'Omit needless words.', 'Express co-ordinate ideas in similar form.', 'Place the emphatic words of a sentence at the end.'];
  var SRULE_N = [11, 12, 13, 15, 18];
  var SREV = [ // [before, after, rule index, Strunk's own example?]
    ['There were a great number of dead leaves lying on the ground.', 'Dead leaves covered the ground.', 0, true], ['My first visit to Boston will always be remembered by me.', 'I shall always remember my first visit to Boston.', 0, true],
    ['The ball was kicked by Ana into the goal.', 'Ana kicked the ball into the goal.', 0, false],
    ['He was not very often on time.', 'He usually came late.', 1, true], ['The plan was not without some problems that were not small.', 'The plan had serious problems.', 1, false], ['She did not remember to bring her book.', 'She forgot her book.', 1, false],
    ['the question as to whether', 'whether', 2, true], ['His story is a strange one.', 'His story is strange.', 2, true], ['Owing to the fact that it rained, we stayed in.', 'Because it rained, we stayed in.', 2, false],
    ['We came to swim, for hiking, and to have a picnic.', 'We came to swim, to hike and to picnic.', 3, false], ['The coach praised her speed, how she passed, and that she was a leader.', 'The coach praised her speed, her passing and her leadership.', 3, false],
    ['Humanity has hardly advanced in fortitude since that time, though it has advanced in many other ways.', 'Humanity, since that time, has advanced in many other ways, but it has hardly advanced in fortitude.', 4, true],
    ['Children cross six lanes of traffic with no light, according to the report.', 'According to the report, children cross six lanes of traffic with no light.', 4, false]];
  var BREAK = { r: 'The paragraph is about the thing acted on, so it belongs in the subject position.', w: ['The passive voice sounds more formal and impressive.', 'It hides who made a mistake.', 'Longer sentences seem smarter.'] };
  G('rhet.classic-advice', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'rule', R.pick(['rule', 'break']), R.pick(['rule', 'strunk', 'break']));
    if (shape === 'break') {
      return { q: P('Strunk wrote that good writers sometimes break his rules, for “some compensating merit.” Which is a good reason to break Rule 11, ' + Q('Use the active voice') + '?'), a: mc(BREAK.r, R.sample(BREAK.w, ctx.level === 3 ? 3 : 2)),
        hint: 'A compensating merit helps the reader.',
        steps: ['A good reason to break a rule is one that helps the reader.', 'Keeping the paragraph’s topic as the subject does that; Strunk gives the same kind of example.', 'Sounding fancy, hiding responsibility or adding length do not help the reader.'] };
    }
    if (shape === 'strunk') {
      return { q: P('What did Strunk say, in his 1918 introduction, about breaking his rules?'),
        a: mc('The best writers sometimes break them, and the reader usually finds a compensating merit; a writer not sure of doing as well should follow them.', ['They must never be broken under any circumstances.', 'They are only for poetry, not for prose.', 'They matter only in business letters.']),
        hint: 'Think “compensating merit.”',
        steps: ['Strunk: “It is an old observation that the best writers sometimes disregard the rules of rhetoric.”', 'He adds that the reader “will usually find in the sentence some compensating merit,” and that a writer not certain of doing as well should follow the rules.', 'So the rules are strong defaults, not laws.'] };
    }
    var s = R.pick(SREV), k = s[2], idx = ctx.level === 1 ? R.sample([0, 1, 2, 3, 4].filter(function (i) { return i !== k; }), 2).concat([k]).sort() : [0, 1, 2, 3, 4];
    var labels = idx.map(function (i) { return SRULE_N[i] + '. ' + SRULES[i]; });
    return { q: P('Which of Strunk’s rules does this revision follow?') + P('Before: ' + Q(s[0])) + P('After: ' + Q(s[1])), a: mcKeep(labels, idx.indexOf(k)),
      hint: 'What changed: the voice, a negative, extra words, the shape of a list, or the end of the sentence?',
      steps: [['The doer became the subject: the active voice.', 'A negative (not …) became a positive statement.', 'Words that did no work were cut.', 'Parallel ideas were given the same grammatical form.', 'The important words were moved to the end.'][k], 'Rule ' + SRULE_N[k] + ': ' + Q(SRULES[k]) + (s[3] ? ' This is Strunk’s own example (1918).' : '')] };
  });

  /* ================================================================ Unit 6: Writing for Real Occasions */

  /* ---------------------------------------------------------------- rhet.reading-prompts */
  var TASKS = ['Argue', 'Analyze', 'Synthesize', 'Explain'];
  var PROMPTS = [
    ['Write an essay that argues your position on the extent to which towns should spend money on street trees.', 0],
    ['Many schools debate whether to keep recess in middle school. Develop a position on this question, supporting it with evidence from your reading, experience or observation.', 0],
    ['Write an essay that defends, challenges or qualifies the claim that every student should learn to cook.', 0],
    ['Read the passage from Lincoln’s Second Inaugural Address. Write an essay that analyzes the rhetorical choices Lincoln makes to prepare his audience for reconciliation.', 1],
    ['Read Federalist No. 51. Write an essay that analyzes how the writer persuades readers that government needs internal checks.', 1],
    ['Read the opening of Douglass’s 1852 oration. Write an essay that analyzes how Douglass builds his audience’s trust.', 1],
    ['Read the six sources on later school start times. Write an essay that synthesizes material from at least three of them to develop your position on whether high schools should start later.', 2],
    ['Using at least three of the provided sources, develop a position on whether towns should build more bike lanes.', 2],
    ['Read the five sources about community gardens and synthesize material from at least three to argue whether your town should start one.', 2],
    ['Explain how a bill becomes a law in your state, step by step.', 3], ['Explain the causes of spring flooding along Mill Creek.', 3], ['Explain how your school’s recycling program works.', 3]];
  var TASK_WHY = ['It asks you to take a position and support it (argue, defend, challenge or qualify).', 'It asks how a text’s choices work for its purpose (analyze the rhetorical choices).', 'It asks you to combine several sources to support your own position.', 'It asks you to make something clear, without arguing for a side.'];
  var RESP = [
    { p: 'Write an essay that analyzes the rhetorical choices Lincoln makes in his Second Inaugural Address.', r: 'Lincoln prepares a divided nation for peace by sharing the blame for the war and closing with a call to “charity for all.”', w: ['The Civil War was the most important war in American history.', 'Lincoln was the best president the country ever had.'] },
    { p: 'Write an essay that argues your position on whether towns should spend money on street trees.', r: 'Towns should plant street trees on their main streets, because the shade brings shoppers and cools the pavement in summer.', w: ['This essay will discuss trees.', 'Trees have been planted in many towns for many years.'] },
    { p: 'Write an essay that analyzes how Douglass builds his audience’s trust in his 1852 oration.', r: 'Douglass earns his audience’s trust by opening with modesty, so that his later fury feels earned rather than rude.', w: ['Slavery was wrong, and Douglass was right to oppose it.', 'Douglass gave his speech in Rochester in 1852.'] },
    { p: 'Using at least three sources, develop a position on whether high schools should start later.', r: 'High schools should start at 8:30, because the sleep research (Source A) shows a daily benefit that outweighs the bus costs in the district memo (Source B).', w: ['Source A is about sleep, and Source B is about buses.', 'I will now summarize each source in turn.'] }];
  G('rhet.reading-prompts', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['task', 'whichp']), R.pick(['task', 'resp', 'whichp']), R.pick(['resp', 'qualify', 'task', 'whichp']));
    if (shape === 'whichp') {
      var kt = R.int(0, 3), rp = R.pick(PROMPTS.filter(function (x) { return x[1] === kt; })), wp = R.sample(PROMPTS.filter(function (x) { return x[1] !== kt; }), 2);
      return { q: P('Which prompt asks you to <b>' + TASKS[kt].toLowerCase() + '</b>?'), a: mc(rp[0], wp.map(function (x) { return x[0]; })),
        hint: 'Find the task verb in each prompt.',
        steps: [Q(rp[0]) + ': ' + lc(TASK_WHY[kt])].concat(wp.map(function (x) { return 'The other: ' + lc(TASKS[x[1]]) + '.'; })) };
    }
    if (shape === 'resp') {
      var x = R.pick(RESP);
      return { q: P('Prompt: ' + Q(x.p)) + P('Which opening thesis answers the <b>task</b>?'), a: mc(x.r, x.w),
        hint: 'Circle the task word. Which thesis does that task?',
        steps: ['The task word: ' + (/analyzes/.test(x.p) ? 'analyze' : /sources/.test(x.p) ? 'develop a position using sources' : 'argue') + '.', Q(x.r) + ' does that task.', 'The other openings answer the topic, summarize, or announce, instead of doing the task.'] };
    }
    if (shape === 'qualify') {
      return { q: P('A prompt asks you to “defend, challenge or qualify” a claim. What does <b>qualify</b> mean here?'),
        a: mc('Agree in part, but with limits or conditions', ['Prove that you are qualified to write about it', 'Disagree completely', 'Summarize the claim without taking a side']),
        hint: 'Think of a qualifier in the Toulmin model.',
        steps: ['To qualify a claim is to accept it only partly, or only under conditions.', 'Defend = agree; challenge = disagree; qualify = agree in part.'] };
    }
    var p = R.pick(PROMPTS);
    return { q: P('What is the task in this prompt?') + P(Q(p[0])), a: mcKeep(TASKS, p[1]),
      hint: 'Find the verb that tells you what to do.',
      steps: [TASK_WHY[p[1]], 'So the task is: ' + TASKS[p[1]].toLowerCase() + '.'] };
  });

  /* ---------------------------------------------------------------- rhet.timed-writing */
  var TSTEPS = ['Read the prompt twice and mark the task word', 'Write a thesis and list two or three reasons', 'Write the introduction with the thesis', 'Write the body paragraphs', 'Write a short conclusion', 'Reread and fix errors'];
  G('rhet.timed-writing', function (R, ctx) {
    var shape = ML.byLevel(ctx, R.pick(['plan', 'late', 'next']), R.pick(['plan', 'late', 'ap', 'next']), R.pick(['order', 'plan', 'next']));
    if (shape === 'next') {
      var i = R.int(0, TSTEPS.length - 2), wn = R.sample(TSTEPS.filter(function (x, j) { return j !== i + 1 && j !== i; }), 2);
      return { q: P('In a timed essay, what should you do right after this step?') + P(Q(TSTEPS[i])), a: mc(TSTEPS[i + 1], wn),
        hint: 'Read, plan, introduction, body, conclusion, reread.',
        steps: ['The usual order: ' + TSTEPS.map(lc).join('; ') + '.', 'After ' + Q(lc(TSTEPS[i])) + ' comes ' + Q(lc(TSTEPS[i + 1])) + '.'] };
    }
    if (shape === 'plan') {
      var T = R.pick([20, 30, 40, 50, 60, 70, 80, 90, 100, 120]);
      return { q: P('You have ' + T + ' minutes for an essay. If you plan for about a tenth of the time, how many minutes do you spend planning?'), a: { t: 'num', v: String(T / 10) }, unit: 'minutes',
        hint: 'A tenth means divide by 10.',
        steps: ['A tenth of ' + T + ' minutes is ' + T + ' ÷ 10.', '= ' + (T / 10) + ' minutes for reading the prompt closely and planning a thesis and reasons.', 'Save a few minutes at the end to reread.'] };
    }
    if (shape === 'ap') {
      var total = 135, reading = 15, essays = 3;
      return { q: P('On the AP English Language exam, the free-response section lasts 2 hours 15 minutes, including a 15-minute reading period, for three essays. If you split the writing time evenly, about how many minutes is that per essay?'), a: { t: 'num', v: String((total - reading) / essays) }, unit: 'minutes',
        hint: 'Convert to minutes, take out the reading period, then divide by 3.',
        steps: ['2 hours 15 minutes = ' + total + ' minutes.', total + ' − ' + reading + ' = ' + (total - reading) + ' minutes of writing time.', (total - reading) + ' ÷ ' + essays + ' = ' + ((total - reading) / essays) + ' minutes per essay.'] };
    }
    if (shape === 'late') {
      return { q: P('Ten minutes are left. You have written two body paragraphs of a planned three, and no conclusion. What is the best move?'),
        a: mc('Write a short last point and a brief conclusion, then reread quickly', ['Start the essay over with a better thesis', 'Write the third paragraph in full and skip the conclusion', 'Stop writing and spend all ten minutes checking spelling']),
        hint: 'An unfinished essay loses more than a shorter one.',
        steps: ['A missing conclusion leaves the essay unfinished; a shorter third point only makes it shorter.', 'Add a brief last point, a two-sentence conclusion, and use any time left to reread.'] };
    }
    var op = orderProblem(R, TSTEPS, 3);
    return { q: P('The cards show the steps of a timed essay, mixed up. Which order is right?'), a: mc(op.right, op.wrong), viz: op.viz,
      hint: 'Read and plan first; reread last.',
      steps: ['Read the prompt, plan, write the introduction, the body, the conclusion, then reread.', 'In card letters: ' + op.right + '.'] };
  });

  /* ---------------------------------------------------------------- rhet.college-essay */
  var CE_OPEN = [
    { r: 'The first time I counted the food bank’s cans alone, I found 300 cans of beans and no can openers.', w: 'I have been class treasurer, captain of the swim team and a volunteer at the food bank.' },
    { r: 'At 6 a.m. on my first Saturday at the bakery, I dropped a tray of forty croissants.', w: 'I am a hard worker who never gives up, and my job taught me a lot.' },
    { r: 'My grandfather’s hands shook the first time he held the tablet I set up so he could call his sister.', w: 'I have always been good with technology and with people of all ages.' },
    { r: 'The birdhouse I built for the science fair fell apart in the first rainstorm, so I built it again, and again.', w: 'I won second place at the science fair, joined three clubs and earned a 3.9 average.' },
    { r: 'On the night of the blackout, our whole street ended up in the Garcias’ driveway, sharing a camp stove and one flashlight.', w: 'My community is very important to me, and I have done many things to help it.' }];
  var CE_TOPIC = [
    ['The afternoon I taught my grandfather to video-call his sister', true], ['Why I rebuilt the same birdhouse three times', true], ['The summer I learned to read bus maps for my little brother', true],
    ['What a broken violin string taught me about practicing', true], ['All my activities from ninth to twelfth grade', false], ['My whole life story', false], ['Why sports are important', false], ['Every place I have ever traveled', false]];
  var CE_REFL = [
    { r: 'Since that morning, I carry a notebook to every shift, and I write down one mistake and one fix before I go home.', w: ['I learned that hard work always pays off in the end.', 'It was a very meaningful experience that changed my life forever.'] },
    { r: 'Now, when a project fails, I ask what the rain would ask: where is the weak joint?', w: ['I learned to never give up on my dreams.', 'That experience taught me so much about life.'] },
    { r: 'I still don’t like asking for help, but I have learned to ask before the problem gets bigger than I am.', w: ['I realized that teamwork makes the dream work.', 'It made me a better person in every way.'] }];
  G('rhet.college-essay', function (R, ctx) {
    var shape = ML.byLevel(ctx, 'open', R.pick(['topic', 'open']), R.pick(['refl', 'topic']));
    if (shape === 'topic') {
      var good = R.pick(CE_TOPIC.filter(function (x) { return x[1]; })), bad = R.sample(CE_TOPIC.filter(function (x) { return !x[1]; }), 2);
      return { q: P('Which idea is the most promising focus for a personal essay?'), a: mc(good[0], bad.map(function (x) { return x[0]; })),
        hint: 'One moment beats a whole life.',
        steps: [Q(good[0]) + ' is one specific moment the writer can tell and reflect on.', 'The others are too broad, or are lists the rest of the application already covers.'] };
    }
    if (shape === 'refl') {
      var x = R.pick(CE_REFL);
      return { q: P('Which closing reflection is strongest?'), a: mc(x.r, x.w),
        hint: 'Look for a specific change in what the writer does or thinks.',
        steps: [Q(x.r) + ' names a specific, believable change.', 'The others are general sayings that could end anyone’s essay.'] };
    }
    var o = R.pick(CE_OPEN);
    return { q: P('Which opening is more promising for a college application essay?'), a: mc(o.r, [o.w]),
      hint: 'A specific moment, or a list of qualities and achievements?',
      steps: [Q(o.r) + ' starts with a specific moment the writer can reflect on.', Q(o.w) + ' lists achievements or claims qualities that the rest of the application already shows.'] };
  });
})(window.MathLadder);
