/* Manners for Young Children (Etiquette Ladder, course key young): problem generators for all 45 topics.
   Built from /tmp/work_etiquette/young/gen/*.js by build_gen.sh (do not edit the shipped file by hand).
   Read-aloud problems for ages 4 to 8: one short sentence, words a five-year-old knows, two or three choices, a "Read to me"
   note for the grown-up at the top, and a quiet picture (et-scene, et-order, et-posture, et-setting or et-note).
   Scenes are original; the people come from the kit's cast (MathLadder.etiquette.CAST) and are drawn at random, so problems
   vary. Shapes by level:
     level 1  a scene and two choices (the kind one and a plainly rude one), or "Is that polite?" with Yes / No
     level 2  three choices whose wrong ones match the topic's trouble note (the right words at the wrong moment), or Yes / No
              about one of those near misses; ordering topics ask "What comes next?"
     level 3  "Choose all that are polite" from four, or three close choices; ordering topics show the lettered steps and ask
              which order is right
   Only well-established manners have a single right answer. Where families differ (what to call grown-ups, house rules,
   how a meal starts, who answers the phone), problems ask about the reason or offer several polite answers. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;

  // ---------------------------------------------------------------- the cast (from the kit when it is loaded)
  var KIDS = ['mia', 'leo', 'sam', 'ruby', 'omar', 'hana'];
  var FALL = { mia: ['Mia', 'she'], leo: ['Leo', 'he'], sam: ['Sam', 'he'], ruby: ['Ruby', 'she'], omar: ['Omar', 'he'], hana: ['Hana', 'she'],
    june: ['Grandma June', 'she'], walt: ['Grandpa Walt', 'he'], park: ['Ms. Park', 'she'], diaz: ['Mr. Diaz', 'he'], bell: ['Dr. Bell', 'she'],
    rosa: ['Rosa', 'she'], kofi: ['Kofi', 'he'], nora: ['Nora', 'she'], james: ['James', 'he'], priya: ['Priya', 'she'] };
  function cast(k) {
    var E = ML.etiquette, c = E && E.CAST && E.CAST[k];
    return c ? { name: c.name, pr: c.pronoun } : { name: FALL[k][0], pr: FALL[k][1] };
  }
  var PR = { she: { he: 'she', He: 'She', his: 'her', him: 'her', self: 'herself' }, he: { he: 'he', He: 'He', his: 'his', him: 'him', self: 'himself' } };
  // grown-ups by setting: { who, label (shown and said), call (what the child calls them) }
  var FAMILY = [{ who: 'june', label: 'Grandma June' }, { who: 'walt', label: 'Grandpa Walt' }, { who: 'rosa', label: 'Mom' }, { who: 'kofi', label: 'Dad' }, { who: 'rosa', label: 'Aunt Rosa' }];
  var COOKS = FAMILY;
  var TEACHER = [{ who: 'park', label: 'Ms. Park' }];
  var NEIGHBOR = [{ who: 'diaz', label: 'Mr. Diaz' }, { who: 'june', label: 'Mrs. Hale' }, { who: 'walt', label: 'Mr. Hale' }];
  var DOCTOR = [{ who: 'bell', label: 'Dr. Bell' }];
  var HOSTP = [{ who: 'rosa', rel: 'mom' }, { who: 'kofi', rel: 'dad' }];

  // ---------------------------------------------------------------- small helpers
  var READ = '<p class="et-readme"><b>Read to me</b> Read the question and the choices aloud.</p>';
  function big(s) { return '<span class="et-big">' + s + '</span>'; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function fill(s, v) {
    if (s == null) return '';
    if (typeof s === 'function') s = s(v);
    s = String(s);
    for (var t = 0; t < 3 && /\{\w+\}/.test(s); t++) s = s.replace(/\{(\w+)\}/g, function (m, k) { return v[k] !== undefined ? v[k] : m; });
    return s;
  }
  function txt(x) { return typeof x === 'string' ? x : x[0]; }
  function why(x) { return typeof x === 'string' ? '' : (x[1] || ''); }
  function setKid(v, L, k) {
    var c = cast(k), p = PR[c.pr];
    v[L.toLowerCase()] = k; v[L] = c.name;
    v[L + '_he'] = p.he; v[L + '_He'] = p.He; v[L + '_his'] = p.his; v[L + '_His'] = cap(p.his); v[L + '_him'] = p.him; v[L + '_self'] = p.self;
  }
  function setGrown(v, L, g) {
    var c = cast(g.who), p = PR[c.pr];
    v[L.toLowerCase()] = g.who; v[L] = g.label; v[L + '_he'] = p.he; v[L + '_He'] = p.He; v[L + '_his'] = p.his; v[L + '_him'] = p.him;
  }
  // fresh variables: A, B, C (children), G (a grown-up from a pool), plus each scenario's own picks
  function vars(R, S) {
    var ks = R.sample(KIDS, 3), v = {};
    setKid(v, 'A', ks[0]); setKid(v, 'B', ks[1]); setKid(v, 'C', ks[2]);
    if (S.g) setGrown(v, 'G', R.pick(S.g));
    if (S.host) { var hp = R.pick(HOSTP); setGrown(v, 'H', { who: hp.who, label: v.B + '\'s ' + hp.rel }); v.Hrel = hp.rel; }
    if (S.pick) Object.keys(S.pick).forEach(function (k) {
      var it = R.pick(S.pick[k]);
      if (typeof it === 'string') v[k] = it; else Object.keys(it).forEach(function (f) { v[f === '_' ? k : k + '_' + f] = it[f]; });
    });
    return v;
  }
  function P(who, o) { return Object.assign({ who: who }, o || {}); }
  // the picture: a quiet, still et-scene in big type
  function picture(S, v) {
    var o = { place: typeof S.place === 'function' ? S.place(v) : S.place, people: S.people(v), big: true, quiet: true, interactive: false };
    if (S.say) o.say = S.say.map(function (s) { return [s[0], fill(s[1], v)]; });
    if (S.think) o.think = S.think.map(function (s) { return [s[0], fill(s[1], v)]; });
    if (S.props) o.props = typeof S.props === 'function' ? S.props(v) : S.props;
    if (S.narr) o.narr = fill(S.narr, v);
    o.label = 'A picture for the question.';
    return { name: 'et-scene', opts: o };
  }
  var YN = ['Yes, that is polite.', 'No, that is not polite.'];

  /* A scenario S:
       place, people(v) → persons, say / think [[i, text]], props, narr     the picture
       g (a grown-up pool), host: true (B's mom or dad as H), pick: { key: [values or objects] }   variables
       setup   the sentence that sets the scene;  q   the question (default "What should {A} do?")
       good    polite choices (full sentences);  bad   plainly rude ones;  near   near misses from the trouble note
               (each a string or [text, reason]);  why   why the polite choice is kind;  hint   one nudge
       yn      false: never ask "Is that polite?" (when the choices only make sense side by side)
       allq    the question for "choose all" (default "Which are polite? Choose all that are polite.")         */
  function scen(R, ctx, S, force) {
    var v = vars(R, S), L = ctx.level || 1;
    var good = S.good.map(function (x) { return [fill(txt(x), v), fill(why(x), v)]; });
    var bad = (S.bad || []).map(function (x) { return [fill(txt(x), v), fill(why(x), v)]; });
    var near = (S.near || []).map(function (x) { return [fill(txt(x), v), fill(why(x), v)]; });
    var setup = fill(S.setup, v), q = fill(S.q || 'What should {A} do?', v), reason = fill(S.why, v);
    var shape = force;
    if (!shape) {
      if (L === 1) shape = S.yn !== false && R.chance(0.3) ? 'yn' : 'two';
      else if (L === 2) shape = S.yn !== false && near.length && R.chance(0.25) ? 'yn' : 'three';
      else shape = good.length >= 2 && bad.length + near.length >= 2 && R.chance(0.6) ? 'all' : 'three';
    }
    var p = { viz: picture(S, v), hint: fill(S.hint || 'Which choice is kind to everyone there?', v) };
    var steps = [];
    if (shape === 'yn') {
      var polite = L === 1 ? R.coin() : R.chance(0.35);
      var pool = polite ? good : (L === 1 || !near.length ? bad : near);
      if (!pool.length) { pool = good; polite = true; }
      var it = R.pick(pool);
      var yno = S.yno || YN;
      p.q = READ + big(setup + ' ' + it[0] + ' ' + (S.ynq || 'Is that polite?'));
      p.a = { t: 'mc', choices: yno.slice(), v: polite ? 0 : 1, keep: true };
      steps.push(polite ? yno[0] : yno[1]);
      if (it[1]) steps.push(it[1]);
      if (!polite) steps.push((S.yesLabel || 'Polite: ') + good[0][0]);
      steps.push(reason);
    } else if (shape === 'all') {
      var g2 = R.sample(good, Math.min(2, good.length)), others = R.sample(near.concat(bad), Math.min(4 - g2.length, near.length + bad.length));
      var list = g2.map(function (x) { return [x, true]; }).concat(others.map(function (x) { return [x, false]; }));
      list = R.shuffle(list);
      p.q = READ + big(setup + ' ' + fill(S.allq || 'Which are polite? Choose all that are polite.', v));
      p.a = { t: 'mc', choices: list.map(function (x) { return x[0][0]; }), v: list.map(function (x, i) { return x[1] ? i : -1; }).filter(function (i) { return i >= 0; }) };
      g2.forEach(function (x) { steps.push((S.yesLabel || 'Polite: ') + x[0]); });
      others.forEach(function (x) { steps.push('Not this one: ' + x[0] + (x[1] ? ' ' + x[1] : '')); });
      steps.push(reason);
    } else {
      var right = R.pick(good), wrong;
      if (shape === 'two') wrong = [bad.length ? R.pick(bad) : R.pick(near)];
      else {
        var n1 = near.length ? [R.pick(near)] : [], rest = near.concat(bad).filter(function (x) { return n1.indexOf(x) < 0; });
        wrong = n1.concat(R.sample(rest, Math.min(2 - n1.length, rest.length)));
      }
      var ch = R.shuffle([right].concat(wrong));
      p.q = READ + big(setup + ' ' + q);
      p.a = { t: 'mc', choices: ch.map(function (x) { return x[0]; }), v: ch.indexOf(right) };
      steps.push((S.rightLabel || 'The polite choice: ') + right[0]);
      steps.push(right[1] || reason);
      wrong.forEach(function (x) { if (x[1]) steps.push('Not this one: ' + x[0] + ' ' + x[1]); });
      if (right[1] && reason) steps.push(reason);
    }
    p.steps = steps.filter(Boolean);
    return p;
  }
  // a topic made of scenarios: pick one at random (S.lv: the lowest level a scenario is used at)
  function topic(id, list, extra) {
    G(id, function (R, ctx) {
      var L = ctx.level || 1;
      if (extra && R.chance(extra.p || 0.3) && (!extra.min || L >= extra.min)) return extra.fn(R, ctx);
      var ok = list.filter(function (S) { return !S.lv || S.lv <= L; });
      return scen(R, ctx, R.pick(ok));
    });
  }

  /* Ordering problems. O = { items: [steps in order, with {A} etc.], setup, title, people/place for a picture (optional), pick, g }
       level 1: "What comes first?" (three choices)    level 2: "First … What comes next?" (three choices)
       level 3: the steps lettered (quiet et-order) and "Which order is right?" (three orders)                      */
  function order(R, ctx, O) {
    var v = vars(R, O), L = ctx.level || 1, items = O.items.map(function (s) { return fill(s, v); }), n = items.length;
    var setup = fill(O.setup, v), steps = [], p = { hint: fill(O.hint || 'Think about what has to happen before anything else.', v) };
    if (L === 1) {
      var others = R.sample(items.slice(1), 2), ch = R.shuffle([items[0]].concat(others));
      p.q = READ + big(setup + ' What comes first?');
      p.a = { t: 'mc', choices: ch, v: ch.indexOf(items[0]) };
      if (O.people) p.viz = picture(O, v);
    } else if (L === 2) {
      var i = R.int(0, n - 2), nxt = items[i + 1], pool = items.filter(function (s, j) { return j !== i && j !== i + 1; });
      var ch2 = R.shuffle([nxt].concat(R.sample(pool, Math.min(2, pool.length))));
      p.q = READ + big(setup + (i === 0 ? ' First: ' : ' Just now: ') + items[i] + ' What comes next?');
      p.a = { t: 'mc', choices: ch2, v: ch2.indexOf(nxt) };
      if (O.people) p.viz = picture(O, v);
    } else {
      var idx = []; for (var k = 0; k < n; k++) idx.push(k);
      var start; do { start = R.shuffle(idx); } while (start.every(function (x, j) { return x === j; }));
      var letters = 'ABCDEFG', right = idx.map(function (ix) { return letters[start.indexOf(ix)]; }).join(', ');
      // two wrong orders: swap two neighbors of the right order, or move the last step first
      var wrongs = [];
      for (var t = 0; t < 40 && wrongs.length < 2; t++) {
        var o2 = idx.slice(); if (R.coin()) { var s = R.int(0, n - 2), tmp = o2[s]; o2[s] = o2[s + 1]; o2[s + 1] = tmp; } else { o2 = [o2[n - 1]].concat(o2.slice(0, n - 1)); }
        var w = o2.map(function (ix) { return letters[start.indexOf(ix)]; }).join(', ');
        if (w !== right && wrongs.indexOf(w) < 0) wrongs.push(w);
      }
      var ch3 = R.shuffle([right].concat(wrongs));
      p.q = READ + big(setup + ' Which order is right?');
      p.a = { t: 'mc', choices: ch3, v: ch3.indexOf(right) };
      p.viz = { name: 'et-order', opts: { items: items, start: start, quiet: true, interactive: false, big: true, title: fill(O.title || 'The steps', v), label: 'Steps in a mixed-up order, lettered A to ' + letters[n - 1] + '.' } };
      steps.push('The right order is ' + right + '.');
    }
    steps.push('In order: ' + items.map(function (s, j) { return (j + 1) + '. ' + s; }).join(' '));
    steps.push(fill(O.why, v));
    p.steps = steps;
    return p;
  }
  function orderTopic(id, O, list) { // ordering problems, mixed with scenarios when there are any
    G(id, function (R, ctx) {
      var L = ctx.level || 1, ok = (list || []).filter(function (S) { return !S.lv || S.lv <= L; });
      if (ok.length && R.chance(0.5)) return scen(R, ctx, R.pick(ok));
      return order(R, ctx, Array.isArray(O) ? R.pick(O) : O);
    });
  }

  // common pools
  var TOYS = [{ _: 'the blocks', prop: 'blocks' }, { _: 'the toy truck', prop: 'toy' }, { _: 'the ball', prop: 'ball' }, { _: 'the crayons', prop: 'crayons' }, { _: 'the kite', prop: 'kite' }, { _: 'the book', prop: 'book' }];
  var FOODS = ['peas', 'carrots', 'rice', 'beans', 'corn', 'potatoes', 'pasta', 'salad'];
  var GIFTS = [{ _: 'a kite', prop: 'kite' }, { _: 'a book', prop: 'book' }, { _: 'a ball', prop: 'ball' }, { _: 'a toy truck', prop: 'toy' }, { _: 'some crayons', prop: 'crayons' }];
  var GAMES = ['tag', 'hide-and-seek', 'catch', 'hopscotch', 'jump rope', 'a board game'];

  // ================================================================ Unit 1: Kind Words
  topic('young.please', [
    { place: 'kitchen', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G, holds: 'plate' })]; },
      pick: { snack: ['a cracker', 'an apple slice', 'a piece of cheese', 'a muffin'] },
      setup: "{A} wants {snack}. {G} has the plate.",
      good: ["{A} says, “May I have {snack}, please?”", "{A} smiles and says, “Please may I have {snack}?”"],
      bad: ["{A} says, “Give me {snack}!”", "{A} grabs from the plate."],
      near: [["{A} whines, “Pleeease! I want it NOW!”", "A whiny or bossy please still sounds like an order."], ["{A} just says, “{snack}.”", "One word is telling, not asking."]],
      why: "Please turns telling into asking. It shows {A} knows {G} is doing something kind." },
    { place: 'classroom', people: function (v) { return [P(v.a), P(v.b, { holds: 'crayons' })]; },
      setup: "{A} needs a red crayon. {B} has the crayons.",
      good: ["{A} asks, “May I use the red one, please?”", "{A} says, “Please can I borrow red?”"],
      bad: ["{A} takes the red crayon without asking.", "{A} yells, “Give it to me!”"],
      near: [["{A} waits for a grown-up to say, “What do you say?”", "Please works best when we say it right away, without a reminder."], ["{A} says, “I need red. Now.”", "That is telling, not asking."]],
      why: "Asking with please lets {B} choose to share. That is kinder than taking or telling." },
    { place: 'park', people: function (v) { return [P(v.a), P(v.b, { holds: 'kite' })]; },
      setup: "{A} wants a turn with the kite. {B} is flying it.",
      good: ["{A} asks, “May I have a turn when you're done, please?”", "{A} says, “Please can I fly it next?”"],
      bad: ["{A} grabs the kite string and says, “Give it!”", "{A} pushes {B}."],
      near: [["{A} stamps {A_his} foot and shouts, “PLEASE!”", "A shouted please sounds cross. A friendly voice makes it kind."]],
      why: "Please is a friendly way to ask. It lets {B} finish and know {A} will wait." },
    { place: 'table', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G })]; },
      setup: "{A} wants more milk. {G} has the jug.",
      good: ["{A} says, “May I have more milk, please?”", "{A} asks, “More milk, please?” in a friendly voice."],
      bad: ["{A} bangs the cup and says, “More!”", "{A} reaches across and grabs the jug."],
      near: [["{A} holds up the cup and says nothing.", "Asking with words, and with please, is kinder than waiting for someone to guess."]],
      why: "We ask with please because {G} is helping. Please says, “I know you don't have to.”" }
  ]);

  topic('young.thank-you', [
    { place: 'kitchen', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G, pose: 'give', holds: 'cup' })]; },
      say: [[1, "Here is your milk."]],
      setup: "{G} pours {A} a cup of milk.", q: "What should {A} say?",
      good: ["{A} says, “Thank you, {G}!”", "{A} smiles and says, “Thanks for the milk!”"],
      bad: ["{A} takes the cup and walks away.", "{A} says, “Ew, not that cup.”"],
      near: [["{A} says, “Please.”", "Please is for asking. After someone helps, we say thank you."], ["{A} thinks, “It's not a present, so I don't need to say thanks.”", "Thank you is for help too, not only for presents."]],
      why: "Thank you tells {G} that {A} noticed the help." },
    { place: 'door', people: function (v) { return [P(v.a), P(v.b, { pose: 'wave' })]; },
      setup: "{B} holds the door open for {A}.", q: "What should {A} say?",
      good: ["{A} says, “Thanks, {B}!”", "{A} smiles and says, “Thank you for holding the door.”"],
      bad: ["{A} rushes through without a word.", "{A} says, “Hurry up!”"],
      near: [["{A} says, “You're welcome!”", "{B} did the kind thing, so {A} says thank you. You're welcome is the answer to a thank you."], ["{A} says nothing, because it is only a door.", "Small help counts too. A quick thanks is all it takes."]],
      why: "Holding a door is a kind thing. Thank you lets {B} know {A} saw it." },
    { place: 'classroom', people: function (v) { return [P(v.a, { mood: 'surprised' }), P(v.b, { pose: 'give', holds: 'crayons' })]; },
      setup: "{A} drops {A_his} crayons. {B} helps pick them up.", q: "What should {A} say?",
      good: ["{A} says, “Thank you for helping, {B}!”", "{A} says, “Thanks, {B}. That was kind.”"],
      bad: ["{A} snatches the crayons and turns away.", "{A} says, “Those are mine. Don't touch.”"],
      near: [["{A} says, “Please.”", "{B} already helped. Now it is time for thank you."]],
      why: "{B} stopped to help. Thank you shows {A} noticed." },
    { place: 'classroom', g: TEACHER, people: function (v) { return [P(v.a), P(v.g, { name: v.G, pose: 'give' })]; },
      pick: { help: ['zips {A_his} coat', 'ties {A_his} shoe', 'opens {A_his} lunch box', 'finds {A_his} lost mitten'] },
      setup: "{G} {help}.", q: "What should {A} say?",
      good: ["{A} says, “Thank you, {G}.”", "{A} says, “Thanks for helping me, {G}.”"],
      bad: ["{A} runs off to play without a word.", "{A} says, “You took too long.”"],
      near: [["{A} says, “You're welcome.”", "{A} got the help, so {A} says thank you."]],
      why: "Grown-ups help us many times a day. Thank you lets them know we noticed." },
    { place: 'home', g: FAMILY, pick: { gift: GIFTS }, people: function (v) { return [P(v.a), P(v.g, { name: v.G, pose: 'give', holds: v.gift_prop })]; },
      setup: "{G} gives {A} {gift}.", q: "What should {A} say?",
      good: ["{A} says, “Thank you, {G}! I like it.”", "{A} looks at {G} and says, “Thank you so much!”"],
      bad: ["{A} grabs it and runs off.", "{A} says, “Is that all?”"],
      near: [["{A} says, “Please.”", "Please is for asking. When we get a gift, we say thank you."]],
      why: "{G} chose the gift for {A}. Thank you shows {A} is glad {G} thought of {A_him}." }
  ]);

  topic('young.youre-welcome', [
    { place: 'classroom', people: function (v) { return [P(v.a, { pose: 'give', holds: 'crayons' }), P(v.b)]; },
      say: [[1, "Thank you, {A}!"]],
      setup: "{A} lends {B} a crayon. {B} says, “Thank you!”", q: "What should {A} say?",
      good: ["{A} says, “You're welcome!”", "{A} smiles and says, “Glad to help!”"],
      bad: ["{A} says, “You owe me.”", "{A} rolls {A_his} eyes."],
      near: [["{A} says, “Thank you!” back.", "Thank you back does not finish the talk. You're welcome does."], ["{A} turns away and says nothing.", "Saying nothing can feel like the thank-you was not heard."]],
      why: "You're welcome finishes the kind moment, so the kindness goes both ways." },
    { place: 'kitchen', g: FAMILY, people: function (v) { return [P(v.a, { holds: 'bag' }), P(v.g, { name: v.G })]; },
      say: [[1, "Thank you for helping, {A}!"]],
      setup: "{A} helps {G} carry a bag. {G} says, “Thank you for helping!”", q: "What should {A} say?",
      good: ["{A} says, “You're welcome!”", "{A} says, “Glad to help, {G}!”"],
      bad: ["{A} drops the bag and runs off.", "{A} says, “That was heavy. You owe me a treat.”"],
      near: [["{A} says, “Please.”", "Please is for asking. When someone thanks you, you say you're welcome."], ["{A} shrugs and says nothing.", "A short answer lets {G} know {A} heard."]],
      why: "When someone thanks us, a short “You're welcome” answers them kindly." },
    { place: 'door', g: TEACHER.concat(NEIGHBOR), people: function (v) { return [P(v.a, { pose: 'wave' }), P(v.g, { name: v.G, holds: 'bag' })]; },
      say: [[1, "Thank you, {A}."]],
      setup: "{A} holds the door for {G}. {G} says, “Thank you.”", q: "What should {A} say?",
      good: ["{A} says, “You're welcome.”", "{A} smiles and says, “You're welcome!”"],
      bad: ["{A} lets the door go and runs away.", "{A} says, “Hurry up.”"],
      near: [["{A} says, “Thank you!” back.", "{G} said thank you, so the answer is you're welcome."]],
      why: "You're welcome tells {G} that {A} was happy to help." },
    { place: 'park', people: function (v) { return [P(v.a, { pose: 'give', holds: 'ball' }), P(v.c)]; },
      say: [[1, "Thanks, {A}!"]],
      setup: "{A} gets {C}'s ball back. {C} says, “Thanks, {A}!”", q: "What should {A} say?",
      good: ["{A} says, “You're welcome!”", "{A} says, “Sure! Glad to help.”"],
      bad: ["{A} throws the ball hard at {C}.", "{A} says, “Get your own ball next time.”"],
      near: [["{A} says nothing and walks away.", "A friendly answer makes the thank-you feel heard."]],
      why: "Answering a thank-you with “You're welcome” keeps the kindness going." }
  ]);

  topic('young.excuse-me', [
    { place: 'store', people: function (v) { return [P(v.a), P('kofi', { name: 'Shopper' }), P('priya', { name: 'Shopper' })]; },
      setup: "Two shoppers stand in the way. {A} needs to get past.",
      good: ["{A} says, “Excuse me,” and waits for room.", "{A} says, “Excuse me, please,” and walks by gently."],
      bad: ["{A} pushes between them.", "{A} shouts, “Move!”"],
      near: [["{A} squeezes past without a word.", "Excuse me tells people you need room, so nobody gets bumped."]],
      why: "Excuse me asks for room in a kind way." },
    { place: 'park', people: function (v) { return [P(v.a, { mood: 'surprised' }), P(v.c, { mood: 'surprised' })]; },
      setup: "{A} is running and bumps into {C} by accident.", q: "What should {A} say?",
      good: ["{A} stops and says, “Oops! Excuse me. Are you okay?”", "{A} says, “Excuse me! I'm sorry I bumped you.”"],
      bad: ["{A} keeps running.", "{A} says, “Watch where you're going!”"],
      near: [["{A} laughs and runs on.", "Stopping to say excuse me shows {A} cares if {C} is okay."]],
      why: "After a bump, excuse me (or sorry) shows we care about the other person." },
    { place: 'table', g: FAMILY, people: function (v) { return [P(v.a, { mood: 'surprised' }), P(v.g, { name: v.G }), P(v.b)]; },
      setup: "Oops! {A} burps at the table.", q: "What should {A} say?",
      good: ["{A} covers {A_his} mouth and says, “Excuse me.”", "{A} quietly says, “Excuse me.”"],
      bad: ["{A} laughs and burps again.", "{A} says, “That was a big one! Listen!”"],
      near: [["{A} says nothing and hopes no one heard.", "A quiet excuse me is all it takes, and then the meal goes on."]],
      why: "Burps happen. A quiet excuse me is polite, and then we move on." },
    { place: 'home', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G }), P('nora', { name: 'Friend' })]; },
      setup: "{G} is talking with a friend. {A} wants to ask something.",
      good: ["{A} waits for a pause, says, “Excuse me,” and waits.", "{A} stands quietly until {G} looks at {A_him}."],
      bad: ["{A} yells, “{G}! {G}! {G}!”", "{A} pulls on {G}'s arm and talks over them."],
      near: [["{A} says, “Excuse me!” and starts talking right away.", "Excuse me does not mean “talk now.” Say it, then wait."]],
      why: "Excuse me asks for a turn to talk. Waiting after it is the polite part.", lv: 2 }
  ]);

  var SORRY = [
    { pick: { thing: [{ _: 'tower', did: 'knocked over', fix: 'help build it again' }, { _: 'drawing', did: 'spilled juice on', fix: 'help wipe it up' }, { _: 'sandcastle', did: 'stepped on', fix: 'help fix it' }] },
      setup: "{A} {thing_did} {B}'s {thing} by accident.",
      items: ["{A} looks at {B}.", "{A} says, “I'm sorry I {thing_did} your {thing}.”", "{A} asks, “Can I {thing_fix}?”"],
      why: "Looking at {B} shows {A} means it. Saying what happened shows {A} understands. Helping makes it better." },
    { pick: { thing: [{ _: 'blocks', did: 'bumped', fix: 'help stack them' }, { _: 'puzzle', did: 'mixed up', fix: 'help put it back' }] },
      setup: "{A} {thing_did} {B}'s {thing} by accident.",
      items: ["{A} stops playing.", "{A} looks at {B} and says, “I'm sorry I {thing_did} your {thing}.”", "{A} asks, “Can I {thing_fix}?”", "{A} helps until it is fixed."],
      why: "A good sorry stops, names what happened, and helps make it right." }
  ];
  orderTopic('young.sorry', SORRY, [
    { place: 'home', people: function (v) { return [P(v.a, { mood: 'worried' }), P(v.b, { mood: 'sad' })]; }, props: [{ kind: 'blocks', x: 300, y: 224 }],
      setup: "{A} knocks over {B}'s tower by accident. {B} is sad.",
      good: ["{A} looks at {B} and says, “I'm sorry I knocked it over. Can I help fix it?”", "{A} says, “I'm sorry, {B}. Let me help you build it again.”"],
      bad: ["{A} laughs and runs away.", "{A} says, “It was ugly anyway.”"],
      near: [["{A} mumbles, “Sorry,” and keeps playing.", "A quick sorry without looking or helping does not show {A} cares."], ["{A} says, “It was an accident, so it's not my fault.”", "Even an accident can hurt. Sorry still helps."]],
      why: "A real sorry says what happened and tries to help." },
    { place: 'park', people: function (v) { return [P(v.a, { mood: 'worried' }), P(v.c, { mood: 'sad' })]; },
      setup: "{A} steps on {C}'s foot by accident. {C} says, “Ow!”",
      good: ["{A} says, “I'm sorry I stepped on your foot. Are you okay?”", "{A} stops, looks at {C}, and says, “I'm so sorry. Are you all right?”"],
      bad: ["{A} says, “Move your foot next time.”", "{A} keeps running."],
      near: [["{A} shouts, “Sorry!” over {A_his} shoulder and runs on.", "Stopping and looking at {C} shows {A} means it."]],
      why: "We say sorry for accidents too, because the other person still got hurt." }
  ]);

  topic('young.accepting-apology', [
    { place: 'park', people: function (v) { return [P(v.a, { mood: 'neutral' }), P(v.b, { mood: 'worried' })]; },
      pick: { what: ['took your spot', 'knocked over your tower', 'bumped you', 'grabbed your ball'] },
      say: [[1, "I'm sorry I {what}."]],
      setup: "{B} says, “I'm sorry I {what}.”", q: "What can {A} say?",
      good: ["{A} says, “Thank you for saying sorry.”", "{A} says, “It's okay. Let's play.”", "{A} says, “Thanks. I'm glad you said sorry.”"],
      bad: ["{A} says, “I'm never playing with you again!”", "{A} says, “Go away.”"],
      near: [["{A} crosses {A_his} arms and turns away.", "After a sorry, turning away keeps both friends sad."], ["{A} says, “Say it again, louder!”", "{B} already said sorry. Asking for more makes it a fight again."]],
      why: "When someone says sorry, a kind answer lets you both feel better and move on." },
    { place: 'classroom', people: function (v) { return [P(v.a, { mood: 'sad' }), P(v.b, { mood: 'worried' })]; },
      say: [[1, "I'm sorry I said that."]],
      setup: "{B} says sorry for an unkind word. {A} still feels a little sad.", q: "What can {A} say that is kind and true?",
      good: ["{A} says, “Thank you for saying sorry.”", "{A} says, “Thank you for saying sorry. I'm still a little sad.”"],
      bad: ["{A} says, “You're the meanest person ever.”", "{A} says, “I don't care.”"],
      near: [["{A} says, “I'll tell everyone what you did.”", "That keeps the hurt going. A kind answer lets it get better."]],
      why: "“Thank you for saying sorry” is always kind and always true, even when you still feel sad.", lv: 2 },
    { place: 'home', g: FAMILY, people: function (v) { return [P(v.a), P(v.b, { mood: 'worried' }), P(v.g, { name: v.G })]; },
      say: [[1, "I'm sorry I broke your crayon."]],
      setup: "{B} says, “I'm sorry I broke your crayon.”", q: "What can {A} say?",
      good: ["{A} says, “It's okay. Accidents happen.”", "{A} says, “Thank you for saying sorry.”"],
      bad: ["{A} breaks one of {B}'s crayons back.", "{A} yells, “You owe me ten crayons!”"],
      near: [["{A} stays cross all day.", "Letting it go after a sorry helps you both feel better."]],
      why: "Saying thank you or it's okay lets the sorry do its job." }
  ]);

  topic('young.kind-words', [
    { place: 'classroom', pick: { item: ['new glasses', 'new haircut', 'new shoes', 'new hat'] }, people: function (v) { return [P(v.a), P(v.b, { mood: 'shy' })]; },
      setup: "{B} comes to school with {item}.", q: "What should {A} say?",
      good: ["{A} says, “I like your {item}!”", "{A} says, “Hi, {B}! Those look nice.”"],
      bad: ["{A} points and laughs.", "{A} says, “You look funny.”"],
      near: [["{A} teases {B} and says, “Just joking!”", "If {B} is not laughing too, it is not a joke to {B}."]],
      why: "Kind words help {B} feel good about the new thing." },
    { place: 'park', pick: { game: GAMES }, people: function (v) { return [P(v.a), P(v.b), P(v.c, { mood: 'shy' })]; },
      say: [[2, "Can I play too?"]],
      setup: "{A} and {B} are playing {game}. {C} asks, “Can I play too?”", q: "What should {A} say?",
      good: ["{A} says, “Sure, come play!”", "{A} says, “Yes! You can be on my team.”"],
      bad: ["{A} says, “You can't play.”", "{A} says, “Go away. We don't want you.”"],
      near: [["{A} says, “Maybe,” and turns away.", "Turning away feels like a no. A friendly yes makes {C} feel welcome."]],
      why: "Letting someone play helps everyone feel welcome." },
    { place: 'classroom', people: function (v) { return [P(v.a), P(v.b, { holds: 'card' })]; },
      setup: "{B} shows {A} a picture {B_he} drew.", q: "What should {A} say?",
      good: ["{A} says, “I like the colors you used!”", "{A} says, “Wow, tell me about it.”"],
      bad: ["{A} says, “That's ugly.”", "{A} laughs at it."],
      near: [["{A} says, “Mine is better.”", "Bragging makes {B} feel small."]],
      why: "Kind words about someone's work make them feel proud." },
    { place: 'park', people: function (v) { return [P(v.a, { mood: 'neutral' }), P(v.b, { mood: 'sad' })]; },
      setup: "{A} teased {B}. {B} looks sad. {A} says, “I was just joking.”", q: "What should {A} do now?",
      good: ["{A} says, “I'm sorry. I won't say that again.”", "{A} says, “I'm sorry I teased you.”"],
      bad: ["{A} teases {B} again.", "{A} says, “You're a baby.”"],
      near: [["{A} says, “It's just a joke! Laugh!”", "If {B} is not laughing too, it is not a joke to {B}."]],
      why: "A joke is only a joke when everyone laughs. When someone is hurt, we say sorry.", lv: 2 }
  ]);

  // ================================================================ Unit 2: Hello and Goodbye
  topic('young.saying-hello', [
    { place: 'classroom', g: TEACHER, people: function (v) { return [P(v.a), P(v.g, { name: v.G, pose: 'wave' })]; },
      say: [[1, "Good morning, {A}!"]],
      setup: "{G} says, “Good morning, {A}!”", q: "What should {A} do?",
      good: ["{A} looks at {G}, smiles, and says, “Good morning!”", ["{A} gives a small wave and says a quiet “Hi.”", "A small wave and a quiet hi are a fine hello. Nobody has to be loud."]],
      bad: ["{A} walks past and says nothing.", "{A} says, “Leave me alone.”"],
      near: [["{A} looks at the floor and says nothing.", "Feeling shy is okay. A small wave or a quiet hi lets {G} know {A} heard."]],
      why: "Answering a hello lets the other person know we are glad to see them." },
    { place: 'street', g: NEIGHBOR, people: function (v) { return [P(v.a), P(v.g, { name: v.G, pose: 'wave' })]; },
      setup: "{A} sees {G}, a neighbor. {G} waves.", q: "What should {A} do?",
      good: ["{A} waves back and says, “Hi, {G}!”", "{A} smiles and says, “Hello, {G}.”"],
      bad: ["{A} sticks out {A_his} tongue.", "{A} turns away."],
      near: [["{A} keeps walking and doesn't look up.", "A wave back is an easy, friendly hello."]],
      why: "A hello tells neighbors we are happy to see them." },
    { place: 'door', g: FAMILY, people: function (v) { return [P(v.a, { pose: 'wave' }), P(v.g, { name: v.G, pose: 'wave' })]; },
      setup: "{G} comes to visit. {A} opens the door with a grown-up.", q: "What should {A} say?",
      good: ["{A} smiles and says, “Hi, {G}! Come in!”", "{A} says, “Hello, {G}! I'm glad you came.”"],
      bad: ["{A} runs back to the TV without a word.", "{A} says, “What do you want?”"],
      near: [["{A} hides behind the door and won't come out.", "It's okay to feel shy. A small wave is a fine start."]],
      why: "Saying hello to a visitor makes them feel welcome." },
    { place: 'party', people: function (v) { return [P(v.a), P(v.b, { holds: 'gift' })]; },
      setup: "{B} comes to {A}'s party.", q: "What should {A} say?",
      good: ["{A} says, “Hi, {B}! I'm glad you came.”", "{A} waves and says, “Hi, {B}!”"],
      bad: ["{A} grabs the gift and runs off.", "{A} says, “You're late.”"],
      near: [["{A} keeps playing and doesn't look at {B}.", "Looking at {B} and saying hi shows {A} is glad {B} came."]],
      why: "A friendly hello makes a guest feel welcome." }
  ]);

  topic('young.greeting-choices', [
    { place: 'door', g: FAMILY, people: function (v) { return [P(v.a, { mood: 'shy' }), P(v.g, { name: v.G })]; },
      say: [[1, "Can I have a hug?"]],
      setup: "{G} asks, “Can I have a hug?” {A} doesn't feel like a hug today.", q: "What is a polite thing {A} can do?",
      good: ["{A} says, “Can I give you a high five instead?”", "{A} waves and says, “Hi, {G}!”", "{A} smiles and says, “Hello!” instead of a hug.", "{A} gives a handshake and says hello."],
      bad: ["{A} says, “Ew, no!”", "{A} sticks out {A_his} tongue."],
      why: "There are many polite ways to say hello. Nobody has to hug. A wave, a high five or a handshake is polite too.",
      allq: "Which are polite ways to say hello? Choose all that are polite." },
    { place: 'home', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G }), P('diaz', { name: 'Mr. Diaz' })]; },
      setup: "{G} says, “{A}, this is my friend Mr. Diaz.”", q: "What is a polite way for {A} to say hello?",
      good: ["{A} says, “Hello, Mr. Diaz.”", "{A} waves and says, “Hi.”", "{A} shakes hands and says, “Nice to meet you.”"],
      bad: ["{A} says, “Who are you?” in a cross voice.", "{A} makes a silly face and runs off."],
      why: "A hello, a wave or a handshake are all polite. You can choose the one that feels right." },
    { place: 'park', people: function (v) { return [P(v.a, { pose: 'wave' }), P(v.b, { pose: 'wave' })]; },
      pick: { greet: ['gives {B} a high five', 'waves at {B}', 'says, “Hi, {B}!”', 'gives {B} a fist bump'] },
      setup: "{A} sees {B} at the park.", q: "What can {A} do?",
      good: ["{A} {greet}.", "{A} says, “Hi, {B}! Want to play?”"],
      bad: ["{A} pretends not to see {B}.", "{A} yells, “Go home!”"],
      why: "There are many friendly ways to greet a friend. Any of them says, “I'm glad to see you.”" }
  ]);

  topic('young.saying-goodbye', [
    { place: 'door', host: true, people: function (v) { return [P(v.a), P(v.b, { pose: 'wave' }), P(v.h, { name: v.H })]; },
      setup: "It's time for {A} to go home from {B}'s house.", q: "What should {A} do?",
      good: ["{A} says, “Bye, {B}! Thank you for having me!”", "{A} waves and says, “Goodbye! I had fun.”"],
      bad: ["{A} runs out the door without a word.", "{A} says, “Finally!”"],
      near: [["{A} says goodbye to {B} but walks right past {H}.", "{H} made the visit happen. A goodbye and a thank-you to {H_him} are polite too."]],
      why: "A goodbye tells people we enjoyed being with them." },
    { place: 'door', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G, pose: 'wave' })]; },
      setup: "{G} is leaving after a visit.", q: "What should {A} do?",
      good: ["{A} says, “Bye, {G}! Come back soon!”", "{A} waves and says, “Goodbye! Thanks for coming.”"],
      bad: ["{A} keeps watching TV and doesn't look up.", "{A} says, “Bye. Don't come back.”"],
      near: [["{A} waves from across the room without a word.", "Coming to the door and saying goodbye shows {A} enjoyed the visit."]],
      why: "Saying goodbye lets {G} know the visit mattered." },
    { place: 'classroom', g: TEACHER, people: function (v) { return [P(v.a, { holds: 'bag' }), P(v.g, { name: v.G, pose: 'wave' })]; },
      setup: "School is over for the day.", q: "What should {A} do?",
      good: ["{A} says, “Goodbye, {G}! See you tomorrow.”", "{A} waves and says, “Bye, {G}!”"],
      bad: ["{A} slams the door on the way out.", "{A} shoves past {G}."],
      near: [["{A} rushes out without a word.", "A quick goodbye takes one second and makes {G} smile."]],
      why: "A goodbye is a kind way to end the day together." },
    { place: 'park', pick: { game: GAMES }, people: function (v) { return [P(v.a, { pose: 'wave' }), P(v.b), P(v.c)]; },
      setup: "{A} played {game} with {B} and {C}. Now {A} has to go.", q: "What should {A} do?",
      good: ["{A} says, “Bye! That was fun. See you soon!”", "{A} waves and says, “Goodbye, {B}! Goodbye, {C}!”"],
      bad: ["{A} takes the ball and runs off.", "{A} says, “This game was boring anyway.”"],
      near: [["{A} just walks away in the middle of the game.", "Telling friends you are leaving lets them know what is happening."]],
      why: "Saying goodbye tells friends we liked playing with them." }
  ]);

  // what to call grown-ups: customs vary, so problems ask for a good choice and never mark a family's way as rude
  topic('young.grown-up-names', [
    { place: 'classroom', g: TEACHER, yn: false, people: function (v) { return [P(v.a), P(v.g, { name: v.G })]; },
      setup: "{A} has a new teacher. Her name is Grace Park. Nobody has told {A} what to call her.", q: "What is a good choice?",
      good: ["{A} calls her “Ms. Park.”", "{A} asks {A_his} grown-up, “What should I call my teacher?”"],
      bad: ["{A} calls her “Hey, lady!”", "{A} calls her “You there.”"],
      near: [["{A} calls her “Grace” without being asked to.", "When you are not sure, Ms. and the last name is the safe choice, unless a grown-up says to use another name."]],
      allq: "Which are good choices? Choose all that are good choices.", yesLabel: 'A good choice: ', rightLabel: 'A good choice: ',
      why: "Mr. or Ms. and the last name is a respectful way to name a grown-up. When you are not sure, use it, or ask your grown-up." },
    { place: 'doctor', g: DOCTOR, yn: false, people: function (v) { return [P(v.a), P(v.g, { name: v.G })]; },
      setup: "{A} meets the doctor. Her name is Dr. Ada Bell.", q: "What can {A} call her?",
      good: ["{A} says, “Hello, Dr. Bell.”"],
      bad: ["{A} says, “Hey, you!”", "{A} says, “Hi, doctor lady.”"],
      near: [["{A} says, “Hi, Ada.”", "Doctors are called Dr. with their last name."]],
      why: "We call a doctor Dr. and the last name: Dr. Bell." },
    { place: 'home', yn: false, people: function (v) { return [P(v.a), P('rosa', { name: v.B + '\'s mom' }), P(v.b)]; },
      say: [[1, "Please call me Rosa."]],
      setup: "{B}'s mom says, “Please call me Rosa.”", q: "What should {A} call her now?",
      good: ["{A} says, “Okay, Rosa!”", "{A} says, “Thank you, Rosa.”"],
      bad: ["{A} says, “Hey, lady!”", "{A} calls her “{B}'s mom” in a silly voice."],
      why: "When a grown-up asks you to use a name, using that name is polite." },
    { place: 'street', g: NEIGHBOR.slice(0, 1), yn: false, people: function (v) { return [P(v.a), P(v.g, { name: v.G, pose: 'wave' })]; },
      setup: "{A}'s neighbor is Luis Diaz. {A}'s family calls him Mr. Diaz.", q: "What can {A} say?",
      good: ["{A} says, “Good morning, Mr. Diaz!”"],
      bad: ["{A} says, “Hey, old man!”", "{A} says, “Yo, you!”"],
      near: [["{A} says, “Hi, Luis!” without being asked to.", "When the family uses Mr. Diaz, that is the name to use."]],
      why: "Using the name your family uses for a grown-up shows respect.", lv: 2 },
    { place: 'home', yn: false, people: function (v) { return [P(v.a), P(v.b)]; },
      setup: "In {A}'s family, children call grown-ups Mr. or Ms. and the last name. In {B}'s family, children call a family friend “Miss Ana.”", q: "Whose way is polite?",
      good: ["Both ways are polite. Families and places have their own ways."],
      bad: ["Only {A}'s way. {B}'s family is rude.", "Only {B}'s way. {A}'s family is rude."],
      why: "Families and places have their own ways of naming grown-ups. Each is polite where it is used.", lv: 3 }
  ]);

  // saying no and telling: calm, short, and only the widely agreed advice
  var OKQ = { ynq: 'Is that a good choice?', yno: ['Yes, that is a good choice.', 'No, that is not a good choice.'], rightLabel: 'The right choice: ', yesLabel: 'A good choice: ',
    allq: 'Which are good choices? Choose all that are good choices.', hint: 'What would a grown-up who loves you want you to do?' };
  function safe(S) { return Object.assign({}, OKQ, S); }
  topic('young.no-and-tell', [
    safe({ place: 'home', g: FAMILY, people: function (v) { return [P(v.a, { mood: 'worried' }), P(v.g, { name: v.G })]; },
      setup: "Someone keeps tickling {A}, even after {A} says stop. {A} does not like it.", q: "What is the right thing to do?",
      good: ["{A} says, “No! Stop!” moves away, and tells {G}.", "{A} moves away and tells a grown-up {A_he} trusts."],
      bad: ["{A} keeps quiet because saying no feels rude.", "{A} thinks it is {A_his} fault and tells no one."],
      near: [["{A} laughs along, even though {A_he} feels upset.", "It is okay to say no to anything that feels wrong, and to tell a trusted grown-up."]],
      why: "Being polite never means you must do something that feels wrong. Saying no and telling a trusted grown-up is always okay." }),
    safe({ place: 'kitchen', g: FAMILY, people: function (v) { return [P(v.a, { mood: 'worried' }), P(v.g, { name: v.G })]; },
      setup: "Someone asks {A} to keep a secret that makes {A} feel worried.", q: "What is the right thing to do?",
      good: ["{A} tells {G}, a grown-up {A_he} trusts.", "{A} says, “I need to tell {G},” and tells {G_him}."],
      bad: ["{A} keeps the worried secret all alone.", "{A} hides it so no one finds out."],
      near: [["{A} keeps the secret because telling feels rude.", "Telling a trusted grown-up about a worried secret is never rude."]],
      why: "A secret that makes you feel worried is one to tell. Telling a trusted grown-up is always the right thing." }),
    safe({ place: 'park', g: FAMILY.concat(TEACHER), people: function (v) { return [P(v.a, { mood: 'worried' }), P(v.g, { name: v.G })]; },
      setup: "A game starts to feel scary to {A}.", q: "What is the right thing to do?",
      good: ["{A} says, “No, I don't want to play this,” and goes to {G}.", "{A} moves away and tells {G} how {A_he} feels."],
      bad: ["{A} keeps playing because {A_he} doesn't want to be rude.", "{A} hides and tells no one."],
      why: "It is fine to say no to anything that feels wrong, move away, and tell a grown-up you trust." }),
    safe({ place: 'home', g: FAMILY, people: function (v) { return [P(v.a, { mood: 'worried' }), P(v.g, { name: v.G })]; },
      setup: "{A} feels uncomfortable about something that happened. {A} tells {G}.", q: "Was telling {G} a good choice?",
      good: ["Yes. Telling a grown-up you trust is always okay."],
      bad: ["No. Telling is rude.", "No. {A} should have kept quiet."],
      yn: false,
      why: "Telling a trusted grown-up is always the right thing. They are there to help.", lv: 2 })
  ]);

  // ================================================================ Unit 3: Playing Together
  orderTopic('young.taking-turns', [
    { setup: "{A}, {B} and {C} take turns on the slide. {A} goes first, then {B}, then {C}.",
      items: ["{A} goes down the slide first.", "{B} goes down next.", "{C} goes down after {B}.", "Now {A} gets another turn."],
      why: "Everyone gets one turn before anyone goes again. That way everyone gets a chance." },
    { pick: { game: ['a board game', 'a card game', 'a matching game'] }, setup: "{A}, {B} and {C} play {game}. {B} goes first, then {C}, then {A}.",
      items: ["{B} takes the first turn.", "{C} takes the next turn.", "{A} takes a turn after {C}.", "It is {B}'s turn again."],
      why: "Taking turns in order means nobody is skipped and nobody goes twice in a row." }
  ], [
    { place: 'park', people: function (v) { return [P(v.a), P(v.b), P(v.c)]; },
      setup: "{A} just had a turn on the slide. {B} has not had a turn yet.",
      good: ["{A} lets {B} go next.", "{A} says, “Your turn, {B}!”"],
      bad: ["{A} pushes ahead to go again.", "{A} says, “It's always my turn.”"],
      near: [["{A} takes one more quick turn before {B}.", "Everyone gets a turn before anyone goes twice."]],
      why: "Taking turns means one person goes, then the next, so everyone gets a chance." },
    { place: 'home', pick: { toy: TOYS }, people: function (v) { return [P(v.a), P(v.b, { holds: v.toy_prop })]; },
      setup: "{B} is having a turn with {toy}. {A} wants it.",
      good: ["{A} waits until {B}'s turn is over.", "{A} asks, “Can I have a turn when you're done?”"],
      bad: ["{A} grabs {toy} away.", "{A} yells, “Give it!”"],
      near: [["{A} says, “My turn!” after just a few seconds.", "A turn should be long enough to enjoy."]],
      why: "Waiting for a turn is fair. Soon it will be {A}'s turn too." },
    { place: 'home', pick: { game: ['a board game', 'a card game'] }, people: function (v) { return [P(v.a), P(v.b), P(v.c)]; },
      setup: "{A}, {B} and {C} are playing {game}. It is {B}'s turn.",
      good: ["{A} waits while {B} takes {B_his} turn.", "{A} watches and says, “Good move, {B}!”"],
      bad: ["{A} grabs the pieces and moves for {B}.", "{A} says, “Hurry up, slowpoke!”"],
      near: [["{A} takes a turn too, so the game goes faster.", "Going out of turn skips someone. Wait until it is your turn."]],
      why: "In a game, waiting for your turn keeps it fair for everyone." }
  ]);

  topic('young.sharing', [
    { place: 'classroom', people: function (v) { return [P(v.a, { holds: 'crayons' }), P(v.b)]; },
      setup: "{A} has a box of crayons. {B} has none.", q: "What should {A} do?",
      good: ["{A} puts the crayons between them and says, “We can share.”", "{A} says, “Want to use some of my crayons?”"],
      bad: ["{A} hides the crayons.", "{A} says, “Get your own.”"],
      near: [["{A} gives {B} only the broken one.", "Sharing means letting {B} use the crayons too, not just the leftover one."]],
      why: "Sharing lets everyone have fun, and the crayons are still {A}'s." },
    { place: 'home', pick: { toy: TOYS }, people: function (v) { return [P(v.a, { holds: v.toy_prop }), P(v.b)]; },
      setup: "{A} and {B} both want to play with {toy}.", q: "What is a good way to share?",
      good: ["{A} says, “Let's play with it together.”", "{A} says, “You can have a turn, then me.”"],
      bad: ["{A} grabs {toy} and runs away.", "{A} says, “Mine! You can't touch it.”"],
      near: [["{A} won't share, because {A_he} thinks sharing means giving it away forever.", "Sharing can mean taking turns or playing together. It is still {A}'s."]],
      why: "Sharing can mean taking turns or using something together." },
    { place: 'home', people: function (v) { return [P(v.a), P(v.b)]; }, props: [{ kind: 'blocks', x: 300, y: 224 }],
      setup: "{B} is coming over. {A} has a special teddy bear {A_he} doesn't want to share.", q: "What can {A} do?",
      good: ["{A} puts the teddy bear away before {B} comes and shares the other toys.", "{A} picks out games to play with {B}."],
      bad: ["{A} lets {B} play with nothing.", "{A} says, “You can only watch me play.”"],
      near: [["{A} keeps every toy for {A_self}.", "It is fine to put one special thing away. The rest are for sharing."]],
      why: "Putting away one special thing before a friend comes is fine. Then {A} can share the rest happily." }
  ]);

  topic('young.asking-to-join', [
    { place: 'park', pick: { game: GAMES }, people: function (v) { return [P(v.a), P(v.b), P(v.c)]; },
      setup: "{B} and {C} are playing {game}. {A} wants to play too.",
      good: ["{A} asks, “Can I play too?”", "{A} says, “That looks fun. May I join?”"],
      bad: ["{A} runs in and takes over the game.", "{A} says, “Your game is dumb.”"],
      near: [["{A} jumps in without asking.", "Asking first lets the players make room."]],
      why: "Asking to join is friendly and lets the others make room." },
    { place: 'park', pick: { game: GAMES }, people: function (v) { return [P(v.a), P(v.b), P(v.c, { mood: 'shy' })]; },
      say: [[2, "Can I play too?"]],
      setup: "{A} and {B} are playing {game}. {C} asks, “Can I play too?”", q: "What should {A} say?",
      good: ["{A} says, “Sure, come play!”", "{A} says, “Yes! You can be on my team.”"],
      bad: ["{A} says, “You can't play.”", "{A} says, “Go away.”"],
      near: [["{A} says, “Only if you give me your snack.”", "Letting someone in should not cost them anything."]],
      why: "Saying yes when someone asks to play keeps the game friendly." },
    { place: 'park', pick: { game: GAMES }, people: function (v) { return [P(v.a), P(v.b), P(v.c)]; },
      say: [[1, "We're almost done. You can play next round!"]],
      setup: "{A} asks to join. {B} says, “We're almost done. You can play next round!”", q: "What should {A} do?",
      good: ["{A} says, “Okay!” and waits for the next round.", "{A} cheers for them until the next round."],
      bad: ["{A} kicks the ball away.", "{A} says, “That's not fair!” and stomps off."],
      near: [["{A} jumps in anyway.", "{B} said next round. Waiting a little is the polite part."]],
      why: "When friends say “next round,” waiting a little keeps everyone happy.", lv: 2 }
  ]);

  topic('young.asking-first', [
    { place: 'classroom', pick: { thing: [{ _: 'crayons', prop: 'crayons' }, { _: 'book', prop: 'book' }, { _: 'ball', prop: 'ball' }] }, people: function (v) { return [P(v.a), P(v.b)]; },
      props: function (v) { return [{ kind: v.thing_prop, x: 300, y: 226 }]; },
      setup: "{B}'s {thing} is on the table. Nobody is using it right now.", q: "What should {A} do?",
      good: ["{A} asks, “{B}, may I use your {thing}?”", "{A} asks {B} first, then waits for an answer."],
      bad: ["{A} takes it and runs off.", "{A} hides it in {A_his} bag."],
      near: [["{A} takes it because nobody is using it.", "It still belongs to {B}. If it is not yours, ask first, even if it looks free."]],
      why: "Asking first lets the owner choose. That is respectful." },
    { place: 'home', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G })]; }, props: [{ kind: 'phone', x: 300, y: 226 }],
      setup: "{G}'s phone is on the couch. {A} wants to play a game on it.", q: "What should {A} do?",
      good: ["{A} asks, “{G}, may I please use your phone?”", "{A} asks first and waits for {G} to say yes."],
      bad: ["{A} takes the phone and hides with it.", "{A} grabs it and says, “Mine now.”"],
      near: [["{A} uses it quickly before anyone sees.", "It is {G}'s phone. Asking first is the respectful thing."]],
      why: "Things that belong to someone else need a yes from them first." },
    { place: 'park', pick: { thing: [{ _: 'ball', prop: 'ball' }, { _: 'kite', prop: 'kite' }] }, people: function (v) { return [P(v.a, { holds: v.thing_prop }), P(v.b)]; },
      setup: "{A} borrowed {B}'s {thing}. Now it's time to go home.", q: "What should {A} do?",
      good: ["{A} gives it back and says, “Thanks for sharing!”", "{A} hands it to {B} and says, “Thank you!”"],
      bad: ["{A} takes it home without asking.", "{A} throws it into the bushes."],
      near: [["{A} leaves it on the grass and runs off.", "Taking care of a borrowed thing means giving it back to the owner."]],
      why: "When we borrow, we take care of the thing and give it back." }
  ]);

  topic('young.good-sport', [
    { place: 'park', people: function (v) { return [P(v.a, { mood: 'happy' }), P(v.b, { mood: 'sad' })]; },
      setup: "{A} wins the race. {B} comes second.", q: "What should {A} say?",
      good: ["{A} says, “Good race, {B}! Want to go again?”", "{A} smiles and says, “That was fun!”"],
      bad: ["{A} shouts, “I win! You're so slow!”", "{A} laughs at {B}."],
      near: [["{A} dances and cheers right in front of {B}'s face.", "Being happy is fine, but not in a way that makes {B} feel bad."]],
      why: "A good winner is happy without making the other person feel bad." },
    { place: 'home', pick: { game: ['a board game', 'a card game', 'a matching game'] }, people: function (v) { return [P(v.a, { mood: 'sad' }), P(v.b, { mood: 'happy' })]; },
      setup: "{A} loses {game} to {B}.", q: "What should {A} do?",
      good: ["{A} says, “Good game! Can we play again?”", "{A} shakes {B}'s hand and says, “Good game.”"],
      bad: ["{A} throws the pieces on the floor.", "{A} yells, “You cheated!”"],
      near: [["{A} says, “I quit!” as soon as {A_he} starts to lose.", "Quitting when you start to lose spoils the game for everyone."]],
      why: "A good loser stays calm, says “Good game,” and plays again." },
    { place: 'park', people: function (v) { return [P(v.a, { pose: 'wave' }), P(v.b, { pose: 'wave' }), P('diaz', { name: 'Coach Diaz' })]; },
      setup: "The soccer game is over. {A}'s team lost.", q: "What should {A} do?",
      good: ["{A} gives the other team high fives and says, “Good game!”", "{A} says, “Good game,” and smiles."],
      bad: ["{A} stomps off without a word.", "{A} says, “Your team stinks.”"],
      near: [["{A} pouts and won't look at the other team.", "Saying good game shows {A} enjoyed playing, win or lose."]],
      why: "Win or lose, good sports say “Good game.”" }
  ]);

  // tattling or telling: the reason decides (someone hurt, in danger, or being unkind → tell)
  var TELL = ["{B} fell off the slide and is crying.", "{B} is climbing the fence near the busy street.", "{B} keeps pushing {C}, even after {C} says stop.", "{B} says mean things to {C} every day.", "{B} is stuck at the top of the climbing bars and scared."];
  var SMALL = ["{B} is coloring the sky purple.", "{B} has a sticker on {B_his} hand.", "{B} sang a song a little too loud.", "{B} picked the red cup instead of the blue one.", "{B} is eating the crust last."];
  var TTQ = ['Yes. {A} should tell a grown-up.', 'No. That is small, so {A} can let it go.'];
  G('young.tattling-telling', function (R, ctx) {
    var v = vars(R, {}), L = ctx.level || 1, g = R.pick(TEACHER.concat(FAMILY)); setGrown(v, 'G', g);
    var pic = { name: 'et-scene', opts: { place: R.pick(['park', 'classroom']), people: [P(v.a, { mood: 'worried' }), P(v.g, { name: v.G })], big: true, quiet: true, interactive: false, label: 'A picture for the question.' } };
    var why = 'Telling is getting help when someone is hurt, in danger, or being unkind. Tattling is trying to get someone in trouble over something small.';
    if (L === 3 && R.chance(0.6)) {
      var t = R.sample(TELL, 2), s = R.sample(SMALL, 2), list = R.shuffle(t.map(function (x) { return [fill(x, v), true]; }).concat(s.map(function (x) { return [fill(x, v), false]; })));
      return { q: READ + big('Which should ' + v.A + ' tell ' + v.G + ' about? Choose all that ' + v.A + ' should tell.'),
        a: { t: 'mc', choices: list.map(function (x) { return x[0]; }), v: list.map(function (x, i) { return x[1] ? i : -1; }).filter(function (i) { return i >= 0; }) },
        steps: ['Tell: ' + fill(t[0], v), 'Tell: ' + fill(t[1], v), 'Small things to let go: ' + fill(s[0], v) + ' ' + fill(s[1], v), why, 'If someone could get hurt, always tell.'],
        hint: 'Could someone get hurt, or is someone being unkind?', viz: pic };
    }
    var tell = L === 1 ? R.coin() : R.chance(0.5), sit = fill(R.pick(tell ? TELL : SMALL), v);
    return { q: READ + big(sit + ' Should ' + v.A + ' tell ' + v.G + '?'),
      a: { t: 'mc', choices: TTQ.map(function (x) { return fill(x, v); }), v: tell ? 0 : 1, keep: true },
      steps: [tell ? 'Yes, tell. Someone could get hurt or is being treated unkindly, so a grown-up needs to know.' : 'This is small. Nobody is hurt or in danger, so telling would only get ' + v.B + ' in trouble.', why, 'If someone could get hurt, always tell.'],
      hint: 'Could someone get hurt, or is someone being unkind?', viz: pic };
  });

  // ================================================================ Unit 4: Listening and Talking
  topic('young.listening', [
    { place: 'classroom', g: TEACHER, people: function (v) { return [P(v.g, { name: v.G, holds: 'book' }), P(v.a), P(v.b)]; },
      setup: "{G} is reading a story to the class.", q: "How can {A} listen well?",
      good: ["{A} looks at {G} and keeps {A_his} body still.", "{A} sits quietly and listens to the whole story."],
      bad: ["{A} talks to {B} the whole time.", "{A} rolls around on the floor."],
      near: [["{A} plays with a toy, then asks, “What?”", "Looking at the speaker helps you hear, and it shows you care."]],
      why: "Looking at the person talking and staying still help us hear, and they show we care." },
    { place: 'home', g: FAMILY, pick: { toy: TOYS }, people: function (v) { return [P(v.a, { holds: v.toy_prop }), P(v.g, { name: v.G })]; },
      setup: "{G} is telling {A} about tomorrow's trip to the park. {A} is playing with {toy}.", q: "What should {A} do?",
      good: ["{A} puts down {toy}, looks at {G}, and listens.", "{A} stops playing and looks at {G} until {G_he} is done."],
      bad: ["{A} walks away while {G} is talking.", "{A} turns up the TV."],
      near: [["{A} keeps playing and says, “Uh-huh,” without looking up.", "Looking at {G} helps {A} really hear, not just say uh-huh."]],
      why: "Stopping, looking and waiting until the person is done is how we listen." },
    { place: 'park', people: function (v) { return [P(v.a), P(v.b)]; },
      pick: { story: ['the new puppy', 'the big fish {B_he} saw', 'a dream about dragons', 'a visit to the zoo'] },
      setup: "{B} is telling {A} about {story}.", q: "What should {A} do?",
      good: ["{A} looks at {B} and waits until {B} is done.", "{A} listens, then asks, “What happened next?”"],
      bad: ["{A} walks away in the middle.", "{A} says, “Boring!”"],
      near: [["{A} starts telling {A_his} own story in the middle of {B}'s.", "Wait until {B} finishes. Then it is {A}'s turn."]],
      why: "Listening until a friend is done shows {A} cares about what {B} says." }
  ]);

  orderTopic('young.waiting-to-talk', [
    { g: FAMILY, setup: "{G} is talking with a friend. {A} wants to ask a question.",
      items: ["{A} waits for a pause.", "{A} says, “Excuse me.”", "{A} waits for {G} to say, “Yes, {A}?”", "{A} asks {A_his} question."],
      why: "Excuse me asks for a turn. Waiting after it is the polite part." }
  ], [
    { place: 'home', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G }), P('nora', { name: 'Friend' })]; },
      setup: "{G} is talking with a friend. {A} wants to ask for a snack.",
      good: ["{A} waits for a pause, says, “Excuse me,” and waits.", ["{A} puts a hand gently on {G}'s arm and waits, the way {A_his} family does.", "Some families use a hand on the arm as a quiet signal. Either way, waiting is the polite part."]],
      bad: ["{A} shouts, “I'm hungry!” over them.", "{A} pulls on {G}'s sleeve again and again."],
      near: [["{A} says, “Excuse me,” and starts talking right away.", "Excuse me does not mean “talk now.” Say it once, then wait."]],
      why: "Waiting for a pause lets the grown-ups finish, and then they can listen to {A}." },
    { place: 'classroom', g: TEACHER, people: function (v) { return [P(v.g, { name: v.G }), P(v.a), P(v.b)]; },
      setup: "{G} is talking to the class. {A} has a question.",
      good: ["{A} raises {A_his} hand and waits to be called on.", "{A} keeps {A_his} hand up quietly until {G} says {A_his} name."],
      bad: ["{A} shouts the question out.", "{A} talks over {G}."],
      near: [["{A} waves {A_his} hand and calls, “Ooh! Ooh! Me!”", "A quiet raised hand is enough. {G} will see it."]],
      why: "A raised hand asks for a turn without stopping the lesson." },
    { place: 'park', g: FAMILY, people: function (v) { return [P(v.a, { mood: 'worried' }), P(v.g, { name: v.G }), P('diaz', { name: 'Mr. Diaz' })]; },
      setup: "{G} is talking with Mr. Diaz. {B} falls and is hurt.",
      good: ["{A} says, “Excuse me, {G}! {B} is hurt!” right away.", "{A} interrupts right away to tell {G} about {B}."],
      bad: ["{A} keeps playing and says nothing.", "{A} laughs at {B}."],
      near: [["{A} waits quietly for a long pause.", "When someone is hurt, it is right to interrupt."]],
      why: "We wait to talk, unless something is wrong. When someone is hurt, tell a grown-up right away.", lv: 2 }
  ]);

  var LOUDOK = ['the playground', 'a soccer game', 'the park', 'the backyard'];
  var SOFT = ['the library', 'the store', 'the classroom', 'the doctor\'s waiting room', 'a restaurant', 'home while Grandpa naps'];
  topic('young.inside-voice', [
    { place: 'library', people: function (v) { return [P(v.a, { holds: 'book' }), P(v.b)]; },
      setup: "{A} wants to show {B} a funny page at the library.", q: "How should {A} talk?",
      good: ["{A} whispers, “Look at this!”", "{A} uses a soft, quiet voice."],
      bad: ["{A} shouts, “{B}! LOOK!”", "{A} laughs out loud and stomps."],
      near: [["{A} talks in a playground voice, because {A_he} is excited.", "Being excited is fine. In the library, the place decides how loud we are."]],
      why: "Other people are reading. A soft voice lets everyone enjoy the library." },
    { place: 'store', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G })]; }, props: [{ kind: 'cart', x: 300, y: 222 }],
      setup: "{A} sees {B} at the store, far down the aisle.", q: "What should {A} do?",
      good: ["{A} walks over with {G} and says hi in an inside voice.", "{A} waves and smiles."],
      bad: ["{A} screams {B}'s name across the store.", "{A} runs down the aisle yelling."],
      near: [["{A} calls out loudly, “Hi, {B}!” from far away.", "Stores are inside places. Walking closer and using an inside voice is polite."]],
      why: "Inside places call for inside voices, so everyone can shop in peace." },
    { place: 'park', people: function (v) { return [P(v.a, { pose: 'wave' }), P(v.b)]; },
      setup: "{A} is on the playground. {A} calls, “Over here, {B}!”", q: "Is a loud voice okay here?",
      good: ["Yes. A loud voice is fine on the playground."],
      bad: ["No. {A} should whisper on the playground.", "No. {A} should never call to friends."],
      yn: false,
      why: "The playground is an outside place. Loud voices are fine there, as long as no one is shouted at." },
    { place: 'home', g: [{ who: 'walt', label: 'Grandpa Walt' }], people: function (v) { return [P(v.a), P(v.b), P(v.g, { name: v.G, pose: 'sit' })]; },
      setup: "{G} is taking a nap. {A} and {B} are playing nearby.", q: "How should they play?",
      good: ["They use quiet inside voices.", "They whisper so {G} can rest."],
      bad: ["They have a shouting contest.", "They bang pots like drums."],
      near: [["They play their loudest game, because they are inside.", "Inside means a soft voice, and someone is sleeping."]],
      why: "A soft voice at home is kind to everyone nearby." }
  ], { p: 0.35, min: 2, fn: function (R, ctx) {
    var v = vars(R, {}), L = ctx.level || 1;
    if (L === 3) {
      var s = R.sample(SOFT, 3), l = R.pick(LOUDOK), list = R.shuffle(s.map(function (x) { return [x, true]; }).concat([[l, false]]));
      return { q: READ + big('Where should ' + v.A + ' use an inside voice? Choose all.'),
        a: { t: 'mc', choices: list.map(function (x) { return cap(x[0]); }), v: list.map(function (x, i) { return x[1] ? i : -1; }).filter(function (i) { return i >= 0; }) },
        steps: ['Inside voice: ' + s.map(cap).join(', ') + '.', 'A loud voice is fine at ' + l + '.', 'The place decides how loud we should be.'],
        hint: 'Is it inside, where people are close by, or outside where people play?' };
    }
    var loud = R.pick(LOUDOK), soft = R.sample(SOFT, 2), ch = R.shuffle([loud].concat(soft));
    return { q: READ + big('Where is a loud voice okay?'), a: { t: 'mc', choices: ch.map(cap), v: ch.indexOf(loud) },
      steps: ['A loud voice is okay at ' + loud + '.', cap(soft[0]) + ' and ' + soft[1] + ' are places for an inside voice.', 'The place decides how loud we should be.'],
      hint: 'Which place is outside, where people run and play?' };
  } });

  orderTopic('young.phone-hello', [
    { pick: { who: [{ _: 'Mom', her: 'her' }, { _: 'Dad', her: 'him' }, { _: 'Grandma', her: 'her' }] },
      setup: "The phone rings. In {A}'s family, {A} may answer. The caller asks for {who}.",
      items: ["{A} says, “Hello?”", "{A} says, “Please wait. I'll get {who_her}.”", "{A} sets the phone down gently.", "{A} walks to {who} and says, “The phone is for you.”"],
      why: "Saying please wait tells the caller what is happening. Walking to get {who} means nobody shouts in the caller's ear." }
  ], [
    { place: 'home', pick: { who: [{ _: 'Dad', who: 'kofi', him: 'him' }, { _: 'Mom', who: 'rosa', him: 'her' }] }, people: function (v) { return [P(v.a, { pose: 'phone', holds: 'phone' })]; },
      setup: "{A} answers the phone. The caller asks for {who}.",
      good: ["{A} says, “Please wait,” and goes to get {who}.", "{A} says, “Just a minute, please. I'll get {who_him}.”"],
      bad: ["{A} hangs up.", "{A} says, “No,” and puts the phone down."],
      near: [["{A} yells, “{who}! PHONE!” with the phone at {A_his} mouth.", "Shouting next to the phone hurts the caller's ears. Walk to get {who} instead."], ["{A} puts the phone down and goes back to playing.", "The caller is waiting. Go get the grown-up."]],
      why: "Please wait tells the caller what is happening, and getting the grown-up helps them." },
    { place: 'home', people: function (v) { return [P(v.a, { pose: 'phone', holds: 'phone' })]; },
      setup: "{A}'s grandma calls to talk to {A}.",
      good: ["{A} says, “Hi, Grandma! How are you?” in a clear voice.", "{A} says hello and talks clearly into the phone."],
      bad: ["{A} breathes into the phone and says nothing.", "{A} says, “I'm busy,” and hangs up."],
      near: [["{A} nods without saying anything.", "On the phone, Grandma can't see a nod. Use words."]],
      why: "On the phone, people can only hear us, so we speak clearly." },
    { place: 'home', people: function (v) { return [P(v.a, { pose: 'phone', holds: 'phone' })]; },
      setup: "{A} answers the phone. The caller asks {A} questions {A_he} doesn't know how to answer.",
      good: ["{A} says, “Please wait. I'll get a grown-up.”"],
      bad: ["{A} keeps talking and answers anything.", "{A} makes silly noises."],
      near: [["{A} guesses the answers.", "When you aren't sure, get a grown-up."]],
      why: "When a call is not for us, or we don't know what to say, we get a grown-up.", lv: 2 }
  ]);

  // ================================================================ Unit 5: At the Table
  orderTopic('young.wash-hands', [
    { setup: "Dinner is almost ready. {A} goes to wash {A_his} hands.",
      items: ["{A} wets {A_his} hands with water.", "{A} rubs on soap and scrubs.", "{A} rinses off the soap.", "{A} dries {A_his} hands."],
      title: "Washing hands", why: "Soap and a good scrub clean our hands, rinsing takes the soap away, and drying finishes the job." },
    { setup: "{A} comes in from the park. It's snack time.",
      items: ["{A} goes to the sink.", "{A} wets {A_his} hands and adds soap.", "{A} scrubs the fronts, the backs and between the fingers.", "{A} rinses and dries {A_his} hands.", "{A} sits down for snack."],
      title: "Before snack", why: "We wash before we eat, so our food stays clean." }
  ], [
    { place: 'kitchen', g: COOKS, people: function (v) { return [P(v.a), P(v.g, { name: v.G })]; }, say: [[1, "Dinner is ready!"]],
      setup: "{A} was playing in the sandbox. {G} says dinner is ready.",
      good: ["{A} washes {A_his} hands with soap first.", "{A} goes to the sink, scrubs with soap, rinses and dries."],
      bad: ["{A} sits down to eat with sandy hands.", "{A} wipes {A_his} hands on the curtains."],
      near: [["{A} splashes {A_his} hands with water for one second, with no soap.", "Soap and a good scrub get hands clean. A quick splash does not."]],
      why: "Clean hands keep our food clean, and they are nice to sit beside." }
  ]);

  topic('young.sitting-at-table', [
    { place: 'table', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G }), P(v.b)]; },
      setup: "It is dinner time.", q: "How should {A} sit?",
      good: ["{A} sits on {A_his} bottom with {A_his} chair pulled in.", "{A} sits with {A_his} feet down and stays in {A_his} seat."],
      bad: ["{A} stands on {A_his} chair.", "{A} tips {A_his} chair back on two legs."],
      near: [["{A} kneels on the chair to reach better.", "Sitting on your bottom, with the chair pulled in, is safer and lets you reach."]],
      why: "Sitting well is safe, and it keeps everyone company at the meal." },
    { place: 'table', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G }), P(v.b)]; },
      setup: "{A} has eaten some of {A_his} dinner. {A} wants to play.", q: "What should {A} do?",
      good: ["{A} stays in {A_his} seat until the meal is over.", "{A} stays and talks with the family until everyone is done."],
      bad: ["{A} runs off to play and comes back later.", "{A} crawls under the table."],
      near: [["{A} gets up to look out the window, then comes back.", "Staying seated is a way of keeping others company."]],
      why: "Staying in our seat shows we are eating together." }
  ], { p: 0.35, fn: function (R, ctx) {
    var v = vars(R, {}), good = R.pick(['A', 'B']);
    return { q: READ + big('Who is sitting well at the table, A or B?'),
      a: { t: 'mc', choices: ['A', 'B'], v: good === 'A' ? 0 : 1, keep: true },
      viz: { name: 'et-posture', opts: { pose: 'table', mode: 'compare', good: good, who: v.a, quiet: true, interactive: false, big: true, label: 'Two figures at a table, A and B.' } },
      steps: ['Figure ' + good + ' is sitting well.', 'Sitting well looks like this: sitting back on the chair, tall and easy, feet down, the chair pulled in.', 'The other figure is slumped down in the chair.'],
      hint: 'Look for the one sitting up tall, with feet down.' };
  } });

  topic('young.napkin', [
    { place: 'table', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G })]; },
      setup: "{A} sits down to eat. A napkin is next to {A_his} plate.", q: "What should {A} do with it?",
      good: ["{A} puts the napkin on {A_his} lap.", "{A} opens the napkin and lays it on {A_his} lap."],
      bad: ["{A} throws it on the floor.", "{A} puts it on {A_his} head."],
      near: [["{A} leaves it on the table and wipes {A_his} hands on {A_his} shirt.", "The napkin goes on your lap, so it is ready and clothes stay clean."]],
      why: "The napkin waits on our lap, ready for messy fingers and mouths." },
    { place: 'table', g: FAMILY, pick: { food: ['spaghetti', 'tacos', 'pizza', 'chicken'] }, people: function (v) { return [P(v.a), P(v.g, { name: v.G })]; },
      setup: "{A} is eating {food}. {A_His} fingers are messy.", q: "What should {A} do?",
      good: ["{A} wipes {A_his} fingers on {A_his} napkin.", "{A} uses the napkin from {A_his} lap."],
      bad: ["{A} wipes them on the tablecloth.", "{A} wipes them on the chair."],
      near: [["{A} wipes them on {A_his} shirt.", "The napkin is there so we never have to use our clothes."], ["{A} uses {A_his} sleeve.", "Sleeves are for arms. The napkin is for fingers and mouths."]],
      why: "A napkin keeps hands, clothes and the table clean." },
    { place: 'table', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G }), P(v.b)]; },
      setup: "{A} has sauce on {A_his} mouth.", q: "What should {A} do?",
      good: ["{A} wipes {A_his} mouth with {A_his} napkin.", "{A} dabs {A_his} mouth with the napkin and puts it back on {A_his} lap."],
      bad: ["{A} licks all around {A_his} face loudly.", "{A} wipes it on the table."],
      near: [["{A} wipes {A_his} mouth on {A_his} sleeve.", "The napkin is the tool for this job."]],
      why: "Using the napkin keeps us neat and is nice for the people we eat with." }
  ], { p: 0.3, fn: function (R, ctx) {
    var v = vars(R, {}), L = ctx.level || 1;
    var good = 'On ' + v.A_his + ' lap', wrong = R.sample(['Tucked in ' + v.A_his + ' pocket', 'On ' + v.A_his + ' chair', 'On the floor', 'On top of ' + v.A_his + ' head'], L === 1 ? 1 : 2);
    var ch = R.shuffle([good].concat(wrong));
    return { q: READ + big(v.A + ' sits down to eat. The napkin has a “?” on it. Where should ' + v.A + ' put it?'),
      a: { t: 'mc', choices: ch, v: ch.indexOf(good) },
      viz: { name: 'et-setting', opts: { level: 'basic', ask: 'napkin', quiet: true, interactive: false, label: 'A place setting: a plate, a fork, a knife, a spoon, a glass and a napkin with a question mark.' } },
      steps: ['The napkin goes on ' + v.A_his + ' lap.', 'Put it on your lap when you sit down, and use it to wipe your mouth and fingers.'],
      hint: 'Where will it be ready for messy fingers?' };
  } });

  topic('young.waiting-to-eat', [
    { place: 'table', g: COOKS, people: function (v) { return [P(v.a), P(v.g, { name: v.G }), P(v.b)]; },
      setup: "{A}'s plate is full. {B} and {G} don't have food yet.",
      good: ["{A} waits until everyone has food.", "{A} sits with {A_his} hands in {A_his} lap and waits."],
      bad: ["{A} starts eating fast.", "{A} takes food from {B}'s spot."],
      near: [["{A} eats just one quick bite while waiting.", "Waiting shows we are eating together, not just eating."]],
      why: "Waiting until everyone is served shows we are eating together." },
    { place: 'table', g: COOKS, people: function (v) { return [P(v.a), P(v.g, { name: v.G }), P(v.b)]; }, say: [[1, "Let's eat!"]],
      setup: "Everyone has food. {G}, who made dinner, says, “Let's eat!”", q: "What can {A} do now?",
      good: ["{A} starts to eat.", "{A} says, “Thank you!” and starts to eat."],
      bad: ["{A} grabs food off {B}'s plate.", "{A} says, “Finally!” and gulps it all."],
      near: [["{A} starts eating with {A_his} hands, fast, to be first.", "It is time to eat, but not a race."]],
      why: "When the cook or a grown-up says to begin, everyone starts together." },
    { place: 'table', host: true, people: function (v) { return [P(v.a), P(v.h, { name: v.H }), P(v.b)]; },
      setup: "{A} eats dinner at {B}'s house. {B}'s family does something before eating that {A}'s family doesn't do.",
      good: ["{A} waits quietly until they are done, then eats.", "{A} watches {B} and follows along quietly."],
      bad: ["{A} starts eating anyway.", "{A} giggles and makes faces."],
      near: [["{A} says, “We don't do that at my house.”", "Each family has its own way to start a meal. A guest waits quietly."]],
      why: "Families start meals in their own ways. A guest waits and follows the family's way.", lv: 2 }
  ]);

  topic('young.chewing', [
    { place: 'table', g: FAMILY, pick: { food: FOODS }, people: function (v) { return [P(v.a), P(v.g, { name: v.G }), P(v.b)]; },
      setup: "{A} takes a bite of {food}.", q: "How should {A} chew?",
      good: ["{A} chews with {A_his} lips closed.", "{A} takes a small bite and chews with {A_his} mouth closed."],
      bad: ["{A} opens {A_his} mouth wide to show {B} the food.", "{A} chews loudly with {A_his} mouth open."],
      near: [["{A} stuffs in a huge bite and chews with puffed cheeks.", "Small bites are easier to chew with your mouth closed."]],
      why: "Nobody wants to see chewed food. Lips closed is kind to everyone at the table." },
    { place: 'table', g: FAMILY, pick: { story: ['a funny dog', 'a big rainbow', 'a new friend', 'a giant puddle'] }, people: function (v) { return [P(v.a), P(v.g, { name: v.G }), P(v.b)]; },
      setup: "{A} has food in {A_his} mouth. {A} wants to tell a story about {story}.", q: "What should {A} do?",
      good: ["{A} finishes chewing, swallows, then tells the story.", "{A} holds up one finger, swallows, then talks."],
      bad: ["{A} talks and food falls out.", "{A} spits the food on the plate to talk."],
      near: [["{A} talks with a full mouth because the story is exciting.", "Swallow first. The story will wait."]],
      why: "Swallowing before we talk keeps food in our mouth and lets people understand us." },
    { place: 'table', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G })]; }, say: [[1, "How was school today?"]],
      setup: "{G} asks {A} a question. {A} is chewing.", q: "What should {A} do?",
      good: ["{A} finishes chewing, then answers.", "{A} nods, swallows, and then answers."],
      bad: ["{A} answers with {A_his} mouth full of food.", "{A} sticks out {A_his} tongue."],
      near: [["{A} answers quickly with a full mouth so {G} doesn't wait.", "{G} is happy to wait a moment. Swallow first."]],
      why: "A moment to swallow is worth it, so everyone can understand." }
  ]);

  topic('young.please-pass', [
    { place: 'table', g: FAMILY, pick: { food: FOODS }, people: function (v) { return [P(v.a), P(v.b), P(v.g, { name: v.G })]; },
      setup: "The bowl of {food} is far away from {A}.", q: "What should {A} do?",
      good: ["{A} asks, “Please pass the {food}.”", "{A} asks, “{G}, could you please pass the {food}?”"],
      bad: ["{A} climbs on {A_his} chair to grab them.", "{A} shouts, “Give me the {food}!”"],
      near: [["{A} stretches across {B}'s plate to reach.", "Reaching across can knock over cups. Asking is kinder to neighbors."]],
      why: "Asking someone to pass keeps cups safe and arms out of people's plates." },
    { place: 'table', g: FAMILY, pick: { food: ['bread', 'butter', 'salt', 'corn'] }, people: function (v) { return [P(v.a), P(v.b), P(v.g, { name: v.G })]; },
      say: [[1, "Please pass the {food}."]],
      setup: "{B} asks {A}, “Please pass the {food}.”", q: "What should {A} do?",
      good: ["{A} passes it and says, “Here you go.”", "{A} hands it to {B} carefully."],
      bad: ["{A} throws it to {B}.", "{A} says, “Get it yourself.”"],
      near: [["{A} keeps eating and pretends not to hear.", "{B} asked kindly. Passing it is the kind answer."]],
      why: "Passing food when someone asks helps everyone enjoy the meal." },
    { place: 'table', g: FAMILY, pick: { food: FOODS }, people: function (v) { return [P(v.a), P(v.b), P(v.g, { name: v.G })]; },
      setup: "{A} wants more {food}. The bowl is by {G}.", q: "What should {A} do?",
      good: ["{A} asks, “May I please have the {food}?”", "{A} waits for {G} to look over, then asks, “Please pass the {food}.”"],
      bad: ["{A} stands up and walks over {B}'s chair to grab it.", "{A} bangs on the table."],
      near: [["{A} stands up and leans across the table.", "Standing and reaching across can tip things over. Asking is safer."]],
      why: "Please pass the food is safer for cups and kinder to the people nearby." }
  ]);

  topic('young.no-thank-you', [
    { place: 'table', g: COOKS, pick: { food: FOODS }, people: function (v) { return [P(v.a), P(v.g, { name: v.G, holds: 'plate' })]; },
      say: [[1, "Would you like some {food}?"]],
      setup: "{G} asks, “Would you like some {food}?” {A} doesn't like {food}.", q: "What should {A} say?",
      good: ["{A} says, “No, thank you.”", "{A} says, “No, thank you,” and passes the bowl along."],
      bad: ["{A} says, “Yuck! Gross!”", "{A} says, “That looks disgusting.”"],
      near: [["{A} makes a face and pushes the bowl away.", "The cook can see faces too. A quiet no, thank you is enough."], ["{A} just says, “No!”", "Adding thank you is kinder, because someone worked to make it."]],
      why: "Someone worked to make the food. No, thank you says no without hurting feelings." },
    { place: 'table', g: COOKS, pick: { food: FOODS }, people: function (v) { return [P(v.a), P(v.g, { name: v.G })]; },
      setup: "In {A}'s family, everyone tries one small taste. {A} tries the {food} and doesn't like it.", q: "What should {A} do?",
      good: ["{A} says, “I tried it. No more, thank you.”", "{A} finishes the small bite and says, “No, thank you.”"],
      bad: ["{A} spits it out on the table.", "{A} yells, “I hate this!”"],
      near: [["{A} says, “Gross,” very quietly.", "Even a quiet gross can hurt the cook's feelings."]],
      why: "Many families ask for one small taste. After that, a kind no, thank you is fine." },
    { place: 'table', host: true, pick: { food: FOODS }, people: function (v) { return [P(v.a), P(v.h, { name: v.H }), P(v.b)]; },
      setup: "{A} is at {B}'s house. {H} offers {A} some {food}. {A} doesn't want any.", q: "What should {A} say?",
      good: ["{A} says, “No, thank you.”", "{A} says, “No, thank you. Everything else is yummy!”"],
      bad: ["{A} says, “Ew, we never eat that.”", "{A} says, “Your food is weird.”"],
      near: [["{A} says nothing and covers {A_his} plate with {A_his} hands.", "Words are kinder. No, thank you is all it takes."]],
      why: "No, thank you is polite at any table." }
  ]);

  orderTopic('young.excused', [
    { g: FAMILY, setup: "{A} is done eating. The others are still at the table.",
      items: ["{A} finishes {A_his} last bite.", "{A} asks, “May I please be excused?”", "{G} says yes, and {A} says, “Thank you for dinner!”", "{A} carries {A_his} plate to the kitchen."],
      why: "Asking to be excused lets the family know, thanking the cook is kind, and carrying a plate is a big help." }
  ], [
    { place: 'table', g: COOKS, people: function (v) { return [P(v.a), P(v.g, { name: v.G }), P(v.b)]; },
      setup: "{A} is done. The others are still eating.",
      good: ["{A} asks, “May I please be excused?”", "{A} waits for a pause and asks, “May I please be excused?”"],
      bad: ["{A} jumps up and runs off to play.", "{A} says, “I'm out of here!”"],
      near: [["{A} leaves as soon as {A_his} own plate is empty, without a word.", "Asking to be excused lets the family know."]],
      why: "Asking to be excused lets the family know we are done and want to leave." },
    { place: 'kitchen', g: COOKS, people: function (v) { return [P(v.a, { holds: 'plate' }), P(v.g, { name: v.G })]; }, say: [[1, "Yes, you may."]],
      setup: "{A} asked to be excused. {G} says, “Yes, you may.”",
      good: ["{A} says, “Thank you for dinner!” and carries {A_his} plate.", "{A} thanks {G} and helps clear {A_his} plate."],
      bad: ["{A} leaves {A_his} plate and runs off.", "{A} drops {A_his} plate in the sink with a crash."],
      near: [["{A} says thank you but leaves the plate on the table.", "Carrying your plate, if you can, is a big help."]],
      why: "Thanking the cook and helping clear is kind to the person who made the meal." }
  ]);

  // ================================================================ Unit 6: Guests and Hosts
  topic('young.good-guest', [
    { place: 'door', host: true, people: function (v) { return [P(v.a), P(v.h, { name: v.H, pose: 'wave' }), P(v.b)]; },
      setup: "{A} arrives at {B}'s house. {H} opens the door.", q: "What should {A} do?",
      good: ["{A} says, “Hello, {H}!” and then says hi to {B}.", "{A} smiles at {H} and says, “Hi! Thank you for having me.”"],
      bad: ["{A} runs past {H} without a word.", "{A} says, “Where are the snacks?”"],
      near: [["{A} says hi to {B} but walks right past {H}.", "Greeting the grown-up who opened the door is the polite start to a visit."]],
      why: "Greeting the grown-ups shows {A} is glad to be there." },
    { place: 'kitchen', host: true, people: function (v) { return [P(v.a), P(v.b), P(v.h, { name: v.H })]; },
      setup: "{A} is thirsty at {B}'s house.", q: "What should {A} do?",
      good: ["{A} asks, “May I please have some water?”", "{A} asks {B}'s grown-up for a drink."],
      bad: ["{A} opens the fridge and takes a juice.", "{A} drinks from the faucet with {A_his} mouth."],
      near: [["{A} opens the cupboards to look for a cup.", "In someone else's home, ask first."]],
      why: "In someone else's home, we ask before we open, take or use things." },
    { place: 'home', host: true, people: function (v) { return [P(v.a), P(v.b)]; }, props: [{ kind: 'blocks', x: 220, y: 226 }, { kind: 'toy', x: 380, y: 226 }],
      setup: "It's almost time for {A} to go home. The toys are all over the floor.", q: "What should {A} do?",
      good: ["{A} helps {B} put the toys away.", "{A} says, “Let's clean up together.”"],
      bad: ["{A} leaves the mess and runs to the door.", "{A} kicks the toys under the couch."],
      near: [["{A} says, “They're your toys, so you clean up.”", "Everyone who played helps tidy, even the guest."]],
      why: "A good guest helps clean up before going home." },
    { place: 'home', host: true, people: function (v) { return [P(v.a), P(v.b)]; },
      setup: "At {B}'s house, {A} sees a closed door.", q: "What should {A} do?",
      good: ["{A} asks {B}, “What's in there?” and leaves it closed.", "{A} leaves the door closed."],
      bad: ["{A} opens it and runs inside.", "{A} bangs on the door."],
      near: [["{A} peeks inside to see what's there.", "A closed door in someone else's home stays closed unless they invite you."]],
      why: "In a friend's home, we ask first, because it is their family's space." }
  ]);

  topic('young.good-host', [
    { place: 'door', people: function (v) { return [P(v.a, { pose: 'wave' }), P(v.b)]; },
      setup: "{B} comes to play at {A}'s house. The doorbell rings.", q: "What should {A} do?",
      good: ["{A} goes to the door with a grown-up and says, “Hi, {B}! Come in!”", "{A} smiles and says, “I'm glad you came!”"],
      bad: ["{A} keeps watching TV and doesn't look up.", "{A} says, “Oh. It's you.”"],
      near: [["{A} yells, “Come in!” from the other room.", "Meeting {B} at the door makes {B} feel welcome."]],
      why: "The host's job is to make the guest feel welcome." },
    { place: 'home', people: function (v) { return [P(v.a), P(v.b)]; }, props: [{ kind: 'blocks', x: 220, y: 226 }, { kind: 'ball', x: 380, y: 226 }],
      setup: "{B} is at {A}'s house to play.", q: "What should {A} say?",
      good: ["{A} asks, “What do you want to play first?”", "{A} says, “You pick the first game!”"],
      bad: ["{A} says, “We're playing my game. You watch.”", "{A} says, “Don't touch my stuff.”"],
      near: [["{A} plays alone with {A_his} new game.", "Playing alone leaves the guest out. A host plays with the guest."], ["{A} keeps {A_his} favorite toys to {A_self}.", "A host shares, so the guest has fun too."]],
      why: "Letting the guest choose first makes {B} feel welcome." },
    { place: 'door', people: function (v) { return [P(v.a, { pose: 'wave' }), P(v.b, { pose: 'wave' })]; },
      setup: "It's time for {B} to go home.", q: "What should {A} do?",
      good: ["{A} walks {B} to the door and says, “Thanks for coming!”", "{A} waves and says, “Bye, {B}! That was fun.”"],
      bad: ["{A} says, “Finally!”", "{A} keeps playing and doesn't say goodbye."],
      near: [["{A} says bye from the couch without getting up.", "Walking a guest to the door is a warm way to say goodbye."]],
      why: "A good host says goodbye at the door, so the guest feels welcome to come back." }
  ]);

  // other houses, other rules: the host family's way is right in its home; no family's way is wrong
  topic('young.house-rules', [
    { place: 'door', host: true, people: function (v) { return [P(v.a), P(v.h, { name: v.H }), P(v.b)]; },
      setup: "At {B}'s house, everyone takes off their shoes at the door. At {A}'s house, people keep shoes on.", q: "What should {A} do?",
      good: ["{A} takes {A_his} shoes off too.", "{A} asks, “Should I take my shoes off?” and does."],
      bad: ["{A} runs in with muddy shoes.", "{A} kicks {A_his} shoes across the room."],
      near: [["{A} says, “I don't have to. We don't do that at my house.”", "Each family's way is right for its home. Guests follow the host's way."]],
      why: "Every family has its own rules. At their house, we follow theirs." },
    { place: 'home', host: true, pick: { snack: ['crackers', 'an apple', 'popcorn', 'grapes'] }, people: function (v) { return [P(v.a), P(v.h, { name: v.H }), P(v.b)]; },
      say: [[1, "We eat snacks at the table."]],
      setup: "{A} has {snack}. {H} says, “We eat snacks at the table.”", q: "What should {A} do?",
      good: ["{A} takes the snack to the table.", "{A} says, “Okay!” and sits at the table."],
      bad: ["{A} jumps on the couch with the snack.", "{A} says, “You're not the boss of me.”"],
      near: [["{A} eats on the couch, because {A_he} can at home.", "At {B}'s house, {B}'s family's rules are the ones to follow."]],
      why: "Following the host family's rules is a way to thank them for having us." },
    { place: 'home', host: true, people: function (v) { return [P(v.a), P(v.b)]; },
      setup: "At {B}'s house, children ask before they turn on the TV. At {A}'s house, they don't have to ask.", q: "What should {A} do at {B}'s house?",
      good: ["{A} asks first, the way {B}'s family does.", "{A} asks {B}, “Do we need to ask before we turn on the TV?”"],
      bad: ["{A} grabs the remote and turns it up loud.", "{A} says, “Your rules are silly.”"],
      near: [["{A} turns it on, because that is how {A_his} family does it.", "Guests follow the host family's way."]],
      why: "Guests follow the host family's way, because it is their home." },
    { place: 'home', yn: false, people: function (v) { return [P(v.a), P(v.b)]; },
      pick: { rule: [{ _: 'shoes', a: 'takes shoes off at the door', b: 'keeps shoes on' }, { _: 'snacks', a: 'eats snacks only at the table', b: 'may eat snacks on the couch' }] },
      setup: "{A}'s family {rule_a}. {B}'s family {rule_b}.", q: "Which family is right?",
      good: ["Both are right. Each family's way is right for its own home."],
      bad: ["Only {A}'s family is right.", "Only {B}'s family is right."],
      why: "Families do things in different ways. Each way is right for its own home, and guests follow the host's way.", lv: 2 }
  ]);

  orderTopic('young.thank-host', [
    { host: true, setup: "The playdate at {B}'s house is over.",
      items: ["{A} finds {H}.", "{A} looks at {H_him} and says, “Thank you for having me!”", "{A} waves goodbye and goes out the door."],
      why: "The grown-up made the playdate happen. Finding them and saying thank you before you leave shows you noticed." }
  ], [
    { place: 'door', host: true, people: function (v) { return [P(v.a), P(v.b, { pose: 'wave' }), P(v.h, { name: v.H })]; },
      setup: "{A} had fun at {B}'s house. It is time to go.",
      good: ["{A} finds {H} and says, “Thank you for having me.”", "{A} says, “Thank you for having me!” to {H} and goodbye to {B}."],
      bad: ["{A} runs out the door.", "{A} says, “Your house is boring.”"],
      near: [["{A} thanks {B} but forgets {H}.", "{H} made the playdate happen too. Thank the grown-up as well."]],
      why: "Thanking the grown-up host is the polite end to a visit." },
    { place: 'party', host: true, people: function (v) { return [P(v.a, { holds: 'balloon' }), P(v.b), P(v.h, { name: v.H })]; },
      setup: "{B}'s birthday party is over.",
      good: ["{A} says, “Thank you for the party!” to {H}.", "{A} says, “Happy birthday, {B}! Thank you for having me,” before leaving."],
      bad: ["{A} grabs an extra balloon and runs.", "{A} leaves without a word."],
      near: [["{A} says goodbye to {B} only.", "A thank-you to the grown-ups who gave the party is polite too."]],
      why: "Grown-ups worked to make the party. Thank you for having me tells them it mattered." }
  ]);

  // ================================================================ Unit 7: Out and About
  topic('young.lines', [
    { place: 'park', people: function (v) { return [P(v.b), P(v.c), P(v.a)]; },
      setup: "There is a line for the slide. {A} just got there.",
      good: ["{A} goes to the end of the line.", "{A} stands at the back and waits {A_his} turn."],
      bad: ["{A} pushes to the front.", "{A} climbs up the slide from the bottom to go first."],
      near: [["{A} cuts in to stand with {B}.", "Cutting in to stand with a friend is still cutting."]],
      why: "In a line, everyone waits their turn, so it is fair." },
    { place: 'classroom', g: TEACHER, people: function (v) { return [P(v.b), P(v.a), P(v.c)]; },
      setup: "{A} is in line for lunch. {C} is not here yet.", q: "What should {A} do?",
      good: ["{A} waits in {A_his} place, hands to {A_self}.", "{A} lets {C} go to the end of the line when {C_he} comes."],
      bad: ["{A} pushes {B} to move up.", "{A} pokes the people around {A_him}."],
      near: [["{A} saves a spot for {C}, who is not here.", "Saving a spot for someone who is not there is cutting too."]],
      why: "Lines work because each person waits in order." },
    { place: 'store', g: FAMILY, people: function (v) { return [P('priya', { name: 'Shopper' }), P(v.a), P(v.g, { name: v.G })]; }, props: [{ kind: 'cart', x: 470, y: 222 }],
      setup: "{A} and {G} wait in line at the store.", q: "What should {A} do?",
      good: ["{A} waits next to {G}, with hands to {A_self}.", "{A} stands still and talks quietly with {G}."],
      bad: ["{A} pushes the cart into the shopper.", "{A} runs around the line."],
      near: [["{A} squeezes up close to the shopper in front.", "Give the person in front some room."]],
      why: "Waiting calmly in line is kind to the people around us." }
  ]);

  topic('young.store', [
    { place: 'store', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G })]; }, props: [{ kind: 'cart', x: 420, y: 222 }],
      setup: "{A} is at the store with {G}.", q: "What should {A} do?",
      good: ["{A} stays close to {G} and uses a quiet voice.", "{A} walks next to {G} and helps push the cart."],
      bad: ["{A} runs up and down the aisles.", "{A} hides behind the shelves."],
      near: [["{A} wanders off to look at toys.", "Staying close to your grown-up is the store rule."]],
      why: "The store is a busy place. Staying close and quiet helps everyone shop." },
    { place: 'store', g: FAMILY, pick: { thing: ['a toy car', 'a big balloon', 'a box of cookies', 'a coloring book'] }, people: function (v) { return [P(v.a), P(v.g, { name: v.G })]; },
      setup: "{A} sees {thing} {A_he} wants.", q: "What should {A} do?",
      good: ["{A} asks, “May I have it, please?” and takes no for an answer.", "{A} asks once, and when {G} says, “Not today,” says, “Okay.”"],
      bad: ["{A} cries and shouts, “I WANT IT!”", "{A} lies on the floor and kicks."],
      near: [["{A} opens the box to look inside.", "Touch only what you plan to buy. It belongs to the store."], ["{A} begs, “Please, please, please,” over and over.", "Asking once is polite. Begging is not."]],
      why: "Asking once, and taking no for an answer, is polite at the store." },
    { place: 'store', g: FAMILY, people: function (v) { return [P(v.a, { holds: 'bag' }), P(v.g, { name: v.G }), P('james', { name: 'Cashier' })]; },
      setup: "The cashier hands {A} the bag.", q: "What should {A} say?",
      good: ["{A} says, “Thank you!”", "{A} smiles and says, “Thanks! Have a nice day.”"],
      bad: ["{A} grabs the bag and runs.", "{A} says, “Took you long enough.”"],
      near: [["{A} says nothing, because the cashier is working.", "People at work help us too. A thank-you makes their day nicer."]],
      why: "The cashier helped us. Thank you shows we noticed." }
  ]);

  topic('young.library', [
    { place: 'library', people: function (v) { return [P(v.a, { holds: 'book' }), P('priya', { name: 'Librarian' })]; }, say: [[1, "Please put books on the cart."]],
      setup: "{A} is done with a book. The librarian asks everyone to put books on the cart.", q: "What should {A} do?",
      good: ["{A} puts the book on the cart.", "{A} carries the book to the cart and sets it down gently."],
      bad: ["{A} leaves the book on the floor.", "{A} throws the book onto a shelf."],
      near: [["{A} pushes the book into any empty spot on a shelf.", "The librarian asked for the cart, so the book goes back in the right place."]],
      why: "Following the librarian's way helps books get back to the right place for the next reader." },
    { place: 'library', people: function (v) { return [P(v.a), P(v.b, { holds: 'book' })]; },
      setup: "{A} wants to tell {B} about a book at the library.", q: "How should {A} talk?",
      good: ["{A} whispers.", "{A} uses a soft whisper voice."],
      bad: ["{A} shouts across the room.", "{A} sings loudly."],
      near: [["{A} talks in a normal voice, a little loud.", "Other people are reading. A whisper voice is the library voice."]],
      why: "Whispering lets everyone read and think." },
    { place: 'library', people: function (v) { return [P(v.a, { holds: 'book' })]; },
      setup: "{A} is reading a library book.", q: "How should {A} treat the book?",
      good: ["{A} turns the pages gently.", "{A} keeps the book clean and dry."],
      bad: ["{A} draws in the book with a crayon.", "{A} tears out a page {A_he} likes."],
      near: [["{A} folds down a page corner to mark the place.", "Library books are shared. A bookmark keeps the pages nice for the next reader."]],
      why: "Library books belong to everyone, so we handle them gently." }
  ]);

  topic('young.quiet-places', [
    { place: 'hall', g: FAMILY, people: function (v) { return [P(v.a, { pose: 'sit' }), P(v.g, { name: v.G, pose: 'sit' })]; },
      setup: "{A} is at a concert with {G}. The music is playing. {A} wants to say something.", q: "What should {A} do?",
      good: ["{A} waits until the music stops, then whispers.", "{A} saves it for the break."],
      bad: ["{A} talks in a loud voice.", "{A} stands on the seat to wave."],
      near: [["{A} whispers during the song.", "In most quiet places, even whispers wait for a break."]],
      why: "Everyone came to hear the music. Waiting for a break lets them enjoy it." },
    { place: 'doctor', g: FAMILY, people: function (v) { return [P(v.a, { pose: 'sit' }), P(v.g, { name: v.G, pose: 'sit' }), P('walt', { name: 'Patient', pose: 'sit' })]; },
      setup: "{A} is in a waiting room. Other people are waiting too.", q: "What should {A} do?",
      good: ["{A} reads a book quietly.", "{A} sits next to {G} and talks softly."],
      bad: ["{A} runs around the chairs.", "{A} plays loud music on a tablet."],
      near: [["{A} kicks the chair again and again.", "The bumps and noise bother people who are waiting."]],
      why: "People in a waiting room may be tired or not feeling well. A quiet room is kind to them." },
    { place: 'hall', host: true, people: function (v) { return [P(v.a, { pose: 'sit' }), P(v.b, { pose: 'sit' }), P(v.h, { name: v.H, pose: 'sit' })]; },
      setup: "{A} visits a place of worship with {B}'s family. Everyone is quiet.", q: "What should {A} do?",
      good: ["{A} sits quietly and follows what {B}'s family does.", "{A} watches {B}'s family and keeps still."],
      bad: ["{A} talks loudly and laughs.", "{A} runs up and down the aisle."],
      near: [["{A} asks lots of questions out loud during the quiet part.", "Questions can wait until after. Follow the place's customs."]],
      why: "Every quiet place has its own customs. A visitor follows them and stays quiet." },
    { place: 'theater', g: FAMILY, people: function (v) { return [P(v.a, { pose: 'sit' }), P(v.g, { name: v.G, pose: 'sit' })]; },
      setup: "{A} is watching a play with {G}.", q: "What should {A} do?",
      good: ["{A} sits still and watches.", "{A} claps at the end with everyone."],
      bad: ["{A} kicks the seat in front.", "{A} talks loudly to {G}."],
      near: [["{A} whispers a little all through the play.", "Even whispers can bother the people nearby. Save talking for the break."]],
      why: "Sitting still and quiet helps everyone enjoy the show." }
  ]);

  topic('young.doctor', [
    { place: 'doctor', g: DOCTOR, people: function (v) { return [P(v.a), P(v.g, { name: v.G }), P('rosa', { name: 'Mom' })]; },
      say: [[1, "How are you feeling today?"]],
      setup: "Dr. Bell asks {A}, “How are you feeling today?”", q: "What should {A} do?",
      good: ["{A} answers as well as {A_he} can.", "{A} tells Dr. Bell, and Mom helps with the hard parts."],
      bad: ["{A} says, “Go away!”", "{A} kicks at Dr. Bell."],
      near: [["{A} hides and won't say anything.", "It's fine to feel nervous. Mom is right there and can help {A} answer."]],
      why: "Answering helps the doctor help us. Our grown-up stays with us and can help." },
    { place: 'doctor', g: FAMILY, people: function (v) { return [P(v.a, { pose: 'sit' }), P(v.g, { name: v.G, pose: 'sit' })]; },
      setup: "{A} is waiting to see the doctor.", q: "What should {A} do?",
      good: ["{A} waits calmly with {G}.", "{A} looks at a book with {G} while they wait."],
      bad: ["{A} screams, “I'm bored!”", "{A} runs into the doctor's rooms."],
      near: [["{A} climbs on all the chairs.", "Waiting calmly is kind to the other people waiting."]],
      why: "Waiting calmly makes the visit easier for everyone." },
    { place: 'doctor', g: DOCTOR, people: function (v) { return [P(v.a, { pose: 'wave' }), P(v.g, { name: v.G })]; },
      setup: "The visit with Dr. Bell is over.", q: "What should {A} say?",
      good: ["{A} says, “Thank you, Dr. Bell!”", "{A} waves and says, “Thanks! Bye!”"],
      bad: ["{A} runs out without a word.", "{A} says, “I'm never coming back.”"],
      near: [["{A} thanks Mom but not Dr. Bell.", "Dr. Bell helped too. A thank-you is kind."]],
      why: "The doctor helped us. Thank you shows we noticed." }
  ]);

  topic('young.doors', [
    { place: 'door', g: FAMILY.concat(NEIGHBOR), people: function (v) { return [P(v.a), P(v.g, { name: v.G, holds: 'bag' })]; },
      setup: "{A} goes through a door. {G} is right behind, with full hands.", q: "What should {A} do?",
      good: ["{A} holds the door open for {G}.", "{A} looks back and keeps the door open until {G} is through."],
      bad: ["{A} lets the door slam on {G}.", "{A} pushes the door shut fast."],
      near: [["{A} goes through without looking back.", "A quick look back is the whole trick."]],
      why: "Holding a door is a small kindness that helps a lot, especially for someone with full hands." },
    { place: 'door', people: function (v) { return [P(v.a), P(v.b)]; },
      setup: "{A} and {B} come in from recess. {B} is close behind {A}.", q: "What should {A} do?",
      good: ["{A} holds the door until {B} has it.", "{A} looks back and holds the door for {B}."],
      bad: ["{A} lets go so the door hits {B}.", "{A} locks the door as a joke."],
      near: [["{A} lets go without looking.", "Looking behind you takes one second and keeps people safe."]],
      why: "Looking back and holding the door keeps the next person from getting bumped." },
    { place: 'door', g: TEACHER.concat(FAMILY), people: function (v) { return [P(v.a), P(v.g, { name: v.G, pose: 'wave' })]; },
      setup: "{G} holds the door open for {A}.", q: "What should {A} say?",
      good: ["{A} says, “Thank you!”", "{A} smiles and says, “Thanks, {G}.”"],
      bad: ["{A} says, “Hurry up!”", "{A} runs past and bumps {G}."],
      near: [["{A} walks through without a word.", "When someone holds the door, a thank-you is the polite answer."]],
      why: "A thank-you shows we noticed the kindness." }
  ]);

  orderTopic('young.coughs-sneezes', [
    { setup: "{A} feels a sneeze coming. There is no tissue nearby.",
      items: ["{A} turns away from people and food.", "{A} sneezes into {A_his} elbow.", "{A} washes {A_his} hands."],
      why: "Turning away and sneezing into the elbow keeps germs off people, food and hands. Washing after finishes the job." },
    { setup: "{A} has to cough.",
      items: ["{A} gets a tissue.", "{A} coughs into the tissue.", "{A} throws the tissue in the trash.", "{A} washes {A_his} hands."],
      why: "A tissue catches the cough, the trash takes the tissue, and washing cleans the hands." }
  ], [
    { place: 'classroom', people: function (v) { return [P(v.a, { pose: 'cover' }), P(v.b)]; },
      setup: "{A} has to sneeze. There is no tissue.",
      good: ["{A} turns away and sneezes into {A_his} elbow.", "{A} sneezes into the inside of {A_his} elbow."],
      bad: ["{A} sneezes right at {B}.", "{A} sneezes onto the snack table."],
      near: [["{A} sneezes into {A_his} open hand, then picks up the crayons.", "Germs from the hand go onto the crayons. The elbow is the better spot."]],
      why: "The elbow catches the sneeze, so hands stay cleaner for touching things others use." },
    { place: 'table', g: FAMILY, people: function (v) { return [P(v.a), P(v.g, { name: v.G }), P(v.b)]; },
      setup: "{A} needs to cough at the table.",
      good: ["{A} turns away from the food and coughs into {A_his} elbow.", "{A} turns away and coughs into a tissue."],
      bad: ["{A} coughs over the food.", "{A} coughs right at {B}."],
      near: [["{A} coughs into {A_his} hand and then passes the bread.", "Then the cough goes onto the bread. Use your elbow or a tissue."]],
      why: "Turning away from people and food keeps everyone's food clean." },
    { place: 'home', people: function (v) { return [P(v.a, { holds: 'tissue' }), P(v.b)]; },
      setup: "{A} just sneezed into a tissue.",
      good: ["{A} throws the tissue away and washes {A_his} hands.", "{A} puts the tissue in the trash, then cleans {A_his} hands."],
      bad: ["{A} hands the tissue to {B}.", "{A} drops the tissue on the floor."],
      near: [["{A} puts the used tissue in {A_his} pocket and keeps playing.", "A used tissue goes in the trash, and then we clean our hands."]],
      why: "Throwing the tissue away and washing hands keeps germs from spreading." }
  ]);

  // ================================================================ Unit 8: Helping and Thanking
  orderTopic('young.tidying-up', [
    { setup: "{A} and {B} are done building with blocks.",
      items: ["They pick up the blocks from the floor.", "They put the blocks in the bin.", "They put the bin back on the shelf."],
      title: "Tidying up", why: "Picking up, putting away, and putting the bin back means the blocks are ready for next time." },
    { setup: "{A} is done drawing.",
      items: ["{A} puts the caps back on the markers.", "{A} puts the markers in the box.", "{A} puts the box back on the shelf."],
      title: "After drawing", why: "Caps on first keeps markers from drying out; then everything goes back where it belongs." }
  ], [
    { place: 'home', pick: { toy: TOYS }, people: function (v) { return [P(v.a), P(v.b)]; }, props: [{ kind: 'blocks', x: 220, y: 226 }, { kind: 'toy', x: 380, y: 226 }],
      setup: "Playtime at {A}'s house is over. {B} helped make the mess.", q: "What should they do?",
      good: ["{A} and {B} tidy up together.", "{A} says, “Let's clean up together!”"],
      bad: ["{A} kicks the toys under the couch.", "{A} runs off and leaves everything."],
      near: [["{A} says, “{B} made the mess, so {B} cleans up.”", "Everyone who played helps tidy."], ["{A} leaves it all for the grown-ups.", "The grown-ups didn't play with the toys. The players tidy."]],
      why: "Everyone who played helps put things back where they belong." },
    { place: 'classroom', g: TEACHER, people: function (v) { return [P(v.a), P(v.b), P(v.g, { name: v.G })]; }, props: [{ kind: 'crayons', x: 300, y: 226 }],
      setup: "{G} says, “Clean-up time!”", q: "What should {A} do?",
      good: ["{A} puts the crayons back in the box.", "{A} helps {B} pick up the paper."],
      bad: ["{A} keeps drawing and ignores {G}.", "{A} throws the crayons on the floor."],
      near: [["{A} cleans up only {A_his} own spot and sits down while others work.", "Helping the group finish is part of tidying."]],
      why: "Tidying together is faster, and everything is ready for next time." }
  ]);

  topic('young.feelings', [
    { place: 'park', people: function (v) { return [P(v.a), P(v.b), P(v.c, { mood: 'sad' })]; },
      setup: "{C} is sitting alone and looks sad.", q: "What can {A} do?",
      good: ["{A} asks, “Are you okay?”", "{A} says, “Do you want to play with us?”"],
      bad: ["{A} laughs at {C}.", "{A} says, “Cry baby!”"],
      near: [["{A} walks by without looking.", "Noticing someone who looks sad, and being kind, is the heart of good manners."]],
      why: "Noticing how someone feels, and being kind, is what manners are for." },
    { place: 'park', g: FAMILY.concat(TEACHER), people: function (v) { return [P(v.a, { mood: 'worried' }), P(v.b, { mood: 'sad' }), P(v.g, { name: v.G })]; },
      setup: "{B} falls down and starts to cry.", q: "What can {A} do?",
      good: ["{A} asks, “Are you okay?” and gets {G}.", "{A} stays with {B} and calls {G} over."],
      bad: ["{A} laughs and points.", "{A} says, “That was funny! Do it again!”"],
      near: [["{A} keeps playing as if nothing happened.", "When a friend is hurt, asking and getting a grown-up shows care."]],
      why: "Checking on a friend and getting a grown-up shows we care." },
    { place: 'park', people: function (v) { return [P(v.a), P(v.b), P(v.c, { mood: 'sad' })]; },
      setup: "{A} and {B} are picking teams. {C} has not been picked.", q: "What can {A} do?",
      good: ["{A} says, “{C}, come be on our team!”", "{A} picks {C} next."],
      bad: ["{A} says, “Nobody wants {C}.”", "{A} giggles with {B} about {C}."],
      near: [["{A} picks only the fastest kids, every time.", "Being left out feels bad. Noticing it and inviting someone is kind."]],
      why: "Being left out hurts. Inviting someone in is a kind thing to do." }
  ]);

  topic('young.opening-gifts', [
    { place: 'party', g: FAMILY, pick: { gift: GIFTS }, people: function (v) { return [P(v.a, { holds: v.gift_prop }), P(v.g, { name: v.G })]; },
      setup: "{A} opens a gift from {G}: {gift}!", q: "What should {A} do?",
      good: ["{A} looks at {G} and says, “Thank you! I love it.”", "{A} says, “Thank you, {G}! I can't wait to use it.”"],
      bad: ["{A} tosses it aside and grabs the next gift.", "{A} says, “Is that all?”"],
      near: [["{A} says, “I already have this.”", "The giver chose it for {A}. Thank them for thinking of you."]],
      why: "{G} chose the gift for {A}. Thank you, and something kind, tells {G} that {A} is glad." },
    { place: 'party', pick: { gift: ['socks', 'a puzzle', 'a sweater', 'a book about bugs'] }, people: function (v) { return [P(v.a), P(v.b)]; },
      setup: "{B} gives {A} {gift}. It is not what {A} hoped for.", q: "What can {A} say?",
      good: ["{A} says, “Thank you for thinking of me!”", "{A} says, “Thank you, {B}!” and smiles."],
      bad: ["{A} says, “I hate {gift}.”", "{A} says, “Can you take it back?”"],
      near: [["{A} says, “Oh,” and frowns.", "{B} picked it out for {A}. A thank-you for the thought is kind and true."]],
      why: "Even when a gift is not what we hoped for, we can thank the giver for thinking of us." },
    { place: 'party', pick: { gift: GIFTS }, people: function (v) { return [P(v.a), P(v.b), P(v.c)]; }, props: [{ kind: 'gift', x: 250, y: 224 }, { kind: 'gift', x: 350, y: 224 }],
      setup: "{A} has two gifts to open, from {B} and {C}.", q: "What should {A} do?",
      good: ["{A} opens one, says thank you, then opens the next.", "{A} thanks {B} before opening {C}'s gift."],
      bad: ["{A} rips them open fast and throws the paper at {B}.", "{A} says, “Mine is better than yours.”"],
      near: [["{A} opens both fast and says one thank-you to no one.", "Each giver gets a thank-you, looking at them."]],
      why: "Each giver chose a gift. Each one gets a look and a thank-you." }
  ]);

  // a thank-you picture: the parts are the picture, the thank-you words and the child's name (MathLadder.etiquette.NOTES.picture)
  G('young.thank-you-picture', function (R, ctx) {
    var L = ctx.level || 1, v = vars(R, {}), g = R.pick(FAMILY); setGrown(v, 'G', g);
    var gift = R.pick([{ w: 'kite', prop: 'kite' }, { w: 'book', prop: 'book' }, { w: 'ball', prop: 'ball' }, { w: 'flowers', prop: 'flowers' }, { w: 'toy truck', prop: 'toy' }]);
    var mode = L === 1 ? R.pick(['missing', 'pick']) : L === 2 ? R.pick(['missing', 'pick', 'short']) : R.pick(['all', 'missing', 'short']);
    var thanks = 'Thank you for the ' + gift.w + '!', sign = 'Love, ' + v.A;
    if (mode === 'missing') {
      var omit = R.pick(['signature', 'thanks', 'none']), lines = [{ part: 'picture', text: '' }];
      if (omit !== 'thanks') lines.push({ part: 'thanks', text: thanks });
      if (omit !== 'signature') lines.push({ part: 'signature', text: sign });
      var ch = ['Nothing. It has everything.', 'The thank-you words', v.A_His + ' name at the end'], ans = { none: 0, thanks: 1, signature: 2 }[omit];
      return { q: READ + big(v.A + ' made a thank-you picture for ' + v.G + '. Is anything missing?'),
        a: { t: 'mc', choices: ch, v: ans, keep: true },
        viz: { name: 'et-note', opts: { kind: 'picture', draw: gift.prop, lines: lines, big: true, quiet: true, interactive: false, label: 'A child\'s thank-you picture.' } },
        steps: [omit === 'none' ? 'Nothing is missing: a picture, the thank-you words, and ' + v.A_his + ' name.' : omit === 'thanks' ? 'The thank-you words are missing. ' + v.A + ' can add “' + thanks + '”' : v.A_His + ' name is missing. ' + v.A + ' can sign “' + sign + '” at the end.',
          'A thank-you picture has a picture, a few thank-you words, and your name.'],
        hint: 'Look for a picture, the words “thank you,” and a name.' };
    }
    if (mode === 'pick') { // which line goes at the very end
      var c2 = R.shuffle([sign, thanks, 'Dear ' + v.G + ',']);
      return { q: READ + big(v.A + ' is making a thank-you note for ' + v.G + '. What goes at the very end?'),
        a: { t: 'mc', choices: c2, v: c2.indexOf(sign) },
        viz: { name: 'et-note', opts: { kind: 'picture', draw: gift.prop, lines: [{ part: 'picture', text: '' }, { part: 'thanks', text: thanks }], big: true, quiet: true, interactive: false, label: 'A thank-you picture with no name yet.' } },
        steps: ['At the end, ' + v.A + ' signs ' + v.A_his + ' name: “' + sign + '”', 'Signing your name tells ' + v.G + ' who the thank-you is from.'],
        hint: 'How will ' + v.G + ' know who made it?' };
    }
    var GOODN = ['“Thank you for the ' + gift.w + '. I love it! ' + sign + '”', '“Thank you for the ' + gift.w + '! I played with it all day. ' + sign + '”', '“Thanks for the ' + gift.w + '! ' + sign + '”'];
    var BADN = ['“I wanted a bigger one. ' + v.A + '”', '“Next time, get me something better. ' + v.A + '”', '“I already have one of these. ' + v.A + '”'];
    if (mode === 'short') {
      var gd = R.pick(GOODN), bd = R.sample(BADN, L === 1 ? 1 : 2), c3 = R.shuffle([gd].concat(bd));
      return { q: READ + big(v.G + ' gave ' + v.A + ' a ' + gift.w + '. Which thank-you note is kind?'),
        a: { t: 'mc', choices: c3, v: c3.indexOf(gd) },
        steps: ['The kind note: ' + gd, 'A short note is perfect. It says thank you, says something kind, and has ' + v.A_his + ' name.'],
        hint: 'Which one would make ' + v.G + ' smile?' };
    }
    var gs = R.sample(GOODN, 2), bs = R.sample(BADN, 2), list = R.shuffle(gs.map(function (x) { return [x, true]; }).concat(bs.map(function (x) { return [x, false]; })));
    return { q: READ + big(v.G + ' gave ' + v.A + ' a ' + gift.w + '. Which thank-you notes are kind? Choose all that are kind.'),
      a: { t: 'mc', choices: list.map(function (x) { return x[0]; }), v: list.map(function (x, i) { return x[1] ? i : -1; }).filter(function (i) { return i >= 0; }) },
      steps: ['Kind: ' + gs[0], 'Kind: ' + gs[1], 'Not kind: ' + bs.join(' '), 'A thank-you note does not need to be long. It thanks the giver and says something kind.'],
      hint: 'Which ones would make ' + v.G + ' smile?' };
  });
})(window.MathLadder);

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
  var CFG = {"prefix":"young.","only":["grown-up-names"]};
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
