/* Informal Logic (Logic Ladder, course key informal): problem generators for all 53 topics.
   Built from /tmp/work_logic/informal/gen/*.js by build_gen.js (do not edit the shipped file by hand).
   Passages are original. Names and small details are drawn at random, so problems vary.
   Shapes: classify (mc), label the parts of an argument (multi of mc parts), name the fallacy (mc), find the faulty
   sentence (mc, with a quiet lg-fallacy passage), fallacy or fair reasoning (mc), spot the example (mc).
   Validity problems use a small world of classes (animals, shapes, numbers) whose truths are computed from members,
   so the truth of every premise and conclusion is worked out, not typed in. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, U = ML.util;

  // ---------------------------------------------------------------- small helpers
  var NAMES = ['Ava', 'Ben', 'Carmen', 'Dev', 'Ellie', 'Felix', 'Grace', 'Hiro', 'Isla', 'Jamal', 'Kai', 'Lena', 'Marco', 'Nora',
    'Omar', 'Priya', 'Quinn', 'Rosa', 'Sam', 'Tess', 'Umar', 'Vera', 'Wes', 'Yara', 'Zoe', 'Theo', 'Mia', 'Leo', 'Ana', 'Noah',
    'Ruby', 'Jonah', 'Lucia', 'Max', 'Hana', 'Eli'];
  var POOL = {
    food: ['pizza', 'tacos', 'pancakes', 'soup', 'pasta', 'sushi', 'chili', 'curry', 'burritos', 'waffles'],
    game: ['chess', 'soccer', 'checkers', 'basketball', 'volleyball', 'kickball', 'table tennis', 'Scrabble'],
    pet: ['dog', 'cat', 'rabbit', 'hamster', 'parrot', 'turtle', 'goldfish', 'guinea pig'],
    subject: ['math', 'science', 'history', 'art', 'music', 'Spanish', 'English', 'geography'],
    club: ['chess club', 'robotics club', 'drama club', 'garden club', 'art club', 'book fair team', 'school band', 'debate team'],
    place: ['the library', 'the park', 'the museum', 'the zoo', 'the lake', 'the science center', 'the aquarium', 'the beach'],
    day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    fruit: ['apples', 'pears', 'peaches', 'plums', 'oranges', 'bananas', 'grapes'],
    town: ['Maple Falls', 'Cedar Grove', 'Riverton', 'Pine Hollow', 'Lakeside', 'Brookfield', 'Elm Ridge', 'Stonebridge']
  };
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function fill(s, v) { // fill {placeholders}; a value that starts a sentence gets a capital letter
    return String(s).replace(/\{(\w+)\}/g, function (m, k, off, all) {
      if (v[k] === undefined) return m;
      var val = String(v[k]), before = all.slice(0, off);
      return (off === 0 || /[.!?]\s+$|:\s+$/.test(before)) ? cap(val) : val;
    });
  }
  function tidy(fn) { // clean double punctuation after closing quotes in a problem's text
    function t(s) { return typeof s === 'string' ? s.replace(/([.!?])”([.])/g, '$1”').replace(/([.!?])”:/g, '$1”:') : s; }
    return function (R, ctx) { var p = fn(R, ctx); if (p) { p.q = t(p.q); p.steps = p.steps.map(t); } return p; };
  }
  function vars(R) { // a fresh set of fill-in values for one problem
    var n = R.sample(NAMES, 4), v = { A: n[0], B: n[1], C: n[2], D: n[3] };
    Object.keys(POOL).forEach(function (k) { var two = R.sample(POOL[k], 2); v[k] = two[0]; v[k + '2'] = two[1]; });
    v.n = R.int(3, 9); v.big = R.pick([200, 300, 400, 500, 800, 1000, 1200]);
    return v;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function q(s) { return '<blockquote>' + s + '</blockquote>'; } // a passage inside a question
  function i(s) { return '<i>' + s + '</i>'; }
  function lq(s) { return '“' + s + '”'; }
  function mcq(R, correct, wrongs, k) { // one right choice and up to k-1 wrong ones (shuffled at display)
    var w = U.uniq(wrongs.filter(function (x) { return x !== correct; }));
    return U.mc(correct, R.shuffle(w), k || 4);
  }
  function keepMc(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function pickLevel(R, ctx, a, b, c) { return R.pick(ML.byLevel(ctx, a, b, c)); }

  // A passage written as 'Who: sentence|Who: sentence|plain sentence' (speaker optional, "|" between sentences).
  function parsePassage(src, v) {
    return String(src).split('|').map(function (part) {
      var t = fill(part.trim(), v), m = /^([A-Z][a-zA-Z]+(?: [A-Za-z]+)?):\s+(.*)$/.exec(t);
      return m ? { who: m[1], text: m[2] } : { text: t };
    });
  }
  function passageHtml(sents) {
    var dialog = sents.some(function (x) { return x.who; });
    if (!dialog) return q(sents.map(function (x) { return esc(x.text); }).join(' '));
    var out = [], cur = null;
    sents.forEach(function (x) {
      if (cur && cur.who === x.who) cur.t.push(esc(x.text));
      else { cur = { who: x.who, t: [esc(x.text)] }; out.push(cur); }
    });
    return q(out.map(function (c) { return (c.who ? '<b>' + c.who + ':</b> ' : '') + c.t.join(' '); }).join('<br>'));
  }
  function sentViz(sents) { // the passage as a quiet lg-fallacy picture with numbered sentences
    return { name: 'lg-fallacy', opts: { sentences: sents.map(function (x) { return x.who ? { who: x.who, text: x.text } : x.text; }), quiet: true, interactive: false, label: 'A numbered passage' } };
  }
  function sentText(x) { return (x.who ? x.who + ': ' : '') + x.text; }
  function oneLine(sents) { // one paragraph; a speaker's name only where the speaker changes
    var last = null;
    return sents.map(function (x) { var s = (x.who && x.who !== last ? x.who + ': ' : '') + x.text; last = x.who || null; return s; }).join(' ');
  }

  // ---------------------------------------------------------------- fallacies: names, jobs and look-alikes
  var FN = {
    adhom: 'Attacking the person (ad hominem)', tuq: 'You too (tu quoque)', straw: 'Straw man', herring: 'Red herring',
    force: 'Appeal to force', pity: 'Appeal to pity', people: 'Appeal to the people', authority: 'Appeal to unqualified authority',
    ignorance: 'Appeal to ignorance', begging: 'Begging the question', complex: 'Complex question', dilemma: 'False dilemma',
    hasty: 'Hasty generalization', cause: 'False cause', slope: 'Slippery slope', analogy: 'Weak analogy',
    suppressed: 'Suppressed evidence', accident: 'Accident', equiv: 'Equivocation', amph: 'Amphiboly', comp: 'Composition',
    div: 'Division', ac: 'Affirming the consequent', da: 'Denying the antecedent'
  };
  var JOB = { // what the faulty step does (used in steps)
    adhom: 'it rejects a claim by attacking the person who made it instead of the reasons given',
    tuq: 'it dismisses advice because the person giving it does not follow it',
    straw: 'it replaces the other side\'s real view with a weaker or exaggerated version, then knocks that down',
    herring: 'it changes the subject and then treats the first question as settled',
    force: 'it tries to win agreement with a threat instead of reasons',
    pity: 'it uses sympathy as if it showed the claim is true',
    people: 'it treats a claim as true, or a choice as good, because many people believe it or do it',
    authority: 'it leans on someone who is not an expert on this question, or on one voice against the experts',
    ignorance: 'it treats a lack of proof as if it were proof of the opposite',
    begging: 'a premise quietly assumes the conclusion it is supposed to prove',
    complex: 'the question has a hidden assumption, so any direct answer grants it',
    dilemma: 'it offers two options as the only ones when there are others',
    hasty: 'it jumps from a sample that is too small or not typical to a claim about the whole group',
    cause: 'it decides one thing caused another just because it came first or the two went together',
    slope: 'it claims one step will lead to a chain of bad results, without good reason to trust each link',
    analogy: 'it compares two things that are not alike in the way the conclusion needs',
    suppressed: 'it leaves out an important fact that would change the conclusion',
    accident: 'it forces a good general rule onto a special case the rule was never meant to cover',
    equiv: 'one word is used in two different senses, so the premises only seem to connect',
    amph: 'it draws a conclusion from a reading of a sentence that its grammar allows but its writer did not mean',
    comp: 'it reasons that because the parts have a property, the whole must have it too',
    div: 'it reasons that because the whole has a property, each part must have it too',
    ac: 'from "if P then Q" and Q, it concludes P, but something else could have made Q true',
    da: 'from "if P then Q" and not-P, it concludes not-Q, but Q could be true for another reason'
  };
  var NOF = 'No fallacy: the reasoning is fair';
  // look-alikes for each fallacy, closest first (used as wrong choices; only names taught by then)
  var ORDER = ['adhom', 'tuq', 'straw', 'herring', 'force', 'pity', 'people', 'authority', 'ignorance', 'begging', 'complex',
    'dilemma', 'hasty', 'cause', 'slope', 'analogy', 'suppressed', 'accident', 'equiv', 'amph', 'comp', 'div', 'ac', 'da'];
  var LIKE = {
    adhom: ['tuq', 'straw', 'herring'], tuq: ['adhom', 'herring', 'straw'], straw: ['herring', 'adhom', 'tuq'],
    herring: ['straw', 'adhom', 'tuq'], force: ['pity', 'people', 'adhom'], pity: ['force', 'people', 'herring'],
    people: ['authority', 'force', 'pity'], authority: ['people', 'adhom', 'ignorance'], ignorance: ['authority', 'people', 'begging'],
    begging: ['ignorance', 'complex', 'straw'], complex: ['begging', 'dilemma', 'straw'], dilemma: ['complex', 'slope', 'straw'],
    hasty: ['accident', 'cause', 'analogy'], cause: ['slope', 'hasty', 'analogy'], slope: ['cause', 'dilemma', 'force'],
    analogy: ['hasty', 'cause', 'comp'], suppressed: ['hasty', 'straw', 'begging'], accident: ['hasty', 'div', 'analogy'],
    equiv: ['amph', 'comp', 'begging'], amph: ['equiv', 'div', 'straw'], comp: ['div', 'hasty', 'equiv'],
    div: ['comp', 'accident', 'equiv'], ac: ['da', 'cause', 'begging'], da: ['ac', 'dilemma', 'cause']
  };
  function taughtBefore(k) { return ORDER.slice(0, ORDER.indexOf(k)); }
  function rivals(k, n) { // names of look-alikes taught by this point, padded with other taught ones
    var t = taughtBefore(k), out = LIKE[k].filter(function (x) { return t.indexOf(x) >= 0; });
    t.slice().reverse().forEach(function (x) { if (out.indexOf(x) < 0) out.push(x); });
    return out.slice(0, n);
  }


  // ================================================================ Unit 1: Arguments
  // ---- statements
  var ST_YES = [
    ['Owls hunt mostly at night.', 'It makes a claim about owls, and the claim is true.'],
    ['There are nine planets in our solar system.', 'It is false (there are eight), but a false claim is still a statement.'],
    ['{food} is the best food.', 'It is an opinion, but it still claims something, so it is a statement.'],
    ['{A} has a {pet} named Biscuit.', 'It claims something about {A} that is either true or false.'],
    ['The {town} library opens at nine on {day}s.', 'It is a claim about opening hours, true or false.'],
    ['Seven is an even number.', 'It is false, and a false claim is still a statement.'],
    ['It will rain in {town} tomorrow.', 'A prediction is true or false, even if we do not know which yet.'],
    ['{subject} is the hardest subject at school.', 'An opinion people disagree about is still a claim, so it is a statement.'],
    ['Whales are fish.', 'It is false (whales are mammals), but it is still a statement.'],
    ['Spiders have eight legs.', 'A true claim about spiders.'],
    ['{game} is more fun than {game2}.', 'An opinion is still a claim that someone can agree or disagree with.'],
    ['{B} was born in {town}.', 'It is either true or false, so it is a statement.'],
    ['The moon is made of cheese.', 'It is plainly false, but it is still a statement.']
  ];
  var ST_NO = [
    ['Is the library open on {day}?', 'question', 'A question asks; it does not claim anything.'],
    ['What time does the {game} game start?', 'question', 'A question is neither true nor false.'],
    ['Have you fed the {pet} yet?', 'question', 'A question asks for information instead of claiming it.'],
    ['Please pass the salt.', 'command', 'A request is neither true nor false.'],
    ['Close the door, {A}.', 'command', 'A command tells someone to act; it is not true or false.'],
    ['Bring your {subject} book tomorrow.', 'command', 'An instruction is neither true nor false.'],
    ['Don\'t touch the wet paint!', 'command', 'A warning given as a command is neither true nor false.'],
    ['What a sunset!', 'exclamation', 'An exclamation shows a feeling; it does not make a claim.'],
    ['Hooray for {B}!', 'exclamation', 'A cheer is neither true nor false.'],
    ['Ouch!', 'exclamation', 'A cry of pain is not a claim.'],
    ['Let\'s go to {place} on {day}.', 'command', 'A suggestion invites action; it is not true or false.'],
    ['Happy birthday, {C}!', 'exclamation', 'A greeting or wish is not true or false.']
  ];
  var KIND = { question: 'Question', command: 'Command or request', exclamation: 'Exclamation' };
  function stPick(R, bank, v) { var it = R.pick(bank); return { text: fill(it[0], v), why: fill(it[it.length - 1], v), kind: it.length > 2 ? it[1] : 'statement' }; }
  G('informal.statements', tidy(function (R, ctx) {
    var v = vars(R), shape = pickLevel(R, ctx, ['one', 'one'], ['one', 'kind', 'odd'], ['all', 'odd', 'kind']);
    if (shape === 'one') {
      var yes = R.coin(), it = stPick(R, yes ? ST_YES : ST_NO, v);
      return { q: 'Is this sentence a statement?' + q(esc(it.text)), a: keepMc(['Statement', 'Not a statement'], yes ? 0 : 1),
        steps: ['Ask: could this sentence be true or false?', it.why, yes ? 'So it is a statement.' : 'So it is not a statement.'], hint: 'A statement is a sentence that is either true or false, even if you don\'t know which.' };
    }
    if (shape === 'kind') {
      var all = ST_YES.map(function (x) { return x.concat(['statement']); }).concat(ST_NO.map(function (x) { return [x[0], x[2], x[1]]; }));
      var k = R.pick(all), text = fill(k[0], v), kind = k[2], why = fill(k[1], v);
      var names = { statement: 'Statement', question: 'Question', command: 'Command or request', exclamation: 'Exclamation' };
      return { q: 'What kind of sentence is this?' + q(esc(text)), a: keepMc(['Statement', 'Question', 'Command or request', 'Exclamation'], ['statement', 'question', 'command', 'exclamation'].indexOf(kind)),
        steps: [why, 'So it is: ' + names[kind] + '.', kind === 'statement' ? 'Only statements can be true or false.' : 'Only a statement is true or false; this one is not a statement.'], hint: 'Does it claim, ask, tell someone to act, or show a feeling?' };
    }
    if (shape === 'odd') {
      var findNon = R.coin(), one = stPick(R, findNon ? ST_NO : ST_YES, v), rest = R.sample(findNon ? ST_YES : ST_NO, 3).map(function (x) { return fill(x[0], v); }).filter(function (x) { return x !== one.text; }).slice(0, 3);
      return { q: findNon ? 'Which of these is <b>not</b> a statement?' : 'Which of these <b>is</b> a statement?', a: mcq(R, one.text, rest, 4),
        steps: [lq(esc(one.text)) + ': ' + one.why, findNon ? 'Each of the others makes a claim that is true or false (even the opinions and the false ones).' : 'The others ask, tell or exclaim, so none of them is true or false.'], hint: 'Test each one: could it be true or false?' };
    }
    var ys = R.sample(ST_YES, R.int(2, 3)), ns = R.sample(ST_NO, 5 - ys.length), cards = R.shuffle(ys.map(function (x) { return { t: fill(x[0], v), y: 1, w: fill(x[1], v) }; }).concat(ns.map(function (x) { return { t: fill(x[0], v), y: 0, w: fill(x[2], v) }; })));
    return { q: 'Choose <b>every</b> sentence that is a statement.', a: { t: 'mc', choices: cards.map(function (c) { return c.t; }), v: cards.map(function (c, j) { return c.y ? j : -1; }).filter(function (j) { return j >= 0; }) },
      steps: cards.map(function (c) { return lq(esc(c.t)) + ': ' + (c.y ? 'statement. ' : 'not a statement. ') + c.w; }), hint: 'Opinions and false claims are still statements.' };
  }));

  // ---- arguments and non-arguments
  var ARG = [
    'The {town} pool closes at six, and it is already half past five. So we won\'t have time for a swim today.',
    'You should bring a jacket to {place}. The forecast says it will be windy and cold.',
    '{A} must be home, because the lights are on and the bike is in the driveway.',
    'Every student in the {club} signed up for the trip, and {B} is in the {club}. So {B} signed up for the trip.',
    'The {pet} needs a bigger cage. It has doubled in size since spring and can barely turn around.',
    'We should leave for the game early, since the road by the stadium is closed for repairs.',
    'The {food} at the cafe is usually gone by noon. Therefore, if we want some, we should go this morning.',
    'This plant needs more light: its leaves are turning pale, and it leans toward the window.'
  ];
  var NOARG = [
    ['The {town} pool opened in 1985. It has a diving board and a snack bar.', 'Description', 'It describes the pool but tries to prove nothing.'],
    ['Last {day}, the {club} met in room {n}. Twelve students came and they planned the spring fair.', 'Report', 'It reports what happened; no claim is supported by reasons.'],
    ['Watch out! The floor by the sink is wet.', 'Warning', 'It warns, but it does not give reasons for a conclusion.'],
    ['{food} is the best food in the world. Nothing will ever change my mind.', 'Bare opinion', 'It states an opinion strongly, but offers no reason for it.'],
    ['If it snows on {day}, school will start late.', 'Conditional statement', 'One "if… then" sentence makes a single claim; it does not offer a reason for a separate conclusion.'],
    ['Be careful near the {pet}\'s cage. It sometimes nips fingers.', 'Warning', 'A warning with a reason attached is close, but its main job is to warn, not to prove a claim in doubt.'],
    ['I think {subject} is the most interesting subject. I really, really love it.', 'Bare opinion', 'Saying an opinion twice, or loudly, is not giving a reason.'],
    ['The museum has three floors. Dinosaurs are on the first floor and space rockets are on the third.', 'Description', 'It describes the museum; nothing is offered as a reason for anything else.'],
    ['This morning {A} fed the {pet}, packed lunch and walked to school.', 'Report', 'It tells what happened, in order, without supporting a claim.']
  ];
  G('informal.arguments', tidy(function (R, ctx) {
    var v = vars(R), shape = pickLevel(R, ctx, ['one'], ['one', 'kind'], ['which', 'kind', 'one']);
    if (shape === 'one') {
      var yes = R.coin(), txt, why;
      if (yes) { txt = fill(R.pick(ARG), v); why = 'It gives at least one reason (a premise) to support a claim (the conclusion).'; }
      else { var n = R.pick(NOARG); txt = fill(n[0], v); why = fill(n[2], v) + ' It is a ' + n[1].toLowerCase() + '.'; }
      return { q: 'Is this passage an argument?' + q(esc(txt)), a: keepMc(['Argument', 'Not an argument'], yes ? 0 : 1),
        steps: ['Look for a claim the speaker wants us to accept, and a reason offered for it.', why], hint: 'An argument needs a conclusion and at least one reason offered for it.' };
    }
    if (shape === 'kind') {
      var nn = R.pick(NOARG), kinds = ['Description', 'Report', 'Warning', 'Bare opinion', 'Conditional statement'];
      return { q: 'This passage is not an argument. What is it?' + q(esc(fill(nn[0], v))), a: mcq(R, nn[1], kinds, 4),
        steps: [fill(nn[2], v), 'So it is a ' + nn[1].toLowerCase() + ', not an argument.'], hint: 'Does it describe, report events, warn, state an opinion, or make one if-then claim?' };
    }
    var a = fill(R.pick(ARG), v), ns2 = R.sample(NOARG, 2).map(function (x) { return fill(x[0], v); });
    return { q: 'Which passage is an argument?', a: mcq(R, esc(a), ns2.map(esc), 3),
      steps: [lq(esc(a)) + ' gives a reason to accept a claim, so it is an argument.', 'The others describe, report, warn or state an opinion without offering a reason for a conclusion.'], hint: 'Find the passage where one claim is offered as a reason for another.' };
  }));

  // ---- arguments and explanations
  var EXPL = [ // [passage, 'arg' | 'exp', why]
    ['The ice on the pond melted because the weather turned warm this week.', 'exp', 'Everyone can see that the ice melted; the passage tells why it happened.'],
    ['The {pet} is probably sick, because it hasn\'t eaten in two days and it is hiding under the bed.', 'arg', 'Whether the {pet} is sick is in doubt; the passage gives evidence to show it.'],
    ['The game was cancelled because the field flooded.', 'exp', 'We already know the game was cancelled; the passage gives the cause.'],
    ['{A} must have left already, because the coat is gone from the hook.', 'arg', 'Whether {A} left is the question; the missing coat is offered as evidence.'],
    ['Leaves change color in fall because the green pigment breaks down as the days get shorter.', 'exp', 'That leaves change color is not in doubt; the passage explains how it happens.'],
    ['We should plant the tomatoes next week, because the last frost will be over by then.', 'arg', 'The claim (plant next week) is a proposal in doubt, and a reason is given for it.'],
    ['{B} was late to school because the bus broke down.', 'exp', 'That {B} was late is known; the bus explains why.'],
    ['This bridge is safe for the school bus, because engineers tested it last month and it held three times the bus\'s weight.', 'arg', 'The safety of the bridge is the point to prove, and the test is the evidence.'],
    ['The bread rose because the yeast made bubbles of gas in the dough.', 'exp', 'That the bread rose is accepted; the passage explains the cause.'],
    ['The {club} will probably need a bigger room, since forty students signed up this year.', 'arg', 'The need for a bigger room is a claim in doubt, supported by the sign-up numbers.'],
    ['The milk went sour because it was left out on the counter all night.', 'exp', 'Everyone agrees the milk is sour; the passage tells why.'],
    ['The power went out on our street because a tree fell on the lines.', 'exp', 'The outage is a known fact; the fallen tree explains it.'],
    ['Our tomatoes grew big this year because we watered them every morning.', 'exp', 'That the tomatoes grew big is accepted; the watering explains it.'],
    ['The puddles are gone because the sun dried them up.', 'exp', 'No one doubts the puddles are gone; the passage gives the cause.'],
    ['{A} should bring an umbrella today, because the forecast calls for afternoon rain.', 'arg', 'Whether {A} should bring an umbrella is a proposal in doubt, and the forecast is the reason offered.'],
    ['Someone has been in the kitchen, because the cookie jar is empty and there are crumbs on the counter.', 'arg', 'That someone was in the kitchen is the point to prove; the crumbs and the empty jar are evidence.'],
    ['The {club} ought to meet on {day}s, since that is the only day the art room is free.', 'arg', 'When the club should meet is in question, and a reason is given for one answer.'],
    ['The {pet} is probably thirsty, since its water bowl has been empty all morning.', 'arg', 'Whether the {pet} is thirsty is in doubt; the empty bowl is offered as evidence.']
  ];
  G('informal.explanations', tidy(function (R, ctx) {
    var v = vars(R), shape = pickLevel(R, ctx, ['one'], ['one', 'job'], ['which', 'job', 'one']);
    if (shape === 'which') {
      var wantExp = R.coin(), right = R.pick(EXPL.filter(function (e) { return (e[1] === 'exp') === wantExp; }));
      var wrong = R.sample(EXPL.filter(function (e) { return (e[1] === 'exp') !== wantExp; }), 2);
      return { q: 'Which passage is ' + (wantExp ? 'an explanation' : 'an argument') + '?', a: mcq(R, esc(fill(right[0], v)), wrong.map(function (w) { return esc(fill(w[0], v)); }), 3),
        steps: [lq(esc(fill(right[0], v))) + ': ' + fill(right[2], v), 'In the others, ' + (wantExp ? 'the claim is in doubt and reasons are given to show it is true, so they are arguments.' : 'the fact is already accepted and the passage tells why, so they are explanations.')], hint: 'Is the main claim already accepted (explanation) or in doubt (argument)?' };
    }
    var e = R.pick(EXPL), isExp = e[1] === 'exp';
    if (shape === 'job') {
      return { q: 'What is this passage mainly doing?' + q(esc(fill(e[0], v))), a: keepMc(['Showing that a claim is true (an argument)', 'Telling why something we accept is true (an explanation)'], isExp ? 1 : 0),
        steps: [fill(e[2], v), isExp ? 'So it explains.' : 'So it argues.'], hint: 'Would anyone doubt the main claim before reading the reasons?' };
    }
    return { q: 'Is this passage an argument or an explanation?' + q(esc(fill(e[0], v))), a: keepMc(['Argument', 'Explanation'], isExp ? 1 : 0),
      steps: ['Both kinds can use "because". Ask whether the main claim is in doubt or already accepted.', fill(e[2], v), isExp ? 'So it is an explanation.' : 'So it is an argument.'], hint: 'Is the claim before "because" something everyone already accepts?' };
  }));

  // ---- premises and conclusions (also used by indicator words, standard form)
  // items: list of [role, text]; role p premise, c conclusion, n neither (background)
  var PC = [
    [['p', 'The {town} pool closes at six.'], ['p', 'It is already half past five.'], ['c', 'So we won\'t have time for a swim today.']],
    [['c', 'You should bring a jacket to {place}.'], ['p', 'The forecast says it will be windy.'], ['p', 'And it gets cold there after dark.']],
    [['p', 'The lights are on at {A}\'s house.'], ['c', '{A} must be home.'], ['p', 'Besides, {A}\'s bike is in the driveway.']],
    [['c', 'Our class should hold the bake sale on {day}.'], ['p', 'That is the day most parents come to pick up their kids.'], ['p', 'And the gym is free that afternoon.']],
    [['p', 'Every student in the {club} signed up for the trip.'], ['p', '{B} is in the {club}.'], ['c', 'Therefore, {B} signed up for the trip.']],
    [['p', 'The {pet} has doubled in size since spring.'], ['p', 'It can barely turn around in its cage.'], ['c', 'Clearly, it needs a bigger cage.']],
    [['c', 'The old oak in the park should be checked by a tree expert.'], ['p', 'A large branch fell off last week.'], ['p', 'And there is a crack running down the trunk.']],
    [['p', 'Most of the {fruit} in the bowl are soft and brown.'], ['c', 'We should use them in a pie today.'], ['p', 'Tomorrow they will be too far gone.']],
    [['p', 'The library\'s {subject} books are all checked out.'], ['p', 'The report is due on {day}.'], ['c', 'So {C} had better start looking for sources online.']],
    [['c', 'We need to leave by seven.'], ['p', 'The concert starts at eight.'], ['p', 'And the drive takes almost an hour.']]
  ];
  var PCN = [ // background sentences that are neither (added at level 3)
    'The {town} pool was built when my grandparents were kids.', 'I love going to {place}.', '{A} has lived in {town} for {n} years.',
    'The gym was painted blue last summer.', 'By the way, the {club} has a new logo.', 'My cousin visited last week.'
  ];
  function pcItem(R, v, withN) {
    var it = R.pick(PC).map(function (x) { return [x[0], fill(x[1], v)]; });
    if (withN) { var pos = R.int(0, it.length); it.splice(pos, 0, ['n', fill(R.pick(PCN), v)]); }
    return it;
  }
  var ROLE = { p: 'Premise', c: 'Conclusion', n: 'Neither' };
  G('informal.premise-conclusion', tidy(function (R, ctx) {
    var v = vars(R), shape = pickLevel(R, ctx, ['concl'], ['concl', 'label'], ['labeln', 'label']);
    var it = pcItem(R, v, shape === 'labeln'), ci = it.map(function (x) { return x[0]; }).indexOf('c');
    var passage = q(it.map(function (x) { return esc(x[1]); }).join(' '));
    if (shape === 'concl') {
      return { q: 'Which sentence is the conclusion?' + passage, a: mcq(R, it[ci][1], it.filter(function (x) { return x[0] !== 'c'; }).map(function (x) { return x[1]; }), 4),
        steps: ['Ask: what does the speaker want us to believe?', 'The conclusion is ' + lq(esc(it[ci][1])), 'The other sentences are reasons for it: they are the premises.'], hint: 'Find the claim the other sentences are offered as reasons for. It may come first, last or in the middle.' };
    }
    var keys = shape === 'labeln' ? ['p', 'c', 'n'] : ['p', 'c'], labels = keys.map(function (k) { return ROLE[k]; });
    return { q: 'Label each sentence of the argument.' + passage,
      a: { t: 'multi', parts: it.map(function (x, j) { return { label: (j + 1) + '. ' + esc(x[1]), a: keepMc(labels.slice(), keys.indexOf(x[0])) }; }) },
      steps: ['The conclusion is ' + lq(esc(it[ci][1])) + ': it is what the speaker wants us to accept.'].concat(it.filter(function (x) { return x[0] === 'n'; }).map(function (x) { return lq(esc(x[1])) + ' is background: it gives no reason for the conclusion, so it is neither.'; })).concat(['The other sentences are premises: they give reasons for the conclusion.']),
      hint: 'Find the conclusion first, then ask which sentences support it.' };
  }));

  // ---- indicator words
  var CIND = ['therefore', 'so', 'thus', 'hence', 'consequently', 'it follows that', 'as a result', 'which shows that', 'accordingly', 'for this reason', 'we can conclude that', 'which means that'];
  var PIND = ['because', 'since', 'for', 'given that', 'as shown by', 'after all', 'seeing that', 'for the reason that', 'as indicated by', 'in view of the fact that', 'the reason is that', 'inasmuch as'];
  var USES = [ // [sentence, word, indicator?, why]
    ['We have known each other since second grade.', 'since', false, '"Since" here is about time, not a reason.'],
    ['Since the store is closed, we will buy bread tomorrow.', 'since', true, '"Since the store is closed" gives the reason for buying bread tomorrow.'],
    ['I was so tired after the hike.', 'so', false, '"So" here means "very".'],
    ['The hike was long, so we went to bed early.', 'so', true, '"So" introduces what follows from the long hike.'],
    ['{A} bought flowers for the teacher.', 'for', false, '"For" here tells who the flowers were meant for.'],
    ['We should stay inside, for the storm is getting worse.', 'for', true, '"For" introduces the reason we should stay inside.'],
    ['The {club} has met every {day} since March.', 'since', false, '"Since March" tells when, not why.'],
    ['Since {B} has practiced every day, {B} is ready for the recital.', 'since', true, '"Since" gives the reason {B} is ready.'],
    ['Thank you so much for the gift!', 'so', false, '"So much" means "very much".'],
    ['The {pet} is shivering, so we should bring it inside.', 'so', true, '"So" marks the conclusion: we should bring it inside.'],
    ['{B} has been waiting since noon.', 'since', false, '"Since noon" tells when the waiting began, not why.'],
    ['Since the gym is being painted, practice will be held outside.', 'since', true, '"Since the gym is being painted" gives the reason practice moves outside.'],
    ['The soup was so hot that {A} waited to eat it.', 'so', false, '"So hot" means "very hot".'],
    ['The {fruit} were on sale, so we bought a big bag.', 'so', true, '"So" introduces what followed from the sale: we bought a big bag.'],
    ['{A} made a card for {B}.', 'for', false, '"For" tells who the card was meant for.'],
    ['We should leave now, for the last train departs in ten minutes.', 'for', true, '"For" introduces the reason we should leave now.']
  ];
  var IND_ARGS = [ // [premise, conclusion]
    ['the road is icy', 'we should drive slowly'], ['the {club} needs more members', 'we should put up posters'],
    ['{A} is allergic to cats', '{A} shouldn\'t visit the cat cafe'], ['the bus leaves at seven', 'we need to be ready by a quarter to seven'],
    ['the soil is dry', 'the garden needs water'], ['the {fruit} are ripe', 'we should pick them this week'],
    ['the library closes early on {day}s', '{B} should return the book on {day} morning']
  ];
  G('informal.indicator-words', tidy(function (R, ctx) {
    var v = vars(R), shape = pickLevel(R, ctx, ['word', 'find'], ['find', 'word', 'use'], ['use', 'find']);
    if (shape === 'word') {
      var isC = R.coin(), w = R.pick(isC ? CIND : PIND);
      return { q: 'In an argument, what does the word or phrase <b>' + w + '</b> usually mark?', a: keepMc(['A conclusion', 'A premise'], isC ? 0 : 1),
        steps: [isC ? '"' + w + '" usually comes before what follows from the reasons: "The road is icy, ' + w + ' we should drive slowly."' : '"' + w + '" usually comes before a reason: "We should drive slowly, ' + w + ' the road is icy."', isC ? 'So it marks a conclusion.' : 'So it marks a premise.'], hint: 'Try it in a sentence: does the word come before a reason or before what the reason shows?' };
    }
    if (shape === 'find') {
      var pair = R.pick(IND_ARGS), P = fill(pair[0], v), C = fill(pair[1], v), usePrem = R.coin(), word = R.pick(usePrem ? ['because', 'since', 'given that'] : ['so', 'therefore', 'thus']);
      var txt = usePrem ? (R.coin() ? cap(C) + ', ' + word + ' ' + P + '.' : cap(word) + ' ' + P + ', ' + C + '.') : cap(P) + ', ' + word + ' ' + C + '.';
      return { q: 'What is the conclusion of this argument?' + q(esc(txt)), a: mcq(R, cap(C) + '.', [cap(P) + '.'], 2),
        steps: ['The indicator word is <b>' + word + '</b>, which marks a ' + (usePrem ? 'premise' : 'conclusion') + '.', usePrem ? 'So ' + lq(esc(P)) + ' is the reason, and the other claim is the conclusion.' : 'So the claim after it is the conclusion.', 'Conclusion: ' + esc(cap(C)) + '.'], hint: 'Does the indicator word mark a reason or a conclusion?' };
    }
    var u = R.pick(USES), s = fill(u[0], v);
    return { q: 'Is <b>' + u[1] + '</b> used as an indicator word in this sentence?' + q(esc(s)), a: keepMc(['Yes: it marks a premise or a conclusion', 'No: it has another meaning here'], u[2] ? 0 : 1),
      steps: [fill(u[3], v), u[2] ? 'So it works as an indicator word.' : 'So it is not an indicator word here.'], hint: 'Swap it for "because" or "therefore". Does the sentence keep its meaning?' };
  }));

  // ---- standard form
  var SF = [ // passage sentences (s), the index of the side remark (xi), premises, conclusion, a meaning-changed premise
    { s: ['My grandmother loves {place}.', 'Anyway, we should have the picnic at {place}.', 'It has covered tables in case it rains.', 'And it is only a short walk from school.'], xi: 0, p: ['{place} has covered tables in case it rains.', '{place} is a short walk from school.'], c: 'We should have the picnic at {place}.', bad: '{place} always has rain.' },
    { s: ['The {pet} needs a bigger cage.', 'It has doubled in size since spring.', 'I got it for my birthday, by the way.', 'It can barely turn around.'], xi: 2, p: ['The {pet} has doubled in size since spring.', 'The {pet} can barely turn around in its cage.'], c: 'The {pet} needs a bigger cage.', bad: 'The {pet} has stopped growing.' },
    { s: ['Every member of the {club} must pay dues.', '{B} joined the {club} in September.', 'September was a rainy month.', 'So {B} must pay dues.'], xi: 2, p: ['Every member of the {club} must pay dues.', '{B} is a member of the {club}.'], c: '{B} must pay dues.', bad: 'Some members of the {club} must pay dues.' },
    { s: ['We need to leave by seven.', 'The concert starts at eight.', 'The drive takes almost an hour.', 'I really hope they play my favorite song.'], xi: 3, p: ['The concert starts at eight.', 'The drive takes almost an hour.'], c: 'We need to leave by seven.', bad: 'The drive takes a few minutes.' },
    { s: ['All the {fruit} in this crate came from the {town} orchard.', 'My uncle drove us there once.', 'The orchard sprays nothing on its trees.', 'So the {fruit} in this crate were not sprayed.'], xi: 1, p: ['All the {fruit} in this crate came from the {town} orchard.', 'The {town} orchard sprays nothing on its trees.'], c: 'The {fruit} in this crate were not sprayed.', bad: 'Some of the {fruit} came from the {town} orchard.' },
    { s: ['You should wear a helmet when you ride.', 'Helmets protect your head in a fall.', 'My helmet is green, by the way.', 'And falls happen even to good riders.'], xi: 2, p: ['Helmets protect your head in a fall.', 'Falls happen even to good riders.'], c: 'You should wear a helmet when you ride.', bad: 'Falls happen only to new riders.' }
  ];
  function sfText(ps, c) { return ps.map(function (p, j) { return '<b>P' + (j + 1) + '.</b> ' + esc(p); }).join('<br>') + '<br><b>So:</b> ' + esc(c); }
  G('informal.standard-form', tidy(function (R, ctx) {
    var v = vars(R), it = R.pick(SF), f = function (z) { return fill(z, v); }, ps = it.p.map(f), c = f(it.c), sents = it.s.map(f), x = sents[it.xi], s = sents.join(' ');
    var shape = pickLevel(R, ctx, ['aside'], ['form', 'aside'], ['form']);
    if (shape === 'aside') {
      return { q: 'Which sentence should be left out when this argument is put in standard form?' + q(esc(s)), a: mcq(R, x, sents.filter(function (z, j) { return j !== it.xi; }), 4),
        steps: ['The conclusion is ' + lq(esc(c)), 'The premises are the reasons given for it: ' + ps.map(function (p) { return lq(esc(p)); }).join(' and ') + '.', lq(esc(x)) + ' gives no reason for the conclusion. It is a side remark, so standard form leaves it out.'], hint: 'Find the conclusion and its reasons. Which sentence is neither?' };
    }
    var right = sfText(ps, c), w1 = sfText(ps.concat([x.replace(/,? by the way/, '').replace(/^Anyway, /, '')]), c), w2 = sfText([c, ps[1]], ps[0]), w3 = sfText([fill(it.bad, v), ps[1]], c);
    return { q: 'Which is the best standard form of this argument?' + q(esc(s)), a: mcq(R, right, ctx.level >= 3 ? [w3, w2, w1] : [w1, w2], ctx.level >= 3 ? 4 : 3),
      steps: ['Find the conclusion: ' + lq(esc(c)), 'List the reasons as premises, in plain words, without changing what they claim: ' + ps.map(function (p) { return lq(esc(p)); }).join(' and ') + '.', 'Leave out the side remark ' + lq(esc(x)) + ', and do not swap a premise with the conclusion.'], hint: 'Premises first, conclusion last, and leave out anything that is not a reason.' };
  }));

  // ---- linked and convergent premises
  var LC = [ // [conclusion, p1, p2, 'linked' | 'convergent', why]
    ['{B} signed up for the trip.', 'Every member of the {club} signed up for the trip.', '{B} is a member of the {club}.', 'linked', 'Neither premise alone says anything about {B} and the trip; together they do.'],
    ['We should take the bus to {place}.', 'The bus is cheaper than a taxi.', 'The bus stops right at the door.', 'convergent', 'Each reason supports taking the bus on its own: cheaper by itself is a reason, and so is the handy stop.'],
    ['The {pet} needs a vet visit.', 'The {pet} has not eaten for two days.', 'The {pet} is limping.', 'convergent', 'Either fact alone would be a reason to see the vet.'],
    ['The package will arrive on {day}.', 'Packages from this store take three days.', 'The package was sent three days before {day}.', 'linked', 'The shipping time means nothing without the date it was sent, and the reverse.'],
    ['{A} should join the {club}.', '{A} loves building things.', 'Many of {A}\'s friends are already members.', 'convergent', 'Each premise gives its own reason to join.'],
    ['This number is divisible by 6.', 'The number is even.', 'The number is divisible by 3.', 'linked', 'Being even alone is not enough, and neither is being divisible by 3; the two together are.'],
    ['The garden needs water.', 'It has not rained for two weeks.', 'The leaves are wilting.', 'convergent', 'Each fact alone suggests the garden is thirsty.'],
    ['The concert is sold out.', 'The hall holds 500 people.', '500 tickets have been sold.', 'linked', 'The number of seats only matters together with the number of tickets sold.'],
    ['We should cancel the picnic.', 'A thunderstorm is coming.', 'Half of the class is sick.', 'convergent', 'Either one by itself is a reason to cancel.'],
    ['The key is in the kitchen.', 'The key is either in the kitchen or in the car.', 'The key is not in the car.', 'linked', 'The either-or premise needs the second premise to rule one choice out.'],
    ['{A} can ride the big roller coaster.', 'Riders must be at least 48 inches tall.', '{A} is 50 inches tall.', 'linked', 'The height rule says nothing about {A} without {A}\'s height, and the height means nothing without the rule.'],
    ['The {club} meeting is in Room 12.', 'The {club} meets wherever Ms. Lee teaches.', 'Ms. Lee teaches in Room 12.', 'linked', 'Only together do the two premises point to Room 12.'],
    ['The museum is free for {B} today.', 'The museum is free for students on {day}s.', 'Today is {day}, and {B} is a student.', 'linked', 'The rule and the facts about today and {B} work only as a pair.'],
    ['We should eat at home tonight.', 'The fridge is full of leftovers.', 'The restaurant is closed for repairs.', 'convergent', 'Either fact alone is a reason to eat at home.'],
    ['{B} will probably do well on the test.', '{B} studied every night this week.', '{B} got a perfect score on the practice test.', 'convergent', 'Each premise alone gives some reason to expect a good score.'],
    ['The old bike should be fixed before the race.', 'Its brakes squeak.', 'Its chain keeps slipping.', 'convergent', 'Each problem alone is a reason to fix the bike.']
  ];
  G('informal.argument-maps', tidy(function (R, ctx) {
    var v = vars(R), shape = pickLevel(R, ctx, ['two'], ['two'], ['three', 'two']);
    if (shape === 'two') {
      var it = R.pick(LC), c = fill(it[0], v), p1 = fill(it[1], v), p2 = fill(it[2], v);
      return { q: 'Are these premises linked or convergent?' + q('<b>P1.</b> ' + esc(p1) + '<br><b>P2.</b> ' + esc(p2) + '<br><b>So:</b> ' + esc(c)), a: keepMc(['Linked: they support the conclusion only together', 'Convergent: each gives a separate reason'], it[3] === 'linked' ? 0 : 1),
        steps: ['Cover P1. Does P2 alone still give some reason for the conclusion? Then cover P2 and ask the same about P1.', fill(it[4], v), 'So they are ' + it[3] + '.'], hint: 'Remove one premise. Does the other still give some support by itself?' };
    }
    var L = R.pick(LC.filter(function (x) { return x[3] === 'linked'; })), cv = R.pick([
      ['Our teacher said so in class.', 'teacher'], ['A sign on the door says so too.', 'sign']]);
    var prem = [fill(L[1], v), fill(L[2], v), fill(cv[0], v)], order = R.shuffle([0, 1, 2]);
    var shown = order.map(function (k) { return prem[k]; }), li = [order.indexOf(0) + 1, order.indexOf(1) + 1].sort();
    var pairs = ['1 and 2', '1 and 3', '2 and 3'], right = li.join(' and ');
    return { q: 'Which two premises are <b>linked</b>? The third gives a separate reason.' + q(shown.map(function (p, j) { return '<b>P' + (j + 1) + '.</b> ' + esc(p); }).join('<br>') + '<br><b>So:</b> ' + esc(fill(L[0], v))),
      a: keepMc(pairs.concat(['None: all three are separate reasons']), pairs.indexOf(right)),
      steps: [fill(L[4], v), 'So P' + li[0] + ' and P' + li[1] + ' are linked.', lq(esc(prem[2])) + ' is a separate (convergent) reason: it supports the conclusion by itself.'], hint: 'Find the pair that only works together.' };
  }));

  // ---- chains of reasoning
  var CH = [ // [premises for the sub-conclusion], sub, [extra premise], main
    [['All the library\'s mystery books are on the second floor.', 'This book is a mystery from the library.'], 'So this book belongs on the second floor.', ['The cart is going to the second floor.'], 'So this book should go on the cart.'],
    [['The store closes at six.', 'It is already ten to six.'], 'So we can\'t get to the store before it closes.', ['We need milk for breakfast.'], 'So we should ask the neighbors for some milk.'],
    [['{A} scored the most goals this season.', 'The top scorer gets the golden boot.'], 'So {A} will get the golden boot.', ['Winners of the golden boot are invited to the banquet.'], 'So {A} will be invited to the banquet.'],
    [['The {pet} hasn\'t eaten since yesterday.', 'It is also hiding and sleeping all day.'], 'So the {pet} is probably sick.', ['Sick pets should see a vet soon.'], 'So we should take the {pet} to the vet.'],
    [['The forecast shows heavy rain for {day}.', 'The field floods in heavy rain.'], 'So the field will likely be flooded on {day}.', ['A flooded field can\'t be used for games.'], 'So the {day} game should be moved.'],
    [['Every seat on the {day} bus is sold.', '{B} does not have a ticket yet.'], 'So {B} cannot ride the {day} bus.', ['The {day} bus is the only bus to {place} this week.'], 'So {B} will not get to {place} by bus this week.'],
    [['The recipe needs three eggs.', 'We have only one egg.'], 'So we cannot make the recipe as written.', ['The store is closed until morning.'], 'So we should choose a different dessert tonight.'],
    [['The {pet} chews anything left on the floor.', '{A}\'s new shoes are on the floor.'], 'So the {pet} may chew {A}\'s new shoes.', ['{A} wants to keep the shoes in good shape.'], 'So {A} should put the shoes away.'],
    [['The library closes at five on {day}s.', 'Today is {day}, and it is already four thirty.'], 'So the library will close in half an hour.', ['The walk to the library takes forty minutes.'], 'So we cannot get there before it closes today.']
  ];
  G('informal.subarguments', tidy(function (R, ctx) {
    var v = vars(R), it = R.pick(CH), f = function (x) { return fill(x, v); };
    var ps = it[0].map(f), sub = f(it[1]), ex = it[2].map(f), main = f(it[3]);
    var sents = ps.concat([sub]).concat(ex).concat([main]), roles = ps.map(function () { return 'p'; }).concat(['s']).concat(ex.map(function () { return 'p'; })).concat(['c']);
    var passage = q(sents.map(esc).join(' '));
    var shape = pickLevel(R, ctx, ['main'], ['main', 'sub'], ['label', 'sub']);
    var strip = function (x) { return x.replace(/^So /, '').replace(/^./, function (c) { return c.toUpperCase(); }); };
    if (shape === 'main' || shape === 'sub') {
      var wantMain = shape === 'main', right = wantMain ? main : sub;
      return { q: 'What is the <b>' + (wantMain ? 'main' : 'intermediate') + ' conclusion</b> of this chain of reasoning?' + passage, a: mcq(R, strip(right), [strip(wantMain ? sub : main), ps[0], ex[0]], 4),
        steps: ['The first premises support ' + lq(esc(strip(sub))) + '. That claim is an intermediate conclusion.', 'It then joins ' + lq(esc(ex[0])) + ' to support ' + lq(esc(strip(main))) + '.', 'Nothing is supported by ' + lq(esc(strip(main))) + ', so it is the main conclusion.'], hint: 'Both conclusions start with "So". The main one is the claim everything else finally supports.' };
    }
    var keys = ['p', 's', 'c'], labels = ['Premise', 'Intermediate conclusion', 'Main conclusion'];
    return { q: 'Label each sentence of this chain.' + passage, a: { t: 'multi', parts: sents.map(function (x, j) { return { label: (j + 1) + '. ' + esc(x), a: keepMc(labels.slice(), keys.indexOf(roles[j])) }; }) },
      steps: ['Sentences ' + ps.map(function (x, j) { return j + 1; }).join(' and ') + ' are premises for sentence ' + (ps.length + 1) + ', the intermediate conclusion.', 'Sentence ' + (ps.length + 2) + ' is another premise; with sentence ' + (ps.length + 1) + ' it supports the last sentence.', 'The last sentence is the main conclusion: everything leads to it.'], hint: 'A claim that is supported and then used as a reason is an intermediate conclusion.' };
  }));

  // ---- unstated premises
  var UP = [ // stated premise, conclusion, best missing premise, [restates conclusion, too strong, unrelated]
    ['{B} is a member of the {club}.', '{B} must pay dues.', 'Every member of the {club} must pay dues.', ['{B} must pay dues.', 'Everyone in the school must pay dues to every club.', '{B} likes the {club}.']],
    ['Whales feed their babies milk.', 'Whales are mammals.', 'Animals that feed their babies milk are mammals.', ['Whales are mammals.', 'Every animal in the sea is a mammal.', 'Whales live in the ocean.']],
    ['The {pet} is a mammal.', 'The {pet} is warm-blooded.', 'All mammals are warm-blooded.', ['The {pet} is warm-blooded.', 'All animals are warm-blooded.', 'The {pet} is friendly.']],
    ['The bridge is closed.', 'We will be late for the game.', 'The bridge is the only quick way to the game.', ['We will be late for the game.', 'We are always late to everything.', 'The bridge was built long ago.']],
    ['{A} got a perfect score on the {subject} test.', '{A} studied for the {subject} test.', 'Students who get perfect scores on this test have almost always studied for it.', ['{A} studied for the {subject} test.', 'Nobody could ever score well without studying for days.', '{A} likes {subject}.']],
    ['The milk smells sour.', 'We shouldn\'t drink the milk.', 'Sour-smelling milk is not safe to drink.', ['We shouldn\'t drink the milk.', 'We should never drink milk of any kind.', 'The milk is in the fridge.']],
    ['This shape is a square.', 'This shape has four equal sides.', 'Every square has four equal sides.', ['This shape has four equal sides.', 'Every shape has four equal sides.', 'This shape is blue.']]
  ];
  G('informal.unstated-premises', tidy(function (R, ctx) {
    var v = vars(R), it = R.pick(UP), f = function (x) { return fill(x, v); }, P = f(it[0]), C = f(it[1]), ok = f(it[2]), w = it[3].map(f);
    var k = ML.byLevel(ctx, 3, 4, 4), wrongs = ctx.level === 1 ? [w[0], w[2]] : w;
    return { q: 'This argument leaves a premise unstated. Which premise does it most reasonably need?' + q(esc(P) + ' So ' + esc(C.charAt(0).toLowerCase() + C.slice(1))), a: mcq(R, ok, wrongs, k),
      steps: ['The stated premise is ' + lq(esc(P)) + ', and the conclusion is ' + lq(esc(C)), 'We need a bridge from the premise to the conclusion: ' + lq(esc(ok)), 'Repeating the conclusion adds nothing, a much stronger claim is false or more than the speaker needs, and an unrelated fact does not connect them.'], hint: 'Find the premise that links what is said to what is concluded, and that the speaker would accept.' };
  }));


  // ================================================================ a small world for validity and truth
  // Each world has members and classes (plural nouns); a categorical statement's truth is computed from the members.
  var WORLDS = [
    { members: ['Rex', 'Tom', 'Moby', 'Echo', 'Rusty', 'Pip', 'Dot', 'Finn', 'Goldie', 'Sly', 'Liz'],
      sing: { dogs: 'dog', cats: 'cat', whales: 'whale', bats: 'bat', mammals: 'mammal', robins: 'robin', penguins: 'penguin', ducks: 'duck', birds: 'bird', sharks: 'shark', goldfish: 'goldfish', fish: 'fish', snakes: 'snake', lizards: 'lizard', reptiles: 'reptile', animals: 'animal', 'animals that can fly': 'animal that can fly', 'animals with feathers': 'animal with feathers' },
      cls: {
        dogs: ['Rex'], cats: ['Tom'], whales: ['Moby'], bats: ['Echo'], mammals: ['Rex', 'Tom', 'Moby', 'Echo'],
        robins: ['Rusty'], penguins: ['Pip'], ducks: ['Dot'], birds: ['Rusty', 'Pip', 'Dot'], sharks: ['Finn'], goldfish: ['Goldie'],
        fish: ['Finn', 'Goldie'], snakes: ['Sly'], lizards: ['Liz'], reptiles: ['Sly', 'Liz'],
        animals: ['Rex', 'Tom', 'Moby', 'Echo', 'Rusty', 'Pip', 'Dot', 'Finn', 'Goldie', 'Sly', 'Liz'],
        'animals that can fly': ['Echo', 'Rusty', 'Dot'], 'animals with feathers': ['Rusty', 'Pip', 'Dot']
      },
      who: { Rex: 'Rex the dog', Tom: 'Tom the cat', Moby: 'Moby the whale', Echo: 'Echo the bat', Rusty: 'Rusty the robin', Pip: 'Pip the penguin', Dot: 'Dot the duck', Finn: 'Finn the shark', Goldie: 'Goldie the goldfish', Sly: 'Sly the snake', Liz: 'Liz the lizard' } },
    { members: ['sq', 'rect', 'rh', 'trap', 'tri', 'circ'], sing: {}, who: {},
      cls: {
        squares: ['sq'], rectangles: ['sq', 'rect'], rhombuses: ['sq', 'rh'], 'four-sided shapes': ['sq', 'rect', 'rh', 'trap'],
        triangles: ['tri'], polygons: ['sq', 'rect', 'rh', 'trap', 'tri'], circles: ['circ'], shapes: ['sq', 'rect', 'rh', 'trap', 'tri', 'circ']
      } },
    (function () {
      var ms = [], c = { 'even numbers': [], 'odd numbers': [], 'multiples of 3': [], 'multiples of 4': [], 'multiples of 5': [], 'multiples of 6': [], 'multiples of 10': [], 'prime numbers': [], 'whole numbers': [] };
      for (var n = 1; n <= 60; n++) {
        ms.push(n); c['whole numbers'].push(n);
        c[n % 2 ? 'odd numbers' : 'even numbers'].push(n);
        [3, 4, 5, 6, 10].forEach(function (k) { if (n % k === 0) c['multiples of ' + k].push(n); });
        if (U.isPrime(n)) c['prime numbers'].push(n);
      }
      return { members: ms, cls: c, sing: {}, who: {} };
    })()
  ];
  function wHas(w, cl, x) { return w.cls[cl].indexOf(x) >= 0; }
  function truthOf(w, st) { // st: { f: 'A'|'E'|'I'|'O', s, p } or { f: 'is'|'isnot', x, p }
    if (st.f === 'is') return wHas(w, st.p, st.x);
    if (st.f === 'isnot') return !wHas(w, st.p, st.x);
    var S = w.cls[st.s], inP = function (x) { return wHas(w, st.p, x); };
    if (st.f === 'A') return S.every(inP);
    if (st.f === 'E') return !S.some(inP);
    if (st.f === 'I') return S.some(inP);
    return S.some(function (x) { return !inP(x); });
  }
  function lowerQ(s) { return /^(All|No|Some) /.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  var SPECIES = { Rex: 'dogs', Tom: 'cats', Moby: 'whales', Echo: 'bats', Rusty: 'robins', Pip: 'penguins', Dot: 'ducks', Finn: 'sharks', Goldie: 'goldfish', Sly: 'snakes', Liz: 'lizards' };
  function art(word) { return (/^[aeiou]/i.test(word) ? 'an ' : 'a ') + word; }
  function stText(w, st) {
    if (st.f === 'is' || st.f === 'isnot') return (w.who[st.x] || st.x) + ' is ' + (st.f === 'isnot' ? 'not ' : '') + art(w.sing[st.p] || st.p) + '.';
    return ({ A: 'All ', E: 'No ', I: 'Some ', O: 'Some ' })[st.f] + st.s + (st.f === 'O' ? ' are not ' : ' are ') + st.p + '.';
  }
  // Argument forms with letters A, B, C (A, B, C stand for classes; x for one thing).
  var FORMS = {
    barbara: { valid: true, pr: [['A', 'B', 'C'], ['A', 'A', 'B']], c: ['A', 'A', 'C'], name: 'All B are C. All A are B. So all A are C.' },
    celarent: { valid: true, pr: [['E', 'B', 'C'], ['A', 'A', 'B']], c: ['E', 'A', 'C'], name: 'No B are C. All A are B. So no A are C.' },
    darii: { valid: true, pr: [['A', 'B', 'C'], ['I', 'A', 'B']], c: ['I', 'A', 'C'], name: 'All B are C. Some A are B. So some A are C.' },
    ferio: { valid: true, pr: [['E', 'B', 'C'], ['I', 'A', 'B']], c: ['O', 'A', 'C'], name: 'No B are C. Some A are B. So some A are not C.' },
    single: { valid: true, sing: true, pr: [['A', 'B', 'C'], ['is', 'x', 'B']], c: ['is', 'x', 'C'], name: 'All B are C. x is a B. So x is a C.' },
    singmt: { valid: true, sing: true, pr: [['A', 'B', 'C'], ['isnot', 'x', 'C']], c: ['isnot', 'x', 'B'], name: 'All B are C. x is not a C. So x is not a B.' },
    undist: { valid: false, pr: [['A', 'C', 'B'], ['A', 'A', 'B']], c: ['A', 'A', 'C'], name: 'All C are B. All A are B. So all A are C.' },
    convert: { valid: false, pr: [['A', 'A', 'B']], c: ['A', 'B', 'A'], name: 'All A are B. So all B are A.' },
    somesome: { valid: false, pr: [['I', 'A', 'B'], ['I', 'B', 'C']], c: ['I', 'A', 'C'], name: 'Some A are B. Some B are C. So some A are C.' },
    illmaj: { valid: false, pr: [['A', 'B', 'C'], ['E', 'A', 'B']], c: ['E', 'A', 'C'], name: 'All B are C. No A are B. So no A are C.' },
    singac: { valid: false, sing: true, pr: [['A', 'B', 'C'], ['is', 'x', 'C']], c: ['is', 'x', 'B'], name: 'All B are C. x is a C. So x is a B.' },
    singda: { valid: false, sing: true, pr: [['A', 'B', 'C'], ['isnot', 'x', 'B']], c: ['isnot', 'x', 'C'], name: 'All B are C. x is not a B. So x is not a C.' }
  };
  var VALID_F = ['barbara', 'celarent', 'darii', 'ferio', 'single', 'singmt'], INVALID_F = ['undist', 'convert', 'somesome', 'illmaj', 'singac', 'singda'];
  function inst(w, form, sub) { // fill a form with classes: sub = { A, B, C, x }
    function one(t) { return t[0] === 'is' || t[0] === 'isnot' ? { f: t[0], x: sub.x, p: sub[t[2]] } : { f: t[0], s: sub[t[1]], p: sub[t[2]] }; }
    var pr = form.pr.map(one), c = one(form.c);
    return { w: w, pr: pr, c: c, valid: form.valid, form: form, prT: pr.map(function (s) { return truthOf(w, s); }), cT: truthOf(w, c),
      text: pr.map(function (s) { return stText(w, s); }), ctext: stText(w, c) };
  }
  // Find an instance of a form whose premises and conclusion have the wanted truth values (null = any). Tries random fills.
  function findInst(R, formKey, want, worldIx) {
    var form = FORMS[formKey];
    for (var t = 0; t < 400; t++) {
      var w = form.sing ? WORLDS[0] : WORLDS[worldIx === undefined ? R.int(0, WORLDS.length - 1) : worldIx];
      var names = Object.keys(w.cls), three = R.sample(names, 3), sub = { A: three[0], B: three[1], C: three[2] };
      if (form.sing) { sub.x = R.pick(w.members); if (!w.sing[sub.B] || !w.sing[sub.C] || [sub.A, sub.B, sub.C].indexOf(SPECIES[sub.x]) >= 0) continue; }
      var I = inst(w, form, sub);
      if (I.text.some(function (s, j) { return I.text.indexOf(s) !== j; })) continue;
      if (I.pr.concat([I.c]).some(function (st) { return (st.f === 'I' && truthOf(w, { f: 'A', s: st.s, p: st.p })) || (st.f === 'O' && truthOf(w, { f: 'E', s: st.s, p: st.p })); })) continue; // "some" only where it is some, not all
      if (want.allT !== undefined && I.prT.every(Boolean) !== want.allT) continue;
      if (want.cT !== undefined && I.cT !== want.cT) continue;
      if (want.someF && I.prT.every(Boolean)) continue;
      return I;
    }
    return null;
  }
  function argHtml(I) { return q(I.text.map(function (s, j) { return '<b>P' + (j + 1) + '.</b> ' + esc(s); }).join('<br>') + '<br><b>So:</b> ' + esc(I.ctext)); }
  function tf(b) { return b ? 'true' : 'false'; }
  function truthSteps(I) {
    return I.text.map(function (s, j) { return 'P' + (j + 1) + ' ' + lq(esc(s)) + ' is ' + tf(I.prT[j]) + '.'; }).concat(['The conclusion ' + lq(esc(I.ctext)) + ' is ' + tf(I.cT) + '.']);
  }
  function validStep(I) {
    return I.valid ? 'The form is valid: ' + i(I.form.name) + ' If the premises were true, the conclusion would have to be true.'
      : 'The form is invalid: ' + i(I.form.name) + ' The premises could be true while the conclusion is false.';
  }


  // ================================================================ Unit 2: Deductive and inductive reasoning
  var DI = [ // [passage, 'D' | 'I', why]
    ['Every square has four sides, and this tile is a square. So this tile has four sides.', 'D', 'It claims the conclusion must follow: if the premises are true, there is no way out.'],
    ['The last forty trains left on time, so tomorrow\'s train will probably leave on time too.', 'I', 'It claims only that the conclusion is probably true, based on past cases.'],
    ['Most cats dislike baths, so {A}\'s cat will likely fuss at bath time.', 'I', '"Most" and "likely" show it claims probability, not certainty.'],
    ['{A} is taller than {B}, and {B} is taller than {C}. So {A} must be taller than {C}.', 'D', 'It claims the conclusion is certain. It also goes from specific to specific, which shows the old general-to-specific rule fails.'],
    ['Each of the three books on this shelf is a mystery, and the shelf holds only those three books. So every book on the shelf is a mystery.', 'D', 'It goes from specific cases to a general claim, yet the conclusion must be true if the premises are. That makes it deductive.'],
    ['Every {fruit} we picked from this tree was sweet, so the next one will probably be sweet too.', 'I', 'It predicts from past cases and claims only probability.'],
    ['If the game is rained out, it moves to {day}. The game was rained out. So it moves to {day}.', 'D', 'The conclusion must follow from the two premises.'],
    ['Nine of the ten students we asked enjoy {game}, so most students at our school probably enjoy {game}.', 'I', 'It generalizes from a sample and claims only probability.'],
    ['The {pet} has gotten into the trash every time we left the lid off. We left the lid off today, so the trash is probably on the floor.', 'I', 'It relies on a pattern from the past, so the conclusion is likely, not certain.'],
    ['No reptiles have feathers. Snakes are reptiles. So snakes don\'t have feathers.', 'D', 'If both premises are true, the conclusion cannot be false.']
  ];
  G('informal.deductive-inductive', tidy(function (R, ctx) {
    var v = vars(R), shape = pickLevel(R, ctx, ['one'], ['one', 'which'], ['which', 'one']);
    if (shape === 'which') {
      var wantD = R.coin(), right = R.pick(DI.filter(function (x) { return (x[1] === 'D') === wantD; })), wr = R.sample(DI.filter(function (x) { return (x[1] === 'D') !== wantD; }), 2);
      return { q: 'Which argument is <b>' + (wantD ? 'deductive' : 'inductive') + '</b>?', a: mcq(R, esc(fill(right[0], v)), wr.map(function (x) { return esc(fill(x[0], v)); }), 3),
        steps: [lq(esc(fill(right[0], v))) + ': ' + fill(right[2], v), wantD ? 'The others claim only that their conclusions are probable.' : 'The others claim their conclusions must be true if the premises are.'], hint: 'Ask how strongly each argument claims its conclusion follows: must, or probably?' };
    }
    var it = R.pick(DI);
    return { q: 'Is this argument deductive or inductive?' + q(esc(fill(it[0], v))), a: keepMc(['Deductive', 'Inductive'], it[1] === 'D' ? 0 : 1),
      steps: ['Ask: does the argument claim that its conclusion <i>must</i> be true if the premises are, or only that it is <i>probably</i> true?', fill(it[2], v)], hint: 'Don\'t use "general to specific". Ask whether it claims certainty or probability.' };
  }));

  // ---- validity
  G('informal.validity', tidy(function (R, ctx) {
    var shape = pickLevel(R, ctx, ['judge'], ['judge', 'trap'], ['trap', 'judge', 'which']);
    if (shape === 'which') { // which of these is valid?
      var vk = R.pick(VALID_F), ik = R.sample(INVALID_F, 2), V = findInst(R, vk, { allT: false }), Is = ik.map(function (k) { return findInst(R, k, { allT: true, cT: true }); });
      if (V && Is[0] && Is[1]) {
        var line = function (I) { return esc(I.text.join(' ') + ' So ' + lowerQ(I.ctext)); };
        return { q: 'Which argument is <b>valid</b>?', a: mcq(R, line(V), Is.map(line), 3),
          steps: [lq(line(V)) + ' has a false premise, but its form is valid: ' + i(V.form.name), 'The other two have true premises and a true conclusion, yet their forms are invalid: the conclusion does not have to follow.', 'Validity is about the link between premises and conclusion, not about whether the statements are true.'], hint: 'Ignore whether the statements are true. Could the premises be true and the conclusion false?' };
      }
    }
    var valid = R.coin(), want = shape === 'trap' ? (valid ? { someF: true } : { allT: true, cT: true }) : {};
    var I = findInst(R, R.pick(valid ? VALID_F : INVALID_F), want) || findInst(R, valid ? 'barbara' : 'undist', {});
    return { q: 'Is this argument valid?' + argHtml(I), a: keepMc(['Valid', 'Invalid'], I.valid ? 0 : 1),
      steps: [validStep(I)].concat(shape === 'trap' ? truthSteps(I).concat([I.valid ? 'A false premise does not make an argument invalid.' : 'True premises and a true conclusion do not make an argument valid.']) : []),
      hint: 'Imagine the premises are true, even if they aren\'t. Would the conclusion have to be true?' };
  }));

  // ---- the counterexample method
  var CE_FORMS = ['undist', 'convert', 'somesome', 'illmaj', 'singac', 'singda'];
  var CE_SWAP = { undist: 'somesome', convert: 'undist', somesome: 'undist', illmaj: 'undist', singac: 'singda', singda: 'singac' }; // a different invalid form
  G('informal.counterexample-method', tidy(function (R, ctx) {
    var fk = R.pick(CE_FORMS), form = FORMS[fk];
    var good = findInst(R, fk, { allT: true, cT: false });
    var trueC = findInst(R, fk, { allT: true, cT: true });
    var falseP = findInst(R, fk, { someF: true, cT: false });
    var other = findInst(R, CE_SWAP[fk], { allT: true, cT: false });
    var line = function (I) { return esc(I.text.join(' ') + ' So ' + lowerQ(I.ctext)); };
    var wrongs = [], why = [];
    if (trueC) { wrongs.push(line(trueC)); why.push(lq(line(trueC)) + ' has the right form, but its conclusion is true, so it shows nothing.'); }
    if (falseP) { wrongs.push(line(falseP)); why.push(lq(line(falseP)) + ' has a false premise, so it is not a fair test.'); }
    if (other && ctx.level >= 2) { wrongs.push(line(other)); why.push(lq(line(other)) + ' has true premises and a false conclusion, but a different form: ' + i(other.form.name)); }
    var k = Math.min(1 + wrongs.length, ML.byLevel(ctx, 3, 4, 4));
    return { q: 'This form is invalid:' + q(esc(form.name)) + 'Which argument proves it, as a counterexample with the same form?', a: mcq(R, line(good), wrongs, k),
      steps: ['A counterexample needs three things: the same form, plainly true premises, and a plainly false conclusion.', lq(line(good)) + ': ' + good.text.map(function (s) { return lq(esc(s)); }).join(' and ') + ' are true, but ' + lq(esc(good.ctext)) + ' is false.'].concat(why),
      hint: 'Check the form first, then check that every premise is true and the conclusion is false.' };
  }));

  // ---- soundness
  var SOUND = ['Sound', 'Valid, but not sound: a premise is false', 'Not valid, so not sound'];
  G('informal.soundness', tidy(function (R, ctx) {
    var shape = pickLevel(R, ctx, ['judge'], ['judge'], ['judge', 'idea']);
    if (shape === 'idea') {
      var Qs = [
        ['An argument has a true conclusion. Must it be sound?', ['No', 'Yes'], 0, 'A true conclusion can come from an invalid argument or from false premises. Soundness needs validity and true premises.'],
        ['An argument is sound. Must its conclusion be true?', ['Yes', 'No'], 0, 'Sound means valid with all true premises, and a valid argument with true premises cannot have a false conclusion.'],
        ['An argument is valid. Must it be sound?', ['No', 'Yes'], 0, 'A valid argument can have a false premise; then it is valid but not sound.'],
        ['An argument has a false conclusion. Can it be sound?', ['No', 'Yes'], 0, 'A sound argument always has a true conclusion, so this one is not sound.'],
        ['An argument has all true premises but is invalid. Is it sound?', ['No', 'Yes'], 0, 'Sound requires validity as well as true premises.']
      ], it = R.pick(Qs);
      return { q: it[0], a: keepMc(it[1], it[2]), steps: ['Sound = valid + all premises true.', it[3]], hint: 'Sound means two things at once: valid, and every premise true.' };
    }
    var pickK = R.int(0, 2), I = null;
    if (pickK === 0) I = findInst(R, R.pick(VALID_F), { allT: true });
    else if (pickK === 1) I = findInst(R, R.pick(VALID_F), { someF: true });
    else I = findInst(R, R.pick(INVALID_F), ctx.level >= 2 ? { allT: true } : {});
    if (!I) I = findInst(R, 'barbara', { allT: true });
    var ans = I.valid ? (I.prT.every(Boolean) ? 0 : 1) : 2;
    return { q: 'Is this argument sound?' + argHtml(I), a: keepMc(SOUND.slice(), ans),
      steps: [validStep(I)].concat(I.valid ? truthSteps(I).slice(0, I.text.length) : []).concat([ans === 0 ? 'It is valid and every premise is true, so it is sound, and its conclusion must be true.' : ans === 1 ? 'It is valid, but a premise is false, so it is not sound.' : 'An invalid argument is never sound, whatever the truth of its premises.' + (I.cT ? ' Its conclusion happens to be true, but that does not make it sound.' : '')]),
      hint: 'First ask if it is valid. Only then check whether every premise is true.' };
  }));

  // ---- validity and truth together
  G('informal.validity-truth-combos', tidy(function (R, ctx) {
    var shape = pickLevel(R, ctx, ['combo', 'parts'], ['combo', 'parts'], ['parts', 'combo']);
    if (shape === 'combo') {
      var pT = R.coin(), cT = R.coin(), valid = R.coin();
      var desc = (pT ? 'all true premises' : 'at least one false premise') + ' and a ' + (cT ? 'true' : 'false') + ' conclusion';
      var possible = !(valid && pT && !cT);
      return { q: 'Can ' + (valid ? 'a <b>valid' : 'an <b>invalid') + '</b> argument have ' + desc + '?', a: keepMc(['Yes, that is possible', 'No, that is impossible'], possible ? 0 : 1),
        steps: ['The only thing validity rules out is all true premises with a false conclusion.', possible ? (valid ? 'This mix is not that one, so a valid argument can have it.' : 'An invalid argument can have any mix of true and false statements.') : 'This is exactly that mix, so no valid argument can have it.'],
        hint: 'A valid argument can\'t have true premises and a false conclusion. Every other mix is possible.' };
    }
    var target = R.pick([{ allT: true, cT: true }, { someF: true, cT: true }, { someF: true, cT: false }, { allT: true, cT: false }]);
    var I = findInst(R, R.pick(target.allT && !target.cT ? INVALID_F : (R.coin() ? VALID_F : INVALID_F)), target) || findInst(R, 'barbara', {});
    var yn = ['Yes', 'No'];
    return { q: 'Answer three questions about this argument.' + argHtml(I),
      a: { t: 'multi', parts: [{ label: 'Are all the premises true?', a: keepMc(yn.slice(), I.prT.every(Boolean) ? 0 : 1) }, { label: 'Is the conclusion true?', a: keepMc(yn.slice(), I.cT ? 0 : 1) }, { label: 'Is the argument valid?', a: keepMc(yn.slice(), I.valid ? 0 : 1) }] },
      steps: truthSteps(I).concat([validStep(I), I.valid ? 'Truth and validity are separate questions: a valid argument can have false parts.' : 'True parts do not make an argument valid.']),
      hint: 'Check each statement for truth first. Then, separately, ask whether the conclusion has to follow.' };
  }));

  // ---- inductive strength
  var IND = [ // base argument, [strengthening fact], [weakening fact], [irrelevant fact]
    ['Every time {A} has eaten at the {town} Diner, the food was good. So the food will probably be good tonight.', 'The diner has had the same cook for ten years.', 'The diner got a new cook last week.', 'The diner has blue booths.'],
    ['The last {n} buses on this route came within five minutes of the schedule. So the next bus will probably be on time.', 'The roads are clear and dry today.', 'A big snowstorm is covering the roads today.', 'The bus is painted green.'],
    ['{B} has won the school spelling bee three years in a row. So {B} will probably win again this year.', '{B} has been studying the word list every day.', 'This year\'s contest includes students from every school in {town}.', '{B}\'s favorite color is purple.'],
    ['Most of the {fruit} from this farm have been sweet. So the {fruit} in this box are probably sweet.', 'This box was picked at the same time as the sweet ones.', 'This box was picked two weeks early, before the fruit was ripe.', 'The farm\'s sign is hand-painted.'],
    ['The {pet} has come running every time we open the food can. So it will probably come running when we open one tonight.', 'The {pet} skipped breakfast today and seems hungry.', 'The {pet} is at the vet overnight.', 'We bought the can on {day}.'],
    ['Our team has beaten the {town} team in all {n} games this season. So we will probably beat them on {day}.', 'Our best players are all healthy.', 'Our three best players are out sick on {day}.', 'The game starts at four o\'clock.']
  ];
  var SW = [ // [argument, 'Strong' | 'Weak', why]
    ['The sun has risen every morning in recorded history, so it will probably rise tomorrow.', 'Strong', 'A huge, steady pattern makes the conclusion very likely.'],
    ['{A} flipped a coin twice and got heads both times, so the coin will probably always land heads.', 'Weak', 'Two flips are far too few to show a pattern.'],
    ['Ninety-eight of the hundred {fruit} trees in the orchard bloomed in April, so the tree by the gate probably bloomed in April too.', 'Strong', 'Almost every tree bloomed, and the tree by the gate is one of them.'],
    ['One student in the {club} likes {food}, so most students at school probably like {food}.', 'Weak', 'One student is far too small a sample, and only from one club.'],
    ['It has snowed in {town} every January for fifty years, so it will probably snow there next January.', 'Strong', 'A long, steady record supports the prediction.'],
    ['{B}\'s neighbor saw a fox once, so foxes probably live in every backyard in {town}.', 'Weak', 'One sighting cannot support a claim about every backyard.']
  ];
  G('informal.inductive-strength', tidy(function (R, ctx) {
    var v = vars(R), shape = pickLevel(R, ctx, ['sw'], ['fact', 'sw'], ['fact', 'cogent']);
    if (shape === 'sw') {
      var it = R.pick(SW);
      return { q: 'Is this inductive argument strong or weak?' + q(esc(fill(it[0], v))), a: keepMc(['Strong', 'Weak'], it[1] === 'Strong' ? 0 : 1),
        steps: ['Ask: if the premises were true, would the conclusion be likely?', fill(it[2], v), 'So it is ' + it[1].toLowerCase() + '.'], hint: 'How much evidence is there, and does it fit the conclusion?' };
    }
    if (shape === 'cogent') {
      var sw = R.pick(SW.filter(function (x) { return x[1] === 'Strong'; }));
      var Qs = [['Its premises are true. Is it cogent?', 0, 'Cogent = strong + true premises. Both hold here.'], ['Suppose one premise turned out to be false. Would it still be cogent?', 1, 'A cogent argument needs true premises as well as strength.'], ['Is it valid?', 1, 'Inductive arguments are called strong or weak, not valid. Even a strong one claims only that its conclusion is probable.']];
      var qq = R.pick(Qs);
      return { q: 'This argument is strong.' + q(esc(fill(sw[0], v))) + qq[0], a: keepMc(['Yes', 'No'], qq[1]), steps: [qq[2]], hint: 'Strong is about the link. Cogent adds true premises. Valid is a word for deduction.' };
    }
    var b = R.pick(IND), kinds = ['Strengthens it', 'Weakens it', 'Makes no difference'], k = R.int(0, 2), fact = fill(b[1 + k], v);
    return { q: 'Here is an inductive argument.' + q(esc(fill(b[0], v))) + 'How does this new fact affect it? ' + i(esc(fact)), a: keepMc(kinds, k),
      steps: ['An inductive argument can always gain or lose strength when we learn more.', k === 0 ? 'The new fact makes the pattern more likely to continue, so it strengthens the argument.' : k === 1 ? 'The new fact gives a reason the pattern may break this time, so it weakens the argument.' : 'The new fact has nothing to do with whether the pattern continues, so it makes no difference.'],
      hint: 'Does the new fact make the conclusion more likely, less likely, or neither?' };
  }));

  // ---- generalizing from a sample
  var SAMPLE_Q = [ // the question, [biased places]
    ['what the favorite sport of students at {town} Middle School is', ['at a basketball game', 'at soccer practice']],
    ['how many students at {town} Middle School like to read', ['at the library after school', 'at the book fair']],
    ['what the favorite game of students at our school is', ['at a {club} meeting', 'at the chess tournament']],
    ['whether students at our school want a longer lunch period', ['in the lunch line', 'among the students who stay for second lunch']],
    ['how many people in {town} own a dog', ['at the dog park', 'outside the pet store']]
  ];
  G('informal.generalizations', tidy(function (R, ctx) {
    var v = vars(R), qd = R.pick(SAMPLE_Q), topic = fill(qd[0], v);
    function sample(kind) {
      if (kind === 'good') return 'surveyed ' + R.pick([120, 150, 200, 250]) + ' people chosen at random from the whole group';
      if (kind === 'small') return 'asked ' + R.int(2, 5) + ' friends';
      return 'surveyed ' + R.pick([150, 200, 300, 400]) + ' people ' + fill(R.pick(qd[1]), v);
    }
    var labels = ['A fair sample', 'Too small', 'Biased: not typical of the group'], whys = ['It is large enough and chosen at random, so it is likely to be typical.', 'A handful of people is far too few to speak for a whole group.', 'The people were chosen in a place that makes certain answers more likely, so the sample is not typical, however large it is.'];
    var shape = pickLevel(R, ctx, ['judge'], ['judge'], ['best', 'judge']);
    if (shape === 'best') {
      var s0 = sample('good'), s1 = sample('small'), s2 = sample('biased');
      return { q: 'A student wants to find out ' + topic + '. Which plan gives the best sample?', a: mcq(R, cap(s0) + '.', [cap(s1) + '.', cap(s2) + '.'], 3),
        steps: ['Random choice from the whole group: ' + whys[0], 'Asking a few friends: ' + whys[1], 'Asking people ' + s2.replace(/^surveyed \d+ people /, '') + ': ' + whys[2]], hint: 'A good sample is big enough and chosen so everyone has a fair chance to be picked.' };
    }
    var kind = R.pick(['good', 'small', 'biased', 'biased']), ix = ['good', 'small', 'biased'].indexOf(kind), name = v.A;
    return { q: name + ' wanted to find out ' + topic + ', so ' + name + ' ' + sample(kind) + '. How good is this sample?', a: keepMc(labels.slice(), ix),
      steps: [whys[ix]].concat(kind === 'biased' ? ['A big sample does not fix a biased one: it only repeats the bias many times.'] : []), hint: 'Ask two questions: is it big enough, and is it like the whole group?' };
  }));

  // ---- arguments from analogy
  var AN = [ // two things, conclusion, relevant likeness, irrelevant likeness, relevant difference, irrelevant difference
    { a: 'The new bridge uses the same design and steel as the old bridge, which has held heavy trucks for forty years. So the new bridge will hold heavy trucks too.',
      rel: 'Both bridges were built by the same skilled crew.', irr: 'Both bridges are painted gray.', dif: 'The new bridge is twice as long, with no extra supports.', idif: 'The new bridge has a different name.' },
    { a: '{A}\'s tomato plants and {B}\'s grow in the same kind of soil and get the same sun. {A}\'s plants did well with weekly watering. So {B}\'s will do well with weekly watering.',
      rel: 'Both are the same kind of tomato.', irr: 'Both gardens have a bench nearby.', dif: '{B}\'s plants are in small pots that dry out fast.', idif: '{B}\'s garden has a red gate.' },
    { a: 'This {game} club runs just like the one at {town} school: same coach, same practice schedule, same size. That club won the league. So this club will do well too.',
      rel: 'Both clubs have players of about the same skill.', irr: 'Both clubs meet in rooms with big windows.', dif: 'This club\'s players have never played before.', idif: 'This club wears blue shirts instead of green.' },
    { a: 'The last puzzle box from this maker had the same lock and the same pattern on the lid, and it opened by sliding the lid left. So this one will open the same way.',
      rel: 'Both boxes came out the same year.', irr: 'Both boxes came wrapped in brown paper.', dif: 'This box\'s instructions say the lock design was changed.', idif: 'This box is a different color.' },
    { a: '{C}\'s new {pet} is the same kind and age as the {pet} next door, which loves walks in the park. So {C}\'s {pet} will love walks in the park.',
      rel: 'Both animals are healthy and full of energy.', irr: 'Both animals have names that start with B.', dif: '{C}\'s {pet} is very afraid of loud noises, and the park is noisy.', idif: '{C}\'s {pet} has a different collar.' }
  ];
  G('informal.analogies', tidy(function (R, ctx) {
    var v = vars(R), it = R.pick(AN), f = function (x) { return fill(x, v); };
    var shape = pickLevel(R, ctx, ['weaken'], ['weaken', 'strengthen'], ['weaken', 'strengthen', 'irrelevant']);
    if (shape === 'weaken') return { q: 'Which fact would most <b>weaken</b> this argument from analogy?' + q(esc(f(it.a))), a: mcq(R, f(it.dif), [f(it.idif), f(it.rel), f(it.irr)], ML.byLevel(ctx, 3, 4, 4)),
      steps: ['An analogy is weakened by a difference that matters for the conclusion.', lq(esc(f(it.dif))) + ' is such a difference.', lq(esc(f(it.idif))) + ' is a difference too, but it has nothing to do with the conclusion.'], hint: 'Find the difference that matters for the conclusion, not just any difference.' };
    if (shape === 'strengthen') return { q: 'Which added likeness would most <b>strengthen</b> this argument from analogy?' + q(esc(f(it.a))), a: mcq(R, f(it.rel), [f(it.irr), f(it.idif)], 3),
      steps: ['An analogy is strengthened by more likenesses that are relevant to the conclusion.', lq(esc(f(it.rel))) + ' is relevant.', lq(esc(f(it.irr))) + ' is a likeness, but it has no bearing on the conclusion.'], hint: 'Count only likenesses that bear on the conclusion.' };
    return { q: 'Does this fact make the analogy stronger, weaker, or neither?' + q(esc(f(it.a))) + i(esc(f(it.irr))), a: keepMc(['Stronger', 'Weaker', 'Neither: it is not relevant'], 2),
      steps: ['It is a likeness, but it has nothing to do with the conclusion.', 'Adding irrelevant likenesses does not make an analogy stronger.'], hint: 'Is this likeness relevant to the conclusion?' };
  }));

  // ---- reasoning about causes
  var CA = [ // [observation, claimed cause, label 0 common / 1 reverse / 2 coincidence, explanation]
    ['Ice cream sales and sunburns both rise in the same months.', 'eating ice cream causes sunburn', 0, 'Hot, sunny weather causes both.'],
    ['Students who carry umbrellas are more often late to school.', 'umbrellas make students late', 0, 'Rainy days cause both umbrellas and slow traffic.'],
    ['Towns with more firefighters have more fires.', 'firefighters cause fires', 1, 'Places with more fires hire more firefighters.'],
    ['People who use reading glasses read more books.', 'glasses make people read more', 1, 'People who read a lot are more likely to get reading glasses.'],
    ['{A} wore green socks on the day of the {game} match, and the team won.', 'the green socks caused the win', 2, 'Socks cannot affect a game; the timing is a coincidence.'],
    ['In the summer, more people go swimming and more people buy fans.', 'swimming makes people buy fans', 0, 'Hot weather causes both.'],
    ['Kids who sleep with the light on are more often scared of the dark.', 'night lights cause fear of the dark', 1, 'Kids who are already scared of the dark are the ones who ask for a light.'],
    ['The year {B}\'s town got a new mayor, a big storm hit.', 'the new mayor brought the storm', 2, 'A mayor cannot cause the weather; the two just happened in the same year.'],
    ['Students with bigger shoe sizes do better on reading tests.', 'big feet make better readers', 0, 'Older students have bigger feet and also read better: age causes both.']
  ];
  CA.push(
    ['On days when the {town} pool is crowded, the snack bar sells more lemonade.', 'crowds at the pool make people thirsty for lemonade', 0, 'Hot days bring both the crowds and the thirst.'],
    ['Schools in {town} with bigger libraries also have bigger gyms.', 'big libraries lead to big gyms', 0, 'Bigger schools, with more students and more money, tend to have both.'],
    ['Players who spend more time on the bench lose more games.', 'sitting on the bench makes players lose', 1, 'Coaches bench players who are struggling, so losing leads to bench time, not the other way around.'],
    ['People who visit the doctor more often are sick more often.', 'visiting the doctor makes people sick', 1, 'Being sick is what sends people to the doctor.'],
    ['{C} sneezed just as the lights went out at {place}.', 'the sneeze knocked out the lights', 2, 'A sneeze cannot cut the power; the two just happened at the same moment.'],
    ['The {town} team lost every game that {D} watched from the stands this year.', '{D} watching makes the team lose', 2, 'A fan in the stands cannot change the score; with only a few games, such a streak can happen by chance.']
  );
  var CLAB = ['A third thing causes both', 'The cause runs the other way', 'It is probably a coincidence'];
  G('informal.causal-reasoning', tidy(function (R, ctx) {
    var v = vars(R), it = R.pick(CA), obs = fill(it[0], v), claim = fill(it[1], v);
    var shape = pickLevel(R, ctx, ['label'], ['label'], ['label', 'proves']);
    if (shape === 'proves') return { q: obs + ' Does that show that ' + claim + '?', a: keepMc(['No: things that happen together need not be cause and effect', 'Yes: they happen together, so one causes the other'], 0),
      steps: ['A correlation (two things happening together) is a clue, not proof of a cause.', fill(it[3], v)], hint: 'Could a third thing, reverse direction, or chance explain it?' };
    return { q: obs + ' Someone concludes that ' + claim + '. What is the best other explanation?', a: keepMc(CLAB.slice(), it[2]),
      steps: ['Before deciding that one thing causes another, check for a common cause, a reversed direction, and coincidence.', fill(it[3], v), 'So: ' + CLAB[it[2]].toLowerCase() + '.'], hint: 'Is there something that could cause both? Could the arrow point the other way?' };
  }));


  // ================================================================ Unit 3: Language and definitions
  var AV = [ // [sentence, the word, 'amb' | 'vague' | 'clear', why]
    ['{A} found a bat under the porch.', 'bat', 'amb', '"Bat" could mean an animal or a baseball bat. Two separate meanings fit.'],
    ['The coach said the team needs a tall player.', 'tall', 'vague', 'No exact height separates tall from not tall. The edge is fuzzy.'],
    ['Meet me at the bank at noon.', 'bank', 'amb', '"Bank" could be a place for money or the side of a river.'],
    ['Bring a few snacks to the party.', 'few', 'vague', 'How many is "a few"? Three? Six? The boundary is fuzzy.'],
    ['{B} said the soup was too hot.', 'hot', 'amb', '"Hot" could mean high in temperature or spicy. Two distinct meanings fit.'],
    ['The museum is close to the school.', 'close', 'vague', 'How near counts as close? There is no sharp line.'],
    ['{C} saw a crane by the lake.', 'crane', 'amb', 'A crane could be a bird or a machine for lifting.'],
    ['Wear something warm to {place} tomorrow.', 'warm', 'vague', 'How warm is warm enough? The edge is fuzzy, but there is only one meaning.'],
    ['The pitcher is on the table.', 'pitcher', 'amb', 'A pitcher could be a jug or a baseball player.'],
    ['The {pet} is old.', 'old', 'vague', 'At what age does a pet become old? No exact point.'],
    ['{A} has 12 marbles in a jar.', '12', 'clear', '"12" has one meaning and a sharp boundary: it is neither ambiguous nor vague.'],
    ['The library is on Elm Street.', 'Elm Street', 'clear', 'A street name picks out one place exactly.'],
    ['{B} said the class trip was a riot.', 'riot', 'amb', '"Riot" could mean great fun or a wild, out-of-control crowd. Two distinct meanings fit.'],
    ['The movie was long.', 'long', 'vague', 'There is no exact running time where a movie becomes long.']
  ];
  var AVL = ['Ambiguous: it has two distinct meanings here', 'Vague: its boundary is fuzzy', 'Neither: it is clear here'];
  G('informal.ambiguity-vagueness', tidy(function (R, ctx) {
    var v = vars(R), pool = ctx.level === 1 ? AV.filter(function (x) { return x[2] !== 'clear'; }) : AV, it = R.pick(pool);
    var shape = pickLevel(R, ctx, ['label'], ['label'], ['label', 'which']);
    if (shape === 'which') {
      var wantA = R.coin(), right = R.pick(AV.filter(function (x) { return x[2] === (wantA ? 'amb' : 'vague'); })), wr = R.sample(AV.filter(function (x) { return x[2] === (wantA ? 'vague' : 'amb'); }), 2);
      var show = function (x) { return esc(fill(x[0], v)).replace(x[1], '<b>' + x[1] + '</b>'); };
      return { q: 'In which sentence is the bold word <b>' + (wantA ? 'ambiguous' : 'vague') + '</b>?', a: mcq(R, show(right), wr.map(show), 3),
        steps: [lq(show(right)) + ': ' + right[3], wantA ? 'In the others the word has one meaning, with a fuzzy edge: that is vagueness.' : 'In the others the word has two distinct meanings: that is ambiguity.'], hint: 'Ambiguous: two separate meanings. Vague: one meaning with a blurry edge.' };
    }
    var s = esc(fill(it[0], v)).replace(it[1], '<b>' + it[1] + '</b>');
    return { q: 'Is the bold word ambiguous, vague, or neither?' + q(s), a: keepMc(AVL.slice(0, ctx.level === 1 ? 2 : 3), ['amb', 'vague', 'clear'].indexOf(it[2])),
      steps: [it[3], 'So it is ' + (it[2] === 'amb' ? 'ambiguous' : it[2] === 'vague' ? 'vague' : 'neither') + '.'], hint: 'Ask: are there two different meanings, or one meaning with no sharp edge?' };
  }));

  var KD = [ // [definition, kind, why]
    ['"Bird" means a warm-blooded animal with feathers that lays eggs.', 'Lexical', 'It reports how the word is already used.'],
    ['"Library" means a place where books and other materials are kept for people to read or borrow.', 'Lexical', 'It reports the word\'s ordinary meaning.'],
    ['In our club, a "zoomer" will mean any member who finishes a puzzle in under a minute.', 'Stipulative', 'It gives a new word (or an old word) a new meaning for a purpose.'],
    ['Let\'s call the new {fruit}-and-yogurt snack a "frogurt bar."', 'Stipulative', 'It names something new; it cannot be true or false.'],
    ['For this contest, "tall" means 150 centimeters or more.', 'Precising', 'It takes a vague word and draws a sharp line for one purpose.'],
    ['For the race rules, "late" means arriving more than five minutes after the start.', 'Precising', 'It sharpens a vague word so the rule can be applied.'],
    ['"Homework" means a cruel waste of time that teachers use to ruin evenings.', 'Persuasive', 'It slants the meaning to push an attitude.'],
    ['A "true fan" is someone who never misses a single game, whatever the weather.', 'Persuasive', 'It shapes the word to win an argument about who counts as a fan.'],
    ['"Triangle" means a closed shape with three straight sides.', 'Lexical', 'It reports the standard meaning.'],
    ['For the reading challenge, a "book" means anything at least 50 pages long.', 'Precising', 'It sharpens "book" for the contest so everyone knows what counts.']
  ];
  var KINDS = ['Lexical', 'Stipulative', 'Precising', 'Persuasive'];
  G('informal.kinds-of-definitions', tidy(function (R, ctx) {
    var v = vars(R), shape = pickLevel(R, ctx, ['kind'], ['kind', 'truth'], ['kind', 'truth']);
    if (shape === 'truth') {
      var it2 = R.pick(KD.filter(function (x) { return x[1] === 'Stipulative' || x[1] === 'Lexical'; })), isS = it2[1] === 'Stipulative';
      return { q: 'Can this definition be true or false?' + q(esc(fill(it2[0], v))), a: keepMc(['Yes: it reports how a word is used, which can be right or wrong', 'No: it assigns a new meaning, which can be clear or unclear but not false'], isS ? 1 : 0),
        steps: ['This is a ' + it2[1].toLowerCase() + ' definition. ' + it2[2], isS ? 'A stipulative definition is a choice, not a report, so it cannot be false.' : 'A lexical definition reports real usage, so it can be accurate or mistaken.'], hint: 'Is it reporting how people already use a word, or choosing a new meaning?' };
    }
    var it = R.pick(KD);
    return { q: 'What kind of definition is this?' + q(esc(fill(it[0], v))), a: mcq(R, it[1], KINDS, ML.byLevel(ctx, 3, 4, 4)),
      steps: [it[2], 'So it is a ' + it[1].toLowerCase() + ' definition.'], hint: 'Does it report usage, name something new, sharpen a vague word, or slant a word?' };
  }));

  var GD = [ // [term, genus, difference, a definition by example, a synonym]
    ['triangle', 'polygon', 'that has three sides', 'something like a yield sign or a slice of pizza', 'a three-sider'],
    ['puppy', 'dog', 'that is young', 'something like the little dog {A} got last week', 'a doggie'],
    ['island', 'piece of land', 'that is surrounded by water', 'a place like Hawaii or Iceland', 'an isle'],
    ['kitten', 'cat', 'that is young', 'something like the tiny cats at the shelter', 'a kitty'],
    ['square', 'rectangle', 'whose four sides are equal', 'something like a checkerboard square', 'a box shape'],
    ['calf', 'cow', 'that is young', 'something like the little ones on the farm in spring', 'a baby cow'],
    ['peninsula', 'piece of land', 'that is almost surrounded by water but joined to the mainland', 'a place like Florida or Italy', 'a near-island'],
    ['pond', 'body of water', 'that is still and small enough to walk around', 'something like the water in {town} Park', 'a small lake'],
    ['bicycle', 'vehicle', 'that has two wheels and is moved by pedals', 'something like {A}\'s red bike', 'a bike'],
    ['carnivore', 'animal', 'that eats mainly meat', 'something like a lion or a wolf', 'a meat-eater']
  ];
  G('informal.genus-difference', tidy(function (R, ctx) {
    var v = vars(R), it = R.pick(GD), def = cap(art(it[0])) + ' is ' + art(it[1]) + ' ' + it[2] + '.';
    var shape = pickLevel(R, ctx, ['genus'], ['genus', 'diff', 'which'], ['which', 'diff']);
    var others = R.sample(GD.filter(function (x) { return x !== it; }), 3);
    if (shape === 'genus') return { q: 'In this definition, what is the <b>genus</b>?' + q(esc(def)), a: mcq(R, it[1], [it[2].replace(/^(that|whose) /, ''), it[0], others[0][1]], 3),
      steps: ['The genus is the larger kind the thing belongs to: <b>' + it[1] + '</b>.', 'The difference is what sets ' + art(it[0]) + ' apart from other ' + it[1].replace(/^piece of land$/, 'pieces of land').replace(/^body of water$/, 'bodies of water').replace(/^([a-z]+)$/, '$1s') + ': ' + i(it[2]) + '.'], hint: 'The genus is the bigger group named right after "is a".' };
    if (shape === 'diff') return { q: 'In this definition, what is the <b>difference</b>?' + q(esc(def)), a: mcq(R, it[2], [it[1], others[0][2], others[1][2]], 4),
      steps: ['The genus is ' + it[1] + '.', 'The difference is the feature that sets ' + art(it[0]) + ' apart within that genus: ' + i(it[2]) + '.'], hint: 'The difference is the part after the genus that tells this kind apart from the rest.' };
    var ex = cap(art(it[0])) + ' is ' + fill(it[3], v) + '.', syn = cap(art(it[0])) + ' is ' + it[4] + '.';
    return { q: 'Which is a definition of <b>' + it[0] + '</b> by genus and difference?', a: mcq(R, def, [ex, syn], 3),
      steps: [lq(esc(def)) + ' names the genus (' + it[1] + ') and the difference (' + it[2] + ').', lq(esc(ex)) + ' only gives examples.', lq(esc(syn)) + ' only gives another word for it.'], hint: 'Look for a larger kind plus the feature that sets this thing apart.' };
  }));

  var DR = [ // [definition, fault, why]
    ['A dog is an animal with four legs.', 'Too broad', 'Cats, horses and lizards have four legs too, so it lets in things that are not dogs.'],
    ['A shoe is a thing you wear.', 'Too broad', 'Hats and shirts are things you wear, but they are not shoes.'],
    ['A bird is an animal with feathers that can fly.', 'Too narrow', 'Penguins and ostriches are birds that cannot fly, so it shuts out real birds.'],
    ['A chair is a wooden seat with four legs.', 'Too narrow', 'Metal chairs and three-legged chairs are chairs too.'],
    ['A teacher is a person who teaches.', 'Circular', 'It uses the word being defined, so it tells you nothing new.'],
    ['A friend is someone who is friendly with you.', 'Circular', '"Friendly" just repeats "friend", so the definition goes in a circle.'],
    ['A circle is a shape that is not a square.', 'Negative', 'It says what a circle is not, which leaves out almost everything that it is.'],
    ['Summer is the season that is not winter.', 'Negative', 'Spring and fall are not winter either; a negative definition does not say what the thing is.'],
    ['A library is a treasure chest of the mind.', 'Figurative', 'It is a nice picture, but it does not say what a library is.'],
    ['Music is the language of the heart.', 'Figurative', 'A metaphor can be lovely, but it is not a clear definition.'],
    ['A square is a rectangle with four equal sides.', 'Good definition', 'It names the genus (rectangle) and a difference that fits all and only squares.']
  ];
  var DRL = ['Too broad', 'Too narrow', 'Circular', 'Negative', 'Figurative', 'Good definition'];
  G('informal.definition-rules', tidy(function (R, ctx) {
    var pool = ctx.level === 1 ? DR.filter(function (x) { return /Too/.test(x[1]); }) : DR, it = R.pick(pool);
    var choices = ctx.level === 1 ? ['Too broad', 'Too narrow'] : DRL.slice();
    var k = ctx.level === 1 ? 2 : 4;
    var a = ctx.level === 1 ? keepMc(choices, choices.indexOf(it[1])) : mcq(R, it[1], (it[1] === 'Too broad' ? ['Too narrow'] : it[1] === 'Too narrow' ? ['Too broad'] : []).concat(R.shuffle(DRL)), k);
    return { q: 'What is wrong with this definition, if anything?' + q(esc(it[0])), a: a,
      steps: [it[2], it[1] === 'Good definition' ? 'So it is a good definition.' : 'So it is ' + it[1].toLowerCase() + '.'], hint: 'Too broad lets in things that don\'t belong; too narrow shuts out things that do.' };
  }));

  var LL = [ // [loaded version, neutral version, loaded words]
    ['The greedy shop owners jacked up the price of {food}.', 'The shop owners raised the price of {food}.', 'greedy, jacked up'],
    ['{A}\'s ridiculous plan to paint the fence purple is a disaster waiting to happen.', '{A}\'s plan is to paint the fence purple.', 'ridiculous, disaster'],
    ['The lazy referee blew another call.', 'The referee made a call that many fans disagreed with.', 'lazy, blew'],
    ['Our heroic volunteers gave up their whole Saturday for the park.', 'Our volunteers spent Saturday working in the park.', 'heroic, gave up'],
    ['The so-called experts at the museum want to waste money on a new wing.', 'The museum staff want to spend money on a new wing.', 'so-called, waste'],
    ['That cheap, flimsy bike will fall apart in a week.', 'That bike costs less and has a lighter frame.', 'cheap, flimsy'],
    ['The brave students stood up to the unfair homework policy.', 'The students asked the school to change the homework policy.', 'brave, stood up to, unfair'],
    ['The {town} council finally caved and approved the playground.', 'The {town} council approved the playground.', 'finally caved']
  ];
  G('informal.loaded-language', tidy(function (R, ctx) {
    var v = vars(R), it = R.pick(LL), L = fill(it[0], v), N = fill(it[1], v);
    var shape = pickLevel(R, ctx, ['neutral'], ['neutral', 'which'], ['which', 'reason']);
    if (shape === 'neutral') {
      var other = fill(R.pick(LL.filter(function (x) { return x !== it; }))[0], v);
      return { q: 'Which sentence reports the same facts in neutral words?' + q(esc(L)), a: mcq(R, N, [L.replace(/\.$/, '!'), other], 3),
        steps: ['The loaded words are: ' + i(it[2]) + '. They push a feeling about the facts.', 'The neutral version keeps the facts and drops the slant: ' + lq(esc(N))], hint: 'Keep the facts; drop the words that only add praise or blame.' };
    }
    if (shape === 'which') {
      return { q: 'Which sentence uses <b>loaded</b> language?', a: mcq(R, L, [N, fill(R.pick(LL.filter(function (x) { return x !== it; }))[1], v)], 3),
        steps: [lq(esc(L)) + ' uses ' + i(it[2]) + ' to make you feel a certain way.', 'The others state facts without praise or blame.'], hint: 'Look for words that add praise or blame without adding facts.' };
    }
    return { q: 'A speaker says:' + q(esc(L)) + 'What has the speaker shown about the facts by choosing these words?', a: keepMc(['Nothing more than the neutral version shows; the words add feeling, not evidence', 'That the facts are worse (or better) than a neutral report would say'], 0),
      steps: ['A neutral report of the same facts: ' + lq(esc(N)), 'The extra words (' + i(it[2]) + ') express an attitude. They give no new reason to accept it.'], hint: 'Do the loaded words add facts, or only feelings?' };
  }));

  var VD = [ // [dialogue, 'Verbal' | 'Factual', why]
    ['{A}: A hot dog is a sandwich: it is meat in bread.|{B}: No way. A sandwich needs two separate slices of bread.', 'Verbal', 'They agree on what a hot dog is. They disagree about what "sandwich" means.'],
    ['{A}: The {town} pool opens at nine.|{B}: No, it opens at ten.', 'Factual', 'They disagree about a fact that a schedule could settle.'],
    ['{A}: Pluto is a planet. It goes around the sun.|{B}: Pluto isn\'t a planet. It hasn\'t cleared its path of other objects.', 'Verbal', 'They agree on Pluto\'s facts; they disagree about which definition of "planet" to use.'],
    ['{A}: Our team won more games than yours this year.|{B}: No, we won more.', 'Factual', 'A look at the season\'s records would settle it.'],
    ['{A}: {C} is rich: {C} has a bike, a phone and a tablet.|{B}: {C} isn\'t rich. Rich means owning a big house and a fancy car.', 'Verbal', 'They agree on what {C} owns. They mean different things by "rich".'],
    ['{A}: A tomato is a fruit, because it grows from a flower and holds seeds.|{B}: A tomato is a vegetable, because we cook it in salads and soups.', 'Verbal', 'They agree on the facts about tomatoes; one uses the scientist\'s sense of "fruit", the other the cook\'s.'],
    ['{A}: The library has more than a thousand books.|{B}: It has fewer than that.', 'Factual', 'Counting the books would settle it.'],
    ['{A}: The {pet} ran away on {day}.|{B}: No, it ran away the day before.', 'Factual', 'They disagree about when something happened, which records or witnesses could settle.']
  ];
  G('informal.verbal-disputes', tidy(function (R, ctx) {
    var v = vars(R), it = R.pick(VD), sents = parsePassage(it[0], v);
    var shape = pickLevel(R, ctx, ['kind'], ['kind'], ['kind', 'settle']);
    if (shape === 'settle' && it[1] === 'Verbal') return { q: passageHtml(sents) + 'What would best settle this disagreement?', a: mcq(R, 'Agreeing on what the key word means', ['Finding more facts about the thing itself', 'Asking more people to vote', 'Saying it louder'], 4),
      steps: [fill(it[2], v), 'Since the facts are agreed, more facts won\'t help. Agreeing on the meaning of the word ends the dispute.'], hint: 'Do they disagree about the facts, or about a word?' };
    return { q: passageHtml(sents) + 'Is this disagreement verbal or factual?', a: keepMc(['Verbal: they use a word in different senses', 'Factual: they disagree about the facts'], it[1] === 'Verbal' ? 0 : 1),
      steps: [fill(it[2], v), 'So the disagreement is ' + it[1].toLowerCase() + '.'], hint: 'Would more facts settle it, or would agreeing on a meaning?' };
  }));


  // ---------------------------------------------------------------- the fallacy passage bank
  // Each item: [passage, index of the sentence that makes the faulty move, why it fails]. Fair cousins: [passage, why fair].
  // Passages use {A} {B} {C} for names and {food} {game} {pet} {subject} {club} {place} {day} {fruit} {town} {n} {big}.
  var FB = {};
  FB.adhom = {
    items: [
      ['{A}: Our class should recycle the paper we throw away. Most of it is clean and could be used again.|{B}: You just want to look good for the teacher, so forget about recycling.', 1, '{B} never answers {A}\'s reason (the paper could be used again); {B} only guesses at {A}\'s motives.'],
      ['{A} argued that the town pool should open an hour earlier, since many families swim before work.|But {A} failed swimming lessons twice as a kid, so the pool hours should stay the same.', 1, 'How well {A} swam as a child has nothing to do with whether families want earlier hours.'],
      ['{A}: The bus should add a stop near {place}. Lots of students walk there after school.|{B}: You\'re the messiest person on the team, so why would anyone listen to you about bus stops?', 1, 'Being messy has nothing to do with where students walk after school. {B} attacks {A} and skips the reason.'],
      ['Dr. {B} has shown that the new bridge design can hold twice the weight it needs to.|But Dr. {B} is grumpy and never waves to the neighbors.|So the bridge design is probably unsafe.', 1, 'Whether Dr. {B} is friendly has no bearing on the tests of the bridge.'],
      ['{A}: Studies show that students who sleep nine hours do better on tests.|{B}: You only say that because you love sleeping in, so the studies mean nothing.', 1, 'Even if {A} likes sleeping in, the studies are still evidence. {B} attacks {A}\'s motives instead of the studies.'],
      ['The {club} asked for a bigger room and gave three reasons for it.|But the {club} members are the same kids who were late to the assembly.|So we should ignore their request.', 1, 'Being late to an assembly does not answer any of the three reasons for a bigger room.'],
      ['{A} wrote a letter showing that the crosswalk on {town} Road is crowded and unsafe.|{B}: {A} is just a kid, and kids don\'t know anything about traffic.|{B}: So the crosswalk is fine.', 1, '{A} gave evidence about the crosswalk. Brushing it off because of {A}\'s age ignores that evidence.'],
      ['{A}: The cafeteria should offer a vegetarian {food} once a week, since a third of the students don\'t eat meat.|{B}: You\'re new here, so your opinion about our cafeteria doesn\'t count.', 1, 'How long {A} has been at the school does not change how many students skip meat.']
    ],
    fair: [
      ['{B} claims to have seen the missing bike behind the gym.|But {B} has told three different stories about it, and {B} was at a game across town that afternoon.|So we should not rely on {B}\'s report.', 'The question is whether to trust {B}\'s report as a witness. Changing stories and being across town are good reasons to doubt it. This is not an attack on a reason {B} gave; it is a fair question about testimony.'],
      ['The online review praising the {food} truck was written by the truck\'s owner.|An owner has a reason to praise the business no matter what.|So the review alone is weak evidence that the food is good.', 'Who wrote a review matters when we are asked to take the review on trust. The conclusion is modest: the review is weak evidence, not that the food is bad.'],
      ['{A}: {B}\'s case for a longer recess rests on a survey of only ten students.|{A}: That sample is too small, so the case is not proven yet.', '{A} answers {B}\'s actual reason (the survey) instead of attacking {B}.']
    ]
  };
  FB.tuq = {
    items: [
      ['{A}: You should wear a helmet when you ride your bike. It protects your head in a fall.|{B}: You rode without a helmet last week, so why should I wear one?', 1, 'Whether {A} wore a helmet last week does not change what a helmet does in a fall.'],
      ['{A}\'s uncle says that eating vegetables every day keeps you healthy.|{A}: But you hardly ever eat vegetables yourself, so your advice must be wrong.', 1, 'The uncle may not follow his own advice, but the reasons for eating vegetables are the same either way.'],
      ['Coach {B}: Stretch before every game. Cold muscles get hurt more easily.|{A}: You never stretch before you go jogging, so I\'m skipping it.', 1, 'Coach {B}\'s own habits do not change how muscles work. {A} answers the coach, not the reason.'],
      ['{A}: Please turn off the lights when you leave a room. It saves energy.|{B}: You left the porch light on all night on {day}, so that rule is silly.', 1, 'Pointing out that {A} slipped up once does not show that turning off lights fails to save energy.'],
      ['{B}\'s big sister says that staying up late before a test is a bad idea.|{B}: You stayed up until midnight before your last exam, so you can\'t tell me that.', 1, 'The sister may be inconsistent, but her reason (being tired hurts your test) still stands.'],
      ['{A}: Phones should stay in backpacks during {subject} class so we can focus.|{B}: You checked your phone during the assembly yesterday, so your idea doesn\'t count.', 1, '{A} being inconsistent is not a reason to think phones help focus.'],
      ['The dentist told {C} to floss every night to prevent cavities.|{C}: I saw the dentist eat a whole bag of candy, so I don\'t need to floss.', 1, 'What the dentist eats does not change how flossing protects teeth.']
    ],
    fair: [
      ['{A}: You should wear a helmet. It protects your head in a fall.|{B}: You\'re right. You forgot yours last week, but that doesn\'t change what helmets do.|{B}: I\'ll wear mine.', '{B} notices the slip but does not use it to reject the advice. The reason stands, and {B} accepts it.'],
      ['Coach {B} says we must run two laps before practice, but the coach always skips the laps.|We could ask the coach to join us, since leading by example helps a team.', 'Pointing out that someone does not follow their own rule is fair when the question is about that person\'s conduct. Nothing here says the laps are useless.'],
      ['{A}: Our club should save money for the spring trip.|{B}: Last year you spent the club\'s money on snacks, so I\'d like a written plan this time.', '{B} uses {A}\'s past to ask for a safeguard, not to reject the idea of saving money. The past is relevant to how much to trust a plan.']
    ]
  };
  FB.straw = {
    items: [
      ['{A}: I think we should add more vegetables to the lunch menu.|{B}: So you want to ban {food} forever and make everyone eat only salad?|{B}: That\'s ridiculous, so the menu should stay the same.', 1, '{A} asked for <b>more</b> vegetables. {B} attacks a far more extreme plan that {A} never offered.'],
      ['{A}: Maybe we could shorten recess by five minutes on test days.|{B}: {A} wants to cancel recess for the whole year!|{B}: Nobody should agree to that.', 1, 'Five minutes on test days is not the same as cancelling recess. {B} knocks down a view {A} does not hold.'],
      ['{A}: We should keep the {pet} in a bigger cage so it has room to move.|{B}: Oh, so you think the {pet} should run wild all over the school?|{B}: That\'s a terrible idea, so the cage is fine.', 1, 'A bigger cage is not the same as letting the {pet} run loose. {B} distorts {A}\'s point.'],
      ['{A} said that the team could use a bit more practice on passing.|{B}: {A} thinks we\'re the worst team in the league and should give up.|{B}: That\'s unfair, so we don\'t need extra passing drills.', 1, '{A} said "a bit more practice," not "the worst team." The exaggerated version is easy to reject, but it is not {A}\'s view.'],
      ['{A}: I\'d like the library to stay open one hour later on {day}s.|{B}: So you want the librarians to work all night with no breaks?|{B}: That\'s cruel, so the hours should not change.', 1, 'One hour later on one day is not "all night with no breaks." {B} attacks a straw version of the request.'],
      ['{A}: We should check our math answers before handing in tests.|{B}: {A} thinks we should spend the whole test checking and never finish.|{B}: That makes no sense, so let\'s not bother checking.', 1, '{A} suggested checking answers, not spending the whole test on it.'],
      ['{A}: Our town could plant a few more trees along {town} Road.|{B}: {A} wants to turn the whole road into a forest where no cars can drive!|{B}: So we should not plant any trees.', 1, 'A few more trees is a modest plan. {B} replaces it with an absurd one and rejects that instead.']
    ],
    fair: [
      ['{A}: I think we should add more vegetables to the lunch menu.|{B}: If we add vegetables, the menu has room for only so many dishes, so something else might be cut.|{B}: Which dish would you replace?', '{B} responds to the plan {A} actually gave and raises a fair cost of it.'],
      ['{A}: Maybe we could shorten recess by five minutes on test days.|{B}: Five minutes is small, but recess helps some students focus, so the trade might not help scores.', '{B} states {A}\'s view accurately (five minutes, test days) and then gives a reason against it.'],
      ['{A}: The library should stay open one hour later on {day}s.|{B}: That would mean paying a librarian for one more hour a week. Is there money for that?', '{B} answers the real request, one more hour on one day, by raising a cost that the plan really has.']
    ]
  };
  FB.herring = {
    items: [
      ['{A}: Why didn\'t you finish your {subject} homework?|{B}: Did you know that some students in other countries go to school on Saturdays?|{B}: Anyway, I think we\'re done talking about homework.', 1, 'Saturday school elsewhere has nothing to do with why {B}\'s homework is unfinished. The subject changes and the first question is dropped as if it were answered.'],
      ['{A}: The new playground slide is too hot to use in the afternoon sun.|{B}: The old playground had splinters everywhere, and the new one cost a lot of money to build.|{B}: So the slide is fine.', 1, 'Splinters on the old playground and the cost of the new one do not answer whether the slide is too hot.'],
      ['{A}: Our club\'s bake sale lost money because we bought too many supplies.|{B}: The real problem is that the school gym needs new paint. It\'s been peeling for years.|{B}: So let\'s not worry about the bake sale.', 1, 'The gym\'s paint is a different issue. Bringing it up does not show that buying too many supplies was fine.'],
      ['Parent: Did you feed the {pet} this morning?|{C}: You know, {pet}s are some of the most popular pets in the country, and they\'re very smart.|{C}: So the {pet} is fine.', 1, 'Facts about {pet}s in general don\'t answer whether this one was fed this morning.'],
      ['{A}: The town should fix the potholes on Main Street.|{B}: Our town also has the best summer fair in the county. People come from miles away.|{B}: So the roads are nothing to complain about.', 1, 'A great fair says nothing about the potholes. The new topic is used as if it settled the first.'],
      ['{A}: The science fair judges should explain how they scored the projects.|{B}: Science fairs teach students a lot about experiments, and many famous scientists started with them.|{B}: So there\'s no need to explain the scores.', 1, 'The value of science fairs is a different question from whether the scoring should be explained.']
    ],
    fair: [
      ['{A}: Why didn\'t you finish your homework?|{B}: I was at the hospital with my grandmother last night, so I didn\'t have time.', 'This answer is about the homework: it gives a reason it was not finished. It stays on topic.'],
      ['{A}: The new slide is too hot in the afternoon.|{B}: That\'s a fair point. Also, before we fix it, can we talk about the broken swing? It\'s a separate problem.', '{B} grants the first point and raises a new topic openly, without pretending it answers the first.'],
      ['{A}: The bake sale lost money because we bought too many supplies.|{B}: We also sold fewer {food} than last year because it rained, so supplies were only part of the problem.', '{B}\'s point is about the same question (why the sale lost money). It adds another cause; it doesn\'t change the subject.']
    ]
  };
  FB.force = {
    items: [
      ['{A}: I think the club should vote on the trip instead of just going to {place}.|{B}: If you keep saying that, I\'ll make sure you don\'t get picked for anything this year.|{B}: So we\'re going to {place}.', 1, '{B} gives no reason the trip is a good choice. {B} only threatens {A}.'],
      ['Team captain: Everyone agrees that my play is the best one, right?|Team captain: Anyone who disagrees can sit on the bench for the next game.', 1, 'Sitting on the bench is a threat, not a reason the play is good.'],
      ['{B}: The {food} at my party will be the best food anyone has ever tasted.|{B}: Say you agree, or you\'re not invited.', 1, 'Being uninvited is a threat. It gives no evidence about how good the food is.'],
      ['{A} told the group that the poster had a spelling mistake.|{B}: The poster is perfect, and if you tell the teacher otherwise, you can find a new group.', 1, 'The threat of losing the group says nothing about the spelling.'],
      ['{A}: I don\'t think the new rule about lockers is fair.|Hall monitor: Keep talking like that and I\'ll write you up.|Hall monitor: So the rule is fair.', 1, 'A threat to write {A} up does not show that the rule is fair.'],
      ['{C}: Admit that my {game} strategy is better than yours.|{C}: Otherwise, I won\'t give you a ride to practice anymore.', 1, 'Losing a ride is a threat. It does not show anything about the strategy.']
    ],
    fair: [
      ['Coach: If you skip practice this week, you\'ll be less ready for Saturday\'s game.|Coach: So come to practice.', 'This is a warning about a natural result, not a threat. Being less ready is a real consequence of missing practice and a fair reason to come.'],
      ['Sign at the pool: Running on the wet deck can cause falls.|Sign at the pool: Swimmers who run will be asked to leave for the day.', 'A rule with a penalty is not a fallacy. The sign gives the reason for the rule (falls) and states what happens if it is broken; it is not trying to prove a claim true by threat.'],
      ['{A}: If we don\'t water the garden this week, the {fruit} trees will dry out.|{A}: So someone needs to water it.', 'Dry trees are a natural consequence, and they are relevant to the conclusion. No one is threatened.']
    ]
  };
  FB.pity = {
    items: [
      ['{A}: I should get an A on my essay.|{A}: I stayed up all night and my {pet} was sick, and I\'ll be so upset if I don\'t get an A.', 1, 'Being tired and upset is sad, but it does not show the essay earned an A. The grade should reflect the essay.'],
      ['{B}: Please pick my drawing as the contest winner.|{B}: I\'ve never won anything in my whole life, and it would mean so much to me.|{B}: So my drawing is the best one.', 1, 'Never having won is a reason to feel sympathy, not evidence that the drawing is the best.'],
      ['{C}: My answer to question {n} must be right.|{C}: I worked so hard on it, and I\'ll cry if it\'s wrong.', 1, 'Hard work and sadness don\'t change whether the answer is correct.'],
      ['Shop owner: These {fruit} are fresh, I promise.|Shop owner: My store has had a terrible month, and if you don\'t buy them I don\'t know what I\'ll do.', 1, 'The owner\'s hard month does not show the fruit is fresh.'],
      ['{A}: I should be the goalie this season.|{A}: My grandma is coming to watch and she\'ll be heartbroken if I\'m not in goal.', 1, 'Grandma\'s feelings are real, but they say nothing about who is the best goalie.'],
      ['{B}: My science project deserves first prize.|{B}: My little brother spilled juice on it, and I had to stay up late fixing it, which was so unfair.', 1, 'The spill and the late night make us feel for {B}, but first prize should depend on the project.']
    ],
    fair: [
      ['{A}: My {pet} was very sick last night, and I spent the evening at the vet.|{A}: Could I have one more day to finish the essay?', 'Here the hardship is relevant: {A} asks for more time, and a real emergency is a good reason for more time. {A} does not claim the essay deserves a higher grade.'],
      ['The animal shelter is full, and many dogs are waiting for homes.|If you have room and want a pet, adopting one would help.', 'Feelings for the dogs are relevant to the conclusion, which is about helping them.'],
      ['{B}\'s family lost their home in a flood.|So the class could collect supplies to help them.', 'Sympathy is a fitting reason for kindness. The conclusion is about helping, not about what is true.']
    ]
  };
  FB.people = {
    items: [
      ['Everyone at school is wearing the new {town} sneakers.|So they must be the best sneakers you can buy.', 1, 'Popularity does not show quality. Many people can like a thing for fashion, price or advertising.'],
      ['Millions of people read their horoscope every morning.|So horoscopes must predict the future.', 1, 'How many people read horoscopes says nothing about whether they work.'],
      ['{A}: Lots of kids in our grade think the moon landing was filmed in a studio.|{A}: With that many people believing it, there must be something to it.', 1, 'The number of believers does not add evidence. The landings are well documented.'],
      ['Everybody in {club} says {food} is the healthiest lunch.|So {food} is the healthiest lunch.', 1, 'Agreement among friends is not evidence about health.'],
      ['{B}: Most of my friends skip breakfast, so skipping breakfast must be good for you.', 0, 'What many friends do does not show what is good for your body.'],
      ['{A}: Our whole street put up the same holiday lights.|{A}: You\'d be the only one without them, so you should get them too.', 1, 'Fitting in may feel nice, but it does not show the lights are a good choice for you.']
    ],
    fair: [
      ['The {town} cookbook is the best-selling cookbook in the state this year.|So it is a very popular cookbook.', 'Here the conclusion is about popularity itself, so sales numbers are exactly the right evidence.'],
      ['Most people in our town speak English at the store.|So a new shop here should print its signs in English.', 'What most customers speak is relevant to which signs they can read.'],
      ['Nearly every student voted for {food} as the end-of-year party lunch.|So the party should serve {food}.', 'For a party meant to please the students, what most of them want is a good reason.']
    ]
  };
  FB.authority = {
    items: [
      ['A famous soccer star says that this {food} cereal makes you smarter.|So it must make you smarter.', 0, 'A soccer star is not an expert on nutrition or learning. Fame in one field is not expertise in another.'],
      ['{A}: My cousin, who is a great guitar player, says that the moon causes earthquakes.|{A}: So the moon causes earthquakes.', 1, 'Playing guitar well gives no special knowledge of earthquakes.'],
      ['A popular video blogger says that sunscreen is a waste of money.|So you don\'t need sunscreen at the beach.', 0, 'The blogger is not a skin doctor, and skin doctors widely recommend sunscreen. One voice outside the field is weak evidence.'],
      ['{B}\'s neighbor is a pilot.|The neighbor says that {pet}s should eat only chocolate.|So that\'s what {B}\'s {pet} should eat.', 1, 'A pilot knows about flying, not about pet food. And chocolate is harmful to many pets.'],
      ['One doctor online says that people should never drink water during exercise.|Almost all other doctors say the opposite.|So {C} stops drinking water at practice.', 2, 'Trusting one voice against nearly all the experts is unfair use of authority.'],
      ['The star of a cooking show says that this car is the safest one on the road.|So it is the safest car.', 0, 'A cooking star has no special knowledge of car safety. Crash test results would be the right evidence.']
    ],
    fair: [
      ['The pediatrician, who has treated children for twenty years, says {A} needs to rest a sprained ankle for a week.|So {A} should rest the ankle.', 'A doctor speaking on a medical question in their own field is a fair authority.'],
      ['Weather scientists at the National Weather Service expect heavy rain tomorrow.|So we should move the picnic indoors.', 'Forecasting is the forecasters\' field, and their forecast is good evidence.'],
      ['Nearly all biologists agree that whales are mammals.|So whales are mammals.', 'When experts in the field agree, relying on them is good reasoning.']
    ]
  };
  FB.ignorance = {
    items: [
      ['No one has ever proved that ghosts are not living in the old {town} theater.|So ghosts must live there.', 0, 'Failing to disprove something is not proof of it.'],
      ['{A}: Nobody can prove that my lucky socks don\'t help me score goals.|{A}: So they must help.', 1, 'A lack of disproof is not evidence that the socks help.'],
      ['Scientists have not found life on other planets yet.|So there is definitely no life anywhere else in the universe.', 1, 'Not having found something yet is not proof that it does not exist, especially when most places have not been searched.'],
      ['{B}: You can\'t prove I ate the last {food}.|{B}: So I didn\'t eat it.', 1, 'Lack of proof that {B} ate it does not show that {B} didn\'t.'],
      ['No one has shown that the new paint is safe for the class {pet}\'s cage.|So the paint must be poisonous.', 1, 'A lack of proof that it is safe is not proof that it is poisonous. Being careful is wise, but the conclusion claims too much.'],
      ['No one has proven that the old map is fake.|So the treasure on the map must be real.', 1, 'A lack of proof that the map is fake does not prove the treasure is real.']
    ],
    fair: [
      ['We checked every room, closet and shelf in the house.|We found no sign of the cat inside.|So the cat is probably not in the house.', 'A careful search that would have found the cat counts as evidence. This is not a mere lack of proof.'],
      ['The lifeguards scanned the whole pool with the lights on and found no one in the water.|So the pool is empty.', 'A thorough search of a small, visible area is good evidence.'],
      ['In a court, a person is treated as innocent unless the evidence shows guilt beyond reasonable doubt.|So the jury should not find {A} guilty on weak evidence.', 'This is a rule about who must prove what in a trial, not a claim that a lack of proof shows something is true.']
    ]
  };
  FB.begging = {
    items: [
      ['{A}: {food} is the best food because no other food is better.', 0, '"No other food is better" is just another way of saying "it is the best." The premise assumes the conclusion.'],
      ['{B} always tells the truth.|We know this because {B} told us so, and {B} never lies.', 1, 'To trust {B}\'s statement, we must already assume {B} tells the truth, which is the conclusion.'],
      ['{C}: Our team will win because we\'re going to beat the other team.', 0, 'Winning and beating the other team are the same thing. Nothing new is offered.'],
      ['{A}: Reading is good for you.|{A}: That\'s because reading has a positive effect on people who do it.', 1, '"Has a positive effect" restates "is good for you" in other words.'],
      ['The {club} is the most fun club in school.|After all, no club is more enjoyable than the {club}.', 1, '"No club is more enjoyable" says the same thing as "the most fun." The conclusion hides in the premise.'],
      ['{B}: This book is boring because it is not interesting.', 0, 'Boring and not interesting mean the same thing, so the reason is just the conclusion again.']
    ],
    fair: [
      ['{food} is a good choice for the party because it is cheap, most guests like it, and it is easy to share.', 'Each reason is something other than the conclusion, and each can be checked.'],
      ['{B} has been honest with us many times, and the report {B} gave yesterday matches what the teacher saw.|So {B}\'s report is probably true.', 'The premises give independent evidence (past honesty and a matching report). They do not assume the conclusion.'],
      ['Our team is likely to win because we beat this team twice this season and their best player is out sick.', 'These reasons are independent of the conclusion and give real support.']
    ]
  };
  FB.complex = {
    items: [
      ['{A}: Have you stopped forgetting your homework?', 0, 'Yes or no, the answer grants that you used to forget your homework.'],
      ['{B}: Why are you always so rude to the new students?', 0, 'The question assumes {B}\'s friend is always rude. Any direct answer accepts that.'],
      ['{C}: Did you spend all of the club money on candy again?', 0, 'The word "again" assumes it happened before.'],
      ['Reporter: How long have you been hiding the truth about the missing trophy?', 0, 'The question assumes someone has been hiding the truth.'],
      ['{A}: Where did you hide my {pet}\'s favorite toy?', 0, 'The question assumes the toy was hidden, and by the person asked.'],
      ['{B}: Are you still copying answers from {C}?', 0, '"Still" assumes the copying happened before.']
    ],
    fair: [
      ['{A}: Did you finish your homework?', 'This question asks about one thing and assumes nothing that is in doubt.'],
      ['{B}: What did you eat for lunch today?', 'The question assumes only that the person ate lunch, which is not in dispute here.'],
      ['{C}: Did the club spend any money on candy this month?', 'This question assumes nothing about the past and can be answered fairly with yes or no.']
    ]
  };
  FB.dilemma = {
    items: [
      ['{A}: Either we go to {place} on Saturday, or we sit at home and do nothing all weekend.|{A}: Nobody wants to do nothing, so we\'re going to {place}.', 0, 'There are many other things to do this weekend besides those two.'],
      ['{B}: Either you join the {club}, or you don\'t care about our school at all.|{B}: You care about the school, so you must join.', 0, 'People can care about a school in many ways without joining that club.'],
      ['Coach: Either we practice four hours a day, or we\'ll lose every game.|Coach: We don\'t want to lose, so four hours it is.', 0, 'Practicing a bit more, or more wisely, are other options.'],
      ['{C}: Either you love {food}, or you hate good food.|{C}: You don\'t hate good food, so you love {food}.', 0, 'Someone can like good food and still not love {food}.'],
      ['{A}: Either we cancel the field trip, or someone will surely get lost.|{A}: We can\'t let anyone get lost, so the trip is cancelled.', 0, 'Buddy systems and more chaperones are other options.'],
      ['{B}: You\'re either with our team on this, or you\'re against us.|{B}: Since you\'re not with us, you\'re against us.', 0, 'Someone can be undecided or neutral.']
    ],
    fair: [
      ['The light switch is either on or off.|It is not on, so it is off.', 'A simple switch really has only two positions, so the either-or covers every case.'],
      ['A whole number is either even or odd.|{n} is not even, so it is odd.', 'Every whole number is even or odd, so there is no missing option.'],
      ['The game ends today either with our team winning, losing or tying.|We did not win and we did not tie, so we lost.', 'All three options are listed, so nothing is left out.']
    ]
  };
  FB.hasty = {
    items: [
      ['{A} met two people from {town} who were rude.|So people from {town} are rude.', 1, 'Two people are far too few to tell us about a whole town.'],
      ['{B} tried one {fruit} from the new store and it was sour.|So all the fruit at that store is bad.', 1, 'One piece of fruit is a tiny sample, and it was only one kind of fruit.'],
      ['The first {n} pages of the book were slow.|So the whole book is boring.', 1, 'The first pages may not be typical of the whole book.'],
      ['{C} asked three friends in the {club} whether students want more clubs, and all three said yes.|So almost every student in the school wants more clubs.', 1, 'Three club members are too few, and club members are not typical of all students on this question.'],
      ['My {pet} got sick after eating the new treat.|So that treat makes every {pet} sick.', 1, 'One animal\'s reaction is not enough to judge the treat for all animals.'],
      ['{A}\'s first {game} game was lost by a lot.|So {A} will never be good at {game}.', 1, 'One game is far too little to judge a skill for life.']
    ],
    fair: [
      ['A survey asked {big} students chosen at random from every grade whether they want more clubs.|Most said yes.|So most students in the school probably want more clubs.', 'The sample is large and chosen at random from the whole school, so it is likely to be typical.'],
      ['The baker tasted a spoonful from the well-stirred pot of soup and it was too salty.|So the whole pot is too salty.', 'A well-stirred pot is the same throughout, so one spoonful is a fair sample.'],
      ['The vet checked {n} kittens from the litter, and all had the same rare spots.|There are {n} kittens in the litter.|So every kitten in the litter has the spots.', 'Every member of the group was checked, so the conclusion does not go beyond the evidence.']
    ]
  };
  FB.cause = {
    items: [
      ['{A} wore a red shirt on the day of the {subject} test and got an A.|So the red shirt caused the good grade.', 1, 'Wearing the shirt first does not show it caused the grade. Studying is a far likelier cause.'],
      ['The new soccer coach started in March.|In April, the team won four games in a row.|So the new coach must be the reason the team is winning.', 2, 'Coming first is not the same as causing. Easier opponents or a returning player could explain the wins.'],
      ['Every time {B} washes the car, it rains the next day.|So washing the car makes it rain.', 1, 'Rain often follows any day. Washing a car cannot change the weather.'],
      ['{C} started drinking orange juice every morning, and a week later the cold went away.|So orange juice cured the cold.', 1, 'Colds go away on their own in about a week. The timing fits, but it does not show the juice did it.'],
      ['Ice cream sales and sunburns both go up in the same months.|So eating ice cream causes sunburn.', 1, 'Both are caused by a third thing: hot, sunny weather.'],
      ['The rooster crows every morning, and right after that the sun comes up.|So the rooster makes the sun rise.', 1, 'The rooster crows because of the coming dawn, not the other way around.']
    ],
    fair: [
      ['In a careful test, half of the bean plants got fertilizer and half did not, chosen at random.|Everything else was kept the same.|The fertilized plants grew much taller.|So the fertilizer helped them grow.', 'A controlled test with a random split rules out the other causes, so this is good causal reasoning.'],
      ['Whenever {A} unplugs the lamp, it goes dark, and when it is plugged in again, it lights.|So the plug supplies the lamp\'s power.', 'The change was tested many times, in both directions, by {A}\'s own action. That is strong evidence of a cause.'],
      ['The ice on the pond melted after a week of warm weather.|Warm weather melts ice.|So the warm week likely melted the ice.', 'There is a known way that warmth melts ice, so this cause is well supported.']
    ]
  };
  FB.slope = {
    items: [
      ['{A}: If we let students drink water in class, next they\'ll want snacks, then full meals, and soon class will be one big cafeteria.|{A}: So no water bottles in class.', 0, 'Nothing shows that allowing water leads to full meals. Each link is just asserted.'],
      ['{B}: If you skip one {subject} homework, you\'ll fall behind, then fail the class, then never get into college, and you\'ll have no future.', 0, 'Missing one assignment rarely leads to all of that. Each step is far from certain.'],
      ['Parent: If I let you stay up until ten tonight, you\'ll want midnight tomorrow, and soon you\'ll never sleep at all.|Parent: So bedtime is nine.', 0, 'One later night does not have to lead to never sleeping. The chain is not supported.'],
      ['{C}: If the town allows one food truck at the park, soon the park will be full of trucks and there will be no grass left.', 0, 'One truck does not show that the park will be paved over. No evidence supports the chain.'],
      ['{A}: If we let the {pet} on the couch once, it will think it owns the house, and then it will never listen to us again.', 0, 'One time on the couch does not have to change the whole relationship. The links are guesses.'],
      ['{B}: If our class gets five extra minutes of recess, next we\'ll ask for an hour, and then there will be no lessons at all.', 0, 'Nothing supports the leap from five minutes to no lessons.']
    ],
    fair: [
      ['If you leave the milk out of the fridge all day, it will warm up.|Bacteria grow faster in warm milk.|So the milk will likely spoil.', 'Each link is well supported by known facts, so this chain is good reasoning.'],
      ['If we don\'t water the seedlings this week, the soil will dry out.|Dry soil means the roots can\'t take in water, so the seedlings will wilt.', 'Every step is a known, reliable result, so the chain holds.'],
      ['If we spend the trip money on snacks now, we won\'t have enough for the bus.|Without a bus, the class can\'t get to {place}.|So we shouldn\'t spend it on snacks.', 'The links are simple facts about money and travel, not guesses.']
    ]
  };
  FB.analogy = {
    items: [
      ['A school is like a business.|A business fires workers who don\'t make money.|So a school should expel students who get low grades.', 2, 'Schools exist to teach students, not to make money from them. The likeness doesn\'t hold in the way that matters.'],
      ['{A}: A dog and a cat are both furry pets with four legs.|{A}: Dogs love to fetch sticks, so {A}\'s cat will love it too.', 1, 'Fur and four legs have nothing to do with whether an animal likes to fetch.'],
      ['Running a family is like running a ship.|A ship\'s captain\'s orders are never questioned.|So kids should never question their parents.', 2, 'A ship in a storm needs instant obedience in a way a family dinner does not. The likeness ignores a key difference.'],
      ['{B}: My bike and a car both have wheels and take you places.|{B}: Cars need gasoline, so my bike needs gasoline too.', 1, 'Having wheels has nothing to do with what powers a vehicle.'],
      ['A book is like a movie: both tell stories.|You can watch a movie in two hours.|So you should be able to read any book in two hours.', 2, 'Telling a story is not the feature that sets how long something takes to finish.']

    ],
    fair: [
      ['The new bridge uses the same design, steel and builders as the old bridge, which has held heavy trucks for forty years.|So the new bridge will likely hold heavy trucks too.', 'The likenesses (design, materials, builders) are exactly the ones that matter for strength.'],
      ['{A}\'s tomato plants and {B}\'s grow in the same soil, get the same sun, and are the same kind.|{A}\'s plants grew well with weekly watering.|So {B}\'s will probably grow well with weekly watering too.', 'Soil, sun and plant type are relevant to growth, so the analogy is strong.'],
      ['This puzzle box opens like the last one: same maker, same lock, same pattern on the lid.|The last one opened by sliding the lid left.|So this one probably does too.', 'The shared features are the ones that decide how the box opens.']
    ]
  };
  FB.suppressed = {
    items: [
      ['This {food} has no added sugar.|So it is a healthy snack.|(It is also deep-fried and very salty, but the ad leaves that out.)', 1, 'The ad leaves out facts that would change the conclusion: frying and salt matter for health.'],
      ['{A}: The {town} pool is the best choice for the party: it\'s the closest one to us.|(The pool is closed for repairs this month.)', 0, '{A} leaves out that the pool is closed, which decides the question.'],
      ['The used bike has new tires and a shiny new paint job.|So it is a great bike to buy.|(The seller knows the frame is cracked.)', 1, 'A cracked frame would change everything. Leaving it out makes the argument mislead.'],
      ['Our team scored more points than any other team this season.|So we are the best team.|(We also played twice as many games as any other team.)', 1, 'Playing twice as many games explains the high total. The missing fact changes the conclusion.'],
      ['This hiking trail is only two miles long, so it\'s an easy walk for little kids.|(It climbs straight up a steep, rocky cliff.)', 0, 'The steep climb, left out, is exactly what decides whether the trail is easy.'],
      ['The new phone game is free to download.|So it won\'t cost you anything.|(It asks you to pay to unlock most of the levels.)', 1, 'The missing fact about paying to unlock levels changes the conclusion.']
    ],
    fair: [
      ['The {town} pool is closest to us, it is open this month, and it has a party room.|So it is a good place for the party.', 'The argument gives the facts that matter, including the one that the pool is open.'],
      ['The used bike has new tires, a solid frame that a repair shop checked, and working brakes.|So it is a good bike to buy.', 'The key facts about safety are included, so nothing important is hidden.']
    ]
  };
  FB.accident = {
    items: [
      ['People should always keep their promises.|{A} promised to meet {B} at {place} at noon.|On the way, {A} saw a child fall off a bike and stopped to help.|So {A} did something wrong by being late.', 3, 'Keeping promises is a good rule, but it was not meant to forbid helping someone who is hurt.'],
      ['The rule says no running in the school halls.|The fire alarm went off and {C} ran to the exit.|So {C} broke the rules and should be punished.', 2, 'The no-running rule was made for ordinary days, not for leaving during a fire alarm.'],
      ['Doctors say that exercise is good for you.|{B} has a broken leg.|So {B} should go running every day.', 2, 'The general advice about exercise does not cover someone with a broken leg.'],
      ['Speeding is against the law.|The ambulance was speeding to the hospital.|So the ambulance driver should get a ticket.', 2, 'Speed limits are not meant to stop ambulances on emergency calls.'],
      ['Sharing is good.|So {A} should share the answers to the test with the whole class.', 1, 'Sharing is good in general, but the rule does not cover sharing test answers.'],
      ['Telling the truth is important.|So {B} should tell {C} that the surprise party is tomorrow.', 1, 'Honesty is a good rule, but keeping a happy surprise is a case it was not meant to cover.']
    ],
    fair: [
      ['The library rule says books are due in three weeks.|{A}\'s book is five weeks old and {A} has no special reason for the delay.|So {A} owes the late fee.', 'This is an ordinary case the rule was made for, so applying it is fair.'],
      ['Students should wear safety goggles when using the lab\'s chemicals.|{B} is pouring a chemical in the lab.|So {B} should wear goggles.', 'This is exactly the kind of case the rule was written for.'],
      ['Promises should be kept.|{C} promised to feed the neighbor\'s {pet} today and nothing urgent came up.|So {C} should feed it.', 'Nothing special about the case calls for an exception, so the rule applies.']
    ]
  };
  FB.equiv = {
    items: [
      ['A feather is light.|What is light cannot be dark.|So a feather cannot be dark.', 1, '"Light" means not heavy in the first line and bright in the second.'],
      ['The sign says "Fine for parking here."|So it must be fine to park here.', 1, '"Fine" on the sign means a penalty you pay, not "okay."'],
      ['{A}\'s jokes are very dry.|Dry things need water.|So {A}\'s jokes need water.', 1, '"Dry" means told with a straight face in the first line and not wet in the second.'],
      ['{A}: Our coach said we have a lot of bright players.|{A}: So we should play the night game without any field lights.', 1, '"Bright" meant smart, not giving off light.'],
      ['{B} is a big fan of the {town} team.|A fan is a machine that blows air.|So {B} is a machine that blows air.', 1, '"Fan" means a supporter in the first line and a machine in the second.'],
      ['{C} sat on the bank all afternoon, watching the river.|Banks are where people keep their money.|So {C} sat where people keep their money.', 1, '"Bank" means the side of a river in the first line and a place for money in the second.'],
      ['Nothing is better than a long vacation.|A cold sandwich is better than nothing.|So a cold sandwich is better than a long vacation.', 2, '"Nothing" means "no other thing" in the first line and "having nothing at all" in the second.'],
      ['{A} is a star on the soccer team.|Stars are giant balls of burning gas.|So {A} is a giant ball of burning gas.', 1, '"Star" means a top player in the first line and a sun in the second.'],
      ['{B} bought a new mouse for the computer.|A mouse is a small furry animal.|So {B} bought a small furry animal.', 1, '"Mouse" means a computer tool in the first line and an animal in the second.'],
      ['The school play was a hit.|Hitting people is wrong.|So the school play was wrong.', 1, '"Hit" means a success in the first line and a blow in the second.'],
      ['Our teacher said the quiz would be a piece of cake.|Cake is something you eat.|So the quiz is something you eat.', 1, '"A piece of cake" means easy in the first line, but the second line treats it as food.']
    ],
    fair: [
      ['A feather weighs very little.|Things that weigh very little are easy to carry.|So a feather is easy to carry.', 'Every key word keeps one meaning through the argument.'],
      ['Every chess match has a winner or ends in a draw.|Today\'s final is a chess match.|So it will have a winner or end in a draw.', '"Match" means a game in both premises.'],
      ['A bat is a flying mammal.|All mammals have hair.|So a bat has hair.', '"Bat" means the animal in every line.'],
      ['{A} is the top scorer on the soccer team.|The top scorer gets the trophy.|So {A} gets the trophy.', '"Top scorer" means the same thing in both premises.']
    ]
  };
  FB.amph = {
    items: [
      ['The sign said: "Slow children at play."|So the children who play here must be slow runners.', 1, 'The sign tells drivers to slow down because children play there. The odd grammar allows another reading.'],
      ['{A} saw the hiker with binoculars.|So the hiker had binoculars.', 1, 'The sentence could mean {A} used binoculars to see the hiker. The conclusion picks one reading without reason.'],
      ['The ad said: "We sell dresses for girls with lace."|So only girls who own lace can shop there.', 1, 'The grammar lets "with lace" attach to "girls"; the ad means dresses with lace.'],
      ['The note said: "Feed the {pet} and the fish when you get home."|So the fish need to be fed to the {pet}.', 1, 'The note means feed both animals. Reading it as feeding the fish to the {pet} twists the grammar.'],
      ['The headline read: "Kids make nutritious snacks."|So the article must be about eating kids.', 1, 'The headline means kids prepare snacks. The conclusion uses a silly reading of the grammar.'],
      ['The menu said: "Free soup and salad with any {food}."|So the salad is free, but the soup costs money.', 1, 'The grammar can group "free" with both items. The conclusion picks a reading the menu does not mean.']
    ],
    fair: [
      ['The sign said: "Drivers: slow down, children at play."|So drivers should slow down here.', 'The sentence has only one sensible reading, and the conclusion follows it.'],
      ['The note said: "Feed the fish, then feed the {pet}."|So both animals need food.', 'The grammar is clear, so there is no second reading to slip into.']
    ]
  };
  FB.comp = {
    items: [
      ['Every player on the {town} team is excellent.|So the {town} team must be excellent.', 1, 'Great players can still play badly together. Being excellent as a player does not add up to an excellent team.'],
      ['Each brick in the wall is light enough to lift with one hand.|So the whole wall is light enough to lift with one hand.', 1, 'Weight adds up. Many light bricks make a heavy wall.'],
      ['Each ingredient in the stew tastes good on its own.|So the stew will taste good.', 1, 'Good parts can make a bad mix. Taste does not simply add up.'],
      ['Every song on the album is short.|So the album is short.', 1, 'Many short songs can make a long album.'],
      ['Each part of the new machine is cheap.|So the whole machine is cheap.', 1, 'Costs add up. Hundreds of cheap parts can make an expensive machine.'],
      ['Each student in the class is quiet.|So the class makes a quiet sound at recess, even all together.', 1, 'Many quiet voices together can be loud.'],
      ['Each grain of sand weighs almost nothing.|So a truckload of sand weighs almost nothing.', 1, 'Weight adds up. Billions of grains make a heavy load.'],
      ['Each sentence in the essay is well written.|So the essay is well organized.', 1, 'Good sentences can still be put in a confusing order.'],
      ['Each raindrop is tiny.|So the storm was tiny.', 1, 'Countless tiny drops can make a huge storm.'],
      ['Each musician in the band plays well alone.|So the band will sound good together.', 1, 'Playing well alone does not add up to playing well together.']
    ],
    fair: [
      ['Every brick in the wall is red.|So the wall is red.', 'Color is a property that carries over from parts to a whole made only of them.'],
      ['Every piece of the puzzle is made of wood.|So the puzzle is made of wood.', 'Being made of wood carries over: a whole made of wooden parts is wooden.'],
      ['Every page of the book is printed in blue ink.|So the book is printed in blue ink.', 'Ink color carries over from each page to the whole book.'],
      ['Every tile on the floor is made of stone.|So the floor is made of stone.', 'What the parts are made of carries over to a whole made only of them.'],
      ['Every slice of the pizza has cheese on it.|So the pizza has cheese on it.', 'If every slice has cheese, the whole pizza does too.']
    ]
  };
  FB.div = {
    items: [
      ['The {town} orchestra is famous.|So each player in it must be famous.', 1, 'An orchestra can be famous while its players are not well known.'],
      ['The class raised a lot of money for the shelter.|So each student raised a lot of money.', 1, 'A large total can come from many small gifts.'],
      ['The school is very large.|So every classroom in it is very large.', 1, 'A big school can have small rooms. Size of the whole does not pass to each part.'],
      ['The {club} won the state contest.|So {A}, a member, must be the best in the state.', 1, 'The prize went to the group\'s work together, not to each member alone.'],
      ['The machine is heavy.|So every part of it is heavy.', 1, 'A heavy machine can be made of many light parts.'],
      ['The cake is sweet.|So the flour in it is sweet.', 1, 'The cake is sweet because of the sugar, not because every ingredient is sweet.'],
      ['The {town} library has a huge collection.|So each shelf in it has a huge collection.', 1, 'A huge collection is spread over many shelves, each holding only part of it.'],
      ['The {town} team is the best in the league.|So each player on it is the best player in the league.', 1, 'A team can be the best because its players work well together.'],
      ['The choir is loud.|So each singer in the choir is loud.', 1, 'Many soft voices together can make a loud choir.'],
      ['The truck is very expensive.|So each bolt in the truck is very expensive.', 1, 'An expensive truck can be built from many cheap parts.']
    ],
    fair: [
      ['The whole box of crayons is made of wax.|So each crayon in the box is made of wax.', 'Being made of wax is a property of what each part is made of, so it carries down.'],
      ['The whole fence is painted white.|So each board of the fence is painted white.', 'If all of the fence is white, each board is white too.'],
      ['The entire jar of marbles is glass.|So each marble is glass.', 'The material of the whole jar of marbles is the material of each marble.'],
      ['The whole rope is made of cotton.|So each strand of the rope is made of cotton.', 'What the whole is made of is what each strand is made of.'],
      ['Every part of the necklace is silver.|So each link of the necklace is silver.', 'A property of every part carries down to each link.']
    ]
  };
  FB.ac = {
    items: [
      ['If it rained last night, the street is wet.|The street is wet.|So it rained last night.', 2, 'A sprinkler or a street cleaner could have wet the street.'],
      ['If {A} studied, {A} passed the test.|{A} passed the test.|So {A} studied.', 2, '{A} might have passed for another reason: the test was easy, or {A} knew the material already.'],
      ['If the {pet} is hungry, it meows at the door.|It is meowing at the door.|So it is hungry.', 2, 'It might meow because it wants to go out.'],
      ['If the store is closed, the lights are off.|The lights are off.|So the store is closed.', 2, 'The lights could be off for a power cut while the store is open.'],
      ['If {B} won the race, {B} got a medal.|{B} got a medal.|So {B} won the race.', 2, 'Second and third place also get medals.'],
      ['If the oven is on, the kitchen is warm.|The kitchen is warm.|So the oven is on.', 2, 'The sun or the heater could warm the kitchen.']
    ],
    fair: [
      ['If it rained last night, the street is wet.|It rained last night.|So the street is wet.', 'This affirms the antecedent (modus ponens), which is valid.'],
      ['If {A} studied, {A} passed.|{A} did not pass.|So {A} did not study.', 'This denies the consequent (modus tollens), which is valid.']
    ]
  };
  FB.da = {
    items: [
      ['If it rained last night, the street is wet.|It did not rain last night.|So the street is not wet.', 2, 'A sprinkler could still have wet the street.'],
      ['If {A} practices every day, {A} will make the team.|{A} does not practice every day.|So {A} won\'t make the team.', 2, '{A} could make the team anyway, for example by being very talented.'],
      ['If you are a dog, you are a mammal.|{C}\'s {pet} is not a dog.|So it is not a mammal.', 2, 'Many animals that are not dogs, such as cats, are mammals.'],
      ['If the team wins today, it goes to the finals.|The team does not win today.|So it does not go to the finals.', 2, 'The team might still reach the finals on points or another route.'],
      ['If {B} lives in {town}, {B} lives in the state.|{B} doesn\'t live in {town}.|So {B} doesn\'t live in the state.', 2, '{B} could live in another town in the same state.'],
      ['If you eat {fruit}, you get vitamins.|{A} didn\'t eat {fruit}.|So {A} got no vitamins.', 2, 'Many other foods have vitamins.']
    ],
    fair: [
      ['If you are a dog, you are a mammal.|{C}\'s {pet} is not a mammal.|So it is not a dog.', 'This denies the consequent (modus tollens), which is valid.'],
      ['If the team wins today, it goes to the finals.|The team wins today.|So it goes to the finals.', 'This affirms the antecedent (modus ponens), which is valid.']
    ]
  };
  FB.suppressed.fair.push(['The {town} trail is two miles long and mostly flat, with benches every half mile.|So it is a good walk for little kids.', 'The facts that matter for little kids (length, steepness, places to rest) are all given.']);


  // ---------------------------------------------------------------- fallacy problems (shared by every fallacy topic)
  function fItem(R, key, fair) {
    var bank = fair ? FB[key].fair : FB[key].items, it = R.pick(bank), v = vars(R), sents = parsePassage(it[0], v);
    return fair ? { key: key, sents: sents, why: fill(it[1], v), fair: true } : { key: key, sents: sents, fault: it[1], why: fill(it[2], v) };
  }
  function faultLine(it) {
    if (it.sents.length === 1) return 'The whole passage is one move: ' + lq(esc(sentText(it.sents[0]))) + '.';
    return 'The faulty move is in sentence ' + (it.fault + 1) + ': ' + lq(esc(sentText(it.sents[it.fault])));
  }
  function namedSteps(it) {
    return [faultLine(it), it.why, 'That is <b>' + FN[it.key] + '</b>: ' + JOB[it.key] + '.'];
  }
  // Which fallacy? (the passage may come from a look-alike at levels 2 and 3, so the topic's own name is not always right)
  function fName(R, ctx, key, k, hint) {
    var t = taughtBefore(key), like = LIKE[key].filter(function (x) { return t.indexOf(x) >= 0; });
    var src = key;
    if (ctx.level >= 2 && like.length && R.chance(0.3)) src = R.pick(like);
    var it = fItem(R, src, false);
    var pool = [key].concat(rivals(key, 4)).filter(function (x) { return x !== src; }).map(function (x) { return FN[x]; });
    var wrong = pool.slice(0, k - 1);
    if (wrong.length < k - 1) wrong.push(NOF);
    return { q: passageHtml(it.sents) + 'Which fallacy does this passage commit?', a: mcq(R, FN[src], wrong, k), steps: namedSteps(it), hint: hint };
  }
  // Fallacy or fair reasoning?
  function fFair(R, ctx, key, hint) {
    var fair = R.coin(), it = fItem(R, key, fair);
    var steps = fair ? [it.why, 'So there is no fallacy here. ' + cap(FN[key]) + ' would need a step where ' + JOB[key] + '.'] : namedSteps(it);
    return {
      q: passageHtml(it.sents) + 'Does this passage commit <b>' + FN[key] + '</b>, or is the reasoning fair?',
      a: keepMc([FN[key], NOF], fair ? 1 : 0), steps: steps, hint: hint
    };
  }
  // Which sentence makes the faulty move? (a quiet, numbered lg-fallacy passage)
  function fFind(R, ctx, key, hint) {
    var it, tries = 0;
    do { it = fItem(R, key, false); tries++; } while (it.sents.length < 2 && tries < 30);
    if (it.sents.length < 2) return null;
    var ch = it.sents.map(function (x, j) { return 'Sentence ' + (j + 1); });
    return {
      q: 'This passage commits <b>' + FN[key] + '</b>. In which sentence does the reasoning go wrong?',
      viz: sentViz(it.sents), a: keepMc(ch, it.fault),
      steps: [faultLine(it), it.why, 'Sentence ' + (it.fault + 1) + ' is the step where ' + JOB[key] + '.'],
      hint: hint
    };
  }
  // Which passage is an example? (one example of key; the others are fair cousins or look-alikes)
  function fSpot(R, ctx, key, hint) {
    var right = fItem(R, key, false), others = [];
    var like = rivals(key, 3);
    if (FB[key].fair.length) others.push(fItem(R, key, true));
    like.forEach(function (x) { if (others.length < 2) others.push(fItem(R, x, false)); });
    while (others.length < 2) others.push(fItem(R, key, true));
    var rt = oneLine(right.sents), wr = others.map(function (o) { return oneLine(o.sents); });
    if (wr.indexOf(rt) >= 0 || wr[0] === wr[1]) return null;
    var steps = [lq(esc(rt)) + ': ' + right.why + ' That is ' + FN[key].toLowerCase().replace(/ \(.*\)$/, '') + '.'];
    others.forEach(function (o) { steps.push(lq(esc(oneLine(o.sents))) + ': ' + (o.fair ? o.why : 'this one is ' + FN[o.key].toLowerCase() + ' instead: ' + o.why)); });
    return { q: 'Which passage commits <b>' + FN[key] + '</b>?', a: mcq(R, esc(rt), wr.map(esc), 3), steps: steps, hint: hint };
  }
  var FSLUG = {
    adhom: 'ad-hominem', tuq: 'tu-quoque', straw: 'straw-man', herring: 'red-herring', force: 'appeal-to-force',
    pity: 'appeal-to-pity', people: 'appeal-to-popularity', authority: 'appeal-to-authority', ignorance: 'appeal-to-ignorance',
    begging: 'begging-question', complex: 'complex-question', dilemma: 'false-dilemma', hasty: 'hasty-generalization',
    cause: 'false-cause', slope: 'slippery-slope', analogy: 'weak-analogy', suppressed: 'suppressed-evidence', accident: 'accident',
    equiv: 'equivocation', amph: 'amphiboly', comp: 'composition', div: 'division'
  };
  function fallacyProblem(R, ctx, key, hint, weights) {
    var shapes = ML.byLevel(ctx, ['name', 'fair', 'fair'], ['name', 'find', 'fair', 'spot'], ['spot', 'find', 'name', 'fair']);
    if (weights) shapes = shapes.concat(weights[ctx.level] || []);
    for (var t = 0; t < 8; t++) {
      var s = R.pick(shapes), p;
      if (s === 'name') p = fName(R, ctx, key, ctx.level === 1 ? 3 : 4, hint);
      else if (s === 'fair') p = fFair(R, ctx, key, hint);
      else if (s === 'find') p = fFind(R, ctx, key, hint);
      else p = fSpot(R, ctx, key, hint);
      if (p) return p;
    }
    return fName(R, ctx, key, 3, hint);
  }


  // ================================================================ Unit 4 opener: what a fallacy is
  var FI_TRUE = [ // fallacious arguments whose conclusions happen to be true: [argument, fallacy key, why it fails]
    ['Everyone in my class says the earth goes around the sun, so it does.', 'people', 'The conclusion is true, but a class vote is not what shows it.'],
    ['A famous singer said that whales are mammals, so whales are mammals.', 'authority', 'Whales are mammals, but a singer is not the reason we know it.'],
    ['Nobody has proved that exercise is bad for you, so exercise is good for you.', 'ignorance', 'Exercise is good for most people, but a lack of disproof does not show it.'],
    ['Water boils at 100 degrees Celsius at sea level because it boils at that temperature at sea level.', 'begging', 'The conclusion is true, but the "reason" only repeats it.'],
    ['Most people I know think the Pacific is the largest ocean, so it is the largest ocean.', 'people', 'The Pacific is the largest ocean, but the reason we know it is measurement, not what most people think.']
  ];
  var FI_KIND = [ // [argument, 'formal' | 'informal', why]
    ['If it rained, the grass is wet. The grass is wet. So it rained.', 'formal', 'The flaw is in the pattern itself: any argument shaped "If P then Q; Q; so P" can fail, whatever P and Q say.'],
    ['If {A} is in {town}, {A} is in the state. {A} is not in {town}. So {A} is not in the state.', 'formal', 'The flaw is the shape "If P then Q; not P; so not Q", which fails no matter what the words are.'],
    ['All dogs are mammals. All cats are mammals. So all cats are dogs.', 'formal', 'The pattern "All A are B; all C are B; so all C are A" is broken. You can see it from the form alone.'],
    ['Everyone at school has the new game, so it must be the best game ever made.', 'informal', 'To see the flaw you have to look at what the premise says: popularity is not quality.'],
    ['{B} says we should save water, but {B} has a swimming pool, so {B} is wrong.', 'informal', 'The flaw is in the content: {B}\'s pool is not a reason against saving water.'],
    ['Either we cancel the party or it will be a disaster.', 'informal', 'The flaw is a missing option, which you find by thinking about the content, not the form.']
  ];
  FI_TRUE.push(
    ['{A} says {town} has a river, and {A} is the most popular kid in class, so {town} has a river.', 'people', 'Whether {town} has a river is a fact to check on a map; popularity is no evidence either way.'],
    ['Nobody has proved that {fruit} are unhealthy, so {fruit} are healthy.', 'ignorance', '{fruit} are healthy for most people, but a lack of disproof is not the reason.'],
    ['My favorite video star says that the heart pumps blood, so the heart pumps blood.', 'authority', 'The heart does pump blood, but a video star is not the source to trust on it.']
  );
  FI_KIND.push(
    ['If the {pet} is a dog, it is a mammal. The {pet} is a mammal. So the {pet} is a dog.', 'formal', 'Change the words to letters and the flaw stays: "If P then Q; Q; so P" can always fail.'],
    ['{C} failed one quiz, so {C} must be bad at every subject.', 'informal', 'The flaw is in what the premise says: one quiz is far too little evidence. You must look at the content to see it.'],
    ['If you don\'t join the {club}, you don\'t care about the school.', 'informal', 'The flaw is a false either-or, which you see by thinking about the content.']
  );
  var FI_FACTS = [ // [statement about fallacies, true?]
    ['A fallacy is a mistake in reasoning that can still seem convincing.', true],
    ['A fallacious argument can have a true conclusion.', true],
    ['A formal fallacy can be spotted from the form of the argument alone.', true],
    ['To spot an informal fallacy, you have to look at what the premises say.', true],
    ['Every false statement is a fallacy.', false],
    ['If an argument commits a fallacy, its conclusion must be false.', false],
    ['An argument with true premises can never commit a fallacy.', false],
    ['A fallacy is any argument you disagree with.', false]
  ];
  var FI_FALSE = [ // statements that are false but are not fallacies
    'Spiders have six legs.', 'The sun goes around the earth.', '{town} is the capital of the country.', 'There are 50 minutes in an hour.', 'Penguins can fly.'
  ];
  G('informal.fallacy-intro', tidy(function (R, ctx) {
    var v = vars(R), shape = pickLevel(R, ctx, ['truth', 'claim', 'facts'], ['truth', 'kind', 'claim', 'facts'], ['kind', 'truth', 'facts']);
    if (shape === 'facts') {
      var wantT = R.coin(), right = R.pick(FI_FACTS.filter(function (x) { return x[1] === wantT; })), wr = R.sample(FI_FACTS.filter(function (x) { return x[1] !== wantT; }), 2);
      return { q: 'Which statement about fallacies is ' + (wantT ? '<b>true</b>' : '<b>false</b>') + '?', a: mcq(R, right[0], wr.map(function (x) { return x[0]; }), 3),
        steps: [lq(right[0]) + ' is ' + (wantT ? 'true' : 'false') + '.', 'A fallacy is a faulty step in reasoning. It says nothing about whether the conclusion is true, and it is not the same as a false statement or a view you dislike.'], hint: 'A fallacy is about the reasoning, not about whether the conclusion is true.' };
    }
    if (shape === 'claim') {
      var s = fill(R.pick(FI_FALSE), v);
      return { q: 'Someone says: ' + i(esc(s)) + ' Is that a fallacy?', a: keepMc(['No: it is a false statement, but a fallacy is a mistake in reasoning', 'Yes: any false statement is a fallacy'], 0),
        steps: ['A fallacy is a pattern of bad reasoning: a faulty step from premises to a conclusion.', 'A single false statement is just false. There is no reasoning in it to be faulty.'], hint: 'Is any reasoning going on, or just one claim?' };
    }
    if (shape === 'truth') {
      var it = R.pick(FI_TRUE).map(function (x) { return fill(x, v); });
      return { q: 'This argument commits the fallacy of ' + FN[it[1]].toLowerCase() + '.' + q(esc(it[0])) + 'What follows about its conclusion?', a: keepMc(['Nothing: the conclusion may be true, but this argument does not show it', 'The conclusion must be false', 'The conclusion must be true'], 0),
        steps: [it[2], 'A fallacy is a flaw in the support, not in the conclusion. A bad argument can reach a true conclusion; it just fails to show it.'], hint: 'Does a bad reason make a claim false, or only leave it unsupported?' };
    }
    var k = R.pick(FI_KIND);
    return { q: 'Is the flaw in this argument formal or informal?' + q(esc(fill(k[0], v))), a: keepMc(['Formal: a flaw in the form (the pattern)', 'Informal: a flaw in the content'], k[1] === 'formal' ? 0 : 1),
      steps: [fill(k[2], v), 'So it is ' + (k[1] === 'formal' ? 'a formal' : 'an informal') + ' fallacy.'], hint: 'Could you spot the flaw with the words replaced by letters? Then it is formal.' };
  }));


  // ---------------------------------------------------------------- the fallacy topics (units 4 to 6)
  var FHINT = {
    adhom: 'Ask whether the reply answers the reasons, or only talks about the person who gave them.',
    tuq: 'Does the reply say the advice is wrong, or only that the adviser doesn\'t follow it?',
    straw: 'Compare what the first speaker said with what the second speaker attacks. Are they the same?',
    herring: 'Is the new topic used as if it answered the first question?',
    force: 'Is there a reason the claim is true, or only a threat?',
    pity: 'Would the sad facts change whether the claim is true?',
    people: 'Is the conclusion about popularity itself, or about something popularity can\'t show?',
    authority: 'Is the person an expert on this very question, and do other experts agree?',
    ignorance: 'Was there a careful search, or only a lack of proof?',
    begging: 'Say the premise in your own words. Is it the conclusion again?',
    complex: 'What would you be agreeing to if you answered yes, or no?',
    dilemma: 'Can you think of a third option?',
    hasty: 'How big was the sample, and was it typical of the whole group?',
    cause: 'Could something else explain it, or could it be chance?',
    slope: 'Is each link in the chain supported, or only claimed?',
    analogy: 'Do the two things share the feature that the conclusion needs?',
    suppressed: 'Is an important fact left out that would change the conclusion?',
    accident: 'Is this an ordinary case, or a special one the rule wasn\'t made for?',
    equiv: 'Does any word change its meaning from one line to the next?',
    amph: 'Can the sentence be read two ways because of its grammar?',
    comp: 'Does this property add up from the parts to the whole?',
    div: 'Does this property pass down from the whole to each part?'
  };
  G('informal.ad-hominem', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'adhom', FHINT.adhom); }));
  G('informal.tu-quoque', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'tuq', FHINT.tuq); }));
  G('informal.straw-man', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'straw', FHINT.straw); }));
  G('informal.red-herring', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'herring', FHINT.herring); }));
  G('informal.appeal-to-force', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'force', FHINT.force); }));
  G('informal.appeal-to-pity', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'pity', FHINT.pity); }));
  G('informal.appeal-to-popularity', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'people', FHINT.people); }));
  G('informal.appeal-to-authority', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'authority', FHINT.authority); }));
  G('informal.appeal-to-ignorance', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'ignorance', FHINT.ignorance); }));
  G('informal.begging-question', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'begging', FHINT.begging); }));
  G('informal.complex-question', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'complex', FHINT.complex); }));
  G('informal.false-dilemma', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'dilemma', FHINT.dilemma); }));
  G('informal.hasty-generalization', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'hasty', FHINT.hasty); }));
  G('informal.false-cause', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'cause', FHINT.cause); }));
  G('informal.slippery-slope', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'slope', FHINT.slope); }));
  G('informal.weak-analogy', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'analogy', FHINT.analogy); }));
  G('informal.suppressed-evidence', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'suppressed', FHINT.suppressed); }));
  G('informal.accident', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'accident', FHINT.accident); }));
  G('informal.equivocation', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'equiv', FHINT.equiv); }));
  G('informal.amphiboly', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'amph', FHINT.amph); }));
  G('informal.composition', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'comp', FHINT.comp); }));
  G('informal.division', tidy(function (R, ctx) { return fallacyProblem(R, ctx, 'div', FHINT.div); }));


  // ================================================================ Unit 7: Evaluating real arguments
  // ---- affirming the consequent and denying the antecedent
  var COND = [ // [P, not P, Q, not Q, another way Q could happen]
    ['it rained last night', 'it did not rain last night', 'the street is wet', 'the street is not wet', 'a sprinkler or a street cleaner could have wet it'],
    ['{A} studied', '{A} did not study', '{A} passed the test', '{A} did not pass the test', '{A} might have known the material already'],
    ['the {pet} is hungry', 'the {pet} is not hungry', 'it meows at the door', 'it is not meowing at the door', 'it might meow because it wants to go out'],
    ['the store is closed', 'the store is not closed', 'its lights are off', 'its lights are on', 'the power could be out while the store is open'],
    ['{B} won the race', '{B} did not win the race', '{B} got a medal', '{B} did not get a medal', 'second and third place get medals too'],
    ['the oven is on', 'the oven is off', 'the kitchen is warm', 'the kitchen is not warm', 'the sun or the heater could warm the kitchen'],
    ['{C} lives in {town}', '{C} does not live in {town}', '{C} lives in the state', '{C} does not live in the state', '{C} could live in another town in the state'],
    ['the team wins today', 'the team does not win today', 'it goes to the finals', 'it does not go to the finals', 'it might reach the finals another way, such as on points']
  ];
  var CF = { mp: 'Valid: affirming the antecedent (modus ponens)', mt: 'Valid: denying the consequent (modus tollens)', ac: 'Affirming the consequent', da: 'Denying the antecedent' };
  function condArg(R, v, kind) {
    var c = R.pick(COND).map(function (x) { return fill(x, v); });
    var second = { mp: c[0], mt: c[3], ac: c[2], da: c[1] }[kind], concl = { mp: c[2], mt: c[1], ac: c[0], da: c[3] }[kind];
    return { c: c, kind: kind, text: q('If ' + esc(c[0]) + ', then ' + esc(c[2]) + '.<br>' + esc(cap(second)) + '.<br>So ' + esc(concl) + '.'), valid: kind === 'mp' || kind === 'mt', second: second, concl: concl };
  }
  function condWhy(a) {
    if (a.kind === 'mp') return 'The second premise says the "if" part happened, so the "then" part must follow. That is valid.';
    if (a.kind === 'mt') return 'If ' + a.c[0] + ', then ' + a.c[2] + '. But ' + a.c[3] + ', so ' + a.c[1] + '. That is valid.';
    if (a.kind === 'ac') return 'Knowing that ' + a.c[2] + ' does not tell us why: ' + a.c[4] + '. Concluding the "if" part from the "then" part affirms the consequent.';
    return 'Even if ' + a.c[1] + ', it could still be that ' + a.c[2] + ': ' + a.c[4] + '. Concluding "not then" from "not if" denies the antecedent.';
  }
  G('informal.conditional-fallacies', tidy(function (R, ctx) {
    var v = vars(R), shape = pickLevel(R, ctx, ['valid'], ['name', 'valid'], ['follow', 'name']);
    if (shape === 'follow') {
      var c = R.pick(COND).map(function (x) { return fill(x, v); }), k = R.int(0, 3);
      var given = [c[0], c[3], c[2], c[1]][k], ans = [cap(c[2]), cap(c[1]), 'Nothing follows about whether ' + c[0], 'Nothing follows about whether ' + c[2]][k];
      var ch = k === 2 ? [ans, cap(c[0]), cap(c[1])] : k === 3 ? [ans, cap(c[3]), cap(c[2])] : k === 0 ? [ans, cap(c[3]), 'Nothing follows about whether ' + c[2]] : [ans, cap(c[0]), 'Nothing follows about whether ' + c[0]];
      return { q: 'Suppose both of these are true. What follows?' + q('If ' + esc(c[0]) + ', then ' + esc(c[2]) + '.<br>' + esc(cap(given)) + '.'), a: mcq(R, ans + '.', ch.slice(1).map(function (x) { return x + '.'; }), 3),
        steps: [k === 0 ? 'The "if" part is true, so the "then" part follows (modus ponens).' : k === 1 ? 'The "then" part is false, so the "if" part cannot be true (modus tollens).' : k === 2 ? 'The "then" part is true, but it could have another cause: ' + c[4] + '. Concluding the "if" part would affirm the consequent.' : 'The "if" part is false, but the "then" part could still happen: ' + c[4] + '. Concluding it did not would deny the antecedent.'],
        hint: 'Only two moves are valid: from the "if" part to the "then" part, and from "not then" to "not if".' };
    }
    var kind = R.pick(['mp', 'mt', 'ac', 'da', 'ac', 'da']), a = condArg(R, v, kind);
    if (shape === 'valid') return { q: 'Is this argument valid?' + a.text, a: keepMc(['Valid', 'Invalid'], a.valid ? 0 : 1), steps: [condWhy(a)], hint: 'Does the second premise affirm the "if" part, deny the "then" part, or do one of the other two moves?' };
    return { q: 'Which pattern does this argument follow?' + a.text, a: keepMc([CF.mp, CF.mt, CF.ac, CF.da], ['mp', 'mt', 'ac', 'da'].indexOf(kind)), steps: [condWhy(a), 'So the pattern is: ' + CF[kind] + '.'], hint: 'Is the second premise about the "if" part or the "then" part? Does it affirm or deny it?' };
  }));

  // ---- telling look-alike fallacies apart
  var PAIRS = [
    ['straw', 'herring', 'A straw man still talks about the other side\'s view, only a twisted copy of it. A red herring drops the view and changes the subject.'],
    ['hasty', 'accident', 'Hasty generalization goes up from a few cases to a rule. Accident takes a good rule down to a case it was not made for.'],
    ['comp', 'div', 'Composition goes from the parts to the whole; division goes from the whole to the parts.'],
    ['equiv', 'amph', 'In equivocation one word has two meanings. In amphiboly the grammar of a sentence allows two readings.'],
    ['cause', 'slope', 'False cause claims one link: this caused that. A slippery slope claims a whole chain of future links.'],
    ['adhom', 'tuq', 'Ad hominem attacks the person in general. Tu quoque points to the person not following their own advice.'],
    ['people', 'authority', 'The bandwagon leans on how many people believe something. An unfair appeal to authority leans on one person who is not an expert on the question.'],
    ['force', 'pity', 'Appeal to force uses a threat. Appeal to pity uses sympathy.'],
    ['begging', 'ignorance', 'Begging the question hides the conclusion in a premise. Appeal to ignorance treats a lack of proof as proof.'],
    ['dilemma', 'complex', 'A false dilemma offers too few options in an argument. A complex question hides an assumption inside a question.']
  ];
  G('informal.telling-apart', tidy(function (R, ctx) {
    var pr = R.pick(PAIRS), key = R.pick([pr[0], pr[1]]), other = key === pr[0] ? pr[1] : pr[0], it = fItem(R, key, false);
    var shape = pickLevel(R, ctx, ['pair'], ['pair', 'four'], ['four', 'find']);
    if (shape === 'find' && it.sents.length >= 3) {
      return { q: 'Which fallacy does this passage commit, and where?' + passageHtml(it.sents), a: { t: 'multi', parts: [
        { label: 'Fallacy', a: mcq(R, FN[key], [FN[other]].concat(R.sample(ORDER.filter(function (x) { return x !== key && x !== other && FB[x]; }), 2).map(function (x) { return FN[x]; })), 4) },
        { label: 'Faulty sentence', a: keepMc(it.sents.map(function (x, j) { return 'Sentence ' + (j + 1); }), it.fault) }] },
        steps: namedSteps(it).concat([pr[2]]), hint: 'Find the faulty step first. Then ask what job it does.' };
    }
    var wr = [FN[other]];
    if (shape !== 'pair') wr = wr.concat(R.sample(ORDER.filter(function (x) { return x !== key && x !== other && FB[x]; }), 2).map(function (x) { return FN[x]; }));
    return { q: passageHtml(it.sents) + 'Which fallacy is this?', a: mcq(R, FN[key], wr, shape === 'pair' ? 2 : 4),
      steps: namedSteps(it).concat([pr[2]]), hint: 'Find the faulty step first. Then ask what job it does.' };
  }));

  // ---- good reasoning that looks like a fallacy
  var FAIRKEYS = ORDER.filter(function (k) { return FB[k] && FB[k].fair.length && k !== 'ac' && k !== 'da'; });
  G('informal.fallacy-or-not', tidy(function (R, ctx) {
    var key = R.pick(FAIRKEYS), fair = R.chance(ctx.level === 1 ? 0.5 : 0.6), it = fItem(R, key, fair);
    var like = LIKE[key].filter(function (x) { return x !== 'ac' && x !== 'da'; });
    var steps = fair ? [it.why, 'It may look like ' + FN[key].toLowerCase() + ', but the faulty step is missing: nothing here ' + JOB[key].replace(/^it /, '') + '.'] : namedSteps(it);
    if (ctx.level === 1) return { q: passageHtml(it.sents) + 'Is this reasoning fair, or is it a fallacy?', a: keepMc(['Fair reasoning', 'A fallacy'], fair ? 0 : 1), steps: steps, hint: 'Each fallacy name fits only if its faulty step is really there.' };
    return { q: passageHtml(it.sents) + 'Does this passage commit a fallacy? If so, which one?', a: mcq(R, fair ? NOF : FN[key], [fair ? FN[key] : NOF, FN[like[0]], FN[like[1]]], 4), steps: steps, hint: 'Each fallacy name fits only if its faulty step is really there.' };
  }));

  // ---- the principle of charity
  var CHA = [ // claim said, charitable reading, straw reading, over-generous (changes the claim)
    { s: '{A}: We should have less homework on weekends.', good: 'Weekend homework should be lighter than it is now, so students have time to rest.', bad: '{A} thinks students should never do any work at all.', over: '{A} thinks homework should be banned on weekdays too.' },
    { s: '{B}: Phones shouldn\'t be used at the dinner table.', good: 'Meals are better for talking when phones are put away.', bad: '{B} wants to take everyone\'s phone away forever.', over: '{B} thinks no one should own a phone.' },
    { s: '{C}: The school should serve more fresh fruit at lunch.', good: 'Adding more fresh fruit to lunch would make meals healthier.', bad: '{C} wants to serve nothing but fruit.', over: '{C} wants the school to grow its own orchard.' },
    { s: '{A}: The town should add a bike lane on Main Street.', good: 'A bike lane on Main Street would make riding there safer.', bad: '{A} wants to ban cars from town.', over: '{A} wants bike lanes on every street in the state.' },
    { s: '{B}: Recess should be a little longer.', good: 'A few more minutes of recess would help students focus afterward.', bad: '{B} thinks school should be all recess.', over: '{B} thinks lunch should be longer too.' },
    { s: '{C}: We should practice passing more before the next {game} game.', good: 'More passing practice would help the team play better.', bad: '{C} thinks the team can\'t do anything right.', over: '{C} wants practice every day of the year.' }
  ];
  var CHA2 = [ // argument with a gap, charitable premise, uncharitable premise
    ['{A}: The {pet} needs a bigger cage. It can barely turn around.', 'An animal that can barely turn around in its cage needs more room.', 'Every animal should live in the biggest cage ever built.'],
    ['{B}: We should leave by seven. The concert starts at eight and the drive is long.', 'Leaving by seven gives enough time for a long drive before an eight o\'clock start.', 'We should always leave an hour before everything, no matter how far away it is.'],
    ['{C}: The library should stay open later. Many students can\'t get there before five.', 'If many students can\'t visit before five, later hours would let them use the library.', 'The library should be open all night, every night.']
  ];
  G('informal.charity', tidy(function (R, ctx) {
    var v = vars(R), shape = pickLevel(R, ctx, ['restate'], ['restate', 'gap'], ['gap', 'restate', 'idea']);
    if (shape === 'idea') {
      var opts = [['Does reading an argument charitably mean you must agree with it?', ['No: you state it fairly, then judge it', 'Yes: charity means agreeing'], 0, 'Charity is about understanding the argument at its best. After that, you may still find it weak.'],
        ['Why read an argument in its strongest reasonable form before judging it?', ['So that if you reject it, you have rejected what was really meant', 'So that you are sure to agree with it'], 0, 'Beating a weak version proves nothing about the real argument; that is the straw man fallacy.']];
      var o = R.pick(opts);
      return { q: o[0], a: keepMc(o[1], o[2]), steps: [o[3]], hint: 'Charity means fairness, not agreement.' };
    }
    if (shape === 'gap') {
      var g = R.pick(CHA2).map(function (x) { return fill(x, v); }), sents = parsePassage(g[0], v);
      return { q: passageHtml(sents) + 'Which unstated premise gives the most charitable reading?', a: mcq(R, g[1], [g[2]], 2),
        steps: ['The charitable premise is the one the speaker would accept and that makes the argument work: ' + lq(esc(g[1])), 'The other is far stronger than needed, which makes the argument look silly.'], hint: 'Pick the premise the speaker would accept that makes the argument as strong as it can fairly be.' };
    }
    var it = R.pick(CHA), sents2 = parsePassage(it.s, v), f = function (x) { return fill(x, v); };
    return { q: passageHtml(sents2) + 'Which restatement is the most charitable?', a: mcq(R, f(it.good), ctx.level === 1 ? [f(it.bad)] : [f(it.bad), f(it.over)], ctx.level === 1 ? 2 : 3),
      steps: ['A charitable restatement keeps what the speaker said and gives it its most reasonable sense: ' + lq(esc(f(it.good))), lq(esc(f(it.bad))) + ' turns the view into an extreme one: that is a straw man.'].concat(ctx.level === 1 ? [] : [lq(esc(f(it.over))) + ' adds a claim the speaker never made.']), hint: 'Which version would the speaker say is fair?' };
  }));

  // ---- evaluating an argument step by step
  var EV = ['Good: it follows, and every premise is true', 'It follows, but a premise is false', 'The premises are true, but it does not follow', 'It does not follow, and a premise is false'];
  G('informal.evaluate-argument', tidy(function (R, ctx) {
    var k = R.int(0, 3), valid = k < 2, want = (k === 0 || k === 2) ? { allT: true } : { someF: true };
    var I = findInst(R, R.pick(valid ? VALID_F : INVALID_F), want) || findInst(R, valid ? 'barbara' : 'undist', want) || findInst(R, 'barbara', {});
    var ans = I.valid ? (I.prT.every(Boolean) ? 0 : 1) : (I.prT.every(Boolean) ? 2 : 3);
    var steps = ['Step 1: the conclusion is ' + lq(esc(I.ctext)), 'Step 2, does it follow? ' + validStep(I), 'Step 3, are the premises true? ' + truthSteps(I).slice(0, I.text.length).join(' '), 'Verdict: ' + EV[ans].toLowerCase() + '.'];
    if (ctx.level >= 2 && R.coin()) {
      return { q: 'Evaluate this argument in two steps.' + argHtml(I), a: { t: 'multi', parts: [
        { label: 'Does the conclusion follow from the premises?', a: keepMc(['Yes', 'No'], I.valid ? 0 : 1) },
        { label: 'Are all the premises true?', a: keepMc(['Yes', 'No'], I.prT.every(Boolean) ? 0 : 1) }] }, steps: steps, hint: 'Ask the two questions separately: does it follow, and are the premises true?' };
    }
    return { q: 'Evaluate this argument.' + argHtml(I), a: keepMc(EV.slice(), ans), steps: steps, hint: 'Ask the two questions separately: does it follow, and are the premises true?' };
  }));

  // ---- objections and replies
  var OBJ = [ // conclusion, P1, P2, linked?, objection to P1, objection to P2, objection to the link
    { c: 'We should hold the class picnic at {place}.', p: ['{place} has covered tables in case of rain.', '{place} is a short walk from school.'], linked: false,
      o: ['The covered tables at {place} were taken down last month.', 'The walk to {place} crosses a busy highway with no crossing, so it is not short in practice.', 'Even if both are true, the picnic budget can\'t pay the fee at {place}.'] },
    { c: '{A} should be the team captain.', p: ['{A} has the most experience on the team.', 'Everyone listens when {A} speaks.'], linked: false,
      o: ['{A} joined the team only this year.', 'Half the team ignores {A} at practice.', 'Even granting both, the captain must be a senior, and {A} is not.'] },
    { c: 'The class should get a {pet} for the classroom.', p: ['A class pet teaches students to take care of animals.', 'The {pet} would be easy to care for over weekends.'], linked: false,
      o: ['Students rarely take part in caring for class pets; the teacher ends up doing it.', 'Nobody can come in to feed the {pet} on weekends.', 'Even if both are true, two students in the class are allergic to it.'] },
    { c: 'The bake sale will make money.', p: ['We will sell {big} cookies.', 'Each cookie costs less to make than its price.'], linked: true,
      o: ['Last year we sold only a few dozen cookies.', 'Butter prices doubled, so each cookie now costs more than its price.', 'Even if we sell them all at a profit, the table rental fee is larger than the profit.'] }
  ];
  var OBJL = ['Premise 1', 'Premise 2', 'The link from the premises to the conclusion'];
  G('informal.objections', tidy(function (R, ctx) {
    var v = vars(R), it = R.pick(OBJ), f = function (x) { return fill(x, v); };
    var arg = q('<b>P1.</b> ' + esc(f(it.p[0])) + '<br><b>P2.</b> ' + esc(f(it.p[1])) + '<br><b>So:</b> ' + esc(f(it.c)));
    var shape = pickLevel(R, ctx, ['target'], ['target', 'defeat'], ['defeat', 'target']);
    if (shape === 'defeat') {
      var k = R.int(0, 1), conv = !it.linked;
      return { q: 'Here is an argument.' + arg + 'Suppose this objection is right: ' + i(esc(f(it.o[k]))) + ' Does the conclusion lose all of its support?',
        a: keepMc(['No: the other premise still gives a separate reason', 'Yes: the argument no longer supports its conclusion'], conv ? 0 : 1),
        steps: ['The objection knocks out premise ' + (k + 1) + '.', conv ? 'The premises are convergent: each is a separate reason. Premise ' + (2 - k) + ' still supports the conclusion, though the case is weaker.' : 'The premises are linked: they work only together. Without premise ' + (k + 1) + ', the support is gone.'], hint: 'Are the premises linked or convergent?' };
    }
    var j = R.int(0, 2);
    return { q: 'Here is an argument.' + arg + 'What does this objection attack?' + q(esc(f(it.o[j]))), a: keepMc(OBJL.slice(), j),
      steps: [j < 2 ? 'The objection says premise ' + (j + 1) + ' is false.' : 'The objection grants the premises ("even if…") and says the conclusion still does not follow, because something else matters.', 'So it attacks ' + OBJL[j].toLowerCase() + '.'], hint: 'Does it deny a premise, or grant the premises and deny that the conclusion follows?' };
  }));


})(typeof window !== 'undefined' ? window.MathLadder : global.MathLadder);

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
  var TABS = [{"k":"informal.causal-reasoning#3","h":["Pattern","Other explanation","Kind"],"r":[["Ice cream sales and sunburns rise together","Hot, sunny weather causes both","Common cause"],["Towns with more firefighters have more fires","More fires lead to hiring more firefighters","Reversed direction"],["The team won the day Kai wore green socks","Socks can't change a game","Coincidence"]],"cap":"Three other stories to check.","m":[[0,1,"Two things happen together: {a}. What is a better explanation?",0,"a pattern with another explanation"],[0,2,"What kind of causal mistake might this be: {a}?",0,0,2]]},
    {"k":"informal.ambiguity-vagueness#3","h":["Sentence","Word","Kind"],"r":[["\"I found a bat under the porch.\"","bat","Ambiguous: an animal or a baseball bat"],["\"The team needs a tall player.\"","tall","Vague: no exact height where tall begins"],["\"Meet me at the bank.\"","bank","Ambiguous: a money bank or a riverbank"],["\"Bring a few snacks.\"","few","Vague: three? six?"]],"cap":"Two meanings versus a blurry edge.","m":[[0,2,"Which word makes this unclear, and how: {a}",0,"a sentence with its unclear word"],[0,1,"Which word makes this sentence unclear: {a}",0]]},
    {"k":"informal.definition-rules#3","h":["Definition","Fault"],"r":[["A dog is an animal with four legs","Too broad: cats have four legs"],["A bird is an animal with feathers that can fly","Too narrow: penguins are birds"],["A teacher is a person who teaches","Circular"],["A circle is a shape that is not a square","Negative"],["Music is the language of the heart","Figurative"]],"cap":"One example of each fault.","m":[[0,1,"What is wrong with this definition: {a}",0,"a definition with its fault"]]},
    {"k":"informal.explanations#3","h":["","Argument","Explanation"],"r":[["The main claim is…","in doubt","already accepted"],["The \"because\" part gives…","evidence","a cause or reason why"],["Its job is to…","convince","help you understand"]],"cap":"Two jobs for \"because\".","one":"Argument or explanation: which does this describe?","all":"Which of these describe an {a:l}? Choose all that apply."}];
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
  var CFG = {"prefix":"informal.","only":["statements","arguments","explanations","indicator-words","argument-maps","subarguments","unstated-premises","deductive-inductive","soundness","validity-truth-combos","inductive-strength","causal-reasoning","ambiguity-vagueness","kinds-of-definitions","definition-rules","loaded-language","fallacy-intro","appeal-to-popularity","appeal-to-authority","appeal-to-ignorance","false-dilemma","false-cause","slippery-slope","weak-analogy","suppressed-evidence","equivocation","amphiboly","composition","division","conditional-fallacies","objections"]};
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
